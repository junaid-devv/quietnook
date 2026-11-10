import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
console.log(JSON.stringify(await db.from('articles').select('id,title,status,publish_at,created_at').eq('slug','christmas-table-decor-ideas')));
const r=await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL+'/rest/v1/articles?select=id,title,status,publish_at',{headers:{apikey:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}});console.log('public',r.status,r.headers.get('date'),await r.text());
