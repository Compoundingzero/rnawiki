import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import type { BackgroundSource } from '@/lib/background/types'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 17: tamsulosin, taurine, terbinafine, trastuzumab, ustekinumab.
 *
 * Honest omissions in this batch:
 * - tamsulosin: no derived steady-state note is recorded. The fetched label states steady state
 *   directly ("achievement of steady-state concentrations by the fifth day of once-a-day dosing"),
 *   and the five-half-lives derivation from the recorded half-life would print a different figure,
 *   so the derived sentence is left out rather than shown against the source that was read.
 * - taurine: the only openFDA label matched for the generic name TAURINE is an oral-drops product
 *   whose recorded indication is "temporary relief of liver congestion, nervous anxiety,
 *   irritability, and inability to sleep", with no pharmacokinetics section, no stated strength and
 *   no approved-use framing. It is not a usable source for any background module, so registry
 *   identifiers from PubChem are the whole entry. A PubMed search for human taurine
 *   pharmacokinetics returned only records where taurine appears as a conjugate of another
 *   medicine, so no supplementary pharmacokinetic value is recorded either.
 * - terbinafine: no titration module — the label states a fixed course (one 250 mg tablet once
 *   daily for 6 or 12 weeks), not a stepwise escalation or loading schedule. The label's separate
 *   terminal half-life of 200 to 400 hours is described in the recorded half-life's population
 *   context without repeating its numbers, because the recorded figure is the effective half-life.
 * - trastuzumab: no PubChem record exists for the antibody, so registry identifiers are the RxNorm
 *   concept id. The label states no half-life, bioavailability, protein binding or volume of
 *   distribution, so pharmacokinetics carries only the recorded elimination behaviour. No anatomy
 *   targets are recorded: the controlled vocabulary has no breast region, and the label's mechanism
 *   is stated at the level of the HER2 receptor on tumour cells rather than any organ or system.
 * - ustekinumab: no PubChem record exists for the antibody, so registry identifiers are the RxNorm
 *   concept id. The label states the half-life only in days, so it is recorded display-only and
 *   carries no derived steady-state note. Only two anatomy targets are recorded; the label
 *   discusses Crohn's disease and ulcerative colitis but never names the intestine itself, so no
 *   intestinal target is recorded.
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

const TAMSULOSIN_LABEL = '00097e78-9c04-4e62-8260-ddb50e9a6a93'
const TERBINAFINE_LABEL = '085e0809-6b7f-447e-976e-8276c29daad6'
const TRASTUZUMAB_LABEL = '492dbdb2-077e-4064-bff3-372d6af0a7a2'
const USTEKINUMAB_LABEL = 'c77a9664-e3bb-4023-b400-127aa53bca2b'

