'use client'

/** One account flow for every RNAWiki contributor. */

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { User } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { api, ApiError } from '@/lib/api-client'
import { isSessionMutationInteractionLocked, useApp } from './app-context'
import { ModalShell } from './ModalShell'

const AUTH_RECONCILIATION_PENDING = 'auth-reconciliation-pending'
const LABEL_CLASS = 'text-xs font-semibold text-[#1D1D1F] block mb-1'
const INPUT_CLASS =
  'w-full bg-[#F5F5F7] text-xs text-[#1D1D1F] px-3 py-2 rounded-xl border border-transparent focus:bg-white focus:border-[#0071E3] focus:outline-none'
const DARK_BUTTON_CLASS =
  'w-full py-2.5 rounded-full bg-[#1D1D1F] hover:bg-black disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm'
const BLUE_BUTTON_CLASS =
  'w-full py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm'

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

export function canCloseAuthModal(args: {
  openModal: string | null
  isSubmitting: boolean
}): boolean {
  return args.openModal === 'auth' && !args.isSubmitting
}

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1 text-[11px] font-semibold text-rose-700">
      {message}
    </p>
  )
}

export function AuthModal() {
  const { currentUser, openModal, refreshUser, setCurrentUser, setOpenModal } = useApp()
  const accountId = currentUser?.id ?? null
  const accountIdRef = useRef(accountId)
  accountIdRef.current = accountId
  const openModalRef = useRef(openModal)
  openModalRef.current = openModal
  const requestRef = useRef<{ generation: number; controller: AbortController | null }>({
    generation: 0,
    controller: null,
  })
  const acceptedAccountTransitionRef = useRef<string | null>(null)
  const isOpen = openModal === 'auth'
  const router = useRouter()
  const baseId = useId()
  const headingId = `${baseId}-heading`

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orcid, setOrcid] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formAccountId, setFormAccountId] = useState(accountId)
  const [reconciliationRequired, setReconciliationRequired] = useState(false)
  const interactionLocked = isSessionMutationInteractionLocked(isSubmitting, reconciliationRequired)

  const reset = useCallback(() => {
    setMode('signin')
    setName('')
    setEmail('')
    setPassword('')
    setOrcid('')
    setIsSubmitting(false)
    setError(null)
    setFieldErrors({})
    setReconciliationRequired(false)
  }, [])

  useEffect(() => {
    requestRef.current.controller?.abort()
    requestRef.current.generation += 1
    requestRef.current.controller = null

    if (
      isOpen &&
      (acceptedAccountTransitionRef.current === accountId ||
        acceptedAccountTransitionRef.current === AUTH_RECONCILIATION_PENDING)
    ) {
      if (acceptedAccountTransitionRef.current === AUTH_RECONCILIATION_PENDING) {
        setIsSubmitting(true)
      } else {
        acceptedAccountTransitionRef.current = null
        setIsSubmitting(false)
      }
      setFormAccountId(accountId)
      return
    }

    acceptedAccountTransitionRef.current = null
    reset()
    setFormAccountId(accountId)
  }, [accountId, isOpen, reset])

  const formScopeIsCurrent = formAccountId === accountId

  const handleClose = () => {
    if (
      !canCloseAuthModal({
        openModal: openModalRef.current,
        isSubmitting: interactionLocked || requestRef.current.controller !== null,
      })
    ) {
      return
    }
    requestRef.current.generation += 1
    reset()
    setOpenModal(null)
  }

  const clearErrors = () => {
    setError(null)
    setFieldErrors({})
  }

  const showFailure = (thrown: unknown, fallback: string) => {
    if (thrown instanceof ApiError) {
      setFieldErrors(fieldErrorsFrom(thrown.details))
      setError(thrown.message)
      return
    }
    setError(thrown instanceof Error ? thrown.message : fallback)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      isSubmitting ||
      !formScopeIsCurrent ||
      openModalRef.current !== 'auth' ||
      accountIdRef.current !== accountId
    ) {
      return
    }

    requestRef.current.controller?.abort()
    const controller = new AbortController()
    const generation = requestRef.current.generation + 1
    requestRef.current = { generation, controller }
    const startingAccountId = accountId
    clearErrors()
    setIsSubmitting(true)

    try {
      const trimmedOrcid = orcid.trim()
      const { user } =
        mode === 'signup'
          ? await api.register(
              {
                name: name.trim(),
                email: email.trim(),
                password,
                ...(trimmedOrcid ? { orcid: trimmedOrcid } : {}),
              },
              controller.signal,
            )
          : await api.login({ email: email.trim(), password }, controller.signal)

      if (
        controller.signal.aborted ||
        requestRef.current.generation !== generation ||
        openModalRef.current !== 'auth' ||
        accountIdRef.current !== startingAccountId
      ) {
        return
      }

      acceptedAccountTransitionRef.current = user.id
      setCurrentUser(user)
      setPassword('')
      requestRef.current.controller = null
      setIsSubmitting(false)
      reset()
      setOpenModal(null)
      router.refresh()
    } catch (thrown) {
      if (
        controller.signal.aborted ||
        requestRef.current.generation !== generation ||
        openModalRef.current !== 'auth' ||
        accountIdRef.current !== startingAccountId
      ) {
        return
      }

      // The cookie may have changed even if the response was lost. Re-read the authenticated
      // account before allowing a second submission.
      acceptedAccountTransitionRef.current = AUTH_RECONCILIATION_PENDING
      const reconciledUser = await refreshUser()
      router.refresh()
      if (reconciledUser) {
        acceptedAccountTransitionRef.current = reconciledUser.id
        setCurrentUser(reconciledUser)
        setPassword('')
        requestRef.current.controller = null
        setIsSubmitting(false)
        reset()
        setOpenModal(null)
        return
      }

      acceptedAccountTransitionRef.current = null
      if (reconciledUser === null && !controller.signal.aborted) {
        setReconciliationRequired(false)
        showFailure(thrown, 'That did not work. Try again.')
      } else if (reconciledUser === undefined && !controller.signal.aborted) {
        setReconciliationRequired(true)
        setError(
          'RNAWiki could not confirm whether the account session changed. Check your connection before retrying.',
        )
      }
    } finally {
      if (
        !controller.signal.aborted &&
        requestRef.current.generation === generation &&
        openModalRef.current === 'auth' &&
        (accountIdRef.current === startingAccountId ||
          acceptedAccountTransitionRef.current !== null)
      ) {
        requestRef.current.controller = null
        setIsSubmitting(false)
      }
    }
  }

  const retrySessionReconciliation = async () => {
    if (!reconciliationRequired || isSubmitting || openModalRef.current !== 'auth') return
    acceptedAccountTransitionRef.current = AUTH_RECONCILIATION_PENDING
    setIsSubmitting(true)
    setError(null)
    try {
      const reconciledUser = await refreshUser()
      router.refresh()
      if (reconciledUser === undefined) {
        acceptedAccountTransitionRef.current = null
        setError(
          'RNAWiki still cannot confirm the account session. Check your connection, then retry or reload this page.',
        )
        return
      }

      setReconciliationRequired(false)
      if (!reconciledUser) {
        acceptedAccountTransitionRef.current = null
        setError('No signed-in account was found. You can submit the form again.')
        return
      }

      acceptedAccountTransitionRef.current = reconciledUser.id
      setCurrentUser(reconciledUser)
      setPassword('')
      reset()
      setOpenModal(null)
    } finally {
      if (openModalRef.current === 'auth') setIsSubmitting(false)
    }
  }

  const heading =
    mode === 'signin'
      ? {
          title: 'Sign in to RNAWiki',
          blurb:
            'Use one account to comment and propose edits. Your contributions are attributed to you.',
        }
      : {
          title: 'Create your RNAWiki account',
          blurb: 'Your comments and proposed edits will appear under the name you enter.',
        }

  return (
    <ModalShell
      isOpen={isOpen && (formScopeIsCurrent || reconciliationRequired)}
      onClose={handleClose}
      closeDisabled={interactionLocked}
      labelledBy={headingId}
      maxWidth="max-w-md"
    >
      <div
        className="space-y-5 p-5 sm:p-7"
        aria-busy={isSubmitting}
        inert={isSubmitting ? true : undefined}
      >
        {reconciliationRequired ? (
          <div className="space-y-4" role="alert">
            <div className="space-y-2">
              <h2 id={headingId} className="text-lg font-bold text-[#1D1D1F]">
                Account status needs to be confirmed
              </h2>
              <p className="text-xs leading-5 text-[#424245]">
                The server may have completed the request, but this browser could not confirm the
                result. Account actions stay locked until the check succeeds.
              </p>
              {error && <p className="text-[11px] font-semibold text-rose-700">{error}</p>}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void retrySessionReconciliation()}
                disabled={isSubmitting}
                className={BLUE_BUTTON_CLASS}
              >
                {isSubmitting ? 'Checking account…' : 'Retry account check'}
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                disabled={isSubmitting}
                className={DARK_BUTTON_CLASS}
              >
                Reload this page
              </button>
            </div>
          </div>
        ) : currentUser ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#0071E3]/10 text-[#0071E3]">
              <User className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1 text-center">
              <h2 id={headingId} className="text-lg font-bold text-[#1D1D1F]">
                You are signed in
              </h2>
              <p className="text-xs text-[#6E6E73]">
                {currentUser.name}
                {currentUser.handle ? ` · @${currentUser.handle}` : ''}
              </p>
            </div>
            <p className="rounded-2xl bg-[#F5F5F7] p-3.5 text-xs leading-5 text-[#424245]">
              Comments and proposed edits are attributed to this account. Reviewed edits keep their
              author in the public contribution history.
            </p>
            <button
              type="button"
              onClick={() => setOpenModal('account')}
              className={DARK_BUTTON_CLASS}
            >
              Open your account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 id={headingId} className="text-lg font-bold tracking-tight text-[#1D1D1F]">
                {heading.title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6E6E73]">{heading.blurb}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${baseId}-name`}>
                    Your name
                  </label>
                  <input
                    id={`${baseId}-name`}
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
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
                  onChange={(event) => setEmail(event.target.value)}
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
                  placeholder={mode === 'signup' ? 'Choose a password' : 'Your password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
                    onChange={(event) => setOrcid(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.orcid)}
                    aria-describedby={
                      fieldErrors.orcid ? `${baseId}-orcid-error` : `${baseId}-orcid-hint`
                    }
                    className={INPUT_CLASS}
                  />
                  <FieldError id={`${baseId}-orcid-error`} message={fieldErrors.orcid} />
                  {!fieldErrors.orcid && (
                    <p id={`${baseId}-orcid-hint`} className="mt-1 text-[11px] text-[#6E6E73]">
                      If supplied, this appears on your public contributor profile.
                    </p>
                  )}
                </div>
              )}

              {error && (
                <p role="alert" className="text-[11px] font-semibold text-rose-700">
                  {error}
                </p>
              )}

              <button type="submit" disabled={isSubmitting} className={DARK_BUTTON_CLASS}>
                {isSubmitting
                  ? mode === 'signup'
                    ? 'Creating account…'
                    : 'Signing in…'
                  : mode === 'signup'
                    ? 'Create account'
                    : 'Sign in'}
              </button>

              <p className="text-center text-[11px] text-[#6E6E73]">
                {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
                <button
                  type="button"
                  onClick={() => {
                    clearErrors()
                    setMode(mode === 'signup' ? 'signin' : 'signup')
                  }}
                  className="cursor-pointer font-semibold text-[#0071E3] hover:underline"
                >
                  {mode === 'signup' ? 'Sign in' : 'Create an account'}
                </button>
              </p>
            </form>
          </div>
        )}
      </div>
    </ModalShell>
  )
}

export default AuthModal
