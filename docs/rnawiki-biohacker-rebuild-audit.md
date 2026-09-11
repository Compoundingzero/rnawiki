# RNAWiki biohacker rebuild — audit, decisions and status

**Date:** 2026-09-10 → 11. **Branch:** `rebuild/biohacker-dossier` (worktree
`RNAwiki-biohacker-rebuild`, from `revamp/2026-09` @ 55d07db). **Production:** `main` @ 524aeb6
(Railway deploy 2026-09-05). **Method:** six independent specialist reviews (product design,
clinical evidence architecture, biomedical data quality, graph machine learning, full-stack
engineering, medical-safety editing), each inspecting the live site, the code and the local data
before any change; findings synthesised here after the reviews. Every finding carries a severity
and the evidence it was verified against. Companion documents:
`dossier-information-architecture.md`, `plain-language-content-contract.md`,
`evidence-and-outcome-taxonomy.md`, `entity-resolution-and-trial-role-spec.md`,
`knowledge-graph-schema.md`, `gnn-model-card.md`, `data-card.md`,
`privacy-and-medical-safety-boundaries.md`, `worklogs/biohacker-rebuild-2026-09.md`.

## 1. Current end-to-end data flow (as found)

```
ClinicalTrials.gov snapshot (601,158 studies, 2026-09-01) ─┐
openFDA/DailyMed labels, Open Targets ADR, ChEMBL, PubChem, ├─ Python + TS pipeline (scripts/corpus-20k, scripts/revamp)
GSRS, Inxight, DrugCentral, Europe PMC, registers (SG/US/AU/JP/CA/EU/UK) ┘   identity → fields → derived seeds → questions → blocks
      │
      ▼  data/revamp/{fields-v2, derived-v2, questions-v2, page-blocks}, data/corpus-20k/registry
scripts/corpus-20k/load/materialise.ts ──▶ corpus_pages + page_{synonyms,fields,seeds,questions,relations,sources,
                                              registry_studies, registry_aggregate, registration, interactions, patent, controlled, sections, display_names}
      │
      ▼
lib/corpus/dossier-page.ts loadCorpusDossier() ──▶ buildBlockBody() (scripts/corpus-20k/render/page-text.ts, shared with the measured render)
      │
      ▼
components/dossier/corpus/* ──▶ lib/corpus/document.tsx ──▶ renderToStaticMarkup ──▶ /d/<slug> (plain HTML, one island script)
Records not in corpus_pages ──▶ app/legacy-record/[slug] (React dossier v2, programme-verdict model)
```

The programme-verdict model (`development_programmes`, `claims`, `evidence_nodes`,
`programme_current_publications`) is the only reviewed-conclusion path and holds **0** published
rows for any of the four gold medicines; the corpus renderer never reads it.

## 2. Current user journey (as found, live 2026-09-10)

