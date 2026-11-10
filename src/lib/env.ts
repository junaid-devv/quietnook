import "server-only";
import { z } from "zod";
const optional = (schema: z.ZodType) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());
export function validateEnvironment() {
  const schema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: optional(z.url()),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optional(z.string().min(20)),
    SITE_URL: optional(
      z.url().refine((s) => {
        const u = new URL(s);
        return (
          u.protocol === "https:" &&
          u.pathname === "/" &&
          !u.search &&
          !u.hash &&
          !u.username &&
          !u.password
        );
      }, "SITE_URL must be a verified HTTPS origin without a path"),
    ),
    STAGING: optional(z.enum(["true", "false"])),
    SUPABASE_SERVICE_ROLE_KEY: optional(z.string().min(20)),
    CRON_SECRET: optional(z.string().min(32)),
    CONTACT_FROM: optional(z.string().max(300)),
    CONTACT_TO: optional(z.email()),
    NEWSLETTER_VERIFIED: optional(z.enum(["true", "false"])),
    REQUIRE_STAGING_AUTH: optional(z.enum(["true", "false"])),
    STAGING_AUTH_USER: optional(z.string().min(1).max(100).refine(s => !s.includes(":"))),
    STAGING_AUTH_PASSWORD: optional(z.string().min(24)),
  });
  const parsed = schema.safeParse(process.env);
  if (!parsed.success)
    throw Error(
      `Invalid environment fields: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`,
    );
  if (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL !==
    !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
    throw Error(
      "Configure both Supabase URL and publishable key, or leave both empty.",
    );
}
