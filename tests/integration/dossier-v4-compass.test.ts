/**
 * The Substance Compass against a real database, on the disposable database the integration runner
 * provides.
 *
 * What this file checks that the unit tests cannot: the loader reads the corpus record, the legacy
 * curated record and the approved first-read binding together; the gate refuses a record that
 * should not be served; and the data-integrity defects the rebuild is not allowed to reintroduce
 * stay caught when the rows come from PostgreSQL rather than from a literal.
 *
 * Fixture rows only. Every row is removed at the end, and none of them is medical content.
 */
import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { db } from '@/db'
import { drugs, pageRegistryRoleAggregates, pageTrialRoles } from '@/db/schema'
import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'
import {
  installDossierV4Fixture,
  removeDossierV4Fixture,
  type DossierV4Fixture,
} from '../e2e/fixtures/dossier-v4'

const runsInDisposableDatabase = process.env.E2E_DISPOSABLE_DATABASE === '1'

describe.skipIf(!runsInDisposableDatabase)('the compass loads from the database', () => {
  let fixture: DossierV4Fixture | null = null

  const install = async (): Promise<DossierV4Fixture> => {
    if (!fixture) fixture = await installDossierV4Fixture()
    return fixture
  }

  it('reads the corpus record and the curated record together', async () => {
    const { slug, name } = await install()
    const inputs = await loadDossierV4Inputs(slug)
    expect(inputs).not.toBeNull()
    expect(inputs?.corpus.displayName).toBe(name)
    expect(inputs?.legacyRecord?.mechanismSteps).toHaveLength(3)
    expect(inputs?.legacyRecord?.trials).toHaveLength(2)
  })

  it('leaves the first-read answer unbound when no approved fingerprint covers the record', async () => {
    const { slug } = await install()
    const inputs = await loadDossierV4Inputs(slug)
    // A fixture slug has no approved fingerprint, so the answer must not resolve. This is the
    // behaviour that also drops a real answer once the record it was approved against changes.
    expect(inputs?.boundAnswer).toBeNull()
  })

  it('builds a model with no reviewed section when the claim table is empty', async () => {
    const { slug } = await install()
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) throw new Error('fixture did not load')
    expect(inputs.claims).toEqual([])
    const model = buildDossierV4(inputs)
    expect(model.sections.some((section) => section.state === 'reviewed_content')).toBe(false)
    expect(model.hero.strongestGoalResult.origin).not.toBe('reviewed_claim')
  })

  it('passes every gate for a record that has identity, provenance and a tested study', async () => {
    const { slug } = await install()
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) throw new Error('fixture did not load')
    const model = buildDossierV4(inputs)
    expect(model.gates.filter((gate) => !gate.passed).map((gate) => gate.code)).toEqual([])
  })

  it('fails the trial-role gate once the tested count is removed', async () => {
    const { slug, key } = await install()
    const before = await db
      .select()
      .from(pageRegistryRoleAggregates)
      .where(eq(pageRegistryRoleAggregates.key, key))
    const aggregate = before[0]?.aggregate as Record<string, unknown>
    await db
      .update(pageRegistryRoleAggregates)
      .set({
        aggregate: {
          ...aggregate,
          tested: { ...(aggregate.tested as Record<string, unknown>), studies: 0 },
        },
      })
      .where(eq(pageRegistryRoleAggregates.key, key))

    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) throw new Error('fixture did not load')
    const model = buildDossierV4(inputs)
    const roles = model.gates.find((gate) => gate.code === 'trial_roles_valid')
    expect(roles?.passed).toBe(false)

    await db
      .update(pageRegistryRoleAggregates)
      .set({ aggregate })
      .where(eq(pageRegistryRoleAggregates.key, key))
  })

  it('renders both a study that met its endpoint and one that did not', async () => {
    const { slug } = await install()
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) throw new Error('fixture did not load')
    const model = buildDossierV4(inputs)
    const verdicts = model.humanResults.cards.map((card) => card.verdict)
    expect(verdicts).toContain('met')
    expect(verdicts).toContain('not_met')
    // A card without an exact question is never rendered.
    for (const card of model.humanResults.cards) expect(card.question.length).toBeGreaterThan(5)
  })

  it('keeps an internal field name out of the reader layer when it comes from the database', async () => {
    const { slug } = await install()
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) throw new Error('fixture did not load')
    const model = buildDossierV4(inputs)
    const limits = model.humanResults.cards.map((card) => card.primaryLimitation).join(' ')
    expect(limits).not.toContain('endpointMet')
    expect(limits).toContain('endpoint met')
  })

  it('removes the fixture rows', async () => {
    await removeDossierV4Fixture(fixture)
    const remaining = fixture
      ? await db.select().from(drugs).where(eq(drugs.id, fixture.drugId))
      : []
    expect(remaining).toEqual([])
    fixture = null
  })
})

