# Why dossier pages read alike

Measured 3 September 2026, testing one hypothesis: that the 9,852 dossiers are template-generated
with placeholder substitution, and that this is why pages share so much text.

The hypothesis is wrong about the mechanism. The pages are not one skeleton with a name substituted
in. They are mostly fixed explanatory copy, printed identically on every page, over a corpus where
most records have nothing recorded.

Method: one fixed 324-record sample, stratified by evidence depth and drawn proportionally across
entity classes, fetched from the live site. Six independent measurement dimensions, each
load-bearing number re-derived from scratch by a separate adversarial verifier. All 52,326 page
pairs computed exhaustively.

## The test that settles the hypothesis

Masking each record's own name changes median five-gram containment from 0.694 to 0.698, a move of
0.4 points. After masking every name, number, date, registry identifier and digest, all 324 pages
still produce 324 distinct skeletons; the largest group of identical pages is one. Of the 88
sentence skeletons appearing on more than 90% of pages, 83 contain no slot at all.

A slot-filled layer does exist underneath, in the completion resolver's basis sentences, which
interpolate counts, archive dates and identifiers. Its footprint is about 18% of page words, not the
dominant layer.

## What a median page is made of

A median page carries 5,138 visible words.

| Layer                                  | Share of page words |
| -------------------------------------- | ------------------: |
| Appears on more than 90% of pages      |               46.8% |
| Shared with some but not most pages    |               49.8% |
| Appears in a sequence on no other page |                3.4% |

On the thinnest half the record-specific share is 1.2%. Eight sampled pages measure exactly zero.
Roughly 64% of a median page's words match a literal string in this repository's own source.

## Overlap decomposed

| Measure                            |   Raw | After removing text on >90% of pages |
| ---------------------------------- | ----: | -----------------------------------: |
| Lexical, shared vocabulary         | 0.654 |                                0.403 |
| Positional, five-word sequences    | 0.646 |                                0.269 |
| Semantic, embedding cosine         | 0.949 |                                    — |
| Positional, thinnest 30 pages only | 0.917 |                                0.711 |

An out-of-domain English page scores 0.737 cosine against these pages, so 0.949 is genuinely close.
Corpus-wide the overlap collapses when the shared copy is removed, which is what shows it was
scaffolding. At the thin end it does not collapse: what remains is the statements that nothing is
recorded, about 87 absence phrases per page.

The earlier 83.7% figure was directionally right and mis-scoped. It corresponds to records with
three or fewer sourced sections, not to the thinnest half, which measures 0.72.

## Overlap is emptiness, not drug-class similarity

| Pair type                                  | Median overlap | Variance explained |
| ------------------------------------------ | -------------: | -----------------: |
| Both records with 3 or fewer of 20 sourced |          0.860 |                  — |
| Both records with 13 or more of 20 sourced |          0.629 |                  — |
| Same entity class                          |          0.734 |               2.8% |
| Different entity class                     |          0.684 |                  — |
| Page length, shorter of the pair           |              — |              17.8% |

The twenty highest-overlap pairs run 0.968 to 0.976 and every one is a pair of evidence-poor
records. One of them pairs an aflibercept biosimilar with a technetium imaging kit at 0.970: two
substances with nothing in common. Across every band the median count of five-word sequences shared
by exactly two pages and no others is zero. Two aflibercept biosimilars share 8 pair-distinctive
sequences out of 2,473 shared.

Overlap correlates with the pair's evidence depth at -0.77 and with log page length at -0.96. It
falls from 86.4% among pages under 4,000 words to 35.9% among pages over 12,000.

## The corpus underneath

Median record: 5 of 20 evidence-bearing sections, two of which are present on every record
regardless. 6,792 of 9,852 records (68.9%) store no recorded use, mechanism, safety statement,
adverse reaction, pharmacokinetic or population statement. No record carries a reviewed conclusion.
The shortest page in the sample still runs 3,639 words. Visible text is 8.3% of delivered HTML, and
one full crawl of the corpus moves 4.70 GB.

## The measured ceiling

Deleting every sentence shared by at least half the corpus, plus every within-page repetition,
removes 49.1% of a page and moves nearest-neighbour overlap from 0.877 to 0.761. A 5% threshold
reaches 0.647 and no further. A target below 0.35 is reachable corpus-wide, where the measure lands
at 0.269 once shared copy is removed. It is not reachable for the thin half without inventing
content.

## What follows

1. Move the fixed explanatory copy off the dossier and onto one linked explainer page. It is about
   64% of a median page, repeated 9,852 times. This does not make a thin page worth indexing; it
   halves the crawl weight, which is a real constraint at 10,027 URLs.
2. Surface the ClinicalTrials.gov snapshot for the records that matched one. 148,733 stored studies
   holding 4.24 million facts are rendered today as aggregate counts and at most 24 bare registry
   identifiers. Roughly 2,000 records gain substantially; 6,283 matched nothing and gain nothing.
3. Decide what the thin tail is for. For 6,792 records there is nothing to surface, and they will
   not be indexed however the page is arranged. Either accept that, or stop having them compete for
   crawl budget with the records that can win. The second option partly reverses the 2 September
   change that made every record eligible. Eligibility and worth are different problems, and only
   the first has been addressed.

## What was deliberately not done

Regenerating the dossiers with per-record section ordering. It does not reduce shared vocabulary or
meaning at all and barely moves sequence overlap. The fixed 20-section order is enforced by a check
constraint on `dossier_completion_assessments`, drives the completeness state and is exported in the
public dataset. Above all, per-record distinctive mechanism, side-effect profile, trial outcomes and
dosing peculiarities do not exist for 68.9% of the corpus, so producing them would mean writing
medical claims no source supports.

## Not observable from here

Nothing in this document observes Google. The Coverage export holds counts and dates and no URLs,
so it cannot say which pages were rejected or why. Crawl Stats, the example URLs behind each issue,
and URL Inspection on one thin and one rich record would settle it, and all three need the owner's
Search Console account.
