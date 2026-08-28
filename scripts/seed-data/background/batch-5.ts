import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import type { BackgroundSource } from '@/lib/background/types'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 5: montelukast, naloxone, naltrexone, omeprazole, ondansetron, prednisone, pregabalin,
 * rivaroxaban, rosuvastatin, semaglutide, sertraline.
 *
 * Honest omissions in this batch:
 * - naloxone: the openFDA generic-name search returned a pentazocine/naloxone combination label,
 *   which is a different product, so no label-derived module is recorded — registry identifiers
 *   from PubChem only.
 * - omeprazole: the fetched label is a short over-the-counter label with no pharmacokinetics,
 *   strengths or clinical-studies sections — registry identifiers only.
 * - prednisone: the fetched label has no clinical-pharmacology section and states no tablet
 *   strengths, so no pharmacokinetics or product-variant module is recorded.
 * - semaglutide costContext: the designated source (PubMed 38536173) was fetched and is a
 *   multiple-myeloma patient-reported-outcomes study containing no medicine cost data, so no
 *   cost entry is recorded.
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

const MONTELUKAST_LABEL = '04b3faff-1ea1-4d2a-aa31-9d6e742e1759'
const NALTREXONE_LABEL = '00c04ff4-b6f2-466c-9ab9-813a60577db0'
const ONDANSETRON_LABEL = '00327696-c496-4c83-a63e-9e29fd6246d4'
const PREDNISONE_LABEL = '0060b86b-0b79-4c54-a7be-97683a933a05'
const PREGABALIN_LABEL = '0101cd1f-4a95-40e9-86a8-ccde8d656e3d'
const RIVAROXABAN_LABEL = '10db92f9-2300-4a80-836b-673e1ae91610'
const ROSUVASTATIN_LABEL = '02797697-300a-43db-92cf-9b78f08626be'
const SEMAGLUTIDE_LABEL = '27f15fac-7d98-4114-a2ec-92494a91da98'
const SERTRALINE_LABEL = '00179766-980b-44b0-99d3-1fee2bb27e37'

