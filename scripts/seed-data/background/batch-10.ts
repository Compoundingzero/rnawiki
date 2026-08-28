import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import type { BackgroundSource } from '@/lib/background/types'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 10: ipratropium, l-theanine, lamotrigine, levetiracetam, magnesium-glycinate, meloxicam,
 * methadone, mirtazapine, morphine, naproxen, nitrofurantoin.
 *
 * Honest omissions in this batch:
 * - ipratropium: the openFDA label matched (Ipratropium Bromide nasal spray) but carries none of
 *   the requested text sections, and a re-fetch under "ipratropium bromide" returned the same
 *   empty-sectioned label — registry identifiers only.
 * - l-theanine and magnesium-glycinate: no applicable FDA drug label exists for these
 *   supplements — registry identifiers from PubChem only.
 * - methadone: the fetched label is the parenteral (injection) product, so no oral
 *   bioavailability or tMax exists to record; steadyStateNote is omitted because the label
 *   reports a very wide terminal half-life range (8 to 59 hours) and separately states that
 *   steady state is not attained until 3 to 5 days.
 * - morphine: steadyStateNote is omitted because the label reports two different terminal
 *   half-life readings (approximately 2 hours after IV administration; about 15 hours with
 *   longer plasma sampling) for the same medicine.
 * - lamotrigine and mirtazapine: no anatomy target is recorded because the fetched mechanism
 *   text names receptor and channel activity but no specific organ or anatomical structure.
 * - No applicability or pivotal-results module is recorded for any medicine in this batch: none
 *   of the fetched labels states a trial registry (NCT) identifier.
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

const LAMOTRIGINE_LABEL = '003663e5-c0c7-4fc1-a64d-313f2a5b10d2'
const LEVETIRACETAM_LABEL = '01aef7f7-6092-4e39-8451-dc02d8db9254'
const MELOXICAM_LABEL = '06a401f0-4380-4081-86ed-a309a25abf6b'
const METHADONE_LABEL = '092d78eb-6423-495c-bf0d-e6532bea7138'
const MIRTAZAPINE_LABEL = '0f19ab40-1a30-4ac2-9bd7-c2f8199e29e1'
const MORPHINE_LABEL = '07593aa4-f2c4-4d6e-b186-ab2a4ecaa38a'
const NAPROXEN_LABEL = '000155a8-709c-44e5-a75f-cd890f3a7caf'
const NITROFURANTOIN_LABEL = '04af8b73-7e15-7da8-e063-6294a90af284'

