import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'

import type { RecordedBackgroundBySlug } from './index'

/** Authored from fetched artifacts; see the authoring rules in ./index.ts. */
export const BACKGROUND_BATCH_3: RecordedBackgroundBySlug = {
  escitalopram: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      tMax: {
        display: 'about 5 hours',
        numeric: 5,
        unit: 'hours',
        populationContext: 'single oral dose (20 mg tablet or solution)',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0458445b-e431-4c82-86b8-90373813c10a',
          label: 'FDA label, Escitalopram Oral Solution',
          locator: 'clinical_pharmacology 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following a single oral dose (20 mg tablet or solution) of escitalopram, peak blood levels occur at about 5 hours. Absorption of escitalopram is not affected by food.',
        },
      },
      halfLife: {
        display: 'about 27 to 32 hours',
        numeric: 27,
        unit: 'hours',
        populationContext: 'adults, mean terminal half-life as recorded in the label',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0458445b-e431-4c82-86b8-90373813c10a',
          label: 'FDA label, Escitalopram Oral Solution',
          locator: 'clinical_pharmacology 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Biotransformation of escitalopram is mainly hepatic, with a mean terminal half-life of about 27-32 hours.',
        },
      },
      proteinBinding: {
        display: 'approximately 56%',
        numeric: 56,
        unit: '%',
        populationContext: 'binding to human plasma proteins',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0458445b-e431-4c82-86b8-90373813c10a',
          label: 'FDA label, Escitalopram Oral Solution',
          locator: 'clinical_pharmacology 12.3',
          retrievedAt: '2026-08-27',
          excerpt: 'The binding of escitalopram to human plasma proteins is approximately 56%.',
        },
      },
      metabolismAsRecorded: {
        display:
          'CYP3A4 and CYP2C19 are the primary isozymes involved in the N-demethylation of escitalopram',
        populationContext: 'in vitro, human liver microsomes',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0458445b-e431-4c82-86b8-90373813c10a',
          label: 'FDA label, Escitalopram Oral Solution',
          locator: 'clinical_pharmacology 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'In vitro studies using human liver microsomes indicated that CYP3A4 and CYP2C19 are the primary isozymes involved in the N-demethylation of escitalopram.',
        },
      },
      eliminationAsRecorded: {
        display: 'Oral clearance 600 mL/min, with approximately 7% due to renal clearance',
        numeric: 600,
        unit: 'mL/min',
        populationContext: 'adults, as recorded in the label pharmacokinetics section',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0458445b-e431-4c82-86b8-90373813c10a',
          label: 'FDA label, Escitalopram Oral Solution',
          locator: 'clinical_pharmacology 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'The oral clearance of escitalopram is 600 mL/min, with approximately 7% of that due to renal clearance.',
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(27),
    },
    productVariants: [
      {
        brandName: 'Escitalopram Oral Solution',
        formAsRecorded: 'Oral solution',
        strengthsAsRecorded: '1 mg per mL',
        approvedUseAsRecorded:
          'Treatment of major depressive disorder (MDD) in adults and pediatric patients 12 years of age and older, and generalized anxiety disorder (GAD) in adults',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-03-05',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0458445b-e431-4c82-86b8-90373813c10a',
          label: 'FDA label, Escitalopram Oral Solution',
          locator: 'dosage_forms_and_strengths',
          retrievedAt: '2026-08-27',
          excerpt:
            'Oral Solution Escitalopram Oral Solution, USP contains escitalopram oxalate equivalent to 1 mg/mL escitalopram base. Oral solution: 1 mg per mL',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'Potentiation of serotonergic activity in the central nervous system (CNS) through inhibition of CNS neuronal reuptake of serotonin, as recorded',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0458445b-e431-4c82-86b8-90373813c10a',
          label: 'FDA label, Escitalopram Oral Solution',
          locator: 'clinical_pharmacology 12.1',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mechanism of antidepressant action of escitalopram, the S-enantiomer of racemic citalopram, is presumed to be linked to potentiation of serotonergic activity in the central nervous system (CNS) resulting from its inhibition of CNS neuronal reuptake of serotonin (5-HT).',
        },
      },
    ],
    registryIdentifiers: {
      pubchemCid: '146570',
      casNumber: '128196-01-0',
      unii: '5U85DBW7LO',
      rxcui: '321988',
      source: {
        kind: 'PUBCHEM',
        identifier: '146570',
        label: 'PubChem CID 146570; RxNorm RxCUI and UNII from the same fetch artifact',
        retrievedAt: '2026-08-27',
      },
    },
  },

  esomeprazole: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '9568614',
      casNumber: '119141-88-7',
      unii: 'R6DXU4WAY9',
      rxcui: '283742',
      source: {
        kind: 'PUBCHEM',
        identifier: '9568614',
        label: 'PubChem CID 9568614; RxNorm RxCUI and UNII from the same fetch artifact',
        retrievedAt: '2026-08-27',
      },
    },
  },

  finasteride: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: '65% (range 26 to 170%)',
        numeric: 65,
        unit: '%',
        populationContext: '15 healthy young male subjects, 1 mg tablets',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00e934bb-c15b-490a-a852-839689a1231a',
          label: 'FDA label, Finasteride tablets 1 mg',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'In a study in 15 healthy young male subjects, the mean bioavailability of finasteride 1-mg tablets was 65% (range 26 to 170%), based on the ratio of area under the curve (AUC) relative to an intravenous (IV) reference dose.',
        },
      },
      tMax: {
        display: '1 to 2 hours postdose',
        numeric: 1,
        unit: 'hours',
        populationContext: 'steady state following dosing with 1 mg/day (n=12)',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00e934bb-c15b-490a-a852-839689a1231a',
          label: 'FDA label, Finasteride tablets 1 mg',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'At steady state following dosing with 1 mg/day (n=12), maximum finasteride plasma concentration averaged 9.2 ng/mL (range, 4.9 to 13.7 ng/mL) and was reached 1 to 2 hours postdose',
        },
      },
      halfLife: {
        display: '4.5 hours (range, 3.3 to 13.4 hours)',
        numeric: 4.5,
        unit: 'hours',
        populationContext: 'healthy young subjects, mean terminal half-life in plasma (n=12)',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00e934bb-c15b-490a-a852-839689a1231a',
          label: 'FDA label, Finasteride tablets 1 mg',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Mean terminal half-life in plasma was 4.5 hours (range, 3.3 to 13.4 hours; n=12).',
        },
      },
      proteinBinding: {
        display: 'approximately 90%',
        numeric: 90,
        unit: '%',
        populationContext: 'circulating finasteride bound to plasma proteins',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00e934bb-c15b-490a-a852-839689a1231a',
          label: 'FDA label, Finasteride tablets 1 mg',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt: 'Approximately 90% of circulating finasteride is bound to plasma proteins.',
        },
      },
      volumeOfDistribution: {
        display: '76 liters (range, 44 to 96 liters)',
        numeric: 76,
        unit: 'L',
        populationContext: 'mean steady-state volume of distribution (n=15)',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00e934bb-c15b-490a-a852-839689a1231a',
          label: 'FDA label, Finasteride tablets 1 mg',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Mean steady-state volume of distribution was 76 liters (range, 44 to 96 liters; n=15).',
        },
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized in the liver, primarily via the cytochrome P450 3A4 enzyme subfamily',
        populationContext: 'as recorded in the label pharmacokinetics section',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00e934bb-c15b-490a-a852-839689a1231a',
          label: 'FDA label, Finasteride tablets 1 mg',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Finasteride is extensively metabolized in the liver, primarily via the cytochrome P450 3A4 enzyme subfamily.',
        },
      },
      eliminationAsRecorded: {
        display: '39% of the dose excreted in the urine as metabolites; 57% excreted in the feces',
        numeric: 39,
        unit: '%',
        populationContext: 'oral dose of 14C-finasteride in man (n=6)',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00e934bb-c15b-490a-a852-839689a1231a',
          label: 'FDA label, Finasteride tablets 1 mg',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following an oral dose of 14 C-finasteride in man (n=6), a mean of 39% (range, 32 to 46%) of the dose was excreted in the urine in the form of metabolites; 57% (range, 51 to 64%) was excreted in the feces.',
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(4.5),
    },
    productVariants: [
      {
        brandName: 'Finasteride',
        formAsRecorded: 'Tablets, film coated',
        strengthsAsRecorded: '1 mg',
        approvedUseAsRecorded:
          'Treatment of male pattern hair loss (androgenetic alopecia) in MEN ONLY; not indicated for use in women',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2017-07-28',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00e934bb-c15b-490a-a852-839689a1231a',
          label: 'FDA label, Finasteride tablets 1 mg',
          locator: 'dosage_forms_and_strengths',
          retrievedAt: '2026-08-27',
          excerpt: 'Finasteride tablets USP, 1 mg is brown color, round film coated tablets',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'skin',
        actionAsRecorded:
          'Decreases scalp DHT concentrations in men with male pattern hair loss (androgenetic alopecia), as recorded',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00e934bb-c15b-490a-a852-839689a1231a',
          label: 'FDA label, Finasteride tablets 1 mg',
          locator: 'clinical_pharmacology 12.1',
          retrievedAt: '2026-08-27',
          excerpt:
            'In men with male pattern hair loss (androgenetic alopecia), the balding scalp contains miniaturized hair follicles and increased amounts of DHT compared with hairy scalp. Administration of finasteride decreases scalp and serum DHT concentrations in these men.',
        },
      },
    ],
    registryIdentifiers: {
      pubchemCid: '57363',
      casNumber: '98319-26-7',
      unii: '57GNO57U7G',
      rxcui: '25025',
      source: {
        kind: 'PUBCHEM',
        identifier: '57363',
        label: 'PubChem CID 57363; RxNorm RxCUI and UNII from the same fetch artifact',
        retrievedAt: '2026-08-27',
      },
    },
  },

  fluoxetine: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      tMax: {
        display: '6 to 8 hours',
        numeric: 6,
        unit: 'hours',
        populationContext: 'single oral 40 mg dose in man',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02283de9-6087-45f7-a9ce-3b082ce860de',
          label: 'FDA label, Fluoxetine capsules',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'In man, following a single oral 40 mg dose, peak plasma concentrations of fluoxetine from 15 to 55 ng/mL are observed after 6 to 8 hours.',
        },
      },
      halfLife: {
        display: '1 to 3 days after acute administration; 4 to 6 days after chronic administration',
        populationContext: 'elimination half-life of fluoxetine as recorded in the label',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02283de9-6087-45f7-a9ce-3b082ce860de',
          label: 'FDA label, Fluoxetine capsules',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'The relatively slow elimination of fluoxetine (elimination half-life of 1 to 3 days after acute administration and 4 to 6 days after chronic administration) and its active metabolite, norfluoxetine (elimination half-life of 4 to 16 days after acute and chronic administration), leads to significant accumulation of these active species in chronic use and delayed attainment of steady state',
        },
      },
      proteinBinding: {
        display: 'approximately 94.5%',
        numeric: 94.5,
        unit: '%',
        populationContext:
          'in vitro binding to human serum proteins over the concentration range 200 to 1000 ng/mL',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02283de9-6087-45f7-a9ce-3b082ce860de',
          label: 'FDA label, Fluoxetine capsules',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Over the concentration range from 200 to 1000 ng/mL, approximately 94.5% of fluoxetine is bound in vitro to human serum proteins, including albumin and α 1 -glycoprotein.',
        },
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized in the liver to norfluoxetine (the only identified active metabolite, formed by demethylation) and other unidentified metabolites',
        populationContext: 'as recorded in the label pharmacokinetics section',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02283de9-6087-45f7-a9ce-3b082ce860de',
          label: 'FDA label, Fluoxetine capsules',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Fluoxetine is extensively metabolized in the liver to norfluoxetine and a number of other unidentified metabolites. The only identified active metabolite, norfluoxetine, is formed by demethylation of fluoxetine.',
        },
      },
      eliminationAsRecorded: {
        display:
          'Primary route of elimination appears to be hepatic metabolism to inactive metabolites excreted by the kidney',
        populationContext: 'as recorded in the label pharmacokinetics section',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02283de9-6087-45f7-a9ce-3b082ce860de',
          label: 'FDA label, Fluoxetine capsules',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'The primary route of elimination appears to be hepatic metabolism to inactive metabolites excreted by the kidney.',
        },
      },
    },
    productVariants: [
      {
        brandName: 'Fluoxetine',
        formAsRecorded: 'Capsules',
        strengthsAsRecorded: '10 mg, 20 mg, and 40 mg',
        approvedUseAsRecorded:
          'Acute and maintenance treatment of Major Depressive Disorder (MDD), Obsessive Compulsive Disorder (OCD), and Bulimia Nervosa; acute treatment of Panic Disorder, with or without agoraphobia',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2019-02-01',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02283de9-6087-45f7-a9ce-3b082ce860de',
          label: 'FDA label, Fluoxetine capsules',
          locator: 'dosage_forms_and_strengths',
          retrievedAt: '2026-08-27',
          excerpt: 'Capsules: 10 mg, 20 mg, and 40 mg',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'Presumed to be linked to inhibition of CNS neuronal uptake of serotonin, as recorded',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02283de9-6087-45f7-a9ce-3b082ce860de',
          label: 'FDA label, Fluoxetine capsules',
          locator: 'clinical_pharmacology 12.1',
          retrievedAt: '2026-08-27',
          excerpt:
            'Although the exact mechanism of fluoxetine is unknown, it is presumed to be linked to its inhibition of CNS neuronal uptake of serotonin.',
        },
      },
    ],
    registryIdentifiers: {
      pubchemCid: '3386',
      casNumber: '54910-89-3',
      unii: 'I9W7N6B1KJ',
      rxcui: '227224',
      source: {
        kind: 'PUBCHEM',
        identifier: '3386',
        label: 'PubChem CID 3386; RxNorm RxCUI and UNII from the same fetch artifact',
        retrievedAt: '2026-08-27',
      },
    },
  },

  fluticasone: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '444036',
      casNumber: '80474-14-2',
      unii: 'O2GMZ0LF5W',
      rxcui: '41126',
      source: {
        kind: 'PUBCHEM',
        identifier: '444036',
        label: 'PubChem CID 444036; RxNorm RxCUI and UNII from the same fetch artifact',
        retrievedAt: '2026-08-27',
      },
    },
  },

  furosemide: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: '64% (tablets) and 60% (oral solution)',
        numeric: 64,
        unit: '%',
        populationContext: 'fasted normal men, relative to an intravenous injection',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01a5f094-b473-4e46-9e61-69d5ec6dd766',
          label: 'FDA label, Furosemide tablets',
          locator: 'clinical_pharmacology',
          retrievedAt: '2026-08-27',
          excerpt:
            'In fasted normal men, the mean bioavailability of furosemide from furosemide tablets and furosemide oral solution is 64% and 60%, respectively, of that from an intravenous injection of the drug.',
        },
      },
      halfLife: {
        display: 'approximately 2 hours',
        numeric: 2,
        unit: 'hours',
        populationContext:
          'terminal half-life as recorded in the label clinical pharmacology section',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01a5f094-b473-4e46-9e61-69d5ec6dd766',
          label: 'FDA label, Furosemide tablets',
          locator: 'clinical_pharmacology',
          retrievedAt: '2026-08-27',
          excerpt: 'The terminal half-life of furosemide is approximately 2 hours.',
        },
      },
      proteinBinding: {
        display: '91 to 99% bound',
        numeric: 91,
        unit: '%',
        populationContext:
          'healthy individuals, plasma concentrations ranging from 1 to 400 mcg/mL',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01a5f094-b473-4e46-9e61-69d5ec6dd766',
          label: 'FDA label, Furosemide tablets',
          locator: 'clinical_pharmacology',
          retrievedAt: '2026-08-27',
          excerpt:
            'Furosemide is extensively bound to plasma proteins, mainly to albumin. Plasma concentrations ranging from 1 to 400 mcg/mL are 91 to 99% bound in healthy individuals.',
        },
      },
      metabolismAsRecorded: {
        display:
          'Furosemide glucuronide is the only or at least the major biotransformation product in man',
        populationContext: 'as recorded in the label clinical pharmacology section',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01a5f094-b473-4e46-9e61-69d5ec6dd766',
          label: 'FDA label, Furosemide tablets',
          locator: 'clinical_pharmacology',
          retrievedAt: '2026-08-27',
          excerpt:
            'Recent evidence suggests that furosemide glucuronide is the only or at least the major biotransformation product of furosemide in man.',
        },
      },
      eliminationAsRecorded: {
        display: 'Predominantly excreted unchanged in the urine',
        populationContext: 'as recorded in the label clinical pharmacology section',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01a5f094-b473-4e46-9e61-69d5ec6dd766',
          label: 'FDA label, Furosemide tablets',
          locator: 'clinical_pharmacology',
          retrievedAt: '2026-08-27',
          excerpt: 'Furosemide is predominantly excreted unchanged in the urine.',
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(2),
    },
    productVariants: [
      {
        brandName: 'Furosemide',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: '80 mg',
        approvedUseAsRecorded:
          'Treatment of edema associated with congestive heart failure, cirrhosis of the liver, and renal disease, including the nephrotic syndrome, in adults and pediatric patients; treatment of hypertension in adults',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2023-03-01',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01a5f094-b473-4e46-9e61-69d5ec6dd766',
          label: 'FDA label, Furosemide tablets',
          locator: 'how_supplied',
          retrievedAt: '2026-08-27',
          excerpt: 'HOW SUPPLIED Furosemide Tablets, USP 80 mg: White-off white, round, scored',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'kidneys',
        actionAsRecorded:
          'Inhibits primarily the absorption of sodium and chloride in the proximal and distal tubules and in the loop of Henle, as recorded',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01a5f094-b473-4e46-9e61-69d5ec6dd766',
          label: 'FDA label, Furosemide tablets',
          locator: 'clinical_pharmacology',
          retrievedAt: '2026-08-27',
          excerpt:
            'It has been demonstrated that furosemide inhibits primarily the absorption of sodium and chloride not only in the proximal and distal tubules but also in the loop of Henle.',
        },
      },
    ],
    registryIdentifiers: {
      pubchemCid: '3440',
      casNumber: '54-31-9',
      unii: '7LXU5N7ZO5',
      rxcui: '4603',
      source: {
        kind: 'PUBCHEM',
        identifier: '3440',
        label: 'PubChem CID 3440; RxNorm RxCUI and UNII from the same fetch artifact',
        retrievedAt: '2026-08-27',
      },
    },
  },

  gabapentin: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: 'approximately 60% (at 900 mg/day), decreasing to 27% (at 4800 mg/day)',
        numeric: 60,
        unit: '%',
        populationContext:
          'daily doses given in 3 divided doses; bioavailability is not dose proportional',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01b810b7-f4c8-4412-bbc5-b9220d8770d8',
          label: 'FDA label, Gabapentin capsules',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Bioavailability of gabapentin is approximately 60%, 47%, 34%, 33%, and 27% following 900, 1200, 2400, 3600, and 4800 mg/day given in 3 divided doses, respectively.',
        },
      },
      halfLife: {
        display: '5 to 7 hours',
        numeric: 5,
        unit: 'hours',
        populationContext: 'elimination half-life, unaltered by dose or following multiple dosing',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01b810b7-f4c8-4412-bbc5-b9220d8770d8',
          label: 'FDA label, Gabapentin capsules',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Gabapentin elimination half-life is 5 to 7 hours and is unaltered by dose or following multiple dosing.',
        },
      },
      proteinBinding: {
        display: 'less than 3%',
        numeric: 3,
        unit: '%',
        populationContext: 'circulating gabapentin bound to plasma protein',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01b810b7-f4c8-4412-bbc5-b9220d8770d8',
          label: 'FDA label, Gabapentin capsules',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt: 'Less than 3% of gabapentin circulates bound to plasma protein.',
        },
      },
      volumeOfDistribution: {
        display: '58±6 L (mean ±SD)',
        numeric: 58,
        unit: 'L',
        populationContext:
          'apparent volume of distribution after 150 mg intravenous administration',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01b810b7-f4c8-4412-bbc5-b9220d8770d8',
          label: 'FDA label, Gabapentin capsules',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'The apparent volume of distribution of gabapentin after 150 mg intravenous administration is 58±6 L (mean ±SD).',
        },
      },
      metabolismAsRecorded: {
        display: 'Not appreciably metabolized in humans',
        populationContext: 'as recorded in the label pharmacokinetics section',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01b810b7-f4c8-4412-bbc5-b9220d8770d8',
          label: 'FDA label, Gabapentin capsules',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'All pharmacological actions following gabapentin administration are due to the activity of the parent compound; gabapentin is not appreciably metabolized in humans.',
        },
      },
      eliminationAsRecorded: {
        display: 'Eliminated from the systemic circulation by renal excretion as unchanged drug',
        populationContext: 'as recorded in the label pharmacokinetics section',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01b810b7-f4c8-4412-bbc5-b9220d8770d8',
          label: 'FDA label, Gabapentin capsules',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Gabapentin is eliminated from the systemic circulation by renal excretion as unchanged drug.',
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(5),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Day 1',
          amountAsRecorded: 'single 300 mg dose',
        },
        {
          order: 2,
          periodAsRecorded: 'Day 2',
          amountAsRecorded: '600 mg/day (300 mg two times a day)',
        },
        {
          order: 3,
          periodAsRecorded: 'Day 3',
          amountAsRecorded: '900 mg/day (300 mg three times a day)',
        },
      ],
      source: {
        kind: 'FDA_LABEL',
        identifier: '01b810b7-f4c8-4412-bbc5-b9220d8770d8',
        label: 'FDA label, Gabapentin capsules — postherpetic neuralgia schedule as recorded',
        locator: 'dosage_and_administration 2.1',
        retrievedAt: '2026-08-27',
        excerpt:
          'In adults with postherpetic neuralgia, Gabapentin may be initiated on Day 1 as a single 300 mg dose, on Day 2 as 600 mg/day (300 mg two times a day), and on Day 3 as 900 mg/day (300 mg three times a day). The dose can subsequently be titrated up as needed for pain relief to a dose of 1800 mg/day (600 mg three times a day).',
      },
    },
    productVariants: [
      {
        brandName: 'Gabapentin',
        formAsRecorded: 'Capsules',
        strengthsAsRecorded: '100 mg, 300 mg, and 400 mg',
        approvedUseAsRecorded:
          'Management of postherpetic neuralgia in adults; adjunctive therapy in the treatment of partial onset seizures, with and without secondary generalization, in adults and pediatric patients 3 years and older with epilepsy',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-04-02',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01b810b7-f4c8-4412-bbc5-b9220d8770d8',
          label: 'FDA label, Gabapentin capsules',
          locator: 'dosage_forms_and_strengths',
          retrievedAt: '2026-08-27',
          excerpt: 'Capsules: 100 mg, 300 mg, and 400 mg',
        },
      },
    ],
    registryIdentifiers: {
      pubchemCid: '3446',
      casNumber: '60142-96-3',
      unii: '6CW7F3G59X',
      rxcui: '25480',
      source: {
        kind: 'PUBCHEM',
        identifier: '3446',
        label: 'PubChem CID 3446; RxNorm RxCUI and UNII from the same fetch artifact',
        retrievedAt: '2026-08-27',
      },
    },
  },

  hydrochlorothiazide: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      halfLife: {
        display: '5.6 to 14.8 hours',
        numeric: 5.6,
        unit: 'hours',
        populationContext:
          'plasma levels followed for at least 24 hours; recorded on the lisinopril and hydrochlorothiazide combination label',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00b266d9-ac4a-e931-e063-6294a90a6a0b',
          label:
            'FDA label, Lisinopril and Hydrochlorothiazide tablets (hydrochlorothiazide component)',
          locator: 'clinical_pharmacology',
          retrievedAt: '2026-08-27',
          excerpt:
            'When plasma levels have been followed for at least 24 hours, the plasma half-life has been observed to vary between 5.6 and 14.8 hours.',
        },
      },
      metabolismAsRecorded: {
        display: 'Not metabolized',
        populationContext: 'hydrochlorothiazide component, as recorded on the combination label',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00b266d9-ac4a-e931-e063-6294a90a6a0b',
          label:
            'FDA label, Lisinopril and Hydrochlorothiazide tablets (hydrochlorothiazide component)',
          locator: 'clinical_pharmacology',
          retrievedAt: '2026-08-27',
          excerpt:
            'Hydrochlorothiazide is not metabolized but is eliminated rapidly by the kidney.',
        },
      },
      eliminationAsRecorded: {
        display: 'At least 61 percent of the oral dose eliminated unchanged within 24 hours',
        numeric: 61,
        unit: '%',
        populationContext: 'hydrochlorothiazide component, as recorded on the combination label',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00b266d9-ac4a-e931-e063-6294a90a6a0b',
          label:
            'FDA label, Lisinopril and Hydrochlorothiazide tablets (hydrochlorothiazide component)',
          locator: 'clinical_pharmacology',
          retrievedAt: '2026-08-27',
          excerpt: 'At least 61 percent of the oral dose is eliminated unchanged within 24 hours.',
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(5.6),
    },
    anatomyTargets: [
      {
        regionCode: 'kidneys',
        actionAsRecorded:
          'Affects the distal renal tubular mechanism of electrolyte reabsorption; increases excretion of sodium and chloride, as recorded',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00b266d9-ac4a-e931-e063-6294a90a6a0b',
          label:
            'FDA label, Lisinopril and Hydrochlorothiazide tablets (hydrochlorothiazide component)',
          locator: 'clinical_pharmacology',
          retrievedAt: '2026-08-27',
          excerpt:
            'It affects the distal renal tubular mechanism of electrolyte reabsorption. Hydrochlorothiazide increases excretion of sodium and chloride in approximately equivalent amounts.',
        },
      },
    ],
    registryIdentifiers: {
      pubchemCid: '3639',
      casNumber: '58-93-5',
      rxcui: '5487',
      source: {
        kind: 'PUBCHEM',
        identifier: '3639',
        label: 'PubChem CID 3639; RxNorm RxCUI from the same fetch artifact',
        retrievedAt: '2026-08-27',
      },
    },
  },

  hydroxychloroquine: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: '79% (SD: 12%)',
        numeric: 79,
        unit: '%',
        populationContext: 'healthy male volunteers, single 200 mg oral dose, fasting conditions',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '04139607-f7c0-4fe1-a210-ffa5af347d56',
          label: 'FDA label, Hydroxychloroquine sulfate tablets',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt: 'Mean absolute oral bioavailability is 79% (SD: 12%) in fasting conditions.',
        },
      },
      tMax: {
        display: '3.3 hours in whole blood (3.7 hours in plasma)',
        numeric: 3.3,
        unit: 'hours',
        populationContext: 'healthy male volunteers, single 200 mg oral dose',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '04139607-f7c0-4fe1-a210-ffa5af347d56',
          label: 'FDA label, Hydroxychloroquine sulfate tablets',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following a single 200 mg oral dose of hydroxychloroquine sulfate tablets to healthy male volunteers, whole blood hydroxychloroquine Cmax was 129.6 ng/mL (plasma C max was 50.3 ng/mL) with T max of 3.3 hours (plasma T max 3.7 hours).',
        },
      },
      halfLife: {
        display: '40 to 50 days in whole blood',
        populationContext: 'terminal half-life following chronic oral administration',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '04139607-f7c0-4fe1-a210-ffa5af347d56',
          label: 'FDA label, Hydroxychloroquine sulfate tablets',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following chronic oral administration of hydroxychloroquine, the absorption half-life of hydroxychloroquine was approximately 3 to 4 hours and the terminal half-life ranged from 40 to 50 days in whole blood.',
        },
      },
      proteinBinding: {
        display: 'approximately 50%',
        numeric: 50,
        unit: '%',
        populationContext: 'hydroxychloroquine bound to plasma proteins',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '04139607-f7c0-4fe1-a210-ffa5af347d56',
          label: 'FDA label, Hydroxychloroquine sulfate tablets',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt: 'Approximately 50% of hydroxychloroquine is bound to plasma proteins.',
        },
      },
      metabolismAsRecorded: {
        display:
          'Metabolized mainly by CYP2C8, CYP3A4 and CYP2D6 as well as by FMO-1 and MAO-A; desethylhydroxychloroquine (DHCQ) is the major metabolite',
        populationContext: 'in vitro; metabolite levels in plasma and blood',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '04139607-f7c0-4fe1-a210-ffa5af347d56',
          label: 'FDA label, Hydroxychloroquine sulfate tablets',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Significant levels of three metabolites, desethylhydroxychloroquine (DHCQ), desethylchloroquine (DCQ), and bidesethylhydroxychloroquine (BDCQ) were found in plasma and blood, with DHCQ being the major metabolite. In vitro, hydroxychloroquine is metabolized mainly by CYP2C8, CYP3A4 and CYP2D6 as well as by FMO-1 and MAO-A',
        },
      },
      eliminationAsRecorded: {
        display:
          'Renal clearance of unchanged hydroxychloroquine approximately 16% to 30% of the dose',
        numeric: 16,
        unit: '%',
        populationContext: 'after oral and IV administration',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '04139607-f7c0-4fe1-a210-ffa5af347d56',
          label: 'FDA label, Hydroxychloroquine sulfate tablets',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Renal clearance of unchanged hydroxychloroquine was approximately 16% to 30% of the dose after oral and IV administration.',
        },
      },
    },
    productVariants: [
      {
        brandName: 'Hydroxychloroquine Sulfate',
        formAsRecorded: 'Tablets, film-coated',
        strengthsAsRecorded: '200 mg of hydroxychloroquine sulfate',
        approvedUseAsRecorded:
          'Antimalarial and antirheumatic indicated for treatment of uncomplicated malaria, prophylaxis of malaria in geographic areas where chloroquine resistance is not reported, and treatment of rheumatoid arthritis, systemic lupus erythematosus, and chronic discoid lupus erythematosus in adults',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-10-09',
        source: {
          kind: 'FDA_LABEL',
          identifier: '04139607-f7c0-4fe1-a210-ffa5af347d56',
          label: 'FDA label, Hydroxychloroquine sulfate tablets',
          locator: 'dosage_forms_and_strengths',
          retrievedAt: '2026-08-27',
          excerpt: 'Tablets: 200 mg of hydroxychloroquine sulfate',
        },
      },
    ],
    registryIdentifiers: {
      pubchemCid: '3652',
      casNumber: '118-42-3',
      unii: '8Q2869CNVH',
      rxcui: '153972',
      source: {
        kind: 'PUBCHEM',
        identifier: '3652',
        label: 'PubChem CID 3652; RxNorm RxCUI and UNII from the same fetch artifact',
        retrievedAt: '2026-08-27',
      },
    },
  },

  ibuprofen: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '3672',
      casNumber: '58560-75-1',
      unii: 'WK2XYI10QM',
      rxcui: '5640',
      source: {
        kind: 'PUBCHEM',
        identifier: '3672',
        label: 'PubChem CID 3672; RxNorm RxCUI and UNII from the same fetch artifact',
        retrievedAt: '2026-08-27',
      },
    },
  },

  inclisiran: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'subcutaneous injection',
      tMax: {
        display: 'approximately 4 hours post dose',
        numeric: 4,
        unit: 'hours',
        populationContext: 'recommended dosing regimen of 284 mg, plasma concentrations',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '6fc0afca-4513-4c35-b594-6544aee29a44',
          label: 'FDA label, LEQVIO (inclisiran) injection',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'At the recommended dosing regimen of 284 mg of LEQVIO, plasma concentrations reached peak in approximately 4 hours post dose with a mean C max of 509 ng/mL.',
        },
      },
      halfLife: {
        display: 'approximately 9 hours',
        numeric: 9,
        unit: 'hours',
        populationContext: 'terminal elimination half-life; no accumulation with multiple dosing',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '6fc0afca-4513-4c35-b594-6544aee29a44',
          label: 'FDA label, LEQVIO (inclisiran) injection',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'The terminal elimination half-life of LEQVIO is approximately 9 hours, and no accumulation occurs with multiple dosing.',
        },
      },
      proteinBinding: {
        display: '87%',
        numeric: 87,
        unit: '%',
        populationContext: 'in vitro, at the relevant clinical plasma concentrations',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '6fc0afca-4513-4c35-b594-6544aee29a44',
          label: 'FDA label, LEQVIO (inclisiran) injection',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Inclisiran is 87% protein bound in vitro at the relevant clinical plasma concentrations.',
        },
      },
      volumeOfDistribution: {
        display: 'approximately 500 L',
        numeric: 500,
        unit: 'L',
        populationContext: 'healthy adults, single subcutaneous 284 mg dose',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '6fc0afca-4513-4c35-b594-6544aee29a44',
          label: 'FDA label, LEQVIO (inclisiran) injection',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following a single subcutaneous 284 mg dose of LEQVIO to healthy adults, the apparent volume of distribution is approximately 500 L.',
        },
      },
      metabolismAsRecorded: {
        display:
          'Primarily metabolized by nucleases to shorter nucleotides of varying length; not a substrate for CYP450 or transporters',
        populationContext: 'as recorded in the label pharmacokinetics section',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '6fc0afca-4513-4c35-b594-6544aee29a44',
          label: 'FDA label, LEQVIO (inclisiran) injection',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Inclisiran is primarily metabolized by nucleases to shorter nucleotides of varying length. Inclisiran is not a substrate for CYP450 or transporters.',
        },
      },
      eliminationAsRecorded: {
        display: 'Approximately 16% cleared through the kidney',
        numeric: 16,
        unit: '%',
        populationContext: 'as recorded in the label pharmacokinetics section',
        concordance: 'label_only',
        source: {
          kind: 'FDA_LABEL',
          identifier: '6fc0afca-4513-4c35-b594-6544aee29a44',
          label: 'FDA label, LEQVIO (inclisiran) injection',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt: 'Approximately 16% of LEQVIO is cleared through the kidney.',
        },
      },
    },
    productVariants: [
      {
        brandName: 'LEQVIO',
        formAsRecorded: 'Injection, single-dose prefilled syringe',
        strengthsAsRecorded: '284 mg/1.5 mL (189 mg/mL)',
        approvedUseAsRecorded:
          'Adjunct to diet and exercise to reduce low-density lipoprotein cholesterol (LDL-C) in adults with hypercholesterolemia, in adults and pediatric patients aged 12 years and older with heterozygous familial hypercholesterolemia (HeFH), and in pediatric patients aged 12 years and older with homozygous familial hypercholesterolemia (HoFH)',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-08-19',
        source: {
          kind: 'FDA_LABEL',
          identifier: '6fc0afca-4513-4c35-b594-6544aee29a44',
          label: 'FDA label, LEQVIO (inclisiran) injection',
          locator: 'dosage_forms_and_strengths',
          retrievedAt: '2026-08-27',
          excerpt:
            'Injection: 284 mg/1.5 mL (189 mg/mL) of inclisiran as a clear and colorless to pale yellow solution in a single-dose prefilled syringe.',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'liver',
        actionAsRecorded:
          'High uptake into, and selectivity for, the liver — the target organ for cholesterol lowering, as recorded',
        source: {
          kind: 'FDA_LABEL',
          identifier: '6fc0afca-4513-4c35-b594-6544aee29a44',
          label: 'FDA label, LEQVIO (inclisiran) injection',
          locator: 'pharmacokinetics 12.3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Inclisiran has been shown to have high uptake into, and selectively for the liver, the target organ for cholesterol lowering.',
        },
      },
    ],
    applicability: {
      trialIdentifier: 'NCT03399370',
      includedAsRecorded: [
        'Male or female participants ≥18 years of age.',
        'History of ASCVD (coronary heart disease [CHD], cardiovascular disease [CVD], or peripheral arterial disease [PAD]).',
        'Serum LDL-C ≥1.8 millimole (mmol)/liter (L) (≥70 mg/dL).',
        'Fasting triglyceride <4.52 mmol/L (<400 mg/dL) at screening.',
        'Participants on statins should be receiving a maximally tolerated dose.',
        'Participants not receiving statins must have documented evidence of intolerance to all doses of at least 2 different statins.',
      ],
      excludedAsRecorded: [
        'New York Heart Association (NYHA) class IV heart failure.',
        'Uncontrolled cardiac arrhythmia',
        'Uncontrolled severe hypertension',
        'Active liver disease',
        'Treatment with other investigational products or devices within 30 days or 5 half-lives of the screening visit, whichever is longer.',
        'Treatment (within 90 days of screening) with monoclonal antibodies directed towards PCSK9',
      ],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT03399370',
        label: 'ClinicalTrials.gov record NCT03399370 (ORION-10), eligibility criteria',
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: '2026-08-27',
        excerpt:
          'Inclusion Criteria:\n\n1. Male or female participants ≥18 years of age.\n2. History of ASCVD (coronary heart disease \\[CHD\\], cardiovascular disease \\[CVD\\], or peripheral arterial disease \\[PAD\\]).\n3. Serum LDL-C ≥1.8 millimole (mmol)/liter (L) (≥70 mg/dL).\n4. Fasting triglyceride \\<4.52 mmol/L (\\<400 mg/dL) at screening.',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT03399370',
        endpointAsRecorded:
          'Percentage Change in LDL-C From Baseline to Day 510 (least squares mean)',
        activeResultAsRecorded: '-56.34 percent change (95% CI -58.35 to -54.34), inclisiran group',
        comparatorResultAsRecorded: '1.30 percent change, placebo group',
        uncertaintyAsRecorded: 'p value <.0001 (superiority, LS mean difference from placebo)',
        timepointAsRecorded: 'Baseline, Day 510',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT03399370',
          label: 'ClinicalTrials.gov posted results for NCT03399370 (ORION-10), primary outcome',
          locator: 'resultsSection.outcomeMeasuresModule',
          retrievedAt: '2026-08-27',
          excerpt:
            'Percentage Change in LDL-C From Baseline to Day 510 ... "measurements":[{"groupId":"OG000","value":"-56.34","lowerLimit":"-58.35","upperLimit":"-54.34"},{"groupId":"OG001","value":"1.30","lowerLimit":"-1.24","upperLimit":"3.83"}]}]}],"analyses":[{"groupIds":["OG000","OG001"],"nonInferiorityType":"SUPERIORITY","nonInferiorityComment":"LS Mean Difference (95% CI) from Placebo","pValue":"<.0001',
        },
      },
    ],
    registryIdentifiers: {
      unii: 'UPC6BTX7PY',
      rxcui: '2588243',
      source: {
        kind: 'RXNORM',
        identifier: '2588243',
        label: 'RxNorm RxCUI 2588243; UNII from the FDA label fetch artifact',
        retrievedAt: '2026-08-27',
      },
    },
  },
}
