// The deterministic sweep, made visible.
//
// The master reference wireframe computed a full three-layer RnaIntelligenceReport inside the
// editor's useMemo and then rendered exactly one line from it:
//
//     Valid Chemical Formula ({report.layer1.validLength} characters)
//
// hard-coded emerald, printed whether or not the report had actually passed. That is the single
// worst line in the wireframe: it is a green tick asserted by the layout rather than by the engine,
// on a product whose whole claim is that it separates what was measured from what was inferred.
// This component is the replacement. Every colour, every chip and every sentence below is read off
// the report; nothing is asserted by the markup.
//
// Deliberately NOT a client component. It has real interactivity — three collapsible sections —
// but `<details>`/`<summary>` gives that natively, so the review queue and any other server page
// can render a stored report without shipping JavaScript, and a contributor with JS disabled can
// still open the sections.

import { AlertTriangle, CheckCircle2, ChevronDown, ShieldCheck, XCircle } from 'lucide-react'
import { summariseReport } from '@/lib/rna-intelligence'
import type {
  Diagnostic,
  DiagnosticSeverity,
  RnaIntelligenceReport,
} from '@/lib/rna-intelligence/types'

interface EngineDiagnosticsProps {
  report: RnaIntelligenceReport
  /**
   * `full` is the whole report: headline, computed facts, three collapsible layers.
   * `strip` is the headline alone, for the persistent status bar the editor keeps above its footer
   * so a contributor editing pricing still sees that the structure is failing.
   */
  variant?: 'full' | 'strip'
  className?: string
}

// ---------------------------------------------------------------------------
// Tone — one place, so the strip and the full report can never disagree
// ---------------------------------------------------------------------------

type Tone = 'pass' | 'warn' | 'fail'

const TONE_SHELL: Record<Tone, string> = {
  pass: 'bg-emerald-50 border-emerald-500/20 text-emerald-900',
  warn: 'bg-amber-50 border-amber-500/20 text-amber-900',
  fail: 'bg-rose-50 border-rose-500/20 text-rose-900',
}

const TONE_ICON: Record<Tone, string> = {
  pass: 'text-emerald-600',
  warn: 'text-amber-600',
  fail: 'text-rose-600',
}

const SEVERITY_TEXT: Record<DiagnosticSeverity, string> = {
  pass: 'text-emerald-700',
  warning: 'text-amber-700',
  error: 'text-rose-700',
}

/** Screen-reader wording for a severity. The colour alone must never be the only signal. */
const SEVERITY_LABEL: Record<DiagnosticSeverity, string> = {
  pass: 'Passed',
  warning: 'Warning',
  error: 'Error',
}

// ---------------------------------------------------------------------------
// Number formatting
// ---------------------------------------------------------------------------

/**
 * Rounds to at most `places` decimals and drops trailing zeros.
 *
 * `toFixed` is avoided on purpose: it turns a GC content of 48 into "48.0", which reads as a
 * measurement taken to one decimal place. The engine's number is the fact; this only stops a
 * floating-point tail from spilling across the chip.
 */
function num(value: number, places = 2): string {
  const factor = 10 ** places
  return String(Math.round(value * factor) / factor)
}

// ---------------------------------------------------------------------------
// Small parts
// ---------------------------------------------------------------------------

