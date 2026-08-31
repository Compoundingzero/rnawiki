'use client'

import { MessageSquareWarning } from 'lucide-react'

import { useApp } from '@/components/app-context'

export function DatasetCorrectionButton() {
  const { setOpenModal } = useApp()

  return (
    <button
      type="button"
      onClick={() => setOpenModal('feedback')}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/[0.1] bg-white px-4 text-xs font-bold text-[#1D1D1F] transition hover:border-[#0071E3]/30 hover:text-[#0066CC]"
    >
      <MessageSquareWarning className="h-4 w-4" aria-hidden="true" />
      Report a dataset correction
    </button>
  )
}
