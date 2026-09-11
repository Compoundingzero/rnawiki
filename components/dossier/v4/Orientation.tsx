/**
 * The first screen: who this is, why you might be here, and what the substance does.
 *
 * The order is deliberate and is the main break from dossier v3. v3 opened with the medicine name,
 * a supervision line and a grid of nine question cards whose first readable answers were an
 * identity sentence and "no reviewed conclusion yet". v4 opens with what the substance changes in a
 * body, in a sentence a person with no biology can read, and puts the record's identity metadata in
 * a single quiet line above it.
 */
import type { ReactNode } from 'react'

import type { Concept } from '@/lib/dossier-v4/concepts'
import { PURPOSES } from '@/lib/dossier-v4/taxonomy'
import type { ActionHero, DossierV4ViewModel, IdentityStrip } from '@/lib/dossier-v4/view-model'

import { BodyPathFigure, ConceptGlyph, Disclosure, StatementBlock } from './Primitives'

/**
 * The state banner. Anything that is not a reviewed page opens by saying what it is, before the
 * reader spends attention working out why so much of the page says "not recorded".
 */
export function PublicationBanner({
  publication,
}: {
  publication: DossierV4ViewModel['publication']
}): ReactNode {
  if (!publication.bannerRequired) return null
  return (
    <aside
      aria-labelledby="publication-state-h"
      className="dv4-publication"
      data-publication-state={publication.state}
    >
      <p className="dv4-publication-label" id="publication-state-h">
        {publication.label}
      </p>
      <p>{publication.plain}</p>
      <p className="dv4-note" style={{ marginBottom: 0 }}>
        {publication.reason}
      </p>
    </aside>
  )
}

export function SubstanceIdentityStrip({
  identity,
  promise,
}: {
  identity: IdentityStrip
  promise: string
}): ReactNode {
  return (
    <header className="dv4-strip">
      <h1>{identity.canonicalName}</h1>
      <ul className="dv4-strip-facts">
        <li data-substance-type={identity.substanceTypeCode} title={identity.substanceTypeBasis}>
          {identity.substanceType}
        </li>
        <li data-availability={identity.availabilityCode} title={identity.availabilityBasis}>
          {identity.availability}
          {identity.jurisdictions.length > 0 &&
          identity.availabilityCode !== 'unresolved' &&
          identity.availabilityCode !== 'varies_by_jurisdiction'
            ? ` in ${identity.jurisdictions.join(', ')}`
            : null}
        </li>
        <li data-identity-verified={identity.identityVerified ? 'true' : 'false'}>
          <span aria-hidden="true">{identity.identityVerified ? '✓' : '⚠'}</span>
          {identity.identityLabel}
        </li>
        {identity.lastSubstantiveReview ? (
          <li>Sources last checked {identity.lastSubstantiveReview}</li>
        ) : (
          <li>No source check date recorded</li>
        )}
      </ul>
      <p className="dv4-note" style={{ flexBasis: '100%', margin: '0.35rem 0 0' }}>
        {promise}
      </p>
    </header>
  )
}

/**
 * The purpose rail. Five anchors. Choosing one moves the page; it never hides a section, and in
 * particular it cannot hide the safety or contradiction sections, because there is nothing here
 * that removes anything from the document.
 */
