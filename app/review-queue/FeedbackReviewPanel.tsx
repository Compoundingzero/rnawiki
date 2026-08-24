'use client'

import { CheckCircle2, LoaderCircle, MessageSquareText } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useApp } from '@/components/app-context'
import {
  canManageInternalReviews,
  internalReviewCapabilityScopeKey,
  isCurrentInternalReviewRequest,
} from '@/lib/internal-review-request-scope'

interface FeedbackQueueItem {
  id: string
  type: 'suggestion' | 'correction' | 'request'
  message: string
  email?: string
  drugSlug?: string
  createdAt: string
  account: { name: string; handle: string } | null
  resolved: boolean
  resolvedAt: string | null
  resolutionNote: string | null
  resolvedBy: { name: string; handle: string } | null
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

export function FeedbackReviewPanel() {
  const { currentUser } = useApp()
  const accountId = currentUser?.id ?? null
  const canManage = canManageInternalReviews(currentUser)
  const capabilityScopeKey = internalReviewCapabilityScopeKey(currentUser)
  const capabilityScopeRef = useRef(capabilityScopeKey)
  capabilityScopeRef.current = capabilityScopeKey
  const accountRef = useRef(accountId)
  accountRef.current = accountId
  const scopeGenerationRef = useRef(0)
  const actionRequestRef = useRef<{
    generation: number
    requestId: string | null
    controller: AbortController | null
  }>({ generation: 0, requestId: null, controller: null })
  const [view, setView] = useState<'open' | 'resolved'>('open')
  const [items, setItems] = useState<FeedbackQueueItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [stateCapabilityScopeKey, setStateCapabilityScopeKey] = useState(capabilityScopeKey)

  useEffect(() => {
    scopeGenerationRef.current += 1
    actionRequestRef.current.controller?.abort()
    actionRequestRef.current = {
      generation: actionRequestRef.current.generation + 1,
      requestId: null,
      controller: null,
    }
    setItems([])
    setSelectedId(null)
    setNote('')
    setIsLoading(canManage)
    setIsSaving(false)
    setError(null)
    setNotice(null)
    setStateCapabilityScopeKey(capabilityScopeKey)

    return () => {
      scopeGenerationRef.current += 1
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
    actionRequestRef.current.controller?.abort()
    actionRequestRef.current = {
      generation: actionRequestRef.current.generation + 1,
      requestId: null,
      controller: null,
    }
    setIsLoading(true)
    setIsSaving(false)
    setError(null)
    setSelectedId(null)
    setNote('')
    void internalRequest<{ items: FeedbackQueueItem[] }>(`/api/feedback?status=${view}&limit=50`, {
      signal: controller.signal,
    })
      .then((result) => {
        if (
          !controller.signal.aborted &&
          accountRef.current === accountId &&
          capabilityScopeRef.current === capabilityScopeKey &&
          scopeGenerationRef.current === scopeGeneration
        ) {
          setItems(result.items)
        }
      })
      .catch((caught) => {
        if (
          !controller.signal.aborted &&
          accountRef.current === accountId &&
          capabilityScopeRef.current === capabilityScopeKey &&
          scopeGenerationRef.current === scopeGeneration
        ) {
          setError(caught instanceof Error ? caught.message : 'Feedback work could not load.')
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

  // Account state can change during render, before the cleanup effect above has run. Never render
  // or act on the previous account's private feedback during that gap.
  const accountScopeIsCurrent = canManage && stateCapabilityScopeKey === capabilityScopeKey
  const visibleItems = accountScopeIsCurrent ? items : []
  const visibleSelectedId = accountScopeIsCurrent ? selectedId : null
  const visibleIsLoading = accountScopeIsCurrent ? isLoading : canManage
  const visibleIsSaving = accountScopeIsCurrent && isSaving
  const visibleNotice = accountScopeIsCurrent ? notice : null
  const visibleError = accountScopeIsCurrent ? error : null
  const selected = visibleItems.find((item) => item.id === visibleSelectedId) ?? null

  const selectFeedback = (id: string) => {
    actionRequestRef.current.controller?.abort()
    actionRequestRef.current = {
      generation: actionRequestRef.current.generation + 1,
      requestId: null,
      controller: null,
    }
    setSelectedId(id)
    setNote('')
    setIsSaving(false)
    setError(null)
    setNotice(null)
  }

  const resolve = async () => {
    if (!accountScopeIsCurrent || !canManage || !selected || isSaving) return
    const target = selected
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
      await internalRequest(`/api/feedback/${encodeURIComponent(target.id)}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ note }),
        signal: controller.signal,
      })
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
      setNotice('The report was marked resolved and the decision was recorded.')
      setSelectedId(null)
      setNote('')
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
        setError(caught instanceof Error ? caught.message : 'The report could not be resolved.')
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

  return (
    <details className="rounded-2xl border border-black/[0.08] bg-white">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-4 py-3 text-xs font-semibold text-[#1D1D1F]">
        <MessageSquareText className="h-4 w-4 text-[#0071E3]" aria-hidden="true" />
        Reader feedback
        {view === 'open' && visibleItems.length > 0 && (
          <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-[#0066CC]">
            {visibleItems.length} open
          </span>
        )}
      </summary>

      <div className="space-y-4 border-t border-black/[0.07] p-4 sm:p-5">
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          Contact details are shown only to stewards and administrators. The anonymous abuse-control
          fingerprint is never included in this queue.
        </p>

        <div className="flex gap-2" role="group" aria-label="Feedback records">
          {(['open', 'resolved'] as const).map((option) => (
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
              {option === 'open' ? 'Open reports' : 'Resolved reports'}
            </button>
          ))}
        </div>

        {visibleIsLoading ? (
          <p className="flex items-center gap-2 text-xs text-[#6E6E73]">
            <LoaderCircle
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            Loading feedback…
          </p>
        ) : visibleItems.length === 0 ? (
          <p className="text-xs leading-5 text-[#6E6E73]">
            {view === 'open' ? 'No feedback is waiting.' : 'No resolved feedback is recorded yet.'}
          </p>
        ) : (
          <ul className="space-y-2" aria-label="Feedback queue">
            {visibleItems.map((item) => (
              <li key={item.id} className="rounded-xl bg-[#F5F5F7] p-3">
                <button
                  type="button"
                  onClick={() => selectFeedback(item.id)}
                  aria-pressed={visibleSelectedId === item.id}
                  className="block min-h-11 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-[#0066CC]">
                    {item.type}
                    {item.drugSlug ? ` · ${item.drugSlug}` : ''}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#1D1D1F]">
                    {item.message}
                  </span>
                  <span className="mt-1 block text-[10px] text-[#6E6E73]">
                    {utcDate(item.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {selected && (
          <article className="space-y-4 rounded-2xl border border-black/[0.08] p-4">
            <div className="space-y-1">
              <p className="whitespace-pre-wrap break-words text-xs leading-5 text-[#1D1D1F]">
                {selected.message}
              </p>
              <p className="text-[11px] text-[#6E6E73]">
                Reporter:{' '}
                {selected.account
                  ? `${selected.account.name} (@${selected.account.handle})`
                  : 'not signed in'}
                {selected.email ? ` · ${selected.email}` : ' · no contact email supplied'}
              </p>
            </div>

            {!selected.resolved ? (
              <form
                className="space-y-3 border-t border-black/[0.07] pt-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  void resolve()
                }}
              >
                <label htmlFor={`feedback-note-${selected.id}`} className="text-xs font-semibold">
                  Resolution note
                </label>
                <textarea
                  id={`feedback-note-${selected.id}`}
                  required
                  minLength={8}
                  maxLength={2000}
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Record what was checked or changed before closing this report."
                  className="block w-full rounded-xl border border-black/[0.12] p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
                />
                <button
                  type="submit"
                  disabled={visibleIsSaving || note.trim().length < 8}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0071E3] px-4 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {visibleIsSaving ? (
                    <LoaderCircle
                      className="h-4 w-4 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  )}
                  Mark resolved
                </button>
              </form>
            ) : (
              <div className="space-y-1 border-t border-black/[0.07] pt-4 text-[11px] leading-5">
                <p className="font-semibold text-[#1D1D1F]">
                  Resolved {selected.resolvedAt ? utcDate(selected.resolvedAt) : ''}
                </p>
                {selected.resolutionNote && <p>{selected.resolutionNote}</p>}
                {selected.resolvedBy && (
                  <p className="text-[#6E6E73]">
                    By {selected.resolvedBy.name} (@{selected.resolvedBy.handle})
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
