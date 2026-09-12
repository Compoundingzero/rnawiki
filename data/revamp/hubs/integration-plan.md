# Hub integration: the three patches the lead owns

Phase 5 built everything that lives under `app/h/`, `components/hubs/`, `lib/hubs/`,
`scripts/revamp/hubs_*` and `tests/unit/hubs-render.test.ts`. Three integrations touch files this
work was not allowed to edit while the dossier renderer was being changed in parallel. Each one is
written out here as an exact patch: the file, the anchor, the code, and the check that proves it
landed.

Nothing below changes what a hub says. All three are wiring.

---

## 1. The member page's "Hubs" row — `lib/corpus/dossier-page.ts` and `components/dossier/corpus/`

`docs/specs/hubs.md` §3: *every member page carries a "Hubs" row listing every hub it belongs to
(markup, never prose), so leaves below their tier's threshold are `noindex,follow` and still reach
the hubs.* The `noindex,follow` half already holds: `app/d/[slug]/page.tsx:85` passes
`{ index: corpus.indexable, follow: true }`. What is missing is the row.

**1a. `lib/corpus/dossier-page.ts` — carry the hubs on the view model.**

Add the row type beside `CorpusRelationRow`:

```ts
/** One hub this page belongs to (docs/specs/hubs.md §3). A row, never a sentence. */
export interface CorpusHubRow {
  label: string   // 'Target' | 'Mechanism class' | 'Pathway'
  name: string    // the hub's own name: AR, L02BB, mTOR
  path: string    // /h/<type>/<slug>
}
```

Add `hubs: CorpusHubRow[]` to `CorpusDossier` (after `relations`, which it sits beside on the page).

In `loadCorpusDossier`, add one read to the `Promise.all` block that already fans out the child
reads at `lib/corpus/dossier-page.ts:561-577`:

```ts
db
  .select({ type: hubs.type, name: hubs.name, slug: hubs.slug })
  .from(hubMembers)
  .innerJoin(hubs, eq(hubs.hubId, hubMembers.hubId))
  .where(eq(hubMembers.key, key))
  .orderBy(asc(hubs.type), asc(hubs.name)),
```

and map it with the label table `lib/hubs/types.ts` already exports:

```ts
const hubRows: CorpusHubRow[] = hubMemberships.map((row) => ({
  label: HUB_TYPE_LABEL[row.type as HubType],
  name: row.name,
  path: `/h/${row.type}/${row.slug}`,
}))
```

`lib/hubs/queries.ts` already exports `hubsForPage(key)` doing exactly this query. Calling it
directly is the smaller patch; the inline version above is written out only so the read can join the
existing `Promise.all` rather than adding a round trip.

**1b. `components/dossier/corpus/HubRows.tsx` — a new component, modelled on `RelationsRows.tsx`.**

