import type { MechanismStepView } from '@/lib/types'
import { EVIDENCE_STATUS_LABELS } from '@/lib/evidence'

/**
 * The proposed causal chain, as a numbered vertical rail.
 *
 * Deliberate choices:
 * - A real <ol>, so the sequence survives with styles off, in print, and in a
 *   screen reader. No drawn illustration, nothing that needs an alt text to
 *   carry the meaning.
 * - Each step wears its own evidence status as a .tag, which already carries a
 *   shape glyph — so measured / inferred / unknown read apart without colour.
 * - The rail is a hairline, not a decorated spine: the numbers and the rule do
 *   the work, and both print.
 */
export function MechanismChain({ steps }: { steps: MechanismStepView[] }) {
  if (steps.length === 0) return null

  return (
    <ol
      aria-label="Proposed mechanism, step by step"
      style={{ listStyle: 'none', margin: 0, padding: 0, maxWidth: '44rem' }}
    >
      {steps.map((step, i) => (
        <li
          key={step.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '2.25rem minmax(0, 1fr)',
            alignItems: 'start',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--size-meta)',
              color: 'var(--muted)',
              paddingTop: 'var(--s4)',
            }}
          >
            {String(i + 1).padStart(2, '0')}
          </span>

          {/* The rule lives on the content column so it runs unbroken from the
              first step to the last. */}
          <div
            style={{
              borderLeft: 'var(--hairline) solid var(--border-strong)',
              paddingLeft: 'var(--s4)',
              paddingBlock: 'var(--s4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'baseline',
                gap: 'var(--s2) var(--s3)',
                marginBottom: 'var(--s2)',
              }}
            >
              <strong style={{ fontSize: 'var(--size-body)' }}>{step.technicalLabel}</strong>
              <span className="tag" data-status={step.status}>
                {EVIDENCE_STATUS_LABELS[step.status]}
              </span>
            </div>

            <p className="prose" style={{ fontSize: 'var(--size-small)' }}>
              {step.plainLanguageExplanation}
            </p>

            <p
              style={{
                marginTop: 'var(--s2)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--size-meta)',
                color: 'var(--muted)',
                lineHeight: 1.5,
              }}
            >
              {step.evidenceContext}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
