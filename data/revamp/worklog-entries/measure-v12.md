### [PENDING-TIMESTAMP] Phase 4 — measure 8 (v12), after fix round 7

The same ruler as measures v6 through v11, on the fix-round-7 render, every check against one build,
one at a time. One generator change was made inside this measurement and it is recorded here rather
than in the fix-round entry, because it is a change to how a check reads the page: the relations
block's new disclosure needed a class the parity extraction hides, exactly as the relation rows are
hidden (§17(4) below).

**Commands, in order.**

```
.venv-corpus/bin/python scripts/revamp/derive_threshold.py --fields-dir data/revamp/fields-v2 \
    --assignments data/revamp/tiers/model-assignment-v2.ndjson \
    --text-dir data/revamp/render-v12/text --out data/revamp/thresholds-v12.json
.venv-corpus/bin/python scripts/revamp/common_line_share.py data/revamp/render-v12/text \
    data/revamp/render-v12/text-with-furniture data/corpus-20k/render/text \
    --out data/revamp/common-line-share-v12.json
# disposable database rnawiki_test_1789022125_v12, created and dropped by this run:
#   createdb; npx tsx db/migrate.ts (0000-0033, 34 rows in drizzle.__drizzle_migrations);
#   pg_restore --data-only -t drugs -t inventory_resolutions from
#     rnawiki-backups/corpus-20k-2026-09-05/rnawiki-pre-corpus-20k.pgcustom (9,859 + 9,859 rows,
#     PostgreSQL 18 tools at /opt/homebrew/opt/postgresql@18/bin);
#   materialise.ts --tier {1,3,2} --revamp --thresholds data/revamp/thresholds-v12.json
#     --no-checkpoint; scripts/revamp/hubs_load.ts; rm -rf .next/cache; npm run build;
#   npx next start -p 3213
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3213 \
    --seed 20260905 --sample 1000 --csv data/revamp/rendered-dups-v12.csv \
    --summary data/revamp/rendered-dups-v12-summary.json
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3213 \
    --seed 20260905 --indexable-keys data/revamp/indexable-keys-after.txt \
    --csv data/revamp/rendered-dups-v12-prior-set.csv \
    --summary data/revamp/rendered-dups-v12-prior-set-summary.json
.venv-corpus/bin/python scripts/revamp/redirect_check.py --base-url http://127.0.0.1:3213 \
    --out data/revamp/redirect-check-v12-local.json
.venv-corpus/bin/python scripts/revamp/link_graph_check.py --base-url http://127.0.0.1:3213 \
    --thresholds <abs>/data/revamp/thresholds-v12.json \
    --presence <abs>/data/revamp/presence-applicable-v12.ndjson \
    --out data/revamp/hubs/link-graph-v12.json
# npm run build; npx next start -p 3213   (the relations disclosure's class, below)
.venv-corpus/bin/python scripts/revamp/dom_parity.py --base-url http://127.0.0.1:3213 \
    --text-dir data/revamp/render-v12/text --sample 200 \
    --out data/revamp/render-v12/dom-parity.json
.venv-corpus/bin/python scripts/revamp/self_audit.py --base-url http://127.0.0.1:3213 \
    --out data/revamp/self-audit-round7.json
curl the sitemap index, its five children and /sitemaps/tier-3.xml
git diff origin/main -- app/robots.ts
npx tsx scripts/corpus-20k/gate2/browser-checks.ts --base http://127.0.0.1:3213 \
    --out data/revamp/browser-checks-v12.json
.venv-corpus/bin/python scripts/revamp/jsonld_check.py --base-url http://127.0.0.1:3213 \
    --sample 20 --seed 20260914 --out data/revamp/jsonld-v12.json
.venv-corpus/bin/python scripts/revamp/payload_audit.py --base-url http://127.0.0.1:3213 \
    --pages data/revamp/payload-audit-pages.txt --out data/revamp/payload-audit-v12.json
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3213 \
    --seed 20260918 --per-tier 20 --text-dir data/revamp/render-v12/text \
    --out-dir data/revamp/slop-draws/draw-12
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3213 \
    --seed 20260919 --per-tier 20 --text-dir data/revamp/render-v12/text \
    --out-dir data/revamp/slop-draws/draw-13
.venv-corpus/bin/python scripts/revamp/ci_sample.py
# the four required pre-merge checks in a git-archive clean room with no corpus
rm -rf .next/cache ; npm run gate
```

