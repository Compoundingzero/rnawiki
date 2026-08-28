import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import type { BackgroundSource } from '@/lib/background/types'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 14: glycine, hydralazine, isotretinoin, ivabradine, ketoconazole, mesalamine.
 *
 * Honest omissions in this batch:
 * - glycine: the openFDA search returned a multi-ingredient homeopathic spray ("NADH Plus") whose
 *   recorded generic names are NADIDUM, ADENOSINUM CYCLOPHOSPHORICUM, CALCIUM D-PANTOTHENATE,
 *   CHOLINUM, RIBOFLAVINUM, UBIDECARENONUM and DIMETHYL GLYCINE — none of which is glycine as a
 *   single medicine — so that label and its UNII are discarded and no label-derived module is
 *   recorded. Targeted PubMed searches returned no human pharmacokinetic study of glycine itself,
 *   so registry identifiers from PubChem and RxNorm are the whole honest entry.
 * - hydralazine: the label states no bioavailability or volume of distribution, so those values
 *   are absent; the fetched label is a repackager label that supplies only the 25 mg tablet.
 * - isotretinoin: the label states no absolute bioavailability, so that value is absent; no
 *   stepwise escalation schedule is stated (the label gives a weight-based dosage range, not a
 *   titration), so no titration module is recorded.
 * - ivabradine: recorded applicability and pivotal results come from the fetched SHIFT record
 *   (NCT02441218), whose acronym, condition and interventions were checked against the label's
 *   own SHIFT description before use.
 * - ketoconazole: the fetched label is the 2% topical shampoo. It states no pharmacokinetic
 *   parameter at all — only that ketoconazole was not detected in plasma after repeated use — so
 *   that single systemic-exposure reading is all the pharmacokinetics module carries, and no
 *   half-life, titration, applicability or trial result is recorded.
 * - mesalamine: the label states no half-life, so no steady-state note is derived; the recorded
 *   dosage is a fixed regimen rather than a stepwise escalation, so no titration module exists.
 * - No cost context is recorded anywhere in this batch.
 */

const FETCHED = '2026-08-28'

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

const HYDRALAZINE_LABEL = '024ac6b8-5ce0-4435-9b11-b1806c511d7b'
const ISOTRETINOIN_LABEL = '0114567b-3bac-490d-b9eb-03a6c5d90935'
const IVABRADINE_LABEL = '236cc914-7eef-600c-e063-6394a90a4bd1'
const KETOCONAZOLE_LABEL = '00c1cac8-a865-4583-aaba-3a0f21fb31e6'
const MESALAMINE_LABEL = '00f77203-3615-47e8-ae25-6e1cf8a2a00a'

const HYDRALAZINE_PK_EXCERPT =
  'HydrALAZINE is rapidly absorbed after oral administration, and peak plasma levels are reached at 1 to 2 hours. Plasma levels of apparent hydrALAZINE decline with a half-life of 3 to 7 hours. Binding to human plasma protein is 87%.'

const HYDRALAZINE_DISPOSITION_EXCERPT =
  'HydrALAZINE is subject to polymorphic acetylation; slow acetylators generally have higher plasma levels of hydrALAZINE and require lower doses to maintain control of blood pressure. HydrALAZINE undergoes extensive hepatic metabolism; it is excreted mainly in the form of metabolites in the urine.'

const IVABRADINE_ABSORPTION_EXCERPT =
  'Following oral administration, peak plasma ivabradine concentrations are reached in approximately1 hour under fasting conditions. The absolute oral bioavailability of ivabradine is approximately 40% because of first-pass elimination in the gut and liver.'

const IVABRADINE_DISTRIBUTION_EXCERPT =
  'Ivabradine is approximately 70% plasma protein bound, and the volume of distribution at steady state is approximately 100 L.'

