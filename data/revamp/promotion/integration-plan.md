# How a promoted slice reaches the sitemap

Written by revamp step 6.6. `scripts/revamp/promote_band.py` decides which pages are promoted and
appends them to `data/revamp/promotion/promoted.ndjson`. This file states the exact change that
turns that ledger into sitemap entries. The change is not made here: `lib/corpus/sitemap.ts` and
`scripts/corpus-20k/load/materialise.ts` are outside this slice, and two other agents are working in
that tree.

## What the ledger holds

One JSON object per promoted page, appended, never rewritten:

```json
{"sliceId": "slice-0001", "promotedOn": "2026-10-04", "key": "K1:001L2FE0M3",
 "slug": "rapamycin", "url": "https://rnawiki.com/d/rapamycin", "tier": 1,
 "model": "LONGEVITY", "present": 21, "applicable": 23, "hubMemberships": 3,
 "thresholds": "thresholds-v5.json"}
```

`sliceId` groups a slice; `promotedOn` is the date the slice was submitted and is what the 28-day
settling period is measured from.

## The hook: one flag, not two

`/sitemaps/tier-1.xml` and `/sitemaps/tier-2.xml` are rendered on request from
`corpus_pages.indexable` (`lib/corpus/sitemap.ts`, `tierSitemapEntries`), and the same column
decides the page's own robots directive (`app/d/[slug]/page.tsx`:
`robots: pageRobotsMetadata({ index: corpus.indexable, follow: true })`). Both read one flag, so the
promotion belongs in the one place that sets it. In `scripts/corpus-20k/load/materialise.ts` that is:

```ts
const indexable = tier <= 2 && pageType !== 'stub' && presentFieldCount >= threshold
```

The change is to widen that one expression, and nothing else:

```ts
// Promoted pages: data/revamp/promotion/promoted.ndjson, written by scripts/revamp/promote_band.py
// under the staged rule in docs/specs/revamp-2026-09.md 6.6. A page listed there is indexable at
// its measured field count, which is below the tier threshold by construction. `tier <= 2` still
// holds, so no Tier 3 page can enter a sitemap through this path.
const promoted = await loadPromotedSlugs()   // Set<string>, empty when the ledger does not exist
const indexable =
  tier <= 2 && pageType !== 'stub' && (presentFieldCount >= threshold || promoted.has(page.slug))
```

`loadPromotedSlugs` reads the ledger once per run:

```ts
async function loadPromotedSlugs(): Promise<Set<string>> {
  const path = resolve('data/revamp/promotion/promoted.ndjson')
  if (!existsSync(path)) return new Set()
  const slugs = new Set<string>()
  for (const line of (await readFile(path, 'utf8')).split('\n')) {
    if (!line.trim()) continue
    const record = JSON.parse(line) as { slug: string; tier: number }
    if (record.tier <= 2) slugs.add(record.slug)   // the guard again, at the read
  }
  return slugs
}
```

After that, `scripts/revamp/weekly.sh` reloads only the tiers that gained pages:

```bash
npx tsx scripts/corpus-20k/load/materialise.ts --tier <n> --revamp --production-confirmed
npm run discovery:indexnow -- --tier <n> --submit
```

The sitemap needs no code change at all. It already lists exactly the indexable rows, and
`SITEMAP_CHILDREN` has no `tier-3` member, so Tier 3 cannot be named even by mistake.

## If the sitemap must move without a reload

Should a promotion ever need to reach the sitemap without reloading the tier, the alternative is a
union inside `tierSitemapEntries`. It is second choice because it advertises a page whose own robots
tag would still say `noindex` until the next load, which is exactly the contradiction the single
flag avoids. If it is done anyway, it must carry the tier guard and must be paired with the same
ledger read in `app/d/[slug]/page.tsx`:

```ts
export async function tierSitemapEntries(tier: 1 | 2): Promise<SitemapEntry[]> {
  const promoted = await loadPromotedSlugs()
  const records = await loadCorpusFacetRecords()
  return records
    .filter((record) => record.tier === tier && (record.indexable || promoted.has(record.slug)))
    // …unchanged from here
}
```

## Invariants this must not break

- Tier 3 stays `noindex` and absent from every sitemap. Two guards hold it: `tier <= 2` in the
  indexable expression, and `promote_band.py` exiting 3 if a Tier 3 page ever reaches the residual
  band (a tier with no recorded threshold contributes no band pages, and Tier 3 has none).
- `robots.txt` is untouched by any of this.
- A promoted page is advertised and marked indexable by the same flag, in the same load.
- The ledger is append-only. Nothing removes a page from it; a slice that fails its measurement
  stops the *next* slice rather than retracting itself.

## Reading Search Console

`promote_band.py` reads both inputs step 6.6 names: `data/revamp/gsc/ingested.parquet` from
`gsc_ingest.py`, and `data/revamp/gsc/<date>/index-coverage.csv` from `gsc_pull.py`. It reads the
pull's CSV directly rather than through the ingest, because `gsc_ingest.py`'s column matcher looks
for `coverage state` and `last crawled` while the API pull writes `coverage_state` and
`last_crawl_time`; routed through the ingest, a credentialed pull would produce rows with an empty
`index_state` and the gate would report no data. Reading the pull's own file avoids that entirely.
Adding `"coverage_state"` and `"last_crawl_time"` to the `column(...)` alias lists in
`scripts/revamp/gsc_ingest.py` (lines 313–315) would also make the ingest route work, and is worth
doing when that file is next touched; the promotion rule does not depend on it.
