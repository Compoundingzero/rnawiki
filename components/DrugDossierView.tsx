'use client'

/**
 * The dossier page body — a direct port of the master reference wireframe's
 * `src/components/DrugDossierView.tsx` (748 lines), section for section, class for class.
 *
 * Section order, copy and Tailwind classes are the reference's. What changed, and only this:
 *
 * 1. localStorage became the server. The wireframe took `onAddNote` / `onUpdateDrug` / `currentUser`
 *    as props and mutated an in-memory ledger. Here the only prop is the server-rendered dossier;
 *    the reader comes from `useApp()` and every write is an `api.*` call.
 * 2. Every hard-coded per-drug fallback is deleted. The reference synthesised a nucleotide sequence
 *    (`drug.id === 'inclisiran' ? 'AUGUCAUUGGAUCACUGCU' : ...`), an anatomical site, a mechanism
 *    step and a `'$5.00'` synthesis cost whenever the data was missing. On a site whose entire
 *    claim is that it separates what was measured from what was inferred, printing an invented
 *    sequence under a real drug's name is the worst thing this file could do. Absence renders as
 *    absence, plus an invitation to contribute.
 * 3. Most of the ~8,000-record corpus is stubs, so every optional section has a real empty state
 *    (`MissingSectionCard`) that opens the editor at the tab which fills that section.
 * 4. Accessibility the wireframe's hover-only interactions lacked: every control is a `<button>`,
 *    icon-only controls carry `aria-label`, decorative icons carry `aria-hidden`, disclosures carry
 *    `aria-expanded` / `aria-controls`, and the carousel announces step changes. No visual change.
 * 5. `animate-in fade-in ...` (tailwindcss-animate) became the `animate-fade-in` /
 *    `animate-zoom-in` keyframes defined in `app/globals.css`.
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useId, useRef, useState, type FormEvent } from 'react'
import {
  Activity,
  ArrowUp,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Dna,
  Edit3,
  FlaskConical,
  HeartPulse,
  History,
  Leaf,
  MapPin,
  Microscope,
  Stethoscope,
  Target,
  Zap,
} from 'lucide-react'

import { useApp } from '@/components/app-context'
import { api } from '@/lib/api-client'
import { structureStringFor } from '@/lib/dossier'
import type { CommunityNote, DrugDossier } from '@/lib/types'
import { RnaWikiEditorModal, type EditorTabKey } from './RnaWikiEditorModal'

interface DrugDossierViewProps {
  drug: DrugDossier
}

/** Longest note the API accepts (docs/api-contract.md). Inlined rather than imported from
 *  `lib/queries/notes.ts`, which pulls the database client into the client bundle. */
const NOTE_MAX_LENGTH = 4000

