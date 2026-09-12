# Dossier v4 — corpus validation

```bash
npx tsx scripts/dossier-v4/validate-corpus.ts --concurrency 10
npx tsx scripts/dossier-v4/validate-corpus.ts --slug creatine-monohydrate
npx tsx scripts/dossier-v4/validate-corpus.ts --resume --batch-size 500
```

It builds every public page in process rather than crawling over HTTP. A crawl measures the server
as much as the record, and at ten thousand pages the difference is hours against minutes. What a
crawl adds — status codes, headers, rendered markup — is checked separately on a running server for
the representative pages.

Resumable through `--resume`, idempotent, and it exits non-zero when any page has a critical issue.

## What it checks

**Identity and copy.** No internal key, no synthetic shim key, no placeholder printed where a value
belongs, a canonical name, a resolved substance type and availability, and a last-checked value that
is actually a date.

**Publication state.** Only a reviewed page may be indexable. Every other state must carry its
banner. A record with no corpus page may never be indexable.

**Safety.** No wording that a pair is safe together. No amount named in RNAWiki's own voice. No
self-experiment planner on a supervised page, and no amount inside a planner. No conclusion on a
record held for an identity check.

**Evidence.** Every highlighted result has an exact question and an outcome class. No unreviewed
page claims a demonstrated effect. No predicted relationship reaches the public path.

**Navigation.** Every next-question link points at a section the page rendered.

## Results

10,250 public slugs, built from the local database.

| Measure                    | Count  |
| -------------------------- | ------ |
| Pages built                | 10,250 |
| Critical issues            | 0      |
| Pages with any issue       | 370    |
| Pages with no issue at all | 9,880  |

The remaining issues are all `medium`: 335 records whose substance type no recorded field settles,
and 122 whose supply route no register row settles. Both render as honest unresolved states.

## The first run found nineteen critical pages

Worth recording, because two thirds of them were the checker's fault rather than the page's.

| Cause                                                  | Pages | Resolution                                                                        |
| ------------------------------------------------------ | ----- | --------------------------------------------------------------------------------- |
| A label record identifier inside interaction text      | 7     | Real leak. The reader-text guard now removes it.                                  |
| Quoted boxed warnings flagged as dose instructions     | 10    | Checker fault. It now reads RNAWiki's own voice and leaves quotations alone.      |
| The word "null" in "a null result across 157 patients" | 2     | Checker fault. It now looks for a placeholder, not the English word.              |
| Recorded explanations naming an amount inside the hero | 5     | Real. Those sentences are dropped from the hero and kept in the technical detail. |

A checker that reports correct pages is worse than no checker, because it trains you to ignore it.
Both false-positive classes were narrowed rather than suppressed.

## Outputs

- `data/dossier-v4/corpus-validation.json`
- `data/dossier-v4/corpus-validation-summary.md`
- `data/dossier-v4/corpus-inventory.json`, `.csv`
- `data/dossier-v4/{reviewed,preliminary,limited,correction-hold,pipeline-failure}-slugs.txt`
