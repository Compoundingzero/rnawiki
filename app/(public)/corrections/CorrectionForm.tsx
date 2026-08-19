'use client'

import { useEffect, useId, useState } from 'react'
import { CORRECTION_CATEGORIES, CORRECTION_CATEGORY_HELP, CORRECTION_CATEGORY_LABELS, type CorrectionCategory } from './categories'

interface CorrectionContext {
  entityId: number
  entityName: string
  claimId: number | null
  claimQuestion: string | null
}

type SubmitState = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'success' } | { kind: 'error'; message: string }

/**
 * The POST body and the client-side minimum length are unchanged — /api/corrections validates the
 * same shape. Only the presentation moved onto the current design system.
 *
 * The live region below persists across submit states so the result is announced when it replaces
 * the form, rather than being inserted silently.
 *
 * SUBMIT IS DISABLED UNTIL THIS COMPONENT HAS HYDRATED, and that is a data-loss fix, not a
 * nicety. The <form> has no `action` and no `method` because `handleSubmit` sends the report with
 * fetch. When the handler has not run — JavaScript disabled, or a click landing before hydration
 * finishes — the browser falls back to its default, which is a GET to the current URL. The reader
 * then watched the page reload, the textarea empty itself, no acknowledgement appear and no error
 * appear, while everything they had written was appended to the address bar as
 * `?category=...&message=...` and recorded in their history and in every server access log it
 * passed through. The report itself was never sent.
 *
 * The page already renders a <noscript> notice pointing at the email address
 * (app/(public)/corrections/page.tsx); what it did not do was stop the button from looking like it
 * worked. Rendering the button disabled on the server and enabling it in an effect means the
 * fallback path cannot be reached at all: with no JavaScript the effect never runs and the control
 * stays visibly unavailable next to the explanation of why.
 */
export function CorrectionForm({ context }: { context: CorrectionContext | null }) {
  const formId = useId()
  const [category, setCategory] = useState<CorrectionCategory>(CORRECTION_CATEGORIES[0])
  const [message, setMessage] = useState('')
  const [proposedSource, setProposedSource] = useState('')
  const [state, setState] = useState<SubmitState>({ kind: 'idle' })
  const [canSubmit, setCanSubmit] = useState(false)

  useEffect(() => {
    setCanSubmit(true)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (message.trim().length < 10) {
      setState({ kind: 'error', message: 'Please add a bit more detail — a sentence or two is enough.' })
      return
    }
    setState({ kind: 'submitting' })
    try {
      const res = await fetch('/api/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: message.trim(),
          proposedSource: proposedSource.trim() || undefined,
          entityId: context?.entityId,
          claimId: context?.claimId ?? undefined,
        }),
      })
      const data: { ok: boolean; error?: string } = await res.json()
      if (!res.ok || !data.ok) {
        setState({ kind: 'error', message: data.error ?? 'Something went wrong. Please try again.' })
        return
      }
      setState({ kind: 'success' })
      setMessage('')
      setProposedSource('')
    } catch {
      setState({ kind: 'error', message: 'Something went wrong. Please check your connection and try again.' })
    }
  }

  return (
    <>
      <div role="status" aria-live="polite">
        {state.kind === 'success' && (
          <div className="panel panel--soft" style={{ maxWidth: '34rem' }}>
            <p style={{ fontWeight: 600 }}>Report received.</p>
            <p className="muted small" style={{ marginTop: 'var(--s2)' }}>
              An editor reads every submission by hand before anything changes. Individual replies are not sent.
              Corrections that changed something are listed on this page.
            </p>
            <button
              type="button"
              className="btn"
              style={{ marginTop: 'var(--s4)' }}
              onClick={() => setState({ kind: 'idle' })}
            >
              Report something else
            </button>
          </div>
        )}
      </div>

      {state.kind !== 'success' && (
        <form onSubmit={handleSubmit} className="form" aria-describedby={context ? `${formId}-context` : undefined}>
          {context && (
            <p id={`${formId}-context`} className="panel panel--soft small">
              Reporting an issue with <strong>{context.entityName}</strong>
              {context.claimQuestion ? <> — “{context.claimQuestion}”</> : null}.
            </p>
          )}

          <div>
            <label htmlFor={`${formId}-category`} className="label">
              Kind of issue <span className="label__note">(required)</span>
            </label>
            <select
              id={`${formId}-category`}
              name="category"
              className="field"
              value={category}
              onChange={(e) => setCategory(e.target.value as CorrectionCategory)}
              aria-describedby={`${formId}-category-help`}
            >
              {CORRECTION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CORRECTION_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            <p id={`${formId}-category-help`} className="help">
              {CORRECTION_CATEGORY_HELP[category]}
            </p>
          </div>

          <div>
            <label htmlFor={`${formId}-message`} className="label">
              What you noticed <span className="label__note">(required)</span>
            </label>
            <textarea
              id={`${formId}-message`}
              name="message"
              className="field"
              required
              minLength={10}
              maxLength={4000}
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-describedby={`${formId}-message-help`}
            />
            <p id={`${formId}-message-help`} className="help">
              A sentence or two is enough. Quoting the exact wording helps most.
            </p>
          </div>

          <div>
            <label htmlFor={`${formId}-source`} className="label">
              Link to a source <span className="label__note">(optional)</span>
            </label>
            <input
              id={`${formId}-source`}
              name="proposedSource"
              type="text"
              className="field"
              placeholder="A URL, DOI or PMID"
              value={proposedSource}
              onChange={(e) => setProposedSource(e.target.value)}
            />
          </div>

          {state.kind === 'error' && (
            <div role="alert" className="notice">
              <p className="notice__title">Not sent</p>
              <p className="small">{state.message}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!canSubmit || state.kind === 'submitting'}
              aria-busy={state.kind === 'submitting'}
              aria-describedby={canSubmit ? undefined : `${formId}-nojs`}
            >
              {state.kind === 'submitting' ? 'Sending…' : 'Send report'}
            </button>
            {!canSubmit && (
              <p id={`${formId}-nojs`} className="help">
                Sending this form needs JavaScript. Without it, email the same details to
                hello@rnawiki.com instead.
              </p>
            )}
          </div>

          <p className="muted small">
            This form is for issues with the content on this site, not a way to ask about a personal health
            situation. For medical guidance, contact a qualified clinician.
          </p>
        </form>
      )}
    </>
  )
}
