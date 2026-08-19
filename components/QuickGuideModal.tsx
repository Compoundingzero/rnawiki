'use client'

/**
 * The methodology explainer — a port of the master reference wireframe's
 * `src/components/QuickGuideModal.tsx`. Section order, the four coloured cards, every word of the
 * copy and every class are the reference's.
 *
 * Nothing here needed correcting. The instruction for this port was to update only copy describing
 * behaviour that changed in the rebuild — physician verification and editing — and this dialog
 * describes neither: all four cards are claims about how evidence is graded, which is the one part
 * of the wireframe that was already true. The verification copy that DID need rewriting was in
 * DoctorVerificationModal.tsx, and it was rewritten there.
 *
 * The only changes are structural: the backdrop, panel, close button, focus trap and Escape key
 * now come from ModalShell, and the heading is wired to the dialog's `aria-labelledby`.
 */

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
            Audit Methodology
          </span>
          <h2 id={headingId} className="text-xl font-bold text-[#1D1D1F] tracking-tight">
            The 4-Truths Evidence Standard
          </h2>
          <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
            How RNAwiki separates rigorous clinical reality from pharmaceutical marketing.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
            <span className="font-bold text-emerald-800 text-[11px] block">
              1. Strictly Measured in Humans
            </span>
            <p className="text-[#1D1D1F] leading-relaxed">
              Biomarkers, survival rates, and clinical endpoints proven in double-blind randomized
              trials with verifiable p-values.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/15 space-y-1">
            <span className="font-bold text-rose-800 text-[11px] block">
              2. Inferred Claims &amp; Overreach
            </span>
            <p className="text-[#1D1D1F] leading-relaxed">
              Promotional hypotheses that sound persuasive but lack definitive long-term clinical
              outcome proof.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-1">
            <span className="font-bold text-amber-800 text-[11px] block">
              3. What Failed Initially
            </span>
            <p className="text-[#1D1D1F] leading-relaxed">
              Delivery challenges, chemical instability, or adverse reactions that pharma brochures
              often omit.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/15 space-y-1">
            <span className="font-bold text-[#0071E3] text-[11px] block">
              4. Open-Source Pricing &amp; Synthesis
            </span>
            <p className="text-[#1D1D1F] leading-relaxed">
              Reagent costs, solid-phase protocols, and patent expiration dates to empower
              biosimilar and generic manufacturing.
            </p>
          </div>
        </div>

        <div className="pt-2 text-right">
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
