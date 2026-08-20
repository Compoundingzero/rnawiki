// Typed fetch helpers for the client components. One place that knows the routes in
// docs/api-contract.md, so a route rename is one edit rather than a hunt through JSX.

import type {
  CommentUser,
  CommunityNote,
  DrugDossier,
  LaboratoryProtocolStep,
  DrugModality,
} from '@/lib/types'
import type { RnaIntelligenceReport } from '@/lib/rna-intelligence/types'

export interface SearchHit {
  slug: string
  name: string
  tradeName?: string | null
  modality: DrugModality
  approvalStatus: string
  patientFriendlyIndication: string
  dossierDepth: 'stub' | 'curated' | 'flagship'
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
    request<{ drug: DrugDossier }>(`/api/drugs/${encodeURIComponent(slug)}`),

  register: (body: {
    name: string
    email: string
    password: string
    handle?: string
    orcid?: string
  }) =>
    request<{ user: CommentUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ user: CommentUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }),

  me: () => request<{ user: CommentUser | null }>('/api/auth/me'),

  submitDoctorVerification: (body: {
    fullName: string
    licenseOrNpi: string
    specialty: string
    institution: string
    workEmail: string
  }) =>
    request<{ user: CommentUser; state: 'pending' }>('/api/auth/doctor-verification', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  addNote: (slug: string, content: string) =>
    request<{ note: CommunityNote }>(`/api/drugs/${encodeURIComponent(slug)}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  toggleUpvote: (noteId: string) =>
    request<{ upvotes: number; hasUpvoted: boolean }>(
      `/api/notes/${encodeURIComponent(noteId)}/upvote`,
      { method: 'POST' },
    ),

  sweep: (
    slug: string,
    body: {
      structureString: string
      modality: DrugModality
      workflow: LaboratoryProtocolStep[]
      cdnaMode?: boolean
    },
  ) =>
    request<{ report: RnaIntelligenceReport }>(`/api/drugs/${encodeURIComponent(slug)}/sweep`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  submitRevision: (slug: string, body: { payload: Partial<DrugDossier>; summary: string }) =>
    request<{
      outcome: 'published' | 'pending_review'
      revisionId: string
      drug?: DrugDossier
      report: RnaIntelligenceReport
      queuePosition?: number
    }>(`/api/drugs/${encodeURIComponent(slug)}/revisions`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  sendFeedback: (body: {
    type: 'suggestion' | 'correction' | 'request'
    message: string
    email?: string
    drugSlug?: string
  }) => request<{ ok: true }>('/api/feedback', { method: 'POST', body: JSON.stringify(body) }),

  toggleSaved: (slug: string) =>
    request<{ saved: boolean }>(`/api/drugs/${encodeURIComponent(slug)}/save`, { method: 'POST' }),

  savedDrugs: () => request<{ drugs: SearchHit[] }>('/api/me/saved'),

  reviewRevision: (id: string, decision: 'approve' | 'reject', note?: string) =>
    request<{ revision: unknown }>(`/api/revisions/${encodeURIComponent(id)}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, note }),
    }),
}
