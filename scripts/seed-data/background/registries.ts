import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type {
  RecordedInteractionSignal,
  RecordedMechanism,
  RecordedMolecularIdentity,
  RecordedPharmacokinetics,
  RecordedUses,
  MedicineRecordedBackground,
} from '@/lib/background/types'

/**
 * The product, substance and combination registries, read from JSON at runtime.
 *
 * They were generated TypeScript until the combination file reached 25 MB and 4,646 records, at
 * which point `tsc` could no longer represent the object literal as a type — "expression produces a
 * union type that is too complex to represent" is the compiler telling you the shape has outgrown
 * the format. Splitting the file would have hidden the problem rather than fixed it.
 *
 * JSON is the right format for data this size. Nothing here is imported by the application, only by
 * build scripts and tests, so a file read costs nothing that matters, and typecheck no longer walks
 * forty megabytes of literals on every run.
 *
 * The declared types are asserted rather than validated on read. That is safe because every one of
 * these files is produced by a script in this repository and every record in them has already
 * passed the background engine; a hand-edited registry is not a case the loader is defending
 * against, and the generated headers say so.
 */

const REGISTRY_DIR = join(process.cwd(), 'data', 'registries')

function read<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(join(REGISTRY_DIR, file), 'utf8')) as T
  } catch {
    // A registry that has not been generated yet is empty rather than fatal, so a fresh checkout
    // can run its tests before anyone has run the builders.
    return fallback
  }
}

export interface ProductIngredient {
  ingredientRxcui: string
  ingredientName: string
  printedNamesAsRecorded: string[]
}

export interface RegisteredProduct {
  productKey: string
  displayName: string
  ingredients: ProductIngredient[]
  labelCount: number
  brandNames: string[]
  routes: string[]
  representativeSetId: string
  isLargeFormulation: boolean
}

export interface RegisteredSubstance {
  ingredientRxcui: string
  ingredientName: string
  printedNamesAsRecorded: string[]
  unii?: string
  sourceLabelCount: number
  recordedUses?: RecordedUses
  mechanism?: RecordedMechanism
  pharmacokinetics?: RecordedPharmacokinetics
  molecularIdentity?: RecordedMolecularIdentity
  interactionSignals?: RecordedInteractionSignal[]
}

export interface CombinationProductRecord {
  slug: string
  name: string
  productKey: string
  brandNames: string[]
  routes: string[]
  labelCount: number
  background: MedicineRecordedBackground
}

export const PRODUCT_REGISTRY = read<Record<string, RegisteredProduct>>('product-registry.json', {})
export const SUBSTANCE_REGISTRY = read<Record<string, RegisteredSubstance>>(
  'substance-registry.json',
  {},
)
export const COMBINATION_PRODUCTS = read<CombinationProductRecord[]>(
  'combination-products.json',
  [],
)
