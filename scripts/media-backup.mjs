import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const [mode, folder] = process.argv.slice(2);
if (!["backup", "restore"].includes(mode) || !folder)
  throw Error(
    "Usage: node --env-file=.env.local scripts/media-backup.mjs backup|restore <backup-directory>",
  );
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
)
  throw Error("Server-side Supabase configuration is required");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
const directory = path.resolve(folder);
const hash = (b) => createHash("sha256").update(b).digest("hex");
await mkdir(directory, { recursive: true });
if (mode === "backup") {
  const manifest = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await db
      .from("media")
      .select("*")
      .order("id")
      .range(start, start + 999);
    if (error) throw Error("Media metadata export failed");
    for (const m of data) {
      const { data: file, error: downloadError } = await db.storage
        .from("editorial")
        .download(m.storage_key);
      if (downloadError)
        throw Error(`Media download failed for record ${m.id}`);
      const bytes = Buffer.from(await file.arrayBuffer());
      const filename = `${m.id}.webp`;
      await writeFile(path.join(directory, filename), bytes);
      manifest.push({ ...m, backup_file: filename, sha256: hash(bytes) });
    }
    if (data.length < 1000) break;
  }
  await writeFile(
    path.join(directory, "manifest.json"),
    JSON.stringify(
      {
        created_at: new Date().toISOString(),
        bucket: "editorial",
        media: manifest,
      },
      null,
      2,
    ),
  );
  console.log(
    `Backed up ${manifest.length} media objects. Database and Auth backup is a separate operation.`,
  );
} else {
  const manifest = JSON.parse(
    await readFile(path.join(directory, "manifest.json"), "utf8"),
  );
  if (manifest.bucket !== "editorial" || !Array.isArray(manifest.media))
    throw Error("Invalid manifest");
  for (const m of manifest.media) {
    if (
      !/^[a-f0-9-]{36}\.webp$/.test(m.backup_file) ||
      !/^[-a-z0-9]+\/[a-f0-9-]{36}\.webp$/.test(m.storage_key)
    )
      throw Error("Invalid backup path");
    const bytes = await readFile(path.join(directory, m.backup_file));
    if (hash(bytes) !== m.sha256) throw Error("Backup checksum mismatch");
    const { error } = await db.storage
      .from("editorial")
      .upload(m.storage_key, bytes, { contentType: m.mime, upsert: false });
    if (error) {
      const { data: existing, error: existingError } = await db.storage
        .from("editorial")
        .download(m.storage_key);
      if (
        existingError ||
        hash(Buffer.from(await existing.arrayBuffer())) !== m.sha256
      )
        throw Error(`Restore failed or conflicting object: ${m.id}`);
    }
  }
  console.log(
    `Restored/verified ${manifest.media.length} objects without overwriting conflicting files. Restore database metadata separately and verify RLS.`,
  );
}
