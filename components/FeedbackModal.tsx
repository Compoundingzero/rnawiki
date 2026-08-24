'use client'

/** Feedback is saved through `/api/feedback`. On medicine routes, the route slug is included so a
 * correction reaches the right record. Failed submissions keep the reader's text in the form. */

import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { CheckCircle2, MessageSquare, Send } from 'lucide-react'
import { api, ApiError } from '@/lib/api-client'
import { useApp } from './app-context'
import { ModalShell } from './ModalShell'

type FeedbackType = 'suggestion' | 'correction' | 'request'

/** How long the reference left the thank-you on screen before closing itself. */
const SUCCESS_DISMISS_MS = 1500

/**
 * The dossier slug from the current path, or undefined anywhere else.
 *
 * `/d/<slug>` and `/d/<slug>/history` both belong to the same record, so only the second segment
 * is read. Written as a split rather than a regex so `noUncheckedIndexedAccess` forces the
 * "not on a dossier" case to be handled instead of producing `undefined` at runtime.
 */
function drugSlugFrom(pathname: string): string | undefined {
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] !== 'd') return undefined
  const slug = segments[1]
  return slug ? decodeURIComponent(slug) : undefined
}

function placeholderFor(type: FeedbackType): string {
  if (type === 'correction') {
    return 'Tell us which medicine, number, price, or source looks wrong...'
  }
  if (type === 'request') {
    return 'Which medicine should RNAWiki add or review next?'
  }
  return 'How could RNAWiki be clearer or more useful to you?'
}

const TYPE_TAB_CLASS =
  'flex-1 py-1 rounded-lg transition cursor-pointer whitespace-nowrap text-center'

