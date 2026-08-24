'use client'

/** A short, plain-language introduction to the evidence model. The full explanation lives at
 * `/how-it-works`; this dialog gives readers enough context without leaving the current page. */

import Link from 'next/link'
import { useId } from 'react'
import { useApp } from './app-context'
import { ModalShell } from './ModalShell'

export function QuickGuideModal() {
  const { openModal, setOpenModal } = useApp()
  const isOpen = openModal === 'guide'
  const headingId = useId()

  const handleClose = () => setOpenModal(null)

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      labelledBy={headingId}
      maxWidth="max-w-lg"
      scrim="soft"
      closeButton="inset"
    >
      <div className="p-6 sm:p-7 space-y-5">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0071E3] block mb-1">
            Sources, rules, and human review
          </span>
          <h2 id={headingId} className="text-xl font-bold text-[#1D1D1F] tracking-tight">
            How RNAWiki checks evidence
          </h2>
          <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
            Four safeguards help keep a narrow finding from turning into a broad medical claim.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
            <span className="font-bold text-emerald-800 text-[11px] block">
              1. Start with one development programme
            </span>
            <p className="text-[#1D1D1F] leading-relaxed">
              A programme is one medicine candidate studied for a particular use, dose, and group of
              people. Its result is not treated as a conclusion about every use of the medicine.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/15 space-y-1">
            <span className="font-bold text-rose-800 text-[11px] block">
              2. Label what the source actually says
            </span>
            <p className="text-[#1D1D1F] leading-relaxed">
              Measured results, sponsor reports, regulator findings, and human reviewer
              interpretations are kept separate. “Unknown” and “not measured” are never relabelled
              as failure.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-1">
            <span className="font-bold text-amber-800 text-[11px] block">
              3. Follow each step from dose to patient outcome
            </span>
            <p className="text-[#1D1D1F] leading-relaxed">
              RNA Intelligence checks whether the record connects human exposure, an effect on the
              intended gene or protein, biological changes, and patient outcomes. A missing link
              remains visible instead of being guessed.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/15 space-y-1">
            <span className="font-bold text-[#0071E3] text-[11px] block">
              4. People decide what gets published
            </span>
            <p className="text-[#1D1D1F] leading-relaxed">
              Automated rules find missing sources, inconsistent fields, and information that may be
              out of date. Structured programme corrections and challenges go to two independent,
              qualified reviewers. A medicine-name or trade-name correction uses one independent
              reviewer because it changes identity only, not the medical conclusion. If two
              programme reviewers disagree, a different qualified steward records and explains the
              final decision. Accepting a programme correction does not itself publish a medical
              conclusion; the exact conclusion and its evidence must pass the separate publication
              checks.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href="/how-it-works"
            onClick={handleClose}
            className="text-xs font-semibold text-[#0071E3] hover:underline"
          >
            Read the full explanation
          </Link>
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

export default QuickGuideModal
