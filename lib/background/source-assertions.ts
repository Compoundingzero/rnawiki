import { createHash } from 'node:crypto'

import { numbersIn, statesNumber } from '@/lib/background/printed-numbers'
import {
  BACKGROUND_SOURCE_KINDS,
  type BackgroundSource,
  type BackgroundSourceKind,
  type MedicineRecordedBackground,
  type RecordedBackgroundModule,
} from '@/lib/background/types'
import type { DossierQuestionIntent } from '@/lib/dossier-question-registry'
import { stableJsonStringify } from '@/lib/stable-json'

export const BACKGROUND_SOURCE_BINDING_SCHEMA = 'background-source-binding/v1' as const

export const SOURCE_ASSERTION_RESULTS = ['CURRENT', 'NUMBERS_CURRENT', 'DRIFTED'] as const
export type SourceAssertionResult = (typeof SOURCE_ASSERTION_RESULTS)[number]

export interface BackgroundSourceIdentity {
  kind: BackgroundSourceKind
  /** The kind-specific identifier after conservative case and whitespace canonicalization. */
  identifier: string
}

/**
 * One exact recorded assertion tied to the exact source excerpt that was used to author it.
 *
 * `fieldPath` names the whole assertion supported by the source. `sourcePath` names the
 * BackgroundSource object itself. They differ for values such as a consensus reading, where the
 * assertion has several sources. A check may only transfer to this binding while every
 * content-addressed part remains the same.
 */
export interface BackgroundSourceAssertionBinding {
  schema: typeof BACKGROUND_SOURCE_BINDING_SCHEMA
  bindingId: string
  slug: string
  fieldPath: string
  sourcePath: string
  sourceIdentity: BackgroundSourceIdentity
  /** A fetch-deduplication key. It is not an assertion identity. */
  sourceKey: string
  /** Display metadata copied from the exact bound BackgroundSource, never re-read from a mutable row. */
  sourceLabel: string
  sourceLocator?: string
  retrievedAt: string
  excerpt: string
  /** SHA-256 of the complete assertion object, including all of its recorded values and sources. */
  assertionDigest: string
  /** Absent means the path has no explicit reader-question mapping and therefore cannot mark one stale. */
  questionIntent?: DossierQuestionIntent
}

/** Only a successful fetch of this exact source is eligible for assertion evaluation. */
export interface SuccessfulSourceFetch {
  status: 'SUCCEEDED'
  sourceKey: string
  text: string
}

const SOURCE_KIND_SET: ReadonlySet<string> = new Set(BACKGROUND_SOURCE_KINDS)

const LOWERCASE_IDENTIFIERS: ReadonlySet<BackgroundSourceKind> = new Set(['FDA_LABEL', 'DAILYMED'])

const UPPERCASE_IDENTIFIERS: ReadonlySet<BackgroundSourceKind> = new Set([
  'CLINICALTRIALS',
  'FDA_UNII',
])

/**
 * Canonicalizes only conventions that are part of the registry identity. It deliberately does not
 * guess that every identifier is case-insensitive: DOI-like and vendor identifiers can have their
 * own rules, and collapsing them without a kind-specific contract could merge different sources.
 */
export function canonicalBackgroundSourceIdentifier(
  kind: BackgroundSourceKind,
  identifier: string,
): string {
  const normalized = identifier.trim().normalize('NFC')
  if (LOWERCASE_IDENTIFIERS.has(kind)) return normalized.toLowerCase()
  if (UPPERCASE_IDENTIFIERS.has(kind)) return normalized.toUpperCase()
  return normalized
}

/** Stable, kind-namespaced identity used to fetch one artifact for all of its bound assertions. */
export function canonicalBackgroundSourceKey(
  source: Pick<BackgroundSource, 'kind' | 'identifier'>,
): string {
  return `${source.kind}:${canonicalBackgroundSourceIdentifier(source.kind, source.identifier)}`
}

/**
 * Every declared top-level module is mapped deliberately. `null` is also deliberate: the current
 * dossier has no reader question to which a price-source drift can be attached. Unknown paths fail
 * closed in the same way rather than inheriting a broad default.
 */
