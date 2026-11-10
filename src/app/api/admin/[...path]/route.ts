import { z } from "zod";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { editor, sessionDb, configured } from "@/lib/supabase";
import { sameOrigin, rateLimit, json } from "@/lib/api";
import { articleSchema, bodyText, safeUrl } from "@/lib/content";
import {
  categories as defaultCategories,
  defaultSettings,
} from "@/lib/taxonomy";
const asset = z
  .string()
  .refine(
    (s) =>
      [
        defaultSettings.hero_image,
        "/images/hero.webp",
        ...defaultCategories.map((c) => c.image),
      ].includes(s) || /^\/api\/media\/[a-f0-9-]{36}\/$/.test(s),
    "Select a managed media path or a supplied image",
  );
const settingsSchema = z.object({
  hero_image: asset,
  hero_alt: z.string().min(1).max(500),
  hero_focal: z
    .string()
    .regex(/^\d{1,3}% \d{1,3}%$/)
    .refine((s) =>
      s.split(" ").every((n) => Number(n.replace("%", "")) <= 100),
    ),
  season_order: z
    .array(z.string())
    .min(1)
    .max(12)
    .refine((a) => new Set(a).size === a.length, "Remove duplicate seasons"),
  featured_categories: z
    .array(z.string())
    .min(1)
    .max(8)
    .refine((a) => new Set(a).size === a.length, "Remove duplicate categories"),
  editorial_timezone: z.string().refine((t) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: t });
      return true;
    } catch {
      return false;
    }
  }),
  operator_name: z.string().max(150),
  contact_email: z.union([z.email(), z.literal("")]),
  about_text: z.string().max(15000),
  privacy_text: z.string().max(30000),
  terms_text: z.string().max(30000),
  affiliate_text: z.string().max(15000),
  social_links: z
    .array(
      z.object({
        label: z.string().min(1).max(50),
        url: z.string().refine(safeUrl),
      }),
    )
    .max(10),
  newsletter_enabled: z.boolean(),
  newsletter_privacy: z.string().max(1000),
  newsletter_endpoint: z.literal(""),
  search_console_token: z
    .string()
    .regex(/^[A-Za-z0-9_-]*$/)
    .max(250),
  pinterest_token: z
    .string()
    .regex(/^[A-Za-z0-9_-]*$/)
    .max(250),
});
function refresh() {
  revalidatePath("/", "layout");
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const auth = await editor();
  if (!auth) return json({ message: "Editor access required" }, 401);
  const path = (await params).path;
  if (path[0] === "export") {
    const [{ data: settings }, { data: categories }, { data: authors }] =
      await Promise.all([
        auth.db.from("site_settings").select("*"),
        auth.db.from("categories").select("*"),
        auth.db.from("authors").select("*"),
      ]);
    return new Response(
      JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          settings,
          categories,
          authors,
        },
        null,
        2,
      ),
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition":
            'attachment; filename="quietnook-settings.json"',
          "Cache-Control": "private, no-store",
        },
      },
    );
  }
  return json({ message: "Not found" }, 404);
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (!sameOrigin(request))
    return json({ message: "Invalid request origin" }, 403);
  const action = (await params).path[0];
  try {
    if (!configured)
      return json(
        { message: "Supabase is not configured. Follow the setup guide." },
        503,
      );
    if (["login", "recover"].includes(action)) {
      if (!(await rateLimit(request, action, 8)))
        return json(
          {
            message:
              "Please wait before trying again. Authentication rate limiting must be configured.",
          },
          429,
        );
      const payload = await request.json();
      const email = z.email().max(250).parse(payload.email);
      const db = (await sessionDb())!;
      if (action === "recover") {
        const base = process.env.SITE_URL;
        if (!base)
          return json(
            { message: "Password recovery needs a verified SITE_URL." },
            503,
          );
        const { error } = await db.auth.resetPasswordForEmail(email, {
          redirectTo: `${base}/auth/callback/`,
        });
        if (error)
          return json(
            {
              message:
                "Recovery could not be requested. Please try again later.",
            },
            503,
          );
        return json({
          message:
            "If this address is eligible, a recovery email will arrive shortly.",
        });
      }
      const password = z.string().min(1).max(200).parse(payload.password);
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error)
        return json(
          { message: "Unable to sign in with those credentials." },
          401,
        );
      const member = await editor();
      if (!member) {
        await db.auth.signOut();
        return json({ message: "This account has no publishing access." }, 403);
      }
      return json({ message: "Signed in", redirect: "/admin/" });
    }
    const auth = await editor();
    if (!auth) return json({ message: "Editor access required" }, 401);
    const { db } = auth;
    async function validAsset(path: string) {
      if (!path.startsWith("/api/media/")) return true;
      const { data, error } = await db
        .from("media")
        .select("id")
        .eq("id", path.split("/")[3])
        .maybeSingle();
      return !error && !!data;
    }
    if (action === "logout") {
      await db.auth.signOut();
      return json({ redirect: "/admin/login/" });
    }
    if (action === "password") {
      const p = z
        .object({ password: z.string().min(12).max(200) })
        .parse(await request.json());
      const { error } = await db.auth.updateUser({ password: p.password });
      if (error) throw Error("Password could not be changed");
      return json({ message: "Password updated.", redirect: "/admin/" });
    }
    if (action === "article" || action === "restore") {
      let raw = await request.json();
      if (action === "restore") {
        const p = z
          .object({ revision_id: z.uuid(), article_id: z.uuid() })
          .parse(raw);
        const { data: r } = await db
          .from("revisions")
          .select("snapshot")
          .eq("id", p.revision_id)
          .eq("article_id", p.article_id)
          .single();
        if (!r) return json({ message: "Revision not found" }, 404);
        raw = {
          ...r.snapshot,
          id: p.article_id,
          status: "draft",
          publish_at: null,
        };
      }
      const a = articleSchema.parse(raw);
      const { data, error } = await db.rpc("save_article", {
        payload: { ...a, body_text: bodyText(a.body) },
      });
      if (error) {
        console.error("Article save failed", error.code);
        return json(
          {
            message:
              "Could not save. Check the slug, author, categories, and media references.",
          },
          400,
        );
      }
      refresh();
      return json({
        message:
          action === "restore"
            ? "Revision restored as a draft."
            : "Article saved.",
        id: data,
      });
    }
    if (action === "settings") {
      const settings = settingsSchema.parse(await request.json());
      if (!(await validAsset(settings.hero_image)))
        return json(
          { message: "Choose an existing hero image from the media library." },
          400,
        );
      const { data: cats } = await db.from("categories").select("slug,kind");
      if (
        settings.season_order.some(
          (s) => !cats?.some((c) => c.slug === s && c.kind === "season"),
        ) ||
        settings.featured_categories.some(
          (s) => !cats?.some((c) => c.slug === s),
        )
      )
        return json({ message: "Choose existing categories." }, 400);
      const { error } = await db.from("site_settings").upsert({
        id: "public",
        value: settings,
        updated_at: new Date().toISOString(),
      });
      if (error) throw Error("Settings could not be saved");
      refresh();
      return json({ message: "Settings saved." });
    }
    if (action === "category") {
      const c = z
        .object({
          id: z.uuid(),
          name: z.string().min(1).max(100),
          description: z.string().max(500),
          image: z.union([asset, z.literal("")]),
          position: z.coerce.number().int().min(0).max(1000),
          indexable: z.boolean(),
          seo_title: z.string().max(200),
          seo_description: z.string().max(500),
        })
        .parse(await request.json());
      const { id, ...values } = c;
      if (c.image && !(await validAsset(c.image)))
        return json(
          {
            message:
              "Choose an existing category image from the media library.",
          },
          400,
        );
      const { error } = await db.from("categories").update(values).eq("id", id);
      if (error) throw Error("Category could not be saved");
      refresh();
      return json({ message: "Category saved." });
    }
    if (action === "author") {
      const a = z
        .object({
          name: z.string().trim().min(1).max(150),
          slug: z
            .string()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .max(150),
          bio: z.string().max(5000),
          id: z.uuid().optional(),
        })
        .parse(await request.json());
      const { error } = await db.from("authors").upsert(a);
      if (error)
        throw Error("Author could not be saved; check for a duplicate slug");
      refresh();
      return json({ message: "Author profile saved." });
    }
    if (action === "media") {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File) || file.size > 10000000 || file.size < 1)
        return json({ message: "Choose an image up to 10 MB." }, 400);
      if (
        !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
          file.type,
        )
      )
        return json(
          {
            message:
              "Use JPEG, PNG, WebP, or AVIF. SVG uploads are not accepted.",
          },
          400,
        );
      const meta = z
        .object({
          alt: z.string().min(1).max(500),
          caption: z.string().max(1000),
          provenance: z.string().min(1).max(2000),
          license: z.string().min(1).max(500),
          folder: z.string().regex(/^[a-z0-9-]{1,60}$/),
          focal_x: z.coerce.number().int().min(0).max(100),
          focal_y: z.coerce.number().int().min(0).max(100),
        })
        .parse(Object.fromEntries(form));
      const raw = Buffer.from(await file.arrayBuffer());
      const image = sharp(raw, {
        limitInputPixels: 40000000,
        failOn: "warning",
      });
      const info = await image.metadata();
      if (!["jpeg", "png", "webp", "avif", "heif"].includes(info.format || ""))
        return json({ message: "The image file could not be verified." }, 400);
      const { data: output, info: dimensions } = await image
        .rotate()
        .resize({
          width: 2400,
          height: 2400,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
      const id = randomUUID();
      const key = `${meta.folder}/${id}.webp`;
      const { error: uploadError } = await db.storage
        .from("editorial")
        .upload(key, output, { contentType: "image/webp", upsert: false });
      if (uploadError) throw Error("Image upload failed");
      const { error } = await db.from("media").insert({
        id,
        ...meta,
        storage_key: key,
        mime: "image/webp",
        width: dimensions.width,
        height: dimensions.height,
        bytes: output.length,
      });
      if (error) {
        await db.storage.from("editorial").remove([key]);
        throw Error("Media metadata could not be saved");
      }
      return json({
        message: "Image uploaded.",
        id,
        path: `/api/media/${id}/`,
        width: dimensions.width,
        height: dimensions.height,
      });
    }
    if (action === "media-update") {
      const m = z
        .object({
          id: z.uuid(),
          alt: z.string().min(1).max(500),
          caption: z.string().max(1000),
          focal_x: z.coerce.number().int().min(0).max(100),
          focal_y: z.coerce.number().int().min(0).max(100),
          folder: z.string().regex(/^[a-z0-9-]{1,60}$/),
        })
        .parse(await request.json());
      const { id, ...values } = m;
      const { error } = await db.from("media").update(values).eq("id", id);
      if (error) throw Error("Media details could not be saved");
      refresh();
      return json({ message: "Media details saved." });
    }
    if (action === "media-delete") {
      const { id } = z.object({ id: z.uuid() }).parse(await request.json());
      const [{ data: settings }, { data: cats }] = await Promise.all([
        db
          .from("site_settings")
          .select("value")
          .eq("id", "public")
          .maybeSingle(),
        db.from("categories").select("id").eq("image", `/api/media/${id}/`),
      ]);
      if (settings?.value?.hero_image === `/api/media/${id}/` || cats?.length)
        return json(
          {
            message:
              "This image is selected in site settings or categories. Remove those references first.",
          },
          409,
        );
      const { data } = await db
        .from("media")
        .select("storage_key")
        .eq("id", id)
        .single();
      if (!data) return json({ message: "Image not found" }, 404);
      const { error } = await db.from("media").delete().eq("id", id);
      if (error)
        return json(
          {
            message:
              "This image is in use. Remove its references before deleting it.",
          },
          409,
        );
      const { error: storageError } = await db.storage
        .from("editorial")
        .remove([data.storage_key]);
      if (storageError)
        return json(
          {
            message:
              "Metadata removed; storage cleanup needs attention in Supabase.",
          },
          500,
        );
      return json({ message: "Image deleted." });
    }
    return json({ message: "Not found" }, 404);
  } catch (error) {
    if (error instanceof z.ZodError)
      return json(
        {
          message: error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("\n"),
        },
        400,
      );
    console.error(
      "Admin action failed",
      action,
      error instanceof Error ? error.message : "unknown",
    );
    return json(
      {
        message:
          "The operation could not be completed. Please check your configuration and try again.",
      },
      500,
    );
  }
}
