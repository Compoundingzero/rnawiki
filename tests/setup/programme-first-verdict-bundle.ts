import {
  EVIDENCE_NODE_TYPES,
  PROGRAMME_SUMMARY_FIELD_PATHS,
  PROGRAMME_VERDICT_FIELD_PATHS,
} from '@/lib/evidence/types'
import {
  PROGRAMME_FIRST_VERDICT_AUTHORING_SCHEMA_VERSION,
  programmeFirstVerdictAuthoringBundleSchema,
  type ProgrammeFirstVerdictAuthoringBundle,
} from '@/lib/programme-first-verdict-authoring'

/** Synthetic test input only. This is not reviewed evidence and must never be imported as seed data. */

export function firstVerdictBundleFixture(args: {
  programmeId: string
  programmeTrialId: string
  sourceSnapshotId: string
  claimText?: string
}): ProgrammeFirstVerdictAuthoringBundle {
  const claimKey = 'first.measured-result'
  const proposalAsOfDate = new Date().toISOString().slice(0, 10)
  return programmeFirstVerdictAuthoringBundleSchema.parse({
    schemaVersion: PROGRAMME_FIRST_VERDICT_AUTHORING_SCHEMA_VERSION,
    programmeId: args.programmeId,
    proposalAsOfDate,
    conflictsOfInterest: 'No conflicts declared.',
    programmeTrialIds: [args.programmeTrialId],
    claims: [
      {
        claimKey,
        programmeTrialId: args.programmeTrialId,
        evidenceNodeType: null,
        nature: 'MEASURED',
        direction: 'NOT_APPLICABLE',
        plainLanguageText:
          args.claimText ?? 'The exact source reports a measured programme result.',
        numericUnitRequired: false,
        stoppingReason: false,
        sourceSnapshotIds: [args.sourceSnapshotId],
      },
    ],
    evidenceNodes: EVIDENCE_NODE_TYPES.map((nodeType) => ({
      nodeType,
      state: 'UNKNOWN',
      plainSummary: `Synthetic test-only ${nodeType} state with an explicit source-backed claim.`,
      professionalSummary: `Synthetic test-only ${nodeType} assessment for integration coverage.`,
      rationale: 'This row exists only to exercise the complete five-node authoring contract.',
      visible: true,
      presentedAsPositive: false,
      presentedAsNegative: false,
      lastVerifiedAt: null,
      claimLinks: [{ claimKey, relationship: 'SUPPORTS' }],
    })),
    interpretabilityAssessments: [],
    conclusion: {
      verdictCode: null,
      publicLabel: 'The programme has one reviewed measured result.',
      professionalLabel: 'A measured result is available for this programme.',
      indicationScope: 'Adults with the recorded condition.',
      populationScope: 'The population enrolled in the scoped trial.',
      doseExposureScope: 'The exposure recorded in the scoped trial.',
      periodScope: `Evidence available through ${proposalAsOfDate}.`,
      trialScope: 'The exact normalized trial in this bundle.',
      outcomeScope: 'The measured programme outcome.',
      plainMechanism: 'The medicine was expected to act through the reviewed pathway.',
      bestSupportedFinding: 'The exact source reports a measured programme result.',
      mainLimitation: 'The bundle contains one scoped result and should not be generalized.',
      oneSentenceReason: 'The conclusion is limited to the exact measured result reviewed here.',
      whatWasDisproven: [],
      whatWasNotDisproven: ['Claims outside the measured outcome were not tested by this result.'],
      whatRemainsUnknown: ['Whether the result applies outside the scoped trial remains unknown.'],
      confidence: 'MODERATE',
      confidenceExplanation: 'Confidence is limited by the single scoped source and trial.',
      conditionsThatWouldChangeVerdict: ['A new exact result that changes the measured outcome.'],
      sourceDependent: true,
      claimLinks: [{ claimKey, relationship: 'SUPPORTING' }],
    },
    dependencies: {
      summary: Object.fromEntries(
        PROGRAMME_SUMMARY_FIELD_PATHS.map((fieldPath) => [fieldPath, [claimKey]]),
      ),
      verdict: Object.fromEntries(
        PROGRAMME_VERDICT_FIELD_PATHS.map((fieldPath) => [fieldPath, [claimKey]]),
      ),
    },
    presentation: {
      mechanismSteps: ['entry', 'pathway', 'outcome'].map((stepKey, index) => ({
        stepKey,
        stepOrder: index + 1,
        plainTitle: `Reviewed mechanism stage ${index + 1}`,
        plainDescription: 'This stage is an explicitly authored expectation linked to the source.',
        technicalDescription: null,
        evidenceBasis: 'PREDICTED',
        claimLinks: [{ claimKey, relationship: 'SUPPORTS' }],
      })),
      timelineEvents: [],
    },
  })
}
