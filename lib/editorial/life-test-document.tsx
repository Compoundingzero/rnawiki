import { DocumentShell } from '@/components/document/DocumentShell'
import { documentResponse } from '@/lib/document/render'
import { googleAnalyticsMeasurementId } from '@/lib/google-analytics'

import { MAGNESIUM_SLEEP_STUDY as trial } from './dossier-briefs'

/** A preview-only evidence-literacy example, not a RNAWiki-reviewed treatment verdict. */
export function lifeTestDocumentResponse(): Promise<Response> {
  return documentResponse(
    <DocumentShell
      analyticsMeasurementId={googleAnalyticsMeasurementId(
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      )}
      canonicalPath="/life-test"
      description="A worked example of checking one health claim against the people, measurement, result, limits and source in a study."
      jsonLd={null}
      ogType="article"
      robots={{ index: false, follow: true }}
      title="Check a health claim | RNAWiki"
    >
      <article className="lt-root">
        <header className="lt-header">
          <p className="lt-eyebrow">RNAWiki evidence checkpoint · preview</p>
          <h1>Does magnesium bisglycinate help with sleep?</h1>
          <p className="lt-intro">
            Magnesium bisglycinate is one form of magnesium sold as a supplement. One published
            study gives us a way to check this claim—and shows where the answer stops.
          </p>
          <p className="lt-status">
            Worked example, not a RNAWiki-reviewed conclusion or advice to take a supplement.
          </p>
        </header>

        <div className="lt-sections">
          <section aria-labelledby="lt-claim">
            <h2 id="lt-claim">The claim</h2>
            <p>“{trial.claim}”</p>
          </section>

          <section aria-labelledby="lt-people">
            <h2 id="lt-people">Who was studied?</h2>
            <p>
              Researchers split {trial.randomized} adults aged {trial.ages} who said they slept
              poorly into two groups by chance. {trial.primaryAnalysis} were included in the main
              result. The comparison lasted {trial.durationWeeks} weeks.
            </p>
          </section>

          <section aria-labelledby="lt-measure">
            <h2 id="lt-measure">What did they measure?</h2>
            <p>
              A seven-question sleep-problem score from 0 to 28, not sleep recorded by a device. A
              lower score means fewer reported problems. One group took magnesium bisglycinate; the
              other took look-alike capsules with no magnesium.
            </p>
          </section>

          <section aria-labelledby="lt-result" className="lt-result">
            <h2 id="lt-result">What happened?</h2>
            <p>
              After {trial.durationWeeks} weeks, the average score fell {trial.scoreDropMagnesium}{' '}
              points with magnesium and {trial.scoreDropPlacebo} points with the look-alike pill.
              That is a small extra {trial.extraScoreDrop}-point drop on the questionnaire—not a
              promise that any one person will notice a benefit.
            </p>
          </section>

          <section aria-labelledby="lt-unknown">
            <h2 id="lt-unknown">What remains unknown?</h2>
            <p>
              The study did not measure sleep with a device, and its other sleep and daytime
              questionnaires did not show a clear difference between groups. It does not establish
              whether people slept longer or kept any benefit beyond four weeks. It did not test
              whether people could do more of the everyday activities they care about.
            </p>
          </section>
        </div>

        <footer className="lt-source">
          <h2>Check the source</h2>
          <p>
            <a href={trial.source.url} rel="noopener noreferrer">
              Read the full 2025 trial by Schuster and colleagues
            </a>
            . Its registered study is{' '}
            <a href={trial.registryUrl} rel="noopener noreferrer">
              DRKS00031494
            </a>
            . RNAWiki has not published a reviewed conclusion from it.
          </p>
        </footer>
      </article>
      <style>{`
        .lt-root { color: #22252b; max-width: 48rem; margin: 0 auto; padding: 3rem 1.3rem 5rem; font: 1.075rem/1.62 system-ui, sans-serif; }
        .lt-root h1, .lt-root h2 { text-wrap: balance; }
        .lt-root h1 { max-width: 19ch; font: 600 clamp(2.25rem, 5vw, 3.35rem)/1.1 Georgia, serif; margin: .5rem 0 1rem; }
        .lt-root h2 { font: 600 clamp(1.35rem, 3vw, 1.7rem)/1.2 Georgia, serif; margin: 0 0 .55rem; }
        .lt-root p { margin: 0; }
        .lt-eyebrow { color: #4b5361; font-size: .85rem; font-weight: 650; letter-spacing: .06em; text-transform: uppercase; }
        .lt-intro { font-size: clamp(1.12rem, 2vw, 1.35rem); max-width: 40rem; }
        .lt-status { margin-top: 1.3rem !important; padding-left: .9rem; border-left: 3px solid #9b6d17; color: #444b55; }
        .lt-sections { border-top: 1px solid #d5d9df; margin-top: 2.5rem; }
        .lt-sections section { border-bottom: 1px solid #d5d9df; padding: 1.5rem 0; }
        .lt-result { padding-left: 1rem !important; border-left: 3px solid #175f9e; }
        .lt-source { margin-top: 2rem; }
        .lt-root a { color: #075ab2; text-underline-offset: .18em; }
        .lt-root a:focus-visible { outline: 3px solid #075ab2; outline-offset: 4px; }
        @media (max-width: 520px) { .lt-root { padding-top: 2rem; } }
      `}</style>
    </DocumentShell>,
  )
}