function hasText(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * "$9,500 per year (list price)" -> "$9,500 per year". The reference wrote this inline as
 * `.split('(')[0].trim()`; under `noUncheckedIndexedAccess` that first element is possibly
 * undefined, so the fall back to the whole string is explicit.
 */
function priceHeadline(value: string): string {
  const head = value.split('(')[0]
  return (head ?? value).trim()
}

/**
 * A localised date from the stored ISO string. `suppressHydrationWarning` because the server
 * formats in UTC with the server's locale and the browser re-formats in the reader's — the two
 * legitimately differ, and that is the point of localising at all.
 */
function formatNoteDate(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * The clipboard fallback. A copy button that silently does nothing is worse than no button, so
 * when `navigator.clipboard` is unavailable or refused (insecure origin, denied permission) the
 * text goes through a hidden textarea and the legacy `execCommand`.
 *
 * Positioned off-screen rather than `display: none` on purpose: a hidden element cannot hold a
 * selection, so the copy would fail in exactly the case this path exists to cover.
 */
function copyViaHiddenTextarea(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-1000px'
  textarea.style.left = '0'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  try {
    textarea.select()
    textarea.setSelectionRange(0, text.length)
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}

/** Last resort: leave the structure highlighted so the reader can press Cmd/Ctrl+C themselves. */
function selectNodeText(node: HTMLElement | null): void {
  if (!node) return
  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.selectNodeContents(node)
  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * The one empty state, used everywhere a section has no content yet.
 *
 * Same card as a populated section — `rounded-3xl`, white, the reference's border and shadow — so
 * a stub reads as a record awaiting curation rather than as a broken page. One muted line naming
 * exactly what is missing, and one text button into the editor tab that fills it.
 */
function MissingSectionCard({
  line,
  onAdd,
  addLabel = 'Add this section',
}: {
  line: string
  onAdd: () => void
  addLabel?: string
}) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-2">
      <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">{line}</p>
      <button
        type="button"
        onClick={onAdd}
        className="text-xs font-bold text-[#0071E3] hover:underline cursor-pointer"
      >
        {addLabel}
      </button>
    </div>
  )
}

/** The same treatment nested inside an already-open card (the molecular dossier), without the
 *  outer card chrome that would double up. */
function MissingInline({ line, onAdd }: { line: string; onAdd: () => void }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-[#86868B] leading-relaxed">{line}</p>
      <button
        type="button"
        onClick={onAdd}
        className="text-xs font-bold text-[#0071E3] hover:underline cursor-pointer"
      >
        Add this section
      </button>
    </div>
  )
}

/**
 * The cost pill is a fixed-width chip beside a name, and the reference fills it with "$12 – $20 /
 * month". A contributor who has no published figure to cite writes so instead — which is the right
 * answer, and which as a full sentence in a `shrink-0 whitespace-nowrap` chip squeezed the
 * alternative's name into four wrapped lines.
 *
 * The chip takes the figure or a short marker; the full sentence stays reachable on hover and in
 * the accessible name, so nothing is hidden, only laid out.
 */
const COST_FIGURE = /\$[\d,.]+(?:\s*[–—-]\s*\$?[\d,.]+)?(?:\s*(?:per|\/)\s*[a-z-]+)?/i

function costChip(value: string): { label: string; muted: boolean } {
  const trimmed = value.trim()
  if (trimmed.length <= 22) return { label: trimmed, muted: !COST_FIGURE.test(trimmed) }

  const figure = COST_FIGURE.exec(trimmed)?.[0]
  if (figure) return { label: figure.trim(), muted: false }

  return { label: 'Not priced', muted: true }
}

export function DrugDossierView({ drug: serverDrug }: DrugDossierViewProps) {
  const router = useRouter()
  const { currentUser, requireAuth } = useApp()

  // A revision that publishes immediately comes back from the API before the server component
  // above has re-rendered. Hold that fresher copy locally and let the refreshed props win as soon
  // as they arrive — the derive-during-render reset below is React's documented pattern for it.
  const [publishedOverride, setPublishedOverride] = useState<DrugDossier | null>(null)
  const [notes, setNotes] = useState<CommunityNote[]>(() => serverDrug.communityNotes ?? [])
  const [lastServerDrug, setLastServerDrug] = useState<DrugDossier>(serverDrug)
  if (lastServerDrug !== serverDrug) {
    setLastServerDrug(serverDrug)
    setPublishedOverride(null)
    setNotes(serverDrug.communityNotes ?? [])
  }
  const drug = publishedOverride ?? serverDrug

  // Mechanism Carousel State
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0)
  const [showTechnicalDeepDive, setShowTechnicalDeepDive] = useState<boolean>(false)
  const [showConditionDetails, setShowConditionDetails] = useState<boolean>(true)
  const [activeSubstituteTab, setActiveSubstituteTab] = useState<'natural' | 'pharmacy'>('natural')
  const [newNoteContent, setNewNoteContent] = useState<string>('')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle')
  const [showMolecularDossier, setShowMolecularDossier] = useState<boolean>(false)

  // Server-backed interactions the wireframe had no counterpart for.
  const [isPostingNote, setIsPostingNote] = useState<boolean>(false)
  const [noteError, setNoteError] = useState<string | null>(null)
  // `DrugDossier` carries no per-viewer bookmark flag, so this starts unset and the server's
  // response is the truth. It is a control, not a claim about stored state.
  const [isSaved, setIsSaved] = useState<boolean>(false)
  const [isSavePending, setIsSavePending] = useState<boolean>(false)

  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false)
  const [editorInitialTab, setEditorInitialTab] = useState<EditorTabKey>('overview')

  const structureBoxRef = useRef<HTMLDivElement | null>(null)
  const domId = useId()
  const conditionPanelId = `${domId}-condition`
  const slidePanelId = `${domId}-slide`
  const deepDiveId = `${domId}-deepdive`
  const dossierPanelId = `${domId}-molecular`
  const naturalPanelId = `${domId}-natural`
  const pharmacyPanelId = `${domId}-pharmacy`

  const openEditorAtTab = useCallback((tab: EditorTabKey) => {
    setEditorInitialTab(tab)
    setIsEditorOpen(true)
  }, [])

  const handleEditorSaved = useCallback(
    (updated: DrugDossier | null) => {
      setIsEditorOpen(false)
      // `null` means the edit went to the public review queue rather than publishing, so the page
      // must not change — showing the proposed text as if it were live is the same dishonesty as
      // the wireframe's fake verified badge.
      if (updated) setPublishedOverride(updated)
      router.refresh()
    },
    [router],
  )

  const handleCreateNote = async (e: FormEvent) => {
    e.preventDefault()
    const content = newNoteContent.trim()
    if (!content) return

    if (!currentUser) {
      requireAuth()
      return
    }

    setIsPostingNote(true)
    setNoteError(null)
    try {
      // The server decides the author name, role and MD flag from the session row. Nothing the
      // client sends can mint a credential.
      const { note } = await api.addNote(drug.id, content)
      setNotes((prev) => [note, ...prev])
      setNewNoteContent('')
    } catch (error) {
      setNoteError(error instanceof Error ? error.message : 'That note could not be posted.')
    } finally {
      setIsPostingNote(false)
    }
  }

  const handleToggleUpvote = async (note: CommunityNote) => {
    if (!currentUser) {
      requireAuth()
      return
    }

    const nextUpvoted = !note.hasUpvoted
    const previousUpvotes = note.upvotes
    const previousUpvoted = note.hasUpvoted
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id
          ? { ...n, hasUpvoted: nextUpvoted, upvotes: n.upvotes + (nextUpvoted ? 1 : -1) }
          : n,
      ),
    )

    try {
      const result = await api.toggleUpvote(note.id)
      // The server recomputes the total from the upvote rows, so its number replaces the guess.
      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id ? { ...n, hasUpvoted: result.hasUpvoted, upvotes: result.upvotes } : n,
        ),
      )
    } catch {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id ? { ...n, hasUpvoted: previousUpvoted, upvotes: previousUpvotes } : n,
        ),
      )
    }
  }

  const handleToggleSaved = async () => {
    if (!currentUser) {
      requireAuth()
      return
    }
    const optimistic = !isSaved
    setIsSaved(optimistic)
    setIsSavePending(true)
    try {
      const result = await api.toggleSaved(drug.id)
      setIsSaved(result.saved)
    } catch {
      setIsSaved(!optimistic)
    } finally {
      setIsSavePending(false)
    }
  }

  const isRna =
    drug.modality.includes('RNA') ||
    drug.modality.includes('siRNA') ||
    drug.modality.includes('ASO') ||
    drug.modality.includes('mRNA') ||
    drug.modality.includes('CRISPR')
  const isSmallMolecule =
    drug.modality.includes('Small Molecule') || drug.modality.includes('Nutraceutical')
  const isPeptide = drug.modality.includes('Peptide') || drug.modality.includes('GLP-1')

  // No fallback chain. `structureStringFor` returns the recorded SMILES or 5'->3' sequence, or
  // null when this drug has neither, and null renders the contribute state.
  const structureDisplayString = structureStringFor(drug)

  const handleCopyStructure = async () => {
    if (!structureDisplayString) return
    try {
      await navigator.clipboard.writeText(structureDisplayString)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 2000)
      return
    } catch {
      // Clipboard API unavailable or refused — fall through to the legacy path.
    }

    if (copyViaHiddenTextarea(structureDisplayString)) {
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 2000)
      return
    }

    selectNodeText(structureBoxRef.current)
    setCopyState('manual')
  }

  // Descriptive of the modality class, not a claim about this specific drug — which is why it only
  // renders when there is a real target gene to name.
  const rnaLoopExplanation = isRna
    ? `Direct RNA silencing: Injected molecules match the exact genetic code of ${drug.targetGene} messenger RNA, dismantling disease instructions before proteins can ever be made.`
    : isPeptide
      ? `Cellular receptor cascade: This peptide binds ${drug.targetGene} receptors on cell membranes, signaling internal transcription factors to rebalance RNA expression.`
      : `Cellular signalling loop: This molecule acts on ${drug.targetGene}, changing the downstream signals that decide which proteins a cell makes and how fast it uses them.`

  const mechanismList = drug.mechanismSteps
  // The reference synthesised a plausible-sounding step when the array was empty. It is empty for
  // most of the corpus, so instead the section renders its empty state and the carousel is skipped.
  const currentStep = mechanismList[activeStepIndex] ?? mechanismList[0]
  const currentStepLayman = currentStep
    ? hasText(currentStep.laymanDesc)
      ? currentStep.laymanDesc
      : drug.laymanHowItWorks
    : ''
  const currentStepMolecular = currentStep?.molecularDetail ?? ''

  const naturalFoods = drug.substitutes?.naturalFoods ?? []
  const conventionalRx = drug.substitutes?.conventionalRx ?? []
  const hasSubstitutes = naturalFoods.length > 0 || conventionalRx.length > 0
  const laboratoryWorkflow = drug.molecularSchema?.laboratoryWorkflow ?? []

  const hasConditionContext =
    hasText(drug.conditionContext?.conditionExplainer) || hasText(drug.conditionContext?.whyItMatters)
  const hasPricing =
    hasText(drug.pricing?.synthesisCostPerDose) || hasText(drug.pricing?.retailPricePerDoseOrYear)

  const handleNextStep = () => {
    if (activeStepIndex < mechanismList.length - 1) {
      setActiveStepIndex((prev) => prev + 1)
      setShowTechnicalDeepDive(false)
    }
  }

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1)
      setShowTechnicalDeepDive(false)
    }
  }

  const handleSelectStep = (idx: number) => {
    setActiveStepIndex(idx)
    setShowTechnicalDeepDive(false)
  }

  // Provenance, stated from stored values only. No revisions and no edit timestamp is a real
  // state for a freshly ingested record, and it says so rather than inventing a history.
  const revisionCount = drug.revisionCount ?? 0
  const revisionLine =
    revisionCount === 0 && !drug.lastEditedAt
      ? 'No revisions recorded yet.'
      : [
          `${revisionCount} ${revisionCount === 1 ? 'revision' : 'revisions'}`,
          drug.lastEditedAt ? `last edited ${formatNoteDate(drug.lastEditedAt)}` : null,
          drug.lastEditedBy ? `by ${drug.lastEditedBy}` : null,
        ]
          .filter(Boolean)
          .join(' · ')

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16 animate-fade-in">
      {/* 1. Clean Title, Badges, Medical Context & Prominent Edit Button */}
      <section className="space-y-5 text-center sm:text-left">
        {/* Medicine Name */}
        <div className="space-y-2">
          <div className="flex items-start justify-center sm:justify-between gap-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F] tracking-tight">
              {drug.name}{' '}
              {drug.tradeName && (
                <span className="text-xl sm:text-3xl text-[#86868B] font-normal">
                  ({drug.tradeName})
                </span>
              )}
            </h1>

            {/* Bookmark — icon only, so it carries its own label. */}
            <button
              type="button"
              onClick={handleToggleSaved}
              disabled={isSavePending}
              aria-pressed={isSaved}
              aria-label={isSaved ? `Remove ${drug.name} from saved` : `Save ${drug.name}`}
              className="shrink-0 mt-1 p-2.5 rounded-xl bg-white border border-black/[0.08] hover:bg-[#F5F5F7] disabled:opacity-40 text-[#1D1D1F] shadow-xs transition cursor-pointer"
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-[#0071E3]" aria-hidden="true" />
              ) : (
                <Bookmark className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Modality and Approval Badges Below Name */}
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
            <span className="text-xs font-bold text-[#0071E3] bg-blue-50/80 px-3 py-1 rounded-full border border-[#0071E3]/20">
              {drug.modality}
            </span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-500/20">
              {drug.approvalStatus}
            </span>

            {/* Only ever shown for a structure a deterministic sweep actually passed. There is no
                "unverified" counterpart badge — absence is the honest signal. The hash is
                truncated for the pill and carried in full in the title attribute. */}
            {drug.isMachineVerifiedStructure && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-500/20"
                title={drug.molecularSchema?.verificationHash ?? undefined}
              >
                <Check className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>Machine-Verified Structure</span>
                {drug.molecularSchema?.verificationHash && (
                  <code className="font-mono text-[10px] text-emerald-700">
                    {drug.molecularSchema.verificationHash.slice(0, 12)}
                  </code>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Target and Indication Line */}
        <p className="text-sm sm:text-base font-semibold text-[#0071E3] leading-relaxed">
          {hasText(drug.targetGene) ? (
            <>
              Targets {drug.targetGene} &bull; {drug.patientFriendlyIndication}
            </>
          ) : (
            drug.patientFriendlyIndication
          )}
        </p>

        {/* Prominent, Aesthetic Edit Wiki Dossier Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => openEditorAtTab('overview')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-white hover:bg-[#FAFAFC] text-[#0071E3] text-sm font-bold border border-[#0071E3]/30 shadow-[0_2px_12px_rgba(0,113,227,0.08)] hover:shadow-[0_4px_20px_rgba(0,113,227,0.15)] transition-all cursor-pointer active:scale-98 group"
          >
            <Edit3
              className="w-4 h-4 text-[#0071E3] group-hover:rotate-12 transition-transform shrink-0"
              aria-hidden="true"
            />
            <span>Edit Wiki Dossier &amp; Scientific Records</span>
          </button>
        </div>

        {/* Comprehensive Medical Context & Disease Background */}
        {hasConditionContext && drug.conditionContext ? (
          <div className="bg-gradient-to-br from-[#FAFAFC] to-white rounded-3xl p-6 sm:p-7 border border-black/[0.08] shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#0071E3]" aria-hidden="true" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0071E3]">
                  What is this condition &amp; why this medicine exists
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowConditionDetails(!showConditionDetails)}
                aria-expanded={showConditionDetails}
                aria-controls={conditionPanelId}
                className="text-xs text-[#86868B] hover:text-[#1D1D1F] transition cursor-pointer flex items-center gap-1"
              >
                <span>{showConditionDetails ? 'Hide Context' : 'Explain Condition'}</span>
                {showConditionDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>
            </div>

            {showConditionDetails && (
              <div
                id={conditionPanelId}
                className="space-y-3.5 text-xs sm:text-sm text-[#424245] leading-relaxed animate-fade-in"
              >
                <p className="text-sm font-medium text-[#1D1D1F]">
                  {drug.conditionContext.conditionExplainer}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white border border-black/[0.05] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071E3] block">
                      Why It Matters For Health
                    </span>
                    <p className="text-xs text-[#52525B] leading-relaxed">
                      {drug.conditionContext.whyItMatters}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-black/[0.05] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Who Takes This Medicine
                    </span>
                    <p className="text-xs text-[#52525B] leading-relaxed">
                      {drug.conditionContext.whoTakesThis}
                    </p>
                  </div>
                </div>

                {drug.conditionContext.clinicalGoals && (
                  <div className="pt-1 flex items-start gap-2 text-xs text-[#27272A] bg-blue-50/50 p-3 rounded-xl border border-[#0071E3]/15">
                    <Stethoscope
                      className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Primary Treatment Goal:</strong> {drug.conditionContext.clinicalGoals}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-left">
            <MissingSectionCard
              line="Nobody has written the condition background for this medicine yet — what the illness is, why it matters, and who takes this."
              onAdd={() => openEditorAtTab('overview')}
            />
          </div>
        )}

        {/* 10-Second Verdict Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#86868B] block">
            The 10-Second Verdict
          </span>

          {hasText(drug.oneSentenceVerdict) ? (
            <p className="text-base sm:text-lg font-bold text-[#1D1D1F] leading-snug">
              {drug.oneSentenceVerdict}
            </p>
          ) : (
            <MissingInline
              line="No plain-language verdict has been written for this medicine yet."
              onAdd={() => openEditorAtTab('overview')}
            />
          )}
          {hasText(drug.laymanHowItWorks) && (
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              {drug.laymanHowItWorks}
            </p>
          )}

          {/* RNA Connection Insight — the sentence describes the modality class, so it needs a
              named target gene to be about anything at all. */}
          {hasText(drug.targetGene) && (
            <div className="pt-3 border-t border-black/[0.05] flex items-start sm:items-center gap-2.5 text-xs text-[#374151]">
              <Dna className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
              <span className="leading-relaxed">
                <strong>RNA Connection:</strong> {rnaLoopExplanation}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 2. Synthesis Cost vs Retail Price (The Economic Reality) */}
      <section className="space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] px-1 block">
          True Manufacturing Cost vs. Pharmacy Price
        </span>

        {hasPricing && drug.pricing ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-500/15 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Raw Chemical Synthesis Cost
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono block">
                  {hasText(drug.pricing.synthesisCostPerDose)
                    ? drug.pricing.synthesisCostPerDose
                    : 'Not documented'}
                </span>
                <span className="text-[11px] text-emerald-700 block">
                  Active ingredient production in standard reactors
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/80 border border-rose-500/15 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block">
                  Pharma Retail List Price
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#1D1D1F] font-mono block">
                  {hasText(drug.pricing.retailPricePerDoseOrYear)
                    ? priceHeadline(drug.pricing.retailPricePerDoseOrYear)
                    : 'Not documented'}
                </span>
                <span className="text-[11px] text-rose-700 block">
                  Commercial retail list price before insurance
                </span>
              </div>
            </div>

            {/* The reference printed one footnote for every drug: "Verified active ingredient
                synthesis cost using automated solid-phase phosphoramidite chemistry." That is how
                oligonucleotides are made and has nothing to do with a statin or an antibody, and
                "Verified" claimed a check nobody ran. What a reader needs instead is where the
                number came from, which the curated record actually records. */}
            <p className="text-xs text-[#86868B] leading-relaxed">
              {hasText(drug.pricing.openPatentNotes)
                ? drug.pricing.openPatentNotes
                : 'Cost of the active ingredient at scale, against the commercial list price before insurance. Both figures come from the cited sources on this record.'}
            </p>
          </div>
        ) : (
          <MissingSectionCard
            line="The synthesis cost and the pharmacy list price for this medicine have not been recorded yet."
            onAdd={() => openEditorAtTab('pricing')}
          />
        )}
      </section>

      {/* 3. Pure, Sleek Carousel: How It Operates Inside Cells */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B]">
            How It Operates Inside Cells
          </span>
          {currentStep && (
            <span className="text-xs font-semibold text-[#0071E3] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
              Step {activeStepIndex + 1} of {mechanismList.length}
            </span>
          )}
        </div>

        {currentStep ? (
          /* Carousel Container */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-6">
            {/* Top Step Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F5F5F7] rounded-2xl overflow-x-auto scrollbar-thin">
              {mechanismList.map((step, idx) => {
                const isActive = activeStepIndex === idx
                return (
                  <button
                    type="button"
                    key={step.step || idx}
                    onClick={() => handleSelectStep(idx)}
                    aria-current={isActive ? 'step' : undefined}
                    aria-controls={slidePanelId}
                    className={`flex-1 min-w-[70px] py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center whitespace-nowrap flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-white text-[#0071E3] shadow-xs scale-[1.02]'
                        : 'text-[#86868B] hover:text-[#1D1D1F]'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 transition-colors ${
                        isActive ? 'bg-[#0071E3] text-white' : 'bg-black/[0.06] text-[#86868B]'
                      }`}
                      aria-hidden="true"
                    >
                      {idx + 1}
                    </span>
                    <span>Step {idx + 1}</span>
                  </button>
                )
              })}
            </div>

            {/* Active Carousel Slide Card (Smoothly switches content) */}
            <div
              key={activeStepIndex}
              id={slidePanelId}
              aria-live="polite"
              className="bg-gradient-to-b from-[#FAFAFC] to-white rounded-2xl p-6 sm:p-7 border border-black/[0.06] shadow-xs space-y-5 animate-zoom-in"
            >
              {/* Slide Header & Direct Next/Prev Controls */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-[#0071E3] bg-[#0071E3]/10 px-3 py-1 rounded-full">
                    Stage {activeStepIndex + 1} of {mechanismList.length} &bull;{' '}
                    {currentStep.visualStage
                      ? currentStep.visualStage.replace('_', ' ')
                      : 'Target Action'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#1D1D1F] tracking-tight leading-snug pt-1">
                    {currentStep.title}
                  </h3>
                </div>

                {/* Arrow Slide Navigators */}
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button
                    type="button"
                    disabled={activeStepIndex === 0}
                    onClick={handlePrevStep}
                    className="p-2.5 rounded-xl bg-white border border-black/[0.08] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:cursor-not-allowed text-[#1D1D1F] shadow-xs transition cursor-pointer"
                    title="Previous Step"
                    aria-label="Previous step"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={activeStepIndex === mechanismList.length - 1}
                    onClick={handleNextStep}
                    className="p-2.5 rounded-xl bg-white border border-black/[0.08] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:cursor-not-allowed text-[#1D1D1F] shadow-xs transition cursor-pointer"
                    title="Next Step"
                    aria-label="Next step"
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Plain-English Explanation */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] block">
                  What is happening inside the body:
                </span>
                {hasText(currentStepLayman) ? (
                  <p className="text-sm sm:text-base text-[#1D1D1F] leading-relaxed font-normal">
                    {currentStepLayman}
                  </p>
                ) : (
                  <MissingInline
                    line="This step has no plain-English explanation recorded yet."
                    onAdd={() => openEditorAtTab('overview')}
                  />
                )}
              </div>

              {/* Target & Anatomical Site Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] flex items-start gap-3 shadow-xs">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Target className="w-3.5 h-3.5 text-[#0071E3]" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#86868B] block">
                      Primary Target
                    </span>
                    {hasText(drug.targetGene) ? (
                      <span className="text-xs font-bold text-[#1D1D1F] block">
                        {drug.targetGene} ({drug.targetProtein || drug.targetGene})
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEditorAtTab('overview')}
                        className="text-xs font-semibold text-[#0071E3] hover:underline cursor-pointer block text-left"
                      >
                        Not documented yet &mdash; add
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] flex items-start gap-3 shadow-xs">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#86868B] block">
                      Anatomical / Cellular Site
                    </span>
                    {/* The reference hard-coded this per drug id and fell through to a generic
                        "Intracellular Target Organelle" for everything else. Deleted: the real
                        column, or an invitation to fill it. */}
                    {hasText(drug.anatomicalSite) ? (
                      <span className="text-xs font-bold text-[#1D1D1F] block">
                        {drug.anatomicalSite}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEditorAtTab('overview')}
                        className="text-xs font-semibold text-[#0071E3] hover:underline cursor-pointer block text-left"
                      >
                        Not documented yet &mdash; add
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Discrete Molecular Kinetics Drawer inside the active slide */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowTechnicalDeepDive(!showTechnicalDeepDive)}
                  aria-expanded={showTechnicalDeepDive}
                  aria-controls={deepDiveId}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-[#F5F5F7] border border-black/[0.06] transition cursor-pointer text-left shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <Microscope className="w-3.5 h-3.5 text-[#0071E3]" aria-hidden="true" />
                    <span className="text-xs font-bold text-[#1D1D1F]">
                      {showTechnicalDeepDive
                        ? 'Hide Biochemical Kinetics'
                        : '🔬 View Deep-Science Molecular Kinetics & Pathway'}
                    </span>
                  </div>
                  {showTechnicalDeepDive ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#86868B]" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B]" aria-hidden="true" />
                  )}
                </button>

                {showTechnicalDeepDive && (
                  <div
                    id={deepDiveId}
                    className="mt-2.5 p-4 rounded-xl bg-[#1D1D1F] text-emerald-300 space-y-1.5 animate-fade-in"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Zap className="w-3 h-3 text-amber-400" aria-hidden="true" />
                      <span>Exact Molecular Pathway &amp; Enzyme Mechanics:</span>
                    </div>
                    {hasText(currentStepMolecular) ? (
                      <p className="text-xs font-mono leading-relaxed text-emerald-200/90">
                        {currentStepMolecular}
                      </p>
                    ) : (
                      /* The reference invented a sentence here ("Engages target receptor with high
                         kinetic selectivity...") for every step that had none. */
                      <div className="space-y-1.5">
                        <p className="text-xs font-mono leading-relaxed text-emerald-200/60">
                          No molecular detail recorded for this step yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => openEditorAtTab('overview')}
                          className="text-xs font-bold text-emerald-300 hover:underline cursor-pointer"
                        >
                          Add this section
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Carousel Interactive Pagination Dots & Advance Navigation */}
            <div className="flex items-center justify-between pt-1">
              {/* Interactive Dot Indicators */}
              <div className="flex items-center gap-2">
                {mechanismList.map((_, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectStep(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeStepIndex === idx
                        ? 'w-6 bg-[#0071E3]'
                        : 'w-2 bg-black/[0.12] hover:bg-black/[0.25]'
                    }`}
                    title={`Go to Step ${idx + 1}`}
                    aria-label={`Go to step ${idx + 1}`}
                    aria-current={activeStepIndex === idx ? 'step' : undefined}
                  />
                ))}
              </div>

              {/* Next / Previous Quick Actions */}
              <div className="flex items-center gap-2">
                {activeStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#EAEAEA] text-xs font-bold text-[#1D1D1F] transition cursor-pointer"
                  >
                    &larr; Prev
                  </button>
                )}
                {activeStepIndex < mechanismList.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-4 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-xs font-bold text-white transition cursor-pointer shadow-xs"
                  >
                    Next: Step {activeStepIndex + 2} &rarr;
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectStep(0)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#EAEAEA] text-xs font-bold text-[#0071E3] transition cursor-pointer"
                  >
                    Restart Tour &#x21bb;
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <MissingSectionCard
            line="The step-by-step mechanism of action has not been written for this medicine yet."
            onAdd={() => openEditorAtTab('overview')}
          />
        )}
      </section>

      {/* 4. Evidence-Backed Alternatives (Refined, Non-Clumpy Design with NO add button in header) */}
      <section className="space-y-4">
        <div className="px-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] block">
            Evidence-Backed Alternatives
          </span>
        </div>

        {hasSubstitutes ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-6">
            {/* Clean Segmented Tab Switcher */}
            <div className="flex items-center gap-2 border-b border-black/[0.06] pb-3 text-xs">
              <button
                type="button"
                onClick={() => setActiveSubstituteTab('natural')}
                aria-pressed={activeSubstituteTab === 'natural'}
                aria-controls={naturalPanelId}
                className={`font-bold pb-1.5 transition cursor-pointer flex items-center gap-1.5 ${
                  activeSubstituteTab === 'natural'
                    ? 'text-emerald-800 border-b-2 border-emerald-600'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Dietary &amp; Natural Foods ({naturalFoods.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubstituteTab('pharmacy')}
                aria-pressed={activeSubstituteTab === 'pharmacy'}
                aria-controls={pharmacyPanelId}
                className={`font-bold pb-1.5 transition cursor-pointer flex items-center gap-1.5 ${
                  activeSubstituteTab === 'pharmacy'
                    ? 'text-[#0071E3] border-b-2 border-[#0071E3]'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Low-Cost Pharmacy Alternatives ({conventionalRx.length})</span>
              </button>
            </div>

            {/* Dietary & Natural Foods Tab */}
            {activeSubstituteTab === 'natural' && (
              <div id={naturalPanelId} className="space-y-3.5">
                {naturalFoods.length === 0 ? (
                  <MissingInline
                    line="No dietary or natural alternatives have been recorded for this medicine yet."
                    onAdd={() => openEditorAtTab('substitutes')}
                  />
                ) : (
                  naturalFoods.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-500/15 space-y-2.5"
                    >
                      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                        <h4 className="text-sm font-bold text-emerald-950">{item.name}</h4>
                        {hasText(item.monthlyCost) &&
                          (() => {
                            const chip = costChip(item.monthlyCost)
                            return (
                              <span
                                title={item.monthlyCost}
                                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap ${
                                  chip.muted
                                    ? 'text-emerald-900/60 bg-emerald-100/40'
                                    : 'text-emerald-800 bg-emerald-100/60'
                                }`}
                              >
                                {chip.label}
                              </span>
                            )
                          })()}
                      </div>

                      <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
                        {item.mechanism || item.biologicalMechanism}
                      </p>

                      {hasText(item.dailyUsage) && (
                        <div className="pt-1 flex items-center gap-2 text-xs text-[#6E6E73]">
                          <span className="font-semibold text-emerald-900">Recommended Usage:</span>
                          <span>{item.dailyUsage}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Low-Cost Pharmacy Alternatives Tab */}
            {activeSubstituteTab === 'pharmacy' && (
              <div id={pharmacyPanelId} className="space-y-3.5">
                {conventionalRx.length === 0 ? (
                  <MissingInline
                    line="No lower-cost pharmacy alternatives have been recorded for this medicine yet."
                    onAdd={() => openEditorAtTab('substitutes')}
                  />
                ) : (
                  conventionalRx.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] space-y-2.5"
                    >
                      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                        <h4 className="text-sm font-bold text-[#1D1D1F]">{item.name}</h4>
                        {hasText(item.typicalCost) &&
                          (() => {
                            const chip = costChip(item.typicalCost)
                            return (
                              <span
                                title={item.typicalCost}
                                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap ${
                                  chip.muted ? 'text-[#0071E3]/60 bg-blue-50/60' : 'text-[#0071E3] bg-blue-50'
                                }`}
                              >
                                {chip.label}
                              </span>
                            )
                          })()}
                      </div>

                      <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
                        {item.comparisonToDrug || item.howItCompares}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <MissingSectionCard
            line="No evidence-backed alternatives — dietary or pharmacy — have been recorded for this medicine yet."
            onAdd={() => openEditorAtTab('substitutes')}
          />
        )}
      </section>

      {/* 5. Rich, Highly Useful Open-Source RNA & Molecular Dossier */}
      <section className="space-y-4">
        <button
          type="button"
          onClick={() => setShowMolecularDossier(!showMolecularDossier)}
          aria-expanded={showMolecularDossier}
          aria-controls={dossierPanelId}
          className="w-full flex items-center justify-between bg-white hover:bg-[#FAFAFC] p-6 rounded-3xl border border-black/[0.08] shadow-xs transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5 text-[#0071E3]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F] group-hover:text-[#0071E3] transition">
                Open-Source Chemical Sequence &amp; Lab Recipe
              </h3>
              <p className="text-xs text-[#86868B] mt-0.5">
                Public genetic sequence, molecular specs, and generic synthesis procedure
              </p>
            </div>
          </div>
          {showMolecularDossier ? (
            <ChevronUp className="w-5 h-5 text-[#86868B]" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#86868B]" aria-hidden="true" />
          )}
        </button>

        {showMolecularDossier && (
          <div
            id={dossierPanelId}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] space-y-6 animate-fade-in"
          >
            {structureDisplayString ? (
              <>
                {/* Plain-English Takeaway for Average Joe.
                    The reference printed "This exact oligonucleotide sequence..." for every drug,
                    including small molecules whose structure is a SMILES string and not an
                    oligonucleotide at all. The RNA wording is kept verbatim where it is true; the
                    other modalities get the same idea stated accurately. */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-[#0071E3]/20 text-xs sm:text-sm text-[#1D1D1F] leading-relaxed">
                  <span className="font-bold text-[#0071E3] block mb-1">
                    What This Molecular Code Means:
                  </span>
                  {isRna && hasText(drug.targetGene)
                    ? `This exact oligonucleotide sequence matches the cellular mRNA code of ${drug.targetGene}. Once synthesized in an automated reactor, it operates like a precise biological search-and-destroy script inside cells.`
                    : `This is the chemical structure recorded for ${drug.name}. It is the exact string a chemist or an automated synthesiser needs to reproduce the molecule.`}
                </div>

                {/* Molecular String Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1D1D1F]">
                      {isSmallMolecule
                        ? 'SMILES Chemical Structure'
                        : isPeptide
                          ? 'Amino Acid Peptide Sequence'
                          : isRna
                            ? "RNA Nucleotide Sequence (5' → 3')"
                            : // Antibodies, recombinant proteins and gene therapies reach here.
                              // The reference's final fallback was the RNA label, which called an
                              // immunoglobulin descriptor a nucleotide sequence.
                              'Molecular Structure Descriptor'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyStructure}
                      className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center gap-1.5 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-lg"
                    >
                      {copyState === 'copied' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>
                        {copyState === 'copied'
                          ? 'Copied'
                          : copyState === 'manual'
                            ? 'Press Cmd/Ctrl+C'
                            : 'Copy Code'}
                      </span>
                    </button>
                  </div>

                  <div
                    ref={structureBoxRef}
                    className="p-4 rounded-2xl bg-[#1D1D1F] text-emerald-300 font-mono text-xs break-all select-all leading-relaxed"
                  >
                    {structureDisplayString}
                  </div>
                  {/* Announced to screen readers; the button label carries the same words visually. */}
                  <p aria-live="polite" className="sr-only">
                    {copyState === 'copied'
                      ? 'Structure copied to clipboard.'
                      : copyState === 'manual'
                        ? 'Copying was blocked. The structure is selected — press Cmd or Ctrl plus C.'
                        : ''}
                  </p>
                </div>
              </>
            ) : (
              <MissingInline
                line="No chemical structure — SMILES string or nucleotide sequence — has been recorded for this medicine yet."
                onAdd={() => openEditorAtTab('sequence')}
              />
            )}

            {/* Quick Scientific Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-[#F5F5F7] rounded-xl space-y-0.5">
                <span className="text-[10px] text-[#86868B] block">Modality</span>
                <span className="font-bold text-[#1D1D1F]">{drug.modality}</span>
              </div>
              <div className="p-3 bg-[#F5F5F7] rounded-xl space-y-0.5">
                <span className="text-[10px] text-[#86868B] block">Target Gene</span>
                <span className="font-bold text-[#0071E3]">
                  {hasText(drug.targetGene) ? drug.targetGene : 'Not documented'}
                </span>
              </div>
              <div className="p-3 bg-[#F5F5F7] rounded-xl space-y-0.5">
                <span className="text-[10px] text-[#86868B] block">Synthesis Unit Cost</span>
                {/* The reference fell back to a flat '$5.00' here for every drug without pricing. */}
                <span className="font-bold text-emerald-800 font-mono">
                  {hasText(drug.pricing?.synthesisCostPerDose)
                    ? drug.pricing?.synthesisCostPerDose
                    : 'Not documented'}
                </span>
              </div>
              <div className="p-3 bg-[#F5F5F7] rounded-xl space-y-0.5">
                <span className="text-[10px] text-[#86868B] block">Verification</span>
                {/* The reference hard-coded "Public Domain ✓" for every record — a legal claim
                    printed regardless of the data. This reports the one verification state the
                    database actually stores. */}
                <span
                  className={`font-bold ${
                    drug.isMachineVerifiedStructure ? 'text-emerald-800' : 'text-[#86868B]'
                  }`}
                >
                  {drug.isMachineVerifiedStructure ? 'Machine verified ✓' : 'Not verified yet'}
                </span>
              </div>
            </div>

            {/* Step-by-Step Generic Synthesis Procedure DAG */}
            <div className="space-y-3 pt-2 border-t border-black/[0.05]">
              <span className="text-xs font-bold text-[#1D1D1F] block">
                Generic Laboratory Synthesis Protocol
              </span>
              {laboratoryWorkflow.length === 0 ? (
                <MissingInline
                  line="No laboratory synthesis protocol has been recorded for this medicine yet."
                  onAdd={() => openEditorAtTab('protocol')}
                />
              ) : (
                laboratoryWorkflow.map((step, idx) => (
                  <div key={step.id || idx} className="p-4 rounded-2xl bg-[#F5F5F7] text-xs space-y-1">
                    <div className="font-bold text-[#1D1D1F]">
                      Step {step.stepNumber}: {step.name}
                    </div>
                    <p className="text-[#424245] leading-relaxed">{step.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* 6. Physician & Community Peer Review Notes */}
      <section className="space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] px-1 block">
          Physician &amp; Community Notes ({notes.length})
        </span>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-5">
          <form onSubmit={handleCreateNote} className="space-y-3">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Add clinical observation or evidence verification..."
              aria-label="Add clinical observation or evidence verification"
              maxLength={NOTE_MAX_LENGTH}
              rows={2}
              className="w-full bg-[#F5F5F7] rounded-2xl p-3.5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 font-medium"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#86868B]">
                {currentUser ? `Posting as ${currentUser.name}` : 'Log in as MD to sign note'}
              </span>
              <button
                type="submit"
                disabled={isPostingNote}
                className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition shadow-xs active:scale-95"
              >
                {isPostingNote ? 'Posting…' : 'Add Note'}
              </button>
            </div>
            {noteError && (
              <p role="alert" className="text-[11px] font-semibold text-rose-700">
                {noteError}
              </p>
            )}
          </form>

          {/* Notes List */}
          <div className="space-y-3 pt-2 border-t border-black/[0.05]">
            {notes.length === 0 && (
              <p className="text-xs text-[#86868B] leading-relaxed">
                No notes yet. The first clinical observation on this record can be yours.
              </p>
            )}
            {notes.map((note) => (
              <div key={note.id} className="p-4 rounded-2xl bg-[#F5F5F7] space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#1D1D1F]">{note.author}</span>
                    {/* Server-set only. `isDoctor` alone is a self-declaration and never earns
                        this badge — see lib/queries/notes.ts. */}
                    {note.isVerifiedDoctor && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        MD ✓
                      </span>
                    )}
                  </div>
                  <time
                    dateTime={note.date}
                    suppressHydrationWarning
                    className="text-[10px] text-[#86868B] shrink-0"
                  >
                    {formatNoteDate(note.date)}
                  </time>
                </div>

                {(note.medicalSpecialty || note.institution) && (
                  <p className="text-[10px] text-[#86868B]">
                    {[note.medicalSpecialty, note.institution].filter(Boolean).join(' · ')}
                  </p>
                )}

                <p className="text-[#424245] leading-relaxed">{note.content}</p>

                {/* The wireframe's CommunityNote carried `upvotes` and never rendered a control
                    for it. Optimistic, and reverted on error. */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleToggleUpvote(note)}
                    aria-pressed={Boolean(note.hasUpvoted)}
                    aria-label={
                      note.hasUpvoted
                        ? `Remove your upvote from the note by ${note.author}`
                        : `Upvote the note by ${note.author}`
                    }
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                      note.hasUpvoted
                        ? 'bg-blue-50 text-[#0071E3] border-[#0071E3]/20'
                        : 'bg-white text-[#6E6E73] border-black/[0.06] hover:text-[#1D1D1F]'
                    }`}
                  >
                    <ArrowUp className="w-3 h-3" aria-hidden="true" />
                    <span>{note.upvotes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Revision history — provenance, one quiet line. Not in the reference, which had no
             server and therefore no history to point at. */}
      <section className="space-y-4">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="flex items-center gap-2 text-xs text-[#86868B]">
              <History className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span suppressHydrationWarning>{revisionLine}</span>
            </span>
            <Link
              href={`/d/${drug.id}/history`}
              className="text-xs font-bold text-[#0071E3] hover:underline"
            >
              Revision history
            </Link>
          </div>
        </div>
      </section>

      {/* Specialist Editor Modal */}
      <RnaWikiEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        drug={drug}
        initialTab={editorInitialTab}
        onSaved={handleEditorSaved}
      />
    </div>
  )
}

export default DrugDossierView
