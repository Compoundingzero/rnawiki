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
  ABSENCE_COLUMNS,
  absenceCaption,
  absenceRowText,
  absentAsOf,
  aggregateWithoutMovedStudies,
  anchor,
  buildBlockBody,
  carriesDoseText,
  checkedSourceName,
  checkedSourceNames,
  checkedSourcesStatement,
  controlledLine,
  CONTROLLED_DOSE_PATTERNS,
  CONTROLLED_WITHHELD_BLOCKS,
  CONTROLLED_WITHHELD_SEEDS,
  formOfNoteLines,
  groupRevealedRows,
  INTERACTION_CONFIDENCE_LABELS,
  INTERACTION_RULE_LABELS,
  INTERACTION_TIER_LABELS,
  interactionLine,
  interactionProvenance,
  organismPlural,
  pageProse,
  registerApplicationIds,
  registerName,
  registrationLineText,
  renderPage,
  ROW_CAP,
  sectionSentenceCounterpart,
  sectionSentenceFields,
  sectionSentenceText,
  sentenceNamesCompound,
  TRIAL_ROWS_INLINE,
  withdrawnArcRows,
} from '@/scripts/corpus-20k/render/page-text'

export type {
  ArcRow,
  BlockBody,
  CheckedSources,
  ControlledRow,
  IdentityRecord,
  InteractionRow,
  InteractionTierBlock,
  PageBlocks,
  PageBundle,
  PageProse,
  PatentLine,
  ProvenanceEntry,
  RegistrationLine,
  Relation,
  RelationNote,
  RenderedPage,
  RevealedRow,
  RevealedRowGroup,
  SectionSentence,
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
