/**
 * The `molecular-properties/v1` dataset: computed physicochemical descriptors for every recorded
 * medicine that has a PubChem compound identifier.
 *
 * This dataset is unusual in the corpus because **nothing about it is authored**. Every value is
 * fetched mechanically from PubChem's computed-property service, keyed by the CID already recorded
 * in that medicine's `registryIdentifiers`. There is no wording to structure, no excerpt to trim
 * and no judgement to make — so there is nothing for a language model to get wrong, and a refresh
 * is a straight re-fetch and compare.
 *
 * What it is for: the chemist's and biotech researcher's view of the corpus. Descriptors like
 * molecular weight, lipophilicity, hydrogen-bond counts and polar surface area are the axes of
 * chemical space; recorded across ~130 medicines on one schema they support comparisons that a
 * per-drug page cannot.
 *
 * What it is not: a claim about whether a medicine works, is safe, or is well designed. The
 * rule-of-five summary below is a well-known arithmetic count of property thresholds, reported as
 * a count with its components — never as a verdict on a molecule.
 */

export const MOLECULAR_PROPERTIES_VERSION = 'molecular-properties/v1' as const

export interface MolecularPropertyRecord {
  version: typeof MOLECULAR_PROPERTIES_VERSION
  /** PubChem compound identifier this record was fetched by. */
  cid: string
  /** ISO date the descriptors were fetched from PubChem. */
  retrievedAt: string
  molecularFormula?: string
  /** g/mol as reported by PubChem. */
  molecularWeight?: number
  /** Computed octanol-water partition coefficient; the standard lipophilicity axis. */
  xLogP?: number
  hBondDonorCount?: number
  hBondAcceptorCount?: number
  rotatableBondCount?: number
  /** Topological polar surface area, Å². */
  tpsa?: number
  heavyAtomCount?: number
  /** PubChem's structural-complexity score. */
  complexity?: number
  /** Canonical connectivity SMILES exactly as PubChem returns it. */
  smiles?: string
  inchiKey?: string
}

export type MolecularPropertiesBySlug = Record<string, MolecularPropertyRecord>

/**
 * The four Lipinski property thresholds, counted. This is arithmetic over fetched descriptors and
 * a widely taught rule of thumb about oral absorption — not a quality score. Many effective
 * medicines exceed it by design, so the count is always shown with its components.
 */
export interface RuleOfFiveSummary {
  /** How many of the four thresholds this molecule exceeds (0 to 4). */
  exceededCount: number
  components: Array<{
    label: string
    value: number
    threshold: string
    exceeded: boolean
  }>
  /** False when any required descriptor is missing; the summary is then absent rather than partial. */
  complete: boolean
}

