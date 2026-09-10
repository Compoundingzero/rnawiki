# Interaction engine rules (revamp 2026-09, Phase 4.1)

**Status:** fixed 2026-09-06. Binds `scripts/revamp/interactions_build.py` and
`scripts/revamp/validate_interactions.py`. `docs/specs/revamp-2026-09.md` §4.1 states what the three
tiers are; `docs/specs/phase4-generators.md` §4 states how a row renders. This file states how a row
is produced: which stored field each column comes from, how a counterpart name becomes a page, which
rules predict, how a prediction is banded, and which rules the measurement disabled.

Outputs: `data/revamp/interactions/interactions.parquet`,
`data/revamp/interactions/checked-sources.parquet`,
`data/revamp/interactions/build-summary.json`, `data/revamp/interactions/lexicon-dropped.csv`,
`data/revamp/interaction-validation.json`.

## 0. Inputs, and why two of them are read from the mapped source rather than from fields-v2

The integrated field records `data/revamp/fields-v2/*/batch-*.ndjson` are the rendering set, and
`scripts/revamp/integrate_sources.py` caps them for rendering: three label statements per page, ten
sentences per statement truncated at 400 characters, twenty curated interaction rows per page,
twenty CYP rows with two evidence entries each. Tier A must store the label sentence **verbatim**
and Tier C rule C1 turns on a signal carried by 49 evidence rows corpus-wide, so both read the same
cleared Phase 2 mapped source that fields-v2 itself was built from:

| Input | Read from | Used for |
| --- | --- | --- |
| openFDA label sections `drug_interactions`, `contraindications`, `warnings_and_cautions`, `boxed_warning` | `data/sources/openfda-label/mapped.parquet` | Tier A; the QT-prolongation gate |
| openFDA label CYP and transporter extraction | `data/sources/openfda-label/mapped.parquet` field `cyp_profile` | C1 perpetrator strength and substrate roles |
| NCATS Inxight FRDB drug-drug interaction rows | `data/sources/inxight/mapped.parquet` field `ddi` | Tier B; C1 substrate roles; the "checked, none found" evidence |
| merged targets and mechanism classes | `data/revamp/fields-v2` fields `target`, `mechanismClass` | C2, C3 |
| Singapore ATC level-4 codes | `data/revamp/fields-v2` field `regulatory` → `SG.atcCodes` | C3 |
| sources consulted per page | `data/revamp/fields-v2` fields `interactions`, `cyp_profile` (`sourcesChecked`, `consulted`) | `checked-sources.parquet` |
| identity | `data/revamp/identity/canonical-v2.ndjson`, `spine-attached.parquet`, `relations.parquet`, `display-names.csv` | counterpart resolution and pair exclusion |
| names | `data/corpus-20k/raw/fda-unii/UNII_Names_4Aug2026.txt` | counterpart name → UNII |
| tier and suppression | `data/corpus-20k/tiers/model-assignment.ndjson`, `data/corpus-20k/suppression/assignments.ndjson` | reporting |

DDInter is not read. The gate in `docs/revamp/BLOCKERS.md#ddinter-20-non-commercial-gate-phase-2-source-18-phase-41`
is not lifted, so validation runs against openFDA and Inxight only and
`data/revamp/interaction-validation.json` records that in `ddinter`.

## 1. Counterpart resolution (name to identifier to page)

A counterpart name found in a label sentence becomes `page_b` only through a stored identifier.
Counts below are from the run of 2026-09-06.

1. **Lexicon.** Every corpus page contributes its display name and its `canonical-v2` synonyms of
   kind `display`, `common`, `salt`, `inn`, `usan`, `ban` and `jan`. Kinds `brand`, `code`,
   `fragment` and `merged-page` are excluded: a US label names the active moiety, and the brand it
   does name is its own product, which is the page itself. Every name in
   `UNII_Names_4Aug2026.txt` whose UNII is a corpus page's `unii`, `active_moiety_unii` or
   `parent_unii` contributes, restricted to name types `of` (official), `cn` (common) and `sys`
   (systematic); types `bn` (brand) and `cd` (code) are excluded for the same reason. 178,801
   UNII name forms reach 21,682 corpus identifiers.
