import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'

function oneSharedComparator(dossier: MedicineDossierViewModel): string | undefined {
  const comparators = [
    ...new Set(
      dossier.keyOutcomes
        .map((outcome) => outcome.comparator?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ]
  return comparators.length === 1 ? comparators[0] : undefined
}

/**
 * A reviewed, programme-scoped research question. Every value comes from the current published
 * conclusion or its typed outcome fields; the component never synthesizes a new medical claim.
 */
export function DossierResearchQuestion({ dossier }: { dossier: MedicineDossierViewModel }) {
  if (dossier.bindingState !== 'published_programme' || !dossier.conclusion) return null

  const comparator = oneSharedComparator(dossier)
  const facts = [
    ['People covered', dossier.conclusion.scope.population],
    ['Time covered', dossier.conclusion.scope.period],
    ['What researchers measured', dossier.conclusion.scope.outcome],
    ['Studies included', dossier.conclusion.scope.trials],
    ...(comparator ? [['Compared with', comparator]] : []),
  ] as const

  return (
    <section
      aria-labelledby="research-question-heading"
      className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_1px_8px_rgba(0,0,0,0.025)]"
      data-testid="dossier-research-question"
    >
      <div className="px-5 py-5 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6E6E73]">
          Research question
        </p>
        <h3
          id="research-question-heading"
          className="mt-2 max-w-4xl [overflow-wrap:anywhere] text-xl font-semibold leading-8 tracking-[-0.015em] text-[#1D1D1F] sm:text-2xl"
        >
          {dossier.selectedProgrammeLabel}
        </h3>
      </div>

      <dl className="grid gap-px border-t border-black/[0.07] bg-black/[0.07] sm:grid-cols-2 lg:grid-cols-4">
        {facts.map(([label, value]) => (
          <div key={label} className="min-w-0 bg-white px-5 py-4">
            <dt className="text-xs font-semibold leading-5 text-[#6E6E73]">{label}</dt>
            <dd className="mt-1 [overflow-wrap:anywhere] text-sm font-semibold leading-6 text-[#1D1D1F]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
