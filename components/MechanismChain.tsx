import type { MechanismStepView } from '@/lib/types'
import { EVIDENCE_STATUS_LABELS } from '@/lib/evidence'

/**
 * The proposed causal chain, as a real ordered list.
 *
 * Plain language leads; the technical name and the evidence status follow it as words, not as
 * coloured tags. A status pill next to a mechanism step is the one place on this page where colour
 * could be mistaken for a verdict on whether the compound works, so there is none.
 *
 * The <ol> carries the sequence, so the meaning survives with styles off, in print, and in a
 * screen reader. Nothing here is a picture that needs alt text to be understood.
 */
export function MechanismChain({ steps }: { steps: MechanismStepView[] }) {
  if (steps.length === 0) return null

  return (
    <ol className="mech" aria-label="Proposed mechanism, step by step">
      {steps.map((step) => (
        <li key={step.id}>
          <p>{step.plainLanguageExplanation}</p>
          <p className="mech__tech">
            {step.technicalLabel} · {EVIDENCE_STATUS_LABELS[step.status]}
          </p>
          <p className="mech__tech">{step.evidenceContext}</p>
        </li>
      ))}
    </ol>
  )
}