export function ruleOfFiveSummary(record: MolecularPropertyRecord): RuleOfFiveSummary | null {
  const { molecularWeight, xLogP, hBondDonorCount, hBondAcceptorCount } = record
  if (
    typeof molecularWeight !== 'number' ||
    typeof xLogP !== 'number' ||
    typeof hBondDonorCount !== 'number' ||
    typeof hBondAcceptorCount !== 'number'
  ) {
    return null
  }
  const components = [
    {
      label: 'Molecular weight',
      value: molecularWeight,
      threshold: 'at most 500 g/mol',
      exceeded: molecularWeight > 500,
    },
    {
      label: 'Lipophilicity (XLogP)',
      value: xLogP,
      threshold: 'at most 5',
      exceeded: xLogP > 5,
    },
    {
      label: 'Hydrogen-bond donors',
      value: hBondDonorCount,
      threshold: 'at most 5',
      exceeded: hBondDonorCount > 5,
    },
    {
      label: 'Hydrogen-bond acceptors',
      value: hBondAcceptorCount,
      threshold: 'at most 10',
      exceeded: hBondAcceptorCount > 10,
    },
  ]
  return {
    exceededCount: components.filter((component) => component.exceeded).length,
    components,
    complete: true,
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Chemical-space projections                                                                   */
/* ------------------------------------------------------------------------------------------- */

export interface ChemicalSpacePoint {
  slug: string
  name: string
  cid: string
  molecularWeight: number
  xLogP: number
  tpsa?: number
  heavyAtomCount?: number
  ruleOfFiveExceeded?: number
  retrievedAt: string
}

export interface ChemicalSpaceProjection {
  points: ChemicalSpacePoint[]
  coverage: { placed: number; considered: number }
  axes: {
    molecularWeight: { min: number; max: number }
    xLogP: { min: number; max: number }
  }
}

/**
 * The corpus plotted on its two most-used chemical-space axes: molecular weight against computed
 * lipophilicity. A medicine is placed only when PubChem returned both descriptors, so peptides,
 * antibodies and any compound without a computed record are simply absent.
 */
export function chemicalSpace(
  entries: ReadonlyArray<{ slug: string; name: string; record: MolecularPropertyRecord }>,
): ChemicalSpaceProjection {
  const points: ChemicalSpacePoint[] = []
  for (const { slug, name, record } of entries) {
    if (typeof record.molecularWeight !== 'number' || typeof record.xLogP !== 'number') continue
    const ruleOfFive = ruleOfFiveSummary(record)
    points.push({
      slug,
      name,
      cid: record.cid,
      molecularWeight: record.molecularWeight,
      xLogP: record.xLogP,
      ...(typeof record.tpsa === 'number' ? { tpsa: record.tpsa } : {}),
      ...(typeof record.heavyAtomCount === 'number'
        ? { heavyAtomCount: record.heavyAtomCount }
        : {}),
      ...(ruleOfFive ? { ruleOfFiveExceeded: ruleOfFive.exceededCount } : {}),
      retrievedAt: record.retrievedAt,
    })
  }
  points.sort(
    (left, right) =>
      left.molecularWeight - right.molecularWeight || left.slug.localeCompare(right.slug),
  )

  const weights = points.map((point) => point.molecularWeight)
  const logs = points.map((point) => point.xLogP)
  return {
    points,
    coverage: { placed: points.length, considered: entries.length },
    axes: {
      molecularWeight: {
        min: weights.length > 0 ? Math.min(...weights) : 0,
        max: weights.length > 0 ? Math.max(...weights) : 0,
      },
      xLogP: {
        min: logs.length > 0 ? Math.min(...logs) : 0,
        max: logs.length > 0 ? Math.max(...logs) : 0,
      },
    },
  }
}

export interface PropertyDistributionBin {
  label: string
  lowerInclusive: number
  upperExclusive: number | null
  count: number
  slugs: string[]
}

/**
 * Bins one numeric descriptor across the corpus using caller-supplied edges. Bin membership is
 * pure arithmetic, and every bin lists its members so a reader can go from a bar to the records.
 */
export function propertyDistribution(
  entries: ReadonlyArray<{ slug: string; record: MolecularPropertyRecord }>,
  property: 'molecularWeight' | 'xLogP' | 'tpsa' | 'rotatableBondCount' | 'complexity',
  edges: readonly number[],
): PropertyDistributionBin[] {
  const bins: PropertyDistributionBin[] = edges.map((edge, index) => {
    const upper = index + 1 < edges.length ? edges[index + 1]! : null
    return {
      label: upper === null ? `${edge} and above` : `${edge} to ${upper}`,
      lowerInclusive: edge,
      upperExclusive: upper,
      count: 0,
      slugs: [],
    }
  })

  for (const { slug, record } of entries) {
    const value = record[property]
    if (typeof value !== 'number') continue
    for (let index = bins.length - 1; index >= 0; index -= 1) {
      const bin = bins[index]!
      const withinUpper = bin.upperExclusive === null || value < bin.upperExclusive
      if (value >= bin.lowerInclusive && withinUpper) {
        bin.count += 1
        bin.slugs.push(slug)
        break
      }
    }
  }
  for (const bin of bins) bin.slugs.sort()
  return bins
}
