import type { Metadata } from 'next'
import {
  EVIDENCE_RELATIONSHIP_LABELS,
  EVIDENCE_RELATIONSHIPS,
  EVIDENCE_STATUS_DEFINITIONS,
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUSES,
  HUMAN_TESTED_STAGES,
  PROOF_BOUNDARY_LABELS,
  PROOF_BOUNDARY_STAGES,
  type ProofBoundaryStage,
} from '@/lib/evidence'

export const metadata: Metadata = {
  title: 'Methodology',
  description: 'How RNAwiki classifies evidence, what "Measured, Inferred, Unknown" mean, and what "published" does and does not tell you.',
}

// Plain-language description of what each Proof Boundary stage actually establishes. This is
// explanatory prose, not the controlled vocabulary itself — the stage list, ordering and labels
// are imported from lib/evidence.ts above and must never be redeclared or reworded here.
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

export default function MethodologyPage() {
  return (
    <div className="container prose-width" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>Methodology</h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)' }}>
          How RNAwiki decides where evidence ends and interpretation begins.
        </p>
      </header>

      <section style={{ marginBottom: 'var(--space-8)' }} id="measured-inferred-unknown">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>Measured, Inferred, Unknown</h2>
        <p>
          Every mechanism step and every cited source carries one of three labels. They are the only
          evidence-strength labels on the site: no star ratings, no confidence scores, no invented percentages.
        </p>
        <dl style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          {EVIDENCE_STATUSES.map((status) => (
            <div key={status}>
              <dt>
                <span className="evidence-label" data-status={status}>
                  {EVIDENCE_STATUS_LABELS[status]}
                </span>
              </dt>
              <dd style={{ margin: 'var(--space-2) 0 0' }}>{EVIDENCE_STATUS_DEFINITIONS[status]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="proof-boundary">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>The 8 Proof Boundary stages</h2>
        <p>
          Every claim sits at one of eight stages, weakest to strongest. The Proof Boundary marks the stage a
          claim has actually reached — not the one people assume it has reached, and not the one it may reach
          later. Stages 1&ndash;3 involve no human testing. Stages 4&ndash;8 all do.
        </p>
        <ol style={{ margin: 'var(--space-4) 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--space-4)' }}>
          {PROOF_BOUNDARY_STAGES.map((stage, i) => (
            <li
              key={stage}
              style={{
                display: 'grid',
                gridTemplateColumns: '2.2rem 1fr',
                gap: 'var(--space-3)',
                borderLeft: HUMAN_TESTED_STAGES.has(stage)
                  ? '3px solid var(--color-accent)'
                  : '3px solid var(--color-border-strong)',
                paddingLeft: 'var(--space-3)',
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--color-text-faint)' }}>{i + 1}</span>
              <div>
                <p style={{ margin: '0 0 var(--space-1)', fontWeight: 650 }}>{PROOF_BOUNDARY_LABELS[stage]}</p>
                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{STAGE_EXPLANATIONS[stage]}</p>
              </div>
            </li>
          ))}
        </ol>
        <p style={{ marginTop: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--color-text-faint)' }}>
          The teal-bordered stages (4&ndash;8) involve testing in people. The gray-bordered stages (1&ndash;3) do
          not.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="evidence-relationships">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>How a source relates to a claim</h2>
        <p>
          A claim is rarely backed by a single uncomplicated source. Each source is tagged with how it relates to
          the specific claim it is attached to:
        </p>
        <dl style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          {EVIDENCE_RELATIONSHIPS.map((rel) => (
            <div key={rel}>
              <dt style={{ fontWeight: 650 }}>{EVIDENCE_RELATIONSHIP_LABELS[rel]}</dt>
              <dd style={{ margin: 0, color: 'var(--color-text-muted)' }}>{relationshipExplanation(rel)}</dd>
            </div>
          ))}
        </dl>
        <p style={{ marginTop: 'var(--space-4)' }}>
          Sources that <strong>contradict</strong> or <strong>limit</strong> a claim appear beside those that
          support it. A page citing only supporting evidence tells you less than it appears to.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="editorial-workflow">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>What &ldquo;published&rdquo; does and does not mean</h2>
        <p>
          A claim starts as a <strong>draft</strong>, becomes <strong>editorially complete</strong> once written
          and sourced, and can then be flagged <strong>scientific review required</strong>. A qualified reviewer
          examines it and records a decision. If it clears, the claim is marked <strong>approved</strong>, then{' '}
          <strong>published</strong>. A live claim can later be flagged <strong>needs update</strong> if the
          evidence may have moved, triggering <strong>re-review</strong>.
        </p>
        <p>
          &ldquo;Published&rdquo; means the page is live. It does not mean a scientific reviewer signed off. A
          claim can be published — written and sourced by an editor — while independent review is still pending.
        </p>
        <p>
          Every claim therefore shows one of these lines, generated from its actual review record rather than
          written by hand:
        </p>
        <ul style={{ margin: 'var(--space-3) 0', paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-2)' }}>
          <li>
            <em>&ldquo;Editorial review completed. Independent scientific review pending.&rdquo;</em> &mdash; the
            default for a published claim. Editorial work is done; no qualified scientific reviewer has approved
            it yet.
          </li>
          <li>
            <em>&ldquo;Editorial review completed.&rdquo;</em>, together with a named reviewer and their
            credentials &mdash; shown only when the most recent formal review on record for that claim has an
            approved decision from an identified scientific reviewer.
          </li>
          <li>
            <em>&ldquo;This claim is flagged for update &mdash; evidence may have changed since the last
            review.&rdquo;</em> &mdash; the claim is marked <strong>needs update</strong>.
          </li>
          <li>
            <em>&ldquo;This claim is undergoing re-review.&rdquo;</em> &mdash; the claim is marked{' '}
            <strong>re-review</strong>.
          </li>
        </ul>
        <p>
          A reviewer&rsquo;s name appears only when it comes from a review record tied to a real account with
          stated credentials. &ldquo;Reviewed by&rdquo; is never a decorative label, and no reviewer is invented.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="rules">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>Fixed rules</h2>
        <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-3)' }}>
          <li>
            <strong>No dosage calculators, protocol builders, stacking guidance, or procurement and self-use
            instructions.</strong> In any form, anywhere on the site.
          </li>
          <li>
            <strong>No star ratings, confidence scores, or percentages</strong> unless a named study or regulator
            reported that number, in which case it is cited as theirs.
          </li>
          <li>
            <strong>No brand recommendations.</strong> Substances are named where that identifies what they are.
            What to buy, and where, is not covered.
          </li>
          <li>
            <strong>Harm-reduction framing, not encouragement,</strong> for anything unapproved. Documenting a
            risk plainly is not endorsing the behaviour that creates it.
          </li>
          <li>
            <strong>&ldquo;Not medical advice,&rdquo; with an escalation path.</strong> Every page carries the
            statement paired with guidance to contact a clinician, rather than a disclaimer standing alone.
          </li>
        </ul>
      </section>

      <section id="scope-note">
        <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>What is enforced automatically</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          The review-status line above is computed from each claim&rsquo;s stored review records, so it cannot be
          set by hand. Not every editorial step has an automated check yet; those are done by a person. No gate
          is described here as existing before it does.
        </p>
      </section>
    </div>
  )
}

function relationshipExplanation(rel: (typeof EVIDENCE_RELATIONSHIPS)[number]): string {
  switch (rel) {
    case 'supports':
      return 'The finding is consistent with the claim and points in its direction.'
    case 'contradicts':
      return "The finding conflicts with the claim, or with other evidence cited for it."
    case 'limits':
      return 'The finding narrows the claim — for example, it worked in one population, dose, or condition, but not shown more broadly.'
    case 'contextualizes':
      return "The source doesn't directly support or oppose the claim, but helps explain the background needed to interpret it."
  }
}
