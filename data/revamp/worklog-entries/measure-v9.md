### [PENDING-TIMESTAMP] Phase 4 — measure v9 (after fix round 4)

The same ruler as measures v6, v7 and v8, on the fix-round-4 render, every check against one build
and one at a time. One generator change was made before the checks: the hub duplicate hold §14(14)
directs, which fix round 4 measured and recorded but did not apply.

**The hub duplicate hold, applied.** Fix round 4 left one hub-to-hub pair at rendered Jaccard
**0.5703** — `target/hdac8` (19 members) against
`target/histone-deacetylase-1-histone-deacetylase-1` (30 members) — because complete linkage will
not fuse that pair into either member-set group. §14(14) sends what the member-set dedupe leaves
down the road §13(14) already lays for a record page, and that road did not exist for a hub. It
does now, and nothing about it is decided at render time:

- `hubs.duplicate_hold_of` (migration **0032**, one nullable `varchar(200)` holding the survivor's
  `hub_id`). No other column, table or enum changed.
- `scripts/revamp/duplicate_holds.py --kind hub` reads the rendered check's own pairs file for
  `set_a`/`set_b` of `hub`, takes the member count from `data/revamp/hubs/hubs.parquet` as the
  hub's "own facts" — the member set is what a hub is — and holds the smaller, breaking a tie on
  the hub id so the choice never depends on the order a CSV happened to hold. The file it writes
  gains a `kind` column so one file carries both kinds and each loader reads its own:
  `materialise.ts` skips a row that is not `kind=page`, `hubs_load.ts` reads only `kind=hub`.
- `hubs_load.ts` copies the survivor's id onto the held hub and folds the holds file into its
  idempotence marker, so a hold added after a load is not "already loaded". A hold naming a hub the
  load is not writing is counted and dropped rather than written as a dead link
  (`skippedHolds`, 0 here).
- The hub page carries `noindex,follow`, says so, and links the survivor. It keeps every link it
  had: the hold is about what a search engine indexes, not about what a reader can reach.
- `listHubRoutes` and `countHubs` exclude a held hub, so it leaves `hubs.xml`. A sitemap entry for
  a URL whose page tells a crawler not to index it is a contradiction, and the corpus already
  applies that rule to a held record page.
- Recorded in `data/revamp/identity/duplicate-holds.csv` (2 rows: the `oysk`/`zzxf` page pair from
  measure v7 and this hub pair) and appended to `data/revamp/identity/hold-list-v5.csv` (66 → 67
  rows) with the default: **one group per member set**.
- Asserted in `tests/unit/hubs-render.test.ts` (3 cases, 11 in the file): the held hub's
  `noindex, follow`, its link and its note; that it keeps its member links; and that an unheld hub
  is `index, follow` and prints no note. `drizzle-kit check` clean;
  `tests/test_render_safety.py` and `tests/test_hub_dedupe.py` **41 passed**.

**Commands, in order.**

```
# data/revamp/thresholds-v9.json was already written by the fix-round-4 run and is reused
# unchanged; its with-furniture leg was still running at the start of this one and finished
# during it (below).
.venv-corpus/bin/python scripts/revamp/duplicate_holds.py --kind hub \
    --summary data/revamp/rendered-dups-v9-summary.json \
    --pairs data/revamp/rendered-dups-v9.csv --hubs data/revamp/hubs/hubs.parquet \
    --out data/revamp/identity/duplicate-holds.csv \
    --hold-list data/revamp/identity/hold-list-v5.csv
npx drizzle-kit generate --name hub_duplicate_holds     # db/migrations/0032_hub_duplicate_holds.sql
    # the disposable database rnawiki_test_1788893571284_5a803404d7 the fix-round-4 run left
    # (28,657 corpus_pages, 298 indexable, 710 hubs, 12,524 members, 258 aliases, migrations
    # 0000–0031) answered /d/metformin with the v9 corpus, so it was reused rather than rebuilt
npx tsx db/migrate.ts                                    # 0032 applied; 33 migration rows
npx tsx scripts/revamp/hubs_load.ts                      # hubsHeldNoindexFollow 1, skippedHolds 0
rm -rf .next/cache && npm run build
npx next start -p 3207
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3207 \
    --seed 20260905 --csv data/revamp/rendered-dups-v9.csv \
    --summary data/revamp/rendered-dups-v9-summary.json
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3207 \
    --seed 20260905 --indexable-keys data/revamp/indexable-keys-after.txt \
    --csv data/revamp/rendered-dups-v9-prior-set.csv \
    --summary data/revamp/rendered-dups-v9-prior-set-summary.json
.venv-corpus/bin/python scripts/revamp/redirect_check.py --base-url http://127.0.0.1:3207 \
    --out data/revamp/redirect-check-v9-local.json
.venv-corpus/bin/python scripts/revamp/link_graph_check.py --base-url http://127.0.0.1:3207 \
    --thresholds <abs>/data/revamp/thresholds-v9.json --out data/revamp/hubs/link-graph-v9.json
curl the sitemap index, its five children and /sitemaps/tier-3.xml
git diff origin/main -- app/robots.ts
npx tsx scripts/corpus-20k/gate2/browser-checks.ts --base http://127.0.0.1:3207 \
    --out data/revamp/browser-checks-v9.json
curl 20 indexable pages and 19 noindex pages, counting application/ld+json blocks
.venv-corpus/bin/python scripts/revamp/payload_audit.py --base-url http://127.0.0.1:3207 \
    --pages data/revamp/payload-audit-pages.txt --out data/revamp/payload-audit-v9.json
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3207 \
    --seed 20260912 --per-tier 20 --text-dir data/revamp/render-v9/text \
    --out-dir data/revamp/slop-draws/draw-6
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3207 \
    --seed 20260913 --per-tier 20 --text-dir data/revamp/render-v9/text \
    --out-dir data/revamp/slop-draws/draw-7
```

