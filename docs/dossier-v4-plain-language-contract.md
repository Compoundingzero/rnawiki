# Dossier v4 — plain-language contract

Extends `docs/plain-language-content-contract.md`. Where the two differ, the stricter rule wins.

## Who the page is written for

An adult with no formal biology education who has just met the idea of changing their own
physiology. Writing for them means concrete verbs, one idea per sentence, a definition beside its
term, visual causality and a familiar analogy with a stated boundary. It does not mean childish
drawings, a patronising tone, dropped nuance, or any suggestion that a medicine suits a child.

## The five-term pattern

v3 closes a section with four terms. v4 uses five, because readers conflate "this study cannot show
that" with "nobody has measured that". Both are in `lib/dossier-v4/copy.ts` as `TRUTH_TERM_LABELS`.

1. What we know
2. How we know it
3. What this does not prove
4. Why it matters
5. What we still do not know

## Rules a test can check

- No internal key in the reader layer. `lib/dossier-v4/reader-text.ts` renders one in words rather
  than dropping the sentence that contains it, and reports every replacement.
- A canonical record id is replaced, not humanised: there is no reader meaning to recover.
- Sentence length: under 20 words by default, hard fail over 30, inherited from the v3 audit.
- No phrase from `FORBIDDEN_PHRASES`, and no unscoped "safe", "proven" or "works".
- Every analogy carries the place it stops being true, in concepts and in the hero.
- Every state carries a glyph and a word. Colour is never the only signal.
- Every count is pluralised. "1 registered measures" is a defect.
- A statement renders its origin. There is no unattributed sentence in the reader layer.

## Wording that must never appear

- An amount presented as something to take, in any mode.
- A start, stop, dose-change or titration instruction.
- "Safe together", or any claim that a pair of substances is fine.
- An absence turned into reassurance. "Nothing found" always carries "that is not the same as
  showing there is none".
- A spontaneous-report count presented as a rate or a risk.
- A prediction presented as a finding.
- A mechanism presented as a clinical benefit.
- An animal result presented as a human one.
- A community report presented as a general probability.

## The three tiers of a result sentence

A page shows the strongest tier available and says which it is.

1. An approved first-read answer, while its fingerprint still matches the record.
2. The recorded finding closest to something a person would notice, selected by the staircase order
   and labelled as written into the record and not signed off.
3. The contract sentence: "RNAWiki has not yet published a reviewed conclusion for this use."

The tiers are visibly different to a reader. They are not interchangeable, and a page never presents
tier two as tier one.

## Why the tiers exist

Dropping straight from tier one to tier three leaves the first screen of a well-documented
substance saying only that nothing is reviewed, which is true and useless. Tier two says what the
record holds and is exact about what that is worth.
