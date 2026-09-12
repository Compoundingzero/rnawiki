# Plain-language content contract

**Status:** implemented 2026-09-10 as `lib/dossier-v3/copy-contract.ts` (textual checks),
`lib/dossier-v3/claims.ts` (structural checks on a claim draft) and
`lib/dossier-v3/stored-keys.ts` (the fixed reader sentences). The checks run in
`tests/unit/dossier-v3-copy-contract.test.ts`, over every view-model sentence in
`tests/unit/dossier-v3-view-model.test.ts`, and over each rendered gold page in
`scripts/dossier-v3/capture.ts`. They flag; a person fixes the generator or the claim.

## The translation pipeline

1. **Store the exact reviewed technical claim** — a `reviewed_claims` row with its structured
   reading (direction, outcome class, population, causality, uncertainty, magnitude).
2. **Technical explanation** — `technical_version`, written by a person from the source.
3. **Plain-language explanation** — `plain_language_version`, written by a person.
4. **Analogy** — optional `analogy`, only with `analogy_breaks` (database `CHECK
reviewed_claims_analogy_breaks`).
5. **Check that every version preserves** direction, magnitude, population, outcome class,
   uncertainty and causality — `plainVersionViolations(technicalReading, plainReading)` compares
   the two structured readings field by field. A plain version may say less; it may never say more.
6. **Reject a simplified version that strengthens or broadens** — `validateClaimInput` returns
   every violation, and the draft is not written.
7. **Review according to risk tier** — `risk_tier` ∈ standard | elevated | high. Elevated
   (prescription-only, boxed warning, injectable) and high (controlled, withdrawn, teratogen)
   tiers need the review transaction before any sentence renders; the view model renders only
   `reviewer_state = 'reviewed'` claims whatever the tier.

No language model is in this pipeline. RNAWiki software never writes a sentence about a medicine;
it checks, stores and renders sentences a person wrote or a fixed template that names its fields.

## Writing rules

- One idea per sentence. Default under about 20 words; 30 is the hard limit for authored text
  (`SENTENCE_SOFT_LIMIT`, `SENTENCE_HARD_LIMIT`). Verbatim quotations are shown as quotations and
  are exempt from the limit but are never the first sentence of a block.
- Define a technical term beside its first use, not in a remote glossary. Outcome and evidence
  classes render as `EvidenceLabel`s whose definition opens inline.
- Verbs, not noun stacks. Numbers as natural frequencies or absolute differences where the source
  gives them; a relative effect is never shown without absolute context when it exists
  (`validateClaimInput`: `effectScale = relative` needs `absoluteEffect`).
- Never replace an uncertain statement with a confident analogy. Every analogy carries "Where this
  breaks".
- Never remove a necessary warning for readability. Never infantilise. Never hype.
- Every major section follows the truth pattern: **What we know · How we know · What we do not
  know · Why it matters** (`TruthPattern` component).
- One optional teach-back check per page, never a quiz wall (`TeachBackSection`).

## The status vocabulary

Only the six `CLAIM_STRENGTHS` phrases may describe evidence status, each scoped to a use and a
population in the same sentence. "Safe", "proven" and "works" are refused without scope
(`findUnscopedCertainty`).

## Forbidden phrases (`FORBIDDEN_PHRASES`)

supercharge · unlock · hack your biology · biohack your · game changer · AI-powered · revolutionary
· cutting-edge · seamless · actionable insights · well-positioned to benefit · clinically proven ·
proven safe · completely safe · 100% safe · no side effects · miracle · breakthrough · optimize /
optimise your · boost your. Additions the medical-safety review recommends and that the next
revision adds to the list: anti-aging / anti-ageing (unscoped), longevity drug, extends lifespan
(unscoped), reverses aging, recommended dose, optimal dose, take X mg, suitable for children.

## Fixed reader sentences (verbatim, furniture)

Above any spontaneous-report count, in this order (`SPONTANEOUS_REPORT_FRAMING`):

1. These are reports people sent to a regulator. They do not show the medicine caused the reaction.
2. Nobody counted how many people took the medicine and reported nothing.
3. The same event can be reported more than once, and many reports are incomplete.
4. News coverage, lawsuits and new warnings change how often people report.
5. A count is not a rate and not a risk.

Interaction absence: "No interaction found in {registers} as of {date}. Not finding one is not the
same as showing there is none."

No reviewed conclusion: "RNAWiki has not yet published a reviewed conclusion for this use."

Registry count qualification (until roles are classified): "These counts include studies where
{name} was a comparison treatment, a background treatment or an exposure in an observational study,
and the longest window may be a planned end date. Trial roles have not yet been classified for this
record."

## The clinician-question pattern (prescription and supervised medicines)

Questions to ask · What to bring · What clinicians commonly monitor (only when a source is stored)
· Warning signs named by the regulator (label text, quoted) · Why the evidence may not apply ·
Closing line: "RNAWiki records evidence. It does not say whether this substance is right for you."
No start, stop or dose-change instruction is ever generated (`measureFrom` in the view model
refuses the single-person plan for prescription, controlled, withdrawn and investigational
substances and for anything the identity stage could not class).

## Machine checks, and where each runs

| Check                                 | Code                                  | Runs in                                    |
| ------------------------------------- | ------------------------------------- | ------------------------------------------ |
| Internal keys never in copy           | `findInternalKeys`                    | unit tests, view-model test, page capture  |
| Forbidden phrases                     | `findForbiddenPhrases`                | same                                       |
| Unscoped certainty                    | `findUnscopedCertainty`               | same                                       |
| Sentence length                       | `sentenceStats`                       | same (warn at 20, fail at 30 for authored) |
| Undefined acronyms                    | `findUndefinedAcronyms`               | page capture (reported per page)           |
| Plain ≤ technical                     | `plainVersionViolations`              | claim validation                           |
| Strength cap                          | `maximumClaimStrength` + SQL CHECK    | claim validation, database                 |
| Analogy needs "where this breaks"     | `validateClaimInput` + SQL CHECK      | claim validation, database                 |
| Framing above counts                  | `dossier-v3-phase0-generator.test.ts` | unit test                                  |
| n-of-1 absent on supervised medicines | `dossier-v3-view-model.test.ts`, e2e  | unit and browser tests                     |

Readability metrics flag problems; they never replace human review.
