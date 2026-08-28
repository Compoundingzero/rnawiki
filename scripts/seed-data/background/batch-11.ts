import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import type { BackgroundSource } from '@/lib/background/types'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 11: nitroglycerin, nortriptyline, olanzapine, oseltamivir, pantoprazole, pioglitazone,
 * quercetin, quetiapine, resveratrol, risperidone, salmeterol.
 *
 * Honest omissions in this batch:
 * - nitroglycerin: the label states the elimination half-life in minutes, so the half-life is
 *   recorded display-only (no hour figure) and no steady-state note is derived.
 * - nortriptyline: the fetched label has no pharmacokinetic values and its clinical-pharmacology
 *   section names no organ, so no pharmacokinetics or anatomy module is recorded.
 * - olanzapine, quetiapine, risperidone: the fetched mechanism-of-action sections name receptor
 *   families but no organ, so no anatomy-target module is recorded.
 * - pioglitazone: the PROactive outcomes study record (NCT00174993) was fetched and verified but
 *   has no posted results section, so applicability is recorded without a pivotal-results module.
 * - quercetin: the openFDA generic-name search returned a homeopathic combination product
 *   ("Egg Allergen Mix") whose generic names do not match quercetin, so no label-derived module
 *   is recorded — registry identifiers from PubChem only.
 * - resveratrol: no FDA drug label exists in the artifact; pharmacokinetics are recorded from one
 *   fetched PubMed abstract (PMID 15333514) and registry identifiers from PubChem.
 * - salmeterol: the original artifact was a fluticasone propionate and salmeterol combination
 *   label (a different product), so the SEREVENT DISKUS (salmeterol xinafoate) label was fetched
 *   instead; the UNII is omitted because the label records the xinafoate salt while the registry
 *   identifiers record the salmeterol base compound.
 */

/** Fetch date of the per-medicine openFDA/PubChem/RxNorm artifacts. */
const ARTIFACTS_FETCHED = '2026-08-27'
/** Fetch date of the salmeterol-only label re-fetch and this batch's own curl fetches. */
const REFETCHED = '2026-08-28'
const AUTHORED = '2026-08-28'

function fdaLabel(
  setId: string,
  label: string,
  locator: string,
  excerpt?: string,
  retrievedAt: string = ARTIFACTS_FETCHED,
): BackgroundSource {
  return {
    kind: 'FDA_LABEL',
    identifier: setId,
    label,
    locator,
    retrievedAt,
    ...(excerpt !== undefined ? { excerpt } : {}),
  }
}

const NITROGLYCERIN_LABEL = '041f127e-5166-4484-bc1a-0a373d1187ae'
const NORTRIPTYLINE_LABEL = '017f7717-e160-4142-9a5a-1a2bd9776707'
const OLANZAPINE_LABEL = '002dd00f-7946-ea4f-e063-6294a90a5916'
const OSELTAMIVIR_LABEL = '005b2784-e410-a50c-e063-6394a90a881c'
const PANTOPRAZOLE_LABEL = '014f9762-6948-46b7-8659-5c89f35ad8bf'
const PIOGLITAZONE_LABEL = '0331400c-b163-4856-bfb0-965470247cb3'
const QUETIAPINE_LABEL = '01261008-5f42-4844-8a65-d4545a67a309'
const RISPERIDONE_LABEL = '03d3b52d-3a7d-4595-84c9-332da6ca9171'
const SALMETEROL_LABEL = '12d9728e-6b5c-4aee-bfb0-745e542ed2e4'

