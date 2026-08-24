'use client'

import { Bookmark, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useApp } from '@/components/app-context'
import { accountScopeKey, isCurrentAccountRequest } from '@/lib/account-request-scope'
import { api } from '@/lib/api-client'

export function SaveMedicineButton({
  medicineSlug,
  initialSaved,
}: {
  medicineSlug: string
  initialSaved: boolean
}) {
  const { currentUser, requireAuth } = useApp()
  const accountId = currentUser?.id ?? null
  const accountKey = accountScopeKey(accountId)
  const accountKeyRef = useRef(accountKey)
  accountKeyRef.current = accountKey
  const accountGenerationRef = useRef(0)
  const requestControllerRef = useRef<AbortController | null>(null)
  const [saved, setSaved] = useState(initialSaved)
  const [stateAccountKey, setStateAccountKey] = useState<string | null>(accountKey)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    accountGenerationRef.current += 1
    const accountGeneration = accountGenerationRef.current
    requestControllerRef.current?.abort()
    requestControllerRef.current = null
    setError(null)
    setIsSaving(false)

    if (!accountId) {
      setSaved(false)
      setStateAccountKey(accountKey)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    requestControllerRef.current = controller
    setStateAccountKey(null)
    setIsLoading(true)
    void api
      .savedDrugs(controller.signal)
      .then((result) => {
        if (
          isCurrentAccountRequest({
            accountKey,
            currentAccountKey: accountKeyRef.current,
            accountGeneration,
            currentAccountGeneration: accountGenerationRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          setSaved(result.drugs.some((drug) => drug.slug === medicineSlug))
          setStateAccountKey(accountKey)
        }
      })
      .catch((caught) => {
        if (
          isCurrentAccountRequest({
            accountKey,
            currentAccountKey: accountKeyRef.current,
            accountGeneration,
            currentAccountGeneration: accountGenerationRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          setSaved(false)
          setStateAccountKey(accountKey)
          setError(
            caught instanceof Error ? caught.message : 'Saved status could not be loaded just now.',
          )
        }
      })
      .finally(() => {
        if (
          isCurrentAccountRequest({
            accountKey,
            currentAccountKey: accountKeyRef.current,
            accountGeneration,
            currentAccountGeneration: accountGenerationRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          requestControllerRef.current = null
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [accountId, accountKey, medicineSlug])

  const accountScopeIsCurrent = stateAccountKey === accountKey
  const visibleSaved = Boolean(accountId) && accountScopeIsCurrent && saved
  const isBusy = !accountScopeIsCurrent || isLoading || isSaving

  const toggle = async () => {
    if (!currentUser) {
      requireAuth()
      return
    }
    if (!accountScopeIsCurrent || accountKeyRef.current !== accountKey || isBusy) return
    const accountGeneration = accountGenerationRef.current
    const controller = new AbortController()
    requestControllerRef.current?.abort()
    requestControllerRef.current = controller
    setIsSaving(true)
    setError(null)
    try {
      const result = await api.toggleSaved(medicineSlug, controller.signal)
      if (
        isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        setSaved(result.saved)
      }
    } catch (caught) {
      if (
        isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        setError(caught instanceof Error ? caught.message : 'This medicine could not be saved.')
      }
    } finally {
      if (
        isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        requestControllerRef.current = null
        setIsSaving(false)
      }
    }
  }

  return (
    <div className="pt-1">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={isBusy}
        aria-pressed={visibleSaved}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/[0.1] bg-white px-3.5 py-2 text-xs font-semibold text-[#1D1D1F] transition hover:bg-[#F5F5F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] disabled:cursor-wait disabled:opacity-60"
      >
        {isBusy ? (
          <LoaderCircle
            className="h-4 w-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          <Bookmark
            className={`h-4 w-4 ${visibleSaved ? 'fill-current text-[#0066CC]' : ''}`}
            aria-hidden="true"
          />
        )}
        {!accountScopeIsCurrent || isLoading
          ? 'Checking saved status…'
          : isSaving
            ? 'Saving…'
            : visibleSaved
              ? 'Saved'
              : 'Save medicine'}
      </button>
      {accountScopeIsCurrent && error && (
        <p role="alert" className="mt-1 max-w-sm text-[11px] leading-5 text-rose-800">
          {error}
        </p>
      )}
    </div>
  )
}
