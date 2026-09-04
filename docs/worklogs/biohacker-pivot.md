# Biohacker pivot — running log

RNAWiki narrows its audience to biohackers and self-experimenters. The corpus goes from 9,852
general medical records to a small, deep set of compounds that audience actually researches. This
is a scoping and measurement job first; no page structure is built until Phase 3 is approved.

Operating context: `docs/worklogs/trial-results-BRIEF.md` and `docs/worklogs/trial-results-ingestion.md`.
The last cycle measured that removing shared copy moves overlap and adding distinct copy does not.

**Uniqueness target, stated correctly:** positional overlap (shared five-word sequences) at or
below 0.20, lexical at or below 0.40. Semantic overlap is reported for continuity only — the
out-of-domain floor is 0.737 and search engines do not fingerprint it.

<!-- RESUME BLOCK — keep at the top, rewrite after every phase -->

## RESUME

**Next step: none until Felix chooses a threshold.** Phases 1 and 2 are complete, verified and
committed (`f93824c`). `state.json` reads `awaiting: "Felix: choose strict/moderate/broad"`.
Neither Phase 1 stopping rule (moderate 619, inside 150–2,000) nor the Phase 2 rule (median 6 of 8
at moderate) fired. Phase 3 — page design — starts only after the choice, and is design-only until
approved.

**The choice, in one line each:** strict 166 (self-obtainable, OTC/supplement, published, oral or
subcutaneous — but thin on prescription medicines and on evidence, median 5 of 8); moderate 619
(stored human study + category, route recorded or a supplement; median 6 of 8; 18 of the 74
hand-curated audience compounds); broad 803 (= moderate with the route gate removed; 54 of 74).
**20 of the 74 hand-curated grey-market / psychoactive / peptide compounds reach no slice at all**,
18 of them because they have no US label and no stored search hit — see "What the slices miss".

```bash
cd "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki-corpus-completion"
npx tsx scripts/biohacker-pivot/phase1-classify.ts     # already done — prints so
npx tsx scripts/biohacker-pivot/phase2-inventory.ts --report
```

**Machine state:** `data/biohacker-pivot/state.json`; per-record outputs `phase1-records.ndjson`
and `phase2-records.ndjson`; summaries `phase1-summary.json`, `phase2-summary.json`. Every phase
is idempotent; `--force` redoes one deliberately.

**Working database:** `postgresql://admin@localhost:5432/rnawiki_corpus_completion`. Worktree
`RNAwiki-corpus-completion` on `main`. `rnawiki_dev` is drifted; never use it.

**Editorial constraints, non-negotiable:** report what was studied, never a protocol or suggested
dose ("Trials used 200 mg daily for 12 weeks" yes; "Take 200 mg daily" no). Registry-stated values
verbatim; derive nothing the source does not state. Animal-only evidence is named as such in the
same breath as the finding, every time. A stopped trial gets the registry's reason and nothing more.

**Stopping rules:** Phase 1 moderate under 150 or over 2,000; Phase 2 median ≤3 of 8; Phase 6
positional overlap above 0.30; Semantic Scholar citation contexts at unusable coverage.

| Phase | What it does                                                | State   |
| ----- | ----------------------------------------------------------- | ------- |
| 1     | Classify 9,852 records; report strict / moderate / broad     | ✅ 166 / 619 / 803 |
| 2     | Inventory 8 data types per compound; report the distribution | ✅ median 5 / 6 / 5 of 8 (ceiling 7) |
| 3     | Variable page structure — design only, for approval          | ⛔ waits on the threshold choice |
| 4     | Citation evolution layer                                     | waits on Phase 3 approval |
| 5     | Self-experiment schema — build, do not launch                | waits on Phase 3 approval |
| 6     | Measure against the real bar                                 | waits on Phase 3 approval |

<!-- END RESUME BLOCK -->

## Phase 1 — classification (2026-09-03)

Script: `scripts/biohacker-pivot/phase1-classify.ts`. Outputs
`data/biohacker-pivot/phase1-records.ndjson` (one row per canonical record) and
`data/biohacker-pivot/phase1-summary.json`. Population is the 9,852 rows with
`inventory_resolutions.resolution_status = 'CANONICAL_ENTITY'`. Every number below is read from
that summary file.

