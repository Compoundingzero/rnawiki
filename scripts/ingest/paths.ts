import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Where the downloaded source corpora live. Overridable so a CI run or another machine can point
 * somewhere else without editing code.
 */
export const DATA_DIR =
  process.env.RNAWIKI_INGEST_DATA ??
  '/private/tmp/claude-501/-Users-admin-ClaudeRepo-Claude-Projects-RNAwiki/77ab22c1-2080-4fbf-b136-403682dd6f2e/scratchpad'

export const OPENFDA_DIR = join(DATA_DIR, 'openfda')

export const SOURCE_FILES = {
  drugsFda: join(OPENFDA_DIR, 'drug-drugsfda-0001-of-0001.json'),
  ndc: join(OPENFDA_DIR, 'drug-ndc-0001-of-0001.json'),
  orangeBook: join(OPENFDA_DIR, 'drug-orangebook-0001-of-0001.json'),
  /** The 14 SPL label partitions, still zipped — they total ~1.8 GB unpacked. */
  labelPartitions: Array.from({ length: 14 }, (_, i) =>
    join(OPENFDA_DIR, `label-${String(i + 1).padStart(2, '0')}.zip`),
  ),
} as const

export const CACHE_FILES = {
  dsldIngredients: join(DATA_DIR, 'dsld-ingredients.json'),
  structureIndex: join(DATA_DIR, 'structure-index.json'),
  labelIndex: join(DATA_DIR, 'label-index.json'),
  rxnormIngredients: join(DATA_DIR, 'rxnorm-ingredients.json'),
} as const

/**
 * Fail with an instruction rather than an ENOENT stack. Someone running this for the first time
 * needs to be told which command produces the file, not which syscall failed.
 */
export function requireSourceFile(path: string, hint = 'npm run ingest:download'): string {
  if (!existsSync(path)) {
    throw new Error(`Missing ingest source: ${path}\nRun \`${hint}\` first.`)
  }
  const size = statSync(path).size
  if (size < 1024) {
    throw new Error(
      `Ingest source looks truncated (${size} bytes): ${path}\nDelete it and re-run \`${hint}\`.`,
    )
  }
  return path
}

export function sourceFileExists(path: string): boolean {
  return existsSync(path) && statSync(path).size > 1024
}
