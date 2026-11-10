// Run after privately redirecting `supabase projects api-keys --reveal --output json`.
// Never logs credentials. The transient key file is removed after successful setup.
import { readFile, writeFile, unlink } from "node:fs/promises";
import { randomBytes } from "node:crypto";
const source = ".supabase-keys.private.json";
const raw = await readFile(source, "utf8");
const data = JSON.parse(raw.slice(raw.search(/[\[{]/)));
const keys = Array.isArray(data) ? data : data.api_keys || data.keys;
if (!Array.isArray(keys)) throw Error("Unexpected key response format");
const active = keys.filter(k => !k.disabled);
const publicKey = active.find(k => k.type === "publishable") || active.find(k => k.name === "anon");
const secretKey = active.find(k => k.type === "secret") || active.find(k => k.name === "service_role");
const publicValue = publicKey?.api_key || publicKey?.value || publicKey?.key;
const secretValue = secretKey?.api_key || secretKey?.value || secretKey?.key;
if (!publicValue || !secretValue || publicValue.includes("...") || secretValue.includes("..."))
  throw Error("Complete publishable and server keys are required");
let env;
try { env = await readFile(".env.local", "utf8"); }
catch { env = await readFile(".env.example", "utf8"); }
const values = {
  NEXT_PUBLIC_SUPABASE_URL: "https://tvdnsqmvxxencezenzwx.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicValue,
  SUPABASE_SERVICE_ROLE_KEY: secretValue,
  SITE_URL: "https://quietnook.com",
  STAGING: "true",
  CONTACT_TO: "quietnookk@gmail.com",
};
if (!/^CRON_SECRET=.{32,}$/m.test(env)) values.CRON_SECRET = randomBytes(32).toString("hex");
for (const [key, value] of Object.entries(values)) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  env = pattern.test(env) ? env.replace(pattern, () => line) : `${env}\n${line}\n`;
}
await writeFile(".env.local", env, { mode: 0o600 });
await unlink(source);
console.log("Local environment configured for quietnook; secrets were not printed. Staging protections remain enabled.");
