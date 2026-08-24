import { and, eq } from 'drizzle-orm'

import { db } from '@/db'
import { drugs, savedDrugs } from '@/db/schema'

/** Reads one reader-owned bookmark without loading their whole saved-medicine list. */
export async function isMedicineSavedBySlug(
  userId: string,
  medicineSlug: string,
): Promise<boolean> {
  const rows = await db
    .select({ drugId: savedDrugs.drugId })
    .from(savedDrugs)
    .innerJoin(drugs, eq(drugs.id, savedDrugs.drugId))
    .where(and(eq(savedDrugs.userId, userId), eq(drugs.slug, medicineSlug)))
    .limit(1)
  return rows.length === 1
}
