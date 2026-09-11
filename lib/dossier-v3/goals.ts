/**
 * The goal lens: which human goals a page can be read through.
 *
 * A goal is attached to a page in two ways, and the page says which:
 *  1. A reviewed claim names the goal (`structure.goals` on an effect or recorded-use claim). That
 *     is evidence-bearing and drives the "Does it work?" section.
 *  2. A registered study's condition text falls under the goal by the fixed keyword table below.
 *     That says only that studies were registered in the area. It is a registry fact about what
 *     was studied and never a statement that the substance helps with the goal.
 *
 * The table is deterministic and reviewable. It never runs over free prose, only over the
 * registry's own condition strings, and a condition that matches nothing is simply unlisted.
 */
import { USER_GOALS, type UserGoal } from './taxonomy'

const GOAL_KEYWORDS: Record<UserGoal, readonly RegExp[]> = {
  sleep: [/\bsleep/i, /insomnia/i, /apnea/i, /circadian/i],
  energy: [/\bfatigue/i, /\benergy\b/i, /tiredness/i],
  focus: [/\bcognit/i, /attention/i, /\bmemory\b/i, /dementia/i, /alzheimer/i, /\badhd\b/i],
  mood: [/depress/i, /anxiety/i, /\bmood\b/i, /bipolar/i, /schizophren/i],
  strength: [/\bstrength\b/i, /sarcopenia/i, /muscle (?:weakness|function|strength)/i],
  muscle: [/\bmuscle\b/i, /\blean (?:body )?mass/i, /myopathy/i, /dystrophy/i],
  endurance: [/endurance/i, /\bexercise (?:capacity|performance|tolerance)/i, /vo2/i, /aerobic/i],
  body_fat_weight: [/\bobes/i, /\bweight\b/i, /overweight/i, /body composition/i, /adipos/i],
  glucose_metabolic: [
    /diabet/i,
    /glyc/i,
    /glucose/i,
    /insulin/i,
    /metabolic syndrome/i,
    /prediabet/i,
  ],
  cardiovascular_risk: [
    /cardiovascular/i,
    /\bheart\b/i,
    /cholesterol/i,
    /lipid/i,
    /hypertension/i,
    /atheroscl/i,
    /\bstroke\b/i,
    /myocardial/i,
    /coronary/i,
  ],
  pain_recovery: [/\bpain\b/i, /recovery/i, /injury/i, /arthrit/i, /inflammat/i],
  fertility_sexual_health: [
    /fertil/i,
    /sperm/i,
    /erectile/i,
    /sexual/i,
    /polycystic ovary/i,
    /pcos/i,
  ],
  healthy_aging: [/\bag(?:e|ing|eing)\b/i, /longevity/i, /frailty/i, /older adult/i, /elderly/i],
}

export interface GoalLens {
  code: UserGoal
  label: string
  /** `reviewed`: a reviewed claim names this goal. `registered`: registered studies list conditions in this area. */
  basis: 'reviewed' | 'registered'
  /** The registry condition strings that put the goal on the page, verbatim, for the disclosure. */
  conditions: string[]
}

export function goalsFromConditions(conditions: readonly string[]): Map<UserGoal, string[]> {
  const found = new Map<UserGoal, string[]>()
  for (const condition of conditions) {
    for (const goal of USER_GOALS) {
      if (GOAL_KEYWORDS[goal.code].some((pattern) => pattern.test(condition))) {
        const list = found.get(goal.code) ?? []
        if (!list.includes(condition) && list.length < 12) list.push(condition)
        found.set(goal.code, list)
      }
    }
  }
  return found
}

export function goalLabel(code: UserGoal): string {
  return USER_GOALS.find((goal) => goal.code === code)?.label ?? code
}

export function buildGoalLenses(
  reviewedGoals: ReadonlySet<UserGoal>,
  conditions: readonly string[],
): GoalLens[] {
  const fromConditions = goalsFromConditions(conditions)
  const lenses: GoalLens[] = []
  for (const goal of USER_GOALS) {
    if (reviewedGoals.has(goal.code)) {
      lenses.push({
        code: goal.code,
        label: goal.label,
        basis: 'reviewed',
        conditions: fromConditions.get(goal.code) ?? [],
      })
    } else if (fromConditions.has(goal.code)) {
      lenses.push({
        code: goal.code,
        label: goal.label,
        basis: 'registered',
        conditions: fromConditions.get(goal.code) ?? [],
      })
    }
  }
  return lenses
}
