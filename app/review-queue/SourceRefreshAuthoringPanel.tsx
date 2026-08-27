'use client'

import { AlertTriangle, CheckCircle2, Send } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { useApp } from '@/components/app-context'
import type { ContributionMachineChecks } from '@/lib/contributions/types'
import type { PublicSourceReviewTask } from '@/lib/queries/public-source-review-tasks'

interface DraftResponse {
  proposal: { id: string; status: string }
  preview: { machineChecks: ContributionMachineChecks }
}

interface SubmitResponse {
  proposal: { id: string; status: string }
}

interface FailureBody {
  error?: string
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  const body = (await response.json().catch(() => ({}))) as T & FailureBody
  if (!response.ok) {
    throw new Error(body.error ?? 'RNAWiki could not complete this source-review action.')
  }
  return body
}

function requirementLabel(kind: string): string {
  if (kind === 'CLAIM') return 'A linked evidence statement needs a reviewed revision.'
  if (kind === 'INTERPRETABILITY') return 'A study-quality assessment needs a reviewed revision.'
  if (kind === 'PRESENTATION') return 'A displayed field needs scientific review before it changes.'
  return 'Part of the source record needs scientific classification.'
}

function requirementDetail(kind: string, fieldPath: string): string {
  if (kind === 'CLAIM') return 'Saved source linked to the evidence statement'
  if (kind === 'INTERPRETABILITY') {
    const criterion = fieldPath.split('.').at(-1) ?? 'study quality'
    return `Study-quality topic: ${criterion.toLowerCase().replaceAll('_', ' ')}`
  }
  const field = fieldPath.split('.').at(-1) ?? fieldPath
  return `Registry field: ${field.replaceAll('_', ' ')}`
}

export function isCurrentSourceRefreshMutation(args: {
  requestGeneration: number
  currentGeneration: number
  requestTaskId: string
  currentTaskId: string
  requestAccountId: string
  currentAccountId: string | null
  aborted: boolean
}): boolean {
  return (
    !args.aborted &&
    args.requestGeneration === args.currentGeneration &&
    args.requestTaskId === args.currentTaskId &&
    args.requestAccountId === args.currentAccountId
  )
}

export function sourceRefreshPrivateScopeKey(taskId: string, accountId: string | null): string {
  return JSON.stringify([taskId, accountId])
}

function QueuedSourceRefreshNotice() {
  return (
    <p className="rounded-xl bg-emerald-50 px-3 py-2 text-[11px] leading-5 text-emerald-950">
      This exact refresh is queued for review.{' '}
      <Link href="/review-queue" className="font-semibold text-[#0066CC] hover:underline">
        View its public review status
      </Link>
      .
    </p>
  )
}

export function SourceRefreshAuthoringPanel({
  task,
  alreadySubmitted = false,
}: {
  task: PublicSourceReviewTask
  alreadySubmitted?: boolean
}) {
  const { currentUser, requireAuth } = useApp()
  if (alreadySubmitted) return <QueuedSourceRefreshNotice />
  const accountId = currentUser?.id ?? null
  // A keyed child makes private disclosure/draft state account- and task-scoped. React unmounts the
  // old scope before rendering another signed-in account in the same browser tab.
  return (
    <ScopedSourceRefreshAuthoringPanel
      key={sourceRefreshPrivateScopeKey(task.id, accountId)}
      task={task}
      accountId={accountId}
      requireAuth={requireAuth}
    />
  )
}

