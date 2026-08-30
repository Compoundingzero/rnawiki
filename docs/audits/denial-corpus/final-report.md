# Denial Corpus remediation — final report

## The short version, for anyone

Imagine a library where every fact has a little sticker showing which book it came from.

We found five problems. The library was telling visitors what to do, when its job is only to say
what the books say. Some of the numbers on the cards were the _wrong_ number copied off the right
page — like writing down how much a measurement wobbles instead of the measurement. When a book said
"this does **not** happen", the card said "this happens". The sign on the door promised one set of
sharing rules and the rulebook inside said another. And nobody was writing down what the librarians
decided, so every time they came back they had to decide the same things again.

Four of those are fixed. The wrong numbers are found and counted and the machine that made them is
repaired, but the cards themselves still need reprinting from the original books, and those books
are not on this computer. So the library is not reopened yet.

---

## 1. What was wrong

| #   | Defect                                                                         | Scale                                                               | Status                               |
| --- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------ |
| 1   | The public API served patient-action instructions and named-treatment rankings | 892 + 1,441 entries over 489 records                                | **Fixed**                            |
| 2   | The first screen printed copied instructions as RNAWiki's own answer           | 629 of 3,640 rendered use lines, plus 194 orphaned footnote markers | **Fixed**                            |
| 3   | The extractor stored dispersions as measurements                               | 23 values; 558 downstream document-votes                            | **Parser fixed · data BLOCKED**      |
| 4   | The number-in-excerpt guarantee compared by substring                          | 3 of 5 call sites, incl. cross-source consensus                     | **Fixed**                            |
| 5   | Denied enzyme roles were published as assertions                               | 1,719 of 2,508 role-bearing counts                                  | **Fixed**                            |
| 6   | Polar surface area omitted sulfur while claiming PubChem parity                | 66 of 144 records                                                   | **Fixed (52 remain, all explained)** |
| 7   | The core data licence contradicted itself                                      | 4 declarations vs the shipped legal text                            | **Fixed**                            |
| 8   | The review loop had no substrate                                               | 2,005 candidates, 0 recordable decisions                            | **Substrate built**                  |
| 9   | Documentation counts had drifted                                               | 6 figures, one wrong by 22×                                         | **Fixed**                            |

## 2. What was fixed

**Public boundary** (`f2c90fa`). `serializePublicDossier` spread the whole dossier and stripped only
the laboratory workflow, so `substitutes.homeRemedies` — 892 imperatives addressed to the reader,
including _"Request that body weight be recorded at each visit"_ — reached the anonymous API.
`homeRemedies` reached no page, because the view model never projected it, so the endpoint was its
only exit. `prosAndCons` reached both. `howItCompares` is retained because it is overwhelmingly a
recorded fact about one trial's own comparator arm, which is a single-programme statement rather than
a comparison RNAWiki is making. Stored rows are unmodified.

**First-screen voice** (`784b8fb`). The heading guard is case-sensitive, and that is load-bearing: a
genuine FDA sunscreen monograph indication contains both "as directed" and "(see Directions)", and a
case-insensitive match would delete it. A label heading survives extraction in capitals; prose does
not.

**Quantity parser** (`7613e7b`). `QUANTITY_SPREAD` is shared by all six quantity patterns, so
`12 ± 5 hours` stores 12. The numeric witness is by-value at all five sites. Digits fastened to an
uppercase name are no longer quantities — the rule keys on **case**, because openFDA genuinely
prints `approximately1 hour` with the space missing in the source document, and a rule keyed on
adjacency would refuse a correct value on the strength of a manufacturer's typo.

**Enzyme polarity** (`8d17237`). 796 asserted / 1,724 denied / 2,365 polarity-not-recorded, counted
separately. `polarityNotRecorded` is a third counter rather than a fold into either, because a role
with unknown polarity may not be displayed as an assertion.

