/**
 * What each addressable sentence on a compass page currently says.
 *
 * A member proposing a better wording has to be shown the wording that is actually on the page, not
 * a stored field that may or may not be the one the page chose. The compass picks between several
 * recorded sentences by rule, so the only honest source for "the current public wording" is the
 * built view model itself — the same function the page renders from.
 *
 * This is also what the review queue compares against, which is why it returns the evidence state
 * beside the text: a reviewer judging a rewording needs to know whether the sentence they are
 * looking at describes a reviewed conclusion, a source-linked draft or an absence, and a proposal
 * carries that state forward rather than improving it.
 */
import type { DossierV4ViewModel, Statement } from '@/lib/dossier-v4/view-model'
import type { SourceCitation } from '@/lib/dossier-v3/fields'

import {
  PAGE_STATEMENT_DEFINITIONS,
  type PageStatementDefinition,
  type PageStatementKey,
} from './types'

export interface CurrentPageStatement {
  definition: PageStatementDefinition
  text: string
  /** Where the sentence came from, as the page labels it. */
  origin: Statement['origin']
  /** The evidence state a proposal must carry forward unchanged. */
  evidenceState: string
  basis: string
  sources: SourceCitation[]
  /** True when the page has nothing here, so a proposal would be adding rather than rewording. */
  absent: boolean
}

const READER: Record<PageStatementKey, (model: DossierV4ViewModel) => Statement> = {
  'hero.opening': (model) => model.hero.simpleAction,
  'hero.explanation': (model) => model.hero.actionDetail,
  'hero.why_people_take_it': (model) => model.hero.whyPeopleCare,
  'hero.strongest_result': (model) => model.hero.strongestGoalResult,
  'hero.principal_limit': (model) => model.hero.principalUncertainty,
  'hero.where_it_acts': (model) => model.hero.bodyLocation,
  'hero.immediate_change': (model) => model.hero.immediateChange,
}

export function currentPageStatements(model: DossierV4ViewModel): CurrentPageStatement[] {
  return PAGE_STATEMENT_DEFINITIONS.map((definition) => {
    const statement = READER[definition.key](model)
    return {
      definition,
      text: statement.text,
      origin: statement.origin,
      evidenceState: statement.state,
      basis: statement.basis,
      sources: statement.sources,
      absent: statement.origin === 'absent',
    }
  })
}

export function currentPageStatement(
  model: DossierV4ViewModel,
  key: PageStatementKey,
): CurrentPageStatement | undefined {
  return currentPageStatements(model).find((entry) => entry.definition.key === key)
}

/* --------------------------------------------------------------- wording diff */

export interface DiffToken {
  value: string
  kind: 'same' | 'added' | 'removed'
}

/**
 * A word-level diff, so a reviewer sees what actually changed rather than two paragraphs to compare
 * by eye. Longest common subsequence over whitespace-separated tokens: small inputs, exact answer,
 * no dependency.
 */
export function wordDiff(before: string, after: string): DiffToken[] {
  const left = before.split(/(\s+)/).filter((token) => token.length > 0)
  const right = after.split(/(\s+)/).filter((token) => token.length > 0)
  const table: number[][] = Array.from({ length: left.length + 1 }, () =>
    new Array<number>(right.length + 1).fill(0),
  )
  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      const row = table[i]
      const next = table[i + 1]
      if (!row || !next) continue
      row[j] =
        left[i] === right[j] ? (next[j + 1] ?? 0) + 1 : Math.max(next[j] ?? 0, row[j + 1] ?? 0)
    }
  }
  const tokens: DiffToken[] = []
  let i = 0
  let j = 0
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      tokens.push({ value: left[i] ?? '', kind: 'same' })
      i += 1
      j += 1
    } else if ((table[i + 1]?.[j] ?? 0) >= (table[i]?.[j + 1] ?? 0)) {
      tokens.push({ value: left[i] ?? '', kind: 'removed' })
      i += 1
    } else {
      tokens.push({ value: right[j] ?? '', kind: 'added' })
      j += 1
    }
  }
  while (i < left.length) tokens.push({ value: left[i++] ?? '', kind: 'removed' })
  while (j < right.length) tokens.push({ value: right[j++] ?? '', kind: 'added' })
  return tokens
}

/** Sentence-level diff, for a change that moved a whole clause rather than a word. */
export function sentenceDiff(before: string, after: string): DiffToken[] {
  const split = (value: string): string[] =>
    value
      .match(/[^.!?]+[.!?]*\s*/g)
      ?.map((part) => part.trim())
      .filter(Boolean) ?? []
  const left = split(before)
  const right = split(after)
  const same = new Set(left.filter((sentence) => right.includes(sentence)))
  return [
    ...left.map((value): DiffToken => ({ value, kind: same.has(value) ? 'same' : 'removed' })),
    ...right
      .filter((value) => !same.has(value))
      .map((value): DiffToken => ({ value, kind: 'added' })),
  ]
}
