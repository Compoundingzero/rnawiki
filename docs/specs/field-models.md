# The three field models (R4)

**Status:** fixed 2026-09-04 (Fable). Coverage is counted **within** a model, never across models.
Every field has three states: `present` (value with source and dates), `absent` (looked for in every
mapped source, not found), `not-applicable` (the field does not apply to this record's class, e.g.
"label kinetics" for a botanical with no label). Only `present` counts toward coverage; the
denominator per model is the number of applicable fields. Every present value carries
`{ value, source: { kind, id, url }, sourceDate, lastVerified, verbatim: bool }` (R9).

## Assignment

A record is assigned exactly one model by what it **is** (entity class + regulatory facts), not by
what data it has:

- **LONGEVITY** — the Tier 1 longevity/biohacker set: the 803 broad-slice records, plus any
  record with an NIA ITP entry, plus any record with a stored human study whose registry condition
  or outcome names ageing/longevity/lifespan/healthspan/frailty/senescence, plus any record whose
  pathway field resolves to mTOR/AMPK/sirtuin/senolytic/autophagy/NAD+/IGF-1 from a cited source.
- **CLINICAL** — approved or formerly approved medicines (any jurisdiction) and OTC monograph
  drugs that are not in the LONGEVITY set.
- **DEVELOPMENT** — everything else with a structure or a registry trial: investigational,
  experimental, pre-clinical, abandoned, code-name-only.

Supplement ingredients and botanicals that are not in the LONGEVITY set are assigned CLINICAL if
they hold a label or monograph, otherwise DEVELOPMENT (treated as "never dosed as a medicine"; the
DEVELOPMENT fields that do not apply are `not-applicable`).

## LONGEVITY (15 fields)

| #   | Field                             | Value shape                                                                                                                                                           | Rule                                                                  |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | Hallmark of aging                 | list of {hallmark (López-Otín 2023 vocabulary), citation}                                                                                                             | cited only; never inferred from pathway                               |
| 2   | Model-organism ladder             | per rung {organism ∈ yeast, C. elegans, Drosophila, mouse, rat, dog, NHP, human; evidenceKind ∈ lifespan, healthspan, biomarker, surrogate, mechanism-only; citation} | a rung exists only with a citation                                    |
| 3   | NIA ITP                           | {tested: bool, cohorts: [{dose ppm, ageAtStartMonths, sex, outcome verbatim, publication}]}                                                                           | ITP source only                                                       |
| 4   | Endpoint type per finding         | on every finding: lifespan / healthspan / biomarker / surrogate                                                                                                       | a biomarker never renders as lifespan                                 |
| 5   | Human evidence ceiling            | {longestDurationDays, largestN, anyAgingEndpoint: bool, trials: [ids]}                                                                                                | from registry + PubMed clinical-trial records                         |
| 6   | Epigenetic clocks                 | list of {clock ∈ Horvath, Hannum, GrimAge, PhenoAge, DunedinPACE, other-named; effect verbatim; citation}                                                             |                                                                       |
| 7   | Dose-response shape               | {shape ∈ monotonic, plateau, hormetic, U-shaped, unstated; verbatim; citation}                                                                                        | flag hormetic/U                                                       |
| 8   | Pathway                           | list of {pathway ∈ mTOR, AMPK, sirtuin, senolytic, autophagy, NAD+, IGF-1, other-named; statement verbatim; citation}                                                 |                                                                       |
| 9   | Kinetics                          | {halfLife, tmax, metabolism, bioavailability, each {value, unit, verbatim, source}}                                                                                   | label > ChEMBL/DrugCentral > literature                               |
| 10  | Interactions                      | {cyp: [...], transporters: [...], fasting, caloricRestriction, exercise: each {statement, citation}}                                                                  |                                                                       |
| 11  | Trial failures                    | list of {nct, status, whyStopped verbatim}                                                                                                                            | registry only                                                         |
| 12  | Biomarkers measured               | controlled vocabulary terms (built in Phase 2 from registry outcome measures)                                                                                         | verbatim mapping table kept                                           |
| 13  | Regulatory status by jurisdiction | per jurisdiction ∈ US, EU, UK, CA, AU, JP, SG: {status ∈ approved, withdrawn, supplement, unscheduled, controlled, unknown; source}                                   | register facts only                                                   |
| 14  | Ongoing trials                    | list of {nct, title, N, primaryEndpoint, completionDate}                                                                                                              | recruiting/active statuses                                            |
| 15  | FAERS signal                      | top reported reactions {term, count, period} labelled spontaneous reports                                                                                             | never incidence                                                       |
| 15b | doseStudied (added 2026-09-04)    | list of {organism, doseText verbatim, route, source} — human: registry arm/intervention dose text; mouse: ITP dose as written; never a suggestion                     | registry/ITP/label only; counts as a sub-field of 9, not a 16th field |

## CLINICAL (9 fields)

