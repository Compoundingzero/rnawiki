import { describe, expect, it } from 'vitest'

import { legacyMedicineDossierView } from '@/lib/medicine-dossier-view-model'
import { SEED_DOSSIERS } from '@/scripts/seed-data'
import {
  TEN_SECOND_FIELD_WORD_LIMITS,
  TEN_SECOND_FORBIDDEN_FIRST_READ,
  TEN_SECOND_NORMAL_FIELDS_WORD_LIMIT,
  tenSecondWordCount,
} from '@/lib/ten-second-answer-contract'
import { TEN_SECOND_ANSWER_OVERRIDES } from '@/lib/ten-second-answer-overrides'
import { TEN_SECOND_ANSWER_OVERRIDES_A } from '@/lib/ten-second-answer-overrides-a'
import { TEN_SECOND_ANSWER_OVERRIDES_B } from '@/lib/ten-second-answer-overrides-b'

const INTERNAL_OR_PLACEHOLDER_COPY =
  /\b(?:legacy|older (?:medicine|record)|plain-language version is not available|programme|recorded|the study, the study)\b/iu

describe('curated 10-second answer contract', () => {
  it('has exactly one authored answer for every unique curated seed dossier', () => {
    const seedSlugs = new Set(SEED_DOSSIERS.map((dossier) => dossier.slug))
    const authoredSlugs = new Set(Object.keys(TEN_SECOND_ANSWER_OVERRIDES))
    const overlap = Object.keys(TEN_SECOND_ANSWER_OVERRIDES_A).filter((slug) =>
      Object.hasOwn(TEN_SECOND_ANSWER_OVERRIDES_B, slug),
    )

    expect(overlap).toEqual([])
    expect([...authoredSlugs].filter((slug) => !seedSlugs.has(slug))).toEqual([])
    expect([...seedSlugs].filter((slug) => !authoredSlugs.has(slug))).toEqual([])
  })

  it('keeps every authored field short, static, and free of first-screen research jargon', () => {
    const defects: string[] = []
    const seedBySlug = new Map(SEED_DOSSIERS.map((dossier) => [dossier.slug, dossier]))

    for (const [slug, answer] of Object.entries(TEN_SECOND_ANSWER_OVERRIDES)) {
      if (!answer.usedFor?.trim()) defects.push(`${slug}: missing usedFor`)
      if (!answer.whatStudiesFound?.trim()) defects.push(`${slug}: missing whatStudiesFound`)

      for (const [field, value] of Object.entries(answer)) {
        if (!value?.trim()) {
          defects.push(`${slug}.${field}: empty`)
          continue
        }

        const limit = TEN_SECOND_FIELD_WORD_LIMITS[field as keyof typeof answer]
        const wordCount = tenSecondWordCount(value)
        if (limit && wordCount > limit) {
          defects.push(`${slug}.${field}: ${wordCount} words (limit ${limit})`)
        }
        if (TEN_SECOND_FORBIDDEN_FIRST_READ.test(value)) {
          defects.push(`${slug}.${field}: unexplained specialist term`)
        }
        if (INTERNAL_OR_PLACEHOLDER_COPY.test(value)) {
          defects.push(`${slug}.${field}: internal or placeholder wording`)
        }
        const storedStudyNames = (seedBySlug.get(slug)?.trials ?? []).flatMap((study) => {
          const name = study.trialId.match(/^(.+?)\s*\(/u)?.[1]?.trim()
          return name &&
            /^[A-Z0-9][A-Z0-9 ._\-]{2,}$/u.test(name) &&
            !/^(?:COVID-19|HIV-1|RSV)$/u.test(name)
            ? [name]
            : []
        })
        if (/\bNCT\d{8}\b/iu.test(value) || storedStudyNames.some((name) => value.includes(name))) {
          defects.push(`${slug}.${field}: study identifier`)
        }
        if (/[;—]/u.test(value)) {
          defects.push(`${slug}.${field}: stacked clauses`)
        }
      }

      const visibleFieldCount = Object.values(answer).filter(Boolean).length
      if (visibleFieldCount > 4) defects.push(`${slug}: ${visibleFieldCount} visible fields`)
      const normalWordCount = tenSecondWordCount(
        [answer.usedFor, answer.whatStudiesFound, answer.biggestLimit, answer.practicalNote]
          .filter(Boolean)
          .join(' '),
      )
      if (normalWordCount > TEN_SECOND_NORMAL_FIELDS_WORD_LIMIT) {
        defects.push(`${slug}: ${normalWordCount} first-read words`)
      }
    }

    expect(defects).toEqual([])
  })

  it('preserves the population, treatment arm, and denominator behind headline results', () => {
    expect(TEN_SECOND_ANSWER_OVERRIDES_A.casimersen.whatStudiesFound).toBe(
      'In 27 boys, the missing muscle protein rose from 0.93% to 1.74% of the normal level.',
    )
    expect(TEN_SECOND_ANSWER_OVERRIDES_A.retatrutide.whatStudiesFound).toContain(
      'In a 338-person study, the highest-dose group',
    )
    expect(TEN_SECOND_ANSWER_OVERRIDES_A.survodutide.whatStudiesFound).toContain(
      'In a 387-person study, the highest-dose group',
    )
    expect(TEN_SECOND_ANSWER_OVERRIDES_A.nivolumab.whatStudiesFound).toContain(
      'In untreated advanced melanoma',
    )
    expect(TEN_SECOND_ANSWER_OVERRIDES_A.trastuzumab.whatStudiesFound).toContain(
      'In 469 women with advanced breast cancer',
    )
    expect(TEN_SECOND_ANSWER_OVERRIDES_A.bevacizumab.whatStudiesFound).toContain(
      'In 813 people with untreated advanced bowel cancer',
    )
    expect(TEN_SECOND_ANSWER_OVERRIDES_A.adalimumab.whatStudiesFound).toContain(
      'In rheumatoid arthritis still active despite standard treatment',
    )
  })

  it('keeps each headline connected to the use being described', () => {
    expect(TEN_SECOND_ANSWER_OVERRIDES_A.nortriptyline.usedFor).toContain('stopping smoking')
    expect(TEN_SECOND_ANSWER_OVERRIDES_A.metoclopramide.whatStudiesFound).toContain(
      'For diabetic slow stomach emptying',
    )
    expect(TEN_SECOND_ANSWER_OVERRIDES_A.metoclopramide.biggestLimit).toContain(
      'For unexplained nausea in emergency care',
    )
  })

  it('keeps emergency instructions and uncertain comparisons accurate', () => {
    expect(TEN_SECOND_ANSWER_OVERRIDES_B.xylazine!.criticalSafety).toContain(
      'but still give it because fentanyl is almost always present',
    )
    expect(TEN_SECOND_ANSWER_OVERRIDES_B.fentanyl!.criticalSafety).toMatch(
      /^Give naloxone for suspected fentanyl overdose\./u,
    )
    expect(TEN_SECOND_ANSWER_OVERRIDES_B.tadalafil!.whatStudiesFound).toContain('dummy pill')
    expect(TEN_SECOND_ANSWER_OVERRIDES_B['lithium-carbonate']!.whatStudiesFound).toContain(
      'found no reduction in suicide-related events versus a dummy pill',
    )
    expect(TEN_SECOND_ANSWER_OVERRIDES_A.rosiglitazone.whatStudiesFound).toContain(
      'the size of that rise was uncertain',
    )
  })

  it('renders the authored fields instead of re-synthesizing curated legacy headlines', () => {
    for (const dossier of SEED_DOSSIERS) {
      const authored = TEN_SECOND_ANSWER_OVERRIDES[dossier.slug]
      const rendered = legacyMedicineDossierView({
        ...dossier,
        id: dossier.slug,
        molecularSchema: undefined,
        auditPointsCount: {
          measured: dossier.keyAudits.filter((audit) => audit.category === 'measured').length,
          inferred: dossier.keyAudits.filter((audit) => audit.category === 'inferred').length,
          failed: dossier.keyAudits.filter((audit) => audit.category === 'failed').length,
          conclusionShift: dossier.keyAudits.filter(
            (audit) => audit.category === 'conclusion_shift',
          ).length,
        },
      }).readerSummary

      expect(rendered.usedFor, dossier.slug).toBe(authored?.usedFor)
      expect(rendered.whatStudiesFound, dossier.slug).toBe(authored?.whatStudiesFound)
      expect(rendered.biggestLimit, dossier.slug).toBe(authored?.biggestLimit)
      expect(rendered.practicalNote, dossier.slug).toBe(authored?.practicalNote)
      expect(rendered.criticalSafety, dossier.slug).toBe(authored?.criticalSafety)
    }
  })
})
