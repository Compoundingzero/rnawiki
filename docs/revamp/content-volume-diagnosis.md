# Content volume on a medicine page

Measured 2026-09-17 against the deployed corpus. This is the open item behind "less is more": a
beginner meets far more sentences than the record justifies, and most of them are the same sentence
repeated.

## What the numbers say

`npm run` script: `scripts/dossier-v4/measure-page-similarity.ts`, sample of 40 medicines drawn by
`md5(slug)` so the sample is stable between runs.

| Measure                                            | Value           |
| -------------------------------------------------- | --------------- |
| Sentences a reader meets per page (audit excluded) | **332**         |
| Boilerplate share (a sentence on >50% of pages)    | **81.5%**       |
| Shared share (>1 page, <50%)                       | 10.3%           |
| Medicine-specific share (exactly one page)         | **8.1%**        |
| Median specificity                                 | **6.1%**        |
| p90 specificity                                    | 12.9%           |

The content is **not** generic in substance. Semaglutide's page carries STEP 1 (14.9% against 2.4%
weight loss), SELECT, evoke/evoke+ and the NAION receipts with real numbers. The problem is volume.

## The actual lever: repetition inside one page

Measuring distinct sentences against total sentences separates "shared template" from "the same
line printed again":

| Page        | Sentences | Distinct | Repeated copies within the page |
| ----------- | --------- | -------- | ------------------------------ |
| metformin   | 1,175     | 724      | **451 (38%)**                  |
| zingiberene | 371       | 280      | **91 (25%)**                   |

The worst offenders on a **thin** record (`zingiberene`, ~5 substance-specific sentences in total):

| Printed | Sentence                                                 | Emitted by                                 |
| ------- | -------------------------------------------------------- | ------------------------------------------ |
| 11×     | "Nothing in this record points to this reason."          | `lib/dossier-v4/view-model.ts:2090`        |
| 9×      | "Where this came from"                                   | `components/dossier/v4/Primitives.tsx:169` |
| 9×      | "No source is stored against this line."                 | `components/dossier/v4/Primitives.tsx:98`  |
| 9×      | "Not recorded."                                          | absence line inside `SectionFrame`         |
| 6×      | "∅ Nothing recorded"                                     | `Absence` in `Primitives.tsx`              |
| 6×      | "RNAWiki holds nothing here and says so rather than..."  | `Absence` in `Primitives.tsx`              |
| 5×      | "Why it matters."                                        | `components/dossier/v4/Closing.tsx:126`    |
| 5×      | "What would answer it"                                   | `components/dossier/v4/Closing.tsx:128`    |

And on a **rich** record, the whole source citation is reprinted once per receipt: metformin prints
the UKPDS citation block and the Barzilai citation block **13× each**, because every receipt renders
its own `Source` row inside `Closing.tsx:179`.

## Where the emptiness already is handled

`lib/dossier-v4/section-visibility.ts` already hides sections whose state is one of
`no_qualifying_evidence`, `not_applicable` or `feature_not_enabled`, and `WhatIsMissing` names them
once near the foot of the page. So **empty sections are not the problem.**

The problem is one level down: a section that *does* carry entries still prints its scaffolding per
entry, and the view model emits statements whose textual content is a placeholder. The confirmed
source of the most-repeated sentence is a **fallback basis string** at
`lib/dossier-v4/view-model.ts:2090`:

```ts
basis: applies[reason.code] ?? 'Nothing in this record points to this reason.',
```

Eleven statements on a thin record fall through to that fallback, and each one prints its basis
inside its own "Where this came from" disclosure. So the repetition is a property of what the model
emits, not of how a component renders: it cannot be fixed in `components/` without dropping
provenance text.

The section state is computed from whether entries exist, for example
`lib/dossier-v4/view-model.ts:2743`:

```ts
const state: SectionState =
  entries.length > 0 || regulatory.length > 0 ? 'source_checked_draft' : 'no_qualifying_evidence'
```

So a section becomes `source_checked_draft` — and therefore visible — on the strength of entries
whose only content is "Nothing in this record points to this reason."

## Why this is not a cosmetic fix

Extending the existing consolidation from sections to entries changes what a thin record *asserts*.
That is governed by `docs/dossier-v4-plain-language-contract.md`,
`docs/dossier-v4-publication-states.md` and `docs/dossier-v4-medical-safety-gates.md`, and checked by
`npm run check:medicine-content`, `npm run check:copy` and the section/navigator tests. The rule the
codebase holds to is **"unknown is not failure"**: an absence must be kept and consolidated, never
silently dropped. So the change is "print the placeholder once per section and name it in
`WhatIsMissing`", not "stop printing it".

Watch these tests before editing, because they assert on the strings above:

- `tests/e2e/dossier-v4-compass.spec.ts:187` asserts a receipt contains "Role in the trial".
- `tests/e2e/creatine-jargon-explanations.spec.ts:11` asserts a statement has a
  "Where this came from" disclosure.

## Suggested order

1. Consolidate the per-entry placeholders: render `Absence` and the empty-`Sources` note once per
   section with a count, and let `WhatIsMissing` name the section.
2. Group `unknowns.entries` that share one `reason` so the reason prints once
   (`Closing.tsx:121-135`).
3. Cite each source once per page by number, and have receipts reference the number instead of
   reprinting the citation (`Closing.tsx:179-192`).
4. Do not remove the audit layer behind `id="technical-record"` from the page; the measurement
   deliberately excludes it, and it is unique per medicine by construction.

## How to prove it

```bash
# 1. Re-measure. Sample is md5(slug)-ordered, so runs are comparable.
npx tsx --tsconfig tsconfig.render-scripts.json \
  scripts/dossier-v4/measure-page-similarity.ts --sample 40 --label after-volume --concurrency 4

# 2. Compare meanSentencesPerPage, meanSpecificShare and meanSharedShare against the baseline in
#    data/dossier-v4/page-similarity-head-baseline.json.

# 3. Per-page repetition, the measure this document is about:
#    count distinct vs total sentences in the served HTML of one page.

# 4. Corpus validation and the full gate.
npx tsx scripts/dossier-v4/validate-corpus.ts
npm run gate
```

## Target

Fewer sentences per page with a higher specific share, and no sentence printed more than once per
section. Do not chase a boilerplate number down by rewording shared lines per drug: that is filler
with extra steps and defeats the measurement rather than the problem.
