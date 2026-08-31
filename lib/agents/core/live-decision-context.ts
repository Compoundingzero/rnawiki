import type { BackgroundSource, MedicineRecordedBackground } from '@/lib/background/types'
import { canonicalBackgroundSourceIdentifier } from '@/lib/background/source-assertions'

import { valueDigest } from './identity'
import { reviewEvidenceSource } from './evidence'
import type { ReviewEvidenceSource } from './types'

export const AGENT_LIVE_DECISION_CONTEXT_SCHEMA = 'agent-live-decision-context/v1' as const

export interface LiveMedicineBackground {
  slug: string
  recordedBackground: MedicineRecordedBackground | null
}

export interface AgentLiveStoredField {
  state: 'present' | 'absent'
  value: unknown | null
  valueDigest: string
  guardScope: 'exact_field_and_sources' | 'relevant_medicine_backgrounds_and_sources'
}

export interface AgentLiveSourceBinding {
  sourceKey: string
  sourceReadingDigest: string
  matches: readonly { medicineSlug: string; path: string }[]
}

export interface AgentLiveDecisionContext {
  schema: typeof AGENT_LIVE_DECISION_CONTEXT_SCHEMA
  digest: string
  candidateKey: string
  occurrenceKey: string
  evidenceDigest: string
  subjectId: string
  fieldPath: string
  storedField: AgentLiveStoredField
  relevantMedicineSlugs: readonly string[]
  missingMedicineSlugs: readonly string[]
  sourceBindings: readonly AgentLiveSourceBinding[]
  allSourcesBound: boolean
}

type PathToken = { kind: 'property'; value: string } | { kind: 'selector'; value: string | number }

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function own(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key)
}

function parseFieldPath(fieldPath: string): PathToken[] | null {
  const input = fieldPath.startsWith('recordedBackground.')
    ? fieldPath.slice('recordedBackground.'.length)
    : fieldPath
  if (!input) return null

  const tokens: PathToken[] = []
  let index = 0
  while (index < input.length) {
    const propertyStart = index
    while (index < input.length && input[index] !== '.' && input[index] !== '[') index += 1
    const property = input.slice(propertyStart, index)
    if (!property || ['__proto__', 'prototype', 'constructor'].includes(property)) return null
    tokens.push({ kind: 'property', value: property })

    while (input[index] === '[') {
      const selectorStart = index + 1
      index += 1
      let inString = false
      let escaped = false
      while (index < input.length) {
        const character = input[index]!
        if (escaped) escaped = false
        else if (character === '\\' && inString) escaped = true
        else if (character === '"') inString = !inString
        else if (character === ']' && !inString) break
        index += 1
      }
      if (index >= input.length || input[index] !== ']') return null
      const encoded = input.slice(selectorStart, index)
      index += 1
      let selector: unknown
      try {
        selector = JSON.parse(encoded)
      } catch {
        return null
      }
      if (
        (typeof selector !== 'string' &&
          !(typeof selector === 'number' && Number.isInteger(selector) && selector >= 0)) ||
        (typeof selector === 'string' &&
          ['__proto__', 'prototype', 'constructor'].includes(selector))
      ) {
        return null
      }
      tokens.push({ kind: 'selector', value: selector })
    }

    if (index === input.length) break
    if (input[index] !== '.') return null
    index += 1
    if (index === input.length) return null
  }
  return tokens
}

/**
 * Resolves only literal JSON structure. Detector-only semantic paths deliberately resolve absent
 * instead of being populated from the detector observation and mislabelled as medicine data.
 */
