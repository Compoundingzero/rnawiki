import 'dotenv/config'
import { eq, inArray, notInArray } from 'drizzle-orm'
import { db } from '@/db'
import {
  entities,
  regulatoryStatuses,
  claims,
  mechanismSteps,
  evidenceSources,
  claimEvidence,
  comprehensionQuestions,
  users,
} from '@/db/schema'
import { hashPassword } from '@/lib/auth'
import type { SeedFile } from '@/lib/seed-types'

import bpc157 from './seed-data/bpc-157'
import casgevy from './seed-data/casgevy'
import rapamycin from './seed-data/rapamycin-longevity'

const SEED_FILES: SeedFile[] = [bpc157, casgevy, rapamycin]

async function ensureAdminUser(): Promise<number> {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD
  if (!email || !password) {
    throw new Error(
      'ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD must be set (see .env.example) to seed the first administrator account.'
    )
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
  if (existing) {
    console.log(`[seed] admin user already exists: ${existing.email} (id ${existing.id})`)
    return existing.id
  }

  const [created] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      name: 'Felix',
      passwordHash: await hashPassword(password),
      role: 'administrator',
    })
    .returning({ id: users.id })

  if (!created) throw new Error('Failed to create bootstrap admin user')
  console.log(`[seed] created admin user: ${email} (id ${created.id})`)
  return created.id
}

/** Delete-and-reinsert by slug so this script is safe to re-run while iterating on seed content. */
async function clearExisting(slugs: string[]) {
  await db.delete(entities).where(inArray(entities.slug, slugs))
  // evidenceSources are not entity-scoped by FK, so a cascaded entity delete can orphan them —
  // sweep anything no longer referenced by any claim so re-running this script doesn't
  // accumulate duplicate sources across runs.
  await db.delete(evidenceSources).where(
    notInArray(
      evidenceSources.id,
      db.selectDistinct({ id: claimEvidence.evidenceSourceId }).from(claimEvidence)
    )
  )
}

