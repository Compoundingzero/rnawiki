/**
 * Recording what the deterministic engine checked, not only what it found.
 *
 * The engine computed a verdict on every record and threw it away. `apply-recorded-background.ts`
 * printed findings to the console and exited; `programme_verdict_revisions` kept an input digest and
 * no findings at all. So per-rule precision was not computable — the denominator is the number of
 * times a rule ran and stayed silent, and nothing counted that.
 *
 * The run is the row. A record that passed with zero findings still writes one, because otherwise
 * "checked and clean" and "never checked" are the same absence, and only one of them is reassuring.
 *
 * This is an audit record of checks. It is never the source of truth for a medicine fact: nothing
 * here decides whether a value is correct, and a passing run means the envelope was structured well
 * enough to review, never that it is medically true.
 */

import { createHash } from 'node:crypto'

import { stableJsonStringify } from './stable-json'

export type EngineFamily = 'background' | 'evidence' | 'molecular'

export interface EngineFindingRecord {
  ruleCode: string
  level: string
  fieldPath: string
  message: string
  /** Whether this finding blocked the write, warned, or only recorded a review impact. */
  publicationEffect: string
}

export interface EngineValidationRunRecord {
  subjectType: 'medicine' | 'programme'
  subjectId: string
  engineFamily: EngineFamily
  engineVersion: string
  inputDigest: string
  corpusVersion: string
  passed: boolean
  findings: readonly EngineFindingRecord[]
  operation: string
}

/**
 * The digest of exactly what the engine read.
 *
 * Taken over the canonicalised input rather than over a rendered string, so a serializer that
 * reorders keys does not read as a changed input and force a duplicate run on every deploy.
 */
export function engineInputDigest(input: unknown): string {
  return createHash('sha256').update(stableJsonStringify(input)).digest('hex')
}

/**
 * A stable id for one run.
 *
 * Derived from the same fields as the table's uniqueness rule, so an unchanged corpus re-applied
 * produces the same id and the insert is a no-op rather than a second identical row. A changed
 * digest or engine version produces a different id, which is how history accumulates on real change
 * and not on repetition.
 */
export function engineRunId(run: {
  subjectType: string
  subjectId: string
  engineFamily: string
  engineVersion: string
  inputDigest: string
}): string {
  return createHash('sha256')
    .update(
      [
        'engine-run/v1',
        run.subjectType,
        run.subjectId,
        run.engineFamily,
        run.engineVersion,
        run.inputDigest,
      ].join(''),
    )
    .digest('hex')
    .slice(0, 64)
}

/** A stable id for one finding within a run, so re-applying does not duplicate findings either. */
export function engineFindingId(
  runId: string,
  index: number,
  finding: EngineFindingRecord,
): string {
  return createHash('sha256')
    .update([runId, String(index), finding.ruleCode, finding.fieldPath].join(''))
    .digest('hex')
    .slice(0, 64)
}
