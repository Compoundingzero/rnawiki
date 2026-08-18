import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getPublishedEntityBySlug,
  getPublishedClaimsForEntity,
  getMechanismStepsForClaim,
  getRegulatoryStatusesForEntity,
} from '@/lib/queries/entities'
import { getQuestionsForClaim } from '@/lib/comprehension'
import { ProofCard } from '@/components/ProofCard'
import { MechanismChain } from '@/components/MechanismChain'
import { ComprehensionTest } from '@/components/ComprehensionTest'
import { entityUrl } from '@/lib/canonical'
import { humanEvidenceSummary, PROOF_BOUNDARY_LABELS, stageRank } from '@/lib/evidence'
import { ENTITY_TYPE_LABELS, REGULATORY_CATEGORY_LABELS, regulatoryCategoryInSentence } from '@/lib/labels'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entity = await getPublishedEntityBySlug(slug)
  if (!entity) return {}
  return {
    title: `${entity.canonicalName}: mechanism, human evidence, safety and approval status`,
    description: entity.bottomLine,
    alternates: { canonical: entityUrl(entity.slug) },
    openGraph: { title: entity.canonicalName, description: entity.bottomLine, url: entityUrl(entity.slug) },
  }
}

const SECTIONS = [
  { id: 'answer', label: 'The short answer' },
  { id: 'snapshot', label: 'Evidence snapshot' },
  { id: 'claims', label: 'What studies show' },
  { id: 'mechanism', label: 'How it may work' },
  { id: 'regulatory', label: 'Safety and approval' },
  { id: 'access', label: 'Availability status' },
  { id: 'understanding', label: 'Check your understanding' },
]

