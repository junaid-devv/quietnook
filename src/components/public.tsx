import Link from "next/link";
import Image from "next/image";
import { Icon } from "./icon";
import { Logo } from "./logo";
import { ArticleIndex } from "./article-index";
import { origin } from "@/lib/data";
import { categoryHref, type Category, type Settings } from "@/lib/taxonomy";
import {
  type Article,
  type Block,
  headingId,
  PAGE_SIZE,
  bodyText,
} from "@/lib/content";
export function SearchForm({
  value = "",
  compact = false,
}: {
  value?: string;
  compact?: boolean;
}) {
  return (
    <form
      action="/search/"
      className={`search-form ${compact ? "compact" : ""}`}
      role="search"
    >
      <Icon name="search" />
      <label
        htmlFor={compact ? "query-page" : "query-hero"}
        className="sr-only"
      >
        Search home ideas
      </label>
      <input
        id={compact ? "query-page" : "query-hero"}
        name="q"
        placeholder="Search home ideas…"
        defaultValue={value}
        maxLength={200}
        type="search"
      />
      <button className="button" type="submit">
        Search
      </button>
    </form>
  );
}
export function SeasonCard({ category }: { category: Category }) {
  return (
    <Link href={categoryHref(category)} className="season-card">
      <div className="season-photo">
        {category.image ? (
          <Image
            src={category.image}
            alt=""
            fill
            sizes="(max-width: 760px) 145px, (max-width: 1100px) 24vw, (max-width: 1440px) 14vw, 174px"
          />
        ) : (
          <div className="season-fallback">
            <Icon name={category.icon} />
          </div>
        )}
      </div>
      <span>
        <Icon name={category.icon} />
        {category.name}
      </span>
    </Link>
  );
}
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {origin() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [{ label: "Home", href: "/" }, ...items].map(
                (x, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: x.label,
                  item: x.href ? `${origin()}${x.href}` : undefined,
                }),
              ),
            }).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <ol>
        <li>
          <Link href="/">Home</Link>
        </li>
        {items.map((x, i) => (
          <li key={i}>
            {x.href ? (
              <Link href={x.href}>{x.label}</Link>
            ) : (
              <span aria-current="page">{x.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function EmptyState({
  categories,
  search = false,
}: {
  categories: Category[];
  search?: boolean;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={search ? "search" : "plant"} />
      </span>
      <h2>
        {search ? "No guides found just yet." : "New guides are on the way."}
      </h2>
      <p>
        {search
          ? "Try a different search, or explore a favorite corner of home."
          : "In the meantime, find a little inspiration in the places and seasons you love."}
      </p>
      <div className="pill-links">
        {categories.slice(0, 4).map((c) => (
          <Link href={categoryHref(c)} key={c.slug}>
            {c.name}
            <span aria-hidden="true"> ↗</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
export function ArticleGrid({
  articles,
}: {
  articles: Pick<
    Article,
    "id" | "slug" | "title" | "excerpt" | "cover_media_id"
  >[];
}) {
  if (!articles.length) return null;
  return (
    <div className={`article-grid${articles.length === 1 ? " article-grid-single" : articles.length === 2 ? " article-grid-pair" : ""}`}>
      {articles.map((a) => (
        <article className="article-card" key={a.id}>
          <Link className="article-card-link" href={`/articles/${a.slug}/`}>
            <div className="article-card-photo">
            {a.cover_media_id ? (
              <img
                src={`/api/media/${a.cover_media_id}/`}
                alt=""
                width={640}
                height={440}
                loading="lazy"
              />
            ) : <span className="article-card-placeholder" aria-hidden="true"><Icon name="leaf" /></span>}
            </div>
            <div className="article-card-copy">
              <h3>{a.title}</h3>
              {a.excerpt && <p>{a.excerpt}</p>}
              <span className="article-card-cta">Read the guide <Icon name="arrow" /></span>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
export function Pagination({
  count,
  page,
  path,
  q = "",
}: {
  count: number;
  page: number;
  path: string;
  q?: string;
}) {
  const pages = Math.ceil(count / PAGE_SIZE);
  if (pages <= 1) return null;
  const url = (n: number) =>
    `${path}?${new URLSearchParams({ ...(q ? { q } : {}), page: String(n) })}`;
  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 && <Link href={url(page - 1)}>← Previous</Link>}
      <span>
        Page {page} of {pages}
      </span>
      {page < pages && <Link href={url(page + 1)}>Next →</Link>}
    </nav>
  );
}
export function ArticleBody({ body, excerpt }: { body: Block[]; excerpt?: string }) {
  // Group each numbered idea with its own image without changing stored content.
  const sections: { block: Block; index: number }[][] = [];
  let idea = false;
  body.forEach((block, index) => {
    // Preserve original block indexes so index links remain stable when a repeated lede is omitted.
    if (block.type === "paragraph" && excerpt && block.text.trim() === excerpt.trim()) return;
    if (block.type === "heading") {
      idea = /^\d+[.)]\s/.test(block.text);
      sections.push([{ block, index }]);
    } else if (idea && sections.length)
      sections[sections.length - 1].push({ block, index });
    else sections.push([{ block, index }]);
  });
  const render = (b: Block, i: number) => {
    switch (b.type) {
      case "paragraph":
        return <p key={i}>{b.text}</p>;
      case "heading":
        return b.level === 2 ? (
          <h2 id={headingId(b.text, i)} tabIndex={-1} key={i}>
            {b.text}
          </h2>
        ) : (
          <h3 id={headingId(b.text, i)} tabIndex={-1} key={i}>
            {b.text}
          </h3>
        );
      case "list":
        return b.ordered ? (
          <ol key={i}>
            {b.items.map((t, j) => (
              <li key={j}>{t}</li>
            ))}
          </ol>
        ) : (
          <ul key={i}>
            {b.items.map((t, j) => (
              <li key={j}>{t}</li>
            ))}
          </ul>
        );
      case "link":
        return (
          <p key={i}>
            <a href={b.url} rel="noopener noreferrer">
              {b.text}
            </a>
          </p>
        );
      case "image":
        return (
          <figure key={i}>
            <img
              className={b.width && b.width === b.height ? "square-image" : undefined}
              src={`/api/media/${b.media_id}/`}
              alt={b.alt}
              loading="lazy"
              width={b.width || 900}
              height={b.height || 600}
            />
            {b.caption && <figcaption>{b.caption}</figcaption>}
          </figure>
        );
      case "embed":
        return (
          <figure key={i}>
            <iframe
              title={b.caption || `${b.provider} video`}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              allowFullScreen
              src={
                b.provider === "youtube"
                  ? `https://www.youtube-nocookie.com/embed/${b.id}`
                  : `https://player.vimeo.com/video/${b.id}`
              }
            />
            {b.caption && <figcaption>{b.caption}</figcaption>}
          </figure>
        );
    }
  };
  return (
    <div className="article-body">
      {sections.map((section) => {
        const illustrated =
          section[0].block.type === "heading" &&
          /^\d+[.)]\s/.test(section[0].block.text) &&
          section.some((x) => x.block.type === "image");
        if (!illustrated)
          return section.map(({ block, index }) => render(block, index));
        return (
          <section className="article-idea" key={section[0].index}>
            {render(section[0].block, section[0].index)}
            <div className="article-idea-images">
              {section
                .filter((x) => x.block.type === "image")
                .map(({ block, index }) => render(block, index))}
            </div>
            <div className="article-idea-copy">
              {section
                .slice(1)
                .filter((x) => x.block.type !== "image")
                .map(({ block, index }) => render(block, index))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
export function ArticleView({
  article,
  preview = false,
  timezone = "America/New_York",
}: {
  article: Article;
  preview?: boolean;
  timezone?: string;
}) {
  const headings = article.body
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => b.type === "heading");
  const words = bodyText(article.body).split(/\s+/).filter(Boolean).length;
  return (
    <article className="article-page">
      <Breadcrumbs items={[{ label: article.title }]} />
      {preview && (
        <p className="notice">Private draft preview · not indexed or shared</p>
      )}
      <div className="article-masthead">
        <div className="article-masthead-copy">
          <h1>{article.title}</h1>
          {article.excerpt && <p className="lede">{article.excerpt}</p>}
          <div className="byline">
            {article.authors && (
              <Link href={`/authors/${article.authors.slug}/`}>
                By {article.authors.name}
              </Link>
            )}
            {article.publish_at && (
              <time dateTime={article.publish_at}>
                {new Date(article.publish_at).toLocaleDateString("en-US", {
                  timeZone: timezone,
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
            {words > 0 && (
              <span>{Math.max(1, Math.ceil(words / 200))} min read</span>
            )}
            {article.publish_at &&
              article.updated_at.slice(0, 10) >
                article.publish_at.slice(0, 10) && (
                <time dateTime={article.updated_at}>
                  Updated{" "}
                  {new Date(article.updated_at).toLocaleDateString("en-US", {
                    timeZone: timezone,
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              )}
          </div>
        </div>
        {article.cover_media_id && (
          <img
            className="article-cover"
            src={`/api/media/${article.cover_media_id}/`}
            alt={article.cover_media?.alt || ""}
            width={article.cover_media?.width || 1200}
            height={article.cover_media?.height || 800}
            style={{
              objectPosition: `${article.cover_media?.focal_x ?? 50}% ${article.cover_media?.focal_y ?? 50}%`,
            }}
          />
        )}
      </div>
      <div className="article-content-layout">
        <ArticleIndex items={headings.flatMap(({ b, i }) => b.type === "heading" ? [{ id: headingId(b.text, i), text: b.text }] : [])} />
        <ArticleBody body={article.body} excerpt={article.excerpt} />
      </div>
    </article>
  );
}
export function Footer({
  categories,
  settings,
}: {
  categories: Category[];
  settings: Settings;
}) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Logo />
        </div>
        <div>
          <h2>Make yourself at home</h2>
          {categories
            .filter((c) => c.kind === "topic")
            .map((c) => (
              <Link href={categoryHref(c)} key={c.slug}>
                {c.name}
              </Link>
            ))}
        </div>
        <div>
          <h2>Around here</h2>
          <Link href="/rooms/">Explore the rooms</Link>
          <Link href="/seasons/">Seasons & holidays</Link>
          <Link href="/about/">About quietnook</Link>
          <Link href="/contact/">Contact</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} quietnook</span>
        <div>
          {settings.privacy_text && (
            <Link href="/privacy/">Privacy Policy</Link>
          )}
          {settings.terms_text && <Link href="/terms/">Terms of Use</Link>}
          {settings.affiliate_text && (
            <Link href="/affiliate-disclosure/">Affiliate disclosure</Link>
          )}
          {settings.social_links.map((s) => (
            <a key={s.url} href={s.url} rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
