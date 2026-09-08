### Phase 4 — fix round 4, the sixteen generator rules of §14

`docs/specs/phase4-generators.md` §14 items 1–16, from the lead's reading of slop draw 4. Every one
is a generator, loader or template change; no page was edited.

**Commands, in the order they were run.**

```
.venv-corpus/bin/python scripts/revamp/counterpart_artefacts.py
.venv-corpus/bin/python scripts/revamp/identity_relations_v6.py
.venv-corpus/bin/python scripts/revamp/controlled_suppression.py --fields-dir data/revamp/fields-v2 \
    --assignments data/corpus-20k/suppression/assignments.ndjson \
    --models data/corpus-20k/tiers/model-assignment.ndjson \
    --out data/revamp/suppression/assignments-v2.ndjson \
    --summary data/revamp/suppression/controlled-suppression.json
.venv-corpus/bin/python scripts/corpus-20k/derived/compute.py --fields data/revamp/fields-v2 \
    --registry data/corpus-20k/registry --assignments data/revamp/suppression/assignments-v2.ndjson \
    --out data/revamp/derived-v2 --as-of 2026-09-06
.venv-corpus/bin/python scripts/revamp/build_blocks.py --fields-dir data/revamp/fields-v2 \
    --models data/corpus-20k/tiers/model-assignment.ndjson \
    --relations data/revamp/identity/relations-v6.parquet --out-dir data/revamp/blocks
.venv-corpus/bin/python scripts/revamp/tier3_sections.py
.venv-corpus/bin/python scripts/revamp/page_blocks.py
npx tsx scripts/corpus-20k/questions/derive.ts --fields data/revamp/fields-v2 \
    --seeds data/revamp/derived-v2 --out data/revamp/questions-v2 \
    --suppression data/revamp/suppression/assignments-v2.ndjson
npx tsx scripts/revamp/page_text_v5.ts --out data/revamp/render-v9
npx tsx scripts/revamp/page_text_v5.ts --with-furniture --out data/revamp/render-v9
.venv-corpus/bin/python scripts/revamp/hubs_build.py   # three passes, see item 14
.venv-corpus/bin/python scripts/revamp/hubs_text.py
# disposable database: db:migrate; pg_restore drugs + inventory_resolutions;
# materialise.ts --tier {1,3,2} --revamp --thresholds data/revamp/thresholds-v8.json --no-checkpoint;
# scripts/revamp/hubs_load.ts; npm run build; npx next start -p 3199
.venv-corpus/bin/python scripts/revamp/self_audit.py --base-url http://127.0.0.1:3199
.venv-corpus/bin/python scripts/revamp/dom_parity.py --base-url http://127.0.0.1:3199 \
    --text-dir data/revamp/render-v9/text --sample 200 --out data/revamp/render-v9/dom-parity.json
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3199 \
    --sample 0 --seed 20260905 --csv data/revamp/rendered-dups-v9.csv \
    --summary data/revamp/rendered-dups-v9-summary.json
.venv-corpus/bin/python scripts/revamp/link_graph_check.py --base-url http://127.0.0.1:3199 \
    --out data/revamp/hubs/link-graph-v9.json
```

**What each item changed.**

1. **The supervision answer names the suppression evidence, never a register status.** The block
   read the `regulatory` field jurisdiction by jurisdiction and offered whatever it found as "the
   registers' classification of X"; on Piroxicam that produced "AU scheduled in the Poisons
   Standard", which is a prescription class and not a supervision reason, and whose provenance
   named registers the sentence did not. The answer is now built only from the recorded S1–S9
   classes, in the words `docs/specs/suppression-classes.md` fixes, anchored on the field the class
   evidence came from. `controlled_suppression.py` records **S2 only on the narrow test** the spec
   names — the Singapore Misuse of Drugs Act schedules, a US DEA schedule, an Australian Poisons
   Standard Schedule 8 or 9 — so a Singapore Poisons Act schedule no longer becomes a supervision
   reason: **1,836 pages keep the controlled trigger and the no-dose path, 241 of them carry S2**,
   and the schedule renders in the registration block, which is where §13(4) puts it.
2. **Register application rows leave every question block.** `registerStatusRows` is deleted, and
   `registerStatusValues` drops the record id from its prose ("US approved (2026-09-04)"). The
   supervision, label and register questions paint no application row.
3. **The US status word derives from the application set.** `us_status_word` in `build_blocks.py`:
   any active prescription or over-the-counter application → Approved; a tentative approval with no
   active application → Tentative approval; every application discontinued → Discontinued; a
   recorded withdrawal keeps its own word. **3,082 Approved, 626 Discontinued, 20 Tentative
   approval, 0 contradictions** against 0 lines reading "Approved · N applications: all
   discontinued". The loader counts the contradiction rather than rewriting it, so a load from a
   stale block file says so in its own output.