Server stopped, disposable database dropped, `.next/cache`, the clean room, the v11 overlap caches
and this run's DuckDB work files deleted. `data/revamp/render-v11` was deleted when v12 was written:
one render revision is kept.

**The ruler (`data/revamp/thresholds-v12.json`, furniture-free, the gate figure).**

| | Tier 1 | Tier 2 | Tier 3 |
| --- | --- | --- | --- |
| threshold | **20** | **20** | none |
| indexable | **293** | **1** | **0** |
| positional, all pairs (line 0.20) | **0.185977** | 0.0 | — |
| lexical, size-matched (line 0.353) | **0.349579** | 0.0 | — |
| v11 | 20 · 293 · 0.181707 · 0.348795 | 20 · 1 · 0 · 0 | none · 0 |
| thresholds-after (the 11-of-15 ruler) | 12 · 1,061 · 0.160173 · 0.328660 | 20 · 1 · 0 · 0 | none · 0 |

The ruler selects the same threshold and the same 293 pages as v10 and v11. Positional overlap on
that set rises from 0.181707 to **0.185977** and lexical from 0.348795 to **0.349579**: the 93,252
added interaction rows are shared vocabulary — "Predicted from mechanism", a class name, a
counterpart's name — and where two indexable pages both gained rows they read a little more alike.
Both figures still clear their lines, by 0.014 and 0.003. Tier 2 again selects 20 and one page, both
figures 0.0 on a one-page set. Tier 3 again selects **no threshold**: "no present-field count at or
above the stub floor produces a set that holds both lines", which is the unchanged rule's own
answer.

Loaded: **293** indexable rows (Tier 1 292 + Tier 2 1; the 293rd Tier 1 page is the `oysk` duplicate
hold, `noindex,follow` whatever its field count says). Tier sizes loaded: **1,697 / 3,787 /
23,173**, 710 hubs, 12,524 members. Identical to v11.

**The with-furniture reading.** Not measured as its own ruler this round. The furniture-free figure
is the gate figure and the with-furniture text is reported through `common-line-share-v12.json`
below; the long leg (2 h 14 min at v10) was not run because the furniture-free derivation alone took
1 h 50 min on this render and nothing in §17 changes what furniture is.

**Common lines and page length** (`common-line-share-v12.json`). Furniture-free: **7** lines carried
by more than half of the 28,657 pages, **6.8435 %** of the corpus's words, median page **122** words
(v11: 7, 6.9660 %, 122). With furniture: **20** lines, **31.9515 %**, median **273** (v11: 20,
32.3508 %, 273). Both shares fall because the denominator rose: the same lines over a corpus that is
165,243 words longer. The corpus-20k v4 render, on the same script: 4 lines, 5.0536 %, median 80.

**Self-audit** (`self-audit-round7.json`): **30/30 pages, 10/10 hubs, 19 rules, 3,419 applications,
0 failures**. The four rules §17 item 6 adds are in it: the withdrawal clause (2 applications), the
relation row against the page's own name (6), the unconfirmed note inside a closed control (30), and
the salt-form list against the page's component and mixture rows (0 applications on this draw — no
page in it carries both a salt-form group and a component row, and the rule is checked over the
corpus by `tests/test_render_safety.py` instead).

**Render and DOM** (`render-v12/dom-parity.json`, 200 pages): **0** painted lines missing from the
render, **0** render lines missing from the page, **0** out of order.

The first parity run of this measurement found **5 painted lines on 3 pages** that the render did
not carry, and they were the §17(4) notes. `dom_parity.py` compares the render's `proseText` — the
page without what the template declares markup — against the DOM with that same set hidden, and the
new `<details>` was not in the set while the relation rows above it were. The render writes the
notes as markup, so the DOM had to hide them too. The disclosure now carries
`class="cd-evidence cd-relation-notes"` and `.cd-relation-notes` joins `MARKUP_SELECTOR`, which is
one decision in one place for both sides. `self_audit.py`'s §17(4) rule reads the notes off the DOM
directly (text, and whether a closed `<details>` encloses them) rather than off an extraction that
now hides them, and it also reads the form-of region, so the rule states both halves: the note is
inside the control, and the form-of note does not carry it. The build was made again and every
DOM-read check re-run on it.

