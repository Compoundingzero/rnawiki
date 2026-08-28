import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import type { BackgroundSource } from '@/lib/background/types'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 15: modafinil, nivolumab, oxybutynin, pembrolizumab, ranolazine, rituximab.
 *
 * Honest omissions in this batch:
 * - modafinil: the label states that absolute oral bioavailability "was not determined" because
 *   the compound could not be given intravenously, so no bioavailability value is recorded. The
 *   label's dosage section states one fixed amount per indication rather than a stepwise
 *   escalation, so no titration module is recorded.
 * - nivolumab, pembrolizumab, rituximab: these are antibodies with no PubChem compound record in
 *   the fetched artifact, so registry identity is recorded from the fetched label's own openFDA
 *   metadata (UNII and RxCUI). Their labels state the elimination half-life only in days, so each
 *   half-life is recorded display-only and no derived steady-state note is possible.
 * - nivolumab and pembrolizumab: the labels state no absorption, tMax, protein-binding or
 *   metabolism values for an intravenous antibody, so those fields are absent. Dosing is a fixed
 *   amount per indication rather than an escalation, so no titration module is recorded.
 * - rituximab: the fetched label reports pharmacokinetics separately by condition; the recorded
 *   half-life is the non-Hodgkin's lymphoma population figure and the recorded volume of
 *   distribution and clearance are the rheumatoid arthritis population figures, each carrying its
 *   own population context. No trial record was fetched for rituximab, so it has no applicability
 *   or pivotal-result module.
 * - oxybutynin: the label states relative — not absolute — bioavailability (156% and 187% versus
 *   oxybutynin), so that value is recorded display-only, without a parsed numeric that a
 *   percentage-of-dose range check would misread.
 * - ranolazine and oxybutynin: the label's own trial descriptions (CARISA, ERICA) are not tied to
 *   a fetched ClinicalTrials.gov record, so neither medicine carries an applicability or
 *   pivotal-result module.
 * - No cost module is recorded for any medicine in this batch.
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

const MODAFINIL_LABEL = '013450dd-cd42-46c7-98d6-9a2925761978'
const NIVOLUMAB_LABEL = 'f570b9c4-6846-4de2-abfa-4d0a4ae4e394'
const OXYBUTYNIN_LABEL = '02ff3be7-fc5c-4b91-8c67-ecdf6e19c42a'
const PEMBROLIZUMAB_LABEL = '9333c79b-d487-4538-a9f0-71b91a02b287'
const RANOLAZINE_LABEL = '00979fb3-d70f-493d-94ca-2914cbadaa9d'
const RITUXIMAB_LABEL = 'b172773b-3905-4a1c-ad95-bab4b6126563'

const MODAFINIL_LABEL_NAME = 'FDA label for modafinil tablets (openFDA)'
const NIVOLUMAB_LABEL_NAME = 'FDA label for OPDIVO (nivolumab) injection (openFDA)'
const OXYBUTYNIN_LABEL_NAME = 'FDA label for oxybutynin chloride extended-release tablets (openFDA)'
const PEMBROLIZUMAB_LABEL_NAME = 'FDA label for KEYTRUDA (pembrolizumab) injection (openFDA)'
const RANOLAZINE_LABEL_NAME = 'FDA label for ranolazine extended-release tablets (openFDA)'
const RITUXIMAB_LABEL_NAME = 'FDA label for RITUXAN (rituximab) injection (openFDA)'

/** Shared excerpt: the label states volume of distribution and protein binding in one passage. */
const MODAFINIL_DISTRIBUTION_EXCERPT =
  'Modafinil has an apparent volume of distribution of approximately 0.9 L/kg. In human plasma, in vitro , modafinil is moderately bound to plasma protein (approximately 60%), mainly to albumin. The potential for interactions of modafinil with highly protein-bound drugs is considered to be minimal.'

/** Shared excerpt: Table 2 of the oxybutynin label carries both T max and t 1/2. */
const OXYBUTYNIN_TABLE_2_EXCERPT =
  'Table 2: Mean (SD) R- and S-Oxybutynin Pharmacokinetic Parameters Following a Single Dose of Oxybutynin chloride extended-release tablets 10 mg (n=43) Parameters (units) R-Oxybutynin S-Oxybutynin C max (ng/mL) 1.0 (0.6) 1.8 (1.0) T max (h) 12.7 (5.4) 11.8 (5.3) t 1/2 (h) 13.2 (6.2) 12.4 (6.1)'

/** Shared excerpt: the rituximab label states clearance, volume and half-life for RA in one sentence. */
const RITUXIMAB_RA_EXCERPT =
  'Based on a population pharmacokinetic analysis of data from 2005 RA patients who received RITUXAN, the estimated clearance of rituximab was 0.335 L/day; volume of distribution was 3.1 L and mean terminal elimination half-life was 18.0 days (range, 5.17 to 77.5 days).'

