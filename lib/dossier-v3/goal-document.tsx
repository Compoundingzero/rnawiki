/**
 * The `/goals/<goal>` document: the pages whose registered studies name conditions in one human
 * goal area, as a plain HTML document (lib/dossier-v3/goal-pages.ts). Every row says what it is:
 * a substance with registered studies in the area. It is not a ranking and not a statement that
 * any of them helps with the goal.
 */
import { DocumentShell } from '@/components/document/DocumentShell'
import { documentResponse } from '@/lib/document/render'
import { googleAnalyticsMeasurementId } from '@/lib/google-analytics'

import type { GoalPageRow } from './goal-pages'
import { goalLabel } from './goals'
import { USER_GOALS, type UserGoal } from './taxonomy'

export function goalDocumentResponse(
  goal: UserGoal,
  rows: GoalPageRow[],
  pagesScanned: number,
): Promise<Response> {
  const label = goalLabel(goal)
  const path: `/${string}` = `/goals/${goal}`
  const index = { pagesScanned }
  return documentResponse(
    <DocumentShell
      analyticsMeasurementId={googleAnalyticsMeasurementId(
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      )}
      canonicalPath={path}
      description={`Substances with registered studies whose conditions fall under ${label.toLowerCase()}. A registration is not evidence of benefit.`}
      jsonLd={null}
      ogType="website"
      robots={{ index: false, follow: true }}
      title={`${label} · registered studies | RNAWiki`}
    >
      <div className="dv3-root">
        <header className="dv3-header">
          <h1>{label}</h1>
          <p className="dv3-header-line">
            {rows.length} {rows.length === 1 ? 'substance has' : 'substances have'} registered
            studies whose conditions fall under this goal, across {index.pagesScanned} loaded
            records.
          </p>
        </header>
        <div className="dv3-body">
          <section className="dv3-section" aria-labelledby="goal-list-h">
            <h2 id="goal-list-h">What this list is</h2>
            <p className="dv3-lede">
              A substance is here because a registered study named a condition in this area. That
              says what was studied, not what was found, and not that the substance helps with the
              goal. Open a record to see whether a reviewed conclusion exists.
            </p>
            <p className="dv3-callout-line">
              RNAWiki has not yet published a reviewed conclusion for any use. Every record below
              says so on its own page.
            </p>
            <nav aria-label="Other goals" className="dv3-goal-options">
              {USER_GOALS.map((entry) => (
                <a
                  aria-current={entry.code === goal ? 'page' : undefined}
                  href={`/goals/${entry.code}`}
                  key={entry.code}
                >
                  {entry.label}
                </a>
              ))}
            </nav>
          </section>
          <section className="dv3-section" aria-labelledby="goal-rows-h">
            <h2 id="goal-rows-h">Records with registered studies in this area</h2>
            {rows.length === 0 ? (
              <p className="dv3-absent">
                No loaded record has a registered study whose condition falls under this goal.
              </p>
            ) : (
              <ul className="dv3-goal-rows">
                {rows.map((row) => (
                  <li key={row.slug}>
                    <a href={`/d/${row.slug}`}>{row.name}</a>
                    <span className="dv3-fine">
                      {' '}
                      · registered study conditions: {row.conditions.slice(0, 4).join('; ')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </DocumentShell>,
  )
}
