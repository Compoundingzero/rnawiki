import { and, asc, eq, inArray } from 'drizzle-orm'

import { db } from '@/db'
import { corpusPages, pageFields } from '@/db/schema'

/**
 * The recorded NIA Interventions Testing Program rows, read from the corpus tables at request
 * time.
 *
 * Nothing here computes a statistic. The cohort rows are the workbook's own printed values and
 * the outcome sentences are verbatim from the publication record the extractor cited; this module
 * only reshapes what `page_fields.field = 'itp'` already holds, and drops anything it cannot read.
 *
 * The dose is the one value the workbook and the project page print differently. The workbook's
 * `dose` column holds a number with no unit (`30`, `1000.0`); the project page's cohort legend
 * prints the same arm's dose with its unit (`30 ppm`), and the extractor recorded that string in
 * the `doseStudied` sub-field with the cohort and arm code it belongs to. This module joins the
 * two by (cohort, arm code) and returns only a dose that carries its unit. A bare workbook number
 * is never returned: "30" without "ppm" is not a dose, and printing it would invite a reader to
 * supply the unit themselves.
 */

/** A dose is only a dose when the source printed its unit with it. */
const DOSE_UNIT = /[A-Za-z%]/

export interface ItpCohortRow {
  cohortYear: string | null
  agentAsWritten: string | null
  armCode: string | null
  /** The source's own name for this arm: the printed agent name, else the workbook arm code. */
  armLabel: string | null
  /** The dose exactly as the source prints it, unit included. Null where no unit was recorded. */
  doseAsWritten: string | null
  /** Which source printed that dose, for the row's own provenance line. */
  doseSource: string | null
  ageAtStartMonthsAsWritten: string | null
  animalsRecordedPerSex: Array<{ sex: string; animals: number }>
  file: string | null
}

/** One mouse dose entry of the `doseStudied` sub-field (docs/specs/field-models.md, field 15b). */
interface RecordedMouseDose {
  cohort: string | null
  armCode: string | null
  doseText: string
  sourceField: string | null
}

export interface ItpPublicationRow {
  pmid: string | null
  /** The identifier in the source system when there is no PMID, e.g. a Europe PMC preprint id. */
  sourceId: string | null
  year: string | null
  title: string | null
  outcomeSentence: string
  url: string | null
  sourceDate: string | null
}

export interface ItpCompoundRecord {
  slug: string
  displayName: string
  tier: number
  cohorts: ItpCohortRow[]
  publications: ItpPublicationRow[]
  /** What the extractor recorded about the limits of these rows, verbatim. */
  note: string | null
  sourceKind: string | null
  sourceId: string | null
  sourceUrl: string | null
  sourceDate: string | null
  lastVerified: string | null
}

