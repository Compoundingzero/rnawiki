import {
  detectPublicMedicineContextItems,
  publicMedicinePercentageComparisonKind,
  type PublicMedicineContextItem,
} from '@/lib/public-medicine-context'

export interface MedicineTextContextMatch {
  context: PublicMedicineContextItem
  /** Literal phrases that may be annotated. Defaults to the complete technical term. */
  matchTerms?: readonly string[]
}

function uniqueTerms(values: readonly (string | undefined)[]): string[] {
  const seen = new Set<string>()
  const terms: string[] = []
  for (const value of values) {
    const term = value?.trim()
    const key = term?.toLocaleLowerCase('en-US')
    if (!term || !key || seen.has(key)) continue
    seen.add(key)
    terms.push(term)
  }
  return terms.sort((left, right) => right.length - left.length)
}

function exactMatches(text: string, pattern: RegExp): string[] {
  return [...text.matchAll(pattern)].flatMap((match) => match[0] ?? [])
}

/**
 * Literal aliases used only to attach a known definition to words already present in stored copy.
 * This does not rewrite, infer, or classify medical content.
 */
export function medicineContextMatchTerms(
  text: string,
  context: PublicMedicineContextItem,
): string[] {
  const storedTerm = context.technicalTerm.trim()
  const key = context.key
  const percentageComparisonKind = publicMedicinePercentageComparisonKind(text)
  if (key === 'percentage-versus-placebo' && percentageComparisonKind !== 'percentage') return []
  if (
    key === 'percentage-points-versus-placebo' &&
    percentageComparisonKind !== 'percentage-points'
  ) {
    return []
  }
  const combinedModalityTerm =
    key.startsWith('modality:') && /^GalNAc-tagged siRNA/iu.test(storedTerm)
  const common: string[] = combinedModalityTerm ? [] : [storedTerm]

  if (key === 'percentage-versus-placebo' || key === 'percentage-points-versus-placebo') {
    common.push(
      ...exactMatches(
        text,
        /-?\d+(?:\.\d+)?\s+(?:to|–|—)\s+-?\d+(?:\.\d+)?\s+percentage\s+points?/giu,
      ),
      ...exactMatches(
        text,
        /-?\d+(?:\.\d+)?\s*(?:%|per cent|percent(?:age)?(?:\s+points?)?)\s+(?:and|or)\s+-?\d+(?:\.\d+)?\s*(?:%|per cent|percent(?:age)?(?:\s+points?)?)/giu,
      ),
      ...exactMatches(
        text,
        /-?\d+(?:\.\d+)?\s+(?:and|or)\s+-?\d+(?:\.\d+)?\s+percentage\s+points?/giu,
      ),
      ...exactMatches(text, /-?\d+(?:\.\d+)?\s*(?:%|per cent|percent(?:age)?(?:\s+points?)?)/giu),
      ...exactMatches(text, /\b(?:about|roughly|nearly) half\b/giu),
    )
  }

  if (key === 'percentage') {
    common.push(
      ...exactMatches(
        text,
        /-?\d+(?:\.\d+)?\s*(?:%|per cent|percent(?:age)?)(?!\s+points?)\s+(?:and|or)\s+-?\d+(?:\.\d+)?\s*(?:%|per cent|percent(?:age)?)(?!\s+points?)/giu,
      ),
      ...exactMatches(
        text,
        /-?\d+(?:\.\d+)?\s+(?:and|or)\s+-?\d+(?:\.\d+)?\s+(?:%|percent(?:age)?)(?!\s+points?)/giu,
      ),
      ...exactMatches(text, /-?\d+(?:\.\d+)?\s*(?:%|per cent|percent(?:age)?)(?!\s+points?)/giu),
      ...exactMatches(text, /\bpercent(?:age)?\b(?!\s+points?)/giu),
      ...exactMatches(text, /\b(?:about|roughly|nearly) half\b/giu),
    )
  }

  if (key === 'percentage-points') {
    common.push(
      ...exactMatches(
        text,
        /-?\d+(?:\.\d+)?\s+(?:to|–|—)\s+-?\d+(?:\.\d+)?\s+percentage\s+points?/giu,
      ),
      ...exactMatches(
        text,
        /-?\d+(?:\.\d+)?\s+(?:and|or)\s+-?\d+(?:\.\d+)?\s+percentage\s+points?/giu,
      ),
      ...exactMatches(text, /-?\d+(?:\.\d+)?\s+percentage\s+points?/giu),
      ...exactMatches(text, /\bpercentage\s+points?\b/giu),
    )
  }

  if (
    key === 'placebo' ||
    key === 'percentage-versus-placebo' ||
    key === 'percentage-points-versus-placebo'
  ) {
    common.push('dummy treatment', 'inactive treatment', 'placebo', 'comparison treatment')
  }

  if (key === 'study-identifier') {
    common.push(...exactMatches(text, /\bNCT\d{8}\b/giu))
  }

  if (key === 'rna') common.push('RNAi', 'RNA')
  if (key === 'sirna') common.push('small interfering RNA', 'siRNA')
  if (key === 'messenger-rna') common.push('messenger RNA', 'mRNA')

  if (key === 'ldl-cholesterol') {
    common.push(
      'LDL (“bad”) cholesterol',
      'LDL ("bad") cholesterol',
      'LDL cholesterol',
      'LDL-C',
      'LDL',
    )
  }

  if (key === 'pcsk9') common.push('PCSK9')
  if (key === 'galnac') common.push('GalNAc')
  if (key === 'placebo-adjusted') common.push('placebo-adjusted', 'placebo corrected')
  if (key === 'outcome-surrogate') {
    common.push(...exactMatches(text, /\bsurrogate(?: marker| outcome| endpoint)?s?\b/giu))
  }
  if (key === 'outcome-biomarker') {
    common.push(...exactMatches(text, /\bbiomarkers?\b|\bbiomarker outcomes?\b/giu))
  }
  if (key === 'study-randomisation') {
    common.push(...exactMatches(text, /\brandomi[sz](?:ed|ation)\b|\brandomly assigned\b/giu))
  }
  if (key === 'study-blinding') {
    common.push(
      ...exactMatches(
        text,
        /\b(?:single|double|triple)[- ](?:blind(?:ed)?|mask(?:ed|ing))\b|\bblind(?:ed|ing)\b|\bmasking\b|\bmasked\b(?=\s+(?:assessment|design|study|trial))\b/giu,
      ),
    )
  }
  if (key === 'study-open-label') {
    common.push(...exactMatches(text, /\bopen[- ]label\b/giu))
  }
  if (key === 'study-single-arm') {
    common.push(...exactMatches(text, /\bsingle[- ]arm(?:ed)?\b/giu))
  }
  if (key === 'study-crossover') {
    common.push(...exactMatches(text, /\bcross[- ]?over\b/giu))
  }
  if (key === 'study-non-inferiority') {
    common.push(...exactMatches(text, /\bnon[- ]inferior(?:ity)?\b/giu))
  }
  if (key === 'evidence-meta-analysis') {
    common.push(...exactMatches(text, /\bmeta[- ]analys(?:is|es)\b/giu))
  }
  if (key === 'evidence-systematic-review') {
    common.push(...exactMatches(text, /\bsystematic reviews?\b/giu))
  }
  if (key === 'evidence-cochrane-review') {
    common.push(...exactMatches(text, /\bCochrane reviews?\b/giu))
  }
  if (key === 'evidence-pooled-analysis') {
    common.push(...exactMatches(text, /\bpooled analys(?:is|es)\b/giu))
  }
  if (key === 'evidence-replication') {
    common.push(
      ...exactMatches(
        text,
        /\b(?:independent )?replicat(?:ed|es|ion|ions)\b|\bfailed to replicate\b/giu,
      ),
    )
  }
  if (key === 'study-futility') common.push(...exactMatches(text, /\bfutility\b/giu))
  if (key === 'study-major-decision') {
    common.push(...exactMatches(text, /\bpivotal (?:clinical )?(?:stud(?:y|ies)|trials?)\b/giu))
  }
  if (key === 'study-confirmatory') {
    common.push(
      ...exactMatches(text, /\bconfirmatory (?:clinical )?(?:stud(?:y|ies)|trials?)\b/giu),
    )
  }
  if (key === 'statistics-hazard-ratio') {
    common.push(...exactMatches(text, /\bhazard ratios?\b/giu))
  }
  if (key === 'statistics-relative-risk') {
    common.push(...exactMatches(text, /\b(?:relative risks?|risk ratios?)\b/giu))
  }
  if (key === 'statistics-odds-ratio') {
    common.push(...exactMatches(text, /\bodds ratios?\b/giu))
  }
  if (key === 'statistics-number-needed') {
    common.push(...exactMatches(text, /\bnumber needed to (?:treat|harm)\b/giu))
  }
  if (key === 'statistics-median') {
    common.push(
      ...exactMatches(
        text,
        /\bmedian\b(?=\s+(?:of\b|\d|age\b|follow[- ]up\b|overall survival\b|progression[- ]free survival\b|survival\b|time\b|duration\b|value\b|score\b|change\b|difference\b|response\b|concentration\b|level\b))/giu,
      ),
    )
  }
  if (key === 'pharmacokinetics') {
    common.push(...exactMatches(text, /\bpharmacokinetic(?:s)?\b/giu))
  }
  if (key === 'half-life') {
    common.push(...exactMatches(text, /\bhalf[- ](?:life|lives)\b/giu))
  }
  if (key === 'contraindication') {
    common.push(...exactMatches(text, /\bcontraindicat(?:ed|ion|ions)\b/giu))
  }
  if (key === 'adverse-event') {
    common.push(...exactMatches(text, /\badverse events?\b/giu))
  }
  if (key === 'p-value') {
    common.push(
      ...exactMatches(text, /\bp[- ]?value\b|\bp\s*(?:=|<|>|≤|≥)\s*(?:\d+(?:\.\d+)?|\.\d+)\b/giu),
    )
  }
  if (key === 'safety-boxed-warning') {
    common.push(...exactMatches(text, /\bboxed warnings?\b/giu))
  }
  if (key === 'regulatory-fda-label') {
    common.push(...exactMatches(text, /\bFDA labels?\b/giu))
  }
  if (key === 'outcome-all-cause-mortality') {
    common.push(...exactMatches(text, /\ball[- ]cause mortality\b/giu))
  }
  if (key === 'outcome-mortality') {
    common.push(...exactMatches(text, /\bmortality\b/giu))
  }
  if (key === 'medical-myocardial-infarction') {
    common.push(...exactMatches(text, /\bmyocardial infarctions?\b/giu))
  }
  if (key === 'medical-cardiovascular') {
    common.push(...exactMatches(text, /\bcardiovascular\b/giu))
  }
  if (key === 'measurement-hba1c') common.push(...exactMatches(text, /\bHbA1c\b/giu))
  if (key === 'measurement-muscle-biopsy') {
    common.push(...exactMatches(text, /\bmuscle biops(?:y|ies)\b/giu))
  }
  if (key === 'measurement-biopsy') {
    common.push(...exactMatches(text, /\bbiops(?:y|ies)\b/giu))
  }
  if (key === 'confidence-interval') {
    common.push(
      ...exactMatches(text, /\b\d{1,2}(?:\.\d+)?%\s+(?:confidence\s+)?interval\b/giu),
      ...exactMatches(text, /\b\d{1,2}(?:\.\d+)?%\s*CI\b/giu),
      ...exactMatches(text, /\bconfidence intervals?\b/giu),
    )
  }
  if (key === 'medicine-statin') common.push('statin', 'statins')
  if (key === 'familial-hypercholesterolaemia') {
    common.push(
      'familial hypercholesterolaemia',
      'familial hypercholesterolemia',
      'heterozygous FH',
      'homozygous FH',
      'HeFH',
      'HoFH',
    )
  }

  if (key === 'evidence-claim-survives-audit') {
    common.push('central claim survives audit')
  }
  if (key === 'muscle-creatine') common.push('muscle creatine')
  if (key === 'phosphocreatine-resynthesis') common.push('phosphocreatine resynthesis')
  if (key === 'exercise-short-duration-power') {
    common.push('short-duration power', 'short duration power')
  }
  if (key === 'neuroprotection') common.push('neuroprotection')
  if (key === 'mechanism-receptor-agonist') {
    common.push(...exactMatches(text, /\breceptor agonists?\b/giu))
  }
  if (key === 'mechanism-receptor-antagonist') {
    common.push(...exactMatches(text, /\breceptor antagonists?\b/giu))
  }
  if (key === 'mechanism-enzyme-inhibitor') {
    common.push(...exactMatches(text, /\benzyme inhibitors?\b/giu))
  }
  if (key === 'mechanism-monoclonal-antibody') {
    common.push(...exactMatches(text, /\bmonoclonal antibod(?:y|ies)\b/giu))
  }
  if (key === 'mechanism-prodrug') {
    common.push(...exactMatches(text, /\bprodrugs?\b/giu))
  }
  if (key === 'mechanism-active-metabolite') {
    common.push(...exactMatches(text, /\bactive metabolites?\b/giu))
  }
  if (key === 'mechanism-metabolite') {
    common.push(...exactMatches(text, /\bmetabolites?\b/giu))
  }
  if (key === 'mechanism-potassium-channel') {
    common.push(...exactMatches(text, /\bpotassium channels?\b/giu))
  }
  if (key === 'mechanism-sodium-channel') {
    common.push(...exactMatches(text, /\bsodium channels?\b/giu))
  }
  if (key === 'mechanism-receptor') {
    common.push(...exactMatches(text, /\breceptors?\b/giu))
  }
  if (key === 'mechanism-agonist') common.push(...exactMatches(text, /\bagonists?\b/giu))
  if (key === 'mechanism-antagonist') {
    common.push(...exactMatches(text, /\bantagonists?\b/giu))
  }
  if (key === 'mechanism-inhibitor') {
    common.push(...exactMatches(text, /\binhibit(?:s|ed|ing|ion)\b|\binhibitors?\b/giu))
  }
  if (key === 'mechanism-enzyme') common.push(...exactMatches(text, /\benzymes?\b/giu))
  if (key === 'mechanism-antibody') {
    common.push(...exactMatches(text, /\bantibod(?:y|ies)\b/giu))
  }
  if (/^study-phase-[1-4]$/u.test(key)) {
    const phase = key.slice('study-phase-'.length)
    const roman = ({ '1': 'I', '2': 'II', '3': 'III', '4': 'IV' } as const)[
      phase as '1' | '2' | '3' | '4'
    ]
    common.push(
      ...exactMatches(
        text,
        new RegExp(
          `\\bPhase\\s+(?:${phase}|${roman})${phase === '4' ? '' : '(?:a|b)?'}\\s+(?:clinical\\s+)?(?:trials?|stud(?:y|ies))\\b`,
          'giu',
        ),
      ),
      ...exactMatches(
        text,
        new RegExp(`\\bPhase\\s+(?:${phase}|${roman})${phase === '4' ? '' : '(?:a|b)?'}\\b`, 'giu'),
      ),
    )
  }
  if (key === 'evidence-failed-two-phase-3-trials') {
    common.push(
      ...exactMatches(text, /\bfailed\s+two\s+Phase\s+(?:3|III)\s+(?:clinical\s+)?trials\b/giu),
    )
  }
  if (key === 'evidence-replicated-across-time') {
    common.push('replicated across decades')
  }

  if (key === 'route-subcutaneous') {
    common.push('subcutaneous', 'subcutaneously', 'injection under the skin')
  }

  if (key === 'route-intravenous') {
    common.push('intravenous', 'intravenously', 'into a vein')
  }

  if (key.startsWith('study-day-')) {
    const day = key.slice('study-day-'.length)
    if (/^\d{1,5}$/u.test(day)) common.push(`day ${day}`, `${day} days`, `${day} day`)
  }

  if (key.startsWith('modality:')) {
    common.push('RNA-silencing medicine')
  }

  if (key.startsWith('study:')) {
    common.push(
      ...storedTerm
        .split(/\s*(?:,|\band\b)\s*/iu)
        .map((part) => part.trim())
        .filter(Boolean),
    )
  }

  return uniqueTerms(common)
}

