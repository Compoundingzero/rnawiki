# Evidence classification

Canonical home for RNAwiki's evidence vocabulary. Every term is declared once in
[`lib/evidence.ts`](../lib/evidence.ts) — import it, never retype the wording or reorder the stages.

## Measured / Inferred / Unknown

The status of one mechanism step or finding (`mechanismSteps.status`), not of the claim, which gets
a Proof Boundary stage instead. Three values, no fourth "partially confirmed".

- **Measured** — the experiment directly observed this result under the stated conditions.
- **Inferred** — the conclusion may be plausible, but it goes beyond what was directly measured.
- **Unknown** — the evidence needed to establish the claim is not available or not convincing.

One claim routinely holds both, and the job is to keep them apart. In BPC-157's tendon-healing
claim, "increased VEGFR2 receptor expression in vascular endothelial cells" is measured; that this
drives "faster, more complete recovery from tendon and ligament injuries in people" is inferred,
and has never been observed in a human study.

## Evidence relationships

How one source relates to one claim (`claimEvidence.relationship`), never a blanket endorsement of
the entity.

- **Supports** — the finding is consistent with this claim and lends it weight.
- **Contradicts** — the finding conflicts with this claim.
- **Limits** — the source caps what can be concluded: small sample, short follow-up,
  non-generalizing population, unreplicated result.
- **Contextualizes** — the source doesn't bear on the claim's truth, but a reader needs it to
  calibrate.

Real `limits`: BPC-157's safety claim links a 2025 systematic review of 544 articles that "states
explicitly that 'no clinical safety data were found'" beyond one retrospective study. Real
`contextualizes`: rapamycin's human-healthspan claim links the replicated mouse lifespan data
(Harrison 2009), which doesn't prove the human claim but shows the plausibility behind it.

`claimEvidence.independentGroupStatus` (boolean) records whether a group unconnected to the
original researchers replicated a finding. It is what separates stage 6 from stage 7.

## The 8 Proof Boundary stages

Ordered weakest to strongest in `PROOF_BOUNDARY_STAGES`. A claim gets exactly one stage: the one its
*strongest directly relevant* evidence reached, never an average.

1. **Biological rationale only** `biological_rationale_only` — a proposed mechanism, untested in
   cell, animal or human. *No seeded example.*
2. **Cell evidence** `isolated_cell_evidence` — measured in isolated cells or tissue explants, not a
   whole organism. *No seeded example: BPC-157's VEGFR2 result is cell-measured but sits inside an
   animal-evidence claim.*
3. **Animal evidence** `animal_evidence` — measured in a whole living animal, with or without cell
   data, no human data. *BPC-157 `tendon-healing`: every healing measurement is a rat injury model.
   Rapamycin `mtor-mechanism`: mouse lifespan extension replicated across three NIA-funded labs.*
4. **Observational human evidence** `observational_human_evidence` — humans observed, not given a
   controlled intervention: cohort, case-control, registry. *No seeded example.*
5. **Uncontrolled human evidence** `uncontrolled_human_intervention` — humans given the substance by
   researchers, no control group. *BPC-157 `safety`: a 2-person uncontrolled IV pilot. BPC-157
   `human-testing`: a 12-patient retrospective case series.*
6. **Controlled human evidence** `controlled_human_evidence` — a controlled trial with a real
   comparison group, not yet independently replicated. *Rapamycin `human-healthspan-evidence`:
   PEARL, n=114 completers, 48 weeks, double-blind, randomized, placebo-controlled.*
7. **Independently supported controlled human evidence**
   `independently_supported_controlled_human_evidence` — two or more controlled-trial sources from
   independent groups, same finding. *No seeded example.*
8. **Regulatory evidence** `regulatory_evidence` — a regulator reviewed the trial data and
   authorized the product for a defined use. *Casgevy `is-casgevy-approved`, `how-casgevy-works`:
   FDA Dec 2023, UK MHRA Nov 2023 (first CRISPR therapy authorization), European Commission Feb
   2024.*

Add a seeded example to a stage when a claim genuinely occupies it; never invent one.

The stage says nothing about which direction a result came out: PEARL's primary endpoint was null
and rapamycin's claim still sits at stage 6, because a controlled trial exists. Stage 8 is not
certainty either — Casgevy's `remainingUnknown` records that approval "reflects only the roughly
1.5-2 years of trial follow-up available at the time of review," under eligibility narrower than
"approved for sickle cell disease" implies. Moving up a stage is never a verdict that the claim is a
good idea; see [`docs/product-principles.md`](product-principles.md).

## Two rails: mechanism vs. outcome

A claim tracks two threads separately (`claims.mechanismSummary`, `claims.outcomeSummary`), because
a strong mechanism does not average out a weak outcome.

- **Mechanism** — what was measured about *how* the substance acts: receptor binding, pathway
  activation, gene expression.
- **Outcome** — what was measured about the *claimed result*: healing faster, living longer, fewer
  crises. This rail answers the consumer question.

The rails can sit at opposite strengths on the same claim. BPC-157's tendon-healing claim has a
measured mechanism (VEGFR2/Akt-eNOS upregulation, FAK-paxillin activation in tendon fibroblasts)
and an untested human outcome. Rapamycin's human-healthspan claim inverts that: the mechanism has
never been measured end-to-end in humans, while the outcome has PEARL. A reader shown only the
mechanism rail thinks the outcome is established, so the outcome rail never inherits the mechanism
rail's strength.

## Absence of evidence vs. evidence of no effect

**Absence of evidence** means nobody ran the study. Per BPC-157's `human-testing` claim, missing
human trial data "does not mean BPC-157 fails to work in people — it means that specific claim has
not been tested, which is a different, weaker evidentiary position than either 'proven' or
'disproven.'" The words for this are *untested* and *unknown*.

**Evidence of no effect** means a study measured the outcome and found no meaningful difference from
control. PEARL's pre-specified primary endpoint, visceral fat by DXA at 48 weeks, came back p =
0.942 — a real, citable finding, bounded to that endpoint, dose, duration and population.

Two failure modes, one in each direction:

1. **Silence read as disproof.** Writing "no evidence it works in humans" so it lands as "shown not
   to work". Say what was and wasn't tested.
2. **A null result read as a gap.** Calling PEARL "more research is needed" without saying its
   pre-registered primary measure came back null. That erases real information.

Both make a claim sound more settled than it is. `remainingUnknown` and `evidenceNeededNext` exist
on every claim to keep stating what would have to be measured, and hasn't been.
