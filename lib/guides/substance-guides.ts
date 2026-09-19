/**
 * Editorial drafts for search terms that are not single medicine identities.
 * These must not be indexed or released as reviewed medical guidance until signed off.
 */
export interface GuideFact {
  text: string
  sourceLabel: string
  sourceUrl: string
}

export interface SubstanceGuide {
  slug: string
  title: string
  searchLabel: string
  searchHint: string
  aliases: readonly string[]
  identity: GuideFact
  mechanism: GuideFact
  evidence: GuideFact
  importantLimit: GuideFact
  readerCheck: GuideFact
  related: readonly { label: string; href: string }[]
}

export const SUBSTANCE_GUIDES: readonly SubstanceGuide[] = [
  {
    slug: 'magnesium-lysinate-glycinate',
    title: 'Magnesium lysinate glycinate',
    searchLabel: 'Magnesium lysinate glycinate',
    searchHint: 'Specific magnesium chelate; not the same name as magnesium glycinate',
    aliases: [
      'magnesium lysinate glycinate',
      'magnesium lysinate gyclinate',
      'magnesium lycinate glycinate',
      'magnesium lysine glycine chelate',
    ],
    identity: {
      text: 'This is magnesium bound to two amino acids, lysine and glycine. Plain magnesium glycinate does not name lysine, so the two labels should not be silently treated as one ingredient.',
      sourceLabel: 'Balchem ingredient identity',
      sourceUrl: 'https://balchem.com/hnh/products/mn/mg/mg-lycinate-glycinate-chelate/',
    },
    mechanism: {
      text: 'Magnesium helps nerves, muscles and many enzymes work. The lysine and glycine name describes the form that carries it; it does not by itself prove a better health result.',
      sourceLabel: 'NIH Office of Dietary Supplements: magnesium',
      sourceUrl: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
    },
    evidence: {
      text: 'A small human absorption study compared magnesium diglycinate with magnesium oxide in 12 people whose intestines had been shortened. It did not test magnesium lysinate glycinate.',
      sourceLabel: 'Schuette et al., 1994, PubMed',
      sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/7815675/',
    },
    importantLimit: {
      text: 'The 12-person study found no overall absorption difference between diglycinate and oxide. It cannot establish that this lysinate-glycinate form improves sleep, cramps or performance.',
      sourceLabel: 'Schuette et al., 1994, PubMed',
      sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/7815675/',
    },
    readerCheck: {
      text: 'The Supplement Facts panel lists elemental magnesium—the magnesium itself—not the weight of the whole compound. Check the exact form and this number before comparing products or studies.',
      sourceLabel: 'NIH Office of Dietary Supplements: supplement forms and labels',
      sourceUrl: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
    },
    related: [{ label: 'Magnesium glycinate record', href: '/d/magnesium-glycinate' }],
  },
  {
    slug: 'biote-bhrt',
    title: 'BioTE and bioidentical hormone therapy',
    searchLabel: 'BioTE (BHRT)',
    searchHint: 'A brand and treatment approach, not one medicine',
    aliases: ['biote', 'bio te', 'biote bhrt', 'bhrt', 'bioidentical hormone therapy'],
    identity: {
      text: 'BioTE is a branded hormone-pellet programme, not the name of one molecule. The hormones, ingredients and formulation must be identified before evidence or risks can be matched to a treatment.',
      sourceLabel: 'BioTE: pellet therapy description',
      sourceUrl: 'https://biote.com/bioidentical-hormone-replacement-pellet-therapy',
    },
    mechanism: {
      text: 'Hormone therapy puts hormones into the body to address symptoms linked to changing hormone levels. A pellet is one delivery form; the form alone does not tell you whether the treatment helps.',
      sourceLabel: 'FDA: menopause and hormones',
      sourceUrl: 'https://www.fda.gov/consumers/womens-health-topics/menopause',
    },
    evidence: {
      text: 'Evidence for an FDA-approved hormone product must not be copied onto a custom-compounded pellet. The exact hormone, formulation, use and population matter.',
      sourceLabel: 'ACOG: compounded bioidentical menopausal hormone therapy',
      sourceUrl:
        'https://www.acog.org/clinical/clinical-guidance/clinical-consensus/articles/2023/11/compounded-bioidentical-menopausal-hormone-therapy',
    },
    importantLimit: {
      text: '“Bioidentical” is not proof that a preparation is safer or more effective. ACOG recommends FDA-approved menopausal hormone therapy over compounded versions when an approved option exists.',
      sourceLabel: 'ACOG: compounded bioidentical menopausal hormone therapy',
      sourceUrl:
        'https://www.acog.org/clinical/clinical-guidance/clinical-consensus/articles/2023/11/compounded-bioidentical-menopausal-hormone-therapy',
    },
    readerCheck: {
      text: 'Before comparing options, identify the exact hormones and whether the product is FDA-approved or compounded. Ask a clinician how that difference changes quality controls and risk information.',
      sourceLabel: 'FDA: compounded bioidentical hormones',
      sourceUrl:
        'https://www.fda.gov/drugs/human-drug-compounding/national-academies-science-engineering-and-medicine-nasem-study-clinical-utility-treating-patients',
    },
    related: [
      { label: 'Estradiol record', href: '/d/estradiol' },
      { label: 'Testosterone record', href: '/d/testosterone' },
    ],
  },
] as const

export function guideForSlug(slug: string): SubstanceGuide | null {
  return SUBSTANCE_GUIDES.find((guide) => guide.slug === slug) ?? null
}

export function searchSubstanceGuides(query: string): SubstanceGuide[] {
  const normalized = query
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, ' ')
  if (normalized.length < 3 || normalized === 'magnesium') return []
  return SUBSTANCE_GUIDES.filter((guide) =>
    guide.aliases.some((alias) => alias.includes(normalized) || normalized.includes(alias)),
  )
}

export function exactSubstanceGuideQuery(query: string): boolean {
  const normalized = query
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, ' ')
  return SUBSTANCE_GUIDES.some((guide) => guide.aliases.includes(normalized))
}
