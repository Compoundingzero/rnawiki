/**
 * Human-readable source briefs. Drafts are for local quality review only and must never be
 * promoted to the public dossier by a deployment flag without qualified medical sign-off.
 */
export interface BriefSource {
  label: string
  url: string
}

export interface BriefLine {
  text: string
  source: BriefSource
  secondarySource?: BriefSource
}

export interface BriefStudy {
  question: string
  finding: BriefLine
  boundary: string
}

export interface DossierEditorialBrief {
  slug: string
  identity: BriefLine
  whyPeopleLook: BriefLine
  mechanism: BriefLine
  bottomLine: BriefLine
  safety: BriefLine[]
  studies: BriefStudy[]
  interactions: BriefLine[]
  productChecks: BriefLine[]
}

const ODS: BriefSource = {
  label: 'NIH Office of Dietary Supplements: magnesium',
  url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
}
const PUBCHEM: BriefSource = {
  label: 'PubChem CID 84645: magnesium glycinate identity',
  url: 'https://pubchem.ncbi.nlm.nih.gov/compound/84645',
}
const NCCIH_SLEEP: BriefSource = {
  label: 'NIH NCCIH: magnesium supplements and sleep',
  url: 'https://www.nccih.nih.gov/health/in-the-news-magnesium-supplements-for-sleep-disorders',
}
const SCHUETTE: BriefSource = {
  label: 'Schuette et al., 1994, randomized crossover study',
  url: 'https://pubmed.ncbi.nlm.nih.gov/7815675/',
}
const COCHRANE: BriefSource = {
  label: 'Cochrane review: magnesium for muscle cramps',
  url: 'https://www.cochrane.org/evidence/CD009402_magnesium-muscle-cramps',
}
const ABBASI: BriefSource = {
  label: 'Abbasi et al., 2012, insomnia trial',
  url: 'https://pubmed.ncbi.nlm.nih.gov/23853635/',
}
const BALCHEM: BriefSource = {
  label: 'Balchem: magnesium lysinate glycinate chelate identity',
  url: 'https://balchem.com/hnh/products/mn/mg/mg-lycinate-glycinate-chelate/',
}

export const MAGNESIUM_GLYCINATE_DRAFT: DossierEditorialBrief = {
  slug: 'magnesium-glycinate',
  identity: {
    text: 'Magnesium glycinate is a supplement form that joins magnesium to glycine. Magnesium is a mineral your body needs; the name of the form is not proof that it helps sleep or cramps.',
    source: PUBCHEM,
  },
  whyPeopleLook: {
    text: 'Magnesium has become popular for sleep. This form can supply magnesium, but the name on a bottle does not tell you whether it improves insomnia.',
    source: NCCIH_SLEEP,
  },
  mechanism: {
    text: 'Think of magnesium as a helper that lets nerve cells, muscles and many enzymes do their jobs. The gut absorbs it and the kidneys help control how much stays in the body.',
    source: ODS,
  },
  bottomLine: {
    text: 'The direct form comparison measured absorption in 12 people with intestinal surgery. It did not test whether magnesium glycinate improves sleep or cramps.',
    source: SCHUETTE,
  },
  safety: [
    {
      text: 'Supplemental magnesium can cause diarrhoea, nausea and stomach cramps. Very high amounts can be dangerous.',
      source: ODS,
    },
    {
      text: 'Kidney disease makes excess magnesium more concerning because the kidneys normally clear it.',
      source: ODS,
    },
  ],
  studies: [
    {
      question: 'Is glycinate absorbed better than magnesium oxide?',
      finding: {
        text: 'In 12 people with a surgically shortened intestine, a diglycinate chelate and magnesium oxide had similar average absorption: 23.5% versus 22.8%. Four people who absorbed oxide poorly did better with the chelate.',
        source: SCHUETTE,
      },
      boundary:
        'This measured absorption, not sleep or cramps. The people had intestinal surgery; the result cannot simply be applied to healthy adults or to lysinate glycinate.',
    },
    {
      question: 'Does magnesium prevent ordinary night cramps?',
      finding: {
        text: 'A Cochrane review of 11 trials found magnesium unlikely to make a meaningful difference to cramps in older adults.',
        source: COCHRANE,
      },
      boundary:
        'The review pooled magnesium forms. It did not establish a separate benefit for glycinate, and it found no trials of exercise cramps.',
    },
    {
      question: 'Does it help sleep?',
      finding: {
        text: 'One small trial in 46 older people with insomnia tested magnesium oxide, not glycinate. Some sleep questionnaire measures improved against placebo, but that does not answer whether glycinate helps a younger healthy person.',
        source: ABBASI,
      },
      boundary:
        'The form and people differ from many supplement buyers. A small result in a different product is a question to investigate, not a glycinate verdict.',
    },
  ],
  interactions: [
    {
      text: 'Magnesium can reduce absorption of some oral antibiotics and osteoporosis medicines. Ask a pharmacist to check the exact medicine rather than assuming the pair is harmless.',
      source: ODS,
    },
  ],
  productChecks: [
    {
      text: 'Read “magnesium” on the Supplement Facts panel. That number is elemental magnesium, not the weight of the entire glycinate compound.',
      source: ODS,
    },
    {
      text: 'Magnesium lysinate glycinate also names lysine. It is a different labelled ingredient; do not transfer the 12-person diglycinate finding to it.',
      source: BALCHEM,
      secondarySource: SCHUETTE,
    },
  ],
}

export function draftBriefForSlug(slug: string): DossierEditorialBrief | null {
  return slug === MAGNESIUM_GLYCINATE_DRAFT.slug ? MAGNESIUM_GLYCINATE_DRAFT : null
}
