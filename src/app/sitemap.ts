import type { MetadataRoute } from "next";
import { getCategories, origin, getSettings } from "@/lib/data";
import { publicDb } from "@/lib/supabase";
import { categoryHref } from "@/lib/taxonomy";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = origin();
  if (!base || process.env.STAGING !== "false") return [];
  const rows: MetadataRoute.Sitemap = [{ url: base + "/" }];
  const settings = await getSettings();
  if (settings.about_text.trim() && settings.operator_name.trim()) rows.push({ url: base + "/about/" });
  if (settings.contact_email) rows.push({ url: base + "/contact/" });
  const db = publicDb();
  if (!db) return rows;
  const categories = await getCategories();
  const assigned = new Set<string>();
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.from("article_categories")
      .select("article_id,category_id").order("article_id").order("category_id")
      .range(offset, offset + 999);
    if (error) throw Error("Sitemap category data unavailable");
    for (const row of data || []) assigned.add(row.category_id);
    if (!data || data.length < 1000) break;
  }
  for (const c of categories)
    if (c.indexable && c.id && assigned.has(c.id))
      rows.push({ url: base + categoryHref(c) });
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.from("authors").select("id,slug,bio")
      .order("id").range(offset, offset + 999);
    if (error) throw Error("Sitemap author data unavailable");
    // Public author RLS only returns people with an eligible published article.
    for (const author of data || []) if (author.bio.trim())
      rows.push({ url: `${base}/authors/${author.slug}/` });
    if (!data || data.length < 1000) break;
  }
  let from = 0;
  for (;;) {
    const { data, error } = await db
      .from("articles")
      .select("slug,updated_at")
      .order("id")
      .range(from, from + 999);
    if (error) throw Error("Sitemap data unavailable");
    for (const a of data || [])
      rows.push({
        url: `${base}/articles/${a.slug}/`,
        lastModified: a.updated_at,
      });
    if (!data || data.length < 1000) break;
    from += 1000;
  }
  return rows;
}
