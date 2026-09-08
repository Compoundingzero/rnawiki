### [PENDING-TIMESTAMP] Phase 4 — measure v8 (after fix round 3 and the 6.1 payload change)

The same ruler as measure v6 and v7, on the fix-round-3 render, every check against one build and
one at a time.

**Commands, in order.**

```
.venv-corpus/bin/python scripts/revamp/derive_threshold.py --fields-dir data/revamp/fields-v2 \
    --text-dir data/revamp/render-v8/text \
    --with-furniture-text-dir data/revamp/render-v8/text-with-furniture \
    --out data/revamp/thresholds-v8.json
.venv-corpus/bin/python scripts/revamp/derive_threshold.py --fields-dir data/revamp/fields-v2 \
    --text-dir data/revamp/render-v8/text-with-furniture \
    --out data/revamp/thresholds-v8-with-furniture.json
.venv-corpus/bin/python scripts/revamp/common_line_share.py data/revamp/render-v8/text \
    data/revamp/render-v8/text-with-furniture data/corpus-20k/render/text \
    --out data/revamp/common-line-share-v8.json
npx tsx scripts/with-disposable-database.ts -- bash <driver>
    # npm run db:migrate
    # pg_restore --data-only --no-owner --no-privileges -L <drugs, inventory_resolutions> \
    #     rnawiki-backups/corpus-20k-2026-09-05/rnawiki-pre-corpus-20k.pgcustom
    # npm run build after rm -rf .next/cache
    # materialise.ts --tier {1,3,2} --revamp --thresholds data/revamp/thresholds-v8.json \
    #     --no-checkpoint      (redirect plan v5, trial reassignments v5, duplicate holds)
    # scripts/revamp/hubs_load.ts
    # npx next start -p 3197
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3197 \
    --sample 1000 --seed 20260905 --csv data/revamp/rendered-dups-v8.csv \
    --summary data/revamp/rendered-dups-v8-summary.json
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3197 \
    --sample 1000 --seed 20260905 --indexable-keys data/revamp/indexable-keys-after.txt \
    --csv data/revamp/rendered-dups-v8-prior-set.csv \
    --summary data/revamp/rendered-dups-v8-prior-set-summary.json
.venv-corpus/bin/python scripts/revamp/redirect_check.py --base-url http://127.0.0.1:3197 \
    --out data/revamp/redirect-check-v8-local.json
.venv-corpus/bin/python scripts/revamp/link_graph_check.py --base-url http://127.0.0.1:3197 \
    --out data/revamp/hubs/link-graph-v8.json
npx tsx scripts/corpus-20k/gate2/browser-checks.ts --base http://127.0.0.1:3197 \
    --out data/revamp/browser-checks-v8.json
.venv-corpus/bin/python scripts/revamp/payload_audit.py --base-url http://127.0.0.1:3197 \
    --pages data/revamp/payload-audit-pages.txt --out data/revamp/payload-audit-after.json
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3197 \
    --seed 20260909 --per-tier 20 --text-dir data/revamp/render-v8/text \
    --out-dir data/revamp/slop-draws/draw-4
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3197 \
    --seed 20260910 --per-tier 20 --text-dir data/revamp/render-v8/text \
    --out-dir data/revamp/slop-draws/draw-5
```

Server stopped, disposable database dropped, `.next/cache` and `data/revamp/rendered-text` deleted.

