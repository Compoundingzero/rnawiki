import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import type { BackgroundSource } from '@/lib/background/types'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 9: ezetimibe, famotidine, fluconazole, glimepiride, glipizide, haloperidol,
 * hydrocortisone, hydroxyzine, indomethacin, insulin-aspart, insulin-lispro.
 *
 * Honest omissions in this batch:
 * - ezetimibe: the openFDA generic-name search returned an ezetimibe/simvastatin combination
 *   label ("EZETIMIBE AND SIMVASTATIN"), a different product from ezetimibe alone, so no
 *   label-derived module and no label UNII is recorded — PubChem/RxNorm identifiers only.
 * - haloperidol: the fetched label's clinical-pharmacology section states only that the precise
 *   mechanism of action has not been clearly established; no pharmacokinetic figures and no
 *   organ-naming mechanism text exist, so only registry identifiers and the tablet product
 *   record are recorded.
 * - hydrocortisone: the fetched label is an over-the-counter topical anti-itch product with only
 *   Uses/Directions sections and no strengths, pharmacokinetics or mechanism text — registry
 *   identifiers only.
 * - hydroxyzine: the fetched label is hydroxyzine pamoate capsules whose clinical-pharmacology
 *   section is qualitative (no bioavailability, half-life or binding figures), so no
 *   pharmacokinetics module is recorded; the label UNII is omitted because it identifies the
 *   pamoate salt rather than hydroxyzine itself.
 * - glimepiride: the fetched label states no elimination half-life for glimepiride, so halfLife
 *   and steadyStateNote are absent.
 * - insulin-aspart: the label states the half-life only as 81 minutes (no hour figure), so the
 *   half-life is recorded display-only and no steadyStateNote is derived; the label names no NCT
 *   number, so no applicability or pivotal-results module is recorded.
 * - famotidine, fluconazole, glimepiride, glipizide, indomethacin: the fetched labels cite no
 *   NCT identifiers for their clinical studies, so no applicability or pivotal-results module is
 *   recorded.
 * - costContext is omitted for every medicine in this batch.
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

const FAMOTIDINE_LABEL = '002875d2-8c30-2d2e-e063-6294a90ae01e'
const FLUCONAZOLE_LABEL = '01df20c4-7b94-044e-e063-6394a90a406a'
const GLIMEPIRIDE_LABEL = '0003458f-352a-46fa-9d99-230daa76ae29'
const GLIPIZIDE_LABEL = '00729e82-150a-464a-abe7-a3319721fbdb'
const HALOPERIDOL_LABEL = '00bb61c8-db35-4c04-9ef7-47d447d2496b'
const HYDROXYZINE_LABEL = '02616eee-a1a4-4afc-b84e-69fd28755138'
const INDOMETHACIN_LABEL = '009097a5-2c1e-4f5d-8054-896cf896cb3d'
const INSULIN_ASPART_LABEL = '13891e5a-e57a-46e8-911c-2f680352b52b'
const INSULIN_LISPRO_LABEL = '0691def8-4a7b-4de3-866f-a280989f47f1'