Server stopped, disposable database dropped, `.next/cache` and `data/revamp/rendered-text` deleted.

**The ruler (`data/revamp/thresholds-v9.json`, furniture-free, reused unchanged).** Tier 1
threshold **20**, **298** indexable, positional all pairs **0.190322**, lexical size-matched
**0.349741** — both under the 0.20 and 0.353 lines. Tier 2 threshold **20**, **1** indexable, both
figures 0.0 on a one-page set. Tier 3 selects **no threshold**: no present-field count at or above
the stub floor produces a set that holds both lines, so no Tier 3 page is indexable, which is the
unchanged rule's own answer and not a decision taken here. Loaded: **298** indexable rows
(Tier 1 297 + Tier 2 1; the 298th Tier 1 page is the `oysk` duplicate hold, `noindex,follow`
whatever its field count says).

**The with-furniture reading, recorded beside it and never selecting**
(`thresholds-v9-with-furniture.json`, written during this run after 2 h 28 min — the Tier 3 leg
over 22,617 pages is the long one). Scored on the same 28,657 pages with their furniture: Tier 1
selects **23** and **48** indexable at positional 0.188294 and lexical 0.333771; Tier 2 selects
**20** and 1; Tier 3 again selects nothing. §11 fixes furniture-free as the gate figure because
before Phase 4 an absence rendered nothing and was not in the measured text either; the 23/48
reading is what the same rule says when the honest absence statements Operating Rule 9 requires are
counted as prose, and it is exactly the gap §11 was written to describe.

**Rendered duplicate check** (`rendered-dups-v9.csv`/`-summary.json`, 298 indexable + 709 published
hubs + a 996-page noindex sample of a 28,076 frame, 2,003 pages rendered at 390 and 1,280 px, 15.3
minutes): **0 indexable pairs**, **0 hub-to-hub pairs**, 0 hub-to-page pairs, 31,468 pairs flagged
in all (31,462 of them stub-template, none touching an indexable page). The two hub-pair readings
fix round 4 recorded are gone because the held hub is out of the published set the check reads —
the hold resolved the pair rather than the measurement moving. The one recorded issue, "1 indexable
slugs have no key in the corpus records", is the same one the fix-round-4 summary carries.

Over the **1,062-key pre-Phase-4 comparison set** (`indexable-keys-after.txt`, of which 1,048 have
a slug in this corpus and 1,041 rendered): **82 indexable pairs**, identical to fix round 4 —
biosimilar 32, identical-trial-set 30, unclassified-overlap 14, stub-template 6. That set is the
one the old threshold-11 ruler named; the v9 ruler does not call those pages indexable, and the
figure is carried for comparison only.

**Redirects** (`redirect-check-v9-local.json`): plan universe **9,857**, served directly 8,863, one
hop 1,044, **0 orphans, 0 chains, 0 conflicts**; live **8,884 × 200 and 973 × 308, 0 failures**.
Identical to v7 and v8.

**Link graph** (`hubs/link-graph-v9.json`): **PASS**, all seven rules. 714 hubs in the data files,
**709 published**, 12,607 member rows, every published hub answering 200, **6,052** member links
answering 200, 299 indexable leaves each in a hub or with a recorded reason.
`inDataFilesNotPublished` names five: the four the loader refuses for having fewer than five
loadable members (`class/h01ac`, `class/h01ba`, `class/n06dx`, `target/leg3`) and
`target/hdac8`, the held hub. The check reports that difference as a named list rather than
failing or passing it unseen.

**Sitemap.** Index lists five children and no more: `tier-1` **297**, `tier-2` **1**, `browse`
**1,839**, `hubs` **710** (709 published hubs plus `/h`), `pages` **10**. `/sitemaps/tier-3.xml`
answers **404**. `app/robots.ts` is byte-identical to `origin/main`.

