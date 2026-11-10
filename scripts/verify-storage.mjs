// Isolated, private QA bucket. No production media, authors, or articles inserted.
import {createClient} from "@supabase/supabase-js";
import {randomUUID,createHash} from "node:crypto";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import assert from "node:assert/strict";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const options={auth:{persistSession:false,autoRefreshToken:false}};
const admin=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,options);
const anon=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,options);
const bucket=`quietnook-qa-${randomUUID()}`,key="restore-check.png";
const bytes=await readFile("public/brand/apple-touch-icon.png");
const hash=b=>createHash("sha256").update(b).digest("hex");
let created=false;const checks=[];
try{
  const {error}=await admin.storage.createBucket(bucket,{public:false,fileSizeLimit:1000000,allowedMimeTypes:["image/png"]});
  assert.ifError(error);created=true;
  assert.ifError((await admin.storage.from(bucket).upload(key,bytes,{contentType:"image/png"})).error);
  const download=await admin.storage.from(bucket).download(key);assert.ifError(download.error);
  const backedUp=Buffer.from(await download.data.arrayBuffer());assert.equal(hash(backedUp),hash(bytes));
  await mkdir("backups/storage-drill",{recursive:true});await writeFile("backups/storage-drill/restore-check.png",backedUp);
  checks.push("Real private bucket upload/download and SHA-256 backup integrity");
  const hidden=await anon.storage.from(bucket).download(key);assert.ok(hidden.error);
  checks.push("Anonymous direct download denied");
  assert.ifError((await admin.storage.from(bucket).remove([key])).error);
  const restore=await readFile("backups/storage-drill/restore-check.png");
  assert.ifError((await admin.storage.from(bucket).upload(key,restore,{contentType:"image/png",upsert:false})).error);
  const restored=await admin.storage.from(bucket).download(key);assert.ifError(restored.error);
  assert.equal(hash(Buffer.from(await restored.data.arrayBuffer())),hash(bytes));
  checks.push("Real object deletion and restoration from backup bytes, hash verified");
}finally{
  if(created){
    const removed=await admin.storage.from(bucket).remove([key]);assert.ifError(removed.error);
    const deleted=await admin.storage.deleteBucket(bucket);assert.ifError(deleted.error);
  }
}
assert.ok((await admin.storage.getBucket(bucket)).error,"QA bucket must be removed");
await writeFile("docs/storage-verification.json",JSON.stringify({date:new Date().toISOString(),method:"Temporary private QA bucket in the selected Supabase project, separate from editorial media",checks,cleanup:"QA object and bucket removed; no production media/article records created",limitations:["Does not verify an editor's authenticated upload through the studio UI.","Does not substitute for full Auth/database disaster recovery."]},null,2));
console.log("PASS real private storage upload/download, anonymous denial, backup/restore and QA bucket cleanup.");
