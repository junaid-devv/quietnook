# Public design update — November 9, 2026

Implemented the latest user-approved concept in real HTML/CSS with independent optimized armchair photography. The user requested a site-wide design update, compact mobile space usage, fewer decorative labels, consistently positioned navbar arrows, and hero photography that remains a background on phones.

## Changes

- A single public stylesheet replaces the conflicting legacy hero, header and collection styles. Shared width, gutter, section-spacing and radius tokens align public pages.
- Regular self-hosted serif headings, a real italic face, a self-hosted semibold sans-serif, consistent SVG icons, rust buttons and restrained borders.
- A searchable hero with a cream contrast overlay and shallow wave edge. Photography stays absolutely positioned behind the copy at all widths. No separate mobile photo block.
- Compact mobile category heroes, four room shortcuts per row, a horizontally scrollable seasonal shelf, and two-column collection cards. Final cards fill available width when a grid has an odd number of items; responsive image sizes account for that width.
- Consistent room/season directories, category pages, search, About, Contact, and footer. Removed redundant hero/category eyebrow labels and oversized mobile decorative photos.
- Identical 15px desktop chevrons, centered against navigation labels. Click, outside dismissal, keyboard focus and Escape behavior remain available; phone menu controls have explicit accessible names.
- New default hero setting and taxonomy/settings-only seed; studio image validation accepts both the new and legacy assets. Existing connected installations can select the new asset in Settings without overwriting custom configuration.

## Verification

### Compact spacing revision

- Follow-up balance adjustment: the user requested a little more side spacing after reviewing the compact layout. The current shared maximum is 1440px with fluid 20–64px desktop gutters and 18–22px phone gutters. This supersedes the wider values and measurements below; compact vertical spacing is retained.
- Widened the shared public layout from 1280px to a 1600px maximum; header and content use the same gutters. Reduced desktop section spacing from up to 56px to 24–32px, with 24px on phones.
- Removed forced hero heights and reduced padding. At a 1536px viewport, the homepage hero measures approximately 395px tall and the left gutter 38px; at 390px it measures approximately 277px tall, with photography remaining an absolute background.
- Reduced header, shortcuts, category heroes, feature panels, directory imagery and footer spacing. Collection photos use a shallower desktop crop to avoid replacing saved whitespace with taller cards. Reading width remains restrained.
- TypeScript and all 21 route smoke checks passed against the refreshed production preview. Browser checks covered 35 page/viewport combinations across seven public pages at 320, 390, 760, 1101 and 1536px; no page-level horizontal overflow or out-of-viewport H1 boxes were found. Results: `output/playwright/responsive-compact-audit.json`.
- Visually reviewed desktop homepage and mobile homepage/category layouts. Updated screenshots: `output/playwright/home-compact-desktop.jpg` and `output/playwright/home-compact-mobile.jpg`.

- Production build and TypeScript checks passed.
- Existing test suite: 3 tests passed, including isolated PostgreSQL security/publishing checks and fixture cleanup.
- Route smoke checks passed against both development and optimized local production servers, including search, empty categories, 404s, admin protection and unconfigured delivery guards.
- Browser audit: 43 page/viewport combinations at 320, 360, 390, 430, 760, 768, 1024, 1101 and 1440 CSS pixels. No page-level horizontal overflow or out-of-viewport H1 boxes in those checks. One H1 per checked page. Audit saved in `output/playwright/responsive-approved-audit.json`.
- Reviewed homepage, topic/room/season layouts, directories, About, Contact and search. Saved desktop and mobile screenshots in `output/playwright/` with `approved` in their names.
- Browser-confirmed chevrons: all three are 15 × 15px with zero vertical center difference from their adjacent labels. Seasons dropdown remained inside the viewport.
- Hero search submission reached the expected results URL and truthful empty state. Escape closes a dropdown while retaining its mobile parent menu, then closes that menu and returns focus to its trigger.
- Named solid-color contrast checks passed for 17 text/background combinations at 4.5:1 or greater. This is not a full imagery/gradient or WCAG conformance audit.

No articles, drafts, outlines, authors or public demo content were created. The local unconfigured public site returns no articles. **The production database count is unverified:** `npm run verify:empty` reported absent production credentials. No zero-production-record claim is made. No public deployment or live database change was performed.

No Lighthouse, field performance or hosted integration result is claimed. The optimized local preview runs at `http://127.0.0.1:3002/` while its server is active.
