import { REACH_POSITIONS, stageToReachIndex, reachSentence } from '@/lib/evidence-view'
import type { ProofBoundaryStage } from '@/lib/evidence'

/**
 * How far the direct evidence has progressed. It does not say whether anyone should use the
 * treatment, and it is never a score.
 *
 * The list is an <ol> with the reached item marked in its own text, so the meaning survives with
 * CSS disabled, in print, and in a screen reader. The sentence below is not decorative — four
 * canonical stages share the "People" position and only the sentence separates them.
 *
 * `showCaption` defaults to true and NO CALLER CURRENTLY TURNS IT OFF. It was off inside the
 * Evidence Record on the argument that the identical sentence sits "about one screen above" on the
 * claim itself; measured at 390px that distance is about 1,700px with five section headings in it,
 * which is not one screen and not a duplication a reader can see. An axis with no sentence cannot
 * tell an uncontrolled two-person pilot from a replicated controlled trial, and that distinction is
 * the most consequential thing this site prints. Turn it off only where the same sentence is
 * visible in the same viewport, and say in the call site how you measured that.
 */
export function EvidenceReach({
  stage,
  showCaption = true,
}: {
  stage: ProofBoundaryStage
  showCaption?: boolean
}) {
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
      {showCaption && <figcaption className="reach__caption">{reachSentence(stage)}</figcaption>}
    </figure>
  )
}
