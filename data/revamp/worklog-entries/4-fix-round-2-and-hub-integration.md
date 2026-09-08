### [PENDING-TIMESTAMP] Phase 4 — fix round 2 (§12) and the Phase 5 hub integration

**§12(1) The classification-absence answer is furniture wherever it renders.** `BlockBody` now
carries a `furniture` flag parallel to its paragraphs; `buildBlockBody` marks
"No regulator classification is recorded for X" in both branches that write it (the `classification`
block and the supervision block's fallback); `renderPage` pushes the paragraph with that flag, so it
leaves the furniture-free text `page_text_v5` writes by default; `CorpusParagraph` carries it to
`QuestionBlock.tsx`, which paints `data-furniture="true"`, so `rendered_dup_check.py` skips it with
the register absence table and `slop_draw.py` excludes it from test (b). New case in
`tests/test_render_safety.py`: every recorded instance is marked, the page still paints it, and no
line of the furniture-free render carries it.

**§12(2) Test (b) is evaluated over the masked block.** `ProvenanceEntry` gains `group`, named by
the render itself at each region boundary (`question:q3`, `computed`, `registration`, …), so the
draw groups the sentences a reader meets under one question and no others rather than inferring the
unit from the sentence's own shape. `slop_draw.py` builds a corpus-wide **block** census from the
provenance map (in-scope groups only: the question blocks and the Tier 3 computed section), masks
each block's sentences in painted order and joins them, and fails a block carried by more than 0.5 %
of pages. A one-sentence block is its own sentence and is held to the literal rule by construction.
The sentence-level literal reading is computed beside it and reported as `failBSentenceLiteral`,
never as the gate. The render/DOM comparison is no longer written twice: `slop_draw.py` imports
`dom_parity.py`'s extraction, fold and comparison, `dom_parity.py` hides `[data-furniture]` with the
rest of the markup and reads the furniture-free render, so one number describes parity.

**§12(3) Same-name pairs, partitioned.** `identity_apply.py` finds 189 families of live pages that
print one name and serve `<slug>` and `<slug>-<n>`, ranks them K1 > K2 > K3 > K4 with the unsuffixed
slug breaking a tie, and moves every registry study whose every recorded intervention on a losing
page is that shared name to the ranked page: **200 pages partitioned, 5,281 studies moved off 102 of
them**; 2,799 studies stayed because their interventions named more than the shared name and 78
pages record no study at all.

**§12(4) Combination products sharing a component.** A combination page is a `COMBO:{…}` key or a
proper name carrying the FDA's own conjunction; 119 such pages, **71 of them share a component with
another, across 149 pairs**. A study stays where its interventions name the product's full component
set, moves to the sibling whose set they name, or goes to the component page that records the same
study: **787 studies moved off 8 pages**, including the 41 and 25 that `ABP 980` and `CT-P6` — codes
that sit on the shared trastuzumab UNII — had put on Herceptin Hylecta and Phesgo. The Phesgo study
whose intervention reads "Phesgo (trastuzumab og pertuzumab)" stays on Phesgo. Each of the 71 pages
now opens with `Recorded components: A · B · C.`

**§12(5) 351(a) merges.** The FDA Purple Book licenses **109** suffixed proper names under `351(a)`
whose UNII is the unsuffixed INN page's; R1 licenses the merge and the biosimilar exception does not
apply. Those pages merged into the INN page (proper name kept as a synonym, slug redirected), taking
the corpus from 28,818 to **28,709** live pages. `biosimilar_of` is now kept only where a `351(k)`
row licenses the page: **81 edges kept**, 76 removed by the merges and 1 by the licence test.
`redirect-plan-v5.csv` holds **174 rows**; `redirect_check.py --plan` over it: universe 9,857, 8,863
served directly, 1,044 by one hop, **0 orphans, 0 chains, 0 conflicts — PASS**.

**§12(6) Hub integration.** The member page's Hubs row (`CorpusHubRow` on the view model,
`components/dossier/corpus/HubRows.tsx`, rendered after `RelationsRows` on the full page and inside
`StubRecord`, which is the noindex leaf the row exists for); the `hubs.xml` sitemap child
(`SITEMAP_CHILDREN`, `hubsSitemapEntries`, the `sitemapChildEntries` branch and the
`populatedSitemapChildren` guard, with `countHubs()` added to `lib/hubs/queries.ts`);
`scripts/revamp/hubs_load.ts` sequenced after `materialise.ts` and documented as a Phase 7 section
of `docs/specs/deployment-plan.md`; `/h` linked from the site footer as "Compare by target, class or
pathway", the home page's frozen bar untouched; and §10's display-name rule applied in
`materialise.ts`, `page_text_v5.ts` and `hubs_build.py` from one shared implementation, so the
dossier, the measured text and the hub print one name.

**§10 display names.** `printedDisplayName` replaces an all-caps register string with a `common`,
`inn` or `merged-page` synonym that names the same record — the register's bracketed vocabulary tag
removed, and a `merged-page` name accepted only where it is the display name with the register's
trailing qualifier removed. `CLOBETASOL` → `Clobetasol`, `POTASSIUM CITRATE ANHYDROUS` →
`Potassium Citrate`. A synonym naming a shorter substance (`Dapagliflozin` on
`DAPAGLIFLOZIN PROPANEDIOL`) is a different record and never replaces the register string.

**Four defects the parity check found on the way, all fixed in the generator.**

