// The claim-event editor: the admin surface behind the record's "What did not work or conflicts
// with this answer" section. A server component — plain <form action={serverAction}> like every
// other editor under app/admin, so it works with JavaScript disabled and holds no client state.
//
// Two things about this file are editorial, not cosmetic, and should survive any redesign:
//
//   1. The source field is a required <select>, never a free-text box and never optional. The
//      options come from lib/admin/evidence-search.ts, so an editor can only cite a source that is
//      already on file with its DOI/PMID recorded. The server re-checks it — see the EDITORIAL
//      BOUNDARY block in actions.ts — because a browser control is a convenience, not a guarantee.
//   2. Every prose field is typed by a person. There is no generate button, no suggestion, no
//      prefill from a DOI or PMID lookup, and no place for one. docs/editorial-methodology.md
//      draws that line: a lookup can say what a paper is, never what it found or why it failed.
//
// The internal event category and development gate are admin vocabulary only. Readers never see
// the value chosen here; they see the sentence lib/claim-events.ts maps it to.

import { publicationStatusEnum } from '@/db/schema'
import {
  CLAIM_EVENT_TYPES,
  CLAIM_EVENT_TYPE_ADMIN_LABELS,
  DEVELOPMENT_GATES,
  DEVELOPMENT_GATE_ADMIN_LABELS,
  type ClaimEventType,
  type DevelopmentGate,
} from '@/lib/claim-events'
import { CLAIM_EVENT_FIELD_CAPS } from '@/lib/admin/forms'
import { createClaimEvent, updateClaimEvent, publishClaimEvent, deleteClaimEvent } from './actions'

function humanize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
}

export interface ClaimEventSourceOption {
  id: number
  title: string
  publicationYear: number | null
  doi: string | null
  pmid: string | null
}

export interface ClaimEventRow {
  id: number
  evidenceSourceId: number
  eventType: ClaimEventType
  developmentGate: DevelopmentGate
  plainSummary: string
  whatItSuggests: string
  whatItDoesNotEstablish: string
  eventDate: Date | null
  displayPriority: number
  publicationStatus: string
  source: ClaimEventSourceOption
}

interface ClaimEventFieldValues {
  evidenceSourceId: number | ''
  eventType: string
  developmentGate: string
  plainSummary: string
  whatItSuggests: string
  whatItDoesNotEstablish: string
  eventDate: string
  displayPriority: number
  publicationStatus: string
}

const EMPTY_VALUES: ClaimEventFieldValues = {
  evidenceSourceId: '',
  eventType: 'null_result',
  developmentGate: 'clinical_outcome',
  plainSummary: '',
  whatItSuggests: '',
  whatItDoesNotEstablish: '',
  eventDate: '',
  displayPriority: 0,
  publicationStatus: 'draft',
}

function sourceLabel(source: ClaimEventSourceOption): string {
  const year = source.publicationYear ? ` (${source.publicationYear})` : ''
  const id = source.doi ? ` · DOI ${source.doi}` : source.pmid ? ` · PMID ${source.pmid}` : ''
  return `${source.title}${year}${id}`
}

/** An <input type="date"> wants YYYY-MM-DD; a null eventDate is a legitimate "not recorded". */
function dateInputValue(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : ''
}

/**
 * Keep the event's own source selectable even when the current search does not return it —
 * otherwise saving an unrelated edit would silently re-point the citation at whatever happened to
 * be first in the list.
 */
function withCurrentSource(options: ClaimEventSourceOption[], current?: ClaimEventSourceOption): ClaimEventSourceOption[] {
  if (!current) return options
  return options.some((o) => o.id === current.id) ? options : [current, ...options]
}

