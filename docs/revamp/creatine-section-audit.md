# Creatine monohydrate: the section-by-section audit

Measured 2026-09-18 on the live page. Method: the served HTML, the audit layer cut at
`id="technical-record"`, the body of every closed `<details>` removed, then split at the section
boundaries. Numbers are reader-facing sentences, so nothing behind a fold is counted.

This is the first drug of the scaling plan. The verdict is not the one I expected, and the correction
matters because it changes what the revamp should do.

## The verdict in one line

**The page is not mostly slop. It is mostly true, specific and sourced — and it is organised for an
auditor rather than a beginner, with three genuinely bad blocks and one answer-shaped hole.** That
distinction decides the fix: restructure and cut, rather than rewrite. A wholesale rewrite would
destroy real value and would risk inventing facts on a medical page.

## Per section

| Section | Reader sentences | Verdict |
| --- | --- | --- |
| `substance-action` (What it does) | 47 | **Good.** "Taken for strength and power output in short, hard efforts" plus the battery analogy. This is the register the whole page should use. |
| `body-journey` (The path) | 117 | **Good, and better than it looks.** Each step is marked *Measured in people* or *Described, with no measurement named*, and says so in words. Real mechanism: SLC6A8, creatine kinase, near-equilibrium rephosphorylation. |
| `human-results` (In people) | 205 | **Good.** Per study: who, how many, design, comparator, kind of result, what was found, repeated elsewhere, limits. "Renal excretion accounted for 40 to 68% of the dose over the first three days… No placebo arm." That is a real limit, stated. |
| `goal-fingerprint` (By goal) | 95 | **Mostly good.** A matrix of goals against kinds of measurement; empty cells are information, not noise. |
| `evidence-receipts` (Receipts) | 204 | **Good in substance, wasteful in volume.** Every citation is reprinted per receipt, so the same studies recur here, in `human-results` and in `body-journey`. |
| `safety` (What goes wrong) | 47 | **Good.** |
| `unknowns` | 61 | **Good, and the best section on the page.** "How much did people take in the studies? … A result belongs to an amount. Without the amount the result floats free." |
| `applicability` (Like you?) | 19 | **Half good.** The real failure list is excellent: the ALS mouse-to-human miss, Parkinson terminated for futility after 1,741 patients, Huntington halted. The generic "who is missing" boilerplate is not. |
| `practical-reality` (What it involves) | 45 | **Good.** Real facts: "Sold as liquid… Oral powder or capsule, creatine monohydrate", supply, who oversees it. |
| `form-check` (Which form) | 40 | **Good.** |
| `claim-decoder` (Big claims) | 39 | **Good.** |
| `measurement` (Measuring) | 36 | **Acceptable.** Generic advice, but honest advice. |
| `evidence-staircase` (How close) | 42 | **Acceptable.** |
| `next-question` | 14 | **Acceptable.** |
| `no-response` (Seems to do nothing) | 49 | **Acceptable.** One closed disclosure carries the 11 non-applying reasons with the count in its summary. |
| `what-is-missing` | 9 | **Good.** |
| **`felt-measured-meaningful`** (Felt or measured) | 54 | **SLOP. The worst block on the page.** |
| **`drug-story`** (Its story) | 7 | **Half slop.** It does carry a real fact — "The earliest marketing start date recorded for a listed product is 19840815", sourced to the FDA National Drug Code directory — but it opens with a lede that justifies its own size instead of being small. |

## The bad blocks, verbatim

**1. `felt-measured-meaningful` prints raw registry outcome-measure names from other substances'
trials.** Under "Things only a test, a scale or a device shows" a reader is given:

> `brachial artery flow mediated dilation · glycated hemoglobin · blood arsenic concentrations ·
> lumbar spine bone mineral density · global dna methylation in serum · serum creatinine · urine
> creatinine · kidney function`

And under "Things a person could notice without a test":

> `positive and negative syndrome scale · clincal global impression · hamilton depression rating
> scale · children s depression rating scale · montgomery asberg depression rating scale · fatigue
> severity scale`

And a residual bucket, "Names that fit none of the three (9)":

