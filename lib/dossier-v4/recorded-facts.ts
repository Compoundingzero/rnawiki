/**
 * The register facts the corpus holds, as sentences the medicine page can print.
 *
 * The `medicine-background/v1` envelope has twenty-five modules. Seven of them carry label prose and
 * reach the page through `recorded-label.ts`. The other eighteen carry counts, names, dates and
 * identifiers read out of public registers, and until now they reached the page through
 * `components/MedicineRecordContextSections.tsx` — a component of the old medicine layout. Removing
 * that layout removed their only reader surface, and the corpus holds a great deal of them:
 * 7,126 medicines with a recorded source material, 6,741 with registry identifiers, 5,998 with a
 * product listing, 5,941 with a label count, 5,350 with a supplement-market record, 3,887 with a
 * supplement ingredient classification, 3,251 with a molecular identity, 2,999 with a biological
 * identity, 2,542 with an approval record.
 *
 * Every sentence here is assembled from recorded values — a count, a date, a name, a classification
 * — and says only what the register states. None of it is prose about the substance, and none of it
 * is inferred: where the recorded fields do not support a sentence, no sentence is produced. The
 * counts enter the page with the `derived_count` origin, which is the page's existing label for a
 * number RNAWiki worked out by counting stored rows, and the quoted label text with `stored_source`.
 *
 * The wording is deliberately careful about what a count means. That 212 products list a substance
 * is a fact about a product directory, not about whether the substance works, and the sentences say
 * the first thing rather than implying the second.
 */
import { ANATOMY_REGIONS } from '@/lib/background/anatomy-regions'
import type { SourceCitation } from '@/lib/dossier-v3/fields'
import type { BackgroundSource, MedicineRecordedBackground } from '@/lib/background/types'

export interface RecordedFact {
  text: string
  citation: SourceCitation
  /** `derived_count` for a number RNAWiki counted, `stored_source` for text a document printed. */
  origin: 'derived_count' | 'stored_source'
}

const SOURCE_LABELS: Record<string, string> = {
  FDA_LABEL: 'US prescribing information',
  DAILYMED: 'DailyMed label archive',
  EMA_SMPC: 'EMA product information',
  PUBMED: 'Peer-reviewed publication',
  CLINICALTRIALS: 'ClinicalTrials.gov record',
  PUBCHEM: 'PubChem record',
  RXNORM: 'RxNorm record',
  FDA_DRUGSFDA: 'Drugs@FDA application register',
  FDA_NDC: 'FDA National Drug Code directory',
  DSLD: 'NIH Dietary Supplement Label Database',
  GSRS: 'FDA Global Substance Registration System',
  NCBI_TAXONOMY: 'NCBI Taxonomy',
  WHO_INN: 'WHO International Nonproprietary Names list',
  CHEMBL: 'ChEMBL',
}

function citationFor(source: BackgroundSource | undefined): SourceCitation {
  const kind = String((source as { kind?: string } | undefined)?.kind ?? '')
  const identifier = String((source as { identifier?: string } | undefined)?.identifier ?? '')
  const retrievedAt = (source as { retrievedAt?: string } | undefined)?.retrievedAt
  return {
    label: SOURCE_LABELS[kind] ?? 'Recorded source',
    ...(identifier ? { id: identifier } : {}),
    ...(retrievedAt ? { date: retrievedAt } : {}),
    binding: 'record',
  }
}

/** "a, b and c" — the house list form, so a reader never meets a bare comma-separated dump. */
function readerList(values: readonly string[], limit = 6): string {
  const kept = [
    ...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean)),
  ].slice(0, limit)
  if (kept.length === 0) return ''
  if (kept.length === 1) return kept[0]!
  return `${kept.slice(0, -1).join(', ')} and ${kept.at(-1)!}`
}

/** A count, written the way a person says it. */
function plural(count: number, one: string, many: string): string {
  return count === 1 ? `1 ${one}` : `${count} ${many}`
}

