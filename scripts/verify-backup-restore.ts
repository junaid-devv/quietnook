// Restore an application export into disposable, in-memory PostgreSQL only.
// Never connects to a remote database and never creates content fixtures.
import { readFileSync,readdirSync,writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
async function main() {
const folder=process.argv[2];if(!folder)throw Error("Supply the private backup folder");
const bytes=readFileSync(path.join(folder,"application.json"));
assert.equal(createHash("sha256").update(bytes).digest("hex"),readFileSync(path.join(folder,"application.sha256"),"utf8"));
const {data}=JSON.parse(bytes.toString());
const db=new PGlite();const restored: Record<string,number>={};
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$select null::uuid$$;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security; grant usage on schema public,auth,storage to anon,authenticated,service_role;`);
  for(const name of readdirSync("supabase/migrations").filter(n=>n.endsWith(".sql")).sort())
    await db.exec(readFileSync(`supabase/migrations/${name}`,"utf8").replace("create extension if not exists pgcrypto;",""));
  // Only the Auth IDs needed to satisfy foreign keys, not restored accounts.
  for(const member of data.editor_members)
    await db.query("insert into auth.users(id) values($1) on conflict do nothing",[member.user_id]);
  const tables=["editor_members","categories","media","authors","articles","article_categories","article_media","revisions","site_settings","redirects"];
  for(const table of tables){
    for(const row of data[table]){
      const filtered=Object.fromEntries(Object.entries(row).filter(([key])=>key!=="search_vector"));
      const cols=Object.keys(filtered);const values=Object.values(filtered).map(v=>v!==null&&typeof v==="object"?JSON.stringify(v):v);
      await db.query(`insert into public.${table}(${cols.map(c=>`"${c}"`).join(",")}) values(${cols.map((_,i)=>`$${i+1}`).join(",")})`,values);
    }
    const result=await db.query<{n:number}>(`select count(*)::int n from public.${table}`);
    assert.equal(result.rows[0].n,data[table].length);restored[table]=result.rows[0].n;
  }
  assert.equal(restored.articles,0,"No article records are permitted for this handoff");
  writeFileSync("docs/backup-restore-verification.json",JSON.stringify({date:new Date().toISOString(),method:"SHA-256 checked application export restored into isolated PGlite using all migrations",restored,limitations:["Not a full hosted Supabase restore. Auth service, passwords and object bytes are outside this drill.","No content fixtures were added to production."]},null,2));
  console.log("PASS isolated application-data restore and integrity checks; zero articles.");
}finally{await db.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
