### [PENDING-TIMESTAMP] Phase 4 — measure v7 (after fix round 2), and the Phase 6.1 payload numbers

Commands, in order:
`.venv-corpus/bin/python scripts/revamp/derive_threshold.py --fields-dir data/revamp/fields-v2
--text-dir data/revamp/render-v7/text-with-furniture --out data/revamp/thresholds-v7-with-furniture.json`
(the furniture-free `thresholds-v7.json`/`.md` were written by the fix-round-2 run over the same
render and are unchanged here);
`.venv-corpus/bin/python scripts/revamp/common_line_share.py data/revamp/render-v7/text
data/revamp/render-v7/text-with-furniture data/corpus-20k/render/text --out
data/revamp/common-line-share-v7.json`;
`npx tsx scripts/with-disposable-database.ts -- bash <driver>` created
`rnawiki_test_1788831…`, `npm run db:migrate` built the schema, `pg_restore --data-only -L <drugs,
inventory_resolutions>` from `rnawiki-backups/corpus-20k-2026-09-05/rnawiki-pre-corpus-20k.pgcustom`
put **9,859** legacy `drugs` and **9,859** `inventory_resolutions` rows in it, `materialise.ts --tier
{1,3,2} --revamp --thresholds data/revamp/thresholds-v7.json --no-checkpoint` loaded it (the loader
reads `redirect-plan-v5.csv` and `trial-reassignments-v5.csv` under `--revamp`),
`scripts/revamp/hubs_load.ts` loaded the hubs, and `npx next start -p 3197` served the production
build after `rm -rf .next/cache`;
`rendered_dup_check.py --base-url http://127.0.0.1:3197 --sample 1000 --seed 20260905` twice, the
second with `--indexable-keys data/revamp/indexable-keys-after.txt`;
`redirect_check.py --base-url http://127.0.0.1:3197`;
`link_graph_check.py --base-url http://127.0.0.1:3197`;
`payload_audit.py --base-url http://127.0.0.1:3197`;
`npx tsx scripts/corpus-20k/gate2/browser-checks.ts --base http://127.0.0.1:3197`;
`slop_draw.py --base-url http://127.0.0.1:3197 --seed 20260908 --per-tier 20 --text-dir
data/revamp/render-v7/text --out-dir data/revamp/slop-draws/draw-3`.
Server stopped, database dropped, `.next/cache` and the rendered-page cache deleted.

Output: `common-line-share-v7.json`, `rendered-dups-v7.csv`/`-summary.json`,
`rendered-dups-v7-prior-set.csv`/`-summary.json`, `redirect-check-v7-local.json`,
`hubs/link-graph-v7.json`, `payload-audit-before.json`, `browser-checks-v7.json`,
`slop-draws/draw-3/{report.json,pages.md}`.

`thresholds-v7-with-furniture.json` is **not yet written**. `derive_threshold.py` writes its file
only when every tier has been scored, and the with-furniture run's Tier 3 leg is still running: the
rule scores the cumulative set at each present-field count, and at count 3 that set is 19,798 pages,
whose all-pairs scoring took just over two hours for that one candidate. Tier 1 and Tier 2 are
finished and their figures are below and are final; Tier 3 has scored candidate 3 of 13
(`posAllPairs=0.864322`, `lexSizeMatched=0.795077`, well over both lines) and is continuing. The
process is alive and will write the file when it reaches the end.

**The loaded build.** 28,657 `corpus_pages`, **301 indexable** (300 Tier 1 and 1 Tier 2), **968
hubs** and 14,214 hub members — the same figures the fix-round-2 load recorded, reproduced from the
backup and the ruler on a fresh disposable database.

