# Evidence classification

The vocabulary in this document is not local color — it is code. Every term here is declared once,
in [`lib/evidence.ts`](../lib/evidence.ts), and every page, component, and admin form imports it
from there rather than re-declaring the wording. If you need one of these terms in a new file,
import it; don't retype it.

## Measured / Inferred / Unknown

This is the status of a single mechanism step or finding (`evidenceStatusEnum`,
`mechanismSteps.status`) — not the claim as a whole, which instead gets a Proof Boundary stage
(below). Three values only, no fourth "partially confirmed" or similar:

| Status | Definition (`EVIDENCE_STATUS_DEFINITIONS`) |
|---|---|
| **Measured** | The experiment directly observed this result under the stated conditions. |
| **Inferred** | The conclusion may be scientifically plausible, but it goes beyond what was directly measured. |
| **Unknown** | The evidence needed to establish the claim is not currently available or convincing. |

A single claim routinely contains both measured and inferred steps side by side, and the product's
job is to keep them visibly separate rather than blending them into one confident sentence. From
the BPC-157 tendon-healing claim (`scripts/seed-data/bpc-157.ts`): the finding that BPC-157
"increased VEGFR2 receptor expression... in vascular endothelial cells" is **measured** — a real
lab result. The claim that this mechanism "is proposed to drive... faster, more complete recovery
from tendon and ligament injuries in people" is the claim's **inference** — plausible, built on the
measured mechanism, but not itself observed in any human study.

## Evidence relationships: supports / contradicts / limits / contextualizes

Every evidence source attached to a claim (`claimEvidence.relationship`,
`EVIDENCE_RELATIONSHIPS`) is tagged with how it relates to that specific claim — never assumed to
be a blanket endorsement:

