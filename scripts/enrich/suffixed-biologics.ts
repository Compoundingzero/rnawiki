import type { ConditionContext } from '@/lib/types'

/**
 * The names that end in four letters after a hyphen: Denosumab-Kyqq, Tocilizumab-Anoh.
 *
 * That suffix is not part of the molecule. The FDA assigns a meaningless four-letter suffix to
 * every biological product so that two versions of the same protein can be told apart in a
 * prescription and in a safety report — the letters carry no information by design, precisely so
 * nobody reads a ranking into them.
 *
 * Which makes these records unusually easy to fill honestly. The stem before the hyphen names the
 * molecule, and the page for it very often already exists on this site with a full mechanism,
 * price and trial list. Saying "this is a version of denosumab, and here is denosumab" is a
 * complete and truthful answer, and it is the answer a reader arriving at Denosumab-Kyqq wants.
 */

/** `Denosumab-Kyqq` -> `denosumab`. Returns null for anything not shaped like a suffixed biologic. */
export function biologicStem(name: string): string | null {
  const match = /^([A-Za-z]{5,})-([A-Za-z]{4})$/.exec(name.trim())
  if (!match) return null
  const stem = match[1]?.toLowerCase()
  if (!stem) return null

  // Only for the INN stems the FDA actually applies this scheme to. Without this, ordinary
  // hyphenated names — "Guaifenesin-Codeine" would not match on length, but plenty of botanical
  // and chemical names do — get described as biosimilars of a molecule that does not exist.
  const BIOLOGIC_STEMS =
    /(mab|cept|ase|kin|stim|poetin|gase|parin|glucosidase|lysin|ximab|zumab|umab)$/
  return BIOLOGIC_STEMS.test(stem) ? stem : null
}

export interface SuffixedBiologicContext {
  conditionContext: ConditionContext
  sources: string[]
}

/**
 * `parent` is the matching record on this site, when one exists. It usually does, because the
 * unsuffixed molecule is the one with the approvals and the trials behind it.
 */
export function suffixedBiologicContext(
  displayName: string,
  stem: string,
  parent: { name: string; slug: string; indication: string } | null,
): SuffixedBiologicContext {
  const capitalised = stem.charAt(0).toUpperCase() + stem.slice(1)

  const explainer =
    `${displayName} is ${capitalised}. The four letters after the hyphen are a suffix the FDA ` +
    'assigns to every biological product so that two versions of the same protein can be told ' +
    'apart on a prescription and in a safety report. They are deliberately meaningless: the ' +
    'scheme was designed so that nobody could read quality or ranking into the letters.' +
    (parent
      ? ` The molecule itself, its mechanism and its evidence are on the ${parent.name} page.`
      : ' No separate record for the unsuffixed molecule exists on this site yet.')

  return {
    conditionContext: {
      conditionExplainer: explainer,
      whyItMatters: '',
      whoTakesThis: parent?.indication ?? '',
      clinicalGoals: undefined,
    },
    sources: ['FDA nonproprietary naming guidance for biological products'],
  }
}