/** Creates exact term bindings for one sentence or paragraph. */
export function medicineTextContextMatches(
  text: string,
  contexts: readonly PublicMedicineContextItem[],
): MedicineTextContextMatch[] {
  // Contextual hover/tap explanations are no longer part of the dossier. Most compatibility
  // callers now pass an empty list while they are being migrated to ordinary text; return before
  // scanning the large historical term catalogue.
  if (contexts.length === 0 || text.trim().length === 0) return []

  const normalizedText = text.toLocaleLowerCase('en-US')
  const seenKeys = new Set<string>()
  const locallyRelevantContexts = [...detectPublicMedicineContextItems([text]), ...contexts].filter(
    (context) => {
      if (seenKeys.has(context.key)) return false
      seenKeys.add(context.key)
      return true
    },
  )

  return locallyRelevantContexts.flatMap((context) => {
    const matchTerms = medicineContextMatchTerms(text, context).filter((term) =>
      normalizedText.includes(term.toLocaleLowerCase('en-US')),
    )
    return matchTerms.length > 0 ? [{ context, matchTerms }] : []
  })
}

export type AnnotatedMedicineTextPart =
  | string
  | {
      context: PublicMedicineContextItem
      key: string
      text: string
    }

interface MatchCandidate {
  context: PublicMedicineContextItem
  contextIndex: number
  end: number
  matchTermIndex: number
  start: number
}