4. **"Registered studies posting no result" moves to the trials question.** It is a row under
   `trial-history` and `human-data` and is written by the label question no longer.
5. **Label interactions group by label and direction.** `page_blocks.py` groups Tier A by (set id,
   effective time, direction class) and names every counterpart the group stands for:
   **27,120 rows → 5,486 lines**. Piroxicam's twenty-one label lines are three. A counterpart must
   resolve to a substance page or a recognised drug class: `counterpart_artefacts.py` decides the
   two artefact shapes from the registers' own records — a GSRS substance class of
   `structurallyDiverse` (a cell, a tissue, a material, and how `PLATELETS` was linked) and a
   printed name that is a bare abbreviation (`ASA`, the aspirin DL-lysine record the same label
   also names as aspirin) — **3,247 pages named, 1,062 counterpart lines dropped** (725 material,
   337 abbreviation) and recorded in `data/revamp/interactions/counterpart-artefacts.csv`.
6. **A record id is painted only inside a closed disclosure.** `buildBlockBody` strips an identifier
   from every fact, the source list's id carries `cd-source-id` rather than `cd-row-id`, and the
   interaction disclosure row is built by two shared functions (`interactionDisclosureLabel`,
   `interactionRecordIds`) that the corpus renderer and the template both call — the render wrote
   "Substrate of CYP1A1, 1A2 and 2E1 frdb:ddi:12474 · …" while the page painted
   "CuratedB-inxight-frdb", because each had its own idea of what that row said.
7. **Parity whitespace.** A text node sits between every pair of adjacent inline elements that both
   carry text: the disclosure row's label and id, the register line's label and status, the schedule
   row, the relations and hub rows, the header's register and date, the hub breadcrumb and the hub
   member's name and question. The stylesheet's half-rem becomes a quarter-rem beside the space.
8. **Storage keys are never painted.** `looksLikePageKey` covers `K1:`–`K4:`, `COMBO:`, `PRODUCT:`,
   `HOLD:` and `IK:`; `buildBlockBody` drops such an identifier from every row and fact, and
   `anchor()` drops it from a citation — an ingest that recorded no register record id had written
   the page's own key there, and the anchor read "Drugs@FDA · COMBO:NAME:… · 2026-08-28".
9. **Every visible list caps at six rows.** `groupRevealedRows` splits any run longer than six into
   six rows and a counted remainder marked `disclosed`, which the template paints as a closed
   `<details>`; the same cap applies to the block's facts, the computed sections, the relations, the
   hubs, the sources and the "Other registers" rows. The seven jurisdiction lines and the
   controlled-substance schedule table are not capped: both are fixed lists that are the block's
   own answer.
