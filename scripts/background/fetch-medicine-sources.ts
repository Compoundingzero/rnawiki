import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Fetches the primary-source artifacts a recorded-background author works from, one JSON file per
 * medicine. Authors structure values ONLY from these artifacts; the excerpt stored beside each
 * value must come from this fetched text, which is what lets the background engine verify that a
 * number was read rather than remembered.
 *
 * Sources fetched per medicine name:
 * - openFDA drug label (set id + the sections background modules draw from)
 * - PubChem compound properties (CID, formula, weight) + CAS via synonyms
 * - RxNorm RxCUI
 *
 * Usage: tsx scripts/background/fetch-medicine-sources.ts <outDir> <slug:queryName> [...]
 * The query name may differ from the slug (e.g. "insulin-glargine:insulin glargine").
 */

const LABEL_SECTIONS = [
  'indications_and_usage',
  'dosage_and_administration',
  'dosage_forms_and_strengths',
  'clinical_pharmacology',
  'pharmacokinetics',
  'clinical_studies',
  'how_supplied',
  'contraindications',
] as const

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) })
    if (!response.ok) return null
    return (await response.json()) as unknown
  } catch {
    return null
  }
}

function firstString(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value.join('\n')
  return null
}

async function fetchOne(slug: string, query: string) {
  const encoded = encodeURIComponent(query)
  const exactSearch = `openfda.generic_name:%22${encodeURIComponent(query.toUpperCase())}%22`
  const label = (await fetchJson(
    `https://api.fda.gov/drug/label.json?search=${exactSearch}&limit=1`,
  )) as { results?: Array<Record<string, unknown>> } | null
  const labelResult = label?.results?.[0] ?? null
  const openfda = (labelResult?.openfda ?? {}) as Record<string, unknown>

  const pubchem = (await fetchJson(
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encoded}/property/MolecularFormula,MolecularWeight/JSON`,
  )) as { PropertyTable?: { Properties?: Array<Record<string, unknown>> } } | null
  const pubchemProperties = pubchem?.PropertyTable?.Properties?.[0] ?? null

  let casNumber: string | null = null
  const cid = pubchemProperties?.CID
  if (typeof cid === 'number') {
    const synonyms = (await fetchJson(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/JSON`,
    )) as { InformationList?: { Information?: Array<{ Synonym?: string[] }> } } | null
    const list = synonyms?.InformationList?.Information?.[0]?.Synonym ?? []
    casNumber = list.find((entry) => /^\d{2,7}-\d{2}-\d$/u.test(entry)) ?? null
  }

  const rxnorm = (await fetchJson(
    `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encoded}&search=1`,
  )) as { idGroup?: { rxnormId?: string[] } } | null

  const sections: Record<string, string> = {}
  for (const section of LABEL_SECTIONS) {
    const text = firstString(labelResult?.[section])
    if (text) sections[section] = text
  }

  return {
    slug,
    query,
    fetchedAt: new Date().toISOString().slice(0, 10),
    label: labelResult
      ? {
          setId: (labelResult.set_id as string) ?? null,
          brandNames: (openfda.brand_name as string[]) ?? [],
          genericNames: (openfda.generic_name as string[]) ?? [],
          routes: (openfda.route as string[]) ?? [],
          unii: ((openfda.unii as string[]) ?? [])[0] ?? null,
          effectiveTime: (labelResult.effective_time as string) ?? null,
          sections,
        }
      : null,
    pubchem: pubchemProperties
      ? {
          cid: String(pubchemProperties.CID ?? ''),
          molecularFormula: (pubchemProperties.MolecularFormula as string) ?? null,
          molecularWeight: (pubchemProperties.MolecularWeight as string) ?? null,
          casNumber,
        }
      : null,
    rxcui: rxnorm?.idGroup?.rxnormId?.[0] ?? null,
  }
}

async function main() {
  const [outDir, ...pairs] = process.argv.slice(2)
  if (!outDir || pairs.length === 0) {
    console.error(
      'Usage: tsx scripts/background/fetch-medicine-sources.ts <outDir> <slug[:queryName]> [...]',
    )
    process.exit(1)
  }
  mkdirSync(outDir, { recursive: true })
  for (const pair of pairs) {
    const [slug, query] = pair.split(':')
    if (!slug) continue
    const artifact = await fetchOne(slug, query ?? slug.replaceAll('-', ' '))
    const path = join(outDir, `${slug}.json`)
    writeFileSync(path, JSON.stringify(artifact, null, 2))
    console.log(
      `[fetch] ${slug}: label=${artifact.label ? 'yes' : 'no'} pubchem=${artifact.pubchem ? artifact.pubchem.cid : 'no'} rxcui=${artifact.rxcui ?? 'no'}`,
    )
    await new Promise((resolve) => setTimeout(resolve, 350))
  }
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
