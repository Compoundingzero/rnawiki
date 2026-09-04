# Gate 2 — the seven samples through the real template (2026-09-05)

Gate 2 asks one question the earlier gates could not: when the corpus is rendered by the dossier
template a reader actually sees, are the pages distinguishable from each other? Gate 1b measured a
text model — the fields a renderer would print. This measures the HTML the server sends, extracted
by one extractor, against the HTML the live site sends today for the same medicines.

**Verdict: PROCEED.** The indexable set's positional nearest-neighbour median is **0.191** at the
matched size (0.196 over all pairs), inside the <= 0.20 target on the first measurement, so no fix
was applied and nothing was re-measured. Lexical 0.355 (<= 0.40). The most-repeated question string
sits on 2 of 521 pages, 0.38 % against a 30 % limit. Suppression held: no suppressed page renders or
holds a seed 1, 2 or 6 block. The frozen home search bar measures identical to the committed
baseline at 1440, 375 and 320 px.

Three defects found along the way must be fixed before the Phase 5 load. None is an overlap
problem; they are listed at the end and one of them stops the Tier 1 load outright.

## What was measured, and on what

| Step | What |
| --- | --- |
| Database | a disposable local database, migrated 0001-0025, carrying the legacy `drugs`, `inventory_resolutions` and `medicine_slug_redirects` rows copied from the working database so slug assignment meets what Phase 5 will meet. Dropped at the end. |
| Load | `scripts/corpus-20k/load/materialise.ts`, `--indexable-threshold 11` from `gate1b/summary-v3.json`. All of Tier 1 (1,498) and Tier 2 (4,724) plus Tier 3 batch 1 (250), which carries both Tier 3 samples. **6,472 pages in 58.7 s - 110.3 pages/second**, against the deployment plan's floor of 1. |
| Build | an isolated copy of the worktree with its own `.next`, `next build` (90.9 s) then `next start` on port 3111. |
| Extractor | `scripts/corpus-20k/gate2/extract.py`, the same code on our HTML and the live site's: the visible text of `<main>`, with every `<nav>` (the contents rail included), the `<footer>`, the `details.cd-contents` control that replaces the rail below 1024 px, and the definitions link removed as declared markup. Nothing else is dropped - a glyph a reader can see stays in the text and is classified as markup instead. |
| Harness | `scripts/corpus-20k/overlap/measure.py` unchanged (seed 20260904, 128 permutations, 5-gram shingles), exhaustive on every set. Size-matched folds by `scripts/corpus-20k/gate2/folds.py`, reusing `gate1b_v3.fold_membership`. |
| Draws | the same seeded 803 and 324 draws Gate 1b used, read from `data/corpus-20k/render/v3/`. |
| Live baseline | `https://rnawiki.com/d/<slug>` for the draws' existing slugs, 4 concurrent, 820 requests, all 200, logged to `logs/live-requests.ndjson`. |

## Before and after, at matched sizes - the like-for-like figure

The same medicines, the same extractor, the same scorer. 604 of the 803-draw and 252 of the
324-draw carry a slug that still resolves on the live site; those are the rows compared.

| Measure | Live HTML (604) | New HTML (604) | Live HTML (252) | New HTML (252) |
| --- | ---: | ---: | ---: | ---: |
| Positional nearest neighbour, median | **0.799** | **0.279** | **0.786** | **0.265** |
| Positional p90 | 0.895 | 0.468 | 0.877 | 0.493 |
| Pages above the 0.20 target | 604 of 604 | 542 of 604 | 252 of 252 | 195 of 252 |
| Pages above 0.30 | 604 of 604 | 262 of 604 | 252 of 252 | 94 of 252 |
| Lexical nearest neighbour, median | 0.697 | 0.470 | 0.680 | 0.446 |
| Shared-word share, median | 0.796 | 0.236 | 0.786 | 0.224 |
| Random-pair positional, median (null) | 0.615 | 0.091 | 0.607 | 0.089 |
| Median tokens per page | 6,800 | 611 | 7,174 | 634 |

Two pages drawn at random from the live site already share 61 % of their 5-gram positions. Two
drawn from the new corpus share 9 %. The live figure is what a page built out of the same standing
prose for every medicine looks like; the new figure is what a page built out of that medicine's own
recorded values looks like.

## The measured sets

