import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import type { BackgroundSource } from '@/lib/background/types'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 16: secukinumab, selenium, sulfasalazine, tacrolimus, tamoxifen.
 *
 * Honest omissions in this batch:
 * - secukinumab: as a monoclonal antibody it has no PubChem compound record in the artifact, so
 *   registry identifiers are the UNII and RxCUI carried by the fetched COSENTYX label artifact.
 *   The label states the half-life only in days ("22 to 31 days"), so it is recorded display-only
 *   and no steady-state note is derived. The pivotal results are taken from the label's own
 *   Table 3, which is the only fetched text that carries the arm labels and both response counts
 *   in one contiguous span; the same label section names Trial PsO1 as NCT01365455, and that
 *   registry record was fetched separately and matched (secukinumab, moderate to severe plaque
 *   psoriasis) before its eligibility criteria were recorded as applicability.
 * - selenium: the openFDA search returned a multi-ingredient sublingual homeopathic product
 *   ("Hair-X Hair Loss Relief", generic names CADMIUM SULFATE, GRAPHITE, PHOSPHORIC ACID, SILICON
 *   DIOXIDE, SELENIUM, THALLIUM, USTILAGO MAYDIS) whose generic names do not match selenium as a
 *   single medicine, so no label-derived module is recorded. A PubMed search for human selenium
 *   pharmacokinetics returned no abstract stating a half-life or time-to-peak for selenium itself,
 *   so registry identifiers from PubChem are the whole honest entry.
 * - sulfasalazine: the label's dosage section moves from initial therapy down to a lower
 *   maintenance amount rather than up a stepwise escalation, so no titration module is recorded.
 * - tamoxifen: the label states the half-life only as "about 5 to 7 days", so it is recorded
 *   display-only. The controlled anatomy vocabulary has no breast region, and the fetched sections
 *   name no other organ as the recorded target, so no anatomy module is recorded. The only NCT
 *   number in the fetched label (NCT00003787) belongs to a pharmacogenomic observation of endoxifen
 *   concentrations, not to a pivotal efficacy trial, so no applicability or pivotal result is
 *   recorded.
 * - tacrolimus, sulfasalazine: the fetched labels carry no NCT number, so neither records
 *   applicability or pivotal results.
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

const SECUKINUMAB_LABEL = '77c4b13e-7df3-42d4-81db-3d0cddb7f67a'
const SULFASALAZINE_LABEL = '029716bd-ee1a-484c-bf1f-ec8d02d5281b'
const TACROLIMUS_LABEL = '08cf2861-2483-405d-a872-a88a5c235f9a'
const TAMOXIFEN_LABEL = '1e6ff055-590c-41e6-9530-1fdf04cdbd02'

const SECUKINUMAB_TABLE_3 =
  'Trial PsO1 Trial PsO2 COSENTYX 300 mg (N = 245) n (%) COSENTYX 150 mg (N = 245) n (%) Placebo (N = 248) n (%) COSENTYX 300 mg (N = 327) n (%) COSENTYX 150 mg (N = 327) n (%) Placebo (N = 326) n (%) PASI 75 response 200 (82) 174 (71) 11 (4) 249 (76) 219 (67) 16 (5) IGA of clear or almost clear 160 (65) 125 (51) 6 (2) 202 (62) 167 (51) 9 (3)'

