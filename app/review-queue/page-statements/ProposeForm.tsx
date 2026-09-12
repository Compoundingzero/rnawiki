'use client'

// Suggesting a better wording for one sentence. The server re-derives the risk class, the digests
// and every automatic check; what this form collects is what a person can say and nothing else.

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  CHANGE_CATEGORY_LABELS,
  PAGE_STATEMENT_CHANGE_CATEGORIES,
  type PageStatementChangeCategory,
  type PageStatementKey,
} from '@/lib/page-statements/types'
import { wordDiff } from '@/lib/page-statements/current'

const FIELD =
  'w-full rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-sm text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]'
const LABEL = 'block text-[10px] font-bold uppercase tracking-wide text-[#6E6E73]'
const BUTTON =
  'inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]'

type Impact = 'clarity_only' | 'scientific_meaning' | 'safety_meaning' | 'evidence_classification'

const IMPACTS: ReadonlyArray<{ value: Impact; label: string }> = [
  { value: 'clarity_only', label: 'Clearer wording, same meaning' },
  { value: 'scientific_meaning', label: 'Changes what the evidence says' },
  { value: 'safety_meaning', label: 'Changes something about safety' },
  { value: 'evidence_classification', label: 'Changes what kind of evidence this is' },
]

function countWords(value: string): number {
  return value.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0
}

