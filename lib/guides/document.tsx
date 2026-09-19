import { DocumentShell } from '@/components/document/DocumentShell'
import { documentResponse } from '@/lib/document/render'
import { googleAnalyticsMeasurementId } from '@/lib/google-analytics'

import type { GuideFact, SubstanceGuide } from './substance-guides'

function Fact({ label, fact }: { label: string; fact: GuideFact }) {
  return (
    <section className="guide-fact">
      <h2>{label}</h2>
      <p>{fact.text}</p>
      <a href={fact.sourceUrl} rel="noopener noreferrer">
        Check source: {fact.sourceLabel}
      </a>
    </section>
  )
}

export function guideDocumentResponse(guide: SubstanceGuide): Promise<Response> {
  const path: `/${string}` = `/guides/${guide.slug}`
  return documentResponse(
    <DocumentShell
      analyticsMeasurementId={googleAnalyticsMeasurementId(
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      )}
      canonicalPath={path}
      description={guide.searchHint}
      jsonLd={null}
      ogType="article"
      robots={{ index: false, follow: true }}
      title={`${guide.title} | RNAWiki`}
    >
      <article className="guide-root">
        <p className="guide-eyebrow">Identity guide · editorial draft</p>
        <h1>{guide.title}</h1>
        <p className="guide-intro">{guide.identity.text}</p>
        <p className="guide-source">
          <a href={guide.identity.sourceUrl} rel="noopener noreferrer">
            Source: {guide.identity.sourceLabel}
          </a>
        </p>
        <div className="guide-body">
          <Fact fact={guide.mechanism} label="How it works" />
          <Fact fact={guide.evidence} label="What was studied" />
          <Fact fact={guide.importantLimit} label="What that does not prove" />
          <Fact fact={guide.readerCheck} label="What to check next" />
        </div>
        <nav aria-label="Related medicine records" className="guide-related">
          <h2>Related records</h2>
          <ul>
            {guide.related.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
          <p>Related does not mean interchangeable.</p>
        </nav>
      </article>
      <style>{`
        .guide-root { color: #232327; max-width: 50rem; margin: 0 auto; padding: 3rem 1.2rem 5rem; font: 1.05rem/1.6 system-ui, sans-serif; }
        .guide-root h1, .guide-root h2 { line-height: 1.18; text-wrap: balance; }
        .guide-root h1 { font: 600 clamp(2.2rem, 6vw, 3.8rem)/1.1 Georgia, serif; margin: .4rem 0 1.2rem; }
        .guide-root h2 { font: 600 1.55rem/1.25 Georgia, serif; margin: 0 0 .65rem; }
        .guide-root p { max-width: 44rem; margin: 0 0 1rem; }
        .guide-root a { color: #075ab2; text-underline-offset: .18em; }
        .guide-root a:focus-visible { outline: 2px solid #075ab2; outline-offset: 3px; }
        .guide-eyebrow { color: #52535b; font-size: .86rem; letter-spacing: .07em; text-transform: uppercase; }
        .guide-intro { font-size: clamp(1.17rem, 2vw, 1.4rem); }
        .guide-source, .guide-fact a { font-size: .88rem; }
        .guide-body { border-top: 1px solid #d8d8df; margin-top: 2.2rem; }
        .guide-fact { border-bottom: 1px solid #d8d8df; padding: 1.7rem 0; }
        .guide-related { margin-top: 2rem; }
        .guide-related ul { padding-left: 1.25rem; }
      `}</style>
    </DocumentShell>,
  )
}
