import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getPublishedEntityBySlug,
  getPublishedClaimsForEntity,
  getMechanismStepsForClaim,
  getRegulatoryStatusesForEntity,
  recordHasPublicChanges,
} from '@/lib/queries/entities'
import { getQuestionsForClaim } from '@/lib/comprehension'
import { ClaimSummary } from '@/components/ClaimSummary'
import { MechanismChain } from '@/components/MechanismChain'
import { ComprehensionTest } from '@/components/ComprehensionTest'
import { RegulatorySummary } from '@/components/RegulatorySummary'
import { entityUrl, entityApiUrl } from '@/lib/canonical'
import { serializeJsonLd } from '@/lib/json-ld'
import {
  stagePositionApplies,
  plainApproval,
  approvalStatusValue,
  readableDate,
  isoDate,
  recordEvidenceLine,
  mixedRecordEvidenceLine,
  MIXED_EVIDENCE_LINE,
} from '@/lib/evidence-view'
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
  // notFound() here as well as in the page body, so the 404 decision is made before the response
  // starts streaming rather than after the shell has been flushed. See the ACCEPTED LIMIT note in
  // app/(public)/not-found.tsx for what this does and does not buy.
  if (!entity) notFound()
  return {
    title: `${entity.canonicalName}: mechanism, human evidence, safety and approval status`,
    description: entity.bottomLine,
    alternates: {
      canonical: entityUrl(entity.slug),
      // The record is a public dataset, not only a page. Advertising the JSON representation as an
      // alternate is how a machine reader finds it without scraping the HTML.
      types: { 'application/json': entityApiUrl(entity.slug) },
    },
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

  const base = 'Written and checked against the cited sources by one editor.'
  // "has approved", not "has reviewed", and not "no clinician" — the same rule
  // EvidenceRecordMeta states one level below this line, so the two cannot contradict each
  // other on the same screen. A rejected or needs-changes review DID happen, so saying no
  // review took place would be false in the other direction; and the data model stores no
  // reviewer profession, so "clinician" is not derivable either way. That word belongs to
  // the site-wide footer disclaimer, which already says it on every page — repeating it
  // here was the page explaining its own posture twice.
  const who = reviewed
    ? ' Some questions on this page have also had an independent scientific review.'
    : ' No independent scientific reviewer has approved any answer on this page.'

  return base + who
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

  // The date the REGULATORY STATUS was checked. It is not "when this page was last checked" and
  // it is not "when this answer was last checked" — see the strip below, where a row labelled
  // "Last checked" carried this value while the evidence record 700px lower carried a different
  // date under the identical label.
  const regulatoryChecked = regStatuses[0]?.checkedDate ?? null
  const withMechanism = enriched.filter(({ steps }) => steps.length > 0)
  const withQuestions = enriched.filter(({ questions }) => questions.length > 0)

  // BLOCKING SAFETY RULE, enforced in recordEvidenceLine and not here: one record-level evidence
  // value prints only when every published outcome claim stops in the same place. Filtering to
  // outcome claims is the caller's half of that contract — a mechanism, regulatory or access claim
  // has no evidence ladder, and letting one in previously credited a logistics answer to a
  // regulator. Do not pass the unfiltered list.
  const outcomeStages = claims
    .filter((c) => stagePositionApplies(c.claimType))
    .map((c) => c.proofBoundaryStage)
  const evidenceLine = recordEvidenceLine(outcomeStages)
  // When the claims disagree, the strip previously printed nothing at all rather than a deferral
  // under a label that promises an answer. Nothing was the wrong half of the choice: it left the
  // strip delivering an approval sentence already printed under the h1, and a date. This prints a
  // statement that is true of EVERY claim on the record or nothing — never the strongest claim,
  // never a range. See mixedRecordEvidenceLine.
  const stripEvidenceLine =
    evidenceLine === MIXED_EVIDENCE_LINE ? mixedRecordEvidenceLine(outcomeStages) : evidenceLine

  // The history link is offered only when there is real, published history to read. It points at
  // the first question that has any, because change history lives inside that question's evidence
  // record rather than in a page-level log; the anchor highlights the claim and the record is one
  // control below it.
  const showHistory = recordHasPublicChanges(claims)
  const firstChangedClaim = claims.find((c) => c.changes.length > 0)

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
      {/* serializeJsonLd, never JSON.stringify: `name` and `alternateName` below carry
          entity.canonicalName and entity.aliases, free-text admin fields with no charset
          restriction, and JSON.stringify leaves `<` and `/` literal — so a `</script>` in either
          field closed this block and everything after it ran as markup. See lib/json-ld.ts. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

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
      {/* The approval category appeared three times on one page: here, in the metadata strip,
          and again as a standalone lead paragraph inside "Approval and safety". The build
          contract fixes the first two — the status sentence directly under the name, and the
          labelled "Approval status" row in the strip — so the third was the one removed. See
          components/RegulatorySummary.tsx.
          The two that remain no longer say the same words: this sentence carries the plain
          category, unscoped and at full force, and the strip row names whose decision is on
          record. See approvalStatusValue in lib/evidence-view.ts. */}
      {/* ONE panel, not three stacked ones. The name, the status sentence, the bottom line and
          the metadata strip are one unit of identity, and the reading order inside it is fixed:
          name, status, aliases, BOTTOM LINE, then metadata below a hairline. The bottom line
          comes before the metadata and nothing may move it — it is the answer the reader came
          for, and the strip is supporting detail about the record. The strip is inside this
          panel rather than floating under it for the same reason: as a separate row on the page
          ground it read as a fourth independent block and competed with the answer above it. */}
      <header className="panel-surface record-hero" style={{ marginTop: 'var(--s5)' }}>
        <h1>{entity.canonicalName}</h1>
        <p className="status-line">{plainApproval(entity.regulatoryCategory)}.</p>

        {/* Aliases used to run as a dot-separated line directly under the name, where the first
            thing a reader met was five strings they had never seen. */}
        {entity.aliases.length > 0 && (
          <details className="disclosure disclosure--inline" style={{ marginTop: 'var(--s2)' }}>
            <summary>Other names</summary>
            <div className="disclosure__body">
              {/* Muted, not full ink. A list of trade names and lab codes rendered at the same
                  weight as the regulatory-status sentence above it, so the loudest thing in the
                  first 200px after the name was a string of synonyms — outranking the one
                  sentence that says whether a regulator has approved this. */}
              <p className="small muted reading">{entity.aliases.join(', ')}</p>
            </div>
          </details>
        )}

        {/* The answer, set larger than anything except the name. It is what the reader came for
            and it carries its own caveat in the same sentence. */}
        <p id="bottom-line" className="bottom-line reading" style={{ marginTop: 'var(--s5)' }}>
          {entity.bottomLine}
        </p>

        {/* The three values sit directly under the bottom line with no heading of their own. An
            "At a glance" h2 announced a dashboard the page does not have and pushed the answer a
            heading further from the name. A missing value drops its row rather than printing "N/A".
            Approval, not a source count: a count answers a publisher's question.
            `record-hero__meta` only tells the stylesheet that this instance of the strip is the one
            living inside the header panel, so its own border-top can be drawn full-bleed to the
            panel's edges. The strip's structure, order and wording are unchanged. */}
        <dl className="record-meta record-hero__meta" style={{ marginTop: 'var(--s5)' }}>
          {/* "Evidence so far", not "Human evidence": the value under it reports where the
              evidence stops, which for an approved product is a regulator's review and for a
              mixed record is a deferral. Labelled "Human evidence", the Casgevy row read
              "Human evidence — Reviewed by a regulator", where label and value are about two
              different things. The deferral case renders no row at all rather than printing
              "depends on the question" under a label that promises an answer. */}
          {stripEvidenceLine && (
            <div className="record-meta__item">
              <dt className="record-meta__t">Evidence so far</dt>
              <dd className="record-meta__v">{stripEvidenceLine}</dd>
            </div>
          )}
          <div className="record-meta__item">
            <dt className="record-meta__t">Approval status</dt>
            {/* NOT `plainApproval` — that sentence is already printed under the h1, 416px above
                this row, and printing it twice inside the first viewport was the same words said
                twice with nothing between them changing the meaning. Both slots are required by
                the build contract; carrying the identical string in both is not. The sentence
                above keeps the plain category at full force, unscoped; this row names whose
                decision is on record, with its scope qualifier intact. See approvalStatusValue. */}
            <dd className="record-meta__v">
              {approvalStatusValue(
                entity.regulatoryCategory,
                regStatuses.map((rs) => rs.jurisdiction)
              )}
            </dd>
          </div>
          {/* "Record updated", not "Last checked". Two dates on this page were both labelled "Last
              checked" — this row and the evidence record's own line 700px below it — and in the
              seeded corpus they differ by a day, so one reader question had two visible answers on a
              product whose entire proposition is that you can trust what it says it checked. Each
              date now carries the name of the thing it is a date OF: this is when the record itself
              was last edited, the evidence record says "This answer last checked", the regulatory
              check date belongs to the regulatory status and is printed with it, in "Approval and
              safety" and once more in the page footer. */}
          <div className="record-meta__item">
            <dt className="record-meta__t">Record updated</dt>
            <dd className="record-meta__v">
              <time dateTime={isoDate(entity.updatedAt)}>{readableDate(entity.updatedAt)}</time>
            </dd>
          </div>
        </dl>

        {/* WHO CHECKED THIS RECORD, INSIDE THE PANEL THAT IS THE RECORD'S IDENTITY.
            It used to sit on the page ground between the header panel and the "Questions"
            heading, and it was the last piece of record prose on the site still standing on
            bare grey — one small muted sentence floating between two panels, which read as a
            caption that had come loose rather than as a statement about the record.
            It belongs here on the meaning as well as on the layout: it is provenance, it is the
            same kind of fact as "Record updated", and it sits in the same band under the same
            hairline as the three values above it. That band is now "what this record is and who
            stands behind it", which is one idea and one surface.
            NOTHING ABOUT THE READING ORDER ABOVE IT MOVES. Name, status, aliases, bottom line,
            then the metadata band — the bottom line is still the answer the reader came for and
            still comes before every piece of supporting detail. The sentence itself is
            unchanged, and reviewStatusCopy/reviewSentence remain the only things that decide
            what it says. */}
        <p className="small muted" style={{ marginTop: 'var(--s5)' }}>
          {reviewSentence(claims)}
        </p>
      </header>

      {showHistory && firstChangedClaim && (
        <p className="small" style={{ marginTop: 'var(--s3)' }}>
          <a href={`#claim-${firstChangedClaim.slug}`}>View record history</a>
        </p>
      )}

      {/* ------------------------------------------------------------ claims -- */}
      <section className="section">
        <h2>Questions</h2>
        <p className="muted reading" style={{ marginTop: 'var(--s3)' }}>
          Each answer is shown first. Open its evidence record to inspect what was measured, what did not
          work and where the uncertainty remains.
        </p>
        {/* `panels`, not `reading`: this wrapper's children are question PANELS, so above
            1280 it takes the widened shell container while the sentences inside each panel
            keep the reading measure. Below 1280 the two classes resolve identically. */}
        <div className="panels" style={{ marginTop: 'var(--s6)' }}>
          {claims.length === 0 ? (
            <p className="muted">No questions have been published for this record yet.</p>
          ) : (
            // No evidence record opens by default, ever. Opening the first one made the page arrive
            // as an essay and made "open" the state a reader had to undo before they could scan the
            // questions. The only thing that opens a record is the reader, or a #claim- anchor.
            claims.map((claim) => (
              <ClaimSummary key={claim.id} claim={claim} entityName={entity.canonicalName} />
            ))
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- mechanism -- */}
      {/* The chain is PRINTED, not collapsed behind a control.
          As a disclosure this section was a hollow band: an h2, a one-line caveat, a hairline and
          a single collapsed link whose label was a question already asked and answered 300px
          above it. Nothing in the band said anything, and the one thing a reader could do with it
          was re-read a question. The caveat above it is untouched and still sits between the
          heading and the first step, which is the position it has to hold: a mechanism is the
          easiest thing on this page to mistake for evidence.
          The question stays as a label only when there is more than one chain, because then it is
          the only thing telling two chains apart. With one chain it was a third printing of the
          same sentence. Order is unchanged — the mechanism is still below every direct answer. */}
      {withMechanism.length > 0 && (
        <section className="section">
          <h2>How it may work</h2>
          <p className="muted reading" style={{ marginTop: 'var(--s3)' }}>
            A proposed mechanism does not prove that the claimed result happens in people.
          </p>
          <div className="panels panel-stack" style={{ marginTop: 'var(--s5)' }}>
            {withMechanism.map(({ claim, steps }) => (
              // One panel per chain, the same unit the questions above use: a chain is a single
              // argument and its steps must not read as loose paragraphs on the page ground. The
              // caveat above stays OUTSIDE the panel, between the heading and the first step,
              // where it governs every chain rather than looking like a property of one.
              <div key={claim.id} className="panel-surface mech-panel">
                {withMechanism.length > 1 && <h3 className="claim__q">{claim.consumerQuestion}</h3>}
                <MechanismChain steps={steps} />
              </div>
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
        {/* On a panel, not on the page ground. This is a nine-line body paragraph and it sat
            directly on --ground immediately above a stack of paneled regulator entries, which
            made the one piece of prose in the section look like something that had fallen out
            of a panel rather than the section's own lede. --radius-panel and the site's one
            padding, matching the jurisdiction blocks under it; it is not a feature panel and
            must not take --radius-hero. The paragraph keeps `reading` so the sentence itself
            is unchanged at every width. */}
        {entity.accessRealityNote && (
          <div className="panel-surface" style={{ marginTop: 'var(--s4)' }}>
            <p className="lead reading">{entity.accessRealityNote}</p>
          </div>
        )}
        <div style={{ marginTop: 'var(--gap-panel)' }}>
          <RegulatorySummary statuses={regStatuses} />
        </div>
      </section>

      {/* ---------------------------------------------------- clarity check -- */}
      {withQuestions.length > 0 && (
        <section className="section-sm panels" aria-labelledby="clarity-check">
          {/* The section carried no heading of its own, so its per-claim h3s were filed by the
              heading outline inside "Approval and safety" — the last h2 in scope. Visually
              nothing changes: the disclosure below is still the only thing on screen. */}
          <h2 id="clarity-check" className="skip-link">
            Clarity check
          </h2>
          {/* On a panel. Opened, this is the largest interactive block on the record — a
              question, four radios and a button per claim — and it was floating on the bare
              page ground directly under a run of panels, so the one thing on the page a reader
              can actually operate looked like the one thing nobody had finished. --radius-panel
              like the question panels it follows; it is not a feature panel.
              The disclosure's own top hairline is suppressed by the `:first-child` rule in
              globals.css: inside a panel there is nothing above it to be separated from. */}
          <div className="panel-surface">
            <details className="disclosure">
              <summary>Was this explanation clear?</summary>
              <div className="disclosure__body stack-6">
                <p className="small muted reading">
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
          </div>
        </section>
      )}

      {/* -------------------------------------------------- page information --
          What used to be a "Sources and page information" h2 section plus a separate "Corrections"
          h2 section. Both were page furniture competing with the evidence for heading weight, and
          the source count they carried answered a publisher's question, not a reader's. Sources now
          live inside the evidence record of the question they were used to answer; what is left is
          three quiet lines at the end of the page. */}
      <footer className="section-sm reading">
        <p className="small muted">
          {regulatoryChecked && (
            <>
              Regulatory status last checked{' '}
              <time dateTime={isoDate(regulatoryChecked)}>{readableDate(regulatoryChecked)}</time>.{' '}
            </>
          )}
          <Link href="/evidence">How RNAwiki evaluates evidence</Link>.{' '}
          Something wrong or out of date?{' '}
          <Link href={`/corrections?entity=${entity.slug}`}>Report an error</Link>.
        </p>
      </footer>
    </div>
  )
}
