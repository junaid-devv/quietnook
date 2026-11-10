import { test } from "node:test";
import assert from "node:assert/strict";
import {
  eligible,
  articleSchema,
  blockSchema,
  safeUrl,
} from "../src/lib/content";
test("eligibility respects exact publication time and status", () => {
  const at = "2026-11-08T12:00:00.000Z",
    time = Date.parse(at);
  assert.equal(eligible({ status: "draft", publish_at: at }, time), false);
  assert.equal(eligible({ status: "scheduled", publish_at: at }, time), false);
  assert.equal(
    eligible({ status: "published", publish_at: at }, time - 1),
    false,
  );
  assert.equal(eligible({ status: "published", publish_at: at }, time), true);
  assert.equal(
    eligible({ status: "published", publish_at: null }, time),
    false,
  );
});
test("unsafe links, embeds, and unready publication are rejected", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,hello",
    "//evil.test",
    "https://user:pass@example.com",
  ])
    assert.equal(safeUrl(url), false);
  assert.equal(
    blockSchema.safeParse({
      type: "link",
      text: "click",
      url: "javascript:alert(1)",
    }).success,
    false,
  );
  assert.equal(
    blockSchema.safeParse({
      type: "embed",
      provider: "youtube",
      id: "x?autoplay=1",
      caption: "",
    }).success,
    false,
  );
  assert.equal(
    articleSchema.safeParse({
      title: "Fixture",
      slug: "fixture",
      excerpt: "",
      body: [],
      status: "published",
      author_id: null,
      cover_media_id: null,
      publish_at: null,
      seo_title: "",
      seo_description: "",
      category_ids: [],
    }).success,
    false,
  );
});
