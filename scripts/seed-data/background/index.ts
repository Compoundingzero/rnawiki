/**
 * Aggregates the recorded-background dataset: one `medicine-background/v1` envelope per medicine
 * slug, authored from source artifacts fetched at authoring time (see
 * scripts/background/fetch-medicine-sources.ts) and validated by the deterministic background
 * engine before it can be applied anywhere.
 *
 * Authoring rules for every batch file in this directory:
 * - A value is structured from a fetched artifact, never remembered. The excerpt that contains
 *   the value is stored on its source.
 * - Missing information stays missing. A module a source does not support is simply absent.
 * - Amounts and schedules are recorded exactly as the label or trial protocol states them, as
 *   research context — never as guidance.
 */

import type { MedicineRecordedBackground } from '@/lib/background/types'

import { BACKGROUND_BATCH_1 } from './batch-1'
import { BACKGROUND_BATCH_2 } from './batch-2'
import { BACKGROUND_BATCH_3 } from './batch-3'
import { BACKGROUND_BATCH_4 } from './batch-4'
import { BACKGROUND_BATCH_5 } from './batch-5'
import { BACKGROUND_BATCH_6 } from './batch-6'
import { BACKGROUND_BATCH_7 } from './batch-7'
import { BACKGROUND_BATCH_8 } from './batch-8'
import { BACKGROUND_BATCH_9 } from './batch-9'
import { BACKGROUND_BATCH_10 } from './batch-10'
import { BACKGROUND_BATCH_11 } from './batch-11'
import { BACKGROUND_BATCH_12 } from './batch-12'

export type RecordedBackgroundBySlug = Record<string, MedicineRecordedBackground>

const ALL_BATCHES: RecordedBackgroundBySlug[] = [
  BACKGROUND_BATCH_1,
  BACKGROUND_BATCH_2,
  BACKGROUND_BATCH_3,
  BACKGROUND_BATCH_4,
  BACKGROUND_BATCH_5,
  BACKGROUND_BATCH_6,
  BACKGROUND_BATCH_7,
  BACKGROUND_BATCH_8,
  BACKGROUND_BATCH_9,
  BACKGROUND_BATCH_10,
  BACKGROUND_BATCH_11,
  BACKGROUND_BATCH_12,
]

export const RECORDED_BACKGROUND: RecordedBackgroundBySlug = (() => {
  const merged: RecordedBackgroundBySlug = {}
  for (const batch of ALL_BATCHES) {
    for (const [slug, background] of Object.entries(batch)) {
      if (merged[slug]) {
        throw new Error(`Duplicate recorded-background entry for slug "${slug}".`)
      }
      merged[slug] = background
    }
  }
  return merged
})()
