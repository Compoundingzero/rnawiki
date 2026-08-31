import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  isCurrentUserRefresh,
  isSessionChangeMessage,
  SESSION_CHANGE_CHANNEL,
  SESSION_CHANGE_STORAGE_KEY,
  shouldReconcileVisibleSession,
} from '@/components/app-context'

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('cross-tab account reconciliation', () => {
  it('accepts only explicit privacy-safe session invalidation messages', () => {
    expect(
      isSessionChangeMessage({
        type: 'session-changed',
        sourceId: 'tab-a',
        nonce: 'change-1',
      }),
    ).toBe(true)
    expect(isSessionChangeMessage(null)).toBe(false)
    expect(isSessionChangeMessage({ type: 'session-changed', sourceId: '', nonce: '1' })).toBe(
      false,
    )
    expect(
      isSessionChangeMessage({
        type: 'session-changed',
        sourceId: 'tab-a',
        nonce: '',
        user: { id: 'must-not-cross-tabs' },
      }),
    ).toBe(false)
    expect(SESSION_CHANGE_CHANNEL).toBe('rnawiki-session-change')
    expect(SESSION_CHANGE_STORAGE_KEY).toBe('rnawiki:session-change')
  })

  it('reconciles only when a tab becomes visible', () => {
    expect(shouldReconcileVisibleSession('visible')).toBe(true)
    expect(shouldReconcileVisibleSession('hidden')).toBe(false)
  })

  it('rejects an older or aborted account response after a newer refresh or local commit', () => {
    expect(isCurrentUserRefresh({ generation: 4, currentGeneration: 4, aborted: false })).toBe(true)
    expect(isCurrentUserRefresh({ generation: 4, currentGeneration: 5, aborted: false })).toBe(
      false,
    )
    expect(isCurrentUserRefresh({ generation: 4, currentGeneration: 4, aborted: true })).toBe(false)

    const context = source('components/app-context.tsx')
    const localCommit = context.slice(
      context.indexOf('const setCurrentUser = useCallback'),
      context.indexOf('useEffect(() => {\n    sessionSourceIdRef.current'),
    )
    expect(localCommit).toContain('refreshRequestRef.current.controller?.abort()')
    expect(localCommit).toContain('refreshRequestRef.current.generation += 1')
    expect(localCommit.indexOf('generation += 1')).toBeLessThan(
      localCommit.indexOf('setStoredCurrentUser(user)'),
    )
  })

  it('listens for focus, visibility, BroadcastChannel, and storage fallback changes', () => {
    const context = source('components/app-context.tsx')
    for (const fragment of [
      'new BroadcastChannel(SESSION_CHANGE_CHANNEL)',
      "window.addEventListener('storage', handleStorage)",
      "window.addEventListener('focus', reconcileOnAttention)",
      "document.addEventListener('visibilitychange', handleVisibilityChange)",
      'window.localStorage.setItem(SESSION_CHANGE_STORAGE_KEY',
      'if (refreshRequestRef.current.controller) return',
      'reconcileLatestSession()',
    ]) {
      expect(context).toContain(fragment)
    }

    const listenerEffect = context.slice(
      context.indexOf('sessionSourceIdRef.current =\n      typeof window.crypto'),
      context.indexOf('  }, [refreshUser])'),
    )
    expect(
      listenerEffect.indexOf("window.addEventListener('focus', reconcileOnAttention)"),
    ).toBeLessThan(listenerEffect.lastIndexOf('reconcileLatestSession()'))
  })

  it('locks identity-bearing UI until a successful server response and exposes recovery controls', () => {
    const context = source('components/app-context.tsx')
    const shell = source('components/AppShell.tsx')
    const header = source('components/SiteHeader.tsx')

    expect(context).toContain('const [isLoadingUser, setIsLoadingUser] = useState(true)')
    expect(context).toContain(
      'const [isSessionReconciled, setIsSessionReconciled] = useState(false)',
    )
    expect(context).toContain('setIsSessionReconciled(false)')
    expect(context).toContain('setStoredCurrentUser(data.user)')
    expect(context).toContain('setIsSessionReconciled(true)')
    expect(context).toContain('sessionActionLocked: !isSessionReconciled')
    expect(shell).toContain('inert={lockWholeShell ? true : undefined}')
    expect(shell).toContain("pathname.startsWith('/d/')")
    expect(shell).toContain(
      "const publicReadingStaysAvailable = isDossierView || pathname.startsWith('/datasets')",
    )
    expect(shell).toContain('!isDossierView && <FeedbackButton />')
    const dossierGuard = source('components/dossier/DossierAccountActionsGuard.tsx')
    expect(dossierGuard).toContain('inert={sessionActionLocked ? true : undefined}')
    expect(dossierGuard).toContain('Reading stays available')
    expect(shell).toContain('Retry account check')
    expect(shell).toContain('Reload this page')
    expect(header).toContain('sessionActionLocked ? (')
    expect(header).toContain('Checking account…')
  })

  it('broadcasts only after local login/logout code commits the returned account state', () => {
    const context = source('components/app-context.tsx')
    const auth = source('components/AuthModal.tsx')
    const account = source('components/AccountModal.tsx')

    expect(context).toContain('broadcastSessionChange()')
    expect(auth).toContain('setCurrentUser(user)')
    expect(account).toContain('setCurrentUser(null)')
    expect(context).not.toContain('postMessage(user)')
  })
})
