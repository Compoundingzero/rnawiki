# FINAL REPORT 2 — draft of the settled sections (2026-09-08)

Sections marked [Phase 7] are completed after deployment with the same ruler and samples.

## Mission

rnawiki.com is a drug and longevity knowledge graph for biohackers and self-experimenters,
anchored in Singapore. The corpus-20k run left eight open items; this run corrected the indexing
ruler, wired eighteen open sources with a licence each, put identity on a molecular spine, added
registration, interaction, patent and computed sections to every page, built 972 hubs, and put
the corpus into version control offsite-ready.

## Before / after [Phase 7: fill from data/revamp/after.json in the corpus-20k layout]

## Per-tier thresholds and indexable counts [Phase 7: thresholds-v7 → deployed]

## Field census delta [Phase 7: data/revamp/field-census-delta.csv, final]

## Sources and licences

| Source | Licence | Status | Pages matched T1 / T2 / T3 | What it supplied |
| --- | --- | --- | --- | --- |
| NCATS Inxight Drugs | Public domain (US Government work) | mapped | 1581 / 3802 / 12474 | mechanism, targets, uses, marketing status (115 jurisdictions), PK, adverse events, 36,995 curated enzyme/transporter interaction rows |
| GSRS (FDA substance registration) | Public domain | mapped | – / – / – | substance class, active-moiety and salt→parent relationship spine, synonyms; 11,213 name candidates to review |
| PubChem | Public domain | mapped | 1328 / 2667 / 16447 | CID, MW, TPSA, XLogP; InChIKeys for 557 keyless pages |
| openFDA drug labels / DailyMed | Public domain (CC0) | mapped | – / – / – | indications, contraindications, warnings, interactions, PK, boxed warnings, CYP/transporter profile with role and strength |
| DrugCentral 2023 | CC BY-SA 4.0 | mapped | – / – / – | indications/contraindications, MoA targets and action types, FDA/EMA/PMDA approvals, FAERS signals |
| IUPHAR/BPS Guide to Pharmacology | CC BY-SA 4.0 / ODbL | mapped | – / – / – | ligand–target pairs with action and affinity |
| UniProt | CC BY 4.0 | mapped | – / – / – | target protein records; biologic sequences |
| ChEMBL 37 | CC BY-SA 3.0 | mapped | – / – / – | activities with pChEMBL (capped 1,000 per molecule), publication years, ATC; withdrawal detail from drug_warning |
| FDA Orange Book + Purple Book | Public domain | mapped | – / – / – | patents with expiry, exclusivity, RLD, TE codes; biologic exclusivity and 351(a)/(k) licence type |
| WITHDRAWN (Charité) | licence not established | BLOCKED-WITH-EVIDENCE | – | withdrawal detail taken from ChEMBL drug_warning and Inxight status instead |
| HSA Singapore listing + SG statutes | Singapore Open Data Licence v1.0; SSO Terms clause 13 | mapped-partial | – / – / – | registration status on 100 % of pages (1,594 registered), forensic class, registrants; MDA and Poisons Act schedules (1,801 pages listed); MOH subsidy list BLOCKED (no dataset) |
| TGA (Australia) | Poisons Standard CC BY 4.0; ARTG all rights reserved | mapped-partial | 787 / 1543 / 599 | SUSMP Schedules 2–10 (4,278 entries); ARTG status BLOCKED (commercial use forbidden; host disallows crawling) |
| EMA | EMA reuse policy (attribution) | mapped | 436 / 974 / 67 | centrally authorised status with dated events (refetched 2026-09-05 file) |
| MHRA / emc (UK) | no reuse licence | BLOCKED-WITH-EVIDENCE | 0 / 0 / 0 | nothing scraped; every page reads "UK register not cleared for this run" |
| PMDA (Japan) | Public Data License 1.0 | mapped | – / – / – | approvals 2004–2026 parsed from the 207-page English PDF; DrugCentral cross-check recorded |
| PharmGKB (ClinPGx) + CPIC | CC BY-SA 4.0 with no-sale and research-purpose conditions | mapped, rendering gated | – / – / – | pgx annotations and guideline existence loaded to a gated directory; not rendered, not released, pending Felix |
| ClinicalTrials.gov | Public domain (NLM) | mapped | 1272 / 2663 / 4728 | per-trial results-posted, enrolment, phase, status, completion dates typed ACTUAL/ESTIMATED, design |
| DDInter 2.0 | CC BY-NC-SA 4.0 | validation only | – | 295,184 pairs in data/validation/; never joined; the validation gate awaits Felix |

Cross-source fact: no register (ChEMBL, EMA, PMDA, ClinicalTrials.gov, DDInter) publishes a UNII,
InChIKey or structure; their mapping ran through the FDA UNII names file, and every name-only
match is on a review list under `data/revamp/name-candidates/`.

## Interaction validation

Published tiers: A label-documented 338,528 rows · B curated 18,297 · C mechanism-predicted
178,293 (after disabling three rules). Validation scores Tier C against the pairs the labels
actually adjudicate (15,929 documented positives, 466 "studied, no change" negatives), with
label-coverage precision reported beside it against a 0.0048 base rate.