export const BACKGROUND_BATCH_10: RecordedBackgroundBySlug = {
  ipratropium: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '657309',
      casNumber: '60205-81-4',
      unii: 'J697UZ2A9J',
      rxcui: '1309404',
      source: {
        kind: 'PUBCHEM',
        identifier: '657309',
        label: "PubChem compound record matched for 'ipratropium'",
        retrievedAt: FETCHED,
      },
    },
  },

  'l-theanine': {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '439378',
      casNumber: '3081-61-6',
      rxcui: '38022',
      source: {
        kind: 'PUBCHEM',
        identifier: '439378',
        label: "PubChem compound record matched for 'theanine'",
        retrievedAt: FETCHED,
      },
    },
  },

  lamotrigine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '3878',
      casNumber: '84057-84-1',
      unii: 'U3H27498KS',
      rxcui: '28439',
      source: {
        kind: 'PUBCHEM',
        identifier: '3878',
        label: "PubChem compound record matched for 'lamotrigine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (orally disintegrating tablets)',
      bioavailability: {
        display: '98%',
        numeric: 98,
        unit: '%',
        populationContext:
          'absolute bioavailability after oral administration, with negligible first-pass metabolism',
        source: fdaLabel(
          LAMOTRIGINE_LABEL,
          'FDA label for lamotrigine orally disintegrating tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Lamotrigine is rapidly and completely absorbed after oral administration with negligible first-pass metabolism (absolute bioavailability is 98%). The bioavailability is not affected by food.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '1.4 to 4.8 hours',
        numeric: 3.1,
        unit: 'hours',
        populationContext: 'peak plasma concentrations following drug administration',
        source: fdaLabel(
          LAMOTRIGINE_LABEL,
          'FDA label for lamotrigine orally disintegrating tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Peak plasma concentrations occur anywhere from 1.4 to 4.8 hours following drug administration.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '32.8 hours (range 14 to 103)',
        numeric: 32.8,
        unit: 'hours',
        populationContext:
          'healthy volunteers taking no other medications, single-dose lamotrigine',
        source: fdaLabel(
          LAMOTRIGINE_LABEL,
          'FDA label for lamotrigine orally disintegrating tablets (openFDA)',
          'clinical_pharmacology 12.3, Table 14',
          'Healthy volunteers taking no other medications: Single-dose lamotrigine 179 2.2 (0.25 to 12) 32.8 (14 to 103) 0.44 (0.12 to 1.1)',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 55%',
        numeric: 55,
        unit: '%',
        populationContext: 'in vitro, at plasma lamotrigine concentrations from 1 to 10 mcg/mL',
        source: fdaLabel(
          LAMOTRIGINE_LABEL,
          'FDA label for lamotrigine orally disintegrating tablets (openFDA)',
          'clinical_pharmacology 12.3 Protein Binding',
          'Data from in vitro studies indicate that lamotrigine is approximately 55% bound to human plasma proteins at plasma lamotrigine concentrations from 1 to 10 mcg/mL (10 mcg/mL is 4 to 6 times the trough plasma concentration observed in the controlled efficacy trials).',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '0.9 to 1.3 L/kg',
        numeric: 1.1,
        unit: 'L/kg',
        populationContext:
          'mean apparent volume of distribution (Vd/F) following oral administration',
        source: fdaLabel(
          LAMOTRIGINE_LABEL,
          'FDA label for lamotrigine orally disintegrating tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Estimates of the mean apparent volume of distribution (Vd/F) of lamotrigine following oral administration ranged from 0.9 to 1.3 L/kg.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolized predominantly by glucuronic acid conjugation; the major metabolite is an inactive 2-N-glucuronide conjugate',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          LAMOTRIGINE_LABEL,
          'FDA label for lamotrigine orally disintegrating tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Lamotrigine is metabolized predominantly by glucuronic acid conjugation; the major metabolite is an inactive 2-N-glucuronide conjugate.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'After an oral radiolabeled dose, 94% was recovered in the urine and 2% in the feces',
        populationContext:
          '6 healthy volunteers given radiolabeled lamotrigine, as recorded in the label',
        source: fdaLabel(
          LAMOTRIGINE_LABEL,
          'FDA label for lamotrigine orally disintegrating tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'After oral administration of 240 mg of 14 C-lamotrigine (15 μCi) to 6 healthy volunteers, 94% was recovered in the urine and 2% was recovered in the feces.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(32.8),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Weeks 1 and 2',
          amountAsRecorded: '25 mg every day',
          purposeAsRecorded:
            'Escalation regimen recorded for patients older than 12 years not taking carbamazepine, phenytoin, phenobarbital, primidone, or valproate',
        },
        {
          order: 2,
          periodAsRecorded: 'Weeks 3 and 4',
          amountAsRecorded: '50 mg/day',
        },
        {
          order: 3,
          periodAsRecorded: 'Week 5 onward to maintenance',
          amountAsRecorded: 'Increase by 50 mg/day every 1 to 2 weeks.',
        },
      ],
      source: fdaLabel(
        LAMOTRIGINE_LABEL,
        'FDA label for lamotrigine orally disintegrating tablets (openFDA)',
        'dosage_and_administration 2.2, Table 1 (patients older than 12 years with epilepsy)',
        'Weeks 1 and 2 25 mg every other day 25 mg every day 50 mg/day Weeks 3 and 4 25 mg every day 50 mg/day 100 mg/day (in 2 divided doses) Week 5 onward to maintenance Increase by 25 to 50 mg/day every 1 to 2 weeks. Increase by 50 mg/day every 1 to 2 weeks. Increase by 100 mg/day every 1 to 2 weeks.',
      ),
    },
    productVariants: [
      {
        brandName: 'Lamotrigine',
        formAsRecorded: 'Orally disintegrating tablets',
        strengthsAsRecorded: '25 mg, 50 mg, 100 mg, and 200 mg',
        approvedUseAsRecorded:
          'Epilepsy: adjunctive therapy for partial-onset seizures, primary generalized tonic-clonic seizures and generalized seizures of Lennox-Gastaut syndrome in patients aged 2 years and older, and conversion to monotherapy in patients aged 16 years and older with partial-onset seizures; bipolar disorder: maintenance treatment of bipolar I disorder to delay the time to occurrence of mood episodes',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-04-22',
        source: fdaLabel(
          LAMOTRIGINE_LABEL,
          'FDA label for lamotrigine orally disintegrating tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Lamotrigine orally disintegrating tablets are indicated for: Epilepsy—adjunctive therapy in patients aged 2 years and older : partial-onset seizures. primary generalized tonic-clonic (PGTC) seizures. generalized seizures of Lennox-Gastaut syndrome. ( 1.1 )',
        ),
      },
    ],
  },

  levetiracetam: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5284583',
      casNumber: '102767-28-2',
      unii: '44YRR34555',
      rxcui: '114477',
      source: {
        kind: 'PUBCHEM',
        identifier: '5284583',
        label: "PubChem compound record matched for 'levetiracetam'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets), with or without food',
      bioavailability: {
        display: '100%',
        numeric: 100,
        unit: '%',
        populationContext: 'oral bioavailability of levetiracetam tablets',
        source: fdaLabel(
          LEVETIRACETAM_LABEL,
          'FDA label for levetiracetam tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption and Distribution',
          'The oral bioavailability of levetiracetam tablets is 100% and the tablets and oral solution are bioequivalent in rate and extent of absorption.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'about an hour',
        numeric: 1,
        unit: 'hours',
        populationContext:
          'fasted subjects, peak plasma concentrations following oral administration',
        source: fdaLabel(
          LEVETIRACETAM_LABEL,
          'FDA label for levetiracetam tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption and Distribution',
          'Absorption of levetiracetam is rapid, with peak plasma concentrations occurring in about an hour following oral administration in fasted subjects.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '7 ± 1 hour',
        numeric: 7,
        unit: 'hours',
        populationContext: 'adults; unaffected by either dose or repeated administration',
        source: fdaLabel(
          LEVETIRACETAM_LABEL,
          'FDA label for levetiracetam tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'Levetiracetam plasma half-life in adults is 7 ± 1 hour and is unaffected by either dose or repeated administration.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'less than 10%',
        numeric: 10,
        unit: '%',
        populationContext: 'levetiracetam and its major metabolite, binding to plasma proteins',
        source: fdaLabel(
          LEVETIRACETAM_LABEL,
          'FDA label for levetiracetam tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption and Distribution',
          'Levetiracetam and its major metabolite are less than 10% bound to plasma proteins; clinically significant interactions with other drugs through competition for protein binding sites are therefore unlikely.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Not extensively metabolized; the major pathway is enzymatic hydrolysis of the acetamide group and is not dependent on any liver cytochrome P450 isoenzymes',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          LEVETIRACETAM_LABEL,
          'FDA label for levetiracetam tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Levetiracetam is not extensively metabolized in humans. The major metabolic pathway is the enzymatic hydrolysis of the acetamide group, which produces the carboxylic acid metabolite, ucb L057 (24% of dose) and is not dependent on any liver cytochrome P450 isoenzymes.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Eliminated from the systemic circulation by renal excretion as unchanged drug, representing 66% of administered dose',
        populationContext: 'human elimination data, as recorded in the label',
        source: fdaLabel(
          LEVETIRACETAM_LABEL,
          'FDA label for levetiracetam tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'Levetiracetam is eliminated from the systemic circulation by renal excretion as unchanged drug which represents 66% of administered dose.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(7),
    },
    productVariants: [
      {
        brandName: 'Levetiracetam',
        formAsRecorded: 'Film-coated, scored tablets',
        strengthsAsRecorded: '250 mg, 500 mg, 750 mg, and 1000 mg',
        approvedUseAsRecorded:
          'Treatment of partial-onset seizures in patients 1 month of age and older; adjunctive therapy for myoclonic seizures in patients 12 years of age and older with juvenile myoclonic epilepsy and for primary generalized tonic-clonic seizures in patients 6 years of age and older with idiopathic generalized epilepsy',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-11-21',
        source: fdaLabel(
          LEVETIRACETAM_LABEL,
          'FDA label for levetiracetam tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Levetiracetam is indicated for the treatment of partial-onset seizures in patients 1 month of age and older (1.1) Levetiracetam is indicated for adjunctive therapy for the treatment of: Myoclonic seizures in patients 12 years of age and older with juvenile myoclonic epilepsy (1.2) Primary generalized tonic-clonic seizures in patients 6 years of age and older with idiopathic generalized epilepsy',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'A saturable and stereoselective neuronal binding site described in brain tissue is the synaptic vesicle protein SV2A, thought to be involved in the regulation of vesicle exocytosis',
        source: fdaLabel(
          LEVETIRACETAM_LABEL,
          'FDA label for levetiracetam tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'A saturable and stereoselective neuronal binding site in rat brain tissue has been described for levetiracetam. Experimental data indicate that this binding site is the synaptic vesicle protein SV2A, thought to be involved in the regulation of vesicle exocytosis.',
        ),
      },
    ],
  },

  'magnesium-glycinate': {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '84645',
      casNumber: '14783-68-7',
      rxcui: '476818',
      source: {
        kind: 'PUBCHEM',
        identifier: '84645',
        label: "PubChem compound record matched for 'magnesium glycinate'",
        retrievedAt: FETCHED,
      },
    },
  },

  meloxicam: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '54677470',
      casNumber: '71125-38-7',
      unii: 'VG2QF83CGL',
      rxcui: '41493',
      source: {
        kind: 'PUBCHEM',
        identifier: '54677470',
        label: "PubChem compound record matched for 'meloxicam'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets), without regard to timing of meals',
      bioavailability: {
        display: '89%',
        numeric: 89,
        unit: '%',
        populationContext:
          'meloxicam capsules, single oral 30 mg dose compared with 30 mg IV bolus injection',
        source: fdaLabel(
          MELOXICAM_LABEL,
          'FDA label for meloxicam tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'The absolute bioavailability of meloxicam capsules was 89% following a single oral dose of 30 mg compared with 30 mg IV bolus injection.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'four to five hours',
        numeric: 4.5,
        unit: 'hours',
        populationContext: '7.5 mg meloxicam tablet taken under fasted conditions',
        source: fdaLabel(
          MELOXICAM_LABEL,
          'FDA label for meloxicam tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Mean C max was achieved within four to five hours after a 7.5 mg meloxicam tablet was taken under fasted conditions, indicating a prolonged drug absorption.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '15 hours to 20 hours',
        numeric: 17.5,
        unit: 'hours',
        populationContext:
          'mean elimination half-life, constant across dose levels within the therapeutic dose range',
        source: fdaLabel(
          MELOXICAM_LABEL,
          'FDA label for meloxicam tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'The mean elimination half-life (t 1/2 ) ranges from 15 hours to 20 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '~99.4%',
        numeric: 99.4,
        unit: '%',
        populationContext:
          'binding to human plasma proteins (primarily albumin) within the therapeutic dose range',
        source: fdaLabel(
          MELOXICAM_LABEL,
          'FDA label for meloxicam tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Meloxicam is ~99.4% bound to human plasma proteins (primarily albumin) within the therapeutic dose range.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 10 L',
        numeric: 10,
        unit: 'L',
        populationContext: 'mean volume of distribution (Vss), as recorded in the label',
        source: fdaLabel(
          MELOXICAM_LABEL,
          'FDA label for meloxicam tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The mean volume of distribution (Vss) of meloxicam is approximately 10 L.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          "Extensively metabolized in the liver; metabolites include 5'-carboxy meloxicam (60% of dose) from P-450 mediated metabolism",
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          MELOXICAM_LABEL,
          'FDA label for meloxicam tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          "Meloxicam is extensively metabolized in the liver. Meloxicam metabolites include 5'-carboxy meloxicam (60% of dose), from P-450 mediated metabolism formed by oxidation of an intermediate metabolite 5'-hydroxymethyl meloxicam which is also excreted to a lesser extent (9% of dose).",
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Excretion is predominantly in the form of metabolites and occurs to equal extents in the urine and feces',
        populationContext: 'human excretion data, as recorded in the label',
        source: fdaLabel(
          MELOXICAM_LABEL,
          'FDA label for meloxicam tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Meloxicam excretion is predominantly in the form of metabolites, and occurs to equal extents in the urine and feces.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(17.5),
    },
    productVariants: [
      {
        brandName: 'Meloxicam',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: 'Tablets: 7.5 mg and 15 mg',
        approvedUseAsRecorded:
          'Relief of the signs and symptoms of osteoarthritis and rheumatoid arthritis; relief of the signs and symptoms of pauciarticular or polyarticular course juvenile rheumatoid arthritis in patients who weigh 60 kg or more',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-08-08',
        source: fdaLabel(
          MELOXICAM_LABEL,
          'FDA label for meloxicam tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Meloxicam tablet USP is a non-steroidal anti-inflammatory drug indicated for: Osteoarthritis (OA) ( 1.1 ) Rheumatoid Arthritis (RA) ( 1.2 ) Juvenile Rheumatoid Arthritis (JRA) in patients who weigh ≥60 kg ( 1.3 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'joints',
        actionAsRecorded:
          'Concentrations in synovial fluid after a single oral dose range from 40% to 50% of those in plasma',
        source: fdaLabel(
          MELOXICAM_LABEL,
          'FDA label for meloxicam tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Meloxicam concentrations in synovial fluid, after a single oral dose, range from 40% to 50% of those in plasma.',
        ),
      },
    ],
  },

  methadone: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '4095',
      casNumber: '76-99-3',
      unii: '229809935B',
      rxcui: '218337',
      source: {
        kind: 'PUBCHEM',
        identifier: '4095',
        label: "PubChem compound record matched for 'methadone'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Parenteral (intravenous, subcutaneous and intramuscular injection)',
      halfLife: {
        display: '8 to 59 hours',
        numeric: 33.5,
        unit: 'hours',
        populationContext: 'terminal half-life after single intravenous dose administration',
        source: fdaLabel(
          METHADONE_LABEL,
          'FDA label for methadone hydrochloride injection (openFDA)',
          'clinical_pharmacology, Pharmacokinetics — Excretion',
          'After single intravenous dose administration the plasma clearance of methadone ranged between 3 L/h to 10 L/h and the terminal half-life (t ½ ) ranged between 8 to 59 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '85% to 90%',
        numeric: 87.5,
        unit: '%',
        populationContext: 'predominantly bound to α1-acid glycoprotein in plasma',
        source: fdaLabel(
          METHADONE_LABEL,
          'FDA label for methadone hydrochloride injection (openFDA)',
          'clinical_pharmacology, Pharmacokinetics — Distribution',
          'In plasma, methadone is predominantly bound to α 1 -acid glycoprotein (85% to 90%).',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '2 L/kg to 6 L/kg',
        numeric: 4,
        unit: 'L/kg',
        populationContext:
          'steady state volume of distribution; lipophilic drug, as recorded in the label',
        source: fdaLabel(
          METHADONE_LABEL,
          'FDA label for methadone hydrochloride injection (openFDA)',
          'clinical_pharmacology, Pharmacokinetics — Distribution',
          'Methadone is a lipophilic drug and the steady state volume of distribution ranges between 2 L/kg to 6 L/kg.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Primarily metabolized by N-demethylation to an inactive metabolite (EDDP); CYP3A4, CYP2B6, CYP2C19, CYP2C9 and CYP2D6 are responsible for the conversion',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          METHADONE_LABEL,
          'FDA label for methadone hydrochloride injection (openFDA)',
          'clinical_pharmacology, Pharmacokinetics — Metabolism',
          'Methadone is primarily metabolized by N-demethylation to an inactive metabolite, 2-ethylidene-1,5-dimethyl-3,3-diphenylpyrrolidene (EDDP). Cytochrome P450 enzymes, primarily CYP3A4, CYP2B6, CYP2C19, CYP2C9 and CYP2D6, are responsible for conversion of methadone to EDDP and other inactive metabolites, which are excreted mainly in urine.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: 'Mediated by extensive biotransformation, followed by renal and fecal excretion',
        populationContext: 'human elimination data, as recorded in the label',
        source: fdaLabel(
          METHADONE_LABEL,
          'FDA label for methadone hydrochloride injection (openFDA)',
          'clinical_pharmacology, Pharmacokinetics — Excretion',
          'Elimination of methadone is mediated by extensive biotransformation, followed by renal and fecal excretion.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Methadone Hydrochloride',
        formAsRecorded: 'Injection (multiple-dose vials)',
        strengthsAsRecorded: '200 mg/20 mL (10 mg/mL)',
        approvedUseAsRecorded:
          'Management of severe and persistent pain that requires an opioid analgesic and that cannot be adequately treated with alternative options; temporary treatment of opioid dependence in patients unable to take oral medication',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription opioid; FDA label in effect 2025-12-31',
        source: fdaLabel(
          METHADONE_LABEL,
          'FDA label for methadone hydrochloride injection (openFDA)',
          'indications_and_usage; how_supplied',
          'Methadone Hydrochloride Injection is indicated for the management of severe and persistent pain that requires an opioid analgesic and that cannot be adequately treated with alternative options, including immediate-release opioids.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'Mu-agonist; a synthetic opioid analgesic with multiple actions qualitatively similar to those of morphine, the most prominent of which involve the central nervous system',
        source: fdaLabel(
          METHADONE_LABEL,
          'FDA label for methadone hydrochloride injection (openFDA)',
          'clinical_pharmacology, Mechanism of Action',
          'Methadone hydrochloride is a mu-agonist; a synthetic opioid analgesic with multiple actions qualitatively similar to those of morphine, the most prominent of which involve the central nervous system and organs composed of smooth muscle.',
        ),
      },
      {
        regionCode: 'brainstem',
        actionAsRecorded:
          'Produces respiratory depression by direct action on brain stem respiratory centers',
        source: fdaLabel(
          METHADONE_LABEL,
          'FDA label for methadone hydrochloride injection (openFDA)',
          'clinical_pharmacology, Pharmacodynamics — Effects on the Central Nervous System',
          'Methadone produces respiratory depression by direct action on brain stem respiratory centers.',
        ),
      },
      {
        regionCode: 'stomach',
        actionAsRecorded:
          'Causes a reduction in motility associated with an increase in smooth muscle tone in the antrum of the stomach and duodenum',
        source: fdaLabel(
          METHADONE_LABEL,
          'FDA label for methadone hydrochloride injection (openFDA)',
          'clinical_pharmacology, Pharmacodynamics — Effects on the Gastrointestinal Tract',
          'Methadone causes a reduction in motility associated with an increase in smooth muscle tone in the antrum of the stomach and duodenum.',
        ),
      },
    ],
  },

  mirtazapine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '4205',
      casNumber: '85650-52-8',
      unii: 'A051Q2099Q',
      rxcui: '15996',
      source: {
        kind: 'PUBCHEM',
        identifier: '4205',
        label: "PubChem compound record matched for 'mirtazapine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets)',
      bioavailability: {
        display: 'about 50%',
        numeric: 50,
        unit: '%',
        populationContext: 'absolute bioavailability following oral administration',
        source: fdaLabel(
          MIRTAZAPINE_LABEL,
          'FDA label for mirtazapine tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Mirtazapine has an absolute bioavailability of about 50% following oral administration. Peak plasma concentrations of mirtazapine are reached within about 2 hours post dose.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'within about 2 hours',
        numeric: 2,
        unit: 'hours',
        populationContext: 'peak plasma concentrations post dose',
        source: fdaLabel(
          MIRTAZAPINE_LABEL,
          'FDA label for mirtazapine tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Mirtazapine has an absolute bioavailability of about 50% following oral administration. Peak plasma concentrations of mirtazapine are reached within about 2 hours post dose.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 20 to 40 hours',
        numeric: 30,
        unit: 'hours',
        populationContext:
          'following oral administration (mean 37 hours for females versus 26 hours for males, as recorded in the label)',
        source: fdaLabel(
          MIRTAZAPINE_LABEL,
          'FDA label for mirtazapine tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'Mirtazapine has a half-life of about 20 to 40 hours following oral administration of mirtazapine.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 85%',
        numeric: 85,
        unit: '%',
        populationContext:
          'binding to plasma proteins over a concentration range of 0.01 to 10 mcg/mL',
        source: fdaLabel(
          MIRTAZAPINE_LABEL,
          'FDA label for mirtazapine tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Mirtazapine is approximately 85% bound to plasma proteins over a concentration range of 0.01 to 10 mcg/mL.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Major pathways of biotransformation are demethylation and hydroxylation followed by glucuronide conjugation; CYP2D6 and CYP1A2 are involved in forming the 8-hydroxy metabolite, with CYP3A responsible for the N-desmethyl and N-oxide metabolites',
        populationContext: 'in vitro data from human liver microsomes, as recorded in the label',
        source: fdaLabel(
          MIRTAZAPINE_LABEL,
          'FDA label for mirtazapine tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Major pathways of bio-transformation are demethylation and hydroxylation followed by glucuronide conjugation. In vitro data from human liver microsomes indicate that CYP2D6 and CYP1A2 are involved in the formation of the 8-hydroxy metabolite of mirtazapine, whereas CYP3A is considered to be responsible for the formation of the N-desmethyl and N-oxide metabolite.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: 'Eliminated predominantly (75%) via urine with 15% in feces',
        populationContext: 'mirtazapine and its metabolites, as recorded in the label',
        source: fdaLabel(
          MIRTAZAPINE_LABEL,
          'FDA label for mirtazapine tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Mirtazapine and its metabolites are eliminated predominantly (75%) via urine with 15% in feces.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(30),
    },
    productVariants: [
      {
        brandName: 'Mirtazapine',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded:
          'Tablets: 7.5 mg unscored, 15 mg scored, 30 mg scored and 45 mg unscored',
        approvedUseAsRecorded: 'Treatment of major depressive disorder (MDD) in adults',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2022-08-01',
        source: fdaLabel(
          MIRTAZAPINE_LABEL,
          'FDA label for mirtazapine tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Mirtazapine tablets are indicated for the treatment of major depressive disorder (MDD) in adults [see Clinical Studies (14) ].',
        ),
      },
    ],
  },

  morphine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5288826',
      casNumber: '57-27-2',
      unii: 'X3P646A2J0',
      rxcui: '235751',
      source: {
        kind: 'PUBCHEM',
        identifier: '5288826',
        label: "PubChem compound record matched for 'morphine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      bioavailability: {
        display: 'less than 40%',
        numeric: 40,
        unit: '%',
        populationContext:
          'oral morphine sulfate; large inter-individual variability due to extensive pre-systemic metabolism',
        source: fdaLabel(
          MORPHINE_LABEL,
          'FDA label for morphine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'The oral bioavailability of morphine sulfate is less than 40% and shows large inter-individual variability due to extensive pre-systemic metabolism.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 2 hours',
        numeric: 2,
        unit: 'hours',
        populationContext:
          'effective terminal half-life after IV administration; studies with longer plasma sampling reported about 15 hours, as recorded in the label',
        source: fdaLabel(
          MORPHINE_LABEL,
          'FDA label for morphine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'The effective terminal half-life of morphine sulfate after IV administration is reported to be approximately 2 hours. In some studies involving longer periods of plasma sampling, a longer terminal half-life of morphine sulfate of about 15 hours was reported.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '20% to 35%',
        numeric: 27.5,
        unit: '%',
        populationContext: 'reversibly bound to plasma proteins',
        source: fdaLabel(
          MORPHINE_LABEL,
          'FDA label for morphine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The volume of distribution of morphine sulfate is approximately 1 to 6 L/kg, and morphine sulfate is 20% to 35% reversibly bound to plasma proteins.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 1 to 6 L/kg',
        numeric: 3.5,
        unit: 'L/kg',
        populationContext: 'volume of distribution, as recorded in the label',
        source: fdaLabel(
          MORPHINE_LABEL,
          'FDA label for morphine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The volume of distribution of morphine sulfate is approximately 1 to 6 L/kg, and morphine sulfate is 20% to 35% reversibly bound to plasma proteins.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Virtually all morphine sulfate is converted by hepatic metabolism to the 3- and 6-glucuronide metabolites (M3G and M6G; about 50% and 15%, respectively)',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          MORPHINE_LABEL,
          'FDA label for morphine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'While a small fraction (less than 5%) of morphine sulfate is demethylated, virtually all morphine sulfate is converted by hepatic metabolism to the 3- and 6- glucuronide metabolites (M3G and M6G; about 50% and 15%, respectively).',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Most of a dose is excreted in urine as M3G and M6G; approximately 10% of the dose is excreted unchanged in urine',
        populationContext: 'human excretion data, as recorded in the label',
        source: fdaLabel(
          MORPHINE_LABEL,
          'FDA label for morphine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Most of a dose of morphine sulfate is excreted in urine as M3G and M6G, with elimination of morphine sulfate occurring primarily as renal excretion of M3G. Approximately 10% of the dose is excreted unchanged in urine.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Morphine Sulfate',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: 'Tablets: 15 mg and 30 mg',
        approvedUseAsRecorded:
          "Management of acute pain severe enough to require an opioid analgesic and for which alternative treatments are inadequate, in adults and pediatric patients weighing 50 kg and above, and of chronic pain severe enough to require an opioid analgesic in adults, as recorded with the label's limitations of use",
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription opioid; FDA label in effect 2025-10-10',
        source: fdaLabel(
          MORPHINE_LABEL,
          'FDA label for morphine sulfate tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Morphine sulfate tablets are opioid agonists indicated for the management of: adults and pediatric patients weighing 50 kg and above with acute pain severe enough to require an opioid analgesic and for which alternative treatments are inadequate. adults with chronic pain severe enough to require an opioid analgesic and for which alternative treatments are inadequate.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'Specific CNS opioid receptors for endogenous compounds with opioid-like activity have been identified throughout the brain and spinal cord and are thought to play a role in the analgesic effects',
        source: fdaLabel(
          MORPHINE_LABEL,
          'FDA label for morphine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'However, specific CNS opioid receptors for endogenous compounds with opioid-like activity have been identified throughout the brain and spinal cord and are thought to play a role in the analgesic effects of this drug.',
        ),
      },
      {
        regionCode: 'brainstem',
        actionAsRecorded:
          'Produces respiratory depression by direct action on brain stem respiratory centers',
        source: fdaLabel(
          MORPHINE_LABEL,
          'FDA label for morphine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics — Effects on the Central Nervous System',
          'Morphine produces respiratory depression by direct action on brain stem respiratory centers.',
        ),
      },
      {
        regionCode: 'intestines',
        actionAsRecorded:
          'Digestion of food in the small intestine is delayed and propulsive contractions are decreased; propulsive peristaltic waves in the colon are decreased',
        source: fdaLabel(
          MORPHINE_LABEL,
          'FDA label for morphine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics — Effects on the Gastrointestinal Tract',
          'Digestion of food in the small intestine is delayed and propulsive contractions are decreased. Propulsive peristaltic waves in the colon are decreased, while tone may be increased to the point of spasm, resulting in constipation.',
        ),
      },
    ],
  },

  naproxen: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '156391',
      casNumber: '22204-53-1',
      unii: '57Y76R9ATQ',
      rxcui: '7258',
      source: {
        kind: 'PUBCHEM',
        identifier: '156391',
        label: "PubChem compound record matched for 'naproxen'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (naproxen tablets and naproxen sodium tablets)',
      bioavailability: {
        display: '95%',
        numeric: 95,
        unit: '%',
        populationContext:
          'in vivo bioavailability; rapidly and completely absorbed from the gastrointestinal tract',
        source: fdaLabel(
          NAPROXEN_LABEL,
          'FDA label for naproxen and naproxen sodium tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Naproxen and naproxen sodium are rapidly and completely absorbed from the gastrointestinal tract with an in vivo bioavailability of 95%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '2 to 4 hours',
        numeric: 3,
        unit: 'hours',
        populationContext:
          'naproxen tablets (naproxen sodium tablets attain peak plasma levels in 1 to 2 hours)',
        source: fdaLabel(
          NAPROXEN_LABEL,
          'FDA label for naproxen and naproxen sodium tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'After administration of naproxen tablets, peak plasma levels are attained in 2 to 4 hours. After oral administration of naproxen sodium tablets, peak plasma levels are attained in 1 to 2 hours.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '12 to 17 hours',
        numeric: 14.5,
        unit: 'hours',
        populationContext: 'plasma half-life of the naproxen anion in humans',
        source: fdaLabel(
          NAPROXEN_LABEL,
          'FDA label for naproxen and naproxen sodium tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'The plasma half-life of the naproxen anion in humans ranges from 12 to 17 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'greater than 99%',
        numeric: 99,
        unit: '%',
        populationContext: 'albumin-bound at therapeutic levels',
        source: fdaLabel(
          NAPROXEN_LABEL,
          'FDA label for naproxen and naproxen sodium tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'At therapeutic levels naproxen is greater than 99% albumin-bound.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '0.16 L/kg',
        numeric: 0.16,
        unit: 'L/kg',
        populationContext: 'volume of distribution, as recorded in the label',
        source: fdaLabel(
          NAPROXEN_LABEL,
          'FDA label for naproxen and naproxen sodium tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Naproxen has a volume of distribution of 0.16 L/kg.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized in the liver to 6-0-desmethyl naproxen; parent and metabolites do not induce metabolizing enzymes',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          NAPROXEN_LABEL,
          'FDA label for naproxen and naproxen sodium tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Naproxen is extensively metabolized in the liver to 6-0-desmethyl naproxen, and both parent and metabolites do not induce metabolizing enzymes.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: 'Approximately 95% of the naproxen from any dose is excreted in the urine',
        populationContext: 'human excretion data, as recorded in the label',
        source: fdaLabel(
          NAPROXEN_LABEL,
          'FDA label for naproxen and naproxen sodium tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Approximately 95% of the naproxen from any dose is excreted in the urine, primarily as naproxen (<1%), 6-0-desmethyl naproxen (<1%) or their conjugates (66% to 92%).',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(14.5),
    },
    productVariants: [
      {
        brandName: 'Naproxen',
        formAsRecorded: 'Tablets (naproxen); film-coated tablets (naproxen sodium)',
        strengthsAsRecorded:
          'Naproxen Tablets, USP: 250 mg, 375 mg and 500 mg; Naproxen Sodium Tablets, USP: 275 mg and 550 mg',
        approvedUseAsRecorded:
          'Relief of the signs and symptoms of rheumatoid arthritis, osteoarthritis, ankylosing spondylitis, polyarticular juvenile idiopathic arthritis, tendonitis, bursitis and acute gout; management of pain and primary dysmenorrhea',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-01-29',
        source: fdaLabel(
          NAPROXEN_LABEL,
          'FDA label for naproxen and naproxen sodium tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'the relief of the signs and symptoms of: • rheumatoid arthritis • osteoarthritis • ankylosing spondylitis • Polyarticular Juvenile Idiopathic Arthritis Naproxen tablets and naproxen sodium tablets are also indicated for: the relief of signs and symptoms of: • tendonitis • bursitis • acute gout the management of: • pain • primary dysmenorrhea',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'joints',
        actionAsRecorded:
          'In rheumatoid arthritis, improvement was demonstrated by a reduction in joint swelling and a reduction in duration of morning stiffness',
        source: fdaLabel(
          NAPROXEN_LABEL,
          'FDA label for naproxen and naproxen sodium tablets (openFDA)',
          'clinical_studies 14',
          'Improvement in patients treated for rheumatoid arthritis was demonstrated by a reduction in joint swelling, a reduction in duration of morning stiffness, a reduction in disease activity as assessed by both the investigator and patient, and by increased mobility as demonstrated by a reduction in walking time.',
        ),
      },
    ],
  },

  nitrofurantoin: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '6604200',
      casNumber: '67-20-9',
      unii: '927AH8112L',
      rxcui: '221129',
      source: {
        kind: 'PUBCHEM',
        identifier: '6604200',
        label: "PubChem compound record matched for 'nitrofurantoin'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (oral suspension), administered with food',
      eliminationAsRecorded: {
        display:
          'Rapidly excreted in urine; following a dose regimen of 100 mg four times a day for 7 days, average urinary drug recoveries on Day 1 and Day 7 were 42.7% and 43.6%',
        populationContext: 'urinary recovery over 0 hour to 24 hours, as recorded in the label',
        source: fdaLabel(
          NITROFURANTOIN_LABEL,
          'FDA label for nitrofurantoin oral suspension (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'Nitrofurantoin is rapidly excreted in urine, to which it may impart a brown color. Following a dose regimen of 100 mg four times a day for 7 days, average urinary drug recoveries (0 hour to 24 hours) on Day 1 and Day 7 were 42.7% and 43.6%',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Nitrofurantoin',
        formAsRecorded: 'Oral suspension',
        strengthsAsRecorded: 'Oral Suspension: 25 mg/5 mL',
        approvedUseAsRecorded:
          'Treatment of urinary tract infections due to susceptible strains of Escherichia coli, Enterococcus species, Staphylococcus aureus, Klebsiella species and Enterobacter species, in adults and pediatric patients 1 month of age and older',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-03-29',
        source: fdaLabel(
          NITROFURANTOIN_LABEL,
          'FDA label for nitrofurantoin oral suspension (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Nitrofurantoin is a nitrofuran antibacterial indicated in adults and pediatric patients 1 month of age and older for the treatment of urinary tract infections caused by susceptible bacteria. (1)',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'bladder',
        actionAsRecorded:
          'Highly soluble in urine; lacks the broader tissue distribution of other therapeutic agents approved for urinary tract infections',
        source: fdaLabel(
          NITROFURANTOIN_LABEL,
          'FDA label for nitrofurantoin oral suspension (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Nitrofurantoin is highly soluble in urine. Nitrofurantoin lacks the broader tissue distribution of other therapeutic agents approved for urinary tract infections.',
        ),
      },
    ],
  },
}
