import type { Metadata } from 'next'
import Link from 'next/link'
import { and, eq, inArray, max } from 'drizzle-orm'
import { db } from '@/db'
import { entities, claims, regulatoryStatuses } from '@/db/schema'
import { PROOF_BOUNDARY_LABELS, humanEvidenceSummary, stageRank, type ProofBoundaryStage } from '@/lib/evidence'

// This route has no dynamic segment and reads the database, so it must be dynamic: Railway's
// build container cannot reach postgres.railway.internal, and a static DB-backed route fails the
// production build while passing locally. Same reason as app/(public)/page.tsx and app/sitemap.ts.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Compounds',
  description:
    'Every compound with a published record on RNAwiki, with the human evidence recorded for it, its regulatory category, and the date it was last checked.',
}

/**
 * Below this many records, letter headings are noise — three entries under a heading "B" tell a
 * reader nothing. Above it, the flat list stops being scannable and the alphabet becomes useful.
 * The rows themselves are identical either way; only the grouping changes.
 */
const GROUPING_THRESHOLD = 24

interface IndexRow {
  slug: string
  name: string
  aliases: string[]
  entityType: string
  shortDescription: string
  regulatoryCategory: string
  claimCount: number
  /** Strongest stage reached by any published claim on this record, or null if none are published. */
  strongestStage: ProofBoundaryStage | null
  lastChecked: Date
}

async function getIndex(): Promise<IndexRow[]> {
  const rows = await db
    .select({
      id: entities.id,
      slug: entities.slug,
      name: entities.canonicalName,
      aliases: entities.aliases,
      entityType: entities.entityType,
      shortDescription: entities.shortDescription,
      regulatoryCategory: entities.regulatoryCategory,
      updatedAt: entities.updatedAt,
    })
    .from(entities)
    .where(eq(entities.publicationStatus, 'published'))
    .orderBy(entities.canonicalName)

  if (rows.length === 0) return []
  const ids = rows.map((r) => r.id)

  const [claimRows, checkedRows] = await Promise.all([
    db
      .select({ entityId: claims.entityId, stage: claims.proofBoundaryStage })
      .from(claims)
      .where(and(eq(claims.publicationStatus, 'published'), inArray(claims.entityId, ids))),
    // Most recent regulatory check per record. Entities with no recorded regulatory status fall
    // back to the record's own updatedAt, which is what /r/[slug] shows for the same field.
    db
      .select({ entityId: regulatoryStatuses.entityId, checked: max(regulatoryStatuses.checkedDate) })
      .from(regulatoryStatuses)
      .where(inArray(regulatoryStatuses.entityId, ids))
      .groupBy(regulatoryStatuses.entityId),
  ])

  const stagesByEntity = new Map<number, ProofBoundaryStage[]>()
  for (const c of claimRows) {
    const list = stagesByEntity.get(c.entityId)
    if (list) list.push(c.stage)
    else stagesByEntity.set(c.entityId, [c.stage])
  }

  const checkedByEntity = new Map<number, Date>()
  for (const r of checkedRows) {
    if (r.checked) checkedByEntity.set(r.entityId, r.checked)
  }

  return rows.map((r) => {
    const stages = stagesByEntity.get(r.id) ?? []
    const strongestStage =
      stages.length > 0 ? stages.reduce((a, b) => (stageRank(b) > stageRank(a) ? b : a)) : null
    return {
      slug: r.slug,
      name: r.name,
      aliases: r.aliases,
      entityType: r.entityType,
      shortDescription: r.shortDescription,
      regulatoryCategory: r.regulatoryCategory,
      claimCount: stages.length,
      strongestStage,
      lastChecked: checkedByEntity.get(r.id) ?? r.updatedAt,
    }
  })
}

/**
 * Human evidence as a sentence, never a score. There is no rating in this product: the label says
 * whether people were studied at all, and the stage name beside it says how far that went.
 */


function readable(value: string): string {
  return value.replace(/_/g, ' ')
}

function groupLetter(name: string): string {
  const first = name.trim().charAt(0).toUpperCase()
  return /[A-Z]/.test(first) ? first : '#'
}

