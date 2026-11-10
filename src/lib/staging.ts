import { timingSafeEqual } from "node:crypto";

export function stagingAccess(authorization: string | null) {
  if (process.env.STAGING === "false") return "allowed";
  const user = process.env.STAGING_AUTH_USER;
  const password = process.env.STAGING_AUTH_PASSWORD;
  const required = process.env.REQUIRE_STAGING_AUTH === "true" || !!user || !!password;
  if (!required) return "allowed"; // Loopback development; hosted staging must enable this.
  if (!user || !password || password.length < 24) return "unconfigured";
  const supplied = Buffer.from(authorization || "");
  const expected = Buffer.from(`Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected) ? "allowed" : "denied";
}
