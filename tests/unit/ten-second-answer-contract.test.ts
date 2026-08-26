import { describe, expect, it } from 'vitest'

import { legacyMedicineDossierView } from '@/lib/medicine-dossier-view-model'
import { legacyTenSecondAnswerFingerprint } from '@/lib/legacy-ten-second-provenance'
import { SEED_DOSSIERS } from '@/scripts/seed-data'
import productionInclisiranSurface from '@/tests/fixtures/public-production-inclisiran-v2-surface.json'
import {
  TEN_SECOND_FIELD_WORD_LIMITS,
  TEN_SECOND_FORBIDDEN_FIRST_READ,
  TEN_SECOND_NORMAL_FIELDS_WORD_LIMIT,
  tenSecondWordCount,
  type TenSecondAnswerCopy,
} from '@/lib/ten-second-answer-contract'
import {
  TEN_SECOND_ANSWER_OVERRIDES,
  tenSecondAnswerOverride,
} from '@/lib/ten-second-answer-overrides'
import { TEN_SECOND_ANSWER_OVERRIDES_A } from '@/lib/ten-second-answer-overrides-a'
import { TEN_SECOND_ANSWER_OVERRIDES_B } from '@/lib/ten-second-answer-overrides-b'
import {
  LEGACY_TEN_SECOND_APPROVED_FINGERPRINTS,
  LEGACY_TEN_SECOND_APPROVED_PRODUCTION_FINGERPRINTS,
} from '@/lib/ten-second-answer-evidence-fingerprints'
import type { SeedDossier } from '@/lib/seed-types'
import type { DrugDossier } from '@/lib/types'

const INTERNAL_OR_PLACEHOLDER_COPY =
  /\b(?:legacy|older (?:medicine|record)|plain-language version is not available|programme|recorded|the study, the study)\b/iu