export const BACKGROUND_BATCH_15: RecordedBackgroundBySlug = {
  modafinil: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '4236',
      casNumber: '68693-11-8',
      unii: 'R3UK8X3U3D',
      rxcui: '30125',
      source: {
        kind: 'PUBCHEM',
        identifier: '4236',
        label: "PubChem compound record matched for 'modafinil'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      tMax: {
        display: '2 to 4 hours',
        numeric: 3,
        unit: 'hours',
        populationContext: 'peak plasma concentrations after oral administration',
        source: fdaLabel(
          MODAFINIL_LABEL,
          MODAFINIL_LABEL_NAME,
          'clinical_pharmacology 12.3 Absorption',
          'Modafinil is readily absorbed after oral administration, with peak plasma concentrations occurring at 2 to 4 hours.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 15 hours',
        numeric: 15,
        unit: 'hours',
        populationContext: 'effective elimination half-life after multiple doses',
        source: fdaLabel(
          MODAFINIL_LABEL,
          MODAFINIL_LABEL_NAME,
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'The effective elimination half-life of modafinil after multiple doses is about 15 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 60%',
        numeric: 60,
        unit: '%',
        populationContext:
          'human plasma in vitro; moderate binding, mainly to albumin, as recorded in the label',
        source: fdaLabel(
          MODAFINIL_LABEL,
          MODAFINIL_LABEL_NAME,
          'clinical_pharmacology 12.3 Distribution',
          MODAFINIL_DISTRIBUTION_EXCERPT,
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 0.9 L/kg',
        numeric: 0.9,
        unit: 'L/kg',
        populationContext: 'apparent volume of distribution, as recorded in the label',
        source: fdaLabel(
          MODAFINIL_LABEL,
          MODAFINIL_LABEL_NAME,
          'clinical_pharmacology 12.3 Distribution',
          MODAFINIL_DISTRIBUTION_EXCERPT,
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'The major route of elimination is metabolism (approximately 90%), primarily by the liver, with subsequent renal elimination of the metabolites',
        populationContext: 'human pharmacokinetic data, as recorded in the label',
        source: fdaLabel(
          MODAFINIL_LABEL,
          MODAFINIL_LABEL_NAME,
          'clinical_pharmacology 12.3 Metabolism and Elimination',
          'The major route of elimination is metabolism (approximately 90%), primarily by the liver, with subsequent renal elimination of the metabolites. Urine alkalinization has no effect on the elimination of modafinil.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'In a clinical study using radiolabeled modafinil, a total of 81% of the administered radioactivity was recovered in 11 days post-dose, predominantly in the urine (80% vs. 1% in the feces)',
        populationContext: 'clinical study using radiolabeled modafinil, as recorded in the label',
        source: fdaLabel(
          MODAFINIL_LABEL,
          MODAFINIL_LABEL_NAME,
          'clinical_pharmacology 12.3 Metabolism and Elimination',
          'In a clinical study using radiolabeled modafinil, a total of 81% of the administered radioactivity was recovered in 11 days post-dose, predominantly in the urine (80% vs. 1% in the feces).',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(15),
    },
    productVariants: [
      {
        brandName: 'Modafinil',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: 'Tablets: 100 mg and 200 mg',
        approvedUseAsRecorded:
          'To improve wakefulness in adult patients with excessive sleepiness associated with narcolepsy, obstructive sleep apnea (OSA), or shift work disorder (SWD), with the label limitation of use recorded beside that indication for OSA',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-07-14',
        source: fdaLabel(
          MODAFINIL_LABEL,
          MODAFINIL_LABEL_NAME,
          'indications_and_usage; dosage_forms_and_strengths',
          'Modafinil tablets are indicated to improve wakefulness in adult patients with excessive sleepiness associated with narcolepsy, obstructive sleep apnea (OSA), or shift work disorder (SWD).',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'Binds to the dopamine transporter and inhibits dopamine reuptake in vitro; the label records that this has been associated in vivo with increased extracellular dopamine levels in some brain regions of animals, and states that the mechanism through which modafinil promotes wakefulness is unknown',
        source: fdaLabel(
          MODAFINIL_LABEL,
          MODAFINIL_LABEL_NAME,
          'clinical_pharmacology 12.1 Mechanism of Action',
          'However, in vitro , modafinil binds to the dopamine transporter and inhibits dopamine reuptake. This activity has been associated in vivo with increased extracellular dopamine levels in some brain regions of animals.',
        ),
      },
    ],
  },

  nivolumab: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      unii: '31YO63LBSN',
      rxcui: '1597876',
      source: fdaLabel(NIVOLUMAB_LABEL, NIVOLUMAB_LABEL_NAME, 'openFDA identity metadata'),
    },
    pharmacokinetics: {
      routeAsRecorded: 'Intravenous infusion',
      halfLife: {
        display: '25 days',
        populationContext:
          'population pharmacokinetic analysis in patients with solid tumors; geometric mean elimination half-life',
        source: fdaLabel(
          NIVOLUMAB_LABEL,
          NIVOLUMAB_LABEL_NAME,
          'clinical_pharmacology 12.3 Elimination',
          'The geometric mean elimination half-life (t 1/2 ) is 25 days (77.5%).',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '6.8 L',
        numeric: 6.8,
        unit: 'L',
        populationContext:
          'geometric mean volume of distribution at steady state, population pharmacokinetic analysis',
        source: fdaLabel(
          NIVOLUMAB_LABEL,
          NIVOLUMAB_LABEL_NAME,
          'clinical_pharmacology 12.3 Distribution',
          'The geometric mean volume of distribution at steady state (Vss) and coefficient of variation (CV%) is 6.8 L (27.3%).',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Geometric mean steady-state clearance 8.2 mL/h in patients with metastatic tumors; clearance decreases over time, which the label records as not clinically relevant',
        populationContext: 'patients with metastatic tumors, as recorded in the label',
        source: fdaLabel(
          NIVOLUMAB_LABEL,
          NIVOLUMAB_LABEL_NAME,
          'clinical_pharmacology 12.3 Elimination',
          'Nivolumab clearance (CL) decreases over time, with a mean maximal reduction from baseline values (CV%) of 24.5% (47.6%) resulting in a geometric mean steady-state clearance (CLss) (CV%) of 8.2 mL/h (53.9%) in patients with metastatic tumors; the decrease in CLss is not considered clinically relevant.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Opdivo',
        formAsRecorded: 'Injection: solution in a single-dose vial for intravenous use',
        strengthsAsRecorded:
          '40 mg/4 mL (10 mg/mL), 100 mg/10 mL (10 mg/mL), 120 mg/12 mL (10 mg/mL), and 240 mg/24 mL (10 mg/mL) solution in a single-dose vial',
        approvedUseAsRecorded:
          'A programmed death receptor-1 (PD-1)-blocking antibody indicated for the treatment of melanoma, non-small cell lung cancer, malignant pleural mesothelioma, renal cell carcinoma, classical Hodgkin lymphoma and the further tumour types listed in the label, alone or in the combinations the label names',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-05-12',
        source: fdaLabel(
          NIVOLUMAB_LABEL,
          NIVOLUMAB_LABEL_NAME,
          'indications_and_usage; dosage_forms_and_strengths',
          'OPDIVO is a programmed death receptor-1 (PD-1)-blocking antibody indicated for the treatment of: Melanoma • adult and pediatric (12 years and older) patients with unresectable or metastatic melanoma, as a single agent or in combination with ipilimumab. (1.1)',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'immune-lymph',
        actionAsRecorded:
          'Binds to the PD-1 receptor and blocks its interaction with PD-L1 and PD-L2, releasing PD-1 pathway-mediated inhibition of the immune response, including the anti-tumor immune response',
        source: fdaLabel(
          NIVOLUMAB_LABEL,
          NIVOLUMAB_LABEL_NAME,
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Nivolumab is a human immunoglobulin G4 (IgG4) monoclonal antibody that binds to the PD-1 receptor and blocks its interaction with PD-L1 and PD-L2, releasing PD-1 pathway-mediated inhibition of the immune response, including the anti-tumor immune response.',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT01642004',
      includedAsRecorded: [
        'Men and women ≥18 years of age',
        'Subjects with histologically or cytologically-documented squamous cell NSCLC who present with Stage IIIB/IV disease or with recurrent or progressive disease following multimodal therapy (radiation therapy, surgical resection or definitive chemoradiation therapy for locally advanced disease)',
        'Disease recurrence or progression during/after one prior platinum doublet-based chemotherapy regimen for advanced or metastatic disease',
        'Measurable disease by computed tomography (CT)/Magnetic resonance imaging (MRI) per Response Evaluation Criteria in Solid Tumors (RECIST) 1.1 criteria',
        'Eastern Cooperative Oncology Group (ECOG) performance status ≤1',
      ],
      excludedAsRecorded: [
        'Subjects with untreated central nervous system (CNS) metastases are excluded. Subjects are eligible if CNS metastases are treated and subjects are neurologically returned to baseline for at least 2 weeks prior to enrollment.',
        'Subjects with carcinomatous meningitis',
        'Subjects with active, known or suspected autoimmune disease',
        'Prior therapy with anti-Programmed death-1 (PD-1), anti-Programmed cell death ligand 1 (PD-L1), anti-Programmed cell death ligand 2 (PD-L2), anti-CD137, or anti-Cytotoxic T lymphocyte-associated antigen 4 (CTLA-4) antibody',
        'Prior treatment with Docetaxel',
        'Subjects with interstitial lung disease that is symptomatic or may interfere with the detection or management of suspected drug-related pulmonary toxicity',
      ],
      studiedGroupAsRecorded:
        'Minimum age 18 years; all sexes eligible, as recorded in the registry eligibility module',
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT01642004',
        label:
          'ClinicalTrials.gov record for CheckMate 017 (nivolumab versus docetaxel in previously treated advanced or metastatic squamous cell non-small cell lung cancer)',
        locator: 'protocolSection.eligibilityModule (minimumAge 18 Years; sex ALL)',
        retrievedAt: FETCHED,
        excerpt:
          '* Men and women ≥18 years of age * Subjects with histologically or cytologically-documented squamous cell NSCLC who present with Stage IIIB/IV disease or with recurrent or progressive disease following multimodal therapy (radiation therapy, surgical resection or definitive chemoradiation therapy for locally advanced disease)',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT01642004',
        endpointAsRecorded:
          'Overall Survival (OS) Time in Months for All Randomized Participants at Primary Endpoint (primary outcome measure): median overall survival in months, reported with a 95% confidence interval',
        activeResultAsRecorded: 'Nivolumab: 9.23 (7.33 to 13.27)',
        comparatorResultAsRecorded: 'Docetaxel: 6.01 (5.13 to 7.33)',
        timepointAsRecorded:
          'Randomization until 199 deaths, up to November 2014, approximately 25 months',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT01642004',
          label: 'ClinicalTrials.gov posted results for CheckMate 017',
          locator:
            'resultsSection.outcomeMeasuresModule, primary outcome "Overall Survival (OS) Time in Months for All Randomized Participants at Primary Endpoint"; timeFrame "Randomization until 199 deaths, up to November 2014, approximately 25 months"; groups OG000 = Nivolumab, OG001 = Docetaxel',
          retrievedAt: FETCHED,
          excerpt:
            '"measurements":[{"groupId":"OG000","value":"9.23","lowerLimit":"7.33","upperLimit":"13.27"},{"groupId":"OG001","value":"6.01","lowerLimit":"5.13","upperLimit":"7.33"}]',
        },
      },
    ],
  },

  oxybutynin: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '4634',
      casNumber: '5633-20-5',
      unii: 'L9F3D9RENQ',
      rxcui: '32675',
      source: {
        kind: 'PUBCHEM',
        identifier: '4634',
        label: "PubChem compound record matched for 'oxybutynin'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (extended-release tablets)',
      bioavailability: {
        display: '156% (R-oxybutynin) and 187% (S-oxybutynin)',
        populationContext:
          'relative bioavailability of the extended-release tablets compared with oxybutynin, as recorded in the label; this is a relative, not an absolute, figure',
        source: fdaLabel(
          OXYBUTYNIN_LABEL,
          OXYBUTYNIN_LABEL_NAME,
          'clinical_pharmacology 12.3 Absorption',
          'The relative bioavailabilities of R- and S-oxybutynin from Oxybutynin chloride extended-release tablets are 156% and 187%, respectively, compared with oxybutynin.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '12.7 hours (R-oxybutynin) and 11.8 hours (S-oxybutynin)',
        numeric: 12.7,
        unit: 'hours',
        populationContext:
          'mean T max after a single 10 mg dose of the extended-release tablets (n=43)',
        source: fdaLabel(
          OXYBUTYNIN_LABEL,
          OXYBUTYNIN_LABEL_NAME,
          'clinical_pharmacology 12.3 Table 2',
          OXYBUTYNIN_TABLE_2_EXCERPT,
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '13.2 hours (R-oxybutynin) and 12.4 hours (S-oxybutynin)',
        numeric: 13.2,
        unit: 'hours',
        populationContext:
          'mean t 1/2 after a single 10 mg dose of the extended-release tablets (n=43)',
        source: fdaLabel(
          OXYBUTYNIN_LABEL,
          OXYBUTYNIN_LABEL_NAME,
          'clinical_pharmacology 12.3 Table 2',
          OXYBUTYNIN_TABLE_2_EXCERPT,
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'highly bound (>99%)',
        numeric: 99,
        unit: '%',
        populationContext:
          'both enantiomers of oxybutynin bound to plasma proteins; the major binding protein is alpha-1 acid glycoprotein',
        source: fdaLabel(
          OXYBUTYNIN_LABEL,
          OXYBUTYNIN_LABEL_NAME,
          'clinical_pharmacology 12.3 Distribution',
          'The volume of distribution is 193 L after intravenous administration of 5 mg oxybutynin chloride. Both enantiomers of oxybutynin are highly bound (>99%) to plasma proteins. Both enantiomers of N-desethyloxybutynin are also highly bound (>97%) to plasma proteins. The major binding protein is alpha-1 acid glycoprotein.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '193 L',
        numeric: 193,
        unit: 'L',
        populationContext: 'after intravenous administration of 5 mg oxybutynin chloride',
        source: fdaLabel(
          OXYBUTYNIN_LABEL,
          OXYBUTYNIN_LABEL_NAME,
          'clinical_pharmacology 12.3 Distribution',
          'The volume of distribution is 193 L after intravenous administration of 5 mg oxybutynin chloride. Both enantiomers of oxybutynin are highly bound (>99%) to plasma proteins. Both enantiomers of N-desethyloxybutynin are also highly bound (>97%) to plasma proteins. The major binding protein is alpha-1 acid glycoprotein.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolized primarily by the cytochrome P450 enzyme systems, particularly CYP3A4 found mostly in the liver and gut wall',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          OXYBUTYNIN_LABEL,
          OXYBUTYNIN_LABEL_NAME,
          'clinical_pharmacology 12.3 Metabolism',
          'Oxybutynin is metabolized primarily by the cytochrome P450 enzyme systems, particularly CYP3A4 found mostly in the liver and gut wall. Its metabolic products include phenylcyclohexylglycolic acid, which is pharmacologically inactive, and desethyloxybutynin, which is pharmacologically active.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Extensively metabolized by the liver, with less than 0.1% of the administered dose excreted unchanged in the urine',
        populationContext: 'human excretion data, as recorded in the label',
        source: fdaLabel(
          OXYBUTYNIN_LABEL,
          OXYBUTYNIN_LABEL_NAME,
          'clinical_pharmacology 12.3 Excretion',
          'Oxybutynin is extensively metabolized by the liver, with less than 0.1% of the administered dose excreted unchanged in the urine.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(13.2),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Adults, starting dose',
          amountAsRecorded: '5 or 10 mg once daily at approximately the same time each day',
        },
        {
          order: 2,
          periodAsRecorded: 'Adults, adjustment at approximately weekly intervals',
          amountAsRecorded: 'Adjusted in 5-mg increments, up to a maximum of 30 mg/day',
          purposeAsRecorded:
            'To achieve a balance of efficacy and tolerability, as recorded in the label',
        },
      ],
      source: fdaLabel(
        OXYBUTYNIN_LABEL,
        OXYBUTYNIN_LABEL_NAME,
        'dosage_and_administration 2.1 Adults',
        '2.1 Adults The recommended starting dose of Oxybutynin chloride extended-release tablets is 5 or 10 mg once daily at approximately the same time each day. Dosage may be adjusted in 5-mg increments to achieve a balance of efficacy and tolerability (up to a maximum of 30 mg/day). In general, dosage adjustment may proceed at approximately weekly intervals.',
      ),
    },
    productVariants: [
      {
        brandName: 'Oxybutynin Chloride Extended Release',
        formAsRecorded: 'Extended-release tablets',
        strengthsAsRecorded: 'Extended release tablets 5 mg, 10 mg and 15 mg',
        approvedUseAsRecorded:
          'A muscarinic antagonist indicated for the treatment of overactive bladder with symptoms of urge urinary incontinence, urgency, and frequency, and for the treatment of pediatric patients aged 6 years and older with symptoms of detrusor overactivity associated with a neurological condition',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2023-05-31',
        source: fdaLabel(
          OXYBUTYNIN_LABEL,
          OXYBUTYNIN_LABEL_NAME,
          'indications_and_usage; dosage_forms_and_strengths',
          'Oxybutynin chloride extended-release tablets are a muscarinic antagonist indicated for the treatment of overactive bladder with symptoms of urge urinary incontinence, urgency, and frequency.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'bladder',
        actionAsRecorded:
          'Relaxes bladder smooth muscle; exerts a direct antispasmodic effect on smooth muscle and inhibits the muscarinic action of acetylcholine on smooth muscle',
        source: fdaLabel(
          OXYBUTYNIN_LABEL,
          OXYBUTYNIN_LABEL_NAME,
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Oxybutynin relaxes bladder smooth muscle. Oxybutynin chloride exerts a direct antispasmodic effect on smooth muscle and inhibits the muscarinic action of acetylcholine on smooth muscle. No blocking effects occur at skeletal neuromuscular junctions or autonomic ganglia (antinicotinic effects).',
        ),
      },
    ],
  },

  pembrolizumab: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      unii: 'DPT0O3T46P',
      rxcui: '1547545',
      source: fdaLabel(PEMBROLIZUMAB_LABEL, PEMBROLIZUMAB_LABEL_NAME, 'openFDA identity metadata'),
    },
    pharmacokinetics: {
      routeAsRecorded: 'Intravenous infusion',
      halfLife: {
        display: '22 days',
        populationContext:
          'population pharmacokinetic analysis of 2993 patients with various cancers; terminal half-life',
        source: fdaLabel(
          PEMBROLIZUMAB_LABEL,
          PEMBROLIZUMAB_LABEL_NAME,
          'clinical_pharmacology 12.3 Elimination',
          'The terminal half-life (t 1/2 ) is 22 days (32%).',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '6.0 L',
        numeric: 6,
        unit: 'L',
        populationContext:
          'geometric mean volume of distribution at steady state, population pharmacokinetic analysis',
        source: fdaLabel(
          PEMBROLIZUMAB_LABEL,
          PEMBROLIZUMAB_LABEL_NAME,
          'clinical_pharmacology 12.3 Distribution',
          'The geometric mean value (CV%) for volume of distribution at steady state is 6.0 L (20%).',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Geometric mean clearance 195 mL/day at steady state, approximately 23% lower than the 252 mL/day recorded after the first dose',
        populationContext:
          'population pharmacokinetic analysis in patients with various cancers, as recorded in the label',
        source: fdaLabel(
          PEMBROLIZUMAB_LABEL,
          PEMBROLIZUMAB_LABEL_NAME,
          'clinical_pharmacology 12.3 Elimination',
          'Pembrolizumab clearance (CV%) is approximately 23% lower [geometric mean, 195 mL/day (40%)] at steady state than that after the first dose [252 mL/day (37%)]; this decrease in clearance with time is not considered clinically important.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Keytruda',
        formAsRecorded: 'Injection: solution in a single-dose vial for intravenous use',
        strengthsAsRecorded: '100 mg/4 mL (25 mg/mL) solution in a single-dose vial',
        approvedUseAsRecorded:
          'A programmed death receptor-1 (PD-1)-blocking antibody indicated for the treatment of melanoma, non-small cell lung cancer and the further tumour types listed in the label, alone or in the combinations the label names',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-07-10',
        source: fdaLabel(
          PEMBROLIZUMAB_LABEL,
          PEMBROLIZUMAB_LABEL_NAME,
          'indications_and_usage; dosage_forms_and_strengths',
          'KEYTRUDA is a programmed death receptor-1 (PD-1)-blocking antibody indicated: Melanoma for the treatment of patients with unresectable or metastatic melanoma. ( 1.1 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'immune-lymph',
        actionAsRecorded:
          'Binds to the PD-1 receptor and blocks its interaction with PD-L1 and PD-L2, releasing PD-1 pathway-mediated inhibition of the immune response, including the anti-tumor immune response',
        source: fdaLabel(
          PEMBROLIZUMAB_LABEL,
          PEMBROLIZUMAB_LABEL_NAME,
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Pembrolizumab is a monoclonal antibody that binds to the PD-1 receptor and blocks its interaction with PD-L1 and PD-L2, releasing PD-1 pathway-mediated inhibition of the immune response, including the anti-tumor immune response.',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT01866319',
      includedAsRecorded: [
        'Histologically-confirmed diagnosis of unresectable Stage III or metastatic melanoma not amenable to local therapy (excluding uveal or ocular melanoma)',
        'At least one measurable lesion',
        'No prior systemic treatment (excluding adjuvant or neoadjuvant therapy) for melanoma (first line) or one prior systemic treatment (excluding adjuvant or neoadjuvant therapy) for melanoma (second line)',
        'Eastern Cooperative Oncology Group (ECOG) Performance Status of 0 or 1',
        'Archived tissue sample or new biopsy sample',
      ],
      excludedAsRecorded: [
        'Prior treatment with ipilimumab or other anti-cytotoxic T-Lymphocyte Antigen 4 (CTLA-4) agent or any anti-programmed cell death (PD-1 or PD-L2) agent',
        'History of a malignancy (other than the disease under treatment in the study) within 5 years prior to first study drug administration, excluding adequately treated Stage 1 or Stage 2 basal/squamous cell carcinoma of the skin, carcinoma in situ of the cervix or breast, or other in situ cancers.',
        'Known active central nervous system (CNS) metastases and/or carcinomatous meningitis; participants with previously treated brain metastases are eligible',
        'Active autoimmune disease or a documented history of autoimmune disease or syndrome that requires systemic steroids or immunosuppressive agents',
        'Active infection requiring systemic therapy',
        'Known history of Human Immunodeficiency Virus (HIV)',
      ],
      studiedGroupAsRecorded:
        'Minimum age 18 years; all sexes eligible, as recorded in the registry eligibility module',
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT01866319',
        label:
          'ClinicalTrials.gov record for KEYNOTE-006 (two dosing schedules of pembrolizumab compared with ipilimumab in advanced melanoma)',
        locator: 'protocolSection.eligibilityModule (minimumAge 18 Years; sex ALL)',
        retrievedAt: FETCHED,
        excerpt:
          '* At least one measurable lesion * No prior systemic treatment (excluding adjuvant or neoadjuvant therapy) for melanoma (first line) or one prior systemic treatment (excluding adjuvant or neoadjuvant therapy) for melanoma (second line) * Eastern Cooperative Oncology Group (ECOG) Performance Status of 0 or 1',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT01866319',
        endpointAsRecorded:
          'Percentage of Participants With Overall Survival (OS) at 12 Months (primary outcome measure): percentage of participants alive, reported with a 95% confidence interval',
        activeResultAsRecorded:
          'Pembrolizumab Q2W: 74.1 (68.5 to 78.9); Pembrolizumab Q3W: 68.4 (62.5 to 73.6)',
        comparatorResultAsRecorded: 'Ipilimumab: 58.2 (51.8 to 64.0)',
        timepointAsRecorded: 'Month 12',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT01866319',
          label: 'ClinicalTrials.gov posted results for KEYNOTE-006',
          locator:
            'resultsSection.outcomeMeasuresModule, primary outcome "Percentage of Participants With Overall Survival (OS) at 12 Months"; timeFrame "Month 12"; groups OG000 = Ipilimumab, OG001 = Pembrolizumab Q2W, OG002 = Pembrolizumab Q3W',
          retrievedAt: FETCHED,
          excerpt:
            '"measurements":[{"groupId":"OG000","value":"58.2","lowerLimit":"51.8","upperLimit":"64.0"},{"groupId":"OG001","value":"74.1","lowerLimit":"68.5","upperLimit":"78.9"},{"groupId":"OG002","value":"68.4","lowerLimit":"62.5","upperLimit":"73.6"}]',
        },
      },
    ],
  },

  ranolazine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '56959',
      casNumber: '95635-55-5',
      unii: 'A6IEZ5M406',
      rxcui: '35829',
      source: {
        kind: 'PUBCHEM',
        identifier: '56959',
        label: "PubChem compound record matched for 'ranolazine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (extended-release tablets)',
      bioavailability: {
        display: '73% of the dose systemically available as ranolazine or metabolites',
        numeric: 73,
        unit: '%',
        populationContext:
          'after oral administration of radiolabeled ranolazine as a solution, as recorded in the label',
        source: fdaLabel(
          RANOLAZINE_LABEL,
          RANOLAZINE_LABEL_NAME,
          'clinical_pharmacology 12.3 Absorption and Distribution',
          'After oral administration of 14 C-ranolazine as a solution, 73% of the dose is systemically available as ranolazine or metabolites. The bioavailability of ranolazine from ranolazine extended-release tablet relative to that from a solution of ranolazine is 76%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'between 2 and 5 hours',
        numeric: 3.5,
        unit: 'hours',
        populationContext: 'peak plasma concentrations after oral administration',
        source: fdaLabel(
          RANOLAZINE_LABEL,
          RANOLAZINE_LABEL_NAME,
          'clinical_pharmacology 12.3 Absorption and Distribution',
          'After oral administration of ranolazine, peak plasma concentrations of ranolazine are reached between 2 and 5 hours.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '7 hours',
        numeric: 7,
        unit: 'hours',
        populationContext: 'apparent terminal half-life, as recorded in the label',
        source: fdaLabel(
          RANOLAZINE_LABEL,
          RANOLAZINE_LABEL_NAME,
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'The apparent terminal half-life of ranolazine is 7 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 62%',
        numeric: 62,
        unit: '%',
        populationContext:
          'binding to human plasma proteins over the concentration range the label states',
        source: fdaLabel(
          RANOLAZINE_LABEL,
          RANOLAZINE_LABEL_NAME,
          'clinical_pharmacology 12.3 Absorption and Distribution',
          'Over the concentration range of 0.25 to 10 μg/mL, ranolazine is approximately 62% bound to human plasma proteins.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display: 'Metabolized mainly by CYP3A and, to a lesser extent, by CYP2D6',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          RANOLAZINE_LABEL,
          RANOLAZINE_LABEL_NAME,
          'clinical_pharmacology 12.3 Metabolism and Excretion',
          'Ranolazine is metabolized mainly by CYP3A and, to a lesser extent, by CYP2D6. Following a single oral dose of ranolazine solution, approximately 75% of the dose is excreted in urine and 25% in feces.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Following a single oral dose of ranolazine solution, approximately 75% of the dose is excreted in urine and 25% in feces',
        populationContext: 'single oral dose of ranolazine solution, as recorded in the label',
        source: fdaLabel(
          RANOLAZINE_LABEL,
          RANOLAZINE_LABEL_NAME,
          'clinical_pharmacology 12.3 Metabolism and Excretion',
          'Ranolazine is metabolized mainly by CYP3A and, to a lesser extent, by CYP2D6. Following a single oral dose of ranolazine solution, approximately 75% of the dose is excreted in urine and 25% in feces.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(7),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Initiation',
          amountAsRecorded: '500 mg twice daily',
        },
        {
          order: 2,
          periodAsRecorded: 'Increase as needed',
          amountAsRecorded: '1000 mg twice daily',
          purposeAsRecorded: 'Based on clinical symptoms, as recorded in the label',
        },
      ],
      source: fdaLabel(
        RANOLAZINE_LABEL,
        RANOLAZINE_LABEL_NAME,
        'dosage_and_administration 2.1 Dosing Information',
        'Initiate ranolazine extended-release tablet dosing at 500 mg twice daily and increase to 1000 mg twice daily, as needed, based on clinical symptoms.',
      ),
    },
    productVariants: [
      {
        brandName: 'Ranolazine',
        formAsRecorded: 'Extended-release tablets',
        strengthsAsRecorded: 'Extended-release tablets: 500 mg, 1000 mg',
        approvedUseAsRecorded:
          'An antianginal indicated for the treatment of chronic angina; the label records that it may be used with beta-blockers, nitrates, calcium channel blockers, anti-platelet therapy, lipid-lowering therapy, ACE inhibitors, and angiotensin receptor blockers',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-01-29',
        source: fdaLabel(
          RANOLAZINE_LABEL,
          RANOLAZINE_LABEL_NAME,
          'indications_and_usage; dosage_forms_and_strengths',
          'Ranolazine extended-release tablet is indicated for the treatment of chronic angina. Ranolazine extended-release tablet may be used with beta-blockers, nitrates, calcium channel blockers, anti-platelet therapy, lipid-lowering therapy, ACE inhibitors, and angiotensin receptor blockers.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'heart',
        actionAsRecorded:
          'At therapeutic levels can inhibit the cardiac late sodium current; the label records that the mechanism of the antianginal effect has not been determined and that the effects do not depend upon reductions in heart rate or blood pressure',
        source: fdaLabel(
          RANOLAZINE_LABEL,
          RANOLAZINE_LABEL_NAME,
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Ranolazine has anti-ischemic and antianginal effects that do not depend upon reductions in heart rate or blood pressure. It does not affect the rate-pressure product, a measure of myocardial work, at maximal exercise. Ranolazine at therapeutic levels can inhibit the cardiac late sodium current (I Na ).',
        ),
      },
    ],
  },

  rituximab: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      unii: '4F4X42SYQ6',
      rxcui: '121191',
      source: fdaLabel(RITUXIMAB_LABEL, RITUXIMAB_LABEL_NAME, 'openFDA identity metadata'),
    },
    pharmacokinetics: {
      routeAsRecorded: 'Intravenous infusion',
      halfLife: {
        display: '22 days (range, 6.1 to 52 days)',
        populationContext:
          'population pharmacokinetic analysis of 298 non-Hodgkin’s lymphoma patients who received rituximab once weekly or once every three weeks; estimated median terminal elimination half-life',
        source: fdaLabel(
          RITUXIMAB_LABEL,
          RITUXIMAB_LABEL_NAME,
          "clinical_pharmacology 12.3 Non-Hodgkin's Lymphoma",
          'Based on a population pharmacokinetic analysis of data from 298 NHL patients who received rituximab once weekly or once every three weeks, the estimated median terminal elimination half-life was 22 days (range, 6.1 to 52 days).',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '3.1 L',
        numeric: 3.1,
        unit: 'L',
        populationContext:
          'population pharmacokinetic analysis of 2005 rheumatoid arthritis patients who received RITUXAN',
        source: fdaLabel(
          RITUXIMAB_LABEL,
          RITUXIMAB_LABEL_NAME,
          'clinical_pharmacology 12.3 Rheumatoid Arthritis',
          RITUXIMAB_RA_EXCERPT,
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: 'Estimated clearance 0.335 L/day',
        populationContext:
          'population pharmacokinetic analysis of 2005 rheumatoid arthritis patients who received RITUXAN',
        source: fdaLabel(
          RITUXIMAB_LABEL,
          RITUXIMAB_LABEL_NAME,
          'clinical_pharmacology 12.3 Rheumatoid Arthritis',
          RITUXIMAB_RA_EXCERPT,
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Rituxan',
        formAsRecorded: 'Injection: solution in single-dose vials for intravenous infusion',
        strengthsAsRecorded:
          '100 mg/10 mL (10 mg/mL) and 500 mg/50 mL (10 mg/mL) solution in single-dose vials',
        approvedUseAsRecorded:
          "A CD20-directed cytolytic antibody indicated for the treatment of non-Hodgkin's lymphoma, chronic lymphocytic leukemia, rheumatoid arthritis in combination with methotrexate, granulomatosis with polyangiitis and microscopic polyangiitis in combination with glucocorticoids, and moderate to severe pemphigus vulgaris, in the populations the label names",
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-01-06',
        source: fdaLabel(
          RITUXIMAB_LABEL,
          RITUXIMAB_LABEL_NAME,
          'indications_and_usage; dosage_forms_and_strengths',
          "RITUXAN is a CD20-directed cytolytic antibody indicated for the treatment of: Adult patients with Non-Hodgkin's Lymphoma (NHL) ( 1.1 ). Relapsed or refractory, low grade or follicular, CD20-positive B-cell NHL as a single agent.",
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'immune-lymph',
        actionAsRecorded:
          'Targets the CD20 antigen expressed on the surface of pre-B and mature B-lymphocytes; upon binding to CD20 it mediates B-cell lysis',
        source: fdaLabel(
          RITUXIMAB_LABEL,
          RITUXIMAB_LABEL_NAME,
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Rituximab is a monoclonal antibody that targets the CD20 antigen expressed on the surface of pre-B and mature B-lymphocytes. Upon binding to CD20, rituximab mediates B-cell lysis. Possible mechanisms of cell lysis include complement dependent cytotoxicity (CDC) and antibody dependent cell mediated cytotoxicity (ADCC).',
        ),
      },
    ],
  },
}
