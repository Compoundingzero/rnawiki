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
  /**
   * The claim this test belongs to. An entity page carries one test per claim, so without this
   * every test on the page would be headed with the same words and a reader (or a screen-reader
   * user moving by heading) could not tell them apart.
   */
  claimQuestion?: string
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

export function ComprehensionTest({ claimId, questions, claimQuestion }: ComprehensionTestProps) {
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
    <section aria-labelledby={headingId} className="measure">
      <h3 id={headingId} className="h4">
        {claimQuestion ?? 'Check your understanding'}
      </h3>
      <p className="muted" style={{ fontSize: 'var(--size-small)', marginTop: 'var(--s2)' }}>
        A short, anonymous check on whether this explanation was clear. It measures the writing, not the reader —
        and it is not evidence for or against the claim above.
      </p>

      <div className="stack-lg" style={{ marginTop: 'var(--s5)' }}>
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
                border: 0,
                borderTop: 'var(--hairline) solid var(--border-strong)',
                margin: 0,
                padding: 'var(--s4) 0 0',
                minWidth: 0,
              }}
            >
              <legend style={{ padding: 0 }}>
                <span className="eyebrow">Question {index + 1}</span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'var(--size-h4)',
                    fontWeight: 600,
                    marginTop: 'var(--s1)',
                  }}
                >
                  {q.question}
                </span>
              </legend>

              <div style={{ marginTop: 'var(--s3)' }}>
                {q.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--s3)',
                      minHeight: '44px',
                      paddingBlock: 'var(--s2)',
                      borderTop: optionIndex === 0 ? 'none' : 'var(--hairline) solid var(--border)',
                      fontSize: 'var(--size-small)',
                      cursor: result ? 'default' : 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name={`comprehension-question-${q.id}`}
                      checked={selected[q.id] === optionIndex}
                      onChange={() => setSelected((prev) => ({ ...prev, [q.id]: optionIndex }))}
                      style={{
                        width: '1.1rem',
                        height: '1.1rem',
                        marginTop: '0.2em',
                        flex: 'none',
                        accentColor: 'var(--accent)',
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>

              {!result && (
                <div style={{ marginTop: 'var(--s4)' }}>
                  <button
                    type="button"
                    onClick={() => submitAnswer(q.id)}
                    disabled={!hasSelection || isPending}
                    className="btn"
                    style={{
                      cursor: !hasSelection || isPending ? 'default' : 'pointer',
                      opacity: hasSelection ? 1 : 0.55,
                    }}
                  >
                    {isPending ? 'Checking…' : 'Check my answer'}
                  </button>
                  {error && (
                    <div className="callout" data-tone="danger" role="alert" style={{ marginTop: 'var(--s3)' }}>
                      <p style={{ fontSize: 'var(--size-small)' }}>{error}</p>
                    </div>
                  )}
                </div>
              )}

              {result && (
                <p
                  role="status"
                  className="callout"
                  style={{
                    marginTop: 'var(--s4)',
                    fontSize: 'var(--size-small)',
                    borderLeftColor: result.isCorrect ? 'var(--success)' : 'var(--border-strong)',
                  }}
                >
                  <strong>{result.isCorrect ? 'That matches the explanation.' : 'Not quite.'}</strong>{' '}
                  {result.explanation}
                </p>
              )}
            </fieldset>
          )
        })}
      </div>

      {aggregateMessage && (
        <p
          className="muted"
          style={{
            marginTop: 'var(--s5)',
            paddingTop: 'var(--s4)',
            borderTop: 'var(--hairline) solid var(--border)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--size-meta)',
            lineHeight: 1.5,
          }}
        >
          {aggregateMessage}. This measures how clearly the explanation reads — it is not a scientific validation
          of the claim.
        </p>
      )}
    </section>
  )
}
