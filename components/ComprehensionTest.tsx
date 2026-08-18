'use client'

import { useState } from 'react'
import type { ComprehensionQuestionView } from '@/lib/comprehension'

// Anonymous, no-account "teach-back" check: up to three single-choice questions per claim,
// rendered from the questions the server already fetched (getQuestionsForClaim) and passed in as
// props — the answer key never travels to the client. Answering posts to
// app/api/comprehension/route.ts, which recomputes correctness server-side and returns the
// explanation plus the claim's public aggregate (only once the clarity-tested gate is met).
//
// This is a comprehension check on the writing, not a test of the reader and not evidence for the
// claim — the copy below says so explicitly, and must keep saying so.

interface ComprehensionTestProps {
  claimId: number
  questions: ComprehensionQuestionView[]
}

interface QuestionResult {
  isCorrect: boolean
  explanation: string
}

interface ApiResponse {
  ok: boolean
  error?: string
  isCorrect?: boolean
  explanation?: string
  aggregate?: { isClarityTested: boolean; message: string | null }
}

export function ComprehensionTest({ claimId, questions }: ComprehensionTestProps) {
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [results, setResults] = useState<Record<number, QuestionResult>>({})
  const [errors, setErrors] = useState<Record<number, string>>({})
  const [pendingQuestionId, setPendingQuestionId] = useState<number | null>(null)
  const [aggregateMessage, setAggregateMessage] = useState<string | null>(null)

  if (questions.length === 0) return null

  async function submitAnswer(questionId: number) {
    const selectedOptionIndex = selected[questionId]
    if (selectedOptionIndex === undefined || results[questionId] || pendingQuestionId !== null) return

    setPendingQuestionId(questionId)
    setErrors((prev) => ({ ...prev, [questionId]: '' }))

    try {
      const res = await fetch('/api/comprehension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, selectedOptionIndex }),
      })
      const data: ApiResponse = await res.json()

      if (!res.ok || !data.ok || typeof data.isCorrect !== 'boolean' || typeof data.explanation !== 'string') {
        throw new Error(data.error ?? 'Something went wrong. Please try again.')
      }

      setResults((prev) => ({ ...prev, [questionId]: { isCorrect: data.isCorrect!, explanation: data.explanation! } }))
      if (data.aggregate?.message) {
        setAggregateMessage(data.aggregate.message)
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [questionId]: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      }))
    } finally {
      setPendingQuestionId(null)
    }
  }

  const headingId = `comprehension-heading-${claimId}`

  return (
    <section
      aria-labelledby={headingId}
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface-raised)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
    >
      <div>
        <h3 id={headingId} style={{ margin: 0, fontSize: '1rem' }}>
          Check your understanding
        </h3>
        <p style={{ margin: 'var(--space-1) 0 0', fontSize: '0.85rem', color: 'var(--color-text-faint)' }}>
          A short, anonymous check on whether this explanation was clear. It measures the writing,
          not you — and it is not evidence for or against the claim above.
        </p>
      </div>

      {questions.map((q, index) => {
        const result = results[q.id]
        const error = errors[q.id]
        const isPending = pendingQuestionId === q.id
        const hasSelection = selected[q.id] !== undefined

        return (
          <fieldset
            key={q.id}
            disabled={Boolean(result)}
            style={{
              border: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <legend style={{ padding: 0, fontWeight: 600, fontSize: '0.95rem', marginBottom: 'var(--space-2)' }}>
              {index + 1}. {q.question}
            </legend>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {q.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-2)',
                    fontSize: '0.92rem',
                    cursor: result ? 'default' : 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name={`comprehension-question-${q.id}`}
                    checked={selected[q.id] === optionIndex}
                    onChange={() => setSelected((prev) => ({ ...prev, [q.id]: optionIndex }))}
                    style={{ marginTop: '0.2em' }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            {!result && (
              <div>
                <button
                  type="button"
                  onClick={() => submitAnswer(q.id)}
                  disabled={!hasSelection || isPending}
                  style={{
                    border: '1px solid var(--color-border-strong)',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.4em 0.9em',
                    fontSize: '0.85rem',
                    color: 'var(--color-text)',
                    cursor: !hasSelection || isPending ? 'default' : 'pointer',
                    opacity: hasSelection ? 1 : 0.5,
                  }}
                >
                  {isPending ? 'Checking…' : 'Check my answer'}
                </button>
                {error && (
                  <p role="alert" style={{ margin: 'var(--space-2) 0 0', fontSize: '0.82rem', color: 'var(--color-unknown)' }}>
                    {error}
                  </p>
                )}
              </div>
            )}

            {result && (
              <p
                role="status"
                style={{
                  margin: 0,
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  background: result.isCorrect ? 'var(--color-measured-tint)' : 'var(--color-surface)',
                  border: `1px solid ${result.isCorrect ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  fontSize: '0.9rem',
                }}
              >
                <strong>{result.isCorrect ? 'That matches the explanation.' : 'Not quite.'}</strong>{' '}
                {result.explanation}
              </p>
            )}
          </fieldset>
        )
      })}

      {aggregateMessage && (
        <p
          style={{
            margin: 0,
            fontSize: '0.82rem',
            color: 'var(--color-text-faint)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--space-3)',
          }}
        >
          {aggregateMessage}. This measures how clearly the explanation reads — it is not a
          scientific validation of the claim.
        </p>
      )}
    </section>
  )
}