function ClaimEventFields({
  idPrefix,
  values,
  sourceOptions,
  canPublish,
}: {
  idPrefix: string
  values: ClaimEventFieldValues
  sourceOptions: ClaimEventSourceOption[]
  canPublish: boolean
}) {
  return (
    <>
      <div className="admin-field">
        <label className="admin-label" htmlFor={`${idPrefix}-source`}>
          Source
        </label>
        <select
          id={`${idPrefix}-source`}
          name="evidenceSourceId"
          defaultValue={values.evidenceSourceId}
          required
          aria-describedby={`${idPrefix}-source-help`}
          className="field"
        >
          <option value="" disabled>
            Choose a source…
          </option>
          {sourceOptions.map((source) => (
            <option key={source.id} value={source.id}>
              {sourceLabel(source)}
            </option>
          ))}
        </select>
        <p id={`${idPrefix}-source-help`} className="admin-help">
          Required. An event with no source is an opinion, so the server refuses to save one — search above to widen
          this list, or add the source under Evidence first.
        </p>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor={`${idPrefix}-type`}>
          Internal event category
        </label>
        <select id={`${idPrefix}-type`} name="eventType" defaultValue={values.eventType} required className="field" aria-describedby={`${idPrefix}-type-help`}>
          {CLAIM_EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {CLAIM_EVENT_TYPE_ADMIN_LABELS[t]}
            </option>
          ))}
        </select>
        <p id={`${idPrefix}-type-help`} className="admin-help">
          Filing vocabulary only. Readers never see this label — they see the plain sentence lib/claim-events.ts maps
          it to.
        </p>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor={`${idPrefix}-gate`}>
          Development gate
        </label>
        <select id={`${idPrefix}-gate`} name="developmentGate" defaultValue={values.developmentGate} required className="field" aria-describedby={`${idPrefix}-gate-help`}>
          {DEVELOPMENT_GATES.map((g) => (
            <option key={g} value={g}>
              {DEVELOPMENT_GATE_ADMIN_LABELS[g]}
            </option>
          ))}
        </select>
        <p id={`${idPrefix}-gate-help`} className="admin-help">
          Where the development chain broke, as this source records it — a location, not a rank. Choose Unknown rather
          than guessing.
        </p>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor={`${idPrefix}-summary`}>
          What happened
        </label>
        <textarea
          id={`${idPrefix}-summary`}
          name="plainSummary"
          defaultValue={values.plainSummary}
          required
          maxLength={CLAIM_EVENT_FIELD_CAPS.plainSummary}
          aria-describedby={`${idPrefix}-summary-help`}
          className="field"
        />
        <p id={`${idPrefix}-summary-help`} className="admin-help">
          What the source records happened, in plain words, with nothing added that it does not say. Up to{' '}
          {CLAIM_EVENT_FIELD_CAPS.plainSummary} characters.
        </p>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor={`${idPrefix}-suggests`}>
          What it suggests
        </label>
        <textarea
          id={`${idPrefix}-suggests`}
          name="whatItSuggests"
          defaultValue={values.whatItSuggests}
          required
          maxLength={CLAIM_EVENT_FIELD_CAPS.whatItSuggests}
          aria-describedby={`${idPrefix}-suggests-help`}
          className="field"
        />
        <p id={`${idPrefix}-suggests-help`} className="admin-help">
          The narrowest reading the result supports, bounded to the endpoint, dose, duration and population that were
          actually studied. Up to {CLAIM_EVENT_FIELD_CAPS.whatItSuggests} characters.
        </p>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor={`${idPrefix}-not-establish`}>
          What it does not establish
        </label>
        <textarea
          id={`${idPrefix}-not-establish`}
          name="whatItDoesNotEstablish"
          defaultValue={values.whatItDoesNotEstablish}
          required
          maxLength={CLAIM_EVENT_FIELD_CAPS.whatItDoesNotEstablish}
          aria-describedby={`${idPrefix}-not-establish-help`}
          className="field"
        />
        <p id={`${idPrefix}-not-establish-help`} className="admin-help">
          What this result is often taken to mean but did not establish, said plainly — a missed endpoint is not proof
          the idea is wrong. Up to {CLAIM_EVENT_FIELD_CAPS.whatItDoesNotEstablish} characters.
        </p>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor={`${idPrefix}-date`}>
          Event date
        </label>
        <input
          id={`${idPrefix}-date`}
          name="eventDate"
          type="date"
          defaultValue={values.eventDate}
          aria-describedby={`${idPrefix}-date-help`}
          className="field"
        />
        <p id={`${idPrefix}-date-help`} className="admin-help">
          Leave blank if the source does not record one. Never estimate a date.
        </p>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor={`${idPrefix}-priority`}>
          Display priority
        </label>
        <input
          id={`${idPrefix}-priority`}
          name="displayPriority"
          type="number"
          defaultValue={values.displayPriority}
          aria-describedby={`${idPrefix}-priority-help`}
          className="field"
        />
        <p id={`${idPrefix}-priority-help`} className="admin-help">
          Higher sorts earlier inside the evidence record.
        </p>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor={`${idPrefix}-status`}>
          Publication status
        </label>
        <select
          id={`${idPrefix}-status`}
          name="publicationStatus"
          defaultValue={values.publicationStatus}
          required
          aria-describedby={canPublish ? undefined : `${idPrefix}-status-help`}
          className="field"
        >
          {publicationStatusEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {humanize(v)}
            </option>
          ))}
        </select>
        {!canPublish && (
          <p id={`${idPrefix}-status-help`} className="admin-help">
            Only administrators can move status to &quot;published&quot; (enforced on save, not just in this menu).
          </p>
        )}
      </div>
    </>
  )
}

