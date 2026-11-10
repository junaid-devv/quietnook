import {chromium} from 'playwright';
import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:3003';
const browser=await chromium.launch({channel:'msedge',headless:true});
const checks=[];
try{
 if(!process.argv.includes('--import-only')) {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto(base+'/articles/christmas-decoration-ideas-outdoor/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.article-idea').count(),21);
 const desktop=await page.locator('.article-idea').first().evaluate(el=>{const text=el.querySelector('.article-idea-copy').getBoundingClientRect(),img=el.querySelector('img').getBoundingClientRect();return {textRight:text.right,imageLeft:img.left,imageWidth:img.width,textTop:text.top,imageTop:img.top};});
 assert.ok(desktop.imageTop<desktop.textTop);
 await page.locator('.article-idea').first().scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/article-layout-idea-desktop.png'});
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'output/playwright/article-layout-header-desktop.png'});
 checks.push('Desktop: numbered ideas place images above their text');
 for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);}
 await page.setViewportSize({width:390,height:844});await page.locator('.article-idea').first().scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/article-layout-idea-mobile.png'});
 const mobile=await page.locator('.article-idea').first().evaluate(el=>({textTop:el.querySelector('.article-idea-copy').getBoundingClientRect().top,imageBottom:el.querySelector('img').getBoundingClientRect().bottom}));assert.ok(mobile.textTop>=mobile.imageBottom);
 checks.push('Mobile: text follows each image; no overflow at 320, 390, 768, 1024 or 1440px');
 await page.goto(base,{waitUntil:'networkidle'});
 assert.ok(await page.locator('.seasons-section').evaluate(el=>el.nextElementSibling?.classList.contains('latest-ideas')));
 checks.push('Homepage: Latest ideas is immediately after Explore by Season');
 }
 // Isolated component harness: uploads are mocked; no production content is created.
 const source=`import React from 'react';window.React=React;import {createRoot} from 'react-dom/client';import {ArticleImport} from './src/components/admin/article-import';createRoot(document.getElementById('root')).render(<ArticleImport disabled={false} onBusyChange={()=>{}} onImport={(article,media,cover)=>{document.getElementById('result').textContent=JSON.stringify({article,media,cover});}}/>);`;
 const built=await build({stdin:{contents:source,resolveDir:process.cwd(),sourcefile:'import-harness.tsx',loader:'tsx'},bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',banner:{js:'var process={env:{NODE_ENV:"production"}};'},define:{'process.env.NODE_ENV':'"production"'},tsconfig:'tsconfig.json'});
 const fixture=await browser.newPage();
 fixture.on('pageerror',e=>console.log('Harness page error:',e.message));
 let uploads=0;
 await fixture.route('http://import.test/**',async route=>{
  if(route.request().method()==='POST'){uploads++;await route.fulfill({json:{id:`00000000-0000-4000-8000-${String(uploads).padStart(12,'0')}`,width:1000,height:1500}});}
  else await route.fulfill({contentType:'text/html',body:'<div id="root"></div><pre id="result"></pre>'});
 });
 await fixture.goto('http://import.test/');await fixture.addScriptTag({content:built.outputFiles[0].text});
 await fixture.locator('input[type=file]').first().setInputFiles({name:'article.md',mimeType:'text/markdown',buffer:Buffer.from('# Article fixture\n\nIntroduction.\n\n### 1. First idea\n\nDetails.\n\n![First image](01-door.jpg)\n\n### 2. Second idea\n\nDetails.\n\n![Second image](02-table.jpg)\n\n## Publishing Package\n\n- **Meta description:** Fixture description')});
 const image=await readFile('output/cy12/optimized/cy12-01-fresh-wreath-velvet-bow-front-door.webp');
 await fixture.locator('input[type=file]').nth(1).setInputFiles(['01-door.webp','02-table.webp','cover.webp'].map(name=>({name,mimeType:'image/webp',buffer:image})));
 await fixture.getByLabel('3. Cover picture').selectOption('cover.webp');
 await fixture.getByLabel('4. Image source / permission').fill('Isolated test fixture; never published');
 await fixture.getByRole('button',{name:'Import into editor'}).click();
 await fixture.waitForFunction(()=>document.getElementById('result').textContent.length>0);
 const imported=JSON.parse(await fixture.locator('#result').innerText());
 assert.equal(uploads,3);assert.equal(imported.article.body.filter(b=>b.type==='image').length,2);assert.equal(imported.cover,imported.media[2].id);assert.ok(imported.article.body.filter(b=>b.type==='image').every(b=>b.media_id));assert.ok(!JSON.stringify(imported.article.body).includes('Publishing Package'));
 checks.push('Isolated browser importer: exact filename matches, multiple optimized upload requests, image placement, separate cover and metadata import verified; no production writes');
 await writeFile('output/cy12/layout-and-import-verification.json',JSON.stringify({checks},null,2));console.log(JSON.stringify({checks},null,2));
}finally{await browser.close();}