- **Supports** — the source's finding is consistent with, and lends weight to, this claim.
- **Contradicts** — the source's finding conflicts with this claim.
- **Limits** — the source narrows, qualifies, or caps what can be concluded (a small sample, a
  short follow-up, a population that doesn't generalize, an unreplicated result).
- **Contextualizes** — the source doesn't directly bear on the claim's truth but helps a reader
  calibrate it (e.g., the much larger, better-replicated animal literature, cited for contrast
  next to a thin human record).

Real example of `limits`, from BPC-157's safety claim: a 2025 systematic review is linked with
relationship `limits`, because — despite reviewing 544 identified articles — it "states explicitly
that 'no clinical safety data were found' for BPC-157 beyond [one] retrospective clinical study,"
directly bounding how much can be concluded from the rest of the (mostly animal) literature. Real
example of `contextualizes`, from rapamycin's human-healthspan claim: the well-replicated mouse
lifespan data (Harrison et al. 2009) is linked with relationship `contextualizes` alongside the
much thinner human trial record — it doesn't prove the human claim, but a reader needs it to judge
how much biological plausibility stands behind the human question.

`independentGroupStatus` (a boolean on `claimEvidence`) separately records whether that particular
finding has been independently replicated by a group unconnected to the original researchers —
this is what distinguishes Proof Boundary stage 6 (controlled human evidence) from stage 7
(independently supported controlled human evidence); see below.

## The 8 Proof Boundary stages

Ordered weakest to strongest (`PROOF_BOUNDARY_STAGES`, `lib/evidence.ts`). A claim is assigned
exactly one stage — the stage its *strongest directly relevant* evidence has reached, not an
average or a vibe. Four of the eight have a real seeded example as of this writing; the other four
don't yet — rather than invent one, this document says so plainly and those examples should be
added once a seeded claim actually occupies that stage.

1. **Biological rationale only** — a proposed mechanism with no direct experimental test yet, cell,
   animal, or human. *No seeded example yet — add one once a claim occupies this stage.*

2. **Cell evidence** — measured in isolated cells or tissue explants, not a whole organism.
   *No seeded claim's `proofBoundaryStage` sits here yet, though cell-level findings appear as
   supporting mechanism steps within animal-evidence claims — e.g. BPC-157's VEGFR2 finding above
   was measured in cultured human vascular endothelial cells. A claim whose* strongest *evidence
   is cell-only, with nothing yet shown in a live animal, would belong here.*

3. **Animal evidence** — measured in a whole living animal (or a combination of animal and cell
   evidence, with no human data yet). *Real example:* BPC-157's tendon-healing claim
   (`bpc-157.ts`, slug `tendon-healing`) — "Every direct measurement of a tendon- or
   ligament-healing outcome comes from rat injury models... no human study of any kind —
   controlled or uncontrolled — has measured tendon or ligament healing outcomes with BPC-157."
   Also rapamycin's mTOR-mechanism claim (`rapamycin-longevity.ts`, slug `mtor-mechanism`):
   lifespan extension replicated across three independent NIA-funded mouse labs — "about as solid
   as animal evidence gets... and it is still animal evidence."

4. **Observational human evidence** — humans were observed, but not given a controlled
   intervention by researchers (cohort studies, case-control studies, registry data).
   *No seeded example yet — add one once a claim occupies this stage.*

5. **Uncontrolled human evidence** — humans were directly given the substance or treatment by
   researchers, but without a control/comparison group. *Real example:* BPC-157's safety claim
   (slug `safety`) — a single "2-person uncontrolled human pilot" IV safety study, with the
   proofBoundaryExplanation noting "this is genuine human evidence, but it is uncontrolled and far
   too small to establish a safety profile." Also the `human-testing` claim on the same entity: the
   most advanced evidence found was "a small retrospective, uncontrolled case series" of 12
   patients.

6. **Controlled human evidence** — a controlled human trial exists (a genuine comparison group,
   ideally randomized), but it has not yet been independently replicated. *Real example:*
   rapamycin's `human-healthspan-evidence` claim — the PEARL trial (n=114 completers,
   double-blind, randomized, placebo-controlled) is real controlled human evidence, "the honest
   middle ground between 'never tested in humans' and 'proven to work in humans': tested, but not
   yet shown to work for what people are using it for." Note this stage says nothing about which
   direction the trial came out — PEARL's primary endpoint was null; the claim still sits at
   "controlled human evidence" because a controlled trial genuinely exists.

7. **Independently supported controlled human evidence** — a controlled human finding has been
   independently replicated by a separate research group. *No seeded example yet — add one once a
   claim occupies this stage.* (The schema already tracks the building block:
   `claimEvidence.independentGroupStatus`, a per-source boolean recording whether that source's
   authors are independent of an earlier finding's authors — a claim reaches this stage once two
   or more independent controlled-trial sources support the same finding.)

