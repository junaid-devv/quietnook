import assert from "node:assert/strict";
const base = process.env.TEST_ORIGIN || "http://127.0.0.1:3000";
for (const [route, status] of [
  ["/", 200],
  ["/decor-ideas/", 200],
  ["/small-spaces/", 200],
  ["/organization/", 200],
  ["/diy-projects/", 200],
  ["/rooms/", 200],
  ["/rooms/bedroom/", 200],
  ["/seasons/", 200],
  ["/seasons/christmas/", 200],
  ["/about/", 200],
  ["/contact/", 200],
  ["/search/?q=storage", 200],
  ["/search/?q=a&q=b", 200],
  ["/articles/nonexistent/", 404],
  ["/rooms/unknown/", 404],
  ["/unknown/", 404],
  ["/privacy/", 404],
  ["/admin/", 307],
  ["/preview/11111111-1111-4111-8111-111111111111/", 307],
  ["/api/admin/export/", 401],
  ["/api/cron/publish/", 401],
]) {
  const r = await fetch(base + route, { redirect: "manual" });
  assert.equal(r.status, status, route);
  if (status === 200) {
    const html = await r.text();
    assert.equal(
      (html.match(/<h1(?:\s|>)/g) || []).length,
      1,
      `one H1: ${route}`,
    );
    if (
      route.includes("search") ||
      route.includes("bedroom") ||
      route.includes("christmas")
    )
      assert.match(html, /noindex/, `noindex: ${route}`);
  }
  console.log(`PASS ${status} ${route}`);
}
const bad = await fetch(base + "/api/admin/article/", {
  method: "POST",
  headers: {
    origin: "https://invalid.example",
    "Content-Type": "application/json",
  },
  body: "{}",
});
assert.equal(bad.status, 403);
for (const route of ["/api/contact/", "/api/newsletter/"]) {
  const response = await fetch(base + route, {
    method: "POST",
    headers: { origin: base, "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(
    response.status,
    503,
    `${route} must not claim delivery without configuration`,
  );
}
console.log("PASS same-origin protection and unconfigured delivery guards");
