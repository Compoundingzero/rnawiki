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
import { VISIBLE_ROWS, type RevealedRow } from '@/lib/corpus/page-text'
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
    /*
      §12: "No regulator classification is recorded for X" is an absence statement in fixed words.
      It is furniture wherever it renders, the question block included, so it carries the same
      `data-furniture` marker the register absence table and the patent no-record line carry. The
      reader still meets it; the ruler, the rendered duplicate check and the slop draw's template
      test all skip it.
    */
    <p
      className="cd-paragraph"
      {...(paragraph.anchor ? { 'data-anchored': 'true' } : {})}
      {...(paragraph.furniture ? { 'data-furniture': 'true' } : {})}
    >
      {/*
        §15(8): a text node between the label and what it labels. The mark and the sentence are two
        inline spans, and every text extraction — this site's ruler, its duplicate check and a
        crawler's — read them as one word: "INTERPRETATIONno human trial recorded".
      */}
      {paragraph.interpretation ? (
        <>
          <span className="cd-interpretation">Interpretation</span>{' '}
        </>
      ) : null}
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

/**
 * The block's own values, painted under the question and above the prose (§13 item 7).
 *
 * "25 of 29 completed trials posted no result: NCT…" and "First publication 2013, last 2013" are
 * data, and a sentence built around one value is a frame. These are the same values as labelled
 * rows: visible without opening anything, and markup rather than prose, so the template test does
 * not apply to them.
 */
function FactRows({ blockId, rows, from }: { blockId: string; rows: RevealedRow[]; from: number }) {
  return (
    <dl className="cd-facts">
      {rows.map((row, index) => (
        <div className="cd-fact" key={`${blockId}-f${from + index}`}>
          <dt>{row.label}</dt>
          {/*
            §14(6): a fact is a label and a value. A dataset record id is technical provenance and
            is painted only inside a closed disclosure, so `buildBlockBody` strips an identifier
            from a fact before it ever reaches here.
          */}
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Facts({ blockId, rows }: { blockId: string; rows: RevealedRow[] }) {
  if (rows.length === 0) return null
  /*
   * §14(9): six rows on the page, the counted rest inside a control. The endpoint list under the
   * largest-trial question painted fourteen, and a list that long stops being a list a reader
   * reads. The number is `VISIBLE_ROWS`, which the corpus renderer's grouping uses for every other
   * list on the page.
   */
  const visible = rows.slice(0, VISIBLE_ROWS)
  const rest = rows.slice(VISIBLE_ROWS)
  return (
    <>
      <FactRows blockId={blockId} from={0} rows={visible} />
      {rest.length > 0 ? (
        <details className="cd-evidence cd-further-rows" id={`${blockId}-more-facts`}>
          <summary>
            {rest.length} more recorded {rest.length === 1 ? 'row' : 'rows'}
          </summary>
          <FactRows blockId={blockId} from={VISIBLE_ROWS} rows={rest} />
        </details>
      ) : null}
    </>
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
        <Facts blockId={block.id} rows={block.facts} />
        {block.paragraphs.map((paragraph, index) => (
          <Paragraph key={`${block.id}-p${index}`} paragraph={paragraph} />
        ))}
        {showLadder ? <OrganismLadder rungs={ladder} name={name} /> : null}
        <EvidenceDisclosure block={block} />
      </div>
    </section>
  )
}
