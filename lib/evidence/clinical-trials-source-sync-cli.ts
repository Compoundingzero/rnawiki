import {
  DEFAULT_CLINICAL_TRIALS_SYNC_CONCURRENCY,
  DEFAULT_CLINICAL_TRIALS_SYNC_LIMIT,
  MAX_CLINICAL_TRIALS_SYNC_CONCURRENCY,
  MAX_CLINICAL_TRIALS_SYNC_LIMIT,
} from './clinical-trials-source-sync'

export interface ClinicalTrialsSourceSyncCliOptions {
  limit: number
  concurrency: number
}

function positiveIntegerOption(
  argv: readonly string[],
  name: string,
  fallback: number,
  maximum: number,
): number {
  const index = argv.indexOf(name)
  if (index < 0) return fallback
  const raw = argv[index + 1]
  if (raw === undefined || !/^\d+$/.test(raw)) {
    throw new TypeError(`${name} requires a positive integer.`)
  }
  const value = Number.parseInt(raw, 10)
  if (value < 1 || value > maximum) {
    throw new TypeError(`${name} must be between 1 and ${maximum}.`)
  }
  return value
}

export function parseClinicalTrialsSourceSyncArgs(
  argv: readonly string[],
): ClinicalTrialsSourceSyncCliOptions {
  const known = new Set(['--limit', '--concurrency'])
  const seen = new Set<string>()
  for (let index = 0; index < argv.length; index += 2) {
    const option = argv[index]
    if (option === undefined || !known.has(option)) {
      throw new TypeError(`Unknown source-sync option: ${option ?? '(missing)'}`)
    }
    if (seen.has(option)) throw new TypeError(`Duplicate source-sync option: ${option}`)
    seen.add(option)
  }
  return {
    limit: positiveIntegerOption(
      argv,
      '--limit',
      DEFAULT_CLINICAL_TRIALS_SYNC_LIMIT,
      MAX_CLINICAL_TRIALS_SYNC_LIMIT,
    ),
    concurrency: positiveIntegerOption(
      argv,
      '--concurrency',
      DEFAULT_CLINICAL_TRIALS_SYNC_CONCURRENCY,
      MAX_CLINICAL_TRIALS_SYNC_CONCURRENCY,
    ),
  }
}
