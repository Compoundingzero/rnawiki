import type { Metadata } from 'next'
import Link from 'next/link'
import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { db } from '@/db'
import { claims, correctionSubmissions, entities } from '@/db/schema'
import { getPublishedEntityBySlug } from '@/lib/queries/entities'
import { entityPath } from '@/lib/canonical'
import { CORRECTION_CATEGORY_LABELS, type CorrectionCategory } from './categories'
import { CorrectionForm } from './CorrectionForm'

// Queries the database and has no dynamic segment: the Railway build container cannot reach
// Postgres, so this must never be prerendered at build time.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Corrections',
  description: 'Report a confusing sentence, a broken source, an undefined term, or propose a new source.',
}

interface Props {
  searchParams: Promise<{ entity?: string; claim?: string }>
}

const WHAT_TO_REPORT = [
  'A sentence that is confusing or hard to follow.',
  'A source link that is broken, dead, or points to the wrong place.',
  'A technical term used on the page without being defined.',
  'A source that should be cited here and is not.',
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
    <div className="wrap" style={{ paddingBlock: 'var(--s7)' }}>
      <div style={{ maxWidth: '56rem' }}>
        <header className="measure">
          <p className="eyebrow">Reader reports</p>
          <h1 className="display" style={{ marginBlock: 'var(--s3) var(--s4)' }}>
            Corrections
          </h1>
          <p className="lead">
            RNAwiki is written and edited by a person, and people make mistakes. If something on the site is
            confusing, a link is broken, a term is used without explanation, or a source is missing, report it.
          </p>
        </header>

        <hr className="rule" />

        <section id="scope">
          <div className="section-head">
            <h2 className="h2">What this form is for</h2>
          </div>
          <ul style={{ listStyle: 'none', borderTop: 'var(--hairline) solid var(--border)' }}>
            {WHAT_TO_REPORT.map((item) => (
              <li
                key={item}
                style={{
                  borderBottom: 'var(--hairline) solid var(--border)',
                  paddingBlock: 'var(--s3)',
                  fontSize: 'var(--size-small)',
                  color: 'var(--ink-soft)',
                }}
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="prose measure" style={{ marginTop: 'var(--s5)' }}>
            Every submission goes into a moderation queue — nothing sent here changes the site directly. An
            editor reads it, checks it against the source material, and decides what to do. This is not a place
            to ask for medical advice about a personal situation.
          </p>
        </section>

        <hr className="rule" />

        <section id="submit">
          <div className="section-head">
            <h2 className="h2">Submit a correction</h2>
          </div>
          <noscript>
            <p className="callout" style={{ marginBottom: 'var(--s5)', fontSize: 'var(--size-small)' }}>
              This form needs JavaScript to submit. The same details can be emailed to{' '}
              <a href="mailto:hello@rnawiki.com">hello@rnawiki.com</a>.
            </p>
          </noscript>
          <CorrectionForm context={context} />
        </section>

        <hr className="rule" />

        <section id="past">
          <div className="section-head">
            <h2 className="h2">Past corrections</h2>
          </div>
          {publicCorrections.length === 0 ? (
            <p className="muted">
              No public corrections yet. Reader-reported corrections that change something are listed here.
            </p>
          ) : (
            <ul className="rows">
              {publicCorrections.map((c) => (
                <li key={c.id} className="row">
                  <div className="row__link" style={{ display: 'block' }}>
                    <p className="eyebrow">
                      <span>{c.createdAt.toISOString().slice(0, 10)}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{CORRECTION_CATEGORY_LABELS[c.category as CorrectionCategory] ?? c.category}</span>
                    </p>
                    <p style={{ marginTop: 'var(--s2)', fontSize: 'var(--size-small)' }}>
                      {c.publicCorrectionEntry}
                    </p>
                    {c.entityName && c.entitySlug && (
                      <p className="metaline" style={{ marginTop: 'var(--s2)' }}>
                        <Link href={entityPath(c.entitySlug)}>{c.entityName}</Link>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="prose measure" style={{ marginTop: 'var(--s5)' }}>
            <Link href="/updates">Evidence changes, logged separately →</Link>
          </p>
        </section>
      </div>
    </div>
  )
}
