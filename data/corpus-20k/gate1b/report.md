# Gate 1b — page-text measurement (Phase 2b, stage 3)

**Run 2026-09-04.** Renderer `scripts/corpus-20k/render/page-text.ts`; text at
`data/corpus-20k/render/text/batch-0001…0029.ndjson` (28,966 pages, 29 batches, all checkpointed).
Harness `scripts/corpus-20k/overlap/measure.py`, per-run outputs under `data/corpus-20k/gate1b/runs/`.

## What was measured

The text under measure is what the new dossier delivers as visible words, chrome excluded:

- header — display name, synonyms line, register + last-verified line, identity badge triplet;
- every question block — the question, paragraph 1 (the values sentence), paragraph 2 (the
  qualification), then the revealed rows. The rows sit inside a native `<details>`; the element is
  in the server HTML, so a crawler reads them and they are counted;
- the identifiers panel, the relations rows, the source list;
- on a page with no question, the sentence "This record holds *n* fields" and, where a class
  S1–S9 was matched, the classification line.

Excluded by rule: site header and nav, footer, contents rail, definitions page, licence and
revision lines, and the `<summary>` control label "Show the evidence" — one string repeated on
every block of every page, which is a repeated element and therefore markup.

Revealed rows are capped at 20 per group. That cap is a renderer decision, not a spec figure; it
is recorded here because it moves the word count of trial-rich pages (a page with 250 registered
studies would otherwise deliver 250 rows).

The body rules — paragraph 1 and paragraph 2 for each of the 35 question templates — live in the
same module, so the Phase 4 React block imports the function that produced these words.

## The body rules were rewritten once, mid-stage

