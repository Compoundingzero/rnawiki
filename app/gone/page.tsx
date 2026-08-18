import type { Metadata } from 'next'
import Link from 'next/link'
import { NoticeMasthead } from '@/components/notice/NoticeMasthead'
import {
  GONE_DESTINATIONS,
  GONE_DESTINATIONS_HEADING,
  GONE_DISPOSITIONS,
  GONE_DISPOSITION_HEADING,
  GONE_LEAD,
  GONE_REASON,
  GONE_REASON_HEADING,
  GONE_SEARCH_HEADING,
  GONE_TITLE,
  SEARCH_LABEL,
} from '@/lib/gone-notice'

/**
 * The linkable explanation for content that was removed on purpose.
 *
 * `middleware.ts` answers the predecessor product's removed routes with 410 and a standalone copy
 * of this notice — it runs before the render, so it cannot use this component. Both read their
 * wording from `lib/gone-notice.ts`, which is why the copy lives there rather than in this file.
 *
 * This page is served 200, because it is a real page about removals rather than a removed page. It
 * therefore prints no address and no status line: those two rows describe one specific closed
 * request, and only middleware has one.
 */
export const metadata: Metadata = {
  title: 'Removed pages',
  description:
    'Why some addresses from the earlier version of RNAwiki were withdrawn rather than redirected, and where to go instead.',
  robots: { index: false, follow: true },
}

export default function GonePage() {
  return (
    <>
      <NoticeMasthead />
      <main id="main" className="page doc">
        <header className="reading stack">
          <h1>{GONE_TITLE}</h1>
          <p className="lead muted">{GONE_LEAD}</p>
        </header>

        <section className="section-sm">
          <h2>{GONE_REASON_HEADING}</h2>
          <div className="reading stack muted" style={{ marginTop: 'var(--s4)' }}>
            {GONE_REASON.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>{GONE_DISPOSITION_HEADING}</h2>
          <dl className="facts" style={{ marginTop: 'var(--s4)' }}>
            {GONE_DISPOSITIONS.map((d) => (
              <div key={d.key}>
                <dt>{d.key}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="section">
          <h2>{GONE_SEARCH_HEADING}</h2>
          <form
            role="search"
            action="/search"
            method="get"
            className="search search--compact"
            style={{ marginTop: 'var(--s4)' }}
          >
            <label htmlFor="gone-q" className="skip-link">
              {SEARCH_LABEL}
            </label>
            <input
              id="gone-q"
              name="q"
              type="search"
              className="search__input"
              placeholder={SEARCH_LABEL}
              autoComplete="off"
            />
            <button type="submit" className="search__btn">
              Search
            </button>
          </form>
        </section>

        <section className="section">
          <h2>{GONE_DESTINATIONS_HEADING}</h2>
          <ul className="records reading" style={{ marginTop: 'var(--s4)' }}>
            {GONE_DESTINATIONS.map((d) => (
              <li key={d.href}>
                <Link href={d.href} className="record-link">
                  <div className="record-link__name">{d.label}</div>
                  <div className="record-link__desc">{d.note}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
