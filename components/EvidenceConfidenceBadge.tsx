// The evidence-confidence pill, ported from the master reference wireframe
// (src/components/EvidenceConfidenceBadge.tsx). Every label, colour, radius, dot and size variant
// is the reference's, unchanged.
//
// It is a server component on purpose: it reads props, returns markup, and touches no browser API,
// so it renders straight into the HTML instead of costing the reader hydration.
//
// Two things differ from the reference file and neither is visual:
//
//  1. The reference imported four lucide icons (ShieldCheck, CheckCircle, AlertTriangle,
//     AlertCircle) and rendered none of them. Importing icons nothing draws ships bytes for a
//     picture that does not exist, so they are gone.
//  2. `React.FC` became a plain function declaration, matching every other component in this repo.
//
// The rule this component carries: the parenthesised score renders ONLY when a caller passes one.
// The reference already guarded on `score !== undefined` and that guard is load-bearing here — a
// confidence percentage printed beside a record that has no score would be a number the data does
// not support, which is the one thing this site exists to not do.

import type { AuditConfidence } from '@/lib/types'

export interface EvidenceConfidenceBadgeProps {
  confidence: AuditConfidence
  /** Rendered in parentheses as `(87%)`. Omit it and no number appears at all. */
  score?: number
  size?: 'sm' | 'md'
}

export function EvidenceConfidenceBadge({
  confidence,
  score,
  size = 'md',
}: EvidenceConfidenceBadgeProps) {
  let label = 'Replicated'
  let badgeClasses = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'

  switch (confidence) {
    case 'Rigorous Replicated':
      label = 'Replicated Evidence'
      badgeClasses = 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20'
      break
    case 'High Confidence':
      label = 'Pivotal Data'
      badgeClasses = 'bg-blue-500/10 text-[#0071E3] border-blue-500/20'
      break
    case 'Moderate / Debated':
      label = 'Investigational'
      badgeClasses = 'bg-amber-500/10 text-amber-800 border-amber-500/20'
      break
    case 'Inference Overreach Found':
      label = 'Under Audit'
      badgeClasses = 'bg-rose-500/10 text-rose-800 border-rose-500/20'
      break
  }

  const isSmall = size === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${badgeClasses} ${
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5'
      }`}
    >
      {/* Decorative — the colour is the signal and the label already says it in words. */}
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      <span>{label}</span>
      {score !== undefined && <span className="opacity-60 text-[10px] font-mono">({score}%)</span>}
    </span>
  )
}
