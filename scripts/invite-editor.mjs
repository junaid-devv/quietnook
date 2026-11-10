// Explicitly authorized invitation only; never creates an author or article.
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
const email = z.email().parse(process.argv[2]);
const redirectTo = z.url().parse(process.argv[3]);
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await db.auth.admin.inviteUserByEmail(email, { redirectTo });
if (error || !data.user) throw Error(`Invitation was not accepted by Supabase: ${error?.message || "No user returned"}`);
const { error: membershipError } = await db.from("editor_members").upsert({user_id:data.user.id});
if (membershipError) throw Error("Invitation accepted but membership failed; finish allowlisting this user in Supabase.");
console.log("Supabase accepted the editor invitation and editor membership is configured. Inbox delivery must be confirmed by the recipient.");