| Set | Pages | Positional median | p90 | Lexical median | Shared-word share |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Indexable pages, size-matched (324-page folds)** | 521 | **0.191** | 0.505 | 0.355 | - |
| Indexable pages, all pairs | 521 | 0.196 | 0.675 | 0.364 | 0.443 |
| Indexable pages, prose only (declared markup removed) | 521 | 0.121 | 0.509 | 0.433 | 0.389 |
| Seeded 803 draw (the indexed *candidate* population) | 803 | 0.301 | 0.484 | 0.490 | 0.232 |
| Seeded 324 draw | 324 | 0.277 | 0.494 | 0.463 | 0.230 |
| Live baseline, 803 draw's surviving slugs | 604 | 0.799 | 0.895 | 0.697 | 0.796 |
| Live baseline, 324 draw's surviving slugs | 252 | 0.786 | 0.877 | 0.680 | 0.786 |

The 803 and 324 draws are drawn from the 5,883 *candidates* (Tier 1 or Tier 2 with at least one
question), most of which fall below the threshold and will carry `noindex`. They sit at 0.28-0.30
because a page holding three fields has little of its own to say. That is the honest limit already
recorded in Phase 2b and it is why the threshold exists: the 521 pages that will actually be indexed
sit at 0.191.

Two controls ran with every set. Replacing each page's text with another page's ("control:other")
lifts the indexable set to 0.563; filling each page with more of its own text ("control:self")
leaves it at 0.195. The harness is reading the pages, not the shape of the corpus.

## Shared-word share, stated plainly

The statistic counts the share of a page's word occurrences whose word appears on more than 90 % of
the other pages in the same set. It rises as a set gets smaller and more uniform in subject, so it
is only readable against a comparison.

* Like for like, on the same 604 medicines: **0.796 live -> 0.236 new**.
* On the 521 indexable pages taken alone: 0.443, of which 0.146 is ordinary English function words
  (`the`, `of`, `and`, `in`, `to`), 0.111 is the digits of the ISO dates every provenance anchor
  prints, and 0.181 is the vocabulary of the subject (`recorded`, `human`, `trial`, `evidence`,
  `study`, `clinicaltrials`). Only 183 distinct words out of 55,306 clear the 90 % bar; on prose
  alone, 72.

That is not "near zero", and it will not be: 521 pages about clinical evidence share the words
clinical evidence is written in. What the number can show is whether the pages repeat *sentences*,
and the Phase 2d standing-sentence audit already put that at zero over 5 % of pages.

## The seven samples

| Role | Slug | URL | How it was chosen | Fields | Questions |
| --- | --- | --- | --- | ---: | ---: |
| Data-rich Tier 1 | `metformin` | `http://localhost:3111/d/metformin` | joint-highest present-field count in Tier 1 (15 of 15), alphabetically first of the two | 15 | 17 |
| Mid Tier 1 | `cysteamine` | `http://localhost:3111/d/cysteamine` | at the LONGEVITY median of 10 present fields; the median-count page with the most question blocks | 10 | 14 |
| Withdrawn arc | `amlodipine` | `http://localhost:3111/d/amlodipine` | highest present-field count among withdrawn pages that are not suppressed, so the dated arc leads | 13 | 16 |
| Suppression class | `sirolimus` | `http://localhost:3111/d/sirolimus` | classes S1, S3, S4, S6 - not S10; the supervision block is ordinal 0 | 15 | 18 |
| Tier 2 standard | `carbidopa-levodopa` | `http://localhost:3111/d/carbidopa-levodopa` | at the Tier 2 median of 3 present fields; the median-count page with the most question blocks | 3 | 8 |
| Tier 3 experimental | `cdx-3379` | `http://localhost:3111/d/cdx-3379` | highest present-field count (7) among the loaded Tier 3 development pages | 7 | 6 |
| Tier 3 near-empty stub | `1-2-distearoyl-sn-glycero-3-phosphocholine` | `http://localhost:3111/d/1-2-distearoyl-sn-glycero-3-phosphocholine` | lowest present-field count (1) among the loaded Tier 3 stubs | 1 | 0 |

### Per sample: payload and text density

Crawl figure = visible characters of the whole document / HTML bytes (baseline 8.3 %). Live figure =
`body.innerText / documentElement.outerHTML` in Chromium after hydration (baseline 0.07 %).

| Sample | HTML bytes | Visible chars | Crawl | Reading column only | Live (browser) | RSC payload bytes | RSC share of HTML |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| metformin | 228,526 | 29,629 | 12.96 % | 11.68 % | 3.90 % | 144,278 | 63.1 % |
| cysteamine | 126,721 | 13,439 | 10.61 % | 8.61 % | 5.50 % | 79,393 | 62.6 % |
| amlodipine | 189,418 | 22,152 | 11.70 % | 10.23 % | 4.50 % | 119,929 | 63.3 % |
| sirolimus | 241,711 | 32,815 | 13.58 % | 12.30 % | 4.00 % | 152,071 | 62.9 % |
| carbidopa-levodopa | 71,846 | 6,048 | 8.42 % | 6.18 % | 5.50 % | 44,414 | 61.8 % |
| cdx-3379 | 61,531 | 4,003 | 6.51 % | 4.91 % | 4.40 % | 38,250 | 62.2 % |
| 1,2-distearoyl...phosphocholine | 28,206 | 1,383 | 4.90 % | 3.52 % | 3.20 % | 16,644 | 59.0 % |

