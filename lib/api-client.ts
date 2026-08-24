// Typed fetch helpers for the client components. One place that knows the routes in
// docs/api-contract.md, so a route rename is one edit rather than a hunt through JSX.

import type {
  CommentUser,
  CommunityNote,
  DrugDossier,
  DrugModality,
  LegacyIdentityCorrectionField,
  Revision,
} from '@/lib/types'
import type { PublicSearchSummaryBinding } from '@/lib/queries/public-search-hit-projection'
import type {
  DossierAccessMetadata,
  LegacyMedicineEvidenceBoundary,
  ProgrammeScopedMedicineIdentity,
} from '@/lib/dossier-read-serializer'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'

export interface SearchHit {
  slug: string
  name: string
  tradeName?: string | null
  modality: DrugModality
  approvalStatus: string
  patientFriendlyIndication: string
  dossierDepth: 'stub' | 'curated' | 'flagship'
  summaryBinding?: PublicSearchSummaryBinding
  summaryContext?: string | null
}

/** Open the programme that supplied a compact summary instead of losing its scope on click. */
export function searchHitHref(hit: Pick<SearchHit, 'slug' | 'summaryBinding'>): string {
  const programmeSlug = hit.summaryBinding?.programmeSlug
  return programmeSlug
    ? `/d/${encodeURIComponent(hit.slug)}?programme=${encodeURIComponent(programmeSlug)}`
    : `/d/${encodeURIComponent(hit.slug)}`
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  // A 204 has no body; parsing it throws and the caller gets a misleading network error.
  const text = await res.text()
  const body: unknown = text ? JSON.parse(text) : {}

  if (!res.ok) {
    const err = body as { error?: string; details?: unknown }
    throw new ApiError(err.error ?? `Request failed (${res.status})`, res.status, err.details)
  }
  return body as T
}

export const api = {
  search: (q: string, limit = 10) =>
    request<{ results: SearchHit[] }>(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  getDrug: (slug: string) =>
    request<{
      drug: DrugDossier | ProgrammeScopedMedicineIdentity
      access: DossierAccessMetadata
      programmeDossier: MedicineDossierViewModel | null
      evidenceAuthority:
        | {
            scope: 'programme'
            authoritativeObject: 'programmeDossier'
            selectedProgrammeId: string
          }
        | { scope: 'legacy_medicine_record'; authoritativeObject: 'drug' }
      legacyMedicineRecord: LegacyMedicineEvidenceBoundary | null
    }>(`/api/drugs/${encodeURIComponent(slug)}`),

  register: (
    body: {
      name: string
      email: string
      password: string
      handle?: string
      orcid?: string
    },
    signal?: AbortSignal,
  ) =>
    request<{ user: CommentUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
    }),

  login: (body: { email: string; password: string }, signal?: AbortSignal) =>
    request<{ user: CommentUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
    }),

  logout: (signal?: AbortSignal) =>
    request<{ ok: true }>('/api/auth/logout', { method: 'POST', signal }),

  me: () => request<{ user: CommentUser | null }>('/api/auth/me'),

  submitDoctorVerification: (
    body: {
      fullName: string
      licenseOrNpi: string
      specialty: string
      institution: string
      workEmail: string
    },
    signal?: AbortSignal,
  ) =>
    request<{ user: CommentUser; state: 'pending' }>('/api/auth/doctor-verification', {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
    }),

  addNote: (slug: string, content: string, signal?: AbortSignal) =>
    request<{ note: CommunityNote }>(`/api/drugs/${encodeURIComponent(slug)}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
      signal,
    }),

  toggleUpvote: (noteId: string, signal?: AbortSignal) =>
    request<{ upvotes: number; hasUpvoted: boolean }>(
      `/api/notes/${encodeURIComponent(noteId)}/upvote`,
      { method: 'POST', signal },
    ),

  submitRevision: (
    slug: string,
    body: {
      field: LegacyIdentityCorrectionField
      proposedValue: string | null
      sourceUrl: string
      sourceTitle: string
      explanation: string
    },
    signal?: AbortSignal,
  ) =>
    request<{
      outcome: 'pending_review'
      revisionId: string
      itemsWaiting: number
      revision: Revision
    }>(`/api/drugs/${encodeURIComponent(slug)}/revisions`, {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
    }),

  sendFeedback: (
    body: {
      type: 'suggestion' | 'correction' | 'request'
      message: string
      email?: string
      drugSlug?: string
    },
    signal?: AbortSignal,
  ) =>
    request<{ ok: true }>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
    }),

  toggleSaved: (slug: string, signal?: AbortSignal) =>
    request<{ saved: boolean }>(`/api/drugs/${encodeURIComponent(slug)}/save`, {
      method: 'POST',
      signal,
    }),

  savedDrugs: (signal?: AbortSignal) =>
    request<{ drugs: SearchHit[] }>('/api/me/saved', { signal, cache: 'no-store' }),

  communityNotes: async (slug: string, signal?: AbortSignal) => {
    const result = await request<{
      drug: DrugDossier | ProgrammeScopedMedicineIdentity
      programmeDossier: MedicineDossierViewModel | null
      legacyMedicineRecord: LegacyMedicineEvidenceBoundary | null
    }>(`/api/drugs/${encodeURIComponent(slug)}`, { signal, cache: 'no-store' })
    const identityNotes =
      'communityNotes' in result.drug && Array.isArray(result.drug.communityNotes)
        ? result.drug.communityNotes
        : undefined
    return {
      notes:
        result.programmeDossier?.medicineRecord.communityNotes ??
        identityNotes ??
        result.legacyMedicineRecord?.fields.communityNotes ??
        [],
    }
  },

  reviewRevision: (
    id: string,
    decision: 'approve' | 'reject',
    note?: string,
    signal?: AbortSignal,
  ) =>
    request<{ revision: unknown }>(`/api/revisions/${encodeURIComponent(id)}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, note }),
      signal,
    }),
}