Home ("Understand any drug in 10 seconds.", search box, "Organism ladder" legend, browse by
substance class / longevity pathway / evidence reached / regulatory status / record type) → search
by name or synonym prefix → `/d/<slug>`: h1, development codes, alias disclosure ("Other recorded
names"), "Evidence recorded: healthspan", "Highest organism tested: Human", then question blocks
Q1…Qn ("What did X's largest trial (887132 people) and its longest (25 years) measure?", "From
mouse to human: where has X shown lifespan?", "What do 2266 spontaneous reports say…"), then "The
exact record", relations and sources. No section says what the substance is, why people use it,
what the best-supported result is, the main risk, or whether supervision is required.

## 3. Suspected problems: verified or refuted

| Suspected                                                                        | Verdict  | Evidence                                                                                                                                                                                |
| -------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage promises rapid understanding; dossiers begin with identities/aliases    | Verified | Live h1 "Understand any drug in 10 seconds."; live creatine page opens with aliases incl. "Tribulus Terrestris", then "Evidence recorded: healthspan"                                   |
| The ordinary sequence (what it is → why used → does it work → risks…) is missing | Verified | No block answers "what it is" or "why used"; `CorpusHeader.tsx` and `docs/specs/dossier-template.md` forbid a summary by design                                                         |
| Creatine incorrectly connected to Tribulus terrestris                            | Verified | Synonym `Tribulus Terrestris` (kind `common`, source `existing`) on `K1:MU72812GK0`; root cause `resolve.py:795-816` PubChem name lookup → CID 10125785 (creatine gluconate) → `M-SALT` |
| A Tribulus trial leaked into creatine's evidence                                 | Verified | NCT06260007 and four more Tribulus studies on creatine via `role:'stored'` carry-over (`match.ts:157-186, 263-270`)                                                                     |
| `b_halfLifeRecorded` reaches public copy                                         | Verified | Live creatine "Show the evidence · missing · b_halfLifeRecorded"; origin `compute.py:2169`, painted by `seedRows` in `page-text.ts`                                                     |
| "Largest/longest trial" counts mention-only or non-administered studies          | Verified | Semaglutide 887,132 = NCT07096063, OBSERVATIONAL comparative-effectiveness cohort; inclisiran "31 years" = NCT03705234 registered to end 2049-12                                        |
| Spontaneous-report counts lack denominator and causality framing                 | Verified | Live "139 spontaneous reports name Creatine, most often coma (24)"; no framing; and the "N" is the sum of the ten listed reaction-term counts (`derive.ts:1595-1607`)                   |
| Speculative mechanism gets outcome-level prominence                              | Verified | "What is recorded about Semaglutide and mTOR?" quotes "We posit that semaglutide may precipitate acute sarcopenia…" as a Q-block beside trial blocks                                    |
| Inventory count mistaken for completeness                                        | Verified | Home "8,987 medicine records" = legacy discovery filter; 28,832 identity pages; 294 indexable; 0 reviewed conclusions                                                                   |
| Pages expose hundreds of records without one reviewed conclusion                 | Verified | `programme_current_publications`, `claims`, `reviewed_claims` = 0 rows; every gold page's `reviewed-conclusion` section = NOT_APPLICABLE                                                |
| Search/browse organised by database category, not goals                          | Verified | Browse facets are ATC class letters, pathway, organism rung, register status, record type; search matches name/synonym prefixes only                                                    |
| "Preserve the dark navy/black identity"                                          | Refuted  | The live site is light: `#F5F5F7` ground, `#1D1D1F` ink, `#0071E3` accent; a dark ramp exists only under `data-theme="dark"` and nothing sets it                                        |

## 4. Findings (consolidated, severity, evidence, status)

### Data integrity

- **D1 (critical, fixed locally)** creatine ↔ Tribulus terrestris merge and stored-pair leak.
  Evidence above. Fix: `entity_corrections` ledger + `apply-identity-corrections.ts`; six ledger
  rows written; synonym and five studies removed from `K1:MU72812GK0` in `rnawiki_rebuild`.
  Pipeline rule changes still required (`entity-resolution-and-trial-role-spec.md` Part 1).
- **D2 (critical, fixed locally for five pages)** trial "role" is a match kind. `page_registry_studies.role ∈ {intervention, otherName, stored}` says how a name matched, not what the substance was. Fix: `trial-role-classifier/v1`, `page_trial_roles`, role-aware aggregate; semaglutide: 550 matched → 218 tested, 256 role-unclear, 76 observational; 255 planned windows ignored.
- **D3 (high, systemic, not fixed)** 173 legacy rows keyed by PubChem name lookup, 26 multi-component; 127 M-SALT merges across name families with confirmed wrong parents (fixtures 5–7); `creatine-gluconate` (`K4`) inherits creatine's registry set; 15.4 % of registry matches came through other-names; 94 pages truncated at the 500 cap.
- **D4 (high, documented)** corpus provenance is label + date strings (`page_sources`, `page_fields`), not `source_snapshots` rows; the v3 page labels these "recorded source, not a stored snapshot"; `reviewed_claims` binds to snapshots.
- **D5 (medium, verified)** snapshot has no arm groups → comparator vs tested cannot be resolved in 1,573 of 2,511 gold-page matches; requires re-fetch with `ArmGroupType`, `ArmGroupInterventionName`.
- **D6 (medium, refuted for the assessment table)** "silent blanks": every section of all 9,852 assessments carries a state; but the corpus render path never reads assessments, and the corpus and legacy layers disagree (creatine 134 vs 129 registrations). Fix: `dossier_field_states` on the v3 card.
- **D7 (medium)** outliers in the tracked aggregates: 286 pages with enrolment.max > 100,000 (top 26,000,000 on `K1:38RL9AE51Q`); 2,627 with min = 0; 2,290 with a planned "longest".

### Evidence scope and presentation

- **E1 (critical, generator patched; extractor not)** registry primary-outcome _words_ become "lifespan"/"healthspan" evidence (`extract-longevity.py:219-260`); metformin's human "lifespan" rung rests on a terminated trial. The v3 taxonomy maps a registered endpoint to `registered_trial_no_result` / `unknown_outcome`; the Python ladder extractor still needs the same rule.
- **E2 (critical, fixed)** FAERS "N reports" was a sum of reaction-term counts; the generator now says "reaction mentions" and paints the five framing sentences above any count.
- **E3 (high, fixed in v3; v2 page still shows dose lists)** "Human studies used Semaglutide 0.5 mg — over how long?" prints registered doses on prescription medicines; v3 keeps dose text only in the deep layer as recorded.
- **E4 (high, fixed in v3)** "Could one person measure…" (n-of-1) rendered for inclisiran, a prescription-only injectable, because suppression class S11 excludes prescription status; v3 refuses the plan for any supervised medicine.
- **E5 (high, fixed in v3)** relative vs absolute; exploratory vs confirmatory: the epigenetic-clock block answers "by how much?" with a post hoc n=45 analysis. `reviewed_claims` now carries `effect_scale`, `baseline_value`, `comparator_value`, `participants`, `prespecified`, `trial_identifier`, `trial_role`.
- **E6 (high, fixed in v3)** mechanism beside benefit: v3 renders mechanism only as reviewed stages with origin labels and the "What this does not prove" card; the co-mention blocks stay in the deep layer.
- **E7 (medium)** "126 of 126 completed trials posted no result" tautology vs stored "453 of 1672"; not fixed in the generator this session.

### Product and copy

- **P1 (critical, fixed in v3)** café-worker test fails on every live dossier; v3 Decision Card answers the five questions or states the explicit absence.
- **P2 (high, fixed in v3)** supervision block lists approvals, never the reason; v3 states the supervision level with its basis and the boxed warning.
- **P3 (high, fixed in v3)** header badge "Evidence recorded: lifespan" beside "Highest organism tested: Human" implies a human lifespan claim; v3 has no such badge.
- **P4 (medium, fixed in v3)** no inline definitions in the corpus renderer; v3 evidence labels open their plain definition inline.
- **P5 (medium, measured)** sentences over 20 words: 9–17 % of live prose, almost all verbatim quotations chosen as leads; v3 quotes are never a block's first sentence.
- **P6 (medium, fixed in v3)** the small-screen "Contents" `<details>` sticks behind the 56 px header; v3's navigator sits at `top: 3.5rem`.
- **P7 (medium, fixed in v3)** contrast: ink-3 text at 3.62:1 and empty ladder rungs at 2.06:1; axe reports `color-contrast` ×4 on every live page; v3 pages report 0 axe violations (WCAG 2.2 AA tags).

### Engineering

- **G1 (critical, gated)** the graph is identity-contaminated; no model may train until `graph_versions.identity_gate_passed` (`gnn-model-card.md`).
- **G2 (high)** `page_relations` loader drops the `rule` and `evidence` columns the parquet carries; three disjoint node-id spaces (`drugs.id`, `corpus_pages.key`, `development_programmes.id`).
- **G3 (medium)** 15 parallel queries per dossier on a pool of 10; no `Cache-Control`/`ETag` on documents.
- **G4 (medium)** `tests/unit/hubs-render.test.ts` needs a prior build (reads `.next/app-build-manifest.json`); `gate` runs unit tests before `build`.
- **G5 (high, deploy)** `railway.toml` runs `db:migrate` before traffic; 0034 is additive and its rollback is in the worklog; do not merge to `main` before the deploy rehearsal in CLAUDE.md.
- **G6 (info)** analytics send page views only after consent with query strings stripped; the path still names the substance.

## 5. What changed (files)

**Schema and migration:** `db/schema.ts` (dossier v3 section), `db/migrations/0034_dossier_v3_claims_corrections_graph.sql` (+ journal and snapshot), triggers `entity_corrections_immutable`, `reviewed_claims_frozen`.

**Libraries:** `lib/dossier-v3/{taxonomy,copy-contract,claims,trial-roles,stored-keys,goals,fields,view-model,load,document}.ts(x)`, `lib/dossier-v3/dossier-v3.css`; `lib/corpus/dossier-page.ts` (role-aware aggregate merged into the registry bundle).

**Generator (Phase 0):** `scripts/corpus-20k/render/page-text.ts` (seed keys humanised; FAERS framing and mentions; role-aware / qualified registered-study block; furniture outside the two-paragraph cap).

**Components:** `components/dossier/v3/{DossierV3Page,Sections,EvidenceLabel}.tsx`; `components/dossier/corpus/QuestionBlock.tsx` (heading level prop).

**Routes and config:** `app/d/[slug]/route.ts` (flag), `app/layout.tsx` (stylesheet), `eslint.config.js`, `playwright.config.ts` (flag env for the e2e server).

**Operator commands:** `scripts/dossier-v3/{backfill-trial-roles,apply-identity-corrections,capture,project-graph}.ts`; `data/dossier-v3/corrections/creatine-tribulus.json`.

**Goal-first entry (Phase 4 seed):** `components/HomeView.tsx` (the "What are you trying to understand or improve?" strip under the untouched search bar), `app/goals/[goal]/route.ts`, `lib/dossier-v3/{goal-pages,goal-document}.ts(x)` — a page is listed because registered studies name a condition in the goal area, and every row says so.

**Data-quality dashboard (private, steward-only):** `app/review-queue/dossier-v3/page.tsx`, `lib/queries/dossier-v3-quality.ts`.

**Graph (Phase 5 seed):** `scripts/dossier-v3/project-graph.ts` projected version `7987e517…` locally: 5,151 nodes, 6,334 edges (identity 213, evidence 2,511, safety 3,610; 2,360 predicted with their rule ids), identity gate closed; 830 relations skipped because their target is outside the loaded tier and 8,685 interaction lines skipped because the counterpart page is not loaded.

**Tests:** `tests/unit/dossier-v3-{copy-contract,trial-roles,phase0-generator,view-model}.test.ts`; `tests/unit/corpus-suppression-block.test.ts` (cap counts developing paragraphs); `tests/integration/dossier-v3-ledger-and-roles.test.ts`; `tests/e2e/dossier-v3-journey.spec.ts` + `tests/e2e/fixtures/dossier-v3.ts`.

**Docs:** the nine listed at the top, plus the worklog.

## 6. Before / after benchmark (local build, same machine, `scripts/dossier-v3/capture.ts`)

Screenshots: `data/dossier-v3/benchmark/{before,after}/<slug>-{desktop,mobile}.png`; per-page JSON
beside them (`summary.json` in each folder). "Before" is the corpus document on the unflagged
build; "after" is the v3 document. Reader layers = everything outside the labelled "Deep evidence"
disclosure; whole page includes it.

| Page                 | axe (WCAG 2.2 AA) before → after | internal keys in reader layers before → after | internal keys, whole page after             | overflow at 320 px | HTML bytes before → after | TTFB after |
| -------------------- | -------------------------------- | --------------------------------------------- | ------------------------------------------- | ------------------ | ------------------------- | ---------- |
| semaglutide          | 1 (color-contrast ×4) → 0        | 1 (`compound_record`) → 0                     | 4 (source labels and ids in the deep layer) | no → no            | 89,757 → 145,893          | 698 ms     |
| metformin            | 1 → 0                            | 1 → 0                                         | 2                                           | no → no            | 111,082 → 173,701         | 567 ms     |
| inclisiran           | 1 → 0                            | 0 → 0                                         | 2 (`halfLife` row label, a source id)       | no → no            | 57,276 → 85,641           | 536 ms     |
| creatine-monohydrate | 1 → 0                            | 2 (`agEing`, `compound_record`) → 0           | 5                                           | no → no            | 65,309 → 105,540          | 537 ms     |

Sentences over 30 words in the reader layers after: 40 of 207 (semaglutide), 40 of 236
(metformin), 15 of 152 (inclisiran), 21 of 215 (creatine); nearly all are quoted label sentences
inside disclosures. Undefined acronyms remaining in the reader layers are register and class codes
(ATC codes, ARTG, NCATS), `LDL`/`ASCVD` inside the recorded label indication text, and `GLP`
inside the legacy identity-class basis; each page's list is in its JSON. The whole-page leftovers
are source-supplied strings in the deep layer (`compound_record` from a ChEMBL source label,
canonical `K1:` ids in the source list, one `halfLife` row label in the kinetics block). HTML grew
because one document now carries the Decision Card, eleven sections and the deep layer; the page is
still one static document with one island script and no React stream. The text-node/HTML ratio
rose from about 0.14 to about 0.47. Core Web Vitals were not measured (no Lighthouse run).

## 7. Test and build results (final run, 2026-09-11, local)

| Check                                                | Result                                                   |
| ---------------------------------------------------- | -------------------------------------------------------- |
| `npm run typecheck`                                  | exit 0                                                   |
| `npm run lint`                                       | 0 errors, 1 pre-existing warning                         |
| `npm run format`                                     | all files pass                                           |
| `npm run check:copy`                                 | 0 hits across 36 patterns (471 public/docs files)        |
| `npx drizzle-kit check`                              | consistent; 0034 replayed on `rnawiki_rebuild` (35 rows) |
| `npx vitest run tests/unit`                          | 184 files: 2,716 passed, 9 skipped                       |
| `tests/integration/dossier-v3-ledger-and-roles`      | 1 passed on a disposable database                        |
| `npm run test:e2e` (full suite, disposable database) | 36 passed (includes the 6 dossier v3 journey tests)      |
| `npm run build`                                      | exit 0 (five times this session)                         |

`npm run gate` as a single chain was not run end to end in one invocation; every stage of it was
run individually above with the results shown.

## 8. Remaining risks

**Data quality:** D3 corpus-wide name-lookup and salt-merge errors; D5 arm groups; creatine-gluconate
inheritance; only five pages have trial roles; tiers 2–3 not loaded locally; the Python ladder
extractor still writes "lifespan" from endpoint words (E1); E7 tautology.

**Medical safety:** every gold Decision Card renders "No reviewed conclusion yet" — honest, but a
reader gets no benefit statement until claims are authored and reviewed; the v2 corpus page
(every non-flagged slug) still prints dose lists and n-of-1 blocks on prescription medicines (E3,
E4) and the "shown lifespan" ladder wording (E1); the legacy `drugs.indication` text is shown as
"recorded, not yet reviewed" and is unsourced legacy prose; spontaneous-report framing is fixed in
the generator but production still runs the old build.

**GNN:** nothing trained; the identity gate is closed by design; no evaluation set frozen yet.

## 9. Recommended migration sequence

1. Merge Phase 0 generator patches and migration 0034 to `revamp/2026-09` → rehearse
   `npm run gate` and the deploy checklist → deploy with `DOSSIER_V3_SLUGS` unset.
2. Apply the creatine correction in production with the same command; run the trial-role backfill
   corpus-wide; re-run the corpus render so the measured text and the page agree (§11 of the
   revamp spec).
3. Fix the identity stage (Part 1 of the entity spec) and re-run identity for the 173 name-lookup
   rows; record every change in the ledger.
4. Author and review claims for the four gold medicines from stored label snapshots (recorded use,
   boxed warning, mechanism stages from label sentences, the two stored posted results as
   biomarker claims); turn the flag on for those four.
5. Phase 3 backfill: field states for every loaded page; index-quality gate writes `indexable`.
6. Phase 4: goal-first entry (`goalsFromConditions` over registry conditions is the seed),
   natural-language retrieval on the existing lexical engine, same-goal comparison from hubs, the
   local-only stack checker in the island.
7. Phase 5: projector, evaluation set, rule baselines; open the identity gate only after the
   rendered duplicate check and the corrected identity pass.

## 10. Commands

```bash
# local database (private copy) and migration
createdb -T rnawiki_corpus_completion rnawiki_rebuild && npm run db:migrate
# corpus inputs (symlinks to the sibling worktree's untracked data) and the tier-1 load
SIB="../RNAwiki-corpus-completion/data"
for p in revamp/fields-v2 revamp/derived-v2 revamp/questions-v2 revamp/page-blocks corpus-20k/registry corpus-20k/raw; do [ -e "data/$p" ] || ln -s "$SIB/$p" "data/$p"; done
mkdir -p data/revamp/hubs && ln -s "$SIB/revamp/hubs/load" data/revamp/hubs/load
npx tsx scripts/corpus-20k/load/materialise.ts --tier 1 --revamp --thresholds data/revamp/thresholds-v14.json --presence data/revamp/presence-applicable-v14.ndjson --load-dir /tmp/load-markers --no-checkpoint
DATABASE_URL=$DATABASE_URL npx tsx scripts/revamp/hubs_load.ts --in data/revamp/hubs/load --load-dir /tmp/hub-markers
# Phase 0 data fixes
npx tsx scripts/dossier-v3/apply-identity-corrections.ts data/dossier-v3/corrections/creatine-tribulus.json --apply
npx tsx scripts/dossier-v3/backfill-trial-roles.ts --slugs semaglutide,metformin,inclisiran,creatine-monohydrate
# the flagged server and the benchmark
PORT=3100 DOSSIER_V3_SLUGS=semaglutide,metformin,inclisiran,creatine-monohydrate npm run start
npx tsx scripts/dossier-v3/capture.ts --base http://localhost:3100 --label after --slugs semaglutide,metformin,inclisiran,creatine-monohydrate --out data/dossier-v3/benchmark
# continue the full-corpus backfill
npx tsx scripts/dossier-v3/backfill-trial-roles.ts --all --batch-size 500
```
