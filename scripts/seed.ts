import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { drugs } from '@/db/schema'
import { runFullDeterministicSweep } from '@/lib/rna-intelligence'
import { countAuditPoints } from '@/lib/dossier'
import type { MolecularSchema } from '@/lib/types'
import type { SeedDossier } from '@/lib/seed-types'
import { ALL_SEED_DOSSIERS } from './seed-data'

/**
 * Loads the curated flagship dossiers.
 *
 * These are the pages a person wrote from sources, so they land as `dossierDepth: 'flagship'` and
 * the ingest's upsert will not overwrite their narrative fields on a later run.
 *
 * The one thing this script computes rather than copies is the machine-verification badge: every
 * seeded structure is put through the real deterministic sweep, and the hash is written only if
 * the sweep passes. A seed file cannot assert that badge for itself — otherwise the badge would
 * mean "somebody typed it" rather than "the engine checked it", which is the whole distinction the
 * platform is built on.
 */

interface SeedOutcome {
  slug: string
  swept: boolean
  passed: boolean
  hash: string | null
  errors: string[]
}

function toMolecularSchema(seed: SeedDossier): {
  schema: MolecularSchema | null
  outcome: SeedOutcome
} {
  const outcome: SeedOutcome = { slug: seed.slug, swept: false, passed: false, hash: null, errors: [] }
  const source = seed.molecularSchema
  if (!source) return { schema: null, outcome }

  const structureString = source.smilesString ?? source.sequence5to3 ?? ''
  if (!structureString) {
    return {
      schema: {
        structureType: source.structureType,
        chemicalFormula: source.chemicalFormula,
        molecularWeight: source.molecularWeight,
        targetReceptorAffinity: source.targetReceptorAffinity,
        isMachineVerified: false,
        laboratoryWorkflow: source.laboratoryWorkflow,
      },
      outcome,
    }
  }

  const report = runFullDeterministicSweep({
    structureString,
    modality: seed.modality,
    workflow: source.laboratoryWorkflow,
  })

  outcome.swept = true
  outcome.passed = report.overallPassed
  outcome.hash = report.overallPassed ? report.verificationHash : null
  outcome.errors = report.errors.map((error) => `${error.code}: ${error.message}`)

  return {
    schema: {
      structureType: source.structureType,
      sequence5to3: source.sequence5to3,
      smilesString: source.smilesString,
      chemicalFormula: source.chemicalFormula,
      molecularWeight: source.molecularWeight,
      targetReceptorAffinity: source.targetReceptorAffinity,
      // Layer 2's computed facts are carried onto the dossier so the page can show them without
      // recomputing on every render.
      complementaryStrand: report.layer2.complementaryStrand,
      gcContentPercent: report.layer1.gcContentPercent,
      sequenceLengthNt: report.layer1.baseCounts ? report.layer1.validLength : undefined,
      readingFrameValid: report.layer1.isMultipleOfThree,
      startCodonFound: report.layer1.hasStartCodon,
      stopCodonFound: report.layer1.hasStopCodon,
      mfeDeltaG: report.layer2.mfeDeltaG,
      wobblePairsCount: report.layer2.wobblePairs,
      logP: report.layer2.logP,
      isMachineVerified: report.overallPassed,
      verificationHash: report.overallPassed ? report.verificationHash : undefined,
      lastVerifiedTimestamp: report.overallPassed ? report.timestamp : undefined,
      laboratoryWorkflow: source.laboratoryWorkflow,
    },
    outcome,
  }
}

