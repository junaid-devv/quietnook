# quietnook

**Deployment setup — November 10, 2026:** Source is maintained in the private `junaid-devv/quietnook` GitHub repository. The `quietnook` Vercel project uses Node 22, the existing Supabase CMS and `https://quietnook.vercel.app` as its preview origin. `STAGING=true` keeps the preview out of search indexes while allowing phone access; administration still requires an authorized editor account. Server credentials are configured in Vercel and excluded from Git. `quietnook.com` is not connected. Older undeployed/zero-article notes below are historical.

Both user-supplied articles are now published, with 40 images in total (two covers and 38 idea images). The second article has a short, non-repeated introduction. Article pages use a floating index with accessible section navigation, hidden scrollbars and compact responsive layouts. Keywords and Pinterest publishing notes remain in local companion files rather than the public article body.

The current Vercel Hobby configuration runs the publishing check **daily**, at the UTC midnight scheduling window, rather than every minute. Existing published articles appear immediately. Precise future scheduling still requires a compatible scheduler or plan; its execution has not yet been observed.

Custom Next.js App Router, TypeScript, Tailwind and Supabase publication built from `WEBSITE_PLAN.md`. Public pages preserve the approved cream, forest-green and rust design, independent interior photography, searchable hero, SVG house-and-leaf identity, room shortcuts and seasonal cards. The latest compact spacing and integrated mobile background photography remain intact.

**No articles or author profiles are seeded.** Supabase project `tvdnsqmvxxencezenzwx` is connected locally. All three migrations and the taxonomy/settings-only seed are applied. Hosted public signups are disabled. An explicitly authorized editor invitation was accepted by Supabase and the editor allowlist is configured. Intended production origin: `https://quietnook.com`. Public contact: `quietnookk@gmail.com`. No public deployment or domain purchase was performed.

**Editorial update — November 9, 2026:** At the user's explicit request, the supplied article “21 Outdoor Christmas Decorating Ideas for Small Porches” is now published in the connected CMS, with the user-approved byline Ali Hamza, 21 idea images and one cover. Categories: Christmas, Decor Ideas and Small Spaces. This changes the article count from zero to one; earlier zero-content verification reports describe the build handoff only. Do not run zero-content assertions against the current editorial database. Publication evidence is in `output/cy12/publication-result.json`. The website remains undeployed and staging stays enabled; the configured domain currently displays a domain-sale page.

## Current verification

See `docs/QA.md` for current acceptance evidence and remaining launch requirements. The dated JSON reports in `docs/` distinguish actual hosted checks, isolated database tests and local browser lab results. Old redesign reports describe earlier revisions.

- `docs/hosted-verification.json`: real hosted taxonomy/settings, empty search, public-signup configuration, private bucket, denied anonymous writes and scheduler calls, exact zero content counts, and server-authorized publishing RPC.
- `docs/supabase-advisors.json`: advisor result after security/query hardening.
- `docs/seo-production-mode-verification.json`: rendered titles, descriptions, sharing tags, H1s, canonicals, indexability, 404s, robots and sitemap on 26 public routes in a connected production build served on loopback.
- `docs/storage-verification.json`: actual upload/download, anonymous denial, checksummed object backup/restore, and cleanup in a separate temporary private QA bucket. No production media/article records were created.
- `docs/backup-restore-verification.json`: actual application export restored into isolated in-memory PostgreSQL using the migrations. This is not a full Supabase Auth/database disaster-recovery test.

Lighthouse reports under `output/` are local simulated mobile/desktop measurements, not real-user Core Web Vitals or deployed-host guarantees. Screen-reader verification and a full manual accessibility review remain separate from automated scores.

## Local development

Use a supported Node LTS and npm. The build was checked with Node 22.15. Install from the lockfile:

```powershell
npm ci
npm run dev
```

The default development URL is `http://127.0.0.1:3000/`. The current invitation/local production preview uses port **3003**:

```powershell
npm run build
npm run start -- --port 3003
```

`.env.local` is ignored and holds the selected project's publishable/server keys and a random cron secret. Never share or commit it. `.env.example` contains names only. `SUPABASE_SERVICE_ROLE_KEY` accepts the project's server secret key or legacy service-role key; it must never have a `NEXT_PUBLIC_` prefix. The browser receives only the publishable key. `scripts/check-public-bundles.mjs` checks for accidental server-key exposure without logging it.

Without Supabase configuration, public pages use taxonomy/settings defaults and truthful empty states; administration stays locked. Configured database errors produce errors rather than misleading empty content.

```powershell
npm run typecheck
npm test
npm run build
npm audit
node --env-file=.env.local scripts/verify-empty.mjs
node --env-file=.env.local scripts/verify-hosted.mjs
node --env-file=.env.local scripts/check-public-bundles.mjs
```

