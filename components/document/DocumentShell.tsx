/**
 * The whole HTML document a corpus record or a group page is served as.
 *
 * Step 6.1 measured the App Router pages shipping every dossier twice: the rendered HTML, and the
 * same text again inside the React Server Components stream Next.js inlines into the document.
 * `createInlinedDataReadableStream` is called unconditionally in
 * `next/dist/server/app-render/app-render.js`, so no configuration removes the second copy from a
 * page. These two route families therefore leave the page pipeline: the server renders this tree
 * to static markup, and the only script the document loads is the island in `lib/island`, which
 * receives the search field's state and nothing of the record.
 *
 * What that costs is stated in `docs/specs/deployment-plan.md`. What it must keep is here: one
 * `<main>`, one JSON-LD block, the skip link, the canonical and robots decision the App Router
 * pages take, and the same stylesheets the React shell links.
 */
import type { ReactNode } from 'react'

import { DocumentFooter } from './DocumentFooter'
import { DocumentHeader } from './DocumentHeader'
import { fontVariableClassName } from '@/lib/fonts'
import { documentStylesheetHrefs } from '@/lib/document/stylesheets'
import { robotsMetaTags } from '@/lib/document/robots'
import { serialiseJsonLd } from '@/lib/json-ld'
import { configuredPublicUrl } from '@/lib/seo/deployment'

export interface DocumentShellProps {
  title: string
  description?: string | undefined
  canonicalPath: `/${string}`
  /** The indexing decision, taken by the caller from the record itself. */
  robots: { index: boolean; follow: boolean }
  /** The single structured-data block. `null` where the record does not qualify for one. */
  jsonLd?: object | null
  /** The generated social card, where the route publishes one. */
  ogImagePath?: `/${string}` | undefined
  ogType: 'article' | 'website'
  /** Measurement id for the analytics the island loads once a reader has allowed it. */
  analyticsMeasurementId: string | null
  children: ReactNode
}

export function DocumentShell({
  title,
  description,
  canonicalPath,
  robots,
  jsonLd,
  ogImagePath,
  ogType,
  analyticsMeasurementId,
  children,
}: DocumentShellProps) {
  const canonical = configuredPublicUrl(canonicalPath)
  const tags = robotsMetaTags(robots)
  const ogImage = ogImagePath ? configuredPublicUrl(ogImagePath) : null
  return (
    <html className={fontVariableClassName} lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="#F5F5F7" name="theme-color" />
        {documentStylesheetHrefs().map((href) => (
          <link href={href} key={href} rel="stylesheet" />
        ))}
        <title>{title}</title>
        {description ? <meta content={description} name="description" /> : null}
        <link href={canonical} rel="canonical" />
        <meta content={tags.robots} name="robots" />
        <meta content={tags.googlebot} name="googlebot" />
        <meta content="RNAWiki" name="application-name" />
        {analyticsMeasurementId ? (
          <meta content={analyticsMeasurementId} name="rnawiki-analytics" />
        ) : null}
        <link href="/manifest.webmanifest" rel="manifest" />
        <link href="/icon" rel="icon" sizes="64x64" type="image/png" />
        <meta content={title} property="og:title" />
        {description ? <meta content={description} property="og:description" /> : null}
        <meta content={canonical} property="og:url" />
        <meta content={ogType} property="og:type" />
        <meta content="RNAWiki" property="og:site_name" />
        {/*
          A card with a generated image is a large summary; a group page has no image and is a
          plain one. Twitter reads the title and description from the Open Graph tags above, which
          are this page's own rather than the site-wide pair the React shell inherited.
        */}
        {ogImage ? (
          <>
            <meta content={ogImage} property="og:image" />
            <meta content="1200" property="og:image:width" />
            <meta content="630" property="og:image:height" />
            <meta content="RNAWiki medicine evidence record" property="og:image:alt" />
            <meta content="summary_large_image" name="twitter:card" />
            <meta content={ogImage} name="twitter:image" />
          </>
        ) : (
          <meta content="summary" name="twitter:card" />
        )}
      </head>
      <body className="bg-[#F5F5F7] text-[#1D1D1F] antialiased">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-[#0071E3] focus:shadow-lg"
          href="#main"
        >
          Skip to content
        </a>
        <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-sans antialiased selection:bg-[#0071E3]/15 selection:text-[#0071E3]">
          <DocumentHeader />
          <main className="flex-1 pb-12" id="main">
            {children}
          </main>
          <DocumentFooter />
        </div>
        {jsonLd ? (
          <script
            dangerouslySetInnerHTML={{ __html: serialiseJsonLd(jsonLd) }}
            type="application/ld+json"
          />
        ) : null}
        <script defer src="/island/rnawiki-document.js" />
      </body>
    </html>
  )
}