async function main(): Promise<void> {
  const only = process.argv.includes('--only')
    ? process.argv[process.argv.indexOf('--only') + 1]
    : null

  const seeds = only
    ? ALL_SEED_DOSSIERS.filter((seed) => seed.slug.includes(only))
    : ALL_SEED_DOSSIERS

  console.log(`[seed] loading ${seeds.length} curated dossiers`)

  const outcomes: SeedOutcome[] = []

  for (const seed of seeds) {
    const { schema, outcome } = toMolecularSchema(seed)
    outcomes.push(outcome)

    const counts = countAuditPoints(seed.keyAudits)

    await db
      .insert(drugs)
      .values({
        id: seed.slug,
        slug: seed.slug,
        name: seed.name,
        tradeName: seed.tradeName ?? null,
        sponsor: seed.sponsor,
        targetGene: seed.targetGene,
        targetProtein: seed.targetProtein,
        modality: seed.modality,
        approvalStatus: seed.approvalStatus,
        approvalYear: seed.approvalYear ?? null,
        indication: seed.indication,
        patientFriendlyIndication: seed.patientFriendlyIndication,
        oneSentenceVerdict: seed.oneSentenceVerdict,
        laymanHowItWorks: seed.laymanHowItWorks,
        auditConfidence: seed.auditConfidence,
        confidenceScore: seed.confidenceScore,
        anatomicalSite: seed.anatomicalSite ?? null,
        recentAuditDate: seed.recentAuditDate,
        hasDiscrepancy: seed.hasDiscrepancy,
        dossierDepth: 'flagship',
        conditionContext: seed.conditionContext ?? null,
        pricing: seed.pricing ?? null,
        substitutes: seed.substitutes ?? null,
        molecularSchema: schema,
        keyAudits: seed.keyAudits,
        mechanismSteps: seed.mechanismSteps,
        trials: seed.trials,
        measuredVsInferredSummary: seed.measuredVsInferredSummary,
        deliverySystem: seed.deliverySystem,
        commonQuestions: seed.commonQuestions,
        sourceProvenance: seed.sources.map((source) => `${source.label} (${source.identifier})`),
        isMachineVerifiedStructure: outcome.passed,
        verificationHash: outcome.hash,
        lastVerifiedAt: outcome.passed ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: drugs.slug,
        set: {
          name: sql`excluded.name`,
          tradeName: sql`excluded.trade_name`,
          sponsor: sql`excluded.sponsor`,
          targetGene: sql`excluded.target_gene`,
          targetProtein: sql`excluded.target_protein`,
          modality: sql`excluded.modality`,
          approvalStatus: sql`excluded.approval_status`,
          approvalYear: sql`excluded.approval_year`,
          indication: sql`excluded.indication`,
          patientFriendlyIndication: sql`excluded.patient_friendly_indication`,
          oneSentenceVerdict: sql`excluded.one_sentence_verdict`,
          laymanHowItWorks: sql`excluded.layman_how_it_works`,
          auditConfidence: sql`excluded.audit_confidence`,
          confidenceScore: sql`excluded.confidence_score`,
          anatomicalSite: sql`excluded.anatomical_site`,
          recentAuditDate: sql`excluded.recent_audit_date`,
          hasDiscrepancy: sql`excluded.has_discrepancy`,
          dossierDepth: sql`excluded.dossier_depth`,
          conditionContext: sql`excluded.condition_context`,
          pricing: sql`excluded.pricing`,
          substitutes: sql`excluded.substitutes`,
          molecularSchema: sql`excluded.molecular_schema`,
          keyAudits: sql`excluded.key_audits`,
          mechanismSteps: sql`excluded.mechanism_steps`,
          trials: sql`excluded.trials`,
          measuredVsInferredSummary: sql`excluded.measured_vs_inferred_summary`,
          deliverySystem: sql`excluded.delivery_system`,
          commonQuestions: sql`excluded.common_questions`,
          sourceProvenance: sql`excluded.source_provenance`,
          isMachineVerifiedStructure: sql`excluded.is_machine_verified_structure`,
          verificationHash: sql`excluded.verification_hash`,
          lastVerifiedAt: sql`excluded.last_verified_at`,
          updatedAt: sql`now()`,
        },
      })

    const badge = outcome.passed ? `verified ${outcome.hash}` : outcome.swept ? 'SWEEP FAILED' : 'no structure'
    console.log(
      `[seed] ${seed.slug.padEnd(32)} ${String(counts.measured + counts.inferred + counts.failed + counts.conclusionShift).padStart(3)} audits · ${seed.mechanismSteps.length} steps · ${badge}`,
    )
  }

  const failed = outcomes.filter((outcome) => outcome.swept && !outcome.passed)
  if (failed.length > 0) {
    console.log(`\n[seed] ${failed.length} dossiers have a structure the engine REJECTED:`)
    for (const outcome of failed) {
      console.log(`   ${outcome.slug}: ${outcome.errors.join('; ')}`)
    }
    console.log('[seed] those pages will render without the Machine-Verified Structure badge.')
  }

  const verified = outcomes.filter((outcome) => outcome.passed).length
  console.log(
    `\n[seed] done · ${seeds.length} dossiers · ${verified} machine-verified structures · ${failed.length} rejected`,
  )
  process.exit(0)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