Tests use disposable in-memory PostgreSQL (PGlite), apply **every migration**, and exercise anonymous/editor/outsider/service-role authorization, draft/future privacy, publishing boundaries/idempotence, search, redirects, revisions, rate limits and fixture cleanup. No test article is sent to the production project. Other tests cover unsafe URLs/embeds, publication validation, SEO indexing/canonicals and the staging gate.

With the loopback preview running:

```powershell
$env:TEST_ORIGIN='http://127.0.0.1:3003'
npm run test:smoke
node scripts/audit-seo.mjs
```

The smoke script expects zero public articles and inactive form providers. For production-mode SEO checks, build with `STAGING=false` into a separate ignored directory using `NEXT_DIST_DIR=.next-launch-check`, run that build on loopback, and set `EXPECT_INDEXING=true` for `scripts/audit-seo.mjs`. This is QA only, not public deployment. Rebuild the normal `.next` directory with the intended environment before launch.

## Supabase installation and access

The selected project's public schema was verified empty before changes. The older project exposed by the MCP was inaccessible; no migration was sent to it. The authenticated Supabase CLI targeted **only** `tvdnsqmvxxencezenzwx`.

For a new dedicated installation, inspect the existing schema first, then apply all files in `supabase/migrations/` in filename order and run `supabase/seed.sql`. The seed inserts only categories/settings and is repeatable. To regenerate it after changing defaults:

```powershell
npx tsx scripts/seed-generate.ts
```

The current schema includes articles, categories/relationships, authors, managed media, revisions, public settings, redirects and private editor membership. Explicit table grants are combined with RLS, invoker functions, per-statement membership checks and private Storage policies. Anonymous users cannot enumerate editor membership or call the save/publishing RPC. Public article/media visibility uses the same database eligibility rule.

`supabase/config.toml` declares disabled public registration and allowed callback URLs. Those settings were pushed and verified on the selected project. Local config alone does not change hosted settings. Configure production SMTP and review Auth site/redirect URLs before launch. Remove local callback URLs when they are no longer needed.

The explicitly authorized administrator invitation was sent through Supabase. Acceptance/delivery must be confirmed by the recipient. Its redirect is `http://127.0.0.1:3003/auth/callback/`, so keep that local server running while accepting it. The recipient sets their own password; no password was chosen or exposed by the agent. No author profile was created from the administrator account.

The callback handles PKCE codes, invite/recovery token hashes, and the default invitation's browser fragment. The fragment client clears credentials from browser history before setting its session. Server guards validate the user and require an actual `editor_members` record. Recovery/sign-in use persistent rate limits; there is no public registration form. Hidden navigation is never the access boundary.

For a future explicitly authorized invitation:

```powershell
node --env-file=.env.local scripts/invite-editor.mjs REAL_EDITOR_EMAIL ALLOWED_CALLBACK_URL
```

That command sends an email, creates the invited Auth identity and allowlists it; use it only with the recipient's authorization. To allowlist an existing real Auth user through an administrative SQL session:

```sql
insert into public.editor_members(user_id)
values ('REAL_AUTH_USER_UUID') on conflict do nothing;
```

Verify real sign-in, recovery, cookie refresh, sign-out, media/editor UI and private previews with the invited owner. Content lifecycle fixtures belong in isolated staging, never as production articles.

## Publishing later

The article editor now includes **Import an article and its images**. Choose a Markdown file and multiple JPEG/PNG/WebP/AVIF files; images match by filename or a unique numbered prefix (01, 02, 03). Review unmatched images using the picture selectors, select the cover, enter the actual image permission/source, and import into the editor. The importer supports headings, paragraphs, lists, standalone Markdown images, and the existing Image/Alt markers. It excludes the Publishing Package and Pinterest notes from the public body while reading SEO metadata. Imports stay unsaved in the editor until Save article is used; uploaded images are stored in the media library and can be reused after an interrupted import. Review suggested categories, author, and draft/published status before saving. No author biography is inferred.

Article pages present each numbered heading, its image, and then its text in one reading column, with a left contents index on desktop and uncropped square images up to 560px wide. The homepage shows up to six latest published articles directly after Explore by Season.

The studio provides honest dashboard counts, filtered/paginated article lists, an empty Create Article editor, categories, SEO preview, real author profiles, media management, authenticated previews, revision restore, publish/unpublish, historical-slug redirects and scheduling. Opening the editor does not create or autosave an article. Add only actual authors with permission to display their identity.

Blocks support paragraphs, H2/H3, lists, links, images/captions and controlled YouTube/Vimeo embeds. Raw HTML is never rendered. Server schemas reject unsafe links/embeds and invalid references. Publishing requires an author, publication time and body; future publication uses scheduled status. SEO title/description lengths are guidance, not search-engine character limits.

