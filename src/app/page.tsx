import Image from "next/image";
import Link from "next/link";
import { getCategories, getSettings, getArticles, origin } from "@/lib/data";
import { categoryHref } from "@/lib/taxonomy";
import { Icon } from "@/components/icon";
import { Newsletter } from "@/components/newsletter";
import { SearchForm, SeasonCard, ArticleGrid } from "@/components/public";
import { CollectionShelf } from "@/components/collections";
import { pageMetadata, HOME_TITLE, HOME_DESCRIPTION } from "@/lib/seo";
export async function generateMetadata() {
  return pageMetadata({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: "/",
    indexable: true,
  });
}
export default async function Home() {
  const [categories, settings, { articles }] = await Promise.all([
    getCategories(),
    getSettings(),
    getArticles(),
  ]);
  const seasons = settings.season_order
    .map((slug) =>
      categories.find((c) => c.slug === slug && c.kind === "season"),
    )
    .filter((c) => !!c);
  const shortcuts = [
    "living-room",
    "bedroom",
    "kitchen",
    "bathroom",
    "balcony",
    "organization",
    "diy-projects",
  ]
    .map((s) => categories.find((c) => c.slug === s))
    .filter((c) => !!c);
  const base = origin();
  return (
    <>
      {base && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "quietnook",
                  url: base,
                  logo: `${base}/brand/wordmark.png`,
                },
                { "@type": "WebSite", name: "quietnook", url: base },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1 id="home-title">
              Cozy Home Ideas
              <br /> for <em>Every Season</em>
            </h1>
            <p className="hero-description">
              Decorating, organization, and seasonal inspiration for a home that
              feels like you.
            </p>
            <SearchForm />
          </div>
        </div>
        <div className="hero-image">
          {!settings.hero_image ||
          settings.hero_image === "/images/hero-nook.webp" ? (
            <picture>
              <source
                type="image/avif"
                srcSet="/images/hero-nook-480.avif 480w, /images/hero-nook-768.avif 768w, /images/hero-nook-1280.avif 1280w, /images/hero-nook-1536.avif 1536w"
                sizes="100vw"
              />
              <img
                src="/images/hero-nook-1280.webp"
                srcSet="/images/hero-nook-480.webp 480w, /images/hero-nook-768.webp 768w, /images/hero-nook-1280.webp 1280w, /images/hero-nook-1536.webp 1536w"
                sizes="100vw"
                alt={settings.hero_alt}
                width={1536}
                height={1024}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: settings.hero_focal,
                }}
              />
            </picture>
          ) : (
            <Image
              src={settings.hero_image || "/images/hero-nook.webp"}
              alt={settings.hero_alt}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              style={{ objectPosition: settings.hero_focal }}
            />
          )}
        </div>
        <svg
          className="hero-wave"
          aria-hidden="true"
          viewBox="0 0 1440 32"
          preserveAspectRatio="none"
        >
          <path
            d="M0 16C140-8 270 42 430 19S690 8 820 21s270-25 390-8 175 8 230-1V32H0Z"
            fill="currentColor"
          />
        </svg>
      </section>
      <section className="shortcuts" aria-label="Browse by room and topic">
        {shortcuts.map((c) => (
          <Link href={categoryHref(c)} key={c.slug}>
            <span>
              <Icon name={c.icon} />
            </span>
            {c.name}
          </Link>
        ))}
        <Link href="/seasons/">
          <span>
            <Icon name="leaf" />
          </span>
          Seasons & Holidays
        </Link>
      </section>
      <section className="section seasons-section">
        <div className="section-heading">
          <div>
            <h2>Explore by Season</h2>
          </div>
          <Link href="/seasons/" className="text-link">
            All seasons <Icon name="arrow" />
          </Link>
        </div>
        <div className="season-grid">
          {seasons.map((c) => (
            <SeasonCard category={c} key={c.slug} />
          ))}
        </div>
      </section>
      {articles.length > 0 && (
        <section
          className="section latest-ideas"
          aria-labelledby="latest-ideas-title"
        >
          <div className="section-heading">
            <h2 id="latest-ideas-title">Latest ideas</h2>
            <Link href="/search/" className="text-link">All guides <Icon name="arrow" /></Link>
          </div>
          <ArticleGrid articles={articles.slice(0, 6)} />
        </section>
      )}
      <div className="collection-container home-collections">
        <CollectionShelf
          title="Explore your home"
          items={settings.featured_categories
            .map((slug) => categories.find((c) => c.slug === slug))
            .filter((c) => !!c)}
          href="/rooms/"
          label="All rooms"
        />
      </div>
      {settings.newsletter_enabled &&
        settings.newsletter_privacy &&
        settings.privacy_text &&
        process.env.BUTTONDOWN_API_KEY &&
        process.env.NEWSLETTER_VERIFIED === "true" && (
          <Newsletter privacy={settings.newsletter_privacy} />
        )}
    </>
  );
}
