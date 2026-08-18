# Legacy route removal map

How the old RNAwiki product's routes are handled in this rebuild. The old product is fully
removed from this branch; its last state is preserved at git tag
`legacy-rnawiki-before-proof-boundary` and branch `archive/legacy-rnawiki`.

## Method

The old product had no explicit server-side route table to read off — `server.js` is a static
file server + small JSON API, and pages were static HTML files written by `build/prerender.js`
(driven by `site/app.js`'s client-side router) for every route the site considered "real". So
the actual route list used here is the crawled inventory the old repo's own SEO audit already
produced and committed:

- `audit/v19/live_route_inventory.csv` (641 routes, crawled from a real running instance) —
  read via `git show legacy-rnawiki-before-proof-boundary:audit/v19/live_route_inventory.csv`
- `audit/v19/seo_discovery_audit.md`, `server.js`, `site/app.js`, `build/prerender.js` — read the
  same way, for context on anything the CSV alone didn't explain

This is more reliable than re-deriving the route list from source, and it's how the discrepancies
below were caught.

## Prefix rule (implemented in `middleware.ts`)

For any request path under a legacy prefix:

1. **Exact override**: look up `legacy_redirects` (`db/schema.ts`) by exact `fromPath`. If found,
   301 to its `toPath` or 410, per that row's `statusCode`. Seeded by
   `scripts/seed-legacy-redirects.ts` — see below for what's actually in it and why.
2. **Compound pages** (`/c/<slug>`, and `/t/compound/<slug>` — see note below): if step 1 found
   nothing, look up a **published** entity at the same slug under `/r/`. Found → 301 there.
   Not found → 410. This is a live DB check, not a static list, so an entity launched after this
   file was written still redirects correctly with no new seed row.
3. **Everything else under a removed prefix**: 410, unconditionally. No successor exists, so
   there is nothing to redirect to.

This deliberately does **not** redirect any obsolete page to the homepage — every dead route is
either a real 301 to its actual successor or a real 410, per the rebuild spec.

## Prefixes handled, and what they used to be

| Old prefix | Old route count (crawled) | Disposition |
|---|---|---|
| `/c/<slug>` | 172 | 301 to `/r/<slug>` if a published entity exists there now, else 410 (dynamic, per-request) |
| `/t/compound/<slug>` | 0 (see note) | Same rule as `/c/`, per this task's instruction |
| `/exercise`, `/exercise/*` | 1 | 410 — exercise reference pages, no successor |
| `/goal/*` | 16 | 410 — goal-based protocol hubs, no successor |
| `/protocol/*` | 52 | 410 — the protocol builder; explicitly the kind of feature this rebuild removes |
| `/target/*` | 103 | 410 — molecular target pages, no successor |
| `/pathway/*`, `/pathway`, `/pathways`, `/pathways/*` | 17 (`/pathway/0`…`/pathway/15` + `/pathways` index) | 410 — biological pathway pages, no successor |
| `/learn`, `/learn/*` | 6 (`/learn` + `/learn/0`…`/learn/4`) | 410 — learn hub, no successor |
| `/solve`, `/solve.html` | 1 (`/solve`; `.html` never crawled, defended anyway) | 410 — the symptom finder; explicitly the kind of feature this rebuild removes |
| `/plan`, `/plan/*` | 1 (`/plan`; no crawled sub-routes, defended anyway) | 410 — the protocol builder |
| `/p`, `/p.html`, `/p/*` | 1 (`/p/abc123`; `.html` never crawled, defended anyway) | 410 — community protocol share pages |
| `/interest` | 0 (see note) | 410 — old expression-of-interest form |
| `/newsletter` | 0 (see note) | 410 — old newsletter signup |

Counts marked "0" or "defended anyway" mean the crawl found no live page there — see the note
below on why some of these prefixes are still worth handling defensively.

### `/t/compound` is not actually a page route

Reading `build/prerender.js` (the file that both writes the static pages *and* runs a
build-time assertion over the analytics beacon's vocabulary) shows `/t/<template>` — including
`/t/compound` — was never a URL a browser could request. It's the *value* the old site's
privacy-preserving analytics beacon sent instead of a real URL (`aTemplate()` in `site/app.js`
maps every real route to a coarse template name like `/t/compound` specifically so the real
`/c/<slug>` URL, which discloses a reader's health interest, is never transmitted). The crawl
confirms this: zero `/t/*` rows anywhere in the 641-route inventory. This task's instructions
name `/t/compound` as a prefix to treat like `/c/`, so `middleware.ts` still does — it's a
harmless no-op given the above, kept in case that assumption is wrong or the old site had a
route this crawl didn't reach.

### `/interest` and `/newsletter` were already gone before the tag was cut

Comments in `build/prerender.js` record both as already removed by the time of the archived
state: `/interest` folded into `/` on 2026-08-08, `/newsletter` removed on 2026-08-06. Neither
appears in the crawled inventory. Still handled here (410) per this task's instructions, in case
either has stale external backlinks or search-index entries from before those dates.

## Explicit 301s (`scripts/seed-legacy-redirects.ts`)

The task instructions for this file named three slugs verbatim: `bpc-157`, `casgevy`,
`rapamycin-longevity`, as `/c/{slug}` → `/r/{slug}`. Cross-checking that against the actual
crawled old-site inventory **and** the actual current seed content
(`scripts/seed-data/*.ts`) found two of the three didn't hold up literally:

| Entity | What was instructed | What's actually true | Row seeded |
|---|---|---|---|
| BPC-157 | `/c/bpc-157` → `/r/bpc-157` | Old site really did serve `/c/bpc-157`; new entity slug really is `bpc-157`. Matches. | `/c/bpc-157` → `/r/bpc-157`, 301 |
| Rapamycin | `/c/rapamycin-longevity` → `/r/rapamycin-longevity` | Old site served `/c/rapamycin-sirolimus` (confirmed in the crawl), **not** `/c/rapamycin-longevity` — that path was never real. The new entity (`scripts/seed-data/rapamycin-longevity.ts`) is seeded under `entity.slug: 'rapamycin'`, **not** `'rapamycin-longevity'` — the filename and the slug differ. Seeding the literal instruction would have 301'd a URL nobody ever linked to, to a URL (`/r/rapamycin-longevity`) that doesn't exist and would 404. | `/c/rapamycin-sirolimus` → `/r/rapamycin`, 301 (the real old URL, to the real new one) |
| Casgevy | `/c/casgevy` → `/r/casgevy` | Casgevy never existed on the old site at all — gene-editing treatments are new to this rebuild; zero `casgevy`/`exa-cel`/`exagamglogene` hits anywhere in the 641-route crawl. New entity slug really is `casgevy`, so the literal instruction isn't *broken*, just not a migration of anything real. | `/c/casgevy` → `/r/casgevy`, 301 (harmless safety net; also redundant with middleware's dynamic same-slug fallback, since old-slug would equal new-slug here anyway) |

**If `scripts/seed-data/rapamycin-longevity.ts`'s `entity.slug` changes before launch, the
`toPath` in `scripts/seed-legacy-redirects.ts` needs to change with it** — this is the one row
here that depends on content still marked in-progress elsewhere in this rebuild.

BPC-157 and Casgevy don't strictly need a seeded row at all — middleware's dynamic same-slug
fallback (step 2 above) already 301s them correctly on its own, since old-slug equals new-slug
for both. They're seeded anyway for explicitness and an audit trail. Rapamycin is the one row
that's load-bearing: its old and new slugs genuinely differ, which is exactly the case the
dynamic fallback can't handle.

## `/methodology` and `/corrections`: not a redirect case

Both paths exist in the old product and this one, but mean something unrelated in each — old
`/methodology` explained the old site's supplement-rating methodology; old `/corrections` was a
community-edit history page. Neither is a redirect target for the other; the new
`app/methodology/page.tsx` and `app/corrections/page.tsx` are unrelated pages that happen to
share a path with retired old ones. No entry for either in `middleware.ts` or
`scripts/seed-legacy-redirects.ts` — they're just live routes in the new app.

## `/healthz`

No existing route was found under `app/healthz`, so `app/healthz/route.ts` was created,
returning a bare `200 "ok"` with no dependencies (deliberately does not touch the database —
Railway's health check, per `railway.toml`'s `healthcheckPath = "/healthz"`, should reflect
whether the Next.js process itself is up, not whether Postgres is currently reachable).

## Sitemap and internal links

`app/sitemap.ts` lists only: the static routes `/`, `/search`, `/methodology`, `/updates`,
`/corrections`, `/privacy`, plus every currently-published entity's canonical `/r/<slug>` URL
via `listPublishedEntities()`. Nothing under any removed prefix above is in it, and nothing in
the current codebase (`app/`, `components/`) links to `/c/`, `/exercise`, `/goal/`, `/protocol/`,
`/target/`, `/pathway/`, `/learn/`, `/solve`, `/plan`, `/p`, `/interest`, or `/newsletter` — the
only route in the new product that mentions an old-style path is `middleware.ts` itself, and
`scripts/seed-legacy-redirects.ts`'s seed data, both of which exist specifically to turn old
requests away cleanly. `app/robots.ts` also disallows `/admin/**`, `/api/**` (except the public
`/api/v1/**`), and `/embed/**`, none of which is old-product content — see that file.

## Scope: what this task did not touch

The old site also served a number of surfaces this task's instructions didn't name a prefix
rule for — `/about`, `/anatomy`, `/az`, `/body`, `/browse`, `/clinic`, `/compare`, `/energy`,
`/fork`, `/fuel`, `/legend`, `/me`, `/muscle`, `/physiology`, `/pro`, `/problem`, `/progress`,
`/pros`, `/stack`, `/stewardship`, `/studio`, `/surface`, `/u`, `/where`, and the old `/admin`
(a different admin, unrelated to this rebuild's `app/admin`). None of these has a
`middleware.ts` rule, so a request to any of them today falls through to Next's default
not-found page — a soft 404 (200-adjacent, not a real `410 Gone`), not what search engines are
told to fully drop. Flagging this rather than silently expanding scope: if any of these turn out
to still carry inbound links or search-index entries worth explicitly closing out, that's a
follow-up, not something this pass added rules for.
