export type SourceIdentifierKind =
  'NCT' | 'DOI' | 'PMID' | 'REGULATORY_APPLICATION' | 'PRODUCT_LABEL' | 'OTHER'

export interface SourceIdentifier {
  kind: SourceIdentifierKind
  value: string
}

export interface SourceSnapshot {
  adapterKey: string
  identifier: SourceIdentifier
  canonicalLocator: string
  retrievedAt: string
  contentHash: string
  payload: unknown
}

export type NormalizedFactRisk = 'LOW_RISK_EXACT' | 'INTERPRETIVE_REVIEW_REQUIRED'

export interface NormalizedFact {
  path: string
  value: string | number | boolean | null
  risk: NormalizedFactRisk
  sourceIdentifier: SourceIdentifier
}

export interface SourceFieldChange {
  path: string
  before: NormalizedFact['value']
  after: NormalizedFact['value']
  risk: NormalizedFactRisk
}

export interface SourceDiff {
  changed: boolean
  previousHash?: string
  currentHash: string
  changes: SourceFieldChange[]
}

/** Structured adapter failure so monitor state never has to infer availability from prose. */
export class EvidenceSourceFetchError extends Error {
  readonly code: string
  readonly retryable: boolean
  readonly sourceUnavailable: boolean

  constructor(
    message: string,
    options: {
      code: string
      retryable: boolean
      sourceUnavailable?: boolean
      cause?: unknown
    },
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause })
    this.name = 'EvidenceSourceFetchError'
    this.code = options.code
    this.retryable = options.retryable
    this.sourceUnavailable = options.sourceUnavailable ?? false
  }
}

/**
 * Provider-neutral monitoring seam. Adapters fetch official structured records and normalize
 * exact fields; claim interpretation, evidence-node state and verdict review happen downstream.
 */
export interface EvidenceSourceAdapter {
  readonly key: string
  supports(identifier: SourceIdentifier): boolean
  fetch(identifier: SourceIdentifier): Promise<SourceSnapshot>
  normalize(snapshot: SourceSnapshot): Promise<NormalizedFact[]>
  diff(previous: SourceSnapshot | null, current: SourceSnapshot): Promise<SourceDiff>
}

function factMap(facts: readonly NormalizedFact[]): Map<string, NormalizedFact> {
  return new Map(facts.map((fact) => [fact.path, fact]))
}

/** Deterministic field-level diff used by adapters after normalization. */
export function diffNormalizedFacts(
  previous: readonly NormalizedFact[],
  current: readonly NormalizedFact[],
  previousHash: string | undefined,
  currentHash: string,
): SourceDiff {
  const before = factMap(previous)
  const after = factMap(current)
  const paths = [...new Set([...before.keys(), ...after.keys()])].sort()
  const changes: SourceFieldChange[] = []

  for (const path of paths) {
    const oldFact = before.get(path)
    const newFact = after.get(path)
    const oldValue = oldFact?.value ?? null
    const newValue = newFact?.value ?? null
    if (oldValue === newValue) continue
    changes.push({
      path,
      before: oldValue,
      after: newValue,
      risk: newFact?.risk ?? oldFact?.risk ?? 'INTERPRETIVE_REVIEW_REQUIRED',
    })
  }

  return {
    changed: changes.length > 0,
    previousHash,
    currentHash,
    changes,
  }
}
