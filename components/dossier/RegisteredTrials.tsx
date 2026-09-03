import { ExternalLink } from 'lucide-react'

import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import { resolveRecordedSourceLocator } from '@/lib/source-locator'
import { TRIAL_REGISTRATIONS_ORDER_SENTENCE } from '@/lib/dossier'
import type { TrialRegistrationRecord, TrialRegistrationsView } from '@/lib/types'

/**
 * The registrations the stored registry pass matched, shown as structured registry facts.
 *
 * Everything on this surface is copied from the ClinicalTrials.gov record as the sponsor
 * registered it: what the study was listed for, its phase and design, how many people, who could
 * take part, the dates, the primary outcome measure as worded, the sponsor, the status, and
 * whether results are posted at the registry. The component translates registry vocabulary into
 * ordinary words and nothing else. It never reads a result, never says what a study showed and
 * never turns a registration into a statement about the medicine; the raw registry codes are kept
 * in a labelled technical disclosure so a reader can check the translation.
 */

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completed',
  RECRUITING: 'Recruiting',
  NOT_YET_RECRUITING: 'Not yet recruiting',
  ENROLLING_BY_INVITATION: 'Enrolling by invitation',
  ACTIVE_NOT_RECRUITING: 'Active, no longer recruiting',
  SUSPENDED: 'Suspended',
  TERMINATED: 'Stopped early',
  WITHDRAWN: 'Withdrawn before anyone enrolled',
  UNKNOWN: 'Status not updated at the registry',
  AVAILABLE: 'Available under expanded access',
  NO_LONGER_AVAILABLE: 'No longer available under expanded access',
  TEMPORARILY_NOT_AVAILABLE: 'Temporarily not available under expanded access',
  APPROVED_FOR_MARKETING: 'Approved for marketing (expanded access record)',
}

const STUDY_TYPE_LABELS: Record<string, string> = {
  INTERVENTIONAL: 'Interventional study',
  OBSERVATIONAL: 'Observational study',
  EXPANDED_ACCESS: 'Expanded access record',
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
  RANDOMIZED: 'Randomised',
  NON_RANDOMIZED: 'Not randomised',
  NA: 'No allocation to groups',
}

const MASKING_LABELS: Record<string, string> = {
  NONE: 'open label, nobody masked',
  SINGLE: 'one party masked',
  DOUBLE: 'two parties masked',
  TRIPLE: 'three parties masked',
  QUADRUPLE: 'four parties masked',
}

const PURPOSE_LABELS: Record<string, string> = {
  TREATMENT: 'treatment',
  PREVENTION: 'prevention',
  DIAGNOSTIC: 'diagnosis',
  SUPPORTIVE_CARE: 'supportive care',
  SCREENING: 'screening',
  HEALTH_SERVICES_RESEARCH: 'health services research',
  BASIC_SCIENCE: 'basic science',
  DEVICE_FEASIBILITY: 'device feasibility',
  ECT: 'education, counselling or training',
  OTHER: 'a purpose the sponsor listed as other',
}

const ENROLLMENT_TYPE_LABELS: Record<string, string> = {
  ACTUAL: 'actual',
  ESTIMATED: 'anticipated',
}

const SEX_LABELS: Record<string, string> = {
  ALL: 'all sexes',
  FEMALE: 'female participants only',
  MALE: 'male participants only',
}

const AGE_GROUP_LABELS: Record<string, string> = {
  CHILD: 'children',
  ADULT: 'adults',
  OLDER_ADULT: 'older adults',
}

const SPONSOR_CLASS_LABELS: Record<string, string> = {
  INDUSTRY: 'industry',
  NIH: 'US National Institutes of Health',
  FED: 'US federal agency',
  OTHER_GOV: 'other government body',
  NETWORK: 'research network',
  INDIV: 'individual',
  OTHER: 'other, such as a university or hospital',
}

/** Turn an unmapped registry code into words, so no raw code reaches the main view. */
function humanise(code: string): string {
  return code.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
}

