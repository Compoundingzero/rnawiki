### [PENDING-TIMESTAMP] Phase 4 — measure 7 (v11), after fix round 6

The same ruler as measures v6 through v10, on the fix-round-6 render, every check against one build,
one at a time. No generator change was made inside this measurement; the three selector corrections
it needed are recorded in the fix-round-6 entry, because they are changes to how a check reads the
page and not to what the page says.

**Commands, in order.**

```
.venv-corpus/bin/python scripts/revamp/derive_threshold.py --fields-dir data/revamp/fields-v2 \
    --assignments data/revamp/tiers/model-assignment-v2.ndjson \
    --text-dir data/revamp/render-v11/text --out data/revamp/thresholds-v11.json
.venv-corpus/bin/python scripts/revamp/common_line_share.py data/revamp/render-v11/text \
    data/revamp/render-v11/text-with-furniture data/corpus-20k/render/text \
    --out data/revamp/common-line-share-v11.json
# disposable database rnawiki_test_1788995942_c872a4a07c, created and dropped by this run:
#   createdb; npx tsx db/migrate.ts (0000-0033, 34 rows);
#   pg_restore --data-only -t drugs -t inventory_resolutions from
#     rnawiki-backups/corpus-20k-2026-09-05/rnawiki-pre-corpus-20k.pgcustom (9,859 + 9,859 rows,
#     PostgreSQL 18 tools at /opt/homebrew/opt/postgresql@18/bin);
#   materialise.ts --tier {1,3,2} --revamp --thresholds data/revamp/thresholds-v11.json
#     --no-checkpoint; scripts/revamp/hubs_load.ts; rm -rf .next/cache; npm run build;
#   npx next start -p 3212
.venv-corpus/bin/python scripts/revamp/self_audit.py --base-url http://127.0.0.1:3212 \
    --out data/revamp/self-audit-round6.json
.venv-corpus/bin/python scripts/revamp/dom_parity.py --base-url http://127.0.0.1:3212 \
    --text-dir data/revamp/render-v11/text --sample 200 \
    --out data/revamp/render-v11/dom-parity.json
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3212 \
    --seed 20260905 --sample 1000 --csv data/revamp/rendered-dups-v11.csv \
    --summary data/revamp/rendered-dups-v11-summary.json
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3212 \
    --seed 20260905 --indexable-keys data/revamp/indexable-keys-after.txt \
    --csv data/revamp/rendered-dups-v11-prior-set.csv \
    --summary data/revamp/rendered-dups-v11-prior-set-summary.json
.venv-corpus/bin/python scripts/revamp/redirect_check.py --base-url http://127.0.0.1:3212 \
    --out data/revamp/redirect-check-v11-local.json
.venv-corpus/bin/python scripts/revamp/link_graph_check.py --base-url http://127.0.0.1:3212 \
    --thresholds <abs>/data/revamp/thresholds-v11.json \
    --presence <abs>/data/revamp/presence-applicable-v11.ndjson \
    --out data/revamp/hubs/link-graph-v11.json
curl the sitemap index, its five children and /sitemaps/tier-3.xml
git diff origin/main -- app/robots.ts
npx tsx scripts/corpus-20k/gate2/browser-checks.ts --base http://127.0.0.1:3212 \
    --out data/revamp/browser-checks-v11.json
.venv-corpus/bin/python scripts/revamp/jsonld_check.py --base-url http://127.0.0.1:3212 \
    --sample 20 --seed 20260914 --out data/revamp/jsonld-v11.json
.venv-corpus/bin/python scripts/revamp/payload_audit.py --base-url http://127.0.0.1:3212 \
    --pages data/revamp/payload-audit-pages.txt --out data/revamp/payload-audit-v11.json
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3212 \
    --seed 20260916 --per-tier 20 --text-dir data/revamp/render-v11/text \
    --out-dir data/revamp/slop-draws/draw-10
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3212 \
    --seed 20260917 --per-tier 20 --text-dir data/revamp/render-v11/text \
    --out-dir data/revamp/slop-draws/draw-11
.venv-corpus/bin/python scripts/revamp/ci_sample.py
# the four required pre-merge checks in a git-archive clean room with no corpus
.venv-corpus/bin/python scripts/revamp/derive_threshold.py --fields-dir data/revamp/fields-v2 \
    --assignments data/revamp/tiers/model-assignment-v2.ndjson \
    --text-dir data/revamp/render-v11/text-with-furniture \
    --out data/revamp/thresholds-v11-with-furniture.json     # started last; optional
```

Server stopped, disposable database dropped, `.next/cache`, `data/revamp/rendered-text`, the clean
room and this run's overlap caches deleted.

**The ruler (`data/revamp/thresholds-v11.json`, furniture-free, the gate figure).**

