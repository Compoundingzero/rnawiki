'use client'

import { ArrowRight, ExternalLink, PencilLine, Send } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { ModalShell } from '@/components/ModalShell'
import { useApp } from '@/components/app-context'
import { api } from '@/lib/api-client'
import type { LegacyIdentityCorrectionField } from '@/lib/types'

interface LegacyIdentityCorrectionActionsProps {
  slug: string
  name: string
  tradeName?: string
}

const HEADING_ID = 'legacy-identity-correction-heading'

export function LegacyIdentityCorrectionActions({
  slug,
  name,
  tradeName,
}: LegacyIdentityCorrectionActionsProps) {
  const { currentUser, requireAuth } = useApp()
  const accountId = currentUser?.id ?? null
  const accountIdRef = useRef(accountId)
  accountIdRef.current = accountId
  const accountGenerationRef = useRef(0)
  const requestControllerRef = useRef<AbortController | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [field, setField] = useState<LegacyIdentityCorrectionField>('name')
  const [proposedValue, setProposedValue] = useState('')
  const [removeTradeName, setRemoveTradeName] = useState(false)
  const [sourceTitle, setSourceTitle] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [explanation, setExplanation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<{ revisionId: string; itemsWaiting: number } | null>(
    null,
  )
  const [privateStateAccountId, setPrivateStateAccountId] = useState(accountId)

  useEffect(() => {
    accountGenerationRef.current += 1
    requestControllerRef.current?.abort()
    requestControllerRef.current = null
    setIsOpen(false)
    setField('name')
    setProposedValue('')
    setRemoveTradeName(false)
    setSourceTitle('')
    setSourceUrl('')
    setExplanation('')
    setIsSubmitting(false)
    setError(null)
    setSubmitted(null)
    setPrivateStateAccountId(accountId)

    return () => {
      accountGenerationRef.current += 1
      requestControllerRef.current?.abort()
      requestControllerRef.current = null
    }
  }, [accountId])

  const privateScopeIsCurrent = privateStateAccountId === accountId

  const openCorrection = () => {
    if (!currentUser) {
      requireAuth()
      return
    }
    if (!privateScopeIsCurrent || accountIdRef.current !== accountId) return
    setError(null)
    setSubmitted(null)
    setPrivateStateAccountId(accountId)
    setIsOpen(true)
  }

  const closeCorrection = () => {
    if (isSubmitting) return
    setIsOpen(false)
  }

  const selectField = (nextField: LegacyIdentityCorrectionField) => {
    setField(nextField)
    setProposedValue('')
    setRemoveTradeName(false)
    setError(null)
  }

  const submitCorrection = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentUser) {
      setIsOpen(false)
      requireAuth()
      return
    }
    if (!accountId || !privateScopeIsCurrent || accountIdRef.current !== accountId || isSubmitting)
      return

    const nextValue = field === 'tradeName' && removeTradeName ? null : proposedValue.trim()
    if (nextValue !== null && nextValue.length === 0) {
      setError(`Enter the corrected ${field === 'name' ? 'medicine name' : 'trade or brand name'}.`)
      return
    }

    setIsSubmitting(true)
    setError(null)
    const accountGeneration = accountGenerationRef.current
    requestControllerRef.current?.abort()
    const controller = new AbortController()
    requestControllerRef.current = controller
    try {
      const result = await api.submitRevision(
        slug,
        {
          field,
          proposedValue: nextValue,
          sourceTitle: sourceTitle.trim(),
          sourceUrl: sourceUrl.trim(),
          explanation: explanation.trim(),
        },
        controller.signal,
      )
      if (
        controller.signal.aborted ||
        accountGenerationRef.current !== accountGeneration ||
        accountIdRef.current !== accountId
      ) {
        return
      }
      setSubmitted({ revisionId: result.revisionId, itemsWaiting: result.itemsWaiting })
    } catch (caught) {
      if (
        controller.signal.aborted ||
        accountGenerationRef.current !== accountGeneration ||
        accountIdRef.current !== accountId
      ) {
        return
      }
      setError(
        caught instanceof Error
          ? caught.message
          : 'The correction could not be submitted. Nothing was changed.',
      )
    } finally {
      if (
        !controller.signal.aborted &&
        accountGenerationRef.current === accountGeneration &&
        accountIdRef.current === accountId
      ) {
        requestControllerRef.current = null
        setIsSubmitting(false)
      }
    }
  }

  const currentValue = field === 'name' ? name : (tradeName ?? 'Not recorded')
  const previewValue =
    field === 'tradeName' && removeTradeName
      ? 'Not recorded'
      : proposedValue.trim() || 'Enter a corrected value'

  return (
    <section
      aria-labelledby="legacy-correction-heading"
      className="rounded-[22px] border border-black/[0.08] bg-white p-5 sm:p-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-lg">
          <p className="font-mono text-[10px] uppercase tracking-wide text-[#0071E3]">
            Help correct this older record
          </p>
          <h3 id="legacy-correction-heading" className="mt-1 text-lg font-bold text-[#1D1D1F]">
            Found a name that is wrong?
          </h3>
          <p className="mt-2 text-xs leading-5 text-[#6E6E73]">
            You can suggest one medicine name or trade/brand name correction and show where the
            correct name appears. Another person reviews every suggestion before the public record
            changes.
          </p>
          <p className="mt-2 text-xs leading-5 text-[#6E6E73]">
            To correct scientific evidence or an answer, choose the exact use and study so reviewers
            know which public answer could change.
          </p>
        </div>
        <button
          type="button"
          onClick={openCorrection}
          className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-[#0071E3] px-4 py-2.5 text-left text-xs font-semibold text-white transition hover:bg-[#0077ED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 sm:w-auto sm:min-w-56"
        >
          <span className="inline-flex items-center gap-2">
            <PencilLine className="h-4 w-4" aria-hidden="true" />
            Suggest a correction
          </span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <ModalShell
        isOpen={isOpen && privateScopeIsCurrent}
        onClose={closeCorrection}
        closeDisabled={isSubmitting}
        labelledBy={HEADING_ID}
        maxWidth="max-w-lg"
      >
        <div className="p-5 pt-12 sm:p-7 sm:pt-12">
          {submitted ? (
            <div className="space-y-5" role="status">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-emerald-700">
                  Sent for independent review
                </p>
                <h2 id={HEADING_ID} className="mt-1 text-2xl font-bold text-[#1D1D1F]">
                  Your correction is in the queue
                </h2>
              </div>
              <p className="text-sm leading-6 text-[#424245]">
                The public medicine record has not changed. A different person must check the cited
                page and decide whether to publish this correction.
              </p>
              <div className="rounded-2xl bg-[#F5F5F7] p-4 text-xs leading-5 text-[#424245]">
                <p>
                  {submitted.itemsWaiting.toLocaleString()}{' '}
                  {submitted.itemsWaiting === 1 ? 'item was' : 'items were'} waiting when this
                  correction was submitted. The total can change as people review the queue.
                </p>
                <details className="mt-2">
                  <summary className="min-h-11 cursor-pointer py-2 font-semibold text-[#1D1D1F]">
                    Technical reference
                  </summary>
                  <code className="block break-all font-mono text-[10px]">
                    {submitted.revisionId}
                  </code>
                </details>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/review-queue"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0071E3] px-4 py-2.5 text-xs font-semibold text-white"
                >
                  Open the review queue
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={closeCorrection}
                  className="min-h-11 rounded-xl border border-black/[0.1] px-4 py-2.5 text-xs font-semibold text-[#1D1D1F]"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={submitCorrection}>
              <header>
                <p className="font-mono text-[10px] uppercase tracking-wide text-[#0071E3]">
                  Older medicine record
                </p>
                <h2 id={HEADING_ID} className="mt-1 text-2xl font-bold text-[#1D1D1F]">
                  Suggest a correction
                </h2>
                <p className="mt-2 text-xs leading-5 text-[#6E6E73]">
                  Choose one name field. The source is supplied by you; RNAWiki does not fetch it or
                  claim that software verified it. A reviewer opens it and checks the name.
                </p>
              </header>

              <fieldset className="space-y-2">
                <legend className="text-xs font-bold text-[#1D1D1F]">What is wrong?</legend>
                {(
                  [
                    ['name', 'Medicine name'],
                    ['tradeName', 'Trade or brand name'],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-black/[0.1] px-3 py-2 text-xs font-semibold text-[#1D1D1F]"
                  >
                    <input
                      type="radio"
                      name="identity-field"
                      value={value}
                      checked={field === value}
                      onChange={() => selectField(value)}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>

              <div className="rounded-2xl bg-[#F5F5F7] p-4 text-xs leading-5">
                <p>
                  <span className="font-semibold text-[#6E6E73]">Currently recorded:</span>{' '}
                  <span className="break-words text-[#1D1D1F]">{currentValue}</span>
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-[#6E6E73]">Proposed:</span>{' '}
                  <span className="break-words text-[#1D1D1F]">{previewValue}</span>
                </p>
              </div>

              <div>
                <label
                  htmlFor="legacy-correction-value"
                  className="text-xs font-bold text-[#1D1D1F]"
                >
                  Corrected {field === 'name' ? 'medicine name' : 'trade or brand name'}
                </label>
                <input
                  id="legacy-correction-value"
                  type="text"
                  value={proposedValue}
                  onChange={(event) => setProposedValue(event.target.value)}
                  disabled={field === 'tradeName' && removeTradeName}
                  maxLength={field === 'name' ? 300 : 400}
                  required={!(field === 'tradeName' && removeTradeName)}
                  className="mt-2 min-h-11 w-full rounded-xl border border-black/[0.12] px-3 py-2 text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 disabled:bg-[#F5F5F7]"
                />
                {field === 'tradeName' && tradeName && (
                  <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-2 text-xs text-[#424245]">
                    <input
                      type="checkbox"
                      checked={removeTradeName}
                      onChange={(event) => setRemoveTradeName(event.target.checked)}
                    />
                    Remove the recorded trade or brand name
                  </label>
                )}
              </div>

              <div>
                <label htmlFor="legacy-source-title" className="text-xs font-bold text-[#1D1D1F]">
                  Source page title
                </label>
                <p className="mt-1 text-[11px] leading-4 text-[#6E6E73]">
                  Use the title shown on the regulator, registry, manufacturer or publication page.
                </p>
                <input
                  id="legacy-source-title"
                  type="text"
                  value={sourceTitle}
                  onChange={(event) => setSourceTitle(event.target.value)}
                  minLength={3}
                  maxLength={300}
                  required
                  className="mt-2 min-h-11 w-full rounded-xl border border-black/[0.12] px-3 py-2 text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30"
                />
              </div>

              <div>
                <label htmlFor="legacy-source-url" className="text-xs font-bold text-[#1D1D1F]">
                  Public source URL
                </label>
                <input
                  id="legacy-source-url"
                  type="url"
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                  placeholder="https://www.fda.gov/source-page"
                  maxLength={2048}
                  required
                  className="mt-2 min-h-11 w-full rounded-xl border border-black/[0.12] px-3 py-2 text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30"
                />
              </div>

              <div>
                <label htmlFor="legacy-explanation" className="text-xs font-bold text-[#1D1D1F]">
                  Why should this name change?
                </label>
                <p className="mt-1 text-[11px] leading-4 text-[#6E6E73]">
                  In plain language, say where the correct name appears and why the current name is
                  wrong. This explanation becomes part of the public history.
                </p>
                <textarea
                  id="legacy-explanation"
                  value={explanation}
                  onChange={(event) => setExplanation(event.target.value)}
                  rows={4}
                  minLength={10}
                  maxLength={300}
                  required
                  className="mt-2 w-full rounded-xl border border-black/[0.12] px-3 py-2 text-sm leading-6 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30"
                />
                <p className="mt-1 text-right text-[10px] text-[#6E6E73]">
                  {explanation.length}/300
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
                This form cannot change evidence, safety, efficacy, trials, mechanism, sponsor,
                research status, pricing, molecular data or conclusions. Those changes need a
                specific use, study and evidence-review path.
              </div>

              {error && (
                <p role="alert" className="text-xs font-semibold leading-5 text-rose-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0071E3] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0077ED] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {isSubmitting ? 'Submitting…' : 'Submit for independent review'}
              </button>
            </form>
          )}
        </div>
      </ModalShell>
    </section>
  )
}
