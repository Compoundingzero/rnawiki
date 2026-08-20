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
  ...SMALL_MOLECULE_NEURO_DOSSIERS,
  ...SMALL_MOLECULE_INFECTIOUS_ONC_DOSSIERS,
  ...NUTRACEUTICAL_CORE_DOSSIERS,
  ...NUTRACEUTICAL_BOTANICAL_DOSSIERS,
]

/**
 * Two dossiers writing the same row would silently lose one, so duplicates are resolved here
 * rather than left to whichever insert ran last.
 *
 * They happen for a mundane reason: several agents research these files concurrently, and one that
 * loses its place can write a dossier into a sibling group's file or restore a batch it had
 * already written. The group file a dossier lives in is an organisational convenience with no
 * user-visible effect — the slug is the identity — so the first occurrence wins and the rest are
 * reported, loudly enough to clean up but not loudly enough to take the site down.
 */
const seen = new Map<string, number>()
const duplicates: string[] = []

export const SEED_DOSSIERS: SeedDossier[] = ALL_SEED_DOSSIERS.filter((dossier) => {
  const count = seen.get(dossier.slug) ?? 0
  seen.set(dossier.slug, count + 1)
  if (count > 0) {
    duplicates.push(dossier.slug)
    return false
  }
  return true
})

if (duplicates.length > 0) {
  console.warn(
    `[seed-data] ${duplicates.length} duplicate dossier(s) dropped, first occurrence kept: ` +
      `${[...new Set(duplicates)].join(', ')}`,
  )
}
