const TITLE_LIMIT = 64
const DESCRIPTION_LIMIT = 158

function compact(value: string | null | undefined): string {
  return value?.replace(/\s+/g, ' ').trim() ?? ''
}

function truncate(value: string, limit: number): string {
  const normalized = compact(value)
  if (normalized.length <= limit) return normalized

  const candidate = normalized.slice(0, Math.max(1, limit - 1))
  const boundary = candidate.lastIndexOf(' ')
  const safe = boundary >= Math.floor(limit * 0.65) ? candidate.slice(0, boundary) : candidate
  return `${safe.replace(/[\s,;:–—-]+$/u, '')}…`
}

/** Page title without the site-name suffix supplied by app/layout.tsx. */
export function dossierMetadataTitle(name: string): string {
  const entity = compact(name) || 'Medicine'
  const intent = ': Evidence, Trial Results & What Remains Unknown'
  return `${truncate(entity, TITLE_LIMIT - intent.length)}${intent}`
}

export interface DossierMetadataDescriptionInput {
  name: string
  reviewed: boolean
  /** Exact authored legacy answer still bound to its approved v2 evidence fingerprint. */
  provenanceBoundLegacy?: boolean
  usedFor?: string
  finding?: string
  limitation?: string
}

/**
 * Deterministic description made only from the visible first-read answer. Programme answers must
 * be reviewed publications; a finite flagship legacy answer may enter only through its exact v2
 * evidence fingerprint. Dosage, acquisition, protocol and community text are absent from the
 * input type, so callers cannot accidentally promote them into a search snippet.
 */
export function dossierMetadataDescription(input: DossierMetadataDescriptionInput): string {
  const name = compact(input.name) || 'This medicine'
  if (!input.reviewed && !input.provenanceBoundLegacy) {
    return truncate(
      `${name} medicine record. No reviewed conclusion for a specific use and group of people is published on this page yet.`,
      DESCRIPTION_LIMIT,
    )
  }

  const sentences = [
    compact(input.usedFor) ? `${name}: ${compact(input.usedFor)}` : name,
    compact(input.finding),
    compact(input.limitation) ? `Main limitation: ${compact(input.limitation)}` : '',
  ].filter(Boolean)
  return truncate(sentences.join('. ').replace(/\.\./g, '.'), DESCRIPTION_LIMIT)
}

export const HOME_METADATA = {
  title: 'Medicine Evidence & Clinical Trial Results, Explained',
  description:
    'Source-linked medicine evidence in plain English: what researchers measured, what studies found, and what remains unknown.',
} as const
