import type { SeedDossier } from '@/lib/seed-types'

// A second cardiometabolic file, and the reason is worth recording: three successive agents
// assigned to small-molecule-cardiometabolic.ts researched for ninety minutes and wrote nothing,
// each batching its whole array until the end and each dying before it got there. This file lets a
// replacement write incrementally without racing whichever of them is still alive. If both
// eventually deliver, index.ts's duplicate-slug guard is what catches the overlap.
export const CARDIOMETABOLIC_B_DOSSIERS: SeedDossier[] = []