export default async function CompoundsPage() {
  const records = await getIndex()
  const lastUpdated = records.reduce<Date | null>(
    (latest, r) => (!latest || r.lastChecked > latest ? r.lastChecked : latest),
    null
  )

  const grouped = records.length >= GROUPING_THRESHOLD
  const groups: { letter: string; records: IndexRow[] }[] = []
  if (grouped) {
    for (const record of records) {
      const letter = groupLetter(record.name)
      const current = groups[groups.length - 1]
      if (current && current.letter === letter) current.records.push(record)
      else groups.push({ letter, records: [record] })
    }
  }

  return (
    <div className="wrap" style={{ paddingBlock: 'var(--s7) var(--s7)' }}>
      <nav aria-label="Breadcrumb" className="metaline" style={{ marginBottom: 'var(--s5)' }}>
        <Link href="/">RNAwiki</Link>
        <span aria-hidden="true">/</span>
        <span>Compounds</span>
      </nav>

      <header className="measure" style={{ marginBottom: 'var(--s6)' }}>
        <p className="eyebrow">Index</p>
        <h1 className="h1" style={{ marginBlock: 'var(--s2) var(--s3)' }}>
          Compounds
        </h1>
        <p className="lead">
          Every compound with a published record: what has been measured, how far the evidence goes, and how the
          substance is regulated.
        </p>
      </header>

      <dl className="speclabel" style={{ marginBottom: 'var(--s6)' }}>
        <div className="speclabel__row">
          <dt className="speclabel__key">Records</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {records.length} published
          </dd>
        </div>
        <div className="speclabel__row">
          <dt className="speclabel__key">Order</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            Alphabetical by canonical name
          </dd>
        </div>
        <div className="speclabel__row">
          <dt className="speclabel__key">Last checked</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {lastUpdated ? lastUpdated.toISOString().slice(0, 10) : 'Not recorded'}
          </dd>
        </div>
      </dl>

      <form role="search" method="get" action="/search" style={{ maxWidth: '34rem' }}>
        <label htmlFor="compound-search" className="eyebrow" style={{ display: 'block', marginBottom: 'var(--s2)' }}>
          Search within compounds
        </label>
        <div style={{ display: 'flex', gap: 'var(--s2)' }}>
          <input
            id="compound-search"
            name="q"
            type="search"
            className="field"
            placeholder="Name, alias, or a question"
          />
          <button type="submit" className="btn btn--primary" style={{ flex: 'none' }}>
            Search
          </button>
        </div>
      </form>

      <hr className="rule" />

      <section>
        <div className="section-head">
          <h2 className="h2">All records</h2>
          <span className="eyebrow" style={{ flex: 'none' }}>
            {records.length} total
          </span>
        </div>

        <div className="callout measure" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Reading this index</p>
          <p style={{ fontSize: 'var(--size-small)' }}>
            A record further along the Proof Boundary has been studied more, not proven safe, effective or
            advisable. RNAwiki records what was measured and stops there.{' '}
            <Link href="/methodology">How the stages work →</Link>
          </p>
        </div>

        {records.length === 0 ? (
          <p className="muted">No published records yet.</p>
        ) : grouped ? (
          groups.map((group) => (
            <section key={group.letter} style={{ marginBottom: 'var(--s6)' }}>
              <h3 className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>
                {group.letter}
              </h3>
              <ul className="rows">
                {group.records.map((record) => (
                  <CompoundRow key={record.slug} record={record} />
                ))}
              </ul>
            </section>
          ))
        ) : (
          <ul className="rows">
            {records.map((record) => (
              <CompoundRow key={record.slug} record={record} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function CompoundRow({ record }: { record: IndexRow }) {
  return (
    <li className="row">
      <Link href={`/r/${record.slug}`} className="row__link">
        <div>
          <span className="eyebrow">{readable(record.entityType)}</span>
          <div className="row__name" style={{ marginTop: '0.15rem' }}>
            {record.name}
          </div>
          {record.aliases.length > 0 && (
            <p className="metaline" style={{ marginTop: 'var(--s1)' }}>
              <span>Also known as {record.aliases.join(' · ')}</span>
            </p>
          )}
          <p className="row__desc">{record.shortDescription}</p>
          <div className="row__meta">
            {/* Text carries the status; the chip is neutral, so nothing depends on colour. Long
                labels wrap rather than push the row off a 375px screen. */}
            <span className="tag" style={{ whiteSpace: 'normal' }}>
              {humanEvidenceSummary(record.strongestStage)}
            </span>
          </div>
          <p className="metaline" style={{ marginTop: 'var(--s2)' }}>
            {record.strongestStage && (
              <span>
                Strongest claim <b>{PROOF_BOUNDARY_LABELS[record.strongestStage]}</b>
              </span>
            )}
            <span>
              {record.claimCount} claim{record.claimCount === 1 ? '' : 's'}
            </span>
            <span>
              Category <b>{readable(record.regulatoryCategory)}</b>
            </span>
            <span>
              Checked <b>{record.lastChecked.toISOString().slice(0, 10)}</b>
            </span>
          </p>
        </div>
        <span className="row__chev" aria-hidden="true">
          →
        </span>
      </Link>
    </li>
  )
}
