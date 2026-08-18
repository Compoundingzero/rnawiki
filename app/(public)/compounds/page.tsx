import type { Metadata } from 'next'
import Link from 'next/link'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { entities, claims } from '@/db/schema'
import { entityPath } from '@/lib/canonical'
import { plainApproval, plainHumanEvidence } from '@/lib/evidence-view'
import type { ProofBoundaryStage } from '@/lib/evidence'

// This route has no dynamic segment and reads the database, so it must be dynamic: Railway's
// build container cannot reach postgres.railway.internal, and a static DB-backed route fails the
// production build while passing locally. Same reason as app/(public)/page.tsx and app/sitemap.ts.
export const dynamic = 'force-dynamic'

// The URL stays /compounds — it is linked from the header, the footer, the not-found pages and
// from outside the site. Only the reader-facing name changed to Browse.
export const metadata: Metadata = {
  title: 'Browse',
  description:
    'Every medicine, supplement and treatment currently covered by RNAwiki, with how far the evidence for it goes and whether a regulator has approved it.',
}

interface BrowseRow {
  slug: string
  name: string
  description: string
  /** How far the evidence goes, in the shared reader wording. */
  evidence: string
  /** Approval state in the shared reader wording. */
  approval: string
}

/**
 * One evidence line for a whole record. The strongest claim on a record is not the record's
 * answer: BPC-157 carries animal-only claims beside a two-person uncontrolled pilot, and printing
 * the strongest of them made the record read as though the peptide had been tested in people. So
 * the plain state is used only when every published claim stops in the same place, and anything
 * mixed says so instead. Identical stages also guarantee an identical position on the five-point
 * public scale, which is the coarser test; the finer one is used because an observational study
 * and a controlled trial share that position and are not the same claim.
 */
function evidenceState(stages: ProofBoundaryStage[]): string {
  const [first, ...rest] = stages
  if (!first) return plainHumanEvidence(null)
  if (!rest.every((stage) => stage === first)) return 'Depends on the question'
  return plainHumanEvidence(first)
}

async function getIndex(): Promise<BrowseRow[]> {
  const rows = await db
    .select({
      id: entities.id,
      slug: entities.slug,
      name: entities.canonicalName,
      shortDescription: entities.shortDescription,
      regulatoryCategory: entities.regulatoryCategory,
    })
    .from(entities)
    .where(eq(entities.publicationStatus, 'published'))
    .orderBy(entities.canonicalName)

  if (rows.length === 0) return []
  const ids = rows.map((r) => r.id)

  const claimRows = await db
    .select({ entityId: claims.entityId, stage: claims.proofBoundaryStage })
    .from(claims)
    .where(and(eq(claims.publicationStatus, 'published'), inArray(claims.entityId, ids)))

  const stagesByEntity = new Map<number, ProofBoundaryStage[]>()
  for (const claim of claimRows) {
    const list = stagesByEntity.get(claim.entityId)
    if (list) list.push(claim.stage)
    else stagesByEntity.set(claim.entityId, [claim.stage])
  }

  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    description: r.shortDescription,
    evidence: evidenceState(stagesByEntity.get(r.id) ?? []),
    approval: plainApproval(r.regulatoryCategory),
  }))
}

export default async function BrowsePage() {
  const records = await getIndex()

  return (
    <div className="page page-top">
      <header className="reading">
        <h1>Browse</h1>
        <p className="lead muted" style={{ marginTop: 'var(--s4)' }}>
          Browse every medicine, supplement and treatment currently covered by RNAwiki.
        </p>
      </header>

      <form role="search" method="get" action="/search" className="search" style={{ marginTop: 'var(--s5)' }}>
        <label htmlFor="browse-q" className="skip-link">
          Search a medicine, supplement, treatment or health claim
        </label>
        <input
          id="browse-q"
          name="q"
          type="search"
          className="search__input"
          placeholder="Name or health claim"
          autoComplete="off"
        />
        <button type="submit" className="search__btn">
          Search
        </button>
      </form>

      <section className="section-sm">
        {/* Kept short, not cut: a reader who reads the evidence line as a verdict has misread the
            whole site, so the sentence that prevents it travels with the list. */}
        <p className="small muted reading">
          Evidence that goes further means more has been measured. It does not mean a treatment is
          safe, effective or advisable. <Link href="/evidence">How it works</Link>
        </p>

        {records.length === 0 ? (
          <p className="reading muted" style={{ marginTop: 'var(--s5)' }}>
            No records published yet.
          </p>
        ) : (
          <ul className="records reading" style={{ marginTop: 'var(--s4)' }}>
            {records.map((record) => (
              <li key={record.slug}>
                <Link href={entityPath(record.slug)} className="record-link">
                  <div className="record-link__name">{record.name}</div>
                  <p className="record-link__desc">{record.description}</p>
                  <div className="record-link__facts">
                    <div>Evidence so far: {record.evidence}</div>
                    <div>{record.approval}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
