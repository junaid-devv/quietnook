"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { post, RecordForm } from "./forms";
import type { Settings, Category } from "@/lib/taxonomy";
export function SettingsForm({
  settings,
  categories,
}: {
  settings: Settings;
  categories: Category[];
}) {
  const [value, setValue] = useState(settings);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const update = (key: string, v: unknown) =>
    setValue((s) => ({ ...s, [key]: v }));
  return (
    <form
      className="stack-form settings-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const result = await post("settings", value);
          setMessage(result.message);
          router.refresh();
        } catch (error) {
          setMessage((error as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="settings-card">
        <h2>Homepage & editorial</h2>
        <label className="field">
          Hero image path
          <input
            value={value.hero_image}
            onChange={(e) => update("hero_image", e.target.value)}
          />
          <small>
            Use /images/hero-nook.webp or a managed media path from the library.
          </small>
        </label>
        <label className="field">
          Hero alt text
          <input
            value={value.hero_alt}
            onChange={(e) => update("hero_alt", e.target.value)}
          />
        </label>
        <label className="field">
          Hero focal point (x% y%)
          <input
            value={value.hero_focal}
            pattern="[0-9]{1,3}% [0-9]{1,3}%"
            onChange={(e) => update("hero_focal", e.target.value)}
          />
        </label>
        <label className="field">
          Season order (comma-separated slugs)
          <input
            value={value.season_order.join(", ")}
            onChange={(e) =>
              update(
                "season_order",
                e.target.value.split(",").map((s) => s.trim()),
              )
            }
          />
          <small>
            {categories
              .filter((c) => c.kind === "season")
              .map((c) => c.slug)
              .join(", ")}
          </small>
        </label>
        <label className="field">
          Featured categories (comma-separated slugs)
          <input
            value={value.featured_categories.join(", ")}
            onChange={(e) =>
              update(
                "featured_categories",
                e.target.value.split(",").map((s) => s.trim()),
              )
            }
          />
        </label>
        <label className="field">
          Editorial timezone
          <input
            value={value.editorial_timezone}
            onChange={(e) => update("editorial_timezone", e.target.value)}
          />
        </label>
      </div>
      <div className="settings-card">
        <h2>Publisher & policies</h2>
        <p>
          Review the current-operation policies when your services change.
          Keep publisher identity and data practices accurate. Empty policy
          pages return 404; configured policy pages remain noindex.
        </p>
        <p><a className="text-link" href="/admin/pages/">Review required pages and private policy previews →</a></p>
        <p>Policy formatting: separate paragraphs with a blank line. Start section headings with “## ”. HTML is displayed as text.</p>
        {(["operator_name", "contact_email"] as const).map((k) => (
          <label className="field" key={k}>
            {k.replaceAll("_", " ")}
            <input
              value={value[k]}
              onChange={(e) => update(k, e.target.value)}
            />
          </label>
        ))}
        {(
          [
            "about_text",
            "privacy_text",
            "terms_text",
            "affiliate_text",
          ] as const
        ).map((k) => (
          <label className="field" key={k}>
            {k.replaceAll("_", " ")}
            <textarea
              rows={6}
              value={value[k]}
              onChange={(e) => update(k, e.target.value)}
            />
          </label>
        ))}
      </div>
      <div className="settings-card">
        <h2>Verified links & ownership</h2>
        {value.social_links.map((s, i) => (
          <div className="form-actions" key={i}>
            <label className="field">
              Label
              <input
                value={s.label}
                onChange={(e) =>
                  update(
                    "social_links",
                    value.social_links.map((x, j) =>
                      j === i ? { ...x, label: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <label className="field">
              Verified social URL
              <input
                type="url"
                value={s.url}
                onChange={(e) =>
                  update(
                    "social_links",
                    value.social_links.map((x, j) =>
                      j === i ? { ...x, url: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <button
              className="secondary-button"
              type="button"
              onClick={() =>
                update(
                  "social_links",
                  value.social_links.filter((_, j) => i !== j),
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          className="secondary-button"
          type="button"
          onClick={() =>
            update("social_links", [
              ...value.social_links,
              { label: "", url: "" },
            ])
          }
        >
          Add verified social link
        </button>
        {(["search_console_token", "pinterest_token"] as const).map((k) => (
          <label className="field" key={k}>
            {k === "search_console_token"
              ? "Google site verification token"
              : "Pinterest domain claim token"}
            <input
              value={value[k]}
              onChange={(e) => update(k, e.target.value)}
            />
          </label>
        ))}
        <label className="field">
          Newsletter privacy wording
          <textarea
            value={value.newsletter_privacy}
            onChange={(e) => update("newsletter_privacy", e.target.value)}
            rows={3}
          />
        </label>
        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={value.newsletter_enabled}
            onChange={(e) => update("newsletter_enabled", e.target.checked)}
          />{" "}
          Enable newsletter after provider setup
        </label>
        <p>
          Contact delivery uses server environment secrets. Newsletter signup
          remains hidden until Buttondown credentials, verified delivery, and
          privacy wording are configured.
        </p>
      </div>
      <div className="form-actions">
        <button disabled={busy} className="button">
          {busy ? "Saving…" : "Save settings"}
        </button>
        <a href="/api/admin/export/" className="text-link">
          Export settings, categories & authors ↓
        </a>
      </div>
      <p role="status" className="form-message">
        {message}
      </p>
    </form>
  );
}
export function CategoryForm({ category: c }: { category: Category }) {
  return (
    <div className="settings-card">
      <h2>{c.name}</h2>
      <p>
        /{c.kind}/{c.slug} · Keep empty hubs excluded from indexing.
      </p>
      <RecordForm
        action="category"
        transform={(d) => ({ ...d, indexable: d.indexable === "on" })}
      >
        <input name="id" type="hidden" value={c.id} />
        <label>
          Name
          <input name="name" required defaultValue={c.name} />
        </label>
        <label>
          Description
          <textarea name="description" defaultValue={c.description} rows={2} />
        </label>
        <label>
          Image path
          <input name="image" defaultValue={c.image || ""} />
        </label>
        <label>
          Display order
          <input
            name="position"
            type="number"
            min={0}
            max={1000}
            defaultValue={c.position}
          />
        </label>
        <label>
          SEO title
          <input name="seo_title" defaultValue={c.seo_title || ""} />
        </label>
        <label>
          SEO description
          <textarea
            name="seo_description"
            defaultValue={c.seo_description || ""}
          />
        </label>
        <label style={{ flexDirection: "row" }}>
          <input
            style={{ width: 18 }}
            name="indexable"
            type="checkbox"
            defaultChecked={c.indexable}
          />{" "}
          Permit indexing once published guides exist
        </label>
      </RecordForm>
    </div>
  );
}
export function AuthorForm({
  author,
}: {
  author?: { id: string; name: string; slug: string; bio: string };
}) {
  return (
    <div className="settings-card">
      <h2>{author ? "Edit real author" : "Add a real author"}</h2>
      <RecordForm action="author">
        {author && <input type="hidden" name="id" value={author.id} />}
        <label>
          Real name
          <input name="name" required defaultValue={author?.name} />
        </label>
        <label>
          Profile slug
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={author?.slug}
          />
        </label>
        <label>
          Biography
          <textarea name="bio" rows={4} defaultValue={author?.bio || ""} />
        </label>
      </RecordForm>
    </div>
  );
}
export function MediaUpload() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <form
      className="settings-card stack-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const result = await post("media", new FormData(e.currentTarget));
          setMessage(`${result.message} Managed path: ${result.path}`);
          router.refresh();
        } catch (error) {
          setMessage((error as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>Upload an image</h2>
      <p>
        Images stay in private storage. Only assets attached to published
        content or selected for public settings are publicly available. Files
        are decoded, stripped of metadata, resized, and converted to WebP.
      </p>
      <label>
        Image (JPEG, PNG, WebP, AVIF; up to 10 MB)
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
        />
      </label>
      <label>
        Alt text
        <input name="alt" required maxLength={500} />
      </label>
      <label>
        Caption
        <input name="caption" maxLength={1000} />
      </label>
      <label>
        Source / provenance
        <input
          name="provenance"
          required
          placeholder="Where this image came from"
        />
      </label>
      <label>
        License / permission
        <input
          name="license"
          required
          placeholder="Your actual rights to use the image"
        />
      </label>
      <label>
        Library folder
        <input
          name="folder"
          required
          pattern="[a-z0-9-]{1,60}"
          defaultValue="library"
        />
      </label>
      <div className="settings-grid">
        <label>
          Focal point X (0–100)
          <input
            type="number"
            name="focal_x"
            min={0}
            max={100}
            defaultValue={50}
          />
        </label>
        <label>
          Focal point Y (0–100)
          <input
            type="number"
            name="focal_y"
            min={0}
            max={100}
            defaultValue={50}
          />
        </label>
      </div>
      <button disabled={busy} className="button">
        {busy ? "Uploading…" : "Upload image"}
      </button>
      <p role="status" className="form-message">
        {message}
      </p>
    </form>
  );
}
export function MediaCard({
  media: m,
}: {
  media: {
    id: string;
    alt: string;
    caption: string;
    folder: string;
    focal_x: number;
    focal_y: number;
    width: number;
    height: number;
    license: string;
  };
}) {
  const [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <div className="media-card">
      <img
        src={`/api/media/${m.id}/`}
        alt={m.alt}
        width={400}
        height={280}
        loading="lazy"
      />
      <p>
        {m.width} × {m.height} · {m.license}
      </p>
      <p>/api/media/{m.id}/</p>
      <RecordForm action="media-update">
        <input type="hidden" name="id" value={m.id} />
        <label>
          Alt text
          <input name="alt" required defaultValue={m.alt} />
        </label>
        <label>
          Caption
          <input name="caption" defaultValue={m.caption} />
        </label>
        <label>
          Folder
          <input
            name="folder"
            required
            pattern="[a-z0-9-]{1,60}"
            defaultValue={m.folder}
          />
        </label>
        <label>
          Focal X
          <input
            name="focal_x"
            type="number"
            min={0}
            max={100}
            defaultValue={m.focal_x}
          />
        </label>
        <label>
          Focal Y
          <input
            name="focal_y"
            type="number"
            min={0}
            max={100}
            defaultValue={m.focal_y}
          />
        </label>
      </RecordForm>
      <button
        className="secondary-button"
        onClick={async () => {
          try {
            const result = await post("media-delete", { id: m.id });
            setMessage(result.message);
            router.refresh();
          } catch (error) {
            setMessage((error as Error).message);
          }
        }}
      >
        Delete unused image
      </button>
      <p role="status" className="form-message">
        {message}
      </p>
    </div>
  );
}
export function RestoreButton({
  articleId,
  revisionId,
}: {
  articleId: string;
  revisionId: string;
}) {
  const [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <div>
      <button
        className="secondary-button"
        onClick={async () => {
          try {
            await post("restore", {
              article_id: articleId,
              revision_id: revisionId,
            });
            router.push(`/admin/articles/${articleId}/`);
            router.refresh();
          } catch (error) {
            setMessage((error as Error).message);
          }
        }}
      >
        Restore as draft
      </button>
      <p role="status">{message}</p>
    </div>
  );
}
