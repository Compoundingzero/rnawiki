'use client'

// The application chrome — the direct port of the master reference wireframe's App.tsx, minus the
// two jobs Next.js took over.
//
// App.tsx was chrome AND router AND data store: it held the drug ledger, decided which of its two
// views to render, and persisted everything to localStorage. Here the route decides the view and
// the server owns the data, so what survives is exactly the frame that wraps every page: the
// header, the main region, the floating Feedback button, the footer, and the four modals that any
// page can open.
//
// Everything visual is the reference's, unchanged — the outer div's classes, the main region's
// `flex-1 pb-12`, and the Feedback button's classes, icon, title and copy, character for
// character.
//
// Divergences, all four sanctioned (see CLAUDE.md), none of them visual:
//
//  1. localStorage became the server. The wireframe read the user out of localStorage in a
//     `useState` initialiser, which meant the first paint on a signed-in reload showed a signed-out
//     header. `initialUser` is resolved on the server by the layout and handed to `AppProvider`, so
//     the header is correct in the very first byte of HTML.
//  2. Modal state moved into `AppProvider` (`openModal`), because the header, the dossier body and
//     the floating button below all need to open modals and they are no longer siblings in one
//     component. Each modal reads `useApp().openModal` itself and therefore takes no props.
//  3. `<main>` carries `id="main"`, the target of the skip link in app/layout.tsx. The wireframe
//     had neither.
//  4. The Feedback button is a real `<button type="button">` with an accessible name, and its icon
//     is `aria-hidden` — the visible "Feedback" label is the name, so the icon must not be read
//     twice.

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
  /**
   * The signed-in reader as the server sees them, or null. Passed down rather than fetched so the
   * header never flashes "Doctor & Contributor Log-in" at someone who is already signed in.
   */
  initialUser: CommentUser | null
}

/**
 * The floating Feedback button.
 *
 * Split out of `AppShell` for one structural reason: `AppShell` *renders* `AppProvider`, so its own
 * body sits outside that provider and cannot call `useApp()`. This one does, because it is a child.
 */
function FeedbackButton() {
  const { setOpenModal } = useApp()

  return (
    <button
      type="button"
      onClick={() => setOpenModal('feedback')}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-white/95 backdrop-blur-md hover:bg-white text-[#1D1D1F] hover:text-[#0071E3] border border-black/[0.08] hover:border-[#0071E3]/30 px-3.5 py-2 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.08)] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
      title="Send feedback to improve RNAwiki"
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
        {/* 1. Header */}
        <SiteHeader />

        {/* 2. The page. The route decides what this is; the wireframe branched on a state
            variable between exactly two views. */}
        <main id="main" className="flex-1 pb-12">
          {children}
        </main>

        {/* 3. Subtle Floating Feedback Button */}
        <FeedbackButton />

        {/* 4. Clean Apple Footer */}
        <SiteFooter />

        {/* 5. Modals. Each one renders null unless `openModal` names it, so mounting all four
            costs nothing until a reader opens one. */}
        <AuthModal />
        <FeedbackModal />
        <AccountModal />
        <QuickGuideModal />
      </div>
    </AppProvider>
  )
}
