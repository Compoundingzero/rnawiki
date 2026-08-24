import { describe, expect, it } from 'vitest'

import { resolveSafeSourceLocator } from '@/lib/source-locator'

describe('source locator safety', () => {
  it.each([
    ['doi:10.1000/example', 'https://doi.org/10.1000/example'],
    ['pmid:12345678', 'https://pubmed.ncbi.nlm.nih.gov/12345678/'],
    ['nct:NCT12345678', 'https://clinicaltrials.gov/study/NCT12345678'],
    ['https://example.test/source', 'https://example.test/source'],
  ])('resolves %s to a safe public link', (locator, href) => {
    expect(resolveSafeSourceLocator(locator)?.href).toBe(href)
  })

  it('keeps a URN as non-clickable exact provenance', () => {
    expect(resolveSafeSourceLocator('urn:rnawiki:source:version-1')).toEqual({
      canonicalLocator: 'urn:rnawiki:source:version-1',
      href: null,
      kind: 'URN',
    })
  })

  it.each([
    'https://reader:secret@example.test/source',
    'javascript:alert(1)',
    'doi:not-a-doi',
    'nct:NCT123',
    'urn:contains spaces',
  ])('rejects an unsafe or malformed locator: %s', (locator) => {
    expect(resolveSafeSourceLocator(locator)).toBeNull()
  })
})
