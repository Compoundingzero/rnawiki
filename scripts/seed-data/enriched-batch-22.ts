import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the opioids. The molecules at the top of every dispensing table in
 * the world, with two centuries of literature behind them, and a class in which the interesting
 * question has never been whether they work but what exactly was measured, over what period, and
 * what was claimed on top of it.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade names, sponsor,
 * approval year, SMILES, molecular weight — are copied from the enriched record rather than
 * researched again.
 *
 * Every DOI, PMID, NCT number and FDA application number below was resolved against the NCBI
 * E-utilities, the ClinicalTrials.gov registry, the openFDA label endpoint or a United States
 * Department of Justice release at the time of writing. Sample sizes, effect sizes, confidence
 * intervals and p-values are copied from the published abstract or the FDA label, never from
 * memory. Where a number could not be sourced, the field is absent.
 *
 * Six conventions apply to the whole group.
 *
 * 1. THE ACUTE EVIDENCE AND THE CHRONIC EVIDENCE ARE DIFFERENT EVIDENCE, AND EVERY PAGE SEPARATES
 *    THEM. That a milligram of morphine relieves pain over the next four hours is one of the most
 *    replicated findings in medicine. That taking it every day for a year leaves a person better
 *    off than not taking it is a different claim, tested far less, and where it has been tested
 *    head to head against non-opioid medicines — SPACE, 240 patients, twelve months — it failed.
 *
 * 2. AN EQUIANALGESIC TABLE IS AN INFERENCE. The conversion ratios printed in every hospital
 *    handbook derive largely from single-dose crossover studies in opioid-naive volunteers, and
 *    they are applied to tolerant patients switching between drugs at steady state. Every page
 *    that quotes a potency ratio says where the ratio came from.
 *
 * 3. ABUSE-DETERRENT IS A FORMULATION PROPERTY, NOT AN OUTCOME. The FDA-approved abuse-deterrent
 *    labelling on these products describes in vitro manipulation studies and drug-liking scores in
 *    recreational users. It does not describe a measured fall in addiction, overdose or death.
 *    Two of these molecules have the counter-evidence on their own page.
 *
 * 4. PRICING IS A PRICE, NOT A COST. Every price here is the CMS National Average Drug Acquisition
 *    Cost — what a United States retail pharmacy pays a wholesaler — and is labelled as such.
 *    `synthesisCostPerDose` is empty on every dossier in this file: the cost-of-production
 *    literature publishes a method and an aggregate, and its per-molecule opioid figures sit in a
 *    supplementary appendix that could not be resolved and verified at the time of writing. An
 *    unverified cost is worse than an absent one.
 *
 * 5. NO DOSING, TITRATION, TAPERING, CONVERSION OR PROCUREMENT GUIDANCE. Strengths and schedules
 *    appear only where they are part of a trial’s description, a regulatory action, or a product’s
 *    identity. Nothing here tells a reader what to take, how much, or how to come off it.
 *
 * 6. THE MOST INSTRUCTIVE RECORD IN THIS GROUP IS A FIVE-SENTENCE LETTER. Porter and Jick’s 1980
 *    paragraph in the New England Journal of Medicine counted four addictions among 11,882
 *    hospital inpatients given a narcotic, and was then cited 608 times — 72.2% of them as
 *    evidence that addiction is rare in opioid-treated patients, and 80.8% of those without
 *    mentioning that every patient in it was an inpatient. That story is on the oxycodone page
 *    because it is the clearest demonstration in modern medicine of an inference outrunning its
 *    measurement.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group. It publishes an estimation method over 148 medicines and an aggregate result; its per-molecule opioid figures are in a supplementary appendix that could not be resolved at the time of writing, so no per-dose cost is stated on these pages',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_22_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Oxycodone — the molecule whose reformulation was approved on drug-liking scores in thirty
  //    recreational users, and whose twelve-month trial against paracetamol and ibuprofen it lost.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'oxycodone',
    name: 'Oxycodone',
    tradeName: 'OxyContin / Roxicodone / Xtampza ER / RoxyBond / Oxaydo',
    sponsor:
      'Endo Operations (holder on the enriched record); OxyContin was developed and marketed by Purdue Pharma L.P. under NDA 020553 and the molecule is now made by dozens of generic manufacturers',
    targetGene: 'OPRM1',
    targetProtein:
      'Mu-opioid receptor, a Gi/o-coupled seven-transmembrane receptor; oxycodone is a full agonist at it, with weaker activity at kappa and delta receptors',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1950,
    indication:
      'Management of pain severe enough to require an opioid analgesic and for which alternative treatments are inadequate. The extended-release product is indicated for the management of severe and persistent pain requiring an opioid analgesic that cannot be adequately treated with alternative options including immediate-release opioids, in adults and in opioid-tolerant children aged 11 and over, and is not indicated as an as-needed analgesic.',
    patientFriendlyIndication:
      'Pain severe enough to need an opioid, when other treatments have not worked',
    anatomicalSite:
      'Mu-opioid receptors on the presynaptic terminals of the spinal dorsal horn and in the periaqueductal grey and rostral ventromedial medulla; and the same receptor in the pre-Bötzinger complex of the brainstem, which is why the drug that stops pain also stops breathing',
    conditionContext: {
      conditionExplainer:
        'Pain is a signal, and an opioid does not repair whatever is generating it. It changes how the signal is carried and how much it matters to the person carrying it. That distinction is the whole subject: for a broken bone or the first day after surgery, changing the signal for a few hours is exactly the right intervention; for a back that has hurt for five years, it is a different proposition that has to be judged on different evidence.',
      whyItMatters:
        'Oxycodone is the molecule around which the modern opioid crisis was built. The commercial story and the pharmacological story are not the same story, and separating them is the point of this page: the drug does relieve acute pain, the claims made for it about long-term use and abuse resistance were tested and did not hold, and both facts are on the record.',
      whoTakesThis:
        'People after surgery or serious injury; people with cancer pain; and a large population with long-term non-cancer pain, which is the use with the weakest trial evidence and the strongest promotional history.',
      clinicalGoals:
        'Less pain. Whether it also produces less disability, better function or a better life over months is a separate question, and the one randomised trial that asked it over twelve months against non-opioid medicines answered no.',
    },
    oneSentenceVerdict:
      'A full mu-opioid receptor agonist whose short-term analgesia is among the most replicated findings in medicine and whose long-term case collapsed under testing: in the 240-patient SPACE trial it did not beat paracetamol and anti-inflammatories on pain-related function over twelve months (BPI interference 3.4 against 3.3, overall p=0.58), left patients in slightly more pain (4.0 against 3.5, p=0.03) and with twice the medication side effects (1.8 against 0.9, p=0.03).',
    laymanHowItWorks:
      'Oxycodone binds the mu-opioid receptor, the same switch the body’s own endorphins use. Where a pain signal enters the spinal cord, the receptor quietens the nerve that would pass it upward; in the brainstem it turns up a descending system that suppresses the signal from above; and in the limbic system it changes how unpleasant the remaining pain feels. Those are three separate effects and the third one — pain that is still there but no longer bothers you — is also the effect that makes the drug pleasurable and habit-forming. The same receptor in the breathing centre of the brainstem is what makes an overdose fatal: it does not raise the alarm when carbon dioxide builds up, and a person stops breathing.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1974 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 193 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Oxycodone was first synthesised in 1916 and the molecule has never been under patent in any modern sense. The patents that mattered were on the OxyContin controlled-release matrix and then on its 2010 abuse-deterrent replacement — formulation patents on a public-domain drug, which is the commercial structure that made a two-cent alkaloid into a multi-billion-dollar franchise. Purdue Pharma reported OxyContin sales of about US$48 million in 1996 and about US$1.1 billion in 2000.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The honest comparison depends entirely on the timescale. For a single dose after surgery, the Cochrane overview of 39 reviews found no evidence of an analgesic effect for oxycodone 5 mg at all, while ibuprofen 200 mg plus paracetamol 500 mg had a number-needed-to-treat of 1.6 — the best result in the whole table, from two drugs sold without a prescription for a twentieth of the price. For pain lasting months, SPACE compared exactly these options over a year and the non-opioid arm did not lose. That is the comparison that matters and it is not close on cost.',
      conventionalRx: [
        {
          name: 'Ibuprofen plus paracetamol (acetaminophen), taken together',
          class: 'Non-steroidal anti-inflammatory drug plus a centrally acting analgesic',
          howItCompares:
            'In the Cochrane overview of single-dose oral analgesics for acute postoperative pain, ibuprofen 200 mg plus paracetamol 500 mg gave a number-needed-to-treat of 1.6 (95% CI 1.5 to 1.8) for at least 50% pain relief over four to six hours — the lowest NNT of 53 drug-and-dose pairs. Oxycodone 5 mg appears in the same table under "no evidence of analgesic effect". Neither of these drugs causes respiratory depression or dependence.',
          typicalCost:
            'US$0.0391 per ibuprofen tablet and US$0.0349 per paracetamol tablet at United States pharmacy acquisition cost (CMS NADAC, medians across 244 and 170 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: better measured single-dose analgesia at about a fifth of the price, no controlled-substance status, no respiratory risk. Cons: the NSAID half carries gastrointestinal, renal and cardiovascular risk on repeated use, paracetamol is the leading cause of acute liver failure in overdose, and neither is an option for the pain of a fractured femur in the first hour.',
        },
        {
          name: 'Morphine, immediate release',
          class: 'Full mu-opioid agonist',
          howItCompares:
            'The reference opioid, on the WHO Model List of Essential Medicines, with no commercial sponsor and no promotional history. Trials that compared oral oxycodone to oral morphine in cancer pain have generally found them equivalent; the case for oxycodone over morphine has always rested on tolerability arguments rather than a superiority trial.',
          typicalCost:
            'US$0.4096 per millilitre of oral solution at United States pharmacy acquisition cost (CMS NADAC, median across 75 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: the same class effect with the longest safety record and no formulation patent to defend. Cons: identical addiction, dependence and respiratory risk; the active metabolite morphine-6-glucuronide accumulates in kidney impairment, where oxycodone is somewhat easier to handle.',
        },
        {
          name: 'Duloxetine',
          class: 'Serotonin-noradrenaline reuptake inhibitor',
          howItCompares:
            'One of the non-opioid options available in the SPACE trial’s step-wise protocol, which as a whole was not beaten by the opioid arm over twelve months. It acts on the descending inhibitory pathway rather than on the opioid receptor, so it does not produce tolerance, euphoria or respiratory depression.',
          typicalCost:
            'US$0.1293 per capsule at United States pharmacy acquisition cost (CMS NADAC, median across 74 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no controlled-substance status, no overdose respiratory risk, evidence in osteoarthritis and neuropathic pain. Cons: takes weeks to work, useless in acute pain, and has its own discontinuation syndrome.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Keep it locked, and know that one tablet can kill a child',
          action: 'Store it where a child cannot reach it and dispose of what is left over.',
          patientImpact:
            'The boxed warning states that accidental ingestion of even one dose of OXYCONTIN, especially by a child, can result in a fatal overdose of oxycodone.',
          clinicalPrecaution:
            'This is a label statement about the extended-release product specifically, where a single tablet holds up to twelve hours of drug.',
        },
        {
          name: 'Never with a benzodiazepine, never with alcohol',
          action:
            'Tell the prescriber about every sedative, sleeping tablet, muscle relaxant and drink.',
          patientImpact:
            'The boxed warning states that concomitant use of opioids with benzodiazepines or other central nervous system depressants, including alcohol, may result in profound sedation, respiratory depression, coma and death.',
          clinicalPrecaution:
            'The label directs that such concomitant prescribing be reserved for patients in whom alternative treatment options are inadequate.',
        },
        {
          name: 'Ask about the grapefruit and the antifungals',
          action:
            'Mention any azole antifungal, macrolide antibiotic or protease inhibitor, and any recent stopping of one.',
          patientImpact:
            'A boxed warning covers cytochrome P450 3A4 interaction: all CYP3A4 inhibitors may raise oxycodone concentrations and prolong adverse effects, potentially causing fatal respiratory depression, and stopping a concomitant CYP3A4 inducer can do the same.',
          clinicalPrecaution:
            'The label directs regular re-evaluation of any patient taking oxycodone with a CYP3A4 inhibitor or inducer.',
        },
        {
          name: 'Whole, not crushed',
          action: 'Swallow an extended-release tablet whole.',
          patientImpact:
            'The boxed warning instructs patients to swallow tablets whole, because crushing, chewing or dissolving them can cause rapid release and absorption of a potentially fatal dose.',
          clinicalPrecaution:
            'The abuse-deterrent matrix makes this harder, not impossible; the label says so in its own summary.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1CC[C@]23[C@@H]4C(=O)CC[C@]2([C@H]1CC5=C3C(=C(C=C5)OC)O4)O',
      chemicalFormula: 'C18H21NO4',
      molecularWeight: '315.40 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'A semi-synthetic 14-hydroxy derivative of thebaine, differing from morphine by a 3-methyl ether, a 6-keto group and a 14-hydroxyl. Full agonist at the mu-opioid receptor; the 3-methyl ether is removed by CYP2D6 to oxymorphone, a far more potent agonist, and the N-methyl group is removed by CYP3A4 to noroxycodone, which is much less active. Both enzymes appear in the product’s boxed warning because both change how much active drug a given tablet produces.',
      structureSource: {
        label:
          'PubChem CID 5284603 (oxycodone) — canonical SMILES, molecular formula and weight, as carried on the enriched record and machine-verified by the RNAwiki structure engine',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284603',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'oxy-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identify the thebaine starting material and its alkaloid neighbours',
          description:
            'Oxycodone is made from thebaine, an opium poppy alkaloid that arrives as a botanical extract rather than a synthetic feedstock. The impurity profile therefore depends on the harvest, and the neighbouring alkaloids — codeine, morphine, oripavine — are themselves controlled substances. Establishing what is in the input is a regulatory obligation before it is an analytical one.',
          reagentsAndBuffer:
            'Thebaine or concentrate of poppy straw reference standards, reversed-phase HPLC with diode-array detection, LC-MS/MS for trace alkaloid profiling, Karl Fischer titration for water content',
        },
        {
          id: 'oxy-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Oxidise thebaine to 14-hydroxycodeinone, then reduce the 7,8-double bond',
          description:
            'Peracid oxidation of thebaine gives 14-hydroxycodeinone; catalytic hydrogenation of the 7,8-alkene then gives oxycodone. The intermediate is the reason this synthesis is watched: 14-hydroxycodeinone is a genotoxic alpha,beta-unsaturated ketone and regulators set a specified limit on it in the finished drug substance, so the hydrogenation has to be driven essentially to completion.',
          dependsOnStepId: 'oxy-w1',
          reagentsAndBuffer:
            'Peracetic or m-chloroperbenzoic acid in acetic acid, palladium on carbon under hydrogen, controlled temperature and pressure, in-process HPLC monitoring of residual 14-hydroxycodeinone',
        },
        {
          id: 'oxy-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the hydrochloride and release against the 14-hydroxycodeinone limit',
          description:
            'Form and recrystallise oxycodone hydrochloride, then release the batch against a specified limit for 14-hydroxycodeinone and for residual thebaine. This is the step where the difference between a compliant batch and a rejected one is a few parts per million of a single impurity.',
          dependsOnStepId: 'oxy-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol or ethanol, activated carbon treatment, recrystallisation from aqueous ethanol, HPLC release assay with a validated impurity method',
        },
        {
          id: 'oxy-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure agonism at mu, kappa and delta separately, and against the metabolite',
          description:
            'Run oxycodone and oxymorphone as separate test articles against human mu, kappa and delta receptors. Testing the parent alone misstates the pharmacology in anyone with fast CYP2D6, because the metabolite is a substantially more potent agonist than the drug given.',
          dependsOnStepId: 'oxy-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human OPRM1, OPRK1 or OPRD1, [35S]GTPgammaS binding or cyclic AMP inhibition readout, DAMGO as reference mu agonist, naloxone as antagonist control, oxymorphone as a separate test article',
        },
        {
          id: 'oxy-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Test the abuse-deterrent matrix against the route people actually use',
          description:
            'The in vitro package that supports abuse-deterrent labelling measures resistance to crushing, dissolution and syringe passage. It does not measure oral abuse, and the label says the formulation has not been shown to prevent it. An assay that tests rather than assumes the claim has to include simple oral dose-dumping in ethanol alongside the needle and grinder work.',
          dependsOnStepId: 'oxy-w4',
          reagentsAndBuffer:
            'USP dissolution apparatus in 0.1 N hydrochloric acid and in 4%, 20% and 40% ethanol, household and laboratory grinding tools, a panel of aqueous and organic solvents, syringeability testing through 21- to 27-gauge needles, HPLC quantification of extracted oxycodone',
        },
      ],
    },
    keyAudits: [
      {
        id: 'oxy-a1',
        category: 'failed',
        title: 'Twelve months against paracetamol and ibuprofen, and it did not win',
        laymanSummary:
          'The only randomised trial to run opioids against ordinary painkillers for a full year, in people with chronic back or knee or hip pain, found no advantage in function, slightly worse pain on the opioid, and twice as many side effects.',
        technicalDetails:
          'SPACE was a pragmatic 12-month randomised trial with masked outcome assessment in Veterans Affairs primary care. Of 265 patients enrolled, 240 were randomised (mean age 58.3, 13.0% women) and 234 (97.5%) completed. Both arms followed a treat-to-target strategy with three medication steps; the opioid arm started with immediate-release morphine, oxycodone or hydrocodone/paracetamol, the non-opioid arm with paracetamol or an NSAID. The primary outcome, Brief Pain Inventory interference over 12 months, did not differ (overall p=0.58); mean 12-month BPI interference was 3.4 opioid against 3.3 non-opioid (difference 0.1, 95% CI −0.5 to 0.7). Pain intensity was significantly better in the non-opioid group (overall p=0.03): mean 12-month BPI severity 4.0 against 3.5 (difference 0.5, 95% CI 0.0 to 1.0). Adverse medication-related symptoms were more common on opioids (overall p=0.03): 1.8 against 0.9 at 12 months (difference 0.9, 95% CI 0.3 to 1.5). The authors concluded that the results do not support initiation of opioid therapy for moderate to severe chronic back pain or hip or knee osteoarthritis pain.',
        evidenceSource:
          'Krebs EE, Gravely A, Nugent S, et al. Effect of Opioid vs Nonopioid Medications on Pain-Related Function in Patients With Chronic Back Pain or Hip or Knee Osteoarthritis Pain: The SPACE Randomized Clinical Trial. JAMA 2018;319(9):872-882 (NCT01583985)',
        doi: '10.1001/jama.2018.0899',
        measuredMetric:
          'Brief Pain Inventory interference over 12 months, opioid against non-opioid stepped therapy',
        auditFlag: 'verified',
      },
      {
        id: 'oxy-a2',
        category: 'conclusion_shift',
        title: 'The abuse-liability sentence that was approved in 1995 and deleted in 2001',
        laymanSummary:
          'The original OxyContin label said the slow-release design was believed to make the drug less abusable. That sentence was approved on a belief, used as the centrepiece of the marketing, and removed by the regulator six years later. The company later pleaded guilty to a felony for the claim.',
        technicalDetails:
          'The 1995 approval of OxyContin under NDA 020553 carried labelling stating that delayed absorption, as provided by OxyContin tablets, is believed to reduce the abuse liability of a drug. Van Zee’s account in the American Journal of Public Health records that the 1996 labelling also described iatrogenic addiction as very rare when opioids are legitimately used, that in July 2001 the label was revised to state that the data were insufficient to establish the true incidence of addiction, and that the reduced-abuse-liability sentence was removed. On 10 May 2007 The Purdue Frederick Company pleaded guilty to felony misbranding of OxyContin with intent to defraud and mislead, and three executives pleaded guilty to misdemeanour misbranding; the total paid was US$634,515,475. On 21 October 2020 Purdue Pharma L.P. pleaded guilty to three further federal felonies — one dual-object conspiracy to defraud the United States and violate the Food, Drug and Cosmetic Act and two anti-kickback conspiracies — agreeing to a US$3.544 billion criminal fine and US$2 billion in criminal forfeiture.',
        evidenceSource:
          'Van Zee A. The Promotion and Marketing of OxyContin: Commercial Triumph, Public Health Tragedy. Am J Public Health 2009;99(2):221-227; United States Department of Justice release, Opioid Manufacturer Purdue Pharma Pleads Guilty to Fraud and Kickback Conspiracies, 21 October 2020',
        doi: '10.2105/AJPH.2007.131714',
        inferredClaim:
          'That a controlled-release matrix reduces the abuse liability of the drug inside it — approved into a label as a belief in 1995, deleted in 2001, and the subject of two federal guilty pleas',
        auditFlag: 'retracted',
      },
      {
        id: 'oxy-a3',
        category: 'failed',
        title: 'The abuse-deterrent reformulation, in its own label’s numbers',
        laymanSummary:
          'The 2010 crush-resistant OxyContin is described as abuse-deterrent. In the study on the label, 44% of the recreational users who snorted it liked it exactly as much as ordinary oxycodone powder, and the label states plainly that abuse by mouth is still possible.',
        technicalDetails:
          'Section 9.2 of the current OXYCONTIN prescribing information describes a randomised, double-blind, placebo-controlled five-period crossover study in 30 recreational opioid users with a history of intranasal abuse, of whom 27 completed. Against powdered oxycodone hydrochloride, approximately 44% (n=12) had no reduction in drug liking with the reformulated product; 33% (n=9) had a reduction of at least 30% and 22% (n=6) a reduction of at least 50%. The label’s own summary reads: the in vitro data demonstrate physicochemical properties expected to make abuse via injection difficult, and the clinical data indicate properties expected to reduce abuse via the intranasal route, "However, abuse of OXYCONTIN by these routes, as well as by the oral route, is still possible." The population-level consequence was measured independently: Evans, Lieber and Power found that opioid consumption stopped rising in August 2010, heroin deaths began climbing the following month, growth in heroin deaths was greater where pre-reformulation access to heroin and opioids was greater, and the reformulation produced no reduction in combined heroin and opioid mortality — each prevented opioid death was replaced by a heroin death.',
        evidenceSource:
          'OXYCONTIN United States prescribing information, section 9.2 Abuse Deterrence Studies (NDA 022272); Evans WN, Lieber EMJ, Power P. How the Reformulation of OxyContin Ignited the Heroin Epidemic. Rev Econ Stat 2019;101(1):1-15',
        doi: '10.1162/rest_a_00755',
        measuredMetric:
          'Maximum drug-liking score after intranasal administration in 27 recreational opioid users, and national heroin mortality before and after August 2010',
        auditFlag: 'caution',
      },
      {
        id: 'oxy-a4',
        category: 'inferred',
        title:
          'The "less than one percent" figure came from a five-sentence letter about inpatients',
        laymanSummary:
          'The claim that fewer than one in a hundred pain patients become addicted traces back to a 1980 letter counting four addictions among about twelve thousand hospital inpatients given a narcotic. It was cited 608 times, mostly as proof that addiction is rare, and four out of five of those citations never mentioned that everyone in it was in a hospital bed.',
        technicalDetails:
          'Porter and Jick’s 1980 correspondence in the New England Journal of Medicine reported that among 39,946 hospitalised medical patients monitored, 11,882 received at least one narcotic preparation and there were four reasonably well documented cases of addiction, only one of which was major. Leung and colleagues analysed its citation record through 30 March 2017: 608 citations, of which 72.2% used it as evidence that addiction is rare in patients treated with opioids and 80.8% did not note that the patients described were inpatients. Van Zee records separately that Purdue trained its sales representatives to carry the message that the risk of addiction was less than one percent, that the sales force grew from 318 representatives in 1996 to 671 in 2000, and that more than 5,000 physicians, pharmacists and nurses attended all-expenses-paid pain-management symposia between 1996 and 2001. The measurement — a chart audit of short inpatient exposure — cannot support the inference it was used for, which is about years of outpatient prescribing.',
        evidenceSource:
          'Porter J, Jick H. Addiction rare in patients treated with narcotics. N Engl J Med 1980;302(2):123; Leung PTM, Macdonald EM, Stanbrook MB, Dhalla IA, Juurlink DN. A 1980 Letter on the Risk of Opioid Addiction. N Engl J Med 2017;376(22):2194-2195',
        doi: '10.1056/NEJMc1700150',
        inferredClaim:
          'That fewer than 1% of patients treated with opioids for pain become addicted — a claim derived from four cases among hospitalised inpatients and applied to years of outpatient prescribing',
        auditFlag: 'contested',
      },
      {
        id: 'oxy-a5',
        category: 'measured',
        title: 'In a single dose after surgery, two over-the-counter tablets measured better',
        laymanSummary:
          'The Cochrane overview of single-dose painkillers after surgery ranked 53 drug-and-dose pairs. Ibuprofen plus paracetamol came top. Oxycodone 5 mg is listed under the drugs with no evidence of an analgesic effect.',
        technicalDetails:
          'Moore and colleagues combined 39 Cochrane reviews of single-dose oral analgesics in acute postoperative pain, producing numbers-needed-to-treat for at least 50% maximum pain relief over four to six hours for 53 drug and dose pairs. NNTs ranged from about 1.5 to 20. The best results were ibuprofen 200 mg plus paracetamol 500 mg (NNT 1.6, 95% CI 1.5 to 1.8), fast-acting ibuprofen 200 mg (2.1, 1.9 to 2.3), ibuprofen 200 mg plus caffeine 100 mg (2.1, 1.9 to 3.1), diclofenac potassium 50 mg (2.1, 1.9 to 2.5) and etoricoxib 120 mg (1.8, 1.7 to 2.0); ibuprofen acid 400 mg had an NNT of 2.5. The review states there was no evidence of analgesic effect for aceclofenac 150 mg, aspirin 500 mg and oxycodone 5 mg, on low-quality evidence. Paracetamol 650 mg plus oxycodone 10 mg does appear among the combinations with a long duration of action of eight hours or more, so the finding is dose-specific and not a claim that oxycodone does nothing.',
        evidenceSource:
          'Moore RA, Derry S, Aldington D, Wiffen PJ. Single dose oral analgesics for acute postoperative pain in adults — an overview of Cochrane reviews. Cochrane Database Syst Rev 2015;(9):CD008659',
        doi: '10.1002/14651858.CD008659.pub3',
        measuredMetric:
          'Number needed to treat for at least 50% maximum pain relief over four to six hours after surgery',
        auditFlag: 'verified',
      },
      {
        id: 'oxy-a6',
        category: 'measured',
        title: 'Two liver enzymes decide how much drug a tablet actually delivers',
        laymanSummary:
          'Oxycodone is partly converted by the liver into a much stronger opioid, and partly destroyed by a second enzyme. Common medicines block or accelerate the second enzyme, and the label carries a boxed warning about it.',
        technicalDetails:
          'Oxycodone is O-demethylated by CYP2D6 to oxymorphone, a substantially more potent mu agonist, and N-demethylated by CYP3A4 to the much weaker noroxycodone. The OXYCONTIN label carries a boxed warning stating that concomitant use with all CYP3A4 inhibitors may increase oxycodone plasma concentrations, which could increase or prolong adverse drug effects and may cause potentially fatal respiratory depression, and that discontinuation of a concomitantly used CYP3A4 inducer may do the same; it directs regular evaluation of any patient on either. The clinical consequence is that the dose written on the prescription is not the exposure delivered, and the size of the gap depends on inherited CYP2D6 activity and on whatever else the person is taking.',
        evidenceSource:
          'OXYCONTIN United States prescribing information, boxed warning and Clinical Pharmacology 12.3 (NDA 022272)',
        measuredMetric:
          'Oxycodone plasma exposure as a function of CYP3A4 inhibition or induction, from the label’s drug interaction section',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A tablet, and a matrix designed to be hard to break',
        laymanDesc:
          'Immediate-release oxycodone works within an hour. The extended-release tablet holds the drug in a plastic-like matrix that turns to gel in water, so it is hard to crush or inject — which is not the same as hard to abuse.',
        molecularDetail:
          'The current OXYCONTIN matrix uses high-molecular-weight polyethylene oxide, which resists crushing and forms a viscous hydrogel resisting passage through a needle. The label’s section 9.2 states these properties are expected to make injection difficult and to reduce intranasal abuse, and that abuse by these routes and by the oral route is still possible.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver turns some of it into something stronger',
        laymanDesc:
          'Before it acts, the drug passes the liver, where one enzyme converts a fraction of it into a considerably more powerful opioid and another enzyme destroys most of the rest. How much of each you have is partly inherited and partly decided by your other medicines.',
        molecularDetail:
          'CYP2D6 O-demethylates oxycodone to oxymorphone; CYP3A4 N-demethylates it to noroxycodone, which is far less active. CYP3A4 inhibition or the withdrawal of a CYP3A4 inducer raises oxycodone concentrations, which the label’s boxed warning names as a route to fatal respiratory depression.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It sits on the mu receptor, the endorphin switch',
        laymanDesc:
          'Oxycodone binds the same receptor the body’s own endorphins use, and turns it fully on rather than partly on.',
        molecularDetail:
          'Full agonism at the mu-opioid receptor, a Gi/o-coupled seven-transmembrane receptor, with weaker kappa and delta activity. Agonism inhibits adenylyl cyclase, opens G-protein-coupled inwardly rectifying potassium channels and closes voltage-gated calcium channels, hyperpolarising the neuron and reducing transmitter release.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Three different places, three different effects',
        laymanDesc:
          'In the spinal cord it blocks the pain signal from getting through. In the brainstem it turns up the system that suppresses pain from above. In the emotional centres it makes the pain that remains matter less — and that third effect is also the one people come back for.',
        molecularDetail:
          'Presynaptic inhibition of substance P and glutamate release in the dorsal horn; disinhibition of descending inhibitory output from the periaqueductal grey through the rostral ventromedial medulla; and mu agonism in the ventral tegmental area and nucleus accumbens producing the affective and reinforcing component.',
        iconName: 'Network',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The same receptor stops the breathing reflex',
        laymanDesc:
          'The brainstem circuit that senses rising carbon dioxide and makes you breathe carries the same receptor. Enough drug, and it stops sounding the alarm. That is what an overdose is.',
        molecularDetail:
          'Mu agonism in the pre-Bötzinger complex and the parabrachial/Kölliker-Fuse region blunts the hypercapnic ventilatory response. The label’s boxed warning names serious, life-threatening or fatal respiratory depression, and states that concomitant benzodiazepines, other CNS depressants or alcohol may result in profound sedation, respiratory depression, coma and death.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What twelve months of it produced in a trial',
        laymanDesc:
          'In the one year-long randomised comparison against ordinary painkillers, function was no better, pain was slightly worse, and side effects were twice as common.',
        molecularDetail:
          'SPACE, 240 randomised patients: BPI interference 3.4 against 3.3 at 12 months (overall p=0.58); BPI severity 4.0 against 3.5 (overall p=0.03, favouring non-opioid); medication-related symptoms 1.8 against 0.9 (overall p=0.03).',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT01583985 (SPACE, JAMA 2018;319:872-882)',
        phase: 'Pragmatic randomised trial with masked outcome assessment, 12 months',
        sampleSize: 240,
        primaryEndpoint:
          'Brief Pain Inventory interference (pain-related function) over 12 months, opioid against non-opioid stepped medication therapy in chronic back pain or hip or knee osteoarthritis pain',
        endpointMet: false,
        statisticalPValue:
          'Overall p=0.58; mean 12-month BPI interference 3.4 opioid against 3.3 non-opioid (difference 0.1, 95% CI −0.5 to 0.7)',
        unreportedAdverseSignals:
          'Pain intensity was significantly better on non-opioid therapy (BPI severity 4.0 against 3.5, difference 0.5, 95% CI 0.0 to 1.0, overall p=0.03), and adverse medication-related symptoms were twice as common on opioids (1.8 against 0.9, difference 0.9, 95% CI 0.3 to 1.5, overall p=0.03). 234 of 240 patients (97.5%) completed.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'OXYCONTIN intranasal abuse-deterrence crossover study (label section 9.2, NDA 022272)',
        phase: 'Randomised, double-blind, placebo-controlled, five-period crossover',
        sampleSize: 30,
        primaryEndpoint:
          'Maximum drug-liking score on a 0-100 bipolar visual analogue scale after intranasal administration of finely crushed reformulated OXYCONTIN, finely crushed original OxyContin, powdered oxycodone hydrochloride or placebo, in recreational opioid users with a history of intranasal abuse',
        endpointMet: true,
        statisticalPValue:
          'Mean maximum drug liking 80.4 (SE 3.9) for reformulated OXYCONTIN against 94.0 (2.7) for original OxyContin and 89.3 (3.1) for oxycodone powder; take-drug-again 64.0 (7.1) against 89.6 (3.9) and 86.6 (4.4)',
        unreportedAdverseSignals:
          'Twenty-seven of 30 completed. Approximately 44% (n=12) had no reduction in drug liking relative to oxycodone powder at all. Incomplete dosing from granules falling out of the nostril occurred in 34% of subjects with the reformulated product against 7% with the original, which is a delivery difference rather than a pharmacological one. The label states abuse by the intranasal, injection and oral routes is still possible.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No difference in pain-related function against non-opioid stepped therapy over 12 months in 240 randomised patients (BPI interference 3.4 against 3.3, overall p=0.58)',
        'Worse pain intensity on the opioid arm of the same trial (BPI severity 4.0 against 3.5, overall p=0.03)',
        'Twice the medication-related symptoms on the opioid arm (1.8 against 0.9, overall p=0.03)',
        'Mean maximum drug liking of 80.4 for the reformulated tablet against 89.3 for oxycodone powder in 27 recreational intranasal users, with 44% showing no reduction at all',
        'Ibuprofen 200 mg plus paracetamol 500 mg NNT 1.6 for at least 50% postoperative pain relief, against no evidence of analgesic effect for oxycodone 5 mg, in the Cochrane overview of 53 drug-and-dose pairs',
      ],
      unsupportedInferences: [
        'That fewer than 1% of opioid-treated pain patients become addicted — traced to four cases among 11,882 hospital inpatients in a 1980 letter, cited 608 times, 80.8% of those citations omitting that the patients were inpatients',
        'That a controlled-release matrix reduces a drug’s abuse liability — approved into the 1995 label as a belief and deleted in 2001',
        'That abuse-deterrent labelling means fewer overdoses; the labelled studies measure tablet hardness and drug liking, not mortality',
        'That short-term analgesic efficacy licenses indefinite prescribing, which is the inference SPACE was designed to test and did not support',
      ],
      whatFailedInitially: [
        'The primary endpoint of the only 12-month randomised trial against non-opioid medicines',
        'The reduced-abuse-liability labelling claim, removed by the FDA in July 2001',
        'The 2010 abuse-deterrent reformulation at population level: opioid deaths fell and heroin deaths rose to replace them, with no reduction in combined mortality',
        'Oxycodone 5 mg as a single postoperative dose, which the Cochrane overview lists under no evidence of analgesic effect',
      ],
      realWorldOutcome: [
        'The Purdue Frederick Company pleaded guilty to felony misbranding on 10 May 2007; total payments US$634,515,475',
        'Purdue Pharma L.P. pleaded guilty to three further federal felonies on 21 October 2020, agreeing to a US$3.544 billion criminal fine and US$2 billion in forfeiture',
        'OxyContin sales rose from about US$48 million in 1996 to about US$1.1 billion in 2000',
        'The molecule itself now costs about twenty United States cents a tablet at pharmacy acquisition cost, and remains a first-line option for severe acute pain where nothing weaker will do',
      ],
    },
    deliverySystem: {
      type: 'Oral immediate-release tablets, capsules and solution; oral extended-release tablets and capsules; also supplied in fixed combination with paracetamol or aspirin. Schedule II controlled substance in the United States.',
      description:
        'Immediate-release oxycodone acts within about an hour and is dosed several times a day; the extended-release matrix is designed to release over about twelve hours and is explicitly not indicated as an as-needed analgesic. Absorption of the extended-release product is a two-phase process built into the matrix rather than a property of the molecule. The oral bioavailability of oxycodone is high compared with morphine, which is why oral-to-oral potency comparisons between the two do not match their intravenous ratio.',
      safetyProfile:
        'Boxed warnings cover addiction, abuse and misuse at any dose and any duration; life-threatening respiratory depression; fatal overdose from accidental ingestion of a single extended-release tablet, especially by a child; profound sedation, respiratory depression, coma and death with concomitant benzodiazepines, other CNS depressants or alcohol; neonatal opioid withdrawal syndrome after prolonged use in pregnancy; the opioid analgesic REMS; and cytochrome P450 3A4 interaction. The label states that crushing, chewing or dissolving an extended-release tablet can release a potentially fatal dose, and that parenteral abuse risks tissue necrosis, endocarditis, pulmonary granulomas, thrombotic microangiopathy and transmission of hepatitis and HIV.',
    },
    commonQuestions: [
      {
        q: 'Does oxycodone actually work?',
        a: 'For acute pain over hours, yes, and that is not seriously disputed. For pain lasting months, the evidence is much weaker than the prescribing volume suggests. The one randomised trial that ran opioids against non-opioid medicines for a full year in chronic back and knee and hip pain — SPACE, 240 patients — found no difference in pain-related function, slightly worse pain intensity on the opioid, and twice as many medication side effects. Its authors concluded that the results do not support starting opioid therapy for those conditions. Note the shape of the finding: not that opioids do nothing, but that over a year they did not beat paracetamol and anti-inflammatories.',
        auditNote:
          'A drug can be genuinely effective at four hours and produce no measurable advantage at twelve months. Those are two different claims and they need two different trials.',
      },
      {
        q: 'Is the abuse-deterrent version safer?',
        a: 'It is harder to crush and inject, and the label says so. It is not established to reduce abuse, and the label says that too. In the study printed in section 9.2 of the OxyContin label, 30 recreational users with a history of snorting opioids compared the reformulated tablet with plain oxycodone powder: about 44% reported no reduction in drug liking at all. The label’s own summary ends "However, abuse of OXYCONTIN by these routes, as well as by the oral route, is still possible." At population level, the economists Evans, Lieber and Power found that after the August 2010 reformulation, heroin deaths began rising the next month and combined heroin plus opioid mortality did not fall.',
        auditNote:
          'Abuse-deterrent is a claim about the tablet. It is not a claim about the number of people who die, and the labelling standard does not require one.',
      },
      {
        q: 'Where did "less than one percent get addicted" come from?',
        a: 'From a five-sentence letter published in the New England Journal of Medicine in 1980. Porter and Jick reported that among 39,946 monitored hospital inpatients, 11,882 had received at least one narcotic and four had reasonably well documented addiction, only one of it major. It is a chart audit of short courses given to people in hospital beds. Researchers at the University of Toronto tracked its citation record: 608 citations through March 2017, 72.2% using it as evidence that addiction is rare in opioid-treated patients, and 80.8% of those not mentioning that the patients were inpatients. Purdue trained its sales force to carry the under-one-percent message.',
      },
      {
        q: 'How is it different from morphine?',
        a: 'Chemically it is thebaine-derived rather than morphine itself: a 3-methyl ether, a 6-keto group and a 14-hydroxyl. Practically, the differences that matter are that oxycodone is better absorbed by mouth, that a fraction of it is converted by CYP2D6 into oxymorphone which is stronger than the parent, and that it does not produce morphine-6-glucuronide, which accumulates in kidney impairment. It is not a cleaner or less addictive opioid; its boxed warnings are the class warnings, and the label states its abuse liability is similar to that of fentanyl, hydromorphone, methadone, morphine and oxymorphone.',
      },
      {
        q: 'Why does the label warn about antifungals and antibiotics?',
        a: 'Because oxycodone is broken down largely by the liver enzyme CYP3A4, and a long list of ordinary medicines — azole antifungals, macrolide antibiotics, some HIV protease inhibitors — inhibit it. When they do, the same tablet delivers more drug. The boxed warning states that this may cause potentially fatal respiratory depression, and adds the mirror-image case: stopping a drug that had been speeding the enzyme up can raise concentrations just as sharply. It directs regular re-evaluation of anyone taking both.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Krebs EE, Gravely A, Nugent S, et al. Effect of Opioid vs Nonopioid Medications on Pain-Related Function in Patients With Chronic Back Pain or Hip or Knee Osteoarthritis Pain: The SPACE Randomized Clinical Trial. JAMA 2018;319(9):872-882',
        identifier: '10.1001/jama.2018.0899',
        kind: 'doi',
      },
      {
        label: 'SPACE trial registration — ClinicalTrials.gov NCT01583985',
        identifier: 'NCT01583985',
        kind: 'nct',
      },
      {
        label:
          'Moore RA, Derry S, Aldington D, Wiffen PJ. Single dose oral analgesics for acute postoperative pain in adults — an overview of Cochrane reviews. Cochrane Database Syst Rev 2015;(9):CD008659',
        identifier: '10.1002/14651858.CD008659.pub3',
        kind: 'doi',
      },
      {
        label:
          'Leung PTM, Macdonald EM, Stanbrook MB, Dhalla IA, Juurlink DN. A 1980 Letter on the Risk of Opioid Addiction. N Engl J Med 2017;376(22):2194-2195',
        identifier: '10.1056/NEJMc1700150',
        kind: 'doi',
      },
      {
        label:
          'Porter J, Jick H. Addiction rare in patients treated with narcotics. N Engl J Med 1980;302(2):123',
        identifier: '10.1056/NEJM198001103020221',
        kind: 'doi',
      },
      {
        label:
          'Van Zee A. The Promotion and Marketing of OxyContin: Commercial Triumph, Public Health Tragedy. Am J Public Health 2009;99(2):221-227',
        identifier: '10.2105/AJPH.2007.131714',
        kind: 'doi',
      },
      {
        label:
          'Evans WN, Lieber EMJ, Power P. How the Reformulation of OxyContin Ignited the Heroin Epidemic. Review of Economics and Statistics 2019;101(1):1-15',
        identifier: '10.1162/rest_a_00755',
        kind: 'doi',
      },
      {
        label:
          'OXYCONTIN (oxycodone hydrochloride extended-release tablets) United States prescribing information — boxed warning, Indications 1, Drug Abuse and Dependence 9.1 and 9.2 including the abuse-deterrence studies, Clinical Pharmacology 12.3 (NDA 022272)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022272',
        kind: 'regulatory',
      },
      {
        label:
          'United States Department of Justice, Office of Public Affairs. Opioid Manufacturer Purdue Pharma Pleads Guilty to Fraud and Kickback Conspiracies, 21 October 2020',
        identifier:
          'https://www.justice.gov/archives/opa/pr/opioid-manufacturer-purdue-pharma-pleads-guilty-fraud-and-kickback-conspiracies',
        kind: 'url',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — oxycodone, 193 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5284603 — oxycodone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284603',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Morphine — the reference against which every other opioid is measured, whose own randomised
  //    literature the Cochrane reviewers call small given the importance of the medicine.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'morphine',
    name: 'Morphine',
    tradeName: 'MS Contin / Kadian / Avinza / MorphaBond ER / Astramorph PF / Duramorph',
    sponsor:
      'Hikma (holder on the enriched record); MS Contin originated at Purdue Frederick and the molecule is made by many manufacturers worldwide',
    targetGene: 'OPRM1',
    targetProtein:
      'Mu-opioid receptor, a Gi/o-coupled seven-transmembrane receptor; morphine is a full agonist, and its metabolite morphine-6-glucuronide is an agonist in its own right',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1984,
    indication:
      'Extended-release morphine is indicated for the management of pain severe enough to require daily, around-the-clock, long-term opioid treatment and for which alternative treatment options are inadequate. Immediate-release oral and injectable morphine is indicated for pain severe enough to require an opioid analgesic. Extended-release products are not indicated as an as-needed analgesic.',
    patientFriendlyIndication:
      'Pain severe enough to need round-the-clock opioid treatment, when other options are inadequate',
    anatomicalSite:
      'Mu-opioid receptors of the spinal dorsal horn, periaqueductal grey and rostral ventromedial medulla; also the gut wall, where the same receptor stops peristalsis, which is why constipation is the one adverse effect that does not fade',
    conditionContext: {
      conditionExplainer:
        'Severe pain — after major surgery, in advanced cancer, in a burns unit — is one of the few problems in medicine where a two-hundred-year-old drug is still the correct answer. Morphine is that drug, it costs almost nothing, and its absence from most of the world is a supply and regulation problem rather than a scientific one.',
      whyItMatters:
        'Every other opioid on this site is described in terms of morphine: potency ratios, conversion tables, the phrase morphine-equivalent daily dose. It is worth knowing what the reference itself actually rests on, and the answer is a large clinical tradition sitting on a modest randomised literature.',
      whoTakesThis:
        'People with cancer pain, people after major surgery, people in intensive care, and people at the end of life. It is on the WHO Model List of Essential Medicines.',
      clinicalGoals:
        'Pain no worse than mild. That is the standard the Cochrane review of oral morphine in cancer pain used, and where individual results were reported, 96% of participants reached it.',
    },
    oneSentenceVerdict:
      'The reference opioid: a full mu-agonist that in the Cochrane review of 62 studies and 4,241 participants left 96% of individually reported cancer patients with pain no worse than mild, on evidence the reviewers themselves describe as generally poor and small given the importance of the medicine — and which failed its two most-cited non-analgesic uses, breathlessness in COPD (BEAMS, 160 patients, no significant effect) and acute heart failure, where a 147,362-hospitalisation registry found it an independent predictor of death.',
    laymanHowItWorks:
      'Morphine is the substance the opium poppy makes, isolated in 1804 and named after the god of sleep. It binds the mu-opioid receptor, the switch the body’s own endorphins use, and turns it fully on. In the spinal cord that stops the pain signal being handed upward; in the brainstem it strengthens a system that suppresses pain from above; in the limbic brain it separates the sensation of pain from the distress of it. The liver then converts most of a dose into two by-products, one of which is itself an active painkiller and is cleared by the kidneys, which is why morphine behaves differently in someone whose kidneys are failing.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.4096 per millilitre of oral solution at United States pharmacy acquisition cost (CMS NADAC, median across 75 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Morphine has been off patent for longer than the modern patent system has existed; it was isolated by Friedrich Sertürner around 1804 and commercialised by Merck from 1827. What is patented are delivery systems — the controlled-release matrix, the abuse-deterrent shell — layered onto a public-domain alkaloid. Morphine is on the WHO Model List of Essential Medicines, and the practical barrier to its use in most of the world is regulatory control and supply chain, not cost.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Inside the opioid class, the Cochrane reviewers concluded there is qualitative evidence that oral morphine has much the same efficacy as the other available opioids — so the choice between them is about route, kinetics, organ function and price rather than about potency. Outside the class, the substitutes depend on what the pain is: for postoperative pain the over-the-counter combination measures better in single-dose trials, and for chronic non-cancer pain the twelve-month randomised comparison did not favour opioids at all.',
      conventionalRx: [
        {
          name: 'Oxycodone, immediate or extended release',
          class: 'Full mu-opioid agonist',
          howItCompares:
            'Better absorbed by mouth and does not produce morphine-6-glucuronide, so it is often preferred where kidney function is poor. There is no trial showing it relieves cancer pain better than morphine; the Cochrane review of oral morphine found much the same efficacy across available opioids.',
          typicalCost:
            'US$0.1974 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 193 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: predictable oral bioavailability, no renally cleared active metabolite. Cons: identical class risks, a boxed CYP3A4 interaction warning morphine does not have, and the promotional history behind the modern opioid crisis.',
        },
        {
          name: 'Hydromorphone',
          class: 'Full mu-opioid agonist',
          howItCompares:
            'Considerably more potent per milligram, which makes it useful when a large morphine dose will not fit into a small subcutaneous volume. That is a formulation advantage, not a pharmacological one, and the potency ratios used to switch between them come largely from single-dose crossover studies rather than from steady-state trials.',
          typicalCost:
            'US$2.57 per millilitre of injection at United States pharmacy acquisition cost (CMS NADAC, median across 36 listed generic products, survey effective 20 May 2026)',
          prosAndCons:
            'Pros: high concentration in small volume, no morphine-6-glucuronide. Cons: the same potency that helps in a syringe driver is the reason its concentrated formulations feature in medication-error reports.',
        },
        {
          name: 'Ibuprofen plus paracetamol (acetaminophen), taken together',
          class: 'Non-steroidal anti-inflammatory drug plus a centrally acting analgesic',
          howItCompares:
            'For a single dose after surgery, the Cochrane overview of 53 drug-and-dose pairs put this combination at the top of the table, with a number-needed-to-treat of 1.6 for at least 50% pain relief over four to six hours. It is not a substitute for morphine in cancer pain or after major trauma, and it is very often a substitute for it after minor surgery.',
          typicalCost:
            'US$0.0391 per ibuprofen tablet and US$0.0349 per paracetamol tablet at United States pharmacy acquisition cost (CMS NADAC, medians across 244 and 170 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no respiratory depression, no dependence, better measured single-dose analgesia. Cons: ceiling effect, gastrointestinal and renal risk from the NSAID, hepatotoxicity from paracetamol in overdose.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Expect the constipation and say so early',
          action: 'Raise bowel symptoms at the first review rather than the fourth.',
          patientImpact:
            'Tolerance develops to most opioid adverse effects over days. It does not develop to the effect on the gut, because the mu receptors involved are in the wall of the bowel itself and are being continuously occupied.',
          clinicalPrecaution:
            'Constipation is the adverse effect that most often ends morphine treatment, and it is a mechanism-level consequence rather than an idiosyncratic reaction.',
        },
        {
          name: 'Tell the team about your kidneys',
          action: 'Mention any kidney impairment, dialysis or recent rise in creatinine.',
          patientImpact:
            'The MS CONTIN label records that morphine is glucuronidated to morphine-3-glucuronide (about 50%) and morphine-6-glucuronide (about 5 to 15%), that M6G has analgesic activity, and that elimination occurs primarily as renal excretion of M3G. When the kidney slows, those metabolites accumulate.',
          clinicalPrecaution:
            'This is the standard clinical reason for preferring a different opioid in renal failure, and it is a pharmacokinetic argument, not a claim that the alternatives relieve pain better.',
        },
        {
          name: 'If you are having a heart attack, morphine is not a neutral comfort measure',
          action: 'Expect the team to weigh it rather than give it automatically.',
          patientImpact:
            'The IMPRESSION trial found that 5 mg of intravenous morphine lowered total exposure to a loading dose of ticagrelor by 36% and delayed its peak from 2 hours to 4, with more patients left with high platelet reactivity.',
          clinicalPrecaution:
            'This is a measured drug interaction in 70 randomised infarction patients, not a clinical outcome trial. It changes how the antiplatelet drug behaves; whether that changes infarct outcomes was not what the trial measured.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1CC[C@]23[C@@H]4[C@H]1CC5=C2C(=C(C=C5)O)O[C@H]3[C@H](C=C4)O',
      chemicalFormula: 'C17H19NO3',
      molecularWeight: '285.34 g/mol (free base); dispensed as the sulfate pentahydrate',
      targetReceptorAffinity:
        'A pentacyclic phenanthrene alkaloid with five stereocentres, all of natural configuration; the synthetic route exists but has never been economic against the poppy. Full mu-opioid agonist. The MS CONTIN label records volume of distribution about 3 to 4 L/kg, plasma protein binding 30 to 35%, and an effective half-life after intravenous administration of 2 to 4 hours, with a longer terminal half-life of about 15 hours reported where plasma sampling ran long enough to see it.',
      structureSource: {
        label:
          'PubChem CID 5288826 (morphine) — canonical SMILES, molecular formula and weight, as carried on the enriched record and machine-verified by the RNAwiki structure engine; distribution and elimination figures from the MS CONTIN label, section 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5288826',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mor-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Assay the poppy straw concentrate and its alkaloid neighbours',
          description:
            'Almost all pharmaceutical morphine is extracted from Papaver somniferum rather than synthesised. The input is an agricultural product whose alkaloid ratio varies by cultivar, latitude and season, so the assay establishes not just morphine content but the codeine, thebaine, noscapine and papaverine riding alongside it.',
          reagentsAndBuffer:
            'Concentrate of poppy straw or opium reference standards, reversed-phase HPLC with ultraviolet detection at 285 nm, LC-MS/MS for minor alkaloid profiling, loss-on-drying and residue-on-ignition determination',
        },
        {
          id: 'mor-w2',
          stepNumber: 2,
          phase: 'Purification',
          name: 'Extract into acid, precipitate the free base, form the sulfate',
          description:
            'Morphine is separated from the other alkaloids by exploiting its phenolic hydroxyl: it is soluble in aqueous alkali where codeine and thebaine are not. The free base is precipitated, redissolved and converted to morphine sulfate pentahydrate. The step exists because no synthetic route competes on cost with a plant that makes the molecule for free.',
          dependsOnStepId: 'mor-w1',
          reagentsAndBuffer:
            'Dilute sulfuric acid, lime or sodium hydroxide for the alkaline extraction, activated carbon decolourisation, recrystallisation from water, controlled humidity drying to a defined pentahydrate stoichiometry',
        },
        {
          id: 'mor-w3',
          stepNumber: 3,
          phase: 'Conjugation',
          name: 'Prepare M3G and M6G as separate analytical standards',
          description:
            'The clinical pharmacology of morphine is the pharmacology of three molecules, and the two glucuronides cannot be studied without authentic standards. M6G is an agonist, M3G is not, and they behave differently again when the kidney is not clearing them. Any assay that reports only parent morphine misdescribes what the patient is carrying.',
          dependsOnStepId: 'mor-w2',
          reagentsAndBuffer:
            'Morphine-3-beta-D-glucuronide and morphine-6-beta-D-glucuronide reference standards, deuterated internal standards, UDP-glucuronosyltransferase 2B7 microsomal preparations for biosynthetic confirmation, solid-phase extraction cartridges',
        },
        {
          id: 'mor-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Compare parent and metabolite at the receptor and at the barrier',
          description:
            'Run morphine and M6G as separate test articles for receptor agonism, then repeat the comparison across a blood-brain barrier model. The label states M6G has analgesic activity but crosses the blood-brain barrier poorly, and that combination — active but slow to enter — is exactly what produces delayed sedation when it accumulates.',
          dependsOnStepId: 'mor-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human OPRM1, [35S]GTPgammaS binding, DAMGO reference agonist, naloxone control, hCMEC/D3 or primary brain endothelial monolayers for permeability, transepithelial electrical resistance monitoring',
        },
        {
          id: 'mor-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure all three species in renal impairment, not just the parent',
          description:
            'A therapeutic drug monitoring method for morphine that quantifies only morphine answers the wrong question in a patient with a failing kidney. The assay has to report parent, M3G and M6G separately, with the ratios, because the ratios are what change when clearance falls.',
          dependsOnStepId: 'mor-w4',
          reagentsAndBuffer:
            'LC-MS/MS with deuterated morphine, M3G and M6G internal standards, protein precipitation or solid-phase extraction from plasma, calibration across the range seen in impaired renal clearance, paired creatinine or measured glomerular filtration rate',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mor-a1',
        category: 'measured',
        title: 'It works in cancer pain, on a literature its own reviewers call poor',
        laymanSummary:
          'Where individual patient results were reported, 96% got to pain no worse than mild. The Cochrane authors add that the randomised evidence for morphine is small given how important the medicine is, and that most trials were run to register a formulation rather than to test whether the drug works.',
        technicalDetails:
          'Wiffen, Wee and Moore reviewed 62 studies with 4,241 participants. Thirty-six used a cross-over design of one to fifteen days. Fifteen compared oral modified-release morphine with immediate-release morphine, fourteen compared modified-release strengths, and fifteen compared modified-release morphine with other opioids. Eighteen studies achieved an average of no worse than mild pain — 30/100 mm or less on a visual analogue scale — and no study reported failure to attain good pain relief. Where results were given per participant in 17 studies, 96% (362/377) reached no worse than mild pain and 63% (400/638) reached an outcome equivalent to treatment success. Daily doses ranged from 25 mg to 2,000 mg. About 6% discontinued for intolerable adverse effects. The reviewers judged the included studies at high risk of bias because randomisation and allocation concealment were poorly reported, described the quality of the evidence as generally poor, and concluded that studies were old, often small, and largely carried out for registration purposes and therefore designed only to show equivalence between formulations.',
        evidenceSource:
          'Wiffen PJ, Wee B, Moore RA. Oral morphine for cancer pain. Cochrane Database Syst Rev 2016;(4):CD003868',
        doi: '10.1002/14651858.CD003868.pub4',
        measuredMetric:
          'Proportion of participants achieving pain no worse than mild (≤30/100 mm on a visual analogue scale) on oral morphine for cancer pain',
        auditFlag: 'verified',
      },
      {
        id: 'mor-a2',
        category: 'failed',
        title: 'Breathlessness: the palliative use that failed its largest randomised test',
        laymanSummary:
          'Low-dose slow-release morphine is widely given for the breathlessness of advanced lung disease. The largest randomised trial of it, in 160 people at twenty Australian centres, found no significant difference from placebo at either dose after a week.',
        technicalDetails:
          'BEAMS was a multicentre, double-blind, placebo-controlled trial in people with COPD and chronic breathlessness at modified Medical Research Council grade 3 to 4, at 20 centres in Australia. Participants were randomised 1:1:1 to 8 mg/day or 16 mg/day of oral extended-release morphine or placebo for week 1, with further 1:1 randomisation to added 8 mg/day increments in weeks 2 and 3. Of 160 randomised, 156 were included in the primary analysis (median age 72, IQR 67 to 78; 48% women) and 138 (88%) completed week 1. Change in the intensity of worst breathlessness on a 0-10 numerical rating scale did not differ significantly from placebo at 8 mg/day (mean difference −0.3, 95% CI −0.9 to 0.4) or at 16 mg/day (mean difference −0.3, 95% CI −1.0 to 0.4). The secondary outcome of change in daily step count at week 3 did not differ at any dose. The authors concluded the findings do not support the use of these doses of extended-release morphine to relieve breathlessness. An earlier, smaller trial in the same field — MORDYC, 111 analysed participants — had found a 2.18-point improvement in COPD Assessment Test score (95% CI −4.14 to −0.22, p=0.03) with breathlessness itself unchanged, which is the kind of result BEAMS was built to adjudicate.',
        evidenceSource:
          'Ekström M, Ferreira D, Chang S, et al. Effect of Regular, Low-Dose, Extended-release Morphine on Chronic Breathlessness in Chronic Obstructive Pulmonary Disease: The BEAMS Randomized Clinical Trial. JAMA 2022;328(20):2022-2032 (NCT02720822)',
        doi: '10.1001/jama.2022.20206',
        measuredMetric:
          'Change in intensity of worst breathlessness on a 0-10 numerical rating scale after one week',
        auditFlag: 'verified',
      },
      {
        id: 'mor-a3',
        category: 'inferred',
        title: 'Acute heart failure: an association that is not a trial',
        laymanSummary:
          'Morphine has been given in acute heart failure for a century. A registry of 147,362 admissions found that the people who received it died four to five times as often after adjustment. It is an observational finding, and the sickest patients are the ones most likely to be given it.',
        technicalDetails:
          'Peacock and colleagues analysed the ADHERE registry as of December 2004: 147,362 hospitalisations, of which 20,782 (14.1%) received intravenous morphine and 126,580 (85.9%) did not. Baseline age, heart rate, blood pressure, urea, creatinine, haemoglobin, ejection fraction and atrial fibrillation did not differ clinically between the groups, but rest dyspnoea, radiographic congestion, rales and raised troponin were all more prevalent in the morphine group. Morphine recipients received more inotropes and vasodilators, were more likely to require mechanical ventilation (15.4% against 2.8%), had longer median stay (5.6 against 4.2 days), more ICU admissions (38.7% against 14.4%) and higher mortality (13.0% against 2.4%), all p<0.001. After risk adjustment and exclusion of ventilated patients, morphine remained an independent predictor of mortality (OR 4.84, 95% CI 4.52 to 5.18, p<0.001). The honest reading is confounding by indication: the finding is strong, consistent and observational, and no randomised trial of morphine in acute decompensated heart failure of comparable size exists to settle it.',
        evidenceSource:
          'Peacock WF, Hollander JE, Diercks DB, Lopatin M, Fonarow G, Emerman CL. Morphine and outcomes in acute decompensated heart failure: an ADHERE analysis. Emerg Med J 2008;25(4):205-209',
        doi: '10.1136/emj.2007.050419',
        inferredClaim:
          'That morphine causes the excess mortality seen in acute decompensated heart failure — a plausible reading of a very large registry association that no randomised trial has tested',
        measuredMetric:
          'Adjusted odds ratio for in-hospital mortality with intravenous morphine in 147,362 heart failure hospitalisations',
        auditFlag: 'contested',
      },
      {
        id: 'mor-a4',
        category: 'measured',
        title: 'It blunts the antiplatelet drug given beside it in a heart attack',
        laymanSummary:
          'Given during a heart attack for pain, morphine slows the stomach down — and the antiplatelet tablet swallowed at the same time is absorbed more slowly and less completely. In a randomised trial of 70 patients, total ticagrelor exposure fell by 36%.',
        technicalDetails:
          'IMPRESSION was a single-centre, randomised, double-blind trial in patients with acute myocardial infarction assigned 1:1 to intravenous morphine 5 mg or placebo, followed by a 180 mg ticagrelor loading dose; pharmacokinetics and pharmacodynamics were assessed in 70 patients, 35 per group. Morphine lowered total exposure to ticagrelor by 36% (AUC 0-12h 6,307 against 9,791 ng·h/mL, p=0.003) and to its active metabolite AR-C124910XX by 37% (1,503 against 2,388 ng·h/mL, p=0.008), and delayed maximal plasma concentration from 2 to 4 hours (p=0.004). All three platelet function tests showed a stronger antiplatelet effect on placebo and more high platelet reactivity on morphine. Multiple regression associated lower ticagrelor exposure independently with morphine administration (p=0.004) and with ST-elevation infarction (p=0.014). What was measured is drug exposure and platelet reactivity; whether the interaction changes infarct size, reinfarction or death has not been established in a powered outcome trial.',
        evidenceSource:
          'Kubica J, Adamski P, Ostrowska M, et al. Morphine delays and attenuates ticagrelor exposure and action in patients with myocardial infarction: the randomized, double-blind, placebo-controlled IMPRESSION trial. Eur Heart J 2016;37(3):245-252 (NCT02217878)',
        doi: '10.1093/eurheartj/ehv547',
        measuredMetric:
          'Area under the ticagrelor concentration-time curve over 12 hours, and platelet reactivity, with and without 5 mg intravenous morphine',
        auditFlag: 'verified',
      },
      {
        id: 'mor-a5',
        category: 'conclusion_shift',
        title: 'The patient carries three drugs, and the kidney decides the mix',
        laymanSummary:
          'Most of a morphine dose is converted into two by-products. One of them is a painkiller in its own right and leaves the body through the kidneys. When the kidneys fail, it builds up, and the person becomes drowsy on a dose that was fine last week.',
        technicalDetails:
          'The MS CONTIN label states that the major pathways of morphine metabolism are glucuronidation to morphine-3-glucuronide, M3G (about 50%) and morphine-6-glucuronide, M6G (about 5 to 15%), plus sulfation, with less than 5% demethylated; that M6G has analgesic activity but crosses the blood-brain barrier poorly while M3G has no significant analgesic activity; and that elimination occurs primarily as renal excretion of M3G, with about 10% of the dose excreted unchanged. Effective half-life after intravenous administration is 2 to 4 hours, with a longer terminal half-life of about 15 hours reported in studies sampling long enough to see it. The consequence for practice is that the "morphine level" is a three-molecule quantity whose composition shifts with renal clearance, and that the poor blood-brain penetration of M6G is what makes its accumulation a delayed effect rather than an immediate one.',
        evidenceSource:
          'MS CONTIN (morphine sulfate extended-release tablets) United States prescribing information, Clinical Pharmacology 12.3',
        inferredClaim:
          'That a stated morphine dose corresponds to a stable degree of mu-receptor occupancy — true only where renal clearance is stable, because most of the circulating active material is a renally excreted metabolite',
        auditFlag: 'caution',
      },
      {
        id: 'mor-a6',
        category: 'failed',
        title: 'For chronic pain in children there is not one eligible randomised trial',
        laymanSummary:
          'A Cochrane team searched the entire literature for randomised trials of opioids in children and adolescents with long-term non-cancer pain. They found none at all.',
        technicalDetails:
          'Cooper and colleagues searched CENTRAL, MEDLINE and Embase from inception to 6 September 2016, plus reference lists and trial registries, for randomised controlled trials of any opioid at any dose by any route against placebo or an active comparator for chronic non-cancer pain in people from birth to 17 years. No studies were eligible for inclusion. The authors rated the quality of evidence as very low, downgraded by three levels for the total absence of reported data, and concluded that there was no evidence from randomised controlled trials to support or refute the use of opioids in this population. This is not a null result: it is the absence of the experiment. Morphine, codeine and their relatives are nonetheless given to children with chronic pain across the world.',
        evidenceSource:
          'Cooper TE, Fisher E, Gray AL, et al. Opioids for chronic non-cancer pain in children and adolescents. Cochrane Database Syst Rev 2017;(7):CD012538',
        doi: '10.1002/14651858.CD012538.pub2',
        measuredMetric:
          'Number of randomised controlled trials eligible for inclusion: zero, from a search of the whole indexed literature',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'From a poppy, not a reactor',
        laymanDesc:
          'Nearly all medical morphine is extracted from the opium poppy. There is a synthetic route, and it has never been worth using, because the plant makes the molecule for nothing.',
        molecularDetail:
          'A pentacyclic phenanthrene alkaloid, C17H19NO3, with five stereocentres of fixed natural configuration. Pharmaceutical supply is by alkaline extraction from concentrate of poppy straw, exploiting the phenolic hydroxyl that morphine has and codeine and thebaine do not.',
        iconName: 'Leaf',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver takes most of it before it ever acts',
        laymanDesc:
          'Swallowed morphine passes the liver first, and most of it is converted before reaching the bloodstream. That is why an oral dose is several times an injected one for the same effect.',
        molecularDetail:
          'Extensive first-pass glucuronidation by UGT2B7. About 50% of a dose becomes morphine-3-glucuronide and 5 to 15% morphine-6-glucuronide; less than 5% is demethylated. Volume of distribution is 3 to 4 L/kg and plasma protein binding 30 to 35%.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Full agonism at the endorphin receptor',
        laymanDesc:
          'Morphine binds the mu-opioid receptor and turns it fully on — the same receptor and the same switch the body’s own endorphins use, held open far longer than an endorphin would.',
        molecularDetail:
          'Full agonism at the Gi/o-coupled mu-opioid receptor: inhibition of adenylyl cyclase, opening of G-protein-coupled inwardly rectifying potassium channels, closure of N-type voltage-gated calcium channels. The neuron hyperpolarises and releases less transmitter.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Three sites, and one of them is the gut',
        laymanDesc:
          'The spinal cord stops relaying the signal, the brainstem turns up its own pain suppression, and the bowel stops moving. The first two effects fade with tolerance. The third does not.',
        molecularDetail:
          'Presynaptic inhibition of substance P and glutamate release in the dorsal horn; disinhibition of descending output from the periaqueductal grey through the rostral ventromedial medulla; and mu agonism on myenteric plexus neurons, which suppresses propulsive motility and increases fluid absorption. Tolerance develops to analgesia and sedation but not to the enteric effect.',
        iconName: 'Network',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The kidney decides how long it lasts',
        laymanDesc:
          'The active by-product is cleared by the kidneys. In someone whose kidneys are failing it builds up over days, and a dose that worked all week suddenly produces drowsiness.',
        molecularDetail:
          'Elimination is primarily renal excretion of M3G, with about 10% of the dose excreted unchanged. M6G is analgesic but penetrates the blood-brain barrier poorly, so its accumulation shows as delayed sedation rather than immediate potency. Effective half-life 2 to 4 hours, terminal half-life about 15 hours where sampling runs long enough.',
        iconName: 'Droplet',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What it has and has not been shown to do',
        laymanDesc:
          'In cancer pain, 96% of patients with individually reported results got to pain no worse than mild. In breathlessness from lung disease, the largest randomised trial found nothing. Those are two different questions and morphine answers only one of them.',
        molecularDetail:
          'Cochrane review of 62 studies and 4,241 participants: 96% (362/377) reached no worse than mild pain where per-participant data existed, on evidence the reviewers grade as generally poor. BEAMS, 156 analysed: change in worst breathlessness against placebo −0.3 (95% CI −0.9 to 0.4) at 8 mg/day and −0.3 (−1.0 to 0.4) at 16 mg/day.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT02720822 (BEAMS, JAMA 2022;328:2022-2032)',
        phase: 'Phase 3, multicentre, double-blind, placebo-controlled randomised trial',
        sampleSize: 160,
        primaryEndpoint:
          'Change in intensity of worst breathlessness on a 0-10 numerical rating scale from baseline to week 1, with 8 mg/day or 16 mg/day extended-release morphine against placebo, in COPD with mMRC grade 3 to 4 breathlessness',
        endpointMet: false,
        statisticalPValue:
          'Mean difference against placebo −0.3 (95% CI −0.9 to 0.4) at 8 mg/day and −0.3 (95% CI −1.0 to 0.4) at 16 mg/day; not significant at either dose',
        unreportedAdverseSignals:
          'The secondary outcome of change in mean daily step count at week 3 was not significantly different from placebo at any of 8, 16, 24 or 32 mg/day, and every point estimate was numerically lower than placebo. 156 of 160 randomised were included in the primary analysis and 138 (88%) completed week 1.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'NCT02217878 (IMPRESSION, Eur Heart J 2016;37:245-252)',
        phase: 'Randomised, double-blind, placebo-controlled, single centre',
        sampleSize: 70,
        primaryEndpoint:
          'Ticagrelor and AR-C124910XX pharmacokinetics and platelet reactivity after a 180 mg ticagrelor loading dose, with intravenous morphine 5 mg or placebo, in acute myocardial infarction',
        endpointMet: true,
        statisticalPValue:
          'Total ticagrelor exposure 36% lower on morphine (AUC 0-12h 6,307 against 9,791 ng·h/mL, p=0.003); active metabolite 37% lower (p=0.008); time to peak 4 hours against 2 (p=0.004)',
        unreportedAdverseSignals:
          'The trial measured drug exposure and platelet reactivity, not clinical outcomes. Whether the attenuated antiplatelet effect changes infarct size, reinfarction or mortality has not been established in a powered outcome trial.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No worse than mild pain in 96% (362/377) of cancer patients with individually reported results, across a Cochrane review of 62 studies and 4,241 participants',
        'About 6% of participants discontinued oral morphine for intolerable adverse effects in the same review',
        'No significant reduction in worst breathlessness against placebo at 8 or 16 mg/day in 156 analysed COPD patients (BEAMS)',
        'A 36% fall in total ticagrelor exposure and a 2-hour delay in peak concentration with 5 mg intravenous morphine in 70 randomised infarction patients',
        'Metabolism to M3G (about 50%) and M6G (5 to 15%), with elimination primarily as renal excretion of M3G, from the product label',
      ],
      unsupportedInferences: [
        'That morphine relieves the chronic breathlessness of COPD — not supported at the doses tested in the largest randomised trial',
        'That morphine causes the excess mortality associated with it in acute heart failure registries, where the sickest patients are also the ones given it',
        'That published equianalgesic ratios convert reliably between opioids at steady state, when they derive largely from single-dose crossover work',
        'That a stated milligram dose corresponds to a stable exposure, when most circulating active material is a renally cleared metabolite',
      ],
      whatFailedInitially: [
        'The primary endpoint of BEAMS, and every dose level of its step-count secondary endpoint',
        'The search for randomised evidence on opioids in children with chronic non-cancer pain, which returned zero eligible trials',
        'The randomised evidence base for morphine itself, which its Cochrane reviewers call small given the importance of the medicine and at high risk of bias',
        'Its role as a routine comfort measure during myocardial infarction, once the antiplatelet interaction was measured',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines, and unavailable or severely restricted across much of the world for reasons of regulation and supply rather than cost',
        'The reference molecule for every opioid conversion table and for the phrase morphine-milligram equivalent, which underpins prescribing policy in several countries',
        'About forty United States cents per millilitre of oral solution at pharmacy acquisition cost',
        'Still the correct answer for severe acute and cancer pain after two centuries, which is not a claim any other class on this site can make',
      ],
    },
    deliverySystem: {
      type: 'Oral immediate-release tablets and solution; oral extended-release tablets and capsules; solution for intravenous, intramuscular, subcutaneous, epidural and intrathecal use; suppositories. Schedule II controlled substance in the United States.',
      description:
        'Oral bioavailability is limited by extensive first-pass glucuronidation, which is why parenteral and oral doses differ several-fold for the same effect. Extended-release oral products are designed for around-the-clock dosing and are explicitly not indicated as an as-needed analgesic. Preservative-free formulations exist specifically for epidural and intrathecal administration, where a preservative would be neurotoxic.',
      safetyProfile:
        'Class boxed warnings for addiction, abuse and misuse; life-threatening respiratory depression; accidental ingestion; neonatal opioid withdrawal syndrome; risks from concomitant benzodiazepines, other CNS depressants and alcohol; and the opioid analgesic REMS. Constipation is near-universal and does not remit with tolerance. Accumulation of the active metabolite M6G in renal impairment produces delayed sedation and respiratory depression. Histamine release can cause itching, flushing and hypotension, which is more prominent with morphine than with the synthetic opioids.',
    },
    commonQuestions: [
      {
        q: 'Is morphine the strongest painkiller?',
        a: 'It is the reference, not the maximum. Hydromorphone, fentanyl and others are more potent per milligram, which means a smaller number achieves the same effect — it does not mean a better ceiling. The Cochrane review of oral morphine in cancer pain concluded there is qualitative evidence that oral morphine has much the same efficacy as the other available opioids. Where clinicians switch between them, the reason is usually route, kidney function, formulation volume or adverse effects rather than a superiority trial.',
        auditNote:
          'Potency and efficacy are different measurements. A conversion table describes potency; it says nothing about which drug relieves more pain.',
      },
      {
        q: 'Does morphine help with breathlessness at the end of life?',
        a: 'The largest randomised trial says not at the doses it tested. BEAMS randomised 160 people with COPD and severe chronic breathlessness at twenty Australian centres to 8 mg/day or 16 mg/day of extended-release morphine or placebo; neither dose significantly reduced worst breathlessness after a week, and daily step count at week 3 did not improve at any dose up to 32 mg/day. The authors wrote that the findings do not support the use of these doses to relieve breathlessness. That is a specific finding about regular, low-dose, extended-release morphine in COPD, and it does not speak to what is given in the last days of life, where no trial of that kind exists.',
        auditNote:
          'A widely used palliative intervention with a clear physiological rationale can still fail when it is finally randomised. The rationale was never the evidence.',
      },
      {
        q: 'Why does it affect me differently when my kidneys are bad?',
        a: 'Because most of what circulates after a morphine dose is not morphine. The label records that about half the dose becomes morphine-3-glucuronide and 5 to 15% becomes morphine-6-glucuronide, that M6G is itself a painkiller, and that elimination is mainly the kidney excreting M3G. When kidney clearance falls, both accumulate. M6G crosses into the brain slowly, so the effect shows up as increasing drowsiness over days rather than immediately after a dose — which is exactly the pattern that makes it easy to miss.',
      },
      {
        q: 'Will the constipation go away?',
        a: 'No, and that is a mechanism rather than bad luck. Tolerance develops to most opioid effects — the sedation, the nausea, much of the analgesia — because the receptors involved adapt. The receptors in the wall of the bowel are being occupied continuously and the gut does not adapt in the same way. Constipation is the adverse effect most likely to be the reason someone stops.',
      },
      {
        q: 'Why do heart attack teams hesitate over morphine now?',
        a: 'Because of two findings. IMPRESSION randomised 70 patients having a heart attack to 5 mg of intravenous morphine or placebo before a ticagrelor loading dose and found total ticagrelor exposure 36% lower, its peak delayed from two hours to four, and more patients left with high platelet reactivity. Separately, an analysis of 147,362 heart failure admissions in the ADHERE registry found morphine an independent predictor of death after risk adjustment. The first is a randomised measurement of a drug interaction; the second is an observational association in which the sickest patients were also the ones most likely to be given morphine. Neither is a trial showing that withholding morphine saves lives.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Wiffen PJ, Wee B, Moore RA. Oral morphine for cancer pain. Cochrane Database Syst Rev 2016;(4):CD003868',
        identifier: '10.1002/14651858.CD003868.pub4',
        kind: 'doi',
      },
      {
        label:
          'Ekström M, Ferreira D, Chang S, et al. Effect of Regular, Low-Dose, Extended-release Morphine on Chronic Breathlessness in Chronic Obstructive Pulmonary Disease: The BEAMS Randomized Clinical Trial. JAMA 2022;328(20):2022-2032',
        identifier: '10.1001/jama.2022.20206',
        kind: 'doi',
      },
      {
        label: 'BEAMS trial registration — ClinicalTrials.gov NCT02720822',
        identifier: 'NCT02720822',
        kind: 'nct',
      },
      {
        label:
          'Kubica J, Adamski P, Ostrowska M, et al. Morphine delays and attenuates ticagrelor exposure and action in patients with myocardial infarction: the IMPRESSION trial. Eur Heart J 2016;37(3):245-252',
        identifier: '10.1093/eurheartj/ehv547',
        kind: 'doi',
      },
      {
        label: 'IMPRESSION trial registration — ClinicalTrials.gov NCT02217878',
        identifier: 'NCT02217878',
        kind: 'nct',
      },
      {
        label:
          'Peacock WF, Hollander JE, Diercks DB, Lopatin M, Fonarow G, Emerman CL. Morphine and outcomes in acute decompensated heart failure: an ADHERE analysis. Emerg Med J 2008;25(4):205-209',
        identifier: '10.1136/emj.2007.050419',
        kind: 'doi',
      },
      {
        label:
          'Cooper TE, Fisher E, Gray AL, et al. Opioids for chronic non-cancer pain in children and adolescents. Cochrane Database Syst Rev 2017;(7):CD012538',
        identifier: '10.1002/14651858.CD012538.pub2',
        kind: 'doi',
      },
      {
        label:
          'Verberkt CA, van den Beuken-van Everdingen MHJ, Schols JMGA, et al. Effect of Sustained-Release Morphine for Refractory Breathlessness in Chronic Obstructive Pulmonary Disease on Health Status: A Randomized Clinical Trial (MORDYC). JAMA Intern Med 2020;180(10):1306-1314',
        identifier: '10.1001/jamainternmed.2020.3134',
        kind: 'doi',
      },
      {
        label:
          'MS CONTIN (morphine sulfate extended-release tablets) United States prescribing information — Indications 1, boxed warning, Clinical Pharmacology 12.3',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019516',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — morphine, 75 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5288826 — morphine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5288826',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Hydrocodone — 137 million prescriptions a year in Schedule III, and a single-ingredient
  //    product the FDA approved after its own advisory committee voted eleven to two against it.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'hydrocodone',
    name: 'Hydrocodone',
    tradeName:
      'Zohydro ER / Hysingla ER / Vantrela ER; also Vicodin, Norco and Lortab in combination with paracetamol',
    sponsor:
      'Genus Lifesciences (holder on the enriched record); Zohydro ER was approved under NDA 202880 to Zogenix and is now discontinued, Hysingla ER under NDA 206627 to Purdue Pharma',
    targetGene: 'OPRM1',
    targetProtein:
      'Mu-opioid receptor, a Gi/o-coupled seven-transmembrane receptor; hydrocodone is a full agonist at it',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1943,
    indication:
      'Management of severe and persistent pain that requires an opioid analgesic and that cannot be adequately treated with alternative options, including immediate-release opioids. Combination products with paracetamol are indicated for the management of pain severe enough to require an opioid analgesic and for which alternative treatments are inadequate. Prescription cough products containing hydrocodone are labelled for adults aged 18 and over only.',
    patientFriendlyIndication:
      'Pain severe enough to need an opioid, most often as a combination tablet with paracetamol',
    anatomicalSite:
      'Mu-opioid receptors of the spinal dorsal horn and brainstem; and the cough centre of the medulla, which is the reason hydrocodone spent decades in cough syrup',
    conditionContext: {
      conditionExplainer:
        'Most hydrocodone has never been swallowed as hydrocodone. It is dispensed as a tablet that is mostly paracetamol with a few milligrams of opioid in it, which is why the story of this molecule is inseparable from the story of the paracetamol beside it and from the schedule the combination sat in.',
      whyItMatters:
        'For decades a hydrocodone-and-paracetamol tablet was the most dispensed prescription in the United States, and it sat in Schedule III rather than Schedule II — a regulatory position that permitted telephone prescriptions and refills that pure hydrocodone never could have had. The Drug Enforcement Administration moved it in 2014. Understanding this drug means understanding that the difference was administrative, not pharmacological.',
      whoTakesThis:
        'People with acute pain after injury, dental work or surgery; people with long-term pain, where the evidence is much weaker; and formerly children with a cough, which the FDA ended in 2018.',
      clinicalGoals:
        'Less pain over hours. In the head-to-head emergency department trial, that goal was reached about equally by hydrocodone-with-paracetamol and by ibuprofen-with-paracetamol.',
    },
    oneSentenceVerdict:
      'A full mu-opioid agonist that in a four-arm randomised trial of 411 emergency department patients with acute limb pain produced the smallest two-hour pain reduction of the four combinations tested — 3.5 points against 4.3 for ibuprofen plus paracetamol, with no statistically significant difference between any of them (p=0.053) — and whose 137 million annual prescriptions sat in Schedule III until the DEA moved hydrocodone combination products to Schedule II on 6 October 2014.',
    laymanHowItWorks:
      'Hydrocodone binds the mu-opioid receptor, the same one morphine uses, and turns it on: less pain signal reaching the brain from the spinal cord, and less distress attached to what does get through. It also acts on the cough centre in the brainstem, which is why it was sold as a cough medicine for seventy years. Most of a dose is destroyed by the liver enzyme CYP3A4 into an inactive by-product; a much smaller fraction is converted by a second enzyme, CYP2D6, into hydromorphone, a considerably stronger opioid. The manufacturer’s own label puts that fraction at under 3% of circulating drug and says only that it may contribute to the effect.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 61,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1522 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 145 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Hydrocodone was first marketed in Germany in 1924 and has been in United States use since the 1940s; the molecule is long out of patent. Recent commercial activity has been in single-ingredient extended-release formulations — Zohydro ER, Hysingla ER, Vantrela ER — which patent the release mechanism rather than the drug. Zohydro ER under NDA 202880 is now listed as discontinued in Drugs@FDA.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The comparison that matters for this molecule has actually been run. Chang and colleagues randomised 416 emergency department patients with moderate to severe acute limb pain to one of four single-dose combinations, one of them non-opioid, and measured pain at two hours. Nothing separated them by a clinically important margin, and the non-opioid arm had the second-largest mean reduction. At about four cents for the two over-the-counter tablets against fifteen cents for the opioid one, the price argument follows the evidence rather than opposing it.',
      conventionalRx: [
        {
          name: 'Ibuprofen 400 mg plus paracetamol 1000 mg',
          class: 'Non-steroidal anti-inflammatory drug plus a centrally acting analgesic',
          howItCompares:
            'Directly compared with hydrocodone 5 mg plus paracetamol 300 mg in a randomised emergency department trial: two-hour pain reduction 4.3 points (95% CI 3.6 to 4.9) against 3.5 (95% CI 2.9 to 4.2) on an 11-point scale, with no statistically significant overall difference across the four arms (p=0.053) and every pairwise gap below the pre-specified minimum clinically important difference of 1.3.',
          typicalCost:
            'US$0.0391 per ibuprofen tablet and US$0.0349 per paracetamol tablet at United States pharmacy acquisition cost (CMS NADAC, medians across 244 and 170 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no controlled-substance status, no respiratory depression, no dependence, cheaper, and measured at least as effective at two hours. Cons: NSAID contraindications in renal impairment, gastrointestinal bleeding risk and cardiovascular caution; the trial did not assess adverse events at all.',
        },
        {
          name: 'Oxycodone plus paracetamol',
          class: 'Full mu-opioid agonist in fixed combination',
          howItCompares:
            'The largest single arm difference in the same trial was between oxycodone-with-paracetamol (4.4) and hydrocodone-with-paracetamol (3.5), a gap of 0.9 (99.2% CI −0.1 to 1.8) that fell below the trial’s own threshold for clinical importance. Oxycodone does not depend on CYP2D6 conversion for its main effect.',
          typicalCost:
            'US$0.1974 per oxycodone tablet at United States pharmacy acquisition cost (CMS NADAC, median across 193 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no reliance on a variable metabolic conversion; slightly larger mean reduction in the one head-to-head trial. Cons: not a statistically or clinically significant advantage; identical class risks; boxed CYP3A4 interaction warning.',
        },
        {
          name: 'Naproxen',
          class: 'Non-steroidal anti-inflammatory drug',
          howItCompares:
            'A long-acting NSAID often used where the pain is inflammatory — musculoskeletal injury, dental pain, gout. It is not an opioid substitute in severe visceral or post-surgical pain, and it is very often a substitute in the injuries that fill an emergency department.',
          typicalCost:
            'US$0.0669 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 110 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: twice-daily dosing, no controlled-substance status, no dependence. Cons: gastrointestinal and renal risk, and contraindicated in several of the populations most likely to be prescribed an opioid.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Count the paracetamol, not the hydrocodone',
          action:
            'Add up every product you are taking that contains paracetamol, including cold and flu remedies.',
          patientImpact:
            'Since January 2011 the FDA has limited prescription combination products to 325 mg of paracetamol per dosage unit and required a boxed warning about the potential for severe liver injury, on the explicit reasoning that liver damage from unintentional overdose is a serious public health problem.',
          clinicalPrecaution:
            'The dose-limiting ingredient in a hydrocodone combination tablet is usually not the opioid. Two different branded remedies can both contain paracetamol without either saying so on the front of the box.',
        },
        {
          name: 'Not for a child’s cough, in any amount',
          action: 'Do not give a prescription hydrocodone cough medicine to anyone under 18.',
          patientImpact:
            'On 11 January 2018 the FDA required labelling changes limiting prescription cough and cold medicines containing hydrocodone or codeine to adults aged 18 and over, and added information on misuse, abuse, addiction, overdose, death and slowed or difficult breathing to the boxed warning. These products are no longer indicated for cough in any paediatric population.',
          clinicalPrecaution:
            'The regulator’s stated basis was that the risks outweigh the benefits in children — a benefit-risk judgement, not a claim that the drug never suppresses a cough.',
        },
        {
          name: 'Say what else the liver is busy with',
          action:
            'Mention azole antifungals, macrolide antibiotics, protease inhibitors and any recently stopped enzyme-inducing drug.',
          patientImpact:
            'The Hysingla ER label records that CYP3A4-mediated N-demethylation to inactive norhydrocodone is the primary metabolic pathway. Inhibiting that pathway leaves more active hydrocodone in circulation.',
          clinicalPrecaution:
            'The same label notes a minor CYP2D6 pathway producing hydromorphone at under 3% of circulating parent drug, so the CYP2D6 story that dominates the codeine page is a much smaller effect here.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1CC[C@]23[C@@H]4[C@H]1CC5=C2C(=C(C=C5)OC)O[C@H]3C(=O)CC4',
      chemicalFormula: 'C18H21NO3',
      molecularWeight: '299.40 g/mol (free base); dispensed as the bitartrate',
      targetReceptorAffinity:
        'A semi-synthetic codeine derivative: the 6-hydroxyl of codeine oxidised to a ketone and the 7,8-double bond reduced. Full mu-opioid agonist. The Hysingla ER label describes a complex metabolic pattern of N-demethylation, O-demethylation and 6-keto reduction; CYP3A4-mediated N-demethylation to inactive norhydrocodone is primary, with lesser contributions from CYP2B6 and CYP2C19, while the minor metabolite hydromorphone represents under 3% of circulating parent hydrocodone. Mean terminal half-life across Hysingla ER strengths is approximately 7 to 9 hours, and 99% of a dose is eliminated within 72 hours.',
      structureSource: {
        label:
          'PubChem CID 5284569 (hydrocodone) — canonical SMILES, molecular formula and weight, as carried on the enriched record and machine-verified by the RNAwiki structure engine; metabolic and elimination figures from the HYSINGLA ER label, section 12.3 (NDA 206627)',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284569',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'hyd-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm codeine or thebaine feedstock and its residual alkaloids',
          description:
            'Hydrocodone is made from codeine or from thebaine, both poppy alkaloids. Residual codeine in a hydrocodone batch is both an impurity and a controlled substance in its own right, so the release specification carries a regulatory as well as a pharmaceutical consequence.',
          reagentsAndBuffer:
            'Codeine and thebaine reference standards, reversed-phase HPLC with ultraviolet detection, LC-MS/MS for trace alkaloid profiling, Karl Fischer titration',
        },
        {
          id: 'hyd-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Isomerise codeine to the 6-ketone and saturate the ring',
          description:
            'Catalytic isomerisation of codeine converts the allylic 6-hydroxyl and 7,8-alkene into the 8-keto and then 6-keto saturated system that defines hydrocodone. The reaction is run with palladium or rhodium catalysts in acid, and the control problem is over-reduction to dihydrocodeine rather than incomplete conversion.',
          dependsOnStepId: 'hyd-w1',
          reagentsAndBuffer:
            'Codeine free base, palladium or rhodium catalyst, dilute acid, controlled hydrogen availability, in-process HPLC monitoring for dihydrocodeine and codeinone',
        },
        {
          id: 'hyd-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Form the bitartrate and release against residual codeine',
          description:
            'Crystallise hydrocodone bitartrate hemipentahydrate and release the batch against specified limits for codeine, dihydrocodeine and other process impurities. The hydration state matters: the bitartrate salt is dispensed on a defined water stoichiometry and drift in it changes the assayed potency.',
          dependsOnStepId: 'hyd-w2',
          reagentsAndBuffer:
            'L-tartaric acid, aqueous ethanol recrystallisation, controlled-humidity drying to the hemipentahydrate, HPLC release assay with validated impurity method, Karl Fischer water determination',
        },
        {
          id: 'hyd-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Test parent and hydromorphone separately, at label-realistic ratios',
          description:
            'The claim that hydrocodone acts substantially through hydromorphone can only be tested by running both molecules as separate test articles and then modelling them at the ratio the label reports — under 3% of circulating parent. A receptor assay of hydromorphone alone confirms it is potent; it does not establish that a trace metabolite carries the clinical effect.',
          dependsOnStepId: 'hyd-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells expressing human OPRM1, [35S]GTPgammaS binding or cyclic AMP inhibition, DAMGO reference agonist, naloxone control, hydrocodone and hydromorphone as separate test articles, recombinant CYP2D6 and CYP3A4 microsomes for the conversion step',
        },
        {
          id: 'hyd-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Quantify the combination tablet for both ingredients at once',
          description:
            'Most hydrocodone reaches patients in a tablet that is more than 95% paracetamol by mass. A release assay that resolves a few milligrams of opioid against 300 milligrams of paracetamol, and that also detects paracetamol content drift, is testing the ingredient that actually limits the dose.',
          dependsOnStepId: 'hyd-w4',
          reagentsAndBuffer:
            'Gradient reversed-phase HPLC with dual-wavelength detection at 280 nm and 254 nm, hydrocodone bitartrate and paracetamol reference standards, USP dissolution apparatus 2 in pH 5.8 phosphate buffer, content uniformity across ten dosage units',
        },
      ],
    },
    keyAudits: [
      {
        id: 'hyd-a1',
        category: 'failed',
        title: 'Head to head in an emergency department, it came last',
        laymanSummary:
          'Four hundred and eleven people with a moderately to severely painful arm or leg injury were randomly given one of four tablets. Hydrocodone with paracetamol produced the smallest average pain reduction of the four. Ibuprofen with paracetamol, which needs no prescription, was second best.',
        technicalDetails:
          'Chang and colleagues randomised 416 patients aged 21 to 64 with moderate to severe acute extremity pain at two urban emergency departments in the Bronx, of whom 411 were analysed (mean age 37, 48% women, 60% Latino). Participants received ibuprofen 400 mg plus paracetamol 1000 mg; oxycodone 5 mg plus paracetamol 325 mg; hydrocodone 5 mg plus paracetamol 300 mg; or codeine 30 mg plus paracetamol 300 mg, 104 per group. Baseline mean pain was 8.7 (SD 1.3) on an 11-point numerical rating scale. At two hours the mean decline was 4.3 (95% CI 3.6 to 4.9) for ibuprofen-paracetamol, 4.4 (3.7 to 5.0) for oxycodone-paracetamol, 3.5 (2.9 to 4.2) for hydrocodone-paracetamol and 3.9 (3.2 to 4.5) for codeine-paracetamol, with an overall p of 0.053. The largest pairwise gap, oxycodone against hydrocodone, was 0.9 (99.2% CI −0.1 to 1.8), below the pre-specified minimum clinically important difference of 1.3. Adverse events were not assessed, which the authors state as a limitation.',
        evidenceSource:
          'Chang AK, Bijur PE, Esses D, Barnaby DP, Baer J. Effect of a Single Dose of Oral Opioid and Nonopioid Analgesics on Acute Extremity Pain in the Emergency Department: A Randomized Clinical Trial. JAMA 2017;318(17):1661-1667 (NCT02455518)',
        doi: '10.1001/jama.2017.16190',
        measuredMetric:
          'Decline in pain on an 11-point numerical rating scale two hours after a single oral dose',
        auditFlag: 'verified',
      },
      {
        id: 'hyd-a2',
        category: 'conclusion_shift',
        title: '137 million prescriptions a year, in the wrong schedule',
        laymanSummary:
          'Hydrocodone combination tablets were Schedule III for decades — refillable, prescribable by telephone — while every other strong opioid was Schedule II. The DEA moved them in 2014, without any new pharmacology.',
        technicalDetails:
          'The Drug Enforcement Administration published its final rule on 22 August 2014 at 79 FR 49661, rescheduling hydrocodone combination products from Schedule III to Schedule II of the Controlled Substances Act, effective 6 October 2014. The rule imposed the full regulatory, administrative, civil and criminal controls applicable to Schedule II on everyone handling these products. In its own regulatory impact analysis the DEA states that hydrocodone combination products are the most prescribed opioid drugs in the United States, with over 137 million prescriptions dispensed in 2013. Single-ingredient hydrocodone had always been Schedule II; the combination products were where the volume was, and the schedule they sat in permitted refills and oral prescriptions that Schedule II does not. Nothing about the molecule changed in 2014. What changed was the regulator’s reading of how the schedule had been used.',
        evidenceSource:
          'Drug Enforcement Administration. Schedules of Controlled Substances: Rescheduling of Hydrocodone Combination Products From Schedule III to Schedule II. Final rule, 79 FR 49661, 22 August 2014, effective 6 October 2014',
        measuredMetric:
          'Prescriptions of hydrocodone combination products dispensed in the United States in 2013: over 137 million, per the DEA final rule',
        auditFlag: 'verified',
      },
      {
        id: 'hyd-a3',
        category: 'conclusion_shift',
        title: 'Approved over its own advisory committee, eleven votes to two',
        laymanSummary:
          'The FDA convened its expert advisory committee on the first single-ingredient extended-release hydrocodone. The committee voted 11 to 2 against recommending approval. The agency approved it anyway, in October 2013. The product is now discontinued.',
        technicalDetails:
          'Zohydro ER, an extended-release hydrocodone bitartrate capsule with no paracetamol and no abuse-deterrent formulation, was reviewed by the FDA Anesthetic and Analgesic Drug Products Advisory Committee, which voted 11 to 2 against recommending approval while agreeing the applicant had met the agency’s efficacy and safety standards; committee members stated that the standards for opioid product approval should be raised given the public health situation. The FDA approved the product on 25 October 2013 under NDA 202880. The approval drew formal objections from members of Congress and from Public Citizen. Drugs@FDA now lists every Zohydro ER product strength under NDA 202880 as discontinued. The instructive point is not that the agency was wrong to overrule its committee — advisory votes are advisory — but that the same evidence supported both a positive regulatory decision and an eleven-to-two vote against, because the committee was weighing something the approval standard does not measure.',
        evidenceSource:
          'FDA Drugs@FDA record for NDA 202880 (ZOHYDRO ER), all strengths listed as discontinued; FDA Anesthetic and Analgesic Drug Products Advisory Committee vote of 11-2 against approval, December 2012',
        inferredClaim:
          'That meeting the statutory efficacy and safety standard settles whether an opioid product should reach the market — a position eleven of thirteen advisory committee members rejected for this product',
        auditFlag: 'contested',
      },
      {
        id: 'hyd-a4',
        category: 'measured',
        title: 'The ingredient that limits the dose is the paracetamol',
        laymanSummary:
          'In a hydrocodone combination tablet, the opioid is a few milligrams and the paracetamol is hundreds. The FDA capped the paracetamol at 325 mg per tablet and put a boxed warning about liver failure on every prescription product containing it.',
        technicalDetails:
          'On 14 January 2011 the FDA published notice at 76 FR 2691, "Prescription Drug Products Containing Acetaminophen; Actions To Reduce Liver Injury From Unintentional Overdose", reducing the maximum dosage unit strength of paracetamol in prescription drug products to 325 mg and requiring safety labelling changes including a new boxed warning about the risk of liver damage. The agency’s stated reasoning was that liver damage due to paracetamol overdosing is a serious public health problem and that a lower unit strength provides an increased margin of safety. Manufacturers were given until January 2014. The mechanism of the problem is arithmetic rather than pharmacological: a patient in pain takes more tablets, and the ingredient they exceed first is the one they were not thinking about.',
        evidenceSource:
          'Food and Drug Administration. Prescription Drug Products Containing Acetaminophen; Actions To Reduce Liver Injury From Unintentional Overdose. 76 FR 2691, 14 January 2011',
        measuredMetric:
          'Maximum permitted paracetamol content per dosage unit in a prescription combination product: 325 mg',
        auditFlag: 'verified',
      },
      {
        id: 'hyd-a5',
        category: 'inferred',
        title: 'The prodrug story is much smaller than it is usually told',
        laymanSummary:
          'Hydrocodone is often described the way codeine is: inactive until a liver enzyme converts it into something strong. The manufacturer’s own label says the strong metabolite is under 3% of what circulates, and only that it may contribute.',
        technicalDetails:
          'The Hysingla ER label states that hydrocodone exhibits a complex pattern of metabolism including N-demethylation, O-demethylation and 6-keto reduction; that CYP3A4-mediated N-demethylation to inactive norhydrocodone is the primary metabolic pathway with lower contributions from CYP2B6 and CYP2C19; and that the minor metabolite hydromorphone, under 3% of circulating parent hydrocodone, is mainly formed by CYP2D6-mediated O-demethylation with smaller contributions from CYP2B6 and CYP2C19. It then says only that hydromorphone "may contribute to the total analgesic effect of hydrocodone." That is a much weaker statement than the one made about codeine, whose activity is attributed to morphine conversion outright. Treating hydrocodone as a CYP2D6-dependent prodrug — and therefore predicting failure in poor metabolisers and danger in ultrarapid ones — extends a mechanism established for a different molecule onto a label that declines to make the claim.',
        evidenceSource:
          'HYSINGLA ER (hydrocodone bitartrate extended-release tablets) United States prescribing information, Clinical Pharmacology 12.3 (NDA 206627)',
        inferredClaim:
          'That hydrocodone acts chiefly through CYP2D6 conversion to hydromorphone, as codeine acts through conversion to morphine — a claim the label puts at under 3% of circulating drug and qualifies with "may contribute"',
        auditFlag: 'contested',
      },
      {
        id: 'hyd-a6',
        category: 'conclusion_shift',
        title: 'Seventy years as a cough medicine, ended for anyone under eighteen',
        laymanSummary:
          'Hydrocodone syrups were given to children for cough for decades. On 11 January 2018 the FDA required the labels to be changed so the products are for adults only, on the reasoning that the risks outweigh the benefits in children.',
        technicalDetails:
          'The FDA required safety labelling changes for prescription cough and cold medicines containing hydrocodone or codeine, limiting their use to adults aged 18 and over, and required the addition of information on misuse, abuse, addiction, overdose, death and slowed or difficult breathing to the boxed warning. After the changes, these products are no longer indicated to treat cough in any paediatric population. The agency stated that the risks — slowed or difficult breathing, misuse, abuse, addiction, overdose and death — appear greater in children and adolescents under 18, and that the benefit-risk balance no longer supported paediatric use. This is a conclusion shift on an indication that predates the modern trial era: the antitussive use was established by observation and custom rather than by paediatric randomised trials, and it was withdrawn on the harm side of the ledger rather than because the benefit was disproved.',
        evidenceSource:
          'FDA Drug Safety Communication, 11 January 2018: FDA requires labeling changes for prescription opioid cough and cold medicines to limit their use to adults 18 years and older',
        inferredClaim:
          'That an antitussive benefit established in adults by long custom transfers to children — a transfer the FDA reversed in 2018 on benefit-risk grounds',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Usually arriving inside a paracetamol tablet',
        laymanDesc:
          'Most hydrocodone is dispensed as a combination tablet: five or ten milligrams of opioid alongside three hundred of paracetamol. Single-ingredient slow-release versions exist and are a much smaller part of the picture.',
        molecularDetail:
          'Hydrocodone bitartrate hemipentahydrate in immediate-release combination tablets, or as single-entity extended-release capsules and tablets. Since January 2011 the paracetamol content of a prescription combination unit is capped at 325 mg by FDA action at 76 FR 2691.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver mostly destroys it, and slightly upgrades it',
        laymanDesc:
          'One enzyme turns most of the dose into an inactive by-product. A second turns a small fraction into a much stronger opioid — under three per cent of what is circulating, according to the manufacturer.',
        molecularDetail:
          'CYP3A4-mediated N-demethylation to inactive norhydrocodone is primary, with contributions from CYP2B6 and CYP2C19. CYP2D6-mediated O-demethylation yields hydromorphone at under 3% of circulating parent. Mean terminal half-life for extended-release hydrocodone is approximately 7 to 9 hours and 99% of a dose is eliminated within 72 hours.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Full agonism at the mu receptor',
        laymanDesc:
          'What reaches the brain binds the same receptor as morphine and turns it fully on.',
        molecularDetail:
          'Full agonism at the Gi/o-coupled mu-opioid receptor: adenylyl cyclase inhibition, GIRK channel opening, N-type calcium channel closure, neuronal hyperpolarisation and reduced transmitter release.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And at the cough centre, which is a separate circuit',
        laymanDesc:
          'The reflex that makes you cough is generated in the brainstem and carries opioid receptors of its own. That is why the same molecule was a painkiller and a cough syrup for seventy years.',
        molecularDetail:
          'Opioid suppression of the medullary cough centre and of afferent input from airway rapidly adapting receptors. Since 11 January 2018 prescription hydrocodone cough products are labelled for adults 18 and over only, and are not indicated for cough in any paediatric population.',
        iconName: 'Wind',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Two hours later, on the pain scale',
        laymanDesc:
          'In the one randomised head-to-head trial, average pain fell 3.5 points out of ten — the smallest fall of the four tablets tested, and not significantly different from any of them.',
        molecularDetail:
          'Chang 2017: mean two-hour decline in numerical rating scale pain 3.5 (95% CI 2.9 to 4.2) for hydrocodone 5 mg plus paracetamol 300 mg, against 4.3 for ibuprofen 400 mg plus paracetamol 1000 mg, 4.4 for oxycodone-paracetamol and 3.9 for codeine-paracetamol; overall p=0.053 across 411 analysed patients.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The dose ceiling belongs to the other ingredient',
        laymanDesc:
          'What stops someone taking more combination tablets is usually the liver risk from paracetamol, not the opioid. The regulator capped that ingredient and put a boxed warning on it.',
        molecularDetail:
          'Paracetamol hepatotoxicity is a saturable-conjugation problem: once glucuronidation and sulfation saturate, the reactive intermediate NAPQI depletes glutathione and binds hepatocyte protein. The FDA capped prescription combination units at 325 mg and required a boxed warning, on the stated basis that unintentional overdose is a serious public health problem.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT02455518 (Chang et al., JAMA 2017;318:1661-1667)',
        phase: 'Randomised clinical trial, two urban emergency departments',
        sampleSize: 416,
        primaryEndpoint:
          'Between-group difference in decline in pain on an 11-point numerical rating scale two hours after a single oral dose, comparing ibuprofen-paracetamol, oxycodone-paracetamol, hydrocodone-paracetamol and codeine-paracetamol in acute extremity pain',
        endpointMet: false,
        statisticalPValue:
          'Overall p=0.053; mean two-hour decline 4.3 ibuprofen-paracetamol, 4.4 oxycodone-paracetamol, 3.5 hydrocodone-paracetamol, 3.9 codeine-paracetamol; largest pairwise difference 0.9 (99.2% CI −0.1 to 1.8) against a pre-specified minimum clinically important difference of 1.3',
        unreportedAdverseSignals:
          'Adverse events were not assessed in this trial, which the authors identify as a limitation and which matters because the four arms differ substantially in expected adverse-effect profile. 411 of 416 randomised patients were analysed.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NDA 202880 (ZOHYDRO ER) advisory committee review and approval',
        phase: 'Regulatory review, FDA Anesthetic and Analgesic Drug Products Advisory Committee',
        sampleSize: 13,
        primaryEndpoint:
          'Advisory committee vote on whether to recommend approval of single-entity extended-release hydrocodone bitartrate without an abuse-deterrent formulation',
        endpointMet: false,
        statisticalPValue:
          'Vote 11 to 2 against recommending approval, with the committee agreeing the applicant had met the agency’s efficacy and safety standards',
        unreportedAdverseSignals:
          'The FDA approved the product on 25 October 2013 notwithstanding the vote. Drugs@FDA now lists all ZOHYDRO ER strengths under NDA 202880 as discontinued. This row records a regulatory vote rather than a clinical trial and is included because it is the measurement that most directly captures expert judgement on this product.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Mean two-hour pain reduction of 3.5 points (95% CI 2.9 to 4.2) with hydrocodone 5 mg plus paracetamol 300 mg in 411 randomised emergency department patients — the smallest of four arms, none significantly different',
        'Over 137 million hydrocodone combination product prescriptions dispensed in the United States in 2013, per the DEA final rule',
        'Hydromorphone at under 3% of circulating parent hydrocodone, from the manufacturer’s label',
        'Mean terminal half-life of approximately 7 to 9 hours across extended-release strengths, with 99% of a dose eliminated within 72 hours',
      ],
      unsupportedInferences: [
        'That hydrocodone works chiefly by CYP2D6 conversion to hydromorphone, when the label puts that metabolite under 3% and says only that it may contribute',
        'That the opioid component is what limits how many combination tablets a person can safely take — in practice the paracetamol ceiling binds first',
        'That an antitussive benefit observed in adults transferred to children, an inference the FDA reversed in January 2018',
        'That Schedule III placement reflected a lower pharmacological risk rather than an accident of how combination products were classified',
      ],
      whatFailedInitially: [
        'The head-to-head comparison: hydrocodone-paracetamol had the smallest mean pain reduction of the four tablets tested, including the non-opioid one',
        'The advisory committee vote on Zohydro ER, 11 to 2 against, which the FDA overruled and whose product is now discontinued',
        'The paediatric cough indication, withdrawn by labelling change on 11 January 2018',
        'The original paracetamol strengths, capped at 325 mg per dosage unit with a boxed liver-injury warning in January 2011',
      ],
      realWorldOutcome: [
        'Rescheduled from Schedule III to Schedule II effective 6 October 2014, imposing full Schedule II controls on the most prescribed opioid products in the United States',
        'Zohydro ER, approved over an 11-2 advisory committee vote against, now listed as discontinued in Drugs@FDA',
        'Prescription cough products containing hydrocodone restricted to adults aged 18 and over since January 2018',
        'About fifteen United States cents per tablet at pharmacy acquisition cost, still one of the most-dispensed analgesics in the country',
      ],
    },
    deliverySystem: {
      type: 'Oral immediate-release tablets, capsules and solution, almost always in fixed combination with paracetamol or ibuprofen; single-entity oral extended-release tablets and capsules; oral antitussive solutions for adults only. Schedule II controlled substance in the United States since 6 October 2014.',
      description:
        'Immediate-release combination tablets act within about an hour and are dosed several times a day. The single-entity extended-release products were developed specifically to remove the paracetamol ceiling that limits how much hydrocodone a combination tablet can carry, which is also the reason they attracted the regulatory controversy they did. Extended-release terminal half-life is approximately 7 to 9 hours.',
      safetyProfile:
        'Class boxed warnings for addiction, abuse and misuse; life-threatening respiratory depression; accidental ingestion; neonatal opioid withdrawal syndrome; risks from concomitant benzodiazepines, other CNS depressants and alcohol; the opioid analgesic REMS; and CYP3A4 interaction. Combination products carry an additional boxed warning for hepatotoxicity from paracetamol, and every prescription combination unit has been limited to 325 mg of paracetamol since the FDA action of January 2011. Prescription cough products containing hydrocodone are contraindicated in anyone under 18.',
    },
    commonQuestions: [
      {
        q: 'Is hydrocodone weaker than oxycodone?',
        a: 'In the one randomised head-to-head trial, the difference was smaller than the trial’s own threshold for mattering. Chang and colleagues gave 411 emergency department patients with acute limb pain one of four single-dose tablets. Two hours later, average pain had fallen 4.4 points on oxycodone-paracetamol and 3.5 on hydrocodone-paracetamol — a gap of 0.9, with a 99.2% confidence interval of −0.1 to 1.8, against a pre-specified minimum clinically important difference of 1.3. The overall comparison across all four arms gave p=0.053. So: numerically behind, not statistically or clinically distinguishable.',
        auditNote:
          'A difference that fails to reach the threshold the investigators set in advance is not a small difference. It is an unmeasured one.',
      },
      {
        q: 'Why did the schedule change in 2014, and did the drug change?',
        a: 'The drug did not change. Hydrocodone on its own had always been Schedule II; the combination tablets — which is where essentially all the volume was — sat in Schedule III, which allowed refills and telephoned prescriptions. The DEA moved them to Schedule II by final rule at 79 FR 49661, effective 6 October 2014. In the same document the agency records that hydrocodone combination products were the most prescribed opioid drugs in the United States, with over 137 million prescriptions dispensed in 2013. The rescheduling was a correction of a classification, not a response to new pharmacology.',
      },
      {
        q: 'Should I worry more about the hydrocodone or the paracetamol?',
        a: 'Both, for different reasons, and the paracetamol is the one people miss. A combination tablet is a few milligrams of opioid and hundreds of milligrams of paracetamol, and someone in pain who takes an extra tablet, plus a cold remedy that also contains paracetamol, can reach a hepatotoxic total without ever exceeding a sensible opioid dose. The FDA capped prescription combination units at 325 mg of paracetamol in January 2011 and required a boxed warning about severe liver injury, stating that liver damage from unintentional overdose is a serious public health problem.',
      },
      {
        q: 'Does it depend on the same enzyme as codeine?',
        a: 'Much less than it is usually said to. Codeine is essentially inactive until CYP2D6 converts it to morphine, which is why CYP2D6 status changes everything for codeine. Hydrocodone is active in its own right, and its manufacturer’s label describes CYP3A4-mediated conversion to inactive norhydrocodone as the primary pathway, with CYP2D6 producing hydromorphone at under 3% of circulating parent drug and only "may contribute to the total analgesic effect". The interaction to raise with a prescriber is therefore CYP3A4 — antifungals, macrolides, protease inhibitors — rather than the CYP2D6 story that dominates the codeine page.',
      },
      {
        q: 'Why was Zohydro ER controversial?',
        a: 'Because the FDA approved it in October 2013 after its own Anesthetic and Analgesic Drug Products Advisory Committee voted 11 to 2 against recommending approval. The committee accepted that the applicant had met the agency’s efficacy and safety standards, and objected on a different ground: that the standards for approving an opioid should be raised given what was then happening. The product was single-ingredient extended-release hydrocodone with no abuse-deterrent formulation. Members of Congress and Public Citizen objected formally. Drugs@FDA now lists every strength of it as discontinued.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Chang AK, Bijur PE, Esses D, Barnaby DP, Baer J. Effect of a Single Dose of Oral Opioid and Nonopioid Analgesics on Acute Extremity Pain in the Emergency Department: A Randomized Clinical Trial. JAMA 2017;318(17):1661-1667',
        identifier: '10.1001/jama.2017.16190',
        kind: 'doi',
      },
      {
        label: 'Chang trial registration — ClinicalTrials.gov NCT02455518',
        identifier: 'NCT02455518',
        kind: 'nct',
      },
      {
        label:
          'Drug Enforcement Administration. Schedules of Controlled Substances: Rescheduling of Hydrocodone Combination Products From Schedule III to Schedule II. 79 FR 49661, 22 August 2014, effective 6 October 2014',
        identifier:
          'https://www.federalregister.gov/documents/2014/08/22/2014-19922/schedules-of-controlled-substances-rescheduling-of-hydrocodone-combination-products-from-schedule',
        kind: 'regulatory',
      },
      {
        label:
          'Food and Drug Administration. Prescription Drug Products Containing Acetaminophen; Actions To Reduce Liver Injury From Unintentional Overdose. 76 FR 2691, 14 January 2011',
        identifier:
          'https://www.federalregister.gov/documents/2011/01/14/2011-709/prescription-drug-products-containing-acetaminophen-actions-to-reduce-liver-injury-from',
        kind: 'regulatory',
      },
      {
        label:
          'Hydrocodone bitartrate and homatropine methylbromide United States prescribing information — Indications 1: indicated for the symptomatic relief of cough in patients 18 years of age and older, not indicated under 18, contraindicated under 6. This labelling implements the FDA Drug Safety Communication of 11 January 2018 restricting prescription opioid cough and cold medicines to adults',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=hydrocodone+bitartrate+and+homatropine+methylbromide',
        kind: 'regulatory',
      },
      {
        label:
          'HYSINGLA ER (hydrocodone bitartrate extended-release tablets) United States prescribing information — Clinical Pharmacology 12.3 (NDA 206627)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=206627',
        kind: 'regulatory',
      },
      {
        label:
          'FDA Drugs@FDA record for ZOHYDRO ER (NDA 202880), approved 25 October 2013, all strengths now listed as discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=202880',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — hydrocodone, 145 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5284569 — hydrocodone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284569',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Codeine — a prodrug of which 5 to 10% becomes morphine, at a rate set by an enzyme whose
  //    variants killed children, and whose own Cochrane number-needed-to-treat is 12.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'codeine',
    name: 'Codeine',
    tradeName: 'Codeine Sulfate; also Tylenol with Codeine and many combination and cough products',
    sponsor:
      'ANI Pharmaceuticals (holder on the enriched record, NDA 022402); the molecule is made by many manufacturers worldwide',
    targetGene: 'CYP2D6 and OPRM1 — the enzyme decides the dose, the receptor produces the effect',
    targetProtein:
      'Mu-opioid receptor; codeine itself has low affinity for it and acts chiefly through the morphine formed from it by cytochrome P450 2D6',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1952,
    indication:
      'Management of mild to moderate pain where treatment with an opioid is appropriate and for which alternative treatments are inadequate. Contraindicated in all children younger than 12 years, and for post-operative management in anyone younger than 18 after tonsillectomy or adenoidectomy. Prescription cough products containing codeine are labelled for adults aged 18 and over only.',
    patientFriendlyIndication:
      'Mild to moderate pain where an opioid is appropriate and other treatments have not worked',
    anatomicalSite:
      'The liver, where CYP2D6 converts a small fraction of the dose into morphine, and then the mu-opioid receptors of the spinal cord and brainstem where that morphine acts',
    conditionContext: {
      conditionExplainer:
        'Codeine is usually described as a weak opioid. It is more accurate to say it is not really an opioid until the liver makes it one. About 5 to 10% of a dose is converted to morphine, and how fast that happens is set by a gene that varies enormously between people and between populations.',
      whyItMatters:
        'That variation is not academic. Children died after routine tonsil surgery because they carried extra copies of the converting enzyme and turned a normal dose into a morphine overdose. A breastfed newborn died after his mother was prescribed codeine. Regulators responded by contraindicating the drug in whole age groups. It is the clearest case in common medicine of a drug whose dose is decided by the patient’s genome rather than by the prescription.',
      whoTakesThis:
        'Adults with mild to moderate pain, and adults with a cough. Not children under 12 at all, not anyone under 18 after tonsillectomy or adenoidectomy, and not recommended in breastfeeding.',
      clinicalGoals:
        'Less pain over four to six hours. The measured size of that effect is small: in the Cochrane review, 26% of people on codeine 60 mg reached at least half pain relief against 17% on placebo.',
    },
    oneSentenceVerdict:
      'A prodrug of which only 5 to 10% becomes morphine, at a rate set by CYP2D6 gene copy number, giving a Cochrane number-needed-to-treat of 12 (95% CI 8.4 to 18) for at least half pain relief after surgery — 26% responding against 17% on placebo — and a boxed warning built out of children who died after tonsillectomy because their copy of the enzyme worked too well.',
    laymanHowItWorks:
      'Codeine on its own barely binds the opioid receptor. It becomes a painkiller only because a liver enzyme called CYP2D6 strips a methyl group off it and turns roughly one part in twelve into morphine. Everything that follows is morphine pharmacology. The catch is that the number of working copies of the CYP2D6 gene varies: people with none get almost no pain relief, and people with extra copies convert far more than expected and can reach a morphine overdose from an ordinary tablet. That is why the drug is now forbidden in young children, and why the same tablet is close to useless in one adult and dangerous in another.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 52,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2757 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 37 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Codeine was isolated from opium by Pierre-Jean Robiquet in 1832 and has no meaningful patent history. It is on the WHO Model List of Essential Medicines. Most of the world’s pharmaceutical codeine is extracted from poppy straw rather than methylated from morphine, and the alkaloid remains cheap; the interesting economics are in the combination and cough products built around it rather than in the molecule.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Codeine is one of the few opioids for which a plain non-opioid alternative measures clearly better rather than merely comparably. In the Cochrane overview of single-dose postoperative analgesics, codeine 60 mg is at the far end of the number-needed-to-treat table at 12, and ibuprofen 200 mg plus paracetamol 500 mg is at the near end at 1.6. In the four-arm emergency department trial, codeine with paracetamol was not distinguishable from ibuprofen with paracetamol. Nothing about that comparison requires an opioid, and the alternative has no CYP2D6 lottery attached to it.',
      conventionalRx: [
        {
          name: 'Ibuprofen plus paracetamol (acetaminophen)',
          class: 'Non-steroidal anti-inflammatory drug plus a centrally acting analgesic',
          howItCompares:
            'Ibuprofen 200 mg plus paracetamol 500 mg has a Cochrane number-needed-to-treat of 1.6 (95% CI 1.5 to 1.8) for at least 50% postoperative pain relief; codeine 60 mg alone has an NNT of 12 (8.4 to 18), and 21 (12 to 96) after dental surgery. In the head-to-head emergency department trial, ibuprofen 400 mg plus paracetamol 1000 mg gave a two-hour pain reduction of 4.3 points against 3.9 for codeine 30 mg plus paracetamol 300 mg.',
          typicalCost:
            'US$0.0391 per ibuprofen tablet and US$0.0349 per paracetamol tablet at United States pharmacy acquisition cost (CMS NADAC, medians across 244 and 170 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: an order of magnitude better on the measured number-needed-to-treat, no metabolic lottery, no controlled-substance status, no dependence, and safe in the children in whom codeine is contraindicated. Cons: NSAID gastrointestinal and renal risk, and paracetamol hepatotoxicity in overdose.',
        },
        {
          name: 'Morphine, immediate release',
          class: 'Full mu-opioid agonist',
          howItCompares:
            'The molecule codeine is trying to become. Giving morphine directly removes the conversion step entirely, so the dose delivered is the dose intended regardless of CYP2D6 genotype. Where an opioid is genuinely needed, this is the honest way to give one.',
          typicalCost:
            'US$0.4096 per millilitre of oral solution at United States pharmacy acquisition cost (CMS NADAC, median across 75 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: predictable exposure, no dependence on an enzyme the patient may lack or have too much of. Cons: full opioid risks from the first dose, Schedule II handling, and no pretence of being a mild drug.',
        },
        {
          name: 'Tramadol',
          class: 'Mu-opioid agonist and monoamine reuptake inhibitor, also a CYP2D6 prodrug',
          howItCompares:
            'Frequently used as the replacement when codeine is restricted — and it carries the same CYP2D6 dependency, which is why the FDA restricted both in the same 2017 communication. After that communication, codeine dispensing to children fell 26% immediately while tramadol dispensing to children rose 22%.',
          typicalCost:
            'US$0.0245 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 44 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper, and a second mechanism through serotonin and noradrenaline reuptake. Cons: the identical ultrarapid-metaboliser hazard, plus seizure risk and serotonin syndrome with serotonergic drugs. Substituting it for codeine in a child does not solve the problem that made codeine dangerous.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Not for children, at any dose, for anything',
          action: 'Do not give codeine to a child under 12, and never after tonsil surgery.',
          patientImpact:
            'The label contraindicates codeine sulfate in all children younger than 12 and for post-operative management in anyone younger than 18 following tonsillectomy or adenoidectomy, and records that life-threatening respiratory depression and death have occurred in children who received it, most cases after those operations and many in children with evidence of ultra-rapid metabolism.',
          clinicalPrecaution:
            'The label also directs avoiding codeine in adolescents aged 12 to 18 with obstructive sleep apnoea, obesity, severe pulmonary disease, neuromuscular disease or postoperative status.',
        },
        {
          name: 'Not while breastfeeding',
          action: 'Tell the prescriber if you are breastfeeding.',
          patientImpact:
            'The label states that at least one death was reported in a nursing infant exposed to high levels of morphine in breast milk because the mother was an ultra-rapid metaboliser of codeine, and that breastfeeding is not recommended during treatment.',
          clinicalPrecaution:
            'The infant’s exposure depends on the mother’s CYP2D6 genotype, which neither of them will usually know.',
        },
        {
          name: 'Ask what else touches CYP2D6',
          action:
            'Mention paroxetine, fluoxetine, bupropion, quinidine and any other strong CYP2D6 inhibitor.',
          patientImpact:
            'The label says the effects of using or stopping CYP3A4 inducers, CYP3A4 inhibitors or CYP2D6 inhibitors alongside codeine are complex and require careful consideration of the effects on both codeine and its active metabolite morphine.',
          clinicalPrecaution:
            'A strong CYP2D6 inhibitor turns a normal metaboliser into a functional poor one, which does not make codeine safer so much as it makes it inert.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1CC[C@]23[C@@H]4[C@H]1CC5=C2C(=C(C=C5)OC)O[C@H]3[C@H](C=C4)O',
      chemicalFormula: 'C18H21NO3',
      molecularWeight: '299.40 g/mol (free base); dispensed as the sulfate or phosphate',
      targetReceptorAffinity:
        'Morphine with its 3-hydroxyl methylated — a single methyl group, which is the entire difference and the reason the molecule barely binds the receptor until the body removes it. The codeine sulfate label records that 70 to 80% of a dose is glucuronidated to codeine-6-glucuronide, about 5 to 10% is O-demethylated by CYP2D6 to morphine, and about 10% is N-demethylated by CYP3A4 to norcodeine. Morphine and morphine-6-glucuronide have analgesic activity in humans; norcodeine and morphine-3-glucuronide are not considered to. Plasma half-life of codeine and its metabolites is approximately 3 hours, and about 90% of the dose is excreted renally.',
      structureSource: {
        label:
          'PubChem CID 5284371 (codeine) — canonical SMILES, molecular formula and weight, as carried on the enriched record and machine-verified by the RNAwiki structure engine; metabolism and excretion figures from the Codeine Sulfate Tablets label, section 12.3 (NDA 022402)',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284371',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cod-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Separate codeine from morphine in the extract',
          description:
            'Codeine and morphine differ by one methyl group and travel together out of the poppy. The assay that matters is the one that resolves them, because residual morphine in a codeine batch is a more potent controlled substance present as an impurity, and because the two co-elute on careless methods.',
          reagentsAndBuffer:
            'Codeine phosphate and morphine sulfate reference standards, reversed-phase HPLC with an ion-pairing modifier, ultraviolet detection at 285 nm, LC-MS/MS confirmation of the 14 Da mass difference',
        },
        {
          id: 'cod-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Methylate morphine, or take codeine straight from the plant',
          description:
            'Both routes are in commercial use. Where poppy straw is rich in codeine it is extracted directly; where it is not, morphine is 3-O-methylated. Selective methylation of the phenolic 3-hydroxyl without touching the allylic 6-hydroxyl is the whole synthetic problem, and over-methylation gives heterocodeine, a far more potent compound that must be controlled.',
          dependsOnStepId: 'cod-w1',
          reagentsAndBuffer:
            'Morphine free base, phenyltrimethylammonium salts or dimethyl sulfate under controlled base, anhydrous polar aprotic solvent, in-process HPLC for heterocodeine and dimethylmorphine',
        },
        {
          id: 'cod-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the phosphate or sulfate and specify residual morphine',
          description:
            'Form and recrystallise the salt, then release the batch against a specified limit for morphine and for the regioisomeric methylation products. This is where a controlled-substance impurity specification and a potency specification are the same specification.',
          dependsOnStepId: 'cod-w2',
          reagentsAndBuffer:
            'Phosphoric or sulfuric acid, aqueous ethanol recrystallisation, activated carbon, controlled-humidity drying, HPLC release assay with a validated morphine impurity method',
        },
        {
          id: 'cod-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Run the conversion in CYP2D6 genotypes separately, not in a pooled preparation',
          description:
            'A pooled human liver microsome preparation reports an average conversion rate that belongs to no individual. The whole clinical problem with codeine is the spread, so the experiment has to use recombinant CYP2D6 variants and genotyped hepatocytes across poor, normal, and ultrarapid phenotypes, measuring morphine formed per unit codeine in each.',
          dependsOnStepId: 'cod-w3',
          reagentsAndBuffer:
            'Recombinant CYP2D6 isoforms including *1/*1xN duplications and null alleles, genotyped primary human hepatocytes, NADPH regenerating system, quinidine as a selective CYP2D6 inhibitor control, LC-MS/MS quantification of codeine, morphine, C6G, M3G and M6G',
        },
        {
          id: 'cod-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Report the morphine-to-codeine ratio, not the codeine level',
          description:
            'A plasma codeine concentration says nothing useful about what a patient is experiencing, because the active species is morphine and its formation rate is the variable. The clinically informative readout is the morphine to codeine ratio alongside genotype, which is exactly what the fatal paediatric cases showed at post-mortem.',
          dependsOnStepId: 'cod-w4',
          reagentsAndBuffer:
            'LC-MS/MS with deuterated codeine, morphine, M3G and M6G internal standards, solid-phase extraction from plasma or post-mortem blood, paired CYP2D6 genotyping by copy-number-aware assay',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cod-a1',
        category: 'measured',
        title: 'A number needed to treat of twelve, and twenty-one after dental surgery',
        laymanSummary:
          'Pooling every placebo-controlled trial of a single 60 mg dose after surgery, twelve people had to take codeine for one extra person to get at least half their pain relieved. After dental surgery it was twenty-one. Twenty-six per cent responded on codeine; seventeen per cent responded on placebo.',
        technicalDetails:
          'Derry, Moore and McQuay included 35 studies in which 1,223 participants received codeine 60 mg, 27 received codeine 90 mg and 1,252 received placebo. Across all surgery types (33 studies, 2,411 participants) codeine 60 mg gave a number-needed-to-treat for at least 50% pain relief over four to six hours of 12 (95% CI 8.4 to 18). At least 50% pain relief was achieved by 26% on codeine 60 mg against 17% on placebo. After dental surgery the NNT was 21 (12 to 96) across 15 studies and 1,146 participants; after other surgery it was 6.8 (4.6 to 13) across 18 studies and 1,265 participants. The NNT to prevent rescue medication within four to six hours was 11 (6.3 to 50), with mean time to rescue 2.7 hours on codeine against 2.0 on placebo. More participants reported adverse events on codeine than placebo, though the difference was not significant and none were serious. For scale, the same Cochrane programme puts ibuprofen 200 mg plus paracetamol 500 mg at an NNT of 1.6.',
        evidenceSource:
          'Derry S, Moore RA, McQuay HJ. Single dose oral codeine, as a single agent, for acute postoperative pain in adults. Cochrane Database Syst Rev 2010;(4):CD008099',
        doi: '10.1002/14651858.CD008099.pub2',
        measuredMetric:
          'Number needed to treat for at least 50% pain relief over four to six hours with codeine 60 mg against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'cod-a2',
        category: 'conclusion_shift',
        title: 'Children died, and the drug was contraindicated in an entire age group',
        laymanSummary:
          'Children given codeine after routine tonsil surgery stopped breathing and died. Post-mortem work showed they carried extra copies of the gene that turns codeine into morphine. Codeine is now forbidden in every child under twelve.',
        technicalDetails:
          'Ciszkowski, Madadi, Phillips, Lauwers and Koren reported a post-tonsillectomy death in a child with an ultrarapid-metaboliser CYP2D6 genotype in the New England Journal of Medicine in 2009. The FDA added a boxed warning in 2013 contraindicating codeine after tonsillectomy or adenoidectomy in children, and on 20 April 2017 issued a Drug Safety Communication contraindicating codeine in all children under 12, contraindicating tramadol under 12 and after tonsillectomy or adenoidectomy under 18, warning against both in adolescents with obesity or conditions predisposing to respiratory depression, and recommending against breastfeeding on either drug. The current Codeine Sulfate Tablets label carries all of this: contraindication in all children younger than 12 and for post-operative management under 18 after tonsillectomy or adenoidectomy, with the boxed warning stating that life-threatening respiratory depression and death have occurred in children who received codeine, that most reported cases followed those operations, and that many of the children had evidence of ultra-rapid metabolism due to a CYP2D6 polymorphism.',
        evidenceSource:
          'Ciszkowski C, Madadi P, Phillips MS, Lauwers AE, Koren G. Codeine, ultrarapid-metabolism genotype, and postoperative death. N Engl J Med 2009;361(8):827-828; Codeine Sulfate Tablets United States prescribing information, boxed warning and Contraindications 4 (NDA 022402)',
        doi: '10.1056/NEJMc0904266',
        inferredClaim:
          'That codeine is a mild opioid safe for routine paediatric use — a position held for most of a century and reversed to a contraindication in every child under 12',
        auditFlag: 'verified',
      },
      {
        id: 'cod-a3',
        category: 'conclusion_shift',
        title: 'The breastfeeding case report now carries an expression of concern',
        laymanSummary:
          'A 2006 Lancet case report of a newborn who died of morphine poisoning through breast milk became one of the most cited reasons for warning mothers off codeine. In February 2026 The Lancet published an expression of concern about that report.',
        technicalDetails:
          'Koren, Cairns, Chitayat, Gaedigk and Leeder reported in The Lancet in 2006 the death of a breastfed neonate whose mother, prescribed codeine, was a CYP2D6 ultrarapid metaboliser. On 14 February 2026 (published online 3 February 2026) the editors of The Lancet issued an Expression of Concern regarding that report. An expression of concern is not a retraction and does not by itself invalidate the finding; it signals that the editors have unresolved questions about the work. The regulatory position does not rest on that single paper — the current codeine label states independently that at least one death was reported in a nursing infant exposed to high levels of morphine in breast milk because the mother was an ultra-rapid metaboliser, and the pharmacological mechanism is the same one demonstrated in the post-tonsillectomy deaths. But a reader tracing the breastfeeding warning back to its most-cited source should know what has happened to that source.',
        evidenceSource:
          'Koren G, Cairns J, Chitayat D, Gaedigk A, Leeder SJ. Pharmacogenetics of morphine poisoning in a breastfed neonate of a codeine-prescribed mother. Lancet 2006;368(9536):704; Expression of Concern, Lancet 2026;407(10529):659',
        doi: '10.1016/S0140-6736(26)00245-X',
        inferredClaim:
          'That a single 2006 case report established the breastfeeding hazard — the report is now under an editorial expression of concern, while the label’s warning and the underlying pharmacogenetic mechanism stand on separate evidence',
        auditFlag: 'contested',
      },
      {
        id: 'cod-a4',
        category: 'failed',
        title: 'Restricting codeine in children pushed prescribers to a drug with the same defect',
        laymanSummary:
          'After the 2017 FDA communication, codeine dispensing to children fell by a quarter. Tramadol dispensing to children rose by a fifth — and tramadol depends on the same enzyme, which is exactly why the same communication restricted it too.',
        technicalDetails:
          'Renny, Jent, Townsend and Cerdá ran an interrupted time series with segmented regression on 2014-2019 opioid dispensing to patients under 18 from the IQVIA Longitudinal Prescription Database, which covers 86% to 92% of United States retail pharmacy prescriptions, comprising about 1.92 million codeine prescriptions for children and 2.40 million for adolescents plus 514,090 tramadol prescriptions for children and 1.06 million for adolescents. After April 2017, codeine dispensing to children fell immediately by 26% (IRR 0.742, 95% CI 0.684 to 0.806) with a sustained 5% monthly decline (IRR 0.950, 95% CI 0.944 to 0.955), and to adolescents by 17% (IRR 0.829, 95% CI 0.762 to 0.898). Tramadol dispensing to children rose immediately by 22% (IRR 1.223, 95% CI 1.068 to 1.401), followed by a sustained 3% decline; adolescent tramadol dispensing showed no immediate change. The 2017 communication restricted both drugs for the same reason. The prescribing response treated it as a restriction on one.',
        evidenceSource:
          'Renny MH, Jent V, Townsend T, Cerdá M. Impact of the 2017 FDA Drug Safety Communication on Codeine and Tramadol Dispensing to Children. Pediatrics 2022;150(5):e2021055887',
        doi: '10.1542/peds.2021-055887',
        measuredMetric:
          'Immediate level change in codeine and tramadol dispensing rates to children after April 2017, by segmented regression',
        auditFlag: 'caution',
      },
      {
        id: 'cod-a5',
        category: 'inferred',
        title: 'The population spread of the converting enzyme is enormous',
        laymanSummary:
          'The proportion of people who convert codeine unusually fast ranges from about one in a hundred to more than one in ten depending on ancestry. Nobody knows their own status, and the prescription is written as though everyone were average.',
        technicalDetails:
          'The Codeine Sulfate Tablets label states that some individuals are ultra-rapid metabolisers because of a specific CYP2D6 genotype such as the gene duplications denoted *1/*1xN or *1/*2xN, and that the prevalence of this phenotype varies widely: estimated at 1 to 10% for Whites (European, North American), 3 to 4% for Blacks (African Americans), 1 to 2% for East Asians (Chinese, Japanese, Korean), and possibly greater than 10% in certain groups including Oceanian, Northern African, Middle Eastern, Ashkenazi Jewish and Puerto Rican populations. These individuals convert codeine to morphine more rapidly and completely, producing higher than expected serum morphine, and may have life-threatening or fatal respiratory depression even at labelled dosage. The label concludes that ultra-rapid metabolisers should not use codeine. The inference embedded in ordinary prescribing is that a fixed milligram dose produces a broadly comparable exposure across patients. For this molecule that inference is false by design, and the label says so while offering no routine way to identify the affected patients before the first dose.',
        evidenceSource:
          'Codeine Sulfate Tablets United States prescribing information, Warnings and Precautions 5.6 CYP2D6 Genetic Variability (NDA 022402)',
        inferredClaim:
          'That a stated codeine dose produces a broadly similar effect from patient to patient — contradicted by the label’s own account of CYP2D6 phenotype prevalence and by the deaths that account was written to explain',
        auditFlag: 'caution',
      },
      {
        id: 'cod-a6',
        category: 'measured',
        title: 'In a randomised emergency department comparison, it was not distinguishable',
        laymanSummary:
          'Given to people with a painful arm or leg injury, codeine plus paracetamol reduced pain by 3.9 points out of ten at two hours. Ibuprofen plus paracetamol reduced it by 4.3. The difference was not statistically or clinically significant.',
        technicalDetails:
          'Chang and colleagues randomised 416 emergency department patients aged 21 to 64 with moderate to severe acute extremity pain, of whom 411 were analysed, to one of four single-dose combinations. Baseline mean pain was 8.7 (SD 1.3) on an 11-point numerical rating scale. Mean two-hour decline was 3.9 (95% CI 3.2 to 4.5) for codeine 30 mg plus paracetamol 300 mg, 4.3 (3.6 to 4.9) for ibuprofen 400 mg plus paracetamol 1000 mg, 4.4 (3.7 to 5.0) for oxycodone-paracetamol and 3.5 (2.9 to 4.2) for hydrocodone-paracetamol; the overall between-group p was 0.053 and the largest pairwise difference was 0.9, below the pre-specified minimum clinically important difference of 1.3. Adverse events were not assessed. A single-dose two-hour endpoint is a narrow question, and it is the question a person in an emergency department is actually asking.',
        evidenceSource:
          'Chang AK, Bijur PE, Esses D, Barnaby DP, Baer J. Effect of a Single Dose of Oral Opioid and Nonopioid Analgesics on Acute Extremity Pain in the Emergency Department: A Randomized Clinical Trial. JAMA 2017;318(17):1661-1667 (NCT02455518)',
        doi: '10.1001/jama.2017.16190',
        measuredMetric:
          'Decline in pain on an 11-point numerical rating scale two hours after codeine-paracetamol against three comparators',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A methyl group away from morphine',
        laymanDesc:
          'Codeine is morphine with one small chemical group attached. That group is what stops it binding the opioid receptor properly, and removing it is the entire mechanism.',
        molecularDetail:
          'Codeine is morphine 3-methyl ether, C18H21NO3. Its own affinity for the mu-opioid receptor is orders of magnitude below morphine’s. The 3-O-methyl group blocks the phenolic hydroxyl that morphine uses to anchor in the receptor pocket.',
        iconName: 'Atom',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'One enzyme decides how much drug you actually took',
        laymanDesc:
          'CYP2D6 converts about one part in twelve of the dose into morphine. How many working copies of that gene you carry — none, one, two or more — decides whether the tablet does nothing or too much.',
        molecularDetail:
          'The label records 70 to 80% glucuronidation to codeine-6-glucuronide, about 5 to 10% O-demethylation by CYP2D6 to morphine, and about 10% N-demethylation by CYP3A4 to inactive norcodeine. Ultra-rapid metaboliser prevalence ranges from 1 to 2% in East Asian populations to above 10% in Oceanian, North African, Middle Eastern, Ashkenazi Jewish and Puerto Rican populations.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The morphine does the work',
        laymanDesc:
          'Everything that follows is morphine pharmacology at the mu-opioid receptor, at whatever concentration the conversion produced.',
        molecularDetail:
          'Full agonism at the Gi/o-coupled mu-opioid receptor by the morphine formed, plus a contribution from morphine-6-glucuronide, which the label notes has analgesic activity in humans. Norcodeine and morphine-3-glucuronide are not considered analgesic; the activity of codeine-6-glucuronide in humans is stated as unknown.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'A small effect, measured honestly',
        laymanDesc:
          'Across every placebo-controlled surgical trial, 26% of people on 60 mg reached at least half pain relief, against 17% on placebo. That gap is the drug.',
        molecularDetail:
          'Cochrane CD008099: NNT 12 (95% CI 8.4 to 18) across 33 studies and 2,411 participants; 21 (12 to 96) after dental surgery; 6.8 (4.6 to 13) after other surgery. Mean time to rescue medication 2.7 hours on codeine against 2.0 on placebo.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Or a fatal one, in the wrong genotype',
        laymanDesc:
          'In someone with extra copies of the enzyme, an ordinary dose converts far more completely and can produce a morphine overdose. That is how children died after tonsil surgery.',
        molecularDetail:
          'Boxed warning: life-threatening respiratory depression and death have occurred in children who received codeine, most cases following tonsillectomy or adenoidectomy, many with evidence of CYP2D6 ultra-rapid metabolism. Contraindicated in all children under 12 and after tonsillectomy or adenoidectomy under 18.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Restricted, and partly replaced by the same problem',
        laymanDesc:
          'Codeine prescribing to children dropped a quarter after the 2017 restriction. Tramadol prescribing to children rose a fifth — and tramadol depends on the same enzyme.',
        molecularDetail:
          'Interrupted time series over 1.92 million paediatric codeine prescriptions: immediate 26% fall in codeine dispensing to children (IRR 0.742, 95% CI 0.684 to 0.806) and immediate 22% rise in tramadol (IRR 1.223, 95% CI 1.068 to 1.401) after April 2017.',
        iconName: 'Repeat',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane CD008099 — pooled single-dose placebo-controlled trials',
        phase:
          'Systematic review and meta-analysis of randomised, double-blind, placebo-controlled single-dose trials',
        sampleSize: 2411,
        primaryEndpoint:
          'At least 50% pain relief over four to six hours after a single oral 60 mg dose of codeine in established moderate to severe postoperative pain',
        endpointMet: true,
        statisticalPValue:
          'NNT 12 (95% CI 8.4 to 18) across all surgery types; 26% responded on codeine 60 mg against 17% on placebo; NNT 21 (12 to 96) after dental surgery',
        unreportedAdverseSignals:
          'Only 27 participants across the whole review received codeine 90 mg, so nothing can be said about a higher dose. More participants reported adverse events on codeine than placebo, though not significantly and none serious. The review long predates the paediatric contraindications and says nothing about them.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT02455518 (Chang et al., JAMA 2017;318:1661-1667) — codeine arm',
        phase: 'Randomised clinical trial, two urban emergency departments',
        sampleSize: 416,
        primaryEndpoint:
          'Between-group difference in decline in pain on an 11-point numerical rating scale two hours after a single oral dose, codeine 30 mg plus paracetamol 300 mg against three comparators in acute extremity pain',
        endpointMet: false,
        statisticalPValue:
          'Mean two-hour decline 3.9 (95% CI 3.2 to 4.5) for codeine-paracetamol against 4.3 for ibuprofen-paracetamol; overall p=0.053 across four arms',
        unreportedAdverseSignals:
          'Adverse events were not assessed, and CYP2D6 genotype was not measured — so the trial reports a population average for a drug whose defining property is that the population average describes almost nobody.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Number needed to treat of 12 (95% CI 8.4 to 18) for at least 50% postoperative pain relief with codeine 60 mg, from 33 studies and 2,411 participants',
        '26% response on codeine 60 mg against 17% on placebo in the same review',
        'About 5 to 10% of a codeine dose converted to morphine by CYP2D6, from the product label',
        'A 26% immediate fall in codeine dispensing to children and a 22% immediate rise in tramadol dispensing to children after April 2017',
        'Mean two-hour pain reduction of 3.9 points with codeine-paracetamol in 411 randomised emergency department patients',
      ],
      unsupportedInferences: [
        'That a stated codeine dose produces comparable exposure across patients, when the label’s own prevalence figures for CYP2D6 ultra-rapid metabolism range from 1% to above 10% by ancestry',
        'That codeine is a mild opioid and therefore appropriate for children — the position held for most of a century and now a contraindication',
        'That restricting codeine in children reduces the underlying hazard, when the commonest substitute carries the same CYP2D6 dependency',
        'That the 2006 Lancet breastfeeding case report settles the breastfeeding question; the report now carries an editorial expression of concern, though the label warning rests on separate grounds',
      ],
      whatFailedInitially: [
        'Paediatric use, contraindicated outright in every child under 12 and after tonsillectomy or adenoidectomy under 18',
        'The dental-surgery indication in particular, where the pooled NNT is 21 with a confidence interval reaching 96',
        'Codeine 90 mg, on which the entire randomised literature comprises 27 participants',
        'The assumption that a prodrug is inherently safer than the active drug it becomes',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines, and one of the most widely used analgesics in the world',
        'Boxed warning for ultra-rapid metabolism, contraindications covering all children under 12, and a recommendation against breastfeeding',
        'Prescription cough products containing codeine restricted to adults 18 and over since January 2018',
        'About twenty-eight United States cents per tablet at pharmacy acquisition cost, for a drug whose measured effect size is among the smallest of any opioid',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets and solution as codeine sulfate or phosphate; very commonly in fixed combination with paracetamol, aspirin or butalbital; prescription antitussive solutions for adults only. Schedule II as a single ingredient in the United States, with certain combinations in Schedules III and V.',
      description:
        'Absorbed well by mouth with plasma half-lives of codeine and its metabolites of approximately 3 hours, and about 90% of a dose excreted renally, of which roughly 10% is unchanged codeine. The pharmacokinetics that matter are not codeine’s own but those of the morphine formed from it, whose rate of appearance depends on CYP2D6 activity and can be abolished by a CYP2D6 inhibitor.',
      safetyProfile:
        'Boxed warnings for addiction, abuse and misuse; life-threatening respiratory depression; accidental ingestion; concomitant benzodiazepines and other CNS depressants; neonatal opioid withdrawal syndrome; the opioid analgesic REMS; ultra-rapid metabolism of codeine in children; and the complexity of CYP3A4 and CYP2D6 interactions. Contraindicated in all children under 12, for post-operative management under 18 after tonsillectomy or adenoidectomy, in significant respiratory depression, in acute or severe asthma without monitoring, with monoamine oxidase inhibitors or within 14 days of them, and in known or suspected gastrointestinal obstruction. Breastfeeding is not recommended.',
    },
    commonQuestions: [
      {
        q: 'Why does codeine do nothing for some people?',
        a: 'Because for those people it is not a painkiller at all. Codeine has to be converted to morphine by the liver enzyme CYP2D6, and that conversion accounts for only 5 to 10% of a dose even in someone with normal enzyme function. People who carry two non-working copies of the gene make essentially no morphine from it, and get little more than the placebo response. That is part of why the pooled number needed to treat across all the surgical trials is 12: the average includes a group in whom the drug cannot work by design.',
        auditNote:
          'A trial that reports a population mean for a prodrug with a bimodal activation step is describing a mixture of two different experiments.',
      },
      {
        q: 'Why is it banned in children?',
        a: 'Because the opposite genotype killed some of them. People with extra copies of the CYP2D6 gene convert codeine to morphine faster and more completely than expected, and children given ordinary doses after tonsil or adenoid surgery — an operation that already narrows the airway and is often done for sleep apnoea — stopped breathing. The FDA added a boxed warning in 2013 and in April 2017 contraindicated codeine in every child under 12, and in anyone under 18 after those operations. The label states plainly that ultra-rapid metabolisers should not use codeine, while offering no routine way to know who they are before the first dose.',
      },
      {
        q: 'Is it safe while breastfeeding?',
        a: 'The label says breastfeeding is not recommended during treatment, and records that at least one death was reported in a nursing infant exposed to high levels of morphine in breast milk because the mother was an ultra-rapid metaboliser. Worth knowing as an audit point: the 2006 Lancet case report most often cited for that warning received an editorial Expression of Concern from The Lancet in February 2026. An expression of concern is not a retraction, the label warning does not depend on that one paper, and the mechanism is the same one demonstrated in the post-tonsillectomy deaths — but a reader following the citation trail should know where it now leads.',
        auditNote:
          'Tracking what happened to a foundational citation is part of what an evidence audit is. It rarely changes the conclusion; it always changes how confidently the conclusion should be stated.',
      },
      {
        q: 'Is codeine plus paracetamol better than paracetamol alone?',
        a: 'Somewhat, and by less than most people assume. The Cochrane single-dose data for codeine 60 mg alone give a number needed to treat of 12 against placebo, and 21 after dental surgery. In the four-arm emergency department trial, codeine 30 mg with paracetamol 300 mg reduced pain by 3.9 points at two hours while ibuprofen 400 mg with paracetamol 1000 mg reduced it by 4.3 — not a statistically or clinically significant difference, and the non-opioid arm was numerically ahead. Where an anti-inflammatory is not contraindicated, the measured case for adding codeine is weak.',
      },
      {
        q: 'If codeine is restricted in children, is tramadol the answer?',
        a: 'No, and the same FDA communication said so. Tramadol is also a CYP2D6 prodrug, converted to O-desmethyltramadol, and it was restricted in April 2017 for the same reason as codeine: contraindicated under 12, and under 18 after tonsillectomy or adenoidectomy. Dispensing data show prescribers did not read it that way. In an interrupted time series covering 86% to 92% of United States retail prescriptions, codeine dispensing to children fell 26% immediately after the communication while tramadol dispensing to children rose 22%.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Derry S, Moore RA, McQuay HJ. Single dose oral codeine, as a single agent, for acute postoperative pain in adults. Cochrane Database Syst Rev 2010;(4):CD008099',
        identifier: '10.1002/14651858.CD008099.pub2',
        kind: 'doi',
      },
      {
        label:
          'Ciszkowski C, Madadi P, Phillips MS, Lauwers AE, Koren G. Codeine, ultrarapid-metabolism genotype, and postoperative death. N Engl J Med 2009;361(8):827-828',
        identifier: '10.1056/NEJMc0904266',
        kind: 'doi',
      },
      {
        label:
          'Koren G, Cairns J, Chitayat D, Gaedigk A, Leeder SJ. Pharmacogenetics of morphine poisoning in a breastfed neonate of a codeine-prescribed mother. Lancet 2006;368(9536):704',
        identifier: '10.1016/S0140-6736(06)69255-6',
        kind: 'doi',
      },
      {
        label:
          'The Editors of The Lancet. Expression of Concern: Pharmacogenetics of morphine poisoning in a breastfed neonate of a codeine-prescribed mother. Lancet 2026;407(10529):659',
        identifier: '10.1016/S0140-6736(26)00245-X',
        kind: 'doi',
      },
      {
        label:
          'Renny MH, Jent V, Townsend T, Cerdá M. Impact of the 2017 FDA Drug Safety Communication on Codeine and Tramadol Dispensing to Children. Pediatrics 2022;150(5):e2021055887',
        identifier: '10.1542/peds.2021-055887',
        kind: 'doi',
      },
      {
        label:
          'Chang AK, Bijur PE, Esses D, Barnaby DP, Baer J. Effect of a Single Dose of Oral Opioid and Nonopioid Analgesics on Acute Extremity Pain in the Emergency Department: A Randomized Clinical Trial. JAMA 2017;318(17):1661-1667',
        identifier: '10.1001/jama.2017.16190',
        kind: 'doi',
      },
      {
        label:
          'Codeine Sulfate Tablets United States prescribing information — boxed warning, Contraindications 4, Warnings and Precautions 5.6 and 5.7, Clinical Pharmacology 12.3 (NDA 022402)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022402',
        kind: 'regulatory',
      },
      {
        label:
          'Promethazine hydrochloride and codeine phosphate oral solution United States prescribing information — Indications 1: indicated in patients 18 years of age and older, not indicated under 18, contraindicated under 12. This labelling implements the FDA Drug Safety Communication of 11 January 2018 restricting prescription opioid cough and cold medicines to adults',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=codeine+phosphate+and+promethazine',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — codeine, 37 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5284371 — codeine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284371',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Hydromorphone — a slow-release capsule pulled after a glass of whisky raised its peak
  //    concentration sixteen-fold, and a pivotal trial in which 459 entered and 110 finished.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'hydromorphone',
    name: 'Hydromorphone',
    tradeName: 'Dilaudid / Dilaudid-HP / Exalgo / Palladone',
    sponsor:
      'Fresenius Kabi USA (holder on the enriched record for Dilaudid injection, NDA 019034); Exalgo under NDA 021217 and Palladone under NDA 021044 are both listed as discontinued in Drugs@FDA',
    targetGene: 'OPRM1',
    targetProtein:
      'Mu-opioid receptor, a Gi/o-coupled seven-transmembrane receptor; hydromorphone is a full agonist with markedly higher potency per milligram than morphine',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1984,
    indication:
      'Management of pain severe enough to require an opioid analgesic and for which alternative treatments are inadequate. The injection is used where parenteral opioid therapy is required; the high-potency concentrate exists for opioid-tolerant patients who need a large dose in a small volume.',
    patientFriendlyIndication:
      'Pain severe enough to need an opioid, especially where the dose must fit into a small injection',
    anatomicalSite:
      'Mu-opioid receptors of the spinal dorsal horn and brainstem — the same sites as morphine, reached at a fraction of the milligram dose',
    conditionContext: {
      conditionExplainer:
        'Hydromorphone exists because of a practical problem rather than a pharmacological one. A patient at the end of life may need more morphine than will dissolve in the volume a syringe driver can deliver under the skin. Hydromorphone puts the same effect into far fewer milligrams, so it fits.',
      whyItMatters:
        'Potency is not efficacy, and treating it as though it were is where hydromorphone gets dangerous. The conversion ratios used to switch a patient onto it vary between published tables, and the same physical property that makes it useful in a syringe driver — a lot of drug in very little liquid — is what makes a concentration mix-up lethal.',
      whoTakesThis:
        'People with severe acute pain in hospital, people with cancer pain, and people in palliative care where subcutaneous infusion volume is the limiting factor.',
      clinicalGoals:
        'The same analgesia as morphine in fewer milligrams. The Cochrane review comparing it with morphine, oxycodone and fentanyl in cancer pain found no clear evidence of a difference on pain intensity, at very low certainty.',
    },
    oneSentenceVerdict:
      'A full mu-opioid agonist whose Cochrane review of eight trials and 1,283 participants found no clear difference from morphine, oxycodone or fentanyl on any reported outcome at very low certainty, whose extended-release capsule Palladone was withdrawn in July 2005 after 8 ounces of 80-proof alcohol raised peak hydromorphone concentration about six-fold on average and sixteen-fold in one subject, and whose surviving once-daily product was licensed on a randomised-withdrawal trial in which 459 patients entered the enrichment phase and 110 completed the blinded one.',
    laymanHowItWorks:
      'Hydromorphone is morphine with two small chemical changes that make it bind the opioid receptor much more tightly and cross into the brain more readily. Everything it does — quieting the pain signal in the spinal cord, strengthening the brain’s own pain suppression, slowing the breathing centre — is what morphine does, at roughly a fifth to a seventh of the milligrams. That is its whole purpose: it lets a large opioid dose fit into a small injection. It is not a stronger painkiller in the sense of relieving pain that morphine cannot; it is the same painkiller in a smaller package.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$2.57 per millilitre of injection at United States pharmacy acquisition cost (CMS NADAC, median across 36 listed generic products, survey effective 20 May 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Hydromorphone was introduced in 1926 and the molecule is long out of patent. Two of the three branded extended-release products built on it — Palladone (NDA 021044) and Exalgo (NDA 021217) — are now listed as discontinued in Drugs@FDA, the first after a withdrawal for alcohol dose dumping. The immediate-release and injectable forms remain widely available as generics.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The Cochrane review of hydromorphone in cancer pain compared it with oxycodone in four trials, morphine in three and fentanyl in one, and found no clear evidence of a difference in pain intensity against any of them — on evidence it graded very low certainty, from studies all judged at high risk of bias. Its conclusion is that there is insufficient evidence to support or refute hydromorphone against other analgesics. So the choice is made on route, volume, renal function and price, and should be described that way rather than as a potency ranking.',
      conventionalRx: [
        {
          name: 'Morphine, oral or injectable',
          class: 'Full mu-opioid agonist',
          howItCompares:
            'Two randomised trials totalling 433 participants found no clear difference in pain intensity against hydromorphone, and one trial of 233 found no clear difference in the proportion achieving at least 50% pain relief (RR 0.99, 95% CI 0.84 to 1.18), all at very low certainty. One 200-patient trial suggested morphine may reduce constipation relative to hydromorphone at 24 days (RR 1.56, 95% CI 1.12 to 2.17), again very low certainty.',
          typicalCost:
            'US$0.4096 per millilitre of oral solution at United States pharmacy acquisition cost (CMS NADAC, median across 75 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: the reference molecule, cheaper, on the WHO Essential Medicines List, and the drug every conversion table is anchored to. Cons: the renally cleared active metabolite M6G accumulates in kidney failure, and large doses need a larger injection volume.',
        },
        {
          name: 'Oxycodone',
          class: 'Full mu-opioid agonist',
          howItCompares:
            'Three randomised trials totalling 381 participants found no clear difference in pain intensity against hydromorphone, and no clear difference in nausea, vomiting, dizziness or constipation across 622 participants — all at very low certainty in the Cochrane assessment.',
          typicalCost:
            'US$0.1974 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 193 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: reliable oral absorption, far cheaper per dose. Cons: no parenteral advantage, a boxed CYP3A4 interaction warning, and the promotional history that hydromorphone does not carry.',
        },
        {
          name: 'Fentanyl',
          class: 'Synthetic full mu-opioid agonist',
          howItCompares:
            'The one head-to-head trial in the Cochrane review found no clear evidence of a difference in pain intensity at 60 minutes. Fentanyl is the alternative where the problem is not volume but transdermal delivery or very rapid onset, and it produces no active metabolites, which matters in renal failure.',
          typicalCost:
            'Not stated here: the enriched record for fentanyl carries no CMS NADAC price, and a price that cannot be sourced is not stated',
          prosAndCons:
            'Pros: no active metabolites, transdermal and transmucosal routes available. Cons: the narrowest margin of any opioid in common use, and the molecule at the centre of the current overdose mortality picture.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'No alcohol with a slow-release opioid',
          action: 'Do not drink alcohol while taking any extended-release opioid.',
          patientImpact:
            'The clearest demonstration in this drug class came from Palladone: an FDA alert of July 2005 records that co-ingesting a 12 mg capsule with 8 ounces of 80-proof alcohol raised peak hydromorphone plasma concentration about six-fold on average, with one subject reaching a sixteen-fold increase, and that even 4% alcohol roughly doubled peak concentrations. The FDA concluded that these elevated levels may be lethal.',
          clinicalPrecaution:
            'That product was withdrawn. The general principle — that alcohol can defeat a modified-release matrix — is why alcohol dose-dumping studies are now a standard part of extended-release opioid development.',
        },
        {
          name: 'Check the concentration on the vial, every time',
          action:
            'If you are being cared for at home with injectable hydromorphone, know which strength you have.',
          patientImpact:
            'Hydromorphone is supplied both as ordinary injection and as a high-potency concentrate for opioid-tolerant patients. The same volume from the wrong vial is a several-fold overdose.',
          clinicalPrecaution:
            'This is a systems hazard rather than a pharmacological one, and it exists precisely because the drug’s selling point is that a lot of it fits into very little liquid.',
        },
        {
          name: 'Ask what the conversion was based on',
          action:
            'If you are being switched from another opioid, ask which ratio is being used and whether it has been reduced.',
          patientImpact:
            'A survey of published equianalgesic tables in package inserts, pharmaceutical teaching materials and the Physicians’ Desk Reference found inconsistent and variable ratios recommended for the same conversions, and concluded that current information in equianalgesic tables is confusing for physicians and dangerous to the public.',
          clinicalPrecaution:
            'The tables were derived largely from single-dose studies whose design does not match the situation they are applied in. They are an estimate, and the authors of that survey say so.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1CC[C@]23[C@@H]4[C@H]1CC5=C2C(=C(C=C5)O)O[C@H]3C(=O)CC4',
      chemicalFormula: 'C17H19NO3',
      molecularWeight: '285.34 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'Morphine with the 6-hydroxyl oxidised to a ketone and the 7,8-double bond reduced — the same two changes that turn codeine into hydrocodone, applied to morphine. The result binds the mu receptor more tightly and is more lipophilic than morphine, giving faster central nervous system entry. It is metabolised chiefly by glucuronidation to hydromorphone-3-glucuronide, which has no analgesic activity, and it produces no equivalent of morphine-6-glucuronide.',
      structureSource: {
        label:
          'PubChem CID 5284570 (hydromorphone) — canonical SMILES, molecular formula and weight, as carried on the enriched record and machine-verified by the RNAwiki structure engine',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284570',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'hym-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Establish the morphine feedstock and its residual content',
          description:
            'Hydromorphone is made from morphine. Because the product is several times more potent per milligram than its own starting material, residual morphine is a low-risk impurity here — the reverse of the usual situation — while incomplete conversion is a potency problem in the other direction.',
          reagentsAndBuffer:
            'Morphine sulfate reference standard, reversed-phase HPLC with ultraviolet detection, LC-MS/MS confirmation, Karl Fischer titration',
        },
        {
          id: 'hym-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Rearrange morphine to the 6-ketone with the ring saturated',
          description:
            'Catalytic rearrangement of morphine in acid over a platinum-group catalyst moves the 7,8-alkene and oxidises the 6-hydroxyl, producing hydromorphone directly. The reaction is the same class as the codeine-to-hydrocodone conversion and has the same control problem: dihydromorphine and morphinone as over- and under-reduced neighbours.',
          dependsOnStepId: 'hym-w1',
          reagentsAndBuffer:
            'Morphine free base, palladium or platinum catalyst in dilute acid, controlled hydrogen availability, in-process HPLC for dihydromorphine and morphinone',
        },
        {
          id: 'hym-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the hydrochloride and validate the concentrate separately',
          description:
            'Form hydromorphone hydrochloride and release it against process impurity limits. The high-potency injectable concentrate needs its own validation stream and its own labelling controls, because the failure mode for that presentation is not chemical but a vial mistaken for the ordinary strength.',
          dependsOnStepId: 'hym-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in alcohol, recrystallisation from aqueous ethanol, sterile filtration and terminal processing for the injectable, HPLC release assay, distinct container-closure and label verification for the concentrate',
        },
        {
          id: 'hym-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Determine the potency ratio in a design that matches how it is used',
          description:
            'Published equianalgesic ratios derive largely from single-dose crossover work in opioid-naive subjects and are then applied to tolerant patients at steady state. An experiment that supports the clinical use has to be a steady-state crossover in tolerant patients, which is the study the field has largely not done.',
          dependsOnStepId: 'hym-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells expressing human OPRM1 for receptor-level potency, [35S]GTPgammaS binding with morphine as the reference article, and paired steady-state clinical pharmacokinetic sampling in opioid-tolerant subjects rather than single-dose naive-subject crossover',
        },
        {
          id: 'hym-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Run the alcohol dose-dumping test before, not after, marketing',
          description:
            'Palladone is the reason this step exists as a routine requirement. Any modified-release opioid has to be dissolution-tested across the ethanol concentrations a person can actually drink, and then confirmed in vivo, because a matrix that holds for twelve hours in water may release its entire content in whisky.',
          dependsOnStepId: 'hym-w4',
          reagentsAndBuffer:
            'USP dissolution apparatus in 0.1 N hydrochloric acid containing 0%, 4%, 20% and 40% ethanol, paired in vivo crossover pharmacokinetics with 240 mL of 40% alcohol against water, LC-MS/MS plasma hydromorphone quantification with individual-subject reporting rather than group means alone',
        },
      ],
    },
    keyAudits: [
      {
        id: 'hym-a1',
        category: 'failed',
        title:
          'A glass of spirits raised the peak concentration sixteen-fold, and the product went',
        laymanSummary:
          'Palladone was a once-daily hydromorphone capsule. When healthy volunteers took one with eight ounces of 80-proof alcohol, the peak drug level in blood rose about six times on average, and sixteen times in one person. Even a third of a beer roughly doubled it. Purdue suspended sales in July 2005 at the FDA’s request.',
        technicalDetails:
          'The FDA alert of July 2005 records that Purdue Pharma agreed to the agency’s request to voluntarily suspend sales and marketing of Palladone in the United States. An in vivo alcohol interaction study in healthy subjects found that co-ingestion of a 12 mg Palladone capsule — the lowest marketed strength — with 240 mL (8 ounces) of a 40% (80 proof) alcoholic beverage produced an average peak hydromorphone plasma concentration approximately six times higher than with water, with one subject showing a sixteen-fold increase, and that even 4% alcohol, roughly two-thirds of a serving of beer, approximately doubled peak concentrations. The agency concluded that co-ingestion of Palladone and alcohol results in dangerous increases in peak plasma hydromorphone and that these elevated levels may be lethal, noting that the risk is higher still for the 16, 24 and 32 mg strengths. Drugs@FDA now lists NDA 021044 as discontinued. The finding changed the field: in vitro and in vivo alcohol dose-dumping testing became a standard expectation for modified-release opioid formulations.',
        evidenceSource:
          'FDA alert, July 2005: Palladone (hydromorphone hydrochloride) extended-release capsules — information for healthcare professionals; FDA Drugs@FDA record for NDA 021044, all products discontinued',
        measuredMetric:
          'Peak plasma hydromorphone concentration after a 12 mg extended-release capsule taken with 240 mL of 40% alcohol against water',
        auditFlag: 'retracted',
      },
      {
        id: 'hym-a2',
        category: 'inferred',
        title: 'The pivotal trial only randomised the people it had already worked in',
        laymanSummary:
          'Four hundred and fifty-nine people entered the once-daily hydromorphone study. Only those who tolerated it and responded were randomised — 268 of them — and 110 finished the blinded phase. The measured result is what happens when you take the drug away from people it already suited.',
        technicalDetails:
          'Hale and colleagues ran a multicentre, double-blind, placebo-controlled study using a randomised withdrawal design in opioid-tolerant patients with chronic moderate to severe low back pain (NCT00549042). Patients were first converted and titrated onto once-daily OROS hydromorphone ER in an open enrichment phase; only those who succeeded were randomised to continue it or switch to placebo. On the primary endpoint, mean change in diary numerical rating scale pain from baseline to the final visit of the 12-week double-blind phase, hydromorphone ER significantly beat placebo (p<0.001), with median diary NRS change of 0.2 units on hydromorphone against 1.6 units on placebo — that is, pain worsened much less on the drug rather than improving on it. A higher proportion on hydromorphone reached at least a 30% reduction from screening to endpoint, 60.6% against 42.9% (p<0.01). Sixty patients (13%) discontinued during the enrichment phase for adverse events. The authors state their own limitation: "Other trial design elements such as the use of an enrichment phase and the inclusion of only opioid tolerant patients may limit the generalizability of these results." A secondary analysis of the same study records the attrition explicitly: 459 patients entered the titration and conversion phase, 268 were successfully randomised, and 110 completed the double-blind phase. Exalgo, the product licensed on this programme, is now listed as discontinued in Drugs@FDA.',
        evidenceSource:
          'Hale M, Khan A, Kutch M, Li S. Once-daily OROS hydromorphone ER compared with placebo in opioid-tolerant patients with chronic low back pain. Curr Med Res Opin 2010;26(6):1505-1518 (NCT00549042); Jamison RN, Edwards RR, Liu X, et al. Relationship of negative affect and outcome of an opioid therapy trial among low back pain patients. Pain Pract 2013;13(3):173-181',
        doi: '10.1185/03007995.2010.484723',
        inferredClaim:
          'That an enriched-enrolment randomised-withdrawal result estimates what the drug does for a patient starting it — when everyone who could not tolerate or did not respond to the drug was removed before randomisation',
        auditFlag: 'caution',
      },
      {
        id: 'hym-a3',
        category: 'measured',
        title: 'Against every comparator, no clear difference and very low certainty',
        laymanSummary:
          'The Cochrane review pooled eight trials in cancer pain comparing hydromorphone with oxycodone, morphine or fentanyl. It found no clear difference on pain or on side effects, judged every study at high risk of bias, and concluded there is not enough evidence to support or refute the drug against the alternatives.',
        technicalDetails:
          'Li and colleagues included eight studies with 1,283 participants, data analysable for 1,181, comparing hydromorphone with oxycodone (four studies), morphine (three) or fentanyl (one), in adults with cancer pain of mean age 53 to 59. Every study was judged at high risk of bias overall, and no meta-analysis of the primary pain-intensity outcome was possible because of skewed data and differing comparators. No study compared hydromorphone with placebo, and no study included children. Against oxycodone there was no clear difference in pain intensity (3 RCTs, 381 participants) or in nausea (RR 1.13, 95% CI 0.74 to 1.73), vomiting (RR 1.18, 0.72 to 1.94), dizziness (RR 0.91, 0.58 to 1.44) or constipation (RR 0.92, 0.72 to 1.19). Against morphine there was no clear difference in pain intensity (2 RCTs, 433 participants) or in the proportion achieving at least 50% pain relief (RR 0.99, 0.84 to 1.18, 1 RCT, 233 participants), though morphine may reduce constipation at 24 days (RR 1.56, 1.12 to 2.17, 1 RCT, 200 participants). Against fentanyl there was no clear difference in pain intensity at 60 minutes. Every one of these findings was graded very low certainty. No study reported quality of life. The reviewers concluded there is insufficient evidence to support or refute the use of hydromorphone for cancer pain in comparison with other analgesics.',
        evidenceSource:
          'Li Y, Ma J, Lu G, et al. Hydromorphone for cancer pain. Cochrane Database Syst Rev 2021;(8):CD011108',
        doi: '10.1002/14651858.CD011108.pub3',
        measuredMetric:
          'Participant-reported pain intensity and specific adverse events, hydromorphone against oxycodone, morphine and fentanyl in cancer pain',
        auditFlag: 'verified',
      },
      {
        id: 'hym-a4',
        category: 'inferred',
        title: 'The conversion tables disagree with each other',
        laymanSummary:
          'Switching a patient from morphine to hydromorphone means dividing by a ratio out of a published table. A survey of those tables found the ratios inconsistent between sources, and its authors called the current information confusing for physicians and dangerous to the public.',
        technicalDetails:
          'Shaheen, Walsh, Lasheen, Davis and Lagman surveyed commercially available educational materials — package inserts, teaching materials provided by pharmaceutical companies, and the Physicians’ Desk Reference — for equianalgesic tables of commonly used opioids. They found inconsistent and variable equianalgesic ratios recommended for both opioid rotation and route conversion. They identify the reasons: inter- and intra-individual differences in opioid pharmacology, and the heterogeneity of study design used to derive the ratios in the first place. Their conclusion is that equianalgesic tables should serve only as a general guideline, that systematic research on equianalgesic dose calculation is needed to avoid adverse public health consequences of incorrect dosing, and that current information in equianalgesic tables is confusing for physicians and dangerous to the public. This matters more for hydromorphone than for most opioids, because it is the molecule most often reached for precisely when a conversion is being made.',
        evidenceSource:
          'Shaheen PE, Walsh D, Lasheen W, Davis MP, Lagman RL. Opioid equianalgesic tables: are they all equally dangerous? J Pain Symptom Manage 2009;38(3):409-417',
        doi: '10.1016/j.jpainsymman.2009.06.004',
        inferredClaim:
          'That a published equianalgesic ratio converts one opioid into another with useful accuracy in a tolerant patient at steady state — a claim the surveyed tables do not agree on among themselves',
        auditFlag: 'contested',
      },
      {
        id: 'hym-a5',
        category: 'failed',
        title: 'Two of the three extended-release products are gone',
        laymanSummary:
          'Palladone was withdrawn in 2005 over alcohol. Exalgo, licensed a decade later on an enriched-enrolment trial, is also now discontinued. What remains of hydromorphone is the plain injection and the plain tablet.',
        technicalDetails:
          'Drugs@FDA lists NDA 021044 (PALLADONE) as discontinued following the July 2005 voluntary suspension, and NDA 021217 (EXALGO) as discontinued. The Dilaudid injection under NDA 019034 and the Dilaudid tablets under NDA 019891 and 019892 remain prescription products. The pattern is worth naming: the commercial activity in hydromorphone over three decades has been in modified-release delivery systems rather than in the molecule, and both of the major ones failed — one on a safety finding the development programme did not anticipate, one commercially after a licence built on a trial that removed its non-responders before randomising.',
        evidenceSource:
          'FDA Drugs@FDA records for NDA 021044 (PALLADONE, discontinued), NDA 021217 (EXALGO, discontinued) and NDA 019034 (DILAUDID, prescription)',
        measuredMetric:
          'Marketing status of each hydromorphone extended-release application in Drugs@FDA',
        auditFlag: 'verified',
      },
      {
        id: 'hym-a6',
        category: 'measured',
        title: 'No morphine-6-glucuronide, which is a genuine and narrow advantage',
        laymanSummary:
          'Morphine leaves behind an active by-product that builds up when kidneys fail. Hydromorphone does not produce an equivalent. That is a real difference, and it is a difference about kidneys rather than about pain.',
        technicalDetails:
          'Hydromorphone is cleared principally by glucuronidation to hydromorphone-3-glucuronide, which has no analgesic activity, and it has no counterpart to morphine-6-glucuronide — the renally excreted active metabolite whose accumulation produces delayed sedation in renal impairment. This is the pharmacological basis for the common clinical preference for hydromorphone over morphine in kidney disease. It should be stated for what it is: a pharmacokinetic argument about metabolite handling, not evidence that hydromorphone relieves pain better. The Cochrane review found no clear difference in pain intensity against morphine in two randomised trials totalling 433 participants, at very low certainty, and hydromorphone-3-glucuronide itself accumulates in renal failure and has been associated with neuroexcitatory effects.',
        evidenceSource:
          'MS CONTIN United States prescribing information, Clinical Pharmacology 12.3, for the morphine metabolite comparison; Li Y, Ma J, Lu G, et al. Hydromorphone for cancer pain. Cochrane Database Syst Rev 2021;(8):CD011108, for the head-to-head pain comparison',
        doi: '10.1002/14651858.CD011108.pub3',
        measuredMetric:
          'Presence of a renally excreted active glucuronide metabolite: morphine yes, hydromorphone no',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The same drug, in fewer milligrams',
        laymanDesc:
          'Hydromorphone exists so that a large opioid dose can fit into a small injection. That is a packaging advantage, and it is the honest description of what it offers.',
        molecularDetail:
          'Morphine with the 6-hydroxyl oxidised to a ketone and the 7,8-double bond saturated: higher mu-receptor affinity and greater lipophilicity than the parent. Supplied as ordinary injection and as a high-potency concentrate for opioid-tolerant patients.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Into the brain faster than morphine',
        laymanDesc:
          'Being more fat-soluble, it crosses into the brain more readily, which is why an injection acts quickly.',
        molecularDetail:
          'Greater lipophilicity than morphine gives faster blood-brain barrier transit. Oral bioavailability is limited by first-pass metabolism, so oral and parenteral doses differ several-fold — one of the conversions the equianalgesic tables disagree about.',
        iconName: 'Zap',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Full agonism at the mu receptor',
        laymanDesc:
          'It binds the same receptor as morphine and turns it fully on, more tightly per molecule.',
        molecularDetail:
          'Full agonism at the Gi/o-coupled mu-opioid receptor: adenylyl cyclase inhibition, GIRK potassium channel opening, N-type calcium channel closure, neuronal hyperpolarisation.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Cleared to an inactive glucuronide',
        laymanDesc:
          'The liver attaches a sugar to it and the kidneys remove the result. Unlike morphine, that by-product is not itself a painkiller — which is why it is often chosen when kidneys are failing.',
        molecularDetail:
          'Principal clearance by glucuronidation to hydromorphone-3-glucuronide, which has no analgesic activity and no counterpart to morphine-6-glucuronide. H3G nonetheless accumulates in renal impairment and has been associated with neuroexcitatory phenomena.',
        iconName: 'Droplet',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Where the slow-release version failed',
        laymanDesc:
          'A once-daily capsule taken with a glass of spirits released its whole day’s dose at once. Peak levels rose about six-fold on average and sixteen-fold in one volunteer, and the product was pulled.',
        molecularDetail:
          'Palladone 12 mg with 240 mL of 40% alcohol: approximately six-fold higher mean peak plasma hydromorphone against water, one subject at sixteen-fold, and roughly doubled peak concentrations at 4% alcohol. FDA concluded the elevated levels may be lethal; Purdue suspended sales in July 2005.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the trials could and could not measure',
        laymanDesc:
          'Against morphine, oxycodone and fentanyl there is no clear difference in pain relief, on evidence graded very low certainty. The once-daily product’s pivotal trial removed its non-responders before it started.',
        molecularDetail:
          'Cochrane 2021: 8 studies, 1,283 participants, all at high risk of bias, no clear difference against any comparator, insufficient evidence to support or refute. NCT00549042: 459 entered the enrichment phase, 268 randomised, 110 completed the double-blind phase; median diary NRS change 0.2 on drug against 1.6 on placebo.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT00549042 (Hale et al., Curr Med Res Opin 2010;26:1505-1518)',
        phase:
          'Phase 3, multicentre, double-blind, placebo-controlled, enriched-enrolment randomised withdrawal',
        sampleSize: 268,
        primaryEndpoint:
          'Mean change in patient diary numerical rating scale pain intensity from baseline to the final visit of a 12-week double-blind phase, once-daily OROS hydromorphone ER against placebo in opioid-tolerant patients with chronic moderate to severe low back pain',
        endpointMet: true,
        statisticalPValue:
          'p<0.001 on the primary endpoint; median diary NRS change 0.2 units on hydromorphone ER against 1.6 units on placebo; at least 30% pain reduction in 60.6% against 42.9% (p<0.01)',
        unreportedAdverseSignals:
          'Of 459 patients entering the titration and conversion phase, 268 were randomised and 110 completed the double-blind phase. Sixty patients (13%) discontinued during the enrichment phase for adverse events, and more active (9, 6.7%) than placebo (4, 3.0%) patients discontinued for adverse events during the randomised phase. The authors state that the enrichment phase and the restriction to opioid-tolerant patients may limit generalisability. The product licensed on this programme is now discontinued.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Palladone in vivo alcohol interaction study (FDA alert, July 2005)',
        phase: 'Open-label, four-arm, crossover pharmacokinetic study in healthy adult subjects',
        sampleSize: 48,
        primaryEndpoint:
          'Peak plasma hydromorphone concentration after a 12 mg extended-release capsule taken with 240 mL of 40% alcohol against the same capsule with water',
        endpointMet: false,
        statisticalPValue:
          'Approximately six-fold higher mean peak plasma concentration with 8 ounces of 80-proof alcohol than with water; one subject sixteen-fold; approximately doubled peak concentrations with 4% alcohol',
        unreportedAdverseSignals:
          'The FDA alert describes an open-label four-arm crossover design including 24 healthy adults tested fasted and 24 tested under standardised fed conditions. The effect sizes and the regulatory conclusion are taken from that alert; no peer-reviewed publication of the study was located. The finding ended the product: Purdue suspended sales and marketing at FDA request in July 2005 and NDA 021044 is listed as discontinued.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Approximately six-fold higher mean peak plasma hydromorphone, and sixteen-fold in one subject, when a 12 mg extended-release capsule was taken with 240 mL of 40% alcohol',
        'No clear difference in pain intensity against oxycodone (381 participants), morphine (433) or fentanyl, all at very low certainty in the 2021 Cochrane review',
        'Median diary NRS pain change of 0.2 units on once-daily hydromorphone against 1.6 on placebo after enriched-enrolment randomised withdrawal (p<0.001)',
        '459 patients entered the enrichment phase of that trial, 268 were randomised, 110 completed the blinded phase',
      ],
      unsupportedInferences: [
        'That greater potency per milligram means greater efficacy — the head-to-head trials show no clear difference against three other opioids',
        'That an enriched-enrolment randomised-withdrawal result estimates the benefit for a patient starting the drug',
        'That published equianalgesic ratios convert reliably between opioids, when the surveyed tables disagree with one another',
        'That an absent active metabolite makes hydromorphone a better analgesic in renal impairment rather than a more predictable one',
      ],
      whatFailedInitially: [
        'Palladone, suspended at FDA request in July 2005 after the alcohol interaction study and now listed as discontinued',
        'Exalgo, licensed on the enriched-enrolment programme and now also listed as discontinued',
        'The Cochrane evidence base: eight studies, every one judged at high risk of bias, no possible meta-analysis of the primary outcome, no placebo comparison and no paediatric data',
        'The consistency of published equianalgesic tables, which their surveyors call dangerous to the public',
      ],
      realWorldOutcome: [
        'The injection and the immediate-release tablet remain widely used, particularly in palliative care where injection volume is the limiting constraint',
        'Both major extended-release products are discontinued',
        'Alcohol dose-dumping testing became a standard expectation for modified-release opioid formulations after the Palladone finding',
        'About US$2.57 per millilitre of injection at pharmacy acquisition cost, several times the price of morphine solution per millilitre and delivering several times the opioid effect per millilitre',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets and solution; solution for intravenous, intramuscular and subcutaneous injection, including a high-potency concentrate for opioid-tolerant patients; suppositories. Schedule II controlled substance in the United States.',
      description:
        'Oral bioavailability is limited by first-pass metabolism, so oral and parenteral doses differ several-fold. The clinical reason to choose hydromorphone is usually volume: a subcutaneous infusion has a physical limit on how much fluid can be delivered, and hydromorphone puts more opioid effect into each millilitre than morphine does. The high-potency concentrate exists for that reason and carries the corresponding hazard of being confused with the ordinary strength.',
      safetyProfile:
        'Class boxed warnings for addiction, abuse and misuse; life-threatening respiratory depression; and profound sedation, respiratory depression, coma and death with concomitant benzodiazepines, other CNS depressants or alcohol; plus neonatal opioid withdrawal syndrome after prolonged use in pregnancy. The Palladone withdrawal established that alcohol can defeat a modified-release hydromorphone matrix outright. Hydromorphone-3-glucuronide accumulates in renal impairment and has been associated with neuroexcitatory effects, so the renal advantage over morphine is relative rather than absolute.',
    },
    commonQuestions: [
      {
        q: 'Is hydromorphone stronger than morphine?',
        a: 'More potent, yes; more effective, not demonstrably. Potency means how many milligrams are needed, and hydromorphone needs far fewer. Efficacy means how much pain is relieved, and the 2021 Cochrane review of cancer pain found no clear evidence of a difference against morphine across two randomised trials totalling 433 participants, nor in the proportion reaching at least 50% relief in a 233-patient trial, all at very low certainty. The practical reason it is chosen is that a large dose fits into a small injection volume.',
        auditNote:
          'Potency and efficacy get conflated constantly in this class. Conversion tables encode potency; they say nothing about which drug works better.',
      },
      {
        q: 'What happened to Palladone?',
        a: 'It was withdrawn over alcohol. An in vivo interaction study found that taking a 12 mg capsule — the lowest strength made — with eight ounces of 80-proof spirits raised the average peak hydromorphone concentration about six-fold against water, with one subject reaching sixteen-fold, and that even 4% alcohol roughly doubled it. The FDA concluded those levels may be lethal and noted the risk was higher still for the 16, 24 and 32 mg capsules. Purdue Pharma suspended sales and marketing at the agency’s request in July 2005 and the application is listed as discontinued. The episode is why alcohol dose-dumping testing is now expected of every modified-release opioid before approval rather than after.',
      },
      {
        q: 'Why do people say it is safer in kidney failure?',
        a: 'Because of a metabolite that it does not make. Morphine is converted largely to morphine-3-glucuronide and morphine-6-glucuronide; the second is an active painkiller cleared by the kidney, and when the kidney slows it accumulates and produces delayed drowsiness. Hydromorphone is cleared to hydromorphone-3-glucuronide, which has no analgesic activity, and has no equivalent of M6G. That is a real pharmacokinetic difference and it is worth acting on. It is not evidence that hydromorphone relieves pain better, and hydromorphone-3-glucuronide itself accumulates in renal failure with reported neuroexcitatory effects.',
      },
      {
        q: 'The once-daily version was proved to work in a trial. Why is that trial flagged?',
        a: 'Because of who was in it by the time it started. It used an enriched-enrolment randomised-withdrawal design: everyone was first put on hydromorphone in an open phase, and only those who tolerated it and responded were randomised to keep taking it or switch to placebo. Of 459 who entered that phase, 268 were randomised and 110 completed the blinded part. Sixty (13%) left the enrichment phase for adverse effects before randomisation ever happened. The result — median pain change of 0.2 units on drug against 1.6 on placebo, p<0.001 — is a real measurement of what happens when a drug is withdrawn from people it was already suiting. The trial’s own authors write that the enrichment phase and the restriction to opioid-tolerant patients may limit generalisability.',
        auditNote:
          'An enriched-enrolment withdrawal trial answers "does stopping it hurt?" A patient starting the drug is asking "will starting it help?" Those are different questions with different denominators.',
      },
      {
        q: 'How do doctors work out the equivalent dose when switching to it?',
        a: 'From a published equianalgesic table, and the tables disagree. A survey of package inserts, pharmaceutical company teaching materials and the Physicians’ Desk Reference found inconsistent and variable ratios recommended for the same rotations and route conversions, attributed to individual variation in opioid pharmacology and to the heterogeneous study designs the ratios were derived from. The authors concluded that the tables should be treated only as a general guideline and that the current information is confusing for physicians and dangerous to the public. This matters most for the drugs people are switched to rather than started on, which is exactly hydromorphone’s position.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Li Y, Ma J, Lu G, Dou Z, Knaggs R, Xia J, Zhao S, Dong S, Yang L. Hydromorphone for cancer pain. Cochrane Database Syst Rev 2021;(8):CD011108',
        identifier: '10.1002/14651858.CD011108.pub3',
        kind: 'doi',
      },
      {
        label:
          'Hale M, Khan A, Kutch M, Li S. Once-daily OROS hydromorphone ER compared with placebo in opioid-tolerant patients with chronic low back pain. Curr Med Res Opin 2010;26(6):1505-1518',
        identifier: '10.1185/03007995.2010.484723',
        kind: 'doi',
      },
      {
        label: 'Hale et al. trial registration — ClinicalTrials.gov NCT00549042',
        identifier: 'NCT00549042',
        kind: 'nct',
      },
      {
        label:
          'Jamison RN, Edwards RR, Liu X, et al. Relationship of negative affect and outcome of an opioid therapy trial among low back pain patients. Pain Pract 2013;13(3):173-181 — records the enrolment attrition of the pivotal hydromorphone ER study',
        identifier: '10.1111/j.1533-2500.2012.00575.x',
        kind: 'doi',
      },
      {
        label:
          'Shaheen PE, Walsh D, Lasheen W, Davis MP, Lagman RL. Opioid equianalgesic tables: are they all equally dangerous? J Pain Symptom Manage 2009;38(3):409-417',
        identifier: '10.1016/j.jpainsymman.2009.06.004',
        kind: 'doi',
      },
      {
        label:
          'FDA alert, July 2005 — Palladone (hydromorphone hydrochloride) extended-release capsules: information for healthcare professionals, including the alcohol interaction study results and the voluntary suspension of sales (archived FDA page)',
        identifier:
          'https://wayback.archive-it.org/7993/20170113093046/http://www.fda.gov/Drugs/DrugSafety/PostmarketDrugSafetyInformationforPatientsandProviders/ucm129288.htm',
        kind: 'regulatory',
      },
      {
        label: 'FDA Drugs@FDA record for NDA 021044 (PALLADONE) — all products discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021044',
        kind: 'regulatory',
      },
      {
        label: 'FDA Drugs@FDA record for NDA 021217 (EXALGO) — all products discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021217',
        kind: 'regulatory',
      },
      {
        label:
          'DILAUDID (hydromorphone hydrochloride) injection United States prescribing information — boxed warning (NDA 019034)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019034',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — hydromorphone, 36 listed generic products, effective 20 May 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5284570 — hydromorphone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284570',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Methadone — a half-life its own label puts anywhere between 8 and 59 hours, a boxed warning
  //    for torsades, and a mortality benefit the randomised trials never showed.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'methadone',
    name: 'Methadone',
    tradeName: 'Methadose / Dolophine / Methadone Hydrochloride Intensol',
    sponsor:
      'Mallinckrodt Inc. (holder on the enriched record); the molecule was first synthesised at IG Farben in the late 1930s and is now made by many manufacturers',
    targetGene: 'OPRM1',
    targetProtein:
      'Mu-opioid receptor, as a full agonist; the label adds that some data indicate antagonism at the N-methyl-D-aspartate receptor and that the contribution of that antagonism to efficacy is unknown',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1947,
    indication:
      'Detoxification treatment of opioid addiction and maintenance treatment of opioid addiction, in conjunction with appropriate social and medical services, subject to the conditions for distribution and use required under 42 CFR Part 8; and management of pain severe enough to require daily, around-the-clock, long-term opioid treatment for which alternative options are inadequate.',
    patientFriendlyIndication:
      'Opioid dependence, as maintenance or detoxification treatment; and severe long-term pain',
    anatomicalSite:
      'Mu-opioid receptors of the brain and spinal cord; and the hERG potassium channel of cardiac myocytes, which is where the boxed cardiac warning comes from',
    conditionContext: {
      conditionExplainer:
        'Opioid dependence is a state in which the receptor system has adapted to constant occupancy, so that its absence produces severe physical illness and overwhelming craving. Maintenance treatment does not remove the dependence; it replaces a short-acting, illicit, variable-strength opioid with a long-acting, legal, known-strength one, and lets a person’s life reorganise around something other than the next dose.',
      whyItMatters:
        'Methadone is one of the most consequential drugs in public health and one of the most awkward to describe honestly. The randomised evidence shows it keeps people in treatment and reduces heroin use; it does not show a statistically significant effect on mortality. The mortality case rests on very large cohort studies, which are consistent, enormous and observational. Both halves of that sentence belong on the page.',
      whoTakesThis:
        'People in opioid maintenance or detoxification programmes, dispensed under a specific federal regulatory framework in the United States; and a much smaller number of people with severe chronic pain.',
      clinicalGoals:
        'Staying in treatment and off illicit opioids. Retention is the endpoint the randomised trials measured and the one every downstream benefit depends on.',
    },
    oneSentenceVerdict:
      'A long-acting mu-agonist that in 11 randomised trials and 1,969 participants beat non-pharmacological treatment on retention and heroin use (RR 0.66, 95% CI 0.56 to 0.78) but not on mortality (RR 0.48, 95% CI 0.10 to 2.39) or crime — while 19 cohorts following 122,885 methadone patients found all-cause mortality of 11.3 per 1,000 person-years in treatment against 36.1 out of it — and whose terminal half-life its own label reports as ranging from 8 to 59 hours across studies, with a boxed warning for torsades de pointes.',
    laymanHowItWorks:
      'Methadone is a synthetic opioid that does not look like morphine but binds the same receptor. What makes it different is how long it lasts: taken once a day it holds a steady level, so there is no cycle of rush and withdrawal, and enough receptor is occupied that another opioid on top produces much less effect. The problem is the same property. Methadone leaves the body at a rate that varies enormously between people — its own label reports a half-life anywhere from eight to fifty-nine hours — so it accumulates over days, and the label warns that its peak effect on breathing comes later and lasts longer than its peak painkilling effect. It also blocks a potassium channel in the heart, which can lengthen the electrical cycle and trigger a dangerous rhythm.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 67,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1752 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 26 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Methadone was synthesised in Germany in the late 1930s and its patents were seized as war reparations, which is why it entered American medicine without a commercial owner. It is on the WHO Model List of Essential Medicines. The cost of the drug is trivial; the cost of the treatment is the dispensing framework around it, which in the United States is set by 42 CFR Part 8 and requires attendance at a certified opioid treatment programme for most patients.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The honest comparison is with buprenorphine, and the Sordo cohort meta-analysis measured both in the same framework: all-cause mortality of 11.3 per 1,000 person-years in methadone treatment against 4.3 in buprenorphine treatment, but with a much larger fall relative to being untreated for methadone (out-to-in rate ratio 3.20) than for buprenorphine (2.20). Those populations were not randomised against each other and differ systematically. What the data do show clearly is that the dangerous periods are the first weeks on methadone and the weeks after leaving either drug.',
      conventionalRx: [
        {
          name: 'Buprenorphine, with or without naloxone',
          class: 'Partial mu-opioid agonist and kappa antagonist',
          howItCompares:
            'In the Sordo meta-analysis, pooled all-cause mortality was 4.3 per 1,000 person-years in buprenorphine treatment against 9.5 out of it (unadjusted out-to-in rate ratio 2.20, 95% CI 1.34 to 3.61), against 11.3 and 36.1 for methadone (3.20, 2.65 to 3.86). All-cause mortality remained stable during buprenorphine induction, whereas it dropped sharply over the first four weeks of methadone treatment — the induction period being the one of particular risk on methadone.',
          typicalCost:
            'Not stated here: the enriched record for buprenorphine carries no CMS NADAC price, and a price that cannot be sourced is not stated',
          prosAndCons:
            'Pros: a ceiling on respiratory depression from partial agonism, no boxed QT warning, and in most jurisdictions a far less restrictive dispensing framework. Cons: precipitated withdrawal if started too early, and lower retention than methadone in several comparisons — retention being the thing all the other benefits depend on.',
        },
        {
          name: 'Naltrexone, oral or extended-release injectable',
          class: 'Mu-opioid antagonist',
          howItCompares:
            'The opposite strategy: block the receptor entirely rather than occupy it steadily. It removes the reinforcement rather than substituting for it, and it requires full detoxification first, which is where most of its attrition happens.',
          typicalCost:
            'Not stated here: the enriched record for naltrexone carries no CMS NADAC price, and a price that cannot be sourced is not stated',
          prosAndCons:
            'Pros: no dependence, no diversion value, no respiratory depression. Cons: the induction hurdle, and loss of tolerance during treatment, which makes a relapse after stopping more dangerous than one before starting.',
        },
        {
          name: 'Morphine or oxycodone, for pain rather than dependence',
          class: 'Full mu-opioid agonists',
          howItCompares:
            'Where methadone is being used as an analgesic rather than as maintenance, the comparison is with ordinary long-acting opioids, and the CDC has stated the position plainly: for chronic non-cancer pain, methadone should not be considered a drug of first choice by prescribers or insurers.',
          typicalCost:
            'US$0.4096 per millilitre of morphine oral solution and US$0.1974 per oxycodone tablet at United States pharmacy acquisition cost (CMS NADAC, medians across 75 and 193 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: predictable kinetics, no QT liability, no accumulation over days. Cons: shorter duration, higher cost per day, and no NMDA story — though the label says the clinical value of that story is unknown anyway.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'The first two weeks are the dangerous ones',
          action: 'Do not top up a dose that feels too weak in the first days.',
          patientImpact:
            'The boxed warning states that the peak respiratory depressant effect of methadone occurs later, and persists longer, than the peak pharmacologic effect, especially during the initial dosing period. The Sordo meta-analysis found all-cause mortality dropped sharply over the first four weeks of methadone treatment, meaning induction is the period of elevated risk.',
          clinicalPrecaution:
            'Because the drug accumulates towards steady state over several days, a dose that feels inadequate on day one may be excessive by day four.',
        },
        {
          name: 'Tell every prescriber, because the interaction list is unusually long',
          action:
            'Mention methadone before any new antibiotic, antifungal, antiretroviral, antiepileptic or antidepressant.',
          patientImpact:
            'The boxed warning covers interactions with drugs affecting cytochrome P450 isoenzymes: concomitant use with CYP3A4, CYP2B6, CYP2C19, CYP2C9 or CYP2D6 inhibitors may raise methadone concentrations and cause potentially fatal respiratory depression. Five enzymes is a wider net than any other opioid on this site.',
          clinicalPrecaution:
            'The mirror case matters too: an enzyme inducer can drop methadone levels far enough to precipitate withdrawal, and stopping that inducer can then raise them sharply.',
        },
        {
          name: 'Ask about an ECG if you are on a high dose or another QT drug',
          action:
            'Mention any family history of sudden death, fainting, or other QT-prolonging drug.',
          patientImpact:
            'The boxed warning records that QT interval prolongation and torsades de pointes have occurred during methadone treatment, mostly in patients treated for pain with large multiple daily doses, but also at doses commonly used for maintenance treatment of addiction.',
          clinicalPrecaution:
            'The original case series that identified this reported a mean daily dose of 397 mg and a mean corrected QT of 615 ms in 17 patients, 14 of whom had another predisposing risk factor.',
        },
        {
          name: 'Keep it locked; a child’s dose is a fatal dose',
          action: 'Store take-home doses where no one else can reach them.',
          patientImpact:
            'The boxed warning states that accidental ingestion of methadone, especially by children, can result in fatal overdose.',
          clinicalPrecaution:
            'The long half-life that makes the drug useful also means an accidental ingestion cannot be waited out.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCC(=O)C(CC(C)N(C)C)(C1=CC=CC=C1)C2=CC=CC=C2',
      chemicalFormula: 'C21H27NO',
      molecularWeight: '309.40 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'A diphenylheptanone with no morphinan ring system at all — chemically unrelated to the poppy alkaloids and reaching the same receptor by a different shape. Marketed as the racemate: R-methadone carries essentially all the mu-opioid agonism, while S-methadone is the more potent blocker of the hERG cardiac potassium channel. The label states methadone is a mu agonist, that some data indicate NMDA receptor antagonism, and that the contribution of NMDA antagonism to efficacy is unknown. Hepatic N-demethylation to inactive EDDP proceeds through CYP3A4, CYP2B6, CYP2C19, CYP2C9 and CYP2D6. Apparent plasma clearance after multiple dosing has been reported between 1.4 and 126 L/h and terminal half-life between 8 and 59 hours across studies. Methadone is basic (pKa 9.2) so urinary pH alters its disposition, and it is lipophilic enough to persist in liver and other tissues, which the label notes may prolong its action despite low plasma concentrations.',
      structureSource: {
        label:
          'PubChem CID 4095 (methadone) — canonical SMILES, molecular formula and weight, as carried on the enriched record and machine-verified by the RNAwiki structure engine; pharmacology and pharmacokinetics from the methadone hydrochloride label, sections 12.1 and 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4095',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'met-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the diphenyl backbone and the absence of the isomeric by-product',
          description:
            'Methadone is fully synthetic, so the impurity profile is a synthesis problem rather than an agricultural one. The classical route produces a regioisomer, isomethadone, alongside the intended product, and the two are close enough in properties that the separation is the defining quality-control step.',
          reagentsAndBuffer:
            'Methadone hydrochloride reference standard, isomethadone marker, reversed-phase HPLC with ultraviolet detection, gas chromatography-mass spectrometry for volatile process residues, Karl Fischer titration',
        },
        {
          id: 'met-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Alkylate diphenylacetonitrile, then add the ethyl ketone',
          description:
            'Diphenylacetonitrile is alkylated with a dimethylamino-halopropane and the resulting nitrile is treated with an ethyl Grignard reagent and hydrolysed to the ketone. The alkylation step is where the isomeric by-product arises, from attack at the alternative carbon of the amine side chain.',
          dependsOnStepId: 'met-w1',
          reagentsAndBuffer:
            'Diphenylacetonitrile, 1-dimethylamino-2-chloropropane, sodium amide or a comparable strong base, ethylmagnesium bromide, anhydrous ether or toluene under nitrogen, controlled aqueous work-up',
        },
        {
          id: 'met-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separate the isomer and form the hydrochloride',
          description:
            'Isolate methadone from isomethadone by fractional crystallisation of the salts, then form and recrystallise methadone hydrochloride. Because the marketed product is the racemate, no chiral resolution is performed — a fact worth stating explicitly, since one enantiomer carries the analgesia and the other carries most of the cardiac liability.',
          dependsOnStepId: 'met-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol, fractional crystallisation, activated carbon decolourisation, HPLC release assay with a validated isomethadone limit',
        },
        {
          id: 'met-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Test each enantiomer at the receptor and at the hERG channel separately',
          description:
            'The racemate reports an average that belongs to neither enantiomer. R-methadone carries the mu agonism and S-methadone is the more potent hERG blocker, so the therapeutic index of the marketed product depends on a ratio no assay of the racemate can see. Testing both separately is the only design that reports the real trade-off.',
          dependsOnStepId: 'met-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human OPRM1 for [35S]GTPgammaS binding, HEK293 cells stably expressing hERG for automated patch clamp, resolved R- and S-methadone as separate test articles, dofetilide as a positive hERG control, DAMGO as reference mu agonist',
        },
        {
          id: 'met-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Characterise accumulation to steady state, not a single dose',
          description:
            'A single-dose pharmacokinetic study of methadone describes a drug nobody takes. The clinically relevant measurement is the approach to steady state over the first two weeks in individual patients, alongside serial corrected QT intervals, because both of the drug’s characteristic hazards — delayed respiratory depression and arrhythmia — are accumulation phenomena.',
          dependsOnStepId: 'met-w4',
          reagentsAndBuffer:
            'LC-MS/MS with deuterated methadone and EDDP internal standards, enantioselective chromatography to report R- and S-methadone separately, serial 12-lead electrocardiography with Fridericia-corrected QT, CYP2B6 and CYP3A4 genotyping, paired urinary pH measurement',
        },
      ],
    },
    keyAudits: [
      {
        id: 'met-a1',
        category: 'measured',
        title: 'The randomised evidence shows retention, not survival',
        laymanSummary:
          'Eleven randomised trials in nearly two thousand people found methadone kept more of them in treatment and cut heroin use. On deaths, and on crime, the difference did not reach statistical significance.',
        technicalDetails:
          'Mattick and colleagues included 11 randomised clinical trials, two of them double-blind, totalling 1,969 participants. Methadone was statistically significantly more effective than non-pharmacological approaches at retaining patients in treatment and at suppressing heroin use measured by self-report and urine or hair analysis (6 RCTs, RR 0.66, 95% CI 0.56 to 0.78). It was not statistically different on criminal activity (3 RCTs, RR 0.39, 95% CI 0.12 to 1.25) or on mortality (4 RCTs, RR 0.48, 95% CI 0.10 to 2.39). Sequence generation was inadequate in one study and unclear in several; allocation concealment was adequate in only three. The point estimates for crime and mortality both favour methadone substantially and both have confidence intervals crossing one, which is what four small trials look like when the outcome is rare. The reviewers’ conclusion states it precisely: methadone retains patients and decreases heroin use better than treatments without opioid replacement, and does not show a statistically significant superior effect on criminal activity or mortality.',
        evidenceSource:
          'Mattick RP, Breen C, Kimber J, Davoli M. Methadone maintenance therapy versus no opioid replacement therapy for opioid dependence. Cochrane Database Syst Rev 2009;(3):CD002209',
        doi: '10.1002/14651858.CD002209.pub2',
        measuredMetric:
          'Retention in treatment, heroin use, criminal activity and mortality, methadone maintenance against non-pharmacological treatment',
        auditFlag: 'verified',
      },
      {
        id: 'met-a2',
        category: 'inferred',
        title: 'The mortality case is enormous, consistent, and observational',
        laymanSummary:
          'Nineteen cohorts following almost 123,000 people on methadone found death rates roughly a third of those seen out of treatment. The authors themselves say further work is needed to account for confounding and selection, because people are not randomly assigned to be in or out of treatment.',
        technicalDetails:
          'Sordo and colleagues pooled 19 eligible cohorts following 122,885 people treated with methadone over 1.3 to 13.9 years and 15,831 treated with buprenorphine over 1.1 to 4.5 years. Pooled all-cause mortality was 11.3 per 1,000 person-years in methadone treatment and 36.1 out of it (unadjusted out-to-in rate ratio 3.20, 95% CI 2.65 to 3.86), and 4.3 against 9.5 for buprenorphine (2.20, 1.34 to 3.61). Pooled overdose mortality was 2.6 in and 12.7 out of methadone treatment (rate ratio 4.80, 2.90 to 7.96) and 1.4 against 4.6 for buprenorphine. In trend analysis, all-cause mortality dropped sharply over the first four weeks of methadone treatment and rose in the two weeks after leaving treatment; on buprenorphine it remained stable during induction. The authors state that these findings are potentially important but that further research must properly account for potential confounding and selection bias in comparisons of mortality risk between treatments and across periods in and out of them. The inference this supports is that retention is associated with far lower mortality. The inference it does not license, on its own, is a causal effect size, or a head-to-head ranking of methadone against buprenorphine.',
        evidenceSource:
          'Sordo L, Barrio G, Bravo MJ, et al. Mortality risk during and after opioid substitution treatment: systematic review and meta-analysis of cohort studies. BMJ 2017;357:j1550',
        doi: '10.1136/bmj.j1550',
        inferredClaim:
          'That methadone maintenance causes the roughly three-fold lower mortality observed during treatment — supported by 19 large cohorts, unsupported by the randomised trials, and flagged for confounding by the meta-analysis authors themselves',
        measuredMetric:
          'All-cause and overdose mortality per 1,000 person-years in and out of methadone treatment across 122,885 patients',
        auditFlag: 'contested',
      },
      {
        id: 'met-a3',
        category: 'failed',
        title: 'A few per cent of prescriptions, a third of the deaths',
        laymanSummary:
          'When methadone was widely prescribed as a cheap long-acting painkiller, it accounted for a small share of opioid prescribing and about a third of prescription opioid overdose deaths.',
        technicalDetails:
          'CDC analysed fatal methadone overdoses and sales nationally over 1999 to 2010 and overdose death rates in 13 states for 2009. Methadone overdose deaths and sales rates peaked in 2007. In 2010 methadone accounted for between 4.5% and 18.5% of the opioids distributed by state. It was involved in 31.4% of opioid pain reliever deaths in the 13 states and accounted for 39.8% of single-drug opioid pain reliever deaths, with an overdose death rate significantly greater than that of other opioid pain relievers for both multidrug and single-drug deaths. The mechanism is in the label: the peak respiratory depressant effect occurs later and persists longer than the peak analgesic effect, and terminal half-life ranges from 8 to 59 hours across studies, so a patient titrating by feel accumulates. CDC concluded that methadone should not be used for mild pain, acute pain, breakthrough pain or on an as-needed basis, and that for chronic non-cancer pain it should not be considered a drug of first choice by prescribers or insurers. That last clause names the actual driver: methadone was being selected on formularies because it was cheap.',
        evidenceSource:
          'Centers for Disease Control and Prevention. Vital signs: risk for overdose from methadone used for pain relief — United States, 1999-2010. MMWR Morb Mortal Wkly Rep 2012;61(26):493-497',
        measuredMetric:
          'Share of opioid pain reliever overdose deaths involving methadone against its share of opioids distributed, 13 states, 2009-2010',
        auditFlag: 'caution',
      },
      {
        id: 'met-a4',
        category: 'measured',
        title: 'It blocks a cardiac potassium channel, and the label says so in a box',
        laymanSummary:
          'Methadone lengthens the heart’s electrical recovery and can trigger a lethal rhythm. The case series that established this reported seventeen patients with an average corrected QT of 615 milliseconds — well over the usual danger threshold.',
        technicalDetails:
          'Krantz and colleagues reported a retrospective case series of 17 methadone-treated patients from United States maintenance programmes and a Canadian pain centre who developed torsades de pointes. Mean daily methadone dose was 397 ± 283 mg and mean corrected QT interval was 615 ± 77 ms. Fourteen had a predisposing risk factor for arrhythmia, 14 received a defibrillator or pacemaker, and all 17 survived. The paper opens by noting that a methadone derivative, levacetylmethadol, had already been withdrawn from the European market after association with torsades. The current methadone label carries this as a boxed warning: QT interval prolongation and serious arrhythmia have occurred during treatment, most cases involving patients treated for pain with large multiple daily doses, although cases have been reported at doses commonly used for maintenance treatment of opioid addiction. Mechanistically the racemate’s S-enantiomer is the more potent blocker of the hERG potassium channel while the R-enantiomer carries the opioid effect, so the cardiac liability travels with a component that is not doing the therapeutic work.',
        evidenceSource:
          'Krantz MJ, Lewkowiez L, Hays H, Woodroffe MA, Robertson AD, Mehler PS. Torsade de pointes associated with very-high-dose methadone. Ann Intern Med 2002;137(6):501-504; methadone hydrochloride United States prescribing information, boxed warning and Warnings and Precautions 5.3',
        doi: '10.7326/0003-4819-137-6-200209170-00010',
        measuredMetric:
          'Corrected QT interval and daily methadone dose in 17 patients who developed torsades de pointes',
        auditFlag: 'verified',
      },
      {
        id: 'met-a5',
        category: 'inferred',
        title: 'The NMDA story is on the label, and the label says its value is unknown',
        laymanSummary:
          'Methadone is often described as uniquely useful in nerve pain because it also blocks a second receptor called NMDA. The prescribing information states that some data indicate it does, and that what that contributes to the drug’s effect is unknown.',
        technicalDetails:
          'Section 12.1 of the methadone label reads: "Methadone hydrochloride is a mu-agonist; a synthetic opioid with multiple actions qualitatively similar to those of morphine... Some data also indicate that methadone acts as an antagonist at the N-methyl-D-aspartate (NMDA) receptor. The contribution of NMDA receptor antagonism to methadone’s efficacy is unknown." The clinical claim built on that sentence — that methadone succeeds in neuropathic pain, or in opioid-tolerant patients, where other opioids fail, because of NMDA blockade — is a mechanism-to-outcome inference the regulator declines to make. It also sits awkwardly with the enantiomer picture: the NMDA antagonism is generally attributed to S-methadone, the same enantiomer that carries most of the hERG liability and little of the opioid agonism. Whether the marketed racemate delivers enough NMDA blockade at clinical concentrations to matter is the question, and the label’s position is that it is unanswered.',
        evidenceSource:
          'Methadone hydrochloride United States prescribing information, Clinical Pharmacology 12.1',
        inferredClaim:
          'That NMDA receptor antagonism gives methadone a clinical advantage in neuropathic or opioid-tolerant pain — a mechanism the label acknowledges and whose contribution to efficacy it states is unknown',
        auditFlag: 'contested',
      },
      {
        id: 'met-a6',
        category: 'failed',
        title: 'A half-life the label cannot give a single number for',
        laymanSummary:
          'The prescribing information reports that methadone’s terminal half-life ranged from eight to fifty-nine hours across published studies, and its clearance from 1.4 to 126 litres per hour. That is a ninety-fold spread in clearance for a drug with a narrow safety margin.',
        technicalDetails:
          'The label states that after multiple-dose administration, published reports put apparent plasma clearance between 1.4 and 126 L/h and terminal half-life between 8 and 59 hours in different studies. It adds that methadone is a base with pKa 9.2 so urinary pH alters its plasma disposition, and that it is lipophilic enough to persist in the liver and other tissues, with slow release from those tissues potentially prolonging its action despite low plasma concentrations. Hepatic N-demethylation runs through five cytochrome P450 isoforms — CYP3A4, CYP2B6, CYP2C19, CYP2C9 and CYP2D6 — each with its own inhibitors and inducers, which is why the boxed warning names all five. The practical consequence is that steady state is reached at a time nobody can predict for an individual patient, that the peak respiratory depressant effect arrives after the peak analgesic effect, and that a dose which felt too weak on the first day may be lethal on the fourth. This is a pharmacokinetic failure mode rather than a trial failure, and it is the mechanism behind the mortality figures on this page.',
        evidenceSource:
          'Methadone hydrochloride United States prescribing information, Clinical Pharmacology 12.3 and boxed warning',
        measuredMetric:
          'Reported range of apparent plasma clearance (1.4 to 126 L/h) and terminal half-life (8 to 59 hours) across published multiple-dose studies',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Not a poppy molecule at all',
        laymanDesc:
          'Methadone looks nothing like morphine. It is a fully synthetic compound built from two benzene rings and a short chain, which happens to fold into the shape the opioid receptor recognises.',
        molecularDetail:
          'A diphenylheptanone, C21H27NO, with no morphinan ring system. Marketed as the racemate: R-methadone carries essentially all the mu agonism, S-methadone most of the hERG potassium channel block.',
        iconName: 'Atom',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It goes into tissue and comes back out slowly',
        laymanDesc:
          'Being fat-soluble, methadone loads into the liver and other tissues and leaks back out for days. That is why one dose lasts and why several doses stack up.',
        molecularDetail:
          'The label notes methadone is lipophilic and known to persist in liver and other tissues, and that slow release from those tissues may prolong its action despite low plasma concentrations. Terminal half-life 8 to 59 hours and apparent clearance 1.4 to 126 L/h across published studies; being a base of pKa 9.2, urinary pH alters disposition.',
        iconName: 'Layers',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Steady occupancy of the mu receptor',
        laymanDesc:
          'Instead of a peak and a crash, methadone holds the receptor at a steady level. No rush, no withdrawal, and enough occupancy that another opioid on top does much less.',
        molecularDetail:
          'Full mu agonism with a pharmacodynamic profile qualitatively similar to morphine; the label notes the withdrawal syndrome is slower in onset, longer in course and less severe in symptoms than morphine’s. Some data indicate NMDA receptor antagonism, whose contribution to efficacy the label states is unknown.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Five liver enzymes, and everything interacts',
        laymanDesc:
          'Methadone is broken down by five different liver enzymes. Almost any new medicine can raise or lower its level, and the boxed warning names all five.',
        molecularDetail:
          'Hepatic N-demethylation to inactive EDDP by CYP3A4, CYP2B6, CYP2C19, CYP2C9 and CYP2D6. The boxed warning states that concomitant use with inhibitors of any of them may increase methadone concentrations and cause potentially fatal respiratory depression, and that inducers may reduce effect and precipitate withdrawal.',
        iconName: 'Filter',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And a potassium channel in the heart',
        laymanDesc:
          'The same molecule blocks a channel that resets the heart’s electrical cycle. Lengthen that cycle enough and a lethal rhythm becomes possible.',
        molecularDetail:
          'hERG potassium channel block, more potent for S-methadone than R-methadone. Boxed warning for QT prolongation and torsades de pointes, most cases at large multiple daily analgesic doses but reported at maintenance doses too. The founding case series: 17 patients, mean daily dose 397 ± 283 mg, mean QTc 615 ± 77 ms.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What treatment actually changes',
        laymanDesc:
          'Randomised trials show people stay in treatment and use less heroin. The much larger observational record shows death rates roughly a third of those out of treatment — a finding its own authors flag for confounding.',
        molecularDetail:
          'Cochrane CD002209, 11 RCTs, 1,969 participants: heroin use RR 0.66 (95% CI 0.56 to 0.78); mortality RR 0.48 (0.10 to 2.39), not significant. Sordo BMJ 2017, 19 cohorts, 122,885 methadone patients: all-cause mortality 11.3 against 36.1 per 1,000 person-years in against out of treatment; overdose mortality 2.6 against 12.7.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane CD002209 — 11 randomised trials of methadone maintenance',
        phase:
          'Systematic review and meta-analysis of randomised clinical trials, two of them double-blind',
        sampleSize: 1969,
        primaryEndpoint:
          'Retention in treatment and suppression of heroin use with methadone maintenance against treatments not using opioid replacement, in opioid dependence',
        endpointMet: true,
        statisticalPValue:
          'Heroin use RR 0.66 (95% CI 0.56 to 0.78) across 6 RCTs; retention significantly better; criminal activity RR 0.39 (0.12 to 1.25) and mortality RR 0.48 (0.10 to 2.39), neither statistically significant',
        unreportedAdverseSignals:
          'Sequence generation was inadequate in one included study and unclear in several; allocation concealment was adequate in only three. The mortality analysis rests on four trials and its confidence interval spans a five-fold reduction to a two-fold increase — the outcome most often attributed to methadone is the one the randomised evidence is least able to resolve.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Sordo et al., BMJ 2017;357:j1550 — pooled cohort mortality analysis',
        phase: 'Systematic review and multivariate random-effects meta-analysis of cohort studies',
        sampleSize: 122885,
        primaryEndpoint:
          'All-cause and overdose mortality per 1,000 person-years during and outside methadone treatment in people with opioid dependence',
        endpointMet: true,
        statisticalPValue:
          'All-cause mortality 11.3 in against 36.1 out of methadone treatment (unadjusted out-to-in rate ratio 3.20, 95% CI 2.65 to 3.86); overdose mortality 2.6 against 12.7 (4.80, 2.90 to 7.96)',
        unreportedAdverseSignals:
          'These are cohort data, not randomised. The authors state that further research must properly account for potential confounding and selection bias, both between treatments and across periods in and out of treatment. All-cause mortality dropped sharply only over the first four weeks of methadone treatment, so induction is a period of elevated rather than reduced risk, as are the weeks immediately after leaving.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Heroin use RR 0.66 (95% CI 0.56 to 0.78) with methadone maintenance against non-pharmacological treatment across 6 randomised trials',
        'Mortality RR 0.48 (95% CI 0.10 to 2.39) across 4 randomised trials — favourable point estimate, not statistically significant',
        'All-cause mortality 11.3 against 36.1 per 1,000 person-years in and out of methadone treatment across 19 cohorts and 122,885 patients',
        'Methadone involved in 31.4% of opioid pain reliever deaths in 13 states while accounting for 4.5% to 18.5% of opioids distributed by state',
        'Mean corrected QT of 615 ± 77 ms at a mean daily dose of 397 ± 283 mg in 17 patients with torsades de pointes',
        'Terminal half-life reported between 8 and 59 hours and apparent clearance between 1.4 and 126 L/h across published multiple-dose studies',
      ],
      unsupportedInferences: [
        'That methadone maintenance has a demonstrated randomised mortality benefit — the point estimate favours it, the confidence interval does not exclude harm, and the case rests on cohort data',
        'That NMDA receptor antagonism gives methadone an advantage in neuropathic or opioid-tolerant pain, when the label states that contribution is unknown',
        'That a stated methadone dose corresponds to a predictable exposure, given a reported ninety-fold range in apparent clearance',
        'That the cohort comparison of methadone against buprenorphine mortality ranks the two drugs, when the populations were never randomised against each other',
      ],
      whatFailedInitially: [
        'Mortality and criminal activity as randomised endpoints, neither reaching statistical significance across the available trials',
        'Methadone as a cheap first-line long-acting analgesic, which CDC concluded should not be a drug of first choice for chronic non-cancer pain',
        'The assumption that a long half-life is simply convenient, when the peak respiratory depressant effect arrives after the peak analgesic effect',
        'Levacetylmethadol, a methadone derivative withdrawn from the European market after association with torsades de pointes, which is the fact the original QT case series opens with',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines, and the backbone of opioid maintenance treatment worldwide since the 1960s',
        'Dispensed in the United States under 42 CFR Part 8, which for most patients means attendance at a certified opioid treatment programme',
        'Boxed warnings for respiratory depression, QT prolongation, accidental ingestion, abuse potential, cytochrome P450 interactions and the conditions of use for addiction treatment',
        'About eighteen United States cents a tablet at pharmacy acquisition cost, which is both why it is available everywhere and why it was once selected onto formularies as an analgesic',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets, dispersible tablets for oral suspension, concentrated oral solution and injection. Schedule II controlled substance in the United States; for opioid addiction, distribution and use are subject to 42 CFR Part 8.',
      description:
        'Once-daily oral dosing is possible because of a terminal half-life the label reports between 8 and 59 hours, and that same range is why steady state is reached at an unpredictable time. Being lipophilic, methadone loads into liver and other tissue and releases slowly, which the label notes may prolong its action despite low plasma concentrations. Because it is a base of pKa 9.2, urinary pH alters its disposition.',
      safetyProfile:
        'Boxed warnings for life-threatening respiratory depression during initiation and conversion, including in patients using the drug as directed; life-threatening QT prolongation and torsades de pointes; fatal overdose from accidental ingestion, especially by children; abuse potential comparable to other opioid agonists; interactions with drugs affecting CYP3A4, CYP2B6, CYP2C19, CYP2C9 and CYP2D6; concomitant benzodiazepines and other CNS depressants; and the regulatory conditions for treatment of opioid addiction. The label states that the peak respiratory depressant effect occurs later and persists longer than the peak pharmacologic effect, especially during initial dosing — the single most important sentence on the document.',
    },
    commonQuestions: [
      {
        q: 'Does methadone treatment save lives?',
        a: 'The observational evidence says yes, emphatically, and the randomised evidence has never demonstrated it. The Cochrane review of 11 trials in 1,969 people found a mortality relative risk of 0.48 with a confidence interval from 0.10 to 2.39 — a favourable point estimate that does not exclude harm, based on four small trials. The cohort evidence is on a different scale: 19 cohorts following 122,885 people found all-cause mortality of 11.3 per 1,000 person-years during methadone treatment against 36.1 outside it, and overdose mortality of 2.6 against 12.7. Those cohorts are consistent and enormous, and their authors write that further research is needed to account properly for confounding and selection bias. Both facts belong in the answer.',
        auditNote:
          'When randomised trials are underpowered for a rare outcome and cohorts are huge but non-randomised, the honest report is both, labelled. Reporting only the cohorts is how a page becomes advocacy.',
      },
      {
        q: 'Why is the beginning of treatment the dangerous part?',
        a: 'Because methadone accumulates and its two effects come apart in time. The label states that the peak respiratory depressant effect occurs later, and persists longer, than the peak pharmacologic effect, especially during the initial dosing period, and reports a terminal half-life anywhere between 8 and 59 hours depending on the study and the person. So a dose that feels inadequate on day one can be dangerous by day four, and topping up is exactly the wrong response. The cohort data show the same shape: all-cause mortality dropped sharply only over the first four weeks of methadone treatment, meaning induction is a period of elevated risk that then resolves.',
      },
      {
        q: 'Why did methadone cause so many overdose deaths when it was used for pain?',
        a: 'Because it was cheap, long-acting and unforgiving, and it was selected for the first two properties. CDC found that in 2010 methadone accounted for between 4.5% and 18.5% of opioids distributed by state, and was involved in 31.4% of opioid pain reliever deaths in the 13 states studied, and 39.8% of single-drug ones. The mechanism is the accumulation problem. CDC’s conclusion was explicit: methadone should not be used for mild pain, acute pain, breakthrough pain or on an as-needed basis, and for chronic non-cancer pain it should not be considered a drug of first choice by prescribers or insurers. That last phrase — or insurers — names how it got there.',
      },
      {
        q: 'Should I have my heart checked?',
        a: 'That is a question for the prescriber, and the reason it comes up is on the label. Methadone blocks the hERG potassium channel and can prolong the QT interval; the boxed warning records that torsades de pointes has occurred, mostly in patients on large multiple daily doses for pain but also at doses used in maintenance treatment. The case series that first described it reported a mean corrected QT of 615 ms at a mean daily dose of 397 mg, and 14 of the 17 patients had another risk factor for arrhythmia. The things that raise the concern are high dose, other QT-prolonging drugs, electrolyte disturbance, and any personal or family history of fainting or sudden death.',
      },
      {
        q: 'Is methadone better than buprenorphine?',
        a: 'They have not been randomised against each other at the scale that would answer it, and the cohort comparison points in two directions at once. In the Sordo meta-analysis, all-cause mortality was lower during buprenorphine treatment than during methadone treatment (4.3 against 11.3 per 1,000 person-years), but the drop relative to being out of treatment was larger for methadone (rate ratio 3.20 against 2.20). The populations differ systematically — who is offered which drug is not random — and the authors say so. What the data do agree on is that retention is what matters, that methadone induction carries elevated risk while buprenorphine induction does not, and that the weeks after leaving either treatment are dangerous.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Mattick RP, Breen C, Kimber J, Davoli M. Methadone maintenance therapy versus no opioid replacement therapy for opioid dependence. Cochrane Database Syst Rev 2009;(3):CD002209',
        identifier: '10.1002/14651858.CD002209.pub2',
        kind: 'doi',
      },
      {
        label:
          'Sordo L, Barrio G, Bravo MJ, Indave BI, Degenhardt L, Wiessing L, Ferri M, Pastor-Barriuso R. Mortality risk during and after opioid substitution treatment: systematic review and meta-analysis of cohort studies. BMJ 2017;357:j1550',
        identifier: '10.1136/bmj.j1550',
        kind: 'doi',
      },
      {
        label:
          'Centers for Disease Control and Prevention. Vital signs: risk for overdose from methadone used for pain relief — United States, 1999-2010. MMWR Morb Mortal Wkly Rep 2012;61(26):493-497',
        identifier: '22763888',
        kind: 'pmid',
      },
      {
        label:
          'Krantz MJ, Lewkowiez L, Hays H, Woodroffe MA, Robertson AD, Mehler PS. Torsade de pointes associated with very-high-dose methadone. Ann Intern Med 2002;137(6):501-504',
        identifier: '10.7326/0003-4819-137-6-200209170-00010',
        kind: 'doi',
      },
      {
        label:
          'Methadone hydrochloride United States prescribing information — boxed warning, Clinical Pharmacology 12.1 Mechanism of Action and 12.3 Pharmacokinetics, Warnings and Precautions 5.3',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=methadone',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — methadone, 26 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 4095 — methadone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4095',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Tapentadol — twelve dollars a tablet for 0.24 of a point on an eleven-point scale against
  //    oxycodone, on a dual mechanism its own label calls preclinical and of unclear relevance.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tapentadol',
    name: 'Tapentadol',
    tradeName: 'Nucynta / Nucynta ER / Palexia',
    sponsor:
      'Collegium Pharmaceuticals Inc. (holder on the enriched record); originated at Grünenthal, developed and launched in the United States by Johnson & Johnson under NDA 022304 and NDA 200533',
    targetGene: 'OPRM1 and SLC6A2',
    targetProtein:
      'Mu-opioid receptor as an agonist, and the noradrenaline transporter as a reuptake inhibitor — a dual action the label attributes to preclinical studies and whose clinical relevance it describes as unclear',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2008,
    indication:
      'The immediate-release tablet is indicated for the management of acute pain severe enough to require an opioid analgesic and for which alternative treatments are inadequate, in adults and in children aged 6 years and older weighing at least 40 kg. The extended-release tablet is indicated for severe and persistent pain in adults requiring an opioid analgesic that cannot be adequately treated with alternative options including immediate-release opioids, and for severe and persistent neuropathic pain associated with diabetic peripheral neuropathy in adults on the same terms.',
    patientFriendlyIndication:
      'Severe pain needing an opioid, including the nerve pain of diabetes, when other options are inadequate',
    anatomicalSite:
      'Mu-opioid receptors of the spinal cord and brainstem, and the noradrenaline transporter on descending inhibitory neurons of the dorsal horn',
    conditionContext: {
      conditionExplainer:
        'The body has two separate systems for turning pain down: the opioid one, and a descending pathway that uses noradrenaline. Tapentadol was designed to engage both from one molecule, on the theory that a smaller push on each would give the same relief with fewer opioid side effects.',
      whyItMatters:
        'It is the most expensive opioid in ordinary use — about twelve and a half United States dollars a tablet against twenty cents for oxycodone — and the case for that price rests on a tolerability argument rather than an efficacy one. The Cochrane review that examined it found the efficacy difference against oxycodone to be 0.24 of a point on an eleven-point scale, and found the manufacturer refused a request for the unpublished data needed to check the imputation.',
      whoTakesThis:
        'Adults with severe pain including diabetic nerve pain, and — for the immediate-release tablet only — children aged 6 and over weighing at least 40 kg.',
      clinicalGoals:
        'Pain relief with fewer people stopping because of nausea, vomiting and constipation. That second half is where the measured advantage is, and it is real: half the discontinuation for adverse effects compared with oxycodone.',
    },
    oneSentenceVerdict:
      'A mu-opioid agonist and noradrenaline reuptake inhibitor whose Cochrane review of four trials and 4,094 patients found it beat placebo by 0.56 of a point on an 11-point pain scale (NNT 16, 95% CI 9 to 57) and oxycodone by 0.24 of a point, with genuinely halved discontinuation for adverse effects against oxycodone (NNTB 6) — sold at about US$12.52 a tablet against US$0.20 for oxycodone, on a dual mechanism its own label calls preclinical and of unclear clinical relevance, and with the manufacturer having refused the reviewers’ request for the unpublished data needed to check the imputation method.',
    laymanHowItWorks:
      'Tapentadol does two things at once. It binds the mu-opioid receptor, weakly compared with oxycodone or morphine. And it blocks the reuptake of noradrenaline in the spinal cord, which strengthens the body’s own descending pain-suppression pathway — the same trick antidepressants like duloxetine use for nerve pain. The idea is that combining a weak push on each system gives full pain relief with less of the nausea and constipation that come from pushing hard on the opioid one alone. The prescribing information is careful about this: it says the exact mechanism of action is unknown, that the two properties come from preclinical studies, and that their clinical relevance is unclear.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 54,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$12.52 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 8 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 20 November 2008 under NDA 022304 (immediate release), with the extended-release product under NDA 200533. Generic entry has begun — the CMS survey lists eight generic products — and the acquisition cost remains about sixty-three times that of oxycodone per tablet. The molecule is not on the WHO Model List of Essential Medicines.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The comparison that decides this drug is against oxycodone, and it has been done four times in 4,094 patients. Tapentadol was better on pain by 0.24 of a point on an 11-point scale — statistically present, clinically negligible — and better on tolerability by a real margin, halving discontinuation for adverse effects with a number-needed-to-treat of 6. Whether that tolerability gain is worth roughly sixty times the price is the actual question, and it is a question about money rather than about pharmacology. Where the target is nerve pain specifically, duloxetine reaches the same noradrenergic pathway without an opioid attached, at about a tenth of a dollar.',
      conventionalRx: [
        {
          name: 'Oxycodone',
          class: 'Full mu-opioid agonist',
          howItCompares:
            'The active comparator in every one of the four trials in the Cochrane review. Pooled, tapentadol reduced pain intensity by 0.24 points more on an 11-point NRS (95% CI 0.43 to 0.05), and the two studies reporting responder rates showed a non-significant 1.46-fold increase in responding (95% CI 0.92 to 2.32). Tapentadol did halve discontinuation for adverse effects (risk reduction 50%, 95% CI 42% to 60%, NNTB 6) and cut overall adverse effects by 9% (NNTH 18).',
          typicalCost:
            'US$0.1974 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 193 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: about a sixty-third of the price, and no worse than 0.24 of a point behind on pain. Cons: roughly twice the discontinuation for adverse effects, chiefly gastrointestinal; a boxed CYP3A4 interaction warning tapentadol does not carry.',
        },
        {
          name: 'Duloxetine',
          class: 'Serotonin-noradrenaline reuptake inhibitor',
          howItCompares:
            'Reaches the same descending noradrenergic pathway tapentadol’s second mechanism is built on, without any opioid component, and carries its own licensed indication in diabetic peripheral neuropathic pain — the condition Nucynta ER was licensed for on two randomised-withdrawal trials. It has no controlled-substance status and no respiratory depression.',
          typicalCost:
            'US$0.1293 per capsule at United States pharmacy acquisition cost (CMS NADAC, median across 74 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: about a hundredth of the price, no dependence, no overdose respiratory risk, evidence in the same neuropathic indication. Cons: takes weeks to act, useless in acute pain, and has a discontinuation syndrome of its own.',
        },
        {
          name: 'Morphine, immediate release',
          class: 'Full mu-opioid agonist',
          howItCompares:
            'Not compared head to head with tapentadol in the Cochrane review, but the reference against which the whole class is measured, on the WHO Essential Medicines List, and available everywhere. Where a strong opioid is genuinely required, this is the option with the longest record and the lowest price.',
          typicalCost:
            'US$0.4096 per millilitre of oral solution at United States pharmacy acquisition cost (CMS NADAC, median across 75 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheap, universally available, two centuries of experience. Cons: the same gastrointestinal burden that tapentadol was designed to reduce, and a renally cleared active metabolite.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Do not add a serotonergic drug without saying so',
          action:
            'Mention every antidepressant, triptan, tramadol and linezolid course before starting.',
          patientImpact:
            'Tapentadol inhibits noradrenaline reuptake, and the class carries a serotonin syndrome warning when combined with serotonergic drugs. Monoamine oxidase inhibitors are contraindicated.',
          clinicalPrecaution:
            'This is a class of interaction that does not apply to morphine or oxycodone, and it is the direct consequence of the second mechanism the drug is sold on.',
        },
        {
          name: 'It is still a Schedule II opioid',
          action: 'Treat it with the same storage and disposal care as any other strong opioid.',
          patientImpact:
            'The label carries the full opioid boxed warning set — addiction, abuse and misuse; life-threatening respiratory depression; accidental ingestion; neonatal opioid withdrawal syndrome; benzodiazepine and CNS depressant interaction; the opioid analgesic REMS.',
          clinicalPrecaution:
            'A weaker mu-opioid affinity than oxycodone is not the same as a weaker opioid effect at the doses used, and the regulatory schedule reflects that.',
        },
        {
          name: 'Ask what it costs before the first prescription',
          action: 'Ask the pharmacy what the copay will be, and what the alternative would cost.',
          patientImpact:
            'At CMS acquisition cost, tapentadol is about US$12.52 a tablet against US$0.1974 for oxycodone — about sixty-three times, for a pooled pain difference of 0.24 of a point on an 11-point scale.',
          clinicalPrecaution:
            'The tolerability advantage against oxycodone is real and measured. The price question is whether that advantage is worth that multiple, and it is a question the trials cannot answer.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC[C@@H](C1=CC(=CC=C1)O)[C@@H](C)CN(C)C',
      chemicalFormula: 'C14H23NO',
      molecularWeight: '221.34 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'A single-enantiomer 3-aryl-propylamine, structurally derived from the active metabolite of tramadol but designed as one compound rather than a prodrug and a racemate. The label states: "Tapentadol is a centrally-acting synthetic analgesic. The exact mechanism of action is unknown. Although the clinical relevance is unclear, preclinical studies have shown that tapentadol is a mu-opioid receptor (MOR) agonist and a norepinephrine reuptake inhibitor (NRI). Analgesia in animal models is derived from both of these properties." Unlike tramadol and codeine it does not depend on CYP2D6 activation; it is cleared chiefly by glucuronidation.',
      structureSource: {
        label:
          'PubChem CID 9838022 (tapentadol) — canonical SMILES, molecular formula and weight, as carried on the enriched record and machine-verified by the RNAwiki structure engine; mechanism statement quoted from the NUCYNTA label, section 12.1 (NDA 022304)',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9838022',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tap-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Resolve all four stereoisomers before anything else',
          description:
            'Tapentadol has two adjacent stereocentres and only one of the four possible isomers is the drug. The other three are impurities with their own pharmacology, and a routine achiral assay cannot see them. This is the step where a potency specification and a stereochemical one are the same specification.',
          reagentsAndBuffer:
            'Tapentadol hydrochloride reference standard, chiral HPLC on an amylose or cellulose stationary phase, circular dichroism detection, optical rotation determination, Karl Fischer titration',
        },
        {
          id: 'tap-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the two adjacent stereocentres and demethylate the aryl ether',
          description:
            'The synthesis constructs a 3-(3-methoxyphenyl)-2-methylpentylamine skeleton with defined relative and absolute configuration at both centres, then removes the aryl methyl ether to expose the phenol that the receptor requires. Demethylation is run late because the free phenol complicates every earlier step.',
          dependsOnStepId: 'tap-w1',
          reagentsAndBuffer:
            'Chiral auxiliary or asymmetric catalyst for the stereocentre-setting step, dimethylamine, boron tribromide or methanesulfonic acid with methionine for O-demethylation, anhydrous solvents under nitrogen, in-process chiral HPLC',
        },
        {
          id: 'tap-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the hydrochloride and control the diastereomer',
          description:
            'Form and recrystallise tapentadol hydrochloride, releasing against specified limits for each of the three unwanted stereoisomers. Because the marketed product is a single enantiomer, this separation is the whole cost driver of the drug substance.',
          dependsOnStepId: 'tap-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in alcohol, fractional crystallisation or preparative chiral chromatography, HPLC release assay with validated chiral impurity method',
        },
        {
          id: 'tap-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure mu agonism and noradrenaline transporter block at the same concentrations',
          description:
            'The whole product proposition is a ratio: enough opioid effect, less opioid burden, with the difference made up by noradrenergic action. Testing the two properties in separate systems at separate concentrations cannot test that proposition. The experiment has to report both at the plasma concentrations the label reports in patients.',
          dependsOnStepId: 'tap-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human OPRM1 for [35S]GTPgammaS binding with DAMGO reference and naloxone control; HEK293 cells expressing human SLC6A2 for [3H]noradrenaline uptake with desipramine reference; both run across the clinical concentration range from the label’s pharmacokinetics section',
        },
        {
          id: 'tap-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Report the trials on baseline-observation-carried-forward, not last-observation',
          description:
            'Every trial in the Cochrane review imputed missing data by carrying the last observation forward, which credits a patient who quit early with the improvement they had at the moment they quit. In a trial whose selling point is that fewer people quit, that choice interacts directly with the endpoint. The reviewers asked the manufacturer for baseline-carried-forward analyses and were refused.',
          dependsOnStepId: 'tap-w4',
          reagentsAndBuffer:
            'Individual participant data from the four registered phase 3 programmes, pre-specified BOCF and multiple-imputation sensitivity analyses alongside the LOCF primary, responder-rate reporting for every study rather than for two of four',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tap-a1',
        category: 'measured',
        title: 'Against oxycodone, a quarter of a point on a ten-point scale',
        laymanSummary:
          'Four trials in over four thousand patients compared tapentadol with oxycodone. On pain, tapentadol was ahead by 0.24 of a point out of ten. Against placebo it was ahead by 0.56 of a point, with sixteen people needing treatment for one extra responder.',
        technicalDetails:
          'Santos and colleagues included four parallel-design randomised trials of moderate quality, totalling 4,094 patients with osteoarthritis, back pain or both. Three were 12-week phase 3 studies and the fourth a 52-week open-label safety study; all four were oxycodone-controlled and three were also placebo-controlled. Against placebo, tapentadol gave a mean reduction of 0.56 points (95% CI 0.92 to 0.20) on the 11-point numerical rating scale at 12 weeks and a 1.36-fold increase in the chance of responding (95% CI 1.13 to 1.64), giving a number needed to treat for one additional beneficial outcome of 16 (95% CI 9 to 57) over 12 weeks. Against oxycodone, pooled data showed a 0.24-point greater reduction in pain intensity (95% CI 0.43 to 0.05), and the two studies that reported responder rates showed a non-significant 1.46-fold increase in responding (95% CI 0.92 to 2.32). Moderate to high heterogeneity was found for the efficacy estimates. The reviewers conclude that tapentadol extended release reduces pain intensity compared with placebo and oxycodone, but that the clinical significance is uncertain because of the modest difference between interventions, the heterogeneity, high withdrawal rates, missing responder data and the imputation problem.',
        evidenceSource:
          'Santos J, Alarcão J, Fareleira F, Vaz-Carneiro A, Costa J. Tapentadol for chronic musculoskeletal pain in adults. Cochrane Database Syst Rev 2015;(5):CD009923',
        doi: '10.1002/14651858.CD009923.pub2',
        measuredMetric:
          'Mean change in pain intensity on an 11-point numerical rating scale at 12 weeks, tapentadol against placebo and against oxycodone',
        auditFlag: 'verified',
      },
      {
        id: 'tap-a2',
        category: 'failed',
        title: 'The manufacturer refused the data the reviewers needed',
        laymanSummary:
          'Every trial handled dropouts by assuming the last pain score a person gave still applied after they quit. The Cochrane team asked the manufacturer for the analysis done the other way, and for the unpublished data. The request was denied.',
        technicalDetails:
          'The Cochrane review states that all trials reported last-observation-carried-forward as the imputation method, that the reviewers requested baseline-observation-carried-forward imputed analyses and any unpublished data from the manufacturer, and that the manufacturers denied the request. The choice of imputation is not a technicality here. LOCF credits a patient who withdraws with whatever improvement they had recorded at the moment of withdrawal; BOCF resets them to their starting pain. In a trial designed around the claim that fewer patients withdraw on the drug than on the comparator, the imputation method interacts directly with the primary endpoint, and the direction of that interaction favours the arm with fewer withdrawals. The review also records that two of the four oxycodone-controlled studies and one of the three placebo-controlled studies did not provide responder-rate data at all, and that two studies were at high risk of bias. The reviewers list "impossibility to use BOCF as imputation method" among the explicit reasons the clinical significance of the results is uncertain.',
        evidenceSource:
          'Santos J, Alarcão J, Fareleira F, Vaz-Carneiro A, Costa J. Tapentadol for chronic musculoskeletal pain in adults. Cochrane Database Syst Rev 2015;(5):CD009923',
        doi: '10.1002/14651858.CD009923.pub2',
        measuredMetric:
          'Availability of baseline-observation-carried-forward sensitivity analyses and unpublished trial data on request: denied',
        auditFlag: 'caution',
      },
      {
        id: 'tap-a3',
        category: 'inferred',
        title: 'The dual mechanism is preclinical, and the label says its relevance is unclear',
        laymanSummary:
          'Tapentadol is sold on doing two things at once: opioid receptor plus noradrenaline. The prescribing information says the exact mechanism of action is unknown, that both properties come from preclinical studies, and that the clinical relevance is unclear.',
        technicalDetails:
          'Section 12.1 of the NUCYNTA label reads in full: "Tapentadol is a centrally-acting synthetic analgesic. The exact mechanism of action is unknown. Although the clinical relevance is unclear, preclinical studies have shown that tapentadol is a mu-opioid receptor (MOR) agonist and a norepinephrine reuptake inhibitor (NRI). Analgesia in animal models is derived from both of these properties." Three qualifications in four sentences: mechanism unknown, relevance unclear, animal models. The commercial account — that a lower mu-opioid load explains the reduced gastrointestinal burden and that noradrenergic action makes up the analgesia — is a mechanism-to-outcome inference the regulator explicitly declines to endorse. What has been measured is the outcome, not the mechanism: half the discontinuation for adverse effects against oxycodone, and 0.24 of a point more pain relief. Those two findings are compatible with the dual-mechanism story and also with several others, and no trial in the programme was designed to distinguish between them.',
        evidenceSource:
          'NUCYNTA (tapentadol) United States prescribing information, Clinical Pharmacology 12.1 Mechanism of Action (NDA 022304)',
        inferredClaim:
          'That tapentadol’s tolerability advantage is produced by its noradrenaline reuptake inhibition sparing mu-opioid load — a mechanism the label describes as preclinical, of unclear clinical relevance, and resting on an exact mechanism it says is unknown',
        auditFlag: 'contested',
      },
      {
        id: 'tap-a4',
        category: 'measured',
        title: 'The tolerability advantage is real, and it is the strongest thing on this page',
        laymanSummary:
          'Compared with oxycodone, half as many people stopped tapentadol because of side effects. Six patients treated, one fewer withdrawal. That is the drug’s genuine finding.',
        technicalDetails:
          'In the same Cochrane analysis, tapentadol against oxycodone was associated with a 50% reduction in the risk of discontinuing treatment due to adverse effects (95% CI 42% to 60%), giving a number needed to treat for one additional beneficial outcome of 6 (95% CI 5 to 7) over 12 weeks. It was also associated with a 9% reduction in the overall risk of adverse effects (95% CI 4% to 15%, NNTH 18, 95% CI 12 to 35) and a non-significant 43% reduction in serious adverse effects. Against placebo the direction reverses, as it must: tapentadol carried a 2.7-fold increase in the risk of discontinuing for adverse effects (95% CI 2.05 to 3.52, NNTH 10, 95% CI 7 to 12). Read together, those two comparisons say what the drug is: an opioid, with an opioid’s adverse-effect burden relative to nothing, and about half of oxycodone’s burden relative to an equally analgesic opioid. Moderate to high heterogeneity applies to most of these safety estimates.',
        evidenceSource:
          'Santos J, Alarcão J, Fareleira F, Vaz-Carneiro A, Costa J. Tapentadol for chronic musculoskeletal pain in adults. Cochrane Database Syst Rev 2015;(5):CD009923',
        doi: '10.1002/14651858.CD009923.pub2',
        measuredMetric:
          'Risk of discontinuation due to adverse effects over 12 weeks, tapentadol against oxycodone and against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'tap-a5',
        category: 'inferred',
        title: 'The nerve-pain licence rests on two enriched-enrolment withdrawal trials',
        laymanSummary:
          'The diabetic nerve pain indication comes from two studies where everyone first took the drug openly for three weeks, and only those who tolerated it and improved were randomised. In the first, 591 started and 389 were randomised; a third dropped out during the open phase.',
        technicalDetails:
          'The NUCYNTA ER label describes both DPN studies: patients received open-label tapentadol ER for three weeks and were titrated to an individually stable dose, and only those who had tolerated the drug and shown at least a 1-point improvement in pain intensity on the 11-point NRS were randomised to continue or switch to placebo for 12 weeks. In Study DPN-1, 591 patients entered open-label treatment and 389 met the randomisation criteria; 34% discontinued open-label tapentadol ER during titration. In Study DPN-2, 459 entered and 320 were randomised; 22% discontinued during titration and a further 6% were not randomised because they failed to achieve a 1-point improvement. Both studies then showed significantly greater pain reduction on tapentadol ER than placebo over 12 weeks. That is a valid measurement of what happens when the drug is withdrawn from people it was already suiting. It is not an estimate of what happens to an unselected patient with diabetic neuropathy who starts it, and the label’s own figures — a third of DPN-1 lost before randomisation — show how large the difference between those two populations is.',
        evidenceSource:
          'NUCYNTA ER (tapentadol extended-release tablets) United States prescribing information, Clinical Studies 14.3 Neuropathic Pain Associated with Diabetic Peripheral Neuropathy (NDA 200533)',
        inferredClaim:
          'That the randomised-withdrawal result in diabetic peripheral neuropathy estimates the benefit for a patient starting tapentadol — when 34% of Study DPN-1 and 28% of Study DPN-2 were removed before randomisation for intolerance or non-response',
        auditFlag: 'caution',
      },
      {
        id: 'tap-a6',
        category: 'failed',
        title: 'Sixty-three times the price, for a quarter of a point',
        laymanSummary:
          'A tapentadol tablet costs pharmacies about twelve dollars fifty. An oxycodone tablet costs about twenty cents. The measured pain difference between them is 0.24 of a point on a scale of ten.',
        technicalDetails:
          'The CMS National Average Drug Acquisition Cost survey effective 19 August 2026 lists tapentadol at US$12.52 per unit across 8 generic products and oxycodone at US$0.1974 per unit across 193 — a ratio of about 63 to 1. The pooled Cochrane comparison of the two, across four trials and 4,094 patients, found tapentadol ahead by 0.24 points on an 11-point scale (95% CI 0.43 to 0.05), with a non-significant responder-rate difference. In the largest of the individual low back pain studies, NCT00449176, the posted registry result gives an identical mean pain change of −2.9 on tapentadol ER (n=312) and −2.9 on oxycodone CR (n=323), against −2.1 on placebo (n=316); the trial was powered to beat placebo, not the active comparator, and no tapentadol-against-oxycodone analysis is posted. The measured advantage that survives is tolerability: NNTB 6 for avoiding a discontinuation due to adverse effects over 12 weeks. That is a real clinical good and it is the basis on which the price should be argued, rather than on analgesic superiority, which the data do not support at any clinically meaningful size. Nothing here says the drug should not be used; it says what it is being bought.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, effective 19 August 2026, tapentadol (8 products) and oxycodone (193 products); Santos J, Alarcão J, Fareleira F, Vaz-Carneiro A, Costa J. Tapentadol for chronic musculoskeletal pain in adults. Cochrane Database Syst Rev 2015;(5):CD009923',
        doi: '10.1002/14651858.CD009923.pub2',
        measuredMetric:
          'Pharmacy acquisition cost per unit against pooled pain-intensity difference on an 11-point scale, tapentadol against oxycodone',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One molecule designed to do two jobs',
        laymanDesc:
          'Tapentadol was built from the working half of tramadol, as a single compound rather than a mixture that the liver has to activate. It does not depend on a liver enzyme to become a painkiller.',
        molecularDetail:
          'A single-enantiomer 3-aryl-propylamine, C14H23NO, with two adjacent stereocentres. Unlike tramadol and codeine it is not a CYP2D6 prodrug; it is cleared chiefly by glucuronidation, which removes the metaboliser lottery those drugs carry.',
        iconName: 'Atom',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A weaker grip on the opioid receptor',
        laymanDesc:
          'It binds the mu-opioid receptor much less tightly than morphine or oxycodone. On its own that would make it a poor painkiller.',
        molecularDetail:
          'Mu-opioid receptor agonism with substantially lower affinity than morphine. The label states the exact mechanism of action is unknown and that the MOR agonist and noradrenaline reuptake inhibitor properties are shown in preclinical studies whose clinical relevance is unclear.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'And a block on the noradrenaline transporter',
        laymanDesc:
          'At the same time it stops the spinal cord clearing away noradrenaline, which is the signal the brain uses to turn pain down from above. That is the same pathway antidepressants use in nerve pain.',
        molecularDetail:
          'Inhibition of the noradrenaline transporter SLC6A2 in the spinal dorsal horn, raising synaptic noradrenaline at descending inhibitory terminals. The label attributes analgesia in animal models to both properties together.',
        iconName: 'Network',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'What that produced on the pain scale',
        laymanDesc:
          'Against a dummy tablet, 0.56 of a point out of ten. Against oxycodone, 0.24 of a point. Sixteen people treated for one extra responder over placebo.',
        molecularDetail:
          'Cochrane CD009923: against placebo, mean 11-point NRS reduction 0.56 (95% CI 0.92 to 0.20) at 12 weeks, responder risk ratio 1.36 (1.13 to 1.64), NNTB 16 (9 to 57). Against oxycodone, 0.24 points (0.43 to 0.05), responder risk ratio 1.46 (0.92 to 2.32), not significant.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'And on the reason people stop taking it',
        laymanDesc:
          'Half as many people quit tapentadol for side effects as quit oxycodone. Six patients treated, one fewer withdrawal. This is the finding the drug actually earns.',
        molecularDetail:
          '50% relative reduction in discontinuation for adverse effects against oxycodone (95% CI 42% to 60%), NNTB 6 (5 to 7) over 12 weeks; 9% reduction in overall adverse effects (NNTH 18). Against placebo, a 2.7-fold increase in discontinuation for adverse effects (NNTH 10).',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The part the trials could not check',
        laymanDesc:
          'Every trial assumed a person who dropped out kept the pain score they had when they left. The reviewers asked for the analysis done the other way. The manufacturer said no.',
        molecularDetail:
          'All four included studies used last-observation-carried-forward imputation. Baseline-observation-carried-forward analyses and unpublished data were requested from the manufacturer and denied. Two of four oxycodone-controlled and one of three placebo-controlled studies reported no responder rates. Two studies were at high risk of bias.',
        iconName: 'FileWarning',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane CD009923 — four oxycodone-controlled trials of tapentadol ER',
        phase:
          'Systematic review and meta-analysis of four parallel-design randomised trials of moderate quality',
        sampleSize: 4094,
        primaryEndpoint:
          'Mean change in pain intensity on an 11-point numerical rating scale at 12 weeks in chronic osteoarthritis or low back pain, tapentadol extended release against placebo and against oxycodone',
        endpointMet: true,
        statisticalPValue:
          'Against placebo, mean reduction 0.56 points (95% CI 0.92 to 0.20), responder RR 1.36 (1.13 to 1.64), NNTB 16 (9 to 57). Against oxycodone, 0.24 points (95% CI 0.43 to 0.05); responder RR 1.46 (0.92 to 2.32), not significant',
        unreportedAdverseSignals:
          'All studies used last-observation-carried-forward imputation; the reviewers requested baseline-observation-carried-forward analyses and unpublished data from the manufacturer and were refused. Two of four oxycodone-controlled and one of three placebo-controlled studies reported no responder-rate data. Two studies were judged at high risk of bias. Moderate to high heterogeneity affected most efficacy and safety estimates.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT00449176 (tapentadol ER in moderate to severe chronic low back pain)',
        phase:
          'Phase 3, randomised, quadruple-masked, parallel-group, oxycodone- and placebo-controlled',
        sampleSize: 981,
        primaryEndpoint:
          'Change from baseline in average pain intensity on an 11-point numerical rating scale over the last week of the 12-week maintenance period',
        endpointMet: true,
        statisticalPValue:
          'Mean change −2.9 (SD 2.66) on tapentadol ER (n=312), −2.9 (SD 2.52) on oxycodone CR (n=323) and −2.1 (SD 2.33) on placebo (n=316); tapentadol against placebo mean difference −0.8 (95% CI −1.22 to −0.47), ANCOVA p<0.001',
        unreportedAdverseSignals:
          'The trial was powered against placebo, not against oxycodone: the posted analysis plan states the primary null hypothesis was that tapentadol ER did not differ from placebo, with 314 subjects per group giving 90% power to detect a mean difference of 0.7. No tapentadol-against-oxycodone comparison is posted, and the two active arms reported an identical mean change of −2.9. This is one of the three 12-week phase 3 studies pooled in the Cochrane review.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 0.56-point mean reduction against placebo on an 11-point pain scale at 12 weeks, NNTB 16 (95% CI 9 to 57)',
        'A 0.24-point mean reduction against oxycodone (95% CI 0.43 to 0.05), with a non-significant responder-rate difference',
        'A 50% relative reduction in discontinuation for adverse effects against oxycodone (95% CI 42% to 60%), NNTB 6',
        'A 2.7-fold increase in discontinuation for adverse effects against placebo (95% CI 2.05 to 3.52), NNTH 10',
        'US$12.52 per tablet at pharmacy acquisition cost against US$0.1974 for oxycodone',
        '591 patients entered open-label treatment in DPN-1 and 389 were randomised; 459 entered DPN-2 and 320 were randomised',
      ],
      unsupportedInferences: [
        'That noradrenaline reuptake inhibition explains the tolerability advantage — a mechanism the label calls preclinical and of unclear clinical relevance',
        'That tapentadol is a meaningfully better analgesic than oxycodone, on a pooled difference of 0.24 of a point on an 11-point scale',
        'That the randomised-withdrawal results in diabetic neuropathy estimate the benefit for an unselected patient starting the drug',
        'That the reported efficacy is robust to how dropouts were handled, when only last-observation-carried-forward analyses exist and the alternative was refused',
      ],
      whatFailedInitially: [
        'The responder-rate comparison against oxycodone, which was not statistically significant (RR 1.46, 95% CI 0.92 to 2.32)',
        'The request for baseline-observation-carried-forward analyses and unpublished data, denied by the manufacturer',
        'Responder-rate reporting in three of the seven relevant study comparisons, absent altogether',
        'The mechanism claim as a regulatory statement: exact mechanism unknown, clinical relevance unclear, animal models',
      ],
      realWorldOutcome: [
        'Approved in the United States on 20 November 2008 under NDA 022304, with the extended-release product under NDA 200533',
        'Licensed for diabetic peripheral neuropathic pain on two enriched-enrolment randomised-withdrawal trials',
        'Schedule II controlled substance, carrying the full opioid boxed warning set including addiction, respiratory depression and the opioid analgesic REMS',
        'About sixty-three times the pharmacy acquisition cost of oxycodone per tablet, for a measured tolerability advantage and a negligible analgesic one',
      ],
    },
    deliverySystem: {
      type: 'Oral immediate-release tablets and oral solution, and oral extended-release tablets. Schedule II controlled substance in the United States.',
      description:
        'The immediate-release tablet is dosed several times a day for acute pain and is licensed down to age 6 at a body weight of at least 40 kg; the extended-release tablet is twice daily and is the form studied in the chronic pain and diabetic neuropathy programmes. Tapentadol is not a prodrug and does not require CYP2D6 activation, so the metaboliser variability that dominates codeine and tramadol does not apply; clearance is chiefly by glucuronidation.',
      safetyProfile:
        'Class boxed warnings for addiction, abuse and misuse; life-threatening respiratory depression; accidental ingestion; neonatal opioid withdrawal syndrome; risks from concomitant benzodiazepines, other CNS depressants and alcohol; and the opioid analgesic REMS. Because of the noradrenergic mechanism, monoamine oxidase inhibitors are contraindicated and serotonin syndrome is a warning when combined with serotonergic drugs — a class of interaction that does not apply to morphine or oxycodone. Against placebo the drug carries a 2.7-fold higher risk of discontinuation for adverse effects; against oxycodone, about half.',
    },
    commonQuestions: [
      {
        q: 'Is tapentadol better than oxycodone?',
        a: 'On pain, by an amount too small to feel. On side effects, yes, and measurably. The Cochrane review pooled four trials in 4,094 patients: tapentadol reduced pain by 0.24 of a point more than oxycodone on an 11-point scale, and the responder-rate difference was not statistically significant. But half as many patients discontinued tapentadol for adverse effects — a 50% relative reduction with a number-needed-to-treat of 6 over 12 weeks. So the honest summary is that it is an equally effective opioid that more people can keep taking, at about sixty-three times the acquisition cost per tablet.',
        auditNote:
          'A statistically significant difference of 0.24 on a scale of 10 is a real measurement and a clinically invisible one. Both statements are true and the second is the one a patient needs.',
      },
      {
        q: 'What is the second mechanism, and does it matter?',
        a: 'The second mechanism is blocking the reuptake of noradrenaline in the spinal cord, which strengthens the descending pathway the brain uses to suppress pain — the same pathway duloxetine works on. Whether it matters clinically is genuinely unsettled, and the prescribing information says so: "The exact mechanism of action is unknown. Although the clinical relevance is unclear, preclinical studies have shown that tapentadol is a mu-opioid receptor (MOR) agonist and a norepinephrine reuptake inhibitor (NRI). Analgesia in animal models is derived from both of these properties." What has been measured is the outcome — less discontinuation than oxycodone — not the mechanism that produced it.',
        auditNote:
          'A mechanism can be true in an animal and irrelevant in a person. The trial that would separate the two possibilities has not been run.',
      },
      {
        q: 'Why was the Cochrane review unable to check the results properly?',
        a: 'Because of how missing data were handled and what the manufacturer would release. Every included trial used last-observation-carried-forward imputation, which credits someone who drops out with the improvement they had recorded when they left. The reviewers asked the manufacturer for baseline-observation-carried-forward analyses — which reset a dropout to their starting pain — and for any unpublished data. The review records that the manufacturers denied the request. It lists the impossibility of using BOCF among its explicit reasons for judging the clinical significance uncertain. Three of the relevant study comparisons also reported no responder rates at all.',
      },
      {
        q: 'Is it safer than other opioids?',
        a: 'It is better tolerated than oxycodone in the measured sense of fewer people stopping it. It is not a safer opioid in the sense that matters most: it is Schedule II and carries the full boxed warning set for addiction, abuse and misuse, life-threatening respiratory depression, fatal accidental ingestion, neonatal opioid withdrawal syndrome, and lethal interaction with benzodiazepines and other central nervous system depressants. It also adds a hazard the older opioids do not have — monoamine oxidase inhibitors are contraindicated and serotonin syndrome is a warning with serotonergic drugs — which is the direct cost of the second mechanism it is sold on.',
      },
      {
        q: 'It is licensed for diabetic nerve pain. How strong is that evidence?',
        a: 'Two trials, both using a design that decides who is in them after the drug has already been given. Everyone took open-label tapentadol ER for three weeks; only those who tolerated it and improved by at least one point on the pain scale were randomised to continue or to switch to placebo. In Study DPN-1, 591 entered and 389 were randomised, with 34% discontinuing during the open phase; in DPN-2, 459 entered and 320 were randomised. Both then showed a significant advantage over placebo across 12 weeks. That result is real and it answers the question "does stopping it hurt?" A patient with diabetic neuropathy considering starting it is asking a different question, and roughly a third of the people in DPN-1 never reached the part of the trial that would answer it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Santos J, Alarcão J, Fareleira F, Vaz-Carneiro A, Costa J. Tapentadol for chronic musculoskeletal pain in adults. Cochrane Database Syst Rev 2015;(5):CD009923',
        identifier: '10.1002/14651858.CD009923.pub2',
        kind: 'doi',
      },
      {
        label:
          'NUCYNTA (tapentadol) tablets United States prescribing information — Indications 1, boxed warning, Clinical Pharmacology 12.1 Mechanism of Action (NDA 022304)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022304',
        kind: 'regulatory',
      },
      {
        label:
          'NUCYNTA ER (tapentadol extended-release tablets) United States prescribing information — Indications 1 and Clinical Studies 14.3, including the enrolment and randomisation counts for Studies DPN-1 and DPN-2 (NDA 200533)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=200533',
        kind: 'regulatory',
      },
      {
        label:
          'A Study to Evaluate the Effectiveness and Safety of Tapentadol (CG5503) Extended Release in Patients With Moderate to Severe Chronic Low Back Pain — ClinicalTrials.gov NCT00449176, 981 participants',
        identifier: 'NCT00449176',
        kind: 'nct',
      },
      {
        label:
          'Tapentadol (CG5503) in knee osteoarthritis — ClinicalTrials.gov NCT00421928, 1,030 participants',
        identifier: 'NCT00421928',
        kind: 'nct',
      },
      {
        label:
          'CG5503 prolonged release in moderate to severe chronic pain due to knee osteoarthritis — ClinicalTrials.gov NCT00486811, 990 participants',
        identifier: 'NCT00486811',
        kind: 'nct',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — tapentadol, 8 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 9838022 — tapentadol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9838022',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Oxymorphone — the only opioid the FDA has ever asked to be removed from sale because of the
  //    public health consequences of abusing it, after a reformulation moved abuse into the vein.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'oxymorphone',
    name: 'Oxymorphone',
    tradeName: 'Opana / Opana ER / Numorphan',
    sponsor:
      'Endo Pharmaceuticals (holder on the enriched record); every OPANA and OPANA ER application in Drugs@FDA — NDA 011707, NDA 021610, NDA 021611 and NDA 201655 — is now listed as discontinued, and FDA withdrew approval of NDA 201655 at Endo’s request in December 2020',
    targetGene: 'OPRM1',
    targetProtein:
      'Mu-opioid receptor, as a full agonist; oxymorphone is also the active metabolite that CYP2D6 makes out of oxycodone',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1959,
    indication:
      'Management of severe and persistent pain that requires an opioid analgesic and that cannot be adequately treated with alternative options, including immediate-release opioids. Generic immediate-release and extended-release oxymorphone products remain available; the branded Opana and Opana ER products are discontinued.',
    patientFriendlyIndication:
      'Severe long-term pain needing an opioid, when other options are inadequate',
    anatomicalSite:
      'Mu-opioid receptors of the spinal dorsal horn and brainstem — the same receptor oxycodone reaches partly by being converted into this molecule',
    conditionContext: {
      conditionExplainer:
        'Oxymorphone sits at an odd place in the class: it is a drug in its own right and it is also what the liver turns a fraction of oxycodone into. Its history is the clearest case study available of what happens when a formulation is made harder to abuse one way without asking what people will do instead.',
      whyItMatters:
        'In 2012 the extended-release tablet was reformulated to resist crushing. Abuse did not stop; it moved from the nose to the vein. An HIV outbreak followed in a small Indiana county, 181 people were infected, and in June 2017 the FDA asked Endo to take the product off the market — the first time it had ever requested removal of a marketed opioid because of the public health consequences of its abuse.',
      whoTakesThis:
        'Adults with severe persistent pain, now on generic products. The branded Opana line no longer exists.',
      clinicalGoals:
        'Pain relief. The audit question on this page is not whether it relieves pain — it does, like every full mu agonist — but what its formulation history demonstrates about abuse-deterrent design.',
    },
    oneSentenceVerdict:
      'A full mu-opioid agonist and the active metabolite of oxycodone, whose 2012 crush-resistant reformulation shifted abuse from the nasal route to injection, was linked to an HIV outbreak in which 181 people were infected and 87.8% reported injecting extended-release oxymorphone, and which on 8 June 2017 became the first marketed opioid the FDA ever asked a manufacturer to withdraw because of the public health consequences of its abuse — after an advisory committee voted 18 to 8 that its benefits no longer outweighed its risks.',
    laymanHowItWorks:
      'Oxymorphone binds the mu-opioid receptor and turns it fully on, the same way morphine does, at a lower milligram dose. It is also what your liver makes out of part of an oxycodone tablet, so anyone taking oxycodone is producing a little of this molecule already. It is poorly absorbed by mouth, which is why the tablets carry more milligrams than a comparable morphine tablet — and that gap between what is in the tablet and what reaches the bloodstream by mouth is precisely what made the extended-release version attractive to inject.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 47,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.22 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 5 listed generic products, survey effective 27 August 2025)',
      markupEstimate: '',
      openPatentNotes:
        'Oxymorphone was first marketed as Numorphan and the molecule has long been out of patent. The commercial value lay in formulation: NDA 021610 for the original Opana ER, and NDA 201655 for the 2012 crush-resistant reformulation. In August 2012 Endo petitioned the FDA to declare that the original Opana ER had been discontinued for reasons of safety, which would have blocked generic copies of it; in June 2013 the FDA determined that it had not been withdrawn for reasons of safety or effectiveness and that generics could continue to be approved. The reformulation that Endo had argued was the safer product was removed from the market four years later.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'There is no trial showing oxymorphone relieves pain better than any other full mu agonist, and there is a specific regulatory record showing its extended-release formulation caused harm the alternatives did not. Where a long-acting oral opioid is needed, morphine and oxycodone have the larger evidence base, lower price and no equivalent withdrawal history. Where the pain is neuropathic, a non-opioid reaches the descending pathway without any of this.',
      conventionalRx: [
        {
          name: 'Morphine, extended release',
          class: 'Full mu-opioid agonist',
          howItCompares:
            'The reference long-acting oral opioid, on the WHO Model List of Essential Medicines, with the largest randomised literature of the class and no formulation withdrawal history. There is no head-to-head trial showing oxymorphone relieves pain better.',
          typicalCost:
            'US$0.4096 per millilitre of oral solution at United States pharmacy acquisition cost (CMS NADAC, median across 75 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheapest, best documented, universally available. Cons: the renally cleared active metabolite morphine-6-glucuronide accumulates in kidney impairment, where oxymorphone does not have an equivalent problem.',
        },
        {
          name: 'Oxycodone, extended release',
          class: 'Full mu-opioid agonist',
          howItCompares:
            'Pharmacologically adjacent — a fraction of every oxycodone dose is converted by CYP2D6 into oxymorphone itself. Its own abuse-deterrent reformulation has its own audit trail, but it was not withdrawn, and its label carries the abuse-deterrence studies rather than a removal request.',
          typicalCost:
            'US$0.1974 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 193 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: about a sixth of the price, far larger evidence base, still marketed. Cons: the same class risks, a boxed CYP3A4 interaction warning, and an abuse-deterrent claim that its own label limits to the intranasal and injection routes.',
        },
        {
          name: 'Duloxetine or gabapentinoids, where the pain is neuropathic',
          class: 'Serotonin-noradrenaline reuptake inhibitor, or alpha-2-delta ligand',
          howItCompares:
            'Not an opioid substitute in cancer or post-surgical pain, and often the right answer in the chronic non-cancer pain for which extended-release oxymorphone was mostly prescribed. No dependence, no respiratory depression, no injection value.',
          typicalCost:
            'US$0.1293 per duloxetine capsule at United States pharmacy acquisition cost (CMS NADAC, median across 74 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no controlled-substance status, no diversion, no overdose respiratory risk. Cons: slow onset, modest effect sizes of their own, and their own adverse effects.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Never inject a tablet, whatever it is made of',
          action: 'Understand that a crush-resistant tablet is not an injection-proof one.',
          patientImpact:
            'The whole Opana ER story is what happened when people who had been snorting a tablet could no longer snort it. Injection of the reformulated product was associated with an outbreak of HIV and hepatitis C and with cases of thrombotic microangiopathy, a blood disorder in which small vessels clot.',
          clinicalPrecaution:
            'In the Indiana outbreak, 181 people were diagnosed with HIV, 87.8% reported having injected extended-release oxymorphone and 92.3% were coinfected with hepatitis C.',
        },
        {
          name: 'Take it on an empty stomach, and know why',
          action: 'Follow the timing instruction relative to food exactly.',
          patientImpact:
            'Oral absorption of oxymorphone is low and food raises it substantially, which is why the timing instruction exists and why it is not a matter of preference.',
          clinicalPrecaution:
            'A drug whose bioavailability changes several-fold with a meal is a drug whose effective dose changes with breakfast.',
        },
        {
          name: 'Alcohol is not neutral with any extended-release opioid',
          action: 'Do not drink alcohol with a modified-release opioid tablet.',
          patientImpact:
            'The class boxed warning states that concomitant use of opioids with alcohol or other central nervous system depressants may result in profound sedation, respiratory depression, coma and death.',
          clinicalPrecaution:
            'Separately, the hydromorphone product Palladone established that alcohol can defeat a modified-release matrix outright, which is why alcohol dose-dumping testing became a standard requirement for these formulations.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1CC[C@]23[C@@H]4C(=O)CC[C@]2([C@H]1CC5=C3C(=C(C=C5)O)O4)O',
      chemicalFormula: 'C17H19NO4',
      molecularWeight: '301.34 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'Oxycodone with the 3-methyl ether removed — which is exactly the transformation CYP2D6 performs, making oxymorphone both a marketed drug and an active metabolite of another marketed drug. Full mu-opioid agonist with higher receptor affinity than oxycodone. Oral bioavailability is low and rises substantially with food; clearance is chiefly by glucuronidation, with no dependence on CYP2D6 or CYP3A4 activation, so it lacks the interaction profile that puts a boxed warning on oxycodone.',
      structureSource: {
        label:
          'PubChem CID 5284604 (oxymorphone) — canonical SMILES, molecular formula and weight, as carried on the enriched record and machine-verified by the RNAwiki structure engine',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284604',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'oxm-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identify the thebaine or oripavine feedstock and its residual alkaloids',
          description:
            'Oxymorphone is made from thebaine or from oripavine, both poppy alkaloids. As with oxycodone, the intermediate 14-hydroxymorphinone is a genotoxic alpha,beta-unsaturated ketone with a specified limit in the finished substance, so establishing the input is the first step in controlling it.',
          reagentsAndBuffer:
            'Thebaine and oripavine reference standards, reversed-phase HPLC with diode-array detection, LC-MS/MS for trace alkaloid profiling, Karl Fischer titration',
        },
        {
          id: 'oxm-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Oxidise to 14-hydroxymorphinone, then reduce the 7,8-double bond',
          description:
            'Peracid oxidation gives 14-hydroxymorphinone and catalytic hydrogenation of the 7,8-alkene gives oxymorphone. The route mirrors the oxycodone synthesis one demethylation earlier, and the same genotoxic intermediate has to be driven essentially to zero.',
          dependsOnStepId: 'oxm-w1',
          reagentsAndBuffer:
            'Peracetic or m-chloroperbenzoic acid in acetic acid, palladium on carbon under hydrogen, controlled temperature and pressure, in-process HPLC monitoring of residual 14-hydroxymorphinone',
        },
        {
          id: 'oxm-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the hydrochloride and release against the morphinone limit',
          description:
            'Form and recrystallise oxymorphone hydrochloride, releasing against a specified limit for 14-hydroxymorphinone. As with oxycodone, the difference between a compliant and a rejected batch is a few parts per million of a single impurity.',
          dependsOnStepId: 'oxm-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol or ethanol, activated carbon treatment, recrystallisation from aqueous ethanol, HPLC release assay with a validated impurity method',
        },
        {
          id: 'oxm-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Characterise it as a metabolite as well as a drug',
          description:
            'Oxymorphone is what CYP2D6 makes from oxycodone, so any receptor experiment on oxycodone that omits it describes an incomplete pharmacology. Running the two as separate test articles and then modelling their combined occupancy at clinical concentrations is the only way to say what an oxycodone dose actually delivers.',
          dependsOnStepId: 'oxm-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human OPRM1, [35S]GTPgammaS binding, DAMGO reference agonist, naloxone control, recombinant CYP2D6 microsomes with oxycodone as substrate, LC-MS/MS quantification of both species',
        },
        {
          id: 'oxm-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Test the abuse-deterrent matrix against every route, including the vein',
          description:
            'This is the step whose absence defines this molecule’s history. A matrix evaluated only for resistance to crushing and snorting can pass while becoming easier to prepare for injection, because a gel that resists a grinder may still be drawn into a syringe after heating. The assay has to include syringeability and injectability after realistic preparation, not only hardness and particle size.',
          dependsOnStepId: 'oxm-w4',
          reagentsAndBuffer:
            'Household and laboratory grinding tools, aqueous and organic solvent extraction panels including heated preparation, syringeability testing through 21- to 29-gauge needles with and without filtration, viscosity measurement of the resulting gel, HPLC quantification of extracted oxymorphone by route',
        },
      ],
    },
    keyAudits: [
      {
        id: 'oxm-a1',
        category: 'conclusion_shift',
        title: 'The first opioid the FDA ever asked to have taken off the market for abuse',
        laymanSummary:
          'On 8 June 2017 the FDA asked Endo to withdraw reformulated Opana ER. It was the first time the agency had ever requested removal of a marketed opioid painkiller because of the public health consequences of abusing it. Endo withdrew it the following month.',
        technicalDetails:
          'The FDA’s stated basis was a review of all available postmarketing data showing a significant shift in the route of abuse of Opana ER from nasal to injection following the product’s 2012 reformulation, and that injection abuse of the reformulated product had been associated with a serious outbreak of HIV and hepatitis C and with cases of thrombotic microangiopathy. In March 2017 a joint meeting of the Drug Safety and Risk Management Advisory Committee and the Anesthetic and Analgesic Drug Products Advisory Committee had voted 18 to 8, with one abstention, that the benefits of reformulated Opana ER no longer outweighed its risks; several members said afterwards that they would have preferred additional restrictions to outright removal. Endo announced voluntary withdrawal on 6 July 2017. FDA formally withdrew approval of NDA 201655 at Endo’s request, published at 85 FR 83972 on 23 December 2020, Endo having waived its opportunity for a hearing. Every OPANA and OPANA ER application in Drugs@FDA is now listed as discontinued. The finding this establishes is not about oxymorphone the molecule. It is that an abuse-deterrent formulation can pass its regulatory tests and still make the population outcome worse, by moving abuse to a more dangerous route rather than reducing it.',
        evidenceSource:
          'FDA request for removal of reformulated Opana ER, 8 June 2017; joint advisory committee vote of 18-8 with one abstention, March 2017 (meeting announced at 82 FR 3333, 11 January 2017); Endo Pharmaceuticals, Inc.; Withdrawal of Approval of a New Drug Application for OPANA (Oxymorphone Hydrochloride) Extended-Release Tablets, 85 FR 83972, 23 December 2020',
        inferredClaim:
          'That making a tablet harder to crush reduces its abuse — the reformulation achieved the physical property and shifted the route of abuse into the vein, which is the outcome the FDA acted on',
        auditFlag: 'retracted',
      },
      {
        id: 'oxm-a2',
        category: 'failed',
        title: 'One hundred and eighty-one HIV infections in one small county',
        laymanSummary:
          'A rural Indiana county of a few thousand people had 181 new HIV diagnoses in a year. Nearly nine in ten of those infected reported injecting extended-release oxymorphone, and more than nine in ten also had hepatitis C. The state declared a public health emergency.',
        technicalDetails:
          'Peters and colleagues investigated an outbreak in Scott County, Indiana. From 18 November 2014 to 1 November 2015, HIV infection was diagnosed in 181 case patients; 87.8% reported having injected the extended-release formulation of the prescription opioid oxymorphone, and 92.3% were coinfected with hepatitis C virus. Among 159 patients with an HIV-1 pol gene sequence, 157 (98.7%) had highly related sequences on phylogenetic analysis, establishing a single transmission network rather than coincident infections. Contact tracing identified 536 named contacts, of whom 468 (87.3%) were located, assessed, tested and linked to care; the number of times a contact was named as a syringe-sharing partner was significantly associated with HIV risk (adjusted risk ratio per naming 1.9, p<0.001). A public health emergency was declared on 26 March 2015 and Indiana established a syringe-service programme for the first time. The phylogenetic result is what makes this evidence rather than association: 157 of 159 sequences from one network, in a population injecting one reformulated product.',
        evidenceSource:
          'Peters PJ, Pontones P, Hoover KW, et al. HIV Infection Linked to Injection Use of Oxymorphone in Indiana, 2014-2015. N Engl J Med 2016;375(3):229-239',
        doi: '10.1056/NEJMoa1515195',
        measuredMetric:
          'HIV diagnoses in the outbreak and the proportion reporting injection of extended-release oxymorphone',
        auditFlag: 'verified',
      },
      {
        id: 'oxm-a3',
        category: 'conclusion_shift',
        title: 'The manufacturer argued its old formulation was unsafe. The FDA disagreed.',
        laymanSummary:
          'In 2012 Endo asked the FDA to rule that the original Opana ER had been discontinued for safety reasons, which would have blocked generic copies. In 2013 the FDA ruled it had not, and that generics could go on being approved. The reformulation Endo said was safer was pulled four years later.',
        technicalDetails:
          'Endo submitted a citizen petition dated 10 August 2012 (Docket No. FDA-2012-P-0895) requesting that the agency determine that OPANA ER products approved under NDA 21-610 had been discontinued for reasons of safety, refuse to approve any pending abbreviated new drug application for a generic version, and suspend and withdraw the approval of any ANDA referencing it. The FDA published its determination at 78 FR 38053 on 25 June 2013: after considering the petition and reviewing agency records, FDA determined under 21 CFR 314.161 that the original OPANA ER was not withdrawn for reasons of safety or effectiveness, that the product would continue to be listed in the Discontinued Drug Product List section of the Orange Book — which covers products discontinued for reasons other than safety or effectiveness — that FDA would not begin procedures to withdraw approval of referencing ANDAs, and that additional ANDAs could be approved. The sequence is what makes this an audit point rather than a regulatory footnote: the safety argument was made about the older formulation in a context where it also blocked competition, the agency rejected it, and the newer formulation was the one that was ultimately removed for a safety consequence nobody had predicted.',
        evidenceSource:
          'Determination That OPANA ER (Oxymorphone Hydrochloride) Drug Products Covered by New Drug Application 21-610 Were Not Withdrawn From Sale for Reasons of Safety or Effectiveness. 78 FR 38053, 25 June 2013 (responding to citizen petition Docket No. FDA-2012-P-0895)',
        inferredClaim:
          'That the original Opana ER was discontinued for reasons of safety — asserted in a citizen petition that would have blocked generic entry, and rejected by the FDA on the record',
        auditFlag: 'contested',
      },
      {
        id: 'oxm-a4',
        category: 'inferred',
        title: 'It is not only a drug; it is what a fraction of every oxycodone dose becomes',
        laymanSummary:
          'Oxymorphone is oxycodone with one chemical group removed — and that removal is exactly what the liver enzyme CYP2D6 does. Anyone taking oxycodone is making some of this molecule.',
        technicalDetails:
          'Oxymorphone differs from oxycodone by the absence of the 3-methyl ether, and O-demethylation by CYP2D6 is the reaction that converts one into the other in the body. Oxymorphone has substantially higher mu-opioid receptor affinity than its parent. Two consequences follow that are routinely elided. First, any account of oxycodone pharmacology that treats the parent as the sole active species is incomplete, and the size of the metabolite contribution varies with inherited CYP2D6 activity and with any CYP2D6 inhibitor the patient is taking. Second, oxymorphone given directly does not require that conversion and therefore does not carry the CYP2D6 or CYP3A4 dependency that puts a boxed interaction warning on oxycodone — a genuine pharmacological difference between the two, and one that is about predictability rather than about potency or efficacy. No trial has shown that oxymorphone relieves pain better than oxycodone or morphine.',
        evidenceSource:
          'OXYCONTIN United States prescribing information, boxed warning and Clinical Pharmacology 12.3, for the CYP2D6 conversion of oxycodone to oxymorphone (NDA 022272)',
        inferredClaim:
          'That oxymorphone’s higher receptor affinity makes it a better analgesic than its parent drug — no head-to-head trial supports this, and the difference that is documented is metabolic predictability rather than efficacy',
        auditFlag: 'caution',
      },
      {
        id: 'oxm-a5',
        category: 'failed',
        title: 'Every branded application is discontinued',
        laymanSummary:
          'Opana, Opana ER, the reformulated Opana ER and the original Numorphan-era application are all listed as discontinued. The FDA formally withdrew approval of the reformulated product in December 2020.',
        technicalDetails:
          'Drugs@FDA lists NDA 011707 (OPANA), NDA 021610 (OPANA ER), NDA 021611 (OPANA) and NDA 201655 (reformulated OPANA ER) as discontinued. FDA published the formal withdrawal of approval for NDA 201655 at 85 FR 83972 on 23 December 2020, recording that Endo requested the withdrawal and waived its opportunity for a hearing. Generic oxymorphone products remain marketed, which is the reason this record is not classified as a withdrawn drug: the molecule is still available and still prescribed, and what was removed was one company’s formulation portfolio. The distinction matters for a reader who finds an oxymorphone prescription in their hand and reads about a withdrawal.',
        evidenceSource:
          'FDA Drugs@FDA records for NDA 011707, NDA 021610, NDA 021611 and NDA 201655, all listed as discontinued; Endo Pharmaceuticals, Inc.; Withdrawal of Approval of a New Drug Application for OPANA (Oxymorphone Hydrochloride) Extended-Release Tablets, 85 FR 83972, 23 December 2020',
        measuredMetric:
          'Marketing status of every branded oxymorphone application in Drugs@FDA: discontinued',
        auditFlag: 'verified',
      },
      {
        id: 'oxm-a6',
        category: 'inferred',
        title: 'Abuse-deterrent testing measured the routes it thought of',
        laymanSummary:
          'The standard package for an abuse-deterrent claim tests how hard a tablet is to crush, dissolve and snort. Nothing in it asks what people will do when snorting stops working.',
        technicalDetails:
          'Abuse-deterrent formulation assessment rests on in vitro manipulation and extraction studies plus, where available, human abuse-potential studies conducted by a specified route — typically intranasal or oral. Those studies measure tablet properties and drug-liking scores. They do not measure population-level abuse behaviour, and they cannot detect substitution between routes, because the design fixes the route in advance. The Opana ER sequence is the counterexample that establishes the limit: the reformulation achieved the physical property it was designed for, and the FDA’s stated basis for requesting removal in June 2017 was a significant shift in the route of abuse from nasal to injection following the reformulation, with the injection route carrying the HIV, hepatitis C and thrombotic microangiopathy consequences. The general inference — that a formulation property demonstrated in vitro and in a drug-liking study translates into less harm in a population — is the one this record refutes, and it is the same inference the oxycodone page audits from the other direction.',
        evidenceSource:
          'FDA request for removal of reformulated Opana ER, 8 June 2017, and its stated basis in postmarketing data showing a shift in route of abuse from nasal to injection; OXYCONTIN United States prescribing information, section 9.2, for the structure of a labelled abuse-deterrence package (NDA 022272)',
        inferredClaim:
          'That abuse-deterrent formulation testing predicts population-level harm reduction — the testing measures tablet properties and drug liking by a fixed route, and cannot see substitution to a different and more dangerous route',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A tablet with more milligrams than it seems to need',
        laymanDesc:
          'Oxymorphone is poorly absorbed from the gut, so an oral tablet has to carry a lot of drug for a modest amount to reach the blood. That surplus is what made the extended-release tablet valuable to anyone bypassing the gut.',
        molecularDetail:
          'Low oral bioavailability with substantial food effect, so oral tablet strengths are high relative to the systemic exposure achieved. The 2012 reformulation of Opana ER used a crush-resistant matrix intended to prevent nasal and injection abuse of that content.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'No liver enzyme has to switch it on',
        laymanDesc:
          'Unlike codeine, tramadol or oxycodone, oxymorphone does not need converting into anything. What you swallow is what acts.',
        molecularDetail:
          'Cleared chiefly by glucuronidation, with no dependence on CYP2D6 or CYP3A4 activation. This is the same transformation in reverse: oxymorphone is the product CYP2D6 makes when it O-demethylates oxycodone.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Full agonism, at higher affinity than its parent',
        laymanDesc:
          'It binds the mu-opioid receptor more tightly than oxycodone does and turns it fully on.',
        molecularDetail:
          'Full agonism at the Gi/o-coupled mu-opioid receptor: adenylyl cyclase inhibition, GIRK channel opening, N-type calcium channel closure. Higher receptor affinity than oxycodone, which is a potency statement rather than an efficacy one.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The reformulation that changed the route, not the behaviour',
        laymanDesc:
          'In 2012 the tablet was made crush-resistant. People who had been snorting it began injecting it instead.',
        molecularDetail:
          'FDA’s stated basis for the June 2017 removal request was a review of all available postmarketing data demonstrating a significant shift in the route of abuse of Opana ER from nasal to injection following the product’s reformulation.',
        iconName: 'Repeat',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'What injection did in one county',
        laymanDesc:
          'A hundred and eighty-one people in rural Indiana were diagnosed with HIV in a single year. Almost nine in ten reported injecting extended-release oxymorphone.',
        molecularDetail:
          '181 diagnosed cases from 18 November 2014 to 1 November 2015; 87.8% reported injecting extended-release oxymorphone; 92.3% coinfected with hepatitis C; 157 of 159 sequenced HIV-1 pol genes (98.7%) highly related on phylogenetic analysis. Public health emergency declared 26 March 2015.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And what the regulator did about it',
        laymanDesc:
          'An advisory committee voted 18 to 8 that the benefits no longer outweighed the risks. The FDA asked for the product to be removed — the first such request for a marketed opioid. Every branded application is now discontinued.',
        molecularDetail:
          'Joint advisory committee vote 18-8 with one abstention, March 2017; FDA removal request 8 June 2017; Endo voluntary withdrawal announced 6 July 2017; formal withdrawal of approval of NDA 201655 published at 85 FR 83972 on 23 December 2020.',
        iconName: 'Gavel',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Peters et al., N Engl J Med 2016;375:229-239 — Indiana HIV outbreak investigation',
        phase: 'Field epidemiological outbreak investigation with HIV-1 pol phylogenetic analysis',
        sampleSize: 181,
        primaryEndpoint:
          'Identification of the extent and cause of an HIV outbreak in Scott County, Indiana, and the risk factors associated with infection',
        endpointMet: true,
        statisticalPValue:
          '87.8% of 181 diagnosed cases reported injecting extended-release oxymorphone; 92.3% coinfected with hepatitis C; 157 of 159 sequenced HIV-1 pol genes (98.7%) highly related; adjusted risk ratio 1.9 per naming as a syringe-sharing partner, p<0.001',
        unreportedAdverseSignals:
          'This is an outbreak investigation, not a randomised trial: it establishes a transmission network and a shared exposure, not a counterfactual. What makes the attribution unusually strong is the phylogenetic result — 157 of 159 sequences from a single closely related cluster — in a population overwhelmingly reporting one specific reformulated product.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Joint Drug Safety and Risk Management / Anesthetic and Analgesic Drug Products Advisory Committee vote on reformulated Opana ER, March 2017',
        phase: 'Regulatory advisory committee vote (meeting announced at 82 FR 3333)',
        sampleSize: 27,
        primaryEndpoint:
          'Whether the benefits of reformulated Opana ER continue to outweigh its risks in light of postmarketing abuse data',
        endpointMet: false,
        statisticalPValue:
          'Vote 18 to 8 against, with one abstention, that the benefits no longer outweigh the risks',
        unreportedAdverseSignals:
          'Several committee members stated a preference for keeping the product on the market with additional regulatory restrictions rather than removing it, so the vote records a benefit-risk judgement rather than unanimity on the remedy. This row is a regulatory vote rather than a clinical trial, and is included because it is the measurement that most directly captured expert judgement on this product before its withdrawal.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '181 HIV diagnoses in Scott County, Indiana between 18 November 2014 and 1 November 2015',
        '87.8% of those cases reported injecting extended-release oxymorphone and 92.3% were coinfected with hepatitis C',
        '157 of 159 sequenced HIV-1 pol genes (98.7%) highly related on phylogenetic analysis',
        'Advisory committee vote of 18 to 8 with one abstention that benefits no longer outweighed risks',
        'FDA determination at 78 FR 38053 that original Opana ER was not withdrawn for reasons of safety or effectiveness',
      ],
      unsupportedInferences: [
        'That a crush-resistant matrix reduces abuse, when the documented effect was a shift in route from nasal to injection',
        'That abuse-deterrent testing predicts population harm, when it measures tablet properties and drug liking by a route fixed in advance',
        'That the original Opana ER had been discontinued for reasons of safety, as asserted in a citizen petition and rejected by FDA',
        'That higher mu-receptor affinity than oxycodone makes oxymorphone a better analgesic, which no head-to-head trial has shown',
      ],
      whatFailedInitially: [
        'The 2012 abuse-deterrent reformulation, whose stated purpose was achieved and whose population effect was to move abuse into the vein',
        'Endo’s August 2012 citizen petition to have the original formulation declared unsafe, rejected by FDA in June 2013',
        'The product itself: removal requested 8 June 2017, voluntary withdrawal announced 6 July 2017, approval formally withdrawn 23 December 2020',
        'Every branded oxymorphone application in Drugs@FDA, all now listed as discontinued',
      ],
      realWorldOutcome: [
        'The first marketed opioid analgesic the FDA has ever asked a manufacturer to remove because of the public health consequences of abuse',
        'A public health emergency declared in Indiana on 26 March 2015 and the state’s first syringe-service programme established in response',
        'Generic oxymorphone remains marketed and prescribed at about US$1.22 per tablet at pharmacy acquisition cost',
        'The clearest available demonstration that an abuse-deterrent formulation can pass its tests and still worsen the outcome it was built to improve',
      ],
    },
    deliverySystem: {
      type: 'Oral immediate-release tablets and oral extended-release tablets; the injectable and the branded Opana line are discontinued. Schedule II controlled substance in the United States.',
      description:
        'Oral bioavailability is low and rises substantially with food, which is why the timing instruction relative to meals is part of the product rather than a convenience. The extended-release tablet was reformulated in 2012 with a crush-resistant matrix under NDA 201655; that formulation was removed from the market in 2017 and its approval withdrawn in 2020. Generic immediate-release and extended-release oxymorphone products remain available.',
      safetyProfile:
        'Class boxed warnings for addiction, abuse and misuse; life-threatening respiratory depression; accidental ingestion; neonatal opioid withdrawal syndrome; interaction with benzodiazepines, other CNS depressants and alcohol; and the opioid analgesic REMS. Beyond the class risks, the specific documented hazards of this product’s history are injection-route abuse of the reformulated extended-release tablet, associated with an HIV and hepatitis C outbreak and with cases of thrombotic microangiopathy — a clotting disorder of small blood vessels — which together formed the FDA’s stated basis for requesting its removal.',
    },
    commonQuestions: [
      {
        q: 'Was oxymorphone banned?',
        a: 'One formulation was. On 8 June 2017 the FDA asked Endo Pharmaceuticals to remove reformulated Opana ER from the market — the first time the agency had ever requested the removal of a marketed opioid painkiller because of the public health consequences of its abuse. Endo announced voluntary withdrawal on 6 July 2017, and FDA formally withdrew approval of NDA 201655 in December 2020. The molecule itself was not banned: generic immediate-release and extended-release oxymorphone products remain marketed and prescribed. What ended was a specific product line, and every branded Opana application is now listed as discontinued in Drugs@FDA.',
        auditNote:
          'A withdrawn brand and a withdrawn molecule are different events. Conflating them misleads in both directions — it exaggerates the regulatory action and it hides that the drug is still in circulation.',
      },
      {
        q: 'What actually happened in Indiana?',
        a: 'Between November 2014 and November 2015, 181 people in Scott County, a rural Indiana county, were diagnosed with HIV. Of those, 87.8% reported having injected extended-release oxymorphone, and 92.3% also had hepatitis C. Genetic sequencing of the virus from 159 of them found that 157 — 98.7% — carried closely related strains, meaning a single transmission network rather than separate infections. The state declared a public health emergency on 26 March 2015 and established Indiana’s first syringe-service programme. The FDA cited this outbreak, along with cases of a blood-clotting disorder called thrombotic microangiopathy, as part of its basis for requesting the product’s removal.',
      },
      {
        q: 'Did the abuse-deterrent reformulation make things worse?',
        a: 'That is the FDA’s stated finding, in effect. The agency’s basis for the removal request was a review of all available postmarketing data demonstrating a significant shift in the route of abuse of Opana ER from nasal to injection following the reformulation — and injection is the route that transmits HIV and hepatitis C. The reformulation did what it was designed to do at the level of the tablet. What no part of the abuse-deterrent testing package can measure is what people do instead when one route is closed, because those studies fix the route of administration in advance and measure drug liking and tablet properties, not population behaviour.',
        auditNote:
          'This is the strongest available counterexample to the inference that abuse-deterrent labelling predicts reduced harm. It is on the oxycodone page from the other direction, where the label itself says abuse by all routes is still possible.',
      },
      {
        q: 'How is it different from oxycodone?',
        a: 'Chemically, by one methyl group — and that is exactly the group the liver enzyme CYP2D6 removes, which means oxymorphone is both a drug and the active metabolite of oxycodone. Practically, oxymorphone binds the receptor more tightly, is poorly absorbed by mouth with a large food effect, and does not depend on CYP2D6 or CYP3A4 to become active, so it lacks the boxed cytochrome interaction warning that oxycodone carries. None of that has been shown to make it a better painkiller: there is no head-to-head trial demonstrating superior analgesia over oxycodone or morphine.',
      },
      {
        q: 'Why does the 2013 FDA ruling matter?',
        a: 'Because of what was being argued and by whom. In August 2012 Endo petitioned the FDA to determine that the original Opana ER — the version before the crush-resistant reformulation — had been discontinued for reasons of safety, and to refuse and withdraw approval of generic copies of it. A safety determination would have blocked competition. In June 2013 the FDA published its answer: the original Opana ER was not withdrawn for reasons of safety or effectiveness, it stays in the Orange Book’s Discontinued Drug Product List for products discontinued for other reasons, and generics can continue to be approved. Four years later the reformulated product — the one Endo had presented as the safer replacement — was the one the FDA asked to have removed.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Peters PJ, Pontones P, Hoover KW, et al. HIV Infection Linked to Injection Use of Oxymorphone in Indiana, 2014-2015. N Engl J Med 2016;375(3):229-239',
        identifier: '10.1056/NEJMoa1515195',
        kind: 'doi',
      },
      {
        label:
          'Endo Pharmaceuticals, Inc.; Withdrawal of Approval of a New Drug Application for OPANA (Oxymorphone Hydrochloride) Extended-Release Tablets. 85 FR 83972, 23 December 2020',
        identifier:
          'https://www.federalregister.gov/documents/2020/12/23/2020-28283/endo-pharmaceuticals-inc-withdrawal-of-approval-of-a-new-drug-application-for-opana-oxymorphone',
        kind: 'regulatory',
      },
      {
        label:
          'Determination That OPANA ER (Oxymorphone Hydrochloride) Drug Products Covered by New Drug Application 21-610 Were Not Withdrawn From Sale for Reasons of Safety or Effectiveness. 78 FR 38053, 25 June 2013, responding to citizen petition Docket No. FDA-2012-P-0895',
        identifier:
          'https://www.federalregister.gov/documents/2013/06/25/2013-15099/determination-that-opana-er-oxymorphone-hydrochloride-drug-products-covered-by-new-drug-application',
        kind: 'regulatory',
      },
      {
        label:
          'Joint Meeting of the Drug Safety and Risk Management Advisory Committee and the Anesthetic and Analgesic Drug Products Advisory Committee — meeting announcement, 82 FR 3333, 11 January 2017; the March 2017 meeting voted 18 to 8 with one abstention that the benefits of reformulated Opana ER no longer outweighed its risks',
        identifier:
          'https://www.federalregister.gov/documents/2017/01/11/2017-00463/joint-meeting-of-the-drug-safety-and-risk-management-advisory-committee-and-the-anesthetic-and',
        kind: 'regulatory',
      },
      {
        label:
          'FDA Drugs@FDA record for NDA 201655 (reformulated OPANA ER) — listed as discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=201655',
        kind: 'regulatory',
      },
      {
        label: 'FDA Drugs@FDA record for NDA 021610 (OPANA ER) — listed as discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021610',
        kind: 'regulatory',
      },
      {
        label:
          'OXYCONTIN United States prescribing information — boxed warning and Clinical Pharmacology 12.3, for the CYP2D6 conversion of oxycodone to oxymorphone, and section 9.2 for the structure of a labelled abuse-deterrence package (NDA 022272)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022272',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — oxymorphone, 5 listed generic products, effective 27 August 2025',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5284604 — oxymorphone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284604',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Naloxone — the antidote, approved for the nose on blood levels in healthy volunteers and a
  //    usability study, because randomising an overdose to placebo is not something anyone can do.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'naloxone',
    name: 'Naloxone',
    tradeName: 'Narcan / Kloxxado / Zimhi / Rivive / Rextovy',
    sponsor:
      'Adapt Pharma, now part of Emergent BioSolutions (holder on the enriched record for NARCAN nasal spray, NDA 208411); injectable naloxone is made by many manufacturers',
    targetGene: 'OPRM1',
    targetProtein:
      'Mu-opioid receptor, as a competitive antagonist; also antagonises kappa and delta receptors at higher occupancy',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1971,
    indication:
      'Emergency treatment of known or suspected opioid overdose, as manifested by respiratory and/or central nervous system depression. Intended for immediate administration as emergency therapy in settings where opioids may be present, and not a substitute for emergency medical care. Also used to reverse opioid depression after surgery.',
    patientFriendlyIndication:
      'Emergency reversal of an opioid overdose, when breathing or consciousness has been suppressed',
    anatomicalSite:
      'The mu-opioid receptor of the pre-Bötzinger complex and the brainstem respiratory centres — the site where the overdose is happening',
    conditionContext: {
      conditionExplainer:
        'An opioid overdose is not a poisoning in the usual sense. Nothing is being destroyed; a receptor is simply too occupied, and the part of the brainstem that notices rising carbon dioxide stops raising the alarm. The person does not gasp or panic. They breathe more and more slowly and then stop.',
      whyItMatters:
        'Naloxone reverses that by pushing the opioid off the receptor. It is one of very few drugs in medicine whose effect is visible within minutes and unambiguous. The audit questions on this page are not whether it works — everyone who has watched it work knows — but what evidence supports each of the products built around it, and what the price of those products has done.',
      whoTakesThis:
        'People experiencing an opioid overdose. It is carried by bystanders, families, emergency responders and, since 2023 in the United States, anyone who buys it over the counter.',
      clinicalGoals:
        'Restore breathing long enough for emergency medical care to arrive. The label is explicit that it is not a substitute for that care.',
    },
    oneSentenceVerdict:
      'A competitive mu-opioid antagonist that displaces the opioid from the receptor within minutes, whose approved nasal product was licensed on pharmacokinetic comparison to an intramuscular dose in healthy volunteers plus a usability study in which over 90% of untrained people performed both critical tasks — never on a randomised trial in an actual overdose, which could not ethically be run — and whose price history includes an auto-injector that went from US$690 in 2014 to US$4,500 for a two-pack in 2016.',
    laymanHowItWorks:
      'Naloxone is shaped almost exactly like an opioid, so it fits the same receptor. What it does not do is switch the receptor on. It simply sits in the slot and pushes whatever was there out, and it binds tightly enough to win that competition. Within a minute or two of an injection, or a few minutes of a nasal spray, the brainstem starts responding to carbon dioxide again and the person breathes. The catch is duration: naloxone wears off in under an hour and most opioids last longer, so a person can be revived and then stop breathing again once it fades. That is why every label says to call for emergency help and stay with them.',
    auditConfidence: 'High Confidence',
    confidenceScore: 84,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$6.28 per millilitre at United States pharmacy acquisition cost (CMS NADAC, median across 40 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Naloxone was patented in 1961 and approved in the United States in 1971; the molecule is long out of patent and is on the WHO Model List of Essential Medicines. Every recent patent is on a delivery device — an auto-injector, a nasal spray, a higher-concentration syringe. Gupta, Shah and Ross documented what that did to the price: the Evzio auto-injector went from US$690 in 2014 to US$4,500 for a two-pack in 2016, and Hospira’s generic injectable from US$62.29 in 2012 to US$142.49 by 2016. On 29 March 2023 the FDA approved NARCAN 4 mg nasal spray for over-the-counter sale, the first naloxone product available without a prescription in the United States.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'There is no substitute for naloxone in an overdose, and the honest comparisons are between its formulations rather than against other drugs. Intramuscular naloxone from a vial is by far the cheapest route and requires a syringe and a willing bystander; the nasal spray costs more and requires neither. The higher-dose nasal and injectable products are the ones with the weakest case: a 2024 review concluded that the vast majority of fentanyl overdoses are reversed by two standard intramuscular or intranasal doses, and recommended against high-dose formulations on cost, precipitated withdrawal and limited evidence.',
      conventionalRx: [
        {
          name: 'Standard-dose intramuscular naloxone from a vial and syringe',
          class: 'Mu-opioid receptor antagonist, parenteral',
          howItCompares:
            'The oldest and cheapest presentation. In the pharmacokinetic study that supported the nasal product, all intranasal doses from 2 to 8 mg produced higher plasma concentrations and areas under the curve than an approved 0.4 mg intramuscular dose, with no difference in time to peak — so the nasal route is not faster, it is easier.',
          typicalCost:
            'US$6.28 per millilitre at United States pharmacy acquisition cost (CMS NADAC, median across 40 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheapest per dose, long-established, easy to titrate in trained hands. Cons: requires drawing up and injecting, which is the step that keeps naloxone out of the hands of the people most likely to witness an overdose.',
        },
        {
          name: 'Standard-dose 4 mg intranasal naloxone',
          class: 'Mu-opioid receptor antagonist, intranasal',
          howItCompares:
            'The product chosen on the basis of a pharmacokinetic study and a human-factors study in which more than 90% of people representative of the general population performed both critical tasks — inserting the nozzle and pressing the plunger — without any prior training. Available over the counter in the United States since 29 March 2023.',
          typicalCost:
            'Priced above the injectable vial per dose; the CMS survey figure on this page is a per-millilitre median across all listed naloxone products and is not a per-device nasal price',
          prosAndCons:
            'Pros: no needle, no training, and now no prescription. Cons: more expensive per dose than a vial, and it is the formulation the device patents attach to.',
        },
        {
          name: 'High-dose naloxone formulations (8 mg nasal, 5 mg injection)',
          class: 'Mu-opioid receptor antagonist at multiples of the standard dose',
          howItCompares:
            'Marketed on the premise that fentanyl requires more naloxone. A 2024 literature review incorporating the experience of people who use drugs concluded that the vast majority of fentanyl overdoses can be reversed with two standard intramuscular or intranasal doses, with carfentanil the exception requiring three or more, and recommended against high-dose products as a substitute for four standard doses on grounds of higher cost, risk of precipitated withdrawal and limited evidence.',
          typicalCost:
            'Priced above the standard-dose products; no per-device CMS acquisition figure is stated here because none could be sourced for these specific presentations',
          prosAndCons:
            'Pros: fewer devices needed if the premise holds. Cons: precipitated withdrawal is not a trivial harm — it is violent, and a person who wakes into it may use again immediately, which is the outcome the higher dose was supposed to prevent.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Call emergency services first, then give it',
          action: 'Ring for an ambulance before or while administering naloxone.',
          patientImpact:
            'The label states that naloxone nasal spray is intended for immediate administration as emergency therapy in settings where opioids may be present, and that it is not a substitute for emergency medical care.',
          clinicalPrecaution:
            'Reversal is temporary. The reason to call is the next hour, not the next minute.',
        },
        {
          name: 'Stay with them; it can wear off before the opioid does',
          action: 'Do not leave someone alone after they wake up.',
          patientImpact:
            'The label warns of recurrent respiratory and central nervous system depression: the duration of action of most opioids may exceed that of naloxone, so the depression can return. It directs keeping the patient under continued surveillance and giving repeat doses with a new device as necessary while awaiting emergency assistance.',
          clinicalPrecaution:
            'This risk is largest with the longest-acting opioids — methadone, whose terminal half-life its label puts between 8 and 59 hours, and extended-release formulations.',
        },
        {
          name: 'Expect withdrawal, and expect it to be unpleasant',
          action: 'Be ready for the person to wake up sick, frightened and angry.',
          patientImpact:
            'The label warns that use in opioid-dependent patients may precipitate opioid withdrawal, and that in neonates opioid withdrawal may be life-threatening if not recognised and properly treated.',
          clinicalPrecaution:
            'Precipitated withdrawal is the main argument against giving more naloxone than is needed to restore breathing, and it is why the higher-dose products are contested rather than obviously better.',
        },
        {
          name: 'It works less well against some opioids than others',
          action: 'Give repeat doses if the first has little effect, and keep calling for help.',
          patientImpact:
            'The label warns of limited efficacy with partial agonists or mixed agonists and antagonists: reversal of respiratory depression caused by buprenorphine or pentazocine may be incomplete, and larger or repeated doses may be required.',
          clinicalPrecaution:
            'Buprenorphine binds the receptor very tightly, so a competitive antagonist has a harder job displacing it. That is a pharmacological limit rather than a product defect.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C=CCN1CC[C@]23[C@@H]4C(=O)CC[C@]2([C@H]1CC5=C3C(=C(C=C5)O)O4)O',
      chemicalFormula: 'C19H21NO4',
      molecularWeight: '327.40 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'Oxymorphone with the N-methyl group replaced by N-allyl — a single substitution that converts a full agonist into a competitive antagonist, which is the cleanest demonstration in pharmacology that occupancy and activation are separate things. Competitive antagonism at mu, with kappa and delta antagonism at higher occupancy, and no intrinsic activity of its own: naloxone given to someone who has taken no opioid does essentially nothing. Its duration of action is shorter than that of most opioids, which is the basis of the label’s recurrent-depression warning.',
      structureSource: {
        label:
          'PubChem CID 5284596 (naloxone) — canonical SMILES, molecular formula and weight, as carried on the enriched record and machine-verified by the RNAwiki structure engine',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284596',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'nal-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the oxymorphone starting material and its residual content',
          description:
            'Naloxone is made from oxymorphone by replacing the nitrogen methyl group with an allyl group. Residual oxymorphone in a naloxone batch is not merely an impurity — it is a full agonist contaminating an antagonist, which is the one impurity that could invert the product’s effect.',
          reagentsAndBuffer:
            'Oxymorphone and naloxone hydrochloride reference standards, reversed-phase HPLC with ultraviolet detection, LC-MS/MS confirmation of the allyl mass shift, Karl Fischer titration',
        },
        {
          id: 'nal-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Demethylate the nitrogen, then allylate it',
          description:
            'The nitrogen is first stripped of its methyl group — classically by cyanogen bromide or a chloroformate followed by hydrolysis — and then alkylated with allyl bromide. The N-substituent is the entire difference between a drug that stops breathing and a drug that restores it, so this is the step the product is.',
          dependsOnStepId: 'nal-w1',
          reagentsAndBuffer:
            'Oxymorphone free base, 1-chloroethyl chloroformate or equivalent N-demethylating reagent, allyl bromide with a mild base, anhydrous polar aprotic solvent, in-process HPLC for the noroxymorphone intermediate',
        },
        {
          id: 'nal-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the hydrochloride and specify residual agonist',
          description:
            'Form and recrystallise naloxone hydrochloride dihydrate, releasing against tight limits for oxymorphone and for the N-demethylated intermediate. The specification for residual agonist is the safety-critical one; the rest is ordinary process control.',
          dependsOnStepId: 'nal-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in alcohol, recrystallisation from aqueous ethanol, activated carbon, controlled-humidity drying to the dihydrate, HPLC release assay with a validated agonist impurity method',
        },
        {
          id: 'nal-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Demonstrate antagonism and the absence of intrinsic activity',
          description:
            'Two experiments, not one. The first shows naloxone shifts an agonist concentration-response curve rightward in a surmountable, competitive way. The second — the one that matters for a product given to unconscious strangers — shows it produces no receptor activation on its own at any concentration tested.',
          dependsOnStepId: 'nal-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human OPRM1, OPRK1 and OPRD1; [35S]GTPgammaS binding and cyclic AMP accumulation; DAMGO, fentanyl and buprenorphine as agonists for Schild analysis; naloxone alone across a full concentration range as the intrinsic-activity control',
        },
        {
          id: 'nal-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Bridge the device to the injection, and test the human using it',
          description:
            'No trial can randomise an overdose to placebo, so a new naloxone device is approved on two things instead: plasma concentrations compared with an approved intramuscular dose, and a study of whether untrained people can operate it. Both were done for the 4 mg nasal spray, and both should be stated as what they are — a pharmacokinetic bridge and a usability test, not an efficacy trial.',
          dependsOnStepId: 'nal-w4',
          reagentsAndBuffer:
            'Crossover pharmacokinetic study in healthy volunteers against an approved 0.4 mg intramuscular dose, LC-MS/MS plasma naloxone quantification, area-under-curve and time-to-peak comparison, and a separate human-factors study in untrained participants scoring completion of each critical task',
        },
      ],
    },
    keyAudits: [
      {
        id: 'nal-a1',
        category: 'inferred',
        title: 'The nasal spray was approved without a trial in a single overdose',
        laymanSummary:
          'Narcan nasal spray was licensed on two things: blood levels in healthy volunteers compared with an injection that already worked, and a study showing untrained people could operate the device. No trial ever tested it in an actual overdose, because no ethics committee could approve one.',
        technicalDetails:
          'Krieter and colleagues compared the pharmacokinetics of intranasal naloxone at 2 to 8 mg delivered in 0.1 to 0.2 mL from a unit-dose device against an approved 0.4 mg intramuscular dose. All intranasal doses produced plasma concentrations and areas under the curve greater than the intramuscular dose, with no difference in time to maximum plasma concentration; concentrations were dose-proportional between 2 and 8 mg and independent of whether one or both nostrils were used. A parallel human-factors study in individuals representative of the general population found more than 90% able to perform both critical tasks — inserting the nozzle into a nostril and pressing the plunger — without prior training. On the basis of those two studies, a 4 mg single-device dose was selected as the final product. This is the correct regulatory route: an overdose cannot be randomised to placebo, and requiring an efficacy trial would mean no approved lay-administrable product at all. It remains an inference. What was measured is that the nasal device delivers more naloxone than an injection that is known to work, and that people can use it. What was not measured is a survival difference against any comparator.',
        evidenceSource:
          'Krieter P, Chiang N, Gyaw S, et al. Pharmacokinetic Properties and Human Use Characteristics of an FDA-Approved Intranasal Naloxone Product for the Treatment of Opioid Overdose. J Clin Pharmacol 2016;56(10):1243-1253',
        doi: '10.1002/jcph.759',
        inferredClaim:
          'That the 4 mg intranasal device reverses overdose as effectively as intramuscular naloxone — bridged from plasma concentrations in healthy volunteers and a usability study, never tested against an outcome in an overdose',
        measuredMetric:
          'Plasma naloxone concentration and area under the curve for intranasal 2 to 8 mg against intramuscular 0.4 mg, and the proportion of untrained users completing both critical device tasks',
        auditFlag: 'caution',
      },
      {
        id: 'nal-a2',
        category: 'failed',
        title: 'A generic antidote whose device price rose more than five-fold',
        laymanSummary:
          'The molecule has been off patent since the 1980s. The auto-injector went from six hundred and ninety dollars in 2014 to four and a half thousand for a two-pack in 2016, while the epidemic it treats was accelerating.',
        technicalDetails:
          'Gupta, Shah and Ross documented the price trajectory of naloxone products in the New England Journal of Medicine in December 2016. The Evzio single-use auto-injector, fast-tracked to approval in 2014 as a fixed-dose device designed for use by people without medical training, was priced at US$690 for a two-dose package in 2014 and at US$4,500 in 2016 — an increase of more than 500% in a little over two years. Hospira’s generic injectable naloxone, the presentation carrying most of the volume, rose from US$62.29 per 10 mL vial in 2012 to US$142.49 by 2016, an increase of about 129%. The authors’ concern was structural rather than moral: naloxone is bought overwhelmingly by public health departments, harm reduction programmes and emergency services operating on fixed budgets, so a price rise translates directly into fewer kits distributed. None of these increases reflected a change in the drug. Every one attached to a delivery device layered onto a molecule that has been generic for decades — the same commercial pattern that appears on the oxycodone, hydromorphone and oxymorphone pages in this file, applied here to the antidote.',
        evidenceSource:
          'Gupta R, Shah ND, Ross JS. The Rising Price of Naloxone — Risks to Efforts to Stem Overdose Deaths. N Engl J Med 2016;375(23):2213-2215',
        doi: '10.1056/NEJMp1609578',
        measuredMetric:
          'List price of naloxone products by year: Evzio two-pack US$690 (2014) to US$4,500 (2016); Hospira 10 mL vial US$62.29 (2012) to US$142.49 (2016)',
        auditFlag: 'caution',
      },
      {
        id: 'nal-a3',
        category: 'inferred',
        title: 'The case for high-dose naloxone against fentanyl is contested',
        laymanSummary:
          'Eight-milligram nasal sprays and five-milligram injections are sold on the idea that fentanyl needs more naloxone. A 2024 review found that most fentanyl overdoses are reversed by two standard doses, and recommended against the high-dose products on cost, withdrawal risk and lack of evidence.',
        technicalDetails:
          'Lemen and colleagues reviewed the literature on whether two standard intramuscular or intranasal naloxone doses adequately reverse fentanyl overdose, incorporating the experience of a peer-led harm reduction organisation. They concluded that the evidence indicates the vast majority of fentanyl overdoses can be successfully reversed using two standard intramuscular or intranasal doses, with carfentanil the exception requiring three or more; that multiple studies document the risk of precipitated withdrawal from two or more doses, including recurrence of overdose symptoms after resuscitation depending on the half-life of the opioid involved; and that they do not recommend high-dose naloxone formulations as a substitute for four doses of standard intramuscular or intranasal naloxone, citing higher cost, risk of precipitated withdrawal and limited evidence compared with standard doses. Their recommendation is to distribute multiple standard doses to bystanders, to administer with rescue breaths at appropriate intervals until the person is revived, and to call emergency services if unresponsive after two doses. Precipitated withdrawal is the harm at issue and it is not cosmetic: a person who wakes into severe withdrawal may use again immediately, which is the outcome the extra naloxone was intended to prevent.',
        evidenceSource:
          'Lemen PM, Garrett DP, Thompson E, Aho M, Vasquez C, Park JN. High-dose naloxone formulations are not as essential as we thought. Harm Reduct J 2024;21(1):93',
        doi: '10.1186/s12954-024-00994-z',
        inferredClaim:
          'That fentanyl overdose requires higher naloxone doses than the standard formulations deliver — a premise the marketed high-dose products rest on and which this review finds unsupported outside carfentanil exposure',
        auditFlag: 'contested',
      },
      {
        id: 'nal-a4',
        category: 'measured',
        title: 'It wears off before the opioid does, and the label says so first',
        laymanSummary:
          'Naloxone is short-acting. Most opioids are not. Someone can be revived and then stop breathing again as it fades, which is why the first warning on the label is about surveillance rather than about dosing.',
        technicalDetails:
          'Warning 5.1 of the naloxone nasal spray label reads: risk of recurrent respiratory and central nervous system depression — due to the duration of action of naloxone relative to the opioid, keep the patient under continued surveillance and administer repeat doses using a new nasal spray with each dose, as necessary, while awaiting emergency medical assistance. The label states in the indication itself that the product is intended for immediate administration as emergency therapy in settings where opioids may be present and is not a substitute for emergency medical care. The gap is largest for the longest-acting opioids: the methadone label reports a terminal half-life ranging from 8 to 59 hours across published studies, and extended-release formulations release for 12 to 24 hours. The mechanism is competitive antagonism — naloxone does not destroy or neutralise the opioid, it occupies the receptor while it is present, and the opioid is still in the body when it leaves.',
        evidenceSource:
          'Naloxone hydrochloride nasal spray United States prescribing information, Indications 1 and Warnings and Precautions 5.1',
        measuredMetric:
          'Duration of action of naloxone relative to the opioids it reverses, as stated in the product label’s first warning',
        auditFlag: 'verified',
      },
      {
        id: 'nal-a5',
        category: 'measured',
        title: 'Two named limits: partial agonists, and the dependent patient',
        laymanSummary:
          'Naloxone reverses buprenorphine only partially, because buprenorphine holds the receptor too tightly. And in someone dependent on opioids it precipitates withdrawal, which in a newborn can be life-threatening.',
        technicalDetails:
          'Warning 5.2 states the risk of limited efficacy with partial agonists or mixed agonists and antagonists: reversal of respiratory depression caused by buprenorphine or pentazocine may be incomplete, and larger or repeated doses may be required. Warning 5.3 covers precipitation of severe opioid withdrawal in opioid-dependent patients and states that in neonates opioid withdrawal may be life-threatening if not recognised and properly treated; the same section warns that abrupt postoperative reversal of opioid depression may produce adverse cardiovascular effects, primarily in patients with pre-existing cardiovascular disorders or on other drugs with similar effects. These are the two boundaries of a competitive antagonist. Against a ligand with very slow receptor dissociation, competition is a weak lever; and in a receptor system that has adapted to constant occupancy, emptying it abruptly is itself an event.',
        evidenceSource:
          'Naloxone hydrochloride nasal spray United States prescribing information, Warnings and Precautions 5.2 and 5.3',
        measuredMetric:
          'Labelled limits on naloxone efficacy against partial agonists and on its use in opioid-dependent patients and neonates',
        auditFlag: 'verified',
      },
      {
        id: 'nal-a6',
        category: 'conclusion_shift',
        title: 'From prescription-only to a shelf in a convenience store',
        laymanSummary:
          'For fifty years naloxone needed a prescription. On 29 March 2023 the FDA approved the 4 mg nasal spray for over-the-counter sale, and it can now be bought in a supermarket.',
        technicalDetails:
          'NARCAN 4 mg nasal spray was approved under NDA 208411 and, on 29 March 2023, became the first naloxone product approved for non-prescription sale in the United States, opening distribution through pharmacies, convenience stores, supermarkets, petrol stations and online retail. A second over-the-counter naloxone nasal spray product was subsequently approved. The reversal is a regulatory one rather than a pharmacological one: nothing about the molecule changed, and the human-factors evidence that more than 90% of untrained people could operate the device had existed since the 2016 pharmacokinetic and usability programme. What changed was the judgement about where the risk lay — for decades the prescription requirement was justified as a control on a drug given to people with opioid dependence, and the conclusion shifted to the view that the barrier itself was the larger harm. It is worth noting alongside the price audit on this page: over-the-counter status removes the prescription barrier and does not remove the cost barrier.',
        evidenceSource:
          'FDA approval of NARCAN (naloxone hydrochloride) nasal spray 4 mg for over-the-counter use, 29 March 2023; FDA Drugs@FDA record for NDA 208411',
        inferredClaim:
          'That a prescription requirement protected patients from naloxone — a fifty-year regulatory position reversed in 2023 on the judgement that the barrier caused more harm than the drug',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One substitution away from a full agonist',
        laymanDesc:
          'Naloxone is oxymorphone with a different group on its nitrogen. That single change turns a drug that stops breathing into a drug that restores it.',
        molecularDetail:
          'Oxymorphone with the N-methyl group replaced by N-allyl, C19H21NO4. The substituent prevents the conformational change that couples receptor occupancy to G-protein activation, so the molecule binds without activating — the cleanest available demonstration that occupancy and efficacy are separate properties.',
        iconName: 'Atom',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Into the blood in minutes, by whichever route is available',
        laymanDesc:
          'Injected into muscle or sprayed into the nose, it reaches the blood fast. The nasal device was chosen because it delivers more than a working injection and because untrained people can use it.',
        molecularDetail:
          'Intranasal doses of 2 to 8 mg in 0.1 to 0.2 mL produced plasma concentrations and areas under the curve greater than an approved 0.4 mg intramuscular dose, with no difference in time to peak, and dose-proportional exposure between 2 and 8 mg regardless of whether one or both nostrils were used.',
        iconName: 'Wind',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It takes the receptor and does nothing with it',
        laymanDesc:
          'Naloxone binds the mu-opioid receptor tightly enough to push the opioid out, and then simply sits there. Given to someone who has taken no opioid, it does essentially nothing at all.',
        molecularDetail:
          'Competitive antagonism at the mu-opioid receptor with additional kappa and delta antagonism at higher occupancy, and no measurable intrinsic activity. The displacement is surmountable in principle, which is why a very tightly bound partial agonist such as buprenorphine resists it.',
        iconName: 'Shield',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The brainstem starts noticing carbon dioxide again',
        laymanDesc:
          'The circuit that had stopped sounding the alarm about rising carbon dioxide comes back online, and the person breathes.',
        molecularDetail:
          'Removal of mu agonism at the pre-Bötzinger complex and the parabrachial and Kölliker-Fuse regions restores the hypercapnic ventilatory response. Effect is visible within about a minute of intravenous administration and a few minutes of intranasal or intramuscular.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And then it leaves, while the opioid stays',
        laymanDesc:
          'Naloxone wears off in under an hour. Most opioids last longer, so breathing can stop again. This is the reason the label’s first warning is to stay and to call for help.',
        molecularDetail:
          'Warning 5.1: due to the duration of action of naloxone relative to the opioid, keep the patient under continued surveillance and administer repeat doses using a new device as necessary while awaiting emergency medical assistance. The gap is largest with methadone, whose label reports a terminal half-life of 8 to 59 hours, and with extended-release products.',
        iconName: 'Timer',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What waking up feels like',
        laymanDesc:
          'In someone dependent on opioids, emptying the receptor abruptly produces severe withdrawal. It is the main argument for giving only as much as is needed to restore breathing.',
        molecularDetail:
          'Warning 5.3: use in opioid-dependent patients may precipitate opioid withdrawal, life-threatening in neonates if not recognised and treated; abrupt postoperative reversal may cause adverse cardiovascular effects. A 2024 review recommends against high-dose formulations as a substitute for four standard doses on cost, precipitated withdrawal and limited evidence.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'NCT02572089 (NIDA phase 1 intranasal against intramuscular naloxone; published as Krieter et al., J Clin Pharmacol 2016;56:1243-1253)',
        phase:
          'Phase 1, randomised, open-label crossover pharmacokinetic study in healthy volunteers, with a parallel human-factors usability study',
        sampleSize: 30,
        primaryEndpoint:
          'Plasma naloxone concentration and area under the curve for intranasal naloxone 2 to 8 mg in 0.1 to 0.2 mL against an approved 0.4 mg intramuscular dose, and the ability of untrained members of the public to complete both critical device tasks',
        endpointMet: true,
        statisticalPValue:
          'All intranasal doses produced plasma concentrations and areas under the curve greater than the 0.4 mg intramuscular dose, with no difference in time to maximum concentration; exposure was dose-proportional between 2 and 8 mg; more than 90% of untrained participants completed both critical tasks',
        unreportedAdverseSignals:
          'The registered five-arm crossover — intranasal 2 mg, 4 mg from a 20 mg/mL spray in both nostrils, 4 mg from a 40 mg/mL spray in one nostril, and 8 mg, against 1 mL of 0.4 mg/mL intramuscular — enrolled 30 participants and completed in January 2015. Its registered endpoints are Cmax, Tmax, area under the curve and half-life. No overdose outcome was measured in this study or in the parallel usability study, and none could ethically have been: the product is licensed on a pharmacokinetic bridge to a route already known to work, plus evidence that untrained people can operate the device.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Lemen et al., Harm Reduct J 2024;21:93 — literature review of standard against high-dose naloxone for fentanyl overdose',
        phase: 'Structured literature review incorporating the experience of people who use drugs',
        sampleSize: 0,
        primaryEndpoint:
          'Whether two standard intramuscular or intranasal naloxone doses adequately reverse fentanyl overdose, and whether high-dose naloxone formulations are a better solution',
        endpointMet: false,
        statisticalPValue:
          'No pooled effect estimate; the review reports that the vast majority of fentanyl overdoses can be reversed with two standard doses, with carfentanil requiring three or more, and recommends against high-dose formulations',
        unreportedAdverseSignals:
          'A narrative review rather than a meta-analysis, with a sample size of zero recorded because no participants were enrolled. Its finding on precipitated withdrawal — documented in multiple studies at two or more doses, with recurrence of overdose symptoms after resuscitation depending on the half-life of the opioid involved — is the harm that the higher-dose products increase.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Intranasal naloxone at 2 to 8 mg produced higher plasma concentrations and areas under the curve than an approved 0.4 mg intramuscular dose, with no difference in time to peak',
        'More than 90% of untrained participants representative of the general population completed both critical tasks needed to deliver a nasal dose',
        'Evzio auto-injector list price US$690 for a two-pack in 2014 and US$4,500 in 2016; Hospira 10 mL generic vial US$62.29 in 2012 and US$142.49 in 2016',
        'Labelled limits: incomplete reversal of buprenorphine and pentazocine, precipitated withdrawal in dependent patients, and recurrent depression because naloxone is shorter-acting than most opioids',
      ],
      unsupportedInferences: [
        'That the nasal device has been shown to save lives in overdose — no trial in an overdose exists, and none could ethically be run',
        'That fentanyl overdose requires higher naloxone doses than standard formulations deliver, outside carfentanil exposure',
        'That over-the-counter status removes the barrier to access, when the price barrier documented in the pricing literature remains',
        'That a successful reversal ends the emergency, when the label’s first warning is that depression can return as naloxone fades',
      ],
      whatFailedInitially: [
        'The affordability of the delivery devices, with the auto-injector rising more than five-fold in two years while the epidemic accelerated',
        'The premise behind the high-dose formulations, which a 2024 review found unsupported and likely to increase precipitated withdrawal',
        'Reversal of buprenorphine and other tightly bound partial agonists, which the label states may be incomplete',
        'The fifty-year prescription requirement, reversed in March 2023 on the judgement that the barrier caused more harm than the drug',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines, and one of the few drugs whose effect a bystander can see within minutes',
        'Approved for over-the-counter sale in the United States on 29 March 2023, the first naloxone product available without a prescription',
        'Carried routinely by emergency responders, harm reduction programmes, families and — increasingly — people who use opioids themselves',
        'About six United States dollars per millilitre at pharmacy acquisition cost for the generic injectable presentations',
      ],
    },
    deliverySystem: {
      type: 'Intranasal spray at 2, 3, 4 and 8 mg per device; solution for intravenous, intramuscular and subcutaneous injection; a prefilled 5 mg injection; and a single-use auto-injector. Not a controlled substance; the 4 mg nasal spray has been available over the counter in the United States since March 2023.',
      description:
        'Intravenous naloxone acts within about a minute; intramuscular and intranasal within a few minutes. The nasal formulation was developed specifically to be usable by bystanders without training, and the device delivers 0.1 mL into a single nostril. Duration of action is under an hour for most purposes and is shorter than that of most opioids, which is a property of the drug rather than of any particular device.',
      safetyProfile:
        'Naloxone has no meaningful effect in a person who has taken no opioid, which is why it can be given on suspicion. The labelled risks are all consequences of what it does rather than of toxicity: recurrent respiratory and central nervous system depression as it wears off before the opioid does; incomplete reversal of partial agonists such as buprenorphine and pentazocine; precipitation of severe opioid withdrawal in dependent patients, life-threatening in neonates if unrecognised; and adverse cardiovascular effects on abrupt postoperative reversal, chiefly in patients with pre-existing cardiovascular disease. The label states it is not a substitute for emergency medical care.',
    },
    commonQuestions: [
      {
        q: 'Has naloxone been proved to work in a trial?',
        a: 'Not in the sense of a randomised trial in overdose, and it never will be — randomising an unconscious person with a reversible cause of death to placebo is not something any ethics committee would approve. What exists is a mechanism that is fully understood, an effect visible within minutes at the bedside for over fifty years, and, for each new device, a pharmacokinetic bridge showing that it delivers at least as much naloxone as a route already known to work. For the 4 mg nasal spray, that bridge showed higher plasma concentrations and area under the curve than an approved 0.4 mg intramuscular dose, with no delay in reaching peak, plus a usability study in which more than 90% of untrained people operated the device correctly.',
        auditNote:
          'Approving on a pharmacokinetic bridge is the right decision here and it is still an inference. Saying so does not weaken the case for carrying naloxone; it describes accurately what kind of evidence the case rests on.',
      },
      {
        q: 'Does fentanyl need more naloxone?',
        a: 'Mostly no, according to the review that examined the question. Lemen and colleagues concluded in 2024 that the vast majority of fentanyl overdoses can be reversed with two standard intramuscular or intranasal doses, with carfentanil the exception requiring three or more. They recommended distributing multiple standard doses rather than switching to high-dose formulations, citing higher cost, the risk of precipitated withdrawal, and limited evidence compared with standard doses. Precipitated withdrawal matters more than it sounds: someone who wakes into severe withdrawal may use again straight away, which is exactly the outcome the extra naloxone was supposed to prevent.',
      },
      {
        q: 'Why do I have to stay with someone after they wake up?',
        a: 'Because naloxone leaves the body faster than the opioid does. It does not destroy the opioid or neutralise it — it occupies the receptor while it is present, and when it fades the opioid is still there and reoccupies. The label’s first warning is exactly this: the duration of action of most opioids may exceed that of naloxone, so keep the person under continued surveillance and give repeat doses with a new device as necessary while awaiting emergency medical assistance. The risk is largest with long-acting opioids — methadone’s own label reports a terminal half-life of anywhere from 8 to 59 hours.',
      },
      {
        q: 'Why did it get so expensive if it is a generic drug?',
        a: 'Because what is being sold is the device, not the drug. Naloxone was approved in 1971 and has been generic for decades. Gupta, Shah and Ross documented the result in 2016: the Evzio auto-injector went from US$690 for a two-dose package in 2014 to US$4,500 in 2016, and Hospira’s generic injectable vial from US$62.29 in 2012 to US$142.49 by 2016. Naloxone is bought largely by health departments, harm reduction programmes and emergency services on fixed budgets, so those increases convert directly into fewer kits in circulation. Over-the-counter status since March 2023 removed the prescription barrier; it did not remove this one.',
      },
      {
        q: 'Are there opioids it does not reverse well?',
        a: 'Yes, and the label names them. Warning 5.2 states that reversal of respiratory depression caused by partial agonists or mixed agonists and antagonists such as buprenorphine and pentazocine may be incomplete, and that larger or repeated doses may be required. The reason is mechanical: naloxone works by competing for the receptor, and buprenorphine binds it very tightly and lets go very slowly, so competition is a weak lever against it. That is a property of the interaction rather than a defect in any product, and it is a reason to keep calling for emergency help rather than to assume the naloxone has failed.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'Krieter P, Chiang N, Gyaw S, Skolnick P, Crystal R, Keegan F, Aker J, Beck M, Harris J. Pharmacokinetic Properties and Human Use Characteristics of an FDA-Approved Intranasal Naloxone Product for the Treatment of Opioid Overdose. J Clin Pharmacol 2016;56(10):1243-1253',
        identifier: '10.1002/jcph.759',
        kind: 'doi',
      },
      {
        label:
          'Gupta R, Shah ND, Ross JS. The Rising Price of Naloxone — Risks to Efforts to Stem Overdose Deaths. N Engl J Med 2016;375(23):2213-2215',
        identifier: '10.1056/NEJMp1609578',
        kind: 'doi',
      },
      {
        label:
          'Lemen PM, Garrett DP, Thompson E, Aho M, Vasquez C, Park JN. High-dose naloxone formulations are not as essential as we thought. Harm Reduct J 2024;21(1):93',
        identifier: '10.1186/s12954-024-00994-z',
        kind: 'doi',
      },
      {
        label:
          'Pharmacokinetic Evaluation of Intranasal and Intramuscular Naloxone in Healthy Volunteers — ClinicalTrials.gov NCT02572089, National Institute on Drug Abuse, 30 participants, completed January 2015',
        identifier: 'NCT02572089',
        kind: 'nct',
      },
      {
        label:
          'Naloxone hydrochloride nasal spray United States prescribing information — Indications 1, Warnings and Precautions 5.1, 5.2 and 5.3',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=naloxone',
        kind: 'regulatory',
      },
      {
        label:
          'FDA Drugs@FDA record for NDA 208411 (NARCAN naloxone hydrochloride nasal spray), approved for over-the-counter use on 29 March 2023',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=208411',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — naloxone, 40 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5284596 — naloxone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284596',
        kind: 'url',
      },
    ],
  },
]
