import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import type { BackgroundSource } from '@/lib/background/types'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 7: acyclovir, amitriptyline, aripiprazole, berberine, budesonide, buprenorphine,
 * buspirone, carbamazepine, carvedilol, celecoxib, clindamycin.
 *
 * Honest omissions in this batch:
 * - acyclovir: the fetched label states no healthy-adult half-life in its text (the general
 *   parameters live in an untranscribed table), so the only recorded half-life is the pediatric
 *   figure, named as such; no steady-state note is derived from it.
 * - amitriptyline: the fetched label has no pharmacokinetic numbers and states no tablet
 *   strengths, so registry identifiers are the only recorded module.
 * - berberine: no applicable FDA drug label exists for this supplement — registry identifiers
 *   from PubChem only.
 * - budesonide: the fetched label is a short over-the-counter nasal-spray label with no
 *   pharmacokinetics and no stated strengths — registry identifiers only.
 * - buprenorphine: titration and anatomy modules are omitted; the label describes induction as a
 *   study protocol rather than a stepwise schedule, and its mechanism text names receptors, not
 *   an organ. Recorded modules quote the label exactly.
 * - carbamazepine: no steady-state note is derived because the label states the half-life changes
 *   with autoinduction; the label states no strengths, so no product-variant module.
 * - clindamycin: the fetched label is the topical lotion; only what that label states is
 *   recorded.
 */

const FETCHED = '2026-08-27'

function fdaLabel(
  setId: string,
  label: string,
  locator: string,
  excerpt?: string,
): BackgroundSource {
  return {
    kind: 'FDA_LABEL',
    identifier: setId,
    label,
    locator,
    retrievedAt: FETCHED,
    ...(excerpt !== undefined ? { excerpt } : {}),
  }
}

const ACYCLOVIR_LABEL = '01ae85df-d1a0-44f7-b4c0-0ac74d2216d4'
const ARIPIPRAZOLE_LABEL = '02a4af27-c83c-4166-950c-7a1cb12d198d'
const BUPRENORPHINE_LABEL = '023c7816-21b1-4f85-be36-9e32d5935c19'
const BUSPIRONE_LABEL = '02628a0c-bfdb-4a58-8e48-bcd8ca12d53b'
const CARBAMAZEPINE_LABEL = '047bc284-060a-4db9-bf37-75d10f95a0a6'
const CARVEDILOL_LABEL = '010290af-81f4-0037-e063-6394a90a4638'
const CELECOXIB_LABEL = '00e67d5e-df6f-4dfd-8c2d-a001c8a99af0'
const CLINDAMYCIN_LABEL = '00fe3546-a166-412f-a543-0ae7763c0ca0'