export function ProposeForm({
  slug,
  statementKey,
  label,
  currentText,
  evidenceState,
  wordLimit,
  defaultOpen = false,
}: {
  slug: string
  statementKey: PageStatementKey
  label: string
  currentText: string
  evidenceState: string
  wordLimit: number
  defaultOpen?: boolean
}) {
  const router = useRouter()
  const ids = useId()
  const [open, setOpen] = useState(defaultOpen)
  const [proposedText, setProposedText] = useState(currentText)
  const [reason, setReason] = useState('')
  const [category, setCategory] = useState<PageStatementChangeCategory>('plain_language_clarity')
  const [impact, setImpact] = useState<Impact>('clarity_only')
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceExcerpt, setSourceExcerpt] = useState('')
  const [population, setPopulation] = useState('')
  const [outcome, setOutcome] = useState('')
  const [limitations, setLimitations] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const medical = impact !== 'clarity_only'
  const words = countWords(proposedText)
  const unchanged = proposedText.trim() === currentText.trim()
  const tooLong = words > wordLimit

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)
    try {
      const sources =
        sourceUrl.trim() || sourceExcerpt.trim()
          ? [
              {
                ...(sourceUrl.trim() ? { url: sourceUrl.trim() } : {}),
                ...(sourceExcerpt.trim() ? { excerpt: sourceExcerpt.trim() } : {}),
              },
            ]
          : []
      const evidencePacket = {
        ...(population.trim() ? { population: population.trim() } : {}),
        ...(outcome.trim() ? { outcome: outcome.trim() } : {}),
        ...(limitations.trim() ? { limitations: limitations.trim() } : {}),
      }
      const response = await fetch('/api/page-statements/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          slug,
          statementKey,
          proposedText: proposedText.trim(),
          reason: reason.trim(),
          changeCategory: category,
          declaredImpact: impact,
          evidencePacket,
          sources,
          expectedCurrentText: currentText,
        }),
      })
      const body = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(body.error ?? 'That could not be submitted.')
        return
      }
      setOpen(false)
      router.refresh()
    } catch {
      setError('That could not be submitted. Check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  if (!open) {
    return (
      <button
        className={`${BUTTON} border-black/[0.12] bg-white text-[#424245] hover:bg-[#F5F5F7]`}
        onClick={() => setOpen(true)}
        type="button"
      >
        Suggest a different wording
      </button>
    )
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <fieldset className="space-y-3">
        <legend className="sr-only">Suggest a different wording for {label}</legend>

        <div>
          <label className={LABEL} htmlFor={`${ids}-text`}>
            Your wording
          </label>
          <textarea
            aria-describedby={`${ids}-count`}
            className={FIELD}
            id={`${ids}-text`}
            onChange={(event) => setProposedText(event.target.value)}
            required
            rows={3}
            value={proposedText}
          />
          <p className="pt-1 text-[10px] text-[#6E6E73]" id={`${ids}-count`}>
            {words} of {wordLimit} words.{' '}
            {tooLong ? 'Too long for this position; it will be refused.' : ''}
            {unchanged ? ' This is the same as what is on the page.' : ''}
          </p>
        </div>

        <div>
          <p className={LABEL}>Side by side</p>
          <p className="text-[11px] leading-5">
            {wordDiff(currentText, proposedText).map((token, index) =>
              token.kind === 'same' ? (
                <span key={index}>{token.value} </span>
              ) : token.kind === 'removed' ? (
                <del className="bg-rose-50 text-rose-800" key={index}>
                  {token.value}{' '}
                </del>
              ) : (
                <ins className="bg-emerald-50 text-emerald-900 no-underline" key={index}>
                  {token.value}{' '}
                </ins>
              ),
            )}
          </p>
        </div>

        <div>
          <label className={LABEL} htmlFor={`${ids}-category`}>
            What kind of change is this?
          </label>
          <select
            className={FIELD}
            id={`${ids}-category`}
            onChange={(event) => setCategory(event.target.value as PageStatementChangeCategory)}
            value={category}
          >
            {PAGE_STATEMENT_CHANGE_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CHANGE_CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className={LABEL}>Does this change the meaning?</legend>
          <div className="space-y-1 pt-1">
            {IMPACTS.map((entry) => (
              <label
                className="flex items-start gap-2 text-[11px] leading-5 text-[#424245]"
                key={entry.value}
              >
                <input
                  checked={impact === entry.value}
                  className="mt-1"
                  name={`${ids}-impact`}
                  onChange={() => setImpact(entry.value)}
                  type="radio"
                  value={entry.value}
                />
                <span>{entry.label}</span>
              </label>
            ))}
          </div>
          <p className="pt-1 text-[10px] leading-4 text-[#6E6E73]">
            RNAWiki works out the risk of a change from the category and the words themselves, and
            takes the higher of the two. Saying &ldquo;clarity only&rdquo; does not lower the bar.
          </p>
        </fieldset>

        <div>
          <label className={LABEL} htmlFor={`${ids}-reason`}>
            Why is this better?
          </label>
          <textarea
            className={FIELD}
            id={`${ids}-reason`}
            minLength={10}
            onChange={(event) => setReason(event.target.value)}
            required
            rows={3}
            value={reason}
          />
        </div>

        {medical && (
          <div className="space-y-3 rounded-2xl bg-[#F5F5F7] p-3">
            <p className="text-[11px] leading-5 text-[#424245]">
              A change to what the evidence says needs a source and the three fields a reviewer
              checks against it. Without them the automatic checks refuse the change.
            </p>
            <div>
              <label className={LABEL} htmlFor={`${ids}-source-url`}>
                Source link
              </label>
              <input
                className={FIELD}
                id={`${ids}-source-url`}
                inputMode="url"
                onChange={(event) => setSourceUrl(event.target.value)}
                type="url"
                value={sourceUrl}
              />
              <p className="pt-1 text-[10px] leading-4 text-[#6E6E73]">
                RNAWiki stores this link and does not open it.
              </p>
            </div>
            <div>
              <label className={LABEL} htmlFor={`${ids}-source-excerpt`}>
                The exact wording in the source that supports this
              </label>
              <textarea
                className={FIELD}
                id={`${ids}-source-excerpt`}
                onChange={(event) => setSourceExcerpt(event.target.value)}
                rows={2}
                value={sourceExcerpt}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor={`${ids}-population`}>
                Who was studied
              </label>
              <input
                className={FIELD}
                id={`${ids}-population`}
                onChange={(event) => setPopulation(event.target.value)}
                value={population}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor={`${ids}-outcome`}>
                What was measured
              </label>
              <input
                className={FIELD}
                id={`${ids}-outcome`}
                onChange={(event) => setOutcome(event.target.value)}
                value={outcome}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor={`${ids}-limitations`}>
                What this does not settle
              </label>
              <textarea
                className={FIELD}
                id={`${ids}-limitations`}
                onChange={(event) => setLimitations(event.target.value)}
                rows={2}
                value={limitations}
              />
            </div>
          </div>
        )}

        <p className="text-[10px] leading-4 text-[#6E6E73]">
          The kind of evidence behind this sentence stays {evidenceState.replace(/_/g, ' ')}. A
          wording change never moves it.
        </p>
      </fieldset>

      {error && (
        <p className="text-[11px] font-semibold text-rose-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className={`${BUTTON} border-[#0071E3] bg-[#0071E3] text-white disabled:opacity-50`}
          disabled={pending || unchanged || tooLong || reason.trim().length < 10}
          type="submit"
        >
          {pending ? 'Sending…' : 'Send to the review queue'}
        </button>
        <button
          className={`${BUTTON} border-black/[0.12] bg-white text-[#424245] hover:bg-[#F5F5F7]`}
          onClick={() => setOpen(false)}
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