export const BACKGROUND_BATCH_16: RecordedBackgroundBySlug = {
  secukinumab: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      unii: 'DLG4EML025',
      rxcui: '1599788',
      source: fdaLabel(
        SECUKINUMAB_LABEL,
        'FDA label for COSENTYX (secukinumab) injection (openFDA)',
        'openFDA identity metadata',
      ),
    },
    pharmacokinetics: {
      routeAsRecorded:
        'Subcutaneous injection (the label also records an intravenous infusion form)',
      bioavailability: {
        display: '55% to 77%',
        numeric: 66,
        unit: '%',
        populationContext:
          'healthy subjects and subjects with plaque psoriasis, after a subcutaneous dose of 150 mg or 300 mg',
        source: fdaLabel(
          SECUKINUMAB_LABEL,
          'FDA label for COSENTYX (secukinumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'In healthy subjects and subjects with PsO, secukinumab bioavailability ranged from 55% to 77% following subcutaneous COSENTYX dose of 150 mg or 300 mg (administered as two injections of 150 mg).',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'approximately 6 days post dose',
        numeric: 144,
        unit: 'hours',
        populationContext:
          'plaque psoriasis subjects, peak mean serum concentration after a single subcutaneous dose',
        source: fdaLabel(
          SECUKINUMAB_LABEL,
          'FDA label for COSENTYX (secukinumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Following a single subcutaneous dose of either 150 mg or 300 mg (administered as two injections of 150 mg) of COSENTYX in PsO subjects, secukinumab reached peak mean (± SD) serum concentrations (C max ) of 13.7 ± 4.8 mcg/mL and 27.3 ± 9.5 mcg/mL, respectively, by approximately 6 days post dose.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '22 to 31 days',
        populationContext:
          'plaque psoriasis subjects, following intravenous and subcutaneous administration across all plaque psoriasis trials',
        source: fdaLabel(
          SECUKINUMAB_LABEL,
          'FDA label for COSENTYX (secukinumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'The mean systemic clearance (CL) ranged from 0.14 L/day to 0.22 L/day and the mean half-life ranged from 22 to 31 days in PsO subjects following intravenous and subcutaneous administration across all PsO trials.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '7.10 to 8.60 L',
        numeric: 7.85,
        unit: 'L',
        populationContext:
          'plaque psoriasis subjects, terminal-phase volume of distribution after a single intravenous administration',
        source: fdaLabel(
          SECUKINUMAB_LABEL,
          'FDA label for COSENTYX (secukinumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The mean volume of distribution during the terminal phase (Vz) following a single intravenous administration ranged from 7.10 to 8.60 L in PsO subjects.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'The metabolic pathway has not been characterized; as a human IgG1 monoclonal antibody, secukinumab is expected to be degraded into small peptides and amino acids via catabolic pathways in the same manner as endogenous IgG',
        populationContext: 'expected degradation pathway, as recorded in the label',
        source: fdaLabel(
          SECUKINUMAB_LABEL,
          'FDA label for COSENTYX (secukinumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'The metabolic pathway of secukinumab has not been characterized. As a human IgG1κ monoclonal antibody secukinumab is expected to be degraded into small peptides and amino acids via catabolic pathways in the same manner as endogenous IgG.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: 'Mean systemic clearance ranged from 0.14 L/day to 0.22 L/day',
        populationContext:
          'plaque psoriasis subjects, following intravenous and subcutaneous administration across all plaque psoriasis trials',
        source: fdaLabel(
          SECUKINUMAB_LABEL,
          'FDA label for COSENTYX (secukinumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'The mean systemic clearance (CL) ranged from 0.14 L/day to 0.22 L/day and the mean half-life ranged from 22 to 31 days in PsO subjects following intravenous and subcutaneous administration across all PsO trials.',
        ),
        concordance: 'label_only',
      },
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Weeks 0, 1, 2, 3, and 4 (adult plaque psoriasis, subcutaneous)',
          amountAsRecorded: '300 mg by subcutaneous injection',
        },
        {
          order: 2,
          periodAsRecorded: 'Every 4 weeks thereafter',
          amountAsRecorded:
            '300 mg by subcutaneous injection; the label records that for some patients a dose of 150 mg may be acceptable',
        },
      ],
      source: fdaLabel(
        SECUKINUMAB_LABEL,
        'FDA label for COSENTYX (secukinumab) injection (openFDA)',
        'dosage_and_administration 2.3 Plaque Psoriasis',
        'Plaque Psoriasis: Subcutaneous Dosage in Adults: Recommended dosage is 300 mg by subcutaneous injection at Weeks 0, 1, 2, 3, and 4 and every 4 weeks thereafter. For some patients, a dose of 150 mg may be acceptable. ( 2.3 )',
      ),
    },
    productVariants: [
      {
        brandName: 'Cosentyx',
        formAsRecorded:
          'Injection for subcutaneous use (single-dose UnoReady pen, Sensoready pen and prefilled syringe) and injection for intravenous use (single-dose vial)',
        strengthsAsRecorded:
          'Subcutaneous: 300 mg/2 mL, 150 mg/mL, 75 mg/0.5 mL. Intravenous: 125 mg/5 mL',
        approvedUseAsRecorded:
          'Moderate to severe plaque psoriasis, active psoriatic arthritis, active ankylosing spondylitis, active non-radiographic axial spondyloarthritis, active enthesitis-related arthritis and moderate to severe hidradenitis suppurativa, in the age groups the label records for each',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription biologic product; FDA label in effect 2026-04-17',
        source: fdaLabel(
          SECUKINUMAB_LABEL,
          'FDA label for COSENTYX (secukinumab) injection (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'COSENTYX is a human interleukin-17A antagonist indicated for the treatment of: moderate to severe plaque psoriasis (PsO) in adults and pediatric patients 6 years and older who are candidates for systemic therapy or phototherapy. ( 1.1 ) active psoriatic arthritis (PsA) in adults and pediatric patients 2 years of age and older. ( 1.2 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'immune-lymph',
        actionAsRecorded:
          'Selectively binds to the interleukin-17A cytokine, which is involved in normal inflammatory and immune responses, and inhibits its interaction with the IL-17 receptor and the release of proinflammatory cytokines and chemokines',
        source: fdaLabel(
          SECUKINUMAB_LABEL,
          'FDA label for COSENTYX (secukinumab) injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Secukinumab is a human IgG1 monoclonal antibody that selectively binds to the interleukin-17A (IL-17A) cytokine and inhibits its interaction with the IL-17 receptor. IL-17A is a naturally occurring cytokine that is involved in normal inflammatory and immune responses. Secukinumab inhibits the release of proinflammatory cytokines and chemokines.',
        ),
      },
      {
        regionCode: 'skin',
        actionAsRecorded:
          'Elevated interleukin-17A levels are found in psoriatic plaques and hidradenitis suppurativa lesions; the label records that treatment may reduce epidermal neutrophils and interleukin-17A levels in psoriatic plaques',
        source: fdaLabel(
          SECUKINUMAB_LABEL,
          'FDA label for COSENTYX (secukinumab) injection (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics',
          'Elevated levels of IL-17A are found in psoriatic plaques and in HS lesions. Treatment with COSENTYX may reduce epidermal neutrophils and IL-17A levels in psoriatic plaques.',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT01365455',
      includedAsRecorded: [
        'Moderate and severe plaque-type psoriasis diagnosed for at least 6 months',
        'Psoriasis Area and Severity Index (PASI) score of 12 or greater',
        "Investigator's Global Assessment (IGA) score of 3 or greater",
        'Total body surface area (BSA) affected of 10% or greater',
        'Inadequate control by prior use of topical treatment, phototherapy and/or systemic therapy',
      ],
      excludedAsRecorded: [
        'Current forms of psoriasis other than chronic plaque-type psoriasis (for example, pustular, erythrodermic, guttate)',
        'Current drug-induced psoriasis',
        'Previous use of secukinumab or any drug that targets IL-17 or IL-17 receptor',
        'Significant medical problems such as uncontrolled hypertension, congestive heart failure or a condition that significantly immunocompromises the subject',
        'History of an ongoing, chronic or recurrent infectious disease, or evidence of untreated tuberculosis',
        'History of lymphoproliferative disease or history of malignancy of any organ system within the past 5 years',
        'Pregnant or nursing (lactating) women',
      ],
      studiedGroupAsRecorded: 'Adults 18 years and older, all sexes eligible',
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT01365455',
        label:
          'ClinicalTrials.gov record for Trial PsO1 (subcutaneous secukinumab in moderate to severe chronic plaque-type psoriasis), the trial the fetched label identifies as NCT01365455',
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: FETCHED,
        excerpt:
          "Moderate and severe plaque-type psoriasis diagnosed for at least 6 months. * Severity of psoriasis disease meeting all of the following three criteria: * Psoriasis Area and Severity Index (PASI) score of 12 or greater, * Investigator's Global Assessment (IGA) score of 3 or greater, * Total body surface area (BSA) affected of 10% or greater.",
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT01365455',
        endpointAsRecorded:
          'PASI 75 response: the proportion of subjects achieving a reduction of at least 75% in the Psoriasis Area and Severity Index from baseline, one of the two trial endpoints in Trial PsO1',
        activeResultAsRecorded: 'Secukinumab 300 mg (N = 245): 200 subjects (82%)',
        comparatorResultAsRecorded: 'Placebo (N = 248): 11 subjects (4%)',
        timepointAsRecorded: 'Week 12',
        source: fdaLabel(
          SECUKINUMAB_LABEL,
          'FDA label for COSENTYX (secukinumab) injection (openFDA)',
          'clinical_studies 14.1 Table 3, Trial PsO1 columns',
          SECUKINUMAB_TABLE_3,
        ),
      },
      {
        trialIdentifier: 'NCT01365455',
        endpointAsRecorded:
          'Treatment success on the Investigator’s Global Assessment modified 2011, recorded as clear or almost clear, the other trial endpoint in Trial PsO1',
        activeResultAsRecorded: 'Secukinumab 300 mg (N = 245): 160 subjects (65%)',
        comparatorResultAsRecorded: 'Placebo (N = 248): 6 subjects (2%)',
        timepointAsRecorded: 'Week 12',
        source: fdaLabel(
          SECUKINUMAB_LABEL,
          'FDA label for COSENTYX (secukinumab) injection (openFDA)',
          'clinical_studies 14.1 Table 3, Trial PsO1 columns',
          SECUKINUMAB_TABLE_3,
        ),
      },
    ],
  },

  selenium: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '6326970',
      casNumber: '7782-49-2',
      rxcui: '2200142',
      source: {
        kind: 'PUBCHEM',
        identifier: '6326970',
        label: "PubChem compound record matched for 'selenium'",
        retrievedAt: FETCHED,
      },
    },
  },

  sulfasalazine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5339',
      casNumber: '599-79-1',
      unii: '3XC8GUZ6CB',
      rxcui: '9524',
      source: {
        kind: 'PUBCHEM',
        identifier: '5339',
        label: "PubChem compound record matched for 'sulfasalazine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      bioavailability: {
        display: 'less than 15% for parent drug',
        numeric: 15,
        unit: '%',
        populationContext:
          'absolute bioavailability of orally administered sulfasalazine, from in vivo studies recorded in the label',
        source: fdaLabel(
          SULFASALAZINE_LABEL,
          'FDA label for sulfasalazine tablets, USP (openFDA)',
          'clinical_pharmacology Pharmacokinetics',
          'In vivo studies have indicated that the absolute bioavailability of orally administered SSZ is less than 15% for parent drug.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'between 3 and 12 hours, with the mean peak at 6 hours',
        numeric: 6,
        unit: 'hours',
        populationContext:
          'maximum sulfasalazine concentrations after a single 1 g oral dose in 9 healthy males',
        source: fdaLabel(
          SULFASALAZINE_LABEL,
          'FDA label for sulfasalazine tablets, USP (openFDA)',
          'clinical_pharmacology Pharmacokinetics, Absorption',
          'Maximum concentrations of SSZ occur between 3 and 12 hours post-ingestion, with the mean peak concentration (6 μg/mL) occurring at 6 hours.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '7.6 ± 3.4 hours',
        numeric: 7.6,
        unit: 'hours',
        populationContext: 'observed plasma half-life for intravenous sulfasalazine',
        source: fdaLabel(
          SULFASALAZINE_LABEL,
          'FDA label for sulfasalazine tablets, USP (openFDA)',
          'clinical_pharmacology Pharmacokinetics, Metabolism',
          'The observed plasma half-life for intravenous sulfasalazine is 7.6 ± 3.4 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'more than 99.3% bound to albumin',
        numeric: 99.3,
        unit: '%',
        populationContext: 'binding of sulfasalazine to albumin, as recorded in the label',
        source: fdaLabel(
          SULFASALAZINE_LABEL,
          'FDA label for sulfasalazine tablets, USP (openFDA)',
          'clinical_pharmacology Pharmacokinetics, Distribution',
          'Following intravenous injection, the calculated volume of distribution (Vdss) for SSZ was 7.5 ± 1.6 L. SSZ is highly bound to albumin (>99.3%) while SP is only about 70% bound to albumin.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '7.5 ± 1.6 L',
        numeric: 7.5,
        unit: 'L',
        populationContext:
          'calculated volume of distribution for sulfasalazine following intravenous injection',
        source: fdaLabel(
          SULFASALAZINE_LABEL,
          'FDA label for sulfasalazine tablets, USP (openFDA)',
          'clinical_pharmacology Pharmacokinetics, Distribution',
          'Following intravenous injection, the calculated volume of distribution (Vdss) for SSZ was 7.5 ± 1.6 L. SSZ is highly bound to albumin (>99.3%) while SP is only about 70% bound to albumin.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolized by intestinal bacteria to sulfapyridine and 5-aminosalicylic acid; approximately 15% of a dose is absorbed as parent drug and is metabolized to some extent in the liver to the same two species',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          SULFASALAZINE_LABEL,
          'FDA label for sulfasalazine tablets, USP (openFDA)',
          'clinical_pharmacology Pharmacokinetics, Metabolism',
          'As mentioned above, SSZ is metabolized by intestinal bacteria to SP and 5-ASA. Approximately 15% of a dose of SSZ is absorbed as parent and is metabolized to some extent in the liver to the same two species.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Absorbed sulfapyridine and 5-aminosalicylic acid and their metabolites are primarily eliminated in the urine; the majority of 5-aminosalicylic acid stays within the colonic lumen and is excreted with the feces',
        populationContext: 'human excretion data, as recorded in the label',
        source: fdaLabel(
          SULFASALAZINE_LABEL,
          'FDA label for sulfasalazine tablets, USP (openFDA)',
          'clinical_pharmacology Pharmacokinetics, Excretion',
          'Absorbed SP and 5-ASA and their metabolites are primarily eliminated in the urine either as free metabolites or as glucuronide conjugates. The majority of 5-ASA stays within the colonic lumen and is excreted as 5-ASA and acetyl-5-ASA with the feces.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(7.6),
    },
    productVariants: [
      {
        brandName: 'Sulfasalazine',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: 'Tablets, USP 500 mg',
        approvedUseAsRecorded:
          'Treatment of mild to moderate ulcerative colitis, adjunctive therapy in severe ulcerative colitis, and prolongation of the remission period between acute attacks of ulcerative colitis',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2022-12-12',
        source: fdaLabel(
          SULFASALAZINE_LABEL,
          'FDA label for sulfasalazine tablets, USP (openFDA)',
          'indications_and_usage; how_supplied',
          'Sulfasalazine Tablets are indicated: a) in the treatment of mild to moderate ulcerative colitis, and as adjunctive therapy in severe ulcerative colitis; and b) for the prolongation of the remission period between acute attacks of ulcerative colitis.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'intestines',
        actionAsRecorded:
          'In the intestine, sulfasalazine is metabolized by intestinal bacteria to sulfapyridine and 5-aminosalicylic acid; sulfapyridine is relatively well absorbed from the intestine while 5-aminosalicylic acid is much less well absorbed',
        source: fdaLabel(
          SULFASALAZINE_LABEL,
          'FDA label for sulfasalazine tablets, USP (openFDA)',
          'clinical_pharmacology Pharmacokinetics',
          'In the intestine, SSZ is metabolized by intestinal bacteria to SP and 5-ASA. Of the two species, SP is relatively well absorbed from the intestine and highly metabolized, while 5-ASA is much less well absorbed.',
        ),
      },
    ],
  },

  tacrolimus: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '445643',
      casNumber: '104987-11-3',
      unii: 'WM0HAQ4WNM',
      rxcui: '42316',
      source: {
        kind: 'PUBCHEM',
        identifier: '445643',
        label: "PubChem compound record matched for 'tacrolimus'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (extended-release capsules, once daily)',
      tMax: {
        display: 'median 2 hours in the fasted state; 4 hours in the fed state',
        numeric: 2,
        unit: 'hours',
        populationContext:
          '24 healthy subjects, fasted compared with immediately following a high-fat meal',
        source: fdaLabel(
          TACROLIMUS_LABEL,
          'FDA label for tacrolimus extended-release capsules (openFDA)',
          'clinical_pharmacology 12.3 Absorption, Food Effects',
          'Food delayed the median T max from 2 hours in the fasted state to 4 hours in the fed state; however, the terminal half-life remained 36 hours regardless of dosing conditions.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '38 ± 3 hours',
        numeric: 38,
        unit: 'hours',
        populationContext:
          '24 healthy subjects, after 4 mg tacrolimus extended-release capsules daily for 10 days',
        source: fdaLabel(
          TACROLIMUS_LABEL,
          'FDA label for tacrolimus extended-release capsules (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'The elimination half-life of tacrolimus after oral administration of 4 mg tacrolimus extended-release capsules daily for 10 days was 38 ± 3 hours in 24 healthy subjects.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 99%',
        numeric: 99,
        unit: '%',
        populationContext:
          'plasma protein binding, independent of concentration over the range the label records',
        source: fdaLabel(
          TACROLIMUS_LABEL,
          'FDA label for tacrolimus extended-release capsules (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The plasma protein binding of tacrolimus is approximately 99% and is independent of concentration over a range of 5 ng/mL to 50 ng/mL.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized by the mixed-function oxidase system, primarily the cytochrome P-450 system (CYP3A4 and CYP3A5)',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          TACROLIMUS_LABEL,
          'FDA label for tacrolimus extended-release capsules (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Tacrolimus is extensively metabolized by the mixed-function oxidase system, primarily the cytochrome P-450 system (CYP3A4 and CYP3A5). A metabolic pathway leading to the formation of 8 possible metabolites has been proposed.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Fecal elimination accounted for 92.6 ± 30.7% and urinary elimination for 2.3 ± 1.1% of the total radiolabel administered',
        populationContext:
          'mass balance study of orally administered radiolabeled tacrolimus in 6 healthy subjects',
        source: fdaLabel(
          TACROLIMUS_LABEL,
          'FDA label for tacrolimus extended-release capsules (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'In a mass balance study of orally-administered radiolabeled tacrolimus to 6 healthy subjects, the mean recovery of the radiolabel was 94.9 ± 30.7%. Fecal elimination accounted for 92.6 ± 30.7% and urinary elimination accounted for 2.3 ± 1.1% of the total radiolabel administered.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(38),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded:
            'First dose (pre-operative), within 12 hours prior to reperfusion — adults given mycophenolate mofetil and steroids without basiliximab induction',
          amountAsRecorded: '0.1 mg/kg',
        },
        {
          order: 2,
          periodAsRecorded:
            'Subsequent doses (post-operative), at least 4 hours after the pre-operative dose and within 12 hours after reperfusion',
          amountAsRecorded: '0.2 mg/kg once daily',
        },
      ],
      source: fdaLabel(
        TACROLIMUS_LABEL,
        'FDA label for tacrolimus extended-release capsules (openFDA)',
        'dosage_and_administration, Recommended Initial Dosage table',
        'With MMF and steroids, without basiliximab induction First dose (pre-operative): 0.1 mg/kg, within 12 hours prior to reperfusion Subsequent doses (post-operative): 0.2 mg/kg once daily at least 4 hours after pre-operative dose and within 12 hours after reperfusion',
      ),
    },
    productVariants: [
      {
        brandName: 'Tacrolimus extended-release capsules',
        formAsRecorded: 'Extended-release capsules',
        strengthsAsRecorded: 'Capsules: 0.5 mg, 1 mg, 5 mg',
        approvedUseAsRecorded:
          'Prophylaxis of organ rejection in kidney transplant patients in combination with other immunosuppressants, in adult patients who can swallow capsules intact',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-02-07',
        source: fdaLabel(
          TACROLIMUS_LABEL,
          'FDA label for tacrolimus extended-release capsules (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Tacrolimus extended-release capsules is a calcineurin-inhibitor immunosuppressant indicated for the prophylaxis of organ rejection in kidney transplant patients in combination with other immunosuppressants in adult patients who can swallow capsules intact. ( 1 , 14.1 , 14.2 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'immune-lymph',
        actionAsRecorded:
          'Inhibits the phosphatase activity of calcineurin; the net result recorded in the label is inhibition of T-lymphocyte activation and proliferation as well as the T-helper-cell-dependent B-cell response',
        source: fdaLabel(
          TACROLIMUS_LABEL,
          'FDA label for tacrolimus extended-release capsules (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Tacrolimus also inhibits IL-2 receptor expression and nitric oxide release, induces apoptosis and production of transforming growth factor-beta that can lead to immunosuppressive activity. The net result is the inhibition of T-lymphocyte activation and proliferation as well as T-helper-cell-dependent B-cell response (i.e., immunosuppression).',
        ),
      },
      {
        regionCode: 'kidneys',
        actionAsRecorded:
          'Recorded use is prophylaxis of organ rejection in kidney transplant patients, in combination with other immunosuppressants',
        source: fdaLabel(
          TACROLIMUS_LABEL,
          'FDA label for tacrolimus extended-release capsules (openFDA)',
          'indications_and_usage',
          'Tacrolimus extended-release capsules is a calcineurin-inhibitor immunosuppressant indicated for the prophylaxis of organ rejection in kidney transplant patients in combination with other immunosuppressants in adult patients who can swallow capsules intact. ( 1 , 14.1 , 14.2 )',
        ),
      },
    ],
  },

  tamoxifen: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '2733526',
      casNumber: '10540-29-1',
      unii: '7FRV7310N6',
      rxcui: '10324',
      source: {
        kind: 'PUBCHEM',
        identifier: '2733526',
        label: "PubChem compound record matched for 'tamoxifen'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded:
        'Oral (oral solution; the label records bioequivalence to tamoxifen tablets)',
      tMax: {
        display: 'approximately 5 hours after dosing',
        numeric: 5,
        unit: 'hours',
        populationContext: 'single oral dose of 20 mg tamoxifen, average peak plasma concentration',
        source: fdaLabel(
          TAMOXIFEN_LABEL,
          'FDA label for SOLTAMOX (tamoxifen citrate) oral solution (openFDA)',
          'clinical_pharmacology 12.3 Absorption and Distribution',
          'Following a single oral dose of 20 mg tamoxifen, an average peak plasma concentration of 40 ng/mL (range 35 to 45 ng/mL) occurred approximately 5 hours after dosing.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 5 to 7 days',
        populationContext:
          'terminal elimination half-life of tamoxifen, whose plasma decline the label records as biphasic',
        source: fdaLabel(
          TAMOXIFEN_LABEL,
          'FDA label for SOLTAMOX (tamoxifen citrate) oral solution (openFDA)',
          'clinical_pharmacology 12.3 Absorption and Distribution',
          'The decline in plasma concentrations of tamoxifen is biphasic with a terminal elimination half-life of about 5 to 7 days.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized by CYP450 enzymes, including CYP3A, CYP2D6, CYP2C9, CYP2C19, and CYP2B6; N-desmethyltamoxifen, formed predominantly by CYP3A, is the major metabolite found in plasma',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          TAMOXIFEN_LABEL,
          'FDA label for SOLTAMOX (tamoxifen citrate) oral solution (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Tamoxifen is extensively metabolized by CYP450 enzymes, including CYP3A, CYP2D6, CYP2C9, CYP2C19, and CYP2B6. N-desmethyltamoxifen, formed predominantly by CYP3A, is the major metabolite found in plasma. The pharmacological activity of N-desmethyltamoxifen is similar to that of tamoxifen.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Approximately 65% of the administered dose was excreted from the body over a period of 2 weeks, with fecal excretion as the primary route of elimination',
        populationContext: 'women receiving 20 mg of carbon-14 labelled tamoxifen',
        source: fdaLabel(
          TAMOXIFEN_LABEL,
          'FDA label for SOLTAMOX (tamoxifen citrate) oral solution (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Studies in women receiving 20 mg of 14 C tamoxifen showed that approximately 65% of the administered dose was excreted from the body over a period of 2 weeks, with fecal excretion as the primary route of elimination.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Soltamox',
        formAsRecorded: 'Oral solution',
        strengthsAsRecorded:
          'Each 10 mL of solution contains 20 mg tamoxifen, equivalent to 30.4 mg tamoxifen citrate',
        approvedUseAsRecorded:
          'Treatment of adult patients with estrogen receptor-positive metastatic breast cancer; adjuvant treatment of adult patients with early stage estrogen receptor-positive breast cancer; reduction of the risk of invasive breast cancer following breast surgery and radiation in adult women with ductal carcinoma in situ; and reduction of breast cancer incidence in adult women at high risk',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2021-11-29',
        source: fdaLabel(
          TAMOXIFEN_LABEL,
          'FDA label for SOLTAMOX (tamoxifen citrate) oral solution (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'SOLTAMOX is an estrogen agonist/antagonist indicated: For treatment of adult patients with estrogen receptor-positive metastatic breast cancer ( 1.1 ) For adjuvant treatment of adult patients with early stage estrogen receptor- positive breast cancer ( 1.2 )',
        ),
      },
    ],
  },
}