2. **Normalisation.** Lower-cased; every character that is not a letter or digit becomes a space;
   runs of space collapse. Each entry additionally contributes the form with trailing salt, ester
   and hydrate tokens from `scripts/revamp/salts.txt` removed.
3. **Forms dropped outright**, each with its reason in `lexicon-dropped.csv` (29,397 forms):
   - a single-token form shorter than 5 characters, or a form with no letter;
   - a form of more than 6 tokens;
   - a **non-discriminating** form. Frequency alone does not identify one: `ketoconazole`,
     `rifampin`, `carbamazepine` and `digoxin` are among the most frequent names in interaction
     text precisely because they are the counterparts labels name most. The test is the contrast
     between sections instead. A form is dropped when it appears in the interaction sections of at
     least 20 pages **and** in the `indications_and_usage` or `use_in_specific_populations` text of
     at least 20 % of that number. `blood` (955 interaction pages, 641 indication pages), `monitor`
     (1,313 / 479), `creatinine` (300 / 261) and `intravenous` (432 / 459) fail it; `ketoconazole`
     (253 / 2) and `rifampin` (272 / 9) pass.
   - a form whose page link was rejected below and which does not name a group of medicines (its
     last token does not end in `s`). A singular name whose link was rejected adds nothing a reader
     can check.
4. **Page link.** A form links to a page when the page carries a UNII or an InChIKey in
   `spine-attached.parquet` and the form is the page's own name rather than a category:
   - a form that arrived from `UNII_Names` for that page's identifier links;
   - a corpus synonym links when it equals the page's display name, is a token-boundary prefix of
     it or has it as one, or is within edit distance 2 of it as a single token. `rifampin` links to
     `Rifampicin`; `colestyramine` links to `Cholestyramine`; `ace inhibitors` does not link to
     `Ramipril`, `nonsteroidal anti inflammatory drugs` does not link to `Naproxen`, and
     `immunosuppressants` does not link to `Azathioprine`.
   - **Ambiguity.** A name carried by several pages links to one of them when exactly one page's
     display name is that name, or when the pages are all forms of one substance in
     `relations.parquet`, in which case it links to the one with the shortest display name — the
     parent, as `docs/specs/phase4-generators.md` §6 requires. `warfarin`, shared by Warfarin and
     Warfarin Sodium, links to Warfarin. Otherwise the form stays unlinked.
   - 158,717 forms carry a page link; 1,284 are kept unlinked, listed in `lexicon-named-only.csv`
     with the reason (`corticosteroids`, `benzodiazepines`, `ace inhibitors`, `ssris`, `protease
     inhibitors`, `beta blockers` and the like).
5. **At match time.** Longest match wins and matches do not overlap. A match that resolves to
   `page_a` itself, or to a page joined to `page_a` by any edge in `relations.parquet` (a salt,
   ester, stereoisomer, isotopologue, active moiety, parent, component, biosimilar or
   same-structure relation), is dropped: a medicine does not interact with its own form. A match
   immediately followed by `time`, `times`, `ratio`, `count`, `counts` or `index` is a laboratory
   measurement, not a medicine taken alongside, and is dropped — `prothrombin time`,
   `platelet count`. `level`, `levels` and `concentration` are deliberately absent from that list
   because `digoxin levels` is an interaction statement.
6. **No page.** An unlinked match yields `page_b = null` with the matched string in
   `counterpart_name`. The row is kept: the label statement is still evidence about the page it is
   on, and the counterpart it names is a group the reader can recognise.

## 2. Tier A — label-documented

One row per (page, counterpart, sentence).

- `drug_interactions`: any sentence naming a counterpart qualifies; the section is the label's own
  interaction section.
