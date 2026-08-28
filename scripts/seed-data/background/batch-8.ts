import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import type { BackgroundSource } from '@/lib/background/types'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Batch 8: clonidine, codeine, coenzyme-q10, curcumin, dexamethasone, diclofenac, digoxin,
 * diltiazem, diphenhydramine, dulaglutide, exenatide.
 *
 * Honest omissions in this batch:
 * - coenzyme-q10: no applicable FDA drug label exists in the fetched artifact — registry
 *   identifiers from PubChem plus a single-dose pharmacokinetic reading from a fetched PubMed
 *   abstract (PMID 3781673) are recorded; nothing else.
 * - curcumin: the openFDA search returned a multi-ingredient homeopathic "Immune Support"
 *   product whose generic names do not match curcumin as a single medicine, so no label-derived
 *   module is recorded — registry identifiers from PubChem only.
 * - dexamethasone: the fetched label's clinical-pharmacology section states no
 *   pharmacokinetic numbers, so no pharmacokinetics module is recorded.
 * - diclofenac: the fetched label is a short over-the-counter topical-gel Drug Facts label with
 *   no pharmacokinetics section, so only identity and the recorded product are captured.
 * - digoxin: the label states the half-life only in days ("1.5-2 days"), so the half-life is
 *   recorded display-only, without a derived steady-state note.
 * - diltiazem: the repackager label's HOW SUPPLIED section states a capsule imprint but no
 *   milligram strength, so no product-variant module is recorded.
 * - diphenhydramine: the fetched label is a children's over-the-counter product with no
 *   pharmacokinetics section and no stated strength — registry identifiers only.
 * - dulaglutide: the artifact has no PubChem record, so registry identifiers (UNII and RxCUI)
 *   are recorded from the fetched TRULICITY label artifact instead; the label states the
 *   half-life only as "approximately 5 days", so it is recorded display-only.
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

const CLONIDINE_LABEL = '00c6d67a-bb11-4884-9eeb-4e1b8701a08b'
const CODEINE_LABEL = '010905f9-3bcb-4b50-9fe8-a3ad0010f14c'
const DEXAMETHASONE_LABEL = '01cfaa3e-5e30-18fa-e063-6394a90a084e'
const DICLOFENAC_LABEL = '005299ac-b6de-511f-e063-6294a90a29e0'
const DIGOXIN_LABEL = '03612934-62f4-4002-85af-6c66cd172acb'
const DILTIAZEM_LABEL = '0089fc7a-a7aa-4873-b699-39a1b21616ca'
const DULAGLUTIDE_LABEL = '0a4716d0-9c9c-4bc3-a8f1-6784599aae89'
const EXENATIDE_LABEL = '53d03c03-ebf7-418d-88a8-533eabd2ee4f'

