import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AppShell } from '@/components/AppShell'
import { canViewCompletionReview } from '@/lib/completion-review-policy'
import { loadDossierV3Quality } from '@/lib/queries/dossier-v3-quality'
import { pageRobotsMetadata } from '@/lib/seo/deployment'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dossier v3 data quality',
  robots: pageRobotsMetadata({ index: false, follow: false }),
}

/**
 * The data-quality dashboard for the dossier v3 backfill: how far trial-role classification,
 * field states, the corrections ledger, reviewed claims and the graph projection have got, as
 * counts a steward can check against the tables. Private, like the completion review.
 */
export default async function DossierV3QualityPage() {
  const user = await getCurrentUser()
  if (!user || !canViewCompletionReview(user)) notFound()
  const quality = await loadDossierV3Quality()

  const rows: Array<[string, string, string]> = [
    ['Corpus pages loaded', String(quality.corpusPages), 'corpus_pages'],
    ['Indexable pages', String(quality.indexablePages), 'corpus_pages.indexable'],
    [
      'Pages with a role-aware registry aggregate',
      `${quality.pagesWithRoleAggregate} of ${quality.corpusPages}`,
      'page_registry_role_aggregates',
    ],
    ['Trial-role rows', String(quality.trialRoleRows), 'page_trial_roles'],
    [
      'Roles matched through a synonym',
      String(quality.synonymMatchedRoles),
      'page_trial_roles.synonym_matched',
    ],
    [
      'Roles whose completion is planned, not elapsed',
      String(quality.plannedCompletionRows),
      'page_trial_roles.completion_is_planned',
    ],
    ['Corrections recorded', String(quality.corrections), 'entity_corrections (append-only)'],
    ['Reviewed-claim rows (all states)', String(quality.reviewedClaims), 'reviewed_claims'],
    [
      'Pages with no field state at all',
      `${quality.pagesMissingFieldStates} of ${quality.corpusPages}`,
      'dossier_field_states',
    ],
    ['Predicted edges awaiting review', String(quality.predictedEdges), 'predicted_edges'],
  ]

  return (
    <AppShell initialUser={user}>
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--corpus-serif)' }}>
            Dossier v3 data quality
          </h1>
          <p className="text-sm" style={{ color: 'var(--corpus-ink-2)' }}>
            Counts from the rebuild tables. A page renders in the v3 surface only behind the
            allowlist; a page passes the index-quality gate only when every required field is in a
            terminal state. See{' '}
            <Link href="/review-queue/completion" className="underline">
              completion and identity review
            </Link>{' '}
            for the legacy resolver.
          </p>
        </header>

        <section aria-labelledby="dv3q-counts">
          <h2 id="dv3q-counts" className="text-lg font-semibold">
            Counts
          </h2>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: 'var(--corpus-ink-2)' }}>
                <th scope="col" className="py-1 pr-3">
                  Measure
                </th>
                <th scope="col" className="py-1 pr-3">
                  Value
                </th>
                <th scope="col" className="py-1">
                  Table
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, value, table]) => (
                <tr
                  key={label}
                  className="border-t"
                  style={{ borderColor: 'var(--corpus-hairline)' }}
                >
                  <td className="py-1 pr-3">{label}</td>
                  <td className="py-1 pr-3 tabular-nums">{value}</td>
                  <td className="py-1 font-mono text-xs">{table}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section aria-labelledby="dv3q-roles" className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 id="dv3q-roles" className="text-lg font-semibold">
              Trial roles by kind
            </h2>
            <ul className="mt-2 text-sm">
              {quality.rolesByKind.length === 0 ? <li>No roles classified yet.</li> : null}
              {quality.rolesByKind.map((row) => (
                <li
                  key={row.role}
                  className="flex justify-between border-t py-1"
                  style={{ borderColor: 'var(--corpus-hairline)' }}
                >
                  <span>{row.role.replace(/_/g, ' ')}</span>
                  <span className="tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Corrections by action</h2>
            <ul className="mt-2 text-sm">
              {quality.correctionsByAction.length === 0 ? (
                <li>No corrections recorded yet.</li>
              ) : null}
              {quality.correctionsByAction.map((row) => (
                <li
                  key={row.action}
                  className="flex justify-between border-t py-1"
                  style={{ borderColor: 'var(--corpus-hairline)' }}
                >
                  <span>{row.action.replace(/_/g, ' ')}</span>
                  <span className="tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Claims by reviewer state</h2>
            <ul className="mt-2 text-sm">
              {quality.claimsByState.length === 0 ? (
                <li>No claims exist. Every Decision Card renders its absence states.</li>
              ) : null}
              {quality.claimsByState.map((row) => (
                <li
                  key={row.state}
                  className="flex justify-between border-t py-1"
                  style={{ borderColor: 'var(--corpus-hairline)' }}
                >
                  <span>{row.state.replace(/_/g, ' ')}</span>
                  <span className="tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Field states</h2>
            <ul className="mt-2 text-sm">
              {quality.fieldStates.length === 0 ? (
                <li>No stored field states yet; the view model resolves states at request time.</li>
              ) : null}
              {quality.fieldStates.map((row) => (
                <li
                  key={row.state}
                  className="flex justify-between border-t py-1"
                  style={{ borderColor: 'var(--corpus-hairline)' }}
                >
                  <span>{row.state.replace(/_/g, ' ')}</span>
                  <span className="tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="dv3q-graph">
          <h2 id="dv3q-graph" className="text-lg font-semibold">
            Graph versions
          </h2>
          {quality.graphVersions.length === 0 ? (
            <p className="mt-2 text-sm">No graph version projected yet.</p>
          ) : (
            <ul className="mt-2 text-sm">
              {quality.graphVersions.map((version) => (
                <li
                  key={version.id}
                  className="border-t py-1"
                  style={{ borderColor: 'var(--corpus-hairline)' }}
                >
                  <span className="font-mono text-xs">{version.id.slice(0, 12)}</span> ·{' '}
                  {version.nodes} nodes · {version.edges} edges · identity gate{' '}
                  {version.identityGate ? 'passed' : 'closed'} ·{' '}
                  {version.createdAt.toISOString().slice(0, 10)}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-sm" style={{ color: 'var(--corpus-ink-2)' }}>
            While the identity gate is closed no model may train on the graph
            (docs/gnn-model-card.md).
          </p>
        </section>
      </div>
    </AppShell>
  )
}
