/**
 * Word-and-icon labels for evidence classes, outcome classes, completion states and evidence
 * origins. Colour is never the only signal: every label carries its words and a glyph, and the
 * first time a class appears on a page its plain definition is available inline through a native
 * `<details>` (no script, keyboard operable).
 */
import type { SourceCitation } from '@/lib/dossier-v3/fields'

const GLYPHS: Record<string, string> = {
  regulatory_label: '§',
  randomized_trial: '⚖',
  controlled_trial: '⚖',
  uncontrolled_human_study: '◐',
  observational: '◔',
  systematic_review: '≡',
  registered_trial_no_result: '◻',
  animal_study: '◇',
  mechanism_study: '◇',
  spontaneous_report: '⚑',
  case_report: '•',
  community_anecdote: '“',
  model_prediction: '?',
  human_outcome: '●',
  human_biomarker: '◐',
  animal: '◇',
  cell_lab: '◇',
  inferred: '~',
  predicted: '?',
  unknown: '–',
  verified_evidence_present: '✓',
  no_qualifying_evidence_after_search: '∅',
  not_applicable: '–',
  ambiguous_quarantined: '⚠',
  awaiting_human_review: '…',
  source_unavailable: '⊘',
  legally_unavailable: '⊘',
  pipeline_failure: '✗',
}

export function EvidenceLabel({
  code,
  label,
  plain,
  tone = 'neutral',
}: {
  code: string
  label: string
  plain?: string | undefined
  tone?: 'neutral' | 'strong' | 'muted' | 'caution'
}) {
  const glyph = GLYPHS[code] ?? '·'
  if (!plain) {
    return (
      <span className={`dv3-label dv3-label-${tone}`} data-code={code}>
        <span aria-hidden="true" className="dv3-label-glyph">
          {glyph}
        </span>{' '}
        {label}
      </span>
    )
  }
  return (
    <details className={`dv3-label dv3-label-${tone} dv3-label-defined`} data-code={code}>
      <summary>
        <span aria-hidden="true" className="dv3-label-glyph">
          {glyph}
        </span>{' '}
        {label}
      </summary>
      <p className="dv3-label-plain">{plain}</p>
    </details>
  )
}

/** A source citation line: label, id, date; a link where the source has a public URL. */
export function Sources({
  sources,
  compact = false,
}: {
  sources: SourceCitation[]
  compact?: boolean
}) {
  if (sources.length === 0) return null
  return (
    <ul className={compact ? 'dv3-sources dv3-sources-compact' : 'dv3-sources'}>
      {sources.map((source, index) => {
        const text = [source.label, source.id, source.date].filter(Boolean).join(' · ')
        return (
          <li key={`${source.label}-${source.id ?? index}`}>
            {source.url ? (
              <a href={source.url} rel="noopener noreferrer">
                {text}
              </a>
            ) : (
              text
            )}
            {source.binding === 'record' ? (
              <span className="dv3-source-binding"> (recorded source, not a stored snapshot)</span>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

/** The truth pattern every major section follows, as markup. */
export function TruthPattern({
  know,
  how,
  notKnow,
  matters,
}: {
  know: string
  how: string
  notKnow: string
  matters: string
}) {
  return (
    <dl className="dv3-truth">
      <div>
        <dt>What we know</dt>
        <dd>{know}</dd>
      </div>
      <div>
        <dt>How we know</dt>
        <dd>{how}</dd>
      </div>
      <div>
        <dt>What we do not know</dt>
        <dd>{notKnow}</dd>
      </div>
      <div>
        <dt>Why it matters</dt>
        <dd>{matters}</dd>
      </div>
    </dl>
  )
}
