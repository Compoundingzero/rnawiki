'use client'

/**
 * The specialist editor — a port of the master reference wireframe's
 * `src/components/RnaWikiEditorModal.tsx` (697 lines).
 *
 * The shell is the reference's, class for class: the Sparkles top bar, the five-tab switcher with
 * its icons and active styling, the scrolling body, the Cancel / "Save & Publish Changes" footer,
 * and every field on every tab. What changed, and only this:
 *
 * 1. localStorage became the server. The reference mutated a `DrugDossier` in place and handed it
 *    to `onSaveDossier`. Here a save is `api.submitRevision`, and what comes back decides what the
 *    contributor is told: published, or queued for a person to read.
 * 2. Signed out, the form does not render. The reference took an `onOpenAuth` prop and never
 *    called it, so a signed-out reader could fill in every field and only discover at save time
 *    that nothing was going anywhere.
 * 3. THE DETERMINISTIC SWEEP IS THE POINT OF THIS MODAL, AND THE REFERENCE HID IT. It computed a
 *    full three-layer report in a `useMemo` and rendered one line from it —
 *    "Valid Chemical Formula (n characters)" — hard-coded emerald, printed whether or not the
 *    report had passed. Here the sweep runs on the server (`api.sweep`), the whole report is
 *    rendered by `<EngineDiagnostics />`, and its verdict is wired to the Save button: a failing
 *    structure cannot be submitted. That is the brief's "instant rejection", enforced in the UI as
 *    well as on the server.
 * 4. Every hard-coded fallback is deleted. The reference seeded the sequence field with a
 *    per-drug literal (`drug.id === 'inclisiran' ? 'AUGUC…'`), and pre-filled each new alternative
 *    row with a dosage, a monthly cost and an evidence level nobody had assessed. A contributor
 *    who clicked "Add Food Compound" and saved would have published "500 mg daily with meals,
 *    Moderate Human Trials, $15 – $25 / month" about a compound they never described. New rows
 *    start empty; the reference's strings survive as the placeholders the reference already had,
 *    so a fresh row looks the same and claims nothing.
 * 5. Accessibility the wireframe lacked: a real dialog (via `ModalShell`), a labelled tablist with
 *    arrow-key navigation, a label or `aria-label` on every control, live regions for the sweep
 *    verdict and the outcome. No visual change.
 *
 * The dosage field on the Alternatives tab ("Recommended Usage / Dosage") is the reference's and
 * stays: the reference is the specification and the owner confirmed it ships as shown.
 */

import Link from 'next/link'
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  CheckCircle2,
  Dna,
  DollarSign,
  FileText,
  FlaskConical,
  Leaf,
  Plus,
  Sparkles,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react'

import { useApp } from '@/components/app-context'
import { EngineDiagnostics } from '@/components/EngineDiagnostics'
import { ModalShell } from '@/components/ModalShell'
import { api, ApiError } from '@/lib/api-client'
import { cloneDefaultLaboratoryWorkflow, structureStringFor } from '@/lib/dossier'
import type { RnaIntelligenceReport } from '@/lib/rna-intelligence/types'
import { TIER_DESCRIPTION, TIER_LABEL } from '@/lib/trust'
import {
  DRUG_MODALITIES,
  PROTOCOL_PHASES,
  type ConventionalSubstitute,
  type DrugDossier,
  type DrugModality,
  type LaboratoryProtocolStep,
  type MolecularSchema,
  type NaturalFoodSubstitute,
  type PricingTransparency,
  type ProtocolPhase,
} from '@/lib/types'

export type EditorTabKey = 'overview' | 'sequence' | 'pricing' | 'substitutes' | 'protocol'

