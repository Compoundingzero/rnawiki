### Phase 4 — fix round 5, the nine generator rules of §15

`docs/specs/phase4-generators.md` §15 items 1–9, from the lead's reading of slop draw 6. Every one
is a generator, mapping, loader or template change; no page was edited.

**Commands, in the order they were run.**

```
.venv-corpus/bin/python scripts/revamp/openfda_label_map.py          # shards deleted first
.venv-corpus/bin/python scripts/revamp/openfda_label_finalise.py
MODEL_OUT_DIR=data/revamp/tiers MODEL_OUT_FILE=data/revamp/tiers/model-assignment-v2.ndjson \
    RECUT_AGE_RELATED_ONLY=1 .venv-corpus/bin/python scripts/corpus-20k/tiers/assign-models.py
.venv-corpus/bin/python scripts/revamp/integrate_sources.py --run-date 2026-09-06
.venv-corpus/bin/python scripts/revamp/interactions_build.py --run-date 2026-09-06
.venv-corpus/bin/python scripts/revamp/counterpart_artefacts.py
.venv-corpus/bin/python scripts/revamp/identity_apply.py
.venv-corpus/bin/python scripts/revamp/identity_relations_v6.py
.venv-corpus/bin/python scripts/revamp/controlled_suppression.py --fields-dir data/revamp/fields-v2 \
    --assignments data/corpus-20k/suppression/assignments.ndjson \
    --models data/revamp/tiers/model-assignment-v2.ndjson \
    --out data/revamp/suppression/assignments-v2.ndjson \
    --summary data/revamp/suppression/controlled-suppression.json
.venv-corpus/bin/python scripts/corpus-20k/derived/compute.py --fields data/revamp/fields-v2 \
    --registry data/corpus-20k/registry --assignments data/revamp/suppression/assignments-v2.ndjson \
    --out data/revamp/derived-v2 --as-of 2026-09-06
.venv-corpus/bin/python scripts/revamp/build_blocks.py --fields-dir data/revamp/fields-v2 \
    --models data/revamp/tiers/model-assignment-v2.ndjson \
    --relations data/revamp/identity/relations-v6.parquet --out-dir data/revamp/blocks
.venv-corpus/bin/python scripts/revamp/tier3_sections.py
.venv-corpus/bin/python scripts/revamp/page_blocks.py
npx tsx scripts/corpus-20k/questions/derive.ts --fields data/revamp/fields-v2 \
    --seeds data/revamp/derived-v2 --out data/revamp/questions-v2 \
    --suppression data/revamp/suppression/assignments-v2.ndjson
npx tsx scripts/revamp/page_text_v5.ts --out data/revamp/render-v10
npx tsx scripts/revamp/page_text_v5.ts --with-furniture --out data/revamp/render-v10
.venv-corpus/bin/python scripts/revamp/hubs_build.py
.venv-corpus/bin/python scripts/revamp/hubs_text.py
.venv-corpus/bin/python scripts/revamp/derive_threshold.py --applicability-only \
    --fields-dir data/revamp/fields-v2 --out data/revamp/thresholds-v10.json
# disposable database: db:migrate (0001-0033); pg_restore drugs + inventory_resolutions;
# materialise.ts --tier {1,3,2} --revamp --thresholds data/revamp/thresholds-v9.json
#     --presence data/revamp/presence-applicable-v10.ndjson; hubs_load.ts; npm run build;
# npx next start -p 3199
.venv-corpus/bin/python scripts/revamp/self_audit.py --base-url http://127.0.0.1:3199 \
    --out data/revamp/self-audit-round5.json
.venv-corpus/bin/python scripts/revamp/dom_parity.py --base-url http://127.0.0.1:3199 \
    --text-dir data/revamp/render-v10/text --sample 200 --out data/revamp/render-v10/dom-parity.json
```

**What each item changed.**

1. **The supervision answer is one clause per recorded class, each with its own evidence and
   source.** The block used to name the class from a fixed list — "a World Health Organization
   therapeutic class such as cancer medicines, immune suppressants, opioids or general
   anaesthetics" — and anchor the sentence on whichever recorded field happened to be present,
   which on Acetyldigitoxin cited a `tga-artg schedule-4` row that had not put the record in any
   class. The suppression pass already recorded, per class, the source that stated it and the value
   that source carried; those rows now travel to the renderer and the page
   (`corpus_pages.suppression_evidence`, migration **0033**) and `supervisionClauses`
   (`lib/corpus/suppression-labels.ts`) builds one sentence per class from them:
   "Its World Health Organization ATC class is C01AA, Digitalis glycosides (WHO ATC via
   ChEMBL/EMA)."; "Its United States label carries a boxed warning naming cardiovascular death and
   death or fatality (DailyMed label f1123fe1-…, 2026-08-19)."; "A statute schedules it as a
   controlled substance: First Schedule Part 1 — Class A controlled drug, statute version
   2026-05-01 (Misuse of Drugs Act 1973, 2020 Rev Ed)." A clause whose evidence row carries no
   source is not written, and a record left with no clause renders no block.
   `controlled_suppression.py` resolves the ATC group's own name from the ChEMBL `atc_class`
   download (**1,193** group codes read, **1,508** evidence rows named, 0 codes the register
   publishes no group for) and records S2 evidence only for the narrow controlled test, so a
   Singapore Poisons Act or Poisons Rules schedule — a prescription class — is no longer among the
   rows a clause can be built from. `docs/specs/suppression-classes.md` carries the clause table.
