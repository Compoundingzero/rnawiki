'use client'

/** Account identity, contribution record, public profile, and resilient sign out. */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'

import { api } from '@/lib/api-client'
import { TIER_DESCRIPTION, TIER_LABEL } from '@/lib/trust'
import { isSessionMutationInteractionLocked, useApp } from './app-context'
import { ModalShell } from './ModalShell'

function formatDate(iso: string | undefined): string | null {
  if (!iso) return null
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function countOrDash(value: number | undefined): string {
  return typeof value === 'number' ? String(value) : '—'
}

export function canCloseAccountModal(args: {
  openModal: string | null
  isSigningOut: boolean
}): boolean {
  return args.openModal === 'account' && !args.isSigningOut
}

export function AccountModal() {
  const { currentUser, openModal, refreshUser, setCurrentUser, setOpenModal } = useApp()
  const isOpen = openModal === 'account'
  const headingId = useId()
  const router = useRouter()
  const userId = currentUser?.id ?? null
  const userIdRef = useRef(userId)
  userIdRef.current = userId
  const openModalRef = useRef(openModal)
  openModalRef.current = openModal
  const scopeGenerationRef = useRef(0)
  const signOutControllerRef = useRef<AbortController | null>(null)

  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [sessionReconciliationRequired, setSessionReconciliationRequired] = useState(false)

  useEffect(() => {
    scopeGenerationRef.current += 1
    signOutControllerRef.current?.abort()
    signOutControllerRef.current = null
    setIsSigningOut(false)
    setSignOutError(null)
    setSessionReconciliationRequired(false)
  }, [isOpen, userId])

  const interactionLocked = isSessionMutationInteractionLocked(
    isSigningOut,
    sessionReconciliationRequired,
  )

  const handleClose = () => {
    if (
      !canCloseAccountModal({
        openModal: openModalRef.current,
        isSigningOut: interactionLocked || signOutControllerRef.current !== null,
      })
    ) {
      return
    }
    scopeGenerationRef.current += 1
    setSignOutError(null)
    setOpenModal(null)
  }

  const handleSignOut = async () => {
    if (
      isSigningOut ||
      !userId ||
      userIdRef.current !== userId ||
      openModalRef.current !== 'account'
    ) {
      return
    }

    signOutControllerRef.current?.abort()
    const controller = new AbortController()
    signOutControllerRef.current = controller
    const scopeGeneration = scopeGenerationRef.current
    setIsSigningOut(true)
    setSessionReconciliationRequired(false)
    setSignOutError(null)

    try {
      await api.logout(controller.signal)
      if (
        controller.signal.aborted ||
        scopeGenerationRef.current !== scopeGeneration ||
        userIdRef.current !== userId ||
        openModalRef.current !== 'account'
      ) {
        return
      }

      setCurrentUser(null)
      setOpenModal(null)
      router.refresh()
    } catch {
      // The response can be lost after the server clears the cookie. Confirm the session before
      // offering another sign-out request so the browser never displays the wrong account.
      if (
        !controller.signal.aborted &&
        scopeGenerationRef.current === scopeGeneration &&
        userIdRef.current === userId &&
        openModalRef.current === 'account'
      ) {
        const reconciledUser = await refreshUser()
        router.refresh()
        if (reconciledUser === null) {
          setSessionReconciliationRequired(false)
          setCurrentUser(null)
          if (openModalRef.current === 'account') setOpenModal(null)
          return
        }
        if (reconciledUser && reconciledUser.id !== userId) {
          setSessionReconciliationRequired(false)
          if (openModalRef.current === 'account') setOpenModal(null)
          return
        }
        if (
          !controller.signal.aborted &&
          openModalRef.current === 'account' &&
          userIdRef.current === userId
        ) {
          setSessionReconciliationRequired(reconciledUser === undefined)
          setSignOutError(
            reconciledUser
              ? 'The server confirms that you are still signed in. Check your connection and try again.'
              : 'RNAWiki could not confirm whether sign out completed. Check your connection before retrying.',
          )
        }
      }
    } finally {
      if (
        !controller.signal.aborted &&
        scopeGenerationRef.current === scopeGeneration &&
        userIdRef.current === userId &&
        openModalRef.current === 'account'
      ) {
        signOutControllerRef.current = null
        setIsSigningOut(false)
      }
    }
  }

  const retrySessionReconciliation = async () => {
    if (!sessionReconciliationRequired || isSigningOut || openModalRef.current !== 'account') return
    setIsSigningOut(true)
    setSignOutError(null)
    try {
      const reconciledUser = await refreshUser()
      router.refresh()
      if (reconciledUser === undefined) {
        setSignOutError(
          'RNAWiki still cannot confirm the account session. Check your connection, then retry or reload this page.',
        )
        return
      }
      setSessionReconciliationRequired(false)
      if (reconciledUser === null) {
        setCurrentUser(null)
        if (openModalRef.current === 'account') setOpenModal(null)
      } else if (reconciledUser.id !== userId) {
        if (openModalRef.current === 'account') setOpenModal(null)
      } else {
        setSignOutError('The server confirms that you are still signed in. You can try again.')
      }
    } finally {
      if (openModalRef.current === 'account') setIsSigningOut(false)
    }
  }

  const joinedOn = formatDate(currentUser?.joinedDate)
  const tier = currentUser?.trustTier ?? null

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      labelledBy={headingId}
      maxWidth="max-w-md"
      scrim="soft"
      closeButton="inset"
      closeDisabled={interactionLocked}
    >
      <div
        className="space-y-5 p-6 sm:p-7"
        aria-busy={isSigningOut}
        inert={isSigningOut ? true : undefined}
      >
        {sessionReconciliationRequired ? (
          <div className="space-y-4" role="alert">
            <div className="space-y-2">
              <h2 id={headingId} className="text-lg font-bold text-[#1D1D1F]">
                Sign-out status needs to be confirmed
              </h2>
              <p className="text-xs leading-5 text-[#424245]">
                The server may have ended the session, but this browser could not confirm it.
                Account actions stay locked until the check succeeds.
              </p>
              {signOutError && (
                <p className="text-[11px] font-semibold text-rose-700">{signOutError}</p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void retrySessionReconciliation()}
                disabled={isSigningOut}
                className="min-h-11 flex-1 rounded-full bg-[#0071E3] px-4 text-xs font-semibold text-white disabled:opacity-50"
              >
                {isSigningOut ? 'Checking account…' : 'Retry account check'}
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                disabled={isSigningOut}
                className="min-h-11 flex-1 rounded-full bg-[#1D1D1F] px-4 text-xs font-semibold text-white disabled:opacity-50"
              >
                Reload this page
              </button>
            </div>
          </div>
        ) : currentUser ? (
          <div className="space-y-5">
            <div>
              <span className="mb-1.5 inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                RNAWiki account
              </span>
              <h2 id={headingId} className="text-xl font-bold tracking-tight text-[#1D1D1F]">
                {currentUser.name}
              </h2>
              <p className="text-xs text-[#6E6E73]">
                {[
                  currentUser.handle ? `@${currentUser.handle}` : null,
                  joinedOn ? `Joined ${joinedOn}` : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
              {currentUser.orcid && (
                <p className="mt-0.5 text-[11px] text-[#6E6E73]">ORCID {currentUser.orcid}</p>
              )}
            </div>

            <div className="rounded-2xl border border-[#0071E3]/15 bg-[#0071E3]/[0.06] p-3.5">
              <p className="text-xs font-bold text-[#0066CC]">One account for every contributor</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#424245]">
                You can post community notes and propose edits. Each submission is stored with your
                account, and accepted edits remain attributed to you in the public history.
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="block text-xs font-semibold text-[#1D1D1F]">
                Your contribution record
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl bg-[#F5F5F7] p-3 text-center">
                  <span className="block text-lg font-bold text-[#0071E3]">
                    {countOrDash(currentUser.acceptedEditCount)}
                  </span>
                  <span className="text-[11px] text-[#6E6E73]">Accepted contributions</span>
                </div>
                <div className="rounded-2xl bg-[#F5F5F7] p-3 text-center">
                  <span className="block text-lg font-bold text-emerald-700">
                    {countOrDash(currentUser.noteCount)}
                  </span>
                  <span className="text-[11px] text-[#6E6E73]">Notes posted</span>
                </div>
              </div>

              {tier && (
                <div className="space-y-1 rounded-2xl bg-[#F5F5F7] p-3.5">
                  <span className="block text-xs font-bold text-[#1D1D1F]">{TIER_LABEL[tier]}</span>
                  <p className="text-[11px] leading-relaxed text-[#6E6E73]">
                    {TIER_DESCRIPTION[tier]}
                  </p>
                </div>
              )}
            </div>

            {currentUser.handle && (
              <Link
                href={`/u/${encodeURIComponent(currentUser.handle)}`}
                onClick={handleClose}
                className="flex items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-white p-3.5 text-xs font-semibold text-[#1D1D1F] transition hover:bg-[#F5F5F7]"
              >
                View your public contribution profile
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#6E6E73]" aria-hidden="true" />
              </Link>
            )}

            {signOutError && (
              <p role="alert" className="text-[11px] font-semibold text-rose-700">
                {signOutError}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-black/[0.06] pt-4">
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
                className="cursor-pointer text-xs text-rose-700 hover:underline disabled:opacity-50"
              >
                {isSigningOut ? 'Signing out…' : 'Sign out'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSigningOut}
                className="cursor-pointer rounded-full bg-[#1D1D1F] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-black active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#0071E3]">
                Your RNAWiki account
              </span>
              <h2 id={headingId} className="text-xl font-bold tracking-tight text-[#1D1D1F]">
                Contribute to RNAWiki
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6E6E73]">
                Sign in to post notes and propose edits. Medical-information changes are reviewed
                before they can appear publicly, and every submission is attributed to its author.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpenModal('auth')}
              className="w-full cursor-pointer rounded-full bg-[#0071E3] py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0077ED] active:scale-95"
            >
              Sign in or create an account
            </button>
          </div>
        )}
      </div>
    </ModalShell>
  )
}

export default AccountModal
