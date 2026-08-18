import type { Metadata } from 'next'
import Link from 'next/link'
import {
  EVIDENCE_RELATIONSHIP_LABELS,
  EVIDENCE_RELATIONSHIPS,
  EVIDENCE_STATUS_DEFINITIONS,
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUSES,
  HUMAN_TESTED_STAGES,
  PROOF_BOUNDARY_STAGES,
  type ProofBoundaryStage,
} from '@/lib/evidence'
import { REACH_POSITIONS, canonicalStageLabel, stageToReachIndex } from '@/lib/evidence-view'
import { EvidenceReach } from '@/components/EvidenceReach'

export const metadata: Metadata = {
  title: 'Methodology',
  description:
    'How RNAwiki classifies evidence, what measured, inferred and unknown mean, and what "published" does and does not tell you.',
}

// Plain-language description of what each stage actually establishes. This is explanatory prose,
// not the controlled vocabulary itself — the stage list, ordering and labels are imported from
// lib/evidence.ts above and must never be redeclared or reworded here.
const STAGE_EXPLANATIONS: Record<ProofBoundaryStage, string> = {
  biological_rationale_only:
    'A mechanism has been proposed — how a molecule might act on a known receptor or pathway — but not tested in cells, animals, or people.',
  isolated_cell_evidence:
    'An effect was observed in cells in a dish. That shows the mechanism is active on isolated cells under laboratory conditions, not that the same happens inside a living body.',
  animal_evidence:
    'An effect was observed in a living animal. Closer to a working biological system than a cell study, but animal physiology differs from human physiology in ways that regularly stop such effects reproducing in people.',
  observational_human_evidence:
    'A pattern was found in human data, comparing people who already used something against people who did not. Nobody assigned who received what, so other differences between the groups can explain the result. Association is not cause.',
  uncontrolled_human_intervention:
    'People were given the treatment and outcomes were measured, with no comparison group. Without knowing what would have happened anyway, how much the treatment caused is unclear.',
  controlled_human_evidence:
    'A study compared people who received the treatment against a control group, such as placebo or standard care. That attributes the result to the treatment more confidently than an observation or an uncontrolled study.',
  independently_supported_controlled_human_evidence:
    'Two or more controlled human studies, run by separate groups with no shared authors or funding, found a similar result on the same question. Independent replication is the strongest available check against one study’s own errors, biases, or chance findings.',
  regulatory_evidence:
    'A regulator such as the FDA, EMA, or Singapore’s HSA reviewed the evidence and approved the substance for a specific use in a specific population. That is an accountable decision, not simply another study.',
}

// Derived, never hand-written: which canonical stages sit at each of the five reader-facing
// positions. Computed from stageToReachIndex so the two views cannot drift apart.
const POSITION_STAGES = REACH_POSITIONS.map((label, index) => ({
  label,
  stages: PROOF_BOUNDARY_STAGES.filter((stage) => stageToReachIndex(stage) === index),
}))

const REVIEW_LINES: { key: string; line: string; when: string }[] = [
  {
    key: 'Default',
    line: 'Editorial review completed. Independent scientific review pending.',
    when: 'The default for a published claim. Editorial work is done; no qualified scientific reviewer has approved it yet.',
  },
  {
    key: 'Approved',
    line: 'Editorial review completed.',
    when: 'Shown with a named reviewer and their credentials, only when the most recent formal review on record for that claim carries an approved decision from an identified scientific reviewer.',
  },
  {
    key: 'Needs update',
    line: 'Flagged for update — evidence may have changed since the last review.',
    when: 'The claim is marked needs update.',
  },
  {
    key: 'Re-review',
    line: 'Undergoing re-review.',
    when: 'The claim is marked re-review.',
  },
]

const FIXED_RULES: { title: string; body: string }[] = [
  {
    title: 'No dosage calculators, protocol builders, stacking guidance, or procurement and self-use instructions.',
    body: 'In any form, anywhere on the site.',
  },
  {
    title: 'No star ratings, confidence scores, or percentages',
    body: 'unless a named study or regulator reported that number, in which case it is cited as theirs.',
  },
  {
    title: 'No brand recommendations.',
    body: 'Substances are named where that identifies what they are. What to buy, and where, is not covered.',
  },
  {
    title: 'Harm-reduction framing, not encouragement,',
    body: 'for anything unapproved. Documenting a risk plainly is not endorsing the behaviour that creates it.',
  },
  {
    title: '“Not medical advice,” with an escalation path.',
    body: 'Every page carries the statement paired with guidance to contact a clinician, rather than a disclaimer standing alone.',
  },
]

