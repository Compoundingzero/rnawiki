import { describe, expect, it } from 'vitest'

import { classifyEntity } from '@/lib/inventory/entity-class'
import {
  exactNameKey,
  isRedirectingResolution,
  resolveInventory,
  type InventoryRowInput,
} from '@/lib/inventory/resolve'
import { ENTITY_CLASSES, INVENTORY_RESOLUTION_STATES } from '@/lib/inventory/types'

function row(overrides: Partial<InventoryRowInput> & Pick<InventoryRowInput, 'id' | 'name'>): InventoryRowInput {
  return {
    slug: overrides.id,
    tradeName: null,
    dossierDepth: 'curated',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    aliases: [],
    backgroundModules: ['authoredAt', 'labelPresence', 'version'],
    compositionIngredientCount: 0,
    registryIdentifiers: {},
    biologicalIdentityTaxonomyId: null,
    supplementIngredientGroupId: null,
    fdaApplicationNumber: null,
    sampleProductNdcs: [],
    sampleLabelSetIds: [],
    ...overrides,
  }
}

const CORPUS: InventoryRowInput[] = [
  row({ id: 'coenzyme-q10', name: 'Coenzyme Q10', dossierDepth: 'flagship', backgroundModules: ['authoredAt', 'version'] }),
  row({
    id: 'coenzyme-q-10',
    name: 'Coenzyme Q-10',
    backgroundModules: ['authoredAt', 'supplementMarket', 'version'],
    approvalStatus: 'Non-FDA / Dietary Supplement',
  }),
  row({ id: 'tbd', name: 'Tbd' }),
  row({ id: 'clopidogrel', name: 'Clopidogrel', registryIdentifiers: { unii: '08I79HTP27' } }),
  row({
    id: 'clopidogrel-bisulfate',
    name: 'Clopidogrel Bisulfate',
    registryIdentifiers: { unii: '08I79HTP27' },
    aliases: [{ alias: 'Clopidogrel', kind: 'salt_form' }],
  }),
  row({ id: 'metoprolol', name: 'Metoprolol' }),
  row({ id: 'metoprolol-tartrate', name: 'Metoprolol Tartrate' }),
  row({ id: 'old-name', name: 'Old Name' }),
  row({ id: 'new-name', name: 'New Name' }),
  row({
    id: 'abalone',
    name: 'Abalone',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    modality: 'Nutraceutical / Botanical',
    backgroundModules: ['authoredAt', 'biologicalIdentity', 'version'],
    biologicalIdentityTaxonomyId: '6453',
  }),
  row({
    id: 'lone-identity',
    name: 'Lone Identity',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    backgroundModules: [],
  }),
]

const LEDGER = [{ oldSlug: 'old-name', targetDrugId: 'new-name', reason: 'RENAMED' }]