export function FeedbackModal() {
  const { openModal, setOpenModal } = useApp()
  const openModalRef = useRef(openModal)
  openModalRef.current = openModal
  const modalGenerationRef = useRef(0)
  const requestControllerRef = useRef<AbortController | null>(null)
  const pathname = usePathname()
  const isOpen = openModal === 'feedback'
  const headingId = useId()

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion')
  const [feedbackText, setFeedbackText] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [isSending, setIsSending] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // The auto-dismiss timer is held so closing by hand — Escape, the X, the backdrop — cannot
  // leave it running to close a dialog the reader has since reopened.
  const dismissTimer = useRef<number | null>(null)

  const clearDismissTimer = () => {
    if (dismissTimer.current !== null) {
      window.clearTimeout(dismissTimer.current)
      dismissTimer.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (dismissTimer.current !== null) window.clearTimeout(dismissTimer.current)
    }
  }, [])

  const reset = () => {
    clearDismissTimer()
    setFeedbackType('suggestion')
    setFeedbackText('')
    setUserEmail('')
    setIsSending(false)
    setIsSubmitted(false)
    setError(null)
  }

  useEffect(() => {
    modalGenerationRef.current += 1
    requestControllerRef.current?.abort()
    requestControllerRef.current = null
    clearDismissTimer()
    if (!isOpen) {
      setFeedbackType('suggestion')
      setFeedbackText('')
      setUserEmail('')
      setIsSending(false)
      setIsSubmitted(false)
      setError(null)
    }
  }, [isOpen])

  const handleClose = () => {
    modalGenerationRef.current += 1
    requestControllerRef.current?.abort()
    requestControllerRef.current = null
    reset()
    if (openModalRef.current === 'feedback') setOpenModal(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSending || openModalRef.current !== 'feedback') return

    const message = feedbackText.trim()
    if (!message) {
      setError('Please write a message before sending.')
      return
    }

    setError(null)
    requestControllerRef.current?.abort()
    const controller = new AbortController()
    requestControllerRef.current = controller
    const modalGeneration = modalGenerationRef.current
    setIsSending(true)
    try {
      const email = userEmail.trim()
      const drugSlug = drugSlugFrom(pathname)
      await api.sendFeedback(
        {
          type: feedbackType,
          message,
          ...(email ? { email } : {}),
          ...(drugSlug ? { drugSlug } : {}),
        },
        controller.signal,
      )
      if (
        controller.signal.aborted ||
        modalGenerationRef.current !== modalGeneration ||
        openModalRef.current !== 'feedback'
      ) {
        return
      }
      setIsSubmitted(true)
      dismissTimer.current = window.setTimeout(() => {
        if (modalGenerationRef.current !== modalGeneration || openModalRef.current !== 'feedback') {
          return
        }
        modalGenerationRef.current += 1
        reset()
        setOpenModal(null)
      }, SUCCESS_DISMISS_MS)
    } catch (thrown) {
      if (
        !controller.signal.aborted &&
        modalGenerationRef.current === modalGeneration &&
        openModalRef.current === 'feedback'
      ) {
        if (thrown instanceof ApiError && thrown.status === 429) {
          setError('You have sent a few already today — try again later.')
        } else {
          setError(
            thrown instanceof Error
              ? thrown.message
              : 'That could not be sent. Your note is still here — try again.',
          )
        }
      }
    } finally {
      if (
        !controller.signal.aborted &&
        modalGenerationRef.current === modalGeneration &&
        openModalRef.current === 'feedback'
      ) {
        requestControllerRef.current = null
        setIsSending(false)
      }
    }
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      labelledBy={headingId}
      maxWidth="max-w-sm"
      closeDisabled={isSending}
    >
      <div className="p-5 sm:p-6 space-y-4">
        {isSubmitted ? (
          <div className="py-6 text-center space-y-2 animate-zoom-in">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 id={headingId} className="text-sm font-bold text-[#1D1D1F]">
              Feedback received
            </h3>
            <p className="text-xs text-[#6E6E73] max-w-xs mx-auto">
              Thanks. Your message has been saved for the RNAWiki team.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </div>
              <div>
                <h3 id={headingId} className="text-sm font-bold text-[#1D1D1F]">
                  Send feedback
                </h3>
                <p className="text-[11px] text-[#6E6E73]">
                  Share a suggestion, report a correction, or request a medicine.
                </p>
              </div>
            </div>

            {/* Type Selector */}
            <div className="flex gap-1 p-1 bg-black/[0.04] rounded-xl text-xs font-medium text-[#6E6E73]">
              <button
                type="button"
                aria-pressed={feedbackType === 'suggestion'}
                onClick={() => setFeedbackType('suggestion')}
                className={`${TYPE_TAB_CLASS} ${
                  feedbackType === 'suggestion'
                    ? 'bg-white text-[#1D1D1F] font-bold shadow-xs'
                    : 'hover:text-[#1D1D1F]'
                }`}
              >
                Idea
              </button>
              <button
                type="button"
                aria-pressed={feedbackType === 'correction'}
                onClick={() => setFeedbackType('correction')}
                className={`${TYPE_TAB_CLASS} ${
                  feedbackType === 'correction'
                    ? 'bg-white text-[#1D1D1F] font-bold shadow-xs'
                    : 'hover:text-[#1D1D1F]'
                }`}
              >
                Correction
              </button>
              <button
                type="button"
                aria-pressed={feedbackType === 'request'}
                onClick={() => setFeedbackType('request')}
                className={`${TYPE_TAB_CLASS} ${
                  feedbackType === 'request'
                    ? 'bg-white text-[#1D1D1F] font-bold shadow-xs'
                    : 'hover:text-[#1D1D1F]'
                }`}
              >
                Request
              </button>
            </div>

            {/* Message Area */}
            <div>
              <textarea
                required
                rows={3}
                aria-label="Your feedback"
                placeholder={placeholderFor(feedbackType)}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full bg-[#F5F5F7] text-xs text-[#1D1D1F] p-3 rounded-2xl border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none resize-none"
              />
            </div>

            {/* Optional Email */}
            <div>
              <input
                type="email"
                aria-label="Optional email for follow-up"
                placeholder="Optional email for follow-up"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-[#F5F5F7] text-xs text-[#1D1D1F] px-3 py-1.5 rounded-xl border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none"
              />
            </div>

            {error && (
              <p role="alert" className="text-[11px] font-semibold text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 rounded-full bg-[#1D1D1F] hover:bg-black disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
            >
              {isSending ? (
                <>
                  <span
                    className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"
                    aria-hidden="true"
                  />
                  <span>Sending…</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>Send feedback</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </ModalShell>
  )
}

export default FeedbackModal