2. **Label mapping requires the page's own UNII and excludes unapproved product categories.**
   `openfda_label_map.py` drops the RxCUI fallback (a clinical drug concept is not the substance
   the page is) and joins the FDA NDC directory's marketing category to each SPL. **11,392 labels
   removed**: 11,232 by category — 9,221 homeopathic, 2,007 unapproved, 4 by the label's own
   indications naming the product homeopathic — and 160 that had resolved by RxCUI alone.
   **3,503 pages affected**: 3,065 lose every label, 437 lose some, and one page's only label was
   an RxCUI match. Mapped rows **177,670 → 124,706**, pages carrying a label **5,426 → 2,357**.
   Acetyldigitoxin's cosmetology-symptom indication (a homeopathic "Beautox" SPL that lists ten
   UNIIs, acetyldigitoxin's among them) is gone, and so is the nail liquid's directions line.
3. **CLINICAL requires a register approval.** `assign-models.py` keeps the `otc-label` ground only
   where openFDA records an application number for that SPL set id: **5,295** OTC labels carry
   none, and **556 pages** whose only CLINICAL ground was one of them are DEVELOPMENT.
   Tier sizes over the 28,832 assigned keys: Tier 1 **1,719 → 1,717**, Tier 2 **4,477 → 3,923**,
   Tier 3 **22,636 → 23,192**. Every one of the 556 had `otc-label` as its whole case; ten
   otc-label-only pages stay CLINICAL because their SPL does carry an application. The two Tier 1
   changes are the withdrawn flag on pegaptanib, colistin and teriparatide, whose registers now
   record a remaining active entry — the guard in `docs/specs/field-models.md`, not this rule.
   `data/revamp/tiers/model-assignment-v2.ndjson` is now read by the integration (which writes the
   model onto the field record: 556 remodelled), the ruler, the blocks, the Tier 3 sections, the
   hub build, the renderer and the loader.
