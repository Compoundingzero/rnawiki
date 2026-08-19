'use client'

/**
 * The account panel — the port of the master reference wireframe's
 * `src/components/AccountModal.tsx`, the one component App.tsx defined and never mounted.
 *
 * The reference's card style is kept exactly: the emerald member pill, the name as the heading, the
 * two-tile metric grid, the "Your Saved Therapeutics" list with its chevron rows, the footer with a
 * destructive text button on the left and a dark pill on the right.
 *
 * What it shows is different, because what the server knows is different:
 *
 * 1. The join form is gone. It wrote `savedDrugIds: ['inclisiran', 'opencas13']`,
 *    `notesContributed: 1` and `joinedDate: 'August 2026'` into a new account — three invented
 *    facts about a person who had just typed their name. Signing up now happens in AuthModal
 *    against a real endpoint, so the signed-out state here is a door to it, not a second form.
 * 2. The reference's "Role / Perspective" select is gone with it. There is no column behind it, so
 *    every value it could hold would be a label the site made up about its reader.
 * 3. The metrics are the server's counters — accepted edits and posted notes — instead of a saved
 *    count the browser could edit. The saved list is fetched from `/api/me/saved`, and its rows are
 *    real links to `/d/{slug}` rather than the reference's `onClick` divs, so they can be opened in
 *    a new tab and reached from a keyboard.
 * 4. The physician line reports the actual verification state, including "under review" and "not
 *    accepted". The badge is drawn for a verified account and for nothing else.
 */

import Link from 'next/link'
import { useEffect, useId, useState } from 'react'
import { ArrowRight, CheckCircle2, Clock, ShieldAlert, Stethoscope } from 'lucide-react'
import { api, type SearchHit } from '@/lib/api-client'
import { TIER_DESCRIPTION, TIER_LABEL } from '@/lib/trust'
import { isVerifiedPhysician, useApp } from './app-context'
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

export function AccountModal() {
  const { currentUser, openModal, setOpenModal, setCurrentUser } = useApp()
  const isOpen = openModal === 'account'
  const headingId = useId()

  const [savedDrugs, setSavedDrugs] = useState<SearchHit[]>([])
  const [isLoadingSaved, setIsLoadingSaved] = useState<boolean>(false)
  const [savedError, setSavedError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)

  // Only the id is read inside the effect, so a `setCurrentUser` that returns an equal-but-new
  // object cannot re-trigger the fetch.
  const userId = currentUser?.id ?? null

  useEffect(() => {
    if (!isOpen || !userId) return

    let cancelled = false
    setIsLoadingSaved(true)
    setSavedError(null)

    api
      .savedDrugs()
      .then(({ drugs }) => {
        if (!cancelled) setSavedDrugs(drugs)
      })
      .catch(() => {
        if (!cancelled) setSavedError('Your saved medicines could not be loaded just now.')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSaved(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, userId])

  const handleClose = () => {
    setSignOutError(null)
    setOpenModal(null)
  }

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    setSignOutError(null)
    try {
      await api.logout()
      setCurrentUser(null)
      setSavedDrugs([])
      handleClose()
    } catch {
      // The session cookie is cleared by the server, so a failed call means the reader is still
      // signed in. Clearing `currentUser` anyway would show a signed-out header over a live
      // session — the interface lying about the state of the account.
      setSignOutError('Sign out did not go through. Check your connection and try again.')
    } finally {
      setIsSigningOut(false)
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
            A steward reads every submission by hand. Your notes post under your name until then.
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
          <Stethoscope className="w-3.5 h-3.5 text-[#86868B] shrink-0" aria-hidden="true" />
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
    <ModalShell isOpen={isOpen} onClose={handleClose} labelledBy={headingId} maxWidth="max-w-md">
      <div className="p-6 sm:p-7 space-y-5">
        {currentUser ? (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                Open Bio Member
              </span>
              <h2 id={headingId} className="text-xl font-bold text-[#1D1D1F] tracking-tight">
                {currentUser.name}
              </h2>
              <p className="text-xs text-[#86868B]">
                {[currentUser.handle ? `@${currentUser.handle}` : null, joinedOn ? `Joined ${joinedOn}` : null]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
              {currentUser.orcid && (
                <p className="text-[11px] text-[#86868B] mt-0.5">ORCID {currentUser.orcid}</p>
              )}
            </div>

            {verificationRow}

            {/* Quick Metrics — the server's counters, not a length the browser can change. */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-[#1D1D1F] block">
                Your Contribution Record
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#F5F5F7] p-3 rounded-2xl text-center">
                  <span className="text-lg font-bold text-[#0071E3] block">
                    {countOrDash(currentUser.acceptedEditCount)}
                  </span>
                  <span className="text-[11px] text-[#86868B]">Accepted Edits</span>
                </div>
                <div className="bg-[#F5F5F7] p-3 rounded-2xl text-center">
                  <span className="text-lg font-bold text-emerald-700 block">
                    {countOrDash(currentUser.noteCount)}
                  </span>
                  <span className="text-[11px] text-[#86868B]">Notes Posted</span>
                </div>
              </div>

              {/* The tier's label and its meaning both come from lib/trust.ts, which builds the
                  description from the thresholds themselves — so what a reader is told here cannot
                  drift away from what the contribution gate actually does. */}
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
              <span className="text-xs font-semibold text-[#1D1D1F] block">
                Your Saved Therapeutics
              </span>
              {isLoadingSaved ? (
                <p className="text-xs text-[#86868B] py-2">Loading your saved medicines…</p>
              ) : savedError ? (
                <p role="alert" className="text-xs font-semibold text-rose-700 py-2">
                  {savedError}
                </p>
              ) : savedDrugs.length === 0 ? (
                <p className="text-xs text-[#86868B] italic py-2">
                  No medicines saved yet. Tap &quot;Save&quot; on any drug dossier.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {savedDrugs.map((drug) => (
                    <Link
                      key={drug.slug}
                      href={`/d/${drug.slug}`}
                      onClick={handleClose}
                      className="p-2.5 rounded-xl bg-[#F5F5F7] hover:bg-black/[0.04] flex items-center justify-between gap-2 cursor-pointer transition"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-[#1D1D1F]">
                          {drug.name}
                          {drug.tradeName ? ` (${drug.tradeName})` : ''}
                        </span>
                        <span className="text-[11px] text-[#86868B] block truncate">
                          {drug.patientFriendlyIndication}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#86868B] shrink-0" aria-hidden="true" />
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
                Open Science Community
              </span>
              <h2 id={headingId} className="text-xl font-bold text-[#1D1D1F] tracking-tight">
                Join the RNA Open Science Network
              </h2>
              <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
                Connect with patients and researchers working toward transparent drug pricing and
                open-access molecular medicine.
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