describe('inventory resolution', () => {
  it('accounts for every original record exactly once and balances the equation', () => {
    const { resolutions, summary } = resolveInventory(CORPUS, LEDGER)
    expect(resolutions).toHaveLength(CORPUS.length)
    expect(new Set(resolutions.map((r) => r.originalRecordId)).size).toBe(CORPUS.length)
    expect(summary.accountingBalanced).toBe(true)
    expect(summary.originalInventoryCount).toBe(
      summary.canonicalEntities +
        summary.aliasesOrDuplicatesRedirected +
        summary.historicalRedirects +
        summary.justifiedGoneIdentities +
        summary.manualReviewRequired,
    )
    for (const state of INVENTORY_RESOLUTION_STATES) expect(summary.byStatus).toHaveProperty(state)
    for (const klass of ENTITY_CLASSES) expect(summary.byEntityClass).toHaveProperty(klass)
  })

  it('merges only exact-name duplicates, preferring the flagship record, one hop', () => {
    const { resolutions } = resolveInventory(CORPUS, LEDGER)
    const byId = new Map(resolutions.map((r) => [r.originalRecordId, r]))
    expect(exactNameKey('Coenzyme Q-10')).toBe(exactNameKey('Coenzyme Q10'))
    expect(byId.get('coenzyme-q-10')?.resolutionStatus).toBe('DUPLICATE_OF_CANONICAL_ENTITY')
    expect(byId.get('coenzyme-q-10')?.redirectTarget).toBe('coenzyme-q10')
    expect(byId.get('coenzyme-q-10')?.attributionWarnings.map((w) => w.code)).toContain(
      'DUPLICATE_HOLDS_UNMERGED_MODULES',
    )
    expect(byId.get('coenzyme-q10')?.resolutionStatus).toBe('CANONICAL_ENTITY')
    expect(byId.get('coenzyme-q10')?.redirectTarget).toBeNull()
    for (const resolution of resolutions) {
      if (!isRedirectingResolution(resolution.resolutionStatus)) continue
      const target = byId.get(resolution.canonicalEntityId)
      expect(target?.resolutionStatus).toBe('CANONICAL_ENTITY')
    }
  })

  it('never merges a salt form with its parent, even with a shared identifier and alias', () => {
    const { resolutions } = resolveInventory(CORPUS, LEDGER)
    const salt = resolutions.find((r) => r.originalRecordId === 'clopidogrel-bisulfate')!
    expect(salt.resolutionStatus).toBe('CANONICAL_ENTITY')
    expect(salt.attributionWarnings.map((w) => w.code)).toEqual(
      expect.arrayContaining(['SHARED_REGISTRY_IDENTIFIER', 'ALIAS_SHADOWED_BY_CANONICAL_SLUG']),
    )
    const parent = resolutions.find((r) => r.originalRecordId === 'clopidogrel')!
    expect(parent.resolutionStatus).toBe('CANONICAL_ENTITY')
    // A suffix the ingest normaliser knows produces the salt-form warning, still without a merge.
    const tartrate = resolutions.find((r) => r.originalRecordId === 'metoprolol-tartrate')!
    expect(tartrate.resolutionStatus).toBe('CANONICAL_ENTITY')
    expect(tartrate.attributionWarnings.map((w) => w.code)).toContain(
      'SALT_OR_HYDRATE_FORM_OF_ANOTHER_RECORD',
    )
    expect(tartrate.attributionWarnings.find((w) => w.code === 'SALT_OR_HYDRATE_FORM_OF_ANOTHER_RECORD')?.relatedSlugs).toEqual(['metoprolol'])
  })

  it('retires placeholders as gone and follows the owner-curated ledger', () => {
    const { resolutions } = resolveInventory(CORPUS, LEDGER)
    const byId = new Map(resolutions.map((r) => [r.originalRecordId, r]))
    expect(byId.get('tbd')?.resolutionStatus).toBe('INVALID_IDENTITY_GONE')
    expect(byId.get('tbd')?.entityClass).toBe('PLACEHOLDER')
    expect(byId.get('tbd')?.identityConfidenceState).toBe('PLACEHOLDER')
    expect(byId.get('old-name')?.resolutionStatus).toBe('HISTORICAL_REDIRECT')
    expect(byId.get('old-name')?.redirectTarget).toBe('new-name')
  })

  it('fails closed on a ledger chain instead of emitting a two-hop redirect', () => {
    const chained = [
      ...LEDGER,
      { oldSlug: 'new-name', targetDrugId: 'clopidogrel', reason: 'MERGED' },
    ]
    const { resolutions } = resolveInventory(CORPUS, chained)
    const old = resolutions.find((r) => r.originalRecordId === 'old-name')!
    expect(old.resolutionStatus).toBe('MANUAL_IDENTITY_REVIEW_REQUIRED')
    expect(old.redirectTarget).toBeNull()
  })

  it('is deterministic and independent of input order', () => {
    const forward = resolveInventory(CORPUS, LEDGER)
    const reversed = resolveInventory([...CORPUS].reverse(), [...LEDGER].reverse())
    expect(JSON.stringify(reversed)).toBe(JSON.stringify(forward))
    expect(forward.summary.inputDigest).toMatch(/^[a-f0-9]{64}$/u)
  })

  it('classifies by the fixed rule table', () => {
    const base = {
      slug: 'x',
      name: 'X',
      modality: 'Small Molecule',
      approvalStatus: 'FDA Approved',
      backgroundModules: [] as string[],
      compositionIngredientCount: 0,
      isPlaceholder: false,
    }
    expect(classifyEntity(base).entityClass).toBe('APPROVED_MEDICINE')
    expect(classifyEntity({ ...base, modality: 'Monoclonal Antibody (mAb)' }).entityClass).toBe(
      'APPROVED_BIOLOGIC',
    )
    expect(classifyEntity({ ...base, compositionIngredientCount: 2 }).entityClass).toBe(
      'COMBINATION_PRODUCT',
    )
    expect(
      classifyEntity({ ...base, approvalStatus: 'Non-FDA / Dietary Supplement', backgroundModules: ['biologicalIdentity'] })
        .entityClass,
    ).toBe('BOTANICAL_OR_ORGANISM_PREPARATION')
    expect(
      classifyEntity({ ...base, approvalStatus: 'Non-FDA / Dietary Supplement', backgroundModules: ['supplementMarket'] })
        .entityClass,
    ).toBe('SUPPLEMENT_INGREDIENT')
    expect(
      classifyEntity({ ...base, approvalStatus: 'Non-FDA / Dietary Supplement', backgroundModules: ['sourceMaterial'] })
        .entityClass,
    ).toBe('REGISTRY_ONLY_IDENTITY')
    expect(classifyEntity({ ...base, isPlaceholder: true }).entityClass).toBe('PLACEHOLDER')
  })
})
