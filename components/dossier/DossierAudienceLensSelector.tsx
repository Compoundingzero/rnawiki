'use client'

import { useId, useState } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'

import type {
  DossierAudienceEvidenceState,
  DossierAudienceLens,
  DossierAudienceLensProjection,
  DossierAudienceProjectionRecordKind,
  DossierAudienceSourceProjection,
} from '@/lib/dossier-audience-lenses'
import {
  ordinaryReaderGlossaryEntriesForProjection,
  type OrdinaryReaderGlossaryEntry,
} from '@/lib/dossier-ordinary-reader-glossary'

const stateTone: Record<DossierAudienceEvidenceState, string> = {
  recorded: 'border-black/[0.1] bg-white text-[#424245]',
  measured: 'border-[#B8D7F6] bg-[#EFF7FF] text-[#174D7A]',
  derived: 'border-[#D8C9F0] bg-[#F7F2FC] text-[#5B397A]',
  reviewed: 'border-[#B8E7CB] bg-[#EDF8F2] text-[#16764A]',
  not_recorded: 'border-black/[0.1] bg-[#F5F5F7] text-[#515154]',
  ambiguous: 'border-[#F0D89A] bg-[#FFF8E7] text-[#8A4B00]',
  conflicting: 'border-[#E8C6AA] bg-[#FFF4EA] text-[#8A451A]',
  stale: 'border-[#E4D79F] bg-[#FFFBE9] text-[#765B08]',
}

const recordKindLabel: Record<DossierAudienceProjectionRecordKind, string> = {
  medical_evidence: 'Medical or evidence record',
  identity: 'Canonical identity record',
  operational: 'Review or freshness record',
  missing: 'Explicit coverage gap',
}

function readableState(value: DossierAudienceSourceProjection['freshness']): string {
  if (value === 'current') return 'Current'
  if (value === 'stale') return 'Needs rechecking'
  if (value === 'review_required') return 'Review required'
  if (value === 'unknown') return 'Unknown'
  return 'Not recorded for this source'
}

