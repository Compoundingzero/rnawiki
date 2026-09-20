/**
 * Human-readable source briefs. Drafts are for local quality review only and must never be
 * promoted to the public dossier by a deployment flag without qualified medical sign-off.
 */
export interface BriefSource {
  marker: number
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
  visual?: 'magnesium-sleep-change'
  protocol?: string
  defaultVisible?: boolean
}

export interface BriefQuestion {
  question: string
  answer: BriefLine
}

export interface PopulationBoundary {
  studied: string[]
  notStudied: string[]
  source: BriefSource
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
  studyWords: BriefQuestion[]
  whyItMayFeelDifferent: BriefQuestion[]
  suppliedAs: BriefQuestion[]
  measures: BriefQuestion[]
  openQuestions: BriefQuestion[]
  populationBoundary: PopulationBoundary
  claimChecks: BriefQuestion[]
  evidenceTrail: BriefQuestion[]
  nextQuestions: BriefQuestion[]
}

const ODS: BriefSource = {
  marker: 2,
  label: 'NIH Office of Dietary Supplements: magnesium',
  url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
}
const PUBCHEM: BriefSource = {
  marker: 3,
  label: 'PubChem CID 84645: magnesium glycinate identity',
  url: 'https://pubchem.ncbi.nlm.nih.gov/compound/84645',
}
const SCHUETTE: BriefSource = {
  marker: 5,
  label: 'Schuette et al., 1994, randomized crossover study',
  url: 'https://pubmed.ncbi.nlm.nih.gov/7815675/',
}
const SCHUSTER_SLEEP: BriefSource = {
  marker: 1,
  label: 'Schuster et al., 2025, magnesium bisglycinate sleep trial',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12412596/',
}
const MAGNESIUM_SLEEP_REVIEW: BriefSource = {
  marker: 10,
  label: 'Lopresti et al., 2026, randomized-trial review of magnesium and sleep',
  url: 'https://doi.org/10.1080/19390211.2026.2719670',
}
/** One source-bound worked example shared by the dossier draft and /life-test. */
export const MAGNESIUM_SLEEP_STUDY = {
  source: SCHUSTER_SLEEP,
  registryUrl: 'https://drks.de/search/en/trial/DRKS00031494',
  claim: 'Magnesium bisglycinate helps people sleep better.',
  randomized: 155,
  primaryAnalysis: 153,
  completed: 134,
  ages: '18–65',
  womenPercentRounded: 80,
  durationWeeks: 4,
  studiedElementalMagnesiumMgDaily: 250,
  measure: 'Insomnia Severity Index, a seven-question score about sleep problems and their impact',
  scoreScaleMax: 28,
  scoreDropMagnesium: 3.9,
  scoreDropPlacebo: 2.3,
  extraScoreDrop: 1.6,
  extraScoreDropCiLow: 0,
  extraScoreDropCiHigh: 3.3,
  effectSize: 0.2,
  measuredByDevice: false,
  showedClearOtherQuestionnaireBenefit: false,
} as const
/** Values for a reusable two-arm outcome graphic; never infer these from prose. */
export const MAGNESIUM_SLEEP_CHART = {
  duration: `${MAGNESIUM_SLEEP_STUDY.durationWeeks} weeks`,
  outcome: `Self-rated insomnia score (0–${MAGNESIUM_SLEEP_STUDY.scoreScaleMax}); a larger drop means fewer problems`,
  axisMax: 5,
  arms: [
    { label: 'Magnesium bisglycinate', change: MAGNESIUM_SLEEP_STUDY.scoreDropMagnesium },
    { label: 'Look-alike pill', change: MAGNESIUM_SLEEP_STUDY.scoreDropPlacebo },
  ],
  difference: MAGNESIUM_SLEEP_STUDY.extraScoreDrop,
  interval: [MAGNESIUM_SLEEP_STUDY.extraScoreDropCiLow, MAGNESIUM_SLEEP_STUDY.extraScoreDropCiHigh],
  unit: 'points',
  caveat: 'These are questionnaire-score changes, not hours slept or the number of people helped.',
} as const
const COCHRANE: BriefSource = {
  marker: 4,
  label: 'Cochrane review: magnesium for muscle cramps',
  url: 'https://www.cochrane.org/evidence/CD009402_magnesium-muscle-cramps',
}
const BALCHEM: BriefSource = {
  marker: 6,
  label: 'Balchem: magnesium lysinate glycinate chelate identity',
  url: 'https://balchem.com/hnh/products/mn/mg/mg-lycinate-glycinate-chelate/',
}
const FDA_SUPPLEMENTS: BriefSource = {
  marker: 7,
  label: 'FDA: Questions and answers on dietary supplements',
  url: 'https://www.fda.gov/food/information-consumers-using-dietary-supplements/questions-and-answers-dietary-supplements',
}
const USP_VERIFICATION: BriefSource = {
  marker: 8,
  label: 'USP: Dietary supplement quality verification',
  url: 'https://www.usp.org/sites/default/files/usp/document/about/convention-membership/usp-ds-qual-pharmacists-fact-sheet.pdf',
}
const MAGNESIUM_SLEEP_REGISTRY: BriefSource = {
  marker: 9,
  label: 'German Clinical Trials Register: DRKS00031494',
  url: MAGNESIUM_SLEEP_STUDY.registryUrl,
}

