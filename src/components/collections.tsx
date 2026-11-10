import Image from "next/image";
import Link from "next/link";
import { categoryHref, type Category } from "@/lib/taxonomy";
import {
  collectionPhoto,
  collectionTitles,
  topicLayouts,
  seasonGroups,
} from "@/lib/collections";
import { type Article } from "@/lib/content";
import { Breadcrumbs, ArticleGrid, Pagination } from "./public";
import { Icon } from "./icon";
export function CollectionCard({
  category,
  sizes = "(max-width:760px) 45vw, 30vw",
  headingLevel = 3,
}: {
  category: Category;
  sizes?: string;
  headingLevel?: 2 | 3;
}) {
  const photo = collectionPhoto(category);
  const Title = headingLevel === 2 ? "h2" : "h3";
  return (
    <Link href={categoryHref(category)} className="collection-card">
      <div className="collection-photo">
        <Image src={photo.src} alt="" fill sizes={sizes} />
      </div>
      <div className="collection-card-label">
        <Title className="collection-title">{category.name}</Title>
        <Icon name="arrow" />
      </div>
    </Link>
  );
}
export function CollectionShelf({
  title,
  items,
  href,
  label = "View all",
  id,
}: {
  title: string;
  items: Category[];
  href?: string;
  label?: string;
  id?: string;
}) {
  return (
    <section className="collection-section" id={id}>
      <div className="collection-section-heading">
        <h2>{title}</h2>
        {href && (
          <Link className="text-link" href={href}>
            {label}
            <Icon name="arrow" />
          </Link>
        )}
      </div>
      <div
        className={`collection-grid collection-grid-${Math.min(items.length, 5)}`}
      >
        {items.map((c, index) => (
          <CollectionCard
            category={c}
            key={c.slug}
            sizes={`(max-width:760px) ${items.length % 2 === 1 && index === items.length - 1 ? 92 : 45}vw, ${Math.round(90 / Math.max(1, items.length))}vw`}
          />
        ))}
      </div>
    </section>
  );
}
export function CollectionFeature({
  category,
  title,
  copy,
}: {
  category: Category;
  title: string;
  copy: string;
}) {
  const photo = collectionPhoto(category);
  return (
    <section className="collection-feature">
      <div className="feature-photo">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width:760px) 42vw, (max-width:1440px) 46vw, 650px"
        />
      </div>
      <div className="feature-copy">
        <h2>{title}</h2>
        <p>{copy}</p>
        <Link href={categoryHref(category)} className="text-link">
          Explore {category.name.toLowerCase()}
          <Icon name="arrow" />
        </Link>
      </div>
    </section>
  );
}
export function GuideListing({
  articles,
  count,
  page,
  category,
}: {
  articles: Article[];
  count: number;
  page: number;
  category: Category;
}) {
  if (!count)
    return (
      <p className="collection-availability">New guides are on the way.</p>
    );
  return (
    <section className="collection-section guide-listing" id="guides">
      <div className="collection-section-heading">
        <h2>Latest guides</h2>
      </div>
      {articles.length > 0 ? (
        <ArticleGrid articles={articles} />
      ) : (
        <p>No guides on this page.</p>
      )}
      <Pagination count={count} page={page} path={categoryHref(category)} />
    </section>
  );
}
export function CategoryLanding({
  category,
  categories,
  articles,
  count,
  page,
}: {
  category: Category;
  categories: Category[];
  articles: Article[];
  count: number;
  page: number;
}) {
  const photo = collectionPhoto(category);
  const config = topicLayouts[category.slug];
  const rooms = categories.filter((c) => c.kind === "room");
  const topics = categories.filter((c) => c.kind === "topic");
  const chosen = (slugs: string[]) =>
    slugs
      .map((s) => categories.find((c) => c.slug === s))
      .filter((c): c is Category => !!c);
  const breadcrumbs = [
    ...(category.kind !== "topic"
      ? [
          {
            label: category.kind === "room" ? "Rooms" : "Seasons & Holidays",
            href: category.kind === "room" ? "/rooms/" : "/seasons/",
          },
        ]
      : []),
    { label: category.name },
  ];
  const relatedSeasons = chosen(
    category.kind === "season"
      ? seasonGroups
          .find((g) => g.slugs.includes(category.slug))
          ?.slugs.filter((s) => s !== category.slug) || []
      : ["fall", "christmas", "spring"],
  );
  return (
    <div
      className={`collection-page collection-${category.kind} collection-${category.slug}`}
    >
      <div className="collection-container">
        <Breadcrumbs items={breadcrumbs} />
        <section className="collection-hero">
          <div className="collection-hero-copy">
            <h1>{collectionTitles[category.slug] || category.name}</h1>
            <p>{config?.intro || category.description}</p>
            <a className="button" href={count > 0 ? "#guides" : "#browse"}>
              {count > 0 ? "Browse the guides" : category.kind === "room"
                ? "Explore the room"
                : category.kind === "season"
                  ? "Explore the season"
                  : "Find your inspiration"}
              <Icon name="arrow" />
            </a>
          </div>
          <div className="collection-hero-photo">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width:760px) 100vw, 55vw"
            />
          </div>
        </section>
        {count > 0 && <GuideListing articles={articles} count={count} page={page} category={category} />}
        {category.kind === "topic" ? (
          <>
            <CollectionShelf
              id="browse"
              title={config?.browse || "Explore by room"}
              items={config ? chosen(config.rooms) : rooms}
              href="/rooms/"
              label="All rooms"
            />
            {config &&
              categories.find((c) => c.slug === config.featureSlug) && (
                <CollectionFeature
                  category={categories.find(
                    (c) => c.slug === config.featureSlug,
                  )!}
                  title={config.feature}
                  copy={config.featureCopy}
                />
              )}
            <CollectionShelf
              title={
                category.slug === "diy-projects"
                  ? "Make it seasonal"
                  : "A seasonal touch"
              }
              items={chosen(["christmas", "fall", "spring"])}
              href="/seasons/"
              label="Every season"
            />
          </>
        ) : category.kind === "room" ? (
          <>
            <nav className="collection-tabs" aria-label="Explore rooms">
              {rooms.map((c) => (
                <Link
                  href={categoryHref(c)}
                  aria-current={c.slug === category.slug ? "page" : undefined}
                  key={c.slug}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
            <CollectionShelf id="browse" title="Make it yours" items={topics} />
            <CollectionShelf
              title="Bring the season home"
              items={relatedSeasons}
              href="/seasons/"
              label="Every season"
            />
          </>
        ) : (
          <>
            <CollectionShelf
              id="browse"
              title="Bring it into your home"
              items={rooms.slice(0, 3)}
              href="/rooms/"
              label="All rooms"
            />
            {relatedSeasons.length > 0 && (
              <CollectionShelf
                title="Around this season"
                items={relatedSeasons}
                href="/seasons/"
                label="All seasons"
              />
            )}
            <div className="season-topic-links">
              {topics.map((c) => (
                <Link href={categoryHref(c)} key={c.slug}>
                  <Icon name={c.icon} />
                  <span>{c.name}</span>
                  <Icon name="arrow" />
                </Link>
              ))}
            </div>
          </>
        )}
        {count === 0 && <GuideListing
          articles={articles}
          count={count}
          page={page}
          category={category}
        />}
      </div>
    </div>
  );
}
export function RoomDirectory({ categories }: { categories: Category[] }) {
  const rooms = categories.filter((c) => c.kind === "room");
  const topics = categories.filter((c) => c.kind === "topic");
  return (
    <div className="collection-container directory-page">
      <Breadcrumbs items={[{ label: "Rooms" }]} />
      <header className="directory-heading">
        <h1>
          A Little Inspiration <br />
          for Every Room
        </h1>
        <p>Choose a space. Make it feel like home.</p>
      </header>
      <div className="room-mosaic">
        {rooms.map((c, i) => (
          <CollectionCard
            category={
              i === 0 && c.slug === "living-room"
                ? { ...c, image: "/images/hero.webp" }
                : c
            }
            headingLevel={2}
            sizes={
              i === 0
                ? "(max-width:760px) 45vw, 90vw"
                : i === rooms.length - 1 && rooms.length % 2 === 1
                  ? "(max-width:760px) 92vw, 45vw"
                  : "45vw"
            }
            key={c.slug}
          />
        ))}
      </div>
      <CollectionShelf title="Your room. Your way." items={topics} />
    </div>
  );
}
export function SeasonDirectory({ categories }: { categories: Category[] }) {
  const seasons = categories.filter((c) => c.kind === "season");
  return (
    <div className="collection-container directory-page">
      <Breadcrumbs items={[{ label: "Seasons & Holidays" }]} />
      <header className="season-directory-heading">
        <div>
          <h1>
            Explore Every <br />
            Season & Holiday
          </h1>
          <p>A fresh feeling for every time of year.</p>
        </div>
        <div className="season-directory-photo">
          <Image
            src="/images/fall.webp"
            alt="Autumn leaves and pumpkins arranged at home."
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width:760px) 90vw, 35vw"
          />
        </div>
      </header>
      <nav className="collection-tabs season-tabs" aria-label="Browse seasons">
        {seasonGroups.map((g) => (
          <a href={`#${g.id}`} key={g.id}>
            {g.name}
            <Icon name="arrow" />
          </a>
        ))}
      </nav>
      {seasonGroups.map((g) => (
        <CollectionShelf
          key={g.id}
          id={g.id}
          title={g.name}
          items={g.slugs
            .map((slug) => seasons.find((c) => c.slug === slug))
            .filter((c): c is Category => !!c)}
        />
      ))}
    </div>
  );
}
export function SearchBrowse({ categories }: { categories: Category[] }) {
  return (
    <CollectionShelf
      title="Or explore a room"
      items={categories.filter((c) => c.kind === "room")}
      href="/seasons/"
      label="Browse seasons"
    />
  );
}
