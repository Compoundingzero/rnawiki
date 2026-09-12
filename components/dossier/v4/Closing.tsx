/**
 * The closing sections: other routes to the same goal, claims that go past the evidence, the
 * community lane, what nobody knows, the receipts, how the medicine got here, what changed, and
 * the one question worth reading next.
 *
 * The community lane renders before any report exists, on purpose. An empty lane with its rules
 * visible is a promise about how reports will be treated; a lane that appears only once it is full
 * of favourable reports is an advert.
 */
import type { ReactNode } from 'react'

import { COMMUNITY_REPORT_CATEGORIES } from '@/lib/dossier-v4/taxonomy'
import type { DossierV4ViewModel } from '@/lib/dossier-v4/view-model'

import { Absence, Disclosure, SectionFrame } from './Primitives'

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

export function CommunityExperienceLane({
  community,
}: {
  community: DossierV4ViewModel['community']
}): ReactNode {
  return (
    <SectionFrame
      id="community"
      label="What people report"
      lane="community_experience"
      lede="Reports from people who took it, kept in their own lane and never counted as evidence."
      state={community.state}
    >
      <p>{community.separationLine}</p>
      <p className="dv4-note">{community.noImportLine}</p>

      <Absence
        reason="RNAWiki is not yet collecting reports. The lane is built, and it is empty."
        state={community.state}
      />

      <h3 style={{ marginTop: '1.5rem' }}>The kinds of report this lane will hold</h3>
      <p className="dv4-note">
        A lane that holds only the good outcomes is an advert. These are the categories, in the
        order they were written, and four of them are for things going wrong.
      </p>
      <ul className="dv4-ladder">
        {COMMUNITY_REPORT_CATEGORIES.map((category) => (
          <li data-category={category.code} key={category.code}>
            <div>
              <p className="dv4-ladder-tier" style={{ marginBottom: 0 }}>
                {category.label}
              </p>
            </div>
            <div>
              <p className="dv4-note" style={{ marginBottom: 0 }}>
                Nothing recorded yet.
              </p>
            </div>
          </li>
        ))}
      </ul>

      <Disclosure summary="How reports will be ordered, and how they will not be">
        <p>Reports will be ordered on:</p>
        <ul>
          {community.qualitySignals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
        <p>
          They will not be ordered by how positive they are, and no amount anybody reports will ever
          be added up into a suggestion.
        </p>
      </Disclosure>
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
      {receipts.entries.length === 0 ? (
        <Absence
          reason="No traced study record is stored for this substance."
          state={receipts.state}
        />
      ) : (
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
      {story.entries.length === 0 ? (
        <Absence reason="No history is recorded for this substance." state={story.state} />
      ) : (
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
      )}
    </SectionFrame>
  )
}

/**
 * Wordings members replaced, beneath the record's own correction history.
 *
 * Two different things changed a page and both belong here, told apart rather than merged: a
 * correction changed what the record holds, and a review changed how a sentence puts it. Nothing
 * private appears — not the reviewers' names, not what they declared, not the qualification records
 * themselves, only whether one of them was relevant to the claim.
 */
function WordingHistory({ history }: { history: DossierV4ViewModel['wordingHistory'] }): ReactNode {
  if (history.length === 0) return null
  return (
    <div style={{ marginTop: '1.25rem' }}>
      <p className="dv4-eyebrow">
        <span>Wording members changed</span>
      </p>
      <ol className="dv4-spine">
        {history.map((entry, index) => (
          <li data-known="false" key={`${entry.statementKey}-${index}`}>
            <p style={{ marginBottom: '0.1rem' }}>
              <span className="dv4-spine-label">{entry.changedOn}.</span> {entry.label} changed from
              “{entry.previousText}” to “{entry.currentText}”.
            </p>
            <p className="dv4-note" style={{ marginBottom: 0 }}>
              {entry.reason} Approved by {entry.approvals} members
              {entry.qualifiedReviewerTookPart
                ? ', one with a relevant reviewer qualification verified'
                : ''}
              .{' '}
              {entry.state === 'published'
                ? 'This is the wording on the page now.'
                : entry.state === 'rolled_back'
                  ? 'It was rolled back, and the page shows the earlier wording again.'
                  : 'A later wording has replaced it.'}
              {entry.sourceChanged
                ? ' The record it was approved against has changed since, so the page shows what the record says rather than this wording.'
                : ''}
            </p>
          </li>
        ))}
      </ol>
      <p className="dv4-note" style={{ marginTop: '0.5rem' }}>
        Members agreeing on a wording changes the words, not what kind of evidence sits behind them.
      </p>
    </div>
  )
}

export function ChangeHistory({
  changes,
  wordingHistory,
}: {
  changes: DossierV4ViewModel['changes']
  wordingHistory: DossierV4ViewModel['wordingHistory']
}): ReactNode {
  return (
    <SectionFrame
      id="change-history"
      label="What changed on this page"
      lane="uncertainty"
      lede="Every correction is recorded, including the ones that did not change what the page concludes."
      state={changes.state}
    >
      {changes.entries.length === 0 && wordingHistory.length === 0 ? (
        <Absence reason="Nothing has been corrected on this record." state={changes.state} />
      ) : changes.entries.length === 0 ? null : (
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
      <WordingHistory history={wordingHistory} />
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
