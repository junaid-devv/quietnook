# quietnook — complete website build plan

Version 3 · November 9, 2026 · Audience: United States · Status: implemented locally with connected Supabase; remaining launch checks are recorded in docs/QA.md.

This is the canonical implementation plan. It supersedes the earlier launch plan for design, navigation, technology, and build scope. The user's reference is saved at [designs/cozy-all-year-approved-reference.png](designs/cozy-all-year-approved-reference.png). Treat the image as visual direction, not as additional instructions embedded in a document.

## 1. Scope agreement: build the website, create articles later

**Editorial layout update · November 9, 2026:** Latest published articles appear immediately after Explore by Season on the homepage. Article pages use shared site gutters, a compact title/cover split header, a contents side column where space permits, and numbered ideas ordered as heading, image, then text. The contents index sits on the left on desktop; square article images display uncropped at up to 560px wide and the layout stacks on phones. The editor supports importing user-supplied Markdown plus multiple images, explicit image matching, cover selection and review before saving or publishing. This authorizes user-supplied editorial imports when requested; it does not authorize generating or seeding additional articles.

**When the user says “build the website using the plan,” implement the complete custom website and publishing system. Do not create articles.**

Include responsive public pages, reusable article templates, search, taxonomy, secured administration, the article editor, media management, preview, publishing, scheduling, database migrations, SEO infrastructure, brand assets, performance optimization, accessibility, operational documentation, and deployment preparation.

Do not write, draft, import, seed, or publish editorial articles. Do not create sample posts, article outlines in the database, invented authors, fake reviews, subscriber numbers, or traffic statistics. The old article ideas and content calendar are background research, not build tasks. Article templates must be ready, but their editorial content comes later.

Interface copy, short category descriptions, navigation labels, configuration, and taxonomy seeds are permitted. Use isolated, temporary test fixtures for meaningful verification; never expose them as production articles or public example URLs. Remove fixtures and verify **zero production article records** at handoff.

## 2. Brand and positioning

- **Name:** quietnook.
- **Audience:** US readers interested in approachable decorating, small-space living, organization, DIY projects, and seasonal celebrations.
- **Editorial connection:** practical ideas for real rooms, manageable projects, rental limitations, and limited storage. Small spaces and seasonal decorating belong to one coherent publication.
- **User-selected production domain:** `quietnook.com`, supplied November 9, 2026. The public contact address is `quietnookk@gmail.com`. Keep the origin configurable. Actual DNS/hosting and Search Console/Pinterest ownership verification remain separate from this configuration; no purchase or trademark assertion is made.
- **Voice:** warm, useful, clear US English. Avoid unsupported “expert-approved,” “tested,” or popularity claims.

## 3. Design system and logo

**Listing refinement · November 9, 2026:** Use shared bordered cream cards with consistent image crops, padded text, readable titles and a clear guide link across home, categories, search and author listings. A single article uses an image-and-text split on desktop and stacks on mobile; two articles use two columns, larger sets use three columns with responsive reductions. Keep published guides ahead of related collections on category pages. The homepage retains Latest ideas immediately after Explore by Season and omits the duplicate small-space promotional banner below Explore your home.

**Approved design update · November 9, 2026:** The user's latest concept is saved as `designs/cozy-all-year-current-approved-concept.png`. Use its quiet armchair photography, clear cream area behind the heading, forest-green type, rust italic emphasis, restrained search form, and shallow wave transition. This updates the original visual reference. The user also authorized applying consistent typography, gutters, spacing, cards, and controls across the public site. On mobile, hero photographs remain integrated backgrounds behind readable text; do not stack a separate hero image below the copy. Keep mobile layouts compact and omit decorative taglines or redundant labels. Preserve the article/content restrictions in section 1.

Preserve the reference's warm cream canvas, forest-green serif headings, rust accents, cozy interior photography, circular line icons, and seasonal image cards. Standardize spacing, image treatment, border radii, shadows, capitalization, and icon strokes across the site.

**Spacing revision · November 9, 2026:** The user requested substantially less empty space throughout the site, then slightly more side spacing to keep sections and images from feeling stretched. Use a shared 1440px maximum public layout width with fluid 20–64px side gutters, 18–22px phone gutters, and 24–32px section spacing. Keep reading columns narrower for legibility. Hero height follows its content and compact padding instead of a large minimum height; retain integrated mobile background photography. Keep category heroes, shortcut rows, feature panels, and footer spacing similarly compact.

