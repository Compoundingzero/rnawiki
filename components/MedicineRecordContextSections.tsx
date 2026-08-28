import { CheckCircle2, ChevronDown, CircleHelp, ExternalLink } from 'lucide-react'

import { AnnotatedMedicineText } from '@/components/AnnotatedMedicineText'
import {
  BackgroundAnatomyBody,
  BackgroundApplicabilityBody,
  BackgroundCommonAdverseReactionsBody,
  BackgroundCostEntriesBody,
  BackgroundInteractionSignalsBody,
  BackgroundMechanismBody,
  BackgroundMolecularIdentityBody,
  BackgroundPharmacokineticsBody,
  BackgroundPopulationStatementsBody,
  BackgroundPivotalResultsBody,
  BackgroundProductsBody,
  BackgroundSafetyBody,
  BackgroundTitrationBody,
  RegistryIdentifierList,
} from '@/components/dossier/RecordedBackgroundRows'
import { medicineTextContextMatches } from '@/lib/annotated-medicine-text'
import type {
  DossierBindingState,
  MedicineRecordContextView,
  MedicineRecordSourceView,
} from '@/lib/medicine-dossier-view-model'
import type { PublicMedicineContextItem } from '@/lib/public-medicine-context'

interface MedicineRecordContextSectionsProps {
  bindingState: DossierBindingState
  context: MedicineRecordContextView
  contextItems: readonly PublicMedicineContextItem[]
}

interface BackgroundRowProps {
  children: React.ReactNode
  id: string
  preview?: string
  title: string
  /** Topic marker colour so the background rows can be told apart at a glance. */
  tone?: 'blue' | 'amber' | 'emerald' | 'violet' | 'stone'
}

const BACKGROUND_BOUNDARY =
  'This is general background. It may cover information beyond the selected use and is not part of the reviewed answer above.'

const backgroundRowDot: Record<NonNullable<BackgroundRowProps['tone']>, string> = {
  blue: 'bg-[#0066CC]',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500',
  violet: 'bg-violet-500',
  stone: 'bg-stone-400',
}

