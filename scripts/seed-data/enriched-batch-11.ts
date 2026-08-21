import type { SeedDossier } from '@/lib/seed-types'

/**
 * Enriched batch 11 — the gut.
 *
 * Nine drugs a pharmacy sells more of than almost anything else: four proton pump inhibitors, the
 * H2 blocker that outlived its whole class, a sugar polymer that sticks to ulcers, the
 * aminosalicylate that holds ulcerative colitis in remission, the opioid that never reaches the
 * brain, and a laxative made of inert plastic. Most of them are cheap, most are decades old, and
 * most are taken for years by people who were never told how long the evidence actually runs.
 *
 * That is what makes the group worth auditing. Almost every drug here was licensed on a surrogate —
 * intragastric pH, endoscopic healing, stools per week, ulcers seen at endoscopy — and the question
 * of whether it changes an outcome a patient would recognise was asked later, separately, and
 * usually answered less flatteringly. Every page below keeps those two things apart.
 *
 * Every DOI, PMID and NCT number was resolved at the time of writing: DOIs through the Crossref
 * REST API, PMIDs through NCBI E-utilities, NCT numbers through the ClinicalTrials.gov v2 API,
 * regulatory records through the openFDA Drugs@FDA endpoint. Every effect size, arm size, hazard
 * ratio, confidence interval and p-value is copied from the published abstract or from the label
 * text held on the record, never from memory. Where a number could not be sourced, the field is
 * absent.
 *
 * Six conventions apply to the whole group.
 *
 * 1. PRICING IS A PRICE, NOT A COST. `retailPricePerDoseOrYear` carries the United States pharmacy
 *    acquisition cost held on the record, from the CMS National Average Drug Acquisition Cost
 *    survey, with the survey date and the number of listed products it is a median of.
 *    `synthesisCostPerDose` is empty on every dossier here: no published per-dose cost-of-production
 *    figure for any of these molecules could be verified. The cost-of-production literature that was
 *    checked — Hill, Barber and Gotham in BMJ Global Health — publishes an estimation method and an
 *    aggregate range and carries no per-dose figure for these compounds. It is cited as `costSource`
 *    so a reader can see what was checked and what it does not contain.
 *
 * 2. THE STRUCTURES ARE THE ONES ALREADY ON THE RECORD. Each SMILES string was pulled from PubChem
 *    by the ingestion pipeline and passed this repository's structure parser before curation began.
 *    None was substituted. Polyethylene glycol 3350 carries no structure at all, because it is not
 *    one molecule: it is a distribution of chain lengths around an average mass, and a single
 *    connection table would misrepresent it.
 *
 * 3. ACID SUPPRESSION IS A SURROGATE AND EVERY PPI PAGE SAYS SO. Raising intragastric pH is
 *    measurable, reproducible and easy. It is not the same as fewer bleeds, fewer cancers or fewer
 *    deaths, and where a randomised trial has looked for those the answer has often been no — CONDOR
 *    for the whole gut, SUP-ICU for mortality, the COMPASS PPI substudy for the composite upper
 *    gastrointestinal endpoint.
 *
 * 4. THE OBSERVATIONAL SCARE LITERATURE IS TREATED AS ONE STORY, NOT NINE. Dementia, chronic kidney
 *    disease, fracture, pneumonia and death were all attached to proton pump inhibitors by
 *    observational cohorts between 2006 and 2017, and then a 17,598-person randomised trial ran
 *    pantoprazole against placebo for three years and found none of them. That trial is quoted in
 *    full on the pantoprazole page and cross-referenced from the other three.
 *
 * 5. THE AUDIT POINTS ARE NOT A HIGHLIGHT REEL. Every dossier carries at least one 'inferred' or
 *    'failed' entry because the literature supplies them: omeprazole plus diclofenac lost outright
 *    to celecoxib across the whole gut in CONDOR, pantoprazole did not move mortality in either of
 *    the two largest intensive-care trials ever run on it, esomeprazole's superiority over
 *    omeprazole was measured at twice the dose, lansoprazole did nothing for childhood asthma and
 *    caused more infections, famotidine loses to every PPI on healing and stops working within days,
 *    sucralfate lost a 1,200-patient head-to-head on bleeding, mesalamine does not work in Crohn's
 *    disease and is inferior to the older drug it replaced, loperamide kills people at high dose,
 *    and polyethylene glycol's evidence base in children is graded low to very low certainty.
 *
 * 6. NO DOSING, PROTOCOL, STACKING OR PROCUREMENT GUIDANCE. Strengths and durations appear only
 *    where they are part of a trial's description or a label's identity. Nothing here tells a reader
 *    what to take, for how long, or where to get it.
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

export const ENRICHED_BATCH_11_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Omeprazole — a prodrug that is inert everywhere in the body except the one pocket acidic
  //    enough to detonate it, and the drug that taught medicine how good a surrogate endpoint can
  //    look while the outcome endpoint goes the other way.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'omeprazole',
    name: 'Omeprazole',
    tradeName: 'Prilosec / Prilosec OTC',
    sponsor:
      'AstraZeneca — discovered at Astra AB’s Hässle laboratories in Sweden and approved in the United States under NDA 019810 in 1989; now made by more than 150 generic manufacturers',
    targetGene: 'ATP4A and ATP4B — the catalytic and glycoprotein subunits of the gastric proton pump',
    targetProtein:
      'Gastric H+/K+-ATPase, bound covalently through cysteine 813 (and cysteine 892) on the luminal face of the alpha subunit',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1989,
    indication:
      'Active duodenal ulcer; eradication of Helicobacter pylori to reduce duodenal ulcer recurrence, in combination with antibacterials; active benign gastric ulcer; symptomatic gastroesophageal reflux disease and erosive esophagitis in patients aged 2 years and older, and maintenance of healing of erosive esophagitis; and pathological hypersecretory conditions including Zollinger-Ellison syndrome',
    patientFriendlyIndication: 'Heartburn, acid reflux and stomach or duodenal ulcers',
    anatomicalSite:
      'Gastric parietal cell — inside the secretory canaliculus, the only compartment in the body where the pH falls below 2',
    conditionContext: {
      conditionExplainer:
        'The stomach makes hydrochloric acid at a concentration that would burn skin. A layer of mucus and bicarbonate normally keeps it off the stomach lining, and a muscular ring keeps it out of the oesophagus. When either defence fails — because a bacterium is eroding the lining, because an anti-inflammatory drug has stripped the mucus, or because the ring is leaking — the acid reaches tissue that has no protection against it.',
      whyItMatters:
        'Before 1989 a duodenal ulcer was a recurring condition managed for years and sometimes operated on. Acid suppression this complete turned it into something that heals in weeks. The open question was never whether the drug lowers acid; it is what happens to people who then take it for twenty years.',
      whoTakesThis:
        'Roughly one in twenty adults in high-income countries in any given year, most of them without a prescription. It is among the most-dispensed drugs in the world and one of the few on the WHO Model List of Essential Medicines that is also sold off a supermarket shelf.',
      clinicalGoals:
        'The registered endpoints are ulcer healing seen at endoscopy and resolution of heartburn. Neither is a count of bleeds, cancers or deaths, and the trials that did count those are audited below.',
    },
    oneSentenceVerdict:
      'A prodrug that does nothing until it reaches the one compartment in the body below pH 2, where it rearranges into a reactive sulfenamide and welds itself permanently to the stomach’s proton pump — healing erosive oesophagitis in 83.6% of patients pooled across 43 trials against 51.9% for an H2 blocker and 28.2% for placebo, and cutting upper gastrointestinal bleeding from 2.9% to 1.1% in 3,761 patients on aspirin and clopidogrel, while a trial of the whole gut found the same drug paired with an anti-inflammatory produced 4.3 times the rate of clinically significant events as a coxib alone.',
    laymanHowItWorks:
      'Omeprazole is swallowed in a coating that survives the stomach, so the drug is absorbed from the small intestine into the bloodstream instead. It is chemically inert at the pH of blood and tissue, which means it does nothing anywhere in the body until it drifts into the acid-secreting pocket of a stomach cell. There the acid itself converts it into a reactive form that cannot escape, and that form bonds permanently to the pump that makes the acid. Because the bond is permanent, the cell has to build new pumps before it can make acid again, which is why the effect builds over several days and lasts well beyond the time the drug is in the blood.',
    auditConfidence: 'High Confidence',
    confidenceScore: 82,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0816 per delayed-release capsule at United States pharmacy acquisition cost (CMS NADAC, median across 151 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Prilosec was the best-selling drug in the world in the late 1990s. The composition-of-matter patent expired in 2001, and AstraZeneca had already launched the single enantiomer, esomeprazole, as a separately patented product in the same year — the manoeuvre that made "evergreening" a term of art. Both molecules are now generic, and the generic capsule pharmacies buy costs eight cents.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The realistic alternatives split into three groups: the other proton pump inhibitors, which differ from omeprazole mainly in how they are metabolised rather than in what they do; the H2 blockers, which are measurably weaker and stop working within days as tolerance develops; and sucralfate, which is weaker still. Nothing sold as a food raises gastric pH for long enough to heal an erosion, and the honest comparison for reflux is with the non-drug measures that have their own randomised evidence — weight loss and raising the head of the bed — rather than with a supplement.',
      conventionalRx: [
        {
          name: 'Pantoprazole (Protonix)',
          class: 'Proton pump inhibitor, substituted benzimidazole',
          howItCompares:
            'The same covalent mechanism on the same pump. It depends least of the four on CYP2C19, so it is the one least affected by the genetic variation that makes some people rapid metabolisers, and it is the PPI with by far the largest randomised safety dataset — 17,598 people against placebo for three years.',
          typicalCost:
            'US$0.0428 per delayed-release tablet at United States pharmacy acquisition cost (CMS NADAC, median across 81 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheapest of the four per tablet, fewest drug interactions, best safety evidence. Cons: no better at healing than the others, and it failed its own primary endpoint in the COMPASS gastroduodenal substudy.',
        },
        {
          name: 'Famotidine (Pepcid, Pepcid AC)',
          class: 'Histamine H2-receptor antagonist',
          howItCompares:
            'Blocks one of the three signals that switch the pump on rather than the pump itself, so it never achieves the same acid suppression. In the pooled analysis of 43 randomised trials H2 blockers healed 51.9% of erosive oesophagitis against 83.6% for PPIs. It works within an hour, which PPIs do not, and tolerance to it develops within days of regular use, which is a real and under-advertised limitation.',
          typicalCost:
            'US$0.0494 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 139 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: fast onset, no CYP2C19 interaction, no covalent binding. Cons: substantially weaker, and the effect fades with continuous use.',
        },
        {
          name: 'Sucralfate (Carafate)',
          class: 'Aluminium sucrose sulfate, locally acting mucosal barrier',
          howItCompares:
            'Does not touch acid production at all: it polymerises in acid and sticks to the exposed ulcer base. In the same pooled analysis it healed 39.2% of erosive oesophagitis against 28.2% for placebo. It lost a 1,200-patient head-to-head against ranitidine for preventing bleeding in ventilated patients.',
          typicalCost:
            'US$0.1725 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 21 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: essentially no systemic absorption, so no systemic drug interactions. Cons: weakest of the options on healing, binds many co-administered drugs in the stomach, and delivers aluminium that accumulates in kidney failure.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Losing weight if you carry it around the middle',
          action:
            'Reduces the pressure gradient pushing stomach contents up past the lower oesophageal sphincter.',
          patientImpact:
            'This is one of the few non-drug reflux measures with prospective cohort evidence behind it rather than folklore, and unlike the drug it addresses the mechanical cause rather than the acidity of what refluxes.',
          clinicalPrecaution:
            'It does nothing for an ulcer caused by Helicobacter pylori or by an anti-inflammatory drug, which are different diseases with the same symptom.',
        },
        {
          name: 'Ask whether you have been tested for Helicobacter pylori',
          action:
            'A breath, stool or biopsy test identifies the bacterium that causes most duodenal ulcers.',
          patientImpact:
            'If the bacterium is there, suppressing acid treats the symptom and eradicating the bacterium treats the cause. In the Shandong Intervention Trial a two-week course of amoxicillin with omeprazole cut gastric cancer over the following fifteen years from 4.6% to 3.0%.',
          clinicalPrecaution:
            'Taking a proton pump inhibitor makes the breath and stool tests read falsely negative, so the test order matters. That is a diagnostic point, not a dosing instruction.',
        },
        {
          name: 'Ask what the stopping plan is',
          action:
            'Establish at the start whether the course has an end date and what happens at it.',
          patientImpact:
            'Acid secretion rebounds above baseline for weeks after a long course, because the pumps built during suppression are all still there. The rebound feels like the original problem returning and is a common reason people never come off.',
          clinicalPrecaution:
            'This is a question to ask a prescriber. Nothing on this page tells anyone when or how to stop a medicine.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=CN=C(C(=C1OC)C)CS(=O)C2=NC3=C(N2)C=C(C=C3)OC',
      chemicalFormula: 'C17H19N3O3S',
      molecularWeight: '345.40 g/mol',
      targetReceptorAffinity:
        'Omeprazole binds nothing reversibly. It is a weak base with a pyridine pKa near 4, which is why it concentrates roughly a thousandfold inside a compartment at pH 1 relative to plasma; there it rearranges to a cyclic sulfenamide that forms a covalent disulfide bond with cysteine 813 of the H+/K+-ATPase alpha subunit. Because the bond is covalent, there is no dissociation constant to quote and no concentration at which the effect reverses — recovery requires new pump protein.',
      structureSource: {
        label:
          'PubChem CID 4594 (omeprazole) — canonical SMILES, molecular formula and molecular weight, as ingested onto this record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4594',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ome-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and acid stability of the benzimidazole and pyridine fragments',
          description:
            'Confirm both building blocks and establish that every subsequent operation is run at alkaline pH. Omeprazole free base degrades in acid within minutes — that instability is the mechanism, not a defect — so any trace of acid in a solvent or on glassware destroys the batch before it is made.',
          reagentsAndBuffer:
            '5-methoxy-2-mercaptobenzimidazole and 2-chloromethyl-3,5-dimethyl-4-methoxypyridine reference standards, 1H and 13C NMR in DMSO-d6, HPLC with a buffered mobile phase at pH 7.4 or above, Karl Fischer titration',
        },
        {
          id: 'ome-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Thioether coupling, then controlled oxidation to the sulfoxide',
          description:
            'Couple the mercaptobenzimidazole to the chloromethylpyridine to give the sulfide, then oxidise exactly one step further to the sulfoxide. This is the delicate operation in the whole route: the sulfoxide is the drug, the sulfone one oxidation beyond it is inactive, and the reaction has to be stopped between the two.',
          dependsOnStepId: 'ome-w1',
          reagentsAndBuffer:
            'Sodium hydroxide in methanol for the coupling; meta-chloroperoxybenzoic acid or a titanium-catalysed peroxide system for the oxidation, run cold in dichloromethane with in-process HPLC monitoring for sulfone breakthrough',
        },
        {
          id: 'ome-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation under base and control of the sulfone impurity',
          description:
            'Crystallise the sulfoxide with the mother liquor held alkaline, and quantify residual sulfone. The finished product is then enteric-coated as a separate operation, because an uncoated capsule delivers no drug at all — the acid destroys it before absorption.',
          dependsOnStepId: 'ome-w2',
          reagentsAndBuffer:
            'Crystallisation from acetonitrile or ethyl acetate with triethylamine or aqueous ammonia to hold pH above 9, HPLC against a sulfone reference standard, storage protected from light and moisture',
        },
        {
          id: 'ome-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Acid-dependent accumulation in isolated gastric vesicles',
          description:
            'Load hog gastric microsomal vesicles, acidify the interior with ATP, and show that the drug concentrates inside them and only inside them. Repeating the experiment on vesicles that are not acidified is the control that matters: no accumulation and no inhibition means the selectivity is real rather than an artefact of the assay.',
          dependsOnStepId: 'ome-w3',
          reagentsAndBuffer:
            'Hog gastric H+/K+-ATPase microsomal vesicles, ATP and magnesium to generate the pH gradient, valinomycin and nigericin as gradient-collapsing controls, radiolabelled or LC-MS/MS quantification of vesicle-associated drug',
        },
        {
          id: 'ome-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'K+-stimulated ATPase inhibition and the dithiothreitol reversal control',
          description:
            'Measure loss of potassium-stimulated ATPase activity, then add a reducing agent. If dithiothreitol restores activity, the inhibition was a disulfide bond to a cysteine, which is the claim the whole mechanism rests on. An inhibition that does not reverse with reductant is a different chemistry and would falsify the model.',
          dependsOnStepId: 'ome-w4',
          reagentsAndBuffer:
            'Potassium-stimulated ATPase assay with inorganic phosphate colorimetric readout, dithiothreitol or beta-mercaptoethanol reversal arm, sodium-potassium ATPase counter-screen to confirm the drug leaves the ubiquitous pump alone',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ome-a1',
        category: 'measured',
        title: 'COGENT: upper gastrointestinal bleeding cut from 2.9% to 1.1% against placebo',
        laymanSummary:
          'People taking aspirin plus clopidogrel were randomly given omeprazole or a dummy capsule. Bleeding and ulcers in the upper gut fell by about two thirds. This is the cleanest placebo-controlled result the drug has on an outcome a patient would notice.',
        technicalDetails:
          'COGENT randomised patients with an indication for dual antiplatelet therapy to clopidogrel with omeprazole or with placebo, on a background of aspirin. Of a planned 5,000, 3,873 were randomised and 3,761 analysed before the trial stopped early when the sponsor lost its financing. Fifty-one patients had a gastrointestinal event: 1.1% on omeprazole against 2.9% on placebo at 180 days (hazard ratio 0.34, 95% CI 0.18 to 0.63, P<0.001). Overt upper gastrointestinal bleeding fell further (HR 0.13, 95% CI 0.03 to 0.56, P=0.001). Diarrhoea was more common on omeprazole.',
        evidenceSource:
          'Bhatt DL et al., N Engl J Med 2010;363:1909-1917 (COGENT, NCT00557921)',
        doi: '10.1056/NEJMoa1007964',
        measuredMetric:
          'Composite of overt or occult bleeding, symptomatic gastroduodenal ulcer or erosion, obstruction or perforation at 180 days, against matching placebo',
        auditFlag: 'verified',
      },
      {
        id: 'ome-a2',
        category: 'conclusion_shift',
        title:
          'The clopidogrel interaction: a warning built on blood tests, then a randomised trial that did not find it',
        laymanSummary:
          'In 2009 regulators warned that omeprazole might blunt clopidogrel and leave heart patients unprotected. The warning came from laboratory measurements of platelet activity and from database studies. When the question was finally put to a randomised trial, cardiovascular events were identical in the two groups.',
        technicalDetails:
          'Both drugs use CYP2C19 — clopidogrel needs it to become active, omeprazole inhibits it — and pharmacodynamic studies showed reduced platelet inhibition when the two were combined. Observational analyses reported more cardiovascular events. In COGENT the cardiovascular composite of cardiovascular death, non-fatal myocardial infarction, revascularisation or stroke occurred in 4.9% on omeprazole against 5.7% on placebo (hazard ratio 0.99, 95% CI 0.68 to 1.44, P=0.96), with no significant heterogeneity across high-risk subgroups. The authors were explicit that the trial stopped early and cannot rule out a clinically meaningful difference, so this is a null result with wide confidence limits rather than a proof of no effect. The label interaction statement remains.',
        evidenceSource:
          'Bhatt DL et al., N Engl J Med 2010;363:1909-1917; PRILOSEC United States prescribing information, Drug Interactions (NDA 019810)',
        doi: '10.1056/NEJMoa1007964',
        inferredClaim:
          'That the measured drop in platelet inhibition translates into more heart attacks and strokes — a mechanistic and observational inference that the only randomised test of it did not reproduce',
        auditFlag: 'contested',
      },
      {
        id: 'ome-a3',
        category: 'failed',
        title:
          'CONDOR: an anti-inflammatory plus omeprazole produced 4.3 times the whole-gut event rate of a coxib alone',
        laymanSummary:
          'The standard way to protect the stomach from an anti-inflammatory drug is to add a proton pump inhibitor. When someone counted problems along the entire gut rather than just the stomach, that strategy lost badly — because the drug protects only the part of the gut that makes acid.',
        technicalDetails:
          'CONDOR randomised 4,484 patients with osteoarthritis or rheumatoid arthritis at increased gastrointestinal risk, all Helicobacter pylori negative, to celecoxib 200 mg twice daily or to slow-release diclofenac 75 mg twice daily plus omeprazole 20 mg daily, for six months across 196 centres in 32 countries. The adjudicated composite of clinically significant upper or lower gastrointestinal events occurred in 20 of 2,238 on celecoxib (0.9%) against 81 of 2,246 on diclofenac plus omeprazole (3.8%), hazard ratio 4.3 (95% CI 2.6 to 7.0, P<0.0001). Early withdrawal for gastrointestinal adverse events was 6% against 8% (P=0.0006). The excess was overwhelmingly in the small and large bowel, where a proton pump inhibitor has no mechanism of action.',
        evidenceSource: 'Chan FK et al., Lancet 2010;376:173-179 (CONDOR, NCT00141102)',
        doi: '10.1016/S0140-6736(10)60673-3',
        measuredMetric:
          'Adjudicated composite of clinically significant upper and lower gastrointestinal events over six months',
        auditFlag: 'caution',
      },
      {
        id: 'ome-a4',
        category: 'measured',
        title:
          'Shandong: two weeks of amoxicillin with omeprazole, and 1.6 fewer gastric cancers per hundred people fifteen years later',
        laymanSummary:
          'A trial in a high-risk Chinese county gave people either antibiotics to clear a stomach bacterium or a placebo, then followed them for fifteen years. Three in a hundred treated people developed stomach cancer, against nearly five in a hundred untreated.',
        technicalDetails:
          'The Shandong Intervention Trial was a masked factorial placebo-controlled study in Linqu County. Among 3,365 randomly assigned subjects followed 14.7 years, gastric cancer was diagnosed in 3.0% of those who received the two-week Helicobacter pylori regimen of amoxicillin with omeprazole against 4.6% of those who received placebo (odds ratio 0.61, 95% CI 0.38 to 0.96, P=0.032). Gastric cancer deaths were 1.5% against 2.1% (hazard ratio 0.67, 95% CI 0.36 to 1.28), which did not reach significance. Garlic extract and vitamin supplementation, tested in the same factorial design, produced no statistically significant reduction. The omeprazole here is an adjunct that raises pH so the antibiotic works, not the active agent — the effect belongs to eradication, and this page does not claim it for acid suppression.',
        evidenceSource: 'Ma JL et al., J Natl Cancer Inst 2012;104:488-492 (NCT00339768)',
        doi: '10.1093/jnci/djs003',
        measuredMetric: 'Gastric cancer incidence and cause-specific mortality at 14.7 years',
        auditFlag: 'verified',
      },
      {
        id: 'ome-a5',
        category: 'measured',
        title: 'The healing figure that made the class: 83.6% against 51.9% and 28.2%',
        laymanSummary:
          'Pooling 43 randomised trials in 7,635 people, proton pump inhibitors healed erosive damage to the oesophagus in about five in six patients, H2 blockers in about half, and placebo in about a quarter. They also healed it nearly twice as fast.',
        technicalDetails:
          'Chiba and colleagues applied strict inclusion criteria to single- or double-blind randomised studies in adults with endoscopically proven erosive or ulcerative oesophagitis. Mean healing proportion within 12 weeks was 83.6% (SD 11.4) for proton pump inhibitors, 51.9% (17.1) for H2-receptor antagonists, 39.2% (22.4) for sucralfate and 28.2% (15.6) for placebo. Healing speed was 11.7% per week for PPIs against 5.9% for H2 blockers and 2.9% for placebo. Heartburn-free proportions were 77.4% against 47.6%. This is a class-level surrogate: it counts mucosa seen down an endoscope, not bleeds, cancers or deaths.',
        evidenceSource:
          'Chiba N, De Gara CJ, Wilkinson JM, Hunt RH. Gastroenterology 1997;112:1798-1810',
        doi: '10.1053/gast.1997.v112.pm9178669',
        measuredMetric:
          'Proportion healed and heartburn-free at up to 12 weeks, pooled across 43 randomised trials in 7,635 patients',
        auditFlag: 'verified',
      },
      {
        id: 'ome-a6',
        category: 'inferred',
        title:
          'The long-term harms attached to this class came from cohorts, and the randomised test found almost none of them',
        laymanSummary:
          'Between 2006 and 2017 database studies linked proton pump inhibitors to dementia, kidney disease, fractures, pneumonia and death. A randomised trial then gave 17,598 people a proton pump inhibitor or placebo for three years and found none of those differences except a small excess of gut infections.',
        technicalDetails:
          'Gomm and colleagues reported a hazard ratio of 1.44 (95% CI 1.36 to 1.52) for incident dementia in German claims data, and Lazarus and colleagues reported a hazard ratio of 1.50 (95% CI 1.14 to 1.96) for incident chronic kidney disease in the ARIC cohort. Both are observational and both are vulnerable to confounding by indication: people prescribed acid suppression differ systematically from people who are not. The COMPASS trial randomised 17,598 participants to pantoprazole 40 mg daily or placebo and followed them for a median of 3.01 years across 53,152 patient-years, collecting pneumonia, Clostridioides difficile, other enteric infections, fracture, gastric atrophy, chronic kidney disease, diabetes, chronic obstructive lung disease, dementia, cardiovascular disease, cancer, hospitalisation and all-cause mortality every six months. No safety outcome differed significantly except enteric infections, 1.4% against 1.0% (odds ratio 1.33, 95% CI 1.01 to 1.75). Three years is not twenty, and this is pantoprazole rather than omeprazole; the class inference is stated here rather than assumed.',
        evidenceSource:
          'Gomm W et al., JAMA Neurol 2016;73:410-416; Lazarus B et al., JAMA Intern Med 2016;176:238-246; Moayyedi P et al., Gastroenterology 2019;157:682-691 (COMPASS, NCT01776424)',
        doi: '10.1053/j.gastro.2019.05.056',
        inferredClaim:
          'That long-term proton pump inhibitor use causes dementia, kidney disease and fracture — an inference from observational cohorts that a three-year randomised trial in 17,598 people did not reproduce',
        auditFlag: 'contested',
      },
      {
        id: 'ome-a7',
        category: 'failed',
        title: 'Between a quarter and a third of people cannot metabolise it the same way',
        laymanSummary:
          'Omeprazole is broken down by an enzyme that comes in fast, normal and slow versions. Which version someone inherited changes how much drug they are exposed to several-fold, and nobody is tested for it before the first capsule.',
        technicalDetails:
          'Omeprazole is cleared predominantly by CYP2C19, with a minor CYP3A4 route. Poor metabolisers — around 3% of people of European ancestry and 15 to 20% of people of East Asian ancestry — have several-fold higher exposure than extensive metabolisers, and rapid or ultrarapid metabolisers carrying CYP2C19*17 have correspondingly lower exposure and worse acid control. The label records the pharmacokinetic difference and the interaction with clopidogrel that follows from the same enzyme, and no genotyping is required before dispensing. This is a known, measured, unaddressed source of variability in a drug taken by hundreds of millions of people.',
        evidenceSource:
          'PRILOSEC United States prescribing information, Clinical Pharmacology and Drug Interactions (NDA 019810, AstraZeneca)',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Protected from the acid it is meant to block',
        laymanDesc:
          'The drug is destroyed by stomach acid within minutes, so the capsule is coated to survive the stomach intact and dissolve further down. Chewing it or opening it into something acidic wastes the dose.',
        molecularDetail:
          'Omeprazole free base degrades rapidly below pH 4. Commercial products are enteric-coated granules that release above pH 5.5 in the duodenum. Oral bioavailability is around 30 to 40% on first dose and rises with repeated dosing as acid-mediated presystemic degradation falls. Plasma half-life is roughly one hour — far shorter than the duration of effect, because the effect outlives the molecule.',
        iconName: 'Package',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorbed into blood, where it does nothing at all',
        laymanDesc:
          'From the small intestine it enters the bloodstream and circulates through the whole body. At the pH of blood it is chemically inert, which is why it has no effect on any other tissue.',
        molecularDetail:
          'Circulating omeprazole is a neutral weak base, about 95% protein bound, with no meaningful affinity for any receptor. Selectivity is not achieved by molecular recognition of the target but by the chemistry of activation: nothing happens until pH falls far enough to protonate the pyridine nitrogen.',
        iconName: 'Droplets',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'Trapped in the only acid pocket in the body',
        laymanDesc:
          'The acid-secreting cells of the stomach have a tiny internal channel where the pH drops below 2 — lower than anywhere else in a person. The drug drifts in, becomes electrically charged, and can no longer get back out.',
        molecularDetail:
          'The pyridine nitrogen has a pKa near 4. In a compartment at pH 1 essentially every molecule is protonated, and the charged species cannot cross the membrane back out. The result is roughly thousandfold accumulation in the secretory canaliculus relative to plasma, achieved with no transporter and no binding partner.',
        iconName: 'Lock',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The acid itself converts it into the weapon',
        laymanDesc:
          'The same acid that traps the drug also rearranges it into a highly reactive form. The drug does not arrive active; the target manufactures its own inhibitor on the spot.',
        molecularDetail:
          'A second protonation on the benzimidazole triggers intramolecular rearrangement to a tetracyclic cyclic sulfenamide. That species is a potent thiophile with a very short lifetime, which is precisely why it cannot escape the canaliculus to react with cysteines anywhere else in the body.',
        iconName: 'Flame',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'A permanent bond to the pump',
        laymanDesc:
          'The reactive form welds itself to the pump through a sulfur-to-sulfur bond. That pump never works again. The cell can only recover by building new ones.',
        molecularDetail:
          'The sulfenamide forms a disulfide with cysteine 813 on the luminal loop between transmembrane segments 5 and 6 of the H+/K+-ATPase alpha subunit, and with cysteine 892 for some members of the class. Inhibition is reversed in vitro by dithiothreitol, which is the experimental signature of a disulfide. In vivo, recovery depends on pump resynthesis, with a half-life of roughly 50 hours, so a one-hour plasma half-life produces a multi-day effect.',
        iconName: 'Link',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'What that does and does not buy',
        laymanDesc:
          'Acid falls and erosions heal. What it does not do is fix the leaking valve that let acid into the oesophagus, or protect any part of the gut below the stomach — which is exactly where the CONDOR trial found the harm.',
        molecularDetail:
          'Only pumps actively secreting at the time of exposure are inhibited, so full effect takes three to five days of repeated dosing. Suppression drives a compensatory rise in gastrin and an increase in total pump mass, which is the basis of rebound acid hypersecretion after withdrawal. No component of the mechanism touches lower oesophageal sphincter tone or small-bowel and colonic mucosa.',
        iconName: 'CircleSlash',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'COGENT (NCT00557921)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 3761,
        primaryEndpoint:
          'Composite of overt or occult gastrointestinal bleeding, symptomatic gastroduodenal ulcer or erosion, obstruction or perforation',
        endpointMet: true,
        statisticalPValue:
          '1.1% against 2.9% at 180 days; hazard ratio 0.34 (95% CI 0.18 to 0.63), P<0.001',
        unreportedAdverseSignals:
          'The trial stopped early when the sponsor lost its financing, at 3,873 of a planned 5,000 randomised. The co-primary cardiovascular comparison was therefore underpowered, and the authors state it does not rule out a clinically meaningful difference.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'CONDOR (NCT00141102)',
        phase: 'Phase 4, randomised, double-blind, active-controlled',
        sampleSize: 4484,
        primaryEndpoint:
          'Adjudicated composite of clinically significant upper or lower gastrointestinal events over six months, diclofenac plus omeprazole against celecoxib',
        endpointMet: false,
        statisticalPValue:
          '3.8% on diclofenac plus omeprazole against 0.9% on celecoxib; hazard ratio 4.3 (95% CI 2.6 to 7.0), P<0.0001',
        unreportedAdverseSignals:
          'Funded by the manufacturer of the comparator. The result is nonetheless a direct measurement of what a proton pump inhibitor cannot do: the excess was in the small and large bowel, outside its mechanism.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Shandong Intervention Trial (NCT00339768)',
        phase: 'Phase 3, randomised, masked, factorial, placebo-controlled',
        sampleSize: 3365,
        primaryEndpoint:
          'Registered as precancerous gastric lesions; reported here is the prespecified 14.7-year gastric cancer incidence and cause-specific mortality follow-up',
        endpointMet: true,
        statisticalPValue:
          'Gastric cancer 3.0% against 4.6%; odds ratio 0.61 (95% CI 0.38 to 0.96), P=0.032. Gastric cancer death 1.5% against 2.1%, hazard ratio 0.67 (95% CI 0.36 to 1.28), not significant.',
        unreportedAdverseSignals:
          'The effect belongs to Helicobacter pylori eradication, not to acid suppression. Omeprazole was the adjunct that raised gastric pH so the amoxicillin would work.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'COMPASS proton pump inhibitor safety substudy (NCT01776424)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, 3 x 2 partial factorial',
        sampleSize: 17598,
        primaryEndpoint:
          'Prespecified safety events collected every six months over a median 3.01 years: pneumonia, Clostridioides difficile, other enteric infections, fracture, gastric atrophy, chronic kidney disease, diabetes, chronic obstructive lung disease, dementia, cardiovascular disease, cancer, hospitalisation, death',
        endpointMet: true,
        statisticalPValue:
          'No significant difference on any outcome except enteric infections, 1.4% against 1.0% (odds ratio 1.33, 95% CI 1.01 to 1.75)',
        unreportedAdverseSignals:
          'The drug tested was pantoprazole, not omeprazole. Applying the result across the class is an inference, stated as one on this page.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Upper gastrointestinal events 1.1% against 2.9% on placebo in 3,761 randomised patients on aspirin and clopidogrel (HR 0.34, P<0.001)',
        'Erosive oesophagitis healed in 83.6% of patients on a proton pump inhibitor against 51.9% on an H2 blocker and 28.2% on placebo, pooled across 43 randomised trials in 7,635 people',
        'Gastric cancer at 14.7 years 3.0% against 4.6% after a two-week amoxicillin-plus-omeprazole eradication regimen in 3,365 randomised subjects (OR 0.61, P=0.032)',
        'Covalent inhibition of the H+/K+-ATPase reversed in vitro by dithiothreitol, identifying the bond as a disulfide to cysteine 813',
      ],
      unsupportedInferences: [
        'That protecting the stomach protects the gut — CONDOR measured the whole gastrointestinal tract and found 4.3 times the event rate with omeprazole plus diclofenac against a coxib alone',
        'That the measured drop in clopidogrel platelet inhibition causes heart attacks, which the only randomised test of it did not reproduce (HR 0.99, 95% CI 0.68 to 1.44)',
        'That the observational links to dementia, kidney disease and fracture are causal, when a three-year randomised trial in 17,598 people found none of them',
        'That endoscopic healing is a measure of how long or how well someone lives; no trial in this class has been powered on mortality',
      ],
      whatFailedInitially: [
        'CONDOR: the standard gastroprotective strategy lost outright to a coxib once events below the duodenum were counted',
        'COGENT stopped early when its sponsor ran out of money, leaving the cardiovascular question underpowered rather than answered',
        'CYP2C19 genotype changes exposure several-fold and nobody is tested before the first capsule',
        'Acid rebound above baseline after withdrawal is a predictable consequence of the mechanism and a common reason people never stop',
      ],
      realWorldOutcome: [
        'Approved under NDA 019810 in 1989, the first proton pump inhibitor anywhere, and the best-selling drug in the world by the late 1990s',
        'Available without prescription since 2003 in the United States, and now eight cents a capsule at pharmacy acquisition cost',
        'On the WHO Model List of Essential Medicines, and among the most-dispensed medicines on earth',
        'The patent expiry that produced esomeprazole in 2001 became the standard textbook example of enantiomer evergreening',
      ],
    },
    deliverySystem: {
      type: 'Oral delayed-release capsule and tablet, oral suspension, and an over-the-counter magnesium salt tablet',
      description:
        'Every oral form is enteric-protected, because the free base is destroyed by gastric acid within minutes. Absorption is from the small intestine; the drug then reaches the parietal cell through the bloodstream, not from the stomach lumen.',
      safetyProfile:
        'The label carries warnings for acute interstitial nephritis, Clostridioides difficile-associated diarrhoea, bone fracture with long-term high-dose use, cutaneous and systemic lupus erythematosus, cyanocobalamin deficiency, hypomagnesaemia, and fundic gland polyps with use beyond one year. Commonest adverse events in trials are headache, abdominal pain, nausea and diarrhoea. Interactions run through CYP2C19 — clopidogrel, and drugs whose absorption depends on gastric pH — and coadministration with rilpivirine is contraindicated.',
    },
    commonQuestions: [
      {
        q: 'Why does it take days to work when heartburn tablets work in minutes?',
        a: 'Because it works on the pumps rather than on the acid. Antacids neutralise acid that is already there, and an H2 blocker turns down one of the three signals that switch the pump on, so both act within the hour. Omeprazole destroys individual pump molecules permanently, and only the pumps that happen to be actively secreting while the drug is present get destroyed. Each dose catches a fraction of them, so the effect builds over three to five days of repeated dosing before it reaches its ceiling. The same arithmetic explains why the effect lasts far longer than the drug: the plasma half-life is about an hour, but the cell has to build new pumps, which takes days.',
      },
      {
        q: 'Is it dangerous to take for years?',
        a: 'The honest answer is that the randomised evidence runs to three years, not twenty. Between 2006 and 2017 database studies linked this class to dementia, chronic kidney disease, fractures, pneumonia and death, and those studies got a great deal of coverage. They are all observational, and people prescribed long-term acid suppression differ from people who are not in ways that are very hard to adjust away. The COMPASS trial then randomised 17,598 people to a proton pump inhibitor or placebo for a median of three years and collected all of those outcomes every six months. None differed significantly except gut infections, which were slightly more common on the drug — 1.4% against 1.0%. That is reassuring about three years. It is not evidence about twenty, and no trial of that length exists.',
        auditNote:
          'The trial drug was pantoprazole. Reading the result across to omeprazole is an inference about a shared mechanism, not a measurement of omeprazole.',
      },
      {
        q: 'Does it protect my stomach if I am taking anti-inflammatory painkillers?',
        a: 'The stomach and duodenum, yes. Below that, no, and the difference matters more than it sounds. CONDOR randomised 4,484 arthritis patients at high gastrointestinal risk to either a coxib alone or diclofenac plus omeprazole, and then adjudicated events along the entire gut rather than only the upper part. Events occurred in 0.9% of the coxib group and 3.8% of the diclofenac-plus-omeprazole group — a hazard ratio of 4.3. The excess was in the small and large bowel, where a proton pump inhibitor has no mechanism at all: there is no acid there for it to suppress. The strategy was not wrong about the stomach. It was measuring the wrong organ.',
      },
      {
        q: 'What is the difference between this and Nexium?',
        a: 'Omeprazole is a 50:50 mixture of two mirror-image forms of the same molecule. Esomeprazole is one of those two forms isolated. The isolated form is cleared a little more slowly, so blood levels run higher for a given milligram. That is a real pharmacological difference and a small one. The commercial context is that AstraZeneca launched esomeprazole as a new patented product in 2001, the year omeprazole went generic, and the head-to-head trials that showed esomeprazole healing more oesophagitis compared 40 mg of it against 20 mg of omeprazole. Whether the same milligram of each performs differently was not what those trials measured.',
        auditNote:
          'The comparison people reach for — is the enantiomer better? — was tested at unequal doses. That is audited in detail on the esomeprazole page.',
      },
      {
        q: 'Why does stopping make the heartburn worse than before?',
        a: 'Because the mechanism has a rebound built into it. Suppressing acid raises the hormone gastrin, gastrin drives the parietal cells to build more pumps, and those extra pumps are all still there when the drug stops. Acid output therefore overshoots its original level for a few weeks before settling. The overshoot feels exactly like the problem returning, which is one of the most common reasons a course intended to last weeks ends up lasting years. What to do about that is a conversation with a prescriber; this page does not give a stopping schedule.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Bhatt DL et al. Clopidogrel with or without omeprazole in coronary artery disease. N Engl J Med 2010;363:1909-1917 (COGENT)',
        identifier: '10.1056/NEJMoa1007964',
        kind: 'doi',
      },
      {
        label:
          'Chan FK et al. Celecoxib versus omeprazole and diclofenac in patients with osteoarthritis and rheumatoid arthritis (CONDOR): a randomised trial. Lancet 2010;376:173-179',
        identifier: '10.1016/S0140-6736(10)60673-3',
        kind: 'doi',
      },
      {
        label:
          'Ma JL et al. Fifteen-year effects of Helicobacter pylori, garlic, and vitamin treatments on gastric cancer incidence and mortality. J Natl Cancer Inst 2012;104:488-492',
        identifier: '10.1093/jnci/djs003',
        kind: 'doi',
      },
      {
        label:
          'Chiba N, De Gara CJ, Wilkinson JM, Hunt RH. Speed of healing and symptom relief in grade II to IV gastroesophageal reflux disease: a meta-analysis. Gastroenterology 1997;112:1798-1810',
        identifier: '10.1053/gast.1997.v112.pm9178669',
        kind: 'doi',
      },
      {
        label:
          'Moayyedi P et al. Safety of proton pump inhibitors based on a large, multi-year, randomized trial of patients receiving rivaroxaban or aspirin. Gastroenterology 2019;157:682-691',
        identifier: '10.1053/j.gastro.2019.05.056',
        kind: 'doi',
      },
      {
        label:
          'Gomm W et al. Association of proton pump inhibitors with risk of dementia. JAMA Neurol 2016;73:410-416',
        identifier: '10.1001/jamaneurol.2015.4791',
        kind: 'doi',
      },
      {
        label:
          'Lazarus B et al. Proton pump inhibitor use and the risk of chronic kidney disease. JAMA Intern Med 2016;176:238-246',
        identifier: '10.1001/jamainternmed.2015.7193',
        kind: 'doi',
      },
      {
        label: 'COGENT: clopidogrel with or without omeprazole, on background aspirin',
        identifier: 'NCT00557921',
        kind: 'nct',
      },
      {
        label:
          'CONDOR: celecoxib against diclofenac plus omeprazole, whole-gut adjudicated endpoint',
        identifier: 'NCT00141102',
        kind: 'nct',
      },
      {
        label:
          'Shandong Intervention Trial: Helicobacter pylori eradication, garlic and vitamins against gastric cancer',
        identifier: 'NCT00339768',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: PRILOSEC (omeprazole) delayed-release capsules, NDA 019810, AstraZeneca — original approval 14 September 1989',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019810',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: PRILOSEC OTC (omeprazole magnesium), NDA 021229, AstraZeneca — over-the-counter approval 20 June 2003',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021229',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 4594 — omeprazole structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4594',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Pantoprazole — the proton pump inhibitor that has actually been tested against placebo, at
  //    scale, three separate times, and that lost the outcome endpoint each time it was asked for
  //    one.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'pantoprazole',
    name: 'Pantoprazole',
    tradeName: 'Protonix / Protonix IV',
    sponsor:
      'Wyeth Pharmaceuticals, now part of Pfizer — originated at Byk Gulden in Konstanz, Germany, and approved in the United States under NDA 020987 in 2000',
    targetGene: 'ATP4A and ATP4B — the catalytic and glycoprotein subunits of the gastric proton pump',
    targetProtein:
      'Gastric H+/K+-ATPase, bound covalently on the luminal face of the alpha subunit at cysteine 813 and, distinctively for this molecule, at cysteine 822 deep in the membrane domain',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2000,
    indication:
      'Short-term treatment of erosive esophagitis associated with gastroesophageal reflux disease and maintenance of healing of erosive esophagitis in adults and in children aged 5 years and older, and long-term treatment of pathological hypersecretory conditions including Zollinger-Ellison syndrome. The intravenous formulation is indicated for erosive esophagitis and hypersecretory conditions in patients unable to take the oral form.',
    patientFriendlyIndication:
      'Reflux that has damaged the lining of the gullet, and rare conditions that make the stomach produce far too much acid',
    anatomicalSite:
      'Gastric parietal cell — the secretory canaliculus, and specifically the membrane-embedded face of the pump that a reducing agent cannot reach',
    conditionContext: {
      conditionExplainer:
        'Erosive oesophagitis is what reflux looks like once acid has stripped the lining of the gullet down to raw tissue. It is diagnosed by looking, not by how bad the heartburn is, and plenty of people with severe symptoms have a normal-looking oesophagus while some with visible erosions barely notice.',
      whyItMatters:
        'Pantoprazole is the one drug in this class that has repeatedly been put in front of a placebo in trials large enough to answer a hard question. That makes its page unusual: most of what is known about the safety and the limits of proton pump inhibitors as a class was learned from this molecule.',
      whoTakesThis:
        'Adults and children aged 5 and over with erosive reflux disease, and — through the intravenous form — a very large number of hospital inpatients, many of whom were started on it for stress ulcer prophylaxis and never taken off.',
      clinicalGoals:
        'The registered endpoint is healing of erosive oesophagitis seen at endoscopy. The intensive-care question, whether preventing stress ulcers saves lives, is a different endpoint and has been answered twice, both times no.',
    },
    oneSentenceVerdict:
      'A proton pump inhibitor that is activated by stomach acid into a form that welds itself to the acid pump, and the only one in its class with a three-year placebo-controlled safety trial behind it — 17,598 people, in which none of the harms observational studies had pinned on the class appeared except gut infections at 1.4% against 1.0% — while the two largest trials ever run on it in intensive care cut clinically important bleeding from 3.5% to 1.0% and left 90-day mortality unmoved at 29.1% against 30.9%.',
    laymanHowItWorks:
      'Pantoprazole is inactive when you swallow it and stays inactive everywhere in the body except the acid-secreting pocket inside stomach cells. There the acid converts it into a reactive form that bonds permanently to the pump making the acid, so that pump is finished and the cell has to build a replacement. Pantoprazole attaches at a second anchor point buried inside the membrane that the other drugs in its class do not reliably reach, which is why its grip is the hardest of the four to undo. It is also the least dependent of the four on the liver enzyme that varies most between people, so its behaviour is the most predictable.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 86,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0428 per delayed-release tablet at United States pharmacy acquisition cost (CMS NADAC, median across 81 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Protonix went generic in the United States in 2007 after Teva and Sun launched at risk, before the patent litigation had concluded. Wyeth later recovered a settlement, but the at-risk launch had already collapsed the price. The tablet is now the cheapest of the four proton pump inhibitors in this file at pharmacy acquisition cost.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'All four proton pump inhibitors in this file do the same thing to the same pump by the same chemistry, and no head-to-head trial has shown one of them changing a patient outcome the others do not. The real grounds for choosing between them are metabolic: pantoprazole depends least on CYP2C19 and therefore interacts least. Below the class, the alternatives are genuinely weaker — an H2 blocker heals about half as much erosive oesophagitis, and sucralfate less than that.',
      conventionalRx: [
        {
          name: 'Omeprazole (Prilosec, Prilosec OTC)',
          class: 'Proton pump inhibitor, substituted benzimidazole',
          howItCompares:
            'The original member of the class and the one available without prescription. It is more dependent on CYP2C19 than pantoprazole, which is the origin of the clopidogrel interaction question, and it is the molecule with the randomised evidence on gastrointestinal bleeding prevention under dual antiplatelet therapy.',
          typicalCost:
            'US$0.0816 per delayed-release capsule at United States pharmacy acquisition cost (CMS NADAC, median across 151 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: available off the shelf, largest clinical history, one randomised trial showing fewer bleeds on aspirin and clopidogrel. Cons: the most CYP2C19-dependent of the four, and the one carrying the clopidogrel interaction warning.',
        },
        {
          name: 'Esomeprazole (Nexium, Nexium 24HR)',
          class: 'Proton pump inhibitor, single S-enantiomer of omeprazole',
          howItCompares:
            'Produces somewhat higher plasma exposure per milligram than its racemic parent because the S-form is cleared more slowly. Its superiority trials against omeprazole compared 40 mg against 20 mg, which is audited on its own page. It is the one with randomised evidence for high-dose intravenous use after endoscopic haemostasis.',
          typicalCost:
            'US$0.1533 per delayed-release capsule at United States pharmacy acquisition cost (CMS NADAC, median across 142 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: the class member with the best evidence in acute ulcer bleeding after endoscopy. Cons: roughly four times the acquisition cost of pantoprazole for the same mechanism.',
        },
        {
          name: 'Famotidine (Pepcid, Pepcid AC)',
          class: 'Histamine H2-receptor antagonist',
          howItCompares:
            'Blocks one of three stimulatory signals rather than the pump itself. Pooled across 43 randomised trials, H2 blockers healed 51.9% of erosive oesophagitis against 83.6% for proton pump inhibitors. It works within an hour, and tolerance develops with continuous use.',
          typicalCost:
            'US$0.0494 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 139 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: fast, cheap, no covalent binding, essentially no CYP interactions. Cons: substantially weaker healing, and the effect fades within days of regular use.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask why you are on the intravenous form and when it stops',
          action:
            'In hospital, establish whether the drip is treating something or preventing something, and what the plan is at discharge.',
          patientImpact:
            'Intravenous acid suppression started for stress ulcer prophylaxis in intensive care is one of the commonest ways people leave hospital on a long-term proton pump inhibitor they were never assessed for. The two large trials of that practice found large reductions in bleeding and no change in survival.',
          clinicalPrecaution:
            'This is a question for the treating team. Nothing here tells anyone to stop or continue a medicine.',
        },
        {
          name: 'Mention every other tablet you take, including the heart ones',
          action:
            'List all concurrent medicines, particularly clopidogrel, methotrexate, warfarin and any HIV antiretroviral.',
          patientImpact:
            'Pantoprazole is the proton pump inhibitor least dependent on CYP2C19, which is why it is often chosen when clopidogrel is in the picture. It still raises gastric pH, and several drugs — including some antifungals and antiretrovirals — need an acid stomach to be absorbed at all.',
          clinicalPrecaution:
            'The pH-dependent absorption interactions are the ones most often missed, because they have nothing to do with liver enzymes and do not show up in interaction checkers built around them.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'COC1=C(C(=NC=C1)CS(=O)C2=NC3=C(N2)C=C(C=C3)OC(F)F)OC',
      chemicalFormula: 'C16H15F2N3O4S',
      molecularWeight: '383.40 g/mol',
      targetReceptorAffinity:
        'No reversible affinity constant exists, because the inhibition is a covalent disulfide bond rather than binding. Pantoprazole has a pyridine pKa around 3.9, slightly lower than omeprazole’s, so it needs a slightly more acidic compartment to accumulate and activate — which narrows its activation to the parietal cell canaliculus even further. Recovery of acid secretion requires new pump protein, not dissociation.',
      structureSource: {
        label:
          'PubChem CID 4679 (pantoprazole) — canonical SMILES, molecular formula and molecular weight, as ingested onto this record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4679',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'pan-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the difluoromethoxy benzimidazole and the dimethoxypyridine',
          description:
            'Confirm both fragments and in particular the difluoromethoxy group, which is what distinguishes this molecule from omeprazole and what lowers the pyridine pKa. Fluorine NMR is the fastest unambiguous check and there is no substitute for it here.',
          reagentsAndBuffer:
            '5-difluoromethoxy-2-mercaptobenzimidazole and 2-chloromethyl-3,4-dimethoxypyridine reference standards, 19F and 1H NMR in DMSO-d6, buffered HPLC at pH 7.4 or above, Karl Fischer titration',
        },
        {
          id: 'pan-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Thioether coupling and single-step oxidation to the sulfoxide',
          description:
            'Couple the two fragments to the sulfide, then oxidise exactly one step to the sulfoxide and stop. The sulfone is one oxidation further and is inactive; as with every drug in this class the whole synthesis turns on halting between the two.',
          dependsOnStepId: 'pan-w1',
          reagentsAndBuffer:
            'Sodium hydroxide in methanol or water for the coupling; meta-chloroperoxybenzoic acid or sodium hypochlorite for the oxidation, run cold, with in-process HPLC monitoring for sulfone breakthrough',
        },
        {
          id: 'pan-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Sodium sesquihydrate salt formation and crystallisation under base',
          description:
            'Isolate as the sodium sesquihydrate, which is the dispensed form and the reason the label names a different weight from the free acid. All operations stay alkaline: the free base is destroyed by acid in minutes, which is the mechanism working prematurely.',
          dependsOnStepId: 'pan-w2',
          reagentsAndBuffer:
            'Sodium hydroxide in aqueous ethanol, crystallisation with controlled water activity to fix the sesquihydrate stoichiometry, Karl Fischer for hydrate content, HPLC against a sulfone reference standard',
        },
        {
          id: 'pan-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Acid-dependent activation in isolated gastric vesicles',
          description:
            'Load hog gastric microsomal vesicles, generate an interior acid load with ATP, and show accumulation and inhibition. Running the identical experiment on vesicles held at neutral pH is the control that proves selectivity comes from the chemistry of activation rather than from any recognition of the target.',
          dependsOnStepId: 'pan-w3',
          reagentsAndBuffer:
            'Hog gastric H+/K+-ATPase microsomal vesicles, ATP and magnesium, nigericin and valinomycin as gradient-collapsing controls, LC-MS/MS quantification of vesicle-associated drug',
        },
        {
          id: 'pan-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'ATPase inhibition and the reducing-agent reversal that partly fails',
          description:
            'Measure loss of potassium-stimulated ATPase activity, then attempt reversal with a reducing agent. With omeprazole the activity comes back. With pantoprazole a component of the inhibition does not, which is the experimental signature of the second, membrane-buried cysteine anchor and the reason this molecule’s block is the most durable of the class.',
          dependsOnStepId: 'pan-w4',
          reagentsAndBuffer:
            'Potassium-stimulated ATPase assay with colorimetric phosphate readout, dithiothreitol or glutathione reversal arm run in parallel against an omeprazole comparator, sodium-potassium ATPase counter-screen',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pan-a1',
        category: 'measured',
        title:
          'COMPASS: 17,598 people, three years, placebo-controlled, and none of the feared harms appeared',
        laymanSummary:
          'This is the trial the whole class was waiting for. Nearly eighteen thousand people were randomly given a proton pump inhibitor or a dummy tablet and followed for three years, with dementia, kidney disease, pneumonia, fractures, cancer and death all counted every six months. Nothing differed except gut infections, which were slightly more common on the drug.',
        technicalDetails:
          'A 3 x 2 partial factorial double-blind trial randomised 17,598 participants with stable cardiovascular and peripheral artery disease to pantoprazole 40 mg daily (n=8,791) or placebo (n=8,807), on top of a separate randomisation to rivaroxaban with aspirin, rivaroxaban alone or aspirin alone. Median follow-up was 3.01 years, 53,152 patient-years. Pneumonia, Clostridioides difficile infection, other enteric infections, fracture, gastric atrophy, chronic kidney disease, diabetes, chronic obstructive lung disease, dementia, cardiovascular disease, cancer, hospitalisation and all-cause mortality were collected every six months. No outcome differed significantly except enteric infections, 1.4% against 1.0% (odds ratio 1.33, 95% CI 1.01 to 1.75). C. difficile was roughly twice as common on pantoprazole but there were only 13 events in total, so the difference was not significant. Three years is not a lifetime, and the trial does not speak to longer exposure.',
        evidenceSource: 'Moayyedi P et al., Gastroenterology 2019;157:682-691 (COMPASS, NCT01776424)',
        doi: '10.1053/j.gastro.2019.05.056',
        measuredMetric:
          'Fourteen prespecified safety outcomes collected six-monthly over a median 3.01 years, against matching placebo',
        auditFlag: 'verified',
      },
      {
        id: 'pan-a2',
        category: 'failed',
        title:
          'The same trial missed its gastroduodenal endpoint: hazard ratio 0.88, confidence interval crossing one',
        laymanSummary:
          'The other half of the same trial asked whether routinely adding this drug to aspirin or a blood thinner prevents upper gut problems. It did not — the primary result was a statistical draw. It did reduce one specific kind of bleeding, but 982 people had to be treated to prevent one event.',
        technicalDetails:
          'The primary outcome was time to first upper gastrointestinal event: a composite of overt bleeding, upper gastrointestinal bleeding from a gastroduodenal lesion or of unknown origin, occult bleeding, symptomatic gastroduodenal ulcer or five or more erosions, obstruction, or perforation. Events occurred in 102 of 8,791 on pantoprazole against 116 of 8,807 on placebo, hazard ratio 0.88 (95% CI 0.67 to 1.15). The prespecified component of bleeding from a gastroduodenal lesion was reduced, hazard ratio 0.52 (95% CI 0.28 to 0.94, P=0.03), and a post-hoc definition gave 0.45 (95% CI 0.27 to 0.74) — but with a number needed to treat of 982 (95% CI 609 to 2,528). The authors concluded that routine use in this population does not reduce upper gastrointestinal events.',
        evidenceSource: 'Moayyedi P et al., Gastroenterology 2019;157:403-412 (COMPASS, NCT01776424)',
        doi: '10.1053/j.gastro.2019.04.041',
        measuredMetric:
          'Time to first upper gastrointestinal event, composite, against matching placebo in 17,598 randomised patients',
        auditFlag: 'caution',
      },
      {
        id: 'pan-a3',
        category: 'measured',
        title: 'REVISE: bleeding cut from 3.5% to 1.0% in 4,821 ventilated patients',
        laymanSummary:
          'In the largest trial of stress ulcer prevention ever run, patients on a breathing machine got pantoprazole or a dummy drip. Serious bleeding from the stomach fell by about two thirds. The number of people who died was the same in both groups.',
        technicalDetails:
          'REVISE randomised 4,821 critically ill adults undergoing invasive ventilation across 68 intensive care units to intravenous pantoprazole 40 mg daily or matching placebo. Clinically important upper gastrointestinal bleeding occurred in 25 of 2,385 (1.0%) on pantoprazole against 84 of 2,377 (3.5%) on placebo, hazard ratio 0.30 (95% CI 0.19 to 0.47, P<0.001). The primary safety outcome, death from any cause at 90 days, was 696 of 2,390 (29.1%) against 734 of 2,379 (30.9%), hazard ratio 0.94 (95% CI 0.85 to 1.04, P=0.25). Patient-important bleeding was also reduced; every other multiplicity-adjusted secondary outcome, ventilator-associated pneumonia included, was similar.',
        evidenceSource: 'Cook D et al., N Engl J Med 2024;391:9-20 (REVISE, NCT03374800)',
        doi: '10.1056/NEJMoa2404245',
        measuredMetric:
          'Clinically important upper gastrointestinal bleeding in the ICU at 90 days, and all-cause death at 90 days, against matching placebo',
        auditFlag: 'verified',
      },
      {
        id: 'pan-a4',
        category: 'failed',
        title: 'SUP-ICU: the primary endpoint was death, and it did not move',
        laymanSummary:
          'A European trial of 3,298 intensive care patients set out to test whether preventing stress ulcers saves lives. It did not: 31.1% of patients on the drug died within 90 days against 30.4% on placebo.',
        technicalDetails:
          'SUP-ICU randomised 3,298 adults with an acute unplanned intensive care admission and at least one risk factor for gastrointestinal bleeding to intravenous pantoprazole 40 mg daily or placebo for the ICU stay. Data on the primary outcome were available for 99.5% of patients. At 90 days, 510 of 1,645 (31.1%) in the pantoprazole group and 499 of 1,653 (30.4%) in the placebo group had died, relative risk 1.02 (95% CI 0.91 to 1.13, P=0.76). The composite of clinically important gastrointestinal bleeding, pneumonia, C. difficile infection or myocardial ischaemia occurred in 21.9% against 22.6% (RR 0.96, 95% CI 0.83 to 1.11). Clinically important gastrointestinal bleeding was 2.5% against 4.2%, a difference the trial was not powered to test as a primary outcome.',
        evidenceSource: 'Krag M et al., N Engl J Med 2018;379:2199-2208 (SUP-ICU, NCT02467621)',
        doi: '10.1056/NEJMoa1714919',
        measuredMetric: 'Death from any cause at 90 days, against matching placebo',
        auditFlag: 'verified',
      },
      {
        id: 'pan-a5',
        category: 'conclusion_shift',
        title:
          'Stress ulcer prophylaxis moved from "prevents bleeds, therefore saves lives" to "prevents bleeds, full stop"',
        laymanSummary:
          'For thirty years intensive care units gave acid suppression to almost every ventilated patient, on the reasoning that stress ulcers bleed and bleeding kills. Two enormous randomised trials since 2018 have confirmed the first half and refuted the inference in the second. Bleeding falls a great deal. Survival does not change.',
        technicalDetails:
          'SUP-ICU in 2018 chose 90-day mortality as its primary outcome and found 31.1% against 30.4% (RR 1.02, 95% CI 0.91 to 1.13). REVISE in 2024 chose bleeding as the primary efficacy outcome and mortality as the primary safety outcome, and found a hazard ratio of 0.30 for bleeding against 0.94 (95% CI 0.85 to 1.04) for death. Read together, 7,000 randomised patients establish a large, replicated effect on the surrogate and a null on the outcome, with confidence intervals now tight enough that a large mortality benefit can be excluded. Neither trial found the harms — pneumonia, C. difficile — that had been the main argument against the practice. The remaining case for prophylaxis is bleeding avoidance on its own terms, which is a defensible goal and a different claim from the one made for three decades.',
        evidenceSource:
          'Krag M et al., N Engl J Med 2018;379:2199-2208; Cook D et al., N Engl J Med 2024;391:9-20',
        doi: '10.1056/NEJMoa2404245',
        inferredClaim:
          'That preventing stress ulcer bleeding in ventilated patients improves survival — an inference held for three decades that two trials totalling more than 8,000 patients did not support',
        auditFlag: 'verified',
      },
      {
        id: 'pan-a6',
        category: 'inferred',
        title:
          'Giving it before the endoscope changes what the endoscopist sees, not what happens to the patient',
        laymanSummary:
          'Starting acid suppression before someone with a gastrointestinal bleed is scoped makes the ulcer look less angry and reduces the need to treat it during the procedure. It does not change how many people die, rebleed or need surgery.',
        technicalDetails:
          'The Cochrane review of six randomised trials in 2,223 participants found no significant difference in mortality (6.1% against 5.5%, OR 1.12, 95% CI 0.72 to 1.73), rebleeding (13.9% against 16.6%, OR 0.81, 95% CI 0.61 to 1.09) or surgery (9.9% against 10.2%, OR 0.96, 95% CI 0.68 to 1.35). Proton pump inhibitor treatment did reduce the proportion with stigmata of recent haemorrhage at index endoscopy (37.2% against 46.5%, OR 0.67, 95% CI 0.54 to 0.84), though that finding was not robust to sensitivity analysis, and reduced the need for endoscopic therapy at index endoscopy (8.6% against 11.7%, OR 0.68, 95% CI 0.50 to 0.93). The practice is near-universal and the endpoints it improves are procedural.',
        evidenceSource:
          'Sreedharan A et al., Cochrane Database Syst Rev 2010;7:CD005415',
        doi: '10.1002/14651858.CD005415.pub3',
        inferredClaim:
          'That reducing visible stigmata of recent haemorrhage before endoscopy improves survival or rebleeding — a procedural surrogate that six randomised trials did not connect to any clinical outcome',
        auditFlag: 'contested',
      },
      {
        id: 'pan-a7',
        category: 'inferred',
        title: 'The interaction advantage is a pharmacokinetic fact with no outcome behind it',
        laymanSummary:
          'Pantoprazole is routinely chosen over the others for patients on clopidogrel, because it interferes least with the liver enzyme both drugs use. That reasoning is sound chemistry. No trial has ever shown that choosing it produces fewer heart attacks.',
        technicalDetails:
          'Pantoprazole is metabolised by CYP2C19 to a demethylated intermediate that is then conjugated by sulphotransferase, giving it a lower affinity for CYP2C19 than omeprazole, esomeprazole or lansoprazole and correspondingly less inhibition of clopidogrel bioactivation in platelet-function studies. The one randomised trial that measured cardiovascular outcomes when a proton pump inhibitor was added to clopidogrel used omeprazole and found no excess (hazard ratio 0.99, 95% CI 0.68 to 1.44). No trial has randomised pantoprazole against another proton pump inhibitor with a cardiovascular endpoint. The preference is a mechanistic inference from a surrogate, and a reasonable one, but it has never been tested.',
        evidenceSource:
          'Bhatt DL et al., N Engl J Med 2010;363:1909-1917 (COGENT); PROTONIX United States prescribing information, Clinical Pharmacology (NDA 020987)',
        doi: '10.1056/NEJMoa1007964',
        inferredClaim:
          'That the lower CYP2C19 affinity of pantoprazole translates into fewer cardiovascular events in patients on clopidogrel — never tested against an outcome in any randomised comparison',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed in armour, or given straight into a vein',
        laymanDesc:
          'The tablet has a coating that survives stomach acid, because the drug itself does not. In hospital it is often given as a drip instead, which skips the problem entirely.',
        molecularDetail:
          'Pantoprazole free base degrades rapidly in acid. Oral products are enteric-coated for release above pH 5.5; bioavailability is about 77% and, unlike omeprazole, does not change with repeated dosing. The intravenous sodium salt bypasses the gut. Plasma half-life is roughly one hour, far shorter than the duration of effect.',
        iconName: 'Package',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Circulates inert through every tissue in the body',
        laymanDesc:
          'In blood and in every organ other than the stomach lining, the drug is chemically dead. It has no target it recognises and no receptor it binds.',
        molecularDetail:
          'Circulating pantoprazole is a neutral weak base, about 98% protein bound, with no meaningful reversible affinity for any protein. Its selectivity comes entirely from where the chemistry can happen, not from molecular recognition of the pump.',
        iconName: 'Droplets',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'Needs a stronger acid than its rivals to switch on',
        laymanDesc:
          'It only becomes active below a certain acidity, and its threshold is a little lower than the other drugs in the class. That narrows the range of places in the body where it can do anything at all.',
        molecularDetail:
          'The pyridine pKa is around 3.9, below omeprazole’s. Protonation traps the molecule in the secretory canaliculus, and the lower pKa means accumulation and activation are more sharply confined to compartments below about pH 3 — in practice, the parietal cell canaliculus and nowhere else.',
        iconName: 'Lock',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The acid rearranges it into a thiol trap',
        laymanDesc:
          'Once trapped, the acid converts it into a form that grabs the first sulfur atom it meets. That form lives for a fraction of a second, which is exactly why it cannot leak out and react elsewhere.',
        molecularDetail:
          'Second protonation triggers rearrangement to a cyclic sulfenamide, a short-lived electrophile with high affinity for accessible cysteine thiols. The half-life of the activated species in solution is measured in seconds at canalicular pH, which is the structural reason a highly reactive molecule produces no off-target chemistry.',
        iconName: 'Flame',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'Two anchor points instead of one',
        laymanDesc:
          'It bonds to the pump at the usual place and also at a second site buried inside the membrane, where the cell’s own repair chemistry cannot easily reach. That is why its block is the most stubborn of the four.',
        molecularDetail:
          'Beyond the cysteine 813 disulfide common to the class, pantoprazole also derivatises cysteine 822, which sits within the membrane domain and is inaccessible to cytoplasmic reducing agents such as glutathione. In vitro, reducing agents reverse omeprazole inhibition more completely than pantoprazole inhibition, and the residual is attributed to that second anchor.',
        iconName: 'Link',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'What the block buys, and what it does not',
        laymanDesc:
          'Acid falls, erosions heal, and stress ulcers in intensive care bleed far less often. What two trials in more than 7,000 critically ill patients could not show is that anyone lives longer for it.',
        molecularDetail:
          'Recovery of secretion requires pump resynthesis, with a half-life near 50 hours. Suppression raises gastrin and total pump mass, the basis of rebound hypersecretion on withdrawal. On the outcome side, REVISE gives a hazard ratio of 0.30 for clinically important bleeding against 0.94 for 90-day death, and SUP-ICU gives a relative risk of 1.02 for 90-day death. The surrogate and the outcome part company, and this page keeps them apart.',
        iconName: 'CircleSlash',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'COMPASS proton pump inhibitor safety analysis (NCT01776424)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, 3 x 2 partial factorial',
        sampleSize: 17598,
        primaryEndpoint:
          'Fourteen prespecified safety outcomes collected every six months over a median 3.01 years, including pneumonia, C. difficile, enteric infection, fracture, gastric atrophy, chronic kidney disease, dementia, cancer and all-cause mortality',
        endpointMet: true,
        statisticalPValue:
          'No significant difference on any outcome except enteric infections, 1.4% against 1.0% (odds ratio 1.33, 95% CI 1.01 to 1.75)',
        unreportedAdverseSignals:
          'C. difficile infection was roughly twice as common on pantoprazole, on 13 events in total. The trial cannot exclude a real effect on so few events, and the authors say so.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'COMPASS gastroduodenal outcome analysis (NCT01776424)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 17598,
        primaryEndpoint:
          'Time to first upper gastrointestinal event: composite of overt bleeding, bleeding from a gastroduodenal lesion or of unknown origin, occult bleeding, symptomatic ulcer or five or more erosions, obstruction, or perforation',
        endpointMet: false,
        statisticalPValue:
          '102 of 8,791 against 116 of 8,807; hazard ratio 0.88 (95% CI 0.67 to 1.15). Prespecified bleeding from gastroduodenal lesions HR 0.52 (95% CI 0.28 to 0.94), P=0.03, number needed to treat 982.',
        unreportedAdverseSignals:
          'The headline that circulated was the significant component, not the missed primary. A number needed to treat of 982 belongs next to it.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'REVISE (NCT03374800)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, international',
        sampleSize: 4821,
        primaryEndpoint:
          'Clinically important upper gastrointestinal bleeding in the ICU at 90 days (efficacy) and death from any cause at 90 days (safety)',
        endpointMet: true,
        statisticalPValue:
          'Bleeding 1.0% against 3.5%, hazard ratio 0.30 (95% CI 0.19 to 0.47), P<0.001. Death 29.1% against 30.9%, hazard ratio 0.94 (95% CI 0.85 to 1.04), P=0.25.',
        unreportedAdverseSignals:
          'The efficacy endpoint was met and the mortality endpoint was null. Reporting only the first would misrepresent the trial.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SUP-ICU (NCT02467621)',
        phase: 'Phase 4, randomised, blinded, placebo-controlled, multicentre European',
        sampleSize: 3298,
        primaryEndpoint: 'Death by 90 days after randomisation',
        endpointMet: false,
        statisticalPValue:
          '31.1% against 30.4%; relative risk 1.02 (95% CI 0.91 to 1.13), P=0.76',
        unreportedAdverseSignals:
          'Clinically important gastrointestinal bleeding was 2.5% against 4.2%, but that was a secondary outcome and the trial was not designed to test it.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No significant difference from placebo on thirteen of fourteen safety outcomes over a median 3.01 years in 17,598 randomised people; enteric infections 1.4% against 1.0% (OR 1.33)',
        'Clinically important upper gastrointestinal bleeding 1.0% against 3.5% in 4,821 ventilated patients (HR 0.30, P<0.001)',
        'Ninety-day death 29.1% against 30.9% in REVISE and 31.1% against 30.4% in SUP-ICU — two null results totalling more than 8,000 patients',
        'Upper gastrointestinal composite hazard ratio 0.88 (95% CI 0.67 to 1.15) on top of aspirin or rivaroxaban: a missed primary endpoint',
      ],
      unsupportedInferences: [
        'That preventing stress ulcer bleeding improves survival, the reasoning behind three decades of routine intensive-care prophylaxis',
        'That reducing stigmata of recent haemorrhage before endoscopy improves mortality, rebleeding or need for surgery, none of which moved across six randomised trials',
        'That pantoprazole’s lower CYP2C19 affinity produces fewer cardiovascular events on clopidogrel — a mechanistic preference never tested against an outcome',
        'That three years of placebo-controlled safety data settles the question of twenty years of use; it does not, and no trial of that length exists',
      ],
      whatFailedInitially: [
        'SUP-ICU chose mortality as its primary endpoint and returned a relative risk of 1.02',
        'The COMPASS gastroduodenal primary endpoint was not met, and the component that was significant carried a number needed to treat of 982',
        'Pre-endoscopy dosing improves what the endoscopist sees and nothing the patient experiences',
        'C. difficile was numerically doubled in COMPASS on 13 events, too few to interpret and too few to dismiss',
      ],
      realWorldOutcome: [
        'Approved under NDA 020987 in February 2000, with the intravenous form following in 2001',
        'Generic in the United States from 2007 after an at-risk launch, and now the cheapest proton pump inhibitor in this file at four cents a tablet',
        'The molecule that supplied the class its only large placebo-controlled long-term safety dataset',
        'Intensive-care practice has shifted from universal prophylaxis toward risk-targeted use, on the strength of these trials rather than of expert opinion',
      ],
    },
    deliverySystem: {
      type: 'Oral delayed-release tablet, oral delayed-release granules for suspension, and intravenous powder for injection (sodium salt)',
      description:
        'Oral forms are enteric-protected because the free base is destroyed by gastric acid. The intravenous form removes both the coating problem and the absorption question, which is why almost all inpatient use runs through it. Bioavailability of the oral tablet is about 77% and does not change with repeated dosing.',
      safetyProfile:
        'The label carries warnings for acute tubulointerstitial nephritis, Clostridioides difficile-associated diarrhoea, bone fracture with long-term high-dose use, cutaneous and systemic lupus erythematosus, cyanocobalamin deficiency, hypomagnesaemia, and fundic gland polyps with use beyond one year. Commonest trial adverse events are headache, diarrhoea, nausea, abdominal pain and flatulence. In the largest randomised safety dataset in the class, three years of exposure produced no significant excess of pneumonia, fracture, kidney disease, dementia, cancer or death, and a small excess of enteric infection.',
    },
    commonQuestions: [
      {
        q: 'Is this one safer than the other proton pump inhibitors?',
        a: 'It is the one with the most evidence, which is not quite the same thing. COMPASS randomised 17,598 people to pantoprazole or placebo for a median of three years and counted pneumonia, C. difficile, other gut infections, fractures, gastric atrophy, kidney disease, diabetes, lung disease, dementia, cardiovascular disease, cancer, hospitalisation and death every six months. Nothing differed significantly except gut infections, 1.4% against 1.0%. No other drug in the class has been tested that way. Whether that result transfers to omeprazole, esomeprazole and lansoprazole is an inference from shared mechanism — a reasonable one, and still an inference.',
        auditNote:
          'Three years of randomised data is a great deal more than the class had before 2019, and it is still not evidence about twenty years of continuous use.',
      },
      {
        q: 'Why is nearly everyone in intensive care on this?',
        a: 'Because critically ill patients on breathing machines develop stress ulcers that bleed, and for thirty years the practice was near-universal on the reasoning that preventing the bleed would prevent the death that follows. Two very large randomised trials have now taken that apart. SUP-ICU made 90-day death its primary outcome in 3,298 patients and found 31.1% against 30.4%. REVISE made bleeding its primary outcome in 4,821 patients and found a two-thirds reduction — 1.0% against 3.5% — with death unchanged at 29.1% against 30.9%. The bleeding effect is real, large and replicated. The survival benefit that justified the practice is not there.',
      },
      {
        q: 'I was told to take this because I am on clopidogrel. Why this one?',
        a: 'Clopidogrel is a prodrug that needs the liver enzyme CYP2C19 to become active, and proton pump inhibitors are cleared by the same enzyme. Pantoprazole competes for it least, because after the first step it is handed to a different enzyme system entirely. That makes it the logical choice on chemistry. What has never been done is a trial randomising pantoprazole against another proton pump inhibitor and counting heart attacks. The one randomised cardiovascular test in this area used omeprazole and found no excess at all (hazard ratio 0.99). So the preference is well reasoned and untested, and this page says so rather than presenting it as proven.',
      },
      {
        q: 'Does taking it before an endoscopy for bleeding help?',
        a: 'It helps the endoscopy, not the patient. Pooling six randomised trials in 2,223 people, starting a proton pump inhibitor before the scope reduced the proportion with active-looking bleeding stigmata from 46.5% to 37.2% and reduced the need to treat during the procedure from 11.7% to 8.6%. Mortality, rebleeding and surgery were all unchanged, with confidence intervals comfortably including no effect. Those are real procedural benefits and they are worth something to an endoscopy service. They are not the reason most people assume the drip is running.',
      },
      {
        q: 'Why does it have to be an enteric-coated tablet?',
        a: 'Because the drug is destroyed by exactly the thing it is designed to stop. Pantoprazole free base breaks down in stomach acid within minutes, so a plain tablet would deliver almost nothing. The coating carries it past the stomach to the small intestine, where it is absorbed into the blood, and the drug then arrives at the stomach lining from the inside — through the circulation, not through the lumen. It is a genuinely odd arrangement: the molecule has to avoid acid in order to reach the place where acid activates it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Moayyedi P et al. Safety of proton pump inhibitors based on a large, multi-year, randomized trial of patients receiving rivaroxaban or aspirin. Gastroenterology 2019;157:682-691',
        identifier: '10.1053/j.gastro.2019.05.056',
        kind: 'doi',
      },
      {
        label:
          'Moayyedi P et al. Pantoprazole to prevent gastroduodenal events in patients receiving rivaroxaban and/or aspirin in a randomized, double-blind, placebo-controlled trial. Gastroenterology 2019;157:403-412',
        identifier: '10.1053/j.gastro.2019.04.041',
        kind: 'doi',
      },
      {
        label:
          'Cook D et al. Stress ulcer prophylaxis during invasive mechanical ventilation. N Engl J Med 2024;391:9-20 (REVISE)',
        identifier: '10.1056/NEJMoa2404245',
        kind: 'doi',
      },
      {
        label:
          'Krag M et al. Pantoprazole in patients at risk for gastrointestinal bleeding in the ICU. N Engl J Med 2018;379:2199-2208 (SUP-ICU)',
        identifier: '10.1056/NEJMoa1714919',
        kind: 'doi',
      },
      {
        label:
          'Sreedharan A et al. Proton pump inhibitor treatment initiated prior to endoscopic diagnosis in upper gastrointestinal bleeding. Cochrane Database Syst Rev 2010;7:CD005415',
        identifier: '10.1002/14651858.CD005415.pub3',
        kind: 'doi',
      },
      {
        label:
          'Bhatt DL et al. Clopidogrel with or without omeprazole in coronary artery disease. N Engl J Med 2010;363:1909-1917 (COGENT)',
        identifier: '10.1056/NEJMoa1007964',
        kind: 'doi',
      },
      {
        label:
          'COMPASS: rivaroxaban and pantoprazole in coronary or peripheral artery disease, 3 x 2 partial factorial',
        identifier: 'NCT01776424',
        kind: 'nct',
      },
      {
        label: 'REVISE: re-evaluating the inhibition of stress erosions',
        identifier: 'NCT03374800',
        kind: 'nct',
      },
      {
        label: 'SUP-ICU: stress ulcer prophylaxis in the intensive care unit',
        identifier: 'NCT02467621',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: PROTONIX (pantoprazole sodium) delayed-release tablets, NDA 020987, Wyeth Pharmaceuticals — original approval 2 February 2000',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020987',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 4679 — pantoprazole structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4679',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Esomeprazole — half of omeprazole, patented separately, launched the year its parent went
  //    generic, and shown to be better than it in a trial that gave the new drug twice the dose.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'esomeprazole',
    name: 'Esomeprazole',
    tradeName: 'Nexium / Nexium 24HR',
    sponsor:
      'AstraZeneca — approved in the United States under NDA 021153 on 20 February 2001, the year the omeprazole composition-of-matter patent expired',
    targetGene: 'ATP4A and ATP4B — the catalytic and glycoprotein subunits of the gastric proton pump',
    targetProtein:
      'Gastric H+/K+-ATPase, bound covalently at cysteine 813 on the luminal face of the alpha subunit — the same target, by the same chemistry, as its racemic parent',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2001,
    indication:
      'Healing of erosive esophagitis and maintenance of healing, and treatment of symptomatic gastroesophageal reflux disease, in adults and in paediatric patients; risk reduction of NSAID-associated gastric ulcer; Helicobacter pylori eradication in combination with antibacterials; and pathological hypersecretory conditions including Zollinger-Ellison syndrome',
    patientFriendlyIndication:
      'Reflux and heartburn, including reflux that has visibly damaged the gullet, and prevention of stomach ulcers caused by anti-inflammatory painkillers',
    anatomicalSite:
      'Gastric parietal cell — the secretory canaliculus, reached through the bloodstream rather than from the stomach lumen',
    conditionContext: {
      conditionExplainer:
        'Omeprazole is a mixture of two mirror-image forms of the same molecule, present in equal amounts. Mirror-image molecules are chemically identical in most respects but the body’s enzymes are themselves handed, so they can clear one form faster than the other. Esomeprazole is the slower-cleared half, isolated and sold on its own.',
      whyItMatters:
        'This is the textbook case of what the pharmaceutical literature calls the chiral switch. The pharmacology is real and modest; the commercial timing is the part worth auditing, and so is the design of the trials that were used to demonstrate superiority.',
      whoTakesThis:
        'Adults and children with reflux disease, and — through the over-the-counter version approved in 2014 — a very large number of people self-treating heartburn without a diagnosis.',
      clinicalGoals:
        'The registered endpoint is healing of erosive oesophagitis seen at endoscopy. Whether that healing changes anything a person would notice a decade later is a separate question, and the one trial that ran long enough to ask it is audited below.',
    },
    oneSentenceVerdict:
      'The single slower-cleared mirror image of omeprazole, isolated and patented as a new product the year its parent went generic: it healed erosive oesophagitis in 93.7% of patients against 84.2% for omeprazole in 2,425 people — at 40 mg against 20 mg, twice the dose — and in the one trial that ran nearly nine years, high-dose esomeprazole delayed death, oesophageal cancer or high-grade dysplasia in Barrett’s oesophagus with a time ratio of 1.27 and a number needed to treat of 34.',
    laymanHowItWorks:
      'Omeprazole comes as a 50:50 mixture of two forms that are mirror images of each other, like a left and a right hand. The liver enzyme that clears them is itself handed, and it clears one of the two faster. Esomeprazole is just the slower-cleared half on its own, so for the same milligram it stays in the blood a little longer and reaches the stomach pump in slightly greater quantity. Once there it does exactly what omeprazole does: the stomach’s own acid converts it into a reactive form that bonds permanently to the acid pump, and the cell has to build a new pump before it can make acid again.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1533 per delayed-release capsule at United States pharmacy acquisition cost (CMS NADAC, median across 142 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Nexium was approved on 20 February 2001, the same year the omeprazole composition-of-matter patent expired, and became one of the highest-grossing drugs in history. The manoeuvre — isolate an enantiomer of a drug about to go generic, patent it separately, and move prescribers across before the switch — is the standard illustration of evergreening in the health-policy literature. Both molecules are now generic, and the esomeprazole capsule costs pharmacies roughly twice what the omeprazole capsule costs.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The nearest substitute is the drug esomeprazole was carved out of. Omeprazole contains this molecule plus an equal quantity of its mirror image, targets the same pump by the same covalent chemistry, and costs pharmacies about half as much per capsule. The case for paying the difference rests on trials that compared unequal doses, which is the central audit on this page. Below the class the alternatives are measurably weaker, and there is no food or supplement that heals an erosion.',
      conventionalRx: [
        {
          name: 'Omeprazole (Prilosec, Prilosec OTC)',
          class: 'Proton pump inhibitor, racemic mixture containing esomeprazole',
          howItCompares:
            'Literally contains this drug, as half of its content. Cleared somewhat faster because the R-enantiomer is a better CYP2C19 substrate, so plasma exposure per milligram is lower. Every published superiority comparison against it used 40 mg of esomeprazole against 20 mg of omeprazole.',
          typicalCost:
            'US$0.0816 per delayed-release capsule at United States pharmacy acquisition cost (CMS NADAC, median across 151 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: half the acquisition cost, longest clinical history, available off the shelf. Cons: more CYP2C19-dependent, and the clopidogrel interaction warning attaches to it most prominently.',
        },
        {
          name: 'Pantoprazole (Protonix)',
          class: 'Proton pump inhibitor, substituted benzimidazole',
          howItCompares:
            'Same pump, same covalent chemistry, least CYP2C19-dependent of the four and the only one with a three-year placebo-controlled safety trial behind it in 17,598 people. It is also the cheapest of the four at pharmacy acquisition cost.',
          typicalCost:
            'US$0.0428 per delayed-release tablet at United States pharmacy acquisition cost (CMS NADAC, median across 81 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheapest, fewest interactions, best long-term safety evidence. Cons: no randomised evidence in acute ulcer bleeding after endoscopy, where esomeprazole has a trial.',
        },
        {
          name: 'Famotidine (Pepcid, Pepcid AC)',
          class: 'Histamine H2-receptor antagonist',
          howItCompares:
            'A different and weaker mechanism: it blocks one stimulatory receptor rather than destroying the pump. Pooled across 43 randomised trials, H2 blockers healed 51.9% of erosive oesophagitis against 83.6% for proton pump inhibitors.',
          typicalCost:
            'US$0.0494 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 139 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: acts within the hour, no covalent binding, minimal interactions. Cons: much weaker healing and tolerance within days of continuous use.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask what the same money buys as omeprazole',
          action:
            'Establish whether the prescription was written for a clinical reason specific to this molecule or by habit.',
          patientImpact:
            'Esomeprazole is one half of omeprazole. The published head-to-head superiority was measured at 40 mg against 20 mg, and no trial has compared equal milligrams of the two on a patient outcome. The acquisition-cost difference is roughly twofold per capsule.',
          clinicalPrecaution:
            'There are situations where the specific molecule matters — the intravenous ulcer-bleeding evidence is esomeprazole’s, not omeprazole’s. This is a question for a prescriber, not a switching instruction.',
        },
        {
          name: 'If you have Barrett’s oesophagus, ask about the AspECT result',
          action:
            'Raise the trial of high-dose esomeprazole with and without aspirin in Barrett’s oesophagus.',
          patientImpact:
            'AspECT followed 2,557 people for a median of 8.9 years and found high-dose proton pump inhibition delayed a composite of death, oesophageal adenocarcinoma and high-grade dysplasia, with a number needed to treat of 34. It is the only trial in this file that ran long enough to count cancers.',
          clinicalPrecaution:
            'The trial was unblinded, the endpoint was a composite dominated by all-cause mortality, and the aspirin arm carries its own bleeding risk. Nothing here recommends a dose or a regimen.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=CN=C(C(=C1OC)C)C[S@](=O)C2=NC3=C(N2)C=C(C=C3)OC',
      chemicalFormula: 'C17H19N3O3S',
      molecularWeight: '345.40 g/mol',
      targetReceptorAffinity:
        'Identical to omeprazole at the target, because it is one of omeprazole’s two components and the activated sulfenamide it forms is achiral at the reacting centre. The difference between the two drugs is entirely pharmacokinetic: the S-enantiomer is a poorer substrate for CYP2C19, so it is cleared more slowly and area under the plasma concentration curve is higher per milligram. There is no dissociation constant, because inhibition is a covalent disulfide bond.',
      structureSource: {
        label:
          'PubChem CID 9568614 (esomeprazole) — canonical isomeric SMILES showing the S configuration at the sulfoxide, molecular formula and weight, as ingested onto this record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9568614',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'eso-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Chiral purity at the sulfoxide, which is the entire product claim',
          description:
            'Establish the enantiomeric excess before anything else. This molecule differs from omeprazole in exactly one way — the configuration at the sulfur — so a batch with poor enantiomeric excess is not a weaker drug, it is the parent drug sold at the daughter’s price. Nothing else about the identity check distinguishes the two.',
          reagentsAndBuffer:
            'Chiral HPLC on an amylose or cellulose carbamate stationary phase, circular dichroism or optical rotation against a reference standard, 1H NMR in DMSO-d6, buffered mobile phase held at pH 7.4 or above',
        },
        {
          id: 'eso-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Asymmetric oxidation of the sulfide to a single sulfoxide enantiomer',
          description:
            'Oxidise the prochiral sulfide to the sulfoxide using a chiral titanium-tartrate catalyst system so that one enantiomer forms preferentially. This is the step the whole product exists for; the alternative route, resolving racemic omeprazole, throws half the material away and was not commercially viable at scale.',
          dependsOnStepId: 'eso-w1',
          reagentsAndBuffer:
            'Titanium tetraisopropoxide with (S,S)- or (R,R)-diethyl tartrate, cumene hydroperoxide as oxidant, diisopropylethylamine, toluene, controlled water stoichiometry, run cold with in-process chiral HPLC',
        },
        {
          id: 'eso-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Magnesium salt formation and enantiomeric upgrading by crystallisation',
          description:
            'Crystallise as the magnesium trihydrate, which is the dispensed form, and use the crystallisation to raise enantiomeric excess above what the reaction delivered. All handling stays alkaline, because the free base is destroyed by acid within minutes.',
          dependsOnStepId: 'eso-w2',
          reagentsAndBuffer:
            'Magnesium methoxide or magnesium acetate in methanol and water, controlled water activity to fix the trihydrate, chiral HPLC before and after crystallisation, HPLC against a sulfone reference standard',
        },
        {
          id: 'eso-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Acid trapping and activation in isolated gastric vesicles, run against the R-enantiomer',
          description:
            'Load hog gastric microsomal vesicles and compare accumulation and inhibition for the S- and R-forms side by side. The expected and important result is that they are the same: the enantiomers differ in how the liver handles them, not in what they do to the pump, and an assay that showed otherwise would contradict the accepted account of the molecule.',
          dependsOnStepId: 'eso-w3',
          reagentsAndBuffer:
            'Hog gastric H+/K+-ATPase microsomal vesicles, ATP and magnesium for the pH gradient, matched R-enantiomer comparator, LC-MS/MS quantification of vesicle-associated drug',
        },
        {
          id: 'eso-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'CYP2C19 turnover comparison — where the two enantiomers actually differ',
          description:
            'Measure metabolic clearance of both enantiomers in human liver microsomes and in recombinant CYP2C19, and repeat in microsomes from a poor-metaboliser genotype. The whole clinical case for the single enantiomer rests on this measurement, so it belongs in the quantification step rather than being asserted from the marketing literature.',
          dependsOnStepId: 'eso-w4',
          reagentsAndBuffer:
            'Pooled and genotyped human liver microsomes, recombinant CYP2C19 and CYP3A4 supersomes, NADPH regenerating system, chiral LC-MS/MS to resolve the two enantiomers and their hydroxy and sulfone metabolites',
        },
      ],
    },
    keyAudits: [
      {
        id: 'eso-a1',
        category: 'inferred',
        title:
          'The superiority result was measured at 40 mg against 20 mg, and no equal-dose comparison exists',
        laymanSummary:
          'The trial that established esomeprazole as better than omeprazole gave twice as much of the new drug as of the old one. It healed more people. What it did not test is whether the same amount of each performs differently, which is the question a reader assumes was asked.',
        technicalDetails:
          'Richter, Kahrilas and colleagues randomised 2,425 patients with endoscopically confirmed erosive oesophagitis, Helicobacter pylori negative by serology, to esomeprazole 40 mg or omeprazole 20 mg once daily for eight weeks across 163 United States centres. Healing at week 8 was 93.7% against 84.2% (P<0.001, life-table estimates, intention-to-treat), and at week 4 was 81.7% against 68.7%. Esomeprazole was superior on every secondary measure, with a comparable safety profile. The comparison is between different milligram quantities of two molecules that act on the same target by the same chemistry, one of which is a component of the other. A dose-equivalence trial would answer the question the headline implies; none has been published.',
        evidenceSource:
          'Richter JE, Kahrilas PJ et al., Am J Gastroenterol 2001;96:656-665',
        doi: '10.1111/j.1572-0241.2001.03600.x',
        inferredClaim:
          'That the S-enantiomer is intrinsically more effective than its racemic parent — an inference from a trial that gave the S-enantiomer twice the milligram dose',
        auditFlag: 'contested',
      },
      {
        id: 'eso-a2',
        category: 'measured',
        title:
          'AspECT: nearly nine years of follow-up, and high-dose PPI delayed cancer, dysplasia or death',
        laymanSummary:
          'This is the only trial on any page in this file that ran long enough to count cancers. Two and a half thousand people with a pre-cancerous change in the gullet took high-dose or low-dose esomeprazole, with or without aspirin, for at least eight years. High dose delayed the composite of death, oesophageal cancer and severe dysplasia, and 34 people had to be treated to prevent one event.',
        technicalDetails:
          'AspECT was a 2 x 2 factorial trial at 84 centres in the United Kingdom and one in Canada. Between March 2005 and March 2009 it recruited 2,557 patients with Barrett’s oesophagus of at least 1 cm, randomising to high-dose (40 mg twice daily) or low-dose (20 mg once daily) esomeprazole, with or without aspirin, for at least eight years. Median follow-up and treatment duration was 8.9 years (IQR 8.2 to 9.8), with 20,095 follow-up years and 99.9% of planned data collected. The primary composite endpoint was time to all-cause mortality, oesophageal adenocarcinoma or high-grade dysplasia; 313 primary events occurred. High-dose gave 139 events in 1,270 patients against 174 in 1,265 on low dose, time ratio 1.27 (95% CI 1.01 to 1.58, P=0.038), number needed to treat 34. Aspirin alone did not reach significance (TR 1.24, 95% CI 0.98 to 1.57, P=0.068) unless NSAID users were censored. The combination against low-dose PPI alone gave TR 1.59 (95% CI 1.14 to 2.23, P=0.0068). The trial was unblinded, though reporting pathologists were masked, and the composite is dominated by all-cause mortality rather than by cancer.',
        evidenceSource:
          'Jankowski JAZ et al., Lancet 2018;392:400-408 (AspECT, EudraCT 2004-003836-77)',
        doi: '10.1016/S0140-6736(18)31388-6',
        measuredMetric:
          'Time to all-cause mortality, oesophageal adenocarcinoma or high-grade dysplasia over a median 8.9 years, high-dose against low-dose esomeprazole',
        auditFlag: 'verified',
      },
      {
        id: 'eso-a3',
        category: 'measured',
        title:
          'Intravenous esomeprazole after endoscopic haemostasis: rebleeding 5.9% against 10.3%',
        laymanSummary:
          'After a bleeding ulcer has been treated through an endoscope, a 72-hour drip of high-dose esomeprazole nearly halved the chance of bleeding again in the next three days. Deaths and operations were fewer too, but not by enough to be certain.',
        technicalDetails:
          'A randomised, blinded trial across 91 emergency departments in 16 countries assigned patients with peptic ulcer bleeding from a single gastric or duodenal ulcer showing high-risk stigmata, after successful endoscopic haemostasis, to an 80 mg intravenous esomeprazole bolus followed by an 8 mg/h infusion over 72 hours, or matching placebo; both groups then received oral esomeprazole for 27 days. Of 767 randomised, 764 were analysed. Clinically significant recurrent bleeding within 72 hours occurred in 22 of 375 (5.9%) against 40 of 389 (10.3%), a difference of 4.4 percentage points (95% CI 0.6 to 8.3, P=0.026), sustained at 7 and 30 days (P=0.010). Endoscopic re-treatment fell from 11.6% to 6.4% (difference 5.2 points, 95% CI 1.1 to 9.2, P=0.012). Surgery was 2.7% against 5.4% and all-cause mortality 0.8% against 2.1%, neither significant. The trial was funded by AstraZeneca and endoscopic therapy was not fully standardised.',
        evidenceSource: 'Sung JJ et al., Ann Intern Med 2009;150:455-464',
        doi: '10.7326/0003-4819-150-7-200904070-00105',
        measuredMetric:
          'Clinically significant recurrent bleeding within 72 hours after endoscopic haemostasis, against matching placebo',
        auditFlag: 'verified',
      },
      {
        id: 'eso-a4',
        category: 'failed',
        title: 'It did nothing for poorly controlled asthma, and silent reflux did not identify anyone it helped',
        laymanSummary:
          'Reflux is common in asthma, often without symptoms, and treating it was widely expected to improve asthma control. A trial of 412 adults on high-dose esomeprazole found no difference at all — and testing people to find the ones who really did have reflux did not find a group that benefited either.',
        technicalDetails:
          'A parallel-group, double-blind trial randomised 412 participants with inadequately controlled asthma despite inhaled corticosteroids and with minimal or no reflux symptoms to esomeprazole 40 mg twice daily or matching placebo, following them for 24 weeks with daily asthma diaries, four-weekly spirometry and symptom questionnaires. Episodes of poor asthma control occurred at 2.3 against 2.5 events per person-year (P=0.66). There was no effect on any component of the primary outcome or on any secondary outcome: pulmonary function, airway reactivity, asthma control, symptom scores, nocturnal awakening or quality of life. Ambulatory pH monitoring documented reflux in 40% of participants with minimal or no symptoms, and that subgroup did not benefit either. Serious adverse events were fewer on esomeprazole (11 against 17).',
        evidenceSource:
          'Mastronarde JG et al., N Engl J Med 2009;360:1487-1499 (SARA, NCT00069823)',
        doi: '10.1056/NEJMoa0806290',
        measuredMetric:
          'Rate of episodes of poor asthma control over 24 weeks, against matching placebo, with a prespecified pH-monitored subgroup',
        auditFlag: 'verified',
      },
      {
        id: 'eso-a5',
        category: 'conclusion_shift',
        title: 'The chiral switch: launched the year its parent went generic',
        laymanSummary:
          'Esomeprazole reached the United States market in February 2001, the year the omeprazole patent expired. It is one half of omeprazole with its own patent. The strategy has a name in the health-policy literature and this drug is its standard example.',
        technicalDetails:
          'Omeprazole was approved under NDA 019810 in 1989 and its composition-of-matter protection expired in 2001. Esomeprazole magnesium was approved under NDA 021153 on 20 February 2001 as a separately patented product, and became one of the highest-grossing pharmaceuticals in history. The pharmacological difference is genuine but narrow — the S-enantiomer is a poorer CYP2C19 substrate, so exposure per milligram is higher — and the clinical demonstration rests on comparisons at unequal doses. The field’s reading of this drug has shifted accordingly: the pharmacology textbooks describe a modest and real pharmacokinetic advantage, while the health-policy literature uses it as the worked example of enantiomer evergreening. Both descriptions are of the same molecule and neither is wrong.',
        evidenceSource:
          'Drugs@FDA records for NDA 019810 (PRILOSEC, approved 14 September 1989) and NDA 021153 (NEXIUM, approved 20 February 2001)',
        inferredClaim:
          'That a separately patented single enantiomer represented a therapeutic advance proportional to its price — a commercial claim whose clinical support is a set of unequal-dose comparisons',
        auditFlag: 'contested',
      },
      {
        id: 'eso-a6',
        category: 'inferred',
        title: 'The long-term safety evidence for this molecule is borrowed, not its own',
        laymanSummary:
          'The reassuring three-year randomised safety data that this class now has came from a trial of pantoprazole. Esomeprazole has no equivalent. What it does have is AspECT, which followed people for nearly nine years and found study-treatment-related serious adverse events in 1% of participants.',
        technicalDetails:
          'COMPASS randomised 17,598 people to pantoprazole or placebo for a median 3.01 years and found no significant excess of pneumonia, C. difficile, fracture, gastric atrophy, chronic kidney disease, dementia, cancer or death, with enteric infections at 1.4% against 1.0% (OR 1.33, 95% CI 1.01 to 1.75). No comparable placebo-controlled trial of esomeprazole exists. AspECT provides the longest exposure data for this molecule specifically — a median 8.9 years in 2,557 patients — and reports study-treatment-related serious adverse events in 28 participants (1%), but it randomised dose rather than drug against placebo, so it cannot separate drug effects from background rates. Reading the pantoprazole safety result across to esomeprazole is a class inference from shared mechanism.',
        evidenceSource:
          'Moayyedi P et al., Gastroenterology 2019;157:682-691 (COMPASS); Jankowski JAZ et al., Lancet 2018;392:400-408 (AspECT)',
        doi: '10.1053/j.gastro.2019.05.056',
        inferredClaim:
          'That the placebo-controlled safety record established for pantoprazole applies to esomeprazole — a mechanistic inference, not a measurement of this molecule',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One hand of a two-handed molecule',
        laymanDesc:
          'Omeprazole exists as two mirror-image forms in equal amounts. Esomeprazole is one of those two, separated out and sold on its own. Nothing about the target or the chemistry changes.',
        molecularDetail:
          'The stereocentre is the sulfoxide sulfur. Esomeprazole is the S-enantiomer, manufactured by asymmetric oxidation with a titanium-tartrate catalyst rather than by resolving the racemate, and dispensed as the magnesium trihydrate.',
        iconName: 'FlipHorizontal',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Cleared more slowly by a handed enzyme',
        laymanDesc:
          'The liver enzyme that breaks these drugs down is itself asymmetric, so it handles the two mirror images at different speeds. This one is the slower of the two, which means more of it reaches the stomach for a given tablet.',
        molecularDetail:
          'CYP2C19 is a poorer catalyst for the S-enantiomer than for the R-enantiomer, so a larger fraction of the S-form is cleared by CYP3A4 to the sulfone instead. Area under the plasma concentration curve per milligram is correspondingly higher, and the difference widens with repeated dosing. This is the entire pharmacological distinction between the two drugs.',
        iconName: 'Timer',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'Trapped in the acid pocket, exactly as omeprazole is',
        laymanDesc:
          'From the blood it drifts into the acid-secreting channel of the stomach cell, picks up a charge, and can no longer get out. The trapping is identical for both mirror images.',
        molecularDetail:
          'Pyridine pKa near 4; protonation in a compartment at pH 1 gives roughly thousandfold accumulation relative to plasma. Accumulation is a property of the weak base, not of its handedness, and the two enantiomers behave identically here.',
        iconName: 'Lock',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The acid rearranges it, and the handedness disappears',
        laymanDesc:
          'The reactive form the acid produces is the same for both mirror images. Whatever advantage the isolated form had, it ends here — from this point on the two are the same molecule.',
        molecularDetail:
          'Second protonation drives rearrangement to the cyclic sulfenamide. The reacting centre in that species is not a stereocentre, so the activated intermediates from the R- and S-enantiomers are identical. Any difference in effect must therefore be a difference in how much drug arrived, not in what it does.',
        iconName: 'Flame',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'A permanent disulfide bond to the pump',
        laymanDesc:
          'The reactive form welds itself to the pump. That pump is finished, and the cell must build a replacement before it can make acid again.',
        molecularDetail:
          'The sulfenamide forms a disulfide with cysteine 813 on the luminal loop of the H+/K+-ATPase alpha subunit. Inhibition is reversed in vitro by dithiothreitol. Recovery in vivo depends on pump resynthesis with a half-life near 50 hours, which is why a one-to-one-and-a-half-hour plasma half-life produces a multi-day effect.',
        iconName: 'Link',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'What nine years of it bought, and what it did not',
        laymanDesc:
          'In Barrett’s oesophagus, high-dose treatment over nearly nine years delayed cancer, severe dysplasia or death, with 34 people treated per event prevented. In poorly controlled asthma it did nothing at all, including in the people proven by pH testing to have silent reflux.',
        molecularDetail:
          'AspECT gives a time ratio of 1.27 (95% CI 1.01 to 1.58) for high dose against low dose on a composite dominated by all-cause mortality. SARA gives 2.5 against 2.3 episodes of poor asthma control per person-year (P=0.66), with no effect in the 40% of participants with pH-documented reflux. Acid suppression is not a general anti-inflammatory, and the two results together mark where its reach ends.',
        iconName: 'CircleSlash',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Esomeprazole 40 mg against omeprazole 20 mg in erosive oesophagitis',
        phase: 'Phase 3, randomised, double-blind, active-controlled, 163 United States centres',
        sampleSize: 2425,
        primaryEndpoint: 'Proportion of patients with healed erosive oesophagitis at week 8',
        endpointMet: true,
        statisticalPValue:
          '93.7% against 84.2% at 8 weeks, P<0.001 (life-table estimates, intention-to-treat); 81.7% against 68.7% at 4 weeks',
        unreportedAdverseSignals:
          'The comparison is 40 mg against 20 mg. No published trial compares equal milligram doses of the two molecules, so the result cannot distinguish a molecular advantage from a dose difference.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'AspECT (EudraCT 2004-003836-77)',
        phase: 'Randomised, 2 x 2 factorial, unblinded with masked reporting pathologists',
        sampleSize: 2557,
        primaryEndpoint:
          'Time to all-cause mortality, oesophageal adenocarcinoma or high-grade dysplasia over a median 8.9 years',
        endpointMet: true,
        statisticalPValue:
          'High-dose against low-dose PPI: time ratio 1.27 (95% CI 1.01 to 1.58), P=0.038, number needed to treat 34. Combination with aspirin against low-dose PPI alone: TR 1.59 (95% CI 1.14 to 2.23), P=0.0068.',
        unreportedAdverseSignals:
          'Unblinded treatment allocation, and a composite endpoint dominated by all-cause mortality rather than by cancer. Aspirin alone missed significance at P=0.068 and only reached it after censoring NSAID users.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Intravenous esomeprazole after endoscopic haemostasis',
        phase: 'Phase 3, randomised, blinded, placebo-controlled, 91 centres in 16 countries',
        sampleSize: 764,
        primaryEndpoint: 'Clinically significant recurrent bleeding within 72 hours',
        endpointMet: true,
        statisticalPValue:
          '5.9% against 10.3%; difference 4.4 percentage points (95% CI 0.6 to 8.3), P=0.026, sustained at 7 and 30 days (P=0.010)',
        unreportedAdverseSignals:
          'Surgery (2.7% against 5.4%) and all-cause mortality (0.8% against 2.1%) both favoured esomeprazole and neither reached significance. Endoscopic technique was not standardised. Funded by AstraZeneca.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SARA (NCT00069823)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 412,
        primaryEndpoint:
          'Rate of episodes of poor asthma control over 24 weeks in adults with inadequately controlled asthma and minimal or no reflux symptoms',
        endpointMet: false,
        statisticalPValue: '2.5 against 2.3 episodes per person-year, P=0.66',
        unreportedAdverseSignals:
          'The prespecified rescue hypothesis also failed: pH monitoring found reflux in 40% of participants and that subgroup showed no benefit either.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Erosive oesophagitis healed in 93.7% on esomeprazole 40 mg against 84.2% on omeprazole 20 mg at eight weeks in 2,425 randomised patients',
        'Time ratio 1.27 (95% CI 1.01 to 1.58) for death, oesophageal adenocarcinoma or high-grade dysplasia on high-dose against low-dose esomeprazole over a median 8.9 years in 2,557 patients with Barrett’s oesophagus',
        'Recurrent bleeding 5.9% against 10.3% at 72 hours after endoscopic haemostasis in 764 randomised patients (P=0.026)',
        'No effect whatever on poorly controlled asthma: 2.5 against 2.3 episodes per person-year in 412 randomised adults (P=0.66)',
      ],
      unsupportedInferences: [
        'That the S-enantiomer is intrinsically superior to its racemic parent, when the trial that established superiority gave twice the dose',
        'That the placebo-controlled long-term safety record of pantoprazole applies to this molecule, which has no equivalent trial of its own',
        'That treating silent reflux improves asthma control — refuted, including in the pH-documented subgroup',
        'That a composite endpoint dominated by all-cause mortality is a measurement of cancer prevention',
      ],
      whatFailedInitially: [
        'SARA: no effect on any asthma outcome, and no subgroup identified by pH monitoring that benefited',
        'The AspECT aspirin arm missed its endpoint at P=0.068 and only reached significance after censoring NSAID users post hoc',
        'Surgery and mortality both favoured intravenous esomeprazole after endoscopy and neither reached significance',
        'No dose-equivalence trial against omeprazole has ever been published, twenty-five years after launch',
      ],
      realWorldOutcome: [
        'Approved under NDA 021153 on 20 February 2001, the year the omeprazole patent expired, and one of the highest-grossing drugs ever sold',
        'Available without prescription in the United States since 2014 under NDA 204655',
        'The standard worked example of enantiomer evergreening in the health-policy literature',
        'Now generic at about fifteen cents a capsule, roughly twice the acquisition cost of omeprazole',
      ],
    },
    deliverySystem: {
      type: 'Oral delayed-release capsule, delayed-release granules for oral suspension, and intravenous powder for injection (sodium salt)',
      description:
        'All oral forms are enteric-protected, because the free base is destroyed by gastric acid within minutes. The intravenous sodium salt exists specifically for the acute ulcer-bleeding indication, which is where the randomised evidence for this molecule rather than its parent is strongest.',
      safetyProfile:
        'The label carries warnings for acute tubulointerstitial nephritis, Clostridioides difficile-associated diarrhoea, bone fracture with long-term high-dose use, cutaneous and systemic lupus erythematosus, cyanocobalamin deficiency, hypomagnesaemia, and fundic gland polyps with use beyond one year. Commonest adverse events are headache, diarrhoea, nausea, flatulence and abdominal pain. Because it is the more CYP2C19-avid of the two omeprazole enantiomers at the inhibitory step, the clopidogrel interaction statement applies. In AspECT, at a median 8.9 years of exposure, study-treatment-related serious adverse events were reported by 1% of participants.',
    },
    commonQuestions: [
      {
        q: 'Is Nexium actually better than omeprazole?',
        a: 'It is a genuinely different pharmacokinetic object and the evidence that it is a better drug is weaker than the marketing implied. Esomeprazole is one of the two mirror-image halves of omeprazole. The liver enzyme CYP2C19 clears it more slowly than it clears the other half, so blood levels run higher for a given milligram. The trial everyone cites healed 93.7% of erosive oesophagitis against 84.2% for omeprazole in 2,425 patients — but it used 40 mg of esomeprazole against 20 mg of omeprazole. Nobody has published a comparison at equal milligrams. So the honest statement is that more drug heals more oesophagitis, which is not surprising, and that whether the isolated enantiomer is better molecule-for-molecule remains untested.',
        auditNote:
          'A dose-equivalence trial would settle this in one study. Twenty-five years after launch, none has been published.',
      },
      {
        q: 'Why did it come out exactly when omeprazole went generic?',
        a: 'Because that was the point. Omeprazole’s composition-of-matter patent expired in 2001 and esomeprazole was approved in the United States in February of that year as a separately patented product. Isolating a single enantiomer of a drug about to lose protection, patenting it, and moving prescribers across before the generic arrives is a recognised strategy — the health-policy literature calls it a chiral switch or evergreening, and this drug is its standard textbook example. That is a description of the commercial history, not an argument that the molecule does nothing. Both things are true: the pharmacokinetic difference is real, and the timing was not a coincidence.',
      },
      {
        q: 'Does it prevent oesophageal cancer if I have Barrett’s?',
        a: 'AspECT is the best evidence anyone has and it is more equivocal than the headline. It randomised 2,557 people with Barrett’s oesophagus to high-dose or low-dose esomeprazole, with or without aspirin, and followed them for a median of 8.9 years — nearly 20,000 person-years. High dose delayed the composite of all-cause death, oesophageal adenocarcinoma and high-grade dysplasia, with a time ratio of 1.27 and a number needed to treat of 34. The combination with aspirin did better still. But the trial was unblinded, the endpoint was a composite in which all-cause mortality dominates, and the aspirin arm alone missed significance until NSAID users were censored. It is real evidence of benefit on a composite. It is not a clean demonstration that the drug prevents cancer.',
      },
      {
        q: 'My doctor suggested it for a cough or for asthma. Does that work?',
        a: 'For asthma, no, and the trial that tested it was designed carefully enough to be convincing. Four hundred and twelve adults with poorly controlled asthma despite inhaled steroids, and with minimal or no reflux symptoms, took 40 mg of esomeprazole twice daily or placebo for 24 weeks. Episodes of poor asthma control ran at 2.5 per person-year on the drug and 2.3 on placebo. Nothing moved: not lung function, not airway reactivity, not symptom scores, not quality of life. The obvious objection — that only people with real reflux would benefit — was anticipated: pH monitoring found silent reflux in 40% of participants, and that subgroup did not benefit either. The same design in 306 children, using lansoprazole, found the same nothing plus more respiratory infections.',
      },
      {
        q: 'Why does the hospital give the intravenous form after a bleeding ulcer?',
        a: 'Because that specific use has a randomised trial behind it, and it is esomeprazole’s trial rather than the class’s. After a bleeding ulcer has been treated through the endoscope, 764 patients across 16 countries received either a 72-hour high-dose infusion or placebo. Rebleeding within 72 hours was 5.9% against 10.3%, and the difference held at seven and thirty days. Repeat endoscopic treatment fell from 11.6% to 6.4%. Surgery and death both favoured the drug without reaching statistical significance, so the trial establishes a rebleeding benefit and does not establish a survival one. Note that this is the opposite situation from starting a drip before the endoscopy, which six trials found changes what the endoscopist sees and nothing else.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Richter JE, Kahrilas PJ et al. Efficacy and safety of esomeprazole compared with omeprazole in GERD patients with erosive esophagitis: a randomized controlled trial. Am J Gastroenterol 2001;96:656-665',
        identifier: '10.1111/j.1572-0241.2001.03600.x',
        kind: 'doi',
      },
      {
        label:
          'Jankowski JAZ et al. Esomeprazole and aspirin in Barrett’s oesophagus (AspECT): a randomised factorial trial. Lancet 2018;392:400-408',
        identifier: '10.1016/S0140-6736(18)31388-6',
        kind: 'doi',
      },
      {
        label:
          'Sung JJ et al. Intravenous esomeprazole for prevention of recurrent peptic ulcer bleeding: a randomized trial. Ann Intern Med 2009;150:455-464',
        identifier: '10.7326/0003-4819-150-7-200904070-00105',
        kind: 'doi',
      },
      {
        label:
          'Mastronarde JG et al. Efficacy of esomeprazole for treatment of poorly controlled asthma. N Engl J Med 2009;360:1487-1499',
        identifier: '10.1056/NEJMoa0806290',
        kind: 'doi',
      },
      {
        label:
          'Moayyedi P et al. Safety of proton pump inhibitors based on a large, multi-year, randomized trial of patients receiving rivaroxaban or aspirin. Gastroenterology 2019;157:682-691',
        identifier: '10.1053/j.gastro.2019.05.056',
        kind: 'doi',
      },
      {
        label: 'SARA: study of acid reflux in asthma, esomeprazole against placebo',
        identifier: 'NCT00069823',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: NEXIUM (esomeprazole magnesium) delayed-release capsules, NDA 021153, AstraZeneca — original approval 20 February 2001',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021153',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: PRILOSEC (omeprazole), NDA 019810, AstraZeneca — original approval 14 September 1989, for the patent-expiry timeline',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019810',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 9568614 — esomeprazole structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9568614',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Lansoprazole — the proton pump inhibitor with the clearest record of being given to people it
  //    does not help: infants who cried, children who wheezed, and everyone whose ulcer was caused
  //    by a bacterium the drug does not touch.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lansoprazole',
    name: 'Lansoprazole',
    tradeName: 'Prevacid / Prevacid SoluTab / Prevacid 24HR',
    sponsor:
      'Takeda Pharmaceuticals — discovered at Takeda in Japan and approved in the United States under NDA 020406 on 10 May 1995',
    targetGene: 'ATP4A and ATP4B — the catalytic and glycoprotein subunits of the gastric proton pump',
    targetProtein:
      'Gastric H+/K+-ATPase, bound covalently at cysteine 813 and cysteine 321 on the luminal face of the alpha subunit',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1995,
    indication:
      'Short-term treatment of active duodenal ulcer and maintenance of healed duodenal ulcer; eradication of Helicobacter pylori in combination with amoxicillin and clarithromycin to reduce duodenal ulcer recurrence; short-term treatment of active benign gastric ulcer; healing and risk reduction of NSAID-associated gastric ulcer; symptomatic gastroesophageal reflux disease and erosive esophagitis in adults and children aged 1 year and older; and pathological hypersecretory conditions including Zollinger-Ellison syndrome',
    patientFriendlyIndication:
      'Stomach and duodenal ulcers, reflux that has damaged the gullet, and prevention of ulcers caused by anti-inflammatory painkillers',
    anatomicalSite:
      'Gastric parietal cell — the secretory canaliculus, reached through the bloodstream after enteric-coated release in the small intestine',
    conditionContext: {
      conditionExplainer:
        'Most duodenal ulcers are not caused by too much acid. They are caused by Helicobacter pylori, a bacterium that colonises the stomach lining, or by anti-inflammatory drugs that strip away the mucus layer protecting it. Acid is what turns the damage into an ulcer, which is why suppressing it heals the ulcer — and why the ulcer comes back if the cause is still there.',
      whyItMatters:
        'Lansoprazole was the drug used in the trial that made the distinction unmissable: given on its own for two weeks it eradicated the bacterium in 2% of patients and the ulcer came back within six months in 69% of them. Combined with two antibiotics it eradicated in 94% and recurrence fell to 7%.',
      whoTakesThis:
        'Adults and children from age 1 upwards with reflux or ulcer disease, and — through the over-the-counter version approved in 2009 — a large number of adults treating heartburn without a diagnosis.',
      clinicalGoals:
        'The registered endpoints are ulcer healing and erosive oesophagitis healing seen at endoscopy, and Helicobacter pylori eradication confirmed by testing. The uses that failed — infant reflux symptoms and childhood asthma control — were tested against symptom endpoints and are audited below.',
    },
    oneSentenceVerdict:
      'A proton pump inhibitor that the stomach’s own acid converts into a molecule that welds itself shut onto the acid pump, and the one whose trials show most clearly what acid suppression cannot do: on its own it eradicated Helicobacter pylori in 2% of 53 patients and 69% of them had a recurrent ulcer within six months, while adding two antibiotics took eradication to 94% and recurrence to 7% — and in 162 crying infants and 306 wheezing children it performed identically to placebo while causing more respiratory infections in both.',
    laymanHowItWorks:
      'Lansoprazole is swallowed inside granules that survive stomach acid, are absorbed from the small intestine, and travel round in the blood. It has no effect anywhere in the body until it drifts into the acid-secreting channel of a stomach cell, which is the only place acidic enough to activate it. There the acid rearranges it into a reactive form that bonds permanently to the pump making the acid, so that pump never works again and the cell must build a new one. It suppresses acid extremely well and it does nothing at all to a bacterium or to a painkiller, which is why an ulcer with either of those causes heals and then returns.',
    auditConfidence: 'High Confidence',
    confidenceScore: 79,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.4283 per delayed-release capsule at United States pharmacy acquisition cost (CMS NADAC, median across 83 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Prevacid went generic in the United States in 2009 and the over-the-counter version launched the same year. Takeda’s follow-on was dexlansoprazole, the single R-enantiomer in a dual delayed-release formulation, approved in 2009 as a separately patented product — the same chiral-switch pattern AstraZeneca had used with esomeprazole eight years earlier. Lansoprazole remains, at forty-three cents a capsule, the most expensive of the four proton pump inhibitors in this file at pharmacy acquisition cost.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Every proton pump inhibitor in this file acts on the same pump by the same covalent chemistry, and no head-to-head trial has shown one changing a patient outcome the others do not. On price, lansoprazole is the outlier: it costs pharmacies roughly ten times what pantoprazole does per unit. Where lansoprazole has something specific is the paediatric formulation and the American triple-therapy licence. Below the class, misoprostol beat it outright at preventing anti-inflammatory ulcers, which is the honest comparison and the one least often made.',
      conventionalRx: [
        {
          name: 'Pantoprazole (Protonix)',
          class: 'Proton pump inhibitor, substituted benzimidazole',
          howItCompares:
            'Same pump, same chemistry, least CYP2C19-dependent of the four, and the only one with a three-year placebo-controlled safety trial in 17,598 people. It costs about a tenth as much per unit at pharmacy acquisition cost.',
          typicalCost:
            'US$0.0428 per delayed-release tablet at United States pharmacy acquisition cost (CMS NADAC, median across 81 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheapest, fewest interactions, best long-term randomised safety data. Cons: no paediatric orally disintegrating formulation of the kind lansoprazole has.',
        },
        {
          name: 'Misoprostol (Cytotec)',
          class: 'Synthetic prostaglandin E1 analogue',
          howItCompares:
            'The head-to-head comparison most people never see. In 537 Helicobacter-negative long-term NSAID users with a history of gastric ulcer, 12 weeks left 93% of the misoprostol group ulcer-free against 80% and 82% on lansoprazole 15 mg and 30 mg, and 51% on placebo. Misoprostol replaces the prostaglandin the anti-inflammatory drug removed; the proton pump inhibitor works around the problem instead.',
          typicalCost:
            'No NADAC value is held on this record for misoprostol and none is asserted here',
          prosAndCons:
            'Pros: the only agent that restores the defence NSAIDs destroy, and the best result in the head-to-head. Cons: diarrhoea and cramping caused significantly more treatment-related adverse events and early withdrawal; it is an abortifacient and cannot be used in pregnancy. Counting withdrawals as failures, the two strategies came out level at 69%.',
        },
        {
          name: 'Famotidine (Pepcid, Pepcid AC)',
          class: 'Histamine H2-receptor antagonist',
          howItCompares:
            'Blocks one stimulatory receptor instead of destroying the pump, and heals about half as much erosive oesophagitis — 51.9% against 83.6% pooled across 43 randomised trials. It works within the hour and loses effect within days of continuous use.',
          typicalCost:
            'US$0.0494 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 139 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: fast, very cheap, minimal drug interactions. Cons: weaker healing, and tachyphylaxis with continuous dosing.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask whether the ulcer has a cause that acid suppression does not address',
          action:
            'Establish whether Helicobacter pylori has been tested for, and whether an anti-inflammatory drug is still being taken.',
          patientImpact:
            'In the trial that licensed lansoprazole triple therapy, two weeks of lansoprazole alone eradicated the bacterium in 1 of 53 patients and 69% of that group had a recurrent ulcer within six months. Adding two antibiotics took eradication to 94% and recurrence to 7%.',
          clinicalPrecaution:
            'Taking a proton pump inhibitor makes breath and stool tests for the bacterium read falsely negative, so the order of testing matters. That is a diagnostic point, not a dosing instruction.',
        },
        {
          name: 'For an unsettled infant, ask what the placebo arm did',
          action:
            'Before accepting a reflux diagnosis for infant crying, ask about the randomised evidence.',
          patientImpact:
            'In 162 infants aged 1 to 12 months with persisting symptoms attributed to reflux, 54% responded on lansoprazole and 54% responded on placebo — identical. Serious adverse events, mostly lower respiratory tract infections, occurred in 10 infants on the drug against 2 on placebo (P=0.032).',
          clinicalPrecaution:
            'Infant crying has many causes and some are serious. This is a reason to ask what is being treated and why, not a reason to withhold assessment.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C=CN=C1CS(=O)C2=NC3=CC=CC=C3N2)OCC(F)(F)F',
      chemicalFormula: 'C16H14F3N3O2S',
      molecularWeight: '369.40 g/mol',
      targetReceptorAffinity:
        'No reversible affinity constant applies, because inhibition is covalent. The trifluoroethoxy substituent on the pyridine gives this molecule the highest lipophilicity of the four in this file, which is reflected in its logP of about 3.7 and in the rapidity with which it accumulates in the canaliculus. Recovery of acid secretion requires new pump protein.',
      structureSource: {
        label:
          'PubChem CID 3883 (lansoprazole) — canonical SMILES, molecular formula and molecular weight, as ingested onto this record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3883',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lan-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the trifluoroethoxy pyridine and the unsubstituted benzimidazole',
          description:
            'Confirm both fragments. Unlike omeprazole and pantoprazole, the benzimidazole here carries no methoxy substituent, and the pyridine carries a trifluoroethoxy group instead. Fluorine NMR distinguishes this molecule from every other member of the class in a single spectrum.',
          reagentsAndBuffer:
            '2-mercaptobenzimidazole and 2-chloromethyl-3-methyl-4-(2,2,2-trifluoroethoxy)pyridine reference standards, 19F and 1H NMR in DMSO-d6, buffered HPLC at pH 7.4 or above, Karl Fischer titration',
        },
        {
          id: 'lan-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Thioether coupling and single-step oxidation to the racemic sulfoxide',
          description:
            'Couple the fragments to the sulfide, then oxidise exactly one step to the sulfoxide. Lansoprazole is sold as the racemate; the single R-enantiomer is dexlansoprazole and is a separate product with a separate application, so an asymmetric oxidation here would be making a different drug.',
          dependsOnStepId: 'lan-w1',
          reagentsAndBuffer:
            'Sodium hydroxide in methanol for the coupling; meta-chloroperoxybenzoic acid or sodium hypochlorite for the oxidation, run cold, with in-process HPLC monitoring for sulfone breakthrough',
        },
        {
          id: 'lan-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation under base and enteric encapsulation',
          description:
            'Crystallise with the mother liquor held alkaline, then coat the granules for release above pH 5.5. The orally disintegrating tablet is a distinct formulation problem: it has to fall apart in the mouth while leaving the enteric coat on each individual granule intact, which is why the tablet contains coated microgranules rather than coated tablet cores.',
          dependsOnStepId: 'lan-w2',
          reagentsAndBuffer:
            'Crystallisation from acetone or ethanol with aqueous ammonia or triethylamine to hold pH above 9, methacrylic acid copolymer enteric coating on microgranules, HPLC against a sulfone reference standard',
        },
        {
          id: 'lan-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Acid-dependent trapping and activation in isolated gastric vesicles',
          description:
            'Load hog gastric microsomal vesicles, generate an interior acid load with ATP, and confirm accumulation and inhibition. The parallel run on vesicles held at neutral pH is the control that proves the selectivity is chemical rather than an artefact of the preparation.',
          dependsOnStepId: 'lan-w3',
          reagentsAndBuffer:
            'Hog gastric H+/K+-ATPase microsomal vesicles, ATP and magnesium, nigericin and valinomycin as gradient-collapsing controls, LC-MS/MS quantification of vesicle-associated drug',
        },
        {
          id: 'lan-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'ATPase inhibition, reducing-agent reversal, and a Helicobacter counter-screen',
          description:
            'Measure loss of potassium-stimulated ATPase activity and confirm reversal by a reducing agent. Then run the compound against Helicobacter pylori in culture. The point of the counter-screen is negative: whatever weak activity appears in a dish, the clinical trial showed 2% eradication with the drug alone, and an in vitro antibacterial reading is not an eradication rate.',
          dependsOnStepId: 'lan-w4',
          reagentsAndBuffer:
            'Potassium-stimulated ATPase assay with colorimetric phosphate readout, dithiothreitol reversal arm, sodium-potassium ATPase counter-screen, Helicobacter pylori microdilution in Brucella broth with 5% fetal bovine serum under microaerophilic conditions',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lan-a1',
        category: 'measured',
        title:
          'On its own it eradicated the bacterium in 1 of 53 patients, and 69% had a recurrent ulcer',
        laymanSummary:
          'The clearest demonstration anywhere that acid suppression treats the symptom and not the cause. Two weeks of lansoprazole alone cleared Helicobacter pylori in one patient out of fifty-three, and seven in ten of that group had an ulcer again within six months. Two weeks of lansoprazole with two antibiotics cleared it in 94% and only 7% relapsed.',
        technicalDetails:
          'A double-blind, multicentre United States study randomised 396 patients with active or recent duodenal ulcer and Helicobacter pylori infection to one of six 14-day regimens, with 352 meeting entry criteria. At 4 to 6 weeks after the end of therapy, eradication was 94% (44 of 47) with lansoprazole, clarithromycin and amoxicillin; 77% with lansoprazole and amoxicillin three times daily; 75% with lansoprazole twice daily and clarithromycin three times daily; 57% and 53% with the twice-daily dual regimens; and 2% (1 of 53) with lansoprazole monotherapy. All comparisons P<=0.05. Among patients ulcer-free at 4 to 6 weeks, ulcers recurred within six months in 7% on triple therapy, 13 to 23% on dual therapy and 69% on lansoprazole alone. Patients Helicobacter-negative at 4 to 6 weeks relapsed in 11% of cases against 47% of those still positive.',
        evidenceSource: 'Schwartz H et al., Am J Gastroenterol 1998;93:584-590',
        doi: '10.1111/j.1572-0241.1998.169_b.x',
        measuredMetric:
          'Helicobacter pylori eradication at 4 to 6 weeks and duodenal ulcer recurrence at six months, across six randomised regimens',
        auditFlag: 'verified',
      },
      {
        id: 'lan-a2',
        category: 'failed',
        title:
          'In crying infants it matched placebo exactly, and caused five times as many serious adverse events',
        laymanSummary:
          'One hundred and sixty-two infants with persistent crying attributed to reflux were given lansoprazole or placebo for four weeks. Fifty-four per cent responded in each group — the same number, forty-four infants out of eighty-one, on both sides. Ten infants on the drug had a serious adverse event, mostly chest infections, against two on placebo.',
        technicalDetails:
          'A multicentre, double-blind, parallel-group study randomised 162 infants aged 1 to 12 months whose symptoms attributed to gastro-oesophageal reflux disease had persisted despite at least a week of non-pharmacological management. The primary efficacy definition was a 50% or greater reduction in measures of feeding-related crying. Responders were 44 of 81 (54%) in each group — identical. No significant difference was detected in any secondary measure or analysis. Treatment-emergent adverse events occurred in 62% on lansoprazole against 46% on placebo (P=0.058). Serious adverse events, particularly lower respiratory tract infections, occurred in 12 infants and were significantly more frequent on lansoprazole, 10 against 2 (P=0.032).',
        evidenceSource: 'Orenstein SR et al., J Pediatr 2009;154:514-520',
        doi: '10.1016/j.jpeds.2008.09.054',
        measuredMetric:
          'Proportion of infants with a 50% or greater reduction in feeding-related crying over four weeks, against matching placebo',
        auditFlag: 'caution',
      },
      {
        id: 'lan-a3',
        category: 'failed',
        title:
          'In 306 children with poorly controlled asthma it changed nothing and caused more infections',
        laymanSummary:
          'Silent reflux is common in children with asthma and treating it was expected to help. Three hundred and six children on inhaled steroids took lansoprazole or placebo for 24 weeks. Asthma control did not improve, lung function did not improve, quality of life did not improve, and the children on the drug caught more respiratory infections.',
        technicalDetails:
          'The Study of Acid Reflux in Children with Asthma randomised 306 children with poor asthma control despite inhaled corticosteroid treatment and without overt reflux symptoms, at 19 United States academic centres, to lansoprazole (15 mg daily under 30 kg, 30 mg at or above 30 kg; n=149) or placebo (n=157) for 24 weeks. Mean age was 11. The mean difference in change in Asthma Control Questionnaire score was 0.2 units (95% CI 0.0 to 0.3), against a 0.5-unit threshold for clinical meaning. No significant differences appeared in FEV1 (0.0 L, 95% CI -0.1 to 0.1), asthma-related quality of life (-0.1, 95% CI -0.3 to 0.1) or episodes of poor asthma control (relative risk 1.2, 95% CI 0.9 to 1.5). Among 115 children with oesophageal pH studies, 43% had reflux, and that subgroup showed no treatment effect on any asthma outcome. Children on lansoprazole reported more respiratory infections (relative risk 1.3, 95% CI 1.1 to 1.6).',
        evidenceSource: 'Holbrook JT et al., JAMA 2012;307:373-381 (SARA, NCT00442013)',
        doi: '10.1001/jama.2011.2035',
        measuredMetric:
          'Change in Asthma Control Questionnaire score over 24 weeks, against matching placebo, with a prespecified pH-monitored subgroup',
        auditFlag: 'verified',
      },
      {
        id: 'lan-a4',
        category: 'failed',
        title: 'It lost the head-to-head against misoprostol for preventing NSAID ulcers',
        laymanSummary:
          'Proton pump inhibitors are the standard way to protect the stomach from anti-inflammatory painkillers. In the trial that compared them directly, misoprostol left 93% of patients ulcer-free at twelve weeks against 80 to 82% on lansoprazole. Misoprostol also caused far more side effects, and once early withdrawals were counted as failures the two strategies came out level.',
        technicalDetails:
          'A prospective, double-blind, multicentre, active- and placebo-controlled study enrolled 537 Helicobacter pylori-negative long-term NSAID users with a history of endoscopically documented gastric ulcer, randomising to placebo, misoprostol 200 micrograms four times daily, or lansoprazole 15 mg or 30 mg once daily for 12 weeks, with endoscopy at 4, 8 and 12 weeks. Gastric ulcer-free proportions at week 12 were 51% on placebo (95% CI 41.1 to 61.3), 93% on misoprostol (87.2 to 97.9), 80% on lansoprazole 15 mg (72.5 to 87.3) and 82% on lansoprazole 30 mg (75.0 to 89.6). Both lansoprazole arms beat placebo (P<0.001) and both were beaten by misoprostol. Significantly more misoprostol patients reported treatment-related adverse events and withdrew early; treating withdrawals as failures gave 69% success for each active treatment against 35% for placebo.',
        evidenceSource: 'Graham DY et al., Arch Intern Med 2002;162:169-175',
        doi: '10.1001/archinte.162.2.169',
        measuredMetric:
          'Proportion free of endoscopic gastric ulcer at 12 weeks, against placebo and against misoprostol',
        auditFlag: 'verified',
      },
      {
        id: 'lan-a5',
        category: 'conclusion_shift',
        title:
          'Paediatric reflux treatment reversed direction once anyone ran a placebo arm',
        laymanSummary:
          'Prescribing of acid suppressants to infants rose sharply through the 2000s on the reasoning that unexplained crying and back-arching were reflux. Two placebo-controlled trials, one in infants and one in children with asthma, found no benefit and more infections in both. The guidelines that followed reversed the recommendation.',
        technicalDetails:
          'Two randomised, placebo-controlled trials of this molecule in children were published within three years. In 162 infants, response was 54% in both arms and serious adverse events, chiefly lower respiratory tract infections, were 10 against 2 (P=0.032). In 306 children with poorly controlled asthma, the Asthma Control Questionnaire difference was 0.2 units against a 0.5-unit threshold for clinical meaning, with a relative risk of 1.3 (95% CI 1.1 to 1.6) for respiratory infections on the drug. The infection signal is mechanistically coherent: gastric acid is a barrier to swallowed and aspirated organisms, and removing it in a small airway-prone child is not neutral. The field moved from treating infant irritability as reflux to reserving acid suppression for objectively documented disease, and both trials are cited in the guidelines that made that shift.',
        evidenceSource:
          'Orenstein SR et al., J Pediatr 2009;154:514-520; Holbrook JT et al., JAMA 2012;307:373-381',
        doi: '10.1016/j.jpeds.2008.09.054',
        inferredClaim:
          'That infant crying and childhood asthma symptoms are caused by acid reflux and respond to acid suppression — an inference from prevalence and plausibility that two placebo-controlled trials refuted',
        auditFlag: 'verified',
      },
      {
        id: 'lan-a6',
        category: 'inferred',
        title: 'The long-term safety data for this class is not lansoprazole’s',
        laymanSummary:
          'The three-year randomised safety evidence that reassures people about proton pump inhibitors came from a trial of pantoprazole. Lansoprazole has no equivalent, and the one signal it has generated in its own randomised trials — more respiratory infections in children — points the same way as the gut-infection excess that trial did find.',
        technicalDetails:
          'COMPASS randomised 17,598 adults to pantoprazole or placebo for a median of 3.01 years and found no significant excess of pneumonia, C. difficile, fracture, gastric atrophy, chronic kidney disease, dementia, cancer or death, with enteric infections at 1.4% against 1.0% (odds ratio 1.33, 95% CI 1.01 to 1.75). No placebo-controlled trial of comparable size exists for lansoprazole in adults. The paediatric trials of lansoprazole are the class’s only placebo-controlled randomised infection signals: relative risk 1.3 (95% CI 1.1 to 1.6) for respiratory infections in 306 children, and 10 against 2 serious adverse events dominated by lower respiratory tract infection in 162 infants. Reading the adult safety reassurance across to this molecule, and to children, is an inference in both directions.',
        evidenceSource:
          'Moayyedi P et al., Gastroenterology 2019;157:682-691 (COMPASS); Holbrook JT et al., JAMA 2012;307:373-381; Orenstein SR et al., J Pediatr 2009;154:514-520',
        doi: '10.1053/j.gastro.2019.05.056',
        inferredClaim:
          'That the placebo-controlled adult safety record of pantoprazole describes lansoprazole, and describes children — two separate extrapolations, one of which the paediatric trials contradict',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Coated granules that survive the stomach',
        laymanDesc:
          'The drug is destroyed by stomach acid, so it travels inside granules with an acid-proof shell. The orally disintegrating tablet melts on the tongue, but each granule inside it keeps its shell intact.',
        molecularDetail:
          'Enteric-coated microgranules release above pH 5.5 in the duodenum. Oral bioavailability is above 80%, and food substantially reduces absorption. Plasma half-life is about 1.5 hours, far shorter than the duration of effect.',
        iconName: 'Package',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorbed and circulated, still inert',
        laymanDesc:
          'It enters the blood from the small intestine and reaches every tissue in the body, where it does nothing at all. It has no receptor and no target it recognises.',
        molecularDetail:
          'Circulating lansoprazole is a neutral weak base, about 97% protein bound, with no meaningful reversible affinity. It is the most lipophilic of the four in this file, with a logP near 3.7, which speeds diffusion into the canaliculus but does not give it a target anywhere else.',
        iconName: 'Droplets',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'Trapped where the pH falls below 2',
        laymanDesc:
          'It diffuses into the acid-secreting channel of the stomach cell, picks up a proton, and becomes electrically charged. A charged molecule cannot cross back out through the membrane.',
        molecularDetail:
          'Pyridine pKa near 4. Protonation in a compartment at pH 1 gives roughly thousandfold accumulation relative to plasma, achieved without any transporter. No other compartment in the body is acidic enough to trap it in this way.',
        iconName: 'Lock',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Acid converts it into a thiol trap',
        laymanDesc:
          'A second proton triggers a rearrangement into a highly reactive form that grabs the first sulfur atom it meets. That form survives for a fraction of a second, so it cannot leak out and react anywhere else.',
        molecularDetail:
          'Rearrangement gives a tetracyclic cyclic sulfenamide, a short-lived electrophile with high affinity for accessible cysteine thiols. Its half-life at canalicular pH is measured in seconds, which is the structural basis of the drug’s tissue selectivity.',
        iconName: 'Flame',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'Welded to the pump at two cysteines',
        laymanDesc:
          'It bonds permanently to the pump. That pump is finished, and acid production only recovers when the cell has built replacements, which takes days.',
        molecularDetail:
          'The sulfenamide forms disulfides with cysteine 813 and, for this molecule, also cysteine 321 on the luminal face of the H+/K+-ATPase alpha subunit. Inhibition is reversed in vitro by dithiothreitol. Recovery in vivo depends on pump resynthesis with a half-life near 50 hours.',
        iconName: 'Link',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'What the mechanism cannot reach',
        laymanDesc:
          'It has no effect on the bacterium that causes most duodenal ulcers, no effect on the prostaglandin that painkillers strip away, and no effect on asthma or on a crying baby. Every one of those was tested and every one came back negative.',
        molecularDetail:
          'Two weeks of monotherapy eradicated Helicobacter pylori in 1 of 53 patients, with 69% ulcer recurrence at six months. Misoprostol, which replaces the missing prostaglandin, left 93% of NSAID users ulcer-free against 80 to 82% for lansoprazole. In asthma the Asthma Control Questionnaire difference was 0.2 units against a 0.5-unit threshold, and in infants the response rate was identical to placebo at 54%.',
        iconName: 'CircleSlash',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Lansoprazole triple against dual therapy and monotherapy for Helicobacter pylori',
        phase: 'Phase 3, randomised, double-blind, multicentre, six-arm',
        sampleSize: 352,
        primaryEndpoint:
          'Eradication of Helicobacter pylori at 4 to 6 weeks after therapy, and duodenal ulcer recurrence at six months',
        endpointMet: true,
        statisticalPValue:
          'Eradication 94% (44 of 47) on triple therapy against 2% (1 of 53) on lansoprazole alone, P<=0.05 for triple against each dual and each dual against monotherapy. Ulcer recurrence at six months 7% against 69%.',
        unreportedAdverseSignals:
          'The monotherapy arm is the interpretable result and it is rarely quoted: acid suppression alone did not clear the organism and the ulcer came back in more than two thirds of patients.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Lansoprazole in infants with symptoms attributed to reflux',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, multicentre',
        sampleSize: 162,
        primaryEndpoint:
          'Proportion of infants with a 50% or greater reduction in feeding-related crying over four weeks',
        endpointMet: false,
        statisticalPValue: '44 of 81 (54%) responders in each group — identical',
        unreportedAdverseSignals:
          'Serious adverse events, particularly lower respiratory tract infections, occurred in 10 infants on lansoprazole against 2 on placebo (P=0.032). Treatment-emergent adverse events were 62% against 46% (P=0.058).',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SARA in children (NCT00442013)',
        phase: 'Phase 4, randomised, masked, placebo-controlled, 19 academic centres',
        sampleSize: 306,
        primaryEndpoint:
          'Change in Asthma Control Questionnaire score over 24 weeks in children with poor asthma control on inhaled corticosteroids and without overt reflux symptoms',
        endpointMet: false,
        statisticalPValue:
          'Mean difference in change 0.2 units (95% CI 0.0 to 0.3), against a 0.5-unit threshold for clinical meaning',
        unreportedAdverseSignals:
          'Respiratory infections were more common on lansoprazole (relative risk 1.3, 95% CI 1.1 to 1.6). The pH-documented reflux subgroup, 43% of the 115 tested, showed no benefit either.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Lansoprazole against misoprostol for NSAID ulcer prevention',
        phase: 'Phase 3, randomised, double-blind, active- and placebo-controlled',
        sampleSize: 537,
        primaryEndpoint:
          'Proportion free of endoscopic gastric ulcer at 12 weeks in Helicobacter-negative long-term NSAID users with prior gastric ulcer',
        endpointMet: true,
        statisticalPValue:
          'Placebo 51% (95% CI 41.1 to 61.3), misoprostol 93% (87.2 to 97.9), lansoprazole 15 mg 80% (72.5 to 87.3), lansoprazole 30 mg 82% (75.0 to 89.6); both lansoprazole arms beat placebo at P<0.001',
        unreportedAdverseSignals:
          'Misoprostol beat lansoprazole on the endoscopic endpoint and lost on tolerability. Counting early withdrawals as failures, both active strategies came out at 69% against 35% for placebo — a reframing that changes the conclusion.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Helicobacter pylori eradication 94% on lansoprazole with clarithromycin and amoxicillin against 2% on lansoprazole alone, with six-month ulcer recurrence 7% against 69%',
        'Identical 54% response rate on lansoprazole and on placebo in 162 infants, with 10 against 2 serious adverse events dominated by lower respiratory tract infection',
        'Asthma Control Questionnaire difference of 0.2 units against a 0.5-unit clinical threshold in 306 randomised children, with relative risk 1.3 for respiratory infection',
        'Gastric ulcer-free at 12 weeks: 93% on misoprostol, 80 to 82% on lansoprazole, 51% on placebo, in 537 randomised NSAID users',
      ],
      unsupportedInferences: [
        'That infant crying attributed to reflux responds to acid suppression, refuted by an exactly identical placebo response rate',
        'That treating silent reflux improves childhood asthma control, refuted including in the pH-documented subgroup',
        'That a proton pump inhibitor is the best available protection against NSAID ulcers, when the head-to-head comparator beat it on the endoscopic endpoint',
        'That the adult placebo-controlled safety record of pantoprazole describes this molecule, or describes children',
      ],
      whatFailedInitially: [
        'Lansoprazole monotherapy for Helicobacter pylori: 1 eradication in 53 patients, and 69% ulcer recurrence within six months',
        'Infant reflux: no separation from placebo on any measure, and five times as many serious adverse events',
        'Childhood asthma: nothing moved, and respiratory infections rose',
        'Misoprostol outperformed it on the endoscopic ulcer endpoint it was licensed for',
      ],
      realWorldOutcome: [
        'Approved under NDA 020406 on 10 May 1995, and the first proton pump inhibitor licensed in the United States as part of a Helicobacter pylori triple therapy',
        'Available without prescription in the United States since 2009, the same year the brand went generic',
        'The paediatric trials became the evidence base for reversing routine acid suppression in infants',
        'Takeda’s follow-on, dexlansoprazole, repeated the chiral-switch pattern esomeprazole had established eight years earlier',
      ],
    },
    deliverySystem: {
      type: 'Oral delayed-release capsule, orally disintegrating tablet containing enteric-coated microgranules, and delayed-release oral suspension',
      description:
        'Every form protects the drug from gastric acid, because the free base is destroyed by it within minutes. The orally disintegrating tablet exists so the drug can be given to small children and to people who cannot swallow capsules, without breaking the enteric coat — the tablet disperses while each microgranule inside it stays sealed.',
      safetyProfile:
        'The label carries warnings for acute tubulointerstitial nephritis, Clostridioides difficile-associated diarrhoea, bone fracture with long-term high-dose use, cutaneous and systemic lupus erythematosus, cyanocobalamin deficiency, hypomagnesaemia, and fundic gland polyps with use beyond one year. Commonest trial adverse events are diarrhoea, abdominal pain, nausea and headache. The two placebo-controlled paediatric trials of this molecule both reported an excess of respiratory infection: relative risk 1.3 (95% CI 1.1 to 1.6) in 306 children, and serious adverse events dominated by lower respiratory tract infection in 10 of 81 infants against 2 of 81 (P=0.032).',
    },
    commonQuestions: [
      {
        q: 'If it heals my ulcer, why does the ulcer come back?',
        a: 'Because acid is what makes an ulcer hurt and bleed, and it is usually not what caused it. Most duodenal ulcers are caused by Helicobacter pylori, and the rest mostly by anti-inflammatory drugs. The trial that licensed this drug for triple therapy makes the point better than any explanation: two weeks of lansoprazole alone cleared the bacterium in one patient out of fifty-three, and within six months 69% of that group had an ulcer again. Two weeks of the same drug with clarithromycin and amoxicillin cleared it in 94%, and 7% relapsed. Suppressing acid heals the crater. Removing the cause is what keeps it closed.',
      },
      {
        q: 'My baby was prescribed this for reflux and crying. Does it work?',
        a: 'The randomised answer is no, and it is unusually clear-cut. One hundred and sixty-two infants aged 1 to 12 months, whose symptoms had already persisted through at least a week of feeding and positioning changes, were randomly given lansoprazole or placebo for four weeks. Exactly 44 of 81 responded in each group — 54% on both sides, an identical number. Nothing separated on any secondary measure either. What did separate was harm: serious adverse events, mostly chest infections, occurred in ten infants on the drug and two on placebo. That is a reason to ask what is being treated and why, and it is a question for the paediatrician rather than something to act on alone.',
        auditNote:
          'Fifty-four per cent of infants improved on placebo over four weeks, which is the more useful number in the trial: most infant crying settles by itself.',
      },
      {
        q: 'Would treating reflux help my child’s asthma?',
        a: 'It was a reasonable hypothesis and it was tested properly. Three hundred and six children with poorly controlled asthma despite inhaled steroids, and without obvious reflux symptoms, took lansoprazole or placebo for 24 weeks. The difference in asthma control was 0.2 units on a scale where 0.5 is the smallest change anyone can feel. Lung function, quality of life and episodes of poor control were all unchanged. The obvious objection was anticipated: 115 children had oesophageal pH studies, 43% of them had reflux, and that subgroup did not benefit either. Children on the drug reported more respiratory infections. The adult version of the same trial, using esomeprazole in 412 people, found the same nothing.',
      },
      {
        q: 'Is a proton pump inhibitor the best way to protect my stomach from anti-inflammatories?',
        a: 'It is the most used and it was not the best in the one trial that compared the options directly. Five hundred and thirty-seven long-term NSAID users with a previous gastric ulcer took placebo, misoprostol, or lansoprazole at one of two strengths for twelve weeks with repeated endoscopy. Ulcer-free at twelve weeks: 51% on placebo, 80 and 82% on lansoprazole, 93% on misoprostol. Misoprostol works by replacing the prostaglandin the anti-inflammatory drug destroys, which is the actual mechanism of the injury. The catch is that it caused significantly more side effects and early withdrawals, and once withdrawals were counted as failures both active strategies landed at 69%. So the honest summary is that misoprostol is more effective and harder to take.',
        auditNote:
          'Separately, CONDOR found that adding a proton pump inhibitor to an anti-inflammatory produced 4.3 times the whole-gut event rate of a coxib alone, because the drug protects only the acid-secreting part of the gut.',
      },
      {
        q: 'Why is this one so much more expensive than the others?',
        a: 'There is no clinical reason on the record. At United States pharmacy acquisition cost the lansoprazole capsule runs about forty-three cents against four cents for pantoprazole, eight for omeprazole and fifteen for esomeprazole — all four generic, all four acting on the same pump by the same covalent chemistry, and no head-to-head trial showing any of them changing an outcome the others do not. The delayed-release and orally disintegrating formulations are genuinely more complex to make than a plain enteric-coated tablet, which accounts for some of it. Whether it accounts for a tenfold difference is not something the published record answers.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Schwartz H et al. Triple versus dual therapy for eradicating Helicobacter pylori and preventing ulcer recurrence: a randomized, double-blind, multicenter study of lansoprazole, clarithromycin, and/or amoxicillin. Am J Gastroenterol 1998;93:584-590',
        identifier: '10.1111/j.1572-0241.1998.169_b.x',
        kind: 'doi',
      },
      {
        label:
          'Orenstein SR et al. Multicenter, double-blind, randomized, placebo-controlled trial assessing the efficacy and safety of lansoprazole in infants with symptoms of gastroesophageal reflux disease. J Pediatr 2009;154:514-520',
        identifier: '10.1016/j.jpeds.2008.09.054',
        kind: 'doi',
      },
      {
        label:
          'Holbrook JT et al. Lansoprazole for children with poorly controlled asthma: a randomized controlled trial. JAMA 2012;307:373-381',
        identifier: '10.1001/jama.2011.2035',
        kind: 'doi',
      },
      {
        label:
          'Graham DY et al. Ulcer prevention in long-term users of nonsteroidal anti-inflammatory drugs: a double-blind, randomized, multicenter, active- and placebo-controlled study of misoprostol vs lansoprazole. Arch Intern Med 2002;162:169-175',
        identifier: '10.1001/archinte.162.2.169',
        kind: 'doi',
      },
      {
        label:
          'Moayyedi P et al. Safety of proton pump inhibitors based on a large, multi-year, randomized trial of patients receiving rivaroxaban or aspirin. Gastroenterology 2019;157:682-691',
        identifier: '10.1053/j.gastro.2019.05.056',
        kind: 'doi',
      },
      {
        label: 'SARA: lansoprazole to treat children with asthma',
        identifier: 'NCT00442013',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: PREVACID (lansoprazole) delayed-release capsules, NDA 020406, Takeda Pharmaceuticals USA — original approval 10 May 1995',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020406',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3883 — lansoprazole structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3883',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Famotidine — the weaker drug that outlived its whole class, inherited the market when
  //    ranitidine was withdrawn for a contaminant, and was then asked to treat a pandemic.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'famotidine',
    name: 'Famotidine',
    tradeName: 'Pepcid / Pepcid AC',
    sponsor:
      'Bausch Health (current US label holder for the prescription product) — discovered at Yamanouchi in Japan, developed and marketed in the United States by Merck, approved under NDA 019462 on 15 October 1986',
    targetGene: 'HRH2 — the gene encoding the histamine H2 receptor',
    targetProtein:
      'Histamine H2 receptor on the basolateral membrane of the gastric parietal cell, a Gs-coupled seven-transmembrane receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1986,
    indication:
      'Active duodenal ulcer and maintenance of healed duodenal ulcer; active benign gastric ulcer; gastroesophageal reflux disease including erosive esophagitis; and pathological hypersecretory conditions including Zollinger-Ellison syndrome. The over-the-counter product is indicated for relief and prevention of heartburn associated with acid indigestion.',
    patientFriendlyIndication:
      'Heartburn and acid indigestion, and healing of stomach and duodenal ulcers',
    anatomicalSite:
      'Basolateral membrane of the gastric parietal cell — the outside face of the cell, not the acid-secreting channel inside it',
    conditionContext: {
      conditionExplainer:
        'A parietal cell decides how much acid to make by adding up three incoming signals: histamine, acetylcholine and gastrin. Histamine is the loudest of the three, and it is released by neighbouring cells in response to the other two. Blocking the histamine receptor turns the volume down on all three at once, without touching the pump itself.',
      whyItMatters:
        'Famotidine is measurably weaker than a proton pump inhibitor, and it has three things they do not: it works within an hour, it involves no covalent chemistry, and it has almost no drug interactions. It is also, since 2020, the only H2 blocker most people can buy.',
      whoTakesThis:
        'Adults and children with reflux or ulcer disease, an enormous number of people self-treating heartburn off a supermarket shelf, and — during the COVID-19 pandemic — a great many people taking it on the strength of a hypothesis that had not been tested.',
      clinicalGoals:
        'The registered endpoints are ulcer healing and oesophagitis healing seen at endoscopy, and relief of heartburn. The pandemic-era claims about viral illness were tested against symptom endpoints and are audited below.',
    },
    oneSentenceVerdict:
      'A histamine H2-receptor blocker that turns down the loudest of the three signals telling the stomach to make acid, without touching the pump itself: it heals erosive oesophagitis in 51.9% of patients pooled across 43 trials against 83.6% for a proton pump inhibitor and 28.2% for placebo, loses part of its effect within days of continuous dosing, and — in the only randomised trial of it against placebo in COVID-19 — missed its primary endpoint of time to symptom resolution at P=0.4 in 55 outpatients.',
    laymanHowItWorks:
      'The cells that make stomach acid are switched on by three separate chemical messages, and histamine is by far the strongest of them. Famotidine sits on the histamine receptor on the outside of those cells and blocks it, so the loudest signal never gets through and the cell turns its acid production down. Because it blocks a switch rather than destroying the machinery, it works within about an hour and wears off as the drug leaves the body. It also means the cell can partly get around the block over a few days, which is why the effect fades with regular use in a way a proton pump inhibitor’s does not.',
    auditConfidence: 'High Confidence',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0494 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 139 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Off patent since the early 2000s and made by well over a hundred manufacturers. Its commercial position changed for reasons unrelated to its own merits: after the FDA requested the withdrawal of all ranitidine products in April 2020 over N-nitrosodimethylamine contamination, famotidine became effectively the only H2 blocker on the American shelf. It is on the WHO Model List of Essential Medicines.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The comparison that matters is against the proton pump inhibitors, and famotidine loses it on healing by a wide margin — 51.9% against 83.6% pooled across 43 randomised trials — while winning on speed of onset, absence of drug interactions and absence of any covalent chemistry. The other H2 blockers are largely gone: ranitidine was withdrawn worldwide in 2020 and nizatidine and cimetidine are marginal. Antacids are the honest comparison for occasional heartburn, and they work faster still.',
      conventionalRx: [
        {
          name: 'Omeprazole (Prilosec, Prilosec OTC)',
          class: 'Proton pump inhibitor, substituted benzimidazole',
          howItCompares:
            'Destroys the pump rather than blocking one of its switches, and heals erosive oesophagitis in about five in six patients against about half for an H2 blocker, at nearly twice the speed. It takes three to five days to reach full effect, where famotidine works within the hour, and it carries a CYP2C19 interaction profile that famotidine does not.',
          typicalCost:
            'US$0.0816 per delayed-release capsule at United States pharmacy acquisition cost (CMS NADAC, median across 151 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: much more effective healing, no tolerance. Cons: slow onset, drug interactions, and rebound acid hypersecretion on stopping.',
        },
        {
          name: 'Ranitidine (Zantac)',
          class: 'Histamine H2-receptor antagonist',
          howItCompares:
            'The drug famotidine replaced. Same mechanism, similar efficacy, and withdrawn from the market worldwide at the FDA’s request in April 2020 after N-nitrosodimethylamine was found in products and shown to increase with time and temperature during storage. A randomised crossover trial in 18 healthy people subsequently found no increase in urinary NDMA excretion after a 300 mg oral dose, so the contamination was in the product rather than produced in the body.',
          typicalCost: 'Not marketed in the United States; withdrawn from sale in April 2020',
          prosAndCons:
            'Pros: none over famotidine that survived the withdrawal. Cons: unavailable, and the withdrawal is the reason famotidine has the shelf to itself.',
        },
        {
          name: 'Antacids (calcium carbonate, magnesium and aluminium hydroxide)',
          class: 'Direct chemical neutralisation of gastric acid',
          howItCompares:
            'Neutralise acid already present rather than reducing its production, so they act within minutes and last an hour or two. For occasional heartburn they are the faster option; for healing an erosion they are not in the same class — the pooled placebo healing rate in erosive oesophagitis trials was 28.2%.',
          typicalCost:
            'No single NADAC value applies across the antacid category and none is asserted here',
          prosAndCons:
            'Pros: fastest relief available, no systemic absorption for most. Cons: very short duration, and aluminium- and magnesium-containing products bind other medicines in the stomach.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Notice whether it is working less well than it did',
          action:
            'Pay attention to whether a dose that worked in week one still works in week three.',
          patientImpact:
            'Diminution of the antisecretory effect with repeated dosing — tolerance — is established in healthy volunteers for this whole drug class, and it appears within days rather than months. It is one of the least advertised properties of an over-the-counter medicine.',
          clinicalPrecaution:
            'The published reviews find tolerance is less pronounced in people with duodenal ulcer disease than in healthy volunteers, and its clinical significance is contested. Escalating a dose because an effect is fading is a decision for a prescriber.',
        },
        {
          name: 'Say if your kidneys are not working well',
          action:
            'Make sure the prescriber knows about reduced kidney function, including the age-related decline that has no diagnosis attached to it.',
          patientImpact:
            'Famotidine is cleared largely unchanged by the kidney. In renal impairment it accumulates, and the label records central nervous system adverse effects — confusion, delirium, agitation — in that setting, most often in older people.',
          clinicalPrecaution:
            'This is one of the more common causes of unexplained confusion in an older hospital inpatient, and it is reversible. It is a question to raise, not a dose to change.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=C(N=C(S1)N=C(N)N)CSCC/C(=N/S(=O)(=O)N)/N',
      chemicalFormula: 'C8H15N7O2S3',
      molecularWeight: '337.50 g/mol',
      targetReceptorAffinity:
        'A competitive, fully reversible antagonist at the histamine H2 receptor, roughly twenty to fifty times more potent per milligram than cimetidine and seven to twenty times more potent than ranitidine in the antisecretory assays used to rank the class. Nothing about the interaction is covalent, and the effect ends when the drug leaves. Its calculated logP is about -0.2 — it is a strikingly polar molecule, which is why it is cleared by the kidney largely unchanged and why it interacts with almost nothing.',
      structureSource: {
        label:
          'PubChem CID 5702160 (famotidine) — canonical SMILES, molecular formula and molecular weight, as ingested onto this record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5702160',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'fam-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the guanidinothiazole and the sulfamoyl amidine, and the geometry of the double bond',
          description:
            'Confirm both halves of the molecule and, critically, the configuration of the amidine double bond. Famotidine has a defined geometry at that bond and the alternative isomer is a different substance. This is also where nitrosamine screening belongs: the class-wide lesson from the ranitidine withdrawal is that an impurity nobody was looking for ended a drug.',
          reagentsAndBuffer:
            '2-guanidinothiazole and sulfamide reference standards, 1H and 13C NMR with NOE experiments in DMSO-d6 to establish double-bond geometry, LC-MS/MS nitrosamine screening at parts-per-billion sensitivity, Karl Fischer titration',
        },
        {
          id: 'fam-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Thioether chain assembly and installation of the sulfamoyl amidine head',
          description:
            'Alkylate the guanidinothiazole thiol with the propionitrile chain, then convert the nitrile through the imidate to the sulfamoyl amidine. The amidine step sets the geometry checked in the previous stage and is the point at which a stereochemically mixed batch is created or avoided.',
          dependsOnStepId: 'fam-w1',
          reagentsAndBuffer:
            '2-guanidinothiazol-4-ylmethyl thiol, 3-chloropropionitrile, sodium hydroxide in aqueous ethanol; then methanolic hydrogen chloride to the imidate and sulfamide with base, under nitrogen',
        },
        {
          id: 'fam-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation and polymorph control',
          description:
            'Recrystallise to a single polymorph. Famotidine has two well-characterised anhydrous forms with different dissolution behaviour, so a batch that is chemically pure and polymorphically mixed will not perform as the reference product does.',
          dependsOnStepId: 'fam-w2',
          reagentsAndBuffer:
            'Recrystallisation from aqueous methanol or acetonitrile with controlled cooling rate, powder X-ray diffraction against form A and form B reference patterns, differential scanning calorimetry, HPLC for related substances',
        },
        {
          id: 'fam-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Antagonism of histamine-stimulated cAMP in parietal cells',
          description:
            'Apply the compound to isolated gastric parietal cells or an H2-expressing cell line and show it blocks the histamine-driven rise in cyclic AMP without affecting the response to forskolin. That control is what separates receptor blockade from generalised interference with the signalling pathway downstream of it.',
          dependsOnStepId: 'fam-w3',
          reagentsAndBuffer:
            'Isolated rabbit or canine gastric parietal cells, or HEK293 cells expressing human HRH2; histamine and forskolin as stimulus and bypass control, isobutylmethylxanthine to block phosphodiesterase, cAMP immunoassay',
        },
        {
          id: 'fam-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Schild analysis for competitive reversibility, and a repeated-dosing tolerance arm',
          description:
            'Run a Schild plot to confirm surmountable competitive antagonism, then repeat the assay after prolonged agonist-free exposure to look for receptor upregulation. The second arm is the mechanistic counterpart of the tolerance seen in volunteers, and an assay that omits it will not reproduce the clinical behaviour of the drug.',
          dependsOnStepId: 'fam-w4',
          reagentsAndBuffer:
            'Full histamine concentration-response curves at several antagonist concentrations, Schild regression with slope estimation, 48- to 72-hour antagonist pre-exposure arm, radioligand binding with [3H]-tiotidine to quantify receptor density',
        },
      ],
    },
    keyAudits: [
      {
        id: 'fam-a1',
        category: 'measured',
        title: 'Half the healing of a proton pump inhibitor, at half the speed',
        laymanSummary:
          'Pooling 43 randomised trials in 7,635 people, H2 blockers healed erosive damage to the oesophagus in about half of patients and proton pump inhibitors in about five in six. Placebo healed a quarter. The healing also happened about twice as fast on the stronger drug.',
        technicalDetails:
          'Chiba and colleagues applied strict inclusion criteria to single- or double-blind randomised studies in adults with endoscopically proven erosive or ulcerative oesophagitis. Mean healing proportion within 12 weeks was 51.9% (SD 17.1) for H2-receptor antagonists against 83.6% (11.4) for proton pump inhibitors, 39.2% (22.4) for sucralfate and 28.2% (15.6) for placebo. Healing speed was 5.9% per week against 11.7% for PPIs and 2.9% for placebo. Corrected heartburn-free proportions were 47.6% (15.5) against 77.4% (10.4). The endpoint throughout is mucosa seen down an endoscope.',
        evidenceSource:
          'Chiba N, De Gara CJ, Wilkinson JM, Hunt RH. Gastroenterology 1997;112:1798-1810',
        doi: '10.1053/gast.1997.v112.pm9178669',
        measuredMetric:
          'Proportion healed and heartburn-free at up to 12 weeks, pooled across 43 randomised trials in 7,635 patients, by drug class',
        auditFlag: 'verified',
      },
      {
        id: 'fam-a2',
        category: 'failed',
        title: 'It stops working as well within days, and this is established, not disputed',
        laymanSummary:
          'The acid-suppressing effect of this drug class shrinks with repeated dosing over a few days. That has been demonstrated in healthy volunteers and it is a property of the mechanism — blocking a receptor prompts the cell to make more receptors.',
        technicalDetails:
          'Diminution of the antisecretory effect with repeated oral dosing, termed tolerance, is established in healthy volunteers across the H2-receptor antagonist class, with anecdotal evidence of the same phenomenon on intravenous dosing. The review that summarises the literature is explicit that tolerance may be clinically relevant where tight control of acidity is required. It is equally explicit about the limits of the evidence: patients with duodenal ulcer disease do not appear to develop significant tolerance according to the sparse investigations available, and the mechanisms remain unclear. Receptor upregulation is the usual explanation and has not been proved to be the operative one in humans. The important asymmetry is that a proton pump inhibitor cannot show this behaviour, because it destroys the pump rather than occupying a receptor.',
        evidenceSource:
          'Wilder-Smith CH, Merki HS. Tolerance during dosing with H2-receptor antagonists: an overview. Scand J Gastroenterol Suppl 1992;193:14-19',
        doi: '10.3109/00365529209096000',
        measuredMetric:
          'Attenuation of the antisecretory effect on repeated dosing, measured by intragastric pH in healthy volunteers',
        auditFlag: 'caution',
      },
      {
        id: 'fam-a3',
        category: 'failed',
        title:
          'The COVID-19 trial missed its primary endpoint, and the observational study that started it all was retrospective',
        laymanSummary:
          'Early in the pandemic a hospital database study suggested famotidine users did better, and a great deal of public attention followed. When a randomised trial was finally run, in 55 outpatients, the primary endpoint — how quickly symptoms went away — was not met. A secondary measure of the rate of resolution did favour the drug.',
        technicalDetails:
          'The originating signal was a propensity-score-matched retrospective cohort of hospitalised COVID-19 patients reporting an association between famotidine use and improved outcomes. The randomised test was a double-blind, placebo-controlled, fully remote phase 2 trial enrolling 55 symptomatic unvaccinated adult outpatients with confirmed COVID-19 at two United States centres between January and April 2021, self-administering 80 mg famotidine or placebo three times daily for 14 days. Median age was 35. The primary endpoint, time to symptom resolution, was not statistically improved (P=0.4). The secondary endpoint, rate of symptom resolution, was improved (P<0.0001), with estimated 50% reduction of baseline symptom scores at 8.2 days (95% CI 7 to 9.8) against 11.4 days (10.3 to 12.6). Fewer patients on famotidine had detectable plasma interferon alpha at day 7 (P=0.04). The authors state that additional randomised trials are required. Fifty-five participants is a phase 2 sample and the trial was not designed to detect an effect on hospitalisation or death.',
        evidenceSource:
          'Brennan CM et al., Gut 2022;71:879-888 (NCT04724720); Freedberg DE et al., Gastroenterology 2020;159:1129-1131',
        doi: '10.1136/gutjnl-2022-326952',
        measuredMetric:
          'Time to symptom resolution in 55 randomised non-hospitalised adults with COVID-19, against matching placebo',
        auditFlag: 'caution',
      },
      {
        id: 'fam-a4',
        category: 'conclusion_shift',
        title:
          'Famotidine inherited the market because ranitidine was withdrawn — and the mechanism everyone assumed turned out to be wrong',
        laymanSummary:
          'In 2020 every ranitidine product was pulled worldwide because it contained a probable carcinogen. The petition that triggered it argued the drug turned into that carcinogen inside the body. A randomised trial then tested exactly that and found no increase at all. The contamination was in the product, not in the patient.',
        technicalDetails:
          'The FDA requested withdrawal of all ranitidine products in April 2020 after N-nitrosodimethylamine was detected and shown to increase in the product with time and with storage temperature. The 2019 citizen petition had proposed a second and more alarming mechanism: that ranitidine converts to NDMA within the human body, based largely on a small clinical study of urinary NDMA. A randomised, double-blind, placebo-controlled crossover trial in 18 healthy participants then measured 24-hour urinary NDMA excretion after 300 mg oral ranitidine against placebo, on both a non-cured-meats and a cured-meats diet. There was no statistically significant difference on either diet — median paired differences of 0 ng (IQR -6.9 to 0, P=0.54) and -1.1 ng (IQR -9.1 to 11.5, P=0.71). The cured-meats diet raised NDMA excretion far more than the drug did. The withdrawal stands on product contamination, which is a real and sufficient reason. The in-body conversion hypothesis, which drove much of the alarm, was tested and not supported.',
        evidenceSource:
          'Florian J et al., JAMA 2021;326:240-249 (NCT04397445)',
        doi: '10.1001/jama.2021.9199',
        inferredClaim:
          'That ranitidine is converted to a carcinogen inside the body — the hypothesis behind the citizen petition, tested in a randomised crossover trial and not supported',
        auditFlag: 'verified',
      },
      {
        id: 'fam-a5',
        category: 'measured',
        title:
          'In 26,828 ventilated patients, H2 blockers were numerically better on mortality than proton pump inhibitors',
        laymanSummary:
          'The largest comparison ever run between the two ways of preventing stress ulcers in intensive care found the stronger drug bled slightly fewer patients and the weaker drug had slightly fewer deaths. Neither difference in mortality reached the significance threshold.',
        technicalDetails:
          'PEPTIC was a cluster crossover randomised trial at 50 intensive care units in five countries, in which each unit used a preferential proton pump inhibitor strategy and a preferential H2 blocker strategy for six months each in random order. Of 26,982 randomised, 26,828 were analysed. In-hospital mortality by day 90 was 2,459 of 13,415 (18.3%) in the PPI group against 2,333 of 13,356 (17.5%) in the H2 blocker group — risk ratio 1.05 (95% CI 1.00 to 1.10), absolute difference 0.93 percentage points (95% CI -0.01 to 1.88), P=0.054. Clinically important upper gastrointestinal bleeding was 1.3% against 1.8%, risk ratio 0.73 (95% CI 0.57 to 0.92), P=0.009, favouring the proton pump inhibitor. C. difficile rates and lengths of stay did not differ. Interpretation is limited by crossover: an estimated 20.1% of patients randomised by site to H2 blockers actually received a proton pump inhibitor, which would bias the mortality comparison toward the null.',
        evidenceSource: 'PEPTIC Investigators, Young PJ et al., JAMA 2020;323:616-626 (ACTRN12616000481471)',
        doi: '10.1001/jama.2019.22190',
        measuredMetric:
          'All-cause in-hospital mortality within 90 days, and clinically important upper gastrointestinal bleeding, PPI strategy against H2 blocker strategy',
        auditFlag: 'verified',
      },
      {
        id: 'fam-a6',
        category: 'inferred',
        title: 'Its safety reputation rests on the absence of evidence rather than on trials',
        laymanSummary:
          'Famotidine is generally described as very safe, and it probably is. What it does not have is what pantoprazole has: a placebo-controlled trial in tens of thousands of people over years, systematically counting harms. Its record is built from decades of use rather than from a trial designed to find problems.',
        technicalDetails:
          'No placebo-controlled randomised trial of famotidine comparable in scale or duration to the COMPASS proton pump inhibitor substudy — 17,598 participants, median 3.01 years, fourteen prespecified safety outcomes collected six-monthly — has been conducted for this molecule or for its class. What exists is a very large post-marketing experience, the label’s recorded adverse reactions, and a known and mechanistically explicable problem: the drug is cleared largely unchanged by the kidney, so in renal impairment it accumulates and produces central nervous system effects including confusion, delirium and agitation, most often in older patients. That is a well-characterised harm found through use rather than through a trial. Describing the drug as proven safe overstates what the record contains; describing it as unsafe would overstate it in the other direction.',
        evidenceSource:
          'PEPCID United States prescribing information, Warnings and Precautions and Adverse Reactions (NDA 019462); Moayyedi P et al., Gastroenterology 2019;157:682-691 for the comparison',
        inferredClaim:
          'That long familiarity with a drug is equivalent to a systematic safety trial — a common inference, and the reason the proton pump inhibitor safety questions were answerable in 2019 while the H2 blocker ones are not',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed plain, with no coating needed',
        laymanDesc:
          'Unlike the proton pump inhibitors, this molecule is perfectly stable in stomach acid, so the tablet needs no protective shell. It starts being absorbed straight away.',
        molecularDetail:
          'Famotidine is acid-stable and orally bioavailable at 40 to 45%, unaffected by food. Peak plasma concentration comes at one to three hours and the plasma half-life is 2.5 to 3.5 hours — which, unlike a proton pump inhibitor, is close to the duration of its effect, because the effect ends when the drug leaves the receptor.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Reaches the outside of the acid-making cell',
        laymanDesc:
          'It works on the outer surface of the stomach cell, not inside the acid channel. Nothing has to trap it and nothing has to activate it.',
        molecularDetail:
          'The H2 receptor sits on the basolateral membrane, facing the bloodstream rather than the gastric lumen. Famotidine is highly polar, with a logP near -0.2, and does not need to cross a membrane or accumulate in an acidic compartment to reach its target.',
        iconName: 'Droplets',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Occupies the histamine switch',
        laymanDesc:
          'Three chemicals tell the stomach cell to make acid, and histamine is the loudest. Famotidine sits in the histamine slot so that message never arrives. The other two signals also weaken, because much of their effect works through histamine.',
        molecularDetail:
          'Competitive, surmountable, fully reversible antagonism at the Gs-coupled H2 receptor. Blocking it prevents adenylyl cyclase activation and the rise in cyclic AMP that drives protein kinase A. Because gastrin and acetylcholine act substantially through histamine release from enterochromaffin-like cells, blocking H2 attenuates all three stimulatory arms rather than one.',
        iconName: 'ToggleLeft',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The pump is never activated, but never destroyed either',
        laymanDesc:
          'The acid pump itself is untouched. It simply never receives the instruction to move to the cell surface and start working. That is why the effect is complete only while the drug is present.',
        molecularDetail:
          'Without protein kinase A signalling, the H+/K+-ATPase-containing tubulovesicles do not fuse with the canalicular membrane and the pump is not inserted into the secretory surface. No covalent chemistry occurs anywhere. Acid secretion resumes as receptor occupancy falls.',
        iconName: 'ToggleRight',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And the cell adapts to being blocked',
        laymanDesc:
          'Over a few days of regular dosing, the same dose suppresses less acid. Blocking a receptor is the kind of intervention a cell can compensate for; destroying the pump is not.',
        molecularDetail:
          'Tolerance to the antisecretory effect is established in healthy volunteers with repeated oral dosing and reported with intravenous dosing. Receptor upregulation is the usual proposed mechanism and is not proven in humans. The reviews note it is less pronounced in duodenal ulcer patients than in volunteers, and its clinical significance remains contested.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Cleared by the kidney, largely untouched',
        laymanDesc:
          'The liver barely processes it, which is why it interacts with almost nothing. The kidney does the work instead, so when kidney function falls the drug builds up — and in older people that shows up as confusion.',
        molecularDetail:
          'Roughly 65 to 70% is excreted unchanged, most of it renally, with minimal cytochrome P450 involvement — the reason famotidine has none of the interaction profile that made cimetidine notorious. In renal impairment, accumulation produces the central nervous system adverse effects recorded in the label: confusion, delirium, hallucinations, agitation, most often in elderly patients.',
        iconName: 'Filter',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Chiba pooled analysis of 43 randomised oesophagitis trials',
        phase: 'Meta-analysis of single- and double-blind randomised trials',
        sampleSize: 7635,
        primaryEndpoint:
          'Proportion healed and proportion heartburn-free at up to 12 weeks, by drug class',
        endpointMet: true,
        statisticalPValue:
          'H2-receptor antagonists 51.9% (SD 17.1) against proton pump inhibitors 83.6% (11.4), sucralfate 39.2% (22.4) and placebo 28.2% (15.6); healing speed 5.9% per week against 11.7% and 2.9%',
        unreportedAdverseSignals:
          'A class-level pooled estimate, not a head-to-head trial of famotidine specifically, and the endpoint is endoscopic appearance rather than any patient outcome.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PEPTIC (ACTRN12616000481471)',
        phase: 'Cluster crossover randomised clinical trial, 50 ICUs in 5 countries',
        sampleSize: 26828,
        primaryEndpoint: 'All-cause in-hospital mortality within 90 days',
        endpointMet: false,
        statisticalPValue:
          '18.3% on the proton pump inhibitor strategy against 17.5% on the H2 blocker strategy; risk ratio 1.05 (95% CI 1.00 to 1.10), P=0.054',
        unreportedAdverseSignals:
          'An estimated 20.1% of patients randomised by site to H2 blockers actually received a proton pump inhibitor. That crossover biases the comparison toward the null and the authors say so.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Famotidine against placebo in outpatient COVID-19 (NCT04724720)',
        phase: 'Phase 2, randomised, double-blind, placebo-controlled, fully remote',
        sampleSize: 55,
        primaryEndpoint: 'Time to symptom resolution',
        endpointMet: false,
        statisticalPValue:
          'Not statistically improved, P=0.4. Secondary rate of symptom resolution improved, P<0.0001, with 50% reduction of baseline symptom score at 8.2 days (95% CI 7 to 9.8) against 11.4 days (10.3 to 12.6).',
        unreportedAdverseSignals:
          'Fifty-five participants, median age 35, all unvaccinated outpatients. The trial was not designed or powered to detect an effect on hospitalisation or death, and the authors state further randomised trials are required.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Ranitidine and urinary NDMA excretion (NCT04397445)',
        phase: 'Randomised, double-blind, placebo-controlled crossover in healthy volunteers',
        sampleSize: 18,
        primaryEndpoint: 'Twenty-four-hour urinary excretion of N-nitrosodimethylamine',
        endpointMet: false,
        statisticalPValue:
          'No significant difference on a non-cured-meats diet (median paired difference 0 ng, IQR -6.9 to 0, P=0.54) or a cured-meats diet (-1.1 ng, IQR -9.1 to 11.5, P=0.71)',
        unreportedAdverseSignals:
          'The trial is about ranitidine, not famotidine, and appears here because it is the reason famotidine has the H2 blocker market to itself. The withdrawal rests on contamination found in the product, which this trial does not address.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'H2-receptor antagonists healed 51.9% of erosive oesophagitis against 83.6% for proton pump inhibitors and 28.2% for placebo, pooled across 43 randomised trials in 7,635 people',
        'In-hospital mortality 17.5% on an H2 blocker strategy against 18.3% on a proton pump inhibitor strategy in 26,828 ventilated patients (RR 1.05, P=0.054), with bleeding favouring the proton pump inhibitor at 1.8% against 1.3%',
        'Time to COVID-19 symptom resolution not improved against placebo in 55 randomised outpatients (P=0.4)',
        'Attenuation of the antisecretory effect with repeated dosing, established in healthy volunteers across the class',
      ],
      unsupportedInferences: [
        'That famotidine treats COVID-19 — an observational association whose randomised test missed its primary endpoint in 55 people',
        'That ranitidine converts to a carcinogen inside the body, the hypothesis behind the citizen petition, refuted by a randomised crossover trial',
        'That long safe use is equivalent to a systematic safety trial; no COMPASS-scale placebo-controlled study exists for this class',
        'That an H2 blocker is interchangeable with a proton pump inhibitor for healing erosive disease, when the pooled difference is 32 percentage points',
      ],
      whatFailedInitially: [
        'Tolerance: the antisecretory effect shrinks within days of repeated dosing, a limitation the mechanism makes unavoidable',
        'The COVID-19 primary endpoint was not met, though the drug was safe and a secondary rate measure favoured it',
        'Renal accumulation causes confusion and delirium in older patients, a harm found through use rather than through a trial',
        'PEPTIC could not deliver a clean comparison, because a fifth of the H2 blocker arm received a proton pump inhibitor instead',
      ],
      realWorldOutcome: [
        'Approved under NDA 019462 on 15 October 1986 and available without prescription since 1995',
        'On the WHO Model List of Essential Medicines, and about five cents a tablet at pharmacy acquisition cost',
        'Became effectively the only H2 blocker on the American market after ranitidine was withdrawn worldwide in April 2020',
        'Still the drug of choice where speed of onset or freedom from drug interactions matters more than depth of acid suppression',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, orally disintegrating tablet, oral suspension, chewable over-the-counter tablet, and intravenous solution including a preservative-free presentation',
      description:
        'No enteric coating is needed, because unlike the proton pump inhibitors this molecule is stable in gastric acid. Onset is within about an hour by mouth, which is the property that keeps it in use alongside more effective drugs. The intravenous form is widely used in hospital, including as stress ulcer prophylaxis.',
      safetyProfile:
        'The label records central nervous system adverse effects — confusion, delirium, hallucinations, disorientation, agitation, seizure — in patients with moderate or severe renal impairment, in whom the drug accumulates because it is cleared largely unchanged by the kidney. QT prolongation has been reported in the same setting. Commonest adverse reactions are headache, dizziness, constipation and diarrhoea. Cytochrome P450 involvement is minimal, so the drug interaction profile is unusually clean; the interactions that do matter are with drugs whose absorption depends on gastric acidity.',
    },
    commonQuestions: [
      {
        q: 'Is it as good as omeprazole?',
        a: 'For healing damage, no, and the gap is large. Pooled across 43 randomised trials in 7,635 people, H2 blockers healed erosive oesophagitis in 51.9% of patients and proton pump inhibitors in 83.6%, with placebo at 28.2%. Healing also happened about twice as fast on the stronger class. What famotidine has instead is speed of onset — it works within about an hour where a proton pump inhibitor takes three to five days to reach full effect — and an almost complete absence of drug interactions, because the liver barely touches it. For occasional heartburn those properties matter more than depth of suppression. For an erosion seen down an endoscope, they do not.',
      },
      {
        q: 'Why does it seem to stop working after a week or two?',
        a: 'Because it probably is working less well, and this is a known property of the drug class rather than imagination. Repeated dosing produces measurable attenuation of the acid-suppressing effect within days — it has been demonstrated in healthy volunteers with intragastric pH monitoring, and it is reported with intravenous dosing too. The usual explanation is that blocking a receptor prompts the cell to make more receptors, though that has not been proved in humans. It is worth knowing that the reviews of this literature are careful: tolerance appears less pronounced in people with duodenal ulcer disease than in healthy volunteers, and how much it matters clinically is still argued about. A proton pump inhibitor cannot behave this way, because it destroys the pump instead of occupying a switch.',
      },
      {
        q: 'What happened to Zantac, and is famotidine affected?',
        a: 'Ranitidine was withdrawn worldwide in 2020 because N-nitrosodimethylamine, a probable human carcinogen, was found in the products and shown to increase with time and storage temperature. Famotidine is a different molecule and was not part of that action. There is a further twist worth knowing: the citizen petition that triggered the investigation argued that ranitidine converts into NDMA inside the human body, which would have been far more alarming. A randomised crossover trial in 18 healthy people then measured 24-hour urinary NDMA after a 300 mg dose against placebo and found no difference on either a normal or a cured-meats diet. Eating cured meat raised NDMA excretion considerably more than the drug did. The contamination was real and in the product; the in-body conversion was not supported.',
        auditNote:
          'Famotidine’s current market position is an accident of another drug’s withdrawal rather than a demonstration of its own superiority.',
      },
      {
        q: 'Does famotidine help with COVID-19?',
        a: 'The randomised evidence does not support it, though the story is more nuanced than a flat no. An early propensity-matched retrospective cohort of hospitalised patients suggested famotidine users did better, and that got wide attention. The randomised test was a fully remote, double-blind, placebo-controlled trial in 55 unvaccinated outpatients taking 80 mg three times daily for 14 days. The primary endpoint — time to symptom resolution — was not improved, at P=0.4. A secondary measure, the rate of symptom resolution, was improved, with 50% of baseline symptoms gone at 8.2 days against 11.4. Fifty-five people, median age 35, is a phase 2 sample. It was not designed to detect an effect on hospitalisation or death, and the authors explicitly called for further trials that have not arrived.',
      },
      {
        q: 'Could this be why my elderly relative is confused in hospital?',
        a: 'It is a recognised possibility and worth raising with the team. Famotidine is cleared almost entirely by the kidney rather than the liver, which is what makes it so free of drug interactions. The other side of that is that when kidney function is reduced — including the slow decline that comes with age and carries no diagnosis — the drug accumulates. The label records confusion, delirium, hallucinations, disorientation, agitation and seizure in patients with moderate or severe renal impairment, most often elderly ones. It is reversible when recognised. Raising the question is reasonable; changing a dose is a decision for the treating team.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Chiba N, De Gara CJ, Wilkinson JM, Hunt RH. Speed of healing and symptom relief in grade II to IV gastroesophageal reflux disease: a meta-analysis. Gastroenterology 1997;112:1798-1810',
        identifier: '10.1053/gast.1997.v112.pm9178669',
        kind: 'doi',
      },
      {
        label:
          'Wilder-Smith CH, Merki HS. Tolerance during dosing with H2-receptor antagonists: an overview. Scand J Gastroenterol Suppl 1992;193:14-19',
        identifier: '10.3109/00365529209096000',
        kind: 'doi',
      },
      {
        label:
          'Brennan CM et al. Oral famotidine versus placebo in non-hospitalised patients with COVID-19: a randomised, double-blind, data-intense, phase 2 clinical trial. Gut 2022;71:879-888',
        identifier: '10.1136/gutjnl-2022-326952',
        kind: 'doi',
      },
      {
        label:
          'Freedberg DE et al. Famotidine use is associated with improved clinical outcomes in hospitalized COVID-19 patients: a propensity score matched retrospective cohort study. Gastroenterology 2020;159:1129-1131',
        identifier: '10.1053/j.gastro.2020.05.053',
        kind: 'doi',
      },
      {
        label:
          'Florian J et al. Effect of oral ranitidine on urinary excretion of N-nitrosodimethylamine (NDMA): a randomized clinical trial. JAMA 2021;326:240-249',
        identifier: '10.1001/jama.2021.9199',
        kind: 'doi',
      },
      {
        label:
          'PEPTIC Investigators (Young PJ et al.). Effect of stress ulcer prophylaxis with proton pump inhibitors vs histamine-2 receptor blockers on in-hospital mortality among ICU patients receiving invasive mechanical ventilation. JAMA 2020;323:616-626',
        identifier: '10.1001/jama.2019.22190',
        kind: 'doi',
      },
      {
        label: 'Famotidine against placebo in non-hospitalised adults with COVID-19',
        identifier: 'NCT04724720',
        kind: 'nct',
      },
      {
        label: 'Ranitidine and 24-hour urinary NDMA excretion, randomised crossover',
        identifier: 'NCT04397445',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: PEPCID (famotidine) tablets, NDA 019462, Bausch — original approval 15 October 1986',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019462',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: PEPCID AC (famotidine), NDA 020325 — over-the-counter approval 28 April 1995',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020325',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5702160 — famotidine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5702160',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Sucralfate — a drug that is essentially not absorbed, works by turning into glue, and lost
  //    the one 1,200-patient head-to-head that mattered.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'sucralfate',
    name: 'Sucralfate',
    tradeName: 'Carafate',
    sponsor:
      'AbbVie (current US label holder) — developed by Chugai in Japan and approved in the United States under NDA 018333 on 30 October 1981',
    targetGene:
      'None. Sucralfate has no molecular target in the human genome — it acts physically on exposed tissue',
    targetProtein:
      'Positively charged proteins exposed in an ulcer crater, to which the polymerised polyanion binds electrostatically. It is a surface, not a receptor.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1981,
    indication:
      'Short-term treatment, up to 8 weeks, of active duodenal ulcer, and maintenance therapy for duodenal ulcer patients at reduced dosage after healing of acute ulcers',
    patientFriendlyIndication: 'Duodenal ulcers, and keeping a healed duodenal ulcer from returning',
    anatomicalSite:
      'The floor of the ulcer crater itself — a physical surface in the stomach or duodenum, not a cell and not a receptor',
    conditionContext: {
      conditionExplainer:
        'An ulcer is a hole in the lining where the protective mucus layer has been breached and the tissue underneath is exposed to acid and to pepsin, the stomach’s protein-digesting enzyme. Everything else in this file works by reducing what is poured onto that hole. Sucralfate works by covering it.',
      whyItMatters:
        'It is the only drug in this group that is not absorbed in any meaningful quantity — under 5% crosses the gut wall — which makes it uniquely free of systemic effects and uniquely dependent on physical contact for anything at all. It is also the one whose place in practice was decided by losing a trial rather than by winning one.',
      whoTakesThis:
        'People with duodenal ulcer, people who cannot take acid suppression, and — off label and very widely — people with radiation proctitis, oral or oesophageal mucosal injury, and bile reflux. Most of those uses are extrapolations from the licensed one.',
      clinicalGoals:
        'The registered endpoint is duodenal ulcer healing seen at endoscopy within eight weeks. Whether the barrier mechanism does anything at other sites is inferred from the chemistry rather than measured at those sites.',
    },
    oneSentenceVerdict:
      'A sugar molecule wrapped in eight sulfate groups and complexed with aluminium, which is barely absorbed and does nothing systemically: in stomach acid it polymerises into a sticky paste that binds to exposed protein in an ulcer crater and physically covers it — healing 39.2% of erosive oesophagitis against 28.2% for placebo and 83.6% for a proton pump inhibitor across 43 pooled trials, and losing the definitive 1,200-patient intensive-care comparison, where clinically important bleeding was 3.8% on sucralfate against 1.7% on ranitidine.',
    laymanHowItWorks:
      'Sucralfate is a large, heavily charged molecule that the gut hardly absorbs at all, so almost the entire dose stays inside the digestive tract. When it meets stomach acid the molecules link up into a thick, sticky gel. That gel carries a strong negative charge and the raw protein in the floor of an ulcer carries a positive one, so the gel sticks there far more than it sticks to intact lining. The result is a physical patch over the wound that keeps acid and digestive enzymes off it while the tissue underneath repairs. Nothing about this involves a receptor or a hormone, and nothing about it reduces how much acid the stomach makes.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 63,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1725 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 21 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Off patent for decades, but the generic market is thin: 21 listed products against 139 for famotidine and 151 for omeprazole. The oral suspension in particular has a short list of manufacturers and has been on United States drug shortage lists more than once, which is what a low-margin product with few suppliers looks like.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For an ulcer, everything else in this file heals more of them. Sucralfate’s case is not that it is stronger but that it is not absorbed, so it has no systemic drug interactions, no effect on gastric pH and nothing to rebound when it stops. That matters in pregnancy, in people already on many medicines, and where lowering stomach acid is undesirable. Where a comparison has been run head to head in the sickest patients, it lost.',
      conventionalRx: [
        {
          name: 'Omeprazole (Prilosec, Prilosec OTC)',
          class: 'Proton pump inhibitor, substituted benzimidazole',
          howItCompares:
            'Heals about twice as much erosive damage — 83.6% against 39.2% in the pooled analysis of 43 randomised trials — by cutting acid production rather than covering the wound. It is absorbed and it interacts with other drugs, which sucralfate does not.',
          typicalCost:
            'US$0.0816 per delayed-release capsule at United States pharmacy acquisition cost (CMS NADAC, median across 151 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: far more effective healing, once daily, cheaper per unit. Cons: systemic drug interactions, acid rebound on withdrawal, and it does not physically protect anything.',
        },
        {
          name: 'Famotidine (Pepcid, Pepcid AC)',
          class: 'Histamine H2-receptor antagonist',
          howItCompares:
            'Heals 51.9% of erosive oesophagitis against sucralfate’s 39.2% in the same pooled analysis. In the definitive intensive-care head-to-head, the H2 blocker arm — ranitidine, the same class — had less than half the clinically important bleeding of the sucralfate arm.',
          typicalCost:
            'US$0.0494 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 139 listed generic products, effective 19 August 2026)',
          prosAndCons:
            'Pros: more effective, cheaper, faster, does not bind other medicines. Cons: absorbed and renally cleared, so it accumulates in kidney impairment where sucralfate’s aluminium does too.',
        },
        {
          name: 'Misoprostol (Cytotec)',
          class: 'Synthetic prostaglandin E1 analogue',
          howItCompares:
            'The other mucosal-defence drug, and the only one that restores the prostaglandin an anti-inflammatory drug removes. In 537 NSAID users it left 93% ulcer-free at twelve weeks against 80 to 82% for lansoprazole and 51% for placebo, at the cost of considerably more diarrhoea and cramping.',
          typicalCost:
            'No NADAC value is held on this record for misoprostol and none is asserted here',
          prosAndCons:
            'Pros: addresses the actual mechanism of NSAID injury. Cons: poorly tolerated, and an abortifacient that cannot be used in pregnancy — which is precisely the setting where sucralfate’s lack of absorption is an advantage.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask about spacing it from your other tablets',
          action:
            'Check with the pharmacist whether any other medicine needs to be separated in time from this one.',
          patientImpact:
            'Sucralfate is a large polyanion sitting in the stomach as a gel, and it binds other drugs. The label records reduced bioavailability of fluoroquinolone antibiotics, digoxin, phenytoin, levothyroxine, ketoconazole, warfarin, quinidine and theophylline when taken together. Nothing is absorbed by the patient; the problem is what the gel absorbs.',
          clinicalPrecaution:
            'The interaction is mechanical rather than metabolic, so it does not appear in interaction checkers built around liver enzymes. Timing is a matter for the prescriber or pharmacist.',
        },
        {
          name: 'Say if you have kidney disease or are on dialysis',
          action:
            'Make sure the prescriber knows about any reduced kidney function before this is started.',
          patientImpact:
            'Each gram of sucralfate carries roughly 207 mg of aluminium. Under 5% is absorbed, which is harmless with working kidneys and is not harmless without them. In a study of 19 ventilated children on sucralfate for a median of seven days, serum aluminium was higher in the nine who also received peritoneal dialysis.',
          clinicalPrecaution:
            'The label warns against use in renal impairment for exactly this reason, and aluminium accumulation is associated with encephalopathy and bone disease. This is a question to raise, not a dose to adjust.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C([C@@H]1[C@H]([C@@H]([C@H]([C@H](O1)O[C@]2([C@H]([C@@H]([C@H](O2)COS(=O)(=O)O[Al])OS(=O)(=O)O[Al])OS(=O)(=O)O[Al])COS(=O)(=O)O[Al])OS(=O)(=O)O[Al])OS(=O)(=O)O[Al])OS(=O)(=O)O[Al])OS(=O)(=O)O[Al].O.O.O.O.O.O.O.O.O.O.O.O.O.O.O.O.O.O.O.O.[Al]',
      chemicalFormula: 'C12H54Al9O55S8',
      molecularWeight: '1577.90 g/mol',
      targetReceptorAffinity:
        'There is no receptor and no affinity constant, because there is no molecular target. The interaction is electrostatic and physical: the polyanionic sucrose octasulfate, polymerised in acid, adheres to positively charged proteins exposed in an ulcer base. The stated molecular weight and formula describe a single idealised aluminium complex; the marketed substance is a basic aluminium salt whose exact composition varies within specification, which is why it is defined by aluminium content and degree of sulfation rather than by a molecular weight alone.',
      structureSource: {
        label:
          'PubChem CID 121494085 (sucralfate) — canonical SMILES, molecular formula and molecular weight, as ingested onto this record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/121494085',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'suc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Degree of sulfation and aluminium content, because the molecule is a specification not a formula',
          description:
            'Establish that on average eight sulfate esters are present per sucrose and quantify aluminium. Unlike every other drug in this file, sucralfate is not a single defined molecule: it is a basic aluminium complex of sucrose octasulfate, and identity is a compositional range rather than a structure. A batch with the right formula and the wrong aluminium ratio does not gel correctly.',
          reagentsAndBuffer:
            'Sucrose octasulfate reference standard, ion chromatography for sulfate, inductively coupled plasma optical emission spectrometry for aluminium, loss on drying and residue on ignition',
        },
        {
          id: 'suc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Exhaustive sulfation of sucrose, then aluminium complexation',
          description:
            'Sulfate all eight free hydroxyls of sucrose, isolate the octasulfate as its salt, then precipitate the basic aluminium complex. The second step is where the product’s behaviour is set: too little aluminium and the material stays soluble and washes away, too much and it will not polymerise into an adherent gel at gastric pH.',
          dependsOnStepId: 'suc-w1',
          reagentsAndBuffer:
            'Sulfur trioxide-pyridine or chlorosulfonic acid complex in pyridine or dimethylformamide, sodium or potassium hydroxide neutralisation, aluminium chloride or sodium aluminate under controlled pH',
        },
        {
          id: 'suc-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Washing to remove free aluminium and soluble sulfate',
          description:
            'Wash the precipitate exhaustively. Free aluminium salt left in the product is the fraction most available for absorption, and the whole safety argument for the drug rests on almost nothing being absorbed. Residual soluble sulfate and free sucrose octasulfate are the other impurities that change dissolution behaviour.',
          dependsOnStepId: 'suc-w2',
          reagentsAndBuffer:
            'Repeated aqueous washing with pH control, filtration or centrifugation, conductivity monitoring of washings, ICP-OES on the filtrate to quantify free aluminium',
        },
        {
          id: 'suc-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Adhesion to ulcerated against intact mucosa, side by side',
          description:
            'Apply labelled material to an ex vivo or animal preparation carrying both an induced ulcer and adjacent intact mucosa, and measure how much sticks to each. This is the step that tests the central claim — selective binding to the ulcer base — and it is the one that has to be done in tissue rather than on a plate, because selectivity is the whole argument for the drug.',
          dependsOnStepId: 'suc-w3',
          reagentsAndBuffer:
            'Rat or porcine gastric mucosa with an induced acetic-acid ulcer, tritiated or aluminium-traced sucralfate, simulated gastric fluid at pH 1.2 and a neutral control at pH 7.0, scintillation counting or ICP-OES per tissue region',
        },
        {
          id: 'suc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Viscosity, pepsin inhibition and bile-salt binding across the pH range',
          description:
            'Measure gel viscosity at pH 1 against pH 7, quantify inhibition of pepsin proteolysis, and measure bile-salt binding capacity. The pH dependence is the point: a preparation that gels at neutral pH would not be sucralfate, and a preparation that fails to gel at pH 1 would be inert in the place it is meant to work.',
          dependsOnStepId: 'suc-w4',
          reagentsAndBuffer:
            'Rotational viscometry across pH 1 to 7, haemoglobin or casein pepsin substrate assay, taurocholate and glycocholate binding by equilibrium dialysis, simulated gastric and intestinal fluids',
        },
      ],
    },
    keyAudits: [
      {
        id: 'suc-a1',
        category: 'failed',
        title:
          'It lost the definitive intensive-care trial: 3.8% bleeding against 1.7% on ranitidine',
        laymanSummary:
          'Twelve hundred patients on breathing machines were randomly given sucralfate or ranitidine to prevent stress ulcer bleeding. More than twice as many bled on sucralfate. The theory that sucralfate would cause less pneumonia — because it does not remove the acid that kills swallowed bacteria — was tested in the same trial and did not hold up.',
        technicalDetails:
          'A multicentre, randomised, blinded, double-dummy trial in 1,200 patients requiring mechanical ventilation compared nasogastric sucralfate suspension 1 g six-hourly with intravenous ranitidine 50 mg eight-hourly, each with a matching placebo by the other route. Clinically important gastrointestinal bleeding occurred in 10 of 596 (1.7%) on ranitidine against 23 of 604 (3.8%) on sucralfate — relative risk 0.44 (95% CI 0.21 to 0.92, P=0.02). Ventilator-associated pneumonia was 114 of 596 (19.1%) against 98 of 604 (16.2%), relative risk 1.18 (95% CI 0.92 to 1.51, P=0.19), numerically favouring sucralfate but not significantly. Intensive care mortality was 23.5% against 22.9% and median ICU stay was nine days in both groups. The trial settled the question and sucralfate largely left intensive care as a result.',
        evidenceSource:
          'Cook D et al., N Engl J Med 1998;338:791-797 (Canadian Critical Care Trials Group)',
        doi: '10.1056/NEJM199803193381203',
        measuredMetric:
          'Clinically important upper gastrointestinal bleeding, ventilator-associated pneumonia and mortality in 1,200 randomised ventilated patients',
        auditFlag: 'verified',
      },
      {
        id: 'suc-a2',
        category: 'measured',
        title: 'The weakest healing figure of any active drug in the pooled oesophagitis analysis',
        laymanSummary:
          'Across 43 randomised trials in more than 7,600 people, sucralfate healed erosive damage to the gullet in about two in five patients. Placebo healed a bit over one in four. Proton pump inhibitors healed five in six.',
        technicalDetails:
          'Mean healing proportion within 12 weeks was 39.2% (SD 22.4) for sucralfate, against 28.2% (15.6) for placebo, 51.9% (17.1) for H2-receptor antagonists and 83.6% (11.4) for proton pump inhibitors. The standard deviation on the sucralfate estimate is the largest of the four, which reflects both a smaller pooled sample and genuine heterogeneity between the studies contributing to it. The endpoint is mucosa seen down an endoscope, and the indication sucralfate actually holds a licence for is duodenal ulcer rather than oesophagitis, so this is a measurement of the drug outside its label and should be read as one.',
        evidenceSource:
          'Chiba N, De Gara CJ, Wilkinson JM, Hunt RH. Gastroenterology 1997;112:1798-1810',
        doi: '10.1053/gast.1997.v112.pm9178669',
        measuredMetric:
          'Proportion healed at up to 12 weeks in erosive oesophagitis, pooled across 43 randomised trials by drug class',
        auditFlag: 'caution',
      },
      {
        id: 'suc-a3',
        category: 'inferred',
        title: 'The mechanism is a laboratory observation applied to every mucosa in the body',
        laymanSummary:
          'The claim that sucralfate sticks preferentially to ulcers rests on animal and laboratory work. Its licence covers duodenal ulcers only. It is used very widely for radiation damage to the rectum, mouth ulcers, oesophageal injury and bile reflux — all of them extensions of the same chemistry to places where it was never licensed.',
        technicalDetails:
          'The accepted mechanism has three components, each demonstrated in vitro or in animals: acid-driven polymerisation into a viscous adhesive gel; electrostatic binding of the polyanion to positively charged protein exposed in an ulcer crater, with selectivity for ulcerated over intact mucosa shown by tissue autoradiography; and adsorption of pepsin and bile salts. Local prostaglandin and bicarbonate stimulation is also proposed. The United States label indication is short-term treatment of active duodenal ulcer and reduced-dose maintenance after healing — nothing else. Radiation proctitis, oral and oesophageal mucositis, bile reflux gastritis and stoma or wound care are all off-label extrapolations from the chemistry, and while randomised trials exist for several of them, the licence and the mechanism evidence do not extend that far on their own.',
        evidenceSource:
          'CARAFATE (sucralfate) United States prescribing information, Indications and Usage and Clinical Pharmacology (NDA 018333, AbbVie)',
        inferredClaim:
          'That a barrier mechanism demonstrated in the duodenum works at every other mucosal surface it is applied to — a chemically plausible extrapolation, and the basis of most of this drug’s actual use',
        auditFlag: 'caution',
      },
      {
        id: 'suc-a4',
        category: 'failed',
        title: 'It carries aluminium, and kidneys are what keep that harmless',
        laymanSummary:
          'Every gram of sucralfate contains about 207 milligrams of aluminium. Only a tiny fraction is absorbed, which does not matter if the kidneys clear it and does matter if they do not. In critically ill children on the drug for about a week, blood aluminium was higher in those who also needed dialysis.',
        technicalDetails:
          'A retrospective study measured serum aluminium in 19 mechanically ventilated children given nasogastric sucralfate suspension for a median of seven days (range 3 to 14). Serum aluminium showed no correlation with total dose (P=0.35) or with dose per kilogram (P=0.55), but was higher in the nine patients who also received peritoneal dialysis. The lack of dose correlation is itself informative: absorption is not the rate-limiting variable, elimination is. The label warns against use in patients with chronic renal failure or on dialysis because absorbed aluminium is not excreted and accumulates, and aluminium accumulation in renal failure is associated with encephalopathy and osteomalacia. Concurrent aluminium-containing antacids add to the load.',
        evidenceSource:
          'Thorburn K, Samuel M, Smith EA. Aluminum accumulation in critically ill children on sucralfate therapy. Pediatr Crit Care Med 2001;2:247-249',
        doi: '10.1097/00130478-200107000-00011',
        measuredMetric:
          'Serum aluminium concentration after a median seven days of nasogastric sucralfate in 19 ventilated children, stratified by dialysis',
        auditFlag: 'caution',
      },
      {
        id: 'suc-a5',
        category: 'measured',
        title:
          'It binds other medicines in the stomach, and that interaction is invisible to interaction checkers',
        laymanSummary:
          'The same stickiness that makes it work also makes it grab other tablets sitting in the stomach at the same time. Antibiotics, thyroid hormone, digoxin, phenytoin and warfarin are all absorbed less well when taken with it. Because the mechanism is physical rather than metabolic, most drug-interaction software does not flag it.',
        technicalDetails:
          'The label records reduced bioavailability of ciprofloxacin, norfloxacin, ofloxacin and other fluoroquinolones, digoxin, phenytoin, levothyroxine, ketoconazole, warfarin, quinidine and theophylline when co-administered, attributed to binding by sucralfate in the gastrointestinal tract. The label notes the interaction can generally be managed by separating administration in time. The fluoroquinolone effect is the clinically largest and the levothyroxine effect the most easily missed, because thyroid replacement is a long-term background medicine that nobody re-examines when an ulcer drug is added. This is a well-characterised, mechanistically obvious and frequently overlooked interaction class, and it exists precisely because the drug is not absorbed.',
        evidenceSource:
          'CARAFATE (sucralfate) United States prescribing information, Drug Interactions (NDA 018333, AbbVie)',
        measuredMetric:
          'Reduced bioavailability of co-administered drugs measured in interaction studies recorded in the label',
        auditFlag: 'caution',
      },
      {
        id: 'suc-a6',
        category: 'conclusion_shift',
        title:
          'The pneumonia argument that kept it in intensive care did not survive the trial designed to test it',
        laymanSummary:
          'For years the case for sucralfate in intensive care was that it prevents bleeding without removing stomach acid, and stomach acid kills bacteria that would otherwise be aspirated into the lungs. The trial built to test that found no significant difference in pneumonia — and more bleeding on sucralfate.',
        technicalDetails:
          'The hypothesis was mechanistically coherent: raising gastric pH permits bacterial overgrowth in the stomach, and retrograde colonisation of the oropharynx and aspiration was proposed as a route to ventilator-associated pneumonia. The 1,200-patient trial measured both endpoints in the same population. Pneumonia was 16.2% on sucralfate against 19.1% on ranitidine, relative risk 1.18 (95% CI 0.92 to 1.51, P=0.19) — numerically in the predicted direction and not significant. Bleeding was 3.8% against 1.7%, relative risk 0.44 (95% CI 0.21 to 0.92, P=0.02) — significantly worse on sucralfate. Twenty years later the same pneumonia question was put to placebo in 4,821 patients in REVISE, and ventilator-associated pneumonia was again no different. The trade-off that justified sucralfate in this setting had one arm that was real and one that was not, and the practice moved accordingly.',
        evidenceSource:
          'Cook D et al., N Engl J Med 1998;338:791-797; Cook D et al., N Engl J Med 2024;391:9-20 (REVISE)',
        doi: '10.1056/NEJM199803193381203',
        inferredClaim:
          'That preserving gastric acidity with a non-absorbed barrier agent prevents ventilator-associated pneumonia — a mechanistically coherent inference that the trial designed to test it did not confirm',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, and almost entirely staying put',
        laymanDesc:
          'The molecule is too large and too heavily charged for the gut to absorb. Under one twentieth of a dose crosses into the body; the rest travels through and out.',
        molecularDetail:
          'Sucralfate is a basic aluminium salt of sucrose octasulfate. Less than 5% of an oral dose is absorbed, chiefly as free sucrose octasulfate and a small quantity of aluminium. Absorbed sucrose octasulfate is excreted unchanged in urine. There is no hepatic metabolism and no systemic pharmacology to speak of.',
        iconName: 'Package',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Stomach acid turns it into glue',
        laymanDesc:
          'On contact with acid the molecules cross-link into a thick, sticky paste. This only happens in an acidic environment — in a neutral one the material stays inert.',
        molecularDetail:
          'At gastric pH the aluminium hydroxide moieties are released and the polyanionic sucrose octasulfate polymerises into a viscous, adhesive gel. The transformation is pH-dependent and is the reason the drug is inert until it reaches the stomach.',
        iconName: 'Beaker',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The paste sticks to the hole, not to the healthy lining',
        laymanDesc:
          'Raw tissue in an ulcer carries a positive charge that intact lining does not. The negatively charged paste is drawn to it, so it concentrates where the damage is.',
        molecularDetail:
          'The polyanion binds electrostatically to positively charged proteins exposed in the ulcer base — chiefly albumin and fibrinogen in the crater exudate. Tissue autoradiography in animal models shows several-fold greater adherence to ulcerated than to intact mucosa, which is the empirical basis of the selectivity claim.',
        iconName: 'Magnet',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'A physical lid on the wound',
        laymanDesc:
          'The layer keeps acid and the stomach’s protein-digesting enzyme off the exposed tissue. It also soaks up bile salts. None of this changes how much acid the stomach makes.',
        molecularDetail:
          'The adherent gel provides a diffusion barrier against hydrogen ions and pepsin, and adsorbs pepsin and bile salts directly. Local stimulation of prostaglandin E2 and bicarbonate secretion and of epidermal growth factor binding at the ulcer site are additional proposed contributions. Gastric acid output is unaffected.',
        iconName: 'Shield',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And it grabs whatever else is in the stomach',
        laymanDesc:
          'The same stickiness that makes it work catches other tablets. Antibiotics, thyroid tablets, digoxin and several others are absorbed less well if they are in the stomach at the same time.',
        molecularDetail:
          'The label records reduced bioavailability for fluoroquinolones, digoxin, phenytoin, levothyroxine, ketoconazole, warfarin, quinidine and theophylline, attributed to binding in the gastrointestinal tract. The mechanism is adsorption, not enzyme inhibition, so it is invisible to interaction screening built around cytochrome P450.',
        iconName: 'Magnet',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What it heals, and what it lost',
        laymanDesc:
          'It heals duodenal ulcers, which is what it is licensed for. In the trials that compared it with acid suppression it healed less, and in the trial that compared it in the sickest patients more of them bled.',
        molecularDetail:
          'Pooled erosive oesophagitis healing was 39.2% against 28.2% for placebo, 51.9% for H2 blockers and 83.6% for proton pump inhibitors. In 1,200 ventilated patients, clinically important bleeding was 3.8% on sucralfate against 1.7% on ranitidine (RR 0.44, 95% CI 0.21 to 0.92, P=0.02), with no significant difference in pneumonia, ICU mortality or length of stay.',
        iconName: 'CircleSlash',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Canadian Critical Care Trials Group sucralfate against ranitidine',
        phase: 'Phase 4, randomised, blinded, double-dummy, multicentre',
        sampleSize: 1200,
        primaryEndpoint:
          'Clinically important upper gastrointestinal bleeding in patients requiring mechanical ventilation',
        endpointMet: false,
        statisticalPValue:
          '3.8% on sucralfate against 1.7% on ranitidine; relative risk 0.44 (95% CI 0.21 to 0.92) favouring ranitidine, P=0.02',
        unreportedAdverseSignals:
          'Ventilator-associated pneumonia, the endpoint sucralfate was expected to win, was 16.2% against 19.1% (RR 1.18, 95% CI 0.92 to 1.51, P=0.19) — the right direction and not significant. ICU mortality and length of stay were identical.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Chiba pooled analysis of 43 randomised oesophagitis trials',
        phase: 'Meta-analysis of single- and double-blind randomised trials',
        sampleSize: 7635,
        primaryEndpoint: 'Proportion healed at up to 12 weeks, by drug class',
        endpointMet: true,
        statisticalPValue:
          'Sucralfate 39.2% (SD 22.4) against placebo 28.2% (15.6), H2-receptor antagonists 51.9% (17.1) and proton pump inhibitors 83.6% (11.4)',
        unreportedAdverseSignals:
          'The standard deviation on the sucralfate estimate is the widest of the four classes. Oesophagitis is also outside this drug’s United States licence, which covers duodenal ulcer only.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Serum aluminium in ventilated children on sucralfate',
        phase: 'Retrospective clinical study, single paediatric intensive care unit',
        sampleSize: 19,
        primaryEndpoint:
          'Serum aluminium concentration after a median seven days of nasogastric sucralfate',
        endpointMet: true,
        statisticalPValue:
          'No correlation with total dose (P=0.35) or dose per kilogram (P=0.55); higher levels in the nine patients receiving peritoneal dialysis',
        unreportedAdverseSignals:
          'Nineteen patients, retrospective, single centre. It establishes that aluminium accumulates when elimination is impaired, not how often that causes harm.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Clinically important gastrointestinal bleeding 3.8% on sucralfate against 1.7% on ranitidine in 1,200 randomised ventilated patients (RR 0.44, P=0.02)',
        'Ventilator-associated pneumonia 16.2% against 19.1% in the same trial — the predicted direction, not statistically significant',
        'Erosive oesophagitis healed in 39.2% on sucralfate against 28.2% on placebo across 43 pooled randomised trials',
        'Under 5% of an oral dose absorbed, and serum aluminium higher in dialysed than non-dialysed children on the drug',
      ],
      unsupportedInferences: [
        'That preserving gastric acidity prevents ventilator-associated pneumonia — tested in the same 1,200-patient trial and not confirmed',
        'That the duodenal barrier mechanism works identically at every other mucosal surface the drug is applied to off label',
        'That a drug which is not absorbed cannot cause systemic harm; the aluminium it carries is absorbed in small quantity and is not excreted in renal failure',
        'That a drug with no systemic pharmacology has no interactions; it binds at least eight named drug classes in the stomach',
      ],
      whatFailedInitially: [
        'The intensive-care head-to-head against ranitidine, on the endpoint it was being given for',
        'The pneumonia advantage that was the entire argument for using it in that setting',
        'Erosive oesophagitis healing at 39.2%, the lowest of any active drug in the pooled analysis',
        'Aluminium accumulation in renal impairment, which restricts the drug in exactly the population most likely to be prescribed it in hospital',
      ],
      realWorldOutcome: [
        'Approved under NDA 018333 on 30 October 1981, and still the only marketed drug of its kind',
        'Largely displaced from intensive care by the 1998 trial, and from ulcer treatment by the proton pump inhibitors',
        'Now used mostly off label, for radiation proctitis, mucosal injury and bile reflux, on the strength of the chemistry',
        'Only 21 listed generic products, and a supply base thin enough that the suspension has been on shortage lists',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and oral suspension, both intended to act locally in the stomach and duodenum',
      description:
        'The formulation exists to put material in contact with an ulcer, not to get anything into the bloodstream — under 5% of a dose is absorbed. The suspension is used where contact matters more than convenience, including nasogastric administration in hospital and off-label application to the mouth and oesophagus.',
      safetyProfile:
        'The commonest adverse effect is constipation, from the aluminium. The label warns against use in chronic renal failure and dialysis, because absorbed aluminium is not excreted and accumulates, and warns about concurrent aluminium-containing antacids adding to that load. Bezoar formation has been reported, chiefly in critically ill patients on enteral feeds and in premature infants. The drug binds several co-administered medicines in the gut and reduces their absorption. There is essentially no systemic pharmacology, which is both the safety argument for the drug and the reason its harms are the unusual kind: a metal, a physical obstruction, and an interaction that is mechanical rather than metabolic.',
    },
    commonQuestions: [
      {
        q: 'How can a drug work if it is not absorbed?',
        a: 'Because it is not trying to reach anything inside the body. Sucralfate is a sugar molecule carrying eight sulfate groups and complexed with aluminium — large, heavily charged, and almost impossible for the gut to take up. Under one twentieth of a dose crosses the gut wall. When the rest meets stomach acid it cross-links into a thick, sticky paste. Raw protein in the floor of an ulcer carries a positive charge, the paste carries a strong negative one, and so it concentrates over the damaged area and forms a physical lid. It keeps acid and pepsin off the wound while the tissue underneath repairs. Nothing in that sequence needs the drug to enter the bloodstream, which is why it has essentially no systemic side effects and why it must be in the stomach at the same time as the acid to do anything at all.',
      },
      {
        q: 'Why does the hospital not use this for stress ulcers any more?',
        a: 'Because of one trial in 1998. Twelve hundred ventilated patients were randomly assigned to sucralfate or ranitidine, each with a matching placebo by the other route so nobody knew which they were on. Clinically important bleeding occurred in 3.8% on sucralfate against 1.7% on ranitidine — more than twice as many. The counter-argument for sucralfate had always been pneumonia: because it does not raise stomach pH, it should not allow the bacterial overgrowth thought to seed ventilator-associated pneumonia. That was measured in the same patients and came out at 16.2% against 19.1%, in the predicted direction and not statistically significant. So the harm it was supposed to avoid was not clearly avoided, and the bleeding it was supposed to prevent was worse.',
      },
      {
        q: 'Is the aluminium in it dangerous?',
        a: 'It depends entirely on kidney function. Each gram carries roughly 207 mg of aluminium, and under 5% of it is absorbed — a quantity working kidneys clear without difficulty. In chronic renal failure or on dialysis, absorbed aluminium is not excreted and accumulates, and aluminium accumulation in that setting is associated with encephalopathy and bone disease. The label warns against use for exactly this reason. A study of 19 ventilated children found serum aluminium after about a week of the drug was unrelated to how much they had been given but higher in those also receiving peritoneal dialysis, which is the pattern you would expect if elimination rather than absorption is what decides the level. Aluminium-containing antacids taken alongside add to the total.',
      },
      {
        q: 'Does it interact with my other medicines?',
        a: 'Yes, and in a way most interaction checkers will not catch. Ordinary drug interactions happen in the liver, where one drug changes how another is broken down. This one happens in the stomach: a sticky polyanionic gel sitting in the stomach binds other tablets and stops them being absorbed. The label names fluoroquinolone antibiotics, digoxin, phenytoin, levothyroxine, ketoconazole, warfarin, quinidine and theophylline. Because the mechanism is physical, it does not show up in software built around liver enzymes, and because thyroid replacement is a long-term background medicine nobody re-examines, levothyroxine is the one most often missed. Separating the timing generally handles it, and how to do that is a question for the pharmacist.',
      },
      {
        q: 'People use this for mouth ulcers and radiation damage. Is that approved?',
        a: 'No. The United States licence covers short-term treatment of active duodenal ulcer and reduced-dose maintenance after healing. That is the whole indication. Everything else — swished for mouth ulcers, given for radiation proctitis, used for oesophageal injury or bile reflux gastritis — is off-label extrapolation from the chemistry: if it sticks to raw tissue in a duodenum, it should stick to raw tissue anywhere. That is a reasonable expectation and it is not the same as evidence. Randomised trials do exist for several of those uses with mixed results, but the mechanism work behind the drug was done in the stomach and duodenum, and the regulatory record has never been extended.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cook D et al. A comparison of sucralfate and ranitidine for the prevention of upper gastrointestinal bleeding in patients requiring mechanical ventilation. N Engl J Med 1998;338:791-797',
        identifier: '10.1056/NEJM199803193381203',
        kind: 'doi',
      },
      {
        label:
          'Chiba N, De Gara CJ, Wilkinson JM, Hunt RH. Speed of healing and symptom relief in grade II to IV gastroesophageal reflux disease: a meta-analysis. Gastroenterology 1997;112:1798-1810',
        identifier: '10.1053/gast.1997.v112.pm9178669',
        kind: 'doi',
      },
      {
        label:
          'Thorburn K, Samuel M, Smith EA. Aluminum accumulation in critically ill children on sucralfate therapy. Pediatr Crit Care Med 2001;2:247-249',
        identifier: '10.1097/00130478-200107000-00011',
        kind: 'doi',
      },
      {
        label:
          'Cook D et al. Stress ulcer prophylaxis during invasive mechanical ventilation. N Engl J Med 2024;391:9-20 (REVISE), for the ventilator-associated pneumonia comparison against placebo',
        identifier: '10.1056/NEJMoa2404245',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: CARAFATE (sucralfate) tablets, NDA 018333, AbbVie — original approval 30 October 1981',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018333',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: CARAFATE (sucralfate) oral suspension, NDA 019183, AbbVie — approval 16 December 1993',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019183',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 121494085 — sucralfate structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/121494085',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Mesalamine — a molecule whose mechanism is still unsettled after forty years, which works in
  //    ulcerative colitis, does not work in Crohn's disease, and is graded inferior to the cheaper
  //    drug it was invented to replace.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'mesalamine',
    name: 'Mesalamine',
    tradeName: 'Rowasa / Canasa / Asacol / Pentasa / Lialda / Apriso',
    sponsor:
      'Mylan Speciality LP (current US label holder for Rowasa) — the rectal suspension was approved under NDA 019618 on 24 December 1987, and the oral delayed-release formulations followed from 1992',
    targetGene:
      'PPARG is the best-supported candidate and is not established; no target has been confirmed as the one that matters clinically',
    targetProtein:
      'Peroxisome proliferator-activated receptor gamma in colonic epithelial cells — the mechanism with the strongest experimental support, demonstrated in mice and in human colonic biopsy culture rather than in patients',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1987,
    indication:
      'Treatment of mildly to moderately active ulcerative colitis and maintenance of remission. Formulation determines the reach: rectal suspension for distal disease to the splenic flexure, suppository for ulcerative proctitis, and several oral delayed- and extended-release systems for more extensive colonic involvement.',
    patientFriendlyIndication:
      'Ulcerative colitis — inflammation and ulceration of the lining of the large bowel',
    anatomicalSite:
      'The luminal surface of the colonic epithelium — the drug works from the inside of the bowel outward, which is why the formulation decides which part of the colon it reaches',
    conditionContext: {
      conditionExplainer:
        'Ulcerative colitis is continuous inflammation of the lining of the large bowel, always starting at the rectum and extending upward by a variable distance. It causes bloody diarrhoea, urgency and pain, and it runs in relapses and remissions over decades. Crohn’s disease looks similar from the outside and is a different illness: it can affect any part of the gut, in patches, through the full thickness of the wall.',
      whyItMatters:
        'That distinction is the central fact on this page. Mesalamine is the mainstay of mild to moderate ulcerative colitis and has high-certainty randomised evidence behind it. In Crohn’s disease the same drug has been tested repeatedly and does not work, and it is prescribed there anyway.',
      whoTakesThis:
        'Most people with mild to moderate ulcerative colitis, usually for years or for life, because the evidence for maintenance is stronger than the evidence for induction. Also a substantial number of people with Crohn’s disease, where the evidence does not support it.',
      clinicalGoals:
        'The registered endpoints are induction of clinical and endoscopic remission and prevention of relapse. Neither is a count of colectomies or cancers, and the chemoprevention claim frequently attached to this drug is observational.',
    },
    oneSentenceVerdict:
      'The anti-inflammatory half of sulfasalazine, released directly into the colon so the sulfa half that caused the side effects can be left out — probably acting through PPAR-gamma, a mechanism shown in mice and in cultured human biopsies and never confirmed in a patient: it prevents relapse in ulcerative colitis with high-certainty evidence, 37% relapsing against 55% on placebo across 44 trials in 9,967 people, and the same Cochrane reviews grade it inferior to the older sulfasalazine it replaced and find no benefit at all in Crohn’s disease.',
    laymanHowItWorks:
      'Mesalamine is the working half of an older drug called sulfasalazine. In sulfasalazine that half is chained to a sulfa antibiotic, and gut bacteria snap the chain in the colon to release it; the sulfa half was responsible for most of the side effects, so the obvious move was to give the working half on its own. The problem is that on its own it is absorbed high up in the small intestine and never reaches the colon, so every product is an engineering solution to that — coatings that only dissolve at colonic pH, granules that release slowly over hours, enemas and suppositories that go in from the other end. Once it is in contact with inflamed colon lining it damps the inflammation down, though after forty years there is still no agreement on exactly how.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.7953 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 56 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        '5-aminosalicylic acid itself has been a known compound since the nineteenth century and cannot be patented. Every commercial product is therefore a patent on a delivery system rather than on a molecule: a pH-dependent Eudragit coat, ethylcellulose microgranules, a lipophilic-hydrophilic matrix, a delayed-release capsule. That is why the same active substance is sold under six brand names at different prices, and why it remains, at eighty cents a unit, by far the most expensive drug in this file. The Cochrane reviewers put the consequence plainly: considering relative costs, a clinical advantage to using oral 5-ASA in place of sulfasalazine appears unlikely.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The most interesting substitute is the drug mesalamine was designed to improve on. Sulfasalazine costs a fraction as much, and the Cochrane review grades it superior for maintenance with high-certainty evidence and equivalent for induction. Its disadvantage is the sulfapyridine half, which causes nausea, headache and reversible male infertility. Above mesalamine sit corticosteroids for induction and thiopurines and biologics for disease it cannot hold. Nothing sold as a food induces remission in ulcerative colitis.',
      conventionalRx: [
        {
          name: 'Sulfasalazine (Azulfidine)',
          class: 'Azo-bonded conjugate of 5-aminosalicylic acid and sulfapyridine',
          howItCompares:
            'The parent compound, and the comparison mesalamine loses. In the Cochrane maintenance review, 48% of 5-ASA patients relapsed at six to eighteen months against 43% on sulfasalazine — risk ratio 1.14 (95% CI 1.03 to 1.27), graded high-certainty evidence of inferiority. For induction the two were equivalent (RR 0.90, 95% CI 0.77 to 1.04). It costs a small fraction as much.',
          typicalCost:
            'No NADAC value is held on this record for sulfasalazine and none is asserted here',
          prosAndCons:
            'Pros: superior for maintenance on high-certainty evidence, far cheaper, and the only one of the two with an established rheumatological use. Cons: the sulfapyridine half causes nausea, headache, rash and reversible reduction in male fertility, which is why mesalamine was developed.',
        },
        {
          name: 'Budesonide MMX (Uceris)',
          class: 'Locally acting corticosteroid with extensive first-pass metabolism',
          howItCompares:
            'A steroid engineered to act in the colon and then be destroyed by the liver before it reaches the rest of the body. Used for induction where mesalamine has not achieved remission, rather than for maintenance, because steroid exposure over years is not acceptable regardless of first-pass clearance.',
          typicalCost:
            'No NADAC value is held on this record for budesonide MMX and none is asserted here',
          prosAndCons:
            'Pros: more potent for induction than an aminosalicylate. Cons: not a maintenance drug; first-pass metabolism reduces but does not abolish systemic corticosteroid effect.',
        },
        {
          name: 'Azathioprine and mercaptopurine',
          class: 'Thiopurine immunosuppressants',
          howItCompares:
            'A different order of intervention, used when aminosalicylates cannot hold remission or when a patient is steroid-dependent. Weeks to months to take effect, and requires monitoring for marrow suppression and hepatotoxicity, with TPMT or NUDT15 genotyping before starting.',
          typicalCost:
            'No NADAC value is held on this record for azathioprine and none is asserted here',
          prosAndCons:
            'Pros: genuinely steroid-sparing in disease an aminosalicylate cannot control. Cons: systemic immunosuppression, slow onset, mandatory monitoring, and a small increase in lymphoma and skin cancer risk.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask which diagnosis this is being prescribed for',
          action:
            'Establish clearly whether the diagnosis is ulcerative colitis or Crohn’s disease.',
          patientImpact:
            'In ulcerative colitis the evidence for this drug is high-certainty and favourable. In Crohn’s disease the Cochrane review of 20 studies in 2,367 patients concluded that high-dose mesalamine is not more effective than placebo for inducing response or remission, and that low-dose mesalamine and olsalazine are not superior to placebo either.',
          clinicalPrecaution:
            'There are reasons a clinician may still choose it in Crohn’s disease, including tolerability and the limits of the alternatives. Asking what it is expected to do is reasonable; stopping it unilaterally is not.',
        },
        {
          name: 'Ask whether your kidney function is being checked',
          action:
            'Confirm that renal function was measured before starting and is being rechecked periodically.',
          patientImpact:
            'Mesalamine can cause interstitial nephritis, and the label directs that renal function be evaluated before starting and periodically during treatment. The injury is usually reversible if caught early and can be permanent if it is not, and it produces no symptoms until it is advanced.',
          clinicalPrecaution:
            'This is a monitoring question rather than a dosing one. The reason it matters is that the drug is often taken for decades and the harm is silent.',
        },
        {
          name: 'Tell someone if the colitis gets suddenly worse after starting',
          action:
            'Report cramping, bloody diarrhoea and fever that begin or worsen shortly after starting the drug.',
          patientImpact:
            'Mesalamine can cause an acute intolerance syndrome that is difficult to distinguish from a flare of the disease it is treating. The label describes it and it is recognised precisely because the instinct — to increase the dose — makes it worse.',
          clinicalPrecaution:
            'Distinguishing the two requires a clinician. The point is that the possibility exists and is easy to miss.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC(=C(C=C1N)C(=O)O)O',
      chemicalFormula: 'C7H7NO3',
      molecularWeight: '153.14 g/mol',
      targetReceptorAffinity:
        'No clinically validated receptor affinity exists. The best-supported candidate is PPAR-gamma: 5-ASA increases PPAR-gamma expression in epithelial cells, promotes its translocation from cytoplasm to nucleus, and induces a conformational change permitting coactivator recruitment and activation of a peroxisome-proliferator response element. In heterozygous PPAR-gamma knockout mice, 5-ASA lost its benefit in experimental colitis; in wild-type littermates it retained it. Competing accounts — inhibition of cyclooxygenase and lipoxygenase, scavenging of reactive oxygen species, inhibition of NF-kappaB — coexist with it. The molecule is one of the simplest in this file and one of the least mechanistically settled.',
      structureSource: {
        label:
          'PubChem CID 4075 (5-aminosalicylic acid, mesalamine) — canonical SMILES, molecular formula and molecular weight, as ingested onto this record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4075',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mes-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Purity and oxidation state of the aminophenol',
          description:
            'Check for oxidation products before anything else. 5-aminosalicylic acid is an aminophenol and darkens on exposure to air and light as it oxidises to quinone-imine species. A discoloured batch is a partly oxidised one, and the coloured impurities are the ones that matter both for stability and for the drug’s tendency to stain.',
          reagentsAndBuffer:
            '5-aminosalicylic acid reference standard, HPLC with diode-array detection under nitrogen-sparged mobile phase, UV-visible spectrophotometry for coloured degradants, loss on drying',
        },
        {
          id: 'mes-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Reduction of 5-nitrosalicylic acid to the amine',
          description:
            'Reduce the nitro group to the amine. The chemistry is old and cheap — the molecule has been known since the nineteenth century and is unpatentable — and this is exactly why every commercial product is a patent on a delivery system rather than on a synthesis.',
          dependsOnStepId: 'mes-w1',
          reagentsAndBuffer:
            '5-nitrosalicylic acid, catalytic hydrogenation over palladium on carbon or iron in acetic acid, under nitrogen with light exclusion throughout',
        },
        {
          id: 'mes-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation under inert atmosphere and away from light',
          description:
            'Recrystallise with oxygen excluded. Everything about handling this compound is about keeping air off it. The finished crystals are stored protected from light, and the same constraint governs the shelf life of the finished dosage forms, particularly the rectal suspension.',
          dependsOnStepId: 'mes-w2',
          reagentsAndBuffer:
            'Recrystallisation from water or aqueous ethanol under nitrogen, sodium metabisulfite or ascorbate as antioxidant where the formulation permits, amber packaging, HPLC for related substances',
        },
        {
          id: 'mes-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Delivery-system encapsulation, which is the actual invention',
          description:
            'Build the release mechanism. Free 5-ASA is absorbed in the jejunum and never reaches the colon, so every product is an engineered answer to that: a methacrylate coat that dissolves only above pH 7, ethylcellulose microgranules releasing over hours, a lipophilic-hydrophilic matrix, or an azo bond to a carrier that colonic bacteria cleave. This step, not the synthesis, is what distinguishes one branded product from another.',
          dependsOnStepId: 'mes-w3',
          reagentsAndBuffer:
            'Methacrylic acid copolymer types S and L for pH-dependent coats, ethylcellulose for time-dependent microgranules, lipophilic and hydrophilic matrix excipients, coating pan or fluid-bed apparatus with in-process film thickness measurement',
        },
        {
          id: 'mes-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Sequential-pH dissolution, and a PPAR-gamma reporter arm',
          description:
            'Run dissolution through a simulated gastric, then intestinal, then colonic pH sequence and confirm the drug appears where the product claims it appears — the release profile is the product. In parallel, run a PPAR-gamma reporter assay in colonic epithelial cells, because the mechanism most likely to be the operative one is still a hypothesis and belongs in the quantification step rather than in the marketing copy.',
          dependsOnStepId: 'mes-w4',
          reagentsAndBuffer:
            'USP apparatus with sequential media at pH 1.2, 6.8 and 7.2, HPLC quantification at each stage; Caco-2 or HT-29 cells transfected with a peroxisome-proliferator response element luciferase reporter, PPAR-gamma antagonist control arm',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mes-a1',
        category: 'measured',
        title:
          'For keeping ulcerative colitis in remission it works, on high-certainty evidence: 37% relapse against 55%',
        laymanSummary:
          'Pooling 44 randomised trials in nearly ten thousand people, about 37 in a hundred taking mesalamine relapsed within six to twelve months against about 55 in a hundred on placebo. Cochrane graded the certainty of that finding as high, which is the top of their scale and rare.',
        technicalDetails:
          'The Cochrane review identified 44 studies in 9,967 participants, most at low risk of bias. For maintenance of clinical or endoscopic remission, 37% (335 of 907) of 5-ASA participants relapsed at six to twelve months against 55% (355 of 648) of placebo participants — risk ratio 0.68 (95% CI 0.61 to 0.76), 8 studies, 1,555 participants, high-certainty evidence. Serious adverse events were 1% (6 of 550) against 2% (5 of 276), risk ratio 0.60 (95% CI 0.19 to 1.84), low-certainty evidence, and there is probably little or no difference in adverse events overall (RR 0.93, 95% CI 0.73 to 1.18, moderate certainty). Once-daily dosing had a similar benefit and harm profile to conventional two- or three-times-daily dosing.',
        evidenceSource:
          'Murray A et al., Cochrane Database Syst Rev 2020;8:CD000544',
        doi: '10.1002/14651858.CD000544.pub4',
        measuredMetric:
          'Failure to maintain clinical or endoscopic remission at six to twelve months, against placebo, pooled across 44 randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'mes-a2',
        category: 'failed',
        title: 'It is graded inferior to the older, cheaper drug it was invented to replace',
        laymanSummary:
          'Mesalamine exists because sulfasalazine caused side effects from the half of the molecule that does nothing useful. Removing that half also made it work slightly less well. Cochrane rates the inferiority as high-certainty evidence, and points out that once cost is considered the case for the newer drug is hard to make.',
        technicalDetails:
          'In the maintenance review, 48% (416 of 871) of 5-ASA participants relapsed at six to eighteen months against 43% (336 of 784) of sulfasalazine participants — risk ratio 1.14 (95% CI 1.03 to 1.27), 12 studies, 1,655 participants, graded high-certainty evidence of inferiority. For induction, the two were equivalent: 54% (150 of 279) of 5-ASA participants failed to enter remission against 58% (144 of 247) on sulfasalazine, risk ratio 0.90 (95% CI 0.77 to 1.04), moderate certainty. Commonly reported adverse events — flatulence, abdominal pain, nausea, diarrhoea, headache, dyspepsia — showed probably little or no difference between the two. The authors state that considering relative costs, a clinical advantage to using oral 5-ASA in place of sulfasalazine appears unlikely. The counter-argument is real and is not in the pooled numbers: sulfapyridine causes reversible reduction in male fertility, and that matters enormously to some patients and not at all to others.',
        evidenceSource:
          'Murray A et al., Cochrane Database Syst Rev 2020;8:CD000544; Murray A et al., Cochrane Database Syst Rev 2020;8:CD000543',
        doi: '10.1002/14651858.CD000544.pub4',
        measuredMetric:
          'Failure to maintain remission, 5-ASA against sulfasalazine, pooled across 12 randomised trials in 1,655 participants',
        auditFlag: 'contested',
      },
      {
        id: 'mes-a3',
        category: 'failed',
        title: 'It does not work in Crohn’s disease, and it is prescribed there anyway',
        laymanSummary:
          'Twenty randomised trials in 2,367 patients have asked whether aminosalicylates help active Crohn’s disease. High-dose mesalamine was no better than placebo. Low-dose mesalamine was no better than placebo. Sulfasalazine showed a trend and lost to steroids.',
        technicalDetails:
          'The Cochrane review included 20 studies in 2,367 patients, ten at low risk of bias. Sulfasalazine showed a non-significant trend over placebo for inducing remission, with benefit confined mainly to Crohn’s colitis: 45% (63 of 141) entered remission at 17 to 18 weeks against 29% (43 of 148) on placebo, risk ratio 1.38 (95% CI 1.00 to 1.89), two studies, moderate certainty on sparse data. Sulfasalazine was significantly less effective than corticosteroids: 43% (55 of 128) against 60% (79 of 132), risk ratio 0.68 (95% CI 0.51 to 0.91). Olsalazine and low-dose mesalamine at 1 to 2 g daily were not superior to placebo. High-dose mesalamine at 3.2 to 4 g daily was not more effective than placebo for inducing response or remission. Trials of 4 to 4.5 g daily against budesonide yielded conflicting results and no firm conclusion. The authors called for large randomised trials to provide definitive evidence, and none has since arrived.',
        evidenceSource: 'Lim WC et al., Cochrane Database Syst Rev 2016;7:CD008870',
        doi: '10.1002/14651858.CD008870.pub2',
        measuredMetric:
          'Induction of remission or clinical response in mildly to moderately active Crohn’s disease, pooled across 20 randomised trials in 2,367 patients',
        auditFlag: 'verified',
      },
      {
        id: 'mes-a4',
        category: 'inferred',
        title:
          'After forty years the mechanism is a hypothesis supported in mice and cultured biopsies',
        laymanSummary:
          'Nobody has established how this drug works. The best evidence points to a nuclear receptor called PPAR-gamma: mice bred to have less of it stopped responding to the drug, and human bowel tissue in culture behaves the way the theory predicts. Neither of those is a measurement in a patient.',
        technicalDetails:
          'Rousseaux and colleagues induced colitis in heterozygous PPAR-gamma knockout mice and in wild-type littermates and treated both with 5-ASA. The drug was beneficial in wild-type animals and not in heterozygotes. In epithelial cells 5-ASA increased PPAR-gamma expression, promoted translocation from cytoplasm to nucleus, and induced a conformational change permitting coactivator recruitment and activation of a peroxisome-proliferator response element. The findings were validated in organ cultures of human colonic biopsies. That is a strong, mechanistically specific result and it is not evidence in living patients: no trial has stratified response by PPAR-gamma genotype or expression, and competing accounts — cyclooxygenase and lipoxygenase inhibition, reactive-oxygen scavenging, NF-kappaB inhibition — remain in the literature alongside it. A drug in use since the 1980s with high-certainty efficacy evidence and an unsettled mechanism is unusual and worth stating plainly.',
        evidenceSource: 'Rousseaux C et al., J Exp Med 2005;201:1205-1215',
        doi: '10.1084/jem.20041948',
        inferredClaim:
          'That PPAR-gamma agonism is the mechanism by which mesalamine treats ulcerative colitis in humans — demonstrated in a mouse knockout and in cultured human biopsies, never tested in patients',
        auditFlag: 'caution',
      },
      {
        id: 'mes-a5',
        category: 'measured',
        title: 'Once daily works as well as twice daily, in 1,027 randomised patients',
        laymanSummary:
          'A twelve-month trial gave people either the whole daily amount at once or split across two doses. Remission at six months was 90.5% and 91.8% — a difference of just over one percentage point, well within the range of chance. Fewer doses is easier to keep taking.',
        technicalDetails:
          'A multicentre, investigator-blinded, randomised, 12-month, parallel-group non-inferiority study compared 1.6 to 2.4 g of delayed-release mesalamine once daily against the same total split twice daily in 1,027 patients with ulcerative colitis in remission. The percentage remaining in remission at month 6 by the Simple Clinical Colitis Activity Index was 90.5% against 91.8%, a difference of 1.3 percentage points (95% CI -2.3 to 4.9, P=0.5016). At month 3 the figures were 94.8% and 95.6%, difference 0.8 points (95% CI -1.8 to 3.5, P=0.5426). The Cochrane review reached the same conclusion across five studies in 1,761 participants with high-certainty evidence: 60% of once-daily participants failed to enter clinical remission against 61% on conventional dosing (RR 0.99, 95% CI 0.93 to 1.06). This is one of the cleaner adherence results in gastroenterology and it took a 1,027-patient trial to establish something the pharmacology already implied.',
        evidenceSource:
          'Warner Chilcott, once-daily against twice-daily delayed-release mesalamine (NCT00505778), posted results; Murray A et al., Cochrane Database Syst Rev 2020;8:CD000543',
        doi: '10.1002/14651858.CD000543.pub5',
        measuredMetric:
          'Percentage remaining in remission at month 6 by Simple Clinical Colitis Activity Index, once-daily against twice-daily dosing',
        auditFlag: 'verified',
      },
      {
        id: 'mes-a6',
        category: 'failed',
        title: 'It can damage the kidneys silently, and can mimic the flare it is treating',
        laymanSummary:
          'Two harms matter more than the rest. The drug can inflame the kidneys with no symptoms until the damage is advanced, which is why blood tests are meant to be repeated. And it can cause a sudden bout of cramping and bloody diarrhoea that looks exactly like the colitis getting worse — the instinct is to take more, which makes it worse.',
        technicalDetails:
          'The United States labels for mesalamine products carry a Warnings and Precautions instruction to evaluate renal function prior to initiation and periodically during treatment, on the basis of reported renal impairment including minimal change nephropathy, acute and chronic interstitial nephritis and, rarely, renal failure. The injury is typically insidious and asymptomatic until substantial function is lost. Separately, the labels describe an acute intolerance syndrome — cramping, acute abdominal pain, bloody diarrhoea, sometimes fever, headache and rash — that is clinically indistinguishable from an exacerbation of the underlying ulcerative colitis, and that resolves on withdrawal. Hepatic failure has been reported in patients with pre-existing liver disease. Mesalamine-induced cardiac hypersensitivity reactions, myocarditis and pericarditis are also recorded. None of these are common; all are the kind of harm that a decades-long prescription makes worth naming.',
        evidenceSource:
          'Mesalamine United States prescribing information, Warnings and Precautions — renal impairment, mesalamine-induced acute intolerance syndrome, hepatic failure and cardiac hypersensitivity (Rowasa NDA 019618 and the oral delayed-release products)',
        auditFlag: 'caution',
      },
      {
        id: 'mes-a7',
        category: 'inferred',
        title: 'The cancer-prevention claim is observational and has never been randomised',
        laymanSummary:
          'Long-standing ulcerative colitis raises the risk of bowel cancer, and mesalamine is often described as reducing it. That belief comes from observational studies of people who happened to be taking the drug, not from any trial that randomly assigned it and counted cancers.',
        technicalDetails:
          'No randomised controlled trial has tested mesalamine against placebo with colorectal cancer or dysplasia as a primary endpoint. The chemoprevention hypothesis rests on observational cohort and case-control data, which is subject to a specific and severe confounder in this disease: people who take maintenance therapy reliably have better-controlled inflammation, and inflammatory burden is itself the strongest known driver of colitis-associated dysplasia. Separating a direct chemopreventive effect of the molecule from the effect of simply having less inflammation is not possible in an observational design. The Cochrane reviews of this drug do not report cancer as an outcome, because the randomised literature does not contain it. The claim may well be true. It has not been measured the way an efficacy claim in this file is measured.',
        evidenceSource:
          'Murray A et al., Cochrane Database Syst Rev 2020;8:CD000544 and 2020;8:CD000543 — neither review reports colorectal cancer or dysplasia among the outcomes available in the randomised literature',
        doi: '10.1002/14651858.CD000544.pub4',
        inferredClaim:
          'That mesalamine reduces colorectal cancer risk in ulcerative colitis — an observational association inseparable, by design, from the effect of better-controlled inflammation',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The half of an older drug that actually did the work',
        laymanDesc:
          'Sulfasalazine is two molecules chained together: an anti-inflammatory and a sulfa antibiotic. Gut bacteria break the chain in the colon. The anti-inflammatory half is mesalamine, and the sulfa half caused most of the side effects.',
        molecularDetail:
          'Sulfasalazine is 5-aminosalicylic acid joined by an azo bond to sulfapyridine. Colonic bacterial azoreductases cleave the bond, releasing both. The therapeutic activity in inflammatory bowel disease resides in the 5-ASA moiety; sulfapyridine is absorbed systemically and accounts for the nausea, headache, rash, haemolysis and reversible male infertility associated with the parent drug.',
        iconName: 'Scissors',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Given alone, it never reaches the colon',
        laymanDesc:
          'Free mesalamine is absorbed in the small intestine long before it gets anywhere near the diseased bowel. That single fact is why the drug is sold in half a dozen elaborate formulations.',
        molecularDetail:
          'Unformulated 5-ASA is rapidly and almost completely absorbed in the proximal jejunum, acetylated in the intestinal mucosa and liver to N-acetyl-5-ASA, and excreted renally. Systemic 5-ASA has no useful anti-inflammatory effect on the colon: the drug acts topically on the mucosa from the luminal side.',
        iconName: 'ArrowDownToLine',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'The formulation is the invention',
        laymanDesc:
          'Each product is a different engineering answer to the same problem. Some have coats that dissolve only where the bowel becomes less acidic, some release slowly over hours, and some go in from the other end as an enema or suppository.',
        molecularDetail:
          'Delayed-release products use methacrylic acid copolymer coats dissolving above pH 6 or pH 7. Ethylcellulose-coated microgranules release continuously from the duodenum onward. Matrix systems disperse the drug through a lipophilic-hydrophilic vehicle for colonic release. Rectal suspension reaches to the splenic flexure and suppositories treat the rectum. Choice of formulation is choice of anatomical reach, which is why the same molecule has six brand names.',
        iconName: 'Package',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Contact with inflamed lining, by a mechanism still argued about',
        laymanDesc:
          'Once in contact with the inflamed bowel lining it damps down the inflammation. The best-supported explanation involves a nuclear receptor called PPAR-gamma, shown in mice and in human tissue in a dish. It has never been confirmed in a patient.',
        molecularDetail:
          '5-ASA increases PPAR-gamma expression in colonic epithelial cells, drives its nuclear translocation, and induces a conformation permitting coactivator recruitment and PPRE-driven transcription. Heterozygous PPAR-gamma knockout mice lose the benefit that wild-type littermates retain. Competing mechanisms — cyclooxygenase and lipoxygenase inhibition, reactive-oxygen scavenging, NF-kappaB inhibition — remain in the literature and are not excluded.',
        iconName: 'HelpCircle',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'Relapse becomes less likely, in one disease',
        laymanDesc:
          'In ulcerative colitis it cuts the chance of relapsing over the following year from about 55 in a hundred to about 37. In Crohn’s disease, tested repeatedly, it does not beat a dummy tablet.',
        molecularDetail:
          'Pooled maintenance relapse was 37% against 55% on placebo (RR 0.68, 95% CI 0.61 to 0.76, high certainty). In Crohn’s disease, high-dose mesalamine at 3.2 to 4 g daily was not more effective than placebo for inducing response or remission across 20 randomised trials in 2,367 patients. Whether that difference reflects disease depth — colitis is mucosal, Crohn’s is transmural — or the drug’s topical mode of action is a plausible account rather than a demonstrated one.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What it costs, and what the comparison shows',
        laymanDesc:
          'The molecule itself is unpatentable and cheap. The delivery systems are patented and are why this is the most expensive drug on any page in this file. Against sulfasalazine, the drug it was meant to improve on, it is graded inferior for maintenance.',
        molecularDetail:
          'Relapse was 48% on 5-ASA against 43% on sulfasalazine (RR 1.14, 95% CI 1.03 to 1.27, high certainty). The Cochrane authors state that considering relative costs, a clinical advantage to using oral 5-ASA in place of sulfasalazine appears unlikely. The trade the newer drug wins is tolerability, not efficacy, and for men concerned about fertility that trade is decisive.',
        iconName: 'CircleSlash',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane CD000544: oral 5-ASA for maintenance of remission in ulcerative colitis',
        phase: 'Systematic review and meta-analysis of 44 randomised trials',
        sampleSize: 9967,
        primaryEndpoint: 'Failure to maintain clinical or endoscopic remission at six months or more',
        endpointMet: true,
        statisticalPValue:
          'Relapse 37% (335 of 907) against 55% (355 of 648) on placebo; risk ratio 0.68 (95% CI 0.61 to 0.76), 8 studies, 1,555 participants, high-certainty evidence',
        unreportedAdverseSignals:
          'The same review grades 5-ASA inferior to sulfasalazine for maintenance with high-certainty evidence (RR 1.14, 95% CI 1.03 to 1.27), which is rarely quoted alongside the placebo comparison.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane CD000543: oral 5-ASA for induction of remission in ulcerative colitis',
        phase: 'Systematic review and meta-analysis of 54 randomised trials',
        sampleSize: 9612,
        primaryEndpoint: 'Failure to enter clinical remission in active ulcerative colitis',
        endpointMet: true,
        statisticalPValue:
          '71% (1,107 of 1,550) of 5-ASA participants failed to enter remission against 83% (695 of 837) on placebo; risk ratio 0.86 (95% CI 0.82 to 0.89), 11 studies, 2,387 participants, high-certainty evidence',
        unreportedAdverseSignals:
          'The absolute numbers are worth reading directly: even on active treatment, seven in ten patients did not enter clinical remission. This is a modest effect measured precisely, not a large one.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane CD008870: aminosalicylates for induction in Crohn’s disease',
        phase: 'Systematic review and meta-analysis of 20 randomised trials',
        sampleSize: 2367,
        primaryEndpoint:
          'Induction of remission or clinical response in mildly to moderately active Crohn’s disease',
        endpointMet: false,
        statisticalPValue:
          'High-dose mesalamine at 3.2 to 4 g daily not more effective than placebo; low-dose mesalamine and olsalazine not superior to placebo; sulfasalazine 45% against 29% on placebo (RR 1.38, 95% CI 1.00 to 1.89) and inferior to corticosteroids (RR 0.68, 95% CI 0.51 to 0.91)',
        unreportedAdverseSignals:
          'Eight of the 20 studies were at high risk of bias from incomplete outcome data and potential selective reporting. The authors called for definitive large trials, and none has been published in the decade since.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Once-daily against twice-daily delayed-release mesalamine (NCT00505778)',
        phase: 'Phase 3, randomised, investigator-blinded, 12-month non-inferiority',
        sampleSize: 1027,
        primaryEndpoint:
          'Percentage of patients remaining in remission at month 6 by the Simple Clinical Colitis Activity Index',
        endpointMet: true,
        statisticalPValue:
          '90.5% once daily against 91.8% twice daily; difference 1.3 percentage points (95% CI -2.3 to 4.9), P=0.5016',
        unreportedAdverseSignals:
          'Investigator-blinded rather than double-blind, and industry-sponsored. The result is nonetheless corroborated by the Cochrane pooled analysis of five studies in 1,761 participants at high certainty.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Relapse of ulcerative colitis 37% against 55% on placebo across 44 randomised trials in 9,967 participants (RR 0.68, high-certainty evidence)',
        'Failure to induce remission 71% against 83% on placebo across 54 randomised trials in 9,612 participants (RR 0.86, high-certainty evidence)',
        'Relapse 48% on 5-ASA against 43% on sulfasalazine (RR 1.14, 95% CI 1.03 to 1.27) — graded high-certainty evidence of inferiority',
        'Remission at six months 90.5% on once-daily against 91.8% on twice-daily dosing in 1,027 randomised patients (P=0.50)',
      ],
      unsupportedInferences: [
        'That mesalamine treats Crohn’s disease — 20 randomised trials in 2,367 patients found high-dose mesalamine no better than placebo',
        'That PPAR-gamma agonism is the operative mechanism in patients, shown in a mouse knockout and in cultured human biopsies and never tested clinically',
        'That mesalamine prevents colorectal cancer in colitis, an observational association inseparable from the effect of controlling inflammation',
        'That the newer, more expensive drug improved on the older one; it improved tolerability and lost efficacy',
      ],
      whatFailedInitially: [
        'Crohn’s disease, repeatedly and across every dose tested',
        'The comparison against sulfasalazine for maintenance, graded high-certainty inferiority',
        'Even at its best, seven in ten patients on active treatment did not enter clinical remission in the pooled induction analysis',
        'Interstitial nephritis and an acute intolerance syndrome that mimics a colitis flare, both label-recorded, both easy to miss',
      ],
      realWorldOutcome: [
        'The rectal suspension was approved under NDA 019618 in December 1987 and the oral delayed-release forms followed from 1992',
        'Now the first-line maintenance treatment for mild to moderate ulcerative colitis worldwide',
        'Sold under at least six brand names that differ in delivery system rather than in active substance, and priced accordingly',
        'The most expensive drug in this file at pharmacy acquisition cost, for a molecule known since the nineteenth century',
      ],
    },
    deliverySystem: {
      type: 'Oral delayed-release tablet, extended-release capsule, controlled-release microgranule capsule, rectal suspension enema, and rectal suppository',
      description:
        'The delivery system is the drug’s entire design problem. Free 5-aminosalicylic acid is absorbed in the small intestine and never reaches the colon, so each product engineers a different route to the target: pH-dependent methacrylate coats, time-dependent ethylcellulose microgranules, matrix systems, or rectal administration. Formulation therefore determines anatomical reach — a suppository treats the rectum, an enema reaches to the splenic flexure, and an oral delayed-release product is required for more extensive disease.',
      safetyProfile:
        'The labels direct that renal function be evaluated before starting and periodically during treatment, because of reported minimal change nephropathy, acute and chronic interstitial nephritis and rarely renal failure — harms that are usually silent until advanced. A mesalamine-induced acute intolerance syndrome of cramping, abdominal pain, bloody diarrhoea and sometimes fever, headache and rash can be indistinguishable from a flare of the disease. Hepatic failure has been reported in patients with pre-existing liver disease, and cardiac hypersensitivity reactions including myocarditis and pericarditis are recorded. Commonest adverse effects in trials are headache, abdominal pain, nausea, flatulence and diarrhoea, at rates similar to placebo.',
    },
    commonQuestions: [
      {
        q: 'Why are there so many different brands of the same drug?',
        a: 'Because the active substance cannot be patented and the packaging can. 5-aminosalicylic acid has been a known chemical since the nineteenth century. Its problem is that, taken plainly, it is absorbed in the small intestine and never arrives at the colon where the disease is. Every product on the market is a different engineered answer to that: a coat that only dissolves above a particular pH, microgranules that release slowly over hours, a matrix that disperses the drug through the colon, an enema, a suppository. Those delivery systems are patentable and are what the brand names refer to. It is also why the formulation matters clinically — a suppository treats the rectum, an enema reaches about as far as the splenic flexure, and extensive disease needs an oral product.',
      },
      {
        q: 'Is it better than sulfasalazine?',
        a: 'For maintenance, the evidence says no, and Cochrane grades that finding as high certainty — their top rating. Across 12 trials in 1,655 people, 48% relapsed on mesalamine against 43% on sulfasalazine, a risk ratio of 1.14 with a confidence interval that excludes no difference. For inducing remission the two were equivalent. Commonly reported side effects were similar. The reviewers went further and wrote that considering relative costs, a clinical advantage to using oral 5-ASA in place of sulfasalazine appears unlikely. What the pooled numbers do not capture is the specific harm mesalamine avoids: sulfapyridine causes reversible reduction in male fertility. For a man planning a family that is not a minor consideration, and it is a real reason to choose the drug that performs slightly worse.',
        auditNote:
          'The comparison that made mesalamine’s reputation was against placebo. The comparison against the drug it replaced is less often quoted and less flattering.',
      },
      {
        q: 'I have Crohn’s disease and I am taking this. Does it work?',
        a: 'The randomised evidence says no, and it is not a close call. The Cochrane review pooled 20 trials in 2,367 patients with mildly to moderately active Crohn’s disease. High-dose mesalamine, at 3.2 to 4 grams a day, was not more effective than placebo for inducing either response or remission. Low-dose mesalamine and olsalazine were not superior to placebo either. Sulfasalazine showed a trend over placebo, mainly in people whose Crohn’s affected the colon, and lost outright to corticosteroids. The authors called for definitive large trials and none has appeared in the decade since. Clinicians still prescribe it, partly because it is well tolerated and partly because the alternatives carry more risk. That is a defensible reason to accept a drug that probably does nothing, and it is worth knowing which one you are being given.',
      },
      {
        q: 'How does it actually work?',
        a: 'Honestly, nobody is certain, and that is unusual for a drug in daily use since the 1980s with high-certainty efficacy evidence behind it. The best-supported account involves PPAR-gamma, a nuclear receptor in the cells lining the colon. In a 2005 experiment, mice bred to have half the normal amount of PPAR-gamma stopped responding to the drug while their normal littermates kept responding, and in human bowel biopsies grown in culture the drug pushed PPAR-gamma into the nucleus and switched on the genes the theory predicts. That is strong, specific evidence — in mice and in tissue in a dish. Nobody has tested whether a patient’s PPAR-gamma genotype or expression predicts response. Older explanations involving prostaglandin pathways, free-radical scavenging and NF-kappaB are all still in the literature and none has been ruled out.',
      },
      {
        q: 'Does it prevent bowel cancer?',
        a: 'It is often said to, and no trial has tested it. Long-standing ulcerative colitis does raise colorectal cancer risk, and observational studies of patients taking mesalamine have reported lower rates. The problem with those studies is structural rather than statistical: people who take maintenance therapy consistently have better-controlled inflammation, and inflammation is the strongest known driver of colitis-associated cancer. No observational design can separate a chemopreventive effect of the molecule from the effect of simply having a quieter colon. No randomised trial has ever used cancer or dysplasia as a primary endpoint here, which is why neither Cochrane review reports it. The claim may well be true. It sits in a different evidence class from the relapse-prevention figure on this page, and this record keeps them apart.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Murray A et al. Oral 5-aminosalicylic acid for maintenance of remission in ulcerative colitis. Cochrane Database Syst Rev 2020;8:CD000544',
        identifier: '10.1002/14651858.CD000544.pub4',
        kind: 'doi',
      },
      {
        label:
          'Murray A et al. Oral 5-aminosalicylic acid for induction of remission in ulcerative colitis. Cochrane Database Syst Rev 2020;8:CD000543',
        identifier: '10.1002/14651858.CD000543.pub5',
        kind: 'doi',
      },
      {
        label:
          'Lim WC et al. Aminosalicylates for induction of remission or response in Crohn’s disease. Cochrane Database Syst Rev 2016;7:CD008870',
        identifier: '10.1002/14651858.CD008870.pub2',
        kind: 'doi',
      },
      {
        label:
          'Rousseaux C et al. Intestinal antiinflammatory effect of 5-aminosalicylic acid is dependent on peroxisome proliferator-activated receptor-gamma. J Exp Med 2005;201:1205-1215',
        identifier: '10.1084/jem.20041948',
        kind: 'doi',
      },
      {
        label:
          'Once-daily against twice-daily delayed-release mesalamine in ulcerative colitis remission, 12-month non-inferiority, posted results',
        identifier: 'NCT00505778',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: ROWASA (mesalamine) rectal suspension enema, NDA 019618, Mylan Speciality LP — original approval 24 December 1987',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019618',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: ASACOL (mesalamine) delayed-release tablets, NDA 019651 — original approval 31 January 1992',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019651',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 4075 — mesalamine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4075',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
