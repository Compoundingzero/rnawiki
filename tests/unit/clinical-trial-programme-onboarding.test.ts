import { describe, expect, it, vi } from 'vitest'

import {
  onboardClinicalTrialProgramme,
  type ClinicalTrialProgrammeOnboardingPlan,
  type ClinicalTrialProgrammeOnboardingStore,
} from '@/lib/evidence/clinical-trial-programme-onboarding'
import { parseClinicalTrialProgrammeOnboardingArgs } from '@/lib/evidence/clinical-trial-programme-onboarding-cli'
import type { EvidenceSourceAdapter, SourceSnapshot } from '@/lib/evidence/source-adapter'

const RETRIEVED_AT = '2026-08-23T01:00:00.000Z'
const CONTENT_HASH = 'a'.repeat(64)

function payload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    hasResults: true,
    protocolSection: {
      identificationModule: {
        nctId: 'NCT12345678',
        acronym: 'CLEAR-RNA',
        briefTitle: 'A registered study of inclisiran for high cholesterol',
        officialTitle: 'Official registered inclisiran study title',
      },
      statusModule: {
        overallStatus: 'COMPLETED',
        startDateStruct: { date: '2024-01-02' },
        primaryCompletionDateStruct: { date: '2025-02' },
        completionDateStruct: { date: '2025-03-04' },
      },
      sponsorCollaboratorsModule: {
        leadSponsor: { name: 'Registry Sponsor', class: 'INDUSTRY' },
      },
      conditionsModule: { conditions: ['High Cholesterol', 'Atherosclerosis'] },
      designModule: {
        phases: ['PHASE3'],
        enrollmentInfo: { count: 912, type: 'ACTUAL' },
      },
      armsInterventionsModule: {
        interventions: [
          {
            type: 'DRUG',
            name: 'Inclisiran sodium 300 mg',
            otherNames: ['Leqvio'],
          },
        ],
      },
    },
    ...overrides,
  }
}

function adapter(studyPayload: Record<string, unknown> = payload()): EvidenceSourceAdapter {
  return {
    key: 'clinicaltrials.gov/v2',
    supports: ({ kind, value }) => kind === 'NCT' && value === 'NCT12345678',
    fetch: vi.fn(async (): Promise<SourceSnapshot> => ({
      adapterKey: 'clinicaltrials.gov/v2',
      identifier: { kind: 'NCT', value: 'NCT12345678' },
      canonicalLocator: 'https://clinicaltrials.gov/study/NCT12345678',
      retrievedAt: RETRIEVED_AT,
      contentHash: CONTENT_HASH,
      payload: studyPayload,
    })),
    normalize: vi.fn(async () => []),
    diff: vi.fn(async () => ({ changed: false, currentHash: CONTENT_HASH, changes: [] })),
  }
}

function store() {
  let captured: ClinicalTrialProgrammeOnboardingPlan | null = null
  const value: ClinicalTrialProgrammeOnboardingStore = {
    findMedicineBySlug: vi.fn(async (slug) => ({
      id: 'drug-inclisiran',
      slug,
      name: 'Inclisiran',
      aliases: ['Leqvio'],
    })),
    apply: vi.fn(async (plan, options) => {
      captured = plan
      return {
        outcome: options.commit ? ('CREATED' as const) : ('WOULD_CREATE' as const),
        records: {
          sourceId: plan.source.id,
          snapshotId: plan.snapshot.id,
          programmeId: plan.programme.id,
          programmeSlug: plan.programme.slug,
          trialId: plan.trial.id,
        },
        writes: { source: true, snapshot: true, programme: true, trial: true, freshness: true },
      }
    }),
  }
  return { value, captured: () => captured }
}

