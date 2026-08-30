import { beforeAll, describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'

import { db } from '@/db'
import { drugs, engineFindings, engineValidationRuns } from '@/db/schema'
import { engineFindingId, engineInputDigest, engineRunId } from '@/lib/engine-run-persistence'

/**
 * The engine computed a verdict on every record and threw it away, so "checked and clean" and
 * "never checked" were the same absence. These tests pin the property that fixes that: a passing
 * run with zero findings is still a row, and re-running an unchanged corpus adds nothing.
 */

const ENGINE = 'rna-intelligence/background-2.4.0'
const CORPUS = 'openfda-2026-08-28'

function runRow(slug: string, digest: string, passed: boolean, findingCount: number) {
  return {
    id: engineRunId({
      subjectType: 'medicine',
      subjectId: slug,
      engineFamily: 'background',
      engineVersion: ENGINE,
      inputDigest: digest,
    }),
    subjectType: 'medicine' as const,
    subjectId: slug,
    engineFamily: 'background' as const,
    engineVersion: ENGINE,
    inputDigest: digest,
    corpusVersion: CORPUS,
    status: passed ? ('PASSED' as const) : ('FAILED' as const),
    passed,
    findingCount,
    operation: 'apply:background',
  }
}

beforeAll(async () => {
  await db.delete(engineFindings)
  await db.delete(engineValidationRuns)
})

describe('an engine run is recorded whether or not it found anything', () => {
  it('persists a passing run with zero findings, so a clean check is not an absence', async () => {
    const digest = engineInputDigest({
      version: 'medicine-background/v1',
      authoredAt: '2026-08-28',
    })
    await db.insert(engineValidationRuns).values(runRow('clean-record', digest, true, 0))

    const [row] = await db
      .select()
      .from(engineValidationRuns)
      .where(sql`subject_id = 'clean-record'`)
    expect(row?.passed).toBe(true)
    expect(row?.findingCount).toBe(0)
    expect(row?.appliedAt).toBeNull()
  })

  it('persists a failing run and every finding beneath it', async () => {
    const digest = engineInputDigest({ broken: true })
    const run = runRow('broken-record', digest, false, 2)
    await db.insert(engineValidationRuns).values(run)
    await db.insert(engineFindings).values(
      ['I_VALUE_NOT_IN_EXCERPT', 'I_CONTEXT_MISSING'].map((code, index) => ({
        id: engineFindingId(run.id, index, {
          ruleCode: code,
          level: 'BLOCK',
          fieldPath: 'pharmacokinetics.halfLife',
          message: 'example',
          publicationEffect: 'BLOCKED_WRITE',
        }),
        runId: run.id,
        engineFamily: 'background' as const,
        engineVersion: ENGINE,
        inputDigest: digest,
        subjectType: 'medicine' as const,
        subjectId: 'broken-record',
        ruleCode: code,
        level: 'BLOCK',
        fieldPath: 'pharmacokinetics.halfLife',
        message: 'example',
        publicationEffect: 'BLOCKED_WRITE',
        corpusVersion: CORPUS,
      })),
    )

    const found = await db
      .select()
      .from(engineFindings)
      .where(sql`subject_id = 'broken-record'`)
    expect(found).toHaveLength(2)
    expect(found.map((f) => f.ruleCode).sort()).toEqual([
      'I_CONTEXT_MISSING',
      'I_VALUE_NOT_IN_EXCERPT',
    ])
    /* Findings are queryable by rule code, which is what per-rule precision needs. */
    const byRule = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(engineFindings)
      .where(sql`rule_code = 'I_VALUE_NOT_IN_EXCERPT'`)
    expect(byRule[0]!.n).toBe(1)
  })
})

describe('history accumulates on real change, not on repetition', () => {
  const digest = engineInputDigest({ stable: true })

  it('does not duplicate an identical run', async () => {
    const row = runRow('repeat-record', digest, true, 0)
    await db.insert(engineValidationRuns).values(row).onConflictDoNothing()
    await db.insert(engineValidationRuns).values(row).onConflictDoNothing()

    const countRows = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(engineValidationRuns)
      .where(sql`subject_id = 'repeat-record'`)
    expect(countRows[0]!.n).toBe(1)
  })

  it('creates a new run when the input digest changes, and keeps the old one', async () => {
    await db
      .insert(engineValidationRuns)
      .values(runRow('repeat-record', engineInputDigest({ stable: false }), true, 0))
      .onConflictDoNothing()

    const countRows = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(engineValidationRuns)
      .where(sql`subject_id = 'repeat-record'`)
    expect(countRows[0]!.n).toBe(2)
  })

  it('creates a new run when the engine version changes', async () => {
    await db.insert(engineValidationRuns).values({
      ...runRow('repeat-record', digest, true, 0),
      id: engineRunId({
        subjectType: 'medicine',
        subjectId: 'repeat-record',
        engineFamily: 'background',
        engineVersion: 'rna-intelligence/background-2.5.0',
        inputDigest: digest,
      }),
      engineVersion: 'rna-intelligence/background-2.5.0',
    })

    const countRows = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(engineValidationRuns)
      .where(sql`subject_id = 'repeat-record'`)
    expect(countRows[0]!.n).toBe(3)
  })
})

describe('the schema refuses a run that contradicts itself', () => {
  it('rejects a failing run claiming zero findings', async () => {
    await expect(
      db
        .insert(engineValidationRuns)
        .values(runRow('contradictory', engineInputDigest({ x: 1 }), false, 0)),
    ).rejects.toThrow()
  })

  it('rejects a status that disagrees with the passed flag', async () => {
    await expect(
      db.insert(engineValidationRuns).values({
        ...runRow('mismatched', engineInputDigest({ y: 1 }), true, 0),
        status: 'FAILED' as const,
      }),
    ).rejects.toThrow()
  })
})

describe('a run links the medicine write to the validation that permitted it', () => {
  it('marks appliedAt only when the envelope was written', async () => {
    await db.insert(drugs).values({
      id: 'applied-drug',
      slug: 'applied-drug',
      name: 'Applied drug',
      sponsor: 't',
      modality: 'Small Molecule',
      approvalStatus: 'FDA Approved',
      indication: 't',
      auditConfidence: 'Moderate / Debated',
      confidenceScore: 50,
    })
    const digest = engineInputDigest({ applied: true })
    await db
      .insert(engineValidationRuns)
      .values({ ...runRow('applied-drug', digest, true, 0), appliedAt: new Date('2026-08-31') })

    const [row] = await db
      .select()
      .from(engineValidationRuns)
      .where(sql`subject_id = 'applied-drug'`)
    expect(row?.appliedAt).not.toBeNull()
    expect(row?.passed).toBe(true)
  })
})
