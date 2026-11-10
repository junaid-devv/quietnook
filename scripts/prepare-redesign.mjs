import sharp from "sharp";
import { readFile, writeFile, copyFile } from "node:fs/promises";
// Rebuild independent image/font assets without changing application styles.
await Promise.all([
  copyFile(
    "node_modules/@fontsource/lora/files/lora-latin-400-italic.woff2",
    "public/fonts/editorial-italic.woff2",
  ),
  copyFile(
    "node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff2",
    "public/fonts/body-semibold.woff2",
  ),
]);
if (process.argv[2]) {
  for (const [name, width, format, quality] of [
    ["hero-nook.webp", 1800, "webp", 82],
    ["hero-nook.avif", 1800, "avif", 55],
  ]) {
    await sharp(process.argv[2])
      .resize(width, null, { withoutEnlargement: true })
      [format]({ quality })
      .toFile(`public/images/${name}`);
  }
  const manifest = JSON.parse(
    await readFile("docs/asset-manifest.json", "utf8"),
  );
  for (const file of ["hero-nook.webp", "hero-nook.avif"]) {
    const meta = await sharp(`public/images/${file}`).metadata();
    const entry = {
      file: `/images/${file}`,
      width: meta.width,
      height: meta.height,
      bytes: (await readFile(`public/images/${file}`)).length,
      provenance:
        "Generated with OpenAI ImageGen on 2026-11-09 as independent photography based on the approved concept; no text or UI in asset.",
      license: "Generated asset; no third-party stock source claimed",
      focal_point: "50% 50%",
      alt: "A linen armchair with a knitted throw beside an oak table, a ceramic mug, and an olive-green vase.",
    };
    const existing = manifest.findIndex((item) => item.file === entry.file);
    if (existing === -1) manifest.push(entry);
    else manifest[existing] = entry;
  }
  await writeFile(
    "docs/asset-manifest.json",
    JSON.stringify(manifest, null, 2) + "\n",
  );
}
