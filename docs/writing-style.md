# Writing style

Enforced by `scripts/check-prose.ts`, which runs in `npm run gate`. If the gate fails, cut the
sentence — do not raise the cap.

## The rule

One idea per sentence. The caveat travels with the claim, in the same sentence, not appended as a
`though …` clause after the fact.

## What good looks like

These are the BPC-157 entries. They are the reference for the voice:

> BPC-157 has accelerated tendon and ligament healing in rat and cell studies, but no controlled
> human trial has tested whether it speeds tendon recovery in people.

162 characters. The claim and its limit are one sentence. A reader knows where the evidence stops
before they finish reading.

## What drift looks like

The same field, on another entity, before this gate existed:

> Rapamycin carries an FDA boxed warning for increased infection and cancer risk from
> immunosuppression at the continuous, higher doses used after transplant, and while the low,
> intermittent doses typically prescribed off-label for longevity looked relatively safe over one
> year in the only controlled trial to test them, longer-term risk in healthy people has not been
> established, and off-label access requires a physician willing to prescribe it plus ongoing
> blood monitoring.

One 70-word sentence carrying four separate facts. Every fact is true and sourced. It is still
unreadable, and a reader skimming it takes away nothing. Split it, or cut what the field does not
need.

## Rules the gate enforces

- **Field length caps.** Set just above the BPC-157 entries. See `FIELD_CAPS` in the gate.
- **No sentence over 40 words.**
- **At most two em-dashes per field.** More than that is a clause chain wearing a sentence's
  clothes.
- **No filler preambles** — "it is worth noting", "it should be noted", "as of this writing",
  "when it comes to", "in summary".
- **No page explaining its own posture.** An access note ended with "This is a description of
  access reality, not guidance on dosing or self-use." The footer disclaimer already says this on
  every page. Delete the sentence; keep the disclaimer.

## Rules the gate cannot check

- **Lead with the answer.** "No —" and "Yes —" are good openings when the claim is a question.
- **Cut throat-clearing.** "Casgevy is genuinely approved" → "Casgevy is approved". The intensifier
  reads as arguing with the reader.
- **Put the aside where it belongs.** Casgevy's `measuredFinding` explained that a *different*
  drug, approved the same day, carries a boxed warning Casgevy does not. That is real and worth
  saying — it is not what was measured about Casgevy. Move it, do not delete it.
- **Numbers instead of adjectives.** "a small, single-arm trial" is weaker than "30 patients,
  single-arm, no control group".
- **Never cut a caveat to meet a cap.** If a claim genuinely needs two sentences, write two
  sentences. The caps are generous enough for that; they are not generous enough for four facts
  in one sentence.

## The homepage

The front door has its own budget, asserted in `tests/e2e/homepage.spec.ts`. It is the most
edited surface on the site and the first to accumulate explanation. A featured card shows the
question and the Proof Boundary stage. It does not show the full answer — a card cannot carry a
caveat properly, and a truncated caveat is worse than none.