describe.skipIf(!runsInDisposableDatabase)('data-integrity defects that must not return', () => {
  let fixture: DossierV4Fixture | null = null

  const install = async (): Promise<DossierV4Fixture> => {
    if (!fixture) fixture = await installDossierV4Fixture()
    return fixture
  }

  it('a comparator or an observed exposure never counts as a tested study', async () => {
    const { key } = await install()
    // The database rule: only the tested intervention role may support a tested claim.
    await expect(
      db.insert(pageTrialRoles).values({
        key,
        nct: 'NCT00000009',
        role: 'active_comparator',
        basis: 'fixture',
        administered: true,
        supportsTestedClaim: true,
        classifierVersion: 'trial-role-classifier/v1',
        snapshotDate: '2026-09-01',
      }),
    ).rejects.toThrow()
  })

  it('a planned completion date never becomes a finished window', async () => {
    const { slug } = await install()
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) throw new Error('fixture did not load')
    const model = buildDossierV4(inputs)
    const assessed = model.timeline.entries.find(
      (entry) => entry.facet === 'assessed_outcome_duration',
    )
    expect(assessed?.value.basis).toMatch(/planned end date was excluded/i)
  })

  it('a study window never becomes an exposure length or a follow-up length', async () => {
    const { slug } = await install()
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) throw new Error('fixture did not load')
    const model = buildDossierV4(inputs)
    const byFacet = new Map(model.timeline.entries.map((entry) => [entry.facet, entry]))
    expect(byFacet.get('treatment_exposure_duration')?.value.origin).toBe('absent')
    expect(byFacet.get('follow_up_duration')?.value.origin).toBe('absent')
  })

  it('a biomarker never appears as a life outcome', async () => {
    const { slug } = await install()
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) throw new Error('fixture did not load')
    const model = buildDossierV4(inputs)
    const measuredTerms = model.experience.measured.map((entry) => entry.term)
    const meaningfulTerms = model.experience.meaningful.map((entry) => entry.term)
    expect(measuredTerms).toContain('glycated hemoglobin')
    expect(meaningfulTerms).not.toContain('glycated hemoglobin')
    expect(meaningfulTerms).toContain('overall survival')
  })

  it('a related form never carries the evidence on the parent page', async () => {
    const { slug } = await install()
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) throw new Error('fixture did not load')
    const model = buildDossierV4(inputs)
    const isomer = model.formCheck.entries.find((entry) => entry.relation === 'isomer_of')
    expect(isomer).toBeDefined()
    expect(isomer?.carriesEvidence).toBe(false)
    // Nothing the corpus vocabulary can express carries a result across to another substance.
    expect(model.formCheck.entries.every((entry) => !entry.carriesEvidence)).toBe(true)
    const sameTarget = model.formCheck.entries.find(
      (entry) => entry.relation === 'explicitly_not_equivalent_to',
    )
    expect(sameTarget).toBeDefined()
  })

  it('an unknown field never becomes a clean "none"', async () => {
    const { slug } = await install()
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) throw new Error('fixture did not load')
    const model = buildDossierV4(inputs)
    // The fixture stores no interaction rows at all, so the section must say what was searched
    // rather than reporting that there are none.
    expect(model.stack.state).toBe('no_qualifying_evidence')
    expect(model.stack.neverSafeLine.toLowerCase()).not.toContain('no interactions')
  })

  it('a registered outcome name is never reported as a result', async () => {
    const { slug } = await install()
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) throw new Error('fixture did not load')
    const model = buildDossierV4(inputs)
    expect(model.fingerprint.registeredOutcomeLine).toMatch(/does not say what they found/i)
    const states = model.fingerprint.rows.flatMap((row) => row.cells.map((cell) => cell.state))
    expect(states).not.toContain('demonstrated')
  })

  it('an unrecognised registry phrase is kept visible rather than sorted into a bucket', async () => {
    const { slug } = await install()
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) throw new Error('fixture did not load')
    const model = buildDossierV4(inputs)
    const uncategorised = model.experience.uncategorised.map((entry) => entry.term)
    expect(uncategorised).toContain('a fixture phrase no rule recognises')
  })

  it('removes the fixture rows', async () => {
    await removeDossierV4Fixture(fixture)
    fixture = null
    expect(fixture).toBeNull()
  })
})
