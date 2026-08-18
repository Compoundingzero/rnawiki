'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { ClaimEvidenceView } from '@/lib/types'
import { EVIDENCE_RELATIONSHIP_LABELS } from '@/lib/evidence'

/**
 * Evidence Trace — the signature interaction.
 *
 * A bracketed mono sigil sits beside a claim. Activating it opens a panel (right
 * drawer on desktop, bottom sheet on mobile) showing the source record behind
 * that specific sentence, without losing the reader's place.
 *
 * Deliberate choices:
 * - The marker is a real <button> containing real text, so it is selectable,
 *   findable with ctrl-F, and announced properly. No icon font, no hover-only.
 * - Only fields present in the record are rendered. A source with no sample size
 *   shows no sample-size row — it never says "N/A" and never invents a value.
 * - Focus moves into the panel on open and returns to the marker on close;
 *   Escape closes; focus is trapped while open; background scroll is locked so
 *   the reader's position is preserved exactly.
 */

function sourceUrl(s: ClaimEvidenceView['source']): string | null {
  if (s.doi) return `https://doi.org/${s.doi}`
  if (s.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`
  if (s.clinicalTrialId) return `https://clinicaltrials.gov/study/${s.clinicalTrialId}`
  if (s.regulatoryUrl) return s.regulatoryUrl
  return null
}

function citationText(link: ClaimEvidenceView): string {
  const s = link.source
  const bits = [s.authors, s.publicationYear ? `(${s.publicationYear})` : null, s.title, s.journalOrIssuer]
    .filter(Boolean)
    .join('. ')
  const id = s.doi ? ` https://doi.org/${s.doi}` : s.pmid ? ` PMID ${s.pmid}` : ''
  return `${bits}.${id}`.replace(/\.\./g, '.')
}

/** Only renders when there is a value — the guard against fabricated completeness. */
function Row({ k, v }: { k: string; v: string | number | null | undefined }) {
  if (v === null || v === undefined || v === '') return null
  return (
    <div className="speclabel__row">
      <dt className="speclabel__key">{k}</dt>
      <dd className="speclabel__val" style={{ margin: 0 }}>
        {v}
      </dd>
    </div>
  )
}

export function EvidenceTrace({
  evidence,
  label,
}: {
  evidence: ClaimEvidenceView[]
  /** What this marker is attached to, used for the accessible name. */
  label: string
}) {
  const [open, setOpen] = useState(false)
  const markerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  const close = useCallback(() => {
    setOpen(false)
    markerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
        return
      }
      if (e.key !== 'Tab') return
      // Trap focus inside the panel.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    // Lock background scroll so the reader's place is exactly preserved.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Move focus in without scrolling the (now locked) background.
    panelRef.current?.querySelector<HTMLElement>('button, a')?.focus({ preventScroll: true })

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, close])

  if (evidence.length === 0) return null

  return (
    <>
      <button
        ref={markerRef}
        type="button"
        className="srcmark"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">[{evidence.length}]</span>
        <span
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
          }}
        >
          Trace {evidence.length} source{evidence.length === 1 ? '' : 's'} for: {label}
        </span>
      </button>

      {open && (
        <>
          <div className="drawer-scrim" onClick={close} aria-hidden="true" />
          <div
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={panelRef}
          >
            <div className="drawer__head">
              <div>
                <p className="eyebrow" style={{ marginBottom: '0.35rem' }}>
                  Evidence Trace
                </p>
                <h2 id={titleId} className="h4" style={{ fontFamily: 'var(--font-serif)' }}>
                  {label}
                </h2>
              </div>
              <button type="button" className="drawer__close" onClick={close}>
                Close
              </button>
            </div>

            <div className="drawer__body stack-lg">
              {evidence.map((link, i) => {
                const s = link.source
                const url = sourceUrl(s)
                return (
                  <article key={i}>
                    <p className="eyebrow" style={{ marginBottom: '0.4rem' }}>
                      {EVIDENCE_RELATIONSHIP_LABELS[link.relationship]} · Source {i + 1} of{' '}
                      {evidence.length}
                    </p>

                    <h3
                      className="h4"
                      style={{ fontFamily: 'var(--font-serif)', marginBottom: 'var(--s2)' }}
                    >
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {s.title}
                          <span className="muted" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7em' }}>
                            {' '}
                            ↗
                          </span>
                        </a>
                      ) : (
                        s.title
                      )}
                    </h3>

                    {s.retractionStatus && (
                      <div className="callout" data-tone="danger" style={{ marginBottom: 'var(--s3)' }}>
                        <p className="callout__title">{s.retractionStatus}</p>
                      </div>
                    )}

                    <dl className="speclabel">
                      <Row k="Authors" v={s.authors} />
                      <Row k="Year" v={s.publicationYear} />
                      <Row k="Published in" v={s.journalOrIssuer} />
                      <Row k="Source type" v={s.sourceType} />
                      <Row k="Study design" v={s.studyDesign} />
                      <Row k="Species" v={s.species} />
                      <Row k="Sample size" v={s.sampleSize} />
                      <Row k="Endpoint" v={s.endpoint} />
                      <Row k="DOI" v={s.doi} />
                      <Row k="PMID" v={s.pmid} />
                      <Row k="Trial ID" v={s.clinicalTrialId} />
                      <Row k="Independent" v={link.independentGroupStatus ? 'Yes' : undefined} />
                    </dl>

                    <div className="stack" style={{ marginTop: 'var(--s4)' }}>
                      <div>
                        <p className="eyebrow">Supports which part</p>
                        <p style={{ fontSize: 'var(--size-small)' }}>{link.claimPartAddressed}</p>
                      </div>
                      <div>
                        <p className="eyebrow">What this source measured</p>
                        <p style={{ fontSize: 'var(--size-small)' }}>{link.directlyMeasuredResult}</p>
                      </div>
                    </div>

                    <CopyCitation text={citationText(link)} />
                  </article>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}

function CopyCitation({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className="drawer__close"
      style={{ marginTop: 'var(--s4)' }}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          setTimeout(() => setDone(false), 2000)
        } catch {
          /* clipboard unavailable — no-op rather than throwing in the UI */
        }
      }}
    >
      {done ? 'Citation copied' : 'Copy citation'}
    </button>
  )
}
