import {createClient} from '@supabase/supabase-js';
import sharp from 'sharp';
import {readdir, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
for(const table of ['authors','categories','articles']) {
 const columns={authors:'id,name,slug,bio',categories:'id,name,slug,kind,indexable',articles:'id,title,slug,status,author_id'}[table];
 const {data,error}=await db.from(table).select(columns);if(error)throw error;console.log(table,JSON.stringify(data));
}
console.log('environment',JSON.stringify({origin:process.env.SITE_URL,staging:process.env.STAGING,project:new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname}));
const dir='C:/Users/PMLS/Downloads/CY12 – 21 Outdoor Christmas Decorating Ideas for Small Porches';
const files=(await readdir(dir)).filter(x=>x.endsWith('.png'));
await mkdir('output/cy12',{recursive:true});
const tiles=[];
for(let i=0;i<files.length;i++){
 const f=files[i];const p=path.join(dir,f);const m=await sharp(p).metadata();console.log(i+1,f,m.width,m.height);
 const label=Buffer.from('<svg width="240" height="42"><rect width="240" height="42" fill="white"/><text x="8" y="26" font-size="22">'+(i+1)+'</text></svg>');
 const thumb=await sharp(p).resize(240,240,{fit:'contain',background:'white'}).extend({bottom:42,background:'white'}).composite([{input:label,left:0,top:240}]).png().toBuffer();
 tiles.push({input:thumb,left:(i%6)*240,top:Math.floor(i/6)*282});
}
await sharp({create:{width:1440,height:Math.ceil(files.length/6)*282,channels:3,background:'white'}}).composite(tiles).png().toFile('output/cy12/contact-sheet.png');
await writeFile('output/cy12/source-images.json',JSON.stringify(files,null,2));
