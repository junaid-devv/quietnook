import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { stagingAccess } from "@/lib/staging";
export async function proxy(request: NextRequest) {
  const staging = stagingAccess(request.headers.get("authorization"));
  if (staging !== "allowed" && request.nextUrl.pathname !== "/api/cron/publish/") {
    return new NextResponse(staging === "unconfigured" ? "Staging access is not configured." : "Private staging site.", {
      status: staging === "unconfigured" ? 503 : 401,
      headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow",
        ...(staging === "denied" ? { "WWW-Authenticate": 'Basic realm="quietnook staging", charset="UTF-8"' } : {}) },
    });
  }
  const privateRoute = /^\/(admin|preview|auth)(\/|$)|^\/api\/admin(\/|$)/.test(request.nextUrl.pathname);
  if (!privateRoute) {
    const response = NextResponse.next();
    if (process.env.STAGING !== "false") response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  let response = NextResponse.next({ request });
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    const db = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (values) => {
            values.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            values.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );
    await db.auth.getUser();
  }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|fonts/|brand/).*)"],
};
