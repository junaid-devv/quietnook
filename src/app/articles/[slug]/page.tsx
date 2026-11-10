import { notFound, permanentRedirect } from "next/navigation";
import {
  getArticle,
  getArticles,
  getCategories,
  getSettings,
  origin,
} from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { publicDb } from "@/lib/supabase";
import { ArticleView, ArticleGrid } from "@/components/public";
import { blockSchema } from "@/lib/content";
import Link from "next/link";
import { categoryHref } from "@/lib/taxonomy";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const a = await getArticle((await params).slug);
  if (!a) return { title: "Page not found", robots: { index: false } };
  return pageMetadata({
    title: a.seo_title || a.title,
    description: a.seo_description || a.excerpt,
    path: `/articles/${a.slug}/`,
    indexable: true,
    image: a.cover_media_id ? `/api/media/${a.cover_media_id}/` : undefined,
    article: {
      publishedTime: a.publish_at || undefined,
      modifiedTime: a.updated_at,
      author:
        a.authors && origin()
          ? `${origin()}/authors/${a.authors.slug}/`
          : undefined,
    },
  });
}
export default async function Article({ params }: Props) {
  const { slug } = await params;
  let a = await getArticle(slug);
  const db = publicDb();
  if (!a) {
    if (db) {
      const { data } = await db
        .from("redirects")
        .select("target_article_id")
        .eq("source_slug", slug)
        .maybeSingle();
      if (data) {
        const { data: target } = await db
          .from("articles")
          .select("slug")
          .eq("id", data.target_article_id)
          .maybeSingle();
        if (target) permanentRedirect(`/articles/${target.slug}/`);
      }
    }
    notFound();
  }
  const parsed = blockSchema.array().safeParse(a.body);
  if (!parsed.success) throw Error("Article body validation failed");
  a = { ...a, body: parsed.data };
  const { articles } = await getArticles();
  const related = articles.filter((x) => x.id !== a.id).slice(0, 3);
  const [cats, settings] = await Promise.all([getCategories(), getSettings()]);
  const { data: assignments } = db
    ? await db
        .from("article_categories")
        .select("category_id")
        .eq("article_id", a.id)
    : { data: [] };
  const assigned = cats.filter((c) =>
    assignments?.some((x) => x.category_id === c.id),
  );
  const base = origin();
  return (
    <>
      {base && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: a.title,
              description: a.seo_description || a.excerpt || undefined,
              wordCount:
                a.body_text?.split(/\s+/).filter(Boolean).length || undefined,
              inLanguage: "en-US",
              datePublished: a.publish_at,
              dateModified: a.updated_at,
              mainEntityOfPage: `${base}/articles/${a.slug}/`,
              author: a.authors
                ? {
                    "@type": "Person",
                    name: a.authors.name,
                    url: `${base}/authors/${a.authors.slug}/`,
                  }
                : undefined,
              publisher: {
                "@type": "Organization",
                name: "quietnook",
                url: base,
                logo: {
                  "@type": "ImageObject",
                  url: `${base}/brand/wordmark.png`,
                },
              },
              image: a.cover_media_id
                ? `${base}/api/media/${a.cover_media_id}/`
                : undefined,
            }).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <ArticleView article={a} timezone={settings.editorial_timezone} />
      <div className="article-page article-end">
        <div className="pill-links">
          {assigned.map((c) => (
            <Link key={c.slug} href={categoryHref(c)}>
              {c.name}
            </Link>
          ))}
        </div>
        {base && a.cover_media_id && (
          <a
            className="text-link"
            rel="noopener noreferrer"
            href={`https://www.pinterest.com/pin/create/button/?${new URLSearchParams({ url: `${base}/articles/${a.slug}/`, media: `${base}/api/media/${a.cover_media_id}/`, description: a.excerpt || a.title })}`}
          >
            Save this idea to Pinterest ↗
          </a>
        )}
      </div>
      {related.length > 0 && (
        <section className="section">
          <h2>A little more inspiration</h2>
          <ArticleGrid articles={related} />
        </section>
      )}
    </>
  );
}
