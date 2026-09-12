/**
 * Build every public medicine page and check what it says.
 *
 *   npx tsx scripts/dossier-v4/validate-corpus.ts --concurrency 8
 *   npx tsx scripts/dossier-v4/validate-corpus.ts --slug creatine-monohydrate
 *   npx tsx scripts/dossier-v4/validate-corpus.ts --resume --batch-size 500
 *   npx tsx scripts/dossier-v4/validate-corpus.ts --only-failures
 *
 * This builds the view model in process rather than crawling over HTTP. A crawl measures the server
 * as much as the record, and at ten thousand pages the difference is hours. What a crawl adds —
 * status codes, headers, rendered markup — is checked separately on a running server for the
 * representative pages and the smoke set.
 *
 * Resumable: `--resume` reads the existing result file and skips slugs already recorded, so an
 * interrupted run continues rather than starting again. Idempotent: running it twice over the same
 * database produces the same rows.
 *
 * Read-only. It writes files under `data/dossier-v4/` and never touches the database.
 */
import 'dotenv/config'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { sql } from 'drizzle-orm'

import { db } from '@/db'
import { findInternalKeys } from '@/lib/dossier-v3/copy-contract'
import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { LEGACY_KEY_PREFIX } from '@/lib/dossier-v4/legacy-shim'
import { buildDossierV4, type DossierV4ViewModel } from '@/lib/dossier-v4/view-model'

const OUT_JSON = 'data/dossier-v4/corpus-validation.json'
const OUT_SUMMARY = 'data/dossier-v4/corpus-validation-summary.md'
const OUT_INVENTORY = 'data/dossier-v4/corpus-inventory.json'
const OUT_CSV = 'data/dossier-v4/corpus-inventory.csv'

type Severity = 'critical' | 'high' | 'medium' | 'informational'

interface Issue {
  severity: Severity
  code: string
  detail: string
}

interface PageRow {
  slug: string
  name: string
  publicationState: string
  substanceType: string
  availability: string
  supervision: string
  identityVerified: boolean
  hasCorpusPage: boolean
  reviewedClaims: number
  humanResultCards: number
  journeySteps: number
  safetyEntries: number
  interactionEntries: number
  sections: number
  sectionsWithNothingFound: number
  measurementMode: string
  indexable: boolean
  issues: Issue[]
}

interface Args {
  concurrency: number
  batchSize: number
  cursor: string
  slug: string
  resume: boolean
  onlyFailures: boolean
  publicationState: string
  substanceType: string
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    concurrency: 8,
    batchSize: 0,
    cursor: '',
    slug: '',
    resume: false,
    onlyFailures: false,
    publicationState: '',
    substanceType: '',
  }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const next = argv[index + 1]
    if (flag === '--concurrency' && next) ((args.concurrency = Number(next)), (index += 1))
    else if (flag === '--batch-size' && next) ((args.batchSize = Number(next)), (index += 1))
    else if (flag === '--cursor' && next) ((args.cursor = next), (index += 1))
    else if (flag === '--slug' && next) ((args.slug = next), (index += 1))
    else if (flag === '--publication-state' && next) ((args.publicationState = next), (index += 1))
    else if (flag === '--substance-type' && next) ((args.substanceType = next), (index += 1))
    else if (flag === '--resume') args.resume = true
    else if (flag === '--only-failures') args.onlyFailures = true
  }
  return args
}

/** Every slug the public `/d/` surface can answer: a corpus page, a legacy record, or both. */
async function publicSlugs(): Promise<string[]> {
  const result = await db.execute(sql`
    select slug from corpus_pages
    union
    select slug from drugs
    order by slug`)
  const rows = (Array.isArray(result) ? result : (result as { rows?: unknown[] }).rows) ?? []
  return (rows as Array<{ slug: string }>).map((row) => row.slug).filter(Boolean)
}

/* ------------------------------------------------------------------ checks */

