import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(file: string): string {
  return readFileSync(join(process.cwd(), file), 'utf8')
}

describe('compact public medicine summary surfaces', () => {
  it.each([
    ['search results', 'lib/queries/drugs.ts', 'export async function searchDrugs'],
    ['popular medicines', 'lib/queries/drugs.ts', 'export async function getPopularDrugs'],
    ['the paginated drugs API', 'app/api/drugs/route.ts', 'export const GET'],
  ])('%s binds summaries through the shared programme projection', (_surface, file, anchor) => {
    const fileSource = source(file)
    const start = fileSource.indexOf(anchor)
    expect(start, `${file} should contain ${anchor}`).toBeGreaterThanOrEqual(0)

    const nextExport = fileSource.indexOf('\nexport ', start + anchor.length)
    const implementation = fileSource.slice(start, nextExport < 0 ? undefined : nextExport)
    expect(implementation).toContain('bindPublicSearchSummaries')
  })

  it.each([
    ['home and dossier search', 'components/HomeSearch.tsx'],
    ['header search', 'components/SiteHeader.tsx'],
  ])('%s opens the programme that supplied the visible summary', (_surface, file) => {
    const fileSource = source(file)
    expect(fileSource).toContain('searchHitHref')
    expect(fileSource).toContain('drug.summaryContext')
  })

  it('does not expose the legacy medicine-wide verdict through a compact result', () => {
    for (const file of [
      'lib/queries/public-search-hit-projection.ts',
      'components/HomeSearch.tsx',
      'components/SiteHeader.tsx',
      'components/AccountModal.tsx',
      'app/api/drugs/route.ts',
    ]) {
      expect(source(file), file).not.toContain('oneSentenceVerdict')
    }
  })
})
