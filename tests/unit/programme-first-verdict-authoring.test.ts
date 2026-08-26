import { describe, expect, it } from 'vitest'

import { STUDY_INTERPRETABILITY_CRITERIA } from '@/lib/evidence/types'
import {
  canonicalFirstVerdictBundleDigest,
  programmeFirstVerdictAuthoringBundleSchema,
} from '@/lib/programme-first-verdict-authoring'
import {
  PROGRAMME_FIRST_VERDICT_CLI_USAGE,
  parseProgrammeFirstVerdictCliArgs,
} from '@/lib/programme-first-verdict-cli'
import {
  PROGRAMME_SUCCESSOR_VERDICT_CLI_USAGE,
  parseProgrammeSuccessorVerdictCliArgs,
} from '@/lib/programme-successor-verdict-cli'
import { firstVerdictBundleFixture } from '@/tests/setup/programme-first-verdict-bundle'

describe('first canonical verdict authoring contract', () => {
  const fixture = () =>
    firstVerdictBundleFixture({
      programmeId: 'programme-first',
      programmeTrialId: 'trial-first',
      sourceSnapshotId: 'snapshot-first',
    })

  it('requires every summary and verdict dependency while permitting an empty sourced timeline', () => {
    const bundle = fixture()
    expect(programmeFirstVerdictAuthoringBundleSchema.parse(bundle)).toEqual(bundle)
    expect(bundle.presentation.timelineEvents).toEqual([])

    const incomplete = structuredClone(bundle) as Record<string, unknown>
    const dependencies = incomplete.dependencies as { verdict: Record<string, string[]> }
    delete dependencies.verdict['verdict.publicLabel']
    expect(() => programmeFirstVerdictAuthoringBundleSchema.parse(incomplete)).toThrow()

    const missingNode = structuredClone(bundle)
    missingNode.evidenceNodes.pop()
    expect(() => programmeFirstVerdictAuthoringBundleSchema.parse(missingNode)).toThrow()
  })

  it.each(['CONTRADICTORY', 'CANDIDATE_LIMITATION'] as const)(
    'rejects a %s claim as summary.plainMechanism support',
    (relationship) => {
      const bundle = structuredClone(fixture())
      const claimKey = `mechanism.${relationship.toLowerCase()}`
      bundle.claims.push({
        ...bundle.claims[0]!,
        claimKey,
        plainLanguageText: 'This claim does not support the reviewed mechanism.',
      })
      bundle.conclusion.claimLinks.push({ claimKey, relationship })
      bundle.dependencies.summary['summary.plainMechanism'] = [claimKey]

      const parsed = programmeFirstVerdictAuthoringBundleSchema.safeParse(bundle)

      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        expect(parsed.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['dependencies', 'summary', 'summary.plainMechanism', 0],
              message: expect.stringMatching(/SUPPORTING/),
            }),
          ]),
        )
      }
    },
  )

  it('rejects unknown keys, orphan claims, duplicate target relationships and partial trial assessments', () => {
    expect(() =>
      programmeFirstVerdictAuthoringBundleSchema.parse({ ...fixture(), invented: true }),
    ).toThrow()

    const orphan = structuredClone(fixture())
    orphan.claims.push({
      ...orphan.claims[0]!,
      claimKey: 'orphan.claim',
      plainLanguageText: 'This claim is deliberately not linked into the reviewed graph.',
    })
    expect(() => programmeFirstVerdictAuthoringBundleSchema.parse(orphan)).toThrow(
      /scientific graph link/,
    )

    const dependencyOnly = structuredClone(fixture())
    dependencyOnly.claims.push({
      ...dependencyOnly.claims[0]!,
      claimKey: 'dependency.only',
      plainLanguageText: 'A dependency alone cannot add a claim to the locked reviewed graph.',
    })
    dependencyOnly.dependencies.summary['summary.mainLimitation'].push('dependency.only')
    expect(() => programmeFirstVerdictAuthoringBundleSchema.parse(dependencyOnly)).toThrow(
      /dependency alone cannot introduce/,
    )

    const presentationOnlyDependency = structuredClone(fixture())
    presentationOnlyDependency.claims.push({
      ...presentationOnlyDependency.claims[0]!,
      claimKey: 'presentation.only',
      plainLanguageText: 'A presentation claim cannot silently support a conclusion field.',
    })
    presentationOnlyDependency.presentation.mechanismSteps[0]!.claimLinks.push({
      claimKey: 'presentation.only',
      relationship: 'QUALIFIES',
    })
    presentationOnlyDependency.dependencies.summary['summary.mainLimitation'] = [
      'presentation.only',
    ]
    expect(() =>
      programmeFirstVerdictAuthoringBundleSchema.parse(presentationOnlyDependency),
    ).toThrow(/linked directly to this conclusion revision/)

    const duplicate = structuredClone(fixture())
    duplicate.presentation.mechanismSteps[0]!.claimLinks.push(
      duplicate.presentation.mechanismSteps[0]!.claimLinks[0]!,
    )
    expect(() => programmeFirstVerdictAuthoringBundleSchema.parse(duplicate)).toThrow(
      /link a claim only once/,
    )

    const duplicateConflict = fixture()
    duplicateConflict.claims.push({
      ...duplicateConflict.claims[0]!,
      claimKey: 'conflicting.claim',
      plainLanguageText: 'A synthetic claim used to exercise conflict-set validation.',
    })
    duplicateConflict.conclusion.claimLinks.push({
      claimKey: 'conflicting.claim',
      relationship: 'CONTRADICTORY',
    })
    duplicateConflict.claims[0]!.conflictsWithClaimKeys = ['conflicting.claim', 'conflicting.claim']
    expect(() => programmeFirstVerdictAuthoringBundleSchema.parse(duplicateConflict)).toThrow(
      /each conflicting claim only once/,
    )

    const partial = structuredClone(fixture())
    partial.interpretabilityAssessments = [
      {
        programmeTrialId: partial.programmeTrialIds[0]!,
        criterion: STUDY_INTERPRETABILITY_CRITERIA[0],
        state: 'YES',
        explanation: 'One criterion alone is an incomplete trial assessment.',
        lastVerifiedAt: null,
        claimLinks: [{ claimKey: partial.claims[0]!.claimKey, relationship: 'SUPPORTS' }],
      },
    ]
    expect(() => programmeFirstVerdictAuthoringBundleSchema.parse(partial)).toThrow(/must cover/)
  })

  it('hashes order-insensitive authored collections canonically', () => {
    const left = fixture()
    left.claims.push({
      ...left.claims[0]!,
      claimKey: 'second.measured-result',
      plainLanguageText: 'A second synthetic claim makes canonical ordering observable.',
      sourceSnapshotIds: ['snapshot-z', 'snapshot-a'],
    })
    left.conclusion.claimLinks.push({
      claimKey: 'second.measured-result',
      relationship: 'CANDIDATE_LIMITATION',
    })
    left.evidenceNodes[0]!.claimLinks.push({
      claimKey: 'second.measured-result',
      relationship: 'QUALIFIES',
    })
    left.dependencies.verdict['verdict.publicLabel'].push('second.measured-result')
    const right = structuredClone(left)
    right.claims.reverse()
    right.claims[0]!.sourceSnapshotIds.reverse()
    right.conclusion.claimLinks.reverse()
    right.evidenceNodes.reverse()
    right.evidenceNodes.find((node) => node.nodeType === 'HUMAN_EXPOSURE')!.claimLinks.reverse()
    right.dependencies.verdict['verdict.publicLabel'].reverse()
    right.presentation.mechanismSteps.reverse()
    expect(canonicalFirstVerdictBundleDigest(right)).toBe(canonicalFirstVerdictBundleDigest(left))
  })

  it('rejects future verification metadata for claims, nodes and assessments', () => {
    const future = '2099-01-01T00:00:00.000Z'

    const claimFuture = fixture()
    claimFuture.claims[0]!.lastVerifiedAt = future
    expect(() => programmeFirstVerdictAuthoringBundleSchema.parse(claimFuture)).toThrow(
      /Verification time cannot be after/,
    )

    const nodeFuture = fixture()
    nodeFuture.evidenceNodes[0]!.lastVerifiedAt = future
    expect(() => programmeFirstVerdictAuthoringBundleSchema.parse(nodeFuture)).toThrow(
      /Verification time cannot be after/,
    )

    const assessmentFuture = fixture()
    assessmentFuture.interpretabilityAssessments = STUDY_INTERPRETABILITY_CRITERIA.map(
      (criterion) => ({
        programmeTrialId: assessmentFuture.programmeTrialIds[0]!,
        criterion,
        state: 'NOT_REPORTED',
        explanation: 'Synthetic complete assessment used only to test timestamp validation.',
        lastVerifiedAt: criterion === STUDY_INTERPRETABILITY_CRITERIA[0] ? future : null,
        claimLinks: [{ claimKey: assessmentFuture.claims[0]!.claimKey, relationship: 'SUPPORTS' }],
      }),
    )
    expect(() => programmeFirstVerdictAuthoringBundleSchema.parse(assessmentFuture)).toThrow(
      /Verification time cannot be after/,
    )
  })

  it('accepts only numeric values that persist exactly in numeric(30,10)', () => {
    const boundary = fixture()
    boundary.claims[0]!.numericValue = '99999999999999999999.1234567891'
    expect(programmeFirstVerdictAuthoringBundleSchema.parse(boundary)).toBeTruthy()

    const integerOverflow = fixture()
    integerOverflow.claims[0]!.numericValue = '100000000000000000000'
    expect(() => programmeFirstVerdictAuthoringBundleSchema.parse(integerOverflow)).toThrow(
      /exact database domain/,
    )

    const fractionalRounding = fixture()
    fractionalRounding.claims[0]!.numericValue = '1.12345678901'
    expect(() => programmeFirstVerdictAuthoringBundleSchema.parse(fractionalRounding)).toThrow(
      /exact database domain/,
    )
  })
})