const TOP_LEVEL_QUESTION_INTENTS = {
  pharmacokinetics: 'measurement',
  titration: 'evidence-scope',
  productVariants: 'regulatory-status',
  costContext: null,
  anatomyTargets: 'mechanism',
  applicability: 'applicability',
  pivotalResults: 'results-magnitude',
  registryIdentifiers: 'identity',
  mechanism: 'mechanism',
  molecularIdentity: 'identity',
  interactionSignals: 'mechanism',
  safety: 'harms',
  populationStatements: 'applicability',
  commonAdverseReactions: 'harms',
  recordedUses: 'purpose',
  sourceConsensus: 'measurement',
  composition: 'identity',
  supplementMarket: 'regulatory-status',
  labelPresence: 'regulatory-status',
  biologicalIdentity: 'identity',
  productListing: 'regulatory-status',
  regulatoryApproval: 'regulatory-status',
  supplementIngredient: 'identity',
  sourceMaterial: 'identity',
  nameFamily: 'identity',
} as const satisfies Record<RecordedBackgroundModule, DossierQuestionIntent | null>

/**
 * An ingredient embeds substance modules below `composition`; those modules answer their own
 * questions, not the composition/identity question. Keep the overrides explicit so a new nested
 * module remains unmapped until someone chooses its reader meaning.
 */
