import type { Metadata } from 'next'
import Link from 'next/link'
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
import { EvidenceLadder } from '@/components/evidence/EvidenceLadder'

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
    <div className="wrap" style={{ paddingBlock: 'var(--s7)' }}>
      <div style={{ maxWidth: '56rem' }}>
        <header className="measure">
          <p className="eyebrow">Editorial standard</p>
          <h1 className="display" style={{ marginBlock: 'var(--s3) var(--s4)' }}>
            Methodology
          </h1>
          <p className="lead">How RNAwiki decides where evidence ends and interpretation begins.</p>
        </header>

        <hr className="rule" />

        {/* ----------------------------------------------------- independence */}
        <section id="independence" className="measure">
          <div className="section-head">
            <h2 className="h2">Independence</h2>
          </div>
          <div className="prose">
            <p>
              Whoever profits from a treatment usually gets to define what &ldquo;works&rdquo; means for it.
              RNAwiki sells nothing — no products, no advertising, no sponsored placement — and applies one
              evidence ladder to everything on the site.
            </p>
            <p>
              That runs in both directions, and the pages show it. Casgevy, an approved therapy from a large
              manufacturer with a $2.2 million list price, sits at regulatory evidence because a regulator
              reviewed its trials. Its page still records that those trials were single-arm, unblinded,
              industry-sponsored, and never independently replicated. BPC-157, sold online as a research
              chemical, sits at animal evidence for tendon healing, because no controlled human trial has
              published a result.
            </p>
            <p>
              Where a study&rsquo;s funder has a stake in its outcome, the claim says so rather than burying it.
              The one completed human trial of rapamycin for healthy aging was sponsored by a company selling
              compounded rapamycin, and that appears on the claim itself.
            </p>
          </div>
        </section>

        <hr className="rule" />

        {/* ------------------------------------------ measured/inferred/unknown */}
        <section id="measured-inferred-unknown">
          <div className="section-head">
            <h2 className="h2">Measured, Inferred, Unknown</h2>
          </div>
          <p className="prose measure" style={{ marginBottom: 'var(--s5)' }}>
            Every mechanism step and every cited source carries one of three labels. They are the only
            evidence-strength labels on the site: no star ratings, no confidence scores, no invented
            percentages.
          </p>
          <dl className="speclabel">
            {EVIDENCE_STATUSES.map((status) => (
              <div key={status} className="speclabel__row">
                <dt className="speclabel__key">
                  <span className="tag" data-status={status}>
                    {EVIDENCE_STATUS_LABELS[status]}
                  </span>
                </dt>
                <dd className="speclabel__val" style={{ margin: 0 }}>
                  {EVIDENCE_STATUS_DEFINITIONS[status]}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <hr className="rule" />

        {/* --------------------------------------------------- proof boundary */}
        <section id="proof-boundary">
          <div className="section-head">
            <h2 className="h2">The 8 Proof Boundary stages</h2>
          </div>
          <p className="prose measure">
            Every claim sits at one of eight stages, weakest to strongest. The Proof Boundary marks the stage a
            claim has actually reached — not the one people assume it has reached, and not the one it may reach
            later. Stages 1&ndash;3 involve no human testing. Stages 4&ndash;8 all do.
          </p>

          <div style={{ marginTop: 'var(--s6)', display: 'grid', gap: 'var(--s6)' }}>
            <EvidenceLadder
              stage="animal_evidence"
              caption="Illustration: a claim whose evidence stops at animal studies. The filled rule shows how far it reaches, the square marks where it stops, and everything to the right is untested."
            />
            <EvidenceLadder
              stage="regulatory_evidence"
              caption="Illustration: a claim carried all the way to a regulator’s decision on one indication."
            />
          </div>

          <ol
            style={{
              listStyle: 'none',
              marginTop: 'var(--s6)',
              borderTop: 'var(--hairline) solid var(--border-strong)',
            }}
          >
            {PROOF_BOUNDARY_STAGES.map((stage, i) => (
              <li
                key={stage}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5rem minmax(0, 1fr)',
                  gap: 'var(--s4)',
                  paddingBlock: 'var(--s4)',
                  borderBottom: 'var(--hairline) solid var(--border)',
                }}
              >
                <span className="eyebrow" style={{ paddingTop: '0.2rem' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3
                    className="h4"
                    style={{ fontFamily: 'var(--font-serif)', marginBottom: 'var(--s2)' }}
                  >
                    {PROOF_BOUNDARY_LABELS[stage]}
                  </h3>
                  <p style={{ marginBottom: 'var(--s2)' }}>
                    <span className="tag">
                      {HUMAN_TESTED_STAGES.has(stage) ? 'Tested in people' : 'No human testing'}
                    </span>
                  </p>
                  <p className="prose measure" style={{ fontSize: 'var(--size-small)' }}>
                    {STAGE_EXPLANATIONS[stage]}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <hr className="rule" />

        {/* ------------------------------------------- evidence relationships */}
        <section id="evidence-relationships">
          <div className="section-head">
            <h2 className="h2">How a source relates to a claim</h2>
          </div>
          <p className="prose measure" style={{ marginBottom: 'var(--s5)' }}>
            A claim is rarely backed by a single uncomplicated source. Each source is tagged with how it relates
            to the specific claim it is attached to:
          </p>
          <dl className="speclabel">
            {EVIDENCE_RELATIONSHIPS.map((rel) => (
              <div key={rel} className="speclabel__row">
                <dt className="speclabel__key">{EVIDENCE_RELATIONSHIP_LABELS[rel]}</dt>
                <dd className="speclabel__val" style={{ margin: 0 }}>
                  {relationshipExplanation(rel)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="prose measure" style={{ marginTop: 'var(--s5)' }}>
            Sources that <strong>contradict</strong> or <strong>limit</strong> a claim appear beside those that
            support it. A page citing only supporting evidence tells you less than it appears to.
          </p>
        </section>

        <hr className="rule" />

        {/* -------------------------------------------- what published means -- */}
        <section id="editorial-workflow">
          <div className="section-head">
            <h2 className="h2">What &ldquo;published&rdquo; does and does not mean</h2>
          </div>
          <div className="prose measure">
            <p>
              A claim starts as a <strong>draft</strong>, becomes <strong>editorially complete</strong> once
              written and sourced, and can then be flagged <strong>scientific review required</strong>. A
              qualified reviewer examines it and records a decision. If it clears, the claim is marked{' '}
              <strong>approved</strong>, then <strong>published</strong>. A live claim can later be flagged{' '}
              <strong>needs update</strong> if the evidence may have moved, triggering{' '}
              <strong>re-review</strong>.
            </p>
            <p>
              &ldquo;Published&rdquo; means the page is live. It does not mean a scientific reviewer signed off.
              A claim can be published — written and sourced by an editor — while independent review is still
              pending.
            </p>
            <p>
              Every claim therefore shows one of these lines, generated from its actual review record rather
              than written by hand:
            </p>
          </div>
          <dl className="speclabel" style={{ marginTop: 'var(--s5)' }}>
            {REVIEW_LINES.map((r) => (
              <div key={r.key} className="speclabel__row">
                <dt className="speclabel__key">{r.key}</dt>
                <dd className="speclabel__val" style={{ margin: 0 }}>
                  <span style={{ color: 'var(--ink)' }}>&ldquo;{r.line}&rdquo;</span>
                  <span style={{ display: 'block', color: 'var(--muted)', marginTop: '0.25rem' }}>
                    {r.when}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="prose measure" style={{ marginTop: 'var(--s5)' }}>
            A reviewer&rsquo;s name appears only when it comes from a review record tied to a real account with
            stated credentials. &ldquo;Reviewed by&rdquo; is never a decorative label, and no reviewer is
            invented.
          </p>
        </section>

        <hr className="rule" />

        {/* -------------------------------------------------------- the rules */}
        <section id="rules">
          <div className="section-head">
            <h2 className="h2">Fixed rules</h2>
          </div>
          <ul style={{ listStyle: 'none', borderTop: 'var(--hairline) solid var(--border)' }}>
            {FIXED_RULES.map((r) => (
              <li
                key={r.title}
                style={{
                  borderBottom: 'var(--hairline) solid var(--border)',
                  paddingBlock: 'var(--s4)',
                }}
              >
                <p className="prose measure">
                  <strong>{r.title}</strong> {r.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <hr className="rule" />

        {/* ---------------------------------------------------- what is gated */}
        <section id="scope-note" className="measure">
          <div className="section-head">
            <h2 className="h2">What is enforced automatically</h2>
          </div>
          <p className="prose">
            The review-status line above is computed from each claim&rsquo;s stored review records, so it cannot
            be set by hand. Not every editorial step has an automated check yet; those are done by a person. No
            gate is described here as existing before it does.
          </p>
          <p className="prose" style={{ marginTop: 'var(--s4)' }}>
            <Link href="/evidence">How RNAwiki is made, including what it cannot establish →</Link>
          </p>
        </section>
      </div>
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