/** Reader text: every section except the two explicitly technical ones. */
function readerStatements(model: DossierV4ViewModel): string[] {
  return [
    model.identity.canonicalName,
    model.identity.substanceType,
    model.identity.availability,
    model.pagePromise,
    model.publication.label,
    model.publication.plain,
    model.publication.reason,
    model.hero.simpleAction.text,
    model.hero.actionDetail.text,
    model.hero.whyPeopleCare.text,
    model.hero.strongestGoalResult.text,
    model.hero.principalUncertainty.text,
    model.hero.outcomeType,
    model.hero.bodyLocation.text,
    ...model.humanResults.cards.flatMap((card) => [
      card.question,
      card.population,
      card.doesNotProve,
    ]),
    ...model.journey.nodes.map((node) => node.plain),
    ...model.safety.entries.map((entry) => entry.text),
    ...model.stack.entries.map((entry) => entry.consequence),
    ...model.formCheck.entries.map((entry) => entry.note),
    ...model.measurement.plan.map((step) => step.text),
    ...model.noResponse.entries.filter((entry) => entry.applies).map((entry) => entry.basis),
    ...model.unknowns.entries.map((entry) => entry.question),
    ...model.changes.entries.map((entry) => entry.text),
  ].filter((text): text is string => typeof text === 'string' && text.length > 0)
}

