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
import { pageReviewPill, type PageReviewSummary } from '@/lib/page-statements/overlay'
import { PURPOSES } from '@/lib/dossier-v4/taxonomy'
import type { ActionHero, DossierV4ViewModel, IdentityStrip } from '@/lib/dossier-v4/view-model'

import { BodyPathFigure, ConceptGlyph, Disclosure, StatementBlock } from './Primitives'

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
 * The small review control, and the one-line note a sparse record keeps.
 *
 * A reader should be able to see, without leaving the first screen, how many members have signed
 * off the wording in front of them and how to suggest a better one. What they should not get is a
 * warning. The control is a link: this page ships no client JavaScript, and the review workflow
 * lives at `/review-queue`, so an anchor is the honest shape as well as the working one.
 *
 * "Community approved" describes the wording and how the evidence is represented. It never means
 * the substance works, the accessible name says so, and "peer reviewed" is not used anywhere,
 * because none of this is scientific peer review.
 */
/**
 * The one quiet line a sparse record keeps when the review control is not rendered — because review
 * has been withdrawn, or because this deployment has not switched it on.
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

export function ReviewControl({
  publication,
  summary,
}: {
  publication: DossierV4ViewModel['publication']
  summary: PageReviewSummary
}): ReactNode {
  const pill = pageReviewPill(summary)
  // A limited record used to explain itself in the banner. That sentence is still worth one line;
  // it is not worth a bordered block, so it sits beside the control as ordinary quiet text.
  const limitedNote = publication.state === 'limited' ? publication.plain : null
  return (
    <p className="dv4-strip-review">
      <a
        aria-label={pill.accessibleName}
        className="dv4-review-pill"
        data-review-state={pill.state}
        href={pill.href}
      >
        <span aria-hidden="true" className="dv4-review-glyph">
          ✎
        </span>
        <span>{pill.label}</span>
      </a>
      {limitedNote ? <span className="dv4-note">{limitedNote}</span> : null}
    </p>
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
  approved,
}: {
  hero: ActionHero
  name: string
  stages: string[]
  /** Sentences on this page carrying a wording members approved, keyed by position. */
  approved: ReadonlyMap<string, { approvals: number }>
}): ReactNode {
  const reviewLine = (key: string): string | null => {
    const entry = approved.get(key)
    return entry ? `Community approved ${entry.approvals}/3` : null
  }
  /*
   * The hero's opening paragraphs carry no provenance line by default: they are explained together
   * in "Where each sentence above came from" at the foot of the hero, and repeating a label under
   * each of them is the clutter this change removed. A community wording is different — it is a
   * fact about this exact sentence that a reader cannot get anywhere else on the first screen — so
   * the line appears only where one applies.
   */
  const ReviewLine = ({ statementKey }: { statementKey: string }): ReactNode => {
    const line = reviewLine(statementKey)
    if (!line) return null
    return (
      <p className="dv4-origin">
        <span aria-hidden="true">✎✓</span> {line}
      </p>
    )
  }
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
        <ReviewLine statementKey="hero.opening" />
        {hero.actionDetail.origin === 'absent' ? null : (
          <>
            <p className="dv4-hero-because" data-origin={hero.actionDetail.origin}>
              {hero.actionDetail.text}
            </p>
            <ReviewLine statementKey="hero.explanation" />
          </>
        )}
        {hero.whyPeopleCare.origin === 'absent' ? null : (
          <>
            <p className="dv4-hero-because" data-origin={hero.whyPeopleCare.origin}>
              <strong>Why people take it.</strong> {hero.whyPeopleCare.text}
            </p>
            <ReviewLine statementKey="hero.why_people_take_it" />
          </>
        )}

        <div className="dv4-hero-result" data-block="strongest-result">
          <p className="dv4-eyebrow" style={{ marginBottom: '0.3rem' }}>
            <span>What happened in people</span>
          </p>
          <StatementBlock
            emphasis
            review={reviewLine('hero.strongest_result')}
            statement={hero.strongestGoalResult}
          />
        </div>

        <div className="dv4-hero-limit" data-block="principal-uncertainty">
          <p className="dv4-eyebrow" style={{ marginBottom: '0.3rem' }}>
            <span>The limit that matters most</span>
          </p>
          <p data-origin={hero.principalUncertainty.origin}>{hero.principalUncertainty.text}</p>
          <ReviewLine statementKey="hero.principal_limit" />
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
            <dd data-origin={hero.bodyLocation.origin}>
              {hero.bodyLocation.text}
              <ReviewLine statementKey="hero.where_it_acts" />
            </dd>
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
          <p data-origin={hero.immediateChange.origin} style={{ fontSize: '0.9rem' }}>
            {hero.immediateChange.text}
          </p>
          <ReviewLine statementKey="hero.immediate_change" />
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
