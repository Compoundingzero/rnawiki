'use client'

/**
 * Sign in, create an account, and file physician credentials — the port of the master reference
 * wireframe's `src/components/DoctorVerificationModal.tsx`, exported as `AuthModal` because on a
 * real server this one dialog is the whole door.
 *
 * The switcher, the field order, the labels, the placeholders, the classes and the success
 * screen's typography are the reference's. Four things could not be carried over:
 *
 * 1. localStorage became the server. The reference minted a `CommentUser` object with
 *    `id: \`usr-${Date.now()}\`` and handed it to `onSaveUser`. Here the Community side is a real
 *    account — name, email, password, optional ORCID iD, and a sign in / create account toggle —
 *    and it calls `api.register` / `api.login`. Server errors are surfaced inline rather than
 *    swallowed: 422 field issues under their fields, 409 and 401 above the button.
 * 2. THE BADGE IS EARNED. The reference set `isDoctor: true` after a 900 ms `setTimeout` and drew
 *    the blue check. That was the wireframe's one dishonest behaviour. This submits the credential
 *    and lands on a PENDING screen — the reference's layout, with an amber Clock where the emerald
 *    CheckCircle2 was, and a preview card that shows the reader's comment WITHOUT a badge, because
 *    showing one would promise something no steward has done yet.
 * 3. Credentials attach to an account, so with nobody signed in the Doctor tab shows the account
 *    form first and says why.
 * 4. The specialty list gets "Other" plus a free-text input. Seven specialties do not cover
 *    medicine, and a required select whose options exclude the reader forces a false answer.
 *
 * Accessibility the wireframe lacked, with no visual change: the dialog's role, labelling, focus
 * trap and Escape key come from ModalShell; the switcher announces its state with `aria-pressed`;
 * invalid fields carry `aria-invalid` and point at their message with `aria-describedby`; the
 * error line is a live region.
 */

import { useId, useState, type FormEvent } from 'react'
import { CheckCircle2, Clock, ShieldCheck, Stethoscope, User } from 'lucide-react'
import { api, ApiError } from '@/lib/api-client'
import type { CommentUser } from '@/lib/types'
import { isVerifiedPhysician, useApp } from './app-context'
import { ModalShell } from './ModalShell'

/** The reference's seven, in its order, plus the escape hatch it lacked. */
const SPECIALTIES = [
  'Cardiologist',
  'Neurologist',
  'Hematologist',
  'Pediatrician',
  'Infectious Disease',
  'Endocrinologist',
  'Clinical Pharmacist',
]

const OTHER_SPECIALTY = 'Other'

const LABEL_CLASS = 'text-xs font-semibold text-[#1D1D1F] block mb-1'

const INPUT_CLASS =
  'w-full bg-[#F5F5F7] text-xs text-[#1D1D1F] px-3 py-2 rounded-xl border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none'

const SELECT_CLASS =
  'w-full bg-[#F5F5F7] text-xs text-[#1D1D1F] px-2.5 py-2 rounded-xl border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none cursor-pointer'

const DARK_BUTTON_CLASS =
  'w-full py-2.5 rounded-full bg-[#1D1D1F] hover:bg-black disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm'

const BLUE_BUTTON_CLASS =
  'w-full py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-sm'

/**
 * The first zod issue per field, keyed by the field name.
 *
 * `details` is whatever the route put in the error body (`issueDetails` in lib/api-response.ts
 * sends `{ path, code, message }`), so it is narrowed rather than cast: a shape change upstream
 * must degrade to "no field errors", never to a crash inside a form.
 */
function fieldErrorsFrom(details: unknown): Record<string, string> {
  if (!Array.isArray(details)) return {}
  const errors: Record<string, string> = {}
  for (const issue of details) {
    if (typeof issue !== 'object' || issue === null) continue
    const { path, message } = issue as { path?: unknown; message?: unknown }
    const field = Array.isArray(path) ? path[0] : undefined
    if (typeof field !== 'string' || typeof message !== 'string') continue
    if (!(field in errors)) errors[field] = message
  }
  return errors
}

/**
 * The steward's note on a rejected verification, when the API sends one.
 *
 * It does not today: `toPublicUser` in lib/api-response.ts builds the client's view of an account
 * by naming its fields, and `verification_note` is deliberately not among them. So this reads
 * defensively instead of declaring the field — the note appears the day the API starts sending it,
 * and until then the rejected screen says what it can stand behind and nothing more. The same
 * reasoning is why the pending screen carries no submission date: `users` has no submitted-at
 * column at all, so there is no value to read, and deriving one from `joinedDate` or `verifiedAt`
 * would be inventing a fact about a real person's application.
 */
