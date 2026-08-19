import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What RNAwiki collects, why, who else sees it, and how to have something deleted.',
}

// Single voice: this page says "RNAwiki", never "we". The site is run by one person, so "we"
// would imply an organisation that does not exist — on the page where that matters most. See
// docs/writing-style.md.

const SUMMARY: { key: string; value: string }[] = [
  { key: 'Account', value: 'Not needed to read anything.' },
  { key: 'Reader cookies', value: 'None. The only cookie is an editorial sign-in session.' },
  { key: 'Advertising', value: 'None.' },
  { key: 'Data sold', value: 'None.' },
]

const THIRD_PARTIES: { key: string; value: string }[] = [
  {
    key: 'Railway',
    value: 'Hosts the application and the Postgres database holding everything described on this page.',
  },
  {
    key: 'Resend',
    value: 'Delivers evidence-change alerts to anyone who subscribes to a record. Inactive unless an email key is configured.',
  },
  { key: 'Analytics', value: 'Only if the optional integration below is switched on.' },
]

export default function PrivacyPage() {
  return (
    <div className="page doc">
      <header className="reading stack">
        <h1>Privacy</h1>
        <p className="lead muted">RNAwiki is free to read, needs no account, and sets no tracking cookie.</p>
      </header>

      <section className="section-sm">
        <dl className="facts">
          {SUMMARY.map((s) => (
            <div key={s.key}>
              <dt>{s.key}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section" id="reading-the-site">
        <h2>Reading the site</h2>
        <div className="reading stack" style={{ marginTop: 'var(--s4)' }}>
          <p className="muted">
            Every published page, search and citation is readable without an account. The only cookie RNAwiki
            sets is a sign-in session for editorial staff. Readers never receive one.
          </p>
          <p className="muted">
            The server keeps standard request logs — the address, the time and the response status — as part of
            running the site. That is infrastructure logging, not a per-visitor profile.
          </p>
        </div>
      </section>

      <section className="section" id="analytics">
        <h2>Analytics</h2>
        <div className="reading stack" style={{ marginTop: 'var(--s4)' }}>
          <p className="muted">
            Optional, and off unless a write key is configured on the server. When it is active it records
            discrete events — a record viewed, evidence expanded, a search performed — not a running log tied to
            a person.
          </p>
          <p className="muted">
            Search terms travel in the results address, as on any search page, and appear briefly in request
            logs. No permanent per-visitor search history is kept.
          </p>
        </div>
      </section>

      <section className="section" id="anonymous-submissions">
        <h2>Corrections and comprehension answers</h2>
        <div className="reading stack" style={{ marginTop: 'var(--s4)' }}>
          <p className="muted">
            Both can be sent without an account. Both are rate-limited the same way: a one-way hash of the IP
            address, a coarse slice of the browser’s user-agent string, and a salt that changes daily. The hash
            is stored; the raw IP address is not.
          </p>
          <p className="muted">
            Because the salt changes every day, the same visitor hashes differently tomorrow. The value cannot
            link activity across days or build a profile. Nothing else identifying is stored with a correction or
            an answer, and nothing else is asked for.
          </p>
        </div>
      </section>

      <section className="section" id="internal-accounts">
        <h2>Editorial accounts</h2>
        <p className="reading muted" style={{ marginTop: 'var(--s4)' }}>
          Administrator, editor and reviewer accounts hold an email address, a name, a hashed password, and — for
          reviewers — stated credentials. None of those three is published: a public record shows that a review
          happened and when, never who did it. These accounts exist for writing and approving content. They have
          nothing to do with reading the site.
        </p>
      </section>

      <section className="section" id="third-parties">
        <h2>Who else sees this</h2>
        <dl className="facts" style={{ marginTop: 'var(--s4)' }}>
          {THIRD_PARTIES.map((t) => (
            <div key={t.key}>
              <dt>{t.key}</dt>
              <dd>{t.value}</dd>
            </div>
          ))}
        </dl>
        <p className="reading muted" style={{ marginTop: 'var(--s5)' }}>
          No data is sold, and no advertising runs on this site.
        </p>
      </section>

      <section className="section" id="deletion">
        <h2>Deleting something</h2>
        <div className="reading stack" style={{ marginTop: 'var(--s4)' }}>
          <p className="muted">
            There is no self-service delete button, because readers have no account to sign into. To remove a
            correction or a subscription, email <a href="mailto:hello@rnawiki.com">hello@rnawiki.com</a> with
            roughly when it was sent and what it concerned, and it will be found and deleted by hand. Every alert
            email also carries an unsubscribe link.
          </p>
          <p>
            <Link href="/evidence">How RNAwiki works</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