function isWordCharacter(value: string | undefined) {
  return value ? /[\p{L}\p{N}_]/u.test(value) : false
}

function hasWholeTermBoundaries(text: string, start: number, matchTerm: string) {
  const end = start + matchTerm.length
  const beginsWithWordCharacter = isWordCharacter(matchTerm[0])
  const endsWithWordCharacter = isWordCharacter(matchTerm.at(-1))

  if (beginsWithWordCharacter && isWordCharacter(text[start - 1])) return false
  if (endsWithWordCharacter && isWordCharacter(text[end])) return false
  return true
}

function findNextWholeTerm(
  text: string,
  normalizedText: string,
  matchTerm: string,
  fromIndex: number,
) {
  const normalizedMatchTerm = matchTerm.toLocaleLowerCase('en-US')
  let start = normalizedText.indexOf(normalizedMatchTerm, fromIndex)

  while (start !== -1) {
    if (hasWholeTermBoundaries(text, start, matchTerm)) return start
    start = normalizedText.indexOf(normalizedMatchTerm, start + 1)
  }

  return -1
}

function preferredCandidate(
  current: MatchCandidate | null,
  candidate: MatchCandidate,
): MatchCandidate {
  if (!current) return candidate
  if (candidate.start !== current.start)
    return candidate.start < current.start ? candidate : current

  const candidateLength = candidate.end - candidate.start
  const currentLength = current.end - current.start
  if (candidateLength !== currentLength)
    return candidateLength > currentLength ? candidate : current
  if (candidate.contextIndex !== current.contextIndex) {
    return candidate.contextIndex < current.contextIndex ? candidate : current
  }
  return candidate.matchTermIndex < current.matchTermIndex ? candidate : current
}

