# Question derivation rules (R7) — deterministic, value-carrying, no per-page model call

**Status:** designed 2026-09-04 (Fable); executed by `scripts/corpus-20k/questions/derive.ts` (Opus)
over the assembled fields and derived seeds. Output per page: an ordered list of
`{ id, text, badge, block, values, sources }`. The executor also reports the two R7 metrics:
distinct question strings across the corpus, and the most-repeated string's page share (fail above
30 %).

## Principles

1. **A question exists only because a value exists.** Every question template has a _trigger_
   (field states) and _slots_ filled from the compound's own values. No value, no question.
2. **The data shape picks the template, not the compound's class.** The same field in a different
   state yields a different question, so pages with different data differ structurally.
3. **Values go early in the sentence**, so the shared prefix between two compounds' questions is
   short (positional overlap counts shared five-word runs; "{name}" in the first two words breaks
   most of them).
4. **One block per question**; block order follows the data (see §4), never a fixed section order.
5. **Vocabulary is plain in the question**; technical terms live in the revealed rows.

## Slot vocabulary

`{name}` display name · `{organism}` rung name · `{kind}` evidence kind (lifespan/healthspan/
biomarker/surrogate) · `{N}` enrolment integer · `{years}`/`{months}`/`{weeks}` durations chosen
by magnitude · `{endpoint}` verbatim primary endpoint or audience endpoint term · `{n}` counts ·
`{year}` years · `{reason}` registry reason cluster · `{enzyme}` CYP/transporter · `{target}` target
symbol · `{jurisdictions}` list rendered as markup · `{clock}` named clock · `{shape}` dose-response
shape word · `{pathway}` pathway term · `{term}` FAERS term.

## Templates by trigger (base state)

