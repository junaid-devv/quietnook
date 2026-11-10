import {createClient} from '@supabase/supabase-js';
import sharp from 'sharp';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const root='output/cy12/square-batch';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
assert.equal(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,'tvdnsqmvxxencezenzwx.supabase.co');
const {data:a,error}=await db.from('articles').select('id,body,updated_at').eq('id','6f678885-6674-4876-aa39-57f52faef99a').single();assert.ifError(error);
const slots=[];let heading='';
for(let i=0;i<a.body.length;i++){const b=a.body[i];if(b.type==='heading')heading=b.text;if(b.type==='image')slots.push({index:i,heading,number:Number(heading.match(/^(\d+)[.)]/)?.[1])});}
assert.equal(slots.length,21);
const files=(await readdir(`${root}/source`)).filter(f=>/\.png$/i.test(f)).sort();assert.equal(files.length,21);
await mkdir(`${root}/optimized`,{recursive:true});
let manifest;
try{manifest=JSON.parse(await readFile(`${root}/manifest.json`,'utf8'));}catch{
 manifest=[];
 for(const slot of slots){
  const file=files.find(f=>Number(f.match(/^(\d+)_/)?.[1])===slot.number);assert.ok(file,slot.heading);
  const input=await readFile(`${root}/source/${file}`),meta=await sharp(input).metadata();assert.equal(meta.width,meta.height,`${file} must be square`);
  const {data:bytes,info}=await sharp(input).rotate().resize({width:1120,withoutEnlargement:true}).webp({quality:82,effort:6}).toBuffer({resolveWithObject:true});
  const id=randomUUID(),output=`${root}/optimized/${file.replace(/\.png$/i,'.webp')}`;
  await writeFile(output,bytes);
  manifest.push({...slot,id,file,output,storage_key:`cy12-small-porch-christmas/${id}.webp`,width:info.width,height:info.height,bytes:bytes.length,sourceBytes:input.length,alt:a.body[slot.index].alt});
 }
 await writeFile(`${root}/manifest.json`,JSON.stringify(manifest,null,2));
}
const stats={images:manifest.length,sourceBytes:manifest.reduce((s,x)=>s+x.sourceBytes,0),optimizedBytes:manifest.reduce((s,x)=>s+x.bytes,0)};
console.log(JSON.stringify(stats));
if(!process.argv.includes('--publish'))process.exit(0);
if(manifest.every(m=>a.body[m.index]?.media_id===m.id)){console.log('Already applied');process.exit(0);}
await writeFile(`${root}/before.json`,JSON.stringify(a,null,2));
for(const m of manifest){
 const {data:exists,error:ee}=await db.from('media').select('id').eq('id',m.id).maybeSingle();assert.ifError(ee);
 if(!exists){
  const {error:ue}=await db.storage.from('editorial').upload(m.storage_key,await readFile(m.output),{contentType:'image/webp',upsert:false});assert.ifError(ue);
  const {error:me}=await db.from('media').insert({id:m.id,storage_key:m.storage_key,mime:'image/webp',width:m.width,height:m.height,bytes:m.bytes,alt:m.alt,caption:'',provenance:`User-supplied replacement illustration: ${m.file}, from 21_Outdoor_Christmas_Decor_Ideas_Images.zip.`,license:'Publication authorized by user.',folder:'cy12-small-porch-christmas',focal_x:50,focal_y:50});assert.ifError(me);
 }
 const {error:re}=await db.from('article_media').upsert({article_id:a.id,media_id:m.id},{onConflict:'article_id,media_id'});assert.ifError(re);
}
const body=structuredClone(a.body);
for(const m of manifest)body[m.index]={...body[m.index],media_id:m.id,width:m.width,height:m.height};
const {data:changed,error:se}=await db.from('articles').update({body}).eq('id',a.id).eq('updated_at',a.updated_at).select('id');assert.ifError(se);assert.equal(changed.length,1);
const {data:v,error:ve}=await db.from('articles').select('body').eq('id',a.id).single();assert.ifError(ve);
for(const m of manifest){assert.equal(v.body[m.index].media_id,m.id);const response=await fetch(`http://127.0.0.1:3003/api/media/${m.id}/`);assert.equal(response.status,200);const meta=await sharp(Buffer.from(await response.arrayBuffer())).metadata();assert.equal(meta.width,meta.height);}
await writeFile(`${root}/result.json`,JSON.stringify({...stats,verified:true,reductionPercent:100*(1-stats.optimizedBytes/stats.sourceBytes)},null,2));
console.log('All 21 replacements saved and publicly readable through the local site.');
