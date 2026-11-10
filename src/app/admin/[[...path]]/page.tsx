import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { configured, editor } from "@/lib/supabase";
import { getSettings } from "@/lib/data";
import { defaultSettings } from "@/lib/taxonomy";
import { AuthForm, Logout } from "@/components/admin/forms";
import { ArticleEditor } from "@/components/admin/editor";
import {
  SettingsForm,
  CategoryForm,
  AuthorForm,
  MediaUpload,
  MediaCard,
  RestoreButton,
} from "@/components/admin/manage";
import type { Category } from "@/lib/taxonomy";
import { z } from "zod";
import { pageNumber } from "@/lib/content";
import { PolicyPage } from "@/components/policy";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Publishing studio",
  robots: { index: false, follow: false },
};
type Props = {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<{ status?: string; page?: string; folder?: string }>;
};
export default async function Admin({ params, searchParams }: Props) {
  const path = (await params).path || [];
  const action = path[0] || "dashboard";
  if (["login", "recover"].includes(action)) {
    return (
      <div className="admin-shell">
        <div className="login-box">
          <p className="eyebrow">quietnook · Publishing studio</p>
          <h1>
            {action === "login" ? "Welcome back." : "Reset your password."}
          </h1>
          {configured ? (
            <AuthForm mode={action === "login" ? "login" : "recover"} />
          ) : (
            <div className="notice" style={{ marginTop: 25 }}>
              Publishing is locked until Supabase is configured. No accounts or
              articles have been created. Follow README.md to connect your
              project and invite an editor.
            </div>
          )}
          {action === "login" ? (
            <Link className="text-link" href="/admin/recover/">
              Forgot your password?
            </Link>
          ) : (
            <Link className="text-link" href="/admin/login/">
              Back to sign in
            </Link>
          )}
          <p>Access is by invitation only. There is no public registration.</p>
        </div>
      </div>
    );
  }
  const auth = await editor();
  if (!auth) redirect("/admin/login/");
  const { db } = auth;
  const settings = await getSettings();
  const wrap = (children: React.ReactNode) => (
    <div className="admin-shell">
      <p className="eyebrow">quietnook · Publishing studio</p>
      <nav className="admin-nav" aria-label="Publishing navigation">
        <Link href="/admin/">Overview</Link>
        <Link href="/admin/articles/">Articles</Link>
        <Link href="/admin/media/">Media</Link>
        <Link href="/admin/categories/">Categories</Link>
        <Link href="/admin/authors/">Authors</Link>
        <Link href="/admin/settings/">Settings</Link>
        <Link href="/admin/pages/">Pages</Link>
        <Link href="/admin/password/">Password</Link>
        <Logout />
      </nav>
      {children}
    </div>
  );
  if (action === "dashboard") {
    const states = ["draft", "scheduled", "published"];
    const counts = await Promise.all(
      states.map(async (status) => {
        const { count, error } = await db
          .from("articles")
          .select("id", { head: true, count: "exact" })
          .eq("status", status);
        if (error) throw Error("Dashboard data unavailable");
        return { status, count: count || 0 };
      }),
    );
    return wrap(
      <>
        <div className="admin-title">
          <div>
            <h1>Make room for your next idea.</h1>
            <p className="admin-muted">
              Editorial timezone: {settings.editorial_timezone}
            </p>
          </div>
          <Link className="button" href="/admin/articles/new/">
            Create article
          </Link>
        </div>
        <div className="admin-cards">
          {counts.map((c) => (
            <Link
              href={`/admin/articles/?status=${c.status}`}
              className="admin-card"
              key={c.status}
            >
              <h2>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</h2>
              <strong>{c.count}</strong>
            </Link>
          ))}
        </div>
        <div className="settings-card" style={{ marginTop: 30 }}>
          <h2>Connections & launch readiness</h2>
          <p>Database and editor authentication: connected for this session.</p>
          <p>
            Production origin:{" "}
            {process.env.SITE_URL
              ? "configured; verify ownership before launch"
              : "awaiting verified domain configuration"}
            .
          </p>
          <p>
            Scheduled publishing:{" "}
            {process.env.CRON_SECRET && process.env.SUPABASE_SERVICE_ROLE_KEY
              ? "server credentials present; verify the host cron job"
              : "awaiting CRON_SECRET and server credentials"}
            .
          </p>
          <p>
            Contact delivery:{" "}
            {process.env.RESEND_API_KEY &&
            process.env.CONTACT_FROM &&
            process.env.CONTACT_TO
              ? "credentials present; verify sender and delivery"
              : "awaiting provider credentials and a verified sender"}
            .
          </p>
          <p>
            Newsletter:{" "}
            {settings.newsletter_enabled &&
            process.env.BUTTONDOWN_API_KEY &&
            process.env.NEWSLETTER_VERIFIED === "true" &&
            settings.newsletter_privacy &&
            settings.privacy_text
              ? "configured for Buttondown double opt-in; monitor provider delivery"
              : "disabled pending provider credentials, verified delivery, and privacy wording"}
            .
          </p>
          <p>
            Analytics: not installed. Search Console & Pinterest claiming:{" "}
            {settings.search_console_token || settings.pinterest_token
              ? "token configured; ownership confirmation happens with the provider"
              : "awaiting owner verification"}
            .
          </p>
        </div>
      </>,
    );
  }
  if (action === "pages") {
    const policies = [
      {title:"Privacy Policy", path:"privacy", text:settings.privacy_text, needs:"Public operator identity and country; actual hosting/email processors, data collected, retention, rights/contact process, and any cookies or tracking."},
      {title:"Terms of Use", path:"terms", text:settings.terms_text, needs:"Public operator identity and country; actual permitted use, content rights, project safety boundaries and applicable dispute terms."},
      {title:"Affiliate Disclosure", path:"affiliate-disclosure", text:settings.affiliate_text, needs:"Confirm whether affiliate links, sponsorships or gifted products will be used and how relationships will be disclosed."},
    ];
    return wrap(<>
      <div className="admin-title"><h1>Required pages</h1><Link className="button" href="/admin/settings/">Edit page text</Link></div>
      <div className="settings-card"><h2>About & Contact</h2><p><Link href="/about/">About</Link> and <Link href="/contact/">Contact</Link> are available. Contact currently uses the configured public email when the delivery provider is unavailable.</p><p>Publisher identity: {settings.operator_name || "awaiting your verified public name"}. Public contact: {settings.contact_email || "not configured"}.</p></div>
      {policies.map(p=><div className="settings-card" key={p.path}><h2>{p.title}</h2><p>{p.text.trim() ? "Configured; public page remains noindex." : "Awaiting verified text; public URL returns 404."}</p><p>{p.needs}</p>{p.text.trim() ? <><Link href={`/${p.path}/`}>Open public page</Link><details><summary>Private preview</summary><PolicyPage title={p.title} text={p.text} contact={settings.contact_email}/></details></> : <p>No placeholder policy is published.</p>}</div>)}
    </>);
  }
  if (action === "password")
    return wrap(
      <div className="login-box">
        <h1>Update password</h1>
        <AuthForm mode="password" />
      </div>,
    );
  if (action === "settings") {
    const { data: cats, error } = await db
      .from("categories")
      .select("*")
      .order("position");
    if (error) throw error;
    return wrap(
      <>
        <div className="admin-title">
          <h1>Site settings</h1>
        </div>
        <SettingsForm
          settings={{ ...defaultSettings, ...settings }}
          categories={cats as Category[]}
        />
      </>,
    );
  }
  if (action === "categories") {
    const { data, error } = await db
      .from("categories")
      .select("*")
      .order("position");
    if (error) throw error;
    return wrap(
      <>
        <div className="admin-title">
          <h1>Categories</h1>
        </div>
        <div className="settings-grid">
          {data?.map((c) => (
            <CategoryForm category={c as Category} key={c.id} />
          ))}
        </div>
      </>,
    );
  }
  if (action === "authors") {
    const { data, error } = await db.from("authors").select("*").order("name");
    if (error) throw error;
    return wrap(
      <>
        <div className="admin-title">
          <h1>Author profiles</h1>
        </div>
        <p className="notice">
          Add only real people with permission to display their identity and
          biography.
        </p>
        <div className="settings-grid">
          <AuthorForm />
          {data?.map((a) => (
            <AuthorForm author={a} key={a.id} />
          ))}
        </div>
      </>,
    );
  }
  if (action === "media") {
    const p = await searchParams;
    const page = pageNumber(p.page);
    let query = db
      .from("media")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * 24, page * 24 - 1);
    if (p.folder) query = query.eq("folder", p.folder.slice(0, 60));
    const { data, count, error } = await query;
    if (error) throw error;
    return wrap(
      <>
        <div className="admin-title">
          <h1>Media library</h1>
        </div>
        <MediaUpload />
        <form className="form-actions" style={{ margin: "25px 0" }}>
          <label className="field">
            Filter folder
            <input name="folder" defaultValue={p.folder || ""} />
          </label>
          <button className="secondary-button">Filter</button>
        </form>
        {!data?.length && (
          <p className="notice">No images in this library yet.</p>
        )}
        <div className="media-grid">
          {data?.map((m) => (
            <MediaCard media={m} key={m.id} />
          ))}
        </div>
        <div className="pagination">
          {page > 1 && (
            <Link
              href={`/admin/media/?page=${page - 1}&folder=${encodeURIComponent(p.folder || "")}`}
            >
              ← Previous
            </Link>
          )}
          {(count || 0) > page * 24 && (
            <Link
              href={`/admin/media/?page=${page + 1}&folder=${encodeURIComponent(p.folder || "")}`}
            >
              Next →
            </Link>
          )}
        </div>
      </>,
    );
  }
  if (action === "articles") {
    if (path[1]) {
      const id = path[1];
      if (id !== "new" && !z.uuid().safeParse(id).success) notFound();
      if (path[2] === "revisions") {
        const { data, error } = await db
          .from("revisions")
          .select("id,created_at,editor_id,snapshot")
          .eq("article_id", id)
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        return wrap(
          <>
            <div className="admin-title">
              <h1>Revision history</h1>
              <Link href={`/admin/articles/${id}/`} className="text-link">
                Return to editor
              </Link>
            </div>
            {!data?.length && (
              <p className="notice">
                Revision snapshots appear after the first saved change.
              </p>
            )}
            {data?.map((r) => (
              <div className="revision-row" key={r.id}>
                <div>
                  <strong>{r.snapshot.title}</strong>
                  <p className="admin-muted">
                    {new Date(r.created_at).toLocaleString("en-US", {
                      timeZone: settings.editorial_timezone,
                      timeZoneName: "short",
                    })}
                    <br />
                    Editor ID: {r.editor_id || "scheduled publishing job"}
                  </p>
                </div>
                <RestoreButton articleId={id} revisionId={r.id} />
              </div>
            ))}
          </>,
        );
      }
      const [
        { data: categories, error: ce },
        { data: authors, error: ae },
        { data: media, error: me },
      ] = await Promise.all([
        db.from("categories").select("*").order("position"),
        db.from("authors").select("id,name").order("name"),
        db
          .from("media")
          .select("id,alt,caption,width,height")
          .order("created_at", { ascending: false })
          .limit(1000),
      ]);
      if (ce || ae || me) throw Error("Editor data unavailable");
      let article;
      if (id !== "new") {
        const { data, error } = await db
          .from("articles")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        if (!data) notFound();
        const { data: assigned } = await db
          .from("article_categories")
          .select("category_id")
          .eq("article_id", id);
        article = {
          ...data,
          category_ids: assigned?.map((x) => x.category_id) || [],
        };
      }
      return wrap(
        <>
          <div className="admin-title">
            <h1>{article ? "Edit article" : "Create an article"}</h1>
            <Link className="text-link" href="/admin/articles/">
              All articles →
            </Link>
          </div>
          <ArticleEditor
            article={article}
            categories={categories as Category[]}
            authors={authors || []}
            media={media || []}
            timezone={settings.editorial_timezone}
          />
        </>,
      );
    }
    const p = await searchParams;
    const page = pageNumber(p.page);
    const status = ["draft", "published", "scheduled"].includes(p.status || "")
      ? p.status
      : "";
    let query = db
      .from("articles")
      .select("id,title,status,updated_at,publish_at", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range((page - 1) * 20, page * 20 - 1);
    if (status) query = query.eq("status", status);
    const { data, count, error } = await query;
    if (error) throw error;
    return wrap(
      <>
        <div className="admin-title">
          <h1>Your articles</h1>
          <Link className="button" href="/admin/articles/new/">
            Create article
          </Link>
        </div>
        <div
          className="pill-links"
          style={{ justifyContent: "start", marginBottom: 25 }}
        >
          {["", "draft", "scheduled", "published"].map((s) => (
            <Link href={`/admin/articles/${s ? `?status=${s}` : ""}`} key={s}>
              {s || "All"}
              {s === status ? " ✓" : ""}
            </Link>
          ))}
        </div>
        {!data?.length ? (
          <div className="empty-state">
            <h2>A fresh start.</h2>
            <p>
              No {status || ""} articles yet. Your publishing tools are ready
              whenever you are.
            </p>
            <Link className="button" href="/admin/articles/new/">
              Create article
            </Link>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Updated ({settings.editorial_timezone})</th>
                </tr>
              </thead>
              <tbody>
                {data.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Link
                        className="text-link"
                        href={`/admin/articles/${a.id}/`}
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td>
                      <span className="status">{a.status}</span>
                    </td>
                    <td>
                      {new Date(a.updated_at).toLocaleString("en-US", {
                        timeZone: settings.editorial_timezone,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination">
          {page > 1 && (
            <Link href={`/admin/articles/?page=${page - 1}&status=${status}`}>
              ← Previous
            </Link>
          )}
          {(count || 0) > page * 20 && (
            <Link href={`/admin/articles/?page=${page + 1}&status=${status}`}>
              Next →
            </Link>
          )}
        </div>
      </>,
    );
  }
  notFound();
}
