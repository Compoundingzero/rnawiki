### [PENDING-TIMESTAMP] Phase 4 — measure 9 (v13), after fix round 8

The same ruler as measures v6 through v12, on the fix-round-8 render, every check against one build,
one at a time. No generator change was made inside this measurement.

**Commands, in order.**

```
.venv-corpus/bin/python scripts/revamp/derive_threshold.py --fields-dir data/revamp/fields-v2 \
    --assignments data/revamp/tiers/model-assignment-v2.ndjson \
    --text-dir data/revamp/render-v13/text --out data/revamp/thresholds-v13.json
.venv-corpus/bin/python scripts/revamp/common_line_share.py data/revamp/render-v13/text \
    data/revamp/render-v13/text-with-furniture data/corpus-20k/render/text \
    --out data/revamp/common-line-share-v13.json
# disposable database rnawiki_test_1789035555_v13, created and dropped by this run:
#   createdb; npx tsx db/migrate.ts (0000-0033, 34 rows in drizzle.__drizzle_migrations);
#   pg_restore --data-only -t drugs -t inventory_resolutions from
#     rnawiki-backups/corpus-20k-2026-09-05/rnawiki-pre-corpus-20k.pgcustom (9,859 + 9,859 rows,
#     PostgreSQL 18 tools at /opt/homebrew/opt/postgresql@18/bin);
#   materialise.ts --tier {1,3,2} --revamp --thresholds data/revamp/thresholds-v13.json
#     --no-checkpoint; scripts/revamp/hubs_load.ts; rm -rf .next/cache; npm run build;
#   npx next start -p 3213
rm -rf data/revamp/rendered-text            # the render cache holds the previous build's text
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3213 \
    --seed 20260905 --sample 1000 --refresh --csv data/revamp/rendered-dups-v13.csv \
    --summary data/revamp/rendered-dups-v13-summary.json
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3213 \
    --seed 20260905 --indexable-keys data/revamp/indexable-keys-after.txt \
    --csv data/revamp/rendered-dups-v13-prior-set.csv \
    --summary data/revamp/rendered-dups-v13-prior-set-summary.json
.venv-corpus/bin/python scripts/revamp/redirect_check.py --base-url http://127.0.0.1:3213 \
    --out data/revamp/redirect-check-v13-local.json
.venv-corpus/bin/python scripts/revamp/link_graph_check.py --base-url http://127.0.0.1:3213 \
    --thresholds <abs>/data/revamp/thresholds-v13.json \
    --presence <abs>/data/revamp/presence-applicable-v13.ndjson \
    --out data/revamp/hubs/link-graph-v13.json
.venv-corpus/bin/python scripts/revamp/dom_parity.py --base-url http://127.0.0.1:3213 \
    --text-dir data/revamp/render-v13/text --sample 200 \
    --out data/revamp/render-v13/dom-parity.json
.venv-corpus/bin/python scripts/revamp/self_audit.py --base-url http://127.0.0.1:3213 \
    --out data/revamp/self-audit-round8.json
curl the sitemap index, its five children and /sitemaps/tier-3.xml
git diff origin/main -- app/robots.ts
npx tsx scripts/corpus-20k/gate2/browser-checks.ts --base http://127.0.0.1:3213 \
    --out data/revamp/browser-checks-v13.json
.venv-corpus/bin/python scripts/revamp/jsonld_check.py --base-url http://127.0.0.1:3213 \
    --sample 20 --seed 20260914 --out data/revamp/jsonld-v13.json
.venv-corpus/bin/python scripts/revamp/payload_audit.py --base-url http://127.0.0.1:3213 \
    --pages data/revamp/payload-audit-pages.txt --out data/revamp/payload-audit-v13.json
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3213 \
    --seed 20260920 --per-tier 20 --text-dir data/revamp/render-v13/text \
    --out-dir data/revamp/slop-draws/draw-14
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3213 \
    --seed 20260921 --per-tier 20 --text-dir data/revamp/render-v13/text \
    --out-dir data/revamp/slop-draws/draw-15
.venv-corpus/bin/python -m pytest tests/test_render_safety.py tests/test_hub_dedupe.py -q
.venv-corpus/bin/python scripts/revamp/ci_sample.py
# the four required pre-merge checks in a git-archive clean room with no corpus
rm -rf .next/cache ; npm run gate
```

