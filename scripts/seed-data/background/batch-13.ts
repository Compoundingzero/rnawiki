import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import type { BackgroundSource } from '@/lib/background/types'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 13: alpha-lipoic-acid, anastrozole, azathioprine, cyclosporine, dupilumab, etanercept.
 *
 * Honest omissions and cautions in this batch:
 * - alpha-lipoic-acid: the openFDA search returned a multi-ingredient homeopathic pellet product
 *   (OMEOSPORT) whose generic-name list is a long combination, not alpha-lipoic acid as a single
 *   medicine, so every label-derived module is discarded. Identity comes from PubChem, and the
 *   only recorded measurements come from two fetched PubMed abstracts.
 * - anastrozole: the label states no bioavailability or volume of distribution, so those are
 *   absent. No anatomy target is recorded: the controlled region vocabulary has no breast-tissue
 *   region, and the label explicitly states anastrozole has no detectable effect on adrenal
 *   corticosteroid formation, so 'adrenal' would misstate the source. The label separately says
 *   plasma concentrations approach steady state "at about 7 days"; the recorded steady-state note
 *   is the deterministic five-half-life derivation from the stated 50-hour half-life and is not a
 *   restatement of that sentence.
 * - azathioprine: the "half-life of 5 hours" in the label is the decay rate for all
 *   35-S-containing metabolites, which the label says is explicitly not an estimate of the
 *   half-life of azathioprine itself. It is therefore recorded display-only, with no numeric and
 *   no derived steady-state note.
 * - cyclosporine: the fetched label is the VEVYE ophthalmic solution (single-ingredient
 *   cyclosporine, ophthalmic route), not a systemic cyclosporine product. Its pharmacokinetics
 *   section reports only that blood concentrations stayed below the limit of quantification, so
 *   that is the single recorded reading and no other pharmacokinetic parameter exists to record.
 * - dupilumab and etanercept are antibody/fusion-protein biologics with no PubChem compound
 *   record, so identity is the RxNorm concept alone.
 * - dupilumab: no anatomy region for skin is recorded. The fetched label never names skin as a
 *   site of action — its only sentence containing the word is an injection-site instruction.
 * - dupilumab pivotal results are split into two entries because the arm response rates and the
 *   between-group estimate sit in two different contiguous spans of the fetched trial record; the
 *   excerpts are never stitched together.
 * - cyclosporine pivotal results record both co-primary endpoints, including the eye-dryness
 *   endpoint on which the vehicle arm changed more than the active arm.
 * - etanercept: the label states no bioavailability, protein binding, volume of distribution,
 *   metabolism or excretion figures, so only the two stated parameters are recorded.
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

const ANASTROZOLE_LABEL = '03586c40-eb32-45c5-beb7-6762a6b78790'
const AZATHIOPRINE_LABEL = '040d010a-b1b2-4db7-905d-8aa7f1bab0cd'
const CYCLOSPORINE_LABEL = '0a60fccf-7e1b-44fe-e063-6394a90aadd5'
const DUPILUMAB_LABEL = '595f437d-2729-40bb-9c62-c8ece1f82780'
const ETANERCEPT_LABEL = 'a002b40c-097d-47a5-957f-7a7b1807af7f'

