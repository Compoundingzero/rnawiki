### Phase 4 — fix round 3, the fourteen generator rules of §13

`docs/specs/phase4-generators.md` §13 items 1–14, from the lead's reading of slop draw 3. Every one
is a generator change; no page was edited.

**Commands, in the order they were run.**

```
.venv-corpus/bin/python scripts/revamp/tga_susmp_map.py 2026-09-06
.venv-corpus/bin/python scripts/revamp/integrate_sources.py --run-date 2026-09-06
.venv-corpus/bin/python scripts/revamp/build_blocks.py --fields-dir data/revamp/fields-v2 \
    --models data/corpus-20k/tiers/model-assignment.ndjson \
    --relations data/revamp/identity/relations.parquet --out-dir data/revamp/blocks
.venv-corpus/bin/python scripts/revamp/page_blocks.py
npx tsx scripts/corpus-20k/questions/derive.ts --fields data/revamp/fields-v2 \
    --seeds data/revamp/derived-v2 --out data/revamp/questions-v2 \
    --suppression data/revamp/suppression/assignments-v2.ndjson
npx tsx scripts/revamp/page_text_v5.ts --out data/revamp/render-v8
npx tsx scripts/revamp/page_text_v5.ts --with-furniture --out data/revamp/render-v8
.venv-corpus/bin/python scripts/revamp/hubs_build.py
.venv-corpus/bin/python scripts/revamp/hubs_text.py
.venv-corpus/bin/python scripts/revamp/hubs_measure.py --set both --suffix=-v2
.venv-corpus/bin/python scripts/revamp/link_graph_check.py --data-only \
    --out data/revamp/hubs/link-graph-data-only-v2.json
.venv-corpus/bin/python scripts/revamp/duplicate_holds.py \
    --summary data/revamp/rendered-dups-v7-summary.json --pairs data/revamp/rendered-dups-v7.csv \
    --presence data/revamp/presence-applicable-v7.ndjson --slugs data/revamp/identity/page-slugs.csv \
    --out data/revamp/identity/duplicate-holds.csv --hold-list data/revamp/identity/hold-list-v5.csv
```

**What each item changed.**

1. **Absences never appear in a prose answer.** The `classification` question is retired: it fired
   only on an S10-only record and answered "No regulator classification is recorded for X", on
   16,814 pages. `jurisdiction` (seed 17) now fires only where a register recorded an affirmative
   classification — 12,872 → **397** pages — and names only those statuses. The supervision answer
   names a schedule, a withdrawal, a boxed warning or a REMS and never a jurisdiction read from
   another source; where the record holds none, the block does not render. The label question's
   regulatory paragraph is gone, and with it the `curatedMarketingStatusNote` leak:
   `readRegisterStatuses` accepts only a two-letter jurisdiction code, so a stored note is no longer
   read as a jurisdiction. `registerStatusValues` and `registerStatusRows` drop absences; the
   registration block's absence table is the one place they are stated. Questions 98,846 → **69,530**.
2. **"What the registers record" is retired.** `withdrawnArcRows` and `WithdrawnArc.tsx` are gone.
   `registerEventLines` folds the events into the registration block, one sentence per event in
   words — `Withdrawn in France, 1996, for "drug misuse" (ChEMBL; Open Targets)` — with identical
   events from several registers merged onto one line and the registers' own column names
   (`drug_warning`, `withdrawn_flag`, `warningType`) never printed. The register's stated reason is
   quoted, because it is the register speaking: several notices read "Not safe or effective for
   intended use", which unquoted would be this site calling something unsafe.
3. **Interactions render once, grouped.** `page_blocks.py` groups the curated enzyme and transporter
   rows by role before either consumer reads them: **15,382 rows → 4,497 lines**, one per role, with
   the shared family prefix written once — `Curated · Substrate of CYP1A2, 2A6, 2B6, 2C19, 2C8, 2C9,
   2D6, 2E1 and 3A4, with a reported magnitude · Inxight FRDB`. The per-line badge and the per-tier
   heading are gone, so the tier label is one visible element per line. Record ids are in the closed
   disclosure only, and the block never paints the same line twice.
4. **Schedules render once.** The Singapore line names the class and says "see the
   controlled-substance schedules below"; the Australian line names the schedule and does the same.
   Neither repeats the statute, its version or the substance as listed — those are in the table.
5. **Trial lists cap at six visible rows.** The counted remainder is a closed native `<details>`
   whose summary is the group's own label, so its rows are not painted until a reader opens them.
