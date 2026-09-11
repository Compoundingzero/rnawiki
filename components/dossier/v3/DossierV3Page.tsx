/**
 * The dossier v3 reader surface: one continuous page, eleven sections, a compact sticky
 * navigator, progressive disclosure through native `<details>`, and a goal lens implemented as
 * radio inputs so it works without a script (docs/dossier-information-architecture.md).
 *
 * Every component here is a server component and is rendered once to static markup by the corpus
 * document route. Nothing on this page is assembled from a pipeline value: the view model is the
 * only input, and every sentence it carries is a reviewed claim, a sourced fact, a fixed contract
 * sentence or an explicit absence state.
 */
import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import {
  COMPLETION_STATES,
  EVIDENCE_CLASSES,
  OUTCOME_CLASSES,
  completionStateLabel,
} from '@/lib/dossier-v3/taxonomy'
import { SECTIONS, type DossierV3ViewModel } from '@/lib/dossier-v3/view-model'

import { ExactRecord } from '@/components/dossier/corpus/ExactRecord'
import { HubRows } from '@/components/dossier/corpus/HubRows'
import { QuestionBlock } from '@/components/dossier/corpus/QuestionBlock'
import { RegistrationBlock } from '@/components/dossier/corpus/RegistrationBlock'
import { RelationsRows } from '@/components/dossier/corpus/RelationsRows'
import { SourceList } from '@/components/dossier/corpus/SourceList'

import { EvidenceLabel, Sources, TruthPattern } from './EvidenceLabel'
import {
  AlternativesSection,
  ApplicabilitySection,
  DoesItWorkSection,
  InteractionsSection,
  MeasureSection,
  MechanismSection,
  SafetySection,
  TeachBackSection,
  UnknownsSection,
  WhatChangedSection,
} from './Sections'

const LADDER_BLOCKS = new Set(['ladder', 'ladder-single', 'human-data-none'])

function Navigator({ model }: { model: DossierV3ViewModel }) {
  return (
    <nav aria-label="Sections of this page" className="dv3-nav">
      <ol>
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>
              <span className="dv3-nav-long">{section.label}</span>
              <span aria-hidden="true" className="dv3-nav-short">
                {section.short}
              </span>
            </a>
          </li>
        ))}
      </ol>
      <p className="dv3-nav-status">
        <EvidenceLabel
          code={model.decisionCard.evidenceStatus.code}
          label={model.decisionCard.evidenceStatus.label}
          tone={model.decisionCard.noReviewedConclusion ? 'muted' : 'strong'}
        />
      </p>
    </nav>
  )
}

function DecisionCard({ model }: { model: DossierV3ViewModel }) {
  const card = model.decisionCard
  const stateGlossary = COMPLETION_STATES.filter((state) =>
    card.fields.some((field) => field.state === state.code),
  )
  return (
    <section
      aria-labelledby="in-ten-seconds-h"
      className="dv3-section dv3-decision"
      data-corpus-block="in-ten-seconds"
      id="in-ten-seconds"
    >
      <h2 id="in-ten-seconds-h">In 10 seconds</h2>
      <p className="dv3-kicker">
        <span className="dv3-type">{model.substanceType.label}</span>
        {model.lastEvidenceCheck ? (
          <span className="dv3-check"> · Last evidence check {model.lastEvidenceCheck}</span>
        ) : null}
      </p>
      <p className="dv3-status">
        <EvidenceLabel
          code={card.evidenceStatus.code}
          label={card.evidenceStatus.label}
          tone={card.noReviewedConclusion ? 'muted' : 'strong'}
        />
        {card.noReviewedConclusion ? null : (
          <span className="dv3-status-scope"> Scope: {card.evidenceStatus.scope}.</span>
        )}
      </p>
      <dl className="dv3-card">
        {card.fields.map((field) => (
          <div
            className={field.filled ? 'dv3-field dv3-field-filled' : 'dv3-field dv3-field-absent'}
            data-field={field.field}
            data-state={field.state}
            key={field.field}
          >
            <dt>{field.label}</dt>
            <dd>
              <p>{field.text}</p>
              <p className="dv3-field-meta">
                <EvidenceLabel
                  code={field.state}
                  label={completionStateLabel(field.state)}
                  tone={field.filled ? 'neutral' : 'muted'}
                />
                {field.evidenceClass ? (
                  <>
                    {' '}
                    <EvidenceLabel
                      code={field.evidenceClass}
                      label={
                        EVIDENCE_CLASSES.find((entry) => entry.code === field.evidenceClass)
                          ?.label ?? field.evidenceClass
                      }
                    />
                  </>
                ) : null}
              </p>
              <details className="dv3-receipt">
                <summary>Why this is shown this way</summary>
                <p>{field.basis}</p>
                <Sources sources={field.sources} />
              </details>
            </dd>
          </div>
        ))}
      </dl>
      {card.analogy ? (
        <div className="dv3-analogy">
          <p>
            <strong>One way to picture it:</strong> {card.analogy.text}
          </p>
          <p>
            <strong>Where this breaks:</strong> {card.analogy.breaks}
          </p>
        </div>
      ) : null}
      <details className="dv3-glossary">
        <summary>What the status words on this card mean</summary>
        <dl>
          {stateGlossary.map((state) => (
            <div key={state.code}>
              <dt>{state.label}</dt>
              <dd>{state.plain}</dd>
            </div>
          ))}
        </dl>
      </details>
      <p className="dv3-note">
        Nothing on this page is medical advice, and nothing here says the substance is suitable for
        children.
      </p>
    </section>
  )
}

