import type { MechanismStepView } from '@/lib/types'
import { EvidenceLabel } from './EvidenceLabel'

export function MechanismChain({ steps }: { steps: MechanismStepView[] }) {
  if (steps.length === 0) return null
  return (
    <ol
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gap: 0,
      }}
      aria-label="Proposed mechanism, step by step"
    >
      {steps.map((step, i) => (
        <li key={step.id}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) 0',
              borderBottom: i < steps.length - 1 ? '1px dashed var(--color-border)' : 'none',
            }}
          >
            <div
              aria-hidden
              style={{
                width: '1.6rem',
                height: '1.6rem',
                borderRadius: '50%',
                border: '2px solid var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--color-accent-strong)',
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <strong>{step.technicalLabel}</strong>
                <EvidenceLabel status={step.status} />
              </div>
              <p style={{ margin: 0 }}>{step.plainLanguageExplanation}</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {step.evidenceContext}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