export const MAGNESIUM_GLYCINATE_DRAFT: DossierEditorialBrief = {
  slug: 'magnesium-glycinate',
  identity: {
    text: 'Magnesium glycinate (also called bisglycinate) is magnesium bound to glycine. The form’s name does not prove a special sleep benefit.',
    source: PUBCHEM,
  },
  whyPeopleLook: {
    text: 'People often look at this form for sleep. A 2025 study compared it with a look-alike pill in adults who reported poor sleep.',
    source: SCHUSTER_SLEEP,
  },
  mechanism: {
    text: 'Magnesium helps nerve cells send signals, and glycine may affect them too. They might help the brain settle for sleep, but this trial measured sleep answers—not brain activity—so it did not prove how any change happened.',
    source: ODS,
    secondarySource: SCHUSTER_SLEEP,
  },
  bottomLine: {
    text: `For sleep: a ${MAGNESIUM_SLEEP_STUDY.durationWeeks}-week bisglycinate trial found a small extra drop in a self-rated insomnia score. A 2026 review of 12 sleep trials across magnesium forms found mixed results and rated the evidence low or very low certainty. It did not identify a best form.`,
    source: SCHUSTER_SLEEP,
    secondarySource: MAGNESIUM_SLEEP_REVIEW,
  },
  safety: [
    {
      text: 'Supplemental magnesium can cause diarrhoea, nausea and stomach cramps. Very high amounts can be dangerous.',
      source: ODS,
    },
    {
      text: 'If you have kidney disease, ask a clinician before using a magnesium supplement. Damaged kidneys may not clear excess magnesium well.',
      source: ODS,
    },
  ],
  studies: [
    {
      question: 'Does magnesium bisglycinate help with poor sleep?',
      finding: {
        text: `${MAGNESIUM_SLEEP_STUDY.randomized} generally healthy adults aged ${MAGNESIUM_SLEEP_STUDY.ages} with poor sleep were split by chance between magnesium bisglycinate and look-alike capsules. About ${MAGNESIUM_SLEEP_STUDY.womenPercentRounded}% were women. ${MAGNESIUM_SLEEP_STUDY.completed} finished the ${MAGNESIUM_SLEEP_STUDY.durationWeeks}-week study.`,
        source: SCHUSTER_SLEEP,
      },
      boundary:
        'The result comes from a self-rated questionnaire, not a sleep monitor. Separate daytime questionnaires did not show a clear benefit. Four weeks cannot tell us about long-term use or whether a particular person will feel better.',
      visual: 'magnesium-sleep-change',
      protocol: `The study used ${MAGNESIUM_SLEEP_STUDY.studiedElementalMagnesiumMgDaily} mg of elemental magnesium daily. ${MAGNESIUM_SLEEP_STUDY.primaryAnalysis} people were included in the main analysis. This describes the trial; it is not a suggested dose.`,
    },
    {
      question: 'Is glycinate absorbed better than magnesium oxide?',
      finding: {
        text: 'In 12 people with a surgically shortened intestine, a diglycinate chelate and magnesium oxide had similar average absorption: 23.5% versus 22.8%. Four people who absorbed oxide poorly did better with the chelate.',
        source: SCHUETTE,
      },
      boundary:
        'This measured absorption, not sleep or cramps. The people had intestinal surgery; the result cannot simply be applied to healthy adults or to lysinate glycinate.',
      defaultVisible: false,
    },
    {
      question: 'Does magnesium prevent ordinary night cramps?',
      finding: {
        text: 'A Cochrane review found magnesium unlikely to prevent night cramps in older adults. Five of its 11 trials studied this group.',
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
  studyWords: [
    {
      question: 'Compared with what?',
      answer: {
        text: 'Look-alike capsules containing cellulose, not magnesium. The useful comparison is the difference between groups, not just improvement within the magnesium group.',
        source: MAGNESIUM_SLEEP_REGISTRY,
        secondarySource: SCHUSTER_SLEEP,
      },
    },
    {
      question: 'What does “split by chance” mean here?',
      answer: {
        text: 'An independent researcher assigned participants to groups at random, while participants and investigators did not know the assignment during data collection.',
        source: MAGNESIUM_SLEEP_REGISTRY,
      },
    },
    {
      question: 'What is the extra change?',
      answer: {
        text: 'The magnesium group improved 1.6 more points on the 0–28 insomnia score than the look-alike-pill group, on average after four weeks. That is a score difference, not 1.6 more hours of sleep.',
        source: SCHUSTER_SLEEP,
      },
    },
    {
      question: 'How certain is that number?',
      answer: {
        text: 'The study’s 95% uncertainty interval for the extra change ran from 0.0 to 3.3 points. The lower end is essentially no extra score change.',
        source: SCHUSTER_SLEEP,
      },
    },
  ],
  whyItMayFeelDifferent: [
    {
      question: 'Feeling better does not prove the capsule did it',
      answer: {
        text: 'The look-alike-pill group also improved by 2.3 points. The extra average change with magnesium was 1.6 points. The trial cannot separate expectation, normal variation, and other reasons for the placebo group’s change.',
        source: SCHUSTER_SLEEP,
      },
    },
    {
      question: 'The study cannot predict one person’s response',
      answer: {
        text: 'It reported a small average difference between groups, not the chance that you personally notice a change. People with lower reported magnesium intake appeared to improve more, but that was an exploratory analysis using an unvalidated diet question.',
        source: SCHUSTER_SLEEP,
      },
    },
    {
      question: 'It might not change the thing you care about',
      answer: {
        text: 'The primary result was a sleep-problem questionnaire. Fewer than one in ten participants completed enough sleep-diary entries to interpret them, so this trial could not establish a change in actual sleep time.',
        source: SCHUSTER_SLEEP,
      },
    },
  ],
  suppliedAs: [
    {
      question: 'What form did the study test?',
      answer: {
        text: 'Two oral magnesium-bisglycinate capsules each day for four weeks, supplying 250 mg elemental magnesium and about 1.5 g glycine. This is a description of the study, not an instruction to take it.',
        source: MAGNESIUM_SLEEP_REGISTRY,
      },
    },
    {
      question: 'How is a U.S. supplement overseen?',
      answer: {
        text: 'The FDA does not approve dietary supplements before sale. Makers must follow manufacturing and labeling rules, and the FDA can act against unsafe or misbranded products. “Sold as a supplement” does not mean “checked for sleep benefit.”',
        source: FDA_SUPPLEMENTS,
      },
    },
    {
      question: 'How can a buyer check a particular bottle?',
      answer: {
        text: 'Match the ingredient name and elemental magnesium amount on its Supplement Facts panel. A voluntary third-party quality mark can check what is in a specific product; it does not prove that product improves sleep.',
        source: ODS,
        secondarySource: USP_VERIFICATION,
      },
    },
  ],
  measures: [
    {
      question: 'What changed in the trial?',
      answer: {
        text: 'The Insomnia Severity Index: seven questions scored from 0 to 28 about sleep trouble and its impact. Researchers compared the score before treatment with the score after four weeks.',
        source: SCHUSTER_SLEEP,
      },
    },
    {
      question: 'What would a watch or sleep diary add?',
      answer: {
        text: 'The trial did not use a sleep device. Its optional diary was too incomplete to analyze. A personal sleep-time graph therefore measures something different from this trial’s positive result; it cannot validate the sleep-duration claim.',
        source: SCHUSTER_SLEEP,
      },
    },
    {
      question: 'What about daytime energy?',
      answer: {
        text: 'The trial also asked about fatigue, mood, and other sleep measures. Those between-group results were not clearly different, so the primary score change cannot be translated into more energy or better daily functioning.',
        source: SCHUSTER_SLEEP,
      },
    },
  ],
  openQuestions: [
    {
      question: 'Why did some people leave the study?',
      answer: {
        text: 'At four weeks, 69 of 77 assigned magnesium and 65 of 78 assigned placebo had finished. The paper names stomach pain for two placebo withdrawals but gives no reason for the other 19. Its adverse-event table note conflicts with that account, so the exact stop reasons are not fully clear.',
        source: SCHUSTER_SLEEP,
      },
    },
    {
      question: 'Does it last beyond four weeks?',
      answer: {
        text: 'The bisglycinate trial ended after four weeks. The 2026 review included longer trials of other magnesium forms, but could not identify a best duration. Those trials do not show that the bisglycinate result lasts longer.',
        source: SCHUSTER_SLEEP,
        secondarySource: MAGNESIUM_SLEEP_REVIEW,
      },
    },
    {
      question: 'Is it safer or gentler than other forms?',
      answer: {
        text: 'Nine adverse events were reported in the 153-person main trial: two in the magnesium group and seven in the look-alike-pill group. No serious event was reported. Four weeks in a small selected group cannot establish rare harms or prove this form is safer than other magnesium products.',
        source: SCHUSTER_SLEEP,
        secondarySource: ODS,
      },
    },
    {
      question: 'Does low magnesium intake change the answer?',
      answer: {
        text: 'People reporting lower dietary intake appeared to improve more, but intake came from one unvalidated question and no magnesium-deficiency test was done. The 2026 review could not confirm that people with low intake benefit more.',
        source: SCHUSTER_SLEEP,
        secondarySource: MAGNESIUM_SLEEP_REVIEW,
      },
    },
  ],
  populationBoundary: {
    studied: ['Adults aged 18–65', 'Self-reported poor sleep'],
    notStudied: [
      'Severe kidney or liver disease, or concurrent cancer',
      'Treatment for a sleep disorder or depression',
      'Major schedule changes, including shift work',
    ],
    source: MAGNESIUM_SLEEP_REGISTRY,
  },
  claimChecks: [
    {
      question: 'Was the exact ingredient tested?',
      answer: {
        text: 'Yes for magnesium bisglycinate and the four-week sleep-score question. No for magnesium lysinate glycinate or an unspecified mixed-form product.',
        source: MAGNESIUM_SLEEP_REGISTRY,
        secondarySource: BALCHEM,
      },
    },
    {
      question: 'Was the sleep question chosen before results were known?',
      answer: {
        text: 'The public registration named the Insomnia Severity Index as the main outcome before recruitment began. The paper reported that outcome and a small between-group difference.',
        source: MAGNESIUM_SLEEP_REGISTRY,
        secondarySource: SCHUSTER_SLEEP,
      },
    },
    {
      question: 'What claim did that check not pass?',
      answer: {
        text: 'This trial did not establish longer sleep, better daytime performance, or that bisglycinate beats other forms. The 2026 review also could not identify a preferred magnesium form for sleep.',
        source: SCHUSTER_SLEEP,
        secondarySource: MAGNESIUM_SLEEP_REVIEW,
      },
    },
    {
      question: 'Who paid for and reported the study?',
      answer: {
        text: 'The authors report university-institute funding. One author disclosed leadership of a research company funded by nutraceutical firms and past industry honoraria. That does not erase the result, but it makes independent replication useful.',
        source: SCHUSTER_SLEEP,
      },
    },
  ],
  evidenceTrail: [
    {
      question: '12 April 2023 — plan made public',
      answer: {
        text: 'DRKS00031494 registered a four-week, placebo-controlled trial and named the insomnia score as its primary outcome before recruitment started on 20 April 2023.',
        source: MAGNESIUM_SLEEP_REGISTRY,
      },
    },
    {
      question: '14 July 2023 — trial completed',
      answer: {
        text: 'The registry records completion on this date and a final sample of 155 people. A finished trial is not a result until its measured outcomes are reported.',
        source: MAGNESIUM_SLEEP_REGISTRY,
      },
    },
    {
      question: '2025 — results published',
      answer: {
        text: 'The published report provides the group scores, uncertainty interval, secondary outcomes, limitations, and adverse-event table that this page uses.',
        source: SCHUSTER_SLEEP,
      },
    },
  ],
  nextQuestions: [
    {
      question: 'Could “more magnesium” make the result bigger?',
      answer: {
        text: 'This trial tested one amount for four weeks. It did not compare different amounts. Higher supplemental magnesium can cause digestive effects and, especially with kidney impairment, toxicity; the study is not a dose-finding guide.',
        source: SCHUSTER_SLEEP,
        secondarySource: ODS,
      },
    },
    {
      question: 'Can I swap in lysinate glycinate or magnesium oxide?',
      answer: {
        text: 'Not on the strength of this sleep trial. Lysinate glycinate names a different ingredient; the small oxide comparison measured absorption after intestinal surgery, not sleep.',
        source: BALCHEM,
        secondarySource: SCHUETTE,
      },
    },
    {
      question: 'Could a label’s quality seal prove the sleep claim?',
      answer: {
        text: 'No. Quality verification asks whether a product meets identity and manufacturing specifications. It does not turn a small questionnaire difference into proven sleep-duration or daily-life benefit.',
        source: USP_VERIFICATION,
        secondarySource: SCHUSTER_SLEEP,
      },
    },
  ],
}

export function draftBriefForSlug(slug: string): DossierEditorialBrief | null {
  return slug === MAGNESIUM_GLYCINATE_DRAFT.slug ? MAGNESIUM_GLYCINATE_DRAFT : null
}

/** An editorial preview never overrides a failed record identity or preparation check. */
export function eligibleDraftBriefForSlug(
  slug: string,
  publicationState: string,
  previewEnabled: boolean,
): DossierEditorialBrief | null {
  if (
    !previewEnabled ||
    publicationState === 'correction_hold' ||
    publicationState === 'pipeline_failure'
  ) {
    return null
  }
  return draftBriefForSlug(slug)
}