function ScopedSourceRefreshAuthoringPanel({
  task,
  accountId,
  requireAuth,
}: {
  task: PublicSourceReviewTask
  accountId: string | null
  requireAuth: () => void
}) {
  const router = useRouter()
  const delta = task.sourceRefreshDeltaSnapshot
  const taskIdRef = useRef(task.id)
  taskIdRef.current = task.id
  const accountIdRef = useRef(accountId)
  accountIdRef.current = accountId
  const mutationRef = useRef<{ generation: number; controller: AbortController | null }>({
    generation: 0,
    controller: null,
  })
  const [conflictsOfInterest, setConflictsOfInterest] = useState('')
  const [attested, setAttested] = useState(false)
  const [draft, setDraft] = useState<DraftResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(
    () => () => {
      mutationRef.current.controller?.abort()
      mutationRef.current.generation += 1
      mutationRef.current.controller = null
    },
    [],
  )

  const isCurrentMutation = (
    generation: number,
    requestAccountId: string,
    controller: AbortController,
  ) =>
    isCurrentSourceRefreshMutation({
      requestGeneration: generation,
      currentGeneration: mutationRef.current.generation,
      requestTaskId: task.id,
      currentTaskId: taskIdRef.current,
      requestAccountId,
      currentAccountId: accountIdRef.current,
      aborted: controller.signal.aborted,
    })

  if (!delta || !task.source.identifier) {
    return (
      <p className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] leading-5 text-rose-950">
        The saved registry comparison or trial identifier is missing. A steward or administrator
        must repair this task before anyone can submit it.
      </p>
    )
  }

  if (delta.action === 'NEEDS_SCIENTIFIC_REVISION') {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="flex items-start gap-2 text-xs font-semibold leading-5 text-amber-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Stop here: this is more than an exact registry-data refresh.
        </p>
        <p className="mt-2 text-[11px] leading-5 text-amber-950">
          This task cannot update linked evidence statements automatically, and there is not yet a
          one-click form for this kind of revision. A steward or administrator must author a
          complete replacement evidence record. It must include the relevant studies, evidence
          statements, evidence-chain answers, saved sources, mechanism map, any sourced timeline
          events, and conclusion. Two independent qualified reviewers must approve that exact
          proposed record before it can be published.
        </p>
        <ul className="mt-2 space-y-1 text-[11px] leading-5 text-amber-950">
          {delta.scientificRevisionRequirements.map((requirement, index) => (
            <li
              key={`${requirement.kind}:${requirement.id ?? 'none'}:${requirement.fieldPath}:${index}`}
            >
              • {requirementLabel(requirement.kind)}{' '}
              <span className="text-[10px]">
                ({requirementDetail(requirement.kind, requirement.fieldPath)})
              </span>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  async function createCheckedDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accountId) {
      requireAuth()
      return
    }
    mutationRef.current.controller?.abort()
    const controller = new AbortController()
    const generation = mutationRef.current.generation + 1
    mutationRef.current = { generation, controller }
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const response = await requestJson<DraftResponse>(
        `/api/drugs/${encodeURIComponent(task.medicine.slug)}/programmes/${encodeURIComponent(task.programme.slug)}/contributions`,
        {
          method: 'POST',
          signal: controller.signal,
          body: JSON.stringify({
            proposalType: 'SOURCE_REFRESH',
            source: {
              reviewTaskId: task.id,
              reviewSnapshotId: task.reviewSnapshotId,
            },
            conflictsOfInterest,
            conflictsOfInterestAttested: attested,
          }),
        },
      )
      if (!isCurrentMutation(generation, accountId, controller)) return
      setDraft(response)
      setNotice(
        response.preview.machineChecks.passed
          ? 'The server rebuilt the comparison and all required checks passed. Review the checks below before submitting.'
          : 'The draft was saved, but a required check failed. Nothing entered the review queue.',
      )
    } catch (caught) {
      if (!isCurrentMutation(generation, accountId, controller)) return
      setError(caught instanceof Error ? caught.message : 'The checked draft could not be created.')
    } finally {
      if (isCurrentMutation(generation, accountId, controller)) {
        mutationRef.current.controller = null
        setBusy(false)
      }
    }
  }

  async function submitDraft() {
    if (submitted || !draft || !draft.preview.machineChecks.passed) return
    if (!accountId) {
      requireAuth()
      return
    }
    mutationRef.current.controller?.abort()
    const controller = new AbortController()
    const generation = mutationRef.current.generation + 1
    mutationRef.current = { generation, controller }
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const response = await requestJson<SubmitResponse>(
        `/api/contributions/${encodeURIComponent(draft.proposal.id)}/submit`,
        { method: 'POST', body: '{}', signal: controller.signal },
      )
      if (!isCurrentMutation(generation, accountId, controller)) return
      const enteredReview = response.proposal.status === 'SUBMITTED'
      setSubmitted(enteredReview)
      setNotice(
        enteredReview
          ? 'Submitted for three independent reviews. The public conclusion has not changed.'
          : 'The draft did not enter review.',
      )
      router.refresh()
    } catch (caught) {
      if (!isCurrentMutation(generation, accountId, controller)) return
      setError(
        caught instanceof Error ? caught.message : 'The checked draft could not be submitted.',
      )
    } finally {
      if (isCurrentMutation(generation, accountId, controller)) {
        mutationRef.current.controller = null
        setBusy(false)
      }
    }
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
      <p className="flex items-start gap-2 text-xs font-semibold leading-5 text-[#1D1D1F]">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
        This task contains only exact fields parsed from ClinicalTrials.gov.
      </p>
      <p className="mt-1 text-[11px] leading-5 text-[#424245]">
        You cannot edit medical claims here. RNAWiki will rebuild the saved comparison, the list of
        other statements and page sections that may need updating, and all required checks on the
        server before it accepts a review submission.
      </p>

      {!draft ? (
        <form className="mt-4 space-y-3" onSubmit={createCheckedDraft}>
          <label className="block text-[11px] font-semibold text-[#1D1D1F]">
            Conflict-of-interest disclosure
            <textarea
              value={conflictsOfInterest}
              onChange={(event) => setConflictsOfInterest(event.target.value)}
              required
              maxLength={4_000}
              rows={3}
              disabled={busy}
              placeholder="Write “None” if you have no conflict to disclose."
              className="mt-1.5 w-full rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-xs leading-5 outline-none focus:border-[#0071E3]"
            />
          </label>
          <label className="flex items-start gap-2 text-[11px] leading-5 text-[#424245]">
            <input
              type="checkbox"
              checked={attested}
              onChange={(event) => setAttested(event.target.checked)}
              required
              disabled={busy}
              className="mt-1"
            />
            I confirm that this disclosure is complete and that I did not edit the registry facts.
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1D1D1F] px-4 py-2 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Checking…' : accountId ? 'Build checked review draft' : 'Sign in to continue'}
          </button>
        </form>
      ) : (
        <div className="mt-4 space-y-3">
          <ul className="space-y-1 text-[11px] leading-5 text-[#424245]">
            {draft.preview.machineChecks.checks.map((check) => (
              <li key={check.code}>
                {check.status === 'PASS' ? 'Passed' : check.status === 'WARN' ? 'Check' : 'Blocked'}
                : {check.message}
              </li>
            ))}
          </ul>
          {submitted ? (
            <QueuedSourceRefreshNotice />
          ) : (
            <button
              type="button"
              onClick={submitDraft}
              disabled={busy || !draft.preview.machineChecks.passed}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1D1D1F] px-4 py-2 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              {busy ? 'Submitting…' : 'Submit for three independent reviews'}
            </button>
          )}
        </div>
      )}

      {notice && <p className="mt-3 text-[11px] leading-5 text-emerald-900">{notice}</p>}
      {error && (
        <p role="alert" className="mt-3 text-[11px] leading-5 text-rose-900">
          {error}
        </p>
      )}
    </section>
  )
}