export const BACKGROUND_BATCH_9: RecordedBackgroundBySlug = {
  ezetimibe: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '150311',
      casNumber: '163222-33-1',
      rxcui: '341248',
      source: {
        kind: 'PUBCHEM',
        identifier: '150311',
        label: "PubChem compound record matched for 'ezetimibe'",
        retrievedAt: FETCHED,
      },
    },
  },

  famotidine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5702160',
      casNumber: '76824-35-6',
      unii: '5QZO15J2Z8',
      rxcui: '4278',
      source: {
        kind: 'PUBCHEM',
        identifier: '5702160',
        label: "PubChem compound record matched for 'famotidine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets), with or without food',
      bioavailability: {
        display: '40 to 45%',
        numeric: 42.5,
        unit: '%',
        populationContext: 'oral doses; incompletely absorbed, as recorded in the label',
        source: fdaLabel(
          FAMOTIDINE_LABEL,
          'FDA label for famotidine tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Famotidine is incompletely absorbed. The bioavailability of oral doses is 40 to 45%. Bioavailability may be slightly increased by food, or slightly decreased by antacids; however, these effects are of no clinical consequence.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '1 to 3 hours',
        numeric: 2,
        unit: 'hours',
        populationContext: 'peak famotidine plasma levels after oral dosing',
        source: fdaLabel(
          FAMOTIDINE_LABEL,
          'FDA label for famotidine tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Peak famotidine plasma levels occur in 1 to 3 hours. Plasma levels after multiple dosages are similar to those after single doses.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '2.5 to 3.5 hours',
        numeric: 3,
        unit: 'hours',
        populationContext: 'elimination half-life, as recorded in the label',
        source: fdaLabel(
          FAMOTIDINE_LABEL,
          'FDA label for famotidine tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Famotidine has an elimination half-life of 2.5 to 3.5 hours. Famotidine is eliminated by renal (65 to 70%) and metabolic (30 to 35%) routes.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'Fifteen to 20%',
        numeric: 17.5,
        unit: '%',
        populationContext: 'famotidine in plasma, as recorded in the label',
        source: fdaLabel(
          FAMOTIDINE_LABEL,
          'FDA label for famotidine tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Fifteen to 20% of famotidine in plasma is protein bound.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Undergoes minimal first-pass metabolism; the only metabolite identified in humans is the S-oxide',
        populationContext: 'human data, as recorded in the label',
        source: fdaLabel(
          FAMOTIDINE_LABEL,
          'FDA label for famotidine tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Famotidine undergoes minimal first-pass metabolism. Twenty-five to 30% of an oral dose was recovered in the urine as unchanged compound. The only metabolite identified in humans is the S-oxide.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Eliminated by renal (65 to 70%) and metabolic (30 to 35%) routes; renal clearance indicates some tubular excretion',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          FAMOTIDINE_LABEL,
          'FDA label for famotidine tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Famotidine is eliminated by renal (65 to 70%) and metabolic (30 to 35%) routes. Renal clearance is 250 to 450 mL/minute, indicating some tubular excretion.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(3),
    },
    productVariants: [
      {
        brandName: 'Famotidine',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: 'Tablets: 20 mg, 40 mg',
        approvedUseAsRecorded:
          'Histamine-2 (H2) receptor antagonist indicated in adult and pediatric patients 40 kg and greater for the treatment of active duodenal ulcer, active gastric ulcer, symptomatic nonerosive gastroesophageal reflux disease (GERD), and erosive esophagitis due to GERD diagnosed by biopsy; in adults for pathological hypersecretory conditions and reduction of the risk of duodenal ulcer recurrence',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-10-22',
        source: fdaLabel(
          FAMOTIDINE_LABEL,
          'FDA label for famotidine tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Famotidine tablets are a histamine-2 (H 2 ) receptor antagonist indicated ( 1 ): In adult and pediatric patients 40 kg and greater for the treatment of: • active duodenal ulcer (DU). • active gastric ulcer. • symptomatic nonerosive gastroesophageal reflux disease (GERD). • erosive esophagitis due to GERD, diagnosed by biopsy.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'stomach',
        actionAsRecorded:
          'Competitive inhibitor of histamine-2 (H2) receptors; the primary clinically important pharmacologic activity is inhibition of gastric secretion',
        source: fdaLabel(
          FAMOTIDINE_LABEL,
          'FDA label for famotidine tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Famotidine is a competitive inhibitor of histamine-2 (H 2 ) receptors. The primary clinically important pharmacologic activity of famotidine is inhibition of gastric secretion.',
        ),
      },
    ],
  },

  fluconazole: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '3365',
      casNumber: '86386-73-4',
      unii: '8VZV102JFY',
      rxcui: '4450',
      source: {
        kind: 'PUBCHEM',
        identifier: '3365',
        label: "PubChem compound record matched for 'fluconazole'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets), with or without food',
      bioavailability: {
        display: 'over 90%',
        numeric: 90,
        unit: '%',
        populationContext:
          'normal volunteers, oral administration compared with intravenous administration',
        source: fdaLabel(
          FLUCONAZOLE_LABEL,
          'FDA label for fluconazole tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics and Metabolism',
          'In normal volunteers, the bioavailability of orally administered fluconazole is over 90% compared with intravenous administration.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'between 1 and 2 hours',
        numeric: 1.5,
        unit: 'hours',
        populationContext: 'fasted normal volunteers, after oral administration',
        source: fdaLabel(
          FLUCONAZOLE_LABEL,
          'FDA label for fluconazole tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics and Metabolism',
          'Peak plasma concentrations (C max ) in fasted normal volunteers occur between 1 and 2 hours with a terminal plasma elimination half-life of approximately 30 hours (range: 20 to 50 hours) after oral administration.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 30 hours (range: 20 to 50 hours)',
        numeric: 30,
        unit: 'hours',
        populationContext:
          'fasted normal volunteers, terminal plasma elimination half-life after oral administration',
        source: fdaLabel(
          FLUCONAZOLE_LABEL,
          'FDA label for fluconazole tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics and Metabolism',
          'Peak plasma concentrations (C max ) in fasted normal volunteers occur between 1 and 2 hours with a terminal plasma elimination half-life of approximately 30 hours (range: 20 to 50 hours) after oral administration.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'low (11 to 12%)',
        numeric: 11.5,
        unit: '%',
        populationContext: 'plasma protein binding, as recorded in the label',
        source: fdaLabel(
          FLUCONAZOLE_LABEL,
          'FDA label for fluconazole tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics and Metabolism',
          'The apparent volume of distribution of fluconazole approximates that of total body water. Plasma protein binding is low (11 to 12%).',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximates that of total body water',
        populationContext: 'apparent volume of distribution, as recorded in the label',
        source: fdaLabel(
          FLUCONAZOLE_LABEL,
          'FDA label for fluconazole tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics and Metabolism',
          'The apparent volume of distribution of fluconazole approximates that of total body water. Plasma protein binding is low (11 to 12%).',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Cleared primarily by renal excretion; approximately 80% of the administered dose appears in the urine as unchanged drug',
        populationContext: 'normal volunteers, as recorded in the label',
        source: fdaLabel(
          FLUCONAZOLE_LABEL,
          'FDA label for fluconazole tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics and Metabolism',
          'In normal volunteers, fluconazole is cleared primarily by renal excretion, with approximately 80% of the administered dose appearing in the urine as unchanged drug. About 11% of the dose is excreted in the urine as metabolites.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(30),
    },
    productVariants: [
      {
        brandName: 'Fluconazole',
        formAsRecorded: 'Uncoated tablets',
        strengthsAsRecorded: '150 mg (unit dose package of 1)',
        approvedUseAsRecorded:
          'Treatment of vaginal candidiasis, oropharyngeal and esophageal candidiasis, and cryptococcal meningitis; also indicated to decrease the incidence of candidiasis in patients undergoing bone marrow transplantation who receive cytotoxic chemotherapy and/or radiation therapy',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-11-17',
        source: fdaLabel(
          FLUCONAZOLE_LABEL,
          'FDA label for fluconazole tablets (openFDA)',
          'indications_and_usage; how_supplied',
          'Fluconazole Tablets USP, 150 mg are pink mottled, biconvex, capsule shaped uncoated tablets with “C” debossed on one side and “10” debossed on other side. Unit dose package of 1',
        ),
      },
    ],
  },

  glimepiride: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '3476',
      casNumber: '93479-97-1',
      unii: '6KY687524K',
      rxcui: '25789',
      source: {
        kind: 'PUBCHEM',
        identifier: '3476',
        label: "PubChem compound record matched for 'glimepiride'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded:
        'Oral (tablets), administered with breakfast or the first main meal of the day',
      tMax: {
        display: '2 to 3 hours',
        numeric: 2.5,
        unit: 'hours',
        populationContext:
          'single oral doses in healthy subjects and multiple oral doses in patients with type 2 diabetes',
        source: fdaLabel(
          GLIMEPIRIDE_LABEL,
          'FDA label for glimepiride tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Studies with single oral doses of glimepiride in healthy subjects and with multiple oral doses in patients with type 2 diabetes showed peak drug concentrations (C max ) 2 to 3 hours postdose.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'greater than 99.5%',
        numeric: 99.5,
        unit: '%',
        populationContext: 'after intravenous dosing in healthy subjects',
        source: fdaLabel(
          GLIMEPIRIDE_LABEL,
          'FDA label for glimepiride tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'After intravenous dosing in healthy subjects, the volume of distribution (Vd) was 8.8 L (113 mL/kg), and the total body clearance (CL) was 47.8 mL/min. Protein binding was greater than 99.5%.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '8.8 L (113 mL/kg)',
        numeric: 8.8,
        unit: 'L',
        populationContext: 'after intravenous dosing in healthy subjects',
        source: fdaLabel(
          GLIMEPIRIDE_LABEL,
          'FDA label for glimepiride tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'After intravenous dosing in healthy subjects, the volume of distribution (Vd) was 8.8 L (113 mL/kg), and the total body clearance (CL) was 47.8 mL/min. Protein binding was greater than 99.5%.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Completely metabolized by oxidative biotransformation; the major metabolites are the cyclohexyl hydroxy methyl derivative (M1) and the carboxyl derivative (M2), with cytochrome P450 2C9 involved',
        populationContext: 'after either an intravenous or oral dose, as recorded in the label',
        source: fdaLabel(
          GLIMEPIRIDE_LABEL,
          'FDA label for glimepiride tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Glimepiride is completely metabolized by oxidative biotransformation after either an intravenous or oral dose. The major metabolites are the cyclohexyl hydroxy methyl derivative (M1) and the carboxyl derivative (M2). Cytochrome P450 2C9 is involved in the biotransformation of glimepiride to M1.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Metabolites recovered in both urine and feces; no parent drug was recovered from urine or feces',
        populationContext: 'radiolabeled oral dose study in 3 healthy male subjects',
        source: fdaLabel(
          GLIMEPIRIDE_LABEL,
          'FDA label for glimepiride tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Approximately 40% of the total radioactivity was recovered in feces. M1 and M2 accounted for about 70% (ratio of M1 to M2 was 1:3) of the radioactivity recovered in feces. No parent drug was recovered from urine or feces.',
        ),
        concordance: 'label_only',
      },
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Starting dose',
          amountAsRecorded: '1 or 2 mg once daily',
          purposeAsRecorded:
            'Label-stated recommended starting dose, administered with breakfast or first meal of the day',
        },
        {
          order: 2,
          periodAsRecorded: 'No more frequently than every 1 to 2 weeks',
          amountAsRecorded: 'Increase in 1 or 2 mg increments based on glycemic response',
          purposeAsRecorded: 'Label-stated uptitration',
        },
        {
          order: 3,
          periodAsRecorded: 'Maximum',
          amountAsRecorded: '8 mg once daily',
          purposeAsRecorded: 'Label-stated maximum recommended dose',
        },
      ],
      source: fdaLabel(
        GLIMEPIRIDE_LABEL,
        'FDA label for glimepiride tablets (openFDA)',
        'dosage_and_administration 2.1 Recommended Dosing',
        'Recommended starting dose is 1 or 2 mg once daily. Increase in 1 or 2 mg increments no more frequently than every 1 to 2 weeks based on glycemic response. Maximum recommended dose is 8 mg once daily ( 2.1 ). Administer with breakfast or first meal of the day ( 2.1 ).',
      ),
    },
    productVariants: [
      {
        brandName: 'Glimepiride',
        formAsRecorded: 'Tablets (scored)',
        strengthsAsRecorded: '1 mg, 2 mg, 4 mg',
        approvedUseAsRecorded:
          'Sulfonylurea indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-11-13',
        source: fdaLabel(
          GLIMEPIRIDE_LABEL,
          'FDA label for glimepiride tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Glimepiride tablets are a sulfonylurea indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus ( 1 ). Limitations of Use: Not for treating type 1 diabetes mellitus or diabetic ketoacidosis ( 1 ).',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'pancreas',
        actionAsRecorded:
          'Primarily lowers blood glucose by stimulating the release of insulin from pancreatic beta cells',
        source: fdaLabel(
          GLIMEPIRIDE_LABEL,
          'FDA label for glimepiride tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Glimepiride primarily lowers blood glucose by stimulating the release of insulin from pancreatic beta cells. Sulfonylureas bind to the sulfonylurea receptor in the pancreatic beta-cell plasma membrane, leading to closure of the ATP-sensitive potassium channel, thereby stimulating the release of insulin.',
        ),
      },
    ],
  },

  glipizide: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '3478',
      casNumber: '29094-61-9',
      unii: 'X7WDT95N5C',
      rxcui: '4821',
      source: {
        kind: 'PUBCHEM',
        identifier: '3478',
        label: "PubChem compound record matched for 'glipizide'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      bioavailability: {
        display: 'uniform, rapid, and essentially complete gastrointestinal absorption',
        populationContext: 'gastrointestinal absorption in man, as recorded in the label',
        source: fdaLabel(
          GLIPIZIDE_LABEL,
          'FDA label for glipizide tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'Gastrointestinal absorption of glipizide in man is uniform, rapid, and essentially complete. Peak plasma concentrations occur 1 to 3 hours after a single oral dose.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '1 to 3 hours',
        numeric: 2,
        unit: 'hours',
        populationContext: 'after a single oral dose, as recorded in the label',
        source: fdaLabel(
          GLIPIZIDE_LABEL,
          'FDA label for glipizide tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'Gastrointestinal absorption of glipizide in man is uniform, rapid, and essentially complete. Peak plasma concentrations occur 1 to 3 hours after a single oral dose.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '2 to 4 hours',
        numeric: 3,
        unit: 'hours',
        populationContext: 'normal subjects, whether given intravenously or orally',
        source: fdaLabel(
          GLIPIZIDE_LABEL,
          'FDA label for glipizide tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'The half-life of elimination ranges from 2 to 4 hours in normal subjects, whether given intravenously or orally.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '98 to 99%',
        numeric: 98.5,
        unit: '%',
        populationContext:
          'serum from volunteers, one hour after oral or intravenous administration',
        source: fdaLabel(
          GLIPIZIDE_LABEL,
          'FDA label for glipizide tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'Protein binding was studied in serum from volunteers who received either oral or intravenous glipizide and found to be 98 to 99% one hour after either route of administration.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '11 liters',
        numeric: 11,
        unit: 'L',
        populationContext: 'apparent volume of distribution after intravenous administration',
        source: fdaLabel(
          GLIPIZIDE_LABEL,
          'FDA label for glipizide tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'The apparent volume of distribution of glipizide after intravenous administration was 11 liters, indicative of localization within the extracellular fluid compartment.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensive metabolism, mainly in the liver; the primary metabolites are inactive hydroxylation products and polar conjugates',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          GLIPIZIDE_LABEL,
          'FDA label for glipizide tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'The metabolism of glipizide is extensive and occurs mainly in the liver. The primary metabolites are inactive hydroxylation products and polar conjugates and are excreted mainly in the urine. Less than 10% unchanged glipizide is found in the urine.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Metabolites excreted mainly in the urine; less than 10% unchanged glipizide is found in the urine',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          GLIPIZIDE_LABEL,
          'FDA label for glipizide tablets (openFDA)',
          'clinical_pharmacology, Pharmacokinetics',
          'The primary metabolites are inactive hydroxylation products and polar conjugates and are excreted mainly in the urine. Less than 10% unchanged glipizide is found in the urine.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(3),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Initial Dose',
          amountAsRecorded: '5 mg, given before breakfast',
          purposeAsRecorded:
            'Label-stated recommended starting dose; geriatric patients or those with liver disease may be started on 2.5 mg',
        },
        {
          order: 2,
          periodAsRecorded: 'Titration, with at least several days between titration steps',
          amountAsRecorded:
            'Dosage adjustments in increments of 2.5 to 5 mg, as determined by blood glucose response',
          purposeAsRecorded: 'Label-stated titration',
        },
        {
          order: 3,
          periodAsRecorded: 'Maximum',
          amountAsRecorded: '15 mg once daily; maximum recommended total daily dose 40 mg',
          purposeAsRecorded: 'Label-stated maximum recommended doses',
        },
      ],
      source: fdaLabel(
        GLIPIZIDE_LABEL,
        'FDA label for glipizide tablets (openFDA)',
        'dosage_and_administration, Initial Dose and Titration',
        'The recommended starting dose is 5 mg, given before breakfast. Geriatric patients or those with liver disease may be started on 2.5 mg. Titration Dosage adjustments should ordinarily be in increments of 2.5 to 5 mg, as determined by blood glucose response. At least several days should elapse between titration steps.',
      ),
    },
    productVariants: [
      {
        brandName: 'Glipizide',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: '10 mg',
        approvedUseAsRecorded:
          'Adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-03-19',
        source: fdaLabel(
          GLIPIZIDE_LABEL,
          'FDA label for glipizide tablets (openFDA)',
          'indications_and_usage; how_supplied',
          'Glipizide Tablets USP are indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'pancreas',
        actionAsRecorded:
          'Appears to lower blood glucose acutely by stimulating the release of insulin from the pancreas, dependent upon functioning beta cells in the pancreatic islets',
        source: fdaLabel(
          GLIPIZIDE_LABEL,
          'FDA label for glipizide tablets (openFDA)',
          'clinical_pharmacology, Mechanism of Action',
          'In humans, glipizide appears to lower the blood glucose acutely by stimulating the release of insulin from the pancreas, an effect dependent upon functioning beta cells in the pancreatic islets.',
        ),
      },
    ],
  },

  haloperidol: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '3559',
      casNumber: '52-86-8',
      unii: 'J6292F8L3D',
      rxcui: '217483',
      source: {
        kind: 'PUBCHEM',
        identifier: '3559',
        label: "PubChem compound record matched for 'haloperidol'",
        retrievedAt: FETCHED,
      },
    },
    productVariants: [
      {
        brandName: 'Haloperidol',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: '0.5 mg, 1 mg, 2 mg, 5 mg, 10 mg or 20 mg',
        approvedUseAsRecorded:
          "Management of manifestations of psychotic disorders; control of tics and vocal utterances of Tourette's Disorder in children and adults; treatment of severe behavior problems in children of combative, explosive hyperexcitability; short-term treatment of hyperactive children who show excessive motor activity with accompanying conduct disorders",
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-11-15',
        source: fdaLabel(
          HALOPERIDOL_LABEL,
          'FDA label for haloperidol tablets (openFDA)',
          'indications_and_usage; how_supplied',
          'Haloperidol Tablets, USP are available containing 0.5 mg, 1 mg, 2 mg, 5 mg, 10 mg or 20 mg of haloperidol, USP.',
        ),
      },
    ],
  },

  hydrocortisone: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5754',
      casNumber: '50-23-7',
      unii: 'WI4X0X7BPJ',
      rxcui: '1007334',
      source: {
        kind: 'PUBCHEM',
        identifier: '5754',
        label: "PubChem compound record matched for 'hydrocortisone'",
        retrievedAt: FETCHED,
      },
    },
  },

  hydroxyzine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '3658',
      casNumber: '68-88-8',
      rxcui: '154987',
      source: {
        kind: 'PUBCHEM',
        identifier: '3658',
        label: "PubChem compound record matched for 'hydroxyzine'",
        retrievedAt: FETCHED,
      },
    },
    productVariants: [
      {
        brandName: 'hydroxyzine pamoate',
        formAsRecorded: 'Capsules',
        strengthsAsRecorded: '25 mg (equivalent to 25 mg hydroxyzine hydrochloride)',
        approvedUseAsRecorded:
          'Symptomatic relief of anxiety and tension associated with psychoneurosis and as an adjunct in organic disease states in which anxiety is manifested; management of pruritus due to allergic conditions such as chronic urticaria and atopic and contact dermatoses, and in histamine-mediated pruritus; as a sedative when used as premedication and following general anesthesia',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-12-16',
        source: fdaLabel(
          HYDROXYZINE_LABEL,
          'FDA label for hydroxyzine pamoate capsules (openFDA)',
          'indications_and_usage; how_supplied',
          'Hydroxyzine Pamoate Capsules, USP, for oral administration, are available as 25 mg (equivalent to 25 mg hydroxyzine hydrochloride)',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'Not a cortical depressant; action may be due to a suppression of activity in certain key regions of the subcortical area of the central nervous system',
        source: fdaLabel(
          HYDROXYZINE_LABEL,
          'FDA label for hydroxyzine pamoate capsules (openFDA)',
          'clinical_pharmacology',
          'Hydroxyzine pamoate is not a cortical depressant, but its action may be due to a suppression of activity in certain key regions of the subcortical area of the central nervous system.',
        ),
      },
    ],
  },

  indomethacin: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '3715',
      casNumber: '53-86-1',
      unii: 'XXE1CET956',
      rxcui: '5781',
      source: {
        kind: 'PUBCHEM',
        identifier: '3715',
        label: "PubChem compound record matched for 'indomethacin'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (capsules)',
      bioavailability: {
        display: 'virtually 100%',
        numeric: 100,
        unit: '%',
        populationContext: 'orally administered capsules, as recorded in the label',
        source: fdaLabel(
          INDOMETHACIN_LABEL,
          'FDA label for indomethacin capsules (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Orally administered indomethacin capsules are virtually 100% bioavailable, with 90% of the dose absorbed within 4 hours.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'about 2 hours',
        numeric: 2,
        unit: 'hours',
        populationContext: 'single oral doses of 25 mg or 50 mg',
        source: fdaLabel(
          INDOMETHACIN_LABEL,
          'FDA label for indomethacin capsules (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Following single oral doses of indomethacin capsules, 25 mg or 50 mg, indomethacin is readily absorbed, attaining peak plasma concentrations of about 1 and 2 mcg/mL, respectively, at about 2 hours.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 4.5 hours',
        numeric: 4.5,
        unit: 'hours',
        populationContext: 'mean half-life, as recorded in the label',
        source: fdaLabel(
          INDOMETHACIN_LABEL,
          'FDA label for indomethacin capsules (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'The mean half-life of indomethacin is estimated to be about 4.5 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'about 99%',
        numeric: 99,
        unit: '%',
        populationContext: 'plasma, over the expected range of therapeutic plasma concentrations',
        source: fdaLabel(
          INDOMETHACIN_LABEL,
          'FDA label for indomethacin capsules (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Indomethacin is highly bound to protein in plasma (about 99%) over the expected range of therapeutic plasma concentrations.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Exists in plasma as the parent drug and its desmethyl, desbenzoyl, and desmethyldesbenzoyl metabolites; glucuronide conjugates are formed',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          INDOMETHACIN_LABEL,
          'FDA label for indomethacin capsules (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Indomethacin exists in the plasma as the parent drug and its desmethyl, desbenzoyl, and desmethyldesbenzoyl metabolites, all in the unconjugated form. Appreciable formation of glucuronide conjugates of each metabolite and of indomethacin are formed.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Eliminated via renal excretion, metabolism, and biliary excretion; undergoes appreciable enterohepatic circulation',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          INDOMETHACIN_LABEL,
          'FDA label for indomethacin capsules (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Indomethacin is eliminated via renal excretion, metabolism, and biliary excretion. Indomethacin undergoes appreciable enterohepatic circulation. About 60% of an oral dose is recovered in urine as drug and metabolites (26% as indomethacin and its glucuronide), and 33% is recovered in feces (1.5% as indomethacin).',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(4.5),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded:
            'Initial (moderate to severe rheumatoid arthritis, ankylosing spondylitis, or osteoarthritis)',
          amountAsRecorded: '25 mg twice a day or three times a day',
          purposeAsRecorded: 'Label-stated initial dosage for these indications',
        },
        {
          order: 2,
          periodAsRecorded: 'At weekly intervals, if well tolerated',
          amountAsRecorded:
            'Increase the daily dosage by 25 mg or by 50 mg, if required by continuing symptoms, until a total daily dose of 150 to 200 mg is reached',
          purposeAsRecorded:
            'Until a satisfactory response is obtained; the label states the total daily dose should not exceed 200 mg',
        },
      ],
      source: fdaLabel(
        INDOMETHACIN_LABEL,
        'FDA label for indomethacin capsules (openFDA)',
        'dosage_and_administration 2.2',
        'Indomethacin capsules 25 mg twice a day or three times a day. If this is well tolerated, increase the daily dosage by 25 mg or by 50 mg, if required by continuing symptoms, at weekly intervals until a satisfactory response is obtained or until a total daily dose of 150 to 200 mg is reached.',
      ),
    },
    productVariants: [
      {
        brandName: 'Indomethacin',
        formAsRecorded: 'Capsules',
        strengthsAsRecorded: '25 mg and 50 mg',
        approvedUseAsRecorded:
          'Nonsteroidal anti-inflammatory drug indicated for moderate to severe rheumatoid arthritis including acute flares of chronic disease, moderate to severe ankylosing spondylitis, moderate to severe osteoarthritis, acute painful shoulder (bursitis and/or tendinitis), and acute gouty arthritis',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-05-27',
        source: fdaLabel(
          INDOMETHACIN_LABEL,
          'FDA label for indomethacin capsules (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Indomethacin capsules are nonsteroidal anti-inflammatory drug indicated for: Moderate to severe rheumatoid arthritis including acute flares of chronic disease Moderate to severe ankylosing spondylitis Moderate to severe osteoarthritis Acute painful shoulder (bursitis and/or tendinitis) Acute gouty arthritis ( 1 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'joints',
        actionAsRecorded:
          'Suppresses inflammation in rheumatoid arthritis; improvement demonstrated by a reduction in joint swelling, average number of joints involved, and morning stiffness',
        source: fdaLabel(
          INDOMETHACIN_LABEL,
          'FDA label for indomethacin capsules (openFDA)',
          'clinical_studies 14',
          'Indomethacin capsules suppress inflammation in rheumatoid arthritis as demonstrated by relief of pain, and reduction of fever, swelling and tenderness. Improvement in patients treated with indomethacin capsules for rheumatoid arthritis has been demonstrated by a reduction in joint swelling, average number of joints involved, and morning stiffness',
        ),
      },
    ],
  },

  'insulin-aspart': {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '16132418',
      casNumber: '116094-23-6',
      unii: 'D933668QVX',
      rxcui: '51428',
      source: {
        kind: 'PUBCHEM',
        identifier: '16132418',
        label: "PubChem compound record matched for 'insulin aspart'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded:
        'Subcutaneous injection; continuous subcutaneous infusion (insulin pump); intravenous administration after dilution',
      tMax: {
        display: '40 to 50 minutes',
        numeric: 45,
        unit: 'minutes',
        populationContext:
          'healthy volunteers (total n=107) and patients with type 1 diabetes (total n=40), median time to maximum concentration',
        source: fdaLabel(
          INSULIN_ASPART_LABEL,
          'FDA label for NOVOLOG (insulin aspart) injection (openFDA)',
          'clinical_pharmacology 12.3 Absorption and Bioavailability',
          'In studies in healthy volunteers (total n=107) and patients with type 1 diabetes (total n=40), the median time to maximum concentration of NOVOLOG in these trials was 40 to 50 minutes versus 80 to 120 minutes, for regular human insulin respectively.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '81 minutes',
        unit: 'minutes',
        populationContext:
          'normal male volunteers (n=24), average apparent half-life after subcutaneous administration',
        source: fdaLabel(
          INSULIN_ASPART_LABEL,
          'FDA label for NOVOLOG (insulin aspart) injection (openFDA)',
          'clinical_pharmacology 12.3 Metabolism and Elimination',
          'After subcutaneous administration in normal male volunteers (n=24), NOVOLOG was eliminated with an average apparent half-life of 81 minutes.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'low binding affinity (<10%)',
        numeric: 10,
        unit: '%',
        populationContext: 'plasma proteins, similar to regular human insulin',
        source: fdaLabel(
          INSULIN_ASPART_LABEL,
          'FDA label for NOVOLOG (insulin aspart) injection (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Insulin aspart has a low binding affinity to plasma proteins (<10%), similar to that seen with regular human insulin.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: 'Mean insulin clearance of 1.2 L/h/kg in an intravenous infusion study',
        populationContext:
          'healthy male subjects between 18 and 40 years of age, intravenous infusion',
        source: fdaLabel(
          INSULIN_ASPART_LABEL,
          'FDA label for NOVOLOG (insulin aspart) injection (openFDA)',
          'clinical_pharmacology 12.3 Metabolism and Elimination',
          'The mean insulin clearance was similar for the two groups with mean values of 1.2 L/h/kg for the NOVOLOG group and 1.2 L/h/kg for the regular human insulin group.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'NOVOLOG',
        formAsRecorded:
          'Injection: clear and colorless solution (multiple-dose vial, PenFill prefilled cartridge, FlexPen and FlexTouch prefilled pens)',
        strengthsAsRecorded: 'Injection: 100 units/mL (U-100)',
        approvedUseAsRecorded:
          'Rapid acting human insulin analog indicated to improve glycemic control in adults and pediatric patients with diabetes mellitus',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2023-12-15',
        source: fdaLabel(
          INSULIN_ASPART_LABEL,
          'FDA label for NOVOLOG (insulin aspart) injection (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'NOVOLOG is rapid acting human insulin analog indicated to improve glycemic control in adults and pediatric patients with diabetes mellitus ( 1 ).',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'muscle',
        actionAsRecorded:
          'Lowers blood glucose by stimulating peripheral glucose uptake, especially by skeletal muscle and fat',
        source: fdaLabel(
          INSULIN_ASPART_LABEL,
          'FDA label for NOVOLOG (insulin aspart) injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Insulin and its analogs lower blood glucose by stimulating peripheral glucose uptake, especially by skeletal muscle and fat, and by inhibiting hepatic glucose production.',
        ),
      },
      {
        regionCode: 'liver',
        actionAsRecorded: 'Lowers blood glucose by inhibiting hepatic glucose production',
        source: fdaLabel(
          INSULIN_ASPART_LABEL,
          'FDA label for NOVOLOG (insulin aspart) injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Insulin and its analogs lower blood glucose by stimulating peripheral glucose uptake, especially by skeletal muscle and fat, and by inhibiting hepatic glucose production.',
        ),
      },
    ],
  },

  'insulin-lispro': {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '16132438',
      casNumber: '133107-64-9',
      unii: 'GFX7QIS1II',
      rxcui: '86009',
      source: {
        kind: 'PUBCHEM',
        identifier: '16132438',
        label: "PubChem compound record matched for 'insulin lispro'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded:
        'Subcutaneous injection; continuous subcutaneous infusion (insulin pump); intravenous infusion after dilution',
      bioavailability: {
        display: '55% to 77%',
        numeric: 66,
        unit: '%',
        populationContext:
          'another insulin lispro product, subcutaneous injection, doses between 0.1 to 0.2 unit/kg',
        source: fdaLabel(
          INSULIN_LISPRO_LABEL,
          'FDA label for ADMELOG (insulin lispro) injection (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'The absolute bioavailability of another insulin lispro product, 100 units/mL, after subcutaneous injection ranges from 55% to 77% with doses between 0.1 to 0.2 unit/kg, inclusive.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '0.83 hours',
        numeric: 0.83,
        unit: 'hours',
        populationContext:
          'single 0.3 unit/kg subcutaneous dose of ADMELOG in 30 patients with type 1 diabetes, median',
        source: fdaLabel(
          INSULIN_LISPRO_LABEL,
          'FDA label for ADMELOG (insulin lispro) injection (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'The median time to maximum plasma insulin lispro concentration was 0.83 hours after injection',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '0.85 to 0.92 hours',
        numeric: 0.885,
        unit: 'hours',
        populationContext:
          'another insulin lispro product administered intravenously at 0.1 and 0.2 unit/kg doses',
        source: fdaLabel(
          INSULIN_LISPRO_LABEL,
          'FDA label for ADMELOG (insulin lispro) injection (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Another insulin lispro product, 100 units/mL, demonstrated a mean t 1/2 of 0.85 hours (51 minutes) and 0.92 hours (55 minutes), respectively for 0.1 unit/kg and 0.2 unit/kg doses.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '1.55 and 0.72 L/kg (0.1 and 0.2 unit/kg intravenous bolus doses, respectively)',
        numeric: 1.135,
        unit: 'L/kg',
        populationContext:
          'healthy subjects, intravenous bolus injections of another insulin lispro product',
        source: fdaLabel(
          INSULIN_LISPRO_LABEL,
          'FDA label for ADMELOG (insulin lispro) injection (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'When administered intravenously as bolus injections of 0.1 and 0.2 unit/kg dose in two separate groups of healthy subjects, the mean volume of distribution of another insulin lispro product, 100 units/mL, appeared to decrease with increase in dose (1.55 and 0.72 L/kg, respectively).',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Human metabolism studies have not been conducted; animal studies indicate metabolism identical to that of regular human insulin',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          INSULIN_LISPRO_LABEL,
          'FDA label for ADMELOG (insulin lispro) injection (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Human metabolism studies have not been conducted. However, animal studies indicate that the metabolism of another insulin lispro product, 100 units/mL, is identical to that of regular human insulin.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: 'Dose-dependent clearance following intravenous administration',
        populationContext: 'another insulin lispro product administered intravenously',
        source: fdaLabel(
          INSULIN_LISPRO_LABEL,
          'FDA label for ADMELOG (insulin lispro) injection (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'When administered intravenously, another insulin lispro product, 100 units/mL demonstrated dose-dependent clearance, with a mean clearance of 21.0 mL/min/kg (0.1 unit/kg dose), and 9.6 mL/min/kg (0.2 unit/kg dose).',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(0.885),
    },
    productVariants: [
      {
        brandName: 'ADMELOG',
        formAsRecorded:
          'Injection: clear and colorless solution (multiple-dose vials and single-patient-use SoloStar prefilled pens)',
        strengthsAsRecorded: 'Injection: 100 units/mL (U-100)',
        approvedUseAsRecorded:
          'Rapid-acting human insulin analog indicated to improve glycemic control in adult and pediatric patients with diabetes mellitus',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-06-04',
        source: fdaLabel(
          INSULIN_LISPRO_LABEL,
          'FDA label for ADMELOG (insulin lispro) injection (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'ADMELOG is a rapid-acting human insulin analog indicated to improve glycemic control in adult and pediatric patients with diabetes mellitus. ( 1 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'muscle',
        actionAsRecorded:
          'Lowers blood glucose by stimulating peripheral glucose uptake by skeletal muscle and fat',
        source: fdaLabel(
          INSULIN_LISPRO_LABEL,
          'FDA label for ADMELOG (insulin lispro) injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Insulins lower blood glucose by stimulating peripheral glucose uptake by skeletal muscle and fat, and by inhibiting hepatic glucose production.',
        ),
      },
      {
        regionCode: 'liver',
        actionAsRecorded: 'Lowers blood glucose by inhibiting hepatic glucose production',
        source: fdaLabel(
          INSULIN_LISPRO_LABEL,
          'FDA label for ADMELOG (insulin lispro) injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Insulins lower blood glucose by stimulating peripheral glucose uptake by skeletal muscle and fat, and by inhibiting hepatic glucose production.',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT02273180',
      includedAsRecorded: [
        'Participants with T1DM diagnosed for at least 12 months and had been treated with insulin glargine and Humalog or Novolog®/Novo Rapid® (at least 3 times daily before each meal) in the 6 months prior to the screening visit',
        'Written informed consent',
      ],
      excludedAsRecorded: [
        'At screening visit, age under legal age of adulthood',
        'HbA1c <7.0% or >10% at screening',
        'Diabetes other than T1DM',
        'Status post pancreatectomy',
        'Status post pancreas and/or islet cell transplantation',
        'Use of insulin pump in the last 6 months before screening visit',
      ],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT02273180',
        label:
          'ClinicalTrials.gov record for the SAR342434 (insulin lispro) versus Humalog trial in adults with type 1 diabetes (the ADMELOG label Study NCT02273180)',
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: FETCHED,
        excerpt:
          'Participants with T1DM diagnosed for at least 12 months and had been treated with insulin glargine and Humalog or Novolog®/Novo Rapid® (at least 3 times daily before each meal) in the 6 months prior to the screening visit.',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT02273180',
        endpointAsRecorded:
          'Change in HbA1c From Baseline to Week 26 (least squares mean, percentage of HbA1c)',
        activeResultAsRecorded: 'SAR342434 (insulin lispro): least squares mean change -0.42',
        comparatorResultAsRecorded: 'Humalog (insulin lispro): least squares mean change -0.47',
        differenceAsRecorded: 'Least squares mean difference 0.06 versus Humalog',
        uncertaintyAsRecorded: '95% CI -0.084 to 0.197',
        timepointAsRecorded: 'Baseline, Week 26',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT02273180',
          label:
            'ClinicalTrials.gov posted results for the SAR342434 (insulin lispro) versus Humalog trial',
          locator: 'resultsSection.outcomeMeasuresModule, primary outcome',
          retrievedAt: FETCHED,
          excerpt:
            '"title": "Change in HbA1c From Baseline to Week 26" "timeFrame": "Baseline, Week 26" SAR342434 {"value": "-0.42", "spread": "0.051"} Humalog {"value": "-0.47", "spread": "0.05"} "paramType": "Least Square (LS) Mean Difference", "paramValue": "0.06", "ciPctValue": "95", "ciLowerLimit": "-0.084", "ciUpperLimit": "0.197"',
        },
      },
    ],
  },
}
