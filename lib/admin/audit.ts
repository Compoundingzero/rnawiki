// Shared audit-trail helper. Every create/edit/publish/review/resolve admin action must
// write to `revisions` through the functions here rather than inserting into the table
// directly — this is the one place the write shape is allowed to live.

import { db, type Db } from '@/db'
import { revisions } from '@/db/schema'

export type ReviewableType = 'claim' | 'entity'

export interface FieldChange {
  fieldChanged: string
  previousValue: string | null
  newValue: string | null
}

/** Serialize any form/db value into the flat text `revisions.previousValue`/`newValue` columns. */
export function stringifyValue(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString()
  return JSON.stringify(value)
}

/**
 * Diff a "before" and "after" flat record across the given field names and return only the
 * fields that actually changed, ready to pass to recordRevisions(). `before: null` (a create)
 * treats every non-empty field in `after` as changed.
 */
export function diffFields<T extends Record<string, unknown>>(
  // `before` is typically a raw DB row (nullable columns, e.g. `string | null`), which does not
  // structurally satisfy `Partial<T>` when T's fields are typed `string | undefined` (a create/
  // update input shape) — accept any indexable record instead, since stringifyValue() normalizes
  // null/undefined identically and this function never needs before to match T's exact shape.
  before: Record<string, unknown> | null,
  after: T,
  fields: (keyof T & string)[]
): FieldChange[] {
  const changes: FieldChange[] = []
  for (const field of fields) {
    const prev = stringifyValue(before ? before[field] : undefined)
    const next = stringifyValue(after[field])
    if (prev !== next) {
      changes.push({ fieldChanged: field, previousValue: prev, newValue: next })
    }
  }
  return changes
}

/** Write one revisions row per changed field. No-op if `changes` is empty. */
export async function recordRevisions(input: {
  reviewableType: ReviewableType
  reviewableId: number
  changedByUserId: number
  changes: FieldChange[]
  reason?: string | null
  reviewStatusAffected?: boolean
  db?: Db
}): Promise<void> {
  if (input.changes.length === 0) return
  const client = input.db ?? db
  await client.insert(revisions).values(
    input.changes.map((c) => ({
      reviewableType: input.reviewableType,
      reviewableId: input.reviewableId,
      changedByUserId: input.changedByUserId,
      fieldChanged: c.fieldChanged,
      previousValue: c.previousValue,
      newValue: c.newValue,
      reason: input.reason ?? null,
      reviewStatusAffected: input.reviewStatusAffected ?? false,
    }))
  )
}

/** One summary row for the creation of a new claim/entity, rather than one row per field. */
export async function recordCreation(input: {
  reviewableType: ReviewableType
  reviewableId: number
  changedByUserId: number
  summary: string
  reason?: string | null
  db?: Db
}): Promise<void> {
  const client = input.db ?? db
  await client.insert(revisions).values({
    reviewableType: input.reviewableType,
    reviewableId: input.reviewableId,
    changedByUserId: input.changedByUserId,
    fieldChanged: 'created',
    previousValue: null,
    newValue: input.summary,
    reason: input.reason ?? null,
    reviewStatusAffected: false,
  })
}

/** A single named action (publish, review decision, correction resolution, ...). */
export async function recordAction(input: {
  reviewableType: ReviewableType
  reviewableId: number
  changedByUserId: number
  fieldChanged: string
  previousValue: string | null
  newValue: string | null
  reason?: string | null
  reviewStatusAffected?: boolean
  db?: Db
}): Promise<void> {
  const client = input.db ?? db
  await client.insert(revisions).values({
    reviewableType: input.reviewableType,
    reviewableId: input.reviewableId,
    changedByUserId: input.changedByUserId,
    fieldChanged: input.fieldChanged,
    previousValue: input.previousValue,
    newValue: input.newValue,
    reason: input.reason ?? null,
    reviewStatusAffected: input.reviewStatusAffected ?? false,
  })
}
