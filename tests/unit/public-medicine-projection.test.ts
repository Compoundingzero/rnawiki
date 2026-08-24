import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  buildPublicMedicineProjections,
  toPublicDatasetProgrammeEvidence,
  toPublicMedicineCardView,
  type PublicMedicineProjectionRow,
} from '@/lib/public-medicine-projection'

const INPUT_DIGEST = 'a'.repeat(64)
const PROPOSAL_DIGEST = 'b'.repeat(64)

function projectionRow(
  overrides: Partial<PublicMedicineProjectionRow> = {},
): PublicMedicineProjectionRow {
  return {
    medicineSlug: 'example-medicine',
    medicinePatientFriendlyIndication: 'Legacy medicine indication',
    medicineIndication: 'Legacy label indication',
    programmeId: 'programme-reviewed',
    programmeSlug: 'reviewed-use',
    programmeTitle: 'Reviewed use programme',
    programmeIndication: 'A programme-scoped indication',
    programmeTargetPopulation: 'Adults in the reviewed study population',
    programmeStatus: 'COMPLETED',
    currentVerdictRevisionId: 'verdict-revision-4',
    currentPublicationPublishedAt: new Date('2026-08-22T10:00:00.000Z'),
    verdictRevisionId: 'verdict-revision-4',
    verdictRevisionNumber: 4,
    verdictReviewStatus: 'PUBLISHED',
    verdictPublicLabel: 'Reviewed programme conclusion',
    verdictOneSentenceReason: 'The reviewed programme evidence supports this scoped conclusion.',
    verdictIndicationScope: 'The programme indication',
    verdictPopulationScope: 'Adults in the reviewed population',
    verdictTrialScope: 'NCT00000001',
    verdictOutcomeScope: 'The prespecified outcome',
    verdictConfidence: 'MODERATE',
    verdictEngineVersion: 'rna-intelligence-evidence-v2',
    verdictInputDigestAlgorithm: 'sha256',
    verdictInputDigest: INPUT_DIGEST,
    verdictProposalDigestAlgorithm: 'sha256',
    verdictProposalDigest: PROPOSAL_DIGEST,
    ...overrides,
  }
}

