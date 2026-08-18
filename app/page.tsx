import Link from 'next/link'
import { db } from '@/db'
import { entities, claims, evidenceChanges } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { SearchBox } from '@/components/SearchBox'
import { EVIDENCE_STATUS_DEFINITIONS, EVIDENCE_STATUS_LABELS, PROOF_BOUNDARY_LABELS } from '@/lib/evidence'

export const revalidate = 3600

async function getFeaturedClaims() {
  return db
    .select({
      claimSlug: claims.slug,
      entitySlug: entities.slug,
      entityName: entities.canonicalName,
      question: claims.consumerQuestion,
      answer: claims.directAnswer,
      stage: claims.proofBoundaryStage,
      lastReviewedAt: claims.lastReviewedAt,
    })
    .from(claims)
    .innerJoin(entities, eq(claims.entityId, entities.id))
    .where(eq(claims.publicationStatus, 'published'))
    .orderBy(desc(claims.displayPriority))
    .limit(3)
}

async function getRecentChanges() {
  return db.select().from(evidenceChanges).orderBy(desc(evidenceChanges.publicationDate)).limit(5)
}

export default async function HomePage() {
  const [featured, recentChanges] = await Promise.all([getFeaturedClaims(), getRecentChanges()])

  return (
    <div className="container" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
      <section style={{ maxWidth: '38rem', margin: '0 auto', textAlign: 'center', marginBottom: 'var(--space-12)' }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: 'var(--space-3)' }}>See where the evidence actually ends</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          Search a peptide, supplement, emerging medicine, or CRISPR treatment. Understand what researchers
          measured, what people infer from it, and what remains unknown.
        </p>
        <SearchBox />
        <p style={{ marginTop: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--color-text-faint)' }}>
          Try: BPC-157 · Does this peptide heal tendons? · How does Casgevy work?
        </p>
      </section>

      {featured.length > 0 && (
        <section style={{ marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontSize: '1.2rem', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            Featured Proof Boundaries
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
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
                <p style={{ fontWeight: 600, margin: '0 0 var(--space-2)' }}>{f.question}</p>
                <p
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    color: 'var(--color-accent-strong)',
                    margin: '0 0 var(--space-2)',
                  }}
                >
                  {PROOF_BOUNDARY_LABELS[f.stage]}
                </p>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text-muted)' }}>{f.answer}</p>
                {f.lastReviewedAt && (
                  <p style={{ margin: 'var(--space-2) 0 0', fontSize: '0.78rem', color: 'var(--color-text-faint)' }}>
                    Reviewed {f.lastReviewedAt.toISOString().slice(0, 10)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={{ maxWidth: '44rem', margin: '0 auto', marginBottom: 'var(--space-12)' }}>
        <h2 style={{ fontSize: '1.2rem', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          Measured. Inferred. Unknown.
        </h2>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {(['measured', 'inferred', 'unknown'] as const).map((status) => (
            <div key={status}>
              <p style={{ fontWeight: 700, margin: '0 0 var(--space-1)' }}>{EVIDENCE_STATUS_LABELS[status]}</p>
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{EVIDENCE_STATUS_DEFINITIONS[status]}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
        <p style={{ margin: 0, fontSize: '1.05rem' }}>PubMed helps you find the paper.</p>
        <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
          RNAwiki helps you understand how far its findings can be taken.
        </p>
      </section>

      {recentChanges.length > 0 && (
        <section style={{ maxWidth: '44rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-4)' }}>Recent evidence changes</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-3)' }}>
            {recentChanges.map((c) => (
              <li key={c.id} style={{ borderLeft: '3px solid var(--color-border-strong)', paddingLeft: 'var(--space-3)' }}>
                <p style={{ margin: 0 }}>{c.explanation}</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-faint)' }}>
                  {c.publicationDate.toISOString().slice(0, 10)}
                </p>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 'var(--space-3)' }}>
            <Link href="/updates">All evidence updates →</Link>
          </p>
        </section>
      )}
    </div>
  )
}
