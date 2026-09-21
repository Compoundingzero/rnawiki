import { randomUUID } from 'node:crypto'

import { eq } from 'drizzle-orm'

import { db } from '../../../db'
import {
  corpusPages,
  drugs,
  entityCorrections,
  pageFields,
  pageRegistration,
  pageRegistryRoleAggregates,
  pageRelations,
  pageSynonyms,
} from '../../../db/schema'

export interface DossierV4Fixture {
  key: string
  slug: string
  name: string
  drugId: string
  isomerKey: string
  rivalKey: string
}

/**
 * The smallest record that exercises every lane of the Substance Compass.
 *
 * Nothing in it is about a real substance and nothing in it may become seed data. The name says so,
 * the register is example.invalid and every sentence is written to test a rule rather than to state
 * a fact. Two things are planted on purpose:
 *
 *   - one trial that met its endpoint and one that did not, so the result cards have to show both;
 *   - an internal field name inside a curated note, so the reader-text guard has something to catch.
 */
export interface DossierV4FixtureOptions {
  /**
   * Whether the register row says the substance needs a prescription. This decides whether the page
   * offers a self-experiment plan at all, so the two cases are separate fixtures rather than one
   * record that claims to be both.
   */
  prescription?: boolean
}

export async function installDossierV4Fixture(
  options: DossierV4FixtureOptions = {},
): Promise<DossierV4Fixture> {
  const prescription = options.prescription ?? false
  const suffix = randomUUID().replaceAll('-', '').slice(0, 10)
  const key = `K1:E2EV4${suffix.toUpperCase()}`
  const slug = `e2e-v4-${suffix}`
  const name = `Fixture compound ${suffix}`
  const drugId = `e2e-v4-drug-${suffix}`

  await db.insert(corpusPages).values({
    key,
    slug,
    displayName: name,
    model: 'LONGEVITY',
    tier: 1,
    pageType: 'longevity',
    identityRank: 'K1',
    identityRule: 'FIXTURE',
    corpusDigest: 'e'.repeat(64),
    indexable: false,
    humanData: true,
  })

  await db.insert(pageSynonyms).values({
    id: `${suffix}`.padEnd(64, 'a').slice(0, 64),
    key,
    name: `${name} sodium`,
    kind: 'salt',
    source: 'fixture',
  })

  /*
   * Two related records and the links to them.
   *
   * The corpus loader drops a relation whose target page does not exist, and it names the relation
   * itself from its own vocabulary while using the stored label as the counterpart's name. Both
   * facts are easy to get backwards, so the fixture creates the targets and stores names.
   */
  const isomerKey = `${key}I`
  const rivalKey = `${key}R`
  await db.insert(corpusPages).values([
    {
      key: isomerKey,
      slug: `${slug}-isomer`,
      displayName: `Fixture compound ${suffix} isomer`,
      model: 'LONGEVITY',
      tier: 1,
      pageType: 'longevity',
      identityRank: 'K1',
      identityRule: 'FIXTURE',
      corpusDigest: 'f'.repeat(64),
      indexable: false,
      humanData: false,
    },
    {
      key: rivalKey,
      slug: `${slug}-rival`,
      displayName: `Another fixture compound ${suffix}`,
      model: 'LONGEVITY',
      tier: 1,
      pageType: 'longevity',
      identityRank: 'K1',
      identityRule: 'FIXTURE',
      corpusDigest: '0'.repeat(64),
      indexable: false,
      humanData: false,
    },
  ])
  await db.insert(pageRelations).values([
    {
      id: `${suffix}`.padEnd(64, 'd').slice(0, 64),
      key,
      relation: 'stereoisomer-of',
      targetKey: isomerKey,
      label: `Fixture compound ${suffix} isomer`,
      source: 'fixture',
    },
    {
      // A substance that hits the same target is a different substance, and the compass has to say
      // so rather than letting a reader carry a result across.
      id: `${suffix}`.padEnd(64, 'e').slice(0, 64),
      key,
      relation: 'same-target',
      targetKey: rivalKey,
      label: `Another fixture compound ${suffix}`,
      source: 'fixture',
    },
  ])

  await db.insert(pageRegistration).values({
    id: `${suffix}`.padEnd(64, 'b').slice(0, 64),
    key,
    jurisdiction: 'US',
    label: 'United States',
    status: prescription ? 'Approved' : 'Marketed',
    ordinal: 0,
    line: prescription
      ? 'Approved · 1 application: prescription · checked 2026-08-28'
      : 'Marketed · sold as a supplement · checked 2026-08-28',
    disclosed: false,
    dateChecked: '2026-08-28',
  })

  // Registered outcome-measure names the classifier has to sort into felt, measured and meaningful.
  await db.insert(pageFields).values({
    key,
    field: 'biomarkers',
    ordinal: 0,
    state: 'present',
    value: {
      terms: [
        'muscle strength',
        'lean mass',
        'overall survival',
        'hamilton depression rating scale',
        'glycated hemoglobin',
        'completion of study',
        'a fixture phrase no rule recognises',
      ],
    },
    sourceKind: 'fixture-registry',
    sourceDate: '2026-08-28',
  })

  /*
   * A recorded harm signal, because the self-experiment plan is gated on one.
   *
   * Without this row the fixture is a non-prescription supplement whose record holds nothing about
   * harm, and the page correctly refuses to offer a protocol to run on yourself. The fixture's
   * `deliverySystem.safetyProfile` string is not a source the safety builder reads, which is how
   * this fixture previously produced a plan with an empty safety section.
   */
  await db.insert(pageFields).values({
    key,
    field: 'faers',
    ordinal: 1,
    state: 'present',
    value: { terms: [{ term: 'fixture stomach upset', count: 3 }] },
    sourceKind: 'fixture-registry',
    sourceDate: '2026-08-28',
  })

  await db.insert(pageRegistryRoleAggregates).values({
    key,
    classifierVersion: 'trial-role-classifier/v1',
    snapshotDate: '2026-09-01',
    aggregate: {
      classifierVersion: 'trial-role-classifier/v1',
      snapshotDate: '2026-09-01',
      matchedStudies: 3,
      byRole: {
        experimental_intervention: 1,
        administered_role_unclear: 1,
        observational_exposure: 1,
      },
      synonymMatched: 0,
      excludedFromSizeStatistics: 0,
      plannedCompletionIgnored: 1,
      tested: {
        studies: 1,
        largest: { nctId: 'NCT00000001', enrollment: 120, enrollmentType: 'ACTUAL' },
        longestCompletedWindow: {
          nctId: 'NCT00000001',
          days: 365,
          startDate: '2020-01',
          completionDate: '2021-01',
        },
        medianEnrollment: 120,
        completedWithPostedResults: 0,
      },
      administeredRoleUnclear: 1,
      observationalExposure: 1,
      rows: [
        {
          nctId: 'NCT00000001',
          role: 'experimental_intervention',
          enrollment: 120,
          enrollmentType: 'ACTUAL',
          status: 'COMPLETED',
          startDate: '2020-01',
          completionDate: '2021-01',
          completionIsPlanned: false,
          phases: ['PHASE2'],
          synonymMatched: false,
        },
      ],
    },
  })

  await db.insert(entityCorrections).values({
    id: `${suffix}`.padEnd(64, 'c').slice(0, 64),
    subjectKind: 'synonym',
    subjectKey: key,
    subjectRef: 'A name that belonged elsewhere',
    action: 'remove_synonym',
    before: { name: 'A name that belonged elsewhere', kind: 'common' },
    after: { removed: true },
    reason: 'Fixture: a synonym that a name lookup attached to the wrong record was removed.',
    evidence: [{ source: 'fixture' }],
    operator: 'operator:e2e',
  })

  await db.insert(drugs).values({
    id: drugId,
    slug,
    name,
    sponsor: 'Fixture sponsor',
    targetGene: 'FIXTURE1',
    targetProtein: 'Fixture target protein',
    modality: 'Small Molecule',
    approvalStatus: prescription ? 'FDA Approved' : 'Non-FDA / Dietary Supplement',
    indication: 'Fixture indication, recorded and not reviewed.',
    patientFriendlyIndication: 'Taken in this fixture to test the compass, and for nothing else.',
    oneSentenceVerdict:
      'A fixture record used to test the page and not a statement about anything.',
    laymanHowItWorks:
      'The fixture compound is swallowed and reaches the fixture tissue. Inside the cell it changes one fixture step. That step is the only thing this record describes.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 50,
    anatomicalSite: 'Fixture tissue',
    hasDiscrepancy: false,
    dossierDepth: 'flagship',
    conditionContext: {
      conditionExplainer: 'A fixture explanation of a fixture condition.',
      whyItMatters: 'It matters here only because the test needs a sentence.',
      whoTakesThis: 'Fixture adults aged 30 to 50 in the fixture studies.',
      clinicalGoals: 'The fixture studies measured fixture strength and fixture survival.',
    },
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed and absorbed',
        laymanDesc: 'It survives the gut and reaches the blood.',
        molecularDetail: 'Measured in 12 fixture subjects by a fixture assay.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Carried into the cell',
        laymanDesc: 'A carrier pulls it across the cell wall.',
        molecularDetail: 'Shown in fixture mice and not in people.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Changes one step',
        laymanDesc: 'It changes one chemical step inside the cell.',
        molecularDetail: 'Described without a named measurement.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
    ],
    trials: [
      {
        trialId: 'Fixture trial one (NCT00000001)',
        phase: 'Randomised double-blind placebo-controlled',
        sampleSize: 120,
        primaryEndpoint: 'Change in fixture strength after 12 weeks',
        endpointMet: true,
        endpointStatus: 'met',
        statisticalPValue: 'P = 0.01 for fixture strength',
        unreportedAdverseSignals: 'A fixture limit. The note also names the field endpointMet.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Fixture trial two',
        phase: 'Phase 3',
        sampleSize: 400,
        primaryEndpoint: 'Overall survival over 4 years',
        endpointMet: false,
        endpointStatus: 'not_met',
        statisticalPValue: 'P = 0.60, no difference between arms',
        unreportedAdverseSignals: 'Halted for futility in this fixture.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    keyAudits: [
      {
        id: 'fix-a1',
        category: 'measured',
        title: 'Fixture trial one measured fixture strength',
        laymanSummary: 'The fixture trial measured strength and found a difference.',
        technicalDetails: 'A fixture description of a fixture measurement in 120 fixture subjects.',
        evidenceSource: 'Fixture source 2026',
        doi: '10.0000/fixture',
        measuredMetric: 'Fixture strength in fixture units',
        auditFlag: 'verified',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A fixture cell step was measured in fixture tissue',
        'Fixture strength rose over 12 weeks against a dummy treatment in 120 fixture adults',
      ],
      unsupportedInferences: ['That the fixture compound extends life, which no trial measured'],
      whatFailedInitially: ['A fixture survival trial in 400 people showed no difference'],
      realWorldOutcome: ['Roughly half the fixture subjects showed no change at all'],
    },
    deliverySystem: {
      type: 'Fixture oral powder',
      description:
        'Sold in this fixture as a supplement, so no agency reviewed it before sale. Other fixture forms have not reproduced this fixture evidence.',
      safetyProfile: 'A fixture safety note describing fixture stomach upset.',
    },
    commonQuestions: [],
    sourceProvenance: ['Fixture source 2026 (10.0000/fixture)'],
    // A sentence-bound, entirely fictional source is required to exercise the public wording
    // workflow. A bibliography entry alone must never make authored medicine prose publishable.
    recordedBackground: {
      version: 'medicine-background/v1',
      authoredAt: '2026-08-28',
      provenanceTier: 'extracted',
      recordedUses: {
        statements: [
          {
            textAsRecorded: 'Taken in this fixture to test the compass, and for nothing else.',
            source: {
              kind: 'FDA_LABEL',
              identifier: '00000000-0000-4000-8000-00000000e2e4',
              label: 'Fictional fixture label',
              retrievedAt: '2026-08-28',
              excerpt: 'Taken in this fixture to test the compass, and for nothing else.',
            },
          },
        ],
      },
    },
  })

  return { key, slug, name, drugId, isomerKey, rivalKey }
}

export async function removeDossierV4Fixture(fixture: DossierV4Fixture | null): Promise<void> {
  if (!fixture) return
  // The correction ledger is append-only by design; its row stays in the disposable database, which
  // the runner drops at the end of the run.
  await db.delete(drugs).where(eq(drugs.id, fixture.drugId))
  await db.delete(pageRegistryRoleAggregates).where(eq(pageRegistryRoleAggregates.key, fixture.key))
  await db.delete(pageFields).where(eq(pageFields.key, fixture.key))
  await db.delete(pageRegistration).where(eq(pageRegistration.key, fixture.key))
  await db.delete(pageRelations).where(eq(pageRelations.key, fixture.key))
  await db.delete(pageSynonyms).where(eq(pageSynonyms.key, fixture.key))
  await db.delete(corpusPages).where(eq(corpusPages.key, fixture.isomerKey))
  await db.delete(corpusPages).where(eq(corpusPages.key, fixture.rivalKey))
}