4. **The register status value line leaves every question block, and the mechanism quotation is a
   row.** `registerStatusValues` is deleted with the two blocks that were its last callers:
   `regulatory-only` ("Where is X approved?", answered by "CA approved (2026-09-04)" on a page whose
   only approval is Canada's — 182 pages, 0.64 %) and `jurisdiction` ("Drug, supplement or
   controlled: what is X in …?", answered by "EU withdrawn: the registers' classifications of
   Rosiglitazone" — 160 pages). §13(1) had kept the second where a register recorded an affirmative
   classification; §15(4) is general, and the registration block states each register's status
   once, with its date. The mechanism block's kept prose ("The mechanism record reads "<the
   register's wording>"", 954 pages, 3.33 %) is a row per §13(7): `Mechanism (ChEMBL 37)
   "Sodium/glucose cotransporter 2 inhibitor"`.
5. **Seed 9 asks its ageing question only on an ageing endpoint.** `AGEING_ENDPOINTS` in
   `compute.py` is the audience table with the lifespan row narrowed to the words that are an
   ageing endpoint in themselves — lifespan, life span, all-cause mortality — so "event-free
   survival" and "overall survival time (OS)" no longer read as lifespan. The seed records the
   ageing endpoint only where they match and the verbatim endpoint always; the derivation asks
   "Which running trial of X could settle lifespan?" on the first (**126 blocks**) and "Which
   running trial of X reads out next?" on the second (**367 blocks**), and the answer names the
   endpoint in the register's own words either way.
6. **Stereo wording.** `identity_resolve.form_note`: where one record's InChIKey carries the
   undefined-stereo block and the other's does not, the note reads "X and Y have the same
   connectivity; Y is recorded without stereochemistry" and names no stereochemical relation. Where
   both records carry stereochemistry and every recorded centre agrees — mecillinam and
   amdinocillin, whose keys differ in the rest of the layer — the note says that, instead of
   "diastereomer", which asserts a difference the structures do not have. Five notes changed;
   `canonical-v5.ndjson` differs from the file it replaces in those five `relations` entries and
   in nothing else.
7. **Status rows keep their labels.** `groupRevealedRows` splits a run longer than six into six
   rows and a counted remainder, and the remainder's heading is a count, not a label. The renderer
   and `EvidenceDisclosure` now print a row's own label unless the group's heading *is* that label,
   so the phase and status lists under "4 more recorded rows" read "active not recruiting 6" where
   they read "6", and a run that really shares one label still writes it once above the run.
8. **Whitespace between every label and value pair.** An audit of every component under
   `components/dossier/corpus`, `components/hubs` and `lib/document` found four places where an
   inline element met the text or the element beside it with no text node: the interpretation mark
   and the sentence it marks ("INTERPRETATIONno human trial recorded"), the register summary's
   "Upstream registers" row, the hub synthesis's subject label, and the organism ladder's rung name
   and evidence kind. All four carry a text node now, and the audit's regular expression gained the
   second shape (an inline element meeting a letter or a digit) so a regression fails the check.
9. **The self-audit and the tests.** `scripts/revamp/self_audit.py` keeps its eleven §13/§14 rules
   and gains four: every supervision clause carries its own source; the ageing question fires only
   on an ageing endpoint; a stereochemistry note names no relation the records do not have; every
   row in a counted remainder keeps its label. Its supervision rule now rejects the retired frame
   and the generic labels as well as a prescription class. `tests/test_render_safety.py` gains five
   §15 cases over the whole render (the clause sources, the mechanism row, the register status line
   in a question block, the ageing question, the bare-count row) and a structural one that reads
   the two records' InChIKeys out of `canonical-v6.ndjson` against every "diastereomer" and
   "enantiomer" note in `relations-v6.parquet`; `tests/unit/corpus-render-safety.test.ts` and
   `tests/unit/corpus-suppression-block.test.ts` gain the component and builder twins.

**The render.** `data/revamp/render-v10/{text,text-with-furniture,provenance}`, **28,657 pages**;
furniture-free **10,306,617 words**, with furniture 14,172,190; every sentence carries a trace.
`render-v9` deleted. **Questions 53,440 → 51,719** across three retirements (`regulatory-only`,
`jurisdiction`, and the seed-9 blocks that now ask the neutral question keep their block but change
their wording) and the CLINICAL questions the 556 remodelled pages no longer ask.

**Render and DOM agree.** `dom_parity.py`, 200 pages: **0 lines the page lacks, 0 lines the render
lacks, 0 out of order**. Two divergences the first parity run found were fixed rather than
recorded, and both were the same cause: the render withheld a controlled record's dose-bearing
lines at the moment of writing them, where the page withholds them before it groups the rows. So
the render wrote a question heading with nothing under it (Buprenorphine, whose one label sentence
names a dose) and grouped rows the page had already removed, which moved the six-row split
(Sirolimus, Somatropin). The filter now runs in the same place on both sides, and the withheld-line
count is kept where the filter is.

**The self-audit.** `scripts/revamp/self_audit.py`, `data/revamp/self-audit-round5.json`: 30 pages
(10 per tier, seed 20260911) and 10 hubs rendered on a disposable-database build, **15 mechanical
rules**, **30/30 pages and 10/10 hubs**, **3,378 rule applications, 0 failures**.

**Tests.** `.venv-corpus/bin/python -m pytest tests/test_render_safety.py tests/test_hub_dedupe.py`:
**47 passed**. `npm run test:unit`: **180 files passed**. `npm run test:integration` on a disposable
database: **26 files passed**.

**The database.** A disposable database with `drugs` and `inventory_resolutions` restored from
`rnawiki-pre-corpus-20k.pgcustom`, migrations 0001–**0033** (0033 adds
`corpus_pages.suppression_evidence`), the three tiers loaded at `thresholds-v9.json` with
`presence-applicable-v10.ndjson`, and the hubs after them: Tier 1 **1,697**, Tier 3 **23,173**,
Tier 2 **3,787**, **710 hubs**, 12,524 members, 258 aliases. Server stopped and database dropped at
the end.

**`npm run gate`.** Every stage green except one, and that one is not this round's: `check:copy`
stops on `docs/worklogs/revamp-2026-09.md`, at the measure-v9 entry's sentence "…after the workflow
harness killed it twice on multi-minute commands". The scanner's `harness/unlock/empower/elevate`
pattern reads "harness" as promotional copy. The line is committed (0f09a9f) and untouched by this
round — the worklog is append-only and this stage does not edit it — so the hit is recorded here
for the lead rather than removed. Run after `rm -rf .next/cache`, in the gate's own order:
typecheck, lint, `check:medicine-content`, `audit:denial-corpus`, `agents:check`,
`agents:import:check`, `check:agent-datasets`, `check:four-audience-coverage`,
`check:source-consensus-snapshot`, `check:dataset-export`, `check:seo` (24 files), `prettier
--check .`, `drizzle-kit check`, `test:unit` (**180 files**), `test:integration` on a disposable
database (**26 files**), `next build`, and Playwright `test:e2e` (**30 passed**).

**Outputs.** `data/revamp/render-v10/{text,text-with-furniture,provenance,dom-parity.json}`,
`data/revamp/self-audit-round5.json`, `data/revamp/tiers/model-assignment-v2.ndjson` and its
`summary.json`, `data/revamp/presence-applicable-v10.ndjson`,
`data/revamp/field-census-applicable-v10.csv`, `data/revamp/fields-v2/` (28,832 pages, 556
remodelled), `data/revamp/suppression/assignments-v2.ndjson` (with the ATC group names),
`data/sources/openfda-label/{mapped.parquet,coverage.json}` and
`.../2026-09-05/parsed/map-stats.json`, `data/revamp/identity/{canonical-v5,canonical-v6}.ndjson`
and `relations-v{5,6}.parquet`, `db/migrations/0033_corpus_suppression_evidence.sql`.