function GoalLens({ model }: { model: DossierV3ViewModel }) {
  return (
    <fieldset className="dv3-goals">
      <legend>Pick your goal</legend>
      <p className="dv3-goals-help">
        A goal filters what this page shows. It does not change the underlying record.
      </p>
      <div className="dv3-goal-options">
        <label>
          <input defaultChecked name="dv3-goal" type="radio" value="all" />
          All goals
        </label>
        {model.goals.map((goal) => (
          <label key={goal.code}>
            <input name="dv3-goal" type="radio" value={goal.code} />
            {goal.label}
            <span className="dv3-goal-basis">
              {goal.basis === 'reviewed' ? ' · reviewed claim' : ' · registered studies only'}
            </span>
          </label>
        ))}
      </div>
      {model.goals.length === 0 ? (
        <p className="dv3-goals-none">
          No reviewed claim names a goal for this substance, and no registered study lists a
          condition RNAWiki maps to one.
        </p>
      ) : (
        <details className="dv3-receipt">
          <summary>Which registered conditions put each goal here</summary>
          <dl>
            {model.goals.map((goal) => (
              <div key={goal.code}>
                <dt>{goal.label}</dt>
                <dd>
                  {goal.conditions.length > 0
                    ? goal.conditions.join('; ')
                    : 'A reviewed claim names this goal.'}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </fieldset>
  )
}

function DeepEvidence({ corpus, model }: { corpus: CorpusDossier; model: DossierV3ViewModel }) {
  const answers = corpus.blocks.filter((block) => block.block !== 'supervision')
  return (
    <section
      aria-labelledby="deep-evidence-h"
      className="dv3-section dv3-deep"
      data-corpus-block="deep-evidence"
      id="deep-evidence"
    >
      <h2 id="deep-evidence-h">Deep evidence</h2>
      <p className="dv3-lede">
        The record as stored, for a reader who wants to audit it: registered studies, recorded
        values, identifiers, relations and every source. Technical vocabulary lives here and nowhere
        above.
      </p>
      <TruthPattern
        know={`${corpus.sources.length} source rows and ${answers.length} recorded evidence blocks are stored for this record.`}
        how="Each block names its source and the date it was recorded and last checked."
        notKnow="A stored value is what a source printed. It is not a reviewed conclusion."
        matters="Reviewers work from these rows; a reader can check any sentence above against them."
      />
      <details className="dv3-deep-group" open>
        <summary>Where it is registered</summary>
        <RegistrationBlock
          events={corpus.registerEvents}
          registration={corpus.registration}
          schedules={corpus.controlledSchedules}
        />
      </details>
      <details className="dv3-deep-group">
        <summary>Recorded evidence blocks ({answers.length})</summary>
        <div className="cd-root dv3-embedded-corpus">
          {answers.map((block) => (
            <QuestionBlock
              block={block}
              key={block.id}
              name={corpus.displayName}
              {...(LADDER_BLOCKS.has(block.block) ? { ladder: corpus.ladder } : {})}
            />
          ))}
        </div>
      </details>
      <details className="dv3-deep-group">
        <summary>Identity, identifiers and relations</summary>
        <div className="cd-root dv3-embedded-corpus">
          <ExactRecord identifiers={corpus.identifiers} />
          <RelationsRows notes={corpus.relationNotes} relations={corpus.relations} />
          <HubRows hubs={corpus.hubs} />
          <dl className="dv3-synonyms">
            {corpus.synonyms.map((group) => (
              <div key={group.kind}>
                <dt>{group.label}</dt>
                <dd>{group.names.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </div>
      </details>
      <details className="dv3-deep-group">
        <summary>Sources ({corpus.sources.length})</summary>
        <div className="cd-root dv3-embedded-corpus">
          <SourceList licenceNotes={corpus.licenceNotes} sources={corpus.sources} />
        </div>
      </details>
      <details className="dv3-deep-group">
        <summary>Index-quality gate</summary>
        <ul className="dv3-gate">
          {model.indexQuality.map((check) => (
            <li data-passed={check.passed ? 'true' : 'false'} key={check.check}>
              <span aria-hidden="true">{check.passed ? '✓' : '✗'}</span>{' '}
              {check.check.replace(/_/g, ' ')}: {check.detail}
            </li>
          ))}
        </ul>
      </details>
      <details className="dv3-deep-group">
        <summary>Outcome and evidence classes used on this page</summary>
        <dl>
          {OUTCOME_CLASSES.map((entry) => (
            <div key={entry.code}>
              <dt>
                {entry.letter}. {entry.label}
              </dt>
              <dd>{entry.plain}</dd>
            </div>
          ))}
          {EVIDENCE_CLASSES.map((entry) => (
            <div key={entry.code}>
              <dt>{entry.label}</dt>
              <dd>{entry.plain}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  )
}

export function DossierV3Page({
  corpus,
  model,
}: {
  corpus: CorpusDossier
  model: DossierV3ViewModel
}) {
  return (
    <div className="dv3-root" data-dossier-version="3">
      <header className="dv3-header">
        <h1>{model.name}</h1>
        <p className="dv3-header-line">
          {model.substanceType.label} · {model.supervision.text}
        </p>
      </header>
      <Navigator model={model} />
      <div className="dv3-body">
        <DecisionCard model={model} />
        <GoalLens model={model} />
        <DoesItWorkSection model={model} />
        <MechanismSection model={model} />
        <SafetySection model={model} />
        <InteractionsSection model={model} />
        <ApplicabilitySection model={model} />
        <MeasureSection model={model} />
        <AlternativesSection model={model} />
        <UnknownsSection model={model} />
        <DeepEvidence corpus={corpus} model={model} />
        <WhatChangedSection model={model} />
        <TeachBackSection model={model} />
      </div>
    </div>
  )
}
