/**
 * Corpus dossier loading (Phase 4) — one slug to one rendered record.
 *
 * The tables migration 0024 created hold the corpus as rows: identity, synonyms, fields with their
 * source and dates, derived seeds, the ordered question list, relations, sources and the registry
 * matches. This module reads them for one slug and returns exactly what the template renders.
 *
 * Three disciplines are load-bearing.
 *
 * 1. **One implementation of the prose.** The two paragraphs and the revealed rows of a block are
 *    built by `buildBlockBody` in `lib/corpus/page-text.ts`, which re-exports the same function the
 *    overlap harness measured. Nothing here writes a sentence.
 * 2. **Absent data becomes absent markup.** Every list this module returns is empty when the rows
 *    are missing, and the template renders nothing for an empty list — never a placeholder, never a
 *    heading with nothing under it, never a "not recorded" line.
 * 3. **The stored question is what was published.** The ordered `page_questions` rows decide which
 *    blocks exist and what each one asks. The derivation is re-run only to recover the slot values
 *    the row does not store (it stores the finished string), and a re-derived question is matched
 *    to a stored row by template. A page whose derivation now yields a different set still renders
 *    the published set.
 */
import { eq, inArray } from 'drizzle-orm'

import { db } from '@/db'
import {
  corpusPages,
  pageControlled,
  pageDisplayNames,
  pageFields,
  pageInteractions,
  pagePatent,
  pageQuestions,
  pageRegistration,
  pageRegistryAggregate,
  pageRegistryRoleAggregates,
  pageRegistryStudies,
  pageRelations,
  pageSections,
  pageSeeds,
  pageSources,
  pageSynonyms,
} from '@/db/schema'
import {
  anchor,
  buildBlockBody,
  carriesDoseText,
  checkedSourceNames,
  checkedSourcesStatement,
  deriveQuestions,
  groupRevealedRows,
  INTERACTION_TIER_LABELS,
  interactionRecordIds,
  registerName,
  registerEventLines,
  sectionSentenceParts,
  supervisionContext,
  type FieldEntry,
  type PageBundle,
  type QuestionBlock,
  type RevealedRow,
  type SourceRef,
} from '@/lib/corpus/page-text'
import { ORGANISM_RUNGS } from '@/lib/corpus/organism-ladder'
import {
  isUnknownClassOnly,
  supervisionBlock,
  unknownClassificationLine,
  type SuppressionEvidence,
} from '@/lib/corpus/suppression-classes'
import { hubsForPage } from '@/lib/hubs/queries'
import { HUB_TYPE_LABEL } from '@/lib/hubs/types'

/* ------------------------------------------------------------------ types */

/** A provenance anchor: a literal source, never a section of this page. */
export interface CorpusAnchor {
  /** "ClinicalTrials.gov · NCT00117520 · 2026-09-01", as the shared builder writes it. */
  text: string
  href?: string
  sourceDate?: string
  lastVerified?: string
}

export interface CorpusParagraph {
  text: string
  /** Character range of the one bold span, when the paragraph carries a recorded value. */
  emphasis?: { start: number; end: number }
  anchor?: CorpusAnchor
  /** A second paragraph that states no sourced value is marked, not given a manufactured source. */
  interpretation: boolean
  /**
   * §12: true where the paragraph is page furniture — an absence stated in fixed words. The one
   * answer that is, "No regulator classification is recorded for X", carries `data-furniture` here
   * exactly as the register absence table and the patent no-record line do, so the ruler, the
   * rendered duplicate check and the slop draw's template test all skip the same statement.
   */
  furniture?: true
  /**
   * §16(1): true where the paragraph is one item of a list the block paints as a list. The
   * supervision answer is the one block whose body enumerates rather than develops — one clause
   * per class the suppression pass recorded, in the order S1–S9 — so the template paints its
   * clauses as list items and the two-paragraph cap does not apply to it.
   */
  listItem?: true
}

/** Consecutive revealed rows that share a label are one group; the label becomes its heading. */
export interface CorpusRowGroup {
  id: string
  label?: string
  rows: RevealedRow[]
  /**
   * §14(9): true where this group is the counted remainder of a list longer than six rows, and the
   * template paints it inside a closed `<details>` of its own rather than on the page.
   */
  disclosed?: boolean
}

export interface CorpusBlock {
  id: string
  badge: string
  ordinal: number
  block: string
  template: string
  question: string
  paragraphs: CorpusParagraph[]
  /** §13(7): the block's own values, painted under the question heading, above the prose. */
  facts: RevealedRow[]
  groups: CorpusRowGroup[]
  /** R9: the dates the rows under this block were recorded and last checked. */
  sourceDate?: string
  lastVerified?: string
}

export interface CorpusLadderRung {
  rung: string
  label: string
  filled: boolean
  /** "lifespan", "biomarker" — the recorded evidence kind, only when the rung is filled. */
  kind?: string
}

export interface CorpusIdentifierRow {
  /** The recorded column the value came from: `unii`, `chemblId`, `pubchemCid`, `cas`, … */
  field: string
  label: string
  value: string
  href?: string
}

export interface CorpusRelationRow {
  label: string
  name: string
  slug?: string
}

/**
 * One hub this page belongs to (docs/specs/hubs.md §3). A row, never a sentence.
 *
 * A leaf below its tier's indexing threshold is `noindex,follow`; these links are how it stays
 * reachable, and how a reader moves from one compound to the group it belongs to.
 */
export interface CorpusHubRow {
  /** 'Target' | 'Mechanism class' | 'Pathway' */
  label: string
  /** The hub's own name: AR, L02BB, mTOR. */
  name: string
  /** /h/<type>/<slug> */
  path: string
}

export interface CorpusSourceRow {
  kind: string
  register: string
  id: string
  href?: string
  sourceDate?: string
  title?: string
  licence?: string
}

/** One register event folded into the registration block (§13(2)): a sentence, in words. */
export interface CorpusRegisterEvent {
  sentence: string
}

export interface CorpusSynonymGroup {
  kind: string
  label: string
  names: string[]
}

/* ------------------------------------------- Phase 4 blocks (docs/specs/phase4-generators.md) */

