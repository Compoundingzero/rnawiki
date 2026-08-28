import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import type { BackgroundSource } from '@/lib/background/types'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 4: insulin-glargine, levothyroxine, liraglutide, lisinopril, loratadine, losartan,
 * melatonin, metformin, methotrexate, metoprolol, metronidazole.
 *
 * Honest omissions in this batch:
 * - lisinopril: the openFDA generic-name search returned a lisinopril/hydrochlorothiazide
 *   combination label, which is a different product, so no label-derived module is recorded —
 *   registry identifiers from PubChem only.
 * - loratadine: the fetched label is a short over-the-counter label that states no tablet
 *   strengths and has no pharmacokinetics or clinical sections — registry identifiers only.
 * - melatonin: a dietary supplement with no FDA drug label (the label search returned an
 *   unrelated homeopathic combination product). Registry identifiers from PubChem plus one
 *   PubMed-sourced pharmacokinetic value with its verbatim abstract excerpt.
 * - metronidazole: the fetched label states no tablet strengths, so no product-variant module;
 *   its recorded mechanism acts on anaerobic bacteria, not a body organ, so no anatomy targets.
 * - insulin-glargine: the fetched label states no absolute bioavailability or elimination
 *   half-life figure, so those fields and the derived steady-state note are absent.
 * - levothyroxine: the label records the half-life in days inside a table, so it is stored
 *   display-only without an hour numeric and without a derived steady-state note.
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

const INSULIN_GLARGINE_LABEL = '0ad21db3-2b1c-4ed9-a687-bdd6a74d0aae'
const LEVOTHYROXINE_LABEL = '008de8fd-150f-4022-8ccb-c8bfa94875c7'
const LIRAGLUTIDE_LABEL = '0450d8a2-a88e-4849-9788-ed4f5246f223'
const LOSARTAN_LABEL = '021cd76a-b093-4704-8410-5e7d01e20a54'
const METFORMIN_LABEL = '356b02d0-d239-4441-bb33-c4c54166fcd7'
const METHOTREXATE_LABEL = '04a95db9-a124-4b97-bd71-1c37a6b3b0c8'
const METOPROLOL_LABEL = '00940cc5-d2eb-4841-9138-de97d7b1c674'
const METRONIDAZOLE_LABEL = '02046a22-a5eb-4bb7-bec7-e5a2aa55e142'

