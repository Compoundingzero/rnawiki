import 'dotenv/config'
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline'

import { normalizeContentName } from '@/lib/background/name-normalization'

/**
 * Reduces the local openFDA label index to the facts the completion resolver needs per label:
 * which substances the label declares, how many, and which of the read sections it carries.
 *
 * This is the auditable half of "the label was read and section X was absent". The extractors
 * only ever see the sections listed in `scripts/background/index-openfda-labels.py`; a section
 * outside that list is not read at all, and the resolver must say so rather than call it absent.
 * `readSections` therefore records the fixed section vocabulary of the index that produced it.
 *
 * Usage:
 *   npx tsx scripts/dossier-completion/build-label-sections-index.ts [--label-index=<path>] [--presence=<path>] [--out=<path>]
 */

interface IndexedLabel {
  setId?: string
  declaredSubstanceCount?: number
  effectiveTime?: string
  substanceNames?: string[]
  genericNames?: string[]
  sections?: Record<string, string>
}

interface PresenceRow {
  setId?: string
  names?: string[]
  declared?: number
  productTypes?: string[]
  routes?: string[]
  effectiveTime?: string
}

export interface LabelSectionsEntry {
  setId: string
  /** Normalized declared substance names, sorted. */
  names: string[]
  declared: number
  productTypes: string[]
  effectiveTime: string | null
  /** Read sections that carry text on this label, sorted. Empty for prose-free labels. */
  sections: string[]
}

export interface LabelSectionsIndex {
  schema: 'rnawiki-label-sections-index/v1'
  builtAt: string
  labelIndexSha256: string | null
  presenceSha256: string | null
  readSections: string[]
  labels: number
  proseLabels: number
  entries: LabelSectionsEntry[]
}

/** The fixed vocabulary the label indexer reads; mirrors SECTION_BUDGETS in the Python indexer. */
export const READ_LABEL_SECTIONS = [
  'indications_and_usage',
  'dosage_forms_and_strengths',
  'clinical_pharmacology',
  'pharmacokinetics',
  'mechanism_of_action',
  'pharmacodynamics',
  'description',
  'contraindications',
  'boxed_warning',
  'drug_interactions',
  'warnings_and_cautions',
  'adverse_reactions',
  'use_in_specific_populations',
  'pregnancy',
  'pediatric_use',
  'geriatric_use',
  'nursing_mothers',
  'overdosage',
  'clinical_studies',
  'drug_abuse_and_dependence',
  'how_supplied',
] as const

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

async function streamLines(path: string, onLine: (line: string) => void): Promise<string> {
  const hash = createHash('sha256')
  const stream = createReadStream(path)
  stream.on('data', (chunk) => hash.update(chunk))
  const reader = createInterface({ input: stream, crlfDelay: Number.POSITIVE_INFINITY })
  for await (const line of reader) {
    if (line.trim()) onLine(line)
  }
  return hash.digest('hex')
}

async function main(): Promise<void> {
  const dataDir = process.env.RNAWIKI_INGEST_DATA ?? join(process.cwd(), 'tmp')
  const labelIndexPath = flag('label-index') ?? join(dataDir, 'label-index.ndjson')
  const presencePath = flag('presence') ?? join(dataDir, 'label-presence.ndjson')
  const outPath = flag('out') ?? join(dataDir, 'label-sections-index.json')

  const entries = new Map<string, LabelSectionsEntry>()
  let presenceSha: string | null = null
  if (existsSync(presencePath)) {
    presenceSha = await streamLines(presencePath, (line) => {
      const row = JSON.parse(line) as PresenceRow
      if (!row.setId) return
      entries.set(row.setId, {
        setId: row.setId,
        names: [...new Set((row.names ?? []).map(normalizeContentName).filter(Boolean))].sort(),
        declared: row.declared ?? 0,
        productTypes: [...(row.productTypes ?? [])].sort(),
        effectiveTime: row.effectiveTime ?? null,
        sections: [],
      })
    })
  }

  let labelIndexSha: string | null = null
  let proseLabels = 0
  if (existsSync(labelIndexPath)) {
    labelIndexSha = await streamLines(labelIndexPath, (line) => {
      const label = JSON.parse(line) as IndexedLabel
      if (!label.setId) return
      const sections = Object.entries(label.sections ?? {})
        .filter(([, text]) => typeof text === 'string' && text.trim().length > 0)
        .map(([key]) => key)
        .sort()
      const names = [
        ...new Set(
          [...(label.substanceNames ?? []), ...(label.genericNames ?? [])]
            .map(normalizeContentName)
            .filter(Boolean),
        ),
      ].sort()
      const existing = entries.get(label.setId)
      if (existing) {
        existing.sections = sections
        if (existing.names.length === 0) existing.names = names
        if (existing.declared === 0 && label.declaredSubstanceCount) {
          existing.declared = label.declaredSubstanceCount
        }
      } else {
        entries.set(label.setId, {
          setId: label.setId,
          names,
          declared: label.declaredSubstanceCount ?? names.length,
          productTypes: [],
          effectiveTime: label.effectiveTime ?? null,
          sections,
        })
      }
      if (sections.length > 0) proseLabels += 1
    })
  }

  if (entries.size === 0) {
    throw new Error(`No labels found at ${presencePath} or ${labelIndexPath}. Refusing to write an empty index.`)
  }

  const index: LabelSectionsIndex = {
    schema: 'rnawiki-label-sections-index/v1',
    builtAt: new Date().toISOString(),
    labelIndexSha256: labelIndexSha,
    presenceSha256: presenceSha,
    readSections: [...READ_LABEL_SECTIONS],
    labels: entries.size,
    proseLabels,
    entries: [...entries.values()].sort((left, right) => left.setId.localeCompare(right.setId)),
  }
  mkdirSync(join(outPath, '..'), { recursive: true })
  writeFileSync(outPath, JSON.stringify(index))
  console.log(
    `[label-sections] ${index.labels} labels (${proseLabels} with read sections) -> ${outPath}`,
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