/** One "Where it's registered" line (§3). `line` is what the register stage wrote; nothing here rewrites it. */
export interface CorpusRegistrationLine {
  /**
   * The absence this row states, in three words — `not found`, `not cleared`, `not checked` — and
   * absent on a row that states anything affirmative. §11 renders these as one table of furniture
   * rather than as seven sentences on 25,000 pages.
   */
  absence?: string
  id: string
  jurisdiction: string
  label: string
  status: string
  detail?: string
  source?: string
  dateChecked?: string
  ordinal: number
  /** The component of a combination product this line belongs to. */
  component?: string
  line: string
  /**
   * True where the row belongs to the technical disclosure and never to a visible line (§13(6)).
   *
   * NCATS Inxight files a curated marketing record under the jurisdiction "unspecified". It names
   * no jurisdiction and no register, so it is not a register line; it is kept, and the block paints
   * it inside its closed disclosure.
   */
  disclosed: boolean
  /** The upstream files NCATS stitched to build a curated row: the disclosure only (§13(6)). */
  upstreamRegisters: string[]
  /** The application ids the summary line stands for; rendered in a disclosure, never as lines. */
  applications: string[]
}

/** One interaction line (§4). The tier label is the first thing on it, in words. */
export interface CorpusInteractionLine {
  id: string
  tier: 'A' | 'B' | 'C'
  tierLabel: string
  line: string
  /** The counterpart's own page, where the corpus holds one. A slug, never a storage key. */
  counterpartSlug?: string
  counterpartName?: string
  /** True where the line sits in the disclosure rather than on the page's first six. */
  disclosed: boolean
  sourceUrl?: string
  /** Storage tokens, for the technical disclosure only. */
  ruleId?: string
  setId?: string
  sourceRecordId?: string
  /** §14(5): the direction class a grouped label-documented line states, for its disclosure row. */
  groupedDirection?: string
  /**
   * §14(6): the dataset records behind this line, for the closed disclosure and nowhere above it.
   * A grouped line stands for several, and the render and the page read the same list through
   * `interactionRecordIds` so they cannot paint two different rows for one line.
   */
  recordIds?: string[]
}

export interface CorpusInteractions {
  /** Ordered by tier: label-documented, curated, predicted. */
  lines: CorpusInteractionLine[]
  /** "No interaction found in … as of …", or the affirmative form where rows were found. */
  statement?: string
  /** The registers checked, in words, for the technical disclosure. */
  sourcesChecked: string[]
  date?: string
  /** Distinct counterparts recorded per tier, including the ones not stored. */
  totals: Partial<Record<'A' | 'B' | 'C', number>>
  /** True where the page carries predictions and nothing documented or curated (§4). */
  predictedOnly: boolean
}

export interface CorpusPatentLine {
  eligible: boolean
  line: string
  /** True where the line states only that no US register holds this record (§11 furniture). */
  absence: boolean
  register?: string
  reason?: string
  source?: string
  dateChecked?: string
  /** Orange Book and Purple Book application ids, for the disclosure. */
  applications: string[]
}

export interface CorpusControlledRow {
  id: string
  jurisdiction: string
  list: string
  classOrSchedule: string
  substanceAsListed?: string
  statute?: string
  statuteUrl?: string
  versionDate?: string
  source?: string
}

/** One computed Tier 3 section (§8), as rows and — where the comparison found one — a sentence. */
export interface CorpusSectionSentence {
  section: 'neighbour' | 'potency' | 'timeline' | 'formOf' | 'relationNote'
  ordinal: number
  /** §13(7), §13(8): the values, as labelled rows. Empty where the section is prose only. */
  rows: RevealedRow[]
  /** The prose the section states beyond its values, where it states any. */
  sentence?: string
  /** The linked page a nearest-neighbour or form-of sentence names, where it has one. */
  counterpartSlug?: string
  counterpartName?: string
}

export interface CorpusDossier {
  key: string
  slug: string
  displayName: string
  model: string
  tier: number
  pageType: 'longevity' | 'clinical' | 'withdrawn' | 'development' | 'stub'
  indexable: boolean
  /**
   * The page this record is held against as a rendered duplicate (§13 item 14).
   *
   * Two indexable pages measuring at or above 0.5 on the rendered check are nearly the same page.
   * The one with fewer own facts is `noindex,follow` and carries a link to the other, until Felix
   * decides which of the two the corpus keeps. Absent on every page that is not held.
   */
  duplicateHoldOf?: { slug: string; displayName: string }
  suppressed: boolean
  suppressionClasses: string[]
  /** The evidence recorded for those classes; the supervision answer is built from it (§15(1)). */
  suppressionEvidence: SuppressionEvidence[]
  withdrawn: boolean
  presentFieldCount: number
  applicableFieldCount: number
  synonyms: CorpusSynonymGroup[]
  register: string
  lastVerified?: string
  topRung?: string
  humanData: boolean
  /** The ladder's own evidence kind, else what the registry records. Absent where neither does. */
  evidenceTier?: string
  ladder: CorpusLadderRung[]
  blocks: CorpusBlock[]
  /** §13(2): the approvals and withdrawals the registers dated, inside the registration block. */
  registerEvents: CorpusRegisterEvent[]
  identifiers: CorpusIdentifierRow[]
  relations: CorpusRelationRow[]
  hubs: CorpusHubRow[]
  sources: CorpusSourceRow[]
  licenceNotes: string[]
  registeredStudies: number
  /**
   * The line a record carries when the registers recorded no classification at all. A record that
   * has one states it in the supervision block instead, in ordinary words.
   */
  supervisionLine?: string

  /* ---- Phase 4 (docs/specs/phase4-generators.md §1 block order) --------------------------- */

  /** The controlled-substance trigger of §4: no dose, timing, route or combination text renders. */
  controlled: boolean
  /** Which registers fired that trigger, for the technical disclosure. */
  controlledBasis: string[]
  /** "Where it's registered": one line per jurisdiction, on every page including a Tier 3 stub. */
  registration: CorpusRegistrationLine[]
  /** The recorded controlled-substance schedule entries, in the instruments' own words. */
  controlledSchedules: CorpusControlledRow[]
  interactions: CorpusInteractions
  patent?: CorpusPatentLine
  /** Nearest approved neighbour, potency rank and activity timeline (§8). */
  computedSections: CorpusSectionSentence[]
  /**
   * The form-of, biosimilar-of or component-of note the page opens with (§6), and — where Phase 3
   * moved registry studies the parent's name matched — the sentence saying how many went where.
   */
  formOfNotes: CorpusSectionSentence[]
  /** §17(4): the relation notes that render only inside the relations block's closed control. */
  relationNotes: CorpusSectionSentence[]
}

/* --------------------------------------------------------- small helpers */

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function text(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.replace(/\s+/g, ' ').trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return undefined
}

const SYNONYM_KIND_LABELS: Record<string, string> = {
  inn: 'International name',
  usan: 'United States name',
  ban: 'British name',
  jan: 'Japanese name',
  brand: 'Trade name',
  salt: 'Salt form',
  code: 'Development code',
  fragment: 'Component',
  common: 'Also called',
  display: 'Also called',
}

