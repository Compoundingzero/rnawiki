'use client'

import { CheckCircle2, LoaderCircle, ShieldCheck, Stethoscope, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useApp } from '@/components/app-context'
import {
  canManageInternalReviews,
  internalReviewCapabilityScopeKey,
  isCurrentInternalReviewRequest,
} from '@/lib/internal-review-request-scope'

type VerificationStatus = 'pending' | 'verified' | 'rejected'

interface VerificationQueueItem {
  id: string
  professionalFullName: string
  medicalSpecialty: string
  institution: string
  status: VerificationStatus
  submittedAt: string
  decidedAt: string | null
  account: { name: string; handle: string }
}

interface VerificationDetail extends VerificationQueueItem {
  workEmail: string
  medicalLicenseOrNpi: string
  decisionReason: string | null
  account: { name: string; handle: string; orcid: string | null }
  decidedBy: { name: string; handle: string } | null
}

interface ApiFailure {
  error?: string
}

async function internalRequest<T>(path: string, init?: RequestInit): Promise<T> {
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
      body = JSON.parse(text) as unknown
    } catch {
      throw new Error('RNAWiki could not read the server response. Nothing was changed.')
    }
  }
  if (!response.ok) {
    throw new Error((body as ApiFailure).error ?? `The request failed (${response.status}).`)
  }
  return body as T
}

function utcDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date)
}

