'use client'

// The server rechecks reviewer authorization; hiding these controls is presentation only.

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/components/app-context'
import { api } from '@/lib/api-client'
import {
  DECLINE_REASON_MAX_LENGTH,
  DECLINE_REASON_MIN_LENGTH,
  canReviewLegacyIdentityCorrection,
  declineReasonValidationError,
} from '@/lib/legacy-revision-review'

interface ReviewActionsProps {
  revisionId: string
  /** Distinguishes repeated controls for assistive technology. */
  drugName: string
  /** The account for which the server rendered these role-gated controls. */
  viewerAccountId: string
}

export function ReviewActions({ revisionId, drugName, viewerAccountId }: ReviewActionsProps) {
  const { currentUser } = useApp()
  const accountId = currentUser?.id ?? null
  const accountIdRef = useRef(accountId)
  accountIdRef.current = accountId
  const canReview = canReviewLegacyIdentityCorrection(currentUser)
  const canReviewRef = useRef(canReview)
  canReviewRef.current = canReview
  // These controls were server-rendered for this account. A different in-tab account must refresh
  // the queue before it can receive controls derived from its own permissions.
  const requestRef = useRef<{ generation: number; controller: AbortController | null }>({
    generation: 0,
    controller: null,
  })
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [isRequestingChanges, setIsRequestingChanges] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const reasonId = `review-reason-${revisionId}`
  const errorId = `review-error-${revisionId}`
  const controlsBelongToCurrentAccount =
    Boolean(accountId) && viewerAccountId === accountId && canReview

  useEffect(() => {
    requestRef.current.controller?.abort()
    requestRef.current.generation += 1
    requestRef.current.controller = null
    setIsPending(false)
    setIsRequestingChanges(false)
    setNote('')
    setError(null)
  }, [accountId, canReview, revisionId])

  const beginRequest = () => {
    requestRef.current.controller?.abort()
    const controller = new AbortController()
    const generation = requestRef.current.generation + 1
    requestRef.current = { generation, controller }
    return { accountId, controller, generation }
  }

  const requestIsCurrent = (request: ReturnType<typeof beginRequest>) =>
    !request.controller.signal.aborted &&
    requestRef.current.generation === request.generation &&
    accountIdRef.current === request.accountId &&
    canReviewRef.current &&
    request.accountId === viewerAccountId

  const handleApprove = async () => {
    if (!controlsBelongToCurrentAccount || isPending) return
    const request = beginRequest()
    let recorded = false
    setIsPending(true)
    setError(null)
    try {
      await api.reviewRevision(revisionId, 'approve', undefined, request.controller.signal)
      if (!requestIsCurrent(request)) return
      recorded = true
      router.refresh()
    } catch (caught) {
      if (requestIsCurrent(request)) {
        setError(caught instanceof Error ? caught.message : 'That decision could not be recorded.')
      }
    } finally {
      if (requestIsCurrent(request)) {
        requestRef.current.controller = null
        if (!recorded) setIsPending(false)
      }
    }
  }

  const handleRequestChanges = async () => {
    if (!controlsBelongToCurrentAccount || isPending) return
    const reason = note.trim()
    const validationError = declineReasonValidationError(reason)
    if (validationError) {
      setError(validationError)
      return
    }

    const request = beginRequest()
    let recorded = false
    setIsPending(true)
    setError(null)
    try {
      await api.reviewRevision(revisionId, 'reject', reason, request.controller.signal)
      if (!requestIsCurrent(request)) return
      recorded = true
      router.refresh()
    } catch (caught) {
      if (requestIsCurrent(request)) {
        setError(caught instanceof Error ? caught.message : 'That decision could not be recorded.')
      }
    } finally {
      if (requestIsCurrent(request)) {
        requestRef.current.controller = null
        if (!recorded) setIsPending(false)
      }
    }
  }

  if (!controlsBelongToCurrentAccount) {
    return (
      <div className="space-y-2 border-t border-black/[0.05] pt-3">
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          {viewerAccountId === accountId
            ? 'This account no longer has permission to review medicine-name corrections. Reload the queue to update its controls.'
            : 'The signed-in account changed. Reload the review queue before making a decision.'}
        </p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="min-h-11 rounded-xl border border-black/[0.1] bg-white px-4 text-xs font-semibold text-[#1D1D1F]"
        >
          Reload review controls
        </button>
      </div>
    )
  }

  return (
    <div className="pt-3 border-t border-black/[0.05] space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          aria-label={`Approve the identity correction for ${drugName}`}
          className="min-h-11 px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition shadow-xs active:scale-95"
        >
          {isPending ? 'Working…' : 'Approve'}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsRequestingChanges((open) => !open)
            setError(null)
          }}
          disabled={isPending}
          aria-expanded={isRequestingChanges}
          aria-controls={reasonId}
          aria-label={`Decline the identity correction for ${drugName}`}
          className="min-h-11 px-4 py-2 rounded-xl bg-white hover:bg-[#F5F5F7] disabled:opacity-50 text-[#1D1D1F] text-xs font-bold border border-black/[0.08] cursor-pointer transition shadow-xs active:scale-95"
        >
          Decline
        </button>
      </div>

      {isRequestingChanges && (
        <div id={reasonId} className="space-y-2">
          <label
            htmlFor={`review-note-${revisionId}`}
            className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73] block"
          >
            Why should this correction be declined?
          </label>
          <textarea
            id={`review-note-${revisionId}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            required
            minLength={DECLINE_REASON_MIN_LENGTH}
            maxLength={DECLINE_REASON_MAX_LENGTH}
            aria-describedby={error ? errorId : undefined}
            placeholder="The cited page does not show the proposed medicine or brand name…"
            className="w-full bg-[#F5F5F7] rounded-2xl p-3.5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 font-medium"
          />
          <button
            type="button"
            onClick={handleRequestChanges}
            disabled={isPending}
            className="min-h-11 px-4 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition shadow-xs active:scale-95"
          >
            {isPending ? 'Recording…' : 'Decline with this reason'}
          </button>
        </div>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-[11px] font-semibold text-rose-700">
          {error}
        </p>
      )}
    </div>
  )
}

export default ReviewActions
