import type { Metadata } from 'next'
import Link from 'next/link'
import { eq, isNotNull, sql } from 'drizzle-orm'
import { db } from '@/db'
import { claims, correctionSubmissions, entities, evidenceSources } from '@/db/schema'
import { EvidenceReach } from '@/components/EvidenceReach'

// Queries the database and has no dynamic segment, so it must opt out of build-time
// prerendering — the Railway build container cannot reach Postgres. Same reason as
// app/(public)/page.tsx and app/sitemap.ts.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'How RNAwiki works: one claim at a time, what a study measured, what people inferred from it, and where the direct evidence stops.',
}

/** Every number on this page is counted at request time. Nothing here is written by hand. */
async function getCorpusCounts() {
  const [[e], [c], [s], [x]] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(entities).where(eq(entities.publicationStatus, 'published')),
    db.select({ n: sql<number>`count(*)::int` }).from(claims).where(eq(claims.publicationStatus, 'published')),
    db.select({ n: sql<number>`count(*)::int` }).from(evidenceSources),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(correctionSubmissions)
      .where(isNotNull(correctionSubmissions.publicCorrectionEntry)),
  ])

  return {
    entities: e?.n ?? 0,
    claims: c?.n ?? 0,
    sources: s?.n ?? 0,
    corrections: x?.n ?? 0,
  }
}

// The first screen. Three sentences that describe the whole product, before any vocabulary.
const STEPS: { title: string; body: string }[] = [
  {
    title: 'Start with a specific claim.',
    body: 'Each record is built around a question a person actually asks, such as whether a compound heals tendons faster. A general question about a compound hides the answer inside it.',
  },
  {
    title: 'Separate what was measured from what was inferred.',
    body: 'Measured is what a study observed. Inferred is what people conclude from that observation. Unknown is what nobody has established yet. Every sentence on a claim is marked as one of the three.',
  },
  {
    title: 'Mark where the direct evidence stops.',
    body: 'A claim is placed at the furthest point real evidence reached, and the page says so plainly instead of leaving a reader to guess.',
  },
]

// Secondary detail, kept behind a disclosure rather than cut.
const PIPELINE: { label: string; note: string }[] = [
  { label: 'Source record', note: 'A study, label or regulatory document, entered with its identifiers.' },
  { label: 'Structured claim', note: 'One reader-facing question, answered in one or two sentences.' },
  { label: 'Evidence classification', note: 'Measured, inferred or unknown, and how far the evidence goes.' },
  { label: 'Automated checks', note: 'Length caps, banned language and citation integrity gate the build.' },
  { label: 'Published page', note: 'Server-rendered, with every source traceable from the sentence.' },
  { label: 'Correction history', note: 'Reader reports, resolved by an editor and logged.' },
]

// "Scientific" used to read "Pending, unless a claim names its reviewer and their credentials",
// which promised two things the product does not do. No code path can print a reviewer name or
// credential — components/evidence/EvidenceRecordMeta.tsx has three branches and none emits
// identity, and the v1 API routes refuse the fields outright — and /methodology says so in as
// many words ("No reviewer name or credential is printed on a public page at all"). The identical
// phrase was already removed from /methodology as a defect; this page was the copy the cleanup
// missed. "Pending" went with it: the reviews table is empty and no reviewer account exists, so
// nothing is in progress, and the two rows either side of this one already say "None."
const REVIEWED: { key: string; value: string }[] = [
  { key: 'Editorial', value: 'Written, sourced and checked by the editor before a page goes live.' },
  { key: 'Clinician', value: 'None. No doctor, pharmacist or other clinician has reviewed any page on this site.' },
  {
    key: 'Scientific',
    value:
      'None. No independent scientific reviewer has approved any answer on this site. A claim that clears review shows the decision and its date, never a reviewer name.',
  },
  { key: 'Peer review', value: 'None. RNAwiki summarises published research; it is not published research.' },
]

const FUNDING: { key: string; value: string }[] = [
  { key: 'Advertising', value: 'None.' },
  { key: 'Affiliate links', value: 'None. No link on this site earns a commission.' },
  { key: 'Sponsorship', value: 'None. No entry is paid for, and inclusion cannot be bought.' },
  { key: 'Products sold', value: 'None.' },
  { key: 'Cost to read', value: 'Free, with no account and no paywall.' },
]

