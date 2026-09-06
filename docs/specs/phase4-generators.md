# Phase 4 generator rules (revamp 2026-09)

**Status:** fixed 2026-09-06 by the lead (Fable). Binds every generator written or changed in
Phase 4. `docs/specs/revamp-2026-09.md` §Phase 4 states what each block contains; this file states
how it reads, what order it takes, and the rules the Phase 1 reading and the Phase 3 duplicate
check showed to be missing. Every sentence a generator emits traces to a stored field or computed
value (provenance map sentence → field), and the slop gate (4.7) samples against these rules.

## 1. Block order on every corpus page

1. Supervision (when any S1–S9 class is recorded) — unchanged, always first.
2. **Where it's registered** — every page, including Tier 3 stubs.
3. Interactions (tiers A, B, C) — when any row or a checked-sources statement exists.
4. Generic and patent — every page with a US register record; the "no data on record" line
   elsewhere.
5. Existing question blocks in their data-derived order (unchanged rule: order from data).
6. Tier 3 computed sections (nearest approved neighbour, potency rank, activity timeline, form-of
   note) — after the question blocks, before the exact record.
7. Pharmacogenomics — only when the ClinPGx gate in BLOCKERS is lifted; the block does not exist
   in the rendering set until then.
8. The exact record and sources — unchanged.

Absent data renders nothing; a block never renders a heading over an empty body.

## 2. Jurisdictions and their labels

Source strings are mapped once, in `lib/corpus/jurisdictions.ts`, and rendered with the label in
the second column. Unmapped source strings are recorded in `data/revamp/jurisdiction-unmapped.csv`
and rendered under "Other registers" with the source's verbatim string, never dropped silently.

| Jurisdiction | Label | Source strings that map to it |
| --- | --- | --- |
| SG | Singapore | HSA listing; MOH SDL/MAF; MDA schedules; Poisons Act schedules |
| US | United States | US, USA, United States, "Drugs@FDA", "Orange Book", Inxight `US` |
| AU | Australia | AU, Australia, SUSMP, "Poisons Standard" (ARTG status is null with its reason) |
| UK | United Kingdom | UK, GB, United Kingdom, Great Britain, MHRA (status "UK register not cleared for this run") |
| EU | European Union | EU, EMA, Europe, European Union, "European Medicines Agency" |
| JP | Japan | JP, Japan, PMDA, "Japan (PMDA)" |
| CA | Canada | CA, Canada, "Health Canada" |

Order on the page: Singapore, United States, Australia, United Kingdom, European Union, Japan,
Canada, then any "Other registers" rows in source order.

## 3. The "Where it's registered" block

One line per jurisdiction, in the order above, each carrying status · source · date checked.

- Singapore: `Registered (HSA) · POM · checked 2026-09-06` / `Not found in the HSA listing as of
  2026-09-06`; a Misuse of Drugs Act or Poisons Act schedule match adds `· Class A, First Schedule,
  Misuse of Drugs Act (version 2026-xx-xx)`; MOH subsidy status when the list was ingested.
- United States: Drugs@FDA or Orange Book status (approved / discontinued / tentative), Rx or OTC,
  DEA schedule when recorded. Multiple applications collapse to one summary line: `8 applications:
  5 prescription, 3 discontinued` with the application ids inside a disclosure, never one line per
  application. This is the rendering that produced Tier 2's repeated register rows; it is
  forbidden from Phase 4 on.
- Australia: `Schedule 8 (Poisons Standard June 2026)`; ARTG status renders `ARTG not checked:
  the register's terms do not permit reuse` — never "not found in the ARTG".
- United Kingdom: `UK register not cleared for this run`.
- European Union: EMA status with the event date (`Authorised 2019-03-21`, `Withdrawn 2013-01-11`).
- Japan: `Approved (PMDA, 2015)`; where DrugCentral's flag and the PMDA list disagree, render the
  PMDA list and record the discrepancy in the technical disclosure.
- Canada: DPD status where held.

Unknowns always read `Not found in [register] as of [date]`. Two stitched Inxight records on one
page merge by jurisdiction, never sum. Combination products list each component's line under the
component name.

## 4. Interactions

Every line begins with its tier label in words: **Label-documented**, **Curated**, **Predicted
from mechanism**. The tier label is a visible element, not a class.

