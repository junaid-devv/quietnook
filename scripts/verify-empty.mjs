import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "UNVERIFIED: production credentials are absent. No production article count can be claimed.",
  );
  process.exit(2);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const { count, error } = await db
  .from("articles")
  .select("id", { head: true, count: "exact" });
if (error) {
  console.error("UNVERIFIED: production count query failed.");
  process.exit(2);
}
console.log(`Production article records: ${count}`);
if (count !== 0) process.exit(1);
