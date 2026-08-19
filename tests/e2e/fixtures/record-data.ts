import type { Page } from '@playwright/test'
import { SEEDED_SLUGS } from './seeded-entities'

/**
 * Shared helpers for the Evidence Record specs.
 *
 * Several of the record-page rules are conditional on what a claim actually holds — a claim with
 * no recorded events must NOT show the "what did not work" section, and one with events must. Any
 * spec that hard-codes which seeded claim is which becomes wrong the first time the corpus is
 * edited, so the specs read the public JSON API instead and pick a claim that matches the
 * condition under test. The API is the same data the page renders, from the same query, so this
 * cannot drift from the page.
 *
 * Nothing here asserts. A spec that finds no qualifying claim skips with a clear reason rather
 * than passing silently, in keeping with the rest of this suite.
 */

export const ALL_SEEDED_SLUGS = [SEEDED_SLUGS.bpc157, SEEDED_SLUGS.casgevy, SEEDED_SLUGS.rapamycin] as const

/** Every public page a reader can reach without an admin session. */
export const PUBLIC_PATHS = [
  '/',
  '/compounds',
  '/search?q=tendon',
  '/evidence',
  '/methodology',
  '/updates',
  '/corrections',
  '/privacy',
  ...ALL_SEEDED_SLUGS.map((slug) => `/r/${slug}`),
] as const

export interface ApiClaimEvent {
  eventType: string
  eventTypePublic: string
  developmentGate: string
  developmentGatePublic: string
  plainSummary: string
}

export interface ApiEvidenceChange {
  changeType: string
  explanation: string
  publicationDate: string
}

export interface ApiClaim {
  canonicalUrl: string
  directAnswer: string
  claimEvents: ApiClaimEvent[]
  evidenceChanges: ApiEvidenceChange[]
  evidenceContext: { relationship: string }[]
}

export interface ApiEntity {
  slug: string
  canonicalName: string
  claims: ApiClaim[]
}

export async function fetchEntity(page: Page, slug: string): Promise<ApiEntity | null> {
  const response = await page.request.get(`/api/v1/entities/${slug}`)
  if (!response.ok()) return null
  return (await response.json()) as ApiEntity
}

/** The claim slug is the fragment of its canonical URL: /r/[slug]#claim-[claimSlug]. */
export function claimSlugOf(claim: ApiClaim): string {
  const hash = claim.canonicalUrl.split('#claim-')[1]
  return hash ?? ''
}

/**
 * The Evidence Record shows "What did not work or conflicts with this answer" when the claim has
 * published events OR curated `contradicts`/`limits` evidence — the second is the deterministic
 * fallback paragraph. A claim with neither must show no section at all, so "has no events" is not
 * on its own the right condition to test absence with.
 */
export function hasFailureSection(claim: ApiClaim): boolean {
  return (
    claim.claimEvents.length > 0 ||
    claim.evidenceContext.some((link) => link.relationship === 'contradicts' || link.relationship === 'limits')
  )
}

export interface FoundClaim {
  slug: string
  claimSlug: string
  claim: ApiClaim
}

/** First claim across the seeded corpus matching `predicate`, with the record it belongs to. */
export async function findClaim(
  page: Page,
  predicate: (claim: ApiClaim) => boolean
): Promise<FoundClaim | null> {
  for (const slug of ALL_SEEDED_SLUGS) {
    const entity = await fetchEntity(page, slug)
    if (!entity) continue
    const claim = entity.claims.find(predicate)
    if (claim) return { slug, claimSlug: claimSlugOf(claim), claim }
  }
  return null
}

/** The record carrying the most published claims — the densest page to look at and to photograph. */
export async function findRichestRecord(page: Page): Promise<{ slug: string; claimCount: number } | null> {
  let best: { slug: string; claimCount: number } | null = null
  for (const slug of ALL_SEEDED_SLUGS) {
    const entity = await fetchEntity(page, slug)
    if (!entity) continue
    if (!best || entity.claims.length > best.claimCount) best = { slug, claimCount: entity.claims.length }
  }
  return best
}

/**
 * Expand every <details> on the page.
 *
 * Used only where the point is to inspect content, never to assert default state — the "no record
 * is open on first load" rule is asserted before anything here runs. Everything expanded is
 * already in the server-rendered HTML; opening it only moves it into innerText.
 */
export async function expandEverything(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll('details').forEach((d) => d.setAttribute('open', ''))
  })
}

export async function hasNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
}
