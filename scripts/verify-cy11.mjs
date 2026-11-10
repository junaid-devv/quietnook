import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const report=JSON.parse(await readFile('output/cy11/publication-result.json','utf8'));
let base='';
for(const port of [3003,3000,3001,3002]){try{const r=await fetch(`http://127.0.0.1:${port}${report.route}`,{signal:AbortSignal.timeout(15000)});if(r.ok&&(await r.text()).includes(report.title)){base=`http://127.0.0.1:${port}`;break;}}catch{}}
assert.ok(base,'No running local website found');
const response=await fetch(base+report.route);assert.equal(response.status,200);const html=await response.text();
assert.ok(html.includes(report.title));assert.ok(html.includes('Set a festive table with 17 Christmas table decor ideas'));
assert.ok(html.includes('https://quietnook.com'+report.route));
assert.ok(html.includes('BlogPosting'));assert.ok(html.includes('Ali Hamza'));
assert.ok(!html.includes('Ubersuggest'));assert.ok(!html.includes('Publishing Package'));
const payload=JSON.parse(await readFile('output/cy11/article-prepared.json','utf8'));
assert.equal(payload.body.filter(b=>b.type==='heading'&&/^\d+\./.test(b.text)).length,17);
const manifest=JSON.parse(await readFile('output/cy11/media-manifest.json','utf8'));
for(const m of manifest){assert.ok(html.includes(m.id));const r=await fetch(`${base}/api/media/${m.id}/`);assert.equal(r.status,200,`Image ${m.original}`);assert.ok(r.headers.get('content-type')?.startsWith('image/'));await r.arrayBuffer();}
for(const route of ['/seasons/christmas/','/decor-ideas/','/small-spaces/']){const r=await fetch(base+route);assert.equal(r.status,200);assert.ok((await r.text()).includes(report.title));}
const results={localUrl:base+report.route,checks:['Article renders with supplied title, SEO description, canonical, author and structured data','17 numbered sections and 18 image endpoints verified','Article present in all three assigned category listings','Publishing package excluded from public body'],staging:report.staging};
await writeFile('output/cy11/site-verification.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