/**
 * Splits stored text without paraphrasing it. Only supplied literal aliases are eligible, matching
 * without regard to letter case and never from inside a longer word. The first occurrence of each
 * context is annotated so repeated terminology does not turn a paragraph into a wall of controls.
 */
export function annotateMedicineText(
  text: string,
  contexts: readonly MedicineTextContextMatch[],
): AnnotatedMedicineTextPart[] {
  if (!text || contexts.length === 0) return text ? [text] : []

  const normalizedText = text.toLocaleLowerCase('en-US')
  const usedContextKeys = new Set<string>()
  const parts: AnnotatedMedicineTextPart[] = []
  let cursor = 0

  while (cursor < text.length) {
    let next: MatchCandidate | null = null

    for (const [contextIndex, { context, matchTerms }] of contexts.entries()) {
      if (usedContextKeys.has(context.key)) continue

      const terms = matchTerms ?? [context.technicalTerm]
      for (const [matchTermIndex, matchTerm] of terms.entries()) {
        if (!matchTerm) continue
        const start = findNextWholeTerm(text, normalizedText, matchTerm, cursor)
        if (start === -1) continue

        next = preferredCandidate(next, {
          context,
          contextIndex,
          end: start + matchTerm.length,
          matchTermIndex,
          start,
        })
      }
    }

    if (!next) {
      parts.push(text.slice(cursor))
      break
    }

    if (next.start > cursor) parts.push(text.slice(cursor, next.start))
    parts.push({
      context: next.context,
      key: `${next.context.key}-${next.start}`,
      text: text.slice(next.start, next.end),
    })
    usedContextKeys.add(next.context.key)
    cursor = next.end
  }

  return parts
}