function label(map: Record<string, string>, code: string | null): string | undefined {
  if (!code) return undefined
  return map[code] ?? humanise(code)
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function joinNames(values: readonly string[]): string {
  if (values.length <= 1) return values[0] ?? ''
  return `${values.slice(0, -1).join(', ')} and ${values[values.length - 1]}`
}

/** The registry prints ages as `18 Years`, `6 Months`; the page keeps the number and unit. */
function ageText(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

function registryHref(nctId: string): string | null {
  return resolveRecordedSourceLocator('CLINICALTRIALS', nctId)?.href ?? null
}

interface Fact {
  label: string
  value: string
}

/** Every fact the registry recorded for this study, in ordinary words; absent fields are omitted. */
export function registrationFacts(study: TrialRegistrationRecord): Fact[] {
  const facts: Fact[] = []

  if (study.conditions.length > 0) {
    facts.push({ label: 'What it was listed for', value: study.conditions.join('; ') })
  }

  if (study.matchedInterventionNames.length > 0) {
    facts.push({
      label: 'Registered intervention name that matched',
      value: study.matchedInterventionNames.join('; '),
    })
  }

  const type = label(STUDY_TYPE_LABELS, study.studyType)
  const phases = study.phases.map((phase) => label(PHASE_LABELS, phase) ?? phase)
  const phaseText =
    phases.length === 0
      ? undefined
      : phases.every((phase) => phase === PHASE_LABELS.NA)
        ? PHASE_LABELS.NA
        : phases.filter((phase) => phase !== PHASE_LABELS.NA).join(' / ')
  if (type || phaseText) {
    facts.push({
      label: 'Kind of study',
      value: [type, phaseText].filter((part): part is string => Boolean(part)).join(' · '),
    })
  }

  const allocation = label(ALLOCATION_LABELS, study.design.allocation)
  const masking = label(MASKING_LABELS, study.design.masking)
  const purpose = label(PURPOSE_LABELS, study.design.primaryPurpose)
  const designParts = [
    allocation,
    masking ? `masking: ${masking}` : undefined,
    purpose ? `listed purpose: ${purpose}` : undefined,
  ].filter((part): part is string => Boolean(part))
  if (designParts.length > 0) {
    facts.push({ label: 'How it was set up', value: capitalise(designParts.join('; ')) })
  }

  if (study.enrollment.count !== null) {
    const kind = label(ENROLLMENT_TYPE_LABELS, study.enrollment.type)
    facts.push({
      label: 'How many people',
      value: `${study.enrollment.count.toLocaleString('en-US')}${kind ? ` (${kind} number)` : ''}`,
    })
  }

  const sex = label(SEX_LABELS, study.eligibility.sex)
  const minimum = study.eligibility.minimumAge ? ageText(study.eligibility.minimumAge) : undefined
  const maximum = study.eligibility.maximumAge ? ageText(study.eligibility.maximumAge) : undefined
  const ageRange =
    minimum && maximum
      ? `aged ${minimum} to ${maximum}`
      : minimum
        ? `aged ${minimum} and older`
        : maximum
          ? `aged up to ${maximum}`
          : undefined
  const ageGroups = study.eligibility.stdAges.map(
    (group) => label(AGE_GROUP_LABELS, group) ?? group,
  )
  const healthy =
    study.eligibility.healthyVolunteers === true
      ? 'healthy volunteers accepted'
      : study.eligibility.healthyVolunteers === false
        ? 'healthy volunteers not accepted'
        : undefined
  const whoParts = [
    sex,
    ageRange,
    ageGroups.length > 0 ? `registry age groups: ${ageGroups.join(', ')}` : undefined,
    healthy,
  ].filter((part): part is string => Boolean(part))
  if (whoParts.length > 0) {
    facts.push({ label: 'Who could take part', value: capitalise(whoParts.join('; ')) })
  }

  const whenParts = [
    study.startDate ? `started ${study.startDate}` : undefined,
    study.primaryCompletionDate ? `primary completion ${study.primaryCompletionDate}` : undefined,
    study.completionDate ? `completed ${study.completionDate}` : undefined,
  ].filter((part): part is string => Boolean(part))
  if (whenParts.length > 0) {
    facts.push({ label: 'When', value: capitalise(whenParts.join('; ')) })
  }

  if (study.primaryOutcomes.length > 0) {
    facts.push({
      label: 'What it set out to measure, as registered',
      value: study.primaryOutcomes
        .map((outcome) =>
          outcome.timeFrame
            ? `“${outcome.measure}” — time frame “${outcome.timeFrame}”`
            : `“${outcome.measure}”`,
        )
        .join('; '),
    })
  }

  if (study.leadSponsor.name) {
    const sponsorClass =
      study.leadSponsor.class && study.leadSponsor.class !== 'UNKNOWN'
        ? label(SPONSOR_CLASS_LABELS, study.leadSponsor.class)
        : undefined
    facts.push({
      label: 'Who ran it',
      value: sponsorClass ? `${study.leadSponsor.name} (${sponsorClass})` : study.leadSponsor.name,
    })
  }

  facts.push({
    label: 'Results on ClinicalTrials.gov',
    value: study.hasResults
      ? study.resultsFirstPostDate
        ? `Results posted on ClinicalTrials.gov on ${study.resultsFirstPostDate}.`
        : 'Results posted on ClinicalTrials.gov; the posting date is not recorded.'
      : 'No results posted on ClinicalTrials.gov in this snapshot.',
  })

  return facts
}

function statusLabel(study: TrialRegistrationRecord): string | undefined {
  const value = label(STATUS_LABELS, study.overallStatus)
  return value ? capitalise(value) : undefined
}

/** The sentence above the list, built only from what the search record itself states. */
export function trialRegistrationsFraming(view: TrialRegistrationsView): string[] {
  const snapshot = view.snapshotDate
    ? `the ClinicalTrials.gov snapshot dated ${view.snapshotDate}`
    : 'one dated ClinicalTrials.gov snapshot'
  const names =
    view.matchedNames.length > 0
      ? `the name${view.matchedNames.length > 1 ? 's' : ''} ${joinNames(view.matchedNames.map((name) => `“${name}”`))}`
      : 'this record’s recorded name'
  const count =
    view.totalMatched === 1
      ? '1 registration'
      : `${view.totalMatched.toLocaleString('en-US')} registrations`
  const verb = view.totalMatched === 1 ? 'lists' : 'list'
  return [
    `${capitalise(count)} in ${snapshot} ${verb} ${names} exactly as a registered intervention. A registration is a registry fact: it records that a study was listed and says nothing about whether the medicine worked. Where results are posted, they are on the registry page for that study; RNAWiki has not read or summarised them. The list comes from an exact-name pass over that snapshot, so absence from it is not evidence that no study exists.`,
  ]
}

/** The cap sentence: the ordering rule, then how many registrations sit beyond the list. */
export function trialRegistrationsCapSentence(view: TrialRegistrationsView): string {
  const shown = view.shown.length
  const beyond = view.totalMatched - shown
  const listed =
    shown === view.totalMatched
      ? `All ${shown === 1 ? '1 registration is' : `${shown} registrations are`} listed.`
      : `${shown} of ${view.totalMatched.toLocaleString('en-US')} registrations are listed here.`
  const rest =
    beyond > 0
      ? ` ${beyond.toLocaleString('en-US')} more ${beyond === 1 ? 'registration is' : 'registrations are'} in the snapshot and not listed on this page.`
      : ''
  return `${listed} ${TRIAL_REGISTRATIONS_ORDER_SENTENCE}${rest}`
}

function RegistrationRow({ study, index }: { study: TrialRegistrationRecord; index: number }) {
  const href = registryHref(study.nctId)
  const status = statusLabel(study)
  const headingId = `registered-trial-${study.nctId}-heading`
  return (
    <li
      id={`registered-trial-${study.nctId}`}
      className="min-w-0 scroll-mt-24 py-5"
      data-testid="registered-trial"
    >
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4
          id={headingId}
          className="min-w-0 break-words text-base font-semibold leading-6 text-[#1D1D1F]"
        >
          <span className="text-[#6E6E73]">{index + 1}. </span>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 max-w-full items-center gap-1 break-words text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
            >
              Registration {study.nctId} on ClinicalTrials.gov
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <span>Registration {study.nctId}</span>
          )}
        </h4>
        {status && (
          <span className="shrink-0 rounded-full border border-black/[0.1] bg-[#F5F5F7] px-2 py-0.5 text-[11px] font-semibold leading-4 text-[#515154]">
            {status}
          </span>
        )}
      </div>
      <dl className="mt-2 grid min-w-0 gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        {registrationFacts(study).map((fact) => (
          <div key={fact.label} className="contents">
            <dt className="text-sm font-semibold leading-6 text-[#6E6E73]">{fact.label}</dt>
            <dd className="min-w-0 break-words text-base leading-7 text-[#1D1D1F] [overflow-wrap:anywhere]">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </li>
  )
}

