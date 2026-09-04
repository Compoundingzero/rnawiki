# Overlap measure at scale (R3)

**Status:** specified 2026-09-04 (Fable); built by `scripts/corpus-20k/overlap/*` (Opus) in Phase 2,
validated before Gate 1b.

## Definitions (unchanged from the 324-record diagnosis, restated so the new code matches)

- **Text under measure:** the visible text of the rendered page (server-delivered HTML → text
  extraction, the crawl definition), excluding shared chrome (header, footer, rails) which is
  markup by rule. Tokens: lower-cased words, punctuation stripped, numbers kept.
- **Positional overlap** of page A against B: |shared five-word sequences (5-grams)| / |5-grams of
  the shorter page|. A page's positional score is its nearest-neighbour maximum.
- **Lexical overlap:** Jaccard of the two pages' word sets. Nearest-neighbour maximum likewise.
- **Shared-word share:** for each page, the share of its words (tokens) that occur on more than 90 %
  of all other pages; reported as the corpus median and the per-tier median.
- **Controls:** other-page filler (a page padded with text from a random other page of equal length)
  and own-text filler (a page padded with its own text) — never scrambled tokens.

## Candidate generation

MinHash over the 5-gram shingle set (128 permutations, splitmix64(x XOR seed) over the full
64-bit shingle hash — the textbook (a·x+b) mod p family is degenerate at these magnitudes and was
replaced after a test caught it). **Amended 2026-09-04 after validation:** 32 bands × 4 rows
detects at Jaccard ≈ 0.42, not 0.20, so nearest-neighbour candidates use a **cascade** — 32×4,
then 64×2, then 128×1, backfilling only pages left with fewer than 32 candidates — which reached
median delta 0.0 against exhaustive scoring (p90 0.0025, max 0.084 on short pages contained in
long ones). The suspected-missed-merge sweep at ≥ 0.6 uses **64 × 2** (99.8 % recall on the
validation corpus; 16 × 8 recalled 5.6 % and is not used). Candidates are scored exactly. Memory: shingles are hashed to 64-bit
integers, never stored as strings; pages stream from disk in batches of 250.

## Validation before use

The diagnosis's 324-slug list and page texts were never preserved (confirmed 2026-09-04), so
validation runs against an **exhaustive run of the same overlap measure** on a synthetic 324-page corpus
built with the diagnosis's own stratification from the exported records; absolute levels are not
comparable to the diagnosis's figures and are never quoted as reproducing them. Report median and
max delta per measure; **unfit above 0.02 median delta**. Re-validate at the 803 draw before any
corpus-scale figure is quoted, because the 512-member bucket cap engages above ~5,000 pages.

## Reporting rules (corpus size)

Every figure is reported twice: at a matched sample size (the same 803- or 324-record draw as the
baseline, with the new pages substituted) and for the full corpus, labelled. The corpus-size
adjustment: nearest-neighbour maxima rise with the number of candidates; report the expected
nearest-neighbour score under a null model (each page's score distribution across random pairs,
its max over k−1 draws) alongside the observed, so a rise that the size alone explains is visible.
Never compare a 20,000-corpus figure to an 803-corpus figure without the label.