- Tier A line: `Label-documented · <counterpart>: "<label sentence>" · <set_id> · <effective_time>`.
- Tier B line: `Curated · <counterpart or enzyme/transporter>: <role>, <magnitude> · Inxight
  <record id>`. A row with interactionFound:false renders inside the checked-sources statement,
  not as an interaction.
- Tier C line: `Predicted from mechanism: <derivation> → expected ↑ exposure of X` or `→ additive
  <class> effect`, then `(<rule id>; <confidence band>)`. Derivation names the inputs verbatim:
  `strong CYP3A4 inhibitor (label) × CYP3A4 substrate (label)`.
- Page-level statement, always present when the block renders and when it does not: `No
  interaction found in openFDA labels, Inxight FRDB[, ClinPGx] as of 2026-09-06` — listing only
  the sources actually checked for this page. The words "safe", "no interaction", "safe to
  combine" never appear in generated text; `tests/test_render_safety.py` asserts it.
- Predicted-only pages carry the statement first, then the predictions.
- Controlled substances (any match against the SG MDA schedules, US DEA schedules, AU SUSMP 8–9, or
  the UN conventions list): the generator has no code path that emits dose, timing, route,
  frequency or combination-protocol text for them; the interaction block renders mechanism and
  direction only; the "Human studies used …" dose question is suppressed on these pages exactly as
  seeds 1, 2 and 6 are today (extend the suppression trigger to the new `controlled` field).

