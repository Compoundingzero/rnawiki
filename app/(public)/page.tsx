import Link from 'next/link'
import { db } from '@/db'
import { entities, claims, evidenceSources, evidenceChanges, correctionSubmissions } from '@/db/schema'
import { eq, desc, sql, isNotNull } from 'drizzle-orm'
import { SearchBox } from '@/components/SearchBox'
import { PROOF_BOUNDARY_LABELS } from '@/lib/evidence'
import { ClaimPipeline } from '@/components/ClaimPipeline'

export const dynamic = 'force-dynamic'

async function getCorpusStats() {
  const [[e], [c], [s], [x]] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(entities).where(eq(entities.publicationStatus, 'published')),
    db.select({ n: sql<number>`count(*)::int` }).from(claims).where(eq(claims.publicationStatus, 'published')),
    db.select({ n: sql<number>`count(*)::int` }).from(evidenceSources),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(correctionSubmissions)
      .where(isNotNull(correctionSubmissions.publicCorrectionEntry)),
  ])
  const [latest] = await db
    .select({ at: entities.updatedAt })
    .from(entities)
    .orderBy(desc(entities.updatedAt))
    .limit(1)

  return {
    compounds: e?.n ?? 0,
    claims: c?.n ?? 0,
    sources: s?.n ?? 0,
    corrections: x?.n ?? 0,
    lastBuilt: latest?.at ?? null,
  }
}

async function getIndexedCompounds() {
  return db
    .select({
      slug: entities.slug,
      name: entities.canonicalName,
      type: entities.entityType,
      desc: entities.shortDescription,
    })
    .from(entities)
    .where(eq(entities.publicationStatus, 'published'))
    .orderBy(entities.canonicalName)
}

async function getFeatured() {
  const rows = await db
    .select({
      claimSlug: claims.slug,
      entitySlug: entities.slug,
      entityId: entities.id,
      entityName: entities.canonicalName,
      question: claims.consumerQuestion,
      stage: claims.proofBoundaryStage,
    })
    .from(claims)
    .innerJoin(entities, eq(claims.entityId, entities.id))
    .where(eq(claims.publicationStatus, 'published'))
    .orderBy(claims.displayPriority, claims.id)

  const seen = new Set<number>()
  return rows.filter((r) => !seen.has(r.entityId) && seen.add(r.entityId)).slice(0, 3)
}

async function getChanges() {
  return db.select().from(evidenceChanges).orderBy(desc(evidenceChanges.publicationDate)).limit(4)
}

export default async function HomePage() {
  const [stats, compounds, featured, changes] = await Promise.all([
    getCorpusStats(),
    getIndexedCompounds(),
    getFeatured(),
    getChanges(),
  ])

  return (
    <div className="wrap" style={{ paddingBlock: 'var(--s8) var(--s7)' }}>
      {/* ---------------------------------------------------------- hero --- */}
      <section style={{ maxWidth: '46rem' }}>
        <p className="eyebrow">Independent evidence reference</p>
        <h1 className="display" style={{ marginBlock: 'var(--s3) var(--s4)' }}>
          See what the evidence actually says.
        </h1>
        <p className="lead measure" style={{ marginBottom: 'var(--s5)' }}>
          Drugs, supplements and experimental compounds — from proposed mechanism to human evidence,
          uncertainty, safety and regulatory status.
        </p>
        <SearchBox />
      </section>

      {/* --------------------------------------------------- trust strip --- */}
      <dl className="speclabel" style={{ marginTop: 'var(--s6)' }}>
        <div className="speclabel__row">
          <dt className="speclabel__key">Corpus</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {stats.compounds} compounds · {stats.claims} source-linked claims · {stats.sources} sources ·{' '}
            {stats.corrections} public corrections
          </dd>
        </div>
        <div className="speclabel__row">
          <dt className="speclabel__key">Last built</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {stats.lastBuilt ? stats.lastBuilt.toISOString().slice(0, 10) : 'Not recorded'}
          </dd>
        </div>
        <div className="speclabel__row">
          <dt className="speclabel__key">Disclosure</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            No ads · No affiliate links · Not clinician reviewed
          </dd>
        </div>
      </dl>

      <hr className="rule" />

      {/* ------------------------------------------------ browse: compounds */}
      <section>
        <div className="section-head">
          <h2 className="h2">Compounds</h2>
          <Link href="/compounds" style={{ fontSize: 'var(--size-small)', flex: 'none' }}>
            View all {stats.compounds} →
          </Link>
        </div>
        <p className="prose measure" style={{ marginBottom: 'var(--s5)' }}>
          Each record separates what researchers measured from what is inferred from it, and marks the point
          where the evidence stops.
        </p>
        <ul className="rows">
          {compounds.map((c) => (
            <li key={c.slug} className="row">
              <Link href={`/r/${c.slug}`} className="row__link">
                <div>
                  <span className="eyebrow">{c.type.replace(/_/g, ' ')}</span>
                  <div className="row__name" style={{ marginTop: '0.15rem' }}>
                    {c.name}
                  </div>
                  <p className="row__desc">{c.desc}</p>
                </div>
                <span className="row__chev" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <hr className="rule" />

      {/* ------------------------------------------------ featured claims --- */}
      <section>
        <div className="section-head">
          <h2 className="h2">Where the evidence stops</h2>
        </div>
        <ul className="rows">
          {featured.map((f) => (
            <li key={`${f.entitySlug}-${f.claimSlug}`} className="row">
              <Link href={`/r/${f.entitySlug}#claim-${f.claimSlug}`} className="row__link">
                <div>
                  <span className="eyebrow">{f.entityName}</span>
                  <div className="row__name" style={{ marginTop: '0.15rem', fontSize: 'var(--size-body)' }}>
                    {f.question}
                  </div>
                  <div className="row__meta">
                    <span className="tag">{PROOF_BOUNDARY_LABELS[f.stage]}</span>
                  </div>
                </div>
                <span className="row__chev" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <hr className="rule" />

      {/* ---------------------------------------------- evidence changes --- */}
      {changes.length > 0 && (
        <>
          <section>
            <div className="section-head">
              <h2 className="h2">Recent evidence changes</h2>
              <Link href="/updates" style={{ fontSize: 'var(--size-small)', flex: 'none' }}>
                All changes →
              </Link>
            </div>
            <ul className="rows">
              {changes.map((c) => (
                <li key={c.id} className="row">
                  <div className="row__link" style={{ display: 'block' }}>
                    <span className="eyebrow">
                      {c.publicationDate.toISOString().slice(0, 10)} · {c.changeType.replace(/_/g, ' ')}
                    </span>
                    <p style={{ marginTop: '0.25rem', fontSize: 'var(--size-small)' }}>{c.explanation}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <hr className="rule" />
        </>
      )}

      {/* ------------------------------------- how a claim reaches RNAwiki -- */}
      <section>
        <div className="section-head">
          <h2 className="h2">How a claim reaches RNAwiki</h2>
        </div>
        <ClaimPipeline />
      </section>

      <hr className="rule" />

      {/* ------------------------------------------------- limitations ----- */}
      <section className="measure">
        <div className="section-head">
          <h2 className="h2">Limitations</h2>
        </div>
        <p className="prose">
          RNAwiki records what studies measured and where the evidence stops. It does not diagnose, does not
          recommend, and is not reviewed by a clinician. Every claim carries its sources; if one is wrong,{' '}
          <Link href="/corrections">report it</Link>.
        </p>
        <p className="prose" style={{ marginTop: 'var(--s3)' }}>
          <Link href="/evidence">How RNAwiki is made →</Link>
        </p>
      </section>
    </div>
  )
}
