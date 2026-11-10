import { sitePages } from "./site-pages";
export type Category = {
  id?: string;
  slug: string;
  name: string;
  kind: "topic" | "room" | "season";
  description: string;
  icon: string;
  position: number;
  image?: string;
  indexable?: boolean;
  seo_title?: string;
  seo_description?: string;
};
export const categories: Category[] = [
  [
    "decor-ideas",
    "Decor Ideas",
    "topic",
    "Thoughtful touches, familiar textures, and room to make it yours.",
    "vase",
  ],
  [
    "small-spaces",
    "Small Spaces",
    "topic",
    "Make a little room for the things you love.",
    "house",
  ],
  [
    "organization",
    "Organization",
    "topic",
    "Simple systems for a calmer, more comfortable home.",
    "box",
  ],
  [
    "diy-projects",
    "DIY Projects",
    "topic",
    "Small projects with a personal touch.",
    "scissors",
  ],
  [
    "living-room",
    "Living Room",
    "room",
    "Comfortable corners for everyday living.",
    "sofa",
  ],
  [
    "bedroom",
    "Bedroom",
    "room",
    "A softer place to start and end the day.",
    "bed",
  ],
  [
    "kitchen",
    "Kitchen",
    "room",
    "Practical spaces with a little everyday warmth.",
    "pot",
  ],
  [
    "bathroom",
    "Bathroom",
    "room",
    "Thoughtful details for even the smallest room.",
    "bath",
  ],
  [
    "balcony",
    "Balcony",
    "room",
    "Fresh air and cozy corners, just outside your door.",
    "plant",
  ],
  [
    "christmas",
    "Christmas",
    "season",
    "Warm lights and thoughtful touches for the holiday season.",
    "snow",
  ],
  [
    "halloween",
    "Halloween",
    "season",
    "A little playful magic for your home.",
    "bat",
  ],
  [
    "fall",
    "Fall",
    "season",
    "Earthy colors, soft layers, and a slower pace.",
    "leaf",
  ],
  [
    "new-years-eve",
    "New Year’s Eve",
    "season",
    "Simple ways to welcome a fresh beginning.",
    "spark",
  ],
  [
    "valentines-day",
    "Valentine’s Day",
    "season",
    "Little details that come from the heart.",
    "heart",
  ],
  [
    "spring",
    "Spring",
    "season",
    "Fresh blooms and lighter days at home.",
    "flower",
  ],
  ["summer", "Summer", "season", "Easy living, indoors and out.", "sun"],
  ["winter", "Winter", "season", "Cozy layers for the colder months.", "snow"],
  [
    "thanksgiving",
    "Thanksgiving",
    "season",
    "A welcoming place to gather.",
    "leaf",
  ],
  [
    "easter",
    "Easter",
    "season",
    "Gentle color and a fresh start for the season.",
    "flower",
  ],
  [
    "fourth-of-july",
    "Fourth of July",
    "season",
    "Easy touches for a summer gathering.",
    "spark",
  ],
].map(([slug, name, kind, description, icon], position) => ({
  slug,
  name,
  kind: kind as Category["kind"],
  description,
  icon,
  position,
  image: `/images/${slug}.webp`,
  indexable: false,
}));
export const categoryHref = (c: Category) =>
  c.kind === "topic"
    ? `/${c.slug}/`
    : `/${c.kind === "room" ? "rooms" : "seasons"}/${c.slug}/`;
export const defaultSettings = {
  hero_image: "/images/hero-nook.webp",
  hero_alt:
    "A linen armchair with a knitted throw beside an oak table, a ceramic mug, and an olive-green vase.",
  hero_focal: "50% 50%",
  season_order: [
    "christmas",
    "halloween",
    "fall",
    "new-years-eve",
    "valentines-day",
    "spring",
    "summer",
  ],
  featured_categories: ["small-spaces", "bedroom", "organization"],
  editorial_timezone: "America/New_York",
  operator_name: "",
  contact_email: "quietnookk@gmail.com",
  ...sitePages,
  social_links: [] as { label: string; url: string }[],
  newsletter_enabled: false,
  newsletter_privacy: "",
  newsletter_endpoint: "",
  search_console_token: "",
  pinterest_token: "",
};
export type Settings = typeof defaultSettings;
