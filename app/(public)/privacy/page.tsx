import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What RNAwiki collects, why, who else sees it, and how to have something deleted.',
}

// Single voice: this page says "RNAwiki", never "we". The site is run by one person, so "we"
// would imply an organisation that does not exist — on the page where that matters most. See
// docs/writing-style.md.
export default function PrivacyPage() {
  return (
    <div className="container prose-width" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>Privacy</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)' }}>
          RNAwiki is free to read, needs no account, and sets no tracking cookie.
        </p>
      </header>

      <section style={{ marginBottom: 'var(--space-8)' }} id="reading-the-site">
        <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-3)' }}>Reading the site</h2>
        <p>
          Every published page, search, evidence section and citation is readable without an account. The only
          cookie RNAwiki sets is a sign-in session for editorial staff. Ordinary readers never receive one.
        </p>
        <p>
          The server keeps standard request logs — URL, timestamp, response status — as part of running the site.
          That is infrastructure logging, not a per-visitor profile.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="analytics">
        <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-3)' }}>Analytics</h2>
        <p>
          Optional, and <strong>off unless a write key is configured on the server</strong>. When active it
          records discrete events — an entity page viewed, evidence expanded, a search performed — not a running
          log of what you typed tied to your identity.
        </p>
        <p>
          Search terms travel in the results URL, as on any search page, and appear transiently in request logs.
          No permanent per-visitor search history is kept.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="anonymous-submissions">
        <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-3)' }}>Corrections and comprehension answers</h2>
        <p>
          Both can be submitted without an account. Both are rate-limited by the same method: a one-way hash of
          your IP address, a coarse slice of your user-agent string, and a salt that rotates daily. The hash is
          stored; the raw IP address is not.
        </p>
        <p>
          Because the salt changes every day, the same visitor hashes differently tomorrow. The value cannot be
          used to link your activity across days or build a profile. Nothing else identifying is stored with a
          correction or an answer, and nothing else is asked for.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="internal-accounts">
        <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-3)' }}>Internal accounts</h2>
        <p>
          Administrator, editor and reviewer accounts hold an email address, a name, a hashed password, and — for
          reviewers — the credentials and field shown publicly beside any review they approve. These accounts are
          for writing and approving content. They are unrelated to reading the site.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="third-parties">
        <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-3)' }}>Who else sees this</h2>
        <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-2)' }}>
          <li>
            <strong>Railway</strong> hosts the application and the Postgres database holding everything described
            here, as an infrastructure provider.
          </li>
          <li>
            <strong>Resend</strong> delivers evidence-change alerts, if you subscribe to an entity. Feature-flagged
            and inactive unless an email key is configured.
          </li>
          <li>
            <strong>Analytics</strong>, only if the optional integration above is switched on.
          </li>
        </ul>
        <p style={{ marginTop: 'var(--space-3)' }}>No data is sold. No advertising runs on this site.</p>
      </section>

      <section id="deletion">
        <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-3)' }}>Deletion</h2>
        <p>
          There is no self-service delete button, because readers have no account to log into. To remove a
          correction or a subscription, email <a href="mailto:hello@rnawiki.com">hello@rnawiki.com</a> with
          roughly when you submitted it and what it concerned, and it will be found and deleted by hand. Every
          alert email also carries an unsubscribe link.
        </p>
      </section>
    </div>
  )
}
