'use client'

// The two controls a reviewer gets on a queued edit.
//
// The only client component on the review queue, and deliberately the smallest one that can do the
// job: the queue itself is a server component so that anyone — signed in or not, JavaScript or not
// — can read what is waiting. Deciding is the one part that genuinely needs interactivity, so it
// is the one part that ships JavaScript.
//
// Nothing here decides whether the viewer may review. The page renders this component only for a
// trusted/steward/admin viewer, and `POST /api/revisions/:id/review` checks the session again on
// the server. Hiding a button is presentation; the server is the gate.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'

interface ReviewActionsProps {
  revisionId: string
  /** Only for the assistive-technology labels, so two identical "Approve" buttons on one screen
   *  are distinguishable from each other. */
  drugName: string
}

export function ReviewActions({ revisionId, drugName }: ReviewActionsProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [isRequestingChanges, setIsRequestingChanges] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    setIsPending(true)
    setError(null)
    try {
      await api.reviewRevision(revisionId, 'approve')
      // The queue is server-rendered, so the decided row disappears on the next server render
      // rather than being spliced out of a local array. One source of truth.
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'That decision could not be recorded.')
      setIsPending(false)
    }
  }

  const handleRequestChanges = async () => {
    const reason = note.trim()
    if (reason.length === 0) {
      // A rejection with no reason is a dead end for the contributor: the note is what tells them
      // what to fix, so the form refuses rather than sending an empty one.
      setError('Say what needs to change, so the contributor can act on it.')
      return
    }

    setIsPending(true)
    setError(null)
    try {
      await api.reviewRevision(revisionId, 'reject', reason)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'That decision could not be recorded.')
      setIsPending(false)
    }
  }

  return (
    <div className="pt-3 border-t border-black/[0.05] space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          aria-label={`Approve the edit to ${drugName}`}
          className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition shadow-xs active:scale-95"
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
          aria-label={`Request changes to the edit to ${drugName}`}
          className="px-4 py-2 rounded-xl bg-white hover:bg-[#F5F5F7] disabled:opacity-50 text-[#1D1D1F] text-xs font-bold border border-black/[0.08] cursor-pointer transition shadow-xs active:scale-95"
        >
          Request changes
        </button>
      </div>

      {isRequestingChanges && (
        <div className="space-y-2">
          <label
            htmlFor={`review-note-${revisionId}`}
            className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block"
          >
            What needs to change
          </label>
          <textarea
            id={`review-note-${revisionId}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="The citation does not support the verdict as written…"
            className="w-full bg-[#F5F5F7] rounded-2xl p-3.5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 font-medium"
          />
          <button
            type="button"
            onClick={handleRequestChanges}
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition shadow-xs active:scale-95"
          >
            {isPending ? 'Sending…' : 'Send to the contributor'}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-[11px] font-semibold text-rose-700">
          {error}
        </p>
      )}
    </div>
  )
}

export default ReviewActions