| Token | Starting value | Use |
| --- | --- | --- |
| Background | `#FFF9F4` | Main canvas |
| Surface | `#FFFFFF` | Cards, menus, inputs |
| Forest | `#153528` | Headings and brand |
| Rust | `#A6381B` | Buttons, links, selected states |
| Peach | `#F7E4DA` | Quiet decorative surfaces |
| Body | `#252B27` | Paragraphs and labels |
| Muted | `#5C645E` | Supporting text |
| Border | `#E8DCD3` | Nonessential dividers |

These are implementation starting points; verify contrast in their actual combinations. Pair one restrained editorial serif with a readable sans-serif. Self-host licensed, subset WOFF2 files and use only necessary weights. Choose final families after readability and transfer-size checks. Use fluid typography and a consistent spacing scale. Decorative hearts or brush strokes must not compete with content and should be hidden from assistive technology.

### Logo deliverables

The supplied reference supersedes the earlier generated logo. Develop one consistent **house-and-leaf mark** beside the quietnook wordmark, with a restrained rust underline if it remains clear at small sizes. Keep the core brand suitable for every season.

Deliver a genuine SVG master, horizontal wordmark, compact icon, monochrome variants, transparent PNG exports, favicon, and touch/app icons. Establish minimum size and clear space. Do not label a raster screenshot as a vector logo. The header logo links home and has an accessible brand name.

### Images and icons

Prepare independent, licensed or newly generated production imagery; the reference screenshot is not the production hero asset. Record provenance, license, dimensions, alt text, and focal point. Keep essential words in HTML. Use one lightweight SVG icon style, with readable link labels and appropriate decorative semantics.

## 4. Homepage specification

Build the page with real HTML, CSS, and responsive images, following this order:

1. **Header:** logo, Home, Decor Ideas, Small Spaces, Organization, DIY Projects, Seasons & Holidays, and search. Make active states clear without color alone. Dropdowns support clicking and keyboard interaction.
2. **Hero:** one H1, **“Cozy Home Ideas for Every Season.”** Highlight “Every Season” in rust. Supporting copy: “Decorating, organization, and seasonal inspiration for a home that feels like you.” Include a large search form with an independent accessible label, concise placeholder, and Search button. On desktop, position a cozy interior photograph on the right with a soft transition into the text area. No autoplay video or rotating carousel.
3. **Room/topic shortcuts:** Living Room, Bedroom, Kitchen, Bathroom, Balcony, Organization, DIY Projects, Seasons & Holidays. Use consistent circular icon treatments.
4. **Explore by Season:** category image cards for Christmas, Halloween, Fall, New Year's Eve, Valentine's Day, Spring, and Summer. Add “View all seasons & holidays.” Keep photo crops and label strips consistent. These link to categories, not fabricated posts.
5. **Browse Small Spaces:** a compact evergreen category section, with short descriptive copy and links to configured topics.
6. **Latest/featured ideas:** implement reusable components but show them only when real published articles qualify. No fake cards to fill space.
7. **Newsletter:** show only when a provider, privacy wording, and successful signup delivery are configured; otherwise omit it.
8. **Footer:** category links, About, Contact, applicable policies and affiliate disclosure, and verified social links. No empty social buttons.

Allow the admin to change the hero photograph, seasonal order, and featured categories without code changes. Provide a neutral evergreen fallback and manual overrides. Do not automatically select missing seasonal assets based on the date.

## 5. Mobile, responsive behavior, and accessibility

Preserve equivalent primary content and metadata across devices. Reflow the reference deliberately; do not simply shrink its desktop layout.

| Area | Desktop | Tablet | Phone |
| --- | --- | --- | --- |
| Header | Full navigation where it fits | Collapse before crowding | Logo, search, menu button |
| Hero | Text left, photo right | Split or stack based on fit | Heading, copy, search, separate photo |
| Shortcuts | Up to eight columns | Four columns | Two to four columns based on fit |
| Seasonal cards | Up to seven columns | Three or four columns | Two columns; one if text zoom needs it |
| Article listings | Three columns | Two columns | One column |
| Article body | Reading column, optional side rail | Reading column | Single readable column |