export function resolveAgentStoredField(
  recordedBackground: MedicineRecordedBackground | null,
  fieldPath: string,
): { state: 'present'; value: unknown } | { state: 'absent' } {
  if (!recordedBackground) return { state: 'absent' }
  const tokens = parseFieldPath(fieldPath)
  if (!tokens) return { state: 'absent' }

  let current: unknown = recordedBackground
  for (const token of tokens) {
    if (token.kind === 'property') {
      if (!current || typeof current !== 'object' || Array.isArray(current)) {
        return { state: 'absent' }
      }
      const record = current as Record<string, unknown>
      if (!own(record, token.value)) return { state: 'absent' }
      current = record[token.value]
      continue
    }

    if (Array.isArray(current)) {
      if (typeof token.value === 'number') {
        if (token.value >= current.length) return { state: 'absent' }
        current = current[token.value]
        continue
      }
      const matched = current.find((value) => value === token.value)
      if (matched === undefined) return { state: 'absent' }
      current = matched
      continue
    }
    if (
      typeof token.value === 'string' &&
      current &&
      typeof current === 'object' &&
      own(current as Record<string, unknown>, token.value)
    ) {
      current = (current as Record<string, unknown>)[token.value]
      continue
    }
    return { state: 'absent' }
  }
  return { state: 'present', value: current }
}

export function agentLiveDecisionRelevantMedicineSlugs(
  subjectId: string,
  evidence: Record<string, unknown>,
): string[] {
  const slugs = new Set([subjectId])

  function visit(value: unknown): void {
    if (Array.isArray(value)) {
      for (const child of value) visit(child)
      return
    }
    if (!value || typeof value !== 'object') return
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (key === 'slug' && typeof child === 'string' && child.trim()) slugs.add(child)
      else visit(child)
    }
  }

  visit(evidence.observation)
  return [...slugs].sort(compareText)
}

function evidenceSourceReadings(evidence: Record<string, unknown>): ReviewEvidenceSource[] {
  if (!Array.isArray(evidence.sourceReadings)) return []
  return evidence.sourceReadings.flatMap((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return []
    const source = value as Partial<ReviewEvidenceSource>
    if (
      typeof source.sourceKey !== 'string' ||
      typeof source.kind !== 'string' ||
      typeof source.identifier !== 'string' ||
      typeof source.label !== 'string' ||
      typeof source.retrievedAt !== 'string'
    ) {
      return []
    }
    return [source as ReviewEvidenceSource]
  })
}

function childPath(parent: string, key: string): string {
  return /^[A-Za-z_][A-Za-z0-9_]*$/u.test(key)
    ? `${parent}.${key}`
    : `${parent}[${JSON.stringify(key)}]`
}

function sourceBindingDigest(source: ReviewEvidenceSource): string {
  return valueDigest({
    kind: source.kind,
    identifier: canonicalBackgroundSourceIdentifier(source.kind, source.identifier),
    label: source.label,
    ...(source.locator ? { locator: source.locator } : {}),
    ...(source.version ? { version: source.version } : {}),
    ...(source.effectiveDate ? { effectiveDate: source.effectiveDate } : {}),
    retrievedAt: source.retrievedAt,
    ...(source.excerpt ? { excerpt: source.excerpt } : {}),
  })
}

function liveSourceLocations(
  medicines: readonly LiveMedicineBackground[],
): Map<string, Array<{ medicineSlug: string; path: string }>> {
  const byDigest = new Map<string, Array<{ medicineSlug: string; path: string }>>()

  function visit(medicineSlug: string, value: unknown, path: string): void {
    if (!value || typeof value !== 'object') return
    if (!Array.isArray(value)) {
      const candidate = value as Record<string, unknown>
      if (
        typeof candidate.kind === 'string' &&
        typeof candidate.identifier === 'string' &&
        typeof candidate.label === 'string' &&
        typeof candidate.retrievedAt === 'string'
      ) {
        const digest = sourceBindingDigest(
          reviewEvidenceSource(candidate as unknown as BackgroundSource),
        )
        byDigest.set(digest, [...(byDigest.get(digest) ?? []), { medicineSlug, path }])
        return
      }
    }
    if (Array.isArray(value)) {
      value.forEach((child, index) => visit(medicineSlug, child, `${path}[${index}]`))
      return
    }
    for (const key of Object.keys(value as Record<string, unknown>).sort(compareText)) {
      visit(medicineSlug, (value as Record<string, unknown>)[key], childPath(path, key))
    }
  }

  for (const medicine of medicines) {
    if (medicine.recordedBackground) {
      visit(medicine.slug, medicine.recordedBackground, 'recordedBackground')
    }
  }
  for (const matches of byDigest.values()) {
    matches.sort(
      (left, right) =>
        compareText(left.medicineSlug, right.medicineSlug) || compareText(left.path, right.path),
    )
  }
  return byDigest
}

