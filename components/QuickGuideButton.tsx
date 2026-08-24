'use client'

import { useApp } from '@/components/app-context'

export function QuickGuideButton() {
  const { setOpenModal } = useApp()
  return (
    <button
      type="button"
      onClick={() => setOpenModal('guide')}
      className="text-[#6E6E73] transition hover:text-[#0071E3] hover:underline"
    >
      Quick evidence guide
    </button>
  )
}
