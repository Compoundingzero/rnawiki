import type { ConditionContext } from '@/lib/types'
import type { Literature } from './botanicals'
import { describeEvidence } from './botanical-context'

/**
 * The records that are none of the other things.
 *
 * After the label pass, the organism pass and the biosimilar pass there is a residue of a few
 * hundred: contrast agents withdrawn in the 1980s, antipsychotics that lost their approval,
 * antiperspirant salts, cosmetic peptides. They are real substances with real FDA listings and no
 * label section, no species and no parent molecule — every source the pipeline reads returns
 * nothing, so the page stayed a name and a modality.
 *
 * Two things can still be said truthfully. The FDA's own product records say how it was given and
 * whether anything is still marketed. Europe PMC says how much has been published about it. Neither
 * is a mechanism, and neither is presented as one: the point of a page like this is to tell a reader
 * that the silence is real rather than a gap in our pipeline.
 */

export interface SubstanceRecord {
  /** Routes of administration from the FDA product records, most common first. */
  routes: string[]
  dosageForms: string[]
  /** Marketing statuses across all products bearing this ingredient. */
  marketingStatuses: string[]
  productCount: number
  firstApprovalYear: number | null
}

export interface SubstanceContext {
  conditionContext: ConditionContext
  sources: string[]
}

function humanList(items: string[], max = 3): string {
  const kept = items.slice(0, max)
  if (kept.length === 0) return ''
  if (kept.length === 1) return kept[0] ?? ''
  return `${kept.slice(0, -1).join(', ')} and ${kept[kept.length - 1]}`
}

/**
 * FDA route codes into English, preposition included.
 *
 * The codes are not words: "given by oral, as tablet" is what you get from pasting them into a
 * sentence, and it is the kind of thing that tells a reader a machine wrote the page and nobody
 * read it afterwards.
 */
const ROUTE_PHRASES: Record<string, string> = {
  ORAL: 'by mouth',
  INTRAVENOUS: 'into a vein',
  INTRAMUSCULAR: 'by injection into a muscle',
  SUBCUTANEOUS: 'by injection under the skin',
  TOPICAL: 'on the skin',
  TRANSDERMAL: 'through a skin patch',
  OPHTHALMIC: 'into the eye',
  OTIC: 'into the ear',
  NASAL: 'into the nose',
  RESPIRATORY: 'by inhaling it',
  'RESPIRATORY (INHALATION)': 'by inhaling it',
  INHALATION: 'by inhaling it',
  RECTAL: 'into the rectum',
  VAGINAL: 'into the vagina',
  SUBLINGUAL: 'under the tongue',
  BUCCAL: 'against the inside of the cheek',
  INTRATHECAL: 'into the fluid around the spinal cord',
  EPIDURAL: 'into the space around the spinal cord',
  INTRAVESICAL: 'into the bladder',
  INTRA_ARTICULAR: 'into a joint',
  'INTRA-ARTICULAR': 'into a joint',
  INTRAPERITONEAL: 'into the abdominal cavity',
  INTRAOCULAR: 'into the eye',
  IRRIGATION: 'as a rinse',
  DENTAL: 'onto the teeth or gums',
  PERCUTANEOUS: 'through the skin',
  PARENTERAL: 'by injection',
  INTRAUTERINE: 'into the womb',
  URETHRAL: 'into the urethra',
  INTRALESIONAL: 'into the lesion itself',
  INTRACAVERNOUS: 'by injection into the penis',
  SUBCONJUNCTIVAL: 'under the surface of the eye',
  INTRADERMAL: 'into the skin itself',
  INTRACARDIAC: 'into the heart',
  INTRAPLEURAL: 'into the space around the lungs',
  INTRASPINAL: 'into the spine',
  INTRAVENTRICULAR: 'into a chamber of the brain',
  INFILTRATION: 'by injection into the tissue being treated',
  'NOT APPLICABLE': '',
  UNKNOWN: '',
}

function routePhrase(route: string): string {
  const known = ROUTE_PHRASES[route.trim().toUpperCase()]
  if (known !== undefined) return known
  return `by the ${route.toLowerCase()} route`
}

/**
 * "INJECTION, SOLUTION" is a form and a qualifier joined by a comma; only the form belongs in a
 * sentence. Plurality follows the product count, because "in 148 products, as stick" is wrong in a
 * way a reader notices immediately.
 */
