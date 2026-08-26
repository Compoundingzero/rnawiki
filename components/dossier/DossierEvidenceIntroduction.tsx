import { FlaskConical, HeartPulse, Sparkles } from 'lucide-react'

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

/** Orientation before the detailed record: one question, one plain explanation, three depth links. */
export function DossierEvidenceIntroduction({ dossier }: { dossier: MedicineDossierViewModel }) {
  const finding = dossier.readerSummary.whatStudiesFound
  const limit = dossier.readerSummary.biggestLimit ?? dossier.mainLimitation
  const hasStudies = dossier.keyOutcomes.length > 0 || dossier.studies.length > 0
  const hasMechanism =
    dossier.mechanismSteps.length > 0 ||
    Boolean(dossier.mechanismSummary.where || dossier.mechanismSummary.change)

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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

        <nav aria-label="Evidence reading depth" className="shrink-0">
          <ul className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-2xl border border-black/[0.08] bg-white p-1 text-xs font-semibold">
            <li>
              <a
                href="#everyday-evidence-explanation"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8]"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Everyday explanation
              </a>
            </li>
            {hasStudies && (
              <li>
                <a
                  href="#study-measurements"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-[#424245] hover:bg-[#F5F5F7] hover:text-[#0A66D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8]"
                >
                  <HeartPulse className="h-3.5 w-3.5" aria-hidden="true" />
                  Clinical view
                </a>
              </li>
            )}
            {hasMechanism && (
              <li>
                <a
                  href="#mechanism-map"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-[#424245] hover:bg-[#F5F5F7] hover:text-[#0A66D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8]"
                >
                  <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                  Biotech &amp; discovery
                </a>
              </li>
            )}
          </ul>
        </nav>
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
