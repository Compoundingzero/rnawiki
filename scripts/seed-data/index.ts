import type { SeedDossier } from '@/lib/seed-types'

/**
 * The curated flagship dossiers, grouped so each file stays reviewable and so every modality in the
 * product's vocabulary has real pages behind it.
 *
 * Every group is imported unconditionally, including the empty ones. A group that contributes no
 * dossiers should be visibly empty here rather than quietly absent -- the difference between
 * 'nobody has written these yet' and 'somebody forgot to wire this up' is one nobody can see from
 * the outside once the import is missing.
 */
import { SIRNA_DOSSIERS } from './sirna'
import { ASO_DOSSIERS } from './aso'
import { MRNA_DOSSIERS } from './mrna'
import { GENE_THERAPY_DOSSIERS } from './gene-therapy'
import { PEPTIDE_DOSSIERS } from './peptide'
import { ANTIBODY_DOSSIERS } from './antibody'
import { BIOLOGIC_DOSSIERS } from './biologic'
import { SMALL_MOLECULE_CARDIOMETABOLIC_DOSSIERS } from './small-molecule-cardiometabolic'
import { CARDIOMETABOLIC_B_DOSSIERS } from './cardiometabolic-b'
import { SMALL_MOLECULE_NEURO_DOSSIERS } from './small-molecule-neuro'
import { SMALL_MOLECULE_INFECTIOUS_ONC_DOSSIERS } from './small-molecule-infectious-onc'
import { NUTRACEUTICAL_CORE_DOSSIERS } from './nutraceutical-core'
import { NUTRACEUTICAL_BOTANICAL_DOSSIERS } from './nutraceutical-botanical'

export const ALL_SEED_DOSSIERS: SeedDossier[] = [
  ...SIRNA_DOSSIERS,
  ...ASO_DOSSIERS,
  ...MRNA_DOSSIERS,
  ...GENE_THERAPY_DOSSIERS,
  ...PEPTIDE_DOSSIERS,
  ...ANTIBODY_DOSSIERS,
  ...BIOLOGIC_DOSSIERS,
  ...SMALL_MOLECULE_CARDIOMETABOLIC_DOSSIERS,
  ...CARDIOMETABOLIC_B_DOSSIERS,
  ...SMALL_MOLECULE_NEURO_DOSSIERS,
  ...SMALL_MOLECULE_INFECTIOUS_ONC_DOSSIERS,
  ...NUTRACEUTICAL_CORE_DOSSIERS,
  ...NUTRACEUTICAL_BOTANICAL_DOSSIERS,
]

/** Two dossiers writing the same row would silently lose one, so a duplicate slug is fatal. */
const seen = new Set<string>()
for (const dossier of ALL_SEED_DOSSIERS) {
  if (seen.has(dossier.slug)) {
    throw new Error(`Duplicate seed slug: ${dossier.slug}`)
  }
  seen.add(dossier.slug)
}