describe('first canonical verdict operator CLI', () => {
  it('defaults to rollback-only validation and requires an explicit commit flag', () => {
    expect(
      parseProgrammeFirstVerdictCliArgs([
        '--bundle-file',
        './bundle.json',
        '--actor-user-id',
        'steward-1',
      ]),
    ).toEqual({ bundleFile: './bundle.json', actorUserId: 'steward-1', commit: false })
    expect(
      parseProgrammeFirstVerdictCliArgs([
        '--commit',
        '--actor-user-id',
        'steward-1',
        '--bundle-file',
        './bundle.json',
      ]).commit,
    ).toBe(true)
  })

  it.each([
    { argv: [] },
    { argv: ['--bundle-file', './bundle.json'] },
    { argv: ['--unknown', 'value'] },
    {
      argv: [
        '--commit',
        '--commit',
        '--bundle-file',
        './bundle.json',
        '--actor-user-id',
        'steward-1',
      ],
    },
  ])('fails closed for incomplete or ambiguous options: $argv', ({ argv }) => {
    expect(() => parseProgrammeFirstVerdictCliArgs(argv)).toThrow()
  })

  it('publishes the exact callable usage string', () => {
    expect(PROGRAMME_FIRST_VERDICT_CLI_USAGE).toContain('--bundle-file')
    expect(PROGRAMME_FIRST_VERDICT_CLI_USAGE).toContain('[--commit]')
  })
})

describe('complete successor verdict operator CLI', () => {
  it('uses the same strict file input and remains rollback-only unless commit is explicit', () => {
    expect(
      parseProgrammeSuccessorVerdictCliArgs([
        '--bundle-file',
        './successor.json',
        '--actor-user-id',
        'steward-2',
      ]),
    ).toEqual({ bundleFile: './successor.json', actorUserId: 'steward-2', commit: false })
    expect(
      parseProgrammeSuccessorVerdictCliArgs([
        '--actor-user-id',
        'steward-2',
        '--commit',
        '--bundle-file',
        './successor.json',
      ]).commit,
    ).toBe(true)
    expect(PROGRAMME_SUCCESSOR_VERDICT_CLI_USAGE).toContain('[--commit]')
  })

  it.each([
    { argv: [] },
    { argv: ['--bundle-file', './successor.json'] },
    { argv: ['--unknown', 'value'] },
    {
      argv: [
        '--commit',
        '--commit',
        '--bundle-file',
        './successor.json',
        '--actor-user-id',
        'steward-2',
      ],
    },
  ])('fails closed for incomplete or ambiguous options: $argv', ({ argv }) => {
    expect(() => parseProgrammeSuccessorVerdictCliArgs(argv)).toThrow()
  })
})
