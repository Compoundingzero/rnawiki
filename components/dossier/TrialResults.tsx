import { ExternalLink } from 'lucide-react'

import { TRIAL_RESULTS_ORDER_SENTENCE } from '@/lib/dossier'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import { resolveRecordedSourceLocator } from '@/lib/source-locator'
import type {
  TrialResultOutcome,
  TrialResultRecord,
  TrialResultsView,
  TrialStatedComparison,
} from '@/lib/types'

/**
 * The values sponsors posted to ClinicalTrials.gov for the studies this record reaches.
 *
 * Everything here is transcribed. A number on this surface is the number the sponsor posted, in the
 * unit they posted it, attributed to the group they attributed it to. RNAWiki computes no effect
 * size, compares no two arms and never says what a study showed. Where the registry itself states a
 * between-group difference, that stated difference is carried across with the submitter's own
 * description of what was compared — it is quoted, not endorsed, and never turned into a claim
 * about the medicine.
 *
 * A record that matched registrations but has no usable posted result still renders this section
 * and says so, because the absence is a fact about the evidence and hiding it would read as though
 * the question had not been asked.
 *
 * REGISTERED TITLES ARE NOT PRINTED, for the same reason the registrations surface withholds them:
 * 18.1% of the qualifying studies carry a title such as "A Study to Evaluate the Efficacy and
 * Safety of ...", and printing it would put a characterisation of a result on the page under the
 * sponsor's wording. Each study is named by its registration identifier, which links out to the
 * full record. The title stays in the stored row and the machine-readable record.
 */

const OUTCOME_TYPE_LABELS: Record<string, string> = {
  PRIMARY: 'Main measure',
  SECONDARY: 'Additional measure',
  OTHER_PRE_SPECIFIED: 'Other pre-specified measure',
  POST_HOC: 'Measure added after the study',
}

const PARAM_TYPE_LABELS: Record<string, string> = {
  NUMBER: 'number',
  MEAN: 'mean',
  MEDIAN: 'median',
  GEOMETRIC_MEAN: 'geometric mean',
  LEAST_SQUARES_MEAN: 'least-squares mean',
  COUNT_OF_PARTICIPANTS: 'count of participants',
  COUNT_OF_UNITS: 'count of units',
  GEOMETRIC_LEAST_SQUARES_MEAN: 'geometric least-squares mean',
}

const PHASE_LABELS: Record<string, string> = {
  EARLY_PHASE1: 'Early phase 1',
  PHASE1: 'Phase 1',
  PHASE2: 'Phase 2',
  PHASE3: 'Phase 3',
  PHASE4: 'Phase 4',
  NA: 'No phase assigned',
}

const ALLOCATION_LABELS: Record<string, string> = {
  RANDOMIZED: 'randomised',
  NON_RANDOMIZED: 'not randomised',
  NA: 'no allocation to groups',
}

const MASKING_LABELS: Record<string, string> = {
  NONE: 'open label',
  SINGLE: 'one party masked',
  DOUBLE: 'two parties masked',
  TRIPLE: 'three parties masked',
  QUADRUPLE: 'four parties masked',
}

function humanise(code: string): string {
  return code.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
}

function label(map: Record<string, string>, code: string | null | undefined): string | undefined {
  if (!code) return undefined
  return map[code] ?? humanise(code)
}

function registryHref(nctId: string): string | null {
  return resolveRecordedSourceLocator('CLINICALTRIALS', nctId)?.href ?? null
}

/**
 * One posted number, exactly as posted: the value, then whatever the registry attached to it. The
 * dispersion label comes from the measure, so a spread is never silently read as a deviation.
 */
function valueText(
  value: TrialResultRecord['outcomes'][number]['values'][number],
  outcome: TrialResultOutcome,
): string {
  const parts = [value.value]
  if (value.spread) {
    const kind = outcome.dispersionType ? outcome.dispersionType.toLowerCase() : 'spread'
    parts.push(`(${kind} ${value.spread})`)
  }
  if (value.lowerLimit && value.upperLimit) {
    const kind = outcome.dispersionType?.toLowerCase().includes('confidence')
      ? outcome.dispersionType.toLowerCase()
      : 'interval'
    parts.push(`(${kind} ${value.lowerLimit} to ${value.upperLimit})`)
  }
  return parts.join(' ')
}