**Polar surface area** (`2080494`). Four sulfur environments priced, each derived arithmetically from
this corpus's own stored PubChem values and cross-checked on a second record. Phosphorus deliberately
**not** priced: the corpus holds one phosphorus record, it does not reconcile, and one unreconcilable
record cannot establish a number.

**Licence** (`43491c3`). Core dataset resolved to CC BY 4.0, matching the legal text that always
shipped. `data/manifest.json` is generated and deliberately not hand-edited; the test reports it as
stale and names the line.

## 3. What data was regenerated

| Artefact                                                | Regenerated            | Note                                |
| ------------------------------------------------------- | ---------------------- | ----------------------------------- |
| `data/agents/enzyme-and-transporter-documentation.json` | **Yes**                | v1.0.0 → v1.1.0, polarity split     |
| The other nine `data/agents/*.json`                     | Re-run, byte-identical | Determinism contract holding        |
| `data/audits/denial-corpus/*`                           | **Yes**                | New; digest `c45775a2…`             |
| `extracted-background.generated.ts`                     | **No — BLOCKED**       | Needs the openFDA archive           |
| `source-consensus.generated.ts`                         | **No — BLOCKED**       | Same                                |
| `molecular-properties.generated.ts`                     | **No**                 | Stereochemistry repair not yet done |

Re-running all ten agents changed exactly one file. That is the determinism contract doing its job.

## 4. What changed for an ordinary reader

The dossier gained a floating control that is the section navigator, the coverage map and the
feedback entry (`817d1ff`). Before it, every recorded-background module was two clicks deep, the
excerpt behind any number three, and the dossier route had **no** floating feedback at all.

Each row states its coverage, computed from the record rather than assumed, so a registry-only row
does not offer twenty-one empty destinations. Where sources disagree the row says **"Sources differ"**
and the closed button carries a count — the first time a source disagreement is visible without
scrolling into the module. Empty sections say **"Not documented here"**, which is a fact about this
corpus rather than about the medicine.

Jumping opens every `<details>` ancestor first, because landing on a collapsed heading reads as a
broken link.

## 5–7. Researchers, chemists, quantitative readers

**Researchers** get 1,724 label-stated _denials_ counted as denials. Nothing else publishes
"labels tested this and said it does not inhibit" as structured data.

**Chemists** get sulfur priced in the polar surface area and, more usefully, an explicit statement of
what is _not_ priced and why. Documentation now records that the corpus holds **3,204** connection
tables with 1,370 carrying stereochemistry — not the 144 that had been the load-bearing argument for
leaving the chemical layer alone.

**Quantitative readers** get a parser that no longer confuses an estimate with its error bar, and a
numeric witness that compares by value. The deeper repair — a typed measurement carrying estimate,
dispersion, interval and sample size — is designed but not built.

## 8. How the engine now remembers

`lib/agents/core/identity.ts` plus migration `0017_agent_review_memory` (replayed from zero on a
disposable database). Two identities: `candidateKey` is stable while the question is the same;
`occurrenceKey` changes when the value, a source, the parser or the corpus changes.

`candidateKey` excludes the question prose. Agent questions embed run-specific counts, so a key
derived from rendered text would change on every corpus refresh and orphan every decision ever made.
That is the one failure that would make the loop look like it works while quietly resetting itself.

Four decision outcomes. `CONFIRMED_AS_RECORDED` is kept distinct from `NOT_A_PROBLEM` because an
extremeness screen has no other way to learn that a flagged value is extreme _and correct_.

**Honest status: the substrate exists and nothing writes to it yet.** The 2,005 candidates are not
imported and there is no review queue. The loop is not closed; it is now possible to close.

## 9. What the agents may and may not learn

A fitted parameter may change **which records reach a human first**. It may never change a recorded
value, resolve a source disagreement, write an explanation, create a verdict, suppress a disagreement
or publish a correction.

Legitimate: suppression of unchanged decided occurrences; empirical precision by reason and version;
score calibration; queue ordering. Forbidden: predicting an unrecorded value, scoring a medicine,
choosing between conflicting sources.

