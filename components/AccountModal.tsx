'use client'

/** Account details, contribution totals, physician-verification status, and saved medicines. All
 * values come from authenticated server endpoints; the modal does not invent profile data. */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, Clock, ShieldAlert, Stethoscope } from 'lucide-react'
import { api, searchHitHref, type SearchHit } from '@/lib/api-client'
import { TIER_DESCRIPTION, TIER_LABEL } from '@/lib/trust'
import { isSessionMutationInteractionLocked, isVerifiedPhysician, useApp } from './app-context'
import { ModalShell } from './ModalShell'

function formatDate(iso: string | undefined): string | null {
  if (!iso) return null
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * A counter the server sent, or an em dash.
 *
 * Not `?? 0`: a missing count and a count of zero are different claims, and "0 accepted edits" is a
 * statement about someone's record that this component would have no basis for.
 */
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
  const { currentUser, openModal, refreshUser, setOpenModal, setCurrentUser } = useApp()
  const isOpen = openModal === 'account'
  const headingId = useId()
  const router = useRouter()

  const [savedDrugs, setSavedDrugs] = useState<SearchHit[]>([])
  const [isLoadingSaved, setIsLoadingSaved] = useState<boolean>(false)
  const [savedError, setSavedError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [sessionReconciliationRequired, setSessionReconciliationRequired] = useState(false)

  // Only the id is read inside the effect, so a `setCurrentUser` that returns an equal-but-new
  // object cannot re-trigger the fetch.
  const userId = currentUser?.id ?? null
  const userIdRef = useRef(userId)
  userIdRef.current = userId
  const openModalRef = useRef(openModal)
  openModalRef.current = openModal
  const scopeGenerationRef = useRef(0)
  const savedControllerRef = useRef<AbortController | null>(null)
  const signOutControllerRef = useRef<AbortController | null>(null)
  const [savedOwnerUserId, setSavedOwnerUserId] = useState<string | null>(userId)

  useEffect(() => {
    scopeGenerationRef.current += 1
    const scopeGeneration = scopeGenerationRef.current
    savedControllerRef.current?.abort()
    signOutControllerRef.current?.abort()
    savedControllerRef.current = null
    signOutControllerRef.current = null
    setSavedDrugs([])
    setSavedOwnerUserId(null)
    setIsLoadingSaved(Boolean(isOpen && userId))
    setSavedError(null)
    setIsSigningOut(false)
    setSignOutError(null)
    setSessionReconciliationRequired(false)
    if (!isOpen || !userId) return

    const controller = new AbortController()
    savedControllerRef.current = controller
    setIsLoadingSaved(true)

    api
      .savedDrugs(controller.signal)
      .then(({ drugs }) => {
        if (
          !controller.signal.aborted &&
          scopeGenerationRef.current === scopeGeneration &&
          userIdRef.current === userId &&
          openModalRef.current === 'account'
        ) {
          setSavedDrugs(drugs)
          setSavedOwnerUserId(userId)
        }
      })
      .catch(() => {
        if (
          !controller.signal.aborted &&
          scopeGenerationRef.current === scopeGeneration &&
          userIdRef.current === userId &&
          openModalRef.current === 'account'
        ) {
          setSavedOwnerUserId(userId)
          setSavedError('Your saved medicines could not be loaded just now.')
        }
      })
      .finally(() => {
        if (
          !controller.signal.aborted &&
          scopeGenerationRef.current === scopeGeneration &&
          userIdRef.current === userId &&
          openModalRef.current === 'account'
        ) {
          savedControllerRef.current = null
          setIsLoadingSaved(false)
        }
      })

    return () => controller.abort()
  }, [isOpen, userId])

  const savedScopeIsCurrent = savedOwnerUserId === userId
  const visibleSavedDrugs = savedScopeIsCurrent ? savedDrugs : []
  const visibleSavedError = savedScopeIsCurrent ? savedError : null
  const visibleIsLoadingSaved = !savedScopeIsCurrent || isLoadingSaved
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
    savedControllerRef.current?.abort()
    setSignOutError(null)
    setOpenModal(null)
  }

  const handleSignOut = async () => {
    if (
      isSigningOut ||
      !userId ||
      userIdRef.current !== userId ||
      openModalRef.current !== 'account'
    )
      return
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
      setSavedDrugs([])
      setSavedOwnerUserId(null)
      setOpenModal(null)
      router.refresh()
    } catch {
      // A logout response can be lost after Set-Cookie cleared the session. Keep the dialog locked
      // while `/me` determines whether this account is still authoritative.
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
          setSavedDrugs([])
          setSavedOwnerUserId(null)
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
        setSavedDrugs([])
        setSavedOwnerUserId(null)
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
  const verifiedOn = formatDate(currentUser?.verifiedAt)
  const tier = currentUser?.trustTier ?? null

  const verificationRow = (() => {
    if (!currentUser) return null

    if (isVerifiedPhysician(currentUser)) {
      return (
        <div className="bg-[#0071E3]/[0.06] border border-[#0071E3]/15 p-3.5 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0071E3] shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold text-[#0071E3]">Verified Physician ✓</span>
          </div>
          <p className="text-[11px] text-[#6E6E73] leading-relaxed">
            {[
              verifiedOn ? `Verified ${verifiedOn}` : null,
              currentUser.medicalSpecialty,
              currentUser.institution,
            ]
              .filter(Boolean)
              .join(' • ')}
          </p>
        </div>
      )
    }

    if (currentUser.verificationState === 'pending') {
      return (
        <div className="bg-amber-500/5 border border-amber-500/15 p-3.5 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold text-amber-800">Credentials under review</span>
          </div>
          <p className="text-[11px] text-[#6E6E73] leading-relaxed">
            A reviewer checks every submission. Your notes post under your account name until then,
            without a verified physician badge.
          </p>
        </div>
      )
    }

    if (currentUser.verificationState === 'rejected') {
      return (
        <div className="bg-rose-500/5 border border-rose-500/15 p-3.5 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-700 shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold text-rose-800">Credentials not accepted</span>
          </div>
          <button
            type="button"
            onClick={() => setOpenModal('auth')}
            className="text-xs font-bold text-[#0071E3] hover:underline cursor-pointer"
          >
            Submit them again
          </button>
        </div>
      )
    }

    return (
      <div className="bg-[#F5F5F7] p-3.5 rounded-2xl border border-black/[0.04] space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-[#6E6E73] shrink-0" aria-hidden="true" />
          <span className="text-xs font-bold text-[#1D1D1F]">No physician credentials on file</span>
        </div>
        <button
          type="button"
          onClick={() => setOpenModal('auth')}
          className="text-xs font-bold text-[#0071E3] hover:underline cursor-pointer"
        >
          Verify your credentials
        </button>
      </div>
    )
  })()

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
        className="p-6 sm:p-7 space-y-5"
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
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                RNAWiki account
              </span>
              <h2 id={headingId} className="text-xl font-bold text-[#1D1D1F] tracking-tight">
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
                <p className="text-[11px] text-[#6E6E73] mt-0.5">ORCID {currentUser.orcid}</p>
              )}
            </div>

            {verificationRow}

            {/* Quick Metrics — the server's counters, not a length the browser can change. */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-[#1D1D1F] block">
                Your contribution record
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#F5F5F7] p-3 rounded-2xl text-center">
                  <span className="text-lg font-bold text-[#0071E3] block">
                    {countOrDash(currentUser.acceptedEditCount)}
                  </span>
                  <span className="text-[11px] text-[#6E6E73]">Accepted contributions</span>
                </div>
                <div className="bg-[#F5F5F7] p-3 rounded-2xl text-center">
                  <span className="text-lg font-bold text-emerald-700 block">
                    {countOrDash(currentUser.noteCount)}
                  </span>
                  <span className="text-[11px] text-[#6E6E73]">Notes posted</span>
                </div>
              </div>

              {/* The shared description explains editorial standing without implying scientific
                  qualification or automatic publication. */}
              {tier && (
                <div className="bg-[#F5F5F7] p-3.5 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-[#1D1D1F] block">{TIER_LABEL[tier]}</span>
                  <p className="text-[11px] text-[#6E6E73] leading-relaxed">
                    {TIER_DESCRIPTION[tier]}
                  </p>
                </div>
              )}
            </div>

            {/* Saved Watchlist */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#1D1D1F] block">Saved medicines</span>
              {visibleIsLoadingSaved ? (
                <p className="text-xs text-[#6E6E73] py-2">Loading your saved medicines…</p>
              ) : visibleSavedError ? (
                <p role="alert" className="text-xs font-semibold text-rose-700 py-2">
                  {visibleSavedError}
                </p>
              ) : visibleSavedDrugs.length === 0 ? (
                <p className="text-xs text-[#6E6E73] italic py-2">
                  No medicines saved yet. Choose &quot;Save&quot; on any medicine page.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {visibleSavedDrugs.map((drug) => (
                    <Link
                      key={drug.slug}
                      href={searchHitHref(drug)}
                      onClick={handleClose}
                      className="p-2.5 rounded-xl bg-[#F5F5F7] hover:bg-black/[0.04] flex items-center justify-between gap-2 cursor-pointer transition"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-[#1D1D1F]">
                          {drug.name}
                          {drug.tradeName ? ` (${drug.tradeName})` : ''}
                        </span>
                        {drug.summaryContext && (
                          <span className="mt-0.5 block truncate text-[9px] font-semibold uppercase tracking-wide text-[#6E6E73]">
                            {drug.summaryContext}
                          </span>
                        )}
                        <span className="mt-0.5 block truncate text-[11px] text-[#6E6E73]">
                          {drug.patientFriendlyIndication}
                        </span>
                      </div>
                      <ArrowRight
                        className="w-3.5 h-3.5 text-[#6E6E73] shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {signOutError && (
              <p role="alert" className="text-[11px] font-semibold text-rose-700">
                {signOutError}
              </p>
            )}

            <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between">
              {/* The reference's "Reset" renamed the account to "Guest" locally. Signing out is the
                  real version of that control: it ends the session on the server first. */}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="text-xs text-rose-700 hover:underline disabled:opacity-50 cursor-pointer"
              >
                {isSigningOut ? 'Signing out…' : 'Sign out'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSigningOut}
                className="px-4 py-1.5 rounded-full bg-[#1D1D1F] text-white text-xs font-semibold hover:bg-black cursor-pointer shadow-xs active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0071E3] block mb-1">
                Your RNAWiki account
              </span>
              <h2 id={headingId} className="text-xl font-bold text-[#1D1D1F] tracking-tight">
                Save medicines and contribute
              </h2>
              <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
                Sign in to save medicines, post notes, and suggest corrections. Changes to medical
                information are reviewed before they can appear publicly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpenModal('auth')}
              className="w-full py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
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
