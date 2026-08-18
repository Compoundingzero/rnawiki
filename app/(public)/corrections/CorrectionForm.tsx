'use client'

import { useId, useState } from 'react'
import { CORRECTION_CATEGORIES, CORRECTION_CATEGORY_HELP, CORRECTION_CATEGORY_LABELS, type CorrectionCategory } from './categories'

interface CorrectionContext {
  entityId: number
  entityName: string
  claimId: number | null
  claimQuestion: string | null
}

// Field labels are metadata, so they are set in mono like every other label on the site. The
// live region below the form persists across submit states so a result is announced when it
// replaces the form, rather than being inserted silently.
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--size-meta)',
  fontWeight: 500,
  letterSpacing: 'var(--track-caps)',
  textTransform: 'uppercase',
  color: 'var(--ink-soft)',
  marginBottom: 'var(--s2)',
}

const helpStyle: React.CSSProperties = {
  marginTop: 'var(--s2)',
  fontSize: 'var(--size-small)',
  color: 'var(--muted)',
}

type SubmitState = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'success' } | { kind: 'error'; message: string }

export function CorrectionForm({ context }: { context: CorrectionContext | null }) {
  const formId = useId()
  const [category, setCategory] = useState<CorrectionCategory>(CORRECTION_CATEGORIES[0])
  const [message, setMessage] = useState('')
  const [proposedSource, setProposedSource] = useState('')
  const [state, setState] = useState<SubmitState>({ kind: 'idle' })

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
          <div className="callout">
            <p className="callout__title">Received</p>
            <p style={{ fontWeight: 600 }}>This report is now in the editorial queue.</p>
            <p className="prose" style={{ marginTop: 'var(--s2)', fontSize: 'var(--size-small)' }}>
              An editor reads every submission by hand before anything changes. Individual replies are not sent;
              resolved corrections that changed something are listed below.
            </p>
            <button type="button" className="btn" style={{ marginTop: 'var(--s4)' }} onClick={() => setState({ kind: 'idle' })}>
              Submit another correction
            </button>
          </div>
        )}
      </div>

      {state.kind !== 'success' && (
        <form
          onSubmit={handleSubmit}
          style={{ display: 'grid', gap: 'var(--s5)', maxWidth: '40rem' }}
          aria-describedby={context ? `${formId}-context` : undefined}
        >
          {context && (
            <p id={`${formId}-context`} className="callout" style={{ fontSize: 'var(--size-small)' }}>
              Reporting an issue with <strong>{context.entityName}</strong>
              {context.claimQuestion ? <> — &ldquo;{context.claimQuestion}&rdquo;</> : null}.
            </p>
          )}

          <div>
            <label htmlFor={`${formId}-category`} style={labelStyle}>
              Kind of issue
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
            <p id={`${formId}-category-help`} style={helpStyle}>
              {CORRECTION_CATEGORY_HELP[category]}
            </p>
          </div>

          <div>
            <label htmlFor={`${formId}-message`} style={labelStyle}>
              What you noticed
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
              style={{ resize: 'vertical', lineHeight: 'var(--leading-body)' }}
            />
            <p id={`${formId}-message-help`} style={helpStyle}>
              A sentence or two is enough. Quoting the exact wording helps most.
            </p>
          </div>

          <div>
            <label htmlFor={`${formId}-source`} style={labelStyle}>
              Link to a source (optional)
            </label>
            <input
              id={`${formId}-source`}
              name="proposedSource"
              type="text"
              className="field"
              placeholder="A URL, DOI, or PMID"
              value={proposedSource}
              onChange={(e) => setProposedSource(e.target.value)}
            />
          </div>

          {state.kind === 'error' && (
            <div role="alert" className="callout" data-tone="danger">
              <p className="callout__title">Not sent</p>
              <p style={{ fontSize: 'var(--size-small)' }}>{state.message}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={state.kind === 'submitting'}
              aria-busy={state.kind === 'submitting'}
              style={{ opacity: state.kind === 'submitting' ? 0.7 : 1 }}
            >
              {state.kind === 'submitting' ? 'Sending…' : 'Send correction'}
            </button>
          </div>

          <p style={{ fontSize: 'var(--size-small)', color: 'var(--muted)' }}>
            This form is for issues with the content on this site, not a way to ask about a personal health
            situation. For medical guidance, contact a qualified clinician.
          </p>
        </form>
      )}
    </>
  )
}
