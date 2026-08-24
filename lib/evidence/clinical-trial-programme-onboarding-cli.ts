export interface ClinicalTrialProgrammeOnboardingCliOptions {
  medicineSlug: string
  nctId: string
  commit: boolean
}

const VALUE_OPTIONS = new Set(['--medicine', '--nct'])

/** Strict operator parser: onboarding is read-only unless the standalone --commit flag is present. */
export function parseClinicalTrialProgrammeOnboardingArgs(
  args: readonly string[],
): ClinicalTrialProgrammeOnboardingCliOptions {
  const seen = new Set<string>()
  let medicineSlug: string | null = null
  let nctId: string | null = null
  let commit = false

  for (let index = 0; index < args.length; index += 1) {
    const option = args[index]!
    if (seen.has(option)) throw new TypeError(`Duplicate onboarding option: ${option}`)
    if (option === '--commit') {
      seen.add(option)
      commit = true
      continue
    }
    if (!VALUE_OPTIONS.has(option)) throw new TypeError(`Unknown onboarding option: ${option}`)
    seen.add(option)
    const value = args[index + 1]
    if (!value || value.startsWith('--')) throw new TypeError(`${option} requires a value`)
    index += 1
    if (option === '--medicine') medicineSlug = value.trim()
    else nctId = value.trim()
  }

  if (!medicineSlug) throw new TypeError('--medicine requires a medicine slug')
  if (!nctId) throw new TypeError('--nct requires an NCT identifier')
  return { medicineSlug, nctId, commit }
}
