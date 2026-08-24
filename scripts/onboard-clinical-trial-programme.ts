import 'dotenv/config'

import { ClinicalTrialsGovAdapter } from '@/lib/evidence/adapters/clinical-trials-gov'
import { onboardClinicalTrialProgramme } from '@/lib/evidence/clinical-trial-programme-onboarding'
import { parseClinicalTrialProgrammeOnboardingArgs } from '@/lib/evidence/clinical-trial-programme-onboarding-cli'
import { DrizzleClinicalTrialProgrammeOnboardingStore } from '@/lib/evidence/clinical-trial-programme-onboarding-drizzle'

async function main(): Promise<void> {
  const options = parseClinicalTrialProgrammeOnboardingArgs(process.argv.slice(2))
  const { closeDatabasePool, db } = await import('@/db')
  try {
    const result = await onboardClinicalTrialProgramme({
      ...options,
      adapter: new ClinicalTrialsGovAdapter(),
      store: new DrizzleClinicalTrialProgrammeOnboardingStore(db),
    })
    process.stdout.write(`${JSON.stringify(result)}\n`)
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  const candidate = error as { code?: unknown; message?: unknown }
  process.stdout.write(
    `${JSON.stringify({
      schemaVersion: 'clinical-trial-programme-onboarding/v1',
      fatal: true,
      errorCode:
        typeof candidate?.code === 'string' && candidate.code.trim()
          ? candidate.code.trim().slice(0, 120)
          : 'ONBOARDING_FATAL',
      errorMessage:
        typeof candidate?.message === 'string' && candidate.message.trim()
          ? candidate.message.trim().slice(0, 2_000)
          : 'ClinicalTrials.gov programme onboarding failed without an error message.',
    })}\n`,
  )
  process.exitCode = 1
})
