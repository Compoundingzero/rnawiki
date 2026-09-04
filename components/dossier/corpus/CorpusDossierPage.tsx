/**
 * A corpus dossier, whole (docs/specs/dossier-template.md).
 *
 * Header band, then a flat run of numbered question blocks in the order the derivation rules fix,
 * then the record: identifiers, relations, sources. No section headings between blocks, no lede
 * before the first question, and nothing rendered for data the record does not hold.
 *
 * Every component here is a server component. The only client code on the page is the rail marker,
 * which takes no props, so the RSC payload carries the page's HTML and no second copy of its data.
 */
import '@/lib/corpus/tokens.css'
import '@/lib/corpus/dossier.css'

import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import { ContentsRail } from './ContentsRail'
import { ContentsRailMarker } from './ContentsRailMarker'
import { CorpusHeader } from './CorpusHeader'
import { ExactRecord } from './ExactRecord'
import { QuestionBlock } from './QuestionBlock'
import { RelationsRows } from './RelationsRows'
import { SourceList } from './SourceList'
import { StubRecord } from './StubRecord'
import { SupervisionBlock } from './SupervisionBlock'
import { WithdrawnArc } from './WithdrawnArc'

const LADDER_BLOCKS = new Set(['ladder', 'ladder-single', 'human-data-none'])

/** The one ornament on the surface, between major regions and never between blocks. */
function RegionGlyph() {
  return (
    <p className="cd-glyph" aria-hidden="true">
      ~
    </p>
  )
}

export function CorpusDossierPage({ dossier }: { dossier: CorpusDossier }) {
  const stub = dossier.pageType === 'stub' || dossier.blocks.length === 0

  return (
    <div className="cd-root">
      <CorpusHeader dossier={dossier} />

      <div className="cd-layout">
        <div className="cd-column">
          {stub ? null : <ContentsRail blocks={dossier.blocks} variant="inline" />}
          {stub ? null : <RegionGlyph />}

          <WithdrawnArc rows={dossier.arc} />

          {stub ? (
            <StubRecord dossier={dossier} />
          ) : (
            dossier.blocks.map((block) =>
              block.block === 'supervision' ? (
                <SupervisionBlock block={block} key={block.id} name={dossier.displayName} />
              ) : (
                <QuestionBlock
                  block={block}
                  key={block.id}
                  name={dossier.displayName}
                  {...(LADDER_BLOCKS.has(block.block) ? { ladder: dossier.ladder } : {})}
                />
              ),
            )
          )}

          {stub ? null : (
            <>
              <RegionGlyph />
              <ExactRecord identifiers={dossier.identifiers} />
              <RelationsRows relations={dossier.relations} />
            </>
          )}

          <SourceList sources={dossier.sources} licenceNotes={dossier.licenceNotes} />
        </div>

        {stub ? null : <ContentsRail blocks={dossier.blocks} variant="rail" />}
      </div>

      <ContentsRailMarker />
    </div>
  )
}
