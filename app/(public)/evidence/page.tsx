import type { Metadata } from 'next'
import Link from 'next/link'
import { eq, isNotNull, sql } from 'drizzle-orm'
import { db } from '@/db'
import { claims, correctionSubmissions, entities, evidenceSources } from '@/db/schema'
import { ClaimPipeline } from '@/components/ClaimPipeline'

// Queries the database and has no dynamic segment, so it must opt out of build-time
// prerendering — the Railway build container cannot reach Postgres. Same reason as
// app/(public)/page.tsx and app/sitemap.ts.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'How RNAwiki is made',
  description:
    'Who writes RNAwiki, what has been reviewed and what has not, how it is paid for, how corrections work, and what the site cannot establish.',
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

const LIMITS: { title: string; body: string }[] = [
  {
    title: 'Whether a compound is safe or right for one person',
    body: 'A page records what a study measured in the people or animals it studied. It cannot account for a reader’s condition, medication or history. That judgment belongs to a clinician who can examine the person in front of them.',
  },
  {
    title: 'What to take, how much, or where to get it',
    body: 'Dosing, sourcing, vendors, stacking and combination guidance appear nowhere on this site, in any form. That is the boundary the site exists to hold, not a missing feature.',
  },
  {
    title: 'That a mechanism produces an outcome',
    body: 'A described mechanism is a hypothesis about why something might work. Until an outcome is measured in people, the mechanism is the reason to test the claim, not the result of testing it.',
  },
  {
    title: 'That a claim is true',
    body: 'An evidence stage answers how far the evidence reaches, never whether the claim is correct. Early evidence is not wrong evidence, and a regulatory approval covers one indication in one population, not everything a compound is discussed for.',
  },
  {
    title: 'That the record is complete',
    body: 'A compound missing from the site says nothing about the compound. New evidence is added by hand, so a page reflects what was checked on the date it names.',
  },
  {
    title: 'That readers understood a page',
    body: 'The optional comprehension questions on a claim test whether the explanation was clear enough to locate where the evidence stops. A clarity result is never evidence that the claim itself holds.',
  },
]

