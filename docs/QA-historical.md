# quietnook verification

## Public-page redesign — November 9, 2026

The hero reference now guides the homepage only. The public website has independent photo-led topic landings, five room pages, eleven seasonal pages, a room mosaic directory, a seasonal directory grouped into four seasons, and designed About, Contact, and Search pages. Ten new generated photographs, optimized WebP/AVIF derivatives, and a licensed bold serif subset support the redesign. Category browsing is real navigation, not sample editorial content. Repeated promotional copy and large empty-state boxes have been removed; empty category listings retain one quiet, truthful line.

The production build and all three database/content tests pass. A crawl of actual internal links verifies 26 public pages return HTTP 200 with one H1. All 21 documented image assets exist with their recorded byte sizes. The existing private-route, 404, same-origin, and unconfigured-provider smoke checks still pass. Ninety-six browser checks cover twelve page types at 320, 360, 390, 430, 768, 1024, 1280, and 1440 CSS pixels with no body overflow, missing alt attributes, or failed loaded images. Desktop and phone screenshots were visually reviewed; below-the-fold images remain intentionally lazy loaded.

Evidence: `redesign-ui-checks.json` and screenshots named `*-redesign-desktop.jpg` / `bedroom-redesign-mobile.jpg` under `output/playwright/`. Sixteen additional final rendering checks in `redesign-final-checks.json` pass after the corrected card widths and larger room-directory image. Seasonal anchor navigation and all four lazy-loaded Winter images were verified in the browser; the final page reported no captured console errors. The older screenshots and checks below describe earlier revisions, not the current design.

No articles or author records were created by this redesign. Hosted configuration, production count, provider delivery, and accessibility/performance limitations listed below remain outstanding. This redesign does not claim activation of those services.

Checked November 8, 2026 on Windows, Node 22.15, Next.js production build and loopback preview. This report distinguishes local evidence from hosted verification. No public deployment was performed.

## Passed locally

- Production compilation and TypeScript checks pass. Dependency auditing reports zero known vulnerabilities at the time of the check.
- All three test cases pass, including a disposable PostgreSQL/PGlite test that applies both migrations and taxonomy/settings seeds. It checks anonymous, editor, outsider, and service roles; draft/future privacy; denied mutations; private storage visibility; publishing boundaries and idempotence; weighted title/category search; slug redirects; revisions; unpublishing; and persistent rate limits.
- Test setup initially asserts zero article and author records. Cleanup asserts zero articles, revisions, media records, and storage objects before closing the disposable database. This test database is separate from production.
- Production smoke checks cover 21 public/private routes, meaningful empty states, status codes, protected redirects, unauthorized API access, cross-origin denial, and unavailable contact/newsletter responses. No content is created by the smoke script.
- Homepage layouts checked at 320, 360, 390, 430, 768, 1024, 1280, and 1440 CSS pixels without body overflow. Phone and desktop screenshots were visually reviewed. Hero search stays above the phone image; cards and shortcuts reflow.
- At 320 pixels, the homepage, room/season directories, an empty room hub, long search query, admin login, and 404 each have one H1, no duplicate IDs, no image missing an alt attribute, no unlabelled form controls, and no body overflow. See `ui-checks.json`; these are focused checks, not a full accessibility audit.
- Mobile navigation and desktop category dropdown dismiss with Escape and return focus to their named trigger. Search submission works by keyboard. Focus styling is visible.
- The blank editor was exercised in a temporary development-only harness: all six structured block types, removal, ordering, labels, and 320-pixel reflow. No article was saved. That harness source was removed after the check and is absent from the final build.
- Public output contains no sample articles, invented authors, fabricated statistics, or newsletter/social modules awaiting configuration. Unconfigured administration remains locked. Empty policies and nonexistent articles return 404. No guessed canonical domain is emitted.
- Generated imagery is independent of the approved reference screenshot. Optimized assets, SVG brand exports, licensed self-hosted fonts, and provenance records are included.
- Follow-up audit: author listings now use counted, stable pagination instead of stopping at 50 articles, and use the actual author name in their title. Database failures produce an error instead of a misleading empty listing. Hosted author pagination remains pending an accessible database.
- Listing page parameters now normalize fractional, repeated, non-finite, negative, and oversized inputs consistently. Boundary and malformed values were checked without creating records.
- The rendered search placeholder inherited a half-opacity color. It now explicitly uses the muted token at full opacity. `node scripts/check-contrast.mjs` verifies 17 principal text/surface pairs at 4.5:1 or greater, including white button labels. `contrast.json` records the method and limits; this is not a whole-page conformance claim.

## Performance evidence and limits

`performance.json` records the production homepage's script resources, excluding legacy-only `nomodule` code. Estimated gzip JavaScript is 148,246 bytes (about 145 KiB). The supplied hero WebP is about 225 KB before Next image optimization. The three unthrottled loopback document requests in that report are diagnostic only; they do not represent a user's page load.