export const BACKGROUND_BATCH_7: RecordedBackgroundBySlug = {
  acyclovir: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '135398513',
      casNumber: '59277-89-3',
      unii: 'X4HES1O11F',
      rxcui: '281',
      source: {
        kind: 'PUBCHEM',
        identifier: '135398513',
        label: "PubChem compound record matched for 'acyclovir'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (capsules), with or without food',
      halfLife: {
        display: '2.6 hours (range 1.59 to 3.74 hours)',
        numeric: 2.6,
        unit: 'hours',
        populationContext:
          'pediatric patients aged 7 months to 7 years after oral doses of 300 mg/m2 and 600 mg/m2 — the only half-life figure stated in the fetched label text',
        source: fdaLabel(
          ACYCLOVIR_LABEL,
          'FDA label for acyclovir capsules (openFDA)',
          'clinical_pharmacology, Pharmacokinetics, Pediatrics',
          'Mean half-life after oral doses of 300 mg/m 2 and 600 mg/m 2 in pediatric patients aged 7 months to 7 years was 2.6 hours (range 1.59 to 3.74 hours).',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display: 'The only known urinary metabolite is 9-[(carboxymethoxy)methyl]guanine',
        populationContext: 'human pharmacokinetic data, as recorded in the label',
        source: fdaLabel(
          ACYCLOVIR_LABEL,
          'FDA label for acyclovir capsules (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'The only known urinary metabolite is 9-[(carboxymethoxy)methyl]guanine.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'The half-life and total body clearance of acyclovir are dependent on renal function',
        populationContext: 'adults with impaired renal function, as recorded in the label',
        source: fdaLabel(
          ACYCLOVIR_LABEL,
          'FDA label for acyclovir capsules (openFDA)',
          'clinical_pharmacology, Special Populations',
          'Adults with Impaired Renal Function: The half-life and total body clearance of acyclovir are dependent on renal function.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Acyclovir',
        formAsRecorded: 'Capsules',
        strengthsAsRecorded: '200 mg',
        approvedUseAsRecorded:
          'Acute treatment of herpes zoster (shingles); treatment of initial episodes and management of recurrent episodes of genital herpes; treatment of chickenpox (varicella)',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-09-05',
        source: fdaLabel(
          ACYCLOVIR_LABEL,
          'FDA label for acyclovir capsules (openFDA)',
          'indications_and_usage; how_supplied',
          'Herpes Zoster Infections : Acyclovir is indicated for the acute treatment of herpes zoster (shingles). Genital Herpes : Acyclovir is indicated for the treatment of initial episodes and the management of recurrent episodes of genital herpes. Chickenpox : Acyclovir is indicated for the treatment of chickenpox (varicella).',
        ),
      },
    ],
  },

  amitriptyline: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '2160',
      casNumber: '50-48-6',
      unii: '26LUD4JO9K',
      rxcui: '203168',
      source: {
        kind: 'PUBCHEM',
        identifier: '2160',
        label: "PubChem compound record matched for 'amitriptyline'",
        retrievedAt: FETCHED,
      },
    },
  },

  aripiprazole: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '60795',
      casNumber: '129722-12-9',
      unii: '82VFR53I78',
      rxcui: '89013',
      source: {
        kind: 'PUBCHEM',
        identifier: '60795',
        label: "PubChem compound record matched for 'aripiprazole'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets), once daily without regard to meals',
      bioavailability: {
        display: '87%',
        numeric: 87,
        unit: '%',
        populationContext: 'absolute oral bioavailability of the tablet formulation',
        source: fdaLabel(
          ARIPIPRAZOLE_LABEL,
          'FDA label for aripiprazole tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Aripiprazole is well absorbed after administration of the tablet, with peak plasma concentrations occurring within 3 hours to 5 hours; the absolute oral bioavailability of the tablet formulation is 87%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'within 3 hours to 5 hours',
        numeric: 4,
        unit: 'hours',
        populationContext: 'peak plasma concentrations after administration of the tablet',
        source: fdaLabel(
          ARIPIPRAZOLE_LABEL,
          'FDA label for aripiprazole tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Aripiprazole is well absorbed after administration of the tablet, with peak plasma concentrations occurring within 3 hours to 5 hours; the absolute oral bioavailability of the tablet formulation is 87%.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 75 hours',
        numeric: 75,
        unit: 'hours',
        populationContext:
          'mean elimination half-life of parent aripiprazole (its active metabolite dehydro-aripiprazole: about 94 hours), as recorded in the label',
        source: fdaLabel(
          ARIPIPRAZOLE_LABEL,
          'FDA label for aripiprazole tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'The mean elimination half-lives are about 75 hours and 94 hours for aripiprazole and dehydro-aripiprazole, respectively. Steady-state concentrations are attained within 14 days of dosing for both active moieties.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'greater than 99%',
        numeric: 99,
        unit: '%',
        populationContext:
          'binding to serum proteins at therapeutic concentrations, primarily to albumin',
        source: fdaLabel(
          ARIPIPRAZOLE_LABEL,
          'FDA label for aripiprazole tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'At therapeutic concentrations, aripiprazole and its major metabolite are greater than 99% bound to serum proteins, primarily to albumin.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '404 L (4.9 L/kg)',
        numeric: 404,
        unit: 'L',
        populationContext:
          'steady-state volume of distribution following intravenous administration',
        source: fdaLabel(
          ARIPIPRAZOLE_LABEL,
          'FDA label for aripiprazole tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The steady-state volume of distribution of aripiprazole following intravenous administration is high (404 L or 4.9 L/kg), indicating extensive extravascular distribution.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolized primarily by dehydrogenation, hydroxylation, and N-dealkylation; CYP3A4 and CYP2D6 are responsible for dehydrogenation and hydroxylation, and N-dealkylation is catalyzed by CYP3A4',
        populationContext: 'in vitro studies, as recorded in the label',
        source: fdaLabel(
          ARIPIPRAZOLE_LABEL,
          'FDA label for aripiprazole tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Aripiprazole is metabolized primarily by three biotransformation pathways: dehydrogenation, hydroxylation, and N-dealkylation. Based on in vitro studies, CYP3A4 and CYP2D6 enzymes are responsible for dehydrogenation and hydroxylation of aripiprazole, and N-dealkylation is catalyzed by CYP3A4.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'After a single oral radiolabeled dose, roughly a quarter of the radioactivity was recovered in the urine and over half in the feces',
        populationContext: 'radiolabeled single-dose study, as recorded in the label',
        source: fdaLabel(
          ARIPIPRAZOLE_LABEL,
          'FDA label for aripiprazole tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Following a single oral dose of [ 14 C]-labeled aripiprazole, approximately 25% and 55% of the administered radioactivity was recovered in the urine and feces, respectively. Less than 1% of unchanged aripiprazole was excreted in the urine and approximately 18% of the oral dose was recovered unchanged in the feces.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(75),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Days 1 to 2',
          amountAsRecorded: 'Dosing initiated at 2 mg/day for 2 days',
          purposeAsRecorded:
            "Label-stated schedule for Tourette's disorder, patients weighing 50 kg or more",
        },
        {
          order: 2,
          periodAsRecorded: 'The following 5 days',
          amountAsRecorded: 'Increased to 5 mg/day for 5 days',
          purposeAsRecorded:
            "Label-stated schedule for Tourette's disorder, patients weighing 50 kg or more",
        },
        {
          order: 3,
          periodAsRecorded: 'Day 8',
          amountAsRecorded: 'Target dose of 10 mg/day on Day 8',
          purposeAsRecorded:
            "Label-stated target dose for Tourette's disorder, patients weighing 50 kg or more",
        },
      ],
      source: fdaLabel(
        ARIPIPRAZOLE_LABEL,
        'FDA label for aripiprazole tablets (openFDA)',
        "dosage_and_administration 2.5 Tourette's Disorder",
        'For patients weighing 50 kg or more, dosing should be initiated at 2 mg/day for 2 days, and then increased to 5 mg/day for 5 days, with a target dose of 10 mg/day on Day 8.',
      ),
    },
    productVariants: [
      {
        brandName: 'Aripiprazole',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: 'Tablets: 2 mg, 5 mg, 10 mg, 15 mg, 20 mg, and 30 mg',
        approvedUseAsRecorded:
          "Treatment of schizophrenia; irritability associated with autistic disorder; treatment of Tourette's disorder",
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-03-05',
        source: fdaLabel(
          ARIPIPRAZOLE_LABEL,
          'FDA label for aripiprazole tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Aripiprazole is indicated for the treatment of: • Schizophrenia • Irritability Associated with Autistic Disorder • Treatment of Tourette’s Disorder Aripiprazole is an atypical antipsychotic.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'Dose-dependent D2 receptor occupancy indicating brain penetration in humans; efficacy could be mediated through partial agonist activity at D2 and 5-HT1A receptors and antagonist activity at 5-HT2A receptors',
        source: fdaLabel(
          ARIPIPRAZOLE_LABEL,
          'FDA label for aripiprazole tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'In healthy human volunteers administered 0.5 to 30 mg/day aripiprazole for 14 days, there was dose-dependent D 2 receptor occupancy indicating brain penetration of aripiprazole in humans.',
        ),
      },
    ],
  },

  berberine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '2353',
      casNumber: '2086-83-1',
      rxcui: '1437',
      source: {
        kind: 'PUBCHEM',
        identifier: '2353',
        label: "PubChem compound record matched for 'berberine'",
        retrievedAt: FETCHED,
      },
    },
  },

  budesonide: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5281004',
      casNumber: '51333-22-3',
      unii: 'Q3OKS62Q6X',
      rxcui: '19831',
      source: {
        kind: 'PUBCHEM',
        identifier: '5281004',
        label: "PubChem compound record matched for 'budesonide'",
        retrievedAt: FETCHED,
      },
    },
  },

  buprenorphine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '644073',
      casNumber: '52485-79-7',
      unii: '56W8MW3EN1',
      rxcui: '1819',
      source: {
        kind: 'PUBCHEM',
        identifier: '644073',
        label: "PubChem compound record matched for 'buprenorphine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Sublingual (sublingual tablets), administered as a single daily dose',
      halfLife: {
        display: '31 to 35 hours',
        numeric: 33,
        unit: 'hours',
        populationContext:
          'mean elimination half-life from plasma when the sublingual tablet is administered sublingually',
        source: fdaLabel(
          BUPRENORPHINE_LABEL,
          'FDA label for buprenorphine sublingual tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'When buprenorphine sublingual tablet is administered sublingually, buprenorphine has a mean elimination half-life from plasma ranging from 31 to 35 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 96%',
        numeric: 96,
        unit: '%',
        populationContext: 'binding primarily to alpha and beta globulin, as recorded in the label',
        source: fdaLabel(
          BUPRENORPHINE_LABEL,
          'FDA label for buprenorphine sublingual tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Buprenorphine is approximately 96% protein bound, primarily to alpha and beta globulin.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Undergoes both N-dealkylation to norbuprenorphine and glucuronidation; the N-dealkylation pathway is mediated primarily by CYP3A4',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          BUPRENORPHINE_LABEL,
          'FDA label for buprenorphine sublingual tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Buprenorphine undergoes both N-dealkylation to norbuprenorphine and glucuronidation. The N-dealkylation pathway is mediated primarily by CYP3A4. Norbuprenorphine, the major metabolite, can further undergo glucuronidation.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'A mass balance study showed complete recovery of radiolabel in urine and feces, with the larger share recovered in feces',
        populationContext: 'mass balance study with collections up to 11 days after dosing',
        source: fdaLabel(
          BUPRENORPHINE_LABEL,
          'FDA label for buprenorphine sublingual tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'A mass balance study of buprenorphine showed complete recovery of radiolabel in urine (30%) and feces (69%) collected up to 11 days after dosing.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(33),
    },
    productVariants: [
      {
        brandName: 'Buprenorphine',
        formAsRecorded: 'Sublingual tablets',
        strengthsAsRecorded: 'Sublingual tablet: 2 mg buprenorphine and 8 mg buprenorphine',
        approvedUseAsRecorded:
          'Treatment of opioid dependence, preferred for induction; for use as part of a complete treatment plan to include counseling and psychosocial support',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-02-03',
        source: fdaLabel(
          BUPRENORPHINE_LABEL,
          'FDA label for buprenorphine sublingual tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Buprenorphine sublingual tablet is indicated for the treatment of opioid dependence and is preferred for induction. Buprenorphine sublingual tablet should be used as part of a complete treatment plan to include counseling and psychosocial support.',
        ),
      },
    ],
  },

  buspirone: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '2477',
      casNumber: '36505-84-7',
      unii: '207LT9J9OC',
      rxcui: '1827',
      source: {
        kind: 'PUBCHEM',
        identifier: '2477',
        label: "PubChem compound record matched for 'buspirone'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded:
        'Oral (tablets), taken in a consistent manner with regard to the timing of dosing relative to food',
      tMax: {
        display: '40 to 90 minutes',
        populationContext: 'peak plasma levels after single oral doses of 20 mg',
        source: fdaLabel(
          BUSPIRONE_LABEL,
          'FDA label for buspirone hydrochloride tablets (openFDA)',
          'clinical_pharmacology',
          'Peak plasma levels of 1 ng/mL to 6 ng/mL have been observed 40 to 90 minutes after single oral doses of 20 mg.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 2 to 3 hours',
        numeric: 2.5,
        unit: 'hours',
        populationContext:
          'average elimination half-life of unchanged buspirone after single doses of 10 to 40 mg',
        source: fdaLabel(
          BUSPIRONE_LABEL,
          'FDA label for buspirone hydrochloride tablets (openFDA)',
          'clinical_pharmacology',
          'The average elimination half-life of unchanged buspirone after single doses of 10 to 40 mg is about 2 to 3 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 86%',
        numeric: 86,
        unit: '%',
        populationContext: 'in vitro protein binding study, as recorded in the label',
        source: fdaLabel(
          BUSPIRONE_LABEL,
          'FDA label for buspirone hydrochloride tablets (openFDA)',
          'clinical_pharmacology',
          'An in vitro protein binding study indicated that approximately 86% of buspirone is bound to plasma proteins.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolized primarily by oxidation, shown in vitro to be mediated by cytochrome P450 3A4 (CYP3A4)',
        populationContext: 'in vitro metabolism data, as recorded in the label',
        source: fdaLabel(
          BUSPIRONE_LABEL,
          'FDA label for buspirone hydrochloride tablets (openFDA)',
          'clinical_pharmacology',
          'Buspirone is metabolized primarily by oxidation, which in vitro has been shown to be mediated by cytochrome P450 3A4 (CYP3A4)',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'In a radiolabeled single-dose study, excreted in the urine primarily as metabolites, with fecal excretion a smaller share of the dose',
        populationContext: 'radiolabeled single-dose study, as recorded in the label',
        source: fdaLabel(
          BUSPIRONE_LABEL,
          'FDA label for buspirone hydrochloride tablets (openFDA)',
          'clinical_pharmacology',
          'In a single-dose study using 14 C-labeled buspirone, 29% to 63% of the dose was excreted in the urine within 24 hours, primarily as metabolites; fecal excretion accounted for 18% to 38% of the dose.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(2.5),
    },
    productVariants: [
      {
        brandName: 'Buspirone Hydrochloride',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: '5 mg, 7.5 mg, 10 mg, 15 mg, and 30 mg',
        approvedUseAsRecorded:
          'Management of anxiety disorders or the short-term relief of the symptoms of anxiety',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2019-05-03',
        source: fdaLabel(
          BUSPIRONE_LABEL,
          'FDA label for buspirone hydrochloride tablets (openFDA)',
          'indications_and_usage; how_supplied',
          'Buspirone hydrochloride tablets are indicated for the management of anxiety disorders or the short-term relief of the symptoms of anxiety.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'Moderate affinity for brain D2-dopamine receptors, as recorded in the label; the mechanism of action is stated as unknown',
        source: fdaLabel(
          BUSPIRONE_LABEL,
          'FDA label for buspirone hydrochloride tablets (openFDA)',
          'clinical_pharmacology',
          'Buspirone has moderate affinity for brain D 2 -dopamine receptors.',
        ),
      },
    ],
  },

  carbamazepine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '2554',
      casNumber: '298-46-4',
      unii: '33CM23913M',
      rxcui: '2002',
      source: {
        kind: 'PUBCHEM',
        identifier: '2554',
        label: "PubChem compound record matched for 'carbamazepine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets, extended-release tablets, and suspension), taken with meals',
      tMax: {
        display:
          'approximately 1.5 hours (suspension); 4 to 5 hours (conventional tablets); 3 to 12 hours (extended-release tablets)',
        numeric: 4.5,
        unit: 'hours',
        populationContext: 'chronic oral administration, by formulation, as recorded in the label',
        source: fdaLabel(
          CARBAMAZEPINE_LABEL,
          'FDA label for carbamazepine tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'Following chronic oral administration of suspension, plasma levels peak at approximately 1.5 hours compared to 4 to 5 hours after administration of conventional Carbamazepine tablets, and 3 to 12 hours after administration of Tegretol-XR tablets.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'initially 25 to 65 hours, decreasing to 12 to 17 hours on repeated doses',
        numeric: 14.5,
        unit: 'hours',
        populationContext:
          'variable because carbamazepine induces its own metabolism; the representative number is the repeated-dose range midpoint',
        source: fdaLabel(
          CARBAMAZEPINE_LABEL,
          'FDA label for carbamazepine tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'Because Carbamazepine induces its own metabolism, the half-life is also variable. Autoinduction is completed after 3 to 5 weeks of a fixed dosing regimen. Initial half-life values range from 25 to 65 hours, decreasing to 12 to 17 hours on repeated doses.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '76%',
        numeric: 76,
        unit: '%',
        populationContext: 'binding to plasma proteins in blood, as recorded in the label',
        source: fdaLabel(
          CARBAMAZEPINE_LABEL,
          'FDA label for carbamazepine tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'Carbamazepine in blood is 76% bound to plasma proteins.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolized in the liver; cytochrome P450 3A4 identified as the major isoform responsible for formation of carbamazepine-10,11-epoxide',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          CARBAMAZEPINE_LABEL,
          'FDA label for carbamazepine tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'Carbamazepine is metabolized in the liver. Cytochrome P450 3A4 was identified as the major isoform responsible for the formation of carbamazepine-10,11-epoxide from Carbamazepine.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'After an oral radiolabeled dose, most of the administered radioactivity was found in the urine, largely as hydroxylated and conjugated metabolites',
        populationContext: 'radiolabeled dose study, as recorded in the label',
        source: fdaLabel(
          CARBAMAZEPINE_LABEL,
          'FDA label for carbamazepine tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'After oral administration of 14 C-carbamazepine, 72% of the administered radioactivity was found in the urine and 28% in the feces. This urinary radioactivity was composed largely of hydroxylated and conjugated metabolites, with only 3% of unchanged Carbamazepine.',
        ),
        concordance: 'label_only',
      },
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Initial (adults and children over 12 years of age)',
          amountAsRecorded:
            'Either 200 mg twice a day for tablets and XR tablets, or 1 teaspoon four times a day for suspension (400 mg/day)',
          purposeAsRecorded: 'Label-stated initial dosage for epilepsy',
        },
        {
          order: 2,
          periodAsRecorded: 'At weekly intervals',
          amountAsRecorded:
            'Add up to 200 mg/day using a twice a day regimen of Tegretol-XR or a three times a day or four times a day regimen of the other formulations until the optimal response is obtained',
          purposeAsRecorded: 'Label-stated weekly increase for epilepsy',
        },
        {
          order: 3,
          periodAsRecorded: 'Maintenance',
          amountAsRecorded:
            'Adjust dosage to the minimum effective level, usually 800 to 1200 mg daily',
          purposeAsRecorded: 'Label-stated maintenance dosage for epilepsy',
        },
      ],
      source: fdaLabel(
        CARBAMAZEPINE_LABEL,
        'FDA label for carbamazepine tablets (openFDA)',
        'dosage_and_administration, Epilepsy',
        'Adults and children over 12 years of age-Initial : Either 200 mg twice a day for tablets and XR tablets, or 1 teaspoon four times a day for suspension (400 mg/day). Increase at weekly intervals by adding up to 200 mg/day using a twice a day regimen of Tegretol-XR or a three times a day or four times a day regimen of the other formulations until the optimal response is obtained.',
      ),
    },
  },

  carvedilol: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '2585',
      casNumber: '72956-09-3',
      unii: '0K47UL67F2',
      rxcui: '20352',
      source: {
        kind: 'PUBCHEM',
        identifier: '2585',
        label: "PubChem compound record matched for 'carvedilol'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets), taken with food',
      bioavailability: {
        display: 'approximately 25% to 35%',
        numeric: 30,
        unit: '%',
        populationContext:
          'absolute bioavailability after oral administration, reduced by a significant degree of first-pass metabolism',
        source: fdaLabel(
          CARVEDILOL_LABEL,
          'FDA label for carvedilol tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Carvedilol tablets are rapidly and extensively absorbed following oral administration, with absolute bioavailability of approximately 25% to 35% due to a significant degree of first-pass metabolism.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '7 to 10 hours',
        numeric: 8.5,
        unit: 'hours',
        populationContext:
          'apparent mean terminal elimination half-life following oral administration',
        source: fdaLabel(
          CARVEDILOL_LABEL,
          'FDA label for carvedilol tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Following oral administration, the apparent mean terminal elimination half-life of carvedilol generally ranges from 7 to 10 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'more than 98%',
        numeric: 98,
        unit: '%',
        populationContext:
          'binding to plasma proteins, primarily albumin, as recorded in the label',
        source: fdaLabel(
          CARVEDILOL_LABEL,
          'FDA label for carvedilol tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Carvedilol is more than 98% bound to plasma proteins, primarily with albumin. The plasma-protein binding is independent of concentration over the therapeutic range.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 115 L',
        numeric: 115,
        unit: 'L',
        populationContext: 'steady-state volume of distribution, as recorded in the label',
        source: fdaLabel(
          CARVEDILOL_LABEL,
          'FDA label for carvedilol tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Carvedilol is a basic, lipophilic compound with a steady-state volume of distribution of approximately 115 L, indicating substantial distribution into extravascular tissues.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized, primarily by aromatic ring oxidation and glucuronidation; the primary P450 enzymes are CYP2D6 and CYP2C9',
        populationContext: 'human liver microsome data, as recorded in the label',
        source: fdaLabel(
          CARVEDILOL_LABEL,
          'FDA label for carvedilol tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'The primary P450 enzymes responsible for the metabolism of both R(+) and S(-)-carvedilol in human liver microsomes were CYP2D6 and CYP2C9 and to a lesser extent CYP3A4, 2C19, 1A2, and 2E1.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: 'The metabolites of carvedilol are excreted primarily via the bile into the feces',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          CARVEDILOL_LABEL,
          'FDA label for carvedilol tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Carvedilol is metabolized primarily by aromatic ring oxidation and glucuronidation. The oxidative metabolites are further metabolized by conjugation via glucuronidation and sulfation. The metabolites of carvedilol are excreted primarily via the bile into the feces.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(8.5),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Starting dose, for 2 weeks',
          amountAsRecorded: '3.125 mg twice daily',
          purposeAsRecorded: 'Label-stated starting dose for heart failure',
        },
        {
          order: 2,
          periodAsRecorded: 'Successive intervals of at least 2 weeks',
          amountAsRecorded: 'If tolerated, dose increased to 6.25, 12.5, and 25 mg twice daily',
          purposeAsRecorded:
            'Label-stated up-titration for heart failure; lower doses are maintained when higher doses are not tolerated',
        },
      ],
      source: fdaLabel(
        CARVEDILOL_LABEL,
        'FDA label for carvedilol tablets (openFDA)',
        'dosage_and_administration 2.1 Heart Failure',
        'The recommended starting dose of Carvedilol tablets are 3.125 mg twice daily for 2 weeks. If tolerated, patients may have their dose increased to 6.25, 12.5, and 25 mg twice daily over successive intervals of at least 2 weeks.',
      ),
    },
    productVariants: [
      {
        brandName: 'Carvedilol',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: 'Tablets: 3.125 mg, 6.25 mg, 12.5 mg, 25 mg',
        approvedUseAsRecorded:
          'Treatment of mild to severe chronic heart failure; left ventricular dysfunction following myocardial infarction in clinically stable patients; hypertension',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-05-11',
        source: fdaLabel(
          CARVEDILOL_LABEL,
          'FDA label for carvedilol tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Carvedilol tablets are an alpha/beta-adrenergic blocking agent indicated for the treatment of: mild to severe chronic heart failure ( 1.1 ) left ventricular dysfunction following myocardial infarction in clinically stable patients( 1.2 ) hypertension( 1.3 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'heart',
        actionAsRecorded:
          'Beta-adrenoreceptor blocking activity reduces cardiac output in normal subjects and reduces exercise- and/or isoproterenol-induced tachycardia',
        source: fdaLabel(
          CARVEDILOL_LABEL,
          'FDA label for carvedilol tablets (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics',
          'β-adrenoreceptor blocking activity has been demonstrated in animal and human studies showing that carvedilol (1) reduces cardiac output in normal subjects, (2) reduces exercise- and/or isoproterenol-induced tachycardia and (3) reduces reflex orthostatic tachycardia.',
        ),
      },
      {
        regionCode: 'blood-vessels',
        actionAsRecorded:
          'Alpha-1-adrenoreceptor blocking activity causes vasodilation and reduces peripheral vascular resistance',
        source: fdaLabel(
          CARVEDILOL_LABEL,
          'FDA label for carvedilol tablets (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics',
          'α 1 -adrenoreceptor blocking activity has been demonstrated in human and animal studies, showing that carvedilol (1) attenuates the pressor effects of phenylephrine, (2) causes vasodilation and (3) reduces peripheral vascular resistance.',
        ),
      },
    ],
  },

  celecoxib: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '2662',
      casNumber: '169590-42-5',
      unii: 'JCX84Q7J1L',
      rxcui: '140587',
      source: {
        kind: 'PUBCHEM',
        identifier: '2662',
        label: "PubChem compound record matched for 'celecoxib'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (capsules)',
      tMax: {
        display: 'approximately 3 hours',
        numeric: 3,
        unit: 'hours',
        populationContext: 'peak plasma levels after an oral dose, as recorded in the label',
        source: fdaLabel(
          CELECOXIB_LABEL,
          'FDA label for celecoxib capsules (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Peak plasma levels of celecoxib occur approximately 3 hours after an oral dose.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 11 hours',
        numeric: 11,
        unit: 'hours',
        populationContext: 'effective half-life under fasted conditions',
        source: fdaLabel(
          CELECOXIB_LABEL,
          'FDA label for celecoxib capsules (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'It appears that the low solubility of the drug prolongs the absorption process making terminal half-life (t 1/2 ) determinations more variable. The effective half-life is approximately 11 hours under fasted conditions.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 97%',
        numeric: 97,
        unit: '%',
        populationContext:
          'healthy subjects within the clinical dose range; binds primarily to albumin',
        source: fdaLabel(
          CELECOXIB_LABEL,
          'FDA label for celecoxib capsules (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'In healthy subjects, celecoxib is highly protein bound (~97%) within the clinical dose range. In vitro studies indicate that celecoxib binds primarily to albumin and, to a lesser extent, α1-acid glycoprotein.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 400 L',
        numeric: 400,
        unit: 'L',
        populationContext: 'apparent volume of distribution at steady state (Vss/F)',
        source: fdaLabel(
          CELECOXIB_LABEL,
          'FDA label for celecoxib capsules (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The apparent volume of distribution at steady state (V ss /F) is approximately 400 L, suggesting extensive distribution into the tissues.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolism primarily mediated via CYP2C9; the three identified human plasma metabolites are inactive as COX-1 or COX-2 inhibitors',
        populationContext: 'human plasma metabolite data, as recorded in the label',
        source: fdaLabel(
          CELECOXIB_LABEL,
          'FDA label for celecoxib capsules (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Celecoxib metabolism is primarily mediated via CYP2C9. Three metabolites, a primary alcohol, the corresponding carboxylic acid and its glucuronide conjugate, have been identified in human plasma. These metabolites are inactive as COX-1 or COX-2 inhibitors.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Eliminated predominantly by hepatic metabolism, with little unchanged drug recovered in the urine and feces',
        populationContext: 'radiolabeled single-dose data, as recorded in the label',
        source: fdaLabel(
          CELECOXIB_LABEL,
          'FDA label for celecoxib capsules (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Celecoxib is eliminated predominantly by hepatic metabolism with little (<3%) unchanged drug recovered in the urine and feces. Following a single oral dose of radiolabeled drug, approximately 57% of the dose was excreted in the feces and 27% was excreted into the urine.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(11),
    },
    productVariants: [
      {
        brandName: 'Celecoxib',
        formAsRecorded: 'Capsules',
        strengthsAsRecorded: 'Capsules: 50 mg, 100 mg, 200 mg and 400 mg',
        approvedUseAsRecorded:
          'Osteoarthritis; rheumatoid arthritis; juvenile rheumatoid arthritis in patients 2 years and older; ankylosing spondylitis; acute pain; primary dysmenorrhea',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2023-08-24',
        source: fdaLabel(
          CELECOXIB_LABEL,
          'FDA label for celecoxib capsules (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Celecoxib is a nonsteroidal anti-inflammatory drug indicated for: Osteoarthritis (OA) ( 1.1 ) Rheumatoid Arthritis (RA) ( 1.2 ) Juvenile Rheumatoid Arthritis (JRA) in patients 2 years and older ( 1.3 ) Ankylosing Spondylitis (AS) ( 1.4 ) Acute Pain (AP) ( 1.5 ) Primary Dysmenorrhea (PD) ( 1.6 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'joints',
        actionAsRecorded:
          'Demonstrated significant reduction in joint pain compared to placebo in osteoarthritis of the knee and hip',
        source: fdaLabel(
          CELECOXIB_LABEL,
          'FDA label for celecoxib capsules (openFDA)',
          'clinical_studies 14.1 Osteoarthritis',
          'Celecoxib has demonstrated significant reduction in joint pain compared to placebo. Celecoxib was evaluated for treatment of the signs and the symptoms of OA of the knee and hip in placebo- and active-controlled clinical trials of up to 12 weeks duration.',
        ),
      },
      {
        regionCode: 'kidneys',
        actionAsRecorded:
          'Inhibition of PGE2 synthesis may lead to sodium and water retention through increased reabsorption in the renal medullary thick ascending loop of Henle',
        source: fdaLabel(
          CELECOXIB_LABEL,
          'FDA label for celecoxib capsules (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics, Fluid Retention',
          'Inhibition of PGE2 synthesis may lead to sodium and water retention through increased reabsorption in the renal medullary thick ascending loop of Henle and perhaps other segments of the distal nephron.',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT00346216',
      includedAsRecorded: [
        'Subjects with osteoarthritis or rheumatoid Arthritis with or at risk of developing cardiovascular disease and who require and eligible for chronic, daily therapy with an NSAID to control arthritis sign and symptoms',
      ],
      excludedAsRecorded: [
        'Subjects have had a recent cardiovascular event, unstable cardiovascular conditions, or any major surgery (cardiac or non-cardiac) within 3 months prior to randomization',
        'Subjects with medical or laboratory abnormality that would make the subject inappropriate for entry into this trial',
        'Subjects require treatment with aspirin > 325 mg /day',
        'Subjects with known hypersensitivity to celecoxib, ibuprofen, naproxen, aspirin or esomeprazole, etc.',
      ],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT00346216',
        label:
          'ClinicalTrials.gov record for the PRECISION trial (cardiovascular safety of celecoxib versus naproxen and ibuprofen)',
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: FETCHED,
        excerpt:
          'Subjects with osteoarthritis or rheumatoid Arthritis with or at risk of developing cardiovascular disease and who require and eligible for chronic, daily therapy with an NSAID to control arthritis sign and symptoms.',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT00346216',
        endpointAsRecorded:
          "Primary analysis of the adjudicated Antiplatelet Trialists' Collaboration (APTC) composite endpoint (cardiovascular death, non-fatal myocardial infarction, and non-fatal stroke)",
        activeResultAsRecorded:
          'Celecoxib: 188 of 8,072 subjects with events (2.3%) in the intent-to-treat analysis',
        comparatorResultAsRecorded:
          'Ibuprofen: 218 of 8,040 subjects with events (2.7%); naproxen: 201 of 7,969 subjects with events (2.5%)',
        differenceAsRecorded:
          'Hazard ratio 0.93 for celecoxib versus naproxen and 0.86 for celecoxib versus ibuprofen',
        uncertaintyAsRecorded:
          '95% CI 0.76 to 1.13 versus naproxen and 0.70 to 1.04 versus ibuprofen',
        timepointAsRecorded: 'Intent-to-treat analysis through month 30',
        source: fdaLabel(
          CELECOXIB_LABEL,
          'FDA label for celecoxib capsules (openFDA)',
          'clinical_studies 14.6, Table 5 (PRECISION; NCT00346216)',
          'Table 5. Primary Analysis of the Adjudicated APTC Composite Endpoint Intent-To-Treat Analysis (ITT, through month 30) Celecoxib Ibuprofen Naproxen N 8,072 8,040 7,969 Subjects with Events 188 (2.3%) 218 (2.7%) 201 (2.5%) Pairwise Comparison Celecoxib vs. Naproxen Celecoxib vs. Ibuprofen Ibuprofen vs. Naproxen HR (95% CI) 0.93 (0.76, 1.13) 0.86 (0.70, 1.04) 1.08 (0.89, 1.31)',
        ),
      },
    ],
  },

  clindamycin: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '446598',
      casNumber: '18323-44-9',
      unii: 'EH6D7113I8',
      rxcui: '21235',
      source: {
        kind: 'PUBCHEM',
        identifier: '446598',
        label: "PubChem compound record matched for 'clindamycin'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Topical (lotion), applied to the affected area',
      metabolismAsRecorded: {
        display:
          'Clindamycin phosphate is inactive in vitro; rapid in vivo hydrolysis converts it to the antibacterially active clindamycin',
        populationContext: 'topical clindamycin phosphate, as recorded in the label',
        source: fdaLabel(
          CLINDAMYCIN_LABEL,
          'FDA label for clindamycin phosphate topical lotion (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'Although clindamycin phosphate is inactive in vitro , rapid in vivo hydrolysis converts this compound to the antibacterially active clindamycin.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Following multiple topical applications, very low levels of clindamycin are present in the serum and less than 0.2% of the dose is recovered in urine as clindamycin',
        populationContext:
          'multiple topical applications at a concentration equivalent to 10 mg clindamycin per mL',
        source: fdaLabel(
          CLINDAMYCIN_LABEL,
          'FDA label for clindamycin phosphate topical lotion (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'Following multiple topical applications of clindamycin phosphate at a concentration equivalent to 10 mg clindamycin per mL in an isopropyl alcohol and water solution, very low levels of clindamycin are present in the serum (0–3 ng/mL) and less than 0.2% of the dose is recovered in urine as clindamycin.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Clindamycin Phosphate',
        formAsRecorded: 'Topical lotion',
        strengthsAsRecorded:
          '1% (clindamycin phosphate equivalent to 10 mg clindamycin per milliliter)',
        approvedUseAsRecorded: 'Treatment of acne vulgaris',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product (Rx only); FDA label in effect 2024-03-22',
        source: fdaLabel(
          CLINDAMYCIN_LABEL,
          'FDA label for clindamycin phosphate topical lotion (openFDA)',
          'indications_and_usage; how_supplied',
          'Clindamycin phosphate topical lotion is indicated in the treatment of acne vulgaris.',
        ),
      },
    ],
  },
}
