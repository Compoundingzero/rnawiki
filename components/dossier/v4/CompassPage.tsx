/** A short, source-aware reader layer shared by every medicine dossier. */
/* eslint-disable @next/next/no-html-link-for-pages -- This route renders a plain HTML document outside the App Router client tree. */
import type { ReactNode } from 'react'

import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import type { DossierV4ViewModel, Statement } from '@/lib/dossier-v4/view-model'
import type { CheckpointLine } from '@/lib/dossier-v4/source-bound-checkpoint'
import type { ProgrammeEvidenceReadModel } from '@/lib/evidence/types'
import { TwoArmChangeFigure } from '@/components/editorial/TwoArmChangeFigure'
import {
  MAGNESIUM_SLEEP_CHART,
  eligibleDraftBriefForSlug,
  type BriefLine,
  type BriefQuestion,
  type BriefSource,
  type DossierEditorialBrief,
  type PopulationBoundary,
} from '@/lib/editorial/dossier-briefs'

import { ExactRecord } from '@/components/dossier/corpus/ExactRecord'
import { RegistrationBlock } from '@/components/dossier/corpus/RegistrationBlock'
import { RelationsRows } from '@/components/dossier/corpus/RelationsRows'
import { SourceList } from '@/components/dossier/corpus/SourceList'

import { MissingRecordNotice, PublicationBanner, SubstanceIdentityStrip } from './Orientation'
import { ChangeHistory } from './Closing'
import { LabelSays } from './LabelSays'
import { Disclosure, RecordedFactList, Sources } from './Primitives'
import { PublishedProgrammeResult } from './PublishedProgrammeResult'
import { ReaderNav } from './ReaderNav'

function CheckpointFact({ line }: { line: CheckpointLine }) {
  const firstSource = line.sources.find((source) => source.url)
  return (
    <div>
      <h3>{line.label}</h3>
      <p>{line.text}</p>
      {firstSource?.url ? (
        <p className="dv4-simple-note">
          <a href={firstSource.url} rel="noopener noreferrer">
            {firstSource.label}
            {firstSource.id ? ` (${firstSource.id})` : ''}
          </a>
        </p>
      ) : null}
      {line.sources.length > 1 ? (
        <Disclosure summary={`All sources for ${line.label.toLowerCase()}`}>
          <Sources sources={line.sources} />
        </Disclosure>
      ) : null}
    </div>
  )
}

function ShortAnswer({ model }: { model: DossierV4ViewModel }) {
  const checkpoint = model.checkpoint ?? {
    kind: 'no_source_claim' as const,
    claim: null,
    tested: null,
    studied: null,
    measured: null,
    boundary: null,
    product: null,
  }
  const firstIdentity = (model.recordedIdentity ?? []).find((fact) => fact.citation.url)
  return (
    <section aria-labelledby="answer-heading" className="dv4-simple-answer" id="answer">
      <h2 id="answer-heading">The short answer</h2>
      <div className="dv4-simple-lead">
        {checkpoint.claim ? <CheckpointFact line={checkpoint.claim} /> : null}
        {!checkpoint.claim && checkpoint.product ? (
          <CheckpointFact line={checkpoint.product} />
        ) : null}
        {!checkpoint.claim && !checkpoint.product && firstIdentity ? (
          <div>
            <h3>What the source identifies</h3>
            <p>{firstIdentity.text}</p>
            <p className="dv4-simple-note">
              <a href={firstIdentity.citation.url} rel="noopener noreferrer">
                {firstIdentity.citation.label}
              </a>
            </p>
          </div>
        ) : null}
      </div>
      {checkpoint.kind === 'human_result' ? (
        <div className="dv4-simple-result">
          {checkpoint.tested ? <CheckpointFact line={checkpoint.tested} /> : null}
          {checkpoint.studied ? <CheckpointFact line={checkpoint.studied} /> : null}
          {checkpoint.measured ? <CheckpointFact line={checkpoint.measured} /> : null}
          {checkpoint.boundary ? <CheckpointFact line={checkpoint.boundary} /> : null}
        </div>
      ) : checkpoint.claim ? (
        <p className="dv4-simple-limit">
          This source describes a use or body action. It does not report a matched human benefit
          here.
        </p>
      ) : (
        <p className="dv4-simple-noresult">
          No source on this page yet connects this exact substance to a measured human result. Check
          the linked record below for what is available.
        </p>
      )}
    </section>
  )
}

