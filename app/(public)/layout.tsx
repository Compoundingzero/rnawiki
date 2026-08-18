import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  )
}

// The site-wide disclosure lives here and only here. Pages add a contextual warning only when a
// specific record carries a specific risk.
function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page">
        <ul className="site-footer__links">
          <li>
            <Link href="/evidence">How it works</Link>
          </li>
          <li>
            <Link href="/updates">Changes</Link>
          </li>
          <li>
            <Link href="/corrections">Corrections</Link>
          </li>
          <li>
            <Link href="/privacy">Privacy</Link>
          </li>
          <li>
            <a href="https://github.com/Compoundingzero/rnawiki">Source on GitHub</a>
          </li>
        </ul>
        <p className="muted">
          RNAwiki explains research evidence. It is not reviewed by a clinician and does not provide medical
          advice, diagnosis, dosing or sourcing guidance.
        </p>
      </div>
    </footer>
  )
}
