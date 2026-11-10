import { getArticles, origin } from "@/lib/data";
export const dynamic = "force-dynamic";
const xml = (s: string) =>
  s.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
export async function GET() {
  const base = origin();
  if (!base || process.env.STAGING !== "false")
    return new Response("Feed unavailable before launch", { status: 404 });
  const { articles } = await getArticles();
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>quietnook</title><link>${base}/</link><description>Ideas for every season of home.</description>${articles.map((a) => `<item><title>${xml(a.title)}</title><link>${base}/articles/${a.slug}/</link><guid>${base}/articles/${a.slug}/</guid><description>${xml(a.excerpt)}</description><pubDate>${new Date(a.publish_at!).toUTCString()}</pubDate></item>`).join("")}</channel></rss>`,
    {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    },
  );
}