function SafetyFirst({ corpus, model }: { corpus: CorpusDossier; model: DossierV4ViewModel }) {
  // The model puts the boxed product-label warning first without calling it an emergency.
  // Render every source-bound warning: a display cap can conceal a contraindication.
  const entries = model.safety.entries
  const interactions = model.stack.entries.filter((entry) => entry.sources.length > 0)
  return (
    <section aria-labelledby="safety-heading" className="dv4-simple-section" id="safety">
      <h2 id="safety-heading">What can go wrong?</h2>
      {corpus.withdrawn ? (
        <p className="dv4-simple-warning">
          A recorded register marks this substance as withdrawn. Do not read an older account of its
          effects as a reason to use it.
        </p>
      ) : null}
      {corpus.controlled ? (
        <p className="dv4-simple-warning">
          A recorded schedule controls this substance in at least one jurisdiction. This page gives
          no instructions for taking or combining it.
        </p>
      ) : null}
      {entries.length > 0 ? (
        <ul className="dv4-simple-safety-list">
          {entries.map((entry, index) => (
            <li key={`${entry.text}-${index}`}>
              <strong>{entry.actionLabel}.</strong> {entry.text}
              {entry.evidenceSource === 'product_label' && entry.sources[0]?.url ? (
                <p className="dv4-simple-note">
                  This is an excerpt from one product label.{' '}
                  <a href={entry.sources[0].url} rel="noopener noreferrer">
                    Read the complete label and the product it covers.
                  </a>
                </p>
              ) : null}
              <Disclosure summary="Source for this warning">
                <Sources sources={entry.sources} />
              </Disclosure>
            </li>
          ))}
        </ul>
      ) : model.safety.unverifiedLegacySafety ? (
        <p className="dv4-simple-warning">
          The older record contains harm notes, but no warning has been checked against an exact
          source for this summary. That is an unresolved safety gap, not evidence of safety.
        </p>
      ) : (
        <p>
          This record has no source-bound safety statement to show. That does not mean the substance
          is safe.
        </p>
      )}
      {interactions.length > 0 ? <InteractionContent entries={interactions} /> : null}
    </section>
  )
}

