import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import type { BackgroundSource } from '@/lib/background/types'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 12: theophylline, tiotropium, topiramate, trazodone, valacyclovir, vancomycin, verapamil,
 * vitamin-c, zinc.
 *
 * Honest omissions in this batch:
 * - tiotropium: both openFDA generic-name searches ("tiotropium" and "tiotropium bromide")
 *   returned the Stiolto Respimat tiotropium bromide and olodaterol combination label, which is a
 *   different product, so no label-derived module is recorded — registry identifiers only.
 * - theophylline titration: the label's Table V dosing schema is a flattened two-column table
 *   whose three steps cannot be captured as one contiguous excerpt within the 400-character
 *   limit, so no titration module is recorded rather than a truncated or stitched one.
 * - theophylline half-life is taken from the label's population table row for adults (16-60
 *   years), otherwise healthy non-smoking asthmatics; the label records widely different values
 *   for other populations.
 * - topiramate and valacyclovir anatomy: the fetched mechanism-of-action text names receptors and
 *   viruses, not a body organ, so no anatomy target is recorded.
 * - trazodone: the fetched label states no numeric elimination half-life, so no half-life or
 *   steady-state note is recorded.
 * - vancomycin anatomy: the label's mechanism text describes action on bacterial cell walls, not
 *   a human organ, so no anatomy target is recorded.
 * - verapamil productVariants: the fetched label (a repackager label) states no tablet strengths
 *   in its fetched sections, so no product-variant module is recorded. Its dosage section
 *   describes individualized titration, not a fixed stepwise schedule, so no titration module.
 * - vitamin-c: the openFDA search returned a multi-ingredient fluoride drops label, which is a
 *   different product — registry identifiers from PubChem and RxNorm only.
 * - zinc: the openFDA search returned a zinc oxide diaper-cream label, which is a different
 *   product — registry identifiers from PubChem and RxNorm only.
 * - No ClinicalTrials.gov applicability or pivotal-results module is recorded in this batch: no
 *   pivotal registry record was fetched and verified for these medicines during authoring.
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

const THEOPHYLLINE_LABEL = '04f1d1da-ce61-45b3-acf4-903cc81d16da'
const TOPIRAMATE_LABEL = '021005ab-6a00-40d8-9aee-20c91613b4d5'
const TRAZODONE_LABEL = '007f38e0-653b-43e4-a1c1-b59997b2762a'
const VALACYCLOVIR_LABEL = '021ab9d0-7b75-40cf-afde-446942d64388'
const VANCOMYCIN_LABEL = '00946db3-d6c5-4534-a870-1ec6e63eda43'
const VERAPAMIL_LABEL = '006cf920-04ae-0b53-cb91-85481972abc2'