Images require alt text, source/rights information and focal point. Uploads accept JPEG/PNG/WebP/AVIF up to 10 MB and 40 million decoded pixels, strip metadata, resize to 2400 pixels and encode WebP. SVG uploads are rejected. Managed objects stay in the private `editorial` bucket. Only assets belonging to eligible articles or intentionally selected public hero/category settings are accessible anonymously. Signed links expire after 60 seconds; previously downloaded copies cannot be revoked.

Atomic `save_article` updates relationships and retains prior revisions/editor identity. Restore produces a draft and preserves the displaced state. Historical slugs remain reserved for the same article, and redirects resolve only to eligible public content. Unpublishing hides the page and removes it from search/feed/sitemap/public media queries. Authenticated responses are no-store/noindex. Previously opened browser history can retain downloaded pages; fresh requests must be denied.

Dates are stored in UTC. The editorial timezone defaults to `America/New_York` and is configurable; public dates and the editor use it. Reading time is calculated from actual article words. Blank article/author pages return 404 rather than a demonstration URL.

## SEO and performance

Every public template has descriptive metadata, complete Open Graph/Twitter metadata and a configurable production origin. Pagination uses distinct self-referencing canonicals. Search is noindex and does not inherit the homepage canonical. Known empty category hubs stay noindex even if their category indexing toggle is enabled; they become eligible only with real published guides. About needs configured publisher/story text. Real author biographies require eligible published articles. Incomplete policies are absent/404; configured policies remain noindex for review.

Sitemap queries paginate through eligible records, fail visibly on data errors and omit empty/private/test URLs. Article lastmod uses stored meaningful updates. No fake ratings, credentials, dates or article counts are emitted. Organization/WebSite, breadcrumbs, real-author ProfilePage and future published-article BlogPosting markup use actual data. Search Console and Pinterest tokens are editable, but ownership verification must occur with those providers on the actual domain.

The public site keeps editor/auth libraries out of public route bundles. Fonts are licensed, self-hosted WOFF2 subsets with only the primary faces preloaded. The default hero uses prebuilt AVIF/WebP variants from 480–1536px (`docs/hero-variants.json`) and high fetch priority; managed custom heroes use Next image optimization. Seasonal/feature image sizes match their actual compact layout. Below-the-fold assets remain lazy loaded. No tracking or advertising scripts are installed.

`src/app/public-design.css` holds the shared public layout, 1440px maximum width, fluid gutters and compact vertical spacing. `src/lib/collections.ts` provides category presentation, separate from editable taxonomy/publishing data. Mobile hero photographs remain integrated backgrounds; text and search remain real HTML.

## Hosting, staging and scheduling

Deploy on a Node-capable Next.js host. This is not a static export. Set the user-selected verified HTTPS `SITE_URL`, configure TLS and the preferred hostname/redirects, and build with the intended environment. No public deployment, ownership verification or purchase has been claimed.

Keep `STAGING=true` on private staging. Use host-managed authentication or set `REQUIRE_STAGING_AUTH=true`, `STAGING_AUTH_USER` and a random `STAGING_AUTH_PASSWORD` of at least 24 characters. The included Basic gate fails closed if required credentials are absent, uses constant-time comparison, and returns noindex/no-store challenges. Serve it over HTTPS. Local loopback development may leave the gate disabled. Public brand/font/image assets are not confidential. The cron endpoint retains its own bearer authentication.

`vercel.json` declares a per-minute publishing job. Confirm that the actual host/plan supports it. Another scheduler can call `GET /api/cron/publish/` every minute with `Authorization: Bearer <CRON_SECRET>` from its secret manager. Never put the secret in a URL. The database-time publisher is service-only and idempotent; future articles never qualify early. Application mutations and successful publishing invalidate the root layout. Do not add shared caching to authenticated responses or cache live article HTML at an external proxy.

The connected local endpoint and database publisher can be checked with zero articles. This does not establish that a hosting scheduler is active. Verify its execution/logging, cache transitions and time boundaries in isolated staging before scheduling real content.

Before a requested public launch, finish real publisher/policy details, hosted editor workflows, TLS/domain redirects, SMTP, selected delivery providers, staging protection, restore procedures and the active host scheduler. Run:

```powershell
node --env-file=.env.local scripts/check-launch.mjs
node --env-file=.env.local scripts/verify-empty.mjs
```

Set `STAGING=false` only for the intended production build/host. The zero-count script requires exact zero across every article status; missing credentials or database errors are UNVERIFIED, never assumed zero.

## Integrations and policies