export function PhysicianVerificationReviewPanel() {
  const { currentUser } = useApp()
  const accountId = currentUser?.id ?? null
  const canManage = canManageInternalReviews(currentUser)
  const capabilityScopeKey = internalReviewCapabilityScopeKey(currentUser)
  const capabilityScopeRef = useRef(capabilityScopeKey)
  capabilityScopeRef.current = capabilityScopeKey
  const accountRef = useRef(accountId)
  accountRef.current = accountId
  const scopeGenerationRef = useRef(0)
  const detailRequestRef = useRef<{
    generation: number
    requestId: string | null
    controller: AbortController | null
  }>({ generation: 0, requestId: null, controller: null })
  const actionRequestRef = useRef<{
    generation: number
    requestId: string | null
    controller: AbortController | null
  }>({ generation: 0, requestId: null, controller: null })
  const [view, setView] = useState<'pending' | 'decided'>('pending')
  const [items, setItems] = useState<VerificationQueueItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<VerificationDetail | null>(null)
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [stateCapabilityScopeKey, setStateCapabilityScopeKey] = useState(capabilityScopeKey)

  useEffect(() => {
    scopeGenerationRef.current += 1
    detailRequestRef.current.controller?.abort()
    detailRequestRef.current = {
      generation: detailRequestRef.current.generation + 1,
      requestId: null,
      controller: null,
    }
    actionRequestRef.current.controller?.abort()
    actionRequestRef.current = {
      generation: actionRequestRef.current.generation + 1,
      requestId: null,
      controller: null,
    }
    setItems([])
    setSelectedId(null)
    setDetail(null)
    setReason('')
    setIsLoading(canManage)
    setIsLoadingDetail(false)
    setIsSaving(false)
    setError(null)
    setNotice(null)
    setStateCapabilityScopeKey(capabilityScopeKey)

    return () => {
      scopeGenerationRef.current += 1
      detailRequestRef.current.controller?.abort()
      detailRequestRef.current.generation += 1
      detailRequestRef.current.requestId = null
      detailRequestRef.current.controller = null
      actionRequestRef.current.controller?.abort()
      actionRequestRef.current.generation += 1
      actionRequestRef.current.requestId = null
      actionRequestRef.current.controller = null
    }
  }, [canManage, capabilityScopeKey])

  useEffect(() => {
    if (!accountId || !canManage) {
      setItems([])
      setIsLoading(false)
      return
    }
    const controller = new AbortController()
    const scopeGeneration = scopeGenerationRef.current
    detailRequestRef.current.controller?.abort()
    detailRequestRef.current = {
      generation: detailRequestRef.current.generation + 1,
      requestId: null,
      controller: null,
    }
    actionRequestRef.current.controller?.abort()
    actionRequestRef.current = {
      generation: actionRequestRef.current.generation + 1,
      requestId: null,
      controller: null,
    }
    setIsLoading(true)
    setIsLoadingDetail(false)
    setIsSaving(false)
    setError(null)
    setSelectedId(null)
    setDetail(null)
    setReason('')
    void internalRequest<{ requests: VerificationQueueItem[] }>(
      `/api/physician-verifications?status=${view}&limit=50`,
      { signal: controller.signal },
    )
      .then((result) => {
        if (
          !controller.signal.aborted &&
          accountRef.current === accountId &&
          capabilityScopeRef.current === capabilityScopeKey &&
          scopeGenerationRef.current === scopeGeneration
        ) {
          setItems(result.requests)
        }
      })
      .catch((caught) => {
        if (
          !controller.signal.aborted &&
          accountRef.current === accountId &&
          capabilityScopeRef.current === capabilityScopeKey &&
          scopeGenerationRef.current === scopeGeneration
        ) {
          setError(caught instanceof Error ? caught.message : 'Verification work could not load.')
        }
      })
      .finally(() => {
        if (
          !controller.signal.aborted &&
          accountRef.current === accountId &&
          capabilityScopeRef.current === capabilityScopeKey &&
          scopeGenerationRef.current === scopeGeneration
        ) {
          setIsLoading(false)
        }
      })
    return () => controller.abort()
  }, [accountId, canManage, capabilityScopeKey, reload, view])

  const openDetail = async (id: string) => {
    if (!canManage || stateCapabilityScopeKey !== capabilityScopeKey) return
    detailRequestRef.current.controller?.abort()
    actionRequestRef.current.controller?.abort()
    actionRequestRef.current = {
      generation: actionRequestRef.current.generation + 1,
      requestId: null,
      controller: null,
    }
    const controller = new AbortController()
    const requestGeneration = detailRequestRef.current.generation + 1
    const scopeGeneration = scopeGenerationRef.current
    detailRequestRef.current = { generation: requestGeneration, requestId: id, controller }
    setSelectedId(id)
    setDetail(null)
    setReason('')
    setError(null)
    setNotice(null)
    setIsLoadingDetail(true)
    setIsSaving(false)
    try {
      const result = await internalRequest<{ request: VerificationDetail }>(
        `/api/physician-verifications/${encodeURIComponent(id)}`,
        { signal: controller.signal },
      )
      if (
        result.request.id === id &&
        capabilityScopeRef.current === capabilityScopeKey &&
        isCurrentInternalReviewRequest({
          accountId,
          currentAccountId: accountRef.current,
          requestId: id,
          currentRequestId: detailRequestRef.current.requestId,
          requestGeneration,
          currentRequestGeneration: detailRequestRef.current.generation,
          scopeGeneration,
          currentScopeGeneration: scopeGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        setDetail(result.request)
      }
    } catch (caught) {
      if (
        capabilityScopeRef.current === capabilityScopeKey &&
        isCurrentInternalReviewRequest({
          accountId,
          currentAccountId: accountRef.current,
          requestId: id,
          currentRequestId: detailRequestRef.current.requestId,
          requestGeneration,
          currentRequestGeneration: detailRequestRef.current.generation,
          scopeGeneration,
          currentScopeGeneration: scopeGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        setError(caught instanceof Error ? caught.message : 'That verification could not load.')
      }
    } finally {
      if (
        capabilityScopeRef.current === capabilityScopeKey &&
        isCurrentInternalReviewRequest({
          accountId,
          currentAccountId: accountRef.current,
          requestId: id,
          currentRequestId: detailRequestRef.current.requestId,
          requestGeneration,
          currentRequestGeneration: detailRequestRef.current.generation,
          scopeGeneration,
          currentScopeGeneration: scopeGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        detailRequestRef.current.controller = null
        setIsLoadingDetail(false)
      }
    }
  }

  const decide = async (decision: 'APPROVE' | 'REJECT') => {
    if (!canManage || stateCapabilityScopeKey !== capabilityScopeKey || !detail || isSaving) {
      return
    }
    const target = detail
    actionRequestRef.current.controller?.abort()
    const controller = new AbortController()
    const requestGeneration = actionRequestRef.current.generation + 1
    const scopeGeneration = scopeGenerationRef.current
    actionRequestRef.current = {
      generation: requestGeneration,
      requestId: target.id,
      controller,
    }
    setIsSaving(true)
    setError(null)
    setNotice(null)
    try {
      await internalRequest(
        `/api/physician-verifications/${encodeURIComponent(target.id)}/decision`,
        {
          method: 'POST',
          body: JSON.stringify({ decision, reason }),
          signal: controller.signal,
        },
      )
      if (
        capabilityScopeRef.current !== capabilityScopeKey ||
        !isCurrentInternalReviewRequest({
          accountId,
          currentAccountId: accountRef.current,
          requestId: target.id,
          currentRequestId: actionRequestRef.current.requestId,
          requestGeneration,
          currentRequestGeneration: actionRequestRef.current.generation,
          scopeGeneration,
          currentScopeGeneration: scopeGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        return
      }
      setNotice(
        `${target.professionalFullName}'s credentials were ${decision === 'APPROVE' ? 'approved' : 'rejected'}.`,
      )
      setSelectedId(null)
      setDetail(null)
      setReason('')
      setReload((value) => value + 1)
    } catch (caught) {
      if (
        capabilityScopeRef.current === capabilityScopeKey &&
        isCurrentInternalReviewRequest({
          accountId,
          currentAccountId: accountRef.current,
          requestId: target.id,
          currentRequestId: actionRequestRef.current.requestId,
          requestGeneration,
          currentRequestGeneration: actionRequestRef.current.generation,
          scopeGeneration,
          currentScopeGeneration: scopeGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        setError(caught instanceof Error ? caught.message : 'That decision could not be saved.')
      }
    } finally {
      if (
        capabilityScopeRef.current === capabilityScopeKey &&
        isCurrentInternalReviewRequest({
          accountId,
          currentAccountId: accountRef.current,
          requestId: target.id,
          currentRequestId: actionRequestRef.current.requestId,
          requestGeneration,
          currentRequestGeneration: actionRequestRef.current.generation,
          scopeGeneration,
          currentScopeGeneration: scopeGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        actionRequestRef.current.controller = null
        setIsSaving(false)
      }
    }
  }

  // Account state can change during render, before the cleanup effect above has run. Never render
  // or act on the previous account's private queue during that gap.
  const accountScopeIsCurrent = canManage && stateCapabilityScopeKey === capabilityScopeKey
  const visibleItems = accountScopeIsCurrent ? items : []
  const visibleSelectedId = accountScopeIsCurrent ? selectedId : null
  const visibleDetail = accountScopeIsCurrent ? detail : null
  const visibleIsLoading = accountScopeIsCurrent ? isLoading : canManage
  const visibleIsLoadingDetail = accountScopeIsCurrent && isLoadingDetail
  const visibleIsSaving = accountScopeIsCurrent && isSaving
  const visibleNotice = accountScopeIsCurrent ? notice : null
  const visibleError = accountScopeIsCurrent ? error : null

  return (
    <details className="rounded-2xl border border-black/[0.08] bg-white">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-4 py-3 text-xs font-semibold text-[#1D1D1F]">
        <Stethoscope className="h-4 w-4 text-[#0071E3]" aria-hidden="true" />
        Physician credential review
        {view === 'pending' && visibleItems.length > 0 && (
          <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-[#0066CC]">
            {visibleItems.length} waiting
          </span>
        )}
      </summary>

      <div className="space-y-4 border-t border-black/[0.07] p-4 sm:p-5">
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          Private licence and workplace details are visible only to stewards and administrators.
          Approval adds the physician badge; it does not grant scientific review qualifications.
        </p>

        <div className="flex gap-2" role="group" aria-label="Credential review records">
          {(['pending', 'decided'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              aria-pressed={view === option}
              className={`min-h-11 rounded-full border px-3 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] ${
                view === option
                  ? 'border-[#0071E3] bg-blue-50 text-[#0066CC]'
                  : 'border-black/[0.08] text-[#424245]'
              }`}
            >
              {option === 'pending' ? 'Waiting' : 'Recent decisions'}
            </button>
          ))}
        </div>

        {visibleIsLoading ? (
          <p className="flex items-center gap-2 text-xs text-[#6E6E73]">
            <LoaderCircle
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            Loading credential review work…
          </p>
        ) : visibleItems.length === 0 ? (
          <p className="text-xs leading-5 text-[#6E6E73]">
            {view === 'pending'
              ? 'No physician credentials are waiting for review.'
              : 'No credential decisions are recorded yet.'}
          </p>
        ) : (
          <ul className="space-y-2" aria-label="Physician verification requests">
            {visibleItems.map((item) => (
              <li key={item.id} className="rounded-xl bg-[#F5F5F7] p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-xs font-semibold text-[#1D1D1F]">
                      {item.professionalFullName}
                    </p>
                    <p className="break-words text-[11px] leading-5 text-[#6E6E73]">
                      {item.medicalSpecialty} · {item.institution} · submitted{' '}
                      {utcDate(item.submittedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void openDetail(item.id)}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-black/[0.1] bg-white px-3 text-[11px] font-semibold text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
                  >
                    {visibleSelectedId === item.id && visibleIsLoadingDetail
                      ? 'Loading…'
                      : 'Open record'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {visibleDetail && (
          <article className="space-y-4 rounded-2xl border border-black/[0.08] p-4">
            <div>
              <p className="text-xs font-bold text-[#1D1D1F]">
                {visibleDetail.professionalFullName}
              </p>
              <p className="text-[11px] leading-5 text-[#6E6E73]">
                Account: {visibleDetail.account.name} (@{visibleDetail.account.handle})
                {visibleDetail.account.orcid ? ` · ORCID ${visibleDetail.account.orcid}` : ''}
              </p>
            </div>
            <dl className="grid gap-3 text-[11px] sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-[#6E6E73]">Licence or NPI</dt>
                <dd className="mt-1 break-all font-mono text-[#1D1D1F]">
                  {visibleDetail.medicalLicenseOrNpi}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#6E6E73]">Professional email</dt>
                <dd className="mt-1 break-all text-[#1D1D1F]">{visibleDetail.workEmail}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#6E6E73]">Specialty</dt>
                <dd className="mt-1 break-words text-[#1D1D1F]">
                  {visibleDetail.medicalSpecialty}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#6E6E73]">Institution</dt>
                <dd className="mt-1 break-words text-[#1D1D1F]">{visibleDetail.institution}</dd>
              </div>
            </dl>

            {visibleDetail.status === 'pending' ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  void decide('APPROVE')
                }}
                className="space-y-3 border-t border-black/[0.07] pt-4"
              >
                <label
                  htmlFor={`verification-reason-${visibleDetail.id}`}
                  className="text-xs font-semibold"
                >
                  Reason for the decision
                </label>
                <textarea
                  id={`verification-reason-${visibleDetail.id}`}
                  required
                  minLength={8}
                  maxLength={2000}
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Record what was checked and why it supports approval or rejection."
                  className="block w-full rounded-xl border border-black/[0.12] p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={visibleIsSaving || reason.trim().length < 8}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0071E3] px-4 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {visibleIsSaving ? (
                      <LoaderCircle
                        className="h-4 w-4 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                    ) : (
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    )}
                    Approve credentials
                  </button>
                  <button
                    type="button"
                    disabled={visibleIsSaving || reason.trim().length < 8}
                    onClick={() => void decide('REJECT')}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 text-xs font-semibold text-rose-800 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    Reject credentials
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-1 border-t border-black/[0.07] pt-4 text-[11px] leading-5">
                <p className="flex items-center gap-2 font-semibold text-[#1D1D1F]">
                  {visibleDetail.status === 'verified' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-700" aria-hidden="true" />
                  )}
                  {visibleDetail.status === 'verified' ? 'Approved' : 'Rejected'}
                  {visibleDetail.decidedAt ? ` ${utcDate(visibleDetail.decidedAt)}` : ''}
                </p>
                {visibleDetail.decisionReason && <p>{visibleDetail.decisionReason}</p>}
                {visibleDetail.decidedBy && (
                  <p className="text-[#6E6E73]">
                    By {visibleDetail.decidedBy.name} (@{visibleDetail.decidedBy.handle})
                  </p>
                )}
              </div>
            )}
          </article>
        )}

        {visibleNotice && (
          <p role="status" className="flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {visibleNotice}
          </p>
        )}
        {visibleError && (
          <p role="alert" className="text-xs font-semibold text-rose-700">
            {visibleError}
          </p>
        )}
      </div>
    </details>
  )
}
