import type { ClaimEvidenceView, EvidenceSourceView } from '@/lib/types'
import { EVIDENCE_RELATIONSHIP_LABELS } from '@/lib/evidence'

/**
 * The sources behind one claim, as a real ordered list of real links in the server-rendered HTML.
 *
 * This replaces a client-only drawer whose contents mounted on click. Every DOI and PMID on the
 * site was therefore invisible to a reader without JavaScript and to anything crawling the page —
 * on a site whose entire argument is "here is the source". A native <details> keeps the list out
 * of the default reading path without taking it out of the document.
 *
 * Only fields that exist are rendered. A source with no sample size shows no sample size; nothing
 * ever prints "N/A", and no value is inferred from another.
 */

function sourceUrl(s: EvidenceSourceView): string | null {
  if (s.doi) return `https://doi.org/${s.doi}`
  if (s.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`
  if (s.clinicalTrialId) return `https://clinicaltrials.gov/study/${s.clinicalTrialId}`
  if (s.regulatoryUrl) return s.regulatoryUrl
  return null
}

/** "Authors (2025). Journal." — each part dropped when the record does not have it. */
function publicationLine(s: EvidenceSourceView): string | null {
  const parts = [s.authors, s.publicationYear ? `(${s.publicationYear})` : null, s.journalOrIssuer].filter(Boolean)
  return parts.length > 0 ? parts.join('. ') : null
}

/** Study shape, in the record's own words. Never derived, never guessed. */
function studyLine(s: EvidenceSourceView): string | null {
  const parts = [s.studyDesign, s.species, s.sampleSize ? `n = ${s.sampleSize}` : null, s.endpoint].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : null
}

export function ClaimSources({ evidence }: { evidence: ClaimEvidenceView[] }) {
  if (evidence.length === 0) return null

  return (
    <details className="disclosure disclosure--inline" style={{ marginTop: 'var(--s5)' }}>
      <summary>Sources ({evidence.length})</summary>
      <div className="disclosure__body">
        <ol className="sources">
          {evidence.map((link, i) => {
            const s = link.source
            const url = sourceUrl(s)
            const publication = publicationLine(s)
            const study = studyLine(s)

            return (
              <li key={`${s.id}-${i}`}>
                <p className="source__h">{url ? <a href={url}>{s.title}</a> : s.title}</p>

                {s.retractionStatus && (
                  <p className="notice" style={{ marginTop: 'var(--s2)' }}>
                    {s.retractionStatus}
                  </p>
                )}

                {publication && <p className="source__line">{publication}</p>}
                {study && <p className="source__line">{study}</p>}

                <p className="source__line">
                  {EVIDENCE_RELATIONSHIP_LABELS[link.relationship]} this answer
                  {s.doi && (
                    <>
                      {' · DOI '}
                      <span className="id">{s.doi}</span>
                    </>
                  )}
                  {s.pmid && (
                    <>
                      {' · PMID '}
                      <span className="id">{s.pmid}</span>
                    </>
                  )}
                  {s.clinicalTrialId && (
                    <>
                      {' · Trial '}
                      <span className="id">{s.clinicalTrialId}</span>
                    </>
                  )}
                </p>

                <p className="source__note">{link.directlyMeasuredResult}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </details>
  )
}
