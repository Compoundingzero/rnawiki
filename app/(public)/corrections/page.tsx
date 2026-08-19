import type { Metadata } from 'next'
import Link from 'next/link'
import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { db } from '@/db'
import { claims, correctionSubmissions, entities } from '@/db/schema'
import { getPublishedEntityBySlug } from '@/lib/queries/entities'
import { entityPath } from '@/lib/canonical'
import { isoDate, readableDate } from '@/lib/evidence-view'
import { CORRECTION_CATEGORY_LABELS, type CorrectionCategory } from './categories'
import { CorrectionForm } from './CorrectionForm'

// Queries the database and has no dynamic segment: the Railway build container cannot reach
// Postgres, so this must never be prerendered at build time.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Corrections',
  description: 'Report a confusing sentence, a broken source link, an undefined term, or propose a new source.',
}

interface Props {
  searchParams: Promise<{ entity?: string; claim?: string }>
}

const WHAT_TO_REPORT = [
  'A sentence that is confusing or hard to follow.',
  'A source link that is broken, dead, or points to the wrong place.',
  'A technical term used on the page without being defined.',
  'A source that should be cited on a page and is not.',
  'Anything else about the content that seems off.',
]

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
    <div className="page doc">
      <header className="reading stack">
        <h1>Corrections</h1>
        <p className="lead muted">
          RNAwiki is written by one person, and people make mistakes. If something on a page is wrong or
          confusing, report it here.
        </p>
      </header>

      <section className="section-sm">
        <noscript>
          <p className="notice reading" style={{ marginBottom: 'var(--s5)' }}>
            This form needs JavaScript to send. The same details can be emailed to{' '}
            <a href="mailto:hello@rnawiki.com">hello@rnawiki.com</a>.
          </p>
        </noscript>

        <CorrectionForm context={context} />

        <details className="disclosure reading" style={{ marginTop: 'var(--s6)' }}>
          <summary>Examples of what to report</summary>
          <div className="disclosure__body">
            <ul className="bullets muted small">
              {WHAT_TO_REPORT.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </details>
      </section>

      <section className="section">
        <h2>What happens to a report</h2>
        <p className="reading muted" style={{ marginTop: 'var(--s4)' }}>
          Every submission goes into a moderation queue. Nothing sent here changes a page directly: an editor
          reads it, checks it against the source material, and decides what to do. Individual replies are not
          sent.
        </p>
      </section>

      <section className="section">
        <h2>Published corrections</h2>
        {publicCorrections.length === 0 ? (
          <p className="muted reading" style={{ marginTop: 'var(--s4)' }}>
            None yet. Reader-reported corrections that change something are listed here.
          </p>
        ) : (
          <ul className="entries reading" style={{ marginTop: 'var(--s5)' }}>
            {publicCorrections.map((c) => (
              <li key={c.id}>
                <p className="entry__meta">
                  <time dateTime={isoDate(c.createdAt)}>{readableDate(c.createdAt)}</time>
                  <span aria-hidden="true"> · </span>
                  {CORRECTION_CATEGORY_LABELS[c.category as CorrectionCategory] ?? c.category}
                </p>
                <p className="muted">{c.publicCorrectionEntry}</p>
                {c.entityName && c.entitySlug && (
                  <p className="small" style={{ marginTop: 'var(--s3)' }}>
                    <Link href={entityPath(c.entitySlug)}>{c.entityName}</Link>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="reading" style={{ marginTop: 'var(--s5)' }}>
          <Link href="/updates">Evidence changes are logged separately</Link>
        </p>
      </section>
    </div>
  )
}
