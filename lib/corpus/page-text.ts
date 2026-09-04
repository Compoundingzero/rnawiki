/**
 * The dossier template's access to the body builders.
 *
 * The words a reader sees and the words measured at Gate 1b are produced by ONE function. That
 * function lives in `scripts/corpus-20k/render/page-text.ts`, because the overlap harness runs it
 * over 28,966 pages of NDJSON without a database. This module re-exports it so the React template
 * imports the same implementation instead of growing a second one; nothing here rewrites, wraps or
 * softens what the builder returns.
 *
 * The only accommodation the move needed was on the other side: the builder's own import of the
 * question-derivation module is written without a `.js` extension, because the Next.js webpack
 * resolver does not rewrite a `.js` specifier onto a `.ts` file. `tsx` and Vitest are unaffected.
 */
export {
  anchor,
  buildBlockBody,
  organismPlural,
  pageProse,
  registerName,
  renderPage,
  ROW_CAP,
} from '@/scripts/corpus-20k/render/page-text'

export type {
  BlockBody,
  IdentityRecord,
  PageBundle,
  PageProse,
  Relation,
  RevealedRow,
  SeedRecord,
  Synonym,
} from '@/scripts/corpus-20k/render/page-text'

export { deriveQuestions } from '@/scripts/corpus-20k/questions/derive'

export type {
  FieldEntry,
  PageInput,
  QuestionBlock,
  SourceRef,
} from '@/scripts/corpus-20k/questions/derive'