### Count at each signal

| Signal | Records | Share of 9,852 |
| --- | ---: | ---: |
| availableNoRx | 7,060 | 71.66% |
| routeRecorded | 6,213 | 63.06% |
| humanStudy | 5,719 | 58.05% |
| publication | 5,369 | 54.50% |
| routeSelfUse | 4,760 | 48.31% |
| category | 989 | 10.04% |

Category is the binding signal. Nine in ten canonical records match none of the ten category
lexicons, so no threshold can be larger than 989 minus whatever the exclusions remove.

Where each signal came from:

| Branch | Records |
| --- | ---: |
| humanStudy: both ClinicalTrials.gov and PubMed | 3,219 |
| humanStudy: PubMed only | 2,150 |
| humanStudy: ClinicalTrials.gov only | 350 |
| humanStudy: neither | 4,133 |
| availableNoRx: self-obtainable entity class | 5,879 |
| availableNoRx: OTC product type on the stored label | 4,097 |
| availableNoRx: supplement-ingredient registry | 3,884 |
| Observed, not counted: supplement market registry | 5,347 |
| Observed, not counted: prescription-only stored label | 1,826 |
| Observed, not counted: grey-market seed-file membership | 74 |
| Conflict: prescription-only label vetoed the entity-class branch | 30 |
| Conflict: availableNoRx and a prescription-only label coexist | 60 |

The three availableNoRx branches overlap, which is why they sum past 7,060. Publication is a strict
subset of humanStudy, so the broad threshold reduces to category and humanStudy with no exclusion.

### Count at each exclusion

| Exclusion | Records |
| --- | ---: |
| noLabelNoStoredSearchHit | 1,397 |
| biosimilar | 194 |
| imagingDiagnostic | 160 |
| chemotherapy | 45 |
| anaesthetic | 29 |
| vaccine | 19 |
| Any exclusion (distinct records) | 1,778 |

The individual reasons sum to 1,844 against 1,778 distinct records, so some records fire more than
one rule. `anyExclusion` is 18.05% of the corpus. Of the 989 records that hold a category, 140 are
excluded and 132 hold no stored human study.

`noLabelNoStoredSearchHit` means no stored label, no stored product listing, and zero results on
both stored keyword searches. It is not a statement that a substance is unstudied. Both searches
ran on the full recorded display name, so a parenthesised name returns zero by construction; 42
records carry such a name, 24 of those have no search hit and 11 are excluded by this rule.

### Threshold sizes

| Threshold | Records | Gate |
| --- | ---: | --- |
| strict | 166 | no exclusion, stored human study, self-use route, category, availableNoRx, indexed clinical-trial publication |
| moderate | 619 | no exclusion, stored human study, category, and (self-use route or no recorded route on a supplement or botanical record) |
| broad | 803 | no exclusion, category, and (stored human study or publication hit) |
| excluded for any reason | 1,778 | — |

The three are nested: strict is inside moderate, moderate is inside broad. They are audience-fit
filters, not a confidence ladder. Strict is the narrowest on availability and route, and phase 2
measures it as the shallowest of the three on stored evidence, because the two gates it adds drop
evidence-rich prescription medicines and keep over-the-counter records that carry little stored
data. Read depth from the phase 2 tables below, never from the tier name.

### Per-category breakdown

A record can hold more than one category, so these columns sum past the threshold sizes: 1,146
memberships across 989 records with any category, 195 across the 166 strict, 727 across the 619
moderate, 948 across the 803 broad.

| Category | Any | strict | moderate | broad |
| --- | ---: | ---: | ---: | ---: |
| anti-inflammatory | 310 | 50 | 191 | 251 |
| metabolic-glucose | 263 | 54 | 194 | 239 |
| hormones-endocrine | 211 | 36 | 140 | 173 |
| peptides | 85 | 8 | 45 | 73 |
| sleep-circadian | 82 | 12 | 55 | 62 |
| nootropics-cognition | 70 | 13 | 48 | 58 |
| performance-recovery | 67 | 10 | 30 | 50 |
| psychoactive-mood | 32 | 3 | 5 | 21 |
| mitochondrial | 14 | 6 | 13 | 13 |
| senolytics-longevity | 12 | 3 | 6 | 8 |

