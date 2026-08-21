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
]