The first render wrote a standing explanation into paragraph 2 of every block ("a report count
has no denominator, so it is not a rate", "a classification is a legal status, not a finding").
Measured, that gave a positional median of **0.428** at the 803 draw: the same paragraph, a
hundred times over. The constraint already answers this — *shared sentences on ONE linked page* —
so the standing caveats moved to the definitions page and paragraph 2 became this page's own
values: organism, N, duration, counts, and what the record does not measure. Same render, same
harness: **0.205**. Three further frames were shortened for the same reason (the unreported
block printed the same two cut-off dates on 594 of 803 pages) and corpus-wide snapshot labels
were dropped from provenance anchors, where they identified no record.

## Harness fit

Re-validated at the 803 draw of the rendered text, as R3 requires before any corpus-scale figure
is quoted: positional delta **median 0.0**, p90 0.022203, max 0.104355; lexical median 0.0. The rule is *unfit above 0.02 median delta*. **Fit.**

## Results per set

| Set | Pages | Positional median | p90 | > 0.20 | > 0.30 | Lexical median | Shared-word share |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| (a) indexed set, all-against-all | 4,562 | 0.303 | 0.673 | 3,563 | 2,302 | 0.491 | 0.159 |
| (a) indexed set, size-matched folds | 4,562 | 0.208 | 0.413 | 2,495 | 1,059 | 0.435 | 0.157 |
| (b) matched 803 draw | 803 | 0.205 | 0.415 | 415 | 183 | 0.438 | 0.154 |
| (b) matched 324 draw | 324 | 0.192 | 0.365 | 113 | 51 | 0.417 | 0.163 |
| (c) live baseline, 803 | 803 | 0.647 | 0.793 | 803 | 796 | 0.615 | 0.559 |
| (c) live baseline, 324 | 324 | 0.611 | 0.810 | 324 | 313 | 0.585 | 0.550 |
| full corpus, all 28,966 | 28,966 | 0.711 | 0.800 | 28,107 | 26,382 | 0.672 | 0.337 |
| sensitivity: prose only | 4,562 | 0.324 | 0.757 | 3,266 | 2,420 | 0.519 | 0.048 |

Two labels matter and are not interchangeable.

**Corpus size.** A nearest-neighbour maximum rises with the number of candidates. The same 4,562
pages score a median of 0.303 against 4,561 others and 0.208 inside 803-page folds; nothing about
the pages changed. The null model prices that rise: expected nearest-neighbour positional is
0.284 at 324 draws, 0.366 at 803 and 0.622 at 4,562, against observed 0.192, 0.205 and 0.303. The
pages sit far below the null at every size, so the rise is size, not sameness. Gate 1b therefore
uses the size-matched basis, which is the scale the 0.20 target was set at.

**The baseline is not like-for-like.** Set (c) is built by the committed
`build_validation_corpus.py` over `data/drugs/*.ndjson`, whose text is the record's exported field
paths and values, not rendered page prose. It is the definition the harness was validated on and
it is reproducible, so it is quoted as the before — but a 0.647 → 0.205 move is a change of both
the pages and the text definition, and must never be reported as the effect of the redesign
alone. A like-for-like before/after needs the live pages rendered to HTML, which is Gate 2 work.

## Controls

- `control:other` — positional median 0.546, lexical median 0.480, median tokens 1,209.
- `control:self` — positional median 0.291, lexical median 0.491, median tokens 1,209.

Other-page filler sits at 0.546 and own-text filler at 0.291, against 0.303 observed for the
indexed set at the same scale: padding a page with another page's words roughly doubles the
score, and padding it with its own does not move it. The measure responds to the thing it names.

## Gate 1b — the indexing threshold

Index candidates are the Tier 1 and Tier 2 pages carrying at least one question: **4,562** of the
6,227 Tier 1 + Tier 2 pages. The other 1,665 (1,644 Tier 2, 21 Tier 1) fire no question template
at all and are not candidates.

| Present fields | Pages | Positional median | p90 | Lexical median | Cumulative pages | Cumulative positional median |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 7 | 0.343 | 0.410 | 0.488 | 4,562 | 0.208 |
| 1 | 286 | 0.375 | 0.491 | 0.597 | 4,555 | 0.208 |
| 2 | 374 | 0.281 | 0.399 | 0.521 | 4,269 | 0.204 |
| 3 | 438 | 0.250 | 0.360 | 0.485 | 3,895 | 0.200 |
| 4 | 450 | 0.222 | 0.383 | 0.471 | 3,457 | 0.197 |
| 5 | 371 | 0.216 | 0.319 | 0.445 | 3,007 | 0.192 |
| 6 | 369 | 0.218 | 0.770 | 0.449 | 2,636 | 0.190 |
| 7 | 348 | 0.197 | 0.519 | 0.447 | 2,267 | 0.186 |
| 8 | 374 | 0.196 | 0.449 | 0.426 | 1,919 | 0.182 |
| 9 | 481 | 0.183 | 0.356 | 0.401 | 1,545 | 0.181 |
| 10 | 425 | 0.182 | 0.287 | 0.383 | 1,064 | 0.181 |
| 11 | 166 | 0.182 | 0.300 | 0.322 | 639 | 0.181 |
| 12 | 160 | 0.183 | 0.384 | 0.304 | 473 | 0.181 |
| 13 | 136 | 0.181 | 0.693 | 0.298 | 313 | 0.175 |
| 14 | 153 | 0.170 | 0.287 | 0.289 | 177 | 0.171 |
| 15 | 22 | 0.207 | 0.303 | 0.284 | 24 | 0.207 |
| 16 | 2 | 0.203 | 0.270 | 0.264 | 2 | 0.203 |

**Threshold: 7 present fields.** It is the smallest count whose own bucket median is at or
below 0.20 (0.197) and whose cumulative set keeps the median there
(0.186; lexical 0.377, inside the 0.40 target). Buckets 4, 5 and 6
sit at 0.222, 0.216 and 0.218 — close, and they fail on their own bucket, not on the cumulative set.

- **Indexed: 2,267 pages** — 1,030 Tier 1 and 1,237 Tier 2.
- **Boundary overlap: 0.197** positional at the 7-field bucket (348 pages);
  0.186 across the whole indexed set above it.
- **Tier 2 below the threshold: 1,846** — noindex and out of the sitemap, still reachable
  through browse and search, promotable the moment a field arrives (the promotion rule does not
  move a tier; this is an indexing decision inside the tier, as R15 puts it).
- **Tier 1 below the threshold: 449.** This one needs a decision. R13 deploys Tier 1 first, and
  the promotion rule says a thin Tier 1 page "stays Tier 1 and renders what it holds". Applying the
  measured threshold noindexes 449 of them. They render, they stay reachable, and they are the
  first to promote — but they do not enter the index below seven present fields.

At full indexed-set scale no bucket reaches 0.20; the lowest is 0.208 at 10 present fields. That
figure is reported for completeness and is not the gate basis, per the size label above.

## What the pages above target share

For each page above target, its shared 5-grams with its nearest neighbour, attributed to the line
they came from:

- above 0.20 (2,495 pages): 32.2% mean from lines the template calls markup
  (register/date, badge triplet, identifiers, source list), 26.6% mean from block prose and rows,
  41.2% mean from runs that cross a line boundary;
- above 0.30 (1,059 pages): 23.2% mean markup, 33.0% mean prose, 43.8% mean spanning.

The pages above 0.30 are thin, not templated: median 4 present fields and 257 words, against 6 and
528 across the indexed set. The mechanism is visible in one record — Donislecel, a 102-word Tier 1
page with 3 fields, is the nearest neighbour of 241 pages, because positional overlap divides by
the *shorter* page's 5-grams and 29 of its 101 are header, identifier and source runs. Emptiness
is the overlap, and the threshold is the answer to it.

The prose-only sensitivity run makes the same point from the other side: strip the declared-markup
lines and the shared-word share falls from 0.159 to 0.048, while positional at the 803 draw falls
only from 0.205 to 0.188. Most of the vocabulary the pages share is in rows; most of the
*sequence* they share is not.

## The full corpus, and why Tier 3 stays out of the index

All 28,966 rendered pages: positional median 0.711, median 85 tokens. 18,895 of them carry no
question and render header, one stub sentence, identifiers and sources — near-identical by
construction. Shared-word share by tier: Tier 1 0.073, Tier 2 0.135, Tier 3 0.406. This is the
measured case for R6: Tier 3 stubs are noindex and out of the sitemap, and not robots-disallowed.

## Deferred

**Crawl text-to-HTML is not computable at this stage.** The ratio needs rendered HTML, and the
React template is Phase 4. Deferred to Gate 2, where both figures (crawl: server HTML → text;
live: innerText/outerHTML) are measured against the 8.3% and 0.07% baselines.

## Files

- `scripts/corpus-20k/render/page-text.ts` — renderer and the body rules the template will import
- `data/corpus-20k/render/text/batch-NNNN.ndjson` — `{key, tier, presentFields, text, wordCount, proseText, proseWordCount}`
- `data/corpus-20k/render/pages-*.ndjson` — harness inputs (indexed set, prose-only, matched draws, live baselines)
- `data/corpus-20k/gate1b/runs/*/` — one directory per measured set: `summary.json`, `per-page.ndjson`, `above-target.ndjson`, `run.json`
- `data/corpus-20k/gate1b/summary.json` — every figure in this report, machine-readable
- `data/corpus-20k/gate1b/buckets-matched.json`, `matched-per-page.json`, `page-meta.json` — the bucket analysis inputs
