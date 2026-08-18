import Link from 'next/link'
import { db } from '@/db'
import { entities, claims } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { HeroSearch } from '@/components/HeroSearch'
import { plainHumanEvidence, stagePositionApplies } from '@/lib/evidence-view'

export const dynamic = 'force-dynamic'

const FEATURED_LIMIT = 5

/**
 * Deliberately small: a handful of recently checked questions, not the corpus. The full index is
 * /compounds. Selecting only the columns this section renders keeps the front page cheap as the
 * corpus grows.
 */
async function getRecentQuestions() {
  const rows = await db
    .select({
      claimSlug: claims.slug,
      entitySlug: entities.slug,
      entityName: entities.canonicalName,
      question: claims.consumerQuestion,
      answer: claims.directAnswer,
      claimType: claims.claimType,
      stage: claims.proofBoundaryStage,
      entityId: entities.id,
      updatedAt: claims.updatedAt,
    })
    .from(claims)
    .innerJoin(entities, eq(claims.entityId, entities.id))
    .where(eq(claims.publicationStatus, 'published'))
    .orderBy(desc(claims.updatedAt), claims.displayPriority)

  // One question per record, so a single compound cannot occupy four of five slots.
  const seen = new Set<number>()
  return rows.filter((r) => !seen.has(r.entityId) && seen.add(r.entityId)).slice(0, FEATURED_LIMIT)
}

export default async function HomePage() {
  const recent = await getRecentQuestions()

  return (
    <div className="page" style={{ paddingBottom: 'var(--s8)' }}>
      <section style={{ paddingTop: 'var(--s8)' }}>
        <h1 className="reading">See what was actually tested.</h1>
        <p className="lead muted reading" style={{ marginTop: 'var(--s4)' }}>
          Search a medicine, supplement or treatment. RNAwiki shows what researchers measured, what people
          infer and what is still unknown.
        </p>
        <div style={{ marginTop: 'var(--s5)' }}>
          <HeroSearch />
        </div>
        <p className="small muted" style={{ marginTop: 'var(--s3)' }}>
          Every answer links to its sources. No ads or affiliate links.
        </p>
      </section>

      <section className="section">
        <h2>How to read an answer</h2>
        <dl className="glance" style={{ marginTop: 'var(--s5)', maxWidth: '52rem' }}>
          <div>
            <dt style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text)' }}>Measured</dt>
            <dd className="muted" style={{ fontWeight: 400 }}>
              What a study directly observed.
            </dd>
          </div>
          <div>
            <dt style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text)' }}>Inferred</dt>
            <dd className="muted" style={{ fontWeight: 400 }}>
              What people think may follow from it.
            </dd>
          </div>
          <div>
            <dt style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text)' }}>Unknown</dt>
            <dd className="muted" style={{ fontWeight: 400 }}>
              What has not been established.
            </dd>
          </div>
        </dl>
      </section>

      {recent.length > 0 && (
        <section className="section">
          <h2>Recently checked</h2>
          <ul className="records" style={{ marginTop: 'var(--s4)' }}>
            {recent.map((r) => (
              <li key={`${r.entitySlug}-${r.claimSlug}`}>
                <Link href={`/r/${r.entitySlug}#claim-${r.claimSlug}`} className="record-link">
                  <div className="record-link__name">{r.question}</div>
                  {/* The answer, verbatim and untruncated. An evidence label on its own reads as
                      the answer and can invert it — "Is rapamycin approved for longevity?" beside
                      "reviewed by a regulator" says yes when the answer is no. Either the caveat
                      travels with the claim or the claim does not appear. */}
                  <div className="record-link__desc">{r.answer}</div>
                  <div className="record-link__meta">
                    {r.entityName}
                    {stagePositionApplies(r.claimType) && ` · ${plainHumanEvidence(r.stage)}`}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 'var(--s5)' }}>
            <Link href="/compounds">Browse all</Link>
          </p>
        </section>
      )}
    </div>
  )
}
