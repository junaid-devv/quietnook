import type { Category } from "./taxonomy";
export const collectionPhotos: Record<string, { src: string; alt: string }> = {
  "living-room": {
    src: "/images/living-room.webp",
    alt: "A cream sofa, warm wood furniture, and leafy plants in a sunlit living room.",
  },
  bedroom: {
    src: "/images/bedroom.webp",
    alt: "A linen-covered bed with soft green accents and an oak bedside table.",
  },
  kitchen: {
    src: "/images/kitchen.webp",
    alt: "A cream kitchen with open oak shelves, stoneware, and woven storage baskets.",
  },
  bathroom: {
    src: "/images/bathroom.webp",
    alt: "An ivory bathroom with an oak washstand, round mirror, and folded towels.",
  },
  balcony: {
    src: "/images/balcony.webp",
    alt: "A small balcony with woven chairs, plants, and a bistro table.",
  },
  "diy-projects": {
    src: "/images/diy-projects.webp",
    alt: "Paintbrushes, a wood frame, twine, and pottery on a sunlit craft table.",
  },
  "decor-ideas": {
    src: "/images/living-room.webp",
    alt: "A welcoming living room with cream upholstery and warm wood.",
  },
  "small-spaces": {
    src: "/images/balcony.webp",
    alt: "A compact balcony arranged with two chairs and a small table.",
  },
  organization: {
    src: "/images/kitchen.webp",
    alt: "An orderly kitchen with stoneware, baskets, and open shelving.",
  },
};
export function collectionPhoto(category: Category) {
  if (category.image)
    return {
      src: category.image,
      alt:
        collectionPhotos[category.slug]?.alt ||
        `${category.name} decor in a warm home setting.`,
    };
  return (
    collectionPhotos[category.slug] || {
      src: "/images/hero.webp",
      alt: "A cozy cream sofa with rust cushions and greenery.",
    }
  );
}
export const collectionTitles: Record<string, string> = {
  "decor-ideas": "Home Decor Ideas",
  "small-spaces": "Make the Most of Your Small Space",
  organization: "Home Organization Ideas",
  "diy-projects": "DIY Home Decor & Projects",
  "living-room": "Living Room Decorating Ideas",
  bedroom: "Bedroom Decorating Ideas",
  kitchen: "Kitchen Decor & Organization Ideas",
  bathroom: "Bathroom Decor & Organization Ideas",
  balcony: "Balcony Decorating Ideas",
  christmas: "Christmas Decorating Ideas",
  halloween: "Halloween Decorating Ideas",
  fall: "Fall Decorating Ideas",
  "new-years-eve": "New Year’s Eve Decor Ideas",
  "valentines-day": "Valentine’s Day Decor Ideas",
  spring: "Spring Decorating Ideas",
  summer: "Summer Decorating Ideas",
  winter: "Winter Decorating Ideas",
  thanksgiving: "Thanksgiving Decorating Ideas",
  easter: "Easter Decorating Ideas",
  "fourth-of-july": "Fourth of July Decor Ideas",
};
export const topicLayouts: Record<
  string,
  {
    intro: string;
    browse: string;
    feature: string;
    featureCopy: string;
    featureSlug: string;
    rooms: string[];
  }
> = {
  "decor-ideas": {
    intro: "Warm textures. Thoughtful details. A home that feels like you.",
    browse: "Start with your room",
    feature: "A little room. A lot of possibility.",
    featureCopy: "Find the corners that make a home your own.",
    featureSlug: "small-spaces",
    rooms: ["living-room", "bedroom", "kitchen", "bathroom", "balcony"],
  },
  "small-spaces": {
    intro: "Comfort, character, and room for everyday life.",
    browse: "Find your corner",
    feature: "Make space for a calmer home.",
    featureCopy: "Explore organization, one room at a time.",
    featureSlug: "organization",
    rooms: ["bedroom", "living-room", "balcony", "kitchen", "bathroom"],
  },
  organization: {
    intro: "Less visual noise. More room to live.",
    browse: "Organization by room",
    feature: "Small spaces, thoughtfully considered.",
    featureCopy: "A fresh perspective on the space you have.",
    featureSlug: "small-spaces",
    rooms: ["kitchen", "bathroom", "bedroom", "living-room", "balcony"],
  },
  "diy-projects": {
    intro: "Natural materials. Personal details. Something made by you.",
    browse: "Choose a space to make your own",
    feature: "A new season, a fresh perspective.",
    featureCopy: "Find a little inspiration for every celebration.",
    featureSlug: "fall",
    rooms: ["living-room", "bedroom", "balcony", "kitchen", "bathroom"],
  },
};
export const seasonGroups = [
  { name: "Spring", id: "spring", slugs: ["spring", "easter"] },
  { name: "Summer", id: "summer", slugs: ["summer", "fourth-of-july"] },
  { name: "Fall", id: "fall", slugs: ["fall", "halloween", "thanksgiving"] },
  {
    name: "Winter",
    id: "winter",
    slugs: ["winter", "christmas", "new-years-eve", "valentines-day"],
  },
];
