/**
 * A corpus dossier, whole (docs/specs/dossier-template.md).
 *
 * Header band, then the Phase 4 blocks and the numbered question blocks in the order
 * `docs/specs/phase4-generators.md` §1 fixes, then the record: identifiers, relations, sources.
 * Nothing is rendered for data the record does not hold, and a block never puts a heading over an
 * empty body.
 *
 * The order, and why it is that order. The supervision statement leads, because a reader must meet
 * a classification before anything else on the page. "Where it's registered" follows on every page
 * including a Tier 3 stub: for a reader in Singapore it is the most useful thing here, and it is
 * the one block that is never empty. Interactions come next because they are what a reader
 * combining things needs, then generic and patent, then the question blocks in their data-derived
 * order, then the computed sections, then the exact record. The form-of note sits above all of it,
 * under the header: on a salt or a biosimilar page it is the answer to the first question a reader
 * has, and §6 asks the page to open with it.
 *
 * Every component here is a server component and none of them is rendered by React in the browser.
 * The page is served as a plain HTML document (docs/specs/deployment-plan.md, "The corpus
 * document"): there is no React Server Components stream behind it, so nothing on this page is
 * shipped a second time as data. The one script the document loads reads the DOM — the rail marker
 * follows `data-corpus-block` and the fragment in each rail link's own `href`, both of which
 * are already in the HTML.
 */
import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import { ContentsRail } from './ContentsRail'
import { CorpusHeader } from './CorpusHeader'
import { ExactRecord } from './ExactRecord'
import { FormOfNote } from './FormOfNote'
import { HubRows } from './HubRows'
import { InteractionsBlock } from './InteractionsBlock'
import { PatentBlock } from './PatentBlock'
import { QuestionBlock } from './QuestionBlock'
import { RegistrationBlock } from './RegistrationBlock'
import { RelationsRows } from './RelationsRows'
import { SourceList } from './SourceList'
import { StubRecord } from './StubRecord'
import { SupervisionBlock } from './SupervisionBlock'
import { Tier3Sections } from './Tier3Sections'

const LADDER_BLOCKS = new Set(['ladder', 'ladder-single', 'human-data-none'])

/**
 * The one ornament on the surface, between major regions and never between blocks.
 *
 * §13(11): the glyph itself is a CSS pseudo-element (`.cd-glyph::before`), so it is painted and is
 * not a text node. `aria-hidden` hides it from a screen reader and from nothing else — the
 * uniqueness ruler and a crawler both read `innerText`, and both were reading "~" as a word on
 * every page in the corpus.
 */
function RegionGlyph() {
  return <p className="cd-glyph" aria-hidden="true" />
}

export function CorpusDossierPage({ dossier }: { dossier: CorpusDossier }) {
  // The supervision block is not an answer to a question about the compound: it states the class a
  // register put the record in. A record that holds nothing else is still a stub, so the stub's own
  // record view is what renders beneath the block.
  const supervision = dossier.blocks.find((block) => block.block === 'supervision')
  const answers = dossier.blocks.filter((block) => block.block !== 'supervision')
  const stub = dossier.pageType === 'stub' || dossier.blocks.length === 0

  return (
    <div className="cd-root">
      <CorpusHeader dossier={dossier} />

      <div className="cd-layout">
        <div className="cd-column">
          {/*
            §13(14): the rendered duplicate check measured this page and one other at or above 0.5
            on their reading text after every generator rule. This one holds fewer of its own
            facts, so it is `noindex,follow` until Felix decides which page the corpus keeps, and it
            says so and links to the other rather than leaving a reader on a near-copy.
          */}
          {dossier.duplicateHoldOf ? (
            <p className="cd-duplicate-hold">
              This record and{' '}
              <a href={`/d/${dossier.duplicateHoldOf.slug}`}>
                {dossier.duplicateHoldOf.displayName}
              </a>{' '}
              read almost identically, and that page holds more recorded fields. Which of the two
              the corpus keeps has not been decided.
            </p>
          ) : null}
          {stub ? null : <ContentsRail blocks={dossier.blocks} variant="inline" />}
          {stub ? null : <RegionGlyph />}

          {/*
            The supervision block leads, on every suppressed record that has a classification to
            state and whether or not the record answers any question. It is rendered from the block
            list rather than from the block loop below so that a record with no questions at all
            still meets its classification first, above its own identifiers.
          */}
          <FormOfNote notes={dossier.formOfNotes} />

          {supervision ? <SupervisionBlock block={supervision} name={dossier.displayName} /> : null}

          {/*
            §13(2): the "What the registers record" block is retired. Its dated rows duplicated the
            registration block and printed the registers' own column names; the events are
            sentences inside the registration block below.
          */}
          <RegistrationBlock
            events={dossier.registerEvents}
            registration={dossier.registration}
            schedules={dossier.controlledSchedules}
          />

          <InteractionsBlock interactions={dossier.interactions} />

          <PatentBlock {...(dossier.patent ? { patent: dossier.patent } : {})} />

          {stub ? (
            <StubRecord dossier={dossier} />
          ) : (
            answers.map((block) => (
              <QuestionBlock
                block={block}
                key={block.id}
                name={dossier.displayName}
                {...(LADDER_BLOCKS.has(block.block) ? { ladder: dossier.ladder } : {})}
              />
            ))
          )}

          <Tier3Sections sections={dossier.computedSections} />

          {stub ? null : (
            <>
              <RegionGlyph />
              <ExactRecord identifiers={dossier.identifiers} />
              <RelationsRows notes={dossier.relationNotes} relations={dossier.relations} />
              <HubRows hubs={dossier.hubs} />
            </>
          )}

          <SourceList sources={dossier.sources} licenceNotes={dossier.licenceNotes} />
        </div>

        {stub ? null : <ContentsRail blocks={dossier.blocks} variant="rail" />}
      </div>
    </div>
  )
}
