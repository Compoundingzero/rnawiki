'use client'

import {
  CheckCircle2,
  CircleAlert,
  EyeOff,
  Gavel,
  LoaderCircle,
  Send,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'

import { useApp } from '@/components/app-context'
import type {
  ContributionAdjudicationView,
  ContributionReviewReadResponse,
  ContributionReviewStateView,
  ContributionReviewView,
} from '@/lib/contributions/review-types'
import {
  VERDICT_REVIEWER_EXPERTISE_TAGS,
  type VerdictReviewDecision,
  type VerdictReviewerExpertiseTag,
} from '@/lib/evidence/types'

const controlClass =
  'min-h-11 w-full rounded-xl border border-black/[0.12] bg-white px-3.5 py-2.5 text-sm text-[#1D1D1F] outline-none transition focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 disabled:cursor-not-allowed disabled:bg-[#F5F5F7] disabled:text-[#6E6E73]'

const EXPERTISE_LABELS: Record<VerdictReviewerExpertiseTag, string> = {
  CLINICAL_PHARMACOLOGY: 'Clinical pharmacology (drug effects in people)',
  THERAPEUTIC_AREA_MEDICINE: 'Medicine in this disease area',
  BIOSTATISTICS: 'Biostatistics (study numbers)',
  TOXICOLOGY: 'Toxicology (safety)',
  PHARMACOKINETICS: 'Pharmacokinetics (how the body handles a drug)',
  REGULATORY_SCIENCE: 'Regulatory review',
  CLINICAL_DEVELOPMENT: 'Clinical trial development',
}

const DECISION_LABELS: Record<VerdictReviewDecision, string> = {
  APPROVE: 'Accept for RNAWiki staff to apply',
  CHANGES_REQUESTED: 'Request changes',
  REJECT: 'Reject',
}

interface ApiFailure {
  error?: string
}

async function reviewRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
  })
  const text = await response.text()
  let body: unknown = {}
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      throw new Error('RNAWiki could not read the review response. Please try again.')
    }
  }
  if (!response.ok) {
    throw new Error((body as ApiFailure).error ?? `The review request failed (${response.status}).`)
  }
  return body as T
}

export function contributionReviewStatusMessage(state: ContributionReviewStateView): string {
  switch (state.status) {
    case 'AWAITING_REVIEWS':
      return 'Awaiting two independent reviews. No public record has changed.'
    case 'AWAITING_SECOND_REVIEW':
      return 'One independent review is recorded; the second decision remains pending.'
    case 'DISAGREEMENT':
      return 'The two independent reviews disagree. A qualified RNAWiki steward must make the final decision; this step is called adjudication.'
    case 'ACCEPTED_FOR_IMPLEMENTATION':
      return 'Reviewers accepted this proposal for RNAWiki staff to apply. It has not changed the public record.'
    case 'CHANGES_REQUESTED':
      return 'Reviewers requested changes. The submitted version cannot be edited, and the public record is unchanged.'
    case 'REJECTED':
      return 'Reviewers rejected this proposal. The public record is unchanged.'
  }
}

export function contributionReviewNeedsNote(decision: VerdictReviewDecision): boolean {
  return decision === 'CHANGES_REQUESTED' || decision === 'REJECT'
}

export function isCurrentReviewRequest(args: {
  requestGeneration: number
  currentRequestGeneration: number
  scopeGeneration: number
  currentScopeGeneration: number
}): boolean {
  return (
    args.requestGeneration === args.currentRequestGeneration &&
    args.scopeGeneration === args.currentScopeGeneration
  )
}

export function blankPrivateReviewFields() {
  return {
    decision: '' as const,
    expertise: [] as VerdictReviewerExpertiseTag[],
    independenceAttested: false,
    conflictsOfInterest: '',
    conflictsOfInterestAttested: false,
    reviewNote: '',
    adjudicationDecision: '' as const,
    adjudicationExpertise: [] as VerdictReviewerExpertiseTag[],
    adjudicationRationale: '',
    adjudicationCoi: '',
    adjudicationCoiAttested: false,
  }
}

