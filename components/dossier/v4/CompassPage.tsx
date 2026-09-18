/**
 * The Substance Compass page shell.
 *
 * One continuous document, a standing navigator in the left rail at desktop, and the sections in
 * the learning order: purpose, what it does, what happened in people, how far that carries, what it
 * would be like to take, what is unknown, and then the technical layer.
 *
 * The old dossier is not deleted. Everything the v3 surface and the corpus record hold is still on
 * the page, moved below the receipts into a labelled technical disclosure, so an expert loses
 * nothing and a beginner is not made to start there.
 */
import type { ReactNode } from 'react'

import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import type { DossierV4ViewModel } from '@/lib/dossier-v4/view-model'
import { truthLaneLabel, type TruthLane } from '@/lib/dossier-v4/taxonomy'

import { ExactRecord } from '@/components/dossier/corpus/ExactRecord'
import { HubRows } from '@/components/dossier/corpus/HubRows'
import { QuestionBlock } from '@/components/dossier/corpus/QuestionBlock'
import { RegistrationBlock } from '@/components/dossier/corpus/RegistrationBlock'
import { RelationsRows } from '@/components/dossier/corpus/RelationsRows'
import { SourceList } from '@/components/dossier/corpus/SourceList'

import {
  AlternativesLadder,
  ChangeHistory,
  ClaimDecoder,
  DrugStory,
  EvidenceReceipts,
  NextQuestionRail,
  UnknownMap,
  WhatIsMissing,
} from './Closing'
import {
  BodyJourney,
  EffectFingerprint,
  EvidenceStaircase,
  FeltMeasuredMeaningful,
  HumanResults,
  SignalTimeline,
} from './Evidence'
import {
  ApplicabilityMirror,
  FormRealityCheck,
  MeasurementCoach,
  NoResponseMap,
  PracticalReality,
  SafetyMap,
  StackCollisionMap,
} from './Personal'
import {
  ConceptPrimer,
  MissingRecordNotice,
  PublicationBanner,
  PublicationNote,
  PurposeRail,
  SubstanceActionHero,
  SubstanceIdentityStrip,
} from './Orientation'
import { Disclosure } from './Primitives'

const LADDER_BLOCKS = new Set(['ladder', 'ladder-single', 'human-data-none'])

function Navigator({ model }: { model: DossierV4ViewModel }): ReactNode {
  const lanes: TruthLane[] = [
    'body_action',
    'human_result',
    'personal_reality',
    'uncertainty',
    'community_experience',
  ]
  return (
    <nav aria-labelledby="compass-nav-h" className="dv4-nav">
      <p className="dv4-nav-title" id="compass-nav-h">
        On this page
      </p>
      <ol>
        {lanes.flatMap((lane) => {
          const sections = model.sections.filter(
            (section) => section.lane === lane && section.inNavigator,
          )
          if (sections.length === 0) return []
          return [
            <li key={`lane-${lane}`}>
              <p className="dv4-nav-lane">{truthLaneLabel(lane)}</p>
            </li>,
            ...sections.map((section) => (
              <li key={section.id}>
                <a data-section-state={section.state} href={`#${section.id}`}>
                  {section.short}
                </a>
              </li>
            )),
          ]
        })}
      </ol>
    </nav>
  )
}

/**
 * The technical layer. This is where the corpus record's generated question blocks, identifiers,
 * relations and source rows live on a v4 page: below the receipts, behind a disclosure, and
 * explicitly labelled as the place raw vocabulary is allowed.
 */
