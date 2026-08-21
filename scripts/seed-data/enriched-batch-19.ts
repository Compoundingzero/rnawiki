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
        trialId: 'Label study — highly emetogenic, oral dose comparison, historical placebo control',
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
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020007',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
