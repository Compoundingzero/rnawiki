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

/**
 * `Denosumab-Kyqq` -> `denosumab`, `Insulin Aspart-Szjj` -> `insulin aspart`.
 *
 * The stem may contain spaces. Requiring one word missed every two-word biological name the scheme
 * is applied to — insulin aspart, pegunigalsidase alfa, denileukin diftitox — and those are
 * precisely the records that stayed empty.
 *
 * Returns the candidate stem for anything shaped like a suffixed biologic. Whether it really is one
 * is decided by `isKnownBiologicStem` or by finding the molecule on this site; see the caller.
 */
export function biologicStem(name: string): string | null {
  const match = /^([A-Za-z][A-Za-z]*(?: [A-Za-z]+)*)-([A-Za-z]{4})$/.exec(name.trim())
  if (!match) return null
  const stem = match[1]?.toLowerCase()
  if (!stem || stem.replace(/ /g, '').length < 5) return null
  return stem
}

/**
 * The INN stems the FDA actually applies the four-letter scheme to.
 *
 * This is the evidence of last resort. It is checked only when the molecule has no record on this
 * site, because an existing record IS the proof that the stem names a real drug, and it is better
 * proof than a suffix list — the list cannot know about `alfa`, `diftitox` or `aspart` without
 * being extended every time a new one is approved.
 */
export function isKnownBiologicStem(stem: string): boolean {
  return /(mab|cept|ase|kin|stim|poetin|gase|parin|lysin|alfa|beta|gamma|tope|tox)$/.test(stem)
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
  const capitalised = stem.replace(
    /(^|\s)([a-z])/g,
    (_, space: string, letter: string) => space + letter.toUpperCase(),
  )

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
