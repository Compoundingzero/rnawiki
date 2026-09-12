### [PENDING-TIMESTAMP] Phase 4 — measure 10 (v14), after fix round 9

The same ruler as measures v6 through v13, on the fix-round-9 render, every check against one build,
one at a time.

**One generator change was made inside this measurement, and the measurement was restarted from the
render because of it.** The first self-audit run failed on two of its thirty pages (§17(3): a
relation row naming the page it is on). That is a generator fault, so it was fixed in the generator,
the render was rewritten, the ruler re-derived with `--refresh`, the database rebuilt and every
check re-run against the corrected build. Only the second run is reported. The fault, the fix and
what it does not reach are in `phase4-fix-round-9.md`.

**Commands, in order.**

```
npx tsx scripts/revamp/page_text_v5.ts --out data/revamp/render-v14
npx tsx scripts/revamp/page_text_v5.ts --with-furniture --out data/revamp/render-v14
.venv-corpus/bin/python scripts/revamp/derive_threshold.py --refresh \
    --fields-dir data/revamp/fields-v2 \
    --assignments data/revamp/tiers/model-assignment-v3.ndjson \
    --text-dir data/revamp/render-v14/text --out data/revamp/thresholds-v14.json
.venv-corpus/bin/python scripts/revamp/common_line_share.py data/revamp/render-v14/text \
    data/revamp/render-v14/text-with-furniture data/corpus-20k/render/text \
    --out data/revamp/common-line-share-v14.json
# disposable database rnawiki_test_<epoch>_v14, created and dropped by this run:
#   createdb; npx tsx db/migrate.ts (34 rows in drizzle.__drizzle_migrations);
#   pg_restore --data-only -t drugs -t inventory_resolutions from
#     rnawiki-backups/corpus-20k-2026-09-05/rnawiki-pre-corpus-20k.pgcustom (9,859 + 9,859 rows,
#     PostgreSQL 18 tools at /opt/homebrew/opt/postgresql@18/bin);
#   materialise.ts --tier {1,3,2} --revamp --thresholds data/revamp/thresholds-v14.json
#     --no-checkpoint; scripts/revamp/hubs_load.ts; rm -rf .next/cache; npm run build;
#   npx next start -p 3214
rm -rf data/revamp/rendered-text            # the render cache holds the previous build's text
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3214 \
    --seed 20260905 --sample 1000 --refresh --csv data/revamp/rendered-dups-v14.csv \
    --summary data/revamp/rendered-dups-v14-summary.json
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3214 \
    --seed 20260905 --indexable-keys data/revamp/indexable-keys-after.txt \
    --csv data/revamp/rendered-dups-v14-prior-set.csv \
    --summary data/revamp/rendered-dups-v14-prior-set-summary.json
.venv-corpus/bin/python scripts/revamp/redirect_check.py --base-url http://127.0.0.1:3214 \
    --out data/revamp/redirect-check-v14-local.json
.venv-corpus/bin/python scripts/revamp/link_graph_check.py --base-url http://127.0.0.1:3214 \
    --thresholds <abs>/data/revamp/thresholds-v14.json \
    --presence <abs>/data/revamp/presence-applicable-v14.ndjson \
    --out data/revamp/hubs/link-graph-v14.json
.venv-corpus/bin/python scripts/revamp/dom_parity.py --base-url http://127.0.0.1:3214 \
    --text-dir data/revamp/render-v14/text --sample 200 \
    --out data/revamp/render-v14/dom-parity.json
.venv-corpus/bin/python scripts/revamp/self_audit.py --base-url http://127.0.0.1:3214 \
    --out data/revamp/self-audit-round9.json
curl the sitemap index, its five children and /sitemaps/tier-3.xml
git diff origin/main -- app/robots.ts
npx tsx scripts/corpus-20k/gate2/browser-checks.ts --base http://127.0.0.1:3214 \
    --out data/revamp/browser-checks-v14.json
.venv-corpus/bin/python scripts/revamp/jsonld_check.py --base-url http://127.0.0.1:3214 \
    --sample 20 --seed 20260914 --out data/revamp/jsonld-v14.json
.venv-corpus/bin/python scripts/revamp/payload_audit.py --base-url http://127.0.0.1:3214 \
    --pages data/revamp/payload-audit-pages.txt --out data/revamp/payload-audit-v14.json
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3214 \
    --seed 20260922 --per-tier 20 --text-dir data/revamp/render-v14/text \
    --out-dir data/revamp/slop-draws/draw-16
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3214 \
    --seed 20260923 --per-tier 20 --text-dir data/revamp/render-v14/text \
    --out-dir data/revamp/slop-draws/draw-17
.venv-corpus/bin/python -m pytest tests/test_render_safety.py tests/test_hub_dedupe.py -q
.venv-corpus/bin/python scripts/revamp/ci_sample.py
# the four required pre-merge checks in a git-archive clean room with no corpus
rm -rf .next/cache ; npm run gate
```