function formPhrase(form: string, plural: boolean): string {
  const head = (form.split(',')[0] ?? form).trim().toLowerCase()
  if (!head) return ''
  if (!plural) return /^[aeiou]/.test(head) ? `an ${head}` : `a ${head}`
  if (/(s|x|z|ch|sh)$/.test(head)) return `${head}es`
  if (/[^aeiou]y$/.test(head)) return `${head.slice(0, -1)}ies`
  return `${head}s`
}

/** What the FDA's product records say, stated as the record rather than as pharmacology. */
export function describeRecord(
  displayName: string,
  record: SubstanceRecord | null,
  isSupplement = false,
): string {
  if (!record || record.productCount === 0) {
    // A supplement is absent from the FDA's drug records because it was never submitted to them,
    // not because it left the market, and saying "the FDA's drug records carry no label for it"
    // implies a review that never happened. The difference is the whole point of the distinction.
    if (isSupplement) {
      return (
        `${displayName} is listed as an ingredient in the NIH Dietary Supplement Label Database ` +
        'and has no FDA drug record. Supplements are not reviewed by the FDA before they go on ' +
        'sale, so there is no approved label stating what this does, what it is for, or what it ' +
        'was tested against. The absence is how the category works, not a gap in this page.'
      )
    }
    // Why an FDA-listed ingredient's record is empty is not in the record. An earlier draft
    // guessed "that is usually what an ingredient looks like after every product has left the
    // market", which is one explanation of several and was being stated as the explanation.
    return (
      `The FDA's public drug records list ${displayName} as an active ingredient, but carry no ` +
      'prescribing label for it — no mechanism section, no indication, no dosage form. Ingredients ' +
      'reach that state for several reasons, and which one applies here is not recorded.'
    )
  }

  const parts: string[] = []
  const count = record.productCount
  parts.push(
    `The FDA's product records list ${displayName} as an active ingredient in ` +
      `${count.toLocaleString('en-GB')} ${count === 1 ? 'product' : 'products'}`,
  )
  const routes = record.routes.map(routePhrase).filter(Boolean)
  if (routes.length > 0) parts.push(`given ${humanList(routes)}`)
  const forms = record.dosageForms.map((form) => formPhrase(form, count !== 1)).filter(Boolean)
  if (forms.length > 0) parts.push(`as ${humanList(forms)}`)

  let sentence = `${parts.join(', ')}.`

  if (record.firstApprovalYear) {
    sentence += ` The earliest approval on file is ${record.firstApprovalYear}.`
  }

  // Whether anything is still sold is the single most useful fact on a page like this, and it is
  // the one a reader cannot get anywhere else without reading the Orange Book.
  //
  // Only claimed when the records say it. An earlier version asked whether any status looked like
  // an active one and treated everything else as discontinued, which filed 148 currently-sold
  // antiperspirants under "nothing containing it is currently marketed" because their status reads
  // "OTC monograph not final".
  const statuses = record.marketingStatuses.map((status) => status.toLowerCase())
  const allDiscontinued =
    statuses.length > 0 && statuses.every((status) => status.includes('discontinued'))
  if (allDiscontinued) {
    sentence +=
      ' Every product on file is marked discontinued, which means nothing containing it is ' +
      'currently marketed in the United States.'
  }

  sentence +=
    ' None of those records carry a mechanism section, so what the substance does is not stated ' +
    'here. That is a gap in the sources, not a judgement about the substance.'

  return sentence
}

export function substanceContext(
  displayName: string,
  literature: Literature | null,
  record: SubstanceRecord | null,
  isSupplement = false,
): SubstanceContext | null {
  if (!literature && !record && !isSupplement) return null

  const sources: string[] = []
  if (record) sources.push('openFDA Drugs@FDA', 'openFDA NDC Directory')
  else if (isSupplement) sources.push('NIH Dietary Supplement Label Database')
  if (literature) sources.push('Europe PMC')

  const evidence = literature
    ? describeEvidence({ taxonomy: null, literature, part: '' }, displayName)
    : ''

  return {
    conditionContext: {
      conditionExplainer: [describeRecord(displayName, record, isSupplement), evidence]
        .filter(Boolean)
        .join(' ')
        .trim(),
      // Why a reader should care is a judgement and stays a contributor's to make.
      whyItMatters: '',
      whoTakesThis: '',
      clinicalGoals: undefined,
    },
    sources,
  }
}
