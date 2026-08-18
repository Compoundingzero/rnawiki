import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What RNAwiki collects, why, how long it is kept, who else sees it, and how to ask us to delete something.',
}

export default function PrivacyPage() {
  return (
    <div className="container prose-width" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>Privacy</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
          RNAwiki is free to read and does not require an account. This page explains, plainly, what we collect
          from readers, why, and what we do with it.
        </p>
      </header>

      <section style={{ marginBottom: 'var(--space-8)' }} id="reading-the-site">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>Just reading the site</h2>
        <p>
          You can read every published page, search, expand evidence sections, and follow citations without
          creating an account, and without us setting any tracking cookie. The only cookie RNAwiki ever sets is
          an internal, sign-in session cookie used exclusively by our own editorial staff (administrators,
          editors, and scientific reviewers) to manage content. It is not set for ordinary readers.
        </p>
        <p>
          Like any web server, our infrastructure records standard request logs (things like the requested URL,
          timestamp, and response status) as a normal part of running the site and diagnosing problems. This is
          infrastructure-level logging, not a per-visitor profile we build or query.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="analytics">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>Product analytics</h2>
        <p>
          RNAwiki supports an optional, privacy-conscious analytics integration that is <strong>off unless we
          explicitly turn it on</strong> (it only activates if a write key is configured on the server). When it
          is active, what it records is discrete product events — for example, that an entity page was viewed, a
          claim&rsquo;s evidence was expanded, or a search was performed — not a running, indefinite log of the
          literal text of every search you type tied to your identity.
        </p>
        <p>
          Search terms you enter are sent to your browser&rsquo;s address bar as part of the search results URL,
          the same way any ordinary web search works, and may appear transiently in standard request logs like
          any other URL. We do not maintain a permanent, per-visitor search history.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="anonymous-submissions">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>Corrections and comprehension answers</h2>
        <p>
          Two things on the site can be submitted without an account: a{' '}
          <a href="/corrections">correction report</a>, and an answer to a short comprehension check on a claim
          page. Both are rate-limited and de-duplicated using the same privacy-conscious method, described
          exactly:
        </p>
        <p>
          We compute a one-way hash from your IP address, a coarse slice of your browser&rsquo;s user-agent
          string, and a salt value that itself rotates every day. That combined hash — never the raw IP address
          — is what gets stored alongside your submission. It exists purely so we can tell &ldquo;this is
          probably the same visitor submitting again today&rdquo; without storing anything that identifies you.
          Because the salt changes daily, the same visitor gets a different, unlinkable hash tomorrow — the hash
          cannot be used to build a profile of you or trace your activity across days.
        </p>
        <p>
          We do not store your raw IP address, your name, or any other identifying detail with a correction or a
          comprehension answer, and we don&rsquo;t ask for one.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="internal-accounts">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>Internal accounts</h2>
        <p>
          A small number of internal accounts exist for administrators, editors, and scientific reviewers, used
          to write and approve content. These hold an email address, a name, a securely hashed password, and —
          for reviewers — their stated credentials and field, since that information is shown publicly next to
          any review they approve. These accounts are not available to the public and are unrelated to reading
          the site.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="third-parties">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>Who else sees this</h2>
        <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-3)' }}>
          <li>
            <strong>Hosting and database.</strong> RNAwiki runs on Railway, which hosts the application and the
            Postgres database that stores everything described on this page. Railway acts as our infrastructure
            provider, not as an independent user of the data.
          </li>
          <li>
            <strong>Transactional email.</strong> If you choose to follow an entity for evidence-change alerts,
            that feature (when enabled) sends email through Resend, a transactional email provider, solely to
            deliver the alert and confirmation emails you asked for. This feature is feature-flagged and is only
            active when we have configured an email-sending key on the server.
          </li>
          <li>
            <strong>Analytics.</strong> As described above, only if the optional analytics integration has been
            turned on, and only in the aggregate, event-based form described there.
          </li>
        </ul>
        <p style={{ marginTop: 'var(--space-3)' }}>We do not sell data, and we do not run advertising on this site.</p>
      </section>

      <section id="deletion">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>Asking us to delete something</h2>
        <p>
          We don&rsquo;t currently have a self-service delete-my-data button — the site doesn&rsquo;t hold
          accounts or profiles for ordinary readers to log into in the first place. If you submitted a
          correction or a subscription and want it removed, email{' '}
          <a href="mailto:hello@rnawiki.com">hello@rnawiki.com</a> with enough detail for us to find it (roughly
          when you submitted it, and what it was about), and we will locate and remove it by hand. If you
          subscribed to entity alerts, every alert email also includes a direct unsubscribe link.
        </p>
      </section>
    </div>
  )
}