export const BACKGROUND_BATCH_12: RecordedBackgroundBySlug = {
  theophylline: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '2153',
      casNumber: '58-55-9',
      unii: '0I55128JYK',
      rxcui: '10438',
      source: {
        kind: 'PUBCHEM',
        identifier: '2153',
        label: "PubChem compound record matched for 'theophylline'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (extended-release tablets)',
      bioavailability: {
        display: '59% relative to an immediate-release product (fasting state)',
        numeric: 59,
        unit: '%',
        populationContext:
          'single-dose study in 15 normal fasting male volunteers, extended-release tablets versus an immediate-release product',
        source: fdaLabel(
          THEOPHYLLINE_LABEL,
          'FDA label for theophylline (anhydrous) extended-release tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics, Absorption',
          'The relative bioavailability of Theophylline (Anhydrous) Extended-Release Tablets given in the fasting state in comparison to an immediate-release product was 59%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '12.8±4.2 hours',
        numeric: 12.8,
        unit: 'hours',
        populationContext:
          'single-dose crossover study, two 400 mg extended-release tablets in 19 normal volunteers immediately after a standardized meal, morning arm',
        source: fdaLabel(
          THEOPHYLLINE_LABEL,
          'FDA label for theophylline (anhydrous) extended-release tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics, Absorption',
          'On the morning arm, the pharmacokinetic parameters were AUC=241.9±83.0 mcg hr/mL, C max =9.3±2.0 mcg/mL, T max =12.8±4.2 hours.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '8.7 hours (range 6.1 to 12.8 hours)',
        numeric: 8.7,
        unit: 'hours',
        populationContext:
          'adults (16-60 years), otherwise healthy non-smoking asthmatics; mean (range) from the label population table',
        source: fdaLabel(
          THEOPHYLLINE_LABEL,
          'FDA label for theophylline (anhydrous) extended-release tablets (openFDA)',
          'clinical_pharmacology, Table I',
          'Adults (16-60 years) otherwise healthy non-smoking asthmatics 0.65 (0.27-1.03) 8.7 (6.1-12.8)',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'about 40%',
        numeric: 40,
        unit: '%',
        populationContext: 'binding to plasma protein, primarily albumin, as recorded in the label',
        source: fdaLabel(
          THEOPHYLLINE_LABEL,
          'FDA label for theophylline (anhydrous) extended-release tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics, Distribution',
          'Once theophylline enters the systemic circulation, about 40% is bound to plasma protein, primarily albumin. Unbound theophylline distributes throughout body water, but distributes poorly into body fat.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 0.45 L/kg (range 0.3-0.7 L/kg)',
        numeric: 0.45,
        unit: 'L/kg',
        populationContext: 'apparent volume of distribution based on ideal body weight',
        source: fdaLabel(
          THEOPHYLLINE_LABEL,
          'FDA label for theophylline (anhydrous) extended-release tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics, Distribution',
          'The apparent volume of distribution of theophylline is approximately 0.45 L/kg (range 0.3-0.7 L/kg) based on ideal body weight.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized in the liver; approximately 90% of the dose is metabolized in adults and children beyond one year of age',
        populationContext: 'adults and children beyond one year of age, as recorded in the label',
        source: fdaLabel(
          THEOPHYLLINE_LABEL,
          'FDA label for theophylline (anhydrous) extended-release tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics, Metabolism',
          'Following oral dosing, theophylline does not undergo any measurable first-pass elimination. In adults and children beyond one year of age, approximately 90% of the dose is metabolized in the liver.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Beyond the first three months of life, approximately 10% of the dose is excreted unchanged in the urine',
        populationContext:
          'patients beyond the first three months of life, as recorded in the label',
        source: fdaLabel(
          THEOPHYLLINE_LABEL,
          'FDA label for theophylline (anhydrous) extended-release tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics, Excretion',
          'In neonates, approximately 50% of the theophylline dose is excreted unchanged in the urine. Beyond the first three months of life, approximately 10% of the theophylline dose is excreted unchanged in the urine.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(8.7),
    },
    productVariants: [
      {
        brandName: 'Theophylline (Anhydrous)',
        formAsRecorded: 'Extended-release tablets',
        strengthsAsRecorded: '400 mg and 600 mg',
        approvedUseAsRecorded:
          'Treatment of the symptoms and reversible airflow obstruction associated with chronic asthma and other chronic lung diseases, e.g., emphysema and chronic bronchitis',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-12-04',
        source: fdaLabel(
          THEOPHYLLINE_LABEL,
          'FDA label for theophylline (anhydrous) extended-release tablets (openFDA)',
          'indications_and_usage; how_supplied',
          'Theophylline is indicated for the treatment of the symptoms and reversible airflow obstruction associated with chronic asthma and other chronic lung diseases, e.g., emphysema and chronic bronchitis.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'lungs',
        actionAsRecorded:
          'Two distinct actions in the airways of patients with reversible obstruction: smooth muscle relaxation (bronchodilation) and suppression of the response of the airways to stimuli',
        source: fdaLabel(
          THEOPHYLLINE_LABEL,
          'FDA label for theophylline (anhydrous) extended-release tablets (openFDA)',
          'clinical_pharmacology, Mechanism of Action',
          'Theophylline has two distinct actions in the airways of patients with reversible obstruction; smooth muscle relaxation (i.e., bronchodilation) and suppression of the response of the airways to stimuli (i.e., non-bronchodilator prophylactic effects).',
        ),
      },
      {
        regionCode: 'muscle',
        actionAsRecorded:
          'Increases the force of contraction of diaphragmatic muscles, apparently through enhancement of calcium uptake through an adenosine-mediated channel',
        source: fdaLabel(
          THEOPHYLLINE_LABEL,
          'FDA label for theophylline (anhydrous) extended-release tablets (openFDA)',
          'clinical_pharmacology, Mechanism of Action',
          'Theophylline increases the force of contraction of diaphragmatic muscles. This action appears to be due to enhancement of calcium uptake through an adenosine-mediated channel.',
        ),
      },
    ],
  },

  tiotropium: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5487426',
      casNumber: '136310-93-5',
      rxcui: '1298831',
      source: {
        kind: 'PUBCHEM',
        identifier: '5487426',
        label: "PubChem compound record matched for 'tiotropium bromide'",
        retrievedAt: FETCHED,
      },
    },
  },

  topiramate: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5284627',
      casNumber: '97240-79-4',
      unii: '0H73WJJ391',
      rxcui: '38404',
      source: {
        kind: 'PUBCHEM',
        identifier: '5284627',
        label: "PubChem compound record matched for 'topiramate'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets)',
      bioavailability: {
        display: 'about 80% relative to a solution (tablet formulation)',
        numeric: 80,
        unit: '%',
        populationContext:
          'relative bioavailability of the tablet formulation compared to a solution; not affected by food',
        source: fdaLabel(
          TOPIRAMATE_LABEL,
          'FDA label for topiramate tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'The relative bioavailability of topiramate from the tablet formulation is about 80% compared to a solution. The bioavailability of topiramate is not affected by food.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'approximately 2 hours',
        numeric: 2,
        unit: 'hours',
        populationContext: 'following a 400 mg oral dose',
        source: fdaLabel(
          TOPIRAMATE_LABEL,
          'FDA label for topiramate tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Absorption of topiramate is rapid, with peak plasma concentrations occurring at approximately 2 hours following a 400 mg oral dose.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '21 hours',
        numeric: 21,
        unit: 'hours',
        populationContext:
          'mean plasma elimination half-life after single or multiple doses, patients with normal renal function',
        source: fdaLabel(
          TOPIRAMATE_LABEL,
          'FDA label for topiramate tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'The mean plasma elimination half-life is 21 hours after single or multiple doses. Steady-state is thus reached in about 4 days in patients with normal renal function.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '15% to 41%',
        numeric: 28,
        unit: '%',
        populationContext:
          'binding to human plasma proteins over the blood concentration range of 0.5 to 250 mcg/mL',
        source: fdaLabel(
          TOPIRAMATE_LABEL,
          'FDA label for topiramate tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Topiramate is 15% to 41% bound to human plasma proteins over the blood concentration range of 0.5 to 250 mcg/mL. The fraction bound decreased as blood concentration increased.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Not extensively metabolized; six metabolites have been identified in humans, none of which constitutes more than 5% of an administered dose',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          TOPIRAMATE_LABEL,
          'FDA label for topiramate tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism and Excretion',
          'Topiramate is not extensively metabolized and is primarily eliminated unchanged in the urine (approximately 70% of an administered dose). Six metabolites have been identified in humans, none of which constitutes more than 5% of an administered dose.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Primarily eliminated unchanged in the urine (approximately 70% of an administered dose)',
        populationContext: 'human elimination data, as recorded in the label',
        source: fdaLabel(
          TOPIRAMATE_LABEL,
          'FDA label for topiramate tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism and Excretion',
          'Topiramate is not extensively metabolized and is primarily eliminated unchanged in the urine (approximately 70% of an administered dose). Six metabolites have been identified in humans, none of which constitutes more than 5% of an administered dose.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(21),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Week 1',
          amountAsRecorded: '25 mg morning dose; 25 mg evening dose',
          purposeAsRecorded:
            'Label Table 1 monotherapy epilepsy titration schedule for adults and pediatric patients 10 years and older',
        },
        {
          order: 2,
          periodAsRecorded: 'Week 2',
          amountAsRecorded: '50 mg morning dose; 50 mg evening dose',
        },
        {
          order: 3,
          periodAsRecorded: 'Week 3',
          amountAsRecorded: '75 mg morning dose; 75 mg evening dose',
        },
        {
          order: 4,
          periodAsRecorded: 'Week 4',
          amountAsRecorded: '100 mg morning dose; 100 mg evening dose',
        },
        {
          order: 5,
          periodAsRecorded: 'Week 5',
          amountAsRecorded: '150 mg morning dose; 150 mg evening dose',
        },
        {
          order: 6,
          periodAsRecorded: 'Week 6',
          amountAsRecorded: '200 mg morning dose; 200 mg evening dose',
        },
      ],
      source: fdaLabel(
        TOPIRAMATE_LABEL,
        'FDA label for topiramate tablets (openFDA)',
        'dosage_and_administration 2.1, Table 1',
        'Table 1: Monotherapy Titration Schedule for Adults and Pediatric Patients 10 years and older Morning Dose Evening Dose Week 1 25 mg 25 mg Week 2 50 mg 50 mg Week 3 75 mg 75 mg Week 4 100 mg 100 mg Week 5 150 mg 150 mg Week 6 200 mg 200 mg',
      ),
    },
    productVariants: [
      {
        brandName: 'Topiramate',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: 'Tablets: 25 mg, 50 mg, 100 mg, and 200 mg',
        approvedUseAsRecorded:
          'Epilepsy: initial monotherapy for partial-onset or primary generalized tonic-clonic seizures in patients 2 years of age and older; adjunctive therapy for partial-onset seizures, primary generalized tonic-clonic seizures, or seizures associated with Lennox-Gastaut syndrome in patients 2 years of age and older; preventive treatment of migraine in patients 12 years of age and older',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-06-08',
        source: fdaLabel(
          TOPIRAMATE_LABEL,
          'FDA label for topiramate tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Topiramate is indicated for: Epilepsy: initial monotherapy for the treatment of partial-onset or primary generalized tonic-clonic seizures in patients 2 years of age and older (1.1); adjunctive therapy for the treatment of partial-onset seizures, primary generalized tonic-clonic seizures, or seizures associated with Lennox- Gastaut syndrome in patients 2 years of age and older (1.2)',
        ),
      },
    ],
  },

  trazodone: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5533',
      casNumber: '19794-93-5',
      unii: '6E8ZO8LRNM',
      rxcui: '10737',
      source: {
        kind: 'PUBCHEM',
        identifier: '5533',
        label: "PubChem compound record matched for 'trazodone'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (scored tablets)',
      tMax: {
        display:
          'approximately one hour on an empty stomach; 2 hours after dosing when taken with food',
        numeric: 1,
        unit: 'hours',
        populationContext:
          'peak plasma levels after oral dosing in humans, as recorded in the label',
        source: fdaLabel(
          TRAZODONE_LABEL,
          'FDA label for trazodone hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Peak plasma levels occur approximately one hour after dosing when trazodone hydrochloride is taken on an empty stomach or 2 hours after dosing when taken with food.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '89 to 95%',
        numeric: 92,
        unit: '%',
        populationContext: 'in vitro at concentrations attained with therapeutic doses in humans',
        source: fdaLabel(
          TRAZODONE_LABEL,
          'FDA label for trazodone hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Protein Binding',
          'Trazodone is 89 to 95% protein bound in vitro at concentrations attained with therapeutic doses in humans.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolized via oxidative cleavage to an active metabolite, m-chlorophenylpiperazine (mCPP), by CYP3A4',
        populationContext: 'in vitro studies in human liver microsomes, as recorded in the label',
        source: fdaLabel(
          TRAZODONE_LABEL,
          'FDA label for trazodone hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'In vitro studies in human liver microsomes show that trazodone is metabolized, via oxidative cleavage, to an active metabolite, m-chlorophenylpiperazine (mCPP) by CYP3A4.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Extensively metabolized; less than 1% of an oral dose is excreted unchanged in the urine',
        populationContext: 'human elimination data, as recorded in the label',
        source: fdaLabel(
          TRAZODONE_LABEL,
          'FDA label for trazodone hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Trazodone is extensively metabolized; less than 1% of an oral dose is excreted unchanged in the urine.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Trazodone Hydrochloride',
        formAsRecorded: 'Scored tablets',
        strengthsAsRecorded: 'Scored tablets of 50 mg, 100 mg, 150 mg and 300 mg',
        approvedUseAsRecorded: 'Treatment of major depressive disorder (MDD) in adults',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-07-14',
        source: fdaLabel(
          TRAZODONE_LABEL,
          'FDA label for trazodone hydrochloride tablets (openFDA)',
          'dosage_forms_and_strengths; indications_and_usage',
          'Scored tablets of 50 mg, 100 mg, 150 mg and 300 mg ( 3 ). Trazodone hydrochloride tablets, USP are available in the following strengths:',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'Antidepressant action thought to be related to enhancement of serotonergic activity in the central nervous system; both a selective serotonin reuptake inhibitor and a 5HT2 receptor antagonist',
        source: fdaLabel(
          TRAZODONE_LABEL,
          'FDA label for trazodone hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          "The mechanism of trazodone's antidepressant action is not fully understood, but is thought to be related to its enhancement of serotonergic activity in the CNS. Trazodone is both a selective serotonin reuptake inhibitor (SSRI) and a 5HT2 receptor antagonist",
        ),
      },
    ],
  },

  valacyclovir: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '135398742',
      casNumber: '124832-26-4',
      unii: 'G447S0T1VC',
      rxcui: '236081',
      source: {
        kind: 'PUBCHEM',
        identifier: '135398742',
        label: "PubChem compound record matched for 'valacyclovir'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      bioavailability: {
        display: '54.5% ± 9.1% (as acyclovir)',
        numeric: 54.5,
        unit: '%',
        populationContext:
          'absolute bioavailability of acyclovir following a 1-gram oral dose of valacyclovir tablets, 12 healthy volunteers',
        source: fdaLabel(
          VALACYCLOVIR_LABEL,
          'FDA label for valacyclovir hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption and Bioavailability',
          'The absolute bioavailability of acyclovir after administration of valacyclovir tablets is 54.5% ± 9.1% as determined following a 1-gram oral dose of valacyclovir tablets and a 350-mg intravenous acyclovir dose to 12 healthy volunteers.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '2.5 to 3.3 hours (as acyclovir)',
        numeric: 2.9,
        unit: 'hours',
        populationContext:
          'plasma elimination half-life of acyclovir across trials of valacyclovir tablets, subjects with normal renal function',
        source: fdaLabel(
          VALACYCLOVIR_LABEL,
          'FDA label for valacyclovir hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'The plasma elimination half-life of acyclovir typically averaged 2.5 to 3.3 hours in all trials of valacyclovir tablets in subjects with normal renal function.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '13.5% to 17.9%',
        numeric: 15.7,
        unit: '%',
        populationContext: 'binding of valacyclovir to human plasma proteins',
        source: fdaLabel(
          VALACYCLOVIR_LABEL,
          'FDA label for valacyclovir hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The binding of valacyclovir to human plasma proteins ranges from 13.5% to 17.9%. The binding of acyclovir to human plasma proteins ranges from 9% to 33%.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Converted to acyclovir and L-valine by first-pass intestinal and/or hepatic metabolism; neither valacyclovir nor acyclovir is metabolized by cytochrome P450 enzymes',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          VALACYCLOVIR_LABEL,
          'FDA label for valacyclovir hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Valacyclovir is converted to acyclovir and L-valine by first-pass intestinal and/or hepatic metabolism. Acyclovir is converted to a small extent to inactive metabolites by aldehyde oxidase and by alcohol and aldehyde dehydrogenase. Neither valacyclovir nor acyclovir is metabolized by cytochrome P450 enzymes.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          '46% and 47% of administered radioactivity recovered in urine and feces, respectively, over 96 hours after a single 1-gram radiolabeled dose',
        populationContext: 'radiolabeled valacyclovir study in 4 healthy subjects',
        source: fdaLabel(
          VALACYCLOVIR_LABEL,
          'FDA label for valacyclovir hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'Following the oral administration of a single 1-gram dose of radiolabeled valacyclovir to 4 healthy subjects, 46% and 47% of administered radioactivity was recovered in urine and feces, respectively, over 96 hours.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(2.9),
    },
    productVariants: [
      {
        brandName: 'Valacyclovir Hydrochloride',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded:
          '500 mg or 1 gram of valacyclovir (containing 556.2 mg or 1.112 grams of valacyclovir hydrochloride)',
        approvedUseAsRecorded:
          'Deoxynucleoside analogue DNA polymerase inhibitor indicated in adult patients for cold sores (herpes labialis), genital herpes (treatment, suppression, reduction of transmission) and herpes zoster; in pediatric patients for cold sores and chickenpox',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-05-28',
        source: fdaLabel(
          VALACYCLOVIR_LABEL,
          'FDA label for valacyclovir hydrochloride tablets (openFDA)',
          'dosage_forms_and_strengths; indications_and_usage',
          'Valacyclovir Tablets, USP are available containing 556.2 mg or 1.112 grams of valacyclovir hydrochloride, USP (hydrous), which are equivalent to 500 mg or 1 gram of valacyclovir, on the anhydrous basis, respectively.',
        ),
      },
    ],
  },

  vancomycin: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '14969',
      casNumber: '1404-90-6',
      unii: '71WO621TJD',
      rxcui: '11124',
      source: {
        kind: 'PUBCHEM',
        identifier: '14969',
        label: "PubChem compound record matched for 'vancomycin'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Intravenous infusion (powder for injection)',
      bioavailability: {
        display: 'Poorly absorbed after oral administration',
        populationContext: 'oral administration, as recorded in the label',
        source: fdaLabel(
          VANCOMYCIN_LABEL,
          'FDA label for vancomycin hydrochloride for injection (openFDA)',
          'clinical_pharmacology',
          'Vancomycin is poorly absorbed after oral administration.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '4 to 6 hours',
        numeric: 5,
        unit: 'hours',
        populationContext:
          'mean elimination half-life from plasma, subjects with normal renal function',
        source: fdaLabel(
          VANCOMYCIN_LABEL,
          'FDA label for vancomycin hydrochloride for injection (openFDA)',
          'clinical_pharmacology',
          'The mean elimination half-life of vancomycin from plasma is 4 to 6 hours in subjects with normal renal function.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 55%',
        numeric: 55,
        unit: '%',
        populationContext:
          'serum protein binding measured by ultrafiltration at serum concentrations of 10 to 100 mcg/mL',
        source: fdaLabel(
          VANCOMYCIN_LABEL,
          'FDA label for vancomycin hydrochloride for injection (openFDA)',
          'clinical_pharmacology',
          'Vancomycin is approximately 55% serum protein bound as measured by ultrafiltration at vancomycin serum concentrations of 10 to 100 mcg/mL.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '0.3 to 0.43 L/kg (distribution coefficient)',
        numeric: 0.365,
        unit: 'L/kg',
        populationContext: 'distribution coefficient, as recorded in the label',
        source: fdaLabel(
          VANCOMYCIN_LABEL,
          'FDA label for vancomycin hydrochloride for injection (openFDA)',
          'clinical_pharmacology',
          'The distribution coefficient is from 0.3 to 0.43 L/kg. There is no apparent metabolism of the drug.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display: 'There is no apparent metabolism of the drug',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          VANCOMYCIN_LABEL,
          'FDA label for vancomycin hydrochloride for injection (openFDA)',
          'clinical_pharmacology',
          'The distribution coefficient is from 0.3 to 0.43 L/kg. There is no apparent metabolism of the drug.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'About 75% of an administered dose is excreted in urine by glomerular filtration in the first 24 hours',
        populationContext: 'subjects with normal kidney function, as recorded in the label',
        source: fdaLabel(
          VANCOMYCIN_LABEL,
          'FDA label for vancomycin hydrochloride for injection (openFDA)',
          'clinical_pharmacology',
          'In the first 24 hours, about 75% of an administered dose of vancomycin is excreted in urine by glomerular filtration. Mean plasma clearance is about 0.058 L/kg/h, and mean renal clearance is about 0.048 L/kg/h.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(5),
    },
    productVariants: [
      {
        brandName: 'Vancomycin Hydrochloride',
        formAsRecorded: 'Powder for injection (vials)',
        strengthsAsRecorded: '500 mg vial and 1 gram vial (equivalent to vancomycin)',
        approvedUseAsRecorded:
          'Treatment of serious or severe infections caused by susceptible strains of methicillin-resistant (β-lactam-resistant) staphylococci',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-01-30',
        source: fdaLabel(
          VANCOMYCIN_LABEL,
          'FDA label for vancomycin hydrochloride for injection (openFDA)',
          'indications_and_usage; how_supplied',
          'Vancomycin Hydrochloride for Injection, USP is indicated for the treatment of serious or severe infections caused by susceptible strains of methicillin-resistant (β-lactam-resistant) staphylococci.',
        ),
      },
    ],
  },

  verapamil: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '2520',
      casNumber: '52-53-9',
      unii: 'V3888OEY5R',
      rxcui: '11170',
      source: {
        kind: 'PUBCHEM',
        identifier: '2520',
        label: "PubChem compound record matched for 'verapamil'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      bioavailability: {
        display: '20% to 35%',
        numeric: 27.5,
        unit: '%',
        populationContext:
          'oral administration; subject to rapid biotransformation during first pass through the portal circulation',
        source: fdaLabel(
          VERAPAMIL_LABEL,
          'FDA label for verapamil hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics and metabolism',
          'More than 90% of the orally administered dose of verapamil hydrochloride is absorbed. Because of rapid biotransformation of verapamil during its first pass through the portal circulation, bioavailability ranges from 20% to 35%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'between 1 and 2 hours',
        numeric: 1.5,
        unit: 'hours',
        populationContext: 'peak plasma concentrations after oral administration',
        source: fdaLabel(
          VERAPAMIL_LABEL,
          'FDA label for verapamil hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics and metabolism',
          'Peak plasma concentrations are reached between 1 and 2 hours after oral administration.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '2.8 to 7.4 hours in single-dose studies; 4.5 to 12 hours after repetitive dosing',
        numeric: 5.1,
        unit: 'hours',
        populationContext:
          'mean elimination half-life in single-dose studies; increased after repetitive dosing',
        source: fdaLabel(
          VERAPAMIL_LABEL,
          'FDA label for verapamil hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics and metabolism',
          'The mean elimination half-life in single-dose studies ranged from 2.8 to 7.4 hours. In these same studies, after repetitive dosing, the half-life increased to a range from 4.5 to 12 hours (after less than 10 consecutive doses given 6 hours apart).',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 90%',
        numeric: 90,
        unit: '%',
        populationContext: 'binding to plasma proteins, as recorded in the label',
        source: fdaLabel(
          VERAPAMIL_LABEL,
          'FDA label for verapamil hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics and metabolism',
          'About 3% to 4% is excreted in the urine as unchanged drug. Approximately 90% is bound to plasma proteins.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Undergoes extensive metabolism in the liver; twelve metabolites have been identified in plasma, all except norverapamil present in trace amounts only',
        populationContext: 'healthy men, orally administered verapamil hydrochloride',
        source: fdaLabel(
          VERAPAMIL_LABEL,
          'FDA label for verapamil hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics and metabolism',
          'In healthy men, orally administered verapamil hydrochloride undergoes extensive metabolism in the liver. Twelve metabolites have been identified in plasma; all except norverapamil are present in trace amounts only.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Approximately 70% of an administered dose is excreted as metabolites in the urine and 16% or more in the feces within 5 days',
        populationContext: 'human elimination data, as recorded in the label',
        source: fdaLabel(
          VERAPAMIL_LABEL,
          'FDA label for verapamil hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics and metabolism',
          'Approximately 70% of an administered dose is excreted as metabolites in the urine and 16% or more in the feces within 5 days. About 3% to 4% is excreted in the urine as unchanged drug.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(5.1),
    },
    anatomyTargets: [
      {
        regionCode: 'heart',
        actionAsRecorded:
          'Dilates the main coronary arteries and coronary arterioles and inhibits coronary artery spasm, increasing myocardial oxygen delivery',
        source: fdaLabel(
          VERAPAMIL_LABEL,
          'FDA label for verapamil hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Mechanism of action, Angina',
          'Verapamil dilates the main coronary arteries and coronary arterioles, both in normal and ischemic regions, and is a potent inhibitor of coronary artery spasm, whether spontaneous or ergonovine-induced. This property increases myocardial oxygen delivery in patients with coronary artery spasm',
        ),
      },
      {
        regionCode: 'blood-vessels',
        actionAsRecorded:
          'Exerts antihypertensive effects by decreasing systemic vascular resistance',
        source: fdaLabel(
          VERAPAMIL_LABEL,
          'FDA label for verapamil hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Essential hypertension',
          'Verapamil exerts antihypertensive effects by decreasing systemic vascular resistance, usually without orthostatic decreases in blood pressure or reflex tachycardia',
        ),
      },
    ],
  },

  'vitamin-c': {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '54670067',
      casNumber: '50-81-7',
      rxcui: '1151',
      source: {
        kind: 'PUBCHEM',
        identifier: '54670067',
        label: "PubChem compound record matched for 'vitamin c' (ascorbic acid)",
        retrievedAt: FETCHED,
      },
    },
  },

  zinc: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '23994',
      casNumber: '7440-66-6',
      rxcui: '11416',
      source: {
        kind: 'PUBCHEM',
        identifier: '23994',
        label: "PubChem compound record matched for 'zinc'",
        retrievedAt: FETCHED,
      },
    },
  },
}
