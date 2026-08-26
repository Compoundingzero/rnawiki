'use client'

import { RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'

import { useApp } from '@/components/app-context'

/**
 * Keep public medical content readable while account identity is reconciled. Only controls that
 * can create an attributed edit, note, or vote are locked; the server remains the author source.
 */
export function DossierAccountActionsGuard({ children }: { children: ReactNode }) {
  const { isLoadingUser, refreshUser, sessionActionLocked } = useApp()

  return (
    <div className="space-y-3" data-testid="dossier-account-actions-guard">
      {sessionActionLocked && (
        <aside
          role="status"
          aria-live={isLoadingUser ? 'polite' : 'assertive'}
          className="rounded-2xl border border-[#0A66D8]/15 bg-white px-4 py-3"
        >
          <div className="flex min-w-0 items-start gap-3">
            <RefreshCw
              className={`mt-0.5 h-4 w-4 shrink-0 text-[#0A66D8] ${isLoadingUser ? 'animate-spin motion-reduce:animate-none' : ''}`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1D1D1F]">
                {isLoadingUser ? 'Confirming your signed-in account…' : 'Account check incomplete'}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#6E6E73]">
                Reading stays available. Editing and community controls will return after RNAWiki
                confirms which account is active.
              </p>
              {!isLoadingUser && (
                <button
                  type="button"
                  onClick={() => void refreshUser()}
                  className="mt-2 min-h-11 rounded-full bg-[#0A66D8] px-4 text-sm font-semibold text-white hover:bg-[#075BBF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8] focus-visible:ring-offset-2"
                >
                  Retry account check
                </button>
              )}
            </div>
          </div>
        </aside>
      )}

      <div
        aria-busy={sessionActionLocked}
        inert={sessionActionLocked ? true : undefined}
        className={sessionActionLocked ? 'opacity-60' : undefined}
      >
        {children}
      </div>
    </div>
  )
}
