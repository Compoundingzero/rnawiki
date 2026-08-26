import { CheckCircle2, CircleAlert, CircleHelp, CircleMinus, CircleX } from 'lucide-react'

import type { EvidenceNodeState, EvidenceNodeView } from '@/lib/medicine-dossier-view-model'

const statePresentation: Record<
  EvidenceNodeState,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  confirmed: {
    label: 'Supported',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: CheckCircle2,
  },
  contradicted: {
    label: 'Evidence points against it',
    className: 'border-rose-200 bg-rose-50 text-rose-900',
    icon: CircleX,
  },
  mixed: {
    label: 'Mixed findings',
    className: 'border-amber-200 bg-amber-50 text-amber-950',
    icon: CircleAlert,
  },
  unknown: {
    label: 'Not enough information',
    className: 'border-black/[0.1] bg-[#F5F5F7] text-[#515154]',
    icon: CircleHelp,
  },
  not_measured: {
    label: 'Not measured',
    className: 'border-black/[0.1] bg-[#F5F5F7] text-[#515154]',
    icon: CircleMinus,
  },
  recorded_context: {
    label: 'General background',
    className: 'border-blue-200 bg-blue-50 text-blue-900',
    icon: CircleHelp,
  },
}

export function evidenceNodeAnchorId(order: number): string {
  return `evidence-step-${order}`
}

function connectorClass(previous: EvidenceNodeState, current: EvidenceNodeState): string {
  if (previous === 'contradicted' || current === 'contradicted') {
    return 'border-rose-400 border-dashed'
  }
  if (previous === 'mixed' || current === 'mixed') {
    return 'border-amber-400 border-dashed'
  }
  if (
    previous === 'unknown' ||
    previous === 'not_measured' ||
    current === 'unknown' ||
    current === 'not_measured'
  ) {
    return 'border-black/25 border-dotted'
  }
  if (previous === 'recorded_context' || current === 'recorded_context') {
    return 'border-blue-300 border-dotted'
  }
  return 'border-emerald-400 border-solid'
}

/**
 * Wide-screen overview of the canonical five-step path. The complete node text, claims, and
 * sources remain in the vertical cards below; this overview is a compact index, never a score.
 */
export function DossierEvidencePath({ nodes }: { nodes: readonly EvidenceNodeView[] }) {
  if (nodes.length !== 5) return null

  return (
    <nav
      aria-label="Five evidence steps"
      className="relative hidden min-w-0 grid-cols-5 gap-3 py-2 lg:grid"
      data-testid="dossier-evidence-path"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[10%] right-[10%] top-10 grid grid-cols-4"
      >
        {nodes.slice(1).map((node, index) => (
          <span
            key={`connector-${node.id}`}
            className={`block border-t-2 ${connectorClass(nodes[index]!.state, node.state)}`}
          />
        ))}
      </span>
      {nodes.map((node) => {
        const presentation = statePresentation[node.state]
        const Icon = presentation.icon

        return (
          <a
            key={node.id}
            href={`#${evidenceNodeAnchorId(node.order)}`}
            className="relative z-10 min-w-0 rounded-2xl border border-black/[0.08] bg-white px-3 py-3 text-center shadow-[0_1px_6px_rgba(0,0,0,0.025)] hover:border-[#0071E3]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
          >
            <span
              className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border ${presentation.className}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="mt-2 block font-mono text-[11px] font-semibold uppercase tracking-wide text-[#6E6E73]">
              Step {node.order}
            </span>
            <span className="mt-1 block [overflow-wrap:anywhere] text-xs font-semibold leading-5 text-[#1D1D1F]">
              {node.label}
            </span>
            <span className="mt-1 block text-[11px] leading-4 text-[#515154]">
              {presentation.label}
            </span>
          </a>
        )
      })}
    </nav>
  )
}
