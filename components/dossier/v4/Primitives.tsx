/**
 * Shared pieces of the Substance Compass.
 *
 * Every component here is a server component rendered once to static markup. There is no client
 * state and no script: the page works with JavaScript switched off, which is also why the
 * navigator uses anchors and the disclosures use native `<details>`.
 *
 * Two rules are enforced by construction rather than by review. A state is never colour alone — the
 * badge always carries a glyph and a word. And a statement always renders its origin, so a reader
 * can tell a reviewed conclusion from a sentence somebody wrote into the record.
 */
import type { ReactNode } from 'react'

import type { SourceCitation } from '@/lib/dossier-v3/fields'
import type { TruthTerms } from '@/lib/dossier-v4/copy'
import type { ConceptVisual } from '@/lib/dossier-v4/concepts'
import {
  sectionStatePlain,
  sectionStateLabel,
  sectionStateTone,
  truthLaneLabel,
  type SectionState,
  type TruthLane,
} from '@/lib/dossier-v4/taxonomy'
import {
  ORIGIN_LABELS,
  ORIGIN_PLAIN,
  type Statement,
  type StatementOrigin,
} from '@/lib/dossier-v4/view-model'

const STATE_GLYPHS: Record<SectionState, string> = {
  reviewed_content: '✓',
  source_checked_draft: '◇',
  no_qualifying_evidence: '∅',
  not_applicable: '–',
  ambiguous: '≈',
  awaiting_review: '…',
  source_unavailable: '⚠',
  feature_not_enabled: '○',
  pipeline_failure: '⚠',
}

const ORIGIN_GLYPHS: Record<StatementOrigin, string> = {
  reviewed_claim: '✓',
  approved_first_read: '✓',
  authored_record: '✎',
  stored_source: '❝',
  derived_count: '#',
  contract_sentence: '§',
  absent: '∅',
}

/** A state badge. Glyph, then words, then an optional plain definition behind a disclosure. */
export function StateBadge({
  state,
  explain = false,
}: {
  state: SectionState
  explain?: boolean
}): ReactNode {
  const badge = (
    <span className="dv4-state" data-state={state} data-tone={sectionStateTone(state)}>
      <span aria-hidden="true" className="dv4-state-glyph">
        {STATE_GLYPHS[state]}
      </span>
      {sectionStateLabel(state)}
    </span>
  )
  if (!explain) return badge
  return (
    <>
      {badge} <span className="dv4-note">{sectionStatePlain(state)}</span>
    </>
  )
}

/** Where a sentence came from. Always rendered next to the sentence itself. */
export function OriginNote({ origin }: { origin: StatementOrigin }): ReactNode {
  return (
    <p className="dv4-origin">
      <span aria-hidden="true">{ORIGIN_GLYPHS[origin]}</span> {ORIGIN_LABELS[origin]}.{' '}
      {ORIGIN_PLAIN[origin]}
    </p>
  )
}

export function Sources({ sources }: { sources: SourceCitation[] }): ReactNode {
  if (sources.length === 0) {
    return <p className="dv4-note">No source is stored against this line.</p>
  }
  return (
    <ul className="dv4-sources">
      {sources.map((source, index) => (
        <li key={`${source.id ?? source.label}-${index}`}>
          {source.url ? (
            <a href={source.url} rel="noreferrer noopener" target="_blank">
              {source.label}
            </a>
          ) : (
            source.label
          )}
          {source.date ? ` · recorded ${source.date}` : null}
          {source.binding === 'record' ? ' · a recorded source, not a stored snapshot' : null}
        </li>
      ))}
    </ul>
  )
}

/** One statement with its origin and its receipts folded away underneath. */
export function StatementBlock({
  statement,
  className,
  emphasis = false,
}: {
  statement: Statement
  className?: string
  emphasis?: boolean
}): ReactNode {
  return (
    <div className={className} data-origin={statement.origin} data-state={statement.state}>
      <p className={emphasis ? 'dv4-hero-result-text' : undefined}>{statement.text}</p>
      <OriginNote origin={statement.origin} />
      {/* Technical: this holds provenance and any recorded wording the reader layer did not take. */}
      <Disclosure summary="Where this came from" technical>
        <p>{statement.basis}</p>
        <Sources sources={statement.sources} />
      </Disclosure>
    </div>
  )
}

