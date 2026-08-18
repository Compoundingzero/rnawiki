import Link from 'next/link'
import { Wordmark } from '@/components/brand/Wordmark'
import { HeaderSearch } from '@/components/HeaderSearch'

// Reader chrome. Navigation is literal: each label names the kind of record it
// leads to. Nothing here advertises a feature that does not exist — there is no
// "Create", no "Today", and no Pathways or Topics entry, because the corpus
// holds no pathway or topic records yet.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Masthead />
      <main id="main">{children}</main>
      <Colophon />
    </>
  )
}

function Masthead() {
  return (
    <header className="masthead">
      <div className="wrap masthead__inner">
        <Link href="/" style={{ textDecoration: 'none' }} aria-label="RNAwiki, home">
          <Wordmark />
        </Link>
        <nav className="masthead__nav" aria-label="Primary">
          <Link href="/compounds">Compounds</Link>
          <Link href="/evidence">Evidence</Link>
          <Link href="/updates">Changes</Link>
          <Link href="/corrections">Corrections</Link>
        </nav>
        <div className="masthead__search">
          <HeaderSearch />
        </div>
      </div>
    </header>
  )
}

function Colophon() {
  return (
    <footer className="colophon">
      <div className="wrap">
        <div className="colophon__grid">
          <div>
            <h2>Evidence</h2>
            <ul>
              <li>
                <Link href="/evidence">How RNAwiki is made</Link>
              </li>
              <li>
                <Link href="/methodology">Evidence scale</Link>
              </li>
              <li>
                <Link href="/methodology#independence">Independence</Link>
              </li>
              <li>
                <Link href="/corrections">Corrections</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>Browse</h2>
            <ul>
              <li>
                <Link href="/compounds">All compounds</Link>
              </li>
              <li>
                <Link href="/search">Search</Link>
              </li>
              <li>
                <Link href="/updates">Evidence changes</Link>
              </li>
              <li>
                <a href="/sitemap.xml">Sitemap</a>
              </li>
            </ul>
          </div>
          <div>
            <h2>About</h2>
            <ul>
              <li>
                <Link href="/evidence">Editorial policy</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/corrections">Report an error</Link>
              </li>
              <li>
                <a href="https://github.com/Compoundingzero/rnawiki">Source on GitHub</a>
              </li>
            </ul>
          </div>
          <div>
            <h2>Limitations</h2>
            <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
              RNAwiki explains research evidence. It does not provide medical advice, diagnosis, dosing, or
              instructions for obtaining or using unapproved substances. Not reviewed by a clinician.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