export default async function EvidencePage() {
  const counts = await getCorpusCounts()

  return (
    <div className="wrap" style={{ paddingBlock: 'var(--s7)' }}>
      <div style={{ maxWidth: '56rem' }}>
        <header className="measure">
          <p className="eyebrow">Editorial disclosure</p>
          <h1 className="display" style={{ marginBlock: 'var(--s3) var(--s4)' }}>
            How RNAwiki is made
          </h1>
          <p className="lead">
            Who writes it, what has been reviewed and what has not, what pays for it, and the questions it
            cannot answer.
          </p>
        </header>

        <dl className="speclabel" style={{ marginTop: 'var(--s6)' }}>
          <div className="speclabel__row">
            <dt className="speclabel__key">Compounds</dt>
            <dd className="speclabel__val" style={{ margin: 0 }}>
              {counts.entities} published
            </dd>
          </div>
          <div className="speclabel__row">
            <dt className="speclabel__key">Claims</dt>
            <dd className="speclabel__val" style={{ margin: 0 }}>
              {counts.claims} published
            </dd>
          </div>
          <div className="speclabel__row">
            <dt className="speclabel__key">Sources</dt>
            <dd className="speclabel__val" style={{ margin: 0 }}>
              {counts.sources} records
            </dd>
          </div>
          <div className="speclabel__row">
            <dt className="speclabel__key">Corrections</dt>
            <dd className="speclabel__val" style={{ margin: 0 }}>
              {counts.corrections} published publicly
            </dd>
          </div>
        </dl>
        <p className="muted" style={{ fontSize: 'var(--size-small)', marginTop: 'var(--s2)' }}>
          Counted from the database when this page loaded.
        </p>

        <div className="callout" data-tone="warning" style={{ marginTop: 'var(--s6)' }}>
          <p className="callout__title">Not reviewed by a clinician</p>
          <p style={{ fontSize: 'var(--size-small)' }}>
            No doctor, pharmacist or other clinician has checked these pages. What a claim carries is editorial
            review. Where a claim says independent scientific review is pending, it is pending, and nothing on
            the page should be read as sign-off.
          </p>
        </div>

        <hr className="rule" />

        {/* ------------------------------------------------------ authorship */}
        <section id="who-writes-it" className="measure">
          <div className="section-head">
            <h2 className="h2">Who writes it</h2>
          </div>
          <div className="prose">
            <p>
              RNAwiki is written and edited by one person. Drafting is done with AI assistance, and no draft
              reaches a published page unread: every sentence is checked against the source it cites, and
              rewritten by the editor where it drifts from what that source measured.
            </p>
            <p>
              An error on this site is an editor’s error. There is no newsroom behind it, no panel of advisors,
              and no reviewer whose name appears unless a real review record exists for that claim.
            </p>
          </div>
        </section>

        <hr className="rule" />

        {/* ------------------------------------------------- review, plainly */}
        <section id="review">
          <div className="section-head">
            <h2 className="h2">What has been reviewed</h2>
          </div>
          <dl className="speclabel">
            <div className="speclabel__row">
              <dt className="speclabel__key">Editorial</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                Done before publication — written, sourced and checked by the editor
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Clinician</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                None. No clinician has reviewed any page on this site
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Scientific</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                Pending, unless a claim names its reviewer and their credentials
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Peer review</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                None. RNAwiki summarises published research; it is not published research
              </dd>
            </div>
          </dl>
          <p className="prose measure" style={{ marginTop: 'var(--s4)' }}>
            The review line on a claim is generated from that claim’s stored review record, so it cannot be set
            by hand. <Link href="/methodology#editorial-workflow">What “published” does and does not mean →</Link>
          </p>
        </section>

        <hr className="rule" />

        {/* ------------------------------------------------------ disclosure */}
        <section id="money">
          <div className="section-head">
            <h2 className="h2">What pays for it</h2>
          </div>
          <dl className="speclabel">
            <div className="speclabel__row">
              <dt className="speclabel__key">Advertising</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                None
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Affiliate links</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                None. No outbound link on this site earns a commission
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Sponsorship</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                None. No entry is paid for, and inclusion cannot be bought
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Products sold</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                None
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Reader cost</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                Free, no account, no paywall
              </dd>
            </div>
          </dl>
          <p className="prose measure" style={{ marginTop: 'var(--s4)' }}>
            Whoever profits from a treatment usually gets to define what “works” means for it. The point of
            selling nothing is that the same evidence scale can be applied to an approved medicine and to a
            peptide sold online without either one paying for softer treatment.
          </p>
        </section>

        <hr className="rule" />

        {/* -------------------------------------------------------- pipeline */}
        <section id="pipeline">
          <div className="section-head">
            <h2 className="h2">How a claim reaches a page</h2>
          </div>
          <ClaimPipeline />
        </section>

        <hr className="rule" />

        {/* ------------------------------------------------ sources + stages */}
        <section id="sources" className="measure">
          <div className="section-head">
            <h2 className="h2">Sources and classification</h2>
          </div>
          <div className="prose">
            <p>
              Every cited source is a real record with a checkable identifier: a DOI, a PubMed ID, a trial
              registration number, or the URL of a regulatory document. A source that cannot be verified is left
              out, and the gap is stated rather than filled.
            </p>
            <p>
              Sources that contradict or limit a claim are listed beside the ones that support it. Each source
              is tagged with what it measured and which part of the claim it addresses, so a reader can trace a
              sentence to the study behind it rather than to a bibliography at the bottom.
            </p>
            <p>
              Each claim is then placed on one of eight evidence stages, and the stage it stops at is marked on
              the page.
            </p>
          </div>
          <p className="prose" style={{ marginTop: 'var(--s4)' }}>
            <Link href="/methodology">The full standard: the eight stages, and what Measured, Inferred and
            Unknown mean →</Link>
          </p>
        </section>

        <hr className="rule" />

        {/* ------------------------------------------------------ correction */}
        <section id="corrections" className="measure">
          <div className="section-head">
            <h2 className="h2">How corrections work</h2>
          </div>
          <div className="prose">
            <p>
              Reader reports go into a moderation queue. Nothing submitted changes a page directly: an editor
              reads the report, checks it against the source material, and decides what to do. Individual
              replies are not sent.
            </p>
            <p>
              A correction that changed something is published with what it changed. {counts.corrections} public{' '}
              {counts.corrections === 1 ? 'correction is' : 'corrections are'} listed so far, and evidence
              changes that move a claim are logged separately with the source that moved it.
            </p>
          </div>
          <p className="prose" style={{ marginTop: 'var(--s4)' }}>
            <Link href="/corrections">Report an error →</Link>
          </p>
        </section>

        <hr className="rule" />

        {/* ----------------------------------------------------- the limits -- */}
        <section id="limits">
          <div className="section-head">
            <h2 className="h2">What this site cannot establish</h2>
          </div>
          <ul style={{ listStyle: 'none', borderTop: 'var(--hairline) solid var(--border)' }}>
            {LIMITS.map((l) => (
              <li
                key={l.title}
                style={{
                  borderBottom: 'var(--hairline) solid var(--border)',
                  paddingBlock: 'var(--s4)',
                }}
              >
                <h3 className="h4" style={{ fontFamily: 'var(--font-serif)', marginBottom: 'var(--s2)' }}>
                  {l.title}
                </h3>
                <p className="prose measure" style={{ fontSize: 'var(--size-small)' }}>
                  {l.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <hr className="rule" />

        <nav className="metaline" aria-label="Related pages">
          <Link href="/methodology">Methodology</Link>
          <Link href="/corrections">Corrections</Link>
          <Link href="/updates">Evidence changes</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
    </div>
  )
}