**Rendered duplicate check** (`rendered-dups-v12.csv`/`-summary.json`, 293 indexable + 709 published
hubs + a 996-page noindex sample, 1,998 pages rendered at 390 and 1,280 px, 4.4 minutes):
**0 indexable pairs**, **0 hub-to-hub pairs**, **0 hub-to-page pairs**; 31,508 pairs flagged in all
(31,504 stub-template, 2 identical-trial-set, 2 unclassified-overlap; none touching an indexable
page), against v11's 31,508. The one recorded issue, "1 indexable slugs have no key in the corpus
records", is the same one v9 through v11 carried.

Over the **1,062-key pre-Phase-4 comparison set** (`indexable-keys-after.txt`, of which 1,048 have a
slug in this corpus): **82 indexable pairs** — biosimilar 32, identical-trial-set 34,
unclassified-overlap 10, stub-template 6 (v11: 84). That set is the one the old threshold-11 ruler
named; the v12 ruler does not call those pages indexable and the figure is carried for comparison
only.

**Redirects** (`redirect-check-v12-local.json`): plan universe **9,857**, served directly 8,863, one
hop 1,044, **0 orphans, 0 chains, 0 conflicts**; live **8,884 × 200 and 973 × 308, 0 failures**.
Identical to v7 through v11.

**Link graph** (`hubs/link-graph-v12.json`): **PASS**, all seven rules. 714 hubs in the data files,
**709 published**, 12,607 member rows, every published hub answering 200, **6,052** member links
answering 200, **294** indexable leaves each in a hub or with a recorded reason.

**Sitemap.** Index lists five children and no more: `tier-1` **292**, `tier-2` **1**, `browse`
**1,837**, `hubs` **710** (709 published hubs plus `/h`), `pages` **10**. `/sitemaps/tier-3.xml`
answers **404**. `app/robots.ts` is byte-identical to `origin/main` (`git diff` writes 0 bytes).

**Frozen home search bar** (`browser-checks-v12.json`): **0.00 px** against
`data/corpus-20k/gate2/browser-checks-v2.json` — every measured value and every DOM path matches at
1440, 375 and 320 px. Per sample (7 pages × 2 widths): one `<h1>`, heading order in sequence, no
horizontal overflow at 320 px, no contrast under 4.5, and the stand-in-text probe empty on every
sample and width.

**JSON-LD** (`jsonld-v12.json`, seed 20260914). Twenty indexable pages: **exactly one**
`application/ld+json` block on each. Twenty noindex pages drawn across the three tiers: **zero**
blocks. All forty carry exactly one `<main>`; **0 failures**.

**Payload** (`payload-audit-v12.json`, the pinned 108 pages): 108 of 108 measured, RSC dossier share
of the document **0.0**, dossier text repeated in the RSC stream **0.0**, live text-to-HTML median
**0.149967** over all 108, **0.149692** over the 100-page indexable draw and 0.173544 over the eight
step-0.3 samples.

**Step 6.1's floor of 0.15 is not met, by 0.000033.** It is recorded, not adjusted. The cause is
§17 item 1's own rebuild: the median HTML delta across the 108 pages is **0 bytes** and the median
dossier text is unchanged at 21,851 bytes, but the pages that moved moved a long way in both
directions. Four of the pinned pages gained a full additive-effect class — eszopiclone
+13,563 bytes of HTML for +1,207 characters of text, clonidine +12,636 for +1,082, nitroprusside
+12,628 for +1,082, ertugliflozin +12,525 for +947 — and three lost one when the entity-class tests
excluded them: mannitol −14,764 for −1,176, sodium chloride −12,906 for −1,082, liraglutide −12,861
for −1,020. An interaction row costs about **11 bytes of markup per character of text**, well under
the 0.15 line, so publishing more of them lowers the ratio wherever they land. The median moved
0.150418 → 0.149967 on that arithmetic. Two things follow and both are for the lead: the ratio is a
payload question that step 6.1 owns, not a generator fault this round introduced; and the interaction
row is the densest markup on the page, so it is where step 6.1's target of 0.25 will be won or lost.

**Slop draws 12 and 13 — the gate passes again.** Sixty pages each, 20 per tier, seeds 20260918 and
20260919, check (b) over the masked block with the sentence-level literal reading beside it, parity
by `dom_parity.py`'s own extraction:

