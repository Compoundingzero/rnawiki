# Dossier v4 — the Substance Compass

**Status:** implemented 2026-09-11 behind the `DOSSIER_V4_SLUGS` flag. Not deployed.

## What changed and why

Dossier v3 reorganised the corpus record into eleven reader questions. It is still a narrow column
of question cards fed by the pipeline, and its first screen answers "what does RNAWiki lack" before
it answers "what does this substance do". Measured on the creatine page, the first three readable
answers were an identity sentence, an unreviewed legacy use sentence, and "RNAWiki has not yet
published a reviewed conclusion for this use."

v4 replaces the reader surface with a guided sequence. The first screen answers, in order: what
this changes in a body, why people take it, what happened in people, and the limit that matters
most. Identity metadata is one quiet line above that. Registry metadata is at the foot.

v3 is not deleted. `DOSSIER_V4_SLUGS` is checked before `DOSSIER_V3_SLUGS` in
`app/d/[slug]/route.ts`; unset it and the next request serves v3, unset both and every page is the
corpus document again.

## The five truth lanes

Every section belongs to exactly one lane, and the page never merges two into one sentence.

| Lane                 | What it answers                     | Sections                                                                                                             |
| -------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Body action          | What it changes biologically        | What it does, the path through the body                                                                              |
| Human result         | What happened in people             | By goal, in people, how close, receipts                                                                              |
| Personal reality     | What it would be like to take       | Felt or measured, how long, seems to do nothing, what it involves, what goes wrong, clashes, measuring, alternatives |
| Uncertainty          | What is missing or not transferable | Like you?, which form, big claims, unknowns, its story, what changed, next                                           |
| Community experience | What people report                  | Reports                                                                                                              |

## Section order

`lib/dossier-v4/view-model.ts` holds `COMPASS_SECTIONS` as the single source of this order, and the
navigator, the purpose rail and the tests all read it from there.

1. `substance-action` — what it does in the body
2. `concept-primer` — the words this page needs
3. `goal-fingerprint` — what was measured, goal by goal
4. `human-results` — what happened in people
5. `evidence-staircase` — how close this is to real life
6. `body-journey` — the path through the body
7. `felt-measured-meaningful`
8. `signal-timeline` — how long anything takes
9. `applicability` — were people like you studied?
10. `no-response` — why it might seem to do nothing
11. `practical-reality` — what taking it involves
12. `safety` — what can go wrong
13. `stack` — what it may clash with
14. `form-check` — does the exact form matter?
15. `measurement` — what you could measure
16. `alternatives`
17. `claim-decoder` — claims that go past the evidence
18. `community` — what people report
19. `unknowns`
20. `evidence-receipts` — check any of this yourself
21. `drug-story` — how this medicine reached us
22. `change-history`
23. `next-question`
24. `technical-record` — the full stored record, for auditing

The human result sits ahead of the body path on purpose: a mechanism read first becomes the reason
a reader believes a result they have not seen yet.

## Where every reader sentence comes from

The spine of the surface. Each statement carries one of six origins and the reader is told which.

| Origin                | Meaning                                                                      | Rendered as                             |
| --------------------- | ---------------------------------------------------------------------------- | --------------------------------------- |
| `reviewed_claim`      | A reviewer signed it off in `reviewed_claims`                                | Reviewed conclusion                     |
| `approved_first_read` | A reviewer approved this sentence against this exact record's source surface | Reviewed first-read answer              |
| `authored_record`     | A person wrote it into the curated record with the study named               | Written into the record, not signed off |
| `stored_source`       | Copied from a stored source                                                  | Quoted from a stored source             |
| `derived_count`       | A count of rows RNAWiki holds                                                | Counted from stored records             |
| `contract_sentence`   | Fixed RNAWiki wording                                                        | A fixed RNAWiki sentence                |
| `absent`              | Nothing recorded                                                             | Nothing recorded                        |

Measured on this branch, `reviewed_claims` holds zero rows for every medicine. No v4 page therefore
renders a section in the `reviewed_content` state from a claim, and a unit test asserts it.

The approved first-read answer resolves only while its fingerprint still matches the record's whole
medical and source surface. Two of the four gold records have changed on this branch since their
answers were approved, so those answers correctly stop resolving and the hero falls to the authored
tier under a label that says so.

## Section completion states

Nine, in `lib/dossier-v4/taxonomy.ts`. Every section carries one and every non-rendered section
says which applies: `reviewed_content`, `source_checked_draft`, `no_qualifying_evidence`,
`not_applicable`, `ambiguous`, `awaiting_review`, `source_unavailable`, `feature_not_enabled`,
`pipeline_failure`. `sectionStateFromCompletion` is the only bridge from the v3 vocabulary.

## Learning

`lib/dossier-v4/concepts.ts` holds 23 concepts, each with a beginner definition, one diagram, a
bounded analogy, its prerequisites, a common misunderstanding and a technical definition. A page
names at most four, chosen by a deterministic walk back from what the page actually shows. No model
ranks them. The cap keeps the concept being explained and trims background, so an RNA medicine
teaches messenger RNA and small interfering RNA rather than stopping at "cell, protein, gene".

## Flag and rollback

`DOSSIER_V4_SLUGS` = comma list of slugs, prefixes ending in `*`, or `*`/`all`. The route decides
per request. Migration state is untouched: v4 adds no table and no column, so rollback is unsetting
one environment variable.

Before turning the flag on for a slug, run:

```bash
npx tsx scripts/dossier-v4/check-gate.ts --slugs <slug>[,<slug>…]
```

It reports the seven gates, the origin of each opening statement, and whether the approved
first-read answer still binds. It exits non-zero if any slug is not clear.
