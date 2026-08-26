# Search migration runbook

Snapshot: 2026-08-24

Use this runbook when deploying or validating the move from the retired RNAWiki URL space to the
current `/d/{canonicalSlug}` evidence pages. A redirect is an assertion that two URLs represent the
same resource. Never redirect an unrelated retired URL to the homepage merely to avoid a 404.

## Authoritative legacy inventory

The recovered source is the old repository's committed live crawl:

```sh
git show legacy-rnawiki-before-proof-boundary:audit/v19/live_route_inventory.csv
```

The CSV has one header plus 641 crawled URLs. Its companion context is
`audit/v19/seo_discovery_audit.md`, `server.js`, `site/app.js`, and `build/prerender.js` at the same
git ref. The preserved interpretation can also be read with:

```sh
git show proof-boundary-rebuild:docs/legacy-removal-map.md
```

Do not reconstruct the migration list from today's router: the 641-URL crawl records what the old
running product actually exposed, including routes that no longer exist in source.

The implemented retired families found in that crawl include 172 `/c/{slug}` compound pages, 52
`/protocol/*`, 103 `/target/*`, 16 `/goal/*`, 17 pathway routes, six learn routes, and the smaller
exercise/solve/plan/community-plan families. `/t/compound` was an analytics template value rather
than a crawled browser route, but it is handled defensively as requested.

## Current response contract

| Request                                                                                                                                                                   | Current behavior                                                                                                                                                                                                                                    | Owner                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `/d/{oldSlug}`                                                                                                                                                            | Resolve an owner-curated historical rename or merge before a retained old medicine row. Redirect permanently to `/d/{canonicalSlug}` only when the ledger points directly to a public target; otherwise fail closed.                                | `app/d/[slug]/page.tsx`, `lib/queries/drugs.ts`       |
| `/c/{slug}`                                                                                                                                                               | Normalize the slug, apply the verified `rapamycin-sirolimus` → `rapamycin` exception, and resolve an owner-curated history entry, exact/case slug, or unique public alias. If a public medicine exists, 301 to `/d/{canonicalSlug}`; otherwise 410. | `app/c/[slug]/route.ts`, `lib/seo/legacy-response.ts` |
| `/t/compound/{slug}`                                                                                                                                                      | Same resolver and 301/410 behavior as `/c/{slug}`.                                                                                                                                                                                                  | `app/t/compound/[slug]/route.ts`                      |
| Bare `/c` or `/t/compound`                                                                                                                                                | 410 Gone.                                                                                                                                                                                                                                           | `middleware.ts`, `lib/seo/legacy-routes.ts`           |
| Deeper `/c/{slug}/...` or `/t/compound/{slug}/...`                                                                                                                        | 410 Gone; only an exact one-segment identity may reach the database resolver.                                                                                                                                                                       | `middleware.ts`, `lib/seo/legacy-routes.ts`           |
| `/exercise*`, `/goal*`, `/protocol*`, `/target*`, `/pathway*`, `/pathways*`, `/learn*`, `/solve`, `/solve.html`, `/plan*`, `/p*`, `/p.html`, `/interest*`, `/newsletter*` | 410 Gone because no safe evidence-page successor exists.                                                                                                                                                                                            | `middleware.ts`, `lib/seo/legacy-routes.ts`           |
| `/r/{slug}`                                                                                                                                                               | Resolve through the same terminal identity ledger; one 301 directly to `/d/{canonicalSlug}`, or 410 when no safe terminal identity exists.                                                                                                          | `app/r/[slug]/route.ts`, `lib/seo/legacy-response.ts` |
| `/compounds`                                                                                                                                                              | 301 to `/browse`.                                                                                                                                                                                                                                   | `next.config.mjs`                                     |
| `/evidence`, `/methodology`, `/how-editing-works`                                                                                                                         | 301 to `/how-it-works`.                                                                                                                                                                                                                             | `next.config.mjs`                                     |

