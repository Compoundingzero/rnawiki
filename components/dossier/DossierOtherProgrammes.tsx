import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import type { ProgrammeOptionView } from '@/lib/medicine-dossier-view-model'

function statusTone(status: string): string {
  const value = status.toLowerCase()
  if (value.includes('stopped') || value.includes('withdrawn')) {
    return 'bg-[#FFF8E7] text-[#8A4B00]'
  }
  if (value.includes('approved') || value.includes('marketed')) {
    return 'bg-[#EDF8F2] text-[#16764A]'
  }
  return 'bg-[#EEF5FF] text-[#0A66D8]'
}

/**
 * Every row shows that programme's own published finding, or says plainly that none exists.
 * A conclusion never travels between rows; selection is a full navigation to the same record.
 */
export function DossierOtherProgrammes({
  programmes,
}: {
  programmes: readonly ProgrammeOptionView[]
}) {
  if (programmes.length < 2) return null

  return (
    <section
      id="other-programmes"
      aria-labelledby="other-programmes-heading"
      className="min-w-0 scroll-mt-36 border-t border-black/[0.08] pt-8"
      data-testid="dossier-other-programmes"
    >
      <header className="max-w-3xl space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#0066CC]">
          One medicine, separate answers
        </p>
        <h3
          id="other-programmes-heading"
          className="text-2xl font-[650] leading-tight tracking-[-0.02em] text-[#1D1D1F] sm:text-[32px]"
        >
          The same medicine has been tested for other questions
        </h3>
        <p className="text-base leading-7 text-[#515154]">
          Each answer belongs to one studied use and group of people, not to the medicine as a
          whole.
        </p>
      </header>

      <ul className="mt-4 space-y-2.5" aria-label="Other studied uses of this medicine">
        {programmes.map((programme) => (
          <li
            key={programme.id}
            className={`flex min-w-0 flex-col justify-between gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${
              programme.selected
                ? 'border-[#0A66D8] bg-[#EEF5FF]'
                : 'border-black/[0.08] bg-white hover:bg-[#FAFAFA]'
            }`}
          >
            <div className="min-w-0 space-y-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="[overflow-wrap:anywhere] text-sm font-bold leading-5 text-[#1D1D1F]">
                  {programme.label}
                </span>
                {/* A verdict label keeps a neutral chip: status colours must never tint the
                    published conclusion's own wording. */}
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold leading-4 ${
                    programme.publishedLabel
                      ? 'bg-[#EEF5FF] text-[#0A66D8]'
                      : statusTone(programme.status)
                  }`}
                >
                  {programme.publishedLabel ?? programme.status}
                </span>
              </div>
              <p className="max-w-2xl [overflow-wrap:anywhere] text-xs leading-5 text-[#515154]">
                {programme.oneSentenceResult ??
                  'No reviewed conclusion has been published for this use yet.'}
              </p>
            </div>

            {programme.selected ? (
              <span className="shrink-0 self-start rounded-full border border-[#0A66D8]/20 bg-white px-3 py-1 text-xs font-semibold text-[#0A66D8] sm:self-auto">
                Selected answer
              </span>
            ) : (
              programme.href && (
                <Link
                  href={programme.href}
                  className="inline-flex shrink-0 items-center gap-1 self-start rounded-full px-2 py-1 text-xs font-semibold text-[#0A66D8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8] sm:self-auto"
                >
                  View this answer
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              )
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