type Envelope = MedicineRecordedBackground

export interface RecordedFacts {
  /** What the substance is and where it comes from. */
  identity: RecordedFact[]
  /** Where in the body a source records it acting. */
  anatomy: RecordedFact[]
  /** How the amount was stepped, exactly as a protocol or label sets it out. */
  titration: RecordedFact[]
  /**
   * Results from the trial the record singles out, quoted as published.
   *
   * The envelope stores these under `pivotalResults`. "Pivotal" is the regulator's word for the
   * trial an approval rested on, and it is not a word to put in front of a reader without saying
   * what it means, so the reader-facing name says what the field is: the one trial this record
   * names, with its published numbers.
   */
  namedTrial: RecordedFact[]
  /** Who a named study included and excluded, as recorded. */
  studyPopulation: RecordedFact[]
  /** What is sold that contains it, and in what shape. */
  supply: RecordedFact[]
  /** What a regulator has done about it. */
  regulatory: RecordedFact[]
  /** What labels state about particular groups of people. */
  populations: RecordedFact[]
  /** How many documents RNAWiki read, and how far they agreed. */
  corroboration: RecordedFact[]
  /** Register identifiers, for a reader checking the record against its sources. */
  identifiers: Array<{ label: string; value: string }>
  identifierCitation: SourceCitation | null
}

export const EMPTY_RECORDED_FACTS: RecordedFacts = {
  identity: [],
  anatomy: [],
  titration: [],
  namedTrial: [],
  studyPopulation: [],
  supply: [],
  regulatory: [],
  populations: [],
  corroboration: [],
  identifiers: [],
  identifierCitation: null,
}

function identityFacts(envelope: Envelope): RecordedFact[] {
  const facts: RecordedFact[] = []

  const material = envelope.sourceMaterial
  if (material) {
    const citation = citationFor(material.source)
    /*
     * The registry's classification, said plainly. "Structurally diverse" and "mixture" are its own
     * words for kinds of substance, and they are quoted rather than translated, because translating
     * a classification is how a classification becomes a claim.
     */
    facts.push({
      text: `The substance registry classes this as ${material.substanceClassAsRecorded.toLowerCase()}.`,
      citation,
      origin: 'derived_count',
    })
    if (material.parentSubstanceAsRecorded) {
      const part = material.partsAsRecorded.length
        ? ` The part recorded is ${readerList(material.partsAsRecorded)}.`
        : ''
      facts.push({
        text: `It is recorded as coming from ${material.parentSubstanceAsRecorded}.${part}`,
        citation,
        origin: 'derived_count',
      })
    } else if (material.sourceMaterialTypeAsRecorded) {
      facts.push({
        text: `The material is recorded as coming from ${material.sourceMaterialTypeAsRecorded.toLowerCase()}.`,
        citation,
        origin: 'derived_count',
      })
    }
  }

  const organism = envelope.biologicalIdentity
  if (organism) {
    const common = organism.commonNamesAsRecorded.length
      ? ` It is also called ${readerList(organism.commonNamesAsRecorded, 3)}.`
      : ''
    facts.push({
      text: `The organism is ${organism.scientificName}, a ${organism.rankAsRecorded.toLowerCase()}.${common}`,
      citation: citationFor(organism.source),
      origin: 'derived_count',
    })
  }

  const ingredient = envelope.supplementIngredient
  if (ingredient && ingredient.categoriesAsRecorded.length > 0) {
    facts.push({
      text: `The supplement label database classes it as ${readerList(
        ingredient.categoriesAsRecorded,
      )}, under the name ${ingredient.groupNameAsRecorded}.`,
      citation: citationFor(ingredient.source),
      origin: 'derived_count',
    })
  }

  const molecule = envelope.molecularIdentity
  const formula = molecule?.molecularFormula
  const weight = molecule?.molecularWeight
  if (formula?.display) {
    const withWeight = weight?.display ? `, weighing ${weight.display}` : ''
    facts.push({
      text: `Its recorded molecular formula is ${formula.display}${withWeight}.`,
      citation: citationFor(formula.source),
      origin: 'derived_count',
    })
  }

  const composition = envelope.composition
  if (composition && composition.declaredIngredientCount > 1) {
    /*
     * A multi-ingredient product is the case where nothing on a page can be attributed to one
     * substance. Saying how many ingredients there are, and how many of them RNAWiki holds nothing
     * about on their own, is the honest frame for everything else the page shows.
     */
    const names = composition.ingredients.map((ingredient) => ingredient.nameAsRecorded)
    const unknown =
      composition.ingredientsWithoutSubstanceData > 0
        ? ` RNAWiki holds no source about ${composition.ingredientsWithoutSubstanceData} of them on its own.`
        : ''
    facts.push({
      text: `The label declares ${composition.declaredIngredientCount} active ingredients: ${readerList(
        names,
        8,
      )}.${unknown}`,
      citation: { label: 'Recorded product composition', binding: 'record' },
      origin: 'derived_count',
    })
  }

  const family = envelope.nameFamily
  if (family && family.memberCount > 1) {
    facts.push({
      text: `${family.memberCount} registered substances share the start of this name, which is why a search for it can return more than one thing.`,
      citation: citationFor(family.source),
      origin: 'derived_count',
    })
  }

  return facts
}

