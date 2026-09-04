/**
 * The shape of the ClinicalTrials.gov v2 fields this ingestion reads, and the shape it writes.
 *
 * Every path here was verified against real responses in Phase 0 — see `data/trial-results/
 * phase0-union-shape.json` for the union over 250 studies and `state.json` under `api.paths` for
 * the recorded contract. Fields are optional because the registry omits what a sponsor did not
 * post; absence is a legitimate result, never an error.
 */

export interface RegistryGroup {
  id?: string
  title?: string
  description?: string
}

export interface RegistryMeasurement {
  groupId?: string
  value?: string
  spread?: string
  lowerLimit?: string
  upperLimit?: string
  comment?: string
}

export interface RegistryCategory {
  title?: string
  measurements?: RegistryMeasurement[]
}

export interface RegistryClass {
  title?: string
  categories?: RegistryCategory[]
  denoms?: RegistryDenom[]
}

export interface RegistryDenom {
  units?: string
  counts?: { groupId?: string; value?: string }[]
}

/** A between-group difference the registry itself states. Never computed here. */
export interface RegistryAnalysis {
  groupIds?: string[]
  groupDescription?: string
  paramType?: string
  paramValue?: string
  dispersionType?: string
  dispersionValue?: string
  ciPctValue?: string
  ciNumSides?: string
  ciLowerLimit?: string
  ciUpperLimit?: string
  pValue?: string
  pValueComment?: string
  statisticalMethod?: string
  statisticalComment?: string
  estimateComment?: string
  testedNonInferiority?: boolean
  nonInferiorityType?: string
  nonInferiorityComment?: string
}

export interface RegistryOutcomeMeasure {
  type?: string
  reportingStatus?: string
  title?: string
  description?: string
  timeFrame?: string
  populationDescription?: string
  unitOfMeasure?: string
  paramType?: string
  dispersionType?: string
  groups?: RegistryGroup[]
  denoms?: RegistryDenom[]
  classes?: RegistryClass[]
  analyses?: RegistryAnalysis[]
}

export interface RegistryEventGroup {
  id?: string
  title?: string
  description?: string
  seriousNumAffected?: number
  seriousNumAtRisk?: number
  otherNumAffected?: number
  otherNumAtRisk?: number
  deathsNumAffected?: number
  deathsNumAtRisk?: number
}

export interface RegistryStudy {
  hasResults?: boolean
  protocolSection?: {
    identificationModule?: { nctId?: string; briefTitle?: string; officialTitle?: string }
    statusModule?: {
      overallStatus?: string
      primaryCompletionDateStruct?: { date?: string }
      completionDateStruct?: { date?: string }
      resultsFirstPostDateStruct?: { date?: string }
      resultsFirstSubmitDate?: string
      resultsFirstSubmitQcDate?: string
      delayedPosting?: boolean
    }
    designModule?: {
      studyType?: string
      phases?: string[]
      enrollmentInfo?: { count?: number; type?: string }
      designInfo?: {
        allocation?: string
        interventionModel?: string
        primaryPurpose?: string
        maskingInfo?: { masking?: string; whoMasked?: string[] }
      }
    }
    armsInterventionsModule?: {
      armGroups?: { label?: string; type?: string; interventionNames?: string[] }[]
    }
    referencesModule?: { references?: { pmid?: string; type?: string; citation?: string }[] }
  }
  resultsSection?: {
    participantFlowModule?: {
      recruitmentDetails?: string
      groups?: RegistryGroup[]
      periods?: {
        title?: string
        milestones?: {
          type?: string
          achievements?: { groupId?: string; numSubjects?: string }[]
        }[]
      }[]
    }
    baselineCharacteristicsModule?: unknown
    outcomeMeasuresModule?: { outcomeMeasures?: RegistryOutcomeMeasure[] }
    adverseEventsModule?: {
      frequencyThreshold?: string
      timeFrame?: string
      eventGroups?: RegistryEventGroup[]
    }
  }
}

// --- what Phase 3 writes -----------------------------------------------------------------------

export interface ExtractedValue {
  classTitle: string | null
  categoryTitle: string | null
  groupId: string | null
  groupTitle: string | null
  value: string | null
  spread: string | null
  lowerLimit: string | null
  upperLimit: string | null
  comment: string | null
}

export interface ExtractedComparison {
  groupIds: string[]
  groupTitles: (string | null)[]
  groupDescription: string | null
  paramType: string | null
  paramValue: string | null
  dispersionType: string | null
  dispersionValue: string | null
  ciPctValue: string | null
  ciNumSides: string | null
  ciLowerLimit: string | null
  ciUpperLimit: string | null
  pValue: string | null
  pValueComment: string | null
  statisticalMethod: string | null
  statisticalComment: string | null
  estimateComment: string | null
  testedNonInferiority: boolean | null
  nonInferiorityType: string | null
  nonInferiorityComment: string | null
}

export interface ExtractedOutcome {
  type: string | null
  reportingStatus: string | null
  title: string | null
  description: string | null
  timeFrame: string | null
  populationDescription: string | null
  unitOfMeasure: string | null
  paramType: string | null
  dispersionType: string | null
  groups: { id: string | null; title: string | null; description: string | null }[]
  denominators: {
    groupId: string | null
    groupTitle: string | null
    value: number | null
    units: string | null
  }[]
  values: ExtractedValue[]
  statedComparisons: ExtractedComparison[]
}

export interface ExtractedStudy {
  nctId: string
  briefTitle: string | null
  officialTitle: string | null
  hasResults: boolean
  hasResultsSection: boolean
  qualifies: boolean
  failedBarBecause: string | null
  design: {
    studyType: string | null
    phases: string[]
    allocation: string | null
    interventionModel: string | null
    primaryPurpose: string | null
    masking: string | null
    whoMasked: string[]
    armCount: number
    armGroups: { label: string | null; type: string | null; interventionNames: string[] }[]
  }
  enrolment: {
    count: number | null
    type: string | null
    perArm: {
      groupId: string
      groupTitle: string | null
      started: number | null
      completed: number | null
    }[]
    recruitmentDetails: string | null
  }
  dates: {
    overallStatus: string | null
    primaryCompletion: string | null
    completion: string | null
    resultsFirstPosted: string | null
    resultsFirstSubmitted: string | null
    resultsQcCleared: string | null
    delayedPosting: boolean
  }
  outcomes: ExtractedOutcome[]
  adverseEvents: {
    frequencyThreshold: string | null
    timeFrame: string | null
    perArm: {
      groupId: string | null
      groupTitle: string | null
      seriousAffected: number | null
      seriousAtRisk: number | null
      otherAffected: number | null
      otherAtRisk: number | null
      deathsAffected: number | null
      deathsAtRisk: number | null
    }[]
  }
  publications: { pmid: string; type: string | null; citation: string | null }[]
}