Server stopped, disposable database dropped, `.next/cache`, the clean room, the render cache and
the pip cache deleted. `data/revamp/render-v13` was deleted when v14 was written: one render
revision is kept.

**The ruler (`data/revamp/thresholds-v14.json`, furniture-free, the gate figure).**

| | Tier 1 | Tier 2 | Tier 3 |
| --- | --- | --- | --- |
| threshold | **20** | **20** | none |
| indexable | **293** | **1** | **0** |
| positional, all pairs (line 0.20) | **0.185384** | 0.0 | — |
| lexical, size-matched (line 0.353) | **0.348613** | 0.0 | — |
| v13 | 20 · 293 · 0.185384 · 0.348613 | 20 · 1 · 0 · 0 | none · 0 |

The ruler selects the same threshold, the same 293 pages and the same two overlap figures to six
decimal places as v13. That is the honest reading of this round: §19 removed a Canadian status word
from 432 pages, 95 neighbour rows from Tier 3, 41 labels and 405 pages from Tier 2, and grouped the
predicted lines — and none of it touched the words the 293 indexable Tier 1 pages are told apart by.
Tier 2 again selects 20 and one page. Tier 3 again selects **no threshold**: at every candidate from
3 to 15 the set fails both lines.

**Common lines and page length** (`common-line-share-v14.json`). Furniture-free: **7** lines carried
by more than half of the 28,657 pages, **6.8875 %** of the corpus's words, median page **122** words
(v13: 7, 6.8496 %, 122). With furniture: **20** lines, **32.0142 %**, median **273** (v13: 20,
31.9717 %, 273). The corpus-20k v4 render, on the same script: 4 lines, 5.0536 %, median 80.

**Loaded**: tier sizes **1,698 / 3,382 / 23,577** (v13: 1,697 / 3,787 / 23,173) — the 405 pages §19
moved out of CLINICAL are the whole of the Tier 2 fall. **204,956** synonym rows (30,049 + 118,286 +
56,621), 710 hubs, 12,524 members, 1 page held `noindex,follow` by the duplicate hold.

**Self-audit** (`self-audit-round9.json`): **30/30 pages, 10/10 hubs, 25 rules, 3,656 applications,
0 failures**. The three rules §19 item 4 adds are in it: no Health Canada homeopathic row is
rendered as an approval (0 applications — no drawn page carries one; the rule is checked over the
whole corpus by `tests/test_render_safety.py` instead), no nearest-approved-neighbour row on a
single-heavy-atom structure (**26** applications), and every visible predicted-interaction list caps
at six rows (**1** application).

**Render and DOM** (`render-v14/dom-parity.json`, 200 pages): **0** painted lines missing from the
render, **0** render lines missing from the page, **0** out of order.

**Rendered duplicate check** (`rendered-dups-v14.csv`/`-summary.json`, 293 indexable + 709 published
hubs + a 996-page noindex sample, 1,998 pages rendered at 390 and 1,280 px, 2.8 minutes):
**0 indexable pairs**, **0 hub-to-hub pairs**, **0 hub-to-page pairs**; 31,608 pairs flagged in all
(31,606 stub-template, 2 identical-trial-set; none touching an indexable page), against v13's
31,502. The one recorded issue, "1 indexable slugs have no key in the corpus records", is the same
one v9 through v13 carried.

