import 'dotenv/config'
import { numbersIn, statesNumber } from '@/lib/background/printed-numbers'

import { RECORDED_BACKGROUND } from '../seed-data/background'
import type { BackgroundSource, MedicineRecordedBackground } from '@/lib/background/types'

/**
 * The recorded-background freshness loop. For every excerpt the dataset stores, this script
 * re-fetches the cited source and mechanically re-checks that the excerpt still appears in the
 * source's current text. There is no model anywhere in this loop — an entry is `current`,
 * `drifted` (the source changed under it), `unreachable` (fetch failed today), or
 * `unverifiable_kind` (a kind with no stable machine-readable endpoint).
 *
 * Drift is a work item, never an auto-rewrite: a drifted entry names the exact slug, module path
 * and source so a person re-authors it from a fresh artifact. Exit code is non-zero when drift is
 * found, so a scheduled run can page the operator the same way the ClinicalTrials source-sync
 * worker does.
 *
 * Usage: tsx scripts/background/verify-recorded-background.ts [--report-only] [slug ...]
 */

interface ExcerptCheck {
  slug: string
  path: string
  source: BackgroundSource
}

type CheckState = 'current' | 'numbers_current' | 'drifted' | 'unreachable' | 'unverifiable_kind'

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s ]+/gu, ' ')
    .replace(/,(?=\d{3}\b)/gu, '')
    .replace(/[•●▪]/gu, ' ')
    .replace(/ +/gu, ' ')
    .trim()
}

function collectExcerptChecks(
  slug: string,
  background: MedicineRecordedBackground,
): ExcerptCheck[] {
  const checks: ExcerptCheck[] = []
  const add = (path: string, source: BackgroundSource | undefined) => {
    if (source?.excerpt) checks.push({ slug, path, source })
  }
  const pk = background.pharmacokinetics
  if (pk) {
    for (const [name, value] of Object.entries({
      bioavailability: pk.bioavailability,
      tMax: pk.tMax,
      halfLife: pk.halfLife,
      proteinBinding: pk.proteinBinding,
      volumeOfDistribution: pk.volumeOfDistribution,
      metabolismAsRecorded: pk.metabolismAsRecorded,
      eliminationAsRecorded: pk.eliminationAsRecorded,
    })) {
      add(`pharmacokinetics.${name}`, value?.source)
      if (value?.alternateValue)
        add(`pharmacokinetics.${name}.alternateValue`, value.alternateValue.source)
    }
  }
  add('titration.source', background.titration?.source)
  background.productVariants?.forEach((product, index) =>
    add(`productVariants[${index}]`, product.source),
  )
  background.costContext?.forEach((entry, index) => add(`costContext[${index}]`, entry.source))
  background.anatomyTargets?.forEach((target, index) =>
    add(`anatomyTargets[${index}]`, target.source),
  )
  add('applicability', background.applicability?.source)
  background.pivotalResults?.forEach((result, index) =>
    add(`pivotalResults[${index}]`, result.source),
  )
  add('registryIdentifiers', background.registryIdentifiers?.source)
  return checks
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) })
    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}

/** One canonical current-text fetch per (kind, identifier); shared across all excerpts citing it. */
const sourceTextCache = new Map<string, Promise<string | null | 'unverifiable'>>()

function currentSourceText(source: BackgroundSource): Promise<string | null | 'unverifiable'> {
  const key = `${source.kind}:${source.identifier}`
  const cached = sourceTextCache.get(key)
  if (cached) return cached
  const id = encodeURIComponent(source.identifier.trim())
  const promise: Promise<string | null | 'unverifiable'> = (async () => {
    switch (source.kind) {
      case 'FDA_LABEL':
      case 'DAILYMED':
        return await fetchText(
          `https://api.fda.gov/drug/label.json?search=set_id:%22${id}%22&limit=1`,
        )
      case 'PUBMED':
        return await fetchText(
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${id}&rettype=abstract&retmode=text`,
        )
      case 'CLINICALTRIALS':
        return await fetchText(`https://clinicaltrials.gov/api/v2/studies/${id}`)
      case 'PUBCHEM':
        return await fetchText(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${id}/property/MolecularFormula,MolecularWeight/JSON`,
        )
      default:
        return 'unverifiable'
    }
  })()
  sourceTextCache.set(key, promise)
  return promise
}

async function main() {
  const args = process.argv.slice(2)
  const reportOnly = args.includes('--report-only')
  const slugFilter = args.filter((value) => !value.startsWith('--'))
  const entries = Object.entries(RECORDED_BACKGROUND).filter(
    ([slug]) => slugFilter.length === 0 || slugFilter.includes(slug),
  )

  const counts: Record<CheckState, number> = {
    current: 0,
    numbers_current: 0,
    drifted: 0,
    unreachable: 0,
    unverifiable_kind: 0,
  }
  const drifted: ExcerptCheck[] = []
  const unreachable: ExcerptCheck[] = []

  for (const [slug, background] of entries) {
    for (const check of collectExcerptChecks(slug, background)) {
      const text = await currentSourceText(check.source)
      let state: CheckState
      if (text === 'unverifiable') {
        state = 'unverifiable_kind'
      } else if (text === null) {
        state = 'unreachable'
        unreachable.push(check)
      } else {
        const haystack = normalize(text)
        const excerpt = normalize(check.source.excerpt!)
        if (haystack.includes(excerpt)) {
          state = 'current'
        } else {
          // The dataset's promise is that every recorded number appears in the cited source.
          // A stitched or reformatted excerpt still verifies as long as the numbers hold; only
          // a source whose numbers changed under us counts as drift.
          // Compared by value, not by substring. `includes` said a source still stated 5,800
          // when it had changed to 800, which is precisely the blind spot that let 107 wrong
          // numbers through the engine in the first place — the drift detector shared it.
          const numbers = numbersIn(excerpt)
          if (numbers.length > 0 && numbers.every((value) => statesNumber(haystack, value))) {
            state = 'numbers_current'
          } else {
            state = 'drifted'
            drifted.push(check)
          }
        }
      }
      counts[state] += 1
    }
    await new Promise((resolve) => setTimeout(resolve, 150))
  }

  for (const check of drifted) {
    console.error(
      `[background.drifted] ${check.slug} ${check.path} — ${check.source.kind} ${check.source.identifier}: the recorded excerpt no longer appears in the current source text. Re-author this entry from a fresh artifact.`,
    )
  }
  for (const check of unreachable) {
    console.warn(
      `[background.unreachable] ${check.slug} ${check.path} — ${check.source.kind} ${check.source.identifier}: the source could not be fetched today.`,
    )
  }
  console.log(`[background.verify] ${JSON.stringify({ envelopes: entries.length, ...counts })}`)
  if (drifted.length > 0 && !reportOnly) process.exit(1)
  process.exit(0)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
