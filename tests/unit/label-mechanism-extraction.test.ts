import { describe, expect, it } from 'vitest'

import { extractBackgroundFromLabel, type LabelArtifact } from '@/lib/background/label-extraction'

/**
 * Reading a mechanism out of a label that never prints the words "Mechanism of Action".
 *
 * Most older and generic labels describe how a substance acts in the opening prose of Clinical
 * Pharmacology, under no heading. The extractor used to require the heading and read those as an
 * absence, which left 1,475 approved medicines with no mechanism text while their labels carried
 * one.
 *
 * The risk in widening it is the opposite error, and it is the worse one: storing a true sentence
 * under a false heading. The first draft of the selector kept three sentences from minoxidil's
 * label — one of them advice about managing adverse effects — because each contained a word like
 * "agonist" while being about something else. Every case below is one of the two failures.
 */
const base = {
  setId: 'test-set-id',
  declaredSubstanceCount: 1,
  brandNames: [],
  routes: [],
  sections: {},
} satisfies Omit<LabelArtifact, 'genericNames'> & { genericNames?: string[] }

function mechanismOf(sections: Record<string, string>, generic = 'OFLOXACIN'): string[] {
  const artifact: LabelArtifact = { ...base, genericNames: [generic], sections }
  const { background } = extractBackgroundFromLabel({
    artifact,
    options: { retrievedAt: '2026-09-12', sourceLabel: `${generic} label` },
  })
  const mechanism = (background as unknown as Record<string, unknown> | null)?.['mechanism'] as
    { statements?: Array<{ textAsRecorded: string }> } | undefined
  return (mechanism?.statements ?? []).map((statement) => statement.textAsRecorded)
}

describe('mechanism from unheaded clinical pharmacology prose', () => {
  it('reads a mechanism sentence that names the substance and states an action', () => {
    const statements = mechanismOf({
      clinical_pharmacology:
        'Ofloxacin exerts its antibacterial activity by inhibiting DNA gyrase, a bacterial topoisomerase. It is active against a broad range of organisms.',
    })
    expect(statements).toContain(
      'Ofloxacin exerts its antibacterial activity by inhibiting DNA gyrase, a bacterial topoisomerase.',
    )
  })

  it('stores the sentence exactly as printed, and proves it with the excerpt', () => {
    const printed =
      'Lovastatin is a specific inhibitor of HMG-CoA reductase, the enzyme which catalyzes the conversion of HMG-CoA to mevalonate.'
    const artifact: LabelArtifact = {
      ...base,
      genericNames: ['LOVASTATIN'],
      sections: {
        clinical_pharmacology: `${printed} Further text follows here to pad the section.`,
      },
    }
    const { background } = extractBackgroundFromLabel({
      artifact,
      options: { retrievedAt: '2026-09-12', sourceLabel: 'Lovastatin label' },
    })
    const statements = (background as unknown as Record<string, unknown>)['mechanism'] as {
      statements: Array<{ textAsRecorded: string; source: { excerpt?: string } }>
    }
    expect(statements.statements[0]?.textAsRecorded).toBe(printed)
    // The excerpt is the statement, so the record and the quote can never drift apart.
    expect(statements.statements[0]?.source.excerpt).toBe(printed)
  })

  it('refuses a sentence about managing adverse effects, even when it names a drug class', () => {
    const statements = mechanismOf(
      {
        clinical_pharmacology:
          'These adverse effects can usually be minimized by concomitant administration of a diuretic and a beta-adrenergic blocking agent or other sympathetic nervous system suppressant.',
      },
      'MINOXIDIL',
    )
    expect(statements).toEqual([])
  })

  it('refuses a sentence about another drug the label compares itself to', () => {
    const statements = mechanismOf(
      {
        clinical_pharmacology:
          'They are similar to lesions produced by other peripheral arterial dilators and by beta-adrenergic receptor agonists such as isoproterenol, epinephrine, and albuterol.',
      },
      'MINOXIDIL',
    )
    expect(statements).toEqual([])
  })

  it('refuses a pharmacokinetic sentence, which belongs to a different module', () => {
    const statements = mechanismOf(
      {
        clinical_pharmacology:
          'Minoxidil does not bind to plasma proteins, and does not cross the blood brain barrier.',
      },
      'MINOXIDIL',
    )
    expect(statements).toEqual([])
  })

  it('still prefers a dedicated section when the label has one', () => {
    const statements = mechanismOf({
      mechanism_of_action:
        'Ofloxacin is a fluoroquinolone antibacterial that inhibits bacterial DNA gyrase and topoisomerase IV.',
      clinical_pharmacology: 'Ofloxacin is absorbed rapidly and reaches peak levels in one hour.',
    })
    expect(statements.join(' ')).toContain('inhibits bacterial DNA gyrase')
    expect(statements.join(' ')).not.toContain('absorbed rapidly')
  })

  it('still prefers a heading inside clinical pharmacology over loose prose', () => {
    const statements = mechanismOf({
      clinical_pharmacology:
        'Ofloxacin is distributed widely into body tissues. Mechanism of Action: Ofloxacin inhibits DNA gyrase, which is required for bacterial DNA replication and repair.',
    })
    expect(statements.join(' ')).toContain('inhibits DNA gyrase')
  })

  it('records nothing where the label carries no mechanism prose at all', () => {
    expect(
      mechanismOf({
        clinical_pharmacology:
          'Peak serum concentrations are reached within two hours and the half-life is four hours in healthy adults.',
      }),
    ).toEqual([])
  })
})