Additive-effect classes for rule (iii): serotonergic, CNS-depressant, anticoagulant/antiplatelet,
hypotensive, hypoglycaemic, nephrotoxic, hepatotoxic, hyperkalaemic, QT-prolonging (only where the
label's warnings state QT prolongation). Class membership comes from pharmacologic action
(DrugCentral / Inxight / ATC level 4), never from free text.

## 5. Generic and patent block

`RLD: yes · earliest unexpired patent expiry 2031-04-02 · exclusivity ends 2027-11-15 · generic
available: yes, first generic approved 2018-06-01 · TE code AB`. Pages with no Orange Book record
read `No US patent or exclusivity data on record` and, where knowable, the reason: `not an
approved US small molecule` or `biologic: see Purple Book exclusivity` with the Purple Book line.

## 6. Differentiating the 19 duplicate pairs (and their classes)

The rendered duplicate check flagged two classes among indexable pages. Neither is fixed by a
threshold.

- **Form pairs** (salt, ester, hydrate versus parent: heparin calcium / sodium, methylprednisolone
  acetate / hemisuccinate, zinc / zinc gluconate, chromium / chromium acetate, hydrocortisone
  acetate / phosphate): the form page opens with the form-of note (`Heparin calcium is the calcium
  salt of heparin`), renders only facts recorded against the form itself (its own applications,
  its own labels, its own trials), and states `N registered trials name heparin without a salt;
  they are recorded on the heparin page` with a link. Trial rows matched by the parent name belong
  to the parent: extend the Phase 3 R14 reassignment from stereo descriptors to salt and ester
  forms (`data/revamp/identity/trial-reassignments.csv`, action=move).
- **Same-name "-2" pairs** (halofuginone / halofuginone-2, nebivolol, acarbose, valine, oxytocin,
  esmolol, astaxanthin, and exenatide / exenatide-synthetic): Phase 3's second opinion decides
  merge or separate; where separate, the display-name disambiguation from
  `data/revamp/identity/display-names.csv` renders in the h1 and the page's facts are partitioned
  by the source record that named the key. Where merged, the `-2` slug redirects.
- **Biosimilars** measured at 0.22 maximum and are not duplicates at the ruler's threshold; they
  still open with `X is a biosimilar of Y` and keep the reference product's trials on the reference
  page.
- **Product components** (23 Pneumovax 23 antigens, Prevnar 13, RotaTeq, Gardasil 9): compose the
  product page from `PRODUCT:NAME:<brand>` keys (128 component_of edges); each component page
  opens with `Part of Pneumovax 23 (23 antigens)` and shows only facts recorded against the
  component; the shared trial set renders once, on the product page.

## 7. Defects from the Phase 1 reading, now rules

- A dose-response quotation renders only when the sentence contains the page's display name or a
  recorded synonym (case-insensitive, salt suffixes stripped); otherwise the section does not fire.
- No raw class id, seed id, rule id or enum reaches prose; labels come from the tables in
  `docs/specs/suppression-classes.md` and `lib/corpus/suppression-classes.ts`.
- Trial endpoint lists show at most six rows inline; the rest sit in a disclosure with a count.
- Register application lists are summarised as in §3.

## 8. Tier 3 computed sections

- Nearest approved structural neighbour: Morgan radius 2, 2048 bits, Tanimoto ≥ 0.40 against every
  approved compound with a structure; `Closest approved compound: X (similarity 0.62); differs by a
  methoxy substituent on the aromatic ring; X is approved (US, EU), generic available`. The
  substituent description comes from the maximum common substructure difference; when RDKit cannot
  name the difference, the sentence stops after the similarity value.
- Potency rank: `Among 14 compounds with a pChEMBL value against EGFR (binding assays), X ranks 3rd
  (79th percentile)`; renders at five or more comparators.
- Activity timeline: `First publication 2009, last 2021 (ChEMBL). An approved drug has since been
  approved against EGFR (target validated)` or `The last three trials on EGFR were terminated or
  withdrawn (target headwind)`; `Originating organisation: Y (no record after 2020)` when held.
- Form-of note from Phase 3.

## 9. Slop gate sample rules (4.7)

Sentence template test: mask drug names, target names and numbers; a template on more than 0.5 %
of pages corpus-wide fails. Device labels ("the problem", "the lesson", "the takeaway") fail. The
lead reads the 60 pages for the logical-sequence test: each sentence must follow from the one
before it, and a paragraph that pairs a fact with an unrelated fact fails even when each sentence
is true. Every failure is fixed in the generator; the draw is re-run with a fresh seed; the gate
passes on two consecutive clean draws, both committed under `data/revamp/slop-draws/`.

## 10. Decisions taken on the data stage's findings (2026-09-06, Fable)

- **Seed 17 (jurisdiction divergence)** fires only when two affirmative register findings diverge
  (approved versus withdrawn, refused, suspended or revoked). A "not found" or "not cleared" row
  is an absence and never a divergence. The data-stage re-run that compared absences produced
  12,872 records; with absences excluded 1,642 remain, and the 40-page floor still applies.
- **Controlled trigger** = Singapore Misuse of Drugs Act schedules, US DEA schedules, Australian
  SUSMP Schedules 8 and 9, and the UN conventions when ingested. The Singapore Poisons Act and
  Poisons Rules schedules are a prescription classification, not a controlled-substance list:
  they render in the registration block and do not trigger the no-dose path. (Measured: 1,836
  pages with the Poisons Act included, 241 SG MDA pages without; Operating Rule 9 names the MDA.)
- **Class S2 label** names Australia as well: "a controlled-substance schedule in Singapore, the
  United States, Australia or the United Kingdom" (`docs/specs/suppression-classes.md` updated).
- **Dose question** is withheld on every suppressed page, controlled pages included, exactly as
  seeds 1, 2 and 6 are; the recorded dose stays in the technical disclosure's field list as a
  value name only, never as text.
- **Inxight "unspecified" jurisdiction** rows (15,140 pages) go to the technical disclosure, not
  to "Other registers"; the 100 other unmapped strings render under "Other registers" with the
  verbatim string and are listed in `data/revamp/jurisdiction-unmapped.csv`.
- **Display names after a merge:** the printed name is never an all-caps register string when a
  title-case synonym of kind common or INN exists (potassium citrate, not "POTASSIUM CITRATE
  ANHYDROUS"; sodium succinate, not "Monosodium Succinate" unless that is the only name). Slugs do
  not change; the redirect plan stands.
- **Heparin calcium / heparin sodium and chromium / chromium acetate**: no single parent page
  prints the stripped name, so the parent-named trials stay on the form pages. The form pages open
  with the form-of note and their own register, label and patent facts; if the rendered duplicate
  check still flags a pair after Phase 4, the pair joins the held list for Felix with the
  recommended default "one page per active moiety".
- **Neighbour status clause** keeps the jurisdiction codes of §8's example ("approved (US, EU)").
- **Interaction rules C2, C3-hepatotoxic and C3-nephrotoxic** stay disabled with the recorded
  reasons; the engine publishes the eight rules that reached the bars (likely precision 0.996,
  overall 0.983 on 1,748 label-adjudicated pairs; recall 0.108 against label-documented pairs).