Across the 521 indexable pages the crawl figure runs 4.90 %-14.20 %, median **11.16 %**, against the
8.3 % baseline. The live figure is 3.2 %-5.5 % against a 0.07 % baseline - a 45x to 79x rise, and
the honest reason is that the old page hides most of its text behind hydration while this one ships
it in the HTML.

The RSC payload is 59-63 % of every document. Every dossier component is a server component and the
only client code is the rail marker, which takes no props, so the payload carries the page's own
markup once rather than a second JSON copy of its data. It is not duplicated data, but it is still
three fifths of the bytes; reducing it further is the disclosure spec's open item, not a Gate 2
blocker.

### Per sample: interface checks at 320 px and desktop

| Check | Result |
| --- | --- |
| Heading order | h1 -> h2 (question) -> h3 (revealed group) on all seven at both widths; exactly one h1; no level skipped |
| Body contrast | minimum **16.15:1** (target >= 7:1) |
| Grey rows contrast | minimum **4.87:1** (target >= 4.5:1) |
| Keyboard | every `<details>` summary, contents link and provenance anchor took focus with a visible ring; 0 required targets without one |
| Badge below 480 px | in flow, not in the left margin, on every sample that has blocks |
| Empty elements | **0** across the 521 indexable pages and the seven samples |
| Placeholder phrases | **0**. Four pages match a placeholder regular expression on verbatim source text - "robust null epigenetic findings", "PKA-null cells", "Telomere Biology Disorders (TBD)" - and none is a placeholder |
| Vendor / retailer / affiliate hosts | **0**. Every outbound host is a source register: europepmc.org, clinicaltrials.gov, platform.opentargets.org, open.fda.gov, precision.fda.gov, ebi.ac.uk, mor.nlm.nih.gov, pubchem.ncbi.nlm.nih.gov, phenome.jax.org |
| No horizontal overflow at 320 px | **fails on 2 of 7** - see defect 3 |

### Suppression

`sirolimus` carries classes S1, S3, S4 and S6; its supervision block is ordinal 0, the first thing
after the header, and it is a question block rather than a banner as the template requires. Across
the whole load, **0** suppressed pages hold a seed 1, 2 or 6 row and **0** render one. The two
`time-to-signal` blocks that exist anywhere in the corpus sit on two unsuppressed pages (threonine);
the 281 audited pages carrying an `n-of-1` block are all unsuppressed.

### Questions

7,163 question rows over the 521 indexable pages, **7,098 distinct strings**. The most-repeated
string appears on 2 pages - **0.38 %** against R7's 30 % limit. The 65 repeated strings are all name
collisions between two pages that carry the same display name (`identity/slug-collisions-pass2.json`
already lists 214 of these for review), not a template repeating itself. Two templates fire on 100 %
of indexable pages (`human-data`, `trial-size`); R7 binds strings rather than templates, and that is
reported for information exactly as Gate 1b reported it.

### The frozen home search bar

Measured on `/` at three widths and compared with the committed baseline.

| Width | Bar measured | Bar baseline | Input measured | Input baseline | Max difference |
| --- | --- | --- | --- | --- | ---: |
| 1440 | x456 y369 528x60 | x456 y369 528x60 | x498 y381 371.77x36 | x498 y381 371.77x36 | **0.00 px** |
| 375 | x16 y269.5 343x52 | x16 y269.5 343x52 | x64 y279.5 188.89x32 | x64 y279.5 188.89x32 | **0.00 px** |
| 320 | x16 y292.25 288x52 | x16 y292.25 288x52 | x64 y302.25 133.89x32 | x64 y302.25 133.89x32 | **0.00 px** |

Every number is identical. The DOM path differs from the recorded string: the baseline reads
`body>div[3]>main>div>section>div[1]>div>input[1]` and the input now sits at
`body[1]>div[2]>main[1]>div[1]>section[1]>div[2]>div[1]>input[1]`. Part of that is notation (the
baseline prints an index on every step; two ancestor indices genuinely differ). `app/page.tsx` has
no diff in this worktree and the `HomeSearch` wrapper, bar `<div>` and `<input>` JSX have no diff
either - the only change in that file is the search hook and the dropdown list that renders *below*
the bar. Since the bar's own markup is untouched and every measured box is identical to the
hundredth of a pixel, this is reported rather than treated as a STOP; a person who wants the path
string to match as well should re-record it against this build.