export const BACKGROUND_BATCH_13: RecordedBackgroundBySlug = {
  'alpha-lipoic-acid': {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '864',
      casNumber: '1077-28-7',
      rxcui: '6417',
      source: {
        kind: 'PUBCHEM',
        identifier: '864',
        label: "PubChem compound record matched for 'alpha-lipoic-acid'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (racemic alpha-lipoic acid, also named thioctic acid)',
      bioavailability: {
        display: 'about 30%',
        numeric: 30,
        unit: '%',
        populationContext:
          'absolute bioavailability of orally administered racemic alpha-lipoic acid in humans, as summarised in the study abstract',
        source: {
          kind: 'PUBMED',
          identifier: '14551180',
          label:
            'PubMed abstract: Plasma kinetics, metabolism, and urinary excretion of alpha-lipoic acid following oral administration in healthy volunteers (Teichert et al., 2003)',
          retrievedAt: FETCHED,
          excerpt:
            'Exogenous racemic alpha-lipoic acid orally administered for the symptomatic treatment of diabetic polyneuropathy is readily and nearly completely absorbed, with a limited absolute bioavailability of about 30% caused by high hepatic extraction.',
        },
      },
      tMax: {
        display: '0.5 to 1 hour',
        numeric: 0.75,
        unit: 'hours',
        populationContext:
          'healthy volunteers, single oral doses of 50 to 600 mg thioctic acid (racemic alpha-lipoic acid)',
        source: {
          kind: 'PUBMED',
          identifier: '10072479',
          label:
            'PubMed abstract: Dose-proportionality of oral thioctic acid, coincidence of assessments via pooled plasma and individual data (Breithaupt-Grogler et al., 1999)',
          retrievedAt: FETCHED,
          excerpt:
            'TA was rapidly absorbed (tmax, 0.5 to 1 h). Maximum plasma concentrations (Cmax) of the R-(+)-enantiomer were about 40-50% higher than those of the S-(-)-enantiomer',
        },
      },
      halfLife: {
        display: '0.5 hours',
        numeric: 0.5,
        unit: 'hours',
        populationContext:
          'healthy volunteers, decline in plasma concentration after single oral doses of thioctic acid (racemic alpha-lipoic acid)',
        source: {
          kind: 'PUBMED',
          identifier: '10072479',
          label:
            'PubMed abstract: Dose-proportionality of oral thioctic acid, coincidence of assessments via pooled plasma and individual data (Breithaupt-Grogler et al., 1999)',
          retrievedAt: FETCHED,
          excerpt: 'The decline observed in the plasma concentration was steep (t1/2, 0.5 h).',
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(0.5),
    },
  },

  anastrozole: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '2187',
      casNumber: '120511-73-1',
      unii: '2Z07MYW1AZ',
      rxcui: '84857',
      source: {
        kind: 'PUBCHEM',
        identifier: '2187',
        label: "PubChem compound record matched for 'anastrozole'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (film-coated tablets)',
      tMax: {
        display: 'within 2 hours of dosing',
        numeric: 2,
        unit: 'hours',
        populationContext:
          'maximum plasma concentrations under fasted conditions, as recorded in the label',
        source: fdaLabel(
          ANASTROZOLE_LABEL,
          'FDA label for anastrozole tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Absorption of anastrozole is rapid and maximum plasma concentrations typically occur within 2 hours of dosing under fasted conditions.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '50 hours',
        numeric: 50,
        unit: 'hours',
        populationContext: 'mean elimination half-life of anastrozole, as recorded in the label',
        source: fdaLabel(
          ANASTROZOLE_LABEL,
          'FDA label for anastrozole tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Hepatic metabolism accounts for approximately 85% of anastrozole elimination. Renal elimination accounts for approximately 10% of total clearance. The mean elimination half-life of anastrozole is 50 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '40%',
        numeric: 40,
        unit: '%',
        populationContext:
          'binding to plasma proteins in the therapeutic range, as recorded in the label',
        source: fdaLabel(
          ANASTROZOLE_LABEL,
          'FDA label for anastrozole tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Plasma concentrations approach steady-state levels at about 7 days of once daily dosing. Anastrozole is 40% bound to plasma proteins in the therapeutic range.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolism occurs by N-dealkylation, hydroxylation and glucuronidation; the major circulating metabolite, triazole, lacks pharmacologic activity',
        populationContext:
          'metabolites identified in human plasma and urine, as recorded in the label',
        source: fdaLabel(
          ANASTROZOLE_LABEL,
          'FDA label for anastrozole tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Metabolism of anastrozole occurs by N-dealkylation, hydroxylation and glucuronidation. Three metabolites of anastrozole (triazole, a glucuronide conjugate of hydroxy-anastrozole, and a glucuronide conjugate of anastrozole itself) have been identified in human plasma and urine.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Hepatic metabolism accounts for approximately 85% of elimination; renal elimination accounts for approximately 10% of total clearance',
        populationContext: 'human excretion data, as recorded in the label',
        source: fdaLabel(
          ANASTROZOLE_LABEL,
          'FDA label for anastrozole tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Eighty-five percent of radiolabeled anastrozole was recovered in feces and urine. Hepatic metabolism accounts for approximately 85% of anastrozole elimination. Renal elimination accounts for approximately 10% of total clearance.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(50),
    },
    productVariants: [
      {
        brandName: 'Anastrozole',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: '1 mg tablets',
        approvedUseAsRecorded:
          'Adjuvant treatment of postmenopausal women with hormone receptor-positive early breast cancer; first-line treatment of postmenopausal women with hormone receptor-positive or hormone receptor unknown locally advanced or metastatic breast cancer; treatment of advanced breast cancer in postmenopausal women with disease progression following tamoxifen therapy',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-02-11',
        source: fdaLabel(
          ANASTROZOLE_LABEL,
          'FDA label for anastrozole tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Anastrozole is an aromatase inhibitor indicated for: Adjuvant treatment of postmenopausal women with hormone receptor-positive early breast cancer ( 1.1 ) First-line treatment of postmenopausal women with hormone receptor-positive or hormone receptor unknown locally advanced or metastatic breast cancer ( 1.2 )',
        ),
      },
    ],
  },

  azathioprine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '2265',
      casNumber: '446-86-6',
      unii: 'MRK240IY2L',
      rxcui: '1256',
      source: {
        kind: 'PUBCHEM',
        identifier: '2265',
        label: "PubChem compound record matched for 'azathioprine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      tMax: {
        display: '1 to 2 hours',
        numeric: 1.5,
        unit: 'hours',
        populationContext:
          'time of maximum serum radioactivity after an oral dose of 35 S-labelled azathioprine, as recorded in the label',
        source: fdaLabel(
          AZATHIOPRINE_LABEL,
          'FDA label for azathioprine tablets, USP (openFDA)',
          'clinical_pharmacology',
          'Azathioprine is well absorbed following oral administration. Maximum serum radioactivity occurs at 1 to 2 hours after oral 35 S-azathioprine and decays with a half-life of 5 hours.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '5 hours',
        populationContext:
          'decay rate for all 35 S-containing metabolites of the drug; the label states this is not an estimate of the half-life of azathioprine itself',
        source: fdaLabel(
          AZATHIOPRINE_LABEL,
          'FDA label for azathioprine tablets, USP (openFDA)',
          'clinical_pharmacology',
          'Maximum serum radioactivity occurs at 1 to 2 hours after oral 35 S-azathioprine and decays with a half-life of 5 hours. This is not an estimate of the half-life of azathioprine itself, but is the decay rate for all 35 S-containing metabolites of the drug.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '30%',
        numeric: 30,
        unit: '%',
        populationContext:
          'azathioprine and mercaptopurine binding to serum proteins, as recorded in the label',
        source: fdaLabel(
          AZATHIOPRINE_LABEL,
          'FDA label for azathioprine tablets, USP (openFDA)',
          'clinical_pharmacology',
          'Azathioprine and mercaptopurine are moderately bound to serum proteins (30%) and are partially dialyzable see OVERDOSAGE .',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolized to 6-mercaptopurine (6-MP); both compounds are oxidized or methylated in erythrocytes and liver',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          AZATHIOPRINE_LABEL,
          'FDA label for azathioprine tablets, USP (openFDA)',
          'clinical_pharmacology',
          'Azathioprine is metabolized to 6-mercaptopurine (6-MP). Both compounds are rapidly eliminated from blood and are oxidized or methylated in erythrocytes and liver; no azathioprine or mercaptopurine is detectable in urine after 8 hours.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Both compounds are rapidly eliminated from blood; no azathioprine or mercaptopurine is detectable in urine after 8 hours',
        populationContext: 'human excretion data, as recorded in the label',
        source: fdaLabel(
          AZATHIOPRINE_LABEL,
          'FDA label for azathioprine tablets, USP (openFDA)',
          'clinical_pharmacology',
          'Azathioprine is metabolized to 6-mercaptopurine (6-MP). Both compounds are rapidly eliminated from blood and are oxidized or methylated in erythrocytes and liver; no azathioprine or mercaptopurine is detectable in urine after 8 hours.',
        ),
        concordance: 'label_only',
      },
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Initial dose (rheumatoid arthritis)',
          amountAsRecorded:
            'Approximately 1.0 mg/kg (50 to 100 mg) given as a single dose or on a twice-daily schedule',
        },
        {
          order: 2,
          periodAsRecorded:
            'Beginning at 6 to 8 weeks and thereafter by steps at 4-week intervals (rheumatoid arthritis)',
          amountAsRecorded:
            'Dose increments of 0.5 mg/kg daily, up to a maximum dose of 2.5 mg/kg per day',
          purposeAsRecorded:
            'Recorded as applying where there are no serious toxicities and the initial response is unsatisfactory',
        },
      ],
      source: fdaLabel(
        AZATHIOPRINE_LABEL,
        'FDA label for azathioprine tablets, USP (openFDA)',
        'dosage_and_administration, Rheumatoid Arthritis',
        'The initial dose should be approximately 1.0 mg/kg (50 to 100 mg) given as a single dose or on a twice-daily schedule. The dose may be increased, beginning at 6 to 8 weeks and thereafter by steps at 4-week intervals, if there are no serious toxicities and if initial response is unsatisfactory. Dose increments should be 0.5 mg/kg daily, up to a maximum dose of 2.5 mg/kg per day.',
      ),
    },
    productVariants: [
      {
        brandName: 'Azathioprine',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: '50 mg (as supplied by this distributor)',
        approvedUseAsRecorded:
          'Adjunct for the prevention of rejection in renal homotransplantation; management of active rheumatoid arthritis to reduce signs and symptoms',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-05-19',
        source: fdaLabel(
          AZATHIOPRINE_LABEL,
          'FDA label for azathioprine tablets, USP (openFDA)',
          'indications_and_usage; how_supplied',
          'Azathioprine tablets, USP are indicated as an adjunct for the prevention of rejection in renal homotransplantation. It is also indicated for the management of active rheumatoid arthritis to reduce signs and symptoms.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'immune-lymph',
        actionAsRecorded:
          'Immunosuppressive: delayed hypersensitivity and cellular cytotoxicity tests are suppressed to a greater degree than antibody responses, and lymph node hyperplasia was inhibited in an animal arthritis model',
        source: fdaLabel(
          AZATHIOPRINE_LABEL,
          'FDA label for azathioprine tablets, USP (openFDA)',
          'clinical_pharmacology, Immunoinflammatory Response',
          'Azathioprine is immunosuppressive, delayed hypersensitivity and cellular cytotoxicity tests being suppressed to a greater degree than are antibody responses. In the rat model of adjuvant arthritis, azathioprine has been shown to inhibit the lymph node hyperplasia, which precedes the onset of the signs of the disease.',
        ),
      },
      {
        regionCode: 'kidneys',
        actionAsRecorded:
          'Used for inhibition of renal homograft rejection; the label records that the mechanism for this action is somewhat obscure, and that the drug suppresses hypersensitivities of the cell-mediated type',
        source: fdaLabel(
          AZATHIOPRINE_LABEL,
          'FDA label for azathioprine tablets, USP (openFDA)',
          'clinical_pharmacology, Homograft Survival',
          'The use of azathioprine for inhibition of renal homograft rejection is well established, the mechanism(s) for this action are somewhat obscure. The drug suppresses hypersensitivities of the cell-mediated type and causes variable alterations in antibody production.',
        ),
      },
    ],
  },

  cyclosporine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5284373',
      casNumber: '59865-13-3',
      unii: '83HN0GTJ6D',
      rxcui: '3008',
      source: {
        kind: 'PUBCHEM',
        identifier: '5284373',
        label: "PubChem compound record matched for 'cyclosporine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Topical ocular (ophthalmic solution, one drop twice a day in each eye)',
      bioavailability: {
        display: 'Below the limit of quantification (0.1 ng/mL) at all timepoints',
        populationContext:
          'blood concentrations of cyclosporine following bilateral topical ocular dosing of one drop of VEVYE twice daily',
        source: fdaLabel(
          CYCLOSPORINE_LABEL,
          'FDA label for VEVYE (cyclosporine ophthalmic solution) 0.1% (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'Following bilateral topical ocular dosing of one drop of VEVYE twice daily, the blood concentrations of cyclosporine were below the limit of quantification (0.1 ng/mL) at all timepoints.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Vevye',
        formAsRecorded:
          'Clear, colorless non-preserved ophthalmic solution in a multiple-dose bottle',
        strengthsAsRecorded:
          'Cyclosporine 0.1% (1 mg/mL), delivering 0.01 mg of cyclosporine per one drop (0.01 mL)',
        approvedUseAsRecorded:
          'Treatment of the signs and symptoms of dry eye disease, as a calcineurin inhibitor immunosuppressant',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-02-26',
        source: fdaLabel(
          CYCLOSPORINE_LABEL,
          'FDA label for VEVYE (cyclosporine ophthalmic solution) 0.1% (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'VEVYE (cyclosporine ophthalmic solution) 0.1% is a calcineurin inhibitor immunosuppressant indicated for the treatment of the signs and symptoms of dry eye disease. ( 1 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'eye',
        actionAsRecorded:
          'A calcineurin inhibitor immunosuppressant applied to the eye, recorded for the signs and symptoms of dry eye disease',
        source: fdaLabel(
          CYCLOSPORINE_LABEL,
          'FDA label for VEVYE (cyclosporine ophthalmic solution) 0.1% (openFDA)',
          'indications_and_usage',
          'VEVYE (cyclosporine ophthalmic solution) 0.1% is a calcineurin inhibitor immunosuppressant indicated for the treatment of the signs and symptoms of dry eye disease. ( 1 )',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT04523129',
      includedAsRecorded: [
        'Signed ICF (Informed Consent Form)',
        'Patient-reported history of DED in both eyes',
        'Current use of OTC (over-the-counter) and/or artificial tears for dry eye symptoms',
        'Ability and willingness to follow instructions, including participation in all study assessments and visits',
      ],
      excludedAsRecorded: [
        'Women who are pregnant, nursing or planning a pregnancy',
        'Clinically significant slit-lamp findings or abnormal lid anatomy at screening',
        'Ocular/periocular malignancy',
        'History of herpetic keratitis',
        'Wear of contact lenses within 3 months prior to screening or anticipated use of contact lenses during the study',
        'Use of topical Cyclosporine A or Liftigrast within 2 months prior to screening',
        'Intraocular surgery or ocular laser surgery within the previous 6 months, or have any planned ocular and/or lid surgeries over the study period',
      ],
      studiedGroupAsRecorded: 'Adults 18 years and older, all sexes; not healthy volunteers',
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT04523129',
        label:
          'ClinicalTrials.gov record for ESSENCE 2 (CYS-004), the CyclASol (cyclosporine ophthalmic solution) dry eye disease trial named in the VEVYE label',
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: FETCHED,
        excerpt:
          'Intraocular surgery or ocular laser surgery within the previous 6 months, or have any planned ocular and/or lid surgeries over the study period',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT04523129',
        endpointAsRecorded:
          'Change from baseline in total corneal fluorescein staining, graded on the National Eye Institute scale from 0 (best) to 15 (worst): co-primary endpoint',
        activeResultAsRecorded:
          'CyclASol (cyclosporine ophthalmic solution) arm, 409 participants: least-squares mean change of -3.96 (standard error 0.146)',
        comparatorResultAsRecorded:
          'Vehicle arm, 395 participants: least-squares mean change of -3.55 (standard error 0.149)',
        timepointAsRecorded: 'Baseline and 1 month (day 29)',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT04523129',
          label: 'ClinicalTrials.gov posted results for ESSENCE 2 (CYS-004)',
          locator:
            'resultsSection.outcomeMeasuresModule, primary outcome: Change From Baseline in Total Corneal Fluorescein Staining',
          retrievedAt: FETCHED,
          excerpt:
            '"denoms":[{"units":"Participants","counts":[{"groupId":"OG000","value":"409"},{"groupId":"OG001","value":"395"}]}],"classes":[{"categories":[{"measurements":[{"groupId":"OG000","value":"-3.96","spread":"0.146"},{"groupId":"OG001","value":"-3.55","spread":"0.149"}]}]}]',
        },
      },
      {
        trialIdentifier: 'NCT04523129',
        endpointAsRecorded:
          'Change from baseline in eye dryness score, rated on a visual analogue scale from 0 to 100: co-primary endpoint',
        activeResultAsRecorded:
          'CyclASol (cyclosporine ophthalmic solution) arm, 409 participants: least-squares mean change of -12.2 (standard error 1.29)',
        comparatorResultAsRecorded:
          'Vehicle arm, 395 participants: least-squares mean change of -13.6 (standard error 1.31)',
        timepointAsRecorded: 'Baseline and 1 month (day 29)',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT04523129',
          label: 'ClinicalTrials.gov posted results for ESSENCE 2 (CYS-004)',
          locator:
            'resultsSection.outcomeMeasuresModule, primary outcome: Change From Baseline in Eye Dryness Score',
          retrievedAt: FETCHED,
          excerpt:
            '"denoms":[{"units":"Participants","counts":[{"groupId":"OG000","value":"409"},{"groupId":"OG001","value":"395"}]}],"classes":[{"categories":[{"measurements":[{"groupId":"OG000","value":"-12.2","spread":"1.29"},{"groupId":"OG001","value":"-13.6","spread":"1.31"}]}]}]',
        },
      },
    ],
  },

  dupilumab: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      rxcui: '1876376',
      source: {
        kind: 'RXNORM',
        identifier: '1876376',
        label: 'RxNorm concept for dupilumab (RxCUI 1876376)',
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Subcutaneous injection',
      bioavailability: {
        display: 'between 61% and 66%',
        numeric: 63.5,
        unit: '%',
        populationContext:
          'subjects with atopic dermatitis, asthma, chronic rhinosinusitis with nasal polyps and the other labelled conditions, following a subcutaneous dose',
        source: fdaLabel(
          DUPILUMAB_LABEL,
          'FDA label for DUPIXENT (dupilumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'The bioavailability of dupilumab following a SC dose is similar between AD, asthma, CRSwNP, EoE, PN, COPD, CSU, BP, and AFRS subjects, ranging between 61% and 66%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'approximately 1 week post dose',
        numeric: 168,
        unit: 'hours',
        populationContext:
          'time to peak mean concentrations after an initial subcutaneous dose of 600 mg, 400 mg or 300 mg',
        source: fdaLabel(
          DUPILUMAB_LABEL,
          'FDA label for DUPIXENT (dupilumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Following an initial subcutaneous (SC) dose of 600 mg, 400 mg, or 300 mg, dupilumab reached peak mean ± SD concentrations (C max ) of 70.1±24.1 mcg/mL, 41.8±12.4 mcg/mL, or 30.5±9.39 mcg/mL, respectively, by approximately 1 week post dose.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 4.8±1.3 L',
        numeric: 4.8,
        unit: 'L',
        populationContext: 'estimated total volume of distribution, as recorded in the label',
        source: fdaLabel(
          DUPILUMAB_LABEL,
          'FDA label for DUPIXENT (dupilumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The estimated total volume of distribution was approximately 4.8±1.3 L.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'The metabolic pathway has not been characterized; as a human monoclonal IgG4 antibody, dupilumab is expected to be degraded into small peptides and amino acids via catabolic pathways',
        populationContext: 'expected degradation pathway, as recorded in the label',
        source: fdaLabel(
          DUPILUMAB_LABEL,
          'FDA label for DUPIXENT (dupilumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'The metabolic pathway of dupilumab has not been characterized. As a human monoclonal IgG4 antibody, dupilumab is expected to be degraded into small peptides and amino acids via catabolic pathways in the same manner as endogenous IgG.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'After the last steady-state dose, median times to non-detectable concentration ranged from 9 to 13 weeks',
        populationContext:
          'adults and pediatric subjects 12 years of age and older, after the last steady-state dose, as recorded in the label',
        source: fdaLabel(
          DUPILUMAB_LABEL,
          'FDA label for DUPIXENT (dupilumab) injection (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'After the last steady-state dose of 300 mg QW, 300 mg Q2W, 200 mg Q2W, 300 mg Q4W, or 200 mg Q4W dupilumab, the median times to non-detectable concentration (<78 ng/mL) ranged from 9 to 13 weeks in adults and pediatric subjects 12 years of age and older.',
        ),
        concordance: 'label_only',
      },
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Initial dose (adults with atopic dermatitis)',
          amountAsRecorded: '600 mg (two 300 mg injections)',
        },
        {
          order: 2,
          periodAsRecorded: 'Following the initial dose (adults with atopic dermatitis)',
          amountAsRecorded: '300 mg given every 2 weeks (Q2W)',
        },
      ],
      source: fdaLabel(
        DUPILUMAB_LABEL,
        'FDA label for DUPIXENT (dupilumab) injection (openFDA)',
        'dosage_and_administration 2.3, Atopic Dermatitis Dosage in Adults',
        'Atopic Dermatitis Dosage in Adults ( 2.3 ): Recommended dosage is an initial dose of 600 mg (two 300 mg injections), followed by 300 mg given every 2 weeks (Q2W).',
      ),
    },
    productVariants: [
      {
        brandName: 'Dupixent',
        formAsRecorded:
          'Injection: clear to slightly opalescent solution in a single-dose pre-filled syringe with needle shield or a single-dose pre-filled pen',
        strengthsAsRecorded: '300 mg/2 mL (150 mg/mL) and 200 mg/1.14 mL (175 mg/mL)',
        approvedUseAsRecorded:
          'An interleukin-4 receptor alpha antagonist recorded for atopic dermatitis, asthma, chronic rhinosinusitis with nasal polyps, eosinophilic esophagitis, prurigo nodularis, chronic obstructive pulmonary disease, chronic spontaneous urticaria, bullous pemphigoid and allergic fungal rhinosinusitis, each with its own recorded age and severity limits',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-04-22',
        source: fdaLabel(
          DUPILUMAB_LABEL,
          'FDA label for DUPIXENT (dupilumab) injection (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'DUPIXENT is an interleukin-4 receptor alpha antagonist indicated: Atopic Dermatitis for the treatment of adult and pediatric patients aged 6 months and older with moderate-to-severe AD whose disease is not adequately controlled with topical prescription therapies or when those therapies are not advisable.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'immune-lymph',
        actionAsRecorded:
          'Blocks the IL-4 receptor alpha subunit on the multiple cell types that express it, including mast cells, basophils, eosinophils, macrophages and lymphocytes, inhibiting IL-4 and IL-13 cytokine-induced inflammatory responses',
        source: fdaLabel(
          DUPILUMAB_LABEL,
          'FDA label for DUPIXENT (dupilumab) injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Multiple cell types that express IL-4Rα (e.g., mast cells, basophils, eosinophils, macrophages, lymphocytes, epithelial cells, goblet cells) and inflammatory mediators (e.g., histamine, eicosanoids, leukotrienes, cytokines, chemokines) are involved in inflammation.',
        ),
      },
      {
        regionCode: 'nasal-airway',
        actionAsRecorded:
          'Recorded as an add-on maintenance treatment for inadequately controlled chronic rhinosinusitis with nasal polyps',
        source: fdaLabel(
          DUPILUMAB_LABEL,
          'FDA label for DUPIXENT (dupilumab) injection (openFDA)',
          'indications_and_usage 1.3',
          'Chronic Rhinosinusitis with Nasal Polyps DUPIXENT is indicated as an add-on maintenance treatment in adult and pediatric patients aged 12 years and older with inadequately controlled chronic rhinosinusitis with nasal polyps (CRSwNP).',
        ),
      },
      {
        regionCode: 'lungs',
        actionAsRecorded:
          'Recorded as an add-on maintenance treatment for moderate-to-severe asthma of an eosinophilic phenotype or oral corticosteroid dependent asthma, with the label noting it is not for the relief of acute bronchospasm',
        source: fdaLabel(
          DUPILUMAB_LABEL,
          'FDA label for DUPIXENT (dupilumab) injection (openFDA)',
          'indications_and_usage 1.2',
          'Asthma DUPIXENT is indicated as an add-on maintenance treatment of adult and pediatric patients aged 6 years and older with moderate-to-severe asthma characterized by an eosinophilic phenotype or with oral corticosteroid dependent asthma. Limitations of Use DUPIXENT is not indicated for the relief of acute bronchospasm or status asthmaticus.',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT02277743',
      includedAsRecorded: [
        'Male or female, 18 years or older',
        'Chronic AD (according to American Academy of Dermatology Consensus Criteria Eichenfield 2014) that has been present for at least 3 years before the screening visit',
        'Eczema Area and Severity Index (EASI) Score at least 16 at the screening and baseline visits',
        'Investigator Global Assessment (IGA) Score at least 3 (on the 0 to 4 IGA scale, in which 3 is moderate and 4 is severe) at the screening and baseline visits',
        'At least 10% body surface area (BSA) of AD involvement at the screening and baseline visits',
      ],
      excludedAsRecorded: [
        'Participation in a prior Dupilumab clinical study',
        'Treatment with an investigational drug within 8 weeks or within 5 half-lives (if known), whichever was longer, before the baseline visit',
        'Treatment with topical corticosteroids (TCS) or topical calcineurin inhibitors (TCI) within 1 week before the baseline visit',
        'Treatment with a live (attenuated) vaccine within 12 weeks before the baseline visit',
        'Known or suspected history of immunosuppression, including history of invasive opportunistic infections despite infection resolution',
        'History of human immunodeficiency virus (HIV) infection or positive HIV serology at screening',
      ],
      studiedGroupAsRecorded: 'Adults 18 years and older, all sexes; not healthy volunteers',
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT02277743',
        label:
          'ClinicalTrials.gov record for SOLO 1, the dupilumab monotherapy trial in adults with moderate-to-severe atopic dermatitis',
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: FETCHED,
        excerpt:
          '2. Chronic AD (according to American Academy of Dermatology Consensus Criteria Eichenfield 2014) that has been present for at least 3 years before the screening visit;',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT02277743',
        endpointAsRecorded:
          'Percentage of participants with an Investigator Global Assessment score of 0 or 1 and a reduction from baseline of at least 2 points at Week 16: primary endpoint, dupilumab 300 mg every 2 weeks compared with placebo',
        activeResultAsRecorded: 'Dupilumab every-2-week arm, 224 participants: 37.9%',
        comparatorResultAsRecorded: 'Placebo arm, 224 participants: 10.3%',
        timepointAsRecorded: 'Week 16',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT02277743',
          label: 'ClinicalTrials.gov posted results for SOLO 1',
          locator: 'resultsSection.outcomeMeasuresModule, primary outcome, arm response rates',
          retrievedAt: FETCHED,
          excerpt:
            '"denoms":[{"units":"Participants","counts":[{"groupId":"OG000","value":"224"},{"groupId":"OG001","value":"224"},{"groupId":"OG002","value":"223"}]}],"classes":[{"categories":[{"measurements":[{"groupId":"OG000","value":"10.3"},{"groupId":"OG001","value":"37.9"},{"groupId":"OG002","value":"37.2"}]}]}]',
        },
      },
      {
        trialIdentifier: 'NCT02277743',
        endpointAsRecorded:
          'Posted between-group analysis of the same primary endpoint: difference in the percentage of participants reaching an Investigator Global Assessment score of 0 or 1 with a reduction of at least 2 points',
        activeResultAsRecorded:
          'Dupilumab 300 mg q2w versus placebo: difference in percentages 27.7',
        differenceAsRecorded: '27.7 percentage points',
        uncertaintyAsRecorded:
          '95% two-sided confidence interval 20.18 to 35.17; p < 0.0001 by Cochran-Mantel-Haenszel test, with the threshold for significance at the 0.025 level',
        timepointAsRecorded: 'Week 16',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT02277743',
          label: 'ClinicalTrials.gov posted results for SOLO 1',
          locator:
            'resultsSection.outcomeMeasuresModule, primary outcome, analyses entry for dupilumab 300 mg q2w versus placebo',
          retrievedAt: FETCHED,
          excerpt:
            '"nonInferiorityType":"SUPERIORITY","pValue":"< 0.0001","pValueComment":"Threshold for significance at 0.025 level.","statisticalMethod":"Cochran-Mantel-Haenszel","paramType":"difference in percentages","paramValue":"27.7","ciPctValue":"95","ciNumSides":"TWO_SIDED","ciLowerLimit":"20.18","ciUpperLimit":"35.17","estimateComment":"Dupilumab 300 mg q2w vs Placebo"',
        },
      },
    ],
  },

  etanercept: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      rxcui: '214555',
      source: {
        kind: 'RXNORM',
        identifier: '214555',
        label: 'RxNorm concept for etanercept (RxCUI 214555)',
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Subcutaneous injection',
      tMax: {
        display: '69 ± 34 hours',
        numeric: 69,
        unit: 'hours',
        populationContext:
          '25 patients with rheumatoid arthritis, time to maximum serum concentration after a single 25 mg subcutaneous dose',
        source: fdaLabel(
          ETANERCEPT_LABEL,
          'FDA label for Enbrel (etanercept) injection (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'A maximum serum concentration (C max ) of 1.1 ± 0.6 mcg/mL and time to C max of 69 ± 34 hours was observed in these patients following a single 25 mg dose.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '102 ± 30 hours',
        numeric: 102,
        unit: 'hours',
        populationContext:
          '25 patients with rheumatoid arthritis, single 25 mg subcutaneous injection',
        source: fdaLabel(
          ETANERCEPT_LABEL,
          'FDA label for Enbrel (etanercept) injection (openFDA)',
          'clinical_pharmacology 12.3 Pharmacokinetics',
          'After administration of 25 mg of Enbrel by a single SC injection to 25 patients with RA, a mean ± standard deviation half-life of 102 ± 30 hours was observed with a clearance of 160 ± 80 mL/hr.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(102),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Starting dose (adult plaque psoriasis)',
          amountAsRecorded: '50 mg twice weekly for 3 months',
        },
        {
          order: 2,
          periodAsRecorded: 'Maintenance dose (adult plaque psoriasis)',
          amountAsRecorded: '50 mg once weekly',
        },
      ],
      source: fdaLabel(
        ETANERCEPT_LABEL,
        'FDA label for Enbrel (etanercept) injection (openFDA)',
        'dosage_and_administration 2.3, Table 1',
        'Table 1. Recommended Dosage for Adult Patients with RA, AS, PsA and PsO Patient Population Recommended Dosage Adult RA, AS, and PsA 50 mg weekly Adult PsO Starting Dose : 50 mg twice weekly for 3 months Maintenance Dose : 50 mg once weekly',
      ),
    },
    productVariants: [
      {
        brandName: 'Enbrel',
        formAsRecorded:
          'Injection: solution in a single-dose prefilled syringe, a single-dose prefilled SureClick autoinjector, a single-dose vial or an Enbrel Mini single-dose prefilled cartridge; also a lyophilized powder in a multiple-dose vial for reconstitution',
        strengthsAsRecorded:
          '25 mg/0.5 mL and 50 mg/mL solution; 25 mg lyophilized powder for reconstitution',
        approvedUseAsRecorded:
          'A tumor necrosis factor blocker recorded for adults with rheumatoid arthritis, psoriatic arthritis, ankylosing spondylitis and plaque psoriasis, and for pediatric patients with polyarticular juvenile idiopathic arthritis, juvenile psoriatic arthritis and plaque psoriasis, each with its own recorded age limit',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-05-11',
        source: fdaLabel(
          ETANERCEPT_LABEL,
          'FDA label for Enbrel (etanercept) injection (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Enbrel is a tumor necrosis factor (TNF) blocker indicated for the treatment of: Adult patients with: Rheumatoid Arthritis (RA) ( 1.1 ) Psoriatic Arthritis (PsA) ( 1.3 ) Ankylosing Spondylitis (AS) ( 1.4 ) Plaque Psoriasis (PsO) ( 1.5 ) Pediatric patients with: Polyarticular Juvenile Idiopathic Arthritis (pJIA), 2 years of age or older ( 1.2 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'immune-lymph',
        actionAsRecorded:
          'A dimeric soluble form of the p75 TNF receptor that binds TNF, a cytokine the label records as involved in normal inflammatory and immune responses, rendering it biologically inactive',
        source: fdaLabel(
          ETANERCEPT_LABEL,
          'FDA label for Enbrel (etanercept) injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'TNF is a naturally occurring cytokine that is involved in normal inflammatory and immune responses. It plays an important role in the inflammatory processes of RA, polyarticular JIA, PsA, and AS and the resulting joint pathology. In addition, TNF plays a role in the inflammatory process of PsO.',
        ),
      },
      {
        regionCode: 'joints',
        actionAsRecorded:
          'Blocks TNF, which the label records as playing an important role in the inflammatory processes of rheumatoid arthritis, polyarticular juvenile idiopathic arthritis, psoriatic arthritis and ankylosing spondylitis and the resulting joint pathology',
        source: fdaLabel(
          ETANERCEPT_LABEL,
          'FDA label for Enbrel (etanercept) injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'TNF is a naturally occurring cytokine that is involved in normal inflammatory and immune responses. It plays an important role in the inflammatory processes of RA, polyarticular JIA, PsA, and AS and the resulting joint pathology. In addition, TNF plays a role in the inflammatory process of PsO.',
        ),
      },
    ],
  },
}