const IDENTIFIER_LINKS: Record<string, (value: string) => string | undefined> = {
  unii: (v) => `https://precision.fda.gov/uniisearch/srs/unii/${encodeURIComponent(v)}`,
  chemblId: (v) => `https://www.ebi.ac.uk/chembl/compound_report_card/${encodeURIComponent(v)}/`,
  pubchemCid: (v) => `https://pubchem.ncbi.nlm.nih.gov/compound/${encodeURIComponent(v)}`,
  rxcui: (v) =>
    `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${encodeURIComponent(v)}`,
  cas: () => undefined,
  structureInchikey: () => undefined,
}

const RELATION_LABELS: Record<string, string> = {
  'ester-of': 'Ester of',
  'prodrug-of': 'Prodrug of',
  'stereoisomer-of': 'Stereoisomer of',
  'racemate-of': 'Racemate of',
  'biosimilar-of': 'Biosimilar of',
  contains: 'Contains',
  'isotopologue-of': 'Isotopologue of',
  'same-target': 'Same target as',
  'shares-enzyme': 'Shares an enzyme with',
}

/* --------------------------------------------------------- the assembly */

/** Rungs of the ladder that the record's own field says carry a finding. */
function ladderFrom(entry: FieldEntry | undefined): CorpusLadderRung[] {
  const found = new Map<string, string | undefined>()
  if (entry && entry.state === 'present') {
    const container = asRecord(entry.value)
    const raw = container ? (container.rungs ?? container.ladder) : entry.value
    for (const item of Array.isArray(raw) ? raw : []) {
      const row = asRecord(item)
      if (!row) continue
      const organism = text(row.rung ?? row.organism ?? row.species)
      if (!organism) continue
      const kind = text(row.evidenceKind ?? row.kind)
      const existing = found.get(organism.toLowerCase())
      found.set(organism.toLowerCase(), existing ?? kind)
    }
  }
  return ORGANISM_RUNGS.map((rung) => {
    const kind = found.get(rung.rung.toLowerCase())
    const filled = found.has(rung.rung.toLowerCase())
    return {
      rung: rung.rung,
      label: rung.label,
      filled,
      ...(filled && kind ? { kind } : {}),
    }
  })
}

/**
 * Every anchor string this page could carry, with the link and the dates behind it. The builder
 * appends the anchor to the paragraph as text; the template needs it back as an element, so the
 * candidates are rebuilt with the same exported `anchor()` function and matched by suffix.
 */
interface AnchorCandidate extends CorpusAnchor {
  length: number
}

function anchorCandidates(
  fieldRows: Array<typeof pageFields.$inferSelect>,
  sourceRows: Array<typeof pageSources.$inferSelect>,
  questions: QuestionBlock[],
): AnchorCandidate[] {
  const byText = new Map<string, AnchorCandidate>()
  const add = (ref: SourceRef, href?: string | null, lastVerified?: string | null): void => {
    const label = anchor(ref)
    if (!label) return
    const existing = byText.get(label)
    const candidate: AnchorCandidate = {
      text: label,
      length: label.length,
      ...(href ? { href } : existing?.href ? { href: existing.href } : {}),
      ...(ref.sourceDate ? { sourceDate: ref.sourceDate } : {}),
      ...(lastVerified
        ? { lastVerified }
        : existing?.lastVerified
          ? { lastVerified: existing.lastVerified }
          : {}),
    }
    byText.set(label, candidate)
  }
  for (const row of fieldRows) {
    if (row.state !== 'present') continue
    add(
      {
        ...(row.sourceKind ? { kind: row.sourceKind } : {}),
        ...(row.sourceId ? { id: row.sourceId } : {}),
        ...(row.sourceDate ? { sourceDate: row.sourceDate } : {}),
      },
      row.sourceUrl,
      row.lastVerified,
    )
  }
  for (const row of sourceRows) {
    add(
      {
        kind: row.sourceKind,
        id: row.sourceId,
        ...(row.sourceDate ? { sourceDate: row.sourceDate } : {}),
      },
      row.sourceUrl,
    )
  }
  for (const question of questions) {
    for (const source of question.sources) add(source, source.url ?? null)
  }
  return [...byText.values()].sort((a, b) => b.length - a.length)
}

/** Split the builder's trailing anchor back off the paragraph it was appended to. */
function splitAnchor(
  paragraph: string,
  candidates: AnchorCandidate[],
): { body: string; anchor?: CorpusAnchor } {
  for (const candidate of candidates) {
    if (paragraph === candidate.text) return { body: '', anchor: candidate }
    if (paragraph.endsWith(` ${candidate.text}`)) {
      const body = paragraph.slice(0, paragraph.length - candidate.text.length - 1).trimEnd()
      return { body, anchor: candidate }
    }
  }
  return { body: paragraph }
}

/**
 * At most one bold span per block, and only over a value the question itself carries (B6). A block
 * with no recorded value in its first paragraph gets none.
 */
function emphasisRange(
  paragraph: string,
  values: Record<string, string>,
): { start: number; end: number } | undefined {
  let best: { start: number; end: number } | undefined
  for (const value of Object.values(values)) {
    const needle = value.trim()
    if (needle.length < 2 || !/\d/.test(needle)) continue
    const start = paragraph.indexOf(needle)
    if (start < 0) continue
    if (!best || start < best.start) best = { start, end: start + needle.length }
  }
  return best
}

/**
 * Consecutive rows sharing a label become one headed group; a lone row keeps its inline label.
 *
 * The rule itself lives in `lib/corpus/page-text.ts` beside the body builders, because the corpus
 * renderer has to print the rows the same way: it printed the label on every row of a run where
 * the page prints it once, and the two texts disagreed on every disclosure holding a run.
 */
function groupRows(blockId: string, rows: RevealedRow[]): CorpusRowGroup[] {
  return groupRevealedRows(rows).map((group, index) => ({
    id: `${blockId}-g${index + 1}`,
    ...(group.label === undefined ? {} : { label: group.label }),
    rows: group.rows,
    ...(group.disclosed === true ? { disclosed: true as const } : {}),
  }))
}

/** The register named in the header line, and the date the record was last checked. */
function headerLine(
  fieldRows: Array<typeof pageFields.$inferSelect>,
  sourceRows: Array<typeof pageSources.$inferSelect>,
): { register: string; lastVerified?: string } {
  const counts = new Map<string, number>()
  for (const row of fieldRows) {
    if (row.state !== 'present' || !row.sourceKind) continue
    counts.set(row.sourceKind, (counts.get(row.sourceKind) ?? 0) + 1)
  }
  for (const row of sourceRows) counts.set(row.sourceKind, (counts.get(row.sourceKind) ?? 0) + 1)
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const named = ranked
    .map(([kind]) => registerName(kind))
    .filter((name): name is string => Boolean(name))
  let latest: string | undefined
  for (const row of fieldRows) {
    const date = row.lastVerified ?? undefined
    if (date && (!latest || date > latest)) latest = date
  }
  return {
    register: named.slice(0, 2).join(', '),
    ...(latest ? { lastVerified: latest } : {}),
  }
}

