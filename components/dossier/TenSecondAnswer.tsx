import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'

import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import { GENERAL_RESEARCH_SUMMARY_COPY } from '@/lib/public-medicine-language'

export interface TenSecondAnswerProps {
  dossier: MedicineDossierViewModel
  /** True only when every mechanism claim supports the verdict and has a resolved supporting source. */
  mechanismPreviewAllowed?: boolean
  /** Optional exact two-arm visual. The caller may supply it only from a ready, source-bound module. */
  comparison?: ReactNode
}

type MechanismPreviewDossier = Pick<
  MedicineDossierViewModel,
  'bindingState' | 'summaryEvidence' | 'sources'
>

/** Fail closed unless both exact provenance edges support every saved mechanism dependency. */
export function hasResolvedProgrammeMechanismSupport(dossier: MechanismPreviewDossier): boolean {
  if (dossier.bindingState !== 'published_programme') return false
  const evidence = dossier.summaryEvidence?.['summary.plainMechanism']
  if (!evidence) return false
  const claimIds = new Set(evidence.claimIds)
  if (claimIds.size === 0 || claimIds.size !== evidence.claimIds.length) return false
  if (evidence.verdictClaimBindings.some((binding) => !claimIds.has(binding.claimId))) return false

  const resolvedSourceIds = new Set(dossier.sources.map((source) => source.id))
  return evidence.claimIds.every((claimId) => {
    const verdictBindings = evidence.verdictClaimBindings.filter(
      (binding) => binding.claimId === claimId,
    )
    if (verdictBindings.length !== 1 || verdictBindings[0]?.relationship !== 'SUPPORTING') {
      return false
    }

    return evidence.sourceClaimBindings.some(
      (binding) =>
        binding.claimId === claimId &&
        binding.relationship === 'SUPPORTS' &&
        evidence.sourceIds.includes(binding.sourceId) &&
        resolvedSourceIds.has(binding.sourceId),
    )
  })
}

function missingFinding(dossier: MedicineDossierViewModel): string {
  if (dossier.bindingState === 'programme_unpublished') {
    return 'No reviewed plain-language answer has been published for this use.'
  }
  if (dossier.bindingState === 'published_programme') {
    return 'A reviewed answer exists, but a short plain-language study finding is not available yet.'
  }
  if (dossier.readerSummary.exactText) {
    return 'A study result is available, but it still needs a short plain-language explanation.'
  }
  return 'A short plain-language study finding is not available in this general research summary.'
}

function missingLimit(dossier: MedicineDossierViewModel): string {
  if (dossier.bindingState === 'programme_unpublished') {
    return 'The main uncertainty has not been reviewed for this question yet.'
  }
  return 'No main limitation is recorded in the short summary.'
}

function boundary(dossier: MedicineDossierViewModel): string {
  if (dossier.bindingState === 'published_programme') {
    return 'This answer is for this use and group. Other uses can have different answers.'
  }
  if (dossier.bindingState === 'programme_unpublished') {
    return 'RNAWiki has found a specific use and its studies, but reviewers have not published an answer yet.'
  }
  return GENERAL_RESEARCH_SUMMARY_COPY.boundary
}