export const BACKGROUND_BATCH_17: RecordedBackgroundBySlug = {
  tamsulosin: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '129211',
      casNumber: '106133-20-4',
      unii: '11SV1951MR',
      rxcui: '236495',
      source: {
        kind: 'PUBCHEM',
        identifier: '129211',
        label: "PubChem compound record matched for 'tamsulosin'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (capsules)',
      bioavailability: {
        display: 'essentially complete (>90%)',
        numeric: 90,
        unit: '%',
        populationContext:
          'absorption from the 0.4 mg capsules following oral administration under fasting conditions',
        source: fdaLabel(
          TAMSULOSIN_LABEL,
          'FDA label for tamsulosin hydrochloride capsules (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Absorption of tamsulosin hydrochloride from tamsulosin hydrochloride capsules 0.4 mg is essentially complete (>90%) following oral administration under fasting conditions.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '4 to 5 hours under fasting conditions; 6 to 7 hours with food',
        numeric: 4.5,
        unit: 'hours',
        populationContext:
          'time to maximum concentration after oral administration, fasted and fed, as recorded in the label',
        source: fdaLabel(
          TAMSULOSIN_LABEL,
          'FDA label for tamsulosin hydrochloride capsules (openFDA)',
          'clinical_pharmacology 12.3 Effect of Food',
          'The time to maximum concentration (T max ) is reached by 4 to 5 hours under fasting conditions and by 6 to 7 hours when tamsulosin hydrochloride capsules are administered with food.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display:
          'approximately 9 to 13 hours in healthy volunteers and 14 to 15 hours in the target population',
        numeric: 14,
        unit: 'hours',
        populationContext:
          'apparent half-life of the capsules; the recorded representative figure is the lower bound in the target population (men with benign prostatic hyperplasia)',
        source: fdaLabel(
          TAMSULOSIN_LABEL,
          'FDA label for tamsulosin hydrochloride capsules (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Because of absorption rate-controlled pharmacokinetics with tamsulosin hydrochloride capsules, the apparent half-life of tamsulosin hydrochloride is approximately 9 to 13 hours in healthy volunteers and 14 to 15 hours in the target population.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '94% to 99%',
        numeric: 96.5,
        unit: '%',
        populationContext:
          'binding to human plasma proteins, primarily alpha 1 acid glycoprotein, as recorded in the label',
        source: fdaLabel(
          TAMSULOSIN_LABEL,
          'FDA label for tamsulosin hydrochloride capsules (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Tamsulosin hydrochloride is extensively bound to human plasma proteins (94% to 99%), primarily alpha 1 acid glycoprotein (AAG), with linear binding over a wide concentration range (20 to 600 ng/mL).',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '16 L',
        numeric: 16,
        unit: 'L',
        populationContext:
          'mean steady-state apparent volume of distribution after intravenous administration to 10 healthy male adults',
        source: fdaLabel(
          TAMSULOSIN_LABEL,
          'FDA label for tamsulosin hydrochloride capsules (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The mean steady-state apparent volume of distribution of tamsulosin hydrochloride after intravenous administration to 10 healthy male adults was 16 L, which is suggestive of distribution into extracellular fluids in the body.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized by cytochrome P450 enzymes in the liver, mainly by CYP3A4 and CYP2D6; less than 10% of the dose is excreted in urine unchanged',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          TAMSULOSIN_LABEL,
          'FDA label for tamsulosin hydrochloride capsules (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Tamsulosin hydrochloride is extensively metabolized by cytochrome P450 enzymes in the liver and less than 10% of the dose is excreted in urine unchanged. However, the pharmacokinetic profile of the metabolites in humans has not been established. Tamsulosin is extensively metabolized, mainly by CYP3A4 and CYP2D6 as well as via some minor participation of other CYP isoenzymes.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Of a radiolabeled dose, 97% of the administered radioactivity was recovered, with urine (76%) the primary route of excretion compared to feces (21%) over 168 hours',
        populationContext: 'four healthy volunteers given a radiolabeled dose',
        source: fdaLabel(
          TAMSULOSIN_LABEL,
          'FDA label for tamsulosin hydrochloride capsules (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'On administration of the radiolabeled dose of tamsulosin hydrochloride to 4 healthy volunteers, 97% of the administered radioactivity was recovered, with urine (76%) representing the primary route of excretion compared to feces (21%) over 168 hours.',
        ),
        concordance: 'label_only',
      },
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Recorded starting amount',
          amountAsRecorded:
            '0.4 mg once daily taken approximately one-half hour following the same meal each day',
        },
        {
          order: 2,
          periodAsRecorded: 'After 2 to 4 weeks of dosing, for those who fail to respond to 0.4 mg',
          amountAsRecorded: 'Can be increased to 0.8 mg once daily',
        },
      ],
      source: fdaLabel(
        TAMSULOSIN_LABEL,
        'FDA label for tamsulosin hydrochloride capsules (openFDA)',
        'dosage_and_administration 2',
        '0.4 mg once daily taken approximately one-half hour following the same meal each day. Tamsulosin hydrochloride capsules should not be crushed, chewed or opened. (2) Can be increased to 0.8 mg once daily for patients who fail to respond to the 0.4 mg dose after 2 to 4 weeks of dosing (2)',
      ),
    },
    productVariants: [
      {
        brandName: 'Tamsulosin Hydrochloride',
        formAsRecorded: 'Hard gelatin capsules',
        strengthsAsRecorded: 'Capsule: 0.4 mg',
        approvedUseAsRecorded:
          'Treatment of the signs and symptoms of benign prostatic hyperplasia (BPH); the label records that the capsules are not indicated for the treatment of hypertension',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-01-01',
        source: fdaLabel(
          TAMSULOSIN_LABEL,
          'FDA label for tamsulosin hydrochloride capsules (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Tamsulosin hydrochloride capsules are indicated for the treatment of the signs and symptoms of benign prostatic hyperplasia (BPH) [see Clinical Studies (14)]. Tamsulosin hydrochloride capsules are not indicated for the treatment of hypertension.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'pelvic-organs',
        actionAsRecorded:
          'An alpha 1 adrenoceptor blocking agent that exhibits selectivity for alpha 1 receptors in the human prostate, most of which are of the alpha 1A subtype',
        source: fdaLabel(
          TAMSULOSIN_LABEL,
          'FDA label for tamsulosin hydrochloride capsules (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Tamsulosin, an alpha 1 adrenoceptor blocking agent, exhibits selectivity for alpha 1 receptors in the human prostate. At least three discrete alpha 1 adrenoceptor subtypes have been identified: alpha 1A , alpha 1B , and alpha 1D ; their distribution differs between human organs and tissue. Approximately 70% of the alpha 1 receptors in the human prostate are of the alpha 1A subtype.',
        ),
      },
      {
        regionCode: 'bladder',
        actionAsRecorded:
          'Blockade of alpha 1 adrenoceptors abundant in the prostatic urethra and bladder neck can cause smooth muscles in the bladder neck and prostate to relax, improving urine flow rate',
        source: fdaLabel(
          TAMSULOSIN_LABEL,
          'FDA label for tamsulosin hydrochloride capsules (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Smooth muscle tone is mediated by the sympathetic nervous stimulation of alpha 1 adrenoceptors, which are abundant in the prostate, prostatic capsule, prostatic urethra, and bladder neck. Blockade of these adrenoceptors can cause smooth muscles in the bladder neck and prostate to relax, resulting in an improvement in urine flow rate and a reduction in symptoms of BPH.',
        ),
      },
    ],
  },

  taurine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '1123',
      casNumber: '107-35-7',
      rxcui: '10337',
      source: {
        kind: 'PUBCHEM',
        identifier: '1123',
        label: "PubChem compound record matched for 'taurine'",
        retrievedAt: FETCHED,
      },
    },
  },

  terbinafine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '1549008',
      casNumber: '91161-71-6',
      unii: '012C11ZU6G',
      rxcui: '235838',
      source: {
        kind: 'PUBCHEM',
        identifier: '1549008',
        label: "PubChem compound record matched for 'terbinafine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      bioavailability: {
        display:
          'approximately 40% (well absorbed, greater than 70%, before first-pass metabolism)',
        numeric: 40,
        unit: '%',
        populationContext: 'bioavailability of the tablets following oral administration',
        source: fdaLabel(
          TERBINAFINE_LABEL,
          'FDA label for terbinafine tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Following oral administration, terbinafine is well absorbed (greater than 70%) and the bioavailability of terbinafine tablets as a result of first-pass metabolism is approximately 40%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'within 2 hours after a single 250 mg dose',
        numeric: 2,
        unit: 'hours',
        populationContext: 'appearance of peak plasma concentrations after a single oral dose',
        source: fdaLabel(
          TERBINAFINE_LABEL,
          'FDA label for terbinafine tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Peak plasma concentrations of 1 mcg/mL appear within 2 hours after a single 250 mg dose; the AUC is approximately 4.56 mcg•h/mL.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'effective half-life of ~36 hours',
        numeric: 36,
        unit: 'hours',
        populationContext:
          'effective half-life inferred at steady state from the rise in plasma AUC; the label separately records a much longer terminal half-life attributed to slow release from tissues such as skin and adipose',
        source: fdaLabel(
          TERBINAFINE_LABEL,
          'FDA label for terbinafine tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'At steady-state, in comparison to a single dose, the peak concentration of terbinafine is 25% higher and plasma AUC increases by a factor of 2.5; the increase in plasma AUC is consistent with an effective half-life of ~36 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'greater than 99%',
        numeric: 99,
        unit: '%',
        populationContext:
          'binding to plasma proteins, with no specific binding sites, as recorded in the label',
        source: fdaLabel(
          TERBINAFINE_LABEL,
          'FDA label for terbinafine tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'In plasma, terbinafine is greater than 99% bound to plasma proteins and there are no specific binding sites.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized by at least 7 CYP isoenzymes with major contributions from CYP2C9, CYP1A2, CYP3A4, CYP2C8, and CYP2C19',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          TERBINAFINE_LABEL,
          'FDA label for terbinafine tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Prior to excretion, terbinafine is extensively metabolized by at least 7 CYP isoenzymes with major contributions from CYP2C9, CYP1A2, CYP3A4, CYP2C8, and CYP2C19. No metabolites have been identified that have antifungal activity similar to terbinafine.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Approximately 70% of the administered dose is eliminated in the urine; in renal impairment or hepatic cirrhosis, clearance is decreased by approximately 50%',
        populationContext:
          'human excretion data, with the reduced-clearance figure recorded for patients with renal impairment or hepatic cirrhosis compared to normal volunteers',
        source: fdaLabel(
          TERBINAFINE_LABEL,
          'FDA label for terbinafine tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Approximately 70% of the administered dose is eliminated in the urine. In patients with renal impairment (creatinine clearance less than or equal to 50 mL/min) or hepatic cirrhosis, the clearance of terbinafine is decreased by approximately 50% compared to normal volunteers.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(36),
    },
    productVariants: [
      {
        brandName: 'Terbinafine',
        formAsRecorded: 'Uncoated tablets',
        strengthsAsRecorded: 'Tablet, 250 mg',
        approvedUseAsRecorded:
          'Treatment of onychomycosis of the toenail or fingernail due to dermatophytes (tinea unguium)',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-09-30',
        source: fdaLabel(
          TERBINAFINE_LABEL,
          'FDA label for terbinafine tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Terbinafine tablets are indicated for the treatment of onychomycosis of the toenail or fingernail due to dermatophytes (tinea unguium).',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'skin',
        actionAsRecorded:
          'Distributed to the sebum and skin, with a long terminal half-life that may represent slow elimination from tissues such as skin and adipose',
        source: fdaLabel(
          TERBINAFINE_LABEL,
          'FDA label for terbinafine tablets (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Terbinafine is distributed to the sebum and skin. A terminal half-life of 200 to 400 hours may represent the slow elimination of terbinafine from tissues such as skin and adipose.',
        ),
      },
    ],
  },

  trastuzumab: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      rxcui: '224905',
      source: {
        kind: 'RXNORM',
        identifier: '224905',
        label: "RxNorm concept matched for 'trastuzumab' (no PubChem compound record exists)",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Intravenous infusion',
      eliminationAsRecorded: {
        display:
          'Following discontinuation, concentrations in at least 95% of patients decrease to approximately 3% of the population predicted steady-state trough serum concentration (approximately 97% washout) by 7 months',
        populationContext:
          'breast cancer and metastatic gastric cancer patients in a pooled population pharmacokinetic model analysis, simulated after discontinuation of intravenous Herceptin',
        source: fdaLabel(
          TRASTUZUMAB_LABEL,
          'FDA label for HERCEPTIN (trastuzumab) for injection (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Population PK based simulations indicate that following discontinuation of Herceptin, concentrations in at least 95% of breast cancer and MGC patients will decrease to approximately 3% of the population predicted steady-state trough serum concentration (approximately 97% washout) by 7 months',
        ),
        concordance: 'label_only',
      },
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded:
            'Initial dose, as a single agent within three weeks following completion of multi-modality, anthracycline-based chemotherapy regimens (adjuvant breast cancer)',
          amountAsRecorded: '8 mg/kg as an intravenous infusion over 90 minutes',
        },
        {
          order: 2,
          periodAsRecorded: 'Subsequent doses',
          amountAsRecorded:
            '6 mg/kg as an intravenous infusion over 30–90 minutes every three weeks',
        },
      ],
      source: fdaLabel(
        TRASTUZUMAB_LABEL,
        'FDA label for HERCEPTIN (trastuzumab) for injection (openFDA)',
        'dosage_and_administration 2.3 Recommended Dosage, Adjuvant Treatment of Breast Cancer',
        'As a single agent within three weeks following completion of multi-modality, anthracycline-based chemotherapy regimens: Initial dose at 8 mg/kg as an intravenous infusion over 90 minutes Subsequent doses at 6 mg/kg as an intravenous infusion over 30–90 minutes every three weeks.',
      ),
    },
    productVariants: [
      {
        brandName: 'Herceptin',
        formAsRecorded:
          'For injection: lyophilized powder in a single-dose vial for reconstitution',
        strengthsAsRecorded: 'For injection: 150 mg per single-dose vial',
        approvedUseAsRecorded:
          'Treatment of HER2-overexpressing breast cancer in adults, and treatment of HER2-overexpressing metastatic gastric or gastroesophageal junction adenocarcinoma, with patients selected by an FDA-authorized companion diagnostic',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-05-29',
        source: fdaLabel(
          TRASTUZUMAB_LABEL,
          'FDA label for HERCEPTIN (trastuzumab) for injection (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Herceptin is a HER2/neu receptor antagonist indicated in adults for: The treatment of HER2-overexpressing breast cancer. ( 1.1 , 1.2 ) The treatment of HER2-overexpressing metastatic gastric or gastroesophageal junction adenocarcinoma. ( 1.3 )',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT00045032',
      includedAsRecorded: [
        'Non-metastatic primary invasive breast cancer overexpressing HER2 (determined by immunohistochemistry 3+ or positive fluorescence in situ hybridization test) that has been histologically confirmed, adequately excised, axillary node positive or negative, and tumor size at least T1c according to Tumor/Node/Metastasis (TNM) staging',
        'Completion of at least 4 cycles of (neo-)adjuvant systemic chemotherapy, definitive surgery, and radiotherapy, if applicable',
        'Known hormone receptor status',
        'Baseline left ventricular ejection fraction (LVEF) greater than or equal to 55 percent',
      ],
      excludedAsRecorded: [
        'Prior invasive breast carcinoma',
        'Other malignancies except for curatively treated basal and squamous cell carcinoma of the skin or in situ carcinoma of the cervix',
        'Clinical T4 tumors',
        'Cumulative doxorubicin exposure greater than 360 milligrams per meter-squared, or epirubicin greater than 720 mg/m^2, or any prior anthracyclines unrelated to the present breast cancer',
        'Prior anti-HER2 therapy for any other reason or other prior biologic or immunotherapy for breast cancer',
        'Serious cardiac or pulmonary conditions/illness, or any other conditions that could interfere with planned treatment',
        'Poor hematologic, hepatic, or renal function',
        'Pregnancy or lactation',
      ],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT00045032',
        label:
          'ClinicalTrials.gov record for the HERA trial (Herceptin in HER2-positive primary breast cancer)',
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: FETCHED,
        excerpt:
          'Non-metastatic primary invasive breast cancer overexpressing HER2 (determined by immunohistochemistry 3+ or positive fluorescence in situ hybridization test) that has been histologically confirmed, adequately excised, axillary node positive or negative, and tumor size at least T1c according to Tumor/Node/Metastasis (TNM) staging',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT00045032',
        endpointAsRecorded:
          'Percentage of participants with a disease-free survival event (loco-regional or distant recurrence, contralateral breast cancer, a second non-breast malignancy, or death from any cause) in the Herceptin one-year arm compared with the observation arm: primary outcome',
        activeResultAsRecorded: 'Herceptin one-year arm: 7.5% of participants',
        comparatorResultAsRecorded: 'Observation arm: 12.9% of participants',
        differenceAsRecorded: 'Hazard ratio 0.54 for the Herceptin arm versus the observation arm',
        uncertaintyAsRecorded: '95% CI 0.44 to 0.67; p<0.0001 (Log Rank)',
        timepointAsRecorded: 'From baseline until time of event (median of one year)',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT00045032',
          label: 'ClinicalTrials.gov posted results for the HERA trial',
          locator: 'resultsSection.outcomeMeasuresModule, first primary outcome',
          retrievedAt: FETCHED,
          excerpt:
            '12.9"},{"groupId":"OG001","value":"7.5"}]}]}],"analyses":[{"groupIds":["OG000","OG001"],"nonInferiorityType":"SUPERIORITY_OR_OTHER","pValue":"<0.0001","statisticalMethod":"Log Rank"},{"groupIds":["OG000","OG001"],"nonInferiorityType":"SUPERIORITY_OR_OTHER","paramType":"Hazard Ratio (HR)","paramValue":"0.54","ciPctValue":"95","ciNumSides":"TWO_SIDED","ciLowerLimit":"0.44","ciUpperLimit":"0.67"',
        },
      },
    ],
  },

  ustekinumab: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      rxcui: '847083',
      source: {
        kind: 'RXNORM',
        identifier: '847083',
        label: "RxNorm concept matched for 'ustekinumab' (no PubChem compound record exists)",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded:
        'Subcutaneous injection (intravenous infusion for the initial dose in Crohn’s disease and ulcerative colitis)',
      tMax: {
        display: '13.5 days after a single 45 mg dose and 7 days after a single 90 mg dose',
        numeric: 13.5,
        unit: 'days',
        populationContext:
          'adult subjects with plaque psoriasis, median time to maximum serum concentration after a single subcutaneous administration',
        source: fdaLabel(
          USTEKINUMAB_LABEL,
          'FDA label for STELARA (ustekinumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'In adult subjects with plaque psoriasis, the median time to reach the maximum serum concentration (T max ) was 13.5 days and 7 days, respectively, after a single subcutaneous administration of 45 mg (N=22) and 90 mg (N=24) of ustekinumab.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'mean half-life ranged from 14.9 ± 4.6 to 45.6 ± 80.2 days',
        populationContext:
          'subjects with plaque psoriasis following subcutaneous administration, across all trials; recorded display-only because the label states the value in days',
        source: fdaLabel(
          USTEKINUMAB_LABEL,
          'FDA label for STELARA (ustekinumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'The mean (±SD) half-life ranged from 14.9 ± 4.6 to 45.6 ± 80.2 days across all trials in subjects with plaque psoriasis following subcutaneous administration.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display:
          'central compartment 2.7 L (95% CI: 2.69, 2.78) in Crohn’s disease and 3.0 L (95% CI: 2.96, 3.07) in ulcerative colitis',
        numeric: 2.7,
        unit: 'L',
        populationContext:
          'population pharmacokinetic analyses in subjects with Crohn’s disease and with ulcerative colitis',
        source: fdaLabel(
          USTEKINUMAB_LABEL,
          'FDA label for STELARA (ustekinumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          "Population pharmacokinetic analyses showed that the volume of distribution of ustekinumab in the central compartment was 2.7 L (95% CI: 2.69, 2.78) in subjects with Crohn's disease and 3.0 L (95% CI: 2.96, 3.07) in subjects with ulcerative colitis.",
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'The metabolic pathway has not been characterized; as a human IgG1κ monoclonal antibody, ustekinumab is expected to be degraded into small peptides and amino acids via catabolic pathways in the same manner as endogenous IgG',
        populationContext: 'expected degradation pathway, as recorded in the label',
        source: fdaLabel(
          USTEKINUMAB_LABEL,
          'FDA label for STELARA (ustekinumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'The metabolic pathway of ustekinumab has not been characterized. As a human IgG1κ monoclonal antibody, ustekinumab is expected to be degraded into small peptides and amino acids via catabolic pathways in the same manner as endogenous IgG.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Clearance 0.19 L/day (95% CI: 0.185, 0.197) in Crohn’s disease and 0.19 L/day (95% CI: 0.179, 0.192) in ulcerative colitis, with an estimated median terminal half-life of approximately 19 days',
        populationContext:
          'population pharmacokinetic analyses in subjects with Crohn’s disease and with ulcerative colitis',
        source: fdaLabel(
          USTEKINUMAB_LABEL,
          'FDA label for STELARA (ustekinumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          "Population pharmacokinetic analyses showed that the clearance of ustekinumab was 0.19 L/day (95% CI: 0.185, 0.197) in subjects with Crohn's disease and 0.19 L/day (95% CI: 0.179, 0.192) in subjects with ulcerative colitis with an estimated median terminal half-life of approximately 19 days for both IBD (Crohn's disease and ulcerative colitis) populations.",
        ),
        concordance: 'label_only',
      },
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded:
            'Initially and 4 weeks later — adults with plaque psoriasis weighing 100 kg or less',
          amountAsRecorded: '45 mg subcutaneously',
        },
        {
          order: 2,
          periodAsRecorded: 'Thereafter — adults with plaque psoriasis weighing 100 kg or less',
          amountAsRecorded: '45 mg every 12 weeks',
        },
        {
          order: 3,
          periodAsRecorded:
            'Initially and 4 weeks later — adults with plaque psoriasis weighing more than 100 kg',
          amountAsRecorded: '90 mg subcutaneously',
        },
        {
          order: 4,
          periodAsRecorded: 'Thereafter — adults with plaque psoriasis weighing more than 100 kg',
          amountAsRecorded: '90 mg every 12 weeks',
        },
      ],
      source: fdaLabel(
        USTEKINUMAB_LABEL,
        'FDA label for STELARA (ustekinumab) injection (openFDA)',
        'dosage_and_administration 2.1 Recommended Dosage in Plaque Psoriasis',
        '2.1 Recommended Dosage in Plaque Psoriasis Subcutaneous Adult Dosage Regimen For patients weighing 100 kg or less, the recommended dosage is 45 mg initially and 4 weeks later, followed by 45 mg every 12 weeks. For patients weighing more than 100 kg, the recommended dosage is 90 mg initially and 4 weeks later, followed by 90 mg every 12 weeks.',
      ),
    },
    productVariants: [
      {
        brandName: 'Stelara',
        formAsRecorded:
          'Injection: solution in a single-dose prefilled syringe or single-dose vial (subcutaneous), and solution in a single-dose vial (intravenous infusion)',
        strengthsAsRecorded:
          'Subcutaneous: 45 mg/0.5 mL or 90 mg/mL prefilled syringe, 45 mg/0.5 mL vial. Intravenous: 130 mg/26 mL (5 mg/mL) vial',
        approvedUseAsRecorded:
          'Treatment of moderate to severe plaque psoriasis in adult and pediatric patients 6 years of age and older who are candidates for phototherapy or systemic therapy, and active psoriatic arthritis in adults and pediatric patients 6 years of age and older; the label also records moderately to severely active Crohn’s disease and ulcerative colitis',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-07-21',
        source: fdaLabel(
          USTEKINUMAB_LABEL,
          'FDA label for STELARA (ustekinumab) injection (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'STELARA is a human interleukin-12 and -23 antagonist indicated for the treatment of: Moderate to severe plaque psoriasis in adult and pediatric patients 6 years of age and older who are candidates for phototherapy or systemic therapy. ( 1.1 ) Active psoriatic arthritis in adults and pediatric patients 6 years of age and older. ( 1.2 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'immune-lymph',
        actionAsRecorded:
          'Binds the p40 protein subunit shared by the IL-12 and IL-23 cytokines, which are involved in inflammatory and immune responses such as natural killer cell activation and CD4+ T-cell differentiation and activation',
        source: fdaLabel(
          USTEKINUMAB_LABEL,
          'FDA label for STELARA (ustekinumab) injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Ustekinumab is a human IgG1қ monoclonal antibody that binds with specificity to the p40 protein subunit used by both the IL-12 and IL-23 cytokines. IL-12 and IL-23 are naturally occurring cytokines that are involved in inflammatory and immune responses, such as natural killer cell activation and CD4+ T-cell differentiation and activation.',
        ),
      },
      {
        regionCode: 'skin',
        actionAsRecorded:
          'In a small exploratory trial, a decrease was observed in the expression of mRNA of its molecular targets IL-12 and IL-23 in lesional skin biopsies of subjects with plaque psoriasis',
        source: fdaLabel(
          USTEKINUMAB_LABEL,
          'FDA label for STELARA (ustekinumab) injection (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics, Plaque Psoriasis',
          'In a small exploratory trial, a decrease was observed in the expression of mRNA of its molecular targets IL-12 and IL-23 in lesional skin biopsies measured at baseline and up to two weeks post-treatment in subjects with plaque psoriasis.',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT01369329',
      includedAsRecorded: [
        "Have Crohn's disease of at least 3 months' duration with colitis, ileitis, or ileocolitis, confirmed at some time in the past by radiography, histology, or endoscopy",
        "Have active Crohn's disease, defined as a baseline Crohn's Disease Activity Index (CDAI) score of greater than or equal to 220 and less than or equal to 450",
        'Have received infliximab, adalimumab, or certolizumab pegol at a dose approved for the treatment of Crohn disease and did not respond initially (ie, primary nonresponse), or responded initially but then lost response with continued therapy (ie, secondary nonresponse), or were intolerant to the medication',
        'Have screening laboratory test results within protocol-specified parameters',
      ],
      excludedAsRecorded: [
        'Patients who have had any kind of bowel resection within 6 months',
        'Are pregnant or planning pregnancy (both men and women) while enrolled in the study or for 20 weeks after receiving study agent',
        'Patients who have received infliximab, adalimumab or certolizumab pegol less than or equal to 8 weeks before the first administration of study drug',
        "Patients with certain complications of Crohn's disease that would make it hard to assess response to study drug",
        'Patients with a history of or ongoing chronic or recurrent infectious disease',
        'Patients who have previously received a biologic agent targeting IL-12 or IL-23, including but not limited to ustekinumab (CNTO 1275) or briakinumab (ABT-874)',
      ],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT01369329',
        label:
          "ClinicalTrials.gov record for UNITI-1 (ustekinumab induction therapy in Crohn's disease after failure of or intolerance to TNF antagonist therapy)",
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: FETCHED,
        excerpt:
          "Have Crohn's disease of at least 3 months' duration with colitis, ileitis, or ileocolitis, confirmed at some time in the past by radiography, histology, or endoscopy * Have active Crohn's disease, defined as a baseline Crohn's Disease Activity Index (CDAI) score of \\>= 220 and \\<= 450",
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT01369329',
        endpointAsRecorded:
          "Number of participants with clinical response at Week 6, defined as a reduction from baseline in the Crohn's Disease Activity Index score of at least 100 points: primary outcome, comparing a single intravenous ustekinumab 130 mg dose with placebo (a third group received a tiered dose of about 6 mg/kg and is not recorded here)",
        activeResultAsRecorded: 'Ustekinumab: 84 of 245 participants',
        comparatorResultAsRecorded: 'Placebo: 53 of 247 participants',
        uncertaintyAsRecorded: 'p=0.002 (Cochran-Mantel-Haenszel chi-square test)',
        timepointAsRecorded: 'Baseline and Week 6',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT01369329',
          label: 'ClinicalTrials.gov posted results for UNITI-1',
          locator: 'resultsSection.outcomeMeasuresModule, primary outcome',
          retrievedAt: FETCHED,
          excerpt:
            '"247"},{"groupId":"OG001","value":"245"},{"groupId":"OG002","value":"249"}]}],"classes":[{"categories":[{"measurements":[{"groupId":"OG000","value":"53"},{"groupId":"OG001","value":"84"},{"groupId":"OG002","value":"84"}]}]}],"analyses":[{"groupIds":["OG000","OG001"],"testedNonInferiority":false,"nonInferiorityType":"SUPERIORITY_OR_OTHER","pValue":"0.002"',
        },
      },
    ],
  },
}
