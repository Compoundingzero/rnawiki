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

export type ModalKey = 'auth' | 'feedback' | 'account' | null

interface AppContextValue {
  currentUser: CommentUser | null
  /** True while `/api/auth/me` is confirming the shared browser session. */
  isLoadingUser: boolean
  /** Identity-bearing controls stay unavailable until the server confirms the active account. */
  sessionActionLocked: boolean
  /** Commits a successful local login/logout and tells the other tabs to reconcile. */
  setCurrentUser: (user: CommentUser | null) => void
  /** `undefined` means the server session could not be confirmed; last-known identity is kept. */
  refreshUser: () => Promise<CommentUser | null | undefined>

  openModal: ModalKey
  setOpenModal: (key: ModalKey) => void
  requireAuth: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export const SESSION_CHANGE_CHANNEL = 'rnawiki-session-change'
export const SESSION_CHANGE_STORAGE_KEY = 'rnawiki:session-change'

interface SessionChangeMessage {
  type: 'session-changed'
  sourceId: string
  nonce: string
}

export function isSessionChangeMessage(value: unknown): value is SessionChangeMessage {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as { type?: unknown; sourceId?: unknown; nonce?: unknown }
  const keys = Object.keys(value)
  return (
    keys.length === 3 &&
    keys.every((key) => key === 'type' || key === 'sourceId' || key === 'nonce') &&
    candidate.type === 'session-changed' &&
    typeof candidate.sourceId === 'string' &&
    candidate.sourceId.length > 0 &&
    typeof candidate.nonce === 'string' &&
    candidate.nonce.length > 0
  )
}

export function shouldReconcileVisibleSession(visibilityState: DocumentVisibilityState): boolean {
  return visibilityState === 'visible'
}

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
  /** Server-resolved last-known identity, retained while the browser confirms the shared cookie. */
  initialUser: CommentUser | null
}) {
  const [currentUser, setStoredCurrentUser] = useState<CommentUser | null>(initialUser)
  // `initialUser` was read while the server rendered this page. Another tab can replace the shared
  // session cookie before this tab hydrates, so it is last-known identity rather than permission to
  // perform an attributed write. Keep the entire interactive tree locked until the post-hydration
  // `/me` request below confirms which account owns the cookie now.
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isSessionReconciled, setIsSessionReconciled] = useState(false)
  const [openModal, setOpenModal] = useState<ModalKey>(null)
  const refreshRequestRef = useRef<{ generation: number; controller: AbortController | null }>({
    generation: 0,
    controller: null,
  })
  const sessionChannelRef = useRef<BroadcastChannel | null>(null)
  const sessionSourceIdRef = useRef('')
  const sessionMessageSequenceRef = useRef(0)

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
    setIsSessionReconciled(false)
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
      // An id change is deliberately committed, not hidden behind the old render. Every existing
      // account-scoped effect then aborts pending work and clears drafts owned by the prior id.
      setStoredCurrentUser(data.user)
      setIsSessionReconciled(true)
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

  const broadcastSessionChange = useCallback(() => {
    if (typeof window === 'undefined') return
    if (!sessionSourceIdRef.current) {
      sessionSourceIdRef.current =
        typeof window.crypto?.randomUUID === 'function'
          ? window.crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`
    }
    sessionMessageSequenceRef.current += 1
    const message: SessionChangeMessage = {
      type: 'session-changed',
      sourceId: sessionSourceIdRef.current,
      nonce: `${Date.now()}-${sessionMessageSequenceRef.current}`,
    }

    if (sessionChannelRef.current) {
      sessionChannelRef.current.postMessage(message)
      return
    }

    // Safari versions without BroadcastChannel still propagate a storage event to other tabs.
    // The value carries no identity or session secret, only an invalidation notice.
    try {
      window.localStorage.setItem(SESSION_CHANGE_STORAGE_KEY, JSON.stringify(message))
    } catch {
      // Focus and visibility reconciliation remain the fallback when storage is unavailable.
    }
  }, [])

  const setCurrentUser = useCallback(
    (user: CommentUser | null) => {
      // A local login/logout is newer than any `/me` read that began before it. Abort and advance
      // the generation before committing, so an old response cannot overwrite the new session.
      refreshRequestRef.current.controller?.abort()
      refreshRequestRef.current.generation += 1
      refreshRequestRef.current.controller = null
      setIsLoadingUser(false)
      setStoredCurrentUser(user)
      setIsSessionReconciled(true)
      broadcastSessionChange()
    },
    [broadcastSessionChange],
  )

  useEffect(() => {
    sessionSourceIdRef.current =
      typeof window.crypto?.randomUUID === 'function'
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`

    const reconcileLatestSession = () => {
      void refreshUser()
    }
    const reconcileOnAttention = () => {
      // Focus and visibility often fire together. One request is enough; a cross-tab broadcast,
      // unlike these attention events, deliberately supersedes an in-flight read below.
      if (refreshRequestRef.current.controller) return
      void refreshUser()
    }
    const receiveSessionChange = (value: unknown) => {
      if (!isSessionChangeMessage(value)) return
      if (value.sourceId === sessionSourceIdRef.current) return
      reconcileLatestSession()
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== SESSION_CHANGE_STORAGE_KEY || !event.newValue) return
      try {
        receiveSessionChange(JSON.parse(event.newValue) as unknown)
      } catch {
        // A malformed value from another script is not a session-change signal.
      }
    }
    const handleVisibilityChange = () => {
      if (shouldReconcileVisibleSession(document.visibilityState)) reconcileOnAttention()
    }

    let channel: BroadcastChannel | null = null
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(SESSION_CHANGE_CHANNEL)
      sessionChannelRef.current = channel
      channel.addEventListener('message', (event: MessageEvent<unknown>) => {
        receiveSessionChange(event.data)
      })
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', reconcileOnAttention)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Subscribe first, then confirm the server-rendered identity. This order closes the window in
    // which another tab could change the cookie after the HTML was produced but before this tab
    // began listening for invalidations.
    reconcileLatestSession()

    return () => {
      channel?.close()
      if (sessionChannelRef.current === channel) sessionChannelRef.current = null
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', reconcileOnAttention)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshUser])

  const requireAuth = useCallback(() => setOpenModal('auth'), [])

  const value = useMemo<AppContextValue>(
    () => ({
      currentUser,
      isLoadingUser,
      sessionActionLocked: !isSessionReconciled,
      setCurrentUser,
      refreshUser,
      openModal,
      setOpenModal,
      requireAuth,
    }),
    [
      currentUser,
      isLoadingUser,
      isSessionReconciled,
      setCurrentUser,
      refreshUser,
      openModal,
      requireAuth,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

/** Read account state when present without forcing standalone public surfaces into AppShell. */
export function useOptionalApp(): AppContextValue | null {
  return useContext(AppContext)
}
