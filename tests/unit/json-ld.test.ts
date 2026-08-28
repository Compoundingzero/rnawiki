import { describe, expect, it } from 'vitest'

import {
  dossierJsonLdGraph,
  drugJsonLd,
  profileJsonLdGraph,
  serialiseJsonLd,
  siteJsonLdGraph,
} from '@/lib/json-ld'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import type { DrugDossier } from '@/lib/types'

const drug = {
  id: 'example-medicine',
  name: 'Example Medicine',
  sponsor: '',
  targetGene: '',
  targetProtein: '',
  modality: 'Small Molecule',
  approvalStatus: 'Phase 2 Investigational',
  indication: 'Legacy indication',
  patientFriendlyIndication: 'Legacy use',
  oneSentenceVerdict: 'Legacy medicine-wide conclusion',
  laymanHowItWorks: 'Legacy mechanism',
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

function dossier(bindingState: MedicineDossierViewModel['bindingState']): MedicineDossierViewModel {
  return {
    slug: drug.id,
    name: drug.name,
    modality: drug.modality,
    approvalStatus: 'Active',
    statusBadge: { kind: 'programme_status', value: 'Active' },
    programmes: [],
    selectedProgrammeId: 'programme-1',
    selectedProgrammeLabel: 'One specific use',
    selectedProgrammeStatus: 'Active',
    bindingState,
    verdict: bindingState === 'published_programme' ? 'Reviewed programme conclusion' : '',
    readerSummary: {
      basis:
        bindingState === 'published_programme' ? 'published_programme' : 'unpublished_programme',
      usedFor: 'Used or studied for one specific use.',
      ...(bindingState === 'published_programme'
        ? { whatStudiesFound: 'Reviewed programme conclusion.' }
        : {}),
      takeaway:
        bindingState === 'published_programme'
          ? 'Reviewed programme conclusion'
          : 'No reviewed plain-language answer has been published for this use.',
      simplified: false,
      contextItems: [],
    },
    mechanismSummary: {
      change: bindingState === 'published_programme' ? 'Reviewed programme mechanism' : undefined,
    },
    tenSecondWordCount: 0,
    evidenceNodes: [],
    studies: [],
    keyOutcomes: [],
    mechanismSteps: [],
    timelineEvents: [],
    sources: [],
    freshness: 'unknown',
    freshnessLabel: 'Audit not completed',
    review: { historyHref: '/history' },
    machineFindingCodes: [],
    medicineRecord: {
      conventionalAlternatives: [],
      commonQuestions: [],
      communityNotes: [],
    },
  }
}

function publishedDossier(): MedicineDossierViewModel {
  return {
    ...dossier('published_programme'),
    readerSummary: {
      ...dossier('published_programme').readerSummary,
      whatStudiesFoundSourceFieldPath: 'summary.bestSupportedFinding',
    },
    mechanismSummary: {
      change: 'Reviewed programme mechanism',
      observed: 'Reviewed programme conclusion',
    },
    summaryEvidence: {
      'summary.bestSupportedFinding': {
        fieldPath: 'summary.bestSupportedFinding',
        claimIds: ['claim-finding'],
        sourceIds: ['snapshot-1'],
        verdictClaimBindings: [{ claimId: 'claim-finding', relationship: 'SUPPORTING' }],
        sourceClaimBindings: [
          {
            sourceId: 'snapshot-1',
            claimId: 'claim-finding',
            relationship: 'SUPPORTS',
            statement: 'The recorded result supports the scoped conclusion.',
          },
        ],
      },
      'summary.plainMechanism': {
        fieldPath: 'summary.plainMechanism',
        claimIds: ['claim-mechanism'],
        sourceIds: ['snapshot-1'],
        verdictClaimBindings: [{ claimId: 'claim-mechanism', relationship: 'SUPPORTING' }],
        sourceClaimBindings: [
          {
            sourceId: 'snapshot-1',
            claimId: 'claim-mechanism',
            relationship: 'SUPPORTS',
            statement: 'The recorded source supports the reviewed mechanism.',
          },
        ],
      },
    },
    review: {
      revisionId: 'verdict-revision-1',
      publishedAt: '2026-08-22T09:30:00.000Z',
      reviewedAt: '2026-08-21T00:00:00.000Z',
      historyHref: '/d/example-medicine/programme/programme-1/history',
    },
    conclusion: {
      publicLabel: 'Reviewed programme conclusion',
      professionalLabel: 'Recorded professional classification',
      reason: 'The recorded result supports the scoped conclusion.',
      scope: {
        indication: 'One specific use',
        population: 'The recorded study population',
        doseExposure: 'The recorded exposure',
        period: 'The recorded study period',
        trials: 'NCT00000001',
        outcome: 'The recorded primary outcome',
      },
      whatWasDisproven: [],
      whatWasNotDisproven: [],
      whatRemainsUnknown: ['Longer-term effects remain unknown.'],
      confidence: 'Moderate',
      conditionsThatWouldChangeVerdict: [],
      authorName: 'Recorded Author',
      authorHandle: 'recorded-author',
      conflictsOfInterest: 'A conflict statement is on record.',
      independentReviewCount: 1,
      reviewers: [
        {
          id: 'reviewer-1',
          name: 'Recorded Reviewer',
          orcid: '0000-0001-2345-6789',
          expertiseTags: ['CLINICAL_PHARMACOLOGY'],
          decision: 'Approved',
          reviewedAt: '2026-08-21T00:00:00.000Z',
          independent: true,
        },
      ],
    },
    sources: [
      {
        id: 'snapshot-1',
        label: 'Recorded trial registry snapshot',
        href: 'https://clinicaltrials.gov/study/NCT00000001',
        identifier: 'NCT00000001',
        snapshotHash: 'abc123',
        retrievedAt: '2026-08-19T00:00:00.000Z',
        verifiedAt: '2026-08-20T00:00:00.000Z',
        freshness: 'current',
      },
    ],
  }
}

function eligibleLegacyDrug(): DrugDossier {
  return {
    ...drug,
    dossierDepth: 'flagship',
    sourceProvenance: ['Exact stored legacy source (PMID 12345678)'],
    recentAuditDate: 'August 2026',
  }
}

function eligibleLegacyDossier(): MedicineDossierViewModel {
  return {
    ...dossier('legacy_record'),
    readerSummary: {
      ...dossier('legacy_record').readerSummary,
      usedFor: 'Used for one recorded purpose.',
      whatStudiesFound: 'The stored research reported one measured result.',
      biggestLimit: 'The main unanswered question remains recorded.',
      authoredEvidenceBinding: {
        kind: 'legacy_answer_and_evidence_fingerprint',
        version: 'legacy-ten-second-answer/v2',
        fingerprint: `sha256:${'a'.repeat(64)}`,
      },
    },
    sources: [
      {
        id: 'legacy-audit-source',
        label: 'Exact stored audit source',
        identifier: '10.1000/example',
        freshness: 'unknown',
      },
    ],
  }
}

/** The recorded "Technical identity" source exactly as the view model passes it to the page. */
function withMolecularSource(
  base: MedicineDossierViewModel,
  source: { label: string; identifier: string; href?: string },
): MedicineDossierViewModel {
  return {
    ...base,
    medicineRecord: {
      ...base.medicineRecord,
      molecular: {
        identifiers: [{ label: 'Chemical formula', value: 'C21H18F3N3O5', kind: 'formula' }],
        structureCheck: 'not_passed',
        source,
      },
    },
  }
}

describe('programme-aware dossier JSON-LD', () => {
  it('suppresses reviewed claim fields when exact summary dependencies are absent', () => {
    const result = drugJsonLd(
      drug,
      'https://rnawiki.com/d/example-medicine?programme=programme-1',
      dossier('published_programme'),
    )

    expect(result.url).toBe('https://rnawiki.com/d/example-medicine?programme=programme-1')
    expect(result.description).toBeUndefined()
    expect(result.mechanismOfAction).toBeUndefined()
  })

  it('uses reviewed fields only when exact dependencies bind them to emitted sources', () => {
    expect(
      drugJsonLd(
        drug,
        'https://rnawiki.com/d/example-medicine?programme=programme-1',
        publishedDossier(),
      ),
    ).toMatchObject({
      description: 'Reviewed programme conclusion.',
      mechanismOfAction: 'Reviewed programme mechanism',
    })
  })

  it('does not relabel legacy prose as a conclusion for an unpublished programme', () => {
    const result = drugJsonLd(
      drug,
      'https://rnawiki.com/d/example-medicine?programme=programme-1',
      dossier('programme_unpublished'),
    )

    expect(result.description).toBe(
      'Example Medicine: RNAWiki has not published a reviewed conclusion for One specific use yet.',
    )
    expect(result.mechanismOfAction).toBeUndefined()
    expect(result.description).not.toContain('Legacy medicine-wide conclusion')
  })

  it('does not expose unscoped legacy medical prose to search engines', () => {
    const result = drugJsonLd(
      drug,
      'https://rnawiki.com/d/example-medicine',
      dossier('legacy_record'),
    )

    expect(result.description).toBeUndefined()
    expect(result.mechanismOfAction).toBeUndefined()
  })

  it('escapes script-breaking text before it is inlined', () => {
    expect(serialiseJsonLd({ value: '</script><script>alert(1)</script>' })).not.toContain(
      '</script>',
    )
  })
})

describe('connected public JSON-LD graphs', () => {
  it('connects the site to its publisher without inventing legal or contact details', () => {
    expect(siteJsonLdGraph({ siteUrl: 'https://rnawiki.com' })).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://rnawiki.com/#organization',
          name: 'RNAWiki',
          url: 'https://rnawiki.com/',
        },
        {
          '@type': 'WebSite',
          '@id': 'https://rnawiki.com/#website',
          url: 'https://rnawiki.com/',
          name: 'RNAWiki',
          description:
            'Plain-language medicine records that show what studies measured, which sources support each conclusion, and what remains unknown.',
          inLanguage: 'en',
          publisher: { '@id': 'https://rnawiki.com/#organization' },
        },
      ],
    })
  })

  it('emits no rich dossier graph unless eligibility and publication provenance agree', () => {
    const options = {
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine/programme/programme-1',
    }

    expect(dossierJsonLdGraph(drug, publishedDossier(), { ...options, eligible: false })).toBeNull()
    expect(
      dossierJsonLdGraph(drug, dossier('programme_unpublished'), {
        ...options,
        eligible: true,
      }),
    ).toBeNull()
    expect(
      dossierJsonLdGraph(
        drug,
        { ...publishedDossier(), sources: [] },
        { ...options, eligible: true },
      ),
    ).toBeNull()
    expect(
      dossierJsonLdGraph(
        drug,
        {
          ...publishedDossier(),
          review: { ...publishedDossier().review, publishedAt: 'not-a-recorded-date' },
        },
        { ...options, eligible: true },
      ),
    ).toBeNull()
  })

  it('emits a smaller sourced graph for an eligible provenance-bound flagship legacy answer', () => {
    const legacyDrug: DrugDossier = {
      ...drug,
      dossierDepth: 'flagship',
      sourceProvenance: ['Exact stored legacy source (PMID 12345678)'],
      recentAuditDate: 'August 2026',
    }
    const legacyDossier: MedicineDossierViewModel = {
      ...dossier('legacy_record'),
      readerSummary: {
        ...dossier('legacy_record').readerSummary,
        usedFor: 'Used for one recorded purpose.',
        whatStudiesFound: 'The stored research reported one measured result.',
        biggestLimit: 'The main unanswered question remains recorded.',
        authoredEvidenceBinding: {
          kind: 'legacy_answer_and_evidence_fingerprint',
          version: 'legacy-ten-second-answer/v2',
          fingerprint: `sha256:${'a'.repeat(64)}`,
        },
      },
      sources: [
        {
          id: 'legacy-audit-source',
          label: 'Exact stored audit source',
          identifier: '10.1000/example',
          freshness: 'unknown',
        },
      ],
    }

    const graph = dossierJsonLdGraph(legacyDrug, legacyDossier, {
      eligible: true,
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine',
    })

    expect(graph).not.toBeNull()
    const nodes = graph?.['@graph'] ?? []
    expect(nodes.find((node) => Array.isArray(node['@type']))).toMatchObject({
      name: 'Example Medicine medicine evidence summary',
      description: 'The stored research reported one measured result.',
      dateModified: '2026-08-01T00:00:00.000Z',
      lastReviewed: '2026-08-01T00:00:00.000Z',
    })
    expect(nodes.find((node) => Array.isArray(node['@type']))).not.toHaveProperty('datePublished')
    expect(nodes.find((node) => node['@type'] === 'Drug')).toMatchObject({
      description: 'The stored research reported one measured result.',
    })
    expect(
      nodes.filter((node) => node['@type'] === 'CreativeWork').map((node) => node.name),
    ).toEqual(['Exact stored audit source', 'Exact stored legacy source (PMID 12345678)'])
    expect(nodes.some((node) => node['@type'] === 'Person')).toBe(false)
  })

  it('connects a published dossier to handle-first authorship, dates, breadcrumbs, and exact sources', () => {
    const graph = dossierJsonLdGraph(drug, publishedDossier(), {
      eligible: true,
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine/programme/programme-1',
    })

    expect(graph).not.toBeNull()
    expect(graph).toMatchObject({ '@context': 'https://schema.org' })
    const nodes = graph?.['@graph'] ?? []
    expect(nodes.find((node) => Array.isArray(node['@type']))).toMatchObject({
      '@type': ['MedicalWebPage', 'WebPage'],
      '@id': 'https://rnawiki.com/d/example-medicine/programme/programme-1#webpage',
      url: 'https://rnawiki.com/d/example-medicine/programme/programme-1',
      name: 'Example Medicine — One specific use',
      description: 'Reviewed programme conclusion.',
      publisher: { '@id': 'https://rnawiki.com/#organization' },
      isPartOf: { '@id': 'https://rnawiki.com/#website' },
      mainEntity: {
        '@id': 'https://rnawiki.com/d/example-medicine/programme/programme-1#medicine',
      },
      author: {
        '@id': 'https://rnawiki.com/u/recorded-author#person',
      },
      citation: [
        {
          '@id': 'https://rnawiki.com/d/example-medicine/programme/programme-1#source-snapshot-1',
        },
      ],
      datePublished: '2026-08-22T09:30:00.000Z',
      dateModified: '2026-08-22T09:30:00.000Z',
      lastReviewed: '2026-08-21T00:00:00.000Z',
    })
    expect(nodes.find((node) => node['@type'] === 'Drug')).toMatchObject({
      '@id': 'https://rnawiki.com/d/example-medicine/programme/programme-1#medicine',
      name: 'Example Medicine',
      description: 'Reviewed programme conclusion.',
      mechanismOfAction: 'Reviewed programme mechanism',
      mainEntityOfPage: {
        '@id': 'https://rnawiki.com/d/example-medicine/programme/programme-1#webpage',
      },
    })
    const author = nodes.find(
      (node) => node['@type'] === 'Person' && 'name' in node && node.name === '@recorded-author',
    )
    expect(author).toMatchObject({
      '@type': 'Person',
      '@id': 'https://rnawiki.com/u/recorded-author#person',
      name: '@recorded-author',
      url: 'https://rnawiki.com/u/recorded-author',
    })
    expect(author).not.toHaveProperty('sameAs')
    expect(author).not.toHaveProperty('identifier')
    expect(serialiseJsonLd(graph)).not.toContain('Recorded Reviewer')
    expect(nodes.find((node) => Array.isArray(node['@type']))).not.toHaveProperty('reviewedBy')
    expect(nodes.find((node) => node['@type'] === 'CreativeWork')).toMatchObject({
      name: 'Recorded trial registry snapshot',
      url: 'https://clinicaltrials.gov/study/NCT00000001',
      identifier: [
        'NCT00000001',
        { '@type': 'PropertyValue', propertyID: 'sha256', value: 'abc123' },
      ],
    })
    expect(nodes.find((node) => node['@type'] === 'BreadcrumbList')).toMatchObject({
      itemListElement: [
        { position: 1, name: 'RNAWiki', item: 'https://rnawiki.com/' },
        { position: 2, name: 'Medicines', item: 'https://rnawiki.com/browse' },
        {
          position: 3,
          name: 'Example Medicine',
          item: 'https://rnawiki.com/d/example-medicine/programme/programme-1',
        },
      ],
    })
    expect(serialiseJsonLd(graph)).not.toContain('Legacy medicine-wide conclusion')
  })

  it('omits free-text authorship when no public account handle is bound', () => {
    const withoutHandle = publishedDossier()
    withoutHandle.conclusion = withoutHandle.conclusion
      ? { ...withoutHandle.conclusion, authorHandle: undefined, authorName: 'Dr Unverified Name' }
      : undefined

    const graph = dossierJsonLdGraph(drug, withoutHandle, {
      eligible: true,
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine/programme/programme-1',
    })

    const page = graph?.['@graph'].find((node) => Array.isArray(node['@type']))
    expect(graph).not.toBeNull()
    expect(page).not.toHaveProperty('author')
    expect(page).not.toHaveProperty('reviewedBy')
    expect(graph?.['@graph'].some((node) => node['@type'] === 'Person')).toBe(false)
    expect(serialiseJsonLd(graph)).not.toContain('Dr Unverified Name')
    expect(serialiseJsonLd(graph)).not.toContain('Recorded Reviewer')
  })

  it('keeps the graph but suppresses claim fields when a dependency source is not emitted', () => {
    const dossierWithDanglingFieldEvidence = publishedDossier()
    dossierWithDanglingFieldEvidence.summaryEvidence = {
      ...dossierWithDanglingFieldEvidence.summaryEvidence,
      'summary.bestSupportedFinding': {
        fieldPath: 'summary.bestSupportedFinding',
        claimIds: ['claim-finding'],
        sourceIds: ['missing-snapshot'],
        verdictClaimBindings: [{ claimId: 'claim-finding', relationship: 'SUPPORTING' }],
        sourceClaimBindings: [
          {
            sourceId: 'missing-snapshot',
            claimId: 'claim-finding',
            relationship: 'SUPPORTS',
            statement: 'A claim cannot cite a source node that the graph does not emit.',
          },
        ],
      },
      'summary.plainMechanism': {
        fieldPath: 'summary.plainMechanism',
        claimIds: ['claim-mechanism'],
        sourceIds: ['missing-snapshot'],
        verdictClaimBindings: [{ claimId: 'claim-mechanism', relationship: 'SUPPORTING' }],
        sourceClaimBindings: [
          {
            sourceId: 'missing-snapshot',
            claimId: 'claim-mechanism',
            relationship: 'SUPPORTS',
            statement: 'A mechanism cannot cite a source node that the graph does not emit.',
          },
        ],
      },
    }

    const graph = dossierJsonLdGraph(drug, dossierWithDanglingFieldEvidence, {
      eligible: true,
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine/programme/programme-1',
    })

    expect(graph).not.toBeNull()
    const nodes = graph?.['@graph'] ?? []
    expect(nodes.find((node) => Array.isArray(node['@type']))).not.toHaveProperty('description')
    expect(nodes.find((node) => node['@type'] === 'Drug')).not.toHaveProperty('description')
    expect(nodes.find((node) => node['@type'] === 'Drug')).not.toHaveProperty('mechanismOfAction')
    expect(nodes.find((node) => node['@type'] === 'CreativeWork')).toMatchObject({
      '@id': 'https://rnawiki.com/d/example-medicine/programme/programme-1#source-snapshot-1',
    })
  })

  it('keeps CreativeWork fragments byte-identical to the page source anchors', () => {
    // components/MedicineDossierV2.tsx renders `<li id={`source-${source.id}`}>` with the raw
    // stored id. Legacy audit sources use ids such as `doi:10.1056/nejmoa1912387`; the graph must
    // not percent-encode what the page leaves raw, or the fragment stops naming the anchor.
    const legacyDrug = eligibleLegacyDrug()
    const legacyDossier = eligibleLegacyDossier()
    legacyDossier.sources = [
      {
        id: 'doi:10.1056/nejmoa1912387',
        label: 'Exact stored audit source',
        identifier: '10.1056/NEJMoa1912387',
        freshness: 'unknown',
      },
    ]

    const graph = dossierJsonLdGraph(legacyDrug, legacyDossier, {
      eligible: true,
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine',
    })

    const nodes = graph?.['@graph'] ?? []
    const citation = nodes.find(
      (node) => node['@type'] === 'CreativeWork' && node.name === 'Exact stored audit source',
    )
    expect(citation).toMatchObject({
      '@id': 'https://rnawiki.com/d/example-medicine#source-doi:10.1056/nejmoa1912387',
    })
    expect(serialiseJsonLd(graph)).not.toContain('source-doi%3A')
  })

  it('links a recorded PubChem compound URL as a medicine identifier on the legacy graph', () => {
    const legacyDossier = withMolecularSource(eligibleLegacyDossier(), {
      label: 'PubChem CID 90311989 (example medicine) — SMILES, molecular formula and weight',
      identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/90311989',
      href: 'https://pubchem.ncbi.nlm.nih.gov/compound/90311989',
    })

    const graph = dossierJsonLdGraph(eligibleLegacyDrug(), legacyDossier, {
      eligible: true,
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine',
    })

    const medicine = graph?.['@graph'].find((node) => node['@type'] === 'Drug')
    expect(medicine).toMatchObject({
      identifier: [{ '@type': 'PropertyValue', propertyID: 'PubChem CID', value: '90311989' }],
      sameAs: ['https://pubchem.ncbi.nlm.nih.gov/compound/90311989'],
    })
  })

  it('prefers a recorded registry CID from the background layer over URL extraction', () => {
    const drug = {
      ...eligibleLegacyDrug(),
      recordedBackground: {
        version: 'medicine-background/v1' as const,
        authoredAt: '2026-08-27',
        registryIdentifiers: {
          pubchemCid: '12345',
          unii: '53AXN4NNHX',
          casNumber: '910463-68-2',
          source: {
            kind: 'PUBCHEM' as const,
            identifier: '12345',
            label: 'PubChem compound record',
            retrievedAt: '2026-08-27',
          },
        },
      },
    }
    // The structure source records a DIFFERENT CID; the fetched registry identifier must win.
    const legacyDossier = withMolecularSource(eligibleLegacyDossier(), {
      label: 'PubChem CID 90311989 (example medicine)',
      identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/90311989',
      href: 'https://pubchem.ncbi.nlm.nih.gov/compound/90311989',
    })

    const graph = dossierJsonLdGraph(drug, legacyDossier, {
      eligible: true,
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine',
    })

    const medicine = graph?.['@graph'].find((node) => node['@type'] === 'Drug')
    expect(medicine).toMatchObject({
      identifier: [
        { '@type': 'PropertyValue', propertyID: 'PubChem CID', value: '12345' },
        { '@type': 'PropertyValue', propertyID: 'FDA UNII', value: '53AXN4NNHX' },
        { '@type': 'PropertyValue', propertyID: 'CAS Registry Number', value: '910463-68-2' },
      ],
      sameAs: ['https://pubchem.ncbi.nlm.nih.gov/compound/12345'],
    })
  })

  it('matches the recorded label against the medicine name without its trailing parenthetical', () => {
    const thcDrug = { ...eligibleLegacyDrug(), name: 'Delta-9-Tetrahydrocannabinol (THC)' }
    const legacyDossier = withMolecularSource(
      { ...eligibleLegacyDossier(), name: thcDrug.name },
      {
        label:
          'PubChem CID 16078 (dronabinol, delta-9-tetrahydrocannabinol) — SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16078',
      },
    )

    const graph = dossierJsonLdGraph(thcDrug, legacyDossier, {
      eligible: true,
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine',
    })

    expect(graph?.['@graph'].find((node) => node['@type'] === 'Drug')).toMatchObject({
      sameAs: ['https://pubchem.ncbi.nlm.nih.gov/compound/16078'],
    })
  })

  it('never promotes a recorded constituent CID into an identifier for a differently named medicine', () => {
    // The corpus really contains this shape: the "Cannabis (Plant Preparation)" record stores the
    // dronabinol compound page as its structure source. The whole preparation is not that molecule.
    const cannabisDrug = { ...eligibleLegacyDrug(), name: 'Cannabis (Plant Preparation)' }
    const cannabisDossier = withMolecularSource(
      { ...eligibleLegacyDossier(), name: cannabisDrug.name },
      {
        label:
          'PubChem CID 16078 (dronabinol, delta-9-tetrahydrocannabinol) — SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16078',
      },
    )
    const cannabisGraph = dossierJsonLdGraph(cannabisDrug, cannabisDossier, {
      eligible: true,
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine',
    })
    expect(serialiseJsonLd(cannabisGraph)).not.toContain('sameAs')
    expect(serialiseJsonLd(cannabisGraph)).not.toContain('PubChem CID')

    // A name that is only a substring inside a longer molecule name is not a match either.
    const morphineDrug = { ...eligibleLegacyDrug(), name: 'Morphine' }
    const morphineDossier = withMolecularSource(
      { ...eligibleLegacyDossier(), name: morphineDrug.name },
      {
        label: 'PubChem CID 5284570 (hydromorphone) — SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284570',
      },
    )
    const morphineGraph = dossierJsonLdGraph(morphineDrug, morphineDossier, {
      eligible: true,
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine',
    })
    expect(serialiseJsonLd(morphineGraph)).not.toContain('sameAs')
  })

  it('omits identifier linkage for every recorded shape that is not exactly a compound URL', () => {
    const rejectedIdentifiers = [
      '10.1124/molpharm.124.000895',
      'http://pubchem.ncbi.nlm.nih.gov/compound/90311989',
      'https://pubchem.ncbi.nlm.nih.gov/compound/90311989?from=search',
      'https://pubchem.ncbi.nlm.nih.gov/compound/90311989#section',
      'https://pubchem.ncbi.nlm.nih.gov/substance/90311989',
      'https://pubchem.ncbi.nlm.nih.gov/compound/90311989/section',
      'https://pubchem.ncbi.nlm.nih.gov.evil.example/compound/90311989',
      'https://pubchem.ncbi.nlm.nih.gov/compound/0123',
      'not a url',
    ]

    for (const identifier of rejectedIdentifiers) {
      const legacyDossier = withMolecularSource(eligibleLegacyDossier(), {
        label: 'PubChem CID 90311989 (example medicine) — SMILES, molecular formula and weight',
        identifier,
      })
      const graph = dossierJsonLdGraph(eligibleLegacyDrug(), legacyDossier, {
        eligible: true,
        siteUrl: 'https://rnawiki.com',
        url: 'https://rnawiki.com/d/example-medicine',
      })
      expect(graph, identifier).not.toBeNull()
      expect(serialiseJsonLd(graph), identifier).not.toContain('sameAs')
    }

    // No recorded molecular source at all: the eligible graph is unchanged and claims nothing.
    const withoutSource = dossierJsonLdGraph(eligibleLegacyDrug(), eligibleLegacyDossier(), {
      eligible: true,
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine',
    })
    expect(withoutSource).not.toBeNull()
    expect(serialiseJsonLd(withoutSource)).not.toContain('sameAs')
  })

  it('keeps the recorded-identifier linkage off the published-programme graph', () => {
    // The published graph describes a programme-scoped reviewed conclusion; the medicine-wide
    // molecular record only feeds the legacy compatibility graph today. Widening that is an
    // owner decision, not a side effect.
    const published = withMolecularSource(publishedDossier(), {
      label: 'PubChem CID 90311989 (example medicine) — SMILES, molecular formula and weight',
      identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/90311989',
    })

    const graph = dossierJsonLdGraph(drug, published, {
      eligible: true,
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine',
    })

    expect(graph).not.toBeNull()
    expect(serialiseJsonLd(graph)).not.toContain('sameAs')
    expect(serialiseJsonLd(graph)).not.toContain('PubChem CID')
  })

  it('emits no question, product, offer, rating or how-to markup on any dossier graph', () => {
    const legacyGraph = dossierJsonLdGraph(
      eligibleLegacyDrug(),
      withMolecularSource(eligibleLegacyDossier(), {
        label: 'PubChem CID 90311989 (example medicine) — SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/90311989',
      }),
      {
        eligible: true,
        siteUrl: 'https://rnawiki.com',
        url: 'https://rnawiki.com/d/example-medicine',
      },
    )
    const publishedGraph = dossierJsonLdGraph(drug, publishedDossier(), {
      eligible: true,
      siteUrl: 'https://rnawiki.com',
      url: 'https://rnawiki.com/d/example-medicine/programme/programme-1',
    })

    for (const graph of [legacyGraph, publishedGraph]) {
      const serialised = serialiseJsonLd(graph)
      for (const forbidden of [
        'FAQPage',
        'QAPage',
        'Question',
        'Product',
        'Offer',
        'Review',
        'AggregateRating',
        'HowTo',
      ]) {
        expect(serialised).not.toContain(`"${forbidden}"`)
      }
    }
  })

  it('builds a public ProfilePage graph from the same facts shown on the profile', () => {
    const graph = profileJsonLdGraph(
      {
        handle: 'recorded-reviewer',
        name: 'Recorded Reviewer',
        orcid: '0000-0001-2345-6789',
      },
      {
        siteUrl: 'https://rnawiki.com',
        url: 'https://rnawiki.com/u/recorded-reviewer',
      },
    )

    expect(graph['@graph'].find((node) => node['@type'] === 'ProfilePage')).toMatchObject({
      '@id': 'https://rnawiki.com/u/recorded-reviewer#profile-page',
      name: 'Recorded Reviewer (@recorded-reviewer)',
      mainEntity: { '@id': 'https://rnawiki.com/u/recorded-reviewer#person' },
      publisher: { '@id': 'https://rnawiki.com/#organization' },
    })
    expect(graph['@graph'].find((node) => node['@type'] === 'Person')).toEqual({
      '@type': 'Person',
      '@id': 'https://rnawiki.com/u/recorded-reviewer#person',
      name: 'Recorded Reviewer',
      url: 'https://rnawiki.com/u/recorded-reviewer',
      alternateName: '@recorded-reviewer',
    })
    expect(serialiseJsonLd(graph)).not.toContain('0000-0001-2345-6789')
    expect(serialiseJsonLd(graph)).not.toMatch(/physician|institution|specialty/i)
  })
})
