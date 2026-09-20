# What the 6,513 human-result-card count means

Read-only audit, 2026-09-19. The count comes from `data/dossier-v4/corpus-inventory.json`, built 2026-09-12 by `scripts/dossier-v4/validate-corpus.ts`. That script records `model.humanResults.cards.length`, **not** the number of verified study results displayed on today's `/d` page.

## Reproducible counts and their limits

```bash
node --input-type=module -e "import {readFileSync} from 'node:fs'; const d=JSON.parse(readFileSync('data/dossier-v4/corpus-inventory.json','utf8')); const a=d.pages.filter(p=>p.humanResultCards>0); console.log({builtAt:d.builtAt,pages:a.length,cards:a.reduce((n,p)=>n+p.humanResultCards,0),withCorpus:a.filter(p=>p.hasCorpusPage).length,withoutCorpus:a.filter(p=>!p.hasCorpusPage).length,cardsWithoutCorpus:a.filter(p=>!p.hasCorpusPage).reduce((n,p)=>n+p.humanResultCards,0),overCurrentSixCardCap:a.filter(p=>p.humanResultCards>6).map(p=>p.slug)})"
node --import tsx scripts/research/coverage-queue.ts --limit 0
```

| Inventory measure                                                  |                     Count |
| ------------------------------------------------------------------ | ------------------------: |
| Pages with at least one historical card                            |                     6,513 |
| Historical card slots summed across those pages                    |                    31,220 |
| Of those pages, with a local corpus page                           |                     1,139 |
| Of those pages, without a local corpus page                        | 5,374 (25,519 card slots) |
| Pages with a reviewed claim                                        |                         0 |
| Merged background envelopes with `pivotalResults`                  |                        18 |
| Merged background envelopes with a stored `trialContext` extension |                         0 |

These are **artifact counts**, not a count of current eligible cards. The stored inventory has eight cards for `tenofovir-disoproxil`, while the current builder caps at six. More importantly, the current `loadDossierV4Inputs` supplies `roleAggregate: null` when there is no corpus page; the current card builder requires a matching trial-role row. Thus the 5,374 historical card-bearing pages without a corpus page could not pass today's builder through that fallback path. A current count requires rerunning the view-model census against the intended database; the 6,513 figure must not be presented as current rendered evidence coverage.

## Where a card comes from

`buildHumanResults` in `lib/dossier-v4/view-model.ts` starts with `legacyRecord.trials`. It retains a row only when it has a `primaryEndpoint`, a parseable `NCT` identifier, and a role aggregate marking the substance the **experimental intervention**. The role classifier explicitly does not read results; it distinguishes a tested intervention from comparator, background therapy, placebo, observational exposure, and mere mention. The retained card takes its question/outcome _name_ from the legacy `primaryEndpoint`, optional participant count from `sampleSize`, and a ClinicalTrials.gov URL constructed from the NCT number. That URL is tagged `binding: 'record'`, not an immutable result snapshot.

The current `ClinicalTrialRecord` type has no structured condition, formulation, route, comparator, result value, or timepoint. Accordingly, **every card built by this path** sets population, form, route, comparator and duration to “Not recorded…” and the absolute result to “An outcome value is not verified against a study result here.” A `met`/`not_met` flag in legacy data becomes a labelled status, but it is not a source-verified effect estimate. On the requested criterion—specific study **plus** condition **plus** tested form **plus** outcome value—the number supported by this card constructor is **zero**, regardless of how many cards a database contains. Its NCT link is a study locator, not proof that the legacy endpoint wording or result was verified there.

The separate `RecordedTrialSnapshot` path in `lib/dossier-v4/recorded-facts.ts` would require an NCT result, the same-source `trialContext` naming condition, tested intervention, formulation/route, and an inspectable URL. The current merged background corpus has **zero** such context extensions. In the generic dossier branch, `CompassPage` renders a human-results section only for a reviewed scoped result or these trial snapshots; it does not render `humanResults.cards`. The one-slug editorial preview is a separate, hard-coded draft. A separately published programme verdict has its own exact claim/source dependency path and is not counted by this inventory field.

## Three concrete traces

| Record                 | What the older inventory/seed holds                                                                                                                  | What the current card path can establish                                                                                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `metformin`            | Six historical cards. The seed has UKPDS 34 and its supplementary randomisation without NCT IDs, plus two of six trial strings containing an NCT ID. | The non-NCT studies fail the first identifier gate. An NCT-bearing row still needs a matching experimental-intervention role, and the card would still lack structured condition, form and verified outcome value.             |
| `semaglutide`          | Four historical cards; seed trial strings for STEP 1, SELECT, SUSTAIN-6 and evoke each contain an NCT ID.                                            | A registry locator and endpoint title are possible, subject to trial-role matching. The card does not transfer the seed's study-specific population, formulation, comparison, duration or numeric result into verified fields. |
| `tenofovir-disoproxil` | Eight historical cards, but the inventory says no local corpus page.                                                                                 | The current six-card cap and null role aggregate on the no-corpus fallback mean this historical eight-card figure is not a current renderable count.                                                                           |

The correct research next step is to rebuild the census on the intended database, then inspect candidate studies against exact source snapshots and bind condition, intervention/form, comparator, population, outcome value, time and uncertainty. Until that happens, count cards as research leads only. Neither an NCT link nor a role classification should be promoted to a finding or chart.

No product files changed. Awaiting implementation authorization.
