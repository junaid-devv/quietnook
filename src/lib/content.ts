import { z } from "zod";
export const safeUrl = (value: string) => {
  try {
    const u = new URL(value);
    return (
      ["https:", "http:"].includes(u.protocol) && !u.username && !u.password
    );
  } catch {
    return false;
  }
};
const text = z.string().max(30000);
export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text }),
  z.object({
    type: z.literal("heading"),
    text,
    level: z.union([z.literal(2), z.literal(3)]),
  }),
  z.object({
    type: z.literal("list"),
    items: z.array(z.string().max(3000)).max(100),
    ordered: z.boolean(),
  }),
  z.object({
    type: z.literal("link"),
    text,
    url: z.string().refine(safeUrl, "Use a full http or https URL"),
  }),
  z.object({
    type: z.literal("image"),
    media_id: z.uuid(),
    alt: z.string().min(1).max(500),
    caption: z.string().max(1000),
    width: z.number().int().positive().max(10000).optional(),
    height: z.number().int().positive().max(10000).optional(),
  }),
  z.object({
    type: z.literal("embed"),
    provider: z.enum(["youtube", "vimeo"]),
    id: z.string().regex(/^[A-Za-z0-9_-]{1,30}$/),
    caption: z.string().max(500),
  }),
]);
export const articleSchema = z
  .object({
    id: z.uuid().optional(),
    title: z.string().trim().min(1).max(200),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(150),
    excerpt: z.string().max(500),
    body: z.array(blockSchema).max(400),
    status: z.enum(["draft", "scheduled", "published"]),
    author_id: z.uuid().nullable(),
    cover_media_id: z.uuid().nullable(),
    publish_at: z.iso.datetime().nullable(),
    seo_title: z.string().max(250),
    seo_description: z.string().max(500),
    category_ids: z.array(z.uuid()).max(30),
  })
  .superRefine((a, ctx) => {
    if (
      a.status !== "draft" &&
      (!a.author_id || !a.publish_at || !a.body.length)
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Publishing and scheduling require an author, publication time, and body.",
      });
    if (
      a.status === "scheduled" &&
      a.publish_at &&
      Date.parse(a.publish_at) <= Date.now()
    )
      ctx.addIssue({
        code: "custom",
        message: "Scheduled publication must be in the future.",
      });
    if (
      a.status === "published" &&
      a.publish_at &&
      Date.parse(a.publish_at) > Date.now()
    )
      ctx.addIssue({
        code: "custom",
        message: "Choose scheduled for future publication.",
      });
  });
export type Block = z.infer<typeof blockSchema>;
export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: Block[];
  status: "draft" | "scheduled" | "published";
  author_id: string | null;
  cover_media_id: string | null;
  cover_media?: {
    alt: string;
    width: number;
    height: number;
    focal_x: number;
    focal_y: number;
  } | null;
  publish_at: string | null;
  updated_at: string;
  seo_title: string;
  seo_description: string;
  body_text?: string;
  authors?: { name: string; slug: string; bio: string } | null;
  category_ids?: string[];
};
export function eligible(
  a: Pick<Article, "status" | "publish_at">,
  now = Date.now(),
) {
  return (
    a.status === "published" &&
    !!a.publish_at &&
    Date.parse(a.publish_at) <= now
  );
}
export function bodyText(body: Block[]) {
  return body
    .map((b) =>
      "text" in b ? b.text : b.type === "list" ? b.items.join(" ") : b.caption,
    )
    .join(" ");
}
export function headingId(text: string, index: number) {
  return `${
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "section"
  }-${index}`;
}
export const PAGE_SIZE = 12;
export function pageNumber(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return 1;
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(10000, Math.max(1, Math.floor(number)))
    : 1;
}