function TechnicalRecord({
  corpus,
  model,
}: {
  corpus: CorpusDossier
  model: DossierV4ViewModel
}): ReactNode {
  const blocks = corpus.blocks.filter((block) => block.block !== 'supervision')
  return (
    <section
      aria-labelledby="technical-record-h"
      className="dv4-technical"
      data-compass-lane="human_result"
      id="technical-record"
    >
      <p className="dv4-eyebrow">
        <span>The record as stored</span>
      </p>
      <h2 id="technical-record-h">The full record, for auditing</h2>
      <p className="dv4-lede">
        Everything above is built from what is below. This layer keeps the technical vocabulary,
        record identifiers and every stored row, so a reader who wants to check the page can.
      </p>

      {model.recordedVerdict ? (
        <Disclosure summary="The older medicine-wide conclusion held in this record">
          <p className="dv4-note">
            Written for a clinical reader, and about the medicine as a whole rather than about one
            indication, population and set of trials. RNAWiki does not treat it as a programme
            conclusion and no reviewer has signed it off in that form. It is here word for word
            because it is what the record holds.
          </p>
          <blockquote>
            <p>{model.recordedVerdict}</p>
          </blockquote>
        </Disclosure>
      ) : null}

      <Disclosure summary={`Recorded evidence blocks (${blocks.length})`}>
        <div className="cd-root">
          {blocks.map((block) => (
            <QuestionBlock
              block={block}
              headingLevel="h3"
              key={block.id}
              name={corpus.displayName}
              {...(LADDER_BLOCKS.has(block.block) ? { ladder: corpus.ladder } : {})}
            />
          ))}
        </div>
      </Disclosure>

      <Disclosure summary="Where it is registered">
        <RegistrationBlock
          events={corpus.registerEvents}
          registration={corpus.registration}
          schedules={corpus.controlledSchedules}
        />
      </Disclosure>

      <Disclosure summary="Identifiers, relations and other names">
        <div className="cd-root">
          <ExactRecord identifiers={corpus.identifiers} />
          <RelationsRows notes={corpus.relationNotes} relations={corpus.relations} />
          <HubRows hubs={corpus.hubs} />
          <dl>
            {corpus.synonyms.map((group) => (
              <div key={group.kind}>
                <dt>{group.label}</dt>
                <dd>{group.names.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Disclosure>

      <Disclosure summary={`Sources (${corpus.sources.length})`}>
        <div className="cd-root">
          <SourceList licenceNotes={corpus.licenceNotes} sources={corpus.sources} />
        </div>
      </Disclosure>

      <Disclosure summary="Index-quality checks">
        <ul>
          {model.v3.indexQuality.map((check) => (
            <li data-passed={check.passed ? 'true' : 'false'} key={check.check}>
              <span aria-hidden="true">{check.passed ? '✓' : '✗'}</span>{' '}
              {check.check.replace(/_/g, ' ')}: {check.detail}
            </li>
          ))}
        </ul>
      </Disclosure>
    </section>
  )
}

/**
 * The words a page uses, explained before the words that depend on them.
 *
 * Shared by both page shapes. `tests/e2e/public-inclisiran-journey.spec.ts` asserts
 * `#concept-primer` on a phone, so it is part of the skeleton every medicine page carries, not
 * decoration a bare record can drop.
 */
function ConceptPrimerSection({
  concepts,
}: {
  concepts: DossierV4ViewModel['concepts']
}): ReactNode {
  if (concepts.length === 0) return null
  return (
    <section
      aria-labelledby="concept-primer-h"
      className="dv4-section"
      data-compass-lane="body_action"
      data-lane="body_action"
      id="concept-primer"
    >
      <p className="dv4-eyebrow">
        <span>Words this page uses</span>
      </p>
      <h2 id="concept-primer-h">Four words worth knowing first</h2>
      <p className="dv4-lede">
        Chosen from what this page shows, with each one explained before the word it depends on.
      </p>
      <ConceptPrimer concepts={concepts} />
    </section>
  )
}

export function CompassPage({
  corpus,
  model,
}: {
  corpus: CorpusDossier
  model: DossierV4ViewModel
}): ReactNode {
  const stages = model.journey.nodes.map((node) => node.stage)
  /*
   * A record that holds nothing gets a short page.
   *
   * Measured on the live site, `1-2-hexanediol` — a cosmetic preservative this corpus classes as a
   * prescription medicine — served a sixteen-section dossier: a nineteen-item "On this page" list,
   * five purpose chips whose every target was empty, a primer teaching placebo and comparator to a
   * reader with no study to read, and the same absence written six different ways. 2,436 records are
   * in that state, and 1,682 of them will never have content to fill it.
   *
   * The hero stays. On a bare record it carries the point of the page — what the registers do record,
   * and an honest statement of what was searched and not found — which is also why
   * `tests/e2e/public-inclisiran-journey.spec.ts` asserts `#substance-action` on every medicine page.
   * What goes is the furniture that advertises sections with nothing in them.
   */
  const holdsNothing = model.substance.empty
  return (
    <div
      className="dv4-root"
      data-dossier-version="4"
      data-publication-state={model.publication.state}
    >
      <SubstanceIdentityStrip identity={model.identity} promise={model.pagePromise}>
        {/* Review lives at /review-queue. A reader sees the medicine, not the machinery. */}
        <PublicationNote publication={model.publication} />
      </SubstanceIdentityStrip>
      {/* Only an identity hold, a pipeline failure, or an empty record opens with a block. */}
      <PublicationBanner publication={model.publication} />
      <MissingRecordNotice searched={model.searchedRegisters} substance={model.substance} />
      {holdsNothing ? (
        <div className="dv4-flow">
          <SubstanceActionHero
            hero={model.hero}
            name={model.name}
            recordedIdentity={model.recordedIdentity}
            stages={stages}
          />
          <ConceptPrimerSection concepts={model.concepts} />
          <SafetyMap safety={model.safety} />
          {/*
           * `lib/dossier-v4/section-visibility.ts` names two sections that print even when they
           * hold nothing, because their emptiness is itself a fact the reader needs: safety, and the
           * source trail. The second is this one. Dropping it here was caught by
           * `tests/e2e/public-inclisiran-journey.spec.ts`, which asserts `#evidence-receipts` on a
           * medicine page: a bare record with no visible source trail looks like a record nobody
           * checked.
           */}
          <EvidenceReceipts gates={model.gates} receipts={model.receipts} />
          <TechnicalRecord corpus={corpus} model={model} />
          <p className="dv4-foot">
            {model.notAdvice} {model.notForChildren}
          </p>
        </div>
      ) : (
        <>
          <PurposeRail />
          <div className="dv4-canvas">
            <Navigator model={model} />
            <div className="dv4-flow">
              <SubstanceActionHero
                hero={model.hero}
                name={model.name}
                recordedIdentity={model.recordedIdentity}
                stages={stages}
              />
              <ConceptPrimerSection concepts={model.concepts} />
              <EffectFingerprint fingerprint={model.fingerprint} />
              <HumanResults results={model.humanResults} />
              <EvidenceStaircase staircase={model.staircase} />
              <BodyJourney journey={model.journey} />
              <FeltMeasuredMeaningful experience={model.experience} />
              <SignalTimeline timeline={model.timeline} />
              <ApplicabilityMirror applicability={model.applicability} />
              <NoResponseMap noResponse={model.noResponse} />
              <PracticalReality practical={model.practical} />
              <SafetyMap safety={model.safety} />
              <StackCollisionMap stack={model.stack} />
              <FormRealityCheck formCheck={model.formCheck} />
              <MeasurementCoach measurement={model.measurement} />
              <AlternativesLadder alternatives={model.alternatives} />
              <ClaimDecoder decoder={model.claimDecoder} />
              <UnknownMap unknowns={model.unknowns} />
              <EvidenceReceipts gates={model.gates} receipts={model.receipts} />
              <DrugStory story={model.story} />
              <ChangeHistory changes={model.changes} wordingHistory={model.wordingHistory} />
              <NextQuestionRail questions={model.nextQuestions} />
              <WhatIsMissing sections={model.sections} />
              <TechnicalRecord corpus={corpus} model={model} />
              <p className="dv4-foot">
                {model.notAdvice} {model.notForChildren}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
