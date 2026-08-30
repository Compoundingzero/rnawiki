import { ExternalLink } from 'lucide-react'

import {
  buildDossierQuestionRegistry,
  type DossierQuestionAnswerItem,
  type DossierQuestionCoverageState,
} from '@/lib/dossier-question-registry'
import type {
  EvidenceSourceView,
  MedicineDossierViewModel,
  ProgrammeSourceClaimBindingView,
} from '@/lib/medicine-dossier-view-model'

function sourceRelationshipLabel(
  relationship: ProgrammeSourceClaimBindingView['relationship'],
): string {
  if (relationship === 'SUPPORTS') return 'Supports'
  if (relationship === 'QUALIFIES') return 'Qualifies'
  if (relationship === 'CONTEXT') return 'Adds context'
  return 'Contradicts'
}

const coveragePresentation: Record<
  DossierQuestionCoverageState,
  { label: string; className: string }
> = {
  answered: { label: 'Answered', className: 'border-[#B8E7CB] bg-[#EDF8F2] text-[#16764A]' },
  not_yet_documented: {
    label: 'Not yet documented',
    className: 'border-black/[0.1] bg-[#F5F5F7] text-[#515154]',
  },
  not_reported: {
    label: 'Not reported in sources',
    className: 'border-[#F0D89A] bg-[#FFF8E7] text-[#8A4B00]',
  },
  not_applicable: {
    label: 'Not applicable',
    className: 'border-black/[0.1] bg-[#F5F5F7] text-[#515154]',
  },
  awaiting_review: {
    label: 'Awaiting review',
    className: 'border-[#F0D89A] bg-[#FFF8E7] text-[#8A4B00]',
  },
  conflicting: {
    label: 'Sources differ',
    className: 'bg-[#A85B1F]/10 text-[#A85B1F]',
  },
  stale: {
    label: 'Source needs rechecking',
    className: 'bg-[#8A6D1F]/10 text-[#8A6D1F]',
  },
}

function AnswerItem({
  item,
  sources,
}: {
  item: DossierQuestionAnswerItem
  sources: ReadonlyMap<string, EvidenceSourceView>
}) {
  const linkedSources = new Map<
    string,
    { source: EvidenceSourceView; bindings: ProgrammeSourceClaimBindingView[] }
  >()
  for (const binding of item.sourceBindings) {
    const source = sources.get(binding.sourceId)
    if (!source) continue
    const linked = linkedSources.get(source.id) ?? { source, bindings: [] }
    linked.bindings.push(binding)
    linkedSources.set(source.id, linked)
  }

  return (
    <li id={item.id} className="min-w-0 scroll-mt-24 py-4 first:pt-0 last:pb-0">
      <p className="break-words text-base font-semibold leading-6 text-[#1D1D1F]">{item.heading}</p>
      {item.summary && (
        <p className="mt-1 break-words text-base leading-7 text-[#424245]">{item.summary}</p>
      )}
      {item.facts.length > 0 && (
        <dl className="mt-3 grid min-w-0 gap-x-6 gap-y-2 text-sm leading-6 sm:grid-cols-2">
          {item.facts.map((fact) => (
            <div key={`${item.id}-${fact.label}`} className="min-w-0">
              <dt className="text-[#6E6E73]">{fact.label}</dt>
              <dd className="break-words font-semibold text-[#424245]">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {linkedSources.size > 0 && (
        <ol
          className="mt-3 flex min-w-0 flex-wrap gap-x-4 gap-y-1"
          aria-label={`Sources for ${item.heading}`}
        >
          {[...linkedSources.values()].map(({ source, bindings }, index) => (
            <li key={source.id} className="min-w-0 max-w-full text-sm leading-6">
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
                <span className="break-words text-[#6E6E73]">
                  Source {index + 1}: {source.label}
                </span>
              )}
              <ul className="mt-1 space-y-1 text-sm leading-6 text-[#515154]">
                {bindings.map((binding) => (
                  <li key={`${binding.claimId}:${binding.relationship}`} className="break-words">
                    <span className="font-semibold">
                      {sourceRelationshipLabel(binding.relationship)}:
                    </span>{' '}
                    {binding.statement}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </li>
  )
}

/**
 * The fixed question universe over one record. Every question shows either an answer assembled
 * from reviewed fields with their exact source links, or its honest coverage state. Closed answers
 * remain in server-rendered HTML through native details elements; there are no client-generated
 * variants or separate SEO routes.
 */
export function DossierQuestionCoverage({ dossier }: { dossier: MedicineDossierViewModel }) {
  const questions = buildDossierQuestionRegistry(dossier)
  if (questions.length === 0) return null

  const sources = new Map(dossier.sources.map((source) => [source.id, source]))
  const answeredCount = questions.filter((passage) => passage.coverage === 'answered').length

  return (
    <section
      id="questions-this-evidence-can-answer"
      aria-labelledby="questions-this-evidence-can-answer-heading"
      className="border-t border-black/[0.09] py-8 sm:py-10"
      data-testid="dossier-question-coverage"
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#0066CC]">
            The question universe
          </p>
          <h3
            id="questions-this-evidence-can-answer-heading"
            className="text-2xl font-[650] leading-tight tracking-[-0.02em] text-[#1D1D1F] sm:text-[28px]"
          >
            Questions this record can answer
          </h3>
          <p className="max-w-2xl text-base leading-7 text-[#515154]">
            The same fixed questions are asked of every record. A question this record cannot answer
            says so plainly instead of being filled in.
          </p>
        </div>
        <p className="shrink-0 rounded-full border border-black/[0.1] bg-white px-2.5 py-1 font-mono text-xs leading-5 text-[#424245]">
          {answeredCount} of {questions.length} answered
        </p>
      </div>

      <div className="mt-6 divide-y divide-black/[0.08] border-y border-black/[0.08]">
        {questions.map((passage) => {
          const coverage = coveragePresentation[passage.coverage]
          return (
            <details key={passage.id} id={passage.id} className="group/question scroll-mt-24">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="rounded bg-[#F5F5F7] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-[#6E6E73]">
                    {passage.intentLabel}
                  </span>
                  <span className="min-w-0 break-words text-base font-semibold leading-6 text-[#1D1D1F]">
                    {passage.question}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2.5">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-4 ${coverage.className}`}
                  >
                    {coverage.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-xl font-normal text-[#0066CC] transition-transform group-open/question:rotate-45 motion-reduce:transition-none"
                  >
                    +
                  </span>
                </span>
              </summary>
              <div className="pb-5">
                {passage.coverage === 'answered' ? (
                  <>
                    {passage.answerLead && (
                      <p className="max-w-2xl text-base leading-7 text-[#515154]">
                        {passage.answerLead}
                      </p>
                    )}
                    {passage.items.length > 0 && (
                      <ul className="mt-4 divide-y divide-black/[0.07] rounded-2xl bg-[#F5F5F7] p-4 sm:p-5">
                        {passage.items.map((item) => (
                          <AnswerItem key={item.id} item={item} sources={sources} />
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="max-w-2xl text-base leading-7 text-[#515154]">
                    {passage.coverageNote}
                  </p>
                )}
                <p className="mt-3 font-mono text-[11px] leading-5 text-[#6E6E73]">
                  <a
                    href={`#${passage.id}`}
                    className="hover:text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
                  >
                    Link to this question: #{passage.id}
                  </a>
                </p>
              </div>
            </details>
          )
        })}
      </div>
    </section>
  )
}