Gone responses are plain-text 410 with `X-Robots-Tag: noindex` and a one-day public cache. Compound
route handlers implement both GET and HEAD. Unknown routes not covered by this table fall through to
the normal Next.js 404; do not assume every one of the 641 URLs has a special response without
checking the inventory and tests.

An unresolved exact `/c/{slug}` or `/t/compound/{slug}` resolver emits the structured
`legacy_compound_unresolved` server event; `/r/{slug}` emits `legacy_record_unresolved`. Each contains
only the legacy family and URL pathname and deliberately excludes query strings, cookies, headers,
referrers, user agents and IP addresses. Use those events to compare real incoming backlinks with
the archived crawl and owner-curated slug ledger. A log entry is a mapping candidate, not evidence
that two medicine identities are equal.

The rule is intentionally simple:

1. 301 only when the successor medicine or merged explanation is verified.
2. 410 when the retired intent has no equivalent.
3. Never blanket-redirect old paths to `/` or `/browse`.
4. Never include an old URL, a redirect target with a query string, or a 410 URL in the sitemap.

## Owner-curated canonical slug history

`medicine_slug_redirects` is the authoritative ledger for a verified medicine rename or merge. It
is deliberately separate from `drug_aliases`: a search synonym is not proof that an old public URL
represented the same medical entity. Migration `0013_canonical_slug_history.sql` creates the ledger
empty and performs no inferred backfill.

Each entry requires:

- the exact lowercase `old_slug` that was previously public;
- the stable internal `target_drug_id`, which is not assumed to equal the public slug;
- an explicit `RENAMED` or `MERGED` reason; and
- a non-empty owner rationale recording why the old and target identities are the same resource or
  why the target is the verified successor.

Before adding an entry, the owner must check the archived route inventory, the retained medicine
records, the proposed public target and any relevant identity evidence. Do not derive this ledger
from similarly spelled names or from aliases. Retaining the old `drugs` row for audit history is
expected: an explicit ledger entry takes precedence over that row during public route resolution.

The resolver permits one hop only. If the target slug is itself present as an `old_slug`, the
request fails closed instead of creating a chain or loop. The target must remain a public medicine
identity; its dossier may still be `noindex` when the separate reviewed-publication policy fails.
Direct and case-only canonical slugs are checked after the historical ledger. Aliases remain a
last-resort match: every retained alias owner is resolved through the ledger first, and all owners
must converge on exactly one terminal public record. This prevents `alias -> old slug -> target`
chains.

After inserting or changing a mapping, verify `/d/{oldSlug}`, `/r/{oldSlug}` and the retired compound
routes with GET and HEAD. The old URL must have exactly one permanent redirect to a 200 canonical page,
and only that canonical page may appear in the sitemap. Record the rationale and observed response
in the migration manifest; do not deploy an unreviewed SQL guess.

## Pre-deployment verification

Run the automated contracts:

```sh
npm run check:seo
npx vitest run tests/unit/legacy-search-routes.test.ts
npx tsx scripts/with-disposable-database.ts -- npx vitest run tests/integration/canonical-slug-history.test.ts
```

Against the release candidate, check GET and HEAD for a representative set from the actual CSV:

```sh
curl -sS -o /dev/null -D - https://rnawiki.com/c/rapamycin-sirolimus
curl -sS -o /dev/null -D - https://rnawiki.com/c/not-a-current-medicine
curl -sS -o /dev/null -D - https://rnawiki.com/protocol/example
curl -sS -o /dev/null -D - https://rnawiki.com/d/rapamycin
curl -sS -I https://rnawiki.com/c/rapamycin-sirolimus
```

Expected results:

- the mapped compound returns one 301 hop to the canonical `/d/` URL;
- the unknown compound and removed protocol return 410, not 200 and not a homepage redirect;
- the canonical dossier returns 200, has a self-canonical, and is indexable only if the shared
  reviewed-publication policy passes;
- GET and HEAD agree on status and `Location`;
- every 301 destination returns 200 without another redirect; and
- `/sitemap.xml` contains the canonical destination only.

