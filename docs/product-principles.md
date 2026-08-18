# Product principles

Canonical home for what RNAwiki is, what it refuses to do, and how it is allowed to talk.

## The Proof Boundary

Most health coverage, including most "evidence-based" coverage, collapses three things into one
sentence. "BPC-157 heals tendons" is really three claims:

1. **What was measured** — healing outcomes in injured rat tendons, signaling changes in cultured
   cells.
2. **What is inferred** — that the same mechanism produces the same healing in a human tendon.
3. **Where that inference stands** — nowhere near a controlled human trial. No study of any kind
   has measured a human tendon-healing outcome for BPC-157.

The Proof Boundary is the point where direct measurement stops and inference takes over. Making
that point visible on every claim is the whole job.

Every claim is assigned one of eight ordered stages, from biological rationale only to regulatory
evidence, defined with worked examples in
[`docs/evidence-classification.md`](evidence-classification.md). The principle here is narrower:
**the stage is not a verdict on whether the claim is true.** A claim resting on biological rationale
isn't wrong, it's early. A claim with regulatory evidence isn't infallible — regulators approve
defined indications under defined conditions and say nothing beyond that. The stage answers *how far
does the evidence reach*, never *is this a good idea*.

## What this product refuses to do

No dosage calculators, protocol builders, stacking guidance, or procurement/self-use instructions,
anywhere, in any form, ever. This is not a missing feature or a launch-scope decision — it is the
boundary the product exists to hold, and it overrides every other instruction in the repo. If a
claim's `accessRealityNote` starts drifting toward "here's how to get it," that is a defect.

## Claim-centered, not paper-centered

Most evidence summaries are organized around papers, which answers "what has been published?", not
the narrower question a reader arrived with. RNAwiki's unit is instead the **claim**: a specific,
answerable consumer question
(`claims.consumerQuestion` — "Does BPC-157 heal tendons and ligaments faster?", not "BPC-157: a
literature review"). Each claim carries its own direct answer, measured finding, inference, stage
and evidence list. An entity page (`/r/[slug]`) is a collection of claims about one compound, not a
collection of papers, and one paper often appears under several claims, scoped each time to what it
measured.

A claim also moves independently of its entity. New tendon-healing evidence doesn't change
BPC-157's gut-healing claim; they are versioned and reviewed separately (`claims.version`,
`evidence_changes`).

## The reader's one task

RNAwiki is for someone who already met a claim — forum, podcast, label, friend — and wants to know
how solid it is before acting on it or repeating it. They are not auditing methodology and the
product doesn't ask them to. Their one task is testable: **after reading a claim, can they correctly
identify where the evidence stops and the inference begins?**

A reader who finishes BPC-157's tendon-healing claim thinking
"promising in animals, unproven in people" has succeeded, whatever they decide next. One who
finishes thinking "proven to heal tendons" has not. Comprehension testing measures exactly that
clarity, never whether a claim is true — see
[`docs/editorial-methodology.md`](editorial-methodology.md).

## Voice and banned language

**Positioning line:** *See where the evidence actually ends.*

Plain, specific, unhedging about what it doesn't know. RNAwiki never borrows the register of wellness
marketing, because that register is built to produce exactly the confidence collapse this product
exists to undo. Sentence-level rules are in [`docs/writing-style.md`](writing-style.md), enforced by
`npm run check:prose`.

These phrases are banned from all copy — site content, marketing, error messages, admin UI,
user-facing changelogs — verbatim and in close paraphrase:

revolutionary · groundbreaking · unlock · biohack your body · optimize yourself · next-generation
wellness · democratize your health · cutting-edge · breakthrough platform · your health journey ·
science made simple · ultimate guide · miracle

**cure** is banned as marketing language about RNAwiki or a compound's prospects, and allowed only
inside an actual regulatory context, such as quoting a gene therapy's labeled curative-intent
indication.

If a sentence would read naturally on a supplement landing page, rewrite it. The default register
is a regulatory label, not health media.
