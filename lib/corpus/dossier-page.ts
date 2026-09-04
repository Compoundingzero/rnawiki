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
  pageFields,
  pageQuestions,
  pageRegistryStudies,
  pageRelations,
  pageSeeds,
  pageSources,
  pageSynonyms,
} from '@/db/schema'
import {
  anchor,
  buildBlockBody,
  deriveQuestions,
  registerName,
  type FieldEntry,
  type PageBundle,
  type QuestionBlock,
  type RevealedRow,
  type SourceRef,
} from '@/lib/corpus/page-text'
import { ORGANISM_RUNGS } from '@/lib/corpus/organism-ladder'

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
}

/** Consecutive revealed rows that share a label are one group; the label becomes its heading. */
export interface CorpusRowGroup {
  id: string
  label?: string
  rows: RevealedRow[]
}

export interface CorpusBlock {
  id: string
  badge: string
  ordinal: number
  block: string
  template: string
  question: string
  paragraphs: CorpusParagraph[]
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

export interface CorpusSourceRow {
  kind: string
  register: string
  id: string
  href?: string
  sourceDate?: string
  title?: string
  licence?: string
}

export interface CorpusArcRow {
  date?: string
  label: string
  value: string
  anchor?: CorpusAnchor
}

export interface CorpusSynonymGroup {
  kind: string
  label: string
  names: string[]
}

export interface CorpusDossier {
  key: string
  slug: string
  displayName: string
  model: string
  tier: number
  pageType: 'longevity' | 'clinical' | 'withdrawn' | 'development' | 'stub'
  indexable: boolean
  suppressed: boolean
  suppressionClasses: string[]
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
  arc: CorpusArcRow[]
  identifiers: CorpusIdentifierRow[]
  relations: CorpusRelationRow[]
  sources: CorpusSourceRow[]
  licenceNotes: string[]
  registeredStudies: number
  /** The stub's supervision line, from the recorded classification only. */
  supervisionLine?: string
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

/** Consecutive rows sharing a label become one headed group; a lone row keeps its inline label. */
function groupRows(blockId: string, rows: RevealedRow[]): CorpusRowGroup[] {
  const groups: CorpusRowGroup[] = []
  let index = 0
  while (index < rows.length) {
    const current = rows[index]
    if (!current) break
    let end = index + 1
    while (end < rows.length && rows[end]?.label === current.label) end += 1
    const run = rows.slice(index, end)
    if (run.length > 1) {
      groups.push({
        id: `${blockId}-g${groups.length + 1}`,
        label: current.label,
        rows: run,
      })
    } else {
      const previous = groups[groups.length - 1]
      if (previous && previous.label === undefined) previous.rows.push(...run)
      else groups.push({ id: `${blockId}-g${groups.length + 1}`, rows: run })
    }
    index = end
  }
  return groups
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
 * The withdrawn arc (R11): the dated register rows that record what happened, each carrying the
 * register that states it. Nothing is narrated — a row exists only where a register wrote one.
 */
function withdrawnArc(
  fields: Record<string, FieldEntry>,
  candidates: AnchorCandidate[],
): CorpusArcRow[] {
  const rows: CorpusArcRow[] = []
  const seen = new Set<string>()
  const push = (row: CorpusArcRow): void => {
    const id = `${row.date ?? ''}|${row.label}|${row.value}`
    if (seen.has(id)) return
    seen.add(id)
    rows.push(row)
  }
  const anchorFor = (kind?: string, id?: string, date?: string): CorpusAnchor | undefined => {
    const label = anchor({
      ...(kind ? { kind } : {}),
      ...(id ? { id } : {}),
      ...(date ? { sourceDate: date } : {}),
    })
    if (!label) return undefined
    return candidates.find((candidate) => candidate.text === label) ?? { text: label }
  }

  const approval = fields.approvalDate ?? fields.firstApproval
  if (approval && approval.state === 'present') {
    const value = asRecord(approval.value)
    const date = text(value?.date ?? value?.year ?? approval.value)
    const register = text(value?.register ?? value?.source)
    if (date && register) {
      const source = Array.isArray(approval.source) ? approval.source[0] : approval.source
      const row: CorpusArcRow = { date, label: 'First approval', value: register }
      const found = anchorFor(source?.kind, source?.id, source?.sourceDate ?? approval.sourceDate)
      if (found) row.anchor = found
      push(row)
    }
  }

  const withdrawal = fields.withdrawal ?? fields.withdrawalStatus ?? fields.withdrawn
  if (withdrawal && withdrawal.state === 'present') {
    const value = asRecord(withdrawal.value)
    const evidence = Array.isArray(value?.evidence) ? value.evidence : []
    for (const item of evidence.slice(0, 12)) {
      const row = asRecord(item)
      if (!row) continue
      const statement = text(row.statement ?? row.statusVerbatim)
      if (!statement) continue
      const source = text(row.source ?? row.register)
      const date = text(row.sourceDate ?? row.date)
      const entry: CorpusArcRow = {
        ...(date ? { date } : {}),
        label: source ?? 'Register record',
        value: statement,
      }
      const found = anchorFor(source, text(row.id), date)
      if (found) entry.anchor = found
      push(entry)
    }
  }

  const regulatory = fields.regulatory ?? fields.regulatoryStatus
  if (regulatory && regulatory.state === 'present') {
    const value = asRecord(regulatory.value)
    for (const [jurisdiction, raw] of Object.entries(value ?? {})) {
      const record = asRecord(raw)
      const status = text(record?.status)
      if (!status || status === 'unknown') continue
      const evidence = [
        ...(Array.isArray(record?.evidence) ? record.evidence : []),
        ...(Array.isArray(record?.records) ? record.records : []),
      ]
      for (const item of evidence.slice(0, 4)) {
        const row = asRecord(item)
        if (!row) continue
        const verbatim = text(row.statusVerbatim ?? row.statement)
        if (!verbatim) continue
        const date = text(row.sourceDate)
        const register = text(row.register ?? row.source)
        const entry: CorpusArcRow = {
          ...(date ? { date } : {}),
          label: `${jurisdiction}${register ? ` · ${register}` : ''}`,
          value: verbatim,
        }
        const found = anchorFor(register, text(row.recordId ?? row.id), date)
        if (found) entry.anchor = found
        push(entry)
      }
    }
  }

  return rows
    .sort((a, b) => {
      if (a.date && b.date) return a.date.localeCompare(b.date)
      if (a.date) return -1
      if (b.date) return 1
      return 0
    })
    .slice(0, 16)
}

/* ------------------------------------------------------------- the load */

export async function loadCorpusDossier(slug: string): Promise<CorpusDossier | null> {
  const [page] = await db.select().from(corpusPages).where(eq(corpusPages.slug, slug)).limit(1)
  if (!page) return null
  const key = page.key

  const [synonymRows, fieldRows, seedRows, questionRows, relationRows, sourceRows, studyRows] =
    await Promise.all([
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
    ])

  const targetKeys = [...new Set(relationRows.map((row) => row.targetKey))]
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
    seeds[`seed${row.seed}`] = { fires: true, values, slots: values }
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
    ...(registeredStudies > 0 ? { registry: { studies: registeredStudies } } : {}),
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
      values: match?.values ?? {},
      sources: match?.sources ?? storedSources,
    }
  })
  bundle.questions = questions

