import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { claims, entities, mechanismSteps, claimEvidence, evidenceSources } from '@/db/schema'
import { eq, asc, desc } from 'drizzle-orm'
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
import * as ui from '@/lib/admin/ui'

export const metadata: Metadata = { title: 'Edit claim', robots: { index: false, follow: false } }

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; success?: string; evidenceQuery?: string }>
}

async function getEntityOptions() {
  return db.select({ id: entities.id, canonicalName: entities.canonicalName }).from(entities).orderBy(entities.canonicalName)
}

export default async function EditClaimPage({ params, searchParams }: Props) {
  const [{ id }, { error, success, evidenceQuery }, user, entityOptions] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
    getEntityOptions(),
  ])
  const claimId = Number.parseInt(id, 10)
  if (!Number.isFinite(claimId)) notFound()

  const [claim] = await db.select().from(claims).where(eq(claims.id, claimId)).limit(1)
  if (!claim) notFound()

  const [steps, links, evidenceResults] = await Promise.all([
    db.select().from(mechanismSteps).where(eq(mechanismSteps.claimId, claimId)).orderBy(asc(mechanismSteps.displayOrder)),
    db
      .select({ link: claimEvidence, source: evidenceSources })
      .from(claimEvidence)
      .innerJoin(evidenceSources, eq(claimEvidence.evidenceSourceId, evidenceSources.id))
      .where(eq(claimEvidence.claimId, claimId))
      .orderBy(desc(claimEvidence.displayPriority)),
    evidenceQuery ? searchEvidenceSources(evidenceQuery) : Promise.resolve([]),
  ])

  const isAdmin = user?.role === 'administrator'
  const attachedSourceIds = new Set(links.map((l) => l.source.id))

  return (
    <div style={ui.page}>
      <p style={{ marginBottom: 'var(--space-2)' }}>
        <Link href="/admin/claims">← Claims</Link>
      </p>
      <div style={{ ...ui.flexRow, justifyContent: 'space-between' }}>
        <h1 style={ui.h1}>{claim.consumerQuestion}</h1>
        <span style={ui.statusBadgeStyle(claim.publicationStatus)}>{claim.publicationStatus.replace(/_/g, ' ')}</span>
      </div>
      <p style={{ color: 'var(--color-text-faint)', fontSize: '0.85rem', marginTop: 0 }}>
        Version {claim.version} · reviewer:{' '}
        {claim.reviewerId ? `user #${claim.reviewerId}` : 'none yet'} · last reviewed:{' '}
        {claim.lastReviewedAt ? claim.lastReviewedAt.toISOString().slice(0, 10) : 'never'}
      </p>

      {error && <p style={ui.errorBanner}>{error}</p>}
      {success && <p style={ui.successBanner}>{success}</p>}

      {isAdmin && claim.publicationStatus === 'approved' && (
        <form action={publishClaim.bind(null, claim.id)} style={{ marginBottom: 'var(--space-6)' }}>
          <button type="submit" style={ui.buttonPrimary}>
            Publish this claim
          </button>
        </form>
      )}

      <section style={ui.sectionCard}>
        <h2 style={ui.h2}>Details</h2>
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
          }}
        />
      </section>

      <section style={ui.sectionCard}>
        <h2 style={ui.h2}>Mechanism steps ({steps.length})</h2>
        {steps.length === 0 ? (
          <p style={{ color: 'var(--color-text-faint)' }}>No mechanism steps yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            {steps.map((step, i) => (
              <details key={step.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                  {step.displayOrder}. {step.technicalLabel} — {EVIDENCE_STATUS_LABELS[step.status]}
                </summary>
                <div style={{ ...ui.flexRow, margin: 'var(--space-2) 0' }}>
                  <form action={moveMechanismStep.bind(null, step.id, 'up')}>
                    <button type="submit" style={ui.buttonSmall} disabled={i === 0}>
                      Move up
                    </button>
                  </form>
                  <form action={moveMechanismStep.bind(null, step.id, 'down')}>
                    <button type="submit" style={ui.buttonSmall} disabled={i === steps.length - 1}>
                      Move down
                    </button>
                  </form>
                </div>
                <form action={updateMechanismStep.bind(null, step.id)}>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`step-order-${step.id}`}>
                      Display order
                    </label>
                    <input id={`step-order-${step.id}`} name="displayOrder" type="number" defaultValue={step.displayOrder} required style={ui.input} />
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`step-label-${step.id}`}>
                      Technical label
                    </label>
                    <input id={`step-label-${step.id}`} name="technicalLabel" defaultValue={step.technicalLabel} required style={ui.input} />
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`step-explanation-${step.id}`}>
                      Plain-language explanation
                    </label>
                    <textarea id={`step-explanation-${step.id}`} name="plainLanguageExplanation" defaultValue={step.plainLanguageExplanation} required style={ui.textareaSmall} />
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`step-context-${step.id}`}>
                      Evidence context
                    </label>
                    <textarea id={`step-context-${step.id}`} name="evidenceContext" defaultValue={step.evidenceContext} required style={ui.textareaSmall} />
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`step-status-${step.id}`}>
                      Status
                    </label>
                    <select id={`step-status-${step.id}`} name="status" defaultValue={step.status} required style={ui.select}>
                      {EVIDENCE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {EVIDENCE_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`step-links-${step.id}`}>
                      Source links
                    </label>
                    <textarea
                      id={`step-links-${step.id}`}
                      name="sourceLinks"
                      defaultValue={step.sourceLinks.join('\n')}
                      style={ui.textareaSmall}
                    />
                    <p style={ui.helpText}>One URL per line.</p>
                  </div>
                  <button type="submit" style={ui.buttonSecondary}>
                    Save step
                  </button>
                </form>
                <form action={deleteMechanismStep.bind(null, step.id)} style={{ marginTop: 'var(--space-2)' }}>
                  <button type="submit" style={ui.buttonDanger}>
                    Remove step
                  </button>
                </form>
              </details>
            ))}
          </div>
        )}

        <h3 style={{ fontSize: '0.95rem' }}>Add a step</h3>
        <form action={addMechanismStep.bind(null, claim.id)}>
          <div style={ui.fieldWrap}>
            <label style={ui.label} htmlFor="new-step-order">
              Display order
            </label>
            <input id="new-step-order" name="displayOrder" type="number" defaultValue={steps.length + 1} required style={ui.input} />
          </div>
          <div style={ui.fieldWrap}>
            <label style={ui.label} htmlFor="new-step-label">
              Technical label
            </label>
            <input id="new-step-label" name="technicalLabel" required style={ui.input} />
          </div>
          <div style={ui.fieldWrap}>
            <label style={ui.label} htmlFor="new-step-explanation">
              Plain-language explanation
            </label>
            <textarea id="new-step-explanation" name="plainLanguageExplanation" required style={ui.textareaSmall} />
          </div>
          <div style={ui.fieldWrap}>
            <label style={ui.label} htmlFor="new-step-context">
              Evidence context
            </label>
            <textarea id="new-step-context" name="evidenceContext" required style={ui.textareaSmall} />
          </div>
          <div style={ui.fieldWrap}>
            <label style={ui.label} htmlFor="new-step-status">
              Status
            </label>
            <select id="new-step-status" name="status" required style={ui.select} defaultValue="measured">
              {EVIDENCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {EVIDENCE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div style={ui.fieldWrap}>
            <label style={ui.label} htmlFor="new-step-links">
              Source links
            </label>
            <textarea id="new-step-links" name="sourceLinks" style={ui.textareaSmall} />
            <p style={ui.helpText}>One URL per line.</p>
          </div>
          <button type="submit" style={ui.buttonSecondary}>
            Add step
          </button>
        </form>
      </section>

      <section style={ui.sectionCard}>
        <h2 style={ui.h2}>Evidence ({links.length})</h2>
        {links.length === 0 ? (
          <p style={{ color: 'var(--color-text-faint)' }}>No evidence linked yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            {links.map(({ link, source }) => (
              <details key={link.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                  {EVIDENCE_RELATIONSHIP_LABELS[link.relationship]}: {source.title}
                  {source.publicationYear ? ` (${source.publicationYear})` : ''}
                </summary>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-faint)' }}>
                  {[source.sourceType, source.species, source.studyDesign].filter(Boolean).join(' · ')}
                  {source.doi ? ` · DOI ${source.doi}` : ''}
                  {source.pmid ? ` · PMID ${source.pmid}` : ''} ·{' '}
                  <Link href={`/admin/evidence/${source.id}`}>edit source</Link>
                </p>
                <form action={updateClaimEvidence.bind(null, link.id)}>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`link-relationship-${link.id}`}>
                      Relationship
                    </label>
                    <select id={`link-relationship-${link.id}`} name="relationship" defaultValue={link.relationship} required style={ui.select}>
                      {EVIDENCE_RELATIONSHIPS.map((r) => (
                        <option key={r} value={r}>
                          {EVIDENCE_RELATIONSHIP_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`link-part-${link.id}`}>
                      Claim part addressed
                    </label>
                    <textarea id={`link-part-${link.id}`} name="claimPartAddressed" defaultValue={link.claimPartAddressed} required style={ui.textareaSmall} />
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`link-result-${link.id}`}>
                      Directly measured result
                    </label>
                    <textarea id={`link-result-${link.id}`} name="directlyMeasuredResult" defaultValue={link.directlyMeasuredResult} required style={ui.textareaSmall} />
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`link-notes-${link.id}`}>
                      Editorial notes
                    </label>
                    <textarea id={`link-notes-${link.id}`} name="editorialNotes" defaultValue={link.editorialNotes ?? ''} style={ui.textareaSmall} />
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.checkboxRow}>
                      <input type="checkbox" name="independentGroupStatus" defaultChecked={link.independentGroupStatus} />
                      From an independent research group
                    </label>
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`link-priority-${link.id}`}>
                      Display priority
                    </label>
                    <input id={`link-priority-${link.id}`} name="displayPriority" type="number" defaultValue={link.displayPriority} style={ui.input} />
                  </div>
                  <button type="submit" style={ui.buttonSecondary}>
                    Save
                  </button>
                </form>
                <form action={detachEvidence.bind(null, link.id)} style={{ marginTop: 'var(--space-2)' }}>
                  <button type="submit" style={ui.buttonDanger}>
                    Detach
                  </button>
                </form>
              </details>
            ))}
          </div>
        )}

        <h3 style={{ fontSize: '0.95rem' }}>Attach existing evidence</h3>
        <form method="GET" style={{ ...ui.flexRow, marginBottom: 'var(--space-4)' }}>
          <input
            name="evidenceQuery"
            defaultValue={evidenceQuery ?? ''}
            placeholder="Search by title, DOI, or PMID"
            style={{ ...ui.input, maxWidth: '24rem' }}
          />
          <button type="submit" style={ui.buttonSecondary}>
            Search
          </button>
        </form>

        {evidenceQuery && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            {evidenceResults.length === 0 ? (
              <p style={{ color: 'var(--color-text-faint)' }}>
                No matching sources. <Link href="/admin/evidence/new">Create a new evidence source</Link> or try the DOI/PMID import.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {evidenceResults.map((source) => (
                  <div key={source.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      {source.title} {source.publicationYear ? `(${source.publicationYear})` : ''}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-faint)' }}>
                      {[source.sourceType, source.journalOrIssuer].filter(Boolean).join(' · ')}
                      {source.doi ? ` · DOI ${source.doi}` : ''}
                    </p>
                    {attachedSourceIds.has(source.id) ? (
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-faint)' }}>Already linked to this claim.</p>
                    ) : (
                      <details style={{ marginTop: 'var(--space-2)' }}>
                        <summary style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Attach to this claim</summary>
                        <form action={attachEvidence.bind(null, claim.id, source.id)} style={{ marginTop: 'var(--space-2)' }}>
                          <div style={ui.fieldWrap}>
                            <label style={ui.label} htmlFor={`attach-relationship-${source.id}`}>
                              Relationship
                            </label>
                            <select id={`attach-relationship-${source.id}`} name="relationship" required style={ui.select} defaultValue="supports">
                              {EVIDENCE_RELATIONSHIPS.map((r) => (
                                <option key={r} value={r}>
                                  {EVIDENCE_RELATIONSHIP_LABELS[r]}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div style={ui.fieldWrap}>
                            <label style={ui.label} htmlFor={`attach-part-${source.id}`}>
                              Claim part addressed
                            </label>
                            <textarea id={`attach-part-${source.id}`} name="claimPartAddressed" required style={ui.textareaSmall} />
                          </div>
                          <div style={ui.fieldWrap}>
                            <label style={ui.label} htmlFor={`attach-result-${source.id}`}>
                              Directly measured result
                            </label>
                            <textarea id={`attach-result-${source.id}`} name="directlyMeasuredResult" required style={ui.textareaSmall} />
                          </div>
                          <div style={ui.fieldWrap}>
                            <label style={ui.checkboxRow}>
                              <input type="checkbox" name="independentGroupStatus" />
                              From an independent research group
                            </label>
                          </div>
                          <button type="submit" style={ui.buttonSecondary}>
                            Attach
                          </button>
                        </form>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
