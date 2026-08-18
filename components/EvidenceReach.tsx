import { REACH_POSITIONS, stageToReachIndex, reachSentence } from '@/lib/evidence-view'
import type { ProofBoundaryStage } from '@/lib/evidence'

/**
 * How far the direct evidence has progressed. It does not say whether anyone should use the
 * treatment, and it is never a score.
 *
 * The list is an <ol> with the reached item marked in its own text, so the meaning survives with
 * CSS disabled, in print, and in a screen reader. The sentence below is not decorative — four
 * canonical stages share the "People" position and only the sentence separates them.
 */
export function EvidenceReach({ stage }: { stage: ProofBoundaryStage }) {
  const here = stageToReachIndex(stage)

  return (
    <figure className="reach">
      <ol className="reach__steps">
        {REACH_POSITIONS.map((label, i) => (
          <li
            key={label}
            className="reach__step"
            data-here={i === here ? 'true' : 'false'}
          >
            {label}
            {i === here && <span className="skip-link">— testing has reached this point</span>}
          </li>
        ))}
      </ol>
      <figcaption className="reach__caption">{reachSentence(stage)}</figcaption>
    </figure>
  )
}
