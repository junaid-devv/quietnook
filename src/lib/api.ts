import "server-only";
import { createHash } from "node:crypto";
import { serviceDb } from "./supabase";
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(request.url);
  // Next can use an internal localhost URL even when the request Host is 127.0.0.1.
  // The browser controls Origin; compare it to the requested public authority.
  const host = request.headers.get("host");
  if (host) expected.host = host;
  return (
    !!origin &&
    origin === expected.origin &&
    request.headers.get("sec-fetch-site") !== "cross-site"
  );
}
export async function rateLimit(
  request: Request,
  bucket: string,
  max = 10,
  seconds = 600,
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = createHash("sha256").update(`${bucket}:${ip}`).digest("hex");
  try {
    const { data, error } = await serviceDb().rpc("consume_rate_limit", {
      bucket: key,
      max_hits: max,
      window_seconds: seconds,
    });
    return !error && data === true;
  } catch {
    return false;
  }
}
export const json = (value: unknown, status = 200) =>
  Response.json(value, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
