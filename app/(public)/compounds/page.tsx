import type { Metadata } from 'next'
import Link from 'next/link'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { entities, claims } from '@/db/schema'
import { entityPath } from '@/lib/canonical'
import {
  MIXED_EVIDENCE_LINE,
  mixedRecordEvidenceLine,
  plainApproval,
  recordEvidenceLine,
  stagePositionApplies,
} from '@/lib/evidence-view'
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
  /**
   * How far the evidence goes, in the shared reader wording, or null when no single statement
   * is true of the whole record. Null drops the row — it never prints a deferral.
   */
  evidence: string | null
  /** Approval state in the shared reader wording. */
  approval: string
}

/**
 * One evidence line for a whole record — the SAME function the record page calls, deliberately.
 *
 * This file used to carry its own local `evidenceState()`, which ran over every published claim
 * and printed "Depends on the question" whenever they disagreed. The record page runs
 * `recordEvidenceLine` over OUTCOME claims only and falls back to `mixedRecordEvidenceLine`, so
 * one label, "Evidence so far", gave two different answers about the same record 300px apart in
 * a reader's journey: Browse said BPC-157 "depends on the question" and /r/bpc-157 said "No
 * controlled human trial on any question here". The record page's own comment rejects printing a
 * deferral under that label, and lib/evidence-view.ts states that filtering to outcome claims is
 * the caller's half of the contract. Browse was passing the unfiltered list.
 *
 * Both halves of that contract are now kept here too: mechanism, regulatory and access claims are
 * filtered out because they have no evidence ladder, and a record whose outcome claims disagree
 * prints a universally quantified negative or nothing at all.
 */
function recordEvidence(claimRows: { claimType: string; stage: ProofBoundaryStage }[]): string | null {
  const stages = claimRows.filter((c) => stagePositionApplies(c.claimType)).map((c) => c.stage)
  const line = recordEvidenceLine(stages)
  return line === MIXED_EVIDENCE_LINE ? mixedRecordEvidenceLine(stages) : line
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
    .select({
      entityId: claims.entityId,
      claimType: claims.claimType,
      stage: claims.proofBoundaryStage,
    })
    .from(claims)
    .where(and(eq(claims.publicationStatus, 'published'), inArray(claims.entityId, ids)))

  type ClaimRow = { claimType: string; stage: ProofBoundaryStage }
  const claimsByEntity = new Map<number, ClaimRow[]>()
  for (const claim of claimRows) {
    const row: ClaimRow = { claimType: claim.claimType, stage: claim.stage }
    const list = claimsByEntity.get(claim.entityId)
    if (list) list.push(row)
    else claimsByEntity.set(claim.entityId, [row])
  }

  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    description: r.shortDescription,
    evidence: recordEvidence(claimsByEntity.get(r.id) ?? []),
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
                    {/* No row rather than a deferral: "Evidence so far" promises an answer, and
                        a record whose questions stop in different places does not have one at
                        this level. The reader gets it per question on the record itself. */}
                    {record.evidence && <div>Evidence so far: {record.evidence}</div>}
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
