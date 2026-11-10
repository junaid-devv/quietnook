import {gzipSync} from 'node:zlib';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
const base=process.env.TEST_ORIGIN||'http://127.0.0.1:3001';
const response=await fetch(base+'/');const html=await response.text();
const scripts=[...new Set([...html.matchAll(/<script\b([^>]*?)src="([^"]+)"[^>]*>/g)].filter(m=>!m[0].toLowerCase().includes('nomodule')).map(m=>m[2].replaceAll('&amp;','&')))];
const results=[];for(const src of scripts){const r=await fetch(new URL(src,base));if(!r.ok)throw Error('Asset measurement failed');const bytes=Buffer.from(await r.arrayBuffer());results.push({src,bytes:bytes.length,gzip_bytes:gzipSync(bytes).length});}
const times=[];for(let i=0;i<3;i++){const start=performance.now();await(await fetch(base+'/')).arrayBuffer();times.push(Math.round((performance.now()-start)*100)/100);}
const lab=JSON.parse(await readFile('docs/lighthouse-summary.json','utf8'));
const report={date:new Date().toISOString(),route:'/',environment:'Windows, Node 22.15, Next.js production server, loopback, connected Supabase database, unthrottled',method:'Sum gzipSync sizes of HTML script src resources, excluding nomodule-only scripts. This is a compressed transfer-size estimate, not a browser execution or field metric.',scripts:results,total_javascript_gzip_bytes:results.reduce((n,r)=>n+r.gzip_bytes,0),local_document_fetch_ms:times,median_local_document_fetch_ms:[...times].sort((a,b)=>a-b)[1],lighthouse_mobile:lab.median,lighthouse_evidence:'docs/lighthouse-summary.json',inp:null,limitations:lab.limitations};await mkdir('docs',{recursive:true});await writeFile('docs/performance.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
