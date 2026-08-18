# Product principles

## The Proof Boundary

Most health/performance coverage — including most "evidence-based" coverage — collapses three
distinct things into one sentence: what an experiment actually measured, what a person concludes
from that measurement, and how confident that conclusion should be. "BPC-157 heals tendons" reads
as one claim. It is really three:

1. **What was measured** — in this case, healing outcomes in injured rat tendons and signaling
   changes in cultured cells.
2. **What is inferred** — that a similar mechanism would produce a similar healing effect in an
   injured human tendon.
3. **Where the evidence for that inference currently stands** — nowhere near a controlled human
   trial. No study of any kind, controlled or uncontrolled, has measured a human tendon-healing
   outcome for BPC-157.

The Proof Boundary is the point in that chain where direct measurement stops and inference takes
over. RNAwiki's whole job is to make that point visible, for every claim, every time, rather than
letting a plausible mechanism read as an established outcome.

Concretely, every claim on the site is assigned one of eight ordered stages
(`lib/evidence.ts`, `PROOF_BOUNDARY_STAGES`, weakest to strongest):

1. Biological rationale only
2. Cell evidence
3. Animal evidence
4. Observational human evidence
5. Uncontrolled human evidence
6. Controlled human evidence
7. Independently supported controlled human evidence
8. Regulatory evidence

Full definitions and worked examples are in
[`docs/evidence-classification.md`](evidence-classification.md). The principle that matters here is
narrower: **the stage is not a verdict on whether the claim is "true."** A claim resting on
biological rationale alone isn't wrong — it's early. A claim with regulatory evidence behind it
isn't infallible — regulators approve for defined indications under defined conditions, and the
approval says nothing beyond that. The Proof Boundary answers one question only: *how far does the
evidence currently reach*, not *is this a good idea*.

## Claim-centered, not paper-centered

Most evidence summaries are organized around papers: a list of studies, each with an abstract, a
sample size, a conclusion. That structure answers "what has been published?" It doesn't answer the
question a reader actually showed up with, which is usually narrower and more specific — "does
this help tendon healing," not "what has been published about this compound."

RNAwiki inverts the organization. The unit of the product is the **claim** — a specific,
answerable consumer question (`claims.consumerQuestion` in the schema: "Does BPC-157 heal tendons
and ligaments faster?", not "BPC-157: a literature review"). Every claim carries its own direct
answer, its own measured finding, its own inference, its own Proof Boundary stage, and its own
list of evidence sources, each tagged with how it relates to the claim (`supports`, `contradicts`,
`limits`, `contextualizes` — see `lib/evidence.ts`). An entity page (`/r/[slug]`) is a collection
of claims about one compound or treatment, not a collection of papers about it. A paper can, and
often does, appear as evidence for more than one claim about the same entity — its relevance is
scoped to the specific thing it measured, not treated as a blanket endorsement of everything else
said about that entity.

This also means a claim can move independently of its entity. New evidence about tendon healing
doesn't change what's known about BPC-157's gut-healing claim; they're tracked, reviewed, and
versioned separately (`claims.version`, `evidence_changes`).

## The target user, and their one real task

RNAwiki is built for someone who has already encountered a claim — from a forum, a podcast, a
supplement label, a friend — and wants to know how solid it actually is before they act on it or
repeat it. They are not a researcher auditing methodology, and the product does not ask them to
become one. Its one real task for that reader is narrower and more testable than "understand the
science": **can they, after reading a claim, correctly identify where the evidence stops and the
inference begins?**

That is the specific thing RNAwiki's comprehension testing measures (`lib/comprehension.ts`,
`docs/editorial-methodology.md`) — not whether the reader agrees with the claim, not whether they
now believe or disbelieve it, but whether the explanation was clear enough that they can locate the
boundary correctly. A reader who finishes a BPC-157 tendon-healing claim believing "this is
promising in animals, unproven in people" has succeeded at the product's one job, independent of
what they decide to do with that information. A reader who finishes believing "this is proven to
heal tendons" has not, regardless of how much time they spent reading.

## Positioning and brand rules

**Positioning line:** *See where the evidence actually ends.*

RNAwiki's voice is plain, specific, and unhedging about what it doesn't know. It never borrows the
register of wellness marketing or growth-hacking copy, because that register is built to produce
exactly the confidence collapse this product exists to undo. The following phrases are banned from
any RNAwiki copy — site content, marketing, error messages, admin UI, commit messages that become
user-facing changelogs, everywhere — verbatim and in close paraphrase:

- revolutionary
- groundbreaking
- unlock
- biohack your body
- optimize yourself
- next-generation wellness
- democratize your health
- cutting-edge
- breakthrough platform
- your health journey
- science made simple
- ultimate guide
- miracle
- cure — *unless used in an actual regulatory context* (e.g., quoting a regulator's approved
  indication that uses the word, such as a curative-intent gene therapy's labeled indication).
  Never used as marketing language about RNAwiki itself or about a compound's prospects.

If a sentence would read naturally on a supplement landing page or a growth newsletter, rewrite it.
The default register is closer to a regulatory label or a careful research summary than to health
media — specific, sourced, comfortable saying "unknown."
