import type { ReactNode } from 'react'

export interface TwoArmChangeData {
  duration: string
  outcome: string
  axisMax: number
  arms: readonly [{ label: string; change: number }, { label: string; change: number }]
  difference: number
  interval: readonly [number, number]
  unit: string
  caveat: string
}

/** A comparison of observed group means, never a percentage of people helped. */
export function TwoArmChangeFigure({ data }: { data: TwoArmChangeData }): ReactNode {
  if (
    !Number.isFinite(data.axisMax) ||
    data.axisMax <= 0 ||
    data.arms.some(
      (arm) => !Number.isFinite(arm.change) || arm.change < 0 || arm.change > data.axisMax,
    )
  ) {
    throw new Error('Two-arm figure needs finite changes within a positive axis')
  }

  return (
    <figure className="ev-change">
      <figcaption>Average change after {data.duration}</figcaption>
      <p>{data.outcome}.</p>
      <div className="ev-change-rows">
        {data.arms.map((arm) => (
          <div className="ev-change-row" key={arm.label}>
            <span>{arm.label}</span>
            <div aria-hidden="true" className="ev-change-track">
              <span style={{ width: `${(arm.change / data.axisMax) * 100}%` }} />
            </div>
            <strong>
              Drop: {arm.change} {data.unit}
            </strong>
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="ev-change-axis">
        <span>0</span>
        <span>
          {data.axisMax} {data.unit}
        </span>
      </div>
      <p className="ev-change-takeaway">
        <strong>
          {data.difference} {data.unit} more
        </strong>{' '}
        on average with {data.arms[0].label}. The uncertainty range for that extra change was{' '}
        {data.interval[0]}–{data.interval[1]} {data.unit}, so it could be close to zero.
      </p>
      <p className="ev-change-footnote">{data.caveat}</p>
    </figure>
  )
}