10. **The provenance timeline** fires only on three or more dated events, sorted, and its question
    names the first and last event kinds ("How did X get from first publication in 1975 to first
    approval in 1999?"). Measured consequence: seed 8 falls from **226 pages to 2** and is
    discarded by the 40-page floor, so the corpus renders no timeline block. Two dated points are
    not a timeline and the seed says so.
11. **`never-dosed` is retired.** "Has X ever reached a person?" answered its own absence; the
    header's evidence line "No human study recorded" carries it once.
12. **One relation per pair.** `identity_relations_v6.py` keeps the most specific relation per
    directed pair by a fixed specificity order and writes `relations-v6.parquet` and
    `canonical-v6.ndjson` beside the v5 files: **1,022 directed pairs deduplicated** (256
    stereoisomer-of over form-of, 223 the same relation in two spellings, 114 over racemate-of, and
    the rest) and 6 relation rows dropped. Every consumer that renders — the page text, the loader,
    the blocks, the Tier 3 sections, the hubs, the duplicate check, the release build — reads v6.
13. **"This record holds N fields" is furniture**, in the render and on the page.
14. **Hub tables.** Every absence cell carries `data-furniture`, so the rendered duplicate check
    reads hub content and not shared absence. Measured on the build, that raised the hub-to-hub
    figure before it lowered it — removing text both hubs share raises their Jaccard — from
    1,472 pairs at v8 to **5,959**. The survivor rule of §13(13) then applied at rendered Jaccard
    ≥ 0.5 as §14(14) directs, over three passes, each re-measured on a restarted server:
    **923 hubs built → 714 published, 258 aliases**, and **1 hub-to-hub pair** left at 0.5703
    (`target/hdac8` ↔ `target/histone-deacetylase-1-histone-deacetylase-1`). Complete linkage will
    not fuse that pair into either page's group, which is the rule working as written, and it is
    recorded here rather than merged by a weaker linkage. `link_graph_check.py` passes all seven
    rules on the build: 710 published hubs, every one answering 200, 6,052 member links answering
    200.
15. **The trace classifier accepts a list.** A trace that is a semicolon-separated list of traces
    resolves when every element resolves and they are all of one class, so the grouped curated line
    (`frdb:ddi:16659; frdb:ddi:16660; …`) and the grouped label line's counterpart list are
    executed element by element rather than failing as unrecognised. Block rows were already exempt
    from both checks (`kind != 'sentence'`), and facts are now marked `fact` rather than `row` so a
    rule about what a reader meets without opening anything can be applied to them. The three
    one-value prose blocks draw 4 named are rows: the substituent comparison, the trial-size block
    (median, largest, counted, recorded status, posted results) and the mechanism block (action,
    target, mechanism-row count, what is not recorded), which keeps only the register's own quoted
    wording as prose.
16. **The self-audit** (`scripts/revamp/self_audit.py`, `data/revamp/self-audit-round4.json`):
    30 pages (10 per tier, seed 20260911) and 10 hubs rendered on this build, eleven mechanical
    rules checked against the painted DOM with the `dom_parity.py` extraction — **30/30 pages and
    10/10 hubs**, 3,321 individual rule applications, 0 failures. Three defects it found on the way
    were fixed: the hub breadcrumb and the hub member line joined two inline elements with no text
    node, and the audit's own supervision rule was reading the block's second paragraph (this
    record's study scope) as if it were the answer.

**The render.** `data/revamp/render-v9/{text,text-with-furniture,provenance}`, **28,657 pages**;
furniture-free **9,162,445 words**, mean 319.7; with furniture 13,083,271 and 456.5; 1,091,954
sentences, every one with a trace. `render-v8` deleted. The provenance map is written once, by the
furniture-free run: `renderPage` records every line it wrote, furniture marked, and the two
directories the render used to write were byte-identical over all 28,832 pages and 264 MB of the
second of them.

**Questions** 69,530 → **53,440**, from three retirements: the supervision question on the pages
whose only class was a Singapore Poisons Act schedule, `never-dosed`, and seed 8's timeline.

**Render and DOM agree again.** `dom_parity.py`, 200 pages: **0 lines the page lacks, 0 lines the
render lacks, 0 out of order**, against 15 of 30 disagreeing at v8. Two causes: the whitespace
defect of item 7, and the computed section's order — the render wrote every section's rows and then
every section's sentence, where the template paints each section's rows and then that section's
sentence.

**Tests.** `tests/test_render_safety.py` gains eleven §14 rules (34 cases, 41 with
`tests/test_hub_dedupe.py`) and reads whichever render revision is highest on disk rather than a
revision named by hand. `tests/unit/corpus-render-safety.test.ts` gains the DOM rules on the
components and the builders (71 cases). Nine existing cases asserted behaviour §14 retires and were
updated with the reason.

**Check (a), measured rather than assumed.** Over 1,000 interaction sentences on 117 pages that
carry a grouped line, **0 fail check (a)** — the shape that failed 16 and 13 times in draws 4 and
5. Two defects the measurement found and fixed: the Tier A grouping had written the label's set id
under the provenance map's `record` key, where a bare set id is of no recognised class (and says
nothing the row's `sentence` trace does not already say), and the group's counterpart traces were
joined with a semicolon, which is the separator inside one of them ("lexicon surface 'x'; the
corpus holds no page for it"). The record key is gone from a label group and the counterpart list
is joined with a middle dot, which the classifier splits on as well.

**Gate.** `npm run gate` green after `rm -rf .next/cache`: typecheck, lint, copy check, medicine
content, denial corpus, agents, dataset export, SEO checks, `prettier --check .`, drizzle-kit
check, unit **2,647 passed / 9 skipped**, integration **167 passed** on a disposable database, the
production build, and Playwright **30 passed**. `.venv-corpus/bin/python -m pytest
tests/test_render_safety.py tests/test_hub_dedupe.py`: **41 passed**.

**The build the audit ran against.** Rebuilt from the final artefacts after that fix and re-run:
30/30 pages, 10/10 hubs, `dom_parity.py` 200 pages with 0 divergences either way and 0 out of
order.

**The database.** A disposable database with `drugs` and
`inventory_resolutions` restored from `rnawiki-pre-corpus-20k.pgcustom`, migrations 0001–0031, the
three tiers loaded at `thresholds-v8.json` and the hubs after them: **28,657 `corpus_pages`, 298
indexable, 710 hubs, 12,524 hub members, 258 aliases**. No schema change was needed: the grouped
line's dataset records were already stored, in the interaction row's own `provenance` map, which is
what both sides now read. Server stopped and database dropped at the end.
