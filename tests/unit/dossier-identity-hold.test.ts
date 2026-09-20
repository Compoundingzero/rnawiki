import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CompassPage } from '@/components/dossier/v4/CompassPage'
import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import { decidePublicationState } from '@/lib/dossier-v4/publication-state'
import type { DossierV4ViewModel } from '@/lib/dossier-v4/view-model'
import { PUBLIC_IDENTITY_PROTECTIONS } from '@/lib/inventory/public-identity-protections'

const knownIssue = PUBLIC_IDENTITY_PROTECTIONS['magnesium-glycinate'].readerNotice

function heldPage(): string {
  const publication = decidePublicationState({
    reviewedClaimCount: 1,
    hasApprovedFirstRead: true,
    hasSourceLinkedContent: true,
    identityPassed: false,
    identityIssue: knownIssue,
    criticalIdentityConflict: false,
    pipelineFailed: false,
    hasAnyUsefulFact: true,
  })
  const corpus = {
    slug: 'magnesium-glycinate',
    displayName: 'Magnesium glycinate',
    synonyms: [],
  } as unknown as CorpusDossier
  const model = {
    publication,
    identity: {
      canonicalName: 'Magnesium glycinate',
      substanceType: 'Supplement ingredient',
      substanceTypeCode: 'supplement_ingredient',
      substanceTypeBasis: 'Fixture',
      availability: 'Non-prescription',
      availabilityCode: 'non_prescription',
      availabilityBasis: 'Fixture',
      jurisdictions: [],
      identityVerified: false,
      identityLabel: 'Record link mismatch',
    },
    formCheck: { entries: [] },
    hero: {
      strongestGoalResult: { origin: 'reviewed_claim', text: 'WRONG LEGACY VERDICT' },
      resultScope: 'Fixture',
    },
    v3: { doesItWork: { registry: { tested: 5 } } },
    substance: { empty: false },
  } as unknown as DossierV4ViewModel
  return renderToStaticMarkup(React.createElement(CompassPage, { corpus, model }))
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('identity correction hold', () => {
  it('keeps health claims off the held magnesium record even in editorial preview', () => {
    vi.stubGlobal('React', React)
    vi.stubEnv('RNAWIKI_PREVIEW_EDITORIAL', '1')
    const html = heldPage()
    expect(html).toContain('Magnesium glycinate and glycine are different substances')
    expect(html).toContain('https://pubchem.ncbi.nlm.nih.gov/compound/84645')
    expect(html).toContain('href="/life-test"')
    expect(html).not.toContain('WRONG LEGACY VERDICT')
    expect(html).not.toContain('Four weeks of magnesium bisglycinate')
    expect(html).not.toContain('The short answer')
  })

  it('links to the separate public example without exposing the mismatched record', () => {
    vi.stubGlobal('React', React)
    vi.stubEnv('RNAWIKI_PREVIEW_EDITORIAL', '0')
    const html = heldPage()
    expect(html).toContain('Magnesium glycinate and glycine are different substances')
    expect(html).toContain('href="/life-test"')
    expect(html).not.toContain('WRONG LEGACY VERDICT')
  })
})