function OutcomeBlock({ outcome }: { outcome: TrialResultOutcome }) {
  const kind = label(OUTCOME_TYPE_LABELS, outcome.type) ?? 'Measure'
  const param = label(PARAM_TYPE_LABELS, outcome.paramType)
  const unit = outcome.unitOfMeasure
  const reported = [param, unit].filter(Boolean).join(', ')
  return (
    <li className="min-w-0 py-4" data-testid="trial-result-outcome">
      <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#6E6E73]">{kind}</p>
      <p className="mt-1 min-w-0 break-words text-base font-semibold leading-6 text-[#1D1D1F]">
        {outcome.title}
      </p>
      {outcome.timeFrame && (
        <p className="mt-1 text-sm leading-6 text-[#6E6E73]">Measured over: {outcome.timeFrame}</p>
      )}
      {reported && (
        <p className="mt-0.5 text-sm leading-6 text-[#6E6E73]">Reported as: {reported}</p>
      )}
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[20rem] border-collapse text-left">
          <caption className="sr-only">
            Values posted for “{outcome.title}”, one row per group
          </caption>
          <thead>
            <tr className="border-b border-black/[0.08]">
              <th scope="col" className="py-1.5 pr-4 text-sm font-semibold text-[#6E6E73]">
                Group
              </th>
              <th scope="col" className="py-1.5 pr-4 text-sm font-semibold text-[#6E6E73]">
                Posted value
              </th>
            </tr>
          </thead>
          <tbody>
            {outcome.values.map((value, index) => (
              <tr
                key={`${value.groupTitle ?? 'group'}-${value.classTitle ?? ''}-${value.categoryTitle ?? ''}-${index}`}
                className="border-b border-black/[0.05] last:border-0"
              >
                <th
                  scope="row"
                  className="min-w-0 break-words py-1.5 pr-4 text-base font-normal leading-6 text-[#515154] [overflow-wrap:anywhere]"
                >
                  {value.groupTitle ?? 'Group not named'}
                  {(value.classTitle || value.categoryTitle) && (
                    <span className="block text-sm text-[#6E6E73]">
                      {[value.classTitle, value.categoryTitle].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </th>
                <td className="py-1.5 pr-4 text-base leading-6 text-[#1D1D1F] [overflow-wrap:anywhere]">
                  {valueText(value, outcome)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {outcome.statedComparisons.length > 0 && (
        <div className="mt-3 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] p-3">
          <p className="text-sm font-semibold leading-6 text-[#515154]">
            Comparison stated by the people who ran the study
          </p>
          <ul className="mt-1 space-y-2">
            {outcome.statedComparisons.map((comparison, index) => (
              <li key={index} className="text-base leading-7 text-[#515154]">
                <ComparisonText comparison={comparison} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}

/**
 * The registry's own stated difference, printed as its parts. The sponsor's description of what
 * was compared is quoted so the reader can see whose claim it is.
 */
function ComparisonText({ comparison }: { comparison: TrialStatedComparison }) {
  const groups = comparison.groupTitles.filter((title): title is string => Boolean(title))
  const parts: string[] = []
  if (comparison.paramType && comparison.paramValue) {
    parts.push(`${comparison.paramType}: ${comparison.paramValue}`)
  }
  if (comparison.ciLowerLimit && comparison.ciUpperLimit) {
    const pct = comparison.ciPctValue ? `${comparison.ciPctValue}% ` : ''
    parts.push(`${pct}confidence interval ${comparison.ciLowerLimit} to ${comparison.ciUpperLimit}`)
  }
  if (comparison.dispersionType && comparison.dispersionValue) {
    parts.push(`${comparison.dispersionType.toLowerCase()} ${comparison.dispersionValue}`)
  }
  if (comparison.pValue) parts.push(`p value ${comparison.pValue}`)
  if (comparison.statisticalMethod) parts.push(`method: ${comparison.statisticalMethod}`)
  return (
    <>
      {groups.length > 0 && <span className="font-medium">{groups.join(' vs ')}. </span>}
      {parts.join('; ')}
      {comparison.groupDescription && (
        <span className="mt-1 block text-sm leading-6 text-[#6E6E73]">
          Their description: “{comparison.groupDescription}”
        </span>
      )}
    </>
  )
}

function StudyBlock({ study, index }: { study: TrialResultRecord; index: number }) {
  const href = registryHref(study.nctId)
  const phases = study.phases
    .map((phase) => label(PHASE_LABELS, phase) ?? phase)
    .filter((phase) => phase !== PHASE_LABELS.NA)
  const design = [
    phases.join(' / ') || undefined,
    label(ALLOCATION_LABELS, study.allocation),
    label(MASKING_LABELS, study.masking),
    study.armCount > 0
      ? `${study.armCount} ${study.armCount === 1 ? 'group' : 'groups'}`
      : undefined,
  ].filter(Boolean)
  const serious = study.adverseEvents.perArm.filter(
    (group) => group.seriousAffected !== null && group.seriousAtRisk !== null,
  )
  const notShown = study.secondaryOutcomeCount - study.secondaryOutcomesShown
  return (
    <li
      id={`trial-result-${study.nctId}`}
      className="min-w-0 scroll-mt-24 py-6"
      data-testid="trial-result-study"
    >
      <h4 className="min-w-0 break-words text-base font-semibold leading-6 text-[#1D1D1F]">
        <span className="text-[#6E6E73]">{index + 1}. </span>
        Registration {study.nctId}
      </h4>
      <p className="mt-1 text-sm leading-6 text-[#6E6E73]">
        {[
          study.enrolment.count !== null
            ? `${study.enrolment.count.toLocaleString('en-US')} people took part`
            : null,
          design.join(', ') || null,
          study.resultsFirstPosted ? `results posted ${study.resultsFirstPosted}` : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {href && (
        <p className="mt-1">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1 break-words text-base text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
          >
            Full results for {study.nctId} on ClinicalTrials.gov
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      )}

      <ul className="mt-2 divide-y divide-black/[0.06]">
        {study.outcomes.map((outcome, outcomeIndex) => (
          <OutcomeBlock key={`${study.nctId}-${outcomeIndex}`} outcome={outcome} />
        ))}
      </ul>

      {notShown > 0 && (
        <p className="mt-2 text-sm leading-6 text-[#6E6E73]">
          {notShown === 1
            ? '1 further additional measure was posted and is not listed here.'
            : `${notShown} further additional measures were posted and are not listed here.`}{' '}
          They are on the registry page for this study.
        </p>
      )}

      {serious.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <p className="text-sm font-semibold leading-6 text-[#515154]">
            Serious adverse events, as counted by the people who ran the study
          </p>
          <table className="mt-1 w-full min-w-[20rem] border-collapse text-left">
            <caption className="sr-only">
              Participants with at least one serious adverse event, per group
            </caption>
            <thead>
              <tr className="border-b border-black/[0.08]">
                <th scope="col" className="py-1.5 pr-4 text-sm font-semibold text-[#6E6E73]">
                  Group
                </th>
                <th scope="col" className="py-1.5 pr-4 text-sm font-semibold text-[#6E6E73]">
                  People affected, of people at risk
                </th>
              </tr>
            </thead>
            <tbody>
              {serious.map((group, groupIndex) => (
                <tr
                  key={`${study.nctId}-ae-${groupIndex}`}
                  className="border-b border-black/[0.05] last:border-0"
                >
                  <th
                    scope="row"
                    className="min-w-0 break-words py-1.5 pr-4 text-base font-normal leading-6 text-[#515154] [overflow-wrap:anywhere]"
                  >
                    {group.groupTitle ?? 'Group not named'}
                  </th>
                  <td className="py-1.5 pr-4 text-base leading-6 text-[#1D1D1F]">
                    {group.seriousAffected} of {group.seriousAtRisk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {study.publications.length > 0 && (
        <p className="mt-3 text-sm leading-6 text-[#6E6E73]">
          The registry links{' '}
          {study.publications.length === 1 ? 'this publication' : 'these publications'}:{' '}
          {study.publications.map((publication, publicationIndex) => (
            <span key={publication.pmid}>
              {publicationIndex > 0 && ', '}
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}/`}
                target="_blank"
                rel="noreferrer"
                className="text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
              >
                PubMed {publication.pmid}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </span>
          ))}
          .
        </p>
      )}
    </li>
  )
}

/** The framing sentence: what this is, and the one thing a reader must not read into it. */
export function trialResultsFraming(): string {
  return 'These are values the people who ran each study posted to ClinicalTrials.gov. Every number below is copied as posted, in the unit posted, for the group it was posted against. RNAWiki has not calculated anything from them, has not compared one group with another, and does not say what any study showed. A posted value is one study’s measurement, not a conclusion about this medicine.'
}

/** The cap sentence: the ordering rule, then how many qualifying studies sit beyond the list. */
export function trialResultsCapSentence(view: TrialResultsView): string {
  const shown = view.shown.length
  const beyond = view.totalQualifying - shown
  const listed =
    beyond <= 0
      ? `All ${shown === 1 ? '1 study with posted results is' : `${shown} studies with posted results are`} listed.`
      : `${shown} of ${view.totalQualifying.toLocaleString('en-US')} studies with posted results are listed here.`
  const rest =
    beyond > 0
      ? ` ${beyond.toLocaleString('en-US')} more ${beyond === 1 ? 'study has' : 'studies have'} posted results that are not listed on this page.`
      : ''
  return `${listed} ${TRIAL_RESULTS_ORDER_SENTENCE}${rest}`
}

export function TrialResults({ dossier }: { dossier: MedicineDossierViewModel }) {
  const view = dossier.trialResults
  if (!view) return null

  return (
    <section
      id="trial-results"
      aria-labelledby="trial-results-heading"
      className="scroll-mt-24 border-t border-black/[0.09] py-8 sm:py-10"
      data-testid="dossier-trial-results"
    >
      <div className="max-w-3xl space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#0066CC]">
          Trial registry
        </p>
        <h3
          id="trial-results-heading"
          className="text-2xl font-[650] leading-tight tracking-[-0.02em] text-[#1D1D1F] sm:text-[28px]"
        >
          Results posted for these trials
        </h3>
        <p className="max-w-2xl text-base leading-7 text-[#515154]">{trialResultsFraming()}</p>
        {view.shown.length > 0 ? (
          <p
            className="max-w-2xl text-base leading-7 text-[#515154]"
            data-testid="trial-results-cap"
          >
            {trialResultsCapSentence(view)}
          </p>
        ) : (
          <p
            className="max-w-2xl text-base leading-7 text-[#515154]"
            data-testid="trial-results-none"
          >
            {view.withResultsSection === 0
              ? 'None of the registered trials matched to this record has results posted on ClinicalTrials.gov. That is a fact about what has been posted, not about whether the medicine works.'
              : `${view.withResultsSection.toLocaleString('en-US')} of the registered trials matched to this record ${view.withResultsSection === 1 ? 'has a results section' : 'have a results section'} on ClinicalTrials.gov, but ${view.withResultsSection === 1 ? 'it does not carry' : 'none carries'} a main measure with a posted value and a recorded number of participants, so no value is shown here.`}
          </p>
        )}
      </div>

      {view.shown.length > 0 && (
        <ol
          className="mt-4 min-w-0 divide-y divide-black/[0.08] border-y border-black/[0.08]"
          aria-label="Studies with posted results, in the order stated above"
        >
          {view.shown.map((study, index) => (
            <StudyBlock key={study.nctId} study={study} index={index} />
          ))}
        </ol>
      )}

      <details className="mt-6 rounded-2xl border border-black/[0.08] bg-white p-4">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
          Technical record: results fetch
        </summary>
        <p className="mt-2 break-all font-mono text-[11px] leading-5 text-[#6E6E73]">
          {view.sourceIdentifier} · fetched {view.fetchedAt.slice(0, 10)} ·{' '}
          {view.withResultsSection} with a results section · {view.totalQualifying} qualifying ·{' '}
          {view.failedQualifyingBar} with a results section that carried no main measure value or no
          participant count · showing at most {view.shownLimit} studies and{' '}
          {view.secondaryShownLimit} additional measures each
        </p>
      </details>
    </section>
  )
}