No calibration is fitted yet, because no decisions exist. Until they do the honest display is
"not enough review history to calibrate", never a fabricated precision estimate.

## 10. Metrics

Measured by `npm run audit:denial-corpus`, digest `c45775a2…`:

| Metric                                   |    Before |                     After |
| ---------------------------------------- | --------: | ------------------------: |
| Records                                  |     9,855 |                     9,855 |
| Role counts published as assertions      |     2,508 |                       789 |
| Role counts correctly shown as denials   |         0 |                     1,719 |
| Public patient-action entries            |       892 |                     **0** |
| Public named-treatment rankings          |     1,441 |                     **0** |
| First-screen instruction/furniture lines |       629 |                     **0** |
| Substring numeric-witness sites          |    3 of 5 |                **0 of 5** |
| TPSA records disagreeing >0.5 Å²         | 66 of 144 | 52 of 144 (all explained) |
| Values equal to their own dispersion     |        23 |          **23 — BLOCKED** |
| Records at the interaction cap           |       200 |   200 — not yet addressed |

## 11. Tests and gates

1,733 unit tests across 128 files, up from 1,640 — **93 added**. Typecheck, lint, public-copy scan
(0 hits), Prettier, `drizzle-kit check`, and all 9,855 envelopes validating under the tightened
check. Migration replayed from zero on a disposable database.

## 12. Commits

`a3dfc08` audit · `f2c90fa` boundary · `784b8fb` first screen · `7613e7b` parser · `8d17237`
polarity · `8356910` docs · `b5dd376` review memory · `817d1ff` navigator · `2080494` TPSA ·
`43491c3` licence · `12d1530` worklog · `31cf5d9` gate.

## 13. Deployment

**BLOCKED — deliberately, and this is the right call.**

The archive regeneration has not run, so the 23 dispersion values are still stored and
`source-consensus.generated.ts` still carries them amplified to 558 document-votes. Deploying now
would ship those defects to a much larger audience, because the deploy also multiplies the visible
corpus roughly sixtyfold — production currently serves background modules on 155 pages.

```bash
scripts/background/index-openfda-labels.py <archiveDir> <out.ndjson> <medicineRows.json>
npx tsx scripts/background/build-extracted-background.ts <out.ndjson>
npx tsx scripts/background/build-source-consensus.ts <out.ndjson>
npm run audit:denial-corpus    # valuesEqualToOwnDispersion must read 0
npm run gate
```

## 14. Remaining limitations

- **23 dispersion values stored.** Archive-gated.
- **200 records at the interaction cap**, discarded alphabetically. P-glycoprotein sorts late and is
  preferentially deleted from the medicines that characterised it most thoroughly. Not addressed.
- **43 consensus fields marked disjoint across incompatible units.** The comparability contract is
  designed, not built.
- **No review queue.** The tables exist; nothing writes to them.
- **The third first-screen state** — showing the quoted, source-linked recorded use instead of a
  dead-end fallback — is available on 84% of extracted records and not yet built.
- **Stereochemistry** still stripped from all 144 molecular-property records.
- **`recordedBackground` still absent from the public export.**
- **The e2e navigator journey has not been executed.** Six Playwright tests are written; they need a
  production build. The Browser pane cannot substitute: the dev CSP blocks `eval`, so React never
  hydrates there and no client interaction works for any component.

## 15. Decisions needing Felix or counsel

1. **Licence — decided and implemented as CC BY 4.0**, per the standing instruction. The
   `docs/data-licensing-policy.md` section on source excerpts and on US Government works should be
   read by a lawyer before the dataset is promoted; it is marked as not legal advice.
2. **Deploy ordering.** This report assumes fix-then-deploy. Deploying before the regeneration is a
   defensible choice only if the 23 values are considered less costly than sixty times fewer readers,
   and that trade is Felix's, not mine.
3. **Whether `substitutes` survives at all.** The surgical fix keeps `howItCompares`. A stricter
   reading of boundary 6 would remove the alternatives surface entirely.
