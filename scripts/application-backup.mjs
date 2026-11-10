// Application-data export, not a substitute for Supabase Auth/full-PG backups.
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const folder=process.argv[2]; if(!folder) throw Error("Supply a private backup directory");
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const tables=["editor_members","authors","categories","media","articles","article_categories","article_media","revisions","site_settings","redirects"];
const data={};
for(const table of tables){data[table]=[];for(let start=0;;start+=1000){
  let query=db.from(table).select("*");
  if(table==="editor_members") query=query.order("user_id");
  else if(["article_categories","article_media"].includes(table)) query=query.order("article_id").order(table==="article_categories"?"category_id":"media_id");
  else query=query.order("id");
  const {data:rows,error}=await query.range(start,start+999); if(error) throw Error(`Export failed: ${table}`);
  data[table].push(...rows); if(rows.length<1000)break;
}}
const bytes=JSON.stringify({version:1,date:new Date().toISOString(),project:new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,data,limitations:["Does not include Auth user credentials, rate-limit counters, or Storage object bytes.","Restore the matching Auth users and object bytes separately before restoring dependent records."]},null,2);
await mkdir(folder,{recursive:true});await writeFile(path.join(folder,"application.json"),bytes,{mode:0o600});
await writeFile(path.join(folder,"application.sha256"),createHash("sha256").update(bytes).digest("hex"));
console.log("Application data exported with SHA-256 integrity hash. Auth/full database and object backups remain separate.");