- Test widths of 320, 360, 390, 430, 768, 1024, 1280, and 1440+ CSS pixels. Choose breakpoints from actual content fit. No body-level horizontal scrolling.
- Use fluid headings, roughly 36–44px on typical phones and 60–76px on large screens, adjusted for natural wrapping. Body text should be at least 16px with comfortable line length and spacing.
- Keep the mobile search above the image. Use an art-directed crop and stored focal point. Avoid a large fixed hero height that pushes browsing far down the page.
- Keep inputs at least 16px on phones. Search submission may wrap below the input on narrow screens. Labels must remain accessible when placeholders disappear.
- Aim for 44×44px touch controls with space between them. Use visible focus, landmarks, a skip link, logical headings, meaningful links, sufficient contrast, and appropriate alt text.
- Mobile menus need named buttons, expanded state, Escape dismissal, correct focus return, and scroll handling. Trap focus only when the menu is implemented as a modal drawer.
- Support keyboard use, reduced motion, 200% text zoom, and reflow at 400% browser zoom. Avoid hover-only interactions.
- Target WCAG 2.2 AA using automated checks plus manual keyboard and screen-reader spot checks; do not claim certification from a tool score.

## 6. Navigation, taxonomy, and public routes

Rooms identify location, topics identify the type of project, and seasons identify timing. Articles can have multiple category relationships while retaining one canonical URL. Avoid duplicate hubs targeting the same intent.

| Route | Purpose |
| --- | --- |
| `/` | Homepage |
| `/decor-ideas/` | Decor topic hub |
| `/small-spaces/` | Small-space hub |
| `/organization/` | Organization hub |
| `/diy-projects/` | DIY hub |
| `/rooms/`, `/rooms/[slug]/` | Room directory and room hubs |
| `/seasons/`, `/seasons/[slug]/` | Seasonal directory and holiday/season hubs |
| `/articles/[slug]/` | Canonical article template, unpopulated at build handoff |
| `/search/?q=...` | Query-based search and pagination |
| `/about/`, `/contact/` | Publisher information and contact |
| `/privacy/`, `/terms/`, `/affiliate-disclosure/` | Policies reflecting actual operations |
| `/authors/[slug]/` | Actual author profiles, when configured |
| `/admin/` and protected children | Custom publishing dashboard |

Seed taxonomy/settings only. Additional seasonal entries may include Winter, Thanksgiving, Easter, and Fourth of July without overcrowding the homepage. Make ordering, short descriptions, images, and indexability editable. Add deeper subcategories only when real content justifies them.

### Empty-state behavior before articles exist

- Homepage displays real category navigation and imagery; latest/featured/popular article sections remain hidden.
- Known empty category pages return an intentional page with a short introduction, “New guides are on the way,” and useful category links. Keep them `noindex` until meaningful original content is available.
- Search returns truthful empty states when there are no published results. No invented trending searches or article counts.
- Unknown categories and nonexistent articles return a proper 404. Never publish an example article URL to demonstrate the template.
- Skeletons indicate real loading, not permanent absence of content.
- Admin starts with zero articles and a working Create Article action for later use.

## 7. Custom architecture

Use **Next.js App Router, TypeScript, Tailwind CSS, and Supabase PostgreSQL/Auth/Storage**, with a custom admin. No WordPress. Select supported stable versions at implementation time and commit the lockfile.

- Render public content on the server. Pre-render/cache suitable routes and use CDN asset delivery. Invalidate affected pages when settings or content change.
- Restrict client JavaScript to necessary interactions. Keep the rich-text editor and other admin libraries out of public bundles.
- Build reusable header/menu, search, category icon, season card, breadcrumb, article card/body, author, newsletter, empty-state, and footer components.
- Maintain shared design tokens and configuration. Avoid large UI, animation, and slider libraries for simple effects.
- Validate environment configuration and request inputs. Keep secrets server-only and provide `.env.example` without real secrets.
- Use versioned migrations and repeatable taxonomy/settings setup. Document local development and deployment.

## 8. Data model, access control, and administration

Create these entities without creating article records:

