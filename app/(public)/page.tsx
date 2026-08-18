import Link from 'next/link'
import { db } from '@/db'
import { entities, claims, evidenceChanges } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { SearchBox } from '@/components/SearchBox'
import { EVIDENCE_STATUS_DEFINITIONS, EVIDENCE_STATUS_LABELS, PROOF_BOUNDARY_LABELS } from '@/lib/evidence'

// Force dynamic rather than static+ISR: this page has no dynamic segment, so Next's default is
// to statically prerender it at BUILD time — but Railway's build container has no network path
// to postgres.railway.internal (that hostname only resolves at runtime), so a build-time query
// here fails the deploy outright. See app/sitemap.ts for the fuller explanation.
export const dynamic = 'force-dynamic'

/**
 * One featured claim per entity, so the front door shows the range of the site rather than three
 * claims about whichever compound happens to carry the highest displayPriority. (It did: every
 * featured card was rapamycin, because that seed file numbers its claims 10/20/30/40 while the
 * others leave displayPriority at 0.)
 *
 * Cards carry the question and the Proof Boundary stage only — never the full answer. A card
 * cannot hold a caveat properly, and a half-shown caveat is worse than none. See
 * docs/writing-style.md.
 */
async function getFeaturedClaims() {
  const rows = await db
    .select({
      claimSlug: claims.slug,
      entitySlug: entities.slug,
      entityId: entities.id,
      question: claims.consumerQuestion,
      stage: claims.proofBoundaryStage,
    })
    .from(claims)
    .innerJoin(entities, eq(claims.entityId, entities.id))
    .where(eq(claims.publicationStatus, 'published'))
    .orderBy(claims.displayPriority, claims.id)

  // First claim per entity, in the order the query already established. Done here rather than
  // with a window function: the corpus is small, and a SQL subquery selecting both claims.slug
  // and entities.slug collides on the bare name "slug" unless every column is aliased by hand.
  const seen = new Set<number>()
  return rows.filter((r) => !seen.has(r.entityId) && seen.add(r.entityId)).slice(0, 3)
}

async function getRecentChanges() {
  return db.select().from(evidenceChanges).orderBy(desc(evidenceChanges.publicationDate)).limit(3)
}

export default async function HomePage() {
  const [featured, recentChanges] = await Promise.all([getFeaturedClaims(), getRecentChanges()])

  return (
    <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
      <section style={{ maxWidth: '34rem', margin: '0 auto', textAlign: 'center', marginBottom: 'var(--space-12)' }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: 'var(--space-3)' }}>See where the evidence actually ends</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          What researchers measured, what people infer from it, and what is still unknown.
        </p>
        <SearchBox />
      </section>

      {featured.length > 0 && (
        <section style={{ marginBottom: 'var(--space-12)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            {featured.map((f) => (
              <Link
                key={`${f.entitySlug}-${f.claimSlug}`}
                href={`/r/${f.entitySlug}#claim-${f.claimSlug}`}
                style={{
                  display: 'block',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: 'var(--color-surface)',
                }}
              >
                <p style={{ fontWeight: 600, margin: '0 0 var(--space-3)' }}>{f.question}</p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    color: 'var(--color-accent-strong)',
                    margin: 0,
                  }}
                >
                  {PROOF_BOUNDARY_LABELS[f.stage]}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={{ maxWidth: '40rem', margin: '0 auto', marginBottom: 'var(--space-12)' }}>
        <dl style={{ display: 'grid', gap: 'var(--space-3)', margin: 0 }}>
          {(['measured', 'inferred', 'unknown'] as const).map((status) => (
            <div key={status} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'baseline' }}>
              <dt style={{ fontWeight: 700, minWidth: '5.5rem' }}>{EVIDENCE_STATUS_LABELS[status]}</dt>
              <dd style={{ margin: 0, color: 'var(--color-text-muted)' }}>{EVIDENCE_STATUS_DEFINITIONS[status]}</dd>
            </div>
          ))}
        </dl>
      </section>

      {recentChanges.length > 0 && (
        <section style={{ maxWidth: '40rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-faint)' }}>
            Evidence changes
          </h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-2)' }}>
            {recentChanges.map((c) => (
              <li key={c.id} style={{ fontSize: '0.92rem' }}>
                <Link href="/updates" style={{ color: 'inherit' }}>
                  {c.explanation}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