| | Tier 1 | Tier 2 | Tier 3 |
| --- | --- | --- | --- |
| threshold | **20** | **20** | none |
| indexable | **293** | **1** | **0** |
| positional, all pairs (line 0.20) | **0.181707** | 0.0 | — |
| lexical, size-matched (line 0.353) | **0.348795** | 0.0 | — |
| v10 | 20 · 293 · 0.182320 · 0.348795 | 20 · 1 · 0 · 0 | none · 0 |
| thresholds-after (the 11-of-15 ruler) | 12 · 1,061 · 0.160173 · 0.328660 | 20 · 1 · 0 · 0 | none · 0 |

The ruler selects the same threshold and the same 293 pages as v10. Positional overlap on that set
falls from 0.182320 to **0.181707** and the lexical figure is unchanged at 0.348795: the 92,488
refused interaction rows were on 3,543 pages, of which few are in the indexable set, so the ruler
sees the change as a small loosening rather than a different answer. Tier 2 again selects 20 and one
page, both figures 0.0 on a one-page set. Tier 3 again selects **no threshold**: no present-field
count at or above the stub floor produces a set that holds both lines, which is the unchanged rule's
own answer.

Loaded: **293** indexable rows (Tier 1 292 + Tier 2 1; the 293rd Tier 1 page is the `oysk` duplicate
hold, `noindex,follow` whatever its field count says). Tier sizes loaded: **1,697 / 3,787 /
23,173**, 710 hubs, 12,524 members.

**The with-furniture reading.** Not measured inside the gate figure this round: the run over the
with-furniture text as its own ruler is the long leg (2 h 14 min at v10) and was started last. Where
it is unfinished when this entry is written, it is recorded as running and its result is added to
`data/revamp/thresholds-v11-with-furniture.json` when it lands.

**Common lines and page length** (`common-line-share-v11.json`). Furniture-free: **7** lines carried
by more than half of the 28,657 pages, **6.9660 %** of the corpus's words, median page **122** words
(v10: 7 lines, 6.2382 %, 129). With furniture: **20** lines, **32.3508 %**, median **273** (v10: 20,
29.7548 %, 278). Both shares rise because the denominator fell: the same lines over a corpus that is
1,076,839 words shorter after the refused interaction rows left it. The corpus-20k v4 render, on the
same script: 4 lines, 5.0536 %, median 80.

**Self-audit** (`self-audit-round6.json`): **30/30 pages, 10/10 hubs, 15 rules, 3,382 applications,
0 failures**.

**Render and DOM** (`render-v11/dom-parity.json`, 200 pages): **0** painted lines missing from the
render, **0** render lines missing from the page, **0** out of order.

**Rendered duplicate check** (`rendered-dups-v11.csv`/`-summary.json`, 293 indexable + 709 published
hubs + a 996-page noindex sample, 1,998 pages rendered at 390 and 1,280 px, 3.4 minutes):
**0 indexable pairs**, **0 hub-to-hub pairs**, **0 hub-to-page pairs**; 31,508 pairs flagged in all
(31,504 stub-template, 2 identical-trial-set, 2 unclassified-overlap; none touching an indexable
page), against v10's 31,506. The biosimilar and serotype-component probes clear the threshold at
both widths (max Jaccard 0.2282 and 0.268). The one recorded issue, "1 indexable slugs have no key
in the corpus records", is the same one v9 and v10 carried.

Over the **1,062-key pre-Phase-4 comparison set** (`indexable-keys-after.txt`, of which 1,048 have a
slug in this corpus): **84 indexable pairs** — biosimilar 32, identical-trial-set 32,
unclassified-overlap 14, stub-template 6, the same 84 as v10. That set is the one the old
threshold-11 ruler named; the v11 ruler does not call those pages indexable and the figure is
carried for comparison only.

**Redirects** (`redirect-check-v11-local.json`): plan universe **9,857**, served directly 8,863, one
hop 1,044, **0 orphans, 0 chains, 0 conflicts**; live **8,884 × 200 and 973 × 308, 0 failures**.
Identical to v7 through v10.

**Link graph** (`hubs/link-graph-v11.json`): **PASS**, all seven rules. 714 hubs in the data files,
**709 published**, 12,607 member rows, every published hub answering 200, **6,052** member links
answering 200, **294** indexable leaves each in a hub or with a recorded reason.

**Sitemap.** Index lists five children and no more: `tier-1` **292**, `tier-2` **1**, `browse`
**1,837**, `hubs` **710** (709 published hubs plus `/h`), `pages` **10**. `/sitemaps/tier-3.xml`
answers **404**. `app/robots.ts` is byte-identical to `origin/main`.

**Frozen home search bar** (`browser-checks-v11.json`): **0.00 px** against
`data/corpus-20k/gate2/browser-checks-v2.json` — every value in the record matches, numeric and
string alike, at 1440, 375 and 320 px. Per sample (7 pages × 2 widths): one `<h1>`, heading order
in sequence, no horizontal overflow at 320 px, and the stand-in-text probe empty on every sample and
width.