export default function MethodologyPage() {
  return (
    <div className="page doc">
      <header className="reading stack">
        <h1>Methodology</h1>
        <p className="lead muted">How RNAwiki decides where evidence ends and interpretation begins.</p>
      </header>

      {/* The simpler public view first. The eight-stage detail follows it. */}
      <section className="section-sm">
        <h2>The five positions on a claim</h2>
        <div className="reading stack" style={{ marginTop: 'var(--s4)' }}>
          <p className="muted">
            Every claim page marks one of five points, from a proposed biological idea to a decision by a
            medicines regulator. The sentence under the marker is the part that matters: several different kinds
            of human study share the same point, and only the sentence separates them.
          </p>
        </div>

        <div className="reading stack-6" style={{ marginTop: 'var(--s5)' }}>
          <div>
            <p className="small muted" style={{ marginBottom: 'var(--s3)' }}>
              A claim whose evidence stops at animal studies:
            </p>
            <EvidenceReach stage="animal_evidence" />
          </div>
          <div>
            <p className="small muted" style={{ marginBottom: 'var(--s3)' }}>
              A claim carried all the way to a regulator’s decision on one use:
            </p>
            <EvidenceReach stage="regulatory_evidence" />
          </div>
        </div>

        <h3 style={{ marginTop: 'var(--s7)' }}>Which stages sit where</h3>
        <dl className="facts" style={{ marginTop: 'var(--s4)' }}>
          {POSITION_STAGES.map((p) => (
            <div key={p.label}>
              <dt>{p.label}</dt>
              <dd>{p.stages.map((stage) => canonicalStageLabel(stage)).join(' · ')}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section">
        <h2>Measured, inferred, unknown</h2>
        <p className="reading muted" style={{ marginTop: 'var(--s4)' }}>
          Every mechanism step and every cited source carries one of three labels. They are the only
          evidence-strength labels on the site: no star ratings, no confidence scores, no invented percentages.
        </p>
        <dl className="facts" style={{ marginTop: 'var(--s5)' }}>
          {EVIDENCE_STATUSES.map((status) => (
            <div key={status}>
              <dt>{EVIDENCE_STATUS_LABELS[status]}</dt>
              <dd>{EVIDENCE_STATUS_DEFINITIONS[status]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section">
        <h2>The eight stages behind them</h2>
        <p className="reading muted" style={{ marginTop: 'var(--s4)' }}>
          Underneath the five positions, a claim is stored at one of eight stages, weakest to strongest. The
          stage records how far the evidence has actually been carried — not how far people assume it has been
          carried, and not how far it may go later. The first three involve no human testing; the rest all do.
        </p>
        <ol className="numbered reading" style={{ marginTop: 'var(--s5)' }}>
          {PROOF_BOUNDARY_STAGES.map((stage) => (
            <li key={stage}>
              <div>
                <p className="numbered__h">{canonicalStageLabel(stage)}</p>
                <p className="small muted" style={{ marginBottom: 'var(--s2)' }}>
                  {HUMAN_TESTED_STAGES.has(stage) ? 'Tested in people' : 'No human testing'}
                </p>
                <p className="muted">{STAGE_EXPLANATIONS[stage]}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h2>How a source relates to a claim</h2>
        <p className="reading muted" style={{ marginTop: 'var(--s4)' }}>
          A claim is rarely backed by a single uncomplicated source. Each source is tagged with how it relates to
          the specific claim it is attached to.
        </p>
        <dl className="facts" style={{ marginTop: 'var(--s5)' }}>
          {EVIDENCE_RELATIONSHIPS.map((rel) => (
            <div key={rel}>
              <dt>{EVIDENCE_RELATIONSHIP_LABELS[rel]}</dt>
              <dd>{relationshipExplanation(rel)}</dd>
            </div>
          ))}
        </dl>
        <p className="reading muted" style={{ marginTop: 'var(--s5)' }}>
          Sources that contradict or limit a claim appear beside those that support it. A page citing only
          supporting evidence tells a reader less than it appears to.
        </p>
      </section>

      <section className="section" id="editorial-workflow">
        <h2>What “published” does and does not mean</h2>
        <div className="reading stack" style={{ marginTop: 'var(--s4)' }}>
          <p>
            A claim starts as a draft, becomes editorially complete once written and sourced, and can then be
            flagged for scientific review. A qualified reviewer examines it and records a decision. If it clears,
            the claim is marked approved, then published. A live claim can later be flagged as needing an update
            if the evidence may have moved, which triggers a re-review.
          </p>
          <p>
            “Published” means the page is live. It does not mean a scientific reviewer signed off. A claim can be
            published — written and sourced by an editor — while independent review is still pending.
          </p>
          <p>
            Every claim therefore shows one of these lines, generated from its actual review record rather than
            written by hand.
          </p>
        </div>
        <dl className="facts" style={{ marginTop: 'var(--s5)' }}>
          {REVIEW_LINES.map((r) => (
            <div key={r.key}>
              <dt>{r.key}</dt>
              <dd>
                <span style={{ color: 'var(--text)' }}>“{r.line}”</span>
                <span style={{ display: 'block', marginTop: 'var(--s1)' }}>{r.when}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="reading muted" style={{ marginTop: 'var(--s5)' }}>
          A reviewer’s name appears only when it comes from a review record tied to a real account with stated
          credentials. “Reviewed by” is never a decorative label, and no reviewer is invented.
        </p>
      </section>

      <section className="section" id="independence">
        <h2>Independence</h2>
        <div className="reading stack" style={{ marginTop: 'var(--s4)' }}>
          <p>
            Whoever profits from a treatment usually gets to define what “works” means for it. RNAwiki sells
            nothing — no products, no advertising, no sponsored placement — and applies one evidence scale to
            everything on the site.
          </p>
          <p>
            That runs in both directions, and the pages show it. Casgevy, an approved therapy from a large
            manufacturer with a $2.2 million list price, reaches a regulator’s review because a regulator
            examined its trials. Its answer still says those trials were single-arm with no control group,
            and opening the evidence adds that they were unblinded, industry-sponsored and had no independent
            replication cohort. BPC-157, sold online as a research chemical, stops at animal evidence for
            tendon healing, because no controlled human trial has published a result.
          </p>
          <p>
            Where a study’s funder has a stake in its outcome, the claim says so rather than burying it. The one
            completed human trial of rapamycin for healthy aging was sponsored by a company selling compounded
            rapamycin, and that appears on the claim itself.
          </p>
        </div>
      </section>

      <section className="section">
        <h2>Fixed rules</h2>
        <ul className="entries reading" style={{ marginTop: 'var(--s5)' }}>
          {FIXED_RULES.map((r) => (
            <li key={r.title}>
              <p>
                <strong>{r.title}</strong> <span className="muted">{r.body}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>What is checked automatically</h2>
        <div className="reading stack" style={{ marginTop: 'var(--s4)' }}>
          <p className="muted">
            The review line on each claim is computed from that claim’s stored review records, so it cannot be
            set by hand. Not every editorial step has an automated check yet; those are done by a person. No
            check is described here as existing before it does.
          </p>
          <p>
            <Link href="/evidence">How it works, including what this site cannot tell you</Link>
          </p>
        </div>
      </section>
    </div>
  )
}

function relationshipExplanation(rel: (typeof EVIDENCE_RELATIONSHIPS)[number]): string {
  switch (rel) {
    case 'supports':
      return 'The finding is consistent with the claim and points in its direction.'
    case 'contradicts':
      return 'The finding conflicts with the claim, or with other evidence cited for it.'
    case 'limits':
      return 'The finding narrows the claim — for example, it worked in one population, dose, or condition, but has not been shown more broadly.'
    case 'contextualizes':
      return 'The source does not directly support or oppose the claim, but helps explain the background needed to interpret it.'
  }
}