function runtimeSeedDossier(seed: SeedDossier): DrugDossier {
  return {
    ...seed,
    id: seed.slug,
    molecularSchema: undefined,
    dossierDepth: 'flagship',
    sourceProvenance: seed.sources.map((source) =>
      `${source.label} (${source.identifier})`.slice(0, 300),
    ),
    auditPointsCount: {
      measured: seed.keyAudits.filter((audit) => audit.category === 'measured').length,
      inferred: seed.keyAudits.filter((audit) => audit.category === 'inferred').length,
      failed: seed.keyAudits.filter((audit) => audit.category === 'failed').length,
      conclusionShift: seed.keyAudits.filter((audit) => audit.category === 'conclusion_shift')
        .length,
    },
  }
}

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

  it('binds every authored answer and its evidence to exactly one approved fingerprint', () => {
    const stale: string[] = []
    const fingerprints = new Set<string>()

    for (const seed of SEED_DOSSIERS) {
      const copy = TEN_SECOND_ANSWER_OVERRIDES[seed.slug]
      expect(copy, seed.slug).toBeDefined()
      const fingerprint = legacyTenSecondAnswerFingerprint(runtimeSeedDossier(seed), copy!)
      fingerprints.add(fingerprint)
      if (!LEGACY_TEN_SECOND_APPROVED_FINGERPRINTS.has(fingerprint)) stale.push(seed.slug)
    }

    expect(stale).toEqual([])
    expect(fingerprints.size).toBe(SEED_DOSSIERS.length)
    expect(LEGACY_TEN_SECOND_APPROVED_FINGERPRINTS.size).toBe(
      SEED_DOSSIERS.length + Object.keys(LEGACY_TEN_SECOND_APPROVED_PRODUCTION_FINGERPRINTS).length,
    )
    expect(
      Object.values(TEN_SECOND_ANSWER_OVERRIDES).filter((answer) => answer.criticalSafety),
    ).toHaveLength(153)
  })

  it('keeps the reviewed production Inclisiran snapshot bound to its exact approved purpose', () => {
    const productionRecord = productionInclisiranSurface as DrugDossier
    const approvedCopy = TEN_SECOND_ANSWER_OVERRIDES.inclisiran
    expect(approvedCopy).toBeDefined()
    expect(legacyTenSecondAnswerFingerprint(productionRecord, approvedCopy!)).toBe(
      LEGACY_TEN_SECOND_APPROVED_PRODUCTION_FINGERPRINTS.inclisiran,
    )
    expect(LEGACY_TEN_SECOND_APPROVED_PRODUCTION_FINGERPRINTS).toEqual({
      inclisiran: 'sha256:84fca31e4c9b10b1e1c6a62374e1c21e39ef6f4a638d3ae1880668b4a2e24e76',
    })
    expect(
      LEGACY_TEN_SECOND_APPROVED_FINGERPRINTS.has(
        LEGACY_TEN_SECOND_APPROVED_PRODUCTION_FINGERPRINTS.inclisiran,
      ),
    ).toBe(true)
    expect(tenSecondAnswerOverride(productionRecord)).toMatchObject({
      evidenceBinding: {
        kind: 'legacy_answer_and_evidence_fingerprint',
        version: 'legacy-ten-second-answer/v2',
        fingerprint: LEGACY_TEN_SECOND_APPROVED_PRODUCTION_FINGERPRINTS.inclisiran,
      },
      copy: {
        usedFor: 'Used with diet and exercise to lower LDL, often called “bad” cholesterol.',
      },
    })
    expect(approvedCopy).toMatchObject({
      usedFor: 'Used with diet and exercise to lower LDL, often called “bad” cholesterol.',
      biggestLimit:
        'Completed studies have not yet shown whether inclisiran prevents heart attacks or strokes.',
    })
    expect(legacyMedicineDossierView(productionRecord).readerSummary).toMatchObject({
      basis: 'older_record',
      usedFor: 'Used with diet and exercise to lower LDL, often called “bad” cholesterol.',
      authoredEvidenceBinding: {
        fingerprint: LEGACY_TEN_SECOND_APPROVED_PRODUCTION_FINGERPRINTS.inclisiran,
      },
    })

    expect(
      tenSecondAnswerOverride({
        ...productionRecord,
        patientFriendlyIndication: 'A different use and population',
      }),
    ).toBeUndefined()
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
      const rendered = legacyMedicineDossierView(runtimeSeedDossier(dossier)).readerSummary

      expect(rendered.usedFor, dossier.slug).toBe(authored?.usedFor)
      expect(rendered.whatStudiesFound, dossier.slug).toBe(authored?.whatStudiesFound)
      expect(rendered.biggestLimit, dossier.slug).toBe(authored?.biggestLimit)
      expect(rendered.practicalNote, dossier.slug).toBe(authored?.practicalNote)
      expect(rendered.criticalSafety, dossier.slug).toBe(authored?.criticalSafety)
      expect(rendered.authoredEvidenceBinding, dossier.slug).toMatchObject({
        kind: 'legacy_answer_and_evidence_fingerprint',
        version: 'legacy-ten-second-answer/v2',
      })
    }
  })

  it('fails closed when evidence or its stored source list changes or becomes empty', () => {
    const seed = SEED_DOSSIERS.find((candidate) => candidate.slug === 'xylazine')
    expect(seed).toBeDefined()
    const current = runtimeSeedDossier(seed!)
    const authored = TEN_SECOND_ANSWER_OVERRIDES.xylazine
    expect(authored?.criticalSafety).toBeTruthy()
    expect(tenSecondAnswerOverride(current)).toBeDefined()
    expect(tenSecondAnswerOverride({ ...current, id: 'fentanyl' })).toBeUndefined()
    // @ts-expect-error A slug alone is deliberately no longer a valid provenance contract.
    expect(tenSecondAnswerOverride('xylazine')).toBeUndefined()

    const changedRecords: DrugDossier[] = [
      { ...current, keyAudits: [] },
      { ...current, trials: [] },
      { ...current, sourceProvenance: [] },
      {
        ...current,
        oneSentenceVerdict: '',
        keyAudits: [],
        trials: [],
        mechanismSteps: [],
        sourceProvenance: [],
      },
    ]

    for (const changed of changedRecords) {
      const summary = legacyMedicineDossierView(changed).readerSummary
      expect(summary.authoredEvidenceBinding).toBeUndefined()
      expect(summary.criticalSafety).toBeUndefined()
      expect(summary.whatStudiesFound).not.toBe(authored?.whatStudiesFound)
    }
  })

  it('fails closed when any authored wording changes, including an urgent safety warning', () => {
    const seed = SEED_DOSSIERS.find((candidate) => candidate.slug === 'xylazine')
    expect(seed).toBeDefined()
    const current = runtimeSeedDossier(seed!)
    const original = TEN_SECOND_ANSWER_OVERRIDES.xylazine
    expect(original?.criticalSafety).toBeTruthy()

    const mutableOverrides = TEN_SECOND_ANSWER_OVERRIDES as Record<string, TenSecondAnswerCopy>
    const changedCopies: TenSecondAnswerCopy[] = [
      { ...original!, whatStudiesFound: `${original!.whatStudiesFound} ` },
      { ...original!, criticalSafety: `${original!.criticalSafety} Altered.` },
    ]

    for (const changed of changedCopies) {
      mutableOverrides.xylazine = changed
      try {
        expect(
          LEGACY_TEN_SECOND_APPROVED_FINGERPRINTS.has(
            legacyTenSecondAnswerFingerprint(current, changed),
          ),
        ).toBe(false)
        expect(tenSecondAnswerOverride(current)).toBeUndefined()

        const summary = legacyMedicineDossierView(current).readerSummary
        expect(summary.authoredEvidenceBinding).toBeUndefined()
        expect(summary.criticalSafety).toBeUndefined()
      } finally {
        mutableOverrides.xylazine = original!
      }
    }

    expect(tenSecondAnswerOverride(current)?.copy).toBe(original)
  })

  it('does not invalidate reviewed copy for mutable counters or community activity', () => {
    const seed = SEED_DOSSIERS.find((candidate) => candidate.slug === 'xylazine')
    expect(seed).toBeDefined()
    const changedOnlyOperationally: DrugDossier = {
      ...runtimeSeedDossier(seed!),
      viewCount: 999_999,
      revisionCount: 42,
      lastEditedAt: '2099-01-01T00:00:00.000Z',
      lastEditedBy: 'another-contributor',
      communityNotes: [
        {
          id: 'new-note',
          author: 'Reader',
          role: 'Community member',
          date: '2099-01-01T00:00:00.000Z',
          content: 'A new community note.',
          upvotes: 500,
        },
      ],
    }

    const rendered = legacyMedicineDossierView(changedOnlyOperationally).readerSummary
    expect(rendered.criticalSafety).toBe(TEN_SECOND_ANSWER_OVERRIDES.xylazine?.criticalSafety)
    expect(rendered.authoredEvidenceBinding).toBeDefined()
  })
})