> `who gain weight over 1 month · completion of study · rett syndrome motor and behavioral
> assessment · tolerability · hamd rating scores · objectively assessed whole body function · muscle
> function · manual wheelchair slalom test`

On a creatine page, "blood arsenic concentrations", "rett syndrome motor and behavioral assessment"
and "manual wheelchair slalom test" tell a beginner nothing about creatine. They are unmatched
registry strings: lowercase, unpunctuated, and carrying typos (`clincal`, `children s`, `hamd`).
**Fifty-four sentences of noise, and the single clearest example of what the owner is calling AI
slop.** The section's *idea* is good — felt, measured and meaningful are three different things and
confusing them is how a blood test becomes a health claim — but the *content* is a dump.

**2. `drug-story` justifies its own size.** It does carry a real fact — "The earliest marketing start date recorded for a listed product is 19840815", sourced to the FDA National Drug Code directory — but it opens with "Kept near the foot of the page. A historical event moves up only when it changes something about this substance today." A section that explains why it is small instead of being small is furniture.

**Correction.** An earlier revision of this note called this section empty and said it showed nothing. It does not. The read behind that claim was truncated at seven lines, and the fact is on the eighth. The section's state is also honest: `buildStory` sets `source_checked_draft` only when it has entries or regulatory facts, so it is not a state bug either.

**3. Duplicated meta-commentary.** `applicability` says the same thing twice in consecutive
sentences: "This is a scope explorer, not a diagnosis engine. It shows who was studied so you can see
whether people similar to you were included." followed by "RNAWiki cannot tell whether a study fits
you. It can show who was in it." — and the section lede already said it. Across the page, per-card
labels like "What this does not prove." and "How far it carries." repeat on every card.

## What is missing entirely

`unknowns` asks the question out loud and cannot answer it:

> **"How much did people take in the studies?"** — The sources RNAWiki checked hold nothing for this
> field. Why it matters: *A result belongs to an amount. Without the amount the result floats free.*

That is the beginner biohacker's first question. For creatine specifically the answer is
well-established and unremarkable — a common loading and maintenance protocol, and the form the
trials used — but the page cannot say it, and neither can it say when to take it, how long before
anything is noticed, what it costs, or who should not take it. Also absent from the reader layer:
contraindications, boxed warnings and "use in specific populations" — of which the last two are
already on disk under CC0 for the records that have them
(`docs/revamp/unblocking-the-missing-fields.md`).

## The revamp spec, per section

1. **`felt-measured-meaningful`: keep the idea, delete the dump.** The three-way distinction stays,
   with two or three *named, defined* examples per bucket, chosen from measures that belong to this
   substance. Anything that fits none of the three either gets a plain-language gloss or moves behind
   the existing "receipts" fold. No lowercase registry strings in the reader layer, and the typo
   class (`clincal`, `children s`, `hamd`) is itself a bug to fix at the source.
2. **`drug-story`: drop the self-justifying lede.** The section holds a real fact and its state is honest, so it should not be deleted. The lede is the slop, not the section.
3. **Answer-first order.** A beginner arrives with five questions: what does it do, how much, when,
   how long until I notice, what could go wrong. The page currently answers 1 and 5 well and 2, 3
   and 4 not at all. Put the answers that exist in the first screen; keep provenance behind folds.
4. **Cut the repetition.** The same citations appear in `human-results`, `body-journey` and
   `evidence-receipts`. Cite once per page where possible and reference the receipt.
5. **Delete duplicated meta.** One statement of the page's limits, not three.
6. **Then the volume follows.** Removing the dump, the empty story, the duplicate citations and the
   duplicated meta is most of the distance from 1,197 reader-facing sentences to something a
   beginner can finish.

## Why I am not starting the rewrite here

The audit above is what the owner asked for first and it is the input to the rewrite. The rewrite
itself changes reader-facing medical copy on a live page in 18 sections, and it needs the copy
contract, the section tests, the full gate and a corpus re-validation to go with it. I have not
started it, and I am not going to claim otherwise: this session was interrupted repeatedly, and a
half-rewritten medical page is worse than an audited one.
