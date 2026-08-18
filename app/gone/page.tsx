import type { Metadata } from 'next'
import Link from 'next/link'
import { SearchBox } from '@/components/SearchBox'
import { NoticeMasthead } from '@/components/notice/NoticeMasthead'
import {
  GONE_DESTINATIONS,
  GONE_DESTINATIONS_HEADING,
  GONE_DISPOSITIONS,
  GONE_DISPOSITION_HEADING,
  GONE_EYEBROW,
  GONE_LEAD,
  GONE_REASON,
  GONE_REASON_HEADING,
  GONE_SEARCH_HEADING,
  GONE_TITLE,
} from '@/lib/gone-notice'

/**
 * The linkable explanation for content that was removed on purpose.
 *
 * `middleware.ts` answers the predecessor product's removed routes with 410 and a
 * standalone copy of this notice — it runs before the render, so it cannot use
 * this component. Both read their wording from `lib/gone-notice.ts`, which is why
 * the copy lives there rather than in this file.
 *
 * This page is served 200, because it is a real page about removals rather than a
 * removed page. It therefore prints no address and no status line: those two rows
 * describe one specific closed request, and only middleware has one.
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
      <main id="main" className="wrap" style={{ paddingBlock: 'var(--s8) var(--s7)' }}>
        <div className="measure">
          <p className="eyebrow">{GONE_EYEBROW}</p>
          <h1 className="h1" style={{ marginBlock: 'var(--s3) var(--s4)' }}>
            {GONE_TITLE}
          </h1>
          <p className="lead">{GONE_LEAD}</p>

          <hr className="rule" />

          <section>
            <div className="section-head">
              <h2 className="h2">{GONE_REASON_HEADING}</h2>
            </div>
            <div className="prose">
              {GONE_REASON.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <hr className="rule" />

          <section>
            <div className="section-head">
              <h2 className="h2">{GONE_DISPOSITION_HEADING}</h2>
            </div>
            <dl className="speclabel">
              {GONE_DISPOSITIONS.map((d) => (
                <div key={d.key} className="speclabel__row">
                  <dt className="speclabel__key">{d.key}</dt>
                  <dd className="speclabel__val" style={{ margin: 0 }}>
                    {d.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <hr className="rule" />

          <section>
            <div className="section-head">
              <h2 className="h2">{GONE_SEARCH_HEADING}</h2>
            </div>
            <SearchBox />
          </section>

          <hr className="rule" />

          <section>
            <div className="section-head">
              <h2 className="h2">{GONE_DESTINATIONS_HEADING}</h2>
            </div>
            <ul className="rows">
              {GONE_DESTINATIONS.map((d) => (
                <li key={d.href} className="row">
                  <Link href={d.href} className="row__link">
                    <div>
                      <div className="row__name">{d.label}</div>
                      <p className="row__desc">{d.note}</p>
                    </div>
                    <span className="row__chev" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  )
}