Two categories are small for structural reasons that should be stated rather than patched.
`psychoactive-mood` has no keyword lexicon at all: no text screen was found that does not also
match every antidepressant and antipsychotic indication in the corpus, so its 32 members come from
the hand-curated `controlled-psychoactive.ts` seed file, and only 5 clear the moderate gate because
most controlled substances have no self-use route recorded. `senolytics-longevity` reaches 12
because the corpus stores almost no text using that vocabulary — `senolytic` matches one record,
`nicotinamide mononucleotide` one, `telomere` two, `anti-aging` two, `longevity` three,
`resveratrol` three, `senescent` three, `sirolimus` one.

### Entity class at each threshold

| Entity class | All 9,852 | strict | moderate | broad |
| --- | ---: | ---: | ---: | ---: |
| SUPPLEMENT_INGREDIENT | 3,023 | 70 | 150 | 153 |
| BOTANICAL_OR_ORGANISM_PREPARATION | 2,758 | 11 | 19 | 20 |
| APPROVED_MEDICINE | 2,342 | 62 | 332 | 403 |
| MARKETED_PRODUCT_INGREDIENT | 643 | 11 | 14 | 23 |
| APPROVED_BIOLOGIC | 492 | 7 | 74 | 116 |
| INVESTIGATIONAL_MEDICINE | 390 | 0 | 23 | 48 |
| OFF_LABEL_OR_COMPOUNDED | 128 | 4 | 5 | 6 |
| WITHDRAWN_MEDICINE | 29 | 1 | 1 | 14 |
| CONTROLLED_NO_APPROVED_USE | 21 | 0 | 16 | 16 |
| COMBINATION_PRODUCT | 21 | 0 | 1 | 4 |
| REGISTRY_ONLY_IDENTITY | 5 | 0 | 0 | 0 |

The shape of the strict slice is the finding here. Supplements and botanicals are 58.7% of the
corpus but only 48.8% of strict, while approved medicines and biologics are 28.8% of the corpus and
41.6% of strict. Moving from strict to moderate roughly doubles the supplement count and more than
quintuples the approved-medicine count, which is the mechanism behind the depth reversal phase 2
measures.

### Route coverage

Route is never inferred. A record with no route in the stored product listing, label presence or
pharmacokinetics is counted as unrecorded, including supplements that are in practice swallowed.

| Route state | All 9,852 | strict | moderate | broad |
| --- | ---: | ---: | ---: | ---: |
| recordedSelfUse | 4,760 | 166 | 537 | 537 |
| recordedOtherOnly | 1,453 | 0 | 0 | 90 |
| unrecorded | 3,639 | 0 | 82 | 176 |

The moderate gate admits 82 route-unrecorded records through the supplement and botanical fallback
(75 SUPPLEMENT_INGREDIENT, 7 BOTANICAL_OR_ORGANISM_PREPARATION). The same fallback keeps out 94
records that would otherwise clear every other moderate gate: 35 grey-market seed slugs, 30
approved medicines, 20 biologics, 16 controlled substances with no approved use, 12 withdrawn
medicines, 9 investigational medicines, 4 marketed product ingredients, 3 combination products.
That set is the single largest lever on the moderate size if Felix wants to widen it without
loosening the evidence gates.

### Verification findings that were material, and how they were resolved

Twenty-four findings were raised against the first classification run. Twenty-one produced a rule
change; three were disputed on the evidence and the rule was still changed where it was wrong for a
different reason. The thresholds moved from strict 283 / moderate 789 / broad 974 to strict 166 /
moderate 619 / broad 803, and the category population from about 1,030 to 989.

