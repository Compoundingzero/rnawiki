import type { Metadata } from 'next'
import Link from 'next/link'
import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { db } from '@/db'
import { claims, correctionSubmissions, entities } from '@/db/schema'
import { getPublishedEntityBySlug } from '@/lib/queries/entities'
import { entityPath } from '@/lib/canonical'
import { CORRECTION_CATEGORY_LABELS, type CorrectionCategory } from './categories'
import { CorrectionForm } from './CorrectionForm'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Corrections',
  description: 'Report a confusing sentence, a broken source, an undefined term, or propose a new source.',
}

interface Props {
  searchParams: Promise<{ entity?: string; claim?: string }>
}

async function resolveContext(entitySlug?: string, claimSlug?: string) {
  if (!entitySlug) return null
  const entity = await getPublishedEntityBySlug(entitySlug)
  if (!entity) return null

  let claim: { id: number; slug: string; consumerQuestion: string } | null = null
  if (claimSlug) {
    const [row] = await db
      .select({ id: claims.id, slug: claims.slug, consumerQuestion: claims.consumerQuestion })
      .from(claims)
      .where(and(eq(claims.entityId, entity.id), eq(claims.slug, claimSlug), eq(claims.publicationStatus, 'published')))
      .limit(1)
    claim = row ?? null
  }

  return {
    entityId: entity.id,
    entityName: entity.canonicalName,
    entitySlug: entity.slug,
    claimId: claim?.id ?? null,
    claimQuestion: claim?.consumerQuestion ?? null,
  }
}

async function getPublicCorrections() {
  return db
    .select({
      id: correctionSubmissions.id,
      category: correctionSubmissions.category,
      publicCorrectionEntry: correctionSubmissions.publicCorrectionEntry,
      createdAt: correctionSubmissions.createdAt,
      entitySlug: entities.slug,
      entityName: entities.canonicalName,
    })
    .from(correctionSubmissions)
    .leftJoin(entities, eq(correctionSubmissions.entityId, entities.id))
    .where(isNotNull(correctionSubmissions.publicCorrectionEntry))
    .orderBy(desc(correctionSubmissions.createdAt))
    .limit(20)
}

export default async function CorrectionsPage({ searchParams }: Props) {
  const { entity: entitySlug, claim: claimSlug } = await searchParams
  const [context, publicCorrections] = await Promise.all([
    resolveContext(entitySlug, claimSlug),
    getPublicCorrections(),
  ])

  return (
    <div className="container prose-width" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>Corrections</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem' }}>
          RNAwiki is written and reviewed by people, and people make mistakes. If something on the site is
          confusing, a link is broken, a term is used without explanation, or you know a source we should be
          citing, tell us.
        </p>
      </header>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>What this form is for</h2>
        <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-2)' }}>
          <li>A sentence that&rsquo;s confusing or hard to follow.</li>
          <li>A source link that&rsquo;s broken, dead, or points to the wrong place.</li>
          <li>A technical term used on the page without being defined.</li>
          <li>A source you think we should be citing that we&rsquo;re not.</li>
          <li>Anything else about the content that seems off.</li>
        </ul>
        <p style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-muted)' }}>
          Every submission goes into a moderation queue — nothing you send changes the site directly. An editor
          reads it, checks it against the source material, and decides what to do. This is not a place to ask
          for medical advice about your own situation.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-12)' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)' }}>Submit a correction</h2>
        <noscript>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            This form needs JavaScript to submit. You can also email{' '}
            <a href="mailto:hello@rnawiki.com">hello@rnawiki.com</a> with the same details.
          </p>
        </noscript>
        <CorrectionForm context={context} />
      </section>

      <section>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)' }}>Past corrections</h2>
        {publicCorrections.length === 0 ? (
          <p style={{ color: 'var(--color-text-faint)' }}>
            No public corrections yet. When a reader-reported correction changes something on the site, we&rsquo;ll
            list it here.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-4)' }}>
            {publicCorrections.map((c) => (
              <li key={c.id} style={{ borderLeft: '3px solid var(--color-border-strong)', paddingLeft: 'var(--space-3)' }}>
                <p
                  style={{
                    margin: '0 0 var(--space-1)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    color: 'var(--color-text-faint)',
                  }}
                >
                  {CORRECTION_CATEGORY_LABELS[c.category as CorrectionCategory] ?? c.category}
                  {c.entityName && c.entitySlug ? (
                    <>
                      {' · '}
                      <Link href={entityPath(c.entitySlug)} style={{ color: 'var(--color-text-faint)' }}>
                        {c.entityName}
                      </Link>
                    </>
                  ) : null}
                </p>
                <p style={{ margin: 0 }}>{c.publicCorrectionEntry}</p>
                <p style={{ margin: 'var(--space-1) 0 0', fontSize: '0.78rem', color: 'var(--color-text-faint)' }}>
                  {c.createdAt.toISOString().slice(0, 10)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