function checkPage(model: DossierV4ViewModel, hasCorpusPage: boolean): Issue[] {
  const issues: Issue[] = []
  const add = (severity: Severity, code: string, detail: string): void => {
    issues.push({ severity, code, detail })
  }
  const reader = readerStatements(model)
  const readerText = reader.join(' ')
  /*
   * RNAWiki's own voice, separated from text it quotes.
   *
   * The dose check has to run on what RNAWiki says, not on what it quotes. A boxed warning that
   * names an amount is a regulator's wording reproduced under a source label; flagging it as
   * RNAWiki instructing a dose reported ten pages that were doing exactly the right thing. What
   * must never name an amount is the hero, the measurement plan and the page's own furniture.
   */
  const ownVoice = [
    model.hero.simpleAction.text,
    model.hero.actionDetail.text,
    model.hero.whyPeopleCare.text,
    model.hero.principalUncertainty.text,
    model.pagePromise,
    model.publication.plain,
    model.publication.reason,
    ...model.measurement.plan.map((step) => step.text),
    ...model.measurement.whatNotToMeasure,
    ...model.measurement.stopRules,
    ...model.measurement.clinicianQuestions,
    ...model.noResponse.entries.map((entry) => entry.plain),
    ...model.humanResults.cards.map((card) => card.doesNotProve),
  ]
    .filter((text): text is string => typeof text === 'string')
    .join(' ')
    .toLowerCase()

  /* ---- identity and copy ---- */
  if (readerText.includes(LEGACY_KEY_PREFIX)) {
    add('critical', 'synthetic_key_in_reader_text', 'The shim key reached reader text.')
  }
  const keys = findInternalKeys(readerText)
  if (keys.length > 0) {
    add(
      'critical',
      'internal_key_in_reader_text',
      keys
        .slice(0, 5)
        .map((hit) => hit.match)
        .join(', '),
    )
  }
  /*
   * A placeholder, not the English word. "A null result across 157 randomised patients" is correct
   * scientific writing, and flagging it reported two pages that read perfectly. What a reader must
   * never meet is a missing value printed where a value belongs.
   */
  for (const text of reader) {
    if (/(?::|=|\()\s*(?:null|undefined|NaN)\b|\[object Object\]|\bundefined\b/.test(text)) {
      add('critical', 'placeholder_in_reader_text', text.slice(0, 90))
      break
    }
  }
  if (!model.identity.canonicalName.trim()) {
    add('critical', 'no_name', 'The page has no canonical name.')
  }
  if (model.identity.substanceTypeCode === 'unknown_type') {
    add('medium', 'substance_type_unresolved', model.identity.substanceTypeBasis)
  }
  if (model.identity.availabilityCode === 'unresolved') {
    add('medium', 'availability_unresolved', model.identity.availabilityBasis)
  }

  /* ---- the date defect ---- */
  const review = model.identity.lastSubstantiveReview
  if (review && !/^\d{4}(-\d{2}){0,2}$/.test(review)) {
    add('high', 'check_date_is_not_a_date', review.slice(0, 60))
  }

  /* ---- publication state ---- */
  if (model.publication.state === 'reviewed' && !model.publication.indexable) {
    add('high', 'reviewed_but_not_indexable', 'A reviewed page should be eligible for indexing.')
  }
  if (model.publication.state !== 'reviewed' && model.publication.indexable) {
    add('critical', 'unreviewed_page_indexable', model.publication.state)
  }
  if (model.publication.state !== 'reviewed' && !model.publication.bannerRequired) {
    add('high', 'missing_state_banner', model.publication.state)
  }

  /* ---- safety ---- */
  const lower = readerText.toLowerCase()
  if (lower.includes('safe together')) {
    add('critical', 'safe_together', 'The page says a pair is safe together.')
  }
  if (/\btake \d+\s?(mg|g|mcg|ml|iu)\b/.test(ownVoice) || /\brecommended dose\b/.test(ownVoice)) {
    add('critical', 'dose_instruction', 'RNAWiki names an amount to take in its own voice.')
  }
  if (model.measurement.mode === 'self_experiment') {
    if (model.identity.supervision === 'required') {
      add('critical', 'planner_on_supervised_page', model.identity.availabilityCode)
    }
    const plan = model.measurement.plan.map((step) => step.text).join(' ')
    if (/\b\d+\s?(mg|g|mcg|ml|iu)\b/i.test(plan)) {
      add('critical', 'planner_names_an_amount', plan.slice(0, 80))
    }
  }
  if (model.publication.state === 'correction_hold' && model.publication.mayShowConclusions) {
    add('critical', 'conclusions_on_correction_hold', 'A held record may not show conclusions.')
  }

  /* ---- evidence ---- */
  for (const card of model.humanResults.cards) {
    if (!card.question.trim()) {
      add('critical', 'result_without_question', card.id)
    }
    if (!card.outcomeClassLabel.trim()) {
      add('high', 'result_without_outcome_class', card.id)
    }
  }
  const fingerprintStates = model.fingerprint.rows.flatMap((row) =>
    row.cells.map((cell) => cell.state),
  )
  if (model.publication.state !== 'reviewed' && fingerprintStates.includes('demonstrated')) {
    add(
      'critical',
      'demonstrated_without_review',
      'An unreviewed page claims a demonstrated effect.',
    )
  }
  if (model.journey.edges.some((edge) => edge.evidenceOrigin === 'predicted')) {
    add('critical', 'predicted_edge_public', 'A predicted relationship reached the public path.')
  }

  /* ---- navigation ---- */
  const sectionIds = new Set(model.sections.map((section) => section.id))
  for (const question of model.nextQuestions) {
    if (!sectionIds.has(question.target.replace('#', ''))) {
      add('high', 'next_question_dead_link', question.target)
    }
  }

  /* ---- shape ---- */
  if (!hasCorpusPage && model.publication.indexable) {
    add('critical', 'shimmed_record_indexable', 'A record with no corpus page must not be indexed.')
  }
  return issues
}

/* -------------------------------------------------------------------- run */

async function validateSlug(slug: string): Promise<PageRow> {
  try {
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) {
      return {
        slug,
        name: '',
        publicationState: 'not_found',
        substanceType: '',
        availability: '',
        supervision: '',
        identityVerified: false,
        hasCorpusPage: false,
        reviewedClaims: 0,
        humanResultCards: 0,
        journeySteps: 0,
        safetyEntries: 0,
        interactionEntries: 0,
        sections: 0,
        sectionsWithNothingFound: 0,
        measurementMode: '',
        indexable: false,
        issues: [
          {
            severity: 'high',
            code: 'no_record',
            detail: 'Neither a corpus page nor a legacy row.',
          },
        ],
      }
    }
    const hasCorpusPage = !inputs.corpus.key.startsWith(LEGACY_KEY_PREFIX)
    const model = buildDossierV4(inputs)
    return {
      slug,
      name: model.name,
      publicationState: model.publication.state,
      substanceType: model.identity.substanceTypeCode,
      availability: model.identity.availabilityCode,
      supervision: model.identity.supervision,
      identityVerified: model.identity.identityVerified,
      hasCorpusPage,
      reviewedClaims: inputs.claims.filter((claim) => claim.reviewerState === 'reviewed').length,
      humanResultCards: model.humanResults.cards.length,
      journeySteps: model.journey.nodes.length,
      safetyEntries: model.safety.entries.length,
      interactionEntries: model.stack.entries.length,
      sections: model.sections.length,
      sectionsWithNothingFound: model.sections.filter(
        (section) => section.state === 'no_qualifying_evidence',
      ).length,
      measurementMode: model.measurement.mode,
      indexable: model.publication.indexable,
      issues: checkPage(model, hasCorpusPage),
    }
  } catch (error) {
    return {
      slug,
      name: '',
      publicationState: 'pipeline_failure',
      substanceType: '',
      availability: '',
      supervision: '',
      identityVerified: false,
      hasCorpusPage: false,
      reviewedClaims: 0,
      humanResultCards: 0,
      journeySteps: 0,
      safetyEntries: 0,
      interactionEntries: 0,
      sections: 0,
      sectionsWithNothingFound: 0,
      measurementMode: '',
      indexable: false,
      issues: [
        {
          severity: 'critical',
          code: 'build_threw',
          detail: (error instanceof Error ? error.message : String(error)).slice(0, 200),
        },
      ],
    }
  }
}

