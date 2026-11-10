import { test } from "node:test";
import assert from "node:assert/strict";
import { parseArticleMarkdown, matchImage } from "../src/lib/article-import";

test("imports editorial text and explicit image positions, excluding publishing notes", () => {
  const p = parseArticleMarkdown(
    "# A supplied article\n\nIntroduction.\n\n### 1. Door wreath\n\nHang it here.\n\n*Image: 01-wreath.jpg · Alt: Evergreen wreath*\n\n## Publishing Package\n\n- **SEO title (58 characters):** Search title\n- **Meta description:** Search description\n- **Slug:** /article-slug/\n\n### Pinterest pin options\n\nPrivate notes",
  );
  assert.equal(p.images.length, 1);
  assert.equal(p.images[0].alt, "Evergreen wreath");
  assert.equal(p.slug, "article-slug");
  assert.equal(p.seo_title, "Search title");
  assert.equal(p.seo_description, "Search description");
  assert.ok(!JSON.stringify(p.body).includes("Private notes"));
  assert.ok(!JSON.stringify(p.body).includes("Publishing Package"));
  assert.equal(p.body[p.images[0].blockIndex].type, "image");
});
test("adds one position per numbered idea without stealing a later section image", () => {
  const p = parseArticleMarkdown(
    "# Title\n\n## 1. First idea\n\nSome text.\n\n## 2. Second idea\n\nText.\n\n![Actual image](second.png)\n\n## Safety\n\nAdvice.",
  );
  assert.equal(p.images.length, 2);
  assert.equal(p.images[0].filename, "first-idea.jpg");
  assert.equal(p.images[1].filename, "second.png");
  assert.equal(p.images[1].alt, "Actual image");
});
test("matches only unique exact filenames ignoring extension and punctuation", () => {
  assert.equal(
    matchImage("01-front-door.jpg", [{ name: "01 Front Door.png" }]),
    "01 Front Door.png",
  );
  assert.equal(matchImage("01-door.jpg", [{ name: "different.png" }]), "");
  assert.equal(
    matchImage("door.jpg", [{ name: "door.png" }, { name: "door.webp" }]),
    "",
  );
});
test("rejects missing titles and oversized imports", () => {
  assert.throws(() => parseArticleMarkdown("Text without a title"));
  assert.throws(() =>
    parseArticleMarkdown("# Title\n" + "a".repeat(2_000_000)),
  );
});

test("numbered images map by idea position only when unambiguous", () => {
  assert.equal(
    matchImage("wreath.jpg", [{ name: "01 Front Door.png" }], 1),
    "01 Front Door.png",
  );
  assert.equal(
    matchImage("wreath.jpg", [{ name: "cy12-01-wreath.png" }], 1),
    "cy12-01-wreath.png",
  );
  assert.equal(
    matchImage("wreath.jpg", [{ name: "01-a.png" }, { name: "01-b.png" }], 1),
    "",
  );
  assert.equal(matchImage("wreath.jpg", [{ name: "12-door.png" }], 1), "");
});
