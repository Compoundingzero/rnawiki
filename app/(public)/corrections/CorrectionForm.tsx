'use client'

import { useId, useState } from 'react'
import { CORRECTION_CATEGORIES, CORRECTION_CATEGORY_HELP, CORRECTION_CATEGORY_LABELS, type CorrectionCategory } from './categories'

interface CorrectionContext {
  entityId: number
  entityName: string
  claimId: number | null
  claimQuestion: string | null
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  fontSize: '0.9rem',
  marginBottom: 'var(--space-2)',
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65em 0.85em',
  fontSize: '1rem',
  fontFamily: 'inherit',
  border: '1px solid var(--color-border-strong)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
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

  if (state.kind === 'success') {
    return (
      <div
        role="status"
        style={{
          border: '1px solid var(--color-measured)',
          background: 'var(--color-measured-tint)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-measured)' }}>Thank you — this is now in the editorial queue.</p>
        <p style={{ margin: 'var(--space-2) 0 0' }}>
          An editor reviews every submission by hand before anything changes. Individual replies are not sent, but
          resolved corrections that changed something are listed below.
        </p>
        <button
          type="button"
          onClick={() => setState({ kind: 'idle' })}
          style={{
            marginTop: 'var(--space-4)',
            padding: '0.5em 1em',
            fontSize: '0.9rem',
            border: '1px solid var(--color-border-strong)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            cursor: 'pointer',
          }}
        >
          Submit another correction
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }} aria-describedby={context ? `${formId}-context` : undefined}>
      {context && (
        <p
          id={`${formId}-context`}
          style={{
            margin: 0,
            padding: 'var(--space-3)',
            fontSize: '0.88rem',
            background: 'var(--color-surface-raised)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-muted)',
          }}
        >
          Reporting an issue with <strong>{context.entityName}</strong>
          {context.claimQuestion ? <> — &ldquo;{context.claimQuestion}&rdquo;</> : null}.
        </p>
      )}

      <div>
        <label htmlFor={`${formId}-category`} style={labelStyle}>
          What kind of issue is this?
        </label>
        <select
          id={`${formId}-category`}
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as CorrectionCategory)}
          style={fieldStyle}
        >
          {CORRECTION_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CORRECTION_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <p style={{ margin: 'var(--space-2) 0 0', fontSize: '0.82rem', color: 'var(--color-text-faint)' }}>
          {CORRECTION_CATEGORY_HELP[category]}
        </p>
      </div>

      <div>
        <label htmlFor={`${formId}-message`} style={labelStyle}>
          What did you notice?
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ ...fieldStyle, resize: 'vertical' }}
        />
      </div>

      <div>
        <label htmlFor={`${formId}-source`} style={labelStyle}>
          Link to a source (optional)
        </label>
        <input
          id={`${formId}-source`}
          name="proposedSource"
          type="text"
          placeholder="A URL, DOI, or PMID"
          value={proposedSource}
          onChange={(e) => setProposedSource(e.target.value)}
          style={fieldStyle}
        />
      </div>

      {state.kind === 'error' && (
        <p role="alert" style={{ margin: 0, color: 'var(--color-unknown)', fontSize: '0.9rem' }}>
          {state.message}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={state.kind === 'submitting'}
          style={{
            padding: '0.7em 1.4em',
            fontSize: '1rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-accent)',
            color: '#fff',
            cursor: state.kind === 'submitting' ? 'default' : 'pointer',
            opacity: state.kind === 'submitting' ? 0.7 : 1,
          }}
        >
          {state.kind === 'submitting' ? 'Sending…' : 'Send correction'}
        </button>
      </div>

      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>
        This form is for issues with the content on this site — not a way to ask for medical advice or get a
        question about your own health answered. If you need medical guidance, please contact a qualified
        clinician.
      </p>
    </form>
  )
}