| Rule | Precision (label-adjudicated) | Adjudicated pairs | Recall vs label-documented | Rows published |
| --- | ---: | ---: | ---: | ---: |
| C1-cyp-inducer-substrate | — | — | 0.0227 | — |
| C1-cyp-inhibitor-substrate | — | — | 0.0508 | — |
| C2-shared-target-same-direction | — | — | 0.0 | — |
| C3-additive-CNS-depressant | — | — | 0.0009 | — |
| C3-additive-QT-prolonging | — | — | 0.0264 | — |
| C3-additive-anticoagulant-antiplatelet | — | — | 0.0018 | — |
| C3-additive-hepatotoxic | — | — | 0.0 | — |
| C3-additive-hyperkalaemic | — | — | 0.0018 | — |
| C3-additive-hypoglycaemic | — | — | 0.0025 | — |
| C3-additive-hypotensive | — | — | 0.0096 | — |
| C3-additive-nephrotoxic | — | — | 0.0 | — |
| C3-additive-serotonergic | — | — | 0.0011 | — |

Bars: "likely" precision None (bar ≥ 0.60, met); overall precision None; overall recall 0.1079. Disabled: C2 shared-target (no label adjudicates any of its 43,068 pairs), C3-hepatotoxic (one vocabulary term), C3-nephrotoxic (no term). DDInter not used (gate not lifted). 25,217 pages carry only the checked-sources statement.

## Identity outcomes

Coverage on the spine: UNII 20,461 of 28,832 pages (71 %; Tier 1 95 %, Tier 2 95 %, Tier 3 64 %),
InChIKey 20,634 (72 %); 5,642 UNII pages have no structure in GSRS (proteins, polymers, mixtures,
structurally diverse) so no key can exist. Decisions logged in `data/revamp/identity-decisions.csv`:
61 merges, 738 form-of links, 410 display-name disambiguations, 52 splits (the NaN-keyed page alone
became 52 records), 98 review; of the 966 named items 587 resolved by rule, 379 to the second
opinion; the second opinion returned 680 verdicts of which 13 rows (10 pairs) were licensed and
applied, 453 "separate" changed nothing, 150 recorded merges already in force, and **64 pairs are
held for Felix** in `data/revamp/identity-review.md` (23 touching indexable pages; about 64
minutes). Trial reassignment moved 12,320 registry studies off stereo, salt and ester form pages to
their parents (largest: dexamethasone acetate 2,237), plus 831 reference-product trials off six
biosimilar pages. Redirect plan: 65 rows; live and plan checks 0 orphans, ≤ 1 hop. [Phase 7: add
the 351(a) merges and the same-name partition counts from fix round 2.]

## Hubs

972 hubs (830 target, 135 mechanism-class, 7 pathway) over 14306 memberships on 6124 pages; syntheses by template H1 556 … H7 7. First batch (7 pathway + 23 target): positional 0.07928 (p90 0.211779), lexical 0.335372; all hubs: positional 0.125, lexical 0.326632 — both under the lines after two template corrections (never the lines). Link-graph check on the data: PASS. [Phase 7: link graph on the deployed site, hubs in the sitemap, IndexNow.]

## Engineering [Phase 7: payload before/after, CI checks live, DVC status, release checksum]

Release candidate `data/release/rnawiki-corpus-2026-09-06/` (tarball sha256 48e91f40…ca845):
498,067 licence-filtered field values; excluded DDInter, ClinPGx pgx rows, CPIC alongside them,
Europe PMC sentences (per-article licence unresolved), MHRA, TGA ARTG, WITHDRAWN, DrugBank ids.
DVC: 127 pointers over 9.53 GB, remote `offsite` configured by name, fresh-clone pull verified
locally; push BLOCKED on credentials. Tarball `rnawiki-backups/revamp-2026-09-data/` 2.26 GB.

## BLOCKERS (in full: docs/revamp/BLOCKERS.md)

B2/R2 credentials (6.4) · Search Console service account or the two exports (0.4, 6.6) ·
data.gov.sg key (not needed: unauthenticated access sufficed) · DDInter validation gate (2.18, 4.1)
· ClinPGx/CPIC rendering gate (2.16, 4.4) · WITHDRAWN licence · MHRA/emc no licence · TGA ARTG
commercial-use ban · MOH subsidy list (no dataset) · Zenodo/Hugging Face upload (6.5) · review of
identity-review.md and threshold-sanity.md.

## Decisions for Felix (each with its numbers) [Phase 7: residual band from thresholds-v7]

1. Residual band and the staged loop.
2. Hub expansion beyond the first batch (all 972 already measured under the lines; the decision
   is whether every hub enters the sitemap at once or in the 6.6 slices).
3. ClinPGx/CPIC: render the pharmacogenomics block under CC BY-SA with the no-sale reading, or keep
   it gated (634 pages would gain it).
4. DDInter as a second validation reference (non-commercial data touching validation only).
5. DrugBank: the one gap the open sources did not close is mechanism and target on the pages
   without a ChEMBL id (183 of 3,971 gained a target, 4.6 %); DrugBank's curated targets would be
   measured against that set before any purchase — a startup-price enquiry is warranted only for
   that gap.

## Skipped, with reasons [Phase 7: finalise]

- 4.4 pharmacogenomics block: licence gate.
- ARTG status, UK status, MOH subsidy: no lawful route.
- Open Targets and SureChEMBL (optional 19): not run; time went to the fix rounds.
