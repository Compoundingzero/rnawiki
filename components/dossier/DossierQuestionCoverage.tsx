import { ExternalLink } from 'lucide-react'

import {
  buildDossierQuestionRegistry,
  type DossierQuestionAnswerItem,
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
    <li className="min-w-0 py-4 first:pt-0 last:pb-0">
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
    </li>
  )
}

/**
 * A small, controlled set of source-bound questions. Closed answers remain in server-rendered HTML
 * through native details elements; there are no client-generated variants or separate SEO routes.
 */
export function DossierQuestionCoverage({ dossier }: { dossier: MedicineDossierViewModel }) {
  const questions = buildDossierQuestionRegistry(dossier)
  if (questions.length === 0) return null

  const sources = new Map(dossier.sources.map((source) => [source.id, source]))

  return (
    <section
      id="questions-this-evidence-can-answer"
      aria-labelledby="questions-this-evidence-can-answer-heading"
      className="border-t border-black/[0.09] py-8 sm:py-10"
      data-testid="dossier-question-coverage"
    >
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#0066CC]">
          Explore the reviewed answer
        </p>
        <h4
          id="questions-this-evidence-can-answer-heading"
          className="mt-2 text-xl font-bold tracking-tight text-[#1D1D1F] sm:text-2xl"
        >
          Questions this evidence can answer
        </h4>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#515154]">
          Only questions with reviewed information and an exact source link appear here. Missing
          information is not filled in.
        </p>
      </div>

      <div className="mt-6 divide-y divide-black/[0.08] border-y border-black/[0.08]">
        {questions.map((passage) => (
          <details key={passage.id} id={passage.id} className="group/question scroll-mt-24">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-semibold leading-6 text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              <span>{passage.question}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-xl font-normal text-[#0066CC] transition-transform group-open/question:rotate-45 motion-reduce:transition-none"
              >
                +
              </span>
            </summary>
            <div className="pb-5">
              <p className="max-w-2xl text-base leading-7 text-[#515154]">{passage.answerLead}</p>
              <ul className="mt-4 divide-y divide-black/[0.07] rounded-2xl bg-[#F5F5F7] p-4 sm:p-5">
                {passage.items.map((item) => (
                  <AnswerItem key={item.id} item={item} sources={sources} />
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
