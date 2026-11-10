import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { articleSchema, bodyText, type Block } from '../src/lib/content';

async function main(){

const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
const source='C:/Users/PMLS/Downloads/21 Outdoor Christmas Decorating Ideas for Small Porches.md';
const dir='C:/Users/PMLS/Downloads/CY12 – 21 Outdoor Christmas Decorating Ideas for Small Porches';
const files=JSON.parse(await readFile('output/cy12/source-images.json','utf8')) as string[];
const mapping=[8,19,7,6,9,22,20,21,17,12,14,5,13,16,2,10,11,15,18,3,4];
const md=(await readFile(source,'utf8')).split('## Publishing Package')[0].trim();
const clean=(s:string)=>s.replace(/\*\*/g,'').trim();
const edits:Record<string,string>={
 'Single Hanging Star from the Porch Light':'Single Hanging Star Beneath the Porch Ceiling',
 'It holds up well in wind and light rain, and it looks good against both dark and light doors.':'Choose materials rated for your porch’s exposure; natural berries and untreated grapevine may need shelter from wind and rain. The wreath looks good against both dark and light doors.',
 'Because it has no bow to wilt, it can stay up until mid-January.':'It can work as winter decor after Christmas if the materials remain in good condition.',
 'connect it to a GFCI outlet or a weatherproof timer.':'connect it to a GFCI-protected outlet, using an outdoor-rated timer if desired.',
 'Use a metal or wire star, and hang it on clear line from a hook, keeping it at least a foot from the light fixture so heat does not damage it.':'Use a metal or wire star and suspend it from a separate, weight-rated ceiling hook with outdoor-rated hanging line. Follow the light fixture manufacturer’s clearance instructions; do not attach decorations to the fixture or its wiring.',
 'without any fire risk.':'without an open flame.',
 'It is best not to. Use lights labeled for outdoor use, since they are made to handle moisture and cold.':'No. Use lights specifically labeled for outdoor use and follow the manufacturer’s instructions for wet locations and temperature limits.',
};
function revise(s:string){s=clean(s);for(const [a,b] of Object.entries(edits))s=s.replace(a,b);return s;}
const blocks:Block[]=[];
const manifest:any[]=[];
await mkdir('output/cy12/optimized',{recursive:true});
let previous:any[]=[];try{previous=JSON.parse(await readFile('output/cy12/media-manifest.json','utf8'));}catch{}
async function media(index:number,alt:string,name:string){
 const original=files[index-1];
 const cached=previous.find(x=>x.original===original);if(cached){manifest.push(cached);return cached;}
 const input=await readFile(path.join(dir,original));
 const {data,info}=await sharp(input,{limitInputPixels:40000000}).rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:82,effort:6}).toBuffer({resolveWithObject:true});
 const id=randomUUID(),key=`cy12-small-porch-christmas/${name}.webp`;
 const output=`output/cy12/optimized/${name}.webp`;await writeFile(output,data);
 const {error:uploadError}=await db.storage.from('editorial').upload(key,data,{contentType:'image/webp',upsert:false});if(uploadError)throw uploadError;
 const record={id,storage_key:key,mime:'image/webp',width:info.width,height:info.height,bytes:data.length,alt,caption:'',provenance:`User-supplied decorating illustration: ${original}. Supplied for this article on November 9, 2026.`,license:'Publication authorized by user; no independent third-party license verification.',folder:'cy12-small-porch-christmas',focal_x:50,focal_y:50};
 const {error}=await db.from('media').insert(record);if(error){await db.storage.from('editorial').remove([key]);throw error;}
 const entry={...record,original,source_bytes:input.length,output};manifest.push(entry);
 await writeFile('output/cy12/media-manifest.json',JSON.stringify(manifest,null,2));
 console.log(`Prepared ${name}: ${Math.round(data.length/1024)} KB`);return entry;
}
let imageNumber=0;
for(const part of md.split(/\r?\n\s*\r?\n/)){
 if(part.startsWith('# '))continue;
 const im=part.match(/^\*Image: ([^·]+) · Alt: (.+)\*$/);
 if(im){const n=imageNumber++;const m=await media(mapping[n],im[2].trim(),im[1].trim().replace(/\.jpg$/,''));blocks.push({type:'image',media_id:m.id,alt:m.alt,caption:'',width:m.width,height:m.height});continue;}
 const heading=part.match(/^(#{2,3}) (.+)$/);if(heading){blocks.push({type:'heading',level:heading[1].length as 2|3,text:revise(heading[2])});continue;}
 if(part.startsWith('- ')){blocks.push({type:'list',ordered:false,items:part.split(/\r?\n/).map(x=>revise(x.replace(/^- /,'')))});continue;}
 const faq=part.match(/^\*\*(.+?\?)\*\*\s*(.+)$/s);if(faq){blocks.push({type:'heading',level:3,text:faq[1]},{type:'paragraph',text:revise(faq[2])});continue;}
 blocks.push({type:'paragraph',text:revise(part)});
}
if(imageNumber!==21)throw Error(`Expected 21 image markers, got ${imageNumber}`);
const cover=await media(1,'Small Christmas porch with an evergreen wreath, warm lights, planters, a sled, and a bistro table','outdoor-christmas-decorating-small-porch-cover');
// Only add working category links; the other article IDs in the source are not published.
blocks.push({type:'heading',level:2,text:'More Seasonal Decorating Inspiration'},
 {type:'link',text:'Explore Christmas decorating ideas',url:'https://quietnook.com/seasons/christmas/'},
 {type:'link',text:'Browse small-space decorating ideas',url:'https://quietnook.com/small-spaces/'},
 {type:'heading',level:2,text:'Outdoor Decorating Safety Resources'},
 {type:'link',text:'CPSC holiday decoration safety tips',url:'https://www.cpsc.gov/s3fs-public/611.pdf'},
 {type:'link',text:'Electrical Safety Foundation outdoor decoration safety tips',url:'https://www.esfi.org/outdoor-decoration-safety-tips/'});
const {data:cats,error}=await db.from('categories').select('id,slug');if(error)throw error;
const slugs=['christmas','decor-ideas','small-spaces'];
const category_ids=slugs.map(slug=>{const cat=cats.find(c=>c.slug===slug);if(!cat)throw Error('Missing category '+slug);return cat.id;});
const payload=articleSchema.parse({title:'21 Outdoor Christmas Decorating Ideas for Small Porches',slug:'christmas-decoration-ideas-outdoor',excerpt:'Make a small porch, stoop, or balcony feel festive with wreaths, lanterns, greenery, and lights, plus practical outdoor decorating tips.',body:blocks,status:'draft',author_id:null,cover_media_id:cover.id,publish_at:null,seo_title:'21 Outdoor Christmas Decorating Ideas for Small Porches',seo_description:'Decorate a small porch, stoop, or balcony with 21 outdoor Christmas decorating ideas, plus renter-friendly tips and outdoor safety advice.',category_ids});
await writeFile('output/cy12/article-prepared.json',JSON.stringify({...payload,body_text:bodyText(blocks)},null,2));
await writeFile('output/cy12/media-manifest.json',JSON.stringify(manifest,null,2));
console.log(JSON.stringify({blocks:blocks.length,numberedIdeas:blocks.filter(b=>b.type==='heading'&&/^\d+\./.test(b.text)).length,images:imageNumber,media:manifest.length,sourceBytes:manifest.reduce((a,x)=>a+x.source_bytes,0),optimizedBytes:manifest.reduce((a,x)=>a+x.bytes,0),categories:slugs,wordCount:bodyText(blocks).split(/\s+/).length}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
