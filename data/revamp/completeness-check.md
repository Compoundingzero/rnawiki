# Completeness check against docs/specs/revamp-2026-09.md (2026-09-10)

| Step | What | Done | Artefact / status |
| --- | --- | --- | --- |
| 0.1 | orient | yes | data/revamp/orient.md |
| 0.2 | field census before | yes | data/revamp/field-census-before.csv |
| 0.3 | baseline | yes | data/revamp/baseline.json |
| 0.4 | Search Console | yes | BLOCKED-WITH-EVIDENCE; export ingested (66 impressions/42 days) |
| 0.5 | scaffolding | yes | state.json, worklog, BLOCKERS, LICENSES |
| 1.1 | denominator | yes | field-applicability.json pending_source |
| 1.2 | applicability matrix | yes | docs/specs/field-applicability.md |
| 1.3 | threshold derivation | yes | thresholds.json … thresholds-v9.json (v10 after fix 5) |
| 1.4 | Tier 2 anomaly | yes | data/revamp/tier2-anomaly.csv |
| 1.5 | sanity reading | yes | threshold-sanity.md + lead's three sentences per tier; flagged for Felix |
| 1.6 | gates re-evaluated | yes | data/revamp/gates-reevaluated.json |
| 2.1–2.18 | sources | yes | 18 dispositioned (14 mapped, 2 partial, 2 blocked, DDInter validation-only) |
| 2.census | after-census + delta + thresholds re-run | yes | field-census-after.csv, -delta.csv, thresholds-after.json |
| 3.1 | spine coverage | yes | identity/coverage.json |
| 3.2–3.3 | auto-resolution | yes | identity-decisions.csv, canonical-v2…v6 |
| 3.4 | second opinion + adjudication | yes | identity-review.md (64 held, 64 min), apply-list applied |
| 3.5 | redirect check | yes | redirect-check*.json live+plan PASS |
| 3.6 | rendered duplicate check | yes | rendered-dups-v9: 0 indexable, 0 hub pairs; CI post-deploy |
| 3.7 | 39 suppressed pages | yes | suppressed-no-question-verify.json 39/39 |
| 4.1 | interaction engine + validation + rendering rules | yes | interactions.parquet, interaction-validation.json, test_render_safety.py |
| 4.2 | registration block 100 % | yes | blocks/registration.parquet 28,832 pages |
| 4.3 | patent block | yes | blocks/patent.parquet |
| 4.4 | pharmacogenomics | no | BLOCKED-WITH-EVIDENCE: ClinPGx licence conditions (Felix) |
| 4.5 | Tier 3 computed sections | yes | tier3-sections.parquet |
| 4.6 | derived sections re-run | yes | derived-v2, fire-counts-after.json (seed 17 corrected, seed 8 discarded < floor) |
| 4.7 | slop gate | no | draws 1–7 read; fix round 5 running; draws 8 and 9 pending |
| 5.1–5.2 | hubs + tables + syntheses | yes | data/revamp/hubs/*: 710 hubs + 258 aliases |
| 5.3 | indexing + link graph + nav | yes | hubs.xml, Hubs row, footer link, link-graph-v9 PASS |
| 5.4 | first batch + all measured | yes | measure-first-batch.json 0.079/0.335; measure-all-v2 0.125/0.321 |
| 6.1 | payload | yes | payload-audit-v9: 0.154 (floor 0.15); RSC 0.0 |
| 6.2 | Gate 2 regression | yes | measured every round (frozen bar 0.0, robots, Tier 3 absent); formal entry in Phase 7 |
| 6.3 | CI | yes | revamp-checks.yml |
| 6.4 | DVC | no | BLOCKED-WITH-EVIDENCE (credentials); pointers committed, local pull verified |
| 6.5 | release candidate | yes | data/release/…; upload BLOCKED (Felix) |
| 6.6 | staged promotion | yes | promote_band.py + tests; band definition to widen per report §Decisions 1 |
| 7.1 | after.json | no | Phase 7 |
| 7.2 | thresholds applied, sitemap | no | Phase 7 |
| 7.3 | deploy + verify + IndexNow | no | Phase 7 run-book in deployment-plan.md |
| 7.4 | FINAL REPORT 2 | no | draft in data/revamp/final/final-report-2-draft.md |
| 7.5 | PR merge | no | Phase 7 |
| 8 | weekly watch | yes | scripts/revamp/weekly.sh written; scheduling is Felix's (crontab line recorded in BLOCKERS) |

Open before Phase 7: 4.7 (fix round 5 → ruler v10 → draws 8 and 9 → lead reading → two clean draws), then 7.1–7.5. Everything marked no without a Phase 7 tag is BLOCKED-WITH-EVIDENCE on Felix's credentials or accounts and recorded in docs/revamp/BLOCKERS.md.
