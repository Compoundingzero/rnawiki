/**
 * One question block (dossier template, "Question block anatomy"; B1-B6, B9-B11).
 *
 * Badge, serif question, a 1 px hairline the width of the measure, exactly the paragraphs the
 * builder wrote, then the revealed layer. The badge is 22 px and sticky for the life of its block
 * (B3) at the reading widths, and leaves the margin below 480 px so the text keeps the measure.
 *
 * Nothing in here writes a sentence: the paragraphs arrive from `buildBlockBody`, the one bold span
 * covers a value the question itself carries (B6), and a second paragraph that states no sourced
 * value is marked as interpretation instead of being given a manufactured citation (B5).
 */
import type { CorpusBlock, CorpusLadderRung, CorpusParagraph } from '@/lib/corpus/dossier-page'
import { EvidenceDisclosure } from './EvidenceDisclosure'
import { OrganismLadder } from './OrganismLadder'
import { ProvenanceAnchor } from './ProvenanceAnchor'

const LADDER_BLOCKS = new Set(['ladder', 'ladder-single', 'human-data-none'])

function Paragraph({ paragraph }: { paragraph: CorpusParagraph }) {
  const { text, emphasis } = paragraph
  const body = emphasis ? (
    <>
      {text.slice(0, emphasis.start)}
      <strong>{text.slice(emphasis.start, emphasis.end)}</strong>
      {text.slice(emphasis.end)}
    </>
  ) : (
    text
  )
  return (
    <p className="cd-paragraph" data-anchored={paragraph.anchor ? 'true' : 'false'}>
      {paragraph.interpretation ? <span className="cd-interpretation">Interpretation</span> : null}
      {body}
      {paragraph.anchor ? (
        <>
          {' '}
          <ProvenanceAnchor anchor={paragraph.anchor} />
        </>
      ) : null}
    </p>
  )
}

export function QuestionBlock({
  block,
  name,
  ladder,
}: {
  block: CorpusBlock
  name: string
  ladder?: CorpusLadderRung[]
}) {
  const supervision = block.block === 'supervision'
  const showLadder = ladder !== undefined && LADDER_BLOCKS.has(block.block)
  return (
    <section
      id={block.id}
      className={supervision ? 'cd-block cd-supervision' : 'cd-block'}
      data-corpus-block={block.id}
      data-block={block.block}
      aria-labelledby={`${block.id}-q`}
    >
      <div className="cd-badge-cell">
        <span className="cd-badge" aria-hidden="true">
          {block.badge}
        </span>
      </div>
      <div className="cd-block-body">
        <h2 className="cd-question" id={`${block.id}-q`}>
          {block.question}
        </h2>
        <hr className="cd-hairline" />
        {block.paragraphs.map((paragraph, index) => (
          <Paragraph key={`${block.id}-p${index}`} paragraph={paragraph} />
        ))}
        {showLadder ? <OrganismLadder rungs={ladder} name={name} /> : null}
        <EvidenceDisclosure block={block} />
      </div>
    </section>
  )
}