describe('ClinicalTrials.gov programme onboarding', () => {
  it('defaults to a no-write plan and derives only registered structured facts', async () => {
    const repository = store()
    const result = await onboardClinicalTrialProgramme({
      medicineSlug: 'inclisiran',
      nctId: 'nct12345678',
      adapter: adapter(),
      store: repository.value,
    })
    const plan = repository.captured()!

    expect(result).toMatchObject({
      schemaVersion: 'clinical-trial-programme-onboarding/v1',
      mode: 'DRY_RUN',
      outcome: 'WOULD_CREATE',
      medicine: { id: 'drug-inclisiran', slug: 'inclisiran', name: 'Inclisiran' },
      registry: {
        nctId: 'NCT12345678',
        briefTitle: 'A registered study of inclisiran for high cholesterol',
        conditions: ['High Cholesterol', 'Atherosclerosis'],
        sponsor: 'Registry Sponsor',
        phases: ['PHASE3'],
        enrollmentCount: 912,
        enrollmentType: 'ACTUAL',
        hasResults: true,
      },
      checkedAt: RETRIEVED_AT,
      nextCheckDueAt: '2026-08-24T01:00:00.000Z',
      safety: {
        createsClaims: false,
        createsEvidenceNodes: false,
        createsVerdict: false,
        createsReviewers: false,
        publishesConclusion: false,
      },
    })
    expect(plan.programme).toMatchObject({
      slug: 'nct12345678',
      title: 'A registered study of inclisiran for high cholesterol',
      indication: 'High Cholesterol; Atherosclerosis',
      sponsor: 'Registry Sponsor',
      status: 'COMPLETED',
      highestPhaseReached: 'Phase 3',
      startDate: '2024-01-02',
      endDate: '2025-03-04',
    })
    expect(plan.trial).toMatchObject({
      trialIdentifier: 'NCT12345678',
      status: 'COMPLETED',
      resultsStatus: 'AVAILABLE',
      enrolment: 912,
      enrolmentType: 'ACTUAL',
      primaryCompletionDate: null,
    })
    expect(repository.value.apply).toHaveBeenCalledWith(plan, { commit: false })
  })

  it('requires an explicit commit flag and keeps stable IDs across identical runs', async () => {
    const firstStore = store()
    const secondStore = store()
    const first = await onboardClinicalTrialProgramme({
      medicineSlug: 'inclisiran',
      nctId: 'NCT12345678',
      commit: true,
      adapter: adapter(),
      store: firstStore.value,
    })
    const second = await onboardClinicalTrialProgramme({
      medicineSlug: 'inclisiran',
      nctId: 'NCT12345678',
      commit: true,
      adapter: adapter(),
      store: secondStore.value,
    })

    expect(first.mode).toBe('COMMIT')
    expect(first.outcome).toBe('CREATED')
    expect(first.records).toEqual(second.records)
    expect(firstStore.value.apply).toHaveBeenCalledWith(expect.any(Object), { commit: true })
  })

  it('accepts a saved alias but rejects a trial with no matching intervention name', async () => {
    const aliasPayload = payload()
    const protocol = aliasPayload.protocolSection as Record<string, unknown>
    protocol.armsInterventionsModule = {
      interventions: [{ type: 'DRUG', name: 'Leqvio injection' }],
    }
    await expect(
      onboardClinicalTrialProgramme({
        medicineSlug: 'inclisiran',
        nctId: 'NCT12345678',
        adapter: adapter(aliasPayload),
        store: store().value,
      }),
    ).resolves.toMatchObject({
      registry: { intervention: { name: 'Leqvio injection', matchedMedicineName: 'Leqvio' } },
    })

    const mismatchedPayload = payload()
    const mismatchedProtocol = mismatchedPayload.protocolSection as Record<string, unknown>
    mismatchedProtocol.armsInterventionsModule = {
      interventions: [{ type: 'DRUG', name: 'Unrelated medicine' }],
    }
    const mismatchedStore = store()
    await expect(
      onboardClinicalTrialProgramme({
        medicineSlug: 'inclisiran',
        nctId: 'NCT12345678',
        adapter: adapter(mismatchedPayload),
        store: mismatchedStore.value,
      }),
    ).rejects.toMatchObject({ code: 'MEDICINE_INTERVENTION_MISMATCH' })
    expect(mismatchedStore.value.apply).not.toHaveBeenCalled()
  })

  it('retains partial registry dates in the source facts without inventing a database day', async () => {
    const repository = store()
    await onboardClinicalTrialProgramme({
      medicineSlug: 'inclisiran',
      nctId: 'NCT12345678',
      adapter: adapter(),
      store: repository.value,
    })

    expect(repository.captured()!.facts.primaryCompletionDate).toBe('2025-02')
    expect(repository.captured()!.trial.primaryCompletionDate).toBeNull()
  })

  it('rejects malformed CLI options and parses dry-run/commit modes explicitly', () => {
    expect(
      parseClinicalTrialProgrammeOnboardingArgs([
        '--medicine',
        'inclisiran',
        '--nct',
        'NCT12345678',
      ]),
    ).toEqual({ medicineSlug: 'inclisiran', nctId: 'NCT12345678', commit: false })
    expect(
      parseClinicalTrialProgrammeOnboardingArgs([
        '--commit',
        '--medicine',
        'inclisiran',
        '--nct',
        'NCT12345678',
      ]),
    ).toEqual({ medicineSlug: 'inclisiran', nctId: 'NCT12345678', commit: true })
    expect(() =>
      parseClinicalTrialProgrammeOnboardingArgs([
        '--medicine',
        'inclisiran',
        '--medicine',
        'other',
        '--nct',
        'NCT12345678',
      ]),
    ).toThrow('Duplicate onboarding option')
    expect(() => parseClinicalTrialProgrammeOnboardingArgs(['--medicine', 'inclisiran'])).toThrow(
      '--nct requires an NCT identifier',
    )
  })
})
