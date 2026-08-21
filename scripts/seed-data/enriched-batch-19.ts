import type { SeedDossier } from '@/lib/seed-types'

/**
 * Enriched batch 19 — what stops you being sick, and what makes you go.
 *
 * Eight drugs from the two shelves of the pharmacy nobody writes about: four antiemetics
 * (ondansetron, metoclopramide, prochlorperazine, aprepitant) and four laxatives (bisacodyl,
 * docusate, lactulose, linaclotide). Between them they are dispensed hundreds of millions of times
 * a year, mostly to people who are already unwell for some other reason, and almost none of them
 * has ever been marketed on the strength of a hard clinical outcome.
 *
 * That is what makes the group worth auditing, and the audits here are unusually unflattering.
 * A Cochrane review of the whole antiemetic class in the emergency department found nothing
 * statistically better than saline. A 2013 randomised trial found that the stool softener sold in
 * every supermarket does nothing measurable when added to a stimulant laxative. A drug approved in
 * 1956 was never required to prove it worked. A nasal spray failed its primary endpoint and was
 * approved anyway, for women only, on a subgroup. Two of the eight carry a boxed warning, and one
 * of those boxed warnings was written on an incidence estimate that a later review put at roughly
 * a tenth of the figure the warning was based on.
 *
 * Every DOI, PMID, NCT number and FDA application number below was resolved at the time of writing:
 * DOIs through the Crossref REST API, PMIDs through NCBI E-utilities, NCT numbers through the
 * ClinicalTrials.gov v2 API, application numbers and label text through the openFDA Drugs@FDA and
 * drug/label endpoints. Every effect size, arm size, relative risk, confidence interval and p-value
 * is copied from the published abstract or from the label text on the record, never from memory.
 * Where a number could not be sourced, the field is absent.
 *
 * Six conventions apply to the whole group.
 *
 * 1. PRICING IS A PRICE, NOT A COST. `retailPricePerDoseOrYear` carries the United States pharmacy
 *    acquisition cost already held on the record, from the CMS National Average Drug Acquisition
 *    Cost survey, with the survey date and the number of listed products it is a median of.
 *    `synthesisCostPerDose` is empty on every dossier here: no published per-dose cost-of-production
 *    figure for any of these molecules could be verified. The cost-of-production literature that was
 *    checked — Hill, Barber and Gotham in BMJ Global Health — publishes an estimation method and an
 *    aggregate range and carries no per-dose figure for these compounds. It is cited as `costSource`
 *    so a reader can see what was checked and what it does not contain. Docusate carries no pricing
 *    block at all, because the record holds no NADAC entry for it.
 *
 * 2. THE STRUCTURES ARE THE ONES ALREADY ON THE RECORD. Each SMILES string was pulled from PubChem
 *    by the ingestion pipeline and passed this repository's structure parser before curation began.
 *    None was substituted. Linaclotide is a fourteen-residue peptide with three disulfide bridges,
 *    and it is declared `small_molecule_smiles` for the same reason the record does: a one-letter
 *    residue string cannot express which cysteine is bonded to which.
 *
 * 3. NAUSEA AND VOMITING ARE DIFFERENT ENDPOINTS AND EVERY ANTIEMETIC PAGE SAYS SO. "Complete
 *    response" in the chemotherapy literature means no vomiting and no rescue medication. It does
 *    not mean the patient stopped feeling sick. Vomiting is countable and nausea is a rating scale,
 *    the two do not move together, and the drug that best prevents one is not always the one that
 *    best relieves the other.
 *
 * 4. STOOLS PER WEEK IS A SURROGATE TOO. Every laxative page here is built on complete spontaneous
 *    bowel movements, stool consistency scores or blood ammonia. Only lactulose has randomised
 *    evidence on an outcome a patient would recognise as an outcome, and it took forty years and
 *    two contradictory systematic reviews to get there.
 *
 * 5. THE AUDIT POINTS ARE NOT A HIGHLIGHT REEL. Every dossier carries at least one 'inferred' or
 *    'failed' entry because the literature supplies them: ondansetron's registration trials for
 *    highly emetogenic chemotherapy used a historical placebo control, metoclopramide's nasal spray
 *    missed its primary endpoint, prochlorperazine causes akathisia in more than a third of the
 *    people given it intravenously, aprepitant's pivotal trials used a comparator dose of
 *    ondansetron that has since been withdrawn on cardiac safety grounds, bisacodyl's longest
 *    placebo-controlled trial is four weeks, docusate has failed every controlled comparison it has
 *    been given, lactulose was declared unsupported in 2004 and rehabilitated in 2016, and
 *    linaclotide's number needed to treat is five at best and eight in the trial that reported one.
 *
 * 6. NO DOSING, PROTOCOL OR PROCUREMENT GUIDANCE. Strengths, durations and routes appear only where
 *    they are part of a trial's description or a label's identity. Nothing here tells a reader what
 *    to take, how much, for how long, or where to get it.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group; it publishes an estimation method and an aggregate range and carries no per-dose figure for the drugs in this file',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

const ED_ANTIEMETIC_COCHRANE = {
  label:
    'Furyk JS, Meek RA, Egerton-Warburton D. Drugs for the treatment of nausea and vomiting in adults in the emergency department setting. Cochrane Database Syst Rev 2015;9:CD010106',
  identifier: '10.1002/14651858.CD010106.pub2',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_19_DOSSIERS: SeedDossier[] = [
]
