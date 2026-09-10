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

## 11. Furniture, the ruler, and the slop draw's scope (2026-09-06, Fable, after measure v5)

Measured: on the Phase 4 text the lines carried by more than half of all pages rose from 5.1 % to
27.6 % of the corpus's words and the median page from 80 to 357 words; the unchanged rule then
selected Tier 1 at 23 present fields (48 indexable). The cause is three honest statements that
Operating Rule 9 requires and that repeat on 25,000+ pages: the register lines whose status is an
absence, the checked-sources statement on pages with no interaction row, and the patent
no-record line. Two binding rules collide — "unknowns render as Not found in [register] as of
[date]" and "repeated elements are markup, never prose". Resolution:

- **Furniture.** A statement with a fixed vocabulary that exists to state an absence is page
  furniture, on the same footing as the supervision block: the register rows whose status is
  "not found", "not cleared" or "not checked"; the checked-sources statement when the page holds
  no interaction row; the patent no-record line; the S10-only classification line. Furniture is
  rendered as a table or an aside carrying `data-furniture="true"`, with the shared tokens
  ("as of", the date, the register names) in column headers or a caption written once per page,
  and each absent register as one cell, never a sentence.
- **The ruler excludes furniture.** `page_text_v5` writes the reading text without furniture by
  default and with it under `--with-furniture`; `derive_threshold.py` and
  `rendered_dup_check.py` read the furniture-free text (the dup check skips
  `[data-furniture]` exactly as it skips the supervision block). Both figures are reported —
  furniture-free is the gate figure, with-furniture is recorded beside it — so the before/after
  comparison is like-for-like: before Phase 4 an absence rendered nothing and was not in the
  text either.
- **Affirmative content is never furniture.** A register row with an approval, withdrawal,
  schedule or class, an interaction line, a patent line with a date, a Tier 3 section, a
  derived section: all of it stays in the measured text.
- **Provenance of an absence** cites the field path that was searched and the register's date
  (`fields.regulatory.value` absent for JZ; source: HSA listing 2026-08-07), never a path the
  record does not carry.
- **The render and the DOM must agree.** `page_text_v5` mirrors the painted order and content of
  the page (jurisdiction order, every sentence); a sentence the page paints but the render lacks,
  or the reverse, fails `tests/test_render_safety.py`. The empty-target supervision sentence
  (DunedinPACE) is a generator bug: a sentence whose slot is empty does not render.
- **Loader numerator = ruler numerator.** The loader marks a page indexable on present count over
  applicable fields at its tier's threshold from `data/revamp/thresholds-v5.json`, never on
  present count over all fields at one corpus-wide number.
- **Biosimilars.** A trial that names only the reference product moves to the reference page
  (extend R14b: the reference is the one live page printing the INN without a suffix); the
  biosimilar page opens with "X is a biosimilar of Y" and shows its own BLA, approval dates and
  own-named trials.
- **Slug recompute** in every check reads `canonical-v3`, never the corpus-20k canonical.
- **Slop draw scope.** Test (b) (template on ≤ 0.5 % of pages after masking) applies to answer
  sentences, derived-section sentences, computed-section sentences and hub syntheses. It does not
  apply to question headings, which are the corpus-20k template contract (masked template ≤ 30 %,
  most-repeated unmasked string ≤ 0.5 %), nor to furniture, nor to the h1. Tests (a) and (c)
  apply to everything the page paints outside furniture.

## 12. After measure 2 (2026-09-07, Fable)

- **Test (b) is evaluated over the masked block**, not the masked sentence. Felix's definition of
  slop is "template sentences with a name swapped in" and "a passage where consecutive claims do
  not follow". The unit a reader meets is the block's answer (all its sentences, in order); after
  masking drug, target and number tokens, that block text may appear on at most 0.5 % of pages. A
  one-sentence block is therefore held to the literal sentence rule. The sentence-level literal
  reading is reported beside it for the record: it fails every deterministic generator, including
  the thirteen corpus-20k seeds that shipped, because a section that fires on 30 % of pages with a
  fixed skeleton cannot appear on 0.5 % once its slots are masked.
- **"No regulator classification is recorded for X"** is an absence statement and is furniture
  wherever it renders, including as a question-block answer (it was marked only in the stub
  record). It carries `data-furniture`, leaves the ruler, and is exempt from (b).
