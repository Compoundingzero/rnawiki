import type { PlainLanguageSection, SummaryPart, TenSecondSummary } from './evidence-types'
import type { EvidenceRuleContext } from './evidence-rule-utils'
import {
  addFinding,
  duplicateValues,
  hasText,
  ref,
  sortedById,
  uniqueSorted,
  wordCount,
} from './evidence-rule-utils'

function fieldFor(section: PlainLanguageSection): string {
  return section.entity.field ?? 'text'
}

function sentenceTexts(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function paragraphTexts(text: string): string[] {
  return text
    .split(/\n\s*\n/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function acronymIsIntroduced(text: string, acronym: string, firstIndex: number): boolean {
  const escaped = acronym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const throughFirstUse = text.slice(0, firstIndex + acronym.length)
  const parenthetical = new RegExp(String.raw`(?:[A-Za-z][A-Za-z'-]*[ ,/-]+){1,8}\(${escaped}\)$`)
  const plainAlias = new RegExp(String.raw`(?:means|called|or)\s+${escaped}$`, 'i')
  return parenthetical.test(throughFirstUse) || plainAlias.test(throughFirstUse)
}

function summaryText(summary: TenSecondSummary): string {
  return [
    summary.plainMechanism.text,
    summary.bestSupportedFinding.text,
    summary.mainLimitation.text,
    summary.additionalFirstScreenText ?? '',
  ]
    .filter(Boolean)
    .join(' ')
}

function checkSummaryPart(
  ctx: EvidenceRuleContext,
  summary: TenSecondSummary,
  field: 'plainMechanism' | 'bestSupportedFinding' | 'mainLimitation',
  part: SummaryPart,
): void {
  if (!hasText(part.text)) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'G',
      code: 'G_TEN_SECOND_PART_MISSING',
      message: `10-second summary "${summary.id}" is missing ${field}.`,
      entity: ref('SUMMARY', summary.id, field),
      field,
      correctiveAction: 'Write the missing summary part from reviewed, programme-scoped evidence.',
    })
  }
  if (part.supportingClaimIds.length === 0) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'G',
      code: 'G_TEN_SECOND_PART_UNSUPPORTED',
      message: `10-second summary "${summary.id}" does not record which claim supports ${field}.`,
      entity: ref('SUMMARY', summary.id, `${field}.supportingClaimIds`),
      field: `${field}.supportingClaimIds`,
      correctiveAction: 'Link the exact claim revisions on which this summary part depends.',
    })
  }
  for (const claimId of uniqueSorted(part.supportingClaimIds)) {
    const claim = ctx.claims.get(claimId)
    if (!claim) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'G',
        code: 'G_TEN_SECOND_CLAIM_NOT_FOUND',
        message: `10-second summary "${summary.id}" links to missing claim "${claimId}".`,
        entity: ref('SUMMARY', summary.id, `${field}.supportingClaimIds`),
        field: `${field}.supportingClaimIds`,
        correctiveAction: 'Restore the claim revision or update the summary dependency.',
        claimId,
      })
    } else if (claim.programmeId !== summary.programmeId) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'G',
        code: 'G_TEN_SECOND_CLAIM_SCOPE_MISMATCH',
        message: `10-second summary "${summary.id}" uses claim "${claimId}" from another programme.`,
        entity: ref('SUMMARY', summary.id, `${field}.supportingClaimIds`),
        field: `${field}.supportingClaimIds`,
        correctiveAction: 'Use only claims from the selected programme.',
        claimId,
      })
    }
  }
}

