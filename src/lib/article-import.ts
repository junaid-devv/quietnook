import type { Block } from "./content";

export type ImageSlot = { blockIndex: number; filename: string; alt: string };
export type ParsedArticle = {
  title: string;
  slug: string;
  excerpt: string;
  seo_title: string;
  seo_description: string;
  body: Block[];
  images: ImageSlot[];
};
const plain = (s: string) =>
  s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .trim();
export const filenameKey = (s: string) =>
  s
    .split(/[\\/]/)
    .pop()!
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
export function matchImage(
  filename: string,
  files: { name: string }[],
  position?: number,
): string {
  const matches = files.filter(
    (f) => filenameKey(f.name) === filenameKey(filename),
  );
  if (matches.length) return matches.length === 1 ? matches[0].name : "";
  if (position) {
    const numbered = files.filter((f) => {
      const number = f.name.match(
        /^(?:[a-z]+\d+[-_\s]+)?0*(\d{1,2})(?=[-_\s.]|$)/i,
      );
      return number && Number(number[1]) === position;
    });
    if (numbered.length === 1) return numbered[0].name;
  }
  return "";
}
export function parseArticleMarkdown(markdown: string): ParsedArticle {
  if (markdown.length > 2_000_000)
    throw Error("Choose a Markdown article smaller than 2 MB.");
  const text = markdown.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const boundary = text.search(
    /^##\s+(?:Publishing Package|Pinterest pin options)\s*$/im,
  );
  const editorial = boundary < 0 ? text : text.slice(0, boundary);
  const pack = boundary < 0 ? "" : text.slice(boundary);
  const metadata = (label: string) =>
    plain(
      pack.match(
        new RegExp(
          "^[-*]\\s*\\*\\*" + label + "(?:[^:*]*):\\*\\*\\s*(.+)$",
          "im",
        ),
      )?.[1] || "",
    );
  const title = plain(editorial.match(/^#\s+(.+)$/m)?.[1] || "");
  if (!title)
    throw Error("Start the article with a title: # Your article title");
  const body: Block[] = [];
  const images: ImageSlot[] = [];
  let numbered: string | null = null;
  let hasImage = false;
  const image = (filename: string, alt: string) => {
    const blockIndex = body.length;
    body.push({
      type: "image",
      media_id: "",
      alt: plain(alt) || numbered || "Article illustration",
      caption: "",
    });
    images.push({
      blockIndex,
      filename,
      alt: plain(alt) || numbered || "Article illustration",
    });
    hasImage = true;
  };
  const finishIdea = () => {
    if (numbered && !hasImage)
      image(
        numbered
          .replace(/^\d+[.)]\s*/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-") + ".jpg",
        numbered.replace(/^\d+[.)]\s*/, ""),
      );
  };
  for (const chunk of editorial.trim().split(/\n\s*\n/)) {
    if (/^#\s/.test(chunk)) continue;
    const heading = chunk.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      finishIdea();
      numbered = /^\d+[.)]\s/.test(heading[2]) ? plain(heading[2]) : null;
      hasImage = false;
      body.push({
        type: "heading",
        level: heading[1].length as 2 | 3,
        text: plain(heading[2]),
      });
      continue;
    }
    const marker =
      chunk.match(/^\*Image:\s*(.+?)\s*·\s*Alt:\s*(.+)\*$/s) ||
      chunk.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (marker) {
      if (chunk.startsWith("!")) image(marker[2], marker[1]);
      else image(marker[1], marker[2]);
      continue;
    }
    if (/^(?:[-*]\s|\d+\.\s)/.test(chunk)) {
      body.push({
        type: "list",
        ordered: /^\d+\./.test(chunk),
        items: chunk
          .split("\n")
          .map((s) => plain(s.replace(/^(?:[-*]|\d+\.)\s+/, ""))),
      });
      continue;
    }
    const faq = chunk.match(/^\*\*(.+?\?)\*\*\s*(.+)$/s);
    if (faq) {
      finishIdea();
      numbered = null;
      body.push(
        { type: "heading", level: 3, text: plain(faq[1]) },
        { type: "paragraph", text: plain(faq[2]) },
      );
      continue;
    }
    body.push({ type: "paragraph", text: plain(chunk) });
  }
  finishIdea();
  if (body.length > 400 || images.length > 80)
    throw Error("Article exceeds the limit of 400 blocks or 80 images.");
  const excerpt = body.find((b) => b.type === "paragraph");
  return {
    title,
    slug:
      metadata("Slug")
        .replace(/^\/+|\/+$/g, "")
        .split("/")
        .pop() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    excerpt: excerpt?.type === "paragraph" ? excerpt.text.slice(0, 500) : "",
    seo_title: metadata("SEO title") || title,
    seo_description: metadata("Meta description"),
    body,
    images,
  };
}
