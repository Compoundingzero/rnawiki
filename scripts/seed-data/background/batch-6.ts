import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 6: simvastatin, sitagliptin, spironolactone, tadalafil, tirzepatide, tramadol,
 * venlafaxine, vitamin-d3, warfarin. Every excerpt is copied verbatim from the artifact fetched on
 * the recorded date (openFDA label sections, ClinicalTrials.gov API v2). Modules a source does not
 * support are absent. The sitagliptin artifact was refetched as the mono product
 * ("sitagliptin phosphate"); the first fetch returned a sitagliptin/metformin combination label.
 * The vitamin-d3 label fetch returned a prenatal multivitamin combination, so only registry
 * identifiers are recorded. The tirzepatide cost estimate was omitted because PubMed 38536173,
 * fetched at authoring time, is an unrelated paper and contains no cost figures.
 */
export const BACKGROUND_BATCH_6: RecordedBackgroundBySlug = {
  simvastatin: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '54454',
      casNumber: '79902-63-9',
      unii: 'AGG2FN16EV',
      rxcui: '36567',
      source: {
        kind: 'PUBCHEM',
        identifier: '54454',
        label:
          'PubChem compound record for simvastatin, with RxNorm and openFDA identifiers from the same fetched artifact',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: '<5%',
        numeric: 5,
        unit: '%',
        populationContext:
          'oral administration; extensive first-pass hepatic extraction (population not further specified in the label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00896fff-081d-4553-be8c-1999a8a73dda',
          label: 'FDA label for simvastatin tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Since simvastatin undergoes extensive first-pass extraction in the liver, the availability of simvastatin to the general circulation is low (<5%).',
        },
      },
      tMax: {
        display: '1.3 to 2.4 hours',
        numeric: 1.85,
        unit: 'hours',
        populationContext:
          'oral dosing, active and total inhibitors (population not further specified in the label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00896fff-081d-4553-be8c-1999a8a73dda',
          label: 'FDA label for simvastatin tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Peak plasma concentrations of both active and total inhibitors were attained within 1.3 to 2.4 hours postdose.',
        },
      },
      proteinBinding: {
        display: 'approximately 95%',
        numeric: 95,
        unit: '%',
        populationContext: 'human plasma proteins, simvastatin and its β-hydroxyacid metabolite',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00896fff-081d-4553-be8c-1999a8a73dda',
          label: 'FDA label for simvastatin tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Distribution Both simvastatin and its β-hydroxyacid metabolite are highly bound (approximately 95%) to human plasma proteins.',
        },
      },
      metabolismAsRecorded: {
        display: 'Metabolized by CYP3A4; major active metabolites include simvastatin acid',
        populationContext: 'human plasma (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00896fff-081d-4553-be8c-1999a8a73dda',
          label: 'FDA label for simvastatin tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Elimination Metabolism: Simvastatin is metabolized by CYP3A4. The major active metabolites of simvastatin present in human plasma are simvastatin acid and its 6′-hydroxy, 6′-hydroxymethyl, and 6′-exomethylene derivatives.',
        },
      },
      eliminationAsRecorded: {
        display: 'Excreted in urine and feces following an oral dose of 14C-labeled simvastatin',
        populationContext:
          'oral dose of 14C-labeled simvastatin (population not further specified in the label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00896fff-081d-4553-be8c-1999a8a73dda',
          label: 'FDA label for simvastatin tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Excretion : Following an oral dose of 14 C-labeled simvastatin, 13% of the dose was excreted in urine and 60% in feces.',
        },
      },
    },
    productVariants: [
      {
        brandName: 'SIMVASTATIN',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: 'Tablets: 5 mg, 10 mg; 20 mg; 40 mg; 80 mg',
        approvedUseAsRecorded:
          'To reduce the risk of total mortality by reducing risk of coronary heart disease death, non-fatal myocardial infarction and stroke, and the need for coronary and non-coronary revascularization procedures in adults with established coronary heart disease, cerebrovascular disease, peripheral vascular disease, and/or diabetes, who are at high risk of coronary heart disease events',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-02-26',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00896fff-081d-4553-be8c-1999a8a73dda',
          label: 'FDA label for simvastatin tablets, Dosage Forms and Strengths section',
          retrievedAt: '2026-08-27',
          excerpt: 'Tablets: 5 mg, 10 mg; 20 mg; 40 mg; 80 mg',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'liver',
        actionAsRecorded: 'Sustained inhibition of cholesterol synthesis in the liver',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00896fff-081d-4553-be8c-1999a8a73dda',
          label: 'FDA label for simvastatin tablets, Pharmacodynamics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Sustained inhibition of cholesterol synthesis in the liver also decreases levels of very-low-density lipoproteins.',
        },
      },
      {
        regionCode: 'blood-vessels',
        actionAsRecorded:
          'Uptake of LDL-C from blood to the liver, decreasing plasma LDL-C and total cholesterol',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00896fff-081d-4553-be8c-1999a8a73dda',
          label: 'FDA label for simvastatin tablets, Pharmacodynamics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Inhibition of HMG-CoA reductase by simvastatin acid accelerates the expression of LDL-receptors, followed by the uptake of LDL-C from blood to the liver, leading to a decrease in plasma LDL-C and total cholesterol.',
        },
      },
    ],
    applicability: {
      trialIdentifier: 'label:clinical-studies',
      includedAsRecorded: [
        'adult patients with CHD (history of angina and/or a previous myocardial infarction)',
        'baseline total cholesterol (total-C) between 212 and 309 mg/dL',
        'on a lipid-lowering diet',
      ],
      excludedAsRecorded: [],
      studiedGroupAsRecorded:
        '4,444 adult patients; approximately 18% of the study population was female; median duration 5.4 years',
      source: {
        kind: 'FDA_LABEL',
        identifier: '00896fff-081d-4553-be8c-1999a8a73dda',
        label:
          'FDA label for simvastatin tablets, Clinical Studies section (Scandinavian Simvastatin Survival Study, Study 4S)',
        retrievedAt: '2026-08-27',
        excerpt:
          'the effect of therapy with simvastatin on total mortality was assessed in 4,444 adult patients with CHD (history of angina and/or a previous myocardial infarction) and baseline total cholesterol (total-C) between 212 and 309 mg/dL who were on a lipid-lowering diet.',
      },
    },
  },

  sitagliptin: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '11591741',
      casNumber: '654671-77-9',
      unii: 'TS63EW8X6F',
      rxcui: '2716481',
      source: {
        kind: 'PUBCHEM',
        identifier: '11591741',
        label:
          'PubChem compound record for sitagliptin phosphate (the labelled substance of the fetched mono product), with RxNorm and openFDA identifiers from the same fetched artifact',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: 'approximately 87%',
        numeric: 87,
        unit: '%',
        populationContext: 'healthy subjects, single oral 100 mg dose',
        source: {
          kind: 'FDA_LABEL',
          identifier: 'cebc8388-c9db-4e27-8d6b-0d9bdc9d766d',
          label: 'FDA label for sitagliptin phosphate tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'After oral administration of a 100 mg dose to healthy subjects, sitagliptin was rapidly absorbed with peak plasma concentrations (median T max ) occurring 1 to 4 hours postdose. The absolute bioavailability of sitagliptin is approximately 87%.',
        },
      },
      tMax: {
        display: '1 to 4 hours (median Tmax)',
        numeric: 2.5,
        unit: 'hours',
        populationContext: 'healthy subjects, single oral 100 mg dose',
        source: {
          kind: 'FDA_LABEL',
          identifier: 'cebc8388-c9db-4e27-8d6b-0d9bdc9d766d',
          label: 'FDA label for sitagliptin phosphate tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'After oral administration of a 100 mg dose to healthy subjects, sitagliptin was rapidly absorbed with peak plasma concentrations (median T max ) occurring 1 to 4 hours postdose.',
        },
      },
      halfLife: {
        display: '12.4 hours',
        numeric: 12.4,
        unit: 'hours',
        populationContext: 'healthy volunteers, single oral 100 mg dose',
        source: {
          kind: 'FDA_LABEL',
          identifier: 'cebc8388-c9db-4e27-8d6b-0d9bdc9d766d',
          label: 'FDA label for sitagliptin phosphate tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following a single oral 100-mg dose to healthy volunteers, mean plasma AUC of sitagliptin was 8.52 μM•hr, C max was 950 nM, and apparent terminal half-life (t 1/2 ) was 12.4 hours.',
        },
      },
      proteinBinding: {
        display: '38%',
        numeric: 38,
        unit: '%',
        populationContext:
          'fraction reversibly bound to plasma proteins (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: 'cebc8388-c9db-4e27-8d6b-0d9bdc9d766d',
          label: 'FDA label for sitagliptin phosphate tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt: 'The fraction of sitagliptin reversibly bound to plasma proteins is low (38%).',
        },
      },
      volumeOfDistribution: {
        display: 'approximately 198 liters',
        numeric: 198,
        unit: 'L',
        populationContext: 'healthy subjects, single 100 mg intravenous dose, steady state',
        source: {
          kind: 'FDA_LABEL',
          identifier: 'cebc8388-c9db-4e27-8d6b-0d9bdc9d766d',
          label: 'FDA label for sitagliptin phosphate tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mean volume of distribution at steady state following a single 100-mg intravenous dose of sitagliptin to healthy subjects is approximately 198 liters.',
        },
      },
      metabolismAsRecorded: {
        display: 'Limited metabolism; primary enzyme CYP3A4 with contribution from CYP2C8',
        populationContext: 'in vitro studies (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: 'cebc8388-c9db-4e27-8d6b-0d9bdc9d766d',
          label: 'FDA label for sitagliptin phosphate tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'In vitro studies indicated that the primary enzyme responsible for the limited metabolism of sitagliptin was CYP3A4, with contribution from CYP2C8.',
        },
      },
      eliminationAsRecorded: {
        display:
          'Excreted mostly unchanged in the urine; renal excretion is the primary elimination route',
        populationContext: 'adults after oral dosing (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: 'cebc8388-c9db-4e27-8d6b-0d9bdc9d766d',
          label: 'FDA label for sitagliptin phosphate tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Approximately 79% of sitagliptin is excreted unchanged in the urine with metabolism being a minor pathway of elimination. The apparent terminal t 1/2 following a 100 mg oral dose of sitagliptin was approximately 12.4 hours and renal clearance was approximately 350 mL/min.',
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(12.4),
    },
    productVariants: [
      {
        brandName: 'Sitagliptin Phosphate',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: 'Tablets: 100 mg, 50 mg, and 25 mg',
        approvedUseAsRecorded:
          'indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-05-10',
        source: {
          kind: 'FDA_LABEL',
          identifier: 'cebc8388-c9db-4e27-8d6b-0d9bdc9d766d',
          label: 'FDA label for sitagliptin phosphate tablets, Dosage Forms and Strengths section',
          retrievedAt: '2026-08-27',
          excerpt: 'Tablets: 100 mg, 50 mg, and 25 mg ( 3 )',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'pancreas',
        actionAsRecorded:
          'By increasing and prolonging active incretin levels, sitagliptin increases insulin release and decreases glucagon levels; the label attributes these hormone effects to pancreatic beta and alpha cells',
        source: {
          kind: 'FDA_LABEL',
          identifier: 'cebc8388-c9db-4e27-8d6b-0d9bdc9d766d',
          label: 'FDA label for sitagliptin phosphate tablets, Mechanism of Action section',
          retrievedAt: '2026-08-27',
          excerpt:
            'When blood glucose concentrations are normal or elevated, GLP-1 and GIP increase insulin synthesis and release from pancreatic beta cells by intracellular signaling pathways involving cyclic AMP. GLP-1 also lowers glucagon secretion from pancreatic alpha cells, leading to reduced hepatic glucose production.',
        },
      },
    ],
  },

  spironolactone: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '5833',
      casNumber: '52-01-7',
      unii: '27O7W4T232',
      rxcui: '9997',
      source: {
        kind: 'PUBCHEM',
        identifier: '5833',
        label:
          'PubChem compound record for spironolactone, with RxNorm and openFDA identifiers from the same fetched artifact',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      tMax: {
        display: '2.6 hours (spironolactone); 4.3 hours (canrenone metabolite)',
        numeric: 2.6,
        unit: 'hours',
        populationContext: 'healthy volunteers',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08738ad4-1607-4d55-af71-6790477353bd',
          label: 'FDA label for spironolactone tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mean time to reach peak plasma concentration of spironolactone and the active metabolite, canrenone, in healthy volunteers is 2.6 and 4.3 hours, respectively.',
        },
      },
      halfLife: {
        display: '1.4 hour (spironolactone); active metabolites 13.8 to 16.5 hours',
        numeric: 1.4,
        unit: 'hours',
        populationContext: 'adults (as recorded in the FDA label; mean values)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08738ad4-1607-4d55-af71-6790477353bd',
          label: 'FDA label for spironolactone tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mean half-life of spironolactone is 1.4 hour. The mean half-life values of its metabolites including canrenone, 7-α-(thiomethyl) spirolactone (TMS), and 6-ß-hydroxy-7-α-(thiomethyl) spirolactone (HTMS) are 16.5, 13.8, and 15 hours, respectively.',
        },
      },
      proteinBinding: {
        display: 'more than 90%',
        numeric: 90,
        unit: '%',
        populationContext:
          'spironolactone and its metabolites, plasma proteins (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08738ad4-1607-4d55-af71-6790477353bd',
          label: 'FDA label for spironolactone tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Distribution Spironolactone and its metabolites are more than 90% bound to plasma proteins.',
        },
      },
      metabolismAsRecorded: {
        display: 'Rapidly and extensively metabolized; metabolites include canrenone, TMS and HTMS',
        populationContext: 'humans (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08738ad4-1607-4d55-af71-6790477353bd',
          label: 'FDA label for spironolactone tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Metabolism: Spironolactone is rapidly and extensively metabolized. Metabolites can be divided into two main categories: those in which sulfur of the parent molecule is removed (e.g., canrenone) and those in which the sulfur is retained (e.g., TMS and HTMS).',
        },
      },
      eliminationAsRecorded: {
        display: 'Metabolites excreted primarily in the urine and secondarily in bile',
        populationContext: 'humans (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08738ad4-1607-4d55-af71-6790477353bd',
          label: 'FDA label for spironolactone tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Excretion: The metabolites are excreted primarily in the urine and secondarily in bile.',
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(1.4),
    },
    productVariants: [
      {
        brandName: 'Spironolactone',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: 'Tablets: 25 mg, 50 mg, and 100 mg',
        approvedUseAsRecorded:
          'The treatment of NYHA Class III-IV heart failure and reduced ejection fraction to increase survival, manage edema, and to reduce the need for hospitalization for heart failure; use as an add-on therapy for the treatment of hypertension, to lower blood pressure',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-11-19',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08738ad4-1607-4d55-af71-6790477353bd',
          label: 'FDA label for spironolactone tablets, Dosage Forms and Strengths section',
          retrievedAt: '2026-08-27',
          excerpt: 'Tablets: 25 mg, 50 mg, and 100 mg ( 3 ).',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'kidneys',
        actionAsRecorded:
          'Antagonist of aldosterone through competitive binding of receptors at the aldosterone-dependent sodium-potassium exchange site in the distal convoluted renal tubule',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08738ad4-1607-4d55-af71-6790477353bd',
          label: 'FDA label for spironolactone tablets, Mechanism of Action section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Spironolactone and its active metabolites are specific pharmacologic antagonists of aldosterone, acting primarily through competitive binding of receptors at the aldosterone-dependent sodium-potassium exchange site in the distal convoluted renal tubule.',
        },
      },
    ],
    applicability: {
      trialIdentifier: 'label:clinical-studies',
      includedAsRecorded: [
        'an ejection fraction of ≤ 35%',
        'NYHA class III-IV symptoms',
        'a history of NYHA class IV symptoms within the last 6 months before enrollment',
      ],
      excludedAsRecorded: [
        'a baseline serum creatinine of >2.5 mg/dL or a recent increase of 25%',
        'a baseline serum potassium of >5.0 mEq/L',
      ],
      studiedGroupAsRecorded:
        '87% of patients were white, 7% black, 2% Asian. 73% were male and median age was 67.',
      source: {
        kind: 'FDA_LABEL',
        identifier: '08738ad4-1607-4d55-af71-6790477353bd',
        label:
          'FDA label for spironolactone tablets, Clinical Studies section (Randomized Spironolactone Evaluation Study)',
        retrievedAt: '2026-08-27',
        excerpt:
          'To be eligible to participate patients had to have an ejection fraction of ≤ 35%, NYHA class III-IV symptoms, and a history of NYHA class IV symptoms within the last 6 months before enrollment. Patients with a baseline serum creatinine of >2.5 mg/dL or a recent increase of 25% or with a baseline serum potassium of >5.0 mEq/L were excluded.',
      },
    },
  },

  tadalafil: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '110635',
      casNumber: '171596-29-5',
      unii: '742SXX0ICT',
      rxcui: '358263',
      source: {
        kind: 'PUBCHEM',
        identifier: '110635',
        label:
          'PubChem compound record for tadalafil, with RxNorm and openFDA identifiers from the same fetched artifact',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      tMax: {
        display: 'median 2 hours (range 30 minutes to 6 hours)',
        numeric: 2,
        unit: 'hours',
        populationContext:
          'single oral-dose administration (population not further specified in the label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00cbc656-768d-4995-bb6d-a0d4b32a248c',
          label: 'FDA label for tadalafil tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'After single oral-dose administration, the maximum observed plasma concentration (C max ) of tadalafil is achieved between 30 minutes and 6 hours (median time of 2 hours).',
        },
      },
      halfLife: {
        display: '17.5 hours',
        numeric: 17.5,
        unit: 'hours',
        populationContext: 'healthy subjects',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00cbc656-768d-4995-bb6d-a0d4b32a248c',
          label: 'FDA label for tadalafil tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Excretion — The mean oral clearance for tadalafil is 2.5 L/hr and the mean terminal half-life is 17.5 hours in healthy subjects.',
        },
      },
      proteinBinding: {
        display: '94%',
        numeric: 94,
        unit: '%',
        populationContext: 'plasma, at therapeutic concentrations',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00cbc656-768d-4995-bb6d-a0d4b32a248c',
          label: 'FDA label for tadalafil tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'At therapeutic concentrations, 94% of tadalafil in plasma is bound to proteins.',
        },
      },
      volumeOfDistribution: {
        display: 'approximately 63 L',
        numeric: 63,
        unit: 'L',
        populationContext: 'oral administration (mean apparent volume of distribution)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00cbc656-768d-4995-bb6d-a0d4b32a248c',
          label: 'FDA label for tadalafil tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Distribution — The mean apparent volume of distribution following oral administration is approximately 63 L, indicating that tadalafil is distributed into tissues.',
        },
      },
      metabolismAsRecorded: {
        display: 'Predominantly metabolized by CYP3A4 to a catechol metabolite',
        populationContext: 'humans (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00cbc656-768d-4995-bb6d-a0d4b32a248c',
          label: 'FDA label for tadalafil tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Metabolism — Tadalafil is predominantly metabolized by CYP3A4 to a catechol metabolite. The catechol metabolite undergoes extensive methylation and glucuronidation to form the methylcatechol and methylcatechol glucuronide conjugate, respectively.',
        },
      },
      eliminationAsRecorded: {
        display:
          'Excreted predominantly as metabolites, mainly in the feces and to a lesser extent in the urine',
        populationContext: 'humans (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00cbc656-768d-4995-bb6d-a0d4b32a248c',
          label: 'FDA label for tadalafil tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Tadalafil is excreted predominantly as metabolites, mainly in the feces (approximately 61% of the dose) and to a lesser extent in the urine (approximately 36% of the dose).',
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(17.5),
    },
    productVariants: [
      {
        brandName: 'tadalafil',
        formAsRecorded: 'Film coated tablets',
        strengthsAsRecorded: 'Tablets: 2.5 mg, 5 mg, 10 mg, 20 mg',
        approvedUseAsRecorded:
          'indicated for the treatment of: erectile dysfunction (ED), the signs and symptoms of benign prostatic hyperplasia (BPH), and ED and the signs and symptoms of BPH (ED/BPH)',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-10-16',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00cbc656-768d-4995-bb6d-a0d4b32a248c',
          label: 'FDA label for tadalafil tablets, Dosage Forms and Strengths section',
          retrievedAt: '2026-08-27',
          excerpt: 'Tablets: 2.5 mg, 5 mg, 10 mg, 20 mg ( 3 ).',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'pelvic-organs',
        actionAsRecorded:
          'PDE5 inhibition increases cGMP, causing smooth muscle relaxation and increased blood flow into the corpus cavernosum',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00cbc656-768d-4995-bb6d-a0d4b32a248c',
          label: 'FDA label for tadalafil tablets, Mechanism of Action section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Cyclic GMP causes smooth muscle relaxation and increased blood flow into the corpus cavernosum. The inhibition of phosphodiesterase type 5 (PDE5) enhances erectile function by increasing the amount of cGMP. Tadalafil inhibits PDE5.',
        },
      },
      {
        regionCode: 'bladder',
        actionAsRecorded:
          'The effect of PDE5 inhibition on cGMP is also observed in the smooth muscle of the prostate, the bladder and their vascular supply',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00cbc656-768d-4995-bb6d-a0d4b32a248c',
          label: 'FDA label for tadalafil tablets, Mechanism of Action section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The effect of PDE5 inhibition on cGMP concentration in the corpus cavernosum and pulmonary arteries is also observed in the smooth muscle of the prostate, the bladder and their vascular supply.',
        },
      },
    ],
  },

  tirzepatide: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '166567236',
      casNumber: '2023788-19-2',
      unii: 'OYN3CCI6QE',
      rxcui: '2601723',
      source: {
        kind: 'PUBCHEM',
        identifier: '166567236',
        label:
          'PubChem compound record for tirzepatide, with RxNorm and openFDA identifiers from the same fetched artifact',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'subcutaneous',
      tMax: {
        display: '8 to 72 hours',
        numeric: 40,
        unit: 'hours',
        populationContext: 'subcutaneous administration (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0818426a-53eb-4db7-9609-bbae1e7a3964',
          label: 'FDA label for MOUNJARO (tirzepatide) injection, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following subcutaneous administration, the time to maximum plasma concentration of tirzepatide ranges from 8 to 72 hours.',
        },
      },
      bioavailability: {
        display: '80%',
        numeric: 80,
        unit: '%',
        populationContext: 'subcutaneous administration (mean absolute bioavailability)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0818426a-53eb-4db7-9609-bbae1e7a3964',
          label: 'FDA label for MOUNJARO (tirzepatide) injection, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mean absolute bioavailability of tirzepatide following subcutaneous administration is 80%.',
        },
      },
      volumeOfDistribution: {
        display: 'approximately 10.3 L',
        numeric: 10.3,
        unit: 'L',
        populationContext:
          'patients with type 2 diabetes mellitus, subcutaneous administration, steady state',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0818426a-53eb-4db7-9609-bbae1e7a3964',
          label: 'FDA label for MOUNJARO (tirzepatide) injection, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mean apparent steady-state volume of distribution of tirzepatide following subcutaneous administration in patients with type 2 diabetes mellitus is approximately 10.3 L.',
        },
      },
      proteinBinding: {
        display: '99%',
        numeric: 99,
        unit: '%',
        populationContext: 'plasma albumin (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0818426a-53eb-4db7-9609-bbae1e7a3964',
          label: 'FDA label for MOUNJARO (tirzepatide) injection, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt: 'Tirzepatide is highly bound to plasma albumin (99%).',
        },
      },
      halfLife: {
        display: 'approximately 5 days',
        populationContext:
          'adults (as recorded in the FDA label; the label states the value in days only)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0818426a-53eb-4db7-9609-bbae1e7a3964',
          label: 'FDA label for MOUNJARO (tirzepatide) injection, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The apparent population mean clearance of tirzepatide is 0.061 L/h with an elimination half-life of approximately 5 days, enabling once-weekly dosing.',
        },
      },
      metabolismAsRecorded: {
        display:
          'Metabolized by proteolytic cleavage of the peptide backbone, beta-oxidation of the C20 fatty diacid and amide hydrolysis',
        populationContext: 'humans (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0818426a-53eb-4db7-9609-bbae1e7a3964',
          label: 'FDA label for MOUNJARO (tirzepatide) injection, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Metabolism Tirzepatide is metabolized by proteolytic cleavage of the peptide backbone, beta-oxidation of the C20 fatty diacid and amide hydrolysis.',
        },
      },
      eliminationAsRecorded: {
        display:
          'Metabolites excreted via urine and feces; intact tirzepatide is not observed in urine or feces',
        populationContext: 'humans (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0818426a-53eb-4db7-9609-bbae1e7a3964',
          label: 'FDA label for MOUNJARO (tirzepatide) injection, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Excretion The primary excretion routes of tirzepatide metabolites are via urine and feces. Intact tirzepatide is not observed in urine or feces.',
        },
      },
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Starting dosage',
          amountAsRecorded: '2.5 mg injected subcutaneously once weekly',
          purposeAsRecorded:
            'The 2.5 mg dosage is for treatment initiation and is not intended for glycemic control.',
        },
        {
          order: 2,
          periodAsRecorded: 'After 4 weeks',
          amountAsRecorded: '5 mg injected subcutaneously once weekly',
        },
        {
          order: 3,
          periodAsRecorded: 'After at least 4 weeks on the current dose',
          amountAsRecorded:
            'Dosage increases in 2.5 mg increments; maximum dosage 15 mg injected subcutaneously once weekly in adults',
          purposeAsRecorded: 'If additional glycemic control is needed.',
        },
      ],
      source: {
        kind: 'FDA_LABEL',
        identifier: '0818426a-53eb-4db7-9609-bbae1e7a3964',
        label: 'FDA label for MOUNJARO (tirzepatide) injection, Dosage and Administration section',
        retrievedAt: '2026-08-27',
        excerpt:
          'The recommended starting dosage is 2.5 mg injected subcutaneously once weekly. ( 2.1 ) After 4 weeks, increase to 5 mg injected subcutaneously once weekly. ( 2.1 ) If additional glycemic control is needed, increase the dosage in 2.5 mg increments after at least 4 weeks on the current dose. ( 2.1 ) Maximum dosage ( 2.1 ): Adults: 15 mg subcutaneously once weekly.',
      },
    },
    productVariants: [
      {
        brandName: 'MOUNJARO',
        formAsRecorded:
          'Injection (pre-filled single-dose pens, single-dose vials, multi-dose vials, or single-patient-use KwikPens)',
        strengthsAsRecorded:
          'Injection: 2.5 mg, 5 mg, 7.5 mg, 10 mg, 12.5 mg, or 15 mg per 0.5 mL in single-dose pen or single-dose vial',
        approvedUseAsRecorded:
          'indicated as an adjunct to diet and exercise to improve glycemic control in adults and pediatric patients 10 years of age and older with type 2 diabetes mellitus',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-07-29',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0818426a-53eb-4db7-9609-bbae1e7a3964',
          label:
            'FDA label for MOUNJARO (tirzepatide) injection, Dosage Forms and Strengths section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Injection: 2.5 mg, 5 mg, 7.5 mg, 10 mg, 12.5 mg, or 15 mg per 0.5 mL in single-dose pen or single-dose vial ( 3 )',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'stomach',
        actionAsRecorded: 'Delays gastric emptying; slows post-meal glucose absorption',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0818426a-53eb-4db7-9609-bbae1e7a3964',
          label: 'FDA label for MOUNJARO (tirzepatide) injection, Pharmacodynamics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Gastric Emptying Tirzepatide delays gastric emptying. The delay is largest after the first dose and this effect diminishes over time. Tirzepatide slows post-meal glucose absorption, reducing postprandial glucose.',
        },
      },
    ],
    applicability: {
      trialIdentifier: 'NCT03954834',
      includedAsRecorded: [
        'Have been diagnosed with type 2 diabetes mellitus (T2DM).',
        'Are naïve to diabetes injectable therapies and have not used any oral antihyperglycemic medications (OAMs) during the 3 months preceding screening.',
        'Have HbA1c between ≥7.0% and ≤9.5%.',
        'Be of stable weight (± 5%) for at least 3 months before screening.',
        'Have a BMI ≥23 kilograms per meter squared (kg/m²) at screening.',
      ],
      excludedAsRecorded: [
        'Have type 1 diabetes mellitus.',
        'Have had chronic or acute pancreatitis any time prior to study entry.',
        'Have proliferative diabetic retinopathy or diabetic maculopathy or nonproliferative diabetic retinopathy requiring acute treatment.',
        'Have disorders associated with slowed emptying of the stomach, or have had any stomach surgeries for the purpose of weight loss.',
        'Have an estimated glomerular filtration rate <30 mL/minute/1.73 m².',
        'Have had a heart attack, stroke, or hospitalization for congestive heart failure in the past 2 months.',
      ],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT03954834',
        label: 'ClinicalTrials.gov registry record for SURPASS-1, eligibility criteria (API v2)',
        retrievedAt: '2026-08-27',
        excerpt:
          'Inclusion Criteria: * Have been diagnosed with type 2 diabetes mellitus (T2DM). * Are naïve to diabetes injectable therapies and have not used any oral antihyperglycemic medications (OAMs) during the 3 months preceding screening. * Have HbA1c between ≥7.0% and ≤9.5%. * Be of stable weight (± 5%) for at least 3 months before screening.',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT03954834',
        endpointAsRecorded: 'Change From Baseline in Hemoglobin A1c (HbA1c), percentage of HbA1c',
        activeResultAsRecorded: '-1.87 (tirzepatide 5 mg, least squares mean change)',
        comparatorResultAsRecorded: '0.04 (placebo)',
        differenceAsRecorded: 'LS mean difference vs placebo -1.91',
        uncertaintyAsRecorded: '95% CI -2.18 to -1.63; p<0.001',
        timepointAsRecorded: 'Baseline to Week 40',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT03954834',
          label:
            'ClinicalTrials.gov posted results for SURPASS-1, primary outcome measure (API v2)',
          retrievedAt: '2026-08-27',
          excerpt:
            'Change From Baseline in Hemoglobin A1c (HbA1c); Baseline, Week 40; unit Percentage of HbA1c. 5 mg Tirzepatide: value -1.87, spread 0.094. Placebo: value 0.04, spread 0.105. LS Mean Difference -1.91, ci pct 95, ci -2.18 to -1.63, p <0.001.',
        },
      },
    ],
  },

  tramadol: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '33741',
      casNumber: '27203-92-5',
      unii: '9N7R477WCK',
      rxcui: '10689',
      source: {
        kind: 'PUBCHEM',
        identifier: '33741',
        label:
          'PubChem compound record for tramadol, with RxNorm and openFDA identifiers from the same fetched artifact',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral (extended-release tablets)',
      bioavailability: {
        display: 'approximately 85 to 90% (relative to immediate-release tablets)',
        numeric: 87.5,
        unit: '%',
        populationContext:
          'healthy subjects; extended-release 200 mg once daily relative to immediate-release 50 mg every six hours',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004de5a4-80f8-4040-a6ea-be5e99352a36',
          label:
            'FDA label for tramadol hydrochloride extended-release tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'In healthy subjects, the bioavailability of a tramadol hydrochloride extended-release tablet 200 mg administered once daily relative to a 50 mg immediate-release (IR) tablet administered every six hours was approximately 85 to 90%.',
        },
      },
      tMax: {
        display: 'about 12 h (tramadol); 15 h (M1 metabolite)',
        numeric: 12,
        unit: 'hours',
        populationContext: 'healthy volunteers, extended-release tablets',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004de5a4-80f8-4040-a6ea-be5e99352a36',
          label:
            'FDA label for tramadol hydrochloride extended-release tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mean peak plasma concentrations of tramadol and M1 after administration of tramadol hydrochloride extended-release tablets to healthy volunteers are attained at about 12 h and 15 h, respectively, after dosing (see Table 3 and Figure 1).',
        },
      },
      volumeOfDistribution: {
        display: '2.6 L/kg (male subjects); 2.9 L/kg (female subjects)',
        numeric: 2.6,
        unit: 'L/kg',
        populationContext: 'male and female subjects, 100 mg intravenous dose',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004de5a4-80f8-4040-a6ea-be5e99352a36',
          label:
            'FDA label for tramadol hydrochloride extended-release tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The volume of distribution of tramadol was 2.6 and 2.9 L/kg in male and female subjects, respectively, following a 100 mg intravenous dose.',
        },
      },
      proteinBinding: {
        display: 'approximately 20%',
        numeric: 20,
        unit: '%',
        populationContext: 'human plasma proteins (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004de5a4-80f8-4040-a6ea-be5e99352a36',
          label:
            'FDA label for tramadol hydrochloride extended-release tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The binding of tramadol to human plasma proteins is approximately 20% and binding also appears to be independent of concentration up to 10 mcg/mL.',
        },
      },
      halfLife: {
        display: 'approximately 7.9 hours (tramadol); 8.8 hours (M1 metabolite)',
        numeric: 7.9,
        unit: 'hours',
        populationContext:
          'adults after extended-release tablet administration (mean terminal values)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004de5a4-80f8-4040-a6ea-be5e99352a36',
          label:
            'FDA label for tramadol hydrochloride extended-release tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mean terminal plasma elimination half-lives of racemic tramadol and racemic M1 after administration of tramadol hydrochloride extended-release tablets are approximately 7.9 and 8.8 hours, respectively.',
        },
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized; N-demethylation (CYP3A4 and CYP2D6), O-demethylation (CYP2D6), and glucuronidation or sulfation in the liver',
        populationContext: 'humans after oral administration (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004de5a4-80f8-4040-a6ea-be5e99352a36',
          label:
            'FDA label for tramadol hydrochloride extended-release tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Metabolism Tramadol is extensively metabolized after oral administration. The metabolic pathways appear to be N – demethylation (mediated by CYP3A4 and CYP2D6), O – demethylation (mediated by CYP2D6) and glucuronidation or sulfation in the liver.',
        },
      },
      eliminationAsRecorded: {
        display: 'Excreted in urine, partly as unchanged drug and mostly as metabolites',
        populationContext: 'humans (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004de5a4-80f8-4040-a6ea-be5e99352a36',
          label:
            'FDA label for tramadol hydrochloride extended-release tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Excretion Approximately 30% of the dose is excreted in the urine as unchanged drug, whereas 60% of the dose is excreted as metabolites.',
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(7.9),
    },
    productVariants: [
      {
        brandName: 'TRAMADOL HYDROCHLORIDE',
        formAsRecorded: 'Extended-release tablets',
        strengthsAsRecorded: 'Extended-release tablets 100 mg, 200 mg, and 300 mg',
        approvedUseAsRecorded:
          'indicated for the management of severe and persistent pain that requires an opioid analgesic and that cannot be adequately treated with alternative options, including immediate-release opioids',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-11-20',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004de5a4-80f8-4040-a6ea-be5e99352a36',
          label:
            'FDA label for tramadol hydrochloride extended-release tablets, Dosage Forms and Strengths section',
          retrievedAt: '2026-08-27',
          excerpt: 'Extended-release tablets 100 mg, 200 mg, and 300 mg (3 )',
        },
      },
    ],
  },

  venlafaxine: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '5656',
      casNumber: '93413-69-5',
      unii: '7D7RX5A8MO',
      rxcui: '235988',
      source: {
        kind: 'PUBCHEM',
        identifier: '5656',
        label:
          'PubChem compound record for venlafaxine, with RxNorm and openFDA identifiers from the same fetched artifact',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      proteinBinding: {
        display: '27% ± 2%',
        numeric: 27,
        unit: '%',
        populationContext: 'human plasma, at concentrations ranging from 2.5 to 2215 ng/mL',
        source: {
          kind: 'FDA_LABEL',
          identifier: '017a84aa-0e1f-f560-e063-6294a90a9069',
          label: 'FDA label for venlafaxine tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The degree of binding of venlafaxine to human plasma is 27% ± 2% at concentrations ranging from 2.5 to 2215 ng/mL.',
        },
      },
      halfLife: {
        display: '5 ± 2 hours (venlafaxine); 11 ± 2 hours (ODV, active metabolite)',
        numeric: 5,
        unit: 'hours',
        populationContext: 'multiple-dose steady state (mean ± SD, as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '017a84aa-0e1f-f560-e063-6294a90a9069',
          label: 'FDA label for venlafaxine tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Mean ± SD steady-state plasma clearance of venlafaxine and ODV is 1.3 ± 0.6 and 0.4 ± 0.2 L/h/kg, respectively; elimination half-life is 5 ± 2 and 11±2 hours, respectively; and steady-state volume of distribution is 7.5 ± 3.7 L/kg and 5.7 ± 1.8 L/kg, respectively.',
        },
      },
      volumeOfDistribution: {
        display: '7.5 ± 3.7 L/kg',
        numeric: 7.5,
        unit: 'L/kg',
        populationContext: 'multiple-dose steady state (mean ± SD, as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '017a84aa-0e1f-f560-e063-6294a90a9069',
          label: 'FDA label for venlafaxine tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Mean ± SD steady-state plasma clearance of venlafaxine and ODV is 1.3 ± 0.6 and 0.4 ± 0.2 L/h/kg, respectively; elimination half-life is 5 ± 2 and 11±2 hours, respectively; and steady-state volume of distribution is 7.5 ± 3.7 L/kg and 5.7 ± 1.8 L/kg, respectively.',
        },
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized in the liver; O-desmethylvenlafaxine (ODV) is the only major active metabolite',
        populationContext: 'humans (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '017a84aa-0e1f-f560-e063-6294a90a9069',
          label: 'FDA label for venlafaxine tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Venlafaxine is well absorbed and extensively metabolized in the liver. O-desmethylvenlafaxine (ODV) is the only major active metabolite.',
        },
      },
      eliminationAsRecorded: {
        display:
          'Renal elimination of venlafaxine and its metabolites is the primary route of excretion',
        populationContext:
          'humans, single-dose mass balance studies (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '017a84aa-0e1f-f560-e063-6294a90a9069',
          label: 'FDA label for venlafaxine tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Approximately 87% of a venlafaxine dose is recovered in the urine within 48 hours as either unchanged venlafaxine (5%), unconjugated ODV (29%), conjugated ODV (26%), or other minor inactive metabolites (27%). Renal elimination of venlafaxine and its metabolites is the primary route of excretion.',
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(5),
    },
    productVariants: [
      {
        brandName: 'Venlafaxine',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded:
          'Tablets, USP equivalent to 37.5 mg of venlafaxine (the strength supplied in this label)',
        approvedUseAsRecorded: 'indicated for the treatment of major depressive disorder',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-02-04',
        source: {
          kind: 'FDA_LABEL',
          identifier: '017a84aa-0e1f-f560-e063-6294a90a9069',
          label: 'FDA label for venlafaxine tablets, How Supplied section',
          retrievedAt: '2026-08-27',
          excerpt:
            'HOW SUPPLIED Venlafaxine Tablets, USP equivalent to 37.5 mg of venlafaxine are peach-colored, round, flat, beveled-edged tablets with bisect on one side',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'Potentiation of neurotransmitter activity in the CNS; inhibition of neuronal serotonin and norepinephrine reuptake',
        source: {
          kind: 'FDA_LABEL',
          identifier: '017a84aa-0e1f-f560-e063-6294a90a9069',
          label: 'FDA label for venlafaxine tablets, Pharmacodynamics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mechanism of the antidepressant action of venlafaxine in humans is believed to be associated with its potentiation of neurotransmitter activity in the CNS. Preclinical studies have shown that venlafaxine and its active metabolite, O-desmethylvenlafaxine (ODV), are potent inhibitors of neuronal serotonin and norepinephrine reuptake and weak inhibitors of dopamine reuptake.',
        },
      },
    ],
  },

  'vitamin-d3': {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '5280795',
      casNumber: '67-97-0',
      rxcui: '2418',
      source: {
        kind: 'PUBCHEM',
        identifier: '5280795',
        label:
          'PubChem compound record for cholecalciferol, with the RxNorm identifier from the same fetched artifact',
        retrievedAt: '2026-08-27',
      },
    },
  },

  warfarin: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '54678486',
      casNumber: '81-81-2',
      unii: '6153CWM0CL',
      rxcui: '11289',
      source: {
        kind: 'PUBCHEM',
        identifier: '54678486',
        label:
          'PubChem compound record for warfarin, with the RxNorm identifier and the openFDA UNII for warfarin sodium from the same fetched artifact',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      tMax: {
        display: 'within the first 4 hours',
        numeric: 4,
        unit: 'hours',
        populationContext: 'oral administration (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0cbce382-9c88-4f58-ae0f-532a841e8f95',
          label: 'FDA label for warfarin sodium tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Absorption Warfarin is essentially completely absorbed after oral administration, with peak concentration generally attained within the first 4 hours.',
        },
      },
      volumeOfDistribution: {
        display: 'about 0.14 L/kg',
        numeric: 0.14,
        unit: 'L/kg',
        populationContext: 'adults (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0cbce382-9c88-4f58-ae0f-532a841e8f95',
          label: 'FDA label for warfarin sodium tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Distribution Warfarin shows a volume of distribution of about 0.14 L/kg. Approximately 99% of the drug is bound to plasma proteins.',
        },
      },
      proteinBinding: {
        display: 'approximately 99%',
        numeric: 99,
        unit: '%',
        populationContext: 'plasma proteins (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0cbce382-9c88-4f58-ae0f-532a841e8f95',
          label: 'FDA label for warfarin sodium tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Distribution Warfarin shows a volume of distribution of about 0.14 L/kg. Approximately 99% of the drug is bound to plasma proteins.',
        },
      },
      halfLife: {
        display: 'effective half-life 20 to 60 hours, mean about 40 hours',
        numeric: 40,
        unit: 'hours',
        populationContext: 'adults after a single dose (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0cbce382-9c88-4f58-ae0f-532a841e8f95',
          label: 'FDA label for warfarin sodium tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'The terminal half-life of warfarin after a single dose is approximately 1 week; however, the effective half-life ranges from 20 to 60 hours, with a mean of about 40 hours.',
        },
      },
      metabolismAsRecorded: {
        display:
          'Stereoselectively metabolized by hepatic CYP450 enzymes to inactive hydroxylated metabolites',
        populationContext: 'humans (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0cbce382-9c88-4f58-ae0f-532a841e8f95',
          label: 'FDA label for warfarin sodium tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Warfarin is stereoselectively metabolized by hepatic cytochrome P-450 (CYP450) microsomal enzymes to inactive hydroxylated metabolites (predominant route) and by reductases to reduced metabolites (warfarin alcohols) with minimal anticoagulant activity.',
        },
      },
      eliminationAsRecorded: {
        display: 'Recovered in urine in the form of metabolites; very little excreted unchanged',
        populationContext: 'humans, radiolabeled-drug studies (as recorded in the FDA label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0cbce382-9c88-4f58-ae0f-532a841e8f95',
          label: 'FDA label for warfarin sodium tablets, Pharmacokinetics section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Studies with radiolabeled drug have demonstrated that up to 92% of the orally administered dose is recovered in urine. Very little warfarin is excreted unchanged in urine. Urinary excretion is in the form of metabolites.',
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(40),
    },
    productVariants: [
      {
        brandName: 'Warfarin Sodium',
        formAsRecorded: 'Scored tablets',
        strengthsAsRecorded: 'Scored tablets: 1, 2, 2.5, 3, 4, 5, 6, 7.5, or 10 mg',
        approvedUseAsRecorded:
          'Prophylaxis and treatment of venous thrombosis and its extension, pulmonary embolism (PE); prophylaxis and treatment of thromboembolic complications associated with atrial fibrillation (AF) and/or cardiac valve replacement',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-06-17',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0cbce382-9c88-4f58-ae0f-532a841e8f95',
          label: 'FDA label for warfarin sodium tablets, Dosage Forms and Strengths section',
          retrievedAt: '2026-08-27',
          excerpt: 'Scored tablets: 1, 2, 2.5, 3, 4, 5, 6, 7.5, or 10 mg ( 3 )',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'blood-vessels',
        actionAsRecorded:
          'Inhibits the synthesis of vitamin K-dependent clotting factors (Factors II, VII, IX, and X) and the anticoagulant proteins C and S',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0cbce382-9c88-4f58-ae0f-532a841e8f95',
          label: 'FDA label for warfarin sodium tablets, Mechanism of Action section',
          retrievedAt: '2026-08-27',
          excerpt:
            'Warfarin acts by inhibiting the synthesis of vitamin K-dependent clotting factors, which include Factors II, VII, IX, and X, and the anticoagulant proteins C and S.',
        },
      },
    ],
  },
}
