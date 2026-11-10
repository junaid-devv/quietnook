import {createClient} from '@supabase/supabase-js';
import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
for(const [t,c] of Object.entries({articles:'id,title,slug,status,author_id',categories:'id,name,slug,kind',authors:'id,name,slug'})){const {data,error}=await db.from(t).select(c);if(error)throw error;console.log(t,JSON.stringify(data));}
await mkdir('output/cy11/source',{recursive:true});
execFileSync('tar',['-xf','C:/Users/PMLS/Downloads/17_Christmas_Table_Decor_Ideas_18_Images.zip','-C','output/cy11/source']);
const files=(await readdir('output/cy11/source')).sort();
const tiles=[];
for(let i=0;i<files.length;i++){
const input=await sharp('output/cy11/source/'+files[i]).resize(240,200,{fit:'contain',background:'white'}).extend({bottom:30,background:'white'}).composite([{input:Buffer.from(`<svg width="240" height="30"><text x="8" y="22" font-size="20">${i+1}</text></svg>`),left:0,top:200}]).png().toBuffer();tiles.push({input,left:(i%6)*240,top:Math.floor(i/6)*230});}
await sharp({create:{width:1440,height:690,channels:3,background:'white'}}).composite(tiles).png().toFile('output/cy11/contact-sheet.png');
console.log('environment',JSON.stringify({origin:process.env.SITE_URL,staging:process.env.STAGING}));
try{const r=await fetch('https://supabase.com/changelog.md');await writeFile('output/cy11/supabase-changelog.md',await r.text());console.log('changelog',r.status);}catch{}
