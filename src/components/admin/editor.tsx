"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { post } from "./forms";
import { type Article, type Block } from "@/lib/content";
import { type Category } from "@/lib/taxonomy";
import { ArticleImport } from "./article-import";
type Media = {
  id: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};
type Author = { id: string; name: string };
const initial = {
  title: "",
  slug: "",
  excerpt: "",
  body: [] as Block[],
  status: "draft" as Article["status"],
  author_id: null as string | null,
  cover_media_id: null as string | null,
  publish_at: null as string | null,
  seo_title: "",
  seo_description: "",
  category_ids: [] as string[],
};
export function ArticleEditor({
  article,
  categories,
  authors,
  media,
  timezone,
}: {
  article?: Article;
  categories: Category[];
  authors: Author[];
  media: Media[];
  timezone: string;
}) {
  const [value, setValue] = useState({ ...initial, ...article });
  const [library, setLibrary] = useState(media);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const set = (key: string, v: unknown) =>
    setValue((s) => ({ ...s, [key]: v }));
  const block = (index: number, change: Partial<Block>) =>
    set(
      "body",
      value.body.map((b, i) => (i === index ? { ...b, ...change } : b)),
    );
  const add = (type: Block["type"]) => {
    const b: Block =
      type === "heading"
        ? { type, level: 2, text: "" }
        : type === "list"
          ? { type, ordered: false, items: [""] }
          : type === "link"
            ? { type, text: "", url: "" }
            : type === "image"
              ? { type, media_id: "", alt: "", caption: "" }
              : type === "embed"
                ? { type, provider: "youtube", id: "", caption: "" }
                : { type: "paragraph", text: "" };
    set("body", [...value.body, b]);
  };
  const move = (i: number, d: number) => {
    const all = [...value.body];
    const j = i + d;
    if (j < 0 || j >= all.length) return;
    [all[i], all[j]] = [all[j], all[i]];
    set("body", all);
  };
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setMessage("");
        try {
          const data = await post("article", value);
          setValue((v) => ({ ...v, id: data.id }));
          setMessage(data.message);
          if (!article?.id) router.replace(`/admin/articles/${data.id}/`);
          router.refresh();
        } catch (error) {
          setMessage((error as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="editor-layout">
        <div className="editor-main">
          <ArticleImport
            disabled={!!value.body.length}
            onBusyChange={setBusy}
            onImport={(imported, uploaded, cover) => {
              setLibrary((current) => [
                ...current.filter((m) => !uploaded.some((u) => u.id === m.id)),
                ...uploaded,
              ]);
              const suggestions = categories
                .filter(
                  (c) =>
                    (c.slug === "christmas" &&
                      /christmas/i.test(imported.title)) ||
                    (c.slug === "small-spaces" &&
                      /small|tiny|narrow|compact/i.test(imported.title)) ||
                    (c.slug === "decor-ideas" &&
                      /decorat|decor\b/i.test(imported.title)) ||
                    (c.slug === "winter" && /winter/i.test(imported.title)) ||
                    (c.slug === "new-years-eve" &&
                      /new year/i.test(imported.title)),
                )
                .map((c) => c.id!);
              setValue((current) => ({
                ...current,
                ...imported,
                cover_media_id: cover,
                status: "draft",
                publish_at: null,
                author_id:
                  current.author_id ||
                  (authors.length === 1 ? authors[0].id : null),
                category_ids: current.category_ids.length
                  ? current.category_ids
                  : suggestions,
              }));
            }}
          />
          <label className="field">
            Article title
            <input
              value={value.title}
              required
              maxLength={200}
              onChange={(e) => set("title", e.target.value)}
            />
          </label>
          <label className="field">
            Stable URL slug
            <input
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              value={value.slug}
              onChange={(e) => set("slug", e.target.value)}
              maxLength={150}
            />
            <small className="admin-muted">
              /articles/{value.slug || "your-slug"}/ · Changing a saved slug
              creates a permanent redirect.
            </small>
          </label>
          <label className="field">
            Excerpt
            <textarea
              rows={3}
              value={value.excerpt}
              maxLength={500}
              onChange={(e) => set("excerpt", e.target.value)}
            />
          </label>
          <div>
            <h2 style={{ fontSize: 28 }}>Article body</h2>
            <p className="admin-muted">
              Build with structured blocks. Text is rendered safely without raw
              HTML. Use a Link block for an accessible link.
            </p>
          </div>
          {!value.body.length && (
            <p className="notice">
              Your canvas is ready. Add a block when you’re ready to write.
            </p>
          )}
          {value.body.map((b, i) => (
            <div className="block" key={i}>
              <div className="block-tools">
                <strong>
                  {i + 1}. {b.type}
                </strong>
                <div>
                  <button
                    type="button"
                    aria-label={`Move block ${i + 1} up`}
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Move block ${i + 1} down`}
                    onClick={() => move(i, 1)}
                    disabled={i === value.body.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove block ${i + 1}`}
                    onClick={() =>
                      set(
                        "body",
                        value.body.filter((_, j) => i !== j),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
              {"text" in b && (
                <label className="field">
                  {b.type === "heading" ? "Heading" : "Text"}
                  <textarea
                    value={b.text}
                    onChange={(e) => block(i, { text: e.target.value })}
                  />
                </label>
              )}
              {b.type === "heading" && (
                <label className="field">
                  Heading level
                  <select
                    value={b.level}
                    onChange={(e) =>
                      block(i, { level: Number(e.target.value) as 2 | 3 })
                    }
                  >
                    <option value={2}>Heading 2</option>
                    <option value={3}>Heading 3</option>
                  </select>
                </label>
              )}
              {b.type === "list" && (
                <>
                  <label className="field">
                    One item per line
                    <textarea
                      value={b.items.join("\n")}
                      onChange={(e) =>
                        block(i, { items: e.target.value.split("\n") })
                      }
                    />
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={b.ordered}
                      onChange={(e) => block(i, { ordered: e.target.checked })}
                    />{" "}
                    Numbered list
                  </label>
                </>
              )}
              {b.type === "link" && (
                <label className="field">
                  Destination URL
                  <input
                    type="url"
                    value={b.url}
                    onChange={(e) => block(i, { url: e.target.value })}
                  />
                </label>
              )}
              {b.type === "image" && (
                <>
                  <label className="field">
                    Library image
                    <select
                      value={b.media_id}
                      onChange={(e) => {
                        const m = library.find((x) => x.id === e.target.value);
                        block(i, {
                          media_id: e.target.value,
                          alt: m?.alt || "",
                          caption: m?.caption || "",
                          width: m?.width,
                          height: m?.height,
                        });
                      }}
                    >
                      <option value="">Select an uploaded image</option>
                      {library.map((m) => (
                        <option value={m.id} key={m.id}>
                          {m.alt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Alt text
                    <input
                      value={b.alt}
                      onChange={(e) => block(i, { alt: e.target.value })}
                    />
                  </label>
                </>
              )}
              {b.type === "embed" && (
                <>
                  <label className="field">
                    Video provider
                    <select
                      value={b.provider}
                      onChange={(e) =>
                        block(i, {
                          provider: e.target.value as "youtube" | "vimeo",
                        })
                      }
                    >
                      <option value="youtube">
                        YouTube (privacy enhanced)
                      </option>
                      <option value="vimeo">Vimeo</option>
                    </select>
                  </label>
                  <label className="field">
                    Video ID
                    <input
                      value={b.id}
                      pattern="[A-Za-z0-9_-]{1,30}"
                      onChange={(e) => block(i, { id: e.target.value })}
                    />
                  </label>
                </>
              )}
              {"caption" in b && (
                <label className="field">
                  Caption
                  <input
                    value={b.caption}
                    onChange={(e) => block(i, { caption: e.target.value })}
                  />
                </label>
              )}
            </div>
          ))}
          <div className="editor-toolbar" aria-label="Add body block">
            {(
              [
                "paragraph",
                "heading",
                "list",
                "link",
                "image",
                "embed",
              ] as const
            ).map((t) => (
              <button key={t} type="button" onClick={() => add(t)}>
                + {t}
              </button>
            ))}
          </div>
          <h2 style={{ fontSize: 28 }}>Search appearance</h2>
          <label className="field">
            SEO title
            <input
              value={value.seo_title}
              maxLength={250}
              onChange={(e) => set("seo_title", e.target.value)}
            />
          </label>
          <label className="field">
            SEO description
            <textarea
              rows={3}
              value={value.seo_description}
              maxLength={500}
              onChange={(e) => set("seo_description", e.target.value)}
            />
          </label>
          <div className="notice">
            <strong style={{ color: "#245b95" }}>
              {value.seo_title || value.title || "Your article title"} |
              quietnook
            </strong>
            <p>
              {value.seo_description ||
                value.excerpt ||
                "Your description preview appears here."}
            </p>
            <small>
              {value.seo_title.length > 70 || value.seo_description.length > 180
                ? "This preview may be truncated. Search engines choose their own display length."
                : "Preview is illustrative; search engines may choose a different title or snippet."}
            </small>
          </div>
        </div>
        <aside className="editor-side">
          <h2 style={{ fontSize: 28 }}>Publishing</h2>
          <label className="field">
            Status
            <select
              value={value.status}
              onChange={(e) => {
                const status = e.target.value;
                set("status", status);
                if (status === "published" && !value.publish_at)
                  set("publish_at", new Date().toISOString());
              }}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="field">
            Real author
            <select
              value={value.author_id || ""}
              onChange={(e) => set("author_id", e.target.value || null)}
            >
              <option value="">Choose an author</option>
              {authors.map((a) => (
                <option value={a.id} key={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          {!authors.length && (
            <Link className="text-link" href="/admin/authors/">
              Configure an author profile →
            </Link>
          )}
          <label className="field">
            Publication time (UTC)
            <input
              type="datetime-local"
              value={value.publish_at ? value.publish_at.slice(0, 16) : ""}
              onChange={(e) =>
                set(
                  "publish_at",
                  e.target.value
                    ? new Date(e.target.value + "Z").toISOString()
                    : null,
                )
              }
            />
            <small className="admin-muted">
              Editorial zone: {timezone}
              {value.publish_at && (
                <>
                  <br />
                  {new Date(value.publish_at).toLocaleString("en-US", {
                    timeZone: timezone,
                    timeZoneName: "short",
                  })}
                </>
              )}
            </small>
          </label>
          <label className="field">
            Cover image
            <select
              value={value.cover_media_id || ""}
              onChange={(e) => set("cover_media_id", e.target.value || null)}
            >
              <option value="">No cover image</option>
              {library.map((m) => (
                <option value={m.id} key={m.id}>
                  {m.alt}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
              Categories
            </legend>
            <div className="checkboxes">
              {categories.map((c) => (
                <label key={c.id}>
                  <input
                    type="checkbox"
                    checked={value.category_ids.includes(c.id!)}
                    onChange={(e) =>
                      set(
                        "category_ids",
                        e.target.checked
                          ? [...value.category_ids, c.id!]
                          : value.category_ids.filter((id) => id !== c.id),
                      )
                    }
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </fieldset>
          <button className="button" disabled={busy}>
            {busy ? "Saving…" : "Save article"}
          </button>
          {value.id && (
            <>
              <Link
                className="secondary-button"
                href={`/preview/${value.id}/`}
                target="_blank"
              >
                Open private preview ↗
              </Link>
              <Link
                className="text-link"
                href={`/admin/articles/${value.id}/revisions/`}
              >
                Revision history →
              </Link>
            </>
          )}
          <p role="status" className="form-message">
            {message}
          </p>
          <p className="admin-muted">
            Save to apply your changes. Unpublishing removes the article from
            all public queries immediately.
          </p>
        </aside>
      </div>
    </form>
  );
}
