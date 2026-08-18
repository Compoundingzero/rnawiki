import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What RNAwiki collects, why, who else sees it, and how to have something deleted.',
}

// Single voice: this page says "RNAwiki", never "we". The site is run by one person, so "we"
// would imply an organisation that does not exist — on the page where that matters most. See
// docs/writing-style.md.
export default function PrivacyPage() {
  return (
    <div className="wrap" style={{ paddingBlock: 'var(--s7)' }}>
      <div style={{ maxWidth: '56rem' }}>
        <header className="measure">
          <p className="eyebrow">Data practices</p>
          <h1 className="display" style={{ marginBlock: 'var(--s3) var(--s4)' }}>
            Privacy
          </h1>
          <p className="lead">RNAwiki is free to read, needs no account, and sets no tracking cookie.</p>
        </header>

        {/* Summary first, in the same specimen-label device used for record metadata. */}
        <dl className="speclabel" style={{ marginTop: 'var(--s6)' }}>
          <div className="speclabel__row">
            <dt className="speclabel__key">Account</dt>
            <dd className="speclabel__val" style={{ margin: 0 }}>
              Not required to read anything
            </dd>
          </div>
          <div className="speclabel__row">
            <dt className="speclabel__key">Reader cookies</dt>
            <dd className="speclabel__val" style={{ margin: 0 }}>
              None. The only cookie is an editorial sign-in session
            </dd>
          </div>
          <div className="speclabel__row">
            <dt className="speclabel__key">Advertising</dt>
            <dd className="speclabel__val" style={{ margin: 0 }}>
              None
            </dd>
          </div>
          <div className="speclabel__row">
            <dt className="speclabel__key">Data sold</dt>
            <dd className="speclabel__val" style={{ margin: 0 }}>
              None
            </dd>
          </div>
          <div className="speclabel__row">
            <dt className="speclabel__key">Contact</dt>
            <dd className="speclabel__val" style={{ margin: 0 }}>
              <a href="mailto:hello@rnawiki.com">hello@rnawiki.com</a>
            </dd>
          </div>
        </dl>

        <hr className="rule" />

        <section id="reading-the-site" className="measure">
          <div className="section-head">
            <h2 className="h2">Reading the site</h2>
          </div>
          <div className="prose">
            <p>
              Every published page, search, evidence section and citation is readable without an account. The
              only cookie RNAwiki sets is a sign-in session for editorial staff. Ordinary readers never receive
              one.
            </p>
            <p>
              The server keeps standard request logs — URL, timestamp, response status — as part of running the
              site. That is infrastructure logging, not a per-visitor profile.
            </p>
          </div>
        </section>

        <hr className="rule" />

        <section id="analytics" className="measure">
          <div className="section-head">
            <h2 className="h2">Analytics</h2>
          </div>
          <div className="prose">
            <p>
              Optional, and <strong>off unless a write key is configured on the server</strong>. When active it
              records discrete events — an entity page viewed, evidence expanded, a search performed — not a
              running log of what you typed tied to your identity.
            </p>
            <p>
              Search terms travel in the results URL, as on any search page, and appear transiently in request
              logs. No permanent per-visitor search history is kept.
            </p>
          </div>
        </section>

        <hr className="rule" />

        <section id="anonymous-submissions" className="measure">
          <div className="section-head">
            <h2 className="h2">Corrections and comprehension answers</h2>
          </div>
          <div className="prose">
            <p>
              Both can be submitted without an account. Both are rate-limited by the same method: a one-way hash
              of your IP address, a coarse slice of your user-agent string, and a salt that rotates daily. The
              hash is stored; the raw IP address is not.
            </p>
            <p>
              Because the salt changes every day, the same visitor hashes differently tomorrow. The value cannot
              be used to link your activity across days or build a profile. Nothing else identifying is stored
              with a correction or an answer, and nothing else is asked for.
            </p>
          </div>
        </section>

        <hr className="rule" />

        <section id="internal-accounts" className="measure">
          <div className="section-head">
            <h2 className="h2">Internal accounts</h2>
          </div>
          <p className="prose">
            Administrator, editor and reviewer accounts hold an email address, a name, a hashed password, and —
            for reviewers — the credentials and field shown publicly beside any review they approve. These
            accounts are for writing and approving content. They are unrelated to reading the site.
          </p>
        </section>

        <hr className="rule" />

        <section id="third-parties">
          <div className="section-head">
            <h2 className="h2">Who else sees this</h2>
          </div>
          <dl className="speclabel">
            <div className="speclabel__row">
              <dt className="speclabel__key">Railway</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                Hosts the application and the Postgres database holding everything described here, as an
                infrastructure provider
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Resend</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                Delivers evidence-change alerts, if you subscribe to an entity. Feature-flagged and inactive
                unless an email key is configured
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Analytics</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                Only if the optional integration above is switched on
              </dd>
            </div>
          </dl>
          <p className="prose measure" style={{ marginTop: 'var(--s4)' }}>
            No data is sold. No advertising runs on this site.
          </p>
        </section>

        <hr className="rule" />

        <section id="deletion" className="measure">
          <div className="section-head">
            <h2 className="h2">Deletion</h2>
          </div>
          <p className="prose">
            There is no self-service delete button, because readers have no account to log into. To remove a
            correction or a subscription, email <a href="mailto:hello@rnawiki.com">hello@rnawiki.com</a> with
            roughly when you submitted it and what it concerned, and it will be found and deleted by hand. Every
            alert email also carries an unsubscribe link.
          </p>
          <p className="prose" style={{ marginTop: 'var(--s4)' }}>
            <Link href="/evidence">How RNAwiki is made →</Link>
          </p>
        </section>
      </div>
    </div>
  )
}