/** One self-contained first read. Evidence, sources and professional wording belong after it. */
export function TenSecondAnswer({
  dossier,
  mechanismPreviewAllowed = false,
  comparison,
}: TenSecondAnswerProps) {
  const finding = dossier.readerSummary.whatStudiesFound ?? missingFinding(dossier)
  const limit = dossier.readerSummary.biggestLimit ?? missingLimit(dossier)
  const mechanismPreview = dossier.mechanismSummary.where?.trim()
  const mechanismExplanation = dossier.mechanismSummary.change?.trim()

  return (
    <section
      id="what-it-is"
      aria-labelledby="ten-second-answer-heading"
      className="min-w-0 scroll-mt-36 overflow-hidden rounded-3xl border border-[#0A66D8]/20 bg-[#EEF5FF] shadow-[0_2px_12px_rgba(10,102,216,0.045)]"
      data-testid="ten-second-answer"
    >
      <div className="min-w-0 p-6 sm:p-10">
        <h2
          id="ten-second-answer-heading"
          className="text-xs font-bold uppercase leading-5 tracking-[0.12em] text-[#0A66D8]"
        >
          In 10 seconds
        </h2>

        <dl className="mt-5 min-w-0 space-y-5">
          <div className="min-w-0">
            <dt className="text-sm font-semibold leading-5 text-[#424245]">What is it for?</dt>
            <dd className="mt-1 min-w-0">
              <p
                className="max-w-3xl [overflow-wrap:anywhere] text-base font-medium leading-7 text-[#1D1D1F] sm:text-lg"
                data-testid="ten-second-used-for"
              >
                {dossier.readerSummary.usedFor}
              </p>
              {dossier.readerSummary.practicalNote && (
                <p className="mt-2 max-w-3xl [overflow-wrap:anywhere] border-l-2 border-[#0071E3]/25 pl-3 text-sm leading-6 text-[#515154]">
                  <span className="font-semibold text-[#424245]">
                    How it was used in this research:{' '}
                  </span>
                  {dossier.readerSummary.practicalNote}
                </p>
              )}
            </dd>
          </div>

          <div
            id="what-the-evidence-shows"
            className="min-w-0 scroll-mt-36 border-y border-[#0A66D8]/12 py-5"
            data-testid={
              dossier.bindingState === 'published_programme' ? 'main-takeaway-card' : undefined
            }
          >
            <dt className="text-lg font-semibold leading-6 text-[#1D1D1F] sm:text-xl">
              What studies found
            </dt>
            <dd
              className="mt-2 max-w-4xl [overflow-wrap:anywhere] text-lg font-semibold leading-7 tracking-[-0.012em] text-[#1D1D1F] sm:text-xl sm:leading-8"
              data-testid="ten-second-finding"
            >
              {finding}
            </dd>
            {comparison && <dd className="mt-4 min-w-0">{comparison}</dd>}
          </div>

          <div
            id="what-remains-unknown"
            className="min-w-0 scroll-mt-36 rounded-2xl border border-[#F0D89A] bg-[#FFF8E7] px-4 py-4 sm:px-5"
            data-testid="ten-second-limit"
          >
            <dt className="text-sm font-semibold leading-5 text-[#8A5600]">
              <span className="sr-only">Main limit: </span>
              What this result does not show
            </dt>
            <dd className="mt-1.5 max-w-3xl [overflow-wrap:anywhere] text-base font-medium leading-7 text-[#1D1D1F]">
              {limit}
            </dd>
          </div>
        </dl>

        <p className="mt-5 max-w-3xl [overflow-wrap:anywhere] border-t border-[#0A66D8]/12 pt-4 text-sm leading-6 text-[#515154]">
          {boundary(dossier)}
        </p>

        {dossier.readerSummary.criticalSafety && (
          <aside
            aria-labelledby="ten-second-safety-heading"
            className="mt-3 flex min-w-0 items-start gap-3 border-t border-[#0A66D8]/12 pt-4"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
            <div className="min-w-0 text-sm leading-6 text-[#424245]">
              <h3 id="ten-second-safety-heading" className="inline font-semibold text-[#1D1D1F]">
                Safety at a glance:{' '}
              </h3>
              <p className="inline [overflow-wrap:anywhere]">
                {dossier.readerSummary.criticalSafety}
              </p>
            </div>
          </aside>
        )}

        {mechanismPreviewAllowed && mechanismExplanation && (
          <details className="group/mechanism mt-4 border-t border-[#0A66D8]/12 pt-1">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 text-left">
                <span className="block text-sm font-semibold leading-5 text-[#1D1D1F]">
                  How does it work?
                </span>
                {mechanismPreview && (
                  <span className="mt-0.5 block [overflow-wrap:anywhere] text-sm leading-5 text-[#515154]">
                    {mechanismPreview}
                  </span>
                )}
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 text-xl font-normal text-[#0066CC] transition-transform group-open/mechanism:rotate-45 motion-reduce:transition-none"
              >
                +
              </span>
            </summary>
            <p className="max-w-3xl [overflow-wrap:anywhere] pb-3 text-sm leading-6 text-[#424245]">
              {mechanismExplanation}
            </p>
          </details>
        )}
      </div>
    </section>
  )
}
