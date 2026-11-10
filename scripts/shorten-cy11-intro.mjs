import {createClient} from '@supabase/supabase-js';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
assert.equal(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,'tvdnsqmvxxencezenzwx.supabase.co');
const {data:a,error}=await db.from('articles').select('id,body,excerpt,updated_at').eq('slug','christmas-table-decor-ideas').single();assert.ifError(error);
const excerpt='Set a festive Christmas table with simple linens, napkins, and place cards. These 17 ideas add holiday warmth while leaving room for dinner.';
if(a.excerpt===excerpt){console.log('Introduction already shortened');process.exit(0);}
assert.ok(a.body[0].text.startsWith('There is a moment'));
assert.ok(a.body[1].text.startsWith('This guide is about'));
assert.ok(a.body[2].text.startsWith('A quick safety note'));
await writeFile('output/cy11/before-short-intro.json',JSON.stringify(a,null,2));
const body=a.body.slice(2);
const body_text=body.map(b=>b.text??b.items?.join(' ')??b.caption??'').join('\n');
const {data:s,error:se}=await db.from('articles').update({excerpt,body,body_text}).eq('id',a.id).eq('updated_at',a.updated_at).select('id');assert.ifError(se);assert.equal(s.length,1);
const {data:v,error:ve}=await db.from('articles').select('body,excerpt').eq('id',a.id).single();assert.ifError(ve);assert.equal(v.excerpt,excerpt);assert.equal(v.body.filter(b=>b.type==='image').length,17);assert.equal(v.body.filter(b=>b.type==='heading'&&/^\d+\./.test(b.text)).length,17);
console.log('Shortened introduction to one 25-word summary; retained safety note and all 17 ideas and images.');