- **`mitochondrial` was majority artefact.** Twenty-one of its 34 members owed their entire
  membership to the bare words "mitochondria" or "mitochondrial" appearing in mechanism prose about
  unrelated pharmacology — a shared cyanide-antidote sentence about cytochrome c oxidase admitted
  Sodium Nitrite, Hydroxocobalamin, Potassium Nitrite, Calcium Nitrite and Sodium Thiosulfate, and
  a dihydroorotate-dehydrogenase sentence admitted Leflunomide and Teriflunomide. Both bare terms
  are now restricted to the indication, patient-friendly indication and recorded-use fields and no
  longer read mechanism text. The category fell from 34 to 14. One residual is named rather than
  patched: Valproic Acid still joins, because its stored indication carries the safety sentence
  about patients with mitochondrial disorders, which is a contraindication being read as a use.
- **Homeopathic label copy was setting categories.** One in five strict records drew its entire
  category assignment from indication or recorded-use text carrying the "traditional homeopathic
  practice, not accepted medical evidence, not evaluated by FDA" disclaimer. Those three text
  fields no longer set a category on a record whose only recorded marketing category is UNAPPROVED
  HOMEOPATHIC, nor on any field whose own text carries the disclaimer; every other field still
  does. 254 records lost their only category to this rule, 80 of which would have been strict.
- **Seed-file membership was being read as availability.** Membership of a hand-curated file is
  curation, not evidence about how a substance is obtained, and counting it had made all 21
  CONTROLLED_NO_APPROVED_USE records — heroin, LSD, MDMA, psilocybin — available without a
  prescription, and was the sole availability evidence for ten strict records. Seed membership now
  sets that file's category and nothing else; it is recorded per record as
  `observedNotCounted.greyMarketSeedSet`.
- **The chemotherapy exclusion was reading indication prose as a drug class.** It now fires only on
  FDA pharmacologic-class vocabulary. Reading oncology words in an indication as a class had removed
  Levothyroxine, Estradiol, Hydrocortisone, Dexamethasone, Cortisone, Bromocriptine and Dronabinol.
  355 records carry oncology indication text and are counted, not excluded.
- **The anaesthetic exclusion was removing substances for which anaesthesia is the setting.** The
  indication branch now strips setting, risk and reversal phrasings first, and takes the same
  seed-slug and self-obtainable exemption, so Cocaine, Fentanyl and Nitrous Oxide stay in. Ketamine
  is still removed by its recorded FDA class "General Anesthetic [EPC]" and is named as the one
  curated slug a class branch still removes.
- **The biosimilar exclusion was inoperative through a casing bug.** The four-letter-suffix pattern
  had no case-insensitive flag while recorded names are title case, so it had fired on one name.
  Matched case-insensitively the corpus holds 217 suffixed biologics; because FDA gives originators
  and biosimilars the same suffix, the rule now excludes a suffixed record only when the unsuffixed
  stem also exists as its own canonical record, which is a duplicate of a molecule already counted.
- **The imaging share branch was excluding foods.** A majority-diagnostic study share computed over
  one or two studies had removed Poppy Seed, Wheat Gluten, Mugwort, Rubidium and Xylose. The branch
  now requires at least 5 stored studies; 31 records fall below that floor and 16 stay in scope.
- **A prescription-only label was not vetoing anything.** A stored label that says HUMAN
  PRESCRIPTION DRUG and not HUMAN OTC DRUG now vetoes the entity-class branch of availableNoRx, 30
  records. It deliberately does not veto the OTC or supplement-registry branches, which are direct
  evidence about the same product; the 60 records where a prescription-only label and availableNoRx
  still coexist are published rather than silently resolved.
- **Registry conditions were being set by a single sponsor's enrolment list.** A condition now
  counts only where it recurs in at least 2 of a record's stored studies and in at least 5% of
  them, with no exemption for small records.
- **Substring matching.** Terms now match only when neither neighbouring character is a letter or
  digit, so "sleep" no longer matches "asleep".

### Minor findings left open, named not fixed

- 22 strict records have UNAPPROVED HOMEOPATHIC as their only recorded marketing category. They
  reach strict on fields that do not carry the disclaimer, so the text rule does not remove them.
  117 strict records carry that marketing category among others.