export const BACKGROUND_BATCH_14: RecordedBackgroundBySlug = {
  glycine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '750',
      casNumber: '56-40-6',
      rxcui: '1311532',
      source: {
        kind: 'PUBCHEM',
        identifier: '750',
        label: "PubChem compound record matched for 'glycine'",
        retrievedAt: FETCHED,
      },
    },
  },

  hydralazine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '3637',
      casNumber: '86-54-4',
      unii: 'FD171B778Y',
      rxcui: '5470',
      source: {
        kind: 'PUBCHEM',
        identifier: '3637',
        label: "PubChem compound record matched for 'hydralazine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      tMax: {
        display: '1 to 2 hours',
        numeric: 1.5,
        unit: 'hours',
        populationContext: 'peak plasma levels after oral administration, as recorded in the label',
        source: fdaLabel(
          HYDRALAZINE_LABEL,
          'FDA label for hydralazine hydrochloride tablets, USP (openFDA)',
          'CLINICAL PHARMACOLOGY',
          HYDRALAZINE_PK_EXCERPT,
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '3 to 7 hours',
        numeric: 5,
        unit: 'hours',
        populationContext:
          'decline of plasma levels of apparent hydralazine; the label records that plasma levels vary widely among individuals',
        source: fdaLabel(
          HYDRALAZINE_LABEL,
          'FDA label for hydralazine hydrochloride tablets, USP (openFDA)',
          'CLINICAL PHARMACOLOGY',
          HYDRALAZINE_PK_EXCERPT,
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '87%',
        numeric: 87,
        unit: '%',
        populationContext: 'binding to human plasma protein, as recorded in the label',
        source: fdaLabel(
          HYDRALAZINE_LABEL,
          'FDA label for hydralazine hydrochloride tablets, USP (openFDA)',
          'CLINICAL PHARMACOLOGY',
          HYDRALAZINE_PK_EXCERPT,
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Subject to polymorphic acetylation, with slow acetylators generally reaching higher plasma levels; undergoes extensive hepatic metabolism',
        populationContext: 'human pharmacokinetic data, as recorded in the label',
        source: fdaLabel(
          HYDRALAZINE_LABEL,
          'FDA label for hydralazine hydrochloride tablets, USP (openFDA)',
          'CLINICAL PHARMACOLOGY',
          HYDRALAZINE_DISPOSITION_EXCERPT,
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: 'Excreted mainly in the form of metabolites in the urine',
        populationContext: 'human pharmacokinetic data, as recorded in the label',
        source: fdaLabel(
          HYDRALAZINE_LABEL,
          'FDA label for hydralazine hydrochloride tablets, USP (openFDA)',
          'CLINICAL PHARMACOLOGY',
          HYDRALAZINE_DISPOSITION_EXCERPT,
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(5),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'First 2 to 4 days',
          amountAsRecorded: '10 mg four times daily',
          purposeAsRecorded:
            'The label records that therapy is initiated in gradually increasing dosages, adjusted according to individual response',
        },
        {
          order: 2,
          periodAsRecorded: 'Balance of the first week',
          amountAsRecorded: '25 mg four times daily',
        },
        {
          order: 3,
          periodAsRecorded: 'Second and subsequent weeks',
          amountAsRecorded: '50 mg four times daily',
        },
      ],
      source: fdaLabel(
        HYDRALAZINE_LABEL,
        'FDA label for hydralazine hydrochloride tablets, USP (openFDA)',
        'DOSAGE AND ADMINISTRATION',
        'Initiate therapy in gradually increasing dosages; adjust according to individual response. Start with 10 mg four times daily for the first 2 to 4 days, increase to 25 mg four times daily for the balance of the first week. For the second and subsequent weeks, increase dosage to 50 mg four times daily.',
      ),
    },
    productVariants: [
      {
        brandName: 'Hydralazine Hydrochloride',
        formAsRecorded: 'Tablets, USP',
        strengthsAsRecorded: '25 mg (the only strength this repackager label supplies)',
        approvedUseAsRecorded: 'Essential hypertension, alone or as an adjunct',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-07-01',
        source: fdaLabel(
          HYDRALAZINE_LABEL,
          'FDA label for hydralazine hydrochloride tablets, USP (openFDA)',
          'INDICATIONS AND USAGE; HOW SUPPLIED',
          'HydrALAZINE Hydrochloride Tablets, USP are available as: 25 mg – Round, peach, core tablet, debossed EP over 102 on one side and plain on the reverse side.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'blood-vessels',
        actionAsRecorded:
          'Lowers blood pressure by exerting a peripheral vasodilating effect through a direct relaxation of vascular smooth muscle',
        source: fdaLabel(
          HYDRALAZINE_LABEL,
          'FDA label for hydralazine hydrochloride tablets, USP (openFDA)',
          'CLINICAL PHARMACOLOGY',
          'HydrALAZINE apparently lowers blood pressure by exerting a peripheral vasodilating effect through a direct relaxation of vascular smooth muscle.',
        ),
      },
      {
        regionCode: 'heart',
        actionAsRecorded:
          'The peripheral vasodilating effect is accompanied by an increased heart rate, stroke volume and cardiac output',
        source: fdaLabel(
          HYDRALAZINE_LABEL,
          'FDA label for hydralazine hydrochloride tablets, USP (openFDA)',
          'CLINICAL PHARMACOLOGY',
          'The peripheral vasodilating effect of hydrALAZINE results in decreased arterial blood pressure (diastolic more than systolic); decreased peripheral vascular resistance; and an increased heart rate, stroke volume, and cardiac output.',
        ),
      },
      {
        regionCode: 'kidneys',
        actionAsRecorded:
          'Usually increases renin activity in plasma, presumably as a result of increased secretion of renin by the renal juxtaglomerular cells in response to reflex sympathetic discharge',
        source: fdaLabel(
          HYDRALAZINE_LABEL,
          'FDA label for hydralazine hydrochloride tablets, USP (openFDA)',
          'CLINICAL PHARMACOLOGY',
          'HydrALAZINE usually increases renin activity in plasma, presumably as a result of increased secretion of renin by the renal juxtaglomerular cells in response to reflex sympathetic discharge.',
        ),
      },
    ],
  },

  isotretinoin: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5282379',
      casNumber: '4759-48-2',
      unii: 'EH28UP18IF',
      rxcui: '6064',
      source: {
        kind: 'PUBCHEM',
        identifier: '5282379',
        label: "PubChem compound record matched for 'isotretinoin'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (soft gelatin capsules), administered with a meal',
      tMax: {
        display: '5.3 hours fed and 3.2 hours fasted',
        numeric: 5.3,
        unit: 'hours',
        populationContext:
          '74 healthy adult subjects in a crossover study, single oral dose, fed (standardized high-fat meal) versus fasted',
        source: fdaLabel(
          ISOTRETINOIN_LABEL,
          'FDA label for isotretinoin capsules (openFDA)',
          'CLINICAL PHARMACOLOGY, Pharmacokinetics, Table 2',
          'Table 2 Pharmacokinetic Parameters of Isotretinoin Mean (%CV), N=74 Isotretinoin 2×40 mg Capsules AUC 0–∞ (ng∙hr/mL) C max (ng/mL) T max (hr) t 1/2 (hr) Fed Eating a standardized high-fat meal. 10,004 (22%) 862 (22%) 5.3 (77%) 21 (39%) Fasted 3,703 (46%) 301 (63%) 3.2 (56%) 21 (30%)',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '21 ± 8.2 hours',
        numeric: 21,
        unit: 'hours',
        populationContext:
          '74 healthy adult subjects, mean ± SD elimination half-life after a single 80 mg oral dose under fed conditions',
        source: fdaLabel(
          ISOTRETINOIN_LABEL,
          'FDA label for isotretinoin capsules (openFDA)',
          'CLINICAL PHARMACOLOGY, Pharmacokinetics, Elimination',
          'After a single 80 mg oral dose of isotretinoin to 74 healthy adult subjects under fed conditions, the mean ±SD elimination half-lives (t 1/2 ) of isotretinoin and 4- oxo -isotretinoin were 21 ± 8.2 hours and 24 ± 5.3 hours, respectively.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'more than 99.9%',
        numeric: 99.9,
        unit: '%',
        populationContext:
          'binding to plasma proteins, primarily albumin, as recorded in the label',
        source: fdaLabel(
          ISOTRETINOIN_LABEL,
          'FDA label for isotretinoin capsules (openFDA)',
          'CLINICAL PHARMACOLOGY, Pharmacokinetics, Distribution',
          'Distribution Isotretinoin is more than 99.9% bound to plasma proteins, primarily albumin.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'The primary P450 isoforms involved in isotretinoin metabolism are 2C8, 2C9, 3A4, and 2B6; isotretinoin and its metabolites are further metabolized into conjugates, which are then excreted in urine and feces',
        populationContext: 'in vitro studies, as recorded in the label',
        source: fdaLabel(
          ISOTRETINOIN_LABEL,
          'FDA label for isotretinoin capsules (openFDA)',
          'CLINICAL PHARMACOLOGY, Pharmacokinetics, Metabolism',
          'In vitro studies indicate that the primary P450 isoforms involved in isotretinoin metabolism are 2C8, 2C9, 3A4, and 2B6. Isotretinoin and its metabolites are further metabolized into conjugates, which are then excreted in urine and feces.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'The metabolites of isotretinoin and any conjugates are ultimately excreted in the feces and urine in relatively equal amounts (total of 65% to 83%)',
        populationContext: 'human excretion data, as recorded in the label',
        source: fdaLabel(
          ISOTRETINOIN_LABEL,
          'FDA label for isotretinoin capsules (openFDA)',
          'CLINICAL PHARMACOLOGY, Pharmacokinetics, Elimination',
          'Following oral administration of an 80 mg dose of 14 C-isotretinoin as a liquid suspension, 14 C-activity in blood declined with a half-life of 90 hours. The metabolites of isotretinoin and any conjugates are ultimately excreted in the feces and urine in relatively equal amounts (total of 65% to 83%).',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(21),
    },
    productVariants: [
      {
        brandName: 'Isotretinoin',
        formAsRecorded: 'Soft gelatin capsules',
        strengthsAsRecorded: 'Soft gelatin capsules: 10 mg, 20 mg, 30 mg and 40 mg',
        approvedUseAsRecorded:
          'Treatment of severe recalcitrant nodular acne, which the label defines by inflammatory nodules of 5 mm or greater in diameter',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-06-26',
        source: fdaLabel(
          ISOTRETINOIN_LABEL,
          'FDA label for isotretinoin capsules (openFDA)',
          'INDICATIONS AND USAGE; HOW SUPPLIED',
          'Isotretinoin capsules are indicated for the treatment of severe recalcitrant nodular acne. Nodules are inflammatory lesions with a diameter of 5 mm or greater. The nodules may become suppurative or hemorrhagic.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'skin',
        actionAsRecorded:
          'Inhibits sebaceous gland function and keratinization; the label records that the exact mechanism of action is unknown',
        source: fdaLabel(
          ISOTRETINOIN_LABEL,
          'FDA label for isotretinoin capsules (openFDA)',
          'CLINICAL PHARMACOLOGY',
          'Isotretinoin is a retinoid, which when administered in pharmacologic dosages of 0.5 to 1 mg/kg/day (see DOSAGE AND ADMINISTRATION ), inhibits sebaceous gland function and keratinization. The exact mechanism of action of isotretinoin is unknown.',
        ),
      },
    ],
  },

  ivabradine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '132999',
      casNumber: '155974-00-8',
      unii: 'TP19837BZK',
      rxcui: '1649479',
      source: {
        kind: 'PUBCHEM',
        identifier: '132999',
        label: "PubChem compound record matched for 'ivabradine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets), twice daily with food',
      bioavailability: {
        display: 'approximately 40%',
        numeric: 40,
        unit: '%',
        populationContext:
          'absolute oral bioavailability after first-pass elimination in the gut and liver, as recorded in the label',
        source: fdaLabel(
          IVABRADINE_LABEL,
          'FDA label for ivabradine tablets (openFDA)',
          '12.3 Pharmacokinetics, Absorption and Bioavailability',
          IVABRADINE_ABSORPTION_EXCERPT,
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'approximately 1 hour',
        numeric: 1,
        unit: 'hours',
        populationContext:
          'peak plasma ivabradine concentrations under fasting conditions; the label records that food delays absorption',
        source: fdaLabel(
          IVABRADINE_LABEL,
          'FDA label for ivabradine tablets (openFDA)',
          '12.3 Pharmacokinetics, Absorption and Bioavailability',
          IVABRADINE_ABSORPTION_EXCERPT,
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 6 hours (effective half-life)',
        numeric: 6,
        unit: 'hours',
        populationContext:
          'effective half-life of ivabradine plasma levels, as recorded in the label',
        source: fdaLabel(
          IVABRADINE_LABEL,
          'FDA label for ivabradine tablets (openFDA)',
          '12.3 Pharmacokinetics, Metabolism and Excretion',
          'Ivabradine plasma levels decline with a distribution half-life of 2 hours and an effective half-life of approximately 6 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 70%',
        numeric: 70,
        unit: '%',
        populationContext: 'plasma protein binding, as recorded in the label',
        source: fdaLabel(
          IVABRADINE_LABEL,
          'FDA label for ivabradine tablets (openFDA)',
          '12.3 Pharmacokinetics',
          IVABRADINE_DISTRIBUTION_EXCERPT,
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 100 L',
        numeric: 100,
        unit: 'L',
        populationContext: 'volume of distribution at steady state, as recorded in the label',
        source: fdaLabel(
          IVABRADINE_LABEL,
          'FDA label for ivabradine tablets (openFDA)',
          '12.3 Pharmacokinetics',
          IVABRADINE_DISTRIBUTION_EXCERPT,
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized in the liver and intestines by CYP3A4-mediated oxidation; the major metabolite, the N-desmethylated derivative, is also metabolized by CYP3A4',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          IVABRADINE_LABEL,
          'FDA label for ivabradine tablets (openFDA)',
          '12.3 Pharmacokinetics, Metabolism and Excretion',
          'Ivabradine is extensively metabolized in the liver and intestines by CYP3A4-mediated oxidation. The major metabolite is the N-desmethylated derivative (S 18982), which is equipotent to ivabradine and circulates at concentrations approximately 40% that of ivabradine. The N-desmethylated derivative is also metabolized by CYP3A4.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Total clearance 24 L/h and renal clearance approximately 4.2 L/h, with about 4% of an oral dose excreted unchanged in urine; excretion of metabolites occurs to a similar extent via feces and urine',
        populationContext: 'human excretion data, as recorded in the label',
        source: fdaLabel(
          IVABRADINE_LABEL,
          'FDA label for ivabradine tablets (openFDA)',
          '12.3 Pharmacokinetics, Metabolism and Excretion',
          'The total clearance of ivabradine is 24 L/h, and renal clearance is approximately 4.2 L/h, with ~ 4% of an oral dose excreted unchanged in urine. The excretion of metabolites occurs to a similar extent via feces and urine.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(6),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Starting dose (adults)',
          amountAsRecorded: '2.5 mg (vulnerable adults) or 5 mg twice daily with food',
        },
        {
          order: 2,
          periodAsRecorded: 'After 2 weeks of treatment, adjusted on the basis of heart rate',
          amountAsRecorded: 'Maximum dose 7.5 mg twice daily',
        },
      ],
      source: fdaLabel(
        IVABRADINE_LABEL,
        'FDA label for ivabradine tablets (openFDA)',
        '2 DOSAGE AND ADMINISTRATION',
        'Adult patients ● Starting dose is 2.5 (vulnerable adults) or 5 mg twice daily with food. After 2 weeks of treatment, adjust dose based on heart rate. The maximum dose is 7.5 mg twice daily. ( 2.1 )',
      ),
    },
    productVariants: [
      {
        brandName: 'Ivabradine',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: 'Tablets: 5 mg, 7.5 mg',
        approvedUseAsRecorded:
          'To reduce the risk of hospitalization for worsening heart failure in adult patients with stable, symptomatic chronic heart failure with left ventricular ejection fraction ≤ 35%, who are in sinus rhythm with resting heart rate ≥ 70 beats per minute and either are on maximally tolerated doses of beta-blockers or have a contraindication to beta-blocker use',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-04-15',
        source: fdaLabel(
          IVABRADINE_LABEL,
          'FDA label for ivabradine tablets (openFDA)',
          '1.1 Heart Failure in Adult Patients; 3 Dosage Forms and Strengths',
          'Ivabradine tablets are indicated to reduce the risk of hospitalization for worsening heart failure in adult patients with stable, symptomatic chronic heart failure with left ventricular ejection fraction ≤ 35%, who are in sinus rhythm with resting heart rate ≥ 70 beats per minute and either are on maximally tolerated doses of beta-blockers or have a contraindication to beta-blocker use.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'heart',
        actionAsRecorded:
          'Blocks the hyperpolarization-activated cyclic nucleotide-gated (HCN) channel responsible for the cardiac pacemaker current that regulates heart rate; the cardiac effects were most pronounced in the sinoatrial node',
        source: fdaLabel(
          IVABRADINE_LABEL,
          'FDA label for ivabradine tablets (openFDA)',
          '12.1 Mechanism of Action',
          'Ivabradine tablets blocks the hyperpolarization-activated cyclic nucleotide-gated (HCN) channel responsible for the cardiac pacemaker I f current, which regulates heart rate. In clinical electrophysiology studies, the cardiac effects were most pronounced in the sinoatrial (SA) node, but prolongation of the AH interval has occurred as has PR interval prolongation.',
        ),
      },
      {
        regionCode: 'eye',
        actionAsRecorded:
          'Can also inhibit the retinal current I h, which is involved in curtailing retinal responses to bright light stimuli',
        source: fdaLabel(
          IVABRADINE_LABEL,
          'FDA label for ivabradine tablets (openFDA)',
          '12.1 Mechanism of Action',
          'Ivabradine tablets can also inhibit the retinal current I h . I h is involved in curtailing retinal responses to bright light stimuli.',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT02441218',
      includedAsRecorded: [
        'Symptomatic Chronic heart failure (NYHA II, III or IV)',
        'Left ventricular systolic dysfunction (LVEF ≤ 35%)',
        'Sinus rhythm and resting heart rate ≥ 70 bpm',
        'Optimal and unchanged CHF medications or dosages',
      ],
      excludedAsRecorded: [
        'Unstable condition within previous 4 weeks',
        'Myocardial infarction or coronary revascularisation within previous 2 months',
        'Stroke or transient cerebral ischaemia within previous 4 weeks',
        'Congenital heart disease',
        'Severe valvular disease',
        'Active myocarditis',
        'Permanent atrial fibrillation or flutter',
      ],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT02441218',
        label:
          'ClinicalTrials.gov record for SHIFT (ivabradine in chronic heart failure with left ventricular systolic dysfunction)',
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: FETCHED,
        excerpt:
          'Inclusion Criteria:\n\n* Symptomatic Chronic heart failure (NYHA II, III or IV)\n* Left ventricular systolic dysfunction (LVEF ≤ 35%)\n* Sinus rhythm and resting heart rate ≥ 70 bpm\n* Optimal and unchanged CHF medications or dosages',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT02441218',
        endpointAsRecorded:
          'Primary composite endpoint: first event among cardiovascular death (including death of unknown cause) or hospitalization for worsening heart failure',
        activeResultAsRecorded: 'Ivabradine group: 793 participants with an event',
        comparatorResultAsRecorded: 'Placebo group: 937 participants with an event',
        differenceAsRecorded: 'Hazard ratio 0.82',
        uncertaintyAsRecorded:
          '95% two-sided CI 0.75 to 0.90; p<0.0001 (Cox proportional hazards regression, Wald test)',
        timepointAsRecorded: 'All over the study',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT02441218',
          label: 'ClinicalTrials.gov posted results for SHIFT, primary outcome measure',
          locator: 'resultsSection.outcomeMeasuresModule, primary outcome',
          retrievedAt: FETCHED,
          excerpt:
            '"measurements":[{"groupId":"OG000","value":"793"},{"groupId":"OG001","value":"937"}]}]}],"analyses":[{"groupIds":["OG000","OG001"],"nonInferiorityType":"SUPERIORITY_OR_OTHER_LEGACY","pValue":"<0.0001","statisticalMethod":"Regression, Cox","paramType":"Hazard Ratio (HR)","paramValue":"0.82","ciPctValue":"95","ciNumSides":"TWO_SIDED","ciLowerLimit":"0.75","ciUpperLimit":"0.90"',
        },
      },
      {
        trialIdentifier: 'NCT02441218',
        endpointAsRecorded:
          'Secondary outcome measure: hospitalisation for worsening heart failure, a component of the primary composite endpoint',
        activeResultAsRecorded: 'Ivabradine group: 514 participants with an event',
        comparatorResultAsRecorded: 'Placebo group: 672 participants with an event',
        differenceAsRecorded: 'Hazard ratio 0.74',
        uncertaintyAsRecorded:
          '95% two-sided CI 0.66 to 0.83; p< 0.0001 (Cox proportional hazards regression, Wald test)',
        timepointAsRecorded:
          'From the date of randomization to the date of first documented hospitalisation',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT02441218',
          label: 'ClinicalTrials.gov posted results for SHIFT, secondary outcome measure',
          locator: 'resultsSection.outcomeMeasuresModule, secondary outcome',
          retrievedAt: FETCHED,
          excerpt:
            '"measurements":[{"groupId":"OG000","value":"514"},{"groupId":"OG001","value":"672"}]}]}],"analyses":[{"groupIds":["OG000","OG001"],"nonInferiorityType":"SUPERIORITY_OR_OTHER_LEGACY","pValue":"< 0.0001","statisticalMethod":"Regression, Cox","paramType":"Hazard Ratio (HR)","paramValue":"0.74","ciPctValue":"95","ciNumSides":"TWO_SIDED","ciLowerLimit":"0.66","ciUpperLimit":"0.83"',
        },
      },
    ],
  },

  ketoconazole: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '47576',
      casNumber: '65277-42-1',
      unii: 'R9400W927I',
      rxcui: '6135',
      source: {
        kind: 'PUBCHEM',
        identifier: '47576',
        label: "PubChem compound record matched for 'ketoconazole'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Topical (shampoo, 2%), applied to the damp skin of the affected area',
      bioavailability: {
        display: 'Not detected in plasma',
        populationContext:
          '39 patients who shampooed 4-10 times per week for 6 months and 33 patients who shampooed 2-3 times per week for 3-26 months (mean: 16 months)',
        source: fdaLabel(
          KETOCONAZOLE_LABEL,
          'FDA label for ketoconazole shampoo, 2% (openFDA)',
          'CLINICAL PHARMACOLOGY',
          'Ketoconazole was not detected in plasma in 39 patients who shampooed 4-10 times per week for 6 months, or in 33 patients who shampooed 2-3 times per week for 3-26 months (mean: 16 months).',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Ketoconazole',
        formAsRecorded: 'Shampoo',
        strengthsAsRecorded: '2%',
        approvedUseAsRecorded:
          'Treatment of tinea (pityriasis) versicolor caused by or presumed to be caused by Pityrosporum orbiculare (also known as Malassezia furfur or M. orbiculare)',
        jurisdiction: 'US_FDA',
        statusAsRecorded:
          'Recorded as a topical shampoo; FDA label in effect 2026-01-29 (the fetched label states no prescription or over-the-counter framing)',
        source: fdaLabel(
          KETOCONAZOLE_LABEL,
          'FDA label for ketoconazole shampoo, 2% (openFDA)',
          'INDICATIONS & USAGE',
          'Ketoconazole shampoo, 2% is indicated for the treatment of tinea (pityriasis) versicolor caused by or presumed to be caused by Pityrosporum orbiculare (also known as Malassezia furfur or M. orbiculare ) .',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'skin',
        actionAsRecorded:
          'Recorded as treating tinea (pityriasis) versicolor, a non-contagious infection of the skin caused by Pityrosporum orbiculare (Malassezia furfur), an organism that is part of the normal skin flora',
        source: fdaLabel(
          KETOCONAZOLE_LABEL,
          'FDA label for ketoconazole shampoo, 2% (openFDA)',
          'CLINICAL PHARMACOLOGY',
          'Tinea (pityriasis) versicolor is a non-contagious infection of the skin caused by Pityrosporum orbiculare ( Malassezia furfur ). This commensal organism is part of the normal skin flora.',
        ),
      },
    ],
  },

  mesalamine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '4075',
      casNumber: '89-57-6',
      unii: '4Q81I59GXC',
      rxcui: '52582',
      source: {
        kind: 'PUBCHEM',
        identifier: '4075',
        label: "PubChem compound record matched for 'mesalamine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (delayed-release tablets), taken on an empty stomach',
      bioavailability: {
        display: 'approximately 20%',
        numeric: 20,
        unit: '%',
        populationContext:
          'healthy subjects, share of the orally administered mesalamine that is systemically absorbed, based on cumulative urinary recovery from single dose studies',
        source: fdaLabel(
          MESALAMINE_LABEL,
          'FDA label for mesalamine delayed-release tablets, USP (openFDA)',
          '12.3 Pharmacokinetics, Absorption',
          'Based on cumulative urinary recovery of mesalamine and N-Ac-5-ASA from single dose studies in healthy subjects, approximately 20% of the orally administered mesalamine in mesalamine delayed-release tablets is systemically absorbed.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'approximately 24 hours (median; range 4 hours to 72 hours)',
        numeric: 24,
        unit: 'hours',
        populationContext:
          'healthy subjects, single oral dose of the mesalamine delayed-release 800 mg tablet, reflecting the delayed-release characteristics of the formulation',
        source: fdaLabel(
          MESALAMINE_LABEL,
          'FDA label for mesalamine delayed-release tablets, USP (openFDA)',
          '12.3 Pharmacokinetics, Absorption',
          'The median [range] T max for mesalamine following administration of mesalamine delayed-release 800 mg tablet was approximately 24 hours [4 hours to 72 hours], reflecting the delayed-release characteristics of the formulation.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'The absorbed mesalamine is acetylated in the gut mucosal wall and by the liver to N-Ac-5-ASA',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          MESALAMINE_LABEL,
          'FDA label for mesalamine delayed-release tablets, USP (openFDA)',
          '12.3 Pharmacokinetics, Elimination',
          'Elimination Metabolism The absorbed mesalamine is acetylated in the gut mucosal wall and by the liver to N-Ac-5-ASA.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Absorbed mesalamine is excreted mainly by the kidneys as N-acetyl-5-aminosalicylic acid; unabsorbed mesalamine is excreted in feces',
        populationContext: 'human excretion data, as recorded in the label',
        source: fdaLabel(
          MESALAMINE_LABEL,
          'FDA label for mesalamine delayed-release tablets, USP (openFDA)',
          '12.3 Pharmacokinetics, Excretion',
          'Excretion Absorbed mesalamine is excreted mainly by the kidneys as N-acetyl-5-aminosalicylic acid. Unabsorbed mesalamine is excreted in feces.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Mesalamine',
        formAsRecorded: 'Delayed-release tablets, USP',
        strengthsAsRecorded: 'Delayed-release tablets: 800 mg',
        approvedUseAsRecorded:
          'Treatment of moderately active ulcerative colitis in adults, with the label recording that safety and effectiveness beyond 6 weeks have not been established',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-05-23',
        source: fdaLabel(
          MESALAMINE_LABEL,
          'FDA label for mesalamine delayed-release tablets, USP (openFDA)',
          '1 Indications and Usage; 3 Dosage Forms and Strengths',
          'Mesalamine delayed-release tablets are indicated for the treatment of moderately active ulcerative colitis in adults. Limitations of Use : Safety and effectiveness of mesalamine delayed-release tablets beyond 6 weeks have not been established.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'intestines',
        actionAsRecorded:
          'Appears to act as a topical anti-inflammatory on colonic epithelial cells; the label records that the mechanism is not fully understood',
        source: fdaLabel(
          MESALAMINE_LABEL,
          'FDA label for mesalamine delayed-release tablets, USP (openFDA)',
          '12.1 Mechanism of Action',
          'The mechanism of action of mesalamine is not fully understood, but appears to be a topical anti-inflammatory effect on colonic epithelial cells.',
        ),
      },
    ],
  },
}
