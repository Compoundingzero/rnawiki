'use client'

import { useApp } from '@/components/app-context'

/**
 * The one entry point to the reading guide.
 *
 * QuickGuideModal was ported from the reference and then had nothing that opened it — the
 * wireframe defined the component but never mounted it either, so the gap came across with the
 * port. It lives in the footer nav rather than the header because it is a "first time here?"
 * affordance, and the header row the reference draws has no room the design would forgive.
 */
export function GuideLink() {
  const { setOpenModal } = useApp()

  return (
    <button
      type="button"
      onClick={() => setOpenModal('guide')}
      className="text-[#86868B] hover:text-[#0071E3] hover:underline transition"
    >
      How to read a dossier
    </button>
  )
}
