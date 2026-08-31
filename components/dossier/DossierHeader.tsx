import Link from 'next/link'
import { CircleDashed, CircleMinus, CheckCircle2 } from 'lucide-react'

import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import { publicApprovalStatusLabel, publicMedicineTypeLabel } from '@/lib/public-medicine-language'

export interface DossierHeaderProps {
  dossier: MedicineDossierViewModel
}

function readableStoredLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/gu, ' ')
    .replace(/^./u, (letter) => letter.toUpperCase())
}

function statusLabel(dossier: MedicineDossierViewModel): string {
  return dossier.statusBadge.kind === 'medicine_approval'
    ? publicApprovalStatusLabel(dossier.statusBadge.value)
    : `Research status: ${readableStoredLabel(dossier.statusBadge.value)}`
}

function scopeLabel(dossier: MedicineDossierViewModel): string {
  if (dossier.bindingState === 'published_programme') return 'This answer is for'
  if (dossier.bindingState === 'programme_unpublished') return 'Research question'
  return 'Research covered on this page'
}

function answerStatus(dossier: MedicineDossierViewModel): string {
  if (dossier.bindingState === 'published_programme') return 'Reviewed answer'
  if (dossier.bindingState === 'programme_unpublished') return 'No reviewed answer yet'
  return 'General research summary'
}

function reviewDate(dossier: MedicineDossierViewModel): string | undefined {
  if (dossier.bindingState !== 'published_programme') return undefined
  const value = dossier.review.reviewedAt ?? dossier.review.publishedAt
  if (!value) return undefined
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return undefined
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed)
}

/**
 * Dossier identity and scope, following the reference page's quiet editorial composition.
 * Audience projections are rendered after the ten-second answer, outside this identity header.
 */
export function DossierHeader({ dossier }: DossierHeaderProps) {
  const checkedAt = reviewDate(dossier)
  const AnswerStatusIcon =
    dossier.bindingState === 'published_programme'
      ? CheckCircle2
      : dossier.bindingState === 'programme_unpublished'
        ? CircleDashed
        : CircleMinus
  const answerStatusTone =
    dossier.bindingState === 'published_programme'
      ? 'text-emerald-700'
      : dossier.bindingState === 'programme_unpublished'
        ? 'text-amber-700'
        : 'text-[#6E6E73]'

  return (
    <header className="min-w-0 border-b border-black/[0.08] pb-6 pt-2 sm:pb-7 sm:pt-6">
      <div className="min-w-0 max-w-4xl">
        <h1 className="[overflow-wrap:anywhere] text-4xl font-bold leading-[1.02] tracking-[-0.045em] text-[#1D1D1F] sm:text-[56px]">
          {dossier.name}
        </h1>
        {dossier.tradeName && (
          <p className="mt-2 max-w-3xl [overflow-wrap:anywhere] text-base leading-7 text-[#6E6E73] sm:text-xl">
            {dossier.tradeName}
          </p>
        )}
        <p className="mt-3 max-w-3xl [overflow-wrap:anywhere] text-base leading-7 text-[#1D1D1F] sm:text-lg">
          {publicMedicineTypeLabel(dossier.modality)}. {statusLabel(dossier)}.
        </p>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6E6E73]">
          The same medicine can have different answers for different uses and groups of people.
        </p>
      </div>

      <div className="mt-6 min-w-0 border-t border-black/[0.08] pt-5">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium leading-5 text-[#6E6E73]">{scopeLabel(dossier)}</p>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
              <p
                className="min-w-0 [overflow-wrap:anywhere] text-sm font-semibold leading-6 text-[#1D1D1F]"
                data-testid="dossier-binding-line"
              >
                {dossier.selectedProgrammeLabel}
              </p>
              {dossier.programmes.length > 1 && (
                <details className="group/question relative min-w-0">
                  <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-full px-2 text-xs font-semibold text-[#0A66D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8] [&::-webkit-details-marker]:hidden">
                    Change use
                    <span
                      aria-hidden="true"
                      className="transition-transform group-open/question:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </summary>
                  <div className="absolute left-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-black/[0.08] bg-white p-2 shadow-[0_12px_34px_rgba(0,0,0,0.12)]">
                    <p className="px-3 pb-2 pt-1 text-sm leading-6 text-[#6E6E73]">
                      Choose another use or group. The answer and evidence may change.
                    </p>
                    <ul className="space-y-1" aria-label="Other questions about this medicine">
                      {dossier.programmes.map((programme) => (
                        <li key={programme.id} className="min-w-0">
                          {programme.href ? (
                            <Link
                              href={programme.href}
                              aria-current={programme.selected ? 'page' : undefined}
                              className={`block min-h-11 rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8] ${programme.selected ? 'bg-blue-50' : 'hover:bg-[#F5F5F7]'}`}
                            >
                              <span className="block [overflow-wrap:anywhere] text-sm font-semibold leading-5 text-[#1D1D1F]">
                                {programme.label}
                              </span>
                              <span className="mt-0.5 block text-xs leading-5 text-[#6E6E73]">
                                {readableStoredLabel(programme.status)}
                                {programme.selected ? ' · Selected' : ''}
                              </span>
                            </Link>
                          ) : (
                            <span className="block min-h-11 rounded-xl bg-blue-50 px-3 py-2">
                              <span className="block [overflow-wrap:anywhere] text-sm font-semibold leading-5 text-[#1D1D1F]">
                                {programme.label}
                              </span>
                              <span className="mt-0.5 block text-xs leading-5 text-[#6E6E73]">
                                {readableStoredLabel(programme.status)} · Selected
                              </span>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              )}
            </div>
          </div>

          <p
            id="approval-status"
            className="inline-flex min-h-6 shrink-0 items-center gap-1.5 text-xs leading-5 text-[#6E6E73]"
          >
            <AnswerStatusIcon className={`h-3.5 w-3.5 ${answerStatusTone}`} aria-hidden="true" />
            {answerStatus(dossier)}
            {checkedAt ? ` · Checked ${checkedAt}` : ''}
          </p>
        </div>
      </div>
    </header>
  )
}