function SourceProjection({ source }: { source: DossierAudienceSourceProjection }) {
  return (
    <li className="min-w-0 border-t border-black/[0.07] py-3 first:border-t-0 first:pt-0 last:pb-0">
      {source.href ? (
        <a
          href={source.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 max-w-full items-center gap-1 break-words font-semibold text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
        >
          {source.label}
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <p className="break-words font-semibold text-[#424245]">{source.label}</p>
      )}
      <dl className="mt-1 grid min-w-0 gap-x-5 gap-y-1 text-xs leading-5 text-[#515154] sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="inline text-[#6E6E73]">Identifier: </dt>
          <dd className="inline break-all font-mono">{source.identifier ?? 'Not recorded'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="inline text-[#6E6E73]">Source version: </dt>
          <dd className="inline break-all font-mono">{source.version ?? 'Not recorded'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="inline text-[#6E6E73]">Source effective date: </dt>
          <dd className="inline">{source.effectiveDate ?? 'Not recorded'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="inline text-[#6E6E73]">Freshness: </dt>
          <dd className="inline font-semibold">{readableState(source.freshness)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="inline text-[#6E6E73]">Retrieved: </dt>
          <dd className="inline">{source.retrievedAt ?? 'Not recorded'}</dd>
        </div>
        {source.verifiedAt && (
          <div className="min-w-0">
            <dt className="inline text-[#6E6E73]">Last verified: </dt>
            <dd className="inline">{source.verifiedAt}</dd>
          </div>
        )}
        {source.snapshotHash && (
          <div className="min-w-0">
            <dt className="inline text-[#6E6E73]">Snapshot hash: </dt>
            <dd className="inline break-all font-mono">{source.snapshotHash}</dd>
          </div>
        )}
      </dl>
      {source.excerpt && (
        <blockquote className="mt-2 border-l-2 border-black/[0.14] pl-3 text-sm leading-6 text-[#515154]">
          {source.excerpt}
        </blockquote>
      )}
    </li>
  )
}

function OrdinaryReaderGlossary({
  entries,
  headingId,
}: {
  entries: readonly OrdinaryReaderGlossaryEntry[]
  headingId: string
}) {
  if (entries.length === 0) return null

  return (
    <section
      aria-labelledby={headingId}
      className="mt-5 rounded-xl border border-[#B8D7F6] bg-[#EFF7FF] p-3 sm:p-4"
      data-testid="ordinary-reader-glossary"
    >
      <h3 id={headingId} className="text-sm font-semibold leading-6 text-[#174D7A]">
        Plain-language help for terms in this view
      </h3>
      <p className="mt-1 text-xs leading-5 text-[#424245]">
        Open a term for its reviewed meaning. The evidence wording and quoted source text below stay
        unchanged.
      </p>
      <ul className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
        {entries.map((entry) => (
          <li key={entry.id} className="min-w-0">
            <details
              className="group/glossary min-w-0 rounded-lg border border-[#B8D7F6] bg-white"
              data-glossary-entry={entry.id}
            >
              <summary
                aria-label={`Explain ${entry.term}`}
                className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-left text-sm font-semibold leading-5 text-[#174D7A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0A66D8] [&::-webkit-details-marker]:hidden"
                data-glossary-term={entry.id}
              >
                <span className="min-w-0 break-words">{entry.term}</span>
                <ChevronDown
                  className="h-4 w-4 shrink-0 transition-transform group-open/glossary:rotate-180 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <p
                className="border-t border-[#B8D7F6] px-3 py-3 text-sm leading-6 text-[#424245]"
                data-glossary-definition={entry.id}
              >
                {entry.definition}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function DossierAudienceLensSelector({
  projections,
}: {
  projections: readonly DossierAudienceLensProjection[]
}) {
  const groupId = useId()
  const [selectedLens, setSelectedLens] = useState<DossierAudienceLens>(
    projections[0]?.lens ?? 'ordinary',
  )
  const selected =
    projections.find((projection) => projection.lens === selectedLens) ?? projections[0]
  if (!selected) return null

  const panelHeadingId = `${groupId}-projection-heading`
  const ordinaryGlossary = ordinaryReaderGlossaryEntriesForProjection(selected)

  return (
    <section
      aria-labelledby={`${groupId}-legend`}
      className="mt-5 min-w-0 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] p-2 sm:p-3"
      data-testid="dossier-audience-lenses"
    >
      <fieldset aria-label="Choose a reading lens" className="min-w-0">
        <legend
          id={`${groupId}-legend`}
          className="px-2 pb-2 text-sm font-semibold leading-6 text-[#1D1D1F]"
        >
          Choose a reading lens
        </legend>
        <div className="grid min-w-0 grid-cols-1 gap-1 min-[460px]:grid-cols-2 xl:grid-cols-4">
          {projections.map((projection) => {
            const checked = projection.lens === selected.lens
            return (
              <label key={projection.lens} className="relative min-w-0 cursor-pointer">
                <input
                  type="radio"
                  name={`${groupId}-audience-lens`}
                  value={projection.lens}
                  checked={checked}
                  onChange={() => setSelectedLens(projection.lens)}
                  data-audience-lens={projection.lens}
                  aria-controls={`${groupId}-projection-panel`}
                  className="peer sr-only"
                />
                <span
                  className={`flex min-h-14 min-w-0 flex-col justify-center rounded-xl border px-3 py-2 text-left transition-colors motion-reduce:transition-none peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#0A66D8] peer-focus-visible:ring-offset-2 ${
                    checked
                      ? 'border-[#0A66D8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                      : 'border-transparent bg-white/70 hover:border-black/[0.12] hover:bg-white'
                  }`}
                >
                  <span className="[overflow-wrap:anywhere] text-xs font-semibold leading-5 text-[#1D1D1F]">
                    {projection.label}
                  </span>
                  <span className="[overflow-wrap:anywhere] text-[11px] leading-4 text-[#6E6E73]">
                    {projection.description}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div
        id={`${groupId}-projection-panel`}
        aria-labelledby={panelHeadingId}
        className="mt-3 min-w-0 rounded-xl bg-white p-4 sm:p-5"
        data-testid="dossier-audience-projection"
        data-selected-audience-lens={selected.lens}
      >
        <p className="sr-only" aria-live="polite">
          {selected.label} projection selected.
        </p>
        <div className="flex min-w-0 flex-col gap-3 border-b border-black/[0.08] pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0066CC]">
              Selected projection
            </p>
            <h2
              id={panelHeadingId}
              className="mt-1 [overflow-wrap:anywhere] text-xl font-semibold tracking-[-0.02em] text-[#1D1D1F]"
            >
              {selected.label}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#515154]">
              This view groups fields from the same canonical medicine record. It does not rewrite,
              resolve or hide the full record.
            </p>
          </div>
          <a
            href={selected.href}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-semibold text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
          >
            Continue in the full record
          </a>
        </div>

        {selected.lens === 'ordinary' && (
          <OrdinaryReaderGlossary
            entries={ordinaryGlossary}
            headingId={`${groupId}-ordinary-glossary-heading`}
          />
        )}

        <div className="mt-5 space-y-7">
          {selected.sections.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`${groupId}-${selected.lens}-${section.id}`}
              data-projection-section={section.id}
            >
              <h3
                id={`${groupId}-${selected.lens}-${section.id}`}
                className="text-base font-semibold leading-6 text-[#1D1D1F]"
              >
                {section.heading}
              </h3>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[#515154]">
                {section.description}
              </p>
              <p className="mt-1 break-words text-xs leading-5 text-[#6E6E73]">
                Required fields: {section.requiredFields.join(' · ')}
              </p>

              <ul className="mt-3 space-y-3">
                {section.records.map((item) => (
                  <li
                    key={item.id}
                    className="min-w-0 rounded-xl border border-black/[0.08] p-4"
                    data-projection-record={item.id}
                    data-projection-record-kind={item.recordKind}
                  >
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h4 className="break-words text-sm font-semibold leading-6 text-[#1D1D1F]">
                          {item.heading}
                        </h4>
                        {item.summary && (
                          <p className="mt-1 break-words text-sm leading-6 text-[#424245]">
                            {item.summary}
                          </p>
                        )}
                      </div>
                      <span
                        className={`w-fit shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-5 ${stateTone[item.evidenceState]}`}
                      >
                        {item.evidenceStateLabel}
                      </span>
                    </div>

                    {item.facts.length > 0 && (
                      <dl className="mt-3 grid min-w-0 gap-x-5 gap-y-2 text-sm leading-6 sm:grid-cols-2">
                        {item.facts.map((fact, index) => (
                          <div key={`${item.id}-${fact.label}-${index}`} className="min-w-0">
                            <dt className="text-[#6E6E73]">{fact.label}</dt>
                            <dd className="break-words font-semibold text-[#424245]">
                              {fact.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    <dl className="mt-3 grid min-w-0 gap-x-5 gap-y-2 border-t border-black/[0.07] pt-3 text-xs leading-5 sm:grid-cols-2">
                      <div className="min-w-0">
                        <dt className="text-[#6E6E73]">Scope</dt>
                        <dd className="break-words font-semibold text-[#424245]">{item.scope}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-[#6E6E73]">Canonical field</dt>
                        <dd className="break-all font-mono text-[#424245]">
                          {item.canonicalFields.join(' · ')}
                        </dd>
                      </div>
                      <div className="min-w-0 sm:col-span-2">
                        <dt className="text-[#6E6E73]">Projection record type</dt>
                        <dd className="font-semibold text-[#424245]">
                          {recordKindLabel[item.recordKind]}
                        </dd>
                      </div>
                      <div className="min-w-0 sm:col-span-2">
                        <dt className="text-[#6E6E73]">Observed or derived status</dt>
                        <dd className="font-semibold text-[#424245]">{item.evidenceStateLabel}</dd>
                      </div>
                    </dl>

                    {item.provenanceNote && (
                      <p className="mt-2 text-xs leading-5 text-[#6E6E73]">{item.provenanceNote}</p>
                    )}

                    <div className="mt-3 border-t border-black/[0.07] pt-3">
                      <h5 className="text-xs font-semibold leading-5 text-[#424245]">
                        Exact source binding
                      </h5>
                      {item.sources.length > 0 ? (
                        <ul className="mt-2">
                          {item.sources.map((source) => (
                            <SourceProjection key={source.id} source={source} />
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-xs leading-5 text-[#6E6E73]">
                          Not recorded for this field.
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}
