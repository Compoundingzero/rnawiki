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
import type { RecordSubstance } from '@/lib/dossier-v4/indexability'
import type { RecordedFact } from '@/lib/dossier-v4/recorded-facts'
import { PURPOSES } from '@/lib/dossier-v4/taxonomy'
import type { ActionHero, DossierV4ViewModel, IdentityStrip } from '@/lib/dossier-v4/view-model'

import {
  BodyPathFigure,
  ConceptGlyph,
  Disclosure,
  RecordedFactList,
  StatementBlock,
} from './Primitives'

/**
 * The critical-notice banner.
 *
 * This used to open every page that was not in the reviewed state — 10,247 of 10,250 of them —
 * with a bordered block reading "Preliminary, awaiting review" and telling the reader to treat the
 * page as a working draft. On a page where every sentence already carries its own provenance, that
 * block said nothing the page did not, took the first 160 pixels of the first screen, and made a
 * source-linked record look broken. It is gone.
 *
 * What is left is the case where a reader genuinely must be stopped before reading on: the record's
 * identity is in doubt, or preparing the page failed. Those are not review status. A page in either
 * state is saying something is wrong with itself, and that belongs at the top.
 *
 * The internal publication state is unchanged. `publication.bannerRequired` still means what it
 * meant and is still what the corpus validation reads; only what a reader is shown has changed.
 */
const CRITICAL_STATES = new Set(['correction_hold', 'pipeline_failure'])

export function PublicationBanner({
  publication,
}: {
  publication: DossierV4ViewModel['publication']
}): ReactNode {
  if (!CRITICAL_STATES.has(publication.state)) return null
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

/**
 * The one quiet line a sparse record keeps.
 *
 * Not review machinery: it says what RNAWiki holds about this substance, which is a fact about the
 * record rather than about who has looked at it. A record with a full page renders nothing here.
 */
export function PublicationNote({
  publication,
}: {
  publication: DossierV4ViewModel['publication']
}): ReactNode {
  if (publication.state !== 'limited') return null
  return (
    <p className="dv4-strip-review">
      <span className="dv4-note">{publication.plain}</span>
    </p>
  )
}

/**
 * What this page could not find, said on the page.
 *
 * A record with nothing in it is a retrieval result, not a design state, and hiding it behind an
 * empty section or a euphemism would make the page look like it had an answer it does not have. So
 * it says what is missing and where RNAWiki looked. A page in this state is also not offered to a
 * search engine — `lib/dossier-v4/indexability.ts` makes both decisions from the same assessment,
 * so the sentence and the crawler instruction cannot disagree.
 */
export function MissingRecordNotice({
  substance,
  searched,
}: {
  substance: RecordSubstance
  /** The registers and databases this record was looked for in, named for the reader. */
  searched: string[]
}): ReactNode {
  if (!substance.empty) return null
  return (
    <aside aria-labelledby="missing-record-h" className="dv4-publication" data-record="empty">
      <p className="dv4-publication-label" id="missing-record-h">
        RNAWiki has not found information about this substance
      </p>
      <p>
        There is no recorded explanation of what it does, no result measured in people, and no
        recorded path through the body. Rather than leave the page looking finished, it says so.
      </p>
      <p className="dv4-note" style={{ marginBottom: 0 }}>
        Looked for in {searched.join(', ')}. If you know of a published source for this substance,
        the review queue is where to say so.
      </p>
    </aside>
  )
}

export function SubstanceIdentityStrip({
  identity,
  promise,
  children,
}: {
  identity: IdentityStrip
  promise: string
  /** The review control, rendered beneath the promise and before "What brought you here?". */
  children?: ReactNode
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
      {children}
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
  recordedIdentity,
}: {
  hero: ActionHero
  name: string
  stages: string[]
  /** What the substance registries record about what this is and where it comes from. */
  recordedIdentity: RecordedFact[]
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
        <p className="dv4-hero-action" data-origin={hero.simpleAction.origin}>
          {hero.simpleAction.text}
        </p>
        {hero.actionDetail.origin === 'absent' ? null : (
          <>
            <p className="dv4-hero-because" data-origin={hero.actionDetail.origin}>
              {hero.actionDetail.text}
            </p>
          </>
        )}
        {hero.whyPeopleCare.origin === 'absent' ? null : (
          <>
            <p className="dv4-hero-because" data-origin={hero.whyPeopleCare.origin}>
              <strong>Why people take it.</strong> {hero.whyPeopleCare.text}
            </p>
          </>
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
          <p data-origin={hero.principalUncertainty.origin}>{hero.principalUncertainty.text}</p>
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
            <dd data-origin={hero.bodyLocation.origin}>{hero.bodyLocation.text}</dd>
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

        {/*
          What the registries say this is. On a medicine with no recorded mechanism and no trial —
          most of the corpus — this is the only thing on the page that describes the substance
          itself, and it was sitting in the database unread.
        */}
        <RecordedFactList facts={recordedIdentity} heading="What the registries record it as" />

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
          <p data-origin={hero.immediateChange.origin} style={{ fontSize: '0.9rem' }}>
            {hero.immediateChange.text}
          </p>
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
