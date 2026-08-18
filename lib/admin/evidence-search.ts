import { db } from '@/db'
import { evidenceSources } from '@/db/schema'
import { ilike, or, desc } from 'drizzle-orm'

/** Search evidenceSources by title/DOI/PMID — shared by /admin/evidence and the claim editor's
 * inline "attach existing evidence" search. */
export async function searchEvidenceSources(query: string, limit = 20) {
  const term = query.trim()
  if (!term) {
    return db.select().from(evidenceSources).orderBy(desc(evidenceSources.dateChecked)).limit(limit)
  }
  const pattern = `%${term}%`
  return db
    .select()
    .from(evidenceSources)
    .where(or(ilike(evidenceSources.title, pattern), ilike(evidenceSources.doi, pattern), ilike(evidenceSources.pmid, pattern)))
    .orderBy(desc(evidenceSources.dateChecked))
    .limit(limit)
}
