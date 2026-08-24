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
  // ---------------------------------------------------------------------------------------------
  // 1. Ondansetron — the drug that made chemotherapy survivable to sit through, licensed against a
  //    historical placebo, and the only antiemetic here whose own thorough QT study cost it a dose.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ondansetron',
    name: 'Ondansetron',
    tradeName: 'Zofran / Zofran ODT / Zuplenz',
    sponsor:
      'Glaxo — developed as GR 38032F and approved in the United States as Zofran injection under NDA 020007 on 4 January 1991, with the tablet following under NDA 020103 in December 1992; both applications are now held by Sandoz and the drug is dispensed almost entirely as generics, 95 of them listed in the pricing survey on this record',
    targetGene: 'HTR3A and HTR3B — the subunit genes of the human 5-HT3 receptor',
    targetProtein:
      '5-hydroxytryptamine type 3 (5-HT3) receptor, a serotonin-gated cation channel, on vagal afferent terminals in the gut wall and in the area postrema',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1991,
    indication:
      'Prevention of nausea and vomiting associated with initial and repeat courses of emetogenic cancer chemotherapy, including high-dose cisplatin; prevention of nausea and vomiting associated with radiotherapy; and prevention of postoperative nausea and vomiting',
    patientFriendlyIndication:
      'Being sick, or feeling sick, after chemotherapy, radiotherapy or an operation',
    anatomicalSite:
      'Vagal afferent nerve endings in the wall of the small intestine, and the chemoreceptor trigger zone in the area postrema of the brainstem — the one part of the vomiting circuit that sits outside the blood-brain barrier',
    conditionContext: {
      conditionExplainer:
        'Vomiting is a reflex, not a symptom. A circuit in the brainstem receives signals from four places — the gut, the balance organs of the inner ear, the higher brain, and a small patch of brainstem tissue that samples the bloodstream directly — and when enough of them fire together the reflex runs. Cytotoxic chemotherapy damages the lining of the small intestine, and the damaged cells dump serotonin onto the vagus nerve, which is the gut half of that circuit.',
      whyItMatters:
        'Before 1990 the standard antiemetic for cisplatin was high-dose metoclopramide, which worked partially and caused movement disorders. More than 90% of patients given cisplatin without an antiemetic vomit. Blocking one receptor removed most of the vomiting in the first day and changed what a patient could reasonably be asked to go through.',
      whoTakesThis:
        'People having chemotherapy or radiotherapy, people recovering from surgery, and — far more often than any of those, and outside the licence in most countries — people who have arrived at an emergency department feeling sick, or who are pregnant and vomiting.',
      clinicalGoals:
        'The trial endpoint is zero emetic episodes and no rescue medication in a fixed window. Nausea is measured separately and does not respond as well, which is the single most useful thing to know about this drug.',
    },
    oneSentenceVerdict:
      'A selective blocker of the serotonin-gated 5-HT3 channel on the vagus nerve that stops the gut telling the brainstem to vomit — 70% of patients on cyclophosphamide-based chemotherapy did not vomit at all against 0% on placebo in the first randomised trial, and 61% against 6% in the label’s placebo-controlled study, but the highly-emetogenic registration trials had no concurrent placebo arm, and its own cardiac study later cost it its highest intravenous dose.',
    laymanHowItWorks:
      'Chemotherapy damages the lining of the small intestine, and the damaged cells release serotonin. The serotonin lands on the vagus nerve, which runs from the gut to the brainstem, and the message the brainstem receives is: vomit. Ondansetron plugs the specific serotonin receptor on that nerve, so the message is never sent. It does nothing to the chemotherapy and nothing to the damage — it cuts one wire in the alarm system.',
    auditConfidence: 'High Confidence',
    confidenceScore: 82,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        '$0.1208 per unit, median across 95 listed products, United States pharmacy acquisition cost (CMS NADAC, generic, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Zofran was one of the largest-selling drugs in the world in the 1990s and the brand is now a footnote: the record carries 95 separately listed generic products, and the median acquisition price is twelve cents a unit. Ondansetron is on the WHO Model List of Essential Medicines. The interesting regulatory event in its life was not a patent expiry but a dose withdrawal — the single 32 mg intravenous dose was removed from the label after the manufacturer’s own thorough QT study, which is the audit below.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Which alternative is reasonable depends entirely on why the person is being sick, and the honest answer in the emergency department is that no drug in this class beat saline in the Cochrane review. For chemotherapy the comparison is different and the evidence is much stronger: ondansetron is a backbone that other classes are added to, not replaced by.',
      conventionalRx: [
        {
          name: 'Metoclopramide',
          class: 'Dopamine D2 antagonist with 5-HT4 agonism and, at high dose, 5-HT3 blockade',
          howItCompares:
            'The drug ondansetron displaced for chemotherapy. In the emergency department the two are indistinguishable: in a three-arm randomised trial of 258 adults the mean fall in nausea score at 30 minutes was 28 mm for metoclopramide, 27 mm for ondansetron and 23 mm for saline placebo, with no significant difference between any pair.',
          typicalCost:
            '$0.0438 per unit, United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: about a third of the price, and it also empties the stomach, which ondansetron does not. Cons: a boxed warning for tardive dyskinesia and a 12-week ceiling on treatment duration; ondansetron has neither.',
        },
        {
          name: 'Prochlorperazine',
          class: 'Phenothiazine dopamine D2 antagonist',
          howItCompares:
            'Older, cheaper and, in one randomised postoperative comparison of 78 joint-replacement patients, associated with significantly less postoperative nausea and less rescue medication than intravenous ondansetron. It is also the one drug in this group with a randomised win over sumatriptan in acute migraine.',
          typicalCost:
            '$0.1688 per unit, United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: broader receptor coverage, better in migraine, no QT signal of the kind ondansetron carries. Cons: akathisia in 36% of patients given 10 mg intravenously in a randomised trial, and the whole antipsychotic class warning set including tardive dyskinesia.',
        },
        {
          name: 'Aprepitant',
          class: 'Neurokinin-1 (substance P) receptor antagonist',
          howItCompares:
            'Not a substitute — an addition. Adding aprepitant to ondansetron and dexamethasone raised five-day complete response from 52.3% to 72.7% in 520 patients on high-dose cisplatin, almost all of the gain falling in the delayed phase where ondansetron does least.',
          typicalCost:
            '$76.85 per unit, United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: covers days 2 to 5, which 5-HT3 blockade does not. Cons: roughly six hundred times the unit price; a CYP3A4 inhibitor and inducer that reduces hormonal contraceptive efficacy for 28 days after the last dose.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask whether the intravenous fluid on its own is the treatment',
          action:
            'In an undifferentiated emergency-department presentation, ask what the drug is expected to add over the saline it is being given in.',
          patientImpact:
            'In the Cochrane review of eight trials and 952 participants, placebo groups routinely reported clinically significant improvement, and no drug except droperidol in a single 48-patient trial was statistically superior to placebo at 30 minutes. The reviewers concluded that supportive treatment such as intravenous fluid may be sufficient for the majority of people.',
          clinicalPrecaution:
            'This applies to undifferentiated nausea in the emergency department. It does not apply to chemotherapy-induced or postoperative vomiting, where the randomised evidence for 5-HT3 blockade is strong and separate.',
        },
        {
          name: 'Say what else you take that affects serotonin',
          action:
            'Name any SSRI, SNRI, tramadol, fentanyl, lithium, mirtazapine or MAO inhibitor before the dose.',
          patientImpact:
            'The label records serotonin syndrome with 5-HT3 antagonists alone, and more often with concomitant serotonergic drugs. Some of the reported cases were fatal, and most occurred in a recovery room or an infusion centre — settings where a patient is unlikely to be asked.',
          clinicalPrecaution:
            'The label also advises avoiding ondansetron in congenital long QT syndrome, and ECG monitoring where potassium or magnesium is low, in heart failure, in bradyarrhythmia, or alongside other QT-prolonging drugs.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=NC=CN1CC2CCC3=C(C2=O)C4=CC=CC=C4N3C',
      chemicalFormula: 'C18H19N3O',
      molecularWeight: '293.40 g/mol',
      targetReceptorAffinity:
        'A selective antagonist at the 5-HT3 receptor. The label states that ondansetron has no effect on plasma prolactin concentrations, no effect on oesophageal or gastric motility, lower oesophageal sphincter pressure or small-bowel transit at a single 0.15 mg/kg intravenous dose, and that multiday administration slows colonic transit — the pharmacological signature of a drug that is doing one thing rather than several.',
      structureSource: {
        label:
          'PubChem — canonical SMILES, molecular formula and monoisotopic weight for ondansetron, as pulled by this repository’s ingestion pipeline and accepted by its structure parser',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4595',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ond-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity, purity and racemic composition of the carbazolone core',
          description:
            'Confirm the tetrahydrocarbazolone skeleton and the N-methylimidazole substituent before any receptor work. Ondansetron carries one stereocentre at position 3 of the carbazolone ring and is supplied as the racemate; a batch enriched in one enantiomer is a different pharmacological object from the marketed drug and would silently shift every affinity number downstream.',
          reagentsAndBuffer:
            'Ondansetron hydrochloride dihydrate reference standard, reversed-phase HPLC with ultraviolet detection at 216 nm, chiral stationary-phase HPLC to confirm the racemate, 1H NMR in DMSO-d6, Karl Fischer titration for the dihydrate water',
        },
        {
          id: 'ond-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Mannich alkylation to attach the imidazole arm',
          description:
            'Couple 1,2,3,9-tetrahydro-9-methyl-4H-carbazol-4-one to 2-methylimidazole under Mannich conditions. This is the bond that makes the molecule a 5-HT3 ligand rather than an inert tricycle: the imidazole nitrogen is the basic centre that mimics the protonated primary amine of serotonin in the receptor pocket.',
          dependsOnStepId: 'ond-w1',
          reagentsAndBuffer:
            'Tetrahydrocarbazolone intermediate, 2-methylimidazole, formaldehyde or a preformed Mannich base, dimethylformamide or acetic acid, nitrogen atmosphere',
        },
        {
          id: 'ond-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Salt formation and crystallisation as the hydrochloride dihydrate',
          description:
            'Convert the free base to the hydrochloride and crystallise the dihydrate. The marketed solid is a specific hydrate, not the anhydrous salt, and the water of crystallisation is part of the specification; a different hydrate changes dissolution and therefore the plasma curve the QT analysis below was built on.',
          dependsOnStepId: 'ond-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol, water-ethanol recrystallisation, differential scanning calorimetry and powder X-ray diffraction to confirm the dihydrate form',
        },
        {
          id: 'ond-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Whole-cell patch clamp on a heterologous 5-HT3A channel',
          description:
            'Express the human 5-HT3A subunit in a cell line that has none of its own, apply serotonin to open the channel, and measure how much of the inward current the compound removes. The 5-HT3 receptor is an ion channel rather than a G-protein-coupled receptor, so a binding assay alone does not establish that the channel stays shut.',
          dependsOnStepId: 'ond-w3',
          reagentsAndBuffer:
            'HEK293 cells stably expressing human HTR3A, extracellular solution at pH 7.4 with 140 mM NaCl and 2 mM CaCl2, intracellular caesium chloride pipette solution, rapid serotonin application by piezo-driven perfusion',
        },
        {
          id: 'ond-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'hERG counter-screen and concentration-QTc modelling',
          description:
            'Measure block of the hERG potassium channel on the same rig, then build the exposure-response relationship that the label reports. This step exists because of what it found: a significant relationship between ondansetron concentration and QTcF prolongation, which is why the 32 mg intravenous dose no longer exists.',
          dependsOnStepId: 'ond-w4',
          reagentsAndBuffer:
            'HEK293 or CHO cells expressing hERG (KCNH2), step-ramp voltage protocol from -80 mV, positive control moxifloxacin, plasma concentration-QTcF pairs from the 58-subject crossover study reported in the label',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ond-a1',
        category: 'measured',
        title: 'Placebo-controlled from the start: 70% did not vomit against 0% on placebo',
        laymanSummary:
          'In the first randomised trial, every single patient given a dummy injection before cyclophosphamide chemotherapy vomited. Seven in ten given ondansetron did not vomit at all.',
        technicalDetails:
          'Cubeddu and colleagues randomised patients receiving cyclophosphamide 500 to 600 mg/m2, mostly for breast cancer and mostly in combination with doxorubicin or fluorouracil, to three intravenous doses of ondansetron 0.15 mg/kg or to placebo, double-blind. All placebo-treated patients vomited; 70% of ondansetron-treated patients did not (P = .008). Median nausea score was 8 mm on ondansetron against 65 mm on placebo (P < .001). Seventy per cent on ondansetron retained normal appetite against 10% on placebo. Adverse events occurred in six placebo patients and one ondansetron patient, and there were no extrapyramidal reactions — the point of the whole exercise, since the drug it was replacing was high-dose metoclopramide.',
        evidenceSource:
          'Cubeddu LX, Hoffmann IS, Fuenmayor NT, Finn AL. Antagonism of serotonin S3 receptors with ondansetron prevents nausea and emesis induced by cyclophosphamide-containing chemotherapy regimens. J Clin Oncol 1990;8:1721-1727 (PMID 2145400)',
        doi: '10.1200/JCO.1990.8.10.1721',
        measuredMetric:
          'Proportion of patients with zero emetic episodes, and median nausea visual analogue score, against concurrent double-blind placebo',
        auditFlag: 'verified',
      },
      {
        id: 'ond-a2',
        category: 'inferred',
        title:
          'The cisplatin registration trials had no placebo arm — the comparison was to a historical control',
        laymanSummary:
          'For the hardest chemotherapy, the trials that supported approval did not include a group given nothing. The drug was compared against what patients had been recorded doing in earlier studies. That is a weaker design than it sounds, and the label says so.',
        technicalDetails:
          'The label states that in two randomised double-blind monotherapy trials, a single 24 mg oral dose was superior to a "relevant historical placebo control" for chemotherapy including cisplatin at 50 mg/m2 or more, and that steroids were excluded from those trials. The first compared 24 mg once, 8 mg twice and 32 mg once in 357 adults: 66%, 55% and 55% respectively completed 24 hours with zero emetic episodes and no rescue. The justification offered for the historical comparator is that more than 90% of patients receiving cisplatin at that dose vomit without any antiemetic — which is true, and is an argument that a placebo arm was unnecessary, not evidence that one was run. The concurrent placebo comparison in the same label sits in the moderately emetogenic section: 33 patients on ondansetron against 34 on placebo, 61% against 6% with zero emetic episodes, P < 0.001.',
        evidenceSource:
          'Ondansetron United States prescribing information, section 14.1 Prevention of Chemotherapy-Induced Nausea and Vomiting (openFDA drug/label record, DailyMed set id 00327696-c496-4c83-a63e-9e29fd6246d4)',
        inferredClaim:
          'That the 66% response rate in highly emetogenic chemotherapy is a placebo-controlled effect size — it is a single-arm rate benchmarked against historical data, and the two 5-HT3 dosing regimens tested alongside it are no longer recommended',
        auditFlag: 'caution',
      },
      {
        id: 'ond-a3',
        category: 'conclusion_shift',
        title: 'The manufacturer’s own QT study removed the 32 mg intravenous dose',
        laymanSummary:
          'The highest intravenous dose had been in the label for two decades. A dedicated heart-rhythm study found it stretched the heart’s electrical cycle by about 20 milliseconds, and that dose was taken off the label. The same study found the 8 mg dose did not.',
        technicalDetails:
          'A double-blind, single-dose, placebo- and positive-controlled crossover trial in 58 healthy subjects measured QTcF after 15-minute infusions. The maximum mean (95% upper confidence bound) difference from placebo after baseline correction was 19.5 (21.8) milliseconds for 32 mg and 5.6 (7.4) milliseconds for 8 mg. A significant exposure-response relationship between ondansetron concentration and delta-delta QTcF was identified; modelling from it predicted 14 (16.3) milliseconds for 24 mg and 9.1 (11.2) milliseconds for 16 mg. The label now states that the 8 mg dose infused over 15 minutes did not prolong the QT interval to any clinically relevant extent, and the single 32 mg intravenous dose is no longer a recommended regimen anywhere in the label. Postmarketing cases of torsade de pointes are recorded.',
        evidenceSource:
          'Ondansetron United States prescribing information, section 12.2 Pharmacodynamics — Cardiac Electrophysiology, and section 5.2 QT Prolongation (openFDA drug/label record, DailyMed set id 00327696-c496-4c83-a63e-9e29fd6246d4)',
        measuredMetric:
          'Maximum mean placebo-corrected, baseline-adjusted QTcF change after a 15-minute infusion, 58 healthy subjects',
        auditFlag: 'verified',
      },
      {
        id: 'ond-a4',
        category: 'failed',
        title: 'In the emergency department it did not beat saline',
        laymanSummary:
          'For people who arrive at hospital feeling sick for no established reason — which is how the drug is most often used — a randomised trial and then a Cochrane review found it no better than salt water.',
        technicalDetails:
          'Egerton-Warburton and colleagues randomised 270 adults with undifferentiated emergency-department nausea and vomiting across two Melbourne hospitals to 4 mg intravenous ondansetron, 20 mg intravenous metoclopramide, or saline placebo; 258 were analysable. Mean fall in the 100 mm nausea visual analogue scale at 30 minutes was 27 mm (95% CI 22 to 33) for ondansetron, 28 mm (22 to 34) for metoclopramide and 23 mm (16 to 30) for placebo. Satisfaction was 54.1%, 61.6% and 59.5% respectively. The Cochrane review that followed pooled eight trials and 952 participants; against placebo at 30 minutes the mean difference was -4.32 mm (95% CI -11.20 to 2.56) for ondansetron and -5.27 mm (-11.33 to 0.80) for metoclopramide. Only droperidol, in one 48-patient trial, was statistically superior to placebo. The reviewers concluded that intravenous fluid alone may be sufficient for most people.',
        evidenceSource:
          'Egerton-Warburton D, Meek R, Mee MJ, Braitberg G. Ann Emerg Med 2014;64:526-532 (PMID 24818542); Furyk JS, Meek RA, Egerton-Warburton D. Cochrane Database Syst Rev 2015;9:CD010106 (PMID 26411330)',
        doi: '10.1016/j.annemergmed.2014.03.017',
        measuredMetric:
          'Mean change in 100 mm nausea visual analogue scale at 30 minutes against saline placebo',
        auditFlag: 'verified',
      },
      {
        id: 'ond-a5',
        category: 'measured',
        title: 'In children with gastroenteritis it halved the drip rate',
        laymanSummary:
          'One dose given to a vomiting, dehydrated child in the emergency department cut vomiting during oral rehydration from 35% to 14% and roughly halved the proportion who needed a drip. It did not change how many were admitted.',
        technicalDetails:
          'Freedman and colleagues randomised 215 children aged 6 months to 10 years with gastroenteritis and dehydration to a single orally disintegrating ondansetron tablet or placebo, double-blind, with standardised oral rehydration. Vomiting during rehydration: 14% against 35% (RR 0.40, 95% CI 0.26 to 0.61). Mean emetic episodes per child 0.18 against 0.65 (P < 0.001). Oral intake 239 mL against 196 mL (P = 0.001). Intravenous rehydration 14% against 31% (RR 0.46, 95% CI 0.26 to 0.79). Emergency-department stay fell 12% (P = 0.02). Hospital admission was 4% against 5% (P = 1.00) and return visits 19% against 22% (P = 0.73) — neither moved.',
        evidenceSource:
          'Freedman SB, Adler M, Seshadri R, Powell EC. Oral ondansetron for gastroenteritis in a pediatric emergency department. N Engl J Med 2006;354:1698-1705 (PMID 16625009)',
        doi: '10.1056/NEJMoa055119',
        measuredMetric:
          'Proportion vomiting during oral rehydration, and proportion requiring intravenous rehydration, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'ond-a6',
        category: 'conclusion_shift',
        title:
          'The pregnancy signal narrowed from "birth defects" to one small absolute increase in cleft palate',
        laymanSummary:
          'Ondansetron is used very widely for sickness in pregnancy, off-licence, and for years the safety question was open. The largest study, of 1.8 million pregnancies, found no increase in heart defects or in birth defects overall, and a small increase in cleft lip and palate: about three extra cases per ten thousand births.',
        technicalDetails:
          'Huybrechts and colleagues ran a retrospective cohort nested in the 2000-2013 Medicaid Analytic eXtract: 1,816,414 pregnancies, of which 88,467 (4.9%) had first-trimester ondansetron dispensing, with propensity-score stratification for indication and confounders. Cardiac malformations: absolute risk 94.4 per 10,000 exposed (95% CI 88.0 to 100.8) against 84.4 unexposed (83.0 to 85.7); adjusted RR 0.99 (0.93 to 1.06), adjusted risk difference -0.8 per 10,000 (-7.3 to 5.7). Any congenital malformation: adjusted RR 1.01 (0.98 to 1.05). Oral clefts: 14.0 per 10,000 exposed (11.6 to 16.5) against 11.1 unexposed (10.6 to 11.6); adjusted RR 1.24 (1.03 to 1.48), adjusted risk difference 2.7 per 10,000 (0.2 to 5.2). A companion analysis of intravenous exposure was published by the same group in JAMA in 2020.',
        evidenceSource:
          'Huybrechts KF, Hernández-Díaz S, Straub L, Gray KJ, et al. Association of maternal first-trimester ondansetron use with cardiac malformations and oral clefts in offspring. JAMA 2018;320:2429-2437 (PMID 30561479)',
        doi: '10.1001/jama.2018.18307',
        inferredClaim:
          'That ondansetron in early pregnancy raises the risk of congenital malformations generally — the largest cohort finds no such signal for cardiac or overall malformations, and an increase confined to oral clefts of under three cases per ten thousand births',
        auditFlag: 'contested',
      },
      {
        id: 'ond-a7',
        category: 'failed',
        title: 'Serotonin syndrome, and a class of reactions that only showed up after approval',
        laymanSummary:
          'A drug that blocks a serotonin receptor can still trigger serotonin syndrome, and some of the reported cases were fatal. None of this was in the registration trials; it came from postmarketing reports.',
        technicalDetails:
          'The label records serotonin syndrome with 5-HT3 receptor antagonists alone, most reports involving concomitant serotonergic drugs (SSRIs, SNRIs, MAO inhibitors, mirtazapine, fentanyl, lithium, tramadol, intravenous methylene blue), with some fatal cases, and cases on overdose of ondansetron alone. Most reports arose in a post-anaesthesia care unit or an infusion centre. The label further records hypersensitivity reactions including anaphylaxis and bronchospasm with cross-reactivity to other 5-HT3 antagonists; myocardial ischaemia after oral administration; masking of progressive ileus and gastric distension after abdominal surgery; and contraindicates concomitant apomorphine because of profound hypotension and loss of consciousness. All are postmarketing findings.',
        evidenceSource:
          'Ondansetron United States prescribing information, sections 4 Contraindications and 5.1 to 5.5 Warnings and Precautions (openFDA drug/label record, DailyMed set id 00327696-c496-4c83-a63e-9e29fd6246d4)',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Chemotherapy tears up the lining of the small intestine',
        laymanDesc:
          'The drug does nothing at this stage. What starts the process is the chemotherapy itself damaging the cells that line the gut, and those cells releasing a chemical when they are injured.',
        molecularDetail:
          'Cytotoxic agents damage enterochromaffin cells in the mucosa of the small intestine, which release stored 5-hydroxytryptamine. More than 90% of patients receiving cisplatin at 50 mg/m2 or more vomit in the absence of any antiemetic, which is the figure the historical placebo comparison in the label rests on.',
        iconName: 'Flame',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Serotonin lands on the nerve that runs from gut to brainstem',
        laymanDesc:
          'The released chemical hits the vagus nerve, the long nerve connecting the gut to the base of the brain. That is the wire that carries the instruction to vomit.',
        molecularDetail:
          'Released 5-HT activates 5-HT3 receptors on vagal afferent terminals in the gut wall. The 5-HT3 receptor is not a G-protein-coupled receptor: it is a pentameric ligand-gated cation channel, so activation is a direct depolarising current rather than a second-messenger cascade, and it is fast.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Ondansetron plugs the channel so it cannot open',
        laymanDesc:
          'The drug sits in the same pocket serotonin would use, and blocks it. The nerve stops firing, and the instruction is never sent.',
        molecularDetail:
          'Ondansetron is a selective competitive antagonist at 5-HT3. The basic imidazole nitrogen occupies the site the protonated primary amine of serotonin would take, holding the channel shut. Selectivity is the whole design: the label reports no effect on plasma prolactin, and no effect on oesophageal motility, gastric motility, lower oesophageal sphincter pressure or small-bowel transit at 0.15 mg/kg intravenously.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'The same block happens in the one brain region open to the bloodstream',
        laymanDesc:
          'A small patch of the brainstem sits outside the barrier that keeps most drugs out of the brain. Ondansetron reaches the receptors there too, which is why it works on signals that never came from the gut.',
        molecularDetail:
          'The area postrema, the chemoreceptor trigger zone, lies outside the blood-brain barrier and carries 5-HT3 receptors. Antagonism at both the peripheral vagal terminal and the central trigger zone is why 5-HT3 blockade works in postoperative and radiotherapy-induced vomiting as well as chemotherapy-induced vomiting.',
        iconName: 'Target',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'Vomiting stops. Nausea often does not.',
        laymanDesc:
          'This is the part patients are least often told. The drug is very good at stopping the act of vomiting and much less good at stopping the feeling of being sick, and the two are measured separately in every trial.',
        molecularDetail:
          'In the label’s own 357-patient dose-comparison trial, 66% of patients on 24 mg once daily had zero emetic episodes and no rescue, while 56% had no nausea at all; on 8 mg twice daily the figures were 55% and 36%. Nausea is a rating-scale outcome mediated by pathways beyond 5-HT3, which is why the addition of an NK-1 antagonist and a corticosteroid changes the delayed-phase result and 5-HT3 blockade alone does not.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'A cardiac channel that was never the target',
        laymanDesc:
          'At higher intravenous doses the drug also slows a potassium channel in heart muscle, which stretches the heart’s electrical cycle. That finding is why the highest dose no longer exists.',
        molecularDetail:
          'Concentration-dependent hERG-mediated QTcF prolongation: 19.5 ms (95% upper bound 21.8) at 32 mg and 5.6 ms (7.4) at 8 mg over a 15-minute infusion in 58 healthy subjects, with a significant exposure-response relationship. Postmarketing torsade de pointes is recorded. The label now warns against use in congenital long QT syndrome and advises ECG monitoring with hypokalaemia, hypomagnesaemia, heart failure, bradyarrhythmia or other QT-prolonging drugs.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cubeddu 1990 (PMID 2145400) — cyclophosphamide, placebo-controlled',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 20,
        primaryEndpoint:
          'Complete absence of emesis after cyclophosphamide-containing chemotherapy, with nausea visual analogue score as co-primary',
        endpointMet: true,
        statisticalPValue:
          '70% with no vomiting on ondansetron against 0% on placebo, P = .008; median nausea 8 mm against 65 mm, P < .001',
        unreportedAdverseSignals:
          'A small trial. The arm sizes are not stated in the abstract; the enrolled total is small enough that the confidence interval around 70% is wide, and the result is quoted here as a proportion rather than a precise estimate.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Label study — moderately emetogenic, cyclophosphamide plus doxorubicin, placebo-controlled',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 67,
        primaryEndpoint: 'Total emetic episodes over a 3-day period',
        endpointMet: true,
        statisticalPValue:
          '20 of 33 (61%) with zero emetic episodes on ondansetron against 2 of 34 (6%) on placebo, P < 0.001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Label study — highly emetogenic, oral dose comparison, historical placebo control',
        phase: 'Randomised, double-blind, monotherapy dose comparison',
        sampleSize: 357,
        primaryEndpoint:
          'Zero emetic episodes and no rescue antiemetic over 24 hours after cisplatin 50 mg/m2 or more',
        endpointMet: true,
        statisticalPValue:
          '66% on 24 mg once daily, 55% on 8 mg twice daily, 55% on 32 mg once daily; each superior to a historical placebo control, with no concurrent placebo arm',
        unreportedAdverseSignals:
          'No concurrent control. Steroids were excluded from the design, so the comparison is not to contemporary practice. Two of the three regimens tested — 8 mg twice daily and 32 mg once daily — are no longer recommended in the label.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Thorough QT study (reported in the United States label, section 12.2)',
        phase: 'Randomised, double-blind, placebo- and positive-controlled crossover',
        sampleSize: 58,
        primaryEndpoint:
          'Maximum mean placebo-corrected, baseline-adjusted QTcF change after a 15-minute intravenous infusion',
        endpointMet: false,
        statisticalPValue:
          '19.5 ms (95% upper bound 21.8) at 32 mg; 5.6 ms (7.4) at 8 mg; significant concentration-QTcF exposure-response relationship',
        unreportedAdverseSignals:
          'The 32 mg single intravenous dose was subsequently removed from the label. This is the rare case of a registration-era dose being withdrawn on the strength of the sponsor’s own cardiac safety study rather than an epidemiological signal.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Egerton-Warburton 2014 (PMID 24818542) — emergency department, three-arm',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 270,
        primaryEndpoint:
          'Mean change in 100 mm nausea visual analogue scale from enrolment to 30 minutes',
        endpointMet: false,
        statisticalPValue:
          'Ondansetron -27 mm (95% CI 22 to 33), metoclopramide -28 mm (22 to 34), saline placebo -23 mm (16 to 30); no significant difference',
        unreportedAdverseSignals:
          'Rescue medication was needed by 34.5% on ondansetron, 17.9% on metoclopramide and 36.3% on placebo — a spread that goes the wrong way for ondansetron and is not the primary endpoint.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Freedman 2006 (PMID 16625009) — paediatric gastroenteritis',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 215,
        primaryEndpoint: 'Proportion of children who vomited during oral rehydration therapy',
        endpointMet: true,
        statisticalPValue:
          '14% against 35%, relative risk 0.40 (95% CI 0.26 to 0.61); intravenous rehydration 14% against 31%, RR 0.46 (0.26 to 0.79)',
        unreportedAdverseSignals:
          'Hospitalisation (4% against 5%, P = 1.00) and return emergency-department visits (19% against 22%, P = 0.73) did not differ. The drug moved process measures, not disposition.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '70% of patients with zero vomiting against 0% on concurrent placebo after cyclophosphamide-based chemotherapy (P = .008)',
        '61% against 6% with zero emetic episodes over three days in the label’s 67-patient placebo-controlled moderately emetogenic study (P < 0.001)',
        'A 19.5 ms mean QTcF prolongation at 32 mg intravenously against 5.6 ms at 8 mg, in 58 healthy subjects',
        'Vomiting during oral rehydration in children fell from 35% to 14% (RR 0.40, 95% CI 0.26 to 0.61) on a single dose',
        'Adjusted relative risk 0.99 for cardiac malformations and 1.24 for oral clefts after first-trimester exposure in 1,816,414 pregnancies',
      ],
      unsupportedInferences: [
        'That the 66% response rate in cisplatin chemotherapy is a placebo-controlled effect — it was benchmarked against a historical control, with no concurrent placebo arm',
        'That preventing vomiting is the same as relieving nausea; in the label’s own trial the two rates differ by ten to twenty percentage points at every dose',
        'That the emergency-department use, which is the commonest use, is supported by the chemotherapy evidence — the randomised comparison there is against saline and it is a draw',
        'That reducing the drip rate in a vomiting child changes whether that child is admitted; admission and return visits did not move',
      ],
      whatFailedInitially: [
        'Two of the three oral regimens studied in the pivotal highly-emetogenic trial, 8 mg twice daily and 32 mg once daily, are no longer recommended',
        'The 32 mg single intravenous dose was withdrawn after the sponsor’s own thorough QT study',
        'No statistically significant benefit over saline placebo at 30 minutes in undifferentiated emergency-department nausea, in a 270-patient trial and then in a Cochrane review of 952 participants',
        'Serotonin syndrome, anaphylaxis with cross-reactivity across the class, and myocardial ischaemia were all postmarketing findings, not trial findings',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines, and dispensed as 95 separately listed generic products at a median United States pharmacy acquisition cost of twelve cents a unit',
        'The default antiemetic backbone for chemotherapy, to which a corticosteroid and an NK-1 antagonist are added rather than substituted',
        'Used enormously in pregnancy outside its licence; the largest cohort study puts the excess oral-cleft risk at under three cases per ten thousand births and finds no cardiac signal',
        'The registration-era 32 mg intravenous dose no longer exists, which is an unusually clean example of a label being narrowed by its own safety data',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, orally disintegrating tablet, oral soluble film, oral solution, and intravenous or intramuscular injection',
      description:
        'The orally disintegrating tablet and the soluble film exist for the obvious reason: the population being treated is vomiting. Absorption from the oral route is good enough that the intravenous form is reserved for people who cannot swallow, not for people who need a bigger effect.',
      safetyProfile:
        'No boxed warning. Contraindicated with apomorphine because of profound hypotension and loss of consciousness, and in known hypersensitivity. Warnings cover hypersensitivity including anaphylaxis and bronchospasm with cross-reactivity to other 5-HT3 antagonists; QT prolongation and torsade de pointes, with avoidance in congenital long QT syndrome and ECG monitoring where electrolytes are abnormal or other QT-prolonging drugs are used; serotonin syndrome, including fatal cases, particularly alongside other serotonergic drugs; myocardial ischaemia after oral administration; and masking of progressive ileus or gastric distension after abdominal surgery. Constipation and headache are the common complaints.',
    },
    commonQuestions: [
      {
        q: 'It stopped me vomiting but I still feel sick. Is that normal?',
        a: 'Yes, and it is what the trials show rather than a personal failure of the drug. Ondansetron blocks one specific serotonin channel on the nerve that triggers the vomiting reflex. Nausea — the feeling — is generated by more pathways than that one, so it responds less. In the manufacturer’s own 357-patient trial, 66% of patients on the recommended 24 mg oral dose had no vomiting at all, while 56% had no nausea; on the 8 mg twice-daily regimen the gap was wider still, 55% against 36%. That is why chemotherapy regimens add a corticosteroid and, for the harder drugs, an NK-1 antagonist rather than simply giving more ondansetron.',
        auditNote:
          'Trials in this field report "complete response", defined as no vomiting and no rescue medication. That definition contains no statement about nausea at all, and it is the number most often quoted.',
      },
      {
        q: 'Why did the emergency department give me fluids and say the anti-sickness drug might not help?',
        a: 'Because for undifferentiated nausea in that setting the randomised evidence does not support it. A three-arm trial of 270 adults compared intravenous ondansetron, intravenous metoclopramide and plain saline: the nausea score fell 27, 28 and 23 millimetres respectively on a hundred-millimetre scale, and none of those differences was statistically significant. The Cochrane review that followed pooled eight trials and 952 participants and found no drug except droperidol — in a single 48-patient study — beat placebo. The reviewers wrote that supportive treatment such as intravenous fluid may be sufficient for the majority of people. None of this contradicts the chemotherapy evidence, which is a different population, a different cause and a much stronger result.',
      },
      {
        q: 'Is it safe in pregnancy?',
        a: 'It is used very widely for pregnancy sickness outside its licence, and the largest study we have is reassuring on the big questions and not entirely silent on a small one. In 1,816,414 Medicaid pregnancies, of which 88,467 involved first-trimester ondansetron, the adjusted relative risk was 0.99 for cardiac malformations and 1.01 for any congenital malformation — no signal. For oral clefts the adjusted relative risk was 1.24, an absolute difference of 2.7 extra cases per ten thousand births. Whether that is worth it depends on how severe the vomiting is, which is a conversation rather than a rule. This page does not tell anyone what to take in pregnancy.',
        auditNote:
          'The oral-cleft finding is the one that survived adjustment. Earlier reports of a broad malformation signal did not.',
      },
      {
        q: 'What happened to the 32 mg dose?',
        a: 'It was removed. A dedicated study in 58 healthy volunteers measured how much each intravenous dose stretched the QT interval — the electrical recovery time of the heart — against placebo. The 32 mg dose produced a mean prolongation of 19.5 milliseconds, with an upper confidence bound of 21.8; the 8 mg dose produced 5.6 milliseconds. There was a clear relationship between blood concentration and the effect. The single 32 mg intravenous dose is no longer a recommended regimen, and the label now says the 8 mg dose does not prolong QT to any clinically relevant extent. It is worth noting that the pivotal aprepitant trials, run before this, used 32 mg intravenous ondansetron as the comparator.',
      },
      {
        q: 'Can a drug that blocks a serotonin receptor cause serotonin syndrome?',
        a: 'Apparently yes, and the label records it. Reports involve 5-HT3 antagonists alone and, more often, 5-HT3 antagonists alongside SSRIs, SNRIs, MAO inhibitors, mirtazapine, fentanyl, lithium, tramadol or intravenous methylene blue. Some cases were fatal. Most arose in recovery rooms and infusion centres, which are exactly the settings where nobody asks a patient what antidepressant they take. The mechanism is not settled; the reporting is. If you take anything serotonergic, that is the thing to say out loud before the injection.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cubeddu LX, Hoffmann IS, Fuenmayor NT, Finn AL. Antagonism of serotonin S3 receptors with ondansetron prevents nausea and emesis induced by cyclophosphamide-containing chemotherapy regimens. J Clin Oncol 1990;8:1721-1727',
        identifier: '10.1200/JCO.1990.8.10.1721',
        kind: 'doi',
      },
      {
        label:
          'Egerton-Warburton D, Meek R, Mee MJ, Braitberg G. Antiemetic use for nausea and vomiting in adult emergency department patients: randomized controlled trial comparing ondansetron, metoclopramide, and placebo. Ann Emerg Med 2014;64:526-532',
        identifier: '10.1016/j.annemergmed.2014.03.017',
        kind: 'doi',
      },
      ED_ANTIEMETIC_COCHRANE,
      {
        label:
          'Freedman SB, Adler M, Seshadri R, Powell EC. Oral ondansetron for gastroenteritis in a pediatric emergency department. N Engl J Med 2006;354:1698-1705',
        identifier: '10.1056/NEJMoa055119',
        kind: 'doi',
      },
      {
        label:
          'Huybrechts KF, Hernández-Díaz S, Straub L, Gray KJ, et al. Association of maternal first-trimester ondansetron use with cardiac malformations and oral clefts in offspring. JAMA 2018;320:2429-2437',
        identifier: '10.1001/jama.2018.18307',
        kind: 'doi',
      },
      {
        label:
          'Ondansetron United States prescribing information — indications, warnings, cardiac electrophysiology and clinical studies sections (openFDA drug/label record)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=00327696-c496-4c83-a63e-9e29fd6246d4',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA — ZOFRAN injection, NDA 020007, original approval 4 January 1991; ZOFRAN tablets, NDA 020103, original approval 31 December 1992 (openFDA drugsfda record)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020007',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Metoclopramide — the only drug the FDA licenses for diabetic gastroparesis, carrying a boxed
  //    warning built on an incidence estimate a later review put at roughly a tenth of it, and
  //    deleted from the same indication in Europe on the grounds that it should not be taken long.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'metoclopramide',
    name: 'Metoclopramide',
    tradeName: 'Reglan / Gimoti / Metozolv ODT',
    sponsor:
      'A.H. Robins, as Reglan tablets under NDA 017854, original approval 30 December 1980; the application is now held by ANI Pharmaceuticals, the nasal spray Gimoti was approved to Evoke Pharma under NDA 209388 on 19 June 2020, and the oral drug is dispensed as generics — 36 separately listed products on the pricing record',
    targetGene:
      'DRD2 principally, with HTR4 and, at high concentration, HTR3A — all human receptor genes',
    targetProtein:
      'Dopamine D2 receptor (antagonist) in the area postrema and on enteric neurons; 5-HT4 receptor (agonist) on enteric cholinergic neurons; 5-HT3 receptor (antagonist) at high concentration',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1980,
    indication:
      'Short-term (4 to 12 weeks) therapy for adults with symptomatic, documented gastro-oesophageal reflux who fail to respond to conventional therapy; relief of symptoms of acute and recurrent diabetic gastroparesis; and, by injection, prevention of postoperative nausea and vomiting, prevention of chemotherapy-induced nausea and vomiting, facilitation of small-bowel intubation, and aid to radiological examination',
    patientFriendlyIndication:
      'A stomach that empties too slowly, persistent reflux that other drugs have not helped, and sickness after surgery or chemotherapy',
    anatomicalSite:
      'Two places at once — the chemoreceptor trigger zone in the area postrema, and the myenteric plexus in the wall of the stomach and upper small intestine',
    conditionContext: {
      conditionExplainer:
        'Gastroparesis is a stomach that empties too slowly without anything blocking it. Long-standing diabetes is the commonest identified cause: high blood glucose over decades damages the nerves that coordinate the stomach’s muscular contractions, so food sits, and the person feels full, bloated and sick. Reflux is a different failure in the same system — stomach contents moving the wrong way up the oesophagus.',
      whyItMatters:
        'Metoclopramide is the only drug the FDA has approved for diabetic gastroparesis, which is a statement about the emptiness of the field rather than about the strength of the drug. Everything else used for the condition is off-label, imported under compassionate access, or a device.',
      whoTakesThis:
        'Adults with diabetic gastroparesis, adults with reflux that proton pump inhibitors have not settled, and — far more often, and briefly — people given a single injection for sickness after surgery, after chemotherapy, or during a migraine.',
      clinicalGoals:
        'Faster gastric emptying and fewer symptoms. Emptying is measured by scintigraphy; symptoms are measured on a diary scale; and the two correlate poorly, which is the recurring problem in this whole therapeutic area.',
    },
    oneSentenceVerdict:
      'A dopamine D2 blocker that also switches on 5-HT4 receptors in the gut wall, so it stops the brainstem vomiting signal and pushes the stomach to empty at the same time — the only FDA-approved drug for diabetic gastroparesis, carrying a boxed warning for irreversible tardive dyskinesia written on a 1-10% risk estimate that a 2010 review put at likely under 1%, and deleted from every long-term indication in the European Union in 2013.',
    laymanHowItWorks:
      'Metoclopramide does two jobs with one molecule. In the brainstem it blocks the dopamine receptors on the patch of tissue that decides when to vomit, so the signal is suppressed. In the wall of the stomach it does the opposite of blocking: it switches on a different receptor that makes nerve endings release acetylcholine, and acetylcholine makes the stomach muscle squeeze harder and in the right direction. The problem is that dopamine receptors are also what coordinate movement in the rest of the brain, and blocking them for months can cause a movement disorder that does not always go away.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 55,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        '$0.0438 per unit, median across 36 listed products, United States pharmacy acquisition cost (CMS NADAC, generic, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Four cents a tablet, and the cheapest drug in this file. Its commercial history since going generic has been about routes rather than molecules: Metozolv ODT was an orally disintegrating reformulation, and Gimoti a nasal spray approved in 2020 on the argument that a patient who is vomiting cannot reliably absorb a tablet. The nasal spray is the one that missed its primary endpoint, which is the audit below.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For a single dose of sickness this drug has several equivalent alternatives and no clear advantage. For gastroparesis it has almost no alternatives at all in the United States, which is why a drug with a boxed warning and a 12-week ceiling is still being prescribed for a condition that lasts decades.',
      conventionalRx: [
        {
          name: 'Ondansetron',
          class: '5-HT3 receptor antagonist',
          howItCompares:
            'Indistinguishable from metoclopramide for undifferentiated nausea: 27 mm against 28 mm mean fall in nausea score at 30 minutes in a 258-patient three-arm randomised trial, with saline placebo at 23 mm. It has no boxed warning and no movement-disorder risk, but it does not empty the stomach and slows colonic transit on repeated dosing.',
          typicalCost:
            '$0.1208 per unit, United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no tardive dyskinesia, no duration ceiling. Cons: about three times the price, a QT signal, and no prokinetic effect at all — so it is not a substitute in gastroparesis.',
        },
        {
          name: 'Prochlorperazine',
          class: 'Phenothiazine dopamine D2 antagonist',
          howItCompares:
            'The same dopamine blockade without the 5-HT4 prokinetic action. It shares the extrapyramidal risk and adds akathisia in 36% of patients given 10 mg intravenously in a randomised trial. It has a randomised win over subcutaneous sumatriptan in acute migraine, which metoclopramide does not.',
          typicalCost:
            '$0.1688 per unit, United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: better established in acute migraine. Cons: the full antipsychotic warning set including increased mortality in elderly patients with dementia-related psychosis, and no effect on gastric emptying.',
        },
        {
          name: 'Erythromycin (used off-label as a prokinetic)',
          class: 'Macrolide antibiotic acting as a motilin receptor agonist',
          howItCompares:
            'A different mechanism for the same problem — it mimics motilin and drives strong gastric contractions. It has no FDA gastroparesis indication, tachyphylaxis develops within weeks, and it prolongs QT. This dossier states its existence rather than recommending it.',
          typicalCost: 'Not held on this record',
          prosAndCons:
            'Pros: works through a receptor unrelated to dopamine, so it carries no movement-disorder risk. Cons: entirely off-label, loses effect quickly, is an antibiotic being used as a motility drug, and prolongs QT.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Count the weeks',
          action:
            'Note the date the first dose was taken and ask what the plan is at twelve weeks.',
          patientImpact:
            'The boxed warning instructs prescribers to avoid treatment longer than 12 weeks because tardive dyskinesia risk rises with duration and cumulative dose. Gastroparesis does not stop at twelve weeks, so the decision to continue is a real one that should be made deliberately rather than by repeat prescription.',
          clinicalPrecaution:
            'Tardive dyskinesia is often irreversible and there is no known treatment for it. The label says symptoms may lessen or resolve after stopping in some patients — may, and some.',
        },
        {
          name: 'Report any involuntary movement immediately, including a restlessness you cannot sit through',
          action:
            'Describe any new twitching, grimacing, tongue movement, neck spasm, or an inability to stay still, on the day it appears.',
          patientImpact:
            'Acute dystonia and akathisia usually appear early; tardive dyskinesia and parkinsonism appear in chronic users. Metoclopramide accounts for nearly a third of all drug-induced movement disorders in the published review of the topic.',
          clinicalPrecaution:
            'Female sex, older age and diabetes are the risk factors identified in that review — which describes the exact population being treated for diabetic gastroparesis.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCN(CC)CCNC(=O)C1=CC(=C(C=C1OC)N)Cl',
      chemicalFormula: 'C14H22ClN3O2',
      molecularWeight: '299.79 g/mol',
      targetReceptorAffinity:
        'A substituted benzamide with three actions at three different concentration ranges: D2 antagonism at the lowest, 5-HT4 agonism in the therapeutic range, and 5-HT3 antagonism only at the high doses once used for cisplatin. It is unusually lipophilic for its class in one specific respect — a study of tritiated antipsychotic binding to post-mortem human substantia nigra estimated that under clinical conditions metoclopramide would accumulate there at roughly 21 times the level of haloperidol, which the authors proposed as the reason its movement-disorder risk is higher than its receptor affinity alone would predict.',
      structureSource: {
        label:
          'PubChem — canonical SMILES, molecular formula and weight for metoclopramide, as pulled by this repository’s ingestion pipeline and accepted by its structure parser',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4168',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'met-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and regiochemistry of the substituted benzamide ring',
          description:
            'Confirm that the chlorine, the methoxy and the free amine sit at positions 4, 2 and 5 of the benzamide ring before anything else. The three substituents are what separate metoclopramide from the wider benzamide family; move the chlorine and the compound loses D2 affinity while keeping the diethylaminoethyl tail that carries most of its distribution behaviour.',
          reagentsAndBuffer:
            'Metoclopramide hydrochloride reference standard, reversed-phase HPLC with ultraviolet detection at 273 nm, 1H and 13C NMR in D2O, elemental chlorine assay',
        },
        {
          id: 'met-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amide coupling of the benzoic acid core to the diethylaminoethyl tail',
          description:
            'Couple 4-amino-5-chloro-2-methoxybenzoic acid to N,N-diethylethylenediamine. The tertiary amine on the tail is the basic centre that is protonated at physiological pH and that anchors the molecule in the D2 binding pocket, so the coupling has to leave it untouched.',
          dependsOnStepId: 'met-w1',
          reagentsAndBuffer:
            'Activated benzoic acid (acid chloride or carbodiimide-mediated), N,N-diethylethylenediamine, triethylamine, anhydrous dichloromethane or toluene, nitrogen atmosphere',
        },
        {
          id: 'met-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride salt formation and control of the nitroso impurity',
          description:
            'Crystallise as the monohydrochloride monohydrate and assay for N-nitroso impurities. The free aromatic amine on this molecule is a nitrosation substrate, and nitrosamine limits are now part of the specification for every secondary and aromatic amine drug — a specification requirement that did not exist when the drug was approved.',
          dependsOnStepId: 'met-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol, ethanol-water recrystallisation, LC-MS/MS nitrosamine assay against a certified reference standard',
        },
        {
          id: 'met-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Dual-receptor cell assay: D2 antagonism and 5-HT4 agonism side by side',
          description:
            'Run the compound against both receptors in the same experiment. A cyclic-AMP readout in a D2-expressing line should fall as antagonism is relieved, and rise in a 5-HT4-expressing line as agonism engages. Testing only one receptor is how a benzamide gets misclassified: the prokinetic effect and the antiemetic effect come from opposite directions of signalling at two different receptors.',
          dependsOnStepId: 'met-w3',
          reagentsAndBuffer:
            'CHO or HEK293 lines stably expressing human DRD2 and human HTR4, forskolin-stimulated cyclic AMP accumulation assay, dopamine and serotonin as reference agonists, IBMX to block phosphodiesterase',
        },
        {
          id: 'met-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Nigral accumulation counter-screen against a reference antipsychotic',
          description:
            'Quantify non-specific binding to melanised substantia nigra tissue and normalise to free plasma concentration. This is the step that explains the boxed warning rather than the therapeutic effect: it is where metoclopramide separates from drugs with much higher D2 affinity, and it is why the movement-disorder risk does not track receptor potency.',
          dependsOnStepId: 'met-w4',
          reagentsAndBuffer:
            'Dissected melanised post-mortem human substantia nigra, tritiated metoclopramide and tritiated haloperidol at 1 nM, rat striatum as the non-nigral baseline, scintillation counting',
        },
      ],
    },
    keyAudits: [
      {
        id: 'met-a1',
        category: 'conclusion_shift',
        title:
          'The boxed warning was written on a 1-10% risk figure; a review the following year put it under 1%',
        laymanSummary:
          'In 2009 the FDA added its strongest warning to metoclopramide for a movement disorder that is often permanent. The figure in the guidelines at the time was that between one and ten in every hundred long-term users would get it. A review published the next year concluded the real figure is probably fewer than one in a hundred.',
        technicalDetails:
          'Rao and Camilleri reviewed the pharmacology, pharmacokinetics and epidemiology after the 2009 boxed warning and concluded that the risk of tardive dyskinesia from metoclopramide is likely to be under 1%, "much less than the estimated 1-10% risk previously suggested in national guidelines". They proposed that metoclopramide-induced tardive dyskinesia may be an idiosyncratic response, with pharmacogenetic determinants — the DRD3 Ser9Gly polymorphism, cytochrome P450 variation, P-glycoprotein — rather than a straightforward dose-response phenomenon, and called for community-prevalence work to define the benefit-risk ratio properly. That work has not been reported. The boxed warning stands unchanged: it instructs prescribers to avoid treatment longer than 12 weeks and states that there is no known treatment for tardive dyskinesia.',
        evidenceSource:
          'Rao AS, Camilleri M. Review article: metoclopramide and tardive dyskinesia. Aliment Pharmacol Ther 2010;31:11-19 (PMID 19886950); metoclopramide United States prescribing information, boxed warning',
        doi: '10.1111/j.1365-2036.2009.04189.x',
        inferredClaim:
          'That the 1-10% figure in the guidelines the boxed warning drew on is the true incidence — the review that examined it puts the figure an order of magnitude lower, and no community-prevalence study has since settled it in either direction',
        auditFlag: 'contested',
      },
      {
        id: 'met-a2',
        category: 'measured',
        title:
          'It causes nearly a third of all drug-induced movement disorders, and the risk factors describe its own indication',
        laymanSummary:
          'Whatever the exact percentage, metoclopramide is responsible for close to a third of every movement disorder caused by a drug. The people most at risk are women, older people and people with diabetes — which is exactly who is prescribed it for a slow-emptying stomach.',
        technicalDetails:
          'Pasricha and colleagues reviewed the indications and adverse neurological effects of metoclopramide and reported that it accounts for nearly a third of all drug-induced movement disorders. The full spectrum occurs: akathisia and acute dystonia early in the course, tardive dyskinesia and parkinsonism in chronic users. Female sex, age and diabetes are identified as the major risk factors. The label’s contraindications reflect the same pharmacology from another angle — it is contraindicated in epilepsy because it increases seizure frequency and severity, and in phaeochromocytoma or catecholamine-releasing paraganglioma because it can precipitate hypertensive crisis.',
        evidenceSource:
          'Pasricha PJ, Pehlivanov N, Sugumar A, Jankovic J. Drug insight: from disturbed motility to disordered movement — a review of the clinical benefits and medicolegal risks of metoclopramide. Nat Clin Pract Gastroenterol Hepatol 2006;3:138-148 (PMID 16511548)',
        doi: '10.1038/ncpgasthep0442',
        measuredMetric:
          'Share of all drug-induced movement disorders attributable to a single agent, and the demographic risk factors for them',
        auditFlag: 'caution',
      },
      {
        id: 'met-a3',
        category: 'failed',
        title:
          'The nasal spray missed its primary endpoint and was approved for women on a subgroup',
        laymanSummary:
          'A nasal spray version was developed for people too nauseated to keep a tablet down. In its trial of 285 patients it did not beat placebo. It did beat placebo in the women, and not in the men, and that is the licence it now has.',
        technicalDetails:
          'Parkman and colleagues ran a multicentre, double-blind phase 2b trial of 10 mg and 14 mg metoclopramide nasal spray against placebo in 285 subjects (71% female) with type 1 or type 2 diabetes and previously diagnosed gastroparesis, dosed before meals and at bedtime for 28 days. Primary endpoint was change in total symptom score at week 4 from a daily diary of nausea, bloating, early satiety and upper abdominal pain. There was no statistically significant difference between either metoclopramide group and placebo overall. In the prespecified sex subgroup, women improved significantly on both doses (10 mg: mean reduction 1.2 ± 1.18, P = .0247; 14 mg: 1.3 ± 0.94, P = .0215); in men, symptom scores fell more on placebo than on either dose. Gimoti was approved under NDA 209388 on 19 June 2020 with an indication restricted to adult women.',
        evidenceSource:
          'Parkman HP, Carlson MR, Gonyer D. Metoclopramide nasal spray reduces symptoms of gastroparesis in women, but not men, with diabetes: results of a phase 2B randomized study. Clin Gastroenterol Hepatol 2015;13:1256-1263 (PMID 25576687; NCT00845858)',
        doi: '10.1016/j.cgh.2014.12.030',
        measuredMetric:
          'Change in total gastroparesis symptom score from baseline to week 4, against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'met-a4',
        category: 'conclusion_shift',
        title:
          'Europe deleted the indication the United States still licenses, on the ground that it should not be taken long',
        laymanSummary:
          'The two regulators looked at the same drug and reached opposite conclusions. The FDA licenses it for a chronic condition with a twelve-week ceiling. The European regulator restricted it to five days, banned it below age one, and removed the long-term gut-motility indications entirely.',
        technicalDetails:
          'After a review requested by the French agency ANSM over both safety and efficacy, the CHMP concluded on 26 July 2013, and confirmed after re-examination on 24 October 2013, that the risks of neurological effects outweighed the benefits in conditions requiring long-term treatment. The recommendations: authorisation for short-term use only, up to 5 days; no use below 1 year of age; second-choice use only in children over 1, restricted to prevention of delayed chemotherapy-induced nausea and vomiting and treatment of postoperative nausea and vomiting; in adults, restriction to prevention and treatment of nausea and vomiting from chemotherapy, radiotherapy, surgery and migraine; reduced maximum doses; and withdrawal of oral liquids above 1 mg/mL, which had been associated with paediatric overdose. The United States label continues to carry symptomatic gastro-oesophageal reflux for 4 to 12 weeks and acute and recurrent diabetic gastroparesis.',
        evidenceSource:
          'European Medicines Agency, metoclopramide-containing medicines Article 31 referral — CHMP opinion 26 July 2013, confirmed on re-examination 24 October 2013, European Commission final decision',
        inferredClaim:
          'That an FDA indication and an EMA indication for the same molecule reflect the same reading of the evidence — here they diverge completely, and the divergence is about duration rather than about mechanism',
        auditFlag: 'contested',
      },
      {
        id: 'met-a5',
        category: 'failed',
        title: 'No better than saline for undifferentiated nausea in the emergency department',
        laymanSummary:
          'For someone who arrives at hospital feeling sick without a known cause, this drug performed the same as salt water in a randomised trial, and the Cochrane review found the same.',
        technicalDetails:
          'In the three-arm Melbourne trial of 270 adults, 20 mg intravenous metoclopramide produced a mean fall of 28 mm (95% CI 22 to 34) on the 100 mm nausea visual analogue scale at 30 minutes, against 23 mm (16 to 30) for saline placebo — not significant. The Cochrane review pooling three trials and 301 participants gave a mean difference against placebo of -5.27 mm (95% CI -11.33 to 0.80), also not significant. Metoclopramide was the only agent in the trial with a numerically lower rescue-medication rate (17.9% against 36.3% on placebo and 34.5% on ondansetron), which is a secondary outcome and is reported here as such.',
        evidenceSource:
          'Egerton-Warburton D, Meek R, Mee MJ, Braitberg G. Ann Emerg Med 2014;64:526-532 (PMID 24818542); Furyk JS, Meek RA, Egerton-Warburton D. Cochrane Database Syst Rev 2015;9:CD010106 (PMID 26411330)',
        doi: '10.1002/14651858.CD010106.pub2',
        measuredMetric:
          'Mean change in 100 mm nausea visual analogue scale at 30 minutes against saline placebo',
        auditFlag: 'verified',
      },
      {
        id: 'met-a6',
        category: 'inferred',
        title: 'In intensive care, prokinetics move the feeding surrogate and not the outcomes',
        laymanSummary:
          'Given to critically ill patients to help them tolerate tube feeding, these drugs do reduce feeding problems. They do not reduce vomiting, shorten the intensive-care stay, or reduce deaths.',
        technicalDetails:
          'Lewis and colleagues meta-analysed 13 randomised trials enrolling 1,341 critically ill adults given a prokinetic agent or placebo. Feeding intolerance fell — RR 0.73 (95% CI 0.55 to 0.97), P = 0.03, an absolute reduction of 17.3% (5 to 26.8), moderate certainty. High gastric residual volumes fell (RR 0.69, 0.52 to 0.91) and post-pyloric tube placement succeeded more often (RR 1.60, 1.17 to 2.21). There was no significant improvement in vomiting, diarrhoea, intensive-care length of stay or mortality, and the authors state that the impact on pneumonia, mortality and length of stay is unclear.',
        evidenceSource:
          'Lewis K, Alqahtani Z, McIntyre L, Almenawer S, et al. The efficacy and safety of prokinetic agents in critically ill patients receiving enteral nutrition: a systematic review and meta-analysis of randomized trials. Crit Care 2016;20:259 (PMID 27527069)',
        doi: '10.1186/s13054-016-1441-z',
        inferredClaim:
          'That better tolerance of tube feeding translates into fewer pneumonias, shorter intensive-care stays or fewer deaths — the meta-analysis measured all three and moved none of them',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed fast, and into the brain as well as the gut',
        laymanDesc:
          'Swallowed or injected, the drug spreads through the body quickly, and unlike most gut drugs it crosses freely into the brain. That is both why it works on the vomiting centre and why it has a boxed warning.',
        molecularDetail:
          'Metoclopramide crosses the blood-brain barrier, which distinguishes it from later benzamide prokinetics designed not to. The nasal formulation exists because gastric stasis and vomiting make oral absorption unreliable in the population the drug is licensed for — a pharmacokinetic argument that survived even though the efficacy trial did not.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It blocks the dopamine receptors on the brainstem vomiting trigger',
        laymanDesc:
          'A small patch of brainstem outside the brain’s protective barrier samples the blood for anything that ought to be thrown up. Dopamine is one of the signals it uses. The drug blocks that receptor and the trigger stops firing.',
        molecularDetail:
          'D2 antagonism in the chemoreceptor trigger zone of the area postrema is the antiemetic component. It is the same receptor and the same blockade that an antipsychotic performs in the striatum, which is why the adverse-effect profile is an antipsychotic profile rather than a gastrointestinal one.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'In the gut wall it does the opposite: it switches a receptor on',
        laymanDesc:
          'The same molecule that blocks one receptor in the brain activates a different one in the stomach wall. Activating it makes nerve endings release acetylcholine, the chemical that tells muscle to contract.',
        molecularDetail:
          '5-HT4 agonism on enteric cholinergic neurons of the myenteric plexus increases acetylcholine release onto smooth muscle. The dual action is what makes this a prokinetic rather than a pure antiemetic: D2 blockade alone would relieve nausea without moving anything.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'The stomach contracts harder and empties toward the small intestine',
        laymanDesc:
          'The upper stomach tightens, the lower stomach contracts in a coordinated wave, and the valve at the exit relaxes. Food moves on instead of sitting.',
        molecularDetail:
          'Increased tone in the gastric fundus, stronger antral contractions, relaxation of the pyloric sphincter and the duodenal bulb, and increased peristalsis in the duodenum and jejunum. Accelerated gastric emptying is measurable by scintigraphy; symptom improvement is measured separately on a diary scale, and the correlation between the two is poor across the whole gastroparesis literature.',
        iconName: 'ArrowDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'The same dopamine blockade reaches the movement circuits',
        laymanDesc:
          'The receptors that trigger vomiting are the same family that coordinate movement. Blocking them for long enough can produce involuntary movements of the face, tongue and limbs that sometimes never resolve.',
        molecularDetail:
          'Striatal and nigral D2 blockade produces the full extrapyramidal spectrum: acute dystonia and akathisia early, parkinsonism and tardive dyskinesia in chronic users. Post-mortem binding work estimated that under clinical conditions metoclopramide accumulates in melanised substantia nigra at roughly 21 times the level of haloperidol, with the authors proposing detergent-like membrane damage as the reason its risk exceeds what its receptor affinity predicts.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Which is why the label has a clock on it',
        laymanDesc:
          'Because the risk rises with how long you take it and how much in total, the label tells prescribers not to go past twelve weeks. The European regulator went further and said five days.',
        molecularDetail:
          'The boxed warning states that risk increases with duration of treatment and total cumulative dosage, that there is no known treatment for tardive dyskinesia, and that treatment beyond 12 weeks should be avoided. The 2013 EMA referral restricted authorised use to 5 days, removed use below 1 year of age and withdrew the long-term motility indications outright.',
        iconName: 'Timer',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT00845858 — metoclopramide nasal spray in diabetic gastroparesis (Gimoti)',
        phase: 'Phase 2b, multicentre, randomised, double-blind, placebo-controlled',
        sampleSize: 287,
        primaryEndpoint:
          'Change in total gastroparesis symptom score (nausea, bloating, early satiety, upper abdominal pain) from baseline to week 4',
        endpointMet: false,
        statisticalPValue:
          'No statistically significant difference between either metoclopramide dose and placebo overall; women 10 mg P = .0247 and 14 mg P = .0215 in a prespecified subgroup, with men favouring placebo',
        unreportedAdverseSignals:
          'The approved indication rests on the sex subgroup of a trial that missed its overall primary endpoint. Dysgeusia, headache and fatigue were the commonest treatment-emergent effects.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Egerton-Warburton 2014 (PMID 24818542) — emergency department, three-arm',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 270,
        primaryEndpoint:
          'Mean change in 100 mm nausea visual analogue scale from enrolment to 30 minutes',
        endpointMet: false,
        statisticalPValue:
          'Metoclopramide -28 mm (95% CI 22 to 34) against saline placebo -23 mm (16 to 30); not significant',
        unreportedAdverseSignals:
          'Rescue medication was needed by 17.9% on metoclopramide against 36.3% on placebo — the largest separation in the trial, and a secondary outcome that the primary endpoint does not capture.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Lewis 2016 (PMID 27527069) — prokinetics in critically ill adults, meta-analysis of 13 randomised trials',
        phase: 'Systematic review and meta-analysis of randomised trials',
        sampleSize: 1341,
        primaryEndpoint: 'Feeding intolerance in critically ill adults receiving enteral nutrition',
        endpointMet: true,
        statisticalPValue:
          'RR 0.73 (95% CI 0.55 to 0.97), P = 0.03, absolute reduction 17.3% (5 to 26.8), moderate certainty',
        unreportedAdverseSignals:
          'No significant effect on vomiting, diarrhoea, intensive-care length of stay or mortality. The authors state the impact on pneumonia, mortality and length of stay is unclear.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 28 mm mean fall in nausea score at 30 minutes in the emergency department, against 23 mm for saline placebo — a difference that did not reach significance',
        'Rescue antiemetic needed by 17.9% on metoclopramide against 36.3% on saline placebo in the same trial',
        'Feeding intolerance in critically ill adults reduced by an absolute 17.3% (95% CI 5 to 26.8) across 13 randomised trials and 1,341 patients',
        'No significant difference from placebo in total gastroparesis symptom score at four weeks in 285 nasal-spray patients',
        'Under clinical conditions, an estimated 21-fold greater accumulation in melanised substantia nigra than haloperidol',
      ],
      unsupportedInferences: [
        'That the 1-10% tardive dyskinesia figure the boxed warning was built on is the true incidence — the review that tested it puts the risk under 1%, and no community-prevalence study has settled it',
        'That faster gastric emptying means fewer symptoms; the two are measured separately and correlate poorly across the whole gastroparesis literature',
        'That better tolerance of tube feeding in intensive care means fewer pneumonias or fewer deaths — neither moved',
        'That an FDA indication for a chronic condition and an EMA restriction to five days can both be the straightforward reading of the same evidence',
      ],
      whatFailedInitially: [
        'The nasal spray missed its primary endpoint in 285 patients, and the licence granted covers only the sex subgroup in which it did not',
        'No statistically significant benefit over saline placebo for undifferentiated emergency-department nausea, in the trial and in the Cochrane review',
        'The European Union removed the long-term gastrointestinal motility indications entirely in 2013 and capped authorised use at five days',
        'Contraindicated in epilepsy, in phaeochromocytoma, and in anyone with a previous dystonic reaction — three populations discovered by adverse experience rather than by design',
      ],
      realWorldOutcome: [
        'Still the only drug the FDA has approved for diabetic gastroparesis, forty-five years after its United States approval',
        'Four cents a tablet across 36 listed generic products, and the cheapest drug in this file',
        'Carries a boxed warning for tardive dyskinesia and a 12-week ceiling, for a condition that lasts decades',
        'Accounts for nearly a third of all drug-induced movement disorders in the published review of that literature',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, orally disintegrating tablet, oral solution, nasal spray, and intravenous or intramuscular injection',
      description:
        'The nasal spray exists specifically because the patients the drug is licensed for are the ones least able to absorb a tablet: a stomach that does not empty is a stomach that does not deliver drug to the small intestine. That reasoning is sound and independent of whether the efficacy trial succeeded.',
      safetyProfile:
        'Boxed warning for tardive dyskinesia — often irreversible, with no known treatment, risk rising with duration and cumulative dose, and treatment beyond 12 weeks to be avoided. Contraindicated in a history of tardive dyskinesia or dystonic reaction to metoclopramide; where stimulating gut motility would be dangerous (haemorrhage, mechanical obstruction, perforation); in phaeochromocytoma or catecholamine-releasing paraganglioma, because of hypertensive crisis; in epilepsy, because it increases seizure frequency and severity; and in hypersensitivity, which has included laryngeal and glossal angioedema and bronchospasm. Acute dystonia and akathisia occur early; parkinsonism and tardive dyskinesia in chronic users. In the European Union authorised use is capped at 5 days.',
    },
    commonQuestions: [
      {
        q: 'How likely is the movement disorder in the boxed warning, really?',
        a: 'Nobody has measured it properly, and that is the honest answer. The 2009 boxed warning drew on national guideline figures of between 1% and 10% for long-term users. A review published the following year by Rao and Camilleri examined the pharmacology and epidemiology behind those figures and concluded the real risk is likely under 1%, an order of magnitude lower, and proposed that it may be an idiosyncratic response with genetic determinants rather than a simple dose-response effect. They called for community-prevalence studies to settle it. Those studies have not been reported. So the warning is based on a figure the specialist literature disputes, and the disputing review is itself an estimate rather than a measurement.',
        auditNote:
          'Whatever the incidence, the separate finding that metoclopramide accounts for nearly a third of all drug-induced movement disorders is not in dispute, and reflects how heavily the drug is prescribed as much as how risky it is per patient.',
      },
      {
        q: 'Why does Europe only allow five days when my prescription is open-ended?',
        a: 'Because the European regulator concluded in 2013 that for anything requiring long-term treatment the neurological risks outweigh the benefits, and removed those indications. The review was requested by the French agency over both safety and efficacy concerns, and the CHMP confirmed its position after a re-examination requested by a manufacturer. The recommendations were: short-term use only, up to five days; no use under one year of age; second-choice status in children over one; lower maximum doses; and withdrawal of the stronger oral liquids, which had caused overdoses in children. The FDA reached a different conclusion, keeping a 4-to-12-week reflux indication and an open diabetic gastroparesis indication behind a boxed warning. Both regulators saw the same drug.',
      },
      {
        q: 'Does it actually make the stomach empty faster?',
        a: 'Yes — that part is measurable and is the basis of the licence. It increases tone in the upper stomach, strengthens the contractions of the lower stomach, relaxes the pyloric valve and speeds transit through the duodenum and jejunum. What does not follow automatically is that a person feels better. Gastric emptying measured by scintigraphy and symptom scores measured by diary correlate poorly across the entire gastroparesis literature, which is why the nasal spray could accelerate the physiology and still miss its symptom endpoint. When a drug is licensed on a mechanism and evaluated on a feeling, that gap is where most of the disagreement lives.',
      },
      {
        q: 'Why was the nasal spray approved only for women?',
        a: 'Because that is the only group it worked in. The phase 2b trial randomised 285 people with diabetic gastroparesis to two doses of nasal spray or placebo for 28 days, and neither dose beat placebo on the overall primary endpoint. In the prespecified sex subgroup, women improved significantly on both doses; men did worse than placebo on both. The FDA approved Gimoti in June 2020 with an indication limited to adult women. A subgroup that separates when the whole trial does not is a finding that needs confirming in a trial designed to test it, and that confirming trial has not been reported.',
        auditNote:
          'The trial was 71% female, so the subgroup that worked is also the larger and better-powered half of the study. That cuts both ways.',
      },
      {
        q: 'Is it better than ondansetron for feeling sick?',
        a: 'Not for undifferentiated sickness. In the one three-arm randomised trial that compared them head to head with a saline arm, the mean fall in nausea score at 30 minutes was 28 mm for metoclopramide, 27 mm for ondansetron and 23 mm for placebo, and none of those differences was statistically significant. Metoclopramide did have the lowest need for rescue medication of the three, 17.9% against 34.5% and 36.3%, which is a secondary outcome. Where metoclopramide has a genuine advantage is that it also empties the stomach, which ondansetron does not; where ondansetron has one is that it has no boxed warning and no ceiling on how long it can be taken.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Rao AS, Camilleri M. Review article: metoclopramide and tardive dyskinesia. Aliment Pharmacol Ther 2010;31:11-19',
        identifier: '10.1111/j.1365-2036.2009.04189.x',
        kind: 'doi',
      },
      {
        label:
          'Pasricha PJ, Pehlivanov N, Sugumar A, Jankovic J. Drug insight: from disturbed motility to disordered movement — a review of the clinical benefits and medicolegal risks of metoclopramide. Nat Clin Pract Gastroenterol Hepatol 2006;3:138-148',
        identifier: '10.1038/ncpgasthep0442',
        kind: 'doi',
      },
      {
        label:
          'Parkman HP, Carlson MR, Gonyer D. Metoclopramide nasal spray reduces symptoms of gastroparesis in women, but not men, with diabetes: results of a phase 2B randomized study. Clin Gastroenterol Hepatol 2015;13:1256-1263',
        identifier: '10.1016/j.cgh.2014.12.030',
        kind: 'doi',
      },
      {
        label:
          'Lewis K, Alqahtani Z, McIntyre L, Almenawer S, et al. The efficacy and safety of prokinetic agents in critically ill patients receiving enteral nutrition: a systematic review and meta-analysis of randomized trials. Crit Care 2016;20:259',
        identifier: '10.1186/s13054-016-1441-z',
        kind: 'doi',
      },
      {
        label:
          'Chen S, Seeman P, Liu F. Antipsychotic drug binding in the substantia nigra: an examination of high metoclopramide binding in the brains of normal, Alzheimer’s disease, Huntington’s disease and multiple sclerosis patients, and its relation to tardive dyskinesia. Synapse 2011;65:119-124',
        identifier: '10.1002/syn.20825',
        kind: 'doi',
      },
      ED_ANTIEMETIC_COCHRANE,
      {
        label:
          'Metoclopramide United States prescribing information — boxed warning, contraindications and indications (openFDA drug/label record)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3cc8ca5b-8b71-4c77-a181-9ce154597b9a',
        kind: 'regulatory',
      },
      {
        label:
          'European Medicines Agency — metoclopramide-containing medicines, Article 31 referral: CHMP opinion 26 July 2013, confirmed on re-examination 24 October 2013',
        identifier:
          'https://www.ema.europa.eu/en/medicines/human/referrals/metoclopramide-containing-medicines',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA — REGLAN tablets, NDA 017854, original approval 30 December 1980; GIMOTI nasal spray, NDA 209388, original approval 19 June 2020 (openFDA drugsfda record)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=017854',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Prochlorperazine — approved in 1956, six years before the FDA was allowed to ask whether a
  //    drug worked, and the one antiemetic here that puts nearly half the people given it into a
  //    state of motor restlessness they will not have been warned about.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'prochlorperazine',
    name: 'Prochlorperazine',
    tradeName: 'Compazine / Compro / Procomp',
    sponsor:
      'GlaxoSmithKline (holder of NDA 010571, original approval 23 October 1956, brand discontinued); marketed in the United States entirely as generics — Cosette, Chartwell, Jubilant Cadista, Zydus, Aurobindo and others',
    targetGene: 'DRD2',
    targetProtein:
      'D2 dopamine receptor in the chemoreceptor trigger zone of the area postrema; the same receptor in the nigrostriatal pathway produces the motor adverse effects',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1956,
    indication:
      'Control of severe nausea and vomiting; treatment of schizophrenia; short-term treatment of generalised non-psychotic anxiety, at no more than 20 mg a day and no longer than 12 weeks',
    patientFriendlyIndication: 'Severe sickness and vomiting; also used in schizophrenia',
    anatomicalSite:
      'Chemoreceptor trigger zone in the area postrema of the medulla — the one part of the brain that sits outside the blood-brain barrier and samples the blood directly',
    conditionContext: {
      conditionExplainer:
        'Vomiting is a reflex, not a symptom of one organ. A cluster of cells in the floor of the fourth ventricle called the chemoreceptor trigger zone sits outside the blood-brain barrier, samples the blood for things that should not be there, and signals the vomiting centre. Dopamine is one of the transmitters it uses. Block the dopamine receptor there and the reflex is harder to trigger.',
      whyItMatters:
        'Prochlorperazine is a phenothiazine antipsychotic that was repurposed as an antiemetic, and it carries the whole antipsychotic safety profile with it: a boxed warning about deaths in elderly people with dementia, a tardive dyskinesia warning, and an acute motor restlessness called akathisia that a prospective study measured at 44% after a single intravenous dose. It is dispensed as an anti-sickness tablet, and most people taking it do not know it is an antipsychotic.',
      whoTakesThis:
        'Adults with severe nausea and vomiting from almost any cause, and — off-label but on the strongest randomised evidence the molecule has — people in emergency departments with acute migraine. The label forbids it in paediatric surgery, in children under two years or under 20 lb, and in comatose states or alongside large amounts of central nervous system depressants.',
      clinicalGoals:
        'Stopping the vomiting, and reducing the feeling of sickness. Those are two different endpoints and the drug performs differently on each. Nothing beyond symptom relief has ever been claimed for it.',
    },
    oneSentenceVerdict:
      'A 1956 phenothiazine that blocks D2 dopamine receptors in the chemoreceptor trigger zone, whose strongest randomised evidence is for a use it is not licensed for — 82% treatment success in acute migraine against 29% on placebo in 70 emergency patients — while the only placebo-controlled nausea trial Cochrane could pool found it no better than saline (−1.80 mm on a 100 mm scale, 95% CI −14.40 to 10.80) and a prospective study found akathisia in 44 of 100 patients within an hour of a single intravenous dose.',
    laymanHowItWorks:
      'A small patch of brain in the base of the skull sits outside the barrier that keeps most chemicals out of the brain, so it can taste the blood. When it finds something it does not like, it sets off the vomiting reflex, and one of the signals it uses is dopamine. Prochlorperazine sits on the dopamine receptor and blocks that signal, so the reflex is harder to set off. The problem is that the same receptor controls movement elsewhere in the brain, so blocking it can leave you unable to sit still — an intensely unpleasant restlessness called akathisia that in one study affected nearly half the people given a single injection.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 55,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1688 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 37 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 23 October 1956 under NDA 010571 as Compazine, with the injectable and suppository forms following in 1957 and 1959. The brand has been discontinued and the molecule has been generic for decades; there are ten or more current abbreviated applications across tablet, injectable and suppository forms. It is on the WHO Model List of Essential Medicines.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Every alternative to prochlorperazine is a trade between two failure modes. The dopamine blockers — prochlorperazine, metoclopramide, promethazine, droperidol — work faster on migraine and cost less, and all of them can produce acute movement disorders. The serotonin blockers — ondansetron, granisetron — do not cause akathisia and do prolong the QT interval. In the Cochrane review of the emergency department setting, only droperidol beat placebo, in a single trial of 48 people, and every other drug including prochlorperazine did not.',
      conventionalRx: [
        {
          name: 'Ondansetron (Zofran)',
          class: '5-HT3 serotonin receptor antagonist',
          howItCompares:
            'Blocks a different receptor entirely, so it produces no akathisia, no dystonia and no tardive dyskinesia. In the Cochrane pooling it was no better than placebo for emergency department nausea either (−4.32 mm, 95% CI −11.20 to 2.56, two trials, 250 participants), so the choice between the two is being made on adverse effects rather than on measured efficacy.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: no movement disorder; no antipsychotic boxed warning; better evidence in chemotherapy-induced vomiting. Cons: dose-dependent QT prolongation that cost the 32 mg intravenous dose its licence; constipation; no benefit over placebo in the pooled emergency department data.',
        },
        {
          name: 'Metoclopramide (Reglan)',
          class: 'D2 dopamine receptor antagonist with 5-HT4 prokinetic action',
          howItCompares:
            'Blocks the same receptor and adds gastric prokinesis. The 1995 trial that made prochlorperazine the preferred migraine drug used metoclopramide at 10 mg, at which dose it did not beat placebo (p=0.14). When the comparison was rerun in 2008 at 20 mg with diphenhydramine in both arms, the difference between the two drugs disappeared: mean change on a numeric rating scale 5.5 against 5.2 at one hour, difference 0.3 (95% CI −1.0 to 1.6).',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: same class at a comparable price; prokinetic where gastric stasis is the problem. Cons: carries its own boxed warning for tardive dyskinesia; restricted by the European Medicines Agency in 2013 to a maximum of five days.',
        },
        {
          name: 'Olanzapine',
          class: 'Second-generation antipsychotic with broad receptor blockade',
          howItCompares:
            'Directly compared against prochlorperazine in the one modern randomised trial either drug has in chemotherapy-induced nausea. Added to netupitant/palonosetron and dexamethasone in breast cancer patients, olanzapine reduced average maximum nausea to 2.37 against 3.22 on placebo (p<0.001), and prochlorperazine to 2.68 (p=0.008). Both beat placebo; olanzapine did better.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: the larger effect on nausea in a head-to-head design; now in the major chemotherapy antiemetic guidelines. Cons: markedly sedating; metabolic effects with continued use; also an antipsychotic and also carries the dementia mortality boxed warning.',
        },
        {
          name: 'Droperidol (Inapsine)',
          class: 'Butyrophenone D2 antagonist',
          howItCompares:
            'The only antiemetic in the Cochrane emergency department review that was statistically better than placebo at 30 minutes: −15.8 mm on a 100 mm scale (95% CI −26.98 to −4.62), in one trial of 48 participants. That is a single small trial and the review rated the overall evidence quality as low.',
          typicalCost: 'Not stated here — no verified United States acquisition cost was available',
          prosAndCons:
            'Pros: the only positive placebo comparison in the pooled emergency department data. Cons: a boxed warning for QT prolongation and torsades de pointes added in 2001 that removed it from routine use for two decades; the same akathisia risk as the phenothiazines.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ginger (Zingiber officinale)',
          activeCompound: 'Gingerols and shogaols',
          biologicalMechanism:
            'Not a dopamine blocker. The proposed mechanisms are peripheral, in the gut wall — 5-HT3 antagonism and prokinetic effects on gastric emptying — which is why it does not cause akathisia and why it does not do what prochlorperazine does.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: in a four-arm randomised trial of 744 patients on chemotherapy, 576 of whom were analysed, all ginger doses added to a 5-HT3 antagonist reduced acute nausea severity on day 1 against placebo (p=0.003), with the largest reductions at 0.5 g and 1.0 g daily (p=0.017 and p=0.036). The endpoint was a 7-point nausea rating, not vomiting episodes.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Know what akathisia feels like before it happens',
          action:
            'If, within an hour of an injection, you feel an unbearable need to move — pacing, rocking, an inability to sit still that feels like panic — say so immediately and name it.',
          patientImpact:
            'A prospective study of 100 emergency patients given a single 10 mg intravenous dose found akathisia in 44 of them within one hour (95% CI 34% to 54%), graded severe in 8. None of 40 control patients given saline or antibiotics developed it. It is frequently misread as anxiety about the underlying illness, and the response to that misreading is sometimes more of the same drug.',
          clinicalPrecaution:
            'A randomised trial found that 50 mg of intravenous diphenhydramine given with the prochlorperazine cut akathisia from 36% to 14%, an absolute reduction of 22% (95% CI 6% to 38%, p=0.01), at the cost of substantially more sedation.',
        },
        {
          name: 'It is an antipsychotic, and the age limits are hard limits',
          action:
            'Do not give it to a child under two years old or under 20 lb, and do not use it in paediatric surgery.',
          patientImpact:
            'Those are contraindications in the label, not cautions. The label also warns that the extrapyramidal symptoms prochlorperazine causes can be mistaken for the neurological signs of the illness causing the vomiting — Reye’s syndrome or another encephalopathy — and directs that it and other potential hepatotoxins be avoided in children and adolescents whose signs suggest Reye’s syndrome.',
          clinicalPrecaution:
            'The boxed warning covers increased mortality in elderly patients with dementia-related psychosis, a use for which prochlorperazine is not approved and in which it is nonetheless sometimes given for agitation.',
        },
        {
          name: 'Twelve weeks is the ceiling for the anxiety indication',
          action:
            'If it has been prescribed for anxiety rather than sickness, ask what the stop date is.',
          patientImpact:
            'The label states that for non-psychotic anxiety it should not be given at more than 20 mg a day or for longer than 12 weeks, because higher doses or longer intervals may cause persistent tardive dyskinesia that may prove irreversible. It adds that its effectiveness for anxiety was established in four-week studies.',
          clinicalPrecaution:
            'There is no known treatment for established tardive dyskinesia, and the label states the syndrome can develop after relatively brief treatment at low doses.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1CCN(CC1)CCCN2C3=CC=CC=C3SC4=C2C=C(C=C4)Cl',
      chemicalFormula: 'C20H24ClN3S',
      molecularWeight:
        '373.90 g/mol (free base); dispensed as the maleate salt orally and the edisylate salt for injection',
      targetReceptorAffinity:
        'A propylpiperazine phenothiazine. The label describes the antiemetic effect as a depressant action on the chemoreceptor trigger zone and does not quantify receptor affinity. Its calculated partition coefficient on the record is logP 3.91, which is the property that lets a molecule designed as an antipsychotic reach the central nervous system and produce motor adverse effects at antiemetic doses.',
      structureSource: {
        label:
          'PubChem CID 4917 (prochlorperazine) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4917',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'pcz-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identify the salt, because two different salts are two different products',
          description:
            'The oral product is prochlorperazine maleate and the injectable is prochlorperazine edisylate. The free base is the same molecule; the counter-ion changes the solubility, the assay and the milligram equivalence. A batch identified only as prochlorperazine has not been identified.',
          reagentsAndBuffer:
            'Prochlorperazine maleate and edisylate reference standards, ion chromatography for the counter-ion, UV spectrophotometry at the phenothiazine chromophore, Karl Fischer titration for water content',
        },
        {
          id: 'pcz-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Alkylate the phenothiazine nitrogen with a piperazinyl propyl chain',
          description:
            'The scaffold is 2-chlorophenothiazine, alkylated at the ring nitrogen with a three-carbon chain terminating in N-methylpiperazine. The chlorine position on the tricyclic ring and the length of that chain are what separate this molecule from chlorpromazine and from the antihistamine phenothiazines, and they are the difference between a drug that mainly sedates and one that mainly blocks D2.',
          dependsOnStepId: 'pcz-w1',
          reagentsAndBuffer:
            '2-chlorophenothiazine, 1-methyl-4-(3-chloropropyl)piperazine, sodium amide or sodium hydride in an aprotic solvent, inert atmosphere, reflux',
        },
        {
          id: 'pcz-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Remove the oxidation products the phenothiazine ring generates on standing',
          description:
            'Phenothiazines oxidise at sulfur to the sulfoxide and photodegrade, which is why these solutions discolour. The sulfoxide is not the drug and does not block D2 the same way. Purification and light protection are the same problem in this class.',
          dependsOnStepId: 'pcz-w2',
          reagentsAndBuffer:
            'Recrystallisation from ethanol or isopropanol, reversed-phase HPLC with photodiode array detection to resolve the sulfoxide, amber glassware, nitrogen headspace',
        },
        {
          id: 'pcz-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Separate D2 occupancy in the trigger zone from D2 occupancy in the striatum',
          description:
            'The therapeutic effect and the akathisia come from the same receptor in two different places. The area postrema lies outside the blood-brain barrier and the striatum lies behind it, so the only lever a chemist has is how readily the molecule crosses. Measuring total brain D2 occupancy reports the sum of the benefit and the harm and cannot tell them apart.',
          dependsOnStepId: 'pcz-w3',
          reagentsAndBuffer:
            'Cells expressing human DRD2 for binding, radioligand competition against [3H]-spiperone, paired area postrema and striatal tissue preparations, in vitro blood-brain barrier permeability model',
        },
        {
          id: 'pcz-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Score akathisia prospectively with a validated instrument and a control arm',
          description:
            'Akathisia is the adverse effect this drug is most often given for a second time because the first dose caused it and the restlessness was read as anxiety. Detecting it requires an explicit rating scale applied before and one hour after dosing, and a control group receiving a non-akathisic infusion. The 44% incidence figure exists because someone did exactly that; retrospective chart review reports a small fraction of it.',
          dependsOnStepId: 'pcz-w4',
          reagentsAndBuffer:
            'A validated akathisia rating scale with mild/moderate/severe grading, paired pre-dose and one-hour assessments, a control arm on saline or antibiotic infusion, 48-hour follow-up for delayed symptoms',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pcz-a1',
        category: 'measured',
        title: 'Akathisia in 44 of 100 patients within an hour of a single injection',
        laymanSummary:
          'When someone actually looked for it with a rating scale instead of waiting for patients to complain, nearly half the people given one intravenous dose developed an intense inability to sit still. None of the control patients did.',
        technicalDetails:
          'A prospective controlled study enrolled a convenience sample of 140 adults at an academic emergency department: 100 receiving 10 mg intravenous prochlorperazine for severe headache or vomiting, and 40 receiving a non-akathisic intravenous therapy such as saline or antibiotics as controls. All were assessed with an established akathisia scale before and one hour after infusion. Akathisia developed in 44 of 100 patients in the prochlorperazine group (44%, 95% CI 34% to 54%), graded mild in 14, moderate in 22 and severe in 8. Three further patients developed delayed symptoms within 48 hours. None of the 40 controls developed akathisia. Patients with pre-existing motor disorders, or who had recently received drugs with extrapyramidal, anticholinergic, sedative or anti-akathisic properties, were excluded — so this is the rate in people with no other explanation for it.',
        evidenceSource: 'Drotts DL, Vinson DR. Ann Emerg Med 1999;34(4 Pt 1):469-475',
        doi: '10.1016/s0196-0644(99)80048-1',
        measuredMetric:
          'Incidence of akathisia at 1 hour after a single 10 mg intravenous dose, against a concurrent non-akathisic control arm',
        auditFlag: 'verified',
      },
      {
        id: 'pcz-a2',
        category: 'measured',
        title: 'The akathisia is preventable, and the prevention is sedation',
        laymanSummary:
          'Giving an antihistamine alongside it cut the restlessness from 36% to 14%. It also nearly tripled how sedated people felt.',
        technicalDetails:
          'A randomised, double-blind, placebo-controlled trial enrolled 100 adults receiving 10 mg intravenous prochlorperazine for nausea, vomiting or headache, randomised to 50 mg intravenous diphenhydramine or placebo alongside it. Akathisia at one hour occurred in 18 of 50 controls (36%) against 7 of 50 in the diphenhydramine group (14%): an absolute reduction of 22% (95% CI 6% to 38%, p=0.01) and an odds ratio of 0.39 (95% CI 0.18 to 0.85). Sedation, measured on a 100 mm visual analogue scale, rose 12 mm after prochlorperazine alone (95% CI 3 to 21) against 33 mm with diphenhydramine (95% CI 24 to 42), a difference significant at p<0.001. So the standard mitigation trades an akathisia risk for a sedation certainty, and both effects are measured rather than assumed.',
        evidenceSource: 'Vinson DR, Drotts DL. Ann Emerg Med 2001;37(2):125-131',
        doi: '10.1067/mem.2001.113032',
        measuredMetric:
          'Akathisia incidence and 100 mm visual analogue sedation score with and without adjuvant diphenhydramine',
        auditFlag: 'verified',
      },
      {
        id: 'pcz-a3',
        category: 'failed',
        title: 'Against placebo for nausea, the pooled result is nothing',
        laymanSummary:
          'The Cochrane review of anti-sickness drugs in emergency departments found one placebo-controlled trial of prochlorperazine, in 50 people. The difference against saline was 1.8 mm on a 100 mm scale, with a confidence interval running from 14 mm better to 11 mm worse.',
        technicalDetails:
          'The Cochrane review included eight trials and 952 participants. Three trials with 518 participants compared five drugs with placebo on mean change in a 0 to 100 nausea visual analogue scale from baseline to 30 minutes. Prochlorperazine: mean difference −1.80 (95% CI −14.40 to 10.80), one trial, 50 participants. Metoclopramide −5.27 (95% CI −11.33 to 0.80); ondansetron −4.32 (95% CI −11.20 to 2.56); promethazine −8.47 (95% CI −19.79 to 2.85); droperidol −15.8 (95% CI −26.98 to −4.62). Droperidol, in a single trial of 48 participants, was the only drug statistically superior to placebo. The reviewers concluded there is no definite evidence to support the superiority of any one drug over any other, or of any drug over placebo, and noted that participants receiving placebo often reported clinically significant improvement in nausea. Overall evidence quality was rated low, chiefly because there were not enough data.',
        evidenceSource: ED_ANTIEMETIC_COCHRANE.label,
        doi: '10.1002/14651858.CD010106.pub2',
        measuredMetric:
          'Mean difference in 0-100 nausea visual analogue scale from baseline to 30 minutes against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'pcz-a4',
        category: 'conclusion_shift',
        title: 'The 1995 result that made it the migraine drug did not survive a fair dose',
        laymanSummary:
          'In 1995 prochlorperazine beat metoclopramide for migraine by a wide margin, and metoclopramide did not beat placebo. In 2008 the same comparison was rerun with double the metoclopramide dose and the difference vanished.',
        technicalDetails:
          'Coppola et al. randomised 70 adults with migraine in a military emergency department to 10 mg intravenous metoclopramide, 10 mg intravenous prochlorperazine or saline. At 30 minutes, median pain on a 10 cm visual analogue scale was 1.1 cm with prochlorperazine, 3.9 cm with metoclopramide and 6.1 cm with placebo (p=0.003); a priori defined clinical success occurred in 82%, 46% and 29% respectively (p=0.03), and metoclopramide did not differ from placebo (p=0.14). Friedman et al. reran the comparison in 2008 at 10 mg prochlorperazine against 20 mg metoclopramide, with 25 mg diphenhydramine in both arms, in 77 randomised patients. Mean change in numeric rating scale at one hour was 5.5 against 5.2, a difference of 0.3 (95% CI −1.0 to 1.6), with the same finding at 2 and 24 hours; adverse events occurred in 46% against 32% (difference 15%, 95% CI −6% to 36%). The 1995 conclusion was a dose comparison misread as a molecule comparison. The 2008 trial had no placebo arm, so what it establishes is equivalence between the two drugs, not that either beats saline.',
        evidenceSource:
          'Coppola M, Yealy DM, Leibold RA. Ann Emerg Med 1995;26:541-546; Friedman BW et al. Ann Emerg Med 2008;52:399-406',
        doi: '10.1016/j.annemergmed.2007.09.027',
        inferredClaim:
          'That prochlorperazine is superior to metoclopramide for acute migraine — established in 1995 against a 10 mg metoclopramide comparator and not reproduced against 20 mg',
        auditFlag: 'contested',
      },
      {
        id: 'pcz-a5',
        category: 'measured',
        title: 'It does beat placebo for nausea in chemotherapy, and loses to olanzapine',
        laymanSummary:
          'The one modern randomised trial added prochlorperazine to a full modern anti-sickness regimen in breast cancer patients. It reduced nausea. Olanzapine, in the same trial, reduced it more.',
        technicalDetails:
          'A three-arm randomised trial run by the University of Rochester NCORP Research Base (NCT03367572, 1,363 registered) gave netupitant/palonosetron plus dexamethasone to all participants and added placebo (n=91), prochlorperazine (n=110) or olanzapine (n=109) in the analysed cohort. Average maximum nausea at cycle 2 on a 7-point scale was 3.22 ± 0.164 on placebo, 2.68 ± 0.147 with prochlorperazine (p=0.008) and 2.37 ± 0.152 with olanzapine (p<0.001). Average nausea was 1.90 ± 0.101, 1.62 ± 0.090 (p=0.010) and 1.45 ± 0.093 (p=0.001) respectively. This is the cleanest positive nausea result the molecule has, it is against a placebo added on top of an already effective regimen rather than against nothing, and the drug it was benchmarked against did better.',
        evidenceSource:
          'ClinicalTrials.gov NCT03367572 — Netupitant/Palonosetron Hydrochloride and Dexamethasone With or Without Prochlorperazine or Olanzapine in Improving Chemotherapy-Induced Nausea and Vomiting in Patients With Breast Cancer, posted results',
        measuredMetric:
          'Average and average-maximum nausea on a 7-point rating scale at chemotherapy cycle 2',
        auditFlag: 'verified',
      },
      {
        id: 'pcz-a6',
        category: 'inferred',
        title: 'Approved six years before the FDA could ask whether it worked',
        laymanSummary:
          'Compazine was approved in October 1956. The law requiring proof that a drug is effective, not merely safe, was passed in 1962. The anti-sickness indication has never been through a modern efficacy review.',
        technicalDetails:
          'NDA 010571 was originally approved on 23 October 1956, with the further phenothiazine applications NDA 011000, NDA 011188 and NDA 011127 following in 1957 and 1959. The Kefauver-Harris Amendment of 1962 first required substantial evidence of effectiveness, and the Drug Efficacy Study Implementation review that followed applied to pre-1962 products. The current label carries an explicit effectiveness statement for exactly one indication — "The effectiveness of prochlorperazine as treatment for non-psychotic anxiety was established in 4-week clinical studies of outpatients with generalized anxiety disorder" — and none at all for "For control of severe nausea and vomiting", the indication for which the overwhelming majority of prescriptions are written. The label further states the drug has not been shown effective in the management of behavioural complications in patients with mental retardation, and that the anxiety evidence does not predict usefulness in other non-psychotic conditions in which anxiety or signs mimicking anxiety are found.',
        evidenceSource:
          'Prochlorperazine maleate United States prescribing information, Indications and Usage; openFDA Drugs@FDA records for NDA 010571, NDA 011000, NDA 011127 and NDA 011188',
        inferredClaim:
          'That the antiemetic indication rests on the same standard of evidence as a modern approval — when the label supplies an effectiveness statement only for the anxiety indication and the product predates the requirement by six years',
        auditFlag: 'caution',
      },
      {
        id: 'pcz-a7',
        category: 'failed',
        title: 'An anti-sickness tablet that carries an antipsychotic boxed warning',
        laymanSummary:
          'Prochlorperazine is a phenothiazine antipsychotic. It carries the whole class warning: more deaths among elderly people with dementia, and a movement disorder that can be permanent.',
        technicalDetails:
          'The label carries the antipsychotic class boxed warning for increased mortality in elderly patients with dementia-related psychosis, and states that prochlorperazine is not approved for that use. The warnings section states that tardive dyskinesia — potentially irreversible involuntary dyskinetic movements — may develop, that whether antipsychotic products differ in their potential to cause it is unknown, that risk rises with duration and cumulative dose, and that it can nonetheless develop after relatively brief treatment at low doses, with no known treatment for established cases. Contraindications include comatose states, the presence of large amounts of central nervous system depressants, paediatric surgery, and children under two years or under 20 lb. The label also warns that the extrapyramidal symptoms the drug causes may be confused with the central nervous system signs of the undiagnosed disease responsible for the vomiting, such as Reye’s syndrome. Reported adverse reactions include neuroleptic malignant syndrome, cholestatic jaundice, leukopenia and agranulocytosis.',
        evidenceSource:
          'Prochlorperazine maleate United States prescribing information — Boxed Warning, Warnings, Contraindications and Adverse Reactions (openFDA drug/label record)',
        measuredMetric:
          'Boxed warning and contraindication set carried by an over-the-counter-adjacent antiemetic indication',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, injected or given as a suppository',
        laymanDesc:
          'Because it is given to people who are vomiting, the routes that bypass the stomach matter. An injection into muscle starts working in ten to twenty minutes and lasts three to four hours.',
        molecularDetail:
          'Marketed as the maleate salt in tablets and as the edisylate salt in solution for injection, plus a suppository. The label states that following intramuscular administration of prochlorperazine edisylate the drug has an onset of action within ten to twenty minutes and a duration of action of three to four hours.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the one part of the brain that is deliberately unprotected',
        laymanDesc:
          'The chemoreceptor trigger zone sits outside the barrier that keeps chemicals out of the brain, so that it can detect poisons in the blood and trigger vomiting. A drug does not have to cross anything to reach it.',
        molecularDetail:
          'The area postrema, in the floor of the fourth ventricle, is a circumventricular organ with fenestrated capillaries and no functional blood-brain barrier. Its dopaminergic input to the nucleus tractus solitarius is the pathway the label refers to as the chemoreceptor trigger zone. Prochlorperazine also crosses into brain tissue proper — calculated logP 3.91 — which is why the motor adverse effects exist at antiemetic doses.',
        iconName: 'Brain',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The dopamine receptor is blocked',
        laymanDesc:
          'Prochlorperazine occupies the dopamine receptor so the trigger zone cannot pass its signal on.',
        molecularDetail:
          'Antagonism at the D2 dopamine receptor. The label describes this only as "a depressant action on the chemoreceptor trigger zone" and does not quantify affinity or occupancy; the class assignment is a propylpiperazine phenothiazine, structurally a 2-chlorophenothiazine bearing an N-methylpiperazinyl propyl chain.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The vomiting reflex loses one of its inputs',
        laymanDesc:
          'With the dopamine signal blocked, the reflex is harder to set off — but only the dopamine part of it. Signals arriving by other routes are untouched.',
        molecularDetail:
          'The emetic reflex integrates vagal afferents from the gut, vestibular input, cortical input and the chemoreceptor trigger zone. Blocking D2 removes one afferent limb. This is the structural reason a single-receptor antiemetic works for some causes of vomiting and not others, and why combination antiemetic regimens in chemotherapy stack drugs against different receptors rather than raising the dose of one.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'For some people, the vomiting stops',
        laymanDesc:
          'In chemotherapy, added on top of modern anti-sickness drugs, it measurably lowered nausea scores. In emergency departments against saline, the one pooled trial found no difference.',
        molecularDetail:
          'NCT03367572: average maximum nausea 2.68 ± 0.147 against 3.22 ± 0.164 on placebo (p=0.008) at cycle 2 in breast cancer patients also receiving netupitant/palonosetron and dexamethasone. Cochrane 2015 emergency department pooling: mean difference against placebo −1.80 mm on a 100 mm scale (95% CI −14.40 to 10.80), one trial, 50 participants.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And for nearly half of them, they cannot sit still',
        laymanDesc:
          'The same receptor block, in the movement circuits of the brain, produces akathisia — a restlessness so unpleasant that patients have described it as worse than the sickness.',
        molecularDetail:
          'D2 blockade in the nigrostriatal pathway. Measured prospectively at 44% within one hour of a single 10 mg intravenous dose (95% CI 34% to 54%), severe in 8 of 100, against 0 of 40 controls. Reducible to 14% by co-administered diphenhydramine at the cost of a 33 mm rather than 12 mm rise in visual analogue sedation. The chronic counterpart, tardive dyskinesia, is why the label caps the anxiety indication at 12 weeks.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT03367572 (University of Rochester NCORP Research Base)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, three arms',
        sampleSize: 1363,
        primaryEndpoint:
          'Average nausea and average maximum nausea on a 7-point rating scale at chemotherapy cycle 2, added to netupitant/palonosetron plus dexamethasone in breast cancer patients',
        endpointMet: true,
        statisticalPValue:
          'Average maximum nausea 2.68 ± 0.147 with prochlorperazine (n=110) against 3.22 ± 0.164 on placebo (n=91), p=0.008; average nausea 1.62 ± 0.090 against 1.90 ± 0.101, p=0.010',
        unreportedAdverseSignals:
          'The olanzapine arm (n=109) did better on both endpoints: 2.37 ± 0.152 (p<0.001) and 1.45 ± 0.093 (p=0.001). 1,363 were registered against 310 in the three analysed arms, and the endpoint is a nausea rating rather than a vomiting count.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Coppola 1995 (Ann Emerg Med 1995;26:541-546)',
        phase: 'Randomised, double-blind, placebo-controlled, three arms',
        sampleSize: 70,
        primaryEndpoint:
          'Clinically important treatment success at 30 minutes in acute migraine — patient satisfaction plus either a 50% fall in pain score or an absolute score of 2.5 cm or less',
        endpointMet: true,
        statisticalPValue:
          'Success 82% with prochlorperazine against 46% metoclopramide and 29% placebo (p=0.03); median 30-minute pain 1.1 cm, 3.9 cm and 6.1 cm (p=0.003)',
        unreportedAdverseSignals:
          'Metoclopramide at 10 mg did not differ from placebo (p=0.14), and nausea — the symptom the drug is licensed for — did not separate between groups (p=0.64). Migraine is not an approved indication for prochlorperazine in the United States.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Friedman 2008 (Ann Emerg Med 2008;52:399-406)',
        phase: 'Randomised, double-blind, active-controlled, no placebo arm',
        sampleSize: 77,
        primaryEndpoint:
          'Between-group difference in change in numeric pain rating scale from baseline to 1 hour, prochlorperazine 10 mg against metoclopramide 20 mg, both with 25 mg diphenhydramine',
        endpointMet: false,
        statisticalPValue:
          'Mean change 5.5 against 5.2; difference 0.3 (95% CI −1.0 to 1.6). No difference at 2 or 24 hours',
        unreportedAdverseSignals:
          'Adverse events in 46% (18/39) against 32% (12/38), difference 15% (95% CI −6% to 36%). With no placebo arm and no pre-specified non-inferiority margin, a null result here shows the two drugs are indistinguishable, not that either works.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Akathisia in 44 of 100 patients within one hour of a single 10 mg intravenous dose (95% CI 34% to 54%), severe in 8, against 0 of 40 controls',
        'Adjuvant diphenhydramine cut akathisia from 36% to 14%, an absolute reduction of 22% (95% CI 6% to 38%, p=0.01), with sedation rising 33 mm rather than 12 mm on a 100 mm scale',
        'Average maximum nausea 2.68 against 3.22 on placebo at chemotherapy cycle 2 (p=0.008), added to netupitant/palonosetron and dexamethasone',
        'Clinical success in acute migraine 82% against 29% on placebo at 30 minutes in 70 emergency patients (p=0.03)',
      ],
      unsupportedInferences: [
        'That the antiemetic indication was ever supported by trials meeting a modern efficacy standard — the product was approved in 1956 and the label supplies an effectiveness statement only for the anxiety indication',
        'That prochlorperazine is superior to metoclopramide for migraine, a 1995 conclusion drawn against a 10 mg metoclopramide comparator and not reproduced against 20 mg',
        'That relieving vomiting and relieving nausea are the same result — the 1995 migraine trial separated dramatically on pain and not at all on nausea (p=0.64)',
        'That the akathisia rate seen in practice is the true rate; it is measured at 44% only when someone applies a rating scale prospectively',
      ],
      whatFailedInitially: [
        'Against placebo for emergency department nausea, the single poolable trial found −1.80 mm on a 100 mm scale (95% CI −14.40 to 10.80) — no effect',
        'In the same Cochrane review, no antiemetic beat placebo except droperidol in one trial of 48 people, and placebo recipients frequently reported clinically significant improvement',
        'The 2008 head-to-head against a proper metoclopramide dose found no difference at 1, 2 or 24 hours and no placebo arm to anchor either result',
        'The label states the drug has not been shown effective in behavioural complications in patients with mental retardation, and that its anxiety evidence does not predict usefulness in other non-psychotic conditions',
      ],
      realWorldOutcome: [
        'Approved 23 October 1956 under NDA 010571 as Compazine; the brand is discontinued and ten or more generic applications remain current across tablet, injectable and suppository',
        'Costs about seventeen United States cents a unit at pharmacy acquisition, and is on the WHO Model List of Essential Medicines',
        'Its strongest randomised evidence is in acute migraine, a use the United States label does not cover',
        'Carries the antipsychotic class boxed warning on increased mortality in elderly patients with dementia-related psychosis, and a tardive dyskinesia warning that caps the anxiety indication at 12 weeks',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet (maleate), solution for intramuscular or intravenous injection (edisylate), and rectal suppository',
      description:
        'Three routes because the target population is vomiting. The label states that after intramuscular administration of the edisylate salt, onset of action is within ten to twenty minutes and duration of action is three to four hours. The oral and rectal forms carry the maleate salt.',
      safetyProfile:
        'Boxed warning: increased mortality in elderly patients with dementia-related psychosis; not approved for that use. Contraindicated in known phenothiazine hypersensitivity, comatose states, the presence of large amounts of central nervous system depressants, paediatric surgery, children under two years or under 20 lb, and children for conditions where dosage has not been established. Warnings cover tardive dyskinesia — potentially irreversible and possible after brief low-dose treatment, with no known treatment for established cases — and the risk that extrapyramidal symptoms are mistaken for the neurological signs of an undiagnosed encephalopathy such as Reye’s syndrome. Reported adverse reactions include drowsiness, dizziness, hypotension, amenorrhoea, blurred vision, neuroleptic malignant syndrome, cholestatic jaundice, leukopenia and agranulocytosis. Acute akathisia was measured at 44% one hour after a single 10 mg intravenous dose in a prospective controlled study.',
    },
    commonQuestions: [
      {
        q: 'Why do I feel so restless and agitated after the injection?',
        a: 'That is very likely akathisia, and it is the most common thing this drug does. A prospective study measured it in 44 of 100 emergency patients within an hour of a single 10 mg intravenous dose, graded severe in 8 of them; none of the 40 control patients given saline or antibiotics developed it. It is a movement side effect, not anxiety and not a sign that the underlying illness is worsening, and it matters that it is named correctly, because it is frequently misread as agitation and treated with more of the same class of drug. A randomised trial found that 50 mg of intravenous diphenhydramine given alongside cut the incidence from 36% to 14%, at the cost of considerably more sedation.',
        auditNote:
          'The 44% figure exists because someone applied a rating scale before and after dosing with a control arm. Passive reporting finds a small fraction of that number, which is why the label describes motor restlessness without an incidence.',
      },
      {
        q: 'Is prochlorperazine actually better than the alternatives for sickness?',
        a: 'The pooled evidence does not show that, and does not show it is better than placebo either. The Cochrane review of antiemetics in emergency departments found one placebo-controlled prochlorperazine trial in 50 people, with a mean difference of 1.8 mm on a 100 mm nausea scale and a confidence interval spanning 14 mm better to 11 mm worse. Across all five drugs it examined, only droperidol beat placebo, in a single trial of 48 participants, and the reviewers noted that people receiving placebo often reported clinically significant improvement in their nausea. Where it does have a clean positive result is chemotherapy: added to a modern regimen in breast cancer patients it reduced average maximum nausea from 3.22 to 2.68 on a 7-point scale (p=0.008), while olanzapine in the same trial reduced it to 2.37.',
      },
      {
        q: 'I was told this is an anti-sickness tablet. Why does it have a warning about dementia on it?',
        a: 'Because it is an antipsychotic that is also used as an antiemetic. Prochlorperazine is a phenothiazine, the same chemical family as chlorpromazine, and its label carries the antipsychotic class boxed warning that elderly patients with dementia-related psychosis treated with antipsychotic drugs are at increased risk of death — a use for which it is not approved. It also carries the class warning on tardive dyskinesia, an involuntary movement disorder that can be permanent, which the label says can develop after relatively brief treatment at low doses and for which there is no known treatment once established. That is why the label caps its anxiety indication at 20 mg a day for no more than 12 weeks.',
      },
      {
        q: 'Why is it given for migraine when the label does not mention migraine?',
        a: 'Because the randomised evidence for migraine is stronger than the randomised evidence for the indication it is licensed for. A 1995 trial randomised 70 emergency patients to prochlorperazine, metoclopramide or saline: treatment success was 82%, 46% and 29% (p=0.03), and median 30-minute pain scores were 1.1 cm, 3.9 cm and 6.1 cm on a 10 cm scale (p=0.003). That is a large effect against placebo. One caution about how it is often summarised: the 2008 rerun using 20 mg of metoclopramide instead of 10 mg found the two drugs indistinguishable, so the claim that prochlorperazine is the better migraine drug rests on the dose the comparator was given rather than on the molecule.',
        auditNote:
          'A drug can have better evidence for an unlicensed use than a licensed one. Prochlorperazine is the clearest common example, and its label will never mention it, because nobody has an incentive to file for a new indication on a molecule that costs seventeen cents.',
      },
      {
        q: 'Can children take it?',
        a: 'Not below the limits in the label, which are contraindications rather than cautions: not in children under two years of age or under 20 lb, not in paediatric surgery, and not in children for conditions where a dose has not been established. The label carries an additional and specific warning that the extrapyramidal symptoms prochlorperazine can cause may be confused with the central nervous system signs of the undiagnosed illness responsible for the vomiting — Reye’s syndrome or another encephalopathy — and directs that prochlorperazine and other potential hepatotoxins be avoided in children and adolescents whose signs and symptoms suggest Reye’s syndrome.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Drotts DL, Vinson DR. Prochlorperazine induces akathisia in emergency patients. Ann Emerg Med 1999;34(4 Pt 1):469-475',
        identifier: '10.1016/s0196-0644(99)80048-1',
        kind: 'doi',
      },
      {
        label:
          'Vinson DR, Drotts DL. Diphenhydramine for the prevention of akathisia induced by prochlorperazine: a randomized, controlled trial. Ann Emerg Med 2001;37(2):125-131',
        identifier: '10.1067/mem.2001.113032',
        kind: 'doi',
      },
      {
        label:
          'Coppola M, Yealy DM, Leibold RA. Randomized, placebo-controlled evaluation of prochlorperazine versus metoclopramide for emergency department treatment of migraine headache. Ann Emerg Med 1995;26:541-546',
        identifier: '10.1016/s0196-0644(95)70001-3',
        kind: 'doi',
      },
      {
        label:
          'Friedman BW, Esses D, Solorzano C, et al. A randomized controlled trial of prochlorperazine versus metoclopramide for treatment of acute migraine. Ann Emerg Med 2008;52(4):399-406',
        identifier: '10.1016/j.annemergmed.2007.09.027',
        kind: 'doi',
      },
      {
        label:
          'ClinicalTrials.gov NCT03367572 — Netupitant/Palonosetron Hydrochloride and Dexamethasone With or Without Prochlorperazine or Olanzapine in Improving Chemotherapy-Induced Nausea and Vomiting in Patients With Breast Cancer (University of Rochester NCORP Research Base), posted results',
        identifier: 'NCT03367572',
        kind: 'nct',
      },
      {
        label:
          'Ryan JL, Heckler CE, Roscoe JA, et al. Ginger (Zingiber officinale) reduces acute chemotherapy-induced nausea: a URCC CCOP study of 576 patients. Support Care Cancer 2012;20(7):1479-1489',
        identifier: '10.1007/s00520-011-1236-3',
        kind: 'doi',
      },
      {
        label:
          'Prochlorperazine maleate United States prescribing information — Boxed Warning, Indications and Usage, Warnings, Contraindications, Adverse Reactions and Clinical Pharmacology (openFDA drug/label record)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22prochlorperazine%22&limit=1',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA — COMPAZINE (prochlorperazine), NDA 010571 original approval 23 October 1956; NDA 011000 (1957), NDA 011188 (1957), NDA 011127 (1959), GlaxoSmithKline',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=010571',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 4917 — prochlorperazine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4917',
        kind: 'url',
      },
      ED_ANTIEMETIC_COCHRANE,
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Aprepitant — licensed for the prevention of nausea and vomiting, on two pivotal trials in
  //    which vomiting separated dramatically and, by the label’s own table, nausea did not.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'aprepitant',
    name: 'Aprepitant',
    tradeName: 'Emend / Cinvanti / Aponvie',
    sponsor:
      'Merck Sharp & Dohme (NDA 021549, capsules, original approval 26 March 2003; NDA 022023, intravenous fosaprepitant, 2008; NDA 207865, oral suspension, 2015). Now also generic, and marketed by Heron as the injectable emulsions Cinvanti and Aponvie',
    targetGene: 'TACR1',
    targetProtein:
      'Neurokinin-1 receptor — the receptor for substance P, in the brainstem emetic circuitry; the label records that PET studies show aprepitant crosses the blood-brain barrier and occupies brain NK1 receptors',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2003,
    indication:
      'In combination with other antiemetic agents, for prevention of acute and delayed nausea and vomiting associated with initial and repeat courses of highly emetogenic cancer chemotherapy including high-dose cisplatin, and of nausea and vomiting associated with moderately emetogenic chemotherapy; and, for the injectable forms, prevention of postoperative nausea and vomiting in adults. Limitations of use: not studied for the treatment of established nausea and vomiting; chronic continuous administration not recommended',
    patientFriendlyIndication:
      'Preventing sickness and vomiting caused by chemotherapy, and after surgery',
    anatomicalSite:
      'Neurokinin-1 receptors in the brainstem emetic circuitry — the nucleus tractus solitarius and area postrema, where substance P signals rather than dopamine or serotonin',
    conditionContext: {
      conditionExplainer:
        'Chemotherapy sets off vomiting through at least three separate chemical signals, on two different timescales. Serotonin released from gut enterochromaffin cells drives the vomiting in the first day. Substance P acting on the neurokinin-1 receptor in the brainstem drives the delayed phase, from about 25 to 120 hours, which serotonin blockers barely touch. Aprepitant was built for that second window.',
      whyItMatters:
        'Aprepitant is the drug that made the delayed phase treatable, and it is also the clearest available example of a licence that names two symptoms when the evidence separates on one. The indication reads "nausea and vomiting". In both pivotal trials, every vomiting endpoint separated at p<0.001 and every nausea endpoint was reported by the label as not statistically significant.',
      whoTakesThis:
        'People receiving highly or moderately emetogenic chemotherapy, given as a three-day oral course or as a single intravenous dose, always on top of a 5-HT3 antagonist and a corticosteroid rather than instead of them. The injectable forms are also given before surgery. It is a preventive: the label states it has not been studied for treating nausea and vomiting that has already started.',
      clinicalGoals:
        'Complete response — no vomiting and no rescue medication — across the 120 hours after chemotherapy. That is the endpoint the drug was licensed on, and it is a vomiting endpoint, not a nausea endpoint.',
    },
    oneSentenceVerdict:
      'A neurokinin-1 receptor antagonist that raised complete response — no vomiting and no rescue medication over 120 hours — from 52% to 73% and from 43% to 63% in its two pivotal cisplatin trials (both p<0.001), while its own label reports that in both of those trials the nausea endpoints were not statistically significant, and that the ondansetron 32 mg intravenous comparator dose used throughout is no longer a recommended dose.',
    laymanHowItWorks:
      'Chemotherapy makes people sick through more than one chemical signal. The older anti-sickness drugs block serotonin, which is what causes the vomiting on the first day. Aprepitant blocks a different messenger called substance P at a receptor in the brainstem, and that messenger is what drives the vomiting on days two to five — the part the older drugs never fixed. It is always added to the older drugs rather than replacing them. What it reliably prevents is vomiting; whether it makes you feel less sick is a separate question its licensing trials did not answer in the affirmative.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 70,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$76.85 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 33 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved 26 March 2003 under NDA 021549 as Emend capsules, with intravenous fosaprepitant following in 2008 and an oral suspension in 2015. Generic capsules are now available and the NADAC median above reflects them. Even generic, a single course costs roughly four hundred times a dose of generic ondansetron, which is the drug it is added to rather than a drug it replaces.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Aprepitant has no substitute for what it does — nothing else blocks NK1 — but it has a serious competitor for what it is often expected to do. The gap its pivotal trials left open is nausea, and the drug that closed that gap is olanzapine, an off-patent antipsychotic that in a National Cancer Institute trial was added on top of aprepitant and improved nausea prevention from 22% to 37% over 120 hours.',
      conventionalRx: [
        {
          name: 'Olanzapine',
          class: 'Second-generation antipsychotic, multi-receptor including D2 and 5-HT2A',
          howItCompares:
            'Not an alternative but the missing piece. In a randomised phase 3 trial of 380 evaluable patients, olanzapine was added to dexamethasone, a 5-HT3 antagonist and aprepitant or fosaprepitant. Nausea prevention was the primary endpoint and it was met: no nausea in 74% against 45% in the first 24 hours, 42% against 25% from 25 to 120 hours, and 37% against 22% overall (all p=0.002). Complete response also rose, 64% against 41% overall (p<0.001).',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: it hit the nausea endpoint aprepitant’s own trials did not; off-patent and inexpensive; now in the major chemotherapy antiemetic guidelines. Cons: sedation, severe in 5% on day 2; carries the antipsychotic class boxed warning about mortality in elderly patients with dementia.',
        },
        {
          name: 'Ondansetron or palonosetron',
          class: '5-HT3 serotonin receptor antagonist',
          howItCompares:
            'The backbone aprepitant is added to, not a replacement. Serotonin blockade controls the acute phase and does comparatively little for the delayed phase, which is the window NK1 blockade was developed for. In the pivotal trials the delayed-phase complete response with ondansetron and dexamethasone alone was 56% and 47%, against 75% and 68% with aprepitant added.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: cents rather than tens of dollars; decades of use. Cons: dose-dependent QT prolongation — the 32 mg intravenous dose used as comparator throughout the aprepitant programme has since been removed; weak in the delayed phase.',
        },
        {
          name: 'Dexamethasone',
          class: 'Corticosteroid',
          howItCompares:
            'Also part of the backbone regimen, and the drug whose dose the aprepitant regimen has to change. Aprepitant is a moderate CYP3A4 inhibitor, so the label directs that oral dexamethasone be reduced by approximately 50% when given with it, and the pivotal trials accordingly gave 12 mg of dexamethasone on day 1 in the aprepitant arm against 20 mg in the control arm.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: cheap, effective, standard in every regimen. Cons: hyperglycaemia, insomnia, mood change; and its interaction with aprepitant means the two arms of the pivotal trials were not receiving the same milligram dose of it.',
        },
        {
          name: 'Fosaprepitant (Emend for injection), Cinvanti, Aponvie',
          class: 'Intravenous prodrug or emulsion of the same molecule',
          howItCompares:
            'A single 150 mg intravenous dose of fosaprepitant was shown non-inferior to the three-day oral aprepitant course in 2,322 randomised patients: complete response over 120 hours 71.9% against 72.3%, risk difference −0.4% (95% CI −4.1% to 3.3%). The choice between them is a route and formulation choice, not a pharmacological one.',
          typicalCost: 'Not stated here — no verified United States acquisition cost was available',
          prosAndCons:
            'Pros: one dose instead of three days; useful when swallowing is the problem. Cons: infusion-site reactions were the reason the polysorbate-80-free emulsion formulations were developed; same drug interactions.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ginger (Zingiber officinale)',
          activeCompound: 'Gingerols and shogaols',
          biologicalMechanism:
            'Peripheral mechanisms in the gut wall — proposed 5-HT3 antagonism and effects on gastric emptying — not NK1 blockade. It targets the endpoint aprepitant’s trials did not separate on: the sensation of nausea rather than the act of vomiting.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: in a four-arm randomised trial of 744 patients receiving chemotherapy, 576 analysed, ginger added to a 5-HT3 antagonist reduced acute nausea severity on day 1 against placebo (p=0.003), largest at 0.5 g and 1.0 g daily (p=0.017 and p=0.036). The endpoint was a 7-point nausea rating and the trial predates routine NK1 use.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'If you are on the pill, it may not work for a month',
          action:
            'Use an alternative or back-up method of contraception during aprepitant and for one month after the last dose.',
          patientImpact:
            'The label warns that the efficacy of hormonal contraceptives may be reduced during administration of and for 28 days following the last dose, and names birth control pills, skin patches, implants and certain intrauterine devices. This is a CYP3A4 induction effect and it outlasts the course by weeks.',
          clinicalPrecaution:
            'The 28-day window is in the label. It is longer than most people would assume from a three-day course of tablets.',
        },
        {
          name: 'If you take warfarin, your INR will move',
          action:
            'Expect an INR check in the two weeks after each cycle, particularly at days 7 to 10.',
          patientImpact:
            'Aprepitant induces CYP2C9, which clears warfarin. The label warns of a clinically significant decrease in INR and directs monitoring in the two-week period, particularly at 7 to 10 days, after starting the three-day regimen with each chemotherapy cycle.',
          clinicalPrecaution:
            'A falling INR on an unchanged warfarin dose after a chemotherapy cycle is a predictable drug interaction, not a compliance problem.',
        },
        {
          name: 'It is a preventive, not a rescue',
          action: 'It is given before chemotherapy, not when you already feel sick.',
          patientImpact:
            'The label states under Limitations of Use that aprepitant has not been studied for the treatment of established nausea and vomiting, and that chronic continuous administration is not recommended because it has not been studied and because the drug interaction profile may change during chronic continuous use.',
          clinicalPrecaution:
            'Taking a dose because sickness has already started is a use with no supporting evidence in the label.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@H](C1=CC(=CC(=C1)C(F)(F)F)C(F)(F)F)O[C@@H]2[C@@H](N(CCO2)CC3=NNC(=O)N3)C4=CC=C(C=C4)F',
      chemicalFormula: 'C23H21F7N4O3',
      molecularWeight: '534.40 g/mol',
      targetReceptorAffinity:
        'The label describes aprepitant as a selective high-affinity antagonist of human substance P/neurokinin 1 receptors with little or no affinity for serotonin 5-HT3, dopamine or corticosteroid receptors — the targets of the existing antiemetic classes. Animal and human positron emission tomography studies with aprepitant have shown that it crosses the blood-brain barrier and occupies brain NK1 receptors. The molecule carries seven fluorine atoms across a bis-trifluoromethylphenyl group and a fluorophenyl ring; the record’s calculated logP is 4.31.',
      structureSource: {
        label:
          'PubChem CID 135413536 (aprepitant) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135413536',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'apr-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm all three stereocentres before anything else',
          description:
            'Aprepitant is a single enantiomer with three defined stereocentres on a morpholine ring — the 2R,3S,1R configuration. The NK1 receptor discriminates between them, and a stereochemical impurity is a potency loss invisible to a routine achiral assay. This is the first check because everything downstream assumes it.',
          reagentsAndBuffer:
            'Aprepitant reference standard, chiral HPLC on a polysaccharide stationary phase, 19F NMR to count and place all seven fluorines, optical rotation, differential scanning calorimetry for polymorph identity',
        },
        {
          id: 'apr-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the morpholine core and attach the fluorinated aryl groups',
          description:
            'The scaffold is a 2,3-disubstituted morpholine bearing a 4-fluorophenyl group, a 1-(3,5-bis(trifluoromethyl)phenyl)ethoxy ether and a triazolinone methyl arm. The bis-trifluoromethylphenyl group is what gives the molecule its NK1 affinity and its high lipophilicity, and the triazolinone is what makes it orally tolerable.',
          dependsOnStepId: 'apr-w1',
          reagentsAndBuffer:
            '3,5-bis(trifluoromethyl)acetophenone, 4-fluorophenyl glycine derivatives, chiral reduction catalyst, 1,2,4-triazolin-5-one alkylating agent, anhydrous aprotic solvents under inert atmosphere',
        },
        {
          id: 'apr-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Reduce particle size, because the free drug barely dissolves',
          description:
            'Aprepitant is poorly water-soluble, which is why the marketed capsule is a nanoparticle formulation and why an intravenous prodrug, fosaprepitant, had to be developed separately. Purification here is inseparable from formulation: the crystal form and particle size determine whether an oral dose is absorbed at all.',
          dependsOnStepId: 'apr-w2',
          reagentsAndBuffer:
            'Recrystallisation and polymorph control, wet milling to nanoparticle size, surfactant stabilisers, dissolution testing in biorelevant media, laser diffraction particle sizing',
        },
        {
          id: 'apr-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Make the water-soluble phosphoryl prodrug for the intravenous route',
          description:
            'Fosaprepitant is aprepitant carrying a phosphoryl group on the triazolinone nitrogen, cleaved by endogenous phosphatases after infusion. The conjugation exists solely to solve the solubility problem in step 3, and the resulting product must be shown to convert quantitatively back to aprepitant.',
          dependsOnStepId: 'apr-w3',
          reagentsAndBuffer:
            'Phosphorylating reagent, dimeglumine counter-ion for salt formation, human plasma and liver microsome incubations to measure conversion, LC-MS/MS quantification of parent and prodrug',
        },
        {
          id: 'apr-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Show it reaches the brainstem receptor, not just the plasma',
          description:
            'An NK1 antagonist that does not cross the blood-brain barrier cannot work, because the receptors that matter are central. This is one of the rare antiemetic programmes where central target engagement was demonstrated directly rather than inferred from plasma concentration.',
          dependsOnStepId: 'apr-w4',
          reagentsAndBuffer:
            'Positron emission tomography with an NK1 radioligand in human volunteers, paired plasma sampling, receptor occupancy modelling against dose',
        },
        {
          id: 'apr-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Count vomiting and rate nausea as two separate endpoints, and report both',
          description:
            'The pivotal trials collected five endpoints from patient diaries: complete response, complete protection, no emesis, no nausea and no significant nausea, each defined against a 0 to 100 mm visual analogue scale. Reporting only the composite hides that the emesis endpoints and the nausea endpoints behaved differently. Any replication of this work should pre-specify a nausea endpoint and report it whichever way it falls.',
          dependsOnStepId: 'apr-w5',
          reagentsAndBuffer:
            'Patient diaries with 0-100 mm nausea visual analogue scales, emetic episode counts including retching and dry heaves, rescue medication logs, Functional Living Index–Emesis questionnaire, prespecified acute (0-24 h) and delayed (25-120 h) windows',
        },
      ],
    },
    keyAudits: [
      {
        id: 'apr-a1',
        category: 'measured',
        title: 'Complete response rose from 52% to 73% in the first pivotal trial',
        laymanSummary:
          'Adding aprepitant to the standard two-drug regimen raised the proportion of people who neither vomited nor needed rescue medication over five days from about half to about three quarters.',
        technicalDetails:
          'Protocol 052 randomised patients receiving cisplatin at 70 mg/m² or more for the first time to standard therapy — ondansetron and dexamethasone on day 1, dexamethasone days 2 to 4 — or the same plus aprepitant 125 mg on day 1 and 80 mg on days 2 to 3, with the day 1 dexamethasone reduced from 20 mg to 12 mg to account for the CYP3A4 interaction. The primary endpoint was complete response, defined as no emetic episode and no rescue therapy, on days 1 to 5, by modified intention to treat. Complete response was 72.7% with aprepitant (n=260) against 52.3% with standard therapy (n=260), with the acute phase and the delayed phase also separating (p<0.001 for all three comparisons). The label reports the same study as 73% against 52% overall, 89% against 78% acute and 75% against 56% delayed.',
        evidenceSource:
          'Hesketh PJ, Grunberg SM, Gralla RJ, et al. J Clin Oncol 2003;21(22):4112-4119 (Aprepitant Protocol 052); EMEND United States prescribing information, section 14.1, Table 12',
        doi: '10.1200/JCO.2003.01.095',
        measuredMetric:
          'Complete response — no emesis and no rescue therapy — over 120 hours after high-dose cisplatin',
        auditFlag: 'verified',
      },
      {
        id: 'apr-a2',
        category: 'measured',
        title: 'And from 43% to 63% in the second, in a different population',
        laymanSummary:
          'The same trial run across Latin America found the same direction and a similar size of effect, which is what independent replication of a registration trial is supposed to look like.',
        technicalDetails:
          'Protocol 054 was a multicentre, randomised, double-blind, placebo-controlled parallel-group phase 3 study in patients scheduled for high-dose cisplatin. Standard therapy was intravenous ondansetron 32 mg and oral dexamethasone 20 mg on day 1, then dexamethasone 8 mg twice daily on days 2 to 4. The aprepitant group received aprepitant 125 mg, ondansetron 32 mg and dexamethasone 12 mg on day 1, aprepitant 80 mg and dexamethasone 8 mg on days 2 to 3, and dexamethasone 8 mg on day 4. Of 568 patients evaluated for safety, 523 were evaluable for efficacy. Complete response over the 5 days after cisplatin was 62.7% (163/260) against 43.3% (114/263), p<0.001; day 1 82.8% against 68.4% (p<0.001); days 2 to 5 67.7% against 46.8% (p<0.001). Overall adverse event rates were near-identical, 72.8% against 72.6%.',
        evidenceSource:
          'Poli-Bigelli S, Rodrigues-Pereira J, Carides AD, et al. Cancer 2003;97(12):3090-3098 (Aprepitant Protocol 054)',
        doi: '10.1002/cncr.11433',
        measuredMetric:
          'Complete response — no emesis and no rescue therapy — over 120 hours after high-dose cisplatin',
        auditFlag: 'verified',
      },
      {
        id: 'apr-a3',
        category: 'failed',
        title:
          'The indication says nausea. The label’s own table says the nausea endpoints missed.',
        laymanSummary:
          'Aprepitant is licensed to prevent "nausea and vomiting". In both pivotal trials every vomiting endpoint separated at p<0.001 and every nausea endpoint is reported in the label as not statistically significant.',
        technicalDetails:
          'Table 12 of the EMEND label reports five prespecified endpoints for Studies 1 and 2. The emesis endpoints: complete response overall 73% against 52% and 63% against 43%, both p<0.001; no emesis overall 78% against 55% and 66% against 44%, both p<0.001. The nausea endpoints, defined on the same 0 to 100 mm visual analogue scale: no nausea (maximum VAS below 5 mm) overall 48% against 44% in Study 1 and 49% against 39% in Study 2, both marked NS; delayed-phase no nausea 51% against 48% and 53% against 40%, both NS. No significant nausea (maximum VAS below 25 mm) overall 73% against 66% and 71% against 64%, both NS; delayed phase 75% against 69% and 73% against 65%, both NS. Eight nausea comparisons across two trials, none statistically significant. Complete protection — which folds a nausea criterion into the composite — did separate, at 63% against 49% and 56% against 41%, which shows the effect is carried by the emesis component of that composite. The Functional Living Index–Emesis patient-reported outcome favoured aprepitant, 74% against 64% and 75% against 64% reporting minimal or no impact on daily life, but no p-value is given for it in the label.',
        evidenceSource:
          'EMEND (aprepitant) United States prescribing information, section 14.1, Table 12 — Percent of Patients Receiving HEC Responding by Treatment Group and Phase, Cycle 1',
        inferredClaim:
          'That aprepitant prevents nausea as well as vomiting — the wording of the indication, not the result of the eight nausea comparisons in the two trials that supported it',
        measuredMetric:
          'No nausea and no significant nausea, maximum visual analogue scale, overall and delayed phase, both pivotal studies',
        auditFlag: 'contested',
      },
      {
        id: 'apr-a4',
        category: 'conclusion_shift',
        title: 'The comparator dose no longer exists, and the label says so',
        laymanSummary:
          'Every pivotal trial compared aprepitant against a regimen containing a 32 mg intravenous dose of ondansetron. That dose was withdrawn on cardiac safety grounds and the aprepitant label now carries a footnote saying it is no longer recommended.',
        technicalDetails:
          'Table 11 of the EMEND label sets out the trial regimens and carries this footnote against the 5-HT3 antagonist row: "Ondansetron 32 mg intravenous was used in the clinical trials of EMEND. Although this dose was used in clinical trials, this is no longer the currently recommended dose. Refer to the ondansetron prescribing information for the current recommended dose." The 32 mg single intravenous dose was removed from the market on QT prolongation and torsades de pointes grounds. The consequence is specific and unresolved: the measured benefit of aprepitant is a benefit over a comparator arm that can no longer legally be given, and no pivotal trial has been repeated against the doses of ondansetron in current use. Whether the increment would be the same, larger or smaller against 8 or 16 mg has not been tested.',
        evidenceSource:
          'EMEND (aprepitant) United States prescribing information, section 14.1, Table 11 footnote; Poli-Bigelli S et al. Cancer 2003;97:3090-3098, which specifies intravenous ondansetron 32 mg in both arms',
        doi: '10.1002/cncr.11433',
        inferredClaim:
          'That the effect size measured in 2003 transfers to current practice — when the control regimen contained a dose of ondansetron that has since been withdrawn and never re-tested',
        auditFlag: 'caution',
      },
      {
        id: 'apr-a5',
        category: 'measured',
        title: 'One intravenous dose does what three days of capsules do',
        laymanSummary:
          'A single infusion of the water-soluble prodrug was formally shown to be no worse than the three-day oral course, in over two thousand patients.',
        technicalDetails:
          'NCT00619359 randomised 2,322 patients receiving cisplatin to a single 150 mg intravenous dose of fosaprepitant dimeglumine on day 1 or the standard oral aprepitant course of 125 mg on day 1 and 80 mg on days 2 to 3, both with ondansetron and dexamethasone. Complete response — no vomiting and no rescue therapy — over 120 hours occurred in 795 of 1,106 on fosaprepitant (71.9%) and 820 of 1,134 on aprepitant (72.3%), a risk difference of −0.4% (95% CI −4.1% to 3.3%), meeting the prespecified non-inferiority criterion. This is the largest trial the molecule has and it is a formulation comparison: it establishes that the route can change, not that either regimen beats anything.',
        evidenceSource:
          'ClinicalTrials.gov NCT00619359 — Evaluation of Fosaprepitant (MK0517) in Single Dose Schedule (protocol 0517-017), Merck Sharp & Dohme, posted results',
        measuredMetric:
          'Complete response over 120 hours, single intravenous fosaprepitant against three-day oral aprepitant, non-inferiority design',
        auditFlag: 'verified',
      },
      {
        id: 'apr-a6',
        category: 'inferred',
        title: 'Never tested on sickness that has already started',
        laymanSummary:
          'It is a preventive. The label states plainly that it has not been studied for treating nausea and vomiting that is already happening, and that continuous long-term use is not recommended.',
        technicalDetails:
          'Under Limitations of Use the label states: "EMEND has not been studied for the treatment of established nausea and vomiting" and "Chronic continuous administration of EMEND is not recommended because it has not been studied, and because the drug interaction profile may change during chronic continuous use." The second clause is the more interesting one — the reason chronic use is discouraged is not a demonstrated harm but that aprepitant is a substrate, a weak-to-moderate dose-dependent inhibitor and an inducer of CYP3A4 simultaneously, so its own interaction profile is time-dependent and would not stay where the three-day studies measured it.',
        evidenceSource:
          'EMEND (aprepitant) United States prescribing information, section 1 Limitations of Use, and section 7.1',
        inferredClaim:
          'That a drug licensed for prevention will also relieve nausea and vomiting that has already begun — a use the label states has not been studied',
        auditFlag: 'caution',
      },
      {
        id: 'apr-a7',
        category: 'failed',
        title: 'It changes the dose of the drug it is given with, and of several it is not',
        laymanSummary:
          'Aprepitant blocks and induces the same liver enzyme that clears a long list of other drugs. Its own regimen halves the steroid dose. It can make the contraceptive pill fail for a month, and it moves the INR of anyone on warfarin.',
        technicalDetails:
          'Aprepitant is a CYP3A4 substrate, a weak-to-moderate dose-dependent CYP3A4 inhibitor and a CYP3A4 inducer, and also induces CYP2C9. Pimozide is contraindicated because raised concentrations risk QT prolongation. Oral dexamethasone must be reduced by approximately 50% and intravenous methylprednisolone by about 25% when co-administered — which is why the pivotal trials gave 12 mg of dexamethasone in the aprepitant arm and 20 mg in the control arm. Hormonal contraceptive exposure falls during administration and for 28 days after the last dose, and the label directs alternative or back-up contraception for a month. Warfarin exposure falls with a clinically significant decrease in INR, and the label directs monitoring in the two weeks after each cycle, particularly at days 7 to 10. Exposure to CYP3A4-metabolised chemotherapy agents including vinblastine, vincristine and ifosfamide may increase. Most common adverse reactions at 3% or more were fatigue 13% against 12%, diarrhoea 9% against 8%, asthenia 7% against 6%, dyspepsia 7% against 5%, abdominal pain 6% against 5% and hiccups 5% against 3% in a pooled analysis of 1,412 aprepitant-regimen patients against 1,396 on standard therapy.',
        evidenceSource:
          'EMEND (aprepitant) United States prescribing information — Contraindications 4, Warnings and Precautions 5.1 to 5.3, Drug Interactions 7.1 and Table 8, Adverse Reactions 6.1 Table 5',
        measuredMetric:
          'Documented CYP3A4 and CYP2C9 interaction set, including a mandated 50% reduction in the co-administered oral dexamethasone dose',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Taken before the chemotherapy, not after',
        laymanDesc:
          'A capsule an hour before treatment and then on the next two mornings, or a single drip. It is always given alongside the older anti-sickness drugs, never instead of them.',
        molecularDetail:
          'Oral aprepitant 125 mg one hour before chemotherapy on day 1, then 80 mg on the mornings of days 2 and 3, always with a 5-HT3 antagonist and dexamethasone. Alternatively a single 150 mg intravenous dose of the phosphorylated prodrug fosaprepitant, shown non-inferior in 2,322 patients. The molecule is poorly water-soluble, which is why the capsule is a nanoparticle formulation and why an intravenous prodrug had to be made.',
        iconName: 'Clock',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the brain, and that was measured directly',
        laymanDesc:
          'The receptors that matter are in the brainstem, so the drug has to get past the blood-brain barrier. Scans in living people confirmed that it does.',
        molecularDetail:
          'The label states that animal and human positron emission tomography studies with aprepitant have shown that it crosses the blood-brain barrier and occupies brain NK1 receptors. Its lipophilicity — calculated logP 4.31, driven by seven fluorine atoms across a bis-trifluoromethylphenyl group and a fluorophenyl ring — is what permits that crossing.',
        iconName: 'Brain',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Substance P is locked out of its receptor',
        laymanDesc:
          'The messenger that drives the later wave of vomiting cannot dock. Serotonin and dopamine receptors are untouched, which is why it is added to other drugs rather than replacing them.',
        molecularDetail:
          'Selective high-affinity antagonism at the human substance P/neurokinin 1 receptor. The label records little or no affinity for serotonin 5-HT3, dopamine or corticosteroid receptors — the targets of the existing antiemetic classes — which is the mechanistic basis of combination rather than substitution.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The delayed phase loses its driver',
        laymanDesc:
          'The first day of chemotherapy sickness runs on serotonin; days two to five run on substance P. Blocking substance P is what opened up that second window.',
        molecularDetail:
          'Delayed-phase complete response, 25 to 120 hours post-cisplatin, rose from 56% to 75% in Study 1 and from 47% to 68% in Study 2 (both p<0.001) — a larger absolute gain than in the acute phase, where the 5-HT3 antagonist was already doing most of the work (89% against 78%; 83% against 68%).',
        iconName: 'Timer',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Vomiting falls, substantially',
        laymanDesc:
          'Across five days, the proportion of people who neither vomited nor needed rescue medication went from about half to about three quarters.',
        molecularDetail:
          'Complete response overall 73% against 52% (Study 1) and 63% against 43% (Study 2), both p<0.001. No emesis overall 78% against 55% and 66% against 44%, both p<0.001. Two independent trials, consistent direction, consistent magnitude.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Nausea did not follow',
        laymanDesc:
          'On the same diaries, on the same scale, in the same trials, whether people felt sick did not separate from the control arm. The licence still names nausea.',
        molecularDetail:
          'No nausea (VAS below 5 mm) overall 48% against 44% and 49% against 39%, both reported NS; no significant nausea (VAS below 25 mm) overall 73% against 66% and 71% against 64%, both NS; the delayed-phase versions of both endpoints also NS in both studies. Eight nausea comparisons, none statistically significant. The gap was later filled by a different drug: olanzapine added on top of aprepitant improved overall no-nausea from 22% to 37% (p=0.002) in 380 evaluable patients.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Aprepitant Protocol 052 (J Clin Oncol 2003;21:4112-4119) — label Study 1',
        phase: 'Phase 3, multinational, randomised, double-blind, placebo-controlled',
        sampleSize: 520,
        primaryEndpoint:
          'Complete response — no emetic episode and no rescue therapy — on days 1 to 5 after high-dose cisplatin, modified intention to treat',
        endpointMet: true,
        statisticalPValue:
          '72.7% (n=260) against 52.3% (n=260), p<0.001; acute phase 89% against 78% and delayed phase 75% against 56%, both p<0.001',
        unreportedAdverseSignals:
          'Every nausea endpoint in the same trial was not statistically significant: no nausea overall 48% against 44%, no significant nausea overall 73% against 66%. The control arm contained ondansetron 32 mg intravenously, a dose since withdrawn, and 20 mg of dexamethasone on day 1 against 12 mg in the aprepitant arm.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Aprepitant Protocol 054 (Cancer 2003;97:3090-3098) — label Study 2',
        phase: 'Phase 3, multicentre, randomised, double-blind, placebo-controlled',
        sampleSize: 523,
        primaryEndpoint:
          'Complete response — no emesis and no rescue therapy — during the 5-day period after high-dose cisplatin',
        endpointMet: true,
        statisticalPValue:
          '62.7% (163/260) against 43.3% (114/263), p<0.001; day 1 82.8% against 68.4% and days 2-5 67.7% against 46.8%, both p<0.001',
        unreportedAdverseSignals:
          'Nausea endpoints again not statistically significant: no nausea overall 49% against 39%, no significant nausea overall 71% against 64%. Overall adverse events 72.8% against 72.6%; 568 evaluated for safety against 523 for efficacy.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT00619359 (protocol 0517-017, Merck Sharp & Dohme)',
        phase: 'Phase 3, randomised, double-blind, active-controlled non-inferiority',
        sampleSize: 2322,
        primaryEndpoint:
          'Complete response — no vomiting and no rescue therapy — over 120 hours, single 150 mg intravenous fosaprepitant against the three-day oral aprepitant regimen',
        endpointMet: true,
        statisticalPValue:
          '71.9% (795/1,106) against 72.3% (820/1,134); risk difference −0.4% (95% CI −4.1% to 3.3%), non-inferiority met',
        unreportedAdverseSignals:
          'A formulation comparison with no placebo arm. It establishes that one infusion substitutes for three days of capsules; it says nothing about whether either beats the backbone regimen alone, and it carries no nausea endpoint.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Complete response over 120 hours 72.7% against 52.3% in 520 patients (p<0.001) and 62.7% against 43.3% in 523 patients (p<0.001)',
        'Delayed-phase complete response 75% against 56% and 68% against 47%, the window 5-HT3 antagonists leave open',
        'No emesis overall 78% against 55% and 66% against 44%, both p<0.001',
        'Single intravenous fosaprepitant non-inferior to three days of oral aprepitant: 71.9% against 72.3%, risk difference −0.4% (95% CI −4.1% to 3.3%) in 2,322 patients',
      ],
      unsupportedInferences: [
        'That aprepitant prevents nausea — the licence says so and all eight nausea comparisons across the two pivotal trials are reported in the label as not statistically significant',
        'That the 2003 effect size holds in current practice, when the control arm contained an ondansetron dose that has since been withdrawn and the comparison has never been repeated',
        'That it will help sickness that has already started — the label states it has not been studied for the treatment of established nausea and vomiting',
        'That the complete protection endpoint demonstrates a nausea benefit; it is a composite whose separation is carried by its emesis component',
      ],
      whatFailedInitially: [
        'No nausea, overall and delayed phase, in both pivotal studies — four comparisons, all NS',
        'No significant nausea, overall and delayed phase, in both pivotal studies — four more comparisons, all NS',
        'Complete protection in the acute phase of Study 1 (85% against 75%) was not significant once adjusted for multiple comparisons',
        'Chronic continuous administration is not recommended, because it has not been studied and because the drug’s own interaction profile may change during it',
      ],
      realWorldOutcome: [
        'Approved 26 March 2003 under NDA 021549; intravenous fosaprepitant in 2008, oral suspension in 2015, generic capsules since',
        'About US$76.85 a unit at pharmacy acquisition cost, roughly four hundred times a dose of the generic ondansetron it is added to',
        'The nausea gap it left was later closed by olanzapine, an off-patent antipsychotic, in a National Cancer Institute trial that used nausea prevention as its primary endpoint and hit it',
        'Its own label now carries a footnote disclaiming the comparator dose used throughout its registration programme',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule (125 mg then 80 mg over three days), oral suspension, and intravenous — fosaprepitant 150 mg as a single dose, or the polysorbate-free emulsions Cinvanti and Aponvie',
      description:
        'The molecule is poorly water-soluble, so the capsule is a nanoparticle formulation and the intravenous route required a separate phosphorylated prodrug, fosaprepitant, cleaved back to aprepitant by endogenous phosphatases. The single intravenous dose was shown non-inferior to the three-day oral course in 2,322 patients. The oral suspension extends the licence down to 6 months of age; capsules are licensed from 12 years.',
      safetyProfile:
        'Contraindicated with pimozide and in known hypersensitivity; anaphylactic reactions have been reported. Aprepitant is a CYP3A4 substrate, a weak-to-moderate dose-dependent CYP3A4 inhibitor and a CYP3A4 and CYP2C9 inducer: co-administered oral dexamethasone is reduced by approximately 50%, intravenous methylprednisolone by about 25%, hormonal contraceptive efficacy may be reduced during treatment and for 28 days after the last dose, and warfarin INR should be monitored for two weeks after each cycle, particularly at days 7 to 10. Most common adverse reactions at 3% or more in a pooled analysis of 1,412 against 1,396 patients: fatigue 13% against 12%, diarrhoea 9% against 8%, asthenia 7% against 6%, dyspepsia 7% against 5%, abdominal pain 6% against 5%, hiccups 5% against 3%. Not studied for the treatment of established nausea and vomiting; chronic continuous administration not recommended.',
    },
    commonQuestions: [
      {
        q: 'Will aprepitant stop me feeling sick, or just stop me vomiting?',
        a: 'On the evidence that licensed it, vomiting. Its two pivotal trials collected both, on patient diaries, using the same 0 to 100 mm scale. Every vomiting endpoint separated at p<0.001 — complete response 73% against 52% and 63% against 43%. Every nausea endpoint is reported in the label as not statistically significant: no nausea overall 48% against 44% and 49% against 39%; no significant nausea overall 73% against 66% and 71% against 64%. That is eight nausea comparisons across two trials without a single significant result, and the indication nonetheless reads "prevention of acute and delayed nausea and vomiting". If nausea rather than vomiting is your problem, the drug with a positive randomised result on that specific endpoint is olanzapine, which was tested added on top of aprepitant.',
        auditNote:
          'Nausea is a rating scale and vomiting is a count. They do not move together, and a drug that fixes one has not thereby fixed the other. This is the clearest example in this file of an indication whose wording outruns its evidence table.',
      },
      {
        q: 'Why is it given with two other drugs instead of on its own?',
        a: 'Because it blocks a receptor the others do not touch, and does not touch theirs. The label states aprepitant has little or no affinity for serotonin 5-HT3, dopamine or corticosteroid receptors — the targets of the existing therapies. Chemotherapy-induced vomiting runs on serotonin in the first 24 hours and on substance P from roughly 25 to 120 hours, so a serotonin blocker and an NK1 blocker cover different windows. The trial numbers show this directly: in the acute phase aprepitant added 11 and 15 percentage points on top of the standard regimen, and in the delayed phase it added 19 and 21.',
      },
      {
        q: 'The trials are from 2003. Do they still apply?',
        a: 'Partly, and the label itself flags the problem. Every pivotal trial used a control arm containing 32 mg of intravenous ondansetron. That dose was withdrawn on cardiac safety grounds — dose-dependent QT prolongation and torsades de pointes — and the aprepitant label now carries a footnote reading that although this dose was used in the clinical trials, it is no longer the currently recommended dose. So the measured 20-percentage-point increment is an increment over a regimen no one is permitted to give any more, and it has not been re-measured against the doses in current use. Whether the true increment today is larger or smaller is genuinely unknown.',
      },
      {
        q: 'Why does the pharmacist keep asking about my other medicines?',
        a: 'Because aprepitant is unusual: it is simultaneously a substrate, an inhibitor and an inducer of the liver enzyme CYP3A4, and it also induces CYP2C9. Pimozide is an outright contraindication. The steroid given alongside it in its own regimen is halved because of the interaction. If you take warfarin, your INR falls and the label directs a check in the two weeks after each cycle, particularly at days 7 to 10. If you use hormonal contraception, the label says its effectiveness may be reduced during treatment and for 28 days after the last dose, and directs a back-up method for a month. And some chemotherapy drugs — vinblastine, vincristine, ifosfamide — reach higher levels when it is on board.',
      },
      {
        q: 'Can I take a dose once I already feel sick?',
        a: 'That has not been studied. The label states it under Limitations of Use: aprepitant has not been studied for the treatment of established nausea and vomiting, and chronic continuous administration is not recommended. The second point has a specific reason that is worth knowing — because the drug both inhibits and induces the same enzyme, its interaction profile is time-dependent, so the safety data from a three-day course does not carry over to continuous use.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Hesketh PJ, Grunberg SM, Gralla RJ, et al. The oral neurokinin-1 antagonist aprepitant for the prevention of chemotherapy-induced nausea and vomiting: a multinational, randomized, double-blind, placebo-controlled trial in patients receiving high-dose cisplatin — the Aprepitant Protocol 052 Study Group. J Clin Oncol 2003;21(22):4112-4119',
        identifier: '10.1200/JCO.2003.01.095',
        kind: 'doi',
      },
      {
        label:
          'Poli-Bigelli S, Rodrigues-Pereira J, Carides AD, et al. Addition of the neurokinin 1 receptor antagonist aprepitant to standard antiemetic therapy improves control of chemotherapy-induced nausea and vomiting. Cancer 2003;97(12):3090-3098 (Aprepitant Protocol 054)',
        identifier: '10.1002/cncr.11433',
        kind: 'doi',
      },
      {
        label:
          'Navari RM, Qin R, Ruddy KJ, et al. Olanzapine for the prevention of chemotherapy-induced nausea and vomiting. N Engl J Med 2016;375(2):134-142',
        identifier: '10.1056/NEJMoa1515725',
        kind: 'doi',
      },
      {
        label:
          'ClinicalTrials.gov NCT00619359 — Evaluation of Fosaprepitant (MK0517) in Single Dose Schedule (protocol 0517-017), Merck Sharp & Dohme, posted results',
        identifier: 'NCT00619359',
        kind: 'nct',
      },
      {
        label:
          'ClinicalTrials.gov NCT02116530 — Olanzapine in preventing nausea and vomiting in patients receiving highly emetogenic chemotherapy, the Alliance trial reported by Navari et al.',
        identifier: 'NCT02116530',
        kind: 'nct',
      },
      {
        label:
          'EMEND (aprepitant) United States prescribing information — Indications 1 and Limitations of Use, Contraindications 4, Warnings and Precautions 5.1-5.3, Drug Interactions 7.1 Table 8, Adverse Reactions 6.1 Table 5, Clinical Studies 14.1 Tables 11 and 12 (openFDA drug/label record)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22EMEND%22&limit=1',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA — EMEND capsules NDA 021549, original approval 26 March 2003; EMEND for injection (fosaprepitant) NDA 022023, 25 January 2008; EMEND for oral suspension NDA 207865, 17 December 2015',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021549',
        kind: 'regulatory',
      },
      {
        label:
          'Ryan JL, Heckler CE, Roscoe JA, et al. Ginger (Zingiber officinale) reduces acute chemotherapy-induced nausea: a URCC CCOP study of 576 patients. Support Care Cancer 2012;20(7):1479-1489',
        identifier: '10.1007/s00520-011-1236-3',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 135413536 — aprepitant structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135413536',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Bisacodyl — sold in every supermarket since the 1950s, first tested properly against placebo
  //    in 2011, in a trial four times longer than its own label permits it to be used.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'bisacodyl',
    name: 'Bisacodyl',
    tradeName: 'Dulcolax / Gentle Laxative / Stimulant Laxative Enteric Coated',
    sponsor:
      'Sold over the counter by many manufacturers; Chattem, a Sanofi consumer health company, is the current United States labeler of Dulcolax. The prescription bowel-preparation kit HALFLYTELY AND BISACODYL TABLETS is Braintree Laboratories, NDA 021551, approved 10 May 2004',
    targetGene: 'None identified',
    targetProtein:
      'No named receptor. The label states bisacodyl is a prodrug hydrolysed by intestinal brush border enzymes and colonic bacteria to bis-(p-hydroxyphenyl) pyridyl-2-methane (BHPM), which acts directly on the colonic mucosa to produce peristalsis',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2004,
    indication:
      'For relief of occasional constipation and irregularity. Oral enteric-coated tablets generally produce a bowel movement in 6 to 12 hours; suppositories in 15 minutes to 1 hour. Also a component of prescription colonoscopy bowel-preparation kits',
    patientFriendlyIndication: 'Occasional constipation',
    anatomicalSite:
      'Colonic mucosa — the drug is a prodrug and is not meant to act anywhere upstream of it, which is what the enteric coating on the tablet is for',
    conditionContext: {
      conditionExplainer:
        'Constipation is treated in two different ways. Osmotic laxatives pull water into the bowel and let the resulting bulk do the work. Stimulant laxatives act on the colon wall itself, provoking a propulsive contraction and increasing fluid secretion. Bisacodyl is the second kind, and the difference matters because the two have different evidence bases and very different reputations.',
      whyItMatters:
        'This is a drug that has been on open shelves for decades on a reputation rather than a trial, and whose reputation ran in both directions at once: assumed to work, and assumed to be habit-forming. Both assumptions were tested late. The efficacy trial arrived in 2011 and was positive; the harm literature was reviewed in 2003 and found thin. Meanwhile its structural sibling in the same class, phenolphthalein, was removed from the American market in 1999.',
      whoTakesThis:
        'Adults and children over 12 with occasional constipation, and — as an added tablet in a prescription kit — people preparing for a colonoscopy. The label says not to use it when abdominal pain, nausea or vomiting are present, and not for longer than one week.',
      clinicalGoals:
        'More complete spontaneous bowel movements per week. That is a surrogate: it is what the trial measured, and no laxative trial in this class has ever measured an outcome such as hospital admission, obstruction or symptom-free survival.',
    },
    oneSentenceVerdict:
      'A prodrug converted by gut enzymes and colonic bacteria to BHPM, which acts directly on the colonic mucosa, and which raised complete spontaneous bowel movements from 1.1 to 5.2 per week against 1.1 to 1.9 on placebo (p<0.0001) in 368 patients — in a four-week trial published in 2011, more than half a century into its use, and four times longer than the one week its own label permits.',
    laymanHowItWorks:
      'The tablet you swallow is not the drug. It is coated so it survives the stomach, and only in the intestine do enzymes and gut bacteria cut it into the molecule that actually works. That molecule sits on the lining of the colon and does two things: it makes the wall contract in a wave, and it makes the colon secrete water instead of absorbing it. The result is a bowel movement in about six to twelve hours. A suppository skips all of that and delivers the same conversion locally, which is why it works in fifteen minutes to an hour instead.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0464 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 33 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Bisacodyl is an over-the-counter stimulant laxative active ingredient with no patent protection and no single approval date; it is sold under dozens of store brands at well under a cent a tablet at acquisition cost. The 2004 date on this record belongs to a different product — Braintree’s prescription bowel-preparation kit NDA 021551, which pairs bisacodyl delayed-release tablets with a polyethylene glycol solution.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The real comparison for bisacodyl is against polyethylene glycol, the osmotic laxative that has more trial-weeks behind it and no reputation problem, and against sodium picosulfate, which is a different prodrug of the same active molecule. Nothing in this group has an outcome trial. All of them are judged on complete spontaneous bowel movements per week, a count patients keep themselves in a diary.',
      conventionalRx: [
        {
          name: 'Polyethylene glycol 3350 (Miralax)',
          class: 'Osmotic laxative',
          howItCompares:
            'Works by physics rather than pharmacology: an unabsorbed polymer that holds water in the lumen. It has never carried the dependence reputation attached to stimulants, has longer randomised follow-up, and does not act on the bowel wall at all. Bisacodyl acts faster and PEG is generally the one used for longer.',
          typicalCost:
            'Among the cheapest over-the-counter products in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: no stimulation of the colon wall, no cramping mechanism, longer trial follow-up. Cons: slower; needs to be dissolved and drunk; bloating.',
        },
        {
          name: 'Sodium picosulfate',
          class: 'Stimulant laxative — a different prodrug of the same active metabolite',
          howItCompares:
            'Converted by colonic bacteria to the same active molecule, BHPM, that bisacodyl is converted to, so the two are the same pharmacology reached by different routes. Its own four-week randomised trial in 367 patients raised complete spontaneous bowel movements from 0.9 to 3.4 per week against 1.1 to 1.7 on placebo (p<0.0001). That is class-level replication of bisacodyl’s result by an independent trial.',
          typicalCost: 'Not stated here — no verified United States acquisition cost was available',
          prosAndCons:
            'Pros: liquid drops allow fine dose titration, and nearly half the patients in its trial titrated the dose down. Cons: not widely available as a standalone laxative in the United States, where it is mostly sold as a colonoscopy preparation.',
        },
        {
          name: 'Senna (sennosides)',
          class: 'Anthraquinone stimulant laxative',
          howItCompares:
            'The other stimulant class, and the one that actually generated the "damaged colon" literature — melanosis coli is an anthraquinone finding, not a bisacodyl finding. The review that examined chronic stimulant use concluded that bisacodyl may be used if anthraquinone laxatives are unsatisfactory.',
          typicalCost:
            'Among the cheapest over-the-counter products in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: long use, cheap, plant-derived. Cons: causes melanosis coli, a reversible pigmentation of the colonic mucosa that has no known functional consequence but is what most of the alarm about stimulant laxatives was built on.',
        },
      ],
      naturalFoods: [
        {
          name: 'Dietary fibre — psyllium, wheat bran, fruit and vegetables',
          activeCompound: 'Soluble and insoluble non-starch polysaccharides',
          biologicalMechanism:
            'Bulk and water retention rather than mucosal stimulation. This is the mechanism polyethylene glycol imitates pharmaceutically, and it is a different mechanism from bisacodyl’s, not a weaker version of it.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: fibre is the first step in essentially every constipation guideline, and the trials behind it measure stool frequency and consistency over weeks, not clinical outcomes. Fibre does not help — and can worsen — constipation caused by slow colonic transit or outlet obstruction, which is the group most likely to reach for a stimulant.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Do not crush the tablet, and keep it away from milk and antacids',
          action:
            'Swallow whole with water, and do not take within one hour after an antacid or milk.',
          patientImpact:
            'The label carries all three instructions. The tablet is enteric-coated so the prodrug survives the stomach; anything that raises gastric pH dissolves the coat early and releases the irritant where it was never meant to act, which produces stomach cramps rather than a bowel movement. The label also says do not use if you cannot swallow without chewing.',
          clinicalPrecaution:
            'This is a formulation instruction with a pharmacological reason, not a courtesy. The suppository exists precisely to bypass the problem.',
        },
        {
          name: 'One week is the label’s limit',
          action:
            'Stop and ask a doctor if you need a laxative for more than one week, or if there is rectal bleeding or no bowel movement after using it.',
          patientImpact:
            'The over-the-counter label says do not use for a period longer than one week, and directs a doctor if a sudden change in bowel habit has lasted more than two weeks. It also says not to use it at all when abdominal pain, nausea or vomiting are present — that combination can be obstruction, which a stimulant laxative makes worse.',
          clinicalPrecaution:
            'The only modern placebo-controlled efficacy trial ran for four weeks. There is no randomised evidence at all for the durations over which chronic constipation is actually managed.',
        },
        {
          name: 'Expect cramps, and know they are the mechanism',
          action: 'Take it at a time when six to twelve hours of unpredictability is acceptable.',
          patientImpact:
            'The label lists stomach discomfort, faintness and cramps for the tablets, and stomach discomfort, faintness, rectal burning and mild cramps for the suppositories. Cramping is not an idiosyncratic reaction here; it is the propulsive contraction the drug exists to cause.',
          clinicalPrecaution:
            'Faintness is on the label for both forms and is the reason the first dose is better not taken away from home.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(=O)OC1=CC=C(C=C1)C(C2=CC=C(C=C2)OC(=O)C)C3=CC=CC=N3',
      chemicalFormula: 'C22H19NO4',
      molecularWeight: '361.40 g/mol',
      targetReceptorAffinity:
        'No receptor affinity is claimed, because no receptor is named. Bisacodyl is a diphenylmethane bearing two acetylated phenols and a pyridine ring. Both acetate esters are hydrolysed off in the gut to give bis-(p-hydroxyphenyl) pyridyl-2-methane, the active molecule; the parent as swallowed is inactive. The record’s calculated logP is 5.19 for the diacetate, which is part of why it is formulated as a delayed-release tablet. The label states that the pharmacokinetics of bisacodyl following oral administration of the tablet has not been adequately characterised.',
      structureSource: {
        label:
          'PubChem CID 2391 (bisacodyl) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2391',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'bis-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm both acetate esters are intact',
          description:
            'A batch of bisacodyl that has partly hydrolysed is a batch that is partly active before it is swallowed, which defeats the entire delivery design. The two acetate groups are the protecting groups that keep the molecule inert until the intestine, so their integrity is the release specification that matters most.',
          reagentsAndBuffer:
            'Bisacodyl reference standard, reversed-phase HPLC with UV detection resolving the diacetate, monoacetate and free BHPM, 1H NMR for acetyl proton integration, Karl Fischer titration',
        },
        {
          id: 'bis-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Condense pyridine-2-carboxaldehyde with phenol, then acetylate',
          description:
            'The core is a triarylmethane: two phenol rings and one pyridine ring on a single carbon. Phenolphthalein, the ingredient the FDA removed from this class in 1999, shares the diphenylmethane core and differs in the third substituent. Acetylation of the two phenols is the last step and is what converts an active molecule into a prodrug.',
          dependsOnStepId: 'bis-w1',
          reagentsAndBuffer:
            'Pyridine-2-carboxaldehyde, phenol in acid-catalysed condensation, acetic anhydride with a base catalyst for the final diacetylation, recrystallisation solvents',
        },
        {
          id: 'bis-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separate the para,para isomer from its ortho-substituted relatives',
          description:
            'Acid-catalysed condensation of a phenol onto an aldehyde gives ortho as well as para products. Only the 4,4′ isomer is the drug. The isomeric impurities are structurally similar enough to survive a routine assay and different enough to have their own biology, which is a purification problem rather than a synthetic one.',
          dependsOnStepId: 'bis-w2',
          reagentsAndBuffer:
            'Fractional recrystallisation from ethanol or ethyl acetate, preparative reversed-phase chromatography for release material, melting point and HPLC purity against a specified isomeric limit',
        },
        {
          id: 'bis-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure conversion by brush border enzymes and by colonic bacteria separately',
          description:
            'The label attributes activation to two distinct systems — intestinal brush border enzymes and colonic bacteria — and they are not interchangeable. A person on antibiotics or with an altered microbiome is a person with a different conversion rate, and that is the most plausible source of the variable response this drug is known for. Testing conversion in a single system reports half the answer.',
          dependsOnStepId: 'bis-w3',
          reagentsAndBuffer:
            'Human intestinal brush border membrane vesicles, anaerobic faecal microbiota incubations, paired sterile controls, LC-MS/MS quantification of bisacodyl, the monoacetate and BHPM over time',
        },
        {
          id: 'bis-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Count complete spontaneous bowel movements with a run-in and an electronic diary',
          description:
            'The endpoint that licensed this class is a patient-kept count, so the instrument is the trial. The 2011 trial used a two-week baseline period without study medication before randomisation and an electronic daily diary, and distinguished spontaneous bowel movements from those induced by rescue medication and complete ones from incomplete. Without the run-in, regression to the mean is indistinguishable from drug effect — the placebo arm still went from 1.1 to 1.9 per week.',
          dependsOnStepId: 'bis-w4',
          reagentsAndBuffer:
            'Two-week medication-free baseline, electronic patient diary, Rome III diagnostic criteria for entry, prespecified definitions of spontaneous and complete spontaneous bowel movement, PAC-QOL quality of life questionnaire',
        },
      ],
    },
    keyAudits: [
      {
        id: 'bis-a1',
        category: 'measured',
        title:
          'The trial that should have existed in 1960 was published in 2011, and it was positive',
        laymanSummary:
          'Four weeks of daily bisacodyl raised complete bowel movements from about one a week to about five, against about two on placebo. The trial was properly randomised, placebo-controlled and diary-based — and it appeared more than fifty years into the drug’s use.',
        technicalDetails:
          'A randomised, double-blind, placebo-controlled parallel-group study across 27 centres in the United Kingdom enrolled patients meeting Rome III criteria for chronic constipation. After a two-week baseline period without study medication, 368 patients were randomised 2:1 to 10 mg bisacodyl once daily (n=247) or placebo (n=121) for four weeks, recording data in an electronic daily diary. Mean complete spontaneous bowel movements per week rose from 1.1 ± 0.1 in both groups to 5.2 ± 0.3 with bisacodyl and 1.9 ± 0.3 with placebo (p<0.0001). All secondary endpoints — weekly complete spontaneous bowel movements, spontaneous bowel movements, and constipation-associated symptoms — also separated at p<0.0001, and the PAC-QOL quality of life score and all four of its subscales improved (p≤0.0070). The authors open by stating that although stimulant laxatives have been used for many years, their clinical value has been questioned and there have been few high-quality trials to assess their efficacy.',
        evidenceSource:
          'Kamm MA, Mueller-Lissner S, Wald A, Richter E, Swallow R, Gessner U. Clin Gastroenterol Hepatol 2011;9(7):577-583',
        doi: '10.1016/j.cgh.2011.03.026',
        measuredMetric:
          'Mean complete spontaneous bowel movements per week over four weeks against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'bis-a2',
        category: 'measured',
        title: 'A different prodrug of the same molecule reproduced the result independently',
        laymanSummary:
          'Sodium picosulfate is a different starting material that gut bacteria convert into exactly the same active molecule. Its own four-week trial found the same thing, which is as close to replication as this class has.',
        technicalDetails:
          'A randomised, double-blind, placebo-controlled parallel-group study in 45 German general practices screened 468 patients with Rome III chronic constipation and randomised 367 in a 2:1 ratio to sodium picosulfate drops or matching placebo for four weeks after a two-week baseline, with dose titration permitted. Mean complete spontaneous bowel movements per week rose from 0.9 ± 0.1 to 3.4 ± 0.2 against 1.1 ± 0.1 to 1.7 ± 0.1 (p<0.0001). 65.5% against 32.3% achieved an increase of at least one per week (p<0.0001) and 51.1% against 18.0% reached at least three per week (p<0.0001). Nearly half of patients titrated the dose down during the study. Because sodium picosulfate and bisacodyl are both converted to BHPM — by colonic bacteria and by brush border enzymes plus colonic bacteria respectively — this is the same active molecule tested twice by different teams in different countries.',
        evidenceSource:
          'Mueller-Lissner S, Kamm MA, Wald A, et al. Am J Gastroenterol 2010;105(4):897-903',
        doi: '10.1038/ajg.2010.41',
        measuredMetric:
          'Mean complete spontaneous bowel movements per week over four weeks, sodium picosulfate against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'bis-a3',
        category: 'failed',
        title: 'The evidence runs for four weeks. The label runs for one. Chronic use has neither.',
        laymanSummary:
          'The label says do not use it for more than a week. The only good trial ran for four. Most people who use it regularly use it for months or years, and there is no randomised evidence covering that at all.',
        technicalDetails:
          'The over-the-counter label directs that a doctor be consulted if a laxative is needed for more than one week, and the suppository label states outright: do not use for a period of longer than one week. The longest placebo-controlled efficacy trial is four weeks. Neither figure describes real use: stimulant laxatives are a standing part of the management of opioid-induced constipation, of constipation in palliative care, and of chronic idiopathic constipation that has not responded to osmotics. That gap has consequences in both directions — no trial has demonstrated sustained efficacy beyond four weeks, and no trial has demonstrated harm beyond four weeks either. The label’s one-week limit is a conservative default, not a finding.',
        evidenceSource:
          'Bisacodyl over-the-counter Drug Facts labels — Warnings and Directions, oral enteric-coated tablet and rectal suppository (openFDA drug/label records); Kamm MA et al. Clin Gastroenterol Hepatol 2011;9:577-583',
        doi: '10.1016/j.cgh.2011.03.026',
        inferredClaim:
          'That efficacy demonstrated over four weeks persists over the months or years in which the drug is actually used — untested in either direction',
        auditFlag: 'caution',
      },
      {
        id: 'bis-a4',
        category: 'conclusion_shift',
        title: 'The "lazy bowel" was reviewed and the evidence for it was thin',
        laymanSummary:
          'The widespread belief that stimulant laxatives permanently damage the colon or make it dependent was examined in 2003 and found not to be supported for the nerves or muscle of the bowel, and not to be supported for cancer risk.',
        technicalDetails:
          'A review of the chronic-use literature concluded that although stimulant laxatives cause structural damage to surface epithelial cells of uncertain functional significance, there is no convincing evidence that their chronic use causes structural or functional impairment of enteric nerves or intestinal smooth muscle, and no reliable data linking chronic use to colorectal cancer or other tumours. Its explicit conclusion is that the risks of laxative abuse have been overemphasised and that this has minimised their rational use by physicians, that stimulant laxatives may be used chronically when patients fail to respond adequately to bulk or osmotic laxatives, and that bisacodyl may be used if anthraquinone laxatives are unsatisfactory. Much of the original alarm came from melanosis coli, a pigmentation of the colonic mucosa caused by anthraquinone laxatives such as senna rather than by bisacodyl, and itself reversible. This is a case where the conventional wisdom and the label point one way and the review of the evidence points the other, and the review is the more recent document.',
        evidenceSource:
          'Wald A. Is chronic use of stimulant laxatives harmful to the colon? J Clin Gastroenterol 2003;36(5):386-389',
        doi: '10.1097/00004836-200305000-00004',
        inferredClaim:
          'That regular stimulant laxative use produces a permanently dependent or damaged colon — a widely held belief the review found unsupported for enteric nerves, smooth muscle and cancer risk',
        auditFlag: 'contested',
      },
      {
        id: 'bis-a5',
        category: 'conclusion_shift',
        title: 'Its closest chemical relative was removed from the American market in 1999',
        laymanSummary:
          'Phenolphthalein, the other diphenylmethane stimulant laxative and for decades the ingredient in some of the best-known laxative brands, was reclassified as not generally recognised as safe and effective. Bisacodyl, built on the same core, stayed.',
        technicalDetails:
          '21 CFR 310.545(a)(12)(iv)(B) lists phenolphthalein among stimulant laxative active ingredients in over-the-counter drug products that are not generally recognised as safe and effective, approved as of 29 January 1999, with the corresponding compliance date at 310.545(d)(29). A product containing it is a new drug requiring approval under section 505 of the Federal Food, Drug and Cosmetic Act — which in practice removed it. Bisacodyl and phenolphthalein share the triarylmethane diphenylmethane core and differ in the third substituent, a pyridine ring in bisacodyl and a phthalide in phenolphthalein. The regulatory divergence is real and is a fact about the two molecules rather than about the class; it is recorded here because "same class as a banned drug" is the kind of association that circulates without anyone stating what the two molecules actually share and what they do not.',
        evidenceSource:
          '21 CFR 310.545(a)(12)(iv)(B) and 310.545(d)(29) — Drug products containing certain active ingredients offered over-the-counter for certain uses',
        inferredClaim:
          'That structural similarity to a de-listed ingredient transfers its regulatory status — it did not; bisacodyl remains a marketed over-the-counter stimulant laxative and phenolphthalein does not',
        auditFlag: 'caution',
      },
      {
        id: 'bis-a6',
        category: 'failed',
        title:
          'In the largest trial on its record, the bisacodyl kit lost the cleansing comparison',
        laymanSummary:
          'A 2,154-patient colonoscopy trial compared the bisacodyl-plus-polyethylene-glycol kit against a sodium phosphate tablet preparation. The bisacodyl kit produced an inadequate clean four times as often.',
        technicalDetails:
          'NCT01427296 randomised 2,154 patients to OsmoPrep sodium phosphate tablets (n=1,032) or the HalfLytely and Bisacodyl Tablet bowel preparation kit (n=1,040), with the distribution of an overall colon-cleansing scale as the primary outcome. Ratings for OsmoPrep against the bisacodyl kit were: excellent 618 against 243, good 275 against 423, fair 116 against 286, inadequate 23 against 88. That is 60% against 23% excellent and 2.2% against 8.5% inadequate. An inadequate preparation is not a cosmetic failure — it is the reason a colonoscopy misses lesions or has to be repeated. The comparator here is a sodium phosphate preparation, a class subsequently constrained by concerns about acute phosphate nephropathy, so this result should be read as one preparation losing a cleansing comparison rather than as an endorsement of the winner.',
        evidenceSource:
          'ClinicalTrials.gov NCT01427296 — Safety and Efficacy of OsmoPrep Tablets Versus HalfLytely and Bisacodyl Tablet Bowel Prep Kit for Colon Cleansing (Bausch Health Americas), posted results',
        measuredMetric:
          'Distribution of the overall colon-cleansing scale in 2,154 randomised patients',
        auditFlag: 'caution',
      },
      {
        id: 'bis-a7',
        category: 'inferred',
        title: 'Its own pharmacokinetics are, in the label’s words, not adequately characterised',
        laymanSummary:
          'For a drug this widely used, the basic question of how much gets absorbed and when is not settled. The prescription label that discusses it says so directly.',
        technicalDetails:
          'The clinical pharmacology section of the prescription bisacodyl-containing bowel preparation states: "Bisacodyl, which is a prodrug, is converted to its active metabolite BHPM by intestinal brush border enzymes and colonic bacteria. The pharmacokinetics of bisacodyl following oral administration of the bisacodyl tablet has not been adequately characterized." The mechanism statement is confident and the exposure statement is not. That matters here more than it would for most drugs, because activation depends partly on the colonic microbiome — so the same tablet in a person on antibiotics, or with altered gut flora, is not necessarily the same dose of active drug, and no published characterisation quantifies that.',
        evidenceSource:
          'GaviLyte-H and Bisacodyl United States prescribing information, sections 12.1 and 12.3 (openFDA drug/label record)',
        inferredClaim:
          'That the dose on the packet corresponds to a predictable exposure to the active metabolite — when activation depends on brush border enzymes and colonic bacteria and the label states the pharmacokinetics have not been adequately characterised',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The coating is the point',
        laymanDesc:
          'The tablet is wrapped so it survives the stomach. Crushing it, or taking it after milk or an antacid, breaks that wrapper early and you get cramps instead of a bowel movement.',
        molecularDetail:
          'Enteric-coated delayed-release tablet. The label directs: do not chew or crush; do not use within 1 hour after taking an antacid or milk; do not use if you cannot swallow without chewing. Antacids and milk raise gastric pH, dissolving a pH-dependent enteric polymer prematurely. The suppository form bypasses the whole problem and acts in 15 minutes to 1 hour rather than 6 to 12.',
        iconName: 'Shield',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Gut enzymes and gut bacteria cut off the two protecting groups',
        laymanDesc:
          'What you swallow is inactive. Enzymes on the intestinal lining and bacteria in the colon strip two chemical caps off it and release the real drug.',
        molecularDetail:
          'Bisacodyl is a prodrug hydrolysed by intestinal brush border enzymes and colonic bacteria to bis-(p-hydroxyphenyl) pyridyl-2-methane (BHPM). The two acetate esters on the phenol rings are the caps; removing them converts a lipophilic diacetate — record logP 5.19 — into the active diphenol.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The active molecule works on the colon wall itself',
        laymanDesc:
          'It does not enter the bloodstream to do its job. It acts on the lining of the large bowel where it is released.',
        molecularDetail:
          'The label states BHPM acts directly on the colonic mucosa to produce colonic peristalsis. No receptor is named in the label and none is claimed here; the pharmacokinetics of the parent drug following oral tablet administration are stated in the label to be not adequately characterised.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Two things happen at once: a wave, and water',
        laymanDesc:
          'The colon contracts in a propulsive wave, and instead of absorbing water from the stool it secretes water into it.',
        molecularDetail:
          'The stimulant laxative effect is described in the label as producing colonic peristalsis; in the combination bowel-preparation product it is paired with the osmotic effect of unabsorbed polyethylene glycol, and the label notes the two together produce watery diarrhoea. Cramping is a direct consequence of the propulsive contraction rather than a separate adverse effect.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'About five complete bowel movements a week instead of two',
        laymanDesc:
          'In the one modern trial, four weeks of daily use took people from roughly one complete bowel movement a week to just over five. Placebo took them to just under two.',
        molecularDetail:
          'Kamm 2011: complete spontaneous bowel movements per week 1.1 ± 0.1 at baseline in both arms, rising to 5.2 ± 0.3 with 10 mg daily bisacodyl (n=247) against 1.9 ± 0.3 with placebo (n=121), p<0.0001, over four weeks in Rome III chronic constipation. PAC-QOL and all subscales improved (p≤0.0070).',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And nothing is known past four weeks',
        laymanDesc:
          'No randomised trial has run longer. The belief that long-term use ruins the bowel has been reviewed and found unsupported; the belief that it keeps working has not been tested at all.',
        molecularDetail:
          'The longest placebo-controlled efficacy trial is four weeks; the label limits use to one. A 2003 review found no convincing evidence that chronic stimulant laxative use impairs enteric nerves or intestinal smooth muscle and no reliable data linking it to colorectal cancer, concluding the risks of laxative abuse have been overemphasised. Absence of demonstrated harm is not demonstrated safety, and absence of a long trial is not evidence of lost efficacy.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Kamm 2011 (Clin Gastroenterol Hepatol 2011;9:577-583)',
        phase: 'Randomised, double-blind, placebo-controlled, parallel-group, 27 UK centres',
        sampleSize: 368,
        primaryEndpoint:
          'Mean number of complete spontaneous bowel movements per week during four weeks of 10 mg daily oral bisacodyl in Rome III chronic constipation',
        endpointMet: true,
        statisticalPValue:
          '1.1 ± 0.1 to 5.2 ± 0.3 per week with bisacodyl (n=247) against 1.1 ± 0.1 to 1.9 ± 0.3 with placebo (n=121), p<0.0001; all secondary endpoints p<0.0001; PAC-QOL and all subscales p≤0.0070',
        unreportedAdverseSignals:
          'Four weeks is the entire duration of the evidence, and the label permits one week. The placebo arm improved from 1.1 to 1.9 per week without any drug, which is the size of the regression-to-the-mean effect a two-week medication-free run-in was designed to expose.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Mueller-Lissner 2010 (Am J Gastroenterol 2010;105:897-903) — sodium picosulfate',
        phase: 'Randomised, double-blind, placebo-controlled, parallel-group, 45 German practices',
        sampleSize: 367,
        primaryEndpoint:
          'Mean number of complete spontaneous bowel movements per week during four weeks of sodium picosulfate — a different prodrug of the same active metabolite, BHPM',
        endpointMet: true,
        statisticalPValue:
          '0.9 ± 0.1 to 3.4 ± 0.2 per week against 1.1 ± 0.1 to 1.7 ± 0.1 on placebo, p<0.0001; at least three CSBMs per week reached by 51.1% against 18.0%, p<0.0001',
        unreportedAdverseSignals:
          'Patients without a bowel movement for more than 72 hours were permitted a rescue bisacodyl suppository in both arms, so the placebo arm was not entirely untreated. Nearly half of patients titrated the dose down during the study.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT01427296 (Bausch Health Americas)',
        phase: 'Phase 4, randomised, colonoscopy bowel preparation',
        sampleSize: 2154,
        primaryEndpoint:
          'Distribution of the overall colon-cleansing scale, OsmoPrep sodium phosphate tablets against the HalfLytely and Bisacodyl Tablet bowel preparation kit',
        endpointMet: false,
        statisticalPValue:
          'Bisacodyl kit (n=1,040) against OsmoPrep (n=1,032): excellent 243 against 618, good 423 against 275, fair 286 against 116, inadequate 88 against 23',
        unreportedAdverseSignals:
          'The bisacodyl-containing arm produced an inadequate preparation in 8.5% against 2.2%. The winning comparator is a sodium phosphate preparation, a class later constrained over acute phosphate nephropathy, so this is one preparation losing rather than another being vindicated.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Complete spontaneous bowel movements per week 1.1 to 5.2 against 1.1 to 1.9 on placebo over four weeks in 368 patients (p<0.0001)',
        'PAC-QOL total score and all four subscales improved against placebo in the same trial (p≤0.0070)',
        'The same active metabolite delivered as sodium picosulfate: 0.9 to 3.4 per week against 1.1 to 1.7 on placebo in 367 patients (p<0.0001)',
        'Onset: 6 to 12 hours for the enteric-coated oral tablet, 15 minutes to 1 hour for the suppository, both stated on the label',
      ],
      unsupportedInferences: [
        'That efficacy shown over four weeks persists over the months or years in which the drug is commonly used',
        'That regular use produces a dependent or structurally damaged colon — reviewed in 2003 and found unsupported for enteric nerves, smooth muscle and cancer risk',
        'That the tablet delivers a predictable dose of active drug, when activation depends partly on colonic bacteria and the label states its pharmacokinetics are not adequately characterised',
        'That belonging to the same chemical class as phenolphthalein, removed from the American market in 1999, says anything about bisacodyl’s own regulatory standing',
      ],
      whatFailedInitially: [
        'No adequate placebo-controlled efficacy trial existed until 2011, more than half a century into routine use',
        'The bisacodyl-containing bowel preparation kit produced an inadequate colon clean in 8.5% against 2.2% for its comparator in 2,154 patients',
        'The parent drug’s pharmacokinetics after oral tablet administration are stated in the prescription label to be not adequately characterised',
        'No trial in this class has ever measured a clinical outcome — every endpoint is a stool count, a consistency score or a symptom questionnaire',
      ],
      realWorldOutcome: [
        'Sold over the counter under dozens of store brands at under a cent a tablet at United States pharmacy acquisition cost',
        'Also a prescription product: Braintree’s HalfLytely and Bisacodyl Tablets bowel preparation kit, NDA 021551, approved 10 May 2004',
        'Its closest structural relative in the same laxative class, phenolphthalein, was declared not generally recognised as safe and effective as of 29 January 1999',
        'The over-the-counter label limits use to one week; the evidence base extends to four; ordinary use extends far beyond both',
      ],
    },
    deliverySystem: {
      type: 'Enteric-coated delayed-release oral tablet (typically 5 mg), rectal suppository, and a delayed-release tablet component of prescription colonoscopy preparation kits',
      description:
        'A prodrug that must reach the intestine intact, so the oral form is enteric-coated and the label forbids chewing, crushing, or dosing within an hour of milk or an antacid. Oral onset is 6 to 12 hours. The suppository delivers the same conversion locally and acts in 15 minutes to 1 hour, which is why it is the form used when timing matters.',
      safetyProfile:
        'Over-the-counter label: do not use when abdominal pain, nausea or vomiting are present, or for a period longer than one week. Ask a doctor before use if there has been a sudden change in bowel habit lasting more than two weeks. May cause stomach discomfort, faintness, cramps, and — for the suppository — rectal burning. Stop and consult a doctor for rectal bleeding, or if no bowel movement follows. The rectal products are for rectal use only; the paediatric limits on the label are 12 years and over for a whole suppository, 6 to under 12 for half, and not at all under 6.',
    },
    commonQuestions: [
      {
        q: 'Does bisacodyl actually work, or is it just what people have always used?',
        a: 'It works, and the trial proving it is more recent than most people would guess. A randomised, double-blind, placebo-controlled study across 27 UK centres gave 368 people with chronic constipation either 10 mg of bisacodyl daily or placebo for four weeks after a two-week drug-free baseline. Complete spontaneous bowel movements went from 1.1 per week to 5.2 on the drug and from 1.1 to 1.9 on placebo, p<0.0001, with quality-of-life scores improving too. That was published in 2011. Its own authors open by noting that the clinical value of stimulant laxatives had been questioned and that few high-quality trials existed. A separate four-week trial of sodium picosulfate — a different prodrug of the same active molecule — found the same thing in 367 patients.',
        auditNote:
          'A drug being old and familiar is not evidence. In this case the evidence eventually arrived and was positive, which is worth saying as plainly as the negative findings elsewhere in this file.',
      },
      {
        q: 'Will using it regularly damage my bowel or make me dependent on it?',
        a: 'That belief is much stronger than the evidence for it. A 2003 review of the chronic-use literature concluded that although stimulant laxatives cause structural damage to surface epithelial cells of uncertain functional significance, there is no convincing evidence that chronic use causes structural or functional impairment of the nerves or smooth muscle of the bowel, and no reliable data linking chronic use to colorectal cancer. Its stated conclusion is that the risks of laxative abuse have been overemphasised and that this has minimised their rational use. Much of the alarm derives from melanosis coli — a reversible pigmentation of the colon lining caused by senna and other anthraquinone laxatives, not by bisacodyl. What is genuinely unknown is whether it keeps working long term, because no randomised trial has run beyond four weeks.',
      },
      {
        q: 'Why does the packet say not to take it with milk or an antacid?',
        a: 'Because the tablet is a delivery device as much as a drug. What you swallow is inactive and coated so it survives the stomach; only in the intestine do brush border enzymes and gut bacteria strip off two chemical groups and release the active molecule, which acts on the lining of the colon. Milk and antacids raise the acidity of the stomach towards neutral, and the coating is designed to dissolve at that higher pH — so it opens early, in the wrong place. The label gives all three instructions for the same reason: do not chew or crush, do not take within an hour of an antacid or milk, and do not use it at all if you cannot swallow without chewing.',
      },
      {
        q: 'How long can I take it for?',
        a: 'The label says one week, and then to see a doctor. That is a conservative default rather than a finding: no trial has looked for harm past four weeks either. What the label limit really flags is the diagnostic question. Constipation that persists is a reason to find out why, and the label separately says not to use it when abdominal pain, nausea or vomiting are present — that combination can be obstruction, which a stimulant laxative would make worse rather than better. Rectal bleeding, or no bowel movement after using it, are both listed as reasons to stop and ask.',
      },
      {
        q: 'Is it related to a laxative that was banned?',
        a: 'Yes, structurally, and the distinction matters. Phenolphthalein was the other diphenylmethane stimulant laxative and for decades the active ingredient in some of the best-known laxative brands. It appears in 21 CFR 310.545 among over-the-counter stimulant laxative ingredients that are not generally recognised as safe and effective, effective 29 January 1999, which removed it from the market. Bisacodyl shares the diphenylmethane core with it and differs in the third group attached to the central carbon. Sharing a chemical skeleton is not sharing a safety finding, and the regulators reviewed the two ingredients separately and reached different conclusions.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Kamm MA, Mueller-Lissner S, Wald A, Richter E, Swallow R, Gessner U. Oral bisacodyl is effective and well-tolerated in patients with chronic constipation. Clin Gastroenterol Hepatol 2011;9(7):577-583',
        identifier: '10.1016/j.cgh.2011.03.026',
        kind: 'doi',
      },
      {
        label:
          'Mueller-Lissner S, Kamm MA, Wald A, et al. Multicenter, 4-week, double-blind, randomized, placebo-controlled trial of sodium picosulfate in patients with chronic constipation. Am J Gastroenterol 2010;105(4):897-903',
        identifier: '10.1038/ajg.2010.41',
        kind: 'doi',
      },
      {
        label:
          'Wald A. Is chronic use of stimulant laxatives harmful to the colon? J Clin Gastroenterol 2003;36(5):386-389',
        identifier: '10.1097/00004836-200305000-00004',
        kind: 'doi',
      },
      {
        label:
          'ClinicalTrials.gov NCT01427296 — Safety and Efficacy of OsmoPrep Tablets Versus HalfLytely and Bisacodyl Tablet Bowel Prep Kit for Colon Cleansing (Bausch Health Americas), posted results',
        identifier: 'NCT01427296',
        kind: 'nct',
      },
      {
        label:
          '21 CFR 310.545 — Drug products containing certain active ingredients offered over-the-counter for certain uses; paragraph (a)(12)(iv)(B) lists phenolphthalein among stimulant laxatives not generally recognised as safe and effective, approved as of 29 January 1999',
        identifier: 'https://www.law.cornell.edu/cfr/text/21/310.545',
        kind: 'regulatory',
      },
      {
        label:
          'GaviLyte-H and Bisacodyl United States prescribing information — Clinical Pharmacology 12.1 and 12.3, the bisacodyl prodrug and BHPM conversion statement (openFDA drug/label record)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22bisacodyl%22+AND+_exists_:clinical_pharmacology&limit=1',
        kind: 'regulatory',
      },
      {
        label:
          'Bisacodyl over-the-counter Drug Facts labels — Dulcolax Laxative suppository and enteric-coated stimulant laxative tablet: Uses, Warnings and Directions (openFDA drug/label records)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22bisacodyl%22&limit=3',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA — HALFLYTELY AND BISACODYL TABLETS, NDA 021551, Braintree Laboratories, original approval 10 May 2004',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021551',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2391 — bisacodyl structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2391',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Docusate — the stool softener whose one head-to-head measurement of stool softening put its
  //    effect at 0.01%, and which has now lost a randomised trial, a systematic review and a
  //    Choosing Wisely listing without losing a single shelf.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'docusate-sodium',
    name: 'Docusate Sodium',
    tradeName: 'Colace / Stool Softener / Senna-S (with sennosides)',
    sponsor:
      'No single sponsor. Docusate sodium is an over-the-counter stool softener sold under dozens of store and generic labels — Pharbest, HealthLife, Rugby, Major and the national retail brands — with no innovator application behind the current products',
    targetGene: 'None identified',
    targetProtein:
      'None. Docusate is an anionic surfactant, a sulfosuccinate diester. It has no receptor, no enzyme target and no named protein; its proposed action is physicochemical — reducing surface tension so water and fat mix into the stool',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    indication:
      'For the relief of occasional constipation (irregularity); helps prevent dry, hard stools. Labelled as generally producing a bowel movement within 12 to 72 hours',
    patientFriendlyIndication: 'Occasional constipation — sold as a stool softener',
    anatomicalSite:
      'The lumen of the small and large bowel — docusate is meant to act on the stool itself rather than on any tissue',
    conditionContext: {
      conditionExplainer:
        'A stool softener is not a laxative in the usual sense. It is not supposed to make the bowel move; it is supposed to make what is already there wetter and easier to pass. Docusate is a detergent, and the theory is that a detergent lets water and fat mix into a hard stool the way washing-up liquid lets water mix into grease.',
      whyItMatters:
        'The theory is plausible, the molecule genuinely is a surfactant, and the one trial that directly measured stool water content found the increase over baseline to be 0.01%. Docusate is among the most frequently ordered drugs in American hospitals and is on the Society of Hospital Medicine’s Choosing Wisely list. It is the clearest case in this file of a mechanism that was accepted because it made sense, and then not confirmed when it was finally measured.',
      whoTakesThis:
        'Adults and children over two with occasional constipation, very often in hospital, after surgery, on opioids, or in hospice — the settings where it is prescribed almost reflexively and where the randomised trials were done. The label directs not to use it at all alongside mineral oil unless told to.',
      clinicalGoals:
        'Softer stools and easier passage. Those are measurable: stool water content, stool weight, Bristol Stool Form Scale, bowel movement frequency. All of them have been measured, and none of them has separated docusate from its comparator.',
    },
    oneSentenceVerdict:
      'An anionic surfactant sold as a stool softener, which in the one randomised trial that measured stool water content directly raised it by 0.01% against 2.33% for psyllium (p=0.007), and which in a randomised, double-blind, placebo-controlled hospice trial of 74 patients added to sennosides produced no significant difference in stool frequency, volume, consistency, difficulty or completeness of evacuation.',
    laymanHowItWorks:
      'Docusate is a detergent — chemically the same kind of thing as washing-up liquid, at a dose that is safe to swallow. The idea is that it lowers the surface tension inside the bowel so that water and fat can soak into a hard, dry stool instead of running past it, making the stool softer and easier to pass. That is the mechanism as described on every packet. What is missing is the evidence that it happens: when someone actually collected and weighed the stools, docusate had raised their water content by a hundredth of a percent.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 28,
    substitutes: {
      summary:
        'Docusate has lost head-to-head against a fibre supplement on every objective measure of softening, and added nothing to a stimulant laxative in the population it is most used in. Both of its comparators are cheap and both are available over the counter, so the case for it is not a cost case either.',
      conventionalRx: [
        {
          name: 'Psyllium (Metamucil, ispaghula husk)',
          class: 'Bulk-forming fibre laxative',
          howItCompares:
            'The only drug that has been directly compared with docusate on stool softening itself. In 170 randomised subjects with chronic idiopathic constipation, psyllium raised stool water content by 2.33% against docusate’s 0.01% (p=0.007), stool water weight 84.0 g against 71.4 g per bowel movement (p=0.04), total stool output 359.9 g against 271.9 g per week (p=0.005), and bowel movements 3.5 against 2.9 per week in the second treatment week (p=0.02).',
          typicalCost:
            'Among the cheapest over-the-counter products in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: measurably does the thing docusate is named for. Cons: needs to be taken with plenty of water; bloating and wind; the trial that produced these numbers was run by employees of the company that sells psyllium, which is disclosed in the paper’s author affiliations and should be weighed.',
        },
        {
          name: 'Sennosides (senna)',
          class: 'Anthraquinone stimulant laxative',
          howItCompares:
            'The drug docusate is most often combined with, in products such as Senna-S. The combination label claims a bowel movement in 6 to 12 hours; the docusate-only label claims 12 to 72. The onset the combination advertises is senna’s. When docusate was added to sennosides in a randomised hospice trial, nothing measurable changed.',
          typicalCost:
            'Among the cheapest over-the-counter products in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: it actually produces a bowel movement, on a predictable timescale. Cons: cramping; causes melanosis coli with prolonged use; the one-week over-the-counter limit applies to it as well.',
        },
        {
          name: 'Polyethylene glycol 3350 (Miralax)',
          class: 'Osmotic laxative',
          howItCompares:
            'Softens stool the way docusate is supposed to — by getting water into it — but by osmosis rather than by surface tension, and with a much larger randomised evidence base. Where the clinical goal is genuinely softer stool rather than a triggered bowel movement, this is the comparator docusate has to beat and has not been shown to.',
          typicalCost:
            'Among the cheapest over-the-counter products in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: an unabsorbed polymer with a mechanism that does not depend on any biological effect; extensive trial record. Cons: has to be dissolved and drunk; bloating.',
        },
      ],
      naturalFoods: [
        {
          name: 'Water taken with dietary fibre',
          activeCompound: 'Soluble fibre plus fluid',
          biologicalMechanism:
            'Soluble fibre holds water in the stool. This is the same end point docusate claims — stool water content — reached by a mechanism that has been measured and quantified rather than assumed.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: in the head-to-head trial, 5.1 g of psyllium twice daily for two weeks raised stool water content by 2.33% and weekly stool output by about 88 g against docusate at 100 mg twice daily. Fibre without adequate fluid can worsen constipation, and fibre does not help constipation caused by slow transit or outlet obstruction.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Never with mineral oil',
          action:
            'Do not take docusate if you are taking mineral oil, unless a doctor has specifically told you to.',
          patientImpact:
            'This is the first line of the warnings section on the label, and it is a direct consequence of the mechanism. Docusate is a surfactant: it emulsifies. Emulsifying mineral oil is precisely what makes an otherwise unabsorbed laxative oil absorbable.',
          clinicalPrecaution:
            'The same emulsifying property is the reason docusate has been studied as an absorption enhancer for other substances. A drug that makes the gut wall more permeable to what is beside it is not a neutral addition to a medication list.',
        },
        {
          name: 'Ask what it is being given for',
          action:
            'If it has been added in hospital or in a hospice, ask which measurable outcome it is expected to change.',
          patientImpact:
            'In the randomised hospice trial, docusate added to sennosides changed nothing measurable: not stool frequency, not volume, not consistency, not difficulty of evacuation, not completeness of evacuation. It is one of the most commonly ordered drugs in American hospitals and appears on the Society of Hospital Medicine’s Things We Do for No Reason series.',
          clinicalPrecaution:
            'Adding a drug that does nothing is not free: it is a tablet to swallow for someone who may already be struggling to swallow, and it displaces the laxative that would have worked.',
        },
        {
          name: 'Twelve to seventy-two hours is not a promise',
          action:
            'Read the onset claim on the packet as the width of a window rather than as a prediction.',
          patientImpact:
            'The label states the product generally produces a bowel movement in 12 to 72 hours. Three days is long enough that most episodes of occasional constipation resolve on their own inside it, which is what makes an uncontrolled impression of benefit so easy to form and so unreliable.',
          clinicalPrecaution:
            'The label separately directs stopping and consulting a doctor for rectal bleeding, for failure to have a bowel movement after using a laxative, or if a stool softener is needed for more than one week.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCCC(CC)COC(=O)CC(C(=O)OCC(CC)CCCC)S(=O)(=O)O',
      chemicalFormula: 'C20H38O7S',
      molecularWeight:
        '422.60 g/mol (free sulfosuccinic acid diester as carried on this record; the marketed sodium salt is 444.56 g/mol)',
      targetReceptorAffinity:
        'None, and that is the point. Docusate is dioctyl sulfosuccinate: a succinate backbone esterified at both carboxyls with 2-ethylhexanol and bearing a sulfonate on the central carbon. Two branched eight-carbon tails and one ionised head make it a classic anionic surfactant, and the record’s calculated logP of 6.49 for the free acid reflects those tails. Everything claimed for it follows from surface activity rather than from binding anything.',
      structureSource: {
        label:
          'PubChem CID 11339 (dioctyl sulfosuccinic acid) — the structure carried on this record; the marketed salt is docusate sodium, PubChem CID 23673837',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11339',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'doc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Measure the critical micelle concentration, not just the purity',
          description:
            'For a surfactant, identity and assay do not describe the product. What determines whether it can emulsify anything at a given concentration is the critical micelle concentration, and that is what should be released against. A batch that is 99.5% pure and micellises at the wrong concentration is off-specification in the only way that matters.',
          reagentsAndBuffer:
            'Docusate sodium reference standard, du Noüy ring or pendant drop tensiometry across a concentration series, conductivity titration for the critical micelle concentration, HPLC with charged aerosol or refractive index detection, Karl Fischer titration',
        },
        {
          id: 'doc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Diesterify maleic anhydride with 2-ethylhexanol, then sulfonate',
          description:
            'Two molecules of the branched alcohol are esterified onto maleic anhydride to give dioctyl maleate, and bisulfite is then added across the remaining double bond to install the sulfonate. It is bulk surfactant chemistry, which is why the material costs almost nothing and why it appears in industrial as well as pharmaceutical grades.',
          dependsOnStepId: 'doc-w1',
          reagentsAndBuffer:
            'Maleic anhydride, 2-ethylhexanol in excess, acid catalyst with azeotropic water removal, sodium bisulfite for the sulfonation, neutralisation to the sodium salt',
        },
        {
          id: 'doc-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Strip residual 2-ethylhexanol and the monoester',
          description:
            'The monoester and free alcohol are surface-active too, so a routine surfactant assay will not distinguish them from the drug. They have to be removed and separately limited, because a specification written on total surface activity would pass a batch that is substantially not the intended molecule.',
          dependsOnStepId: 'doc-w2',
          reagentsAndBuffer:
            'Vacuum stripping of residual alcohol, aqueous washes to remove inorganic sulfite and sulfate, gas chromatography with headspace injection for residual 2-ethylhexanol, HPLC limits for the monoester',
        },
        {
          id: 'doc-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Test whether it emulsifies a real stool, at a real luminal concentration',
          description:
            'The mechanism claim is that docusate lets water and fat mix into faecal matter. That is testable in vitro on human stool at the concentrations a 100 mg dose actually reaches in the colon after dilution across the whole luminal volume. Demonstrating surface activity in a clean buffer at high concentration proves the molecule is a surfactant, which nobody disputes, and says nothing about whether the dose does anything in a bowel.',
          dependsOnStepId: 'doc-w3',
          reagentsAndBuffer:
            'Human faecal homogenates at physiological solids content, docusate across a luminal concentration range estimated from dose and colonic water volume, interfacial tension measurement, water-holding capacity by centrifugation, paired surfactant-free controls',
        },
        {
          id: 'doc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Collect and weigh the stools rather than asking about them',
          description:
            'The trial that settled this question did not use a symptom questionnaire. It collected stools, weighed them, and measured water content directly, against a two-week placebo baseline. That is why its result — a 0.01% increase in stool water content against 2.33% for the comparator — is worth more than any number of positive impressions, and why softener trials that report only patient-reported ease of passage cannot answer the question they are asking.',
          dependsOnStepId: 'doc-w4',
          reagentsAndBuffer:
            'Two-week placebo baseline phase, complete stool collection, gravimetric water content by drying to constant weight, Bristol Stool Form Scale scoring, O’Brien rank-type composite of objective constipation measures',
        },
      ],
    },
    keyAudits: [
      {
        id: 'doc-a1',
        category: 'failed',
        title: 'Measured stool softening: 0.01%',
        laymanSummary:
          'A stool softener has exactly one job. In the trial that collected and weighed the stools, docusate raised their water content by one hundredth of one per cent. The fibre supplement it was compared against raised it by 2.33%.',
        technicalDetails:
          'A multi-site, randomised, double-blind, parallel-design study of 170 subjects with chronic idiopathic constipation ran a two-week placebo baseline followed by two weeks of psyllium 5.1 g twice daily plus docusate placebo, or docusate sodium 100 mg twice daily plus psyllium placebo, with stools collected and assessed. Change from baseline in stool water content was 2.33% for psyllium against 0.01% for docusate (p=0.007). Psyllium also produced greater stool water weight (84.0 g against 71.4 g per bowel movement, p=0.04), greater total stool output (359.9 g against 271.9 g per week, p=0.005), a better O’Brien rank-type composite of objective constipation measures (475.1 against 403.9, p=0.002), and more bowel movements in treatment week 2 (3.5 against 2.9 per week, p=0.02), with no significant difference in week 1. Two things about this trial should be stated together: it is the only direct measurement of the mechanism docusate is sold on, and its authors were employees of the company that markets psyllium, disclosed in the paper’s affiliations. The comparison is not blinded to commercial interest. It is still the only stool-water measurement there is.',
        evidenceSource:
          'McRorie JW, Daggy BP, Morel JG, Diersing PS, Miner PB, Robinson M. Psyllium is superior to docusate sodium for treatment of chronic constipation. Aliment Pharmacol Ther 1998;12(5):491-497',
        doi: '10.1046/j.1365-2036.1998.00336.x',
        measuredMetric:
          'Change from baseline in stool water content, measured on collected stools over two weeks',
        auditFlag: 'caution',
      },
      {
        id: 'doc-a2',
        category: 'failed',
        title: 'Added to a laxative that works, it changed nothing measurable',
        laymanSummary:
          'Seventy-four hospice patients were randomised to senna plus docusate or senna plus placebo. Stool frequency, volume, consistency, difficulty and completeness of evacuation were all the same.',
        technicalDetails:
          'A 10-day prospective, randomised, double-blind, placebo-controlled trial in Edmonton, Alberta randomised 74 hospice patients to docusate plus sennosides (n=35) or placebo plus sennosides (n=39). Primary outcomes were stool frequency, volume and consistency; secondary outcomes were patient perceptions of difficulty and completeness of evacuation and bowel-related interventions. There were no significant differences between the groups on any of them. The one difference that reached significance ran the wrong way for docusate: on the Bristol Stool Form Scale more placebo patients had Type 4 (smooth and soft) and Type 5 (soft blobs) stool, while more docusate patients had Type 3 (sausage-like) and Type 6 (mushy) stool, p=0.01. The authors note in their own background that there is little experimental evidence to support the widespread use of docusate and that no randomised trial had been conducted in the hospice setting before theirs.',
        evidenceSource:
          'Tarumi Y, Wilson MP, Szafran O, Spooner GR. J Pain Symptom Manage 2013;45(1):2-13',
        doi: '10.1016/j.jpainsymman.2012.02.008',
        measuredMetric:
          'Stool frequency, volume and consistency over 10 days, docusate plus sennosides against placebo plus sennosides',
        auditFlag: 'caution',
      },
      {
        id: 'doc-a3',
        category: 'inferred',
        title: 'The mechanism was accepted because it was plausible',
        laymanSummary:
          'Docusate is a detergent, and detergents let water and grease mix. The step that was never demonstrated is that a swallowed dose does this to a stool inside a person.',
        technicalDetails:
          'Docusate sodium is dioctyl sulfosuccinate, an anionic surfactant with two branched eight-carbon tails and a sulfonate head. Its surface activity in vitro is not in doubt and never has been. The claim on the packet — that it helps prevent dry, hard stools by letting water and fat penetrate them — is an extrapolation from that physical property to a clinical effect at the concentration a 100 mg dose reaches once diluted across the water in a colon. That step is the one the McRorie stool-collection trial tested directly, and the measured increase in stool water content was 0.01%. This is the structure of the whole problem: a real mechanism, demonstrated in a beaker, asserted as a clinical effect and then not found when someone looked.',
        evidenceSource:
          'Docusate sodium over-the-counter Drug Facts label — Purpose "Stool softener", Uses "relieves occasional constipation (irregularity), generally produces bowel movement in 12 to 72 hours" (openFDA drug/label record); McRorie JW et al. Aliment Pharmacol Ther 1998;12:491-497',
        doi: '10.1046/j.1365-2036.1998.00336.x',
        inferredClaim:
          'That in vitro surface activity produces measurable stool softening in vivo at the labelled dose — the sole basis of the product category, and the one thing the stool-collection trial failed to find',
        auditFlag: 'contested',
      },
      {
        id: 'doc-a4',
        category: 'failed',
        title: 'The systematic review found four eligible studies and none of them good',
        laymanSummary:
          'In 2000 someone searched sixty years of literature for controlled trials of oral docusate in the chronically ill. Nine studies existed. Four were eligible. Their quality scores were around half of the maximum.',
        technicalDetails:
          'A systematic review searched Medline from 1966 to April 1997, CINAHL, Current Contents, the Cochrane Library, a hand search of Index Medicus back to 1940, three palliative care journals, references in relevant articles and texts, and direct contact with experts, for prospective controlled trials of oral docusate in humans with chronic illness and risk factors for or existing constipation. Of nine identified studies, four were eligible, using three different designs with sample sizes from 15 to 74. Quality assessment scores ranged from 0.46 to 0.52 against a perfect score of 1.0, and three of the four were flawed in blinding of treatment allocation and in the use of co-interventions. All four showed a small trend toward increased stool frequency on docusate, but clinical heterogeneity made pooling infeasible. The reviewers concluded that the use of docusate for constipation in palliative care rests on inadequate experimental evidence and that randomised controlled trials were needed. The randomised controlled trial arrived thirteen years later and was negative.',
        evidenceSource:
          'Hurdon V, Viola R, Schroder C. How useful is docusate in patients at risk for constipation? A systematic review of the evidence in the chronically ill. J Pain Symptom Manage 2000;19(2):130-136',
        doi: '10.1016/s0885-3924(99)00157-8',
        measuredMetric:
          'Number and methodological quality of prospective controlled trials of oral docusate available up to 1997',
        auditFlag: 'caution',
      },
      {
        id: 'doc-a5',
        category: 'conclusion_shift',
        title: 'It is now formally listed as something done for no reason',
        laymanSummary:
          'The Society of Hospital Medicine publishes a series called Things We Do for No Reason. Prescribing docusate for constipation in hospitalised adults is one of the entries.',
        technicalDetails:
          'Fakheri and Volpicelli, writing in the Journal of Hospital Medicine’s Things We Do for No Reason series in 2019, addressed the prescribing of docusate for constipation in hospitalised adults. The series exists to identify practices that are common, entrenched and unsupported. The trajectory across these four records is unusually clean for a drug audit: mechanism asserted from a physical property, systematic review in 2000 finding the trial base inadequate, direct stool-water measurement in 1998 finding an effect of 0.01%, randomised placebo-controlled trial in 2013 finding no added benefit, and formal deprescribing advocacy in 2019. What has not changed is the shelf: docusate remains one of the most commonly administered medications in American hospitals and is sold over the counter everywhere.',
        evidenceSource:
          'Fakheri RJ, Volpicelli FM. Things We Do for No Reason: Prescribing Docusate for Constipation in Hospitalized Adults. J Hosp Med 2019;14(2):110-113',
        doi: '10.12788/jhm.3124',
        inferredClaim:
          'That a drug this widely used must be doing something — the assumption the Things We Do for No Reason series exists to test, and which in this case did not survive',
        auditFlag: 'contested',
      },
      {
        id: 'doc-a6',
        category: 'measured',
        title: 'The combination products borrow senna’s onset',
        laymanSummary:
          'Docusate on its own claims a bowel movement in 12 to 72 hours. Combined with senna, the packet claims 6 to 12 hours. The faster number belongs to the senna.',
        technicalDetails:
          'The docusate-only label states: "relieves occasional constipation (irregularity), generally produces bowel movement in 12 to 72 hours". The Senna-S label, containing docusate sodium 50 mg and sennosides 8.6 mg per tablet, states: "relieves occasional constipation (irregularity), generally produces bowel movement in 6-12 hours". Senna alone acts within that window; docusate’s own labelled window is up to six times longer at its far end. A 12-to-72-hour claim is also close to unfalsifiable in ordinary use: most episodes of occasional constipation resolve inside three days without any intervention, which is precisely why the randomised, placebo-controlled, stool-collecting designs were necessary and why the impressions of prescribers and patients were not sufficient.',
        evidenceSource:
          'Docusate sodium and SENNA-S over-the-counter Drug Facts labels — Purpose and Uses sections (openFDA drug/label records)',
        measuredMetric:
          'Labelled onset of action, docusate alone (12 to 72 hours) against docusate plus sennosides (6 to 12 hours)',
        auditFlag: 'verified',
      },
      {
        id: 'doc-a7',
        category: 'measured',
        title: 'The one thing it definitely does is make other things absorbable',
        laymanSummary:
          'The first warning on the label is not to take it with mineral oil. That is because docusate is an emulsifier, and emulsifying an oil that is supposed to stay in the bowel is how it gets into the body.',
        technicalDetails:
          'The label’s warnings section opens: "Do not use if you are presently taking mineral oil, unless told to do so by a doctor." Mineral oil works as a laxative precisely because it is not absorbed; a surfactant that emulsifies it removes that property. This is the one clinically consequential effect of docusate that follows directly and uncontroversially from its surface activity, and it is a harm rather than a benefit. The remainder of the label is standard for the category: consult a doctor for stomach pain, nausea, vomiting, or a sudden change in bowel habit lasting over two weeks; stop for rectal bleeding, for failure to have a bowel movement after using a laxative, or if a stool softener is needed for more than a week.',
        evidenceSource:
          'Docusate sodium over-the-counter Drug Facts label — Warnings, Ask a doctor and Stop use sections (openFDA drug/label record)',
        measuredMetric:
          'Labelled contraindication against concurrent mineral oil, arising from the drug’s emulsifying property',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A detergent, swallowed',
        laymanDesc:
          'One to three softgels a day. The molecule inside is a surfactant — the same class of chemistry as washing-up liquid, at a dose that is safe to take.',
        molecularDetail:
          'Docusate sodium is dioctyl sulfosuccinate: a succinate backbone diesterified with two branched 2-ethylhexyl groups and carrying a sulfonate on the central carbon. Two lipophilic tails and one ionised head is the canonical anionic surfactant architecture; the record’s calculated logP for the free acid is 6.49. Typical labelled use is 1 to 3 softgels daily for adults and children 12 and over.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It stays in the bowel, where the stool is',
        laymanDesc:
          'It is not meant to be absorbed or to reach any organ. Its whole intended action is on the contents of the gut.',
        molecularDetail:
          'No systemic target is claimed. The proposed site of action is the luminal contents of the small and large bowel, which is why the label describes the product as a stool softener rather than a laxative and why the mechanism claim is physicochemical rather than pharmacological.',
        iconName: 'Container',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Surface tension falls — in a beaker, certainly',
        laymanDesc:
          'Surfactants let water and fat mix. Docusate is unquestionably a surfactant. That part of the story is not in dispute.',
        molecularDetail:
          'Docusate lowers interfacial tension and forms micelles above its critical micelle concentration. It is used industrially and pharmaceutically as a wetting and emulsifying agent for exactly this reason. What is in dispute is not whether the molecule has this property but whether a 100 mg dose retains it once diluted across the water content of a human colon.',
        iconName: 'Beaker',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Water and fat are supposed to soak into the stool',
        laymanDesc:
          'The claimed result is a stool that has more water in it and is therefore easier to pass.',
        molecularDetail:
          'The label claim is that the product helps prevent dry, hard stools. The measurable form of that claim is stool water content, stool water weight and Bristol Stool Form Scale score, all of which are collectable endpoints and all of which have been collected.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'When measured, the increase was one hundredth of one per cent',
        laymanDesc:
          'The trial that collected and weighed the stools found docusate raised their water content by 0.01%. Psyllium, in the same trial, raised it by 2.33%.',
        molecularDetail:
          'McRorie 1998, 170 randomised subjects, two-week placebo baseline then two weeks of treatment: change from baseline in stool water content 0.01% for docusate 100 mg twice daily against 2.33% for psyllium 5.1 g twice daily, p=0.007. Stool water weight 71.4 g against 84.0 g per bowel movement (p=0.04); weekly stool output 271.9 g against 359.9 g (p=0.005).',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And added to a working laxative, nothing changed',
        laymanDesc:
          'In hospice patients already taking senna, adding docusate made no difference to how often, how much, how easily or how completely they passed stool.',
        molecularDetail:
          'Tarumi 2013, 74 randomised hospice patients over 10 days: no significant difference between docusate plus sennosides (n=35) and placebo plus sennosides (n=39) in stool frequency, volume, consistency, difficulty of evacuation or completeness of evacuation. The only significant Bristol Stool Form Scale difference favoured the placebo arm.',
        iconName: 'XCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'McRorie 1998 (Aliment Pharmacol Ther 1998;12:491-497)',
        phase: 'Multi-site, randomised, double-blind, parallel-design, double-dummy',
        sampleSize: 170,
        primaryEndpoint:
          'Stool softening measured as change from baseline in stool water content, on collected stools, docusate sodium 100 mg twice daily against psyllium 5.1 g twice daily over two weeks',
        endpointMet: false,
        statisticalPValue:
          'Docusate 0.01% against psyllium 2.33% (p=0.007); stool water weight 71.4 g against 84.0 g per bowel movement (p=0.04); weekly stool output 271.9 g against 359.9 g (p=0.005)',
        unreportedAdverseSignals:
          'The authors were employees of the company that markets psyllium, disclosed in the paper’s affiliations. There was no placebo arm during the treatment phase — the two-week baseline was the placebo comparison — so the trial establishes that docusate is worse than psyllium at softening stool, not by how much it beats nothing.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Tarumi 2013 (J Pain Symptom Manage 2013;45:2-13)',
        phase: 'Prospective, randomised, double-blind, placebo-controlled, 10 days',
        sampleSize: 74,
        primaryEndpoint:
          'Stool frequency, volume and consistency in hospice patients receiving docusate plus sennosides against placebo plus sennosides',
        endpointMet: false,
        statisticalPValue:
          'No significant difference in stool frequency, volume or consistency, nor in difficulty or completeness of evacuation. The only significant finding, on the Bristol Stool Form Scale, favoured placebo (p=0.01)',
        unreportedAdverseSignals:
          'Seventy-four patients over ten days is small and short, and the trial was designed to detect an added effect on top of an effective stimulant laxative rather than an effect against nothing. It remains the only randomised placebo-controlled trial of docusate in the hospice setting.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Hurdon 2000 systematic review (J Pain Symptom Manage 2000;19:130-136) — evidence base up to April 1997',
        phase: 'Systematic review of prospective controlled trials',
        sampleSize: 74,
        primaryEndpoint:
          'Availability and quality of prospective controlled trials of oral docusate in the chronically ill; stool consistency, stool frequency and need for other laxatives',
        endpointMet: false,
        statisticalPValue:
          'Nine studies identified, four eligible, sample sizes 15 to 74, quality scores 0.46 to 0.52 against a maximum of 1.0; pooling infeasible for clinical heterogeneity',
        unreportedAdverseSignals:
          'All four eligible studies showed a small trend toward increased stool frequency on docusate, and three were flawed in blinding of allocation and use of co-interventions. The sample size recorded here is the largest of the four included studies, not a pooled total, because no pooling was performed.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Change from baseline in stool water content: 0.01% on docusate against 2.33% on psyllium in 170 randomised subjects (p=0.007)',
        'Stool water weight 71.4 g against 84.0 g per bowel movement and weekly stool output 271.9 g against 359.9 g, both favouring the comparator',
        'No significant difference in stool frequency, volume, consistency, difficulty or completeness of evacuation when added to sennosides in 74 hospice patients',
        'Labelled onset 12 to 72 hours alone, against 6 to 12 hours for the docusate-plus-sennoside combination',
      ],
      unsupportedInferences: [
        'That in vitro surface activity translates into stool softening at the labelled dose in a human colon — the entire basis of the product category',
        'That adding a stool softener to a stimulant laxative improves on the stimulant laxative alone',
        'That a bowel movement occurring within a 12-to-72-hour window is attributable to the drug, when most episodes of occasional constipation resolve inside three days regardless',
        'That widespread hospital use reflects demonstrated benefit — the practice is formally listed in the Things We Do for No Reason series',
      ],
      whatFailedInitially: [
        'The only direct measurement of stool water content put the effect at one hundredth of one per cent',
        'The only randomised placebo-controlled hospice trial found no difference on any primary or secondary outcome',
        'The 2000 systematic review found four eligible controlled trials with quality scores of 0.46 to 0.52 and could not pool them',
        'The one Bristol Stool Form Scale difference that did reach significance in the randomised trial favoured placebo',
      ],
      realWorldOutcome: [
        'Sold over the counter under dozens of labels and among the most frequently administered drugs in American hospitals',
        'This record carries no United States pharmacy acquisition cost, because the CMS survey holds no listed NADAC entry for it',
        'Formally addressed in the Journal of Hospital Medicine’s Things We Do for No Reason series in 2019',
        'Its clearest label-level effect is a contraindication: do not take it with mineral oil, because it makes the oil absorbable',
      ],
    },
    deliverySystem: {
      type: 'Oral softgel capsule, tablet, liquid and syrup, typically 50 to 250 mg; also sold combined with sennosides and as a rectal enema',
      description:
        'Taken by mouth only, as a single daily dose or divided. Adults and children 12 and over take 1 to 3 softgels daily; children 2 to under 12 take one; under 2 the label directs asking a doctor. The label states the product generally produces a bowel movement in 12 to 72 hours.',
      safetyProfile:
        'Do not use if presently taking mineral oil unless directed by a doctor — docusate is a surfactant and emulsifies it, removing the property that keeps mineral oil unabsorbed. Ask a doctor before use with stomach pain, nausea, vomiting, or a sudden change in bowel habit lasting over two weeks. Stop and ask a doctor for rectal bleeding, for failure to have a bowel movement after using a laxative, or if a stool softener is needed for more than one week. In pregnancy or breastfeeding, ask a health professional. In the randomised hospice trial the tolerability was unremarkable, which is consistent with the broader finding: the difficulty with docusate is not that it does harm but that no controlled comparison has found it doing anything.',
    },
    commonQuestions: [
      {
        q: 'Does docusate soften stool?',
        a: 'Not measurably, in the one trial that measured it directly. A randomised, double-blind, double-dummy study of 170 people with chronic constipation collected their stools and weighed them, before and after two weeks of either docusate 100 mg twice daily or psyllium 5.1 g twice daily. The change in stool water content was 0.01% on docusate and 2.33% on psyllium, p=0.007. Stool water weight, total weekly stool output and a composite of objective constipation measures all favoured psyllium too. One caveat worth stating: that trial was run by employees of the company that sells psyllium, which is disclosed in the paper. It is still the only measurement of stool water content there is, and no trial has produced a contrary one.',
        auditNote:
          'A stool softener that does not soften stool is a category failure, not a marginal efficacy question. The mechanism is real chemistry; the missing step is whether the dose retains it once diluted across a colon.',
      },
      {
        q: 'It was prescribed in hospital along with senna. Is that combination better?',
        a: 'The randomised evidence says no. Seventy-four hospice patients were randomised to sennosides plus docusate or sennosides plus placebo for ten days. Stool frequency, volume and consistency — the three primary outcomes — showed no significant difference, and neither did patient-reported difficulty or completeness of evacuation. The one comparison that did reach significance, on the Bristol Stool Form Scale, favoured the placebo arm. Combination packets like Senna-S advertise a bowel movement in 6 to 12 hours, which is senna’s timescale; docusate’s own label says 12 to 72 hours.',
      },
      {
        q: 'If it does not work, why is it everywhere?',
        a: 'Because the mechanism is so plausible that nobody looked for a long time, and because the way it is used makes it very hard to notice that it is not working. Docusate genuinely is a surfactant, and surfactants genuinely do let water and grease mix — that part was never wrong. But the label claims a bowel movement within 12 to 72 hours, and most episodes of occasional constipation resolve inside three days on their own, so almost every course of docusate is followed by the outcome it promises. That is exactly the situation in which impressions are worthless and controlled trials are indispensable. The first systematic review, in 2000, found four eligible controlled trials with quality scores around half of the maximum. The randomised trial came in 2013 and was negative. The Journal of Hospital Medicine placed it in its Things We Do for No Reason series in 2019.',
      },
      {
        q: 'Is it harmful?',
        a: 'There is no signal that it is, beyond one specific and mechanistically direct interaction. The first line of the warnings section says not to take it if you are presently taking mineral oil unless told to by a doctor: mineral oil works as a laxative because it is not absorbed, and an emulsifier makes it absorbable. Otherwise the label is the standard laxative set — do not use with stomach pain, nausea or vomiting; stop for rectal bleeding or if no bowel movement follows; see a doctor if a stool softener is needed for more than a week. The problem with docusate is not harm but opportunity cost: a tablet that does nothing still has to be swallowed by someone who may be finding swallowing difficult, and it occupies the place a laxative that works would have taken.',
      },
      {
        q: 'What should be used instead?',
        a: 'This page does not give treatment advice, but it can say what the comparators in the trials were and what happened to them. Psyllium beat docusate on every objective measure of softening in the head-to-head study. Sennosides produce a bowel movement in 6 to 12 hours and were the effective background therapy in the hospice trial, in which docusate added nothing to them. Polyethylene glycol 3350 achieves the goal docusate claims — more water in the stool — by osmosis, with a far larger randomised evidence base. All three cost about the same as docusate.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'McRorie JW, Daggy BP, Morel JG, Diersing PS, Miner PB, Robinson M. Psyllium is superior to docusate sodium for treatment of chronic constipation. Aliment Pharmacol Ther 1998;12(5):491-497',
        identifier: '10.1046/j.1365-2036.1998.00336.x',
        kind: 'doi',
      },
      {
        label:
          'Tarumi Y, Wilson MP, Szafran O, Spooner GR. Randomized, double-blind, placebo-controlled trial of oral docusate in the management of constipation in hospice patients. J Pain Symptom Manage 2013;45(1):2-13',
        identifier: '10.1016/j.jpainsymman.2012.02.008',
        kind: 'doi',
      },
      {
        label:
          'Hurdon V, Viola R, Schroder C. How useful is docusate in patients at risk for constipation? A systematic review of the evidence in the chronically ill. J Pain Symptom Manage 2000;19(2):130-136',
        identifier: '10.1016/s0885-3924(99)00157-8',
        kind: 'doi',
      },
      {
        label:
          'Fakheri RJ, Volpicelli FM. Things We Do for No Reason: Prescribing Docusate for Constipation in Hospitalized Adults. J Hosp Med 2019;14(2):110-113',
        identifier: '10.12788/jhm.3124',
        kind: 'doi',
      },
      {
        label:
          'Docusate sodium over-the-counter Drug Facts label — Purpose, Uses, Warnings, Directions (openFDA drug/label record)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22docusate+sodium%22+AND+_exists_:warnings&limit=2',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 11339 — dioctyl sulfosuccinic acid, the structure carried on this record; docusate sodium is PubChem CID 23673837',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11339',
        kind: 'url',
      },
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Lactulose — a sugar nobody can digest, declared unsupported by a systematic review in 2004
  //    and credited with a mortality benefit by the same research group in 2016.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lactulose',
    name: 'Lactulose',
    tradeName: 'Cephulac / Chronulac / Enulose / Generlac / Constulose / Kristalose',
    sponsor:
      'Sanofi-Aventis US (NDA 017657, CEPHULAC, original approval 25 March 1976; NDA 017884, CHRONULAC, 20 June 1979); long generic, with Enulose approved to Actavis in 1988 and more than forty listed products now',
    targetGene: 'None identified',
    targetProtein:
      'None in the human body. Lactulose has no receptor and no enzyme target — its substrate is the colonic microbiota, which ferments it, and its effect is a change in colonic pH',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1976,
    indication:
      'Prevention and treatment of portal-systemic encephalopathy, including the stages of hepatic pre-coma and coma; and, as a separate product line, treatment of chronic constipation',
    patientFriendlyIndication:
      'The confusion and drowsiness caused by advanced liver disease; and chronic constipation',
    anatomicalSite:
      'The lumen of the colon — lactulose reaches it chemically unchanged and is fermented there by resident bacteria',
    conditionContext: {
      conditionExplainer:
        'When a liver fails, substances the gut produces are no longer cleared before reaching the brain, and people become confused, drowsy and eventually comatose. Ammonia from bacterial protein breakdown is the substance most often blamed. Lactulose is a synthetic sugar that human enzymes cannot break down, so it travels intact to the colon, where bacteria ferment it into acids. The resulting acidity converts ammonia into ammonium, which cannot cross back into the blood, and the laxative effect then removes it.',
      whyItMatters:
        'This is the clearest example in medicine of an evidence verdict reversing. In 2004 a systematic review in the BMJ concluded there was insufficient evidence to support or refute lactulose in hepatic encephalopathy and recommended it should no longer serve as a comparator in trials. In 2016 a Cochrane review by overlapping authors, with 38 trials instead of 22, reported a mortality benefit. Both conclusions were drawn honestly from the evidence available at the time, and the second one still carries caveats its own authors state.',
      whoTakesThis:
        'People with cirrhosis who have had, or are at risk of, hepatic encephalopathy — where it is the first-line treatment and where the outcome evidence sits. Separately, people with chronic constipation, where it is an ordinary osmotic laxative and where a Cochrane review found polyethylene glycol better. It is contraindicated in anyone requiring a low-galactose diet.',
      clinicalGoals:
        'In liver disease: fewer episodes of encephalopathy, and — on the 2016 evidence — fewer deaths. In constipation: more bowel movements. The label’s own stated goal, a 25 to 50% fall in blood ammonia, is a surrogate for the first of these and not the same thing.',
    },
    oneSentenceVerdict:
      'A non-absorbable disaccharide fermented by colonic bacteria into acids that trap ammonia as ammonium and expel it, judged in 2004 to have insufficient evidence to support or refute its use — high-quality trials then giving a relative risk of 0.92 (95% CI 0.42 to 2.04) — and in 2016, across 38 trials and 1,828 participants, associated with a mortality risk ratio of 0.59 (95% CI 0.40 to 0.87) and a hepatic encephalopathy risk ratio of 0.58 (95% CI 0.50 to 0.69), both graded moderate quality.',
    laymanHowItWorks:
      'Lactulose is a sugar that human beings have no enzyme for, so it passes through the small intestine untouched and arrives in the colon exactly as it was swallowed. There, gut bacteria ferment it and produce acids. Two things follow. The colon becomes acidic, and ammonia drifting in from the blood is converted into ammonium, an electrically charged form that cannot cross back out — so it is trapped. And the acids draw water in, producing a laxative effect that flushes the trapped ammonium away. In liver failure, where ammonia is no longer being cleared by the liver, that is the point. In constipation, only the second half matters.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0224 per millilitre at United States pharmacy acquisition cost (CMS NADAC, median across 46 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved 25 March 1976 under NDA 017657 as CEPHULAC for portal-systemic encephalopathy, with CHRONULAC for constipation following in June 1979 under NDA 017884; generic since at least 1988. It costs about two United States cents a millilitre at acquisition cost, and it is on the WHO Model List of Essential Medicines. The comparator that took its place in some guidelines, rifaximin, is not remotely comparable in price.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Lactulose has two indications and a different competitor in each. In hepatic encephalopathy it competes with rifaximin, an antibiotic that works on the same bacteria from the other direction and costs orders of magnitude more. In constipation it competes with polyethylene glycol, which a Cochrane review of ten randomised trials and 868 participants found better on stool frequency, stool form, abdominal pain and the need for additional products.',
      conventionalRx: [
        {
          name: 'Rifaximin (Xifaxan)',
          class: 'Non-absorbed oral antibiotic',
          howItCompares:
            'Attacks the same problem from the opposite end: instead of acidifying the colon to trap ammonia, it reduces the bacteria producing it. The 2004 systematic review found non-absorbable disaccharides inferior to antibiotics in reducing the risk of no improvement (relative risk 1.24, 95% CI 1.02 to 1.50, ten trials), while noting it was unclear whether that difference was clinically important, and found no significant mortality difference between them (0.90, 0.48 to 1.67, five trials).',
          typicalCost: 'Not stated here — no verified United States acquisition cost was available',
          prosAndCons:
            'Pros: superior to the disaccharides on the improvement endpoint in the 2004 pooling; far better tolerated than the diarrhoea a lactulose dose is titrated to. Cons: an antibiotic given long term; and the label warns that eliminating colonic bacteria with an anti-infective may interfere with the degradation of lactulose itself, so the two are not simply additive.',
        },
        {
          name: 'Polyethylene glycol 3350 (Miralax)',
          class: 'Osmotic laxative',
          howItCompares:
            'For constipation rather than encephalopathy, and better at it. A Cochrane review of ten randomised trials and 868 participants — 322 adults and 546 children — found polyethylene glycol superior on stool frequency per week (mean difference 0.65, 95% CI 0.15 to 1.15), stool form (0.89, 0.43 to 1.35), relief of abdominal pain (odds ratio 2.09, 1.26 to 3.44) and not needing additional products (4.00, 2.01 to 7.95). Its stated conclusion is that polyethylene glycol should be used in preference to lactulose in chronic constipation.',
          typicalCost:
            'Among the cheapest over-the-counter products in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: better on every pooled constipation endpoint; not fermented, so no gas. Cons: it does nothing for ammonia, so it is not a substitute in liver disease; the abdominal pain advantage was significant in children and not in adults (odds ratio 0.86, 0.25 to 2.90).',
        },
        {
          name: 'Lactitol',
          class: 'The other non-absorbable disaccharide',
          howItCompares:
            'Reviewed head-to-head against lactulose in eight randomised trials within the same Cochrane review, which found no differences between them on any outcome, at very low quality of evidence, and noted that none of those trials evaluated quality of life. For the purposes of the evidence base the two are treated as one intervention.',
          typicalCost: 'Not stated here — no verified United States acquisition cost was available',
          prosAndCons:
            'Pros: often described as more palatable, which matters for a drug taken as a sweet syrup at diarrhoea-inducing doses. Cons: no demonstrated difference in outcomes; not widely available in the United States.',
        },
      ],
      naturalFoods: [
        {
          name: 'Fermentable fibres — inulin, resistant starch, galacto-oligosaccharides',
          activeCompound: 'Non-digestible oligosaccharides fermented to short-chain fatty acids',
          biologicalMechanism:
            'The same chemistry lactulose exploits: a carbohydrate humans cannot hydrolyse reaches the colon intact, resident bacteria ferment it to short-chain fatty acids, and colonic pH falls. Lactulose is essentially a purified, dose-controlled version of this, and it is used as a prebiotic on exactly that basis.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. For scale only: no fermentable fibre has a randomised trial in hepatic encephalopathy with a mortality or encephalopathy endpoint, and the pH change lactulose produces is titrated to a specific stool frequency in that setting rather than left to diet. Fermentable fibres also produce the same gas and bloating — the label attributes flatulence, belching or cramping to lactulose in about 20% of patients.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Tell the endoscopist you are on it',
          action:
            'Before any proctoscopy or colonoscopy involving electrocautery, say that you take lactulose.',
          patientImpact:
            'The label carries an unusual warning: a theoretical hazard exists for patients on lactulose undergoing electrocautery, because accumulated hydrogen gas in significant concentration in the presence of an electrical spark may result in an explosive reaction. The hydrogen is a product of the bacterial fermentation the drug depends on.',
          clinicalPrecaution:
            'The label directs a thorough bowel cleansing with a non-fermentable solution before such procedures, and notes that insufflation of carbon dioxide as an additional safeguard is considered redundant. No such complication has been reported with lactulose.',
        },
        {
          name: 'Do not add another laxative early on',
          action:
            'In encephalopathy treatment, do not take other laxatives alongside it, particularly at the start.',
          patientImpact:
            'The label states that other laxatives should not be used, especially during the initial phase of therapy for portal-systemic encephalopathy, because the loose stools they cause may falsely suggest that an adequate lactulose dose has been reached. The dose in this indication is titrated to stool frequency, so anything else producing loose stools destroys the only signal being used.',
          clinicalPrecaution:
            'The label makes the same point about antibiotics and antacids from the other direction: eliminating colonic bacteria may prevent degradation of lactulose, and non-absorbable antacids may inhibit the intended fall in colonic pH.',
        },
        {
          name: 'It contains sugar you may not be able to have',
          action:
            'Mention diabetes, and any requirement for a low-galactose diet, before starting it.',
          patientImpact:
            'Lactulose solution contains less than 1.6 g of galactose and less than 1.2 g of lactose per 15 mL. The label makes a low-galactose diet requirement an outright contraindication and directs caution in diabetics.',
          clinicalPrecaution:
            'The label also notes that infants receiving lactulose may develop hyponatraemia and dehydration, and that excessive dosage can cause diarrhoea with fluid loss, hypokalaemia and hypernatraemia — in a population that often already has electrolyte disturbance from the underlying liver disease.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C([C@@H]1[C@@H]([C@@H]([C@H]([C@@H](O1)O[C@@H]2[C@H](O[C@@]([C@H]2O)(CO)O)CO)O)O)O)O',
      chemicalFormula: 'C12H22O11',
      molecularWeight: '342.30 g/mol',
      targetReceptorAffinity:
        'None, and the absence is the mechanism. Lactulose is galactose linked to fructose — the same two sugars as lactose but with glucose replaced by fructose, which is why no human enzyme hydrolyses it. The label records that when incubated with extracts of human small intestinal mucosa, lactulose was not hydrolysed over 24 hours and did not inhibit those extracts’ activity on lactose. Urinary excretion is 3% or less and essentially complete within 24 hours. The record’s calculated logP is −5.80, about as hydrophilic as a small molecule gets, which is why essentially none of it is absorbed.',
      structureSource: {
        label:
          'PubChem CID 11333 (lactulose) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11333',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lac-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Quantify the residual lactose, galactose and epilactose',
          description:
            'Lactulose is made from lactose and is never fully converted, so every batch carries residual lactose and free galactose — both of which the label quantifies per 15 mL because both matter clinically. Epilactose and other isomerisation by-products carry no benefit and add osmotic load. This is a purity specification with a direct patient consequence: the galactose content is why the product is contraindicated in a low-galactose diet.',
          reagentsAndBuffer:
            'Lactulose reference standard, high-performance anion-exchange chromatography with pulsed amperometric detection to resolve lactulose from lactose, galactose, epilactose and tagatose, refractive index detection for assay, Karl Fischer titration',
        },
        {
          id: 'lac-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Isomerise lactose under base or with an immobilised isomerase',
          description:
            'Lactulose is lactose with its glucose unit isomerised to fructose. The classical route is base-catalysed Lohmann-de-Bruyn-van-Ekenstein rearrangement, which is cheap and gives a modest yield alongside degradation products; enzymatic isomerisation gives cleaner material. Either way the starting material is a dairy by-product, which is the whole reason this drug costs two cents a millilitre.',
          dependsOnStepId: 'lac-w1',
          reagentsAndBuffer:
            'Lactose from whey permeate, sodium hydroxide or sodium aluminate for base catalysis or an immobilised cellobiose 2-epimerase for the enzymatic route, controlled temperature and residence time, acid neutralisation',
        },
        {
          id: 'lac-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separate lactulose from unreacted lactose by chromatography or crystallisation',
          description:
            'Lactulose and lactose are isomers of identical mass and near-identical polarity, which makes this the expensive step and the reason the marketed product is a syrup carrying declared residual lactose rather than a pure crystalline solid. The crystalline powder presentations exist because some of that separation was done.',
          dependsOnStepId: 'lac-w2',
          reagentsAndBuffer:
            'Simulated moving bed chromatography on a cation-exchange resin in calcium form, or fractional crystallisation from alcohol-water, activated carbon decolourisation, ion exchange demineralisation, evaporation to a 10 g/15 mL syrup',
        },
        {
          id: 'lac-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Confirm it survives the small intestine and is fermented in the colon',
          description:
            'The entire therapeutic design depends on nothing happening until the colon. That is two separate experiments, not one: no hydrolysis by human mucosal enzymes, and fermentation by colonic flora to acids that lower pH. The second is why the drug fails in a patient whose colonic bacteria have been eliminated, which is exactly what the label’s antibiotic interaction warning is about.',
          dependsOnStepId: 'lac-w3',
          reagentsAndBuffer:
            'Human small intestinal mucosal extracts with lactose as a positive control substrate, anaerobic faecal fermentation with pH monitoring, short-chain fatty acid quantification by gas chromatography, paired antibiotic-treated microbiota controls',
        },
        {
          id: 'lac-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure the encephalopathy, not only the ammonia',
          description:
            'Blood ammonia is what the label reports and it is a surrogate. The endpoints that decided this drug’s standing were mortality, episodes of overt encephalopathy, and psychometric batteries — number connection, figure connection, digit symbol and object assembly tests plus critical flicker frequency. A trial that reports only the ammonia fall has measured the mechanism and not the disease.',
          dependsOnStepId: 'lac-w4',
          reagentsAndBuffer:
            'Blood ammonia assay, number connection tests A and B, figure connection tests for illiterate participants, digit symbol test, object assembly test, critical flicker frequency measurement, prespecified overt encephalopathy definition, all-cause mortality follow-up',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lac-a1',
        category: 'conclusion_shift',
        title: 'Declared unsupported in 2004, credited with saving lives in 2016',
        laymanSummary:
          'A 2004 systematic review found the evidence insufficient either to support or refute lactulose in liver-related confusion, and recommended it stop being used as the comparator in new trials. A 2016 review by overlapping authors, with 38 trials instead of 22, found a reduction in deaths.',
        technicalDetails:
          'Als-Nielsen, Gluud and Gluud in the BMJ in 2004 pooled 22 randomised trials. Against placebo or no intervention, non-absorbable disaccharides appeared to reduce the risk of no improvement (relative risk 0.62, 95% CI 0.46 to 0.84, six trials) — but the two high-quality trials found no significant effect (0.92, 95% CI 0.42 to 2.04). Mortality showed no significant effect (0.41, 95% CI 0.02 to 8.68, four trials). The conclusion was that there is insufficient evidence to support or refute the use of non-absorbable disaccharides, and that they should not serve as comparator in randomised trials on hepatic encephalopathy. Gluud, Vilstrup and Morgan in the Cochrane Database in 2016 included 38 randomised trials and 1,828 participants and reported a beneficial effect on mortality (risk ratio 0.59, 95% CI 0.40 to 0.87; 1,487 participants; 24 trials; I²=0%; moderate quality), on hepatic encephalopathy (0.58, 95% CI 0.50 to 0.69; 1,415 participants; 22 trials; I²=32%; moderate quality) and on serious adverse events of the underlying liver disease including liver failure, hepatorenal syndrome and variceal bleeding (0.47, 95% CI 0.36 to 0.60). Both reviews were done properly. The difference is twelve years of additional trials, and it is the clearest available demonstration that "no evidence of effect" and "evidence of no effect" are not the same statement.',
        evidenceSource:
          'Als-Nielsen B, Gluud LL, Gluud C. BMJ 2004;328(7447):1046; Gluud LL, Vilstrup H, Morgan MY. Cochrane Database Syst Rev 2016;5:CD003044',
        doi: '10.1002/14651858.CD003044.pub4',
        measuredMetric:
          'All-cause mortality and hepatic encephalopathy, non-absorbable disaccharides against placebo or no intervention, pooled across 22 trials in 2004 and 38 in 2016',
        auditFlag: 'verified',
      },
      {
        id: 'lac-a2',
        category: 'failed',
        title: 'The 2016 review’s own sensitivity analyses do not all hold',
        laymanSummary:
          'The mortality result survives when every trial is counted. It does not survive when only the eight trials at low risk of bias are counted in the formal sequential test, or when the assumed size of the benefit is lowered.',
        technicalDetails:
          'The Cochrane review states that eight of the 38 trials had a low risk of bias in the assessment of mortality and that all trials had a high risk of bias in the assessment of the remaining outcomes. The mortality risk ratio in the low-risk-of-bias subset was 0.63 (95% CI 0.41 to 0.97, 705 participants) — still significant, but with a confidence interval reaching almost to 1. The Trial Sequential Analysis, which tests whether enough information has accumulated to rule out a chance finding, confirmed the result with a 30% relative risk reduction when including all trials, but not when including only the low-risk-of-bias trials, and not when the relative risk reduction was reduced to 22%. The review’s own conclusion is correspondingly hedged: that the analyses found evidence that non-absorbable disaccharides "may be associated with" a beneficial effect. The quality of evidence for every one of the three main outcomes was graded moderate, not high.',
        evidenceSource:
          'Gluud LL, Vilstrup H, Morgan MY. Cochrane Database Syst Rev 2016;5:CD003044 — risk of bias assessment, Trial Sequential Analysis and GRADE ratings',
        doi: '10.1002/14651858.CD003044.pub4',
        measuredMetric:
          'Mortality risk ratio restricted to low-risk-of-bias trials, and Trial Sequential Analysis at 30% and 22% relative risk reduction',
        auditFlag: 'caution',
      },
      {
        id: 'lac-a3',
        category: 'inferred',
        title: 'The label claims parity with an antibiotic that the meta-analysis says beat it',
        laymanSummary:
          'The prescribing information says the clinical response to lactulose is at least as satisfactory as with neomycin. The 2004 pooling of ten trials found antibiotics better.',
        technicalDetails:
          'The lactulose label states, in the Indications and Usage section: "The clinical response has been observed in about 75% of patients, which is at least as satisfactory as that resulting from neomycin therapy." That claim dates from the 1970s registration. The 2004 systematic review pooled ten trials comparing non-absorbable disaccharides with antibiotics and found the disaccharides inferior in reducing the risk of no improvement (relative risk 1.24, 95% CI 1.02 to 1.50) and in lowering blood ammonia concentration (weighted mean difference 2.35 µmol/L, 95% CI 0.06 to 13.45). There was no significant difference in mortality (0.90, 95% CI 0.48 to 1.67, five trials), and the reviewers explicitly noted it was unclear whether the improvement difference was clinically important. The label sentence and the pooled result are not reconcilable as written, and the label is the older document.',
        evidenceSource:
          'Lactulose solution United States prescribing information, Indications and Usage (openFDA drug/label record); Als-Nielsen B, Gluud LL, Gluud C. BMJ 2004;328:1046',
        doi: '10.1136/bmj.38048.506134.EE',
        inferredClaim:
          'That lactulose performs at least as well as neomycin — a label claim from the 1970s contradicted by a 2004 pooling of ten randomised comparisons against antibiotics',
        auditFlag: 'contested',
      },
      {
        id: 'lac-a4',
        category: 'inferred',
        title: 'A 25 to 50% fall in blood ammonia is a mechanism, not an outcome',
        laymanSummary:
          'The label’s headline efficacy number is a blood test. Ammonia levels and how confused someone actually is do not track each other closely, which is why the trials that changed this drug’s standing measured neither.',
        technicalDetails:
          'The label states: "Controlled studies have shown that lactulose solution therapy reduces the blood ammonia levels by 25 to 50%; this is generally paralleled by an improvement in the patients’ mental state and by an improvement in EEG patterns." The mechanism section describes the chain in full: bacterial degradation of lactulose acidifies colonic contents, ammonia migrates from blood into the colon and is trapped as ammonium, and the laxative action expels it. Each step is well established. The word carrying the weight is "generally paralleled". The endpoints that settled the question in 2016 were mortality, episodes of overt encephalopathy and serious adverse events of the underlying liver disease; the endpoints used in the secondary-prophylaxis trial were psychometric batteries and critical flicker frequency. Blood ammonia is where the mechanism is visible and not where the disease is.',
        evidenceSource:
          'Lactulose solution United States prescribing information, Indications and Usage and Clinical Pharmacology (openFDA drug/label record)',
        inferredClaim:
          'That a 25 to 50% reduction in blood ammonia constitutes evidence of clinical benefit — the mechanism is sound and the surrogate is not the outcome',
        auditFlag: 'caution',
      },
      {
        id: 'lac-a5',
        category: 'measured',
        title: 'It prevents recurrence, in an open-label trial, without changing deaths',
        laymanSummary:
          'A hundred and forty cirrhotic patients who had recovered from an episode of encephalopathy were randomised to lactulose or nothing. Over fourteen months, 20% on lactulose had another episode against 47%. Deaths were 5 against 11, which was not statistically significant.',
        technicalDetails:
          'An open-label randomised controlled trial at G. B. Pant Hospital, New Delhi, screened 300 patients who had recovered from hepatic encephalopathy; 140 met the inclusion criteria and were randomised to lactulose or placebo. Overt hepatic encephalopathy developed in 12 of 61 (19.6%) on lactulose against 30 of 64 (46.8%) on placebo over a median follow-up of 14 months, range 1 to 20 months, p=0.001. Readmission for causes other than encephalopathy was 9 against 6 (not significant) and deaths were 5 against 11 (p=0.18). Recurrence was significantly associated with having two or more abnormal psychometric tests after recovery from the index episode (r=0.369, p=0.02). Two limits are on the face of the paper: it is open-label, which matters most for an endpoint assessed clinically, and the mortality difference points the right way without reaching significance in 140 patients.',
        evidenceSource:
          'Sharma BC, Sharma P, Agrawal A, Sarin SK. Secondary prophylaxis of hepatic encephalopathy: an open-label randomized controlled trial of lactulose versus placebo. Gastroenterology 2009;137(3):885-891',
        doi: '10.1053/j.gastro.2009.05.056',
        measuredMetric:
          'Development of overt hepatic encephalopathy over a median 14 months after recovery from an index episode',
        auditFlag: 'verified',
      },
      {
        id: 'lac-a6',
        category: 'failed',
        title: 'For plain constipation, polyethylene glycol beats it on every pooled endpoint',
        laymanSummary:
          'Lactulose has a second life as an ordinary laxative. In the Cochrane review of the ten trials comparing it head to head with polyethylene glycol, it lost on stool frequency, stool form, abdominal pain and the need for additional products.',
        technicalDetails:
          'The Cochrane review pooled ten randomised trials with 868 participants — 322 adults and 546 children — conducted between 1997 and 2007 across six countries. Polyethylene glycol was superior on stool frequency per week (mean difference 0.65, 95% CI 0.15 to 1.15; five studies, 407 participants), stool form (0.89, 95% CI 0.43 to 1.35; two studies, 301 participants), relief of abdominal pain (odds ratio 2.09, 95% CI 1.26 to 3.44; three studies, 300 participants) and not requiring additional products (odds ratio 4.00, 95% CI 2.01 to 7.95; three studies, 225 participants). Its stated conclusion is that polyethylene glycol should be used in preference to lactulose in the treatment of chronic constipation. One nuance the headline conclusion hides: the abdominal pain advantage was driven by the paediatric trials (odds ratio 2.52, 95% CI 1.45 to 4.40) and was not significant in adults (0.86, 95% CI 0.25 to 2.90).',
        evidenceSource:
          'Lee-Robichaud H, Thomas K, Morgan J, Nelson RL. Lactulose versus polyethylene glycol for chronic constipation. Cochrane Database Syst Rev 2010;7:CD007570',
        doi: '10.1002/14651858.CD007570.pub2',
        measuredMetric:
          'Stool frequency per week, stool form, relief of abdominal pain and need for additional products, lactulose against polyethylene glycol',
        auditFlag: 'caution',
      },
      {
        id: 'lac-a7',
        category: 'measured',
        title:
          'A label old enough to say the frequency data are not available — and to warn about explosions',
        laymanSummary:
          'The adverse reactions section begins by saying precise frequency data do not exist. And there is a warning that the hydrogen gas the drug produces could ignite during electrocautery.',
        technicalDetails:
          'The adverse reactions section opens: "Precise frequency data are not available." It then reports gaseous distention with flatulence or belching and abdominal discomfort such as cramping in about 20% of patients, and notes that excessive dosage can lead to diarrhoea with loss of fluids, hypokalaemia and hypernatraemia. The warnings section carries a single item: a theoretical hazard for patients undergoing electrocautery during proctoscopy or colonoscopy, because accumulation of hydrogen gas in significant concentration in the presence of an electrical spark may result in an explosive reaction — a direct product of the bacterial fermentation the drug relies on. The label records that this complication has not been reported with lactulose, and directs thorough bowel cleansing with a non-fermentable solution beforehand. Contraindication: patients who require a low-galactose diet, because the solution contains less than 1.6 g of galactose per 15 mL. Precautions note that infants may develop hyponatraemia and dehydration, that antibiotics may prevent the degradation the drug depends on, and that non-absorbable antacids may inhibit the intended fall in colonic pH.',
        evidenceSource:
          'Lactulose solution United States prescribing information — Contraindications, Warnings, Precautions and Adverse Reactions (openFDA drug/label record)',
        measuredMetric:
          'Labelled adverse reaction frequency (flatulence, belching or cramping in about 20%) and the electrocautery hydrogen warning',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A sugar the human body cannot open',
        laymanDesc:
          'Lactulose is galactose joined to fructose. No human enzyme can break that bond, so it goes straight through the small intestine unchanged.',
        molecularDetail:
          'The label records that when incubated with extracts of human small intestinal mucosa, lactulose was not hydrolysed over 24 hours and did not inhibit those extracts’ activity on lactose. Urinary excretion is 3% or less and essentially complete within 24 hours; lactulose reaches the colon essentially unchanged. Calculated logP is −5.80.',
        iconName: 'Lock',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Colonic bacteria do what human enzymes cannot',
        laymanDesc:
          'In the large bowel, resident bacteria ferment it. This is the only activation step there is, and it is the reason antibiotics can stop the drug working.',
        molecularDetail:
          'The label states lactulose is metabolised by colonic bacteria with the formation of low molecular weight acids that acidify the colon contents. The Precautions section warns that eliminating certain colonic bacteria with neomycin or other anti-infectives may interfere with the desired degradation of lactulose and prevent acidification, and that non-absorbable antacids may inhibit the intended pH drop.',
        iconName: 'Microscope',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The colon turns acid, and ammonia becomes ammonium',
        laymanDesc:
          'Ammonia can cross from blood into the bowel. In an acid bowel it picks up a proton and becomes electrically charged, and a charged molecule cannot cross back.',
        molecularDetail:
          'The label describes it directly: acidification results in retention of ammonia in the colon as the ammonium ion; since colonic contents are then more acid than blood, ammonia can be expected to migrate from blood into the colon; the acid contents convert NH3 to NH4+, trapping it and preventing its absorption. This is ion trapping, and there is no receptor anywhere in the account.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And the same acids flush it out',
        laymanDesc:
          'The fermentation acids draw water into the bowel, which produces the laxative effect that carries the trapped ammonium away.',
        molecularDetail:
          'The label: "The laxative action of the metabolites of lactulose then expels the trapped ammonium ion from the colon." In the encephalopathy indication the dose is titrated to stool frequency, which is why the label separately forbids other laxatives during the initial phase — loose stools from another source would falsely suggest an adequate lactulose dose had been reached.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer episodes, and — on the 2016 pooling — fewer deaths',
        laymanDesc:
          'Across 38 randomised trials, encephalopathy and death were both less common on the drug than on placebo or nothing.',
        molecularDetail:
          'Cochrane 2016, 38 trials and 1,828 participants: mortality risk ratio 0.59 (95% CI 0.40 to 0.87; 24 trials, 1,487 participants, I²=0%); hepatic encephalopathy 0.58 (0.50 to 0.69; 22 trials, 1,415 participants, I²=32%); serious adverse events of the underlying liver disease 0.47 (0.36 to 0.60). All three graded moderate quality. Secondary prophylaxis in a single open-label trial: overt encephalopathy 19.6% against 46.8% over a median 14 months (p=0.001).',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'With the caveat the reviewers themselves attached',
        laymanDesc:
          'Only eight of the thirty-eight trials were at low risk of bias for deaths, and the formal test of whether enough evidence has accumulated does not pass when only those eight are counted.',
        molecularDetail:
          'Low-risk-of-bias mortality subset: risk ratio 0.63 (95% CI 0.41 to 0.97, 705 participants). Trial Sequential Analysis confirmed the finding at a 30% relative risk reduction across all trials, but not in the low-risk-of-bias subset and not at a 22% relative risk reduction. All trials carried a high risk of bias for outcomes other than mortality. The review’s own wording is that the disaccharides "may be associated with" a beneficial effect.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Cochrane Database Syst Rev 2016;5:CD003044 — non-absorbable disaccharides versus placebo or no intervention',
        phase: 'Systematic review and meta-analysis of 38 randomised clinical trials',
        sampleSize: 1828,
        primaryEndpoint:
          'Mortality, hepatic encephalopathy and serious adverse events in people with cirrhosis, non-absorbable disaccharides against placebo or no intervention',
        endpointMet: true,
        statisticalPValue:
          'Mortality risk ratio 0.59 (95% CI 0.40 to 0.87; 24 trials, 1,487 participants, I²=0%); hepatic encephalopathy 0.58 (0.50 to 0.69; 22 trials, 1,415 participants, I²=32%); serious adverse events 0.47 (0.36 to 0.60). All graded moderate quality',
        unreportedAdverseSignals:
          'Only 8 of 38 trials were at low risk of bias for mortality; all trials were at high risk of bias for every other outcome. Trial Sequential Analysis confirmed the mortality finding across all trials but not in the low-risk-of-bias subset and not at a 22% relative risk reduction. The previous version of this same review found no evidence either to support or refute the intervention.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Sharma 2009 (Gastroenterology 2009;137:885-891)',
        phase: 'Open-label randomised controlled trial, secondary prophylaxis',
        sampleSize: 140,
        primaryEndpoint:
          'Development of overt hepatic encephalopathy in cirrhotic patients who had recovered from an episode, lactulose against placebo',
        endpointMet: true,
        statisticalPValue:
          '12 of 61 (19.6%) against 30 of 64 (46.8%) over a median 14 months, p=0.001',
        unreportedAdverseSignals:
          'Open-label, for an endpoint assessed clinically. Deaths were 5 against 11 (p=0.18) and readmissions for other causes 9 against 6, neither significant. 300 patients were screened to randomise 140.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Cochrane Database Syst Rev 2010;7:CD007570 — lactulose versus polyethylene glycol for chronic constipation',
        phase: 'Systematic review and meta-analysis of 10 randomised controlled trials',
        sampleSize: 868,
        primaryEndpoint:
          'Stool frequency per week, stool form, relief of abdominal pain and need for additional products in chronic constipation',
        endpointMet: false,
        statisticalPValue:
          'Polyethylene glycol superior throughout: stool frequency mean difference 0.65 (95% CI 0.15 to 1.15), stool form 0.89 (0.43 to 1.35), abdominal pain relief odds ratio 2.09 (1.26 to 3.44), additional products not required 4.00 (2.01 to 7.95)',
        unreportedAdverseSignals:
          'Of 868 participants, 546 were children and 322 adults, and the abdominal pain advantage was significant only in the children (odds ratio 2.52, 1.45 to 4.40) and not in adults (0.86, 0.25 to 2.90). The trials ran between 1997 and 2007 across six countries.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Mortality risk ratio 0.59 (95% CI 0.40 to 0.87) across 24 randomised trials and 1,487 participants, with no heterogeneity',
        'Hepatic encephalopathy risk ratio 0.58 (95% CI 0.50 to 0.69) across 22 trials and 1,415 participants',
        'Serious adverse events of the underlying liver disease — liver failure, hepatorenal syndrome, variceal bleeding — risk ratio 0.47 (95% CI 0.36 to 0.60)',
        'Recurrent overt encephalopathy 19.6% against 46.8% over a median 14 months in 140 randomised cirrhotic patients (p=0.001)',
      ],
      unsupportedInferences: [
        'That a 25 to 50% reduction in blood ammonia demonstrates clinical benefit — the label’s own efficacy claim is a surrogate',
        'That clinical response with lactulose is at least as satisfactory as with neomycin, as the label states, when the 2004 pooling of ten trials found the disaccharides inferior to antibiotics (relative risk 1.24, 1.02 to 1.50)',
        'That the 2016 mortality finding is settled — the review’s own Trial Sequential Analysis does not confirm it in the low-risk-of-bias subset or at a 22% relative risk reduction',
        'That its performance in liver disease says anything about its performance as an ordinary laxative, where polyethylene glycol beat it on every pooled endpoint',
      ],
      whatFailedInitially: [
        'The 2004 systematic review of 22 trials concluded there was insufficient evidence to support or refute the drug, and that it should stop being used as a comparator',
        'Within that review, the two high-quality trials found no significant effect on improvement: relative risk 0.92 (95% CI 0.42 to 2.04)',
        'Non-absorbable disaccharides were inferior to antibiotics in the same pooling, both on improvement and on lowering blood ammonia',
        'In chronic constipation, polyethylene glycol was superior on stool frequency, stool form, abdominal pain and need for additional products across ten trials',
      ],
      realWorldOutcome: [
        'Approved 25 March 1976 under NDA 017657 for portal-systemic encephalopathy, and 20 June 1979 for constipation; generic since the 1980s',
        'About two United States cents a millilitre at pharmacy acquisition cost, and on the WHO Model List of Essential Medicines',
        'Remains first-line for hepatic encephalopathy in the major guidelines, on the strength of the 2016 pooling rather than of any single trial',
        'Its label still carries a 1970s comparison against neomycin and an adverse reactions section that opens by saying precise frequency data are not available',
      ],
    },
    deliverySystem: {
      type: 'Oral solution at 10 g per 15 mL, crystalline powder for solution, and rectal enema for the encephalopathy indication',
      description:
        'A sweet syrup, taken by mouth, titrated in the encephalopathy indication to a target stool frequency rather than to a fixed milligram dose. The rectal route exists because the target population includes people in pre-coma and coma who cannot swallow. Nothing has to be absorbed: the label records urinary excretion of 3% or less, complete within 24 hours, and states that lactulose reaches the colon essentially unchanged.',
      safetyProfile:
        'Contraindicated in patients requiring a low-galactose diet, because the solution contains less than 1.6 g galactose and less than 1.2 g lactose per 15 mL; use with caution in diabetics. Gaseous distention with flatulence or belching and abdominal cramping in about 20% of patients, with the label noting that precise frequency data are not available. Excessive dosage causes diarrhoea with fluid loss, hypokalaemia and hypernatraemia — in a population already prone to electrolyte disturbance from liver disease. Infants may develop hyponatraemia and dehydration. Warning: a theoretical explosive hazard from accumulated hydrogen gas during electrocautery at proctoscopy or colonoscopy, never reported in practice, for which the label directs prior bowel cleansing with a non-fermentable solution. Antibiotics may prevent the bacterial degradation the drug depends on; non-absorbable antacids may block the intended fall in colonic pH; other laxatives should be avoided in the initial phase because they mask the titration signal.',
    },
    commonQuestions: [
      {
        q: 'Does lactulose actually work for liver-related confusion?',
        a: 'The current answer is yes, with caveats the reviewers themselves state, and the answer was different twelve years earlier. In 2004 a systematic review of 22 randomised trials in the BMJ concluded there was insufficient evidence to support or refute it, noting that the two high-quality trials found no significant effect (relative risk 0.92, 95% CI 0.42 to 2.04). In 2016 a Cochrane review with 38 trials and 1,828 participants reported a mortality risk ratio of 0.59 (95% CI 0.40 to 0.87) and a hepatic encephalopathy risk ratio of 0.58 (0.50 to 0.69), both graded moderate quality. The caveats: only eight trials were at low risk of bias for mortality, all were at high risk for every other outcome, and the formal sequential test does not confirm the mortality result when restricted to those eight.',
        auditNote:
          'This is what an honest evidence base looks like when it changes its mind. "No evidence of effect" in 2004 was a statement about the trials, not about the drug, and twelve more years of trials moved it.',
      },
      {
        q: 'Why does the dose get increased until I have loose stools?',
        a: 'Because in liver disease the laxative effect is the delivery mechanism, not a side effect. The acids that colonic bacteria make from lactulose trap ammonia as ammonium so it cannot cross back into the blood — and then the same acids draw in water and flush the trapped ammonium out. Without the second half, the first half achieves nothing. That is also why the label says other laxatives should not be used, especially at the start: loose stools from another source would falsely suggest an adequate lactulose dose had been reached, and the dose is being titrated to that signal. In constipation, by contrast, only the laxative half is wanted.',
      },
      {
        q: 'Is it better to be on lactulose or an antibiotic?',
        a: 'The direct comparisons favour the antibiotic on improvement and show no mortality difference. The 2004 review pooled ten trials of non-absorbable disaccharides against antibiotics and found the disaccharides inferior at reducing the risk of no improvement (relative risk 1.24, 95% CI 1.02 to 1.50), while noting it was unclear whether that difference was clinically important; mortality did not differ (0.90, 0.48 to 1.67). It is worth knowing that the lactulose label still says its clinical response is "at least as satisfactory as that resulting from neomycin therapy" — a 1970s sentence the pooled data does not support. There is also a mechanistic interaction: the label warns that antibiotics may eliminate the colonic bacteria lactulose depends on to work at all.',
      },
      {
        q: 'I was given it just for constipation. Is it the best choice for that?',
        a: 'Probably not, on the head-to-head evidence. A Cochrane review of ten randomised trials and 868 participants found polyethylene glycol better than lactulose on stool frequency per week, stool form, relief of abdominal pain and the likelihood of not needing additional products, and concluded that polyethylene glycol should be used in preference to lactulose in chronic constipation. One nuance: most of those participants were children, and the abdominal pain advantage was significant in children and not in adults. Lactulose is also fermented, which is why about a fifth of people get wind, bloating or cramping from it — polyethylene glycol is not fermented and does not.',
      },
      {
        q: 'Why does it say something about explosions?',
        a: 'Because the fermentation that makes the drug work also makes hydrogen. The label carries a warning that a theoretical hazard exists for patients on lactulose who undergo electrocautery during proctoscopy or colonoscopy, since accumulation of hydrogen gas in significant concentration in the presence of an electrical spark may result in an explosive reaction. The label is careful to say this complication has not been reported with lactulose, and directs a thorough bowel cleansing with a non-fermentable solution beforehand. It is a real consequence of the mechanism rather than a curiosity: the same bacterial fermentation that produces the acids produces the gas.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Gluud LL, Vilstrup H, Morgan MY. Non-absorbable disaccharides versus placebo/no intervention and lactulose versus lactitol for the prevention and treatment of hepatic encephalopathy in people with cirrhosis. Cochrane Database Syst Rev 2016;5:CD003044',
        identifier: '10.1002/14651858.CD003044.pub4',
        kind: 'doi',
      },
      {
        label:
          'Als-Nielsen B, Gluud LL, Gluud C. Non-absorbable disaccharides for hepatic encephalopathy: systematic review of randomised trials. BMJ 2004;328(7447):1046',
        identifier: '10.1136/bmj.38048.506134.EE',
        kind: 'doi',
      },
      {
        label:
          'Sharma BC, Sharma P, Agrawal A, Sarin SK. Secondary prophylaxis of hepatic encephalopathy: an open-label randomized controlled trial of lactulose versus placebo. Gastroenterology 2009;137(3):885-891',
        identifier: '10.1053/j.gastro.2009.05.056',
        kind: 'doi',
      },
      {
        label:
          'Lee-Robichaud H, Thomas K, Morgan J, Nelson RL. Lactulose versus polyethylene glycol for chronic constipation. Cochrane Database Syst Rev 2010;7:CD007570',
        identifier: '10.1002/14651858.CD007570.pub2',
        kind: 'doi',
      },
      {
        label:
          'Lactulose solution (Enulose) United States prescribing information — Indications and Usage, Contraindications, Warnings, Precautions, Adverse Reactions, Clinical Pharmacology (openFDA drug/label record)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22lactulose%22+AND+_exists_:clinical_pharmacology&limit=1',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA — CEPHULAC (lactulose) NDA 017657, Sanofi-Aventis US, original approval 25 March 1976; CHRONULAC NDA 017884, 20 June 1979',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=017657',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 11333 — lactulose structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11333',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Dicyclomine — licensed in 1950, on trials at a dose 46% of the people in them could not
  //    stay on, and dropped from a combination product in 1976 for contributing nothing.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'dicyclomine',
    name: 'Dicyclomine',
    tradeName: 'Bentyl',
    sponsor:
      'Allergan (NDA 007409, BENTYL capsules and tablets, original approval 11 May 1950; syrup NDA 007961, 1951; injection NDA 008370, 1952). Long generic, with more than fifty listed products',
    targetGene: 'CHRM3',
    targetProtein:
      'Muscarinic acetylcholine receptors on gastrointestinal smooth muscle, plus a second, non-receptor "musculotropic" action the label describes from animal work — antagonism of bradykinin- and histamine-induced spasm that atropine does not share',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1950,
    indication:
      'Treatment of patients with functional bowel/irritable bowel syndrome, as an antispasmodic and anticholinergic (antimuscarinic) agent',
    patientFriendlyIndication: 'Cramping and spasm in irritable bowel syndrome',
    anatomicalSite:
      'Smooth muscle of the gastrointestinal tract — and, unavoidably, the muscarinic receptors of the salivary glands, the eye, the bladder and the heart',
    conditionContext: {
      conditionExplainer:
        'Irritable bowel syndrome produces pain that comes from the gut wall contracting too hard or in the wrong pattern. An antispasmodic tries to relax that muscle. Acetylcholine is the transmitter that makes smooth muscle contract, so blocking its receptor relaxes the gut. The difficulty is that the same receptor family runs the salivary glands, the pupil, the bladder and the heart rate, and a drug taken by mouth reaches all of them.',
      whyItMatters:
        'Dicyclomine is one of very few drugs licensed in the United States specifically for irritable bowel syndrome, and its licensing evidence is a single set of trials in just over a hundred patients at 160 mg a day — a dose at which 61% of them had anticholinergic side effects and 46% of those had to be reduced to about 90 mg. There is no efficacy data at 90 mg. Almost everyone who takes it now takes a dose the trials never tested.',
      whoTakesThis:
        'Adults with functional bowel or irritable bowel syndrome. The contraindication list is long and includes infants under six months, nursing mothers, glaucoma, myasthenia gravis, obstructive uropathy, gastrointestinal obstruction, severe ulcerative colitis and reflux oesophagitis.',
      clinicalGoals:
        'Less cramping pain. The endpoint in its registration trials was a physician-assessed "favourable clinical response", which is about as soft as a primary endpoint gets, and no outcome beyond symptom relief has been claimed.',
    },
    oneSentenceVerdict:
      'An antimuscarinic antispasmodic licensed in 1950 whose entire efficacy evidence is a registration programme of just over a hundred treated patients showing an 82% favourable response against 55% on placebo at 160 mg a day — a dose at which the same label records anticholinergic side effects in 61%, dizziness in 40% against 5% and blurred vision in 27% against 2%, and at which 46% of those affected had to be reduced to about 90 mg, a dose with no efficacy data behind it at all.',
    laymanHowItWorks:
      'The muscle in the wall of your gut contracts when a chemical messenger called acetylcholine lands on it. Dicyclomine blocks that landing site, so the muscle relaxes and the cramping eases. The catch is that the same landing site is used by the glands that make saliva, by the muscle that focuses your eye, by the bladder and by the heart — and a tablet cannot tell them apart. In the trials that licensed it, four in ten people got dizzy, a third had a dry mouth and a quarter had blurred vision. Nearly half of those affected had to have the dose cut, and nobody has ever shown the cut dose works.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 42,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0758 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 55 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved 11 May 1950 under NDA 007409 as BENTYL capsules and tablets, twelve years before the Kefauver-Harris Amendment first required substantial evidence of effectiveness. Long generic and inexpensive — under eight United States cents a unit at acquisition cost — which is a large part of why it remains one of the few drugs prescribed in the United States with irritable bowel syndrome on the label.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The meta-analysis usually cited to support dicyclomine supports antispasmodics as a class, and the two molecules within that class with consistent evidence — otilonium and hyoscine — are not dicyclomine. Peppermint oil, in the same review, had the largest effect of anything examined. That is an uncomfortable ranking for a prescription-only drug with a nine-item contraindication list.',
      conventionalRx: [
        {
          name: 'Hyoscine butylbromide (Buscopan)',
          class: 'Quaternary ammonium antimuscarinic',
          howItCompares:
            'One of only two antispasmodics the 2008 BMJ meta-analysis identified as showing consistent evidence of efficacy: three trials, 426 patients, relative risk of persistent symptoms 0.63 (95% CI 0.51 to 0.78). Being a quaternary ammonium compound it is poorly absorbed and does not cross into the brain, which is the structural reason it produces less of the dizziness and drowsiness dicyclomine does.',
          typicalCost: 'Not stated here — no verified United States acquisition cost was available',
          prosAndCons:
            'Pros: consistent randomised evidence under its own name; permanently charged, so systemic and central exposure is limited. Cons: not marketed in the United States for this indication; the same peripheral antimuscarinic effects remain.',
        },
        {
          name: 'Otilonium bromide',
          class: 'Quaternary ammonium spasmolytic with calcium channel and tachykinin activity',
          howItCompares:
            'The other antispasmodic with consistent evidence in the same meta-analysis: four trials, 435 patients, relative risk of persistent symptoms 0.55 (95% CI 0.31 to 0.97). Dicyclomine appears among the twenty-two pooled trials but is not one of the two molecules the reviewers singled out.',
          typicalCost: 'Not stated here — no verified United States acquisition cost was available',
          prosAndCons:
            'Pros: the largest point estimate among the antispasmodics in that review; minimal systemic absorption. Cons: not available in the United States, which is why it is not a real alternative for most readers of this page.',
        },
        {
          name: 'Peppermint oil (enteric-coated)',
          class:
            'Menthol-containing smooth muscle relaxant, acting partly through calcium channels',
          howItCompares:
            'In the same 2008 meta-analysis, four trials in 392 patients gave a relative risk of persistent symptoms of 0.43 (95% CI 0.32 to 0.59) — the largest effect of any of the three interventions examined, larger than antispasmodics as a class and larger than fibre.',
          typicalCost:
            'Among the cheapest over-the-counter products in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: the strongest pooled result in the review; available without prescription; no anticholinergic burden. Cons: heartburn if the enteric coating fails or is chewed; the trials are small and short.',
        },
        {
          name: 'Ispaghula (psyllium)',
          class: 'Soluble fibre',
          howItCompares:
            'The one fibre with evidence in the same review: twelve fibre trials in 591 patients gave a relative risk of persistent symptoms of 0.87 (95% CI 0.76 to 1.00), and the effect was limited to ispaghula (0.78, 0.63 to 0.96). Bran did not carry it.',
          typicalCost:
            'Among the cheapest over-the-counter products in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: no anticholinergic effects; useful where constipation predominates. Cons: bloating; the pooled effect is the smallest of the three interventions reviewed and its confidence interval touches 1.00 for fibre overall.',
        },
      ],
      naturalFoods: [
        {
          name: 'Peppermint (Mentha × piperita) as an enteric-coated oil',
          activeCompound: 'Menthol',
          biologicalMechanism:
            'Relaxes gastrointestinal smooth muscle, with calcium channel blockade among the proposed mechanisms. It reaches the same tissue dicyclomine targets without using the muscarinic receptor, which is why it does not produce dry mouth, blurred vision or urinary retention.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: in the 2008 BMJ meta-analysis four randomised trials in 392 patients gave a relative risk of persistent symptoms of 0.43 (95% CI 0.32 to 0.59) against placebo. Those trials are short and small, and enteric coating matters — uncoated peppermint oil releases in the stomach and causes reflux.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Watch for confusion, especially in an older person',
          action:
            'If someone becomes confused, agitated or hallucinates after starting it, stop and seek advice — the label says the symptoms resolve within 12 to 24 hours of stopping.',
          patientImpact:
            'The label states that psychosis and delirium have been reported in patients sensitive to anticholinergic drugs, such as elderly patients or patients with mental illness, and that signs and symptoms resolve within 12 to 24 hours after discontinuation. In the registration trials dizziness was reported by 40% against 5% on placebo and somnolence by 9% against 1%.',
          clinicalPrecaution:
            'Dicyclomine is a tertiary amine and crosses into the brain, unlike the quaternary antispasmodics used in other countries. This is a central adverse effect with a peripheral indication.',
        },
        {
          name: 'It stops you sweating, which matters in the heat',
          action: 'Avoid heat exposure and heavy exertion, particularly in hot weather.',
          patientImpact:
            'The label warns that heat prostration — fever and heat stroke due to decreased sweating — can occur with this drug, and that it should be discontinued and supportive measures started if it does. Sweating is a cholinergic function, so blocking muscarinic receptors blocks it.',
          clinicalPrecaution:
            'The same mechanism produces the dry mouth reported by 33% in the trials and the blurred vision reported by 27%. They are not separate problems; they are one problem in four organs.',
        },
        {
          name: 'Diarrhoea while taking it is not a side effect to wait out',
          action: 'Report new or worsening diarrhoea rather than assuming the bowel is settling.',
          patientImpact:
            'The label warns that diarrhoea may be an early symptom of incomplete intestinal obstruction, especially in patients with an ileostomy or colostomy, and that treatment with dicyclomine in that situation would be inappropriate and possibly fatal. It also cautions against use in Salmonella dysentery because of the risk of toxic megacolon, and in ulcerative colitis where large doses may suppress motility or aggravate toxic megacolon.',
          clinicalPrecaution:
            'A drug whose job is to slow the gut is the wrong drug for a gut that is obstructed. That is why obstructive disease of the gastrointestinal tract and severe ulcerative colitis are both outright contraindications.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCN(CC)CCOC(=O)C1(CCCCC1)C2CCCCC2',
      chemicalFormula: 'C19H35NO2',
      molecularWeight: '309.50 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'The label quantifies potency only against atropine and only in animals: approximately one eighth the milligram potency of atropine at acetylcholine receptor sites in isolated guinea pig ileum in vitro; approximately 1/500 as potent as atropine for mydriatic effect in mice; approximately 1/300 as potent as an antisialagogue in rabbits. It also reports a second, non-antimuscarinic action — dicyclomine antagonised bradykinin- and histamine-induced spasm of isolated guinea pig ileum, which atropine did not, and was equally potent against acetylcholine- and barium chloride-induced intestinal spasm in cats and dogs where atropine was at least 200 times more potent against acetylcholine. The record’s calculated logP is 4.99, and dicyclomine is a tertiary amine, so it is not excluded from the brain. The label states plainly: "The metabolism of dicyclomine was not studied."',
      structureSource: {
        label:
          'PubChem CID 3042 (dicyclomine) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3042',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dic-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Verify the bicyclohexyl quaternary carbon, which is the whole molecule',
          description:
            'Dicyclomine is a bicyclohexyl-1-carboxylate ester of diethylaminoethanol. The two saturated rings meeting at one quaternary carbon are what give it a bulky, non-aromatic shape unlike atropine’s, and are the structural basis of the second mechanism the label describes. An impurity carrying only one ring is a different pharmacology.',
          reagentsAndBuffer:
            'Dicyclomine hydrochloride reference standard, reversed-phase HPLC with UV or charged aerosol detection, 13C NMR to confirm the quaternary carbon, titration for the tertiary amine, Karl Fischer titration',
        },
        {
          id: 'dic-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Esterify bicyclohexyl-1-carboxylic acid with 2-diethylaminoethanol',
          description:
            'The acid half is usually reached by hydrogenating a biphenyl carboxylic acid precursor to the fully saturated bicyclohexyl, then esterified with the aminoalcohol. Incomplete hydrogenation leaves aromatic rings behind, and an aromatic analogue is a materially different molecule at the receptor.',
          dependsOnStepId: 'dic-w1',
          reagentsAndBuffer:
            'Biphenyl-2-carboxylic acid or cyclohexylcyclohexane carboxylic acid, hydrogenation catalyst under pressure, 2-diethylaminoethanol, acid catalyst or acyl chloride route, hydrogen chloride for salt formation',
        },
        {
          id: 'dic-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Limit the free aminoalcohol and the hydrolysed acid',
          description:
            'An aminoester hydrolyses on storage, particularly in the aqueous injection presentation, giving back the carboxylic acid and diethylaminoethanol. Neither fragment is the drug and the aminoalcohol has its own effects, so both need their own limits and a stability-indicating method rather than a simple assay.',
          dependsOnStepId: 'dic-w2',
          reagentsAndBuffer:
            'Recrystallisation from isopropanol or acetone, stability-indicating HPLC resolving the ester from the free acid and aminoalcohol, forced degradation under acid, base, oxidative and thermal stress, pH control of the injectable solution',
        },
        {
          id: 'dic-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Separate the antimuscarinic action from the musculotropic one',
          description:
            'The label claims two mechanisms and distinguishes them with a specific control: dicyclomine antagonised bradykinin- and histamine-induced ileal spasm where atropine did not. That experiment is the design worth repeating, because it is what separates a muscarinic effect from a direct one. Testing against acetylcholine alone cannot distinguish them, and the human selectivity claim rests on the difference.',
          dependsOnStepId: 'dic-w3',
          reagentsAndBuffer:
            'Isolated guinea pig ileum in organ bath, paired challenges with acetylcholine, bradykinin, histamine and barium chloride, atropine as reference antagonist, human CHRM1-CHRM5 binding panel, isometric force transducers',
        },
        {
          id: 'dic-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Report the tolerated dose and the effective dose as the same number, or say they are not',
          description:
            'The single most consequential fact about this drug is that its efficacy figure and its tolerability figure belong to different doses. Any trial of an antispasmodic should prespecify the dose at which efficacy is claimed, report the proportion who remained on it, and report efficacy separately in those who were dose-reduced. The original programme reported 82% response at 160 mg and, elsewhere in the same document, that 46% of those with side effects needed reducing to about 90 mg.',
          reagentsAndBuffer:
            'Prespecified fixed-dose arms rather than titration, per-dose response reporting, discontinuation and dose-reduction accounting, a validated patient-reported IBS symptom instrument rather than physician global impression, placebo control',
          dependsOnStepId: 'dic-w4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dic-a1',
        category: 'measured',
        title: 'The entire efficacy evidence is one line in the label',
        laymanSummary:
          'The clinical studies section of the prescribing information is a single sentence: in trials involving over a hundred patients given the drug, 82% had a favourable response against 55% on placebo, at 160 mg a day.',
        technicalDetails:
          'Section 14 of the dicyclomine label reads in full: "In controlled clinical trials involving over 100 patients who received drug, 82% of patients treated for functional bowel/irritable bowel syndrome with dicyclomine hydrochloride at initial doses of 160 mg daily (40 mg four times daily) demonstrated a favorable clinical response compared with 55% treated with placebo (p<0.05)." That is the whole of it. The endpoint is a physician-assessed favourable clinical response rather than a validated patient-reported instrument, the sample is stated as "over 100" rather than as a number, and the dose is 160 mg daily. A 27-percentage-point difference at p<0.05 in about a hundred patients is a real result and it is also the entirety of what has ever been demonstrated for this molecule in this indication.',
        evidenceSource:
          'Dicyclomine hydrochloride United States prescribing information, section 14 Clinical Studies (openFDA drug/label record)',
        measuredMetric:
          'Favourable clinical response at an initial dose of 160 mg daily against placebo in over 100 treated patients',
        auditFlag: 'verified',
      },
      {
        id: 'dic-a2',
        category: 'failed',
        title: 'The dose that worked is not the dose people take',
        laymanSummary:
          'At 160 mg a day, 61% had anticholinergic side effects, four in ten were dizzy and a quarter had blurred vision. Nearly half of those affected had to be reduced to about 90 mg — and there is no efficacy data at 90 mg.',
        technicalDetails:
          'From section 6.1 of the same label, describing the same trials: most side effects were typically anticholinergic and were reported by 61% of patients. Against placebo: dizziness 40% against 5%, dry mouth 33% against 5%, blurred vision 27% against 2%, nausea 14% against 6%, somnolence 9% against 1%, asthenia 7% against 1%, nervousness 6% against 2%. Nine per cent discontinued because of side effects against 2% on placebo. In 41% of patients with side effects, the effects disappeared or were tolerated at 160 mg without reduction; in 46% a dose reduction from 160 mg to an average daily dose of 90 mg was required, and those patients then continued to experience a favourable clinical response. That last clause is an observation within an uncontrolled subgroup of dose-reduced patients, not a placebo-controlled demonstration of efficacy at 90 mg. So the label contains a controlled efficacy result at a dose most people cannot stay on, and an uncontrolled impression of efficacy at the dose most people end up taking.',
        evidenceSource:
          'Dicyclomine hydrochloride United States prescribing information, section 6.1 Clinical Trials Experience, Table 1 (openFDA drug/label record)',
        inferredClaim:
          'That the 82%-against-55% result at 160 mg daily transfers to the roughly 90 mg daily most patients are reduced to — asserted only through an uncontrolled subgroup observation within the same trials',
        measuredMetric:
          'Anticholinergic adverse reaction rates at 160 mg daily and the proportion requiring dose reduction',
        auditFlag: 'contested',
      },
      {
        id: 'dic-a3',
        category: 'conclusion_shift',
        title: 'It was removed from a combination product in 1976 for adding nothing',
        laymanSummary:
          'Bendectin, the standard treatment for morning sickness for two decades, originally contained three ingredients. Dicyclomine was one of them. It was dropped in 1976 after trials showed it was not contributing.',
        technicalDetails:
          'Bendectin was first marketed in 1956 as a combination of dicyclomine hydrochloride, doxylamine succinate and pyridoxine hydrochloride, and in 1976 the manufacturer removed dicyclomine from the formulation. A 1981 JAMA analysis of the Metropolitan Atlanta Congenital Defects Program stratified its data explicitly "to reflect the 1976 change in formulation when one of the three ingredients was removed", confirming both the date and that a three-ingredient product became a two-ingredient one. The trial underlying that decision was an eight-arm, double-blind, multicentre, randomised, placebo-controlled study across 14 United States clinics that enrolled 2,308 women in the first 12 weeks of pregnancy — and it was never published. It was reconstructed and released in 2017 under the Restoring Invisible and Abandoned Trials initiative. Of those randomised, 1,599 (69%) were analysed. Against a placebo response of 57% on physician-evaluated moderate or excellent improvement, the absolute differences were: doxylamine alone 20 percentage points (95% CI 10 to 29); dicyclomine alone 4 points (95% CI −6 to 14); the three-drug combination containing dicyclomine 14 points (4 to 24) against 21 points (11 to 30) for doxylamine plus pyridoxine without it. The RIAT authors state that because of high attrition, absent prespecified outcomes and data integrity problems, the trial should not be used to support the efficacy of any of the three drugs — which cuts against dicyclomine and against the other two equally.',
        evidenceSource:
          'Zhang R, Persaud N. 8-Way Randomized Controlled Trial of Doxylamine, Pyridoxine and Dicyclomine for Nausea and Vomiting during Pregnancy: Restoration of Unpublished Information. PLoS One 2017;12(1):e0167609; Cordero JF, Oakley GP, Greenberg F, James LM. Is Bendectin a teratogen? JAMA 1981;245(22):2307-2310',
        doi: '10.1371/journal.pone.0167609',
        inferredClaim:
          'That every component of a combination product is contributing — dicyclomine was the component removed in 1976, and the trial that informed that decision stayed unpublished for four decades',
        auditFlag: 'contested',
      },
      {
        id: 'dic-a4',
        category: 'inferred',
        title: 'The class evidence is carried by two molecules, and neither is this one',
        laymanSummary:
          'The meta-analysis cited for antispasmodics in irritable bowel syndrome found the class works. When the reviewers looked at which drugs the effect came from, they named otilonium and hyoscine. Dicyclomine was not one of them.',
        technicalDetails:
          'The 2008 BMJ systematic review and meta-analysis pooled 22 randomised trials of antispasmodics against placebo in 1,778 patients, giving a relative risk of persistent symptoms of 0.68 (95% CI 0.57 to 0.81). The reviewers then noted which agents carried it: "Various antispasmodics were studied, but otilonium (four trials, 435 patients, relative risk of persistent symptoms 0.55, 0.31 to 0.97) and hyoscine (three trials, 426 patients, 0.63, 0.51 to 0.78) showed consistent evidence of efficacy." Neither is dicyclomine, and neither is marketed in the United States for this indication. In the same review, peppermint oil in four trials and 392 patients gave 0.43 (0.32 to 0.59) — a larger effect than the antispasmodic class — and fibre gave 0.87 (0.76 to 1.00), limited to ispaghula at 0.78 (0.63 to 0.96). A class-level relative risk is not a molecule-level result, and citing the class figure for dicyclomine borrows evidence generated by two drugs an American reader cannot obtain.',
        evidenceSource:
          'Ford AC, Talley NJ, Spiegel BM, et al. Effect of fibre, antispasmodics, and peppermint oil in the treatment of irritable bowel syndrome: systematic review and meta-analysis. BMJ 2008;337:a2313',
        doi: '10.1136/bmj.a2313',
        inferredClaim:
          'That the pooled antispasmodic effect of 0.68 applies to dicyclomine specifically — when the reviewers identified consistent evidence only for otilonium and hyoscine',
        auditFlag: 'caution',
      },
      {
        id: 'dic-a5',
        category: 'failed',
        title: 'The animal selectivity did not hold in people',
        laymanSummary:
          'The label’s pharmacology section argues the drug is far weaker than atropine on the eye and the salivary glands — five hundred and three hundred times weaker respectively, in animals. In the human trials a third had a dry mouth and a quarter had blurred vision.',
        technicalDetails:
          'Section 12.1 reports that dicyclomine has approximately one eighth the milligram potency of atropine at acetylcholine receptor sites in isolated guinea pig ileum, but approximately 1/500 the mydriatic potency of atropine in mice and 1/300 the antisialagogue potency in rabbits. Read together those figures are a selectivity argument: relatively strong on gut, relatively weak on eye and salivary gland. Section 6.1, reporting the human trials at the licensed dose, records dry mouth in 33% against 5% on placebo and blurred vision in 27% against 2%. Section 12.2 acknowledges directly that the drug can inhibit the secretion of saliva and sweat, cause drowsiness, dilate the pupils, increase heart rate and depress motor function. The animal ratios are real measurements in animals; the selectivity they imply is not what the human adverse-event table shows.',
        evidenceSource:
          'Dicyclomine hydrochloride United States prescribing information, sections 12.1, 12.2 and 6.1 Table 1 (openFDA drug/label record)',
        inferredClaim:
          'That the 1/500 mydriatic and 1/300 antisialagogue potency ratios against atropine in mice and rabbits predict gut-selective action in humans',
        measuredMetric:
          'Animal potency ratios against atropine compared with human anticholinergic adverse event rates at the licensed dose',
        auditFlag: 'contested',
      },
      {
        id: 'dic-a6',
        category: 'failed',
        title: 'Nine contraindications, including infants and nursing mothers',
        laymanSummary:
          'For a drug given for stomach cramps, the list of people who must not take it is unusually long, and two entries on it are babies under six months and women who are breastfeeding.',
        technicalDetails:
          'Contraindications: infants less than 6 months of age; nursing mothers; unstable cardiovascular status in acute haemorrhage; myasthenia gravis; glaucoma; obstructive uropathy; obstructive disease of the gastrointestinal tract; severe ulcerative colitis; reflux oesophagitis. Warnings and precautions add: worsening of cardiovascular conditions, with care needed in tachyarrhythmia, thyrotoxicosis, congestive heart failure, cardiac surgery, coronary heart disease where ischaemia and infarction may be worsened, and hypertension; heat prostration with fever and heat stroke due to decreased sweating; psychosis and delirium in patients sensitive to anticholinergic drugs, resolving within 12 to 24 hours of discontinuation; muscular weakness and paralysis on overdose in myasthenia gravis; diarrhoea as an early symptom of incomplete intestinal obstruction, where treatment would be inappropriate and possibly fatal; toxic megacolon risk in Salmonella dysentery and in ulcerative colitis; urinary retention in prostatic hypertrophy; caution in hepatic and renal disease and in the elderly. Two of those entries — reflux oesophagitis and gastrointestinal obstruction — are gastrointestinal conditions, in a gastrointestinal drug, and follow directly from slowing the gut.',
        evidenceSource:
          'Dicyclomine hydrochloride United States prescribing information, sections 4 Contraindications and 5 Warnings and Precautions (openFDA drug/label record)',
        measuredMetric:
          'Contraindication and warning set carried by a symptomatic antispasmodic for a benign functional disorder',
        auditFlag: 'caution',
      },
      {
        id: 'dic-a7',
        category: 'inferred',
        title: 'Approved in 1950, and its metabolism was never studied',
        laymanSummary:
          'Bentyl was approved twelve years before the FDA was required to ask whether a drug worked. The label still says, in the pharmacokinetics section, that the metabolism of dicyclomine was not studied.',
        technicalDetails:
          'NDA 007409 was originally approved on 11 May 1950, with the syrup in 1951 and the injection in 1952 — all before the Kefauver-Harris Amendment of 1962 first required substantial evidence of effectiveness. Section 12.3 states: dicyclomine is rapidly absorbed after oral administration, peaking at 60 to 90 minutes; mean volume of distribution for a 20 mg oral dose is approximately 3.65 L/kg; "The metabolism of dicyclomine was not studied"; the principal route of excretion is urine (79.5% of the dose) with 8.4% in faeces; mean plasma elimination half-life was approximately 1.8 hours in one study measuring concentrations for 9 hours, with subsequent studies following concentrations for up to 24 hours showing a secondary elimination phase with a somewhat longer half-life. A drug whose metabolic fate is unstudied cannot have a documented drug-interaction profile derived from it, which for a centrally penetrant anticholinergic given to older people is not a small gap.',
        evidenceSource:
          'Dicyclomine hydrochloride United States prescribing information, section 12.3 Pharmacokinetics (openFDA drug/label record); Drugs@FDA record for BENTYL, NDA 007409, original approval 11 May 1950',
        inferredClaim:
          'That a drug in continuous use since 1950 has an established pharmacological dossier — its own label states its metabolism was not studied and gives a half-life that later work found incomplete',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed or injected, and absorbed fast',
        laymanDesc:
          'It reaches its peak in the blood within an hour and a half of a capsule, and it spreads widely through the body’s tissues rather than staying in the gut.',
        molecularDetail:
          'Rapidly absorbed after oral administration with peak values within 60 to 90 minutes. Mean volume of distribution for a 20 mg oral dose is approximately 3.65 L/kg, which the label reads as extensive tissue distribution. Excretion is principally urinary (79.5% of the dose), with 8.4% in faeces. Mean plasma elimination half-life about 1.8 hours in one study, with a longer secondary phase seen when sampling ran to 24 hours.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the gut wall — and everywhere else',
        laymanDesc:
          'Because it is widely distributed and can cross into the brain, it arrives at every muscarinic receptor in the body, not only the ones in the bowel.',
        molecularDetail:
          'Dicyclomine is a tertiary amine, unlike the quaternary ammonium antispasmodics such as hyoscine butylbromide and otilonium bromide that are permanently charged and largely excluded from the central nervous system. Calculated logP 4.99. This is the structural reason the label warns about psychosis and delirium and the trials recorded 40% dizziness and 9% somnolence.',
        iconName: 'Radio',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The acetylcholine receptor on smooth muscle is blocked',
        laymanDesc:
          'Acetylcholine is the signal that tells gut muscle to contract. With the receptor occupied, the signal does not land and the muscle relaxes.',
        molecularDetail:
          'Antimuscarinic antagonism at acetylcholine receptor sites, with approximately one eighth the milligram potency of atropine in isolated guinea pig ileum in vitro. Muscarinic M3 receptors are the principal subtype mediating gastrointestinal smooth muscle contraction; the label does not specify subtype selectivity and none is claimed.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'A second, non-receptor effect the label also claims',
        laymanDesc:
          'Animal experiments suggest it also relaxes the muscle directly, by a route that has nothing to do with acetylcholine — which is what supposedly distinguishes it from atropine.',
        molecularDetail:
          'The label describes a direct musculotropic effect evidenced by antagonism of bradykinin- and histamine-induced spasms of isolated guinea pig ileum, which atropine did not affect. In cats and dogs dicyclomine was equally potent against acetylcholine- and barium chloride-induced intestinal spasm, while atropine was at least 200 times more potent against acetylcholine than against barium chloride. All of that evidence is from animals; the label says so.',
        iconName: 'GitBranch',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Cramping eases, in 82% at 160 mg a day',
        laymanDesc:
          'In the trials that licensed it, 82% had a favourable response at 160 mg daily against 55% on placebo.',
        molecularDetail:
          'Section 14: over 100 patients treated at initial doses of 160 mg daily (40 mg four times daily), 82% favourable clinical response against 55% on placebo, p<0.05. Physician-assessed global response; the sample is stated as "over 100" rather than as a count.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And at that dose, 61% have anticholinergic effects',
        laymanDesc:
          'Dizziness in four in ten, dry mouth in a third, blurred vision in a quarter. Nine per cent stopped altogether and 46% of those affected had to halve the dose — to a dose never tested against placebo.',
        molecularDetail:
          'Section 6.1: anticholinergic side effects in 61%; dizziness 40% against 5%, dry mouth 33% against 5%, blurred vision 27% against 2%, nausea 14% against 6%, somnolence 9% against 1%, asthenia 7% against 1%, nervousness 6% against 2%. Discontinuation 9% against 2%. Dose reduction from 160 mg to an average 90 mg daily required in 46% of those with side effects.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Registration programme for functional bowel/irritable bowel syndrome (label section 14)',
        phase: 'Controlled clinical trials, placebo-controlled',
        sampleSize: 100,
        primaryEndpoint:
          'Favourable clinical response in functional bowel/irritable bowel syndrome at an initial dose of 160 mg daily (40 mg four times daily)',
        endpointMet: true,
        statisticalPValue: '82% against 55% on placebo, p<0.05',
        unreportedAdverseSignals:
          'The label states "over 100 patients who received drug" without giving a count. At the same dose, 61% had anticholinergic side effects, 9% discontinued against 2% on placebo, and 46% of those with side effects required reduction to an average 90 mg daily — a dose with no placebo-controlled efficacy data. The endpoint is a physician global impression, not a validated patient-reported instrument.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          '8-way Bendectin study (PLoS One 2017;12(1):e0167609, RIAT restoration of a 1970s trial)',
        phase:
          'Double-blind, multicentre, randomised, placebo-controlled, eight arms, 14 US clinics',
        sampleSize: 2308,
        primaryEndpoint:
          'Physician-evaluated overall efficacy, hours of nausea and frequency of vomiting over 7 nights in the first 12 weeks of pregnancy, across eight combinations of doxylamine, pyridoxine and dicyclomine',
        endpointMet: false,
        statisticalPValue:
          'Against a placebo rate of 57% evaluated moderate or excellent: dicyclomine alone 4 percentage points (95% CI −6 to 14); doxylamine alone 20 (95% CI 10 to 29); the three-drug combination containing dicyclomine 14 (4 to 24) against 21 (11 to 30) for doxylamine plus pyridoxine',
        unreportedAdverseSignals:
          'Never published. 1,599 of 2,308 randomised (69%) were analysed. The RIAT authors conclude it should not be used to support the efficacy of any of the three drugs, citing high attrition in a 7-day trial, no prespecified outcomes or analyses, and exclusion of some data for questionable integrity. Dicyclomine was removed from the Bendectin formulation in 1976.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Ford 2008 (BMJ 2008;337:a2313) — antispasmodics in irritable bowel syndrome',
        phase: 'Systematic review and meta-analysis of 22 randomised controlled trials',
        sampleSize: 1778,
        primaryEndpoint:
          'Relative risk of persistent irritable bowel syndrome symptoms, antispasmodics as a class against placebo',
        endpointMet: true,
        statisticalPValue: 'Relative risk of persistent symptoms 0.68 (95% CI 0.57 to 0.81)',
        unreportedAdverseSignals:
          'Consistent evidence of efficacy was found only for otilonium (four trials, 435 patients, 0.55, 0.31 to 0.97) and hyoscine (three trials, 426 patients, 0.63, 0.51 to 0.78) — neither of which is dicyclomine and neither of which is marketed in the United States for this indication. Peppermint oil, in the same review, gave 0.43 (0.32 to 0.59), a larger effect than the antispasmodic class.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Favourable clinical response 82% against 55% on placebo at 160 mg daily in over 100 treated patients (p<0.05)',
        'Anticholinergic side effects in 61% at that dose: dizziness 40% against 5%, dry mouth 33% against 5%, blurred vision 27% against 2%',
        'Discontinuation for side effects 9% against 2%, and dose reduction from 160 mg to an average 90 mg required in 46% of those affected',
        'In the restored 8-way Bendectin trial, dicyclomine alone gave a 4-percentage-point absolute difference over placebo (95% CI −6 to 14) against doxylamine’s 20 (10 to 29)',
      ],
      unsupportedInferences: [
        'That the efficacy shown at 160 mg daily holds at the roughly 90 mg most patients are reduced to — supported only by an uncontrolled subgroup observation in the same trials',
        'That the pooled antispasmodic relative risk of 0.68 applies to dicyclomine, when the reviewers identified consistent evidence only for otilonium and hyoscine',
        'That the animal potency ratios — 1/500 mydriatic, 1/300 antisialagogue against atropine — predict gut-selective action, when a third of trial patients had dry mouth and a quarter blurred vision',
        'That a drug in use since 1950 has a settled pharmacological profile, when its own label states its metabolism was not studied',
      ],
      whatFailedInitially: [
        'Dicyclomine was removed from the three-ingredient Bendectin formulation in 1976 for not contributing to its effect',
        'The trial informing that removal was never published and had to be restored under the RIAT initiative in 2017; its authors say it supports the efficacy of none of the three drugs',
        'Nine per cent of patients in the registration trials could not tolerate the licensed dose at all, and 46% of those with side effects had to be reduced below it',
        'Both of the antispasmodics with consistent evidence in the 2008 meta-analysis are molecules other than this one, and neither is available in the United States for irritable bowel syndrome',
      ],
      realWorldOutcome: [
        'Approved 11 May 1950 under NDA 007409, twelve years before proof of effectiveness became a legal requirement',
        'Under eight United States cents a unit at pharmacy acquisition cost, across more than fifty listed generic products',
        'One of very few drugs in the United States carrying irritable bowel syndrome on the label, which is a large part of why it is still prescribed',
        'Carries nine contraindications including infants under six months and nursing mothers, and warnings covering delirium, heat prostration and toxic megacolon',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule and tablet, oral syrup, and intramuscular injection (the injection is not for intravenous use)',
      description:
        'Rapidly absorbed by mouth with peak concentrations at 60 to 90 minutes and a mean volume of distribution of about 3.65 L/kg. Elimination is mainly urinary at 79.5% of the dose with 8.4% in faeces; mean plasma half-life about 1.8 hours in one study, with a longer secondary phase on 24-hour sampling. The label states outright that the metabolism of dicyclomine was not studied.',
      safetyProfile:
        'Contraindicated in infants under 6 months, nursing mothers, unstable cardiovascular status in acute haemorrhage, myasthenia gravis, glaucoma, obstructive uropathy, obstructive gastrointestinal disease, severe ulcerative colitis and reflux oesophagitis. Warnings include heat prostration from decreased sweating; psychosis and delirium in anticholinergic-sensitive patients, resolving within 12 to 24 hours of stopping; worsening of tachyarrhythmia, coronary ischaemia and hypertension; diarrhoea as a possible early sign of incomplete intestinal obstruction, in which treatment would be inappropriate and possibly fatal; toxic megacolon risk in Salmonella dysentery and ulcerative colitis; urinary retention in prostatic hypertrophy; and caution in hepatic and renal disease and in the elderly. Most common adverse reactions above 5%: dizziness, dry mouth, blurred vision, nausea, somnolence, asthenia and nervousness.',
    },
    commonQuestions: [
      {
        q: 'How strong is the evidence that dicyclomine works?',
        a: 'Thinner than its fifty years of use suggests. The clinical studies section of the label is one sentence: in controlled trials involving over 100 patients who received the drug, 82% had a favourable clinical response against 55% on placebo, at 160 mg a day, p<0.05. That is a real difference and it is the whole evidence base under this molecule’s own name. The endpoint was a doctor’s global judgement rather than a validated symptom questionnaire, and the sample is described as "over 100" rather than counted. The meta-analysis usually cited alongside it supports antispasmodics as a class, and the two drugs the reviewers said showed consistent evidence were otilonium and hyoscine, not this one.',
        auditNote:
          'A class result is not a molecule result. When a review names which agents carried the effect and yours is not among them, the honest description is that your drug was included, not that your drug was shown to work.',
      },
      {
        q: 'Why was my dose reduced, and does the lower dose still work?',
        a: 'It was probably reduced because of side effects, and the honest answer to the second half is that nobody knows. The label’s own trial data say 61% of patients at 160 mg daily had anticholinergic side effects — dizziness in 40%, dry mouth in 33%, blurred vision in 27% — that 9% stopped the drug entirely, and that 46% of those with side effects needed a reduction from 160 mg to an average of about 90 mg a day. The label adds that those reduced patients "then continued to experience a favourable clinical response", but that is an observation in a self-selected subgroup, not a placebo-controlled result. The 82%-against-55% figure belongs to 160 mg and to nothing else.',
      },
      {
        q: 'Why do I get a dry mouth and blurry vision from a stomach drug?',
        a: 'Because the receptor it blocks in your gut is the same receptor your salivary glands, the focusing muscle of your eye, your bladder and your heart use. A tablet reaches all of them. The label’s pharmacology section argues that dicyclomine is far less potent than atropine at the eye and the salivary glands — about 1/500 and 1/300 respectively — but those ratios were measured in mice and rabbits, and in the human trials a third of patients had a dry mouth and a quarter had blurred vision. The same mechanism also stops you sweating, which is why the label warns about heat stroke, and dicyclomine crosses into the brain, which is why it warns about confusion and delirium in older patients.',
      },
      {
        q: 'Is there anything unusual in its history?',
        a: 'One thing in particular. Bendectin, the drug given to millions of pregnant women for morning sickness from 1956, originally contained three ingredients: doxylamine, pyridoxine and dicyclomine. In 1976 dicyclomine was removed, because trials showed it was not contributing to the effect. The trial behind that decision — an eight-arm, double-blind, placebo-controlled study across 14 clinics that enrolled 2,308 women — was never published, and was reconstructed and released in 2017 under the Restoring Invisible and Abandoned Trials initiative. In it, dicyclomine on its own beat placebo by 4 percentage points with a confidence interval running from −6 to 14, while doxylamine on its own beat placebo by 20 points. The people who restored the trial are careful to say that its high dropout rate and data problems mean it should not be used to support any of the three drugs.',
      },
      {
        q: 'Who should definitely not take it?',
        a: 'The label’s contraindication list has nine entries: infants under six months of age, nursing mothers, unstable cardiovascular status in acute haemorrhage, myasthenia gravis, glaucoma, obstructive uropathy, obstructive disease of the gastrointestinal tract, severe ulcerative colitis and reflux oesophagitis. Two of those are gut conditions, which is worth understanding rather than memorising: a drug that slows the bowel is the wrong drug for a bowel that is already obstructed, and the label warns that diarrhoea can be an early sign of incomplete obstruction in which treatment with dicyclomine would be inappropriate and possibly fatal. Beyond the contraindications, the label directs caution in the elderly, in prostatic enlargement, in heart disease, in liver and kidney disease and in hot weather.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Dicyclomine hydrochloride United States prescribing information — Indications 1, Contraindications 4, Warnings and Precautions 5, Adverse Reactions 6.1 Table 1, Clinical Pharmacology 12.1-12.3, Clinical Studies 14 (openFDA drug/label record)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22dicyclomine+hydrochloride%22+AND+_exists_:clinical_studies&limit=1',
        kind: 'regulatory',
      },
      {
        label:
          'Ford AC, Talley NJ, Spiegel BM, Foxx-Orenstein AE, Schiller L, Quigley EM, Moayyedi P. Effect of fibre, antispasmodics, and peppermint oil in the treatment of irritable bowel syndrome: systematic review and meta-analysis. BMJ 2008;337:a2313',
        identifier: '10.1136/bmj.a2313',
        kind: 'doi',
      },
      {
        label:
          'Zhang R, Persaud N. 8-Way Randomized Controlled Trial of Doxylamine, Pyridoxine and Dicyclomine for Nausea and Vomiting during Pregnancy: Restoration of Unpublished Information. PLoS One 2017;12(1):e0167609',
        identifier: '10.1371/journal.pone.0167609',
        kind: 'doi',
      },
      {
        label:
          'Cordero JF, Oakley GP, Greenberg F, James LM. Is Bendectin a teratogen? JAMA 1981;245(22):2307-2310 — data stratified to reflect the 1976 change in formulation when one of the three ingredients was removed',
        identifier: '7230458',
        kind: 'pmid',
      },
      {
        label:
          'Drugs@FDA — BENTYL (dicyclomine hydrochloride) capsules and tablets, NDA 007409, Allergan, original approval 11 May 1950; syrup NDA 007961 (1951); injection NDA 008370 (1952)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=007409',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3042 — dicyclomine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3042',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Simethicone — the only antiflatulent the FDA recognises, which failed the one randomised
  //    trial in infant colic, and whose best evidence is for an indication it is not sold for.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'simethicone',
    name: 'Simethicone',
    tradeName: 'Gas-X / Mylicon / Phazyme; with loperamide, Imodium Multi-Symptom Relief',
    sponsor:
      'No innovator. Simethicone is the sole active ingredient recognised in the FDA’s over-the-counter antiflatulent monograph at 21 CFR 332.10 and is sold by dozens of manufacturers. The loperamide-simethicone combination IMODIUM MULTI-SYMPTOM RELIEF is NDA 020606, J&J Consumer, original approval 26 June 1997, with NDA 021140 following on 30 November 2000',
    targetGene: 'None identified',
    targetProtein:
      'None. Simethicone binds nothing, is not absorbed and has no pharmacological target — it lowers the surface tension of gas bubbles in the gut so they coalesce and can be passed',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1997,
    indication:
      'Antiflatulent. The permitted monograph indications at 21 CFR 332.30 are "alleviates or relieves the symptoms referred to as gas", or "alleviates or relieves bloating, pressure, fullness or stuffed feeling commonly referred to as gas". Maximum over-the-counter daily dose 500 mg, with no dosage limitation in professional labelling',
    patientFriendlyIndication: 'Bloating, pressure and fullness commonly referred to as gas',
    anatomicalSite:
      'The gas-liquid interface inside the stomach and intestine — a physical location rather than a biological one',
    conditionContext: {
      conditionExplainer:
        'Swallowed air and gas produced by bacterial fermentation form foam in the gut: many small bubbles held apart by surface tension in the surrounding liquid. Foam is harder to move and harder to pass than a single large pocket of gas. Simethicone is an antifoaming agent — the same technology used industrially to stop tanks frothing — and it collapses the foam by lowering the surface tension of the bubble films so they merge.',
      whyItMatters:
        'The mechanism is real, uncontroversial physical chemistry, and it is the only mechanism on offer, because simethicone is not absorbed and does not bind anything. The question is whether collapsing foam relieves the symptom people take it for. The randomised evidence for that is essentially one negative trial in infants, while the strongest evidence simethicone has anywhere is for an indication it is not sold for: seeing the bowel wall clearly during endoscopy.',
      whoTakesThis:
        'Anyone who feels bloated, at any age — it is one of the few drugs given to newborns. It is also given routinely before colonoscopy and gastroscopy to clear bubbles, and combined with loperamide in an over-the-counter antidiarrhoeal.',
      clinicalGoals:
        'Relief of a sensation. The monograph indication is written in terms of symptoms — "bloating, pressure, fullness or stuffed feeling" — not in terms of any measured quantity of gas, and no trial of it has measured intestinal gas volume as an endpoint.',
    },
    oneSentenceVerdict:
      'An inert, unabsorbed silicone antifoaming agent, the only active ingredient the FDA recognises for gas, which in the one randomised placebo-controlled trial in infant colic was no better than placebo — 28% of infants responded only to simethicone, 37% only to placebo — while its best-evidenced use is one it is not labelled for: in a network meta-analysis of 40 trials and 13,064 patients, polyethylene glycol plus ascorbic acid plus simethicone ranked first for bowel cleansing (odds ratio 14.27, 95% credible interval 2.68 to 127.87).',
    laymanHowItWorks:
      'Gas in the gut is usually not one big bubble but foam — hundreds of small bubbles held apart by the surface tension of the fluid around them. Simethicone is a silicone oil, the same kind of antifoaming agent used to stop industrial tanks frothing over. It spreads across the surface of those bubble films, weakens them, and lets the small bubbles merge into larger ones that are easier to move and pass. Nothing is absorbed and nothing is blocked or stimulated: it does not change how much gas your gut produces, only what form that gas is in.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 45,
    substitutes: {
      summary:
        'There is no second antiflatulent — 21 CFR 332.10 recognises simethicone and nothing else. So the alternatives are either drugs for a different cause of the same sensation, or nothing. That is worth stating plainly: the reason simethicone has no competitor is regulatory, not because it beat one.',
      conventionalRx: [
        {
          name: 'Alpha-galactosidase (Beano)',
          class: 'Enzyme supplement',
          howItCompares:
            'Attacks the problem one step earlier by hydrolysing the oligosaccharides in beans and cruciferous vegetables before colonic bacteria can ferment them, so less gas is produced in the first place. Simethicone changes the form of gas already present; this changes the amount. It is sold as a dietary supplement rather than under a drug monograph.',
          typicalCost:
            'Among the cheapest over-the-counter products in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: acts on production rather than presentation; must be taken with the meal to work at all. Cons: regulated as a supplement, so no monograph efficacy standard applies to it either; useless for swallowed air.',
        },
        {
          name: 'Loperamide (Imodium)',
          class: 'Peripherally acting opioid receptor agonist, antidiarrhoeal',
          howItCompares:
            'The partner in the combination product. In the four-arm randomised trial of 493 adults with acute diarrhoea and gas-related discomfort, the loperamide-simethicone combination beat loperamide alone, simethicone alone and placebo on time to last unformed stool and time to complete relief of gas-related discomfort (p<0.001), and on every patient-assessed end-of-study outcome (p≤0.01). Simethicone alone was one of the arms it beat.',
          typicalCost:
            'Among the cheapest over-the-counter products in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: the only randomised evidence putting simethicone into a winning regimen. Cons: the trial was designed and run by the medical department of the company that sells the combination, which is disclosed in the author affiliations; loperamide has its own cardiac risks in overdose.',
        },
        {
          name: 'Peppermint oil (enteric-coated)',
          class: 'Smooth muscle relaxant',
          howItCompares:
            'Addresses bloating and abdominal discomfort through smooth muscle relaxation rather than through the physical state of the gas. In a BMJ meta-analysis of four randomised trials in 392 patients with irritable bowel syndrome it gave a relative risk of persistent symptoms of 0.43 (95% CI 0.32 to 0.59) — a measured effect on a symptom set that overlaps substantially with what simethicone is bought for.',
          typicalCost:
            'Among the cheapest over-the-counter products in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: a real randomised effect size on abdominal symptoms; over the counter. Cons: reflux if the enteric coating is chewed or fails; the trials are small; it is not an antiflatulent and does nothing to the gas itself.',
        },
      ],
      naturalFoods: [
        {
          name: 'Removing the fermentable substrate — a low-FODMAP approach',
          activeCompound:
            'Reduction in fermentable oligosaccharides, disaccharides, monosaccharides and polyols',
          biologicalMechanism:
            'Colonic gas is produced by bacteria fermenting carbohydrates that reach the colon undigested. Reducing that substrate reduces the gas at source, which is the one lever simethicone does not pull — it changes the form of gas that already exists and not the amount.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice, and dietary restriction is not a self-directed exercise. For scale only: the randomised trials of low-FODMAP diets measure symptom scores in irritable bowel syndrome over weeks, are difficult to blind, and are not trials of bloating alone. Restriction also reduces intake of fermentable fibres that feed the colonic microbiota, which is why the published protocols include a structured reintroduction phase.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'It cannot be absorbed, which is the whole safety story',
          action: 'Take it whenever, with or without food; it is not affected by other medicines.',
          patientImpact:
            'Simethicone is a silicone polymer that passes through the gut unchanged and is excreted in the faeces. There is no systemic exposure, no metabolism, no drug interaction of consequence and no dose limit in professional labelling — the 500 mg daily ceiling at 21 CFR 332.10 applies to over-the-counter labelling only.',
          clinicalPrecaution:
            'Inertness is why it is given to newborns and why its safety record is clean. It is also why the only mechanism available to it is physical, and why an effect on symptoms cannot be assumed from an effect on bubbles.',
        },
        {
          name: 'Bloating that is new, persistent or painful is not a gas problem until it is checked',
          action:
            'Do not treat unexplained new abdominal swelling, weight loss or altered bowel habit with an antiflatulent.',
          patientImpact:
            'The monograph indication is for "the symptoms referred to as gas" — a sensation. The sensation of abdominal bloating and distension is produced by ovarian disease, ascites, obstruction and coeliac disease as readily as by intestinal gas, and none of those is helped by collapsing foam.',
          clinicalPrecaution:
            'This is the practical hazard of a very safe drug for a very non-specific symptom: not that it harms, but that it is available, cheap and reassuring enough to postpone the question of what is causing the symptom.',
        },
        {
          name: 'If you are having an endoscopy, the unit may have a policy about it',
          action:
            'Do not be surprised if a scoping unit gives simethicone through the scope rather than by mouth, or restricts its use.',
          patientImpact:
            'Simethicone is routinely given before endoscopy because it clears the bubbles that obscure the mucosa, and the network meta-analysis of bowel preparations found the regimens containing it ranked highest for cleansing and for adenoma detection. But a 2016 study using a borescope found residual fluid inside 19 of 20 fully reprocessed endoscopes and confirmed simethicone by infrared spectroscopy in two of them.',
          clinicalPrecaution:
            'Those authors recommended minimising simethicone use pending further research, on the grounds that an inert hydrophobic substance may reduce reprocessing effectiveness and that simethicone solutions commonly contain sugars and thickeners that could support microbial growth.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CO[Si](C)(C)O[Si](C)(C)C.O=[Si]=O',
      chemicalFormula: 'C6H18O4Si3',
      molecularWeight: '238.46 g/mol',
      targetReceptorAffinity:
        'No receptor and no affinity. Simethicone is not a single compound: it is a defined mixture of a linear polydimethylsiloxane of variable chain length with a few per cent of finely divided silicon dioxide, and the silica particles are as necessary to the antifoaming action as the oil. The structure carried on this record is a short siloxane fragment plus silicon dioxide — a stand-in for a polymer that has no single molecular formula, which is why the stated formula and 238.46 g/mol describe the representative fragment and not the marketed substance. This is a genuine limit of the record and is stated here rather than papered over. What the material does is physical: it spreads at the gas-liquid interface, lowers the surface tension of the bubble film, and causes small bubbles to coalesce.',
      structureSource: {
        label:
          'PubChem CID 6433516 (simethicone) — the two-component structure carried on the enriched record; simethicone is a mixture of dimethicone (polydimethylsiloxane) with silicon dioxide and has no single molecular formula',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6433516',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'sim-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Release on antifoam performance and silica content, not on assay',
          description:
            'Simethicone has no molecular weight to assay against, because it is a polymer blend. What determines whether a batch works is the viscosity of the polydimethylsiloxane, the proportion and dispersion of the silicon dioxide, and the measured antifoaming activity. A certificate of analysis reporting only identity has not tested the product.',
          reagentsAndBuffer:
            'Simethicone reference standard, kinematic viscosity by capillary viscometer, silicon dioxide content by gravimetric ashing, compendial antifoaming activity test with defined foam generation, infrared spectroscopy for identity',
        },
        {
          id: 'sim-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Polymerise dimethylsiloxane and disperse hydrated silica into it',
          description:
            'The oil is a linear polydimethylsiloxane made by ring-opening or condensation polymerisation and end-capped with trimethylsilyl groups. The silica is then dispersed and heat-treated so its surface becomes partly hydrophobic. That activation step is what turns a silicone oil into an antifoam, and it is the reason simethicone and plain dimethicone are not interchangeable.',
          dependsOnStepId: 'sim-w1',
          reagentsAndBuffer:
            'Cyclic or linear dimethylsiloxanes, acid or base polymerisation catalyst, hexamethyldisiloxane as end-capper, finely divided hydrated silicon dioxide, high-shear dispersion, controlled thermal activation',
        },
        {
          id: 'sim-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Strip the volatile cyclic siloxanes',
          description:
            'Polymerisation leaves low molecular weight cyclic siloxanes behind. They are volatile, they are the fraction most likely to be absorbed at all, and they are the fraction subject to environmental and toxicological scrutiny in other industries. Removing them is what separates a pharmaceutical grade from an industrial antifoam of otherwise identical function.',
          dependsOnStepId: 'sim-w2',
          reagentsAndBuffer:
            'Thin-film or wiped-film vacuum stripping, headspace gas chromatography with mass spectrometry for residual cyclic siloxanes, heavy metals and residual catalyst limits',
        },
        {
          id: 'sim-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Demonstrate coalescence in a real luminal medium, not in water',
          description:
            'Antifoam performance is medium-dependent. Foam in gastric or intestinal contents — with bile salts, mucus, protein and food — behaves differently from foam in a beaker of water with a surfactant. The bridge from "collapses foam" to "relieves bloating" fails first here, and this is the experiment that would test it rather than assume it.',
          dependsOnStepId: 'sim-w3',
          reagentsAndBuffer:
            'Simulated gastric and intestinal fluids with bile salts and lecithin, standardised foam generation, bubble size distribution by optical imaging, foam half-life measurement, dose range spanning the 500 mg daily ceiling diluted into luminal volume',
        },
        {
          id: 'sim-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure gas, and measure the symptom, and report both',
          description:
            'Every trial of simethicone has measured a symptom — crying time, a parent’s impression, a bloating score. None has measured intestinal gas volume, which is measurable by argon washout or by computed tomography. Because the mechanism acts on the form of gas rather than its amount, a trial that measures only symptoms cannot say whether a null result means the mechanism failed or the mechanism worked and did not matter.',
          dependsOnStepId: 'sim-w4',
          reagentsAndBuffer:
            'Intestinal gas volume by argon washout or abdominal computed tomography, paired validated bloating and distension scores, abdominal girth measurement, randomised crossover design with adequate washout',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sim-a1',
        category: 'failed',
        title: 'In infant colic, indistinguishable from placebo',
        laymanSummary:
          'Eighty-three colicky babies were given simethicone and placebo in turn, without anyone knowing which was which. More of them appeared to respond to the placebo than to the drug.',
        technicalDetails:
          'A randomised, double-blind, placebo-controlled crossover trial across three general paediatric practices in distinct geographic regions enrolled 83 infants aged 2 to 8 weeks with infant colic, giving 166 treatment periods of 3 to 10 days each. Compared with baseline, improvement was reported for 54% of treatment periods, worsening for 22% and no change for 24% — and the likelihood of a period being rated as improvement, worsening or no change was the same whether the infant was receiving placebo or simethicone. Twenty-eight per cent of infants responded only to simethicone, 37% only to placebo, and 20% to both, with no statistically significant differences among the three groups of responders. The authors specifically pulled out the infants whose parents described the symptoms as gas-related and found no difference there either. The conclusion is stated flatly: although both produced perceived improvements in symptoms, simethicone is no more effective than placebo in the treatment of infantile colic.',
        evidenceSource:
          'Metcalf TJ, Irons TG, Sher LD, Young PC. Simethicone in the treatment of infant colic: a randomized, placebo-controlled, multicenter trial. Pediatrics 1994;94(1):29-34',
        measuredMetric:
          'Parent-reported improvement, worsening or no change across 166 blinded crossover treatment periods in 83 infants',
        auditFlag: 'caution',
      },
      {
        id: 'sim-a2',
        category: 'inferred',
        title: 'The monograph indication is a sensation, and no trial has measured the gas',
        laymanSummary:
          'The regulation permits the claim "relieves bloating, pressure, fullness or stuffed feeling commonly referred to as gas". It does not require anyone to show that the amount of gas changed, and nobody has.',
        technicalDetails:
          '21 CFR 332.10 recognises simethicone as the antiflatulent active ingredient, at a maximum daily over-the-counter dose of 500 mg with no dosage limitation in professional labelling. 21 CFR 332.30 sets the permitted indications: "alleviates or relieves the symptoms referred to as gas", or "alleviates or relieves bloating, pressure, fullness or stuffed feeling commonly referred to as gas". Both are symptom claims. The mechanism, by contrast, is a claim about the physical state of gas — bubble coalescence — and it does not change how much gas the gut contains. Intestinal gas volume is measurable, by argon washout or by abdominal computed tomography, and no trial of simethicone has used it as an endpoint. The gap between "collapses foam" and "relieves the feeling of being bloated" is therefore unmeasured in both directions: nobody has shown the mechanism operates at the labelled dose in a human gut, and nobody has shown that it would matter if it did.',
        evidenceSource:
          '21 CFR 332.10 Antiflatulent active ingredients and 21 CFR 332.30 Labeling of antiflatulent drug products',
        inferredClaim:
          'That an antifoaming action demonstrated in vitro relieves the subjective symptom of bloating in vivo — the step between the mechanism and the permitted claim, which no trial has measured',
        auditFlag: 'contested',
      },
      {
        id: 'sim-a3',
        category: 'measured',
        title: 'Its one positive randomised result is as half of a combination',
        laymanSummary:
          'A four-arm trial in 493 adults with diarrhoea and gas pain compared the loperamide-simethicone combination against loperamide alone, simethicone alone and placebo. The combination beat all three.',
        technicalDetails:
          'A randomised, double-blind, placebo-controlled 48-hour trial in a primary care ambulatory practice in Acapulco, Mexico enrolled 493 adults aged 18 to 63 with acute nonspecific diarrhoea and at least moderately severe abdominal discomfort. Arms were two chewable tablets of loperamide 2 mg plus simethicone 125 mg (n=124), loperamide 2 mg alone (n=123), simethicone 125 mg alone (n=123) or placebo (n=123), followed by one tablet after each unformed stool up to four in 24 hours. The co-primary outcomes were time to last unformed stool and time to complete relief of gas-related abdominal discomfort. The combination was significantly better than loperamide alone, simethicone alone and placebo on both (p<0.001) and on all end-of-study patient-assessed outcomes and all clinically important secondary outcomes (p≤0.01), with no significant differences in adverse events. Two things follow. This is a genuine, well-designed factorial result showing simethicone contributes something on top of loperamide — and it also places simethicone alone among the three arms the combination beat. The trial was conducted by the medical department of McNeil Consumer Healthcare, which markets the combination, as the corresponding author’s affiliation records.',
        evidenceSource:
          'Kaplan MA, Prior MJ, Ash RR, McKonly KI, Helzner EC, Nelson EB. Loperamide-simethicone vs loperamide alone, simethicone alone, and placebo in the treatment of acute diarrhea with gas-related abdominal discomfort. Arch Fam Med 1999;8(3):243-248',
        doi: '10.1001/archfami.8.3.243',
        measuredMetric:
          'Time to last unformed stool and time to complete relief of gas-related abdominal discomfort, four arms, 493 patients',
        auditFlag: 'verified',
      },
      {
        id: 'sim-a4',
        category: 'measured',
        title: 'Its strongest evidence is for a use it is not sold for',
        laymanSummary:
          'Given before a colonoscopy, simethicone clears the bubbles that hide the bowel wall. In a network meta-analysis of forty trials and thirteen thousand patients, the regimens containing it ranked first for cleansing and for finding pre-cancerous growths.',
        technicalDetails:
          'A network meta-analysis of randomised controlled trials covering sixteen bowel preparation regimens included 40 articles and 13,064 patients. On the Boston Bowel Preparation Scale, polyethylene glycol plus ascorbic acid plus simethicone ranked first (odds ratio 14.27, 95% credible interval 2.68 to 127.87). On the Ottawa Bowel Preparation Scale, polyethylene glycol plus simethicone ranked first (2.0, 95% CrI 0.64 to 6.4) but without significant differences. For adenoma detection rate — the outcome that actually determines whether a colonoscopy prevents a cancer — polyethylene glycol plus simethicone ranked first (1.5, 95% CrI 1.0 to 2.2). Polyethylene glycol plus ascorbic acid plus simethicone was also the regimen least likely to cause abdominal bloating. Two cautions belong with this. Credible intervals of 2.68 to 127.87 and of 1.0 to 2.2 are extremely wide, and a network meta-analysis ranking is not a head-to-head result. And this indication appears nowhere in the antiflatulent monograph: the best-supported use of simethicone is one the labelled product is not sold for.',
        evidenceSource:
          'Sun M, Yang G, Wang Y. Cleaning effect and tolerance of 16 bowel preparation regimens on adult patients before colonoscopy: a network meta-analysis. Int J Colorectal Dis 2023;38(1):69',
        doi: '10.1007/s00384-023-04355-3',
        measuredMetric:
          'Boston and Ottawa Bowel Preparation Scale scores and adenoma detection rate across 40 randomised trials and 13,064 patients',
        auditFlag: 'verified',
      },
      {
        id: 'sim-a5',
        category: 'failed',
        title: 'It stays inside the endoscopes it was given to clean',
        laymanSummary:
          'Researchers looked inside twenty fully reprocessed endoscopes with a borescope and found residual fluid in nineteen. Infrared analysis confirmed simethicone in two of them.',
        technicalDetails:
          'During a study of endoscope reprocessing effectiveness, a borescope was used to examine lumens and ports of fully reprocessed gastroscopes and colonoscopes. Cloudy, white, viscous fluid resembling simethicone was observed. Residual fluid was found inside 19 of 20 endoscopes; fluid photographed in 8 resembled simethicone solutions; Fourier transform infrared spectroscopy with attenuated total reflection confirmed the presence of simethicone in 2. The authors note that simethicone is an inert, hydrophobic substance that may reduce reprocessing effectiveness, and that simethicone solutions commonly contain sugars and thickeners that may contribute to microbial growth and biofilm development. Their stated recommendation is to minimise the use of simethicone pending further research into its safety. The finding is uncomfortable precisely because inertness — the property that makes simethicone safe to swallow, safe for newborns and free of drug interactions — is also the property that makes it survive an automated reprocessing cycle.',
        evidenceSource:
          'Ofstead CL, Wetzler HP, Johnson EA, Heymann OL, Maust TJ, Shaw MJ. Simethicone residue remains inside gastrointestinal endoscopes despite reprocessing. Am J Infect Control 2016;44(11):1237-1240',
        doi: '10.1016/j.ajic.2016.05.016',
        measuredMetric:
          'Residual fluid observed in 19 of 20 reprocessed endoscopes, with simethicone confirmed by FTIR in 2',
        auditFlag: 'caution',
      },
      {
        id: 'sim-a6',
        category: 'measured',
        title: 'It is the only antiflatulent, and it did not win that position in a comparison',
        laymanSummary:
          'Simethicone has no competitor because the regulation recognises one antiflatulent ingredient and it is simethicone. That is a regulatory fact, not evidence of superiority.',
        technicalDetails:
          '21 CFR 332.10 is titled "Antiflatulent active ingredients" and lists simethicone, at a maximum over-the-counter daily dose of 500 mg with no dosage limitation for professional labelling. There is no second entry. A reader encountering a product category with exactly one recognised active ingredient will reasonably infer that it prevailed over alternatives; what actually happened is that the over-the-counter review panels evaluated the candidates that were before them and recognised one. The consequence is that no comparative-efficacy question has ever had to be answered, because there has never been another approved antiflatulent to answer it against. This is the same structural situation as an unopposed incumbent: uncontested is not the same as tested.',
        evidenceSource:
          '21 CFR 332.10 — Antiflatulent active ingredients, and 21 CFR part 332, Antiflatulent products for over-the-counter human use',
        inferredClaim:
          'That being the only recognised antiflatulent implies simethicone outperformed alternatives — the monograph recognises one ingredient and no comparative efficacy standard was applied',
        measuredMetric:
          'Number of active ingredients recognised as generally recognised as safe and effective antiflatulents: one',
        auditFlag: 'caution',
      },
      {
        id: 'sim-a7',
        category: 'inferred',
        title: 'It has no molecular formula, and this record gives it one',
        laymanSummary:
          'Simethicone is not a single molecule. It is a silicone oil of variable chain length blended with a few per cent of powdered silica. The formula and molecular weight on this page describe a representative fragment.',
        technicalDetails:
          'Marketed simethicone is a defined mixture of linear polydimethylsiloxane, end-capped with trimethylsilyl groups and of variable chain length, with finely divided silicon dioxide. The silica is not an excipient: surface-activated silica particles are required for the antifoaming action, which is why simethicone and plain dimethicone are not interchangeable. Neither component alone, and no single structure, corresponds to the substance. The structure carried on this record — a short methoxy-terminated siloxane fragment together with silicon dioxide, formula C6H18O4Si3 at 238.46 g/mol — is a database stand-in for a polymer blend that has no molecular weight. It came from PubChem, it passed this repository’s structure parser, and it is left in place because substituting an invented alternative would be worse. It is flagged here because a molecular weight on a page implies a precision this substance does not have.',
        evidenceSource:
          'PubChem CID 6433516 (simethicone) as carried on the enriched record; 21 CFR 332.10',
        inferredClaim:
          'That the chemical formula and molecular weight shown for simethicone describe the marketed substance — they describe a representative fragment of a polymer blend that has neither',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Chewed or swallowed, and never absorbed',
        laymanDesc:
          'A chewable tablet, a softgel or drops for a baby. Whatever goes in comes out again unchanged.',
        molecularDetail:
          'Simethicone is not absorbed from the gastrointestinal tract, is not metabolised and is excreted unchanged in the faeces. Maximum over-the-counter daily dose is 500 mg under 21 CFR 332.10, with no dosage limitation in professional labelling — a ceiling that reflects the absence of systemic exposure rather than a toxicity threshold.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It spreads across the surface of the bubbles',
        laymanDesc:
          'The silicone oil is not soluble in the watery contents of the gut, so it spreads out along the boundary between gas and liquid — exactly where the bubble walls are.',
        molecularDetail:
          'A hydrophobic, low-surface-tension polydimethylsiloxane spreads at the gas-liquid interface in preference to remaining dispersed. The activated silicon dioxide particles blended into it bridge the thin liquid films between adjacent bubbles, which is the part of the antifoam mechanism the oil alone does not supply.',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Surface tension in the bubble wall falls',
        laymanDesc:
          'A bubble is held together by the surface tension of its wall. Weaken that and the wall cannot hold.',
        molecularDetail:
          'No receptor is involved and none is claimed. This is interfacial physical chemistry: lowering the surface tension of the lamella between two bubbles destabilises it. The same materials are used industrially as antifoams in fermenters and processing tanks, at the same physical principle and a very different concentration.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Small bubbles merge into large ones',
        laymanDesc:
          'Foam collapses into fewer, bigger pockets of gas, which are easier for the gut to move along and pass.',
        molecularDetail:
          'Coalescence. Crucially, the total volume of gas is unchanged — only its distribution. That is the structural reason a symptom endpoint and a gas-volume endpoint are different questions here, and the reason no trial that measures only symptoms can tell a failed mechanism from a working mechanism that does not matter.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Before endoscopy, this demonstrably helps',
        laymanDesc:
          'Bubbles on the bowel wall hide small growths. Clearing them improves how well the bowel can be seen and how many pre-cancerous lesions are found.',
        molecularDetail:
          'Network meta-analysis of 40 randomised trials and 13,064 patients: polyethylene glycol plus ascorbic acid plus simethicone ranked first on the Boston Bowel Preparation Scale (odds ratio 14.27, 95% CrI 2.68 to 127.87) and was least likely to cause abdominal bloating; polyethylene glycol plus simethicone ranked first for adenoma detection rate (1.5, 95% CrI 1.0 to 2.2). Wide credible intervals, and a ranking rather than a head-to-head.',
        iconName: 'Eye',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'For the symptom it is sold for, the evidence is thin and mostly negative',
        laymanDesc:
          'The one randomised placebo-controlled trial in colicky infants found no difference. More babies appeared to respond to the dummy than to the drug.',
        molecularDetail:
          'Metcalf 1994: 83 infants, 166 blinded crossover treatment periods; improvement, worsening and no-change ratings equally likely on placebo and on simethicone; 28% responded only to simethicone against 37% only to placebo; no difference even among infants whose parents described the symptoms as gas-related. The permitted monograph claim remains a symptom claim, and no trial has measured intestinal gas volume as an endpoint.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Metcalf 1994 (Pediatrics 1994;94(1):29-34)',
        phase: 'Randomised, double-blind, placebo-controlled crossover, three paediatric practices',
        sampleSize: 83,
        primaryEndpoint:
          'Parent-reported improvement, worsening or no change in infant colic symptoms across blinded crossover treatment periods',
        endpointMet: false,
        statisticalPValue:
          'The likelihood of a treatment period being rated improvement, worsening or no change was the same on placebo and on simethicone; 28% of infants responded only to simethicone, 37% only to placebo, 20% to both, with no statistically significant differences',
        unreportedAdverseSignals:
          '166 treatment periods of 3 to 10 days in 83 infants aged 2 to 8 weeks. Improvement was reported in 54% of periods overall, which is the size of the response that has to be explained by something other than the drug. No difference was found even when infants with parent-reported gas-related symptoms were analysed separately.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Kaplan 1999 (Arch Fam Med 1999;8(3):243-248)',
        phase: 'Randomised, double-blind, placebo-controlled, four arms, 48 hours',
        sampleSize: 493,
        primaryEndpoint:
          'Time to last unformed stool and time to complete relief of gas-related abdominal discomfort — loperamide-simethicone against loperamide alone, simethicone alone and placebo',
        endpointMet: true,
        statisticalPValue:
          'Combination significantly better than each of the other three arms on both co-primary outcomes (p<0.001) and on all end-of-study patient-assessed and clinically important secondary outcomes (p≤0.01)',
        unreportedAdverseSignals:
          'Simethicone alone was one of the three arms the combination beat. The trial was conducted by the medical department of McNeil Consumer Healthcare, which markets the combination product, per the corresponding author’s affiliation. Single site, 48 hours, acute nonspecific diarrhoea in Acapulco, Mexico.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Sun 2023 (Int J Colorectal Dis 2023;38(1):69) — network meta-analysis of 16 bowel preparation regimens',
        phase: 'Network meta-analysis of 40 randomised controlled trials',
        sampleSize: 13064,
        primaryEndpoint:
          'Bowel cleansing effect (Boston and Ottawa Bowel Preparation Scales) and patient tolerance across sixteen preparation regimens',
        endpointMet: true,
        statisticalPValue:
          'Polyethylene glycol + ascorbic acid + simethicone ranked first on the Boston scale (odds ratio 14.27, 95% CrI 2.68 to 127.87); polyethylene glycol + simethicone ranked first for adenoma detection rate (1.5, 95% CrI 1.0 to 2.2)',
        unreportedAdverseSignals:
          'A ranking from indirect comparison rather than a head-to-head trial, with very wide credible intervals — the adenoma detection interval has a lower bound of exactly 1.0. The Ottawa scale ranking for polyethylene glycol + simethicone (2.0, 95% CrI 0.64 to 6.4) was not significant. This indication appears nowhere in the antiflatulent monograph under which simethicone is sold.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No difference from placebo in infant colic across 166 blinded crossover treatment periods in 83 infants; 28% responded only to simethicone against 37% only to placebo',
        'The loperamide-simethicone combination beat loperamide alone, simethicone alone and placebo on both co-primary outcomes in 493 adults (p<0.001)',
        'Polyethylene glycol plus ascorbic acid plus simethicone ranked first for bowel cleansing across 40 trials and 13,064 patients (odds ratio 14.27, 95% CrI 2.68 to 127.87)',
        'Residual fluid inside 19 of 20 fully reprocessed endoscopes, with simethicone confirmed by infrared spectroscopy in 2',
      ],
      unsupportedInferences: [
        'That collapsing gas bubbles relieves the sensation of bloating — the mechanism is physical chemistry and the permitted claim is a symptom claim, with nothing measured in between',
        'That being the only ingredient recognised at 21 CFR 332.10 means simethicone outperformed alternatives',
        'That the chemical formula and 238.46 g/mol shown on this page describe the marketed substance, which is a polymer blend with no molecular weight',
        'That evidence from bowel preparation transfers to the antiflatulent indication — the two use the same molecule for entirely different purposes',
      ],
      whatFailedInitially: [
        'The only randomised placebo-controlled trial in infant colic found no effect, including in the parent-identified gas-related subgroup',
        'Simethicone alone was among the arms beaten by the loperamide combination in the four-arm trial',
        'No trial of simethicone has ever measured intestinal gas volume, which is measurable',
        'A borescope study of reprocessed endoscopes recommended minimising its use pending further research into safety',
      ],
      realWorldOutcome: [
        'The sole active ingredient recognised as an antiflatulent at 21 CFR 332.10, at a 500 mg over-the-counter daily ceiling and no limit in professional labelling',
        'Combined with loperamide in IMODIUM MULTI-SYMPTOM RELIEF, NDA 020606, approved 26 June 1997',
        'This record carries no United States pharmacy acquisition cost, because the CMS survey holds no listed NADAC entry for it',
        'Routinely given before endoscopy, which is where its evidence is strongest and where it is not licensed',
      ],
    },
    deliverySystem: {
      type: 'Oral chewable tablet, softgel capsule, oral suspension and infant drops; also given through the endoscope or added to bowel preparation solutions',
      description:
        'Given by mouth in any form, and the form barely matters because nothing has to be absorbed for it to act — the drug works on the contents of the lumen it is passing through. Maximum over-the-counter daily dose is 500 mg under 21 CFR 332.10, with no dosage limitation in professional labelling. In endoscopy it is delivered in the preparation solution or through the scope channel.',
      safetyProfile:
        'Not absorbed, not metabolised, excreted unchanged in the faeces, with no meaningful systemic exposure and no significant drug interactions — which is why it is one of the few medicines given to newborns. In the four-arm randomised trial of 493 adults there were no significant differences in adverse events between simethicone, loperamide, the combination and placebo. The recorded harm is not to patients directly: a borescope study found residual fluid inside 19 of 20 fully reprocessed gastrointestinal endoscopes, confirmed as simethicone by infrared spectroscopy in 2, and the authors recommended minimising simethicone use pending further research, noting that an inert hydrophobic substance may reduce reprocessing effectiveness and that simethicone solutions commonly contain sugars and thickeners which may support microbial growth and biofilm.',
    },
    commonQuestions: [
      {
        q: 'Does simethicone actually relieve gas?',
        a: 'The mechanism is real and the evidence that it relieves the symptom is thin. Simethicone is an antifoaming agent: it lowers the surface tension of the films between small gas bubbles so they merge into larger ones. That is uncontroversial physical chemistry. What it does not do is change how much gas is in your gut. The best randomised test of the symptom claim is a 1994 crossover trial in 83 colicky infants, and it found the drug indistinguishable from placebo — 28% of infants responded only to simethicone and 37% only to placebo, with no difference even among the babies whose parents described the problem as gas. In adults, the only positive randomised result is as half of a combination with loperamide for acute diarrhoea, in a trial run by the company that sells that combination.',
        auditNote:
          'A mechanism that is certainly true in a beaker and a claim that is certainly permitted on a packet are not the same thing as an effect in a person. This is the same shape of gap as the docusate page, and it appears twice in this file because it is the characteristic failure mode of over-the-counter symptom products.',
      },
      {
        q: 'Is it safe to give to a baby?',
        a: 'It is about as safe as a swallowed substance gets, and that is not the same as being useful. Simethicone is not absorbed from the gut, is not metabolised and comes out unchanged, so there is no systemic exposure and essentially no drug interaction — which is why professional labelling carries no dose limit at all and why it is one of very few medicines given to newborns. The reason to hesitate is not harm. It is that the one randomised, double-blind, placebo-controlled trial in infants with colic found no benefit over placebo, and that persistent inconsolable crying in a young infant is worth a proper assessment rather than an over-the-counter product.',
      },
      {
        q: 'Why do they give it to me before a colonoscopy?',
        a: 'Because that is where it works best, and it is not what the packet is sold for. Bubbles clinging to the bowel wall hide small polyps. Adding simethicone to the preparation clears them. In a network meta-analysis of 40 randomised trials and 13,064 patients, polyethylene glycol plus ascorbic acid plus simethicone ranked first for bowel cleansing on the Boston scale and was also the regimen least likely to cause bloating, and polyethylene glycol plus simethicone ranked first for adenoma detection rate — the outcome that determines whether a colonoscopy actually prevents a cancer. The credible intervals are very wide and the ranking comes from indirect comparison, so this is suggestive rather than settled. One complication worth knowing: a 2016 borescope study found residual fluid inside 19 of 20 fully reprocessed endoscopes and confirmed simethicone in two, and its authors recommended minimising its use until that is better understood.',
      },
      {
        q: 'Why is simethicone the only anti-gas ingredient available?',
        a: 'Because the regulation recognises one. 21 CFR 332.10, the FDA’s over-the-counter antiflatulent monograph, lists simethicone and nothing else, at a maximum daily dose of 500 mg for over-the-counter labelling. It is easy to read a single-ingredient category as evidence that this ingredient won a competition. What happened is that the over-the-counter review recognised one active ingredient as generally recognised as safe and effective for this use, and no comparative-efficacy question has ever had to be answered because there has never been another approved antiflatulent to answer it against.',
      },
      {
        q: 'What is it actually made of?',
        a: 'Not a single molecule. Simethicone is a blend: a silicone oil — polydimethylsiloxane of variable chain length — mixed with a few per cent of finely divided, surface-activated silicon dioxide. The silica is not a filler; the particles bridge the liquid films between bubbles and are necessary to the antifoaming action, which is why simethicone and plain dimethicone are not the same thing. A consequence worth flagging on this page: the chemical formula and molecular weight shown above describe a short representative fragment taken from a chemical database, not the marketed substance, because a polymer blend of variable chain length does not have a molecular weight.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Metcalf TJ, Irons TG, Sher LD, Young PC. Simethicone in the treatment of infant colic: a randomized, placebo-controlled, multicenter trial. Pediatrics 1994;94(1):29-34',
        identifier: '8008533',
        kind: 'pmid',
      },
      {
        label:
          'Kaplan MA, Prior MJ, Ash RR, McKonly KI, Helzner EC, Nelson EB. Loperamide-simethicone vs loperamide alone, simethicone alone, and placebo in the treatment of acute diarrhea with gas-related abdominal discomfort. A randomized controlled trial. Arch Fam Med 1999;8(3):243-248',
        identifier: '10.1001/archfami.8.3.243',
        kind: 'doi',
      },
      {
        label:
          'Sun M, Yang G, Wang Y. Cleaning effect and tolerance of 16 bowel preparation regimens on adult patients before colonoscopy: a network meta-analysis. Int J Colorectal Dis 2023;38(1):69',
        identifier: '10.1007/s00384-023-04355-3',
        kind: 'doi',
      },
      {
        label:
          'Ofstead CL, Wetzler HP, Johnson EA, Heymann OL, Maust TJ, Shaw MJ. Simethicone residue remains inside gastrointestinal endoscopes despite reprocessing. Am J Infect Control 2016;44(11):1237-1240',
        identifier: '10.1016/j.ajic.2016.05.016',
        kind: 'doi',
      },
      {
        label:
          '21 CFR 332.10 — Antiflatulent active ingredients: simethicone, maximum daily dosage 500 mg for over-the-counter labelling, no dosage limitation for professional labelling',
        identifier: 'https://www.law.cornell.edu/cfr/text/21/332.10',
        kind: 'regulatory',
      },
      {
        label:
          '21 CFR 332.30 — Labeling of antiflatulent drug products: permitted statements of identity and indications',
        identifier: 'https://www.law.cornell.edu/cfr/text/21/332.30',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA — IMODIUM MULTI-SYMPTOM RELIEF (loperamide hydrochloride and simethicone), NDA 020606, J&J Consumer, original approval 26 June 1997; NDA 021140, 30 November 2000',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020606',
        kind: 'regulatory',
      },
      {
        label:
          'Ford AC, Talley NJ, Spiegel BM, et al. Effect of fibre, antispasmodics, and peppermint oil in the treatment of irritable bowel syndrome: systematic review and meta-analysis. BMJ 2008;337:a2313',
        identifier: '10.1136/bmj.a2313',
        kind: 'doi',
      },
      {
        label:
          'PubChem CID 6433516 — simethicone, the two-component structure carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6433516',
        kind: 'url',
      },
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Linaclotide — the modern, expensive, mechanistically elegant end of this file: a peptide
  //     that hits its endpoints, causes diarrhoea in more people than it makes responders, and
  //     carries a paediatric indication licensed without a placebo arm.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'linaclotide',
    name: 'Linaclotide',
    tradeName: 'Linzess',
    sponsor:
      'AbbVie (NDA 202811, original approval 30 August 2012); developed by Ironwood Pharmaceuticals and co-promoted with Forest Laboratories, whose successor Allergan was acquired by AbbVie',
    targetGene: 'GUCY2C',
    targetProtein:
      'Guanylate cyclase-C, on the luminal surface of the intestinal epithelium. Linaclotide is described in its own label as structurally related to the human hormones guanylin and uroguanylin, which are the receptor’s natural ligands',
    modality: 'Peptide / GLP-1 Agonist',
    approvalStatus: 'FDA Approved',
    approvalYear: 2012,
    indication:
      'Irritable bowel syndrome with constipation in adults and paediatric patients 7 years of age and older; chronic idiopathic constipation in adults; functional constipation in paediatric patients 2 years of age and older. Contraindicated below 2 years of age and in known or suspected mechanical gastrointestinal obstruction',
    patientFriendlyIndication:
      'Constipation with abdominal pain (IBS-C), and long-term constipation with no identified cause',
    anatomicalSite:
      'The luminal face of the intestinal epithelium — linaclotide is minimally absorbed and never meaningfully enters the bloodstream',
    conditionContext: {
      conditionExplainer:
        'The intestinal lining has a receptor called guanylate cyclase-C on its inner surface, which the body’s own hormones guanylin and uroguanylin use to control how much fluid is secreted into the bowel. Switching it on raises cyclic GMP inside the cell, which opens the CFTR chloride channel, which pulls water into the lumen. More fluid means softer stool and faster transit. The raised cyclic GMP outside the cell also appears, in animal models, to quieten pain-sensing nerves in the gut wall.',
      whyItMatters:
        'Linaclotide is the most modern and by far the most expensive drug in this file, and it is the one whose trials were designed to the highest standard — prespecified composite responder endpoints, daily electronic diaries, two independent placebo-controlled trials per indication. It is therefore the cleanest place to see what a well-run modern programme actually delivers: absolute treatment differences of 7 to 17 percentage points, against a diarrhoea rate of 20% versus 3%.',
      whoTakesThis:
        'Adults with irritable bowel syndrome with constipation or chronic idiopathic constipation, and children — from 7 years for IBS-C and from 2 years for functional constipation. It is contraindicated under 2 years of age with a boxed warning, and in known or suspected mechanical obstruction.',
      clinicalGoals:
        'Being a responder: at least three complete spontaneous bowel movements a week with an increase of at least one, and in irritable bowel syndrome at least a 30% fall in abdominal pain, in the same week, for at least nine of twelve weeks. That is a demanding endpoint honestly constructed, and it is still a diary count and a pain rating rather than an outcome.',
    },
    oneSentenceVerdict:
      'A 14-amino-acid guanylate cyclase-C agonist that raised the proportion of chronic constipation patients achieving three or more complete spontaneous bowel movements a week from 3% to 20% in one pivotal trial and 6% to 15% in the other — absolute differences of 17 and 10 percentage points, or about one extra responder for every six to ten people treated — while causing diarrhoea in 20% against 3% on placebo, so that across its irritable bowel programme more patients were given diarrhoea than were converted into responders.',
    laymanHowItWorks:
      'The lining of your intestine has a switch on its inner surface that controls how much water it lets out. Your body has its own hormones for that switch; linaclotide is a small copy of them. Turning it on makes the intestine push chloride and water into the tube, so stool is softer and moves faster. The same signal also seems, at least in animals, to dial down the nerves that report pain from the gut wall — which is why the drug is used for constipation that comes with pain rather than constipation alone. Almost none of it is absorbed: it works on the surface it is passing over and then leaves.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$9.02 per capsule at United States pharmacy acquisition cost (CMS NADAC, median across 3 listed brand products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved 30 August 2012 under NDA 202811 and still brand-only, with three listed products in the CMS survey. At US$9.02 a capsule once daily, a year of pharmacy acquisition cost is on the order of three thousand dollars — roughly two hundred times a year of generic bisacodyl and several hundred times a year of polyethylene glycol at the same cost basis. No trial has compared it against either.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Linaclotide has never been tested against the laxatives it displaces. Every one of its pivotal trials is against placebo, and patients in them were allowed to continue bulk laxatives and stool softeners but forbidden anything stronger. So the question a reader actually has — is this better than a cheap osmotic or stimulant laxative — has no randomised answer, and the price difference between the options is two to three orders of magnitude.',
      conventionalRx: [
        {
          name: 'Polyethylene glycol 3350 (Miralax)',
          class: 'Osmotic laxative',
          howItCompares:
            'The default first-line treatment for chronic constipation and the comparison linaclotide has never faced. In the Cochrane review of ten randomised trials and 868 participants comparing it against lactulose, polyethylene glycol was superior on stool frequency, stool form, abdominal pain and the need for additional products. No randomised trial has compared polyethylene glycol with linaclotide.',
          typicalCost:
            'Among the cheapest over-the-counter products in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: pennies rather than nine dollars a day; over the counter; an inert unabsorbed polymer with no receptor pharmacology. Cons: does not address abdominal pain, which is the component of the irritable bowel endpoint linaclotide was built for; bloating.',
        },
        {
          name: 'Bisacodyl',
          class: 'Stimulant laxative',
          howItCompares:
            'In its own four-week randomised placebo-controlled trial in 368 patients, 10 mg daily raised complete spontaneous bowel movements from 1.1 to 5.2 per week against 1.1 to 1.9 on placebo (p<0.0001). That is a mean-count endpoint and linaclotide’s is a responder proportion, so the two numbers cannot be subtracted from each other — but both trials ran for the same kind of duration in the same kind of population, and one product costs under a cent a tablet.',
          typicalCost:
            'Among the cheapest over-the-counter products in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: a large randomised effect on stool frequency at negligible cost. Cons: cramping; its label limits use to one week; no evidence on abdominal pain in irritable bowel syndrome.',
        },
        {
          name: 'Plecanatide (Trulance)',
          class: 'Guanylate cyclase-C agonist — the same mechanism',
          howItCompares:
            'The only other drug in this class, licensed for chronic idiopathic constipation and irritable bowel syndrome with constipation in adults. No head-to-head trial against linaclotide has been published. The instructive difference is regulatory rather than clinical: plecanatide’s boxed warning contraindicates it below 6 years, directs avoiding it from 6 to under 18, and states that safety and effectiveness have not been established below 18 — while linaclotide carries paediatric indications from 2 years for functional constipation and from 7 for IBS-C.',
          typicalCost: 'Not stated here — no verified United States acquisition cost was available',
          prosAndCons:
            'Pros: an alternative within the class if one is not tolerated. Cons: same mechanism, same principal adverse effect, same price bracket; two drugs acting on one receptor with different paediatric cut-offs is a reminder that these boundaries come from separate nonclinical packages rather than from a class-wide finding.',
        },
      ],
      naturalFoods: [
        {
          name: 'Soluble fibre — ispaghula (psyllium)',
          activeCompound: 'Arabinoxylan-rich soluble non-starch polysaccharide',
          biologicalMechanism:
            'Retains water in the stool by physical hydration rather than by opening a chloride channel. It reaches the same end point — more water in the lumen — without engaging any receptor, which is why it produces no diarrhoea of the secretory kind.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: in a BMJ meta-analysis, twelve fibre trials in 591 patients with irritable bowel syndrome gave a relative risk of persistent symptoms of 0.87 (95% CI 0.76 to 1.00), with the effect limited to ispaghula at 0.78 (0.63 to 0.96). Notably, linaclotide’s own trials allowed patients to continue stable doses of bulk laxatives, so its measured effect is an effect on top of fibre rather than instead of it.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Take it on an empty stomach, and the reason is measured',
          action: 'At least 30 minutes before the first meal of the day, at the same time daily.',
          patientImpact:
            'The label reports that taking it immediately after a high-fat breakfast resulted in looser stools and a higher stool frequency than taking it fasted, and records that in the clinical trials it was administered on an empty stomach at least 30 minutes before a meal. Taking it with food is not a smaller dose or a bigger one — it is a different stool consistency.',
          clinicalPrecaution:
            'Since the principal adverse effect is diarrhoea, the food effect runs in the direction of the harm rather than the benefit.',
        },
        {
          name: 'Severe diarrhoea means stop, not push through',
          action: 'If diarrhoea becomes severe, stop the drug and rehydrate.',
          patientImpact:
            'That instruction is section 5.2 of the label verbatim. In the pooled adult trials diarrhoea occurred in 20% against 3% on placebo, and severe diarrhoea in 2% of adults on 145 or 290 mcg. This is not an idiosyncratic reaction: secretory diarrhoea is the therapeutic mechanism operating past the point of benefit.',
          clinicalPrecaution:
            'The boxed warning exists for the same reason at the other end of the age range: in neonatal mice a single clinically relevant adult oral dose caused deaths from dehydration, and the drug is contraindicated below 2 years of age.',
        },
        {
          name: 'Not if there is any question of an obstruction',
          action:
            'Do not take it if a blockage is known or suspected — new severe pain, vomiting, and no stool or wind at all.',
          patientImpact:
            'Known or suspected mechanical gastrointestinal obstruction is a contraindication in the label. A drug that pushes fluid into the lumen and accelerates transit is the wrong drug for a lumen that is closed.',
          clinicalPrecaution:
            'The pivotal trials excluded patients who had faecal impaction requiring emergency room treatment, so the population studied does not include the people for whom this question is most urgent.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@H]1C(=O)N[C@H]2CSSC[C@H]3C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@@H](CSSC[C@H](NC(=O)CNC(=O)[C@@H](NC2=O)[C@@H](C)O)C(=O)N[C@@H](CC4=CC=C(C=C4)O)C(=O)O)C(=O)N[C@@H](CSSC[C@@H](C(=O)N3)N)C(=O)N[C@H](C(=O)N5CCC[C@H]5C(=O)N1)CC(=O)N)CC6=CC=C(C=C6)O)CCC(=O)O',
      chemicalFormula: 'C59H79N15O21S6',
      molecularWeight: '1526.80 g/mol',
      targetReceptorAffinity:
        'A 14-amino-acid peptide, named in the label as L-cysteinyl-L-cysteinyl-L-glutamyl-L-tyrosyl-L-cysteinyl-L-cysteinyl-L-asparaginyl-L-prolyl-L-alanyl-L-cysteinyl-L-threonyl-glycyl-L-cysteinyl-L-tyrosine, cyclic (1-6), (2-10), (5-13)-tris(disulfide). Three disulfide bridges across six cysteines lock the peptide into a rigid shape, and that is why it is declared here as a SMILES string rather than as a residue sequence: a one-letter sequence cannot express which cysteine is bonded to which. Minimally absorbed with negligible systemic availability — plasma concentrations of linaclotide and its active metabolite are below the limit of quantitation at 72, 145 and 290 mcg, so area under the curve, peak concentration and half-life cannot be calculated at all. Metabolised within the gastrointestinal tract to its principal active metabolite by loss of the terminal tyrosine.',
      structureSource: {
        label:
          'PubChem CID 16158208 (linaclotide) via the enriched record; amino acid sequence, disulfide connectivity, molecular formula and molecular weight from the LINZESS label, section 11 Description',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16158208',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lin-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Prove the disulfide connectivity, not just the sequence',
          description:
            'Six cysteines can pair in fifteen different ways and only one of them — 1-6, 2-10, 5-13 — is the drug. Mass spectrometry of the intact peptide cannot distinguish those isomers, because they all have the same mass. Establishing connectivity requires partial reduction, alkylation and peptide mapping, and this is the release test that matters most for this molecule.',
          reagentsAndBuffer:
            'Linaclotide reference standard, partial reduction with tris(2-carboxyethyl)phosphine, differential alkylation with iodoacetamide and N-ethylmaleimide, enzymatic digestion, LC-MS/MS peptide mapping, reversed-phase HPLC for disulfide-isomer purity',
        },
        {
          id: 'lin-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Assemble the 14-mer on solid phase with orthogonally protected cysteines',
          description:
            'The chain is short enough for solid-phase synthesis, but the six cysteines cannot all carry the same protecting group or the folding step becomes a lottery. Orthogonal protection is what makes a defined three-bridge product achievable rather than a statistical mixture — and it is the reason a fourteen-residue peptide is an expensive molecule.',
          dependsOnStepId: 'lin-w1',
          reagentsAndBuffer:
            'Fmoc-protected amino acids, three orthogonal cysteine protecting groups such as trityl, acetamidomethyl and tert-butyl, Wang or 2-chlorotrityl resin, HBTU or HATU coupling reagents, piperidine deprotection, trifluoroacetic acid cleavage cocktail',
        },
        {
          id: 'lin-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separate the correctly folded isomer from the mis-bridged ones',
          description:
            'Mis-bridged isomers are the same molecular formula and the same molecular weight as the drug and differ only in shape. They are separable by reversed-phase chromatography because they present different surfaces, and by nothing that measures mass. A purity specification for this peptide has to be written against retention time and against connectivity, not against composition.',
          dependsOnStepId: 'lin-w2',
          reagentsAndBuffer:
            'Preparative reversed-phase HPLC with trifluoroacetic or acetic acid modifier, ion-exchange polishing, lyophilisation, analytical HPLC against a specified isomer limit, circular dichroism for conformational identity',
        },
        {
          id: 'lin-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Coat the beads, because the formulation is the delivery system',
          description:
            'The marketed product is linaclotide-coated beads in a hard gelatin capsule, with calcium chloride and either L-histidine or L-leucine as stabilising excipients. A peptide with three disulfide bridges is vulnerable to moisture and to disulfide scrambling on storage, and the bead coating with its specific stabiliser set is what keeps the correct isomer intact until it reaches the intestine.',
          dependsOnStepId: 'lin-w3',
          reagentsAndBuffer:
            'Microcrystalline cellulose bead cores, calcium chloride dihydrate, L-histidine (72 mcg strength) or L-leucine (145 and 290 mcg strengths), hypromellose or polyvinyl alcohol coating polymer, hard gelatin capsules with titanium dioxide, controlled-humidity processing',
        },
        {
          id: 'lin-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Confirm receptor engagement on the luminal face, and only there',
          description:
            'The entire safety argument for this drug is that it acts on the apical surface of the epithelium and does not enter the circulation. That is confirmed by an absence — plasma concentrations below the limit of quantitation — which is weaker evidence than a positive measurement. The paired positive experiment is GC-C occupancy and cyclic GMP generation in intestinal tissue with an apical-versus-basolateral comparison.',
          dependsOnStepId: 'lin-w4',
          reagentsAndBuffer:
            'Human intestinal epithelial monolayers on Transwell inserts with separate apical and basolateral dosing, intracellular and extracellular cyclic GMP quantification, CFTR-dependent short-circuit current in Ussing chambers, validated plasma assay with a stated limit of quantitation',
        },
        {
          id: 'lin-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Report responders and diarrhoea on the same page',
          description:
            'The composite responder endpoint used here is a genuinely rigorous construction — a 30% pain reduction and at least three complete spontaneous bowel movements with an increase of at least one, in the same week, for at least nine weeks of twelve. It should be reported alongside the diarrhoea rate as a matter of course, because for this drug the benefit and the principal harm are the same physiological effect at different magnitudes, and reporting either alone misstates the trade.',
          dependsOnStepId: 'lin-w5',
          reagentsAndBuffer:
            'Two-week medication-free baseline, daily electronic patient diary, prespecified complete spontaneous bowel movement definition, 0-to-10 abdominal pain numeric rating scale, prespecified 9-of-12 and 6-of-12 weekly responder rules, adverse event capture with a severity grading for diarrhoea',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lin-a1',
        category: 'measured',
        title: 'Two placebo-controlled trials per indication, and both hit',
        laymanSummary:
          'In chronic constipation, one in five people on the drug reached three or more complete bowel movements a week against one in thirty-three on placebo in the first trial, and 15% against 6% in the second. In irritable bowel syndrome the combined pain-and-bowel endpoint was met in both trials too.',
        technicalDetails:
          'Chronic idiopathic constipation, Trials 3 and 4, 642 and 630 patients: CSBM responder — at least three complete spontaneous bowel movements and an increase of at least one from baseline, for at least 9 of 12 weeks — 20% against 3% on placebo (treatment difference 17%, 95% CI 11.0% to 22.8%) and 15% against 6% (10%, 95% CI 4.2% to 15.7%) at the recommended 145 mcg dose. Irritable bowel syndrome with constipation, Trials 1 and 2 (NCT00948818 and NCT00938717), 800 and 804 patients evaluated: the 9-of-12-week combined responder endpoint — at least a 30% reduction in mean abdominal pain, at least three CSBMs and an increase of at least one CSBM, all in the same week — was met by 12% against 5% (7%, 95% CI 3.2% to 10.9%) and 13% against 3% (10%, 95% CI 6.1% to 13.4%). The CSBM component alone was 20% against 6% and 18% against 5%, a 13-point difference in both. These are demanding composite endpoints, prespecified, collected on daily electronic diaries after a two-week medication-free baseline, in two independent trials per indication. This is what a well-constructed modern programme looks like, and the best absolute difference anywhere in it is 17 percentage points — about one additional responder for every six people treated, falling to about one in fourteen on the irritable bowel composite in Trial 1.',
        evidenceSource:
          'LINZESS (linaclotide) United States prescribing information, sections 14.1 and 14.3, Tables 3, 4 and 7 (NDA 202811)',
        measuredMetric:
          'Complete spontaneous bowel movement responder rates and combined pain-and-bowel responder rates over 12 weeks against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'lin-a2',
        category: 'failed',
        title: 'It gives more people diarrhoea than it turns into responders',
        laymanSummary:
          'Diarrhoea occurred in 20% on the drug against 3% on placebo. On the irritable bowel composite endpoint, the drug produced an extra responder for every ten to fourteen people treated — and an extra case of diarrhoea for every six.',
        technicalDetails:
          'In the two placebo-controlled irritable bowel trials, 1,605 adults, diarrhoea was reported by 20% of the 807 patients on 290 mcg against 3% of the 798 on placebo; abdominal pain 7% against 5%, flatulence 4% against 2%, abdominal distension 2% against 1%. Severe diarrhoea was reported in 2% of adults on 145 or 290 mcg. Set the arithmetic side by side. The excess diarrhoea rate is 17 percentage points, which is one additional case for roughly every six people treated. The excess combined-responder rate in those same trials was 7 and 10 percentage points, which is one additional responder for roughly every fourteen and every ten. That is not a hidden signal — every number is in the label — but the two are almost never quoted together, and for this drug they are the same physiological effect at two magnitudes. Secretory diarrhoea is not an off-target toxicity here; it is the mechanism overshooting.',
        evidenceSource:
          'LINZESS (linaclotide) United States prescribing information, section 6.1 Table 1 and section 5.2, read against section 14.1 Table 3 (NDA 202811)',
        inferredClaim:
          'That a positive composite responder endpoint describes the net experience of taking the drug — when the excess diarrhoea rate exceeds the excess responder rate on the same trials’ primary endpoint',
        measuredMetric:
          'Excess diarrhoea rate (17 percentage points) against excess combined responder rate (7 and 10 percentage points) in the same two trials',
        auditFlag: 'contested',
      },
      {
        id: 'lin-a3',
        category: 'failed',
        title: 'The pain endpoint nearly missed in one of two identical trials',
        laymanSummary:
          'Two trials that were identical for their first twelve weeks produced very different results on abdominal pain: a 7-point difference whose confidence interval almost reached zero in one, and a 19-point difference in the other.',
        technicalDetails:
          'Abdominal pain responder — at least a 30% reduction in mean abdominal pain for at least 9 of 12 weeks — was a primary endpoint in its own right. Trial 1: 34% against 27%, treatment difference 7% with a 95% confidence interval of 0.9% to 13.6%. Trial 2: 39% against 20%, difference 19% (95% CI 13.2% to 25.4%). The label states the trial designs were identical through the first 12 weeks and differed thereafter only in a randomised withdrawal period in Trial 1 and a longer double-blind extension in Trial 2, so the 12-week primary analyses come from the same design in the same population. A confidence interval running from 0.9% to 13.6% is a result that would have been negative had a handful of patients been rated differently, and it sits beside a robust 19-point result from a sibling trial. The placebo arms differ almost as much as the treated ones: 27% against 20%. Nothing here is misreported; it is a demonstration of how much a subjective responder endpoint moves between two runs of the same protocol.',
        evidenceSource:
          'LINZESS (linaclotide) United States prescribing information, section 14.1 Table 3 — Abdominal Pain Responder, Trials 1 and 2 (NDA 202811)',
        measuredMetric:
          'Abdominal pain responder rate at 9 of 12 weeks in two protocol-identical trials',
        auditFlag: 'caution',
      },
      {
        id: 'lin-a4',
        category: 'conclusion_shift',
        title: 'Doubling the dose adds nothing, and the label says so twice',
        laymanSummary:
          'The 290 microgram dose did not consistently beat the 145 microgram dose in chronic constipation, and in the paediatric trial the higher dose group showed no additional benefit either. A flat dose-response is unusual and informative.',
        technicalDetails:
          'Section 14.3 states: "During the individual double-blind placebo-controlled trials, LINZESS 290 mcg did not consistently offer additional clinically meaningful treatment benefit over placebo than that observed with the LINZESS 145 mcg dose. Therefore, the 145 mcg dose is the recommended dose." Section 14.2 records the same phenomenon in children: 108 patients were randomised to 145 mcg or a higher than recommended dosage, and "the higher LINZESS dosage group did not demonstrate additional treatment benefit compared to LINZESS 145 mcg once daily." A dose-response curve that is flat between 145 and 290 mcg while diarrhoea continues to occur at both is consistent with receptor saturation at the lower dose — which is a good thing to know, and also means the drug has no headroom. There is no dose escalation available for a patient in whom 145 mcg is insufficient; there is only a different drug.',
        evidenceSource:
          'LINZESS (linaclotide) United States prescribing information, sections 14.2 and 14.3 (NDA 202811)',
        measuredMetric:
          'Comparative benefit of 290 mcg over 145 mcg in the chronic constipation trials and of a higher than recommended dose in the paediatric trial',
        auditFlag: 'verified',
      },
      {
        id: 'lin-a5',
        category: 'failed',
        title: 'The paediatric IBS indication rests on a trial with no placebo arm',
        laymanSummary:
          'The trial supporting use in children aged 7 and over randomised them between two doses of linaclotide. There was no placebo group, and the result is a bare response rate of 30% in 53 children.',
        technicalDetails:
          'Section 14.2: efficacy in paediatric patients 7 to 17 years with irritable bowel syndrome with constipation was established in a 12-week double-blind, parallel-group, randomised, multicentre trial (Trial 8, NCT04026113), in which 108 patients were randomised to LINZESS 145 mcg once daily or a higher than recommended dosage of LINZESS. Fifty-three patients on 145 mcg were evaluated for efficacy. The primary endpoint — at least a 30% reduction in abdominal pain and an increase of at least two spontaneous bowel movements per week from baseline, for at least 6 of 12 weeks — was met by 16 of 53 (30%, 95% CI 18% to 44%). The abdominal pain responder rate was 68% and the SBM responder rate 40%. There is no placebo comparison because there was no placebo arm. In the adult trials, the placebo arms ran at 20% to 27% on a 30% pain reduction and 3% to 6% on the bowel component, so a single-arm 68% pain response in children cannot be read as a 68-point effect, and the label does not claim it is. What is licensed here is a responder rate, not a difference.',
        evidenceSource:
          'LINZESS (linaclotide) United States prescribing information, section 14.2 Table 6 (NDA 202811); ClinicalTrials.gov NCT04026113',
        inferredClaim:
          'That a 30% single-arm responder rate in 53 children demonstrates efficacy — the trial randomised between two active doses and included no placebo group',
        auditFlag: 'contested',
      },
      {
        id: 'lin-a6',
        category: 'failed',
        title: 'A boxed warning built on deaths in neonatal mice',
        laymanSummary:
          'A single adult-equivalent dose killed newborn mice by dehydration. The drug is contraindicated in children under two, and the class sibling draws its line at six.',
        technicalDetails:
          'The boxed warning reads: LINZESS is contraindicated in patients less than 2 years of age; in nonclinical studies in neonatal mice, administration of a single, clinically relevant adult oral dose of linaclotide caused deaths due to dehydration. Section 5.1 explains that in neonatal mice — human age equivalent approximately 0 to 28 days — linaclotide increased fluid secretion as a consequence of age-dependent elevated GC-C agonism, associated with increased mortality within the first 24 hours. It then records an honest limit: there was no age-dependent trend in GC-C intestinal expression in a clinical study of children 2 to under 18, but there are insufficient data on GC-C expression below 2 years to assess the risk. The class comparison is striking. Plecanatide, the other guanylate cyclase-C agonist, carries a boxed warning contraindicating it below 6 years, directing avoidance from 6 to under 18, and stating that safety and effectiveness have not been established below 18 — while linaclotide is licensed from 2 years for functional constipation. Two drugs, one receptor, two different paediatric boundaries, each drawn from its own nonclinical package rather than from a class-wide finding.',
        evidenceSource:
          'LINZESS (linaclotide) United States prescribing information — Boxed Warning, Contraindications 4, Warnings and Precautions 5.1 (NDA 202811); TRULANCE (plecanatide) United States prescribing information — Boxed Warning (NDA 208745)',
        measuredMetric:
          'Paediatric age contraindication and its nonclinical basis, compared across the two marketed GC-C agonists',
        auditFlag: 'caution',
      },
      {
        id: 'lin-a7',
        category: 'inferred',
        title: 'Nine dollars a capsule, and never compared with a laxative',
        laymanSummary:
          'Every pivotal trial is against placebo. Nobody has run linaclotide against polyethylene glycol or a stimulant laxative, which cost a fraction of a per cent as much.',
        technicalDetails:
          'The CMS National Average Drug Acquisition Cost survey effective 19 August 2026 records US$9.02 per capsule across three listed brand products — about three thousand dollars a year at once-daily dosing. All four adult pivotal trials are placebo-controlled; patients were permitted to continue stable doses of bulk laxatives or stool softeners but were not allowed laxatives, bismuth, prokinetic agents or other drugs for constipation. So the measured effect is an effect on top of fibre and stool softeners and instead of stronger laxatives, and the comparison a payer or a patient would want — against polyethylene glycol, which is the standard first-line option and costs pennies — has never been made. For reference, the strongest randomised laxative result in this file is bisacodyl raising complete spontaneous bowel movements from 1.1 to 5.2 per week against 1.9 on placebo in 368 patients; that is a different endpoint from a responder proportion and the two cannot be compared directly, which is precisely the problem a head-to-head trial would solve.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost survey, linaclotide, 3 listed brand products, effective 19 August 2026; LINZESS United States prescribing information sections 14.1 and 14.3, trial concomitant medication rules',
        inferredClaim:
          'That a drug shown superior to placebo is superior to the inexpensive treatments it displaces — untested for linaclotide against any laxative',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A capsule of coated beads, taken before breakfast',
        laymanDesc:
          'Once a day, at least half an hour before the first meal. Taking it after a fatty breakfast makes the stools looser — that was measured, not guessed.',
        molecularDetail:
          'Linaclotide-coated beads in a hard gelatin capsule at 72, 145 or 290 mcg, with calcium chloride and L-histidine or L-leucine as stabilisers. The label reports that dosing immediately after a high-fat breakfast produced looser stools and higher stool frequency than fasted dosing, and that all clinical trials dosed on an empty stomach at least 30 minutes before a meal.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It never enters the body',
        laymanDesc:
          'Almost none of it is absorbed. Blood levels are too low to measure at any approved dose, so there is no half-life to speak of.',
        molecularDetail:
          'Minimally absorbed with negligible systemic availability. Plasma concentrations of linaclotide and its active metabolite are below the limit of quantitation after 72, 145 or 290 mcg, so area under the curve, peak concentration and half-life cannot be calculated. The peptide is metabolised within the gastrointestinal tract to its principal active metabolite by loss of the terminal tyrosine.',
        iconName: 'Shield',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It docks on a receptor the body already has a hormone for',
        laymanDesc:
          'Guanylate cyclase-C sits on the inner face of the intestinal lining. Your own hormones guanylin and uroguanylin use it. Linaclotide is a small copy of them.',
        molecularDetail:
          'The label describes linaclotide as structurally related to human guanylin and uroguanylin and functioning as a guanylate cyclase-C agonist; both linaclotide and its active metabolite bind GC-C and act locally on the luminal surface of the intestinal epithelium. The 14-residue peptide is locked by three disulfide bridges — cyclic (1-6), (2-10), (5-13) — into the conformation the receptor recognises.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Cyclic GMP rises, and the chloride channel opens',
        laymanDesc:
          'Inside the cell, a second messenger builds up and opens the channel that pushes chloride — and with it water — into the bowel. Outside the cell, the same messenger appears to quieten pain nerves.',
        molecularDetail:
          'GC-C activation raises intracellular and extracellular cyclic guanosine monophosphate. Intracellular cGMP stimulates chloride and bicarbonate secretion into the lumen mainly through the CFTR ion channel, increasing intestinal fluid and accelerating transit. In an animal model of visceral pain, linaclotide reduced abdominal muscle contraction and decreased pain-sensing nerve activity by increasing extracellular cGMP — the label is explicit that this arm of the mechanism is animal evidence.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'One in five reaches the bowel target, against one in thirty-three on placebo',
        laymanDesc:
          'In the first chronic constipation trial, 20% achieved three or more complete bowel movements a week with an increase of at least one, against 3% on placebo.',
        molecularDetail:
          'Chronic idiopathic constipation at 145 mcg: CSBM responder 20% against 3% (difference 17%, 95% CI 11.0% to 22.8%) and 15% against 6% (10%, 95% CI 4.2% to 15.7%). Irritable bowel syndrome at 290 mcg: combined pain-and-bowel responder 12% against 5% and 13% against 3%; the CSBM component alone 20% against 6% and 18% against 5%.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And one in five gets diarrhoea',
        laymanDesc:
          'The same fluid secretion that produces the benefit produces the harm. Twenty per cent had diarrhoea against three per cent on placebo, severe in two per cent.',
        molecularDetail:
          'Pooled irritable bowel trials, 807 on 290 mcg against 798 on placebo: diarrhoea 20% against 3%, abdominal pain 7% against 5%, flatulence 4% against 2%, abdominal distension 2% against 1%. Severe diarrhoea in 2% of adults on 145 or 290 mcg. The label directs suspending dosing and rehydrating if severe diarrhoea occurs. At the other end of the age range the same mechanism produced deaths from dehydration in neonatal mice, which is the basis of the boxed warning and the contraindication below 2 years.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT00948818 (label Trial 1) — linaclotide 290 mcg in adult IBS-C',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, multicentre',
        sampleSize: 803,
        primaryEndpoint:
          'Combined responder at 9 of 12 weeks — at least 30% reduction in mean abdominal pain, at least 3 CSBMs and an increase of at least 1 CSBM from baseline, all in the same week',
        endpointMet: true,
        statisticalPValue:
          'Combined responder 12% (n=405) against 5% (n=395), treatment difference 7% (95% CI 3.2% to 10.9%); CSBM responder 20% against 6% (13%, 95% CI 8.6% to 17.7%)',
        unreportedAdverseSignals:
          'The abdominal pain responder co-primary was 34% against 27%, a difference of 7% with a 95% CI of 0.9% to 13.6% — a confidence interval that almost reaches zero, in a trial whose protocol-identical sibling produced 19%.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT00938717 (label Trial 2) — linaclotide 290 mcg in adult IBS-C',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, 26 weeks',
        sampleSize: 805,
        primaryEndpoint:
          'Combined responder at 9 of 12 weeks — at least 30% reduction in mean abdominal pain, at least 3 CSBMs and an increase of at least 1 CSBM from baseline, all in the same week',
        endpointMet: true,
        statisticalPValue:
          'Combined responder 13% (n=401) against 3% (n=403), treatment difference 10% (95% CI 6.1% to 13.4%); abdominal pain responder 39% against 20% (19%, 95% CI 13.2% to 25.4%); CSBM responder 18% against 5% (13%, 95% CI 8.7% to 17.3%)',
        unreportedAdverseSignals:
          'Across the two pooled IBS-C trials diarrhoea occurred in 20% against 3% on placebo, an excess of 17 percentage points — larger than the 7 and 10 percentage point excess on the combined primary endpoint.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT04026113 (label Trial 8) — linaclotide in paediatric IBS-C, 7 to 17 years',
        phase:
          'Phase 3, randomised, double-blind, parallel-group — two active doses, no placebo arm',
        sampleSize: 108,
        primaryEndpoint:
          'Combined responder at 6 of 12 weeks — at least 30% reduction in abdominal pain and an increase of at least 2 spontaneous bowel movements per week from baseline',
        endpointMet: true,
        statisticalPValue:
          '16 of 53 evaluated at the recommended 145 mcg dose were combined responders: 30% (95% CI 18% to 44%). Abdominal pain responder 68%, SBM responder 40%',
        unreportedAdverseSignals:
          'No placebo arm — patients were randomised between 145 mcg and a higher than recommended dose, and the higher dose showed no additional benefit. The reported figures are single-arm response rates rather than treatment differences. In the adult trials the placebo arms reached 20% to 27% on a 30% pain reduction. Diarrhoea occurred in 7% and 8% of the two paediatric dose groups.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Chronic idiopathic constipation CSBM responder 20% against 3% (difference 17%, 95% CI 11.0% to 22.8%) and 15% against 6% (10%, 95% CI 4.2% to 15.7%) at 145 mcg',
        'IBS-C combined pain-and-bowel responder 12% against 5% and 13% against 3% at 290 mcg, in 800 and 804 evaluated patients',
        'Diarrhoea 20% against 3% on placebo across 1,605 adults, severe in 2%',
        'Plasma concentrations below the limit of quantitation at every approved dose, so no area under the curve, peak concentration or half-life can be calculated',
      ],
      unsupportedInferences: [
        'That a positive composite responder endpoint describes the net experience of the drug, when the excess diarrhoea rate is larger than the excess responder rate',
        'That the visceral analgesic arm of the mechanism operates in humans — the label attributes it to an animal model of visceral pain',
        'That a 30% single-arm responder rate in 53 children constitutes a demonstrated paediatric treatment effect, when the trial had no placebo arm',
        'That superiority to placebo implies superiority to polyethylene glycol or a stimulant laxative, against neither of which it has ever been tested',
      ],
      whatFailedInitially: [
        'The abdominal pain co-primary in Trial 1 gave a difference of 7% with a 95% CI of 0.9% to 13.6%, against 19% in its protocol-identical sibling',
        'The 290 mcg dose did not consistently add clinically meaningful benefit over 145 mcg in chronic constipation, and the higher paediatric dose added none either',
        'A single clinically relevant adult oral dose caused deaths from dehydration in neonatal mice, producing a boxed warning and a contraindication below 2 years',
        'There are insufficient data on GC-C intestinal expression below 2 years of age to assess the risk, which the label states rather than infers',
      ],
      realWorldOutcome: [
        'Approved 30 August 2012 under NDA 202811; still brand-only, at US$9.02 a capsule at pharmacy acquisition cost — on the order of three thousand dollars a year',
        'Paediatric indications extended down to 7 years for IBS-C and 2 years for functional constipation, the latter beneath the age at which the class sibling is contraindicated',
        'Plecanatide, the other guanylate cyclase-C agonist, contraindicates use below 6 years and advises against it below 18',
        'Every pivotal trial is against placebo; no head-to-head against any laxative has been published',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule containing linaclotide-coated beads, at 72, 145 or 290 mcg, once daily on an empty stomach at least 30 minutes before the first meal',
      description:
        'A peptide taken by mouth that survives to act on the surface it is passing over and is then destroyed. Minimally absorbed with negligible systemic availability — plasma concentrations are below the limit of quantitation at every approved dose, and standard pharmacokinetic parameters cannot be calculated. Metabolised in the gastrointestinal tract to its principal active metabolite by loss of the terminal tyrosine. Dosing after a high-fat breakfast produces looser stools and higher stool frequency than fasted dosing.',
      safetyProfile:
        'Boxed warning: risk of serious dehydration in patients less than 2 years of age, in whom the drug is contraindicated — a single clinically relevant adult oral dose caused deaths from dehydration in neonatal mice through age-dependent elevated GC-C agonism. Also contraindicated in known or suspected mechanical gastrointestinal obstruction. Diarrhoea is the most common adverse reaction, 20% against 3% on placebo in the pooled adult trials, severe in 2%; the label directs suspending dosing and rehydrating if severe diarrhoea occurs. Other adverse reactions at 2% or more: abdominal pain 7% against 5%, flatulence 4% against 2%, abdominal distension 2% against 1%, viral gastroenteritis 3% against 1%, headache 4% against 3%. In children 7 to 17 with IBS-C, diarrhoea was reported in 7% and 8% of the two dose groups.',
    },
    commonQuestions: [
      {
        q: 'How much does linaclotide actually help?',
        a: 'Enough to meet a demanding endpoint, and less than the description usually implies. In the two chronic constipation trials, the proportion reaching three or more complete spontaneous bowel movements a week with an increase of at least one, for at least nine of twelve weeks, was 20% against 3% on placebo in one trial and 15% against 6% in the other. Those are absolute differences of 17 and 10 percentage points — roughly one additional responder for every six and every ten people treated. In irritable bowel syndrome the combined pain-and-bowel endpoint was met by 12% against 5% and 13% against 3%, differences of 7 and 10 points, or about one extra responder for every fourteen and every ten. The endpoints are prespecified, strict and collected on daily diaries, which is why these numbers are trustworthy and also why they are smaller than the ones people remember.',
        auditNote:
          'A strict composite endpoint produces small responder proportions in both arms. That is a feature, not a flaw — but it means the headline percentages cannot be read as "one in five people are fixed".',
      },
      {
        q: 'Why does it give people diarrhoea?',
        a: 'Because diarrhoea is the mechanism, past the point where it is useful. Linaclotide switches on a receptor that makes the intestine secrete chloride and water into the lumen. Slightly more fluid is a softer stool; substantially more fluid is diarrhoea. There is no separating them pharmacologically. In the pooled adult irritable bowel trials, diarrhoea occurred in 20% of patients against 3% on placebo, and severe diarrhoea in 2%. Set that beside the efficacy: the excess diarrhoea rate is 17 percentage points and the excess combined-responder rate in the same trials was 7 and 10. Both figures are in the same label, a few pages apart. The label’s instruction if diarrhoea becomes severe is to stop the drug and rehydrate.',
      },
      {
        q: 'Is it better than a cheap laxative?',
        a: 'Nobody has tested that. Every pivotal trial of linaclotide is against placebo. Patients in them were allowed to keep taking stable doses of bulk laxatives or stool softeners, but were not allowed laxatives, bismuth, prokinetic agents or other constipation drugs — so what was measured is an effect on top of fibre and instead of anything stronger. Polyethylene glycol is the standard first-line treatment for chronic constipation, costs pennies, and has never been run head to head against linaclotide, which costs about nine dollars a capsule at pharmacy acquisition cost. That is a genuine gap in the evidence rather than a rhetorical point: the question of whether this drug earns its price against the alternative has not been asked in a randomised trial.',
      },
      {
        q: 'Why is there a warning about children under two?',
        a: 'Because in newborn mice, a single dose equivalent to an ordinary adult dose killed them by dehydration. The label explains the mechanism: in neonatal mice — roughly equivalent to human age 0 to 28 days — linaclotide caused a large increase in fluid secretion because guanylate cyclase-C signalling is more active at that age, and mortality followed within 24 hours. It then adds an unusually honest sentence: a clinical study in children aged 2 to under 18 found no age-dependent trend in intestinal GC-C expression, but there are insufficient data below 2 years to assess the risk. So the boundary is drawn where the data stop, not where a harm was observed in humans. For comparison, plecanatide — the only other drug in this class — is contraindicated below 6 years and its label advises against use below 18.',
      },
      {
        q: 'Should I take a higher dose if it is not working?',
        a: 'There is no higher dose that has been shown to work better. The label states that in the chronic constipation trials, 290 mcg did not consistently offer additional clinically meaningful benefit over the 145 mcg dose, which is why 145 mcg is the recommended dose. The paediatric trial found the same thing: patients were randomised between 145 mcg and a higher than recommended dosage, and the higher group showed no additional benefit. That pattern is what you would expect if the receptor is already saturated at the lower dose. The practical consequence is that this drug has no escalation path — if the standard dose is not enough, the answer is a different approach rather than more of the same.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'LINZESS (linaclotide) United States prescribing information — Boxed Warning, Indications 1, Contraindications 4, Warnings and Precautions 5.1 and 5.2, Adverse Reactions 6.1 Table 1, Description 11, Clinical Pharmacology 12.1-12.3, Clinical Studies 14.1-14.3 Tables 3, 4, 6 and 7 (NDA 202811, openFDA drug/label record)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22LINZESS%22&limit=1',
        kind: 'regulatory',
      },
      {
        label:
          'ClinicalTrials.gov NCT00948818 — Trial of Linaclotide Administered to Patients With Irritable Bowel Syndrome With Constipation (label Trial 1), 803 enrolled',
        identifier: 'NCT00948818',
        kind: 'nct',
      },
      {
        label:
          'ClinicalTrials.gov NCT00938717 — Trial of Linaclotide in Patients With Irritable Bowel Syndrome With Constipation (label Trial 2), 805 enrolled',
        identifier: 'NCT00938717',
        kind: 'nct',
      },
      {
        label:
          'ClinicalTrials.gov NCT04026113 — Linaclotide Safety and Efficacy in Pediatric Participants, 6 to 17 Years of Age, With IBS-C or Functional Constipation (label Trial 8), 438 enrolled',
        identifier: 'NCT04026113',
        kind: 'nct',
      },
      {
        label:
          'TRULANCE (plecanatide) United States prescribing information — Boxed Warning and Indications (NDA 208745, openFDA drug/label record)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22TRULANCE%22&limit=1',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA — LINZESS (linaclotide), NDA 202811, AbbVie, original approval 30 August 2012',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=202811',
        kind: 'regulatory',
      },
      {
        label:
          'Kamm MA, Mueller-Lissner S, Wald A, Richter E, Swallow R, Gessner U. Oral bisacodyl is effective and well-tolerated in patients with chronic constipation. Clin Gastroenterol Hepatol 2011;9(7):577-583 — the laxative comparison linaclotide has never been tested against',
        identifier: '10.1016/j.cgh.2011.03.026',
        kind: 'doi',
      },
      {
        label:
          'Lee-Robichaud H, Thomas K, Morgan J, Nelson RL. Lactulose versus polyethylene glycol for chronic constipation. Cochrane Database Syst Rev 2010;7:CD007570',
        identifier: '10.1002/14651858.CD007570.pub2',
        kind: 'doi',
      },
      {
        label:
          'Ford AC, Talley NJ, Spiegel BM, et al. Effect of fibre, antispasmodics, and peppermint oil in the treatment of irritable bowel syndrome: systematic review and meta-analysis. BMJ 2008;337:a2313',
        identifier: '10.1136/bmj.a2313',
        kind: 'doi',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
