import sharp from 'sharp';
import {readFile,writeFile,copyFile} from 'node:fs/promises';
const sheet=process.argv[2];const kind=process.argv[3]||'rooms';
if(!sheet)throw Error('Provide the generated image sheet path');
const meta=await sharp(sheet).metadata();const columns=2;const rows=kind==='rooms'?3:2;
const names=kind==='rooms'?['living-room','bedroom','kitchen','bathroom','balcony','diy-projects']:['winter','thanksgiving','easter','fourth-of-july'];
const width=Math.floor(meta.width/columns),height=Math.floor(meta.height/rows);
const manifest=JSON.parse(await readFile('docs/asset-manifest.json','utf8'));
for(const [i,name] of names.entries()){
 const input=await sharp(sheet).extract({left:(i%columns)*width,top:Math.floor(i/columns)*height,width,height}).toBuffer();
 for(const format of ['webp','avif']){
 const output=await sharp(input).resize(1000,null,{withoutEnlargement:true})[format]({quality:format==='webp'?84:60}).toBuffer();
 await writeFile(`public/images/${name}.${format}`,output);
 if(format==='webp'){
  const dimensions=await sharp(output).metadata();const entry={file:`/images/${name}.webp`,width:dimensions.width,height:dimensions.height,bytes:output.length,provenance:'Newly generated with OpenAI ImageGen for the 2026-11-09 page redesign',source:sheet,license:'Generated asset; no third-party stock source claimed',focal_point:'50% 50%',alt:'Decorative collection image; adjacent link supplies its accessible name. Hero images have descriptive alt text in collections.ts.'};
  const prior=manifest.findIndex(m=>m.file===entry.file);if(prior>=0)manifest[prior]=entry;else manifest.push(entry);
 }
 }
}
if(kind==='rooms')for(const [alias,original] of [['decor-ideas','living-room'],['small-spaces','balcony'],['organization','kitchen']]){
 for(const format of ['webp','avif'])await copyFile(`public/images/${original}.${format}`,`public/images/${alias}.${format}`);
 const source=manifest.find(m=>m.file===`/images/${original}.webp`);
 const entry={...source,file:`/images/${alias}.webp`,derived_from:`/images/${original}.webp`};
 const prior=manifest.findIndex(m=>m.file===entry.file);if(prior>=0)manifest[prior]=entry;else manifest.push(entry);
}
await writeFile('docs/asset-manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Prepared ${names.length} independent collection photographs`);
