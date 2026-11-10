import "server-only";
import { cache } from "react";
import { publicDb } from "./supabase";
import {
  categories as defaults,
  defaultSettings,
  type Category,
  type Settings,
} from "./taxonomy";
import { type Article, PAGE_SIZE, pageNumber } from "./content";
export { publicOrigin as origin } from "./seo";
export const getCategories = cache(async (): Promise<Category[]> => {
  const db = publicDb();
  if (!db) return defaults;
  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("position");
  if (error) throw Error("Category data is temporarily unavailable");
  return data || [];
});
export const getSettings = cache(async (): Promise<Settings> => {
  const db = publicDb();
  if (!db) return defaultSettings;
  const { data, error } = await db
    .from("site_settings")
    .select("value")
    .eq("id", "public")
    .limit(1)
    .maybeSingle();
  if (error) throw Error("Settings are temporarily unavailable");
  return { ...defaultSettings, ...data?.value };
});
export async function getArticles({
  q = "",
  category = "",
  page = 1,
}: { q?: string; category?: string; page?: number } = {}) {
  const db = publicDb();
  if (!db) return { articles: [] as Article[], count: 0 };
  const { data, error } = await db.rpc("search_articles", {
    query_text: q,
    category_slug: category,
    page_number: pageNumber(page),
    page_size: PAGE_SIZE,
  });
  if (error) throw Error("Articles are temporarily unavailable");
  let count = Number(data?.[0]?.total_count || 0);
  if (!data?.length && page > 1) {
    const result = await db.rpc("count_articles", {
      query_text: q,
      category_slug: category,
    });
    if (result.error) throw Error("Article count unavailable");
    count = Number(result.data || 0);
  }
  return {
    articles: (data || []) as Article[],
    count,
  };
}
export async function getArticle(slug: string) {
  const db = publicDb();
  if (!db) return null;
  const { data, error } = await db
    .from("articles")
    .select(
      "*,authors(name,slug,bio),cover_media:media!articles_cover_media_id_fkey(alt,width,height,focal_x,focal_y)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .lte("publish_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw Error("Article is temporarily unavailable");
  return data as Article | null;
}