export const BACKGROUND_BATCH_4: RecordedBackgroundBySlug = {
  'insulin-glargine': {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '118984454',
      casNumber: '160337-95-1',
      unii: '2ZM8CX04RZ',
      rxcui: '274783',
      source: {
        kind: 'PUBCHEM',
        identifier: '118984454',
        label: "PubChem compound record matched for 'insulin glargine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Subcutaneous injection',
      tMax: {
        display: 'median 12 hours',
        numeric: 12,
        unit: 'hours',
        populationContext:
          'healthy subjects, single 0.5 U/kg subcutaneous dose in a euglycemic clamp study',
        source: fdaLabel(
          INSULIN_GLARGINE_LABEL,
          'FDA label for BASAGLAR KwikPen (insulin glargine) (openFDA)',
          'clinical_pharmacology 12.3 Absorption and Bioavailability',
          'The insulin serum concentrations indicated a slow and prolonged absorption and a relatively constant concentration/time profile over 24 hours with no pronounced peak. The median time to maximum serum insulin concentration was 12 hours after injection.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolized at the carboxyl terminus of the Beta chain with formation of two active metabolites, M1 and M2, whose in vitro activity is similar to that of insulin',
        populationContext:
          'diabetic patients, after subcutaneous injection of another insulin glargine product, 100 units/mL',
        source: fdaLabel(
          INSULIN_GLARGINE_LABEL,
          'FDA label for BASAGLAR KwikPen (insulin glargine) (openFDA)',
          'clinical_pharmacology 12.3 Metabolism and Elimination',
          'After subcutaneous injection of another insulin glargine product, 100 units/mL, in diabetic patients, insulin glargine is metabolized at the carboxyl terminus of the Beta chain with formation of two active metabolites M1 (21 A -Gly-insulin) and M2 (21 A -Gly-des-30 B -Thr-insulin). The in vitro activity of M1 and M2 were similar to that of insulin.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'BASAGLAR KwikPen',
        formAsRecorded: 'Injection: solution in single-patient-use prefilled pens',
        strengthsAsRecorded:
          '100 units/mL (U-100); 3 mL single-patient-use BASAGLAR KwikPen and BASAGLAR Tempo Pen',
        approvedUseAsRecorded:
          'To improve glycemic control in adults and pediatric patients with type 1 diabetes mellitus and in adults with type 2 diabetes mellitus',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-06-16',
        source: fdaLabel(
          INSULIN_GLARGINE_LABEL,
          'FDA label for BASAGLAR KwikPen (insulin glargine) (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'BASAGLAR ® is a long-acting human insulin analog indicated to improve glycemic control in adults and pediatric patients with type 1 diabetes mellitus and in adults with type 2 diabetes mellitus. ( 1 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'muscle',
        actionAsRecorded:
          'Lowers blood glucose by stimulating peripheral glucose uptake, especially by skeletal muscle and fat',
        source: fdaLabel(
          INSULIN_GLARGINE_LABEL,
          'FDA label for BASAGLAR KwikPen (insulin glargine) (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Insulin and its analog lower blood glucose by stimulating peripheral glucose uptake, especially by skeletal muscle and fat, and by inhibiting hepatic glucose production.',
        ),
      },
      {
        regionCode: 'liver',
        actionAsRecorded: 'Lowers blood glucose by inhibiting hepatic glucose production',
        source: fdaLabel(
          INSULIN_GLARGINE_LABEL,
          'FDA label for BASAGLAR KwikPen (insulin glargine) (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Insulin and its analog lower blood glucose by stimulating peripheral glucose uptake, especially by skeletal muscle and fat, and by inhibiting hepatic glucose production.',
        ),
      },
    ],
  },

  levothyroxine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5819',
      casNumber: '51-48-9',
      unii: '9J765S329G',
      rxcui: '10582',
      source: {
        kind: 'PUBCHEM',
        identifier: '5819',
        label: "PubChem compound record matched for 'levothyroxine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      bioavailability: {
        display: '40% to 80%',
        numeric: 60,
        unit: '%',
        populationContext:
          'absorption of orally administered T4 from the gastrointestinal tract, as recorded in the label',
        source: fdaLabel(
          LEVOTHYROXINE_LABEL,
          'FDA label for levothyroxine sodium tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Absorption of orally administered T4 from the gastrointestinal tract ranges from 40% to 80%. The majority of the levothyroxine sodium dose is absorbed from the jejunum and upper ileum.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '6 to 7 days',
        unit: 'days',
        populationContext: 'euthyroid patients, as recorded in the label pharmacokinetic table',
        source: fdaLabel(
          LEVOTHYROXINE_LABEL,
          'FDA label for levothyroxine sodium tablets (openFDA)',
          'clinical_pharmacology 12.3, Table 10',
          'Hormone Ratio in Thyroglobulin Biologic Potency t 1/2 (days) Protein Binding (%) * Levothyroxine (T4) 10 to 20 1 6 to 7 ** 99.96',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'greater than 99%',
        numeric: 99,
        unit: '%',
        populationContext: 'circulating thyroid hormones bound to plasma proteins',
        source: fdaLabel(
          LEVOTHYROXINE_LABEL,
          'FDA label for levothyroxine sodium tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Circulating thyroid hormones are greater than 99% bound to plasma proteins, including thyroxine-binding globulin (TBG), thyroxine-binding prealbumin (TBPA), and albumin (TBA), whose capacities and affinities vary for each hormone.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'The major pathway is sequential deiodination; the liver is the major site of degradation for both T4 and T3',
        populationContext: 'thyroid hormone metabolism, as recorded in the label',
        source: fdaLabel(
          LEVOTHYROXINE_LABEL,
          'FDA label for levothyroxine sodium tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'The major pathway of thyroid hormone metabolism is through sequential deiodination. Approximately 80% of circulating T3 is derived from peripheral T4 by monodeiodination. The liver is the major site of degradation for both T4 and T3, with T4 deiodination also occurring at a number of additional sites, including the kidney and other tissues.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Primarily eliminated by the kidneys; a portion of conjugated hormone is eliminated in the feces',
        populationContext: 'thyroid hormone excretion, as recorded in the label',
        source: fdaLabel(
          LEVOTHYROXINE_LABEL,
          'FDA label for levothyroxine sodium tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Thyroid hormones are primarily eliminated by the kidneys. A portion of the conjugated hormone reaches the colon unchanged and is eliminated in the feces. Approximately 20% of T4 is eliminated in the stool.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Levothyroxine sodium',
        formAsRecorded: 'Tablets (functional scoring)',
        strengthsAsRecorded:
          'Tablets: 25, 50, 75, 88, 100, 112, 125, 137, 150, 175, 200, and 300 mcg',
        approvedUseAsRecorded:
          'Replacement therapy in primary (thyroidal), secondary (pituitary), and tertiary (hypothalamic) congenital or acquired hypothyroidism in adult and pediatric patients, including neonates; and as an adjunct to surgery and radioiodine therapy in the management of thyrotropin-dependent well-differentiated thyroid cancer',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-03-24',
        source: fdaLabel(
          LEVOTHYROXINE_LABEL,
          'FDA label for levothyroxine sodium tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Levothyroxine sodium tablets are a L-thyroxine (T4) indicated in adult and pediatric patients, including neonates, for: Hypothyroidism: As replacement therapy in primary (thyroidal), secondary (pituitary), and tertiary (hypothalamic) congenital or acquired hypothyroidism. (1)',
        ),
      },
    ],
  },

  liraglutide: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '16134956',
      casNumber: '204656-20-2',
      unii: '839I73S42A',
      rxcui: '475968',
      source: {
        kind: 'PUBCHEM',
        identifier: '16134956',
        label: "PubChem compound record matched for 'liraglutide'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Subcutaneous injection, once daily',
      bioavailability: {
        display: 'approximately 55%',
        numeric: 55,
        unit: '%',
        populationContext: 'absolute bioavailability following subcutaneous administration',
        source: fdaLabel(
          LIRAGLUTIDE_LABEL,
          'FDA label for liraglutide injection (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Absolute bioavailability of liraglutide following subcutaneous administration is approximately 55%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '8 to 12 hours',
        numeric: 10,
        unit: 'hours',
        populationContext: 'following subcutaneous administration, time to maximum concentration',
        source: fdaLabel(
          LIRAGLUTIDE_LABEL,
          'FDA label for liraglutide injection (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Following subcutaneous administration, maximum concentrations of liraglutide are achieved at 8 to 12 hours post dosing.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 13 hours',
        numeric: 13,
        unit: 'hours',
        populationContext:
          'elimination half-life following subcutaneous administration of a single dose',
        source: fdaLabel(
          LIRAGLUTIDE_LABEL,
          'FDA label for liraglutide injection (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'The mean apparent clearance following subcutaneous administration of a single dose of liraglutide is approximately 1.2 L/h with an elimination half-life of approximately 13 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '>98%',
        numeric: 98,
        unit: '%',
        populationContext: 'binding to plasma protein, as recorded in the label',
        source: fdaLabel(
          LIRAGLUTIDE_LABEL,
          'FDA label for liraglutide injection (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Liraglutide is extensively bound to plasma protein (>98%).',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 13 L',
        numeric: 13,
        unit: 'L',
        populationContext:
          'mean apparent volume of distribution after subcutaneous administration of 0.6 mg',
        source: fdaLabel(
          LIRAGLUTIDE_LABEL,
          'FDA label for liraglutide injection (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The mean apparent volume of distribution after subcutaneous administration of liraglutide injection 0.6 mg is approximately 13 L.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Endogenously metabolized in a similar manner to large proteins without a specific organ as a major route of elimination',
        populationContext: 'healthy subjects, radiolabeled single-dose study',
        source: fdaLabel(
          LIRAGLUTIDE_LABEL,
          'FDA label for liraglutide injection (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Liraglutide is endogenously metabolized in a similar manner to large proteins without a specific organ as a major route of elimination.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Intact liraglutide was not detected in urine or feces; only a minor part of the administered radioactivity was excreted as liraglutide-related metabolites',
        populationContext: 'radiolabeled single-dose study, as recorded in the label',
        source: fdaLabel(
          LIRAGLUTIDE_LABEL,
          'FDA label for liraglutide injection (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Following a [ 3 H]-liraglutide dose, intact liraglutide was not detected in urine or feces. Only a minor part of the administered radioactivity was excreted as liraglutide-related metabolites in urine or feces (6% and 5%, respectively).',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(13),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Starting dosage, for one week (adult patients)',
          amountAsRecorded: '0.6 mg injected subcutaneously once daily',
          purposeAsRecorded:
            'Recorded as intended to reduce the risk of gastrointestinal adverse reactions during initial titration; not effective for glycemic control in adults',
        },
        {
          order: 2,
          periodAsRecorded: 'After one week at the 0.6 mg once daily dosage',
          amountAsRecorded: '1.2 mg injected subcutaneously once daily',
        },
        {
          order: 3,
          periodAsRecorded:
            'After at least one week of treatment with the 1.2 mg once daily dosage, if additional glycemic control is required',
          amountAsRecorded:
            '1.8 mg injected subcutaneously once daily (maximum recommended dosage)',
        },
      ],
      source: fdaLabel(
        LIRAGLUTIDE_LABEL,
        'FDA label for liraglutide injection (openFDA)',
        'dosage_and_administration 2.1 Recommended Dosage, Adult Patients',
        'After one week at the 0.6 mg once daily dosage, increase the dosage to 1.2 mg injected subcutaneously once daily. If additional glycemic control is required, increase the dosage to the maximum recommended dosage of 1.8 mg injected subcutaneously once daily after at least one week of treatment with the 1.2 mg once daily dosage.',
      ),
    },
    productVariants: [
      {
        brandName: 'Liraglutide',
        formAsRecorded: 'Injection: solution in a prefilled, single-patient-use pen',
        strengthsAsRecorded:
          '18 mg/3 mL (6 mg/mL); the pen delivers doses of 0.6 mg, 1.2 mg, or 1.8 mg',
        approvedUseAsRecorded:
          'Adjunct to diet and exercise to improve glycemic control in adults and pediatric patients aged 10 years and older with type 2 diabetes mellitus',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-11-13',
        source: fdaLabel(
          LIRAGLUTIDE_LABEL,
          'FDA label for liraglutide injection (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Liraglutide injection is a glucagon-like peptide-1 (GLP-1) receptor agonist indicated: as an adjunct to diet and exercise to improve glycemic control in adults and pediatric patients aged 10 years and older with type 2 diabetes mellitus ( 1 ).',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'pancreas',
        actionAsRecorded:
          'Activates the GLP-1 receptor in pancreatic beta cells, leading to insulin release in the presence of elevated glucose concentrations',
        source: fdaLabel(
          LIRAGLUTIDE_LABEL,
          'FDA label for liraglutide injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'liraglutide activates the GLP-1 receptor, a membrane-bound cell-surface receptor coupled to adenylyl cyclase by the stimulatory G-protein, Gs, in pancreatic beta cells. Liraglutide increases intracellular cyclic AMP (cAMP) leading to insulin release in the presence of elevated glucose concentrations.',
        ),
      },
      {
        regionCode: 'stomach',
        actionAsRecorded:
          'The mechanism of blood glucose lowering also involves a delay in gastric emptying',
        source: fdaLabel(
          LIRAGLUTIDE_LABEL,
          'FDA label for liraglutide injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'The mechanism of blood glucose lowering also involves a delay in gastric emptying.',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT01179048',
      includedAsRecorded: [
        'Type 2 diabetes',
        'Age min. 50 years at screening and concomitant cardiovascular, cerebrovascular or peripheral vascular disease or chronic renal failure or chronic heart failure OR age min. 60 years at screening and other specified risk factors of cardiovascular disease',
        'HbA1c: 7.0% or above',
        'Anti-diabetic drug naive or treated with one or more oral anti-diabetic drugs (OADs) or treated with human NPH insulin or long-acting insulin analogue or premixed insulin, alone or in combination with OAD(s)',
      ],
      excludedAsRecorded: [
        'Type 1 diabetes',
        'Use of a glucagon-like peptide-1 (GLP-1) receptor agonist (exenatide, liraglutide or other) or pramlintide or any dipeptidyl peptidase 4 (DPP-4) inhibitor within the 3 months prior to screening (trial start)',
        'Use of insulin other than human NPH insulin or long-acting insulin analogue or premixed insulin within 3 months prior to screening',
      ],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT01179048',
        label:
          'ClinicalTrials.gov record for the LEADER trial (liraglutide cardiovascular outcomes versus placebo)',
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: FETCHED,
        excerpt:
          'Inclusion Criteria: - Type 2 diabetes - Age min. 50 years at screening and concomitant cardiovascular, cerebrovascular or peripheral vascular disease or chronic renal failure or chronic heart failure OR age min. 60 years at screening and other specified risk factors of cardiovascular disease - HbA1c: 7.0% or above',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT01179048',
        endpointAsRecorded:
          'Time From Randomisation to First Occurrence of Cardiovascular Death, Non-fatal Myocardial Infarction, or Non-fatal Stroke (a Composite Cardiovascular Outcome)',
        activeResultAsRecorded: 'Liraglutide: 13.0 percent of subjects with a first event',
        comparatorResultAsRecorded: 'Placebo: 14.9 percent of subjects with a first event',
        differenceAsRecorded: 'Hazard ratio 0.868',
        uncertaintyAsRecorded: '95% CI 0.778 to 0.968; p<0.001 (Cox regression)',
        timepointAsRecorded: 'From randomisation to last contact (up to month 60 plus 30 days)',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT01179048',
          label: 'ClinicalTrials.gov posted results for the LEADER trial',
          locator: 'resultsSection.outcomeMeasuresModule, primary outcome',
          retrievedAt: FETCHED,
          excerpt:
            '"title": "Time From Randomisation to First Occurrence of Cardiovascular Death, Non-fatal Myocardial Infarction, or Non-fatal Stroke" "unitOfMeasure": "percentage of subjects" Liraglutide {"value": "13.0"} Placebo {"value": "14.9"} "paramType": "Hazard Ratio (HR)", "paramValue": "0.868", "ciPctValue": "95", "ciLowerLimit": "0.778", "ciUpperLimit": "0.968", "pValue": "<0.001"',
        },
      },
    ],
  },

  lisinopril: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5362119',
      casNumber: '76547-98-3',
      rxcui: '29046',
      source: {
        kind: 'PUBCHEM',
        identifier: '5362119',
        label: "PubChem compound record matched for 'lisinopril'",
        retrievedAt: FETCHED,
      },
    },
  },

  loratadine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '3957',
      casNumber: '79794-75-5',
      unii: '7AJO3BO7QN',
      rxcui: '28889',
      source: {
        kind: 'PUBCHEM',
        identifier: '3957',
        label: "PubChem compound record matched for 'loratadine'",
        retrievedAt: FETCHED,
      },
    },
  },

  losartan: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '3961',
      casNumber: '114798-26-4',
      unii: '3ST302B24A',
      rxcui: '52175',
      source: {
        kind: 'PUBCHEM',
        identifier: '3961',
        label: "PubChem compound record matched for 'losartan'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets)',
      bioavailability: {
        display: 'approximately 33%',
        numeric: 33,
        unit: '%',
        populationContext: 'systemic bioavailability following oral administration',
        source: fdaLabel(
          LOSARTAN_LABEL,
          'FDA label for losartan potassium tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Following oral administration, losartan is well absorbed and undergoes substantial first-pass metabolism. The systemic bioavailability of losartan is approximately 33%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '1 hour (active metabolite: 3 to 4 hours)',
        numeric: 1,
        unit: 'hours',
        populationContext: 'mean peak concentrations after oral administration',
        source: fdaLabel(
          LOSARTAN_LABEL,
          'FDA label for losartan potassium tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Mean peak concentrations of losartan and its active metabolite are reached in 1 hour and in 3 to 4 hours, respectively.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 2 hours (active metabolite: about 6 to 9 hours)',
        numeric: 2,
        unit: 'hours',
        populationContext: 'terminal half-life of parent losartan, as recorded in the label',
        source: fdaLabel(
          LOSARTAN_LABEL,
          'FDA label for losartan potassium tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'The terminal half-life of losartan is about 2 hours and of the metabolite is about 6 to 9 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'highly bound to plasma proteins, primarily albumin',
        populationContext: 'losartan and its active metabolite in plasma, as recorded in the label',
        source: fdaLabel(
          LOSARTAN_LABEL,
          'FDA label for losartan potassium tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Both losartan and its active metabolite are highly bound to plasma proteins, primarily albumin, with plasma free fractions of 1.3% and 0.2%, respectively.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'about 34 liters (active metabolite: 12 liters)',
        numeric: 34,
        unit: 'L',
        populationContext: 'volume of distribution, as recorded in the label',
        source: fdaLabel(
          LOSARTAN_LABEL,
          'FDA label for losartan potassium tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The volume of distribution of losartan and the active metabolite is about 34 liters and 12 liters, respectively.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Undergoes substantial first-pass metabolism; converted in part to an active carboxylic acid metabolite responsible for most of the angiotensin II receptor antagonism',
        populationContext: 'oral administration, as recorded in the label',
        source: fdaLabel(
          LOSARTAN_LABEL,
          'FDA label for losartan potassium tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Losartan is an orally active agent that undergoes substantial first-pass metabolism by cytochrome P450 enzymes. It is converted, in part, to an active carboxylic acid metabolite that is responsible for most of the angiotensin II receptor antagonism that follows losartan treatment.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Eliminated by both biliary and urinary excretion; neither losartan nor its metabolite accumulates in plasma upon repeated once-daily dosing',
        populationContext: 'radiolabeled oral dose study, as recorded in the label',
        source: fdaLabel(
          LOSARTAN_LABEL,
          'FDA label for losartan potassium tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'Biliary excretion contributes to the elimination of losartan and its metabolites. Following oral 14 C-labeled losartan, about 35% of radioactivity is recovered in the urine and about 60% in the feces.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(2),
    },
    productVariants: [
      {
        brandName: 'Losartan Potassium',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: 'Tablets: 25 mg; 50 mg; and 100 mg',
        approvedUseAsRecorded:
          'Treatment of hypertension, to lower blood pressure in adults and children greater than 6 years old; reduction of the risk of stroke in patients with hypertension and left ventricular hypertrophy; treatment of diabetic nephropathy with an elevated serum creatinine and proteinuria in patients with type 2 diabetes and a history of hypertension',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-10-22',
        source: fdaLabel(
          LOSARTAN_LABEL,
          'FDA label for losartan potassium tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Losartan potassium tablets are an angiotensin II receptor blocker (ARB) indicated for: • Treatment of hypertension, to lower blood pressure in adults and children greater than 6 years old. Lowering blood pressure reduces the risk of fatal and nonfatal cardiovascular events, primarily strokes and myocardial infarctions. (1.1)',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'blood-vessels',
        actionAsRecorded:
          'Blocks the vasoconstrictor effects of angiotensin II by selectively blocking its binding to the AT1 receptor found in vascular smooth muscle',
        source: fdaLabel(
          LOSARTAN_LABEL,
          'FDA label for losartan potassium tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Losartan and its principal active metabolite block the vasoconstrictor and aldosterone-secreting effects of angiotensin II by selectively blocking the binding of angiotensin II to the AT 1 receptor found in many tissues, (e.g., vascular smooth muscle, adrenal gland).',
        ),
      },
      {
        regionCode: 'adrenal',
        actionAsRecorded:
          'Blocks the aldosterone-secreting effects of angiotensin II at the AT1 receptor found in the adrenal gland',
        source: fdaLabel(
          LOSARTAN_LABEL,
          'FDA label for losartan potassium tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Losartan and its principal active metabolite block the vasoconstrictor and aldosterone-secreting effects of angiotensin II by selectively blocking the binding of angiotensin II to the AT 1 receptor found in many tissues, (e.g., vascular smooth muscle, adrenal gland).',
        ),
      },
    ],
  },

  melatonin: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '896',
      casNumber: '73-31-4',
      rxcui: '6711',
      source: {
        kind: 'PUBCHEM',
        identifier: '896',
        label: "PubChem compound record matched for 'melatonin'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (single 10 mg dose, study conditions)',
      halfLife: {
        display: 'mean 53.7 minutes',
        unit: 'minutes',
        populationContext:
          'healthy male volunteers, single 10 mg oral dose, cohort crossover study',
        source: {
          kind: 'PUBMED',
          identifier: '26893170',
          label:
            'PubMed abstract: pharmacokinetics of oral and intravenous melatonin in healthy volunteers (Andersen et al., BMC Pharmacol Toxicol 2016)',
          locator: 'RESULTS',
          retrievedAt: FETCHED,
          excerpt:
            'Mean t 1/2 elimination was 53.7 (7.0) min. Median absolute bioavailability was 2.5 (1.7-4.7) %.',
        },
      },
    },
  },

  metformin: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '4091',
      casNumber: '657-24-9',
      unii: '786Z46389E',
      rxcui: '235743',
      source: {
        kind: 'PUBCHEM',
        identifier: '4091',
        label: "PubChem compound record matched for 'metformin'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (extended-release tablets)',
      tMax: {
        display: '6.1 hours with food versus 4.0 hours fasting',
        numeric: 6.1,
        unit: 'hours',
        populationContext:
          'metformin hydrochloride extended-release tablets administered with food versus fasting',
        source: fdaLabel(
          METFORMIN_LABEL,
          'FDA label for metformin hydrochloride extended-release tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption, Effect of food',
          'When metformin hydrochloride extended-release tablets were administered with food, C max was increased by approximately 30% and T max was more prolonged compared with the fasting state (6.1 versus 4.0 hours).',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 6.2 hours',
        numeric: 6.2,
        unit: 'hours',
        populationContext: 'plasma elimination half-life following oral administration',
        source: fdaLabel(
          METFORMIN_LABEL,
          'FDA label for metformin hydrochloride extended-release tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'Following oral administration, approximately 90% of the absorbed drug is eliminated via the renal route within the first 24 hours, with a plasma elimination half-life of approximately 6.2 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'negligibly bound to plasma proteins',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          METFORMIN_LABEL,
          'FDA label for metformin hydrochloride extended-release tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Metformin is negligibly bound to plasma proteins. Metformin partitions into erythrocytes, most likely as a function of time.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '654 L',
        numeric: 654,
        unit: 'L',
        populationContext:
          'apparent volume of distribution following single oral 850 mg doses of metformin HCl tablets',
        source: fdaLabel(
          METFORMIN_LABEL,
          'FDA label for metformin hydrochloride extended-release tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The apparent volume of distribution (V/F) of metformin following single oral doses of metformin HCl tablets 850 mg averaged 654 ± 358 L.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Excreted unchanged in the urine; does not undergo hepatic metabolism (no metabolites identified in humans) nor biliary excretion',
        populationContext: 'intravenous single-dose studies in normal subjects',
        source: fdaLabel(
          METFORMIN_LABEL,
          'FDA label for metformin hydrochloride extended-release tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Intravenous single-dose studies in normal subjects demonstrate that metformin is excreted unchanged in the urine and does not undergo hepatic metabolism (no metabolites have been identified in humans) nor biliary excretion.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Tubular secretion is the major route of elimination; most of the absorbed drug is eliminated via the renal route',
        populationContext: 'following oral administration, as recorded in the label',
        source: fdaLabel(
          METFORMIN_LABEL,
          'FDA label for metformin hydrochloride extended-release tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'Renal clearance (see Table 4) is approximately 3.5 times greater than creatinine clearance, which indicates that tubular secretion is the major route of metformin elimination.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(6.2),
    },
    productVariants: [
      {
        brandName: 'metformin hydrochloride',
        formAsRecorded: 'Extended-release tablets',
        strengthsAsRecorded: 'Extended-Release Tablets: 500 mg and 1,000 mg',
        approvedUseAsRecorded:
          'Adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-01-15',
        source: fdaLabel(
          METFORMIN_LABEL,
          'FDA label for metformin hydrochloride extended-release tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Metformin hydrochloride extended-release tablets are indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'liver',
        actionAsRecorded: 'Decreases hepatic glucose production',
        source: fdaLabel(
          METFORMIN_LABEL,
          'FDA label for metformin hydrochloride extended-release tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Metformin decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity by increasing peripheral glucose uptake and utilization.',
        ),
      },
      {
        regionCode: 'intestines',
        actionAsRecorded: 'Decreases intestinal absorption of glucose',
        source: fdaLabel(
          METFORMIN_LABEL,
          'FDA label for metformin hydrochloride extended-release tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Metformin decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity by increasing peripheral glucose uptake and utilization.',
        ),
      },
    ],
  },

  methotrexate: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '126941',
      casNumber: '59-05-2',
      unii: '3IG1E710ZN',
      rxcui: '6851',
      source: {
        kind: 'PUBCHEM',
        identifier: '126941',
        label: "PubChem compound record matched for 'methotrexate'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      bioavailability: {
        display: 'approximately 60%',
        numeric: 60,
        unit: '%',
        populationContext: 'mean bioavailability at doses of 30 mg/m2 or less',
        source: fdaLabel(
          METHOTREXATE_LABEL,
          'FDA label for methotrexate tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'At doses of 30 mg/m 2 or less, the mean bioavailability is approximately 60%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '0.75 to 6 hours',
        numeric: 3.4,
        unit: 'hours',
        populationContext: 'peak plasma concentrations following oral administration',
        source: fdaLabel(
          METHOTREXATE_LABEL,
          'FDA label for methotrexate tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Peak plasma concentrations are reached within 0.75 to 6 hours following oral administration.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 3 to 10 hours',
        numeric: 6.5,
        unit: 'hours',
        populationContext: 'elimination half-life, as recorded in the label',
        source: fdaLabel(
          METHOTREXATE_LABEL,
          'FDA label for methotrexate tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'The elimination half-life of methotrexate is approximately 3 to 10 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 50%',
        numeric: 50,
        unit: '%',
        populationContext: 'methotrexate in serum, as recorded in the label',
        source: fdaLabel(
          METHOTREXATE_LABEL,
          'FDA label for methotrexate tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Methotrexate in serum is approximately 50% protein bound.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Partially metabolized by intestinal flora after oral administration; primarily undergoes hepatic and intracellular metabolism to active polyglutamated forms',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          METHOTREXATE_LABEL,
          'FDA label for methotrexate tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Methotrexate is partially metabolized by intestinal flora after oral administration. Methotrexate primarily undergoes hepatic and intracellular metabolism to active polyglutamated forms which can be converted back to methotrexate by hydrolase enzymes.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Primarily renal excretion by glomerular filtration and active tubular secretion; biliary excretion is a minor pathway',
        populationContext: 'dependent upon dosage and route of administration',
        source: fdaLabel(
          METHOTREXATE_LABEL,
          'FDA label for methotrexate tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Methotrexate primarily undergoes renal excretion by glomerular filtration and active tubular secretion that is dependent upon dosage and route of administration. Biliary excretion accounts for ≤10% of the methotrexate dose.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(6.5),
    },
    productVariants: [
      {
        brandName: 'METHOTREXATE',
        formAsRecorded: 'Tablets (functional scoring)',
        strengthsAsRecorded: 'Tablet having functional scoring: 2.5 mg',
        approvedUseAsRecorded:
          'Treatment of adults and pediatric patients with acute lymphoblastic leukemia (ALL) as part of a combination chemotherapy maintenance regimen; adults with mycosis fungoides; adults with relapsed or refractory non-Hodgkin lymphoma as part of a metronomic combination regimen; adults with rheumatoid arthritis; pediatric patients with polyarticular juvenile idiopathic arthritis; and adults with severe psoriasis',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-05-18',
        source: fdaLabel(
          METHOTREXATE_LABEL,
          'FDA label for methotrexate tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Methotrexate tablets are a diydrofolate reductase inhibitor indicated for the: • Treatment of adults and pediatric patients with acute lymphoblastic leukemia (ALL) as part of a combination chemotherapy maintenance regimen (1.1) • Treatment of adults with mycosis fungoides (1.1)',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'bone-marrow',
        actionAsRecorded:
          'Actively proliferating tissues such as malignant cells and bone marrow are in general more sensitive to the antifolate effect of methotrexate',
        source: fdaLabel(
          METHOTREXATE_LABEL,
          'FDA label for methotrexate tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Actively proliferating tissues such as malignant cells, bone marrow, fetal cells, buccal and intestinal mucosa, and cells of the urinary bladder are in general more sensitive to this effect of methotrexate.',
        ),
      },
      {
        regionCode: 'intestines',
        actionAsRecorded:
          'Buccal and intestinal mucosa are among the actively proliferating tissues recorded as more sensitive to the effect of methotrexate',
        source: fdaLabel(
          METHOTREXATE_LABEL,
          'FDA label for methotrexate tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Actively proliferating tissues such as malignant cells, bone marrow, fetal cells, buccal and intestinal mucosa, and cells of the urinary bladder are in general more sensitive to this effect of methotrexate.',
        ),
      },
      {
        regionCode: 'bladder',
        actionAsRecorded:
          'Cells of the urinary bladder are among the actively proliferating tissues recorded as more sensitive to the effect of methotrexate',
        source: fdaLabel(
          METHOTREXATE_LABEL,
          'FDA label for methotrexate tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Actively proliferating tissues such as malignant cells, bone marrow, fetal cells, buccal and intestinal mucosa, and cells of the urinary bladder are in general more sensitive to this effect of methotrexate.',
        ),
      },
    ],
  },

  metoprolol: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '4171',
      casNumber: '51384-51-1',
      unii: 'W5S57Y3A5L',
      rxcui: '221124',
      source: {
        kind: 'PUBCHEM',
        identifier: '4171',
        label: "PubChem compound record matched for 'metoprolol'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (immediate release tablets)',
      bioavailability: {
        display: 'about 50%',
        numeric: 50,
        unit: '%',
        populationContext:
          'estimated oral bioavailability of immediate release metoprolol, limited by saturable pre-systemic metabolism',
        source: fdaLabel(
          METOPROLOL_LABEL,
          'FDA label for metoprolol tartrate tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'The estimated oral bioavailability of immediate release metoprolol is about 50% because of pre-systemic metabolism which is saturable leading to non-proportionate increase in the exposure with increased dose.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '3 to 4 hours (7 to 9 hours in poor CYP2D6 metabolizers)',
        numeric: 3.5,
        unit: 'hours',
        populationContext: 'mean elimination half-life, as recorded in the label',
        source: fdaLabel(
          METOPROLOL_LABEL,
          'FDA label for metoprolol tartrate tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'The mean elimination half-life of metoprolol is 3 to 4 hours; in poor CYP2D6 metabolizers the half-life may be 7 to 9 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'about 10% bound to serum albumin',
        numeric: 10,
        unit: '%',
        populationContext: 'metoprolol in plasma, as recorded in the label',
        source: fdaLabel(
          METOPROLOL_LABEL,
          'FDA label for metoprolol tartrate tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'About 10% of metoprolol in plasma is bound to serum albumin.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '3.2 to 5.6 L/kg',
        numeric: 4.4,
        unit: 'L/kg',
        populationContext: 'reported volume of distribution, as recorded in the label',
        source: fdaLabel(
          METOPROLOL_LABEL,
          'FDA label for metoprolol tartrate tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Metoprolol is extensively distributed with a reported volume of distribution of 3.2 to 5.6 L/kg.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Primarily metabolized by CYP2D6; exhibits stereoselective metabolism that is dependent on oxidation phenotype',
        populationContext: 'oral administration, as recorded in the label',
        source: fdaLabel(
          METOPROLOL_LABEL,
          'FDA label for metoprolol tartrate tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Metoprolol tartrate is primarily metabolized by CYP2D6. Metoprolol is a racemic mixture of R-and S-enantiomers, and when administered orally, it exhibits stereoselective metabolism that is dependent on oxidation phenotype.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Mainly by biotransformation in the liver; most of the dose is recovered in urine, largely as metabolites',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          METOPROLOL_LABEL,
          'FDA label for metoprolol tartrate tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination and Excretion',
          'Elimination of metoprolol tartrate is mainly by biotransformation in the liver. The mean elimination half-life of metoprolol is 3 to 4 hours; in poor CYP2D6 metabolizers the half-life may be 7 to 9 hours.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(3.5),
    },
    productVariants: [
      {
        brandName: 'METOPROLOL TARTRATE',
        formAsRecorded: 'Film-coated tablets (functional scoring)',
        strengthsAsRecorded:
          'Metoprolol tartrate tablets having functional scoring: 25 mg, 50 mg and 100 mg',
        approvedUseAsRecorded:
          'Treatment of hypertension, to lower blood pressure; angina pectoris; and myocardial infarction, to reduce the risk of cardiovascular mortality when used in conjunction with intravenous metoprolol therapy in hemodynamically stable patients with definite or suspected acute myocardial infarction',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-07-27',
        source: fdaLabel(
          METOPROLOL_LABEL,
          'FDA label for metoprolol tartrate tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Metoprolol tartrate tablet is a beta-adrenergic blocker indicated for the treatment of: • Hypertension, to lower blood pressure. Lowering blood pressure reduces the risk of fatal and non-fatal cardiovascular events, primarily strokes and myocardial infarctions. ( 1.1 ) • Angina Pectoris. ( 1.2 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'heart',
        actionAsRecorded:
          'Blocks catecholamine-induced increases in heart rate, in velocity and extent of myocardial contraction, and in blood pressure, reducing the oxygen requirements of the heart',
        source: fdaLabel(
          METOPROLOL_LABEL,
          'FDA label for metoprolol tartrate tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'By blocking catecholamine-induced increases in heart rate, in velocity and extent of myocardial contraction, and in blood pressure, metoprolol reduces the oxygen requirements of the heart at any given level of effort, thus making it useful in the long-term management of angina pectoris.',
        ),
      },
    ],
  },

  metronidazole: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '4173',
      casNumber: '443-48-1',
      unii: '140QMO216E',
      rxcui: '103866',
      source: {
        kind: 'PUBCHEM',
        identifier: '4173',
        label: "PubChem compound record matched for 'metronidazole'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets)',
      tMax: {
        display: 'between one and two hours',
        numeric: 1.5,
        unit: 'hours',
        populationContext: 'peak plasma concentrations following oral administration',
        source: fdaLabel(
          METRONIDAZOLE_LABEL,
          'FDA label for metronidazole tablets (openFDA)',
          'CLINICAL PHARMACOLOGY, Absorption',
          'Following oral administration, metronidazole is well absorbed, with peak plasma concentrations occurring between one and two hours after administration.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'eight hours',
        numeric: 8,
        unit: 'hours',
        populationContext: 'average elimination half-life in healthy subjects',
        source: fdaLabel(
          METRONIDAZOLE_LABEL,
          'FDA label for metronidazole tablets (openFDA)',
          'CLINICAL PHARMACOLOGY, Metabolism/Excretion',
          'The average elimination half-life of metronidazole in healthy subjects is eight hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'less than 20%',
        numeric: 20,
        unit: '%',
        populationContext: 'circulating metronidazole bound to plasma proteins',
        source: fdaLabel(
          METRONIDAZOLE_LABEL,
          'FDA label for metronidazole tablets (openFDA)',
          'CLINICAL PHARMACOLOGY, Distribution',
          'Less than 20% of the circulating metronidazole is bound to plasma proteins.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Urinary metabolites result primarily from side-chain oxidation and glucuronide conjugation; both the parent compound and the hydroxyl metabolite possess in vitro antimicrobial activity',
        populationContext: 'as recorded in the label',
        source: fdaLabel(
          METRONIDAZOLE_LABEL,
          'FDA label for metronidazole tablets (openFDA)',
          'CLINICAL PHARMACOLOGY, Metabolism/Excretion',
          'Both the parent compound and the hydroxyl metabolite possess in vitro antimicrobial activity.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'The major route of elimination is via the urine (60% to 80% of the dose), with fecal excretion accounting for 6% to 15% of the dose',
        populationContext: 'metronidazole and its metabolites, as recorded in the label',
        source: fdaLabel(
          METRONIDAZOLE_LABEL,
          'FDA label for metronidazole tablets (openFDA)',
          'CLINICAL PHARMACOLOGY, Metabolism/Excretion',
          'The major route of elimination of metronidazole and its metabolites is via the urine (60% to 80% of the dose), with fecal excretion accounting for 6% to 15% of the dose.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(8),
    },
  },
}
