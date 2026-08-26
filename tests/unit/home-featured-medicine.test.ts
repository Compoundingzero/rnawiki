import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  homeFeaturedAnswerFromDossier,
  homeFeaturedMedicineAnswer,
} from '@/lib/home-featured-medicine'
import { SEED_DOSSIERS } from '@/scripts/seed-data'
import type { DrugDossier } from '@/lib/types'

const inclisiran = {
  id: 'inclisiran',
  name: 'Inclisiran',
  sponsor: '',
  targetGene: '',
  targetProtein: '',
  modality: 'siRNA (Small Interfering RNA)',
  approvalStatus: 'FDA Approved',
  indication: 'High LDL cholesterol',
  patientFriendlyIndication: 'High LDL cholesterol',
  oneSentenceVerdict: '',
  laymanHowItWorks: '',
  auditConfidence: 'Moderate / Debated',
  confidenceScore: 0,
  auditPointsCount: { measured: 0, inferred: 0, failed: 0, conclusionShift: 0 },
  keyAudits: [],
  mechanismSteps: [],
  trials: [],
  measuredVsInferredSummary: {
    strictlyMeasured: [],
    unsupportedInferences: [],
    whatFailedInitially: [],
    realWorldOutcome: [],
  },
  deliverySystem: { type: '', description: '', safetyProfile: '' },
  commonQuestions: [],
  recentAuditDate: '',
  hasDiscrepancy: false,
} satisfies DrugDossier

describe('homepage featured medicine answer', () => {
  it('passes through the canonical dossier purpose and programme scope without rewriting them', () => {
    const usedFor = 'Used or studied for adults with artery disease and high LDL cholesterol.'

    expect(
      homeFeaturedAnswerFromDossier({
        slug: 'inclisiran',
        bindingState: 'published_programme',
        selectedProgrammeLabel: 'Adults with artery disease and high LDL cholesterol',
        readerSummary: {
          basis: 'published_programme',
          usedFor,
          takeaway: 'A reviewed finding.',
          simplified: true,
          contextItems: [],
        },
      }),
    ).toEqual({
      href: '/d/inclisiran',
      answerFor: 'Adults with artery disease and high LDL cholesterol',
      usedFor,
    })
  })

  it('does not apply the Inclisiran override to a slug with empty evidence', () => {
    expect(homeFeaturedMedicineAnswer(inclisiran, null)).toEqual({
      href: '/d/inclisiran',
      usedFor: 'Used or studied for people with high LDL (“bad”) cholesterol.',
    })
  })

  it('keeps the exact Inclisiran purpose when its real seeded evidence fingerprint matches', () => {
    const seed = SEED_DOSSIERS.find((dossier) => dossier.slug === 'inclisiran')
    expect(seed).toBeDefined()
    const seededInclisiran: DrugDossier = {
      ...seed!,
      id: seed!.slug,
      molecularSchema: undefined,
      dossierDepth: 'flagship',
      sourceProvenance: seed!.sources.map((source) =>
        `${source.label} (${source.identifier})`.slice(0, 300),
      ),
      auditPointsCount: {
        measured: seed!.keyAudits.filter((audit) => audit.category === 'measured').length,
        inferred: seed!.keyAudits.filter((audit) => audit.category === 'inferred').length,
        failed: seed!.keyAudits.filter((audit) => audit.category === 'failed').length,
        conclusionShift: seed!.keyAudits.filter((audit) => audit.category === 'conclusion_shift')
          .length,
      },
    }

    expect(homeFeaturedMedicineAnswer(seededInclisiran, null)).toEqual({
      href: '/d/inclisiran',
      usedFor: 'Used with diet and exercise to lower LDL, often called “bad” cholesterol.',
    })
  })

  it('loads the default programme through the dossier builder and renders the requested labels', () => {
    const root = process.cwd()
    const page = readFileSync(join(root, 'app/page.tsx'), 'utf8')
    const home = readFileSync(join(root, 'components/HomeView.tsx'), 'utf8')

    expect(page).toContain('getProgrammeEvidenceByMedicineSlug(featured.id, null)')
    expect(page).toContain('homeFeaturedMedicineAnswer')
    expect(page).not.toContain('getPublicMedicineProjections')
    expect(home).toContain('featuredAnswer.usedFor')
    expect(home).toContain('In 10 seconds')
    expect(home).toContain('What is it for?')
    expect(home).not.toContain('featuredCard.summary.text')
  })
})
