// Read-only service checks, except two idempotent publisher calls on a verified
// zero-article project. Never creates article, author, media, or Auth fixtures.
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { writeFile } from "node:fs/promises";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const server = process.env.SUPABASE_SERVICE_ROLE_KEY;
assert.ok(url && publishable && server, "Supply the private project environment");
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const anon = createClient(url, publishable, options);
const admin = createClient(url, server, options);
const checks = [];
const check = (name, detail) => { checks.push({name, status:"passed", detail}); console.log(`PASS ${name}`); };
const {data:cats,error:catError} = await anon.from("categories").select("id");
assert.ifError(catError); assert.equal(cats.length,20); check("Hosted taxonomy", "20 taxonomy records accessible anonymously");
const {data:settings,error:settingsError} = await anon.from("site_settings").select("value").eq("id","public").single();
assert.ifError(settingsError); assert.equal(settings.value.contact_email,"quietnookk@gmail.com"); check("Public settings", "Supplied public contact address configured");
for (const table of ["articles","authors","media","revisions"]) {
  const {count,error}=await admin.from(table).select("*",{count:"exact",head:true});
  assert.ifError(error); assert.equal(count,0, `${table} must be empty at this handoff`);
  check(`Zero production ${table}`, "Exact count: 0");
}
const {error:membersError}=await anon.from("editor_members").select("user_id");
assert.ok(membersError, "Anonymous callers must not enumerate editor membership");
check("Membership privacy", "Anonymous table access denied");
const {error:saveError}=await anon.rpc("save_article",{payload:{}});
assert.ok(saveError); check("Anonymous writes", "Article save RPC denied before any insertion");
const {error:cronError}=await anon.rpc("publish_due"); assert.ok(cronError);
check("Scheduler authorization", "Anonymous execution denied");
const {data:results,error:searchError}=await anon.rpc("search_articles",{query_text:"storage"});
assert.ifError(searchError); assert.equal(results.length,0); check("Hosted full-text search", "Truthful empty result");
const {data:bucket,error:bucketError}=await admin.storage.getBucket("editorial");
assert.ifError(bucketError); assert.equal(bucket.public,false); check("Private media bucket", "Bucket exists and is not public");
const {data:files,error:filesError}=await anon.storage.from("editorial").list();
assert.ok(filesError || files.length === 0); check("Storage listing privacy", "No private objects exposed");
const authResponse=await fetch(`${url}/auth/v1/settings`,{headers:{apikey:publishable}});
assert.equal(authResponse.status,200); const auth=await authResponse.json();
assert.equal(auth.disable_signup,true); check("Hosted registration", "Public signups disabled");
for(let i=0;i<2;i++){const {data,error}=await admin.rpc("publish_due"); assert.ifError(error); assert.equal(data,0);}
check("Publisher RPC", "Two server-authorized calls return 0 with zero articles; host scheduling remains separate");
if(process.env.TEST_ORIGIN){
  for(let i=0;i<2;i++){
    const response=await fetch(`${process.env.TEST_ORIGIN}/api/cron/publish/`,{headers:{authorization:`Bearer ${process.env.CRON_SECRET}`}});
    assert.equal(response.status,200);assert.equal((await response.json()).published,0);
  }
  check("Connected scheduler HTTP endpoint","Two bearer-authorized local server calls return 0; no active hosting scheduler claimed");
}
await writeFile("docs/hosted-verification.json",JSON.stringify({date:new Date().toISOString(),project:new URL(url).hostname.split(".")[0],checks,limitations:["No production article or author fixtures were created.","No real editor password/session, provider inbox delivery, active host cron, or backup restore is asserted by these checks."]},null,2));
