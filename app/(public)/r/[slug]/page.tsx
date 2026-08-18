import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getPublishedEntityBySlug,
  getPublishedClaimsForEntity,
  getMechanismStepsForClaim,
  getRegulatoryStatusesForEntity,
} from '@/lib/queries/entities'
import { getQuestionsForClaim } from '@/lib/comprehension'
import { ClaimSummary } from '@/components/ClaimSummary'
import { MechanismChain } from '@/components/MechanismChain'
import { ComprehensionTest } from '@/components/ComprehensionTest'
import { AtAGlance } from '@/components/AtAGlance'
import { stagePositionApplies } from '@/lib/evidence-view'
import { RegulatorySummary } from '@/components/RegulatorySummary'
import { entityUrl } from '@/lib/canonical'
import { plainApproval, readableDate, isoDate } from '@/lib/evidence-view'
import type { ProofCardView } from '@/lib/types'

// A dynamic segment, so this route is not prerendered at build time and does not need
// force-dynamic the way the DB-backed routes without one do.
export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entity = await getPublishedEntityBySlug(slug)
  if (!entity) return {}
  return {
    title: `${entity.canonicalName}: mechanism, human evidence, safety and approval status`,
    description: entity.bottomLine,
    alternates: { canonical: entityUrl(entity.slug) },
    openGraph: { title: entity.canonicalName, description: entity.bottomLine, url: entityUrl(entity.slug) },
  }
}

/**
 * Said once, near the top, in words with no second meaning.
 *
 * It used to appear on every claim, in the metadata rail, and in the footer — three different
 * phrasings of the same fact. Publication status is editorial workflow and is never allowed to
 * stand in for scientific review here: the only thing that upgrades this sentence is an actually
 * approved review row against a claim.
 */
function reviewSentence(claimList: ProofCardView[]): string {
  const reviewed = claimList.some((c) => c.review?.decision === 'approved')
  const flagged = claimList.some((c) => c.reviewStatus === 'needs_update')

  const base = 'Written and checked against the cited sources by one editor.'
  const who = reviewed
    ? ' Some questions on this page have also had an independent scientific review.'
    : ' No clinician has reviewed this page.'
  const flag = flagged ? ' At least one question here is flagged for an evidence update.' : ''

  return base + who + flag
}