export function PurposeRail(): ReactNode {
  return (
    <nav aria-labelledby="purpose-rail-h" className="dv4-purpose">
      <p className="dv4-purpose-legend" id="purpose-rail-h" style={{ margin: 0 }}>
        <span className="dv4-nav-title" style={{ display: 'inline', letterSpacing: '0.08em' }}>
          What brought you here?
        </span>
      </p>
      <ul>
        {PURPOSES.map((purpose) => (
          <li key={purpose.code}>
            <a data-purpose={purpose.code} href={`#${purpose.target}`}>
              {purpose.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function SubstanceActionHero({
  hero,
  name,
  stages,
}: {
  hero: ActionHero
  name: string
  stages: string[]
}): ReactNode {
  return (
    <section
      aria-labelledby="substance-action-h"
      className="dv4-section dv4-hero"
      data-compass-lane="body_action"
      data-lane="body_action"
      data-state={hero.state}
      id="substance-action"
    >
      <div className="dv4-hero-main">
        <h2 className="dv4-visually-hidden" id="substance-action-h">
          What {name} does in the body
        </h2>
        <p className="dv4-hero-action">{hero.simpleAction.text}</p>
        {hero.actionDetail.origin === 'absent' ? null : (
          <p className="dv4-hero-because">{hero.actionDetail.text}</p>
        )}
        {hero.whyPeopleCare.origin === 'absent' ? null : (
          <p className="dv4-hero-because">
            <strong>Why people take it.</strong> {hero.whyPeopleCare.text}
          </p>
        )}

        <div className="dv4-hero-result" data-block="strongest-result">
          <p className="dv4-eyebrow" style={{ marginBottom: '0.3rem' }}>
            <span>What happened in people</span>
          </p>
          <StatementBlock emphasis statement={hero.strongestGoalResult} />
        </div>

        <div className="dv4-hero-limit" data-block="principal-uncertainty">
          <p className="dv4-eyebrow" style={{ marginBottom: '0.3rem' }}>
            <span>The limit that matters most</span>
          </p>
          <p>{hero.principalUncertainty.text}</p>
        </div>

        {hero.analogy ? (
          <div className="dv4-hero-analogy">
            <p>
              <strong>One way to picture it.</strong> {hero.analogy.text}
            </p>
            <p className="dv4-note">
              <strong>Where that stops being true.</strong> {hero.analogy.limit}
            </p>
          </div>
        ) : null}

        <dl className="dv4-hero-facts">
          <div>
            <dt>Where it acts</dt>
            <dd>{hero.bodyLocation.text}</dd>
          </div>
          <div>
            <dt>Kind of result</dt>
            <dd>{hero.outcomeType}</dd>
          </div>
          <div>
            <dt>Supervision</dt>
            <dd>{hero.supervision}</dd>
          </div>
        </dl>

        <Disclosure summary="Where each sentence above came from">
          <p>{hero.simpleAction.basis}</p>
          <p>{hero.whyPeopleCare.basis}</p>
          <p>{hero.principalUncertainty.basis}</p>
          <p className="dv4-note">
            The four opening statements run to {hero.openingWordCount} words.
          </p>
        </Disclosure>
      </div>

      <aside className="dv4-hero-aside">
        <figure className="dv4-figure" style={{ margin: 0 }}>
          <figcaption className="dv4-figure-title">The path this takes</figcaption>
          {stages.length > 0 ? (
            <BodyPathFigure stages={stages} />
          ) : (
            <p className="dv4-note">No path through the body is recorded for this substance.</p>
          )}
          <p className="dv4-note" style={{ margin: '0.5rem 0 0' }}>
            Each step is written out below, with what was measured and in what species.
          </p>
        </figure>
        <div className="dv4-panel" style={{ marginTop: '1rem' }}>
          <h3>The change it makes</h3>
          <p style={{ fontSize: '0.9rem' }}>{hero.immediateChange.text}</p>
        </div>
      </aside>
    </section>
  )
}

/**
 * The prerequisite concepts this page needs, chosen by walking back from what the page shows.
 * Marking one as understood is a browser-local convenience and is deliberately not offered here,
 * because nothing on this page may be hidden by it.
 */
export function ConceptPrimer({ concepts }: { concepts: Concept[] }): ReactNode {
  if (concepts.length === 0) return null
  return (
    <div className="dv4-concepts" data-block="concept-primer">
      {concepts.map((concept) => (
        <div className="dv4-concept" key={concept.id}>
          <ConceptGlyph visual={concept.visual} />
          <p className="dv4-concept-term">{concept.term}</p>
          <p style={{ fontSize: '0.88rem' }}>{concept.beginner}</p>
          <Disclosure summary="A picture of it, and where the picture fails">
            <p>{concept.analogy}</p>
            <p>
              <strong>Where that stops being true.</strong> {concept.analogyLimit}
            </p>
            <p>
              <strong>What people get wrong.</strong> {concept.misunderstanding}
            </p>
            <p className="dv4-note">{concept.technical}</p>
          </Disclosure>
        </div>
      ))}
    </div>
  )
}