1. **`hubs_load.ts` could not find its own inputs.** `new URL(import.meta.url).pathname`
   percent-encodes a space, so under a checkout named "Claude Projects" the loader resolved
   `.../Claude%20Projects/...` and failed with `ENOENT` on `hubs.ndjson`; the hub tables stayed
   empty and `sitemap.xml` correctly advertised no `hubs.xml`. `fileURLToPath` decodes it.
2. **A question block with an empty body painted its heading.** §1 forbids a heading over an empty
   body and `renderPage` drops such a block; `lib/corpus/dossier-page.ts` did not, so
   `/d/sodium-carbonate` painted "More Sodium Carbonate was worse in human: at what point?" with
   nothing under it. The page now drops a block with no paragraph and no row, exactly as the render
   does.
3. **Two controlled-substance schedules rendered in two orders.** `page_controlled` has no order of
   its own; the template sorts by jurisdiction, list and schedule, and the render used the stored
   order. The render now applies the same sort (§11: the render mirrors the painted order).
4. **The render named counterparts the merges had absorbed.** `page_text_v5` took its page universe
   and its name map from the tier map, which still names every page the corpus-20k run created; the
   loader takes both from the identity revision. After the 109 §12 merges the render was naming
   `Insulin Lispro-Aabc` as an interaction counterpart on pages whose own record had merged into
   `Insulin lispro`. The render now covers exactly the keys `--identity` holds, and names a
   counterpart only where that revision holds a page for it.

**Measured, after the fixes.**

*The render.* `page_text_v5.ts` now covers the corpus the loader loads: **28,657 pages**
(28,832 in the tier map, 175 of them absent from `canonical-v5`), 1,302,166 sentences, every one
carrying provenance, 12,125,284 words furniture-free (mean 423.1) and 15,990,631 with furniture
(mean 558.0), 366,173 furniture lines. 594 pages print a readable synonym in place of an all-caps
register string.

*The ruler.* `thresholds-v7`, over the furniture-free text: Tier 1 **20** present-and-applicable
fields, **300 indexable**, positional 0.196653 and lexical 0.349686, both under the lines; the same
300 pages score 0.216595 / 0.360600 on the with-furniture text, which is over both and is why §11
makes the furniture-free figure the gate figure. Tier 2 stands at 20 with one page, as it has on
every ruler since `thresholds-after`, and Tier 3 selects **none**: thirteen candidate counts from 3
to 15 were scored (19,798 pages down to 5) and not one holds both lines, so no Tier 3 page is
indexable — which is also what the deployment invariant requires.

*The loaded build.* 28,657 `corpus_pages`, **301 indexable** (304 before; the three that went are
indexable pages the 351(a) merges absorbed), **968 hubs** and 14,214 hub members — `hubs_load.ts`
skipped 79 members whose page a merge absorbed and 4 hubs left under five loadable members, and
counted both rather than publishing a short hub.

*Parity.* `dom_parity.py` over a seeded 200-page sample: **0 render lines not painted, 0 painted
lines not in the render, 0 out of order**. `tests/test_render_safety.py` **17 passed**, the parity
case included.

*Redirects.* `redirect_check.py` on `redirect-plan-v5.csv`: plan — universe 9,857, 8,863 served
directly, 1,044 by one hop, **0 orphans, 0 chains, 0 conflicts**; live against the local build —
9,857 slugs, 8,884 answered 200 and 973 answered 308, **0 failures**.

*The hub integration, on the build.* `/h` 200 and linked from the footer; `/d/bicalutamide` paints
its Hubs row; `sitemap.xml` lists `sitemaps/hubs.xml`; `sitemaps/hubs.xml` holds **969 URLs** (968
hubs and the index); no Tier 3 slug is in any child.

*What the same-name partition did to the ruler.* **None of the 102 pages the partition took studies
from falls below its tier's threshold as a result, and the reason is worth stating: the threshold
counts present-and-applicable fields, and the partition moves registry studies, which are not one of
them.** Six of the 102 were indexable before and are indexable after. §12 expected a "-2" page left
with nothing of its own to fall below the line; on this corpus the line does not read the registry,
so it does not move. The honest state of those pages is what the field ruler already said about
them: 96 of the 102 were below the line before the partition and are below it after.

*The paths this run touched, for the next reader.* The identity revision this run publishes is
`canonical-v5` and everything downstream reads it: `page_blocks.py`, `tier3_sections.py`,
`page_text_v5.ts`, `materialise.ts`, `rendered_dup_check.py`, `slop_draw.py`, `redirect_check.py`,
`build_release.py` and `hubs_build.py`. The render is `data/revamp/render-v7`; `render-v5`,
`render-v5-with-furniture` and `render-v6` are deleted, and `.gitignore` now ignores the v7 text,
provenance and `pages-all` files while keeping the three small evidence files beside them —
`summary.json`, `summary-with-furniture.json` and `dom-parity.json` — trackable.

*Migrations.* `0026`–`0030` replay on a disposable database (`with-disposable-database.ts` →
`npm run db:migrate`, twice in one run) and `npx drizzle-kit check` reports no drift.

*The gate.* `npm run gate` green end to end after `rm -rf .next/cache`: typecheck, lint (0 errors;
one pre-existing unused-directive warning in `scripts/design-study/measure.ts`), the copy and
content checks, `check:seo` 24 files / 279 tests, format, `drizzle-kit check`, `test:unit` 178 files
/ 2,601 tests, `test:integration` 26 files / 167 tests, `build`, and `test:e2e` 30 passed.
