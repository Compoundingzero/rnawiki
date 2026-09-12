/**
 * The goal-first entry point (Phase 4 seed): which loaded pages have registered studies whose
 * conditions fall under a human goal (docs/dossier-information-architecture.md, "Goal lens").
 *
 * This is a registry fact, not evidence of benefit: a page is listed because studies were
 * registered in the area, and the list says so on every row. It reads the stored registry
 * aggregate for every loaded page once per process and keeps the result for ten minutes, so the
 * homepage strip and the goal pages cost one scan rather than one per request.
 */
import { db } from '@/db'
import { corpusPages, pageRegistryAggregate } from '@/db/schema'
import { eq } from 'drizzle-orm'

import { goalsFromConditions } from './goals'
import { USER_GOALS, type UserGoal } from './taxonomy'

export interface GoalPageRow {
  slug: string
  name: string
  conditions: string[]
}

interface GoalIndex {
  builtAt: number
  byGoal: Map<UserGoal, GoalPageRow[]>
  pagesScanned: number
}

const TTL_MS = 10 * 60 * 1000
let cached: GoalIndex | null = null
let building: Promise<GoalIndex> | null = null

async function build(): Promise<GoalIndex> {
  const rows = await db
    .select({
      slug: corpusPages.slug,
      name: corpusPages.displayName,
      indexable: corpusPages.indexable,
      aggregate: pageRegistryAggregate.aggregate,
    })
    .from(pageRegistryAggregate)
    .innerJoin(corpusPages, eq(corpusPages.key, pageRegistryAggregate.key))
  const byGoal = new Map<UserGoal, GoalPageRow[]>()
  for (const goal of USER_GOALS) byGoal.set(goal.code, [])
  for (const row of rows) {
    const aggregate = row.aggregate as { conditions?: unknown }
    const conditions = Array.isArray(aggregate?.conditions)
      ? (aggregate.conditions as unknown[]).filter(
          (item): item is string => typeof item === 'string',
        )
      : []
    if (conditions.length === 0) continue
    for (const [goal, matched] of goalsFromConditions(conditions)) {
      byGoal.get(goal)?.push({ slug: row.slug, name: row.name, conditions: matched })
    }
  }
  for (const list of byGoal.values()) list.sort((a, b) => a.name.localeCompare(b.name))
  return { builtAt: Date.now(), byGoal, pagesScanned: rows.length }
}

export async function goalIndex(): Promise<GoalIndex> {
  if (cached && Date.now() - cached.builtAt < TTL_MS) return cached
  if (!building) {
    building = build()
      .then((index) => {
        cached = index
        return index
      })
      .finally(() => {
        building = null
      })
  }
  return building
}

export function isUserGoal(value: string): value is UserGoal {
  return USER_GOALS.some((goal) => goal.code === value)
}