Save the status, `Location`, canonical, robots directive and final URL for every migrated URL in a
CSV. Diff it against the 641-row source inventory before launch. Any unexpected 200, chain, loop,
homepage redirect or lost high-value backlink is a release blocker.

## Google Search Console launch procedure

1. Before deployment, export Performance pages/queries, Page Indexing, Links and Crawl Stats so the
   old URL state and traffic have a dated baseline.
2. Deploy the 301/410 rules and production crawl guard together. Confirm that Googlebot can fetch
   the old URLs; do not block retired paths in `robots.txt`, because Google must see the 301/410.
3. Submit `https://rnawiki.com/sitemap.xml`. It should contain only 200, self-canonical URLs.
4. In URL Inspection, live-test samples from every response class: same-slug 301, override 301,
   unknown compound 410, each gone prefix, indexable dossier, non-indexable dossier, and browse.
   Confirm page fetch, crawl permission, indexing permission and Google-selected canonical.
5. Request indexing for a small set of the most important canonical destinations. Use the sitemap
   for bulk discovery; URL Inspection has submission limits and does not guarantee indexing.
6. In Page Indexing, start **Validate fix** only after representative live tests pass. Track the
   validation log rather than repeatedly restarting it.
7. Monitor weekly until legacy crawl volume and impressions fall: old URLs should move to
   redirected/not-found states, canonical dossier submissions should not produce duplicate or
   alternate-canonical spikes, and server logs should show no sustained 5xx response class.

Use Search Console **Temporary Removals** only when a retired URL/prefix must disappear from Google
urgently and truly has no successor. A removal hides results for about six months; it is not a
permanent deletion and does not replace the 410. Do not submit a mapped 301 family for removal when
the goal is to transfer its signals to a canonical successor. Google documents the distinction in
its [Removals tool guidance](https://support.google.com/webmasters/answer/9689846) and the live-test
workflow in [URL Inspection](https://support.google.com/webmasters/answer/12482179).

## IndexNow foundation and follow-up

IndexNow is a follow-up notification channel for participating search engines, not a replacement
for the sitemap, internal links, 301/410 responses or Google Search Console.

The implemented foundation is disabled by default. On canonical production, configure
`INDEXNOW_ENABLED=true` and `INDEXNOW_KEY`; the app then serves that public ownership key at
`/indexnow-key.txt`. New, non-idempotent programme publications re-query the complete shared search
policy after commit and notify only an eligible canonical base dossier. Submission failures are
logged and cannot roll back or alter publication.

`notifyExplicitIndexNowChange` validates and batches explicit redirect/removal/deletion URL lists,
but it is intentionally not attached to a merge, retirement or deletion workflow that does not yet
exist. After the migration is stable, the owner must:

1. generate and configure an IndexNow key, then verify the production key-file response;
2. explicitly connect verified merge/retire/delete transactions before submitting their old and
   destination URLs;
3. batch no more than 10,000 URLs per POST and record response codes/retries;
4. keep the 641-row migration manifest as the first one-time batch/audit log; and
5. retain the sitemap, HTTP status and Search Console checks as the authoritative discovery path.

IndexNow explicitly accepts added, updated, redirected and deleted URLs; see its
[official documentation](https://www.indexnow.org/documentation). Google is handled through its
sitemap and Search Console workflows above.

## Rollback and maintenance

- Do not remove a working 301 merely because impressions have moved. Keep legacy mappings while
  backlinks, logs or search crawls still use them.
- If a 301 target becomes non-public, fail closed to 410; never let it chain through a guessed slug.
- Add a slug override only after checking the archived CSV and the current canonical identity.
- Re-run the full manifest diff after changes to `middleware.ts`, `legacy-routes.ts`,
  `legacy-response.ts`, `/c`, `/t/compound`, or canonical slug resolution.
- If Search Console selects a different canonical, first inspect status chains, canonical markup,
  internal links and sitemap membership; do not paper over the mismatch with another blanket rule.
