import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getSettings, getArticles } from "@/lib/data";
import { categoryHref } from "@/lib/taxonomy";
import { collectionTitles } from "@/lib/collections";
import { pageNumber } from "@/lib/content";
import {
  CategoryLanding,
  RoomDirectory,
  SeasonDirectory,
} from "@/components/collections";
import { AboutPage, ContactPage } from "@/components/information";
import { PolicyPage } from "@/components/policy";
import { pageMetadata, categoryTitles } from "@/lib/seo";
type Props = {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<{ page?: string | string[] }>;
};
async function resolve(path: string[]) {
  const categories = await getCategories();
  const category = categories.find((c) =>
    c.kind === "topic"
      ? path.length === 1 && c.slug === path[0]
      : path.length === 2 &&
        path[0] === (c.kind === "room" ? "rooms" : "seasons") &&
        c.slug === path[1],
  );
  return { categories, category };
}
const titles: Record<string, string> = {
  rooms: "Room Decorating Ideas",
  seasons: "Seasonal & Holiday Decor Ideas",
  about: "About quietnook",
  contact: "Contact",
  privacy: "Privacy",
  terms: "Terms of Use",
  "affiliate-disclosure": "Affiliate Disclosure",
};
export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { path } = await params;
  const { category } = await resolve(path);
  const page = pageNumber((await searchParams).page);
  const { count, articles } = category
    ? await getArticles({ category: category.slug, page })
    : { count: 0, articles: [] };
  const settings = await getSettings();
  const indexable =
    !!category?.indexable &&
    count > 0 && articles.length > 0;
  const descriptions: Record<string, string> = {
    rooms: "Browse quietnook by room, from living rooms and bedrooms to kitchens, bathrooms, and balconies.",
    seasons: "Explore seasonal and holiday decorating at quietnook, from spring and summer to fall, winter, and celebrations.",
    about: "Meet quietnook, a publication about approachable decorating, small-space living, organization, DIY, and the seasons at home.",
    contact: "Contact quietnook with a question or suggestion about home decorating, small spaces, organization, or seasonal ideas.",
    privacy: "Privacy information for quietnook.",
    terms: "Terms of use for quietnook.",
    "affiliate-disclosure": "Information about affiliate relationships at quietnook.",
  };
  const infoIndexable = path.length === 1 && (
    (path[0] === "about" && !!settings.about_text.trim() && !!settings.operator_name.trim()) ||
    (path[0] === "contact" && !!settings.contact_email)
  );
  return pageMetadata({
    title: category
      ? category.seo_title || categoryTitles[category.slug] || collectionTitles[category.slug] || category.name
      : titles[path[0]] || "Page not found",
    description: category ? category.seo_description || `${category.description} ${count ? "Browse published guides at quietnook." : "New guides are on the way at quietnook."}` : descriptions[path[0]] || "This page could not be found.",
    path: category ? categoryHref(category) : `/${path.join("/")}/`,
    indexable: indexable || infoIndexable, page: category ? page : 1,
    image: category?.image || undefined,
  });
}
export default async function Hub({ params, searchParams }: Props) {
  const { path } = await params;
  const { category, categories } = await resolve(path);
  if (category) {
    const page = pageNumber((await searchParams).page);
    const { articles, count } = await getArticles({
      category: category.slug,
      page,
    });
    return (
      <CategoryLanding
        category={category}
        categories={categories}
        articles={articles}
        count={count}
        page={page}
      />
    );
  }
  if (path.length !== 1) notFound();
  if (path[0] === "rooms") return <RoomDirectory categories={categories} />;
  if (path[0] === "seasons") return <SeasonDirectory categories={categories} />;
  const settings = await getSettings();
  if (path[0] === "about")
    return <AboutPage settings={settings} categories={categories} />;
  if (path[0] === "contact")
    return <ContactPage settings={settings} categories={categories} />;
  const policies: Record<string, string> = {
    privacy: settings.privacy_text,
    terms: settings.terms_text,
    "affiliate-disclosure": settings.affiliate_text,
  };
  if (path[0] in policies && policies[path[0]].trim())
    return (
      <PolicyPage title={titles[path[0]]} text={policies[path[0]]} contact={settings.contact_email} />
    );
  notFound();
}
