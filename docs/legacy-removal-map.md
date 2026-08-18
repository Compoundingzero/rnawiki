# Legacy route removal map

How the old RNAwiki product's routes are handled in this rebuild. The old product is gone from this
branch; its last state is tag `legacy-rnawiki-before-proof-boundary`, branch
`archive/legacy-rnawiki`.

## Method

The old product had no server-side route table: `server.js` was a static file server plus a small
JSON API, and pages were static HTML written by `build/prerender.js` from `site/app.js`'s
client-side router. So the route list here is the crawled inventory the old repo's own SEO audit
committed — `audit/v19/live_route_inventory.csv`, 641 routes from a running instance — read with
`git show legacy-rnawiki-before-proof-boundary:audit/v19/live_route_inventory.csv`.
`audit/v19/seo_discovery_audit.md`, `server.js`, `site/app.js` and `build/prerender.js` were read
the same way for what the CSV didn't explain. That is how the discrepancies below were caught.

## Prefix rule (`middleware.ts`)

1. **Exact override.** Look up `legacy_redirects` by exact `fromPath`. Found → 301 to its `toPath`,
   or 410, per that row's `statusCode`. Seeded by `scripts/seed-legacy-redirects.ts`.
2. **Compound pages** (`/c/<slug>`, `/t/compound/<slug>`). Nothing in step 1 → look for a
   **published** entity at the same slug under `/r/`. Found → 301 there; not found → 410. This is a
   live DB check, so an entity launched later redirects correctly with no new seed row.
3. **Anything else under a removed prefix** → 410, unconditionally. No successor exists.

No dead route is ever redirected to the homepage. Each is a real 301 to its actual successor or a
real 410.

## Prefixes handled

| Old prefix | Crawled | Disposition |
|---|---|---|
| `/c/<slug>` | 172 | 301 to `/r/<slug>` if a published entity exists there, else 410 (per request) |
| `/t/compound/<slug>` | 0 (below) | Same rule as `/c/`, per this task's instruction |
| `/exercise`, `/exercise/*` | 1 | 410 — exercise reference, no successor |
| `/goal/*` | 16 | 410 — goal-based protocol hubs, no successor |
| `/protocol/*` | 52 | 410 — the protocol builder, exactly what this rebuild removes |
| `/target/*` | 103 | 410 — molecular target pages, no successor |
| `/pathway`, `/pathway/*`, `/pathways`, `/pathways/*` | 17 (`/pathway/0`–`/pathway/15` + `/pathways`) | 410 — no successor |
| `/learn`, `/learn/*` | 6 (`/learn` + `/learn/0`–`/learn/4`) | 410 — learn hub, no successor |
| `/solve`, `/solve.html` | 1 (`.html` never crawled, defended anyway) | 410 — the symptom finder, exactly what this rebuild removes |
| `/plan`, `/plan/*` | 1 (no sub-routes crawled, defended anyway) | 410 — the protocol builder |
| `/p`, `/p.html`, `/p/*` | 1 (`/p/abc123`; `.html` never crawled, defended anyway) | 410 — community protocol shares |
| `/interest` | 0 (below) | 410 — old expression-of-interest form |
| `/newsletter` | 0 (below) | 410 — old newsletter signup |

**`/t/compound` is not a page route.** `build/prerender.js` shows `/t/<template>` was never a
requestable URL. It is the *value* the old analytics beacon sent instead of a real URL:
`aTemplate()` in `site/app.js` mapped every route to a coarse template name so the real `/c/<slug>`
URL, which discloses a reader's health interest, was never transmitted. The crawl agrees — zero
`/t/*` rows in 641 routes. The rule is kept as instructed, a harmless no-op.

**`/interest` and `/newsletter` predate the tag.** Comments in `build/prerender.js` record
`/interest` folded into `/` on 2026-08-08 and `/newsletter` removed on 2026-08-06. Neither is in the
crawl. Both still 410, in case of stale backlinks from before those dates.

