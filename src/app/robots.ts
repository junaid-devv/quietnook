import type { MetadataRoute } from "next";
import { origin } from "@/lib/data";
export default function robots(): MetadataRoute.Robots {
  const base = origin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/preview/", "/auth/"],
    },
    sitemap:
      base && process.env.STAGING === "false"
        ? `${base}/sitemap.xml`
        : undefined,
  };
}
