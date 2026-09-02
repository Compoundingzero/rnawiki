import { randomUUID } from 'node:crypto'

import { eq, sql } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { db } from '@/db'
import { resultDebuggerCorrections, users } from '@/db/schema'
import { buildCorrectionRow, resultDebuggerCorrectionSchema } from '@/lib/semantic/result-debugger'

const runsInDisposableDatabase = process.env.E2E_DISPOSABLE_DATABASE === '1'

const unitA = 'a'.repeat(64)
const unitB = 'b'.repeat(64)

/**
 * The driver error text plus its cause. Drizzle wraps a PostgreSQL failure in its own
 * "Failed query" message, so the constraint or trigger name lives on the cause, not the message.
 */
async function rejectionText(operation: PromiseLike<unknown>): Promise<string> {
  try {
    await operation
    return ''
  } catch (error) {
    const parts = [error instanceof Error ? error.message : String(error)]
    const cause = (error as { cause?: unknown }).cause
    if (cause instanceof Error) parts.push(cause.message)
    return parts.join(' | ')
  }
}

describe.skipIf(!runsInDisposableDatabase)('result debugger corrections', () => {
  it('holds no rows until a person files one', async () => {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(resultDebuggerCorrections)
    expect(row?.count).toBe(0)
  })

  it('is append-only: an update and a delete are both refused', async () => {
    const suffix = randomUUID().replaceAll('-', '').slice(0, 12)
    const userId = `usr_rdbg_${suffix}`
    await db.insert(users).values({
      id: userId,
      email: `rdbg-${suffix}@example.test`,
      passwordHash: 'not-a-real-hash',
      name: `Result debugger reviewer ${suffix}`,
      handle: `rdbg-${suffix}`,
    })

    const input = resultDebuggerCorrectionSchema.parse({
      query: 'boxed warning for a record whose label carries none',
      returnedUnitIds: [unitA],
      expectedUnitId: unitB,
      expectedAbsence: false,
      reason: 'The returned reading came from the wrong section.',
    })
    const row = buildCorrectionRow(input, userId)

    try {
      await db.insert(resultDebuggerCorrections).values(row)
      const stored = await db
        .select()
        .from(resultDebuggerCorrections)
        .where(eq(resultDebuggerCorrections.id, row.id))
      expect(stored).toHaveLength(1)
      expect(stored[0]?.returnedUnitIds).toEqual([unitA])
      expect(stored[0]?.expectedAbsence).toBe(false)

      const updateError = await rejectionText(
        db
          .update(resultDebuggerCorrections)
          .set({ reason: 'rewritten' })
          .where(eq(resultDebuggerCorrections.id, row.id)),
      )
      expect(updateError).toMatch(/append-only/u)

      const deleteError = await rejectionText(
        db.delete(resultDebuggerCorrections).where(eq(resultDebuggerCorrections.id, row.id)),
      )
      expect(deleteError).toMatch(/append-only/u)

      const after = await db
        .select()
        .from(resultDebuggerCorrections)
        .where(eq(resultDebuggerCorrections.id, row.id))
      expect(after[0]?.reason).toBe(row.reason)
    } finally {
      // The row cannot be removed: the table is append-only, which is what this test proves. The
      // disposable database is dropped by the runner, so nothing is left behind.
      await db
        .delete(users)
        .where(eq(users.id, userId))
        .catch(() => undefined)
    }
  })

  it('refuses a correction with an empty reason at the database level', async () => {
    const suffix = randomUUID().replaceAll('-', '').slice(0, 12)
    const userId = `usr_rdbg_empty_${suffix}`
    await db.insert(users).values({
      id: userId,
      email: `rdbg-empty-${suffix}@example.test`,
      passwordHash: 'not-a-real-hash',
      name: `Result debugger reviewer ${suffix}`,
      handle: `rdbg-empty-${suffix}`,
    })
    try {
      const insertError = await rejectionText(
        db.insert(resultDebuggerCorrections).values({
          id: `rdbg_empty_${suffix}`,
          query: 'a query',
          reviewerUserId: userId,
          returnedUnitIds: [],
          expectedUnitId: null,
          expectedAbsence: true,
          reason: '   ',
          engineVersion: 'semantic-search/v1',
        }),
      )
      expect(insertError).toMatch(/result_debugger_corrections_reason/u)
    } finally {
      await db
        .delete(users)
        .where(eq(users.id, userId))
        .catch(() => undefined)
    }
  })
})
