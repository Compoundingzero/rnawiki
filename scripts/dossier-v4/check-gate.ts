/**
 * Decide whether a slug may be served through the Substance Compass.
 *
 *   npx tsx scripts/dossier-v4/check-gate.ts --slugs creatine-monohydrate,semaglutide
 *
 * The brief's rule is that a page must pass its gates before the flag is turned on for it, so the
 * flag is not the decision — this is. It reports each gate, the provenance of the opening
 * statements, and whether the approved first-read answer still binds to the record.
 *
 * Read-only. It writes nothing and changes nothing.
 */
import 'dotenv/config'

import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'
import { legacyTenSecondAnswerFingerprint } from '@/lib/legacy-ten-second-provenance'
import { LEGACY_TEN_SECOND_APPROVED_FINGERPRINTS } from '@/lib/ten-second-answer-evidence-fingerprints'
import { TEN_SECOND_ANSWER_OVERRIDES } from '@/lib/ten-second-answer-overrides'

function parseSlugs(argv: string[]): string[] {
  const index = argv.indexOf('--slugs')
  const value = index >= 0 ? argv[index + 1] : undefined
  if (!value) throw new Error('pass --slugs')
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function main(): Promise<void> {
  const slugs = parseSlugs(process.argv.slice(2))
  let blocked = 0
  for (const slug of slugs) {
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) {
      console.log(`${slug}: no corpus record. The compass cannot serve this slug.`)
      blocked += 1
      continue
    }
    const model = buildDossierV4(inputs)
    const failed = model.gates.filter((gate) => !gate.passed)
    const legacy = inputs.legacyRecord
    const copy = legacy ? TEN_SECOND_ANSWER_OVERRIDES[legacy.id] : undefined
    const fingerprint = legacy && copy ? legacyTenSecondAnswerFingerprint(legacy, copy) : null
    console.log(
      JSON.stringify(
        {
          slug,
          safeToEnable: failed.length === 0,
          gatesFailed: failed.map((gate) => gate.code),
          heroOrigins: {
            action: model.hero.simpleAction.origin,
            result: model.hero.strongestGoalResult.origin,
            limit: model.hero.principalUncertainty.origin,
          },
          openingWords: model.hero.openingWordCount,
          firstReadAnswer: {
            authoredCopyExists: Boolean(copy),
            bound: Boolean(inputs.boundAnswer),
            fingerprint: fingerprint ? fingerprint.slice(0, 16) : null,
            approvedList: LEGACY_TEN_SECOND_APPROVED_FINGERPRINTS.size,
          },
          sectionsRendered: model.sections.filter(
            (section) => section.state !== 'no_qualifying_evidence',
          ).length,
          sectionsAbsent: model.sections
            .filter((section) => section.state === 'no_qualifying_evidence')
            .map((section) => section.id),
          reviewedClaims: inputs.claims.length,
          testedStudies: inputs.roleAggregate?.tested.studies ?? 0,
        },
        null,
        2,
      ),
    )
    if (failed.length > 0) blocked += 1
  }
  if (blocked > 0) {
    console.error(`${blocked} of ${slugs.length} slugs are not clear to enable.`)
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exit(1)
})
