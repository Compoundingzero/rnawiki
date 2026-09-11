/**
 * The middle sections of the dossier v3 page: Does it work?, How it works, Safety, Interactions,
 * For someone like me?, What to measure, Alternatives, Unknowns, What changed, and the one
 * optional teach-back check (docs/dossier-information-architecture.md).
 *
 * Server components only. Each section is a landmark with a heading, follows the truth pattern,
 * shows the simple explanation first and keeps technical detail inside native `<details>`.
 */
import type { DossierV3ViewModel } from '@/lib/dossier-v3/view-model'
import { EVIDENCE_CLASSES, completionStateLabel } from '@/lib/dossier-v3/taxonomy'

import { EvidenceLabel, Sources, TruthPattern } from './EvidenceLabel'

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={`${id}-h`} className="dv3-section" data-corpus-block={id} id={id}>
      <h2 id={`${id}-h`}>{title}</h2>
      {children}
    </section>
  )
}

function evidenceClassPlain(code: string): string | undefined {
  return EVIDENCE_CLASSES.find((entry) => entry.code === code)?.plain
}

/* ------------------------------------------------------------------ does it work */

export function DoesItWorkSection({ model }: { model: DossierV3ViewModel }) {
  const work = model.doesItWork
  return (
    <Section id="does-it-work" title="Does it work?">
      <p className="dv3-lede">
        Organised by goal, not by trial. Each result card says who was studied, what was measured
        and what kind of outcome it was. A biomarker and a health outcome are never shown as the
        same thing.
      </p>
      {work.byGoal.map((entry) => (
        <div className="dv3-goal-panel" data-goal={entry.goal} key={entry.goal}>
          <h3>{entry.goal === 'all' ? 'Across all goals' : entry.label}</h3>
          <p
            className={entry.conclusion.filled ? 'dv3-conclusion' : 'dv3-conclusion dv3-absent'}
            data-state={entry.conclusion.state}
          >
            {entry.conclusion.text}
          </p>
          {!entry.conclusion.filled ? (
            <details className="dv3-receipt">
              <summary>Why there is no conclusion here</summary>
              <p>{entry.conclusion.basis}</p>
            </details>
          ) : null}
          {entry.cards.length > 0 ? (
            <ol className="dv3-cards">
              {entry.cards.map((card) => (
                <li className="dv3-result-card" key={card.claimId}>
                  <p className="dv3-card-plain">{card.plain}</p>
                  <p className="dv3-card-labels">
                    <EvidenceLabel
                      code={card.outcomeClass}
                      label={`${card.outcomeLetter}. ${card.outcomeLabel}`}
                      tone="strong"
                    />{' '}
                    <EvidenceLabel
                      code={card.evidenceClass}
                      label={card.evidenceLabel}
                      plain={evidenceClassPlain(card.evidenceClass)}
                    />{' '}
                    <EvidenceLabel code={card.claimStrength} label={card.claimStrengthLabel} />
                  </p>
                  <details className="dv3-receipt">
                    <summary>More detail</summary>
                    <dl className="dv3-kv">
                      <div>
                        <dt>Question studied</dt>
                        <dd>{card.question}</dd>
                      </div>
                      <div>
                        <dt>Who was studied</dt>
                        <dd>
                          {card.population}
                          {card.participants ? ` (${card.participants} participants)` : ''}
                        </dd>
                      </div>
                      <div>
                        <dt>Comparator</dt>
                        <dd>{card.comparator}</dd>
                      </div>
                      <div>
                        <dt>Duration</dt>
                        <dd>{card.duration}</dd>
                      </div>
                      <div>
                        <dt>Formulation and route</dt>
                        <dd>{card.formulationRoute}</dd>
                      </div>
                      <div>
                        <dt>Baseline and follow-up</dt>
                        <dd>
                          {card.baseline}; {card.followUp}
                        </dd>
                      </div>
                      <div>
                        <dt>Absolute difference</dt>
                        <dd>{card.absoluteDifference}</dd>
                      </div>
                      <div>
                        <dt>Relative difference</dt>
                        <dd>{card.relativeDifference}</dd>
                      </div>
                      <div>
                        <dt>Confidence interval</dt>
                        <dd>{card.confidenceInterval}</dd>
                      </div>
                      <div>
                        <dt>Dropout or missing data</dt>
                        <dd>{card.dropout}</dd>
                      </div>
                      <div>
                        <dt>Replication</dt>
                        <dd>{card.replication}</dd>
                      </div>
                      <div>
                        <dt>Trial and role</dt>
                        <dd>
                          {card.trial ?? 'No single trial'}; role{' '}
                          {card.trialRole.replace(/_/g, ' ')}
                        </dd>
                      </div>
                      {card.applicabilityLimits.length > 0 ? (
                        <div>
                          <dt>Applicability limits</dt>
                          <dd>{card.applicabilityLimits.join(' ')}</dd>
                        </div>
                      ) : null}
                    </dl>
                    <details className="dv3-receipt">
                      <summary>Technical version</summary>
                      <p>{card.technical}</p>
                    </details>
                    <Sources sources={card.sources} />
                  </details>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ))}
      {work.registry ? (
        <div className="dv3-registry">
          <h3>Registered studies, by the substance’s role</h3>
          <p>{work.registry.text}</p>
          <dl className="dv3-kv">
            <div>
              <dt>Largest tested study</dt>
              <dd>{work.registry.largest}</dd>
            </div>
            <div>
              <dt>Longest completed study window</dt>
              <dd>{work.registry.longestWindow}</dd>
            </div>
            <div>
              <dt>Planned end dates set aside</dt>
              <dd>
                {work.registry.plannedIgnored} studies whose registered end lies after the snapshot
                are not counted as durations.
              </dd>
            </div>
          </dl>
          <p className="dv3-fine">
            A registration says what was planned, not what was found. Being named in a trial is not
            the same as being the treatment under test.
          </p>
          <Sources compact sources={work.registry.sources} />
        </div>
      ) : null}
      <details className="dv3-dimensions">
        <summary>Six dimensions, read separately (never one score)</summary>
        <dl className="dv3-kv">
          {work.dimensions.map((dimension) => (
            <div key={dimension.code}>
              <dt>{dimension.label}</dt>
              <dd>
                {dimension.value}
                <span className="dv3-fine"> {dimension.basis}</span>
              </dd>
            </div>
          ))}
        </dl>
      </details>
      <TruthPattern
        know={
          work.byGoal[0]?.conclusion.filled
            ? work.byGoal[0].conclusion.text
            : model.contract.noReviewedConclusionSentence
        }
        how={
          work.registry
            ? `Registered studies were classified by the substance’s role in each; only tested-treatment studies count towards “tested”.`
            : 'No registry classification is on this record yet.'
        }
        notKnow="What the tested trials found is not stated until a reviewed claim exists for that use."
        matters="A trial that names the substance as a comparison, background treatment or observed exposure does not show that the substance works."
      />
    </Section>
  )
}

/* ------------------------------------------------------------------ mechanism */

export function MechanismSection({ model }: { model: DossierV3ViewModel }) {
  const mechanism = model.mechanism
  return (
    <Section id="how-it-works" title="How it works">
      <p className="dv3-lede">
        A three-to-five-step story from the substance to an observed human outcome. Each step says
        where its evidence came from, and the story visibly breaks where evidence stops.
      </p>
      {mechanism.stages.length === 0 ? (
        <p className="dv3-absent" data-state={mechanism.state}>
          <EvidenceLabel
            code={mechanism.state}
            label={completionStateLabel(mechanism.state)}
            tone="muted"
          />{' '}
          {mechanism.stateText}
        </p>
      ) : (
        <ol className="dv3-stages">
          {mechanism.stages.map((stage, index) => (
            <li
              className={stage.supported ? 'dv3-stage' : 'dv3-stage dv3-stage-unsupported'}
              data-boundary={index === mechanism.boundary ? 'true' : undefined}
              key={stage.order}
            >
              {index === mechanism.boundary ? (
                <p className="dv3-boundary" role="note">
                  Evidence boundary: the steps below are inferred or predicted, not shown in an
                  experiment.
                </p>
              ) : null}
              <p className="dv3-stage-role">{stage.role.replace(/_/g, ' ')}</p>
              <p className="dv3-stage-simple">{stage.simple}</p>
              <p className="dv3-card-labels">
                <EvidenceLabel
                  code={stage.origin}
                  label={stage.originLabel}
                  tone={stage.supported ? 'strong' : 'caution'}
                />
              </p>
              <details className="dv3-receipt">
                <summary>Technical detail, scope and sources</summary>
                <p>{stage.technical}</p>
                <p>
                  <strong>Scope:</strong> {stage.scope}
                </p>
                <p>
                  <strong>Uncertainty:</strong> {stage.uncertainty}
                </p>
                <Sources sources={stage.sources} />
              </details>
            </li>
          ))}
        </ol>
      )}
      <div className="dv3-callout">
        <h3>What this does not prove</h3>
        <ul>
          {mechanism.doesNotProve.map((sentence) => (
            <li key={sentence}>{sentence}</li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ safety */

export function SafetySection({ model }: { model: DossierV3ViewModel }) {
  const safety = model.safety
  return (
    <Section id="safety" title="Safety">
      <p className="dv3-lede">
        Every item says which layer it comes from: a regulator’s label, a controlled trial, an
        observational study, a spontaneous report, a case report, a community report or a model.
        Layers are never mixed into one number.
      </p>
      {safety.items.length === 0 ? (
        <p className="dv3-absent" data-state={safety.state}>
          No label warning, contraindication or reviewed safety claim is recorded. This is not
          evidence of safety.
        </p>
      ) : (
        <ul className="dv3-safety">
          {safety.items.map((item, index) => (
            <li className="dv3-safety-item" data-layer={item.layer} key={`${item.kind}-${index}`}>
              <p className="dv3-card-labels">
                <EvidenceLabel
                  code={item.layer}
                  label={item.layerLabel}
                  plain={evidenceClassPlain(item.layer)}
                />{' '}
                <span className="dv3-kind">{item.kindLabel}</span>
                {!item.denominatorKnown ? (
                  <span className="dv3-fine">
                    {' '}
                    · no rate: the number of people exposed is not recorded
                  </span>
                ) : null}
              </p>
              <details className="dv3-receipt" open={item.kind === 'serious_warning'}>
                <summary>
                  {item.kind === 'serious_warning' ? 'Warning text' : 'Recorded text'}
                </summary>
                <p className="dv3-quote">{item.text}</p>
                <Sources sources={item.sources} />
              </details>
            </li>
          ))}
        </ul>
      )}
      {safety.spontaneous ? (
        <div className="dv3-spontaneous">
          <h3>Spontaneous reports</h3>
          <ol className="dv3-framing">
            {safety.spontaneous.framing.map((sentence) => (
              <li key={sentence}>{sentence}</li>
            ))}
          </ol>
          <p>{safety.spontaneous.text}</p>
          <details className="dv3-receipt">
            <summary>Reaction terms and mention counts</summary>
            <ul className="dv3-terms">
              {safety.spontaneous.terms.map((term) => (
                <li key={term.term}>
                  {term.term}: {term.count} mentions
                </li>
              ))}
            </ul>
            <Sources sources={safety.spontaneous.sources} />
          </details>
        </div>
      ) : null}
      <h3>Who was under-represented</h3>
      <p>{safety.underrepresented}</p>
      <h3>Long-term uncertainty</h3>
      <p>{safety.longTerm}</p>
      <TruthPattern
        know={
          safety.items.length > 0
            ? `${safety.items.length} recorded safety statements, each with its layer and source.`
            : 'No safety statement is recorded.'
        }
        how="Label sections are quoted as stored; reports are counted as mentions, never as rates."
        notKnow={safety.underrepresented}
        matters="A report count without a denominator cannot say how common a reaction is."
      />
    </Section>
  )
}

/* ------------------------------------------------------------------ interactions */

export function InteractionsSection({ model }: { model: DossierV3ViewModel }) {
  const interactions = model.interactions
  const visible = interactions.rows.filter((row) => !row.disclosed)
  const disclosed = interactions.rows.filter((row) => row.disclosed)
  return (
    <Section id="interactions" title="Interactions">
      <p className="dv3-lede">{interactions.statement}</p>
      <p className="dv3-callout-line">{interactions.notSafeSentence}</p>
      {visible.length > 0 ? (
        <ul className="dv3-interactions">
          {visible.map((row, index) => (
            <li data-category={row.category} key={`${row.counterpart}-${index}`}>
              <p className="dv3-card-labels">
                <EvidenceLabel
                  code={row.category}
                  label={row.categoryLabel}
                  tone={
                    row.category === 'plausible_mechanistic_limited_clinical' ? 'caution' : 'strong'
                  }
                />{' '}
                <EvidenceLabel
                  code={row.evidenceClass}
                  label={row.evidenceLabel}
                  plain={evidenceClassPlain(row.evidenceClass)}
                />
              </p>
              <p>
                {row.counterpartSlug ? (
                  <a href={`/d/${row.counterpartSlug}`}>{row.counterpart}</a>
                ) : (
                  row.counterpart
                )}
                {': '}
                {row.text}
              </p>
              {row.sourceUrl ? (
                <p className="dv3-fine">
                  <a href={row.sourceUrl} rel="noopener noreferrer">
                    Source
                  </a>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {disclosed.length > 0 ? (
        <details className="dv3-receipt">
          <summary>{disclosed.length} more recorded interaction lines</summary>
          <ul className="dv3-interactions">
            {disclosed.map((row, index) => (
              <li data-category={row.category} key={`${row.counterpart}-d-${index}`}>
                <EvidenceLabel code={row.category} label={row.categoryLabel} /> {row.counterpart}:{' '}
                {row.text}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <details className="dv3-receipt">
        <summary>The seven result categories a stack check can return</summary>
        <dl className="dv3-kv">
          {interactions.categories.map((category) => (
            <div key={category.code}>
              <dt>{category.label}</dt>
              <dd>{category.plain}</dd>
            </div>
          ))}
        </dl>
        <p className="dv3-fine">
          Registers checked: {interactions.sourcesChecked.join('; ') || 'not recorded'}
          {interactions.date ? ` · as of ${interactions.date}` : ''}. A stack check keeps what you
          type on your own device; RNAWiki does not send it anywhere.
        </p>
      </details>
    </Section>
  )
}

/* ------------------------------------------------------------------ applicability */

export function ApplicabilitySection({ model }: { model: DossierV3ViewModel }) {
  const applicability = model.applicability
  return (
    <Section id="for-someone-like-me" title="For someone like me?">
      {applicability.intro.map((sentence) => (
        <p className="dv3-lede" key={sentence}>
          {sentence}
        </p>
      ))}
      {applicability.populationsByGoal.length > 0 ? (
        <dl className="dv3-kv">
          {applicability.populationsByGoal.map((entry) => (
            <div key={entry.claimId}>
              <dt>{entry.goal}</dt>
              <dd>People similar to this profile were included: {entry.population}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="dv3-absent">
          No reviewed claim records who was studied for a specific use. Registered studies list the
          conditions below; a listed condition says what was studied, not who benefits.
        </p>
      )}
      {applicability.studiedConditions.length > 0 ? (
        <details className="dv3-receipt">
          <summary>
            Conditions named in registered studies ({applicability.studiedConditions.length})
          </summary>
          <ul className="dv3-terms">
            {applicability.studiedConditions.map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
        </details>
      ) : null}
      <p className="dv3-callout-line">{applicability.cannotDetermine}</p>
    </Section>
  )
}

/* ------------------------------------------------------------------ measure */

export function MeasureSection({ model }: { model: DossierV3ViewModel }) {
  const measure = model.measure
  return (
    <Section id="what-to-measure" title="What to measure">
      <p className="dv3-lede">{measure.reason}</p>
      {measure.mode === 'n_of_1_planning' ? (
        <div className="dv3-callout">
          <h3>A single-person observation plan (structure only)</h3>
          <ol>
            <li>
              One explicit goal and one primary outcome you can measure the same way each time.
            </li>
            <li>A baseline period before changing anything.</li>
            <li>
              One changed variable, and a duration chosen from the evidence and pharmacology
              recorded above.
            </li>
            <li>
              A record of adherence, sleep, illness, alcohol, training, diet and, where relevant,
              menstrual cycle.
            </li>
            <li>Carry-over or washout time between conditions.</li>
            <li>Stop rules written down in advance, and a side-effect record.</li>
            <li>
              A final reading that separates “the observation was consistent with benefit” from
              “this proved the substance caused the benefit”.
            </li>
          </ol>
          <p className="dv3-fine">
            This plan never calculates an amount to take, and it is not offered for children,
            pregnancy, prescription self-medication, controlled substances, high-risk compounds or
            active serious disease without professional oversight.
          </p>
        </div>
      ) : null}
      <h3>Questions to ask a clinician or pharmacist</h3>
      <ul>
        {measure.clinicianQuestions.map((question) => (
          <li key={question}>{question}</li>
        ))}
      </ul>
      <h3>What to bring</h3>
      <ul>
        {measure.whatToBring.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {measure.monitoring.length > 0 ? (
        <>
          <h3>What clinicians commonly monitor (as sourced)</h3>
          <ul>
            {measure.monitoring.map((item) => (
              <li key={item.text}>
                {item.text}
                <Sources compact sources={item.sources} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {measure.warningSigns.length > 0 ? (
        <>
          <h3>Warning signs named by the regulator</h3>
          <ul>
            {measure.warningSigns.map((item) => (
              <li key={item.text}>
                <details className="dv3-receipt">
                  <summary>Label warning text</summary>
                  <p className="dv3-quote">{item.text}</p>
                  <Sources compact sources={item.sources} />
                </details>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <h3>Why the evidence may not apply to you</h3>
      <ul>
        {measure.whyMayNotApply.map((sentence) => (
          <li key={sentence}>{sentence}</li>
        ))}
      </ul>
      <p className="dv3-fine">{measure.closing}</p>
    </Section>
  )
}

/* ------------------------------------------------------------------ alternatives */

export function AlternativesSection({ model }: { model: DossierV3ViewModel }) {
  const alternatives = model.alternatives
  return (
    <Section id="alternatives" title="Alternatives">
      <p className="dv3-lede">{alternatives.intro}</p>
      {alternatives.groups.length > 0 ? (
        <ul className="dv3-alternatives">
          {alternatives.groups.map((group) => (
            <li key={group.path}>
              <span className="dv3-kind">{group.label}</span>{' '}
              <a href={group.path}>{group.hubName}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dv3-absent">
          RNAWiki has not recorded a comparison group for this substance. That is a gap in the
          record, not a statement that there are no alternatives.
        </p>
      )}
      <p className="dv3-callout-line">{alternatives.notComparable}</p>
    </Section>
  )
}

/* ------------------------------------------------------------------ unknowns, changes, teach-back */

export function UnknownsSection({ model }: { model: DossierV3ViewModel }) {
  return (
    <Section id="unknowns" title="What we still do not know">
      <p className="dv3-lede">
        Unknown is a valid result. These are the gaps the record itself shows.
      </p>
      <dl className="dv3-kv dv3-unknowns">
        {model.unknowns.map((item) => (
          <div key={item.code}>
            <dt>{item.label}</dt>
            <dd>{item.text}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

export function WhatChangedSection({ model }: { model: DossierV3ViewModel }) {
  return (
    <Section id="what-changed" title="What changed">
      {model.changes.length === 0 ? (
        <p className="dv3-absent">No correction or claim change is recorded for this page yet.</p>
      ) : (
        <ol className="dv3-changes">
          {model.changes.map((change, index) => (
            <li key={`${change.when}-${index}`}>
              <span className="dv3-when">{change.when}</span> ·{' '}
              <span className="dv3-kind">{change.kind}</span>
              <p>{change.text}</p>
              <p className="dv3-fine">
                {change.alteredPublicConclusion
                  ? 'This change altered a public conclusion.'
                  : 'This change did not alter a public conclusion: none was published.'}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Section>
  )
}

export function TeachBackSection({ model }: { model: DossierV3ViewModel }) {
  const teach = model.teachBack
  return (
    <aside aria-labelledby="teach-back-h" className="dv3-section dv3-teach" id="teach-back">
      <h2 id="teach-back-h">One check before you go</h2>
      <p>{teach.question}</p>
      <ol>
        {teach.options.map((option) => (
          <li key={option.text}>
            <details>
              <summary>{option.text}</summary>
              <p>
                <strong>{option.supported ? 'Supported.' : 'Not supported.'}</strong> {option.why}
              </p>
            </details>
          </li>
        ))}
      </ol>
    </aside>
  )
}
