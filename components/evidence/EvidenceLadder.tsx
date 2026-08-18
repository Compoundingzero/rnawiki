import { PROOF_BOUNDARY_STAGES, PROOF_BOUNDARY_LABELS, stageRank, type ProofBoundaryStage } from '@/lib/evidence'

/**
 * The evidence ladder. Eight stages on a rule; stages the evidence actually
 * reaches are filled, the stage it stops at is a square accent terminator, and
 * everything past it stays hollow.
 *
 * It communicates by position and shape first — a reader with no colour vision,
 * or holding a printout, still sees where the fill stops. Colour is redundant
 * reinforcement. The <ol> underneath is a real ordered list, so the sequence is
 * conveyed to a screen reader without needing an image description.
 */

/** Two-word labels for the rail; the full labels live in lib/evidence.ts. */
const SHORT: Record<ProofBoundaryStage, string> = {
  biological_rationale_only: 'Rationale',
  isolated_cell_evidence: 'Cell',
  animal_evidence: 'Animal',
  observational_human_evidence: 'Observational',
  uncontrolled_human_intervention: 'Uncontrolled',
  controlled_human_evidence: 'Controlled',
  independently_supported_controlled_human_evidence: 'Replicated',
  regulatory_evidence: 'Regulatory',
}

export function EvidenceLadder({ stage, caption }: { stage: ProofBoundaryStage; caption?: string }) {
  const reached = stageRank(stage)

  return (
    <figure style={{ margin: 0 }}>
      <ol
        className="ladder"
        aria-label={`Evidence ladder. This claim reaches ${PROOF_BOUNDARY_LABELS[stage]}, stage ${reached + 1} of ${PROOF_BOUNDARY_STAGES.length}.`}
      >
        {PROOF_BOUNDARY_STAGES.map((s, i) => {
          const state = i < reached ? 'reached' : i === reached ? 'boundary' : 'unreached'
          return (
            <li key={s} className="ladder__step" data-state={state}>
              <span className="ladder__label">{SHORT[s]}</span>
              {state === 'boundary' && (
                <span
                  style={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    overflow: 'hidden',
                    clip: 'rect(0 0 0 0)',
                  }}
                >
                  (evidence stops here)
                </span>
              )}
            </li>
          )
        })}
      </ol>
      <figcaption className="ladder__caption">
        {caption ?? (
          <>
            Evidence reaches <strong>{PROOF_BOUNDARY_LABELS[stage]}</strong> — stage {reached + 1} of{' '}
            {PROOF_BOUNDARY_STAGES.length}.
          </>
        )}
      </figcaption>
    </figure>
  )
}