- The peptides category inherits four legacy modality mislabels the guard does not catch: Crocin,
  Novobiocin, Streptozocin and Defibrotide are recorded under the peptide modality and none is a
  peptide.
- The vaccine exclusion is incomplete by construction. openFDA `product_type = VACCINE` is not
  transcribed into this database, so only name, modality and pharmacologic-class evidence exists;
  19 records is a floor, not a count.
- 23 suffixed biologics whose unsuffixed stem has no separate canonical record stay in scope, 5 of
  them in broad.
- 8 strict, 68 moderate and 92 broad records carry oncology words in their indication text. They are
  in scope on purpose, because prose names a condition and cannot establish a drug class.
- Category matching remains a keyword screen over recorded text. A match means the recorded text
  contains the term. It is not a finding, a use or an effect, and no page should present it as one.

## Phase 2 — inventory (2026-09-03)

Script: `scripts/biohacker-pivot/phase2-inventory.ts`. Outputs
`data/biohacker-pivot/phase2-records.ndjson` and `data/biohacker-pivot/phase2-summary.json`; the
sliced distributions come from `npx tsx scripts/biohacker-pivot/phase2-inventory.ts --report`. The
scan read 148,733 stored study rows and 101,831 fetched registry payloads, all 101,831 of which map
to a canonical record. 3,569 records have a ClinicalTrials.gov snapshot and 5,369 have a PubMed
clinical-trial hit.

### Per-type coverage across the corpus

| Data type | Records | Share of 9,852 |
| --- | ---: | ---: |
| evidenceTier | 5,717 | 58.03% |
| evidenceCeiling | 3,563 | 36.17% |
| outcomeMeasures | 3,543 | 35.96% |
| trialFailures | 2,136 | 21.68% |
| humanDoseStudied | 2,073 | 21.04% |
| kinetics | 1,405 | 14.26% |
| interactionPathways | 757 | 7.68% |
| regulatoryDivergence | 0 | 0.00% |

Two of those figures need their qualification stated alongside them.

`evidenceTier` at 5,717 counts the tier PUBMED_TITLE_ABSTRACT_MENTION_ONLY, which means only that a
clinical-trial-typed paper mentions the recorded name in its title or abstract. The figure that
rests on a registered study is 3,566 records, 36.20%. The tier distribution across the corpus is
NONE_STORED 4,135, PUBMED_TITLE_ABSTRACT_MENTION_ONLY 2,151, HUMAN_RCT 3,297, HUMAN_INTERVENTIONAL
224, HUMAN_OBSERVATIONAL 45.

`humanDoseStudied` at 2,073 rests on corroboration, not on a single parsed mention: 2,003 records
where the intervention name the snapshot matched is name-related to the record itself, 43 with two
or more trials, 27 with a recorded dose schedule. 2,129 records have attributed dose text at all;
365 have dose text in their trials with none attributable to them, 56 were refused because a single
trial named no matching intervention, and 13,908 study-record pairs carry dose text that was never
attributed. Every dose string is a verbatim slice of registry free text describing what a trial says
it gave. None is a recommendation.

`kinetics` counts a record holding any of seven stored pharmacokinetic values — half-life, tMax,
metabolism, protein binding, bioavailability, elimination, volume of distribution. Testing only the
first three had undercounted it by 208 records.

### Distribution of the count of 8

No record reaches 8, because `regulatoryDivergence` has zero records corpus-wide. The observed
maximum is 7, so the practical scale is 0 to 7 and a record at 7 holds every type that exists.

| Types held | All 9,852 | strict (166) | moderate (619) | broad (803) |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 4,039 | 0 | 0 | 1 |
| 1 | 2,205 | 14 | 28 | 41 |
| 2 | 54 | 0 | 1 | 2 |
| 3 | 827 | 21 | 36 | 60 |
| 4 | 845 | 34 | 79 | 119 |
| 5 | 795 | 65 | 165 | 232 |
| 6 | 564 | 21 | 147 | 175 |
| 7 | 523 | 11 | 163 | 173 |
| 8 | 0 | 0 | 0 | 0 |
| **median** | **1** | **5** | **6** | **5** |
| **mean** | 1.948 | 4.464 | 5.334 | 5.133 |