export function ClaimEventsForm({
  claimId,
  events,
  sourceOptions,
  sourceQuery,
  preservedEvidenceQuery,
  canPublish,
}: {
  claimId: number
  events: ClaimEventRow[]
  sourceOptions: ClaimEventSourceOption[]
  sourceQuery: string
  /** Carried through the GET search so searching here does not clear the Evidence section's results. */
  preservedEvidenceQuery?: string
  canPublish: boolean
}) {
  return (
    <section>
      <div className="section-head">
        <h2 className="h2">Claim events</h2>
        <span className="eyebrow" style={{ flex: 'none' }}>
          {events.length} recorded
        </span>
      </div>

      <p className="admin-help" style={{ maxWidth: '44rem', marginBottom: 'var(--s5)' }}>
        A claim event records a result or development event that did not support this answer, taken from one source
        that is already on file. Write every field yourself from that source — nothing here is generated, and a DOI or
        PMID lookup never fills these boxes.
      </p>

      {events.length === 0 ? (
        <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
          No claim events yet.
        </p>
      ) : (
        <ul className="admin-list">
          {events.map((event) => (
            <li key={event.id}>
              <details className="admin-disclosure">
                <summary>
                  <span className="eyebrow">{CLAIM_EVENT_TYPE_ADMIN_LABELS[event.eventType]}</span>
                  <span>{event.plainSummary}</span>
                  <span className="tag" data-state={event.publicationStatus}>
                    {event.publicationStatus.replace(/_/g, ' ')}
                  </span>
                </summary>
                <div className="admin-disclosure__body">
                  <p className="metaline">
                    <span>{DEVELOPMENT_GATE_ADMIN_LABELS[event.developmentGate]}</span>
                    <span>{sourceLabel(event.source)}</span>
                    {event.eventDate && <span>{dateInputValue(event.eventDate)}</span>}
                  </p>

                  {canPublish && event.publicationStatus === 'approved' && (
                    <form action={publishClaimEvent.bind(null, event.id)}>
                      <button type="submit" className="btn btn--primary">
                        Publish this event
                      </button>
                    </form>
                  )}

                  <form action={updateClaimEvent.bind(null, event.id)} className="admin-form">
                    <ClaimEventFields
                      idPrefix={`event-${event.id}`}
                      sourceOptions={withCurrentSource(sourceOptions, event.source)}
                      canPublish={canPublish}
                      values={{
                        evidenceSourceId: event.evidenceSourceId,
                        eventType: event.eventType,
                        developmentGate: event.developmentGate,
                        plainSummary: event.plainSummary,
                        whatItSuggests: event.whatItSuggests,
                        whatItDoesNotEstablish: event.whatItDoesNotEstablish,
                        eventDate: dateInputValue(event.eventDate),
                        displayPriority: event.displayPriority,
                        publicationStatus: event.publicationStatus,
                      }}
                    />
                    <div className="admin-actions">
                      <button type="submit" className="btn">
                        Save event
                      </button>
                    </div>
                  </form>

                  <form action={deleteClaimEvent.bind(null, event.id)}>
                    <button type="submit" className="btn btn--danger">
                      Remove event
                    </button>
                  </form>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      <h3 className="h4" style={{ margin: 'var(--s6) 0 var(--s4)' }}>
        Add an event
      </h3>

      {/* Its own GET search, kept outside the create form because a form cannot nest. */}
      <form method="GET" className="admin-form admin-form--inline" style={{ marginBottom: 'var(--s5)' }}>
        {preservedEvidenceQuery && <input type="hidden" name="evidenceQuery" value={preservedEvidenceQuery} />}
        <div className="admin-field">
          <label className="admin-label" htmlFor="eventSourceQuery">
            Search sources to cite
          </label>
          <input
            id="eventSourceQuery"
            name="eventSourceQuery"
            defaultValue={sourceQuery}
            placeholder="Title, DOI, or PMID"
            className="field"
            style={{ minWidth: '18rem' }}
          />
        </div>
        <div className="admin-actions">
          <button type="submit" className="btn">
            Search
          </button>
        </div>
      </form>

      {sourceOptions.length === 0 ? (
        <p className="prose" style={{ fontSize: 'var(--size-small)' }}>
          No sources match that search, so there is nothing to cite yet. Widen the search, or record the source under
          Evidence first — an event cannot be saved without one.
        </p>
      ) : (
        <form action={createClaimEvent.bind(null, claimId)} className="admin-form">
          <ClaimEventFields idPrefix="new-event" values={EMPTY_VALUES} sourceOptions={sourceOptions} canPublish={canPublish} />
          <div className="admin-actions">
            <button type="submit" className="btn">
              Add event
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
