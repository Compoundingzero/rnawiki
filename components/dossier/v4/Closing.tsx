/**
 * The closing sections: other routes to the same goal, claims that go past the evidence, what
 * nobody knows, the receipts, how the medicine got here, what changed, the one question worth
 * reading next, and an account of the sections this page had nothing for.
 *
 * A "What people report" lane used to render here. It described how community reports would be
 * ordered and weighed, above a list of empty categories, on every one of 10,250 pages — 1,458
 * characters, identical everywhere, for a feature that does not exist. A promise is not a record,
 * and a reader looking for what is known about a medicine was being shown a roadmap instead. It is
 * gone. When RNAWiki does collect reports, the lane comes back with reports in it.
 */
import type { ReactNode } from 'react'

import type { DossierV4ViewModel } from '@/lib/dossier-v4/view-model'

import { absencePhrase, sectionIsHidden } from '@/lib/dossier-v4/section-visibility'

import { Absence, Disclosure, RecordedFactList, SectionFrame } from './Primitives'

export function AlternativesLadder({
  alternatives,
}: {
  alternatives: DossierV4ViewModel['alternatives']
}): ReactNode {
  return (
    <SectionFrame
      id="alternatives"
      label="Other ways to the same goal"
      lane="personal_reality"
      lede="Ordered by how much oversight each needs, not by which is best. RNAWiki has not compared these against each other."
      state={alternatives.state}
    >
      <ul className="dv4-ladder">
        {alternatives.entries.map((entry, index) => (
          <li data-tier={entry.tier} key={`${entry.label}-${index}`}>
            <div>
              <p className="dv4-ladder-tier" style={{ marginBottom: 0 }}>
                {entry.tierLabel}
              </p>
            </div>
            <div>
              <p style={{ marginBottom: '0.2rem' }}>
                {entry.path ? <a href={entry.path}>{entry.label}</a> : entry.label}
              </p>
              <p className="dv4-note" style={{ marginBottom: 0 }}>
                {entry.humanEvidence} {entry.uncertainty}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="dv4-callout">
        <p>{alternatives.note}</p>
      </div>
    </SectionFrame>
  )
}

export function ClaimDecoder({
  decoder,
}: {
  decoder: DossierV4ViewModel['claimDecoder']
}): ReactNode {
  return (
    <SectionFrame
      id="claim-decoder"
      label="Claims that go past the evidence"
      lane="uncertainty"
      lede="Things said about this substance that sound reasonable, and the exact step that is missing between the evidence and the claim."
      state={decoder.state}
    >
      {decoder.claims.length === 0 ? (
        <Absence reason={decoder.absence} state={decoder.state} />
      ) : (
        <div className="dv4-bands">
          {decoder.claims.map((claim, index) => (
            <div className="dv4-band" data-position={claim.position} key={index}>
              <div className="dv4-band-head">
                <span className="dv4-state" data-tone="caution">
                  <span aria-hidden="true" className="dv4-state-glyph">
                    ✗
                  </span>
                  {claim.positionLabel}
                </span>
              </div>
              <p style={{ fontWeight: 500 }}>{claim.popularClaim}</p>
              <p className="dv4-note">
                <strong>Why it sounds right.</strong> {claim.whyPlausible}
              </p>
              <p className="dv4-note">
                <strong>The missing step.</strong> {claim.missingStep}
              </p>
              <Disclosure summary="What would change this">
                <p>{claim.whatWouldChangeIt}</p>
                <p className="dv4-note">{claim.reviewedScope}</p>
              </Disclosure>
            </div>
          ))}
        </div>
      )}
    </SectionFrame>
  )
}

export function UnknownMap({ unknowns }: { unknowns: DossierV4ViewModel['unknowns'] }): ReactNode {
  return (
    <SectionFrame
      id="unknowns"
      label="What nobody knows yet"
      lane="uncertainty"
      lede="Open questions, each with why it is open and what would close it."
      state={unknowns.state}
    >
      {unknowns.entries.length === 0 ? (
        <Absence
          reason="RNAWiki has not worked out which questions are open on this record."
          state={unknowns.state}
        />
      ) : (
        <div className="dv4-two">
          {unknowns.entries.map((entry, index) => (
            <div className="dv4-panel" key={`${entry.question}-${index}`}>
              <h3>{entry.question}</h3>
              <p className="dv4-panel-note">{entry.reason}</p>
              <p style={{ fontSize: '0.88rem' }}>
                <strong>Why it matters.</strong> {entry.whyItMatters}
              </p>
              <Disclosure summary="What would answer it">
                <p>{entry.evidenceNeeded}</p>
                <p className="dv4-note">
                  Last checked {entry.lastChecked}. Searched: {entry.searchScope}
                </p>
              </Disclosure>
            </div>
          ))}
        </div>
      )}
    </SectionFrame>
  )
}

export function EvidenceReceipts({
  receipts,
  gates,
}: {
  receipts: DossierV4ViewModel['receipts']
  gates: DossierV4ViewModel['gates']
}): ReactNode {
  return (
    <SectionFrame
      id="evidence-receipts"
      label="Check any of this yourself"
      lane="human_result"
      lede="Every line above traced back to the study it came from. This is the technical layer, and the vocabulary changes here."
      state={receipts.state}
    >
      {receipts.entries.length === 0 && receipts.identifiers.length === 0 ? (
        <Absence
          reason="No traced study record is stored for this substance."
          state={receipts.state}
        />
      ) : null}
      {receipts.entries.length === 0 ? null : (
        <>
          <p>{receipts.note}</p>
          {receipts.entries.map((entry) => (
            <Disclosure key={entry.id} summary={entry.structuredClaim}>
              <dl className="dv4-facts">
                <dt>In plain words</dt>
                <dd>{entry.plainConclusion}</dd>
                <dt>What was measured</dt>
                <dd>{entry.measuredMetric}</dd>
                <dt>Effect estimate</dt>
                <dd>{entry.effectEstimate}</dd>
                <dt>Limits</dt>
                <dd>{entry.limitations}</dd>
                <dt>From the source</dt>
                <dd>{entry.sourceExcerpt}</dd>
                <dt>Source</dt>
                <dd>
                  {entry.doi ? (
                    <a
                      href={`https://doi.org/${entry.doi}`}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      {entry.sourceReference}
                    </a>
                  ) : (
                    entry.sourceReference
                  )}
                </dd>
                <dt>Role in the trial</dt>
                <dd>{entry.trialRole}</dd>
                <dt>Identity check</dt>
                <dd>{entry.entityResolution}</dd>
                <dt>Audit mark</dt>
                <dd>{entry.auditFlag}</dd>
                <dt>Review state</dt>
                <dd>{entry.reviewState}</dd>
              </dl>
            </Disclosure>
          ))}
        </>
      )}

      <RecordedFactList facts={receipts.corroboration} heading="How many documents were read" />

      {receipts.identifiers.length > 0 ? (
        <>
          {/*
            The registers this substance is listed in, with its number in each. These are how a
            reader looks the same substance up somewhere that is not RNAWiki, which is the point of
            a receipt: the page should be checkable by someone who does not trust it.
          */}
          <h3 style={{ marginTop: '1.75rem' }}>Where else this substance is registered</h3>
          <dl className="dv4-facts">
            {receipts.identifiers.map((identifier) => (
              <div key={identifier.label}>
                <dt>{identifier.label}</dt>
                <dd>{identifier.value}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}

      <h3 style={{ marginTop: '1.75rem' }}>Checks this page had to pass</h3>
      <ul className="dv4-ladder">
        {gates.map((gate) => (
          <li data-gate={gate.code} data-passed={gate.passed ? 'true' : 'false'} key={gate.code}>
            <div>
              <p className="dv4-ladder-tier" style={{ marginBottom: 0 }}>
                <span aria-hidden="true">{gate.passed ? '✓' : '✗'}</span>{' '}
                {gate.passed ? 'Passed' : 'Not passed'}
              </p>
            </div>
            <div>
              <p style={{ marginBottom: '0.1rem' }}>{gate.label}</p>
              <p className="dv4-note" style={{ marginBottom: 0 }}>
                {gate.detail}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SectionFrame>
  )
}

export function DrugStory({ story }: { story: DossierV4ViewModel['story'] }): ReactNode {
  return (
    <SectionFrame
      id="drug-story"
      label="How this medicine reached us"
      lane="uncertainty"
      lede="Kept near the foot of the page. A historical event moves up only when it changes something about this substance today."
      state={story.state}
    >
      {story.entries.length === 0 && story.regulatory.length === 0 ? (
        <Absence reason="No history is recorded for this substance." state={story.state} />
      ) : null}
      {story.entries.length > 0 ? (
        <ol className="dv4-spine">
          {story.entries.map((entry, index) => (
            <li data-known={entry.changesToday ? 'true' : 'false'} key={index}>
              <p style={{ marginBottom: 0 }}>
                {entry.when ? <span className="dv4-spine-label">{entry.when}. </span> : null}
                {entry.what}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
      {/*
        For a discontinued medicine this is usually the only part of the page with anything in it.
        The label is withdrawn from the archive; the approval stays on the register.
      */}
      <RecordedFactList facts={story.regulatory} heading="What the approval register records" />
    </SectionFrame>
  )
}

export function ChangeHistory({ changes }: { changes: DossierV4ViewModel['changes'] }): ReactNode {
  return (
    <SectionFrame
      id="change-history"
      label="What changed on this page"
      lane="uncertainty"
      lede="Every correction is recorded, including the ones that did not change what the page concludes."
      state={changes.state}
    >
      {changes.entries.length === 0 ? (
        <Absence reason="Nothing has been corrected on this record." state={changes.state} />
      ) : (
        <ol className="dv4-spine">
          {changes.entries.map((entry, index) => (
            <li data-known={entry.alteredPublicConclusion ? 'true' : 'false'} key={index}>
              <p style={{ marginBottom: '0.1rem' }}>
                <span className="dv4-spine-label">{entry.when}.</span> {entry.text}
              </p>
              <p className="dv4-note" style={{ marginBottom: 0 }}>
                {entry.alteredPublicConclusion
                  ? 'This changed what the page says.'
                  : 'This did not change what the page says.'}
              </p>
              {entry.fullText !== entry.text ? (
                <Disclosure summary="The full recorded explanation" technical>
                  <p>{entry.fullText}</p>
                </Disclosure>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </SectionFrame>
  )
}

export function NextQuestionRail({
  questions,
}: {
  questions: DossierV4ViewModel['nextQuestions']
}): ReactNode {
  return (
    <SectionFrame
      id="next-question"
      label="What to learn next"
      lane="uncertainty"
      lede="Ordered by what would most change how you read this page, starting with what is easiest to misunderstand."
      state="source_checked_draft"
    >
      <ul className="dv4-next">
        {questions.map((question) => (
          <li key={question.question}>
            <a href={question.target}>
              {question.question}
              <span className="dv4-next-why">{question.objective}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="dv4-note">
        This order is fixed in code and does not count clicks or time on the page.
      </p>
    </SectionFrame>
  )
}

/**
 * The sections this page had nothing for.
 *
 * Every section the compass skipped is named here with the reason it was skipped, so a reader can
 * see the shape of what is missing without scrolling through eighteen headings that each say
 * "nothing found". The three reasons are kept apart, because a question nobody has studied, a
 * question that does not apply to this kind of substance, and a question RNAWiki has not built the
 * machinery for are three different facts about the record.
 *
 * If this list is empty the block does not render, which on a well-filled medicine is the correct
 * outcome: nothing is missing, so nothing is said.
 */
export function WhatIsMissing({
  sections,
}: {
  sections: DossierV4ViewModel['sections']
}): ReactNode {
  const hidden = sections.filter((section) => sectionIsHidden(section.id, section.state))
  if (hidden.length === 0) return null
  return (
    <section
      aria-labelledby="what-is-missing-h"
      className="dv4-section"
      data-compass-lane="uncertainty"
      data-lane="uncertainty"
      id="what-is-missing"
    >
      <p className="dv4-eyebrow">
        <span>What is not here</span>
      </p>
      <h2 id="what-is-missing-h">
        {hidden.length} {hidden.length === 1 ? 'question this page' : 'questions this page'} could
        not answer
      </h2>
      <p className="dv4-lede">
        These sections were prepared and left out because there was nothing to put in them. They are
        listed rather than hidden, so the gaps in this record are visible.
      </p>
      <ul className="dv4-missing">
        {hidden.map((section) => (
          <li data-section={section.id} data-state={section.state} key={section.id}>
            <strong>{section.label}</strong> — {absencePhrase(section.state)}.
          </li>
        ))}
      </ul>
    </section>
  )
}