| Entity | Responsibilities |
| --- | --- |
| Articles | Title, stable slug, excerpt, structured body, status, author, cover media, timestamps, SEO fields |
| Categories | Name, slug, group/type, optional parent, short description, image/icon, ordering and SEO controls |
| Article-category relationships | Multiple placements without duplicate article URLs |
| Author profiles | Real identity, bio and optional portrait |
| Media | Storage key, dimensions, MIME, alt/caption, provenance/license, focal point and variants |
| Revisions | Recoverable edits with editor identity and timestamp |
| Site settings | Brand, verified origin, menus, hero, seasonal selection and integrations |
| Redirects | Historical slugs and permanent destinations, with loop prevention |

Apply Supabase row-level security and storage policies. Public access reads only public material; authorized editors manage content. Drafts and future scheduled articles must remain private. Keep service-role keys server-only. Disable open admin registration or use an explicit invitation/allowlist. Hidden navigation is not authorization.

### Required admin features

- Sign-in, sign-out, password recovery, and secure session handling.
- Honest dashboard counts and integration/configuration status.
- Article listing, filtering, pagination, draft/scheduled/published states.
- Structured rich-text editor with headings, links, lists, images, captions, and controlled embeds. Sanitize output and reject unsafe markup.
- Media upload with MIME/size validation, alt text, focal-point selection, and managed organization. Do not expose private draft assets through public listing APIs.
- Editable SEO title/description and previews. Warn about awkward length without imposing a supposed Google character limit.
- Authenticated draft preview, excluded from indexing and shared caches.
- Category assignment, preview, publish, unpublish, revisions and scheduling.
- Store dates in UTC. Display an explicit configurable editorial timezone, initially America/New_York for the US audience unless the user chooses another.
- Configure an idempotent scheduled-publishing job for the chosen host, including cache invalidation and time-boundary checks. Future timestamps must not leak content before publication.
- Slug changes create a permanent redirect. Unpublishing removes sitemap/listing entries and prevents stale cached access.
- Settings export and documented database/media backup and restore procedures.

Use one eligibility rule across pages, search, feeds, related articles and sitemap: published status, publication time reached, and no deletion/unpublish restriction. Validate public forms server-side and add appropriate rate limits. Never report successful delivery from an unconfigured backend.

## 9. Search and future article presentation

Start with indexed PostgreSQL full-text search across permitted article titles, excerpts, body text and category terms. Prioritize title relevance, validate query lengths, paginate results, and debounce optional suggestions. Add an external search service only if real scale requires it.

Build the unpopulated article template with title, optional excerpt, real author, truthful publication/update dates, cover image, body typography, heading anchors, optional table of contents, breadcrumbs, related published articles, category links and accessible Pinterest saving. Omit modules without data. Calculate reading time from actual content later; do not invent values or freshness dates.

Support article-specific Pinterest images/descriptions later without generating them now. Avoid adding a large third-party script simply to display a save link.

## 10. Optimized titles, metadata, and indexing

Use descriptive, distinct titles and headings. These are template defaults, not ranking or traffic promises. Google may choose different title links and snippets; preview lengths are guidance rather than fixed search-engine limits.

| Page | Default title | H1 |
| --- | --- | --- |
| Home | quietnook \| Home Decor, Small Spaces & Seasonal Ideas | Cozy Home Ideas for Every Season |
| Decor | Home Decor Ideas \| quietnook | Home Decor Ideas |
| Small spaces | Small-Space Decorating Ideas \| quietnook | Make the Most of Your Small Space |
| Organization | Home Organization Ideas \| quietnook | Home Organization Ideas |
| DIY | DIY Home Decor & Projects \| quietnook | DIY Home Decor & Projects |
| Seasons | Seasonal & Holiday Decor Ideas \| quietnook | Explore Every Season & Holiday |
| Christmas | Christmas Decorating Ideas \| quietnook | Christmas Decorating Ideas |
| Halloween | Halloween Decorating Ideas \| quietnook | Halloween Decorating Ideas |
| Fall | Fall Decorating Ideas \| quietnook | Fall Decorating Ideas |
| New Year's Eve | New Year's Eve Decor Ideas \| quietnook | New Year's Eve Decor Ideas |
| Valentine's Day | Valentine's Day Decor Ideas \| quietnook | Valentine's Day Decor Ideas |
| Spring | Spring Decorating Ideas \| quietnook | Spring Decorating Ideas |
| Summer | Summer Decorating Ideas \| quietnook | Summer Decorating Ideas |
| Living room | Living Room Decorating Ideas \| quietnook | Living Room Decorating Ideas |
| Bedroom | Bedroom Decorating Ideas \| quietnook | Bedroom Decorating Ideas |
| Kitchen | Kitchen Decor & Organization Ideas \| quietnook | Kitchen Decor & Organization Ideas |
| Bathroom | Bathroom Decor & Organization Ideas \| quietnook | Bathroom Decor & Organization Ideas |
| Balcony | Balcony Decorating Ideas \| quietnook | Balcony Decorating Ideas |
| Article, later | [Specific article title] \| quietnook | [Specific article title] |

