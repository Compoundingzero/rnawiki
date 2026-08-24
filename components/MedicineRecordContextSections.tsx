import { CheckCircle2, CircleHelp, ExternalLink } from 'lucide-react'

import { AnnotatedMedicineText } from '@/components/AnnotatedMedicineText'
import { medicineTextContextMatches } from '@/lib/annotated-medicine-text'
import type {
  DossierBindingState,
  MedicineRecordContextView,
  MedicineRecordSourceView,
} from '@/lib/medicine-dossier-view-model'
import { GENERAL_RESEARCH_SUMMARY_COPY } from '@/lib/public-medicine-language'
import type { PublicMedicineContextItem } from '@/lib/public-medicine-context'

interface MedicineRecordContextSectionsProps {
  bindingState: DossierBindingState
  context: MedicineRecordContextView
  contextItems: readonly PublicMedicineContextItem[]
}

function StoredSource({
  contextItems,
  source,
}: {
  contextItems: readonly PublicMedicineContextItem[]
  source: MedicineRecordSourceView
}) {
  const content = (
    <>
      <AnnotatedMedicineText
        as="span"
        className="min-w-0 [overflow-wrap:anywhere]"
        contexts={medicineTextContextMatches(source.label, contextItems)}
        text={source.label}
      />
      {source.href && <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
    </>
  )

  return source.href ? (
    <a
      href={source.href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-11 max-w-full items-center gap-1.5 text-sm font-semibold leading-6 text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
    >
      {content}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <span className="inline-flex max-w-full items-start gap-1.5 text-sm leading-6 text-[#424245]">
      {content}
    </span>
  )
}

export function hasMedicineRecordContext(context: MedicineRecordContextView): boolean {
  return Boolean(
    context.condition ||
    context.safetyAndAdministration ||
    context.pricing ||
    context.conventionalAlternatives.length > 0 ||
    context.commonQuestions.length > 0 ||
    context.molecular,
  )
}

export function MedicineRecordContextSections({
  bindingState,
  context,
  contextItems,
}: MedicineRecordContextSectionsProps) {
  const hasNonCommunityContext = Boolean(
    context.condition ||
    context.safetyAndAdministration ||
    context.pricing ||
    context.conventionalAlternatives.length > 0 ||
    context.commonQuestions.length > 0 ||
    context.molecular,
  )
  const researchBackgroundExplanation =
    bindingState === 'legacy_record'
      ? GENERAL_RESEARCH_SUMMARY_COPY.boundary
      : 'This background may cover uses beyond the question selected above. It provides context and is not part of the reviewed answer.'

  return (
    <div
      id="medicine-record-context"
      className="scroll-mt-24 space-y-8 border-t border-black/[0.1] pt-9"
    >
      {hasNonCommunityContext && (
        <header className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#0066CC]">
            General research background
          </p>
          <h2 className="text-2xl font-bold tracking-[-0.025em] text-[#1D1D1F]">
            Background and practical details
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-[#6E6E73]">
            {researchBackgroundExplanation}
          </p>
        </header>
      )}

      {context.condition && (
        <section
          id="why-developed"
          aria-labelledby="why-developed-heading"
          className="scroll-mt-24 space-y-4 rounded-[22px] bg-white p-5 sm:p-7"
        >
          <header className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#0066CC]">
              The health problem
            </p>
            <h3 id="why-developed-heading" className="text-xl font-bold text-[#1D1D1F]">
              Why this medicine is used or studied
            </h3>
          </header>
          {context.condition.conditionExplainer && (
            <AnnotatedMedicineText
              className="[overflow-wrap:anywhere] text-sm leading-6 text-[#424245]"
              contexts={medicineTextContextMatches(
                context.condition.conditionExplainer,
                contextItems,
              )}
              text={context.condition.conditionExplainer}
            />
          )}
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ['Why it matters', context.condition.whyItMatters],
              ['Who this information applies to', context.condition.whoWasApprovedOrStudied],
              [
                'What researchers or regulators wanted to find out',
                context.condition.studyOrLabelGoal,
              ],
            ].flatMap(([label, value]) =>
              value
                ? [
                    <div key={label} className="min-w-0 rounded-2xl bg-[#F5F5F7] p-4">
                      <dt className="text-xs font-bold leading-5 text-[#1D1D1F]">{label}</dt>
                      <dd className="mt-1 [overflow-wrap:anywhere] text-sm leading-6 text-[#424245]">
                        <AnnotatedMedicineText
                          as="span"
                          contexts={medicineTextContextMatches(value, contextItems)}
                          text={value}
                        />
                      </dd>
                    </div>,
                  ]
                : [],
            )}
          </dl>
        </section>
      )}

      {context.safetyAndAdministration && (
        <section
          id="safety-and-administration"
          aria-labelledby="safety-and-administration-heading"
          className="scroll-mt-24 overflow-hidden rounded-[22px] bg-white"
        >
          <header className="space-y-2 px-5 pt-5 sm:px-7">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#0066CC]">
              General safety and use information
            </p>
            <h3 id="safety-and-administration-heading" className="text-xl font-bold text-[#1D1D1F]">
              Safety and how it is given
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-[#6E6E73]">
              This is general background, not personal medical advice or dosing instructions. Ask a
              doctor or pharmacist and check the current official medicine information before making
              a treatment decision.
            </p>
          </header>
          <details className="group/safety">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071E3] sm:px-7 [&::-webkit-details-marker]:hidden">
              See side effects and how it is given
              <span className="shrink-0 text-lg font-normal text-[#0066CC]" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="space-y-5 border-t border-black/[0.07] px-5 py-5 sm:px-7">
              {context.safetyAndAdministration.administrationAndDosing && (
                <div className="min-w-0">
                  <h4 className="text-sm font-bold leading-6 text-[#1D1D1F]">
                    How it is usually given
                  </h4>
                  <AnnotatedMedicineText
                    className="mt-1 [overflow-wrap:anywhere] text-sm leading-6 text-[#424245]"
                    contexts={medicineTextContextMatches(
                      context.safetyAndAdministration.administrationAndDosing,
                      contextItems,
                    )}
                    text={context.safetyAndAdministration.administrationAndDosing}
                  />
                </div>
              )}
              {context.safetyAndAdministration.safetyInformation && (
                <div className="min-w-0">
                  <h4 className="text-sm font-bold leading-6 text-[#1D1D1F]">
                    Safety, side effects, and who should not receive it
                  </h4>
                  <AnnotatedMedicineText
                    className="mt-1 [overflow-wrap:anywhere] text-sm leading-6 text-[#424245]"
                    contexts={medicineTextContextMatches(
                      context.safetyAndAdministration.safetyInformation,
                      contextItems,
                    )}
                    text={context.safetyAndAdministration.safetyInformation}
                  />
                </div>
              )}
              {context.safetyAndAdministration.deliveryForm && (
                <details className="border-t border-black/[0.07] pt-2">
                  <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                    Technical delivery name
                  </summary>
                  <AnnotatedMedicineText
                    className="pb-1 [overflow-wrap:anywhere] text-sm leading-6 text-[#424245]"
                    contexts={medicineTextContextMatches(
                      context.safetyAndAdministration.deliveryForm,
                      contextItems,
                    )}
                    text={context.safetyAndAdministration.deliveryForm}
                  />
                </details>
              )}
            </div>
          </details>
        </section>
      )}

      {context.conventionalAlternatives.length > 0 && (
        <section
          id="other-approaches"
          aria-labelledby="other-approaches-heading"
          className="scroll-mt-24 space-y-4"
        >
          <header className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#0066CC]">
              Treatment context
            </p>
            <h3 id="other-approaches-heading" className="text-xl font-bold text-[#1D1D1F]">
              Other approaches used for the same goal
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-[#6E6E73]">
              These treatments are included as general research context. They may be used for
              different people or situations, are not necessarily equivalent, and are not advice to
              begin, stop, or replace treatment. The alphabetical order is not a ranking.
            </p>
          </header>
          {context.alternativesSummary && (
            <AnnotatedMedicineText
              className="[overflow-wrap:anywhere] text-sm leading-6 text-[#424245]"
              contexts={medicineTextContextMatches(context.alternativesSummary, contextItems)}
              text={context.alternativesSummary}
            />
          )}
          <ul className="grid gap-3 sm:grid-cols-2">
            {context.conventionalAlternatives.map((alternative) => (
              <li key={alternative.name} className="min-w-0 rounded-2xl bg-white p-5">
                <h4 className="[overflow-wrap:anywhere] text-sm font-bold text-[#1D1D1F]">
                  <AnnotatedMedicineText
                    as="span"
                    contexts={medicineTextContextMatches(alternative.name, contextItems)}
                    text={alternative.name}
                    testId="alternative-name"
                  />
                </h4>
                {alternative.className && (
                  <p className="mt-1 [overflow-wrap:anywhere] text-sm leading-6 text-[#6E6E73]">
                    Type of treatment:{' '}
                    <AnnotatedMedicineText
                      as="span"
                      contexts={medicineTextContextMatches(alternative.className, contextItems)}
                      text={alternative.className}
                    />
                  </p>
                )}
                {alternative.comparison && (
                  <AnnotatedMedicineText
                    className="mt-3 [overflow-wrap:anywhere] text-sm leading-6 text-[#424245]"
                    contexts={medicineTextContextMatches(alternative.comparison, contextItems)}
                    text={alternative.comparison}
                  />
                )}
                {(alternative.reportedCost || alternative.tradeoffs) && (
                  <dl className="mt-3 space-y-2 border-t border-black/[0.07] pt-3 text-sm leading-6">
                    {alternative.reportedCost && (
                      <div>
                        <dt className="font-semibold text-[#1D1D1F]">
                          Typical cost noted in the source
                        </dt>
                        <dd className="[overflow-wrap:anywhere] text-[#6E6E73]">
                          <AnnotatedMedicineText
                            as="span"
                            contexts={medicineTextContextMatches(
                              alternative.reportedCost,
                              contextItems,
                            )}
                            text={alternative.reportedCost}
                          />
                        </dd>
                      </div>
                    )}
                    {alternative.tradeoffs && (
                      <div>
                        <dt className="font-semibold text-[#1D1D1F]">
                          Benefits, limits and differences
                        </dt>
                        <dd className="[overflow-wrap:anywhere] text-[#6E6E73]">
                          <AnnotatedMedicineText
                            as="span"
                            contexts={medicineTextContextMatches(
                              alternative.tradeoffs,
                              contextItems,
                            )}
                            text={alternative.tradeoffs}
                          />
                        </dd>
                      </div>
                    )}
                  </dl>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {context.commonQuestions.length > 0 && (
        <section
          id="common-questions"
          aria-labelledby="common-questions-heading"
          className="scroll-mt-24 space-y-4"
        >
          <header className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#0066CC]">
              General questions
            </p>
            <h3 id="common-questions-heading" className="text-xl font-bold text-[#1D1D1F]">
              Questions people ask
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-[#6E6E73]">
              These answers provide general background. They are not instructions for taking or
              changing treatment and are not part of the reviewed answer above.
            </p>
          </header>
          <div className="divide-y divide-black/[0.07] overflow-hidden rounded-2xl bg-white px-5">
            {context.commonQuestions.map((question, index) => (
              <details key={`${question.question}:${index}`} className="group/question py-1">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-sm font-semibold leading-5 text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071E3] [&::-webkit-details-marker]:hidden">
                  <AnnotatedMedicineText
                    as="span"
                    className="min-w-0 [overflow-wrap:anywhere]"
                    contexts={medicineTextContextMatches(question.question, contextItems)}
                    text={question.question}
                    testId="common-question"
                  />
                  <span className="shrink-0 text-lg font-normal text-[#0066CC]" aria-hidden="true">
                    +
                  </span>
                </summary>
                <AnnotatedMedicineText
                  className="pb-5 [overflow-wrap:anywhere] text-sm leading-6 text-[#424245]"
                  contexts={medicineTextContextMatches(question.answer, contextItems)}
                  text={question.answer}
                />
              </details>
            ))}
          </div>
        </section>
      )}

      {context.pricing && (
        <section
          id="cost-context"
          aria-labelledby="cost-context-heading"
          className="scroll-mt-24 space-y-4 rounded-[22px] bg-white p-5 sm:p-7"
        >
          <header className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#0066CC]">
              Cost information from the sources
            </p>
            <h3 id="cost-context-heading" className="text-xl font-bold text-[#1D1D1F]">
              Cost and practical context
            </h3>
            <p className="text-sm leading-6 text-[#6E6E73]">
              These figures are not part of the reviewed answer for the use selected above. Prices
              can change by date, place, exact product, and who pays, such as an insurer or health
              system.
            </p>
          </header>
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ['Estimated cost to make it', context.pricing.reportedProductionCost],
              ['Published retail or list price', context.pricing.reportedRetailOrListPrice],
              ['How those prices compare', context.pricing.reportedComparison],
              ['How difficult it may be to make', context.pricing.manufacturingComplexity],
            ].flatMap(([label, value]) =>
              value
                ? [
                    <div key={label} className="min-w-0 rounded-2xl bg-[#F5F5F7] p-4">
                      <dt className="text-xs font-semibold leading-5 text-[#6E6E73]">{label}</dt>
                      <dd className="mt-1 [overflow-wrap:anywhere] text-sm font-bold leading-6 text-[#1D1D1F]">
                        <AnnotatedMedicineText
                          as="span"
                          contexts={medicineTextContextMatches(value, contextItems)}
                          text={value}
                        />
                      </dd>
                    </div>,
                  ]
                : [],
            )}
          </dl>
          {context.pricing.recordNote && (
            <AnnotatedMedicineText
              className="[overflow-wrap:anywhere] text-sm leading-6 text-[#424245]"
              contexts={medicineTextContextMatches(context.pricing.recordNote, contextItems)}
              text={context.pricing.recordNote}
            />
          )}
          {context.pricing.sources.length > 0 ? (
            <div className="space-y-2 border-t border-black/[0.07] pt-4">
              <p className="text-sm font-semibold text-[#1D1D1F]">
                Source links saved with these price notes
              </p>
              <ul className="space-y-2">
                {context.pricing.sources.map((source) => (
                  <li key={`${source.label}:${source.identifier ?? ''}`} className="min-w-0">
                    <StoredSource contextItems={contextItems} source={source} />
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-6 text-[#6E6E73]">
                The source note does not separate the date, place and assumptions into their own
                fields. Check the source wording before comparing figures.
              </p>
            </div>
          ) : (
            <p className="border-t border-black/[0.07] pt-4 text-sm leading-6 text-amber-800">
              No separate source link is available for these figures. Their date, place and
              assumptions cannot be checked from this note alone.
            </p>
          )}
        </section>
      )}

      {context.molecular && (
        <section
          id="molecular-record"
          aria-labelledby="molecular-record-heading"
          className="scroll-mt-24 overflow-hidden rounded-[22px] bg-white"
        >
          <header className="px-5 pt-5 sm:px-7">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#0066CC]">
              Medicine identity, not proof that it works
            </p>
            <h3 id="molecular-record-heading" className="mt-1 text-lg font-bold text-[#1D1D1F]">
              Technical identity
            </h3>
          </header>
          <details className="group/molecular">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071E3] sm:px-7 [&::-webkit-details-marker]:hidden">
              Show molecular structure and sequences
              <span className="shrink-0 text-lg text-[#0066CC]" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="space-y-4 border-t border-black/[0.07] px-5 py-5 sm:px-7">
              <p className="text-sm leading-6 text-[#6E6E73]">
                This section identifies the molecule described in the source. A passing structure
                check does not show that the medicine works or is safe. Laboratory and manufacturing
                instructions are not displayed here.
              </p>
              <div className="flex items-start gap-2 rounded-2xl bg-[#F5F5F7] p-4">
                {context.molecular.structureCheck === 'passed' ? (
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#0066CC]"
                    aria-hidden="true"
                  />
                ) : (
                  <CircleHelp
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#6E6E73]"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-6 text-[#1D1D1F]">
                    {context.molecular.structureCheck === 'passed'
                      ? 'The molecular description passed RNAWiki’s repeatable format and consistency checks.'
                      : 'No passing structure check is available.'}
                  </p>
                  {context.molecular.checkedAt && (
                    <p className="mt-1 text-xs leading-5 text-[#6E6E73]">
                      Checked {context.molecular.checkedAt.slice(0, 10)}
                    </p>
                  )}
                </div>
              </div>
              {context.molecular.format && (
                <p className="text-sm leading-6 text-[#424245]">
                  <span className="font-semibold text-[#1D1D1F]">Molecular format:</span>{' '}
                  <AnnotatedMedicineText
                    as="span"
                    contexts={medicineTextContextMatches(context.molecular.format, contextItems)}
                    text={context.molecular.format}
                    testId="molecular-format"
                  />
                </p>
              )}
              <dl className="space-y-3">
                {context.molecular.identifiers.map((identifier) => (
                  <div
                    key={identifier.label}
                    className={
                      identifier.kind === 'nucleotide_sequence' ||
                      identifier.kind === 'peptide_sequence'
                        ? 'min-w-0 rounded-2xl border border-[#B8D8FF] bg-[#F2F7FF] p-4'
                        : 'min-w-0'
                    }
                  >
                    <dt className="text-sm font-semibold leading-5 text-[#1D1D1F]">
                      {identifier.label}
                    </dt>
                    {identifier.kind === 'nucleotide_sequence' && (
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-[#424245]">
                        A, C, G and T are DNA building blocks; RNA uses U instead of T. This is the
                        sequence saved with this medicine—not a protein chain and not proof that the
                        medicine works.
                      </p>
                    )}
                    {identifier.kind === 'peptide_sequence' && (
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-[#424245]">
                        Letters or abbreviations describe amino-acid building blocks in the peptide
                        or protein chain saved with this medicine. Extra marks can show separate
                        chains or chemical changes. This identifies the molecule; it does not show
                        that it works or is safe.
                      </p>
                    )}
                    <dd
                      className={`mt-2 max-w-full rounded-xl bg-white px-3 py-2 font-mono text-xs leading-5 text-[#1D1D1F] ${
                        identifier.kind === 'nucleotide_sequence' ||
                        identifier.kind === 'peptide_sequence' ||
                        identifier.kind === 'smiles'
                          ? 'break-all'
                          : 'break-words'
                      }`}
                    >
                      {identifier.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {context.molecular.source ? (
                <div className="min-w-0 border-t border-black/[0.07] pt-4">
                  <p className="mb-1 text-sm font-semibold text-[#1D1D1F]">Identity source</p>
                  <StoredSource contextItems={contextItems} source={context.molecular.source} />
                </div>
              ) : (
                <p className="border-t border-black/[0.07] pt-4 text-sm leading-6 text-[#6E6E73]">
                  No separate source link is available for this molecular information.
                </p>
              )}
            </div>
          </details>
        </section>
      )}
    </div>
  )
}
