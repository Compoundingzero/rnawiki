'use client'

// The client spine, and the direct descendant of the wireframe's App.tsx.
//
// App.tsx held four things in one component: the signed-in user, the drug ledger, which modal is
// open, and the current view. Next.js takes the last two of those over — routing IS the view, and
// the server owns the drug data — so what is left here is exactly the state that must be shared
// across the header, the dossier and every modal: who is signed in, and which modal is open.
//
// It deliberately does NOT cache drugs. The wireframe kept the whole ledger in localStorage and
// mutated it in place, which is why an edit there never reached anyone else. Here an edit is a
// revision, the server decides whether it publishes, and the page revalidates.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CommentUser } from '@/lib/types'

export type ModalKey = 'auth' | 'feedback' | 'account' | 'guide' | null

interface AppContextValue {
  currentUser: CommentUser | null
  /** True while the initial /api/auth/me round trip is in flight. */
  isLoadingUser: boolean
  setCurrentUser: (user: CommentUser | null) => void
  refreshUser: () => Promise<void>

  openModal: ModalKey
  setOpenModal: (key: ModalKey) => void
  /** Convenience the wireframe called `onOpenDoctorModal`. */
  requireAuth: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({
  children,
  initialUser,
}: {
  children: ReactNode
  /**
   * Resolved on the server so the header renders signed-in on the very first paint. Without it the
   * header flashes "Doctor & Contributor Log-in" for one frame on every navigation for a
   * signed-in reader.
   */
  initialUser: CommentUser | null
}) {
  const [currentUser, setCurrentUser] = useState<CommentUser | null>(initialUser)
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const [openModal, setOpenModal] = useState<ModalKey>(null)

  const refreshUser = useCallback(async () => {
    setIsLoadingUser(true)
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (!res.ok) {
        setCurrentUser(null)
        return
      }
      const data: { user: CommentUser | null } = await res.json()
      setCurrentUser(data.user)
    } catch {
      // A failed refresh must never sign the reader out — the cookie is still valid, the network
      // was not. Leave the last known user in place.
    } finally {
      setIsLoadingUser(false)
    }
  }, [])

  const requireAuth = useCallback(() => setOpenModal('auth'), [])

  const value = useMemo<AppContextValue>(
    () => ({
      currentUser,
      isLoadingUser,
      setCurrentUser,
      refreshUser,
      openModal,
      setOpenModal,
      requireAuth,
    }),
    [currentUser, isLoadingUser, refreshUser, openModal, requireAuth],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

/** True only for an account a steward has actually verified. Never derived from a client flag. */
export function isVerifiedPhysician(user: CommentUser | null): boolean {
  return Boolean(user && user.isDoctor && user.verificationState === 'verified')
}