6. **The Inxight "unspecified" rows and the upstream-register clauses are disclosure only.**
   `build_blocks.py` marks the row `disclosed` (15,140 of 15,966 "Other registers" rows) and moves
   "upstream registers: ClinicalTrials, February 2021 …" into the row's disclosure. Migration 0031
   adds `page_registration.disclosed`.
7. **Single-value statements are rows.** `BlockBody` gains `facts`, painted under the question
   heading and above the prose: "Posted no result · 25 of 29 completed trials", "Publications
   (ChEMBL) · 1981–2023". "X has no recorded human exposure" is furniture.
8. **The nearest approved neighbour is rows** — `Closest approved compound · Flurazepam · similarity
   0.48 · approved US, CA · generic available` — with a prose sentence only where the MCS comparison
   named the substituent that differs.
9. **A form-of note prints the related name once**, as the link text inside its own sentence.
10. **The header prints one evidence line**: the evidence kind where the record holds human data,
    "No human study recorded" where it does not, never both.
11. **The decorative glyphs are CSS pseudo-element content** (`.cd-glyph::before`,
    `.cd-anchor-glyph::before`), so neither the ruler nor a crawler reads "◇" or "~" as a word.
12. **SUSMP matching requires a full normalised synonym.** `normalise_name` strips trailing
    counter-ion words, which collapses "SODIUM PHOSPHATE", "SODIUM DIACETATE" and "SODIUM CITRATE"
    all to "sodium"; that is how the trisodium citrate page came to carry Schedules 3, 4 and 5.
    `corpus_join` gains `full_name_to_keys` and the mapping rule (d) uses it: **193 rows removed, 0
    added** (3,549 → 3,356; name-candidate 396 → 203). `integrate_sources.py` was re-run at
    `--run-date 2026-09-06` so nothing else moved, and the controlled block was rebuilt.
13. **Hubs deduplicate by member set.** Complete linkage at 0.5 Jaccard over the finished hubs of
    every kind; the largest member set survives, the others become aliases that redirect to it and
    are named in its definition line ("Also known by …"). **972 built → 923 published, 49 aliases.**
    `hub_aliases` (migration 0031) carries them and `/h/<type>/<slug>` answers with a permanent
    redirect. An absorbed hub's members that the survivor did not already hold join it, with the
    membership evidence recording which absorbed group put them there: `docs/specs/hubs.md` §3
    forbids an indexable leaf with no hub, and four pages whose only group was absorbed had none
    until this was added (`link_graph_check.py --data-only` PASS, 13,121 memberships over 6,124
    pages). Re-measured: `measure-all-v2.json` positional **0.125**, lexical **0.3208**, both under
    the lines; `measure-first-batch-v2.json` passes.
14. **Duplicate hold.** `scripts/revamp/duplicate_holds.py` reads the rendered check's own outputs
    and holds the page with fewer own facts: `trastuzumab-and-hyaluronidase-oysk` (20 own fields) is
    `noindex,follow` and links `pertuzumab-trastuzumab-and-hyaluronidase-zzxf` (21), which is the
    pair §12(4) predicted would survive. `data/revamp/identity/duplicate-holds.csv`, appended to
    `hold-list-v5.csv` with the default "one page per product". Migration 0031 adds
    `corpus_pages.duplicate_hold_of`; the loader reads the file and refuses the held page an index.

**The render.** `data/revamp/render-v8/{text,text-with-furniture,provenance,provenance-with-furniture}`,
**28,657 pages**; furniture-free **10,274,502 words**, mean 358.5; with furniture 14,265,280 and
497.8. `render-v7` deleted.

**Tests.** `tests/test_render_safety.py` gains eight §13 rules — no absence in a prose answer, no
field name or enum string in visible text, one tier label per line, no dataset record id on a prose
line, a statute row once, a trial list of six, no decorative glyph, and a Poisons Standard row that
matches a full synonym — and the retired classification answer is now asserted absent while the
registration block's absence table is asserted present. `tests/test_hub_dedupe.py` is new (6 cases
on the member-set rule, complete linkage included). `tests/unit/corpus-render-safety.test.ts` gains
the same rules on the components (52 cases).

**Two defects the new rules found and fixed on the way.** Seed 8 records the ChEMBL first-approval
event's `date` as the stringified source record, which printed as "first approval {'ch" once
`slice(0, 4)` had taken four characters of it; the renderer now takes a date only where the value is
shaped like one and falls back to the event's own year. And the same block appended the current
register state to its answer, which on a never-cleared register read "; not cleared".