function BackgroundRow({ children, id, preview, title, tone = 'stone' }: BackgroundRowProps) {
  return (
    <details id={id} className="group/record-row scroll-mt-24">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071E3] sm:px-7 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-baseline gap-2.5">
          <span
            aria-hidden="true"
            className={`h-2 w-2 shrink-0 self-center rounded-full ${backgroundRowDot[tone]}`}
          />
          <span className="min-w-0">
            <span className="block [overflow-wrap:anywhere] text-base font-semibold leading-6 text-[#1D1D1F]">
              {title}
            </span>
            {preview && (
              <span className="mt-0.5 block [overflow-wrap:anywhere] text-sm leading-5 text-[#515154]">
                {preview}
              </span>
            )}
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-[#0066CC] transition-transform group-open/record-row:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>
      <div className="min-w-0 border-t border-black/[0.07] px-5 py-5 sm:px-7 sm:py-6">
        {children}
      </div>
    </details>
  )
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

function safetyPreview(context: NonNullable<MedicineRecordContextView['safetyAndAdministration']>) {
  if (context.safetyInformation && context.administrationAndDosing) {
    return 'How it is given and the important safety information stored with this record.'
  }
  if (context.safetyInformation) {
    return 'Important safety information stored with this medicine record.'
  }
  if (context.administrationAndDosing) {
    return 'How this medicine is given in the stored record.'
  }
  return 'The delivery form or technical delivery name stored with this record.'
}

function hasSourcedPricing(context: MedicineRecordContextView): boolean {
  return (context.pricing?.reports?.length ?? 0) > 0
}

export function hasMedicineRecordContext(context: MedicineRecordContextView): boolean {
  return Boolean(
    context.condition ||
    context.background ||
    context.safetyAndAdministration ||
    hasSourcedPricing(context) ||
    context.conventionalAlternatives.length > 0 ||
    (context.foodSupplementContext?.length ?? 0) > 0 ||
    context.commonQuestions.length > 0 ||
    context.molecular,
  )
}

export function MedicineRecordContextSections({
  context,
  contextItems,
}: MedicineRecordContextSectionsProps) {
  const foodSupplementContext = [...(context.foodSupplementContext ?? [])].sort((left, right) =>
    left.name.localeCompare(right.name),
  )

  return (
    <div id="medicine-record-context" className="scroll-mt-24 pt-7">
      <header className="space-y-2 px-1 pb-6 sm:px-0">
        <h2 className="text-2xl font-bold tracking-[-0.025em] text-[#1D1D1F]">
          General background about this medicine
        </h2>
        <p className="max-w-2xl text-base leading-7 text-[#515154]">{BACKGROUND_BOUNDARY}</p>
        {context.background?.provenanceNote && (
          <p className="max-w-2xl rounded-2xl border border-black/[0.08] bg-[#F5F5F7] px-4 py-3 text-sm leading-6 text-[#515154]">
            {context.background.provenanceNote}
          </p>
        )}
      </header>

      <div className="divide-y divide-black/[0.07] overflow-hidden rounded-[22px] border border-black/[0.08] bg-white">
        {context.condition && (
          <BackgroundRow
            id="why-developed"
            tone="blue"
            title="The condition"
            preview="What the condition is, why it matters, and who this information applies to."
          >
            <div className="space-y-5">
              {context.condition.conditionExplainer && (
                <AnnotatedMedicineText
                  className="[overflow-wrap:anywhere] text-base leading-7 text-[#424245]"
                  contexts={medicineTextContextMatches(
                    context.condition.conditionExplainer,
                    contextItems,
                  )}
                  text={context.condition.conditionExplainer}
                />
              )}
              <dl className="space-y-5">
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
                        <div key={label} className="min-w-0">
                          <dt className="text-base font-semibold leading-6 text-[#1D1D1F]">
                            {label}
                          </dt>
                          <dd className="mt-1 [overflow-wrap:anywhere] text-base leading-7 text-[#424245]">
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
            </div>
          </BackgroundRow>
        )}

        {context.safetyAndAdministration && (
          <BackgroundRow
            id="safety-and-administration"
            tone="amber"
            title="Safety and how it is given"
            preview={safetyPreview(context.safetyAndAdministration)}
          >
            <div className="space-y-5">
              <p className="text-base leading-7 text-[#515154]">
                This is general information from the stored medicine record, not personal medical
                advice or new dosing instructions.
              </p>
              {context.safetyAndAdministration.administrationAndDosing && (
                <section aria-labelledby="background-administration-heading">
                  <h3
                    id="background-administration-heading"
                    className="text-base font-semibold leading-6 text-[#1D1D1F]"
                  >
                    How it is given
                  </h3>
                  <AnnotatedMedicineText
                    className="mt-1 [overflow-wrap:anywhere] text-base leading-7 text-[#424245]"
                    contexts={medicineTextContextMatches(
                      context.safetyAndAdministration.administrationAndDosing,
                      contextItems,
                    )}
                    text={context.safetyAndAdministration.administrationAndDosing}
                  />
                </section>
              )}
              {context.safetyAndAdministration.safetyInformation && (
                <section aria-labelledby="background-safety-heading">
                  <h3
                    id="background-safety-heading"
                    className="text-base font-semibold leading-6 text-[#1D1D1F]"
                  >
                    Important safety information
                  </h3>
                  <AnnotatedMedicineText
                    className="mt-1 [overflow-wrap:anywhere] text-base leading-7 text-[#424245]"
                    contexts={medicineTextContextMatches(
                      context.safetyAndAdministration.safetyInformation,
                      contextItems,
                    )}
                    text={context.safetyAndAdministration.safetyInformation}
                  />
                </section>
              )}
              {context.safetyAndAdministration.deliveryForm && (
                <section aria-labelledby="background-delivery-heading">
                  <h3
                    id="background-delivery-heading"
                    className="text-base font-semibold leading-6 text-[#1D1D1F]"
                  >
                    Technical delivery name
                  </h3>
                  <AnnotatedMedicineText
                    className="mt-1 [overflow-wrap:anywhere] text-base leading-7 text-[#424245]"
                    contexts={medicineTextContextMatches(
                      context.safetyAndAdministration.deliveryForm,
                      contextItems,
                    )}
                    text={context.safetyAndAdministration.deliveryForm}
                  />
                </section>
              )}
            </div>
          </BackgroundRow>
        )}

        {context.background?.applicability && (
          <BackgroundRow
            id="who-was-studied-record"
            tone="blue"
            title="Who the main study included and excluded"
            preview="Eligibility rules recorded from the study register, shown exactly as written."
          >
            <BackgroundApplicabilityBody applicability={context.background.applicability} />
          </BackgroundRow>
        )}

        {context.background?.mechanism && (
          <BackgroundRow
            id="recorded-mechanism"
            tone="emerald"
            title="How it works, in the source's own words"
            preview="The exact sentences the source uses to describe what this medicine does in the body."
          >
            <BackgroundMechanismBody mechanism={context.background.mechanism} />
          </BackgroundRow>
        )}

        {context.background?.safety && (
          <BackgroundRow
            id="recorded-harms"
            tone="amber"
            title="What the source warns about"
            preview="The strongest warning printed on the source, and the situations it says the medicine must not be used in."
          >
            <BackgroundSafetyBody safety={context.background.safety} />
          </BackgroundRow>
        )}

        {context.background?.commonAdverseReactions && (
          <BackgroundRow
            id="commonly-reported"
            tone="amber"
            title="What was reported most often"
            preview="The reactions the source lists as most common, with the reporting rate it printed alongside them."
          >
            <BackgroundCommonAdverseReactionsBody
              reactions={context.background.commonAdverseReactions}
            />
          </BackgroundRow>
        )}

        {(context.background?.populationStatements?.length ?? 0) > 0 && (
          <BackgroundRow
            id="recorded-populations"
            tone="emerald"
            title="Groups the source does and does not answer for"
            preview="What the source says about children, older adults, pregnancy and breastfeeding — including where it says nothing was established."
          >
            <BackgroundPopulationStatementsBody
              statements={context.background!.populationStatements!}
            />
          </BackgroundRow>
        )}

        {context.background?.pharmacokinetics && (
          <BackgroundRow
            id="after-a-dose"
            tone="violet"
            title="What happens after a dose"
            preview="Recorded absorption, peak time, half-life and clearance values, each with its measured group and source."
          >
            <BackgroundPharmacokineticsBody
              pharmacokinetics={context.background.pharmacokinetics}
            />
          </BackgroundRow>
        )}

        {context.background?.titration && (
          <BackgroundRow
            id="studied-schedule"
            tone="blue"
            title="The escalation schedule that was studied"
            preview="Step-by-step schedule recorded from the label or trial protocol, as research context."
          >
            <BackgroundTitrationBody titration={context.background.titration} />
          </BackgroundRow>
        )}

        {(context.background?.productVariants?.length ?? 0) > 0 && (
          <BackgroundRow
            id="recorded-products"
            tone="blue"
            title="Products that contain this medicine"
            preview="Recorded brands, forms, strengths and approved uses by place."
          >
            <BackgroundProductsBody products={context.background!.productVariants!} />
          </BackgroundRow>
        )}

        {context.background?.interactionSignals && (
          <BackgroundRow
            id="handled-by"
            tone="violet"
            title="What handles it in the body"
            preview="Enzymes and transporters the source names, each with the sentence that named it."
          >
            <BackgroundInteractionSignalsBody signals={context.background.interactionSignals} />
          </BackgroundRow>
        )}

        {context.background?.molecularIdentity && (
          <BackgroundRow
            id="chemical-identity"
            tone="stone"
            title="What the molecule is"
            preview="Molecular formula and weight exactly as the source prints them."
          >
            <BackgroundMolecularIdentityBody identity={context.background.molecularIdentity} />
          </BackgroundRow>
        )}

        {(context.background?.anatomyTargets?.length ?? 0) > 0 && (
          <BackgroundRow
            id="where-it-acts-map"
            tone="violet"
            title="Where in the body it acts"
            preview="Recorded body regions on a fixed map — every dot has a source."
          >
            <BackgroundAnatomyBody targets={context.background!.anatomyTargets!} />
          </BackgroundRow>
        )}

        {(context.background?.pivotalResults?.length ?? 0) > 0 && (
          <BackgroundRow
            id="recorded-trial-results"
            tone="blue"
            title="Exact recorded study results"
            preview="Named studies with their exact numbers, comparison groups and uncertainty."
          >
            <BackgroundPivotalResultsBody results={context.background!.pivotalResults!} />
          </BackgroundRow>
        )}

        {context.conventionalAlternatives.length > 0 && (
          <BackgroundRow
            id="other-approaches"
            tone="stone"
            title="Other medical treatments for the same goal"
            preview="Other treatments mentioned in the medicine-wide record, without ranking them."
          >
            <div className="space-y-5">
              <p className="text-base leading-7 text-[#515154]">
                These may be used for different people or situations. Their presence here does not
                mean they are equivalent or that one should replace another. The list is
                alphabetical, not a ranking.
              </p>
              {context.alternativesSummary && (
                <AnnotatedMedicineText
                  className="[overflow-wrap:anywhere] text-base leading-7 text-[#424245]"
                  contexts={medicineTextContextMatches(context.alternativesSummary, contextItems)}
                  text={context.alternativesSummary}
                />
              )}
              <ul className="divide-y divide-black/[0.07] border-y border-black/[0.07]">
                {context.conventionalAlternatives.map((alternative) => (
                  <li key={alternative.name} className="min-w-0 py-4 first:pt-0 last:pb-0">
                    <h3 className="[overflow-wrap:anywhere] text-base font-semibold leading-6 text-[#1D1D1F]">
                      <AnnotatedMedicineText
                        as="span"
                        contexts={medicineTextContextMatches(alternative.name, contextItems)}
                        text={alternative.name}
                        testId="alternative-name"
                      />
                    </h3>
                    {alternative.className && (
                      <p className="mt-1 [overflow-wrap:anywhere] text-sm leading-6 text-[#515154]">
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
                        className="mt-3 [overflow-wrap:anywhere] text-base leading-7 text-[#424245]"
                        contexts={medicineTextContextMatches(alternative.comparison, contextItems)}
                        text={alternative.comparison}
                      />
                    )}
                    {alternative.tradeoffs && (
                      <div className="mt-3">
                        <p className="text-base font-semibold leading-6 text-[#1D1D1F]">
                          Differences and limits
                        </p>
                        <AnnotatedMedicineText
                          className="mt-1 [overflow-wrap:anywhere] text-base leading-7 text-[#424245]"
                          contexts={medicineTextContextMatches(alternative.tradeoffs, contextItems)}
                          text={alternative.tradeoffs}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </BackgroundRow>
        )}

        {foodSupplementContext.length > 0 && (
          <BackgroundRow
            id="food-and-supplement-context"
            tone="emerald"
            title="Foods and supplements mentioned in this record"
            preview="General background entries whose exact sources have not yet been linked."
          >
            <div className="space-y-5">
              <p className="text-base leading-7 text-[#515154]">
                These entries come from the general medicine-wide record. They are not treatment
                recommendations, one-for-one replacements, or instructions about what to take. The
                stored entries do not provide complete safety or source context.
              </p>
              <ul className="divide-y divide-black/[0.07] border-y border-black/[0.07]">
                {foodSupplementContext.map((item) => (
                  <li key={item.name} className="min-w-0 py-4 first:pt-0 last:pb-0">
                    <h3 className="[overflow-wrap:anywhere] text-base font-semibold leading-6 text-[#1D1D1F]">
                      {item.name}
                    </h3>
                    <dl className="mt-2 space-y-2 text-sm leading-6">
                      {item.recordedEvidenceLabel && (
                        <div>
                          <dt className="font-semibold text-[#424245]">Recorded evidence label</dt>
                          <dd className="[overflow-wrap:anywhere] text-[#515154]">
                            {item.recordedEvidenceLabel}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="font-semibold text-[#424245]">Source</dt>
                        <dd className="text-amber-800">Source not yet linked</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </div>
          </BackgroundRow>
        )}

        {hasSourcedPricing(context) && context.pricing && (
          <BackgroundRow
            id="cost-context"
            tone="blue"
            title="Cost information"
            preview="Stored price or cost context, with its source status when available."
          >
            <div className="space-y-5">
              <p className="text-base leading-7 text-[#515154]">
                These figures are general background, not a shopping or treatment-comparison tool.
                Prices can change by date, place, exact product, and who pays.
              </p>
              <dl className="divide-y divide-black/[0.07] border-y border-black/[0.07]">
                {context.pricing.reports?.map((report) => (
                  <div
                    key={`${report.kind}:${report.source.identifier ?? report.source.label}`}
                    className="min-w-0 py-4"
                  >
                    <dt className="text-base font-semibold leading-6 text-[#1D1D1F]">
                      {report.kind === 'reported_production_cost'
                        ? 'Estimated cost to make it'
                        : 'Published retail or list price'}
                    </dt>
                    <dd className="mt-1 [overflow-wrap:anywhere] text-base leading-7 text-[#424245]">
                      <AnnotatedMedicineText
                        as="span"
                        contexts={medicineTextContextMatches(report.value, contextItems)}
                        text={report.value}
                      />
                    </dd>
                    <dd className="mt-2 min-w-0">
                      <StoredSource contextItems={contextItems} source={report.source} />
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-base leading-7 text-[#515154]">
                Check each source’s date, place, exact product, and assumptions before comparing
                figures. RNAWiki does not show a regional comparison unless the record stores those
                details with their own source.
              </p>
            </div>
          </BackgroundRow>
        )}

        {(context.background?.costEntries?.length ?? 0) > 0 && (
          <BackgroundRow
            id="recorded-cost-context"
            tone="blue"
            title="Recorded price context"
            preview="Dated price facts by place and payer, each with its source."
          >
            <BackgroundCostEntriesBody entries={context.background!.costEntries!} />
          </BackgroundRow>
        )}

        {context.commonQuestions.length > 0 && (
          <BackgroundRow
            id="common-questions"
            tone="stone"
            title="Common questions"
            preview="General answers stored with this medicine-wide record."
          >
            <div className="space-y-4">
              <p className="text-base leading-7 text-[#515154]">
                These answers are general background, not instructions for taking or changing
                treatment.
              </p>
              <div className="divide-y divide-black/[0.07] border-y border-black/[0.07]">
                {context.commonQuestions.map((question, index) => (
                  <details key={`${question.question}:${index}`} className="group/question">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-base font-semibold leading-6 text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071E3] [&::-webkit-details-marker]:hidden">
                      <AnnotatedMedicineText
                        as="span"
                        className="min-w-0 [overflow-wrap:anywhere]"
                        contexts={medicineTextContextMatches(question.question, contextItems)}
                        text={question.question}
                        testId="common-question"
                      />
                      <ChevronDown
                        className="h-4 w-4 shrink-0 text-[#0066CC] transition-transform group-open/question:rotate-180 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </summary>
                    <AnnotatedMedicineText
                      className="pb-5 [overflow-wrap:anywhere] text-base leading-7 text-[#424245]"
                      contexts={medicineTextContextMatches(question.answer, contextItems)}
                      text={question.answer}
                    />
                  </details>
                ))}
              </div>
            </div>
          </BackgroundRow>
        )}

        {context.background?.registryIdentifiers && !context.molecular && (
          <BackgroundRow
            id="registry-identifiers"
            tone="violet"
            title="Registry identifiers"
            preview="How major public registries identify this medicine."
          >
            <RegistryIdentifierList identifiers={context.background.registryIdentifiers} />
          </BackgroundRow>
        )}

        {context.molecular && (
          <BackgroundRow
            id="molecular-record"
            tone="violet"
            title="Technical identity"
            preview="Molecular identifiers, sequences, structures, and the record’s consistency check."
          >
            <div className="space-y-5">
              {context.background?.registryIdentifiers && (
                <div className="rounded-2xl border border-black/[0.08] bg-white p-4">
                  <h5 className="text-xs font-bold uppercase tracking-wide text-[#6E6E73]">
                    Registry identifiers
                  </h5>
                  <div className="mt-2">
                    <RegistryIdentifierList identifiers={context.background.registryIdentifiers} />
                  </div>
                </div>
              )}
              <p className="text-base leading-7 text-[#515154]">
                A structure check confirms that the stored molecular record is internally
                consistent. It does not show whether the medicine works or is safe. Laboratory and
                manufacturing instructions are not displayed here.
              </p>
              <div className="flex items-start gap-3 border-y border-black/[0.07] py-4">
                {context.molecular.structureCheck === 'passed' ? (
                  <CheckCircle2
                    className="mt-1 h-4 w-4 shrink-0 text-[#0066CC]"
                    aria-hidden="true"
                  />
                ) : (
                  <CircleHelp className="mt-1 h-4 w-4 shrink-0 text-[#6E6E73]" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <p className="text-base font-semibold leading-7 text-[#1D1D1F]">
                    {context.molecular.structureCheck === 'passed'
                      ? 'The stored molecular description passed RNAWiki’s format and consistency checks.'
                      : 'No passing structure check is available.'}
                  </p>
                  {context.molecular.checkedAt && (
                    <p className="mt-1 text-sm leading-6 text-[#515154]">
                      Checked {context.molecular.checkedAt.slice(0, 10)}
                    </p>
                  )}
                </div>
              </div>
              {context.molecular.format && (
                <p className="text-base leading-7 text-[#424245]">
                  <span className="font-semibold text-[#1D1D1F]">Molecular format:</span>{' '}
                  <AnnotatedMedicineText
                    as="span"
                    contexts={medicineTextContextMatches(context.molecular.format, contextItems)}
                    text={context.molecular.format}
                    testId="molecular-format"
                  />
                </p>
              )}
              <dl className="space-y-5">
                {context.molecular.identifiers.map((identifier) => (
                  <div key={identifier.label} className="min-w-0">
                    <dt className="text-base font-semibold leading-6 text-[#1D1D1F]">
                      {identifier.label}
                    </dt>
                    {identifier.kind === 'nucleotide_sequence' && (
                      <p className="mt-1 max-w-2xl text-base leading-7 text-[#424245]">
                        A, C, G and T are DNA building blocks; RNA uses U instead of T. This is the
                        sequence saved with this medicine—not a protein chain and not proof that the
                        medicine works.
                      </p>
                    )}
                    {identifier.kind === 'peptide_sequence' && (
                      <p className="mt-1 max-w-2xl text-base leading-7 text-[#424245]">
                        Letters or abbreviations describe amino-acid building blocks in the peptide
                        or protein chain saved with this medicine. Extra marks can show separate
                        chains or chemical changes. This identifies the molecule; it does not show
                        that it works or is safe.
                      </p>
                    )}
                    <dd
                      className={`mt-2 max-w-full rounded-xl bg-[#F5F5F7] px-3 py-2 font-mono text-xs leading-5 text-[#1D1D1F] ${
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
                  <p className="mb-1 text-base font-semibold leading-6 text-[#1D1D1F]">
                    Identity source
                  </p>
                  <StoredSource contextItems={contextItems} source={context.molecular.source} />
                </div>
              ) : (
                <p className="border-t border-black/[0.07] pt-4 text-base leading-7 text-[#515154]">
                  No separate source link is available for this molecular information.
                </p>
              )}
            </div>
          </BackgroundRow>
        )}
      </div>
    </div>
  )
}
