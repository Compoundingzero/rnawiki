'use client'

import { CheckCircle2, LoaderCircle, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'

import { useApp } from '@/components/app-context'
import { isCurrentAccountRequest } from '@/lib/account-request-scope'
import {
  canManageInternalReviews,
  internalReviewCapabilityScopeKey,
} from '@/lib/internal-review-request-scope'
import {
  VERDICT_REVIEWER_EXPERTISE_TAGS,
  type VerdictReviewerExpertiseTag,
} from '@/lib/evidence/types'

const QUALIFICATION_LABELS: Record<VerdictReviewerExpertiseTag, string> = {
  CLINICAL_PHARMACOLOGY: 'Clinical pharmacology',
  THERAPEUTIC_AREA_MEDICINE: 'Medicine in this disease area',
  BIOSTATISTICS: 'Study statistics',
  TOXICOLOGY: 'Safety and toxicology',
  PHARMACOKINETICS: 'How the body handles a medicine',
  REGULATORY_SCIENCE: 'Regulatory review',
  CLINICAL_DEVELOPMENT: 'Clinical trial development',
}

const inputClass =
  'min-h-11 w-full rounded-xl border border-black/[0.12] bg-white px-3 py-2.5 text-sm text-[#1D1D1F] outline-none transition focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 disabled:cursor-not-allowed disabled:bg-[#F5F5F7] disabled:text-[#6E6E73]'

interface ReviewerRow {
  id: string
  name: string
  handle: string
  orcid: string | null
  trustTier: string
  isAdmin: boolean
  activeQualifications: VerdictReviewerExpertiseTag[]
}

interface QualificationEvent {
  id: string
  reviewerName: string
  reviewerUserId: string
  expertiseTag: VerdictReviewerExpertiseTag
  action: 'GRANT' | 'REVOKE'
  reason: string
  authorizedByUserId: string
  createdAt: string
}

interface QualificationRoster {
  roster: ReviewerRow[]
  events: QualificationEvent[]
  availableQualifications: VerdictReviewerExpertiseTag[]
}

interface ApiFailure {
  error?: string
}

async function qualificationRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  const text = await response.text()
  let body: unknown = {}
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      throw new Error('RNAWiki could not read the server response. Nothing was changed.')
    }
  }
  if (!response.ok) {
    throw new Error((body as ApiFailure).error ?? `The request failed (${response.status}).`)
  }
  return body as T
}

function timeLabel(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date)
}