Server stopped, disposable database dropped, `.next/cache`, the clean room, the probe copy, the
render cache and the pip and pnpm caches deleted. `data/revamp/render-v12` was deleted when v13 was
written: one render revision is kept.

**One correction to how a check is run, recorded because it changes what a figure means.**
`rendered_dup_check.py` caches rendered text under `data/revamp/rendered-text/`, keyed by base URL
and slug, and step 6.1's payload run had used the same URL and port on a different build. The first
v13 run therefore read 1,994 pages from that cache and rendered 4, in 0.11 minutes. The cache was
deleted and the check re-run with `--refresh`, which rendered all 1,998 pages in 2.87 minutes; only
the second run is reported. The prior-set run that follows it reads that fresh cache, which is this
build's, and rendered the 1,691 pages the first run had not drawn.

**The ruler (`data/revamp/thresholds-v13.json`, furniture-free, the gate figure).**

| | Tier 1 | Tier 2 | Tier 3 |
| --- | --- | --- | --- |
| threshold | **20** | **20** | none |
| indexable | **293** | **1** | **0** |
| positional, all pairs (line 0.20) | **0.185384** | 0.0 | — |
| lexical, size-matched (line 0.353) | **0.348613** | 0.0 | — |
| v12 | 20 · 293 · 0.185977 · 0.349579 | 20 · 1 · 0 · 0 | none · 0 |
| thresholds-after (the 11-of-15 ruler) | 12 · 1,061 · 0.160173 · 0.328660 | 20 · 1 · 0 · 0 | none · 0 |

The ruler selects the same threshold and the same 293 pages as v10 through v12. Positional overlap
on that set falls from 0.185977 to **0.185384** and lexical from 0.349579 to **0.348613**: the names
§18(1) removed are shared vocabulary — a class term, another page's name — and taking them out of
the header line makes two indexable pages read very slightly less alike. Both figures clear their
lines, by 0.015 and 0.004. Tier 2 again selects 20 and one page. Tier 3 again selects **no
threshold**: at every candidate from 3 to 15 the set fails both lines, and the unchanged rule's own
answer is that no present-field count produces a set that holds them.

**Common lines and page length** (`common-line-share-v13.json`). Furniture-free: **7** lines carried
by more than half of the 28,657 pages, **6.8496 %** of the corpus's words, median page **122** words
(v12: 7, 6.8435 %, 122). With furniture: **20** lines, **31.9717 %**, median **273** (v12: 20,
31.9515 %, 273). The corpus-20k v4 render, on the same script: 4 lines, 5.0536 %, median 80.

**Loaded**: **293** indexable rows (Tier 1 292 + Tier 2 1; the 293rd Tier 1 page is the `oysk`
duplicate hold, `noindex,follow` whatever its field count says). Tier sizes **1,697 / 3,787 /
23,173**, 710 hubs, 12,524 members, **204,956** synonym rows. Identical to v12 but for the synonyms:
**760** names the loader refused to write, one per page-kind-name row §18(1) dropped.

**Self-audit** (`self-audit-round8.json`): **30/30 pages, 10/10 hubs, 22 rules, 3,435 applications,
0 failures**. The three rules §18 item 3 adds are in it: no name the synonym filter removed is
painted (**16** applications), every salt-form entry is this record's name plus a counter-ion (0
applications on this draw — no page in it carries a salt-form group), and no structure-equality
relation on a single-heavy-atom key (0 applications — the five pairs are gone and no drawn page
carries the relation). Both zero-application rules are checked over the whole corpus by
`tests/test_render_safety.py` instead, which is where a rule this draw cannot reach belongs.

**Render and DOM** (`render-v13/dom-parity.json`, 200 pages): **0** painted lines missing from the
render, **0** render lines missing from the page, **0** out of order.

