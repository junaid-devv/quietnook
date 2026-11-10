import { getArticles, getCategories } from "@/lib/data";
import { pageNumber } from "@/lib/content";
import {
  SearchForm,
  Breadcrumbs,
  ArticleGrid,
  Pagination,
} from "@/components/public";
import { SearchBrowse } from "@/components/collections";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Search home ideas",
  description: "Search quietnook for published home decorating, organization, small-space, DIY, and seasonal ideas.",
  path: "/search/", canonical: false,
});
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const p = await searchParams;
  const q = (typeof p.q === "string" ? p.q : "").trim().slice(0, 200);
  const page = pageNumber(p.page);
  const [{ articles, count }, categories] = await Promise.all([
    getArticles({ q, page }),
    getCategories(),
  ]);
  return (
    <div className="collection-container search-page">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <header className="search-heading">
        <h1>{q ? `Results for “${q}”` : "What feels like home?"}</h1>
        <SearchForm value={q} compact />
      </header>
      {count > 0 ? (
        <section className="collection-section">
          <p>
            {count} {count === 1 ? "guide" : "guides"} found
          </p>
          {articles.length ? (
            <ArticleGrid articles={articles} />
          ) : (
            <p>No guides on this page.</p>
          )}
          <Pagination count={count} page={page} path="/search/" q={q} />
        </section>
      ) : q ? (
        <p className="search-no-results">No guides match this search yet.</p>
      ) : null}
      <SearchBrowse categories={categories} />
    </div>
  );
}