export const BACKGROUND_BATCH_11: RecordedBackgroundBySlug = {
  nitroglycerin: {
    version: 'medicine-background/v1',
    authoredAt: AUTHORED,
    registryIdentifiers: {
      pubchemCid: '4510',
      casNumber: '55-63-0',
      unii: 'G59M7S0WS3',
      rxcui: '4917',
      source: {
        kind: 'PUBCHEM',
        identifier: '4510',
        label: "PubChem compound record matched for 'nitroglycerin'",
        retrievedAt: ARTIFACTS_FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Sublingual (sublingual tablets)',
      bioavailability: {
        display: 'approximately 40%',
        numeric: 40,
        unit: '%',
        populationContext:
          'sublingual tablets; variable due to factors influencing drug absorption, as recorded in the label',
        source: fdaLabel(
          NITROGLYCERIN_LABEL,
          'FDA label for nitroglycerin sublingual tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'The absolute bioavailability of nitroglycerin from nitroglycerin sublingual tablets is approximately 40% but tends to be variable due to factors influencing drug absorption, such as sublingual hydration and mucosal metabolism.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'approximately 6 to 7 minutes',
        unit: 'minutes',
        populationContext: 'mean time to peak plasma concentration after sublingual administration',
        source: fdaLabel(
          NITROGLYCERIN_LABEL,
          'FDA label for nitroglycerin sublingual tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Nitroglycerin is rapidly absorbed following sublingual administration of nitroglycerin sublingual tablets. Mean peak nitroglycerin plasma concentrations occur at a mean time of approximately 6 to 7 minutes postdose (Table 1).',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '2 to 3 minutes',
        unit: 'minutes',
        populationContext:
          'mean elimination half-life of plasma nitroglycerin, as recorded in the label',
        source: fdaLabel(
          NITROGLYCERIN_LABEL,
          'FDA label for nitroglycerin sublingual tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'Nitroglycerin plasma concentrations decrease rapidly, with a mean elimination half-life of 2 to 3 minutes. Half-life values range from 1.5 to 7.5 minutes.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 60%',
        numeric: 60,
        unit: '%',
        populationContext: 'at plasma concentrations between 50 and 500 ng/mL',
        source: fdaLabel(
          NITROGLYCERIN_LABEL,
          'FDA label for nitroglycerin sublingual tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'At plasma concentrations between 50 and 500 ng/mL, the binding of nitroglycerin to plasma proteins is approximately 60%, while that of 1,2- and 1,3-dinitroglycerin is 60% and 30%, respectively.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '3.3 L/kg',
        numeric: 3.3,
        unit: 'L/kg',
        populationContext: 'following intravenous administration, as recorded in the label',
        source: fdaLabel(
          NITROGLYCERIN_LABEL,
          'FDA label for nitroglycerin sublingual tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The volume of distribution (V Area ) of nitroglycerin following intravenous administration is 3.3 L/kg.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'A liver reductase enzyme is of primary importance in metabolism to glycerol di- and mononitrate metabolites; known sites of extrahepatic metabolism include red blood cells and vascular walls',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          NITROGLYCERIN_LABEL,
          'FDA label for nitroglycerin sublingual tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'A liver reductase enzyme is of primary importance in the metabolism of nitroglycerin to glycerol di- and mononitrate metabolites and ultimately to glycerol and organic nitrate. Known sites of extrahepatic metabolism include red blood cells and vascular walls.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: 'Metabolism is the primary route of drug elimination',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          NITROGLYCERIN_LABEL,
          'FDA label for nitroglycerin sublingual tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'Clearance (13.6 L/min) greatly exceeds hepatic blood flow. Metabolism is the primary route of drug elimination.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'NITROGLYCERIN',
        formAsRecorded: 'Sublingual tablets',
        strengthsAsRecorded: 'Sublingual tablets, 0.3 mg; 0.4 mg; 0.6 mg',
        approvedUseAsRecorded:
          'Acute relief of an attack or acute prophylaxis of angina pectoris due to coronary artery disease',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-10-15',
        source: fdaLabel(
          NITROGLYCERIN_LABEL,
          'FDA label for nitroglycerin sublingual tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Nitroglycerin sublingual tablets are indicated for the acute relief of an attack or acute prophylaxis of angina pectoris due to coronary artery disease.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'blood-vessels',
        actionAsRecorded:
          'Relaxation of vascular smooth muscle, producing dose-related dilation of both arterial and venous beds',
        source: fdaLabel(
          NITROGLYCERIN_LABEL,
          'FDA label for nitroglycerin sublingual tablets (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics',
          'The principal pharmacological action of nitroglycerin is relaxation of vascular smooth muscle. Although venous effects predominate, nitroglycerin produces, in a dose-related manner, dilation of both arterial and venous beds.',
        ),
      },
      {
        regionCode: 'heart',
        actionAsRecorded:
          'Dilates large epicardial coronary arteries, although the extent to which this effect contributes to relief of exertional angina is recorded as unclear',
        source: fdaLabel(
          NITROGLYCERIN_LABEL,
          'FDA label for nitroglycerin sublingual tablets (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics',
          'Nitroglycerin also produces arteriolar relaxation, thereby reducing peripheral vascular resistance and arterial pressure (afterload), and dilates large epicardial coronary arteries; however, the extent to which this latter effect contributes to the relief of exertional angina is unclear.',
        ),
      },
    ],
  },

  nortriptyline: {
    version: 'medicine-background/v1',
    authoredAt: AUTHORED,
    registryIdentifiers: {
      pubchemCid: '4543',
      casNumber: '72-69-5',
      unii: '00FN6IH15D',
      rxcui: '203130',
      source: {
        kind: 'PUBCHEM',
        identifier: '4543',
        label: "PubChem compound record matched for 'nortriptyline'",
        retrievedAt: ARTIFACTS_FETCHED,
      },
    },
    productVariants: [
      {
        brandName: 'Nortriptyline Hydrochloride',
        formAsRecorded: 'Capsules',
        strengthsAsRecorded: 'Capsules equivalent to 10 mg, 25 mg, 50 mg or 75 mg base',
        approvedUseAsRecorded: 'Relief of symptoms of depression',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-01-13',
        source: fdaLabel(
          NORTRIPTYLINE_LABEL,
          'FDA label for nortriptyline hydrochloride capsules (openFDA)',
          'indications_and_usage; how_supplied',
          'Nortriptyline hydrochloride capsules are indicated for the relief of symptoms of depression. Endogenous depressions are more likely to be alleviated than are other depressive states.',
        ),
      },
    ],
  },

  olanzapine: {
    version: 'medicine-background/v1',
    authoredAt: AUTHORED,
    registryIdentifiers: {
      pubchemCid: '135398745',
      casNumber: '132539-06-1',
      unii: 'N7U69T4SZR',
      rxcui: '1294588',
      source: {
        kind: 'PUBCHEM',
        identifier: '135398745',
        label: "PubChem compound record matched for 'olanzapine'",
        retrievedAt: ARTIFACTS_FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (orally disintegrating tablets)',
      tMax: {
        display: 'approximately 6 hours',
        numeric: 6,
        unit: 'hours',
        populationContext: 'following an oral dose, as recorded in the label',
        source: fdaLabel(
          OLANZAPINE_LABEL,
          'FDA label for olanzapine orally disintegrating tablets (openFDA)',
          'clinical_pharmacology 12.3, Oral Administration, Monotherapy',
          'Olanzapine is well absorbed and reaches peak concentrations in approximately 6 hours following an oral dose. It is eliminated extensively by first pass metabolism, with approximately 40% of the dose metabolized before reaching the systemic circulation.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '21 to 54 hours (mean of 30 hours)',
        numeric: 30,
        unit: 'hours',
        populationContext: '5th to 95th percentile across individuals, oral dosing',
        source: fdaLabel(
          OLANZAPINE_LABEL,
          'FDA label for olanzapine orally disintegrating tablets (openFDA)',
          'clinical_pharmacology 12.3, Oral Administration, Monotherapy',
          'Its half-life ranges from 21 to 54 hours (5th to 95th percentile; mean of 30 hr), and apparent plasma clearance ranges from 12 to 47 L/hr (5th to 95th percentile; mean of 25 L/hr).',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '93%',
        numeric: 93,
        unit: '%',
        populationContext:
          'over the concentration range of 7 to 1100 ng/mL, binding primarily to albumin and alpha-1-acid glycoprotein',
        source: fdaLabel(
          OLANZAPINE_LABEL,
          'FDA label for olanzapine orally disintegrating tablets (openFDA)',
          'clinical_pharmacology 12.3, Oral Administration, Monotherapy',
          'It is 93% bound to plasma proteins over the concentration range of 7 to 1100 ng/mL, binding primarily to albumin and α 1 -acid glycoprotein.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 1000 L',
        numeric: 1000,
        unit: 'L',
        populationContext: 'extensive distribution throughout the body, as recorded in the label',
        source: fdaLabel(
          OLANZAPINE_LABEL,
          'FDA label for olanzapine orally disintegrating tablets (openFDA)',
          'clinical_pharmacology 12.3, Oral Administration, Monotherapy',
          'Olanzapine is extensively distributed throughout the body, with a volume of distribution of approximately 1000 L.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Highly metabolized; direct glucuronidation and cytochrome P450 mediated oxidation are the primary metabolic pathways, with CYPs 1A2 and 2D6 and the flavin-containing monooxygenase system involved in oxidation',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          OLANZAPINE_LABEL,
          'FDA label for olanzapine orally disintegrating tablets (openFDA)',
          'clinical_pharmacology 12.3, Metabolism and Elimination',
          'Direct glucuronidation and cytochrome P450 (CYP) mediated oxidation are the primary metabolic pathways for olanzapine. In vitro studies suggest that CYPs 1A2 and 2D6, and the flavin-containing monooxygenase system are involved in olanzapine oxidation.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Approximately 57% of the dose recovered in the urine and 30% in the feces after a single oral radiolabeled dose',
        populationContext: 'single oral dose of radiolabeled olanzapine, as recorded in the label',
        source: fdaLabel(
          OLANZAPINE_LABEL,
          'FDA label for olanzapine orally disintegrating tablets (openFDA)',
          'clinical_pharmacology 12.3, Metabolism and Elimination',
          'Following a single oral dose of 14 C labeled olanzapine, 7% of the dose of olanzapine was recovered in the urine as unchanged drug, indicating that olanzapine is highly metabolized. Approximately 57% and 30% of the dose was recovered in the urine and feces, respectively.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(30),
    },
    productVariants: [
      {
        brandName: 'Olanzapine',
        formAsRecorded: 'Orally disintegrating tablets',
        strengthsAsRecorded: 'Orally Disintegrating Tablets: 5 mg, 10 mg, 15 mg, 20 mg',
        approvedUseAsRecorded:
          'Treatment of schizophrenia; acute treatment of manic or mixed episodes associated with bipolar I disorder and maintenance treatment of bipolar I disorder; adjunct to valproate or lithium in the treatment of manic or mixed episodes associated with bipolar I disorder',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2023-07-10',
        source: fdaLabel(
          OLANZAPINE_LABEL,
          'FDA label for olanzapine orally disintegrating tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Olanzapine is an atypical antipsychotic indicated: As oral formulation for the: Treatment of schizophrenia.',
        ),
      },
    ],
  },

  oseltamivir: {
    version: 'medicine-background/v1',
    authoredAt: AUTHORED,
    registryIdentifiers: {
      pubchemCid: '65028',
      casNumber: '196618-13-0',
      unii: '4A3O49NGEZ',
      rxcui: '259275',
      source: {
        kind: 'PUBCHEM',
        identifier: '65028',
        label: "PubChem compound record matched for 'oseltamivir'",
        retrievedAt: ARTIFACTS_FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (powder for oral suspension)',
      bioavailability: {
        display: 'at least 75%',
        numeric: 75,
        unit: '%',
        populationContext:
          'share of an oral dose reaching the systemic circulation as oseltamivir carboxylate, the active metabolite',
        source: fdaLabel(
          OSELTAMIVIR_LABEL,
          'FDA label for oseltamivir phosphate for oral suspension (openFDA)',
          'clinical_pharmacology 12.3, Absorption and Bioavailability',
          'Oseltamivir is absorbed from the gastrointestinal tract after oral administration of oseltamivir phosphate and is extensively converted predominantly by hepatic esterases to oseltamivir carboxylate. At least 75% of an oral dose reaches the systemic circulation as oseltamivir carboxylate and less than 5% of the oral dose reaches the systemic circulation as oseltamivir',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '6 to 10 hours',
        numeric: 8,
        unit: 'hours',
        populationContext:
          'plasma oseltamivir carboxylate (the active metabolite) in most subjects after oral administration; the parent compound: 1 to 3 hours',
        source: fdaLabel(
          OSELTAMIVIR_LABEL,
          'FDA label for oseltamivir phosphate for oral suspension (openFDA)',
          'clinical_pharmacology 12.3, Elimination',
          'Oseltamivir carboxylate is not further metabolized and is eliminated unchanged in urine. Plasma concentrations of oseltamivir carboxylate declined with a half-life of 6 to 10 hours in most subjects after oral administration.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '3%',
        numeric: 3,
        unit: '%',
        populationContext:
          'binding of oseltamivir carboxylate (the active metabolite) to human plasma protein; oseltamivir itself: 42%',
        source: fdaLabel(
          OSELTAMIVIR_LABEL,
          'FDA label for oseltamivir phosphate for oral suspension (openFDA)',
          'clinical_pharmacology 12.3, Distribution',
          'The binding of oseltamivir carboxylate to human plasma protein is low (3%). The binding of oseltamivir to human plasma protein is 42%, which is insufficient to cause significant displacement-based drug interactions.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '23 to 26 liters',
        numeric: 24.5,
        unit: 'L',
        populationContext:
          'oseltamivir carboxylate following intravenous administration in 24 subjects',
        source: fdaLabel(
          OSELTAMIVIR_LABEL,
          'FDA label for oseltamivir phosphate for oral suspension (openFDA)',
          'clinical_pharmacology 12.3, Distribution',
          'The volume of distribution (V ss ) of oseltamivir carboxylate, following intravenous administration in 24 subjects (oseltamivir phosphate is not available as an IV formulation), ranged between 23 and 26 liters.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively converted to the active metabolite, oseltamivir carboxylate, by esterases located predominantly in the liver; oseltamivir carboxylate is not further metabolized',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          OSELTAMIVIR_LABEL,
          'FDA label for oseltamivir phosphate for oral suspension (openFDA)',
          'clinical_pharmacology 12.3, Metabolism',
          'Oseltamivir is extensively converted to the active metabolite, oseltamivir carboxylate, by esterases located predominantly in the liver. Oseltamivir carboxylate is not further metabolized. Neither oseltamivir nor oseltamivir carboxylate is a substrate for, or inhibitor of, cytochrome P450 isoforms.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Oseltamivir carboxylate is eliminated entirely (more than 99%) by renal excretion; renal clearance exceeds glomerular filtration rate, indicating tubular secretion',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          OSELTAMIVIR_LABEL,
          'FDA label for oseltamivir phosphate for oral suspension (openFDA)',
          'clinical_pharmacology 12.3, Excretion',
          'Oseltamivir carboxylate is eliminated entirely (>99%) by renal excretion. Renal clearance (18.8 L/h) exceeds glomerular filtration rate (7.5 L/h), indicating that tubular secretion (via organic anion transporter) occurs in addition to glomerular filtration.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(8),
    },
    productVariants: [
      {
        brandName: 'Oseltamivir Phosphate',
        formAsRecorded: 'Powder for oral suspension',
        strengthsAsRecorded:
          'For oral suspension: 360 mg oseltamivir base supplied as powder (constituted to a final concentration of 6 mg/mL)',
        approvedUseAsRecorded:
          'Treatment of acute, uncomplicated influenza A and B in patients 2 weeks of age and older who have been symptomatic for no more than 48 hours; prophylaxis of influenza A and B in patients 1 year and older',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-05-15',
        source: fdaLabel(
          OSELTAMIVIR_LABEL,
          'FDA label for oseltamivir phosphate for oral suspension (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Oseltamivir phosphate for oral suspension is an influenza neuraminidase inhibitor (NAI) indicated for: Treatment of acute, uncomplicated influenza A and B in patients 2 weeks of age and older who have been symptomatic for no more than 48 hours. ( 1.1 ) Prophylaxis of influenza A and B in patients 1 year and older. ( 1.2 )',
        ),
      },
    ],
  },

  pantoprazole: {
    version: 'medicine-background/v1',
    authoredAt: AUTHORED,
    registryIdentifiers: {
      pubchemCid: '4679',
      casNumber: '102625-70-7',
      unii: '6871619Q5X',
      rxcui: '40790',
      source: {
        kind: 'PUBCHEM',
        identifier: '4679',
        label: "PubChem compound record matched for 'pantoprazole'",
        retrievedAt: ARTIFACTS_FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Intravenous (pantoprazole sodium for injection)',
      halfLife: {
        display: 'approximately one hour',
        numeric: 1,
        unit: 'hours',
        populationContext:
          'terminal elimination half-life of serum pantoprazole after intravenous administration',
        source: fdaLabel(
          PANTOPRAZOLE_LABEL,
          'FDA label for pantoprazole sodium for injection (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Following the administration of pantoprazole sodium for injection, the serum concentration of pantoprazole sodium for injection declines biexponentially with a terminal elimination half-life of approximately one hour.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'about 98%',
        numeric: 98,
        unit: '%',
        populationContext: 'serum protein binding, primarily to albumin',
        source: fdaLabel(
          PANTOPRAZOLE_LABEL,
          'FDA label for pantoprazole sodium for injection (openFDA)',
          'clinical_pharmacology 12.3, Distribution',
          'The apparent volume of distribution of pantoprazole is approximately 11 to 23.6 L, distributing mainly in extracellular fluid. The serum protein binding of pantoprazole is about 98%, primarily to albumin.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 11 to 23.6 L',
        numeric: 17.3,
        unit: 'L',
        populationContext:
          'apparent volume of distribution, distributing mainly in extracellular fluid',
        source: fdaLabel(
          PANTOPRAZOLE_LABEL,
          'FDA label for pantoprazole sodium for injection (openFDA)',
          'clinical_pharmacology 12.3, Distribution',
          'The apparent volume of distribution of pantoprazole is approximately 11 to 23.6 L, distributing mainly in extracellular fluid. The serum protein binding of pantoprazole is about 98%, primarily to albumin.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized in the liver through the cytochrome P450 system; the main pathway is demethylation by CYP2C19 with subsequent sulfation, and other pathways include oxidation by CYP3A4',
        populationContext:
          'independent of the route of administration (intravenous or oral), as recorded in the label',
        source: fdaLabel(
          PANTOPRAZOLE_LABEL,
          'FDA label for pantoprazole sodium for injection (openFDA)',
          'clinical_pharmacology 12.3, Elimination, Metabolism',
          'Pantoprazole is extensively metabolized in the liver through the cytochrome P450 (CYP) system. Pantoprazole metabolism is independent of the route of administration (intravenous or oral). The main metabolic pathway is demethylation, by CYP2C19, with subsequent sulfation; other metabolic pathways include oxidation by CYP3A4.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Approximately 71% of a radiolabeled intravenous dose excreted in the urine with 18% excreted in the feces through biliary excretion; no renal excretion of unchanged pantoprazole',
        populationContext:
          'healthy, extensive CYP2C19 metabolizers given a single intravenous radiolabeled dose',
        source: fdaLabel(
          PANTOPRAZOLE_LABEL,
          'FDA label for pantoprazole sodium for injection (openFDA)',
          'clinical_pharmacology 12.3, Excretion',
          'After administration of a single intravenous dose of 14 C-labeled pantoprazole sodium to healthy, extensive CYP2C19 metabolizers, approximately 71% of the dose was excreted in the urine with 18% excreted in the feces through biliary excretion. There was no renal excretion of unchanged pantoprazole.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(1),
    },
    productVariants: [
      {
        brandName: 'Pantoprazole Sodium',
        formAsRecorded: 'For injection (freeze-dried powder in a single-dose vial)',
        strengthsAsRecorded:
          'For Injection: 40 mg of pantoprazole in a single-dose vial for reconstitution or dilution',
        approvedUseAsRecorded:
          'Treatment of gastroesophageal reflux disease (GERD) and a history of erosive esophagitis (EE) for up to 10 days in adults; pathological hypersecretory conditions including Zollinger-Ellison (ZE) Syndrome in adults',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-06-27',
        source: fdaLabel(
          PANTOPRAZOLE_LABEL,
          'FDA label for pantoprazole sodium for injection (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Pantoprazole Sodium for Injection is indicated for treatment of: gastroesophageal reflux disease (GERD) and a history of erosive esophagitis (EE) for up to 10 days in adults. pathological hypersecretory conditions including Zollinger-Ellison (ZE) Syndrome in adults.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'stomach',
        actionAsRecorded:
          'Suppresses the final step in gastric acid production by covalently binding to the (H+, K+)-ATPase enzyme system at the secretory surface of the gastric parietal cell',
        source: fdaLabel(
          PANTOPRAZOLE_LABEL,
          'FDA label for pantoprazole sodium for injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Pantoprazole is a PPI that suppresses the final step in gastric acid production by covalently binding to the (H + , K + )-ATPase enzyme system at the secretory surface of the gastric parietal cell. This effect leads to inhibition of both basal and stimulated gastric acid secretion irrespective of the stimulus.',
        ),
      },
    ],
  },

  pioglitazone: {
    version: 'medicine-background/v1',
    authoredAt: AUTHORED,
    registryIdentifiers: {
      pubchemCid: '4829',
      casNumber: '111025-46-8',
      unii: 'JQT35NPK6C',
      rxcui: '259319',
      source: {
        kind: 'PUBCHEM',
        identifier: '4829',
        label: "PubChem compound record matched for 'pioglitazone'",
        retrievedAt: ARTIFACTS_FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets), once daily without regard to meals',
      tMax: {
        display: 'within two hours',
        numeric: 2,
        unit: 'hours',
        populationContext:
          'following oral administration; food delays the T max to three to four hours',
        source: fdaLabel(
          PIOGLITAZONE_LABEL,
          'FDA label for pioglitazone tablets (openFDA)',
          'clinical_pharmacology 12.3, Absorption',
          'Following oral administration of pioglitazone, T max of pioglitazone was within two hours. Food delays the T max to three to four hours but does not alter the extent of absorption (AUC).',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'three to seven hours',
        numeric: 5,
        unit: 'hours',
        populationContext:
          'mean serum half-life of parent pioglitazone; its M-III and M-IV metabolites: 16 to 24 hours',
        source: fdaLabel(
          PIOGLITAZONE_LABEL,
          'FDA label for pioglitazone tablets (openFDA)',
          'clinical_pharmacology 12.3, Excretion and Elimination',
          'The mean serum half-life (t 1/2 ) of pioglitazone and its metabolites (M-III and M-IV) range from three to seven hours and 16 to 24 hours, respectively.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'more than 99%',
        numeric: 99,
        unit: '%',
        populationContext: 'in human serum, principally to serum albumin',
        source: fdaLabel(
          PIOGLITAZONE_LABEL,
          'FDA label for pioglitazone tablets (openFDA)',
          'clinical_pharmacology 12.3, Distribution',
          'Pioglitazone is extensively protein bound (> 99%) in human serum, principally to serum albumin.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '0.63 ± 0.41 L/kg',
        numeric: 0.63,
        unit: 'L/kg',
        populationContext:
          'mean apparent volume of distribution (Vd/F) following single-dose administration',
        source: fdaLabel(
          PIOGLITAZONE_LABEL,
          'FDA label for pioglitazone tablets (openFDA)',
          'clinical_pharmacology 12.3, Distribution',
          'The mean apparent volume of distribution (Vd/F) of pioglitazone following single- dose administration is 0.63 ± 0.41 (mean ± SD) L/kg of body weight.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Multiple CYP isoforms are involved, including CYP2C8 and, to a lesser degree, CYP3A4, with additional contributions from other isoforms including the mainly extrahepatic CYP1A1',
        populationContext: 'in vitro data, as recorded in the label',
        source: fdaLabel(
          PIOGLITAZONE_LABEL,
          'FDA label for pioglitazone tablets (openFDA)',
          'clinical_pharmacology 12.3, Metabolism',
          'In vitro data demonstrate that multiple CYP isoforms are involved in the metabolism of pioglitazone, which include CYP2C8 and, to a lesser degree, CYP3A4 with additional contributions from a variety of other isoforms including the mainly extrahepatic CYP1A1.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Approximately 15% to 30% of the dose recovered in the urine; renal elimination is negligible, and most of the oral dose is presumed excreted into the bile and eliminated in the feces',
        populationContext: 'following oral administration, as recorded in the label',
        source: fdaLabel(
          PIOGLITAZONE_LABEL,
          'FDA label for pioglitazone tablets (openFDA)',
          'clinical_pharmacology 12.3, Excretion and Elimination',
          'Following oral administration, approximately 15% to 30% of the pioglitazone dose is recovered in the urine. Renal elimination of pioglitazone is negligible, and the drug is excreted primarily as metabolites and their conjugates. It is presumed that most of the oral dose is excreted into the bile either unchanged or as metabolites and eliminated in the feces.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(5),
    },
    productVariants: [
      {
        brandName: 'Pioglitazone Hydrochloride',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: 'Tablets: 15 mg, 30 mg, and 45 mg',
        approvedUseAsRecorded:
          'Adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus in multiple clinical settings',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-05-17',
        source: fdaLabel(
          PIOGLITAZONE_LABEL,
          'FDA label for pioglitazone tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Pioglitazone tablets are indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus in multiple clinical settings',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'liver',
        actionAsRecorded:
          'Decreases insulin resistance in the periphery and in the liver, resulting in increased insulin-dependent glucose disposal and decreased hepatic glucose output',
        source: fdaLabel(
          PIOGLITAZONE_LABEL,
          'FDA label for pioglitazone tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Pioglitazone decreases insulin resistance in the periphery and in the liver resulting in increased insulin-dependent glucose disposal and decreased hepatic glucose output.',
        ),
      },
      {
        regionCode: 'muscle',
        actionAsRecorded:
          'Agonist for PPAR-gamma receptors found in tissues important for insulin action such as adipose tissue, skeletal muscle, and liver',
        source: fdaLabel(
          PIOGLITAZONE_LABEL,
          'FDA label for pioglitazone tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'PPAR receptors are found in tissues important for insulin action such as adipose tissue, skeletal muscle, and liver.',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT00174993',
      includedAsRecorded: [
        'Type 2 diabetes mellitus',
        'Glycosylated hemoglobin above the upper limit of normal',
        'Established history of macrovascular disease, defined as 1 or more of: myocardial infarction at least 6 months before entry into the study; stroke at least 6 months before entry into the study; percutaneous coronary intervention or coronary artery bypass graft at least 6 months before entry into the study; acute coronary syndrome at least 3 months before entry into the study; objective evidence of coronary artery disease; peripheral arterial obstructive disease',
      ],
      excludedAsRecorded: [
        'Signs of type 1 diabetes',
        'Myocardial infarction, stroke, coronary artery bypass graft, or percutaneous cardiac intervention in the 6 months prior to enrolment',
        'Acute coronary syndrome in the 3 months prior to enrolment',
        'Heart failure at entry defined as patient having a New York Heart Association functional score of II or above',
        'Significantly impaired hepatic function, defined as alanine aminotransferase greater than 2.5 times the upper limit of normal',
        'Required dialysis',
      ],
      studiedGroupAsRecorded: 'Ages eligible for study: 35 to 75 years, all sexes, as registered',
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT00174993',
        label:
          'ClinicalTrials.gov record for the PROactive macrovascular outcomes study of pioglitazone in type 2 diabetes',
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: REFETCHED,
        excerpt:
          'Inclusion Criteria * Type 2 diabetes mellitus * Glycosylated hemoglobin above the upper limit of normal (ie, the local equivalent of 6.5% for) * Established history of macrovascular disease, defined as 1 or more of: * Myocardial infarction at least 6 months before entry into the study.',
      },
    },
  },

  quercetin: {
    version: 'medicine-background/v1',
    authoredAt: AUTHORED,
    registryIdentifiers: {
      pubchemCid: '5280343',
      casNumber: '117-39-5',
      rxcui: '9060',
      source: {
        kind: 'PUBCHEM',
        identifier: '5280343',
        label: "PubChem compound record matched for 'quercetin'",
        retrievedAt: ARTIFACTS_FETCHED,
      },
    },
  },

  quetiapine: {
    version: 'medicine-background/v1',
    authoredAt: AUTHORED,
    registryIdentifiers: {
      pubchemCid: '5002',
      casNumber: '111974-69-7',
      unii: '2S3PL1B6UJ',
      rxcui: '51272',
      source: {
        kind: 'PUBCHEM',
        identifier: '5002',
        label: "PubChem compound record matched for 'quetiapine'",
        retrievedAt: ARTIFACTS_FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets)',
      bioavailability: {
        display: '100% bioavailable relative to solution',
        numeric: 100,
        unit: '%',
        populationContext: 'tablet formulation relative to solution (relative bioavailability)',
        source: fdaLabel(
          QUETIAPINE_LABEL,
          'FDA label for quetiapine tablets (openFDA)',
          'clinical_pharmacology 12.3, Absorption',
          'Quetiapine is rapidly absorbed after oral administration, reaching peak plasma concentrations in 1.5 hours. The tablet formulation is 100% bioavailable relative to solution.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '1.5 hours',
        numeric: 1.5,
        unit: 'hours',
        populationContext: 'rapid absorption after oral administration, as recorded in the label',
        source: fdaLabel(
          QUETIAPINE_LABEL,
          'FDA label for quetiapine tablets (openFDA)',
          'clinical_pharmacology 12.3, Absorption',
          'Quetiapine is rapidly absorbed after oral administration, reaching peak plasma concentrations in 1.5 hours. The tablet formulation is 100% bioavailable relative to solution.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 6 hours',
        numeric: 6,
        unit: 'hours',
        populationContext:
          'mean terminal half-life within the proposed clinical dose range, adults',
        source: fdaLabel(
          QUETIAPINE_LABEL,
          'FDA label for quetiapine tablets (openFDA)',
          'clinical_pharmacology 12.3, Adults',
          'Elimination of quetiapine is mainly via hepatic metabolism with a mean terminal half-life of about 6 hours within the proposed clinical dose range. Steady-state concentrations are expected to be achieved within two days of dosing.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '83%',
        numeric: 83,
        unit: '%',
        populationContext: 'binding to plasma proteins at therapeutic concentrations',
        source: fdaLabel(
          QUETIAPINE_LABEL,
          'FDA label for quetiapine tablets (openFDA)',
          'clinical_pharmacology 12.3, Distribution',
          'Quetiapine is widely distributed throughout the body with an apparent volume of distribution of 10±4 L/kg. It is 83% bound to plasma proteins at therapeutic concentrations.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '10±4 L/kg',
        numeric: 10,
        unit: 'L/kg',
        populationContext: 'apparent volume of distribution; wide distribution throughout the body',
        source: fdaLabel(
          QUETIAPINE_LABEL,
          'FDA label for quetiapine tablets (openFDA)',
          'clinical_pharmacology 12.3, Distribution',
          'Quetiapine is widely distributed throughout the body with an apparent volume of distribution of 10±4 L/kg. It is 83% bound to plasma proteins at therapeutic concentrations.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized by the liver; the cytochrome P450 3A4 isoenzyme is involved in metabolism to the major, inactive sulfoxide metabolite and to the active metabolite N-desalkyl quetiapine',
        populationContext:
          'in vitro studies using human liver microsomes, as recorded in the label',
        source: fdaLabel(
          QUETIAPINE_LABEL,
          'FDA label for quetiapine tablets (openFDA)',
          'clinical_pharmacology 12.3, Metabolism and Elimination',
          'In vitro studies using human liver microsomes revealed that the cytochrome P450 3A4 isoenzyme is involved in the metabolism of quetiapine to its major, but inactive, sulfoxide metabolite and in the metabolism of its active metabolite N-desalkyl quetiapine.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Less than 1% of the dose excreted as unchanged drug; approximately 73% of the dose recovered in the urine and 20% in the feces',
        populationContext: 'single oral dose of radiolabeled quetiapine, as recorded in the label',
        source: fdaLabel(
          QUETIAPINE_LABEL,
          'FDA label for quetiapine tablets (openFDA)',
          'clinical_pharmacology 12.3, Metabolism and Elimination',
          'Following a single oral dose of 14C-quetiapine, less than 1% of the administered dose was excreted as unchanged drug, indicating that quetiapine is highly metabolized. Approximately 73% and 20% of the dose was recovered in the urine and feces, respectively.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(6),
    },
    productVariants: [
      {
        brandName: 'Quetiapine',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: 'Tablets: 25 mg, 50 mg, 100 mg, 150 mg, 200 mg, 300 mg, and 400 mg',
        approvedUseAsRecorded:
          'Treatment of schizophrenia; bipolar I disorder manic episodes; bipolar disorder, depressive episodes',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-06-27',
        source: fdaLabel(
          QUETIAPINE_LABEL,
          'FDA label for quetiapine tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Quetiapine is an atypical antipsychotic indicated for the treatment of: Schizophrenia ( 1.1 ) Bipolar I disorder manic episodes ( 1.2 ) Bipolar disorder, depressive episodes ( 1.2 )',
        ),
      },
    ],
  },

  resveratrol: {
    version: 'medicine-background/v1',
    authoredAt: AUTHORED,
    registryIdentifiers: {
      pubchemCid: '445154',
      casNumber: '501-36-0',
      rxcui: '1000492',
      source: {
        kind: 'PUBCHEM',
        identifier: '445154',
        label: "PubChem compound record matched for 'resveratrol'",
        retrievedAt: ARTIFACTS_FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded:
        'Oral (radiolabeled study of oral and intravenous doses in human volunteers)',
      halfLife: {
        display: '9.2 ± 0.6 hours',
        numeric: 9.2,
        unit: 'hours',
        populationContext:
          'six human volunteers, 25-mg oral dose of radiolabeled resveratrol; plasma half-life of resveratrol and metabolites combined',
        source: {
          kind: 'PUBMED',
          identifier: '15333514',
          label:
            'PubMed abstract: High absorption but very low bioavailability of oral resveratrol in humans (Drug Metab Dispos, 2004)',
          locator: 'abstract',
          retrievedAt: REFETCHED,
          excerpt:
            'The absorption of a dietary relevant 25-mg oral dose was at least 70%, with peak plasma levels of resveratrol and metabolites of 491 +/- 90 ng/ml (about 2 microM) and a plasma half-life of 9.2 +/- 0.6 h.',
        },
      },
      metabolismAsRecorded: {
        display:
          'Sulfate and glucuronic acid conjugation of the phenolic groups and hydrogenation of the aliphatic double bond, the latter likely produced by the intestinal microflora',
        populationContext:
          'liquid chromatography/mass spectrometry analysis in six human volunteers, as recorded in the abstract',
        source: {
          kind: 'PUBMED',
          identifier: '15333514',
          label:
            'PubMed abstract: High absorption but very low bioavailability of oral resveratrol in humans (Drug Metab Dispos, 2004)',
          locator: 'abstract',
          retrievedAt: REFETCHED,
          excerpt:
            'Most of the oral dose was recovered in urine, and liquid chromatography/mass spectrometry analysis identified three metabolic pathways, i.e., sulfate and glucuronic acid conjugation of the phenolic groups and, interestingly, hydrogenation of the aliphatic double bond, the latter likely produced by the intestinal microflora.',
        },
      },
      eliminationAsRecorded: {
        display: 'Most of the oral dose was recovered in urine',
        populationContext: 'six human volunteers, 25-mg oral dose, as recorded in the abstract',
        source: {
          kind: 'PUBMED',
          identifier: '15333514',
          label:
            'PubMed abstract: High absorption but very low bioavailability of oral resveratrol in humans (Drug Metab Dispos, 2004)',
          locator: 'abstract',
          retrievedAt: REFETCHED,
          excerpt:
            'Most of the oral dose was recovered in urine, and liquid chromatography/mass spectrometry analysis identified three metabolic pathways, i.e., sulfate and glucuronic acid conjugation of the phenolic groups and, interestingly, hydrogenation of the aliphatic double bond, the latter likely produced by the intestinal microflora.',
        },
      },
    },
  },

  risperidone: {
    version: 'medicine-background/v1',
    authoredAt: AUTHORED,
    registryIdentifiers: {
      pubchemCid: '5073',
      casNumber: '106266-06-2',
      unii: 'L6UH7ZF8HC',
      rxcui: '35636',
      source: {
        kind: 'PUBCHEM',
        identifier: '5073',
        label: "PubChem compound record matched for 'risperidone'",
        retrievedAt: ARTIFACTS_FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      bioavailability: {
        display: '70%',
        numeric: 70,
        unit: '%',
        populationContext: 'absolute oral bioavailability of risperidone',
        source: fdaLabel(
          RISPERIDONE_LABEL,
          'FDA label for risperidone tablets (openFDA)',
          'clinical_pharmacology 12.3, Absorption',
          'Risperidone is well absorbed. The absolute oral bioavailability of risperidone is 70% (CV=25%). The relative oral bioavailability of risperidone from a tablet is 94% (CV=10%) when compared to a solution.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'about 1 hour',
        numeric: 1,
        unit: 'hours',
        populationContext:
          'mean peak plasma concentration of parent risperidone after oral tablet administration',
        source: fdaLabel(
          RISPERIDONE_LABEL,
          'FDA label for risperidone tablets (openFDA)',
          'clinical_pharmacology 12.3, Absorption',
          'Following oral administration of tablet, mean peak plasma concentrations of risperidone occurred at about 1 hour. Peak concentrations of 9-hydroxyrisperidone occurred at about 3 hours in extensive metabolizers, and 17 hours in poor metabolizers.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 20 hours',
        numeric: 20,
        unit: 'hours',
        populationContext:
          'overall mean elimination half-life of risperidone plus 9-hydroxyrisperidone combined, similar in extensive and poor metabolizers',
        source: fdaLabel(
          RISPERIDONE_LABEL,
          'FDA label for risperidone tablets (openFDA)',
          'clinical_pharmacology 12.3, Excretion',
          'The pharmacokinetics of risperidone and 9-hydroxyrisperidone combined, after single and multiple doses, were similar in extensive and poor metabolizers, with an overall mean elimination half-life of about 20 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 90%',
        numeric: 90,
        unit: '%',
        populationContext:
          'plasma protein binding of risperidone, bound to albumin and alpha-1-acid glycoprotein',
        source: fdaLabel(
          RISPERIDONE_LABEL,
          'FDA label for risperidone tablets (openFDA)',
          'clinical_pharmacology 12.3, Distribution',
          'The plasma protein binding of risperidone is approximately 90%, and that of its major metabolite, 9-hydroxyrisperidone, is 77%.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '1 to 2 L/kg',
        numeric: 1.5,
        unit: 'L/kg',
        populationContext: 'rapid distribution, as recorded in the label',
        source: fdaLabel(
          RISPERIDONE_LABEL,
          'FDA label for risperidone tablets (openFDA)',
          'clinical_pharmacology 12.3, Distribution',
          'Risperidone is rapidly distributed. The volume of distribution is 1-2 L/kg.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized in the liver; the main pathway is hydroxylation to 9-hydroxyrisperidone by the enzyme CYP 2D6, with a minor pathway through N-dealkylation',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          RISPERIDONE_LABEL,
          'FDA label for risperidone tablets (openFDA)',
          'clinical_pharmacology 12.3, Metabolism',
          'Risperidone is extensively metabolized in the liver. The main metabolic pathway is through hydroxylation of risperidone to 9-hydroxyrisperidone by the enzyme, CYP 2D6. A minor metabolic pathway is through N -dealkylation.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Eliminated via the urine and, to a much lesser extent, via the feces; total recovery of radioactivity at 1 week was 84%, including 70% in the urine and 14% in the feces',
        populationContext:
          'mass balance study of a single 1 mg oral radiolabeled dose in three healthy male volunteers',
        source: fdaLabel(
          RISPERIDONE_LABEL,
          'FDA label for risperidone tablets (openFDA)',
          'clinical_pharmacology 12.3, Excretion',
          'Risperidone and its metabolites are eliminated via the urine and, to a much lesser extent, via the feces. As illustrated by a mass balance study of a single 1 mg oral dose of 14 C-risperidone administered as solution to three healthy male volunteers, total recovery of radioactivity at 1 week was 84%, including 70% in the urine and 14% in the feces.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(20),
    },
    productVariants: [
      {
        brandName: 'RISPERIDONE',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: 'Tablets: 1 mg',
        approvedUseAsRecorded:
          'Treatment of schizophrenia; as monotherapy or adjunctive therapy with lithium or valproate for the treatment of acute manic or mixed episodes associated with Bipolar I Disorder; treatment of irritability associated with autistic disorder',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-06-25',
        source: fdaLabel(
          RISPERIDONE_LABEL,
          'FDA label for risperidone tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Risperidone tablets are an atypical antipsychotic indicated for: Treatment of schizophrenia ( 1.1 ) As monotherapy or adjunctive therapy with lithium or valproate, for the treatment of acute manic or mixed episodes associated with Bipolar I Disorder ( 1.2 ) Treatment of irritability associated with autistic disorder ( 1.3 )',
        ),
      },
    ],
  },

  salmeterol: {
    version: 'medicine-background/v1',
    authoredAt: AUTHORED,
    registryIdentifiers: {
      pubchemCid: '5152',
      casNumber: '89365-50-4',
      rxcui: '36117',
      source: {
        kind: 'PUBCHEM',
        identifier: '5152',
        label: "PubChem compound record matched for 'salmeterol'",
        retrievedAt: ARTIFACTS_FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral inhalation (inhalation powder)',
      tMax: {
        display: '20 minutes',
        unit: 'minutes',
        populationContext:
          '7 subjects with asthma, chronic administration of 50 mcg inhalation powder twice daily; mean peak plasma concentration',
        source: fdaLabel(
          SALMETEROL_LABEL,
          'FDA label for SEREVENT DISKUS (salmeterol xinafoate inhalation powder) (openFDA)',
          'clinical_pharmacology 12.3, Absorption',
          'Following chronic administration of an inhaled dose of 50 mcg of salmeterol inhalation powder twice daily, salmeterol was detected in plasma within 5 to 45 minutes in 7 subjects with asthma; plasma concentrations were very low, with mean peak concentrations of 167 pg/mL at 20 minutes and no accumulation with repeated doses.',
          REFETCHED,
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 5.5 hours',
        numeric: 5.5,
        unit: 'hours',
        populationContext:
          'terminal elimination half-life measured in 1 volunteer of 2 healthy adult subjects given 1 mg of radiolabeled salmeterol orally',
        source: fdaLabel(
          SALMETEROL_LABEL,
          'FDA label for SEREVENT DISKUS (salmeterol xinafoate inhalation powder) (openFDA)',
          'clinical_pharmacology 12.3, Elimination',
          'In 2 healthy adult subjects who received 1 mg of radiolabeled salmeterol (as salmeterol xinafoate) orally, approximately 25% and 60% of the radiolabeled salmeterol was eliminated in urine and feces, respectively, over a period of 7 days. The terminal elimination half-life was about 5.5 hours (1 volunteer only).',
          REFETCHED,
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'averages 96%',
        numeric: 96,
        unit: '%',
        populationContext:
          'in vitro over the concentration range of 8 to 7,722 ng of salmeterol base per milliliter',
        source: fdaLabel(
          SALMETEROL_LABEL,
          'FDA label for SEREVENT DISKUS (salmeterol xinafoate inhalation powder) (openFDA)',
          'clinical_pharmacology 12.3, Distribution',
          'The percentage of salmeterol bound to human plasma proteins averages 96% in vitro over the concentration range of 8 to 7,722 ng of salmeterol base per milliliter, much higher concentrations than those achieved following therapeutic doses of salmeterol.',
          REFETCHED,
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Salmeterol base is extensively metabolized by hydroxylation, to alpha-hydroxysalmeterol (aliphatic oxidation) by CYP3A4, with subsequent elimination predominantly in the feces',
        populationContext: 'in vitro study using human liver microsomes, as recorded in the label',
        source: fdaLabel(
          SALMETEROL_LABEL,
          'FDA label for SEREVENT DISKUS (salmeterol xinafoate inhalation powder) (openFDA)',
          'clinical_pharmacology 12.3, Metabolism',
          'Salmeterol base is extensively metabolized by hydroxylation, with subsequent elimination predominantly in the feces. No significant amount of unchanged salmeterol base was detected in either urine or feces. An in vitro study using human liver microsomes showed that salmeterol is extensively metabolized to α-hydroxysalmeterol (aliphatic oxidation) by CYP3A4.',
          REFETCHED,
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Approximately 25% and 60% of radiolabeled salmeterol eliminated in urine and feces, respectively, over a period of 7 days',
        populationContext: '2 healthy adult subjects given 1 mg of radiolabeled salmeterol orally',
        source: fdaLabel(
          SALMETEROL_LABEL,
          'FDA label for SEREVENT DISKUS (salmeterol xinafoate inhalation powder) (openFDA)',
          'clinical_pharmacology 12.3, Elimination',
          'In 2 healthy adult subjects who received 1 mg of radiolabeled salmeterol (as salmeterol xinafoate) orally, approximately 25% and 60% of the radiolabeled salmeterol was eliminated in urine and feces, respectively, over a period of 7 days.',
          REFETCHED,
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(5.5),
    },
    productVariants: [
      {
        brandName: 'SEREVENT DISKUS',
        formAsRecorded: 'Inhalation powder',
        strengthsAsRecorded:
          'Inhaler containing salmeterol (50 mcg) as a powder formulation for oral inhalation',
        approvedUseAsRecorded:
          'Treatment of asthma in patients aged 4 years and older with an inhaled corticosteroid (ICS); prevention of exercise-induced bronchospasm (EIB) in patients aged 4 years and older; maintenance treatment of bronchospasm associated with chronic obstructive pulmonary disease (COPD)',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2022-10-10',
        source: fdaLabel(
          SALMETEROL_LABEL,
          'FDA label for SEREVENT DISKUS (salmeterol xinafoate inhalation powder) (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'SEREVENT DISKUS is a LABA indicated for: • Treatment of asthma in patients aged 4 years and older with an ICS. ( 1.1 ) • Prevention of exercise-induced bronchospasm (EIB) in patients aged 4 years and older. ( 1.2 ) • Maintenance treatment of bronchospasm associated with chronic obstructive pulmonary disease (COPD). ( 1.3 )',
          REFETCHED,
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'lungs',
        actionAsRecorded:
          'Increased cyclic AMP levels cause relaxation of bronchial smooth muscle and inhibition of release of mediators of immediate hypersensitivity from cells, especially mast cells',
        source: fdaLabel(
          SALMETEROL_LABEL,
          'FDA label for SEREVENT DISKUS (salmeterol xinafoate inhalation powder) (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Increased cyclic AMP levels cause relaxation of bronchial smooth muscle and inhibition of release of mediators of immediate hypersensitivity from cells, especially from mast cells. In vitro tests show that salmeterol is a potent and long-lasting inhibitor of the release of mast cell mediators, such as histamine, leukotrienes, and prostaglandin D 2 , from human lung.',
          REFETCHED,
        ),
      },
    ],
  },
}