function SpecChip({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="px-2.5 py-1.5 rounded-lg bg-white border border-black/[0.06] min-w-0">
      <span className="text-[10px] font-bold text-[#86868B] block leading-tight">{label}</span>
      <span
        className={`text-xs font-semibold text-[#1D1D1F] break-words ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}

/** A wide value that must not wrap mid-token: dot-bracket notation, a topological order. */
function SpecBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2.5 py-1.5 rounded-lg bg-white border border-black/[0.06] overflow-hidden">
      <span className="text-[10px] font-bold text-[#86868B] block leading-tight mb-1">{label}</span>
      <div className="overflow-x-auto scrollbar-thin">
        <code className="font-mono text-[11px] text-[#1D1D1F] whitespace-pre">{value}</code>
      </div>
    </div>
  )
}

function DiagnosticRow({ diagnostic }: { diagnostic: Diagnostic }) {
  return (
    <li className="flex items-start gap-2">
      <code className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-black/[0.06] text-[#6E6E73] shrink-0">
        {diagnostic.code}
      </code>
      <span className={`text-xs leading-relaxed ${SEVERITY_TEXT[diagnostic.severity]}`}>
        <span className="sr-only">{SEVERITY_LABEL[diagnostic.severity]}: </span>
        {diagnostic.message}
        {diagnostic.position !== undefined && (
          <span className="text-[#86868B]"> (position {diagnostic.position})</span>
        )}
      </span>
    </li>
  )
}

function LayerSection({
  title,
  passed,
  diagnostics,
}: {
  title: string
  passed: boolean
  diagnostics: readonly Diagnostic[]
}) {
  const errorCount = diagnostics.filter((d) => d.severity === 'error').length
  // Open by default when this layer is what is blocking the edit. A contributor should not have to
  // hunt for the reason their save button is disabled.
  const open = errorCount > 0

  return (
    <details open={open} className="group rounded-xl bg-[#F5F5F7] border border-black/[0.06]">
      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer px-3 py-2.5 flex items-center gap-2">
        <ChevronDown
          className="w-3.5 h-3.5 text-[#86868B] transition-transform group-open:rotate-180 shrink-0"
          aria-hidden="true"
        />
        <span className="text-xs font-bold text-[#1D1D1F] flex-1 min-w-0">{title}</span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
            passed
              ? 'text-emerald-800 bg-emerald-50 border-emerald-500/20'
              : 'text-rose-800 bg-rose-50 border-rose-500/20'
          }`}
        >
          {passed ? 'Passed' : 'Failed'}
        </span>
        <span className="text-[10px] font-semibold text-[#86868B] tabular-nums">
          {diagnostics.length} {diagnostics.length === 1 ? 'finding' : 'findings'}
        </span>
      </summary>

      <div className="px-3 pb-3">
        {diagnostics.length === 0 ? (
          <p className="text-xs text-[#86868B]">This layer reported nothing.</p>
        ) : (
          <ul className="space-y-1.5">
            {diagnostics.map((diagnostic, idx) => (
              <DiagnosticRow key={`${diagnostic.code}-${idx}`} diagnostic={diagnostic} />
            ))}
          </ul>
        )}
      </div>
    </details>
  )
}

// ---------------------------------------------------------------------------
// Computed facts
// ---------------------------------------------------------------------------

/**
 * The chips a contributor actually wants back from a sweep.
 *
 * Every branch is a presence test. A field the engine did not compute — because the input was a
 * SMILES string and not a nucleotide sequence, because the protocol was empty — produces no chip
 * at all. There is no placeholder, no em dash, and no zero standing in for "unknown".
 */
