import type { ClaimEvidenceView } from '@/lib/types'
import { EVIDENCE_RELATIONSHIP_LABELS } from '@/lib/evidence'

function sourceUrl(source: ClaimEvidenceView['source']): string | null {
  if (source.doi) return `https://doi.org/${source.doi}`
  if (source.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/`
  if (source.clinicalTrialId) return `https://clinicaltrials.gov/study/${source.clinicalTrialId}`
  if (source.regulatoryUrl) return source.regulatoryUrl
  return null
}

export function EvidenceSourceList({ evidence }: { evidence: ClaimEvidenceView[] }) {
  if (evidence.length === 0) {
    return <p style={{ color: 'var(--color-text-faint)' }}>No linked sources yet.</p>
  }
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-3)' }}>
      {evidence.map((link, i) => {
        const url = sourceUrl(link.source)
        return (
          <li
            key={i}
            style={{
              borderLeft: '3px solid var(--color-border-strong)',
              paddingLeft: 'var(--space-3)',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <strong>{EVIDENCE_RELATIONSHIP_LABELS[link.relationship]}:</strong>{' '}
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {link.source.title}
                </a>
              ) : (
                link.source.title
              )}
              {link.source.retractionStatus && (
                <span style={{ color: 'var(--color-unknown)', fontWeight: 600 }}>
                  {' '}
                  ({link.source.retractionStatus})
                </span>
              )}
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {[link.source.sourceType, link.source.species, link.source.studyDesign, link.source.publicationYear]
                .filter(Boolean)
                .join(' · ')}
              {link.independentGroupStatus ? ' · independent group' : ''}
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{link.directlyMeasuredResult}</p>
          </li>
        )
      })}
    </ul>
  )
}