| Block              | Trigger (all must be `present`)                   | Template (choose by shape)                                                                                                                       |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| human-data         | field 5 with N and duration                       | `{name} in people: {N} in the largest trial, {duration} the longest — what was measured?`                                                        |
| human-data-none    | field 2 top rung non-human, field 5 absent        | `{name} has only {organism} evidence — what kind?`                                                                                               |
| ladder             | field 2 with ≥ 2 rungs                            | `From {lowest rung} to {highest rung}: where has {name} shown {kind}?`                                                                           |
| ladder-single      | field 2 with exactly 1 rung                       | `{name}'s only tested organism is {organism} — what did it show?`                                                                                |
| itp                | field 3 tested                                    | `The NIA ITP gave {name} at {dose} from {age} months — did {sex-list} live longer?` (sex list from cohorts; "males", "females", "both sexes")    |
| itp-negative       | field 3 tested, no cohort with a stated extension | `Why did the ITP's {name} cohorts ({dose}, from {age} months) show no extension?`                                                                |
| dose-studied       | registry/label dose text present, organism known  | `{organism} studies of {name} used {dose} — over how long?`                                                                                      |
| stopped            | seed 3 fires                                      | `{n} of {name}'s trials stopped: {reason-list}?` (reasons as the cluster words, e.g. "futility, accrual")                                        |
| stopped-one        | field 11 exactly 1                                | `Why did {name}'s trial {NCT} stop?`                                                                                                             |
| clocks             | field 6 present                                   | `Did {name} move {clock}, and by how much?`                                                                                                      |
| dose-shape         | field 7 hormetic/U                                | `More {name} was worse in {organism} — where did the curve turn?`                                                                                |
| dose-shape-plateau | field 7 plateau                                   | `Where did {name}'s effect in {organism} stop rising?`                                                                                           |
| pathway            | field 8 present                                   | `{name} and {pathway}: what does the source actually state?`                                                                                     |
| kinetics           | field 9 half-life present                         | `{name} has a {half-life} half-life — what does that mean for the studied schedules?` (body: schedules verbatim, no suggestion)                  |
| interactions       | field 10 CYP present                              | `{name} and {enzyme-list}: which other compounds share the pathway?` (rows, R10)                                                                 |
| fasting-exercise   | field 10 fasting/CR/exercise present              | `Was {name} studied with {fasting/caloric restriction/exercise}?`                                                                                |
| biomarkers         | field 12 ≥ 3 terms                                | `Which of {term-1}, {term-2} and {term-3} did {name}'s trials measure?` (top three by frequency; the rest in rows)                               |
| jurisdiction       | seed 17 fires                                     | `Drug, supplement or controlled: what is {name} in {jurisdiction-list}?`                                                                         |
| ongoing            | field 14 present                                  | `{n} trials of {name} are running — which reads out first, and on what?`                                                                         |
| faers              | field 15 present                                  | `What do {n} spontaneous reports say about {name}, and what do they not say?`                                                                    |
| faers-unlisted     | seed 14 fires                                     | `Which reported reactions to {name} are missing from its label?`                                                                                 |
| withdrawn          | CLINICAL withdrawal present                       | `Approved in {year}, withdrawn in {year}: what happened to {name} in {jurisdictions}?`                                                           |
| lineage            | seed 13 fires                                     | `What became of the other {n} compounds aimed at {target}?`                                                                                      |
| evidence-age       | seed 15 fires                                     | `The last human test of {name} finished in {year} — what has changed since?` (body: nothing derived; lists later publications if any)            |
| trial-size         | seed 16 fires                                     | `{name}'s trials enrolled {median} people at the median — is anything large?` (body: largest N and its record)                                   |
| unreported         | seed 12 fires                                     | `{n} completed trials of {name} never posted a result — which ones?`                                                                             |
| provenance         | seed 8 fires                                      | `How did {name} get from {first-year} to {current-state}?`                                                                                       |
| contradiction      | seed 10 fires                                     | `Where do the label and the trials disagree about {name}?`                                                                                       |
| what-would-settle  | seed 9 fires                                      | `Which running trial could settle {name}'s effect on {endpoint}?`                                                                                |
| n-of-1             | seed 2 fires and NOT suppressed                   | `Could one person measure {name}'s effect on {biomarker}?`                                                                                       |
| bioavailability    | seed 1 fires and NOT suppressed                   | `{name} worked by {route} in {organism} — what does the oral form reach?`                                                                        |
| time-to-signal     | seed 6 fires and NOT suppressed                   | `How long did trials of {name} run before an effect on {endpoint}?`                                                                              |
| supervision        | suppressed                                        | `Why does {name} carry a supervision requirement?` (body: the regulator's classification, verbatim, as fact)                                     |
| development-stop   | DEVELOPMENT why-stopped present                   | `Development of {name} stopped at phase {phase} — what did the sponsor record?`                                                                  |
| never-dosed        | DEVELOPMENT ever-dosed false                      | `Has {name} ever been given to a person?` (body: "No registry trial or publication records a human dose" plus the highest non-human rung if any) |
| stub               | Tier 3 with < 3 present fields                    | no questions; a database stub (identity rows, relations, and the sentence "This record holds {n} fields" as markup)                              |

## CLINICAL and DEVELOPMENT additions (2026-09-04)

| Block            | Trigger                                                                                      | Template                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| target-phase     | DEVELOPMENT target + highestPhase, no whyStopped                                             | `{name}, aimed at {target}: reached which phase?`                                                        |
| sponsor-phase    | sponsor + highestPhase                                                                       | `Who carried {name} to phase {phase}?` (plural: `…, and who else?`) — "took" is in the take-family guard |
| mechanism-action | mechanismClass + target                                                                      | `{name} on {target}: which action is recorded?`                                                          |
| indication       | CLINICAL indication present                                                                  | `{name} on its label: approved for what?`                                                                |
| regulatory-only  | regulatory present, no indication                                                            | `Where is {name} approved?` (body: per-jurisdiction rows)                                                |
| trial-history    | trialHistory present, no human-data block                                                    | `{name} has {n} registered trials — at which phases?`                                                    |
| evidence-age     | **removed as a block**; its value renders inside human-data (see derived-content.md seed 15) | —                                                                                                        |

## Order (§4)

Blocks render in this precedence, and only present ones: supervision → human-data / human-data-none
→ ladder → itp → withdrawn → stopped → dose-studied → clocks → dose-shape → kinetics →
bioavailability → n-of-1 → time-to-signal → biomarkers → ongoing → what-would-settle →
unreported → trial-size → evidence-age → faers → faers-unlisted → interactions → fasting-exercise
→ pathway → lineage → jurisdiction → contradiction → provenance → development-stop → never-dosed.
Because most compounds lack most triggers, two compounds rarely share the same sequence, and the
Wikiwand badge numbering (Q1…Qn) restarts per page, so the same block carries a different number on
different pages.

## Amendments after the executor build (2026-09-04)

- **Tails.** A template's value-free tail after its last slot must be at most four words, because
  a longer tail is a repeated five-gram on every page carrying the template (the executor measured
  mean five-gram Jaccard 0.23 on fixtures with the original tails). The executor shortens the
  tails listed above accordingly (e.g. `… the longest — what was measured?` → `… — measured what?`
  is not acceptable English; prefer moving a value into the tail: `… the longest, on {endpoint}?`).
- **Stub precedence.** A page that stubs (Tier 3, < 3 present fields) receives no questions even
  when suppressed; the stub template renders a supervision line as markup when the page's
  suppression classes include any of S1–S9, and the line "No regulator classification is recorded
  for this compound" as markup when the only class is S10. Never a supervision claim without a
  classification to cite.
- **Grammatical number.** Templates with `{n}` carry a singular variant; same trigger, same values.
- **Forbidden words.** "safety" and "efficacy" are permitted (they are registry stop-reason cluster
  words); "safe", "safely", "effective", "effectively" and verb uses of "dose" fail the run.
- **Two slots need fields the models did not name:** `doseStudied` (registry/label dose text with
  its organism) and an approval date for the withdrawn block — both added to `field-models.md`.

## Amendments after Gate 2 (2026-09-05, Phase 5a)

Gate 2 measured the rendered corpus and reported the frames the sentence-level audit could not see:
`posted no result` on 49.6 % of indexed pages, `jurisdictions record no status for` on 32.7 %, and a
constant list of four register codes. The audit was widened from whole sentences to word five-grams
(`data/corpus-20k/render/text/standing-sentences.json`, key `fiveGrams`), with this rule:

> A five-gram is FIXED on a page when none of its five words is a value there — not a word of the
> compound's name, not a slot the derivation filled, and not a word carrying a digit. A gram that is
> fixed on more than 5 % of indexed pages fails.

That reading of the four-word rule is stricter than the tail rule above: it also bites in the
_middle_ of a sentence, and it counts `{name}'s` as a value followed by a fixed `s`, so a template
has three free words after a possessive and four after a plain slot.

**A new block, and one it replaces.** A suppressed page whose only recorded class is S10 (unknown)
has no classification to cite, so it must not be asked why it carries a supervision requirement.

| Block          | Trigger                                 | Template                                                                                                                                                                                                                                                                                            |
| -------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| classification | suppressed, every recorded class is S10 | `What classification does {name} carry?` (body paragraph 1: `No regulator classification is recorded for {name} in {cleared registers}.`; paragraph 2 only where the page holds a regulatory row, carrying that row's recorded statuses as values; the per-jurisdiction statuses are revealed rows) |
| supervision    | suppressed, any class S1–S9             | unchanged; the body quotes the register's classification                                                                                                                                                                                                                                            |

`classification` leads the block order, in `supervision`'s place. Seeds 1, 2 and 6 stay absolutely
suppressed on both.

**Question wordings changed, with the fixed run each one carried:**

| Template          | Was                                                               | Is                                                         |                                   Fixed run removed |
| ----------------- | ----------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------: |
| ladder-single     | `{name}'s only tested organism is {organism} — what did it show?` | `{name} was tested only in {organism} — what did it show?` |                 `'s only tested organism is`, 7.1 % |
| what-would-settle | `Which running trial could settle {name}'s effect on {endpoint}?` | `Which running trial of {name} could settle {endpoint}?`   |          `Which running trial could settle`, 15.2 % |
| unreported        | `Completed but unreported: which {n} of {name}'s trials?`         | `Which {n} trials of {name} posted no result?`             |     `Completed but unreported: which one of`, 8.8 % |
| faers-unlisted    | `Which reported reactions are missing from {name}'s label?`       | `Which {n} reactions does {name}'s label not list?`        | `Which reported reactions are missing from`, 16.5 % |
| pathway           | `What does the source state about {name} and {pathway}?`          | `What is recorded about {name} and {pathway}?`             |          `What does the source state about`, 10.0 % |

**Body wordings changed** (`scripts/corpus-20k/render/page-text.ts`, one builder per template):

| Template                    | Was                                                                       | Is                                                                                                                                                                                                                  |                            Fixed run removed |
| --------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------: |
| trial-history               | `{n} carry a PubMed clinical-trial record`                                | `{n} with a PubMed record`                                                                                                                                                                                          |                                       36.9 % |
| human-data                  | `The last recorded human test completed in {year} ({NCT}).`               | `Last human test completed {year}, {NCT}.`                                                                                                                                                                          |                                       17.3 % |
| ongoing                     | `… are open, the earliest recorded completion {date}.`                    | `… are open; earliest completion {date}.`                                                                                                                                                                           |                                       12.8 % |
| faers-unlisted              | `… are reported for {name} and absent from its label.`                    | `… reported for {name}, absent from its label.`                                                                                                                                                                     |                                       10.3 % |
| pathway                     | `"{sentence}" — the source's own sentence.`                               | `"{sentence}" — where {name} and {pathway} appear together.`                                                                                                                                                        |                                       10.0 % |
| n-of-1                      | `{biomarker} was measured in trials of {name}.`                           | `{biomarker}: measured in {name}'s trials.`                                                                                                                                                                         |                                        6.0 % |
| unreported                  | `{n} completed trials of {name}: no posted result, oldest {date}.`        | `{n} of {m} completed trials of {name} posted no result: {NCT}, {NCT}…`                                                                                                                                             |             `posted no result` frame, 49.6 % |
| indication, regulatory-only | a sentence counting the registers that recorded nothing, then naming them | paragraph 1 names only the jurisdictions that recorded a status, each with the register's record id and date (`US approved (NDA 021995, 2005); CA approved (DIN 02248636, 2026-09-04)`); the rest are revealed rows | `jurisdictions record no status for`, 32.7 % |

**The four never-cleared registers.** UK, AU, JP and SG were never licensed for this corpus, so
their status is unknown on every record. That is a property of the corpus, not a finding about a
medicine: it is stated once, on `/definitions#registers`, and the source list links to it as markup.
`readRegisterStatuses` separates a register that was consulted and recorded nothing from one that
was never consulted, which is what lets a body name the first group and never the second.

**Result of the re-render** (28,943 pages, 5,855 indexed candidates): 0 standing prose sentences,
and 2 fixed five-grams above 5 % — `indicated for the treatment of` (9.4 %) and `is indicated for
the treatment` (5.7 %). Both are inside a quoted FDA label statement, so they are the source's
words rendered verbatim, not a template frame.

## Anti-repetition checks the executor runs

- distinct question strings / pages, and the most-repeated string's share (target < 30 %, expected
  far lower because every string carries `{name}` and at least one value);
- the most-repeated _template_ share, reported for information (a template may be common; its
  strings are not);
- five-gram overlap between question sets of random page pairs (should be near zero, since the
  name breaks runs).