The corpus-wide distribution is bimodal with a near-empty bucket at 2. The 4,039 records holding
nothing correspond closely to the 4,135 at tier NONE_STORED, and the 2,205 holding exactly one type
to the 2,151 whose only signal is a PubMed title-or-abstract mention. Types arrive in groups: a
registered study usually delivers an outcome measure, an enrolment ceiling and a stopped-trial
reason together, so records rarely sit at exactly two.

The one broad record at zero is `donislecel`. Its only registered study is EXPANDED_ACCESS, which
phase 1 counts as a stored human study and the phase 2 tier ladder does not name. That is a
definitional disagreement between the two scripts, left visible rather than smoothed over.

### Per-type coverage inside each slice

| Data type | strict (166) | moderate (619) | broad (803) |
| --- | ---: | ---: | ---: |
| evidenceTier | 166 (100%) | 619 (100%) | 802 (99.9%) |
| outcomeMeasures | 152 (91.6%) | 588 (95.0%) | 756 (94.1%) |
| evidenceCeiling | 152 (91.6%) | 589 (95.2%) | 758 (94.4%) |
| humanDoseStudied | 118 (71.1%) | 509 (82.2%) | 623 (77.6%) |
| trialFailures | 108 (65.1%) | 452 (73.0%) | 569 (70.9%) |
| kinetics | 32 (19.3%) | 340 (54.9%) | 381 (47.4%) |
| interactionPathways | 13 (7.8%) | 205 (33.1%) | 233 (29.0%) |
| regulatoryDivergence | 0 | 0 | 0 |

Evidence-tier mix per slice:

| Tier | strict | moderate | broad |
| --- | ---: | ---: | ---: |
| HUMAN_RCT | 147 | 577 | 738 |
| PUBMED_TITLE_ABSTRACT_MENTION_ONLY | 13 | 29 | 43 |
| HUMAN_INTERVENTIONAL | 5 | 11 | 18 |
| HUMAN_OBSERVATIONAL | 1 | 2 | 3 |
| NONE_STORED | 0 | 0 | 1 |

The depth reversal is the main measured result of phase 2. Strict is a subset of moderate and holds
less stored data per record than the set that contains it: median 5 against 6, mean 4.464 against
5.334, kinetics on 19.3% of records against 54.9%, interaction pathways on 7.8% against 33.1%. The
cause is in the phase 1 entity-class table. The two gates strict adds — obtainable without a
prescription, and a recorded self-use route — remove approved medicines and biologics, which are
the records that carry stored pharmacokinetics and label-derived interaction rows, and keep
over-the-counter and supplement records, which mostly do not. Choosing strict buys audience fit and
pays for it in page depth.

### What is NOT derivable

These are absences in the stored data, not gaps to fill by inference. Each is a wanted output.

- **Animal-only and in-vitro-only evidence tiers.** ClinicalTrials.gov registers human studies only
  and the stored PubMed query is filtered to `clinical trial[pt]`. No preclinical study store exists
  in the database or on disk. A record at NONE_STORED has no human study in stored data; that is not
  evidence that only animal work exists, and no page may say either.
- **Whether a substance has been studied in humans, for a record whose only signal is a PubMed
  count.** The stored query is `"<name>"[tiab] AND clinical trial[pt]`, so a hit means a
  clinical-trial-typed paper mentions the recorded name somewhere in a title or abstract. This is
  the tier of records named Muscle (36,401 hits), Lung (31,289), Brain (30,542), Complex, Date, Eye,
  DNA, Air, Capsule and Cream; 56 single-word-named records carry counts of 1,000 or more.
- **Whether a stopped trial failed.** `overallStatus` and `whyStopped` are the sponsor's own words.
  No judged outcome is stored for any study, so the field is a stopped-trial reason and never a
  failure finding.
