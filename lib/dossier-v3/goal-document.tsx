/** A goal is only a useful path when its source-backed index has actual rows. */
import { DocumentShell } from '@/components/document/DocumentShell'
import { documentResponse } from '@/lib/document/render'
import { googleAnalyticsMeasurementId } from '@/lib/google-analytics'

import type { GoalPageRow } from './goal-pages'
import { goalLabel } from './goals'
import type { UserGoal } from './taxonomy'

export function goalDocumentResponse(
  goal: UserGoal,
  rows: GoalPageRow[],
  _pagesScanned: number,
): Promise<Response> {
  const label = goalLabel(goal)
  const path: `/${string}` = `/goals/${goal}`
  return documentResponse(
    <DocumentShell
      analyticsMeasurementId={googleAnalyticsMeasurementId(
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      )}
      canonicalPath={path}
      description={`Explore the recorded study conditions related to ${label.toLowerCase()}. A study registration is not a result or recommendation.`}
      jsonLd={null}
      ogType="website"
      robots={{ index: false, follow: true }}
      title={`${label} | RNAWiki`}
    >
      <article className="goal-reader">
        <p className="goal-reader-kicker">Explore a goal</p>
        <h1>{label}</h1>
        {rows.length === 0 ? (
          <>
            <p className="goal-reader-lead">
              RNAWiki does not have a source-checked medicine list for this goal yet.
            </p>
            <p>
              Search for a specific medicine or supplement above to see its identity, what people
              use it for, and what evidence is actually recorded. An empty index is not evidence
              that nothing has been studied.
            </p>
            <p>
              <a href="/">Return to medicine search</a>
            </p>
          </>
        ) : (
          <>
            <p className="goal-reader-lead">
              These records have registered studies naming conditions in this area. This is not a
              list of treatments that work.
            </p>
            <ul className="goal-reader-list">
              {rows.map((row) => (
                <li key={row.slug}>
                  <a href={`/d/${row.slug}`}>{row.name}</a>
                  <span>Study condition: {row.conditions.slice(0, 2).join('; ')}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </article>
      <style>{`
        .goal-reader { color:#232327; max-width:48rem; margin:0 auto; padding:3rem 1.2rem 5rem; font:1.05rem/1.6 system-ui,sans-serif; }
        .goal-reader-kicker { color:#55555a; font-size:.84rem; letter-spacing:.07em; text-transform:uppercase; }
        .goal-reader h1 { font:600 clamp(2.2rem,6vw,3.6rem)/1.1 Georgia,serif; margin:.25rem 0 1.25rem; text-wrap:balance; }
        .goal-reader p { max-width:43rem; margin:0 0 1.2rem; }
        .goal-reader-lead { font-size:clamp(1.15rem,2vw,1.4rem); }
        .goal-reader a { color:#075ab2; text-underline-offset:.18em; }
        .goal-reader a:focus-visible { outline:2px solid #075ab2; outline-offset:3px; }
        .goal-reader-list { list-style:none; margin:2rem 0 0; padding:0; }
        .goal-reader-list li { border-top:1px solid #d8d8df; padding:1rem 0; }
        .goal-reader-list a { display:block; font-weight:600; }
        .goal-reader-list span { display:block; color:#55555a; font-size:.88rem; }
      `}</style>
    </DocumentShell>,
  )
}
