/**
 * The corpus half of the owner-curated redirect ledger (R8).
 *
 * `medicine_slug_redirects` maps an old public slug to a legacy `drugs` row. Reconciliation
 * produced 864 of those rows, and their targets are now corpus records: a target whose legacy row
 * is a retained, non-public identity would otherwise fail the ledger's public-target check and
 * answer 404, orphaning a URL that was indexed.
 *
 * This module answers one question — which corpus record does that target drug id belong to — and
 * `resolvePublicMedicineRoute` calls it only after the public-target lookup has already failed. It
 * adds no second redirect mechanism: the ledger, the one-hop rule and the 301 all stay where they
 * were.
 */
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { corpusPages, medicineSlugRedirects } from '@/db/schema'

export async function corpusSlugForLegacyDrugId(drugId: string): Promise<string | null> {
  const rows = await db
    .select({ slug: corpusPages.slug })
    .from(corpusPages)
    .where(eq(corpusPages.legacyDrugId, drugId))
    .limit(1)
  const slug = rows[0]?.slug
  if (!slug) return null

  // A canonical redirect is one hop. If the corpus slug is itself an old slug in the ledger, the
  // ledger is inconsistent and the request fails closed rather than starting a chain.
  const chained = await db
    .select({ oldSlug: medicineSlugRedirects.oldSlug })
    .from(medicineSlugRedirects)
    .where(eq(medicineSlugRedirects.oldSlug, slug))
    .limit(1)
  return chained[0] ? null : slug
}