indication (label) · label kinetics (as field 9) · interactions (label + ChEMBL) · adverse events
(label sections) · FAERS signal (as field 15) · trial history (registry + PubMed counts by phase) ·
trial failures (as field 11) · regulatory status by jurisdiction (as field 13) · withdrawal status
{withdrawn: bool, jurisdictions, reason verbatim, date, source, approvalDate (ChEMBL first_approval year or the Drugs@FDA/EMA authorisation date, with source)}. The regulatory field carries the same approvalDate per jurisdiction where a register states it.

## The `withdrawn` flag — rule fixed 2026-09-05 (Phase 5a)

`withdrawn` is a claim about the substance, not a status line copied from one register. A register
that still records an active, approved or marketed entry contradicts a withdrawal, whatever another
register's line says. Amlodipine was the case that fixed the rule: the EMA register holds one
withdrawn central authorisation and no authorised one, while Drugs@FDA still lists prescription
applications, and the page was being marked withdrawn.

Set `withdrawn = true` only when one of these holds:

| Ground                      | Test                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Reason text                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| No remaining entry anywhere | **Every** cleared register that holds the moiety says it is gone — Drugs@FDA: every single-ingredient product's marketing status is `Discontinued`; Orange Book: every product `DISCONTINUED`; EMA: no `Authorised` entry and at least one `Withdrawn`/`Suspended`/`Revoked`; Health Canada DPD: no `MARKETED`, `APPROVED`, interim-order or restricted-access entry and at least one post-market `CANCELLED` — **and** no other register records an active, approved or marketed entry | `null` (the registers state a status, never a reason) |
| Stated safety withdrawal    | A register's own status text states one. Among the cleared registers only Health Canada does: `CANCELLED (SAFETY ISSUE)`                                                                                                                                                                                                                                                                                                                                                                | the register's own words, verbatim                    |
| ChEMBL                      | `withdrawn_flag` on the molecule, or a ChEMBL / Open Targets `drug_warning` of type `Withdrawn`                                                                                                                                                                                                                                                                                                                                                                                         | `warning_class` / `toxicity_class` where recorded     |
| Curated RNAWiki record      | The existing corpus's entity class `WITHDRAWN_MEDICINE` (29 legacy records)                                                                                                                                                                                                                                                                                                                                                                                                             | `null`                                                |

The last three are **statements** of a withdrawal and stand on their own. Only the first is an
inference from an absence, and only it is guarded by the other registers. Guarding the curated class
as well was tried and dropped eight records a register still lists as marketed although the medicine
is withdrawn (ranitidine, terfenadine, diethylstilbestrol, telbivudine, simeprevir, stanozolol,
nandrolone decanoate, aducanumab-avwa): a register's lag is not evidence that the withdrawal did not
happen.

Never a ground: a Drugs@FDA `None (Tentative Approval)` product or a Health Canada `CANCELLED PRE
MARKET` status (the product never reached the market, so it is neither a remaining entry nor a
withdrawal); one cancelled product licence while other entries stand; a combination product's
withdrawal, which is never carried onto an ingredient page. TGA, PMDA and the WHO consolidated
withdrawn list were never cleared and contribute nothing, and the FDA's own withdrawn-or-removed
page was unreachable, so a US safety withdrawal enters only through ChEMBL or Open Targets.

Measured on 28,943 pages (2026-09-05): withdrawn **438 → 668**; 310 pages gained the flag (mostly
moieties whose every Drugs@FDA application is discontinued), 88 lost it (75 on the EMA reading the
rule now guards, amlodipine among them). Tier 1 follows: 1,498 → 1,726. Identity pass 3 then merged
111 pages, leaving 28,832 pages, 663 withdrawn and Tier 1 1,719.

## DEVELOPMENT (8 fields)

molecular target (ChEMBL/Open Targets) · mechanism class (ChEMBL action type / MoA) · highest
phase reached (ChEMBL max_phase, registry phases) · why development stopped (registry whyStopped,
sponsor statements in registry only) · sponsor (registry/ChEMBL) · patent status (Orange Book where
present; else `not-applicable`) · ever dosed in humans {bool, evidence: first registry trial or
publication} · related compounds on the same target {list of keys, outcome ∈ approved, failed,
ongoing} rendered as markup (R10).

## Registry aggregate (shared input) — additions 2026-09-04

Per page the aggregate also carries `lastCompletionDate` (max completion date over completed
studies) so the evidence-age seed is computable, and per-study `primaryOutcomes` with their NCT ids.
No result direction is recorded (the snapshot holds protocol sections only), so seed 6
(time-to-signal) is computable only where a publication abstract states the effect and the
duration verbatim; it is absent otherwise.

## Coverage report format (Gate 1)

Per model: histogram of present-field counts; per-field present counts; median; tier sizes with the
thresholds that produced them. Tier 1 = LONGEVITY-model records; Gate 1 proceeds if Tier 1's median
is ≥ 8 of 15.