function supplyFacts(envelope: Envelope): RecordedFact[] {
  const facts: RecordedFact[] = []

  const listing = envelope.productListing
  if (listing && listing.productCount > 0) {
    const citation = citationFor(listing.source)
    const alone =
      listing.singleIngredientProductCount > 0
        ? ` ${listing.singleIngredientProductCount} of them contain it and nothing else.`
        : ' None of them contains it on its own, so nothing on this page can separate it from what it is combined with.'
    facts.push({
      text: `${plural(
        listing.productCount,
        'product lists',
        'products list',
      )} this as an active ingredient in the United States drug directory.${alone}`,
      citation,
      origin: 'derived_count',
    })
    if (listing.dosageFormsAsRecorded.length > 0) {
      facts.push({
        text: `They are sold as ${readerList(listing.dosageFormsAsRecorded)}${
          listing.routesAsRecorded.length > 0
            ? `, taken ${readerList(listing.routesAsRecorded, 4)}`
            : ''
        }.`,
        citation,
        origin: 'derived_count',
      })
    }
    if (listing.pharmacologicClassesAsRecorded.length > 0) {
      facts.push({
        text: `The regulator's established pharmacologic class for it is ${readerList(
          listing.pharmacologicClassesAsRecorded,
          3,
        )}.`,
        citation,
        origin: 'derived_count',
      })
    }
  }

  const labels = envelope.labelPresence
  if (labels && labels.labelCount > 0) {
    const citation = citationFor(labels.source)
    const single =
      labels.singleSubstanceLabelCount > 0
        ? `${labels.singleSubstanceLabelCount} of them describe this substance alone, which is where its own label text on this page comes from.`
        : 'None of them describes this substance alone, so no label text on this page can be attributed to it rather than to a combination.'
    facts.push({
      text: `${plural(
        labels.labelCount,
        'published label names',
        'published labels name',
      )} it as an active ingredient. ${single}`,
      citation,
      origin: 'derived_count',
    })
    if (labels.productTypesAsRecorded.length > 0) {
      facts.push({
        text: `Those labels are classed as ${readerList(labels.productTypesAsRecorded, 4)}.`,
        citation,
        origin: 'derived_count',
      })
    }
  }

  const market = envelope.supplementMarket
  if (market && market.labelCount > 0) {
    const citation = citationFor(market.source)
    facts.push({
      text: `${plural(
        market.labelCount,
        'marketed supplement label lists',
        'marketed supplement labels list',
      )} this ingredient${
        market.categoriesAsRecorded.length > 0
          ? `, classed as ${readerList(market.categoriesAsRecorded, 4)}`
          : ''
      }.`,
      citation,
      origin: 'derived_count',
    })
    if (market.claimTypesAsRecorded.length > 0) {
      /*
       * The distinction this sentence has to carry: a structure/function claim is written by the
       * manufacturer and reviewed by nobody. Recording that such claims appear is not recording that
       * they are true, and the sentence says so rather than leaving a reader to assume otherwise.
       */
      facts.push({
        text: `Those labels carry ${readerList(
          market.claimTypesAsRecorded,
          3,
        )} claims. A claim of that kind is written by the manufacturer and is not assessed by any regulator, so its presence says nothing about whether it is true.`,
        citation,
        origin: 'derived_count',
      })
    }
  }

  for (const variant of envelope.productVariants ?? []) {
    facts.push({
      text: `${variant.brandName} is ${variant.formAsRecorded.toLowerCase()}${
        variant.strengthsAsRecorded ? ` at ${variant.strengthsAsRecorded}` : ''
      }, recorded as ${variant.statusAsRecorded.toLowerCase()} in ${variant.jurisdiction}.`,
      citation: citationFor(variant.source),
      origin: 'derived_count',
    })
  }

  for (const cost of envelope.costContext ?? []) {
    const range =
      cost.amountHigh && cost.amountHigh !== cost.amountLow
        ? `${cost.amountLow}–${cost.amountHigh}`
        : String(cost.amountLow)
    facts.push({
      text: `Recorded price in ${cost.jurisdiction}: ${range} ${cost.currency} per ${cost.per}, as of ${cost.asOf}, paid by ${cost.whoPaysAsRecorded}.`,
      citation: citationFor(cost.source),
      origin: 'derived_count',
    })
  }

  return facts
}