**JSON-LD** (`jsonld-v11.json`, seed 20260914). Twenty indexable pages: **exactly one**
`application/ld+json` block on each. Twenty noindex pages drawn across the three tiers: **zero**
blocks. All forty carry exactly one `<main>`; **0 failures**. `scripts/revamp/jsonld_check.py` was
drawing by tier and asserting one block on every page drawn, which was true under the corpus-20k
ruler (most of Tier 1 was indexable) and is false under this one (292 of Tier 1's 1,697 pages are).
It now draws `--sample` indexable and `--sample` noindex pages and holds each half to its own rule,
which is the split measure v10 checked by hand.

**Payload** (`payload-audit-v11.json`, the pinned 108 pages): 108 of 108 measured, RSC dossier share
of the document **0.0**, dossier text repeated in the RSC stream **0.0**, live text-to-HTML median
**0.150418** over all 108, **0.150199** over the 100-page indexable draw and 0.174549 over the eight
step-0.3 samples. Above step 6.1's **0.15** floor and below its 0.25 target; median document bytes
70,677.0 and median dossier text 21,851.0 against v10's 70,530.0 and 21,813.0.

**Slop draws 10 and 11 — the gate passes.** Sixty pages each, 20 per tier, seeds 20260916 and
20260917, check (b) over the masked block with the sentence-level literal reading beside it, parity
by `dom_parity.py`'s own extraction:

| | draw 10 (seed 20260916) | draw 11 (seed 20260917) |
| --- | --- | --- |
| pages rendered | 60 of 60 | 60 of 60 |
| sentences | 1,173 | 1,171 |
| (a) traces to a stored field | **0 failures** | **0 failures** |
| (b) masked block on ≤ 0.5 % of pages | **0 failures** | **0 failures** |
| (b) sentence-level literal, reported only | 70 | 68 |
| (c) no label naming a device | **0 failures** | **0 failures** |
| render/DOM parity | 0 / 0 / 0 | 0 / 0 / 0 |
| `pages.md` words | 31,067 | 31,916 |

Against draws 8 and 9 that is (a) 16 and 32 → **0** on both draws. The one generator behind those
failures was the Tier C shared-target rule's direction trace; §16(2) disables that rule, so no page
carries one of its rows, and the trace it writes into the measured table now names the two stored
action rows by their field paths and `resolve_trace` has a class for that shape. (b) and (c) stay at
zero and parity is exact. **Two consecutive clean draws: the Phase 4.7 slop gate passes.**

**The CI sample, refreshed** (`data/revamp/ci-sample/`). `ci_sample.py` reads the newest ruler pair
and the newest render, which are now `thresholds-v11.json` + `presence-applicable-v11.ndjson`
(**294** indexable leaves, **266** of them hub members) and `data/revamp/render-v11`. The draw gains
a requirement, `supervision-four-clauses`, so a page whose supervision answer states four class
clauses is always in the sample and the rule that asserts the block is never truncated has something
to check. The sample is **200 pages** (tier 1: 64, tier 2: 68, tier 3: 68) in 8 files, inside the
5 MB cap. `package.json`, `.github/workflows/revamp-checks.yml`, `docs/specs/ci-checks.md` and
`tests/conftest.py` now name the v11 pair and the v11 render; the v10 pair is deleted.

**The four required pre-merge checks, run outside the working copy**
(`data/revamp/ci-sample/local-run.json`): `git archive HEAD` into a temporary directory, this
change's files copied in beside it, a fresh virtual environment from
`scripts/revamp/requirements-ci.txt`, and no corpus (`fields-v2`, `render-v11`, `page-blocks` and
`derived-v2` all absent there). **All five commands exit 0**: slug union current (9,907 slugs),
redirect plan written, link graph clean, sitemap invariants 4 passed, rendering rules **41 passed,
4 skipped**. One negative probe per check is recorded with the message it fails with.

**Outputs.** `data/revamp/thresholds-v11.json`/`.md`, `presence-applicable-v11.ndjson`,
`field-census-applicable-v11.csv`, `common-line-share-v11.json`, `rendered-dups-v11.csv`/
`-summary.json`, `rendered-dups-v11-prior-set.csv`/`-summary.json`, `redirect-check-v11-local.json`,
`hubs/link-graph-v11.json`, `browser-checks-v11.json`, `jsonld-v11.json`, `payload-audit-v11.json`,
`self-audit-round6.json`, `slop-draws/draw-10/{report.json,pages.md}`,
`slop-draws/draw-11/{report.json,pages.md}`,
`ci-sample/{thresholds-v11.json,presence-applicable-v11-hub-members.ndjson,robots.ts.snapshot,
local-run.json,render/*}`, `data/revamp/render-v11/{text,text-with-furniture,provenance,
dom-parity.json}`.
