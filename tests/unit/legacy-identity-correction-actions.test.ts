import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const componentSource = readFileSync(
  join(process.cwd(), 'components/LegacyIdentityCorrectionActions.tsx'),
  'utf8',
)
const dossierSource = readFileSync(join(process.cwd(), 'components/MedicineDossierV2.tsx'), 'utf8')
const homeSource = [
  readFileSync(join(process.cwd(), 'components/HomeView.tsx'), 'utf8'),
  readFileSync(join(process.cwd(), 'components/HomeSearch.tsx'), 'utf8'),
].join('\n')
const normalized = componentSource.replace(/\s+/g, ' ')

describe('legacy identity correction UI contract', () => {
  it('is confined to the expanded legacy dossier and leaves the home screen alone', () => {
    expect(dossierSource).toContain("bindingState === 'legacy_record'")
    expect(dossierSource).toContain('<LegacyIdentityCorrectionActions')
    expect(homeSource).not.toContain('LegacyIdentityCorrectionActions')
    expect(homeSource).not.toContain('Suggest a correction')
  })

  it('offers exactly the two identity fields and an explicit trade-name removal', () => {
    expect(normalized).toContain("['name', 'Medicine name']")
    expect(normalized).toContain("['tradeName', 'Trade or brand name']")
    expect(normalized).toContain('Remove the recorded trade or brand name')
    expect(normalized).toContain("field === 'tradeName' && removeTradeName ? null")
    for (const forbidden of ['Safety field', 'Efficacy field', 'Mechanism field', 'Trial field']) {
      expect(normalized).not.toContain(forbidden)
    }
  })

  it('requires source provenance and a public explanation without machine endorsement', () => {
    for (const phrase of [
      'Source page title',
      'Public source URL',
      'Why should this name change?',
      'This explanation becomes part of the public history',
      'RNAWiki does not fetch it or claim that software verified it',
      'Submit for independent review',
      'The total can change as people review the queue',
      'Technical reference',
    ]) {
      expect(normalized).toContain(phrase)
    }
    expect(componentSource).toContain('type="url"')
    expect(componentSource).toContain('maxLength={2048}')
    expect(componentSource).toContain('maxLength={300}')
    expect(componentSource).toContain('role="alert"')
    expect(componentSource).toContain('role="status"')
  })

  it('gates the form on the signed-in account and submits the exact typed body', () => {
    expect(componentSource).toContain('if (!currentUser)')
    expect(componentSource).toContain('requireAuth()')
    expect(componentSource).toContain('api.submitRevision(')
    expect(componentSource).toContain('slug,')
    for (const field of [
      'field,',
      'proposedValue: nextValue',
      'sourceTitle:',
      'sourceUrl:',
      'explanation:',
    ]) {
      expect(componentSource).toContain(field)
    }
  })

  it('clears private draft state and ignores delayed responses when the signed-in account changes', () => {
    expect(componentSource).toContain('accountGenerationRef.current += 1')
    expect(componentSource).toContain('}, [accountId])')
    expect(componentSource).toContain('privateStateAccountId === accountId')
    expect(componentSource).toContain('requestControllerRef.current?.abort()')
    expect(componentSource).toContain('accountIdRef.current !== accountId')
    expect(componentSource).toContain('closeDisabled={isSubmitting}')
    expect(componentSource).toContain("setSourceTitle('')")
    expect(componentSource).toContain("setSourceUrl('')")
    expect(componentSource).toContain("setExplanation('')")
    expect(componentSource).toContain('accountGenerationRef.current !== accountGeneration')
  })
})