function reviewedAtLabel(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const day = String(parsed.getUTCDate()).padStart(2, '0')
  const month = months[parsed.getUTCMonth()] ?? ''
  const hours = String(parsed.getUTCHours()).padStart(2, '0')
  const minutes = String(parsed.getUTCMinutes()).padStart(2, '0')
  return `${day} ${month} ${parsed.getUTCFullYear()}, ${hours}:${minutes}`
}

function readableEligibility(
  reason: ContributionReviewReadResponse['eligibility']['reason'],
): string {
  switch (reason) {
    case 'AUTHOR_CANNOT_REVIEW':
      return 'Authors cannot review their own proposal.'
    case 'INSUFFICIENT_TRUST':
      return 'Only accounts approved as a trusted reviewer, steward, or administrator can record an independent decision.'
    case 'ALREADY_REVIEWED':
      return 'Your review is recorded below and can no longer be edited.'
    case 'REVIEW_COMPLETE':
      return 'This review is complete.'
    case 'ADJUDICATION_REQUIRED':
      return 'The independent reviews disagree; a qualified steward must make the final decision.'
    case 'ELIGIBLE':
      return 'You are eligible to review this proposal.'
  }
}

function ExpertiseFields({
  name,
  selected,
  disabled,
  onChange,
}: {
  name: string
  selected: VerdictReviewerExpertiseTag[]
  disabled: boolean
  onChange: (values: VerdictReviewerExpertiseTag[]) => void
}) {
  const toggle = (tag: VerdictReviewerExpertiseTag, checked: boolean) => {
    onChange(checked ? [...selected, tag] : selected.filter((item) => item !== tag))
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold leading-5 text-[#1D1D1F]">
        Which expertise are you bringing to this review?
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {VERDICT_REVIEWER_EXPERTISE_TAGS.map((tag) => (
          <label
            key={tag}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-black/[0.1] px-3 py-2 text-xs leading-5 text-[#424245] has-[:checked]:border-[#0071E3] has-[:checked]:bg-blue-50 has-[:checked]:font-semibold has-[:checked]:text-[#0066CC]"
          >
            <input
              type="checkbox"
              name={name}
              value={tag}
              checked={selected.includes(tag)}
              onChange={(event) => toggle(tag, event.target.checked)}
              disabled={disabled}
              className="h-4 w-4 shrink-0 accent-[#0071E3]"
            />
            <span>{EXPERTISE_LABELS[tag]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function DecisionFields({
  name,
  value,
  disabled,
  onChange,
}: {
  name: string
  value: VerdictReviewDecision | ''
  disabled: boolean
  onChange: (value: VerdictReviewDecision) => void
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold leading-5 text-[#1D1D1F]">
        What is your decision on this submitted proposal?
      </legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {(Object.keys(DECISION_LABELS) as VerdictReviewDecision[]).map((decision) => (
          <label
            key={decision}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-black/[0.1] px-3 py-2 text-xs leading-5 text-[#424245] has-[:checked]:border-[#0071E3] has-[:checked]:bg-blue-50 has-[:checked]:font-semibold has-[:checked]:text-[#0066CC]"
          >
            <input
              type="radio"
              name={name}
              value={decision}
              checked={value === decision}
              onChange={() => onChange(decision)}
              disabled={disabled}
              required
              className="h-4 w-4 shrink-0 accent-[#0071E3]"
            />
            <span>{DECISION_LABELS[decision]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function ConflictDisclosure({
  idPrefix,
  value,
  attested,
  disabled,
  onValueChange,
  onAttestedChange,
}: {
  idPrefix: string
  value: string
  attested: boolean
  disabled: boolean
  onValueChange: (value: string) => void
  onAttestedChange: (value: boolean) => void
}) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-black/[0.08] p-4">
      <legend className="px-1 text-xs font-semibold text-[#1D1D1F]">
        Do you have a relevant conflict of interest?
      </legend>
      <label htmlFor={`${idPrefix}-coi`} className="sr-only">
        Your conflict-of-interest disclosure
      </label>
      <textarea
        id={`${idPrefix}-coi`}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        disabled={disabled}
        required
        rows={3}
        maxLength={4_000}
        className={controlClass}
        placeholder="Write “None” if none; otherwise describe relevant interests."
      />
      <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl bg-[#F5F5F7] px-3 py-2.5 text-xs leading-5 text-[#424245]">
        <input
          type="checkbox"
          checked={attested}
          onChange={(event) => onAttestedChange(event.target.checked)}
          disabled={disabled}
          required
          className="mt-1 h-4 w-4 shrink-0 accent-[#0071E3]"
        />
        <span>I confirm this disclosure is complete and accurate.</span>
      </label>
    </fieldset>
  )
}

function Attribution({
  person,
}: {
  person: ContributionReviewView['reviewer'] | ContributionAdjudicationView['adjudicator']
}) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <Link href={`/u/${person.handle}`} className="font-semibold text-[#0066CC] hover:underline">
        {person.name}
      </Link>
      {person.orcid && (
        <a
          href={`https://orcid.org/${person.orcid}`}
          target="_blank"
          rel="noreferrer"
          className="break-all font-mono text-[9px] text-[#6E6E73] hover:underline"
        >
          ORCID {person.orcid}
        </a>
      )}
    </span>
  )
}

function ReviewRecord({ review }: { review: ContributionReviewView }) {
  return (
    <li className="min-w-0 rounded-xl border border-black/[0.08] bg-white p-3">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-2 text-[11px] leading-5">
        <Attribution person={review.reviewer} />
        <strong className="text-[#1D1D1F]">{DECISION_LABELS[review.decision]}</strong>
      </div>
      <p className="mt-1 text-[10px] leading-4 text-[#6E6E73]">
        Relevant experience: {review.expertiseTags.map((tag) => EXPERTISE_LABELS[tag]).join(', ')}
      </p>
      {review.reviewNote && (
        <p className="mt-2 whitespace-pre-wrap break-words text-[11px] leading-5 text-[#424245]">
          {review.reviewNote}
        </p>
      )}
      <details className="mt-1">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-[10px] font-semibold text-[#0066CC]">
          Reviewer conflict-of-interest disclosure
        </summary>
        <p className="break-words text-[11px] leading-5 text-[#424245]">
          {review.conflictsOfInterest}
        </p>
      </details>
      <p className="text-[9px] uppercase tracking-wide text-[#6E6E73]">
        Independent review confirmed · Conflict-of-interest statement confirmed ·{' '}
        {reviewedAtLabel(review.reviewedAt)} UTC
      </p>
    </li>
  )
}

export interface ContributionReviewPanelProps {
  proposalId: string
  medicineName: string
  initialState: ContributionReviewStateView
  publicReviews?: ContributionReviewView[]
  publicAdjudication?: ContributionAdjudicationView | null
}

export function ContributionReviewPanel({
  proposalId,
  medicineName,
  initialState,
  publicReviews = [],
  publicAdjudication = null,
}: ContributionReviewPanelProps) {
  const { currentUser, requireAuth } = useApp()
  const accountId = currentUser?.id ?? null
  const accountRef = useRef(accountId)
  accountRef.current = accountId
  const router = useRouter()
  const scopeGenerationRef = useRef(0)
  const readRequestRef = useRef<{ generation: number; controller: AbortController | null }>({
    generation: 0,
    controller: null,
  })
  const writeRequestRef = useRef<{ generation: number; controller: AbortController | null }>({
    generation: 0,
    controller: null,
  })
  const [privateStateAccountId, setPrivateStateAccountId] = useState(accountId)
  const [read, setRead] = useState<ContributionReviewReadResponse | null>(null)
  const [hasRequestedAccess, setHasRequestedAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [decision, setDecision] = useState<VerdictReviewDecision | ''>('')
  const [expertise, setExpertise] = useState<VerdictReviewerExpertiseTag[]>([])
  const [independenceAttested, setIndependenceAttested] = useState(false)
  const [conflictsOfInterest, setConflictsOfInterest] = useState('')
  const [conflictsOfInterestAttested, setConflictsOfInterestAttested] = useState(false)
  const [reviewNote, setReviewNote] = useState('')

  const [adjudicationDecision, setAdjudicationDecision] = useState<VerdictReviewDecision | ''>('')
  const [adjudicationExpertise, setAdjudicationExpertise] = useState<VerdictReviewerExpertiseTag[]>(
    [],
  )
  const [adjudicationRationale, setAdjudicationRationale] = useState('')
  const [adjudicationCoi, setAdjudicationCoi] = useState('')
  const [adjudicationCoiAttested, setAdjudicationCoiAttested] = useState(false)

  const endpoint = `/api/contributions/${encodeURIComponent(proposalId)}/reviews`
  const load = useCallback(async () => {
    if (!accountId || accountRef.current !== accountId) {
      setRead(null)
      return
    }
    readRequestRef.current.controller?.abort()
    const controller = new AbortController()
    const requestGeneration = readRequestRef.current.generation + 1
    const scopeGeneration = scopeGenerationRef.current
    readRequestRef.current = { generation: requestGeneration, controller }
    setIsLoading(true)
    setError(null)
    try {
      const response = await reviewRequest<ContributionReviewReadResponse>(endpoint, {
        signal: controller.signal,
      })
      if (
        !isCurrentReviewRequest({
          requestGeneration,
          currentRequestGeneration: readRequestRef.current.generation,
          scopeGeneration,
          currentScopeGeneration: scopeGenerationRef.current,
        }) ||
        accountRef.current !== accountId
      ) {
        return
      }
      setRead(response)
    } catch (caught) {
      if (
        controller.signal.aborted ||
        !isCurrentReviewRequest({
          requestGeneration,
          currentRequestGeneration: readRequestRef.current.generation,
          scopeGeneration,
          currentScopeGeneration: scopeGenerationRef.current,
        }) ||
        accountRef.current !== accountId
      ) {
        return
      }
      setError(caught instanceof Error ? caught.message : 'Review eligibility could not be loaded.')
    } finally {
      if (
        isCurrentReviewRequest({
          requestGeneration,
          currentRequestGeneration: readRequestRef.current.generation,
          scopeGeneration,
          currentScopeGeneration: scopeGenerationRef.current,
        }) &&
        accountRef.current === accountId
      ) {
        readRequestRef.current.controller = null
        setIsLoading(false)
      }
    }
  }, [accountId, endpoint])

  useEffect(() => {
    scopeGenerationRef.current += 1
    readRequestRef.current.controller?.abort()
    readRequestRef.current.generation += 1
    readRequestRef.current.controller = null
    writeRequestRef.current.controller?.abort()
    writeRequestRef.current.generation += 1
    writeRequestRef.current.controller = null
    setRead(null)
    setHasRequestedAccess(false)
    setIsLoading(false)
    setIsSubmitting(false)
    setError(null)
    setNotice(null)
    const blank = blankPrivateReviewFields()
    setDecision(blank.decision)
    setExpertise(blank.expertise)
    setIndependenceAttested(blank.independenceAttested)
    setConflictsOfInterest(blank.conflictsOfInterest)
    setConflictsOfInterestAttested(blank.conflictsOfInterestAttested)
    setReviewNote(blank.reviewNote)
    setAdjudicationDecision(blank.adjudicationDecision)
    setAdjudicationExpertise(blank.adjudicationExpertise)
    setAdjudicationRationale(blank.adjudicationRationale)
    setAdjudicationCoi(blank.adjudicationCoi)
    setAdjudicationCoiAttested(blank.adjudicationCoiAttested)
    setPrivateStateAccountId(accountId)

    return () => {
      scopeGenerationRef.current += 1
      readRequestRef.current.controller?.abort()
      readRequestRef.current.generation += 1
      readRequestRef.current.controller = null
      writeRequestRef.current.controller?.abort()
      writeRequestRef.current.generation += 1
      writeRequestRef.current.controller = null
    }
  }, [accountId, proposalId])

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (privateStateAccountId !== accountId || accountRef.current !== accountId || !accountId)
      return
    if (!decision) return
    if (expertise.length === 0) {
      setError('Select at least one area of expertise.')
      return
    }
    if (contributionReviewNeedsNote(decision) && !reviewNote.trim()) {
      setError('Explain what must change or why the proposal should be rejected.')
      return
    }
    setIsSubmitting(true)
    setError(null)
    setNotice(null)
    writeRequestRef.current.controller?.abort()
    const controller = new AbortController()
    const requestGeneration = writeRequestRef.current.generation + 1
    writeRequestRef.current = { generation: requestGeneration, controller }
    const scopeGeneration = scopeGenerationRef.current
    try {
      const response = await reviewRequest<ContributionReviewReadResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          decision,
          expertiseTags: expertise,
          independenceAttested,
          conflictsOfInterest,
          conflictsOfInterestAttested,
          ...(reviewNote.trim() ? { reviewNote: reviewNote.trim() } : {}),
        }),
        signal: controller.signal,
      })
      if (
        controller.signal.aborted ||
        scopeGenerationRef.current !== scopeGeneration ||
        writeRequestRef.current.generation !== requestGeneration ||
        accountRef.current !== accountId
      ) {
        return
      }
      setRead(response)
      setNotice('Your independent review was recorded and can no longer be edited.')
      router.refresh()
    } catch (caught) {
      if (
        controller.signal.aborted ||
        scopeGenerationRef.current !== scopeGeneration ||
        writeRequestRef.current.generation !== requestGeneration ||
        accountRef.current !== accountId
      ) {
        return
      }
      setError(caught instanceof Error ? caught.message : 'The review could not be recorded.')
    } finally {
      if (
        !controller.signal.aborted &&
        scopeGenerationRef.current === scopeGeneration &&
        writeRequestRef.current.generation === requestGeneration &&
        accountRef.current === accountId
      ) {
        writeRequestRef.current.controller = null
        setIsSubmitting(false)
      }
    }
  }

  const submitAdjudication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (privateStateAccountId !== accountId || accountRef.current !== accountId || !accountId)
      return
    if (!adjudicationDecision) return
    if (adjudicationExpertise.length === 0) {
      setError('Select at least one area of expertise for the final decision.')
      return
    }
    setIsSubmitting(true)
    setError(null)
    setNotice(null)
    writeRequestRef.current.controller?.abort()
    const controller = new AbortController()
    const requestGeneration = writeRequestRef.current.generation + 1
    writeRequestRef.current = { generation: requestGeneration, controller }
    const scopeGeneration = scopeGenerationRef.current
    try {
      const response = await reviewRequest<ContributionReviewReadResponse>(
        `/api/contributions/${encodeURIComponent(proposalId)}/adjudication`,
        {
          method: 'POST',
          body: JSON.stringify({
            decision: adjudicationDecision,
            expertiseTags: adjudicationExpertise,
            rationale: adjudicationRationale,
            conflictsOfInterest: adjudicationCoi,
            conflictsOfInterestAttested: adjudicationCoiAttested,
          }),
          signal: controller.signal,
        },
      )
      if (
        controller.signal.aborted ||
        scopeGenerationRef.current !== scopeGeneration ||
        writeRequestRef.current.generation !== requestGeneration ||
        accountRef.current !== accountId
      ) {
        return
      }
      setRead(response)
      setNotice(
        'The steward’s final decision and explanation were recorded. The public record is unchanged.',
      )
      router.refresh()
    } catch (caught) {
      if (
        controller.signal.aborted ||
        scopeGenerationRef.current !== scopeGeneration ||
        writeRequestRef.current.generation !== requestGeneration ||
        accountRef.current !== accountId
      ) {
        return
      }
      setError(
        caught instanceof Error ? caught.message : 'The final decision could not be recorded.',
      )
    } finally {
      if (
        !controller.signal.aborted &&
        scopeGenerationRef.current === scopeGeneration &&
        writeRequestRef.current.generation === requestGeneration &&
        accountRef.current === accountId
      ) {
        writeRequestRef.current.controller = null
        setIsSubmitting(false)
      }
    }
  }

  const privateScopeIsCurrent = privateStateAccountId === accountId
  const visibleRead = privateScopeIsCurrent ? read : null
  const visibleHasRequestedAccess = privateScopeIsCurrent && hasRequestedAccess
  const visibleIsLoading = privateScopeIsCurrent && isLoading
  const visibleIsSubmitting = privateScopeIsCurrent && isSubmitting
  const visibleError = privateScopeIsCurrent ? error : null
  const visibleNotice = privateScopeIsCurrent ? notice : null
  const state = visibleRead?.reviewState ?? initialState
  const reviews = visibleRead?.reviews ?? publicReviews
  const adjudication = visibleRead?.adjudication ?? publicAdjudication
  const workflowCanAcceptAction =
    state.status === 'AWAITING_REVIEWS' ||
    state.status === 'AWAITING_SECOND_REVIEW' ||
    state.status === 'DISAGREEMENT'

  return (
    <section
      aria-label={`Independent review for ${medicineName}`}
      className="space-y-4 border-t border-black/[0.07] pt-4"
    >
      <div className="flex min-w-0 items-start gap-2 text-[11px] font-semibold leading-5 text-[#424245]">
        {state.status === 'DISAGREEMENT' ? (
          <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        ) : state.status === 'ACCEPTED_FOR_IMPLEMENTATION' ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
        ) : (
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0071E3]" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <p>{contributionReviewStatusMessage(state)}</p>
          <p className="mt-1 text-[10px] font-normal text-[#6E6E73]">
            {state.reviewCount} of {state.requiredReviewCount} independent reviews recorded.
          </p>
        </div>
      </div>

      {workflowCanAcceptAction && !currentUser ? (
        <button
          type="button"
          onClick={requireAuth}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.12] bg-white px-4 py-2 text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
        >
          Sign in to review
        </button>
      ) : workflowCanAcceptAction && currentUser && !visibleHasRequestedAccess && !visibleRead ? (
        <button
          type="button"
          onClick={() => {
            setHasRequestedAccess(true)
            void load()
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.12] bg-white px-4 py-2 text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
        >
          {state.status === 'DISAGREEMENT'
            ? 'Check whether you can make the final decision'
            : 'Review this proposal'}
        </button>
      ) : visibleIsLoading && !visibleRead ? (
        <p className="flex min-h-11 items-center gap-2 text-[11px] text-[#6E6E73]" role="status">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          Checking whether your account can review this proposal…
        </p>
      ) : workflowCanAcceptAction && currentUser && visibleHasRequestedAccess && !visibleRead ? (
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.12] bg-white px-4 py-2 text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
        >
          Try the review check again
        </button>
      ) : visibleRead?.eligibility.canReview ? (
        <form onSubmit={submitReview} className="space-y-4 rounded-2xl bg-[#F5F5F7] p-4">
          <div className="flex items-start gap-2 rounded-xl bg-white p-3 text-[11px] leading-5 text-[#424245]">
            <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-[#0071E3]" aria-hidden="true" />
            <p>
              Other reviewer decisions are hidden until you submit your own decision, which cannot
              be changed later. Read the submitted evidence above and make your own assessment.
            </p>
          </div>
          <DecisionFields
            name={`review-decision-${proposalId}`}
            value={decision}
            disabled={visibleIsSubmitting}
            onChange={setDecision}
          />
          <ExpertiseFields
            name={`review-expertise-${proposalId}`}
            selected={expertise}
            disabled={visibleIsSubmitting}
            onChange={setExpertise}
          />
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl bg-white px-3 py-2.5 text-xs leading-5 text-[#424245]">
            <input
              type="checkbox"
              checked={independenceAttested}
              onChange={(event) => setIndependenceAttested(event.target.checked)}
              disabled={visibleIsSubmitting}
              required
              className="mt-1 h-4 w-4 shrink-0 accent-[#0071E3]"
            />
            <span>
              I reviewed this proposal independently and did not consult another reviewer’s
              decision.
            </span>
          </label>
          <label className="block space-y-1.5 text-xs font-semibold text-[#1D1D1F]">
            <span>
              Reason for your decision{' '}
              {decision === 'APPROVE' ? '(optional)' : '(required for this decision)'}
            </span>
            <textarea
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              disabled={visibleIsSubmitting}
              required={decision ? contributionReviewNeedsNote(decision) : false}
              rows={4}
              maxLength={8_000}
              className={controlClass}
              placeholder="Point to the specific evidence, part of the proposal, or reasoning that supports your decision."
            />
          </label>
          <ConflictDisclosure
            idPrefix={`review-${proposalId}`}
            value={conflictsOfInterest}
            attested={conflictsOfInterestAttested}
            disabled={visibleIsSubmitting}
            onValueChange={setConflictsOfInterest}
            onAttestedChange={setConflictsOfInterestAttested}
          />
          <button
            type="submit"
            disabled={visibleIsSubmitting}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1D1D1F] px-4 py-2 text-xs font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {visibleIsSubmitting ? 'Recording review…' : 'Submit independent review'}
          </button>
        </form>
      ) : visibleRead ? (
        <p className="rounded-xl bg-[#F5F5F7] p-3 text-[11px] leading-5 text-[#6E6E73]">
          {readableEligibility(visibleRead.eligibility.reason)}
        </p>
      ) : null}

      {visibleRead?.adjudicationEligibility.canAdjudicate && (
        <form onSubmit={submitAdjudication} className="space-y-4 rounded-2xl bg-amber-50 p-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold text-amber-950">
              <Gavel className="h-4 w-4" aria-hidden="true" />
              Make the final decision
            </p>
            <p className="mt-1 text-[11px] leading-5 text-amber-900">
              This step is called adjudication. A qualified steward compares the two reviews,
              records the final review outcome, and explains why. It does not publish a medical
              conclusion.
            </p>
          </div>
          <DecisionFields
            name={`adjudication-decision-${proposalId}`}
            value={adjudicationDecision}
            disabled={visibleIsSubmitting}
            onChange={setAdjudicationDecision}
          />
          <ExpertiseFields
            name={`adjudication-expertise-${proposalId}`}
            selected={adjudicationExpertise}
            disabled={visibleIsSubmitting}
            onChange={setAdjudicationExpertise}
          />
          <label className="block space-y-1.5 text-xs font-semibold text-[#1D1D1F]">
            <span>Why is this the final decision?</span>
            <textarea
              value={adjudicationRationale}
              onChange={(event) => setAdjudicationRationale(event.target.value)}
              disabled={visibleIsSubmitting}
              required
              rows={5}
              maxLength={12_000}
              className={controlClass}
              placeholder="Explain how the submitted evidence and the limits of the claim resolve the reviewers’ disagreement."
            />
          </label>
          <ConflictDisclosure
            idPrefix={`adjudication-${proposalId}`}
            value={adjudicationCoi}
            attested={adjudicationCoiAttested}
            disabled={visibleIsSubmitting}
            onValueChange={setAdjudicationCoi}
            onAttestedChange={setAdjudicationCoiAttested}
          />
          <button
            type="submit"
            disabled={visibleIsSubmitting}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1D1D1F] px-4 py-2 text-xs font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Gavel className="h-4 w-4" aria-hidden="true" />
            {visibleIsSubmitting ? 'Recording final decision…' : 'Record final decision'}
          </button>
        </form>
      )}

      {reviews.length > 0 && (
        <section aria-labelledby={`review-record-${proposalId}`} className="space-y-2">
          <h3 id={`review-record-${proposalId}`} className="text-xs font-semibold text-[#1D1D1F]">
            Independent reviews
          </h3>
          <ul className="space-y-2">
            {reviews.map((review) => (
              <ReviewRecord key={review.id} review={review} />
            ))}
          </ul>
        </section>
      )}

      {adjudication && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5">
          <p className="font-semibold text-amber-950">
            Steward’s final decision: {DECISION_LABELS[adjudication.decision]}
          </p>
          <Attribution person={adjudication.adjudicator} />
          <p className="mt-2 whitespace-pre-wrap break-words text-amber-950">
            {adjudication.rationale}
          </p>
          <p className="mt-2 text-[10px] text-amber-900">
            Relevant experience:{' '}
            {adjudication.expertiseTags.map((tag) => EXPERTISE_LABELS[tag]).join(', ')}
          </p>
          <p className="mt-1 text-[10px] text-amber-900">
            Conflict-of-interest statement confirmed · Final decision recorded{' '}
            {reviewedAtLabel(adjudication.adjudicatedAt)} UTC
          </p>
          <details className="mt-1">
            <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-amber-950">
              Steward’s conflict-of-interest disclosure
            </summary>
            <p className="break-words text-amber-950">{adjudication.conflictsOfInterest}</p>
          </details>
        </section>
      )}

      {visibleError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-[11px] leading-5 text-rose-800"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{visibleError}</span>
        </p>
      )}
      {visibleNotice && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-[11px] leading-5 text-emerald-800"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{visibleNotice}</span>
        </p>
      )}
    </section>
  )
}