function writeFile(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, contents)
}

function summarise(rows: PageRow[]): string {
  const count = (key: keyof PageRow): Map<string, number> => {
    const map = new Map<string, number>()
    for (const row of rows) {
      const value = String(row[key] ?? '')
      map.set(value, (map.get(value) ?? 0) + 1)
    }
    return map
  }
  const table = (title: string, map: Map<string, number>): string => {
    const lines = [...map.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([value, total]) => `| ${value || '(none)'} | ${total} |`)
    return `\n### ${title}\n\n| Value | Pages |\n| --- | --- |\n${lines.join('\n')}\n`
  }
  const issues = new Map<string, { severity: Severity; total: number; example: string }>()
  for (const row of rows) {
    for (const issue of row.issues) {
      const entry = issues.get(issue.code) ?? { severity: issue.severity, total: 0, example: '' }
      entry.total += 1
      if (!entry.example) entry.example = `${row.slug}: ${issue.detail}`.slice(0, 140)
      issues.set(issue.code, entry)
    }
  }
  const order: Severity[] = ['critical', 'high', 'medium', 'informational']
  const issueLines = [...issues.entries()]
    .sort(
      (left, right) =>
        order.indexOf(left[1].severity) - order.indexOf(right[1].severity) ||
        right[1].total - left[1].total,
    )
    .map(([code, entry]) => `| ${entry.severity} | ${code} | ${entry.total} | ${entry.example} |`)

  const criticals = rows.filter((row) => row.issues.some((issue) => issue.severity === 'critical'))

  return [
    '# Dossier v4 corpus validation',
    '',
    `Built ${rows.length} pages in process from the local database.`,
    '',
    `- Pages with a critical issue: **${criticals.length}**`,
    `- Pages with any issue: **${rows.filter((row) => row.issues.length > 0).length}**`,
    `- Pages that built with no issue: **${rows.filter((row) => row.issues.length === 0).length}**`,
    table('Publication state', count('publicationState')),
    table('Substance type', count('substanceType')),
    table('Availability', count('availability')),
    table('Measurement mode', count('measurementMode')),
    '\n### Issues\n',
    '| Severity | Code | Pages | Example |',
    '| --- | --- | --- | --- |',
    ...issueLines,
    '',
  ].join('\n')
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  let slugs = args.slug ? [args.slug] : await publicSlugs()
  if (args.cursor) slugs = slugs.filter((slug) => slug > args.cursor)
  if (args.batchSize > 0) slugs = slugs.slice(0, args.batchSize)

  const done = new Map<string, PageRow>()
  if (args.resume && existsSync(OUT_JSON)) {
    const previous = JSON.parse(readFileSync(OUT_JSON, 'utf8')) as { pages: PageRow[] }
    for (const row of previous.pages ?? []) done.set(row.slug, row)
    slugs = slugs.filter((slug) => !done.has(slug))
    console.log(`resuming: ${done.size} already recorded, ${slugs.length} to go`)
  }

  const rows: PageRow[] = [...done.values()]
  let index = 0
  let completed = 0
  const started = Date.now()

  async function worker(): Promise<void> {
    while (index < slugs.length) {
      const slug = slugs[index]
      index += 1
      if (!slug) continue
      rows.push(await validateSlug(slug))
      completed += 1
      if (completed % 250 === 0) {
        const rate = completed / ((Date.now() - started) / 1000)
        console.log(
          `${completed}/${slugs.length} · ${rate.toFixed(1)}/s · ${Math.round((slugs.length - completed) / rate)}s left`,
        )
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, args.concurrency) }, () => worker()))

  rows.sort((left, right) => left.slug.localeCompare(right.slug))
  const reported = args.onlyFailures ? rows.filter((row) => row.issues.length > 0) : rows

  writeFile(
    OUT_JSON,
    `${JSON.stringify({ builtAt: new Date().toISOString(), total: rows.length, pages: reported }, null, 2)}\n`,
  )
  writeFile(OUT_SUMMARY, summarise(rows))
  writeFile(
    OUT_INVENTORY,
    `${JSON.stringify(
      {
        builtAt: new Date().toISOString(),
        total: rows.length,
        pages: rows.map((row) => ({
          slug: row.slug,
          name: row.name,
          publicationState: row.publicationState,
          substanceType: row.substanceType,
          availability: row.availability,
          supervision: row.supervision,
          hasCorpusPage: row.hasCorpusPage,
          reviewedClaims: row.reviewedClaims,
          humanResultCards: row.humanResultCards,
          journeySteps: row.journeySteps,
          measurementMode: row.measurementMode,
          indexable: row.indexable,
          criticalIssues: row.issues.filter((issue) => issue.severity === 'critical').length,
        })),
      },
      null,
      2,
    )}\n`,
  )
  const header =
    'slug,name,publication_state,substance_type,availability,supervision,has_corpus_page,reviewed_claims,human_results,journey_steps,measurement_mode,indexable,critical_issues'
  writeFile(
    OUT_CSV,
    `${[
      header,
      ...rows.map((row) =>
        [
          row.slug,
          `"${row.name.replaceAll('"', '""')}"`,
          row.publicationState,
          row.substanceType,
          row.availability,
          row.supervision,
          row.hasCorpusPage,
          row.reviewedClaims,
          row.humanResultCards,
          row.journeySteps,
          row.measurementMode,
          row.indexable,
          row.issues.filter((issue) => issue.severity === 'critical').length,
        ].join(','),
      ),
    ].join('\n')}\n`,
  )

  for (const [state, file] of [
    ['reviewed', 'data/dossier-v4/reviewed-slugs.txt'],
    ['preliminary', 'data/dossier-v4/preliminary-slugs.txt'],
    ['limited', 'data/dossier-v4/limited-slugs.txt'],
    ['correction_hold', 'data/dossier-v4/correction-hold-slugs.txt'],
    ['pipeline_failure', 'data/dossier-v4/pipeline-failure-slugs.txt'],
  ] as const) {
    writeFile(
      file,
      `${rows
        .filter((row) => row.publicationState === state)
        .map((row) => row.slug)
        .join('\n')}\n`,
    )
  }

  const criticals = rows.filter((row) => row.issues.some((issue) => issue.severity === 'critical'))
  console.log(
    JSON.stringify({
      total: rows.length,
      withCritical: criticals.length,
      withAnyIssue: rows.filter((row) => row.issues.length > 0).length,
      summary: OUT_SUMMARY,
    }),
  )
  if (criticals.length > 0) process.exitCode = 1
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exit(1)
})
