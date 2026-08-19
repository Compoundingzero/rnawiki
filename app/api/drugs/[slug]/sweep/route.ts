// POST /api/drugs/:slug/sweep — run the deterministic engine WITHOUT saving anything.
//
// This is the editor's live diagnostics panel. It writes nothing, decides nothing and grants
// nothing: the report it returns is advice for the person typing. The verdict that matters is the
// one `POST /api/drugs/:slug/revisions` computes for itself, server-side, on submission — a report
// produced here can never be handed back as evidence that an edit passed.
//
// It runs on the server rather than in the browser (where the wireframe ran it) so a contributor
// on a phone gets the same answer as the submission path, from the same code, with the same
// Turner 2004 parameter set.

import { z } from 'zod'
import { getDrugIdBySlug } from '@/lib/queries/drugs'
import { runFullDeterministicSweep } from '@/lib/rna-intelligence'
import { requireUser } from '@/lib/session'
import { WRITE } from '@/lib/rate-limit'
import { ApiError, ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import {
  DRUG_MODALITIES,
  PROTOCOL_PHASES,
  type DrugModality,
  type ProtocolPhase,
} from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SlugContext {
  /** Next.js 15: route params are a Promise and must be awaited. */
  params: Promise<{ slug: string }>
}

/**
 * Longest structure string accepted. Layer 2 already declines to fold beyond 1000 nt and warns
 * instead, but Layer 1 walks every character, so an unbounded field is an unbounded parse. 50,000
 * is roughly twelve times the length of the longest approved mRNA construct — generous enough that
 * no real submission meets it, small enough that a paste of a genome does.
 */
const MAX_STRUCTURE_LENGTH = 50_000

/** A protocol longer than this is not a protocol; Layer 3's graph work is quadratic in the edges. */
const MAX_WORKFLOW_STEPS = 60

// `z.enum` needs a non-empty tuple; the vocabularies in lib/types.ts are arrays of the same
// literals as the unions, so the cast adds no risk.
const modalityValues = DRUG_MODALITIES as [DrugModality, ...DrugModality[]]
const phaseValues = PROTOCOL_PHASES as [ProtocolPhase, ...ProtocolPhase[]]

/**
 * The submission route holds the authoritative copy of this shape (it validates a whole dossier
 * payload). It is restated here rather than imported because a Next.js route module may only
 * export route handlers and segment config — exporting a schema from one route file to another is
 * a build error, not a style choice.
 */
const protocolStepSchema = z.object({
  id: z.string().trim().min(1).max(64),
  stepNumber: z.number().int().min(0).max(999),
  phase: z.enum(phaseValues),
  name: z.string().trim().max(200),
  description: z.string().trim().max(2000),
  dependsOnStepId: z.string().trim().max(64).optional(),
  reagentsAndBuffer: z.string().trim().max(1000),
})

const bodySchema = z.object({
  // Empty is allowed on purpose: the editor calls this on every keystroke, including the one that
  // clears the field, and the honest answer to "validate nothing" is the engine's own
  // L1_STRUCTURE_EMPTY diagnostic — not a 422 that blanks the panel.
  structureString: z.string().max(MAX_STRUCTURE_LENGTH),
  modality: z.enum(modalityValues),
  workflow: z.array(protocolStepSchema).max(MAX_WORKFLOW_STEPS),
  cdnaMode: z.boolean().optional(),
})

export const POST = withHandler(async (req: Request, ctx: SlugContext) => {
  const { slug } = await ctx.params

  // Authenticated because this is compute, not content: an anonymous caller could otherwise use
  // the O(n^3) fold as a free CPU budget. It is the WRITE bucket for the same reason, even though
  // nothing is written.
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  const body = bodySchema.parse(await readJson(req))

  // The route is addressed by slug, so a slug that names nothing is a 404 even though the sweep
  // itself never reads the record.
  const drugId = await getDrugIdBySlug(slug)
  if (!drugId) throw new ApiError(404, 'No dossier with that slug', 'not_found')

  const report = runFullDeterministicSweep({
    structureString: body.structureString,
    modality: body.modality,
    workflow: body.workflow,
    cdnaMode: body.cdnaMode ?? false,
  })

  return ok({ report })
})