**The ruler, furniture-free (§11's gate figure), against the three earlier rulers.**

| ruler | Tier 1 threshold | indexable | positional (all pairs) | lexical (size-matched) |
| --- | ---: | ---: | ---: | ---: |
| `thresholds-after` (pre-Phase-4 text) | 12 | 1,061 | 0.160173 | 0.328660 |
| `thresholds-v5` (Phase-4 text, furniture in it) | 23 | 48 | 0.198739 | 0.345081 |
| `thresholds-v6` (after fix round 1) | 20 | 303 | 0.197626 | 0.349686 |
| **`thresholds-v7` (after fix round 2)** | **20** | **300** | **0.196653** | **0.349686** |

Tier 2 stands at 20-with-one-page on all four rulers. Tier 3 selects none on all four: no
present-field count at or above the stub floor produces a set that holds both lines, so no Tier 3
page is indexable, which is what the deployment invariant requires. The three Tier 1 pages that went
between v6 and v7 are indexable pages the §12(5) 351(a) merges absorbed.

**The with-furniture run, reported beside it and never selecting.** Tier 1 **23**, **48** indexable,
positional 0.193886, lexical 0.340461 — it reproduces `thresholds-v5`'s threshold and count exactly,
as v6's with-furniture run did, which is the measurement §11 predicted: the collapse from 1,061 to
48 was the absence statements, not the reading text. Tier 2 **20** with one page. The 300-page set
the furniture-free text selected scores **0.216595** positional and **0.360600** lexical on the
with-furniture text — over both lines, which is why §11 makes the furniture-free figure the gate
figure and records this one beside it. Tier 3 is still scoring, as noted above.

**Repetition and page length.** Lines carried by more than half of all pages are **5.51 %** of the
corpus's words furniture-free (8 such lines, 668,174 words of 12,125,284) and **26.77 %** with
furniture (21 lines, 4,280,573 of 15,990,631). Before Phase 4 the same measure was 5.05 % (4 lines).
Median page **209 words** furniture-free and **349** with, against **80** before Phase 4. Every
figure moved by well under a point from v6, which is what a fix round that moves studies and merges
records — rather than changing wording — should do to a word-count measure.

**Rendered duplicates.** On the v7 indexable set (301 pages, all 968 hubs and a seeded 1,000-page
noindex sample; 301 + 968 + 996 rendered) 29,706 pairs sit at or above 0.5 Jaccard and **one
distinct pair is indexable-to-indexable**: `pertuzumab-trastuzumab-and-hyaluronidase-zzxf` ↔
`trastuzumab-and-hyaluronidase-oysk` at **0.5894**, reason class **biosimilar**. It is the pair
§12(4) named, and §12(4) says what happens to it: a combination pair still measuring ≥ 0.5 after the
component-set rule goes to the held list for Felix. `nebivolol` ↔ `nebivolol-2`, the other v6 pair,
is gone — the §12(3) same-name partition resolved it. On the 1,062-page pre-Phase-4 comparison set
(1,048 keys still carry a slug, 1,041 rendered) there are **25 distinct indexable pairs**, against 26
at v6, 32 at v5 and 19 before Phase 4.

**Hub-to-hub duplication is now measured, and it is large.** The dup check could not see hubs before
this run: `sitemap_slugs` filtered every sitemap URL on `/d/`, so the hub child's `/h/<type>/<slug>`
URLs were dropped and the run reported `0 hubs` while the sitemap published 968. `KNOWN_SITEMAP_
CHILDREN` still carried the comment "Phase 5 has not run". Both are fixed: the sitemap reader takes
the prefix it is looking for, a `PageTarget` carries its own path prefix, and the CSV and summary
now carry each side's set name so hub pairs are counted on their own line. With hubs in the run,
**1,865 distinct hub-to-hub pairs** sit at or above 0.5 Jaccard, and **0** hub-to-page pairs do.
Hubs are indexable, so this is a Phase 5 finding on the same footing as an indexable leaf pair, and
it is on the decisions list below rather than silently inside a total.

**Redirects, local build: PASS.** Plan — universe 9,857, 8,863 served directly, 1,044 by one hop,
**0 orphans, 0 chains, 0 conflicts**. Live — 9,857 slugs, 8,884 answered 200 and 973 answered 308,
**0 failures**.

**Link graph, against the build: PASS, all rules.** 972 hubs and 14,306 memberships in the data
files; the build publishes **968** hubs, and `/h` links every one, every one answers 200, and all
**6,052** member links those pages carry answer 200. The four hubs in the data files that the build
does not publish — `/h/class/{h01ac,h01ba,n06dx}` and `/h/target/leg3` — are named in the report
under `published.inDataFilesNotPublished`: `hubs_load.ts` refuses a hub left under five loadable
members once the identity revision has absorbed some of its pages, which is the loader doing its
job.

Two defects in the check itself were found and fixed on the way, and both had made it report a
failure on a healthy build. (a) Rule 2 read `thresholds-v5.json` and `presence-applicable-v5.ndjson`
by name, so "indexable leaf" meant the v5 ruler's 48 pages however many measure rounds had passed;
the ruler is now the newest pair on disk, `--thresholds` names an older one, and the report records
which pair it used. (b) The three `--base-url` rules iterated the hubs and member slugs in the data
files and resolved member slugs through `data/revamp/identity/page-slugs.csv`, a route map dated
2026-09-05 that predates the §12 merges; against this build that produced 4 hub 404s and 71 member
404s on slugs such as `/d/acarbose-2` that no page serves and no redirect covers. The build rules
now read the hubs the build publishes and the member links its hub pages actually carry. Before
changing anything, the site itself was audited directly — 100 hub pages drawn at seed 20260908, all
200, and all **1,328** distinct `/d/` links on them 200 — so the failures were the check's inputs,
not the build.

**Sitemap and the frozen invariants.** The index carries five children and no Tier 3:
`tier-1.xml` **300** URLs, `tier-2.xml` **1**, `hubs.xml` **969** (968 hubs and the `/h` index),
`browse.xml` **1,839**, `pages.xml` **10**; `sitemaps/tier-3.xml` answers **404**. `app/robots.ts`
is byte-identical to `origin/main` (`git diff origin/main -- app/robots.ts` is empty). The frozen
home search bar measures **0.00 px** against `data/corpus-20k/gate2/browser-checks-v2.json`'s
baseline on every one of the bar's and the input's four box values at 1440, 375 and 320 px, and the
DOM path is the same at all three widths.

**Phase 6.1, before the fix.** `payload_audit.py` measured the eight samples of step 0.3 — all eight
serve on this build, `rofecoxib` included — and 100 indexable pages drawn at seed 20260908, 108 of
108 measured. The dossier is shipped twice, and the numbers are not marginal:

- the RSC flight stream Next.js inlines is a median **54.48 %** of the served document's bytes,
  after setting aside the module and hint rows that name client chunks;
- a median **100.0 %** of the rendered dossier's text bytes — the text nodes inside `<main>`, of at
  least 20 characters — appear verbatim in that stream as well. Nothing measurable is sent once;
- live text-to-HTML, `innerText/outerHTML` after hydration, is a median **0.0481** over all 108
  pages and **0.0481** over the 100-page indexable draw. Step 6.1's floor is 0.15 and its target is
  0.25, so the page is at **a third of the floor**.

The corpus-20k live script, run unchanged against the same build over its seven-sample list, reads a
median **0.051** across both widths — the same band, which is the check that the new script's live
figure is the old measure and not a new one.

**Slop draw 3** (seed 20260908, 60 pages, 20 per tier, 60 of 60 rendered, 1,679 sentences):
**(a) 0** failures, **(c) 0**, and the render/DOM parity the draw now shares with `dom_parity.py`
**0**. **(b) 67** failures under §12's block rule — 43 in question blocks, 15 in computed sections,
9 elsewhere — against 242 at draw 2 under the sentence rule that §12 replaced; the two are not the
same measurement and are not a trend. The sentence-level literal reading, reported beside it and
never the gate, is **252**. `pages.md` is 36,095 words, inside the 60,000 cap, each page truncated at
700 words with its failures listed above its text.

Draw 3 is not clean, so the gate's two-consecutive-clean-draws bar is still unmet and the generator
work that remains is the question-block and computed-section templates.

One further defect fixed here: `slop_draw.py` wrote every draw's `pages.md` under the heading "Slop
draw 1". The file now names itself from the directory it is written to.

**Decisions this measurement puts to the lead.**

1. The one indexable duplicate pair is the trastuzumab combination pair §12(4) already predicted
   would survive the component-set rule. §12(4) sends it to Felix's held list; it has not been sent.
2. 1,865 hub-to-hub pairs at or above 0.5 rendered Jaccard, on pages that are indexable and in the
   sitemap. The Phase 5 gate measured hubs on the corpus-20k positional and lexical lines and they
   passed (0.125 / 0.327 over all 972); this is a different ruler reading the same pages and it says
   something the first did not.
3. Live text-to-HTML at 0.048 against a 0.15 floor is Phase 6.1's whole subject, and the measurement
   above says the cause plainly: the dossier is in the document twice, and the second copy is 54 %
   of the bytes.