- **Regulatory divergence between jurisdictions.** Every regulatory-approval record carries
  `source.kind` FDA_DRUGSFDA. `productVariants.jurisdiction` is US_FDA on all 2,242 rows and
  `costContext.jurisdiction` is US on all 626. The registry file holds 2,505 entries, 2,504 of which
  agree with the database. No EMA, MHRA, PMDA, Health Canada or TGA record exists anywhere, so the
  two-jurisdiction test cannot be met by any record and this data type is structurally empty. It
  should be dropped from the page design, not left as a slot that will never fill.
- **A studied dose as a stored structured value beyond 27 records.** `recorded_background` dose
  schedules exist for 27 records, all with basis LABEL_SCHEDULE and none TRIAL_PROTOCOL. Every other
  dose string here is parsed out of free-text arm and intervention prose by this script, not by the
  registry.
- **A complete study list for the 197 records whose snapshot hit the 250-study cap.** Their
  per-record aggregates are computed over the stored subset and flagged `storedListTruncated`.
- **Route, for 3,639 records.** Unrecorded stays unrecorded. Nothing in the pipeline infers that a
  supplement is taken orally.

### Stopping-rule check

**Phase 1 rule — moderate under 150 or over 2,000 compounds.** Moderate is 619. The rule does not
trip. Strict at 166 also sits inside that band; broad at 803 does too.

**Phase 2 rule — median compound with 3 or fewer of the 8 data types.** This one needs both
readings reported, because they disagree.

| Set measured | Median of 8 | Rule |
| --- | ---: | --- |
| All 9,852 canonical records | 1 | trips |
| broad (803) | 5 | does not trip |
| strict (166) | 5 | does not trip |
| moderate (619) | 6 | does not trip |

Over the whole corpus the median record holds one data type and the rule trips. Over any of the
three candidate sets it holds five or six of a possible seven and the rule does not. The corpus-wide
figure is the honest description of the 9,852 records and the reason the pivot narrows at all; it is
not a measurement of the set that would be published. Both are reported and neither is presented as
the answer. The rule says report the measurement and wait, so no phase 3 work starts here.

### Awaiting a decision

Felix chooses strict, moderate or broad. The trade is legible from the tables above: moderate is
3.7 times the size of strict and deeper per record on every data type, and it gets there by
admitting approved prescription medicines and 82 route-unrecorded supplements. Strict is the only
slice where every record is both obtainable without a prescription and recorded as self-administered.


## What the slices miss — the audience's own list (2026-09-03)

The repository carries 74 hand-curated slugs in `scripts/seed-data/performance-and-grey-market.ts`,
`controlled-psychoactive.ts` and `peptide.ts`. They are the closest thing to a ground truth for
what this audience researches, and the verification pass removed them from the availability signal
so that no slice could be reached through the list itself. Measured against the slices:

| Reach                                  | Count of 74 |
| -------------------------------------- | ----------: |
| In strict                               |           5 |
| In moderate                             |          18 |
| In broad                                |          54 |
| In no slice at all                      |      **20** |

The 20, with the gate each fails: bromantane, cardarine, DMT, follistatin-344, GHB, isotonitazene,
JWH-018, kratom, ligandrol, LSD, morning glory, muscimol, phencyclidine, phenibut,
phenylpiracetam, stenabolic, testolone and YK-11 all carry **no US label and no stored search
hit** (the `noLabelNoStoredSearchHit` exclusion, and therefore no `humanStudy`); sermorelin has no
stored human study; ketamine is excluded as an anaesthetic.

What this says about the method, not about the compounds: every stored evidence source in this
corpus is a US-regulatory or exact-name registry source — FDA labels, a ClinicalTrials.gov
exact-intervention-name match, and a PubMed search restricted to `clinical trial[pt]`. Compounds
that live in the general literature, in forums and in grey-market supply, and that have never held
a US label or been an exact registered intervention name, are invisible to it by construction. A
corpus derived purely from these sources will under-represent the biohacker canon; the 18 are the
measured size of that blind spot inside the one curated list available.

The 18 reaching moderate: adrafinil, anastrozole, boron, cannabidiol, clomiphene,
dextromethorphan, dulaglutide, exenatide, fentanyl, liraglutide, methamphetamine, methylene blue,
modafinil, nitrous oxide, noopept, semaglutide, testosterone enanthate, tirzepatide.
