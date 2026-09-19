/** A short, source-aware reader layer shared by every medicine dossier. */
/* eslint-disable @next/next/no-html-link-for-pages -- This route renders a plain HTML document outside the App Router client tree. */
import type { ReactNode } from 'react'

import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import type { DossierV4ViewModel } from '@/lib/dossier-v4/view-model'
import {
  draftBriefForSlug,
  type BriefLine,
  type DossierEditorialBrief,
} from '@/lib/editorial/dossier-briefs'

import { ExactRecord } from '@/components/dossier/corpus/ExactRecord'
import { RegistrationBlock } from '@/components/dossier/corpus/RegistrationBlock'
import { RelationsRows } from '@/components/dossier/corpus/RelationsRows'
import { SourceList } from '@/components/dossier/corpus/SourceList'

import { MissingRecordNotice, PublicationBanner, SubstanceIdentityStrip } from './Orientation'
import { Disclosure, Sources } from './Primitives'

function ReaderNav({ hasForms, hasInteractions }: { hasForms: boolean; hasInteractions: boolean }) {
  const links = [
    ['#answer', 'The short answer'],
    ['#safety', 'Safety'],
    ['#human-results', 'What happened in people'],
    ...(hasInteractions ? ([['#interactions', 'Interactions']] as const) : []),
    ...(hasForms ? ([['#forms', 'Forms and related names']] as const) : []),
    ['#sources', 'Sources and record'],
  ] as const
  return (
    <nav aria-label="On this medicine page" className="dv4-nav dv4-simple-nav">
      <p className="dv4-nav-title">On this page</p>
      <ol>
        {links.map(([href, label]) => (
          <li key={href}>
            <a href={href}>{label}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function ShortAnswer({ model }: { model: DossierV4ViewModel }) {
  const { hero } = model
  const hasUse = hero.whyPeopleCare.origin !== 'absent'
  const reviewedResult =
    hero.strongestGoalResult.origin === 'reviewed_claim' &&
    hero.principalUncertainty.origin === 'reviewed_claim' &&
    hero.resultScope !== null
  return (
    <section aria-labelledby="answer-heading" className="dv4-simple-answer" id="answer">
      <h2 id="answer-heading">The short answer</h2>
      <div className="dv4-simple-lead">
        {hasUse ? (
          <div>
            <h3>What people use it for</h3>
            <p>{hero.whyPeopleCare.text}</p>
          </div>
        ) : null}
        <div>
          <h3>{hasUse ? 'How it works' : 'What this record says'}</h3>
          <p>{hero.simpleAction.text}</p>
        </div>
      </div>
      {reviewedResult ? (
        <div className="dv4-simple-result">
          <h3>What a human study found</h3>
          <p>{hero.strongestGoalResult.text}</p>
          <p className="dv4-simple-limit">
            <strong>Important limit.</strong> {hero.principalUncertainty.text}
          </p>
          <p className="dv4-simple-scope">
            For {hero.resultScope!.goal}, in {hero.resultScope!.population}, compared with{' '}
            {hero.resultScope!.comparator}, over {hero.resultScope!.duration}.
          </p>
          <Disclosure summary="Source for this result">
            <Sources sources={hero.strongestGoalResult.sources} />
          </Disclosure>
        </div>
      ) : (
        <p className="dv4-simple-noresult">
          No result has passed RNAWiki’s source and human-review checks for this use. A registered
          study alone does not tell us whether it helped.
        </p>
      )}
      <Disclosure summary="Where the opening explanation came from">
        <p>{hero.simpleAction.basis}</p>
        <Sources sources={hero.simpleAction.sources} />
      </Disclosure>
    </section>
  )
}

function SafetyFirst({ corpus, model }: { corpus: CorpusDossier; model: DossierV4ViewModel }) {
  const entries = model.safety.entries.slice(0, 6)
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
    </section>
  )
}

function HumanEvidence({ model }: { model: DossierV4ViewModel }) {
  const result = model.hero.strongestGoalResult
  const reviewed = result.origin === 'reviewed_claim' && model.hero.resultScope !== null
  const tested = model.v3.doesItWork.registry?.tested ?? 0
  return (
    <section
      aria-labelledby="human-results-heading"
      className="dv4-simple-section"
      id="human-results"
    >
      <h2 id="human-results-heading">What happened in people?</h2>
      {reviewed ? (
        <p>The reviewed result and its exact scope are in the short answer above.</p>
      ) : (
        <p>
          RNAWiki has not published a reviewed human result for this use.{' '}
          {tested > 0
            ? `${tested} registered ${tested === 1 ? 'study is' : 'studies are'} classified as testing this substance, but registration is not a result.`
            : 'No registered study has been classified here as testing this substance.'}
        </p>
      )}
      {model.v3.doesItWork.registry?.sources.length ? (
        <Disclosure summary="Registry source and study counts">
          <p>{model.v3.doesItWork.registry.text}</p>
          <Sources sources={model.v3.doesItWork.registry.sources} />
        </Disclosure>
      ) : null}
    </section>
  )
}

function Interactions({ model }: { model: DossierV4ViewModel }) {
  const entries = model.stack.entries.filter((entry) => entry.sources.length > 0).slice(0, 4)
  if (entries.length === 0) return null
  return (
    <section
      aria-labelledby="interactions-heading"
      className="dv4-simple-section"
      id="interactions"
    >
      <h2 id="interactions-heading">What might it clash with?</h2>
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
    </section>
  )
}

function Forms({ corpus, model }: { corpus: CorpusDossier; model: DossierV4ViewModel }) {
  const related = model.formCheck.entries.slice(0, 6)
  const brands = (corpus.synonyms.find((group) => group.kind === 'brand')?.names ?? [])
    .filter((name) => !/component of|\s\/\s|\b\d+\s*(?:mg|mcg|ml|iu)\b/i.test(name))
    .slice(0, 6)
  if (related.length === 0 && brands.length === 0) return null
  return (
    <section aria-labelledby="forms-heading" className="dv4-simple-section" id="forms">
      <h2 id="forms-heading">Names and forms</h2>
      {brands.length > 0 ? (
        <p>
          <strong>Brand names recorded:</strong> {brands.join(', ')}.
        </p>
      ) : null}
      {related.length > 0 ? (
        <>
          <p>
            These are related records, not interchangeable results. A salt, mixture or look-alike
            name may behave differently.
          </p>
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
        </>
      ) : null}
    </section>
  )
}

function RecordAndSources({ corpus, model }: { corpus: CorpusDossier; model: DossierV4ViewModel }) {
  return (
    <section aria-labelledby="sources-heading" className="dv4-simple-section" id="sources">
      <h2 id="sources-heading">Check the record</h2>
      <p>
        Sources and identities are kept here so you can verify which substance this page describes.
      </p>
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
      <p>{line.text}</p>
      <a href={line.source.url} rel="noopener noreferrer">
        Source: {line.source.label}
      </a>
      {line.secondarySource ? (
        <>
          {' · '}
          <a href={line.secondarySource.url} rel="noopener noreferrer">
            {line.secondarySource.label}
          </a>
        </>
      ) : null}
    </div>
  )
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
  return (
    <div className="dv4-simple-grid" data-editorial-status="awaiting-clinical-review">
      <section aria-labelledby="answer-heading" className="dv4-simple-answer" id="answer">
        <p className="dv4-editorial-status">
          Source-checked editorial draft · clinical review pending
        </p>
        <h2 id="answer-heading">The short answer</h2>
        <h3>What it is</h3>
        <SourcedLine line={brief.identity} />
        <h3>Why people look at it</h3>
        <SourcedLine line={brief.whyPeopleLook} />
        <h3>How it works</h3>
        <SourcedLine line={brief.mechanism} />
        <p className="dv4-editorial-bottom">{brief.bottomLine.text}</p>
        <a href={brief.bottomLine.source.url} rel="noopener noreferrer">
          Source for this boundary: {brief.bottomLine.source.label}
        </a>
        {brief.productChecks[0] ? (
          <>
            <h3>Before comparing products</h3>
            <SourcedLine line={brief.productChecks[0]} />
          </>
        ) : null}
      </section>
      <ReaderNav hasForms hasInteractions />
      <div className="dv4-simple-body">
        <section aria-labelledby="safety-heading" className="dv4-simple-section" id="safety">
          <h2 id="safety-heading">What can go wrong?</h2>
          {brief.safety.map((line) => (
            <SourcedLine key={line.text} line={line} />
          ))}
        </section>
        <section
          aria-labelledby="human-results-heading"
          className="dv4-simple-section"
          id="human-results"
        >
          <h2 id="human-results-heading">What happened in people?</h2>
          {brief.studies.map((study) => (
            <div className="dv4-editorial-study" key={study.question}>
              <h3>{study.question}</h3>
              <SourcedLine line={study.finding} />
              <p className="dv4-simple-note">Who or what this does not cover: {study.boundary}</p>
            </div>
          ))}
        </section>
        <section
          aria-labelledby="interactions-heading"
          className="dv4-simple-section"
          id="interactions"
        >
          <h2 id="interactions-heading">What might it clash with?</h2>
          {brief.interactions.map((line) => (
            <SourcedLine key={line.text} line={line} />
          ))}
        </section>
        <section aria-labelledby="forms-heading" className="dv4-simple-section" id="forms">
          <h2 id="forms-heading">Check the product label</h2>
          {brief.productChecks.slice(1).map((line) => (
            <SourcedLine key={line.text} line={line} />
          ))}
          <p>
            <a href="/guides/magnesium-lysinate-glycinate">Compare the lysinate-glycinate name</a>
          </p>
        </section>
        <RecordAndSources corpus={corpus} model={model} />
      </div>
    </div>
  )
}

export function CompassPage({
  corpus,
  model,
}: {
  corpus: CorpusDossier
  model: DossierV4ViewModel
}): ReactNode {
  const held =
    model.publication.state === 'correction_hold' || model.publication.state === 'pipeline_failure'
  const editorialDraft =
    process.env.RNAWIKI_PREVIEW_EDITORIAL === '1' ? draftBriefForSlug(corpus.slug) : null
  const hasForms =
    model.formCheck.entries.length > 0 ||
    (corpus.synonyms.find((group) => group.kind === 'brand')?.names ?? []).some(
      (name) => !/component of|\s\/\s|\b\d+\s*(?:mg|mcg|ml|iu)\b/i.test(name),
    )
  const hasInteractions = model.stack.entries.some((entry) => entry.sources.length > 0)
  return (
    <div
      className="dv4-root dv4-simple"
      data-dossier-version="4"
      data-publication-state={model.publication.state}
    >
      <SubstanceIdentityStrip
        identity={model.identity}
        promise="A plain answer first. Exact sources and record details below."
      />
      {editorialDraft ? null : <PublicationBanner publication={model.publication} />}
      {editorialDraft ? null : (
        <MissingRecordNotice searched={model.searchedRegisters} substance={model.substance} />
      )}
      {editorialDraft ? (
        <EditorialDossier brief={editorialDraft} corpus={corpus} model={model} />
      ) : held ? null : model.substance.empty ? (
        <div className="dv4-simple-grid">
          <div className="dv4-simple-body dv4-simple-empty">
            <RecordAndSources corpus={corpus} model={model} />
          </div>
        </div>
      ) : (
        <div className="dv4-simple-grid">
          <ShortAnswer model={model} />
          <ReaderNav hasForms={hasForms} hasInteractions={hasInteractions} />
          <div className="dv4-simple-body">
            <SafetyFirst corpus={corpus} model={model} />
            <HumanEvidence model={model} />
            {hasInteractions ? <Interactions model={model} /> : null}
            {hasForms ? <Forms corpus={corpus} model={model} /> : null}
            <RecordAndSources corpus={corpus} model={model} />
          </div>
        </div>
      )}
    </div>
  )
}
