import {createClient} from '@supabase/supabase-js';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {articleSchema,bodyText} from '../src/lib/content';

async function main(){
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
 const anon=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
 assert.equal(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname,'tvdnsqmvxxencezenzwx.supabase.co');
 const prepared=JSON.parse(await readFile('output/cy12/article-prepared.json','utf8'));
 const manifest=JSON.parse(await readFile('output/cy12/media-manifest.json','utf8'));
 const {data:existing,error:existingError}=await db.from('articles').select('id,status').eq('slug',prepared.slug);assert.ifError(existingError);assert.equal(existing!.length,0,'Do not overwrite an existing article');
 const {data:authors,error:authorsError}=await db.from('authors').select('id,name').eq('slug','ali-hamza');assert.ifError(authorsError);
 let author=authors![0];
 if(!author){const {data,error}=await db.from('authors').insert({name:'Ali Hamza',slug:'ali-hamza',bio:''}).select('id,name').single();assert.ifError(error);author=data!;}
 assert.equal(author.name,'Ali Hamza');
 const payload=articleSchema.parse({...prepared,author_id:author.id,status:'published',publish_at:new Date().toISOString()});
 assert.equal(payload.body.filter(b=>b.type==='image').length,21);
 const {category_ids,...row}=payload;
 // Keep the new article private while all category and media relationships are set up.
 const {data:article,error:insertError}=await db.from('articles').insert({...row,status:'draft',publish_at:null,body_text:bodyText(payload.body)}).select('id').single();assert.ifError(insertError);
 const id=article!.id;
 const {error:catError}=await db.from('article_categories').insert(category_ids.map(category_id=>({article_id:id,category_id})));assert.ifError(catError);
 const {error:mediaError}=await db.from('article_media').insert(manifest.map((m:any)=>({article_id:id,media_id:m.id})));assert.ifError(mediaError);
 const {data:relations,error:relError}=await db.from('article_media').select('media_id').eq('article_id',id);assert.ifError(relError);assert.equal(relations!.length,22);
 const {data:cats,error:catReadError}=await db.from('categories').select('id,slug').in('id',category_ids);assert.ifError(catReadError);assert.equal(cats!.length,3);
 const {error:categoryIndexError}=await db.from('categories').update({indexable:true}).in('id',category_ids);assert.ifError(categoryIndexError);
 const {error:publishError}=await db.from('articles').update({status:'published',publish_at:payload.publish_at}).eq('id',id).eq('status','draft');assert.ifError(publishError);
 const {data:visible,error:visibleError}=await anon.from('articles').select('id,title,slug,status,authors(name),body').eq('id',id).single();assert.ifError(visibleError);assert.equal(visible!.status,'published');
 const {data:media,error:publicMediaError}=await anon.from('media').select('id').in('id',manifest.map((m:any)=>m.id));assert.ifError(publicMediaError);assert.equal(media!.length,22);
 const {data:search,error:searchError}=await anon.rpc('search_articles',{query_text:'Christmas porch',category_slug:'christmas'});assert.ifError(searchError);assert.ok(search.some((a:any)=>a.id===id));
 const report={id,title:payload.title,slug:payload.slug,status:'published',publish_at:payload.publish_at,author:author.name,categories:cats!.map(c=>c.slug),images:21,coverImages:1,numberedIdeas:21,sourceBytes:manifest.reduce((a:number,x:any)=>a+x.source_bytes,0),optimizedBytes:manifest.reduce((a:number,x:any)=>a+x.bytes,0),anonymousVisibilityVerified:true,searchVerified:true,publicDeployment:false,localUrl:`http://127.0.0.1:3003/articles/${payload.slug}/`};
 await writeFile('output/cy12/publication-result.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