Over the **1,062-key pre-Phase-4 comparison set** (`indexable-keys-after.txt`): **82 indexable
pairs** — biosimilar 32, identical-trial-set 34, unclassified-overlap 10, stub-template 6 (v13: 82).
That set is the one the old threshold-11 ruler named; the v14 ruler does not call those pages
indexable and the figure is carried for comparison only.

**Redirects** (`redirect-check-v14-local.json`): plan universe **9,857**, served directly 8,863, one
hop 1,044, **0 orphans, 0 chains, 0 conflicts**; live **8,884 × 200 and 973 × 308, 0 failures**.
Identical to v7 through v13.

**Link graph** (`hubs/link-graph-v14.json`): **PASS**, all seven rules. 714 hubs in the data files,
**709 published**, 12,607 member rows, every published hub answering 200, **6,052** member links
answering 200, **294** indexable leaves each in a hub or with a recorded reason.

**Sitemap.** Index lists five children and no more: `tier-1` **292**, `tier-2` **1**, `browse`
**1,832**, `hubs` **710** (709 published hubs plus `/h`), `pages` **10**. `/sitemaps/tier-3.xml`
answers **404**. `app/robots.ts` is byte-identical to `origin/main` (`git diff` writes 0 bytes).

**Frozen home search bar** (`browser-checks-v14.json`): **0.00 px** against
`data/corpus-20k/gate2/browser-checks-v2.json` — every measured value matches at 1440, 375 and
320 px, and the measured values are identical to v13's. Recorded accurately rather than repeated
from v13: the `domPathBaseline` string inside the frozen v2 file names an older markup shape and has
not equalled the measured DOM path in any measurement from v7 to v14, so the invariant that holds
here is the geometry, which is exact.

**JSON-LD** (`jsonld-v14.json`, seed 20260914). Twenty indexable pages: **exactly one**
`application/ld+json` block on each. Twenty noindex pages drawn across the three tiers: **zero**
blocks. All forty carry exactly one `<main>`; **0 failures**.

**Payload** (`payload-audit-v14.json`, the pinned 108 pages): 108 of 108 measured, RSC dossier share
of the document **0.0**, dossier text repeated in the RSC stream **0.0**, live text-to-HTML median
**0.154502** over all 108, **0.154194** over the 100-page indexable draw and 0.175009 over the eight
step-0.3 samples. **Step 6.1's floor of 0.15 holds, by 0.004502** (v13: 0.154194 over all 108).

**Slop draws 16 and 17 — the gate passes again.** Sixty pages each, 20 per tier, seeds 20260922 and
20260923, check (b) over the masked block with the sentence-level literal reading beside it, parity
by `dom_parity.py`'s own extraction:

| | draw 16 (seed 20260922) | draw 17 (seed 20260923) |
| --- | --- | --- |
| pages rendered | 60 of 60 | 60 of 60 |
| sentences | 1,224 | 1,173 |
| (a) traces to a stored field | **0 failures** | **0 failures** |
| (b) masked block on ≤ 0.5 % of pages | **0 failures** | **0 failures** |
| (b) sentence-level literal, reported only | 63 | 62 |
| (c) no label naming a device | **0 failures** | **0 failures** |
| render/DOM parity | 0 / 0 / 0 | 0 / 0 / 0 |
| `pages.md` words | 32,598 | 31,266 |

Draws 14 and 15 were already clean; these two are clean on the changed data. **Eight consecutive
clean draws.**

**Tests.** `tests/test_render_safety.py` + `tests/test_hub_dedupe.py`: **61 passed, 0 skipped** (58
at measure v13; the three §19 cases are this round's, and the parity rule passes on
`render-v14/dom-parity.json` once the measurement has written it).