Homepage description starting point: “quietnook brings together home decor, small-space living, organization, DIY projects, and seasonal inspiration for a home that feels like you.” Descriptions must match what is actually available at launch. Do not describe an empty category as a published collection of guides.

Technical requirements:

- One clear H1 and logical subsequent headings; descriptive links, readable URLs and genuine breadcrumbs.
- Editable unique metadata, self-referencing canonicals for indexable pages, Open Graph/Twitter metadata and a brand sharing image. Resolve URLs against the verified production origin.
- Sitemap includes canonical, indexable pages with useful content and real published articles only when they exist. Set `lastmod` from meaningful edits, not every request or deploy.
- Exclude search, admin, previews and thin/empty category/author pages from indexing. Authentication secures private routes; `noindex` is not access control. Do not block crawling of public URLs when relying on their noindex directive being read.
- Protect staging with authentication and noindex controls; check that production does not inherit staging exclusions.
- Use truthful Organization/WebSite and BreadcrumbList structured data. BlogPosting belongs only to real published articles later. No invented ratings, credentials or rich-result guarantees.
- Prevent arbitrary filter/query combinations from creating indexable duplicates. Ensure pagination still permits discovery of older articles when content exists.
- Implement correct HTTP statuses, error/404 pages, HTTPS, one preferred host, and consistent trailing-slash behavior.

Review category indexability when useful original content exists; a metadata toggle alone does not make a page useful.

## 11. Performance targets and implementation

These are targets for the future site. No website performance has been measured from the supplied screenshot.

| Measure | Target | Interpretation |
| --- | --- | --- |
| LCP | ≤2.5 seconds | Real-user 75th percentile |
| INP | ≤200 milliseconds | Real-user 75th percentile |
| CLS | ≤0.1 | Real-user 75th percentile |
| Lighthouse mobile performance | Aim for 95+ | Median of three consistent lab runs, not a field guarantee |
| Initial compressed public-route JS | Aim for ≤200KB | Record route and measurement method |
| Initial transferred assets | Aim for ≤1MB | First viewport under a documented test setup |

Assess Core Web Vitals separately for mobile and desktop when enough field data exists. Pre-launch lab checks cannot establish future real-user results.

- Serve responsive AVIF/WebP with fallbacks, correct `sizes`, dimensions/aspect ratios, and quality checks. Prefer a hero around 250KB where quality allows; measure actual mobile/desktop resources.
- Prioritize the real LCP image, lazy-load below-the-fold imagery, and avoid fetching a hidden duplicate hero. Do not lazy-load the LCP asset.
- Limit font weights, preload only what is necessary, and avoid large icon bundles and aggressive image-heavy prefetching.
- Reserve space for images, async UI and any future ads to prevent layout shifts.
- Index database queries, avoid N+1 fetching, and cache public data without leaking authenticated responses.
- Defer optional analytics/widgets. Add advertising only when intentionally configured, then recheck performance and layout stability.
- Measure production builds under documented mobile throttling. Record routes, environment, date, results and limitations; do not cherry-pick a score.

## 12. Integrations, policies, and operational setup

Prepare configuration for domain/hosting, Supabase, contact-email delivery, newsletter provider, analytics, Search Console verification and Pinterest claiming. Use documented configuration instead of hard-coded account details.

External access, ownership verification, subscriptions or credentials may require the user. Complete independent work first, then report each integration as **working and verified**, **implemented but awaiting configuration**, or **not included**. A mock API is not a working integration. Do not invent verification tokens or route submissions to a developer's email.

Policy pages must reflect the real operator, contact information, processors, tracking and affiliate use. Build their layouts/settings but do not invent business or legal facts. Keep incomplete policy pages private/noindex and identify required information before public launch. Configure consent behavior for the services actually used; do not add a decorative nonfunctional banner.

