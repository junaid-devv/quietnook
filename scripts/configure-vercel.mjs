// Uses the already authenticated Vercel CLI; secrets travel only through stdin.
import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const cli=process.env.APPDATA+'/npm/node_modules/vercel/dist/vc.js';
const project=JSON.parse(await readFile('.vercel/project.json','utf8'));
assert.equal(project.projectName,'quietnook');
const values={};
for(const key of ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','SUPABASE_SERVICE_ROLE_KEY','CRON_SECRET']){assert.ok(process.env[key],`Missing ${key}`);values[key]=process.env[key];}
Object.assign(values,{SITE_URL:'https://quietnook.vercel.app',STAGING:'true',REQUIRE_STAGING_AUTH:'false'});
for(const [key,value] of Object.entries(values)){
 const r=spawnSync(process.execPath,[cli,'env','add',key,'production,preview','--force','--yes'],{input:value,encoding:'utf8',maxBuffer:2e6});
 if(r.status!==0)throw Error(`Could not configure ${key}; exit ${r.status}`);
 console.log(`Configured ${key}`);
}
console.log(JSON.stringify({project:project.projectName,origin:values.SITE_URL,noindex:true}));
