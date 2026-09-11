/**
 * The evidence sections: the goal matrix, the result cards, the staircase, the body path, the
 * felt/measured/meaningful split and the time facets.
 *
 * Each uses a different visual form on purpose. A matrix answers "which goal, and what kind of
 * thing was measured". A stair answers "how close is this to something I would notice". A path
 * answers "where does the chain stop being measured in people". Rendering all four as cards would
 * lose exactly the distinctions the page exists to make.
 */
import type { ReactNode } from 'react'

import { fingerprintStateGlyph, fingerprintStateLabel } from '@/lib/dossier-v4/taxonomy'
import type { DossierV4ViewModel } from '@/lib/dossier-v4/view-model'

import { Absence, Disclosure, SectionFrame, Sources, StateBadge, TruthLines } from './Primitives'

export function EffectFingerprint({
  fingerprint,
}: {
  fingerprint: DossierV4ViewModel['fingerprint']
}): ReactNode {
  return (
    <SectionFrame
      id="goal-fingerprint"
      label="What was measured, goal by goal"
      lane="human_result"
      lede="One row for each goal a registered study measured something for. One column for each kind of thing that could be measured."
      state={fingerprint.state}
    >
      <p>{fingerprint.registeredOutcomeLine}</p>
      <p className="dv4-note">{fingerprint.note}</p>

      {fingerprint.rows.length === 0 ? (
        <Absence
          reason="No registered study lists an outcome measure that RNAWiki could map to a goal."
          state={fingerprint.state}
        />
      ) : (
        <>
          <div className="dv4-matrix-scroll">
            <table className="dv4-matrix">
              <caption className="dv4-visually-hidden">
                Goals down the side, kinds of measurement across the top. Each cell says what kind
                of thing was registered, not what was found.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Goal</th>
                  {fingerprint.columns.map((column) => (
                    <th key={column.code} scope="col">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fingerprint.rows.map((row) => (
                  <tr data-goal={row.goal} key={row.goal}>
                    <th scope="row">{row.label}</th>
                    {row.cells.map((cell) => (
                      <td data-column={cell.columnLabel} data-state={cell.state} key={cell.column}>
                        <span className="dv4-cell">
                          <span aria-hidden="true" className="dv4-cell-glyph">
                            {fingerprintStateGlyph(cell.state)}
                          </span>
                          <span className="dv4-cell-label">
                            {fingerprintStateLabel(cell.state)}
                          </span>
                        </span>
                        <span className="dv4-visually-hidden">{cell.detail}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Disclosure summary="Which registered measures put each goal on this table">
            <dl>
              {fingerprint.rows.map((row) => (
                <div key={row.goal}>
                  <dt>
                    <strong>{row.label}</strong>
                  </dt>
                  <dd style={{ marginBottom: '0.6rem' }}>{row.basis.join('; ')}</dd>
                </div>
              ))}
            </dl>
            <p className="dv4-note">
              Sorted by fixed word lists, version {fingerprint.classifierVersion.split('/')[1]}. A
              name the rules do not recognise stays unsorted rather than moving to the nearest
              column.
            </p>
          </Disclosure>
          <Disclosure summary="What each mark on this table means">
            <dl>
              {[
                ...new Set(fingerprint.rows.flatMap((row) => row.cells.map((cell) => cell.state))),
              ].map((state) => (
                <div key={state}>
                  <dt>
                    <span aria-hidden="true">{fingerprintStateGlyph(state)}</span>{' '}
                    {fingerprintStateLabel(state)}
                  </dt>
                  <dd style={{ marginBottom: '0.5rem' }}>
                    {
                      fingerprint.rows
                        .flatMap((row) => row.cells)
                        .find((cell) => cell.state === state)?.detail
                    }
                  </dd>
                </div>
              ))}
            </dl>
          </Disclosure>
        </>
      )}
    </SectionFrame>
  )
}

export function HumanResults({
  results,
}: {
  results: DossierV4ViewModel['humanResults']
}): ReactNode {
  return (
    <SectionFrame
      id="human-results"
      label="What happened in people"
      lane="human_result"
      lede="Each card is one study: the exact question it asked, who was in it, and whether it showed what it set out to show."
      state={results.state}
    >
      {results.cards.length === 0 ? (
        <Absence reason={results.absence} state={results.state} />
      ) : (
        <>
          <div className="dv4-results">
            {results.cards.map((card) => (
              <article className="dv4-result" data-verdict={card.verdict} key={card.id}>
                <h3 className="dv4-result-question">{card.question}</h3>
                <p className="dv4-result-verdict">
                  <span aria-hidden="true">
                    {card.verdict === 'met' ? '✓' : card.verdict === 'not_met' ? '✗' : '?'}
                  </span>{' '}
                  {card.verdictLabel}
                </p>
                <dl className="dv4-facts">
                  <dt>Who was studied</dt>
                  <dd>{card.population}</dd>
                  <dt>How many people</dt>
                  <dd>{card.participants ?? 'Not recorded'}</dd>
                  <dt>Study design</dt>
                  <dd>{card.studyDesign}</dd>
                  <dt>Compared against</dt>
                  <dd>{card.comparator}</dd>
                  <dt>Kind of result</dt>
                  <dd>{card.outcomeClassLabel}</dd>
                  <dt>What was found</dt>
                  <dd>{card.absoluteResult}</dd>
                  <dt>Repeated elsewhere</dt>
                  <dd>{card.replication}</dd>
                </dl>
                <div className="dv4-callout">
                  <p>
                    <strong>What this does not prove.</strong> {card.doesNotProve}
                  </p>
                </div>
                <Disclosure summary="The limits of this study, and where it came from">
                  <p>
                    <strong>Main limit.</strong> {card.primaryLimitation}
                  </p>
                  <p>
                    <strong>How far it carries.</strong> {card.applicabilityLimitation}
                  </p>
                  <p>
                    <strong>Form and route.</strong> {card.formulation}
                  </p>
                  <p>
                    <strong>Interval reported.</strong> {card.confidenceInterval}
                  </p>
                  <p className="dv4-note">
                    {card.state === 'source_checked_draft'
                      ? 'Written into the record, not signed off as a reviewed claim.'
                      : ''}
                  </p>
                  <Sources sources={card.sources} />
                </Disclosure>
              </article>
            ))}
          </div>
          {results.registry ? (
            <Disclosure summary="What the trial registry holds for this substance">
              <p>{results.registry.text}</p>
              <Sources sources={results.registry.sources} />
            </Disclosure>
          ) : null}
        </>
      )}
      <TruthLines terms={results.truth} />
    </SectionFrame>
  )
}

export function EvidenceStaircase({
  staircase,
}: {
  staircase: DossierV4ViewModel['staircase']
}): ReactNode {
  return (
    <SectionFrame
      id="evidence-staircase"
      label="How close this is to real life"
      lane="human_result"
      lede="The top step is something a person would feel or care about. The bottom is a guess from software. Filled steps are where evidence exists for this substance."
      state={staircase.state}
    >
      <ol className="dv4-stair">
        {staircase.rungs.map((rung) => (
          <li
            data-filled={rung.filled ? 'true' : 'false'}
            data-level={rung.level}
            key={rung.level}
            style={{ ['--dv4-rank' as string]: String(rung.rank) }}
          >
            <span aria-hidden="true" className="dv4-stair-mark">
              {rung.filled ? '■' : '□'}
            </span>
            <span>
              <span className="dv4-stair-label">{rung.label}</span>{' '}
              <span className="dv4-visually-hidden">
                {rung.filled ? 'Evidence recorded.' : 'No evidence recorded.'}
              </span>
              <span className="dv4-note"> {rung.plain}</span>
              <span className="dv4-stair-detail" style={{ display: 'block' }}>
                {rung.detail}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <div className="dv4-callout">
        <p>{staircase.caveat}</p>
      </div>
    </SectionFrame>
  )
}

export function BodyJourney({ journey }: { journey: DossierV4ViewModel['journey'] }): ReactNode {
  return (
    <SectionFrame
      id="body-journey"
      label="The path through the body"
      lane="body_action"
      lede="From what a person takes to what changes. A solid line is a step measured in people. A dashed line is a step nobody has measured that way."
      state={journey.state}
    >
      {journey.nodes.length === 0 ? (
        <Absence reason={journey.textEquivalent.join(' ')} state={journey.state} />
      ) : (
        <ol className="dv4-path">
          {journey.nodes.map((node, index) => {
            const edge = journey.edges[index - 1]
            return (
              <li
                data-node={node.id}
                data-verified={index === 0 ? 'true' : edge?.verified ? 'true' : 'false'}
                key={node.id}
              >
                <p className="dv4-path-stage">{node.stage}</p>
                <p className="dv4-path-title">{node.label}</p>
                <p>{node.plain}</p>
                {edge ? (
                  <p className="dv4-path-edge">
                    <span aria-hidden="true">{edge.verified ? '──' : '╌╌'}</span>{' '}
                    <strong>{edge.scope}.</strong> {edge.uncertaintyReason}
                  </p>
                ) : null}
                {node.technical ? (
                  <Disclosure summary="The measurement behind this step" technical>
                    <p>{node.technical}</p>
                    {edge ? <Sources sources={edge.sources} /> : null}
                  </Disclosure>
                ) : null}
              </li>
            )
          })}
        </ol>
      )}
      {journey.hiddenPredicted > 0 ? (
        <p className="dv4-note">
          {journey.hiddenPredicted} suggested links are held back from this view. A suggestion is
          not a finding, so it stays in the review queue.
        </p>
      ) : (
        <p className="dv4-note">
          No suggested links are held for this record, so nothing is hidden from this path.
        </p>
      )}
      <TruthLines terms={journey.truth} />
    </SectionFrame>
  )
}

export function FeltMeasuredMeaningful({
  experience,
}: {
  experience: DossierV4ViewModel['experience']
}): ReactNode {
  const columns = [
    {
      key: 'felt' as const,
      title: 'Felt',
      plain: 'Things a person could notice without a test.',
      entries: experience.felt,
    },
    {
      key: 'measured' as const,
      title: 'Measured',
      plain: 'Things only a test, a scale or a device shows.',
      entries: experience.measured,
    },
    {
      key: 'meaningful' as const,
      title: 'Meaningful',
      plain: 'Things that change how a life goes, not only a number.',
      entries: experience.meaningful,
    },
  ]
  return (
    <SectionFrame
      id="felt-measured-meaningful"
      label="Felt, measured, or meaningful"
      lane="personal_reality"
      lede="Three different things that get called the same word. Registered studies measured all three, and mixing them is how a blood test becomes a health claim."
      state={experience.state}
    >
      <div className="dv4-three">
        {columns.map((column) => (
          <div className="dv4-panel" data-experience={column.key} key={column.key}>
            <h3>{column.title}</h3>
            <p className="dv4-panel-note">{column.plain}</p>
            {column.entries.length === 0 ? (
              <p className="dv4-note">No registered study measured anything of this kind.</p>
            ) : (
              <ul>
                {column.entries.slice(0, 10).map((entry) => (
                  <li key={entry.term}>{entry.term}</li>
                ))}
              </ul>
            )}
            {column.entries.length > 10 ? (
              <p className="dv4-note">and {column.entries.length - 10} more.</p>
            ) : null}
          </div>
        ))}
      </div>
      <p className="dv4-note" style={{ marginTop: '1rem' }}>
        {experience.note}
      </p>
      <div className="dv4-two">
        {experience.traps.map((trap) => (
          <div className="dv4-callout" key={trap.code} style={{ marginTop: 0 }}>
            <p>
              <strong>{trap.label}.</strong> {trap.plain}
            </p>
          </div>
        ))}
      </div>
      {experience.uncategorised.length > 0 ? (
        <Disclosure
          summary={`Names that fit none of the three (${experience.uncategorised.length})`}
        >
          <ul>
            {experience.uncategorised.slice(0, 20).map((entry) => (
              <li key={entry.term}>{entry.term}</li>
            ))}
          </ul>
          <p className="dv4-note">
            These are harms, study-process measures, or names the rules did not recognise. They are
            shown rather than dropped.
          </p>
        </Disclosure>
      ) : null}
    </SectionFrame>
  )
}

export function SignalTimeline({
  timeline,
}: {
  timeline: DossierV4ViewModel['timeline']
}): ReactNode {
  return (
    <SectionFrame
      id="signal-timeline"
      label="How long anything takes"
      lane="personal_reality"
      lede="Nine different lengths of time that get confused with each other. None of them is worked out from another."
      state={timeline.state}
    >
      <ol className="dv4-spine">
        {timeline.entries.map((entry) => (
          <li
            data-facet={entry.facet}
            data-known={entry.value.origin === 'absent' ? 'false' : 'true'}
            key={entry.facet}
          >
            <p>
              <span className="dv4-spine-label">{entry.label}.</span>{' '}
              {entry.value.origin === 'absent' ? (
                <span className="dv4-note">{entry.value.basis}</span>
              ) : (
                entry.value.text
              )}
            </p>
            {entry.value.origin !== 'absent' ? (
              <p className="dv4-note" style={{ margin: 0 }}>
                {entry.value.basis}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
      <div className="dv4-callout">
        <p>
          A study window is not how long people took it, and neither is how long they were followed.
          Where RNAWiki holds only one of the three, it shows one.
        </p>
      </div>
    </SectionFrame>
  )
}