- **Same-name "-2" pairs** (nebivolol / nebivolol-2 and the rest): registry studies whose
  interventions name only the shared name belong to the page whose key the registers rank first
  (K1 over K2 over K3 over K4; the unsuffixed slug); the other page keeps only facts sourced
  against its own identifiers. A "-2" page left with nothing of its own falls below its tier's
  threshold and is noindex, which is the honest state of a record that holds no independent fact.
- **Combination products sharing a component** (pertuzumab-trastuzumab-hyaluronidase-zzxf and
  trastuzumab-hyaluronidase-oysk): a trial belongs to the combination whose full component set
  its interventions name; label, register and patent rows are the product's own by construction;
  the page opens with its component list. If a pair still measures ≥ 0.5 after that, it goes to
  the held list for Felix.
- **351(a) suffixed biologics are not biosimilars.** Where the FDA Purple Book licenses the page's
  proper name under 351(a) and the page's UNII is identical to the unsuffixed INN page's, the two
  are one substance: R1 (identical UNII) licenses the merge and the biosimilar exception does not
  apply. The INN page survives, the suffixed proper name becomes a synonym, the suffixed slug
  redirects. `biosimilar_of` edges are kept only for 351(k) licences (Phase 3 rule corrected:
  the suffix alone never makes a biosimilar).
- **Line definitions**: the slop draw's render/DOM comparison uses the same extraction as
  `dom_parity.py` (main-region text lines outside furniture), so one number describes parity.
- **Hub integration** (member Hubs row, `hubs.xml`, `hubs_load.ts` after the corpus loader) is
  applied now that the renderer is stable, from `data/revamp/hubs/integration-plan.md`.
- **Tailwind source scan** excludes `data/` and `.dvc/` (`@source not` in `app/globals.css`);
  the build worker was being killed reading 17 GB of measurement output.

## 13. The lead's reading of slop draw 3 (2026-09-08, Fable) — generator rules for fix round 3

Read: Tier 1 (flunitrazepam, ridaforolimus, iberdomide, telbivudine, nonoxynol-9), Tier 2
(bifonazole, trisodium citrate, hazel flower bud, filgrastim, plumeria), Tier 3 (ABBV-467,
bavebegene tovacivec, PF-04603629, CHEMBL3094407, cevostamab). The logical-sequence test fails on
the same faults on every tier, and every one is a generator fault, never a page fault.