**The loaded build.** 28,657 `corpus_pages`, **298 indexable** (297 Tier 1 and 1 Tier 2 — the ruler
names 298 Tier 1 pages and §13(14)'s duplicate hold takes one of them out of the index), **919 hubs**
published from the 923 the data files hold, and 13,036 hub members. `hubs_load.ts` skipped 4 hubs
and 72 memberships, which is the loader refusing a hub left under five loadable members.

**The ruler, furniture-free (§11's gate figure), against the four earlier rulers.**

| ruler | Tier 1 threshold | indexable | positional (all pairs) | lexical (size-matched) |
| --- | ---: | ---: | ---: | ---: |
| `thresholds-after` (pre-Phase-4 text) | 12 | 1,061 | 0.160173 | 0.328660 |
| `thresholds-v5` (Phase-4 text, furniture in it) | 23 | 48 | 0.198739 | 0.345081 |
| `thresholds-v6` (after fix round 1) | 20 | 303 | 0.197626 | 0.349686 |
| `thresholds-v7` (after fix round 2) | 20 | 300 | 0.196653 | 0.349686 |
| **`thresholds-v8` (after fix round 3)** | **20** | **298** | **0.174603** | **0.345610** |

Tier 2 stands at 20-with-one-page on all five rulers. Tier 3 selects none on all five: candidate 3
(19,797 pages) scores 0.600 positional and 0.655 lexical and the smallest candidate that still
holds pages, 15 (5 pages), scores 0.221 and 0.354 — no count at or above the stub floor produces a
set that holds both lines, so no Tier 3 page is indexable, which is the deployment invariant.
Tier 1's positional figure fell by 0.022 against v7 on a set two pages smaller: the §13 rules that
retired the classification answer, the register-events block and the repeated interaction and
schedule lines took shared text off every page in the set.

**The with-furniture figures, reported beside the gate and never selecting.** The 298-page set the
furniture-free text selected scores **0.196505** positional and **0.357910** lexical on the
with-furniture text — positional inside the line, lexical over it, which is why §11 makes the
furniture-free figure the gate figure. Tier 2's one page scores 0 on both.

Run separately over the with-furniture text as its own ruler
(`thresholds-v8-with-furniture.json`), Tier 1 selects **21** with **230** indexable, positional
0.195483 and lexical 0.349880, and Tier 2 selects 20 with one page. At v6 and v7 that run
reproduced `thresholds-v5`'s 23-with-48 exactly, which is what made §11's furniture argument
readable: the collapse from 1,061 pages to 48 was absence statements and not reading text. It no
longer reproduces it, and the reason is §13: retiring the classification answer, the register-events
block and the repeated interaction and schedule lines took most of that repeated text off the page
in both renders, so the two rulers now differ by three present fields and 68 pages rather than by
three fields and 252. Tier 3 selects none on this text either — candidate 3 scores 0.856 positional
and 0.790 lexical, candidate 15 (5 pages) 0.245 and 0.381.

**Repetition and page length.** Lines carried by more than half of all pages are **6.21 %** of the
corpus's words furniture-free (7 such lines, 638,192 words of 10,274,502) and **29.80 %** with
furniture (20 lines, 4,251,213 of 14,265,280). At v7 the same measures were 5.51 % and 26.77 %;
before Phase 4, 5.05 %. Median page **139 words** furniture-free and **296** with, against 209 and
349 at v7 and 80 before Phase 4. The corpus lost 1.85 million furniture-free words between v7 and
v8, which is what retiring two blocks and de-duplicating three others does; the common-line share
rose because the same seven lines now sit in a smaller total.

**Rendered duplicates: no indexable pair survives.** On the v8 indexable set (298 pages, all 919
hubs and a seeded 1,000-page noindex sample; 298 + 919 + 996 rendered, 2,213 scored at each of
390 px and 1280 px) 34,004 flagged pairs sit at or above 0.5 Jaccard and **0 of them are
indexable-to-indexable** — the trastuzumab combination pair §12(4) predicted and §13(14) held is
`noindex,follow` and out of the set. **0** hub-to-page pairs. **1,472 distinct hub-to-hub pairs**
remain at or above 0.5, against 1,865 at v7: §13(13)'s member-set dedupe removed 21 % of them and
did not remove the rest. On the 1,062-page pre-Phase-4 comparison set (1,048 keys still carry a
slug, 1,041 rendered) there are **29 distinct indexable pairs**, against 25 at v7, 26 at v6, 32 at
v5 and 19 before Phase 4.

**Redirects, local build: PASS.** Plan — universe 9,857, 8,863 served directly, 1,044 by one hop,
**0 orphans, 0 chains, 0 conflicts**. Live — 9,857 slugs, 8,884 answered 200 and 973 answered 308,
**0 failures**. Identical to v7.

**Link graph, against the build: PASS, all seven rules.** 923 hubs and 13,121 memberships in the
data files; the build publishes **919**, `/h` links every one, every one answers 200, and all
**6,052** member links those pages carry answer 200. The four hubs the build does not publish are
named in the report: `/h/class/{h01ac,h01ba,n06dx}` and `/h/target/leg3`.

**Sitemap and the frozen invariants.** The index carries five children and no Tier 3:
`tier-1.xml` **297** URLs, `tier-2.xml` **1**, `hubs.xml` **920** (919 hubs and the `/h` index),
`browse.xml` **1,839**, `pages.xml` **10**; `sitemaps/tier-3.xml` answers **404**. `app/robots.ts`
is byte-identical to `origin/main`. The frozen home search bar measures **0.00 px** against
`data/corpus-20k/gate2/browser-checks-v2.json` on every one of the bar's and the input's four box
values at 1440, 375 and 320 px, and the DOM path is the same at all three widths.

**Phase 6.1, confirmed on this build.** `payload_audit.py` over the pinned 108 pages
(`data/revamp/payload-audit-pages.txt`, the same 100 indexable slugs plus the eight step-0.3
samples the step measured before): 108 of 108 measured, RSC dossier share of the document **0.0**,
dossier text repeated in the RSC stream **0.0**, live text-to-HTML **0.155172** over all 108 and
**0.153994** over the 100-page indexable draw. Both reproduce the step's recorded figures to six
decimal places against 0.0481 before, so the floor of 0.15 is met and the 0.25 target is not.

**Slop draws 4 and 5 are not clean, and they fail in two named places.**

| | draw 4 (seed 20260909) | draw 5 (seed 20260910) |
| --- | ---: | ---: |
| pages drawn / rendered | 60 / 60 | 60 / 60 |
| sentences · row lines | 1,329 · 3,416 | 1,231 · 3,057 |
| **(a) traces to a stored field** | **16** | **13** |
| **(b) block template on ≤ 0.5 % of pages** | **3** | **2** |
| (b) sentence-level literal, reported beside | 92 | 83 |
| **(c) names a narrative device** | **0** | **0** |
| render/DOM parity, pages in agreement | 30 / 60 | 24 / 60 |

Every (a) failure is one generator and one shape: the grouped curated interaction line §13(3)
introduced — "Curated · Inhibitor of CYP1A1, CYP1A2, … with a reported magnitude · Inxight FRDB" —
carries the whole group's record ids as its trace (`frdb:ddi:16659; frdb:ddi:16660; …`), and the
trace classifier has no class for a list of them, so the line the reader meets cannot be shown to
trace to a stored value. The grouping is right and the trace is real; the provenance map has to
name the class.

The (b) failures are three blocks, two of which appear in both draws: the nearest-neighbour
sentence "it differs from X by a methyl substituent" (168 pages, 0.59 %), the trial-size block
"N at the median, M at the largest across K registered trials" (411 pages, 1.43 %) and, in draw 4
only, a mechanism question block (220 pages, 0.77 %). All three are prose sentences carrying one
computed value, which §13(7) turns into rows everywhere else; these three were missed.

**The render and the DOM no longer agree, and step 6.1's markup trim is why.** Draw 3 measured
0 divergent lines. Draws 4 and 5 measure 367 and 320 lines each way, over 30 and 36 of their 60 pages; a
separate `dom_parity.py` run over the same build, 30 pages at seed 20260909, disagrees on 15. The cause is exact: 6.1 removed the disclosure
row's `cd-row-head` block wrapper, so `<span class="cd-row-label">Ketoconazole</span>` and
`<span class="cd-row-id">A-label-statement · …</span>` are now adjacent inline siblings with no
whitespace between them. CSS separates them for a reader (`.cd-row-label + .cd-row-id` carries
`margin-left: 0.5rem`), so nothing looks wrong on screen, but every text extraction — this check's,
and a crawler's — reads `KetoconazoleA-label-statement`. The render writes the space; the page does
not carry one. This is not one of §4.7's three checks and it does not change the thresholds above,
which are measured on the render, but it does mean the render and the served text differ on those
rows and a crawler reads two fields as one word.

**Two defects in the checks themselves, both found and fixed here, both of the same kind.** Each
named a revision by hand and so read a superseded file the moment the run it was written for ended:
`rendered_dup_check.py` resolved page tiers from `data/revamp/render-v7/pages-all.ndjson` and fell
back to the corpus-20k file, silently, once fix round 3 deleted that render; `link_graph_check.py`
resolved its ruler from the list `("v7", "v6", "v5")` and so measured rule 2 against v7's 301
indexable leaves on a v8 build. Both now take the highest revision present on disk, and rule 2 was
re-run: 299 indexable leaves on the v8 ruler, all seven rules pass.

**One page in the indexable set has no key in the identity revision.** The dup check reports
`acarbose-structure-xufxoaauwzooit` — the K2 InChIKey parent of acarbose, which the loader slugs
from its structure and the check's recorded slug facts still call `acarbose-2`. The page was
rendered and scored like every other (298 requested, 298 rendered, 298 scored), and it flagged no
pair; what it lacks is a key, so a pair involving it could not have been given a reason class.

**What this measurement puts to the lead.**

1. The slop gate's two-consecutive-clean-draws bar is unmet on both draws, and the two causes are
   named above: the grouped curated interaction line's trace has no recognised class (16 and 13),
   and three prose blocks carrying one computed value each sit over the 0.5 % line (3 and 2).
2. Render and DOM disagree on 30 of 60 and 36 of 60 drawn pages because 6.1's markup trim left
   `.cd-row-label` and `.cd-row-id` as adjacent inline siblings. A reader sees the half-rem the CSS
   adds; a text extractor reads the two fields as one word.
3. 1,472 hub-to-hub pairs still measure at or above 0.5 rendered Jaccard on indexable, sitemapped
   pages after §13(13) removed 393 of the 1,865 measured at v7.
4. The comparison set's indexable pairs rose from 25 to 29 while the published set's fell to 0.
   The two sets are different: the published set is 298 pages the v8 ruler names, the comparison
   set is the 1,048 slugged pages of the 1,062 the pre-Phase-4 ruler named, most of which this run
   does not publish.