| | draw 12 (seed 20260918) | draw 13 (seed 20260919) |
| --- | --- | --- |
| pages rendered | 60 of 60 | 60 of 60 |
| sentences | 1,223 | 1,249 |
| (a) traces to a stored field | **0 failures** | **0 failures** |
| (b) masked block on ≤ 0.5 % of pages | **0 failures** | **0 failures** |
| (b) sentence-level literal, reported only | 68 | 76 |
| (c) no label naming a device | **0 failures** | **0 failures** |
| render/DOM parity | 0 / 0 / 0 | 0 / 0 / 0 |
| `pages.md` words | 33,131 | 33,428 |

Draws 10 and 11 were already clean; these two are clean on the changed generator, which is what §17
item 6 asks for. **Four consecutive clean draws.**

**The CI sample, refreshed** (`data/revamp/ci-sample/`). `ci_sample.py` reads the newest ruler pair
and the newest render, which are now `thresholds-v12.json` + `presence-applicable-v12.ndjson`
(**294** indexable leaves, **266** of them hub members) and `data/revamp/render-v12`. The sample is
**200 pages** (tier 1: 64, tier 2: 68, tier 3: 68) in 8 files, 1,657,948 bytes, inside the 5 MB cap.
`package.json`, `.github/workflows/revamp-checks.yml`, `docs/specs/ci-checks.md`, `tests/conftest.py`
and `.gitignore` now name the v12 pair and the v12 render; the v11 pair is deleted.

**The four required pre-merge checks, run outside the working copy**
(`data/revamp/ci-sample/local-run.json`): `git archive HEAD` into a temporary directory, this
change's files copied in beside it, a fresh virtual environment from
`scripts/revamp/requirements-ci.txt`, and no corpus (`fields-v2`, `render-v12`, `page-blocks` and
`derived-v2` all absent there). **All five commands exit 0**: slug union current (9,907 slugs),
redirect plan written, link graph clean, sitemap invariants 4 passed, rendering rules **45 passed,
4 skipped** (41 at v11; the four are this round's). One negative probe per check is recorded with
the message it fails with, and all five probes fired.

**`npm run gate`**, after `rm -rf .next/cache`: every stage green except one, and that one is not
this change's. `npm run check:copy` exits 1 on **one occurrence of the word "harness"** in
`docs/worklogs/revamp-2026-09.md` — the measure-v9 entry's sentence about the workflow harness, now
quoted once rather than three times. `scripts/quality/slop-scan.mjs` reads "harness" as promotional
copy. The worklog is append-only and this round does not edit it, so the stage is recorded failing
with its exact cause rather than made to pass. Everything else ran and passed in order:
`typecheck`, `lint` (0 errors, 38 warnings, none on a file this round changed),
`check:medicine-content`, `audit:denial-corpus`, `agents:check`, `agents:import:check`,
`check:agent-datasets`, `check:four-audience-coverage`, `check:source-consensus-snapshot`,
`check:dataset-export`, `check:seo`, `format`, `drizzle-kit check`, `test:unit` (**180 files, 2,661
passed, 9 skipped**), `test:integration` (**26 files, 167 tests**, on its own disposable database),
`build`, and `test:e2e` (**30 passed**, on its own disposable database).

**Outputs.** `data/revamp/thresholds-v12.json`/`.md`, `presence-applicable-v12.ndjson`,
`field-census-applicable-v12.csv`, `common-line-share-v12.json`, `rendered-dups-v12.csv`/
`-summary.json`, `rendered-dups-v12-prior-set.csv`/`-summary.json`, `redirect-check-v12-local.json`,
`hubs/link-graph-v12.json`, `browser-checks-v12.json`, `jsonld-v12.json`, `payload-audit-v12.json`,
`self-audit-round7.json`, `slop-draws/draw-12/{report.json,pages.md}`,
`slop-draws/draw-13/{report.json,pages.md}`, `identity/display-names-v6.csv` and
`display-names-v6-summary.json`, `interaction-validation.json` (both measurements),
`ci-sample/{thresholds-v12.json,presence-applicable-v12-hub-members.ndjson,robots.ts.snapshot,
local-run.json,render/*}`, `data/revamp/render-v12/{text,text-with-furniture,provenance,
dom-parity.json}`.
