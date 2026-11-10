import assert from "node:assert/strict";
import {writeFile} from "node:fs/promises";
const base=process.env.TEST_ORIGIN||"http://127.0.0.1:3004";
const canonical="https://quietnook.com";
const production=process.env.EXPECT_INDEXING==="true";
const routes=["/","/decor-ideas/","/small-spaces/","/organization/","/diy-projects/","/rooms/","/seasons/","/about/","/contact/","/privacy/","/terms/","/affiliate-disclosure/","/search/?q=storage"];
for(const slug of ["living-room","bedroom","kitchen","bathroom","balcony"])routes.push(`/rooms/${slug}/`);
for(const slug of ["christmas","halloween","fall","new-years-eve","valentines-day","spring","summer","winter","thanksgiving","easter","fourth-of-july"])routes.push(`/seasons/${slug}/`);
const attr=(tag,key)=>tag.match(new RegExp(`\\b${key}="([^"]*)"`))?.[1];
const rows=[];const titles=new Set();
for(const route of routes){
  const response=await fetch(base+route);assert.equal(response.status,200,route);
  const html=await response.text();
  const footer=html.match(/<footer\b[^>]*>(.*?)<\/footer>/s)?.[1] || "";
  for(const path of ["/about/","/contact/","/privacy/","/terms/","/affiliate-disclosure/"])assert.ok(footer.includes(`href="${path}"`),`Footer link ${path}: ${route}`);
  const tags=[...html.matchAll(/<meta\b[^>]*>/g)].map(m=>m[0]);
  const meta=(key)=>tags.find(t=>attr(t,"name")===key||attr(t,"property")===key);
  const content=(key)=>attr(meta(key)||"","content");
  const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert.ok(title&&!titles.has(title),`Distinct title: ${route}`); titles.add(title);
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`One H1: ${route}`);
  assert.ok(content("description"),`Description: ${route}`);
  assert.ok(content("og:title")&&content("og:description")&&content("twitter:title"),`Sharing metadata: ${route}`);
  const canonicalTag=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>m[0]).find(t=>attr(t,"rel")==="canonical");
  if(!route.startsWith("/search/"))assert.equal(attr(canonicalTag||"","href"),canonical+route,`Canonical: ${route}`);
  else assert.equal(canonicalTag,undefined,"Search must not inherit a homepage canonical");
  const expectedIndex=production&&["/","/contact/"].includes(route);
  assert.equal(!content("robots")?.includes("noindex"),expectedIndex,`Indexing: ${route}`);
  for(const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))JSON.parse(m[1]);
  rows.push({route,title,description:content("description"),robots:content("robots"),canonical:attr(canonicalTag||"","href")||null});
}
for(const route of ["/articles/nonexistent/","/rooms/nonexistent/","/authors/nonexistent/"]){
  const r=await fetch(base+route);assert.equal(r.status,404,route);
}
const sitemap=await(await fetch(base+"/sitemap.xml")).text();
if(production){assert.ok(sitemap.includes(canonical+"/"));assert.ok(sitemap.includes(canonical+"/contact/"));}
assert.ok(!sitemap.includes("/articles/")&&!sitemap.includes("/rooms/"),"No empty article/category URLs in sitemap");
const robots=await(await fetch(base+"/robots.txt")).text();
assert.equal(robots.includes("Sitemap:"),production);
await writeFile(`docs/seo-${production?"production-mode":"staging"}-verification.json`,JSON.stringify({date:new Date().toISOString(),environment:`Connected production build served on loopback ${base}; not a public deployment`,rows,checks:[`${routes.length} public pages: distinct title, description, H1, canonical and sharing metadata`,"Staging/production indexing differences","Empty categories/search excluded from indexing","404s for absent content; policy pages available","Sitemap and robots match the intended state"],limitations:["No article/author fixtures created, so rendered real article metadata remains covered by template/code tests rather than a public example.","Search Console ownership and actual production crawling are not verified."]},null,2));
console.log(`PASS rendered SEO for ${rows.length} public routes, missing-content statuses, sitemap and robots.`);
