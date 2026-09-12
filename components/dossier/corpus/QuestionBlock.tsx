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
import type { ReactNode } from 'react'

import type { CorpusBlock, CorpusLadderRung, CorpusParagraph } from '@/lib/corpus/dossier-page'
import { VISIBLE_ROWS, type RevealedRow } from '@/lib/corpus/page-text'
import { EvidenceDisclosure } from './EvidenceDisclosure'
import { OrganismLadder } from './OrganismLadder'
import { ProvenanceAnchor } from './ProvenanceAnchor'

const LADDER_BLOCKS = new Set(['ladder', 'ladder-single', 'human-data-none'])

/** The words of one paragraph or list item: the text, its one bold span, and its citation. */
function ParagraphBody({ paragraph }: { paragraph: CorpusParagraph }) {
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
    <>
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
    </>
  )
}

/**
 * §16(1): the clauses of a block that enumerates, as a list.
 *
 * The supervision answer is one clause per class the suppression pass recorded — the therapeutic
 * class, the statute schedule, the boxed warning, the clinician-administered route — each with its
 * own evidence and its own source, in the order S1–S9. They are separate recorded facts, so the
 * page paints them as list items rather than running them together as a paragraph that develops,
 * and every one of them is painted: a record carrying four classes states all four.
 */
function ClauseList({ blockId, paragraphs }: { blockId: string; paragraphs: CorpusParagraph[] }) {
  return (
    <ul className="cd-clauses">
      {paragraphs.map((paragraph, index) => (
        <li className="cd-clause" key={`${blockId}-c${index}`}>
          <ParagraphBody paragraph={paragraph} />
        </li>
      ))}
    </ul>
  )
}

function Paragraph({ paragraph }: { paragraph: CorpusParagraph }) {
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
      <ParagraphBody paragraph={paragraph} />
    </p>
  )
}

/**
 * The block's body in painted order: a run of list items is one list, everything else a paragraph.
 *
 * The order is the builder's own, so a block that paints clauses and then this record's study
 * scope paints the list and then the paragraph, and the render writes the same lines in the same
 * order.
 */
function BlockProse({ blockId, paragraphs }: { blockId: string; paragraphs: CorpusParagraph[] }) {
  const parts: ReactNode[] = []
  let run: CorpusParagraph[] = []
  const flush = (at: number): void => {
    if (run.length === 0) return
    parts.push(
      <ClauseList blockId={`${blockId}-l${at}`} paragraphs={run} key={`${blockId}-l${at}`} />,
    )
    run = []
  }
  paragraphs.forEach((paragraph, index) => {
    if (paragraph.listItem) {
      run.push(paragraph)
      return
    }
    flush(index)
    parts.push(<Paragraph key={`${blockId}-p${index}`} paragraph={paragraph} />)
  })
  flush(paragraphs.length)
  return <>{parts}</>
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
  headingLevel = 'h2',
}: {
  block: CorpusBlock
  name: string
  ladder?: CorpusLadderRung[]
  /** Dossier v3 embeds these blocks under its own "Deep evidence" heading, one level down. */
  headingLevel?: 'h2' | 'h3'
}) {
  const Heading = headingLevel
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
        <Heading className="cd-question" id={`${block.id}-q`}>
          {block.question}
        </Heading>
        <hr className="cd-hairline" />
        <Facts blockId={block.id} rows={block.facts} />
        <BlockProse blockId={block.id} paragraphs={block.paragraphs} />
        {showLadder ? <OrganismLadder rungs={ladder} name={name} /> : null}
        <EvidenceDisclosure block={block} />
      </div>
    </section>
  )
}
