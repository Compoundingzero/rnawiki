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
const SCHUETTE: BriefSource = {
  label: 'Schuette et al., 1994, randomized crossover study',
  url: 'https://pubmed.ncbi.nlm.nih.gov/7815675/',
}
const SCHUSTER_SLEEP: BriefSource = {
  label: 'Schuster et al., 2025, magnesium bisglycinate sleep trial',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12412596/',
}
/** One source-bound worked example shared by the dossier draft and /life-test. */
export const MAGNESIUM_SLEEP_STUDY = {
  source: SCHUSTER_SLEEP,
  registryUrl: 'https://drks.de/search/en/trial/DRKS00031494',
  claim: 'Magnesium bisglycinate helps people sleep better.',
  randomized: 155,
  primaryAnalysis: 153,
  ages: '18–65',
  durationWeeks: 4,
  measure: 'Insomnia Severity Index, a seven-question score about sleep problems and their impact',
  scoreDropMagnesium: 3.9,
  scoreDropPlacebo: 2.3,
  extraScoreDrop: 1.6,
  effectSize: 0.2,
  measuredByDevice: false,
  showedClearOtherQuestionnaireBenefit: false,
} as const
const COCHRANE: BriefSource = {
  label: 'Cochrane review: magnesium for muscle cramps',
  url: 'https://www.cochrane.org/evidence/CD009402_magnesium-muscle-cramps',
}
const BALCHEM: BriefSource = {
  label: 'Balchem: magnesium lysinate glycinate chelate identity',
  url: 'https://balchem.com/hnh/products/mn/mg/mg-lycinate-glycinate-chelate/',
}

export const MAGNESIUM_GLYCINATE_DRAFT: DossierEditorialBrief = {
  slug: 'magnesium-glycinate',
  identity: {
    text: 'Magnesium glycinate is magnesium joined to glycine, a building block of protein. Your body needs magnesium; this form’s name does not prove it helps sleep or cramps.',
    source: PUBCHEM,
  },
  whyPeopleLook: {
    text: 'People buy this form hoping it helps sleep. A 2025 trial tested magnesium bisglycinate against a look-alike pill in adults reporting poor sleep.',
    source: SCHUSTER_SLEEP,
  },
  mechanism: {
    text: 'Magnesium helps nerves and muscles work. It also helps tiny chemical workers inside cells do their jobs. Your gut takes it in; your kidneys help clear what your body does not need.',
    source: ODS,
  },
  bottomLine: {
    text: `In one ${MAGNESIUM_SLEEP_STUDY.durationWeeks}-week study, people taking magnesium bisglycinate reported a small extra drop in insomnia symptoms versus a look-alike pill. The study did not establish better sleep by an objective measure or better everyday functioning.`,
    source: SCHUSTER_SLEEP,
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
      question: 'Does magnesium bisglycinate help with poor sleep?',
      finding: {
        text: `Researchers randomly assigned ${MAGNESIUM_SLEEP_STUDY.randomized} adults aged ${MAGNESIUM_SLEEP_STUDY.ages} who reported poor sleep to magnesium bisglycinate or a look-alike pill for ${MAGNESIUM_SLEEP_STUDY.durationWeeks} weeks. The insomnia questionnaire score fell by ${MAGNESIUM_SLEEP_STUDY.scoreDropMagnesium} points in the magnesium group and ${MAGNESIUM_SLEEP_STUDY.scoreDropPlacebo} points in the other group: a small ${MAGNESIUM_SLEEP_STUDY.extraScoreDrop}-point average difference. The main analysis included ${MAGNESIUM_SLEEP_STUDY.primaryAnalysis} people.`,
        source: SCHUSTER_SLEEP,
      },
      boundary:
        'This was a self-reported symptom score, not a sleep-monitor result. Other sleep and daytime questionnaires did not show a clear difference between groups. The study does not establish lasting benefit or that a reader will feel noticeably better.',
    },
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