function TechnicalDisclosure({ view }: { view: TrialRegistrationsView }) {
  return (
    <details className="mt-6 rounded-2xl border border-black/[0.08] bg-white p-4">
      <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
        Technical record: registry codes and snapshot
      </summary>
      <p className="mt-2 break-all font-mono text-[11px] leading-5 text-[#6E6E73]">
        {view.sourceIdentifier} · pass run {view.searchedAt.slice(0, 10)} · {view.totalMatched}{' '}
        matched · {view.storedCount} stored · {view.withPostedResults} with posted results
      </p>
      <ul className="mt-2 space-y-1 break-all font-mono text-[11px] leading-5 text-[#6E6E73]">
        {view.shown.map((study) => (
          <li key={`code-${study.nctId}`}>
            {[
              study.nctId,
              study.overallStatus,
              study.studyType,
              study.phases.length > 0 ? study.phases.join('+') : null,
              study.design.allocation,
              study.design.masking,
              study.design.primaryPurpose,
              study.enrollment.type,
              study.leadSponsor.class,
              study.hasResults ? 'hasResults=true' : 'hasResults=false',
            ]
              .filter((part): part is string => Boolean(part))
              .join(' · ')}
          </li>
        ))}
      </ul>
    </details>
  )
}

/**
 * Rendered only when the record carries at least one matched registration. A record whose pass
 * matched nothing states that in the completeness section, so this component adds no empty claim.
 */
