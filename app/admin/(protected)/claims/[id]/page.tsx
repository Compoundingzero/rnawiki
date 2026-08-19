import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { claims, entities, mechanismSteps, claimEvidence, claimEvents, evidenceSources } from '@/db/schema'
import { eq, asc, desc, sql } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import { EVIDENCE_STATUSES, EVIDENCE_STATUS_LABELS, EVIDENCE_RELATIONSHIPS, EVIDENCE_RELATIONSHIP_LABELS } from '@/lib/evidence'
import { searchEvidenceSources } from '@/lib/admin/evidence-search'
import {
  updateClaim,
  publishClaim,
  addMechanismStep,
  updateMechanismStep,
  deleteMechanismStep,
  moveMechanismStep,
  attachEvidence,
  updateClaimEvidence,
  detachEvidence,
} from '../actions'
import { ClaimForm } from '../ClaimForm'
import { ClaimEventsForm, type ClaimEventSourceOption } from '../ClaimEventsForm'

export const metadata: Metadata = { title: 'Edit claim', robots: { index: false, follow: false } }

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; success?: string; evidenceQuery?: string; eventSourceQuery?: string }>
}

/** Narrow a full evidenceSources row to the fields the event editor needs to label an option. */
function toSourceOption(source: {
  id: number
  title: string
  publicationYear: number | null
  doi: string | null
  pmid: string | null
}): ClaimEventSourceOption {
  return { id: source.id, title: source.title, publicationYear: source.publicationYear, doi: source.doi, pmid: source.pmid }
}

async function getEntityOptions() {
  return db.select({ id: entities.id, canonicalName: entities.canonicalName }).from(entities).orderBy(entities.canonicalName)
}

