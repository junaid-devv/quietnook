import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { sitePages } from "../src/lib/site-pages";
async function main() {
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}});
assert.equal(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname,"tvdnsqmvxxencezenzwx.supabase.co");
const {data,error}=await db.from("site_settings").select("value").eq("id","public").single();
assert.ifError(error);
const value={...data.value};
for(const [key,text] of Object.entries(sitePages)) if(!value[key]?.trim())value[key]=text;
const {error:save}=await db.from("site_settings").update({value}).eq("id","public");assert.ifError(save);
const {data:verified,error:read}=await db.from("site_settings").select("value").eq("id","public").single();assert.ifError(read);
for(const key of Object.keys(sitePages))assert.ok(verified.value[key]?.trim());
const {count,error:countError}=await db.from("articles").select("id",{count:"exact",head:true});assert.ifError(countError);assert.equal(count,0);
console.log("Verified About, Privacy, Terms and Affiliate Disclosure settings; zero production articles.");
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