function stewardNote(user: CommentUser): string | null {
  const note = (user as { verificationNote?: unknown }).verificationNote
  return typeof note === 'string' && note.trim().length > 0 ? note.trim() : null
}

function formatDate(iso: string | undefined): string | null {
  if (!iso) return null
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

/** One inline field message, and the props that tie it to its input. */
function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null
  return (
    <p id={id} className="text-[11px] font-semibold text-rose-700 mt-1">
      {message}
    </p>
  )
}

/**
 * The reference's post-submission screen, with the one substitution that makes it true: an amber
 * Clock for "a person has not looked at this yet" where the reference drew an emerald check.
 *
 * The preview card is kept — a reader deciding whether to hand over a licence number deserves to
 * see what it buys — and it deliberately renders the comment WITHOUT the verified pill.
 */
function PendingPanel({
  heading,
  headingId,
  displayName,
  specialty,
  institution,
}: {
  heading: string
  headingId?: string
  displayName: string
  specialty: string | undefined
  institution: string | undefined
}) {
  const credentialLine = [specialty, institution].filter(Boolean).join(' • ')

  return (
    <div className="py-3 text-center space-y-3.5 animate-zoom-in">
      <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
        <Clock className="w-6 h-6" aria-hidden="true" />
      </div>

      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-500/20 inline-block mb-1">
          Awaiting Steward Review
        </span>
        <h2 id={headingId} className="text-xl font-bold text-[#1D1D1F] tracking-tight">
          {heading}
        </h2>
        {credentialLine && (
          <p className="text-xs text-[#0071E3] font-medium mt-0.5">{credentialLine}</p>
        )}
      </div>

      <p className="text-xs text-[#6E6E73] leading-relaxed text-left">
        A steward reviews credentials by hand. Your notes post under your name until then — the
        verified badge appears only after review.
      </p>

      <div className="bg-[#F5F5F7] p-3.5 rounded-2xl border border-black/[0.04] text-left space-y-1.5">
        <span className="text-[10px] text-[#86868B] uppercase font-bold tracking-wider block">
          How your comments appear:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* The account name, not a `Dr.`-prefixed version of it. The reference rewrote the name
              it printed; the server renders notes under the name on the account, and a preview
              that shows a different one is a preview of something that will not happen. */}
          <span className="text-xs font-bold text-[#1D1D1F]">{displayName}</span>
        </div>
        <p className="text-xs text-[#6E6E73] italic">
          &quot;{specialty ?? 'Clinical'} perspective on therapeutic endpoints...&quot;
        </p>
      </div>
    </div>
  )
}

