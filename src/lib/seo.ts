import type { Metadata } from "next";

export const SITE_NAME = "quietnook";
export const HOME_TITLE = "quietnook | Home Decor, Small Spaces & Seasonal Ideas";
export const HOME_DESCRIPTION =
  "Explore rooms, small-space living, and the seasons at quietnook. New decorating and organization guides are on the way.";
export const categoryTitles: Record<string, string> = {
  "decor-ideas": "Home Decor Ideas", "small-spaces": "Small-Space Decorating Ideas",
  organization: "Home Organization Ideas", "diy-projects": "DIY Home Decor & Projects",
  "living-room": "Living Room Decorating Ideas", bedroom: "Bedroom Decorating Ideas",
  kitchen: "Kitchen Decor & Organization Ideas", bathroom: "Bathroom Decor & Organization Ideas",
  balcony: "Balcony Decorating Ideas", christmas: "Christmas Decorating Ideas",
  halloween: "Halloween Decorating Ideas", fall: "Fall Decorating Ideas",
  "new-years-eve": "New Year's Eve Decor Ideas", "valentines-day": "Valentine's Day Decor Ideas",
  spring: "Spring Decorating Ideas", summer: "Summer Decorating Ideas",
  winter: "Winter Decorating Ideas", thanksgiving: "Thanksgiving Decorating Ideas",
  easter: "Easter Decorating Ideas", "fourth-of-july": "Fourth of July Decorating Ideas",
};

export function publicOrigin(value = process.env.SITE_URL) {
  if (!value) return undefined;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.pathname === "/" &&
      !u.search && !u.hash && !u.username && !u.password ? u.origin : undefined;
  } catch { return undefined; }
}

export function productionIndexing() {
  return process.env.STAGING === "false" && !!publicOrigin();
}

/** One source for canonical, sharing and indexing decisions on public pages. */
export function pageMetadata({ title, description, path, indexable = false, image,
  article, page = 1, canonical = true,
}: {
  title: string; description: string; path: string; indexable?: boolean;
  image?: string; page?: number; canonical?: boolean;
  article?: { publishedTime?: string; modifiedTime: string; author?: string };
}): Metadata {
  const base = publicOrigin();
  const url = base ? `${base}${path}${page > 1 ? `?page=${page}` : ""}` : undefined;
  const label = `${title}${page > 1 ? ` — Page ${page}` : ""}`;
  const fullTitle = label === HOME_TITLE ? label : `${label} | ${SITE_NAME}`;
  const images = base ? [{ url: `${base}${image || "/brand/sharing.png"}`,
    alt: image ? title : "quietnook — home decor and seasonal ideas" }] : [];
  return {
    title: { absolute: fullTitle }, description,
    robots: { index: productionIndexing() && indexable, follow: true,
      "max-image-preview": "large" },
    alternates: { canonical: canonical ? url : undefined },
    openGraph: {
      type: article ? "article" : "website", title: fullTitle, description,
      siteName: SITE_NAME, locale: "en_US", url, images,
      ...(article ? { publishedTime: article.publishedTime,
        modifiedTime: article.modifiedTime, authors: article.author ? [article.author] : [] } : {}),
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images },
  };
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
