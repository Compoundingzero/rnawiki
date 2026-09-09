/**
 * The reader-facing words for an R2 suppression class (docs/specs/suppression-classes.md,
 * "Ordinary-language labels").
 *
 * `S1`…`S10` are storage tokens. `docs/specs/phase4-generators.md` §7 forbids one in prose, and the
 * Phase 1 reading found the stub path printing them, so the table lives in a module with no imports
 * of its own: the corpus-scale renderer under `scripts/` and the React template under `lib/` both
 * read it, and neither carries a second copy that could drift from the spec.
 */

/** The exact label the spec fixes for each class. */
export const SUPPRESSION_CLASS_LABELS: Readonly<Record<string, string>> = {
  S1: 'a World Health Organization therapeutic class such as cancer medicines, immune suppressants, opioids or general anaesthetics',
  S2: 'a controlled-substance schedule in Singapore, the United States, Australia or the United Kingdom',
  S3: 'a label warning about harm to a developing baby, or a pregnancy-prevention programme',
  S4: 'a list of cytotoxic or otherwise hazardous medicines',
  S5: 'a United States programme that restricts how the medicine is supplied and who may supply it',
  S6: 'a boxed warning, the strongest warning a United States label carries',
  S7: 'a route a clinician administers, such as an injection into a vein or into the spine',
  S8: 'a register record of withdrawal or suspension for a safety reason',
  S9: 'a long-acting injection, an insulin, or another injected hormone adjusted by measurement',
  S10: 'no classification found in the registers checked',
}

/** S1-S9 are the classes a register positively recorded; S10 is the absence of one. */
const CITED_CLASS = /^S[1-9]$/

/**
 * The classes on this record that a register positively stated, in the spec's own order, each as
 * the words a reader sees. Empty where the record carries only S10 or nothing at all.
 */
export function citedSuppressionLabels(classes: readonly string[]): string[] {
  const seen = new Set<string>()
  for (const code of classes) {
    if (CITED_CLASS.test(code) && code in SUPPRESSION_CLASS_LABELS) seen.add(code)
  }
  return [...seen]
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
    .map((code) => SUPPRESSION_CLASS_LABELS[code] as string)
}

/** True where the record's only recorded class is the unknown one. */
export function isUnknownClassOnly(classes: readonly string[]): boolean {
  return classes.length > 0 && classes.every((code) => code === 'S10')
}

/**
 * The single line an S10-only record carries in place of a block: it has no classification to
 * state, and saying so is not the same as saying nothing was found to worry about.
 *
 * It lives here, in the module that imports nothing, because the corpus-scale renderer under
 * `scripts/` writes the same line and must not pull the database layer in to get its words.
 */
export function unknownClassificationLine(): string {
  return 'No classification is recorded for this compound in the registers checked.'
}

/* ------------------------------------------------------------------ the supervision clauses */

/**
 * One recorded piece of suppression evidence, as `scripts/corpus-20k/suppression/assign.py` and
 * `scripts/revamp/controlled_suppression.py` write it: the class it answers, the source that
 * stated it, the value that source carried, and — for the ATC-based classes — the register's own
 * name for the class code.
 */
export interface SuppressionEvidence {
  test: string
  source?: string
  value?: string
  label?: string
}

/** A DailyMed label the page holds, as the clause cites it: the SPL set id and its date. */
export interface SupervisionLabelCitation {
  id?: string
  date?: string
}

/**
 * What the page itself holds that a clause may cite in place of the evidence row's source words.
 *
 * §15(1) asks the boxed-warning clause for "the DailyMed label set id and date", which the
 * suppression pass did not record and the page's own `boxedWarning` field does.
 */
export interface SupervisionContext {
  boxedWarningLabel?: SupervisionLabelCitation
  label?: SupervisionLabelCitation
}

/** One clause of the supervision answer: the class it was built from, and its sentence. */
export interface SupervisionClause {
  code: string
  text: string
}