export function Disclosure({
  summary,
  children,
  open = false,
  technical = false,
}: {
  summary: string
  children: ReactNode
  open?: boolean
  /**
   * Marks an opt-in disclosure that carries recorded technical wording rather than RNAWiki's own
   * reader copy — a measurement quoted from a study, an identifier, a raw effect estimate. The
   * house sentence-length rule applies to the default reader layer, and the copy audit reads this
   * attribute so quoted technical text is counted where it belongs rather than as beginner copy.
   */
  technical?: boolean
}): ReactNode {
  return (
    <details className="dv4-more" data-layer={technical ? 'technical' : undefined} open={open}>
      <summary>{summary}</summary>
      <div className="dv4-more-body">{children}</div>
    </details>
  )
}

/** The five-term pattern. Present on every section that carries a truth lane. */
export function TruthLines({ terms }: { terms: TruthTerms }): ReactNode {
  return (
    <dl className="dv4-truth">
      <dt>What we know</dt>
      <dd>{terms.know}</dd>
      <dt>How we know it</dt>
      <dd>{terms.how}</dd>
      <dt>What this does not prove</dt>
      <dd>{terms.notProve}</dd>
      <dt>Why it matters</dt>
      <dd>{terms.matters}</dd>
      <dt>What we still do not know</dt>
      <dd>{terms.stillUnknown}</dd>
    </dl>
  )
}

/** A section that could not be filled. Rendered, never silently dropped. */
export function Absence({ state, reason }: { state: SectionState; reason: string }): ReactNode {
  return (
    <div className="dv4-absence" data-absence={state}>
      <p>
        <StateBadge state={state} />
      </p>
      <p>{reason}</p>
      <p className="dv4-note">{sectionStatePlain(state)}</p>
    </div>
  )
}

export function SectionFrame({
  id,
  lane,
  label,
  state,
  lede,
  children,
}: {
  id: string
  lane: TruthLane
  label: string
  state: SectionState
  lede?: string
  children: ReactNode
}): ReactNode {
  return (
    <section
      aria-labelledby={`${id}-h`}
      className="dv4-section"
      data-compass-lane={lane}
      data-lane={lane}
      data-state={state}
      id={id}
    >
      <p className="dv4-eyebrow">
        <span>{truthLaneLabel(lane)}</span>
        <StateBadge state={state} />
      </p>
      <h2 id={`${id}-h`}>{label}</h2>
      {lede ? <p className="dv4-lede">{lede}</p> : null}
      {children}
    </section>
  )
}

/* -------------------------------------------------------------- diagrams */

/**
 * Concept diagrams. Each is a small, flat drawing that carries the one idea the definition names.
 * They are decorative in the accessibility tree because the definition beside them says the same
 * thing in words, so a screen reader is not made to describe a rectangle.
 */