const LIMITS: { title: string; body: string }[] = [
  {
    title: 'Whether something is safe or right for one person',
    body: 'A page records what a study measured in the people or animals it studied. It cannot account for a reader’s condition, medication or history. That judgment belongs to a clinician who can examine the person in front of them.',
  },
  {
    // Phrased as "how to obtain it" rather than naming the procurement question in the words a
    // search engine matches. The section heading already says this is something the site cannot
    // tell you; the refusal does not need to reproduce the phrase it refuses.
    title: 'What to take, how much, or how to obtain it',
    body: 'Dosing, sourcing, vendors, stacking and combination guidance appear nowhere on this site, in any form. That is the boundary the site exists to hold, not a missing feature.',
  },
  {
    title: 'That a mechanism produces an outcome',
    body: 'A described mechanism is a hypothesis about why something might work. Until an outcome is measured in people, the mechanism is the reason to test the claim, not the result of testing it.',
  },
  {
    title: 'That a claim is true',
    body: 'How far the evidence goes is not the same question as whether the claim is correct. Early evidence is not wrong evidence, and a regulatory approval covers one use in one population, not everything a compound is discussed for.',
  },
  {
    title: 'That the record is complete',
    body: 'A compound missing from the site says nothing about the compound. New evidence is added by hand, so a page reflects what was checked on the date it names.',
  },
  {
    title: 'That readers understood a page',
    body: 'The optional questions on a claim test whether the explanation was clear enough to locate where the evidence stops. A clarity result is never evidence that the claim itself holds.',
  },
]

