import { createHash } from 'node:crypto'

import { stableJsonStringify } from '@/lib/stable-json'

/** Canonical SHA-256 for the exact persisted proposal bundle presented to reviewers. */
export function contributionContentDigest(value: unknown): string {
  return createHash('sha256').update(stableJsonStringify(value), 'utf8').digest('hex')
}
