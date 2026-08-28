import type { MedicineBackgroundContextView } from '@/lib/medicine-background-view'

type AnatomyTargetView = NonNullable<MedicineBackgroundContextView['anatomyTargets']>[number]

/**
 * The systemic target map. Every dot is a recorded anatomy-region code from the controlled
 * vocabulary — its position belongs to the vocabulary, so nothing is ever guessed from free text.
 * The figure is decorative; the list beside it is the accessible content.
 */
export function AnatomyTargetMap({ targets }: { targets: readonly AnatomyTargetView[] }) {
  if (targets.length === 0) return null

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
      <ul className="min-w-0 space-y-3" aria-label="Recorded body regions this medicine acts on">
        {targets.map((target, index) => (
          <li
            key={`${target.regionCode}-${index}`}
            className="min-w-0 rounded-2xl border border-black/[0.08] bg-white p-4"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF5FF] font-mono text-xs font-bold text-[#0066CC]"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5 text-[#1D1D1F]">
                  {target.regionLabel}
                </p>
                <p className="mt-1 [overflow-wrap:anywhere] text-sm leading-6 text-[#424245]">
                  {target.action}
                </p>
                <p className="mt-1.5 font-mono text-[11px] leading-4 text-[#6E6E73]">
                  {target.source.kindLabel} · fetched {target.source.retrievedAt}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div
        aria-hidden="true"
        className="hidden flex-col items-center rounded-2xl border border-black/[0.08] bg-white p-4 lg:flex"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6E6E73]">
          Recorded regions
        </span>
        <svg viewBox="0 0 200 280" className="mt-2 w-full max-w-[170px] stroke-stone-300">
          <g fill="none" strokeWidth="1.5">
            <path d="M100 20 C112 20 120 28 120 40 C120 52 112 60 100 60 C88 60 80 52 80 40 C80 28 88 20 100 20 Z" />
            <path d="M100 60 L100 70" />
            <path d="M60 90 C60 75 75 70 100 70 C125 70 140 75 140 90 L145 150 C145 160 135 170 100 170 C65 170 55 160 55 150 Z" />
            <path d="M80 170 L75 250 M120 170 L125 250" />
            <path d="M60 90 L38 150 M140 90 L162 150" />
          </g>
          {targets.map((target, index) => (
            <g key={`${target.regionCode}-dot-${index}`}>
              <circle
                cx={target.x}
                cy={target.y}
                r="7"
                className="fill-[#0066CC]/15 stroke-[#0066CC]"
                strokeWidth="1"
              />
              <text
                x={target.x}
                y={target.y + 3}
                textAnchor="middle"
                className="fill-[#0066CC] font-mono text-[8px] font-bold"
                stroke="none"
              >
                {index + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