**Rendered duplicate check** (`rendered-dups-v13.csv`/`-summary.json`, 293 indexable + 709 published
hubs + a 996-page noindex sample, 1,998 pages rendered at 390 and 1,280 px, 2.9 minutes):
**0 indexable pairs**, **0 hub-to-hub pairs**, **0 hub-to-page pairs**; 31,502 pairs flagged in all
(31,500 stub-template, 2 identical-trial-set; none touching an indexable page), against v12's
31,508. The six that leave are pages whose only shared lines were the registry names §18(1) removed.
The one recorded issue, "1 indexable slugs have no key in the corpus records", is the same one v9
through v12 carried.

Over the **1,062-key pre-Phase-4 comparison set** (`indexable-keys-after.txt`, of which 1,048 have a
slug in this corpus): **82 indexable pairs** — biosimilar 32, identical-trial-set 34,
unclassified-overlap 10, stub-template 6 (v12: 82). That set is the one the old threshold-11 ruler
named; the v13 ruler does not call those pages indexable and the figure is carried for comparison
only.

**Redirects** (`redirect-check-v13-local.json`): plan universe **9,857**, served directly 8,863, one
hop 1,044, **0 orphans, 0 chains, 0 conflicts**; live **8,884 × 200 and 973 × 308, 0 failures**.
Identical to v7 through v12.

**Link graph** (`hubs/link-graph-v13.json`): **PASS**, all seven rules. 714 hubs in the data files,
**709 published**, 12,607 member rows, every published hub answering 200, **6,052** member links
answering 200, **294** indexable leaves each in a hub or with a recorded reason.

**Sitemap.** Index lists five children and no more: `tier-1` **292**, `tier-2` **1**, `browse`
**1,837**, `hubs` **710** (709 published hubs plus `/h`), `pages` **10**. `/sitemaps/tier-3.xml`
answers **404**. `app/robots.ts` is byte-identical to `origin/main` (`git diff` writes 0 bytes).

**Frozen home search bar** (`browser-checks-v13.json`): **0.00 px** against
`data/corpus-20k/gate2/browser-checks-v2.json` — every measured value and every DOM path matches at
1440, 375 and 320 px. Per sample (7 pages × 2 widths): one `<h1>`, heading order in sequence, no
horizontal overflow at 320 px, body contrast minimum **10.015** and grey minimum **4.865** (both
identical to v12), 0 empty elements and 0 stand-in-text hits.

**JSON-LD** (`jsonld-v13.json`, seed 20260914). Twenty indexable pages: **exactly one**
`application/ld+json` block on each. Twenty noindex pages drawn across the three tiers: **zero**
blocks. All forty carry exactly one `<main>`; **0 failures**.

**Payload** (`payload-audit-v13.json`, the pinned 108 pages): 108 of 108 measured, RSC dossier share
of the document **0.0**, dossier text repeated in the RSC stream **0.0**, live text-to-HTML median
**0.154194** over all 108, **0.153683** over the 100-page indexable draw and 0.175009 over the eight
step-0.3 samples. **Step 6.1's floor of 0.15 holds, by 0.004194** (step 6.1's slim build measured
0.154027 on the v12 corpus). The median served document falls from 69,251.5 B to **69,293.5 B** and
the median dossier text from 21,851 B to **21,815.5 B**: the names §18(1) removed are text and
markup in the same header line, and the ratio moves by 0.000167.

**Slop draws 14 and 15 — the gate passes again.** Sixty pages each, 20 per tier, seeds 20260920 and
20260921, check (b) over the masked block with the sentence-level literal reading beside it, parity
by `dom_parity.py`'s own extraction:

| | draw 14 (seed 20260920) | draw 15 (seed 20260921) |
| --- | --- | --- |
| pages rendered | 60 of 60 | 60 of 60 |
| sentences | 1,160 | 1,116 |
| (a) traces to a stored field | **0 failures** | **0 failures** |
| (b) masked block on ≤ 0.5 % of pages | **0 failures** | **0 failures** |
| (b) sentence-level literal, reported only | 59 | 68 |
| (c) no label naming a device | **0 failures** | **0 failures** |
| render/DOM parity | 0 / 0 / 0 | 0 / 0 / 0 |
| `pages.md` words | 31,363 | 32,329 |

Draws 12 and 13 were already clean; these two are clean on the changed data. **Six consecutive clean
draws.**

