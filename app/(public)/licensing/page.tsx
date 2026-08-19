import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Licence and reuse',
  description:
    'RNAwiki publishes its code under AGPL-3.0 and its evidence records under CC BY 4.0. What each covers, and how to attribute a record.',
}

// Same single voice as /privacy: "RNAwiki", never "we". See docs/writing-style.md.
//
// This page exists because CC BY only works if a reuser can find the terms and the attribution
// format without reading the repository. The canonical text lives in LICENSE, LICENSE-DATA and
// docs/licensing.md; this page must not drift from them.

const SCOPE: { key: string; value: string }[] = [
  { key: 'Code', value: 'GNU Affero General Public License v3.0.' },
  { key: 'Evidence records', value: 'Creative Commons Attribution 4.0 International.' },
  { key: 'Cited papers', value: 'Not RNAwiki’s to license — each carries its publisher’s terms.' },
  { key: 'Cost to read', value: 'None. No account, no advertising, no affiliate links.' },
]

const REPO = 'https://github.com/Compoundingzero/rnawiki'

export default function LicensingPage() {
  return (
    <div className="page doc">
      <header className="reading stack">
        <h1>Licence and reuse</h1>
        <p className="lead muted">
          RNAwiki is open source and its evidence records are open data, under two separate licences.
        </p>
      </header>

      <section className="section-sm">
        <dl className="facts">
          {SCOPE.map((s) => (
            <div key={s.key}>
              <dt>{s.key}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section-sm reading stack">
        <h2>The evidence records</h2>
        <p>
          You may copy, redistribute, adapt and build on the evidence records, including
          commercially and including as retrieval or training data for a machine-learning system,
          provided you give credit. The full terms are in{' '}
          <a href={`${REPO}/blob/main/LICENSE-DATA`}>CC BY 4.0</a>.
        </p>
        <p>
          {/* This link pointed at /evidence, which contains no API information of any kind —
              the reader was sent from a specific technical promise to a page that cannot confirm
              it. docs/api.md is the document the API is published in (tests/integration/
              api-v1-contract.test.ts says so), and it is linked the same way LICENSE and
              LICENSE-DATA are above. */}
          Credit means naming RNAwiki, linking to the record you used, and saying whether you
          changed it. A claim&rsquo;s canonical URL is the citation target, and the{' '}
          <a href={`${REPO}/blob/main/docs/api.md`}>public API</a> returns the same URL as{' '}
          <span className="id">canonicalUrl</span> on every claim.
        </p>
        <p className="panel panel--soft">
          Evidence record from RNAwiki (https://rnawiki.com/r/bpc-157#claim-tendon-healing), CC BY
          4.0. Retrieved 19 August 2026. Unmodified.
        </p>
        <p>
          The retrieval date is not a formality. A record is versioned and its conclusion can
          change when new evidence lands, so a citation without a link and a date describes a
          position that may no longer hold.
        </p>
      </section>

      <section className="section-sm reading stack">
        <h2>The code</h2>
        <p>
          The application is licensed under <a href={`${REPO}/blob/main/LICENSE`}>AGPL-3.0</a>. You
          may read it, run it, change it and redistribute it. Running a modified copy as a public
          service obliges you to offer that service&rsquo;s users your modified source. RNAwiki is
          a website, so a licence whose obligations fire only on distribution would never fire.
        </p>
        <p>
          Reading the code, auditing how a published answer was produced, and self-hosting an
          unmodified copy carry no obligation beyond keeping the licence notice.
        </p>
      </section>

      <section className="section-sm reading stack">
        <h2>What these licences do not cover</h2>
        <p>
          The grant covers RNAwiki&rsquo;s own work: the plain-language writing, the recorded
          evidence positions, the relationships between claims and sources, and the structure of
          the database. The cited papers, their abstracts and their figures belong to their authors
          and publishers. Regulatory documents carry the terms of the issuing authority. Medicine
          and manufacturer names may be trademarks of their owners.
        </p>
        <p>
          Identifiers and facts &mdash; a DOI, a PMID, a trial number, a sample size, a reported
          p-value &mdash; are not copyrightable in themselves, and nothing here asserts a claim over
          them.
        </p>
        <p>
          Neither licence is a warranty and neither is a medical authorisation. Publication status
          on this site is editorial workflow and never scientific review, so presenting a record as
          peer-reviewed misrepresents it whatever the licence permits.{' '}
          <Link href="/methodology">How RNAwiki decides what to publish</Link>.
        </p>
      </section>

      <section className="section-sm reading stack">
        <h2>Contributing</h2>
        <p>
          Contributions are accepted under the same two licences, with no contributor licence
          agreement and no copyright assignment. Evidence goes through the editorial workflow
          rather than a pull request that edits the database directly, and every cited source must
          be a real, checkable identifier verified when it is added.
        </p>
        <p>
          <a href={REPO}>Source on GitHub</a>. Something wrong on a page?{' '}
          <Link href="/corrections">Report an error</Link>.
        </p>
      </section>
    </div>
  )
}