describe('public medicine projection', () => {
  it('keeps the authoritative publication revision and digest identical in cards and export', () => {
    const projections = buildPublicMedicineProjections(
      [
        projectionRow(),
        projectionRow({
          programmeId: 'programme-unpublished',
          programmeSlug: 'another-use',
          programmeTitle: 'Another use programme',
          programmeIndication: 'Another programme-scoped indication',
          currentVerdictRevisionId: null,
          currentPublicationPublishedAt: null,
          verdictRevisionId: null,
          verdictRevisionNumber: null,
          verdictReviewStatus: null,
          verdictPublicLabel: null,
          verdictOneSentenceReason: null,
          verdictIndicationScope: null,
          verdictPopulationScope: null,
          verdictTrialScope: null,
          verdictOutcomeScope: null,
          verdictConfidence: null,
          verdictEngineVersion: null,
          verdictInputDigestAlgorithm: null,
          verdictInputDigest: null,
          verdictProposalDigestAlgorithm: null,
          verdictProposalDigest: null,
        }),
      ],
      [
        { verdictRevisionId: 'verdict-revision-4', sourceSnapshotId: 'snapshot-z' },
        { verdictRevisionId: 'verdict-revision-4', sourceSnapshotId: 'snapshot-a' },
        { verdictRevisionId: 'verdict-revision-4', sourceSnapshotId: 'snapshot-z' },
      ],
    )
    const projection = projections.get('example-medicine')
    expect(projection).toBeDefined()

    const card = toPublicMedicineCardView(projection!)
    const dataset = toPublicDatasetProgrammeEvidence(projection!)
    const publication = dataset.programmes[0]?.currentPublication

    expect(card.summary.kind).toBe('reviewed_programme')
    expect(card.summary.binding).toMatchObject({
      type: 'programme_publication',
      verdictRevisionId: 'verdict-revision-4',
      revisionNumber: 4,
      inputDigestAlgorithm: 'sha256',
      inputDigest: INPUT_DIGEST,
    })
    expect(dataset.selectedSummary.binding).toEqual(card.summary.binding)
    expect(card.summary.text).toBe(
      'The reviewed programme evidence supports this scoped conclusion.',
    )
    expect(dataset.selectedSummary.text).toBe(card.summary.text)
    expect(publication).toMatchObject({
      verdictRevisionId: 'verdict-revision-4',
      revisionNumber: 4,
      inputDigestAlgorithm: 'sha256',
      inputDigest: INPUT_DIGEST,
      proposalDigestAlgorithm: 'sha256',
      proposalDigest: PROPOSAL_DIGEST,
      sourceSnapshotIds: ['snapshot-a', 'snapshot-z'],
    })
    expect(card.href).toBe('/d/example-medicine?programme=reviewed-use')
  })

  it('does not publish a conclusion from a revision that is not the authoritative pointer', () => {
    const projection = buildPublicMedicineProjections([
      projectionRow({
        currentVerdictRevisionId: 'verdict-revision-current',
        verdictRevisionId: 'verdict-revision-unbound',
        verdictOneSentenceReason: 'This unrelated conclusion must not appear.',
      }),
    ]).get('example-medicine')

    expect(projection?.programmes[0]?.currentPublication).toBeNull()
    expect(projection?.cardSummary).toMatchObject({
      kind: 'programme_indication',
      text: 'A programme-scoped indication',
      binding: { type: 'programme', programmeId: 'programme-reviewed' },
    })
  })

  it('falls back from programme indication to an explicitly medicine-bound indication', () => {
    const programmeProjection = buildPublicMedicineProjections([
      projectionRow({
        currentVerdictRevisionId: null,
        currentPublicationPublishedAt: null,
        verdictRevisionId: null,
        verdictRevisionNumber: null,
        verdictReviewStatus: null,
      }),
    ]).get('example-medicine')
    expect(programmeProjection?.cardSummary).toMatchObject({
      kind: 'programme_indication',
      binding: { type: 'programme', programmeSlug: 'reviewed-use' },
    })

    const legacyProjection = buildPublicMedicineProjections([
      projectionRow({
        programmeId: null,
        programmeSlug: null,
        programmeTitle: null,
        programmeIndication: null,
        programmeTargetPopulation: null,
        programmeStatus: null,
        currentVerdictRevisionId: null,
        currentPublicationPublishedAt: null,
        verdictRevisionId: null,
        verdictRevisionNumber: null,
        verdictReviewStatus: null,
      }),
    ]).get('example-medicine')
    expect(legacyProjection?.cardSummary).toEqual({
      kind: 'medicine_indication',
      text: 'Legacy medicine indication',
      binding: { type: 'medicine_identity', medicineSlug: 'example-medicine' },
    })
    expect(legacyProjection && toPublicMedicineCardView(legacyProjection).href).toBe(
      '/d/example-medicine',
    )
  })

  it('is the shared input consumed by home, browse, and the dataset exporter', () => {
    const root = process.cwd()
    const home = readFileSync(join(root, 'components/HomeView.tsx'), 'utf8')
    const browse = readFileSync(join(root, 'app/browse/page.tsx'), 'utf8')
    const exporter = readFileSync(join(root, 'scripts/export/dataset.ts'), 'utf8')

    expect(home).toContain('toPublicMedicineCardView')
    expect(browse).toContain('toPublicMedicineCardView')
    expect(exporter).toContain('toPublicDatasetProgrammeEvidence')
    expect(exporter).toContain("'oneSentenceVerdict'")
    expect(home).not.toContain('oneSentenceVerdict')
    expect(browse).not.toContain('oneSentenceVerdict')
  })
})
