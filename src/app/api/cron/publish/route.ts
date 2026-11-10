import { timingSafeEqual } from "node:crypto";
import { serviceDb } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { json } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const expected = Buffer.from(`Bearer ${secret}`);
  const supplied = Buffer.from(request.headers.get("authorization") || "");
  if (
    !secret ||
    secret.length < 32 ||
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  )
    return json({ message: "Unauthorized" }, 401);
  try {
    const { data, error } = await serviceDb().rpc("publish_due");
    if (error) throw error;
    if (data) revalidatePath("/", "layout");
    return json({ published: data });
  } catch {
    return json({ message: "Scheduled publishing is not available" }, 503);
  }
}