export function AuthModal() {
  const { currentUser, openModal, setOpenModal, setCurrentUser } = useApp()
  const isOpen = openModal === 'auth'
  const baseId = useId()
  const headingId = `${baseId}-heading`

  const [isDoctorFlow, setIsDoctorFlow] = useState<boolean>(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')

  // Account fields.
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [orcid, setOrcid] = useState<string>('')

  // Credential fields.
  const [fullName, setFullName] = useState<string>('')
  const [licenseOrNpi, setLicenseOrNpi] = useState<string>('')
  const [specialty, setSpecialty] = useState<string>(SPECIALTIES[0] ?? OTHER_SPECIALTY)
  const [otherSpecialty, setOtherSpecialty] = useState<string>('')
  const [institution, setInstitution] = useState<string>('')
  const [workEmail, setWorkEmail] = useState<string>('')

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false)
  const [isResubmitting, setIsResubmitting] = useState<boolean>(false)

  // Reset on the way out rather than in an effect on the way in: this component stays mounted for
  // the life of the page, so without it a reopened dialog still shows the last error and the last
  // half-typed password.
  const reset = () => {
    setIsDoctorFlow(false)
    setMode('signup')
    setName('')
    setEmail('')
    setPassword('')
    setOrcid('')
    setFullName('')
    setLicenseOrNpi('')
    setSpecialty(SPECIALTIES[0] ?? OTHER_SPECIALTY)
    setOtherSpecialty('')
    setInstitution('')
    setWorkEmail('')
    setIsSubmitting(false)
    setError(null)
    setFieldErrors({})
    setJustSubmitted(false)
    setIsResubmitting(false)
  }

  const handleClose = () => {
    reset()
    setOpenModal(null)
  }

  const clearErrors = () => {
    setError(null)
    setFieldErrors({})
  }

  /** Turns a thrown `ApiError` into the two things a form can show. */
  const showFailure = (thrown: unknown, fallback: string) => {
    if (thrown instanceof ApiError) {
      setFieldErrors(fieldErrorsFrom(thrown.details))
      setError(thrown.message)
      return
    }
    setError(thrown instanceof Error ? thrown.message : fallback)
  }

  const openDoctorTab = () => {
    clearErrors()
    setIsDoctorFlow(true)
    // Seeded from the account rather than left blank, and only when the reader has not typed:
    // these are the same two facts they already gave us.
    if (currentUser) {
      setFullName((value) => value || currentUser.name)
      setWorkEmail((value) => value || currentUser.email)
    }
  }

  const handleAccountSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    clearErrors()
    setIsSubmitting(true)
    try {
      const trimmedOrcid = orcid.trim()
      const { user } =
        mode === 'signup'
          ? await api.register({
              name: name.trim(),
              email: email.trim(),
              password,
              ...(trimmedOrcid ? { orcid: trimmedOrcid } : {}),
            })
          : await api.login({ email: email.trim(), password })

      setCurrentUser(user)
      setPassword('')

      // Someone who came for the credential form is left standing on it, signed in, instead of
      // being dropped back on the page they were trying to get past.
      if (isDoctorFlow) {
        setFullName((value) => value || user.name)
        setWorkEmail((value) => value || user.email)
        return
      }
      handleClose()
    } catch (thrown) {
      showFailure(thrown, 'That did not work. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCredentialSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    const chosenSpecialty = specialty === OTHER_SPECIALTY ? otherSpecialty.trim() : specialty
    if (!chosenSpecialty) {
      setFieldErrors({ specialty: 'Name the specialty so a steward can check it.' })
      return
    }

    clearErrors()
    setIsSubmitting(true)
    try {
      const { user } = await api.submitDoctorVerification({
        fullName: fullName.trim(),
        licenseOrNpi: licenseOrNpi.trim(),
        specialty: chosenSpecialty,
        institution: institution.trim(),
        workEmail: workEmail.trim(),
      })
      // The server answers with `verificationState: 'pending'` and nothing this client sends can
      // make it anything else — see docs/api-contract.md.
      setCurrentUser(user)
      setIsResubmitting(false)
      setJustSubmitted(true)
    } catch (thrown) {
      showFailure(thrown, 'Those credentials could not be submitted.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verificationState = currentUser?.verificationState ?? 'none'
  const submittedSpecialty = specialty === OTHER_SPECIALTY ? otherSpecialty.trim() : specialty
  const verifiedOn = formatDate(currentUser?.verifiedAt)
  const note = currentUser ? stewardNote(currentUser) : null

  const errorLine = error ? (
    <p role="alert" className="text-[11px] font-semibold text-rose-700">
      {error}
    </p>
  ) : null

  // ---------------------------------------------------------------------------
  // Forms
  // ---------------------------------------------------------------------------

  const accountForm = (
    <form onSubmit={handleAccountSubmit} className="space-y-3">
      {mode === 'signup' && (
        <div>
          <label className={LABEL_CLASS} htmlFor={`${baseId}-name`}>
            Your Name
          </label>
          <input
            id={`${baseId}-name`}
            type="text"
            required
            placeholder="e.g. Alex Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? `${baseId}-name-error` : undefined}
            className={INPUT_CLASS}
          />
          <FieldError id={`${baseId}-name-error`} message={fieldErrors.name} />
        </div>
      )}

      <div>
        <label className={LABEL_CLASS} htmlFor={`${baseId}-email`}>
          Email
        </label>
        <input
          id={`${baseId}-email`}
          type="email"
          required
          autoComplete="email"
          placeholder="alex@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? `${baseId}-email-error` : undefined}
          className={INPUT_CLASS}
        />
        <FieldError id={`${baseId}-email-error`} message={fieldErrors.email} />
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor={`${baseId}-password`}>
          Password
        </label>
        <input
          id={`${baseId}-password`}
          type="password"
          required
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          // No "at least N characters" hint: the minimum lives in the register route's zod schema,
          // and a rule quoted here that the server does not enforce is a rule the reader is
          // following for nothing. A rejected password comes back as a field error instead.
          placeholder={mode === 'signup' ? 'Choose a password' : 'Your password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? `${baseId}-password-error` : undefined}
          className={INPUT_CLASS}
        />
        <FieldError id={`${baseId}-password-error`} message={fieldErrors.password} />
      </div>

      {mode === 'signup' && (
        <div>
          <label className={LABEL_CLASS} htmlFor={`${baseId}-orcid`}>
            ORCID iD (optional)
          </label>
          <input
            id={`${baseId}-orcid`}
            type="text"
            placeholder="0000-0002-1825-0097"
            value={orcid}
            onChange={(e) => setOrcid(e.target.value)}
            aria-invalid={Boolean(fieldErrors.orcid)}
            aria-describedby={
              fieldErrors.orcid ? `${baseId}-orcid-error` : `${baseId}-orcid-hint`
            }
            className={INPUT_CLASS}
          />
          <FieldError id={`${baseId}-orcid-error`} message={fieldErrors.orcid} />
          {!fieldErrors.orcid && (
            <p id={`${baseId}-orcid-hint`} className="text-[11px] text-[#86868B] mt-1">
              Shown beside your edits so a reader can check who made them.
            </p>
          )}
        </div>
      )}

      {errorLine}

      <div className="pt-1">
        <button type="submit" disabled={isSubmitting} className={DARK_BUTTON_CLASS}>
          {isSubmitting
            ? mode === 'signup'
              ? 'Creating account…'
              : 'Signing in…'
            : mode === 'signup'
              ? 'Create account'
              : 'Sign in'}
        </button>
      </div>

      <p className="text-[11px] text-[#86868B] text-center">
        {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
        <button
          type="button"
          onClick={() => {
            clearErrors()
            setMode(mode === 'signup' ? 'signin' : 'signup')
          }}
          className="font-semibold text-[#0071E3] hover:underline cursor-pointer"
        >
          {mode === 'signup' ? 'Sign in' : 'Create an account'}
        </button>
      </p>
    </form>
  )

  const credentialForm = (
    <form onSubmit={handleCredentialSubmit} className="space-y-3">
      <div>
        <label className={LABEL_CLASS} htmlFor={`${baseId}-fullname`}>
          Full Name with Title
        </label>
        <input
          id={`${baseId}-fullname`}
          type="text"
          required
          placeholder="e.g. Dr. Jordan Hayes, MD"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? `${baseId}-fullname-error` : undefined}
          className={INPUT_CLASS}
        />
        <FieldError id={`${baseId}-fullname-error`} message={fieldErrors.fullName} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className={LABEL_CLASS} htmlFor={`${baseId}-license`}>
            NPI or License #
          </label>
          <input
            id={`${baseId}-license`}
            type="text"
            required
            placeholder="e.g. NPI-194820194"
            value={licenseOrNpi}
            onChange={(e) => setLicenseOrNpi(e.target.value)}
            aria-invalid={Boolean(fieldErrors.licenseOrNpi)}
            aria-describedby={fieldErrors.licenseOrNpi ? `${baseId}-license-error` : undefined}
            className={INPUT_CLASS}
          />
          <FieldError id={`${baseId}-license-error`} message={fieldErrors.licenseOrNpi} />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor={`${baseId}-specialty`}>
            Medical Specialty
          </label>
          <select
            id={`${baseId}-specialty`}
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className={SELECT_CLASS}
          >
            {SPECIALTIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value={OTHER_SPECIALTY}>{OTHER_SPECIALTY}</option>
          </select>
          {specialty === OTHER_SPECIALTY && (
            <input
              type="text"
              required
              placeholder="Name your specialty"
              value={otherSpecialty}
              onChange={(e) => setOtherSpecialty(e.target.value)}
              aria-label="Your specialty"
              aria-invalid={Boolean(fieldErrors.specialty)}
              aria-describedby={fieldErrors.specialty ? `${baseId}-specialty-error` : undefined}
              className={`${INPUT_CLASS} mt-2`}
            />
          )}
          <FieldError id={`${baseId}-specialty-error`} message={fieldErrors.specialty} />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor={`${baseId}-institution`}>
          Hospital / Institution
        </label>
        <input
          id={`${baseId}-institution`}
          type="text"
          required
          placeholder="e.g. Mayo Clinic or University Hospital"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          aria-invalid={Boolean(fieldErrors.institution)}
          aria-describedby={fieldErrors.institution ? `${baseId}-institution-error` : undefined}
          className={INPUT_CLASS}
        />
        <FieldError id={`${baseId}-institution-error`} message={fieldErrors.institution} />
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor={`${baseId}-workemail`}>
          Work Email
        </label>
        <input
          id={`${baseId}-workemail`}
          type="email"
          required
          placeholder="dr.name@hospital.org"
          value={workEmail}
          onChange={(e) => setWorkEmail(e.target.value)}
          aria-invalid={Boolean(fieldErrors.workEmail)}
          aria-describedby={fieldErrors.workEmail ? `${baseId}-workemail-error` : undefined}
          className={INPUT_CLASS}
        />
        <FieldError id={`${baseId}-workemail-error`} message={fieldErrors.workEmail} />
      </div>

      {errorLine}

      <div className="pt-1">
        <button type="submit" disabled={isSubmitting} className={BLUE_BUTTON_CLASS}>
          {isSubmitting ? (
            <>
              <span
                className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"
                aria-hidden="true"
              />
              <span>Submitting…</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              {/* The reference promised the badge on this button — "Verify & Obtain Doctor
                  Badge". Nothing here obtains anything; it files a claim for a person to check. */}
              <span>Submit credentials for review</span>
            </>
          )}
        </button>
      </div>
    </form>
  )

  // ---------------------------------------------------------------------------
  // Doctor-tab states
  // ---------------------------------------------------------------------------

  const verifiedPanel = currentUser ? (
    <div className="py-1 text-center space-y-3.5 animate-zoom-in">
      <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
      </div>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-500/20 inline-block mb-1">
          Physician Verification Complete
        </span>
        <p className="text-xl font-bold text-[#1D1D1F] tracking-tight">{currentUser.name}</p>
        {[currentUser.medicalSpecialty, currentUser.institution].filter(Boolean).length > 0 && (
          <p className="text-xs text-[#0071E3] font-medium mt-0.5">
            {[currentUser.medicalSpecialty, currentUser.institution].filter(Boolean).join(' • ')}
          </p>
        )}
        {verifiedOn && <p className="text-[11px] text-[#86868B] mt-1">Verified {verifiedOn}</p>}
      </div>

      <div className="bg-[#F5F5F7] p-3.5 rounded-2xl border border-black/[0.04] text-left space-y-1.5">
        <span className="text-[10px] text-[#86868B] uppercase font-bold tracking-wider block">
          How your comments appear:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-[#1D1D1F]">{currentUser.name}</span>
          {/* The one place this file draws the badge, and only for an account a steward has
              already moved to `verified`. */}
          {isVerifiedPhysician(currentUser) && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#0071E3]/10 text-[#0071E3] px-2 py-0.5 rounded-full border border-[#0071E3]/20 whitespace-nowrap">
              <CheckCircle2 className="w-3 h-3 text-[#0071E3]" aria-hidden="true" />
              <span>Verified Physician ✓</span>
            </span>
          )}
        </div>
      </div>
    </div>
  ) : null

  const pendingPanel = (
    <PendingPanel
      heading="Under review"
      displayName={currentUser?.name ?? ''}
      specialty={currentUser?.medicalSpecialty}
      institution={currentUser?.institution}
    />
  )

  const rejectedPanel = (
    <div className="space-y-3">
      <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/15 space-y-1.5">
        <span className="font-bold text-rose-800 text-[11px] block">Credentials not accepted</span>
        <p className="text-xs text-[#1D1D1F] leading-relaxed">
          A steward read this submission and did not accept it. You can submit again with a licence
          number and institution that can be checked against a public register.
        </p>
        {note && <p className="text-xs text-[#6E6E73] italic">&quot;{note}&quot;</p>}
      </div>
      <button
        type="button"
        onClick={() => {
          clearErrors()
          setIsResubmitting(true)
        }}
        className={BLUE_BUTTON_CLASS}
      >
        <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Submit credentials again</span>
      </button>
    </div>
  )

  const signedInPanel = currentUser ? (
    <div className="space-y-3">
      <div className="bg-[#F5F5F7] p-3.5 rounded-2xl border border-black/[0.04] space-y-1.5">
        <span className="text-[10px] text-[#86868B] uppercase font-bold tracking-wider block">
          Signed in as
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-[#1D1D1F]">{currentUser.name}</span>
          {isVerifiedPhysician(currentUser) && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#0071E3]/10 text-[#0071E3] px-2 py-0.5 rounded-full border border-[#0071E3]/20 whitespace-nowrap">
              <CheckCircle2 className="w-3 h-3 text-[#0071E3]" aria-hidden="true" />
              <span>Verified Physician ✓</span>
            </span>
          )}
        </div>
        {currentUser.handle && (
          <p className="text-[11px] text-[#86868B]">@{currentUser.handle}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          reset()
          setOpenModal('account')
        }}
        className={DARK_BUTTON_CLASS}
      >
        Open your account
      </button>
    </div>
  ) : null

  const doctorBody = !currentUser ? (
    <div className="space-y-3">
      {/* Divergence 3: a credential belongs to an account, or nobody can be told apart later. */}
      <p className="text-[11px] text-[#86868B] leading-relaxed">
        Credentials attach to an account, so create one first. Your licence goes to a steward after
        that.
      </p>
      {accountForm}
    </div>
  ) : verificationState === 'verified' ? (
    verifiedPanel
  ) : verificationState === 'pending' ? (
    pendingPanel
  ) : verificationState === 'rejected' && !isResubmitting ? (
    rejectedPanel
  ) : (
    credentialForm
  )

  const communityBody = currentUser ? signedInPanel : accountForm

  // The community tab's heading. The reference had one pair of lines here ("Comment Log-in" /
  // "Enter your name and email to post clinical questions and notes") because it had one form;
  // this side now has three states, and the heading has to say which one the reader is looking at.
  const heading = currentUser
    ? { title: 'You are signed in', blurb: 'Notes and edits post under your name.' }
    : mode === 'signin'
      ? { title: 'Comment Log-in', blurb: 'Sign in to post clinical questions and notes.' }
      : {
          title: 'Create your account',
          blurb: 'Your name, email and a password. Notes and edits post under your name.',
        }

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} labelledBy={headingId} maxWidth="max-w-md">
      <div className="p-5 sm:p-7 space-y-5">
        {justSubmitted ? (
          <div className="space-y-4">
            <PendingPanel
              heading="Verification submitted"
              headingId={headingId}
              displayName={currentUser?.name ?? fullName.trim()}
              specialty={submittedSpecialty || undefined}
              institution={institution.trim() || undefined}
            />
            <button type="button" onClick={handleClose} className={DARK_BUTTON_CLASS}>
              Start Contributing Clinical Notes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top Switcher: General Commenter vs Physician Verification */}
            <div>
              <div className="flex items-center p-1 bg-black/[0.04] rounded-full text-xs font-medium text-[#6E6E73] mb-3">
                <button
                  type="button"
                  aria-pressed={!isDoctorFlow}
                  onClick={() => {
                    clearErrors()
                    setIsDoctorFlow(false)
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-full transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    !isDoctorFlow
                      ? 'bg-white text-[#1D1D1F] shadow-xs font-bold'
                      : 'hover:text-[#1D1D1F]'
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Community</span>
                </button>
                <button
                  type="button"
                  aria-pressed={isDoctorFlow}
                  onClick={openDoctorTab}
                  className={`flex-1 py-1.5 px-2 rounded-full transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isDoctorFlow
                      ? 'bg-[#0071E3] text-white shadow-xs font-bold'
                      : 'hover:text-[#1D1D1F]'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Doctor Verification</span>
                </button>
              </div>

              {isDoctorFlow ? (
                <div>
                  <h2
                    id={headingId}
                    className="text-lg font-bold text-[#1D1D1F] tracking-tight flex items-center gap-1.5"
                  >
                    <span>Physician Verification</span>
                    <ShieldCheck className="w-4 h-4 text-[#0071E3] shrink-0" aria-hidden="true" />
                  </h2>
                  {/* The reference said the form itself granted the checkmark. It does not. */}
                  <p className="text-xs text-[#6E6E73] mt-0.5 leading-relaxed">
                    A steward checks credentials by hand. The blue checkmark appears only after that
                    review.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 id={headingId} className="text-lg font-bold text-[#1D1D1F] tracking-tight">
                    {heading.title}
                  </h2>
                  {heading.blurb && (
                    <p className="text-xs text-[#6E6E73] mt-0.5 leading-relaxed">{heading.blurb}</p>
                  )}
                </div>
              )}
            </div>

            {isDoctorFlow ? doctorBody : communityBody}
          </div>
        )}
      </div>
    </ModalShell>
  )
}

export default AuthModal