- `contraindications` and `warnings_and_cautions`: the sentence must name a counterpart **and**
  carry an interaction cue — `concomitant`, `concomitantly`, `coadminister`/`co-administer` in any
  inflection, `in combination with`, `concurrent use`, `concurrently`, `together with`, `patients
  taking`, `patients receiving`, `when used with`, `when given with`, `avoid use with`, `do not use
  with`, `should not be used with`, `interaction`, `interacts`. A sentence that merely lists a
  disease or a population is not an interaction and produces nothing.
- `sentence` is the label sentence verbatim. Sentence splitting breaks on `.` or `;` followed by
  whitespace, except after a known abbreviation (`St.`, `e.g.`, `i.e.`, `vs.`, `approx.`, `Dr.`,
  `Inc.`, `Ltd.`, `etc.`, `No.`, `Fig.`, `U.S.`, `Mr.`, `Ms.`) or a single capital letter, so
  `St. John's Wort` stays in one sentence.
- `set_id` and `effective_time` are the label's own, from `source_record_id` and `source_date` on
  the mapped row.
- `direction` is a coded reading of the sentence, never an attribution of which drug moves:
  `no change stated` (a negation cue: `did not affect`, `no effect on`, `not altered`, `did not
  alter`, `no clinically significant`, `no significant`, `unchanged`, `did not result in`) ·
  `contraindicated with` · `exposure increase stated` · `exposure decrease stated` · `avoid or
  monitor` · `interaction stated; direction not stated`. `derivation` records the cue words matched.
- `mechanism` is the enzyme or transporter named in the same sentence where one is named, else
  empty.
- `confidence` is `documented`.

## 3. Tier B — curated

One row per Inxight FRDB `ddi` row with `interactionFound: true`. The counterpart is the enzyme,
transporter or protein the row names, so `page_b` is null and `counterpart_name` holds
`targetName`. `mechanism` is `<role> of <targetName>`, `direction` is `substrate of <target>`,
`inhibits <target>`, `induces <target>`, `activates <target>` or `suppresses <target>` from the
row's `role`, `confidence` is the row's `magnitudeReported` verbatim, and `source_record_id` is the
Inxight record id (`frdb:ddi:<n>`).

A row with `interactionFound: false` is **not** an interaction row. It is counted per page into
`checked-sources.parquet` as curated evidence that was checked and found nothing, exactly as
`docs/specs/field-integration.md` §2 requires.

## 4. Tier C — predicted from mechanism

A prediction is emitted only between two corpus pages. Self-pairs and pairs joined by a
`relations.parquet` edge are excluded. C2 and C3 are symmetric and are written in both orderings so
a page finds its own rows by `page_a`; `pair_id` holds the sorted pair so a scorer counts each pair
once.

### Enzyme names

Enzyme and transporter strings are compared after one normalisation, and the label's own string is
kept verbatim in `derivation`: `CYP3A`, `CYP3A4/5` and `CYP3A4/CYP3A5` compare as `CYP3A4` (FDA
labelling uses them interchangeably for the same interaction statement); `P-glycoprotein`, `P-gp`,
`ABCB1` and `MDR1` compare as `P-gp`. No other string is rewritten.

### C1 — `cyp-inhibitor-substrate` and `cyp-inducer-substrate`

Inputs: page A carries a label statement that it is a **strong** or **moderate** inhibitor or
inducer of enzyme E; page B carries a substrate role for E, from its label or from the Inxight
curated rows. Weak, and unstated, perpetrator strength does not fire the rule.

- inhibitor → `direction` = `expected increased exposure of <B>`;
- inducer → `direction` = `expected decreased exposure of <B>`.

`derivation` names the inputs verbatim, in the form
`strong CYP3A4 inhibitor (label, set_id …) x CYP3A4 substrate (label, set_id …)`, and carries the
label's sensitivity statement where the substrate row records one.

### C2 — `shared-target-same-direction`