function ComputedFacts({ report }: { report: RnaIntelligenceReport }) {
  const { layer1, layer2, layer3 } = report
  const chips: React.ReactNode[] = []
  const blocks: React.ReactNode[] = []

  if (layer1.baseCounts) {
    const b = layer1.baseCounts
    chips.push(
      <SpecChip
        key="bases"
        label="Base counts"
        mono
        value={`A ${b.A} · U ${b.U} · C ${b.C} · G ${b.G}`}
      />,
    )
  }

  if (layer1.gcContentPercent !== undefined) {
    chips.push(
      <SpecChip key="gc" label="GC content" value={`${num(layer1.gcContentPercent, 1)}%`} />,
    )
  }

  if (layer1.chemicalFormula) {
    chips.push(<SpecChip key="formula" label="Formula" mono value={layer1.chemicalFormula} />)
  }

  // The estimate string is the engine's own rendering; the raw dalton count is the fallback so a
  // report that carries only the number still shows it.
  const weight =
    layer1.molecularWeightEstimate ??
    (layer1.molecularWeightDaltons !== undefined
      ? `${num(layer1.molecularWeightDaltons, 1)} Da`
      : undefined)
  if (weight) {
    chips.push(<SpecChip key="mw" label="Molecular weight" mono value={weight} />)
  }

  if (layer1.aminoAcidCount !== undefined) {
    chips.push(<SpecChip key="aa" label="Residues" value={String(layer1.aminoAcidCount)} />)
  }

  if (layer1.transcribedThymineCount !== undefined && layer1.transcribedThymineCount > 0) {
    chips.push(
      <SpecChip
        key="thymine"
        label="Thymine transcribed to uracil"
        value={String(layer1.transcribedThymineCount)}
      />,
    )
  }

  // Reading frame is assembled from whichever coding checks the engine ran, so a partial answer
  // stays a partial answer rather than being padded into a full sentence.
  const frame: string[] = []
  if (layer1.isMultipleOfThree !== undefined) {
    frame.push(layer1.isMultipleOfThree ? 'in frame' : 'not a multiple of 3')
  }
  if (layer1.hasStartCodon !== undefined) {
    frame.push(layer1.hasStartCodon ? 'AUG start' : 'no start codon')
  }
  if (layer1.hasStopCodon !== undefined) {
    frame.push(layer1.hasStopCodon ? 'stop codon found' : 'no stop codon')
  }
  if (layer1.openReadingFrameLength !== undefined) {
    frame.push(`ORF ${layer1.openReadingFrameLength} codons`)
  }
  if (layer1.prematureStopAt !== undefined) {
    frame.push(`premature stop at codon ${layer1.prematureStopAt}`)
  }
  if (frame.length > 0) {
    chips.push(<SpecChip key="frame" label="Reading frame" value={frame.join(' · ')} />)
  }

  if (layer2.mfeDeltaG !== undefined) {
    chips.push(
      <SpecChip key="mfe" label="MFE ΔG" mono value={`${num(layer2.mfeDeltaG)} kcal/mol`} />,
    )
  }

  if (layer2.lipinskiViolations !== undefined) {
    chips.push(
      <SpecChip
        key="lipinski"
        label="Lipinski violations"
        value={String(layer2.lipinskiViolations)}
      />,
    )
  }

  if (layer2.secondaryStructureNotation) {
    blocks.push(
      <SpecBlock
        key="dotbracket"
        label="Predicted secondary structure"
        value={layer2.secondaryStructureNotation}
      />,
    )
  }

  if (layer3.topologicalOrder.length > 0) {
    blocks.push(
      <SpecBlock key="topo" label="Protocol order" value={layer3.topologicalOrder.join('  →  ')} />,
    )
  }

  if (chips.length === 0 && blocks.length === 0) return null

  return (
    <div className="space-y-2">
      {chips.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{chips}</div>}
      {blocks.length > 0 && <div className="space-y-2">{blocks}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// The component
// ---------------------------------------------------------------------------

export function EngineDiagnostics({ report, variant = 'full', className }: EngineDiagnosticsProps) {
  // One sentence and one tone, from lib/rna-intelligence. The editor, the review queue and the API
  // all describe the same report the same way because none of them writes that sentence itself.
  const { headline, tone } = summariseReport(report)
  const Icon = tone === 'pass' ? CheckCircle2 : tone === 'warn' ? AlertTriangle : XCircle

  return (
    <div className={className}>
      <div className={`p-3 rounded-xl border flex items-start gap-2 ${TONE_SHELL[tone]}`}>
        <Icon className={`w-4 h-4 shrink-0 mt-px ${TONE_ICON[tone]}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold leading-relaxed">{headline}</p>

          {/*
            The badge appears only on a passing report, and it is the engine's own hash — the same
            string a reviewer can recompute from the submitted structure. It is never composed here
            out of a drug id or a timestamp.
          */}
          {report.overallPassed && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-800">
              <ShieldCheck className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>Machine-Verified Structure</span>
              <span aria-hidden="true">·</span>
              <code className="font-mono tracking-tight">{report.verificationHash}</code>
            </p>
          )}
        </div>
      </div>

      {variant === 'full' && (
        <div className="mt-3 space-y-3">
          <ComputedFacts report={report} />

          <div className="space-y-2">
            <LayerSection
              title="Layer 1 · Sequence"
              passed={report.layer1.passed}
              diagnostics={report.layer1.diagnostics}
            />
            <LayerSection
              title="Layer 2 · Thermodynamics"
              passed={report.layer2.passed}
              diagnostics={report.layer2.diagnostics}
            />
            <LayerSection
              title="Layer 3 · Protocol DAG"
              passed={report.layer3.passed}
              diagnostics={report.layer3.diagnostics}
            />
          </div>

          <p className="text-[10px] text-[#86868B] leading-relaxed">
            Swept by {report.engineVersion}. The same input produces the same report on any machine.
          </p>
        </div>
      )}
    </div>
  )
}

export default EngineDiagnostics
