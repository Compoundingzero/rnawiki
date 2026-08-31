import { Sparkles } from 'lucide-react'

import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'

function evidenceHeading(dossier: MedicineDossierViewModel): string {
  if (
    dossier.bindingState === 'published_programme' &&
    /(?:stopped|terminated|discontinued|withdrawn)/iu.test(dossier.selectedProgrammeStatus)
  ) {
    return 'What the studies and sources showed before the research stopped'
  }
  if (dossier.bindingState === 'published_programme') return 'The question being answered'
  if (dossier.bindingState === 'programme_unpublished')
    return 'The question researchers are studying'
  return 'What this research summary covers'
}

function plainCardLabel(dossier: MedicineDossierViewModel): string {
  return dossier.bindingState === 'published_programme'
    ? 'Everyday explanation of the reviewed answer'
    : 'Everyday explanation'
}

/** Orientation before the detailed record: one question and one plain explanation. */
export function DossierEvidenceIntroduction({ dossier }: { dossier: MedicineDossierViewModel }) {
  const finding = dossier.readerSummary.whatStudiesFound
  const limit = dossier.readerSummary.biggestLimit ?? dossier.mainLimitation

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <header className="max-w-2xl space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0A66D8]">
            Behind the answer
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-[#1D1D1F] sm:text-4xl">
            {evidenceHeading(dossier)}
          </h2>
          <p className="text-base leading-7 text-[#6E6E73]">
            Start with the result. Open the study design, exact numbers, and sources only when you
            need them.
          </p>
        </header>
      </div>

      <section
        id="everyday-evidence-explanation"
        aria-labelledby="everyday-evidence-heading"
        className="scroll-mt-28 rounded-2xl border border-emerald-200 bg-[#EDF8F2] p-5 sm:p-6"
      >
        <h3
          id="everyday-evidence-heading"
          className="flex items-center gap-2 text-sm font-semibold text-emerald-950"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {plainCardLabel(dossier)}
        </h3>
        <p className="mt-3 max-w-4xl text-base leading-7 text-emerald-950">
          {dossier.readerSummary.usedFor}
        </p>
        {(finding || limit) && (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {finding && (
              <div className="rounded-xl border border-emerald-200 bg-white/70 p-4">
                <dt className="text-xs font-bold uppercase tracking-wide text-emerald-900">
                  What this supports
                </dt>
                <dd className="mt-1 text-sm leading-6 text-emerald-950">{finding}</dd>
              </div>
            )}
            {limit && (
              <div className="rounded-xl border border-emerald-200 bg-white/70 p-4">
                <dt className="text-xs font-bold uppercase tracking-wide text-emerald-900">
                  What this does not prove
                </dt>
                <dd className="mt-1 text-sm leading-6 text-emerald-950">{limit}</dd>
              </div>
            )}
          </dl>
        )}
      </section>
    </div>
  )
}
