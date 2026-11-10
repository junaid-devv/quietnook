import test from "node:test";
import assert from "node:assert/strict";
import { publicOrigin, pageMetadata, jsonLd } from "../src/lib/seo";

test("SEO excludes unfinished and staging pages, and preserves distinct pagination canonicals", () => {
  const oldOrigin = process.env.SITE_URL, oldStaging = process.env.STAGING;
  try {
    for (const value of ["http://quietnook.com", "https://quietnook.com/path", "https://user:password@quietnook.com", "https://quietnook.com/?q=1", "invalid"])
      assert.equal(publicOrigin(value), undefined);
    assert.equal(publicOrigin("https://quietnook.com/"), "https://quietnook.com");
    process.env.SITE_URL = "https://quietnook.com";
    process.env.STAGING = "true";
    const input = { title: "Bedroom Decorating Ideas", description: "Room description", path: "/rooms/bedroom/", indexable: true, page: 2 };
    assert.equal((pageMetadata(input).robots as {index:boolean}).index, false);
    process.env.STAGING = "false";
    const meta = pageMetadata(input);
    assert.equal((meta.robots as {index:boolean}).index, true);
    assert.equal(meta.alternates?.canonical, "https://quietnook.com/rooms/bedroom/?page=2");
    assert.equal((meta.openGraph as {description:string}).description, input.description);
    assert.equal((meta.twitter as {description:string}).description, input.description);
    assert.equal((pageMetadata({...input, indexable:false}).robots as {index:boolean}).index, false);
    assert.equal(pageMetadata({...input, canonical:false}).alternates?.canonical, undefined);
    delete process.env.SITE_URL;
    assert.equal((pageMetadata(input).robots as {index:boolean}).index, false);
    assert.equal(pageMetadata(input).alternates?.canonical, undefined);
    assert.ok(!jsonLd({ text: "</script><script>alert(1)</script>" }).includes("<"));
  } finally {
    if (oldOrigin === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = oldOrigin;
    if (oldStaging === undefined) delete process.env.STAGING; else process.env.STAGING = oldStaging;
  }
});
