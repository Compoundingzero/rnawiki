/**
 * Deterministic copy policy for generated public medicine records.
 *
 * The public export mixes RNAWiki-authored prose with recorded identity, source excerpts and
 * machine identifiers. Copy rules may inspect the former, but must never turn a product name or a
 * quoted source sentence into an editorial repair. Paths are therefore normalized before policy is
 * applied, and protected paths are rejected before any phrase matching happens.
 */

const CERTIFYING_CLAIM =
  /\b(?:most honest|honest (?:answer|verdict|position|question|headline|state|limit)|saying so plainly|worth stating plainly)\b/i

const PROJECT_PLAIN_STATEMENT =
  /\b(?:this|the)\s+(?:page|file|record|entry|dossier)\s+(?:states?|records?)\b[^.!?\n]{0,80}\bplainly\b/i

const PROJECT_REFERENT =
  /\b(?:RNAWiki|we|(?:this|the)\s+(?:page|file|record|entry|dossier))\b|\bsaying so\b/i

const EXACT_PROTECTED_PATHS = new Set([
  'id',
  'name',
  'tradeName',
  'aliases.*.alias',
  'aliases.*.kind',
  'indication',
  'sourceProvenance.*',
  'substitutes.conventionalRx.*.name',
  'substitutes.naturalFoods.*.name',
  'keyAudits.*.evidenceSource',
  'keyAudits.*.doi',
])

const PROTECTED_PREFIXES = ['recordedBackground.', 'pricing.costSource.', 'pricing.priceSource.']

const PROTECTED_LEAF_KEYS = new Set([
  'alias',
  'brandName',
  'excerpt',
  'genericName',
  'sourceSnapshotId',
  'sourceSnapshotIds',
  'textAsRecorded',
  'tradeName',
])

/** Replace array indexes with `*` so findings and policy entries remain stable across exports. */
export function normalizePublicCopyPath(path) {
  return path.map((part) => (typeof part === 'number' ? '*' : part)).join('.')
}

/** True when a value is recorded identity, source material, attribution, or a machine binding. */
export function isProtectedPublicCopyPath(path) {
  const normalized = normalizePublicCopyPath(path)
  const leaf = path.at(-1)
  if (EXACT_PROTECTED_PATHS.has(normalized)) return true
  if (PROTECTED_PREFIXES.some((prefix) => normalized.startsWith(prefix))) return true
  if (typeof leaf === 'string' && PROTECTED_LEAF_KEYS.has(leaf)) return true

  // Any object explicitly named `source` is attribution/source material, irrespective of the
  // schema module that owns it. This keeps future source shapes protected by default.
  return path.some((part) => part === 'source')
}

/**
 * Split a single stored value into sentence-like segments without requiring final punctuation.
 * Newlines are boundaries too. Values are never concatenated, so a claim phrase in one field
 * cannot combine with a project referent in another.
 */
export function publicCopySegments(value) {
  return value
    .split(/(?:\r?\n)+|(?<=[.!?])\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean)
}

/** A claim is self-certifying only when the claim and RNAWiki referent occur in one segment. */
export function isSelfCertifyingPublicCopy(segment) {
  const claim = CERTIFYING_CLAIM.test(segment) || PROJECT_PLAIN_STATEMENT.test(segment)
  return claim && PROJECT_REFERENT.test(segment)
}

/**
 * Return every self-certifying string in one generated medicine record, with a normalized path.
 * At most one finding is emitted per stored string even if it contains more than one matching
 * segment; the repair target is the value at that path.
 */
export function findPublicCopyFindings(record) {
  const findings = []

  const visit = (value, path) => {
    if (typeof value === 'string') {
      if (isProtectedPublicCopyPath(path)) return
      const segments = publicCopySegments(value).filter(isSelfCertifyingPublicCopy)
      if (segments.length > 0) {
        findings.push({
          recordId: typeof record.id === 'string' ? record.id : '<missing-id>',
          path: normalizePublicCopyPath(path),
          match: segments[0],
          value,
        })
      }
      return
    }

    if (Array.isArray(value)) {
      value.forEach((entry, index) => visit(entry, [...path, index]))
      return
    }

    if (!value || typeof value !== 'object') return
    for (const [key, entry] of Object.entries(value)) visit(entry, [...path, key])
  }

  visit(record, [])
  return findings
}