Inputs: pages A and B act on the same target key in the same direction. Direction is read from
action words only: `INHIBITOR`, `ANTAGONIST`, `BLOCKER`, `NEGATIVE ALLOSTERIC MODULATOR` and
`INVERSE AGONIST` are `inhibit`; `AGONIST`, `PARTIAL AGONIST`, `ACTIVATOR`, `POSITIVE ALLOSTERIC
MODULATOR`, `POSITIVE MODULATOR` and `OPENER` are `activate`. Every other action word, and a
missing one, fires nothing. `direction` = `additive effect at <target>`.

The rule is not published (§7). Where a rule reads its direction off two stored action rows, its
`direction` provenance names the field path of each row and the record that row sits on —
`action pair: fields.target.value.mergedTargets[].evidence[].pharmacology on K1:… (Inhibitor) x
fields.mechanismClass.value.chemblMechanisms[].actionType on K1:… (INHIBITOR), both read as inhibit`
— rather than stating the reading as a sentence ("action words Inhibitor and Inhibitor both read as
inhibit"), which names no record and cannot be executed. `slop_draw.resolve_trace` classes that
shape `action pair` and resolves it by reading this page's own action row off this page's stored
record and checking that the counterpart is a page the corpus holds.

### C3 — `additive-class`

Inputs: pages A and B are both members of one additive-effect class. Membership comes from
pharmacologic action, never from free text: a DrugCentral MeSH pharmacologic action, DrugCentral
`EPC`/`MoA`/`has role`, an Inxight pharmacologic class or therapeutic function, or an ATC level-4
code from the HSA product record. `direction` = `additive <class> effect`.

| Class | Member terms (matched exactly, case-insensitively) | ATC level-4 codes |
| --- | --- | --- |
| serotonergic | Serotonin Agonists · Serotonin Receptor Agonists · Selective Serotonin Reuptake Inhibitors · Serotonin Uptake Inhibitors · Serotonin Reuptake Inhibitor · Tricyclic Antidepressant · Antidepressive Agents, Tricyclic · Monoamine Oxidase Inhibitors · serotonin agonists | N06AA · N06AB · N06AG · N02CC |
| CNS-depressant | Central Nervous System Depressants · Hypnotics and Sedatives · Sedatives · Anesthetics · Anesthetics, Intravenous · Anesthetics, Dissociative · Analgesics, Opioid · Opioids · Full Opioid Agonists · Opioid Agonist · Anti-Anxiety Agents · hypnotics · central nervous system depressants · general anaesthetic · intravenous anesthetics · anaesthetic | N05CD · N05CF · N05CM · N05BA · N02AA · N02AB · N02AE · N01AB · N01AF · N01AH |
| anticoagulant/antiplatelet | Anticoagulants · Platelet Aggregation Inhibitors · Platelet Aggregation Inhibitor · Fibrinolytic Agents · Antithrombins · Anticoagulant · anticoagulants · platelet aggregation inhibitors | B01AA · B01AB · B01AC · B01AD · B01AE · B01AF |
| hypotensive | Antihypertensive Agents · Vasodilator Agents · Antihypertensive · Vasodilator · Diuretics · Diuretic · antihypertensive drugs · vasodilator agents · diuretics | every level-4 code under C02, C03, C07, C08 and C09 |
| hypoglycaemic | Hypoglycemic Agents · Antidiabetic Agents · antidiabetic · Insulin | every level-4 code under A10 |
| nephrotoxic | *(no term in the cleared vocabularies names this class)* | — |
| hepatotoxic | agente hepatotoxico | — |
| hyperkalaemic | Mineralocorticoid Receptor Antagonists · Potassium Sparing Diuretics | C03DA · C03DB · C09AA · C09CA · C09DA · C09XA |
| QT-prolonging | membership is the label gate below | — |

`Anesthetics, Local`, `local anesthetics`, `Coagulants` and `Antihypotensive` are named exclusions:
a local anaesthetic is not a systemic CNS depressant, and the other two act in the opposite
direction to the class they resemble.

Nephrotoxicity has no member term. The cleared pharmacologic-action vocabularies (DrugCentral MeSH
pharmacologic action and ChEBI role, Inxight pharmacologic class, ATC) name no nephrotoxic class, so
that class contributes no row. This is a limit of the sources, recorded rather than filled.

**QT-prolonging** is the one class whose membership is a label statement, as §4.1 requires ("only
where the label's `warnings_and_cautions` states QT prolongation"). A page is a member when its
`warnings_and_cautions` or `boxed_warning` section contains `QT prolongation`, `prolongation of the
QT`, `prolongs the QT`, `prolong the QT`, `QTc interval`, `QT interval prolongation` or
`torsade`; the matched sentence is stored in `sentence` and its `set_id` in `source_record_id`, so
the reader sees the statement the membership rests on.

## 5. Confidence bands

Every Tier C row is banded `likely` or `possible`. The band is fixed before measurement and is a
statement about corroboration, not about severity:

- **C1** — `likely` when the perpetrator strength is `strong` **and** the substrate role is recorded
  on the substrate's own FDA label; `possible` when the perpetrator is `moderate`, or the substrate
  role is recorded only in the Inxight curated set.
- **C2** — `likely` when both actions come from a curated mechanism-of-action record (a ChEMBL
  mechanism row or an IUPHAR primary ligand action) on the same target; `possible` when either side
  is recorded only as binding or assay pharmacology.
- **C3** — `likely` when both pages carry the class from two or more independent sources (any two of
  DrugCentral, Inxight, ATC); `possible` when either page carries it from one source only.

`likely` must reach precision ≥ 0.60 overall against Tier A. A rule scoring under 0.40 precision is
disabled: it is removed from `interactions.parquet`, listed with its reason in
`data/revamp/interaction-validation.json` under `disabled`, and recorded in §7 below.

## 6. Validation method

`scripts/revamp/validate_interactions.py` scores Tier C against Tier A. It measures
`interactions-all-rules.parquet`, which carries every rule, and reports which rules the published
`interactions.parquet` excludes, so the measurement and the disable decision stay consistent when
the build is re-run.

- **Positives.** Tier A pairs with a page link whose `direction` is not `no change stated`: 15,929
  pairs.
- **Negatives.** Tier A pairs whose only statement is `no change stated`: 466 pairs. A label
  sentence saying the pair was studied and nothing changed is the only evidence against an
  interaction that these sources hold.
- **`label_adjudicated_precision`**, the measure the bars apply to, is scored over the pairs the
  labels speak about: predicted pairs that are positives or negatives. Its denominator is reported
  with it on every row.
- **`label_coverage_precision`**, reported without a bar, is scored over every predicted pair whose
  two pages both hold an interaction-bearing label section: the share of them a label prints.
- **Recall** is over the positives and carries no bar.

Precision cannot be scored over unmentioned pairs. An FDA label prints a fraction of the
interactions a medicine has: aprepitant's label names 23 counterparts, while its own statement that
it is a strong CYP3A4 inhibitor implicates every CYP3A4 substrate in the corpus. Counting each
unmentioned pair as a false positive measures how much a label prints, not whether a prediction is
right, and it puts the floor at the base rate — 0.0048, the chance that a random pair of the 2,158
pages with an interaction-bearing section is label-documented. Both measures are therefore reported
for every rule and band, and `label_coverage_precision_over_base_rate` states how far above chance
each rule runs.

## 7. Rules disabled by the measurement

Measured 2026-09-06 by `scripts/revamp/validate_interactions.py`; the numbers below are in
`data/revamp/interaction-validation.json`.

**The build enforces this list; an operator does not.** `interactions_build.py` reads the `disabled`
array of `data/revamp/interaction-validation.json` and refuses to write `interactions.parquet` at
all if any row carries one of those rule ids (`--disable` may add to the list and can never take
anything off it). The two rules were originally removed by passing `--disable` on the command line,
and a later re-run of the build without those flags published 92,476 C2 rows and 12
C3-additive-hepatotoxic rows, which reached `page_interactions` and the rendered pages. A rule the
measurement disabled is disabled wherever the corpus is read from
(`docs/specs/phase4-generators.md` §16 item 2). `interactions-all-rules.parquet` still carries every
rule, because that is the table the validation measures.

The bar was met. `likely` reaches label-adjudicated precision **0.9956** over 458 adjudicated pairs
against the 0.60 bar; overall precision is 0.9828 over 1,748 adjudicated pairs; overall recall is
0.1079. No rule that the labels adjudicate falls under 0.40.

| Rule | Adjudicated precision | Adjudicated pairs | Coverage precision | Recall | Rows | Published |
| --- | --- | --- | --- | --- | --- | --- |
| C1-cyp-inhibitor-substrate | 0.9806 | 825 | 0.0496 | 0.0508 | 30,674 | yes |
| C1-cyp-inducer-substrate | 1.0 | 361 | 0.0460 | 0.0227 | 14,737 | yes |
| C2-shared-target-same-direction | not measurable | 0 | 0.0 | 0.0 | 92,476 | **no** |
| C3-additive-serotonergic | 1.0 | 18 | 0.3333 | 0.0011 | 2,346 | yes |
| C3-additive-CNS-depressant | 0.9375 | 16 | 0.1000 | 0.0009 | 19,724 | yes |
| C3-additive-anticoagulant-antiplatelet | 1.0 | 28 | 0.2381 | 0.0018 | 7,642 | yes |
| C3-additive-hypotensive | 0.9444 | 162 | 0.1318 | 0.0096 | 77,494 | yes |
| C3-additive-hypoglycaemic | 1.0 | 40 | 0.0534 | 0.0025 | 4,396 | yes |
| C3-additive-hyperkalaemic | 1.0 | 28 | 0.2427 | 0.0018 | 414 | yes |
| C3-additive-QT-prolonging | 0.9906 | 424 | 0.0403 | 0.0264 | 20,866 | yes |
| C3-additive-nephrotoxic | — | 0 | — | 0.0 | 0 | **no** |
| C3-additive-hepatotoxic | not measurable | 0 | — | 0.0 | 12 | **no** |

Three rules are not published:

- **C2-shared-target-same-direction.** It predicted 43,068 pairs and not one is adjudicated or
  documented by any label: its members are overwhelmingly research compounds with no label, so the
  corpus holds no evidence for or against any of its predictions. A rule that would have put 92,476
  unverified rows on 3,000 pages is not published on that basis.
- **C3-additive-hepatotoxic.** `agente hepatotoxico` is the only hepatotoxic term in the cleared
  vocabularies and it sits on four pages; none of its six pairs is adjudicated.
- **C3-additive-nephrotoxic.** No member term exists, so the rule fired on nothing.

Disabling C2 is what reduces Tier C from 3,650 pages to 772: it was the only rule reaching pages
without a label. Those pages keep their checked-sources statement.

DDInter was not used as a second reference. The gate in `docs/revamp/BLOCKERS.md` is not lifted and
the JSON records that under `ddinter`.

## 8. What the measurement leaves standing

Two limits are recorded rather than filled.

- **Tier A is a parsed reading of label prose.** Its counterpart links were measured while being
  built: 29,397 lexicon forms were dropped with their reason into
  `data/revamp/interactions/lexicon-dropped.csv`, and 1,284 group names that no single page can
  carry are kept as unlinked counterparts in `lexicon-named-only.csv`. Analyte pages that share a
  name with a medicine still reach a small share of rows — `PROTHROMBIN`, `Angiotensin II` and
  `Norepinephrine` are the three largest, together about 2 % of the page-linked Tier A rows. The
  `prothrombin time` case is filtered by the measurement-follower rule in §1; the rest are not, and
  are recorded here.
- **The negative evidence is thin.** 466 pairs corpus-wide carry a label statement that a pair was
  studied with no change. Every adjudicated precision in the table above rests on that evidence, and
  each row states the denominator it used.
