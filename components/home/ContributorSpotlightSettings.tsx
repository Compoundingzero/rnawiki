'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'

import { useApp } from '@/components/app-context'
import {
  DEFAULT_CONTRIBUTOR_PUBLIC_SETTINGS,
  PUBLIC_SOCIAL_PLATFORM_LABEL,
  PUBLIC_SOCIAL_PLATFORMS,
  type ContributorPublicSettings,
  type PublicSocialPlatform,
} from '@/lib/contributor-public-settings'

type SocialUrlFields = Record<PublicSocialPlatform, string>

const EMPTY_SOCIAL_URLS: SocialUrlFields = {
  x: '',
  linkedin: '',
  github: '',
  bluesky: '',
}

function fieldsFromSettings(settings: ContributorPublicSettings): SocialUrlFields {
  const fields = { ...EMPTY_SOCIAL_URLS }
  for (const link of settings.socialLinks) fields[link.platform] = link.url
  return fields
}

async function responseMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown }
    if (typeof body.error === 'string' && body.error.trim()) return body.error
  } catch {
    // The status-based fallback below is safer than surfacing an HTML proxy response.
  }
  return response.status === 429
    ? 'Too many updates were sent. Wait a moment and try again.'
    : 'The settings could not be saved. Try again.'
}

export function ContributorSpotlightSettings() {
  const { currentUser } = useApp()
  const accountId = currentUser?.id ?? null
  const accountIdRef = useRef(accountId)
  accountIdRef.current = accountId
  const fieldId = useId()
  const requestRef = useRef<AbortController | null>(null)
  const generationRef = useRef(0)
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [appearInWeeklySpotlight, setAppearInWeeklySpotlight] = useState(
    DEFAULT_CONTRIBUTOR_PUBLIC_SETTINGS.appearInWeeklySpotlight,
  )
  const [showSocialLinksInSpotlight, setShowSocialLinksInSpotlight] = useState(
    DEFAULT_CONTRIBUTOR_PUBLIC_SETTINGS.showSocialLinksInSpotlight,
  )
  const [socialUrls, setSocialUrls] = useState<SocialUrlFields>({ ...EMPTY_SOCIAL_URLS })
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    generationRef.current += 1
    requestRef.current?.abort()
    requestRef.current = null
    setLoadedFor(null)
    setIsLoading(false)
    setIsSaving(false)
    setAppearInWeeklySpotlight(DEFAULT_CONTRIBUTOR_PUBLIC_SETTINGS.appearInWeeklySpotlight)
    setShowSocialLinksInSpotlight(DEFAULT_CONTRIBUTOR_PUBLIC_SETTINGS.showSocialLinksInSpotlight)
    setSocialUrls({ ...EMPTY_SOCIAL_URLS })
    setError(null)
    setSaved(false)
  }, [accountId])

  useEffect(() => () => requestRef.current?.abort(), [])

  if (!currentUser || !accountId) return null

  const loadSettings = async () => {
    if (loadedFor === accountId || isLoading || isSaving) return
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    const generation = generationRef.current
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/me/contributor-settings', {
        cache: 'no-store',
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(await responseMessage(response))
      const body = (await response.json()) as { settings: ContributorPublicSettings }
      if (
        controller.signal.aborted ||
        generationRef.current !== generation ||
        accountIdRef.current !== accountId
      ) {
        return
      }
      setAppearInWeeklySpotlight(body.settings.appearInWeeklySpotlight)
      setShowSocialLinksInSpotlight(body.settings.showSocialLinksInSpotlight)
      setSocialUrls(fieldsFromSettings(body.settings))
      setLoadedFor(accountId)
    } catch (loadError) {
      if (
        !controller.signal.aborted &&
        generationRef.current === generation &&
        accountIdRef.current === accountId
      ) {
        setError(
          loadError instanceof Error ? loadError.message : 'The settings could not be loaded.',
        )
      }
    } finally {
      if (
        !controller.signal.aborted &&
        generationRef.current === generation &&
        accountIdRef.current === accountId
      ) {
        requestRef.current = null
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving || isLoading || loadedFor !== accountId) return

    const socialLinks = PUBLIC_SOCIAL_PLATFORMS.flatMap((platform) => {
      const url = socialUrls[platform].trim()
      return url ? [{ platform, url }] : []
    })
    if (showSocialLinksInSpotlight && socialLinks.length === 0) {
      setSaved(false)
      setError('Add at least one social profile before making social links public.')
      return
    }

    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    const generation = generationRef.current
    setIsSaving(true)
    setSaved(false)
    setError(null)

    try {
      const response = await fetch('/api/me/contributor-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appearInWeeklySpotlight,
          showSocialLinksInSpotlight,
          socialLinks,
        }),
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(await responseMessage(response))
      const body = (await response.json()) as { settings: ContributorPublicSettings }
      if (
        controller.signal.aborted ||
        generationRef.current !== generation ||
        accountIdRef.current !== accountId
      ) {
        return
      }
      setAppearInWeeklySpotlight(body.settings.appearInWeeklySpotlight)
      setShowSocialLinksInSpotlight(body.settings.showSocialLinksInSpotlight)
      setSocialUrls(fieldsFromSettings(body.settings))
      setSaved(true)
    } catch (saveError) {
      if (
        !controller.signal.aborted &&
        generationRef.current === generation &&
        accountIdRef.current === accountId
      ) {
        setError(
          saveError instanceof Error ? saveError.message : 'The settings could not be saved.',
        )
      }
    } finally {
      if (
        !controller.signal.aborted &&
        generationRef.current === generation &&
        accountIdRef.current === accountId
      ) {
        requestRef.current = null
        setIsSaving(false)
      }
    }
  }

  return (
    <details
      className="group rounded-2xl border border-black/[0.07] bg-white"
      onToggle={(event) => {
        if (event.currentTarget.open) void loadSettings()
      }}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-[#424245] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] [&::-webkit-details-marker]:hidden">
        Manage your contributor spotlight settings
        <span
          aria-hidden="true"
          className="text-base font-normal text-[#0071E3] group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-4 border-t border-black/[0.06] p-4"
      >
        {isLoading ? (
          <p className="text-xs text-[#6E6E73]">Loading your settings…</p>
        ) : (
          <>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl bg-[#F5F5F7] p-3">
              <input
                type="checkbox"
                checked={appearInWeeklySpotlight}
                onChange={(event) => {
                  setAppearInWeeklySpotlight(event.target.checked)
                  setSaved(false)
                }}
                className="mt-0.5 h-4 w-4 accent-[#0071E3]"
              />
              <span>
                <span className="block text-xs font-semibold text-[#1D1D1F]">
                  Show @{currentUser.handle ?? 'my-handle'} when my changes qualify
                </span>
                <span className="mt-0.5 block text-[11px] leading-4 text-[#6E6E73]">
                  This only controls the homepage. Factual attribution remains in medicine history.
                </span>
              </span>
            </label>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold text-[#1D1D1F]">
                Optional social profiles
              </legend>
              <p className="text-[11px] leading-4 text-[#6E6E73]">
                Only the profile links you enter here can appear. RNAWiki labels them as supplied by
                your account and does not verify that you own them.
              </p>

              <label className="flex min-h-11 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={showSocialLinksInSpotlight}
                  onChange={(event) => {
                    setShowSocialLinksInSpotlight(event.target.checked)
                    setSaved(false)
                  }}
                  className="h-4 w-4 accent-[#0071E3]"
                />
                <span className="text-xs font-medium text-[#424245]">
                  Show my saved social links if I appear
                </span>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                {PUBLIC_SOCIAL_PLATFORMS.map((platform) => (
                  <label key={platform} htmlFor={`${fieldId}-${platform}`} className="space-y-1">
                    <span className="block text-[11px] font-semibold text-[#424245]">
                      {PUBLIC_SOCIAL_PLATFORM_LABEL[platform]} profile URL
                    </span>
                    <input
                      id={`${fieldId}-${platform}`}
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      maxLength={500}
                      value={socialUrls[platform]}
                      onChange={(event) => {
                        setSocialUrls((current) => ({
                          ...current,
                          [platform]: event.target.value,
                        }))
                        setSaved(false)
                      }}
                      placeholder={
                        platform === 'x'
                          ? 'https://x.com/handle'
                          : platform === 'linkedin'
                            ? 'https://www.linkedin.com/in/name'
                            : platform === 'github'
                              ? 'https://github.com/handle'
                              : 'https://bsky.app/profile/handle.bsky.social'
                      }
                      className="min-h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 text-xs text-[#1D1D1F] outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15"
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSaving || loadedFor !== accountId}
                className="min-h-11 rounded-full bg-[#1D1D1F] px-5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save public settings'}
              </button>
              <span aria-live="polite" className="text-[11px] text-[#6E6E73]">
                {saved ? 'Settings saved.' : null}
              </span>
            </div>
          </>
        )}

        {error && (
          <p role="alert" className="text-[11px] font-semibold leading-4 text-rose-700">
            {error}
          </p>
        )}
      </form>
    </details>
  )
}
