'use client'

import { useRef, useState } from 'react'
import type { ComprehensionQuestionView } from '@/lib/comprehension'

// Anonymous, no-account "teach-back" check: up to three single-choice questions per claim,
// rendered from the questions the server already fetched (getQuestionsForClaim) and passed in as
// props — the answer key never travels to the client. Answering posts to
// app/api/comprehension/route.ts, which recomputes correctness server-side and returns the
// explanation plus the claim's public aggregate (only once the clarity-tested gate is met).
//
// This is a comprehension check on the writing, not a test of the reader and not evidence for the
// claim — the copy below says so explicitly, and must keep saying so.
//
// It is also optional. It used to sit open after every claim, which turned a page someone opened
// with one question into a four-part exam; the record page now keeps it behind a single control.

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
  // One live region per question, kept so focus can be moved onto the feedback the moment it
  // arrives. Submitting disables the fieldset the button sits in, and a browser blurs an element
  // it disables — without this, focus lands on <body> and a keyboard user is returned to the top
  // of the document from wherever they were reading.
  const resultRefs = useRef<Record<number, HTMLParagraphElement | null>>({})

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
      // After the state change that disables the control the user activated. The paragraph is
      // programmatically focusable only (tabIndex -1), so it never joins the tab order.
      requestAnimationFrame(() => resultRefs.current[questionId]?.focus())
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
    <section aria-labelledby={headingId} className="reading">
      {/* "Clarity check:" is not decoration. Reusing the claim question verbatim produced two
          byte-identical h3s on the same page — the question itself, and this — so a screen-reader
          user moving by heading met the same string twice with nothing to tell them apart, and the
          second one appeared to belong to the section it happened to follow. */}
      <h3 id={headingId} className="claim__q">
        Clarity check: {claimQuestion ?? 'did this page explain where the evidence stops?'}
      </h3>

      <div style={{ marginTop: 'var(--s4)' }}>
        {questions.map((q, index) => {
          const result = results[q.id]
          const error = errors[q.id]
          const isPending = pendingQuestionId === q.id
          const hasSelection = selected[q.id] !== undefined

          return (
            <fieldset key={q.id} disabled={Boolean(result)} className="quiz-q">
              <legend className="quiz-q__legend">
                {index + 1}. {q.question}
              </legend>

              <div style={{ marginTop: 'var(--s3)' }}>
                {q.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="choice">
                    <input
                      type="radio"
                      name={`comprehension-question-${q.id}`}
                      checked={selected[q.id] === optionIndex}
                      onChange={() => setSelected((prev) => ({ ...prev, [q.id]: optionIndex }))}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>

              {/* The button is NEVER unmounted. It used to be removed from the DOM on success
                  while the surrounding fieldset was disabled, so the element the user had just
                  activated ceased to exist and focus fell to <body> — roughly 45 tab stops back
                  from where they were on a record page, with no announcement. Disabling it in
                  place keeps focus exactly where the user put it and makes the state the only
                  thing that changes. */}
              <div style={{ marginTop: 'var(--s4)' }}>
                <button
                  type="button"
                  onClick={() => submitAnswer(q.id)}
                  disabled={Boolean(result) || !hasSelection || isPending}
                  className="btn"
                  style={{ opacity: hasSelection ? 1 : 0.55 }}
                >
                  {isPending ? 'Checking…' : 'Check my answer'}
                </button>
              </div>

              {/* Both live regions are mounted empty and stay mounted. Assistive technology only
                  announces a region that was already in the accessibility tree when its content
                  changed; a region created together with its own text is reliably missed by NVDA
                  and JAWS, which meant the one piece of feedback this feature exists to deliver
                  was silent. The visual treatment is applied only when there is something to
                  show, so nothing is drawn while they are empty. */}
              <p role="alert" className={error ? 'quiz__result' : undefined}>
                {error ?? null}
              </p>
              <p
                ref={(el) => {
                  resultRefs.current[q.id] = el
                }}
                tabIndex={-1}
                role="status"
                aria-live="polite"
                className={result ? 'quiz__result' : undefined}
              >
                {result ? (
                  <>
                    <strong>{result.isCorrect ? 'That matches the explanation.' : 'Not quite.'}</strong>{' '}
                    {result.explanation}
                  </>
                ) : null}
              </p>
            </fieldset>
          )
        })}
      </div>

      {aggregateMessage && (
        <p className="small muted" style={{ marginTop: 'var(--s5)' }}>
          {aggregateMessage}. This measures how clearly the explanation reads. It is not a scientific validation of
          the claim.
        </p>
      )}
    </section>
  )
}