1. **Absences never appear in a prose answer.** The corpus-20k regulatory answer ("SG not found, AU
   scheduled in the Poisons Standard and UK not cleared: the registers' classification of X") and
   the regulatory summary paragraph inside the label question ("SG not found; US approved (…); UK
   not cleared; curatedMarketingStatusNote …") both offer absences as a classification, which is a
   non-sequitur, and the second leaks a field name. Both are retired: the registration block is
   the single place for register status. The supervision question's answer names only affirmative
   classifications (a controlled-substance schedule, a withdrawal, a boxed warning, a REMS) with
   the provenance of that classification, never a jurisdiction read from another source. The
   questions "What classification does X carry?" and "Drug, supplement or controlled: what is X in
   …?" fire only when an affirmative classification exists; otherwise no question renders, and
   the absence is the furniture table.
2. **The "What the registers record" block is retired.** Its dated rows ("Open Targets 26.06
   drug_warning warningType Withdrawn; France; 1996; drug misuse") duplicate the registration block
   and print enum strings. Register events fold into the registration block as one sentence per
   event in words — "Withdrawn in France, 1996, for drug misuse (ChEMBL drug_warning; Open
   Targets)" — with identical events from several sources merged into one line naming both.
3. **Interactions render once, grouped.** The tier label is one visible element per line, never a
   second badge. Enzyme and transporter rows group into one line per role: "Substrate of CYP1A2,
   2A6, 2B6, 2C19, 2C8, 2C9, 2D6, 2E1 and 3A4 (Inxight FRDB)"; "Inhibitor of CYP2A6, 2C19, 2C9 and
   3A4, with a reported magnitude (Inxight FRDB)". Record ids (frdb:ddi:12049) and the per-line
   provenance list live only inside the closed disclosure; the visible block never repeats a line.
4. **Schedules render once.** The controlled-substance schedules table is the one place a statute
   row appears; the Singapore and Australia registration lines say "see schedules" after the
   class, never the statute rows again.
5. **Trial lists cap at six visible rows**; "14 further recorded trials" is a closed native
   `<details>` whose contents are not painted until opened.
6. **Inxight rows** with the jurisdiction "unspecified", and every "upstream registers:
   ClinicalTrials, February 2021 …" clause, live in the technical disclosure only (§10).
7. **Single-value statements are rows, not sentences.** "N of M completed trials posted no result:
   NCT…", "First publication 2013, last 2013 (ChEMBL)", "X has no recorded human exposure" and the
   like are data: rendered as labelled rows under the question heading (Posted no result: 25 of
   29 · NCT…, NCT…; Publications (ChEMBL): 2013–2013). The template test (b) applies to prose
   paragraphs; rows are markup. "No recorded human exposure" is an absence and is furniture.
8. **Nearest approved neighbour** renders as rows (Closest approved compound · Flurazepam ·
   similarity 0.48 · approved US, CA · generic available) and a prose sentence only when the
   substituent description from the MCS comparison exists.
9. **Form-of notes** print the related name once, as the link text.
10. **Header** prints one evidence line ("No human study recorded"), not two.
11. **Decorative glyphs** (the provenance anchor mark, the section separators) are hidden from
    text extraction (`aria-hidden`, CSS pseudo-elements), so neither the ruler nor a crawler
    reads "◇" and "~" as words.
12. **SUSMP matching** requires the substance-as-listed to equal a full normalised synonym of the
    page; a shared token never matches (trisodium citrate carried "SODIUM PHOSPHATE" and "SODIUM
    DIACETATE" rows).
13. **Hubs deduplicate by member set**: hubs whose member sets overlap at Jaccard ≥ 0.5 form
    complete-linkage groups; the largest member set survives as the hub, the others become aliases
    that redirect to it and are named in its definition line ("also known by … "). Re-measure the
    survivors with the corpus-20k scripts and re-run the rendered check over hubs (1,865 hub pairs
    were at or above 0.5).
14. **Duplicate hold**: when two indexable pages measure ≥ 0.5 on the rendered check after the
    rules above, the page with fewer own facts carries `noindex,follow` and a link to the other
    until Felix decides; the pair is on the held list with the default "one page per product".
    (Today: pertuzumab-trastuzumab-hyaluronidase-zzxf ↔ trastuzumab-hyaluronidase-oysk.)
15. **Payload (6.1)** follows once the rules above land: dossier content rendered on the server
    once, the client island receiving only the search bar's state; if Next.js cannot avoid the
    flight duplicate cleanly, `/d/*` and `/h/*` are static-exported with a single island. Floor:
    live text-to-HTML median ≥ 0.15 on the same 108 pages; target 0.25.

## 14. The lead's reading of slop draw 4 (2026-09-08, Fable) — rules for fix round 4

Read: Tier 1 (pralsetinib, piroxicam, cefmetazole, triacetyldiphenolisatin), Tier 2 (dacarbazine,
ethynodiol diacetate, palivizumab, indium-111 pentetreotide), Tier 3 (five ChEMBL-only stubs,
defoslimod, forasartan). Tier 3 stubs now read cleanly. Tiers 1 and 2 still fail the
logical-sequence test on register material that §13 retired in one place and not in the others,
and on the supervision answer's notion of "classification".

1. **The supervision answer names the suppression evidence, never a register status.** "AU
   scheduled in the Poisons Standard: the registers' classification of Piroxicam" is wrong twice:
   SUSMP Schedule 4 is a prescription class, not a supervision reason, and the provenance names
   registers the sentence does not. The answer to "Why does X carry a supervision requirement?"
   is built only from the S1–S9 class evidence recorded for the page (a controlled schedule —
   SG MDA, US DEA, AU S8/S9; a withdrawal with its reason; a boxed warning; a REMS; the cytotoxic
   or teratogen class; a monitored route), each with its own source. Prescription-only classes
   (SUSMP S4, SG POM, Rx) never appear in it.
2. **Register application rows leave every question block.** The rows painted under the
   supervision question (US NDA… Prescription, EU EMEA/H/C/… Withdrawn, CA drug code … APPROVED)
   and under the label question (SG registered, US … approved · Drugs@FDA …, JP approved, CA …)
   are the corpus-20k register data rows; the registration block and its disclosure hold them
   once. Retire them from both questions.
3. **The US status word derives from the application set:** any active prescription or OTC
   application → Approved; every application discontinued → Discontinued (the count); tentative
   only → Tentative approval. "Approved · 4 applications: all discontinued" is a contradiction.
4. **Rows belong to their question:** "Registered studies posting no result: 103 of 163" renders
   under the trials question, never under the label question.
5. **Label interactions group by label and direction:** one line per (label, direction class)
   — "Label-documented (DailyMed label 1cd10ca2…, 2024-03-11): avoid or monitor with antiplatelet
   drugs, aspirin, diclofenac, …; interaction stated with ACE inhibitors, angiotensin receptor
   blockers, …" — instead of twenty-one lines repeating the label id and date. A counterpart
   must resolve to a substance page or a recognised drug class; "PLATELETS" and bare "ASA" are
   entity-linking artefacts and are dropped with the count recorded.
6. **Provenance rows are never painted outside the closed disclosure** (the "openFDA drug labels /
   the NCATS … / CuratedB-inxight-frdb" list under the checked-sources statement is painted
   today).
7. **Parity whitespace:** adjacent inline spans (label, id; jurisdiction, id; "Trial", NCT;
   date, key) are separated by a text node or laid out as blocks, so no extractor reads
   "EUEMEA/H/C/005413" or "TrialNCT02099240".
8. **Page keys are never painted** ("1989-12-11 K1:3J962UJT8H first approval").
9. **Every visible list caps at six rows** with the remainder in a closed disclosure — the trial
   endpoint list under the largest-trial question painted fourteen.
10. **The provenance timeline (seed 8)** fires only with three or more dated events in
    chronological order, its question names the first and last event kinds, and it never
    phrases a later event as leading to an earlier one ("How did X get from 1989 to approved?"
    over "1989 first approval, 2004 first human trial").
11. **Absence questions do not fire:** "Has X ever reached a person?" renders nothing when the
    answer is an absence; the header line "No human study recorded" carries it.
12. **One relation per pair,** the most specific ("stereoisomer of", never also "same structure
    as").
13. **"This record holds N fields"** is furniture.
14. **Hub tables:** absence cells ("not found", "no record", "—") carry `data-furniture` so the
    rendered duplicate check reads hub content, not shared absence; the member-set dedupe at 0.5
    stays. If hub-to-hub pairs at ≥ 0.5 remain after that, the survivor rule of §13(13) applies
    at rendered Jaccard ≥ 0.5 as well (alias to the larger hub).
15. **Trace classifier** accepts a list of record ids for a grouped line; the three one-value
    prose blocks draw 4 named (the substituent sentence, the trial-size block, the mechanism
    block) become rows per §13(7).
16. **Self-audit before returning:** the fix agent renders 30 random pages (10 per tier) on its
    build and checks every rule in §13 and §14 mechanically where a rule is mechanical (no
    register status in the supervision answer; no application row outside the registration
    block; no painted key or record id; lists ≤ 6; provenance only in closed details; event
    order; one relation per pair; whitespace between spans) and adds each mechanical rule to
    `tests/test_render_safety.py`.

## 15. The lead's reading of slop draw 6 (2026-09-08, Fable) — rules for fix round 5

Read: Tier 1 (acetyldigitoxin, selank, voxtalisib, hexylcaine, chloroxine, technetium
arcitumomab), Tier 2 (interferon gamma-1b, palovarotene, sophora root, mecillinam). Pages now
read in sequence; render and DOM agree; the furniture tables carry the absences. What remains:

1. **The supervision answer names the specific class with the source of that class.** "A register
   records X under medical supervision: a World Health Organization therapeutic class such as
   cancer medicines, immune suppressants, opioids or general anaesthetics · tga-artg ·
   schedule-4" states a generic label list and cites a prescription-schedule row as its evidence.
   One clause per recorded class, each with its own evidence: "Its ATC class is C01AA, cardiac
   glycosides (ChEMBL 37)"; "Its US label carries a boxed warning (DailyMed label …, 2025-03-18)";
   "It is under a pregnancy-prevention programme (…)". A clause without a matching source does not
   render.
2. **Label mapping requires the page's UNII among the label's active ingredients and excludes
   unapproved product categories:** homeopathic labels (ingredient names carrying "[HPUS]" or
   the openFDA homeopathic marker), cosmetics-like and "unapproved drug other" SPLs. Acetyldigitoxin
   quoting a cosmetology-symptom label and a nail liquid's directions rendered as an indication
   are mapping errors, corrected at the source mapping and re-integrated.
3. **CLINICAL requires a register approval.** A page whose only clinical evidence is a DailyMed
   SPL with no application number is not CLINICAL; it stays DEVELOPMENT (or the supplement class
   its record holds). Re-run the model assignment with that rule, report the tier sizes before
   and after, and re-derive the ruler on the result.
4. **The two (b) shapes:** the register status value line leaves the question blocks entirely (the
   registration block is the only place; §14(2)), and the mechanism quotation renders as a row
   ("Mechanism (ChEMBL): "<register wording>"") per §13(7).
5. **Seed 9 ("which running trial could settle …")** fires only when the running trial's primary
   endpoint is in the ageing-endpoint vocabulary; otherwise its question is "Which running trial
   of X reads out next?" and the answer names the endpoint verbatim without "lifespan".
6. **Stereo wording:** when one record's InChIKey has an undefined stereo layer (UHFFFAOYSA) and
   the other's is defined, the note reads "the same connectivity, recorded without stereochemistry",
   never "diastereomer" or "enantiomer" (mecillinam / amdinocillin).
7. **Status rows keep their labels** (the phase question's status list painted bare counts).
8. **Whitespace between every label and value pair** across all components (the organism-ladder
   interpretation row painted "INTERPRETATIONno human trial recorded").
9. **Self-audit** per §14(16) extended with rules 1, 5, 6, 7, 8 as mechanical checks.

## 16. After measure 6 (2026-09-09, Fable) — fix round 6

1. **The supervision block is never truncated.** The two-paragraph discipline belongs to question
   answers; the supervision block renders every recorded class clause, one per line as a list, in
   the order S1–S9, so a page with four classes states all four (glofitamab must state its
   hazardous-medicine class and its boxed warning). The render and the page apply the same rule.
2. **Disabled interaction rules publish nothing.** Rule C2 (shared target, same direction) was
   disabled by validation and must not appear in `interactions.parquet`, `page_interactions` or
   any rendered line; the build refuses a row whose rule id is in the disabled list. Where a
   surviving rule cites an action pair, its direction trace names the field paths of the two
   action rows, never a sentence, and `slop_draw.resolve_trace` has a class for that shape.
3. Re-render in place, re-derive the ruler (furniture-free), re-run the checks and draws 10 and
   11; the gate passes on two consecutive draws with (a), (b), (c) at zero and parity exact.

## 17. The lead's reading of slop draw 10 (2026-09-10, Fable) — fix round 7

Read: Tier 1 (oxygen, buclizine, suprofen, rivaroxaban, urethane), Tier 2 (revefenacin, house
dust mite, vinflunine, lytta vesicatoria), Tier 3 (naroparcil, ficonalkib, three ChEMBL stubs,
flumecinol, glutathione misspelling, filenadol). Every page reads in sequence; the checks are
clean. Five generator faults remain, all fixed in the generator:

1. **Additive-class membership comes from the substance's own class.** The C3 rule paired
   rivaroxaban with "Compound solution of sodium chloride" and with glycine because a product
   record carries an anticoagulant ATC code. A counterpart qualifies only through a pharmacologic
   action or ATC class recorded against the substance itself (DrugCentral action, Inxight class,
   ChEMBL ATC on the molecule), never through a combination, solution or vehicle product record;
   counterparts whose entity class is excipient, vehicle, solution, mineral salt or water are
   excluded. Regenerate the parquet and report rows removed; the validation figures are re-run
   on the published rows and recorded beside the earlier ones.
2. **Withdrawal clauses merge identical events across sources and never precede a reasoned event
   with "no reason recorded":** urethane reads once, "withdrawn for carcinogenicity in Germany,
   Denmark, Brazil, Egypt, Italy, Cuba, the United States and Japan, 1963 (ChEMBL drug_warning;
   Open Targets)"; a flag-only source adds nothing when another source records the reason.
3. **A relation to a page printing the same display name uses that page's disambiguated name**
   ("Stereoisomer of Suprofen (racemate)"), never the bare shared name.
4. **Unconfirmed relation notes do not render** ("… neither the structures nor the printed names
   confirm …" belongs to the technical disclosure only).
5. **Relation-derived names are never listed as salt forms** ("WATER" under oxygen's salt forms
   came from a component relation); the synonym-kind mapping excludes component and mixture
   relations from the salt-form list.
6. Self-audit extended with mechanical checks for 2, 3, 4, 5; re-render; ruler re-derived; draws
   12 and 13.