function readObject(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function readString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

/**
 * Europe PMC titles and sentences arrive with inline formatting tags (`<sup>`, `<i>`). React would
 * print them as literal text, so the tags are dropped and the words are left exactly as recorded.
 * No other change is made to a quoted string.
 */
function stripInlineMarkup(value: string): string {
  return value
    .replace(/<\/?(?:sup|sub|i|b|em|strong)>/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

/** Mouse entries of a page's `doseStudied` value, in the shape the extractor recorded. */
function readMouseDoses(value: unknown): RecordedMouseDose[] {
  return readArray(value).flatMap((entry) => {
    const row = readObject(entry)
    if (!row || readString(row.organism) !== 'mouse') return []
    const doseText = readString(row.doseText)
    if (doseText === null) return []
    const source = readObject(row.source)
    return [
      {
        cohort: readString(row.cohort),
        armCode: readString(row.armCode),
        doseText,
        sourceField: source ? readString(source.field) : null,
      },
    ]
  })
}

/**
 * The dose for one cohort arm, unit included, or null.
 *
 * The cohort legend's entry for the same (cohort, arm) is preferred because it is the string a
 * reader sees on the project page. The workbook's own value is used only when it already carries
 * a unit. Nothing is converted, rounded or completed.
 */
function printedDose(
  cohort: { cohortYear: string | null; armCode: string | null; doseAsWritten: string | null },
  doses: readonly RecordedMouseDose[],
): { text: string; source: string | null } | null {
  const matched = doses.find(
    (dose) =>
      dose.cohort === cohort.cohortYear &&
      dose.armCode === cohort.armCode &&
      DOSE_UNIT.test(dose.doseText),
  )
  if (matched) return { text: matched.doseText, source: matched.sourceField }
  if (cohort.doseAsWritten !== null && DOSE_UNIT.test(cohort.doseAsWritten)) {
    return { text: cohort.doseAsWritten, source: 'the workbook dose column' }
  }
  return null
}

function readCohort(value: unknown, doses: readonly RecordedMouseDose[]): ItpCohortRow | null {
  const row = readObject(value)
  if (!row) return null
  const perSex = readObject(row.animalsRecordedPerSex) ?? {}
  const animals = Object.entries(perSex)
    .map(([sex, count]) => ({ sex, animals: typeof count === 'number' ? count : Number.NaN }))
    .filter((entry) => Number.isFinite(entry.animals))
    .sort((a, b) => a.sex.localeCompare(b.sex))
  const cohortYear = readString(row.cohortYear)
  const armCode = readString(row.armCode)
  const agentAsWritten = readString(row.agentAsWritten)
  const dose = printedDose(
    { cohortYear, armCode, doseAsWritten: readString(row.doseAsWritten) },
    doses,
  )
  return {
    cohortYear,
    agentAsWritten,
    armCode,
    armLabel: agentAsWritten ?? armCode,
    doseAsWritten: dose?.text ?? null,
    doseSource: dose?.source ?? null,
    ageAtStartMonthsAsWritten: readString(row.ageAtStartMonthsAsWritten),
    animalsRecordedPerSex: animals,
    file: readString(row.file),
  }
}

function readPublication(value: unknown): ItpPublicationRow | null {
  const row = readObject(value)
  if (!row) return null
  const sentence = readString(row.outcomeSentence)
  if (!sentence) return null
  const source = readObject(row.source)
  const title = readString(row.title)
  return {
    pmid: readString(row.pmid),
    sourceId: source ? readString(source.id) : null,
    year: readString(row.year),
    title: title ? stripInlineMarkup(title) : null,
    outcomeSentence: stripInlineMarkup(sentence),
    url: source ? readString(source.url) : null,
    sourceDate: readString(row.sourceDate),
  }
}

/** Every corpus page whose ITP field is present, in display-name order. */
export async function listItpCompounds(): Promise<ItpCompoundRecord[]> {
  // Two fields, one read: `itp` holds the cohort arms and the quoted outcomes, and `doseStudied`
  // holds the dose string the cohort legend printed for those same arms.
  const rows = await db
    .select({
      key: corpusPages.key,
      slug: corpusPages.slug,
      displayName: corpusPages.displayName,
      tier: corpusPages.tier,
      field: pageFields.field,
      value: pageFields.value,
      sourceKind: pageFields.sourceKind,
      sourceId: pageFields.sourceId,
      sourceUrl: pageFields.sourceUrl,
      sourceDate: pageFields.sourceDate,
      lastVerified: pageFields.lastVerified,
    })
    .from(pageFields)
    .innerJoin(corpusPages, eq(corpusPages.key, pageFields.key))
    .where(and(inArray(pageFields.field, ['itp', 'doseStudied']), eq(pageFields.state, 'present')))
    .orderBy(asc(corpusPages.displayName))

  const dosesByKey = new Map<string, RecordedMouseDose[]>()
  for (const row of rows) {
    if (row.field !== 'doseStudied') continue
    const recorded = readMouseDoses(row.value)
    if (recorded.length > 0) dosesByKey.set(row.key, recorded)
  }

  const records: ItpCompoundRecord[] = []
  for (const row of rows) {
    if (row.field !== 'itp') continue
    const value = readObject(row.value)
    if (!value) continue
    const doses = dosesByKey.get(row.key) ?? []
    const cohorts = readArray(value.cohorts)
      .map((cohort) => readCohort(cohort, doses))
      .filter((cohort): cohort is ItpCohortRow => cohort !== null)
    const publications = readArray(value.publications)
      .map(readPublication)
      .filter((publication): publication is ItpPublicationRow => publication !== null)
    if (cohorts.length === 0 && publications.length === 0) continue
    records.push({
      slug: row.slug,
      displayName: row.displayName,
      tier: row.tier,
      cohorts,
      publications,
      note: readString(value.note),
      sourceKind: row.sourceKind,
      sourceId: row.sourceId,
      sourceUrl: row.sourceUrl,
      sourceDate: row.sourceDate,
      lastVerified: row.lastVerified,
    })
  }
  return records
}
