'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { CommentUser } from '@/lib/types'

export type ModalKey = 'auth' | 'feedback' | 'account' | 'guide' | null

interface AppContextValue {
  currentUser: CommentUser | null
  /** True while the initial /api/auth/me round trip is in flight. */
  isLoadingUser: boolean
  setCurrentUser: (user: CommentUser | null) => void
  /** `undefined` means the server session could not be confirmed; last-known identity is kept. */
  refreshUser: () => Promise<CommentUser | null | undefined>

  openModal: ModalKey
  setOpenModal: (key: ModalKey) => void
  requireAuth: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function isCurrentUserRefresh(args: {
  generation: number
  currentGeneration: number
  aborted: boolean
}): boolean {
  return !args.aborted && args.generation === args.currentGeneration
}

export function isSessionMutationInteractionLocked(
  requestPending: boolean,
  reconciliationRequired: boolean,
): boolean {
  return requestPending || reconciliationRequired
}

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
  const refreshRequestRef = useRef<{ generation: number; controller: AbortController | null }>({
    generation: 0,
    controller: null,
  })

  useEffect(
    () => () => {
      refreshRequestRef.current.controller?.abort()
      refreshRequestRef.current.generation += 1
      refreshRequestRef.current.controller = null
    },
    [],
  )

  const refreshUser = useCallback(async () => {
    refreshRequestRef.current.controller?.abort()
    const controller = new AbortController()
    const generation = refreshRequestRef.current.generation + 1
    refreshRequestRef.current = { generation, controller }
    setIsLoadingUser(true)
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', signal: controller.signal })
      if (
        !isCurrentUserRefresh({
          generation,
          currentGeneration: refreshRequestRef.current.generation,
          aborted: controller.signal.aborted,
        })
      ) {
        return undefined
      }
      if (!res.ok) {
        // A 401, 429 or 500 does not prove that the cookie is signed out. Preserve the last-known
        // account; only a successful `{ user: null }` response may clear it.
        return undefined
      }
      const body: unknown = await res.json()
      if (
        typeof body !== 'object' ||
        body === null ||
        !('user' in body) ||
        (body.user !== null && (typeof body.user !== 'object' || body.user === null))
      ) {
        throw new Error('The account response did not contain a user value.')
      }
      const data = body as { user: CommentUser | null }
      if (
        !isCurrentUserRefresh({
          generation,
          currentGeneration: refreshRequestRef.current.generation,
          aborted: controller.signal.aborted,
        })
      ) {
        return undefined
      }
      setCurrentUser(data.user)
      return data.user
    } catch {
      // A failed or malformed refresh cannot prove either signed-in state. Leave the last-known
      // user in place and tell the caller that reconciliation was inconclusive.
      return undefined
    } finally {
      if (
        isCurrentUserRefresh({
          generation,
          currentGeneration: refreshRequestRef.current.generation,
          aborted: controller.signal.aborted,
        })
      ) {
        refreshRequestRef.current.controller = null
        setIsLoadingUser(false)
      }
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