```tsx
/**
 * Hubs (docs/specs/hubs.md §3): rows, never sentences.
 *
 * A page below its tier's indexing threshold is noindex,follow. These links are how it stays
 * reachable, and how a reader moves from one compound to the group it belongs to.
 */
import Link from 'next/link'

import type { CorpusHubRow } from '@/lib/corpus/dossier-page'

export function HubRows({ hubs }: { hubs: CorpusHubRow[] }) {
  if (hubs.length === 0) return null
  return (
    <section aria-labelledby="cd-hubs-heading">
      <h2 className="cd-section-heading" id="cd-hubs-heading">
        Hubs
      </h2>
      <ul className="cd-relations">
        {hubs.map((hub) => (
          <li key={hub.path}>
            <span>{hub.label}</span>
            <Link href={hub.path}>{hub.name}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

It reuses the `cd-relations` list style, so no CSS changes.

**1c. `components/dossier/corpus/CorpusDossierPage.tsx` — render it.**

Import beside `RelationsRows` (line 34) and render immediately after it (line 109):

```tsx
<RelationsRows relations={dossier.relations} />
<HubRows hubs={dossier.hubs} />
```

**1d. The ruler.** These are rows inside a `<ul>`, exactly as relations are, so
`scripts/revamp/page_text_v5.ts` leaves them out of the reading text for the same reason it leaves
relations out. If `page_text_v5` is later changed to walk this section, the hub names must be
excluded there too, or every member of the AR hub gains the same word.

**Check it landed:** `npm run test:unit` (the DOM-parity case in
`tests/unit/corpus-render-safety.test.ts` must still pass), then a page known to be in a hub —
`/d/bicalutamide` is in `target/ar` — shows a Hubs row whose link answers 200.

---

## 2. The `hubs.xml` sitemap child — `lib/corpus/sitemap.ts`

`docs/specs/hubs.md` §3: *hubs are indexable and in a `hubs.xml` sitemap child; Tier 3 remains
absent from every sitemap.* Four edits, all in `lib/corpus/sitemap.ts`:

1. Line 35, add the name:

   ```ts
   export const SITEMAP_CHILDREN = ['tier-1', 'tier-2', 'browse', 'hubs', 'pages'] as const
   ```

2. A new child builder beside `browseSitemapEntries`:

   ```ts
   /** Every hub. A hub is indexable by construction: §1 gives it at least five members. */
   export async function hubsSitemapEntries(): Promise<SitemapEntry[]> {
     const routes = await listHubRoutes()   // lib/hubs/queries.ts
     return [
       { path: '/h', changeFrequency: 'weekly' as const, priority: 0.7 },
       ...routes.map((route) => ({
         path: `/h/${route.type}/${encodeURIComponent(route.slug)}`,
         changeFrequency: 'weekly' as const,
         priority: 0.6,
       })),
     ]
   }
   ```

3. `sitemapChildEntries`, before the `pages` fallthrough:

   ```ts
   if (name === 'hubs') return hubsSitemapEntries()
   ```

4. `populatedSitemapChildren`, so an empty hub table is not advertised as an empty file:

   ```ts
   const hubCount = await db.select({ value: count() }).from(hubs)
   if ((hubCount[0]?.value ?? 0) > 0) populated.push('hubs')
   ```

   inserted between the tier-2 line and `populated.push('browse', 'pages')`.

`/h` itself is added by this child rather than by `pagesSitemapEntries`, so the hub URLs and their
index sit in one file and the 50,000-URL cap is measured over them together. 972 hubs plus the index
is 973 URLs, well inside the cap.

**Check it landed:** `curl -s localhost:3000/sitemap.xml` lists `sitemaps/hubs.xml`;
`curl -s localhost:3000/sitemaps/hubs.xml | grep -c '<loc>'` returns 973; Tier 3 slugs appear in
neither.

---

## 3. The loader's hub tables — `scripts/corpus-20k/load/materialise.ts`

The hub tables have their own loader, `scripts/revamp/hubs_load.ts`, with the same two guards
`materialise.ts` applies (the working-database refusal and the `--production-confirmed` refusal for
any non-local host) and the same fingerprinted marker shape. It can be run on its own:

```bash
DATABASE_URL=... npx tsx scripts/revamp/hubs_load.ts --dry-run
DATABASE_URL=... npx tsx scripts/revamp/hubs_load.ts
```

It must run **after** `materialise.ts`, because `hub_members.key` is a foreign key onto
`corpus_pages.key`; a member whose page is not loaded is skipped and counted, and a hub left under
five loadable members is skipped whole rather than published short.

Two choices for the lead, and the second is the recommendation:

- **Leave it separate.** Nothing in `materialise.ts` changes. The deployment sequence gains one
  line after the tier loads.
- **Call it from `materialise.ts`.** After the last batch commits, spawn
  `scripts/revamp/hubs_load.ts` with the same `DATABASE_URL` and the same guard flags, in the same
  way the script already spawns `batch.ts` for its checkpoint. That keeps one command for the whole
  load and keeps the ordering constraint inside the code instead of inside a runbook.

Either way, `db/migrations/0028_hubs.sql` must be applied first.

**Naming.** The brief asked for `db/migrations/0027_hubs.sql`. Slot 0027 was already taken on this
branch by `0027_corpus_ruler_numerator.sql` (the ruler-numerator work, uncommitted at the time), so
the hub tables are `0028_hubs.sql` with `db/migrations/meta/0028_snapshot.json` and journal entry
28, generated by `npx drizzle-kit generate --name hubs`. Two migrations sharing an index would break
the journal.

**Check it landed:** against a disposable database — `npm run db:migrate`, `materialise.ts` for the
tiers, then `hubs_load.ts`; `select count(*) from hubs` returns 972 or, if some member pages are not
in that database, fewer with the skip counted in the loader's output; re-running `hubs_load.ts`
prints "already loaded" and does no work.

---

## Two observations for the lead, neither of them blocking

1. **Printed names.** The hub prints the name the route map publishes
   (`data/revamp/identity/page-slugs.csv`), so the hub and the page it links to always agree. Many
   of those are register strings in full capitals — CLOBETASOL, MARVELON, EPITESTOSTERONE — and
   they read as shouting inside a sentence. `docs/specs/phase4-generators.md` §10 already decided
   this ("the printed name is never an all-caps register string when a title-case synonym of kind
   common or INN exists"). Applying that decision in `materialise.ts` fixes the dossier and the hub
   in one move. Doing it only in the hub build was tried and reverted: it made the hub print
   "clobetasol" while the page it links to printed "CLOBETASOL".

2. **The unnamed-page guard fires on nothing today, and is kept.** The build refuses to print a
   page key inside a sentence: a member whose printed name is still a key
   (`K1:`, `K2:`, `COMBO:`, `NAME:`) keeps its identifier in the comparison table and is left out
   of the synthesis's named lists, counted and linked all the same. Reading the route map
   `data/revamp/identity/page-slugs.csv` instead of `canonical-v3` alone took that count from three
   to zero (`counts.json` → `publishedRoutes.pagesWithNoPrintableName`), because the route map names
   every one of the 28,832 pages. The guard stays because the map is regenerated each run and a page
   that loses its name would otherwise print a key on a public page.