interface RnaWikiEditorModalProps {
  isOpen: boolean
  onClose: () => void
  drug: DrugDossier
  initialTab?: EditorTabKey
  /**
   * `DrugDossier` when the edit published and the page can show it immediately; `null` when it went
   * to the review queue and the page must NOT change. Rendering a queued edit as if it were live
   * is the same dishonesty as a fabricated verified badge.
   */
  onSaved: (updated: DrugDossier | null) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * The reference's panel is `max-w-2xl`. `ModalShell`'s `maxWidth` is typed as the three widths the
 * modals written before this one needed, and widening that union belongs to that file, not this
 * one. The assertion is the bridge: the class name is still a literal in this source file, so
 * Tailwind's scanner emits `max-w-2xl` exactly as if it had been written inline.
 */
const EDITOR_PANEL_WIDTH = 'max-w-2xl' as const

/** Long enough that a typed sequence is not swept character by character, short enough to feel live. */
const SWEEP_DEBOUNCE_MS = 400

/** The reference's "Saved!" beat, kept so a published edit confirms before the panel goes away. */
const PUBLISHED_CLOSE_MS = 900

const TABS: ReadonlyArray<{ key: EditorTabKey; label: string; Icon: LucideIcon }> = [
  { key: 'overview', label: 'Overview', Icon: FileText },
  { key: 'substitutes', label: 'Alternatives', Icon: Leaf },
  { key: 'sequence', label: 'Chemical Formula', Icon: Dna },
  { key: 'pricing', label: 'Pricing', Icon: DollarSign },
  { key: 'protocol', label: 'Lab Protocol', Icon: FlaskConical },
]

// Class strings lifted verbatim from the reference so the ported markup stays readable. Each one
// appears here as a literal, which is all Tailwind's scanner needs.
const FIELD_LABEL = 'font-bold text-[#1D1D1F] block mb-1'
const SUB_LABEL = 'text-[10px] font-bold text-[#86868B] block mb-1'
const INPUT_BASE =
  'w-full bg-[#F5F5F7] px-3 py-2 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none'
const TEXTAREA_BASE =
  'w-full bg-[#F5F5F7] p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none'
const ROW_INPUT = 'text-xs bg-white px-2.5 py-1.5 rounded-lg border border-black/[0.06]'
const ADD_BUTTON =
  'flex items-center gap-1 text-xs font-bold text-[#0071E3] hover:underline cursor-pointer'
const DELETE_BUTTON =
  'p-1.5 text-[#86868B] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer'

// ---------------------------------------------------------------------------
// Editor state
// ---------------------------------------------------------------------------

/**
 * Exactly the fields this modal edits — no more.
 *
 * `targetProtein` is deliberately absent. The reference held it in state, seeded it with
 * `drug.targetProtein || drug.targetGene`, gave it no control, and then saved it: on any record
 * without a separate protein name, opening and saving the editor silently copied the gene symbol
 * into the protein field. A field with no control is a field this modal does not edit.
 */
interface EditorForm {
  name: string
  tradeName: string
  targetGene: string
  patientFriendlyIndication: string
  oneSentenceVerdict: string
  laymanHowItWorks: string
  modality: DrugModality
  structure: string
  workflow: LaboratoryProtocolStep[]
  naturalFoods: NaturalFoodSubstitute[]
  conventionalRx: ConventionalSubstitute[]
  synthesisCostPerDose: string
  retailPricePerDoseOrYear: string
}

/**
 * A fresh, independently owned copy of the record's editable fields.
 *
 * There is no per-drug sequence fallback: `structureStringFor` returns `null` when nothing is
 * documented and the field starts empty. The workflow does fall back — to
 * `cloneDefaultLaboratoryWorkflow()`, a template of synthesis phases that says nothing about this
 * drug — and because the payload only carries what actually changed, an untouched template is
 * never written to the record.
 */
function initialFormFor(drug: DrugDossier): EditorForm {
  const stored = drug.molecularSchema?.laboratoryWorkflow ?? []
  return {
    name: drug.name,
    tradeName: drug.tradeName ?? '',
    targetGene: drug.targetGene,
    patientFriendlyIndication: drug.patientFriendlyIndication,
    oneSentenceVerdict: drug.oneSentenceVerdict,
    laymanHowItWorks: drug.laymanHowItWorks,
    modality: drug.modality,
    structure: structureStringFor(drug) ?? '',
    workflow:
      stored.length > 0 ? stored.map((step) => ({ ...step })) : cloneDefaultLaboratoryWorkflow(),
    naturalFoods: (drug.substitutes?.naturalFoods ?? []).map((item) => ({ ...item })),
    conventionalRx: (drug.substitutes?.conventionalRx ?? []).map((item) => ({ ...item })),
    synthesisCostPerDose: drug.pricing?.synthesisCostPerDose ?? '',
    retailPricePerDoseOrYear: drug.pricing?.retailPricePerDoseOrYear ?? '',
  }
}

/**
 * Structural equality for the two list-shaped fields.
 *
 * Key order is stable because every object in these lists is built by spreading one of the same
 * two shapes, so serialising is a sound comparison here and a deep-equal helper would be a
 * dependency for no gain.
 */
function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * The structure block, rebuilt from the sweep the server just ran.
 *
 * Two rules hold this together. First, exactly one of `sequence5to3` / `smilesString` is set — the
 * reference wrote the same string into both for SMILES input, which leaves `structureStringFor`
 * reading one field while the other quietly disagrees. Second, every derived value comes from the
 * report or is cleared: a chemical formula computed for the previous sequence must not survive
 * next to a new one. Nothing here is computed in the browser and nothing is invented.
 */
function buildMolecularSchema(
  drug: DrugDossier,
  structure: string,
  workflow: LaboratoryProtocolStep[],
  report: RnaIntelligenceReport | null,
): MolecularSchema {
  const trimmed = structure.trim()
  const isSmiles = report?.layer1.structureType === 'small_molecule_smiles'
  // The engine's cleaned input is what it actually validated (case-folded, whitespace stripped,
  // thymine transcribed). Storing the raw keystrokes would store something the hash does not cover.
  const cleaned = trimmed.length > 0 ? (report?.layer1.cleanedInput ?? trimmed) : ''

  return {
    ...drug.molecularSchema,
    structureType: report?.layer1.structureType ?? drug.molecularSchema?.structureType,
    sequence5to3: !isSmiles && cleaned.length > 0 ? cleaned : undefined,
    smilesString: isSmiles && cleaned.length > 0 ? cleaned : undefined,

    chemicalFormula: report?.layer1.chemicalFormula,
    molecularWeight: report?.layer1.molecularWeightEstimate,
    gcContentPercent: report?.layer1.gcContentPercent,
    sequenceLengthNt: report?.layer1.baseCounts ? report.layer1.validLength : undefined,
    readingFrameValid: report?.layer1.isMultipleOfThree,
    startCodonFound: report?.layer1.hasStartCodon,
    stopCodonFound: report?.layer1.hasStopCodon,
    complementaryStrand: report?.layer2.complementaryStrand,
    mfeDeltaG: report?.layer2.mfeDeltaG,
    wobblePairsCount: report?.layer2.wobblePairs,
    logP: report?.layer2.logP,

    // The badge is the engine's, never the form's. `lastVerifiedTimestamp` is the report's own
    // timestamp rather than `new Date()` — a browser clock has no business stamping a verification.
    isMachineVerified: report?.overallPassed ?? false,
    verificationHash: report?.overallPassed ? report.verificationHash : undefined,
    lastVerifiedTimestamp: report?.overallPassed ? report.timestamp : undefined,

    laboratoryWorkflow: workflow,
  }
}

/**
 * Only what changed. Round-tripping the whole dossier would let a field this modal never showed —
 * read when the panel opened, saved minutes later — silently overwrite somebody else's edit to it.
 *
 * `pricing` and `substitutes` are single JSONB columns, so the parts of them this editor does not
 * expose (markup estimate, patent notes, home remedies) are carried through rather than dropped.
 * Carrying a stale value is a smaller harm than deleting a real one, and it only happens when the
 * contributor genuinely edited that column.
 */
function buildPayload(
  form: EditorForm,
  snapshot: EditorForm,
  drug: DrugDossier,
  report: RnaIntelligenceReport | null,
): Partial<DrugDossier> {
  const payload: Partial<DrugDossier> = {}

  if (form.name !== snapshot.name) payload.name = form.name.trim()
  if (form.tradeName !== snapshot.tradeName) payload.tradeName = form.tradeName.trim()
  if (form.targetGene !== snapshot.targetGene) payload.targetGene = form.targetGene.trim()
  if (form.patientFriendlyIndication !== snapshot.patientFriendlyIndication) {
    payload.patientFriendlyIndication = form.patientFriendlyIndication.trim()
  }
  if (form.oneSentenceVerdict !== snapshot.oneSentenceVerdict) {
    payload.oneSentenceVerdict = form.oneSentenceVerdict.trim()
  }
  if (form.laymanHowItWorks !== snapshot.laymanHowItWorks) {
    payload.laymanHowItWorks = form.laymanHowItWorks.trim()
  }
  if (form.modality !== snapshot.modality) payload.modality = form.modality

  if (
    form.synthesisCostPerDose !== snapshot.synthesisCostPerDose ||
    form.retailPricePerDoseOrYear !== snapshot.retailPricePerDoseOrYear
  ) {
    const edited = {
      synthesisCostPerDose: form.synthesisCostPerDose.trim(),
      retailPricePerDoseOrYear: form.retailPricePerDoseOrYear.trim(),
    }
    // On a record that already has a pricing block the other three fields ride along untouched.
    // On one that does not, they stay ABSENT: `PricingTransparency` marks `synthesisComplexity`
    // required, and writing the reference's `'Low'` default would publish an assessment of
    // manufacturing difficulty that nobody made. Every consumer guards these fields with a
    // presence test, so an absent one renders as absent.
    payload.pricing = drug.pricing
      ? { ...drug.pricing, ...edited }
      : (edited as unknown as PricingTransparency)
  }

  if (
    !sameJson(form.naturalFoods, snapshot.naturalFoods) ||
    !sameJson(form.conventionalRx, snapshot.conventionalRx)
  ) {
    payload.substitutes = {
      summary: drug.substitutes?.summary ?? '',
      homeRemedies: drug.substitutes?.homeRemedies ?? [],
      naturalFoods: form.naturalFoods,
      conventionalRx: form.conventionalRx,
    }
  }

  const structureChanged = form.structure.trim() !== snapshot.structure.trim()
  const workflowChanged = !sameJson(form.workflow, snapshot.workflow)
  if (structureChanged || workflowChanged) {
    payload.molecularSchema = buildMolecularSchema(drug, form.structure, form.workflow, report)
  }

  return payload
}

// ---------------------------------------------------------------------------
// Sweep status
// ---------------------------------------------------------------------------

interface SweepStatusProps {
  report: RnaIntelligenceReport | null
  isSweeping: boolean
  error: string | null
  hasStructure: boolean
  variant: 'full' | 'strip'
}

/**
 * The report when there is one, and an honest sentence when there is not.
 *
 * A record with no documented structure has nothing for the engine to check, and that is a real
 * state — most of the corpus is stubs. It is said plainly rather than dressed as a pass, which is
 * what the reference's unconditional green line did.
 */
function SweepStatus({ report, isSweeping, error, hasStructure, variant }: SweepStatusProps) {
  if (report) return <EngineDiagnostics report={report} variant={variant} />

  const showError = !isSweeping && error !== null
  const message = isSweeping
    ? 'Checking the structure…'
    : showError
      ? error
      : hasStructure
        ? 'Checking the structure…'
        : 'No structure documented yet, so there is nothing for the engine to check. Paste a sequence or a SMILES string to have it swept.'

  return (
    <div
      className={`p-3 rounded-xl border text-xs leading-relaxed ${
        showError
          ? 'bg-rose-50 border-rose-500/20 text-rose-900'
          : 'bg-[#F5F5F7] border-black/[0.06] text-[#6E6E73]'
      }`}
    >
      {message}
    </div>
  )
}

// ---------------------------------------------------------------------------
// The modal
// ---------------------------------------------------------------------------

type Outcome =
  | { kind: 'published'; message: string; drug: DrugDossier | null }
  | { kind: 'pending'; message: string }

export function RnaWikiEditorModal({
  isOpen,
  onClose,
  drug,
  initialTab = 'overview',
  onSaved,
}: RnaWikiEditorModalProps) {
  const { currentUser, setOpenModal } = useApp()
  const isSignedIn = Boolean(currentUser)

  const domId = useId()
  const titleId = `${domId}-title`
  const summaryId = `${domId}-summary`
  const tabId = useCallback((key: EditorTabKey) => `${domId}-tab-${key}`, [domId])
  const panelId = useCallback((key: EditorTabKey) => `${domId}-panel-${key}`, [domId])

  const [editorTab, setEditorTab] = useState<EditorTabKey>(initialTab)
  const [form, setForm] = useState<EditorForm>(() => initialFormFor(drug))
  const snapshotRef = useRef<EditorForm>(initialFormFor(drug))

  const [report, setReport] = useState<RnaIntelligenceReport | null>(null)
  const [isSweeping, setIsSweeping] = useState<boolean>(false)
  const [sweepError, setSweepError] = useState<string | null>(null)

  const [summary, setSummary] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  const tabRefs = useRef<Partial<Record<EditorTabKey, HTMLButtonElement | null>>>({})
  // Monotonic, so two steps added inside the same millisecond cannot share an id. A duplicate id
  // is not cosmetic here: step ids are the nodes of the protocol graph Layer 3 walks.
  const stepCounterRef = useRef<number>(0)

  // The record is read through a ref inside the reset effect so that a background refresh of the
  // page — which hands this component a new `drug` object with the same id — cannot wipe an edit
  // in progress. Only opening the panel, or opening it on a different record, resets the form.
  const drugRef = useRef(drug)
  useEffect(() => {
    drugRef.current = drug
  })

  useEffect(() => {
    if (!isOpen) return
    const current = drugRef.current
    setEditorTab(initialTab)
    setForm(initialFormFor(current))
    snapshotRef.current = initialFormFor(current)
    setReport(null)
    setSweepError(null)
    setSummary('')
    setSubmitError(null)
    setOutcome(null)
    setIsSaving(false)
  }, [isOpen, drug.id, initialTab])

  // -------------------------------------------------------------------------
  // The deterministic sweep
  // -------------------------------------------------------------------------

  const structureString = form.structure.trim()
  const hasStructure = structureString.length > 0
  const { modality, workflow } = form

  useEffect(() => {
    if (!isOpen || !isSignedIn) return

    // No structure means no claim to check, and sweeping an empty string returns
    // `L1_STRUCTURE_EMPTY` — which would disable Save and lock every stub record out of being
    // edited at all. Silence is the correct verdict on an absent structure.
    if (!hasStructure) {
      setReport(null)
      setSweepError(null)
      setIsSweeping(false)
      return
    }

    // The previous report described the previous text. Keeping it on screen while the new text is
    // in flight is the reference's mistake in miniature: a green "passed" standing over characters
    // no engine has seen. It is dropped the moment the input changes.
    setReport(null)
    setSweepError(null)
    setIsSweeping(true)

    // The AbortController is a staleness token, not a transport cancel: `api.sweep` is a fixed
    // contract (lib/api-client.ts) and takes no RequestInit, so the in-flight fetch itself cannot
    // be cancelled from here. It still buys the guarantee that matters — a slow response for an
    // older keystroke resolves into an aborted signal and is discarded instead of overwriting a
    // newer report and re-enabling a Save the current text does not deserve.
    const controller = new AbortController()
    const timer = setTimeout(() => {
      api
        .sweep(drug.id, { structureString, modality, workflow })
        .then((data) => {
          if (controller.signal.aborted) return
          setReport(data.report)
          setSweepError(null)
          setIsSweeping(false)
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return
          // No report means no verdict, so Save stays disabled. Falling back to "looks fine" here
          // would be the reference's bug with an extra step.
          setReport(null)
          setSweepError(
            error instanceof Error
              ? error.message
              : 'The automatic check could not be run. Try again in a moment.',
          )
          setIsSweeping(false)
        })
    }, SWEEP_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [isOpen, isSignedIn, drug.id, structureString, hasStructure, modality, workflow])

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------

  const payload = useMemo(
    () => buildPayload(form, snapshotRef.current, drug, report),
    [form, drug, report],
  )
  const changedFieldCount = Object.keys(payload).length
  const alternativeCount = form.naturalFoods.length + form.conventionalRx.length

  // The engine's verdict, and only where the engine has one. A record with no structure is not
  // blocked; a record whose structure fails is, on every tab.
  const structureBlocked = hasStructure && (isSweeping || !report || !report.overallPassed)
  const firstEngineError = report?.errors[0]?.message ?? null

  const blockingMessage = submitError
    ? submitError
    : isSweeping
      ? null
      : (sweepError ?? firstEngineError)

  const canSave =
    !isSaving && !structureBlocked && changedFieldCount > 0 && summary.trim().length > 0

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const patch = useCallback((changes: Partial<EditorForm>) => {
    setForm((prev) => ({ ...prev, ...changes }))
  }, [])

  const finish = useCallback(() => {
    onSaved(outcome?.kind === 'published' ? outcome.drug : null)
    onClose()
  }, [onSaved, onClose, outcome])

  // Escape, the backdrop and the shell's close button all route through here, so an outcome is
  // reported to the page however the panel is dismissed.
  const handleShellClose = useCallback(() => {
    if (outcome) {
      finish()
      return
    }
    onClose()
  }, [outcome, finish, onClose])

  // A published edit confirms and then gets out of the way, as the reference's "Saved!" did. A
  // queued one does not: its message carries the link to the public queue, and a link that
  // disappears after a beat is not a link. The reader dismisses that one.
  useEffect(() => {
    if (outcome?.kind !== 'published') return
    const timer = setTimeout(finish, PUBLISHED_CLOSE_MS)
    return () => clearTimeout(timer)
  }, [outcome, finish])

  const handleSignIn = useCallback(() => {
    // Closing first keeps one dialog on screen at a time: two stacked focus traps is a keyboard
    // maze, and the auth modal is a sibling of this one, not a child.
    onClose()
    setOpenModal('auth')
  }, [onClose, setOpenModal])

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const keys = TABS.map((tab) => tab.key)
      const current = keys.indexOf(editorTab)
      let nextIndex = -1
      if (event.key === 'ArrowRight') nextIndex = (current + 1) % keys.length
      else if (event.key === 'ArrowLeft') nextIndex = (current - 1 + keys.length) % keys.length
      else if (event.key === 'Home') nextIndex = 0
      else if (event.key === 'End') nextIndex = keys.length - 1
      else return

      event.preventDefault()
      const nextKey = keys[nextIndex]
      if (!nextKey) return
      setEditorTab(nextKey)
      tabRefs.current[nextKey]?.focus()
    },
    [editorTab],
  )

  // --- Alternatives ---------------------------------------------------------

  const handleAddNaturalFood = useCallback(() => {
    // Empty, not pre-filled. See the file header: the reference seeded a dosage, a monthly cost
    // and an evidence level here, any of which could be published unread.
    const next: NaturalFoodSubstitute = { name: '', mechanism: '', dailyUsage: '', monthlyCost: '' }
    setForm((prev) => ({ ...prev, naturalFoods: [...prev.naturalFoods, next] }))
  }, [])

  const handleUpdateNaturalFood = useCallback(
    (index: number, changes: Partial<NaturalFoodSubstitute>) => {
      setForm((prev) => ({
        ...prev,
        naturalFoods: prev.naturalFoods.map((item, i) =>
          i === index ? { ...item, ...changes } : item,
        ),
      }))
    },
    [],
  )

  const handleDeleteNaturalFood = useCallback((index: number) => {
    setForm((prev) => ({ ...prev, naturalFoods: prev.naturalFoods.filter((_, i) => i !== index) }))
  }, [])

  const handleAddPharmacyAlt = useCallback(() => {
    const next: ConventionalSubstitute = { name: '', comparisonToDrug: '', typicalCost: '' }
    setForm((prev) => ({ ...prev, conventionalRx: [...prev.conventionalRx, next] }))
  }, [])

  const handleUpdatePharmacyAlt = useCallback(
    (index: number, changes: Partial<ConventionalSubstitute>) => {
      setForm((prev) => ({
        ...prev,
        conventionalRx: prev.conventionalRx.map((item, i) =>
          i === index ? { ...item, ...changes } : item,
        ),
      }))
    },
    [],
  )

  const handleDeletePharmacyAlt = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      conventionalRx: prev.conventionalRx.filter((_, i) => i !== index),
    }))
  }, [])

  // --- Protocol DAG ---------------------------------------------------------

  const handleAddProtocolStep = useCallback(() => {
    setForm((prev) => {
      const previous = prev.workflow[prev.workflow.length - 1]
      stepCounterRef.current += 1
      const next: LaboratoryProtocolStep = {
        id: `step-${Date.now().toString(36)}-${stepCounterRef.current}`,
        stepNumber: prev.workflow.length + 1,
        phase: 'Assay_Quantification',
        name: '',
        description: '',
        // Chained to the step before it, for the same reason `DEFAULT_LABORATORY_WORKFLOW` is
        // chained: an unconnected node in a multi-step graph is an orphan, and Layer 3 says so.
        dependsOnStepId: previous?.id,
        reagentsAndBuffer: '',
      }
      return { ...prev, workflow: [...prev.workflow, next] }
    })
  }, [])

  const handleUpdateProtocolStep = useCallback(
    (index: number, changes: Partial<LaboratoryProtocolStep>) => {
      setForm((prev) => ({
        ...prev,
        workflow: prev.workflow.map((step, i) => (i === index ? { ...step, ...changes } : step)),
      }))
    },
    [],
  )

  const handleDeleteProtocolStep = useCallback((index: number) => {
    setForm((prev) => {
      const removed = prev.workflow[index]
      return {
        ...prev,
        workflow: prev.workflow
          .filter((_, i) => i !== index)
          .map((step, i) => ({
            ...step,
            stepNumber: i + 1,
            // Deleting a step must not leave the steps that depended on it pointing at nothing.
            // The reference left them dangling, which Layer 3 then rejects the whole edit for.
            dependsOnStepId:
              step.dependsOnStepId === removed?.id ? undefined : step.dependsOnStepId,
          })),
      }
    })
  }, [])

  // --- Save -----------------------------------------------------------------

  const handlePublishEdit = useCallback(async () => {
    const trimmedSummary = summary.trim()
    if (!trimmedSummary) {
      setSubmitError(
        'Describe the change in one line first — a revision with no summary cannot be reviewed.',
      )
      return
    }
    if (changedFieldCount === 0) {
      setSubmitError('Nothing has changed yet.')
      return
    }

    setIsSaving(true)
    setSubmitError(null)
    try {
      const result = await api.submitRevision(drug.id, { payload, summary: trimmedSummary })

      if (result.outcome === 'published') {
        setOutcome({
          kind: 'published',
          message: 'Published. Your edit is live.',
          drug: result.drug ?? null,
        })
        return
      }

      const position = result.queuePosition
      setOutcome({
        kind: 'pending',
        // The position is printed only when the server sent one. "#undefined", or a guessed
        // number, would be worse than the sentence without it.
        message:
          typeof position === 'number'
            ? `Submitted for review. You are #${position} in the public queue.`
            : 'Submitted for review. Your edit is in the public queue.',
      })
    } catch (error) {
      // 422 is the engine's instant rejection. The panel stays open with the diagnostics on screen
      // so the contributor can fix the structure rather than lose the edit.
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'That edit could not be submitted. Check your connection and try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }, [summary, changedFieldCount, payload, drug.id])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const tier = currentUser?.trustTier

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleShellClose}
      labelledBy={titleId}
      maxWidth={EDITOR_PANEL_WIDTH}
      scrim="deep"
      // The reference puts this dialog's close control inside the #FAFAFC top bar, beside the
      // title, rather than floating a pill over the content. Suppressing the shell's button and
      // rendering it in the bar keeps that.
      closeButton="none"
    >
      <div className="flex flex-col max-h-[90vh] overflow-hidden">
        {/* 1. Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between gap-3 bg-[#FAFAFC] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-[#0071E3] shrink-0" aria-hidden="true" />
            <h2 id={titleId} className="text-sm sm:text-base font-bold text-[#1D1D1F] truncate">
              Edit Dossier &bull; {drug.name}
            </h2>
          </div>
          {/* In the top bar, as the reference has it -- not a pill floating over the content. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="p-1.5 rounded-full hover:bg-black/[0.06] text-[#86868B] hover:text-[#1D1D1F] transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {!isSignedIn ? (
          /* Signed out: the prompt, and nothing that looks like a form. The reference rendered
             every field to a reader who could not save any of them. */
          <div className="p-5 sm:p-6 space-y-4">
            <p className="text-xs text-[#6E6E73] leading-relaxed">
              Editing is open to anyone with an account. Every edit is signed, swept by the
              deterministic engine before it is accepted, and listed in the public revision history.
            </p>
            <button
              type="button"
              onClick={handleSignIn}
              className="px-5 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
            >
              Doctor &amp; Contributor Log-in
            </button>
          </div>
        ) : outcome ? (
          /* Outcome: what actually happened to the edit, in the server's own words. */
          <>
            <div className="p-5 sm:p-6 space-y-3">
              <p
                role="status"
                className="flex items-start gap-2 text-xs font-semibold text-[#1D1D1F] leading-relaxed"
              >
                <CheckCircle2
                  className="w-4 h-4 shrink-0 mt-px text-emerald-600"
                  aria-hidden="true"
                />
                <span>{outcome.message}</span>
              </p>
              {outcome.kind === 'pending' && (
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  The queue is public — anyone can read what is waiting and why.{' '}
                  <Link href="/review-queue" className="font-bold text-[#0071E3] hover:underline">
                    Open the review queue
                  </Link>
                </p>
              )}
            </div>
            <div className="p-4 sm:p-5 border-t border-black/[0.06] bg-[#FAFAFC] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                autoFocus
                onClick={finish}
                className="px-5 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 2. Specialist Tab Switcher */}
            <div
              role="tablist"
              aria-label="Dossier sections"
              onKeyDown={handleTabKeyDown}
              className="flex items-center gap-1.5 p-2 bg-[#F5F5F7] border-b border-black/[0.06] overflow-x-auto shrink-0 text-xs font-semibold"
            >
              {TABS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  id={tabId(key)}
                  ref={(node) => {
                    tabRefs.current[key] = node
                  }}
                  type="button"
                  role="tab"
                  aria-selected={editorTab === key}
                  aria-controls={panelId(key)}
                  tabIndex={editorTab === key ? 0 : -1}
                  onClick={() => setEditorTab(key)}
                  className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    editorTab === key
                      ? 'bg-white text-[#0071E3] shadow-xs'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{key === 'substitutes' ? `${label} (${alternativeCount})` : label}</span>
                </button>
              ))}
            </div>

            {/* 3. Tab Body Container */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-5 text-xs">
              {/* TAB 1: OVERVIEW & VERDICT */}
              {editorTab === 'overview' && (
                <div
                  role="tabpanel"
                  id={panelId('overview')}
                  aria-labelledby={tabId('overview')}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`${domId}-name`} className={FIELD_LABEL}>
                        Generic Name
                      </label>
                      <input
                        id={`${domId}-name`}
                        type="text"
                        value={form.name}
                        onChange={(e) => patch({ name: e.target.value })}
                        className={`${INPUT_BASE} font-semibold text-[#1D1D1F]`}
                      />
                    </div>

                    <div>
                      <label htmlFor={`${domId}-trade`} className={FIELD_LABEL}>
                        Trade / Brand Name
                      </label>
                      <input
                        id={`${domId}-trade`}
                        type="text"
                        value={form.tradeName}
                        onChange={(e) => patch({ tradeName: e.target.value })}
                        placeholder="e.g. Leqvio..."
                        className={`${INPUT_BASE} text-[#1D1D1F]`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`${domId}-gene`} className={FIELD_LABEL}>
                        Target Gene / Biological Target
                      </label>
                      <input
                        id={`${domId}-gene`}
                        type="text"
                        value={form.targetGene}
                        onChange={(e) => patch({ targetGene: e.target.value })}
                        placeholder="e.g. PCSK9, GLP-1R..."
                        className={`${INPUT_BASE} text-[#1D1D1F]`}
                      />
                    </div>

                    <div>
                      <label htmlFor={`${domId}-indication`} className={FIELD_LABEL}>
                        Patient Indication
                      </label>
                      <input
                        id={`${domId}-indication`}
                        type="text"
                        value={form.patientFriendlyIndication}
                        onChange={(e) => patch({ patientFriendlyIndication: e.target.value })}
                        placeholder="e.g. Severe High Cholesterol & Cardiovascular Disease..."
                        className={`${INPUT_BASE} text-[#1D1D1F]`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`${domId}-verdict`} className={FIELD_LABEL}>
                      The 10-Second Verdict
                    </label>
                    <textarea
                      id={`${domId}-verdict`}
                      rows={2}
                      value={form.oneSentenceVerdict}
                      onChange={(e) => patch({ oneSentenceVerdict: e.target.value })}
                      className={`${TEXTAREA_BASE} font-semibold text-[#1D1D1F]`}
                    />
                  </div>

                  <div>
                    <label htmlFor={`${domId}-layman`} className={FIELD_LABEL}>
                      Plain English Explanation
                    </label>
                    <textarea
                      id={`${domId}-layman`}
                      rows={3}
                      value={form.laymanHowItWorks}
                      onChange={(e) => patch({ laymanHowItWorks: e.target.value })}
                      className={`${TEXTAREA_BASE} text-[#424245] leading-relaxed`}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SUBSTITUTES & ALTERNATIVES */}
              {editorTab === 'substitutes' && (
                <div
                  role="tabpanel"
                  id={panelId('substitutes')}
                  aria-labelledby={tabId('substitutes')}
                  className="space-y-6"
                >
                  {/* Natural / Dietary Foods */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#1D1D1F]">
                        Dietary &amp; Natural Foods
                      </span>
                      <button type="button" onClick={handleAddNaturalFood} className={ADD_BUTTON}>
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Add Food Compound</span>
                      </button>
                    </div>

                    {form.naturalFoods.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#F5F5F7] rounded-2xl space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={item.name}
                            aria-label={`Dietary compound ${idx + 1} name`}
                            placeholder="Compound Name (e.g. Plant Sterols & Stanols)"
                            onChange={(e) => handleUpdateNaturalFood(idx, { name: e.target.value })}
                            className={`font-bold ${ROW_INPUT} text-[#1D1D1F] flex-1 min-w-0`}
                          />
                          <input
                            type="text"
                            value={item.monthlyCost}
                            aria-label={`Dietary compound ${idx + 1} monthly cost`}
                            placeholder="$15 – $25 / month"
                            onChange={(e) =>
                              handleUpdateNaturalFood(idx, { monthlyCost: e.target.value })
                            }
                            className={`font-mono font-semibold text-emerald-800 ${ROW_INPUT} w-36 text-right`}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteNaturalFood(idx)}
                            className={DELETE_BUTTON}
                            title="Delete alternative"
                            aria-label={`Delete dietary compound ${idx + 1}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>

                        <div>
                          <label htmlFor={`${domId}-food-${idx}-mechanism`} className={SUB_LABEL}>
                            Mechanism / How it Works
                          </label>
                          <input
                            id={`${domId}-food-${idx}-mechanism`}
                            type="text"
                            value={item.mechanism ?? ''}
                            placeholder="How it works biologically..."
                            onChange={(e) =>
                              handleUpdateNaturalFood(idx, { mechanism: e.target.value })
                            }
                            className={`w-full ${ROW_INPUT} text-[#424245]`}
                          />
                        </div>

                        <div>
                          <label htmlFor={`${domId}-food-${idx}-usage`} className={SUB_LABEL}>
                            Recommended Usage / Dosage
                          </label>
                          <input
                            id={`${domId}-food-${idx}-usage`}
                            type="text"
                            value={item.dailyUsage}
                            placeholder="e.g. 2.0 grams daily with meals"
                            onChange={(e) =>
                              handleUpdateNaturalFood(idx, { dailyUsage: e.target.value })
                            }
                            className={`w-full ${ROW_INPUT} text-[#6E6E73]`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Low-Cost Pharmacy Alternatives */}
                  <div className="space-y-3 pt-2 border-t border-black/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#1D1D1F]">
                        Low-Cost Pharmacy Alternatives
                      </span>
                      <button type="button" onClick={handleAddPharmacyAlt} className={ADD_BUTTON}>
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Add Pharmacy Alternative</span>
                      </button>
                    </div>

                    {form.conventionalRx.map((item, idx) => (
                      <div key={idx} className="p-4 bg-[#F5F5F7] rounded-2xl space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={item.name}
                            aria-label={`Pharmacy alternative ${idx + 1} name`}
                            placeholder="Generic Name (e.g. Generic Atorvastatin)"
                            onChange={(e) => handleUpdatePharmacyAlt(idx, { name: e.target.value })}
                            className={`font-bold ${ROW_INPUT} text-[#1D1D1F] flex-1 min-w-0`}
                          />
                          <input
                            type="text"
                            value={item.typicalCost}
                            aria-label={`Pharmacy alternative ${idx + 1} typical cost`}
                            placeholder="$4 – $10 / month"
                            onChange={(e) =>
                              handleUpdatePharmacyAlt(idx, { typicalCost: e.target.value })
                            }
                            className={`font-mono font-semibold text-[#0071E3] ${ROW_INPUT} w-36 text-right`}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeletePharmacyAlt(idx)}
                            className={DELETE_BUTTON}
                            title="Delete alternative"
                            aria-label={`Delete pharmacy alternative ${idx + 1}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>

                        <div>
                          <label htmlFor={`${domId}-rx-${idx}-comparison`} className={SUB_LABEL}>
                            Clinical Comparison
                          </label>
                          <input
                            id={`${domId}-rx-${idx}-comparison`}
                            type="text"
                            value={item.comparisonToDrug ?? ''}
                            placeholder="Comparison to patented drug..."
                            onChange={(e) =>
                              handleUpdatePharmacyAlt(idx, { comparisonToDrug: e.target.value })
                            }
                            className={`w-full ${ROW_INPUT} text-[#424245]`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SEQUENCE & CHEMICAL FORMULA */}
              {editorTab === 'sequence' && (
                <div
                  role="tabpanel"
                  id={panelId('sequence')}
                  aria-labelledby={tabId('sequence')}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor={`${domId}-structure`} className={FIELD_LABEL}>
                      Chemical SMILES or RNA Nucleotide Sequence (5&apos; &rarr; 3&apos;)
                    </label>
                    <textarea
                      id={`${domId}-structure`}
                      rows={3}
                      value={form.structure}
                      onChange={(e) => patch({ structure: e.target.value })}
                      placeholder="AUGUCAUUGGAUCACUGCU or SMILES string..."
                      spellCheck={false}
                      aria-describedby={`${domId}-diagnostics`}
                      className="w-full bg-[#1D1D1F] text-emerald-300 font-mono text-xs p-3 rounded-xl focus:ring-2 focus:ring-[#0071E3]/20 focus:outline-none select-all"
                    />
                  </div>

                  {/* The modality is an input to the sweep — Layer 1 validates a SMILES string
                      against different rules than a nucleotide sequence — and the reference stored
                      it while offering no way to set it. */}
                  <div>
                    <label htmlFor={`${domId}-modality`} className={FIELD_LABEL}>
                      Modality
                    </label>
                    <select
                      id={`${domId}-modality`}
                      value={form.modality}
                      onChange={(e) => patch({ modality: e.target.value as DrugModality })}
                      className={`${INPUT_BASE} text-[#1D1D1F]`}
                    >
                      {DRUG_MODALITIES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Deterministic Verification — the whole report, not one asserted green line. */}
                  <div id={`${domId}-diagnostics`}>
                    <SweepStatus
                      report={report}
                      isSweeping={isSweeping}
                      error={sweepError}
                      hasStructure={hasStructure}
                      variant="full"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: PRICING TRANSPARENCY */}
              {editorTab === 'pricing' && (
                <div
                  role="tabpanel"
                  id={panelId('pricing')}
                  aria-labelledby={tabId('pricing')}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`${domId}-synthesis-cost`} className={FIELD_LABEL}>
                        Synthesis Cost Per Dose
                      </label>
                      <input
                        id={`${domId}-synthesis-cost`}
                        type="text"
                        value={form.synthesisCostPerDose}
                        onChange={(e) => patch({ synthesisCostPerDose: e.target.value })}
                        placeholder="$5.00"
                        className={`${INPUT_BASE} font-mono text-emerald-800 font-bold`}
                      />
                    </div>

                    <div>
                      <label htmlFor={`${domId}-retail-price`} className={FIELD_LABEL}>
                        Pharma Retail List Price
                      </label>
                      <input
                        id={`${domId}-retail-price`}
                        type="text"
                        value={form.retailPricePerDoseOrYear}
                        onChange={(e) => patch({ retailPricePerDoseOrYear: e.target.value })}
                        placeholder="$3,250 / dose"
                        className={`${INPUT_BASE} font-mono font-bold text-[#1D1D1F]`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: LAB PROTOCOL (DAG) */}
              {editorTab === 'protocol' && (
                <div
                  role="tabpanel"
                  id={panelId('protocol')}
                  aria-labelledby={tabId('protocol')}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1D1D1F]">
                      Laboratory Synthesis Procedure (DAG)
                    </span>
                    <button type="button" onClick={handleAddProtocolStep} className={ADD_BUTTON}>
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Add Synthesis Step</span>
                    </button>
                  </div>

                  {form.workflow.map((step, idx) => (
                    <div key={step.id} className="p-3.5 bg-[#F5F5F7] rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={step.name}
                          aria-label={`Step ${step.stepNumber} name`}
                          placeholder="New Synthesis / Purification Phase"
                          onChange={(e) => handleUpdateProtocolStep(idx, { name: e.target.value })}
                          className={`font-bold ${ROW_INPUT} text-[#1D1D1F] flex-1`}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteProtocolStep(idx)}
                          className={DELETE_BUTTON}
                          aria-label={`Delete step ${step.stepNumber}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={step.description}
                        aria-label={`Step ${step.stepNumber} description`}
                        placeholder="Describe reaction buffer, reaction time, temperature, and validation threshold..."
                        onChange={(e) =>
                          handleUpdateProtocolStep(idx, { description: e.target.value })
                        }
                        className={`w-full text-xs bg-white p-2.5 rounded-lg border border-black/[0.06] text-[#424245]`}
                      />

                      {/* The phase and the dependency are what Layer 3 actually validates: without
                          controls for them the DAG check has nothing to check. */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label htmlFor={`${domId}-step-${idx}-phase`} className={SUB_LABEL}>
                            Phase
                          </label>
                          <select
                            id={`${domId}-step-${idx}-phase`}
                            value={step.phase}
                            onChange={(e) =>
                              handleUpdateProtocolStep(idx, {
                                phase: e.target.value as ProtocolPhase,
                              })
                            }
                            className={`w-full ${ROW_INPUT} text-[#1D1D1F]`}
                          >
                            {PROTOCOL_PHASES.map((phase) => (
                              <option key={phase} value={phase}>
                                {phase.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor={`${domId}-step-${idx}-depends`} className={SUB_LABEL}>
                            Depends On
                          </label>
                          <select
                            id={`${domId}-step-${idx}-depends`}
                            value={step.dependsOnStepId ?? ''}
                            onChange={(e) =>
                              handleUpdateProtocolStep(idx, {
                                dependsOnStepId: e.target.value === '' ? undefined : e.target.value,
                              })
                            }
                            className={`w-full ${ROW_INPUT} text-[#1D1D1F]`}
                          >
                            <option value="">No dependency</option>
                            {form.workflow
                              .filter((other) => other.id !== step.id)
                              .map((other) => (
                                <option key={other.id} value={other.id}>
                                  {other.stepNumber}. {other.name || 'Unnamed step'}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4a. Persistent engine strip, the change summary, and the contributor's own tier.
                   The strip is here rather than only on the Chemical Formula tab so a contributor
                   editing pricing still sees that the structure is failing and why Save is off. */}
            <div className="px-4 sm:px-5 py-3 border-t border-black/[0.06] bg-[#FAFAFC] shrink-0 space-y-3">
              <div aria-live="polite">
                <SweepStatus
                  report={report}
                  isSweeping={isSweeping}
                  error={sweepError}
                  hasStructure={hasStructure}
                  variant="strip"
                />
              </div>

              <div>
                <label htmlFor={summaryId} className={FIELD_LABEL}>
                  What did you change?{' '}
                  <span className="font-semibold text-[#86868B]">(required)</span>
                </label>
                <input
                  id={summaryId}
                  type="text"
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="e.g. Corrected the retail list price and cited the payer schedule"
                  className={`${INPUT_BASE} text-[#1D1D1F] bg-white border border-black/[0.06]`}
                />
              </div>

              {tier && (
                <p className="text-[10px] text-[#86868B] leading-relaxed">
                  <span className="font-bold text-[#6E6E73]">{TIER_LABEL[tier]}</span> ·{' '}
                  {TIER_DESCRIPTION[tier]}
                </p>
              )}
            </div>

            {/* 4b. Modal Footer Controls */}
            <div className="p-4 sm:p-5 border-t border-black/[0.06] bg-[#FAFAFC] flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white border border-black/[0.08] text-xs font-semibold text-[#1D1D1F] hover:bg-black/[0.04] transition cursor-pointer shrink-0"
              >
                Cancel
              </button>

              <p
                aria-live="polite"
                className="text-[11px] font-semibold text-rose-700 leading-snug flex-1 min-w-0 line-clamp-2"
              >
                {blockingMessage}
              </p>

              <button
                type="button"
                disabled={!canSave}
                onClick={handlePublishEdit}
                className="px-5 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#0071E3] disabled:active:scale-100"
              >
                {isSaving ? <span>Saving...</span> : <span>Save &amp; Publish Changes</span>}
              </button>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  )
}

export default RnaWikiEditorModal