async function seedEntity(file: SeedFile, adminUserId: number) {
  const { entity, evidenceSources: sources } = file

  const [entityRow] = await db
    .insert(entities)
    .values({
      canonicalName: entity.canonicalName,
      slug: entity.slug,
      aliases: entity.aliases,
      entityType: entity.entityType,
      shortDescription: entity.shortDescription,
      bottomLine: entity.bottomLine,
      regulatoryCategory: entity.regulatoryCategory,
      accessRealityNote: entity.accessRealityNote ?? null,
      // Editorially complete, real, verified content — published so the site is genuinely
      // demonstrable end to end. This does NOT create a `reviews` row, so
      // components/ProofCard.tsx's reviewStatusCopy() correctly keeps showing "Independent
      // scientific review pending" until a real qualified reviewer actually signs off — no
      // review is fabricated by seeding.
      publicationStatus: 'published',
    })
    .returning({ id: entities.id })

  if (!entityRow) throw new Error(`Failed to insert entity ${entity.slug}`)
  const entityId = entityRow.id

  for (const rs of entity.regulatoryStatuses) {
    await db.insert(regulatoryStatuses).values({
      entityId,
      jurisdiction: rs.jurisdiction,
      legalCategory: rs.legalCategory,
      approvedIndications: rs.approvedIndications ?? null,
      statusStatement: rs.statusStatement,
      source: rs.source,
      checkedDate: new Date(rs.checkedDate),
      editorId: adminUserId,
      reviewStatus: 'published',
    })
  }

  // Insert every evidence source this entity's claims reference, keyed by the seed file's local
  // `key` so claimEvidence rows below can look up the real DB id.
  const sourceIdByKey = new Map<string, number>()
  for (const s of sources) {
    const [row] = await db
      .insert(evidenceSources)
      .values({
        title: s.title,
        authors: s.authors ?? null,
        publicationYear: s.publicationYear ?? null,
        journalOrIssuer: s.journalOrIssuer ?? null,
        doi: s.doi ?? null,
        pmid: s.pmid ?? null,
        clinicalTrialId: s.clinicalTrialId ?? null,
        regulatoryUrl: s.regulatoryUrl ?? null,
        sourceType: s.sourceType,
        studyDesign: s.studyDesign ?? null,
        experimentalModel: s.experimentalModel ?? null,
        species: s.species ?? null,
        sampleSize: s.sampleSize ?? null,
        endpoint: s.endpoint ?? null,
        retractionStatus: s.retractionStatus ?? null,
      })
      .returning({ id: evidenceSources.id })
    if (!row) throw new Error(`Failed to insert evidence source "${s.key}" for ${entity.slug}`)
    sourceIdByKey.set(s.key, row.id)
  }

  let claimCount = 0
  let mechanismStepCount = 0
  let evidenceLinkCount = 0
  let questionCount = 0

  for (const c of entity.claims) {
    const [claimRow] = await db
      .insert(claims)
      .values({
        entityId,
        slug: c.slug,
        claimType: c.claimType,
        consumerQuestion: c.consumerQuestion,
        directAnswer: c.directAnswer,
        measuredFinding: c.measuredFinding,
        inference: c.inference,
        proofBoundaryStage: c.proofBoundaryStage,
        proofBoundaryExplanation: c.proofBoundaryExplanation,
        remainingUnknown: c.remainingUnknown,
        evidenceNeededNext: c.evidenceNeededNext,
        mechanismSummary: c.mechanismSummary ?? null,
        outcomeSummary: c.outcomeSummary ?? null,
        publicationStatus: 'published',
        displayPriority: c.displayPriority ?? 0,
      })
      .returning({ id: claims.id })
    if (!claimRow) throw new Error(`Failed to insert claim "${c.slug}" for ${entity.slug}`)
    claimCount++

    for (const step of c.mechanismSteps ?? []) {
      await db.insert(mechanismSteps).values({
        claimId: claimRow.id,
        displayOrder: step.displayOrder,
        technicalLabel: step.technicalLabel,
        plainLanguageExplanation: step.plainLanguageExplanation,
        evidenceContext: step.evidenceContext,
        status: step.status,
        sourceLinks: step.sourceLinks ?? [],
      })
      mechanismStepCount++
    }

    for (const ev of c.evidence) {
      const evidenceSourceId = sourceIdByKey.get(ev.sourceKey)
      if (!evidenceSourceId) {
        throw new Error(`Claim "${c.slug}" references unknown evidence source key "${ev.sourceKey}" in ${entity.slug}`)
      }
      await db.insert(claimEvidence).values({
        claimId: claimRow.id,
        evidenceSourceId,
        relationship: ev.relationship,
        claimPartAddressed: ev.claimPartAddressed,
        directlyMeasuredResult: ev.directlyMeasuredResult,
        independentGroupStatus: ev.independentGroupStatus ?? false,
      })
      evidenceLinkCount++
    }

    for (const q of c.comprehensionQuestions ?? []) {
      await db.insert(comprehensionQuestions).values({
        claimId: claimRow.id,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
      })
      questionCount++
    }
  }

  console.log(
    `[seed] ${entity.slug}: 1 entity, ${entity.regulatoryStatuses.length} regulatory statuses, ` +
      `${sources.length} evidence sources, ${claimCount} claims, ${mechanismStepCount} mechanism steps, ` +
      `${evidenceLinkCount} evidence links, ${questionCount} comprehension questions.`
  )
}

async function main() {
  const adminUserId = await ensureAdminUser()

  await clearExisting(SEED_FILES.map((f) => f.entity.slug))

  for (const file of SEED_FILES) {
    await seedEntity(file, adminUserId)
  }

  console.log(`[seed] done: ${SEED_FILES.length} entities seeded.`)
  console.log('[seed] next: npx tsx scripts/seed-legacy-redirects.ts')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] failed:', err)
    process.exit(1)
  })
