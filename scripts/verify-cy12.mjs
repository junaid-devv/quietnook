import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const result=JSON.parse(await readFile('output/cy12/publication-result.json','utf8'));
const browser=await chromium.launch({headless:true,channel:'msedge'});
const report={checks:[],pageErrors:[]};
await mkdir('output/playwright',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>report.pageErrors.push(e.message));
 const response=await page.goto(result.localUrl,{waitUntil:'networkidle'});assert.equal(response.status(),200);
 assert.equal(await page.locator('h1').innerText(),result.title);
 assert.equal(await page.locator('.article-body h3').filter({hasText:/^\d+\./}).count(),21);
 assert.equal(await page.locator('.article-body figure img').count(),21);
 assert.ok((await page.locator('.byline').innerText()).includes('Ali Hamza'));
 assert.ok(!(await page.locator('.article-body').innerText()).includes('Publishing Package'));
 assert.ok(!(await page.locator('.article-body').innerText()).includes('Ubersuggest'));
 const desc=await page.locator('meta[name="description"]').getAttribute('content');assert.ok(desc.includes('21 outdoor Christmas'));
 const canonical=await page.locator('link[rel="canonical"]').getAttribute('href');assert.equal(canonical,`https://quietnook.com/articles/${result.slug}/`);
 const robots=await page.locator('meta[name="robots"]').getAttribute('content');assert.ok(robots.includes('noindex'));
 for(const img of await page.locator('.article-body img').all()){
   await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());
   assert.ok(await img.evaluate(el=>el.naturalWidth>0));assert.ok(await img.getAttribute('alt'));
 }
 const ld=await page.locator('script[type="application/ld+json"]').allTextContents();assert.ok(ld.some(s=>s.includes('BlogPosting')&&s.includes('Ali Hamza')));
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:'output/playwright/cy12-desktop.png'});
 report.checks.push('Desktop 200; 21 numbered ideas; 21 body images decoded; author, metadata, canonical, structured data, staging noindex verified');
 await page.setViewportSize({width:390,height:844});await page.reload({waitUntil:'networkidle'});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 await page.screenshot({path:'output/playwright/cy12-mobile.png'});
 report.checks.push('Mobile 390px: no horizontal overflow');
 for(const route of ['/seasons/christmas/','/decor-ideas/','/small-spaces/']){
   const r=await page.goto(`http://127.0.0.1:3003${route}`,{waitUntil:'networkidle'});assert.equal(r.status(),200);assert.ok((await page.locator('main').innerText()).includes(result.title));
 }
 report.checks.push('Article visible in all three category listings');
 assert.equal(report.pageErrors.length,0);
 await writeFile('output/cy12/browser-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