**The CI sample, refreshed** (`data/revamp/ci-sample/`). `ci_sample.py` reads the newest ruler pair
and the newest render, which are now `thresholds-v14.json` + `presence-applicable-v14.ndjson`
(**294** indexable leaves, **266** of them hub members) and `data/revamp/render-v14`. The sample is
**200 pages** (tier 1: 64, tier 2: 67, tier 3: 69) in 8 files, 1,656,226 bytes, inside the 5 MB cap.
`package.json`, `.github/workflows/revamp-checks.yml`, `docs/specs/ci-checks.md`, `tests/conftest.py`
and `.gitignore` now name the v14 pair and the v14 render; the v13 pair is deleted.

**The four required pre-merge checks, run outside the working copy**
(`data/revamp/ci-sample/local-run.json`): `git archive HEAD` into a temporary directory, this
change's files copied in beside it, a fresh virtual environment from
`scripts/revamp/requirements-ci.txt`, and no corpus (`fields-v2`, `render-v14`, `page-blocks` and
`derived-v2` all absent there). **All five commands exit 0**: slug union current (9,907 slugs),
redirect plan written, link graph clean, sitemap invariants 4 passed, rendering rules **46 passed,
9 skipped**. The two new skips are §19's corpus rules and each prints why — one needs the Health
Canada schedule extracts, which are gitignored, and one counts heavy atoms with RDKit, which
`requirements-ci.txt` deliberately does not install; both are registered in `SAMPLE_SKIPS` with the
command that runs them on the workstation. One negative probe per check is recorded with the message
it fails with, and **all five probes fired**.

**`npm run gate`**, after `rm -rf .next/cache`: **every stage green except `check:copy`**, in
order — `typecheck`, `lint` (0 errors, 38 warnings, none on a file this round changed),
`check:copy` (**FAILED, 1 hit**), `check:medicine-content`, `audit:denial-corpus`, `agents:check`,
`agents:import:check`, `check:agent-datasets`, `check:four-audience-coverage`,
`check:source-consensus-snapshot`, `check:dataset-export`, `check:seo`, `format`,
`drizzle-kit check`, `test:unit` (**180 files, 2,664 → 2,668 passed, 9 skipped**),
`test:integration` (**26 files, 167 tests**, on its own disposable database), `build`, and
`test:e2e` (**30 passed**, on its own disposable database). Because `gate` is a `&&` chain, the
stages after `check:copy` were run individually to establish that each of them passes; every one
does.

**The one failing stage, and why this run did not clear it.** `check:copy`
(`scripts/quality/slop-scan.mjs`) reports **1 hit across 1 of 36 configured patterns**, on
`docs/worklogs/revamp-2026-09.md` line 3961 — a scanned marketing verb inside the lead's own quoted
sentence in the measure-v13 entry, "the stage measure v12 recorded failing on one occurrence of the
a scanned word". It is committed content (commit 01039f0), it is in the append-only worklog, and
this run was instructed not to edit the worklog; the drafts this run wrote carry **0** hits of any
scanned pattern. Measure v12 hit the same scanner on the same word and the lead cleared it by
rewording their own sentence, which is the same one-word change that clears it now. Recorded rather
than worked around: no scanner pattern was changed and no file was excluded.

**Outputs.** `data/revamp/thresholds-v14.json`/`.md`, `presence-applicable-v14.ndjson`,
`field-census-applicable-v14.csv`, `common-line-share-v14.json`, `rendered-dups-v14.csv`/
`-summary.json`, `rendered-dups-v14-prior-set.csv`/`-summary.json`, `redirect-check-v14-local.json`,
`hubs/link-graph-v14.json`, `browser-checks-v14.json`, `jsonld-v14.json`, `payload-audit-v14.json`,
`self-audit-round9.json`, `slop-draws/draw-16/{report.json,pages.md}`,
`slop-draws/draw-17/{report.json,pages.md}`, `tiers/model-assignment-v3.ndjson`,
`sources/openfda-label/2026-09-05/parsed/excluded-set-ids.json`, `tier3-sections.parquet`,
`ci-sample/{thresholds-v14.json,presence-applicable-v14-hub-members.ndjson,robots.ts.snapshot,
local-run.json,render/*}`, `data/revamp/render-v14/{text,text-with-furniture,provenance,
dom-parity.json}`.