export function ReviewerQualificationPanel() {
  const { currentUser } = useApp()
  const accountId = currentUser?.id ?? null
  const canManage = canManageInternalReviews(currentUser)
  const accountKey = internalReviewCapabilityScopeKey(currentUser)
  const accountKeyRef = useRef(accountKey)
  accountKeyRef.current = accountKey
  const lastResetAccountKeyRef = useRef(accountKey)
  const [dataSnapshot, setDataSnapshot] = useState<{
    accountKey: string
    value: QualificationRoster
  } | null>(null)
  const data = dataSnapshot?.accountKey === accountKey ? dataSnapshot.value : null
  const [reviewerId, setReviewerId] = useState('')
  const [expertiseTag, setExpertiseTag] = useState<VerdictReviewerExpertiseTag>(
    VERDICT_REVIEWER_EXPERTISE_TAGS[0],
  )
  const [action, setAction] = useState<'GRANT' | 'REVOKE'>('GRANT')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [privateStateAccountKey, setPrivateStateAccountKey] = useState(accountKey)
  const [reload, setReload] = useState(0)
  const requestRef = useRef<{ generation: number; controller: AbortController | null }>({
    generation: 0,
    controller: null,
  })

  useEffect(() => {
    requestRef.current.controller?.abort()
    const controller = new AbortController()
    const generation = requestRef.current.generation + 1
    requestRef.current = { generation, controller }
    setDataSnapshot(null)
    setError(null)
    if (lastResetAccountKeyRef.current !== accountKey) {
      lastResetAccountKeyRef.current = accountKey
      setReviewerId('')
      setReason('')
      setNotice(null)
      setIsSaving(false)
      setPrivateStateAccountKey(accountKey)
    }
    if (!accountId || !canManage) {
      setIsLoading(false)
      return () => controller.abort()
    }
    setIsLoading(true)
    void qualificationRequest<QualificationRoster>('/api/reviewer-qualifications', {
      signal: controller.signal,
    })
      .then((next) => {
        if (
          !isCurrentAccountRequest({
            accountKey,
            currentAccountKey: accountKeyRef.current,
            accountGeneration: generation,
            currentAccountGeneration: requestRef.current.generation,
            aborted: controller.signal.aborted,
          })
        ) {
          return
        }
        setDataSnapshot({ accountKey, value: next })
        setReviewerId(next.roster.find((reviewer) => reviewer.id !== accountId)?.id ?? '')
      })
      .catch((caught) => {
        if (
          !isCurrentAccountRequest({
            accountKey,
            currentAccountKey: accountKeyRef.current,
            accountGeneration: generation,
            currentAccountGeneration: requestRef.current.generation,
            aborted: controller.signal.aborted,
          })
        ) {
          return
        }
        setError(
          caught instanceof Error ? caught.message : 'Reviewer qualifications could not be loaded.',
        )
      })
      .finally(() => {
        if (
          isCurrentAccountRequest({
            accountKey,
            currentAccountKey: accountKeyRef.current,
            accountGeneration: generation,
            currentAccountGeneration: requestRef.current.generation,
            aborted: controller.signal.aborted,
          })
        ) {
          setIsLoading(false)
        }
      })
    return () => controller.abort()
  }, [accountId, accountKey, canManage, reload])

  const privateScopeIsCurrent = privateStateAccountKey === accountKey
  const visibleIsLoading = canManage && (!privateScopeIsCurrent || isLoading)
  const visibleIsSaving = privateScopeIsCurrent && isSaving
  const visibleError = privateScopeIsCurrent ? error : null
  const visibleNotice = privateScopeIsCurrent ? notice : null

  const selectedReviewer = useMemo(
    () => data?.roster.find((reviewer) => reviewer.id === reviewerId) ?? null,
    [data, reviewerId],
  )
  const selectedActive = selectedReviewer?.activeQualifications.includes(expertiseTag) ?? false
  const validTransition =
    Boolean(selectedReviewer) &&
    selectedReviewer?.id !== accountId &&
    (action === 'REVOKE') === selectedActive

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validTransition || !accountId || !canManage || !privateScopeIsCurrent) return
    requestRef.current.controller?.abort()
    const controller = new AbortController()
    const generation = requestRef.current.generation + 1
    requestRef.current = { generation, controller }
    setIsSaving(true)
    setError(null)
    setNotice(null)
    try {
      await qualificationRequest<{ event: QualificationEvent }>('/api/reviewer-qualifications', {
        method: 'POST',
        body: JSON.stringify({ reviewerUserId: reviewerId, expertiseTag, action, reason }),
        signal: controller.signal,
      })
      if (
        !isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration: generation,
          currentAccountGeneration: requestRef.current.generation,
          aborted: controller.signal.aborted,
        })
      ) {
        return
      }
      setNotice(
        `${QUALIFICATION_LABELS[expertiseTag]} was ${action === 'GRANT' ? 'granted to' : 'revoked from'} ${selectedReviewer?.name}.`,
      )
      setReason('')
      setReload((value) => value + 1)
    } catch (caught) {
      if (
        !isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration: generation,
          currentAccountGeneration: requestRef.current.generation,
          aborted: controller.signal.aborted,
        })
      ) {
        return
      }
      setError(
        caught instanceof Error ? caught.message : 'The qualification record could not be changed.',
      )
    } finally {
      if (
        isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration: generation,
          currentAccountGeneration: requestRef.current.generation,
          aborted: controller.signal.aborted,
        })
      ) {
        setIsSaving(false)
      }
    }
  }

  return (
    <details
      data-testid="reviewer-qualification-panel"
      className="rounded-2xl border border-black/[0.08] bg-white"
    >
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-4 py-3 text-xs font-semibold text-[#1D1D1F]">
        <UserRoundCheck className="h-4 w-4 text-[#0071E3]" aria-hidden="true" />
        Manage scientific reviewer qualifications
      </summary>
      <div className="space-y-5 border-t border-black/[0.07] p-4">
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          Trust controls who may help moderate RNAWiki. A qualification is a separate,
          steward-recorded confirmation that someone can review a specific kind of medical evidence.
          Each grant or revocation is permanent in the audit log.
        </p>

        {visibleIsLoading ? (
          <p className="flex items-center gap-2 text-[11px] text-[#424245]">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading
            qualifications…
          </p>
        ) : data ? (
          <>
            <form
              data-testid="reviewer-qualification-form"
              onSubmit={(event) => void submit(event)}
              className="grid min-w-0 gap-4 sm:grid-cols-2"
            >
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-xs font-semibold text-[#1D1D1F]">Reviewer</span>
                <select
                  value={reviewerId}
                  onChange={(event) => setReviewerId(event.target.value)}
                  disabled={visibleIsSaving}
                  required
                  className={inputClass}
                >
                  <option value="">Choose a reviewer</option>
                  {data.roster.map((reviewer) => (
                    <option
                      key={reviewer.id}
                      value={reviewer.id}
                      disabled={reviewer.id === accountId}
                    >
                      {reviewer.name} (@{reviewer.handle})
                      {reviewer.id === accountId ? ' — your account' : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[#1D1D1F]">Evidence area</span>
                <select
                  value={expertiseTag}
                  onChange={(event) =>
                    setExpertiseTag(event.target.value as VerdictReviewerExpertiseTag)
                  }
                  disabled={visibleIsSaving}
                  className={inputClass}
                >
                  {data.availableQualifications.map((tag) => (
                    <option key={tag} value={tag}>
                      {QUALIFICATION_LABELS[tag]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[#1D1D1F]">Action</span>
                <select
                  value={action}
                  onChange={(event) => setAction(event.target.value as 'GRANT' | 'REVOKE')}
                  disabled={visibleIsSaving}
                  className={inputClass}
                >
                  <option value="GRANT">Grant qualification</option>
                  <option value="REVOKE">Revoke qualification</option>
                </select>
              </label>
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-xs font-semibold text-[#1D1D1F]">
                  Evidence for this decision
                </span>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  disabled={visibleIsSaving}
                  required
                  rows={4}
                  maxLength={8_000}
                  className={inputClass}
                  placeholder="Record the experience, credential or change that supports this decision."
                />
              </label>
              {!validTransition && selectedReviewer && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-950 sm:col-span-2">
                  {selectedReviewer.id === accountId
                    ? 'Stewards cannot change their own qualifications.'
                    : selectedActive
                      ? 'This qualification is already active. Choose Revoke to end it.'
                      : 'This qualification is not active. Choose Grant to add it.'}
                </p>
              )}
              <button
                type="submit"
                data-testid="reviewer-qualification-submit"
                disabled={visibleIsSaving || !validTransition || !reason.trim()}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1D1D1F] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {visibleIsSaving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                )}
                {action === 'GRANT' ? 'Record qualification' : 'Record revocation'}
              </button>
            </form>

            <section
              aria-labelledby="qualification-roster-heading"
              className="space-y-3 border-t border-black/[0.07] pt-4"
            >
              <h3 id="qualification-roster-heading" className="text-xs font-bold text-[#1D1D1F]">
                Current reviewer qualifications
              </h3>
              <ul className="grid min-w-0 gap-2 sm:grid-cols-2">
                {data.roster
                  .filter((reviewer) => reviewer.activeQualifications.length > 0)
                  .map((reviewer) => (
                    <li
                      key={reviewer.id}
                      className="rounded-xl bg-[#F5F5F7] p-3 text-[11px] leading-5 text-[#424245]"
                    >
                      <p className="font-semibold text-[#1D1D1F]">
                        {reviewer.name}{' '}
                        <span className="font-normal text-[#6E6E73]">@{reviewer.handle}</span>
                      </p>
                      <p className="mt-1">
                        {reviewer.activeQualifications
                          .map((tag) => QUALIFICATION_LABELS[tag])
                          .join(', ')}
                      </p>
                    </li>
                  ))}
              </ul>
            </section>

            <details className="rounded-xl border border-black/[0.08]">
              <summary className="flex min-h-11 cursor-pointer items-center px-3 py-2 text-[11px] font-semibold text-[#0066CC]">
                Recent qualification decisions
              </summary>
              <ol className="space-y-2 border-t border-black/[0.07] p-3">
                {data.events.map((item) => (
                  <li key={item.id} className="text-[10px] leading-5 text-[#424245]">
                    <p className="flex items-start gap-1.5 font-semibold text-[#1D1D1F]">
                      <CheckCircle2
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0071E3]"
                        aria-hidden="true"
                      />
                      {item.action === 'GRANT' ? 'Granted' : 'Revoked'}{' '}
                      {QUALIFICATION_LABELS[item.expertiseTag]}{' '}
                      {item.action === 'GRANT' ? 'to' : 'from'} {item.reviewerName}
                    </p>
                    <p className="ml-5 break-words">{item.reason}</p>
                    <p className="ml-5 text-[9px] text-[#6E6E73]">{timeLabel(item.createdAt)}</p>
                  </li>
                ))}
              </ol>
            </details>
          </>
        ) : null}

        {visibleError && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] leading-5 text-rose-950"
          >
            {visibleError}
          </p>
        )}
        {visibleNotice && (
          <p
            role="status"
            data-testid="reviewer-qualification-notice"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] leading-5 text-emerald-950"
          >
            {visibleNotice}
          </p>
        )}
      </div>
    </details>
  )
}