export const BACKGROUND_BATCH_8: RecordedBackgroundBySlug = {
  clonidine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '2803',
      casNumber: '4205-90-7',
      unii: 'W76I6XXF06',
      rxcui: '142432',
      source: {
        kind: 'PUBCHEM',
        identifier: '2803',
        label: "PubChem compound record matched for 'clonidine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      bioavailability: {
        display: '70% to 80%',
        numeric: 75,
        unit: '%',
        populationContext: 'oral administration, as recorded in the label',
        source: fdaLabel(
          CLONIDINE_LABEL,
          'FDA label for clonidine hydrochloride tablets (openFDA)',
          'clinical_pharmacology Pharmacokinetics',
          'The absolute bioavailability of clonidine on oral administration is 70% to 80%. Peak plasma clonidine levels are attained in approximately 1 to 3 hours.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'approximately 1 to 3 hours',
        numeric: 2,
        unit: 'hours',
        populationContext: 'peak plasma clonidine levels after oral administration',
        source: fdaLabel(
          CLONIDINE_LABEL,
          'FDA label for clonidine hydrochloride tablets (openFDA)',
          'clinical_pharmacology Pharmacokinetics',
          'The absolute bioavailability of clonidine on oral administration is 70% to 80%. Peak plasma clonidine levels are attained in approximately 1 to 3 hours.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '12 to 16 hours',
        numeric: 14,
        unit: 'hours',
        populationContext:
          'elimination half-life following intravenous administration; prolonged in severe renal impairment, as recorded in the label',
        source: fdaLabel(
          CLONIDINE_LABEL,
          'FDA label for clonidine hydrochloride tablets (openFDA)',
          'clinical_pharmacology Pharmacokinetics',
          'Following intravenous administration, clonidine displays biphasic disposition with a distribution half-life of about 20 minutes and an elimination half-life ranging from 12 to 16 hours.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display: 'About half of the absorbed dose is metabolized in the liver',
        populationContext: 'human pharmacokinetic data, as recorded in the label',
        source: fdaLabel(
          CLONIDINE_LABEL,
          'FDA label for clonidine hydrochloride tablets (openFDA)',
          'clinical_pharmacology Pharmacokinetics',
          'Following oral administration about 40% to 60% of the absorbed dose is recovered in the urine as unchanged drug in 24 hours. About 50% of the absorbed dose is metabolized in the liver.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Following oral administration, roughly half of the absorbed dose is recovered in the urine as unchanged drug',
        populationContext: 'human pharmacokinetic data, as recorded in the label',
        source: fdaLabel(
          CLONIDINE_LABEL,
          'FDA label for clonidine hydrochloride tablets (openFDA)',
          'clinical_pharmacology Pharmacokinetics',
          'Following oral administration about 40% to 60% of the absorbed dose is recovered in the urine as unchanged drug in 24 hours. About 50% of the absorbed dose is metabolized in the liver.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(14),
    },
    productVariants: [
      {
        brandName: 'Clonidine Hydrochloride',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: '0.1 mg (as supplied by this repackager)',
        approvedUseAsRecorded:
          'Treatment of hypertension; may be employed alone or concomitantly with other antihypertensive agents',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-05-22',
        source: fdaLabel(
          CLONIDINE_LABEL,
          'FDA label for clonidine hydrochloride tablets (openFDA)',
          'indications_and_usage; how_supplied',
          'INDICATIONS AND USAGE Clonidine hydrochloride tablets are indicated in the treatment of hypertension. Clonidine hydrochloride tablets may be employed alone or concomitantly with other antihypertensive agents.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brainstem',
        actionAsRecorded:
          'Stimulates alpha-adrenoreceptors in the brain stem, resulting in reduced sympathetic outflow from the central nervous system',
        source: fdaLabel(
          CLONIDINE_LABEL,
          'FDA label for clonidine hydrochloride tablets (openFDA)',
          'clinical_pharmacology',
          'Clonidine stimulates alpha-adrenoreceptors in the brain stem. This action results in reduced sympathetic outflow from the central nervous system and in decreases in peripheral resistance, renal vascular resistance, heart rate, and blood pressure.',
        ),
      },
      {
        regionCode: 'heart',
        actionAsRecorded:
          'Reduced sympathetic outflow results in decreases in peripheral resistance, renal vascular resistance, heart rate, and blood pressure',
        source: fdaLabel(
          CLONIDINE_LABEL,
          'FDA label for clonidine hydrochloride tablets (openFDA)',
          'clinical_pharmacology',
          'Clonidine stimulates alpha-adrenoreceptors in the brain stem. This action results in reduced sympathetic outflow from the central nervous system and in decreases in peripheral resistance, renal vascular resistance, heart rate, and blood pressure.',
        ),
      },
    ],
  },

  codeine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5284371',
      casNumber: '76-57-3',
      unii: '11QV9BS0CB',
      rxcui: '1008493',
      source: {
        kind: 'PUBCHEM',
        identifier: '5284371',
        label: "PubChem compound record matched for 'codeine'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (tablets)',
      tMax: {
        display: '60 minutes post administration',
        numeric: 1,
        unit: 'hours',
        populationContext:
          'maximum plasma concentration after oral absorption, as recorded in the label',
        source: fdaLabel(
          CODEINE_LABEL,
          'FDA label for codeine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Codeine is absorbed from the gastrointestinal tract with maximum plasma concentration occurring 60 minutes post administration.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 3 hours',
        numeric: 3,
        unit: 'hours',
        populationContext:
          'plasma half-lives of codeine and its metabolites, as recorded in the label',
        source: fdaLabel(
          CODEINE_LABEL,
          'FDA label for codeine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'The plasma half-lives of codeine and its metabolites have been reported to be approximately 3 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'about 7% to 25%',
        numeric: 16,
        unit: '%',
        populationContext: 'binding to plasma proteins, as recorded in the label',
        source: fdaLabel(
          CODEINE_LABEL,
          'FDA label for codeine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Codeine has low plasma protein binding with about 7% to 25% of codeine bound to plasma proteins.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 3 to 6 L/kg',
        numeric: 4.5,
        unit: 'L/kg',
        populationContext: 'apparent volume of distribution, as recorded in the label',
        source: fdaLabel(
          CODEINE_LABEL,
          'FDA label for codeine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Codeine has been reported to have an apparent volume of distribution of approximately 3 to 6 L/kg, indicating extensive distribution of the drug into tissues.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolized by conjugation with glucuronic acid and via O-demethylation to morphine; cytochrome P450 2D6 is the major enzyme responsible for conversion of codeine to morphine',
        populationContext: 'human metabolism data, as recorded in the label',
        source: fdaLabel(
          CODEINE_LABEL,
          'FDA label for codeine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'UDP-glucuronosyltransferase (UGT) 2B7 and 2B4 are the major enzymes mediating glucuronidation of codeine to C6G. Cytochrome P450 2D6 is the major enzyme responsible for conversion of codeine to morphine and P450 3A4 is the major enzyme mediating conversion of codeine to norcodeine.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'The total dose of codeine is excreted almost entirely through the kidneys, a small share as unchanged codeine',
        populationContext: 'human excretion data, as recorded in the label',
        source: fdaLabel(
          CODEINE_LABEL,
          'FDA label for codeine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Excretion: Approximately 90% of the total dose of codeine is excreted through the kidneys, of which approximately 10% is unchanged codeine.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(3),
    },
    productVariants: [
      {
        brandName: 'Codeine sulfate',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: 'Tablets: 15 mg, 30 mg, and 60 mg',
        approvedUseAsRecorded:
          'Management of mild to moderate pain, where treatment with an opioid is appropriate and for which alternative treatments are inadequate, with the label limitations of use recorded beside that indication',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription opioid product; FDA label in effect 2025-12-22',
        source: fdaLabel(
          CODEINE_LABEL,
          'FDA label for codeine sulfate tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Codeine Sulfate Tablets are indicated for the management of mild to moderate pain, where treatment with an opioid is appropriate and for which alternative treatments are inadequate.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brainstem',
        actionAsRecorded:
          'Produces respiratory depression by direct action on brain stem respiratory centers, as recorded in the label pharmacodynamics',
        source: fdaLabel(
          CODEINE_LABEL,
          'FDA label for codeine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics',
          'Codeine produces respiratory depression by direct action on brain stem respiratory centers. The respiratory depression involves a reduction in the responsiveness of the brain stem respiratory centers to both increases in carbon dioxide tension and electrical stimulation.',
        ),
      },
      {
        regionCode: 'intestines',
        actionAsRecorded:
          'Causes a reduction in gastrointestinal motility; digestion of food in the small intestine is delayed and propulsive contractions are decreased',
        source: fdaLabel(
          CODEINE_LABEL,
          'FDA label for codeine sulfate tablets (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics',
          'Codeine causes a reduction in motility associated with an increase in smooth muscle tone in the antrum of the stomach and duodenum. Digestion of food in the small intestine is delayed and propulsive contractions are decreased.',
        ),
      },
    ],
  },

  'coenzyme-q10': {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5281915',
      casNumber: '303-98-0',
      rxcui: '21406',
      source: {
        kind: 'PUBCHEM',
        identifier: '5281915',
        label: "PubChem compound record matched for 'coenzyme-q10'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (single-dose pharmacokinetic study of deuterium-labelled CoQ10)',
      tMax: {
        display: '6.5 +/- 1.5 hours after administration',
        numeric: 6.5,
        unit: 'hours',
        populationContext:
          'sixteen healthy male subjects, single oral dose of deuterium-labelled coenzyme Q10',
        source: {
          kind: 'PUBMED',
          identifier: '3781673',
          label:
            'PubMed abstract: Pharmacokinetic study of deuterium-labelled coenzyme Q10 in man (Tomono et al., 1986)',
          retrievedAt: FETCHED,
          excerpt:
            'the mean plasma CoQ10 level attained a peak of 1.004 +/- 0.370 micrograms/ml at 6.5 +/- 1.5 h after administration, and the terminal elimination half-life was 33.19 +/- 5.32 h.',
        },
      },
      halfLife: {
        display: '33.19 +/- 5.32 hours',
        numeric: 33.19,
        unit: 'hours',
        populationContext:
          'sixteen healthy male subjects, terminal elimination half-life after a single oral dose of deuterium-labelled coenzyme Q10',
        source: {
          kind: 'PUBMED',
          identifier: '3781673',
          label:
            'PubMed abstract: Pharmacokinetic study of deuterium-labelled coenzyme Q10 in man (Tomono et al., 1986)',
          retrievedAt: FETCHED,
          excerpt:
            'the mean plasma CoQ10 level attained a peak of 1.004 +/- 0.370 micrograms/ml at 6.5 +/- 1.5 h after administration, and the terminal elimination half-life was 33.19 +/- 5.32 h.',
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(33.19),
    },
  },

  curcumin: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '969516',
      casNumber: '458-37-7',
      rxcui: '2955',
      source: {
        kind: 'PUBCHEM',
        identifier: '969516',
        label: "PubChem compound record matched for 'curcumin'",
        retrievedAt: FETCHED,
      },
    },
  },

  dexamethasone: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '5743',
      casNumber: '50-02-2',
      unii: '7S5I7G3JQL',
      rxcui: '22690',
      source: {
        kind: 'PUBCHEM',
        identifier: '5743',
        label: "PubChem compound record matched for 'dexamethasone'",
        retrievedAt: FETCHED,
      },
    },
    productVariants: [
      {
        brandName: 'Dexamethasone',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: 'Tablets: 1.5 mg (as supplied by this distributor)',
        approvedUseAsRecorded:
          'Control of severe or incapacitating allergic conditions intractable to adequate trials of conventional treatment, with further recorded indications spanning dermatologic, endocrine, gastrointestinal, hematologic, neoplastic, nervous system, ophthalmic, renal, respiratory and rheumatic disorders',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-10-29',
        source: fdaLabel(
          DEXAMETHASONE_LABEL,
          'FDA label for dexamethasone tablets (openFDA)',
          'indications_and_usage; how_supplied',
          'INDICATIONS AND USAGE A l l ergic States: Control of severe or incapacitating a llergic conditions intractable to adequate trials of conventional treatment in asthma, atopic dermatitis, contact dermatitis, drug hypersensitivity reactions, perennial or seasonal allergic rhinitis, and serum sickness.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'immune-lymph',
        actionAsRecorded:
          'Glucocorticoids modify the body’s immune responses to diverse stimuli; synthetic analogs including dexamethasone are primarily used for their anti-inflammatory effects',
        source: fdaLabel(
          DEXAMETHASONE_LABEL,
          'FDA label for dexamethasone tablets (openFDA)',
          'clinical_pharmacology',
          "Glucocorticoids cause varied metabolic effects. In addition, they modify the body's immune responses to diverse stimuli. Naturally occurring glucocorticoids (hydrocortisone and cortisone), which also have sodium-retaining properties, are used as replacement therapy in adrenocortical deficiency states.",
        ),
      },
    ],
  },

  diclofenac: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '3033',
      casNumber: '15307-86-5',
      unii: 'QTG126297Q',
      rxcui: '3355',
      source: {
        kind: 'PUBCHEM',
        identifier: '3033',
        label: "PubChem compound record matched for 'diclofenac'",
        retrievedAt: FETCHED,
      },
    },
    productVariants: [
      {
        brandName: 'Diclofenac Sodium',
        formAsRecorded: 'Topical gel, 1%',
        strengthsAsRecorded: '1% (diclofenac sodium topical gel)',
        approvedUseAsRecorded:
          'Temporary relief of arthritis pain only in the following areas: hand, wrist, elbow (upper body areas); foot, ankle, knee (lower body areas)',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Over-the-counter topical product; FDA label in effect 2024-07-29',
        source: fdaLabel(
          DICLOFENAC_LABEL,
          'FDA label for diclofenac sodium topical gel, 1% (openFDA)',
          'indications_and_usage (OTC Drug Facts uses)',
          'Uses for the temporary relief of arthritis pain ONLY in the following areas: hand, wrist, elbow (upper body areas) foot, ankle, knee (lower body areas) this product may take up to 7 days to work for arthritis pain; it is not for immediate relief.',
        ),
      },
    ],
  },

  digoxin: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '2724385',
      casNumber: '20830-75-5',
      unii: '73K4184T59',
      rxcui: '3407',
      source: {
        kind: 'PUBCHEM',
        identifier: '2724385',
        label: "PubChem compound record matched for 'digoxin'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (scored tablets)',
      bioavailability: {
        display: '60-80%',
        numeric: 70,
        unit: '%',
        populationContext:
          'absorption from tablets compared to an identical intravenous dose (absolute bioavailability), studies in adults',
        source: fdaLabel(
          DIGOXIN_LABEL,
          'FDA label for digoxin tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Absorption of digoxin from Digoxin Tablets has been demonstrated to be 60-80% complete compared to an identical intravenous dose of digoxin (absolute bioavailability).',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '1 to 3 hours',
        numeric: 2,
        unit: 'hours',
        populationContext:
          'peak serum concentrations following oral administration, studies in adults',
        source: fdaLabel(
          DIGOXIN_LABEL,
          'FDA label for digoxin tablets (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Following oral administration, peak serum concentrations of digoxin occur at 1 to 3 hours.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '1.5-2 days',
        populationContext: 'healthy volunteers with normal renal function',
        source: fdaLabel(
          DIGOXIN_LABEL,
          'FDA label for digoxin tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'In healthy volunteers with normal renal function, digoxin has a half-life of 1.5-2 days. The half-life in anuric patients is prolonged to 3.5-5 days.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 25%',
        numeric: 25,
        unit: '%',
        populationContext:
          'share of digoxin in the plasma bound to protein, as recorded in the label',
        source: fdaLabel(
          DIGOXIN_LABEL,
          'FDA label for digoxin tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Approximately 25% of digoxin in the plasma is bound to protein.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 475-500 L',
        numeric: 487.5,
        unit: 'L',
        populationContext:
          'large apparent volume of distribution from tissue concentration, studies in adults',
        source: fdaLabel(
          DIGOXIN_LABEL,
          'FDA label for digoxin tablets (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Digoxin is concentrated in tissues and therefore has a large apparent volume of distribution (approximately 475-500 L).',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Only a small percentage of a dose is metabolized in healthy volunteers, with polar urinary metabolites postulated to be formed via hydrolysis, oxidation, and conjugation',
        populationContext: 'healthy volunteers, as recorded in the label',
        source: fdaLabel(
          DIGOXIN_LABEL,
          'FDA label for digoxin tablets (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Only a small percentage (13%) of a dose of digoxin is metabolized in healthy volunteers. The urinary metabolites, which include dihydrodigoxin, digoxigenin bisdigitoxoside, and their glucuronide and sulfate conjugates are polar in nature and are postulated to be formed via hydrolysis, oxidation, and conjugation.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Excreted mostly unchanged in the urine following intravenous administration; renal excretion is proportional to creatinine clearance',
        populationContext: 'healthy volunteers, as recorded in the label',
        source: fdaLabel(
          DIGOXIN_LABEL,
          'FDA label for digoxin tablets (openFDA)',
          'clinical_pharmacology 12.3 Excretion',
          'Following intravenous administration to healthy volunteers, 50-70% of a digoxin dose is excreted unchanged in the urine. Renal excretion of digoxin is proportional to creatinine clearance and is largely independent of urine flow.',
        ),
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Digoxin',
        formAsRecorded: 'Scored tablets',
        strengthsAsRecorded: 'Scored tablets: 125 mcg and 250 mcg',
        approvedUseAsRecorded:
          'Treatment of mild to moderate heart failure in adults; increasing myocardial contractility in pediatric patients with heart failure; control of resting ventricular rate in patients with chronic atrial fibrillation in adults',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-09-04',
        source: fdaLabel(
          DIGOXIN_LABEL,
          'FDA label for digoxin tablets (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'Digoxin is a cardiac glycoside indicated for: Treatment of mild to moderate heart failure in adults. ( 1.1 ) Increasing myocardial contractility in pediatric patients with heart failure. ( 1.2 ) Control of resting ventricular rate in patients with chronic atrial fibrillation in adults. ( 1.3 )',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'heart',
        actionAsRecorded:
          'By inhibiting Na-K ATPase, causes increased availability of intracellular calcium in the myocardium and conduction system, with consequent increased inotropy',
        source: fdaLabel(
          DIGOXIN_LABEL,
          'FDA label for digoxin tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'By inhibiting Na-K ATPase, digoxin causes increased availability of intracellular calcium in the myocardium and conduction system, with consequent increased inotropy, increased automaticity, and reduced conduction velocity',
        ),
      },
      {
        regionCode: 'blood-vessels',
        actionAsRecorded:
          'Reduces catecholamine reuptake at nerve terminals, rendering blood vessels more sensitive to endogenous or exogenous catecholamines',
        source: fdaLabel(
          DIGOXIN_LABEL,
          'FDA label for digoxin tablets (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'reduces catecholamine reuptake at nerve terminals, rendering blood vessels more sensitive to endogenous or exogenous catecholamines',
        ),
      },
    ],
  },

  diltiazem: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '39186',
      casNumber: '42399-41-7',
      unii: 'OLH94387TE',
      rxcui: '203211',
      source: {
        kind: 'PUBCHEM',
        identifier: '39186',
        label: "PubChem compound record matched for 'diltiazem'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Oral (extended-release capsules)',
      bioavailability: {
        display: 'about 40%',
        numeric: 40,
        unit: '%',
        populationContext:
          'absolute bioavailability compared to intravenous administration, after an extensive first-pass effect',
        source: fdaLabel(
          DILTIAZEM_LABEL,
          'FDA label for diltiazem hydrochloride extended-release capsules (openFDA)',
          'clinical_pharmacology Pharmacokinetics and Metabolism',
          'Diltiazem is well absorbed from the gastrointestinal tract and is subject to an extensive first-pass effect, giving an absolute bioavailability (compared to intravenous administration) of about 40%.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: 'between 10 and 14 hours',
        numeric: 12,
        unit: 'hours',
        populationContext:
          'peak plasma levels after a single 360 mg dose of the extended-release capsule',
        source: fdaLabel(
          DILTIAZEM_LABEL,
          'FDA label for diltiazem hydrochloride extended-release capsules (openFDA)',
          'clinical_pharmacology Pharmacokinetics and Metabolism',
          'A single 360 mg dose of the capsule results in detectable plasma levels within 2 hours and peak plasma levels between 10 and 14 hours; absorption occurs throughout the dosing interval.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '5 to 8 hours',
        numeric: 6.5,
        unit: 'hours',
        populationContext:
          'apparent elimination half-life of the extended-release capsules after single or multiple dosing',
        source: fdaLabel(
          DILTIAZEM_LABEL,
          'FDA label for diltiazem hydrochloride extended-release capsules (openFDA)',
          'clinical_pharmacology Pharmacokinetics and Metabolism',
          'The apparent elimination half-life after single or multiple dosing is 5 to 8 hours.',
        ),
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '70% to 80%',
        numeric: 75,
        unit: '%',
        populationContext: 'in vitro binding studies, as recorded in the label',
        source: fdaLabel(
          DILTIAZEM_LABEL,
          'FDA label for diltiazem hydrochloride extended-release capsules (openFDA)',
          'clinical_pharmacology Pharmacokinetics and Metabolism',
          'In vitro binding studies show diltiazem hydrochloride is 70% to 80% bound to plasma proteins.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Undergoes extensive metabolism; only a small share of the unchanged drug appears in the urine',
        populationContext: 'human pharmacokinetic data, as recorded in the label',
        source: fdaLabel(
          DILTIAZEM_LABEL,
          'FDA label for diltiazem hydrochloride extended-release capsules (openFDA)',
          'clinical_pharmacology Pharmacokinetics and Metabolism',
          'Diltiazem hydrochloride undergoes extensive metabolism in which only 2% to 4% of the unchanged drug appears in the urine. Drugs which induce or inhibit hepatic microsomal enzymes may alter diltiazem disposition.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(6.5),
    },
    anatomyTargets: [
      {
        regionCode: 'blood-vessels',
        actionAsRecorded:
          'Produces its antihypertensive effect primarily by relaxation of vascular smooth muscle and the resultant decrease in peripheral vascular resistance',
        source: fdaLabel(
          DILTIAZEM_LABEL,
          'FDA label for diltiazem hydrochloride extended-release capsules (openFDA)',
          'clinical_pharmacology Mechanisms of Action',
          'Diltiazem hydrochloride extended-release capsules produce its antihypertensive effect primarily by relaxation of vascular smooth muscle and the resultant decrease in peripheral vascular resistance.',
        ),
      },
      {
        regionCode: 'heart',
        actionAsRecorded:
          'Produces increases in exercise tolerance, probably due to its ability to reduce myocardial oxygen demand via reductions in heart rate and systemic blood pressure',
        source: fdaLabel(
          DILTIAZEM_LABEL,
          'FDA label for diltiazem hydrochloride extended-release capsules (openFDA)',
          'clinical_pharmacology Mechanisms of Action',
          'Diltiazem hydrochloride extended-release capsules have been shown to produce increases in exercise tolerance, probably due to its ability to reduce myocardial oxygen demand. This is accomplished via reductions in heart rate and systemic blood pressure at submaximal and maximal workloads.',
        ),
      },
    ],
  },

  diphenhydramine: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '3100',
      casNumber: '58-73-1',
      unii: 'TC2D6JAD40',
      rxcui: '1362',
      source: {
        kind: 'PUBCHEM',
        identifier: '3100',
        label: "PubChem compound record matched for 'diphenhydramine'",
        retrievedAt: FETCHED,
      },
    },
  },

  dulaglutide: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      unii: 'WTT295HSY5',
      rxcui: '1551291',
      source: fdaLabel(
        DULAGLUTIDE_LABEL,
        'FDA label for TRULICITY (dulaglutide) injection (openFDA)',
        'openFDA identity metadata',
      ),
    },
    pharmacokinetics: {
      routeAsRecorded: 'Subcutaneous injection, once weekly',
      bioavailability: {
        display: '65% (single 0.75 mg dose) and 47% (single 1.5 mg dose)',
        numeric: 56,
        unit: '%',
        populationContext: 'mean absolute bioavailability following subcutaneous administration',
        source: fdaLabel(
          DULAGLUTIDE_LABEL,
          'FDA label for TRULICITY (dulaglutide) injection (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'The mean absolute bioavailability of dulaglutide following subcutaneous administration of single 0.75 mg and 1.5 mg doses was 65% and 47%, respectively.',
        ),
        concordance: 'label_only',
      },
      tMax: {
        display: '24 to 72 hours (median 48 hours)',
        numeric: 48,
        unit: 'hours',
        populationContext:
          'time to maximum plasma concentration at steady state following subcutaneous administration',
        source: fdaLabel(
          DULAGLUTIDE_LABEL,
          'FDA label for TRULICITY (dulaglutide) injection (openFDA)',
          'clinical_pharmacology 12.3',
          'Following subcutaneous administration, the time to maximum plasma concentration of dulaglutide at steady state ranges from 24 to 72 hours, with a median of 48 hours.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 5 days',
        populationContext: 'elimination half-life, as recorded in the label',
        source: fdaLabel(
          DULAGLUTIDE_LABEL,
          'FDA label for TRULICITY (dulaglutide) injection (openFDA)',
          'clinical_pharmacology 12.3 Elimination',
          'The apparent population mean clearance of dulaglutide was 0.142 L/h. The elimination half-life of dulaglutide was approximately 5 days.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'central 3.09 L; peripheral 5.98 L',
        numeric: 3.09,
        unit: 'L',
        populationContext:
          'apparent population mean volumes of distribution, as recorded in the label',
        source: fdaLabel(
          DULAGLUTIDE_LABEL,
          'FDA label for TRULICITY (dulaglutide) injection (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'Apparent population mean central volume of distribution was 3.09 L and the apparent population mean peripheral volume of distribution was 5.98 L.',
        ),
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Presumed to be degraded into its component amino acids by general protein catabolism pathways',
        populationContext: 'presumed degradation pathway, as recorded in the label',
        source: fdaLabel(
          DULAGLUTIDE_LABEL,
          'FDA label for TRULICITY (dulaglutide) injection (openFDA)',
          'clinical_pharmacology 12.3 Metabolism',
          'Dulaglutide is presumed to be degraded into its component amino acids by general protein catabolism pathways.',
        ),
        concordance: 'label_only',
      },
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Starting dosage (adults)',
          amountAsRecorded: '0.75 mg injected subcutaneously once weekly',
        },
        {
          order: 2,
          periodAsRecorded: 'For additional glycemic control',
          amountAsRecorded: '1.5 mg once weekly',
        },
        {
          order: 3,
          periodAsRecorded:
            'If additional glycemic control is needed, after at least 4 weeks on the current dosage',
          amountAsRecorded:
            'Increase in 1.5 mg increments; maximum recorded dosage 4.5 mg injected subcutaneously once weekly',
        },
      ],
      source: fdaLabel(
        DULAGLUTIDE_LABEL,
        'FDA label for TRULICITY (dulaglutide) injection (openFDA)',
        'dosage_and_administration 2.1 Adult Dosage',
        'The recommended starting dosage of TRULICITY is 0.75 mg injected subcutaneously once weekly. Increase the dosage to 1.5 mg once weekly for additional glycemic control. If additional glycemic control is needed, increase the dosage in 1.5 mg increments after at least 4 weeks on the current dosage. The maximum recommended dosage is 4.5 mg injected subcutaneously once weekly.',
      ),
    },
    productVariants: [
      {
        brandName: 'Trulicity',
        formAsRecorded: 'Injection: solution in a single-dose pen',
        strengthsAsRecorded:
          '0.75 mg/0.5 mL, 1.5 mg/0.5 mL, 3 mg/0.5 mL, and 4.5 mg/0.5 mL solution in a single-dose pen',
        approvedUseAsRecorded:
          'As an adjunct to diet and exercise to improve glycemic control in adults and pediatric patients 10 years of age and older with type 2 diabetes mellitus; to reduce the risk of major adverse cardiovascular events in adults with type 2 diabetes mellitus who have established cardiovascular disease or multiple cardiovascular risk factors',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2023-08-05',
        source: fdaLabel(
          DULAGLUTIDE_LABEL,
          'FDA label for TRULICITY (dulaglutide) injection (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'TRULICITY ® is indicated: As an adjunct to diet and exercise to improve glycemic control in adults and pediatric patients 10 years of age and older with type 2 diabetes mellitus. To reduce the risk of major adverse cardiovascular events (cardiovascular death, non-fatal myocardial infarction, or non-fatal stroke) in adults with type 2 diabetes mellitus',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'pancreas',
        actionAsRecorded:
          'Activates the GLP-1 receptor, a membrane-bound cell-surface receptor coupled to adenylyl cyclase in pancreatic beta cells, leading to glucose-dependent insulin release',
        source: fdaLabel(
          DULAGLUTIDE_LABEL,
          'FDA label for TRULICITY (dulaglutide) injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Dulaglutide activates the GLP-1 receptor, a membrane-bound cell-surface receptor coupled to adenylyl cyclase in pancreatic beta cells. Dulaglutide increases intracellular cyclic AMP (cAMP) in beta cells leading to glucose-dependent insulin release.',
        ),
      },
      {
        regionCode: 'stomach',
        actionAsRecorded: 'Decreases glucagon secretion and slows gastric emptying',
        source: fdaLabel(
          DULAGLUTIDE_LABEL,
          'FDA label for TRULICITY (dulaglutide) injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'Dulaglutide also decreases glucagon secretion and slows gastric emptying.',
        ),
      },
    ],
    applicability: {
      trialIdentifier: 'NCT01394952',
      includedAsRecorded: [
        'Type 2 diabetes with Hemoglobin A1c equal to or less than 9.5% (equal to or less than 81 mmol/mol)',
        'Anti-hyperglycemic drug naive or treated with up to 2 oral hyperglycemic drugs with or without a glucagon-like peptide-1analog or basal insulin, or basal insulin alone',
        'On stable antihyperglycemic regimen for at least 3 months',
        'Age equal to or greater than 50 years with established clinical vascular disease, or age equal to or greater than 55 years and subclinical vascular disease or age equal to or greater than 60 years and at least 2 or more cardiovascular risk factors',
      ],
      excludedAsRecorded: [
        'Uncontrolled diabetes requiring immediate therapy',
        'History of severe hypoglycemia in past year',
        'Acute coronary or cerebrovascular event within past 2 months',
        'Planned or anticipated revascularization procedure',
        'History of pancreatitis, hepatic insufficiency , chronic renal failure or of C-cell thyroid disorder',
        'Pregnancy or planned pregnancy during the trial period',
      ],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT01394952',
        label:
          'ClinicalTrials.gov record for the REWIND trial (dulaglutide cardiovascular outcomes)',
        locator: 'protocolSection.eligibilityModule',
        retrievedAt: FETCHED,
        excerpt:
          'Type 2 diabetes with Hemoglobin A1c equal to or less than 9.5% (equal to or less than 81 mmol/mol) * Anti-hyperglycemic drug naive or treated with up to 2 oral hyperglycemic drugs with or without a glucagon-like peptide-1analog or basal insulin, or basal insulin alone * On stable antihyperglycemic regimen for at least 3 months',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT01394952',
        endpointAsRecorded:
          'Time from randomization to first occurrence of cardiovascular death, non-fatal myocardial infarction, or non-fatal stroke (a composite cardiovascular outcome): primary endpoint',
        activeResultAsRecorded: 'Dulaglutide: 594 of 4949 participants with an event',
        comparatorResultAsRecorded: 'Placebo: 663 of 4952 participants with an event',
        differenceAsRecorded: 'Hazard ratio 0.88',
        uncertaintyAsRecorded:
          '95.33% CI 0.79 to 0.99; p=0.026 (Cox proportional hazards regression)',
        timepointAsRecorded:
          'From randomization to study completion (median follow-up of 5.4 years)',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT01394952',
          label: 'ClinicalTrials.gov posted results for the REWIND trial',
          locator: 'resultsSection.outcomeMeasuresModule, primary outcome',
          retrievedAt: FETCHED,
          excerpt:
            '"timeFrame": "From randomization to first occurrence or death from any cause or study completion (Median Follow-Up of 5.4 Years)" Placebo {"value": "4952"} Dulaglutide {"value": "4949"} Placebo {"value": "663"} Dulaglutide {"value": "594"} "paramType": "Hazard Ratio (HR)", "paramValue": "0.88", "ciPctValue": "95.33", "ciLowerLimit": "0.79", "ciUpperLimit": "0.99", "pValue": "0.026"',
        },
      },
    ],
  },

  exenatide: {
    version: 'medicine-background/v1',
    authoredAt: FETCHED,
    registryIdentifiers: {
      pubchemCid: '45588096',
      casNumber: '141758-74-9',
      unii: '9P1872D4OL',
      rxcui: '60548',
      source: {
        kind: 'PUBCHEM',
        identifier: '45588096',
        label: "PubChem compound record matched for 'exenatide'",
        retrievedAt: FETCHED,
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'Subcutaneous injection, twice daily',
      tMax: {
        display: '2.1 hours (median)',
        numeric: 2.1,
        unit: 'hours',
        populationContext: 'patients with type 2 diabetes, following subcutaneous administration',
        source: fdaLabel(
          EXENATIDE_LABEL,
          'FDA label for BYETTA (exenatide) injection (openFDA)',
          'clinical_pharmacology 12.3 Absorption',
          'Following SC administration to patients with type 2 diabetes, exenatide reaches median peak plasma concentrations in 2.1 hours.',
        ),
        concordance: 'label_only',
      },
      halfLife: {
        display: '2.4 hours',
        numeric: 2.4,
        unit: 'hours',
        populationContext: 'mean terminal half-life in humans, as recorded in the label',
        source: fdaLabel(
          EXENATIDE_LABEL,
          'FDA label for BYETTA (exenatide) injection (openFDA)',
          'clinical_pharmacology 12.3 Metabolism and Elimination',
          'The mean apparent clearance of exenatide in humans is 9.1 L/hour and the mean terminal half-life is 2.4 hours. These pharmacokinetic characteristics of exenatide are independent of the dose.',
        ),
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '28.3 L',
        numeric: 28.3,
        unit: 'L',
        populationContext:
          'mean apparent volume of distribution following a single subcutaneous dose',
        source: fdaLabel(
          EXENATIDE_LABEL,
          'FDA label for BYETTA (exenatide) injection (openFDA)',
          'clinical_pharmacology 12.3 Distribution',
          'The mean apparent volume of distribution of exenatide following SC administration of a single dose of BYETTA is 28.3 L.',
        ),
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Predominantly eliminated by glomerular filtration with subsequent proteolytic degradation',
        populationContext: 'nonclinical studies, as recorded in the label',
        source: fdaLabel(
          EXENATIDE_LABEL,
          'FDA label for BYETTA (exenatide) injection (openFDA)',
          'clinical_pharmacology 12.3 Metabolism and Elimination',
          'Nonclinical studies have shown that exenatide is predominantly eliminated by glomerular filtration with subsequent proteolytic degradation.',
        ),
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(2.4),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Initiation',
          amountAsRecorded: '5 mcg per dose twice daily',
        },
        {
          order: 2,
          periodAsRecorded: 'After 1 month of therapy, based on clinical response',
          amountAsRecorded: '10 mcg twice daily',
          purposeAsRecorded:
            'To reduce the risk of gastrointestinal adverse reactions, as recorded in the label',
        },
      ],
      source: fdaLabel(
        EXENATIDE_LABEL,
        'FDA label for BYETTA (exenatide) injection (openFDA)',
        'dosage_and_administration 2.1 Recommended Dosing',
        'Initiate at 5 mcg per dose twice daily; increase to 10 mcg twice daily after 1 month based on clinical response. ( 2.1 )',
      ),
    },
    productVariants: [
      {
        brandName: 'Byetta',
        formAsRecorded: 'Injection: solution in a single-patient-use prefilled pen',
        strengthsAsRecorded:
          '5 mcg per dose (300 mcg/1.2 mL) and 10 mcg per dose (600 mcg/2.4 mL) prefilled pens, 60 doses each',
        approvedUseAsRecorded:
          'As an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-09-02',
        source: fdaLabel(
          EXENATIDE_LABEL,
          'FDA label for BYETTA (exenatide) injection (openFDA)',
          'indications_and_usage; dosage_forms_and_strengths',
          'BYETTA is indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus.',
        ),
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'pancreas',
        actionAsRecorded:
          'A GLP-1 receptor agonist that enhances glucose-dependent insulin secretion by the pancreatic beta-cell and suppresses inappropriately elevated glucagon secretion',
        source: fdaLabel(
          EXENATIDE_LABEL,
          'FDA label for BYETTA (exenatide) injection (openFDA)',
          'clinical_pharmacology 12.1 Mechanism of Action',
          'BYETTA is a GLP-1 receptor agonist that enhances glucose-dependent insulin secretion by the pancreatic beta-cell, suppresses inappropriately elevated glucagon secretion, and slows gastric emptying.',
        ),
      },
      {
        regionCode: 'stomach',
        actionAsRecorded:
          'Slows gastric emptying, thereby reducing the rate at which meal-derived glucose appears in the circulation',
        source: fdaLabel(
          EXENATIDE_LABEL,
          'FDA label for BYETTA (exenatide) injection (openFDA)',
          'clinical_pharmacology 12.2 Pharmacodynamics',
          'BYETTA slows gastric emptying, thereby reducing the rate at which meal-derived glucose appears in the circulation.',
        ),
      },
    ],
  },
}
