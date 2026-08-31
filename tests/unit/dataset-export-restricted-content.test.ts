import { describe, expect, it } from 'vitest'

import { publishedRowCount, restrictedContentIn } from '../../scripts/check/dataset-export'

/**
 * The published dataset check reports a leak only when a restricted field carries something.
 *
 * This exists because the first version searched the raw NDJSON for `"homeRemedies"` and failed all
 * ten medicine shards. The boundary had done its job: it removed every value and left an empty
 * array behind, 35 times in the first shard alone, none of them disclosing anything. A scan that
 * cannot tell an emptied field from a populated one reports a leak that is not there, and would
 * have been "fixed" by loosening the check until it passed.
 */
describe('restricted content in the published dataset', () => {
  it('ignores a field the boundary emptied', () => {
    expect(restrictedContentIn({ slug: 'oxymetazoline', homeRemedies: [] })).toEqual([])
    expect(restrictedContentIn({ prosAndCons: {} })).toEqual([])
    expect(restrictedContentIn({ clinicalPrecaution: null })).toEqual([])
    expect(restrictedContentIn({ clinicalPrecaution: '   ' })).toEqual([])
  })

  it('reports a field that still carries a value', () => {
    expect(restrictedContentIn({ homeRemedies: ['steam inhalation'] })).toHaveLength(1)
    expect(restrictedContentIn({ clinicalPrecaution: 'do not exceed three days' })).toHaveLength(1)
  })

  it('finds a value nested anywhere, not only at the top level', () => {
    const row = {
      slug: 'example',
      alternatives: [
        { name: 'a', prosAndCons: [] },
        { name: 'b', prosAndCons: [{ pro: 'cheaper' }] },
      ],
      protocol: { steps: [{ stepNumber: 2, reagentsAndBuffer: 'phosphate buffer' }] },
    }
    const found = restrictedContentIn(row)
    expect(found).toHaveLength(3)
    expect(found.join(' ')).toContain('prosAndCons')
    expect(found.join(' ')).toContain('reagentsAndBuffer')
  })

  it('does not trip on an unrelated field or on prose that merely names one', () => {
    // The access-denial block names these fields in order to say they are withheld. Naming a field
    // is not disclosing it, which a substring scan over the file could never distinguish.
    expect(restrictedContentIn({ note: 'homeRemedies and prosAndCons are withheld' })).toEqual([])
    expect(restrictedContentIn({ indication: 'for the relief of symptoms' })).toEqual([])
  })
})

describe('published dataset row counts', () => {
  it('counts current agent artifacts rather than formatted JSON lines', () => {
    const body = Buffer.from(
      `${JSON.stringify(
        {
          schema: 'rnawiki-current-agent-manifest/v1',
          artifacts: [{ agentId: 'one' }, { agentId: 'two' }],
        },
        null,
        2,
      )}\n`,
    )
    expect(
      publishedRowCount(
        {
          path: 'data/agents/current/manifest.json',
          mediaType: 'application/json',
          schemaVersion: 'rnawiki-current-agent-manifest/v1',
        },
        body,
      ),
    ).toBe(2)
  })

  it('fails closed when a JSON entry does not match its declared row schema', () => {
    expect(() =>
      publishedRowCount(
        {
          path: 'data/agents/current/manifest.json',
          mediaType: 'application/json',
          schemaVersion: 'rnawiki-current-agent-manifest/v1',
        },
        Buffer.from('{"schema":"something-else","artifacts":[]}\n'),
      ),
    ).toThrow(/does not match rnawiki-current-agent-manifest\/v1/u)
  })
})