export function ConceptGlyph({ visual }: { visual: ConceptVisual }): ReactNode {
  const common = {
    'aria-hidden': true as const,
    fill: 'none',
    height: 34,
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.4,
    viewBox: '0 0 60 34',
    width: 60,
  }
  switch (visual) {
    case 'container':
      return (
        <svg {...common}>
          <rect height="22" rx="6" width="30" x="15" y="6" />
          <circle cx="30" cy="17" r="4" />
        </svg>
      )
    case 'lock_and_key':
      return (
        <svg {...common}>
          <path d="M14 12h10v10H14z" />
          <path d="M24 17h8" />
          <circle cx="38" cy="17" r="6" />
          <path d="M44 17h4" />
        </svg>
      )
    case 'scissors':
      return (
        <svg {...common}>
          <path d="M12 8l24 18M12 26L36 8" />
          <circle cx="42" cy="11" r="4" />
          <circle cx="42" cy="24" r="4" />
        </svg>
      )
    case 'blueprint':
      return (
        <svg {...common}>
          <rect height="22" width="28" x="16" y="6" />
          <path d="M16 13h28M23 13v15" />
        </svg>
      )
    case 'messenger':
      return (
        <svg {...common}>
          <path d="M10 22c6-12 12 12 18 0s12 12 18 0" />
          <path d="M46 22l4-4M46 22l-4-4" />
        </svg>
      )
    case 'folded_chain':
      return (
        <svg {...common}>
          <path d="M12 24c4-14 10 6 14-8s8 14 14 6" />
          <circle cx="12" cy="24" r="2.5" />
          <circle cx="40" cy="22" r="2.5" />
        </svg>
      )
    case 'signal':
      return (
        <svg {...common}>
          <circle cx="16" cy="17" r="4" />
          <path d="M22 17h8M32 14l4 3-4 3" />
          <path d="M40 9v16" />
        </svg>
      )
    case 'gauge':
      return (
        <svg {...common}>
          <path d="M14 26a16 16 0 0132 0" />
          <path d="M30 26l8-9" />
        </svg>
      )
    case 'two_groups':
      return (
        <svg {...common}>
          <circle cx="18" cy="17" r="7" />
          <circle cx="42" cy="17" r="7" />
          <path d="M28 17h4" strokeDasharray="2 3" />
        </svg>
      )
    case 'coin':
      return (
        <svg {...common}>
          <circle cx="30" cy="17" r="9" />
          <path d="M30 8v18" strokeDasharray="3 3" />
        </svg>
      )
    case 'range_bar':
      return (
        <svg {...common}>
          <path d="M12 17h36M12 12v10M48 12v10" />
          <circle cx="30" cy="17" r="3" />
        </svg>
      )
    case 'decay_curve':
      return (
        <svg {...common}>
          <path d="M12 8c10 0 6 18 24 18" />
          <path d="M12 28h36" strokeDasharray="2 3" />
        </svg>
      )
    case 'capsule':
      return (
        <svg {...common}>
          <rect height="14" rx="7" width="30" x="15" y="10" />
          <path d="M30 10v14" />
        </svg>
      )
    case 'door':
      return (
        <svg {...common}>
          <rect height="22" width="16" x="14" y="6" />
          <circle cx="26" cy="17" r="1.4" />
          <path d="M34 17h12M42 13l4 4-4 4" />
        </svg>
      )
    case 'warning':
      return (
        <svg {...common}>
          <path d="M30 7l14 22H16z" />
          <path d="M30 16v7M30 26v.5" />
        </svg>
      )
    case 'two_arrows':
    default:
      return (
        <svg {...common}>
          <path d="M12 13h30M38 9l4 4-4 4" />
          <path d="M48 23H18M22 19l-4 4 4 4" />
        </svg>
      )
  }
}

/**
 * The body-path figure beside the hero. It draws the same stages the path list below renders, so
 * the picture and the words cannot disagree, and it is hidden from the accessibility tree because
 * the list is the text equivalent.
 */
export function BodyPathFigure({ stages }: { stages: string[] }): ReactNode {
  const shown = stages.slice(0, 6)
  const height = Math.max(60, shown.length * 44 + 16)
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={height}
      role="presentation"
      stroke="currentColor"
      strokeWidth={1.3}
      viewBox={`0 0 240 ${height}`}
      width="100%"
    >
      {shown.map((stage, index) => {
        const y = 22 + index * 44
        return (
          <g key={stage}>
            {index < shown.length - 1 ? (
              <path
                d={`M18 ${y + 9} V ${y + 35}`}
                strokeDasharray={index === 0 ? undefined : '3 4'}
              />
            ) : null}
            <circle cx="18" cy={y} fill="var(--dv4-surface)" r="6" />
            <text fill="currentColor" fontSize="11" stroke="none" x="36" y={y + 4}>
              {stage.length > 30 ? `${stage.slice(0, 29)}…` : stage}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
