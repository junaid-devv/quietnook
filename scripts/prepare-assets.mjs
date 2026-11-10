import sharp from "sharp";
import { mkdir, copyFile, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
await Promise.all(
  ["public/images", "public/brand", "public/fonts", "docs"].map((d) =>
    mkdir(d, { recursive: true }),
  ),
);
const sheet = process.argv[2];
const hero = process.argv[3];
if (sheet) {
  const metadata = await sharp(sheet).metadata();
  const width = Math.floor(metadata.width / 4),
    height = Math.floor(metadata.height / 2);
  const names = [
    "hero",
    "christmas",
    "halloween",
    "fall",
    "new-years-eve",
    "valentines-day",
    "spring",
    "summer",
  ];
  for (const [i, name] of names.entries()) {
    const buffer = await sharp(sheet)
      .extract({
        left: (i % 4) * width,
        top: Math.floor(i / 4) * height,
        width,
        height,
      })
      .toBuffer();
    await sharp(buffer)
      .resize(name === "hero" ? 1200 : 600, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(`public/images/${name}.webp`);
    await sharp(buffer)
      .resize(name === "hero" ? 1200 : 600, null, { withoutEnlargement: true })
      .avif({ quality: 60 })
      .toFile(`public/images/${name}.avif`);
  }
}
if (hero) {
  await sharp(hero)
    .resize(1500, null, { withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile("public/images/hero.webp");
  await sharp(hero)
    .resize(1500, null, { withoutEnlargement: true })
    .avif({ quality: 60 })
    .toFile("public/images/hero.avif");
}
await copyFile(
  "node_modules/@fontsource/lora/files/lora-latin-400-normal.woff2",
  "public/fonts/editorial.woff2",
);
await copyFile(
  "node_modules/@fontsource/lora/files/lora-latin-700-normal.woff2",
  "public/fonts/editorial-bold.woff2",
);
await copyFile(
  "node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2",
  "public/fonts/body.woff2",
);
await copyFile(
  "node_modules/@fontsource/lora/LICENSE",
  "public/fonts/Lora-LICENSE.txt",
);
await copyFile(
  "node_modules/@fontsource/dm-sans/LICENSE",
  "public/fonts/DM-Sans-LICENSE.txt",
);
const mark = (mono = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M4 29 26 9l22 20M10 26v29h18V38h13v17h8V28" fill="none" stroke="${mono ? "#153528" : "#A6381B"}" stroke-width="2.4" stroke-linejoin="round"/><path d="M33 22c1-12 8-17 19-16-1 11-7 17-19 16ZM34 22 48 10M38 16c-10 1-12-5-11-11 8 0 12 4 11 11Z" fill="none" stroke="#153528" stroke-width="2" stroke-linejoin="round"/></svg>`;
const wordmark = (mono = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="530" height="100" viewBox="0 0 530 100"><g transform="translate(0 10)">${mark(mono).replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">', '<svg width="80" height="80" viewBox="0 0 64 64">')}</g><text x="78" y="65" fill="#153528" font-family="Georgia,serif" font-size="54">quietnook</text><path d="M260 79c70-12 125 15 235-3" fill="none" stroke="${mono ? "#153528" : "#A6381B"}" stroke-width="2.3"/></svg>`;
for (const [name, svg] of [
  ["icon", mark()],
  ["icon-mono", mark(true)],
  ["wordmark", wordmark()],
  ["wordmark-mono", wordmark(true)],
]) {
  await writeFile(`public/brand/${name}.svg`, svg);
  await sharp(Buffer.from(svg))
    .resize(name.startsWith("wordmark") ? 1060 : 512)
    .png()
    .toFile(`public/brand/${name}.png`);
}
for (const size of [32, 180, 192, 512]) {
  await sharp(Buffer.from(mark()))
    .resize(size, size)
    .png()
    .toFile(
      `public/brand/${size === 180 ? "apple-touch-icon" : `icon-${size}`}.png`,
    );
}
const favicon = await sharp(Buffer.from(mark()))
  .resize(32, 32)
  .png()
  .toBuffer();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(1, 4);
ico[6] = 32;
ico[7] = 32;
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(favicon.length, 14);
ico.writeUInt32LE(22, 18);
await writeFile("public/favicon.ico", Buffer.concat([ico, favicon]));
const share = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#fff9f4"/><path d="M0 500Q600 350 1200 480V630H0" fill="#f7e4da"/><g transform="translate(335 100)">${wordmark()}</g><text x="600" y="345" text-anchor="middle" font-family="Georgia,serif" font-size="66" fill="#153528">A home that feels like you.</text><text x="600" y="415" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" fill="#a6381b">A little inspiration. Every season.</text></svg>`;
await sharp(Buffer.from(share)).png().toFile("public/brand/sharing.png");
const entries = [];
for (const name of [
  "hero",
  "christmas",
  "halloween",
  "fall",
  "new-years-eve",
  "valentines-day",
  "spring",
  "summer",
]) {
  try {
    const m = await sharp(`public/images/${name}.webp`).metadata();
    entries.push({
      file: `/images/${name}.webp`,
      width: m.width,
      height: m.height,
      bytes: (await readFile(`public/images/${name}.webp`)).length,
      provenance:
        "Newly generated with OpenAI ImageGen for this build on 2026-11-08",
      license: "Generated asset; no third-party stock source claimed",
      focal_point: "50% 50%",
      alt:
        name === "hero"
          ? "A cream sofa with rust cushions and plants in a sunlit living room."
          : "Decorative category image; adjacent link supplies its accessible name.",
    });
  } catch {}
}
await writeFile("docs/asset-manifest.json", JSON.stringify(entries, null, 2));
