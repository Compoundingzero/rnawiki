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
    'A plausible mechanism has been proposed — for example, how a molecule might interact with a known receptor or pathway — but it has not yet been tested in cells, animals, or people.',
  isolated_cell_evidence:
    'An effect has been observed in cells in a dish (in vitro). This can show a mechanism is biologically active on isolated cells under laboratory conditions. It does not show the same thing happens inside a living body.',
  animal_evidence:
    'An effect has been observed in a whole living animal. This is a step closer to a working biological system than a cell study, but animal physiology differs from human physiology in ways that regularly cause effects seen in animals not to reproduce in people.',
  observational_human_evidence:
    'Researchers found a pattern or association in human data — for example, comparing people who already happened to use something with people who did not. No one assigned who received what, so the comparison can be confounded by other differences between the groups. Association is not the same as cause.',
  uncontrolled_human_intervention:
    'People were deliberately given the treatment as part of a study and outcomes were measured, but without a comparison group. Without knowing what would have happened anyway, it is hard to say how much of the outcome the treatment caused.',
  controlled_human_evidence:
    'A study compared people who received the treatment against a comparison group (such as a placebo or standard care), which allows the result to be attributed to the treatment with more confidence than an uncontrolled study or an observation.',
  independently_supported_controlled_human_evidence:
    'More than one controlled human study, run by separate research groups with no shared authors or funding relationship, has found a similar result on the same question. Independent replication is one of the strongest available checks against a single study’s own errors, biases, or chance findings.',
  regulatory_evidence:
    'A medicines regulator (such as the FDA, EMA, or Singapore’s HSA) has formally reviewed the evidence base and approved the substance for a specific use in a specific population. This is a distinct kind of evidence: an accountable regulatory decision, not simply another study.',
}

export default function MethodologyPage() {
  return (
    <div className="container prose-width" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>Methodology</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
          RNAwiki exists to show where research evidence actually ends, and where interpretation begins. This
          page explains the system we use to do that, and what our editorial labels do and do not mean.
        </p>
      </header>

      <section style={{ marginBottom: 'var(--space-8)' }} id="measured-inferred-unknown">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>Measured, Inferred, Unknown</h2>
        <p>
          Every mechanism step and every piece of cited evidence on RNAwiki is labeled with one of three
          statuses. These are the only evidence-strength labels the site uses — there are no star ratings, no
          numeric confidence scores, and no percentages invented to summarize how &ldquo;good&rdquo; the evidence is.
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
          Every claim on RNAwiki is placed at one of eight stages, ordered here from the weakest kind of
          evidence to the strongest. The Proof Boundary marks the point on this ladder that a claim has
          actually reached &mdash; not the point people commonly assume it has reached, and not the point it
          might reach in the future.
        </p>
        <p>
          Stages 1&ndash;3 involve no human testing at all. Stages 4&ndash;8 all involve testing in people, in
          increasingly rigorous forms.
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
          A claim is rarely backed by a single, uncomplicated source. Each source we cite is tagged with how it
          actually relates to the specific claim it&rsquo;s attached to:
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
          We deliberately show sources that <strong>contradict</strong> or <strong>limit</strong> a claim
          alongside sources that support it. A claim page that only ever cited supporting evidence would be
          telling you less than it appears to.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="editorial-workflow">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>What &ldquo;published&rdquo; does and does not mean</h2>
        <p>
          Behind every claim is an editorial workflow with several stages: a claim starts as a{' '}
          <strong>draft</strong>, moves to <strong>editorially complete</strong> once the writing and sourcing
          work is done, and can then be flagged as <strong>scientific review required</strong>. From there a
          qualified reviewer examines it and records a formal decision. If it clears review the claim can be
          marked <strong>approved</strong> and then <strong>published</strong> &mdash; made visible on the public
          site. A live claim can later be flagged <strong>needs update</strong> if the underlying evidence may
          have moved, which can trigger a fresh <strong>re-review</strong> pass.
        </p>
        <p>
          <strong>This is the part we want to be completely explicit about:</strong> &ldquo;published&rdquo;
          describes whether a page is live on the public site. It is a separate fact from whether a qualified
          scientific reviewer has actually signed off on the content. A claim can be published — meaning an
          editor has finished writing and sourcing it — while still waiting on independent scientific review.
        </p>
        <p>
          So every claim on the site shows one of these lines, generated automatically from what is actually
          recorded about it, not written freehand by an editor:
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
          A reviewer&rsquo;s name is only ever shown when it comes from an actual review record tied to a real
          account with stated credentials. We do not write &ldquo;reviewed by&rdquo; as a decorative label, and
          we never invent a reviewer.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }} id="rules">
        <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-3)' }}>Rules we don&rsquo;t break</h2>
        <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-3)' }}>
          <li>
            <strong>No dosage calculators, protocol builders, stacking guidance, or procurement/self-use
            instructions.</strong> Never, in any form, anywhere on the site.
          </li>
          <li>
            <strong>No star ratings, and no numeric confidence scores or percentages</strong> unless a number is
            directly reported by a named study or regulator &mdash; in which case we cite it as their number,
            not ours.
          </li>
          <li>
            <strong>No brand recommendations.</strong> We identify substances by name where relevant to
            understanding what they are; we do not tell you what to buy or where.
          </li>
          <li>
            <strong>Harm-reduction framing, not encouragement,</strong> for anything not approved for general
            use. Documenting a risk plainly is not the same as endorsing the behavior that creates it.
          </li>
          <li>
            <strong>&ldquo;Not medical advice,&rdquo; with a real escalation path.</strong> Every page carries
            that statement, and it is paired with guidance to contact a qualified clinician &mdash; not left as
            a disclaimer standing alone.
          </li>
        </ul>
      </section>

      <section id="scope-note">
        <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>A note on what&rsquo;s enforced today</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Everything above describes rules this team follows and a labeling system that is live in the product
          right now — the review-status line described above is computed directly from the review records
          stored for each claim, not set by hand. RNAwiki is still an active rebuild, and not every editorial
          process is automated end-to-end yet. Where we haven&rsquo;t built an automated check for something, a
          human is doing that check by hand instead; we won&rsquo;t claim a gate exists before it does.
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