**Tests.** `tests/test_render_safety.py` + `tests/test_hub_dedupe.py`: **58 passed, 0 skipped** (55
at fix round 7; the three §18 cases are this round's, and the parity rule passes on
`render-v13/dom-parity.json` once the measurement has written it).

**The CI sample, refreshed** (`data/revamp/ci-sample/`). `ci_sample.py` reads the newest ruler pair
and the newest render, which are now `thresholds-v13.json` + `presence-applicable-v13.ndjson`
(**294** indexable leaves, **266** of them hub members) and `data/revamp/render-v13`. The sample is
**200 pages** (tier 1: 64, tier 2: 68, tier 3: 68) in 8 files, 1,663,650 bytes, inside the 5 MB cap.
`package.json`, `.github/workflows/revamp-checks.yml`, `docs/specs/ci-checks.md`, `tests/conftest.py`
and `.gitignore` now name the v13 pair and the v13 render; the v12 pair is deleted.

**The four required pre-merge checks, run outside the working copy**
(`data/revamp/ci-sample/local-run.json`): `git archive HEAD` into a temporary directory, this
change's files copied in beside it, a fresh virtual environment from
`scripts/revamp/requirements-ci.txt`, and no corpus (`fields-v2`, `render-v13`, `page-blocks` and
`derived-v2` all absent there). **All five commands exit 0**: slug union current (9,907 slugs),
redirect plan written, link graph clean, sitemap invariants 4 passed, rendering rules **45 passed,
7 skipped**. The three new skips are §18's rules and each prints why: two need every corpus page's
names, which a 200-page sample cannot supply, and one counts heavy atoms with RDKit, which
`requirements-ci.txt` deliberately does not install. One negative probe per check is recorded with
the message it fails with, and all five probes fired.

**`npm run gate`**, after `rm -rf .next/cache`: **every stage green**, in order — `typecheck`,
`lint` (0 errors, 38 warnings, none on a file this round changed), `check:copy` (**0 hits**, the
stage measure v12 recorded failing on one occurrence of the word "harness"), `check:medicine-content`,
`audit:denial-corpus`, `agents:check`, `agents:import:check`, `check:agent-datasets`,
`check:four-audience-coverage`, `check:source-consensus-snapshot`, `check:dataset-export`,
`check:seo`, `format`, `drizzle-kit check`, `test:unit` (**180 files, 2,664 passed, 9 skipped**),
`test:integration` (**26 files, 167 tests**, on its own disposable database), `build`, and
`test:e2e` (**30 passed**, on its own disposable database).

**One observation for the lead, recorded and not acted on.** The measured text writes a relation
row's label from the stored relation type where the template has no word for it, so 94 rows in the
render read `same_structure_as X` while the page paints `same structure as X` — the page's own
`RELATION_LABELS` falls back to the type with its separators replaced, and `page-text.ts` replaces
only the dash. No reader meets the enum: relation rows are markup on both sides, the parity check
hides them on both sides, and the figure is 0/0/0. Correcting it is one line in `page-text.ts` and
costs a re-render and a re-derivation of the ruler, which is why it is recorded here rather than
taken inside a measurement.

**Outputs.** `data/revamp/thresholds-v13.json`/`.md`, `presence-applicable-v13.ndjson`,
`field-census-applicable-v13.csv`, `common-line-share-v13.json`, `rendered-dups-v13.csv`/
`-summary.json`, `rendered-dups-v13-prior-set.csv`/`-summary.json`, `redirect-check-v13-local.json`,
`hubs/link-graph-v13.json`, `browser-checks-v13.json`, `jsonld-v13.json`, `payload-audit-v13.json`,
`self-audit-round8.json`, `slop-draws/draw-14/{report.json,pages.md}`,
`slop-draws/draw-15/{report.json,pages.md}`, `identity/canonical-v7.ndjson`,
`identity/relations-v7.parquet` and `relations-v7-summary.json`, `identity/synonym-filter-v1.csv`
and `synonym-filter-summary.json`, `ci-sample/{thresholds-v13.json,
presence-applicable-v13-hub-members.ndjson,robots.ts.snapshot,local-run.json,render/*}`,
`data/revamp/render-v13/{text,text-with-furniture,provenance,dom-parity.json}`.