export const BACKGROUND_BATCH_5: RecordedBackgroundBySlug = {
  montelukast: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5281040',
      casNumber: '158966-92-8',
      unii: 'MHM278SD3E',
      rxcui: '88249',
      source: {
        kind: 'PUBCHEM',
        identifier: '5281040',
        label: "PubChem compound record matched for 'montelukast'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated and chewable tablets)',
      bioavailability: {
        display: '64%',
        numeric: 64,
        unit: '%',
        populationContext: '10-mg film-coated tablet, fasted adults',
        source: fdaLabel(
          MONTELUKAST_LABEL,
          'FDA label for montelukast sodium chewable tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'After administration of the 10-mg film-coated tablet to fasted adults, the mean peak montelukast plasma concentration (C max ) is achieved in 3 to 4 hours (T max ). The mean oral bioavailability is 64%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '3 to 4 hours',
        numeric: 3.5,
        unit: 'hours',
        populationContext: '10-mg film-coated tablet, fasted adults',
        source: fdaLabel(
          MONTELUKAST_LABEL,
          'FDA label for montelukast sodium chewable tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'After administration of the 10-mg film-coated tablet to fasted adults, the mean peak montelukast plasma concentration (C max ) is achieved in 3 to 4 hours (T max ). The mean oral bioavailability is 64%.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '2.7 to 5.5 hours',
        numeric: 4.1,
        unit: 'hours',
        populationContext: 'healthy young adults, mean plasma half-life across several studies',
        source: fdaLabel(
          MONTELUKAST_LABEL,
          'FDA label for montelukast sodium chewable tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'In several studies, the mean plasma half-life of montelukast ranged from 2.7 to 5.5 hours in healthy young adults.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'more than 99%',
        numeric: 99,
        unit: '%',
        populationContext: 'binding to plasma proteins, as recorded in the label',
        source: fdaLabel(
          MONTELUKAST_LABEL,
          'FDA label for montelukast sodium chewable tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Montelukast is more than 99% bound to plasma proteins. The steady state volume of distribution of montelukast averages 8 to 11 liters.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '8 to 11 liters',
        numeric: 9.5,
        unit: 'L',
        populationContext: 'steady-state volume of distribution, as recorded in the label',
        source: fdaLabel(
          MONTELUKAST_LABEL,
          'FDA label for montelukast sodium chewable tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Montelukast is more than 99% bound to plasma proteins. The steady state volume of distribution of montelukast averages 8 to 11 liters.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized; CYP3A4, 2C8, and 2C9 are involved, with 2C8 playing a major role at clinically relevant concentrations',
        populationContext:
          'in vitro studies using human liver microsomes, as recorded in the label',
        source: fdaLabel(
          MONTELUKAST_LABEL,
          'FDA label for montelukast sodium chewable tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'In vitro studies using human liver microsomes indicate that CYP3A4, 2C8, and 2C9 are involved in the metabolism of montelukast. At clinically relevant concentrations, 2C8 appears to play a major role in the metabolism of montelukast.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Excreted almost exclusively via the bile; most of a radiolabeled oral dose was recovered in fecal collections',
        populationContext: 'radiolabeled oral dose study, as recorded in the label',
        source: fdaLabel(
          MONTELUKAST_LABEL,
          'FDA label for montelukast sodium chewable tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'Following an oral dose of radiolabeled montelukast, 86% of the radioactivity was recovered in 5-day fecal collections and <0.2% was recovered in urine. Coupled with estimates of montelukast oral bioavailability, this indicates that montelukast and its metabolites are excreted almost exclusively via the bile.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(4.1),
    },
    productVariants: [
      {
        brandName: 'montelukast sodium',
        formAsRecorded: 'Chewable tablets',
        strengthsAsRecorded: 'Chewable tablets: 4 mg and 5 mg',
        approvedUseAsRecorded:
          'Prophylaxis and chronic treatment of asthma in patients 2 years of age and older; acute prevention of exercise-induced bronchoconstriction (EIB) in patients 6 years of age and older; relief of symptoms of allergic rhinitis',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-03-05',
        source: fdaLabel(
          MONTELUKAST_LABEL,
          'FDA label for montelukast sodium chewable tablets (openFDA)',
          'dosage_forms_and_strengths; indications_and_usage',
          'Montelukast sodium chewable tablets are a leukotriene receptor antagonist indicated for: • Prophylaxis and chronic treatment of asthma in patients 2 years of age and older ( 1.1 ). • Acute prevention of exercise-induced bronchoconstriction (EIB) in patients 6 years of age and older ( 1.2 ).',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'lungs',
        actionAsRecorded:
          'Binds the cysteinyl leukotriene CysLT1 receptor found in the human airway, including airway smooth muscle cells and airway macrophages',
        source: fdaLabel(
          MONTELUKAST_LABEL,
          'FDA label for montelukast sodium chewable tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'The CysLT type-1 (CysLT 1 ) receptor is found in the human airway (including airway smooth muscle cells and airway macrophages) and on other pro-inflammatory cells (including eosinophils and certain myeloid stem cells).',
        ),
      },
      {
        regionCode: 'nasal-airway',
        actionAsRecorded:
          'In allergic rhinitis, cysteinyl leukotrienes are released from the nasal mucosa after allergen exposure and are associated with symptoms',
        source: fdaLabel(
          MONTELUKAST_LABEL,
          'FDA label for montelukast sodium chewable tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'In allergic rhinitis, CysLTs are released from the nasal mucosa after allergen exposure during both early- and late-phase reactions and are associated with symptoms of allergic rhinitis.',
        ),
      },
    ],
  },

  naloxone: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5284596',
      casNumber: '465-65-6',
      rxcui: '203192',
      source: {
        kind: 'PUBCHEM',
        identifier: '5284596',
        label: "PubChem compound record matched for 'naloxone'",
        retrievedAt: FETCHED,
      },
    },
  },

  naltrexone: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5360515',
      casNumber: '16590-41-3',
      unii: 'Z6375YW9SF',
      rxcui: '105069',
      source: {
        kind: 'PUBCHEM',
        identifier: '5360515',
        label: "PubChem compound record matched for 'naltrexone'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets)',
      bioavailability: {
        display: '5 to 40%',
        numeric: 22.5,
        unit: '%',
        populationContext:
          'oral administration; subject to significant first pass metabolism, as recorded in the label',
        source: fdaLabel(
          NALTREXONE_LABEL,
          'FDA label for naltrexone hydrochloride tablets (openFDA)',
          'clinical_pharmacology Pharmacokinetics',
          'Although well absorbed orally, naltrexone is subject to significant first pass metabolism with oral bioavailability estimates ranging from 5 to 40%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'within one hour',
        numeric: 1,
        unit: 'hours',
        populationContext: 'peak plasma levels of naltrexone and 6-β-naltrexol after oral dosing',
        source: fdaLabel(
          NALTREXONE_LABEL,
          'FDA label for naltrexone hydrochloride tablets (openFDA)',
          'clinical_pharmacology Absorption',
          'Following oral administration, naltrexone undergoes rapid and nearly complete absorption with approximately 96% of the dose absorbed from the gastrointestinal tract. Peak plasma levels of both naltrexone and 6-β-naltrexol occur within one hour of dosing.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '4 hours',
        numeric: 4,
        unit: 'hours',
        populationContext:
          'mean elimination half-life of parent naltrexone (its 6-β-naltrexol metabolite: 13 hours), as recorded in the label',
        source: fdaLabel(
          NALTREXONE_LABEL,
          'FDA label for naltrexone hydrochloride tablets (openFDA)',
          'clinical_pharmacology Pharmacokinetics',
          'The mean elimination half-life (T 1/2 ) values for naltrexone and 6-β-naltrexol are 4 hours and 13 hours, respectively.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '21%',
        numeric: 21,
        unit: '%',
        populationContext: 'in vitro tests with human plasma over the therapeutic dose range',
        source: fdaLabel(
          NALTREXONE_LABEL,
          'FDA label for naltrexone hydrochloride tablets (openFDA)',
          'clinical_pharmacology Distribution',
          'In vitro tests with human plasma show naltrexone to be 21% bound to plasma proteins over the therapeutic dose range.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '1350 liters',
        numeric: 1350,
        unit: 'L',
        populationContext:
          'estimated following intravenous administration, as recorded in the label',
        source: fdaLabel(
          NALTREXONE_LABEL,
          'FDA label for naltrexone hydrochloride tablets (openFDA)',
          'clinical_pharmacology Distribution',
          'The volume of distribution for naltrexone following intravenous administration is estimated to be 1350 liters.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Highly extracted drug with significant first pass metabolism; the major metabolite is 6-β-naltrexol',
        populationContext: 'human pharmacokinetic data, as recorded in the label',
        source: fdaLabel(
          NALTREXONE_LABEL,
          'FDA label for naltrexone hydrochloride tablets (openFDA)',
          'clinical_pharmacology Metabolism',
          'This suggests both that naltrexone is a highly extracted drug (>98% metabolized) and that extrahepatic sites of drug metabolism exist. The major metabolite of naltrexone is 6-β-naltrexol.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Parent drug and metabolites are excreted primarily by the kidney; urinary excretion of unchanged naltrexone is a small fraction of an oral dose',
        populationContext: 'human pharmacokinetic data, as recorded in the label',
        source: fdaLabel(
          NALTREXONE_LABEL,
          'FDA label for naltrexone hydrochloride tablets (openFDA)',
          'clinical_pharmacology Pharmacokinetics',
          'Both parent drug and metabolites are excreted primarily by the kidney (53% to 79% of the dose), however, urinary excretion of unchanged naltrexone accounts for less than 2% of an oral dose and fecal excretion is a minor elimination pathway.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(4),
    },
    productVariants: [
      {
        brandName: 'Naltrexone Hydrochloride',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: '50 mg',
        approvedUseAsRecorded:
          'Treatment of alcohol dependence and blockade of the effects of exogenously administered opioids',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2023-12-15',
        source: fdaLabel(
          NALTREXONE_LABEL,
          'FDA label for naltrexone hydrochloride tablets (openFDA)',
          'indications_and_usage; how_supplied',
          'Naltrexone hydrochloride tablets USP 50 mg is indicated in the treatment of alcohol dependence and for the blockade of the effects of exogenously administered opioids.',
        ),
      },
    ],
  },

  omeprazole: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '4594',
      casNumber: '73590-58-6',
      unii: 'KG60484QX9',
      rxcui: '283742',
      source: {
        kind: 'PUBCHEM',
        identifier: '4594',
        label: "PubChem compound record matched for 'omeprazole'",
        retrievedAt: FETCHED,
      },
    },
  },

  ondansetron: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '4595',
      casNumber: '99614-02-5',
      unii: 'NMH84OZK2B',
      rxcui: '203148',
      source: {
        kind: 'PUBCHEM',
        identifier: '4595',
        label: "PubChem compound record matched for 'ondansetron'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets)',
      bioavailability: {
        display: 'approximately 56%',
        numeric: 56,
        unit: '%',
        populationContext: 'healthy subjects, single 8 mg tablet',
        source: fdaLabel(
          ONDANSETRON_LABEL,
          'FDA label for ondansetron hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Mean bioavailability in healthy subjects, following administration of a single 8 mg tablet, is approximately 56%.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '5.7 hours',
        numeric: 5.7,
        unit: 'hours',
        populationContext: 'healthy subjects, as recorded beside the hepatic-impairment comparison',
        source: fdaLabel(
          ONDANSETRON_LABEL,
          'FDA label for ondansetron hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Hepatic Impairment',
          'In patients with mild-to-moderate hepatic impairment, clearance is reduced 2-fold and mean half-life is increased to 11.6 hours compared with 5.7 hours in healthy subjects.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '70% to 76%',
        numeric: 73,
        unit: '%',
        populationContext: 'measured in vitro over the concentration range 10 to 500 ng/mL',
        source: fdaLabel(
          ONDANSETRON_LABEL,
          'FDA label for ondansetron hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Plasma protein binding of ondansetron as measured in vitro was 70% to 76% over the concentration range of 10 to 500 ng/mL.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized; substrate for CYP1A2, CYP2D6, and CYP3A4, with CYP3A4 playing the predominant role',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          ONDANSETRON_LABEL,
          'FDA label for ondansetron hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism and Excretion',
          'In vitro metabolism studies have shown that ondansetron is a substrate for human hepatic cytochrome P-450 enzymes, including CYP1A2, CYP2D6, and CYP3A4. In terms of overall ondansetron turnover, CYP3A4 played the predominant role.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Extensively metabolized in humans; a small share of a radiolabeled dose is recovered as the parent compound from the urine',
        populationContext: 'radiolabeled dose study, as recorded in the label',
        source: fdaLabel(
          ONDANSETRON_LABEL,
          'FDA label for ondansetron hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism and Excretion',
          'Ondansetron is extensively metabolized in humans, with approximately 5% of a radiolabeled dose recovered as the parent compound from the urine. The metabolites are observed in the urine.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(5.7),
    },
    productVariants: [
      {
        brandName: 'ondansetron hydrochloride',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: 'Tablets: 4 mg, 8 mg, 16 mg and 24 mg',
        approvedUseAsRecorded:
          'Prevention of nausea and vomiting associated with highly emetogenic cancer chemotherapy, moderately emetogenic cancer chemotherapy, and radiotherapy; prevention of postoperative nausea and/or vomiting',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-04-24',
        source: fdaLabel(
          ONDANSETRON_LABEL,
          'FDA label for ondansetron hydrochloride tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Ondansetron tablets are 5-HT 3 receptor antagonist indicated for the prevention of: nausea and vomiting associated with highly emetogenic cancer chemotherapy, including cisplatin greater than or equal to 50 mg/m 2 (1) nausea and vomiting associated with initial and repeat courses of moderately emetogenic cancer chemotherapy (1)',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'intestines',
        actionAsRecorded:
          'Cytotoxic chemotherapy appears to be associated with release of serotonin from the enterochromaffin cells of the small intestine; the released serotonin may stimulate vagal afferents through 5-HT3 receptors',
        source: fdaLabel(
          ONDANSETRON_LABEL,
          'FDA label for ondansetron hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'However, cytotoxic chemotherapy appears to be associated with release of serotonin from the enterochromaffin cells of the small intestine. In humans, urinary 5-hydroxyindoleacetic acid (5-HIAA) excretion increases after cisplatin administration in parallel with the onset of emesis.',
        ),
      },
      {
        regionCode: 'brainstem',
        actionAsRecorded:
          'Serotonin receptors of the 5-HT3 type are present centrally in the chemoreceptor trigger zone of the area postrema',
        source: fdaLabel(
          ONDANSETRON_LABEL,
          'FDA label for ondansetron hydrochloride tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Serotonin receptors of the 5-HT 3 type are present both peripherally on vagal nerve terminals and centrally in the chemoreceptor trigger zone of the area postrema.',
        ),
      },
    ],
  },

  prednisone: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5865',
      casNumber: '53-03-2',
      unii: 'VB0R961HZT',
      rxcui: '8640',
      source: {
        kind: 'PUBCHEM',
        identifier: '5865',
        label: "PubChem compound record matched for 'prednisone'",
        retrievedAt: FETCHED,
      },
    },
    anatomyTargets: [
      {
        regionCode: 'adrenal',
        actionAsRecorded:
          'Pharmacologic corticosteroid dosing interacts with hypothalamic-pituitary-adrenal (HPA) activity; the label discusses dosing regimens intended to minimize pituitary-adrenal suppression',
        source: fdaLabel(
          PREDNISONE_LABEL,
          'FDA label for prednisone tablets (openFDA)',
          'dosage_and_administration, Alternate Day Therapy discussion',
          'administration of the corticosteroid every other morning allows for re-establishment of more nearly normal hypothalamic-pituitary-adrenal (HPA) activity on the off-steroid day.',
        ),
      },
    ],
  },

  pregabalin: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5486971',
      casNumber: '148553-50-8',
      unii: '55JG375S6M',
      rxcui: '187832',
      source: {
        kind: 'PUBCHEM',
        identifier: '5486971',
        label: "PubChem compound record matched for 'pregabalin'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (capsules), with or without food',
      bioavailability: {
        display: 'greater than or equal to 90%',
        numeric: 90,
        unit: '%',
        populationContext: 'oral administration; independent of dose, as recorded in the label',
        source: fdaLabel(
          PREGABALIN_LABEL,
          'FDA label for pregabalin capsules (openFDA)',
          'clinical_pharmacology 12.3 Absorption and Distribution',
          'Pregabalin oral bioavailability is greater than or equal to 90% and is independent of dose.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'within 1.5 hours',
        numeric: 1.5,
        unit: 'hours',
        populationContext: 'oral administration under fasting conditions',
        source: fdaLabel(
          PREGABALIN_LABEL,
          'FDA label for pregabalin capsules (openFDA)',
          'clinical_pharmacology 12.3 Absorption and Distribution',
          'Following oral administration of pregabalin capsules under fasting conditions, peak plasma concentrations occur within 1.5 hours.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '6.3 hours',
        numeric: 6.3,
        unit: 'hours',
        populationContext: 'subjects with normal renal function, mean elimination half-life',
        source: fdaLabel(
          PREGABALIN_LABEL,
          'FDA label for pregabalin capsules (openFDA)',
          'clinical_pharmacology 12.3 Metabolism and Elimination',
          'Pregabalin is eliminated from the systemic circulation primarily by renal excretion as unchanged drug with a mean elimination half-life of 6.3 hours in subjects with normal renal function.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'does not bind to plasma proteins',
        populationContext: 'human plasma, as recorded in the label',
        source: fdaLabel(
          PREGABALIN_LABEL,
          'FDA label for pregabalin capsules (openFDA)',
          'clinical_pharmacology 12.3 Absorption and Distribution',
          'Pregabalin does not bind to plasma proteins. The apparent volume of distribution of pregabalin following oral administration is approximately 0.5 L/kg.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 0.5 L/kg',
        numeric: 0.5,
        unit: 'L/kg',
        populationContext: 'apparent volume of distribution following oral administration',
        source: fdaLabel(
          PREGABALIN_LABEL,
          'FDA label for pregabalin capsules (openFDA)',
          'clinical_pharmacology 12.3 Absorption and Distribution',
          'Pregabalin does not bind to plasma proteins. The apparent volume of distribution of pregabalin following oral administration is approximately 0.5 L/kg.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display: 'Undergoes negligible metabolism in humans',
        populationContext: 'radiolabeled dose study in humans, as recorded in the label',
        source: fdaLabel(
          PREGABALIN_LABEL,
          'FDA label for pregabalin capsules (openFDA)',
          'clinical_pharmacology 12.3 Metabolism and Elimination',
          'Pregabalin undergoes negligible metabolism in humans. Following a dose of radiolabeled pregabalin, approximately 90% of the administered dose was recovered in the urine as unchanged pregabalin.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: 'Eliminated primarily by renal excretion as unchanged drug',
        populationContext: 'subjects with normal renal function, as recorded in the label',
        source: fdaLabel(
          PREGABALIN_LABEL,
          'FDA label for pregabalin capsules (openFDA)',
          'clinical_pharmacology 12.3 Metabolism and Elimination',
          'Pregabalin is eliminated from the systemic circulation primarily by renal excretion as unchanged drug with a mean elimination half-life of 6.3 hours in subjects with normal renal function.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(6.3),
    },
    productVariants: [
      {
        brandName: 'PREGABALIN',
        formAsRecorded: 'Capsules',
        strengthsAsRecorded: '25 mg, 50 mg, 75 mg, 100 mg, 150 mg, 200 mg, 225 mg, and 300 mg',
        approvedUseAsRecorded:
          'Management of neuropathic pain associated with diabetic peripheral neuropathy; management of postherpetic neuralgia; adjunctive therapy for the treatment of partial-onset seizures in patients 1 month of age and older; management of fibromyalgia; management of neuropathic pain associated with spinal cord injury',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-09-23',
        source: fdaLabel(
          PREGABALIN_LABEL,
          'FDA label for pregabalin capsules (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Pregabalin capsules are indicated for: Management of neuropathic pain associated with diabetic peripheral neuropathy Management of postherpetic neuralgia Adjunctive therapy for the treatment of partial-onset seizures in patients 1 month of age and older Management of fibromyalgia Management of neuropathic pain associated with spinal cord injury',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'Binds with high affinity to the alpha2-delta site, an auxiliary subunit of voltage-gated calcium channels, in central nervous system tissues',
        source: fdaLabel(
          PREGABALIN_LABEL,
          'FDA label for pregabalin capsules (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Pregabalin binds with high affinity to the alpha 2 -delta site (an auxiliary subunit of voltage-gated calcium channels) in central nervous system tissues.',
        ),
      },
    ],
  },

  rivaroxaban: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '9875401',
      casNumber: '366789-02-8',
      unii: '9NDF7JZ4M3',
      rxcui: '1114195',
      source: {
        kind: 'PUBCHEM',
        identifier: '9875401',
        label: "PubChem compound record matched for 'rivaroxaban'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets; granules for oral suspension)',
      bioavailability: {
        display: '80% to 100%',
        numeric: 90,
        unit: '%',
        populationContext:
          '2.5 mg and 10 mg dose (dose-dependent; the 20 mg dose fasted is approximately 66%)',
        source: fdaLabel(
          RIVAROXABAN_LABEL,
          'FDA label for XARELTO (rivaroxaban) (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'The absolute bioavailability of rivaroxaban is dose-dependent. For the 2.5 mg and 10 mg dose, it is estimated to be 80% to 100% and is not affected by food. XARELTO 20 mg administered in the fasted state has an absolute bioavailability of approximately 66%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '2 to 4 hours',
        numeric: 3,
        unit: 'hours',
        populationContext: 'after tablet intake, as recorded in the label',
        source: fdaLabel(
          RIVAROXABAN_LABEL,
          'FDA label for XARELTO (rivaroxaban) (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'The maximum concentrations (C max ) of rivaroxaban appear 2 to 4 hours after tablet intake.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '5 to 9 hours',
        numeric: 7,
        unit: 'hours',
        populationContext: 'healthy subjects aged 20 to 45 years',
        source: fdaLabel(
          RIVAROXABAN_LABEL,
          'FDA label for XARELTO (rivaroxaban) (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'The terminal elimination half-life of rivaroxaban is 5 to 9 hours in healthy subjects aged 20 to 45 years.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 92% to 95%',
        numeric: 93.5,
        unit: '%',
        populationContext: 'human plasma, with albumin the main binding component',
        source: fdaLabel(
          RIVAROXABAN_LABEL,
          'FDA label for XARELTO (rivaroxaban) (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Protein binding of rivaroxaban in human plasma is approximately 92% to 95%, with albumin being the main binding component.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 50 L',
        numeric: 50,
        unit: 'L',
        populationContext: 'steady-state volume of distribution in healthy subjects',
        source: fdaLabel(
          RIVAROXABAN_LABEL,
          'FDA label for XARELTO (rivaroxaban) (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The steady-state volume of distribution in healthy subjects is approximately 50 L.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Oxidative degradation catalyzed by CYP3A4/5 and CYP2J2 and hydrolysis are the major sites of biotransformation',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          RIVAROXABAN_LABEL,
          'FDA label for XARELTO (rivaroxaban) (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Oxidative degradation catalyzed by CYP3A4/5 and CYP2J2 and hydrolysis are the major sites of biotransformation. Unchanged rivaroxaban was the predominant moiety in plasma with no major or active circulating metabolites.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'About half of an orally administered radiolabeled dose was recovered as inactive metabolites, split between urine and feces',
        populationContext: 'radiolabeled dose study, as recorded in the label',
        source: fdaLabel(
          RIVAROXABAN_LABEL,
          'FDA label for XARELTO (rivaroxaban) (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Approximately 51% of an orally administered [ 14 C]-rivaroxaban dose was recovered as inactive metabolites in urine (30%) and feces (21%).',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(7),
    },
    productVariants: [
      {
        brandName: 'Xarelto',
        formAsRecorded: 'Film-coated tablets; granules for oral suspension',
        strengthsAsRecorded:
          'Tablets: 2.5 mg, 10 mg, 15 mg, and 20 mg; for oral suspension: 1 mg/mL once reconstituted',
        approvedUseAsRecorded:
          'Factor Xa inhibitor indicated to reduce risk of stroke and systemic embolism in nonvalvular atrial fibrillation; for treatment of deep vein thrombosis (DVT) and pulmonary embolism (PE); for reduction in the risk of recurrence of DVT or PE; for prophylaxis of DVT after knee or hip replacement surgery; and further recorded indications',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-01-16',
        source: fdaLabel(
          RIVAROXABAN_LABEL,
          'FDA label for XARELTO (rivaroxaban) (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'XARELTO is a factor Xa inhibitor indicated: to reduce risk of stroke and systemic embolism in nonvalvular atrial fibrillation ( 1.1 ) for treatment of deep vein thrombosis (DVT) ( 1.2 ) for treatment of pulmonary embolism (PE) ( 1.3 ) for reduction in the risk of recurrence of DVT or PE ( 1.4 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'blood-vessels',
        actionAsRecorded:
          'Selective inhibitor of factor Xa; by inhibiting FXa, rivaroxaban decreases thrombin generation in the clotting cascade',
        source: fdaLabel(
          RIVAROXABAN_LABEL,
          'FDA label for XARELTO (rivaroxaban) (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'XARELTO is a selective inhibitor of FXa. It does not require a cofactor (such as Anti-thrombin III) for activity. Rivaroxaban inhibits free FXa and prothrombinase activity. Rivaroxaban has no direct effect on platelet aggregation, but indirectly inhibits platelet aggregation induced by thrombin. By inhibiting FXa, rivaroxaban decreases thrombin generation.',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT00403767',
      includedAsRecorded: [
        'Patients must have documented atrial fibrillation on 2 separate occasions within 6 months before screening',
        'History of a prior stroke, transient ischemic attack or non-neurologic systemic embolism believed to be cardiac in origin, or at least two of the following risk factors: heart failure, hypertension, age 75 years or greater, diabetes mellitus',
      ],
      excludedAsRecorded: [
        'Significant mitral stenosis',
        'Transient atrial fibrillation caused by a reversible disorder',
        'Active internal bleeding',
        'Severe disabling stroke',
        'History of intracranial bleeding',
        'Hemorrhagic disorders',
      ],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT00403767',
        label: 'ClinicalTrials.gov record for the ROCKET AF trial (rivaroxaban versus warfarin)',
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: FETCHED,
        excerpt:
          'Patients must have documented atrial fibrillation on 2 separate occasions within 6 months before screening * History of a prior stroke, transient ischemic attack or non-neurologic systemic embolism believed to be cardiac in origin, or at least two of the following risk factors: heart failure, hypertension, age 75 years or greater, diabetes mellitus',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT00403767',
        endpointAsRecorded:
          'The Composite Event of Stroke/Non-CNS Systemic Embolism: Primary Efficacy (Non-Inferiority)',
        activeResultAsRecorded: 'Rivaroxaban: 188 patients with an event',
        comparatorResultAsRecorded: 'Warfarin: 241 patients with an event',
        differenceAsRecorded: 'Hazard ratio 0.79',
        uncertaintyAsRecorded: '95% CI 0.66 to 0.96; p<0.001 (Cox proportional hazards model)',
        timepointAsRecorded: 'Up to 4 years',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT00403767',
          label: 'ClinicalTrials.gov posted results for the ROCKET AF trial',
          locator: 'resultsSection.outcomeMeasuresModule, primary outcome',
          retrievedAt: FETCHED,
          excerpt:
            '"title": "The Composite Event of Stroke/Non-CNS Systemic Embolism: Primary Efficacy (Non-Inferiority)" "timeFrame": "Up to 4 years" Rivaroxaban {"value": "188"} Warfarin {"value": "241"} "paramType": "Hazard Ratio (HR)", "paramValue": "0.79", "ciPctValue": "95", "ciLowerLimit": "0.66", "ciUpperLimit": "0.96", "pValue": "<0.001", "statisticalMethod": "Cox Proportional Hazards model"',
        },
      },
    ],
  },

  rosuvastatin: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '446157',
      casNumber: '287714-41-4',
      unii: '83MVU38M7Q',
      rxcui: '301542',
      source: {
        kind: 'PUBCHEM',
        identifier: '446157',
        label: "PubChem compound record matched for 'rosuvastatin'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets), with or without food',
      bioavailability: {
        display: 'approximately 20%',
        numeric: 20,
        unit: '%',
        populationContext: 'absolute bioavailability in clinical pharmacology studies in man',
        source: fdaLabel(
          ROSUVASTATIN_LABEL,
          'FDA label for rosuvastatin calcium tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'The absolute bioavailability of rosuvastatin is approximately 20%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '3 to 5 hours',
        numeric: 4,
        unit: 'hours',
        populationContext: 'clinical pharmacology studies in man, following oral dosing',
        source: fdaLabel(
          ROSUVASTATIN_LABEL,
          'FDA label for rosuvastatin calcium tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'In clinical pharmacology studies in man, peak plasma concentrations of rosuvastatin were reached 3 to 5 hours following oral dosing.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 19 hours',
        numeric: 19,
        unit: 'hours',
        populationContext: 'elimination half-life, as recorded in the label',
        source: fdaLabel(
          ROSUVASTATIN_LABEL,
          'FDA label for rosuvastatin calcium tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'The elimination half-life of rosuvastatin is approximately 19 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '88%',
        numeric: 88,
        unit: '%',
        populationContext: 'binding to plasma proteins, mostly albumin, as recorded in the label',
        source: fdaLabel(
          ROSUVASTATIN_LABEL,
          'FDA label for rosuvastatin calcium tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Rosuvastatin is 88% bound to plasma proteins, mostly albumin. This binding is reversible and independent of plasma concentrations.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 134 liters',
        numeric: 134,
        unit: 'L',
        populationContext: 'mean volume of distribution at steady state',
        source: fdaLabel(
          ROSUVASTATIN_LABEL,
          'FDA label for rosuvastatin calcium tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Mean volume of distribution at steady-state of rosuvastatin is approximately 134 liters.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Not extensively metabolized; the major metabolite is N-desmethyl rosuvastatin, formed principally by cytochrome P450 2C9',
        populationContext: 'radiolabeled dose and in vitro data, as recorded in the label',
        source: fdaLabel(
          ROSUVASTATIN_LABEL,
          'FDA label for rosuvastatin calcium tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Rosuvastatin is not extensively metabolized; approximately 10% of a radiolabeled dose is recovered as metabolite. The major metabolite is N-desmethyl rosuvastatin, which is formed principally by cytochrome P450 \\ 2C9',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: 'Rosuvastatin and its metabolites are primarily excreted in the feces',
        populationContext: 'following oral administration, as recorded in the label',
        source: fdaLabel(
          ROSUVASTATIN_LABEL,
          'FDA label for rosuvastatin calcium tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Following oral administration, rosuvastatin and its metabolites are primarily excreted in the feces (90%).',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(19),
    },
    productVariants: [
      {
        brandName: 'Rosuvastatin Calcium',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: '5 mg, 10 mg, 20 mg, and 40 mg of rosuvastatin',
        approvedUseAsRecorded:
          'HMG Co-A reductase inhibitor (statin) indicated to reduce the risk of major adverse cardiovascular events in adults at increased risk; as an adjunct to diet to reduce LDL-C in adults with primary hyperlipidemia; and further recorded lipid indications',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-11-26',
        source: fdaLabel(
          ROSUVASTATIN_LABEL,
          'FDA label for rosuvastatin calcium tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Rosuvastatin tablets is an HMG Co-A reductase inhibitor (statin) indicated: ( 1 ) To reduce the risk of major adverse cardiovascular (CV) events (CV death, nonfatal myocardial infarction, nonfatal stroke, or an arterial revascularization procedure) in adults without established coronary heart disease who are at increased risk of CV disease',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'liver',
        actionAsRecorded:
          'Accelerates expression of LDL-receptors and uptake of LDL-C from blood to the liver; sustained inhibition of cholesterol synthesis in the liver',
        source: fdaLabel(
          ROSUVASTATIN_LABEL,
          'FDA label for rosuvastatin calcium tablets (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics',
          'Inhibition of HMG-CoA reductase by rosuvastatin accelerates the expression of LDL-receptors, followed by the uptake of LDL-C from blood to the liver, leading to a decrease in plasma LDL-C and total cholesterol. Sustained inhibition of cholesterol synthesis in the liver also decreases levels of very-low-density lipoproteins.',
        ),
      },
      {
        regionCode: 'blood-vessels',
        actionAsRecorded: 'Leads to a decrease in plasma LDL-C and total cholesterol',
        source: fdaLabel(
          ROSUVASTATIN_LABEL,
          'FDA label for rosuvastatin calcium tablets (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics',
          'Inhibition of HMG-CoA reductase by rosuvastatin accelerates the expression of LDL-receptors, followed by the uptake of LDL-C from blood to the liver, leading to a decrease in plasma LDL-C and total cholesterol.',
        ),
      },
    ],
  },

  semaglutide: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '56843331',
      casNumber: '910463-68-2',
      unii: '53AXN4NNHX',
      rxcui: '1991302',
      source: {
        kind: 'PUBCHEM',
        identifier: '56843331',
        label: "PubChem compound record matched for 'semaglutide'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded:
        'Oral tablets (RYBELSUS and OZEMPIC tablets), once daily on an empty stomach',
      bioavailability: {
        display: 'approximately 0.4% to 1%',
        numeric: 0.7,
        unit: '%',
        populationContext: 'after oral administration of 3 mg, 7 mg and 14 mg of RYBELSUS',
        source: fdaLabel(
          SEMAGLUTIDE_LABEL,
          'FDA label for RYBELSUS and OZEMPIC tablets (oral semaglutide) (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Semaglutide estimated absolute bioavailability was approximately: • 0.4% to 1% after oral administration of 3 mg, 7 mg and 14 mg of RYBELSUS.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'approximately 1 hour',
        numeric: 1,
        unit: 'hours',
        populationContext: 'after oral administration of semaglutide tablets',
        source: fdaLabel(
          SEMAGLUTIDE_LABEL,
          'FDA label for RYBELSUS and OZEMPIC tablets (oral semaglutide) (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Semaglutide maximum concentration was reached approximately 1-hour after oral administration of semaglutide tablets.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately one week',
        populationContext: 'patients with type 2 diabetes, elimination half-life',
        source: fdaLabel(
          SEMAGLUTIDE_LABEL,
          'FDA label for RYBELSUS and OZEMPIC tablets (oral semaglutide) (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'Semaglutide elimination half-life is approximately one week with an absolute clearance of approximately 0.04 L/hour in patients with type 2 diabetes. Semaglutide is present in the circulation for about five weeks after the last semaglutide tablet dose.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '>99%',
        numeric: 99,
        unit: '%',
        populationContext: 'binding to plasma albumin, as recorded in the label',
        source: fdaLabel(
          SEMAGLUTIDE_LABEL,
          'FDA label for RYBELSUS and OZEMPIC tablets (oral semaglutide) (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Semaglutide absolute volume of distribution is approximately 8 L in patients with type 2 diabetes. Semaglutide is >99% bound to plasma albumin.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 8 L',
        numeric: 8,
        unit: 'L',
        populationContext: 'absolute volume of distribution in patients with type 2 diabetes',
        source: fdaLabel(
          SEMAGLUTIDE_LABEL,
          'FDA label for RYBELSUS and OZEMPIC tablets (oral semaglutide) (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Semaglutide absolute volume of distribution is approximately 8 L in patients with type 2 diabetes. Semaglutide is >99% bound to plasma albumin.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolized by proteolytic cleavage of the peptide backbone and sequential beta-oxidation of the fatty acid side chain',
        populationContext: 'primary route of elimination, as recorded in the label',
        source: fdaLabel(
          SEMAGLUTIDE_LABEL,
          'FDA label for RYBELSUS and OZEMPIC tablets (oral semaglutide) (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'The primary route of elimination for semaglutide is metabolism following proteolytic cleavage of the peptide backbone and sequential beta-oxidation of the fatty acid side chain.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'The primary excretion routes of semaglutide-related material are via the urine and feces',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          SEMAGLUTIDE_LABEL,
          'FDA label for RYBELSUS and OZEMPIC tablets (oral semaglutide) (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'Excretion : The primary excretion routes of semaglutide-related material are via the urine and feces. Approximately 3% of the absorbed dose is excreted in the urine as intact semaglutide.',
        ),
        concordance: 'label_only',
      },
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Day 1 to 30',
          amountAsRecorded:
            '3 mg orally once daily for 30 days (this dosage is not effective for glycemic control)',
          purposeAsRecorded: 'Label-stated starting dosage (initiation phase) of RYBELSUS',
        },
        {
          order: 2,
          periodAsRecorded: 'Days 31 to 60',
          amountAsRecorded: 'Increase the dosage to 7 mg orally once daily',
          purposeAsRecorded: 'Label-stated escalation dosage of RYBELSUS',
        },
        {
          order: 3,
          periodAsRecorded: 'Day 61 or thereafter',
          amountAsRecorded:
            'Maintain the dosage at 7 mg orally once daily if no additional glycemic control is needed, or increase the dosage to 14 mg orally once daily if additional glycemic control is needed',
          purposeAsRecorded: 'Label-stated maintenance dosage of RYBELSUS',
        },
      ],
      source: fdaLabel(
        SEMAGLUTIDE_LABEL,
        'FDA label for RYBELSUS and OZEMPIC tablets (oral semaglutide) (openFDA)',
        'dosage_and_administration 2.2, RYBELSUS schedule',
        'Recommended starting dosage is 3 mg orally once daily for 30 days (this dosage is not effective for glycemic control) • Days 31 to 60: Increase the dosage to 7 mg orally once daily. • On Day 61 or thereafter, if: ( 2.2 ) o No additional glycemic control is needed, maintain the dosage at 7 mg orally once daily. o Additional glycemic control is needed, increase the dosage to 14 mg orally once daily.',
      ),
    },
    productVariants: [
      {
        brandName: 'RYBELSUS',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: '3 mg, 7 mg and 14 mg',
        approvedUseAsRecorded:
          'As an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus; to reduce the risk of major adverse cardiovascular events in adults with type 2 diabetes mellitus who are at high risk for these events',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-01-30',
        source: fdaLabel(
          SEMAGLUTIDE_LABEL,
          'FDA label for RYBELSUS and OZEMPIC tablets (oral semaglutide) (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'RYBELSUS and OZEMPIC tablets are indicated: • as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus. • to reduce the risk of major adverse cardiovascular (CV) events (CV death, non-fatal myocardial infarction or non-fatal stroke) in adults with type 2 diabetes mellitus who are at high risk for these events.',
        ),
      },
      {
        brandName: 'OZEMPIC',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: '1.5 mg, 4 mg and 9 mg',
        approvedUseAsRecorded:
          'As an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus; to reduce the risk of major adverse cardiovascular events in adults with type 2 diabetes mellitus who are at high risk for these events',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-01-30',
        source: fdaLabel(
          SEMAGLUTIDE_LABEL,
          'FDA label for RYBELSUS and OZEMPIC tablets (oral semaglutide) (openFDA)',
          'dosage_forms_and_strengths',
          'OZEMPIC (semaglutide) tablets are available as: • 1.5 mg: white to light yellow, round shaped debossed with “1.5” on one side and “novo” on the other side. • 4 mg: white to light yellow, round shaped debossed with “4” on one side and “novo” on the other side. • 9 mg: white to light yellow, round shaped debossed with “9” on one side and “novo” on the other side.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'stomach',
        actionAsRecorded:
          'The mechanism of blood glucose lowering also involves a minor delay in gastric emptying in the early postprandial phase',
        source: fdaLabel(
          SEMAGLUTIDE_LABEL,
          'FDA label for RYBELSUS and OZEMPIC tablets (oral semaglutide) (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Semaglutide reduces blood glucose through a mechanism where it stimulates insulin secretion and lowers glucagon secretion, both in a glucose-dependent manner. Thus, when blood glucose is high, insulin secretion is stimulated and glucagon secretion is inhibited. The mechanism of blood glucose lowering also involves a minor delay in gastric emptying in the early postprandial phase.',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT02906930',
      includedAsRecorded: [
        'Male or female, age above or equal to 18 years at the time of signing informed consent',
        'Diagnosed with type 2 diabetes mellitus for at least 30 days prior to day of screening',
        'HbA1c (glycosylated haemoglobin) between 7.0-9.5% (53-80 mmol/mol) (both inclusive)',
        'Treatment with diet and exercise for at least 30 days prior to day of screening',
      ],
      excludedAsRecorded: [
        'Family or personal history of multiple endocrine neoplasia type 2 or medullary thyroid carcinomas',
        'History of pancreatitis (acute or chronic)',
        'History of major surgical procedures involving the stomach potentially affecting absorption of trial product',
        'Any of the following: myocardial infarction, stroke or hospitalisation for unstable angina or transient ischaemic attack within the past 180 days prior to the day of screening and randomisation',
        'Renal impairment defined as estimated glomerular filtration rate below 60 mL/min/1.73 m^2 as per Chronic Kidney Disease Epidemiology Collaboration formula',
        'Treatment with any medication for the indication of diabetes or obesity in a period of 90 days before the day of screening',
      ],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT02906930',
        label:
          'ClinicalTrials.gov record for the oral semaglutide monotherapy trial (PIONEER programme, Trial 1 in the FDA label)',
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: FETCHED,
        excerpt:
          'Diagnosed with type 2 diabetes mellitus for at least 30 days prior to day of screening - HbA1c (glycosylated haemoglobin) between 7.0-9.5% (53-80 mmol/mol) (both inclusive) - Treatment with diet and exercise for at least 30 days prior to day of screening',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT02906930',
        endpointAsRecorded: 'Change in HbA1c from baseline (week 0) to week 26, in-trial period',
        activeResultAsRecorded:
          'Oral semaglutide 14 mg: mean change of -1.5 percentage points of HbA1c (standard deviation 1.0)',
        comparatorResultAsRecorded:
          'Placebo: mean change of -0.3 percentage points of HbA1c (standard deviation 1.2)',
        differenceAsRecorded: 'Mean treatment difference -1.1 percentage points versus placebo',
        uncertaintyAsRecorded: '95% CI -1.3 to -0.9; p<0.0001 (pattern mixture model)',
        timepointAsRecorded: 'Week 0 to week 26',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT02906930',
          label: 'ClinicalTrials.gov posted results for the oral semaglutide monotherapy trial',
          locator: 'resultsSection.outcomeMeasuresModule, primary outcome "Change in HbA1c"',
          retrievedAt: FETCHED,
          excerpt:
            '"title": "Change in HbA1c" "timeFrame": "Week 0, week 26" "Oral Semaglutide 14 mg" {"value": "-1.5", "spread": "1.0"} "Placebo" {"value": "-0.3", "spread": "1.2"} "paramType": "Mean treatment difference", "paramValue": "-1.1", "ciPctValue": "95", "ciLowerLimit": "-1.3", "ciUpperLimit": "-0.9", "pValue": "<0.0001", "statisticalMethod": "Pattern mixed model"',
        },
      },
    ],
  },

  sertraline: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '68617',
      casNumber: '79617-96-2',
      unii: 'UTI8907Y6X',
      rxcui: '155137',
      source: {
        kind: 'PUBCHEM',
        identifier: '68617',
        label: "PubChem compound record matched for 'sertraline'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets), once daily',
      tMax: {
        display: '4.5 to 8.4 hours',
        numeric: 6.45,
        unit: 'hours',
        populationContext: 'oral once-daily dosing over the range of 50 to 200 mg for 14 days',
        source: fdaLabel(
          SERTRALINE_LABEL,
          'FDA label for sertraline hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics, Systemic Bioavailability',
          'In man, following oral once-daily dosing over the range of 50 to 200 mg for 14 days, mean peak plasma concentrations (C max ) of sertraline occurred between 4.5 to 8.4 hours post-dosing.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 26 hours',
        numeric: 26,
        unit: 'hours',
        populationContext: 'average terminal elimination half-life of plasma sertraline',
        source: fdaLabel(
          SERTRALINE_LABEL,
          'FDA label for sertraline hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics, Systemic Bioavailability',
          'The average terminal elimination half-life of plasma sertraline is about 26 hours. Based on this pharmacokinetic parameter, steady-state sertraline plasma levels should be achieved after approximately one week of once-daily dosing.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '98%',
        numeric: 98,
        unit: '%',
        populationContext: 'in vitro studies with radiolabeled sertraline, 20 to 500 ng/mL range',
        source: fdaLabel(
          SERTRALINE_LABEL,
          'FDA label for sertraline hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics, Protein Binding',
          'In vitro protein binding studies performed with radiolabeled 3 H-sertraline showed that sertraline is highly bound to serum proteins (98%) in the range of 20 to 500 ng/mL.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensive first pass metabolism; the principal initial pathway is N-demethylation to N-desmethylsertraline',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          SERTRALINE_LABEL,
          'FDA label for sertraline hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics, Metabolism',
          'Sertraline undergoes extensive first pass metabolism. The principal initial pathway of metabolism for sertraline is N-demethylation. N-desmethylsertraline has a plasma terminal elimination half-life of 62 to 104 hours.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Radioactivity recovered in roughly equal parts in urine and feces; unchanged sertraline was not detectable in the urine',
        populationContext: 'radiolabeled sertraline study in two healthy male subjects',
        source: fdaLabel(
          SERTRALINE_LABEL,
          'FDA label for sertraline hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics, Metabolism',
          'About 40-45% of the administered radioactivity was recovered in urine in 9 days. Unchanged Sertraline was not detectable in the urine. For the same period, about 40-45% of the administered radioactivity was accounted for in feces, including 12-14% unchanged sertraline.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(26),
    },
    productVariants: [
      {
        brandName: 'Sertraline Hydrochloride',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: '25 mg, 50 mg and 100 mg of sertraline',
        approvedUseAsRecorded:
          'Treatment of major depressive disorder in adults; obsessions and compulsions in patients with obsessive-compulsive disorder; panic disorder in adults; posttraumatic stress disorder in adults; premenstrual dysphoric disorder in adults; social anxiety disorder in adults',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2019-11-01',
        source: fdaLabel(
          SERTRALINE_LABEL,
          'FDA label for sertraline hydrochloride tablets (openFDA)',
          'indications_and_usage; how_supplied',
          'Sertraline tablets, USP are available with each tablet containing sertraline hydrochloride, USP equivalent to 25 mg, 50 mg and 100 mg of sertraline.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'Mechanism of action presumed to be linked to inhibition of central nervous system neuronal uptake of serotonin',
        source: fdaLabel(
          SERTRALINE_LABEL,
          'FDA label for sertraline hydrochloride tablets (openFDA)',
          'clinical_pharmacology, Pharmacodynamics',
          'The mechanism of action of sertraline is presumed to be linked to its inhibition of CNS neuronal uptake of serotonin (5HT).',
        ),
      },
    ],
  },
}