function regulatoryFacts(envelope: Envelope): RecordedFact[] {
  const facts: RecordedFact[] = []
  const approval = envelope.regulatoryApproval
  if (approval && approval.applicationCount > 0) {
    const citation = citationFor(approval.source)
    const first =
      approval.earliestOriginalApprovalDate && approval.earliestApplicationNumber
        ? ` The earliest was ${approval.earliestApplicationNumber}, approved ${approval.earliestOriginalApprovalDate}${
            approval.earliestSponsorAsRecorded ? ` to ${approval.earliestSponsorAsRecorded}` : ''
          }.`
        : ''
    facts.push({
      text: `${plural(
        approval.applicationCount,
        'approved application covers',
        'approved applications cover',
      )} products containing this substance.${first}`,
      citation,
      origin: 'derived_count',
    })
    if (approval.marketingStatusesAsRecorded.length > 0) {
      /*
       * A discontinued medicine is the case this whole module was added for. Its label is no longer
       * published, so the label archive holds nothing, and a page that said only "nothing found"
       * would be describing a search rather than a medicine. The register still records that it was
       * approved and that it is no longer marketed, and both of those are real content.
       */
      facts.push({
        text: `Marketing status on the register: ${readerList(
          approval.marketingStatusesAsRecorded,
          4,
        )}.`,
        citation,
        origin: 'derived_count',
      })
    }
  }

  const listing = envelope.productListing
  if (listing?.earliestMarketingStartDate) {
    facts.push({
      text: `The earliest marketing start date recorded for a listed product is ${listing.earliestMarketingStartDate}.`,
      citation: citationFor(listing.source),
      origin: 'derived_count',
    })
  }

  return facts
}

