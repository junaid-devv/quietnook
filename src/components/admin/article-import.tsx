"use client";
import { useEffect, useState } from "react";
import {
  parseArticleMarkdown,
  matchImage,
  type ParsedArticle,
} from "@/lib/article-import";
import { post } from "./forms";
import type { Block } from "@/lib/content";
export type ImportedMedia = {
  id: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};
export function ArticleImport({
  onImport,
  disabled,
  onBusyChange,
}: {
  onImport: (
    article: ParsedArticle,
    media: ImportedMedia[],
    cover: string | null,
  ) => void;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const [parsed, setParsed] = useState<ParsedArticle | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [matches, setMatches] = useState<Record<number, string>>({});
  const [cover, setCover] = useState("");
  const [rights, setRights] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploaded, setUploaded] = useState<Record<string, ImportedMedia>>({});
  useEffect(() => {
    const urls = Object.fromEntries(
      files.map((f) => [f.name, URL.createObjectURL(f)]),
    );
    setPreviews(urls);
    return () => Object.values(urls).forEach(URL.revokeObjectURL);
  }, [files]);
  function autoMatch(article: ParsedArticle, selected: File[]) {
    setMatches(
      Object.fromEntries(
        article.images.map((s, i) => [
          i,
          matchImage(s.filename, selected, i + 1),
        ]),
      ),
    );
  }
  const missing = parsed?.images.filter((_, i) => !matches[i]).length || 0;
  async function insert() {
    if (!parsed) return;
    setBusy(true);
    onBusyChange(true);
    setMessage("");
    const known = { ...uploaded };
    try {
      if (missing)
        throw Error("Choose an image for every idea before importing.");
      if (!rights.trim())
        throw Error("Add the source or permission for these images.");
      const wanted = [
        ...new Set([...Object.values(matches), cover].filter(Boolean)),
      ];
      const media: ImportedMedia[] = [];
      for (let i = 0; i < wanted.length; i++) {
        const name = wanted[i];
        setMessage(`Preparing image ${i + 1} of ${wanted.length}…`);
        if (!known[name]) {
          const file = files.find((f) => f.name === name);
          if (!file)
            throw Error("An image is missing. Please select the files again.");
          const slot = parsed.images.find((_, j) => matches[j] === name);
          const alt = slot?.alt || `${parsed.title} — cover image`;
          const form = new FormData();
          form.set("file", file);
          form.set("alt", alt);
          form.set("caption", "");
          form.set("provenance", `Uploaded with article: ${file.name}`);
          form.set("license", rights.trim());
          form.set("folder", "article-imports");
          form.set("focal_x", "50");
          form.set("focal_y", "50");
          const result = await post("media", form);
          known[name] = {
            id: result.id,
            alt,
            caption: "",
            width: result.width,
            height: result.height,
          };
          setUploaded({ ...known });
        }
        media.push(known[name]);
      }
      const body: Block[] = parsed.body.map((b) => ({ ...b }));
      parsed.images.forEach((slot, i) => {
        const m = known[matches[i]];
        body[slot.blockIndex] = {
          type: "image",
          media_id: m.id,
          alt: slot.alt,
          caption: "",
          width: m.width,
          height: m.height,
        };
      });
      onImport({ ...parsed, body }, media, cover ? known[cover].id : null);
      setMessage(
        "Imported into the editor as a draft. Review the author, categories and search appearance, then save or publish.",
      );
    } catch (e) {
      setMessage(
        `${(e as Error).message}${Object.keys(known).length ? " Uploaded images remain in your media library; retrying reuses them." : ""}`,
      );
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }
  return (
    <details className="article-import-panel" open={!disabled}>
      <summary>Import an article and its images</summary>
      <p>
        Choose your Markdown file and all its pictures together. Match each
        picture to its idea, then import everything into the editor.
      </p>
      <fieldset disabled={busy}>
        <div className="import-file-fields">
          <label className="field">
            1. Article (.md)
            <input
              type="file"
              accept=".md,.markdown,text/markdown"
              onChange={async (e) => {
                try {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 2_000_000)
                    throw Error("Choose an article smaller than 2 MB.");
                  const article = parseArticleMarkdown(await f.text());
                  setParsed(article);
                  autoMatch(article, files);
                  setMessage("");
                } catch (err) {
                  setParsed(null);
                  setMessage((err as Error).message);
                }
              }}
            />
          </label>
          <label className="field">
            2. Article pictures
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={(e) => {
                const selected = Array.from(e.target.files || []);
                if (
                  selected.length > 81 ||
                  selected.some(
                    (f) =>
                      f.size > 10_000_000 ||
                      ![
                        "image/png",
                        "image/jpeg",
                        "image/webp",
                        "image/avif",
                      ].includes(f.type),
                  )
                ) {
                  setMessage(
                    "Choose up to 81 JPEG, PNG, WebP or AVIF images, each under 10 MB.",
                  );
                  return;
                }
                if (
                  new Set(selected.map((f) => f.name)).size !== selected.length
                ) {
                  setMessage("Each image needs a unique filename.");
                  return;
                }
                setFiles(selected);
                setUploaded({});
                if (parsed) autoMatch(parsed, selected);
                setCover("");
                setMessage("");
              }}
            />
          </label>
        </div>
        {parsed && (
          <>
            <p>
              <strong>{parsed.title}</strong> · {parsed.images.length} image
              positions · {missing} still to match
            </p>
            <p className="admin-muted">
              Matching filenames or numbered pictures (01, 02, 03) are placed
              automatically. For future articles, use Markdown images such as
              ![Description](01-front-door.jpg), or the Image / Alt markers in
              your existing files. Numbered ideas without a marker also get an
              image position.
            </p>
            <div className="import-matches">
              {parsed.images.map((slot, i) => (
                <div className="import-match" key={slot.blockIndex}>
                  {previews[matches[i]] ? (
                    <img src={previews[matches[i]]} alt="" />
                  ) : (
                    <span className="import-image-empty">Choose image</span>
                  )}
                  <label className="field">
                    {slot.alt}
                    <small>{slot.filename}</small>
                    <select
                      value={matches[i] || ""}
                      onChange={(e) =>
                        setMatches((m) => ({ ...m, [i]: e.target.value }))
                      }
                    >
                      <option value="">Select the matching picture</option>
                      {files.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))}
            </div>
            <label className="field">
              3. Cover picture
              <select value={cover} onChange={(e) => setCover(e.target.value)}>
                <option value="">No cover — choose one later</option>
                {files.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
            {previews[cover] && (
              <img
                className="import-cover-preview"
                src={previews[cover]}
                alt="Selected cover preview"
              />
            )}
            <label className="field">
              4. Image source / permission
              <input
                value={rights}
                maxLength={500}
                onChange={(e) => setRights(e.target.value)}
                placeholder="For example: My own AI-generated images, authorized for publication"
              />
            </label>
            {disabled && (
              <label className="field">
                <span>
                  Importing replaces the current editor text. Saved content
                  changes only when you save.
                </span>
              </label>
            )}
            <button
              type="button"
              className="secondary-button"
              disabled={busy || missing > 0 || !rights.trim()}
              onClick={insert}
            >
              {busy
                ? "Importing…"
                : disabled
                  ? "Replace editor with this import"
                  : "Import into editor"}
            </button>
          </>
        )}
      </fieldset>
      <p role="status">{message}</p>
    </details>
  );
}
