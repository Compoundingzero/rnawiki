'use client'

// Recording one decision on one exact wording. Every eligibility rule is re-checked on the server
// and again by a database trigger; hiding or showing this form is presentation only.

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'

const FIELD =
  'w-full rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-sm text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]'
const LABEL = 'block text-[10px] font-bold uppercase tracking-wide text-[#6E6E73]'
const BUTTON =
  'inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]'

type Decision = 'APPROVE' | 'CHANGES_REQUESTED' | 'REJECT'

export function DecisionForm({
  proposalId,
  contentDigest,
  isFinalApproval,
  medicineName,
  affectedSection,
  proposedText,
  evidenceState,
  sourceCount,
  slug,
}: {
  proposalId: string
  contentDigest: string
  /** True when this approval is the third, and recording it publishes the wording. */
  isFinalApproval: boolean
  medicineName: string
  affectedSection: string
  proposedText: string
  evidenceState: string
  sourceCount: number
  slug: string
}) {
  const router = useRouter()
  const ids = useId()
  const [decision, setDecision] = useState<Decision>('APPROVE')
  const [checkedWording, setCheckedWording] = useState(false)
  const [checkedSource, setCheckedSource] = useState(false)
  const [checkedLimitation, setCheckedLimitation] = useState(false)
  const [conflicts, setConflicts] = useState('')
  const [conflictDeclared, setConflictDeclared] = useState(false)
  const [attested, setAttested] = useState(false)
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const ready =
    checkedWording &&
    checkedSource &&
    checkedLimitation &&
    attested &&
    conflicts.trim().length > 0 &&
    (decision === 'APPROVE' || reason.trim().length > 0)

  const send = async () => {
    if (pending) return
    setPending(true)
    setError(null)
    try {
      const response = await fetch(`/api/page-statements/proposals/${proposalId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          decision,
          checkedWording: true,
          checkedSource: true,
          checkedLimitation: true,
          conflictsOfInterestAttested: true,
          conflictsOfInterest: conflicts.trim(),
          conflictDeclared,
          ...(reason.trim() ? { reason: reason.trim() } : {}),
          expectedContentDigest: contentDigest,
        }),
      })
      const body = (await response.json()) as {
        error?: string
        published?: boolean
        failedGates?: Array<{ title: string }>
      }
      if (!response.ok) {
        setError(body.error ?? 'That decision could not be recorded.')
        return
      }
      if (body.published) {
        setStatus('Recorded. This wording is now the public answer on the page.')
      } else if (body.failedGates && body.failedGates.length > 0) {
        setStatus(
          `Recorded, and the wording was held rather than published: ${body.failedGates
            .map((gate) => gate.title)
            .join('; ')}.`,
        )
      } else {
        setStatus('Decision recorded.')
      }
      setConfirming(false)
      router.refresh()
    } catch {
      setError('That decision could not be recorded. Check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  if (confirming) {
    return (
      <div
        aria-labelledby={`${ids}-confirm-h`}
        className="space-y-3 rounded-2xl border border-[#0071E3] bg-blue-50/50 p-3"
        role="group"
      >
        <h4 className="text-xs font-bold text-[#1D1D1F]" id={`${ids}-confirm-h`}>
          This approval publishes the revision
        </h4>
        <dl className="space-y-2 text-[11px] leading-5 text-[#424245]">
          <div>
            <dt className={LABEL}>The wording that becomes public</dt>
            <dd className="text-[#1D1D1F]">“{proposedText}”</dd>
          </div>
          <div>
            <dt className={LABEL}>Where</dt>
            <dd>
              {medicineName} · {affectedSection} · /d/{slug}
            </dd>
          </div>
          <div>
            <dt className={LABEL}>Evidence state</dt>
            <dd>
              {evidenceState.replace(/_/g, ' ')} — unchanged. Publishing the wording does not move
              it.
            </dd>
          </div>
          <div>
            <dt className={LABEL}>Sources</dt>
            <dd>{sourceCount === 0 ? 'None attached' : `${sourceCount} attached`}</dd>
          </div>
          <div>
            <dt className={LABEL}>If this turns out to be wrong</dt>
            <dd>
              A steward can roll it back immediately. The earlier wording and every decision stay in
              the history.
            </dd>
          </div>
        </dl>
        {error && (
          <p className="text-[11px] font-semibold text-rose-700" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            className={`${BUTTON} border-[#0071E3] bg-[#0071E3] text-white disabled:opacity-50`}
            disabled={pending}
            onClick={send}
            type="button"
          >
            {pending ? 'Publishing…' : 'Approve and publish this wording'}
          </button>
          <button
            className={`${BUTTON} border-black/[0.12] bg-white text-[#424245] hover:bg-[#F5F5F7]`}
            onClick={() => setConfirming(false)}
            type="button"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (!ready) return
        if (decision === 'APPROVE' && isFinalApproval) {
          setConfirming(true)
          return
        }
        void send()
      }}
    >
      <fieldset>
        <legend className={LABEL}>Your decision on {affectedSection}</legend>
        <div className="space-y-1 pt-1">
          {(
            [
              ['APPROVE', 'Approve this wording'],
              ['CHANGES_REQUESTED', 'Request changes'],
              ['REJECT', 'Reject'],
            ] as ReadonlyArray<[Decision, string]>
          ).map(([value, text]) => (
            <label
              className="flex items-start gap-2 text-[11px] leading-5 text-[#424245]"
              key={value}
            >
              <input
                checked={decision === value}
                className="mt-1"
                name={`${ids}-decision`}
                onChange={() => setDecision(value)}
                type="radio"
                value={value}
              />
              <span>{text}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={LABEL}>Confirm what you checked</legend>
        <div className="space-y-1 pt-1">
          <label className="flex items-start gap-2 text-[11px] leading-5 text-[#424245]">
            <input
              checked={checkedWording}
              className="mt-1"
              onChange={(event) => setCheckedWording(event.target.checked)}
              type="checkbox"
            />
            <span>I read the proposed wording against the wording it replaces.</span>
          </label>
          <label className="flex items-start gap-2 text-[11px] leading-5 text-[#424245]">
            <input
              checked={checkedSource}
              className="mt-1"
              onChange={(event) => setCheckedSource(event.target.checked)}
              type="checkbox"
            />
            <span>I opened the source and checked it says what the wording claims.</span>
          </label>
          <label className="flex items-start gap-2 text-[11px] leading-5 text-[#424245]">
            <input
              checked={checkedLimitation}
              className="mt-1"
              onChange={(event) => setCheckedLimitation(event.target.checked)}
              type="checkbox"
            />
            <span>I checked the limit on this evidence is still represented honestly.</span>
          </label>
        </div>
      </fieldset>

      <div>
        <label className={LABEL} htmlFor={`${ids}-conflicts`}>
          Conflicts of interest
        </label>
        <textarea
          className={FIELD}
          id={`${ids}-conflicts`}
          onChange={(event) => setConflicts(event.target.value)}
          placeholder="None, or describe any financial or personal interest."
          required
          rows={2}
          value={conflicts}
        />
        <label className="flex items-start gap-2 pt-1 text-[11px] leading-5 text-[#424245]">
          <input
            checked={conflictDeclared}
            className="mt-1"
            onChange={(event) => setConflictDeclared(event.target.checked)}
            type="checkbox"
          />
          <span>
            I have a conflict here. Record my view, and do not count it toward the three approvals.
          </span>
        </label>
        <label className="flex items-start gap-2 pt-1 text-[11px] leading-5 text-[#424245]">
          <input
            checked={attested}
            className="mt-1"
            onChange={(event) => setAttested(event.target.checked)}
            type="checkbox"
          />
          <span>What I have written above is complete and accurate.</span>
        </label>
      </div>

      {decision !== 'APPROVE' && (
        <div>
          <label className={LABEL} htmlFor={`${ids}-reason`}>
            {decision === 'REJECT' ? 'Why is this being rejected?' : 'What has to change?'}
          </label>
          <textarea
            className={FIELD}
            id={`${ids}-reason`}
            onChange={(event) => setReason(event.target.value)}
            required
            rows={3}
            value={reason}
          />
        </div>
      )}

      {error && (
        <p className="text-[11px] font-semibold text-rose-700" role="alert">
          {error}
        </p>
      )}
      <p aria-live="polite" className="text-[11px] font-semibold text-emerald-800">
        {status}
      </p>

      <button
        className={`${BUTTON} border-[#0071E3] bg-[#0071E3] text-white disabled:opacity-50`}
        disabled={!ready || pending}
        type="submit"
      >
        {decision === 'APPROVE'
          ? isFinalApproval
            ? 'Final approval — review before publishing'
            : 'Record my approval'
          : decision === 'REJECT'
            ? 'Record my rejection'
            : 'Record my request for changes'}
      </button>
    </form>
  )
}