## Defects that must be fixed before the Phase 5 load

**1. The Tier 1 load crashes on a NUL byte.** `materialise.ts` writes synonym names verbatim, and
three canonical records carry a NUL inside a name that came through the FDA UNII names file:
`K1:JCX84Q7J1L` Celecoxib (`celecoxib 200mg (celebrex<NUL> 200, pfizer, usa)`), `K1:C6547J35OD`
Rabies vaccine (`verorab<NUL>ae`) and `K2:TVYLLZQTGLZFBW-UHFFFAOYSA-N` Tramadol
(`tramadol 100mg (trama<NUL><NUL>, global napi, giza, egypt)`). PostgreSQL rejects the byte:
`invalid byte sequence for encoding "UTF8": 0x00`. Celecoxib is Tier 1, so the production Tier 1
load aborts at batch 4 of 6. This Gate 2 load ran against a copy of `canonical.ndjson` with the
three sequences stripped, held inside the isolated build root and nowhere else; the corpus data on
disk is unchanged. The fix belongs in the loader (reject or strip the control character where the
row is built, and count it), not in the data - the sequences look like a mangled registered-trademark
sign and a person should see them.

**2. The loader drops the augmented fields, and the threshold no longer means what Gate 1b
derived.** The Phase 2b augment wrote `doseStudied` at the *top level* of a fields record rather
than inside its `fields` object. `page-text.ts` promotes any top-level entry that looks like a field
(`{state: ...}`) into the page's fields; `materialise.ts` reads `record.fields` only. Consequences:
`doseStudied` never reaches `page_fields`, so a value the page-text model measured is not on the
page; and `present_field_count` disagrees with Gate 1b's `presentFields` on 3,528 pages, so
threshold 11 admits **521** pages here where Gate 1b counted **638** (Tier 1 617 + Tier 2 21 - and
no Tier 2 page can reach 11 on a 9-field model, which is itself a sign the two counts are not the
same quantity). The measurement above is therefore conservative: the indexed pages carry *less*
than Gate 1b assumed and still clear 0.20. Fix the loader to read the augmented entries the same way
the renderer does, then re-derive the threshold on one definition.

**3. Horizontal overflow at 320 px on 2 of the 7 samples.** `carbidopa-levodopa` reaches a document
width of 545 px and `sirolimus` 411 px against a 320 px viewport. The overflowing elements are
`.cd-row-label` (a long unbroken revealed-row label) and a `<dd>` in the synonyms list (a long
unbroken recorded name). Both are long tokens with no wrap opportunity, so this is a CSS fix
(`overflow-wrap: anywhere` on the row label and the synonym values) rather than a template change.
CLAUDE.md makes no horizontal overflow at 320 px a standing requirement, so this blocks the deploy
even though it is not an overlap problem.

## Observations, not blockers

* `amlodipine` is flagged withdrawn while its own arc prints Health Canada `APPROVED` alongside the
  US `Discontinued` rows. R11's rule sets the flag only where no authorised entry remains, so this
  row is worth a spot check before Tier 1 goes out.
* On the S10 (unknown-class) pages the supervision block asks "Why does *X* carry a supervision
  requirement?" and then answers "No regulator classification is recorded". The question asserts a
  requirement the body then withdraws. The question-derivation amendment already handles this for
  stubs; the same wording should apply to a non-stub page whose only class is S10.
* Seed 13's revealed rows repeat entries - `cdx-3379` lists Seribantumab, Sapitinib, Patritumab
  deruxtecan, Elgemtumab and MM-111 twice inside one `<details>`. The row cap is applied after the
  duplicates rather than before.

## Files

* `data/corpus-20k/gate2/summary.json` - every figure here, machine-readable
* `data/corpus-20k/gate2/html-text/crawl.ndjson` - 1,508 pages of our extracted HTML text
* `data/corpus-20k/gate2/html-text/live.ndjson` - 820 pages of the live site's extracted HTML text
* `data/corpus-20k/gate2/logs/live-requests.ndjson` - every live request, status and byte count
* `data/corpus-20k/gate2/runs/*/` - one directory per measured set (summary, per-page, above-target)
* `data/corpus-20k/gate2/browser-checks.json` - the Chromium checks and the frozen-bar measurement
* `data/corpus-20k/gate2/html-audit.json` - per-page text-to-HTML, RSC bytes, empty elements, blocks
* `data/corpus-20k/gate2/lists/*.tsv` - the sample, indexed, draw and live-baseline slug lists
* `scripts/corpus-20k/gate2/` - the extractor, fetcher, fold scorer, HTML audit and browser checks