function HumanEvidence({ model }: { model: DossierV4ViewModel }) {
  const result = model.hero.strongestGoalResult
  const reviewed = result.origin === 'reviewed_claim' && model.hero.resultScope !== null
  const snapshots = model.humanResults.trialSnapshots
  if (!reviewed && snapshots.length === 0) return null
  return (
    <section
      aria-labelledby="human-results-heading"
      className="dv4-simple-section"
      id="human-results"
    >
      <h2 id="human-results-heading">What happened in people?</h2>
      {reviewed ? (
        <>
          <p>{result.text}</p>
          <p className="dv4-simple-note">
            In {model.hero.resultScope!.population}, compared with{' '}
            {model.hero.resultScope!.comparator}, over {model.hero.resultScope!.duration}.{' '}
            {model.hero.principalUncertainty.text}
          </p>
          <Disclosure summary="Source for this human result">
            <Sources sources={result.sources} />
          </Disclosure>
        </>
      ) : (
        <p>
          The source reports the measurements below. These are study results, not a conclusion that
          this substance helps with every goal or in every person.
        </p>
      )}
      {snapshots.length > 0 ? (
        <div className="dv4-study-snapshots">
          {snapshots.slice(0, 3).map((study, index) => (
            <article
              className="dv4-study-snapshot"
              key={`${study.trialIdentifier}-${study.endpoint}-${index}`}
            >
              <h3>
                {study.trialIdentifier}: {study.endpoint}
              </h3>
              <dl>
                <div>
                  <dt>Condition studied</dt>
                  <dd>{study.condition}</dd>
                </div>
                <div>
                  <dt>Intervention tested</dt>
                  <dd>{study.testedIntervention}</dd>
                </div>
                <div>
                  <dt>Form and route tested</dt>
                  <dd>{study.formulationAndRoute}</dd>
                </div>
                <div>
                  <dt>Who was studied</dt>
                  <dd>
                    {study.population ??
                      (study.included.length > 0
                        ? `The source lists these entry criteria: ${study.included.slice(0, 3).join('; ')}.`
                        : 'The people studied are not specified in this record.')}
                  </dd>
                </div>
                <div>
                  <dt>What was measured</dt>
                  <dd>
                    {study.endpoint}, at {study.timepoint}
                  </dd>
                </div>
                <div>
                  <dt>What the source reports</dt>
                  <dd>
                    {study.activeResult}
                    {study.comparatorResult
                      ? ` versus ${study.comparatorResult} in the comparison group`
                      : ''}
                    {study.difference ? `; reported difference: ${study.difference}` : ''}
                    {study.uncertainty ? ` (${study.uncertainty})` : ''}.
                  </dd>
                </div>
                <div>
                  <dt>What remains unknown here</dt>
                  <dd>
                    {study.excluded.length > 0
                      ? `The study excluded ${study.excluded.slice(0, 2).join('; ')}. Its result does not directly answer for those groups.`
                      : 'This measurement does not establish a result for a different goal or population.'}
                  </dd>
                </div>
              </dl>
              <p className="dv4-simple-note">
                <a href={study.citation.url} rel="noopener noreferrer">
                  Read the {study.citation.label}
                  {study.citation.id ? ` (${study.citation.id})` : ''}
                </a>
                {' · '}
                <a href={study.contextCitation.url} rel="noopener noreferrer">
                  Verify the condition and form tested
                </a>
                {study.populationCitation?.url ? (
                  <>
                    {' · '}
                    <a href={study.populationCitation.url} rel="noopener noreferrer">
                      Who the study included
                    </a>
                  </>
                ) : null}
              </p>
            </article>
          ))}
          {snapshots.length > 3 ? (
            <p className="dv4-simple-note">
              {snapshots.length - 3} further recorded result{snapshots.length - 3 === 1 ? '' : 's'}{' '}
              are in the source record below.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

/** Only label-bound steps belong in a public path; free-text study mentions are not proof of a link. */
function bodyPathSteps(model: DossierV4ViewModel) {
  const candidates: Array<{ label: string; statement: Statement | undefined }> = [
    { label: 'Where it acts', statement: model.hero.bodyLocation },
    { label: 'What it does there', statement: model.hero.actionDetail },
    { label: 'What changes first', statement: model.hero.immediateChange },
  ]
  const sourced = candidates.filter(
    (item): item is { label: string; statement: Statement } =>
      item.statement?.origin === 'stored_source' &&
      item.statement.sources.some((source) => Boolean(source.url)),
  )
  return sourced.filter(
    (item, index) =>
      sourced.findIndex((other) => other.statement.text === item.statement.text) === index,
  )
}

function BodyPath({ model }: { model: DossierV4ViewModel }) {
  const steps = bodyPathSteps(model)
  if (steps.length === 0) return null
  return (
    <section aria-labelledby="body-path-heading" className="dv4-simple-section" id="body-path">
      <h2 id="body-path-heading">The path through the body</h2>
      <p>
        These are actions a source describes, not a proven chain from taking the substance to
        feeling better.
      </p>
      <ul className="dv4-simple-path">
        {steps.map((step) => (
          <li key={step.statement.text}>
            <strong>{step.label}</strong>
            <p>{step.statement.text}</p>
            <Disclosure summary={`Source for ${step.label.toLowerCase()}`}>
              <Sources sources={step.statement.sources} />
            </Disclosure>
          </li>
        ))}
      </ul>
      <p className="dv4-simple-note">
        The study result, if this page has one, is a separate question: did people actually improve?
      </p>
    </section>
  )
}

function InteractionContent({ entries }: { entries: DossierV4ViewModel['stack']['entries'] }) {
  return (
    <div className="dv4-safety-interactions">
      <h3>Medicine interactions</h3>
      <ul className="dv4-simple-list">
        {entries.map((entry, index) => (
          <li key={`${entry.entityB}-${index}`}>
            <strong>{entry.entityB}:</strong> {entry.consequence}{' '}
            {entry.state === 'plausible_mechanistic'
              ? 'This is a prediction, not a human result.'
              : null}
            <Disclosure summary={`Source for ${entry.entityB} interaction`}>
              <Sources sources={entry.sources} />
            </Disclosure>
          </li>
        ))}
      </ul>
      <p className="dv4-simple-note">
        Not finding a pair in these sources does not establish that the pair is safe.
      </p>
    </div>
  )
}

function Forms({ model }: { model: DossierV4ViewModel }) {
  const related = model.formCheck.entries.slice(0, 6)
  const namedProducts = (model.practical?.sourceBoundSupply ?? []).filter(
    (fact) => fact.citation.url,
  )
  const namedText = new Set(namedProducts.map((fact) => fact.text))
  const directoryFacts = (model.formCheck.supply ?? []).filter(
    (fact) => fact.citation.url && !namedText.has(fact.text),
  )
  const registerFacts = (model.story?.regulatory ?? []).filter((fact) => fact.citation.url)
  if (
    related.length === 0 &&
    namedProducts.length === 0 &&
    directoryFacts.length === 0 &&
    registerFacts.length === 0
  )
    return null
  return (
    <section aria-labelledby="forms-heading" className="dv4-simple-section" id="forms">
      <h2 id="forms-heading">Products and forms in the sources</h2>
      <p className="dv4-simple-note">
        A directory entry describes the product named there. It does not show that another form
        works the same way, or that a listing is an approval.
      </p>
      <RecordedFactList facts={namedProducts.slice(0, 4)} heading="Named products" />
      {namedProducts.length > 4 ? (
        <Disclosure summary={`More named products (${namedProducts.length - 4})`}>
          <RecordedFactList facts={namedProducts.slice(4)} />
        </Disclosure>
      ) : null}
      <RecordedFactList facts={directoryFacts.slice(0, 4)} heading="What the directories list" />
      {directoryFacts.length > 4 ? (
        <Disclosure summary={`More directory entries (${directoryFacts.length - 4})`}>
          <RecordedFactList facts={directoryFacts.slice(4)} />
        </Disclosure>
      ) : null}
      <RecordedFactList facts={registerFacts.slice(0, 3)} heading="What the registers record" />
      {registerFacts.length > 3 ? (
        <Disclosure summary={`More register entries (${registerFacts.length - 3})`}>
          <RecordedFactList facts={registerFacts.slice(3)} />
        </Disclosure>
      ) : null}
      {related.length > 0 ? (
        <>
          <Disclosure summary="Related substance records (not interchangeable results)">
            <ul className="dv4-simple-list">
              {related.map((entry, index) => (
                <li key={`${entry.counterpart}-${index}`}>
                  {entry.counterpartSlug ? (
                    <a href={`/d/${entry.counterpartSlug}`}>{entry.counterpart}</a>
                  ) : (
                    entry.counterpart
                  )}{' '}
                  <span className="dv4-simple-note">({entry.relationLabel.toLowerCase()})</span>
                </li>
              ))}
            </ul>
          </Disclosure>
        </>
      ) : null}
    </section>
  )
}

function RecordAndSources({
  corpus,
  model,
  editorialSources = [],
}: {
  corpus: CorpusDossier
  model: DossierV4ViewModel
  editorialSources?: BriefSource[]
}) {
  const unscopedResultSources =
    model.humanResults.trialSnapshots.length === 0
      ? model.humanResults.namedTrial.map((fact) => fact.citation)
      : []
  return (
    <section aria-labelledby="sources-heading" className="dv4-simple-section" id="sources">
      <h2 id="sources-heading">Check the record</h2>
      {editorialSources.length > 0 ? (
        <Disclosure summary={`Sources for this summary (${editorialSources.length})`}>
          <ol className="dv4-editorial-references">
            {editorialSources.map((source) => (
              <li key={source.marker}>
                [{source.marker}]{' '}
                <a href={source.url} rel="noopener noreferrer">
                  {source.label}
                </a>
              </li>
            ))}
          </ol>
        </Disclosure>
      ) : null}
      {unscopedResultSources.length > 0 ? (
        <Disclosure summary="Source records for results not yet scoped to a condition and form">
          <Sources sources={unscopedResultSources} />
        </Disclosure>
      ) : null}
      <Disclosure summary={`Sources (${corpus.sources.length})`}>
        <div className="cd-root">
          <SourceList licenceNotes={corpus.licenceNotes} sources={corpus.sources} />
        </div>
      </Disclosure>
      <Disclosure summary="Registration and controlled status">
        <div className="cd-root">
          <RegistrationBlock
            events={corpus.registerEvents}
            registration={corpus.registration}
            schedules={corpus.controlledSchedules}
          />
        </div>
      </Disclosure>
      <Disclosure summary="Identifiers and related substances">
        <div className="cd-root">
          <ExactRecord identifiers={corpus.identifiers} />
          <RelationsRows notes={corpus.relationNotes} relations={corpus.relations} />
        </div>
      </Disclosure>
      {model.identity.lastSubstantiveReview ? (
        <p className="dv4-simple-note">
          Sources last checked {model.identity.lastSubstantiveReview}.
        </p>
      ) : null}
    </section>
  )
}

function SourcedLine({ line }: { line: BriefLine }) {
  return (
    <div className="dv4-editorial-line">
      <p>
        {line.text}{' '}
        <a
          aria-label={`Source ${line.source.marker}: ${line.source.label}`}
          className="dv4-editorial-cite"
          href={line.source.url}
          rel="noopener noreferrer"
        >
          [{line.source.marker}]
        </a>
        {line.secondarySource ? (
          <a
            aria-label={`Source ${line.secondarySource.marker}: ${line.secondarySource.label}`}
            className="dv4-editorial-cite"
            href={line.secondarySource.url}
            rel="noopener noreferrer"
          >
            [{line.secondarySource.marker}]
          </a>
        ) : null}
      </p>
    </div>
  )
}

function SourcedQuestions({ items }: { items: BriefQuestion[] }) {
  return (
    <dl className="dv4-editorial-questions">
      {items.map((item) => (
        <div key={item.question}>
          <dt>{item.question}</dt>
          <dd>
            <SourcedLine line={item.answer} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

function PopulationBoundaryFigure({ boundary }: { boundary: PopulationBoundary }) {
  return (
    <figure className="dv4-population-boundary">
      <figcaption>Who the sleep study did—and did not—cover</figcaption>
      <div className="dv4-population-boundary-groups">
        <div>
          <h3>Included</h3>
          <ul>
            {boundary.studied.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Excluded</h3>
          <ul>
            {boundary.notStudied.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <p>
        An effect in the first group is not proof of the same effect in the second.{' '}
        <a href={boundary.source.url} rel="noopener noreferrer">
          [{boundary.source.marker}] {boundary.source.label}
        </a>
      </p>
    </figure>
  )
}

function briefSources(brief: DossierEditorialBrief): BriefSource[] {
  const lines = [
    brief.identity,
    brief.whyPeopleLook,
    brief.mechanism,
    brief.bottomLine,
    ...brief.safety,
    ...brief.studies.map((study) => study.finding),
    ...brief.interactions,
    ...brief.productChecks,
    ...brief.studyWords.map((item) => item.answer),
    ...brief.whyItMayFeelDifferent.map((item) => item.answer),
    ...brief.suppliedAs.map((item) => item.answer),
    ...brief.measures.map((item) => item.answer),
    ...brief.openQuestions.map((item) => item.answer),
    ...brief.claimChecks.map((item) => item.answer),
    ...brief.evidenceTrail.map((item) => item.answer),
    ...brief.nextQuestions.map((item) => item.answer),
  ]
  const sources = new Map<number, BriefSource>()
  for (const line of lines) {
    sources.set(line.source.marker, line.source)
    if (line.secondarySource) sources.set(line.secondarySource.marker, line.secondarySource)
  }
  sources.set(brief.populationBoundary.source.marker, brief.populationBoundary.source)
  return [...sources.values()].sort((a, b) => a.marker - b.marker)
}

function EditorialDossier({
  brief,
  corpus,
  model,
}: {
  brief: DossierEditorialBrief
  corpus: CorpusDossier
  model: DossierV4ViewModel
}) {
  const visibleStudies = brief.studies.filter((study) => study.defaultVisible !== false)
  const moreStudies = brief.studies.filter((study) => study.defaultVisible === false)
  const hasChangeHistory = model.changes.entries.length > 0 || model.wordingHistory.length > 0
  return (
    <div className="dv4-simple-grid" data-evidence-state="source-linked-preview">
      <section aria-labelledby="answer-heading" className="dv4-simple-answer" id="answer">
        <h2 id="answer-heading">At a glance</h2>
        <h3>What it is</h3>
        <SourcedLine line={brief.identity} />
        <h3>For sleep</h3>
        <SourcedLine line={brief.bottomLine} />
        <h3>How it works</h3>
        <SourcedLine line={brief.mechanism} />
      </section>
      <ReaderNav editorial hasChangeHistory={hasChangeHistory} hasForms variant="desktop" />
      <div className="dv4-simple-body">
        <section aria-labelledby="safety-heading" className="dv4-simple-section" id="safety">
          <h2 id="safety-heading">What can go wrong?</h2>
          {brief.safety.map((line) => (
            <SourcedLine key={line.text} line={line} />
          ))}
          <div className="dv4-safety-interactions">
            <h3>Medicine interactions</h3>
            {brief.interactions.map((line) => (
              <SourcedLine key={line.text} line={line} />
            ))}
          </div>
        </section>
        <section
          aria-labelledby="human-results-heading"
          className="dv4-simple-section"
          id="human-results"
        >
          <h2 id="human-results-heading">What happened in people?</h2>
          {visibleStudies.map((study) => (
            <div className="dv4-editorial-study" key={study.question}>
              <h3>{study.question}</h3>
              <SourcedLine line={study.finding} />
              {study.visual === 'magnesium-sleep-change' ? (
                <TwoArmChangeFigure data={MAGNESIUM_SLEEP_CHART} />
              ) : null}
              <p className="dv4-simple-note">Who or what this does not cover: {study.boundary}</p>
              {study.protocol ? (
                <Disclosure summary="Exact study amount and analysis">
                  <p>{study.protocol}</p>
                </Disclosure>
              ) : null}
            </div>
          ))}
          {moreStudies.length > 0 ? (
            <Disclosure summary="Absorption study in people with intestinal surgery">
              {moreStudies.map((study) => (
                <div className="dv4-editorial-study" key={study.question}>
                  <h3>{study.question}</h3>
                  <SourcedLine line={study.finding} />
                  <p className="dv4-simple-note">Limit: {study.boundary}</p>
                </div>
              ))}
            </Disclosure>
          ) : null}
          <Disclosure summary="What placebo, random assignment and the uncertainty range mean here">
            <SourcedQuestions items={brief.studyWords} />
          </Disclosure>
        </section>
        <section aria-labelledby="body-path-heading" className="dv4-simple-section" id="body-path">
          <h2 id="body-path-heading">The path through the body</h2>
          <p>
            Magnesium is absorbed through the gut, but the four-week sleep study did not measure
            absorption or brain activity. Its result is a sleep-problem score, not proof of a body
            mechanism.
          </p>
          <SourcedLine line={brief.mechanism} />
        </section>
        <section
          aria-labelledby="felt-result-heading"
          className="dv4-simple-section"
          id="felt-result"
        >
          <h2 id="felt-result-heading">Why you may not notice the same thing</h2>
          <SourcedQuestions items={brief.whyItMayFeelDifferent} />
        </section>
        <section aria-labelledby="measures-heading" className="dv4-simple-section" id="measures">
          <h2 id="measures-heading">What was measured—and what was not</h2>
          <SourcedQuestions items={brief.measures} />
        </section>
        <section aria-labelledby="forms-heading" className="dv4-simple-section" id="forms">
          <h2 id="forms-heading">The product and the exact form</h2>
          <SourcedQuestions items={brief.suppliedAs} />
          <h3>Glycinate is not every magnesium product</h3>
          {brief.productChecks.map((line) => (
            <SourcedLine key={line.text} line={line} />
          ))}
          <p>
            <a href="/guides/magnesium-lysinate-glycinate">Compare the lysinate-glycinate name</a>
          </p>
        </section>
        <section aria-labelledby="unknowns-heading" className="dv4-simple-section" id="unknowns">
          <h2 id="unknowns-heading">What remains open</h2>
          <PopulationBoundaryFigure boundary={brief.populationBoundary} />
          <SourcedQuestions items={brief.openQuestions} />
        </section>
        <section
          aria-labelledby="claim-checks-heading"
          className="dv4-simple-section"
          id="claim-checks"
        >
          <h2 id="claim-checks-heading">How this claim was checked</h2>
          <SourcedQuestions items={brief.claimChecks} />
          <Disclosure summary="Trial timeline: from registered plan to published result">
            <SourcedQuestions items={brief.evidenceTrail} />
          </Disclosure>
          <Disclosure summary="More questions: amount, other forms and quality seals">
            <SourcedQuestions items={brief.nextQuestions} />
          </Disclosure>
        </section>
        <LabelSays slug={corpus.slug} />
        {hasChangeHistory ? (
          <ChangeHistory changes={model.changes} wordingHistory={model.wordingHistory} />
        ) : null}
      </div>
    </div>
  )
}

export function CompassPage({
  corpus,
  model,
  programmeEvidence = null,
}: {
  corpus: CorpusDossier
  model: DossierV4ViewModel
  programmeEvidence?: ProgrammeEvidenceReadModel | null
}): ReactNode {
  const held =
    model.publication.state === 'correction_hold' || model.publication.state === 'pipeline_failure'
  const publishedProgramme =
    !held && programmeEvidence?.selectedProgramme?.verdict
      ? programmeEvidence.selectedProgramme
      : null
  // Preview copy must obey the same identity and pipeline holds as every public record.
  const editorialDraft = eligibleDraftBriefForSlug(
    corpus.slug,
    model.publication.state,
    process.env.RNAWIKI_PREVIEW_EDITORIAL === '1',
  )
  const hasForms =
    model.formCheck.entries.length > 0 ||
    (model.practical?.sourceBoundSupply ?? []).some((fact) => Boolean(fact.citation.url)) ||
    (model.formCheck.supply ?? []).some((fact) => Boolean(fact.citation.url)) ||
    (model.story?.regulatory ?? []).some((fact) => Boolean(fact.citation.url))
  const hasHumanResults =
    (model.hero.strongestGoalResult.origin === 'reviewed_claim' &&
      model.hero.resultScope !== null) ||
    model.humanResults.trialSnapshots.length > 0
  const hasBodyPath = bodyPathSteps(model).length > 0
  const hasSourceBoundSafety =
    !held &&
    (model.safety.entries.length > 0 ||
      model.stack.entries.some((entry) => entry.sources.length > 0))
  const hasChangeHistory =
    !held && (model.changes.entries.length > 0 || model.wordingHistory.length > 0)
  const hasAnswer = !model.substance.empty || Boolean(publishedProgramme)
  return (
    <div
      className="dv4-root dv4-simple"
      data-dossier-version="4"
      data-publication-state={model.publication.state}
    >
      {!held && hasAnswer ? (
        <ReaderNav
          editorial={Boolean(editorialDraft)}
          hasBodyPath={editorialDraft ? true : hasBodyPath}
          hasChangeHistory={hasChangeHistory}
          hasForms={editorialDraft ? true : hasForms}
          hasHumanResults={editorialDraft ? true : hasHumanResults}
          answerLabel={publishedProgramme ? 'Evidence for this use' : 'The short answer'}
          variant="mobile"
        />
      ) : null}
      <SubstanceIdentityStrip
        identity={model.identity}
        promise={
          held
            ? 'This record does not attach health claims to an uncertain ingredient identity.'
            : 'A plain answer first. Exact sources and record details below.'
        }
      />
      {editorialDraft ? null : <PublicationBanner publication={model.publication} />}
      {editorialDraft || publishedProgramme ? null : (
        <MissingRecordNotice searched={model.searchedRegisters} substance={model.substance} />
      )}
      {editorialDraft ? (
        <EditorialDossier brief={editorialDraft} corpus={corpus} model={model} />
      ) : held ? null : model.substance.empty && !publishedProgramme ? (
        <div className="dv4-simple-grid">
          <div className="dv4-simple-body dv4-simple-empty">
            {hasSourceBoundSafety ? <SafetyFirst corpus={corpus} model={model} /> : null}
            <LabelSays slug={corpus.slug} />
            <RecordAndSources corpus={corpus} model={model} />
            {hasChangeHistory ? (
              <ChangeHistory changes={model.changes} wordingHistory={model.wordingHistory} />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="dv4-simple-grid">
          {publishedProgramme ? (
            <PublishedProgrammeResult medicineSlug={corpus.slug} programme={publishedProgramme} />
          ) : (
            <ShortAnswer model={model} />
          )}
          <ReaderNav
            answerLabel={publishedProgramme ? 'Evidence for this use' : 'The short answer'}
            hasBodyPath={hasBodyPath}
            hasChangeHistory={hasChangeHistory}
            hasForms={hasForms}
            hasHumanResults={hasHumanResults}
            variant="desktop"
          />
          <div className="dv4-simple-body">
            <SafetyFirst corpus={corpus} model={model} />
            {hasHumanResults ? <HumanEvidence model={model} /> : null}
            {hasBodyPath ? <BodyPath model={model} /> : null}
            {hasForms ? <Forms model={model} /> : null}
            <LabelSays slug={corpus.slug} />
            <RecordAndSources corpus={corpus} model={model} />
            {hasChangeHistory ? (
              <ChangeHistory changes={model.changes} wordingHistory={model.wordingHistory} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
