import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getPublishedEntityBySlug,
  getPublishedClaimsForEntity,
  getMechanismStepsForClaim,
  getRegulatoryStatusesForEntity,
} from '@/lib/queries/entities'
import { ProofCard } from '@/components/ProofCard'
import { MechanismChain } from '@/components/MechanismChain'
import { entityUrl } from '@/lib/canonical'

export const revalidate = 3600 // targeted revalidation after editorial publication also calls revalidatePath()

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entity = await getPublishedEntityBySlug(slug)
  if (!entity) return {}
  return {
    title: `${entity.canonicalName}: proposed mechanism, human evidence, safety and approval status`,
    description: entity.bottomLine,
    alternates: { canonical: entityUrl(entity.slug) },
    openGraph: {
      title: entity.canonicalName,
      description: entity.bottomLine,
      url: entityUrl(entity.slug),
      images: [`/r/${entity.slug}/opengraph-image`],
    },
  }
}

export default async function EntityPage({ params }: Props) {
  const { slug } = await params
  const entity = await getPublishedEntityBySlug(slug)
  if (!entity) notFound()

  const [claims, regStatuses] = await Promise.all([
    getPublishedClaimsForEntity(entity.id),
    getRegulatoryStatusesForEntity(entity.id),
  ])

  const claimsWithSteps = await Promise.all(
    claims.map(async (claim) => ({ claim, steps: await getMechanismStepsForClaim(claim.id) }))
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: entity.canonicalName,
    url: entityUrl(entity.slug),
    dateModified: entity.updatedAt.toISOString(),
    about: { '@type': 'MedicalEntity', name: entity.canonicalName, alternateName: entity.aliases },
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)' }}>
        <a href="/">RNAwiki</a> / {entity.canonicalName}
      </nav>

      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>{entity.canonicalName}</h1>
        {entity.aliases.length > 0 && (
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Also known as: {entity.aliases.join(', ')}</p>
        )}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-3)',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>{entity.entityType.replace(/_/g, ' ')}</span>
          <span>·</span>
          <span>{entity.regulatoryCategory.replace(/_/g, ' ')}</span>
          <span>·</span>
          <span>Updated {entity.updatedAt.toISOString().slice(0, 10)}</span>
        </div>
      </header>

      <section id="bottom-line" className="prose-width" style={{ marginBottom: 'var(--space-8)' }}>
        <p style={{ fontSize: '1.15rem', fontWeight: 500 }}>{entity.bottomLine}</p>
      </section>

      <section id="regulatory-status" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Regulatory status</h2>
        {regStatuses.length === 0 ? (
          <p style={{ color: 'var(--color-text-faint)' }}>No regulatory status recorded yet.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--space-3)' }}>
            {regStatuses.map((rs) => (
              <li key={rs.id} style={{ borderLeft: '3px solid var(--color-border-strong)', paddingLeft: 'var(--space-3)' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{rs.jurisdiction}</p>
                <p style={{ margin: 0 }}>{rs.statusStatement}</p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-faint)' }}>
                  Checked {rs.checkedDate.toISOString().slice(0, 10)} ·{' '}
                  <a href={rs.source} target="_blank" rel="noopener noreferrer">
                    source
                  </a>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="most-searched-claims" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Most searched claims</h2>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {claimsWithSteps.map(({ claim }) => (
            <ProofCard key={claim.id} claim={claim} entityName={entity.canonicalName} />
          ))}
        </div>
      </section>

      <section id="mechanism" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Proposed mechanism</h2>
        {claimsWithSteps
          .filter(({ steps }) => steps.length > 0)
          .map(({ claim, steps }) => (
            <div key={claim.id} style={{ marginBottom: 'var(--space-6)' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>{claim.consumerQuestion}</h3>
              <MechanismChain steps={steps} />
            </div>
          ))}
      </section>

      <section id="unknowns" style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.1rem' }}>What remains unknown</h2>
        <ul>
          {claims.map((c) => (
            <li key={c.id}>{c.remainingUnknown}</li>
          ))}
        </ul>
      </section>

      {entity.accessRealityNote && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Access reality</h2>
          <p className="prose-width">{entity.accessRealityNote}</p>
        </section>
      )}
    </div>
  )
}
