import {readFile,readdir} from "node:fs/promises";
import path from "node:path";
const root=path.resolve(process.env.NEXT_DIST_DIR||".next","static");
const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!secret)throw Error("Server key required to check for accidental exposure; it will not be logged.");
let count=0;
async function walk(folder){for(const file of await readdir(folder,{withFileTypes:true})){
  const absolute=path.join(folder,file.name);
  if(file.isDirectory())await walk(absolute);
  else if(/\.(js|map|json)$/.test(file.name)){
    if((await readFile(absolute,"utf8")).includes(secret))throw Error("Server secret found in a public asset; do not deploy.");
    count++;
  }
}}
await walk(root);console.log(`PASS server key absent from ${count} checked public asset files.`);
