import type { ProofCardView } from '@/lib/types'
import { stagePositionApplies, fallbackConflictSummary } from '@/lib/evidence-view'
import { EvidenceReach } from '../EvidenceReach'
import { EvidenceRecordMeta } from './EvidenceRecordMeta'
import { ClaimEventList } from './ClaimEventList'
import { EvidenceChangeTimeline } from './EvidenceChangeTimeline'
import { EvidenceSourceList } from './EvidenceSourceList'
import { RecordUtilities } from './RecordUtilities'

/**
 * Everything behind one claim's evidence record.
 *
 * Four rules govern this component and none of them is cosmetic.
 *
 * 1. NO `open` ATTRIBUTE, EVER. A page cannot be four open essays, and a record that opens itself
 *    puts the internal evidence schema above the answer the reader came for. `defaultOpen` was
 *    deleted from every caller for this reason; do not reintroduce it.
 *
 * 2. Everything below is SERVER-RENDERED and present in the HTML while the disclosure is closed.
 *    A native <details> hides content from the reading path without taking it out of the document,
 *    which is what keeps every DOI, source and event readable with JavaScript disabled, in print,
 *    and to anything crawling the page. The previous client-only drawer mounted its contents on
 *    click and made every citation on the site invisible.
 *
 * 3. Both state labels are in the DOM and CSS hides the inapplicable one with `display: none`, so
 *    a screen reader reads exactly one and the wording stays honest in both states without
 *    JavaScript. The chevron is decorative and therefore aria-hidden.
 *
 * 4. TWO disclosure levels, maximum. This record is level 1; "Study details and sources" and
 *    "More ways to use this record" are level 2. Nothing else may nest.
 *
 * Section order is fixed: what was observed, what that does not prove, what did not work, what is
 * unknown, what would change it, how far it goes, how it changed, then the raw study detail. Answer
 * first, boundary second, audit trail third, raw study detail last.
 */

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="er__section">
      <h5 className="er__h">{heading}</h5>
      {children}
    </section>
  )
}

export function EvidenceRecord({ claim }: { claim: ProofCardView }) {
  const fallbackSummary = fallbackConflictSummary(claim.evidence)
  const hasFailureSection = claim.events.length > 0 || fallbackSummary !== null

  return (
    <details className="er">
      <summary className="er__summary">
        {/* `hidden` on the closed-state label is the no-CSS fallback, and only that. The author
            rule `.er__label { display: inline }` in app/globals.css outranks the user-agent
            `[hidden]` rule, so whenever the stylesheet loads the existing `[open]` and `:target`
            rules keep full control and this attribute does nothing. With the stylesheet missing —
            a failed CSS request, a CSS-less reader mode — the summary used to read "Open evidence
            recordClose evidence record", a control saying both things at once. Both labels stay in
            the DOM so a screen reader still reads exactly one and the state stays honest without
            JavaScript. */}
        <span className="er__label er__label--open">Open evidence record</span>
        <span className="er__label er__label--close" hidden>
          Close evidence record
        </span>
        <svg className="er__chev" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" focusable="false">
          <path
            d="M6 3.5L10.5 8L6 12.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>

      <div className="er__body">
        <h4 className="er__title">Evidence record</h4>
        <EvidenceRecordMeta
          version={claim.version}
          lastCheckedAt={claim.lastCheckedAt}
          checkedAt={claim.checkedAt}
          review={claim.review}
        />

        <Section heading="What was directly observed">
          <p>{claim.measuredFinding}</p>
        </Section>

        {/* The inference is not wrong — it is untested. The heading says what it has not yet
            earned, and the field's own wording carries the reason. */}
        <Section heading="What this does not prove">
          <p>{claim.inference}</p>
        </Section>

        {/* Absent, not empty, when nothing failed and nothing conflicts. A "none recorded" row here
            would read as a positive finding about a question nobody asked. */}
        {hasFailureSection && (
          <Section heading="What did not work or conflicts with this answer">
            <ClaimEventList events={claim.events} fallbackSummary={fallbackSummary} />
          </Section>
        )}

        <Section heading="What is still unknown">
          <p>{claim.remainingUnknown}</p>
        </Section>

        <Section heading="What would change this answer">
          <p>{claim.evidenceNeededNext}</p>
        </Section>

        {/* ONE carrier for the position. This block used to state the same fact three ways in
            about 140px — the paragraph, then "Recorded stage: Animal evidence.", then an axis
            marked "Animal studies", then a caption. A reader cannot tell whether "Animal
            evidence" and "Animal studies" name two different things, so the canonical stage
            label went.

            The caption STAYS, and the earlier decision to suppress it here was wrong. It was
            suppressed on the grounds that the claim's own evidence sentence — the identical
            string, printed by ClaimSummary under the same gate — sits "about one screen above".
            Measured at 390px the real distance from that sentence to this axis is about 1,700px
            with five section headings in between, so a phone reader met five grey words, a rail
            and a dot with nothing saying what the dot means. Four canonical stages share the
            "People" position and only this sentence separates an uncontrolled pilot from a
            replicated controlled trial. One repeated sentence is a far smaller cost than an
            unexplained marker, so it is repeated. */}
        <Section heading="How far the evidence goes">
          <p>{claim.proofBoundaryExplanation}</p>
          {/* Only outcome claims have a ladder. A regulatory, access or mechanism claim filled it
              to the top rung for a logistics answer. */}
          {stagePositionApplies(claim.claimType) && <EvidenceReach stage={claim.proofBoundaryStage} />}
        </Section>

        {claim.changes.length > 0 && (
          <Section heading="How this answer changed">
            <EvidenceChangeTimeline changes={claim.changes} />
          </Section>
        )}

        {/* Level 2. Nothing inside either of these may open a third level. */}
        <div className="er__section">
          <EvidenceSourceList evidence={claim.evidence} />
        </div>
        <div className="er__section">
          <RecordUtilities claim={claim} />
        </div>
      </div>
    </details>
  )
}
