import { ORGANISM_RUNGS } from '@/lib/corpus/organism-ladder'

/**
 * The organism ladder legend, drawn as one inline SVG.
 *
 * This is the recurring diagram of the corpus record: eight rungs, filled where a study reached
 * that organism and open where none did. The legend carries no compound and no claim — it shows
 * the two rung states and the rung order, so the diagram on a record needs no caption of its own.
 * Markup, not prose: every word inside the frame is a label.
 */

const ROW_HEIGHT = 26
const FIRST_ROW_CENTRE = 20
const BAR_X = 16
const BAR_WIDTH = 28
const BAR_HEIGHT = 7
const LABEL_X = 54

/** Highest rung first, the way the ladder is drawn. */
const ROWS = [...ORGANISM_RUNGS].reverse()

/** Filled in the legend only, to show the two states. Four rungs up, four rungs open. */
const FILLED_IN_LEGEND = new Set(['yeast', 'C. elegans', 'Drosophila', 'mouse'])

const KEY_ROWS: Array<{ filled: boolean; label: string }> = [
  { filled: true, label: 'evidence recorded' },
  { filled: false, label: 'no evidence recorded' },
]

const RAIL_BOTTOM = FIRST_ROW_CENTRE + (ROWS.length - 1) * ROW_HEIGHT + 8
const KEY_TOP = RAIL_BOTTOM + 22

export interface OrganismLadderLegendProps {
  /** Set when a page draws the legend more than once, so the SVG title id stays unique. */
  id?: string
  className?: string
}

export function OrganismLadderLegend({
  id = 'organism-ladder-legend',
  className,
}: OrganismLadderLegendProps) {
  const titleId = `${id}-title`

  return (
    <svg
      viewBox={`0 0 320 ${KEY_TOP + KEY_ROWS.length * 20 + 4}`}
      role="img"
      aria-labelledby={titleId}
      className={className ?? 'block h-auto w-full max-w-[22rem]'}
      style={{ fontFamily: 'inherit' }}
    >
      <title id={titleId}>
        Organism ladder legend: eight rungs, yeast at the foot and human at the top, filled where
        evidence is recorded and open where none is
      </title>

      <line
        x1={BAR_X + BAR_WIDTH / 2}
        y1={FIRST_ROW_CENTRE - 12}
        x2={BAR_X + BAR_WIDTH / 2}
        y2={RAIL_BOTTOM}
        style={{ stroke: 'var(--corpus-hairline)' }}
        strokeWidth={2}
      />

      {ROWS.map((row, index) => {
        const centre = FIRST_ROW_CENTRE + index * ROW_HEIGHT
        const filled = FILLED_IN_LEGEND.has(row.rung)
        return (
          <g key={row.rung}>
            <rect
              x={BAR_X}
              y={centre - BAR_HEIGHT / 2}
              width={BAR_WIDTH}
              height={BAR_HEIGHT}
              rx={BAR_HEIGHT / 2}
              style={
                filled
                  ? { fill: 'var(--corpus-accent)' }
                  : { fill: 'none', stroke: 'var(--corpus-ink-4)' }
              }
              strokeWidth={1.5}
            />
            <text
              x={LABEL_X}
              y={centre + 4}
              fontSize={12.5}
              style={{ fill: filled ? 'var(--corpus-ink-0)' : 'var(--corpus-ink-2)' }}
            >
              {row.label}
            </text>
          </g>
        )
      })}

      {KEY_ROWS.map((row, index) => {
        const centre = KEY_TOP + index * 20
        return (
          <g key={row.label}>
            <rect
              x={BAR_X}
              y={centre - BAR_HEIGHT / 2}
              width={BAR_WIDTH}
              height={BAR_HEIGHT}
              rx={BAR_HEIGHT / 2}
              style={
                row.filled
                  ? { fill: 'var(--corpus-accent)' }
                  : { fill: 'none', stroke: 'var(--corpus-ink-4)' }
              }
              strokeWidth={1.5}
            />
            <text
              x={LABEL_X}
              y={centre + 4}
              fontSize={11.5}
              style={{ fill: 'var(--corpus-ink-2)' }}
            >
              {row.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