export default async function EditClaimPage({ params, searchParams }: Props) {
  const [{ id }, { error, success, evidenceQuery, eventSourceQuery }, user, entityOptions] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
    getEntityOptions(),
  ])
  const claimId = Number.parseInt(id, 10)
  if (!Number.isFinite(claimId)) notFound()

  const [claim] = await db.select().from(claims).where(eq(claims.id, claimId)).limit(1)
  if (!claim) notFound()

  const [steps, links, evidenceResults, events, eventSourceResults] = await Promise.all([
    db.select().from(mechanismSteps).where(eq(mechanismSteps.claimId, claimId)).orderBy(asc(mechanismSteps.displayOrder)),
    db
      .select({ link: claimEvidence, source: evidenceSources })
      .from(claimEvidence)
      .innerJoin(evidenceSources, eq(claimEvidence.evidenceSourceId, evidenceSources.id))
      .where(eq(claimEvidence.claimId, claimId))
      .orderBy(desc(claimEvidence.displayPriority)),
    evidenceQuery ? searchEvidenceSources(evidenceQuery) : Promise.resolve([]),
    // Every status, not just published — this is the editorial view of the failure section.
    // The inner join is what the NOT NULL evidenceSourceId buys: an event always has its source.
    db
      .select({ event: claimEvents, source: evidenceSources })
      .from(claimEvents)
      .innerJoin(evidenceSources, eq(claimEvents.evidenceSourceId, evidenceSources.id))
      .where(eq(claimEvents.claimId, claimId))
      .orderBy(desc(claimEvents.displayPriority), sql`${claimEvents.eventDate} desc nulls last`),
    // Run unconditionally: with no query this returns the most recently checked sources, so the
    // "Add an event" form always has real options to cite rather than an empty required select.
    searchEvidenceSources(eventSourceQuery ?? ''),
  ])

  const isAdmin = user?.role === 'administrator'
  const attachedSourceIds = new Set(links.map((l) => l.source.id))

  return (
    <div className="admin-page">
      <p className="metaline" style={{ marginBottom: 'var(--s4)' }}>
        <Link href="/admin/claims">← Claims</Link>
      </p>

      <div className="admin-head">
        <div>
          <p className="eyebrow">Claim record · {claim.slug}</p>
          <h1 className="h1" style={{ marginTop: 'var(--s2)' }}>
            {claim.consumerQuestion}
          </h1>
        </div>
        <span className="tag" data-state={claim.publicationStatus}>
          {claim.publicationStatus.replace(/_/g, ' ')}
        </span>
      </div>

      <dl className="speclabel" style={{ marginBottom: 'var(--s5)' }}>
        <div className="speclabel__row">
          <dt className="speclabel__key">Version</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {claim.version}
          </dd>
        </div>
        <div className="speclabel__row">
          <dt className="speclabel__key">Reviewer</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {claim.reviewerId ? `user #${claim.reviewerId}` : 'None recorded'}
          </dd>
        </div>
        <div className="speclabel__row">
          <dt className="speclabel__key">Last reviewed</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {claim.lastReviewedAt ? claim.lastReviewedAt.toISOString().slice(0, 10) : 'Never'}
          </dd>
        </div>
      </dl>

      {error && (
        <div className="callout" data-tone="danger" role="alert" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Not saved</p>
          <p style={{ fontSize: 'var(--size-small)' }}>{error}</p>
        </div>
      )}
      {success && (
        <div className="callout" role="status" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Saved</p>
          <p style={{ fontSize: 'var(--size-small)' }}>{success}</p>
        </div>
      )}

      {isAdmin && claim.publicationStatus === 'approved' && (
        <form action={publishClaim.bind(null, claim.id)} style={{ marginBottom: 'var(--s5)' }}>
          <button type="submit" className="btn btn--primary">
            Publish this claim
          </button>
        </form>
      )}

      <section>
        <div className="section-head">
          <h2 className="h2">Details</h2>
        </div>
        <ClaimForm
          action={updateClaim.bind(null, claim.id)}
          entityOptions={entityOptions}
          canPublish={isAdmin}
          submitLabel="Save changes"
          values={{
            entityId: claim.entityId,
            slug: claim.slug,
            claimType: claim.claimType,
            consumerQuestion: claim.consumerQuestion,
            directAnswer: claim.directAnswer,
            measuredFinding: claim.measuredFinding,
            inference: claim.inference,
            proofBoundaryStage: claim.proofBoundaryStage,
            proofBoundaryExplanation: claim.proofBoundaryExplanation,
            remainingUnknown: claim.remainingUnknown,
            evidenceNeededNext: claim.evidenceNeededNext,
            mechanismSummary: claim.mechanismSummary ?? '',
            outcomeSummary: claim.outcomeSummary ?? '',
            publicationStatus: claim.publicationStatus,
            displayPriority: claim.displayPriority,
            // Rendered from the stored instant in UTC, the timezone every date on this site
            // resolves in — see lib/evidence-view.ts. Formatting it in server-local time would
            // show the editor a different day than the record prints.
            checkedDate: claim.checkedAt ? claim.checkedAt.toISOString().slice(0, 10) : '',
          }}
        />
      </section>

      <hr className="rule" />

      <section>
        <div className="section-head">
          <h2 className="h2">Mechanism steps</h2>
          <span className="eyebrow" style={{ flex: 'none' }}>
            {steps.length} recorded
          </span>
        </div>

        {steps.length === 0 ? (
          <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
            No mechanism steps yet.
          </p>
        ) : (
          <ol className="admin-list">
            {steps.map((step, i) => (
              <li key={step.id}>
                <details className="admin-disclosure">
                  <summary>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                      {String(step.displayOrder).padStart(2, '0')}
                    </span>
                    <span>{step.technicalLabel}</span>
                    <span className="tag" data-status={step.status}>
                      {EVIDENCE_STATUS_LABELS[step.status]}
                    </span>
                  </summary>
                  <div className="admin-disclosure__body">
                    <div className="admin-actions">
                      <form action={moveMechanismStep.bind(null, step.id, 'up')}>
                        <button type="submit" className="btn" disabled={i === 0}>
                          Move up
                        </button>
                      </form>
                      <form action={moveMechanismStep.bind(null, step.id, 'down')}>
                        <button type="submit" className="btn" disabled={i === steps.length - 1}>
                          Move down
                        </button>
                      </form>
                    </div>

                    <form action={updateMechanismStep.bind(null, step.id)} className="admin-form">
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`step-order-${step.id}`}>
                          Display order
                        </label>
                        <input id={`step-order-${step.id}`} name="displayOrder" type="number" defaultValue={step.displayOrder} required className="field" />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`step-label-${step.id}`}>
                          Technical label
                        </label>
                        <input id={`step-label-${step.id}`} name="technicalLabel" defaultValue={step.technicalLabel} required className="field" />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`step-explanation-${step.id}`}>
                          Plain-language explanation
                        </label>
                        <textarea id={`step-explanation-${step.id}`} name="plainLanguageExplanation" defaultValue={step.plainLanguageExplanation} required className="field" />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`step-context-${step.id}`}>
                          Evidence context
                        </label>
                        <textarea id={`step-context-${step.id}`} name="evidenceContext" defaultValue={step.evidenceContext} required className="field" />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`step-status-${step.id}`}>
                          Status
                        </label>
                        <select id={`step-status-${step.id}`} name="status" defaultValue={step.status} required className="field">
                          {EVIDENCE_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {EVIDENCE_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`step-links-${step.id}`}>
                          Source links
                        </label>
                        <textarea
                          id={`step-links-${step.id}`}
                          name="sourceLinks"
                          defaultValue={step.sourceLinks.join('\n')}
                          aria-describedby={`step-links-help-${step.id}`}
                          className="field"
                        />
                        <p id={`step-links-help-${step.id}`} className="admin-help">
                          One URL per line.
                        </p>
                      </div>
                      <div className="admin-actions">
                        <button type="submit" className="btn">
                          Save step
                        </button>
                      </div>
                    </form>

                    <form action={deleteMechanismStep.bind(null, step.id)}>
                      <button type="submit" className="btn btn--danger">
                        Remove step
                      </button>
                    </form>
                  </div>
                </details>
              </li>
            ))}
          </ol>
        )}

        <h3 className="h4" style={{ margin: 'var(--s6) 0 var(--s4)' }}>
          Add a step
        </h3>
        <form action={addMechanismStep.bind(null, claim.id)} className="admin-form">
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-step-order">
              Display order
            </label>
            <input id="new-step-order" name="displayOrder" type="number" defaultValue={steps.length + 1} required className="field" />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-step-label">
              Technical label
            </label>
            <input id="new-step-label" name="technicalLabel" required className="field" />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-step-explanation">
              Plain-language explanation
            </label>
            <textarea id="new-step-explanation" name="plainLanguageExplanation" required className="field" />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-step-context">
              Evidence context
            </label>
            <textarea id="new-step-context" name="evidenceContext" required className="field" />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-step-status">
              Status
            </label>
            <select id="new-step-status" name="status" required className="field" defaultValue="measured">
              {EVIDENCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {EVIDENCE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-step-links">
              Source links
            </label>
            <textarea id="new-step-links" name="sourceLinks" aria-describedby="new-step-links-help" className="field" />
            <p id="new-step-links-help" className="admin-help">
              One URL per line.
            </p>
          </div>
          <div className="admin-actions">
            <button type="submit" className="btn">
              Add step
            </button>
          </div>
        </form>
      </section>

      <hr className="rule" />

      <section>
        <div className="section-head">
          <h2 className="h2">Evidence</h2>
          <span className="eyebrow" style={{ flex: 'none' }}>
            {links.length} linked
          </span>
        </div>

        {links.length === 0 ? (
          <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
            No evidence linked yet.
          </p>
        ) : (
          <ul className="admin-list">
            {links.map(({ link, source }) => (
              <li key={link.id}>
                <details className="admin-disclosure">
                  <summary>
                    <span className="eyebrow">{EVIDENCE_RELATIONSHIP_LABELS[link.relationship]}</span>
                    <span>
                      {source.title}
                      {source.publicationYear ? ` (${source.publicationYear})` : ''}
                    </span>
                  </summary>
                  <div className="admin-disclosure__body">
                    <p className="metaline">
                      <span>{[source.sourceType, source.species, source.studyDesign].filter(Boolean).join(' · ')}</span>
                      {source.doi && <span>DOI {source.doi}</span>}
                      {source.pmid && <span>PMID {source.pmid}</span>}
                      <Link href={`/admin/evidence/${source.id}`}>Edit source →</Link>
                    </p>

                    <form action={updateClaimEvidence.bind(null, link.id)} className="admin-form">
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`link-relationship-${link.id}`}>
                          Relationship
                        </label>
                        <select id={`link-relationship-${link.id}`} name="relationship" defaultValue={link.relationship} required className="field">
                          {EVIDENCE_RELATIONSHIPS.map((r) => (
                            <option key={r} value={r}>
                              {EVIDENCE_RELATIONSHIP_LABELS[r]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`link-part-${link.id}`}>
                          Claim part addressed
                        </label>
                        <textarea id={`link-part-${link.id}`} name="claimPartAddressed" defaultValue={link.claimPartAddressed} required className="field" />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`link-result-${link.id}`}>
                          Directly measured result
                        </label>
                        <textarea id={`link-result-${link.id}`} name="directlyMeasuredResult" defaultValue={link.directlyMeasuredResult} required className="field" />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`link-notes-${link.id}`}>
                          Editorial notes
                        </label>
                        <textarea id={`link-notes-${link.id}`} name="editorialNotes" defaultValue={link.editorialNotes ?? ''} className="field" />
                      </div>
                      <label className="admin-check">
                        <input type="checkbox" name="independentGroupStatus" defaultChecked={link.independentGroupStatus} />
                        From an independent research group
                      </label>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`link-priority-${link.id}`}>
                          Display priority
                        </label>
                        <input id={`link-priority-${link.id}`} name="displayPriority" type="number" defaultValue={link.displayPriority} className="field" />
                      </div>
                      <div className="admin-actions">
                        <button type="submit" className="btn">
                          Save link
                        </button>
                      </div>
                    </form>

                    <form action={detachEvidence.bind(null, link.id)}>
                      <button type="submit" className="btn btn--danger">
                        Detach
                      </button>
                    </form>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}

        <h3 className="h4" style={{ margin: 'var(--s6) 0 var(--s4)' }}>
          Attach existing evidence
        </h3>
        <form method="GET" className="admin-form admin-form--inline" style={{ marginBottom: 'var(--s5)' }}>
          <div className="admin-field">
            <label className="admin-label" htmlFor="evidenceQuery">
              Search sources
            </label>
            <input
              id="evidenceQuery"
              name="evidenceQuery"
              defaultValue={evidenceQuery ?? ''}
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

        {evidenceQuery &&
          (evidenceResults.length === 0 ? (
            <p className="prose" style={{ fontSize: 'var(--size-small)' }}>
              No matching sources. <Link href="/admin/evidence/new">Create an evidence source</Link>, or import one by
              DOI or PMID.
            </p>
          ) : (
            <ul className="admin-list">
              {evidenceResults.map((source) => (
                <li key={source.id}>
                  {attachedSourceIds.has(source.id) ? (
                    <div style={{ padding: 'var(--s3) 0', borderBottom: 'var(--hairline) solid var(--border)' }}>
                      <p style={{ fontSize: 'var(--size-small)', fontWeight: 600 }}>
                        {source.title} {source.publicationYear ? `(${source.publicationYear})` : ''}
                      </p>
                      <p className="metaline" style={{ marginTop: 'var(--s1)' }}>
                        <span>Already linked to this claim</span>
                      </p>
                    </div>
                  ) : (
                    <details className="admin-disclosure">
                      <summary>
                        <span>
                          {source.title} {source.publicationYear ? `(${source.publicationYear})` : ''}
                        </span>
                        <span className="eyebrow">
                          {[source.sourceType, source.journalOrIssuer].filter(Boolean).join(' · ')}
                          {source.doi ? ` · DOI ${source.doi}` : ''}
                        </span>
                      </summary>
                      <div className="admin-disclosure__body">
                        <form action={attachEvidence.bind(null, claim.id, source.id)} className="admin-form">
                          <div className="admin-field">
                            <label className="admin-label" htmlFor={`attach-relationship-${source.id}`}>
                              Relationship
                            </label>
                            <select id={`attach-relationship-${source.id}`} name="relationship" required className="field" defaultValue="supports">
                              {EVIDENCE_RELATIONSHIPS.map((r) => (
                                <option key={r} value={r}>
                                  {EVIDENCE_RELATIONSHIP_LABELS[r]}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="admin-field">
                            <label className="admin-label" htmlFor={`attach-part-${source.id}`}>
                              Claim part addressed
                            </label>
                            <textarea id={`attach-part-${source.id}`} name="claimPartAddressed" required className="field" />
                          </div>
                          <div className="admin-field">
                            <label className="admin-label" htmlFor={`attach-result-${source.id}`}>
                              Directly measured result
                            </label>
                            <textarea id={`attach-result-${source.id}`} name="directlyMeasuredResult" required className="field" />
                          </div>
                          <label className="admin-check">
                            <input type="checkbox" name="independentGroupStatus" />
                            From an independent research group
                          </label>
                          <div className="admin-actions">
                            <button type="submit" className="btn">
                              Attach to this claim
                            </button>
                          </div>
                        </form>
                      </div>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          ))}
      </section>

      <hr className="rule" />

      <ClaimEventsForm
        claimId={claim.id}
        canPublish={isAdmin}
        sourceQuery={eventSourceQuery ?? ''}
        preservedEvidenceQuery={evidenceQuery}
        sourceOptions={eventSourceResults.map(toSourceOption)}
        events={events.map(({ event, source }) => ({
          id: event.id,
          evidenceSourceId: event.evidenceSourceId,
          eventType: event.eventType,
          developmentGate: event.developmentGate,
          plainSummary: event.plainSummary,
          whatItSuggests: event.whatItSuggests,
          whatItDoesNotEstablish: event.whatItDoesNotEstablish,
          eventDate: event.eventDate,
          displayPriority: event.displayPriority,
          publicationStatus: event.publicationStatus,
          source: toSourceOption(source),
        }))}
      />
    </div>
  )
}