export function buildAgentLiveDecisionContext(input: {
  candidateKey: string
  occurrenceKey: string
  evidenceDigest: string
  subjectId: string
  fieldPath: string
  evidence: Record<string, unknown>
  medicines: readonly LiveMedicineBackground[]
}): AgentLiveDecisionContext {
  const relevantMedicineSlugs = agentLiveDecisionRelevantMedicineSlugs(
    input.subjectId,
    input.evidence,
  )
  const medicineBySlug = new Map(input.medicines.map((medicine) => [medicine.slug, medicine]))
  const relevantMedicines = relevantMedicineSlugs.flatMap((slug) => {
    const medicine = medicineBySlug.get(slug)
    return medicine ? [medicine] : []
  })
  const missingMedicineSlugs = relevantMedicineSlugs.filter((slug) => !medicineBySlug.has(slug))
  const primaryBackground = medicineBySlug.get(input.subjectId)?.recordedBackground ?? null
  const resolved = resolveAgentStoredField(primaryBackground, input.fieldPath)
  const storedField: AgentLiveStoredField =
    resolved.state === 'present'
      ? {
          state: 'present',
          value: resolved.value,
          valueDigest: valueDigest({ state: 'present', value: resolved.value }),
          guardScope: 'exact_field_and_sources',
        }
      : {
          state: 'absent',
          value: null,
          valueDigest: valueDigest({ state: 'absent' }),
          guardScope: 'relevant_medicine_backgrounds_and_sources',
        }

  const locations = liveSourceLocations(relevantMedicines)
  const sourceBindings = evidenceSourceReadings(input.evidence)
    .map((source): AgentLiveSourceBinding => {
      const sourceReadingDigest = valueDigest(source)
      return {
        sourceKey: source.sourceKey,
        sourceReadingDigest,
        matches: locations.get(sourceBindingDigest(source)) ?? [],
      }
    })
    .sort(
      (left, right) =>
        compareText(left.sourceReadingDigest, right.sourceReadingDigest) ||
        compareText(left.sourceKey, right.sourceKey),
    )
  const allSourcesBound =
    sourceBindings.length > 0 && sourceBindings.every((binding) => binding.matches.length > 0)

  const publicContext = {
    schema: AGENT_LIVE_DECISION_CONTEXT_SCHEMA,
    candidateKey: input.candidateKey,
    occurrenceKey: input.occurrenceKey,
    evidenceDigest: input.evidenceDigest,
    subjectId: input.subjectId,
    fieldPath: input.fieldPath,
    storedField,
    relevantMedicineSlugs,
    missingMedicineSlugs,
    sourceBindings,
    allSourcesBound,
  }
  const digestMaterial = {
    ...publicContext,
    // A semantic/absent detector path has no literal value to hash. In that case the relevant
    // complete envelopes are the conservative guard that makes a newly recorded value or module
    // invalidate the browser snapshot without pretending the detector observation was stored data.
    ...(storedField.state === 'absent'
      ? {
          absentPathBackgroundDigests: relevantMedicineSlugs.map((slug) => ({
            slug,
            digest: medicineBySlug.get(slug)?.recordedBackground
              ? valueDigest(medicineBySlug.get(slug)!.recordedBackground)
              : null,
          })),
        }
      : {}),
  }
  const digest = valueDigest(digestMaterial)
  return { ...publicContext, digest }
}

export function agentLiveDecisionBaselineDigest(
  rankingFeatures: Record<string, unknown>,
): string | null {
  const digest = rankingFeatures.liveDecisionContextDigest
  return typeof digest === 'string' && /^[0-9a-f]{64}$/u.test(digest) ? digest : null
}
