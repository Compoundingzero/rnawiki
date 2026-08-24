'use client'

import type { ReactNode } from 'react'
import { MessageSquare } from 'lucide-react'

import { AppProvider, useApp } from './app-context'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { AuthModal } from './DoctorVerificationModal'
import { FeedbackModal } from './FeedbackModal'
import { AccountModal } from './AccountModal'
import { QuickGuideModal } from './QuickGuideModal'
import type { CommentUser } from '@/lib/types'

export interface AppShellProps {
  children: ReactNode
  /** Server-resolved identity prevents signed-in controls from flashing the signed-out state. */
  initialUser: CommentUser | null
}

function FeedbackButton() {
  const { setOpenModal } = useApp()

  return (
    <button
      type="button"
      onClick={() => setOpenModal('feedback')}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-white/95 backdrop-blur-md hover:bg-white text-[#1D1D1F] hover:text-[#0071E3] border border-black/[0.08] hover:border-[#0071E3]/30 px-3.5 py-2 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.08)] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
      title="Send feedback to improve RNAWiki"
    >
      <MessageSquare className="w-3.5 h-3.5 text-[#0071E3] shrink-0" aria-hidden="true" />
      <span className="text-[11px] font-semibold">Feedback</span>
    </button>
  )
}

export function AppShell({ children, initialUser }: AppShellProps) {
  return (
    <AppProvider initialUser={initialUser}>
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-sans antialiased selection:bg-[#0071E3]/15 selection:text-[#0071E3]">
        <SiteHeader />

        <main id="main" className="flex-1 pb-12">
          {children}
        </main>

        <FeedbackButton />

        <SiteFooter />

        <AuthModal />
        <FeedbackModal />
        <AccountModal />
        <QuickGuideModal />
      </div>
    </AppProvider>
  )
}