export default async function EntityPage({ params }: Props) {
  const { slug } = await params
  const entity = await getPublishedEntityBySlug(slug)
  if (!entity) notFound()

  const [claims, regStatuses] = await Promise.all([
    getPublishedClaimsForEntity(entity.id),
    getRegulatoryStatusesForEntity(entity.id),
  ])

  const enriched = await Promise.all(
    claims.map(async (claim) => ({
      claim,
      steps: await getMechanismStepsForClaim(claim.id),
      questions: await getQuestionsForClaim(claim.id),
    }))
  )

  const sourceCount = claims.reduce((n, c) => n + c.evidence.length, 0)
  const lastChecked = regStatuses[0]?.checkedDate ?? entity.updatedAt
  const withMechanism = enriched.filter(({ steps }) => steps.length > 0)
  const withQuestions = enriched.filter(({ questions }) => questions.length > 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: entity.canonicalName,
    url: entityUrl(entity.slug),
    dateModified: entity.updatedAt.toISOString(),
    about: { '@type': 'MedicalEntity', name: entity.canonicalName, alternateName: entity.aliases },
  }

  return (
    <div className="page record-top" style={{ paddingBottom: 'var(--s8)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb">
        <ol className="crumbs">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/compounds">Browse</Link>
          </li>
          <li aria-current="page">{entity.canonicalName}</li>
        </ol>
      </nav>

      {/* ---------------------------------------------- identity and status -- */}
      <header style={{ marginTop: 'var(--s5)' }}>
        <h1>{entity.canonicalName}</h1>
        <p className="status-line">{plainApproval(entity.regulatoryCategory)}.</p>

        {/* Aliases used to run as a dot-separated line directly under the name, where the first
            thing a reader met was five strings they had never seen. */}
        {entity.aliases.length > 0 && (
          <details className="disclosure disclosure--inline" style={{ marginTop: 'var(--s2)' }}>
            <summary>Other names</summary>
            <div className="disclosure__body">
              <p className="small">{entity.aliases.join(', ')}</p>
            </div>
          </details>
        )}
      </header>

      {/* The answer, set larger than anything except the name. It is what the reader came for and
          it carries its own caveat in the same sentence. */}
      <p id="bottom-line" className="bottom-line reading" style={{ marginTop: 'var(--s5)' }}>
        {entity.bottomLine}
      </p>

      <section className="section-sm">
        <h2>At a glance</h2>
        <div style={{ marginTop: 'var(--s5)' }}>
          <AtAGlance
            stages={claims.filter((c) => stagePositionApplies(c.claimType)).map((c) => c.proofBoundaryStage)}
            category={entity.regulatoryCategory}
            lastChecked={lastChecked}
          />
        </div>
        <p className="small muted reading" style={{ marginTop: 'var(--s5)' }}>
          {reviewSentence(claims)}
        </p>
      </section>

      {/* ------------------------------------------------------------ claims -- */}
      <section className="section">
        <h2>Questions this page answers</h2>
        <div className="reading" style={{ marginTop: 'var(--s6)' }}>
          {claims.length === 0 ? (
            <p className="muted">No questions have been published for this record yet.</p>
          ) : (
            claims.map((claim, i) => (
              <ClaimSummary
                key={claim.id}
                claim={claim}
                entityName={entity.canonicalName}
                // The first question is the one most readers arrive for, so its evidence starts
                // open. The rest stay closed; a page cannot be four open essays.
                defaultOpen={i === 0}
              />
            ))
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- mechanism -- */}
      {withMechanism.length > 0 && (
        <section className="section">
          <h2>How it may work</h2>
          <p className="muted reading" style={{ marginTop: 'var(--s3)' }}>
            A proposed mechanism does not prove that the claimed result happens in people.
          </p>
          <div className="reading" style={{ marginTop: 'var(--s5)' }}>
            {withMechanism.map(({ claim, steps }) => (
              <details key={claim.id} className="disclosure">
                <summary>{claim.consumerQuestion}</summary>
                <div className="disclosure__body">
                  <MechanismChain steps={steps} />
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------ approval and safety --
          accessRealityNote was rewritten in the seed data to drop seller mechanics and off-label
          acquisition routes. What remains is regulatory and safety fact — for an unapproved
          substance, "no regulator has verified what is actually in it" is the single line most
          likely to change what a reader does next, so it belongs above the jurisdiction detail,
          not omitted. */}
      <section className="section">
        <h2>Approval and safety</h2>
        {entity.accessRealityNote && (
          <p className="lead reading" style={{ marginTop: 'var(--s4)' }}>
            {entity.accessRealityNote}
          </p>
        )}
        <div style={{ marginTop: 'var(--s5)' }}>
          <RegulatorySummary category={entity.regulatoryCategory} statuses={regStatuses} />
        </div>
      </section>

      {/* ---------------------------------------------------- clarity check -- */}
      {withQuestions.length > 0 && (
        <section className="section-sm reading">
          <details className="disclosure">
            <summary>Was this explanation clear?</summary>
            <div className="disclosure__body stack-6">
              <p className="small muted">
                A short, anonymous check on whether this page explained where the evidence stops. It measures the
                writing, not the reader, and it is not evidence for or against any answer above.
              </p>
              {withQuestions.map(({ claim, questions }) => (
                <ComprehensionTest
                  key={claim.id}
                  claimId={claim.id}
                  questions={questions}
                  claimQuestion={claim.consumerQuestion}
                />
              ))}
            </div>
          </details>
        </section>
      )}

      {/* ------------------------------------------- sources and page info -- */}
      <section className="section">
        <h2>Sources and page information</h2>
        <div className="reading stack" style={{ marginTop: 'var(--s5)' }}>
          {sourceCount > 0 && (
            <p>
              {sourceCount} source{sourceCount === 1 ? ' is' : 's are'} cited on this page, each listed under the
              question it was used to answer. Open &ldquo;See the evidence&rdquo; on a question, then
              &ldquo;Sources&rdquo;.
            </p>
          )}
          <p>
            Regulatory status last checked{' '}
            <time dateTime={isoDate(lastChecked)}>{readableDate(lastChecked)}</time>.
          </p>
          <p>
            <Link href="/evidence">How RNAwiki decides how far evidence goes</Link>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------- corrections -- */}
      <section className="section-sm reading">
        <h2>Corrections</h2>
        <p className="small" style={{ marginTop: 'var(--s3)' }}>
          Something wrong or out of date on this page?{' '}
          <Link href={`/corrections?entity=${entity.slug}`}>Report an error</Link>. Citation and embed controls for a
          single question sit at the end of that question&rsquo;s evidence.
        </p>
      </section>
    </div>
  )
}
