# Content volume on a medicine page

Measured 2026-09-17 against the deployed corpus. The question behind "less is more": does a beginner
meet far more sentences than the record justifies?

## The answer, first

**A beginner meets about 255 sentences per page, and roughly 23 of them are about that medicine.**
That is a real volume problem, and it is smaller than the raw document count suggests.

The instrument used to report 332 sentences per page because it counted the body of every closed
disclosure. A closed `<details>` is a fold, not a paragraph. Measured against the served HTML, 24
`<details>` elements render on a medicine page and **none** carries `open`. Splitting the two:

| Measure                       | Document | Reader-facing |
| ----------------------------- | -------- | ------------- |
| Sentences per page            | 332      | **255**       |
| Boilerplate share             | 81.5%    | 80.2%         |
| Shared share                  | 10.3%    | 10.7%         |
| Medicine-specific share       | 8.1%     | **9.1%**      |
| Specific sentences per page   | 30       | **23**        |

So the fold hides **23%** of the document, not the bulk of it. What is left is still long: 255
sentences of which about 23 are this medicine's own. Most of the rest is fixed furniture — section
headings, the standing line under each heading, and the absence lines — which the measure script
classes as boilerplate on purpose and says is not a defect.

The clear case for the fold mattering: on `zingiberene` the sentence "Nothing in this record points
to this reason." appears **11 times** in the document and **zero** times in front of a reader.
`Personal.tsx:126-143` already gathers all eleven behind one closed disclosure whose summary reads:

> Other reasons RNAWiki checked and found nothing for (11)

That is the codebase's own rule — *unknown is not failure*: the absences are kept and consolidated,
never dropped. A change that rendered only the reasons that apply would delete that line and the
information in it.

## The measurements, for the record

`scripts/dossier-v4/measure-page-similarity.ts`, sample of 40 medicines drawn by `md5(slug)` so the
sample is stable between runs.

| Measure                                            | Value   |
| -------------------------------------------------- | ------- |
| Sentences in the document per page (audit excluded) | 332     |
| Boilerplate share (a sentence on >50% of pages)     | 81.5%   |
| Shared share (>1 page, <50%)                        | 10.3%   |
| Medicine-specific share (exactly one page)          | 8.1%    |
| Median specificity                                  | 6.1%    |

The content is **not** generic in substance. Semaglutide's page carries STEP 1 (14.9% against 2.4%
weight loss), SELECT, evoke/evoke+ and the NAION receipts with real numbers.

Distinct against total sentences separates "shared template" from "the same line printed again":

| Page        | Sentences | Distinct | Repeated within the page |
| ----------- | --------- | -------- | ------------------------ |
| metformin   | 1,175     | 724      | 451 (38%)                |
| zingiberene | 371       | 280      | 91 (25%)                 |

## Why the measurement overstates it

`readerSentences()` in the measure script strips `<script>`, `<style>` and the JSON-LD block, and
cuts the audit layer at `id="technical-record"` so a page cannot score as specific on the strength of
a list of accession numbers. It does **not** skip the body of a closed `<details>`, so every sentence
behind a disclosure is counted as reader text and compared against every other page's.

That is why the biggest "repeated" sentences are the ones a reader never sees:

| Printed | Sentence                                        | Where it lives                                     |
| ------- | ----------------------------------------------- | -------------------------------------------------- |
| 11×     | "Nothing in this record points to this reason." | closed disclosure, `Personal.tsx:126-143`          |
| 9×      | "Where this came from"                          | the disclosure summary itself, `Primitives.tsx:169` |
| 9×      | "No source is stored against this line."        | inside that disclosure, `Primitives.tsx:98`         |
| 13×     | the same journal citation                       | one per receipt, `Closing.tsx:179-192`              |

The disclosure **summaries** are the one honest part of that list: they are visible, and they repeat
across statements by design, because each one labels the provenance of the statement above it.

## What is actually worth doing

- **Do not** strip the collapsed bodies. They carry the provenance a sceptical reader came for, and
  the measure script's own target is the prose a reader meets.
- **Do not** consolidate `no-response` further. It is done.
- If the number matters as a product measure, fix the **instrument** first: have
  `readerSentences()` skip the body of a `<details>` that is not `open`, and re-run. That separates
  "the page is long" from "the page stores a lot behind a fold", which are different findings with
  different fixes.
- The one real candidate left is the per-statement disclosure summary "Where this came from", which
  is visible and repeats. Whether it should read the same nine times on one page is a copy question,
  not a volume one.

## How to reproduce

```bash
# Same command, same md5(slug)-ordered sample, so runs compare.
npx tsx --tsconfig tsconfig.render-scripts.json \
  scripts/dossier-v4/measure-page-similarity.ts --sample 40 --label after-volume --concurrency 4

# Is a disclosure open? On the served HTML:
#   grep -c '<details' page.html        -> 24
#   grep -c '<details[^>]*open' page.html -> 0
```

Two runs are kept beside this note: `data/dossier-v4/page-similarity-content-diagnose.json` (the
baseline quoted here) and `data/dossier-v4/page-similarity-volume-hoist.json`, which is an attempt to
consolidate in `components/dossier/v4/Closing.tsx` that came back **identical to four decimal
places** — the evidence that the repeated sentence is not emitted by that component. That edit was
reverted.
