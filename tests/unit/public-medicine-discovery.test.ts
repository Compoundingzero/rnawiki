import { drizzle } from 'drizzle-orm/node-postgres'
import { describe, expect, it } from 'vitest'

import { drugs } from '@/db/schema'
import { publicMedicineDiscoveryFilter, publicMedicineFilter } from '@/lib/queries/drugs'

function compiledWhere(filter: typeof publicMedicineFilter): string {
  return drizzle
    .mock()
    .select({ slug: drugs.slug })
    .from(drugs)
    .where(filter)
    .toSQL()
    .sql.replace(/\s+/g, ' ')
}

describe('public medicine discovery boundary', () => {
  it('excludes redirect-source slugs without broadening the direct-read identity filter', () => {
    expect(compiledWhere(publicMedicineDiscoveryFilter)).toContain(
      'not exists ( select 1 from "medicine_slug_redirects" where "medicine_slug_redirects"."old_slug" = "drugs"."slug" )',
    )
    expect(compiledWhere(publicMedicineFilter)).not.toContain('medicine_slug_redirects')
  })
})
