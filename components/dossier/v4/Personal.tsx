/**
 * The sections about a person rather than about a study: who was studied, why it might seem to do
 * nothing, what taking it involves, what can go wrong, what it may clash with, whether the exact
 * form matters, and what could sensibly be measured.
 *
 * Two safety rules shape this file. The measurement section renders a self-experiment plan only
 * where the view model has already decided the substance is low-risk and non-prescription; on
 * anything supervised it renders clinician questions instead, and neither branch ever carries an
 * amount. And the clash map has no state that means the pair is fine.
 */
import type { ReactNode } from 'react'

import type { DossierV4ViewModel } from '@/lib/dossier-v4/view-model'

import {
  Absence,
  Disclosure,
  SectionFrame,
  Sources,
  StatementBlock,
  TruthLines,
} from './Primitives'

export function ApplicabilityMirror({
  applicability,
}: {
  applicability: DossierV4ViewModel['applicability']
}): ReactNode {
  return (
    <SectionFrame
      id="applicability"
      label="Were people like you studied?"
      lane="uncertainty"
      lede="RNAWiki cannot tell whether a study fits you. It can show who was in it, and where the result stops carrying."
      state={applicability.state}
    >
      <div className="dv4-two">
        <div className="dv4-panel">
          <h3>Who was studied</h3>
          {applicability.included.length === 0 ? (
            <p className="dv4-note">No description of who was studied is recorded.</p>
          ) : (
            <>
              <p className="dv4-panel-note">{applicability.includedLine}</p>
              <ul>
                {applicability.included.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="dv4-panel">
          <h3>Who is missing from the studies</h3>
          {applicability.underrepresented.length === 0 ? (
            <p className="dv4-note">
              RNAWiki holds no record of which groups are missing from these studies.
            </p>
          ) : (
            <ul>
              {applicability.underrepresented.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {applicability.transferLimits.length > 0 ? (
        <>
          <h3 style={{ marginTop: '1.5rem' }}>Where the result stopped carrying</h3>
          <ul>
            {applicability.transferLimits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </>
      ) : null}

      <div className="dv4-callout">
        <p>{applicability.cannotSayLine}</p>
      </div>
    </SectionFrame>
  )
}

export function NoResponseMap({
  noResponse,
}: {
  noResponse: DossierV4ViewModel['noResponse']
}): ReactNode {
  const applies = noResponse.entries.filter((entry) => entry.applies)
  const rest = noResponse.entries.filter((entry) => !entry.applies)
  return (
    <SectionFrame
      id="no-response"
      label="Why it might seem to do nothing"
      lane="personal_reality"
      lede="A real effect and a noticed effect are different things. These are the recorded reasons the two come apart."
      state={noResponse.state}
    >
      <div className="dv4-bands">
        {applies.map((entry) => (
          <div className="dv4-band" data-reason={entry.code} key={entry.code}>
            <div className="dv4-band-head">
              <strong>{entry.label}</strong>
            </div>
            <p>{entry.plain}</p>
            <p className="dv4-note" style={{ marginBottom: 0 }}>
              On this record: {entry.basis}
            </p>
          </div>
        ))}
      </div>
      {rest.length > 0 ? (
        <Disclosure
          summary={`Other reasons RNAWiki checked and found nothing for (${rest.length})`}
        >
          <dl>
            {rest.map((entry) => (
              <div key={entry.code}>
                <dt>
                  <strong>{entry.label}</strong>
                </dt>
                <dd style={{ marginBottom: '0.5rem' }}>
                  {entry.plain} {entry.basis}
                </dd>
              </div>
            ))}
          </dl>
        </Disclosure>
      ) : null}
      <div className="dv4-callout">
        <p>{noResponse.note}</p>
      </div>
    </SectionFrame>
  )
}

export function PracticalReality({
  practical,
}: {
  practical: DossierV4ViewModel['practical']
}): ReactNode {
  const rows = [
    { label: 'How it is supplied', statement: practical.availability },
    { label: 'Form and route', statement: practical.route },
    { label: 'Who oversees it', statement: practical.burden },
    { label: 'What is in the pack', statement: practical.productQuality },
    { label: 'Where it is registered', statement: practical.regulatory },
    { label: 'Why people stop', statement: practical.discontinuation },
  ]
  return (
    <SectionFrame
      id="practical-reality"
      label="What taking it involves"
      lane="personal_reality"
      lede="The recorded facts about getting hold of it and using it. Nothing here is a suggestion about what you should do."
      state={practical.state}
    >
      <div className="dv4-two">
        {rows.map((row) => (
          <div className="dv4-panel" key={row.label}>
            <h3>{row.label}</h3>
            <StatementBlock statement={row.statement} />
          </div>
        ))}
      </div>
    </SectionFrame>
  )
}

export function SafetyMap({ safety }: { safety: DossierV4ViewModel['safety'] }): ReactNode {
  return (
    <SectionFrame
      id="safety"
      label="What can go wrong"
      lane="personal_reality"
      lede="Sorted by where each line came from. A regulator's label and a report somebody sent in are not the same kind of fact."
      state={safety.state}
    >
      {safety.entries.length === 0 ? (
        <Absence
          reason="No harm is recorded against this substance in the sources RNAWiki checked. Finding nothing is not the same as showing there is nothing."
          state={safety.state}
        />
      ) : (
        <div className="dv4-bands">
          {safety.entries.map((entry, index) => (
            <div
              className="dv4-band"
              data-action={entry.action}
              data-urgent={entry.urgent ? 'true' : 'false'}
              key={`${entry.evidenceSource}-${index}`}
            >
              <div className="dv4-band-head">
                <span className="dv4-state" data-tone="muted">
                  <span aria-hidden="true" className="dv4-state-glyph">
                    {entry.urgent ? '!' : '·'}
                  </span>
                  {entry.actionLabel}
                </span>
                <span className="dv4-note">{entry.evidenceSourcePlain}</span>
              </div>
              <p>{entry.text}</p>
              {!entry.denominatorKnown ? (
                <p className="dv4-note" style={{ marginBottom: 0 }}>
                  Nobody counted how many people took this and were fine, so this cannot be turned
                  into a rate.
                </p>
              ) : null}
              {entry.sources.length > 0 ? (
                <Disclosure summary="Where this came from">
                  <Sources sources={entry.sources} />
                </Disclosure>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {safety.spontaneous ? (
        <div className="dv4-panel" style={{ marginTop: '1.25rem' }}>
          <h3>Reports sent to a regulator</h3>
          <ul>
            {safety.spontaneous.framing.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p>{safety.spontaneous.text}</p>
          <Disclosure summary={`The recorded terms (${safety.spontaneous.terms.length})`}>
            <ul>
              {safety.spontaneous.terms.slice(0, 25).map((term) => (
                <li key={term.term}>
                  {term.term} — {term.count} reaction mentions
                </li>
              ))}
            </ul>
            <Sources sources={safety.spontaneous.sources} />
          </Disclosure>
        </div>
      ) : null}

      <div className="dv4-two">
        <div className="dv4-callout" style={{ marginTop: '1rem' }}>
          <p>
            <strong>Over a long time.</strong> {safety.longTerm}
          </p>
        </div>
        <div className="dv4-callout" style={{ marginTop: '1rem' }}>
          <p>
            <strong>Groups the studies covered thinly.</strong> {safety.underrepresented}
          </p>
        </div>
      </div>
    </SectionFrame>
  )
}

export function StackCollisionMap({ stack }: { stack: DossierV4ViewModel['stack'] }): ReactNode {
  return (
    <SectionFrame
      id="stack"
      label="What it may clash with"
      lane="personal_reality"
      lede="Pairs that a stored source says something about. Most pairs of substances have never been studied together at all."
      state={stack.state}
    >
      <p>{stack.absenceLine}</p>
      <div className="dv4-callout">
        <p>
          <strong>{stack.neverSafeLine}</strong>
        </p>
        <p className="dv4-note" style={{ marginBottom: 0 }}>
          {stack.localOnly}
        </p>
      </div>

      {stack.entries.length === 0 ? (
        // Not `absenceLine` again: it is already the first paragraph of this section, and printing
        // the same sentence three times reads as a page arguing with itself.
        <Absence
          reason="No pair involving this substance is recorded at all. Most pairs of substances have never been studied together."
          state={stack.state}
        />
      ) : (
        <ul className="dv4-ladder" style={{ marginTop: '1.25rem' }}>
          {stack.entries.map((entry, index) => (
            <li data-state={entry.state} key={`${entry.entityB}-${index}`}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.15rem' }}>
                  {entry.entityA} + {entry.entityB}
                </p>
                <p className="dv4-ladder-tier" style={{ marginBottom: 0 }}>
                  {entry.stateLabel}
                </p>
              </div>
              <div>
                <p>{entry.consequence}</p>
                <Disclosure summary="What is recorded, and what is not">
                  <dl className="dv4-facts">
                    <dt>Kind of evidence</dt>
                    <dd>{entry.evidenceClass}</dd>
                    <dt>Context</dt>
                    <dd>{entry.context}</dd>
                    <dt>Checked on</dt>
                    <dd>{entry.checkedOn}</dd>
                    <dt>Not recorded</dt>
                    <dd>{entry.missingInformation}</dd>
                    <dt>Question to ask</dt>
                    <dd>{entry.clinicianQuestion}</dd>
                  </dl>
                  <Sources sources={entry.sources} />
                </Disclosure>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionFrame>
  )
}

export function FormRealityCheck({
  formCheck,
}: {
  formCheck: DossierV4ViewModel['formCheck']
}): ReactNode {
  return (
    <SectionFrame
      id="form-check"
      label="Does the exact form matter?"
      lane="uncertainty"
      lede="Evidence belongs to the exact thing that was tested. A different salt, a different mixture or a different preparation is a different question."
      state={formCheck.state}
    >
      <div className="dv4-two">
        <div className="dv4-panel">
          <h3>The form that was studied</h3>
          <StatementBlock statement={formCheck.exactFormStudied} />
        </div>
        <div className="dv4-panel">
          <h3>What is sold</h3>
          <StatementBlock statement={formCheck.marketedForms} />
        </div>
      </div>

      <div className="dv4-callout">
        <p>{formCheck.equivalenceEvidence.text}</p>
      </div>

      {formCheck.entries.length > 0 ? (
        <>
          <h3 style={{ marginTop: '1.5rem' }}>Names and forms linked to this record</h3>
          <ul className="dv4-ladder">
            {formCheck.entries.map((entry, index) => (
              <li
                data-carries={entry.carriesEvidence ? 'true' : 'false'}
                data-relation={entry.relation}
                key={`${entry.counterpart}-${index}`}
              >
                <div>
                  <p className="dv4-ladder-tier" style={{ marginBottom: 0 }}>
                    <span aria-hidden="true">{entry.carriesEvidence ? '=' : '≠'}</span>{' '}
                    {entry.relationLabel}
                  </p>
                </div>
                <div>
                  <p style={{ marginBottom: '0.1rem' }}>
                    {entry.counterpartSlug ? (
                      <a href={`/d/${entry.counterpartSlug}`}>{entry.counterpart}</a>
                    ) : (
                      entry.counterpart
                    )}
                  </p>
                  <p className="dv4-note" style={{ marginBottom: 0 }}>
                    {entry.note}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {formCheck.corrections.length > 0 ? (
        <div className="dv4-panel" style={{ marginTop: '1.5rem' }}>
          <h3>Identity mistakes that were found and fixed</h3>
          <p className="dv4-panel-note">
            RNAWiki records every correction rather than quietly rewriting the record.
          </p>
          <ul>
            {formCheck.corrections.map((correction, index) => (
              <li key={`${correction.what}-${index}`}>
                <strong>{correction.when}</strong> — {correction.what}. {correction.why}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SectionFrame>
  )
}

export function MeasurementCoach({
  measurement,
}: {
  measurement: DossierV4ViewModel['measurement']
}): ReactNode {
  const isSelfExperiment = measurement.mode === 'self_experiment'
  return (
    <SectionFrame
      id="measurement"
      label="What you could measure"
      lane="personal_reality"
      lede={
        isSelfExperiment
          ? 'Watching one thing carefully can tell you whether it moved. It cannot tell you what moved it.'
          : 'This one is decided with a clinician, so this section holds questions to ask rather than a plan to run.'
      }
      state={measurement.state}
    >
      <p>{measurement.reason}</p>

      {isSelfExperiment ? (
        <>
          <ol className="dv4-spine" data-block="self-experiment-plan">
            {measurement.plan.map((step) => (
              <li data-known="true" key={step.label}>
                <p style={{ marginBottom: 0 }}>
                  <span className="dv4-spine-label">{step.label}.</span> {step.text}
                </p>
              </li>
            ))}
          </ol>
          <div className="dv4-two">
            <div className="dv4-panel">
              <h3>What not to measure</h3>
              <ul>
                {measurement.whatNotToMeasure.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="dv4-panel">
              <h3>When to stop</h3>
              <ul>
                {measurement.stopRules.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="dv4-panel" data-block="clinician-questions">
          <h3>Questions worth asking</h3>
          <ul>
            {measurement.clinicianQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
          {measurement.warningSigns.length > 0 ? (
            <>
              <h3 style={{ marginTop: '1rem' }}>Recorded warning signs</h3>
              <ul>
                {measurement.warningSigns.map((sign) => (
                  <li key={sign.text}>{sign.text}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      )}

      <div className="dv4-callout">
        <p>{measurement.boundary}</p>
        <p style={{ marginBottom: 0 }}>
          <strong>{measurement.noDoseLine}</strong>
        </p>
      </div>
    </SectionFrame>
  )
}
