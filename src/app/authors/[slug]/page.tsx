import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicDb } from "@/lib/supabase";
import { Breadcrumbs, ArticleGrid, Pagination } from "@/components/public";
import { PAGE_SIZE, pageNumber } from "@/lib/content";
import { pageMetadata, publicOrigin, jsonLd } from "@/lib/seo";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};
const getAuthor = cache(async (slug: string) => {
  const db = publicDb();
  if (!db) return null;
  const { data, error } = await db
    .from("authors")
    .select("id,name,slug,bio")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw Error("Author information is temporarily unavailable");
  return data;
});
const authorListing = cache(async (id: string, page: number) => {
  const db = publicDb();
  if (!db) return { articles: [], count: 0 };
  const { data, count, error } = await db.from("articles")
    .select("id,title,slug,excerpt,cover_media_id", { count: "exact" })
    .eq("author_id", id).eq("status", "published")
    .lte("publish_at", new Date().toISOString())
    .order("publish_at", { ascending: false }).order("id")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (error) throw Error("This author's guides are temporarily unavailable");
  return { articles: data || [], count: count || 0 };
});
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const author = await getAuthor((await params).slug);
  if (!author) return { title: "Author not found", robots: { index: false } };
  const page = pageNumber((await searchParams).page);
  const { articles } = await authorListing(author.id, page);
  return pageMetadata({
    title: author ? `Ideas by ${author.name}` : "Author not found",
    description: author.bio || `Published guides by ${author.name} at quietnook.`,
    path: `/authors/${author.slug}/`, page,
    indexable: !!author.bio.trim() && articles.length > 0,
  });
}
export default async function Author({ params, searchParams }: Props) {
  const author = await getAuthor((await params).slug);
  const db = publicDb();
  if (!author || !db) notFound();
  const page = pageNumber((await searchParams).page);
  const { articles, count } = await authorListing(author.id, page);
  const base = publicOrigin();
  return (
    <div className="page-container">
      {base && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
        "@context": "https://schema.org", "@type": "ProfilePage",
        url: `${base}/authors/${author.slug}/`,
        mainEntity: { "@type": "Person", name: author.name, description: author.bio || undefined,
          url: `${base}/authors/${author.slug}/` },
      }) }} />}
      <Breadcrumbs items={[{ label: author.name }]} />
      <div className="page-heading">
        <h1>{author.name}</h1>
        {author.bio && <p className="lede">{author.bio}</p>}
      </div>
      {articles?.length ? (
        <ArticleGrid articles={articles} />
      ) : (
        <div className="empty-state">
          <h2>No guides on this page.</h2>
        </div>
      )}
      <Pagination
        count={count || 0}
        page={page}
        path={`/authors/${author.slug}/`}
      />
    </div>
  );
}
