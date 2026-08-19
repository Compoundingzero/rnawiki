import type { SeedDossier } from '@/lib/seed-types'

/**
 * The curated flagship dossiers, grouped by modality so each file stays reviewable and so every
 * modality in the product's vocabulary has real pages behind it.
 *
 * Adding a group: create the file, export a `SeedDossier[]`, import it here.
 */
import { SIRNA_DOSSIERS } from './sirna'
import { ASO_DOSSIERS } from './aso'
import { MRNA_DOSSIERS } from './mrna'
import { GENE_THERAPY_DOSSIERS } from './gene-therapy'
import { PEPTIDE_DOSSIERS } from './peptide'
import { ANTIBODY_DOSSIERS } from './antibody'
import { BIOLOGIC_DOSSIERS } from './biologic'
import { SMALL_MOLECULE_DOSSIERS } from './small-molecule'
import { NUTRACEUTICAL_DOSSIERS } from './nutraceutical'

export const ALL_SEED_DOSSIERS: SeedDossier[] = [
  ...SIRNA_DOSSIERS,
  ...ASO_DOSSIERS,
  ...MRNA_DOSSIERS,
  ...GENE_THERAPY_DOSSIERS,
  ...PEPTIDE_DOSSIERS,
  ...ANTIBODY_DOSSIERS,
  ...BIOLOGIC_DOSSIERS,
  ...SMALL_MOLECULE_DOSSIERS,
  ...NUTRACEUTICAL_DOSSIERS,
]

/** Every slug must be unique: two dossiers writing the same row would silently lose one. */
const seen = new Set<string>()
for (const dossier of ALL_SEED_DOSSIERS) {
  if (seen.has(dossier.slug)) {
    throw new Error(`Duplicate seed slug: ${dossier.slug}`)
  }
  seen.add(dossier.slug)
}