**Frozen home search bar** (`browser-checks-v9.json`): **0.00 px** against
`data/corpus-20k/gate2/browser-checks-v2.json` on every box value at 1440, 375 and 320 px, same DOM
path at all three. Per sample: one `<h1>`, no horizontal overflow at 320 px, no element without a
focus ring, and the check's stand-in-text probe empty on every sample and width.

**JSON-LD.** Twenty indexable pages drawn from the loaded corpus: **exactly one**
`application/ld+json` block on each, twenty of twenty. Nineteen noindex pages drawn across the
three tiers: **zero** blocks, which is `corpusDossierJsonLdGraph` returning null on a page that is
not indexed rather than a page missing its graph.

**Payload** (`payload-audit-v9.json`, the pinned 108 pages): 108 of 108 measured, RSC dossier share
of the document **0.0**, dossier text repeated in the RSC stream **0.0**, live text-to-HTML median
**0.154035** over all 108, **0.153577** over the 100-page indexable draw and 0.175909 over the
eight step-0.3 samples. Above step 6.1's **0.15** floor and below its 0.25 target. Median document
bytes fall from 76,311.5 at v8 to **69,406.5** and median dossier text from 23,017.5 to 21,455.5 —
fix round 4 removed repeated lines from both sides, which is why the ratio barely moves.

**Slop draws 6 and 7 — the gate does not pass.** Sixty pages each, 20 per tier, seeds 20260912 and
20260913, check (b) over the masked block with the sentence-level literal reading beside it, parity
by `dom_parity.py`'s own extraction:

| | draw 6 (seed 20260912) | draw 7 (seed 20260913) |
| --- | --- | --- |
| pages rendered | 60 of 60 | 60 of 60 |
| sentences | 901 | 1,107 |
| (a) traces to a stored field | **0 failures** | **0 failures** |
| (b) masked block on ≤ 0.5 % of pages | **4 failures** | **4 failures** |
| (b) sentence-level literal, reported only | 60 | 63 |
| (c) no label naming a device | **0 failures** | **0 failures** |
| render/DOM parity | 0 / 0 / 0 | 0 / 0 / 0 |
| `pages.md` words | 31,276 | 32,104 |

Against draw 5 that is (a) 13 → 0, (c) 0 → 0, parity 259 divergences → 0, and (b) 2 → 4. The (a)
and parity numbers are fix round 4 landing. The (b) count rising is not a regression in kind: draws
3 to 5 ran against the v7 and v8 builds, and every shape they named is gone. Two shapes remain, and
both are one generator each, both on **question blocks**:

1. **The register status line inside a question block.** "CA approved (2026-09-04). Drugs@FDA ·
   2026-08-28" masks to `ca approved <num> drugs fda <num>` and is on **182 pages (0.64 %)**. It
   failed on Poloxamer in draw 6 and on Borneol-2 and Glyoxal in draw 7. §14(2) retired the
   register *application rows* from every question block and §14(3) fixed the status word;
   `registerStatusValues` survived both as the block's value list, and on a page whose only
   recorded approval is Canada's it is the whole answer — one jurisdiction, one date, one register
   name, repeated verbatim across every page in that position.
2. **The mechanism block's kept prose.** "The mechanism record reads \"<the register's wording>\".
   ChEMBL 37 · CHEMBL… · 2026-09-04" is on **954 pages (3.33 %)** for the common wordings and 192
   to 240 for the rarer ones. §14(15) turned the mechanism block into rows and kept "only the
   register's own quoted wording as prose"; the frame around that quotation is fixed, so once the
   quotation and the identifiers mask the sentence is the same sentence corpus-wide. It failed on
   Amdoxovir, SCH-486757 and Azintuxizumab vedotin in draw 6 and on AV-101 and GSK-461364 in
   draw 7.

Both are recorded here for the lead's §15 reading rather than fixed in this run: the rule is to fix
the generator, and which of the two roads each takes — a row instead of a sentence, as §13(7) took
the other one-value statements, or the sentence dropped where the block's own rows already carry
the value — is the lead's call. Every artefact for that reading is in
`data/revamp/slop-draws/draw-6/` and `draw-7/` (`report.json`, `pages.md`).

**Outputs.** `data/revamp/rendered-dups-v9.csv`/`-summary.json`,
`rendered-dups-v9-prior-set.csv`/`-summary.json`, `redirect-check-v9-local.json`,
`hubs/link-graph-v9.json`, `browser-checks-v9.json`, `payload-audit-v9.json`,
`slop-draws/draw-6/{report.json,pages.md}`, `slop-draws/draw-7/{report.json,pages.md}`,
`identity/duplicate-holds.csv`, `identity/hold-list-v5.csv`,
`db/migrations/0032_hub_duplicate_holds.sql`.
