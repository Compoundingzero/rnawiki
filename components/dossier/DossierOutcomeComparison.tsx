import { ExternalLink } from 'lucide-react'

import type { DossierDynamicModulesView } from '@/lib/dossier-dynamic-modules'
import type { EvidenceSourceView } from '@/lib/medicine-dossier-view-model'

function exactValue(value: string, unit: string): string {
  return /^[%°]/u.test(unit) ? `${value}${unit}` : `${value} ${unit}`
}

function barWidth(value: string, largestMagnitude: number): string {
  if (largestMagnitude === 0) return '0%'
  return `${Math.min(100, (Math.abs(Number(value)) / largestMagnitude) * 100)}%`
}

export function DossierOutcomeComparison({
  module,
  sources,
}: {
  module?: DossierDynamicModulesView['outcomeComparison']
  sources: ReadonlyMap<string, EvidenceSourceView>
}) {
  if (module?.status !== 'ready') return null

  const comparison = module.data
  const largestMagnitude = Math.max(
    Math.abs(Number(comparison.intervention.value)),
    Math.abs(Number(comparison.comparator.value)),
  )
  const linkedSources = comparison.sourceIds.flatMap((sourceId) => {
    const source = sources.get(sourceId)
    const bindings = comparison.sourceClaimBindings.filter(
      (binding) => binding.sourceId === sourceId && binding.relationship === 'SUPPORTS',
    )
    return source && bindings.length > 0 ? [{ source, bindings }] : []
  })

  return (
    <figure
      className="min-w-0 rounded-2xl border border-black/[0.08] bg-white p-4 sm:p-5"
      data-testid="dossier-outcome-comparison"
    >
      <figcaption className="min-w-0">
        <span className="block text-sm font-semibold leading-5 text-[#6E6E73]">
          Recorded comparison at {comparison.timepoint}
        </span>
        <span className="mt-1 block [overflow-wrap:anywhere] text-base font-semibold leading-6 text-[#1D1D1F]">
          {comparison.endpoint}
        </span>
        {comparison.population && (
          <span className="mt-1 block [overflow-wrap:anywhere] text-sm leading-5 text-[#6E6E73]">
            People studied: {comparison.population}
          </span>
        )}
      </figcaption>

      <dl className="mt-4 space-y-4">
        {[
          { ...comparison.intervention, key: 'intervention', barClassName: 'bg-[#0A66D6]' },
          { ...comparison.comparator, key: 'comparator', barClassName: 'bg-[#A8A8AD]' },
        ].map((arm) => (
          <div key={arm.key} className="min-w-0">
            <div className="flex min-w-0 items-baseline justify-between gap-4 text-sm leading-5">
              <dt className="min-w-0 [overflow-wrap:anywhere] font-semibold text-[#424245]">
                {arm.label}
              </dt>
              <dd className="shrink-0 font-mono font-semibold tabular-nums text-[#1D1D1F]">
                {exactValue(arm.value, arm.unit)}
              </dd>
            </div>
            <div
              aria-hidden="true"
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/[0.05]"
            >
              <div
                className={`h-full rounded-full ${arm.barClassName}`}
                style={{ width: barWidth(arm.value, largestMagnitude) }}
              />
            </div>
          </div>
        ))}
      </dl>

      <p className="mt-4 border-t border-black/[0.07] pt-3 text-xs leading-5 text-[#6E6E73]">
        Both values share the unit recorded on one measured, source-linked claim. Bar lengths
        compare their absolute size; use the signed numbers for the exact result.
      </p>

      {linkedSources.length > 0 && (
        <details className="mt-2">
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
            Exact sources for this comparison
          </summary>
          <ol className="space-y-3 border-t border-black/[0.07] pt-3">
            {linkedSources.map(({ source, bindings }, index) => (
              <li key={source.id} className="min-w-0 text-sm leading-6 text-[#515154]">
                {source.href ? (
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 max-w-full items-center gap-1 [overflow-wrap:anywhere] font-semibold text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
                  >
                    Source {index + 1}: {source.label}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <p className="[overflow-wrap:anywhere] font-semibold text-[#424245]">
                    Source {index + 1}: {source.label}
                  </p>
                )}
                {bindings.map((binding) => (
                  <p
                    key={`${binding.sourceId}:${binding.claimId}`}
                    className="mt-1 [overflow-wrap:anywhere]"
                  >
                    {binding.statement}
                  </p>
                ))}
              </li>
            ))}
          </ol>
        </details>
      )}
    </figure>
  )
}