/**
 * The register events (§13(2)), as `registerEventLines` built them.
 *
 * The "What the registers record" block is retired: its dated rows printed the registers' own
 * column names ("drug_warning warningType Withdrawn") beside a status the registration block
 * already carried. The same recorded facts read as one sentence per event, inside the registration
 * block, and the sentences are built beside every other body builder so the measured text and the
 * painted page hold the same words in the same order.
 */
function registerEvents(fields: Record<string, FieldEntry>): CorpusRegisterEvent[] {
  return registerEventLines(fields).map((event) => ({ sentence: event.sentence }))
}

/* ------------------------------------------------------------- the load */

export async function loadCorpusDossier(slug: string): Promise<CorpusDossier | null> {
  const [page] = await db.select().from(corpusPages).where(eq(corpusPages.slug, slug)).limit(1)
  if (!page) return null
  const key = page.key

  const [
    synonymRows,
    fieldRows,
    seedRows,
    questionRows,
    relationRows,
    sourceRows,
    studyRows,
    registryAggregateRows,
    registrationRows,
    interactionRows,
    patentRows,
    controlledRows,
    sectionRows,
    displayNameRows,
    hubMemberships,
    roleAggregateRows,
  ] = await Promise.all([
    db.select().from(pageSynonyms).where(eq(pageSynonyms.key, key)),
    db.select().from(pageFields).where(eq(pageFields.key, key)),
    db.select().from(pageSeeds).where(eq(pageSeeds.key, key)),
    db.select().from(pageQuestions).where(eq(pageQuestions.key, key)),
    db.select().from(pageRelations).where(eq(pageRelations.key, key)),
    db.select().from(pageSources).where(eq(pageSources.key, key)),
    db
      .select({ nct: pageRegistryStudies.nct })
      .from(pageRegistryStudies)
      .where(eq(pageRegistryStudies.key, key)),
    db.select().from(pageRegistryAggregate).where(eq(pageRegistryAggregate.key, key)),
    db.select().from(pageRegistration).where(eq(pageRegistration.key, key)),
    db.select().from(pageInteractions).where(eq(pageInteractions.key, key)),
    db.select().from(pagePatent).where(eq(pagePatent.key, key)),
    db.select().from(pageControlled).where(eq(pageControlled.key, key)),
    db.select().from(pageSections).where(eq(pageSections.key, key)),
    db.select().from(pageDisplayNames).where(eq(pageDisplayNames.key, key)),
    // docs/specs/hubs.md §3, joining the fan-out that is already open rather than adding a round
    // trip. `lib/hubs/queries.ts` `hubsForPage` is this query.
    hubsForPage(key),
    // Dossier v3: the role-aware registry aggregate (lib/dossier-v3/trial-roles.ts), merged into
    // the registry bundle as `roleAware` so the shared builder's registered-study block reads the
    // classified counts where they exist and qualifies the old ones where they do not.
    db
      .select({ aggregate: pageRegistryRoleAggregates.aggregate })
      .from(pageRegistryRoleAggregates)
      .where(eq(pageRegistryRoleAggregates.key, key)),
  ])

  // The three names the computing stages give "the other page this sentence names", read in the
  // same order the section list below reads them. `neighbourPage` was missing here, so the nearest
  // approved compound was never fetched and the page could not name it where the measured text
  // did (§11).
  const sectionCounterpartKeys = sectionRows
    .map((row) =>
      text(
        asRecord(row.values)?.counterpartPage ??
          asRecord(row.values)?.neighbourPage ??
          asRecord(row.values)?.toKey,
      ),
    )
    .filter((value): value is string => value !== undefined)
  const targetKeys = [
    ...new Set([
      ...relationRows.map((row) => row.targetKey),
      ...interactionRows
        .map((row) => row.counterpartKey)
        .filter((value): value is string => value !== null),
      ...sectionCounterpartKeys,
    ]),
  ]
  const targets =
    targetKeys.length > 0
      ? await db
          .select({
            key: corpusPages.key,
            slug: corpusPages.slug,
            displayName: corpusPages.displayName,
          })
          .from(corpusPages)
          .where(inArray(corpusPages.key, targetKeys))
      : []
  const targetByKey = new Map(targets.map((row) => [row.key, row]))

  /*
   * §13(14): the page this record is held against, by slug. The loader wrote the slug rather than
   * the key because the hold is decided on the rendered pages, which the check reaches by slug.
   */
  const [duplicateHoldTarget] = page.duplicateHoldOf
    ? await db
        .select({ slug: corpusPages.slug, displayName: corpusPages.displayName })
        .from(corpusPages)
        .where(eq(corpusPages.slug, page.duplicateHoldOf))
        .limit(1)
    : []

  /*
   * The suppression evidence (migration 0033), read as the rows the load wrote: the class each row
   * answers, the source that stated it, that source's value and, for an ATC-based class, the
   * register's own name for the code. A page loaded before that column existed carries none, and
   * the supervision block then has no clause to write, which is the same outcome §15(1) gives a
   * class with no evidence.
   */
  const suppressionEvidence: SuppressionEvidence[] = Array.isArray(page.suppressionEvidence)
    ? (page.suppressionEvidence as unknown[]).filter(
        (row): row is SuppressionEvidence =>
          row !== null &&
          typeof row === 'object' &&
          typeof (row as SuppressionEvidence).test === 'string',
      )
    : []

  /* fields, in the shape the shared builders read */
  const fields: Record<string, FieldEntry> = {}
  for (const row of [...fieldRows].sort((a, b) => a.ordinal - b.ordinal)) {
    const existing = fields[row.field]
    if (existing && existing.state === 'present') continue
    const source: SourceRef = {
      ...(row.sourceKind ? { kind: row.sourceKind } : {}),
      ...(row.sourceId ? { id: row.sourceId } : {}),
      ...(row.sourceUrl ? { url: row.sourceUrl } : {}),
      ...(row.sourceDate ? { sourceDate: row.sourceDate } : {}),
    }
    fields[row.field] = {
      state: row.state,
      ...(row.value !== null ? { value: row.value } : {}),
      ...(Object.keys(source).length > 0 ? { source } : {}),
      ...(row.sourceDate ? { sourceDate: row.sourceDate } : {}),
    }
  }

  /* seeds, keyed the way the derivation and the builders key them */
  const seeds: PageBundle['seeds'] = {}
  for (const row of seedRows) {
    const values = asRecord(row.values) ?? {}
    // §11: the slots are their own recorded object (migration 0029). Reading `values` in their
    // place gave the derivation a slot map it does not recognise, so a seed-driven question was
    // not re-derived here at all, and the page then wrote "this target" where the measured text
    // named the target.
    const slots = asRecord(row.slots) ?? values
    seeds[`seed${row.seed}`] = { fires: true, values, slots }
  }

  const registeredStudies = studyRows.length
  const bundle: PageBundle = {
    key,
    displayName: page.displayName,
    model: page.model,
    tier: page.tier as 1 | 2 | 3,
    withdrawn: page.withdrawn,
    suppressed: page.suppressed,
    suppressionClasses: page.suppressionClasses,
    suppressionEvidence,
    stub: page.pageType === 'stub',
    presentFields: page.presentFieldCount,
    fields,
    seeds,
    identity: {
      displayName: page.displayName,
      synonyms: synonymRows.map((row) => ({ name: row.name, kind: row.kind })),
      relations: relationRows.map((row) => ({ type: row.relation, targetKey: row.targetKey })),
      unii: page.unii,
      chemblId: page.chemblId,
      cid: page.pubchemCid,
      cas: page.cas,
      rxcui: page.rxcui,
    },
    /*
     * The registry aggregate, as the load stored it (migration 0027; §11). The body builders read
     * the phases, the enrolments, the durations and the per-trial rows out of it, and a page given
     * only a study count wrote a shorter paragraph than the page the ruler measures. Where no
     * aggregate is on file the count is still passed, so a page loaded before migration 0027 says
     * less rather than saying something else.
     */
    ...(asRecord(registryAggregateRows[0]?.aggregate)
      ? {
          registry: {
            ...(asRecord(registryAggregateRows[0]?.aggregate) as Record<string, unknown>),
            ...(asRecord(roleAggregateRows[0]?.aggregate)
              ? { roleAware: asRecord(roleAggregateRows[0]?.aggregate) }
              : {}),
          },
        }
      : registeredStudies > 0
        ? {
            registry: {
              studies: registeredStudies,
              ...(asRecord(roleAggregateRows[0]?.aggregate)
                ? { roleAware: asRecord(roleAggregateRows[0]?.aggregate) }
                : {}),
            },
          }
        : {}),
    questions: [],
    names: new Map(targets.map((row) => [row.key, row.displayName])),
  }

  /* The published question list decides the blocks; the derivation supplies the slot values. */
  const derived = deriveQuestions({
    key,
    displayName: page.displayName,
    model: page.model,
    suppressed: page.suppressed,
    fields,
    seeds,
    tier: page.tier,
  })
  const derivedByTemplate = new Map(derived.map((question) => [question.template, question]))
  const derivedByBlock = new Map(derived.map((question) => [question.block, question]))

  const ordered = [...questionRows].sort((a, b) => a.ordinal - b.ordinal)
  const questions: QuestionBlock[] = ordered.map((row, index) => {
    const match = derivedByTemplate.get(row.template) ?? derivedByBlock.get(row.block)
    /*
     * §11: the slot values and the sources the derivation produced when this page was loaded
     * (migration 0030). They are what the corpus renderer wrote its sentences from, so the page
     * writes its sentences from them too, and the second derivation above is the fallback for a
     * page loaded before those columns existed.
     */
    const storedValues = asRecord(row.values)
    const storedQuestionSources: SourceRef[] = (Array.isArray(row.sources) ? row.sources : [])
      .map((item) => asRecord(item))
      .filter((item): item is Record<string, unknown> => item !== undefined)
      .map((item) => ({
        ...(text(item.kind) ? { kind: text(item.kind) } : {}),
        ...(text(item.id) ? { id: text(item.id) } : {}),
        ...(text(item.url) ? { url: text(item.url) } : {}),
        ...(text(item.sourceDate) ? { sourceDate: text(item.sourceDate) } : {}),
      }))
    const storedAnchors = Array.isArray(row.anchors) ? row.anchors : []
    const storedSources: SourceRef[] = storedAnchors
      .map((item) => asRecord(item))
      .filter((item): item is Record<string, unknown> => item !== undefined)
      .map((item) => ({
        ...(text(item.source_kind ?? item.kind)
          ? { kind: text(item.source_kind ?? item.kind) }
          : {}),
        ...(text(item.source_id ?? item.id) ? { id: text(item.source_id ?? item.id) } : {}),
        ...(text(item.source_date ?? item.sourceDate)
          ? { sourceDate: text(item.source_date ?? item.sourceDate) }
          : {}),
      }))
    return {
      id: `${row.block}-${row.ordinal}`,
      text: row.text,
      badge: `Q${index + 1}`,
      block: row.block,
      template: row.template,
      values:
        storedValues && Object.keys(storedValues).length > 0
          ? (storedValues as Record<string, string>)
          : (match?.values ?? {}),
      sources:
        storedQuestionSources.length > 0
          ? storedQuestionSources
          : (match?.sources ?? storedSources),
    }
  })
  bundle.questions = questions

  const candidates = anchorCandidates(fieldRows, sourceRows, questions)

  /*
   * Operating Rule 9 and §4, applied to what the page paints, line by line.
   *
   * The loader withholds the four dose-bearing blocks from a controlled record, and the corpus
   * renderer drops any remaining line that carries a dose, a timing, a route, a frequency or a
   * combination protocol — a registry trial title reading "320 mg/d" is dosing text on the page
   * whoever wrote it. The page must drop the same lines: §11 makes the render and the page one
   * text, and until this was here the page painted dose sentences the render had withheld.
   */
  const withholdsDoseText = page.controlled
  const keeps = (text: string): boolean => !withholdsDoseText || !carriesDoseText(text)

  const blocks: CorpusBlock[] = questions
    .map((question, index) => {
      const body = buildBlockBody(question, bundle)
      const paragraphs: CorpusParagraph[] = body.paragraphs
        // The furniture and list flags are parallel to `body.paragraphs`, so the dose filter below
        // is applied with them carried beside the text rather than by index into a filtered list.
        .map((raw, index) => ({
          raw,
          furniture: body.furniture[index] === true,
          listItem: body.list[index] === true,
        }))
        .filter((entry) => keeps(entry.raw))
        .map(({ raw, furniture, listItem }, position) => {
          const { body: withoutAnchor, anchor: found } = splitAnchor(raw.trim(), candidates)
          if (withoutAnchor.length === 0) return undefined
          const emphasis =
            position === 0 ? emphasisRange(withoutAnchor, question.values) : undefined
          // B5: an unanchored paragraph is marked rather than given a manufactured citation — but
          // only where it states no recorded value. The builder's second paragraph usually carries
          // this record's own counts, durations and registry wording with no anchor of its own;
          // calling those an interpretation would be a second untruth in place of the first.
          //
          // §16(1): a list item is never marked. A supervision clause names the register that
          // stated the class inside its own sentence — "(WHO ATC via ChEMBL/EMA)" — so it is a
          // sourced statement of a recorded fact, and calling the second, third and fourth clause
          // of an enumeration an interpretation would label a citation as an inference.
          const paragraph: CorpusParagraph = {
            text: withoutAnchor,
            interpretation: !listItem && position > 0 && !found && !/\d/.test(withoutAnchor),
            ...(found ? { anchor: found } : {}),
            ...(emphasis ? { emphasis } : {}),
            ...(furniture ? { furniture: true as const } : {}),
            ...(listItem ? { listItem: true as const } : {}),
          }
          return paragraph
        })
        .filter((paragraph): paragraph is CorpusParagraph => paragraph !== undefined)
      const blockId = `q${index + 1}`
      const dates = paragraphs
        .map((paragraph) => paragraph.anchor)
        .filter((item): item is CorpusAnchor => item !== undefined)
      const sourceDate = dates.map((item) => item.sourceDate).find((value) => Boolean(value))
      const lastVerified = dates.map((item) => item.lastVerified).find((value) => Boolean(value))
      return {
        id: blockId,
        badge: `Q${index + 1}`,
        ordinal: index,
        block: question.block,
        template: question.template,
        question: question.text,
        paragraphs,
        facts: body.facts.filter((row) =>
          keeps(`${row.label} ${row.identifier ?? ''} ${row.value}`),
        ),
        groups: groupRows(
          blockId,
          body.rows.filter((row) => keeps(`${row.label} ${row.identifier ?? ''} ${row.value}`)),
        ),
        ...(sourceDate ? { sourceDate } : {}),
        ...(lastVerified ? { lastVerified } : {}),
      }
    })
    /*
     * §1: "a block never renders a heading over an empty body", and §11 makes the render and the
     * page one text. `renderPage` drops a block whose builder wrote no paragraph and no row — §7
     * stops a dose-response section whose quotations name a different compound, and that leaves
     * the block empty — so the page has to drop the same block. Until this was here the page
     * painted the question and nothing under it, and the parity check read the heading as text the
     * render had not written.
     */
    .filter(
      (block) => block.paragraphs.length > 0 || block.facts.length > 0 || block.groups.length > 0,
    )

  /* header */
  const { register, lastVerified } = headerLine(fieldRows, sourceRows)
  const synonymGroups = new Map<string, CorpusSynonymGroup>()
  for (const row of synonymRows) {
    if (row.name.toLowerCase() === page.displayName.toLowerCase()) continue
    const group = synonymGroups.get(row.kind) ?? {
      kind: row.kind,
      label: SYNONYM_KIND_LABELS[row.kind] ?? 'Also called',
      names: [],
    }
    if (!group.names.includes(row.name) && group.names.length < 12) group.names.push(row.name)
    synonymGroups.set(row.kind, group)
  }

  const ladder = ladderFrom(fields.organismLadder ?? fields.ladder ?? fields.field2)
  const topFilled = [...ladder].reverse().find((rung) => rung.filled)

  // The badge triplet comes from the loader's own columns (migration 0025), which carry it for
  // every model: a CLINICAL or DEVELOPMENT record has no organism ladder, but a registry study
  // still says a human took the compound. The ladder below is the fallback for a page loaded
  // before those columns existed, and never contradicts them.
  const columnRung =
    ORGANISM_RUNGS.find((rung) => rung.rung === page.topRung)?.label ?? page.topRung
  const headerTopRung = columnRung ?? topFilled?.label ?? undefined
  const headerHumanData =
    page.humanData ?? ladder.some((rung) => rung.rung === 'human' && rung.filled)

  const identifiers: CorpusIdentifierRow[] = []
  for (const [field, label, value] of [
    ['unii', 'UNII', page.unii],
    ['chemblId', 'ChEMBL id', page.chemblId],
    ['pubchemCid', 'PubChem CID', page.pubchemCid],
    ['cas', 'CAS number', page.cas],
    ['rxcui', 'RxCUI', page.rxcui],
    ['structureInchikey', 'InChIKey', page.structureInchikey],
  ] as Array<[string, string, string | null]>) {
    if (!value) continue
    const href = IDENTIFIER_LINKS[field]?.(value)
    identifiers.push({ field, label, value, ...(href ? { href } : {}) })
  }

  // docs/specs/hubs.md §3: rows, never sentences, so the hub names are markup and no member of a
  // hub gains the same word as every other member.
  const hubRows: CorpusHubRow[] = hubMemberships.map((row) => ({
    label: HUB_TYPE_LABEL[row.type],
    name: row.name,
    path: `/h/${row.type}/${encodeURIComponent(row.slug)}`,
  }))

  const relations: CorpusRelationRow[] = []
  for (const row of relationRows) {
    const target = targetByKey.get(row.targetKey)
    if (!target || relations.length >= 20) continue
    relations.push({
      label: RELATION_LABELS[row.relation] ?? row.relation.replace(/-/g, ' '),
      /*
       * §17(3): the counterpart's disambiguated name where the loader stored one. Two pages both
       * printing "Suprofen" made "Stereoisomer of Suprofen" a row that named neither of them;
       * the stored label names the record the link goes to.
       */
      name: text(row.label) ?? target.displayName,
      slug: target.slug,
    })
  }

  const sources: CorpusSourceRow[] = [...sourceRows]
    .sort(
      (a, b) => a.sourceKind.localeCompare(b.sourceKind) || a.sourceId.localeCompare(b.sourceId),
    )
    .map((row) => ({
      kind: row.sourceKind,
      register: registerName(row.sourceKind) ?? row.sourceKind,
      id: row.sourceId,
      ...(row.sourceUrl ? { href: row.sourceUrl } : {}),
      ...(row.sourceDate ? { sourceDate: row.sourceDate } : {}),
      ...(row.title ? { title: row.title } : {}),
      ...(row.licence ? { licence: row.licence } : {}),
    }))

  /*
   * The supervision block, on every suppressed record that has a classification to state.
   *
   * A record with question rows already carries it: the derivation puts the supervision question
   * first and the loop above built it like any other block. A record below the stub floor has no
   * question rows at all, and until this was fixed its classification fell through to the stub's
   * own line, which printed the stored class ids. The block is built here instead, from the same
   * recorded classes, in the words docs/specs/suppression-classes.md fixes.
   *
   * An S10-only record is not given a block. S10 is the class the suppression pass assigns when it
   * could read no classification, so there is nothing for the block to state; that record keeps the
   * single line saying exactly that.
   */
  const stubSupervision =
    page.suppressed && blocks.length === 0
      ? supervisionBlock(
          page.displayName,
          page.suppressionClasses,
          suppressionEvidence,
          supervisionContext(fields.boxedWarning, fields.indication),
        )
      : undefined
  if (stubSupervision) blocks.push(stubSupervision)

  // The stub line survives only for the record that has no classification to name.
  const supervisionLine =
    page.suppressed &&
    stubSupervision === undefined &&
    isUnknownClassOnly(page.suppressionClasses) &&
    blocks.length === 0
      ? unknownClassificationLine()
      : undefined

  /* ---- Phase 4 blocks -------------------------------------------------------------------- */

  const registration: CorpusRegistrationLine[] = [...registrationRows]
    // Rule 9 on a controlled record, line by line, exactly as the corpus renderer applies it.
    .filter((row) => keeps(`${row.component ?? ''} ${row.label} ${row.line}`))
    .sort(
      (a, b) =>
        a.ordinal - b.ordinal ||
        (a.component ?? '').localeCompare(b.component ?? '') ||
        a.label.localeCompare(b.label),
    )
    .map((row) => ({
      id: row.id,
      jurisdiction: row.jurisdiction,
      label: row.label,
      status: row.status,
      ...(row.detail ? { detail: row.detail } : {}),
      ...(row.source ? { source: row.source } : {}),
      ...(row.dateChecked ? { dateChecked: row.dateChecked } : {}),
      ordinal: row.ordinal,
      ...(row.component ? { component: row.component } : {}),
      line: row.line,
      ...(row.absence ? { absence: row.absence } : {}),
      // §13(6): a curated record filed under "unspecified" is technical provenance, not a register
      // line, and the same is true of the upstream files NCATS stitched to build it.
      disclosed: row.disclosed,
      upstreamRegisters: Array.isArray(asRecord(row.disclosure)?.upstreamRegisters)
        ? ((asRecord(row.disclosure)?.upstreamRegisters as unknown[])
            .map((item) => text(item))
            .filter((item): item is string => item !== undefined) as string[])
        : [],
      applications: Array.isArray(asRecord(row.disclosure)?.applications)
        ? ((asRecord(row.disclosure)?.applications as unknown[])
            .map((item) => text(item))
            .filter((item): item is string => item !== undefined) as string[])
        : [],
    }))

  const interactionRowsOnly = interactionRows.filter((row) => row.kind === 'interaction')
  const checkedRow = interactionRows.find((row) => row.kind === 'sources-checked')
  const tierOrder: Record<string, number> = { A: 0, B: 1, C: 2 }
  const interactionLines: CorpusInteractionLine[] = [...interactionRowsOnly]
    .sort(
      (a, b) =>
        (tierOrder[a.tier ?? 'C'] ?? 3) - (tierOrder[b.tier ?? 'C'] ?? 3) || a.ordinal - b.ordinal,
    )
    .map((row) => {
      const tier = (row.tier ?? 'C') as 'A' | 'B' | 'C'
      const target = row.counterpartKey ? targetByKey.get(row.counterpartKey) : undefined
      const counterpartName = row.counterpartName ?? target?.displayName
      /*
       * §14(5), §14(6): a grouped label-documented line names several counterparts, so the loader
       * stored no counterpart against it and its direction is the group's direction class. That
       * is what its disclosure row is labelled with, and the record ids behind it come from the
       * build's own provenance map — the same two values `renderPage` reads, through the same two
       * functions, so the render and the painted page carry one row.
       */
      const grouped = counterpartName === undefined && tier === 'A' ? row.direction : null
      return {
        id: row.id,
        tier,
        tierLabel: INTERACTION_TIER_LABELS[tier] as string,
        line: row.line,
        ...(target ? { counterpartSlug: target.slug } : {}),
        ...(counterpartName ? { counterpartName } : {}),
        disclosed: row.disclosed,
        ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}),
        ...(row.ruleId ? { ruleId: row.ruleId } : {}),
        ...(row.setId ? { setId: row.setId } : {}),
        ...(row.sourceRecordId ? { sourceRecordId: row.sourceRecordId } : {}),
        ...(grouped ? { groupedDirection: grouped } : {}),
        recordIds: interactionRecordIds({
          ...(row.ruleId ? { ruleId: row.ruleId } : {}),
          ...(row.setId ? { setId: row.setId } : {}),
          ...(row.sourceRecordId ? { sourceRecordId: row.sourceRecordId } : {}),
          ...(asRecord(row.provenance) ? { provenance: asRecord(row.provenance) } : {}),
        }),
      }
    })
  const interactionTotals: CorpusInteractions['totals'] = {}
  for (const row of interactionRowsOnly) {
    const tier = (row.tier ?? 'C') as 'A' | 'B' | 'C'
    if (row.totalInTier !== null) interactionTotals[tier] = row.totalInTier
  }
  const checkedSourcesRecorded = Array.isArray(checkedRow?.sourcesChecked)
    ? (checkedRow.sourcesChecked as unknown[])
        .map((item) => text(item))
        .filter((item): item is string => item !== undefined)
    : []
  const interactions: CorpusInteractions = {
    lines: interactionLines.filter((line) => keeps(line.line)),
    ...(checkedRow?.line ? { statement: checkedRow.line } : {}),
    sourcesChecked: checkedSourceNames(
      checkedSourcesRecorded.length > 0
        ? { sourcesChecked: checkedSourcesRecorded, date: checkedRow?.sourceDate ?? '' }
        : undefined,
    ),
    ...(checkedRow?.sourceDate ? { date: checkedRow.sourceDate } : {}),
    totals: interactionTotals,
    predictedOnly:
      interactionLines.length > 0 && interactionLines.every((line) => line.tier === 'C'),
  }
  // The statement the loader stored is the one the measured text carries; rebuilding it here would
  // be a second implementation. It is only recomputed where the stored row predates the rule.
  if (interactions.statement === undefined && checkedSourcesRecorded.length > 0) {
    const rebuilt = checkedSourcesStatement(
      { sourcesChecked: checkedSourcesRecorded, date: checkedRow?.sourceDate ?? '' },
      interactionLines.length > 0,
    )
    if (rebuilt) interactions.statement = rebuilt
  }

  const patentRow = patentRows[0] && keeps(patentRows[0].line) ? patentRows[0] : undefined
  const patent: CorpusPatentLine | undefined = patentRow
    ? {
        eligible: patentRow.eligible,
        line: patentRow.line,
        absence: patentRow.absence,
        ...(patentRow.register ? { register: patentRow.register } : {}),
        ...(patentRow.reason ? { reason: patentRow.reason } : {}),
        ...(patentRow.source ? { source: patentRow.source } : {}),
        ...(patentRow.dateChecked ? { dateChecked: patentRow.dateChecked } : {}),
        applications: Array.isArray(asRecord(patentRow.disclosure)?.applications)
          ? ((asRecord(patentRow.disclosure)?.applications as unknown[])
              .map((item) => text(item))
              .filter((item): item is string => item !== undefined) as string[])
          : [],
      }
    : undefined

  const controlledSchedules: CorpusControlledRow[] = [...controlledRows]
    .filter((row) => keeps(`${row.classOrSchedule} ${row.list} ${row.substanceAsListed ?? ''}`))
    /*
     * A total order (§11): `page_controlled` has no order of its own, and jurisdiction, list and
     * schedule do not separate every row — levonorgestrel carries two Poisons List rows under one
     * schedule, differing only in the name the register listed. `scripts/corpus-20k/render/
     * page-text.ts` sorts on the same five values, so the page and the render paint one order.
     */
    .sort(
      (a, b) =>
        a.jurisdiction.localeCompare(b.jurisdiction) ||
        a.list.localeCompare(b.list) ||
        a.classOrSchedule.localeCompare(b.classOrSchedule) ||
        (a.substanceAsListed ?? '').localeCompare(b.substanceAsListed ?? '') ||
        (a.versionDate ?? '').localeCompare(b.versionDate ?? ''),
    )
    .map((row) => ({
      id: row.id,
      jurisdiction: row.jurisdiction,
      list: row.list,
      classOrSchedule: row.classOrSchedule,
      ...(row.substanceAsListed ? { substanceAsListed: row.substanceAsListed } : {}),
      ...(row.statute ? { statute: row.statute } : {}),
      ...(row.statuteUrl ? { statuteUrl: row.statuteUrl } : {}),
      ...(row.versionDate ? { versionDate: row.versionDate } : {}),
      ...(row.source ? { source: row.source } : {}),
    }))

  const SECTION_ORDER: Record<string, number> = {
    neighbour: 0,
    potency: 1,
    timeline: 2,
    formOf: 3,
    relationNote: 4,
  }
  const sections: CorpusSectionSentence[] = [...sectionRows]
    .sort(
      (a, b) =>
        (SECTION_ORDER[a.section] ?? 9) - (SECTION_ORDER[b.section] ?? 9) || a.ordinal - b.ordinal,
    )
    .filter((row) => keeps(row.sentence))
    .map((row) => {
      const values = asRecord(row.values) ?? {}
      const counterpartKey = text(values.counterpartPage ?? values.neighbourPage ?? values.toKey)
      const target = counterpartKey ? targetByKey.get(counterpartKey) : undefined
      /*
       * §13(7) and §13(8): a section whose sentence stated one comparison of stored values is
       * rendered as those values, in rows. `sectionSentenceParts` decides which of them keep a
       * sentence, and the corpus renderer calls the same function, so the page and the measured
       * text carry the same rows and the same prose.
       */
      const parts =
        row.section === 'formOf' || row.section === 'relationNote'
          ? { rows: [] as RevealedRow[], sentence: row.sentence }
          : sectionSentenceParts({
              values,
              provenance: asRecord(row.provenance) ?? {},
              ...(row.templateId ? { templateId: row.templateId } : {}),
            })
      return {
        section: row.section as CorpusSectionSentence['section'],
        ordinal: row.ordinal,
        rows: parts.rows.filter((item) => keeps(`${item.label} ${item.value}`)),
        ...(parts.sentence && keeps(parts.sentence) ? { sentence: parts.sentence } : {}),
        ...(target ? { counterpartSlug: target.slug, counterpartName: target.displayName } : {}),
      }
    })
    .filter((row) => row.rows.length > 0 || row.sentence !== undefined)
  const formOfNotes = sections.filter((row) => row.section === 'formOf')
  /*
   * §17(4): a relation the identity stage could not confirm says so inside the relations block's
   * closed control, and nowhere else. It is not a form-of note — it states that the corpus cannot
   * say what this record is a form of — and it is not a computed section, so it is filtered out of
   * both here rather than left to a component to recognise.
   */
  const relationNotes = sections.filter((row) => row.section === 'relationNote')
  const computedSections = sections.filter(
    (row) => row.section !== 'formOf' && row.section !== 'relationNote',
  )

  return {
    key,
    slug: page.slug,
    displayName: displayNameRows[0]?.displayName ?? page.displayName,
    model: page.model,
    tier: page.tier,
    pageType: page.pageType,
    indexable: page.indexable,
    ...(duplicateHoldTarget ? { duplicateHoldOf: duplicateHoldTarget } : {}),
    suppressed: page.suppressed,
    suppressionClasses: page.suppressionClasses,
    suppressionEvidence,
    withdrawn: page.withdrawn,
    presentFieldCount: page.presentFieldCount,
    applicableFieldCount: page.applicableFieldCount,
    synonyms: [...synonymGroups.values()],
    register,
    ...(lastVerified ? { lastVerified } : {}),
    ...(headerTopRung ? { topRung: headerTopRung } : {}),
    humanData: headerHumanData,
    ...(page.evidenceTier ? { evidenceTier: page.evidenceTier } : {}),
    ladder,
    blocks,
    registerEvents: registerEvents(fields).filter((event) => keeps(event.sentence)),
    identifiers,
    relations,
    hubs: hubRows,
    sources,
    licenceNotes: page.licenceNotes,
    registeredStudies,
    ...(supervisionLine ? { supervisionLine } : {}),
    controlled: page.controlled,
    controlledBasis: page.controlledBasis,
    registration,
    controlledSchedules,
    interactions,
    ...(patent ? { patent } : {}),
    computedSections,
    formOfNotes,
    relationNotes,
  }
}

/**
 * The metadata description: the first question's first paragraph, cut at a sentence boundary.
 * A page with no question (a stub) describes itself with what it actually holds.
 */
export function corpusMetaDescription(dossier: CorpusDossier, limit = 200): string | undefined {
  const first = dossier.blocks[0]?.paragraphs[0]?.text
  if (!first) return undefined
  if (first.length <= limit) return first
  const cut = first.slice(0, limit)
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '))
  if (stop > 60) return cut.slice(0, stop + 1)
  const space = cut.lastIndexOf(' ')
  return `${space > 60 ? cut.slice(0, space) : cut}…`
}