/** "a", "a and b", "a, b and c" — the list separator the rest of the corpus text uses. */
function joinClauseList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1] as string}`
}

/**
 * A source or value written to sit inside a sentence.
 *
 * The recorded strings carry their own brackets ("Misuse of Drugs Act 1973 (2020 Rev Ed)",
 * "Schedule 8 (Controlled drugs)"), and a clause puts its source in brackets of its own, so a
 * nested pair would read as a rendering fault. The brackets become commas and nothing else
 * changes: these are the register's own words.
 */
function flatten(text: string | undefined): string {
  if (!text) return ''
  return (
    text
      // §13(2): a column name is storage vocabulary and a reader never meets one. The registers' own
      // recorded strings name the column a value was read from — `drug_warning`, `boxed_warning`,
      // `dea_schedule` — and the underscore is what makes it a column name rather than the words it
      // is made of.
      .replace(/_/g, ' ')
      .replace(/\s*\(\s*/g, ', ')
      .replace(/\s*\)\s*/g, ' ')
      .replace(/\s*;\s*$/, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+,/g, ',')
      .replace(/[.,]\s*$/, '')
      .trim()
  )
}

/**
 * The register's name out of a source string, without the table or column it was read from.
 *
 * §13(2): `drug_warning` and `withdrawn_flag` are storage vocabulary. The register's name is the
 * run of leading tokens that begin with a capital or a digit; the first lowercase token ends it.
 */
function registerWords(source: string | undefined): string {
  const kept: string[] = []
  for (const token of flatten(source).split(' ')) {
    if (!token) continue
    if (!/^[A-Z0-9]/.test(token)) break
    kept.push(token.replace(/[,;]$/, ''))
  }
  return kept.join(' ')
}

/** "DailyMed label 77108624-…, 2025-01-14", or the evidence row's own source words. */
function labelCitation(
  citation: SupervisionLabelCitation | undefined,
  fallback: string | undefined,
): string {
  if (citation?.id) {
    return citation.date
      ? `DailyMed label ${citation.id}, ${citation.date}`
      : `DailyMed label ${citation.id}`
  }
  return flatten(fallback)
}

/** The substantive half of a value that names where it was found before what was found. */
function foundValue(value: string | undefined): string {
  const flat = flatten(value)
  const index = flat.lastIndexOf(': ')
  return index >= 0 ? flat.slice(index + 2).trim() : flat
}

const ATC_CODE = /^[A-Z]\d{2}[A-Z]{0,2}\d{0,2}$/

/** The ATC code a named class opens with: "L01CA, Vinca alkaloids and analogues" → "L01CA". */
const ATC_PREFIX = /^([A-Z]\d{2}(?:[A-Z]{1,2}\d{0,2})?)\b/

/** The class an evidence row names: the register's own name for it, else the recorded value. */
function namedClass(row: SuppressionEvidence): string {
  return flatten(row.label) || flatten(row.value)
}

/** The ATC code inside a named class, empty where the row names something that is not one. */
function namedAtcCode(row: SuppressionEvidence): string {
  return ATC_PREFIX.exec(namedClass(row))?.[1] ?? ''
}

/**
 * What an S4 row contributes to the S1 clause it merges into: S4's own ground in words, plus
 * whatever its recorded source states beyond the ATC basis the clause has already named.
 *
 * The recorded source is "WHO ATC L01 (NIOSH list not fetched)", which restates the classification
 * the merged clause opens with. Repeating it inside the same brackets would cite the same register
 * twice; what S4 adds is that the class is a hazardous-medicine one and that the NIOSH list itself
 * was not fetched, so that is what is kept.
 */
function hazardousSourceWords(source: string | undefined): string {
  const qualifier = flatten(source)
    .replace(/^WHO ATC(\s+[A-Z]\d{2}[A-Z]{0,2}\d{0,2})?\s*,?\s*/i, '')
    .trim()
  return qualifier ? `hazardous-medicine class, ${qualifier}` : 'hazardous-medicine class'
}

/**
 * "<value> (<source>)", the shape every clause item takes.
 *
 * §15(1): "a clause without a matching source does not render". An item whose evidence row
 * recorded no source is dropped here, so a clause states nothing this corpus cannot cite.
 */
function item(value: string, source: string | undefined): string {
  const cited = flatten(source)
  return cited ? `${value} (${cited})` : ''
}

function clauseFor(
  code: string,
  rows: readonly SuppressionEvidence[],
  context: SupervisionContext,
  extraSources: readonly string[] = [],
): string | undefined {
  const values = rows.map((row) => flatten(row.value)).filter((value) => value.length > 0)
  if (rows.length === 0) return undefined

  switch (code) {
    case 'S1': {
      // "Its World Health Organization ATC class is C01AA, digitalis glycosides (WHO ATC via
      // ChEMBL/EMA)": the code and the register's own name for it, never a list of what such a
      // class might be.
      const named = rows.map(namedClass).filter((value) => value.length > 0)
      const seen = [...new Set(named)]
      const sources = [
        ...new Set([...rows.map((row) => flatten(row.source)).filter(Boolean), ...extraSources]),
      ]
      if (seen.length === 0 || sources.length === 0) return undefined
      return item(
        `Its World Health Organization ATC ${seen.length === 1 ? 'class is' : 'classes are'} ${joinClauseList(seen)}`,
        sources.join('; '),
      )
    }
    case 'S2': {
      const items = rows
        .map((row) => (flatten(row.value) ? item(flatten(row.value), row.source) : ''))
        .filter(Boolean)
      if (items.length === 0) return undefined
      return `A statute schedules it as a controlled substance: ${items.join('; ')}`
    }
    case 'S3': {
      const programme = rows.find((row) => /REMS|pregnancy-prevention/i.test(row.source ?? ''))
      if (programme) {
        return item('It is under a pregnancy-prevention programme', programme.source)
      }
      const items = [
        ...new Set(
          rows.map((row) =>
            foundValue(row.value)
              ? item(foundValue(row.value), registerWords(row.value) || row.source)
              : '',
          ),
        ),
      ].filter(Boolean)
      if (items.length === 0) return undefined
      return `A label or register records a risk to a developing baby: ${items.join('; ')}`
    }
    case 'S4': {
      const items = [
        ...new Set(
          rows
            .map((row) => {
              const value = flatten(row.value)
              if (/cytotoxic/i.test(value))
                return item('the word "cytotoxic" in its label', row.source)
              const named = namedClass(row)
              return named ? item(named, row.source) : ''
            })
            .filter(Boolean),
        ),
      ]
      if (items.length === 0) return undefined
      return `A hazardous-medicine class covers it: ${items.join('; ')}`
    }
    case 'S5':
      return item(
        'A United States Risk Evaluation and Mitigation Strategy is named in its label',
        labelCitation(context.label, rows[0]?.source),
      )
    case 'S6': {
      const subjects = [...new Set(values.flatMap((value) => value.split(/;\s*/)))].filter(Boolean)
      const citation = labelCitation(context.boxedWarningLabel, rows[0]?.source)
      if (subjects.length === 0)
        return item('Its United States label carries a boxed warning', citation)
      return item(
        `Its United States label carries a boxed warning naming ${joinClauseList(subjects)}`,
        citation,
      )
    }
    case 'S7': {
      const items = [
        ...new Set(
          rows
            .map((row) => {
              const value = flatten(row.value)
              if (ATC_CODE.test(value)) return item(flatten(row.label) || value, row.source)
              const routes = value
                .split(/,\s*/)
                .map((route) => route.toLowerCase())
                .filter(Boolean)
              return routes.length > 0 ? item(joinClauseList(routes), row.source) : ''
            })
            .filter(Boolean),
        ),
      ]
      if (items.length === 0) return undefined
      return `Its recorded route of administration is one a clinician gives: ${items.join('; ')}`
    }
    case 'S8': {
      const items = [
        ...new Set(
          rows
            .map((row) => {
              const raw = row.value ?? ''
              const detail = /\(([^)]*)\)\s*$/.exec(raw)?.[1]
              const register = registerWords(raw) || registerWords(row.source)
              if (detail) return item(flatten(detail).replace(/;\s*/g, ', '), register)
              return register ? item('no reason recorded with the flag', register) : ''
            })
            .filter(Boolean),
        ),
      ]
      if (items.length === 0) return undefined
      return `A register records it withdrawn or suspended for a safety reason: ${items.join('; ')}`
    }
    case 'S9': {
      const items = [
        ...new Set(
          rows
            .map((row) => {
              const named = flatten(row.label) || flatten(row.value)
              return named ? item(named, row.source) : ''
            })
            .filter(Boolean),
        ),
      ]
      if (items.length === 0) return undefined
      return `A long-acting or titrated injected form is recorded for it: ${items.join('; ')}`
    }
    default:
      return undefined
  }
}

/**
 * The supervision answer: one clause per recorded S1–S9 class, each built from that class's own
 * evidence and its own source (docs/specs/phase4-generators.md §15 item 1).
 *
 * The generic label list this module also holds — "a World Health Organization therapeutic class
 * such as cancer medicines, immune suppressants, opioids or general anaesthetics" — says what a
 * class of that kind might be, not what this record is in, and the reading of draw 6 found it
 * printed beside a prescription-schedule row that was not its evidence at all. It is not written
 * here. A class with no evidence row of its own, or whose evidence carries no value, produces no
 * clause, and a record left with no clause has no supervision answer and renders no block.
 *
 * Where S1 and S4 name the same ATC class code — every antineoplastic L01 record does, because the
 * ATC group is both the therapeutic class the register published and the hazardous-medicine class
 * the S4 test reads off it — the two clauses are one clause naming the class once and carrying both
 * sources: "Its World Health Organization ATC class is L01CA, Vinca alkaloids and analogues (WHO
 * ATC via ChEMBL/EMA; hazardous-medicine class, NIOSH list not fetched)." An S4 row that names a
 * different class, or the word "cytotoxic" in a label, is not the same fact and keeps its own
 * clause.
 */
export function supervisionClauses(
  classes: readonly string[],
  evidence: readonly SuppressionEvidence[],
  context: SupervisionContext = {},
): SupervisionClause[] {
  const byClass = new Map<string, SuppressionEvidence[]>()
  for (const row of evidence) {
    const code = String(row?.test ?? '')
    if (!CITED_CLASS.test(code)) continue
    const rows = byClass.get(code) ?? []
    rows.push(row)
    byClass.set(code, rows)
  }
  const recorded = [...new Set(classes.filter((code) => CITED_CLASS.test(code)))].sort(
    (a, b) => Number(a.slice(1)) - Number(b.slice(1)),
  )

  // The S1/S4 merge. It runs only where both classes would otherwise print a clause, so a record
  // carrying just one of them states exactly what it stated before.
  const mergedSources: string[] = []
  if (recorded.includes('S1') && recorded.includes('S4')) {
    const atcOfS1 = new Set(
      (byClass.get('S1') ?? []).map(namedAtcCode).filter((code) => code.length > 0),
    )
    const kept: SuppressionEvidence[] = []
    for (const row of byClass.get('S4') ?? []) {
      // A row that reports the word "cytotoxic" in a label states a fact the ATC group does not,
      // so it is never folded into the class clause however the row is labelled.
      const code = /cytotoxic/i.test(flatten(row.value)) ? '' : namedAtcCode(row)
      if (code && atcOfS1.has(code)) mergedSources.push(hazardousSourceWords(row.source))
      else kept.push(row)
    }
    byClass.set('S4', kept)
  }

  const out: SupervisionClause[] = []
  for (const code of recorded) {
    const text = clauseFor(
      code,
      byClass.get(code) ?? [],
      context,
      code === 'S1' ? [...new Set(mergedSources)] : [],
    )
    if (text) out.push({ code, text: `${text.replace(/\s*\.\s*$/, '')}.` })
  }
  return out
}
