import type { ConditionContext } from '@/lib/types'
import type { BotanicalFacts } from './botanicals'

/**
 * Turns the botanical facts into the fields a page renders.
 *
 * These sentences are assembled from values, not composed: a species name, a family, a plant part,
 * three counts. That is a deliberate limit. Nothing here characterises what the plant does, because
 * nothing in either source says — and for most of these substances no source anywhere does, which
 * is the finding rather than a gap in the pipeline.
 *
 * The counts are the useful part. "Thirty years of publication and no controlled trial in humans"
 * is a real statement about the evidence, and it is one a reader cannot get from a supplement label.
 */

export interface BotanicalContext {
  conditionContext: ConditionContext
  sources: string[]
}

function formatCount(n: number): string {
  return n.toLocaleString('en-GB')
}

/**
 * Which part was used, and why the answer is not a detail.
 *
 * The reason differs by kingdom, so the sentence does too. For a plant it is chemistry: the root
 * and the leaf of one species can be entirely different preparations. For an animal source it is
 * not — the earlier copy told readers that the root and leaf of a budgerigar feather carry
 * different chemistry, which is how you find out a rule was written for one case and applied to
 * every case.
 */
function partSentence(part: string, kingdom?: string): string {
  const stated = `The part used is the ${part}.`
  if (kingdom === 'Plantae' || kingdom === 'Fungi') {
    if (part === 'pollen')
      return `${stated} A pollen preparation is made from the pollen alone, not the whole plant.`
    return (
      `${stated} Which part matters: the root and the leaf of one species can carry entirely ` +
      'different chemistry.'
    )
  }
  return `${stated} It is a preparation of that tissue, not of the whole animal.`
}

/** What the literature actually contains, stated as counts rather than characterised. */
export function describeEvidence(facts: BotanicalFacts, displayName: string): string {
  const literature = facts.literature
  if (!literature || literature.total === 0) {
    return (
      `A search of the biomedical literature for ${displayName} returns no papers with that name ` +
      'in the title, abstract or keywords. That is not evidence that it does nothing; it means ' +
      'nobody has published on it under this name, and there is nothing here to summarise.'
    )
  }

  // "Papers about it", not "papers mentioning it": the search reads where a paper declares its
  // subject, not the reagent tables of every open-access article.
  const parts: string[] = [
    `Europe PMC indexes ${formatCount(literature.total)} ` +
      `${literature.total === 1 ? 'paper' : 'papers'} with ${displayName} in the ` +
      'title, abstract or keywords',
  ]

  if (literature.reviews > 0) {
    parts.push(
      `${formatCount(literature.reviews)} of them ` +
        `${literature.reviews === 1 ? 'a review' : 'reviews'}`,
    )
  }

  if (literature.clinicalTrials === 0) {
    parts.push('and none indexed as a clinical trial')
  } else if (literature.clinicalTrials === 1) {
    parts.push('and one indexed as a clinical trial')
  } else {
    parts.push(`and ${formatCount(literature.clinicalTrials)} indexed as clinical trials`)
  }

  let sentence = `${parts.join(', ')}.`

  if (literature.clinicalTrials === 0 && literature.total > 100) {
    sentence +=
      ' A large literature with no trial in it is usually laboratory and animal work, which ' +
      'establishes that something happens in a dish or a mouse and not that it happens in a person.'
  }

  const top = literature.topPaper
  if (top) {
    const where = [top.journal, top.year].filter(Boolean).join(', ')
    sentence += ` The most cited is "${top.title}"${where ? ` (${where})` : ''}.`
  }

  return sentence
}

export function botanicalContext(
  facts: BotanicalFacts,
  displayName: string,
  labelPurpose: string,
): BotanicalContext | null {
  const { taxonomy, part } = facts
  if (!taxonomy && !facts.literature) return null

  const sources: string[] = []
  const identity: string[] = []

  if (taxonomy) {
    // With a part in the name the record is not the organism, it is one tissue of it: "Acacia
    // Longifolia Pollen is Acacia longifolia" was equating the pollen with the tree.
    const family = taxonomy.family ? `, a member of the ${taxonomy.family} family` : ''
    identity.push(
      part
        ? `${displayName} comes from ${taxonomy.scientificName}${family}.`
        : `${displayName} is ${taxonomy.scientificName}${family}.`,
    )
    if (part) identity.push(partSentence(part, taxonomy.kingdom))
    sources.push('GBIF Backbone Taxonomy')
  }

  if (facts.literature) sources.push('Europe PMC')

  const explainer = [...identity, describeEvidence(facts, taxonomy?.canonicalName ?? displayName)]
    .join(' ')
    .trim()

  return {
    conditionContext: {
      conditionExplainer: explainer,
      // Nothing in a taxonomic record or a paper count says why a reader should care. That is a
      // judgement, and it is left for a contributor rather than assembled from a template.
      whyItMatters: '',
      whoTakesThis: labelPurpose,
      clinicalGoals: undefined,
    },
    sources,
  }
}