8. **Regulatory evidence** — an independent regulator (FDA, MHRA, European Commission, etc.)
   reviewed the underlying trial data and formally authorized the product for a defined use.
   *Real example:* Casgevy's `is-casgevy-approved` and `how-casgevy-works` claims
   (`casgevy.ts`) — approved by FDA (Dec 2023), UK MHRA (Nov 2023, "the world's first CRISPR
   therapy authorization"), and the European Commission (Feb 2024), for defined indications. Even
   here, the `remainingUnknown` field stays honest about scope: approval "reflects only the
   roughly 1.5-2 years of trial follow-up available at the time of review, not decades of
   real-world experience," and eligibility criteria are narrower than "approved for sickle cell
   disease" suggests in isolation.

The stage is never a verdict on whether the claim is a good idea, and moving up a stage is not
"getting closer to proof of benefit" in the sense of dosage or clinical advice — RNAwiki draws no
such conclusions at any stage. See [`docs/product-principles.md`](product-principles.md).

## The two-rail model: mechanism evidence vs. outcome evidence

A claim tracks two related but separate evidentiary threads, surfaced as two optional summary
fields (`claims.mechanismSummary`, `claims.outcomeSummary`):

- **Mechanism evidence** — what has been measured about *how* the substance is proposed to act:
  receptor binding, pathway activation, gene expression changes. This can be strong even when
  outcome evidence is weak or absent.
- **Outcome evidence** — what has been measured about the *actual claimed result* the reader
  cares about: healing faster, living longer, reducing crises. This is the rail that actually
  answers the consumer question.

These two rails can sit at very different Proof Boundary positions on the same claim, and keeping
them visibly separate is the point — a strong mechanism does not average out a weak outcome. Real
example, BPC-157's tendon-healing claim:

> **Mechanism:** "BPC-157 upregulates VEGFR2 receptor signaling (Akt-eNOS pathway) and activates
> FAK-paxillin signaling in tendon fibroblasts — both measured directly in cell and animal
> experiments."
> **Outcome:** "Claimed outcome, not yet tested in a controlled human trial: faster, more
> complete recovery from tendon and ligament injuries in people."

Real example, rapamycin's human-healthspan claim:

> **Mechanism:** "Proposed to work through the same mTOR-inhibition pathway demonstrated in mice,
> but this causal chain has not been directly measured end-to-end in humans."
> **Outcome:** "One completed 48-week randomized controlled trial (n=114 completers): primary
> endpoint (visceral fat) null; secondary lean-mass and pain improvements in women at 10 mg/week;
> no human lifespan or hard-outcome data exist."

A reader who only sees the mechanism rail ("upregulates VEGFR2 signaling," "inhibits mTOR") could
easily walk away thinking the outcome is established. RNAwiki's job is to make sure the outcome
rail is never allowed to inherit the mechanism rail's evidentiary strength.

## Absence of evidence vs. evidence of no effect

This distinction is easy to get backwards in both directions, and getting it wrong is a real
editorial failure mode, not a pedantic nuance.

**Absence of evidence** means: nobody has run the study. The outcome in question has not been
directly measured, by anyone, under any conditions — so nothing can be concluded about it either
way. BPC-157's `human-testing` claim states this precisely: "The near-total absence of human trial
data does not mean BPC-157 fails to work in people — it means that specific claim has not been
tested, which is a different, weaker evidentiary position than either 'proven' or 'disproven.'"
The correct language here is *untested* or *unknown* — never "doesn't work," never "hasn't been
proven to not work" as a backhanded implication that it probably does.

**Evidence of no effect** means the opposite starting point: a real study *did* directly measure
the specific outcome, under specific stated conditions, and found no statistically meaningful
difference from control. This is itself a positive, citable finding — not a gap. Rapamycin's PEARL
trial is the clean real example: its pre-specified primary endpoint, change in visceral fat by DXA
scan after 48 weeks, showed no significant difference between rapamycin and placebo (p = 0.942).
That is evidence of no effect **on that specific endpoint, at that dose, over that duration, in
that population** — a real, bounded, citable null result, not silence.

The two failure modes to guard against when writing or reviewing a claim:

1. **Treating silence as disproof.** Writing "no evidence BPC-157 works in humans" in a way that
   reads as "shown not to work" — when the honest state is that no controlled human trial has
   been run at all. The fix is always to say what was and wasn't tested, not to let an absence
   imply a negative result.
2. **Treating a real null result as if it were merely a gap.** Describing PEARL's null primary
   endpoint as "more research is needed" without also stating plainly that the primary,
   pre-registered measure of the trial that was actually run came back null. A specific negative
   finding is evidence in its own right, and softening it into a generic "needs more study" framing
   erases real information a reader needs.

Both directions of this error move a claim in the same wrong way: toward sounding more settled, in
either the positive or negative direction, than the actual evidence supports. The `remainingUnknown`
and `evidenceNeededNext` fields on every claim exist specifically to keep stating, explicitly, what
would have to be measured — and hasn't been — before either direction could be said with more
confidence.
