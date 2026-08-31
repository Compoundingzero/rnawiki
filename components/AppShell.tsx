'use client'

import type { ReactNode } from 'react'
import { MessageSquare, RefreshCw } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { AppProvider, useApp } from './app-context'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { AuthModal } from './AuthModal'
import { FeedbackModal } from './FeedbackModal'
import { AccountModal } from './AccountModal'
import type { CommentUser } from '@/lib/types'

export interface AppShellProps {
  children: ReactNode
  /** Server-resolved last-known identity, kept masked until the browser confirms the session. */
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

function SessionAwareApp({ children }: { children: ReactNode }) {
  const { isLoadingUser, refreshUser, sessionActionLocked } = useApp()
  const pathname = usePathname()
  const isDossierView = pathname.startsWith('/d/')
  const publicReadingStaysAvailable = isDossierView || pathname.startsWith('/datasets')
  const lockWholeShell = sessionActionLocked && !publicReadingStaysAvailable

  return (
    <>
      <div
        className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-sans antialiased selection:bg-[#0071E3]/15 selection:text-[#0071E3]"
        aria-busy={lockWholeShell}
        inert={lockWholeShell ? true : undefined}
      >
        <SiteHeader />

        <main id="main" className="flex-1 pb-12">
          {children}
        </main>

        {!isDossierView && <FeedbackButton />}

        <SiteFooter />

        <AuthModal />
        <FeedbackModal />
        <AccountModal />
      </div>

      {lockWholeShell && (
        <aside
          role="status"
          aria-live={isLoadingUser ? 'polite' : 'assertive'}
          className="fixed inset-x-3 top-16 z-[70] mx-auto max-w-lg rounded-2xl border border-[#0071E3]/20 bg-white/95 p-3 shadow-xl backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:top-20 sm:w-[26rem]"
        >
          <div className="flex items-start gap-3">
            <RefreshCw
              className={`mt-0.5 h-4 w-4 shrink-0 text-[#0071E3] ${isLoadingUser ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#1D1D1F]">
                {isLoadingUser ? 'Confirming your signed-in account…' : 'Account check incomplete'}
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[#6E6E73]">
                {isLoadingUser
                  ? 'Commenting, editing, and review controls will return after RNAWiki confirms which account is active.'
                  : 'RNAWiki could not confirm which account is active. Commenting, editing, and review controls remain unavailable.'}
              </p>
              {!isLoadingUser && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void refreshUser()}
                    className="min-h-9 rounded-full bg-[#0071E3] px-3 text-[11px] font-semibold text-white hover:bg-[#0077ED]"
                  >
                    Retry account check
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="min-h-9 rounded-full border border-black/[0.1] bg-white px-3 text-[11px] font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7]"
                  >
                    Reload this page
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}
    </>
  )
}

export function AppShell({ children, initialUser }: AppShellProps) {
  return (
    <AppProvider initialUser={initialUser}>
      <SessionAwareApp>{children}</SessionAwareApp>
    </AppProvider>
  )
}
