import { NextResponse } from "next/server";
import { publicDb, editor } from "@/lib/supabase";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;
  if (!z.uuid().safeParse(id).success)
    return new Response("Not found", { status: 404 });
  const auth = await editor();
  const db = auth?.db || publicDb();
  if (!db) return new Response("Not found", { status: 404 });
  const { data: m } = await db
    .from("media")
    .select("storage_key")
    .eq("id", id)
    .maybeSingle();
  if (!m)
    return new Response("Not found", {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  const { data, error } = await db.storage
    .from("editorial")
    .createSignedUrl(m.storage_key, 60);
  if (error || !data) return new Response("Unavailable", { status: 503 });
  const r = NextResponse.redirect(data.signedUrl);
  r.headers.set("Cache-Control", "private, no-store");
  r.headers.set("X-Robots-Tag", "noindex");
  return r;
}
