import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MedicineRecordContextSections } from '@/components/MedicineRecordContextSections'
import type { MedicineMolecularRecordView } from '@/lib/medicine-dossier-view-model'

;(globalThis as typeof globalThis & { React: typeof React }).React = React

function renderMolecular(molecular: MedicineMolecularRecordView): string {
  return renderToStaticMarkup(
    React.createElement(MedicineRecordContextSections, {
      bindingState: 'legacy_record',
      context: {
        conventionalAlternatives: [],
        commonQuestions: [],
        molecular,
        communityNotes: [],
      },
      contextItems: [],
    }),
  )
}

describe('medicine molecular sequence details', () => {
  it('explains nucleotide letters without calling them a protein chain', () => {
    const html = renderMolecular({
      structureCheck: 'passed',
      identifiers: [
        {
          label: 'Genetic instruction sequence (DNA letters, 5′ to 3′)',
          value: 'TCACTTTCATAATGCTGG',
          kind: 'nucleotide_sequence',
        },
      ],
    })

    expect(html).toContain('Genetic instruction sequence (DNA letters, 5′ to 3′)')
    expect(html).toContain('A, C, G and T are DNA building blocks; RNA uses U instead of T.')
    expect(html).toContain('not a protein chain')
    expect(html).toContain('TCACTTTCATAATGCTGG')
    expect(html).toContain('break-all')
  })

  it('explains peptide letters, residue abbreviations, chains, and modification notes', () => {
    const html = renderMolecular({
      structureCheck: 'not_passed',
      identifiers: [
        {
          label: 'Protein or peptide building-block sequence',
          value: 'Chain A: Ala-Gly-Ser; C-terminal amide',
          kind: 'peptide_sequence',
        },
      ],
    })

    expect(html).toContain('Protein or peptide building-block sequence')
    expect(html).toContain('Letters or abbreviations describe amino-acid building blocks')
    expect(html).toContain('Extra marks can show separate chains or chemical changes.')
    expect(html).toContain('Chain A: Ala-Gly-Ser; C-terminal amide')
  })
})