Include safe error logging, input validation, rich-text sanitization, secure secrets, dependency checks and restore instructions. Activate public forms only with a real delivery path. Domain purchases, paid services, connected accounts and public deployment follow the user's authorization at that time.

## 13. Build phases

1. **Foundation:** inspect project instructions, establish supported dependencies, tokens, environment validation, migrations, schema and taxonomy-only setup.
2. **Brand and shell:** produce consistent house-and-leaf logo assets; implement responsive header/menu, footer, fonts and layout.
3. **Public website:** implement homepage, topic/room/season pages, honest empty states, search, errors and the unpopulated article template.
4. **Publishing system:** implement auth/access rules, dashboard, editor, media, private previews, revisions, publishing, scheduling and redirects.
5. **Discovery and operations:** implement metadata, sitemap/robots behavior, structured data, sharing assets, integrations, policy layouts, logging and backups.
6. **Verification:** check responsive views, accessibility, authorization, publishing, search, cache invalidation and production performance. Remove temporary fixtures and verify zero articles.
7. **Handoff:** deliver source and instructions, clearly list pending external configuration, and prepare deployment. Publish only when requested and required launch settings are valid.

There is no article-production phase in this build. Editorial work begins separately when requested.

## 14. Acceptance checklist and deliverables

### Design and responsive checks

- Reference recognizable through palette, logo direction, hero, icons and seasonal cards, with consistent components across templates.
- Desktop and phone screenshots reviewed, including narrow screens, long titles, open menus, errors and empty states.
- No clipped labels or body overflow; mobile layout deliberately stacked; keyboard use, contrast, zoom and reduced motion checked.
- Independent optimized images and real text; no screenshot-as-page implementation.

### Functionality and security checks

- Category routes work; unknown URLs return 404; search returns only eligible records and truthful empty states.
- Unauthorized users cannot read drafts, modify records or upload managed media; verify server/database/storage rules.
- Isolated temporary fixtures verify preview, publish, future scheduling, unpublish, redirects, search visibility and cache invalidation, including time boundaries.
- Forms report real backend outcomes or are omitted pending configuration.
- No fake articles, authors, statistics or integration success.

### SEO and performance checks

- Titles, descriptions, H1s, canonicals, OG metadata, status codes and indexability match actual page state.
- Sitemap has no test/draft/example articles; staging protection and production indexing checked separately.
- Production-build performance results and unresolved issues recorded under consistent conditions. Field metrics marked unavailable until sufficient real traffic exists.

### Handoff package

- Complete source, lockfile, `.env.example`, versioned migrations and taxonomy/settings-only setup.
- Logo SVG/PNG/icon exports, design tokens, optimized media and asset provenance records.
- README covering local setup, deployment, administration, creating articles later, scheduling, integrations and backup/restoration.
- QA report distinguishing passed checks from unverified external dependencies.
- **Zero production articles**, with test records and temporary storage assets removed.

## 15. Reusable future build instruction

> Build quietnook using WEBSITE_PLAN.md and the supplied reference. Implement the complete custom responsive website, database, secured admin, publishing tools, SEO infrastructure, performance optimization and deployment setup. Create only taxonomy, settings, interface copy and required brand/design assets. Do not write, draft, import, seed or publish articles. Use polished empty states and prepare the article templates/editor so we can create articles later. Verify zero production article records and report integrations awaiting real credentials.

## 16. Technical references

- [Google: title links](https://developers.google.com/search/docs/appearance/title-link) and [snippets](https://developers.google.com/search/docs/appearance/snippet): accurate, descriptive metadata without fixed display-length promises.
- [Google: mobile-first indexing](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing): equivalent primary content and metadata across mobile and desktop.
- [Web.dev: Core Web Vitals](https://web.dev/articles/vitals): thresholds and percentile interpretation used above.
- [Next.js: images](https://nextjs.org/docs/app/getting-started/images), [server/client components](https://nextjs.org/docs/app/getting-started/server-and-client-components), and [metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images): recheck against the selected implementation version.
- [Supabase Auth](https://supabase.com/docs/guides/auth) and [Storage](https://supabase.com/docs/guides/storage): account/access and media setup.
- [Pinterest: claim your website](https://help.pinterest.com/en/business/article/claim-your-website): requires the actual domain and business account.