| Integration | Current state |
| --- | --- |
| Supabase PostgreSQL/Auth/Storage | Connected, migrated, taxonomy-only seed, public signup disabled, private bucket and hosted checks verified. Recipient completion of the editor/password workflow remains to be confirmed. |
| Contact | Public `mailto:quietnookk@gmail.com` link configured. Resend endpoint implemented but inactive without provider key, verified sender, recipient, privacy wording and a reachable rate limiter. |
| Newsletter | Buttondown double opt-in endpoint implemented. Hidden unless credentials, privacy wording, enabled setting and `NEWSLETTER_VERIFIED=true` are supplied after real delivery testing. |
| Search Console / Pinterest | Editable claim tokens; ownership not yet verified. |
| Analytics / advertising | Not installed. Select deliberately and review actual consent/privacy requirements before adding. |
| Domain / hosting / cron | Configured source and deployment preparation; no public deployment or active host scheduler claimed. |

Forms validate input server-side, reject cross-origin submissions and use persistent database rate limiting. Configure a trusted reverse proxy that strips spoofed forwarding headers and preserves the correct origin/client IP. Unavailable backends fail closed. A provider-accepted response is not described as confirmed inbox delivery.

Supply real operator identity, About text and policies covering the actual processors, contact details, retention, cookies/tracking and affiliate operations. No legal/business facts were invented. YouTube/Vimeo content loads only for real articles with that block; assess consent requirements before using embeds. There is no decorative cookie banner.

## Backups and recovery

Full database/Auth backups and Storage object bytes are separate. Configure encrypted backups/PITR according to the selected Supabase plan, copy them to an owned destination and test a full restore in a separate project. Preserve migrations, real Auth users, editor membership, settings, content, revisions and Storage policies. Database backups contain object metadata, not object bytes.

The full `supabase db dump` attempt on this machine was blocked because Docker/Podman is not installed. Do not claim full disaster recovery from the following limited application export:

```powershell
node --env-file=.env.local scripts/application-backup.mjs backups/YYYY-MM-DD
npx tsx scripts/verify-backup-restore.ts backups/YYYY-MM-DD
```

This exports application tables and hashes the JSON, then restores it into disposable in-memory PostgreSQL only. It excludes Auth credentials, rate-limit counters and object bytes. Auth-ID stand-ins in that isolated drill satisfy foreign keys and are not restored working accounts. The real current export/restore is recorded in `docs/backup-restore-verification.json`.

Managed editorial object backup/restore:

```powershell
node --env-file=.env.local scripts/media-backup.mjs backup backups/media-YYYY-MM-DD
node --env-file=PRIVATE_RESTORE_PROJECT_ENV scripts/media-backup.mjs restore backups/media-YYYY-MM-DD
```

The helper paginates media records, downloads private bytes and records SHA-256 checksums. Restore validates filenames/hashes and refuses conflicting overwrites. Restore database metadata separately; the helper does not create media rows. The current editorial backup contains zero objects, truthfully. `scripts/verify-storage.mjs` separately demonstrated a real private object restoration in a temporary QA bucket that was removed afterward.

Encrypt and copy backups off this computer. During full recovery, restore actual Auth/database data into a separate project using Supabase's supported workflow, recreate bucket/policies, restore object bytes, verify counts/RLS/editor membership/media, revoke old sessions and rotate keys as appropriate, then switch the host. The studio JSON export is a convenience settings/category/author export, not a complete database backup.

## Brand assets and regeneration

`public/brand/` contains genuine SVG mark/wordmark masters, monochrome SVG/PNG variants, transparent exports, sharing art, favicon and touch/app icons. Clear space is at least one quarter of the house mark height. Use the compact icon below 180px wordmark width; minimums are 24px icon/180px horizontal wordmark.

`docs/asset-manifest.json` records provenance, generated-image rights, dimensions, sizes, alt treatment and focal points. `docs/hero-variants.json` documents the additional static hero derivatives. Do not use the approved screenshot as a production asset. Lora/DM Sans font licenses are in `public/fonts/`.

```powershell
node scripts/prepare-hero-variants.mjs
```

Optional regeneration from original generated sources: `scripts/prepare-assets.mjs`, `scripts/prepare-redesign.mjs`, and `scripts/prepare-collections.mjs`. The manifest records source paths; generated source images remain in the original generated-images directory. Keep production derivatives and provenance records together.

## References

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Auth SSR](https://supabase.com/docs/guides/auth/server-side), [backups](https://supabase.com/docs/guides/platform/backups).
- [Google pagination/canonicals](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- [Resend API](https://resend.com/docs/api-reference/emails/send-email), [Buttondown double opt-in](https://docs.buttondown.com/double-opt-in).
- Installed Next.js version documentation under `node_modules/next/dist/docs/`.
