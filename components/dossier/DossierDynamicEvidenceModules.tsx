import { ExternalLink } from 'lucide-react'

import type {
  DossierClaimSourceBindingView,
  DossierDynamicModulesView,
  DossierFailureSourceBindingView,
} from '@/lib/dossier-dynamic-modules'
import type { ClaimNature } from '@/lib/evidence/types'
import type { EvidenceSourceView } from '@/lib/medicine-dossier-view-model'

type ModuleBindings = readonly (DossierClaimSourceBindingView | DossierFailureSourceBindingView)[]

const claimNaturePresentation: Record<ClaimNature, { label: string; className: string }> = {
  MEASURED: {
    label: 'Measured in a study',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  },
  SPONSOR_REPORTED: {
    label: 'Reported by the study sponsor',
    className: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  REGULATORY_FINDING: {
    label: 'Finding from a medicine regulator',
    className: 'border-blue-200 bg-blue-50 text-blue-900',
  },
  RNAWIKI_JUDGEMENT: {
    label: 'RNAWiki reviewer interpretation',
    className: 'border-black/[0.1] bg-[#F5F5F7] text-[#424245]',
  },
  UNKNOWN: {
    label: 'Evidence type not recorded',
    className: 'border-black/[0.1] bg-white text-[#6E6E73]',
  },
}

function relationshipLabel(relationship: DossierClaimSourceBindingView['relationship']) {
  if (relationship === 'SUPPORTS') return 'Supports'
  if (relationship === 'CONTEXT') return 'Adds context'
  return 'Contradicts'
}

function isFailureBinding(
  binding: DossierClaimSourceBindingView | DossierFailureSourceBindingView,
): binding is DossierFailureSourceBindingView {
  return 'verdictRelationship' in binding
}

function verdictRelationshipLabel(
  relationship: DossierFailureSourceBindingView['verdictRelationship'],
) {
  return relationship === 'SUPPORTING'
    ? 'Supports the reviewed conclusion'
    : 'Challenges the reviewed conclusion'
}

function ModuleSources({
  bindings,
  disclosureLabel = 'Exact sources for this finding',
  sourceIds,
  sources,
}: {
  bindings: ModuleBindings
  disclosureLabel?: string
  sourceIds: readonly string[]
  sources: ReadonlyMap<string, EvidenceSourceView>
}) {
  const linked = sourceIds.flatMap((sourceId) => {
    const source = sources.get(sourceId)
    const sourceBindings = bindings.filter((binding) => binding.sourceId === sourceId)
    return source && sourceBindings.length > 0 ? [{ source, bindings: sourceBindings }] : []
  })
  if (linked.length === 0) return null

  return (
    <details className="mt-3">
      <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
        {disclosureLabel}
      </summary>
      <ol className="space-y-3 border-t border-black/[0.07] pt-3">
        {linked.map(({ source, bindings: sourceBindings }, index) => (
          <li key={source.id} className="min-w-0 text-sm leading-6 text-[#515154]">
            {source.href ? (
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 max-w-full items-center gap-1 break-words font-semibold text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
              >
                Source {index + 1}: {source.label}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <p className="break-words font-semibold text-[#424245]">
                Source {index + 1}: {source.label}
              </p>
            )}
            <ul className="mt-1 space-y-1">
              {sourceBindings.map((binding) => (
                <li
                  key={`${binding.claimId}:${binding.relationship}:${isFailureBinding(binding) ? binding.verdictRelationship : 'claim-only'}`}
                  className="break-words"
                >
                  {isFailureBinding(binding) && (
                    <p>
                      <span className="font-semibold">Role in the reviewed conclusion:</span>{' '}
                      {verdictRelationshipLabel(binding.verdictRelationship)}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">Source relationship to this claim:</span>{' '}
                    {relationshipLabel(binding.relationship)}
                  </p>
                  <p>{binding.statement}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </details>
  )
}

function FactList({ facts }: { facts: Array<[string, string | undefined]> }) {
  const present = facts.filter((fact): fact is [string, string] => Boolean(fact[1]))
  if (present.length === 0) return null

  return (
    <dl className="mt-3 grid min-w-0 gap-x-6 gap-y-2 text-sm leading-6 sm:grid-cols-2">
      {present.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-[#6E6E73]">{label}</dt>
          <dd className="break-words font-semibold text-[#424245]">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function DossierProgrammeFailure({
  module,
  sources,
}: {
  module?: DossierDynamicModulesView['programmeFailure']
  sources: ReadonlyMap<string, EvidenceSourceView>
}) {
  if (module?.status !== 'ready') return null
  const failure = module.data

  return (
    <section
      aria-labelledby="programme-failure-heading"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6"
      data-testid="programme-failure-classification"
    >
      <p className="text-sm font-semibold leading-5 text-amber-900">Stopped research</p>
      <h4 id="programme-failure-heading" className="mt-1 text-xl font-bold text-[#1D1D1F]">
        Why did this research stop?
      </h4>
      <p className="mt-3 break-words text-lg font-semibold leading-7 text-[#1D1D1F]">
        {failure.readerLabel}
      </p>
      <p className="mt-2 max-w-3xl break-words text-base leading-7 text-[#424245]">
        {failure.reason}
      </p>
      <details className="mt-3">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
          Professional classification and sources
        </summary>
        <p className="break-words text-sm leading-6 text-[#515154]">{failure.professionalLabel}</p>
        {failure.stoppingReasonCategory && (
          <p className="mt-1 break-words text-sm leading-6 text-[#515154]">
            Recorded stopping category: {failure.stoppingReasonCategory.replaceAll('_', ' ')}
          </p>
        )}
        <ModuleSources
          bindings={failure.sourceClaimBindings}
          disclosureLabel="Exact sources for and against this conclusion"
          sourceIds={failure.sourceIds}
          sources={sources}
        />
      </details>
    </section>
  )
}

export function DossierSafetyEvidence({
  module,
  sources,
}: {
  module?: DossierDynamicModulesView['safety']
  sources: ReadonlyMap<string, EvidenceSourceView>
}) {
  if (module?.status !== 'ready') return null

  return (
    <section
      id="selected-programme-safety"
      aria-labelledby="selected-programme-safety-heading"
      className="space-y-4"
      data-testid="selected-programme-safety"
    >
      <header className="max-w-3xl space-y-1">
        <p className="text-sm font-semibold leading-5 text-[#0066CC]">
          Safety in the selected studies
        </p>
        <h4 id="selected-programme-safety-heading" className="text-xl font-bold text-[#1D1D1F]">
          What safety findings were recorded?
        </h4>
        <p className="text-sm leading-6 text-[#6E6E73]">
          This is not a complete safety guide. It shows only reviewed safety findings with an exact
          supporting source for this use.
        </p>
      </header>
      <ul className="space-y-3">
        {module.data.findings.map((finding) => (
          <li key={finding.id} className="min-w-0">
            <details className="group/safety overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
              <summary className="flex min-h-14 cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071E3] sm:px-5 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold leading-5 ${claimNaturePresentation[finding.claimNature].className}`}
                  >
                    {claimNaturePresentation[finding.claimNature].label}
                  </span>
                  <span className="mt-2 block [overflow-wrap:anywhere] text-base font-semibold leading-7 text-[#1D1D1F]">
                    {finding.statement}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-xl font-normal text-[#0066CC] transition-transform group-open/safety:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </summary>
              <div className="border-t border-black/[0.07] px-4 pb-4 sm:px-5">
                <FactList
                  facts={[
                    ['What was measured', finding.endpoint],
                    ['Exact result', finding.exactResult],
                    ['Compared with', finding.comparator],
                    ['People studied', finding.population],
                    ['When measured', finding.timepoint],
                    ['Uncertainty', finding.uncertaintyInterval],
                  ]}
                />
                <ModuleSources
                  bindings={finding.sourceClaimBindings}
                  sourceIds={finding.sourceIds}
                  sources={sources}
                />
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function DossierPharmacokinetics({
  module,
  sources,
}: {
  module?: DossierDynamicModulesView['pharmacokinetics']
  sources: ReadonlyMap<string, EvidenceSourceView>
}) {
  if (module?.status !== 'ready') return null

  return (
    <section
      id="pharmacokinetics"
      aria-labelledby="pharmacokinetics-heading"
      className="space-y-4"
      data-testid="pharmacokinetics-findings"
    >
      <header className="max-w-3xl space-y-1">
        <p className="text-sm font-semibold leading-5 text-[#0066CC]">Movement through the body</p>
        <h4 id="pharmacokinetics-heading" className="text-xl font-bold text-[#1D1D1F]">
          What happened after it was given?
        </h4>
        <p className="text-sm leading-6 text-[#6E6E73]">
          These are separate findings, not a timeline. Time labels are shown as recorded, so the
          cards are not arranged from earliest to latest.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {module.data.findings.map((finding) => (
          <li
            key={finding.id}
            className="min-w-0 rounded-2xl border border-black/[0.08] bg-white p-4 sm:p-5"
          >
            <p className="text-sm font-semibold leading-5 text-[#0066CC]">{finding.timepoint}</p>
            <p className="mt-1 break-words text-base font-semibold leading-7 text-[#1D1D1F]">
              {finding.statement}
            </p>
            <FactList
              facts={[
                ['What was measured', finding.endpoint],
                ['Exact result', finding.exactResult],
                ['People studied', finding.population],
                ['Uncertainty', finding.uncertaintyInterval],
              ]}
            />
            <ModuleSources
              bindings={finding.sourceClaimBindings}
              sourceIds={finding.sourceIds}
              sources={sources}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
