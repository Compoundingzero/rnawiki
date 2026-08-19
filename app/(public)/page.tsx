import Link from 'next/link'
import { db } from '@/db'
import { entities, claims } from '@/db/schema'
import { and, eq, desc, isNotNull } from 'drizzle-orm'
import { HeroSearch } from '@/components/HeroSearch'
import { plainHumanEvidence, stagePositionApplies } from '@/lib/evidence-view'

export const dynamic = 'force-dynamic'

const FEATURED_LIMIT = 5

/**
 * Deliberately small: a handful of recently checked questions, not the corpus. The full index is
 * /compounds. Selecting only the columns this section renders keeps the front page cheap as the
 * corpus grows.
 *
 * CHECKED means checked. This ordered by `claims.updatedAt`, a database write timestamp, under a
 * heading that says "Recently checked" — the same substitution the record page's own SAFETY RULE
 * in lib/evidence-view.ts (`answerCheckPoint`) exists to forbid, where a re-run of `db:seed`
 * advances the date a record claims it was read. `claims.checkedAt` is the recorded editorial
 * check and is nullable on purpose, so a claim nobody has recorded a check for is not listed here
 * at all rather than listed last: the heading is a claim about every row under it. If nothing has
 * a recorded check the section does not render, which is correct and is not an empty state to
 * fill. `updatedAt` stays only as the tie-break, where it decides order and asserts nothing.
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
      checkedAt: claims.checkedAt,
    })
    .from(claims)
    .innerJoin(entities, eq(claims.entityId, entities.id))
    .where(and(eq(claims.publicationStatus, 'published'), isNotNull(claims.checkedAt)))
    .orderBy(desc(claims.checkedAt), desc(claims.updatedAt), claims.displayPriority)

  // One question per record, so a single compound cannot occupy four of five slots.
  const seen = new Set<number>()
  return rows.filter((r) => !seen.has(r.entityId) && seen.add(r.entityId)).slice(0, FEATURED_LIMIT)
}

/**
 * The four things an answer separates.
 *
 * Written as plain terms and definitions, never as four promotional cards. The moment these get
 * boxes, icons or colour they read as product features rather than as the vocabulary the rest of
 * the site uses, and "Conflicting or failed" starts looking like a verdict badge.
 *
 * v2 AMENDMENT — the four now sit in `.panel-surface` panels, which is the one part of the note
 * above that no longer holds. What it was protecting still does: the panel is the SAME neutral
 * surface every other panel on the site uses, so these read as four entries in a glossary, not as
 * four features. The rest of the ban is unchanged and is what keeps "Conflicting or failed" from
 * becoming a badge — no icon, no accent bar, no per-term colour, no tinted tile, and no ordering
 * that implies one term outranks another. A reviewer who wants to add an icon per term should read
 * this paragraph as the reason not to.
 */
const SEPARATES = [
  { term: 'Observed', definition: 'What researchers directly measured.' },
  {
    term: 'Not proven',
    definition: 'What the result is often taken to mean but did not establish.',
  },
  {
    term: 'Conflicting or failed',
    definition: 'Results or development events that did not support the expected outcome.',
  },
  { term: 'Still unknown', definition: 'Questions the available evidence cannot answer.' },
] as const

export default async function HomePage() {
  const recent = await getRecentQuestions()

  return (
    <div className="page" style={{ paddingTop: 'var(--s7)', paddingBottom: 'var(--s8)' }}>
      {/* The hero is one feature panel and the search field is the dominant element inside it.
          The paddingTop that used to sit on this section moved to the page wrapper above: on a
          panel, padding-top is INSIDE the surface, so leaving it here opened 64px of empty white
          above the h1 and pushed the search field below the fold at 390px. */}
      <section className="panel-surface hero-panel">
        <h1 className="reading">See what was actually tested.</h1>
        <p className="lead muted reading" style={{ marginTop: 'var(--s4)' }}>
          Search a medicine, supplement, treatment or health claim. RNAwiki separates what researchers
          observed from what is assumed, what did not work and what remains unknown.
        </p>
        <div style={{ marginTop: 'var(--s5)' }}>
          <HeroSearch />
        </div>
        <p className="small muted reading" style={{ marginTop: 'var(--s3)' }}>
          Every answer links to its evidence record and original sources.
        </p>
      </section>

      <section className="section">
        <h2>What an answer separates</h2>
        <dl className="separates" style={{ marginTop: 'var(--s5)' }}>
          {SEPARATES.map((item) => (
            <div key={item.term} className="separates__item panel-surface">
              <dt className="separates__t">{item.term}</dt>
              <dd className="separates__d">{item.definition}</dd>
            </div>
          ))}
        </dl>
      </section>

      {recent.length > 0 && (
        <section className="section">
          <h2 className="reading">Recently checked</h2>
          <p className="small muted reading" style={{ marginTop: 'var(--s3)' }}>
            Open any answer to inspect its full evidence record.
          </p>
          <ul className="records panels" style={{ marginTop: 'var(--s4)' }}>
            {recent.map((r) => (
              <li key={`${r.entitySlug}-${r.claimSlug}`}>
                {/* The panel IS the click target — the whole surface, not the question line
                    inside it. `.panel-surface` on the <a> rather than on the <li> is deliberate:
                    a panel on the <li> with the link inside it gives a 656px-wide box whose
                    operable area is one 17px line of text, which is the exact pattern that reads
                    as a card and behaves as a link. Search and browse use the identical pair. */}
                <Link
                  href={`/r/${r.entitySlug}#claim-${r.claimSlug}`}
                  className="record-link panel-surface"
                >
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
            <Link href="/compounds" className="inline-action">
              Browse all
            </Link>
          </p>
        </section>
      )}
    </div>
  )
}