  const candidates = anchorCandidates(fieldRows, sourceRows, questions)

  const blocks: CorpusBlock[] = questions.map((question, index) => {
    const body = buildBlockBody(question, bundle)
    const paragraphs: CorpusParagraph[] = body.paragraphs
      .map((raw, position) => {
        const { body: withoutAnchor, anchor: found } = splitAnchor(raw.trim(), candidates)
        if (withoutAnchor.length === 0) return undefined
        const emphasis = position === 0 ? emphasisRange(withoutAnchor, question.values) : undefined
        // B5: an unanchored paragraph is marked rather than given a manufactured citation — but
        // only where it states no recorded value. The builder's second paragraph usually carries
        // this record's own counts, durations and registry wording with no anchor of its own;
        // calling those an interpretation would be a second untruth in place of the first.
        const paragraph: CorpusParagraph = {
          text: withoutAnchor,
          interpretation: position > 0 && !found && !/\d/.test(withoutAnchor),
          ...(found ? { anchor: found } : {}),
          ...(emphasis ? { emphasis } : {}),
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
      groups: groupRows(blockId, body.rows),
      ...(sourceDate ? { sourceDate } : {}),
      ...(lastVerified ? { lastVerified } : {}),
    }
  })

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

  const relations: CorpusRelationRow[] = []
  for (const row of relationRows) {
    const target = targetByKey.get(row.targetKey)
    if (!target || relations.length >= 20) continue
    relations.push({
      label: RELATION_LABELS[row.relation] ?? row.relation.replace(/-/g, ' '),
      name: target.displayName,
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

  const cited = page.suppressionClasses.filter((code) => /^S[1-9]$/.test(code))
  const supervisionLine =
    cited.length > 0
      ? `Regulator classification recorded: ${cited.join(', ')}`
      : page.suppressionClasses.length > 0 &&
          page.suppressionClasses.every((code) => code === 'S10')
        ? 'No regulator classification is recorded for this compound'
        : undefined

  return {
    key,
    slug: page.slug,
    displayName: page.displayName,
    model: page.model,
    tier: page.tier,
    pageType: page.pageType,
    indexable: page.indexable,
    suppressed: page.suppressed,
    suppressionClasses: page.suppressionClasses,
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
    arc: page.withdrawn ? withdrawnArc(fields, candidates) : [],
    identifiers,
    relations,
    sources,
    licenceNotes: page.licenceNotes,
    registeredStudies,
    ...(supervisionLine ? { supervisionLine } : {}),
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