/** How a population code is named to a reader. Raw enum values never reach the page. */
const POPULATION_LABELS: Record<string, string> = {
  PREGNANCY: 'people who are pregnant',
  LACTATION: 'people who are breastfeeding',
  PAEDIATRIC: 'children',
  GERIATRIC: 'older people',
  RENAL_IMPAIRMENT: 'people with reduced kidney function',
  HEPATIC_IMPAIRMENT: 'people with reduced liver function',
  FEMALE: 'women',
  MALE: 'men',
}

function populationFacts(envelope: Envelope): RecordedFact[] {
  const seen = new Set<string>()
  const facts: RecordedFact[] = []
  for (const statement of envelope.populationStatements ?? []) {
    const text = statement.textAsRecorded.trim()
    if (!text || seen.has(text)) continue
    seen.add(text)
    const who =
      POPULATION_LABELS[statement.population] ?? String(statement.population).toLowerCase()
    facts.push({
      // The label's own sentence, quoted, with the group it is about named in front of it.
      text: `On ${who}, the label states: “${text}”`,
      citation: citationFor(statement.source),
      origin: 'stored_source',
    })
    if (facts.length >= 6) break
  }
  return facts
}

function corroborationFacts(envelope: Envelope): RecordedFact[] {
  const consensus = envelope.sourceConsensus
  if (!consensus || consensus.documentsExamined === 0) return []
  /*
   * Only fields where more than one document actually stated the value, and where they agreed on it.
   * `agreementRate` is the share of stating sources carrying the most-supported reading, so a field
   * read by one document has a rate of 1 and means nothing; the count is what makes it worth saying.
   */
  const agreed = consensus.fields.filter(
    (field) => field.sourceCount > 1 && field.agreementRate >= 0.999,
  )
  const facts: RecordedFact[] = [
    {
      text: `${plural(
        consensus.documentsExamined,
        'document was',
        'documents were',
      )} read for this substance.`,
      citation: { label: 'RNAWiki source record', binding: 'record' },
      origin: 'derived_count',
    },
  ]
  for (const field of agreed.slice(0, 4)) {
    facts.push({
      text: `${field.sourceCount} of them state the same ${field.field}, and they agree.`,
      citation: { label: 'RNAWiki source record', binding: 'record' },
      origin: 'derived_count',
    })
  }
  return facts
}

function anatomyFacts(envelope: Envelope): RecordedFact[] {
  /*
   * A region code, turned into the vocabulary's own label. The code is never shown and the action is
   * never rewritten: what the source recorded about that region is quoted beside the region's name.
   */
  return (envelope.anatomyTargets ?? []).map((target) => ({
    text: `${ANATOMY_REGIONS[target.regionCode]?.label ?? target.regionCode}: ${target.actionAsRecorded}`,
    citation: citationFor(target.source),
    origin: 'stored_source' as const,
  }))
}

function titrationFacts(envelope: Envelope): RecordedFact[] {
  const titration = envelope.titration
  if (!titration || titration.steps.length === 0) return []
  const citation = citationFor(titration.source)
  const basis =
    titration.basis === 'LABEL_SCHEDULE'
      ? 'the schedule printed on the label'
      : 'the schedule a trial protocol used'
  const facts: RecordedFact[] = [
    {
      /*
       * The framing sentence has one job: to stop a stepped schedule reading as an instruction. This
       * page records what was done in a study or printed on a label. It never tells anyone what to
       * take, and a list of amounts without that sentence in front of it would.
       */
      text: `What follows is ${basis}, recorded as it is written there. It is a record of what was done, not a recommendation.`,
      citation,
      origin: 'derived_count',
    },
  ]
  for (const step of [...titration.steps].sort((a, b) => a.order - b.order)) {
    facts.push({
      text: `${step.periodAsRecorded}: ${step.amountAsRecorded}${
        step.purposeAsRecorded ? ` — ${step.purposeAsRecorded}` : ''
      }`,
      citation,
      origin: 'stored_source',
    })
  }
  return facts
}