export function RegisteredTrials({ dossier }: { dossier: MedicineDossierViewModel }) {
  const view = dossier.trialRegistrations
  if (!view || view.shown.length === 0) return null

  return (
    <section
      id="registered-trials"
      aria-labelledby="registered-trials-heading"
      className="scroll-mt-24 border-t border-black/[0.09] py-8 sm:py-10"
      data-testid="dossier-registered-trials"
    >
      <div className="max-w-3xl space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#0066CC]">
          Trial registry
        </p>
        <h3
          id="registered-trials-heading"
          className="text-2xl font-[650] leading-tight tracking-[-0.02em] text-[#1D1D1F] sm:text-[28px]"
        >
          Registered clinical trials
        </h3>
        {trialRegistrationsFraming(view).map((sentence) => (
          <p key={sentence} className="max-w-2xl text-base leading-7 text-[#515154]">
            {sentence}
          </p>
        ))}
        <p
          className="max-w-2xl text-base leading-7 text-[#515154]"
          data-testid="registered-trials-cap"
        >
          {trialRegistrationsCapSentence(view)}
        </p>
        {view.withPostedResults === 0 && (
          <p
            className="max-w-2xl text-base leading-7 text-[#515154]"
            data-testid="registered-trials-no-results"
          >
            None of these registrations has results posted on ClinicalTrials.gov in this snapshot.
          </p>
        )}
      </div>

      <ol
        className="mt-6 min-w-0 divide-y divide-black/[0.08] border-y border-black/[0.08]"
        aria-label="Registered clinical trials, in the order stated above"
      >
        {view.shown.map((study, index) => (
          <RegistrationRow key={study.nctId} study={study} index={index} />
        ))}
      </ol>

      <TechnicalDisclosure view={view} />
    </section>
  )
}
