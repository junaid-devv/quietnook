import { NextResponse, type NextRequest } from "next/server";
import { sessionDb } from "@/lib/supabase";
import { z } from "zod";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const db = await sessionDb();
  if (code && db) {
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(new URL("/admin/password/", request.url));
  }
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = z.enum(["invite", "recovery"]).safeParse(request.nextUrl.searchParams.get("type"));
  if (tokenHash && type.success && db) {
    const { error } = await db.auth.verifyOtp({ token_hash: tokenHash, type: type.data });
    if (!error) return NextResponse.redirect(new URL("/admin/password/", request.url));
  }
  // Supabase's default invitation template uses a URL fragment, available only
  // to the browser. The browser carries that fragment through this redirect.
  if (!code && !tokenHash)
    return NextResponse.redirect(new URL("/auth/complete/", request.url));
  return NextResponse.redirect(
    new URL("/admin/login/?error=callback", request.url),
  );
}
