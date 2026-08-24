import { describe, expect, it } from 'vitest'

import { parseProgrammeVerdictDraftCliArgs } from '@/lib/programme-verdict-draft-cli'

describe('canonical draft operator CLI', () => {
  it('parses an explicit steward, programme and disclosure', () => {
    expect(
      parseProgrammeVerdictDraftCliArgs([
        '--programme-id',
        'programme-1',
        '--actor-user-id',
        'steward-1',
        '--conflicts-of-interest',
        'No conflicts declared.',
      ]),
    ).toEqual({
      programmeId: 'programme-1',
      actorUserId: 'steward-1',
      conflictsOfInterest: 'No conflicts declared.',
    })
  })

  it.each([
    ['--programme-id', 'programme-1'],
    ['--programme-id', 'programme-1', '--unknown', 'value'],
    ['--programme-id', 'programme-1', '--programme-id', 'programme-2'],
  ])('fails closed for incomplete or ambiguous options', (...argv) => {
    expect(() => parseProgrammeVerdictDraftCliArgs(argv)).toThrow()
  })
})
