import type { SeedDossier } from '@/lib/seed-types'

// Awaiting researched dossiers. An empty array keeps the loader honest: a group with nothing
// verified contributes no pages rather than fabricated ones.
export const WITHDRAWN_AND_RESTRICTED_DOSSIERS: SeedDossier[] = []