Lighthouse mobile scores, throttled LCP, INP, CLS, hosted/CDN latency, and real-user Core Web Vitals are **unmeasured**. Recheck the configured production build with consistent mobile conditions and record the results before launch. No performance score or target is claimed as achieved.

## Awaiting real configuration and verification

- **Production article count: UNVERIFIED.** No production database credentials are configured. The connected Supabase project reported an inaccessible database during inspection; no migrations, test fixtures, or editorial content were sent to it. Run `verify:empty` with server credentials against the selected production project and obtain an exact count of **0 across every status** before handoff is complete.
- Select an accessible, dedicated Supabase project; inspect existing schema; apply migrations and taxonomy/settings-only seeds; disable hosted public signup; invite and allowlist the real editor. Verify hosted RLS and storage behavior separately from the local schema stand-ins.
- Exercise real sign-in, recovery, cookie refresh, sign-out, upload/download, authenticated preview, publication/unpublication, redirects, and cache behavior in isolated staging. Remove every temporary record and storage object afterward. Reverify production count without creating production articles.
- Configure the actual host, staging authentication, verified HTTPS origin, domain redirects, and per-minute cron. Check real job execution and time boundaries. `vercel.json` is preparation, not evidence of an active scheduler or eligible hosting plan.
- Supply actual publisher identity, policies and any verified social accounts. Configure and verify Resend contact acceptance/delivery and Buttondown double opt-in before enabling forms. No analytics is installed. Search Console and Pinterest ownership are pending.
- Perform a real database and object-storage backup/restore drill in isolation. The included object helper is not yet verified against a live Supabase service.
- Complete screen-reader spot checks, 200% text zoom and 400% browser zoom, and a fuller WCAG 2.2 AA review. Narrow viewport and semantic checks alone do not establish conformance.

## Plan coverage audit

| Canonical plan area | Current evidence | Remaining verification or input |
| --- | --- | --- |
| Scope / no articles | Taxonomy/settings-only SQL; disposable test cleanup assertions; no production writes | Exact production count still UNVERIFIED |
| Brand / design system | CSS tokens, real SVG/PNG/icon exports, font licenses, asset manifest, reviewed screenshots | No ownership or trademark claim made |
| Homepage / responsive navigation | Production render and eight widths; hero search, shortcuts, seven season cards, small-space links, gated modules | Actual configured hero/settings/media round trip |
| Accessibility | Named controls, headings, alt attributes, keyboard dismissal/focus, narrow reflow, contrast report; reduced-motion CSS removes transitions and smooth scrolling | Assistive technology, full zoom and whole-site audit |
| Public taxonomy / routes | Route smoke checks, known-empty hubs and proper 404s | Configured taxonomy edits and real content state transitions |
| Architecture / data model | Next/TypeScript/Tailwind/Supabase source, lockfile, validated environment, versioned migrations | Intended hosted schema application |
| Security / administration | Server guards, RLS/Storage SQL role tests, same-origin checks, private/no-store routes, editor UI | Hosted Auth/Storage and real invited-editor workflow |
| Editing / publishing | Empty structured editor, server validation, SQL revisions/redirects/search/publishing tests | Real authenticated preview, cache transitions and scheduling in isolated staging |
| Search / article presentation | Indexed weighted search with taxonomy terms; unpopulated article template and author pagination | Hosted RPC, long real titles and article/media end-to-end checks using cleaned staging fixtures |
| Metadata / indexing | Origin-aware metadata/schema/sitemap/feed, noindex empty/search/private states; 404 checks | Verified production origin; separate staging protection and production indexing checks |
| Performance | Production build, compressed-script estimate, optimized independent images and fonts | Throttled mobile runs, first-viewport transfer, hosted latency and later field data |
| Integrations / policies | Fail-closed provider endpoints, settings and policy layouts; truthful configuration states | Actual publisher text, provider credentials and delivery/ownership verification |
| Operations / deployment | Cron endpoint/config, export, backup helper, setup and restoration instructions | Host access, active job, restore drill; public deployment only if requested |
| Handoff | Source, assets, migrations, README and this evidence report | Handoff cannot be declared complete until required live checks and zero production count are proven |

## Repeatable checks

Use `npm run typecheck`, `npm test`, `npm run build`, and `npm audit`. With the unconfigured production preview running on port 3001, set `$env:TEST_ORIGIN='http://127.0.0.1:3001'` in PowerShell, then use `npm run test:smoke` and `node scripts/measure.mjs`. The smoke script otherwise defaults to port 3000. For a configured project, load the private environment and run `scripts/check-launch.mjs` and `scripts/verify-empty.mjs` as documented in the README. Neither script substitutes for the hosted checks above.

Screenshots under `output/playwright/` include the final production homepage (`home-preview.jpg`), responsive development views (which may show Next's development indicator), the blank temporary editor, and the production 404. The editor screenshot contains unsaved empty blocks only.

