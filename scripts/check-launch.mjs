import { createClient } from "@supabase/supabase-js";
const problems = [];
for (const field of [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SITE_URL",
  "CRON_SECRET",
])
  if (!process.env[field]) problems.push(`${field} is required`);
if (process.env.STAGING !== "false")
  problems.push("STAGING must be false only on the intended production host");
if ((process.env.CRON_SECRET || "").length < 32)
  problems.push("CRON_SECRET must contain at least 32 random characters");
try {
  const u = new URL(process.env.SITE_URL);
  if (
    u.protocol !== "https:" ||
    u.pathname !== "/" ||
    u.search ||
    u.hash ||
    u.username ||
    u.password
  )
    problems.push("SITE_URL must be a verified HTTPS origin");
} catch {
  problems.push("SITE_URL is invalid");
}
if (!problems.length) {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
  const [{ data: s, error }, { count: members, error: memberError }] =
    await Promise.all([
      db.from("site_settings").select("value").eq("id", "public").single(),
      db
        .from("editor_members")
        .select("user_id", { head: true, count: "exact" }),
    ]);
  if (error || memberError)
    problems.push("Database schema and settings could not be verified");
  else {
    if (!members)
      problems.push("Invite and allowlist at least one real editor");
    for (const field of [
      "operator_name",
      "about_text",
      "privacy_text",
      "terms_text",
    ])
      if (!s?.value?.[field])
        problems.push(`Publisher setting ${field} is missing`);
  }
}
if (problems.length) {
  console.error(
    "Launch is not ready:\n" + problems.map((p) => "- " + p).join("\n"),
  );
  process.exit(1);
}
console.log(
  "Automated configuration checks passed. Verify domain ownership, production access, real delivery, cron execution, and backups before approving deployment.",
);
