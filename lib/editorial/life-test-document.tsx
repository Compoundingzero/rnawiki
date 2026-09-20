import { DocumentShell } from '@/components/document/DocumentShell'
import { documentResponse } from '@/lib/document/render'
import { googleAnalyticsMeasurementId } from '@/lib/google-analytics'
import { TwoArmChangeFigure } from '@/components/editorial/TwoArmChangeFigure'

import {
  MAGNESIUM_GLYCINATE_DRAFT as brief,
  MAGNESIUM_SLEEP_CHART,
  MAGNESIUM_SLEEP_STUDY as trial,
  type BriefLine,
  type BriefQuestion,
} from './dossier-briefs'

function Line({ line }: { line: BriefLine }) {
  return (
    <p>
      {line.text}{' '}
      <a aria-label={`Source: ${line.source.label}`} href={line.source.url}>
        [{line.source.marker}]
      </a>
      {line.secondarySource ? (
        <a aria-label={`Source: ${line.secondarySource.label}`} href={line.secondarySource.url}>
          [{line.secondarySource.marker}]
        </a>
      ) : null}
    </p>
  )
}

function Questions({ items }: { items: BriefQuestion[] }) {
  return (
    <dl className="lt-questions">
      {items.map((item) => (
        <div key={item.question}>
          <dt>{item.question}</dt>
          <dd>
            <Line line={item.answer} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

const LIFE_TEST_LINKS = [
  ['#lt-intro', 'The claim'],
  ['#lt-people', 'Who was studied'],
  ['#lt-measure', 'What was measured'],
  ['#lt-result', 'Results in people'],
  ['#lt-unknown', 'What remains unknown'],
  ['#lt-safety', 'Safety and interactions'],
  ['#lt-path', 'Path through the body'],
  ['#lt-deeper', 'Inspect the claim'],
  ['#lt-source', 'Check the source'],
] as const

function LifeTestLinks() {
  return (
    <ol>
      {LIFE_TEST_LINKS.map(([href, label]) => (
        <li key={href}>
          <a href={href}>{label}</a>
        </li>
      ))}
    </ol>
  )
}

/** One public evidence-literacy example, not a treatment verdict. */
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
      robots={{ index: true, follow: true }}
      title="Check a health claim | RNAWiki"
    >
      <article className="lt-root">
        <details className="lt-contents-mobile">
          <summary>Contents</summary>
          <nav aria-label="On this evidence page" data-reader-nav>
            <LifeTestLinks />
          </nav>
        </details>
        <header className="lt-header" id="lt-intro">
          <p className="lt-eyebrow">RNAWiki evidence checkpoint · worked example</p>
          <h1>Does magnesium bisglycinate help with sleep?</h1>
          <p className="lt-intro">
            Claim: “{trial.claim}” A 2025 randomized study tested this form.
          </p>
          <p className="lt-status">
            One study is not a treatment verdict or advice to take a supplement.
          </p>
        </header>

        <nav aria-label="On this evidence page" className="lt-contents-desktop" data-reader-nav>
          <p>On this page</p>
          <LifeTestLinks />
        </nav>

        <div className="lt-sections">
          <section aria-labelledby="lt-people">
            <h2 id="lt-people">Who was studied?</h2>
            <p>
              Researchers split {trial.randomized} generally healthy adults aged {trial.ages} who
              said they slept poorly into two groups by chance. About four in five were women.{' '}
              {trial.primaryAnalysis} were included in the main result; {trial.completed} finished
              the {trial.durationWeeks}-week study.{' '}
              <a href={trial.source.url} aria-label="Source: 2025 magnesium sleep trial">
                [1]
              </a>
            </p>
          </section>

          <section aria-labelledby="lt-measure">
            <h2 id="lt-measure">What did they measure?</h2>
            <p>
              A seven-question sleep-problem score, not hours slept or sleep recorded by a device.
              One group took magnesium bisglycinate; the other took look-alike capsules with no
              magnesium.{' '}
              <a href={trial.source.url} aria-label="Source: 2025 magnesium sleep trial">
                [1]
              </a>
            </p>
          </section>

          <section aria-labelledby="lt-result" className="lt-result">
            <h2 id="lt-result">What happened in people?</h2>
            <TwoArmChangeFigure data={MAGNESIUM_SLEEP_CHART} />
            <p>This group average does not predict what one person will feel.</p>
          </section>

          <section aria-labelledby="lt-unknown">
            <h2 id="lt-unknown">What remains unknown?</h2>
            <p>
              The study did not measure sleep with a device, and its other sleep and daytime
              questionnaires did not show a clear difference between groups. It does not establish
              whether people slept longer or kept any benefit beyond four weeks. It did not test
              whether people could do more of the everyday activities they care about.{' '}
              <a href={trial.source.url} aria-label="Source: 2025 magnesium sleep trial">
                [1]
              </a>
            </p>
            <p className="lt-context">
              A <a href="https://doi.org/10.1080/19390211.2026.2719670">2026 review</a> found mixed
              results in 12 sleep trials of different magnesium forms. Its low- to
              very-low-certainty findings do not establish that bisglycinate is the best form.
            </p>
          </section>

          <section aria-labelledby="lt-safety">
            <h2 id="lt-safety">What matters before considering a product?</h2>
            {brief.safety.map((line) => (
              <Line key={line.text} line={line} />
            ))}
            {brief.interactions.map((line) => (
              <Line key={line.text} line={line} />
            ))}
          </section>

          <section aria-labelledby="lt-path">
            <h2 id="lt-path">The path through the body</h2>
            <p>
              The study measured people’s answers about sleep, not the steps between swallowing a
              capsule and sleeping. The possible biological path is not a proven explanation for
              this result.
            </p>
            <figure className="lt-body-path">
              <figcaption>Follow the evidence, including the gap</figcaption>
              <ol>
                <li>
                  <span className="lt-path-status">Recorded in the trial</span>
                  <strong>Capsule taken</strong>
                  <span>
                    People received magnesium-bisglycinate or look-alike capsules.{' '}
                    <a aria-label="Source: 2025 magnesium sleep trial" href={trial.source.url}>
                      [1]
                    </a>
                  </span>
                </li>
                <li>
                  <span className="lt-path-status">Not measured in this trial</span>
                  <strong>Absorption and brain effects</strong>
                  <span>
                    Magnesium can be absorbed from the gut, but this study did not measure how much
                    participants absorbed or whether brain activity changed.{' '}
                    <a
                      aria-label="Source: NIH magnesium fact sheet"
                      href="https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/"
                    >
                      [2]
                    </a>{' '}
                    <a aria-label="Source: 2025 magnesium sleep trial" href={trial.source.url}>
                      [1]
                    </a>
                  </span>
                </li>
                <li>
                  <span className="lt-path-status">Measured in people</span>
                  <strong>Sleep-problem score</strong>
                  <span>
                    After four weeks, people answered the seven-question insomnia survey. It was not
                    a measurement of sleep time.{' '}
                    <a aria-label="Source: 2025 magnesium sleep trial" href={trial.source.url}>
                      [1]
                    </a>
                  </span>
                </li>
              </ol>
            </figure>
          </section>
        </div>

        <section aria-labelledby="lt-deeper" className="lt-deeper">
          <h2 id="lt-deeper">Inspect the claim more closely</h2>
          <details>
            <summary>What the study words mean in this trial</summary>
            <Questions items={brief.studyWords} />
          </details>
          <details>
            <summary>Why someone might not notice the same change</summary>
            <Questions items={brief.whyItMayFeelDifferent} />
          </details>
          <details>
            <summary>What the study measured—and what a watch cannot confirm</summary>
            <Questions items={brief.measures} />
          </details>
          <details>
            <summary>How the study product compares with a shop bottle</summary>
            <Questions items={brief.suppliedAs} />
            {brief.productChecks.map((line) => (
              <Line key={line.text} line={line} />
            ))}
          </details>
          <details>
            <summary>Who the result may not apply to, and what is still open</summary>
            <div className="lt-population">
              <div>
                <h3>Studied</h3>
                <ul>
                  {brief.populationBoundary.studied.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Excluded</h3>
                <ul>
                  {brief.populationBoundary.notStudied.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p>
              <a href={brief.populationBoundary.source.url}>Study eligibility source</a>
            </p>
            <Questions items={brief.openQuestions} />
          </details>
        </section>

        <footer className="lt-source" id="lt-source">
          <h2>Check the source</h2>
          <p>
            <a href={trial.source.url} rel="noopener noreferrer">
              Read the full 2025 trial by Schuster and colleagues
            </a>
            . Its registered study is{' '}
            <a href={trial.registryUrl} rel="noopener noreferrer">
              DRKS00031494
            </a>
            .
          </p>
        </footer>
      </article>
      <style>{`
        .lt-root { color: #22252b; max-width: 80rem; margin: 0 auto; padding: 2rem 1.3rem 3rem; font: 1.075rem/1.58 system-ui, sans-serif; display: grid; grid-template-columns: 12.5rem minmax(0, 48rem); column-gap: 3rem; justify-content: center; align-items: start; overflow-wrap: anywhere; }
        .lt-root > *, .lt-root section, .lt-root figure, .lt-root details { min-width: 0; }
        .lt-header { grid-column: 2; }
        .lt-contents-desktop { grid-column: 1; grid-row: 2 / span 3; align-self: start; position: sticky; top: 5.5rem; max-height: calc(100dvh - 6rem); overflow-y: auto; border-right: 1px solid #d5d9df; padding-right: .7rem; }
        .lt-contents-desktop p { color: #4b5361; font-size: .9rem; font-weight: 700; }
        .lt-contents-desktop ol, .lt-contents-mobile ol { list-style: none; margin: .3rem 0 0; padding: 0; }
        .lt-contents-desktop a, .lt-contents-mobile a { display: block; min-height: 2.75rem; padding: .5rem .4rem; text-decoration: none; }
        .lt-contents-desktop a[aria-current='location'], .lt-contents-mobile a[aria-current='location'] { border-left: 3px solid currentColor; font-weight: 700; padding-left: .65rem; }
        .lt-contents-mobile { display: none; }
        .lt-sections { grid-column: 2; grid-row: 2; }
        .lt-deeper { grid-column: 2; grid-row: 3; }
        .lt-source { grid-column: 2; grid-row: 4; }
        .lt-root h1, .lt-root h2 { text-wrap: balance; overflow-wrap: anywhere; }
        .lt-root h1 { max-width: 19ch; font: 600 clamp(2.25rem, 5vw, 3.35rem)/1.1 Georgia, serif; margin: .5rem 0 1rem; }
        .lt-root h2 { font: 600 clamp(1.35rem, 3vw, 1.7rem)/1.2 Georgia, serif; margin: 0 0 .55rem; }
        .lt-root p { margin: 0; }
        .lt-eyebrow { color: #4b5361; font-size: .85rem; font-weight: 650; letter-spacing: .06em; text-transform: uppercase; }
        .lt-intro { font-size: clamp(1.12rem, 2vw, 1.35rem); max-width: 40rem; }
        .lt-status { margin-top: 1rem !important; padding-left: .9rem; border-left: 3px solid #9b6d17; color: #444b55; }
        .lt-sections { border-top: 1px solid #d5d9df; margin-top: 1.6rem; }
        .lt-sections section { border-bottom: 1px solid #d5d9df; padding: 1.1rem 0; }
        .lt-root [id^='lt-'] { scroll-margin-top: 5.5rem; }
        .lt-context { margin-top: .8rem !important; }
        .lt-result { padding-left: 1rem !important; border-left: 3px solid #175f9e; }
        .lt-body-path { margin: 1rem 0 0; }
        .lt-body-path figcaption { font-weight: 700; margin-bottom: .65rem; }
        .lt-body-path ol { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .6rem; list-style: none; padding: 0; margin: 0; }
        .lt-body-path li { border: 1px solid #d5d9df; border-radius: .5rem; display: flex; flex-direction: column; gap: .45rem; min-width: 0; padding: .85rem; }
        .lt-body-path li:nth-child(2) { border-style: dashed; }
        .lt-body-path strong { line-height: 1.3; }
        .lt-path-status { color: #4b5361; font-size: .87rem; font-weight: 700; }
        .lt-source { margin-top: 1.4rem; }
        .lt-deeper { margin-top: 1.5rem; }
        .lt-deeper > details { border-top: 1px solid #d5d9df; }
        .lt-deeper > details:last-child { border-bottom: 1px solid #d5d9df; }
        .lt-deeper summary { cursor: pointer; font-weight: 650; min-height: 2.75rem; padding: .7rem .15rem; }
        .lt-deeper summary:focus-visible { outline: 3px solid #075ab2; outline-offset: 3px; }
        .lt-questions { margin: .2rem 0 .8rem; }
        .lt-questions > div { padding: .65rem 0; border-top: 1px solid #e4e7eb; }
        .lt-questions dt { font-weight: 650; }
        .lt-questions dd { margin: .2rem 0 0; }
        .lt-population { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
        .lt-population h3 { font-size: 1rem; margin: .2rem 0; }
        .lt-population ul { margin: .2rem 0; padding-left: 1.2rem; }
        .lt-root a { color: #075ab2; text-decoration: underline; text-underline-offset: .18em; }
        .lt-root a:focus-visible { outline: 3px solid #075ab2; outline-offset: 4px; }
        @media (max-width: 56rem) {
          .lt-root { display: block; width: 100%; max-width: 48rem; padding-top: .5rem; }
          .lt-contents-desktop { display: none; }
          .lt-contents-mobile { display: block; position: static; top: 3.65rem; z-index: 30; background: #fff; border: 1px solid #d5d9df; border-radius: .6rem; margin: 0 0 1.15rem; }
          html.reader-nav-enhanced .lt-contents-mobile { position: sticky; }
          .lt-contents-mobile summary { cursor: pointer; font-weight: 700; min-height: 2.75rem; padding: .65rem .85rem; }
          .lt-contents-mobile summary:focus-visible { outline: 3px solid #075ab2; outline-offset: 3px; }
          .lt-contents-mobile nav { border-top: 1px solid #d5d9df; max-height: min(50dvh, 25rem); overflow-y: auto; padding: .2rem .5rem .5rem; }
          .lt-root [id^='lt-'] { scroll-margin-top: 9rem; }
          .lt-body-path ol { grid-template-columns: minmax(0, 1fr); }
        }
        @media (min-width: 40rem) and (max-width: 56rem) { .lt-contents-mobile { top: 4.15rem; } }
        @media (max-height: 36rem) { html.reader-nav-enhanced .lt-contents-mobile { position: static; } }
        @media (max-width: 520px) { .lt-root { padding-top: 2rem; } .lt-population { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
    </DocumentShell>,
  )
}