const COMPOSITION_QUESTION_OVERRIDES: ReadonlyArray<{
  pattern: RegExp
  intent: DossierQuestionIntent
}> = [
  {
    pattern: /^composition\.ingredients\[\d+\]\.supplementMarket(?:\.|\[|$)/u,
    intent: 'regulatory-status',
  },
  {
    pattern: /^composition\.ingredients\[\d+\]\.labelPresence(?:\.|\[|$)/u,
    intent: 'regulatory-status',
  },
  {
    pattern: /^composition\.ingredients\[\d+\]\.recordedUses(?:\.|\[|$)/u,
    intent: 'purpose',
  },
  {
    pattern: /^composition\.ingredients\[\d+\]\.mechanism(?:\.|\[|$)/u,
    intent: 'mechanism',
  },
  {
    pattern: /^composition\.ingredients\[\d+\]\.pharmacokinetics(?:\.|\[|$)/u,
    intent: 'measurement',
  },
  {
    pattern: /^composition\.ingredients\[\d+\]\.molecularIdentity(?:\.|\[|$)/u,
    intent: 'identity',
  },
  {
    pattern: /^composition\.ingredients\[\d+\]\.interactionSignals(?:\.|\[|$)/u,
    intent: 'mechanism',
  },
]

/** Returns no intent for an unknown path; an unbound path must never make a question stale. */
export function questionIntentForBackgroundPath(
  fieldOrSourcePath: string,
): DossierQuestionIntent | undefined {
  for (const override of COMPOSITION_QUESTION_OVERRIDES) {
    if (override.pattern.test(fieldOrSourcePath)) return override.intent
  }

  const topLevel = fieldOrSourcePath.match(/^([A-Za-z][A-Za-z0-9]*)(?:\.|\[|$)/u)?.[1]
  if (!topLevel || !(topLevel in TOP_LEVEL_QUESTION_INTENTS)) return undefined
  return (
    TOP_LEVEL_QUESTION_INTENTS[topLevel as keyof typeof TOP_LEVEL_QUESTION_INTENTS] ?? undefined
  )
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function digest(value: unknown): string {
  return `sha256:${sha256(stableJsonStringify(value))}`
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isExcerptBearingSource(value: unknown): value is BackgroundSource & { excerpt: string } {
  if (!isObject(value)) return false
  return (
    typeof value.kind === 'string' &&
    SOURCE_KIND_SET.has(value.kind) &&
    typeof value.identifier === 'string' &&
    typeof value.label === 'string' &&
    typeof value.retrievedAt === 'string' &&
    typeof value.excerpt === 'string' &&
    value.excerpt.trim().length > 0
  )
}

function objectChildPath(parentPath: string, key: string): string {
  const segment = /^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(key) ? key : `[${JSON.stringify(key)}]`
  if (!parentPath) return segment
  return segment.startsWith('[') ? `${parentPath}${segment}` : `${parentPath}.${segment}`
}

interface TraversalFrame {
  value: unknown[] | Record<string, unknown>
  path: string
}

/**
 * Traverses the envelope structurally rather than enumerating a subset of modules. Object keys are
 * sorted for reproducible output; array order is preserved because indexes are part of the exact
 * persisted path. Reusing the same source object in two fields intentionally yields two bindings.
 */
export function collectBackgroundSourceAssertionBindings(
  slug: string,
  background: MedicineRecordedBackground,
): BackgroundSourceAssertionBinding[] {
  if (!slug.trim()) throw new TypeError('A non-empty medicine slug is required')

  const byBindingId = new Map<string, BackgroundSourceAssertionBinding>()

  const visit = (value: unknown, path: string, ancestors: readonly TraversalFrame[]): void => {
    if (isExcerptBearingSource(value)) {
      const assertionFrame = [...ancestors].reverse().find((frame) => !Array.isArray(frame.value))
      if (!assertionFrame || !assertionFrame.path) return

      const sourceIdentity: BackgroundSourceIdentity = {
        kind: value.kind,
        identifier: canonicalBackgroundSourceIdentifier(value.kind, value.identifier),
      }
      const sourceKey = canonicalBackgroundSourceKey(value)
      const assertionDigest = digest(assertionFrame.value)
      const questionIntent = questionIntentForBackgroundPath(assertionFrame.path)
      const identity = {
        schema: BACKGROUND_SOURCE_BINDING_SCHEMA,
        slug,
        fieldPath: assertionFrame.path,
        sourcePath: path,
        sourceIdentity,
        sourceKey,
        sourceLabel: value.label,
        sourceLocator: value.locator ?? null,
        retrievedAt: value.retrievedAt,
        excerpt: value.excerpt,
        assertionDigest,
        questionIntent: questionIntent ?? null,
      }
      const bindingId = `background_binding_${sha256(stableJsonStringify(identity))}`

      byBindingId.set(bindingId, {
        ...identity,
        sourceLocator: value.locator ?? undefined,
        questionIntent: questionIntent ?? undefined,
        bindingId,
      })
      return
    }

    if (Array.isArray(value)) {
      const frame: TraversalFrame = { value, path }
      value.forEach((child, index) => visit(child, `${path}[${index}]`, [...ancestors, frame]))
      return
    }

    if (isObject(value)) {
      const frame: TraversalFrame = { value, path }
      for (const key of Object.keys(value).sort()) {
        visit(value[key], objectChildPath(path, key), [...ancestors, frame])
      }
    }
  }

  visit(background, '', [])

  return [...byBindingId.values()].sort(
    (left, right) =>
      left.sourcePath.localeCompare(right.sourcePath) ||
      left.sourceKey.localeCompare(right.sourceKey) ||
      left.bindingId.localeCompare(right.bindingId),
  )
}

/**
 * Extracts decoded JSON string values and excludes property names and escaped wire bytes. Sorting
 * object keys makes equivalent JSON objects yield the same comparison text; array order remains
 * meaningful. A caller should pass the returned text to the ordinary assertion evaluator.
 */
export function extractTextFromJsonStrings(serializedJson: string): string {
  let parsed: unknown
  try {
    parsed = JSON.parse(serializedJson) as unknown
  } catch {
    throw new TypeError('Source response is not valid JSON')
  }

  const strings: string[] = []
  const visit = (value: unknown): void => {
    if (typeof value === 'string') {
      strings.push(value)
      return
    }
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (isObject(value)) {
      Object.keys(value)
        .sort()
        .forEach((key) => visit(value[key]))
    }
  }
  visit(parsed)
  return strings.join('\n')
}

function normalizeSourceText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s ]+/gu, ' ')
    .replace(/,(?=\d{3}\b)/gu, '')
    .replace(/[•●▪]/gu, ' ')
    .replace(/ +/gu, ' ')
    .trim()
}

/**
 * Evaluates only a successful response for the exact bound source. Fetch failures and source-key
 * mismatches throw instead of being converted to DRIFTED, so operational failure can never mark a
 * reader question stale or create a medical review candidate.
 */
export function evaluateBackgroundSourceAssertion(
  binding: Pick<BackgroundSourceAssertionBinding, 'excerpt' | 'sourceKey'>,
  fetch: SuccessfulSourceFetch,
): SourceAssertionResult {
  if (
    !fetch ||
    fetch.status !== 'SUCCEEDED' ||
    fetch.sourceKey !== binding.sourceKey ||
    typeof fetch.text !== 'string' ||
    !fetch.text.trim()
  ) {
    throw new TypeError(
      'Only a non-empty successful fetch of the exact bound source can be checked',
    )
  }
  if (typeof binding.excerpt !== 'string' || !binding.excerpt.trim()) {
    throw new TypeError('A non-empty bound excerpt is required')
  }

  const haystack = normalizeSourceText(fetch.text)
  const excerpt = normalizeSourceText(binding.excerpt)
  if (haystack.includes(excerpt)) return 'CURRENT'

  const expectedNumbers = numbersIn(excerpt)
  if (
    expectedNumbers.length > 0 &&
    expectedNumbers.every((value) => statesNumber(haystack, value))
  ) {
    return 'NUMBERS_CURRENT'
  }
  return 'DRIFTED'
}