function namedTrialFacts(envelope: Envelope): RecordedFact[] {
  return (envelope.pivotalResults ?? []).map((result) => {
    const comparator = result.comparatorResultAsRecorded
      ? ` against ${result.comparatorResultAsRecorded} in the comparison group`
      : ''
    const difference = result.differenceAsRecorded
      ? ` The recorded difference is ${result.differenceAsRecorded}`
      : ''
    const uncertainty = result.uncertaintyAsRecorded ? ` (${result.uncertaintyAsRecorded})` : ''
    return {
      text: `In ${result.trialIdentifier}, ${result.endpointAsRecorded} was ${result.activeResultAsRecorded}${comparator} at ${result.timepointAsRecorded}.${difference}${uncertainty}${difference ? '.' : ''}`,
      citation: citationFor(result.source),
      origin: 'stored_source' as const,
    }
  })
}

function studyPopulationFacts(envelope: Envelope): RecordedFact[] {
  const applicability = envelope.applicability
  if (!applicability) return []
  const citation = citationFor(applicability.source)
  const facts: RecordedFact[] = []
  if (applicability.studiedGroupAsRecorded) {
    facts.push({
      text: `${applicability.trialIdentifier} recorded its participants as: ${applicability.studiedGroupAsRecorded}.`,
      citation,
      origin: 'stored_source',
    })
  }
  if (applicability.includedAsRecorded.length > 0) {
    facts.push({
      text: `It included: ${applicability.includedAsRecorded.slice(0, 6).join('; ')}.`,
      citation,
      origin: 'stored_source',
    })
  }
  if (applicability.excludedAsRecorded.length > 0) {
    facts.push({
      text: `It excluded: ${applicability.excludedAsRecorded.slice(0, 6).join('; ')}.`,
      citation,
      origin: 'stored_source',
    })
  }
  return facts
}

const IDENTIFIER_LABELS: ReadonlyArray<{ key: string; label: string }> = [
  { key: 'unii', label: 'FDA substance identifier (UNII)' },
  { key: 'casNumber', label: 'CAS registry number' },
  { key: 'pubchemCid', label: 'PubChem compound' },
  { key: 'chemblId', label: 'ChEMBL' },
  { key: 'chebiId', label: 'ChEBI' },
  { key: 'atcCode', label: 'WHO anatomical therapeutic chemical code' },
  { key: 'innIdentifier', label: 'WHO international nonproprietary name list entry' },
  { key: 'rxcui', label: 'RxNorm concept' },
  { key: 'emaSubstanceId', label: 'EMA substance identifier' },
  { key: 'ecNumber', label: 'European Chemicals Agency number' },
  { key: 'ncbiTaxonomyId', label: 'NCBI taxonomy identifier' },
  { key: 'drugBankId', label: 'DrugBank' },
]

/**
 * Project the stored envelope into the facts a page can print.
 *
 * Nothing here decides what a section shows; it decides what is available for one to show. A caller
 * that receives an empty group renders nothing rather than a sentence about emptiness, because the
 * page already accounts for what is missing in one place.
 */
export function recordedFactsFor(
  background: MedicineRecordedBackground | null | undefined,
): RecordedFacts {
  if (!background) return EMPTY_RECORDED_FACTS
  const registry = background.registryIdentifiers
  const identifiers = registry
    ? IDENTIFIER_LABELS.flatMap(({ key, label }) => {
        const value = (registry as unknown as Record<string, string | undefined>)[key]
        return value ? [{ label, value }] : []
      })
    : []
  return {
    identity: identityFacts(background),
    anatomy: anatomyFacts(background),
    titration: titrationFacts(background),
    namedTrial: namedTrialFacts(background),
    studyPopulation: studyPopulationFacts(background),
    supply: supplyFacts(background),
    regulatory: regulatoryFacts(background),
    populations: populationFacts(background),
    corroboration: corroborationFacts(background),
    identifiers,
    identifierCitation: registry ? citationFor(registry.source) : null,
  }
}