export default async function EntityPage({ params }: Props) {
  const { slug } = await params
  const entity = await getPublishedEntityBySlug(slug)
  if (!entity) notFound()

  const [claims, regStatuses] = await Promise.all([
    getPublishedClaimsForEntity(entity.id),
    getRegulatoryStatusesForEntity(entity.id),
  ])

  const enriched = await Promise.all(
    claims.map(async (claim) => ({
      claim,
      steps: await getMechanismStepsForClaim(claim.id),
      questions: await getQuestionsForClaim(claim.id),
    }))
  )

  const sourceCount = claims.reduce((n, c) => n + c.evidence.length, 0)
  const strongest = claims.reduce<(typeof claims)[number] | null>(
    (best, c) => (!best || stageRank(c.proofBoundaryStage) > stageRank(best.proofBoundaryStage) ? c : best),
    null
  )
  const unapproved = entity.regulatoryCategory !== 'approved_medicine'
  const lastChecked = regStatuses[0]?.checkedDate ?? entity.updatedAt

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: entity.canonicalName,
    url: entityUrl(entity.slug),
    dateModified: entity.updatedAt.toISOString(),
    about: { '@type': 'MedicalEntity', name: entity.canonicalName, alternateName: entity.aliases },
  }

  return (
    <div className="wrap" style={{ paddingBlock: 'var(--s6) var(--s7)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="metaline" style={{ marginBottom: 'var(--s5)' }}>
        <Link href="/">RNAwiki</Link>
        <span aria-hidden="true">/</span>
        <Link href="/compounds">Compounds</Link>
        <span aria-hidden="true">/</span>
        <span>{entity.canonicalName}</span>
      </nav>

      {/* ------------------------------------------------------- masthead -- */}
      <header style={{ marginBottom: 'var(--s6)' }}>
        <p className="eyebrow">{ENTITY_TYPE_LABELS[entity.entityType]}</p>
        <h1 className="display" style={{ marginBlock: 'var(--s2) var(--s3)' }}>
          {entity.canonicalName}
        </h1>
        {entity.aliases.length > 0 && (
          <p className="metaline" style={{ marginBottom: 'var(--s4)' }}>
            Also known as {entity.aliases.join(' · ')}
          </p>
        )}
        <p id="bottom-line" className="lead measure">
          {entity.bottomLine}
        </p>
      </header>

      {/* Unapproved status must be visible without expanding anything. */}
      {unapproved && (
        <div className="callout" data-tone="warning" style={{ marginBottom: 'var(--s6)' }}>
          <p className="callout__title">Not an approved medicine</p>
          <p style={{ fontSize: 'var(--size-small)' }}>
            Classified as {regulatoryCategoryInSentence(entity.regulatoryCategory)}. RNAwiki records what has been
            studied. It does not provide dosing, sourcing, or instructions for use.
          </p>
        </div>
      )}

      <div className="shell">
        {/* -------------------------------------------------- contents rail */}
        <nav className="rail" aria-label="On this page">
          <p className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>
            On this page
          </p>
          <ul style={{ listStyle: 'none', display: 'grid', gap: 'var(--s2)' }}>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ------------------------------------------------------- article */}
        <article className="stack-lg" style={{ minWidth: 0 }}>
          <section id="answer" className="measure">
            <div className="section-head">
              <h2 className="h2">The short answer</h2>
            </div>
            <p className="prose">{entity.shortDescription}</p>
          </section>

          <section id="snapshot">
            <div className="section-head">
              <h2 className="h2">Evidence snapshot</h2>
            </div>
            <dl className="speclabel">
              <div className="speclabel__row">
                <dt className="speclabel__key">Human evidence</dt>
                <dd className="speclabel__val" style={{ margin: 0 }}>
                  {humanEvidenceSummary(strongest?.proofBoundaryStage ?? null)}
                  {strongest && ` — strongest claim reaches ${PROOF_BOUNDARY_LABELS[strongest.proofBoundaryStage]}`}
                </dd>
              </div>
              <div className="speclabel__row">
                <dt className="speclabel__key">Claims recorded</dt>
                <dd className="speclabel__val" style={{ margin: 0 }}>
                  {claims.length}
                </dd>
              </div>
              <div className="speclabel__row">
                <dt className="speclabel__key">Linked sources</dt>
                <dd className="speclabel__val" style={{ margin: 0 }}>
                  {sourceCount}
                </dd>
              </div>
              <div className="speclabel__row">
                <dt className="speclabel__key">Last checked</dt>
                <dd className="speclabel__val" style={{ margin: 0 }}>
                  {lastChecked.toISOString().slice(0, 10)}
                </dd>
              </div>
            </dl>
          </section>

          <section id="claims">
            <div className="section-head">
              <h2 className="h2">What studies show</h2>
            </div>
            <div style={{ display: 'grid', gap: 'var(--s7)' }}>
              {enriched.map(({ claim }) => (
                <ProofCard key={claim.id} claim={claim} entityName={entity.canonicalName} />
              ))}
            </div>
          </section>

          {enriched.some(({ steps }) => steps.length > 0) && (
            <section id="mechanism">
              <div className="section-head">
                <h2 className="h2">How it may work</h2>
              </div>
              <p className="prose measure" style={{ marginBottom: 'var(--s5)' }}>
                Each step is labelled with the kind of evidence behind it. A described mechanism is not proof
                that the outcome follows.
              </p>
              {enriched
                .filter(({ steps }) => steps.length > 0)
                .map(({ claim, steps }) => (
                  <div key={claim.id} style={{ marginBottom: 'var(--s6)' }}>
                    <h3 className="h4 muted" style={{ marginBottom: 'var(--s3)' }}>
                      {claim.consumerQuestion}
                    </h3>
                    <MechanismChain steps={steps} />
                  </div>
                ))}
            </section>
          )}

          <section id="regulatory">
            <div className="section-head">
              <h2 className="h2">Safety and approval status</h2>
            </div>
            {regStatuses.length === 0 ? (
              <p className="muted">Not recorded.</p>
            ) : (
              <div className="stack-lg">
                {regStatuses.map((rs) => (
                  <div key={rs.id}>
                    <h3 className="h4" style={{ marginBottom: 'var(--s2)' }}>
                      {rs.jurisdiction}
                    </h3>
                    <p className="prose" style={{ marginBottom: 'var(--s2)' }}>
                      {rs.statusStatement}
                    </p>
                    <p className="metaline">
                      <span>
                        Checked <b>{rs.checkedDate.toISOString().slice(0, 10)}</b>
                      </span>
                      <a href={rs.source} target="_blank" rel="noopener noreferrer">
                        Primary source ↗
                      </a>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {entity.accessRealityNote && (
            <section id="access" className="measure">
              <div className="section-head">
                <h2 className="h2">Availability status</h2>
              </div>
              <p className="prose">{entity.accessRealityNote}</p>
            </section>
          )}

          {enriched.some(({ questions }) => questions.length > 0) && (
            <section id="understanding">
              <div className="section-head">
                <h2 className="h2">Check your understanding</h2>
              </div>
              <div className="stack-lg">
                {enriched
                  .filter(({ questions }) => questions.length > 0)
                  .map(({ claim, questions }) => (
                    <ComprehensionTest
                      key={claim.id}
                      claimId={claim.id}
                      questions={questions}
                      claimQuestion={claim.consumerQuestion}
                    />
                  ))}
              </div>
            </section>
          )}
        </article>

        {/* -------------------------------------------------- metadata rail */}
        <aside className="rail" aria-label="Record metadata">
          <p className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>
            Record
          </p>
          <dl className="speclabel">
            <div className="speclabel__row">
              <dt className="speclabel__key">Type</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                {ENTITY_TYPE_LABELS[entity.entityType]}
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Status</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                {REGULATORY_CATEGORY_LABELS[entity.regulatoryCategory]}
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Sources</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                {sourceCount}
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Checked</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                {lastChecked.toISOString().slice(0, 10)}
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Review</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                Editorial only
              </dd>
            </div>
          </dl>
          <p style={{ marginTop: 'var(--s4)', fontSize: 'var(--size-small)' }}>
            <Link href={`/corrections?entity=${entity.slug}`}>Report an error →</Link>
          </p>
        </aside>
      </div>
    </div>
  )
}
