# Registered trials, and what "empty" turned out to mean

Two objectives, run 2026-09-03: turn 148,733 bare trial identifiers into something a reader can use,
and resolve the 6,760 records that carry no sourced statement. Both were run audit-first, because
both carried a decision gate that the data could trigger. Both gates fired.

## Gate 1: the registry stores no results

The snapshot dated 2026-09-01 holds 601,158 studies. The exact-name pass matched 148,733 study rows
across 3,569 records, which is 101,831 distinct studies once the same study matched to several
records is counted once.

| Distinct matched studies        |  Count | Share |
| ------------------------------- | -----: | ----: |
| Results posted on the registry  | 30,556 | 30.0% |
| Completed, no results posted    | 39,496 | 38.8% |
| Ongoing                         | 12,847 | 12.6% |
| Stopped, withdrawn or suspended | 13,470 | 13.2% |
| Status unknown                  | 10,754 | 10.6% |

Your gate was "fewer than 30% with data dense enough to be useful, escalate". The measured figure is
30.0%, and it is the wrong 30%: **`hasResults` is a flag, not a result.** The stored fields are
registration facts only, because that is what the fetch requested: title, status, phase, dates,
enrollment, sponsor, conditions, eligibility, primary outcome measure and time frame, design, and
whether results were posted and when. No effect sizes. No comparator arms. No adverse-event tables.

So Phase 1's definition of valuable cannot be met from what is stored, for any trial. Meeting it
would need a second ingestion of the registry's results sections, and then Phase 4 would ask for a
sentence saying whether the medicine worked. This project routes that judgement through reviewed
publication, not through a generated sentence, so Phase 4 as written was never available. What was
available is the registration record itself, printed honestly.

Reach, if results were fetched: 2,431 records have at least one results-posted study, 1,767 have
three or more, 1,138 matched studies but none with results, and 6,283 matched nothing at all. A
results ingestion would therefore reach at most 24.7% of the corpus.

## What shipped instead: the registration record

A "Registered clinical trials" section renders the stored registrations as structured facts, ranked
results-posted first, then completed, then by enrollment, then by start date, capped at eight with
the remainder counted. It reaches 3,569 records and adds a median 1,312 words to each.

Every line is a registry fact in ordinary language: what the study looked at, its phase and design,
how many people and whether that count is actual or anticipated, who could take part, when it ran,
what it set out to measure quoted exactly, who ran it, its status, and whether results are posted
with the date. The framing says once that registration says nothing about whether the medicine
worked, that results where posted live on the registry rather than here, and that absence from an
exact-name pass is not evidence that no study exists.

Registered titles and sponsor stopping reasons are deliberately not rendered: they routinely contain
"efficacy" and "lack of efficacy", which would put a characterisation of a result on the page. Both
stay in the API record and the stored row.

## Gate 2: the empty records are mostly empty for good reason

6,760 of 9,852 canonical records carry no sourced statement in any of the six statement sections.
Every one was triaged against the openFDA archive; the per-record result is in
`docs/audits/empty-records/medicine-class-triage.ndjson`.

For the 973 empty approved medicines:

| Why it is empty                                         | Records | Share |
| ------------------------------------------------------- | ------: | ----: |
| No label in the archive names it, under any form        |     532 | 54.7% |
| Not a medicine: an ingredient of non-prescription goods |     279 | 28.7% |
| Named only alongside other actives on every label       |     114 | 11.7% |
| The extractor read a label and recorded nothing         |      27 |  2.8% |
| A single-substance label with no read section           |      21 |  2.2% |
| A salt or ester form carries the label                  |       0 |  0.0% |

Your gate was "Tier A below 80% data availability means the sources are incomplete". Tier A sits far
below it, and the reason is not a missing feed. The 532 are medicines like alfentanil, vidarabine,
guanadrel and polythiazide: 414 carry a Drugs@FDA application number, so they were approved, and no
current label exists because they are no longer marketed in this form. An archive of current labels
cannot describe a medicine that no longer has one.

The salt-and-ester hypothesis was worth testing and was wrong. The name normaliser already strips
common salt words on both sides, so a label filed under "alfentanil hydrochloride" would already
have matched. A fallback was built anyway, verified against 94 suffixes drawn from the archive's own
trailing tokens, and it resolves 0 of the 532. It stays in, inert, for a future archive.

## What changed in the corpus

**284 records left a class they did not belong in.** A cosmetic peptide or a sunscreen filter reaches
this corpus with an approved status because openFDA files cosmetics as over-the-counter drug labels
listing every declared ingredient. New rule 5 reclassifies a record as an ingredient when all four
stored facts agree: an approval status, every label naming it is non-prescription, no label declares
it alone, and no Drugs@FDA application exists. Each condition protects a real medicine, so a
discontinued drug with no label, a substance sold only inside prescription combinations, and a
monograph over-the-counter active with its own label all keep their class.

**+156 sourced statements**, from extractor rules that were refusing real text.

| Section           | Before | After | Change |
| ----------------- | -----: | ----: | -----: |
| Recorded uses     |  2,912 | 3,017 |   +105 |
| Safety statements |  1,642 | 1,693 |    +51 |
| Others            |  6,115 | 6,115 |      0 |

The rules fixed: a heading printed twice and stripped once, leaving "& USAGE SECTION Formulated for
susceptibility to colds"; the singular Drug Facts heading "Use" left in front of the use; a 40
character floor that refused whole published indications; and prescribing-information indications
printed as a bulleted list with no full stop until the list ends, which the sentence splitter
returned as one over-long sentence and the excerpt cap then refused.

Beyond the additions, 123 existing statements had a heading correctly stripped from them, and
disclaimers that had been recorded as uses were dropped, including "Pediatric use information is
approved for Celgene Corporation's Vidaza".

**Only 8 records stopped being empty.** That is the honest headline. The extractor gains landed
mostly on records that already had a statement, and 6,752 records remain empty.

## A regression caught in review

The extractor work reached this branch unreviewed, because the stream that wrote it stopped when the
session limit was hit. Regenerating the corpus against it showed the list re-splitting applied to
boxed warnings as well as indications, and a boxed warning's own capitalised title is the first thing
in that section. Abrocitinib's boxed warning became "WARNING: SERIOUS INFECTIONS, MORTALITY,
MALIGNANCY, MAJOR ADVERSE CARDIOVASCULAR EVENTS, and THROMBOSIS…" in place of "Discontinue treatment
with CIBINQO if serious or opportunistic infection occurs." Ten records were affected.

The re-split is now opt-in and enabled only for indications and contraindications, which do print
bulleted lists. The count fell from ten to two, and both survivors are false positives of the
detector: real contraindication sentences that open with a brand name in capitals.

## What was not done, and why

- **No trial narratives.** Phase 4 asked for a sentence saying what a trial showed against its
  comparator. That is medical interpretation, and this project publishes it only through reviewed
  publication.
- **No results ingestion.** It would reach a quarter of the corpus and feed a surface that cannot
  characterise what it fetched.
- **No suppression.** Removing the 6,752 empty records from the index was one of the options you
  listed. They are not proposed for removal here: they are honest, correctly-stated records of what
  is and is not recorded, and the decision to publish or withhold them is yours rather than a
  measurement's.
