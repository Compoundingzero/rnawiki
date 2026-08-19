import type { ClaimEventView } from '@/lib/types'
import { CLAIM_EVENT_TYPE_PUBLIC, DEVELOPMENT_GATE_PUBLIC } from '@/lib/claim-events'
import { readableDate, isoDate } from '@/lib/evidence-view'
import { sourceUrl } from './EvidenceSourceList'

/**
 * What did not work, or conflicts with this answer.
 *
 * Two hard rules hold this section together:
 *
 * 1. Every row here is anchored to a real, already-cited source. `claimEvents.evidenceSourceId` is
 *    NOT NULL by design, so an event cannot exist without one — that is the data-integrity rule
 *    that keeps this section from becoming editorialised opinion. Nothing renders when there is
 *    nothing verified to render: no placeholder row, no "none recorded", no empty state.
 *
 * 2. A commercial discontinuation is not a scientific failure. The public sentence for the event
 *    type is printed first, before the editor's summary, so a programme stopped for commercial
 *    reasons can never be read under wording that implies the science failed. Raw enum values are
 *    never printed — every value comes through the maps in lib/claim-events.ts.
 *
 * `fallbackSummary` is assembled by the caller from curated claim-evidence relationships. It is a
 * deterministic join of stored strings, never a model-written sentence, and it is null when no
 * `contradicts` or `limits` relationship exists.
 */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="event__row">
      <dt className="event__t">{label}</dt>
      <dd className="event__v">{children}</dd>
    </div>
  )
}

export function ClaimEventList({
  events,
  fallbackSummary,
}: {
  events: ClaimEventView[]
  fallbackSummary: string | null
}) {
  if (events.length === 0 && !fallbackSummary) return null

  if (events.length === 0) {
    return <p>{fallbackSummary}</p>
  }

  return (
    <div>
      {events.map((event) => {
        const url = sourceUrl(event.source)
        return (
          <div className="event" key={event.id}>
            {/* A bare <dl>: the labelled rows carry their own class hooks. */}
            <dl>
              <Row label="What happened">
                {/* Two lines, not one run-on value. The category sentence is a definition of a
                    kind of event and the summary is the fact, and concatenated into one
                    paragraph the reader met a dictionary entry before anything that happened.
                    It stays FIRST and it stays present: it is the only thing standing between
                    a programme stopped for commercial reasons and a reader concluding the
                    science failed, and two of the twelve strings say the summary is recorded
                    below them.
                    It is set in full ink, not muted — see .event__kind in app/globals.css. Muted
                    it was the same grey as the "What happened" label above it, so the label
                    captioned the definition and the black summary lost its label. It is kept
                    short instead: the category strings in lib/claim-events.ts name the category
                    and leave the specifics to the gate row and to this summary. */}
                <span className="event__kind">{CLAIM_EVENT_TYPE_PUBLIC[event.eventType]}</span>
                {event.plainSummary}
                {event.eventDate && (
                  <>
                    {' '}
                    Recorded <time dateTime={isoDate(event.eventDate)}>{readableDate(event.eventDate)}</time>.
                  </>
                )}
              </Row>
              <Row label="Where the development chain broke">{DEVELOPMENT_GATE_PUBLIC[event.developmentGate]}</Row>
              <Row label="What it suggests">{event.whatItSuggests}</Row>
              <Row label="What it does not establish">{event.whatItDoesNotEstablish}</Row>
              <Row label="Source">{url ? <a href={url}>{event.source.title}</a> : event.source.title}</Row>
            </dl>
          </div>
        )
      })}
    </div>
  )
}