export function runGroupGPlainLanguage(ctx: EvidenceRuleContext): void {
  for (const [field, value] of Object.entries({
    maxSentenceWords: ctx.policy.readability.maxSentenceWords,
    maxParagraphWords: ctx.policy.readability.maxParagraphWords,
    maxFirstScreenWords: ctx.policy.readability.maxFirstScreenWords,
  })) {
    if (!Number.isInteger(value) || value < 1) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'G',
        code: 'G_READABILITY_POLICY_INVALID',
        message: `Readability setting "${field}" must be a positive word count.`,
        entity: ref('ENGINE_INPUT', 'evidence', `policy.readability.${field}`),
        field: `policy.readability.${field}`,
        correctiveAction: 'Configure a positive whole-number limit for this readability check.',
      })
    }
  }

  for (const duplicate of duplicateValues(
    (ctx.input.tenSecondSummaries ?? []).map((summary) => summary.id),
  )) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'G',
      code: 'G_DUPLICATE_SUMMARY_ID',
      message: `More than one 10-second summary uses the identifier "${duplicate}".`,
      entity: ref('SUMMARY', duplicate, 'id'),
      field: 'id',
      correctiveAction: 'Assign each programme summary revision a unique identifier.',
    })
  }

  for (const summary of sortedById(ctx.input.tenSecondSummaries ?? [])) {
    if (!ctx.programmes.has(summary.programmeId)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'G',
        code: 'G_SUMMARY_PROGRAMME_NOT_FOUND',
        message: `10-second summary "${summary.id}" links to missing programme "${summary.programmeId}".`,
        entity: ref('SUMMARY', summary.id, 'programmeId'),
        field: 'programmeId',
        correctiveAction: 'Link the summary to the programme it describes.',
      })
    }

    checkSummaryPart(ctx, summary, 'plainMechanism', summary.plainMechanism)
    checkSummaryPart(ctx, summary, 'bestSupportedFinding', summary.bestSupportedFinding)
    checkSummaryPart(ctx, summary, 'mainLimitation', summary.mainLimitation)

    const text = summaryText(summary)
    const words = wordCount(text)
    if (words > ctx.policy.readability.maxFirstScreenWords) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'G',
        code: 'G_FIRST_SCREEN_WORD_LIMIT',
        message: `10-second summary "${summary.id}" contains ${words} words before expansion; policy allows ${ctx.policy.readability.maxFirstScreenWords}.`,
        entity: ref('SUMMARY', summary.id, 'text'),
        field: 'text',
        correctiveAction:
          'Shorten the first screen while preserving the mechanism, best-supported finding, and main limitation.',
      })
    }
    if (sentenceTexts(text).length > 2) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'G',
        code: 'G_TEN_SECOND_TOO_MANY_SENTENCES',
        message: `10-second summary "${summary.id}" uses more than two sentences.`,
        entity: ref('SUMMARY', summary.id, 'text'),
        field: 'text',
        correctiveAction:
          'Keep the main answer to one natural sentence or two very short sentences.',
      })
    }
  }

  for (const duplicate of duplicateValues(
    (ctx.input.plainLanguageSections ?? []).map((section) => section.id),
  )) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'G',
      code: 'G_DUPLICATE_PLAIN_SECTION_ID',
      message: `More than one plain-language section uses the identifier "${duplicate}".`,
      entity: ref('ENGINE_INPUT', duplicate, 'plainLanguageSections'),
      field: 'plainLanguageSections',
      correctiveAction: 'Assign each editable plain-language section a unique identifier.',
    })
  }

  const summarySections: PlainLanguageSection[] = (ctx.input.tenSecondSummaries ?? []).map(
    (summary) => ({
      id: `summary-readability:${summary.id}`,
      entity: ref('SUMMARY', summary.id, 'text'),
      kind: 'TEN_SECOND',
      text: summaryText(summary),
    }),
  )

  for (const section of sortedById([
    ...summarySections,
    ...(ctx.input.plainLanguageSections ?? []),
  ])) {
    const field = fieldFor(section)
    const sentences = sentenceTexts(section.text)
    const longSentence = sentences.find(
      (sentence) => wordCount(sentence) > ctx.policy.readability.maxSentenceWords,
    )
    if (longSentence) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'G',
        code: 'G_SENTENCE_TOO_LONG',
        message: `Plain-language section "${section.id}" has a ${wordCount(longSentence)}-word sentence; policy allows ${ctx.policy.readability.maxSentenceWords}.`,
        entity: section.entity,
        field,
        correctiveAction: 'Split the sentence without changing its medical meaning.',
      })
    }

    const longParagraph = paragraphTexts(section.text).find(
      (paragraph) => wordCount(paragraph) > ctx.policy.readability.maxParagraphWords,
    )
    if (longParagraph) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'G',
        code: 'G_PARAGRAPH_TOO_LONG',
        message: `Plain-language section "${section.id}" has a ${wordCount(longParagraph)}-word paragraph; policy allows ${ctx.policy.readability.maxParagraphWords}.`,
        entity: section.entity,
        field,
        correctiveAction: 'Break the paragraph into short, single-idea paragraphs.',
      })
    }

    const allowedAcronyms = new Set(
      [...ctx.policy.readability.allowedAcronyms, ...(section.definedTerms ?? [])].map((term) =>
        term.toLocaleUpperCase('en-US'),
      ),
    )
    const acronyms = [...section.text.matchAll(/\b[A-Z][A-Z0-9-]{1,6}\b/g)]
    const warnedAcronyms = new Set<string>()
    for (const match of acronyms) {
      const acronym = match[0]
      if (
        allowedAcronyms.has(acronym) ||
        warnedAcronyms.has(acronym) ||
        acronymIsIntroduced(section.text, acronym, match.index ?? 0)
      ) {
        continue
      }
      warnedAcronyms.add(acronym)
      addFinding(ctx, {
        level: 'WARNING',
        group: 'G',
        code: 'G_ACRONYM_NOT_INTRODUCED',
        message: `Plain-language section "${section.id}" uses ${acronym} before explaining it.`,
        entity: section.entity,
        field,
        correctiveAction: 'Write the full term before the acronym on first use.',
      })
    }

    const lower = section.text.toLocaleLowerCase('en-US')
    const definedTerms = new Set(
      (section.definedTerms ?? []).map((term) => term.trim().toLocaleLowerCase('en-US')),
    )
    const unexplainedTerm = ctx.policy.readability.complexTerms.find((term) => {
      const normalized = term.toLocaleLowerCase('en-US')
      if (!lower.includes(normalized) || definedTerms.has(normalized)) return false
      const definitionPattern = new RegExp(
        `${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(?:means|is)\\b`,
        'i',
      )
      return !definitionPattern.test(section.text)
    })
    if (unexplainedTerm) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'G',
        code: 'G_COMPLEX_TERM_UNEXPLAINED',
        message: `Plain-language section "${section.id}" uses "${unexplainedTerm}" without a plain explanation.`,
        entity: section.entity,
        field,
        correctiveAction: 'Explain the technical term at first use or use a more familiar phrase.',
      })
    }

    const absolutePhrase = ctx.policy.readability.absolutePhrases.find((phrase) =>
      lower.includes(phrase.toLocaleLowerCase('en-US')),
    )
    if (absolutePhrase) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'G',
        code: 'G_ABSOLUTE_MEDICAL_LANGUAGE',
        message: `Plain-language section "${section.id}" uses the absolute phrase "${absolutePhrase}".`,
        entity: section.entity,
        field,
        correctiveAction:
          'State the measured scope and uncertainty instead of making an absolute medical claim.',
      })
    }

    if (
      /\b(?:you|patients?)\s+should\b|\brecommended\s+(?:dose|dosage|usage)\b|\bstart\s+taking\b|\bstop\s+taking\b|\breplace\s+(?:your|the)\s+(?:medicine|medication|treatment)\b/i.test(
        section.text,
      )
    ) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'G',
        code: 'G_TREATMENT_RECOMMENDATION_LANGUAGE',
        message: `Plain-language section "${section.id}" reads like treatment advice.`,
        entity: section.entity,
        field,
        correctiveAction:
          'Describe what was studied or approved without instructing a reader to start, stop, dose, or replace treatment.',
      })
    }

    for (const numeric of section.numericStatements ?? []) {
      if (!hasText(numeric.comparator) || !hasText(numeric.timepoint)) {
        addFinding(ctx, {
          level: 'WARNING',
          group: 'G',
          code: 'G_NUMBER_CONTEXT_MISSING',
          message: `Number "${numeric.value}" in section "${section.id}" lacks a comparator or timepoint.`,
          entity: section.entity,
          field,
          correctiveAction: 'Add the comparison group and measurement timepoint from the source.',
        })
      }
    }

    if (
      /\bfailed\b/i.test(section.text) &&
      !/\b(?:trial|study|endpoint|programme|program|candidate|molecule|idea|recruitment|delivery|target|treatment|outcome)\b[^.!?]{0,40}\bfailed\b|\bfailed\b[^.!?]{0,40}\b(?:trial|study|endpoint|programme|program|candidate|molecule|idea|recruitment|delivery|target|treatment|outcome)\b/i.test(
        section.text,
      )
    ) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'G',
        code: 'G_FAILED_WITHOUT_SUBJECT',
        message: `Plain-language section "${section.id}" uses "failed" without saying what failed.`,
        entity: section.entity,
        field,
        correctiveAction:
          'Name the endpoint, study, programme, candidate, or biological idea that failed.',
      })
    }

    const workedSentence = sentences.find((sentence) => /\bworked\b/i.test(sentence))
    if (
      workedSentence &&
      !/\b(?:endpoint|outcome|result|biomarker|symptom|function|survival|response|measurement)\b/i.test(
        workedSentence,
      )
    ) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'G',
        code: 'G_WORKED_WITHOUT_OUTCOME',
        message: `Plain-language section "${section.id}" uses "worked" without identifying a measured outcome.`,
        entity: section.entity,
        field,
        correctiveAction: 'Name the outcome that changed and its measurement context.',
      })
    }
  }
}
