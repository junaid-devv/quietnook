import { redirect, notFound } from "next/navigation";
import { editor } from "@/lib/supabase";
import { ArticleView } from "@/components/public";
import { blockSchema } from "@/lib/content";
import { getSettings } from "@/lib/data";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private preview",
  robots: { index: false, follow: false },
};
export default async function Preview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await editor();
  if (!auth) redirect("/admin/login/");
  const { data } = await auth.db
    .from("articles")
    .select(
      "*,authors(name,slug,bio),cover_media:media!articles_cover_media_id_fkey(alt,width,height,focal_x,focal_y)",
    )
    .eq("id", (await params).id)
    .maybeSingle();
  if (!data) notFound();
  const parsed = blockSchema.array().safeParse(data.body);
  if (!parsed.success) throw Error("Invalid article body");
  const settings = await getSettings();
  return <ArticleView article={{ ...data, body: parsed.data }} timezone={settings.editorial_timezone} preview />;
}
