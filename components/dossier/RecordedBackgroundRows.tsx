import { ExternalLink } from 'lucide-react'

import { AnatomyTargetMap } from '@/components/dossier/AnatomyTargetMap'
import type {
  MedicineBackgroundContextView,
  RecordedSourceView,
  RecordedValueView,
} from '@/lib/medicine-background-view'

/**
 * Server-rendered rows for the recorded medicine-background modules. Every row repeats the same
 * honesty frame: values were read from a fetched source at authoring time, checked by software
 * for structure, and are research or label context — never a reviewed conclusion or guidance.
 */

const ROW_BOUNDARY =
  'Recorded from the named source; software checked its structure. This is research and label context, not a reviewed conclusion.'

function SourceLine({ source }: { source: RecordedSourceView }) {
  return (
    <div className="min-w-0 font-mono text-[11px] leading-5 text-[#6E6E73]">
      {source.href ? (
        <a
          href={source.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 max-w-full items-center gap-1 break-all font-sans font-semibold text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
        >
          {source.kindLabel}: {source.label}
          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <span className="break-all">
          {source.kindLabel}: {source.label}
        </span>
      )}
      <span className="block">
        {source.identifier} · fetched {source.retrievedAt}
      </span>
      {source.excerpt && (
        <details className="mt-1">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-sans text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
            Exact fetched wording
          </summary>
          <blockquote className="mt-1 border-l-2 border-black/[0.12] pl-3 font-sans text-sm leading-6 text-[#515154]">
            “{source.excerpt}”
          </blockquote>
        </details>
      )}
    </div>
  )
}

function RecordedValueCard({ value }: { value: RecordedValueView }) {
  return (
    <li className="min-w-0 rounded-2xl border border-black/[0.08] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6E6E73]">{value.label}</p>
      <p className="mt-1 break-words font-mono text-base font-semibold text-[#1D1D1F]">
        {value.display}
      </p>
      <p className="mt-1 text-sm leading-6 text-[#515154]">
        Measured in: {value.populationContext}
      </p>
      {value.provenanceLabel && (
        <p className="mt-2 text-[11px] font-semibold leading-4 text-[#6E6E73]">
          {value.provenanceLabel}
        </p>
      )}
      {value.concordanceLabel && (
        <p
          className={`mt-2 inline-flex max-w-full rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-4 ${
            value.discrepantAlternate
              ? 'border-[#F0D89A] bg-[#FFF8E7] text-[#8A4B00]'
              : 'border-black/[0.1] bg-[#F5F5F7] text-[#515154]'
          }`}
        >
          {value.concordanceLabel}
        </p>
      )}
      {value.discrepantAlternate && (
        <p className="mt-2 text-sm leading-6 text-[#8A4B00]">
          Other recorded reading:{' '}
          <span className="font-mono">{value.discrepantAlternate.display}</span> (
          {value.discrepantAlternate.source.kindLabel})
        </p>
      )}
      <div className="mt-2 border-t border-black/[0.06] pt-2">
        <SourceLine source={value.source} />
      </div>
    </li>
  )
}

export function BackgroundPharmacokineticsBody({
  pharmacokinetics,
}: {
  pharmacokinetics: NonNullable<MedicineBackgroundContextView['pharmacokinetics']>
}) {
  return (
    <div className="space-y-4">
      <p className="text-base leading-7 text-[#515154]">{ROW_BOUNDARY}</p>
      <p className="text-sm leading-6 text-[#424245]">
        <span className="font-semibold">Route as recorded: </span>
        {pharmacokinetics.routeAsRecorded}
      </p>
      <ul
        className="grid min-w-0 gap-3 sm:grid-cols-2"
        aria-label="Recorded pharmacokinetic values"
      >
        {pharmacokinetics.values.map((value) => (
          <RecordedValueCard key={value.label} value={value} />
        ))}
      </ul>
      {pharmacokinetics.steadyStateNote && (
        <p className="rounded-2xl bg-[#EEF5FF] px-4 py-3 text-sm leading-6 text-[#1D1D1F]">
          {pharmacokinetics.steadyStateNote}{' '}
          <span className="text-[#6E6E73]">
            Worked out arithmetically from the recorded half-life.
          </span>
        </p>
      )}
    </div>
  )
}

export function BackgroundTitrationBody({
  titration,
}: {
  titration: NonNullable<MedicineBackgroundContextView['titration']>
}) {
  return (
    <div className="space-y-4">
      <p className="text-base leading-7 text-[#515154]">
        {titration.basisLabel}. Recorded exactly as the source states it — a personal plan is a
        clinician’s decision, and this page does not give one.
      </p>
      <ol
        className="grid min-w-0 gap-2.5 sm:grid-cols-2 lg:grid-cols-5"
        aria-label="Recorded schedule steps"
      >
        {titration.steps.map((step, index) => (
          <li key={index} className="min-w-0 rounded-2xl border border-black/[0.08] bg-white p-3.5">
            <span className="block font-mono text-[11px] text-[#6E6E73]">{step.period}</span>
            <span className="mt-0.5 block break-words text-sm font-bold text-[#1D1D1F]">
              {step.amount}
            </span>
            {step.purpose && (
              <span className="mt-1 block text-[11px] leading-4 text-[#515154]">
                {step.purpose}
              </span>
            )}
          </li>
        ))}
      </ol>
      <SourceLine source={titration.source} />
    </div>
  )
}

export function BackgroundProductsBody({
  products,
}: {
  products: NonNullable<MedicineBackgroundContextView['productVariants']>
}) {
  return (
    <div className="space-y-4">
      <p className="text-base leading-7 text-[#515154]">
        Products that contain this medicine are not automatically interchangeable: forms, strengths
        and approved uses differ. {ROW_BOUNDARY}
      </p>
      <ul
        className="grid min-w-0 gap-3 md:grid-cols-2 lg:grid-cols-3"
        aria-label="Recorded products"
      >
        {products.map((product, index) => (
          <li
            key={`${product.brandName}-${index}`}
            className="min-w-0 rounded-2xl border border-black/[0.08] bg-white p-4"
          >
            <div className="flex min-w-0 items-start justify-between gap-2">
              <p className="break-words text-base font-bold text-[#1D1D1F]">{product.brandName}</p>
              <span className="shrink-0 rounded-md bg-[#F5F5F7] px-2 py-0.5 text-[10px] font-semibold text-[#515154]">
                {product.jurisdictionLabel}
              </span>
            </div>
            <p className="mt-1.5 break-words text-sm font-medium leading-6 text-[#424245]">
              {product.approvedUse}
            </p>
            <dl className="mt-2 space-y-1 text-sm leading-6 text-[#515154]">
              <div>
                <dt className="inline font-semibold">Form: </dt>
                <dd className="inline break-words">{product.form}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Strengths: </dt>
                <dd className="inline break-words">{product.strengths}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] leading-4 text-[#6E6E73]">{product.status}</p>
            <div className="mt-2 border-t border-black/[0.06] pt-2">
              <SourceLine source={product.source} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BackgroundAnatomyBody({
  targets,
}: {
  targets: NonNullable<MedicineBackgroundContextView['anatomyTargets']>
}) {
  return (
    <div className="space-y-4">
      <p className="text-base leading-7 text-[#515154]">
        Body regions the source records this medicine acting on. Positions come from a fixed
        vocabulary of regions, never from guesswork. {ROW_BOUNDARY}
      </p>
      <AnatomyTargetMap targets={targets} />
    </div>
  )
}

export function BackgroundApplicabilityBody({
  applicability,
}: {
  applicability: NonNullable<MedicineBackgroundContextView['applicability']>
}) {
  return (
    <div className="space-y-4">
      <p className="text-base leading-7 text-[#515154]">
        Who the main study ({applicability.trialIdentifier}) recorded as eligible and excluded. A
        group the study left out is a boundary of the evidence, not a judgement about anyone.
      </p>
      {applicability.studiedGroup && (
        <p className="text-sm leading-6 text-[#424245]">
          <span className="font-semibold">Who actually took part, as recorded: </span>
          {applicability.studiedGroup}
        </p>
      )}
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-black/[0.08] bg-white p-4">
          <h5 className="text-xs font-bold uppercase tracking-wide text-emerald-800">
            Included, as recorded
          </h5>
          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#424245]">
            {applicability.included.map((criterion, index) => (
              <li key={index} className="break-words border-l-2 border-emerald-200 pl-3">
                {criterion}
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0 rounded-2xl border border-black/[0.08] bg-white p-4">
          <h5 className="text-xs font-bold uppercase tracking-wide text-[#8A4B00]">
            Excluded, as recorded
          </h5>
          {applicability.excluded.length > 0 ? (
            <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#424245]">
              {applicability.excluded.map((criterion, index) => (
                <li key={index} className="break-words border-l-2 border-[#F0D89A] pl-3">
                  {criterion}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-6 text-[#6E6E73]">
              No exclusion criteria were captured from this record.
            </p>
          )}
        </div>
      </div>
      <SourceLine source={applicability.source} />
    </div>
  )
}

export function BackgroundPivotalResultsBody({
  results,
}: {
  results: NonNullable<MedicineBackgroundContextView['pivotalResults']>
}) {
  return (
    <div className="space-y-4">
      <p className="text-base leading-7 text-[#515154]">
        Exact recorded numbers from named studies. Group averages are not personal predictions.{' '}
        {ROW_BOUNDARY}
      </p>
      <ul className="space-y-3" aria-label="Recorded main study results">
        {results.map((result, index) => (
          <li
            key={`${result.trialIdentifier}-${index}`}
            className="min-w-0 rounded-2xl border border-black/[0.08] bg-white p-4"
          >
            <p className="font-mono text-xs font-semibold text-[#0066CC]">
              {result.trialIdentifier}
            </p>
            <p className="mt-1 break-words text-sm font-semibold leading-6 text-[#1D1D1F]">
              {result.endpoint}
            </p>
            <dl className="mt-2 grid min-w-0 gap-x-6 gap-y-1.5 text-sm leading-6 sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-[#515154]">With the medicine</dt>
                <dd className="break-words font-mono text-[#1D1D1F]">{result.activeResult}</dd>
              </div>
              {result.comparatorResult && (
                <div>
                  <dt className="font-semibold text-[#515154]">Comparison group</dt>
                  <dd className="break-words font-mono text-[#1D1D1F]">
                    {result.comparatorResult}
                  </dd>
                </div>
              )}
              {result.difference && (
                <div>
                  <dt className="font-semibold text-[#515154]">Difference</dt>
                  <dd className="break-words font-mono text-[#1D1D1F]">{result.difference}</dd>
                </div>
              )}
              {result.uncertainty && (
                <div>
                  <dt className="font-semibold text-[#515154]">How uncertain</dt>
                  <dd className="break-words font-mono text-[#1D1D1F]">{result.uncertainty}</dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-[#515154]">When measured</dt>
                <dd className="break-words">{result.timepoint}</dd>
              </div>
            </dl>
            <div className="mt-2 border-t border-black/[0.06] pt-2">
              <SourceLine source={result.source} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BackgroundCostEntriesBody({
  entries,
}: {
  entries: NonNullable<MedicineBackgroundContextView['costEntries']>
}) {
  return (
    <div className="space-y-4">
      <p className="text-base leading-7 text-[#515154]">
        Recorded price context by place and payer, each with its own date. Prices change; the date
        beside each figure is part of the fact. This is background, never a shopping tool.
      </p>
      <ul className="grid min-w-0 gap-3 sm:grid-cols-2" aria-label="Recorded price context">
        {entries.map((entry, index) => (
          <li key={index} className="min-w-0 rounded-2xl border border-black/[0.08] bg-white p-4">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <p className="text-sm font-bold text-[#1D1D1F]">{entry.jurisdictionLabel}</p>
              <span className="shrink-0 rounded-md bg-[#F5F5F7] px-2 py-0.5 text-[10px] font-semibold text-[#515154]">
                {entry.priceTypeLabel}
              </span>
            </div>
            <p className="mt-1.5 break-words font-mono text-base font-semibold text-[#1D1D1F]">
              {entry.priceDisplay}
            </p>
            <p className="text-[11px] leading-4 text-[#6E6E73]">as recorded on {entry.asOf}</p>
            {entry.normalizedDisplay && (
              <p className="mt-1 text-sm leading-6 text-[#424245]">
                {entry.normalizedDisplay}{' '}
                <span className="text-[#6E6E73]">(arithmetic conversion, dated)</span>
              </p>
            )}
            <p className="mt-1.5 text-sm leading-6 text-[#515154]">{entry.whoPays}</p>
            <div className="mt-2 border-t border-black/[0.06] pt-2">
              <SourceLine source={entry.source} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RegistryIdentifierList({
  identifiers,
}: {
  identifiers: NonNullable<MedicineBackgroundContextView['registryIdentifiers']>
}) {
  return (
    <div className="space-y-3">
      <dl className="grid min-w-0 gap-x-6 gap-y-2 text-sm leading-6 sm:grid-cols-2">
        {identifiers.rows.map((row) => (
          <div key={row.label} className="min-w-0">
            <dt className="text-[#6E6E73]">{row.label}</dt>
            <dd className="break-all font-mono font-semibold text-[#1D1D1F]">{row.value}</dd>
          </div>
        ))}
      </dl>
      <SourceLine source={identifiers.source} />
    </div>
  )
}

/**
 * A statement quoted from a source. It is rendered as a quotation because that is what it is: the
 * recorded text and the fetched excerpt are the same characters, and nothing was rewritten.
 */
function QuotedStatement({ text, source }: { text: string; source: RecordedSourceView }) {
  return (
    <li className="min-w-0 space-y-2 rounded-2xl border border-black/[0.08] bg-white p-4">
      <blockquote className="border-l-2 border-black/[0.12] pl-3 text-[15px] leading-7 text-[#1D1D1F]">
        “{text}”
      </blockquote>
      <SourceLine source={source} />
    </li>
  )
}

export function BackgroundMechanismBody({
  mechanism,
}: {
  mechanism: NonNullable<MedicineBackgroundContextView['mechanism']>
}) {
  return (
    <div className="space-y-4">
      <ul className="grid min-w-0 gap-3">
        {mechanism.statements.map((statement, index) => (
          <QuotedStatement key={index} text={statement.text} source={statement.source} />
        ))}
      </ul>
      {mechanism.namedTargets && (
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6E6E73]">
            Named in the wording above
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {mechanism.namedTargets.map((target) => (
              <li
                key={target}
                className="rounded-full border border-black/[0.1] bg-[#F5F5F7] px-2.5 py-1 font-mono text-[11px] font-semibold leading-4 text-[#515154]"
              >
                {target}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-sm leading-6 text-[#6E6E73]">{ROW_BOUNDARY}</p>
    </div>
  )
}

export function BackgroundMolecularIdentityBody({
  identity,
}: {
  identity: NonNullable<MedicineBackgroundContextView['molecularIdentity']>
}) {
  return (
    <div className="space-y-4">
      <ul className="grid min-w-0 gap-3 sm:grid-cols-2">
        {identity.values.map((value) => (
          <RecordedValueCard key={value.label} value={value} />
        ))}
      </ul>
      <p className="text-sm leading-6 text-[#6E6E73]">{ROW_BOUNDARY}</p>
    </div>
  )
}

export function BackgroundInteractionSignalsBody({
  signals,
}: {
  signals: NonNullable<MedicineBackgroundContextView['interactionSignals']>
}) {
  return (
    <div className="space-y-5">
      {signals.groups.map((group) => (
        <section key={group.kindLabel} className="min-w-0 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6E6E73]">
            {group.kindLabel}
          </h4>
          <ul className="grid min-w-0 gap-3">
            {group.entries.map((entry) => (
              <li
                key={entry.counterparty}
                className="min-w-0 space-y-2 rounded-2xl border border-black/[0.08] bg-white p-4"
              >
                <p className="font-mono text-base font-semibold text-[#1D1D1F]">
                  {entry.counterparty}
                </p>
                <p className="text-sm leading-6 text-[#515154]">
                  {entry.roleLabel ?? 'The source names it without stating a single role'}
                </p>
                <SourceLine source={entry.source} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-sm leading-6 text-[#6E6E73]">{ROW_BOUNDARY}</p>
    </div>
  )
}

export function BackgroundSafetyBody({
  safety,
}: {
  safety: NonNullable<MedicineBackgroundContextView['safety']>
}) {
  return (
    <div className="space-y-5">
      {safety.boxedWarning && (
        <section aria-labelledby="background-boxed-warning-heading" className="min-w-0 space-y-3">
          <h4
            id="background-boxed-warning-heading"
            className="text-xs font-semibold uppercase tracking-wide text-[#8A4B00]"
          >
            The strongest warning on this source
          </h4>
          <ul className="grid min-w-0 gap-3">
            <QuotedStatement text={safety.boxedWarning.text} source={safety.boxedWarning.source} />
          </ul>
        </section>
      )}
      {safety.contraindications && (
        <section
          aria-labelledby="background-contraindications-heading"
          className="min-w-0 space-y-3"
        >
          <h4
            id="background-contraindications-heading"
            className="text-xs font-semibold uppercase tracking-wide text-[#6E6E73]"
          >
            Situations the source says it must not be used in
          </h4>
          <ul className="grid min-w-0 gap-3">
            {safety.contraindications.map((statement, index) => (
              <QuotedStatement key={index} text={statement.text} source={statement.source} />
            ))}
          </ul>
        </section>
      )}
      <p className="text-sm leading-6 text-[#6E6E73]">{ROW_BOUNDARY}</p>
    </div>
  )
}

export function BackgroundPopulationStatementsBody({
  statements,
}: {
  statements: NonNullable<MedicineBackgroundContextView['populationStatements']>
}) {
  return (
    <div className="space-y-4">
      <ul className="grid min-w-0 gap-3">
        {statements.map((statement) => (
          <li
            key={statement.populationLabel}
            className="min-w-0 space-y-2 rounded-2xl border border-black/[0.08] bg-white p-4"
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-[#1D1D1F]">{statement.populationLabel}</p>
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-4 ${
                  statement.unresolved
                    ? 'border-[#F0D89A] bg-[#FFF8E7] text-[#8A4B00]'
                    : 'border-black/[0.1] bg-[#F5F5F7] text-[#515154]'
                }`}
              >
                {statement.stateLabel}
              </span>
            </div>
            <blockquote className="border-l-2 border-black/[0.12] pl-3 text-[15px] leading-7 text-[#1D1D1F]">
              “{statement.text}”
            </blockquote>
            <SourceLine source={statement.source} />
          </li>
        ))}
      </ul>
      <p className="text-sm leading-6 text-[#6E6E73]">{ROW_BOUNDARY}</p>
    </div>
  )
}

export function BackgroundCommonAdverseReactionsBody({
  reactions,
}: {
  reactions: NonNullable<MedicineBackgroundContextView['commonAdverseReactions']>
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-[#515154]">
        Reported at or above the rate the source printed:{' '}
        <span className="font-mono font-semibold text-[#1D1D1F]">{reactions.threshold}</span>
      </p>
      <ul className="flex flex-wrap gap-2">
        {reactions.events.map((event) => (
          <li
            key={event}
            className="rounded-full border border-black/[0.1] bg-[#F5F5F7] px-3 py-1 text-sm font-semibold leading-5 text-[#1D1D1F]"
          >
            {event}
          </li>
        ))}
      </ul>
      <SourceLine source={reactions.source} />
      <p className="text-sm leading-6 text-[#6E6E73]">{ROW_BOUNDARY}</p>
    </div>
  )
}

/**
 * What the label says the medicine is for, quoted.
 *
 * A label stating a use is a fact about the label. It is not evidence the medicine works, and the
 * closing line says so rather than leaving a reader to assume otherwise from a list of indications.
 */
export function BackgroundRecordedUsesBody({
  uses,
}: {
  uses: NonNullable<MedicineBackgroundContextView['recordedUses']>
}) {
  return (
    <div className="space-y-4">
      <ul className="grid min-w-0 gap-3">
        {uses.statements.map((statement, index) => (
          <QuotedStatement key={index} text={statement.text} source={statement.source} />
        ))}
      </ul>
      <p className="text-sm leading-6 text-[#6E6E73]">
        This is what the label states the medicine is for. Whether it works for that is not
        something a label settles and is not recorded here. {ROW_BOUNDARY}
      </p>
    </div>
  )
}

/**
 * What every published label says for a field, side by side.
 *
 * The point of this row is the thing a single-source record throws away: that fifty-nine labels
 * agree, or that two of them do not. Readings are shown in the order the record stores them, which
 * is most-supported first, and no reading is marked correct.
 */
export function BackgroundSourceConsensusBody({
  consensus,
}: {
  consensus: NonNullable<MedicineBackgroundContextView['sourceConsensus']>
}) {
  return (
    <div className="space-y-5">
      <p className="text-[15px] leading-7 text-[#1D1D1F]">{consensus.documentsExaminedLabel}.</p>
      {consensus.fields.map((field) => (
        <section key={field.fieldLabel} className="min-w-0 space-y-3">
          <div className="min-w-0">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6E6E73]">
              {field.fieldLabel}
            </h4>
            <p className="mt-1 text-sm leading-6 text-[#515154]">{field.agreementLabel}</p>
          </div>
          {field.disagreementNote && (
            <p className="rounded-2xl border border-[#F0D89A] bg-[#FFF8E7] px-4 py-3 text-sm leading-6 text-[#8A4B00]">
              {field.disagreementNote}
            </p>
          )}
          <ul className="grid min-w-0 gap-3">
            {field.readings.map((reading) => (
              <li
                key={reading.display}
                className="min-w-0 space-y-2 rounded-2xl border border-black/[0.08] bg-white p-4"
              >
                <p className="break-words font-mono text-base font-semibold text-[#1D1D1F]">
                  {reading.display}
                </p>
                <p className="text-sm leading-6 text-[#515154]">{reading.supportLabel}</p>
                <ul className="space-y-2">
                  {reading.sources.map((source, index) => (
                    <li key={`${source.identifier}-${index}`}>
                      <SourceLine source={source} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-sm leading-6 text-[#6E6E73]">
        Agreement between labels is not proof that a number is right — manufacturers often copy the
        same originator wording. It is a record of what the published labels say. {ROW_BOUNDARY}
      </p>
    </div>
  )
}

/** A short list of values the archive states, rendered as chips rather than prose. */
function ChipList({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6E6E73]">{label}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => (
          <li
            key={value}
            className="rounded-full border border-black/[0.1] bg-[#F5F5F7] px-3 py-1 text-sm font-semibold leading-5 text-[#1D1D1F]"
          >
            {value}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BackgroundLabelPresenceBody({
  presence,
}: {
  presence: NonNullable<MedicineBackgroundContextView['labelPresence']>
}) {
  return (
    <div className="space-y-4">
      <p className="text-[15px] leading-7 text-[#1D1D1F]">
        <span className="font-semibold">{presence.labelCountLabel}</span> this as an active
        ingredient. {presence.aloneLabel}.
      </p>
      {presence.noSoleSourceNote && (
        <p className="rounded-2xl bg-[#F5F5F7] px-4 py-3 text-sm leading-6 text-[#424245]">
          {presence.noSoleSourceNote}
        </p>
      )}
      <ChipList label="Kinds of product" values={presence.productTypes} />
      <ChipList label="Routes those labels state" values={presence.routes} />
      {presence.mostRecentLabelDate && (
        <p className="text-sm leading-6 text-[#515154]">
          Most recent label among them: {presence.mostRecentLabelDate}
        </p>
      )}
      <SourceLine source={presence.source} />
      <p className="text-sm leading-6 text-[#6E6E73]">
        A label existing in the archive does not mean the product was approved or found effective —
        unapproved and homeopathic products are published there alongside approved medicines.{' '}
        {ROW_BOUNDARY}
      </p>
    </div>
  )
}

export function BackgroundSupplementMarketBody({
  market,
}: {
  market: NonNullable<MedicineBackgroundContextView['supplementMarket']>
}) {
  return (
    <div className="space-y-4">
      <p className="text-[15px] leading-7 text-[#1D1D1F]">
        <span className="font-semibold">{market.labelCountLabel}</span>.
      </p>
      <ChipList label="How the database classifies it" values={market.categories} />
      <ChipList label="Kinds of claim those labels carry" values={market.claimTypes} />
      <ChipList label="Some of the brands" values={market.brands} />
      <p className="rounded-2xl bg-[#F5F5F7] px-4 py-3 text-sm leading-6 text-[#424245]">
        {market.claimNote}
      </p>
      <SourceLine source={market.source} />
      <p className="text-sm leading-6 text-[#6E6E73]">{ROW_BOUNDARY}</p>
    </div>
  )
}

/**
 * Every active ingredient, with the data recorded for each one.
 *
 * A product with six ingredients gets six entries. An ingredient no source describes on its own
 * says so in its own words rather than appearing as an empty heading, because an absent section
 * cannot tell a reader whether anybody looked.
 */
export function BackgroundCompositionBody({
  composition,
}: {
  composition: NonNullable<MedicineBackgroundContextView['composition']>
}) {
  return (
    <div className="space-y-5">
      <p className="text-[15px] leading-7 text-[#1D1D1F]">{composition.summary}</p>
      <ol className="grid min-w-0 gap-4">
        {composition.ingredients.map((ingredient, index) => (
          <li
            key={`${ingredient.name}-${index}`}
            className="min-w-0 space-y-3 rounded-2xl border border-black/[0.08] bg-white p-4"
          >
            <div className="min-w-0">
              <p className="break-words text-base font-semibold text-[#1D1D1F]">
                {ingredient.name}
              </p>
              {ingredient.strength && (
                <p className="mt-1 font-mono text-sm text-[#515154]">{ingredient.strength}</p>
              )}
              <p className="mt-1 text-sm leading-6 text-[#6E6E73]">{ingredient.dataStateLabel}</p>
            </div>

            {ingredient.uses && (
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6E6E73]">
                  What its own label says it is for
                </p>
                <ul className="grid min-w-0 gap-3">
                  {ingredient.uses.map((statement, statementIndex) => (
                    <QuotedStatement
                      key={statementIndex}
                      text={statement.text}
                      source={statement.source}
                    />
                  ))}
                </ul>
              </div>
            )}

            {ingredient.mechanism && (
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6E6E73]">
                  How a source describes it working
                </p>
                <ul className="grid min-w-0 gap-3">
                  {ingredient.mechanism.map((statement, statementIndex) => (
                    <QuotedStatement
                      key={statementIndex}
                      text={statement.text}
                      source={statement.source}
                    />
                  ))}
                </ul>
              </div>
            )}

            {ingredient.pharmacokinetics && (
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6E6E73]">
                  What the body does with it
                </p>
                <ul className="grid min-w-0 gap-3 sm:grid-cols-2">
                  {ingredient.pharmacokinetics.map((value) => (
                    <RecordedValueCard key={value.label} value={value} />
                  ))}
                </ul>
              </div>
            )}

            {ingredient.molecularIdentity && (
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6E6E73]">
                  Recorded chemical identity
                </p>
                <ul className="grid min-w-0 gap-3 sm:grid-cols-2">
                  {ingredient.molecularIdentity.map((value) => (
                    <RecordedValueCard key={value.label} value={value} />
                  ))}
                </ul>
              </div>
            )}

            {ingredient.interactions && (
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6E6E73]">
                  Enzymes and transporters the source names
                </p>
                <ul className="grid min-w-0 gap-3">
                  {ingredient.interactions.map((entry, entryIndex) => (
                    <li
                      key={`${entry.counterparty}-${entryIndex}`}
                      className="min-w-0 space-y-2 rounded-2xl border border-black/[0.08] bg-[#FBFBFD] p-3"
                    >
                      <p className="font-mono text-sm font-semibold text-[#1D1D1F]">
                        {entry.counterparty}
                      </p>
                      <p className="text-sm leading-6 text-[#515154]">
                        {entry.roleLabel ?? 'The source names it without stating a single role'}
                      </p>
                      <SourceLine source={entry.source} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ol>
      <p className="text-sm leading-6 text-[#6E6E73]">
        Each ingredient&rsquo;s data comes from sources about that ingredient, not from the combined
        product&rsquo;s label. {ROW_BOUNDARY}
      </p>
    </div>
  )
}
