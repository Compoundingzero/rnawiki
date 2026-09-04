/**
 * The organism ladder (disclosure spec, base state item 2): eight rungs, filled where a study has a
 * recorded finding and drawn empty where it has none.
 *
 * The ladder is markup, so an empty rung states an absence without a "not recorded" line, and every
 * filled rung names its organism beside what that organism's study measured. The rung vocabulary is
 * read from `lib/corpus/organism-ladder.ts`, so the home legend and this diagram cannot drift.
 *
 * It sits in a horizontally scrollable region rather than shrinking: at 320 px a scaled eight-rung
 * diagram would put the organism names below legibility, and the page itself must not overflow.
 */
import type { CorpusLadderRung } from '@/lib/corpus/dossier-page'

// The end rungs carry their labels inside the frame: at 34 px in, "mechanism-only" under the first
// rung was clipped by the scroll container's edge.
const RUNG_GAP = 78
const FIRST_RUNG_X = 62
const AXIS_Y = 22

export function OrganismLadder({ rungs, name }: { rungs: CorpusLadderRung[]; name: string }) {
  const filled = rungs.filter((rung) => rung.filled)
  if (filled.length === 0) return null
  const width = FIRST_RUNG_X * 2 + RUNG_GAP * (rungs.length - 1)
  const description = `${name}: ${filled
    .map((rung) => `${rung.label}${rung.kind ? ` (${rung.kind})` : ''}`)
    .join(', ')} carry a recorded finding; the remaining rungs carry none.`

  return (
    <div className="cd-ladder">
      <div className="cd-ladder-scroll" tabIndex={0} role="group" aria-label="Organism ladder">
        <svg
          viewBox={`0 0 ${width} 76`}
          width={width}
          height={76}
          role="img"
          aria-label={description}
        >
          <line
            x1={FIRST_RUNG_X}
            y1={AXIS_Y}
            x2={FIRST_RUNG_X + RUNG_GAP * (rungs.length - 1)}
            y2={AXIS_Y}
            stroke="var(--corpus-hairline)"
            strokeWidth={1}
          />
          {rungs.map((rung, index) => {
            const x = FIRST_RUNG_X + index * RUNG_GAP
            return (
              <g key={rung.rung}>
                <circle
                  cx={x}
                  cy={AXIS_Y}
                  r={7}
                  fill={rung.filled ? 'var(--corpus-accent)' : 'var(--corpus-surface-0)'}
                  stroke={rung.filled ? 'var(--corpus-accent)' : 'var(--corpus-ink-4)'}
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={AXIS_Y + 26}
                  textAnchor="middle"
                  fontSize={11}
                  fill={rung.filled ? 'var(--corpus-ink-0)' : 'var(--corpus-ink-2)'}
                >
                  {rung.label.replace(/\s*\(.*\)$/, '')}
                </text>
                {rung.kind ? (
                  <text
                    x={x}
                    y={AXIS_Y + 42}
                    textAnchor="middle"
                    fontSize={10}
                    fill="var(--corpus-ink-2)"
                  >
                    {rung.kind}
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
