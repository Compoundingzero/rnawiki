import type { MechanismStepView } from '@/lib/types'
import { EVIDENCE_STATUS_LABELS } from '@/lib/evidence'

/**
 * The proposed causal chain, as a real ordered list.
 *
 * The technical name and the evidence status are words, never coloured tags. A status pill next to
 * a mechanism step is the one place on this page where colour could be mistaken for a verdict on
 * whether the compound works, so `.chip` is MONOCHROME and must stay monochrome: no green for
 * Measured, no amber for Inferred, no grey-out for Unknown. The three states are peers, and colour
 * would rank them. The chip is a text chip — the word is the whole meaning, the box is only a
 * boundary — so it survives colour-blindness, forced colours and a stylesheet that never loads.
 *
 * The <ol> carries the sequence, so the meaning survives with styles off, in print, and in a
 * screen reader. Nothing here is a picture that needs alt text to be understood.
 *
 * v2 AMENDMENT, two changes to what the paragraph above describes:
 *
 * 1. The step number is now drawn in markup (`.mech__n`) instead of by `::marker`, because a
 *    ::marker cannot be sized, boxed or aligned into the step's header row. The stylesheet must
 *    therefore set `list-style: none` on `.mech`, or every step prints its number twice. `.mech`
 *    keeps `role="list"` because Safari drops list semantics from a list styled `list-style: none`,
 *    and the list IS the sequence here. The rendered number is `aria-hidden`: the <ol> already
 *    announces position, and both together read "one, one".
 * 2. The technical label moved above the plain explanation, as the step's header beside its number.
 *    "Plain language leads" is still true and is what matters — the plain explanation remains the
 *    largest, full-ink text in the step, and the label above it is small and muted. Leading with
 *    the SIZE of the plain sentence rather than with its DOM position is the version of that rule
 *    that survives a designed layout; the label as a quiet eyebrow names the step, it does not
 *    compete with it. If a restyle ever makes `.mech__label` louder than `.mech__plain`, that is
 *    the defect this note exists to catch.
 *
 * The middot that used to join the technical label to the status word is gone with the chip that
 * replaced it. It was punctuation between two data values, not copy.
 */
export function MechanismChain({ steps }: { steps: MechanismStepView[] }) {
  if (steps.length === 0) return null

  return (
    <ol className="mech" role="list" aria-label="Proposed mechanism, step by step">
      {steps.map((step, index) => (
        <li key={step.id} className="mech__step">
          <p className="mech__head">
            <span className="mech__n" aria-hidden="true">
              {index + 1}
            </span>
            <span className="mech__label">{step.technicalLabel}</span>
          </p>
          <p className="mech__plain">{step.plainLanguageExplanation}</p>
          <p className="mech__state">
            <span className="chip">{EVIDENCE_STATUS_LABELS[step.status]}</span>
          </p>
          <p className="mech__tech">{step.evidenceContext}</p>
        </li>
      ))}
    </ol>
  )
}
