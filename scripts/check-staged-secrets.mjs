import {execFileSync} from 'node:child_process';
import {readFile,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
const files=execFileSync('git',['ls-files','--cached','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const secrets=['SUPABASE_SERVICE_ROLE_KEY','CRON_SECRET','VERCEL_OIDC_TOKEN','STAGING_AUTH_PASSWORD'].map(k=>process.env[k]).filter(v=>v&&v.length>16);
let total=0;
for(const file of files){
 assert.ok(!/(^|\/)(?:\.env(?!\.example)|backups|\.vercel|output)(\/|$)/.test(file),`Private path staged: ${file}`);
 const bytes=await readFile(file);total+=bytes.length;
 assert.ok(bytes.length<90e6,`File too large for GitHub: ${file}`);
 for(const secret of secrets)assert.ok(!bytes.includes(Buffer.from(secret)),`Secret detected in ${file}; value withheld`);
}
console.log(`PASS: ${files.length} staged files (${Math.round(total/1024/1024)} MB), no configured server secrets or private output paths.`);
