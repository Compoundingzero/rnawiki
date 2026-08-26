'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowUp } from 'lucide-react'
import Link from 'next/link'

import { useApp } from '@/components/app-context'
import { accountScopeKey, isCurrentAccountRequest } from '@/lib/account-request-scope'
import { api } from '@/lib/api-client'
import type { CommunityNote } from '@/lib/types'

interface CommunityCommentaryProps {
  medicineSlug: string
  initialNotes: CommunityNote[]
}

/** Keep this aligned with the server-side note limit without importing the database query. */
const NOTE_MAX_LENGTH = 4000

function noteDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function CommunityCommentary({ medicineSlug, initialNotes }: CommunityCommentaryProps) {
  const { currentUser, requireAuth } = useApp()
  const accountId = currentUser?.id ?? null
  const accountKey = accountScopeKey(accountId)
  const accountKeyRef = useRef(accountKey)
  accountKeyRef.current = accountKey
  const accountGenerationRef = useRef(0)
  const refreshControllerRef = useRef<AbortController | null>(null)
  const mutationControllersRef = useRef(new Set<AbortController>())
  const [notes, setNotes] = useState(initialNotes)
  const [notesAccountKey, setNotesAccountKey] = useState<string | null>(accountKey)
  const [content, setContent] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [pendingUpvoteIds, setPendingUpvoteIds] = useState<Set<string>>(() => new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    accountGenerationRef.current += 1
    const accountGeneration = accountGenerationRef.current
    refreshControllerRef.current?.abort()
    for (const controller of mutationControllersRef.current) controller.abort()
    mutationControllersRef.current.clear()
    setContent('')
    setIsPosting(false)
    setPendingUpvoteIds(new Set())
    setError(null)
    setNotesAccountKey(null)
    setIsRefreshing(true)

    const controller = new AbortController()
    refreshControllerRef.current = controller
    void api
      .communityNotes(medicineSlug, controller.signal)
      .then(({ notes: currentNotes }) => {
        if (
          isCurrentAccountRequest({
            accountKey,
            currentAccountKey: accountKeyRef.current,
            accountGeneration,
            currentAccountGeneration: accountGenerationRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          setNotes(currentNotes)
          setNotesAccountKey(accountKey)
        }
      })
      .catch((cause) => {
        if (
          isCurrentAccountRequest({
            accountKey,
            currentAccountKey: accountKeyRef.current,
            accountGeneration,
            currentAccountGeneration: accountGenerationRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          // Public note text and totals are safe as a fallback. A viewer-specific helpful mark is
          // not, so clear it when the fresh account-owned read fails.
          setNotes(initialNotes.map((note) => ({ ...note, hasUpvoted: false })))
          setNotesAccountKey(accountKey)
          setError(
            cause instanceof Error
              ? cause.message
              : 'Community commentary could not be refreshed just now.',
          )
        }
      })
      .finally(() => {
        if (
          isCurrentAccountRequest({
            accountKey,
            currentAccountKey: accountKeyRef.current,
            accountGeneration,
            currentAccountGeneration: accountGenerationRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          refreshControllerRef.current = null
          setIsRefreshing(false)
        }
      })

    return () => controller.abort()
  }, [accountKey, initialNotes, medicineSlug])

  const accountScopeIsCurrent = notesAccountKey === accountKey
  const visibleNotes = accountScopeIsCurrent ? notes : []
  const visibleContent = accountScopeIsCurrent ? content : ''
  const visibleError = accountScopeIsCurrent ? error : null

  const addNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const noteContent = visibleContent.trim()
    if (!noteContent) return
    if (!currentUser) {
      requireAuth()
      return
    }
    if (
      !accountScopeIsCurrent ||
      accountKeyRef.current !== accountKey ||
      isRefreshing ||
      isPosting
    ) {
      return
    }

    const accountGeneration = accountGenerationRef.current
    const controller = new AbortController()
    mutationControllersRef.current.add(controller)
    setIsPosting(true)
    setError(null)
    try {
      const { note } = await api.addNote(medicineSlug, noteContent, controller.signal)
      if (
        isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        setNotes((current) => [note, ...current])
        setContent('')
      }
    } catch (cause) {
      if (
        isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        setError(cause instanceof Error ? cause.message : 'The commentary could not be posted.')
      }
    } finally {
      mutationControllersRef.current.delete(controller)
      if (
        isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        setIsPosting(false)
      }
    }
  }

  const toggleHelpful = async (note: CommunityNote) => {
    if (!currentUser) {
      requireAuth()
      return
    }
    if (
      !accountScopeIsCurrent ||
      accountKeyRef.current !== accountKey ||
      isRefreshing ||
      pendingUpvoteIds.has(note.id)
    ) {
      return
    }

    const accountGeneration = accountGenerationRef.current
    const controller = new AbortController()
    mutationControllersRef.current.add(controller)
    const previousUpvotes = note.upvotes
    const previousState = Boolean(note.hasUpvoted)
    const nextState = !previousState
    setError(null)
    setPendingUpvoteIds((current) => new Set(current).add(note.id))
    setNotes((current) =>
      current.map((entry) =>
        entry.id === note.id
          ? {
              ...entry,
              hasUpvoted: nextState,
              upvotes: Math.max(0, entry.upvotes + (nextState ? 1 : -1)),
            }
          : entry,
      ),
    )

    try {
      const result = await api.toggleUpvote(note.id, controller.signal)
      if (
        isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        setNotes((current) =>
          current.map((entry) =>
            entry.id === note.id
              ? { ...entry, hasUpvoted: result.hasUpvoted, upvotes: result.upvotes }
              : entry,
          ),
        )
      }
    } catch (cause) {
      if (
        isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        setNotes((current) =>
          current.map((entry) =>
            entry.id === note.id
              ? { ...entry, hasUpvoted: previousState, upvotes: previousUpvotes }
              : entry,
          ),
        )
        setError(cause instanceof Error ? cause.message : 'That response could not be saved.')
      }
    } finally {
      mutationControllersRef.current.delete(controller)
      if (
        isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        setPendingUpvoteIds((current) => {
          const next = new Set(current)
          next.delete(note.id)
          return next
        })
      }
    }
  }

  const composer = (
    <form onSubmit={addNote} className="space-y-3">
      <label htmlFor="community-commentary-note" className="text-sm font-semibold text-[#1D1D1F]">
        Add community commentary
      </label>
      <textarea
        id="community-commentary-note"
        value={visibleContent}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Share a note about this medicine record"
        maxLength={NOTE_MAX_LENGTH}
        rows={3}
        className="block w-full resize-y rounded-2xl bg-[#F5F5F7] p-3.5 text-sm leading-5 text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
      />
      <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 break-words text-sm leading-6 text-[#6E6E73]">
          {currentUser
            ? `Posting as ${currentUser.name}. Commentary remains separate from evidence.`
            : 'You will be asked to sign in before posting.'}
        </p>
        <button
          type="submit"
          disabled={
            !accountScopeIsCurrent ||
            isRefreshing ||
            isPosting ||
            visibleContent.trim().length === 0
          }
          className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-[#0071E3] px-4 text-sm font-semibold text-white hover:bg-[#0077ED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isPosting ? 'Posting…' : 'Post commentary'}
        </button>
      </div>
      {visibleError && (
        <p role="alert" className="break-words text-sm font-semibold leading-6 text-rose-700">
          {visibleError}
        </p>
      )}
    </form>
  )

  if (visibleNotes.length === 0) {
    return (
      <details
        id="community-commentary"
        className="group scroll-mt-24 rounded-2xl border border-black/[0.08] bg-white px-4"
      >
        <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
          Add a community note
          <span aria-hidden="true" className="text-[#0066CC] group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="space-y-3 border-t border-black/[0.07] py-4">
          <p className="text-sm leading-6 text-[#6E6E73]">
            {isRefreshing || !accountScopeIsCurrent
              ? 'Refreshing community notes for this account…'
              : 'These are reader opinions. RNAWiki has not fact-checked them, and they do not change the reviewed answer above.'}
          </p>
          {composer}
        </div>
      </details>
    )
  }

  return (
    <section
      id="community-commentary"
      aria-labelledby="community-commentary-heading"
      className="scroll-mt-24 space-y-4 border-t border-black/[0.08] pt-8"
    >
      <header className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#0066CC]">
          Community notes
        </p>
        <h2 id="community-commentary-heading" className="text-xl font-bold text-[#1D1D1F]">
          Notes from signed-in contributors
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-[#6E6E73]">
          These are reader opinions. RNAWiki has not fact-checked them, and they do not change the
          reviewed answer above.
        </p>
      </header>

      <div className="space-y-4 rounded-[22px] bg-white p-5 sm:p-7">
        {composer}

        <ul
          className="space-y-3 border-t border-black/[0.07] pt-4"
          aria-label="Community commentary"
        >
          {visibleNotes.map((note) => (
            <li key={note.id} className="min-w-0 rounded-2xl bg-[#F5F5F7] p-4">
              <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0">
                  {note.authorHandle ? (
                    <Link
                      href={`/u/${encodeURIComponent(note.authorHandle)}`}
                      className="break-words text-sm font-bold text-[#1D1D1F] hover:text-[#0066CC] hover:underline"
                    >
                      {note.author}
                    </Link>
                  ) : (
                    <span className="break-words text-sm font-bold text-[#1D1D1F]">
                      {note.author}
                    </span>
                  )}
                  {note.authorHandle && (
                    <p className="mt-0.5 break-words text-xs leading-5 text-[#6E6E73]">
                      @{note.authorHandle}
                    </p>
                  )}
                </div>
                {note.date && (
                  <time dateTime={note.date} className="shrink-0 text-xs leading-5 text-[#6E6E73]">
                    {noteDate(note.date)}
                  </time>
                )}
              </div>
              <p className="mt-3 [overflow-wrap:anywhere] text-sm leading-6 text-[#424245]">
                {note.content}
              </p>
              <button
                type="button"
                onClick={() => toggleHelpful(note)}
                disabled={pendingUpvoteIds.has(note.id) || isRefreshing}
                aria-pressed={Boolean(note.hasUpvoted)}
                aria-label={
                  note.hasUpvoted
                    ? `Remove helpful mark from the commentary by ${note.author}`
                    : `Mark the commentary by ${note.author} as helpful`
                }
                className={`mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] ${
                  note.hasUpvoted
                    ? 'border-blue-200 bg-blue-50 text-[#0066CC]'
                    : 'border-black/[0.08] bg-white text-[#424245] hover:text-[#1D1D1F]'
                }`}
              >
                <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                Helpful · {note.upvotes.toLocaleString('en-US')}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