export default async function EvidencePage() {
  const counts = await getCorpusCounts()

  return (
    <div className="page doc">
      <header className="reading stack">
        <h1>How it works</h1>
        <p className="lead muted">
          RNAwiki takes one health claim at a time and shows how far the evidence behind it actually goes.
        </p>
      </header>

      <section className="section-sm">
        <ol className="numbered reading">
          {STEPS.map((s) => (
            <li key={s.title}>
              <div>
                <p className="numbered__h">{s.title}</p>
                <p className="muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* High on the page on purpose: a reader deciding whether to trust this needs it before
          the detail, not after it. */}
      <div className="notice reading" style={{ marginTop: 'var(--s7)' }}>
        <p className="notice__title">No clinician has reviewed this site</p>
        <p className="small">
          RNAwiki is written and edited by one person, with AI assistance in drafting. No doctor, pharmacist or
          other clinician has checked these pages, and nothing here is medical advice.
        </p>
      </div>

      <section className="section">
        <h2>How far the evidence goes</h2>
        <div className="reading stack" style={{ marginTop: 'var(--s4)' }}>
          {/* "Every claim" was false: stagePositionApplies (lib/evidence-view.ts) prints a
              position only for outcome claims, so a mechanism, regulatory or access claim
              deliberately carries none. Keep this sentence and the matching one on /methodology
              worded the same way, so the two pages cannot drift apart again. */}
          <p className="muted">
            Every claim that answers an outcome question — does it work, is it safe — is placed at one of five
            points, from a biological idea to a decision by a medicines regulator. A claim about how something
            works, what a regulator decided, or what treatment involves is not placed at a point. Reaching a
            later point means more has been studied. It does not mean the treatment is safe, and it is not a
            score.
          </p>
        </div>
        <div className="reading" style={{ marginTop: 'var(--s5)' }}>
          <p className="small muted" style={{ marginBottom: 'var(--s3)' }}>
            An example, from a claim tested in animals but not in people:
          </p>
          <EvidenceReach stage="animal_evidence" />
        </div>
        <p className="reading" style={{ marginTop: 'var(--s5)' }}>
          <Link href="/methodology">
            How claims are classified: the full eight stages, and what measured, inferred and unknown mean
          </Link>
        </p>
      </section>

      <section className="section">
        <h2>Where the sources come from</h2>
        <div className="reading stack" style={{ marginTop: 'var(--s4)' }}>
          <p className="muted">
            Every cited source is a real record with a checkable identifier: a DOI, a PubMed ID, a trial
            registration number, or the address of a regulatory document. A source that cannot be verified is
            left out, and the gap is stated rather than filled.
          </p>
          <p className="muted">
            Sources that contradict or limit a claim are listed beside the ones that support it. Each source is
            tagged with what it measured and which part of the claim it addresses, so a sentence can be traced to
            the study behind it rather than to a list at the bottom of the page.
          </p>
        </div>

        <details className="disclosure reading" style={{ marginTop: 'var(--s5)' }}>
          <summary>How a claim reaches a page</summary>
          <div className="disclosure__body">
            <ol className="numbered">
              {PIPELINE.map((s) => (
                <li key={s.label}>
                  <div>
                    <p className="numbered__h">{s.label}</p>
                    <p className="muted small">{s.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </details>
      </section>

      <section className="section">
        <h2>Who writes it</h2>
        <div className="reading stack" style={{ marginTop: 'var(--s4)' }}>
          <p>
            RNAwiki is written and edited by one person. Drafting is done with AI assistance, and no draft
            reaches a published page unread: every sentence is checked against the source it cites and rewritten
            where it drifts from what that source measured.
          </p>
          <p>
            An error on this site is the editor’s error. There is no newsroom behind it, no panel of advisors,
            and no reviewer whose name appears unless a real review record exists for that claim.
          </p>
          <p className="muted small">
            {counts.entities} published compound {counts.entities === 1 ? 'record' : 'records'}, {counts.claims}{' '}
            published {counts.claims === 1 ? 'claim' : 'claims'} and {counts.sources} source{' '}
            {counts.sources === 1 ? 'record' : 'records'}, counted from the database when this page loaded.
          </p>
        </div>
      </section>

      <section className="section">
        <h2>What has been reviewed</h2>
        <dl className="facts" style={{ marginTop: 'var(--s4)' }}>
          {REVIEWED.map((r) => (
            <div key={r.key}>
              <dt>{r.key}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
        <p className="reading muted" style={{ marginTop: 'var(--s5)' }}>
          Publishing a page is an editorial step, not a scientific one. A claim can be live while independent
          review is still pending, and the line each claim carries is generated from its stored review record
          rather than typed by hand.{' '}
          <Link href="/methodology#editorial-workflow">What “published” does and does not mean</Link>
        </p>
      </section>

      <section className="section">
        <h2>How it is paid for</h2>
        <dl className="facts" style={{ marginTop: 'var(--s4)' }}>
          {FUNDING.map((f) => (
            <div key={f.key}>
              <dt>{f.key}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
        <p className="reading muted" style={{ marginTop: 'var(--s5)' }}>
          Whoever profits from a treatment usually gets to define what “works” means for it. Selling nothing is
          what allows the same evidence scale to be applied to an approved medicine and to a peptide sold
          online, without either one paying for softer treatment.{' '}
          <Link href="/methodology#independence">More on independence</Link>
        </p>
      </section>

      <section className="section">
        <h2>How corrections work</h2>
        <div className="reading stack" style={{ marginTop: 'var(--s4)' }}>
          <p>
            Reader reports go into a moderation queue. Nothing submitted changes a page directly: an editor
            reads the report, checks it against the source material, and decides what to do. Individual replies
            are not sent.
          </p>
          <p>
            {counts.corrections === 0
              ? 'A correction that changes something is published with what it changed. None has been published yet.'
              : `A correction that changes something is published with what it changed. ${counts.corrections} ${
                  counts.corrections === 1 ? 'has' : 'have'
                } been published so far.`}{' '}
            Evidence that moves a claim is logged separately, with the source that moved it.
          </p>
          <p>
            <Link href="/corrections">Report an error</Link> · <Link href="/updates">See what changed</Link>
          </p>
        </div>
      </section>

      <section className="section">
        <h2>What this site cannot tell you</h2>
        <ul className="entries reading" style={{ marginTop: 'var(--s5)' }}>
          {LIMITS.map((l) => (
            <li key={l.title}>
              <p className="entry__h">{l.title}</p>
              <p className="muted small">{l.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
