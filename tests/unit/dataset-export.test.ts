import { describe, expect, it } from 'vitest'

import { stableJsonStringify } from '@/lib/stable-json'

describe('stableJsonStringify', () => {
  it('sorts keys at every object depth without filtering nested evidence', () => {
    const value = {
      verdict: 'Recorded answer',
      audits: [
        {
          title: 'Measured endpoint',
          source: { identifier: '10.0000/example', kind: 'doi' },
          id: 'audit-1',
        },
      ],
      condition: { whyItMatters: 'Recorded context', explainer: 'Recorded explanation' },
    }

    const json = stableJsonStringify(value)
    const parsed = JSON.parse(json) as typeof value

    expect(json.indexOf('"audits"')).toBeLessThan(json.indexOf('"condition"'))
    expect(parsed.audits[0]).toEqual(value.audits[0])
    expect(parsed.condition).toEqual(value.condition)
  })

  it('preserves array order', () => {
    expect(stableJsonStringify({ values: [{ n: 2 }, { n: 1 }] })).toContain(
      '"values":[{"n":2},{"n":1}]',
    )
  })
})
