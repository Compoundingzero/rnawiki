import type { EvidenceChangeView } from '@/lib/types'
import { EVIDENCE_CHANGE_TYPE_PUBLIC } from '@/lib/evidence'
import { canonicalStageLabel, readableDate, isoDate } from '@/lib/evidence-view'

/**
 * How this answer changed, newest first.
 *
 * An answer that quietly rewrites itself is indistinguishable from one that was always right. This
 * is the audit trail that makes the difference visible, and it prints only rows that exist: no
 * "no changes yet" line, no invented first entry for the day the record was written.
 *
 * The change type comes through EVIDENCE_CHANGE_TYPE_PUBLIC, never as the raw enum, and a boundary
 * move is printed only when both the previous and the new stage were recorded — a half-recorded
 * move would otherwise read as a claim about a stage nobody stored.
 */
export function EvidenceChangeTimeline({ changes }: { changes: EvidenceChangeView[] }) {
  if (changes.length === 0) return null

  return (
    <ol className="timeline">
      {changes.map((change) => {
        const isUrl = /^https?:\/\//i.test(change.source)
        return (
          <li className="timeline__item" key={change.id}>
            <p className="timeline__date">
              <time dateTime={isoDate(change.publicationDate)}>{readableDate(change.publicationDate)}</time>
            </p>
            <p className="timeline__h">{EVIDENCE_CHANGE_TYPE_PUBLIC[change.changeType]}</p>
            {change.previousBoundary && change.newBoundary && (
              <p className="timeline__move">
                How far the evidence goes moved from {canonicalStageLabel(change.previousBoundary)} to{' '}
                {canonicalStageLabel(change.newBoundary)}.
              </p>
            )}
            <p>{change.explanation}</p>
            <p className="source__line">
              Source:{' '}
              {isUrl ? (
                <a href={change.source} className="id">
                  {change.source}
                </a>
              ) : (
                change.source
              )}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