## Explicit 301s (`scripts/seed-legacy-redirects.ts`)

The instructions named three slugs as `/c/{slug}` → `/r/{slug}`. Cross-checking the crawled
inventory **and** the current seed content found two did not hold literally.

| Instructed | What is actually true | Row seeded |
|---|---|---|
| `/c/bpc-157` → `/r/bpc-157` | The old site really served `/c/bpc-157` and the new slug really is `bpc-157`. Matches. | `/c/bpc-157` → `/r/bpc-157`, 301 |
| `/c/rapamycin-longevity` → `/r/rapamycin-longevity` | The old site served `/c/rapamycin-sirolimus` (confirmed in the crawl); `/c/rapamycin-longevity` was never real. The new entity (`scripts/seed-data/rapamycin-longevity.ts`) is seeded under `entity.slug: 'rapamycin'` — filename and slug differ. Seeding this literally would have 301'd a URL nobody linked to, to a URL that 404s. | `/c/rapamycin-sirolimus` → `/r/rapamycin`, 301 |
| `/c/casgevy` → `/r/casgevy` | Casgevy never existed on the old site — zero `casgevy`/`exa-cel`/`exagamglogene` hits in the 641-route crawl. The new slug is `casgevy`, so the instruction isn't broken, just not a migration of anything real. | `/c/casgevy` → `/r/casgevy`, 301, harmless safety net |

**If `rapamycin-longevity.ts`'s `entity.slug` changes before launch, `toPath` in
`scripts/seed-legacy-redirects.ts` must change with it.** It is the one row depending on content
still marked in-progress.

BPC-157 and Casgevy need no seeded row — step 2's dynamic fallback already 301s them, since old
slug equals new slug. They are seeded for explicitness and audit trail. Rapamycin is the
load-bearing row: its slugs genuinely differ, which is what the dynamic fallback cannot handle.

## Not redirect cases

**`/methodology` and `/corrections`** exist in both products and mean unrelated things. Old
`/methodology` explained the old supplement-rating methodology; old `/corrections` was a
community-edit history page. The new `app/methodology/page.tsx` and `app/corrections/page.tsx`
merely share a path, so neither gets an entry in `middleware.ts` or the redirect seed.

**`/healthz`** had no old route, so `app/healthz/route.ts` was created for Railway's health check —
see [`docs/deployment.md`](deployment.md).

## Sitemap and internal links

`app/sitemap.ts` lists only `/`, `/search`, `/methodology`, `/updates`, `/corrections`, `/privacy`
plus every published entity's `/r/<slug>` via `listPublishedEntities()` — nothing under a removed
prefix. Nothing in `app/` or `components/` links to `/c/`, `/exercise`, `/goal/`, `/protocol/`,
`/target/`, `/pathway/`, `/learn/`, `/solve`, `/plan`, `/p`, `/interest` or `/newsletter`; the only
old-style paths in the new product are in `middleware.ts` and the redirect seed data, which exist to
turn old requests away cleanly. `app/robots.ts` disallows `/admin/**`, `/api/**` (except public
`/api/v1/**`) and `/embed/**`, none of it old-product content.

## Out of scope, still open

The old site served surfaces this task named no prefix rule for: `/about`, `/anatomy`, `/az`,
`/body`, `/browse`, `/clinic`, `/compare`, `/energy`, `/fork`, `/fuel`, `/legend`, `/me`,
`/muscle`, `/physiology`, `/pro`, `/problem`, `/progress`, `/pros`, `/stack`, `/stewardship`,
`/studio`, `/surface`, `/u`, `/where`, and the old `/admin` (unrelated to this rebuild's
`app/admin`).

None has a `middleware.ts` rule, so requests fall through to Next's not-found page — a soft 404,
not the `410 Gone` that tells search engines to drop a URL. Flagged rather than silently expanded:
if any still carry inbound links worth closing out, that is a follow-up.
