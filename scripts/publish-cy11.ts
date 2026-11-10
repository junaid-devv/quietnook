import {createClient} from '@supabase/supabase-js';
import sharp from 'sharp';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {parseArticleMarkdown,matchImage} from '../src/lib/article-import';
import {articleSchema,bodyText} from '../src/lib/content';

async function main(){
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}});
const anon=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false}});
assert.equal(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname,'tvdnsqmvxxencezenzwx.supabase.co');
const source=await readFile('C:/Users/PMLS/Downloads/17 Christmas Table Decor Ideas That Leave Room for Dinner.md','utf8');
const parsed=parseArticleMarkdown(source);
assert.equal(parsed.images.length,17);assert.equal(parsed.slug,'christmas-table-decor-ideas');
const {data:existing,error:ee}=await db.from('articles').select('id').eq('slug',parsed.slug);assert.ifError(ee);assert.equal(existing!.length,0,'Article already exists; do not overwrite');
const {data:articles,error:ae}=await db.from('articles').select('id,title,slug,status,author_id');assert.ifError(ae);
const prior=articles!.find(a=>a.slug==='christmas-decoration-ideas-outdoor');assert.ok(prior?.author_id,'Reuse the first article author');
const {data:cats,error:ce}=await db.from('categories').select('id,slug,name');assert.ifError(ce);
const categorySlugs=['christmas','decor-ideas','small-spaces'];
const category_ids=categorySlugs.map(s=>{const c=cats!.find(c=>c.slug===s);assert.ok(c);return c.id;});
await mkdir('output/cy11/optimized',{recursive:true});
await writeFile('output/cy11/pre-import-articles.json',JSON.stringify(articles,null,2));
await writeFile('output/cy11/publishing-package.md',source.slice(source.indexOf('## Publishing Package')));
await writeFile('output/cy11/editorial-metadata.json',JSON.stringify({primary_keyword:'christmas table decor ideas',supporting_keywords:['table decor ideas for christmas','christmas table settings','easy christmas table decor ideas'],categories:categorySlugs,categorySource:'Assigned from existing taxonomy based on supplied content; no category field in source.',internalLinksPending:['Christmas Centerpiece Ideas (CY01)','Christmas Coffee Table Decor Ideas (CY09)',"New Year's Eve Table Decoration Ideas (CY16)"],keywordMetrics:'Source estimates are unverified; retained in publishing-package.md only.'},null,2));
const files=(await readdir('output/cy11/source')).map(name=>({name}));
let manifest:any[]=[];try{manifest=JSON.parse(await readFile('output/cy11/media-manifest.json','utf8'));}catch{}
async function media(original:string,alt:string,name:string){
 const cached=manifest.find(m=>m.original===original);if(cached)return cached;
 const input=await readFile('output/cy11/source/'+original);
 const {data,info}=await sharp(input,{limitInputPixels:40000000}).rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:82,effort:6}).toBuffer({resolveWithObject:true});
 const record={id:randomUUID(),storage_key:`cy11-christmas-table/${name}.webp`,mime:'image/webp',width:info.width,height:info.height,bytes:data.length,alt,caption:'',provenance:`User-supplied image: ${original}. Supplied for this article on November 9, 2026.`,license:'Publication authorized by user; no independent third-party license verification.',folder:'cy11-christmas-table',focal_x:50,focal_y:50};
 const {error:ue}=await db.storage.from('editorial').upload(record.storage_key,data,{contentType:'image/webp',upsert:false});assert.ifError(ue);
 const {error:me}=await db.from('media').insert(record);if(me){await db.storage.from('editorial').remove([record.storage_key]);throw me;}
 await writeFile(`output/cy11/optimized/${name}.webp`,data);
 const entry={...record,original,source_bytes:input.length};manifest.push(entry);await writeFile('output/cy11/media-manifest.json',JSON.stringify(manifest,null,2));console.log(`Prepared ${name}: ${Math.round(data.length/1024)} KB`);return entry;
}
for(let i=0;i<parsed.images.length;i++){
const slot=parsed.images[i],file=matchImage(slot.filename,files,i+1);assert.ok(file,`Missing image ${i+1}`);
const m=await media(file,slot.alt,slot.filename.replace(/\.[^.]+$/,''));parsed.body[slot.blockIndex]={type:'image',media_id:m.id,alt:slot.alt,caption:'',width:m.width,height:m.height};
}
const hero=await media('18_Hero_17_Christmas_Table_Decor_Ideas.png','Christmas dinner table with cream linens, green napkins, red accents, greenery, and warm candlelight','christmas-table-decor-ideas-hero');
const payload=articleSchema.parse({...parsed,status:'published',author_id:prior.author_id,cover_media_id:hero.id,publish_at:new Date().toISOString(),category_ids});
await writeFile('output/cy11/article-prepared.json',JSON.stringify(payload,null,2));
const {category_ids:ids,...row}=payload;
const {data:inserted,error:ie}=await db.from('articles').insert({...row,status:'draft',publish_at:null,body_text:bodyText(payload.body)}).select('id').single();assert.ifError(ie);const id=inserted!.id;
await writeFile('output/cy11/article-id.json',JSON.stringify({id}));
const {error:ac}=await db.from('article_categories').insert(ids.map(category_id=>({article_id:id,category_id})));assert.ifError(ac);
const {error:am}=await db.from('article_media').insert(manifest.map(m=>({article_id:id,media_id:m.id})));assert.ifError(am);
const {data:relations,error:re}=await db.from('article_media').select('media_id').eq('article_id',id);assert.ifError(re);assert.equal(relations!.length,18);
const {error:pe}=await db.from('articles').update({status:'published',publish_at:payload.publish_at}).eq('id',id).eq('status','draft');assert.ifError(pe);
const {data:visible,error:ve}=await anon.from('articles').select('*,authors(name)').eq('id',id).single();assert.ifError(ve);assert.equal(visible!.status,'published');assert.equal(visible!.body.filter((b:any)=>b.type==='image').length,17);
const {data:visibleMedia,error:vm}=await anon.from('media').select('id').in('id',manifest.map(m=>m.id));assert.ifError(vm);assert.equal(visibleMedia!.length,18);
const {data:search,error:se}=await anon.rpc('search_articles',{query_text:'christmas table decor ideas',category_slug:'christmas'});assert.ifError(se);assert.ok(search.some((a:any)=>a.id===id));
const {count,error:co}=await db.from('articles').select('id',{head:true,count:'exact'});assert.ifError(co);assert.equal(count,articles!.length+1);
const report={id,title:payload.title,slug:payload.slug,status:'published',author:visible!.authors.name,categories:categorySlugs,bodyImages:17,heroImages:1,sourceBytes:manifest.reduce((n,m)=>n+m.source_bytes,0),optimizedBytes:manifest.reduce((n,m)=>n+m.bytes,0),articleCount:count,anonymousVisibilityVerified:true,searchVerified:true,staging:process.env.STAGING==='true',route:`/articles/${payload.slug}/`};
await writeFile('output/cy11/publication-result.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
