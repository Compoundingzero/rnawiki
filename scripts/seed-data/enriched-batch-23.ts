import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the antidepressants and anxiolytics. The SSRIs that replaced the
 * tricyclics, the two serotonin-noradrenaline drugs, the two sedating atypicals, the two
 * tricyclics still in daily use for things they were never licensed for, and the one anxiolytic
 * that is neither a benzodiazepine nor an antidepressant.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES, molecular formula, NADAC price — are copied from the enriched record
 * rather than researched again.
 *
 * Every DOI, PMID, NCT number and FDA application referenced below was resolved against the NCBI
 * E-utilities, the ClinicalTrials.gov registry or the openFDA label and Drugs@FDA endpoints at the
 * time of writing. Response rates, effect sizes, confidence intervals and p-values are copied from
 * the published abstract or the FDA label, never from memory. Where a number could not be sourced,
 * the field is absent.
 *
 * Six conventions apply to the whole group.
 *
 * 1. THE MECHANISM ON EVERY ONE OF THESE LABELS IS A HYPOTHESIS AND THE LABEL SAYS SO. Fluoxetine:
 *    "Although the exact mechanism of fluoxetine is unknown, it is presumed to be linked to its
 *    inhibition of CNS neuronal uptake of serotonin." Buspirone: "The mechanism of action of
 *    buspirone is unknown." Trazodone, mirtazapine, amitriptyline and nortriptyline carry the same
 *    hedge in their own words. The serotonin-deficiency account that reached the public is not on
 *    any of these documents, and the 2022 umbrella review of the evidence for it is cited on every
 *    serotonergic page in this file.
 *
 * 2. A RATING SCALE IS A SURROGATE. The Hamilton and Montgomery-Åsberg scales are what these drugs
 *    were licensed on. Whether a two-to-three-point Hamilton difference is something a person
 *    notices is a separate question from whether it is statistically real, and the pages say which
 *    of the two a given number answers.
 *
 * 3. WHAT THE REGISTRY HELD AND WHAT THE JOURNALS PRINTED ARE DIFFERENT DATA SETS. Turner's 2008
 *    audit of the FDA reviews found 31% of registered antidepressant trials unpublished and the
 *    published record implying 94% positive where the FDA had found 51%. That finding shapes how
 *    every efficacy claim in this file is worded.
 *
 * 4. PRICING IS A PRICE, NOT A COST. Every price here is the CMS National Average Drug Acquisition
 *    Cost — what a United States retail pharmacy pays a wholesaler — and is labelled as such.
 *    `synthesisCostPerDose` is empty on every dossier in this file: the cost-of-production
 *    literature publishes a method and an aggregate, and its per-molecule psychotropic figures sit
 *    in a supplementary appendix that could not be resolved and verified at the time of writing.
 *    An unverified cost is worse than an absent one.
 *
 * 5. NO DOSING, TITRATION, TAPERING OR PROCUREMENT GUIDANCE. Strengths appear only where they are
 *    part of a trial's description, a label statement or a product's identity. Nothing here tells a
 *    reader what to take, how to move between doses, or how to stop. Stopping these drugs is
 *    genuinely difficult and it is a clinical matter, not an editorial one.
 *
 * 6. THE MOST INSTRUCTIVE RECORD IN THIS GROUP IS A RETRACTION THAT NEVER HAPPENED. Study 329
 *    reported paroxetine as effective and well tolerated in adolescents; the 2015 restoration of
 *    the same patient-level data under the RIAT protocol found neither efficacy on any prespecified
 *    outcome nor the reported safety. The original paper has not been retracted. That story is on
 *    the paroxetine page because it is the clearest demonstration in this field of what an evidence
 *    audit is for.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group. It publishes an estimation method over 148 medicines and an aggregate result; its per-molecule psychotropic figures are in a supplementary appendix that could not be resolved at the time of writing, so no per-dose cost is stated on these pages',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

const SEROTONIN_UMBRELLA_SOURCE = {
  label:
    'Moncrieff J, Cooper RE, Stockmann T, Amendola S, Hengartner MP, Horowitz MA. The serotonin theory of depression: a systematic umbrella review of the evidence. Mol Psychiatry 2023;28:3243-3256',
  identifier: '10.1038/s41380-022-01661-0',
  kind: 'doi' as const,
}

const PUBLICATION_BIAS_SOURCE = {
  label:
    'Turner EH, Matthews AM, Linardatos E, Tell RA, Rosenthal R. Selective publication of antidepressant trials and its influence on apparent efficacy. N Engl J Med 2008;358:252-260',
  identifier: '10.1056/NEJMsa065779',
  kind: 'doi' as const,
}

const NETWORK_META_SOURCE = {
  label:
    'Cipriani A, Furukawa TA, Salanti G, et al. Comparative efficacy and acceptability of 21 antidepressant drugs for the acute treatment of adults with major depressive disorder: a systematic review and network meta-analysis. Lancet 2018;391:1357-1366',
  identifier: '10.1016/S0140-6736(17)32802-7',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_23_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Fluoxetine — the drug that made the serotonin story public, by a label that has always said
  //    the mechanism is unknown and only presumed.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'fluoxetine',
    name: 'Fluoxetine',
    tradeName: 'Prozac / Prozac Weekly / Sarafem / Selfemra',
    sponsor:
      'Eli Lilly and Company (originator, NDA 018936); generic since 2001 and made by many manufacturers',
    targetGene: 'SLC6A4',
    targetProtein:
      'Serotonin transporter (SERT, 5-HTT) — the presynaptic pump that clears serotonin from the synaptic cleft',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1987,
    indication:
      'Acute and maintenance treatment of major depressive disorder; acute and maintenance treatment of obsessions and compulsions in obsessive compulsive disorder; acute and maintenance treatment of binge-eating and vomiting behaviours in moderate to severe bulimia nervosa; acute treatment of panic disorder with or without agoraphobia. In combination with olanzapine, acute treatment of depressive episodes in bipolar I disorder and of treatment-resistant depression',
    patientFriendlyIndication:
      'Depression, obsessive-compulsive disorder, bulimia and panic attacks',
    anatomicalSite:
      'Serotonin transporter on presynaptic terminals of raphe-projecting neurons throughout the central nervous system',
    conditionContext: {
      conditionExplainer:
        'Major depressive disorder is diagnosed from a list of symptoms lasting at least two weeks, not from a test. There is no blood marker, no scan and no biopsy, so the thing being treated is defined by what a person reports and a clinician observes, and the thing being measured in trials is a score on a questionnaire.',
      whyItMatters:
        'Fluoxetine is the drug that took the serotonin explanation of depression out of the laboratory and into ordinary speech. That explanation is not on its label, has never been on its label, and was found by a 2022 umbrella review of the underlying evidence to have no consistent support. What is on the label is a hypothesis and a set of rating-scale results.',
      whoTakesThis:
        'Adults and, for depression from age eight and for obsessive compulsive disorder from age seven, children and adolescents. Fluoxetine is the only serotonin reuptake inhibitor with a United States paediatric depression indication. Not people taking a monoamine oxidase inhibitor, pimozide or thioridazine.',
      clinicalGoals:
        'A fall in a depression rating scale score, and in the maintenance trials a lower rate of relapse. No trial of this drug has measured a change in mortality, and the label makes no such claim.',
    },
    oneSentenceVerdict:
      'A serotonin reuptake inhibitor whose own label states the exact mechanism is unknown and only presumed, whose best adolescent trial put twelve-week response at 60.6% against 34.8% on placebo in 439 patients, and whose FDA-pooled paediatric safety data show 14 additional cases of suicidal thinking or behaviour per 1,000 under-eighteens treated.',
    laymanHowItWorks:
      'Nerve cells that use serotonin release it into the gap between cells and then pull most of it back in through a protein pump. Fluoxetine blocks that pump, so serotonin stays in the gap longer. What happens after that is not established: the pump is blocked within hours, and any mood effect takes weeks, so the block cannot be the whole explanation. The prescribing information says as much — that the exact mechanism is unknown and is presumed to be linked to serotonin reuptake inhibition.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 64,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0499 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 152 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 29 December 1987 under NDA 018936 and generic since August 2001. For the fourteen years before that it was among the highest-revenue prescription medicines in the world; it now costs about five United States cents a capsule at pharmacy acquisition cost, which is roughly what the excipients cost.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Every drug in this class does the same thing to the same transporter, and the 2018 network meta-analysis of 522 trials and 116,477 patients found the differences between them small and the confidence intervals wide. Fluoxetine’s distinguishing features are not efficacy — in head-to-head studies it sat among the least efficacious of the 21 drugs compared — but its long half-life, its paediatric indication and its tolerability, where it was one of only two antidepressants with fewer dropouts than placebo.',
      conventionalRx: [
        {
          name: 'Sertraline (Zoloft)',
          class: 'Selective serotonin reuptake inhibitor',
          howItCompares:
            'The same transporter, a shorter half-life and no clinically important CYP2D6 inhibition, which matters if a person is also taking tamoxifen, codeine or a beta-blocker. In the 2018 network meta-analysis sertraline was among the more tolerable drugs (range of acceptability odds ratios 0.43 to 0.77 for that group), as was fluoxetine.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: fewer drug interactions; easier to stop than the short-half-life drugs. Cons: more gastrointestinal upset early; no United States paediatric depression indication.',
        },
        {
          name: 'Escitalopram (Lexapro)',
          class: 'Selective serotonin reuptake inhibitor, single enantiomer of citalopram',
          howItCompares:
            'One of seven drugs that beat the others in the head-to-head half of the 2018 network meta-analysis (range of odds ratios 1.19 to 1.96), and also one of the six most tolerable. Fluoxetine appeared in the least efficacious group of that same analysis (0.51 to 0.84).',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: better placed on both axes of the largest comparative analysis available. Cons: dose-dependent QT prolongation shared with citalopram; the head-to-head comparisons carried wide credible intervals and low certainty of evidence.',
        },
        {
          name: 'Bupropion (Wellbutrin)',
          class: 'Noradrenaline-dopamine reuptake inhibitor',
          howItCompares:
            'Does not touch the serotonin transporter at all, which is why it is the usual choice when sexual dysfunction or sedation is the problem. It is not an option in anyone with a seizure history or an eating disorder, and bulimia is one of fluoxetine’s licensed indications.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: little sexual dysfunction; no weight gain. Cons: contraindicated in seizure disorders and in bulimia and anorexia; more insomnia and agitation.',
        },
        {
          name: 'Cognitive behavioural therapy, alone or added to the drug',
          class: 'Structured psychological treatment — not a medicine',
          howItCompares:
            'Measured directly against this drug in the same trial rather than inferred. In TADS, twelve-week response was 43.2% for cognitive behavioural therapy alone, 60.6% for fluoxetine alone and 71.0% for the two combined, against 34.8% on placebo. Fluoxetine alone beat therapy alone; the combination beat both.',
          typicalCost:
            'Not comparable to a drug price. Availability and waiting time, not tablet cost, are what determine whether a person gets it.',
          prosAndCons:
            'Pros: no boxed warning, no discontinuation problem, no drug interactions, and in TADS the combination had the best benefit-to-risk trade-off. Cons: requires a trained therapist and sustained attendance; the trial arms could not be blinded, so the therapy comparisons are not protected against expectancy the way the drug-placebo comparison is.',
        },
      ],
      naturalFoods: [
        {
          name: 'St John’s wort (Hypericum perforatum) extract',
          activeCompound: 'Hyperforin and hypericin, in standardised extracts',
          biologicalMechanism:
            'Hyperforin inhibits reuptake of serotonin, noradrenaline and dopamine in vitro by a mechanism distinct from the transporter-blocking of the drugs, and hypericum is a strong inducer of CYP3A4 and P-glycoprotein.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice, and it must not be combined with a serotonin reuptake inhibitor: the fluoxetine label names St John’s Wort among the agents that raise the risk of serotonin syndrome. For scale only: the 2008 Cochrane review pooled 29 trials in 5,489 patients with major depression and found a response rate ratio against placebo of 1.28 (95% CI 1.10 to 1.49) in the nine larger trials and 1.87 (95% CI 1.22 to 2.87) in the nine smaller ones, and no difference against standard antidepressants (RR 1.00, 95% CI 0.90 to 1.11 against SSRIs across 12 trials).',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Say what else you take before starting',
          action:
            'List every drug and supplement, especially triptans, tramadol, lithium, tryptophan and St John’s wort.',
          patientImpact:
            'The label names triptans, tricyclic antidepressants, fentanyl, lithium, tramadol, tryptophan, buspirone, amphetamines and St John’s Wort as agents that raise the risk of serotonin syndrome when combined with fluoxetine.',
          clinicalPrecaution:
            'A monoamine oxidase inhibitor is a contraindication rather than a caution, and because of fluoxetine’s long half-life the required washout runs in weeks, not days.',
        },
        {
          name: 'Ask about tamoxifen and codeine specifically',
          action: 'Mention fluoxetine to any prescriber starting a drug cleared by CYP2D6.',
          patientImpact:
            'Fluoxetine is a strong CYP2D6 inhibitor. Drugs that need CYP2D6 to become active — tamoxifen and codeine among them — and drugs cleared by it, including several beta-blockers and tricyclics, are affected in opposite directions.',
          clinicalPrecaution:
            'The interaction persists for weeks after the last capsule because norfluoxetine has an elimination half-life of 4 to 16 days. Stopping fluoxetine does not immediately stop the interaction.',
        },
        {
          name: 'Watch the first weeks, and say so if things get worse',
          action:
            'Agree in advance with someone close who will watch for agitation, sleeplessness or worsening mood in the first month and after any dose change.',
          patientImpact:
            'The boxed warning directs exactly this. The FDA’s pooled analysis of 24 short-term trials in over 4,400 patients under 18 found 14 additional cases of suicidal thinking or behaviour per 1,000 treated; in adults 25 to 64 there was 1 fewer case per 1,000, and at 65 and over, 6 fewer.',
          clinicalPrecaution:
            'The label lists anxiety, agitation, panic attacks, insomnia, irritability, hostility, aggressiveness, impulsivity, akathisia, hypomania and mania as the symptoms to report. No suicides occurred in any of the paediatric trials.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CNCCC(C1=CC=CC=C1)OC2=CC=C(C=C2)C(F)(F)F',
      chemicalFormula: 'C17H18F3NO',
      molecularWeight: '309.33 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'A racemic 50/50 mixture of R- and S-fluoxetine. The label states that in animal models both enantiomers are specific and potent serotonin uptake inhibitors of essentially equivalent activity, that S-fluoxetine is eliminated more slowly and predominates at steady state, and that of the two demethylated metabolites S-norfluoxetine is a potent and selective serotonin uptake inhibitor while R-norfluoxetine is significantly less potent than the parent. About 94.5% is bound to human serum proteins in vitro. Fluoxetine binds muscarinic, histaminergic and alpha-1 adrenergic receptors much less potently than the tricyclics do, which is the pharmacological basis of the class’s tolerability advantage.',
      structureSource: {
        label:
          'PubChem CID 3386 (fluoxetine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; enantiomer and protein-binding statements from the fluoxetine United States prescribing information, section 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3386',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'flx-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm identity, the trifluoromethyl group and the enantiomeric ratio',
          description:
            'The marketed product is a racemate, so a chiral assay is a release test rather than a research question: a batch enriched in one enantiomer has different pharmacokinetics from the approved drug even though a normal potency assay would pass it. The para-trifluoromethyl group is what distinguishes fluoxetine from its structural relatives and is confirmed directly by fluorine NMR.',
          reagentsAndBuffer:
            'Fluoxetine hydrochloride reference standard, chiral HPLC on an amylose or cellulose stationary phase, 19F NMR, Karl Fischer titration for water content, residual solvent analysis by headspace gas chromatography',
        },
        {
          id: 'flx-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the aryloxy-propanamine backbone',
          description:
            'The molecule is a three-carbon chain carrying a methylamine at one end and a benzylic ether at the other, joining a plain phenyl ring to a 4-(trifluoromethyl)phenoxy ring. The ether is formed by nucleophilic aromatic substitution, which the strongly electron-withdrawing trifluoromethyl group makes possible on an otherwise unactivated ring.',
          dependsOnStepId: 'flx-w1',
          reagentsAndBuffer:
            '3-Chloropropiophenone or an equivalent aryl ketone, reduction to the benzylic alcohol, 4-chlorobenzotrifluoride and a base for the nucleophilic aromatic substitution, methylamine for the amine terminus, anhydrous dipolar aprotic solvent',
        },
        {
          id: 'flx-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Form and recrystallise the hydrochloride salt',
          description:
            'The free base is an oil and the marketed material is the hydrochloride. Salt formation is the purification step: the specification controls the des-methyl impurity, which is norfluoxetine and is itself pharmacologically active, so an impurity limit here is a potency question and not only a purity one.',
          dependsOnStepId: 'flx-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol or ethereal HCl, recrystallisation solvent, HPLC release testing against a norfluoxetine impurity limit',
        },
        {
          id: 'flx-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure transporter occupancy, not just binding affinity',
          description:
            'Affinity for the transporter in a membrane preparation is not the same measurement as occupancy of the transporter in a living brain at a clinical dose. The second is what positron emission tomography with a serotonin transporter ligand measures, and it is the measurement that shows the pump is essentially fully blocked within days while the clinical effect is not.',
          dependsOnStepId: 'flx-w3',
          reagentsAndBuffer:
            'HEK293 or COS cells stably expressing human SLC6A4, tritiated serotonin uptake assay, paired positron emission tomography with a validated serotonin transporter radioligand for in vivo occupancy',
        },
        {
          id: 'flx-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Separate parent and active metabolite in plasma',
          description:
            'Fluoxetine and norfluoxetine both inhibit the transporter and have very different half-lives — 1 to 3 days after a single dose for the parent, 4 to 16 days for the metabolite. An assay that reports a single combined figure cannot describe the exposure a person is actually carrying, and cannot explain why steady state takes four to five weeks to reach.',
          dependsOnStepId: 'flx-w4',
          reagentsAndBuffer:
            'Liquid chromatography-tandem mass spectrometry with deuterated fluoxetine and norfluoxetine internal standards, protein precipitation or solid-phase extraction from plasma, chiral column where enantiomer-resolved exposure is required',
        },
      ],
    },
    keyAudits: [
      {
        id: 'flx-a1',
        category: 'inferred',
        title: 'The label has never said serotonin deficiency causes depression',
        laymanSummary:
          'Fluoxetine is the drug that put the phrase "chemical imbalance" into everyday speech. Its prescribing information says the exact mechanism is unknown and only presumed to be linked to serotonin reuptake — and a 2022 review of all the evidence for a serotonin abnormality in depression found no consistent support for one.',
        technicalDetails:
          'Section 12.1 of the fluoxetine United States prescribing information reads in full: "Although the exact mechanism of fluoxetine is unknown, it is presumed to be linked to its inhibition of CNS neuronal uptake of serotonin." Section 12.2 adds only that fluoxetine blocks serotonin uptake into human platelets at clinically relevant doses and is a more potent uptake inhibitor of serotonin than of noradrenaline in animals. Nothing on the document asserts a serotonin deficit in depressed people. The 2022 umbrella review by Moncrieff and colleagues synthesised 17 reviews and large data-set analyses across serotonin and 5-HIAA concentrations, 5-HT1A receptor binding, transporter binding, tryptophan depletion and transporter gene associations, and reported no consistent evidence of an association between serotonin and depression, together with evidence that lowered plasma serotonin was associated with antidepressant use rather than with depression. There is also a timing problem the label does not resolve: transporter occupancy is essentially complete within days and clinical separation from placebo takes weeks.',
        evidenceSource:
          'Fluoxetine United States prescribing information, sections 12.1 and 12.2 (NDA 018936); Moncrieff J et al., Mol Psychiatry 2023;28:3243-3256',
        doi: '10.1038/s41380-022-01661-0',
        inferredClaim:
          'That depression is caused by a serotonin deficiency which this drug corrects — an account that appears in no version of the label and that the umbrella review of the underlying evidence does not support',
        auditFlag: 'contested',
      },
      {
        id: 'flx-a2',
        category: 'measured',
        title: 'TADS: 60.6% against 34.8% in adolescents, with therapy measured alongside',
        laymanSummary:
          'The largest independent adolescent trial randomised 439 twelve-to-seventeen-year-olds to fluoxetine, cognitive behavioural therapy, both, or placebo. Response was 60.6% on the drug, 43.2% on therapy alone, 71.0% on both, and 34.8% on placebo.',
        technicalDetails:
          'The Treatment for Adolescents With Depression Study (TADS, NCT00006286) randomised 439 patients aged 12 to 17 with DSM-IV major depressive disorder across 13 United States academic and community clinics to twelve weeks of fluoxetine 10 to 40 mg/day, cognitive behavioural therapy, both, or placebo. Placebo and fluoxetine alone were double-blind; the therapy arms could not be blinded. Response rates on the dichotomised Clinical Global Impressions improvement score were 71.0% (95% CI 62 to 80) for fluoxetine with therapy, 60.6% (95% CI 51 to 70) for fluoxetine alone, 43.2% (95% CI 34 to 52) for therapy alone and 34.8% (95% CI 26 to 44) for placebo. Fluoxetine alone was superior to therapy alone (p=0.01); the combination was superior to both (p=0.02 against fluoxetine, p=0.01 against therapy). Clinically significant suicidal thinking was present in 29% of the sample at baseline and improved in all four groups, with the greatest reduction in the combination arm (p=0.02). Seven of 439 patients (1.6%) attempted suicide; there were no completed suicides. This is a publicly funded trial with a placebo arm and an active psychological comparator in the same randomisation, which is rare in this field.',
        evidenceSource:
          'March J, Silva S, Petrycki S, et al. Treatment for Adolescents With Depression Study (TADS) randomized controlled trial. JAMA 2004;292:807-820',
        doi: '10.1001/jama.292.7.807',
        measuredMetric:
          'Twelve-week response rate on the Clinical Global Impressions improvement score, four arms, 439 adolescents',
        auditFlag: 'verified',
      },
      {
        id: 'flx-a3',
        category: 'conclusion_shift',
        title: 'A third of the trials were never published, and the ones that were looked better',
        laymanSummary:
          'When researchers compared what the FDA held on 12 antidepressants against what had appeared in journals, 31% of the registered trials had never been published. The published literature made 94% of trials look positive. The FDA’s own analysis put it at 51%.',
        technicalDetails:
          'Turner and colleagues obtained FDA reviews for 74 registered studies of 12 antidepressant agents involving 12,564 patients and searched systematically for matching publications. Twenty-three of the 74 studies, accounting for 3,449 participants, were never published. Of the studies the FDA viewed as positive, 37 of 38 were published. Of those the FDA viewed as negative or questionable, 22 were not published and 11 were published in a way the authors judged conveyed a positive outcome, leaving 3 exceptions. Separate meta-analyses of the FDA and journal data sets showed effect-size inflation of 11% to 69% for individual drugs and 32% overall. Fluoxetine is one of the 12 agents in that data set. This is not a claim that fluoxetine does not work — it does separate from placebo — but a measurement of how much of the apparent size of the effect came from which trials reached print.',
        evidenceSource:
          'Turner EH, Matthews AM, Linardatos E, Tell RA, Rosenthal R. N Engl J Med 2008;358:252-260',
        doi: '10.1056/NEJMsa065779',
        measuredMetric:
          'Proportion of FDA-registered antidepressant trials published, and effect-size difference between the FDA and journal data sets',
        auditFlag: 'caution',
      },
      {
        id: 'flx-a4',
        category: 'inferred',
        title: 'The drug-placebo gap depends on how depressed you were to start with',
        laymanSummary:
          'A meta-analysis of the complete FDA data sets for four newer antidepressants, fluoxetine among them, found the difference from placebo grew with baseline severity — and reached conventional criteria for clinical significance only at the very top of the very severe range.',
        technicalDetails:
          'Kirsch and colleagues obtained the full data submitted to the FDA for licensing of the four new-generation antidepressants for which complete data sets were available, and modelled linear and quadratic effects of initial severity on improvement in drug and placebo groups. Drug-placebo differences rose with baseline severity, from virtually none at moderate levels to a relatively small difference at very severe levels, reaching conventional criteria for clinical significance only at the upper end of the very severely depressed category. The mechanism the meta-regression identified was not increasing drug response with severity but decreasing placebo response: the relationship was attributable to reduced responsiveness to placebo among the most severely depressed, not to increased responsiveness to medication. The analysis has been contested on its choice of the NICE three-point threshold and on the statistical handling of the severity gradient, and the contest is itself part of the record; what is not contested is the underlying FDA data set it used.',
        evidenceSource:
          'Kirsch I, Deacon BJ, Huedo-Medina TB, Scoboria A, Moore TJ, Johnson BT. PLoS Med 2008;5:e45',
        doi: '10.1371/journal.pmed.0050045',
        inferredClaim:
          'That the average rating-scale improvement seen in the licensing trials represents a clinically meaningful benefit across the whole range of depression severity',
        auditFlag: 'contested',
      },
      {
        id: 'flx-a5',
        category: 'failed',
        title: '14 additional cases of suicidality per 1,000 under-eighteens, from pooled FDA data',
        laymanSummary:
          'The boxed warning at the top of the label exists because the FDA pooled 24 short-term trials in over 4,400 children and adolescents and found 14 additional cases of suicidal thinking or behaviour per 1,000 treated. In adults over 24 the same pooling found no increase, and over 65 it found a reduction.',
        technicalDetails:
          'The pooled paediatric analysis covered 24 short-term trials of 9 antidepressants in over 4,400 patients with major depressive disorder, obsessive compulsive disorder or other psychiatric disorders; the adult analysis covered 295 short-term trials of 11 drugs in over 77,000 patients. The drug-placebo differences in cases of suicidality per 1,000 treated were 14 additional under 18, 5 additional at 18 to 24, 1 fewer at 25 to 64 and 6 fewer at 65 and over. No suicides occurred in any of the paediatric trials, and the number in the adult trials was insufficient to reach a conclusion about drug effect on completed suicide. The finding is a class-level signal rather than a fluoxetine-specific one, and the label states there was considerable variation among drugs. It became visible only when the regulator compelled disclosure of the unpublished paediatric data set, which connects it directly to the selective-publication audit above.',
        evidenceSource:
          'Fluoxetine United States prescribing information, Boxed Warning and section 5.1, Table 2 (NDA 018936)',
        measuredMetric:
          'Drug-placebo difference in cases of suicidal thinking and behaviour per 1,000 patients treated, by age stratum',
        auditFlag: 'caution',
      },
      {
        id: 'flx-a6',
        category: 'measured',
        title: 'Children on it grew 1.1 cm less and gained 1.1 kg less over nineteen weeks',
        laymanSummary:
          'In the longer paediatric trial, children and adolescents on fluoxetine grew about a centimetre less in height and gained about a kilogram less in weight than those on placebo over nineteen weeks. Nobody has studied what happens over years.',
        technicalDetails:
          'Section 8.4 of the label records that after 19 weeks of treatment in a clinical trial, paediatric subjects treated with fluoxetine gained an average of 1.1 cm less in height and 1.1 kg less in weight than subjects on placebo, and that fluoxetine treatment was associated with a decrease in alkaline phosphatase levels. The same section states that the safety of fluoxetine in paediatric patients has not been systematically assessed for chronic treatment longer than several months, and that there are no studies directly evaluating longer-term effects on growth, development and maturation. It also records mania or hypomania in 6 of 228 fluoxetine-treated patients (2.6%) against 0 of 190 on placebo across the three paediatric studies. A measured growth difference over nineteen weeks with no data past that point is a specific gap, not a general reassurance.',
        evidenceSource:
          'Fluoxetine United States prescribing information, section 8.4 Pediatric Use (NDA 018936)',
        measuredMetric:
          'Difference in height and weight gain against placebo over 19 weeks in paediatric patients',
        auditFlag: 'caution',
      },
      {
        id: 'flx-a7',
        category: 'measured',
        title: 'Least efficacious group, most tolerable group, in the same analysis',
        laymanSummary:
          'The biggest comparison ever run — 522 trials, 116,477 patients, 21 drugs — put fluoxetine among the least effective when drugs were compared directly against each other, and among only two that people were less likely to quit than placebo.',
        technicalDetails:
          'The 2018 network meta-analysis found all 21 antidepressants more effective than placebo, with odds ratios from 2.13 (95% CrI 1.89 to 2.41) for amitriptyline down to 1.37 (1.16 to 1.63) for reboxetine. In the head-to-head studies, fluoxetine, fluvoxamine, reboxetine and trazodone were the least efficacious drugs (range of odds ratios 0.51 to 0.84), while agomelatine, amitriptyline, escitalopram, mirtazapine, paroxetine, venlafaxine and vortioxetine were more effective than the others (1.19 to 1.96). On acceptability, only agomelatine (OR 0.84, 95% CrI 0.72 to 0.97) and fluoxetine (0.88, 0.80 to 0.96) had fewer dropouts than placebo. The authors rated 46 of 522 trials (9%) at high risk of bias and 380 (73%) at moderate, and the certainty of evidence as moderate to very low. Efficacy and acceptability point in opposite directions, so choosing between these drugs involves a trade-off rather than a single ranking.',
        evidenceSource: 'Cipriani A, Furukawa TA, Salanti G, et al. Lancet 2018;391:1357-1366',
        doi: '10.1016/S0140-6736(17)32802-7',
        measuredMetric:
          'Efficacy and acceptability odds ratios across 21 antidepressants, 522 trials, 116,477 participants',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, absorbed, and slow to leave',
        laymanDesc:
          'A capsule taken with or without food. What is unusual about this drug is how long it stays: weeks after the last one, active drug is still circulating.',
        molecularDetail:
          'Peak plasma concentrations of 15 to 55 ng/mL at 6 to 8 hours after a single 40 mg dose. Food does not affect systemic bioavailability and may delay absorption by 1 to 2 hours. Elimination half-life is 1 to 3 days after acute administration and 4 to 6 days on chronic dosing; the active metabolite norfluoxetine runs 4 to 16 days. Steady state is not reached for four to five weeks.',
        iconName: 'Clock',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Into the brain, and demethylated into a second active drug',
        laymanDesc:
          'The liver converts part of it into a second compound that blocks the same pump and lasts even longer. A person on fluoxetine is carrying two active molecules, not one.',
        molecularDetail:
          'Extensive hepatic metabolism to norfluoxetine and other metabolites. In animal models S-norfluoxetine is a potent and selective serotonin uptake inhibitor of essentially equivalent activity to the parent, while R-norfluoxetine is significantly less potent. About 7% of the population has reduced CYP2D6 activity and reaches higher S-fluoxetine concentrations; the label notes that because the parent and metabolite are both active, the clinical consequence is smaller than the exposure difference suggests.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The serotonin pump is blocked',
        laymanDesc:
          'Serotonin released between nerve cells is normally vacuumed back up. Fluoxetine plugs the vacuum, so more serotonin stays in the gap.',
        molecularDetail:
          'Competitive inhibition of SLC6A4, the sodium-dependent serotonin transporter, on the presynaptic terminal. Studies at clinically relevant doses in man demonstrate blockade of serotonin uptake into human platelets, which share the transporter. Fluoxetine is a much more potent inhibitor of serotonin than of noradrenaline uptake in animals, and binds muscarinic, histaminergic and alpha-1 receptors far more weakly than the tricyclics do.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And then nothing happens for several weeks',
        laymanDesc:
          'The pump is blocked almost immediately. Any change in mood takes four to six weeks. Whatever produces the clinical effect, it is not the block itself.',
        molecularDetail:
          'The gap between near-complete transporter occupancy within days and clinical separation from placebo at four to six weeks is the central unexplained fact of this drug class. Proposed bridges — presynaptic 5-HT1A autoreceptor desensitisation, downstream changes in neuroplasticity and BDNF signalling — are hypotheses, and section 12.1 of the label declines to endorse any of them, stating only that the exact mechanism is unknown.',
        iconName: 'HelpCircle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'A rating scale moves',
        laymanDesc:
          'What the trials measured was a score. In the adolescent trial six in ten responded on the drug and three and a half in ten responded on placebo.',
        molecularDetail:
          'Licensing was on the Hamilton Depression Rating Scale in 5- and 6-week placebo-controlled adult trials and on the Children’s Depression Rating Scale-Revised in two 8- to 9-week paediatric trials (N=315 randomised). A 12-week open-label responder cohort randomised to continue fluoxetine 20 mg or switch to placebo (N=298) showed a significantly lower relapse rate on drug at 38 further weeks.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What has never been measured',
        laymanDesc:
          'No trial of this drug has measured deaths, and paediatric safety has not been systematically studied beyond several months.',
        molecularDetail:
          'The label states that the safety of fluoxetine in paediatric patients has not been systematically assessed for chronic treatment longer than several months, and that no study directly evaluates longer-term effects on growth, development and maturation. The pooled short-term trials could not resolve an effect on completed suicide in adults because there were too few events. Mortality is not an endpoint anywhere in the registration programme.',
        iconName: 'AlertCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'TADS — NCT00006286 (JAMA 2004;292:807-820)',
        phase: 'Phase 3, randomised, four-arm; drug arms double-blind, therapy arms unblinded',
        sampleSize: 439,
        primaryEndpoint:
          'Children’s Depression Rating Scale-Revised total score at 12 weeks, with a dichotomised Clinical Global Impressions improvement score for the responder analysis, in adolescents aged 12 to 17',
        endpointMet: true,
        statisticalPValue:
          'Response 71.0% combination, 60.6% fluoxetine alone, 43.2% cognitive behavioural therapy alone, 34.8% placebo; combination against placebo p=0.001, fluoxetine alone against therapy alone p=0.01',
        unreportedAdverseSignals:
          'Seven of 439 patients (1.6%) attempted suicide, with no completed suicides. The two therapy-containing arms could not be blinded, so their comparison against placebo is not protected against expectancy in the way the fluoxetine-placebo comparison is.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Two paediatric major depressive disorder trials (NDA 018936, section 14.1)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 315,
        primaryEndpoint:
          'Change from baseline in Children’s Depression Rating Scale-Revised total score over 8 to 9 weeks, ages 8 to 18',
        endpointMet: true,
        statisticalPValue:
          'Both studies independently produced a statistically significantly greater mean change than placebo; subgroup analyses showed no differential responsiveness by age or gender',
        unreportedAdverseSignals:
          'Across the three paediatric studies (N=418 randomised), mania or hypomania occurred in 6 of 228 on fluoxetine (2.6%) against 0 of 190 on placebo. In the 19-week study, treated subjects gained 1.1 cm less in height and 1.1 kg less in weight than placebo.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Relapse-prevention randomised withdrawal trial (NDA 018936, section 14.1)',
        phase: 'Phase 3, randomised withdrawal, double-blind, placebo-controlled',
        sampleSize: 298,
        primaryEndpoint:
          'Relapse over 38 weeks after randomisation, in outpatients who had responded to 12 weeks of open-label fluoxetine 20 mg/day',
        endpointMet: true,
        statisticalPValue:
          'Statistically significantly lower relapse rate on continued fluoxetine than on placebo at 38 weeks (50 weeks total)',
        unreportedAdverseSignals:
          'A randomised-withdrawal design enriches for responders and cannot distinguish relapse prevention from withdrawal effects in the placebo arm. Fluoxetine’s long half-life blunts that confound relative to shorter-acting drugs but does not remove it.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Twelve-week response 60.6% on fluoxetine against 34.8% on placebo, and 71.0% for fluoxetine plus cognitive behavioural therapy, in 439 adolescents (TADS)',
        'Statistically significant improvement over placebo on the Hamilton scale in 5- and 6-week adult trials and on the CDRS-R in two paediatric trials totalling 315 patients',
        'A lower relapse rate on continued fluoxetine than on placebo over 38 further weeks in 298 responders',
        'Fewer dropouts than placebo across the network meta-analysis — one of only two of 21 antidepressants with that result (OR 0.88, 95% CrI 0.80 to 0.96)',
        '14 additional cases of suicidal thinking or behaviour per 1,000 patients under 18, from pooled FDA data on 24 trials',
        '1.1 cm less height gain and 1.1 kg less weight gain than placebo over 19 weeks in paediatric patients',
      ],
      unsupportedInferences: [
        'That depression is caused by a serotonin deficiency and this drug corrects it — a claim absent from every version of the label, whose section 12.1 says the mechanism is unknown',
        'That blocking the transporter is what produces the clinical effect, when the block is complete in days and the effect takes weeks',
        'That the average benefit seen in licensing trials is clinically meaningful across the whole severity range, which the FDA-data meta-analysis found only at the upper end of very severe depression',
        'That the class-level paediatric suicidality signal applies equally to every drug in it, when the label states there was considerable variation among drugs',
      ],
      whatFailedInitially: [
        'Twenty-three of 74 FDA-registered antidepressant trials, covering 3,449 participants, were never published; fluoxetine is among the 12 agents in that audit',
        'A boxed warning for suicidal thinking and behaviour in under-25s was added only after the regulator compelled disclosure of unpublished paediatric data',
        'In head-to-head comparisons in the 2018 network meta-analysis, fluoxetine sat in the least efficacious group of the 21 drugs assessed',
        'Paediatric safety has never been systematically assessed beyond several months, and no study evaluates longer-term effects on growth and maturation',
      ],
      realWorldOutcome: [
        'Approved in the United States on 29 December 1987 under NDA 018936; generic since August 2001 and now about five United States cents a capsule at pharmacy acquisition cost',
        'The only serotonin reuptake inhibitor with a United States paediatric major depressive disorder indication, from age eight',
        'Its long half-life makes it the member of the class least associated with discontinuation symptoms, and the one whose drug interactions persist longest after stopping',
        'On the WHO Model List of Essential Medicines, and one of the most-dispensed prescription drugs in the United States',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, tablet and oral solution at 10, 20, 40 and 60 mg, once daily; a 90 mg delayed-release capsule is licensed for once-weekly dosing in maintenance treatment of depression',
      description:
        'Absorbed with or without food; peak plasma concentrations of 15 to 55 ng/mL at 6 to 8 hours after a single 40 mg dose. About 94.5% protein-bound. Metabolism is not proportional to dose, so plasma concentrations on chronic dosing run higher than single-dose studies predict; norfluoxetine, by contrast, is linear. Because the parent has a 4- to 6-day half-life on chronic dosing and norfluoxetine 4 to 16 days, dose changes are not fully reflected in plasma for weeks in either direction.',
      safetyProfile:
        'Boxed warning for increased suicidal thinking and behaviour in children, adolescents and young adults; not approved below age seven. Contraindicated with monoamine oxidase inhibitors, pimozide and thioridazine, and the long half-life makes the required washout run in weeks. Serotonin syndrome risk rises with triptans, tricyclics, fentanyl, lithium, tramadol, tryptophan, buspirone, amphetamines and St John’s Wort. Also labelled for allergic reactions and rash, activation of mania or hypomania, seizures, significant weight loss, abnormal bleeding with NSAIDs, aspirin or anticoagulants, angle-closure glaucoma, hyponatremia with SIADH, anxiety and insomnia, and QT prolongation with reports of torsades de pointes.',
    },
    commonQuestions: [
      {
        q: 'Does this correct a chemical imbalance in my brain?',
        a: 'The label does not say so, and never has. Section 12.1 reads: "Although the exact mechanism of fluoxetine is unknown, it is presumed to be linked to its inhibition of CNS neuronal uptake of serotonin." What is established is that the drug blocks the serotonin transporter and that, in trials, average depression scores fall further on it than on placebo. What is not established is that depressed people have low serotonin. A 2022 umbrella review pulled together 17 systematic reviews, meta-analyses and large data-set analyses covering serotonin metabolite concentrations, receptor and transporter binding, tryptophan depletion and transporter genetics, and found no consistent evidence for that association — and evidence that lowered plasma serotonin tracked antidepressant use rather than depression.',
        auditNote:
          'A drug can work without the popular explanation of how it works being true. Aspirin was used for seventy years before anyone identified cyclooxygenase. The problem is not the gap, it is that the explanation was presented to the public as established when the label always said it was presumed.',
      },
      {
        q: 'How much better than placebo is it, really?',
        a: 'It depends on who is asking and how depressed they are. In the adolescent TADS trial, 60.6% responded on fluoxetine and 34.8% on placebo — a real and reasonably large gap. In the pooled adult licensing data, the meta-analysis by Kirsch and colleagues found the drug-placebo difference grew with baseline severity but reached conventional criteria for clinical significance only at the upper end of the very severely depressed range, and that the gradient came from placebo response falling in severe depression rather than from drug response rising. Separately, a third of the FDA-registered antidepressant trials were never published, and the published set overstated effect sizes by about a third overall. All three of those findings are about the same drugs.',
      },
      {
        q: 'Why did they tell me to wait six weeks?',
        a: 'Because that is what the trials measured, and because the pharmacology and the clinical effect are on completely different clocks. The serotonin transporter is essentially fully blocked within days. Separation from placebo on a rating scale takes four to six weeks. Nobody has established what fills that gap; the leading candidates — autoreceptor desensitisation, downstream changes in synaptic plasticity — are hypotheses that the prescribing information does not endorse. There is also a practical reason specific to this drug: its half-life is long enough that steady-state blood levels are not reached for four to five weeks anyway.',
      },
      {
        q: 'Is fluoxetine safe for my teenager?',
        a: 'It is the only drug in its class licensed in the United States for depression in children from age eight, because it is the one with two positive paediatric trials. It also carries a boxed warning: the FDA’s pooling of 24 short-term trials in over 4,400 under-18s found 14 additional cases of suicidal thinking or behaviour per 1,000 treated. No suicides occurred in any of those trials. In TADS, suicidal thinking improved in all four arms and improved most in the arm combining fluoxetine with therapy. The label also records that treated children gained 1.1 cm less in height and 1.1 kg less in weight than placebo over 19 weeks, and that nothing longer than several months has been systematically studied.',
        auditNote:
          'Both statements are true at once: this is the drug with the best paediatric evidence in its class, and its paediatric evidence includes a measured harm signal and a measured growth difference. A page that reports only one of those is not reporting the trial.',
      },
      {
        q: 'Is it hard to come off?',
        a: 'Less so than the other drugs in its class, for a reason that has nothing to do with how good it is: it takes weeks to leave the body. The parent drug has an elimination half-life of 4 to 6 days on chronic dosing and its active metabolite norfluoxetine 4 to 16 days, so stopping it produces a gradual self-taper that shorter-acting drugs like paroxetine and venlafaxine do not. The same property has a cost: dose changes take weeks to show up in blood levels in either direction, and the CYP2D6 interactions — with tamoxifen, codeine and several beta-blockers — persist for weeks after the last capsule. How and whether to stop is a clinical decision, not one this page can make.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Fluoxetine United States prescribing information — Boxed Warning, Indications 1, Warnings and Precautions 5.1 to 5.16, Pediatric Use 8.4, Clinical Pharmacology 12.1 to 12.3, Clinical Studies 14.1 (NDA 018936)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018936',
        kind: 'regulatory',
      },
      {
        label:
          'March J, Silva S, Petrycki S, et al. Fluoxetine, cognitive-behavioral therapy, and their combination for adolescents with depression: Treatment for Adolescents With Depression Study (TADS) randomized controlled trial. JAMA 2004;292:807-820',
        identifier: '10.1001/jama.292.7.807',
        kind: 'doi',
      },
      {
        label: 'Treatment for Adolescents With Depression Study (TADS) registry record',
        identifier: 'NCT00006286',
        kind: 'nct',
      },
      PUBLICATION_BIAS_SOURCE,
      {
        label:
          'Kirsch I, Deacon BJ, Huedo-Medina TB, Scoboria A, Moore TJ, Johnson BT. Initial severity and antidepressant benefits: a meta-analysis of data submitted to the Food and Drug Administration. PLoS Med 2008;5:e45',
        identifier: '10.1371/journal.pmed.0050045',
        kind: 'doi',
      },
      SEROTONIN_UMBRELLA_SOURCE,
      NETWORK_META_SOURCE,
      {
        label:
          'Linde K, Berner MM, Kriston L. St John’s wort for major depression. Cochrane Database Syst Rev 2008;(4):CD000448',
        identifier: '10.1002/14651858.CD000448.pub3',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — fluoxetine, 152 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 3386 — fluoxetine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3386',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Citalopram — the drug whose maximum dose was cut on safety grounds to a level at which the
  //    pivotal trial found no clear effect for the strength most older patients are now capped at.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'citalopram',
    name: 'Citalopram',
    tradeName: 'Celexa',
    sponsor:
      'AbbVie (through the Allergan and Forest Laboratories line, NDA 020822); discovered at H. Lundbeck A/S in Denmark and licensed to Forest for the United States',
    targetGene: 'SLC6A4',
    targetProtein:
      'Serotonin transporter (SERT, 5-HTT); the label records no or very low affinity for 5-HT1A, 5-HT2A, dopamine D1 and D2, alpha-1, alpha-2, beta-adrenergic, histamine H1, GABA, muscarinic and benzodiazepine receptors',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1998,
    indication: 'Treatment of major depressive disorder in adults',
    patientFriendlyIndication: 'Depression',
    anatomicalSite:
      'Serotonin transporter on presynaptic terminals in the central nervous system; the dose-limiting effect is on the cardiac potassium channel that shapes ventricular repolarisation',
    conditionContext: {
      conditionExplainer:
        'Major depressive disorder has no laboratory test. It is defined by a symptom checklist and measured in trials by a clinician-rated questionnaire, most often the 17-item Hamilton scale, which runs from 0 to 52.',
      whyItMatters:
        'Citalopram is the drug whose licensed dose range was cut after approval because of a heart-rhythm effect. That left a specific and under-discussed problem: the strength that is now the ceiling for everyone over 60 is the strength at which the pivotal fixed-dose trial found no clear effect.',
      whoTakesThis:
        'Adults with major depressive disorder. It is not approved for anyone under 18, and the label footnotes that fact directly under its paediatric safety table. It should be avoided in congenital long QT syndrome, bradycardia, uncorrected hypokalaemia or hypomagnesaemia, recent myocardial infarction and uncompensated heart failure.',
      clinicalGoals:
        'A fall in the Hamilton score, and in the two long-term studies a lower rate of relapse among people who had already responded. No trial of this drug measured mortality or any other hard endpoint.',
    },
    oneSentenceVerdict:
      'A serotonin reuptake inhibitor whose maximum dose was cut from 60 mg to 40 mg after a thorough QT study found individually corrected QTc rising 8.5 msec at 20 mg and 18.5 msec at 60 mg — leaving 20 mg, a dose its own pivotal fixed-dose trial found to have "no clear effect", as the permitted ceiling for everyone over 60, everyone with liver impairment and every CYP2C19 poor metaboliser.',
    laymanHowItWorks:
      'Nerve cells that signal with serotonin recapture most of it through a transporter protein straight after releasing it. Citalopram blocks that transporter, so serotonin lingers in the gap between cells. It does this very selectively — the label records essentially no affinity for the dozen other receptors that give older antidepressants their side effects. At higher blood levels it also slows one of the potassium currents that resets the heart’s electrical rhythm, which is why its dose has a hard ceiling.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0290 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 50 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 17 July 1998 under NDA 020822 and generic since 2004. Its single-enantiomer successor escitalopram was launched in 2002, two years before the racemate went generic, and is the same molecule minus the R-enantiomer. Citalopram now costs about three United States cents a tablet at pharmacy acquisition cost; vortioxetine, a branded serotonin modulator licensed for the same indication, is listed on the same survey at US$17.21 per tablet.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The most-discussed alternative to citalopram is half of citalopram. Escitalopram is the S-enantiomer of the same racemate, brought to market in 2002 while the parent was still under patent, and it does not carry the same dose ceiling. Beyond that the choice is between molecules the 2018 network meta-analysis found to differ from one another by less than most prescribers assume, and the price range across the class spans nearly three orders of magnitude.',
      conventionalRx: [
        {
          name: 'Escitalopram (Lexapro)',
          class:
            'Selective serotonin reuptake inhibitor — the S-enantiomer of the citalopram racemate',
          howItCompares:
            'Chemically it is citalopram with the inactive half removed, launched two years before the racemate went generic. It was one of seven drugs that outperformed the others in the head-to-head arm of the 2018 network meta-analysis (range of odds ratios 1.19 to 1.96) and one of six rated most tolerable, which citalopram was also. It carries its own dose-dependent QT signal but not citalopram’s 40 mg cap.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: no 40 mg ceiling; strong placement on both axes of the largest comparative analysis. Cons: the claim that it is meaningfully better than the racemate rests on comparisons largely funded by the company that sold both; the pharmacological difference is the removal of an enantiomer with little transporter activity.',
        },
        {
          name: 'Sertraline (Zoloft)',
          class: 'Selective serotonin reuptake inhibitor',
          howItCompares:
            'The same target with no QT dose cap and no CYP2C19-driven dose restriction. In the 2018 network meta-analysis sertraline sat in the more tolerable group alongside citalopram and escitalopram; on efficacy the head-to-head differences across the whole class were small with wide credible intervals.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: no dose ceiling on cardiac grounds; fewer interactions in older people on multiple drugs. Cons: more early gastrointestinal upset; shares the class discontinuation problem, which citalopram also has.',
        },
        {
          name: 'Vortioxetine (Trintellix)',
          class: 'Serotonin reuptake inhibitor with additional 5-HT receptor activity',
          howItCompares:
            'A branded molecule licensed for the same single indication as citalopram. On the same CMS acquisition-cost survey it lists at US$17.21 per tablet against citalopram’s US$0.0290 — a factor of about 590 for a drug that was not shown to be more effective than the comparators in the head-to-head half of the 2018 network meta-analysis, where its efficacy odds ratios overlapped those of escitalopram, paroxetine and mirtazapine.',
          typicalCost:
            'US$17.21 per tablet at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: a different receptor profile, and one of the drugs rated both more effective and more tolerable in head-to-head comparisons. Cons: the price difference is not matched by a demonstrated outcome difference, and the certainty of evidence across that entire analysis was rated moderate to very low.',
        },
      ],
      naturalFoods: [
        {
          name: 'St John’s wort (Hypericum perforatum) extract',
          activeCompound: 'Hyperforin and hypericin, in standardised extracts',
          biologicalMechanism:
            'Hyperforin inhibits monoamine reuptake in vitro by a mechanism unlike transporter blockade, and hypericum strongly induces CYP3A4 and P-glycoprotein, which is why it lowers the blood levels of many unrelated drugs.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice, and not to be combined with citalopram: the label names serotonin syndrome as a risk when serotonergic agents are combined. For scale only: the 2008 Cochrane review of 29 trials in 5,489 patients found a response rate ratio against placebo of 1.28 (95% CI 1.10 to 1.49) in the nine larger trials, and no difference against SSRIs across 12 trials (RR 1.00, 95% CI 0.90 to 1.11).',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask whether your heart tracing was checked',
          action:
            'Mention any family history of sudden death or long QT, and any other drug on the list that prolongs the QT interval.',
          patientImpact:
            'The label directs avoiding citalopram in congenital long QT syndrome, bradycardia, hypokalaemia, hypomagnesaemia, recent myocardial infarction and uncompensated heart failure, and in anyone taking another QT-prolonging drug — naming class 1A and class III antiarrhythmics, chlorpromazine, thioridazine, gatifloxacin, moxifloxacin, pentamidine, levomethadyl and methadone.',
          clinicalPrecaution:
            'It directs discontinuation in anyone with persistent QTc above 500 msec, and baseline plus periodic potassium and magnesium measurement in those at risk of electrolyte disturbance.',
        },
        {
          name: 'Say if you are over 60 or have liver trouble',
          action:
            'These are not general cautions on this drug — they change the licensed maximum dose.',
          patientImpact:
            'The maximum recommended dosage falls from 40 mg to 20 mg once daily in patients over 60 years of age, in hepatic impairment, in CYP2C19 poor metabolisers, and with concomitant cimetidine or another CYP2C19 inhibitor, because all four produce higher citalopram exposure.',
          clinicalPrecaution:
            'The pivotal fixed-dose trial described in section 14 of the label found no clear effect of the 10 mg and 20 mg daily doses. The dose cap and the demonstrated-efficacy range do not overlap for these groups.',
        },
        {
          name: 'Do not stop it suddenly',
          action: 'The label says to reduce the dosage gradually rather than stop.',
          patientImpact:
            'Sections 2.4 and 5.6 direct gradual dose reduction on discontinuation. Citalopram has a shorter half-life than fluoxetine and no long-lived active metabolite, so it does not self-taper.',
          clinicalPrecaution:
            'How to reduce it is a clinical decision that depends on how long the drug has been taken and at what dose. This page does not give a schedule.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(C)CCCC1(C2=C(CO1)C=C(C=C2)C#N)C3=CC=C(C=C3)F',
      chemicalFormula: 'C20H21FN2O',
      molecularWeight: '324.40 g/mol (free base); dispensed as the hydrobromide',
      targetReceptorAffinity:
        'A racemate of S- and R-citalopram, of which essentially all serotonin transporter inhibition resides in the S-enantiomer — the basis on which escitalopram was subsequently marketed as a separate product. The label states citalopram is a selective serotonin reuptake inhibitor with minimal effect on noradrenaline and dopamine reuptake, and no or very low affinity for 5-HT1A, 5-HT2A, dopamine D1 and D2, alpha-1, alpha-2 and beta-adrenergic, histamine H1, GABA, muscarinic cholinergic and benzodiazepine receptors. Metabolism is by CYP2C19 and CYP3A4, which is why CYP2C19 poor metabolisers are dose-capped.',
      structureSource: {
        label:
          'PubChem CID 2771 (citalopram) — canonical SMILES, molecular formula and weight, as carried on the enriched record; receptor-affinity and metaboliser statements from the citalopram United States prescribing information, sections 12.2 and 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2771',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cit-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Establish the enantiomeric ratio as a release specification',
          description:
            'Citalopram is a 50:50 racemate in which one enantiomer carries essentially all the transporter activity. That makes the enantiomeric ratio a potency specification and not a purity nicety: a batch drifting toward the R-enantiomer is a weaker drug that a total-content assay would pass. The same fact is the entire pharmacological basis for escitalopram existing as a separate product.',
          reagentsAndBuffer:
            'Citalopram hydrobromide reference standard, chiral HPLC on a cellulose tris(3,5-dimethylphenylcarbamate) phase, 19F NMR for the fluorophenyl group, infrared confirmation of the nitrile stretch near 2225 cm-1, Karl Fischer titration',
        },
        {
          id: 'cit-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Close the isobenzofuran ring onto a quaternary carbon',
          description:
            'The core is a 1,3-dihydroisobenzofuran bearing a nitrile on the aromatic ring and, at position 1, both a 4-fluorophenyl group and a dimethylaminopropyl chain. That position-1 carbon is quaternary and stereogenic, and forming it is the step that fixes the racemic outcome: a non-stereoselective ring closure gives both enantiomers in equal amounts.',
          dependsOnStepId: 'cit-w1',
          reagentsAndBuffer:
            '5-Cyanophthalide, 4-fluorophenyl magnesium bromide and 3-(dimethylamino)propyl magnesium chloride as sequential Grignard reagents, acid-catalysed ring closure, anhydrous tetrahydrofuran under nitrogen',
        },
        {
          id: 'cit-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Form the hydrobromide and control the des-methyl impurity',
          description:
            'The marketed salt is the hydrobromide. The impurity that matters is desmethylcitalopram, which is also the principal human metabolite, so its limit is set on pharmacological as well as chemical grounds. Where a single enantiomer is the target, this is instead the diastereomeric-salt resolution step that separates S- from R-citalopram.',
          dependsOnStepId: 'cit-w2',
          reagentsAndBuffer:
            'Hydrogen bromide in an alcoholic solvent, recrystallisation, HPLC release testing against desmethyl- and didesmethylcitalopram limits; (+)-di-p-toluoyl-D-tartaric acid where enantiomeric resolution is performed',
        },
        {
          id: 'cit-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Screen the cardiac potassium channel alongside the transporter',
          description:
            'For this molecule the off-target assay is not optional. The dose ceiling on the label exists because of an effect on ventricular repolarisation, and that effect is measurable in a cell line long before it appears on a human electrocardiogram. Running hERG in parallel with the transporter assay is what turns a dose-limiting toxicity into a number rather than a postmarketing report.',
          dependsOnStepId: 'cit-w3',
          reagentsAndBuffer:
            'HEK293 cells stably expressing human SLC6A4 for tritiated serotonin uptake, and HEK293 cells expressing hERG (KCNH2) for automated patch-clamp; both citalopram and desmethylcitalopram as separate test articles',
        },
        {
          id: 'cit-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Tie plasma exposure to individually corrected QTc',
          description:
            'The label’s dose restrictions all derive from one exposure-response model built from a thorough QT study in 119 healthy subjects. Reproducing that logic means measuring drug concentration and QTcNi in the same subjects at the same times, with a positive control, rather than inferring a heart effect from a dose.',
          dependsOnStepId: 'cit-w4',
          reagentsAndBuffer:
            'Liquid chromatography-tandem mass spectrometry for citalopram and desmethylcitalopram with deuterated internal standards, time-matched digital 12-lead electrocardiography with individual QT-RR correction, moxifloxacin 400 mg as the positive control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cit-a1',
        category: 'conclusion_shift',
        title: 'The licensed maximum dose was cut after thirteen years on the market',
        laymanSummary:
          'Citalopram was licensed up to 60 mg. In 2011 the ceiling came down to 40 mg because a proper heart-rhythm study showed the effect grew with the dose — and to 20 mg for anyone over 60, anyone with liver impairment and anyone who clears the drug slowly.',
        technicalDetails:
          'A randomised, placebo- and active-controlled (moxifloxacin 400 mg) cross-over escalating multiple-dose study in 119 healthy subjects measured individually corrected QTc. The maximum mean difference from placebo, with the upper bound of the 95% one-sided confidence interval in brackets, was 8.5 (10.8) msec at 20 mg and 18.5 (21.0) msec at 60 mg. From the established exposure-response relationship the predicted change at the Cmax for 40 mg is 12.6 (14.3) msec. Section 5.2 now states that citalopram should not be given above 40 mg once daily, and section 2.3 caps the dose at 20 mg once daily in patients over 60, in hepatic impairment and in CYP2C19 poor metabolisers, with section 2.4 extending the same cap to concomitant CYP2C19 inhibitors. Torsade de pointes, ventricular tachycardia and sudden death appear in the postmarketing section. The drug was approved in 1998; the restriction arrived in 2011.',
        evidenceSource:
          'Citalopram United States prescribing information, sections 2.1 to 2.4, 5.2 and 12.2 Cardiac Electrophysiology (NDA 020822)',
        measuredMetric:
          'Individually corrected QTc change from placebo at 20 mg and 60 mg in 119 healthy subjects, and the licensed dose ceiling before and after 2011',
        auditFlag: 'caution',
      },
      {
        id: 'cit-a2',
        category: 'failed',
        title:
          'The dose older patients are capped at is the dose the pivotal trial could not show worked',
        laymanSummary:
          'The fixed-dose registration trial tested 10, 20, 40 and 60 mg. It found no clear effect at 10 mg or 20 mg. Twenty milligrams is now the maximum permitted dose for everyone over 60.',
        technicalDetails:
          'Section 14 of the label describes Study 1, a six-week fixed-dose trial at 10, 20, 40 and 60 mg daily with the Hamilton total score as the primary endpoint. It reports that citalopram 40 mg and 60 mg daily were effective, that the study "showed no clear effect of the 10 mg and 20 mg daily doses", and that 60 mg was not more effective than 40 mg. Sixty milligrams is now prohibited on cardiac grounds; forty is the ceiling for the general adult population and twenty is the ceiling for patients over 60, patients with hepatic impairment, CYP2C19 poor metabolisers and anyone taking a CYP2C19 inhibitor. For those four groups the label’s own efficacy evidence and its own dose restriction do not overlap. The usual defence is that older and slow-metabolising patients reach the same plasma concentration at half the dose, which is a pharmacokinetic argument rather than a demonstrated clinical one; no fixed-dose efficacy trial at 20 mg in an over-60 population is described anywhere on the document.',
        evidenceSource:
          'Citalopram United States prescribing information, sections 2.3, 5.2 and 14 Clinical Studies (NDA 020822)',
        measuredMetric:
          'Doses shown effective in the pivotal fixed-dose trial against the doses permitted by the current label, by patient group',
        auditFlag: 'caution',
      },
      {
        id: 'cit-a3',
        category: 'failed',
        title: 'Three of the five placebo-controlled trials on the label were negative',
        laymanSummary:
          'The label describes five short placebo-controlled trials in depression. Two supported approval. In the other three, the difference between citalopram and placebo was not statistically significant.',
        technicalDetails:
          'Section 14 states that efficacy was established in two placebo-controlled studies of four to six weeks in adult outpatients — the fixed-dose Study 1 and the flexible-dose Study 2, in which the dose was titrated to a maximum of 80 mg daily, twice the currently permitted maximum. It then states: "In three additional placebo-controlled trials in patients with MDD, the difference in response to treatment between patients receiving citalopram and patients receiving placebo was not statistically significant." A two-in-five success rate on the licensing document itself is the concrete form of what the Turner analysis found across the class, where the FDA judged 51% of registered trials positive while the published literature implied 94%.',
        evidenceSource:
          'Citalopram United States prescribing information, section 14 Clinical Studies (NDA 020822); Turner EH et al., N Engl J Med 2008;358:252-260',
        doi: '10.1056/NEJMsa065779',
        measuredMetric:
          'Number of placebo-controlled major depressive disorder trials on the label reaching statistical significance',
        auditFlag: 'caution',
      },
      {
        id: 'cit-a4',
        category: 'measured',
        title: 'STAR*D level 1: 28% remitted, at a mean dose now above the ceiling',
        laymanSummary:
          'The largest real-world trial of this drug treated 2,876 outpatients with citalopram for up to fourteen weeks. Twenty-eight per cent reached remission on the blinded scale. The average dose people ended on was 41.8 mg a day — a strength the label no longer permits.',
        technicalDetails:
          'STAR*D (NCT00021528) enrolled outpatients with major depressive disorder across 23 psychiatric and 18 primary care settings and treated them with flexible-dose citalopram under measurement-based care for up to 14 weeks. Nearly 80% of the 2,876 analysed patients had chronic or recurrent depression and most had comorbid medical or psychiatric conditions. The mean exit dose was 41.8 mg/day. Remission was 28% on the 17-item Hamilton scale (the protocol’s primary outcome) and 33% on the self-report QIDS-SR; response was 47%. Remission and response did not differ between primary and psychiatric care settings, and a substantial proportion of those who responded or remitted did so at or after eight weeks. The mean exit dose sits above the 40 mg maximum imposed in 2011 and well above the 20 mg ceiling that now applies to patients over 60, so the best effectiveness data this drug has were generated under a dosing regime its current label prohibits.',
        evidenceSource: 'Trivedi MH, Rush AJ, Wisniewski SR, et al. Am J Psychiatry 2006;163:28-40',
        doi: '10.1176/appi.ajp.163.1.28',
        measuredMetric:
          'Remission rate on the 17-item Hamilton scale after up to 14 weeks of open citalopram in 2,876 real-world outpatients',
        auditFlag: 'verified',
      },
      {
        id: 'cit-a5',
        category: 'conclusion_shift',
        title: 'The famous 67% figure became 35% when the protocol was followed',
        laymanSummary:
          'STAR*D is quoted for the claim that two thirds of people eventually get better with enough antidepressant trials. A 2023 reanalysis of the same patient-level data, following the study’s own protocol, put the cumulative remission rate at 35%.',
        technicalDetails:
          'Pigott and colleagues reanalysed the STAR*D patient-level data set with fidelity to the original research protocol, which specified the blinded 17-item Hamilton scale as the primary outcome and explicitly excluded non-blinded clinic-administered assessments from use as research outcomes. They found that the investigators had reported cumulative remission using a non-blinded clinic-administered measure instead, and had included 99 patients who scored as remitted on the Hamilton scale at study outset and 125 who scored as remitted when starting their next-level treatment. Applying the protocol-stipulated outcome and inclusion criteria gave a cumulative remission rate of 35.0% after up to four treatment trials, against the 67% originally reported — approximately half. The reanalysis has been contested in the same literature and the dispute is part of the record; what is not in dispute is which outcome measure the protocol specified.',
        evidenceSource: 'Pigott HE, Kim T, Xu C, Kirsch I, Amsterdam J. BMJ Open 2023;13:e063095',
        doi: '10.1136/bmjopen-2022-063095',
        measuredMetric:
          'Cumulative remission after up to four antidepressant trials, protocol-stipulated blinded Hamilton scale against the originally published figure',
        auditFlag: 'contested',
      },
      {
        id: 'cit-a6',
        category: 'failed',
        title: 'A guilty plea over promoting it for children it was never approved for',
        laymanSummary:
          'Citalopram has never been licensed for anyone under 18. In 2010 its United States marketer pleaded guilty to criminal charges that included illegally promoting it for depression in children and adolescents, and paid more than $313 million.',
        technicalDetails:
          'The United States Department of Justice announced in September 2010 that Forest Pharmaceuticals, a subsidiary of Forest Laboratories, agreed to plead guilty to charges relating to obstruction of justice, distribution of the unapproved new drug Levothroid, and illegal promotion of Celexa for use in treating children and adolescents with depression, and to pay more than $313 million to resolve criminal and civil liability, including a $150 million criminal fine and $14 million in forfeited assets. The government alleged that sales representatives were directed to promote paediatric use in calls to physicians and that speakers were hired to address paediatric specialists. The label carries no paediatric indication and footnotes its own suicidality table with "Citalopram is not approved for use in pediatric patients", directly beneath the row recording 14 additional patients with suicidal thoughts or behaviours per 1,000 treated under age 18.',
        evidenceSource:
          'United States Department of Justice, Office of Public Affairs press release, 15 September 2010; citalopram United States prescribing information, section 5.1 Table 1 (NDA 020822)',
        measuredMetric:
          'Criminal and civil resolution amount, and the paediatric indication status on the label',
        auditFlag: 'caution',
      },
      {
        id: 'cit-a7',
        category: 'inferred',
        title: 'Selective for the transporter, silent on why that helps',
        laymanSummary:
          'The label documents in unusual detail what citalopram does not bind — a dozen receptor families, at no or very low affinity. It says nothing about why blocking the one receptor it does bind should lift mood.',
        technicalDetails:
          'Section 12.2 states that in vitro and in vivo animal studies suggest citalopram is a selective serotonin reuptake inhibitor with minimal effects on noradrenaline and dopamine reuptake, and that it has no or very low affinity for 5-HT1A, 5-HT2A, dopamine D1 and D2, alpha-1, alpha-2 and beta-adrenergic, histamine H1, GABA, muscarinic cholinergic and benzodiazepine receptors. That selectivity is a genuine tolerability advantage over the tricyclics and it is not an explanation. The 2022 umbrella review of the serotonin theory synthesised 17 reviews and large data-set analyses — serotonin and 5-HIAA concentrations, 5-HT1A receptor binding, transporter binding by imaging and post-mortem, tryptophan depletion, transporter gene associations and gene-environment interactions — and reported no consistent evidence that depression is associated with lowered serotonin concentration or activity, alongside evidence that lowered plasma serotonin was associated with antidepressant use.',
        evidenceSource:
          'Citalopram United States prescribing information, section 12.2 (NDA 020822); Moncrieff J et al., Mol Psychiatry 2023;28:3243-3256',
        doi: '10.1038/s41380-022-01661-0',
        inferredClaim:
          'That selective serotonin transporter blockade corrects an underlying serotonergic abnormality in depression — an inference the label does not make and the umbrella review of the evidence does not support',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One tablet, two mirror-image halves',
        laymanDesc:
          'Citalopram is an equal mixture of two mirror-image forms. Only one of them meaningfully blocks the serotonin pump. The other half is why escitalopram exists as a separate product.',
        molecularDetail:
          'A racemate of S- and R-citalopram in which transporter inhibition resides essentially entirely in the S-enantiomer. Escitalopram, launched in 2002 while citalopram was still on patent, is that enantiomer isolated. Absorption is unaffected by food and the drug is given once daily.',
        iconName: 'Split',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Cleared by an enzyme not everyone has',
        laymanDesc:
          'The liver breaks it down using an enzyme that a minority of people have little of. Those people build up higher levels, which is why the label caps their dose.',
        molecularDetail:
          'Metabolism is principally by CYP2C19 with a contribution from CYP3A4, to desmethylcitalopram and didesmethylcitalopram. CYP2C19 poor metabolisers, patients over 60, patients with hepatic impairment and patients taking cimetidine or another CYP2C19 inhibitor all reach higher exposures, and the label limits all four groups to 20 mg once daily on that basis.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The serotonin pump is blocked, and very little else is',
        laymanDesc:
          'It plugs the transporter that recycles serotonin. Unlike the older antidepressants it barely touches the receptors responsible for dry mouth, blurred vision and sedation.',
        molecularDetail:
          'Selective inhibition of SLC6A4 with minimal effect on noradrenaline and dopamine reuptake. The label records no or very low affinity for 5-HT1A, 5-HT2A, D1, D2, alpha-1, alpha-2, beta-adrenergic, H1, GABA, muscarinic cholinergic and benzodiazepine receptors — the pharmacological reason the class displaced the tricyclics on tolerability rather than on efficacy.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'At higher levels, the heart’s reset current slows',
        laymanDesc:
          'The same molecule slows one of the electrical currents that resets the heart between beats. The effect grows with the dose, and that is what sets the ceiling.',
        molecularDetail:
          'Dose-dependent prolongation of the individually corrected QT interval: 8.5 (upper bound 10.8) msec at 20 mg and 18.5 (21.0) msec at 60 mg in 119 healthy subjects, with 12.6 (14.3) msec predicted at the Cmax for 40 mg. Torsade de pointes, ventricular tachycardia and sudden death appear in postmarketing reports. The label directs discontinuation at a persistent QTc above 500 msec.',
        iconName: 'HeartPulse',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'A Hamilton score falls, in some trials',
        laymanDesc:
          'What was measured was a questionnaire score over four to six weeks. Two of the five placebo-controlled trials on the label found a significant difference; three did not.',
        molecularDetail:
          'Efficacy was established in two of five placebo-controlled trials described in section 14. In the fixed-dose study, 40 mg and 60 mg were effective and 10 mg and 20 mg showed no clear effect. In real-world use, STAR*D level 1 gave 28% remission on the blinded Hamilton scale in 2,876 outpatients at a mean exit dose of 41.8 mg/day.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What has never been measured',
        laymanDesc:
          'No trial of this drug measured deaths or any other hard outcome, and no fixed-dose efficacy trial exists at 20 mg in the over-60s who are capped there.',
        molecularDetail:
          'The registration programme measured rating scales over four to six weeks and relapse in two randomised-withdrawal studies. There is no mortality endpoint, no cardiovascular outcome trial despite a labelled cardiac effect, and no efficacy study at the restricted 20 mg ceiling in the populations to whom that ceiling applies.',
        iconName: 'AlertCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Study 1 — six-week fixed-dose registration trial (NDA 020822, section 14)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, fixed-dose',
        sampleSize: 0,
        primaryEndpoint:
          'Hamilton Depression Rating Scale total score at six weeks, at fixed doses of 10, 20, 40 and 60 mg daily',
        endpointMet: true,
        statisticalPValue:
          'Citalopram 40 mg and 60 mg daily effective on the Hamilton total score; no clear effect of the 10 mg and 20 mg daily doses; 60 mg not more effective than 40 mg',
        unreportedAdverseSignals:
          'The 60 mg arm that contributed to the positive result is now prohibited on cardiac grounds, and the 20 mg dose that showed no clear effect is now the maximum permitted in patients over 60, in hepatic impairment and in CYP2C19 poor metabolisers. Section 14 does not state the randomised sample size, so none is asserted here.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Thorough QT study (NDA 020822, section 12.2 Cardiac Electrophysiology)',
        phase:
          'Randomised, placebo- and active-controlled (moxifloxacin 400 mg) cross-over, escalating multiple-dose',
        sampleSize: 119,
        primaryEndpoint:
          'Maximum mean difference from placebo in individually corrected QTc (QTcNi) at 20 mg and 60 mg in healthy subjects',
        endpointMet: true,
        statisticalPValue:
          '8.5 msec (upper bound of the 95% one-sided CI 10.8) at 20 mg and 18.5 msec (21.0) at 60 mg; 12.6 msec (14.3) predicted at the Cmax for 40 mg',
        unreportedAdverseSignals:
          'This is the study that produced the 2011 dose restriction, thirteen years after approval. It measures an electrocardiographic interval in healthy volunteers, not arrhythmia in patients; torsade de pointes, ventricular tachycardia and sudden death come from postmarketing reports rather than from a controlled trial.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'STAR*D level 1 — NCT00021528 (Am J Psychiatry 2006;163:28-40)',
        phase: 'Open-label effectiveness study under measurement-based care, no placebo arm',
        sampleSize: 2876,
        primaryEndpoint:
          'Remission, defined as an exit score of 7 or below on the 17-item Hamilton Depression Rating Scale, after up to 14 weeks of flexible-dose citalopram',
        endpointMet: true,
        statisticalPValue:
          'Remission 28% (Hamilton) and 33% (QIDS-SR); response 47% (QIDS-SR); mean exit dose 41.8 mg/day',
        unreportedAdverseSignals:
          'There is no placebo arm, so the 28% cannot be read as a drug effect. The mean exit dose exceeds the maximum the label has permitted since 2011. A 2023 reanalysis with fidelity to the protocol found the multi-level cumulative remission rate to be 35.0% rather than the 67% originally reported.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Individually corrected QTc rising 8.5 msec at 20 mg and 18.5 msec at 60 mg against placebo in 119 healthy subjects',
        'Effectiveness at 40 mg and 60 mg on the Hamilton scale in the pivotal fixed-dose trial, with no clear effect at 10 mg or 20 mg',
        'Remission of 28% on the blinded Hamilton scale in 2,876 real-world outpatients treated for up to 14 weeks at a mean exit dose of 41.8 mg/day',
        'Cumulative remission across four STAR*D treatment levels of 35.0% when the protocol-stipulated blinded outcome and inclusion criteria are applied',
        '14 additional patients with suicidal thoughts or behaviours per 1,000 treated under age 18, from pooled trials of antidepressants',
      ],
      unsupportedInferences: [
        'That 20 mg daily is an effective antidepressant dose in patients over 60, in hepatic impairment or in CYP2C19 poor metabolisers — the groups the label caps there, and a dose its pivotal trial found had no clear effect',
        'That selective serotonin transporter blockade corrects a serotonergic abnormality in depression, which the 2022 umbrella review of that evidence does not support',
        'That STAR*D showed two thirds of patients eventually remit, when the protocol-stipulated analysis of the same data gives 35%',
        'That the tolerability advantage over the tricyclics — which is real and documented in the receptor-binding data — implies an efficacy advantage, which the network meta-analysis does not show',
      ],
      whatFailedInitially: [
        'Three of the five placebo-controlled major depressive disorder trials described on the label were not statistically significant',
        'The 60 mg dose used in the registration programme was withdrawn from the licensed range in 2011 on cardiac grounds',
        'A dose ceiling for the over-60s was imposed at a strength the pivotal fixed-dose trial found ineffective, with no efficacy trial run at that dose in that population',
        'Its United States marketer pleaded guilty in 2010 to charges including illegal promotion of the drug for children and adolescents, a population it has never been approved for',
      ],
      realWorldOutcome: [
        'Approved in the United States on 17 July 1998 under NDA 020822 and generic since 2004; about three United States cents a tablet at pharmacy acquisition cost',
        'Its single-enantiomer successor escitalopram reached the market in 2002, two years before the racemate lost protection',
        'A branded serotonin modulator licensed for the same indication lists at US$17.21 per tablet on the same acquisition-cost survey, roughly 590 times the price',
        'On the WHO Model List of Essential Medicines and among the most-dispensed antidepressants worldwide',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 10, 20 and 40 mg and oral solution at 10 mg/5 mL, once daily with or without food',
      description:
        'Absorption is unaffected by food. Metabolism is principally by CYP2C19 with a CYP3A4 contribution, and the resulting exposure differences drive the label’s population-specific dose ceilings rather than being footnotes to them. Discontinuation is directed to be gradual: there is no long-lived active metabolite to soften an abrupt stop.',
      safetyProfile:
        'Boxed warning for suicidal thoughts and behaviour in adolescents and young adults; not approved under 18. Dose-dependent QTc prolongation with reported torsade de pointes, ventricular tachycardia and sudden death — avoid in congenital long QT syndrome, bradycardia, hypokalaemia, hypomagnesaemia, recent myocardial infarction, uncompensated heart failure and with other QT-prolonging drugs; discontinue if QTc persists above 500 msec. Also labelled for serotonin syndrome, increased bleeding risk with aspirin, NSAIDs, other antiplatelets and anticoagulants, activation of mania or hypomania, seizures, angle-closure glaucoma, hyponatraemia with SIADH, and sexual dysfunction. Contraindicated with monoamine oxidase inhibitors, with a 14-day gap required in either direction.',
    },
    commonQuestions: [
      {
        q: 'Why is my dose capped at 20 mg when other people take 40?',
        a: 'Because of an exposure calculation, not a fresh trial. The label caps the dose at 20 mg once daily for anyone over 60, anyone with liver impairment, anyone who is a CYP2C19 poor metaboliser and anyone taking a CYP2C19 inhibitor — all groups that reach higher blood levels at the same dose, and therefore more of the QT effect. The uncomfortable part is that the pivotal fixed-dose trial described in the label’s own clinical studies section found no clear effect of the 20 mg dose, and no efficacy trial at 20 mg in an over-60 population appears anywhere on the document. The reasoning is that these patients get the same plasma concentration from half the dose. That is a pharmacokinetic argument, and it has not been tested against an outcome.',
        auditNote:
          'A dose restriction imposed for safety and a dose range demonstrated for efficacy are two different pieces of evidence. On this label they do not overlap for four named populations, and the label does not point that out.',
      },
      {
        q: 'Is the heart risk something I should actually worry about?',
        a: 'It is a measured effect on an electrocardiogram interval, in healthy volunteers, with a clear dose relationship: 8.5 milliseconds at 20 mg, 18.5 at 60 mg. Whether that converts into arrhythmia in an individual depends on everything else — potassium and magnesium levels, other QT-prolonging drugs, existing heart disease, congenital long QT. Torsade de pointes, ventricular tachycardia and sudden death appear in the postmarketing section of the label, which means they were reported in use rather than counted in a trial. That is why the label directs avoiding the drug in specific cardiac and electrolyte situations and stopping it if a corrected QT interval stays above 500 milliseconds, rather than treating the risk as uniform.',
      },
      {
        q: 'How is escitalopram different from citalopram?',
        a: 'It is citalopram with one half removed. The drug is a fifty-fifty mixture of two mirror-image molecules and essentially all the serotonin transporter blocking sits in one of them. Escitalopram is that half sold on its own. It reached the market in 2002, two years before the racemate went generic, from the same companies. In the 2018 network meta-analysis of 21 antidepressants, escitalopram was one of seven that beat the others in head-to-head comparisons and one of six rated most tolerable — citalopram also sat in that tolerability group. Whether the difference between the enantiomer and its parent is large enough to matter clinically has been argued about for twenty years, largely using trials funded by the company that sold both.',
      },
      {
        q: 'Someone told me STAR*D showed 67% of people get better. Is that right?',
        a: 'That figure comes from the summary paper, and a 2023 reanalysis of the same patient-level data put it at 35%. The dispute is specific and checkable: STAR*D’s protocol named the blinded 17-item Hamilton scale as the primary outcome and explicitly excluded non-blinded clinic-administered assessments from use as research outcomes. The published cumulative figure used a non-blinded clinic measure, and included 99 patients already scoring as remitted at study entry and 125 scoring as remitted when starting the next treatment level. Applying the protocol’s own outcome and inclusion rules gives 35.0%. The first level of that study — the citalopram level — remitted 28% of 2,876 patients on the Hamilton scale, and there was no placebo arm to compare it to.',
        auditNote:
          'The reanalysis has been contested in the same journals, and both papers are on this page. What is not contested is which outcome measure the protocol specified.',
      },
      {
        q: 'Can my child take this?',
        a: 'It is not approved for anyone under 18 in the United States, and the label footnotes that directly beneath its paediatric suicidality table. That table records 14 additional patients with suicidal thoughts or behaviours per 1,000 treated under 18, pooled across antidepressant trials in about 4,500 paediatric patients. In 2010 the drug’s United States marketer pleaded guilty to criminal charges that included illegally promoting it for depression in children and adolescents, and paid more than $313 million to resolve criminal and civil liability. Fluoxetine, not citalopram, is the drug in this class with a United States paediatric depression indication.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Citalopram United States prescribing information — Dosage and Administration 2.1 to 2.5, Warnings and Precautions 5.1 to 5.10, Clinical Pharmacology 12.2 Cardiac Electrophysiology and 12.3, Clinical Studies 14 (NDA 020822)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020822',
        kind: 'regulatory',
      },
      {
        label:
          'Trivedi MH, Rush AJ, Wisniewski SR, et al. Evaluation of outcomes with citalopram for depression using measurement-based care in STAR*D: implications for clinical practice. Am J Psychiatry 2006;163:28-40',
        identifier: '10.1176/appi.ajp.163.1.28',
        kind: 'doi',
      },
      {
        label: 'Sequenced Treatment Alternatives to Relieve Depression (STAR*D) registry record',
        identifier: 'NCT00021528',
        kind: 'nct',
      },
      {
        label:
          'Pigott HE, Kim T, Xu C, Kirsch I, Amsterdam J. What are the treatment remission, response and extent of improvement rates after up to four trials of antidepressant therapies in real-world depressed patients? A reanalysis of the STAR*D study’s patient-level data with fidelity to the original research protocol. BMJ Open 2023;13:e063095',
        identifier: '10.1136/bmjopen-2022-063095',
        kind: 'doi',
      },
      {
        label:
          'United States Department of Justice. Drug Maker Forest Pleads Guilty; To Pay More Than $313 Million to Resolve Criminal Charges and False Claims Act Allegations. Office of Public Affairs, 15 September 2010',
        identifier:
          'https://www.justice.gov/archives/opa/pr/drug-maker-forest-pleads-guilty-pay-more-313-million-resolve-criminal-charges-and-false',
        kind: 'url',
      },
      PUBLICATION_BIAS_SOURCE,
      SEROTONIN_UMBRELLA_SOURCE,
      NETWORK_META_SOURCE,
      {
        label:
          'Linde K, Berner MM, Kriston L. St John’s wort for major depression. Cochrane Database Syst Rev 2008;(4):CD000448',
        identifier: '10.1002/14651858.CD000448.pub3',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — citalopram, 50 listed generic products, and vortioxetine, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2771 — citalopram structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2771',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Paroxetine — the drug behind Study 329, whose own label now states that effectiveness was
  //    not demonstrated in 752 treated adolescents, and whose 2001 paper has never been retracted.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'paroxetine',
    name: 'Paroxetine',
    tradeName: 'Paxil / Paxil CR / Pexeva / Brisdelle',
    sponsor:
      'Apotex Corp on the record enriched here; originated at Ferrosan in Denmark and developed by SmithKline Beecham, now GlaxoSmithKline, under NDA 020031. Brisdelle, the 7.5 mg mesylate for hot flushes, is NDA 204516',
    targetGene: 'SLC6A4',
    targetProtein:
      'Serotonin transporter (SERT, 5-HTT). Paroxetine is also the most potent CYP2D6 inhibitor of its class, and inhibits the enzyme that clears itself',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1992,
    indication:
      'Major depressive disorder, obsessive compulsive disorder, panic disorder, social anxiety disorder, generalized anxiety disorder and post-traumatic stress disorder in adults. Separately, as paroxetine mesylate 7.5 mg (Brisdelle), moderate to severe vasomotor symptoms associated with menopause — an indication explicitly not for any psychiatric condition',
    patientFriendlyIndication:
      'Depression, obsessive-compulsive disorder, panic, social anxiety, generalised anxiety and post-traumatic stress; separately, at a much lower dose, menopausal hot flushes',
    anatomicalSite:
      'Serotonin transporter on presynaptic terminals in the central nervous system; the interaction that matters most outside the brain is at hepatic CYP2D6',
    conditionContext: {
      conditionExplainer:
        'Paroxetine carries more licensed psychiatric indications than any other drug in its class, and each was established on a rating scale over a few weeks. There is no test that confirms any of the six conditions and no biological measurement that any of the trials moved.',
      whyItMatters:
        'This is the drug on which the modern argument about trial transparency was fought. Study 329 reported it as effective and well tolerated in adolescents in 2001. In 2015 the same patient-level data, restored under the RIAT protocol, showed no efficacy on any prespecified outcome and clinically significant increases in harm. The original paper has not been retracted; the label now says effectiveness was not demonstrated.',
      whoTakesThis:
        'Adults across six psychiatric indications, and postmenopausal women at a tenth of the psychiatric dose for hot flushes. Not children or adolescents — the label states safety and effectiveness in paediatric patients have not been established. Women intending pregnancy or in the first trimester should start it only after other options have been considered.',
      clinicalGoals:
        'A fall in a symptom rating scale. For the menopause indication, fewer and less severe hot flushes per day, counted in a diary.',
    },
    oneSentenceVerdict:
      'The most potent CYP2D6 inhibitor among the serotonin reuptake inhibitors, effective in adults by the largest network meta-analysis but carrying a label that states effectiveness was not demonstrated in three placebo-controlled trials in 752 treated adolescents — the population its own 2001 publication described as responding well, and whose restored data set in 2015 showed a Hamilton fall of 10.7 points against 9.1 on placebo (p=0.20) with increased suicidal ideation and behaviour.',
    laymanHowItWorks:
      'Paroxetine blocks the transporter that recycles serotonin out of the gap between nerve cells, so serotonin stays there longer. Its label says the mechanism of benefit is unknown and only presumed to follow from that. Two other features define it in practice: it strongly blocks a liver enzyme called CYP2D6, which changes the levels of many other drugs, and it partly blocks the enzyme that clears itself, so doubling the dose raises the blood level by much more than double.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 48,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0940 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 150 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 29 December 1992 under NDA 020031 and generic since 2003. The molecule was subsequently re-approved twice at different salts and doses: Pexeva as the mesylate for psychiatric indications, and Brisdelle as a 7.5 mg mesylate capsule for menopausal hot flushes on 28 June 2013 under NDA 204516 — a new patent-protected product built from a molecule that had been generic for a decade.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Two properties send prescribers away from paroxetine specifically rather than from the class: its CYP2D6 inhibition, which matters if a person takes tamoxifen, codeine, metoprolol or several antiarrhythmics, and its 21-hour half-life with saturable metabolism, which makes it the hardest of the class to come off. Where either is the concern, the alternatives below differ on exactly that axis.',
      conventionalRx: [
        {
          name: 'Sertraline (Zoloft)',
          class: 'Selective serotonin reuptake inhibitor',
          howItCompares:
            'Weak CYP2D6 inhibition at usual doses, which is the specific reason it is preferred in women on tamoxifen. The population cohort that made paroxetine’s interaction visible found the excess breast cancer mortality with paroxetine and, in its own words, no such risk with other antidepressants.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: little CYP2D6 inhibition; linear kinetics. Cons: more early gastrointestinal upset; still a short-half-life drug with the class discontinuation problem, though less pronounced.',
        },
        {
          name: 'Fluoxetine (Prozac)',
          class: 'Selective serotonin reuptake inhibitor with a long-lived active metabolite',
          howItCompares:
            'Also a strong CYP2D6 inhibitor, so it is not the answer to the tamoxifen problem. It is the answer to the discontinuation problem: norfluoxetine has an elimination half-life of 4 to 16 days against paroxetine’s 21 hours, so it tapers itself.',
          typicalCost:
            'US$0.0499 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 152 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: far easier to stop; the only drug in the class with a United States paediatric depression indication. Cons: the same CYP2D6 problem; in head-to-head comparisons in the 2018 network meta-analysis it sat in the least efficacious group while paroxetine sat in the more efficacious one.',
        },
        {
          name: 'Venlafaxine, for menopausal hot flushes rather than paroxetine mesylate',
          class: 'Serotonin-noradrenaline reuptake inhibitor',
          howItCompares:
            'Both are used off-label or on-label for vasomotor symptoms, and both are ordinary generics at a few cents a dose. Brisdelle is the same molecule as generic paroxetine at 7.5 mg, sold as a separate patented product after an FDA advisory committee voted 10 to 4 against approving it.',
          typicalCost:
            'US$0.1162 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 217 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no CYP2D6 inhibition, so usable alongside tamoxifen. Cons: dose-related blood pressure rise; harder to discontinue than most of the class.',
        },
      ],
      naturalFoods: [
        {
          name: 'Soy isoflavones and other phytoestrogens, for vasomotor symptoms only',
          activeCompound: 'Genistein and daidzein, and the daidzein metabolite equol',
          biologicalMechanism:
            'Isoflavones bind oestrogen receptors, with relative selectivity for ER-beta, and act as weak partial agonists. Whether a person produces equol from daidzein depends on gut bacteria and differs between populations, which is one reason trial results have been inconsistent.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. For scale only, and to put the drug in context: in Brisdelle’s own registration trial the median treatment difference against placebo was 1.2 fewer moderate-to-severe hot flushes per day at week 4 and 0.9 fewer at week 12, from a baseline median of 10.4 per day, and the severity difference at week 12 was not statistically significant (p=0.17).',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'If you take tamoxifen, say so before the first tablet',
          action:
            'This is the one interaction on this page with mortality data behind it rather than a laboratory prediction.',
          patientImpact:
            'Tamoxifen needs CYP2D6 to become endoxifen, its active form. The label directs considering an alternative antidepressant with little or no CYP2D6 inhibition. In a cohort of 2,430 Ontario women aged 66 and over on tamoxifen and a single SSRI, absolute increases of 25%, 50% and 75% in the proportion of tamoxifen treatment overlapping with paroxetine were associated with 24%, 54% and 91% increases in breast cancer death.',
          clinicalPrecaution:
            'The same study found no such risk with the other antidepressants studied. The interaction is specific to the strong CYP2D6 inhibitors, not to the class.',
        },
        {
          name: 'Do not stop it abruptly, and expect this one to be harder than most',
          action: 'The label directs gradual reduction rather than abrupt cessation.',
          patientImpact:
            'Paroxetine has a steady-state half-life of about 21 hours and no long-lived active metabolite. Because one of the enzymes that metabolises it is readily saturable, steady-state Cmax and Cmin run about 6 and 14 times what single-dose data predict — so a dose reduction drops the blood level by proportionately more than the dose cut suggests.',
          clinicalPrecaution:
            'Labelled discontinuation reactions include nausea, sweating, dysphoric mood, irritability, agitation, dizziness, electric-shock sensory disturbances, tremor, anxiety, confusion, headache, lethargy, emotional lability, insomnia, hypomania, tinnitus and seizures. How to reduce it is a clinical decision, not one this page can give.',
        },
        {
          name: 'Raise pregnancy plans before starting, not after',
          action: 'Say if you intend to become pregnant or might already be.',
          patientImpact:
            'The label states paroxetine is associated with a less than two-fold increase in cardiovascular malformations when given in the first trimester, and directs that for women who intend to become pregnant or who are in their first trimester it should be initiated only after consideration of the other available treatment options.',
          clinicalPrecaution:
            'The same section records risks of persistent pulmonary hypertension of the newborn and poor neonatal adaptation across the class, and states that women who discontinue antidepressants during pregnancy are more likely to relapse. Both risks are real and the label declines to rank them.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CNC[C@H]([C@@H]1C2=CC=C(C=C2)F)COC3=CC4=C(C=C3)OCO4',
      chemicalFormula: 'C19H20FNO3',
      molecularWeight:
        '329.40 g/mol (free base); dispensed as the hydrochloride hemihydrate or the mesylate',
      targetReceptorAffinity:
        'A single enantiomer, the (3S,4R)-trans isomer — unlike fluoxetine and citalopram, which are racemates. The label describes paroxetine as a potent and highly selective inhibitor of neuronal serotonin reuptake with only very weak effects on noradrenaline and dopamine reuptake. Its pharmacokinetics are non-linear because one of the enzymes metabolising it is readily saturable: at steady state on 30 mg daily, mean Cmax was 61.7 ng/mL and half-life 21 hours, with Cmax and Cmin about 6 and 14 times single-dose predictions.',
      structureSource: {
        label:
          'PubChem CID 43815 (paroxetine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; stereochemistry, selectivity and saturable-metabolism statements from the paroxetine United States prescribing information, sections 11, 12.2 and 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/43815',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'par-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the single trans enantiomer and the salt form',
          description:
            'Paroxetine is one stereoisomer of four possible on a piperidine bearing two adjacent stereocentres, and the marketed material must be the (3S,4R)-trans isomer specifically. It is also sold as three different solid forms — hydrochloride hemihydrate, hydrochloride anhydrate and mesylate — whose dissolution differs, so the salt and hydration state are release specifications and not packaging details.',
          reagentsAndBuffer:
            'Paroxetine hydrochloride hemihydrate and paroxetine mesylate reference standards, chiral HPLC, X-ray powder diffraction and differential scanning calorimetry for polymorph and hydrate identity, Karl Fischer titration, 19F NMR',
        },
        {
          id: 'par-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Set two adjacent stereocentres on the piperidine ring',
          description:
            'The molecule is a 4-(4-fluorophenyl)piperidine with a sesamol ether hanging off carbon 3. Both ring carbons are stereogenic and adjacent, and only one of the four possible isomers is the drug, so the synthesis is a stereochemistry problem rather than a connectivity problem. This is the reason paroxetine is more expensive to make than the racemic members of its class.',
          dependsOnStepId: 'par-w1',
          reagentsAndBuffer:
            'Arecoline or an equivalent tetrahydropyridine, 4-fluorophenyl Grignard for the 4-aryl group, stereoselective reduction, sesamol and an activated carbinol for the ether, chiral auxiliary or enzymatic resolution as the process dictates',
        },
        {
          id: 'par-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Resolve the isomers and crystallise the specified solid form',
          description:
            'Separate the trans pair from the cis pair and then the two trans enantiomers, then crystallise the salt in the specified hydrate. The polymorph question here is not academic: differences between paroxetine hydrochloride crystal forms were the subject of extended patent litigation precisely because they behave differently in the body.',
          dependsOnStepId: 'par-w2',
          reagentsAndBuffer:
            'Diastereomeric salt resolution with a chiral acid, preparative chiral chromatography where required, controlled crystallisation from isopropanol or an alcohol-water system, seed crystals of the target polymorph',
        },
        {
          id: 'par-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure CYP2D6 inhibition as a primary readout, not a footnote',
          description:
            'For this molecule the enzyme assay is as important as the transporter assay. Paroxetine both inhibits CYP2D6 and is cleared by it, which is what makes its own kinetics non-linear and what drives the tamoxifen and codeine interactions. Inhibition constants have to be measured against a validated probe substrate, not inferred from the class.',
          dependsOnStepId: 'par-w3',
          reagentsAndBuffer:
            'Human liver microsomes and recombinant CYP2D6, dextromethorphan O-demethylation as probe reaction, quinidine as positive control inhibitor, parallel HEK293-SLC6A4 tritiated serotonin uptake assay for transporter potency',
        },
        {
          id: 'par-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Characterise the dose-exposure curve rather than a single point',
          description:
            'Because paroxetine saturates its own clearance, exposure rises faster than dose and a single-dose pharmacokinetic study systematically understates steady state. The measurement that describes the drug is a multiple-dose escalation with the full concentration-time curve at each level, which is what produced the label statement that steady-state Cmax and Cmin are about 6 and 14 times single-dose predictions.',
          dependsOnStepId: 'par-w4',
          reagentsAndBuffer:
            'Liquid chromatography-tandem mass spectrometry with a deuterated paroxetine internal standard, multiple-dose escalation design with full AUC0-24 sampling at each level, CYP2D6 genotyping of subjects',
        },
      ],
    },
    keyAudits: [
      {
        id: 'par-a1',
        category: 'conclusion_shift',
        title: 'Study 329: the same data, reanalysed, showed no efficacy and more harm',
        laymanSummary:
          'A 2001 paper reported paroxetine as effective and well tolerated for adolescent depression. In 2015 an independent team obtained the full data set from the same trial and found no benefit on any prespecified outcome, and clinically significant increases in harm including suicidal ideation and behaviour. The original paper has never been retracted.',
        technicalDetails:
          'Study 329 randomised 275 adolescents with major depression of at least eight weeks’ duration across 12 North American academic psychiatry centres between April 1994 and February 1998, to eight weeks of double-blind paroxetine 20 to 40 mg, imipramine 200 to 300 mg, or placebo. The prespecified primary efficacy variables were change in total Hamilton score and the proportion of responders at acute endpoint. Reanalysis under the Restoring Invisible and Abandoned Trials protocol found the efficacy of paroxetine and imipramine not statistically or clinically significantly different from placebo on any prespecified primary or secondary outcome: least-squares mean Hamilton reductions of 10.7 (95% CI 9.1 to 12.3), 9.0 (7.4 to 10.5) and 9.1 (7.5 to 10.7) points for paroxetine, imipramine and placebo respectively, p=0.20. There were clinically significant increases in harms, including suicidal ideation and behaviour and other serious adverse events in the paroxetine group and cardiovascular problems in the imipramine group. The authors note that no coding dictionary for adverse events had been prespecified. Two of the reanalysis authors declare paid expert work for plaintiffs in litigation involving the manufacturer, which is disclosed in the paper and belongs on this page alongside the finding.',
        evidenceSource:
          'Le Noury J, Nardo JM, Healy D, et al. Restoring Study 329: efficacy and harms of paroxetine and imipramine in treatment of major depression in adolescence. BMJ 2015;351:h4320',
        doi: '10.1136/bmj.h4320',
        measuredMetric:
          'Least-squares mean change in Hamilton depression score at eight weeks, paroxetine against placebo, in 275 adolescents',
        auditFlag: 'contested',
      },
      {
        id: 'par-a2',
        category: 'failed',
        title: 'The label now says effectiveness was not demonstrated in 752 treated adolescents',
        laymanSummary:
          'Whatever the 2001 paper said, the prescribing information is unambiguous. Three placebo-controlled trials in 752 paroxetine-treated children and adolescents with depression did not demonstrate effectiveness.',
        technicalDetails:
          'Section 8.4 states: "The safety and effectiveness of paroxetine tablets in pediatric patients have not been established... Effectiveness was not demonstrated in three placebo-controlled trials in 752 paroxetine tablets-treated pediatric patients with MDD." The same section lists the adverse reactions occurring in at least 2% of paediatric patients at twice the placebo rate: emotional lability including self-harm, suicidal thoughts, attempted suicide, crying and mood fluctuations; hostility; decreased appetite; tremor; sweating; hyperkinesia; and agitation. It separately lists the reactions on discontinuation in the paediatric trials that included a taper — emotional lability including suicidal ideation and suicide attempt, nervousness, dizziness, nausea and abdominal pain. A negative efficacy finding and a positive harm finding in the same population, on the same document, is the strongest form this audit can take.',
        evidenceSource:
          'Paroxetine United States prescribing information, section 8.4 Pediatric Use and Boxed Warning (NDA 020031)',
        measuredMetric:
          'Efficacy outcome of three placebo-controlled paediatric major depressive disorder trials, 752 treated patients',
        auditFlag: 'caution',
      },
      {
        id: 'par-a3',
        category: 'measured',
        title: 'Paroxetine with tamoxifen: 91% higher breast cancer death at high overlap',
        laymanSummary:
          'Tamoxifen has to be switched on by a liver enzyme that paroxetine blocks harder than any other drug in its class. In 2,430 older Ontario women on tamoxifen and one antidepressant, more overlap with paroxetine meant more breast cancer deaths. No other antidepressant showed it.',
        technicalDetails:
          'A population-based cohort of women in Ontario aged 66 or over treated with tamoxifen for breast cancer between 1993 and 2005 who had overlapping treatment with a single SSRI. Of 2,430 such women, 374 (15.4%) died of breast cancer over a mean 2.38 years of follow-up. After adjustment for age, duration of tamoxifen treatment and other potential confounders, absolute increases of 25%, 50% and 75% in the proportion of tamoxifen treatment overlapping with paroxetine were associated with 24%, 54% and 91% increases in the risk of breast cancer death (p<0.05 for each). No such risk was seen with the other antidepressants. At the sample median overlap of 41%, the authors estimated one additional breast cancer death within five years of stopping tamoxifen for every 19.7 patients treated (95% CI 12.5 to 46.3). This is an observational study and confounding by indication cannot be excluded, but the drug-specific gradient and the known CYP2D6 mechanism point the same way, and the label now names tamoxifen and directs considering an antidepressant with little or no CYP2D6 inhibition.',
        evidenceSource:
          'Kelly CM, Juurlink DN, Gomes T, et al. Selective serotonin reuptake inhibitors and breast cancer mortality in women receiving tamoxifen: a population based cohort study. BMJ 2010;340:c693',
        doi: '10.1136/bmj.c693',
        measuredMetric:
          'Adjusted risk of breast cancer death as a function of paroxetine-tamoxifen treatment overlap in 2,430 women',
        auditFlag: 'verified',
      },
      {
        id: 'par-a4',
        category: 'inferred',
        title: 'Approved for hot flushes over a 10-to-4 vote against, on one fewer flush a day',
        laymanSummary:
          'The same molecule was re-approved in 2013 at a tenth of the psychiatric dose as a new branded product for menopausal hot flushes. An FDA advisory committee had voted 10 to 4 against. The measured difference from placebo was about one fewer hot flush a day out of ten.',
        technicalDetails:
          'Brisdelle, paroxetine mesylate 7.5 mg, was approved on 28 June 2013 under NDA 204516 for moderate to severe vasomotor symptoms of menopause, with an explicit limitation of use stating it is not indicated for any psychiatric condition and that the lower dosage has not been established for one. Effectiveness rested on two Phase 3 placebo-controlled trials in 1,174 postmenopausal women who had at least seven to eight moderate-to-severe episodes a day at baseline. In Trial 1 (n=606), the median daily frequency fell 4.3 against 3.1 at week 4 and 5.9 against 5.0 at week 12, giving median treatment differences of 1.2 and 0.9 episodes per day from a baseline median of 10.4; the severity difference was 0.05 at week 4 (p<0.01) and 0.04 at week 12, where it was not statistically significant (p=0.17). The FDA’s Reproductive Health Drugs Advisory Committee voted 10 to 4 against recommending approval in March 2013, and the agency approved it anyway; FDA reviewers subsequently published their reasoning in a 2014 NEJM perspective. The pharmacological content of the product is a molecule that had been generic for a decade.',
        evidenceSource:
          'BRISDELLE (paroxetine mesylate) United States prescribing information, sections 1 and 14, Tables 4 and 5 (NDA 204516); Orleans RJ, Li L, Kim MJ, et al. FDA approval of paroxetine for menopausal hot flushes. N Engl J Med 2014;370:1777-1779',
        doi: '10.1056/NEJMp1402080',
        inferredClaim:
          'That a median difference of about one moderate-to-severe hot flush per day, from a baseline of ten, justified a new patent-protected product built on a generic molecule against the advice of the agency’s own advisory committee',
        auditFlag: 'contested',
      },
      {
        id: 'par-a5',
        category: 'failed',
        title: 'A first-trimester cardiac malformation signal that changed the label',
        laymanSummary:
          'Paroxetine is the drug in its class singled out on pregnancy grounds. Its label states an association with a less than two-fold increase in cardiovascular malformations after first-trimester exposure, and directs that it be started in women who might become pregnant only after other options have been considered.',
        technicalDetails:
          'Section 8.1 states that paroxetine is associated with a less than two-fold increase in cardiovascular malformations when administered during the first trimester, that individual epidemiological studies have reported inconsistent findings but some meta-analyses have identified an increased risk, and that for women who intend to become pregnant or who are in their first trimester paroxetine should be initiated only after consideration of the other available treatment options. It records animal data in which no treatment-related malformations were seen at up to 50 mg/kg/day in rats and 6 mg/kg/day in rabbits during organogenesis, but in which dosing through the last trimester and lactation increased pup deaths in the first four days of lactation at 1 mg/kg/day, below the maximum recommended human dose on a body-surface basis. The section also records class risks of persistent pulmonary hypertension of the newborn and poor neonatal adaptation, and states that women who stop antidepressants in pregnancy are more likely to relapse. The label sets out both risks without ranking them, so the decision remains individual.',
        evidenceSource:
          'Paroxetine United States prescribing information, section 8.1 Pregnancy (NDA 020031)',
        measuredMetric:
          'Labelled magnitude of the first-trimester cardiovascular malformation association and the resulting initiation restriction',
        auditFlag: 'caution',
      },
      {
        id: 'par-a6',
        category: 'measured',
        title: 'Effective in adults by the largest comparison ever run, and hard to stop',
        laymanSummary:
          'In the network meta-analysis of 21 antidepressants across 522 trials, paroxetine was one of seven drugs that beat the others when compared head to head. Its own label separately describes a discontinuation syndrome that includes seizures.',
        technicalDetails:
          'In the head-to-head studies of the 2018 network meta-analysis, agomelatine, amitriptyline, escitalopram, mirtazapine, paroxetine, venlafaxine and vortioxetine were more effective than the other antidepressants, with odds ratios ranging from 1.19 to 1.96; certainty of evidence across the analysis was rated moderate to very low and 9% of trials were at high risk of bias. Against that, paroxetine has a steady-state half-life of 21 hours, no long-lived active metabolite, and saturable metabolism that makes steady-state Cmax and Cmin about 6 and 14 times what single-dose data predict — the pharmacological basis for its reputation as the hardest of the class to stop. The labelled discontinuation reactions run from nausea, dizziness and electric-shock sensory disturbances through emotional lability and hypomania to seizures, and the label directs gradual reduction whenever possible. Both facts are measured; they belong on the same page because a drug that works and is hard to leave is a different proposition from one that only works.',
        evidenceSource:
          'Cipriani A, Furukawa TA, Salanti G, et al. Lancet 2018;391:1357-1366; paroxetine United States prescribing information, sections 5.7 and 12.3 (NDA 020031)',
        doi: '10.1016/S0140-6736(17)32802-7',
        measuredMetric:
          'Head-to-head efficacy odds ratios in 522 trials, against labelled steady-state half-life and discontinuation reactions',
        auditFlag: 'verified',
      },
      {
        id: 'par-a7',
        category: 'inferred',
        title: 'Six indications, one hypothesis, no mechanism',
        laymanSummary:
          'Paroxetine is licensed for depression, obsessive-compulsive disorder, panic, social anxiety, generalised anxiety and post-traumatic stress. Its label says the mechanism in all six is unknown, and presumed to be the same one.',
        technicalDetails:
          'Section 12.1 reads: "The mechanism of action of paroxetine tablets in the treatment of MDD, SAD, OCD, PD, GAD, and PTSD is unknown, but is presumed to be linked to potentiation of serotonergic activity in the central nervous system resulting from inhibition of neuronal reuptake of serotonin." One presumed mechanism is offered for six conditions that share no diagnostic test, no biomarker and no agreed pathophysiology. The 2022 umbrella review of the serotonin theory synthesised 17 systematic reviews, meta-analyses and large data-set analyses across serotonin and 5-HIAA concentrations, receptor and transporter binding, tryptophan depletion and transporter genetics, and found no consistent evidence that depression is associated with lowered serotonin. Nothing about that finding removes the licensed efficacy in adults; it removes the explanation that has been attached to it.',
        evidenceSource:
          'Paroxetine United States prescribing information, sections 12.1 and 12.2 (NDA 020031); Moncrieff J et al., Mol Psychiatry 2023;28:3243-3256',
        doi: '10.1038/s41380-022-01661-0',
        inferredClaim:
          'That one serotonergic mechanism explains benefit across six unrelated psychiatric diagnoses — a presumption the label states as such and that no biological measurement supports',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One isomer of four, in a specific crystal form',
        laymanDesc:
          'Unlike most of its class, paroxetine is a single mirror-image form rather than a mixture — and the exact crystal it is packed as changes how it dissolves.',
        molecularDetail:
          'The (3S,4R)-trans isomer of a 4-(4-fluorophenyl)piperidine bearing a sesamol ether at carbon 3. Marketed as the hydrochloride hemihydrate, the hydrochloride anhydrate and the mesylate; the differences between hydrochloride polymorphs were the subject of extended patent litigation. Food raises Cmax by about 29% and shortens time to peak from 6.4 to 4.9 hours while barely changing total exposure.',
        iconName: 'Gem',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It jams the enzyme that clears it',
        laymanDesc:
          'The liver enzyme that removes paroxetine is also blocked by paroxetine. Doubling the dose raises the blood level by much more than double, and halving it drops the level by much more than half.',
        molecularDetail:
          'One of the enzymes metabolising paroxetine is readily saturable, so its pharmacokinetics are non-linear. At steady state on 30 mg daily, mean Cmax was 61.7 ng/mL and mean half-life 21 hours, with steady-state Cmax and Cmin about 6 and 14 times single-dose predictions and AUC0-24 about 8 times. Steady state is reached in roughly 10 days for most subjects but substantially longer in some.',
        iconName: 'Lock',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The serotonin transporter is blocked',
        laymanDesc:
          'It plugs the pump that recycles serotonin, and it does so more potently than most of its class.',
        molecularDetail:
          'Potent and highly selective inhibition of neuronal serotonin reuptake with only very weak effects on noradrenaline and dopamine reuptake, demonstrated at clinically relevant doses by blockade of serotonin uptake into human platelets. Section 12.1 states the mechanism of therapeutic action across all six licensed indications is unknown and only presumed to follow from this.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And blocks CYP2D6 for every other drug too',
        laymanDesc:
          'The same enzyme block that traps paroxetine also changes the levels of many unrelated drugs — including tamoxifen, which needs that enzyme to become active at all.',
        molecularDetail:
          'The label lists propafenone, flecainide, atomoxetine, desipramine, dextromethorphan, metoprolol, nebivolol, perphenazine, tolterodine, venlafaxine and risperidone as CYP2D6 substrates whose exposure rises, and directs dose reduction where needed and an increase again if paroxetine is stopped. Tamoxifen is handled separately: concomitant use may reduce plasma endoxifen and tamoxifen efficacy, and the label directs considering an antidepressant with little or no CYP2D6 inhibition.',
        iconName: 'GitBranch',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In adults, a rating scale moves; in adolescents, it did not',
        laymanDesc:
          'Adult trials across six conditions supported approval. Three paediatric depression trials in 752 treated patients did not.',
        molecularDetail:
          'Licensed adult efficacy rests on short placebo-controlled trials in each of six indications, and in the 2018 network meta-analysis paroxetine was one of seven drugs more effective than the others in head-to-head comparison (odds ratios 1.19 to 1.96). Section 8.4 states effectiveness was not demonstrated in three placebo-controlled paediatric trials in 752 treated patients, and the RIAT restoration of Study 329 found Hamilton reductions of 10.7 against 9.1 on placebo, p=0.20.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Stopping is its own event',
        laymanDesc:
          'Short half-life, no long-lived metabolite, and a blood level that falls faster than the dose does. The label lists seizures among the discontinuation reactions.',
        molecularDetail:
          'Labelled discontinuation reactions include nausea, sweating, dysphoric mood, irritability, agitation, dizziness, paraesthesia including electric-shock sensations, tremor, anxiety, confusion, headache, lethargy, emotional lability, insomnia, hypomania, tinnitus and seizures, with gradual reduction directed whenever possible. In the GAD and PTSD trials, decreases of 10 mg/day at weekly intervals followed by a week at 20 mg/day were used before stopping.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Study 329, as restored under the RIAT protocol (BMJ 2015;351:h4320)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, three-arm',
        sampleSize: 275,
        primaryEndpoint:
          'Change from baseline to end of the eight-week acute phase in total Hamilton depression score, and the proportion of responders, in adolescents with unipolar major depression',
        endpointMet: false,
        statisticalPValue:
          'Least-squares mean Hamilton reduction 10.7 (95% CI 9.1 to 12.3) on paroxetine, 9.0 (7.4 to 10.5) on imipramine and 9.1 (7.5 to 10.7) on placebo, p=0.20; no prespecified primary or secondary outcome differed statistically or clinically from placebo',
        unreportedAdverseSignals:
          'Clinically significant increases in harms, including suicidal ideation and behaviour and other serious adverse events on paroxetine and cardiovascular problems on imipramine. No adverse-event coding dictionary had been prespecified. The 2001 publication of this trial reported it as showing efficacy and good tolerability, and has not been retracted.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Three paediatric major depressive disorder trials (NDA 020031, section 8.4)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 752,
        primaryEndpoint:
          'Efficacy in paediatric major depressive disorder, as summarised in the label’s Pediatric Use section',
        endpointMet: false,
        statisticalPValue:
          'The label states effectiveness was not demonstrated in three placebo-controlled trials in 752 paroxetine-treated paediatric patients with MDD',
        unreportedAdverseSignals:
          'Emotional lability including self-harm, suicidal thoughts, attempted suicide, crying and mood fluctuations; hostility; decreased appetite; tremor; sweating; hyperkinesia; and agitation each occurred in at least 2% of paediatric patients at a rate at least twice that on placebo. 752 is the number treated, not the number randomised, which the label does not state.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId:
          'Brisdelle Phase 3 vasomotor symptom trials 1 and 2 (NDA 204516, section 14, Tables 4 and 5)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 1174,
        primaryEndpoint:
          'Co-primary reduction from baseline in frequency and in severity of moderate to severe vasomotor symptoms at weeks 4 and 12, in postmenopausal women with at least seven to eight episodes daily at baseline',
        endpointMet: true,
        statisticalPValue:
          'Trial 1 (n=606): median daily frequency change -4.3 against -3.1 at week 4 and -5.9 against -5.0 at week 12, treatment differences of 1.2 and 0.9 episodes per day from a baseline median of 10.4, p<0.01 for both',
        unreportedAdverseSignals:
          'In Trial 1 the severity difference at week 12 was 0.04 and not statistically significant (p=0.17). The FDA’s Reproductive Health Drugs Advisory Committee voted 10 to 4 against recommending approval in March 2013; the agency approved the product on 28 June 2013.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Hamilton reduction of 10.7 points on paroxetine against 9.1 on placebo in 275 adolescents, p=0.20, on the restored Study 329 data set',
        'Effectiveness not demonstrated in three placebo-controlled paediatric depression trials in 752 treated patients, per the label',
        '24%, 54% and 91% increases in breast cancer death for 25%, 50% and 75% absolute increases in paroxetine-tamoxifen overlap among 2,430 women',
        'Median treatment differences of 1.2 and 0.9 fewer moderate-to-severe hot flushes per day at weeks 4 and 12, from a baseline median of 10.4',
        'Steady-state half-life of 21 hours with Cmax and Cmin about 6 and 14 times single-dose predictions, from saturable metabolism',
        'One of seven antidepressants more effective than the others in head-to-head comparisons across 522 trials (odds ratios 1.19 to 1.96)',
      ],
      unsupportedInferences: [
        'That paroxetine is effective and well tolerated in adolescent depression — the 2001 conclusion, contradicted by the restored data set and by the current label',
        'That one presumed serotonergic mechanism explains benefit across six unrelated psychiatric diagnoses, which the label offers as a presumption',
        'That a median difference of about one hot flush per day out of ten warranted a new branded product against a 10-to-4 advisory committee vote',
        'That the CYP2D6 interaction is a class effect; the cohort that measured it found the excess mortality with paroxetine and not with the other antidepressants studied',
      ],
      whatFailedInitially: [
        'Three placebo-controlled paediatric depression trials failed to demonstrate effectiveness, and the label says so',
        'Study 329’s published conclusion did not survive reanalysis of its own patient-level data, and the paper has not been retracted',
        'The FDA’s own advisory committee voted 10 to 4 against the hot-flush indication before it was approved',
        'The first-trimester cardiovascular malformation signal forced a label change that singles paroxetine out from the rest of its class',
      ],
      realWorldOutcome: [
        'Approved in the United States on 29 December 1992 under NDA 020031, generic since 2003, and about nine United States cents a tablet at pharmacy acquisition cost',
        'Re-approved as a 7.5 mg mesylate for menopausal hot flushes on 28 June 2013 under NDA 204516, a decade after the molecule went generic',
        'Its label now names tamoxifen explicitly and directs considering an antidepressant with little or no CYP2D6 inhibition',
        'The Study 329 dispute is the case most often cited in support of routine access to patient-level trial data',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 10, 20, 30 and 40 mg, controlled-release tablet, oral suspension, and a separate 7.5 mg mesylate capsule licensed only for menopausal vasomotor symptoms',
      description:
        'Completely absorbed after oral dosing of the hydrochloride solution. Steady state is reached in about 10 days for most subjects but substantially longer in some, and exposure is non-linear because one metabolising enzyme is readily saturable: at 30 mg daily, steady-state mean Cmax was 61.7 ng/mL, Cmin 30.7 ng/mL, Tmax 5.2 hours and half-life 21 hours. Food raises Cmax by about 29% and shortens Tmax without materially changing AUC.',
      safetyProfile:
        'Boxed warning for suicidal thoughts and behaviours in children, adolescents and young adults, with safety and effectiveness in paediatric patients not established. Strong CYP2D6 inhibition, with tamoxifen singled out. Labelled discontinuation syndrome including electric-shock sensory disturbances and seizures, with gradual reduction directed. Seizures occurred in 0.1% of treated patients in clinical studies, from which people with a seizure history were excluded. First-trimester exposure is associated with a less than two-fold increase in cardiovascular malformations, and the class carries risks of persistent pulmonary hypertension of the newborn and poor neonatal adaptation, and of postpartum haemorrhage with exposure in the month before delivery.',
    },
    commonQuestions: [
      {
        q: 'What was Study 329 and why does it keep coming up?',
        a: 'It was a trial of paroxetine and imipramine against placebo in 275 depressed adolescents, run between 1994 and 1998. The 2001 paper reported paroxetine as effective and well tolerated. In 2015 an independent team obtained the full data set and reanalysed it against the trial’s own prespecified outcomes under the Restoring Invisible and Abandoned Trials protocol. On those outcomes, Hamilton scores fell 10.7 points on paroxetine and 9.1 on placebo, p=0.20 — no efficacy on any primary or secondary measure — and there were clinically significant increases in harms including suicidal ideation and behaviour. The original paper has not been retracted. The prescribing information now says effectiveness was not demonstrated in three placebo-controlled paediatric trials in 752 treated patients.',
        auditNote:
          'The reanalysis authors disclose paid expert work for plaintiffs in litigation against the manufacturer. That disclosure belongs on the page. It does not change what the prespecified outcomes were or what the label now says.',
      },
      {
        q: 'I take tamoxifen. Does it matter which antidepressant I take?',
        a: 'For this drug specifically, the evidence says yes. Tamoxifen is a prodrug: it has to be converted to endoxifen by the liver enzyme CYP2D6 before it does anything, and paroxetine is the most potent inhibitor of that enzyme in its class. In a cohort of 2,430 Ontario women aged 66 and over taking tamoxifen with a single SSRI, more overlap with paroxetine tracked with more breast cancer deaths — 24%, 54% and 91% higher risk at 25%, 50% and 75% absolute increases in overlap — and the same analysis found no such risk with the other antidepressants studied. The label names tamoxifen directly and directs considering an antidepressant with little or no CYP2D6 inhibition. This is an observational study, so it cannot prove causation on its own, but the mechanism and the drug-specific gradient point the same way.',
      },
      {
        q: 'Why is paroxetine the one everyone says is hard to stop?',
        a: 'Because of two pharmacological facts that compound each other. Its half-life at steady state is about 21 hours and it has no long-lived active metabolite, so it clears quickly once stopped. And one of the enzymes that clears it is readily saturable, which is why steady-state blood levels run about six to fourteen times what single-dose studies predict — and why cutting the dose drops the concentration by proportionately more than the cut. The label lists nausea, dizziness, electric-shock sensory disturbances, emotional lability, hypomania and seizures among discontinuation reactions and directs gradual reduction wherever possible. How to do that is a clinical decision that depends on the dose and the duration, and this page does not give a schedule.',
      },
      {
        q: 'Brisdelle is just paroxetine, isn’t it?',
        a: 'Yes — paroxetine mesylate at 7.5 mg, about a tenth of a common psychiatric dose, approved in 2013 for moderate-to-severe menopausal hot flushes. Its own label states it is not indicated for any psychiatric condition and that effectiveness at that dose has not been established for one. The efficacy data are two trials in 1,174 women: in the first, the median number of moderate-to-severe flushes fell from about 10.4 a day by 4.3 on the drug and 3.1 on placebo at four weeks, a difference of 1.2 a day, narrowing to 0.9 by twelve weeks, with the severity difference no longer statistically significant at that point. The FDA’s Reproductive Health Drugs Advisory Committee voted 10 to 4 against approval; the agency approved it anyway and its reviewers published their reasoning in the New England Journal of Medicine.',
      },
      {
        q: 'Is it safe in pregnancy?',
        a: 'Paroxetine is singled out within its class on this question. Its label states an association with a less than two-fold increase in cardiovascular malformations after first-trimester exposure, notes that individual studies have been inconsistent while some meta-analyses found an increase, and directs that for women who intend to become pregnant or are in their first trimester it be started only after the other available options have been considered. The same section records class risks of persistent pulmonary hypertension of the newborn and poor neonatal adaptation, and a less than two-fold increase in postpartum haemorrhage with exposure in the month before delivery — and, on the other side, that women who stop antidepressants during pregnancy relapse more often than those who continue. The label sets both out and does not tell you which weighs more, because that depends on the person.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Paroxetine United States prescribing information — Boxed Warning, Warnings and Precautions 5.1 to 5.11, Pediatric Use 8.4, Pregnancy 8.1, Drug Interactions 7, Clinical Pharmacology 12.1 to 12.3 (NDA 020031)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020031',
        kind: 'regulatory',
      },
      {
        label:
          'Le Noury J, Nardo JM, Healy D, Jureidini J, Raven M, Tufanaru C, Abi-Jaoude E. Restoring Study 329: efficacy and harms of paroxetine and imipramine in treatment of major depression in adolescence. BMJ 2015;351:h4320',
        identifier: '10.1136/bmj.h4320',
        kind: 'doi',
      },
      {
        label:
          'Kelly CM, Juurlink DN, Gomes T, Duong-Hua M, Pritchard KI, Austin PC, Paszat LF. Selective serotonin reuptake inhibitors and breast cancer mortality in women receiving tamoxifen: a population based cohort study. BMJ 2010;340:c693',
        identifier: '10.1136/bmj.c693',
        kind: 'doi',
      },
      {
        label:
          'BRISDELLE (paroxetine mesylate) 7.5 mg United States prescribing information and Drugs@FDA record — original approval 28 June 2013 (NDA 204516)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=204516',
        kind: 'regulatory',
      },
      {
        label:
          'Orleans RJ, Li L, Kim MJ, Guo J, Sobhan M, Soule L, Joffe HV. FDA approval of paroxetine for menopausal hot flushes. N Engl J Med 2014;370:1777-1779',
        identifier: '10.1056/NEJMp1402080',
        kind: 'doi',
      },
      NETWORK_META_SOURCE,
      SEROTONIN_UMBRELLA_SOURCE,
      PUBLICATION_BIAS_SOURCE,
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — paroxetine, 150 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 43815 — paroxetine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/43815',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Venlafaxine — sold on a second neurotransmitter, whose clearest evidence of arriving is a
  //    dose-dependent rise in blood pressure written into its own label.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'venlafaxine',
    name: 'Venlafaxine',
    tradeName: 'Effexor / Effexor XR',
    sponsor:
      'Wyeth Pharmaceuticals, now part of Pfizer (originator, NDA 020151 for the tablets and NDA 020699 for the extended-release capsules); generic since 2006 and made by many manufacturers',
    targetGene: 'SLC6A4 and SLC6A2',
    targetProtein:
      'Serotonin transporter (SERT) and noradrenaline transporter (NET). The label states venlafaxine and its active metabolite O-desmethylvenlafaxine are potent inhibitors of both and weak inhibitors of dopamine reuptake, with no significant affinity for muscarinic, histaminergic or alpha-1 receptors',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1993,
    indication:
      'Treatment of major depressive disorder in adults, established in 6-week controlled trials of outpatients and a 4-week controlled trial of inpatients with major depression with melancholia. The extended-release capsule carries additional indications for generalized anxiety disorder, social anxiety disorder and panic disorder',
    patientFriendlyIndication:
      'Depression; the extended-release form is also used for several anxiety disorders',
    anatomicalSite:
      'Serotonin and noradrenaline transporters on presynaptic terminals in the central nervous system; the peripheral noradrenergic effect is measurable at the blood vessel',
    conditionContext: {
      conditionExplainer:
        'Major depressive disorder is diagnosed from symptoms and measured in trials on the Hamilton scale. Venlafaxine’s licensing trials ran six weeks in outpatients and four weeks in inpatients with melancholia.',
      whyItMatters:
        'Venlafaxine was the first drug marketed on the idea that hitting two neurotransmitter systems beats hitting one. The clearest evidence that the second system is engaged is not an efficacy result — it is the dose-dependent rise in blood pressure written into the label, which climbs from 3% of patients below 100 mg a day to 13% above 300 mg.',
      whoTakesThis:
        'Adults with major depressive disorder, and with the extended-release form generalized anxiety disorder, social anxiety disorder and panic disorder. Not people taking a monoamine oxidase inhibitor. People with pre-existing high blood pressure should have it controlled first, and the label directs regular blood pressure monitoring for everyone on the drug.',
      clinicalGoals:
        'A fall in the Hamilton score. The label makes no cardiovascular claim in either direction and the drug was never evaluated to any appreciable extent in recent myocardial infarction or unstable heart disease.',
    },
    oneSentenceVerdict:
      'A serotonin and noradrenaline reuptake inhibitor whose second mechanism is dose-dependent — sustained diastolic hypertension rises from 3% below 100 mg/day to 13% above 300 mg/day against 2% on placebo — and whose claimed advantage over the SSRIs rests on a manufacturer-pooled analysis of eight trials reporting remission of 45% against 35%, while the label separately records that overdose carries a higher risk of fatal outcome than the SSRIs.',
    laymanHowItWorks:
      'Venlafaxine blocks two recycling pumps rather than one: the serotonin pump, like an SSRI, and the noradrenaline pump as well. The second block needs a higher dose to appear, which is why low doses behave much like an SSRI and higher doses bring in the noradrenaline effects — a faster pulse and a higher blood pressure. The label does not claim to know why any of this lifts mood; it says only that the antidepressant action is believed to be associated with potentiating neurotransmitter activity.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1162 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 217 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 28 December 1993 under NDA 020151, with the extended-release capsule following under NDA 020699; generic since 2006. The 217 listed products reflect how many immediate-release and extended-release presentations are sold under one name, and the extended-release form was the subject of extended patent litigation after the immediate-release molecule lost protection.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The question venlafaxine raises is whether a second neurotransmitter is worth a measurable blood pressure cost and a harder discontinuation. Its own active metabolite is sold as a separate drug. Duloxetine reaches both transporters without the same dose-dependent hypertension profile. And the SSRIs remain the comparison the original superiority claim was made against.',
      conventionalRx: [
        {
          name: 'Desvenlafaxine (Pristiq)',
          class:
            'Serotonin-noradrenaline reuptake inhibitor — the O-desmethyl metabolite of venlafaxine',
          howItCompares:
            'This is the compound venlafaxine turns into in the liver, sold as a drug in its own right. Taking it removes the CYP2D6 conversion step and the variability that comes with it. It is the same pharmacological family and it does not escape the class blood-pressure or discontinuation problems.',
          typicalCost: 'Generic; available at pharmacy acquisition cost as an ordinary generic',
          prosAndCons:
            'Pros: no dependence on CYP2D6 conversion, so less inter-individual variation. Cons: launched as a branded product built on the active metabolite of a molecule that was going generic, which is a commercial argument as much as a pharmacological one.',
        },
        {
          name: 'Duloxetine (Cymbalta)',
          class: 'Serotonin-noradrenaline reuptake inhibitor',
          howItCompares:
            'Reaches both transporters across its whole licensed dose range rather than sequentially, and carries pain indications venlafaxine does not. In the 2018 network meta-analysis, duloxetine and venlafaxine both sat in the group with the highest dropout rates (range of odds ratios 1.30 to 2.32).',
          typicalCost:
            'US$0.1293 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 74 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: licensed for diabetic peripheral neuropathic pain and chronic musculoskeletal pain as well as depression and anxiety. Cons: a hepatotoxicity warning venlafaxine does not carry; the capsule is not designed to be split, which complicates any reduction.',
        },
        {
          name: 'Sertraline or escitalopram',
          class: 'Selective serotonin reuptake inhibitors',
          howItCompares:
            'The comparison group in the analysis that made venlafaxine’s reputation: pooled remission of 45% on venlafaxine against 35% on an SSRI and 25% on placebo across eight trials, odds ratio 1.50 (1.3 to 1.9). That analysis was produced by the manufacturer’s own investigators, and the independent 2018 network meta-analysis found venlafaxine among the more efficacious drugs head to head but also among those with the highest dropout rates, while escitalopram was in both the more efficacious and the more tolerable groups.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: no dose-dependent hypertension; easier discontinuation; lower fatal toxicity in overdose than venlafaxine, per venlafaxine’s own label. Cons: if the noradrenergic effect is what a particular person needed, it is not there.',
        },
      ],
      naturalFoods: [
        {
          name: 'Aerobic exercise',
          activeCompound: 'Not a compound — a behavioural exposure',
          biologicalMechanism:
            'Acute exercise raises circulating noradrenaline and adrenaline sharply and, unlike a reuptake inhibitor, does so transiently and with the opposite chronic effect on resting blood pressure. It is the clearest available illustration that raising noradrenergic tone and raising blood pressure are not the same intervention.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice, and not offered as a substitute for a prescribed drug. Noted because the label directs regular blood pressure monitoring on venlafaxine and records a mean heart rate increase of about 4 beats per minute, both of which interact with what exercise does.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Have your blood pressure checked, repeatedly',
          action:
            'Not a general wellness suggestion — the label directs regular monitoring for everyone on this drug.',
          patientImpact:
            'Sustained diastolic elevation, defined as treatment-emergent supine diastolic pressure of 90 mmHg or more and at least 10 mmHg above baseline across three consecutive visits, occurred in 3% below 100 mg/day, 5% at 101 to 200 mg, 7% at 201 to 300 mg and 13% above 300 mg, against 2% on placebo.',
          clinicalPrecaution:
            'The label directs that pre-existing hypertension be controlled before starting, and that a sustained increase on treatment prompt consideration of dose reduction or discontinuation. Most of the increases were modest, 10 to 15 mmHg, and 19 patients across the premarketing programme were discontinued for hypertension.',
        },
        {
          name: 'Do not run out of it',
          action:
            'Missing doses of this drug is not the same as missing doses of most drugs in its class.',
          patientImpact:
            'The label records that abrupt discontinuation or dose reduction at various doses is associated with new symptoms whose frequency increased with dose level and with longer treatment: agitation, anorexia, anxiety, confusion, impaired coordination and balance, diarrhoea, dizziness, dry mouth, dysphoric mood, fasciculation, fatigue, flu-like symptoms, headache, hypomania, insomnia, nausea, nervousness, nightmares, shock-like electrical sensations, somnolence, sweating, tremor, vertigo and vomiting.',
          clinicalPrecaution:
            'Spontaneous postmarketing reports across the class add seizures. Any reduction is a clinical decision, and this page gives no schedule.',
        },
        {
          name: 'Ask for a cholesterol check on long-term treatment',
          action: 'The label suggests it directly, and it is easy to forget on a psychiatric drug.',
          patientImpact:
            'Clinically relevant increases in serum cholesterol were recorded in 5.3% of venlafaxine-treated patients and 0% of placebo-treated patients treated for at least three months in placebo-controlled trials.',
          clinicalPrecaution:
            'The label states that measurement of serum cholesterol should be considered during long-term treatment. It does not say what to do about a rise.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(C)CC(C1=CC=C(C=C1)OC)C2(CCCCC2)O',
      chemicalFormula: 'C17H27NO2',
      molecularWeight: '277.40 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'A racemate. The label states venlafaxine and its active metabolite O-desmethylvenlafaxine are potent inhibitors of neuronal serotonin and noradrenaline reuptake and weak inhibitors of dopamine reuptake, with no significant affinity for muscarinic, histaminergic or alpha-1 adrenergic receptors in vitro, and no monoamine oxidase inhibitory activity. At least 92% of a single dose is absorbed; about 87% is recovered in urine within 48 hours as unchanged drug (5%), unconjugated O-desmethylvenlafaxine (29%) and conjugated metabolite. O-desmethylvenlafaxine is the only major active metabolite and is itself marketed as a separate drug.',
      structureSource: {
        label:
          'PubChem CID 5656 (venlafaxine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; transporter selectivity, receptor affinity and mass-balance figures from the venlafaxine United States prescribing information, Clinical Pharmacology',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5656',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ven-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity, salt form and the O-desmethyl impurity',
          description:
            'The impurity that matters is the drug’s own active metabolite, which is a licensed medicine in its own right. Its limit is therefore a potency specification as much as a purity one. For extended-release presentations the dissolution profile is the release test that distinguishes one product from another, which is why 217 products are listed under a single generic name.',
          reagentsAndBuffer:
            'Venlafaxine hydrochloride reference standard, O-desmethylvenlafaxine reference standard, reverse-phase HPLC with UV detection, USP dissolution apparatus for the extended-release forms, Karl Fischer titration',
        },
        {
          id: 'ven-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Attach a dimethylaminoethyl arm to a cyclohexanol',
          description:
            'The molecule is unusually simple for a psychotropic: a cyclohexane ring bearing a tertiary alcohol, joined to a 4-methoxyphenyl group and a dimethylaminomethyl arm on the adjacent carbon. There is one stereocentre and the drug is marketed as the racemate, so no resolution step is required — a large part of why this is one of the cheapest antidepressants to make.',
          dependsOnStepId: 'ven-w1',
          reagentsAndBuffer:
            '4-Methoxyphenylacetonitrile, cyclohexanone, a strong base for the addition, catalytic hydrogenation of the nitrile to the primary amine, reductive methylation with formaldehyde and formic acid or sodium borohydride',
        },
        {
          id: 'ven-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the hydrochloride and, for the ER form, coat the beads',
          description:
            'Salt formation and recrystallisation are straightforward. The manufacturing difficulty in this product line is not chemical but formulation: the extended-release capsule is a population of coated spheroids whose release profile determines the peak-to-trough ratio, and therefore how sharply the noradrenergic effects and the discontinuation symptoms appear.',
          dependsOnStepId: 'ven-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in an alcoholic solvent, recrystallisation, microcrystalline cellulose spheroid cores with ethylcellulose or methacrylate release-controlling coats, dissolution testing across the full profile rather than at a single time point',
        },
        {
          id: 'ven-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure serotonin and noradrenaline transporter potency separately, across concentrations',
          description:
            'The entire clinical claim for this drug is that it engages a second transporter, and the entire dose-response argument is that the second one needs higher concentrations. Both are transporter-selectivity questions that have to be answered as a ratio across a concentration range, with parent and metabolite tested separately, not as a single potency number.',
          dependsOnStepId: 'ven-w3',
          reagentsAndBuffer:
            'HEK293 cells stably expressing human SLC6A4 or SLC6A2, tritiated serotonin and tritiated noradrenaline uptake assays run in parallel, venlafaxine and O-desmethylvenlafaxine as separate test articles across a full concentration series',
        },
        {
          id: 'ven-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Pair plasma exposure with blood pressure and heart rate, not just with a rating scale',
          description:
            'The noradrenergic mechanism has a peripheral readout that a rating scale cannot see. Measuring supine diastolic pressure and heart rate against measured plasma concentration is what turned the second mechanism from a marketing claim into the dose-response table on the label, and it is the measurement any successor molecule should be held to.',
          dependsOnStepId: 'ven-w4',
          reagentsAndBuffer:
            'Liquid chromatography-tandem mass spectrometry for venlafaxine and O-desmethylvenlafaxine with deuterated internal standards, CYP2D6 genotyping, standardised supine blood pressure and heart rate at fixed intervals, 12-lead electrocardiography for QTc',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ven-a1',
        category: 'measured',
        title: 'The second mechanism shows up as blood pressure, and it is dose-dependent',
        laymanSummary:
          'The label carries a table almost no other antidepressant has: the higher the dose, the more people develop sustained high blood pressure. Three per cent below 100 mg a day; thirteen per cent above 300 mg. Placebo was two per cent.',
        technicalDetails:
          'Two separate label findings. In a premarketing study comparing fixed doses of 75, 225 and 375 mg/day against placebo, mean supine diastolic pressure rose 7.2 mmHg in the 375 mg group at week 6, against essentially no change at 75 and 225 mg and a mean fall of 2.2 mmHg on placebo. Separately, pooling the premarketing studies and defining sustained hypertension as treatment-emergent supine diastolic pressure of 90 mmHg or more and at least 10 mmHg above baseline across three consecutive visits gave incidences of 3% below 100 mg/day, 5% at 101 to 200 mg, 7% at 201 to 300 mg and 13% above 300 mg, against 2% on placebo. Most increases were modest at 10 to 15 mmHg and 19 patients, under 1% of those treated, were discontinued for hypertension. The label also records a mean heart rate rise of about 4 beats per minute and, in the extended-release trials, a mean QTc change of +4.7 msec against −1.9 msec on placebo. This is the noradrenergic pharmacology becoming visible in the periphery, and it is the most direct evidence on the document that the second transporter is engaged at higher doses at all.',
        evidenceSource:
          'Venlafaxine United States prescribing information, Warnings — Sustained Hypertension, and Precautions — Use in Patients with Concomitant Illness (NDA 020151)',
        measuredMetric:
          'Incidence of sustained diastolic elevation by daily dose band, and mean supine diastolic change at 375 mg/day',
        auditFlag: 'caution',
      },
      {
        id: 'ven-a2',
        category: 'inferred',
        title: 'The superiority-over-SSRIs claim came from the manufacturer’s own pooled analysis',
        laymanSummary:
          'The reputation that venlafaxine beats the SSRIs rests on a 2001 pooling of eight company trials: remission 45% on venlafaxine, 35% on an SSRI, 25% on placebo. It was published by the manufacturer’s investigators and drew three separate published critiques.',
        technicalDetails:
          'Thase, Entsuah and Rudolph pooled eight comparable randomised double-blind studies of major depressive disorder to compare remission, defined as a Hamilton score of 7 or below, on venlafaxine (n=851), an SSRI — fluoxetine, paroxetine or fluvoxamine (n=748) — or placebo in four of the studies (n=446). Remission was 45% (382/851) on venlafaxine, 35% (260/748) on SSRIs and 25% (110/446) on placebo, p<0.001, odds ratio 1.50 (1.3 to 1.9) favouring venlafaxine over the SSRIs; the venlafaxine-SSRI difference reached significance at week 2 and the SSRI-placebo difference at week 4, and results did not depend on any single study or on the definition of remission. Two of the three authors were with the manufacturer, the pooled trials were company trials, and the paper attracted published comment in the same journal in 2001, 2002 and 2004. The independent 2018 network meta-analysis of 522 trials placed venlafaxine among the seven drugs more effective than others in head-to-head comparison, so the efficacy end of the claim partly survives — but placed it equally among the drugs with the highest dropout rates.',
        evidenceSource:
          'Thase ME, Entsuah AR, Rudolph RL. Remission rates during treatment with venlafaxine or selective serotonin reuptake inhibitors. Br J Psychiatry 2001;178:234-241; Cipriani A et al., Lancet 2018;391:1357-1366',
        doi: '10.1192/bjp.178.3.234',
        inferredClaim:
          'That dual serotonin and noradrenaline reuptake inhibition produces clinically better outcomes than serotonin reuptake inhibition alone — a claim built from a manufacturer-pooled set of its own trials and only partly supported by the later independent network analysis',
        auditFlag: 'contested',
      },
      {
        id: 'ven-a3',
        category: 'failed',
        title: 'Its own label says overdose is more often fatal than with the SSRIs',
        laymanSummary:
          'The prescribing information states that published studies report venlafaxine overdose carries an increased risk of death compared with the SSRIs — lower than the tricyclics, but higher than the class it was meant to improve on.',
        technicalDetails:
          'The Overdosage section reports 14 acute overdoses in the premarketing programme, all of whom recovered without sequelae; the patient who took 2.75 g had two generalised convulsions and QTc prolongation to 500 msec from a baseline of 405 msec. It then states: "Published retrospective studies report that venlafaxine overdosage may be associated with an increased risk of fatal outcomes compared to that observed with SSRI antidepressant products, but lower than that for tricyclic antidepressants." Postmarketing overdose events include tachycardia, consciousness ranging from somnolence to coma, mydriasis, seizures, vomiting, QT prolongation, bundle branch block, QRS prolongation, ventricular tachycardia, bradycardia, hypotension, rhabdomyolysis, liver necrosis, serotonin syndrome and death. A drug prescribed for a condition whose defining risk is self-harm, carrying a higher fatal-toxicity index than its comparator class, is a trade-off that belongs on the front of the page rather than in the overdose section.',
        evidenceSource:
          'Venlafaxine United States prescribing information, Overdosage — Human Experience (NDA 020151)',
        measuredMetric:
          'Relative risk of fatal outcome in overdose against SSRIs and tricyclics, as stated on the label',
        auditFlag: 'caution',
      },
      {
        id: 'ven-a4',
        category: 'failed',
        title: 'Discontinuation symptoms that get worse the longer you have taken it',
        laymanSummary:
          'Stopping or even cutting the dose produces new symptoms, and the label says the frequency rose both with the dose and with how long the person had been taking it. The list runs from electric-shock sensations to hypomania.',
        technicalDetails:
          'Discontinuation symptoms were systematically evaluated, prospectively in the generalized anxiety disorder trials and retrospectively in the depression trials. The label states that abrupt discontinuation or dose reduction at various doses was associated with the appearance of new symptoms whose frequency increased with increased dose level and with longer duration of treatment. The reported list is agitation, anorexia, anxiety, confusion, impaired coordination and balance, diarrhoea, dizziness, dry mouth, dysphoric mood, fasciculation, fatigue, flu-like symptoms, headache, hypomania, insomnia, nausea, nervousness, nightmares, sensory disturbances including shock-like electrical sensations, somnolence, sweating, tremor, vertigo and vomiting. Spontaneous postmarketing reports across the class add tinnitus and seizures. The dose-and-duration gradient is the important part: it means the difficulty of stopping is not a fixed property of the drug but something that accumulates during treatment, which is not how most people are told about it at the start.',
        evidenceSource:
          'Venlafaxine United States prescribing information, Precautions — Discontinuation of Treatment (NDA 020151)',
        measuredMetric:
          'Frequency of discontinuation-emergent symptoms as a function of dose level and treatment duration',
        auditFlag: 'caution',
      },
      {
        id: 'ven-a5',
        category: 'measured',
        title: 'Cholesterol rose in one in twenty on long-term treatment, and in nobody on placebo',
        laymanSummary:
          'In placebo-controlled trials of at least three months, clinically relevant increases in serum cholesterol appeared in 5.3% of people on venlafaxine and 0% of those on placebo.',
        technicalDetails:
          'The label states that clinically relevant increases in serum cholesterol were recorded in 5.3% of venlafaxine-treated patients and 0% of placebo-treated patients treated for at least three months in placebo-controlled trials, and that measurement of serum cholesterol should be considered during long-term treatment. It does not define "clinically relevant", state the magnitude of the rise, or say what should follow from finding one. Against a zero placebo rate this is an unusually clean signal for a laboratory finding, and it sits alongside the blood pressure and heart rate effects as a set of cardiovascular risk-factor changes on a drug taken for years without any cardiovascular outcome data.',
        evidenceSource:
          'Venlafaxine United States prescribing information, Precautions — Serum Cholesterol Elevation (NDA 020151)',
        measuredMetric:
          'Proportion with clinically relevant serum cholesterol increase over at least three months, drug against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'ven-a6',
        category: 'failed',
        title: 'Never studied in the people its blood pressure effect matters most to',
        laymanSummary:
          'The drug raises blood pressure and heart rate. People with a recent heart attack or unstable heart disease were systematically excluded from the trials, so what it does in them is unknown.',
        technicalDetails:
          'The label states that venlafaxine has not been evaluated or used to any appreciable extent in patients with a recent history of myocardial infarction or unstable heart disease, and that patients with these diagnoses were systematically excluded from many clinical studies during premarketing testing. What was measured instead: electrocardiograms in 769 patients in 4- to 6-week placebo-controlled trials showed no difference from placebo in trial-emergent conduction abnormalities, with a mean heart rate rise of about 4 beats per minute; in the extended-release trials, 357 treated and 285 placebo patients over 8 to 12 weeks showed a mean QTc change of +4.7 msec against −1.9 msec on placebo and a mean heart rate change of +4 against +1 beat per minute. Those are reassuring numbers in a population selected to exclude the people at risk. The combination of a documented pressor effect, a documented heart rate effect, a small QTc effect and a systematic exclusion of cardiac patients is a specific evidence gap rather than a general caution.',
        evidenceSource:
          'Venlafaxine United States prescribing information, Precautions — Use in Patients with Concomitant Illness (NDA 020151)',
        measuredMetric:
          'Electrocardiographic and heart rate findings in trial populations, against the cardiac populations excluded from those trials',
        auditFlag: 'caution',
      },
      {
        id: 'ven-a7',
        category: 'inferred',
        title: 'Two transmitters, and no stated mechanism for either',
        laymanSummary:
          'The whole pitch for this drug is that two neurotransmitters beat one. The label’s own wording is that the antidepressant action is "believed to be associated with" potentiating neurotransmitter activity.',
        technicalDetails:
          'The Clinical Pharmacology section reads: "The mechanism of the antidepressant action of venlafaxine in humans is believed to be associated with its potentiation of neurotransmitter activity in the CNS." What follows is preclinical transporter pharmacology and a list of receptors venlafaxine does not bind. No claim is made that depression involves a deficit of either transmitter. The 2022 umbrella review of the serotonin theory found no consistent evidence of a serotonergic abnormality in depression across 17 reviews and large data-set analyses; no equivalent body of evidence establishes a noradrenergic one either. The dual-transporter argument is therefore a pharmacological description that has been read as a pathophysiological explanation, and the label does not make that step.',
        evidenceSource:
          'Venlafaxine United States prescribing information, Clinical Pharmacology — Pharmacodynamics (NDA 020151); Moncrieff J et al., Mol Psychiatry 2023;28:3243-3256',
        doi: '10.1038/s41380-022-01661-0',
        inferredClaim:
          'That correcting a combined serotonin and noradrenaline deficit is what makes this drug work — a reading of transporter pharmacology as pathophysiology that the label declines to make',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed almost completely, then largely converted',
        laymanDesc:
          'Nearly all of a dose is absorbed, and most of it is turned by the liver into a second active compound that is itself sold as a separate antidepressant.',
        molecularDetail:
          'At least 92% of a single dose is absorbed. About 87% is recovered in urine within 48 hours as unchanged venlafaxine (5%), unconjugated O-desmethylvenlafaxine (29%) and conjugated metabolite. O-desmethylvenlafaxine is the only major active metabolite, is formed mainly by CYP2D6, and is marketed separately as desvenlafaxine.',
        iconName: 'Filter',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'At low doses it behaves like an SSRI',
        laymanDesc:
          'The serotonin pump is blocked first. At the lower end of the dose range the drug is doing much what an ordinary SSRI does.',
        molecularDetail:
          'Venlafaxine and its metabolite are potent inhibitors of neuronal serotonin reuptake and weak inhibitors of dopamine reuptake, with no significant affinity for muscarinic, histaminergic or alpha-1 adrenergic receptors and no monoamine oxidase inhibitory activity. The noradrenergic contribution is the part that is dose-dependent, which the pooled analysis that made the drug’s reputation acknowledged in its own opening line.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'At higher doses the noradrenaline pump joins in',
        laymanDesc:
          'Push the dose up and the second pump is blocked too. That is the drug’s selling point, and it is also where the side effects change character.',
        molecularDetail:
          'Both venlafaxine and O-desmethylvenlafaxine are potent inhibitors of noradrenaline reuptake in preclinical work. The clinical signature of that block arriving is peripheral: sustained diastolic hypertension rising from 3% below 100 mg/day to 13% above 300 mg/day against 2% on placebo, and a mean supine diastolic rise of 7.2 mmHg at 375 mg/day against a 2.2 mmHg fall on placebo.',
        iconName: 'TrendingUp',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Heart rate and cholesterol move too',
        laymanDesc:
          'Beyond blood pressure, the pulse runs about four beats a minute faster, and one in twenty people on long-term treatment develops a meaningful rise in cholesterol.',
        molecularDetail:
          'Mean heart rate increase of about 4 beats per minute against 1 on placebo; mean QTc change of +4.7 msec against −1.9 msec on placebo across 357 treated and 285 placebo patients in the extended-release trials; clinically relevant serum cholesterol increases in 5.3% against 0% on placebo over at least three months. No conduction abnormality signal was seen in 769 patients over 4 to 6 weeks.',
        iconName: 'HeartPulse',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'A Hamilton score falls',
        laymanDesc:
          'Six-week outpatient trials and a four-week inpatient trial in melancholic depression are what the licence rests on.',
        molecularDetail:
          'The indication was established in 6-week controlled trials of adult outpatients and a 4-week controlled trial of inpatients meeting criteria for major depression with melancholia. Pooled across eight manufacturer trials, remission on a Hamilton score of 7 or below was 45% on venlafaxine, 35% on an SSRI and 25% on placebo.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And stopping becomes its own problem',
        laymanDesc:
          'The longer you take it and the higher the dose, the more likely stopping produces new symptoms — including the electric-shock sensations this drug is known for.',
        molecularDetail:
          'The label states discontinuation-emergent symptoms increased in frequency with dose level and with longer treatment duration, listing among others impaired coordination and balance, fasciculation, nightmares, hypomania and shock-like electrical sensations, with seizures added from postmarketing reports across the class.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Fixed-dose premarketing blood pressure study (NDA 020151, Warnings)',
        phase: 'Randomised, double-blind, placebo-controlled, three fixed doses',
        sampleSize: 0,
        primaryEndpoint:
          'Change in supine diastolic blood pressure at week 6 on venlafaxine 75, 225 and 375 mg/day against placebo',
        endpointMet: true,
        statisticalPValue:
          'Mean supine diastolic rise of 7.2 mmHg at 375 mg/day, essentially no change at 75 and 225 mg, and a mean fall of 2.2 mmHg on placebo',
        unreportedAdverseSignals:
          'This is a safety finding reported in the Warnings section rather than an efficacy trial, and the label does not state the randomised sample size, so none is asserted here. Pooled across the premarketing programme, sustained diastolic elevation occurred in 3%, 5%, 7% and 13% across ascending dose bands against 2% on placebo.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Pooled analysis of eight manufacturer trials (Br J Psychiatry 2001;178:234-241)',
        phase: 'Pooled analysis of eight randomised, double-blind studies',
        sampleSize: 2045,
        primaryEndpoint:
          'Remission, defined as a Hamilton Rating Scale for Depression score of 7 or below, on venlafaxine against SSRIs and against placebo',
        endpointMet: true,
        statisticalPValue:
          'Remission 45% (382/851) on venlafaxine, 35% (260/748) on an SSRI and 25% (110/446) on placebo; p<0.001, odds ratio 1.50 (1.3 to 1.9) favouring venlafaxine over the SSRIs',
        unreportedAdverseSignals:
          'Two of three authors were with the manufacturer and all eight pooled trials were company trials. The paper drew published comment in the same journal in 2001, 2002 and 2004. The independent 2018 network meta-analysis placed venlafaxine among the more efficacious drugs head to head but also among those with the highest dropout rates.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Extended-release electrocardiographic analysis (NDA 020699, Precautions)',
        phase: 'Pooled analysis of 8- to 12-week double-blind placebo-controlled trials',
        sampleSize: 642,
        primaryEndpoint:
          'Mean change from baseline in corrected QT interval and heart rate on venlafaxine extended-release against placebo',
        endpointMet: true,
        statisticalPValue:
          'Mean QTc change +4.7 msec on venlafaxine extended-release against −1.9 msec on placebo; mean heart rate change +4 against +1 beat per minute, significantly higher than placebo',
        unreportedAdverseSignals:
          'Patients with recent myocardial infarction or unstable heart disease were systematically excluded from many premarketing studies, so this analysis describes electrocardiographic behaviour in a population selected to exclude those at highest cardiac risk.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Sustained diastolic elevation in 3%, 5%, 7% and 13% of patients across ascending dose bands against 2% on placebo',
        'Mean supine diastolic rise of 7.2 mmHg at 375 mg/day against a 2.2 mmHg fall on placebo at week 6',
        'Mean heart rate increase of about 4 beats per minute, and a mean QTc change of +4.7 msec against −1.9 msec on placebo',
        'Clinically relevant serum cholesterol increases in 5.3% against 0% on placebo over at least three months',
        'Pooled remission of 45% on venlafaxine against 35% on an SSRI and 25% on placebo across eight manufacturer trials',
      ],
      unsupportedInferences: [
        'That blocking two transporters corrects a combined monoamine deficit — a pathophysiological reading the label does not make of its own pharmacology',
        'That the pooled 45%-against-35% remission difference generalises beyond the manufacturer’s own trial set, when the independent network analysis found the advantage smaller and paired with worse tolerability',
        'That the cardiovascular findings are benign because no conduction abnormality appeared in 769 patients, when cardiac patients were systematically excluded from those trials',
        'That the blood pressure effect is a nuisance rather than a mechanism signal; it is the clearest evidence on the label that the second transporter is engaged at all',
      ],
      whatFailedInitially: [
        'Overdose carries a higher risk of fatal outcome than the SSRIs, by the label’s own statement of the published literature',
        'Discontinuation symptoms increase in frequency with both dose and treatment duration, so the difficulty of stopping accumulates during use',
        'The drug was never evaluated to any appreciable extent in recent myocardial infarction or unstable heart disease despite a documented pressor effect',
        'In the 2018 network meta-analysis venlafaxine sat among the drugs with the highest dropout rates (odds ratios 1.30 to 2.32)',
      ],
      realWorldOutcome: [
        'Approved in the United States on 28 December 1993 under NDA 020151, extended-release under NDA 020699, generic since 2006 and about twelve United States cents a unit at pharmacy acquisition cost',
        'Its own active metabolite was subsequently launched as a separate branded antidepressant, desvenlafaxine',
        'On the WHO Model List of Essential Medicines and among the most-dispensed antidepressants worldwide',
        'The best-known member of its class for discontinuation difficulty, a reputation the label’s own dose-and-duration gradient supports',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 25, 37.5, 50, 75 and 100 mg given two or three times daily, and extended-release capsules and tablets at 37.5, 75, 150 and 225 mg given once daily',
      description:
        'At least 92% of a dose is absorbed and the drug is extensively metabolised in the liver, principally by CYP2D6 to O-desmethylvenlafaxine, the only major active metabolite. About 87% of a dose appears in urine within 48 hours. The extended-release presentations exist to flatten the peak-to-trough swing of an immediate-release drug with a short half-life, which is also why so many distinct products are listed under one generic name.',
      safetyProfile:
        'Boxed warning for suicidal thoughts and behaviours in children, adolescents and young adults. Contraindicated with monoamine oxidase inhibitors, including linezolid and intravenous methylene blue. Dose-dependent sustained hypertension with regular blood pressure monitoring directed and pre-existing hypertension to be controlled first. Mean heart rate rise of about 4 beats per minute and a small mean QTc increase. Serum cholesterol elevation in 5.3% over at least three months. Serotonin syndrome risk with other serotonergic drugs. Angle-closure glaucoma in anatomically narrow angles. Rare reports of interstitial lung disease and eosinophilic pneumonia. Discontinuation symptoms increasing with dose and duration. Overdose associated with a higher risk of fatal outcome than the SSRIs and a lower one than the tricyclics.',
    },
    commonQuestions: [
      {
        q: 'Is venlafaxine actually stronger than an SSRI?',
        a: 'The claim comes from one influential source: a 2001 pooled analysis of eight of the manufacturer’s own trials, which found remission in 45% on venlafaxine, 35% on an SSRI and 25% on placebo, an odds ratio of 1.50. Two of the three authors worked for the manufacturer and the paper drew published criticism in the same journal three times over the following years. The independent 2018 network meta-analysis of 522 trials did place venlafaxine among the seven drugs that outperformed the others in head-to-head comparisons — but placed it equally among the drugs people were most likely to stop taking. There is some independent support for the efficacy half of the claim, and the tolerability half runs the other way.',
        auditNote:
          'A pooled analysis of a manufacturer’s own trials is not the same evidence as an independent synthesis of everyone’s. Both are on this page because both were used to make the argument.',
      },
      {
        q: 'Why does my blood pressure need checking on an antidepressant?',
        a: 'Because this one raises it, and the label says how much. Sustained diastolic elevation — a supine diastolic of 90 mmHg or more and at least 10 mmHg above baseline across three consecutive visits — occurred in 3% of people below 100 mg a day, 5% at 101 to 200 mg, 7% at 201 to 300 mg and 13% above 300 mg, against 2% on placebo. At 375 mg a day the average supine diastolic rose 7.2 mmHg while placebo fell 2.2. The label directs that pre-existing hypertension be controlled before starting, that everyone have regular monitoring, and that a sustained rise prompt consideration of dose reduction or stopping. The same effect is the clearest evidence that the drug’s second mechanism, noradrenaline reuptake blockade, is engaged at all.',
      },
      {
        q: 'I have heard this one is very hard to come off. Is that true?',
        a: 'The label supports the reputation, and adds a detail that is easy to miss: the frequency of discontinuation symptoms increased with the dose level and with how long the person had been taking it. So the difficulty is not a fixed property you can assess at the start — it accumulates. The listed symptoms include agitation, anxiety, confusion, impaired coordination and balance, dizziness, dysphoric mood, fasciculation, flu-like symptoms, hypomania, nightmares, vertigo and the shock-like electrical sensations this drug is particularly associated with; postmarketing reports across the class add seizures. How and whether to reduce it is a clinical decision that depends on the dose and the duration, and this page deliberately gives no schedule.',
      },
      {
        q: 'Is it dangerous in overdose?',
        a: 'More so than the SSRIs, by the label’s own account. The Overdosage section states that published retrospective studies report venlafaxine overdose may be associated with an increased risk of fatal outcomes compared with SSRI antidepressants, though lower than with tricyclics. In the premarketing programme all 14 overdose patients recovered, but one who took 2.75 g had two generalised seizures and a QTc of 500 msec against a baseline of 405. Postmarketing reports include ventricular tachycardia, QRS and QT prolongation, rhabdomyolysis, liver necrosis and death. This matters more than it would for most drugs because the condition being treated is itself associated with self-harm.',
      },
      {
        q: 'What is desvenlafaxine and why is it a separate drug?',
        a: 'It is what your liver turns venlafaxine into. O-desmethylvenlafaxine is venlafaxine’s only major active metabolite, formed mainly by the enzyme CYP2D6, and it accounts for about 29% of the recovered dose in urine. It was developed and launched as a separate branded antidepressant. The pharmacological argument is that giving the metabolite directly removes the conversion step and the person-to-person variation in CYP2D6 activity that goes with it. The commercial context is that it arrived as the parent molecule was approaching the end of its patent life. Both things are true, and neither on its own tells you whether it is a better drug for a particular person.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Venlafaxine United States prescribing information — Boxed Warning, Clinical Pharmacology, Warnings (Sustained Hypertension), Precautions (Serum Cholesterol Elevation, Discontinuation of Treatment, Use in Patients with Concomitant Illness), Overdosage (NDA 020151)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020151',
        kind: 'regulatory',
      },
      {
        label:
          'Venlafaxine hydrochloride extended-release capsules Drugs@FDA record (NDA 020699) — source of the extended-release electrocardiographic analysis',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020699',
        kind: 'regulatory',
      },
      {
        label:
          'Thase ME, Entsuah AR, Rudolph RL. Remission rates during treatment with venlafaxine or selective serotonin reuptake inhibitors. Br J Psychiatry 2001;178:234-241',
        identifier: '10.1192/bjp.178.3.234',
        kind: 'doi',
      },
      NETWORK_META_SOURCE,
      SEROTONIN_UMBRELLA_SOURCE,
      PUBLICATION_BIAS_SOURCE,
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — venlafaxine, 217 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5656 — venlafaxine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5656',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Duloxetine — a drug for diabetic nerve pain that raises blood sugar, and a label unusual for
  //    naming, by study number, the three trials in which it did not work.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'duloxetine',
    name: 'Duloxetine',
    tradeName:
      'Cymbalta / Drizalma Sprinkle / Yentreve (European Union, stress urinary incontinence)',
    sponsor:
      'Eli Lilly and Company (originator, NDA 021427); generic since 2013 and made by many manufacturers. The European stress urinary incontinence product Yentreve is held by Eli Lilly Nederland B.V.',
    targetGene: 'SLC6A4 and SLC6A2',
    targetProtein:
      'Serotonin transporter (SERT) and noradrenaline transporter (NET). The descending inhibitory pain pathways of the spinal cord use both transmitters, which is the pharmacological rationale for the pain indications',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2004,
    indication:
      'Major depressive disorder, generalized anxiety disorder, diabetic peripheral neuropathic pain, fibromyalgia and chronic musculoskeletal pain in adults; generalized anxiety disorder from age seven and fibromyalgia from age thirteen. In the European Union, additionally moderate to severe stress urinary incontinence in women, an indication the United States label does not carry',
    patientFriendlyIndication:
      'Depression, generalised anxiety, nerve pain from diabetes, fibromyalgia and long-term back or joint pain',
    anatomicalSite:
      'Serotonin and noradrenaline transporters in the brain and in the descending pain-inhibiting pathways of the spinal cord',
    conditionContext: {
      conditionExplainer:
        'Duloxetine is licensed across two very different kinds of condition. Depression and anxiety are measured on rating scales; diabetic nerve pain, fibromyalgia and chronic musculoskeletal pain are measured on an eleven-point pain diary. Both are self-report, and neither has a confirmatory test.',
      whyItMatters:
        'Its label is unusually candid in two places. It names, by study number, the three trials that did not demonstrate efficacy. And it records that in patients with diabetic neuropathy — one of its own indications — the drug worsened glycaemic control, with fasting glucose rising 12 mg/dL over up to 52 weeks while a routine-care group fell 11.5.',
      whoTakesThis:
        'Adults across five indications; children from seven for generalized anxiety disorder and from thirteen for fibromyalgia. It is to be avoided in substantial alcohol use or evidence of chronic liver disease, and in uncontrolled narrow-angle glaucoma.',
      clinicalGoals:
        'For depression, a fall in the 17-item Hamilton score, which across the four registration trials was 2.2 to 4.9 points more than placebo. For pain, a fall in daily pain diary scores and the proportion reaching a 50% reduction.',
    },
    oneSentenceVerdict:
      'A dual serotonin-noradrenaline reuptake inhibitor whose depression licence rests on placebo-subtracted 17-item Hamilton differences of 2.2 to 4.9 points across four fixed-dose trials, whose label names three further trials in fibromyalgia, back pain and osteoarthritis that did not demonstrate efficacy, and which raised mean fasting glucose by 12 mg/dL over 52 weeks in the diabetic neuropathy population it is licensed to treat.',
    laymanHowItWorks:
      'Duloxetine blocks the pumps that recycle both serotonin and noradrenaline. Those two transmitters carry the signals in the pathways running down the spinal cord that turn pain volume down, which is why one drug is licensed for both mood and pain. The prescribing information says the exact mechanisms of the antidepressant, pain-inhibiting and anti-anxiety effects in humans are unknown, and that they are believed to be related to potentiating those two systems.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 61,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1293 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 74 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 3 August 2004 under NDA 021427 and generic since December 2013. Because the product is a delayed-release capsule of enteric-coated pellets rather than a plain tablet, generic entry required matching a release profile as well as a molecule, and the same design is the reason the capsule cannot simply be halved.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The alternatives divide by which of duloxetine’s five indications is in question. For depression the comparison is the whole antidepressant class, where the 2018 network meta-analysis placed duloxetine among the drugs with the highest dropout rates. For diabetic nerve pain the comparators are pregabalin and the tricyclics, neither of which raises blood glucose. For chronic musculoskeletal pain, the label’s own negative trials are as informative as its positive ones.',
      conventionalRx: [
        {
          name: 'Pregabalin (Lyrica), for diabetic peripheral neuropathic pain',
          class: 'Alpha-2-delta calcium channel subunit ligand',
          howItCompares:
            'A different mechanism for the same indication, with no effect on glycaemic control and no hepatotoxicity warning. It has its own problems: sedation, weight gain, oedema and dependence, and it is a controlled substance in several jurisdictions.',
          typicalCost: 'Generic; available at pharmacy acquisition cost as an ordinary generic',
          prosAndCons:
            'Pros: does not worsen diabetic control; no liver warning. Cons: sedation and weight gain in a population where weight matters; misuse potential; renal dose adjustment required.',
        },
        {
          name: 'Amitriptyline, for neuropathic pain',
          class: 'Tricyclic antidepressant used off-label or on-label depending on jurisdiction',
          howItCompares:
            'The oldest option and the one with the weakest formal evidence base: the 2015 Cochrane review found no supportive unbiased evidence for a beneficial effect of amitriptyline in neuropathic pain, while noting it has been useful in practice for many years. Duloxetine, by contrast, has two positive 12-week fixed-dose trials in 791 patients.',
          typicalCost:
            'US$0.0904 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 113 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: a third of the price; no glycaemic effect. Cons: anticholinergic burden, cardiotoxicity in overdose, and a Cochrane review that could not find unbiased evidence it works.',
        },
        {
          name: 'Venlafaxine, for depression and anxiety',
          class: 'Serotonin-noradrenaline reuptake inhibitor',
          howItCompares:
            'The same pharmacological family without duloxetine’s hepatotoxicity warning, and with a documented dose-dependent hypertension profile instead. In the 2018 network meta-analysis both drugs sat in the group with the highest dropout rates (odds ratios 1.30 to 2.32).',
          typicalCost:
            'US$0.1162 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 217 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no liver warning; tablets that can be adjusted more finely than a pellet-filled capsule. Cons: sustained hypertension rising to 13% above 300 mg/day; higher fatal toxicity in overdose than the SSRIs.',
        },
      ],
      naturalFoods: [
        {
          name: 'Alpha-lipoic acid, for diabetic distal symmetric polyneuropathy only',
          activeCompound: 'Racemic alpha-lipoic acid (thioctic acid)',
          biologicalMechanism:
            'A mitochondrial cofactor and thiol antioxidant. The proposed mechanism in diabetic neuropathy is reduction of oxidative stress in peripheral nerve rather than any action on monoamine transporters, so it is a genuinely different intervention rather than a weaker version of the same one.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: in the SYDNEY 2 trial, 181 patients received 600, 1,200 or 1,800 mg daily or placebo for five weeks. Total Symptom Score fell 4.9 points (51%) at 600 mg against 2.9 points (32%) on placebo, with response rates of 62% against 26%, and a dose-dependent rise in nausea, vomiting and vertigo. Five weeks is short, and no trial has compared it head to head against duloxetine.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'If you have diabetes, keep watching your sugars',
          action:
            'This is not general diabetes advice — it is specific to a drug licensed for a complication of diabetes.',
          patientImpact:
            'In the extension phase of the three diabetic neuropathy trials, lasting up to 52 weeks, mean fasting blood glucose rose 12 mg/dL on duloxetine and fell 11.5 mg/dL in the routine care group, and HbA1c rose 0.5% against 0.2%. Baseline mean fasting glucose was 176 mg/dL and baseline HbA1c 7.8%.',
          clinicalPrecaution:
            'The label states that duloxetine treatment worsened glycaemic control in some patients with diabetes. It does not say what to do about it, and the routine care comparator was not a placebo arm.',
        },
        {
          name: 'Say if you drink, and report yellowing early',
          action: 'Alcohol history is a prescribing question for this drug, not a lifestyle aside.',
          patientImpact:
            'The label directs avoiding duloxetine in patients with substantial alcohol use or evidence of chronic liver disease, and discontinuing it in anyone who develops jaundice or other evidence of clinically significant liver dysfunction, not to be resumed unless another cause is established. Hepatic failure, sometimes fatal, has been reported.',
          clinicalPrecaution:
            'Alanine transaminase above three times the upper limit of normal occurred in 1.25% of treated patients against 0.45% on placebo, and the median time to detection was about two months, so a normal test on day one is not reassurance.',
        },
        {
          name: 'Do not open, crush or split the capsule to make a smaller dose',
          action:
            'The capsule is a container of enteric-coated pellets, not a compressed tablet, and its design is why fine dose adjustment is difficult.',
          patientImpact:
            'The label records discontinuation symptoms occurring after both abrupt and tapered stopping at 1% or more and significantly more often than placebo: dizziness, headache, nausea, diarrhoea, paraesthesia, irritability, vomiting, insomnia, anxiety, hyperhidrosis and fatigue. Postmarketing reports across the class add electric-shock sensations, hypomania, tinnitus and seizures.',
          clinicalPrecaution:
            'The label directs gradual dose reduction rather than abrupt cessation whenever possible, and says that if intolerable symptoms follow a decrease, resuming the previously prescribed dose may be considered. Any of that is a clinical decision, not one this page can make.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CNCC[C@@H](C1=CC=CS1)OC2=CC=CC3=CC=CC=C32',
      chemicalFormula: 'C18H19NOS',
      molecularWeight: '297.40 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'A single enantiomer, the (S)-isomer, with the (R)-isomer substantially less active — one of the reasons this molecule is more expensive to make than the racemic members of its class. The label states the exact mechanisms of the antidepressant, central pain inhibitory and anxiolytic actions in humans are unknown and are believed to relate to potentiation of serotonergic and noradrenergic activity in the central nervous system. Metabolism involves CYP1A2 and CYP2D6, which is why strong CYP1A2 inhibitors are contraindicated in combination.',
      structureSource: {
        label:
          'PubChem CID 60835 (duloxetine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; mechanism and metabolism statements from the duloxetine United States prescribing information, sections 12.1 and 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60835',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dul-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the S-enantiomer and the acid stability problem',
          description:
            'Duloxetine is a single enantiomer and is also acid-labile: the naphthyl ether hydrolyses in gastric acid, which is why the marketed product is a delayed-release pellet and not a plain tablet. Both facts are release specifications, and the second is the reason the dosage form cannot be split.',
          reagentsAndBuffer:
            'Duloxetine hydrochloride reference standard, chiral HPLC, simulated gastric fluid stability challenge at pH 1.2, dissolution testing in acid stage followed by buffer stage, Karl Fischer titration',
        },
        {
          id: 'dul-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Set the stereocentre and form the naphthyl ether',
          description:
            'The molecule is a thiophene bearing a three-carbon methylaminopropyl chain, with the benzylic carbon carrying an ether to 1-naphthol. That carbon is the single stereocentre and the drug is the S-isomer, so the route needs either an asymmetric reduction or a resolution. The ether is formed by displacement on an activated alcohol, and it is the bond that later fails in acid.',
          dependsOnStepId: 'dul-w1',
          reagentsAndBuffer:
            '2-Acetylthiophene, Mannich reaction with formaldehyde and dimethylamine, asymmetric reduction with a chiral oxazaborolidine or an enzymatic ketoreductase, 1-fluoronaphthalene or 1-naphthol with a base, demethylation to the secondary amine',
        },
        {
          id: 'dul-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the hydrochloride to a defined enantiomeric excess',
          description:
            'Salt formation with control of enantiomeric excess, then recrystallisation. Because the R-isomer is substantially less active, enantiomeric excess is a potency specification, and because the salt must survive coating and storage, the polymorph and water content are release parameters rather than process notes.',
          dependsOnStepId: 'dul-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in an alcoholic solvent, chiral HPLC release testing for enantiomeric excess, X-ray powder diffraction for polymorph identity, controlled-humidity storage',
        },
        {
          id: 'dul-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Coat the pellets so the drug survives the stomach',
          description:
            'The finished dosage form is a capsule of enteric-coated spheroids. The coat is the reason the drug reaches the small intestine intact, and it is also the reason the dose cannot be adjusted at home by opening the capsule. A generic product must match this profile, not just the molecule.',
          dependsOnStepId: 'dul-w3',
          reagentsAndBuffer:
            'Sucrose or microcrystalline cellulose spheroid cores, hypromellose acetate succinate or methacrylic acid copolymer enteric coat, talc and triethyl citrate as processing aids, two-stage dissolution testing in acid then buffer',
        },
        {
          id: 'dul-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure transaminases and fasting glucose as primary safety endpoints',
          description:
            'Two of the most important findings about this drug are laboratory values rather than symptoms, and both take months to appear: the median time to detected transaminase elevation was about two months, and the glycaemic effect emerged in the 52-week extension rather than the 12-week acute phase. A trial short enough to measure a pain score is too short to see either.',
          dependsOnStepId: 'dul-w4',
          reagentsAndBuffer:
            'Serial serum ALT, AST, bilirubin and alkaline phosphatase, fasting plasma glucose and HbA1c at fixed intervals through an extension phase of at least 52 weeks, with a concurrent randomised control rather than a routine-care comparator',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dul-a1',
        category: 'measured',
        title: 'The depression licence is a two-to-five-point Hamilton difference',
        laymanSummary:
          'Four fixed-dose trials supported the depression indication. The gap between drug and placebo on the 17-item Hamilton scale was 4.9 points in one, and between 2.2 and 3.6 points in the other five dose arms.',
        technicalDetails:
          'Table 8 of the label reports placebo-subtracted least-squares mean changes in HAMD-17 total score: Study MDD-1, 60 mg/day, −4.9 (95% CI −6.8 to −2.9); Study MDD-2, 60 mg/day, −2.2 (−4.0 to −0.3); Study MDD-3, 20 mg twice daily −2.4 (−4.7 to −0.2) and 40 mg twice daily −3.6 (−5.9 to −1.4); Study MDD-4, 40 mg twice daily −2.2 (−3.6 to −0.9) and 60 mg twice daily −3.3 (−4.7 to −1.9). Baseline scores ran 17.2 to 21.5. The label adds that there is no evidence doses above 60 mg/day confer additional benefit, despite two of the four trials using 80 and 120 mg/day arms. Four of the six dose arms produced a difference below three points, the threshold the United Kingdom’s NICE has used as a marker of clinical significance on this scale. All six are statistically significant and every confidence interval excludes zero; the question the numbers raise is not whether the effect is real but how large it is, and the label prints the answer.',
        evidenceSource:
          'Duloxetine United States prescribing information, section 14.2 Major Depressive Disorder in Adults, Table 8 (NDA 021427)',
        measuredMetric:
          'Placebo-subtracted least-squares mean change in 17-item Hamilton score across four fixed-dose registration trials',
        auditFlag: 'verified',
      },
      {
        id: 'dul-a2',
        category: 'failed',
        title: 'The label names its own three failed trials by study number',
        laymanSummary:
          'Most labels print only the trials that worked. This one lists three that did not: a sixteen-week fibromyalgia trial, a thirteen-week back pain trial and a thirteen-week osteoarthritis trial.',
        technicalDetails:
          'Section 14 states: "Additionally, a summary of the following trials that did not demonstrate efficacy are presented below: Study FM-3 (a 16-week trial in adult patients with fibromyalgia), Study CLBP-2 (a 13-week trial in adult patients with CLBP), and Study OA-2 (a 13-week trial in adult patients with chronic pain due to OA)." The chronic musculoskeletal pain indication rests on two of three chronic low back pain and osteoarthritis trials, and the fibromyalgia indication on two of three adult trials. That is a one-in-three failure rate disclosed on the document itself, which is a materially better disclosure practice than the field average that the Turner analysis found — where 22 of the FDA’s negative antidepressant trials were never published at all. A label that names its failures is doing the thing this site exists to check.',
        evidenceSource:
          'Duloxetine United States prescribing information, section 14 Clinical Studies (NDA 021427); Turner EH et al., N Engl J Med 2008;358:252-260',
        doi: '10.1056/NEJMsa065779',
        measuredMetric:
          'Number of registration trials in fibromyalgia and chronic musculoskeletal pain that did not demonstrate efficacy, as disclosed on the label',
        auditFlag: 'caution',
      },
      {
        id: 'dul-a3',
        category: 'failed',
        title: 'It worsened blood sugar in the diabetic patients it was licensed to help',
        laymanSummary:
          'Duloxetine is licensed for the nerve pain that diabetes causes. In the year-long extension of its own diabetic neuropathy trials, average fasting glucose rose 12 mg/dL on the drug while the comparison group’s fell 11.5, and HbA1c rose more than twice as much.',
        technicalDetails:
          'Section 5.14 states that duloxetine treatment worsened glycaemic control in some patients with diabetes. Across three trials in neuropathic pain associated with diabetic peripheral neuropathy, mean diabetes duration was about 12 years, mean baseline fasting blood glucose 176 mg/dL and mean baseline HbA1c 7.8%. In the 12-week acute phase, duloxetine was associated with a small increase in mean fasting glucose against placebo. In the extension phase, lasting up to 52 weeks, mean fasting blood glucose increased by 12 mg/dL on duloxetine and decreased by 11.5 mg/dL in the routine care group, and HbA1c increased 0.5% against 0.2%. Two caveats belong with the finding: the comparator in the extension was routine care rather than a randomised placebo, and the acute-phase effect was described as small. The structure of the problem stands regardless — the effect emerges over a year in a population whose complication burden depends on exactly that measurement, and the acute trials were far too short to see it.',
        evidenceSource:
          'Duloxetine United States prescribing information, section 5.14 Glycemic Control in Patients with Diabetes (NDA 021427)',
        measuredMetric:
          'Change in mean fasting blood glucose and HbA1c over an extension phase of up to 52 weeks, drug against routine care',
        auditFlag: 'caution',
      },
      {
        id: 'dul-a4',
        category: 'failed',
        title: 'Liver injury, sometimes fatal, at nearly three times the placebo rate',
        laymanSummary:
          'Alanine transaminase rose above three times the upper limit of normal in 1.25% of people on duloxetine against 0.45% on placebo, and the label records reports of hepatic failure, sometimes fatal.',
        technicalDetails:
          'Section 5.2 records hepatic failure, sometimes fatal, presenting as hepatitis with abdominal pain, hepatomegaly and transaminase elevation above twenty times the upper limit of normal with or without jaundice, in a mixed or hepatocellular pattern; cases of cholestatic jaundice with minimal transaminase elevation have also been reported. Transaminase elevations led to discontinuation in 0.3% of treated patients (92 of 34,756). In adult placebo-controlled trials, ALT above three times the upper limit of normal occurred in 1.25% (144 of 11,496) on duloxetine against 0.45% (39 of 8,716) on placebo, with a dose-response relationship in the fixed-dose studies for both ALT above three times and AST above five times normal. Median time to detection was about two months. The label directs avoiding the drug in substantial alcohol use or evidence of chronic liver disease and discontinuing it on jaundice or clinically significant liver dysfunction, not to be resumed unless another cause is established.',
        evidenceSource:
          'Duloxetine United States prescribing information, section 5.2 Hepatotoxicity (NDA 021427)',
        measuredMetric:
          'Proportion with ALT above three times the upper limit of normal, drug against placebo, and discontinuations for transaminase elevation',
        auditFlag: 'caution',
      },
      {
        id: 'dul-a5',
        category: 'conclusion_shift',
        title:
          'Licensed for incontinence in Europe; the study reports showed harms outweighing benefits',
        laymanSummary:
          'Duloxetine is authorised in the European Union for stress urinary incontinence in women and carries no such indication in the United States. When independent researchers obtained the full clinical study reports, eight women had to be treated for one to feel much better and seven for one to stop because of a side effect.',
        technicalDetails:
          'Yentreve, duloxetine 20 and 40 mg, received European Commission marketing authorisation on 11 August 2004 for moderate to severe stress urinary incontinence in women and remains authorised; the United States label carries no such indication. In 2017 a Nordic Cochrane Centre team obtained the clinical study reports for the four randomised placebo-controlled trials submitted to the European Medicines Agency — 1,913 patients across 6,870 pages including individual patient data — and meta-analysed benefits and harms. Duloxetine was significantly better than placebo on percentage change in weekly incontinence episodes (mean difference −13.56%, 95% CI −21.59 to −5.53) and on Incontinence Quality of Life total score (mean difference 3.24, 95% CI 2.00 to 4.48), but the effect sizes were small: in a sensitivity analysis the number needed to treat for a patient global impression of "much better or very much better" was 8 (95% CI 6 to 13), against numbers needed to harm of 7 (6 to 8) for discontinuing because of an adverse event and 7 (6 to 9) for an activation event. No suicidality, violence or akathisia events were noted. The authors concluded the harms outweighed the benefits. Two regulators looking at overlapping data reached different conclusions about the same indication, and the full study reports were the thing that made the disagreement examinable.',
        evidenceSource:
          'Maund E, Guski LS, Gøtzsche PC. Considering benefits and harms of duloxetine for treatment of stress urinary incontinence: a meta-analysis of clinical study reports. CMAJ 2017;189:E194-E203; European Medicines Agency EPAR for Yentreve, authorised 11 August 2004',
        doi: '10.1503/cmaj.151104',
        measuredMetric:
          'Number needed to treat for global improvement against numbers needed to harm for discontinuation and activation, from clinical study reports',
        auditFlag: 'contested',
      },
      {
        id: 'dul-a6',
        category: 'failed',
        title: 'A dosage form that makes coming off it harder',
        laymanSummary:
          'The capsule holds enteric-coated pellets rather than a solid tablet, so it cannot be split to make a smaller dose. That matters because the label documents a discontinuation syndrome and directs gradual reduction.',
        technicalDetails:
          'Discontinuation symptoms were systematically evaluated. Following abrupt or tapered discontinuation in adult placebo-controlled trials, dizziness, headache, nausea, diarrhoea, paraesthesia, irritability, vomiting, insomnia, anxiety, hyperhidrosis and fatigue each occurred at 1% or greater and significantly more often than on placebo — notably, after tapered as well as abrupt stopping. Postmarketing reports across the SSRI and SNRI classes add dysphoric mood, agitation, electric-shock sensory disturbances, confusion, lethargy, emotional lability, hypomania, tinnitus and seizures, some severe. The label directs gradual dose reduction rather than abrupt cessation whenever possible. The drug is acid-labile, so it is formulated as enteric-coated pellets in a capsule; that formulation is why the available step sizes are the marketed strengths and nothing between them. In the 2018 network meta-analysis duloxetine sat among the antidepressants with the highest dropout rates (range of odds ratios 1.30 to 2.32).',
        evidenceSource:
          'Duloxetine United States prescribing information, section 5.7 Discontinuation Syndrome and Description (NDA 021427); Cipriani A et al., Lancet 2018;391:1357-1366',
        doi: '10.1016/S0140-6736(17)32802-7',
        measuredMetric:
          'Discontinuation-emergent adverse reactions after tapered as well as abrupt stopping, and comparative dropout ranking',
        auditFlag: 'caution',
      },
      {
        id: 'dul-a7',
        category: 'inferred',
        title: 'One pharmacology offered for five different conditions, mechanism unknown',
        laymanSummary:
          'Depression, generalised anxiety, diabetic nerve pain, fibromyalgia and chronic musculoskeletal pain are all attributed to the same two-transmitter action. The label says the exact mechanisms are unknown.',
        technicalDetails:
          'Section 12.1 reads: "Although the exact mechanisms of the antidepressant, central pain inhibitory and anxiolytic actions of duloxetine in humans are unknown, these actions are believed to be related to its potentiation of serotonergic and noradrenergic activity in the CNS." The descending inhibitory pain pathway does use both transmitters, which makes the pain rationale more concrete than the mood one — but the label states all three as beliefs rather than findings. The 2022 umbrella review of the serotonin theory found no consistent evidence of a serotonergic abnormality in depression, and no comparable body of evidence establishes a noradrenergic one. The commercial consequence of a single presumed mechanism spanning five indications is that a positive trial in one condition is routinely read as support for the pharmacology in all five, which is exactly the inference the label’s three named failed trials should discourage.',
        evidenceSource:
          'Duloxetine United States prescribing information, section 12.1 (NDA 021427); Moncrieff J et al., Mol Psychiatry 2023;28:3243-3256',
        doi: '10.1038/s41380-022-01661-0',
        inferredClaim:
          'That one dual-transporter mechanism explains benefit across five unrelated conditions — a belief the label states as such and that its own failed trials in three of those conditions complicate',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A capsule of coated beads, because the molecule dissolves in acid',
        laymanDesc:
          'Duloxetine breaks down in stomach acid, so it is packed as tiny coated pellets that survive the stomach and release in the intestine. That is also why the capsule cannot be split.',
        molecularDetail:
          'The naphthyl ether is acid-labile, so the product is a delayed-release capsule of enteric-coated spheroids rather than a tablet. Generic entry required matching a two-stage dissolution profile, not only the molecule, and the formulation constrains the available dose steps to the marketed strengths.',
        iconName: 'Package',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Cleared by two enzymes, one of them easily blocked',
        laymanDesc:
          'The liver removes it using two different enzymes. One of them, CYP1A2, is blocked by several common drugs, which is why some combinations are ruled out entirely.',
        molecularDetail:
          'Metabolism involves CYP1A2 and CYP2D6. The label directs avoiding co-administration with CYP1A2 inhibitors and with thioridazine. Increased plasma concentrations of duloxetine, and especially of its metabolites, occur in end-stage renal disease, and use is not recommended below a glomerular filtration rate of 30 mL/minute.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Both monoamine pumps are blocked',
        laymanDesc:
          'Serotonin and noradrenaline are both left in the gap between nerve cells for longer. Unlike venlafaxine, duloxetine does this across its whole usual dose range rather than only at the top.',
        molecularDetail:
          'Potent inhibition of both SLC6A4 and SLC6A2. The label states the exact mechanisms of the antidepressant, central pain inhibitory and anxiolytic actions in humans are unknown and are believed to relate to potentiation of serotonergic and noradrenergic activity in the central nervous system. It also records that there is no evidence doses above 60 mg/day confer additional benefit in depression.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The descending pain pathway turns its volume down',
        laymanDesc:
          'Nerves running from the brain down the spinal cord dampen incoming pain signals, and they use these same two transmitters. This is the most concrete of the drug’s three proposed actions.',
        molecularDetail:
          'The descending inhibitory pathways from the periaqueductal grey and rostral ventromedial medulla to the dorsal horn are serotonergic and noradrenergic, which is the pharmacological rationale for licensing an antidepressant in neuropathic and musculoskeletal pain. Efficacy in diabetic peripheral neuropathic pain rests on two 12-week fixed-dose trials in 791 patients, with some reduction in pain from week 1.',
        iconName: 'ArrowDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Scores fall, in most trials',
        laymanDesc:
          'Depression scores fell about two to five points more than placebo. Three pain trials named on the label did not show a benefit at all.',
        molecularDetail:
          'Placebo-subtracted HAMD-17 differences of 2.2 to 4.9 points across four fixed-dose depression trials. In diabetic neuropathic pain, 60 mg once or twice daily significantly improved endpoint mean pain scores and the proportion achieving at least 50% pain reduction. Studies FM-3, CLBP-2 and OA-2 did not demonstrate efficacy and are named on the label.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And two laboratory values move the wrong way',
        laymanDesc:
          'Liver enzymes rise in about one in eighty people, and in diabetic patients blood sugar drifts upward over a year. Neither is something a person feels.',
        molecularDetail:
          'ALT above three times the upper limit of normal in 1.25% against 0.45% on placebo, with a median two months to detection and a dose-response relationship. In the diabetic neuropathy extension to 52 weeks, mean fasting glucose rose 12 mg/dL on duloxetine and fell 11.5 mg/dL on routine care, with HbA1c rising 0.5% against 0.2%.',
        iconName: 'AlertCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Studies MDD-1 to MDD-4 (NDA 021427, section 14.2, Table 8)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, fixed-dose',
        sampleSize: 1059,
        primaryEndpoint:
          'Change from baseline in 17-item Hamilton Depression Rating Scale total score over 8 to 9 weeks in adult outpatients aged 18 to 83',
        endpointMet: true,
        statisticalPValue:
          'Placebo-subtracted least-squares mean HAMD-17 change of −4.9 (95% CI −6.8 to −2.9) in MDD-1, −2.2 (−4.0 to −0.3) in MDD-2, −2.4 and −3.6 in MDD-3, and −2.2 and −3.3 in MDD-4; all dose groups statistically superior to placebo',
        unreportedAdverseSignals:
          'Four of the six dose arms produced a difference below three points on a scale whose baseline values ran 17.2 to 21.5. The label states there is no evidence that doses above 60 mg/day confer additional benefit, despite 80 and 120 mg/day arms being studied. Confidence intervals were not adjusted for multiplicity in the multi-dose trials.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Studies DPNP-1 and DPNP-2 (NDA 021427, section 14.4)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, fixed-dose, 12 weeks',
        sampleSize: 791,
        primaryEndpoint:
          'Change in 24-hour average pain severity on an 11-point diary scale in adults with diabetic peripheral neuropathic pain of at least six months’ duration',
        endpointMet: true,
        statisticalPValue:
          '60 mg once or twice daily statistically significantly improved endpoint mean pain scores and increased the proportion of patients achieving at least a 50% reduction from baseline',
        unreportedAdverseSignals:
          '592 of 791 patients (75%) completed. Patients could take up to 4 g of paracetamol daily alongside the study drug. Non-completers were assigned 0% improvement in the responder figures. The glycaemic effect that these same trials produced appeared in the extension phase, not in these 12 weeks.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Studies FM-3, CLBP-2 and OA-2 — the trials the label names as not demonstrating efficacy',
        phase:
          'Randomised, double-blind, placebo-controlled; 16 weeks (FM-3) and 13 weeks (CLBP-2, OA-2)',
        sampleSize: 0,
        primaryEndpoint:
          'Pain response in fibromyalgia (FM-3), chronic low back pain (CLBP-2) and chronic pain due to osteoarthritis (OA-2)',
        endpointMet: false,
        statisticalPValue:
          'Section 14 states these trials did not demonstrate efficacy; the label summarises them alongside the positive trials rather than omitting them',
        unreportedAdverseSignals:
          'The label does not state randomised sample sizes for these three studies in the section text, so none is asserted here. A one-in-three failure rate disclosed on the label is better practice than the field norm the Turner analysis measured, in which 22 of the FDA’s negative antidepressant trials were never published at all.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId:
          'Four European stress urinary incontinence trials, reanalysed from clinical study reports (CMAJ 2017;189:E194-E203)',
        phase: 'Meta-analysis of four randomised, double-blind, placebo-controlled trials',
        sampleSize: 1913,
        primaryEndpoint:
          'Percentage change in weekly incontinence episodes and change in Incontinence Quality of Life total score in women with stress urinary incontinence',
        endpointMet: true,
        statisticalPValue:
          'Mean difference −13.56% (95% CI −21.59 to −5.53) in weekly incontinence episodes and 3.24 (2.00 to 4.48) on Incontinence Quality of Life; number needed to treat 8 (6 to 13) for a global impression of much or very much better',
        unreportedAdverseSignals:
          'Number needed to harm 7 (95% CI 6 to 8) for discontinuation due to an adverse event and 7 (6 to 9) for an activation event. The authors concluded harms outweighed benefits. The analysis used 6,870 pages of clinical study reports including individual patient data obtained from the European Medicines Agency. There is no United States indication for this use.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Placebo-subtracted 17-item Hamilton differences of 2.2 to 4.9 points across four fixed-dose depression trials',
        'Statistically significant reduction in 24-hour average pain and in the proportion reaching 50% pain relief in 791 patients with diabetic peripheral neuropathic pain',
        'Mean fasting glucose rising 12 mg/dL on duloxetine and falling 11.5 mg/dL on routine care over up to 52 weeks, with HbA1c rising 0.5% against 0.2%',
        'ALT above three times the upper limit of normal in 1.25% (144/11,496) on drug against 0.45% (39/8,716) on placebo',
        'Number needed to treat of 8 against numbers needed to harm of 7 for stress urinary incontinence, from the clinical study reports',
      ],
      unsupportedInferences: [
        'That a single dual-transporter mechanism explains benefit across depression, anxiety, neuropathic pain, fibromyalgia and musculoskeletal pain — stated on the label as a belief, with the mechanisms called unknown',
        'That a positive trial in one of the five indications supports the pharmacology in the others, which the label’s three named failed trials cut against',
        'That doses above 60 mg/day add benefit in depression, which the label explicitly denies',
        'That the acute-phase glycaemic reassurance carries to long-term use, when the effect emerged only in the 52-week extension',
      ],
      whatFailedInitially: [
        'Studies FM-3, CLBP-2 and OA-2 did not demonstrate efficacy, and the label names all three',
        'Hepatic failure, sometimes fatal, is on the label, with transaminase elevation forcing discontinuation in 92 of 34,756 treated patients',
        'Glycaemic control worsened over a year in the diabetic neuropathy population the drug is licensed to treat',
        'The stress urinary incontinence indication exists in the European Union and not in the United States, and the independent analysis of the underlying study reports concluded harms outweighed benefits',
      ],
      realWorldOutcome: [
        'Approved in the United States on 3 August 2004 under NDA 021427 and generic since December 2013, at about thirteen United States cents a capsule at pharmacy acquisition cost',
        'Authorised in the European Union since 11 August 2004 for stress urinary incontinence in women, an indication the United States label has never carried',
        'Among the antidepressants with the highest dropout rates in the 2018 network meta-analysis',
        'One of the most-dispensed drugs in the United States, largely on its pain indications rather than its psychiatric ones',
      ],
    },
    deliverySystem: {
      type: 'Delayed-release capsules of enteric-coated pellets at 20, 30, 40 and 60 mg, taken once or twice daily; a sprinkle formulation exists for people who cannot swallow capsules',
      description:
        'The molecule is acid-labile, so the pellets carry an enteric coat that delays release until the small intestine. Metabolism involves CYP1A2 and CYP2D6. Plasma concentrations of duloxetine and especially its metabolites rise in end-stage renal disease, and the drug is not recommended below a glomerular filtration rate of 30 mL/minute. The dosage form is the reason dose steps are limited to the marketed strengths.',
      safetyProfile:
        'Boxed warning for suicidal thoughts and behaviours in children, adolescents and young adults. Hepatotoxicity including fatal hepatic failure, with avoidance directed in substantial alcohol use or chronic liver disease. Orthostatic hypotension, falls and syncope. Serotonin syndrome. Increased bleeding risk with antiplatelets and anticoagulants. Severe skin reactions including erythema multiforme and Stevens-Johnson syndrome. Activation of mania or hypomania. Angle-closure glaucoma. Seizures. Blood pressure increases, with monitoring directed before and during treatment. Hyponatraemia with SIADH. Worsened glycaemic control in diabetes. Urinary hesitation and retention, sometimes requiring catheterisation. Sexual dysfunction. Discontinuation syndrome after tapered as well as abrupt stopping. Co-administration with CYP1A2 inhibitors or thioridazine is to be avoided.',
    },
    commonQuestions: [
      {
        q: 'How much does it actually help depression?',
        a: 'The label prints the answer, which is unusual. Across the four fixed-dose registration trials, the difference between duloxetine and placebo on the 17-item Hamilton scale was 4.9 points in one trial and between 2.2 and 3.6 points in the other five dose arms, from baseline scores of 17 to 22. Every one of those differences is statistically significant and every confidence interval excludes zero, so the effect is real. Four of the six are below three points, which is the threshold the United Kingdom’s NICE has used as a marker of clinical significance on this scale. The label also states that there is no evidence doses above 60 mg a day add benefit, even though higher doses were studied.',
        auditNote:
          'Real and small are not contradictory findings. The page reports both because a reader deciding whether to start a drug needs the size of the effect, not only the fact of it.',
      },
      {
        q: 'I have diabetes and take this for nerve pain. Does it affect my blood sugar?',
        a: 'The label says it can, and gives numbers. In the extension phase of its own diabetic neuropathy trials, running up to 52 weeks, mean fasting blood glucose rose 12 mg/dL on duloxetine while falling 11.5 mg/dL in the routine care group, and HbA1c rose 0.5% against 0.2%. Baseline mean fasting glucose in that population was 176 mg/dL and baseline HbA1c 7.8%. In the twelve-week acute phase the increase was described as small. Two things temper the finding: the year-long comparison was against routine care rather than a randomised placebo, and the label says "some patients" rather than all. It is still the case that a drug licensed for a complication of diabetes moved the measurement that drives those complications in the wrong direction, over exactly the timescale most people take it for.',
      },
      {
        q: 'Why does the label list trials where the drug did not work?',
        a: 'Because they were part of the submission and the FDA required them summarised. Section 14 names Study FM-3, a sixteen-week fibromyalgia trial; Study CLBP-2, a thirteen-week chronic low back pain trial; and Study OA-2, a thirteen-week osteoarthritis trial, as trials that did not demonstrate efficacy. That is worth noticing rather than passing over. The systematic audit of FDA antidepressant reviews found that 22 negative registered trials were never published anywhere, and that the published literature made 94% of trials look positive where the agency had judged 51% positive. A label that prints its own failures is doing what most of the published record did not.',
      },
      {
        q: 'Why can I not just open the capsule and take half?',
        a: 'Because the capsule is not a container of powder — it is a container of individually coated pellets. Duloxetine breaks down in stomach acid, so each pellet carries an enteric coat designed to survive the stomach and release the drug in the small intestine. Opening or crushing the capsule destroys that coat. This matters more than it would for most drugs because the label documents a discontinuation syndrome — dizziness, headache, nausea, diarrhoea, paraesthesia, irritability, vomiting, insomnia, anxiety, sweating and fatigue all occurring significantly more often than placebo after tapered as well as abrupt stopping — and directs gradual reduction whenever possible. The available step sizes are the marketed strengths and nothing in between. How to manage that is a conversation with a prescriber and a pharmacist.',
      },
      {
        q: 'I read it is used for incontinence. Why is it not licensed for that here?',
        a: 'It is licensed for it in the European Union and not in the United States. Yentreve, duloxetine 20 and 40 mg, has held a European marketing authorisation for moderate to severe stress urinary incontinence in women since 11 August 2004 and remains authorised. In 2017, researchers at the Nordic Cochrane Centre obtained the four clinical study reports submitted for that approval — 6,870 pages covering 1,913 patients, including individual patient data — and meta-analysed them. Duloxetine did beat placebo: weekly incontinence episodes fell 13.56% more and quality-of-life scores rose. But eight women had to be treated for one to rate herself much or very much better, while seven had to be treated for one to stop because of a side effect, and seven for one activation event. The authors concluded the harms outweighed the benefits. The two regulators looked at overlapping evidence and landed differently, which is the kind of disagreement full study reports make visible.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Duloxetine delayed-release capsules United States prescribing information — Boxed Warning, Warnings and Precautions 5.2 Hepatotoxicity, 5.7 Discontinuation Syndrome, 5.14 Glycemic Control, Clinical Pharmacology 12.1, Clinical Studies 14.2 and 14.4 with Table 8 (NDA 021427)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021427',
        kind: 'regulatory',
      },
      {
        label:
          'Maund E, Guski LS, Gøtzsche PC. Considering benefits and harms of duloxetine for treatment of stress urinary incontinence: a meta-analysis of clinical study reports. CMAJ 2017;189:E194-E203',
        identifier: '10.1503/cmaj.151104',
        kind: 'doi',
      },
      {
        label:
          'European Medicines Agency, Yentreve (duloxetine) European public assessment report — marketing authorisation granted 11 August 2004 for moderate to severe stress urinary incontinence in women; holder Eli Lilly Nederland B.V.',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/EPAR/yentreve',
        kind: 'regulatory',
      },
      {
        label:
          'Ziegler D, Ametov A, Barinov A, et al. Oral treatment with alpha-lipoic acid improves symptomatic diabetic polyneuropathy: the SYDNEY 2 trial. Diabetes Care 2006;29:2365-2370',
        identifier: '10.2337/dc06-1216',
        kind: 'doi',
      },
      {
        label:
          'Moore RA, Derry S, Aldington D, Cole P, Wiffen PJ. Amitriptyline for neuropathic pain in adults. Cochrane Database Syst Rev 2015;(7):CD008242 — the comparator evidence cited in the substitutes section',
        identifier: '10.1002/14651858.CD008242.pub3',
        kind: 'doi',
      },
      NETWORK_META_SOURCE,
      PUBLICATION_BIAS_SOURCE,
      SEROTONIN_UMBRELLA_SOURCE,
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — duloxetine, 74 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 60835 — duloxetine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60835',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Trazodone — an antidepressant whose label calls it a selective serotonin reuptake inhibitor
  //    while its own pharmacology section shows it binds a receptor ten times more tightly than the
  //    transporter, and which is mostly taken for a condition it is not licensed for.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'trazodone',
    name: 'Trazodone',
    tradeName: 'Desyrel / Oleptro (both discontinued as brands)',
    sponsor:
      'Pragma Pharmaceuticals on the record enriched here; first approved in the United States in 1981 as Desyrel. Every trazodone product currently listed in Drugs@FDA is an abbreviated application — the originator brand is no longer marketed',
    targetGene: 'HTR2A and SLC6A4',
    targetProtein:
      'Serotonin 5-HT2A receptor, antagonised at Ki 35.6 nM, and the serotonin transporter, inhibited at Ki 367 nM — a tenfold difference in favour of the receptor. Also antagonises 5-HT2B, 5-HT2C, alpha-1A and alpha-2C, and is a 5-HT1A partial agonist',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1981,
    indication: 'Treatment of major depressive disorder in adults',
    patientFriendlyIndication:
      'Depression — although most people who are given it are taking it to sleep, which is not a licensed use',
    anatomicalSite:
      'Serotonin 5-HT2A receptors in the central nervous system, and alpha-1 adrenergic receptors on vascular smooth muscle, which is where the postural drop in blood pressure comes from',
    conditionContext: {
      conditionExplainer:
        'Trazodone’s licensed condition is depression. Its dominant real-world use is insomnia, at doses far below the antidepressant range. Those are two different questions with two different evidence bases, and only one of them has been through a regulator.',
      whyItMatters:
        'The label’s first line calls trazodone a selective serotonin reuptake inhibitor. Its own pharmacodynamics section reports that it binds the 5-HT2A receptor about ten times more tightly than it binds the serotonin transporter, and that it antagonises alpha-1 receptors — the property the label itself blames for postural hypotension. The class descriptor and the numbers on the same document do not agree.',
      whoTakesThis:
        'Adults with major depressive disorder, per the licence. In practice, adults with insomnia, at 25 to 100 mg — a use the American Academy of Sleep Medicine specifically recommends against, and whose dispensing rose anyway.',
      clinicalGoals:
        'For the licensed use, a fall in a depression rating scale. For the dominant use, falling asleep — an outcome no regulator has assessed for this drug.',
    },
    oneSentenceVerdict:
      'An antidepressant whose United States label describes it as a selective serotonin reuptake inhibitor while reporting in its own pharmacology section a serotonin transporter Ki of 367 nM against a 5-HT2A receptor Ki of 35.6 nM, which the 2018 network meta-analysis placed among both the least efficacious and the least tolerable of 21 antidepressants, and whose dominant use — insomnia — is one the American Academy of Sleep Medicine advises against and whose dispensing rose from 8.68% to 14.46% of insured adults with insomnia between 2011 and 2018 regardless.',
    laymanHowItWorks:
      'Trazodone does two things at once, and the label emphasises the smaller one. It blocks the serotonin recycling pump, weakly. Much more strongly, it blocks a serotonin receptor called 5-HT2A, and it blocks the alpha-1 receptors that keep blood vessels tight. Blocking those last two is what makes people drowsy and what makes their blood pressure drop when they stand up — which is why the drug is mostly used as a sleeping tablet even though it is licensed as an antidepressant.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 45,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0506 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 87 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'First approved in the United States in 1981 and generic for decades; every product currently listed in Drugs@FDA is an abbreviated application and the originator brand is not marketed. At about five United States cents a tablet it is among the cheapest prescription drugs in the country, and price is a substantial part of why it became the default off-label hypnotic.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Trazodone’s licensed and common uses need separate comparisons. As an antidepressant it is beaten on both efficacy and tolerability by most of the class. As a hypnotic it is the drug the sleep-medicine guideline singled out to advise against, while the same guideline suggested low-dose doxepin, and the American College of Physicians recommends a non-drug treatment as the first option for chronic insomnia.',
      conventionalRx: [
        {
          name: 'Cognitive behavioural therapy for insomnia (CBT-I)',
          class: 'Structured non-pharmacological treatment — not a medicine',
          howItCompares:
            'The American College of Physicians makes this its only strong recommendation on chronic insomnia: all adult patients should receive CBT-I as the initial treatment, on moderate-quality evidence. Adding a drug at all is a weak recommendation on low-quality evidence, and only after CBT-I alone has been unsuccessful.',
          typicalCost:
            'Not comparable to a tablet price. Access, waiting time and whether a service exists locally are what determine whether anyone gets it.',
          prosAndCons:
            'Pros: the only insomnia treatment with a strong guideline recommendation; no priapism, no postural hypotension, no QT effect, no discontinuation problem. Cons: needs a trained therapist or a validated programme and sustained effort; far less available than a five-cent tablet.',
        },
        {
          name: 'Low-dose doxepin (Silenor)',
          class: 'Tricyclic antidepressant licensed at low dose for sleep maintenance insomnia',
          howItCompares:
            'In the same 2017 guideline that advised against trazodone, doxepin was one of the drugs suggested for sleep maintenance insomnia. It is the direct comparator: another sedating antidepressant, used at a sub-antidepressant dose, but one that went through a regulator for the sleep indication rather than arriving there by custom.',
          typicalCost:
            'US$0.1535 per unit at United States pharmacy acquisition cost (CMS NADAC, median across listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: an actual insomnia indication and a guideline suggestion in its favour. Cons: three times the price; anticholinergic effects at higher strengths; the branded low-dose product has historically cost far more than the generic capsules.',
        },
        {
          name: 'Sertraline, escitalopram or another SSRI, for the licensed indication',
          class: 'Selective serotonin reuptake inhibitors',
          howItCompares:
            'For depression itself, the 2018 network meta-analysis placed trazodone among the four least efficacious of 21 antidepressants in head-to-head comparison (range of odds ratios 0.51 to 0.84) and among the seven with the highest dropout rates (1.30 to 2.32). Escitalopram, sertraline and citalopram all sat in the more tolerable group.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: better placed on both axes of the largest comparison available; no priapism risk. Cons: no sedative effect, which for some people was the point; sexual dysfunction is more prominent.',
        },
      ],
      naturalFoods: [
        {
          name: 'Melatonin, valerian and tryptophan',
          activeCompound:
            'Melatonin (a pineal hormone), valerenic acid and related valepotriates, and L-tryptophan (a serotonin precursor)',
          biologicalMechanism:
            'Melatonin acts at MT1 and MT2 receptors on the suprachiasmatic nucleus to shift circadian timing; valerian extracts modulate GABA-A signalling in vitro; tryptophan is the dietary precursor of serotonin. Three different mechanisms, none of them trazodone’s.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice, and listed for an unusual reason. The 2017 American Academy of Sleep Medicine guideline that recommends against trazodone for sleep onset or maintenance insomnia recommends against melatonin, valerian and tryptophan in exactly the same terms and with the same weak grade. Including them without saying that would be dishonest: on this specific question the guideline treats them the same way it treats the drug.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'If an erection lasts more than four hours, treat it as an emergency',
          action: 'Go to an emergency department. Do not wait to see if it resolves.',
          patientImpact:
            'The label records cases of painful and prolonged penile erections and priapism and directs that immediate medical attention be sought. The mechanism is the same alpha-1 adrenergic blockade that causes the postural hypotension.',
          clinicalPrecaution:
            'Untreated priapism can cause permanent erectile dysfunction. This is the single most specific harm of this drug and it is the reason a five-cent sleeping tablet is not a trivial prescription.',
        },
        {
          name: 'Stand up slowly, especially at night',
          action:
            'The drug is mostly taken at bedtime and its blood pressure effect is at its strongest in the hours after.',
          patientImpact:
            'The label warns of orthostatic hypotension and syncope and attributes it to alpha-1 adrenergic antagonism, for which its own pharmacology section reports a Ki of 153 nM — tighter binding than at the serotonin transporter.',
          clinicalPrecaution:
            'A drug taken at night that lowers standing blood pressure, in a population that often gets up to use the bathroom, is a fall risk. The label also warns of cognitive and motor impairment and advises caution operating machinery.',
        },
        {
          name: 'Ask whether anything else you take affects the heart’s rhythm',
          action:
            'Mention every other prescription, including antiarrhythmics, some antibiotics and some antipsychotics.',
          patientImpact:
            'The label directs avoiding use with other drugs that increase the QT interval and in patients with risk factors for prolonged QT.',
          clinicalPrecaution:
            'This caution is easy to miss because trazodone is often prescribed casually, for sleep, by someone who is not managing the rest of the medication list.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CN(CCN1CCCN2C(=O)N3C=CC=CC3=N2)C4=CC(=CC=C4)Cl',
      chemicalFormula: 'C19H22ClN5O',
      molecularWeight: '371.90 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'The label’s own binding data, in one place: serotonin transporter inhibition at Ki 367 nM; 5-HT2A antagonism at Ki 35.6 nM; 5-HT2B at 78.4 nM; 5-HT2C at 224 nM; alpha-1A at 153 nM; alpha-2C at 155 nM; and 5-HT1A partial agonism at 118 nM. The transporter it is named after on the same document is the weakest of the seven. The label explicitly attributes postural hypotension to the alpha-1 antagonism.',
      structureSource: {
        label:
          'PubChem CID 5533 (trazodone) — canonical SMILES, molecular formula and weight, as carried on the enriched record; all binding constants from the trazodone United States prescribing information, section 12.2 Pharmacodynamics',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5533',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'trz-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the triazolopyridinone core and the meta-chlorophenyl group',
          description:
            'Trazodone is not structurally related to the tricyclics or to the SSRIs — it is a triazolopyridine with a chlorophenylpiperazine tail. The tail is the part that matters for release testing: metachlorophenylpiperazine is both a synthetic precursor and the drug’s major active metabolite, and it is a serotonin receptor agonist in its own right, so its level is a pharmacological specification.',
          reagentsAndBuffer:
            'Trazodone hydrochloride reference standard, meta-chlorophenylpiperazine reference standard, reverse-phase HPLC with UV detection, mass spectrometry for the triazolopyridinone fragment, Karl Fischer titration',
        },
        {
          id: 'trz-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Alkylate the triazolopyridinone with a chlorophenylpiperazine propyl chain',
          description:
            'The synthesis joins two prefabricated halves: a 2H-[1,2,4]triazolo[4,3-a]pyridin-3-one and 1-(3-chlorophenyl)piperazine, linked by a three-carbon chain. The molecule has no stereocentres, which is why it is cheap to make and part of why it costs five cents a tablet.',
          dependsOnStepId: 'trz-w1',
          reagentsAndBuffer:
            '2-Chloropyridine and semicarbazide route to the triazolopyridinone, 1-(3-chlorophenyl)piperazine, 1-bromo-3-chloropropane as the linker, potassium carbonate in a dipolar aprotic solvent',
        },
        {
          id: 'trz-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the hydrochloride and drive residual chlorophenylpiperazine down',
          description:
            'Salt formation and recrystallisation, with the residual piperazine precursor as the controlled impurity. Because that precursor is also the active metabolite, a batch carrying too much of it starts the patient partway through the metabolic pathway rather than at the beginning.',
          dependsOnStepId: 'trz-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in an alcoholic solvent, recrystallisation, HPLC release testing against a meta-chlorophenylpiperazine limit',
        },
        {
          id: 'trz-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Run the full receptor panel, not the transporter alone',
          description:
            'This is the step that determines whether the drug is described accurately. A transporter assay alone returns a serotonin reuptake inhibitor. The panel returns a compound that binds 5-HT2A ten times more tightly and alpha-1A more than twice as tightly as the transporter, which is a different drug and a different set of expected effects.',
          dependsOnStepId: 'trz-w3',
          reagentsAndBuffer:
            'Radioligand binding panel across human 5-HT2A, 5-HT2B, 5-HT2C, 5-HT1A, alpha-1A and alpha-2C, plus HEK293-SLC6A4 tritiated serotonin uptake; trazodone and meta-chlorophenylpiperazine as separate test articles',
        },
        {
          id: 'trz-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure standing blood pressure and QT alongside any sleep endpoint',
          description:
            'The two harms that define this drug in practice — postural hypotension leading to falls, and QT prolongation — are physiological measurements that a sleep diary cannot capture. Any trial of trazodone as a hypnotic that does not take orthostatic vitals and a twelve-lead electrocardiogram is measuring the benefit at higher resolution than the harm.',
          dependsOnStepId: 'trz-w4',
          reagentsAndBuffer:
            'Paired supine and standing blood pressure at fixed intervals after dosing, time-matched 12-lead electrocardiography with individual QT correction, polysomnography or validated actigraphy for the sleep endpoint, plasma trazodone and meta-chlorophenylpiperazine by LC-MS/MS',
        },
      ],
    },
    keyAudits: [
      {
        id: 'trz-a1',
        category: 'conclusion_shift',
        title: 'The label calls it an SSRI; the same label’s numbers say otherwise',
        laymanSummary:
          'Section 1 of the prescribing information describes trazodone as a selective serotonin reuptake inhibitor. Section 12.2 reports that it binds the 5-HT2A receptor about ten times more tightly than it binds the serotonin transporter, and binds alpha-1 receptors more tightly too.',
        technicalDetails:
          'Section 1 reads: "Trazodone is a selective serotonin reuptake inhibitor indicated for the treatment of major depressive disorder." Section 12.1 repeats it — "Trazodone is both a selective serotonin reuptake inhibitor (SSRI) and a 5HT2 receptor antagonist" — and then concedes that "the net result of this action on serotonergic transmission and its role in trazodone’s antidepressant effect is unknown." Section 12.2 gives the numbers: serotonin reuptake inhibition at Ki 367 nM, 5-HT2A antagonism at Ki 35.6 nM, 5-HT2B at 78.4 nM, 5-HT2C at 224 nM, alpha-1A at 153 nM, alpha-2C at 155 nM, and 5-HT1A partial agonism at 118 nM. The transporter is the weakest of the seven listed affinities by an order of magnitude against the strongest. The standard pharmacological description of this compound is a serotonin antagonist and reuptake inhibitor, not a selective serotonin reuptake inhibitor, and the word "selective" is doing work the same document’s binding table does not support. This matters clinically rather than semantically: a reader who takes the class descriptor at face value will expect an SSRI side-effect profile and will not expect sedation, postural hypotension or priapism, all of which come from the receptor antagonism the descriptor omits.',
        evidenceSource:
          'Trazodone hydrochloride United States prescribing information, sections 1, 12.1 and 12.2',
        measuredMetric:
          'Binding affinities at the serotonin transporter and at six receptors, as printed in the label’s own pharmacodynamics section',
        auditFlag: 'contested',
      },
      {
        id: 'trz-a2',
        category: 'failed',
        title: 'Its main use is one a guideline advises against, and it kept growing',
        laymanSummary:
          'Most trazodone is prescribed at low doses to help people sleep. In 2017 the American Academy of Sleep Medicine specifically suggested clinicians not use it for that. Dispensing among insured adults with insomnia went from 8.68% in 2011 to 14.46% in 2018 anyway.',
        technicalDetails:
          'The 2017 AASM clinical practice guideline for the pharmacologic treatment of chronic insomnia in adults states: "We suggest that clinicians not use trazodone as a treatment for sleep onset or sleep maintenance insomnia (versus no treatment) in adults. (WEAK)." A 2020 JAMA analysis of the IBM MarketScan database found low-dose trazodone (under 150 mg/day) dispensed to 1.25% of commercially insured adults in 2011 and 1.82% in 2018, rising 0.07 percentage points a year; among adults with an insomnia diagnosis the figures were 8.68% and 14.46%, rising 0.69 points a year. Zolpidem moved the other way over the same period, from 4.56% to 2.50% of all adults and 33.65% to 22.60% of those with insomnia. The authors observed that low-dose trazodone dispensing increased through the period before and to nearly two years after the guideline advised against it. Trazodone has no insomnia indication, no regulator has assessed it for that use, and it is the most commonly dispensed drug for it in this data set after zolpidem.',
        evidenceSource:
          'Sateia MJ, Buysse DJ, Krystal AD, Neubauer DN, Heald JL. J Clin Sleep Med 2017;13:307-349; Wong J, Murray Horwitz M, Bertisch SM, Herzig SJ, Buysse DJ, Toh S. JAMA 2020;324:2211-2213',
        doi: '10.1001/jama.2020.19224',
        measuredMetric:
          'Proportion of commercially insured adults with insomnia dispensed low-dose trazodone, 2011 against 2018, either side of a guideline recommending against it',
        auditFlag: 'caution',
      },
      {
        id: 'trz-a3',
        category: 'measured',
        title: 'Bottom group on efficacy and bottom group on tolerability, in the same analysis',
        laymanSummary:
          'In the network meta-analysis of 21 antidepressants across 522 trials and 116,477 patients, trazodone was among the four least effective when drugs were compared directly, and among the seven people were most likely to stop taking.',
        technicalDetails:
          'In the head-to-head studies of the 2018 network meta-analysis, fluoxetine, fluvoxamine, reboxetine and trazodone were the least efficacious drugs, with odds ratios ranging from 0.51 to 0.84. On acceptability, amitriptyline, clomipramine, duloxetine, fluvoxamine, reboxetine, trazodone and venlafaxine had the highest dropout rates, 1.30 to 2.32. Trazodone appears in both lists — one of only two drugs, with fluvoxamine and reboxetine, to do so. Against placebo it was still more effective than nothing, as all 21 were, with the range across the whole set running from 2.13 for amitriptyline down to 1.37 for reboxetine. Certainty of evidence across the analysis was rated moderate to very low. For the licensed indication, this is the clearest available comparative statement about the drug, and it is not favourable.',
        evidenceSource: 'Cipriani A, Furukawa TA, Salanti G, et al. Lancet 2018;391:1357-1366',
        doi: '10.1016/S0140-6736(17)32802-7',
        measuredMetric:
          'Placement of trazodone on both the efficacy and acceptability rankings of 21 antidepressants in head-to-head comparison',
        auditFlag: 'verified',
      },
      {
        id: 'trz-a4',
        category: 'failed',
        title: 'Priapism — a urological emergency from a five-cent sleeping tablet',
        laymanSummary:
          'The label records painful, prolonged erections and priapism, and directs immediate medical attention. Untreated, priapism can cause permanent damage. It comes from the same receptor blockade that lowers standing blood pressure.',
        technicalDetails:
          'Section 5.6 records cases of painful and prolonged penile erections and priapism and directs that immediate medical attention be sought if signs or symptoms are observed. The pharmacological basis is alpha-1 adrenergic antagonism, for which section 12.2 gives an alpha-1A Ki of 153 nM — tighter than the drug’s own serotonin transporter affinity of 367 nM — and which section 12.2 also names as the likely cause of postural hypotension. The clinical significance sits in the mismatch between the seriousness of the harm and the casualness of the prescription: this is a drug most often given at low dose, for sleep, off-label, sometimes without the person being told it is an antidepressant at all. The label carries no numerical incidence, so none is stated here.',
        evidenceSource:
          'Trazodone hydrochloride United States prescribing information, sections 5.6 and 12.2',
        measuredMetric:
          'Alpha-1A binding affinity relative to serotonin transporter affinity, and the harms the label attributes to it',
        auditFlag: 'caution',
      },
      {
        id: 'trz-a5',
        category: 'measured',
        title: 'A night-time drug that drops your blood pressure when you stand',
        laymanSummary:
          'Trazodone is taken at bedtime and warns of orthostatic hypotension and fainting. Those two facts meet in the middle of the night, in the people most likely to fall.',
        technicalDetails:
          'Section 5.4 warns of orthostatic hypotension and syncope and directs that patients be warned of the risk and symptoms. Section 12.2 attributes the effect directly: "Trazodone antagonizes alpha 1-adrenergic receptors, a property which may be associated with postural hypotension." Section 5.9 separately warns of potential cognitive and motor impairment and advises caution when operating machinery. Section 5.3 directs avoiding use with other QT-prolonging drugs and in patients with risk factors for prolonged QT. None of these is unusual in isolation; the combination is unusual in a drug taken at night, largely by older people, largely for an indication no regulator has reviewed, and largely because it costs five cents.',
        evidenceSource:
          'Trazodone hydrochloride United States prescribing information, sections 5.3, 5.4, 5.9 and 12.2',
        measuredMetric:
          'Labelled orthostatic, cognitive-motor and QT cautions, and the receptor pharmacology the label assigns them to',
        auditFlag: 'caution',
      },
      {
        id: 'trz-a6',
        category: 'inferred',
        title: 'The label says the net effect on serotonin, and its role, are unknown',
        laymanSummary:
          'Trazodone raises serotonin at the transporter and blocks it at the receptor. The prescribing information states outright that the net result of doing both, and its role in the antidepressant effect, is unknown.',
        technicalDetails:
          'Section 12.1 reads in full: "The mechanism of trazodone’s antidepressant action is not fully understood, but is thought to be related to its enhancement of serotonergic activity in the CNS. Trazodone is both a selective serotonin reuptake inhibitor (SSRI) and a 5HT2 receptor antagonist and the net result of this action on serotonergic transmission and its role in trazodone’s antidepressant effect is unknown." That is an unusually explicit admission: the drug does two opposing things to the same neurotransmitter system and the label does not know which wins. The 2022 umbrella review of the serotonin theory found no consistent evidence that depression involves lowered serotonin at all, which removes the framework in which "enhancement of serotonergic activity" would be an explanation rather than a description. What is left is a compound with a well-characterised receptor profile, a documented sedative effect, and an unexplained relationship between the two.',
        evidenceSource:
          'Trazodone hydrochloride United States prescribing information, section 12.1; Moncrieff J et al., Mol Psychiatry 2023;28:3243-3256',
        doi: '10.1038/s41380-022-01661-0',
        inferredClaim:
          'That enhancing serotonergic activity is what makes trazodone an antidepressant — an account the label offers as a thought and then immediately qualifies as unknown in net effect',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A tablet, usually taken at night',
        laymanDesc:
          'Most prescriptions are for a low dose at bedtime, well below the antidepressant range, for sleep rather than mood.',
        molecularDetail:
          'The licensed indication is major depressive disorder in adults. The dominant dispensed pattern is low-dose use: under 150 mg/day accounted for the trazodone dispensing tracked in the 2020 JAMA analysis, which rose from 8.68% to 14.46% of commercially insured adults with an insomnia diagnosis between 2011 and 2018.',
        iconName: 'Moon',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Broken down into a second active compound',
        laymanDesc:
          'The liver splits off a fragment that is itself pharmacologically active at serotonin receptors — so the person is carrying two drugs, not one.',
        molecularDetail:
          'Meta-chlorophenylpiperazine is trazodone’s major active metabolite and a serotonin receptor agonist in its own right. It is also a synthesis precursor, which is why its residual level is a release specification for the finished product as well as a pharmacological fact about the patient.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The serotonin pump is blocked — weakly',
        laymanDesc:
          'This is the action the label names the drug after. On the label’s own numbers it is the weakest thing the molecule does.',
        molecularDetail:
          'Serotonin reuptake inhibition at Ki 367 nM. For comparison, on the same page: 5-HT2A at 35.6 nM, 5-HT2B at 78.4 nM, 5-HT1A partial agonism at 118 nM, alpha-1A at 153 nM, alpha-2C at 155 nM and 5-HT2C at 224 nM. Every one of those six is a tighter interaction than the transporter the class descriptor refers to.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The 5-HT2A receptor is blocked — strongly',
        laymanDesc:
          'This is the action the drug is actually used for. Blocking this serotonin receptor is closely associated with deeper, more consolidated sleep.',
        molecularDetail:
          'Antagonism at 5-HT2A with Ki 35.6 nM, about ten times tighter than transporter inhibition. Section 12.1 concedes that the net result of simultaneously enhancing serotonin availability and blocking its receptor, and that combination’s role in the antidepressant effect, is unknown.',
        iconName: 'ShieldOff',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And so are the receptors that hold blood vessels tight',
        laymanDesc:
          'Alpha-1 blockade relaxes blood vessels. That is why standing up can cause dizziness or fainting, and it is the mechanism behind the priapism warning.',
        molecularDetail:
          'Alpha-1A antagonism at Ki 153 nM. Section 12.2 states that trazodone antagonises alpha-1 adrenergic receptors, "a property which may be associated with postural hypotension". Section 5.6 records painful prolonged erections and priapism requiring immediate medical attention.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What has never been measured',
        laymanDesc:
          'The use that accounts for most of the prescriptions has never been through a regulator, and the guideline that did look at it advised against.',
        molecularDetail:
          'There is no insomnia indication for trazodone and no registration programme in that condition. The 2017 AASM guideline suggests clinicians not use it for sleep onset or sleep maintenance insomnia. For the licensed indication, the 2018 network meta-analysis placed it among the four least efficacious and seven least tolerable of 21 antidepressants.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: '2018 network meta-analysis of 21 antidepressants (Lancet 2018;391:1357-1366)',
        phase: 'Systematic review and network meta-analysis of 522 randomised trials',
        sampleSize: 116477,
        primaryEndpoint:
          'Efficacy as response rate and acceptability as all-cause treatment discontinuation, across 21 antidepressants in adults with major depressive disorder',
        endpointMet: true,
        statisticalPValue:
          'All 21 drugs more effective than placebo. In head-to-head studies trazodone was among the least efficacious (range of odds ratios 0.51 to 0.84) and among those with the highest dropout rates (1.30 to 2.32)',
        unreportedAdverseSignals:
          '46 of 522 trials (9%) were rated at high risk of bias, 380 (73%) at moderate, and certainty of evidence was moderate to very low. Trazodone is one of only three drugs appearing in both the least-efficacious and highest-dropout groups.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'AASM clinical practice guideline systematic review (J Clin Sleep Med 2017;13:307-349)',
        phase: 'Systematic review of randomised controlled trials with GRADE assessment',
        sampleSize: 0,
        primaryEndpoint:
          'Whether individual drugs, including several without an FDA insomnia indication, should be used for sleep onset or sleep maintenance insomnia in adults',
        endpointMet: false,
        statisticalPValue:
          'Recommendation against: "We suggest that clinicians not use trazodone as a treatment for sleep onset or sleep maintenance insomnia (versus no treatment) in adults. (WEAK)"',
        unreportedAdverseSignals:
          'The guideline is a synthesis rather than a trial and reports no single randomised sample, so none is asserted here. The same guideline recommends against melatonin, valerian, tryptophan, diphenhydramine and tiagabine in identical terms, and suggests doxepin for sleep maintenance insomnia.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Dispensing cohort, IBM MarketScan 2011-2018 (JAMA 2020;324:2211-2213)',
        phase: 'Retrospective analysis of commercial and Medicare supplemental claims',
        sampleSize: 0,
        primaryEndpoint:
          'Annual proportion of commercially insured adults, and of those with an insomnia diagnosis, dispensed low-dose trazodone or zolpidem between 2011 and 2018',
        endpointMet: true,
        statisticalPValue:
          'Low-dose trazodone rose from 1.25% to 1.82% of all adults (+0.07 points/year) and from 8.68% to 14.46% of adults with insomnia (+0.69 points/year); zolpidem fell from 4.56% to 2.50% and from 33.65% to 22.60% respectively',
        unreportedAdverseSignals:
          'The study reports population proportions rather than a randomised sample, so no sample size is asserted here. Trazodone dispensing continued to increase through the period before and to nearly two years after the 2017 guideline advising against its use for insomnia.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Serotonin transporter Ki of 367 nM against 5-HT2A Ki of 35.6 nM, alpha-1A 153 nM and 5-HT1A 118 nM, all printed on the label',
        'Placement among the four least efficacious and seven least tolerable of 21 antidepressants in head-to-head comparison across 522 trials',
        'Low-dose trazodone dispensing rising from 8.68% to 14.46% of insured adults with insomnia between 2011 and 2018',
        'Zolpidem dispensing falling from 33.65% to 22.60% of the same population over the same period',
      ],
      unsupportedInferences: [
        'That trazodone is a selective serotonin reuptake inhibitor, as its own indications section states and its own binding table contradicts',
        'That enhancing serotonergic activity explains the antidepressant effect, which section 12.1 calls unknown in net result',
        'That its use as a hypnotic is supported by evidence, when the sleep-medicine guideline that assessed it recommended against',
        'That low dose means low risk — the priapism, orthostatic and QT warnings are not dose-qualified on the label',
      ],
      whatFailedInitially: [
        'The dominant clinical use of the drug has never been assessed by a regulator and was recommended against by the relevant specialty guideline',
        'It sits in both the least-efficacious and the highest-dropout group of the largest antidepressant comparison ever run',
        'Its class descriptor on the label is contradicted by the binding constants two sections later',
        'Priapism, a potentially permanent harm, is carried by a drug most often prescribed casually and off-label',
      ],
      realWorldOutcome: [
        'First approved in the United States in 1981; every currently listed product is an abbreviated application and the originator brand is not marketed',
        'About five United States cents a tablet at pharmacy acquisition cost, which is a substantial part of why it became the default off-label hypnotic',
        'The second most dispensed sleep-related drug in a large commercial claims data set, behind zolpidem and gaining on it',
        'Widely used in older people and in dementia care despite an orthostatic hypotension warning and a fall risk that has never been quantified in a trial of that population',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 50, 100, 150 and 300 mg. In practice, most dispensed prescriptions are for doses below 150 mg per day, taken at night',
      description:
        'Metabolised to meta-chlorophenylpiperazine, an active metabolite with serotonin receptor agonist activity of its own. The drug has no stereocentres and no complex formulation requirements, which is part of why it is among the cheapest prescription medicines in the United States.',
      safetyProfile:
        'Boxed warning for suicidal thoughts and behaviours in paediatric and young adult patients. QT prolongation, with use to be avoided alongside other QT-prolonging drugs and in patients with risk factors. Orthostatic hypotension and syncope, attributed on the label to alpha-1 adrenergic antagonism. Increased bleeding risk with aspirin, NSAIDs, other antiplatelets and anticoagulants. Priapism and painful prolonged erections, requiring immediate medical attention. Activation of mania or hypomania. Potential for cognitive and motor impairment, with caution advised when operating machinery. Angle-closure glaucoma in untreated anatomically narrow angles.',
    },
    commonQuestions: [
      {
        q: 'I was given this to sleep. Is it a sleeping tablet?',
        a: 'Not officially. Trazodone is licensed in the United States only for major depressive disorder in adults; there is no insomnia indication and no registration programme in that condition. It is used for sleep because it is strongly sedating and costs about five cents a tablet. The American Academy of Sleep Medicine reviewed the evidence in 2017 and recommended against it, in these words: "We suggest that clinicians not use trazodone as a treatment for sleep onset or sleep maintenance insomnia (versus no treatment) in adults." Dispensing rose anyway — from 8.68% to 14.46% of commercially insured adults with an insomnia diagnosis between 2011 and 2018. That is a real gap between what the evidence review concluded and what is happening in practice, and it is the most important thing on this page.',
        auditNote:
          'An off-label use is not automatically a bad use — plenty of good medicine is off-label. What makes this one worth flagging is that the relevant guideline looked directly at it and advised against, and prescribing went up rather than down.',
      },
      {
        q: 'Is trazodone an SSRI?',
        a: 'Its label says so and its own numbers say otherwise. Section 1 of the prescribing information calls it "a selective serotonin reuptake inhibitor". Section 12.2, on the same document, reports that it inhibits serotonin reuptake with a Ki of 367 nanomolar while antagonising the 5-HT2A receptor at 35.6 nanomolar — about ten times more tightly — and also binds 5-HT2B at 78.4, 5-HT1A at 118, alpha-1A at 153, alpha-2C at 155 and 5-HT2C at 224. The transporter it is named after is the weakest of the seven. The standard pharmacological description is a serotonin antagonist and reuptake inhibitor. This is not a semantic quibble: someone told they are on an SSRI will not be expecting heavy sedation, a drop in blood pressure on standing, or a warning about prolonged erections, and all three come from the receptor blocking that the label’s class descriptor leaves out.',
      },
      {
        q: 'What is the priapism warning about?',
        a: 'It is the most specific serious harm this drug has. The label records cases of painful and prolonged penile erections and priapism and directs that immediate medical attention be sought. The mechanism is blockade of alpha-1 adrenergic receptors, which the label also names as the likely cause of the postural drop in blood pressure. Priapism that is not treated promptly can cause permanent erectile dysfunction. The label does not give an incidence figure, so none is stated here. What makes it worth flagging is the contrast between the seriousness of the harm and the casualness with which a five-cent night-time tablet is often prescribed.',
      },
      {
        q: 'How well does it work for depression?',
        a: 'Less well than most of the alternatives, on the largest comparison available. The 2018 network meta-analysis pooled 522 trials and 116,477 patients across 21 antidepressants. All 21 beat placebo. But in the head-to-head comparisons, trazodone was among the four least efficacious drugs, and in the acceptability analysis it was among the seven with the highest dropout rates — one of only three molecules to appear in both lists. The certainty of that evidence was rated moderate to very low across the analysis, and 9% of the included trials were at high risk of bias, so this is a ranking rather than a verdict. It is still the best comparative statement available about the drug in its licensed use.',
      },
      {
        q: 'Is melatonin a safer alternative?',
        a: 'On this specific question, the same guideline that advised against trazodone advised against melatonin too — and against valerian and tryptophan — in identical language and with the same weak grade. That is not a claim that melatonin is dangerous; it is a statement that the AASM did not find evidence supporting it for chronic insomnia in adults. What does carry a strong recommendation is not a drug at all: the American College of Physicians recommends that all adults with chronic insomnia disorder receive cognitive behavioural therapy for insomnia as the initial treatment, on moderate-quality evidence, and treats adding any medication as a weak recommendation on low-quality evidence, to be considered only after CBT-I alone has been unsuccessful.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Trazodone hydrochloride United States prescribing information — Indications 1, Warnings and Precautions 5.1 to 5.10, Clinical Pharmacology 12.1 and 12.2 (openFDA structured product label)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=trazodone',
        kind: 'regulatory',
      },
      {
        label:
          'Sateia MJ, Buysse DJ, Krystal AD, Neubauer DN, Heald JL. Clinical Practice Guideline for the Pharmacologic Treatment of Chronic Insomnia in Adults: An American Academy of Sleep Medicine Clinical Practice Guideline. J Clin Sleep Med 2017;13:307-349',
        identifier: '10.5664/jcsm.6470',
        kind: 'doi',
      },
      {
        label:
          'Wong J, Murray Horwitz M, Bertisch SM, Herzig SJ, Buysse DJ, Toh S. Trends in Dispensing of Zolpidem and Low-Dose Trazodone Among Commercially Insured Adults in the United States, 2011-2018. JAMA 2020;324:2211-2213',
        identifier: '10.1001/jama.2020.19224',
        kind: 'doi',
      },
      {
        label:
          'Qaseem A, Kansagara D, Forciea MA, Cooke M, Denberg TD. Management of Chronic Insomnia Disorder in Adults: A Clinical Practice Guideline From the American College of Physicians. Ann Intern Med 2016;165:125-133',
        identifier: '10.7326/M15-2175',
        kind: 'doi',
      },
      NETWORK_META_SOURCE,
      SEROTONIN_UMBRELLA_SOURCE,
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — trazodone, 87 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5533 — trazodone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5533',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Mirtazapine — whose side effects became its off-label indications, and which failed two
  //    large publicly funded dementia trials, one of them with more deaths on the drug.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'mirtazapine',
    name: 'Mirtazapine',
    tradeName: 'Remeron / Remeron SolTab',
    sponsor:
      'Organon (originator, NDA 020415), through Merck; generic since 2004 and made by many manufacturers',
    targetGene: 'ADRA2A, HRH1, HTR2A and HTR3A',
    targetProtein:
      'Antagonist at central presynaptic alpha-2 adrenergic autoreceptors and heteroreceptors, at 5-HT2 and 5-HT3 serotonin receptors, at histamine H1 receptors, at peripheral alpha-1 adrenergic receptors and at muscarinic receptors. It does not inhibit any monoamine transporter',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication: 'Treatment of major depressive disorder in adults',
    patientFriendlyIndication:
      'Depression — although it is very widely used off-label for its sedating and appetite-raising effects',
    anatomicalSite:
      'Presynaptic alpha-2 autoreceptors and heteroreceptors in the central nervous system; the histamine H1 receptor, which the label names as the likely source of the sedation',
    conditionContext: {
      conditionExplainer:
        'Mirtazapine is the antidepressant that does not block a reuptake pump. It works, if it works, by removing a brake: alpha-2 receptors normally shut off noradrenaline and serotonin release, and blocking them lets more out. The label describes that as a possibility rather than a finding.',
      whyItMatters:
        'Two of mirtazapine’s side effects — sedation and appetite gain — became reasons to prescribe it. Both are well quantified on the label. Neither has held up when tested as an indication: a randomised trial of appetite in cancer cachexia found no difference from placebo, and two large publicly funded dementia trials found no benefit for either depression or agitation, the second with seven deaths on drug against one on placebo.',
      whoTakesThis:
        'Adults with major depressive disorder. Safety and effectiveness in children have not been established, and in the one paediatric trial half the treated children gained at least 7% of their body weight in eight weeks.',
      clinicalGoals:
        'A fall in a depression rating scale. Sedation and appetite are measured as adverse reactions on the licensing document, not as endpoints.',
    },
    oneSentenceVerdict:
      'An alpha-2 antagonist that raises monoamine release without blocking any transporter, producing somnolence in 54% of patients against 18% on placebo and at least 7% weight gain in 7.5% against 0% — effects widely borrowed as off-label indications, and which failed when tested directly: no appetite benefit over placebo in 120 cancer cachexia patients, no benefit for depression in dementia in 108 patients (mean difference 0.01, p=0.99), and no benefit for agitation in dementia in 204 patients with seven deaths on drug against one on placebo.',
    laymanHowItWorks:
      'Most antidepressants block a pump that recycles a neurotransmitter. Mirtazapine does something different: it blocks a receptor that normally tells nerve cells to stop releasing noradrenaline and serotonin, so more of both comes out. It also blocks the histamine receptor that antihistamines block, which is why it makes people sleepy and hungry, and the label says so directly. What it does not do is block any reuptake transporter at all.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 60,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1052 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 90 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 14 June 1996 under NDA 020415 and generic since 2004. The orally disintegrating tablet, marketed as Remeron SolTab, extended the branded life of the molecule on a formulation rather than a pharmacological difference — a pattern repeated across this therapeutic class.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Which alternative is relevant depends on why the drug was chosen. For depression itself, mirtazapine was one of the seven drugs that outperformed the others in head-to-head comparison in the 2018 network meta-analysis, so the case for it is real. For sedation or appetite in an older or frail person, the comparison is not against another antidepressant but against the trial evidence for those specific uses — which is negative.',
      conventionalRx: [
        {
          name: 'Escitalopram or sertraline',
          class: 'Selective serotonin reuptake inhibitors',
          howItCompares:
            'Both sat in the more tolerable group of the 2018 network meta-analysis, where mirtazapine appeared in the more efficacious group but not the more tolerable one. Neither causes the somnolence rate mirtazapine does — 54% against 18% on placebo — or the weight gain.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: far less sedation and weight gain; no agranulocytosis warning. Cons: more sexual dysfunction; no help at all if sleep or appetite was the reason mirtazapine was chosen.',
        },
        {
          name: 'Non-drug person-centred care, for agitation in dementia',
          class: 'Structured non-pharmacological intervention — not a medicine',
          howItCompares:
            'This is the comparator the SYMBAD investigators named as first-line, and the reason the trial existed was that patients whose agitation had not responded to it needed an alternative. Mirtazapine was not that alternative: mean agitation scores at twelve weeks did not differ from placebo (adjusted mean difference −1.74, 95% CI −7.17 to 3.69, p=0.53), and there were seven deaths on mirtazapine by week 16 against one on placebo.',
          typicalCost:
            'Not comparable to a drug price; the constraint is staffing and training, not cost per dose.',
          prosAndCons:
            'Pros: no mortality signal; named as first-line in the trial that tested the drug against it. Cons: requires trained staff and time, which is exactly why sedating drugs get reached for instead.',
        },
        {
          name: 'Trazodone, as the other sedating antidepressant',
          class: 'Serotonin antagonist and reuptake inhibitor',
          howItCompares:
            'The closest comparator for the sedation use, and it loses on efficacy: trazodone was among the four least efficacious drugs in the 2018 head-to-head analysis while mirtazapine was among the seven most. Both are widely prescribed off-label for sleep, and neither has an insomnia indication.',
          typicalCost:
            'US$0.0506 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 87 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: half the price; no agranulocytosis warning; less weight gain. Cons: priapism; orthostatic hypotension; bottom of the efficacy ranking for the licensed indication.',
        },
      ],
      naturalFoods: [
        {
          name: 'Structured exercise, as an adjunct or comparator for depression',
          activeCompound: 'Not a compound — a behavioural exposure',
          biologicalMechanism:
            'No single mechanism is established. Proposed contributors include changes in monoamine turnover, BDNF signalling, hypothalamic-pituitary-adrenal axis regulation and inflammatory markers; none has been shown to be the operative one, which puts it in the same epistemic position as the drug.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'For scale rather than advice: the 2013 Cochrane review of 39 trials in 2,326 participants found a pooled standardised mean difference of −0.62 (95% CI −0.81 to −0.42) against no treatment or control — a moderate effect. When restricted to the six trials with adequate allocation concealment, intention-to-treat analysis and blinded outcome assessment (464 participants), the pooled effect was −0.18 (95% CI −0.47 to 0.11) and not statistically significant. Four trials comparing exercise directly with a drug found no significant difference (SMD −0.11, 95% CI −0.34 to 0.12).',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Report a sore throat with fever rather than waiting it out',
          action:
            'This is the one symptom on this drug that should prompt a blood count rather than a wait-and-see.',
          patientImpact:
            'In premarketing trials, 2 of 2,796 patients developed agranulocytosis (absolute neutrophil count below 500/mm³ with fever or infection) and a third developed severe neutropenia without symptoms. Onset was on days 61, 9 and 14 of treatment. All three recovered after mirtazapine was stopped.',
          clinicalPrecaution:
            'The label directs discontinuation and close monitoring if sore throat, fever, stomatitis or other signs of infection occur alongside a low white cell count. The variable onset — day 9 in one case, day 61 in another — means there is no window after which the risk has passed.',
        },
        {
          name: 'Expect drowsiness, and plan around it before day one',
          action:
            'Do not arrange to drive or operate machinery the morning after the first dose until you know how it affects you.',
          patientImpact:
            'In United States controlled studies somnolence was reported in 54% of patients on mirtazapine against 18% on placebo, and led to discontinuation in 10.4% against 2.2%. The label states it is unclear whether tolerance develops to the somnolent effect.',
          clinicalPrecaution:
            'The label attributes the sedation to histamine H1 antagonism and the orthostatic hypotension to peripheral alpha-1 antagonism. Both are strongest early and both matter most in older people, who are also the group in whom the drug is most often chosen for exactly those effects.',
        },
        {
          name: 'Ask to have weight tracked from the start, not after six months',
          action: 'A baseline weight makes a later change interpretable.',
          patientImpact:
            'Appetite increase was reported in 17% of treated patients against 2% on placebo, and weight gain of 7% or more of body weight in 7.5% against 0%. Across the pooled premarketing programme, including long-term open-label treatment, 8% of patients discontinued mirtazapine for weight gain.',
          clinicalPrecaution:
            'In the one eight-week paediatric trial at 15 to 45 mg/day, 49% of treated children gained at least 7% of body weight against 5.7% on placebo — and safety and effectiveness in paediatric patients with depression have not been established.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1CCN2C(C1)C3=CC=CC=C3CC4=C2N=CC=C4',
      chemicalFormula: 'C17H19N3',
      molecularWeight: '265.35 g/mol',
      targetReceptorAffinity:
        'A racemate of the S(+) and R(−) enantiomers, marketed as the racemic mixture. In preclinical studies mirtazapine is an antagonist at alpha-2 adrenergic inhibitory autoreceptors and heteroreceptors and at 5-HT2 and 5-HT3 receptors, with no significant affinity for 5-HT1A or 5-HT1B. It is also an antagonist of histamine H1 receptors, peripheral alpha-1 adrenergic receptors and muscarinic receptors, and the label attributes the prominent somnolence to the first and the orthostatic hypotension to the second. It inhibits no monoamine transporter. At 75 mg, 1.67 times the maximum recommended dosage, it does not prolong QTc to a clinically meaningful extent in healthy subjects.',
      structureSource: {
        label:
          'PubChem CID 4205 (mirtazapine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; receptor pharmacology and the QTc statement from the mirtazapine United States prescribing information, sections 12.1 and 12.2',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4205',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mrt-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the tetracyclic core and the enantiomeric ratio',
          description:
            'Mirtazapine has one stereocentre and is marketed as the racemate, so the ratio is a release specification rather than a design choice. The tetracyclic piperazinoazepine core is what distinguishes it from every other antidepressant in common use, and it is the reason no transporter assay is informative about this molecule.',
          reagentsAndBuffer:
            'Mirtazapine reference standard, chiral HPLC, nuclear magnetic resonance for the pyridine and benzazepine ring fusion, Karl Fischer titration, residual solvent analysis by headspace gas chromatography',
        },
        {
          id: 'mrt-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Close a four-ring system around a piperazine',
          description:
            'The molecule fuses a benzene ring, a pyridine ring, a seven-membered azepine and a piperazine into one rigid tetracycle. That rigidity is the pharmacological point: it fixes the geometry that produces alpha-2 antagonism without transporter binding, which is a property no flexible SSRI-like scaffold has.',
          dependsOnStepId: 'mrt-w1',
          reagentsAndBuffer:
            '2-Chloronicotinonitrile or an equivalent pyridine building block, 1-methyl-3-phenylpiperazine, strong base for the intramolecular cyclisation, polyphosphoric acid or an equivalent for the ring closure, anhydrous conditions',
        },
        {
          id: 'mrt-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallise the free base and control the des-methyl impurity',
          description:
            'Unlike most drugs in this class mirtazapine is dispensed as the free base rather than a salt. Desmethylmirtazapine is both a process impurity and a human metabolite with its own pharmacological activity, so its limit is set on activity grounds as well as purity grounds.',
          dependsOnStepId: 'mrt-w2',
          reagentsAndBuffer:
            'Recrystallisation from an alcohol or alcohol-water system, HPLC release testing against a desmethylmirtazapine limit, seed crystals of the specified polymorph',
        },
        {
          id: 'mrt-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Run a receptor panel and a transporter panel, and expect the second to be blank',
          description:
            'The negative result is as informative as the positive one here. Mirtazapine should show no meaningful inhibition of the serotonin, noradrenaline or dopamine transporters and strong antagonism at alpha-2, H1, 5-HT2 and 5-HT3. A screen that only tested transporters would report this drug as inactive.',
          dependsOnStepId: 'mrt-w3',
          reagentsAndBuffer:
            'Radioligand binding across human ADRA2A, ADRA1A, HRH1, HTR2A, HTR2C, HTR3A and muscarinic subtypes, alongside HEK293 cells expressing SLC6A4, SLC6A2 and SLC6A3 for uptake assays; mirtazapine and desmethylmirtazapine as separate test articles',
        },
        {
          id: 'mrt-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure sedation, weight and neutrophil count as endpoints, not as footnotes',
          description:
            'Everything mirtazapine is borrowed for off-label — sleep, appetite, weight — appears on its label as an adverse reaction with a percentage attached. Testing those as benefits means measuring them as prespecified outcomes with a placebo arm, which is what the cancer cachexia and dementia trials did and what produced the negative results. Neutrophil count belongs in the same schedule because the onset in the premarketing cases ranged from day 9 to day 61.',
          dependsOnStepId: 'mrt-w4',
          reagentsAndBuffer:
            'Polysomnography or validated actigraphy for sleep, calibrated weight and body composition measurement, serial full blood counts with differential through at least 12 weeks, validated appetite and agitation instruments with a concurrent placebo arm',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mrt-a1',
        category: 'measured',
        title: 'Sedation in 54% and weight gain in 7.5%, both on the label as harms',
        laymanSummary:
          'Just over half of people on mirtazapine reported drowsiness against under a fifth on placebo, and one in thirteen gained at least seven per cent of their body weight while nobody on placebo did. Both appear as adverse reactions, not as benefits.',
        technicalDetails:
          'Section 5.7 records somnolence in 54% of patients treated with mirtazapine in United States controlled studies against 18% on placebo, with discontinuation for somnolence in 10.4% against 2.2%, and states it is unclear whether tolerance develops. Section 5.6 records appetite increase in 17% against 2%, and weight gain of 7% or more of body weight in 7.5% against 0%; across the pooled premarketing programme including long-term open-label treatment, 8% of patients discontinued for weight gain. Section 12.2 attributes the prominent somnolence to histamine H1 antagonism and the orthostatic hypotension to peripheral alpha-1 antagonism. These are the two properties for which the drug is most often chosen in practice, and on its own registration document both are counted as reasons people stopped taking it.',
        evidenceSource:
          'Mirtazapine United States prescribing information, sections 5.6, 5.7 and 12.2 (NDA 020415)',
        measuredMetric:
          'Incidence of somnolence, appetite increase and 7% weight gain against placebo, and discontinuations attributable to each',
        auditFlag: 'verified',
      },
      {
        id: 'mrt-a2',
        category: 'failed',
        title: 'SYMBAD: no benefit for agitation in dementia, and seven deaths against one',
        laymanSummary:
          'A publicly funded trial in 204 people with Alzheimer’s disease and agitation found mirtazapine no better than placebo at twelve weeks. By week sixteen there had been seven deaths in the mirtazapine group and one in the placebo group.',
        technicalDetails:
          'SYMBAD (NCT03031184, ISRCTN17411897) was a parallel-group, double-blind, placebo-controlled trial across 26 United Kingdom centres, funded by the NIHR Health Technology Assessment Programme. Participants had probable or possible Alzheimer’s disease, agitation unresponsive to non-drug treatment and a Cohen-Mansfield Agitation Inventory score of 45 or more, and were randomised 1:1 to mirtazapine titrated to 45 mg or placebo. Between January 2017 and March 2020, 204 participants were recruited. Mean CMAI scores at twelve weeks did not differ: adjusted mean difference −1.74 (95% CI −7.17 to 3.69, p=0.53). Adverse events were similar — 67 of 102 (66%) on mirtazapine against 65 of 102 (64%) on placebo — but there were seven deaths in the mirtazapine group by week 16 against one in the control group, with post-hoc analysis suggesting marginal statistical significance (p=0.065). The authors concluded the data do not support using mirtazapine as a treatment for agitation in dementia. A post-hoc mortality comparison at p=0.065 in 204 people is not proof of harm, and it is a signal that a trial designed to demonstrate benefit found nothing to weigh against it.',
        evidenceSource:
          'Banerjee S, High J, Stirling S, et al. Study of mirtazapine for agitated behaviours in dementia (SYMBAD): a randomised, double-blind, placebo-controlled trial. Lancet 2021;398:1487-1497',
        doi: '10.1016/S0140-6736(21)01210-1',
        measuredMetric:
          'Cohen-Mansfield Agitation Inventory score at 12 weeks and deaths by week 16, mirtazapine against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'mrt-a3',
        category: 'failed',
        title: 'HTA-SADD: no benefit for depression in dementia, with more adverse reactions',
        laymanSummary:
          'A three-arm trial of mirtazapine, sertraline and placebo in depression in Alzheimer’s disease found no difference in depression scores at thirteen weeks or at thirty-nine. Both drugs produced more adverse reactions than placebo.',
        technicalDetails:
          'HTA-SADD (ISRCTN88882979) randomised participants from old-age psychiatry services across nine English centres 1:1:1 to sertraline (target 150 mg/day), mirtazapine (45 mg/day) or placebo, all with standard care, in people with probable or possible Alzheimer’s disease, depression lasting at least four weeks and a Cornell Scale for Depression in Dementia score of 8 or more. Decreases in depression score at 13 weeks did not differ between 111 controls and 107 allocated to sertraline (mean difference 1.17, 95% CI −0.23 to 2.58, p=0.10) or 108 allocated to mirtazapine (0.01, 95% CI −1.37 to 1.38, p=0.99), and these findings persisted to 39 weeks. Fewer controls had adverse reactions (29 of 111, 26%) than sertraline (46 of 107, 43%, p=0.010) or mirtazapine (44 of 108, 41%, p=0.031), and fewer serious adverse events rated as severe (p=0.003). Five patients in every group died by week 39. The authors concluded that the present practice of first-line use of these antidepressants for depression in Alzheimer’s disease should be reconsidered. A p value of 0.99 is about as clean a null as this literature produces.',
        evidenceSource:
          'Banerjee S, Hellier J, Dewey M, et al. Sertraline or mirtazapine for depression in dementia (HTA-SADD): a randomised, multicentre, double-blind, placebo-controlled trial. Lancet 2011;378:403-411',
        doi: '10.1016/S0140-6736(11)60830-1',
        measuredMetric:
          'Cornell Scale for Depression in Dementia at 13 and 39 weeks, and adverse reaction rates, against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'mrt-a4',
        category: 'failed',
        title: 'The appetite effect did not reproduce when it was tested as a benefit',
        laymanSummary:
          'Mirtazapine is widely used to help frail and cancer patients eat, on the strength of the weight gain seen in depression trials. When 120 patients with cancer-related loss of appetite were randomised to mirtazapine or placebo, appetite improved in both arms and the difference between them was not significant.',
        technicalDetails:
          'A double-blind placebo-controlled randomised trial enrolled 120 patients with incurable solid tumours who had anorexia (appetite loss of 4 or more on a 0-10 scale), cachexia (more than 5% body weight loss over six months, or more than 2% plus a body mass index below 20) and a depression score of 3 or below on a 0-6 scale — that last criterion deliberately excluding people whose appetite loss might be driven by depression. Patients were randomised 1:1 to mirtazapine 15 mg nightly for eight weeks or placebo, with the primary endpoint the change in appetite from baseline to day 28. Appetite score increased significantly in both arms (p<0.0001 each), and the increase did not differ significantly between them in either per-protocol or intention-to-treat analysis (p=0.472 and p=0.462). Mirtazapine was associated with significantly less increase in depressive symptoms and a higher prevalence of somnolence. Changes in quality of life, fatigue, body weight, lean body mass, handgrip strength, inflammatory markers and survival did not differ. A side effect observed in one population is a hypothesis about another population, and this is what happened when the hypothesis was tested.',
        evidenceSource:
          'Hunter CN, Abdel-Aal HH, Elsherief WA, Farag DE, Riad NM, Alsirafy SA. Mirtazapine in Cancer-Associated Anorexia and Cachexia: A Double-Blind Placebo-Controlled Randomized Trial. J Pain Symptom Manage 2021;62:1207-1215',
        doi: '10.1016/j.jpainsymman.2021.05.017',
        measuredMetric:
          'Change in appetite score from baseline to day 28, mirtazapine 15 mg against placebo, in 120 patients with cancer cachexia',
        auditFlag: 'caution',
      },
      {
        id: 'mrt-a5',
        category: 'failed',
        title: 'Agranulocytosis, with onset anywhere from day 9 to day 61',
        laymanSummary:
          'Three people in the premarketing programme lost their infection-fighting white cells: two with fever and infection, one without symptoms. It happened on day 9 in one case and day 61 in another, so there is no safe window.',
        technicalDetails:
          'Section 5.2 records that in premarketing clinical trials, 2 of 2,796 patients treated with mirtazapine developed agranulocytosis — absolute neutrophil count below 500/mm³ with associated signs and symptoms such as fever and infection — one of whom had Sjögren’s syndrome, and a third patient developed severe neutropenia (ANC below 500/mm³) without symptoms. Onset of severe neutropenia was detected on days 61, 9 and 14 of treatment respectively, and all three recovered after mirtazapine was stopped. The label directs discontinuation and close monitoring if a patient develops sore throat, fever, stomatitis or other signs of infection alongside a low white cell count. It does not direct routine blood count monitoring, so detection depends on the patient reporting the symptom and on whoever they report it to remembering which drug they are on. The spread of onset times is the operationally important detail: a normal count at two weeks does not close the question.',
        evidenceSource:
          'Mirtazapine United States prescribing information, section 5.2 Agranulocytosis (NDA 020415)',
        measuredMetric:
          'Cases of agranulocytosis and severe neutropenia per patients treated in the premarketing programme, with time to onset',
        auditFlag: 'caution',
      },
      {
        id: 'mrt-a6',
        category: 'failed',
        title: 'Half the children in the only paediatric trial gained 7% of their body weight',
        laymanSummary:
          'In an eight-week paediatric trial, 49% of children on mirtazapine gained at least seven per cent of their body weight, against 5.7% on placebo. The drug has never been shown to work in children.',
        technicalDetails:
          'Section 5.6 records that in an eight-week paediatric clinical trial at doses between 15 and 45 mg/day, 49% of mirtazapine-treated paediatric patients had a weight gain of at least 7%, against 5.7% of placebo-treated patients. The same paragraph states that the safety and effectiveness of mirtazapine in paediatric patients with major depressive disorder have not been established. The two statements together define the problem: a measured harm at nearly nine times the placebo rate, in a population with no demonstrated benefit to weigh it against. For comparison, the adult figure for the same threshold is 7.5% against 0% — the paediatric rate is roughly six and a half times the adult one over a shorter exposure.',
        evidenceSource:
          'Mirtazapine United States prescribing information, sections 5.6 and 8.4 (NDA 020415)',
        measuredMetric:
          'Proportion of paediatric patients gaining at least 7% of body weight over eight weeks, drug against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'mrt-a7',
        category: 'inferred',
        title: 'A mechanism the label calls unclear, and a genuine efficacy result',
        laymanSummary:
          'The prescribing information says the mechanism of action for depression is unclear and offers alpha-2 blockade as a possibility. Separately, in the largest comparison of antidepressants ever run, mirtazapine was one of the seven that beat the others head to head.',
        technicalDetails:
          'Section 12.1 reads: "The mechanism of action of mirtazapine for the treatment of major depressive disorder, is unclear. However, its efficacy could be mediated through its activity as an antagonist at central presynaptic alpha-2-adrenergic inhibitory autoreceptors and heteroreceptors and enhancing central noradrenergic and serotonergic activity." Note the conditional: "could be mediated". Section 12.2 adds antagonism at 5-HT2 and 5-HT3, at H1, at peripheral alpha-1 and at muscarinic receptors, and explicitly assigns the somnolence to H1 and the orthostatic hypotension to alpha-1. Against that uncertainty sits a real comparative finding: in the head-to-head studies of the 2018 network meta-analysis, agomelatine, amitriptyline, escitalopram, mirtazapine, paroxetine, venlafaxine and vortioxetine were more effective than the other antidepressants (range of odds ratios 1.19 to 1.96). Mirtazapine did not appear in the more tolerable group. Its antidepressant mechanism remains uncertain, while three separate trials did not support the additional uses assessed here.',
        evidenceSource:
          'Mirtazapine United States prescribing information, sections 12.1 and 12.2 (NDA 020415); Cipriani A et al., Lancet 2018;391:1357-1366',
        doi: '10.1016/S0140-6736(17)32802-7',
        inferredClaim:
          'That alpha-2 autoreceptor blockade is the mechanism of the antidepressant effect — offered on the label as something that "could" be the case, in a document that opens by calling the mechanism unclear',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A tablet at night, often chosen because it sedates',
        laymanDesc:
          'It is taken in the evening because it makes people sleepy. That is one of the most common reasons it is picked in the first place.',
        molecularDetail:
          'Available as a film-coated tablet and as an orally disintegrating tablet. Somnolence was reported in 54% of patients in United States controlled studies against 18% on placebo, and led to discontinuation in 10.4% against 2.2%. The label states it is unclear whether tolerance develops.',
        iconName: 'Moon',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'No pump is blocked',
        laymanDesc:
          'This is the antidepressant that does not touch the recycling pumps. A screening test designed for SSRIs would show nothing at all.',
        molecularDetail:
          'Mirtazapine inhibits no monoamine transporter. Its pharmacology is entirely receptor antagonism: alpha-2 adrenergic autoreceptors and heteroreceptors, 5-HT2 and 5-HT3, histamine H1, peripheral alpha-1 and muscarinic receptors, with no significant affinity for 5-HT1A or 5-HT1B.',
        iconName: 'XCircle',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'A brake is released instead',
        laymanDesc:
          'Nerve cells carry a receptor that tells them to stop releasing noradrenaline and serotonin. Blocking that receptor takes the brake off, so more of both comes out.',
        molecularDetail:
          'Antagonism at central presynaptic alpha-2 adrenergic inhibitory autoreceptors and heteroreceptors, enhancing central noradrenergic and serotonergic activity. Section 12.1 offers this as what the efficacy "could be mediated through", after stating that the mechanism is unclear.',
        iconName: 'Unlock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And the histamine receptor is blocked at the same time',
        laymanDesc:
          'The same receptor that antihistamines block. This is where the drowsiness and the hunger come from, and the label says so directly.',
        molecularDetail:
          'Section 12.2 states that the prominent somnolent effects may be explained by inhibition of histamine H1 receptors and the orthostatic hypotension by inhibition of peripheral alpha-1 adrenergic receptors. Appetite increase was reported in 17% against 2% on placebo and 7% weight gain in 7.5% against 0%.',
        iconName: 'Utensils',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In depression, it performs well',
        laymanDesc:
          'For its actual licensed use, this is one of the better-performing antidepressants in direct comparisons.',
        molecularDetail:
          'In the head-to-head studies of the 2018 network meta-analysis of 21 antidepressants across 522 trials and 116,477 participants, mirtazapine was among the seven drugs more effective than the others (range of odds ratios 1.19 to 1.96). It did not appear among the six rated most tolerable.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'In everything it is borrowed for, it did not',
        laymanDesc:
          'Tested as an appetite stimulant, it matched placebo. Tested for depression in dementia, it matched placebo. Tested for agitation in dementia, it matched placebo and had more deaths.',
        molecularDetail:
          'Cancer cachexia: appetite change at day 28 not different from placebo in 120 patients (p=0.472 per-protocol, p=0.462 intention-to-treat). Depression in Alzheimer’s: mean difference 0.01 (95% CI −1.37 to 1.38, p=0.99) at 13 weeks, persisting to 39. Agitation in dementia: adjusted mean CMAI difference −1.74 (95% CI −7.17 to 3.69, p=0.53) with seven deaths against one by week 16.',
        iconName: 'AlertCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SYMBAD — NCT03031184 / ISRCTN17411897 (Lancet 2021;398:1487-1497)',
        phase: 'Phase 3, parallel-group, double-blind, placebo-controlled',
        sampleSize: 204,
        primaryEndpoint:
          'Reduction in Cohen-Mansfield Agitation Inventory score at 12 weeks in people with probable or possible Alzheimer’s disease and agitation unresponsive to non-drug treatment',
        endpointMet: false,
        statisticalPValue:
          'Adjusted mean difference −1.74 (95% CI −7.17 to 3.69), p=0.53 — no significant difference from placebo',
        unreportedAdverseSignals:
          'Seven deaths in the mirtazapine group by week 16 against one in the control group, with post-hoc analysis suggesting marginal statistical significance (p=0.065). Overall adverse event counts were similar between arms: 67 of 102 against 65 of 102.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'HTA-SADD — ISRCTN88882979 (Lancet 2011;378:403-411)',
        phase: 'Phase 3, multicentre, three-arm, double-blind, placebo-controlled',
        sampleSize: 326,
        primaryEndpoint:
          'Reduction in Cornell Scale for Depression in Dementia score at 13 weeks in people with probable or possible Alzheimer’s disease and depression of at least four weeks',
        endpointMet: false,
        statisticalPValue:
          'Mirtazapine against placebo: mean difference 0.01 (95% CI −1.37 to 1.38), p=0.99. Sertraline against placebo: 1.17 (−0.23 to 2.58), p=0.10. Findings persisted to 39 weeks',
        unreportedAdverseSignals:
          'Adverse reactions in 44 of 108 (41%) on mirtazapine and 46 of 107 (43%) on sertraline against 29 of 111 (26%) on placebo (p=0.031 and p=0.010), with fewer serious adverse events rated severe in the placebo group (p=0.003). Five patients in every group died by week 39.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Mirtazapine in cancer-associated anorexia and cachexia (J Pain Symptom Manage 2021;62:1207-1215)',
        phase: 'Double-blind, placebo-controlled, randomised',
        sampleSize: 120,
        primaryEndpoint:
          'Change in appetite score from baseline to day 28 on mirtazapine 15 mg nightly against placebo, in patients with incurable solid tumours, anorexia and cachexia',
        endpointMet: false,
        statisticalPValue:
          'Appetite increased significantly in both arms (p<0.0001 each); the between-arm difference was not significant (p=0.472 per-protocol, p=0.462 intention-to-treat)',
        unreportedAdverseSignals:
          'Higher prevalence of somnolence on mirtazapine, and significantly less increase in depressive symptoms. Quality of life, fatigue, body weight, lean body mass, handgrip strength, inflammatory markers and survival did not differ. Enrolment excluded patients with more than mild depressive symptoms, isolating appetite from mood.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Somnolence in 54% against 18% on placebo, with discontinuation for it in 10.4% against 2.2%',
        'Appetite increase in 17% against 2%, and 7% weight gain in 7.5% against 0%, with 8% discontinuing for weight gain',
        '49% of paediatric patients gaining at least 7% of body weight over eight weeks against 5.7% on placebo',
        'Agranulocytosis in 2 of 2,796 premarketing patients plus a third with severe neutropenia, onset days 9, 14 and 61',
        'No difference from placebo on agitation in dementia (−1.74, 95% CI −7.17 to 3.69), on depression in dementia (0.01, p=0.99) or on appetite in cancer cachexia (p=0.462)',
      ],
      unsupportedInferences: [
        'That the weight gain seen as an adverse reaction in depression trials makes this a useful appetite stimulant, which a dedicated randomised trial did not confirm',
        'That the sedation makes it a good choice for depression with insomnia; sedation is measured as a reason people stopped the drug, not as an endpoint anyone tested',
        'That alpha-2 autoreceptor blockade explains the antidepressant effect — offered on the label as something that "could" be the mechanism, in a section that opens by calling it unclear',
        'That its good head-to-head efficacy ranking in general depression transfers to depression in dementia, where a dedicated trial returned p=0.99',
      ],
      whatFailedInitially: [
        'SYMBAD found no benefit for agitation in dementia and seven deaths on drug against one on placebo by week 16',
        'HTA-SADD found no benefit for depression in Alzheimer’s disease at 13 or 39 weeks, with more adverse reactions than placebo',
        'A dedicated randomised trial found no appetite benefit over placebo in cancer-associated anorexia and cachexia',
        'Safety and effectiveness in paediatric depression have never been established, while the paediatric weight gain rate is nearly nine times the placebo rate',
      ],
      realWorldOutcome: [
        'Approved in the United States on 14 June 1996 under NDA 020415 and generic since 2004, at about eleven United States cents a tablet at pharmacy acquisition cost',
        'One of seven antidepressants more effective than the others in head-to-head comparison across 522 trials',
        'Widely prescribed in older and frail people specifically for the two effects its label counts as adverse reactions',
        'Two large publicly funded United Kingdom trials, run precisely because that off-label practice was widespread, both returned null results',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 7.5, 15, 30 and 45 mg and orally disintegrating tablet at 15, 30 and 45 mg, taken once daily, usually at night',
      description:
        'Dispensed as the free base rather than a salt. Desmethylmirtazapine is an active metabolite. At 75 mg, 1.67 times the maximum recommended dosage, mirtazapine does not prolong the QTc interval to a clinically meaningful extent in healthy subjects — an unusually clean cardiac profile for this class.',
      safetyProfile:
        'Boxed warning for suicidal thoughts and behaviours in children, adolescents and young adults; safety and effectiveness in paediatric patients not established. Agranulocytosis, with discontinuation directed if sore throat, fever, stomatitis or infection occurs alongside a low white cell count. Serotonin syndrome, including with other serotonergic drugs and when taken alone. Angle-closure glaucoma in untreated anatomically narrow angles. QTc prolongation caution in patients with risk factors. Increased appetite and weight gain. Somnolence, with caution advised for driving and machinery. Activation of mania or hypomania. Seizures. Orthostatic hypotension, attributed on the label to peripheral alpha-1 antagonism. Contraindicated with monoamine oxidase inhibitors.',
    },
    commonQuestions: [
      {
        q: 'It was given to me to help me sleep and eat. Does it do that?',
        a: 'It does both, and neither is a licensed use, and when each was tested as a benefit rather than counted as a side effect the result was not what the practice assumes. On the label, somnolence occurred in 54% of treated patients against 18% on placebo, and appetite increase in 17% against 2%, with 7.5% gaining at least 7% of their body weight against nobody on placebo. Those are adverse-reaction figures — 10.4% of people stopped the drug because of the drowsiness and 8% because of the weight. When 120 patients with cancer-related loss of appetite were randomised to mirtazapine or placebo for eight weeks, appetite improved in both groups and the difference between them was not statistically significant. So the effects are real; the claim that they translate into a benefit in the people it is borrowed for is the part that did not survive testing.',
        auditNote:
          'A measured side effect is a hypothesis about a benefit, not a demonstration of one. This drug is the clearest case in this file of that distinction mattering.',
      },
      {
        q: 'Is it safe for someone with dementia who is agitated?',
        a: 'Two large publicly funded British trials looked at exactly that question and neither supported it. SYMBAD randomised 204 people with Alzheimer’s disease and agitation that had not responded to non-drug care to mirtazapine or placebo; agitation scores at twelve weeks did not differ (adjusted mean difference −1.74, 95% CI −7.17 to 3.69, p=0.53), and by week sixteen there had been seven deaths in the mirtazapine group against one on placebo, a difference the authors described as of marginal statistical significance in a post-hoc analysis. Earlier, HTA-SADD randomised people with Alzheimer’s and depression to sertraline, mirtazapine or placebo; the mirtazapine-placebo difference at thirteen weeks was 0.01 points, p=0.99, and both drugs produced more adverse reactions than placebo. The SYMBAD authors concluded the data do not support using mirtazapine for agitation in dementia.',
        auditNote:
          'Seven deaths against one in 204 people at p=0.065 is not proof of harm. It is a signal in a trial that found no benefit to weigh it against, which is a different situation from a signal in a trial that worked.',
      },
      {
        q: 'How is it different from an SSRI?',
        a: 'It does not do the thing SSRIs do at all. Every SSRI blocks the pump that recycles serotonin out of the synapse. Mirtazapine blocks no transporter of any kind. Instead it blocks receptors: the alpha-2 receptor, which normally tells nerve cells to stop releasing noradrenaline and serotonin, so blocking it releases more of both; the 5-HT2 and 5-HT3 serotonin receptors; the histamine H1 receptor, which the label names as the likely cause of the drowsiness; and peripheral alpha-1 receptors, which it names as the likely cause of the drop in blood pressure on standing. The practical consequences are a very different side-effect profile — heavy sedation and weight gain instead of nausea and sexual dysfunction — and, in the largest comparison of antidepressants ever run, a place among the seven that outperformed the rest head to head.',
      },
      {
        q: 'What is the blood problem I was warned about?',
        a: 'Agranulocytosis — the loss of the white cells that fight bacterial infection. In the premarketing trials, 2 of 2,796 patients developed it with fever and infection, and a third developed severe neutropenia without any symptoms. The detail worth carrying is the timing: onset was detected on day 9 in one case, day 14 in another and day 61 in the third, so there is no point after which the risk is past. All three recovered once the drug was stopped. The label does not direct routine blood tests; it directs that if you develop a sore throat, fever, mouth ulcers or other signs of infection, the drug is stopped and you are monitored closely. That makes early reporting the whole safety mechanism.',
      },
      {
        q: 'Why does the label say the mechanism is unclear if the drug works?',
        a: 'Because those are separate questions, and this label is unusually direct about it. Section 12.1 begins: "The mechanism of action of mirtazapine for the treatment of major depressive disorder, is unclear." It then offers alpha-2 antagonism as something the efficacy "could be mediated through" — a conditional, not a claim. Meanwhile the efficacy evidence is comparatively good: in the 2018 network meta-analysis of 21 antidepressants across 522 trials, mirtazapine was one of seven drugs more effective than the others in head-to-head comparison. Knowing that something works and not knowing why is a normal state in medicine. The problem this site tracks is what gets built on top of the not-knowing, and for mirtazapine that is three off-label uses, each of which failed when someone finally ran the trial.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Mirtazapine United States prescribing information — Boxed Warning, Warnings and Precautions 5.2 Agranulocytosis, 5.6 Increased Appetite and Weight Gain, 5.7 Somnolence, Clinical Pharmacology 12.1 and 12.2 (NDA 020415)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020415',
        kind: 'regulatory',
      },
      {
        label:
          'Banerjee S, High J, Stirling S, et al. Study of mirtazapine for agitated behaviours in dementia (SYMBAD): a randomised, double-blind, placebo-controlled trial. Lancet 2021;398:1487-1497',
        identifier: '10.1016/S0140-6736(21)01210-1',
        kind: 'doi',
      },
      {
        label: 'SYMBAD registry record',
        identifier: 'NCT03031184',
        kind: 'nct',
      },
      {
        label:
          'Banerjee S, Hellier J, Dewey M, et al. Sertraline or mirtazapine for depression in dementia (HTA-SADD): a randomised, multicentre, double-blind, placebo-controlled trial. Lancet 2011;378:403-411',
        identifier: '10.1016/S0140-6736(11)60830-1',
        kind: 'doi',
      },
      {
        label:
          'Hunter CN, Abdel-Aal HH, Elsherief WA, Farag DE, Riad NM, Alsirafy SA. Mirtazapine in Cancer-Associated Anorexia and Cachexia: A Double-Blind Placebo-Controlled Randomized Trial. J Pain Symptom Manage 2021;62:1207-1215',
        identifier: '10.1016/j.jpainsymman.2021.05.017',
        kind: 'doi',
      },
      {
        label:
          'Cooney GM, Dwan K, Greig CA, et al. Exercise for depression. Cochrane Database Syst Rev 2013;(9):CD004366',
        identifier: '10.1002/14651858.CD004366.pub6',
        kind: 'doi',
      },
      NETWORK_META_SOURCE,
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — mirtazapine, 90 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 4205 — mirtazapine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4205',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Amitriptyline — the most effective antidepressant in the largest network meta-analysis, with
  //    a twenty-word indications section, a mechanism "believed by some", and no unbiased evidence
  //    for the use it is most often prescribed for.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'amitriptyline',
    name: 'Amitriptyline',
    tradeName: 'Elavil / Endep / Amitril / Amitid — all discontinued as brands',
    sponsor:
      'AstraZeneca on the record enriched here; first approved in the United States in 1961 and supplied since by generic manufacturers under abbreviated applications',
    targetGene: 'SLC6A2 and SLC6A4',
    targetProtein:
      'The membrane pump for noradrenaline and serotonin, in the label’s own words. Amitriptyline also antagonises muscarinic, histamine H1 and alpha-1 adrenergic receptors, and blocks cardiac fast sodium channels — the last being what makes overdose lethal',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1961,
    indication:
      'For the relief of symptoms of depression. Endogenous depression is more likely to be alleviated than are other depressive states',
    patientFriendlyIndication:
      'Depression — although most prescriptions today are at much lower doses for nerve pain, migraine prevention, irritable bowel syndrome or sleep',
    anatomicalSite:
      'Noradrenaline and serotonin transporters in the central nervous system; muscarinic and histamine receptors throughout the body; and, in overdose, the cardiac fast sodium channel',
    conditionContext: {
      conditionExplainer:
        'Amitriptyline’s licensed indication is written in twenty words and names a diagnostic category — endogenous depression — that no current diagnostic manual uses. Its actual use is mostly elsewhere: neuropathic pain, migraine prophylaxis, irritable bowel syndrome and insomnia, at a fraction of the antidepressant dose.',
      whyItMatters:
        'This drug produces the two most opposite findings in this file. It has the highest efficacy odds ratio against placebo of all 21 antidepressants in the largest network meta-analysis ever run. And the Cochrane review of the use it is most often prescribed for — neuropathic pain — found no first-tier or second-tier evidence for it at all.',
      whoTakesThis:
        'Adults with depression, per the licence. In practice, adults with nerve pain, migraine, irritable bowel syndrome or insomnia, usually at 10 to 50 mg rather than the 75 to 150 mg antidepressant range. It is on the Beers list of drugs to avoid in older adults because of its anticholinergic load.',
      clinicalGoals:
        'For depression, symptom relief with no scale specified on the label. For the off-label uses, a pain score, a headache count or a bowel symptom score — each with its own separate and very unequal evidence base.',
    },
    oneSentenceVerdict:
      'The tricyclic with the highest efficacy odds ratio against placebo of all 21 drugs in the 2018 network meta-analysis (2.13, 95% CrI 1.89 to 2.41) and one of the seven highest dropout rates, whose 1961 label runs to twenty words and attributes its mechanism to what "is believed by some", and for whose commonest modern use — neuropathic pain — the 2015 Cochrane review of 17 trials in 1,342 patients found no first-tier or second-tier evidence and adverse events in 55% against 36% on placebo.',
    laymanHowItWorks:
      'Amitriptyline blocks the pumps that recycle noradrenaline and serotonin, so more of both stays between nerve cells. It also blocks several other receptors it was never designed for: the ones that control saliva, pupils, bladder and heart rate, the histamine receptor that makes people drowsy, and the ones that keep blood vessels tight. At low doses those extra effects and the pain pathways are what most people are actually taking it for. Its own label says the mechanism in humans is not known.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 63,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0904 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 113 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'First approved in the United States in 1961 and generic for over half a century; every current listing is an abbreviated application and the original brands are no longer marketed. At about nine United States cents a tablet it is on the WHO Model List of Essential Medicines and is among the cheapest drugs available anywhere for the conditions it is used in.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The right comparison depends entirely on the dose and the reason. At antidepressant doses the comparators are the SSRIs, which are far better tolerated and, on the network meta-analysis, slightly less effective. At the 10 to 50 mg doses most prescriptions use, the comparators are its own metabolite nortriptyline, the newer neuropathic pain drugs, and — for irritable bowel syndrome, the one low-dose indication with a large modern trial behind it — nothing much, because amitriptyline won that one.',
      conventionalRx: [
        {
          name: 'Nortriptyline (Pamelor)',
          class: 'Secondary amine tricyclic — amitriptyline’s own active metabolite',
          howItCompares:
            'Your liver converts amitriptyline into nortriptyline, so anyone taking the parent is already taking both. Nortriptyline has substantially less antimuscarinic and antihistaminic load, which is why it is generally preferred where anticholinergic burden matters, and it is the one antidepressant with a genuine therapeutic plasma window.',
          typicalCost:
            'US$0.1578 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 33 listed generic products, survey effective 18 February 2026)',
          prosAndCons:
            'Pros: less dry mouth, constipation, sedation and postural hypotension; a measurable therapeutic range. Cons: nearly twice the price; the same sodium-channel cardiotoxicity in overdose.',
        },
        {
          name: 'Duloxetine or pregabalin, for neuropathic pain',
          class: 'Serotonin-noradrenaline reuptake inhibitor, and alpha-2-delta ligand',
          howItCompares:
            'Both have registration trials in diabetic peripheral neuropathic pain that amitriptyline does not. Duloxetine’s two 12-week fixed-dose trials enrolled 791 patients; the 2015 Cochrane review of amitriptyline in neuropathic pain found only third-tier evidence across 17 trials and 1,342 participants, with just two of seven studies reporting useful efficacy data showing a significant benefit.',
          typicalCost:
            'Duloxetine US$0.1293 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 74 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: an actual regulatory efficacy dossier in the indication; no anticholinergic load; not lethal in overdose in the way a tricyclic is. Cons: duloxetine worsens glycaemic control in diabetes and carries a hepatotoxicity warning; pregabalin sedates and causes weight gain.',
        },
        {
          name: 'An SSRI, at antidepressant doses',
          class: 'Selective serotonin reuptake inhibitors',
          howItCompares:
            'In the 2018 network meta-analysis amitriptyline had the highest efficacy odds ratio against placebo of all 21 drugs (2.13, 95% CrI 1.89 to 2.41) and was one of seven better in head-to-head comparison — and it was also among the seven drugs with the highest dropout rates. Escitalopram appeared in the more-effective and the more-tolerable group at once, which amitriptyline did not.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: far safer in overdose; no anticholinergic burden; better tolerated. Cons: on the largest available comparison, marginally less effective; no useful analgesic effect at any dose.',
        },
      ],
      naturalFoods: [
        {
          name: 'Enteric-coated peppermint oil, for irritable bowel syndrome only',
          activeCompound: 'L-menthol, delivered in an enteric-coated capsule',
          biologicalMechanism:
            'Menthol blocks L-type calcium channels in intestinal smooth muscle, relaxing it, and activates TRPM8 receptors. That is a direct smooth-muscle mechanism, unrelated to amitriptyline’s monoamine or anticholinergic pharmacology, so the two act on different parts of the problem.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only, against the drug on this page: a 2019 meta-analysis of 12 randomised trials in 835 patients found a risk ratio for global symptom improvement of 2.39 (95% CI 1.93 to 2.97) across seven trials, and 1.78 (1.43 to 2.20) for abdominal pain across six, with no significant difference in adverse events (9.3% against 6.1%, RR 1.40, 95% CI 0.87 to 2.26). The ATLANTIS trial of low-dose amitriptyline in 463 patients gave a difference in IBS symptom severity score of −27.0 at six months.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Keep it where children and anyone at risk cannot reach it',
          action:
            'This is the most important sentence on this page and it is about storage, not dosing.',
          patientImpact:
            'The label opens its overdose section with "Deaths may occur from overdosage with this class of drugs" and lists cardiac dysrhythmias, severe hypotension, convulsions and coma as the critical manifestations. A rightward shift in the terminal QRS axis with a prolonged QT and sinus tachycardia are described as specific and sensitive indicators of first-generation tricyclic overdose.',
          clinicalPrecaution:
            'The label directs contacting a poison control centre and states that signs of toxicity develop rapidly, so hospital monitoring is required as soon as possible. A month’s supply of a nine-cent tablet is a lethal quantity, which is not true of any SSRI in this file.',
        },
        {
          name: 'Mention every anticholinergic thing you take, including over the counter',
          action:
            'Sleep aids, antihistamines, bladder tablets and motion-sickness remedies all add to the same load.',
          patientImpact:
            'A nested case-control study in 284,343 case patients and matched controls, mean age 82, found dementia odds rising with cumulative anticholinergic exposure to an adjusted odds ratio of 1.49 (95% CI 1.44 to 1.54) in the highest exposure band, with the anticholinergic antidepressants as a class at 1.29 (1.24 to 1.34).',
          clinicalPrecaution:
            'That is a class-level observational finding and the paper’s accessible text does not name amitriptyline individually, so this page does not attribute the number to the molecule. What it does establish is that cumulative anticholinergic load is worth counting, and amitriptyline is a strongly anticholinergic drug.',
        },
        {
          name: 'Stand up slowly and expect a dry mouth',
          action:
            'These are not incidental — they are the same pharmacology as the therapeutic effect.',
          patientImpact:
            'Amitriptyline antagonises muscarinic receptors (dry mouth, constipation, blurred vision, urinary hesitancy), histamine H1 receptors (sedation, weight gain) and alpha-1 adrenergic receptors (postural hypotension). None of these is separable from the molecule.',
          clinicalPrecaution:
            'In older people this combination drives falls, confusion and urinary retention, which is why amitriptyline appears on the American Geriatrics Society Beers list of medications to avoid in older adults. Whether the benefit outweighs it is a clinical judgement, not one this page can make.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(C)CCC=C1C2=CC=CC=C2CCC3=CC=CC=C31',
      chemicalFormula: 'C20H23N',
      molecularWeight: '277.40 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'A tertiary amine dibenzocycloheptene. The label states: "Its mechanism of action in man is not known. It is not a monoamine oxidase inhibitor and it does not act primarily by stimulation of the central nervous system. Amitriptyline inhibits the membrane pump mechanism responsible for uptake of norepinephrine and serotonin in adrenergic and serotonergic neurons... This interference with reuptake of norepinephrine and/or serotonin is believed by some to underlie the antidepressant activity of amitriptyline." Beyond the transporters it antagonises muscarinic, histamine H1 and alpha-1 adrenergic receptors, and in overdose blocks cardiac fast sodium channels, which is the mechanism of the QRS widening the label describes as a specific indicator of toxicity. It is N-demethylated to nortriptyline, itself a marketed drug.',
      structureSource: {
        label:
          'PubChem CID 2160 (amitriptyline) — canonical SMILES, molecular formula and weight, as carried on the enriched record; mechanism and overdose statements quoted from the amitriptyline hydrochloride United States prescribing information',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2160',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ami-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the dibenzosuberene core and the nortriptyline impurity limit',
          description:
            'The controlled impurity is nortriptyline, which is both the principal human metabolite and a separately licensed medicine. Its limit in an amitriptyline batch is therefore set on pharmacological grounds. The exocyclic double bond can also isomerise, which changes the geometry that fits the transporter.',
          reagentsAndBuffer:
            'Amitriptyline hydrochloride and nortriptyline hydrochloride reference standards, reverse-phase HPLC with UV detection, nuclear magnetic resonance to confirm the exocyclic alkene geometry, Karl Fischer titration',
        },
        {
          id: 'ami-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Add a dimethylaminopropyl chain to a dibenzosuberone and dehydrate',
          description:
            'The route is short: a Grignard addition of a dimethylaminopropyl reagent to dibenzosuberone, then acid-catalysed dehydration to form the exocyclic double bond. There are no stereocentres. This is why a tablet costs nine United States cents and why the molecule was available decades before anything designed to be selective.',
          dependsOnStepId: 'ami-w1',
          reagentsAndBuffer:
            'Dibenzosuberone, 3-(dimethylamino)propyl magnesium chloride in anhydrous tetrahydrofuran, acid for the dehydration, hydrogen chloride for salt formation',
        },
        {
          id: 'ami-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the hydrochloride and control the geometric isomer',
          description:
            'Salt formation and recrystallisation, with the specification covering both the nortriptyline content and the geometry of the exocyclic double bond. An isomerised batch presents a differently shaped molecule to the same transporters and receptors.',
          dependsOnStepId: 'ami-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in an alcoholic solvent, recrystallisation, HPLC release testing against nortriptyline and geometric-isomer limits',
        },
        {
          id: 'ami-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Screen the off-targets and the cardiac sodium channel, not just the transporters',
          description:
            'For this molecule the off-target panel describes the drug better than the on-target one. Muscarinic, H1 and alpha-1 affinities account for the side effects that limit the dose, and the cardiac fast sodium channel accounts for why an overdose kills. A transporter-only screen would miss everything that matters clinically.',
          dependsOnStepId: 'ami-w3',
          reagentsAndBuffer:
            'HEK293 cells expressing SLC6A2 and SLC6A4 for uptake, radioligand binding across muscarinic M1 to M5, HRH1 and ADRA1A, and automated patch-clamp on cells expressing cardiac SCN5A and hERG; amitriptyline and nortriptyline as separate test articles',
        },
        {
          id: 'ami-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure parent and metabolite separately, with a twelve-lead electrocardiogram',
          description:
            'Anyone on amitriptyline is carrying nortriptyline as well, in a ratio that depends on CYP2D6 activity, so a single combined concentration cannot describe the exposure. Because the toxic effect is electrocardiographic and dose-related, QRS duration belongs in the same schedule as the plasma assay rather than in an emergency-department protocol.',
          dependsOnStepId: 'ami-w4',
          reagentsAndBuffer:
            'Liquid chromatography-tandem mass spectrometry with deuterated amitriptyline and nortriptyline internal standards, CYP2D6 genotyping, time-matched 12-lead electrocardiography with QRS duration and terminal axis measurement',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ami-a1',
        category: 'conclusion_shift',
        title: 'A twenty-word indications section and a mechanism "believed by some"',
        laymanSummary:
          'The entire licensed indication reads: "For the relief of symptoms of depression. Endogenous depression is more likely to be alleviated than are other depressive states." No trial is named, no number is given, and the diagnostic category it uses is not in any current manual.',
        technicalDetails:
          'The indications section of the amitriptyline hydrochloride label is quoted above in full. The clinical pharmacology section reads: "Amitriptyline hydrochloride is an antidepressant with sedative effects. Its mechanism of action in man is not known. It is not a monoamine oxidase inhibitor and it does not act primarily by stimulation of the central nervous system. Amitriptyline inhibits the membrane pump mechanism responsible for uptake of norepinephrine and serotonin... This interference with reuptake of norepinephrine and/or serotonin is believed by some to underlie the antidepressant activity of amitriptyline." The phrase "believed by some" is the weakest mechanistic attribution on any label in this file, and it is more candid than most of them. The document is in the pre-1980s narrative format, with no numbered sections, no clinical studies section and no efficacy table — set against, for example, duloxetine’s Table 8, which prints six placebo-subtracted effect sizes with confidence intervals. This is not evidence that amitriptyline does not work: the 2018 network meta-analysis ranks it first of 21 on efficacy against placebo. It is evidence that the document a prescriber reads carries none of that information, and that a reader cannot check the licensed claim against anything.',
        evidenceSource:
          'Amitriptyline hydrochloride United States prescribing information, Indications and Usage and Clinical Pharmacology sections',
        measuredMetric:
          'Content of the licensed indications and mechanism statements, against the format of a modern label',
        auditFlag: 'caution',
      },
      {
        id: 'ami-a2',
        category: 'measured',
        title: 'First of 21 on efficacy, and among the seven worst on staying on it',
        laymanSummary:
          'In the largest comparison of antidepressants ever run, amitriptyline had the biggest advantage over placebo of all twenty-one drugs. It was also among the seven people were most likely to stop taking.',
        technicalDetails:
          'The 2018 network meta-analysis included 522 trials and 116,477 participants across 21 antidepressants. All were more effective than placebo, with odds ratios ranging from 2.13 (95% credible interval 1.89 to 2.41) for amitriptyline — the highest of the set — down to 1.37 (1.16 to 1.63) for reboxetine. In the head-to-head studies, amitriptyline was one of seven drugs more effective than the others (range of odds ratios 1.19 to 1.96). On acceptability, amitriptyline, clomipramine, duloxetine, fluvoxamine, reboxetine, trazodone and venlafaxine had the highest dropout rates (1.30 to 2.32); amitriptyline is therefore in the top group on one axis and the bottom group on the other. Certainty of evidence across the analysis was moderate to very low and 46 of 522 trials (9%) were at high risk of bias. The tolerability half of that result is the whole reason the SSRIs displaced this drug class, and it was never a claim about efficacy.',
        evidenceSource: 'Cipriani A, Furukawa TA, Salanti G, et al. Lancet 2018;391:1357-1366',
        doi: '10.1016/S0140-6736(17)32802-7',
        measuredMetric:
          'Efficacy and acceptability odds ratios for amitriptyline among 21 antidepressants across 522 trials',
        auditFlag: 'verified',
      },
      {
        id: 'ami-a3',
        category: 'failed',
        title: 'No unbiased evidence for the use it is most often prescribed for',
        laymanSummary:
          'Amitriptyline has been a first-line treatment for nerve pain for decades. The Cochrane review of every trial found none that met current standards, and only two of seven studies with usable data showed it beating placebo.',
        technicalDetails:
          'The 2015 Cochrane review included 17 randomised double-blind studies of at least four weeks in 1,342 participants across seven neuropathic pain conditions — eight cross-over studies with 302 participants at a median of 36 each, and nine parallel-group studies with 1,040 at a median of 84. The authors graded evidence in three tiers, the first requiring substantial pain reduction as the outcome, intention-to-treat analysis without imputation, at least 200 participants in the comparison, 8 to 12 weeks’ duration and parallel design. There was no first-tier or second-tier evidence for amitriptyline in any neuropathic pain condition; only third-tier evidence was available, and for only two of seven studies reporting useful efficacy data was amitriptyline significantly better than placebo, at very low quality. More participants had at least one adverse event on drug: 55% against 36% on placebo, risk ratio 1.5 (95% CI 1.3 to 1.8), number needed to harm 5.2 (3.6 to 9.1). The authors concluded: "The fact that there is no supportive unbiased evidence for a beneficial effect is disappointing, but has to be balanced against decades of successful treatment in many people with neuropathic pain. There is no good evidence of a lack of effect; rather our concern should be of overestimation of treatment effect."',
        evidenceSource:
          'Moore RA, Derry S, Aldington D, Cole P, Wiffen PJ. Amitriptyline for neuropathic pain in adults. Cochrane Database Syst Rev 2015;(7):CD008242',
        doi: '10.1002/14651858.CD008242.pub3',
        measuredMetric:
          'Tier of evidence available for amitriptyline in neuropathic pain, and adverse event rate against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'ami-a4',
        category: 'measured',
        title: 'ATLANTIS: a genuine positive, in the bowel rather than the brain',
        laymanSummary:
          'The largest trial of a tricyclic in irritable bowel syndrome randomised 463 people in general practice to low-dose amitriptyline or placebo. Symptom severity scores were 27 points lower on the drug at six months.',
        technicalDetails:
          'ATLANTIS (ISRCTN48075063) randomised 463 participants — mean age 48.5 years, 315 (68%) female — between October 2019 and April 2022 to titrated low-dose amitriptyline (232) or placebo (231) as a second-line treatment for irritable bowel syndrome in United Kingdom primary care, with patient-led dose titration. Intention-to-treat analysis of the primary outcome showed a significant difference favouring amitriptyline in IBS Severity Scoring System score at six months: −27.0 (95% CI −46.9 to −7.10, p=0.0079). Forty-six (20%) discontinued amitriptyline, 30 (13%) for adverse events, against 59 (26%) discontinuing placebo, 20 (9%) for adverse events. There were five serious adverse reactions, two on amitriptyline and three on placebo. The trial was funded by the NIHR Health Technology Assessment Programme. Two things make this the most informative positive result on this page: it is publicly funded and independent, and it tested the low-dose off-label use directly rather than borrowing evidence from the antidepressant dose. That is the design the neuropathic pain literature never produced.',
        evidenceSource:
          'Ford AC, Wright-Hughes A, Alderson SL, et al. Amitriptyline at low dose and titrated for irritable bowel syndrome as second-line treatment in primary care (ATLANTIS): a randomised, double-blind, placebo-controlled, phase 3 trial. Lancet 2023;402:1773-1785',
        doi: '10.1016/S0140-6736(23)01523-4',
        measuredMetric:
          'IBS Severity Scoring System score difference at six months, low-dose amitriptyline against placebo, 463 patients',
        auditFlag: 'verified',
      },
      {
        id: 'ami-a5',
        category: 'failed',
        title: 'A nine-cent tablet that is lethal in a month’s supply',
        laymanSummary:
          'The label’s overdose section opens with the sentence "Deaths may occur from overdosage with this class of drugs." That is not true of any SSRI on this site, and it matters because the condition being treated carries a risk of self-harm.',
        technicalDetails:
          'The overdose section states that deaths may occur, that multiple drug ingestion including alcohol is common in deliberate tricyclic overdose, and that because signs of toxicity develop rapidly, hospital monitoring is required as soon as possible. Critical manifestations are cardiac dysrhythmias, severe hypotension, convulsions and central nervous system depression including coma. Electrocardiographic changes, particularly in QRS axis or width, are described as clinically significant indicators of toxicity, with a rightward axis shift in the terminal QRS complex together with a prolonged QT and sinus tachycardia named as specific and sensitive indicators of first-generation tricyclic overdose — while the label adds that their absence is not exclusionary. The mechanism is blockade of the cardiac fast sodium channel, the same target class as a local anaesthetic. Prolonged PR interval, ST-T wave changes, ventricular tachycardia and fibrillation may also occur. For comparison, venlafaxine’s label describes its own overdose risk as higher than the SSRIs but lower than the tricyclics, which places this drug at the top of that ordering.',
        evidenceSource:
          'Amitriptyline hydrochloride United States prescribing information, Overdosage section; venlafaxine United States prescribing information, Overdosage — Human Experience',
        measuredMetric:
          'Labelled overdose manifestations and the electrocardiographic markers of tricyclic toxicity',
        auditFlag: 'caution',
      },
      {
        id: 'ami-a6',
        category: 'inferred',
        title: 'A class-level dementia signal that this page will not pin on the molecule',
        laymanSummary:
          'A very large study found that people with the heaviest cumulative exposure to strongly anticholinergic drugs had about 50% higher odds of a dementia diagnosis, and that anticholinergic antidepressants as a group carried about 29% higher odds. It did not name amitriptyline.',
        technicalDetails:
          'A nested case-control study covering 284,343 case patients and matched controls, 63.1% women, mean age 82.2 years, found the adjusted odds ratio for dementia rising from 1.06 (95% CI 1.03 to 1.09) at the lowest cumulative anticholinergic exposure band (1 to 90 total standardised daily doses) to 1.49 (95% CI 1.44 to 1.54) above 1,095 total standardised daily doses, against no anticholinergic prescriptions in the 1 to 11 years before the index date. Significant increases were found for anticholinergic antidepressants (adjusted OR 1.29, 95% CI 1.24 to 1.34), antiparkinson drugs, antipsychotics, bladder antimuscarinics and antiepileptics, all above 1,095 doses. Results were similar restricting exposure to 3 to 13 and 5 to 20 years before diagnosis, associations were stronger in cases diagnosed before age 80, and the population-attributable fraction for total anticholinergic exposure was 10.3%. Two limits belong on the page. This is observational, and prodromal dementia can itself drive prescriptions for depression, incontinence and sleep, which is reverse causation the design can attenuate but not eliminate. And amitriptyline is not named in the paper’s accessible text — this is a class-level result, and the convention on this site is that a class effect is an inference and not a measurement.',
        evidenceSource:
          'Coupland CAC, Hill T, Dening T, Morriss R, Moore M, Hippisley-Cox J. Anticholinergic drug exposure and the risk of dementia: a nested case-control study. JAMA Intern Med 2019;179:1084-1093',
        doi: '10.1001/jamainternmed.2019.0677',
        inferredClaim:
          'That amitriptyline specifically raises dementia risk — an extrapolation from a class-level observational association in which the molecule is not individually reported',
        auditFlag: 'contested',
      },
      {
        id: 'ami-a7',
        category: 'inferred',
        title: 'The low-dose uses borrow their rationale from the high-dose licence',
        laymanSummary:
          'Most amitriptyline prescriptions are for 10 to 50 mg, for pain, migraine, bowel symptoms or sleep. The licence is for depression at 75 to 150 mg. The pharmacology at ten milligrams is not the pharmacology the licence was granted on.',
        technicalDetails:
          'At 10 to 25 mg, plasma concentrations sit well below those associated with meaningful monoamine transporter occupancy, and the antihistaminic and antimuscarinic effects dominate — which is consistent with the sedation being the most reliable effect at those doses. The Cochrane review of neuropathic pain notes explicitly that "neuropathic pain can be treated with antidepressant drugs in doses below those at which the drugs act as antidepressants", and then finds no first- or second-tier evidence that this one does. The one place where the low-dose use has been tested properly and won is irritable bowel syndrome, in ATLANTIS. The pattern across this file is consistent: where somebody funded a trial of the actual low-dose use, the answer was sometimes yes and sometimes no, and where nobody did, the practice continued on inference. Amitriptyline is the drug where both outcomes are visible at once.',
        evidenceSource:
          'Moore RA et al., Cochrane Database Syst Rev 2015;(7):CD008242; Ford AC et al., Lancet 2023;402:1773-1785; amitriptyline hydrochloride United States prescribing information',
        doi: '10.1002/14651858.CD008242.pub3',
        inferredClaim:
          'That the licensed antidepressant evidence supports the low-dose analgesic, migraine, bowel and hypnotic uses — a transfer of evidence across a fivefold dose difference and four unrelated conditions',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A cheap tablet, usually at a fraction of the licensed dose',
        laymanDesc:
          'Nine cents a tablet, and most prescriptions are for 10 to 50 mg — well below the 75 to 150 mg the depression licence covers.',
        molecularDetail:
          'Dispensed as the hydrochloride. Available strengths span 10 to 150 mg. The licensed indication is depression; the dominant modern uses are neuropathic pain, migraine prophylaxis, irritable bowel syndrome and insomnia, at doses at which transporter occupancy is low and receptor antagonism dominates.',
        iconName: 'Coins',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Converted into a second marketed drug',
        laymanDesc:
          'The liver strips a methyl group and turns amitriptyline into nortriptyline — which is itself sold as a separate antidepressant.',
        molecularDetail:
          'N-demethylation, substantially by CYP2D6, produces nortriptyline. Anyone taking amitriptyline is carrying both, in a ratio that varies with CYP2D6 activity, which is why a combined plasma assay cannot describe the exposure.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Both monoamine pumps are blocked',
        laymanDesc:
          'Noradrenaline and serotonin are both left in the gap between nerve cells for longer. The label calls this "the membrane pump mechanism".',
        molecularDetail:
          'Inhibition of the membrane pump responsible for uptake of noradrenaline and serotonin in adrenergic and serotonergic neurons. The label states that this "is believed by some to underlie the antidepressant activity", after stating that the mechanism of action in man is not known.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And so is nearly everything else',
        laymanDesc:
          'Muscarinic receptors — dry mouth, constipation, blurred vision. Histamine receptors — drowsiness and weight. Alpha-1 receptors — dizziness on standing. None of it is optional.',
        molecularDetail:
          'Antagonism at muscarinic, histamine H1 and alpha-1 adrenergic receptors accounts for the dose-limiting effects and for most of the reason the SSRIs displaced this class. At low doses these effects arrive before meaningful transporter occupancy does, which is a plausible part of why a 10 mg tablet helps someone sleep.',
        iconName: 'Layers',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In depression, the largest measured effect of any antidepressant',
        laymanDesc:
          'Across 522 trials and 116,477 people, no other antidepressant beat placebo by more. And no group of drugs was harder to stay on.',
        molecularDetail:
          'Efficacy odds ratio against placebo of 2.13 (95% CrI 1.89 to 2.41), the highest of 21 drugs, and one of seven more effective in head-to-head comparison (1.19 to 1.96). Simultaneously in the highest-dropout group (1.30 to 2.32). Certainty of evidence moderate to very low.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And in overdose, the sodium channel that runs the heart',
        laymanDesc:
          'A large overdose blocks the electrical channel that fires each heartbeat. That is why the label opens its overdose section by saying deaths may occur.',
        molecularDetail:
          'Blockade of the cardiac fast sodium channel widens the QRS complex and shifts its terminal axis rightward — the label names those, with prolonged QT and sinus tachycardia, as specific and sensitive indicators of first-generation tricyclic overdose, while noting their absence is not exclusionary. Cardiac dysrhythmias, severe hypotension, convulsions and coma are the critical manifestations.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: '2018 network meta-analysis of 21 antidepressants (Lancet 2018;391:1357-1366)',
        phase: 'Systematic review and network meta-analysis of 522 randomised trials',
        sampleSize: 116477,
        primaryEndpoint:
          'Efficacy as response rate and acceptability as all-cause discontinuation, across 21 antidepressants in adults with major depressive disorder',
        endpointMet: true,
        statisticalPValue:
          'Amitriptyline had the highest efficacy odds ratio against placebo of the 21 drugs, 2.13 (95% CrI 1.89 to 2.41), and was one of seven more effective in head-to-head comparison',
        unreportedAdverseSignals:
          'Amitriptyline also sat in the group with the highest dropout rates (odds ratios 1.30 to 2.32). Certainty of evidence across the analysis was moderate to very low, and 46 of 522 trials (9%) were at high risk of bias.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Cochrane review of amitriptyline for neuropathic pain (Cochrane Database Syst Rev 2015;(7):CD008242)',
        phase: 'Systematic review of 17 randomised, double-blind trials of at least four weeks',
        sampleSize: 1342,
        primaryEndpoint:
          'Substantial pain intensity reduction against placebo or an active comparator across seven neuropathic pain conditions',
        endpointMet: false,
        statisticalPValue:
          'No first-tier or second-tier evidence in any condition; only third-tier evidence available, with amitriptyline significantly better than placebo in only two of seven studies reporting useful efficacy data, at very low quality',
        unreportedAdverseSignals:
          'At least one adverse event in 55% on amitriptyline against 36% on placebo, risk ratio 1.5 (95% CI 1.3 to 1.8), number needed to harm 5.2 (3.6 to 9.1). Most studies were at high risk of bias due to small size; the median parallel-group study had 84 participants and the median cross-over study 36.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'ATLANTIS — ISRCTN48075063 (Lancet 2023;402:1773-1785)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, primary care',
        sampleSize: 463,
        primaryEndpoint:
          'IBS Severity Scoring System score at six months on titrated low-dose amitriptyline against placebo, as second-line treatment for irritable bowel syndrome',
        endpointMet: true,
        statisticalPValue:
          'Intention-to-treat difference of −27.0 (95% CI −46.9 to −7.10), p=0.0079, favouring low-dose amitriptyline',
        unreportedAdverseSignals:
          '46 (20%) discontinued amitriptyline, 30 (13%) for adverse events, against 59 (26%) discontinuing placebo, 20 (9%) for adverse events. Five serious adverse reactions, two on drug and three on placebo. Publicly funded by the NIHR Health Technology Assessment Programme.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Highest efficacy odds ratio against placebo of 21 antidepressants: 2.13 (95% CrI 1.89 to 2.41) across 522 trials',
        'Among the seven antidepressants with the highest all-cause dropout rates in the same analysis',
        'IBS Severity Scoring System score 27.0 points lower than placebo at six months in 463 primary care patients',
        'At least one adverse event in 55% against 36% on placebo in neuropathic pain trials, number needed to harm 5.2',
        'No first-tier or second-tier evidence for neuropathic pain across 17 trials and 1,342 participants',
      ],
      unsupportedInferences: [
        'That the licensed antidepressant evidence supports the low-dose analgesic, migraine, bowel and hypnotic uses across a fivefold dose gap',
        'That reuptake inhibition explains the antidepressant effect — the label’s own wording is "believed by some"',
        'That the class-level anticholinergic dementia association applies to amitriptyline specifically; the study does not report the molecule individually',
        'That "endogenous depression is more likely to be alleviated" is a usable clinical distinction; no current diagnostic manual carries that category',
      ],
      whatFailedInitially: [
        'The Cochrane review of the drug’s commonest use found no unbiased evidence of benefit in any neuropathic pain condition',
        'Tolerability, not efficacy, is what the SSRIs beat this drug on — and the network meta-analysis confirms both halves of that',
        'The label carries no clinical studies section, no effect size and no numbered structure, so the licensed claim cannot be checked against anything',
        'Overdose is lethal at quantities routinely dispensed, in a population whose condition carries a risk of self-harm',
      ],
      realWorldOutcome: [
        'First approved in the United States in 1961; on the WHO Model List of Essential Medicines and about nine United States cents a tablet',
        'Most prescriptions today are at 10 to 50 mg for conditions outside its licence',
        'On the American Geriatrics Society Beers list of medications to avoid in older adults, on anticholinergic grounds',
        'ATLANTIS, in 2023, was the first large publicly funded trial to test one of its low-dose uses directly — and it was positive',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 10, 25, 50, 75, 100 and 150 mg, usually taken once daily at night when the sedation is wanted',
      description:
        'N-demethylated substantially by CYP2D6 to nortriptyline, itself a licensed antidepressant, so both parent and metabolite circulate in a ratio that varies with CYP2D6 activity. The molecule has no stereocentres and a two-step synthesis, which is why it is among the cheapest prescription drugs in the world.',
      safetyProfile:
        'Boxed warning for suicidal thoughts and behaviours in children, adolescents and young adults. Deaths may occur from overdosage with this class of drugs: critical manifestations are cardiac dysrhythmias, severe hypotension, convulsions and coma, with QRS widening and terminal-axis shift as specific indicators, and hospital monitoring is directed as soon as possible after ingestion. Strong antimuscarinic effects — dry mouth, constipation, blurred vision, urinary hesitancy — and antihistaminic sedation and weight gain, and alpha-1-mediated postural hypotension. On the American Geriatrics Society Beers list for older adults. Contraindicated with monoamine oxidase inhibitors and in the acute recovery phase after myocardial infarction.',
    },
    commonQuestions: [
      {
        q: 'Why am I on an antidepressant for my nerve pain?',
        a: 'Because tricyclics have been first-line for neuropathic pain for decades, at doses far below those used for depression, and because guidelines in many countries recommend it. What is worth knowing is how thin the formal evidence is. The 2015 Cochrane review pooled 17 randomised double-blind trials in 1,342 people across seven neuropathic pain conditions and found no first-tier or second-tier evidence for amitriptyline in any of them — only third-tier, and in only two of seven studies with usable efficacy data was it significantly better than placebo. Meanwhile 55% of people on the drug had at least one adverse event against 36% on placebo. The review’s authors were careful, and their wording is the fairest summary available: there is no supportive unbiased evidence for a beneficial effect, but there is no good evidence of a lack of effect either — the concern is overestimation, not absence.',
        auditNote:
          'Absence of good evidence is not evidence of absence. It is also not the same as the evidence that duloxetine and pregabalin have in the same indication, which is what makes the comparison worth putting in front of a reader.',
      },
      {
        q: 'Is this an old drug that has been superseded?',
        a: 'It has been displaced, which is not the same thing. In the 2018 network meta-analysis of 21 antidepressants across 522 trials and 116,477 patients, amitriptyline had the largest advantage over placebo of any drug in the set — an odds ratio of 2.13, higher than every SSRI. What it also had was one of the seven highest dropout rates. The SSRIs did not replace the tricyclics by being more effective; they replaced them by being tolerable and by not killing people who took a month’s supply at once. Both of those are real advantages and neither is an efficacy claim. That distinction has been blurred for thirty years and the network meta-analysis is the clearest place it can be checked.',
      },
      {
        q: 'Why does the label say so little?',
        a: 'Because it was written in 1961 and never converted to the modern format. The entire licensed indication is two sentences: "For the relief of symptoms of depression. Endogenous depression is more likely to be alleviated than are other depressive states." There is no clinical studies section, no effect size, no confidence interval and no trial named. The pharmacology section states that the mechanism of action in man is not known and that reuptake inhibition "is believed by some" to underlie the antidepressant activity. Compare that with duloxetine, whose label prints six placebo-subtracted Hamilton differences with confidence intervals and names three trials in which the drug failed. Amitriptyline may well be the more effective drug; a reader simply cannot check it from the document they are handed.',
      },
      {
        q: 'I read that it works for irritable bowel syndrome. Is that real?',
        a: 'That one is unusually well established. ATLANTIS, published in 2023, randomised 463 people in United Kingdom general practice to titrated low-dose amitriptyline or placebo as a second-line treatment for irritable bowel syndrome, with patients adjusting their own dose using a structured document. At six months the IBS Severity Scoring System score was 27.0 points lower on amitriptyline than placebo (95% CI −46.9 to −7.10, p=0.0079). More people discontinued placebo (26%) than the drug (20%), though more of the drug discontinuations were for side effects. It was funded by the National Institute for Health and Care Research, not by a manufacturer, and it tested the low-dose use directly rather than inferring it from the antidepressant licence — which is exactly what the neuropathic pain literature never did.',
      },
      {
        q: 'Should I be worried about the dementia studies?',
        a: 'The finding is real and it is a class-level one. A nested case-control study covering 284,343 case patients and matched controls, average age 82, found that dementia odds rose with cumulative exposure to strongly anticholinergic drugs — from 1.06 at the lowest exposure band to 1.49 at the highest — and that anticholinergic antidepressants as a group carried an adjusted odds ratio of 1.29 at high cumulative exposure. The paper reports drug classes, and its accessible text does not name amitriptyline individually, so this page does not attribute that number to this molecule. It is also observational: early, undiagnosed dementia can itself lead to prescriptions for low mood, poor sleep and bladder problems, and no adjustment removes that entirely. What the study does support is that total anticholinergic load across every drug a person takes is worth counting, and amitriptyline is a heavy contributor to it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Amitriptyline hydrochloride United States prescribing information — Indications and Usage, Clinical Pharmacology, Warnings, Precautions and Overdosage sections',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=amitriptyline',
        kind: 'regulatory',
      },
      NETWORK_META_SOURCE,
      {
        label:
          'Moore RA, Derry S, Aldington D, Cole P, Wiffen PJ. Amitriptyline for neuropathic pain in adults. Cochrane Database Syst Rev 2015;(7):CD008242',
        identifier: '10.1002/14651858.CD008242.pub3',
        kind: 'doi',
      },
      {
        label:
          'Ford AC, Wright-Hughes A, Alderson SL, et al. Amitriptyline at low dose and titrated for irritable bowel syndrome as second-line treatment in primary care (ATLANTIS): a randomised, double-blind, placebo-controlled, phase 3 trial. Lancet 2023;402:1773-1785',
        identifier: '10.1016/S0140-6736(23)01523-4',
        kind: 'doi',
      },
      {
        label:
          'Coupland CAC, Hill T, Dening T, Morriss R, Moore M, Hippisley-Cox J. Anticholinergic drug exposure and the risk of dementia: a nested case-control study. JAMA Intern Med 2019;179:1084-1093',
        identifier: '10.1001/jamainternmed.2019.0677',
        kind: 'doi',
      },
      {
        label:
          'Alammar N, Wang L, Saberi B, et al. The impact of peppermint oil on the irritable bowel syndrome: a meta-analysis of the pooled clinical data. BMC Complement Altern Med 2019;19:21',
        identifier: '10.1186/s12906-018-2409-0',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — amitriptyline, 113 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2160 — amitriptyline structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2160',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Nortriptyline — the only antidepressant with a plasma therapeutic window on its label, from
  //    a 1971 study of 29 inpatients, and the one whose best evidence is for an unlicensed use.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'nortriptyline',
    name: 'Nortriptyline',
    tradeName: 'Pamelor / Aventyl — both discontinued as brands',
    sponsor:
      'Eli Lilly on the record enriched here; first approved in the United States in 1964 and supplied since by generic manufacturers under abbreviated applications',
    targetGene: 'SLC6A2',
    targetProtein:
      'The noradrenaline transporter, with weaker serotonin transporter activity than its parent amitriptyline. The label describes the pharmacology in 1960s terms: interference with the transport, release and storage of catecholamines, and inhibition of the activity of histamine, 5-hydroxytryptamine and acetylcholine',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1964,
    indication:
      'Indicated for the relief of symptoms of depression. Endogenous depressions are more likely to be alleviated than are other depressive states',
    patientFriendlyIndication:
      'Depression — and, off-label, nerve pain, migraine prevention and helping people stop smoking',
    anatomicalSite:
      'Noradrenaline transporters in the central nervous system; muscarinic, histaminergic and alpha-1 receptors elsewhere; and in overdose the cardiac fast sodium channel',
    conditionContext: {
      conditionExplainer:
        'Nortriptyline is what your body turns amitriptyline into. Sold separately, it carries less of the antimuscarinic and antihistaminic load that limits its parent, which is why it has long been the tricyclic of choice when those effects matter — in older people above all.',
      whyItMatters:
        'It is the only antidepressant whose label tells a prescriber to measure a blood level and keep it inside a range. That range — 50 to 150 ng/mL — traces to a single 1971 study of 29 inpatients that found the effect fell off at both ends. Fifty-five years later it is still on the label, and it is still the only number of its kind in this drug class.',
      whoTakesThis:
        'Adults with depression, per the licence. The label states it is not recommended for children. In practice it is also used for neuropathic pain and migraine prevention, and it has better trial evidence for helping people stop smoking than for either.',
      clinicalGoals:
        'Relief of depressive symptoms, with no rating scale named on the label. Where blood levels are used, keeping the concentration inside a window rather than pushing the dose up.',
    },
    oneSentenceVerdict:
      'The active metabolite of amitriptyline, sold separately, and the only antidepressant whose label directs plasma monitoring to an optimum range of 50 to 150 ng/mL — a window derived from a 1971 study of 29 inpatients — which the 2015 Cochrane review found had no first-tier or second-tier evidence in any neuropathic pain condition across six trials and 310 participants, while a 2020 Cochrane review found it roughly doubled smoking quit rates (RR 2.03, 95% CI 1.48 to 2.78) in an indication it holds nowhere.',
    laymanHowItWorks:
      'Nortriptyline blocks the pump that recycles noradrenaline back into nerve cells, and to a lesser extent the serotonin pump. It is the compound your liver makes out of amitriptyline, so it does much the same job with less of the dry mouth, constipation and drowsiness. Its label is unusual in one way: above a certain dose it tells the prescriber to measure the drug in your blood and keep it inside a range, because too much appears to work no better than too little.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1578 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 33 listed generic products, survey effective 18 February 2026 — the most recent survey carrying this molecule, six months older than the surveys quoted on the other pages in this group)',
      markupEstimate: '',
      openPatentNotes:
        'First approved in the United States in 1964 and generic for decades; the Pamelor and Aventyl brands are no longer marketed. It costs about seventy-five per cent more than amitriptyline at pharmacy acquisition cost and is listed on far fewer products — 33 against 113 — which is the practical expression of it being the less-prescribed of the two.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The natural comparison is with amitriptyline, which is the same pharmacology plus a methyl group and plus a heavier anticholinergic load, at a lower price. Beyond that, the comparison depends on the reason: for neuropathic pain the Cochrane reviewers named duloxetine and pregabalin directly as the drugs with much greater supportive evidence, and for smoking cessation the comparator is varenicline and bupropion.',
      conventionalRx: [
        {
          name: 'Amitriptyline',
          class: 'Tertiary amine tricyclic — the parent compound',
          howItCompares:
            'Amitriptyline is demethylated into nortriptyline, so the two are pharmacologically linked rather than alternative. Amitriptyline carries markedly more antimuscarinic and antihistaminic activity, which is the whole reason nortriptyline exists as a separate product, and it is cheaper. It also has the highest efficacy odds ratio against placebo of any antidepressant in the 2018 network meta-analysis; nortriptyline was not among the 21 drugs assessed.',
          typicalCost:
            'US$0.0904 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 113 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper; a large comparative efficacy result behind it; a positive modern trial in irritable bowel syndrome. Cons: substantially more dry mouth, constipation, sedation and postural hypotension, which is what drives prescribers to nortriptyline instead.',
        },
        {
          name: 'Duloxetine or pregabalin, for neuropathic pain',
          class: 'Serotonin-noradrenaline reuptake inhibitor, and alpha-2-delta ligand',
          howItCompares:
            'The Cochrane reviewers named both by name: "The results of this review do not support the use of nortriptyline as a first line treatment. Effective medicines with much greater supportive evidence are available, such as duloxetine and pregabalin." That is a systematic review pointing a reader at specific alternatives, which is rarer than it should be.',
          typicalCost:
            'Duloxetine US$0.1293 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 74 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: registration-grade evidence in the indication; no tricyclic overdose cardiotoxicity. Cons: duloxetine worsens glycaemic control in diabetes and carries a hepatotoxicity warning; pregabalin sedates, causes weight gain and has misuse potential.',
        },
        {
          name: 'Varenicline or bupropion, for smoking cessation',
          class: 'Nicotinic partial agonist, and noradrenaline-dopamine reuptake inhibitor',
          howItCompares:
            'Nortriptyline does help — the 2020 Cochrane review of antidepressants for smoking cessation found a risk ratio of 2.03 (95% CI 1.48 to 2.78) across six studies and 975 participants. Whether bupropion beats it could not be determined: the comparison gave a risk ratio of 1.30 favouring bupropion with a confidence interval of 0.93 to 1.82 across three studies and 417 participants. The same review found bupropion less effective than varenicline.',
          typicalCost: 'Both generic; a few United States cents per tablet at acquisition cost',
          prosAndCons:
            'Pros: both hold actual smoking cessation licences, which nortriptyline does not; neither is lethal in overdose the way a tricyclic is. Cons: bupropion increases psychiatric adverse events (RR 1.25, 95% CI 1.15 to 1.37) and drug-related dropouts (RR 1.37, 1.21 to 1.56).',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask whether a blood level would help before the dose goes up again',
          action:
            'This is the one antidepressant where that question has a printed answer on the label.',
          patientImpact:
            'The label states that when doses above 100 mg daily are administered, plasma levels should be monitored and maintained in the optimum range of 50 to 150 ng/mL, and that doses above 150 mg/day are not recommended. Individual variation in tricyclic pharmacokinetics is large enough that dose does not predict blood level.',
          clinicalPrecaution:
            'The window comes from a 1971 study of 29 inpatients, which found improvement most pronounced between 50 and 139 ng/mL and slight both below and above. A level is information, not a decision, and interpreting one is a clinical matter.',
        },
        {
          name: 'Store it where nobody else can reach it',
          action: 'Same reason as for amitriptyline, and it applies just as strongly here.',
          patientImpact:
            'The label’s overdose section opens with "Deaths may occur from overdosage with this class of drugs" and lists cardiac dysrhythmias, severe hypotension, shock, congestive heart failure, pulmonary oedema, convulsions and coma among the critical manifestations. Changes in QRS axis or width are named as clinically significant indicators of toxicity.',
          clinicalPrecaution:
            'The label directs contacting a poison control centre and says signs of toxicity develop rapidly, so hospital monitoring is needed as soon as possible after ingestion.',
        },
        {
          name: 'Mention it if you are over 65 or already on several drugs',
          action:
            'Being the less anticholinergic tricyclic is a relative claim, not an absolute one.',
          patientImpact:
            'Nortriptyline carries less antimuscarinic and antihistaminic activity than amitriptyline, which is why it is preferred in older adults where a tricyclic is being used. It still appears on the American Geriatrics Society Beers list of medications to avoid in older adults.',
          clinicalPrecaution:
            'The label recommends lower than usual dosages for elderly patients and adolescents — 30 to 50 mg/day in divided doses or once daily — and states the drug is not recommended for children.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CNCCC=C1C2=CC=CC=C2CCC3=CC=CC=C31',
      chemicalFormula: 'C19H21N',
      molecularWeight: '263.40 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'A secondary amine dibenzocycloheptene — amitriptyline minus one N-methyl group, which is exactly what removing it does to the pharmacology: substantially less muscarinic and histaminergic affinity and a shift toward noradrenaline over serotonin reuptake inhibition. The label’s own description is from an earlier era: "The mechanism of mood elevation by tricyclic antidepressants is at present unknown... It inhibits the activity of such diverse agents as histamine, 5-hydroxytryptamine, and acetylcholine. It increases the pressor effect of norepinephrine but blocks the pressor response of phenethylamine. Studies suggest that nortriptyline hydrochloride interferes with the transport, release, and storage of catecholamines." It retains the cardiac fast sodium channel blockade that makes tricyclic overdose lethal.',
      structureSource: {
        label:
          'PubChem CID 4543 (nortriptyline) — canonical SMILES, molecular formula and weight, as carried on the enriched record; mechanism and plasma-range statements quoted from the nortriptyline hydrochloride United States prescribing information',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4543',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'nor-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the secondary amine and the amitriptyline impurity limit',
          description:
            'Nortriptyline and amitriptyline differ by one methyl group, so the residual tertiary amine is the controlled impurity and it is a pharmacologically meaningful one: amitriptyline carries several times the anticholinergic load, which is the entire clinical reason for choosing nortriptyline. The exocyclic double-bond geometry is the second specification.',
          reagentsAndBuffer:
            'Nortriptyline hydrochloride and amitriptyline hydrochloride reference standards, reverse-phase HPLC with UV detection, nuclear magnetic resonance for the exocyclic alkene geometry and the N-methyl count, Karl Fischer titration',
        },
        {
          id: 'nor-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Demethylate amitriptyline, or build the secondary amine directly',
          description:
            'The commercial route is usually N-demethylation of amitriptyline, which is what the human liver does anyway — the manufacturing step and the metabolic step are the same transformation. Alternatively the methylaminopropyl chain is added to dibenzosuberone directly. Neither route creates a stereocentre.',
          dependsOnStepId: 'nor-w1',
          reagentsAndBuffer:
            'Amitriptyline free base with a chloroformate demethylating agent and subsequent hydrolysis, or dibenzosuberone with a protected methylaminopropyl Grignard reagent followed by dehydration and deprotection',
        },
        {
          id: 'nor-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the hydrochloride and drive residual amitriptyline down',
          description:
            'Salt formation and recrystallisation with the amitriptyline content as the release-critical impurity. A batch drifting toward the parent is a more anticholinergic drug given to the population selected specifically to avoid that.',
          dependsOnStepId: 'nor-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in an alcoholic solvent, recrystallisation, HPLC release testing against an amitriptyline and geometric-isomer limit',
        },
        {
          id: 'nor-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Quantify the transporter ratio and the muscarinic load against the parent',
          description:
            'The claim that justifies this product’s separate existence is comparative: less muscarinic and histaminergic activity than amitriptyline, and a shift toward noradrenaline. That is a ratio question, and it can only be answered by running both molecules side by side in the same assay on the same day.',
          dependsOnStepId: 'nor-w3',
          reagentsAndBuffer:
            'HEK293 cells expressing SLC6A2 and SLC6A4 for paired uptake assays, radioligand binding across muscarinic M1 to M5, HRH1 and ADRA1A, and patch-clamp on cardiac SCN5A; nortriptyline and amitriptyline run as paired test articles',
        },
        {
          id: 'nor-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Build the plasma assay the label’s dosing section depends on',
          description:
            'This is the only antidepressant whose label instructs a prescriber to measure a concentration and hold it inside a range. That instruction is only as good as the assay behind it: it needs to be specific for nortriptyline against its 10-hydroxy metabolites, calibrated across 20 to 300 ng/mL, and drawn at a defined trough. The window itself came from 29 inpatients in 1971 and has never been re-derived at modern scale.',
          dependsOnStepId: 'nor-w4',
          reagentsAndBuffer:
            'Liquid chromatography-tandem mass spectrometry with a deuterated nortriptyline internal standard, calibrators spanning 20 to 300 ng/mL, chromatographic resolution of E- and Z-10-hydroxynortriptyline, standardised trough sampling at steady state, CYP2D6 genotyping',
        },
      ],
    },
    keyAudits: [
      {
        id: 'nor-a1',
        category: 'measured',
        title:
          'The only antidepressant with a plasma window on its label — from 29 patients in 1971',
        laymanSummary:
          'Above 100 mg a day, the label tells the prescriber to measure the drug in your blood and keep it between 50 and 150 nanograms per millilitre. That range comes from a single study of 29 inpatients published in 1971.',
        technicalDetails:
          'The dosage section reads: "When doses above 100 mg daily are administered, plasma levels of nortriptyline should be monitored and maintained in the optimum range of 50 to 150 ng/mL. Doses above 150 mg/day are not recommended." No other antidepressant in this file carries an equivalent instruction. The underlying study is Åsberg and colleagues, BMJ 1971: plasma concentration and therapeutic effect after two weeks of treatment in 29 psychiatric inpatients, all diagnosed with endogenous depression, with improvement rated on a psychiatric interview scale. The relationship was curved — amelioration was most pronounced in the intermediate range of 50 to 139 ng/mL and slight both below and above it — and the authors proposed that at higher concentrations a phenothiazine-like receptor blockade is added to the reuptake inhibition. Their conclusion was that there are two ways to fail with nortriptyline, too little and too much, and that dose cannot predict plasma level in an individual. That is a real and unusual finding. It is also 29 patients, two weeks, one centre, and 1971, and it has been carried on the label for over half a century without being re-derived at modern scale.',
        evidenceSource:
          'Nortriptyline hydrochloride United States prescribing information, Dosage and Administration; Åsberg M, Crönholm B, Sjöqvist F, Tuck D. Relationship between plasma level and therapeutic effect of nortriptyline. Br Med J 1971;3:331-334',
        doi: '10.1136/bmj.3.5770.331',
        measuredMetric:
          'Therapeutic plasma concentration range on the label, and the sample size and design of the study it derives from',
        auditFlag: 'caution',
      },
      {
        id: 'nor-a2',
        category: 'failed',
        title:
          'Recommended in three continents’ guidelines, with no first- or second-tier evidence',
        laymanSummary:
          'Nortriptyline is recommended for nerve pain in European, British and American guidelines. The Cochrane review found six trials totalling 310 people, none of which met current evidence standards, and concluded it should not be first-line.',
        technicalDetails:
          'The 2015 Cochrane review included six randomised double-blind studies of at least two weeks treating 310 participants with various neuropathic pain conditions — five cross-over and one parallel-group, with treatment periods of three to eight weeks. All studies had one or more sources of potential major bias. No study provided first- or second-tier evidence for any outcome. Only one study reported the primary outcome of at least 50% pain reduction, and it gave no indication that either nortriptyline or gabapentin was more effective in postherpetic neuralgia at very low quality. Third-tier evidence in individual studies indicated similar efficacy to gabapentin, morphine, chlorimipramine and amitriptyline — and to placebo — in the conditions studied. More participants reported adverse events on nortriptyline than on placebo. No study addressed trigeminal neuralgia. The authors’ conclusion names the alternatives directly: "The results of this review do not support the use of nortriptyline as a first line treatment. Effective medicines with much greater supportive evidence are available, such as duloxetine and pregabalin." The review’s own background notes that nortriptyline is recommended in European, United Kingdom and United States guidelines, which is the gap this audit is about.',
        evidenceSource:
          'Derry S, Wiffen PJ, Aldington D, Moore RA. Nortriptyline for neuropathic pain in adults. Cochrane Database Syst Rev 2015;(1):CD011209',
        doi: '10.1002/14651858.CD011209.pub2',
        measuredMetric:
          'Tier of evidence available across six trials and 310 participants, against the guideline status of the drug',
        auditFlag: 'caution',
      },
      {
        id: 'nor-a3',
        category: 'measured',
        title: 'Its strongest trial result is for an indication it does not hold anywhere',
        laymanSummary:
          'Nortriptyline roughly doubles the chance of quitting smoking against placebo, across six trials and 975 people. It is not licensed for smoking cessation in any country.',
        technicalDetails:
          'The 2020 Cochrane review of antidepressants for smoking cessation included 115 studies. It found evidence that nortriptyline aided smoking cessation compared with placebo, risk ratio 2.03 (95% CI 1.48 to 2.78, I²=16%, 6 studies, 975 participants). There was insufficient evidence to determine whether bupropion or nortriptyline was the more effective: the head-to-head comparison gave a risk ratio of 1.30 favouring bupropion, 95% CI 0.93 to 1.82, across three studies and 417 participants. The same review found high-certainty evidence for bupropion against placebo (RR 1.64, 95% CI 1.52 to 1.77, 45 studies, 17,866 participants), no evidence of benefit for St John’s wort, the SSRIs or the monoamine oxidase inhibitors, and that bupropion is less effective than varenicline. Findings were sparse and inconsistent on whether either drug helped people with current or previous depression in particular. This record has an unusual shape: nortriptyline’s cleanest positive result against placebo is in a condition it has never been licensed for, while the use it is guideline-recommended for has no evidence above third tier.',
        evidenceSource:
          'Howes S, Hartmann-Boyce J, Livingstone-Banks J, Hong B, Lindson N. Antidepressants for smoking cessation. Cochrane Database Syst Rev 2020;(4):CD000031',
        doi: '10.1002/14651858.CD000031.pub5',
        measuredMetric:
          'Risk ratio for long-term smoking cessation, nortriptyline against placebo, across six trials and 975 participants',
        auditFlag: 'verified',
      },
      {
        id: 'nor-a4',
        category: 'conclusion_shift',
        title: 'A 1964 label describing pigeons and pressor responses',
        laymanSummary:
          'The pharmacology section states that the mechanism of mood elevation by tricyclics is at present unknown, then describes results from operant conditioning experiments in rats and pigeons and from pressor-response tests. It has not been rewritten.',
        technicalDetails:
          'The clinical pharmacology section reads: "The mechanism of mood elevation by tricyclic antidepressants is at present unknown. Nortriptyline hydrochloride is not a monoamine oxidase inhibitor. It inhibits the activity of such diverse agents as histamine, 5-hydroxytryptamine, and acetylcholine. It increases the pressor effect of norepinephrine but blocks the pressor response of phenethylamine. Studies suggest that nortriptyline hydrochloride interferes with the transport, release, and storage of catecholamines. Operant conditioning techniques in rats and pigeons suggest that nortriptyline hydrochloride has a combination of stimulant and depressant properties." The indications section is two sentences and names a diagnostic category — endogenous depression — that no current manual carries. There is no clinical studies section, no effect size and no numbered structure. The important point is not that the document is old-fashioned but that a reader has nothing to check: the licensed claim is unaccompanied by any number, in contrast to every post-1990 label in this file. Nortriptyline was also not among the 21 drugs assessed in the 2018 network meta-analysis, so there is no modern comparative efficacy figure for it either.',
        evidenceSource:
          'Nortriptyline hydrochloride United States prescribing information, Indications and Usage and Clinical Pharmacology sections',
        measuredMetric:
          'Content of the licensed indication and mechanism statements, and the absence of any efficacy figure on the document',
        auditFlag: 'caution',
      },
      {
        id: 'nor-a5',
        category: 'failed',
        title: 'Less anticholinergic than its parent, and still lethal in overdose',
        laymanSummary:
          'Nortriptyline is chosen over amitriptyline because it causes less dry mouth, constipation and drowsiness. It carries exactly the same overdose danger: the label opens its overdose section by saying deaths may occur.',
        technicalDetails:
          'The overdose section states that deaths may occur from overdosage with this class of drugs, that multiple drug ingestion including alcohol is common in deliberate tricyclic overdose, and that hospital monitoring is required as soon as possible because signs of toxicity develop rapidly. Critical manifestations are cardiac dysrhythmias, severe hypotension, shock, congestive heart failure, pulmonary oedema, convulsions and central nervous system depression including coma — a slightly broader list than amitriptyline’s, which does not name shock, heart failure or pulmonary oedema. Changes in the electrocardiogram, particularly in QRS axis or width, are named as clinically significant indicators of toxicity. The mechanism is cardiac fast sodium channel blockade, which the demethylation that produced nortriptyline does not remove. The tolerability advantage over amitriptyline is real and it operates entirely at therapeutic doses; it does nothing at toxic ones.',
        evidenceSource:
          'Nortriptyline hydrochloride United States prescribing information, Overdosage section',
        measuredMetric:
          'Labelled overdose manifestations and electrocardiographic indicators, against those of the parent compound',
        auditFlag: 'caution',
      },
      {
        id: 'nor-a6',
        category: 'inferred',
        title: 'Preferred in older people on a comparison nobody ran',
        laymanSummary:
          'Nortriptyline is the tricyclic recommended for older adults because it is less anticholinergic than amitriptyline. That is a pharmacological comparison, not a clinical trial, and the drug is still on the list of medicines to avoid in older adults.',
        technicalDetails:
          'The preference rests on receptor pharmacology — removing the N-methyl group reduces muscarinic and histaminergic affinity substantially — and on the resulting side-effect profile, not on a head-to-head outcome trial in older adults. No such trial is cited on the label, which offers only the dosing instruction that lower than usual dosages are recommended for elderly patients and adolescents, at 30 to 50 mg/day. Nortriptyline nonetheless appears on the American Geriatrics Society Beers Criteria list of potentially inappropriate medications in older adults, on the same anticholinergic grounds as amitriptyline. The large nested case-control study of anticholinergic exposure and dementia reported the anticholinergic antidepressants as a class at an adjusted odds ratio of 1.29 (95% CI 1.24 to 1.34) at the highest cumulative exposure, without naming individual molecules — so it neither confirms nor exonerates this one. Being the safer member of a class on the avoid-in-older-adults list is a meaningful improvement and is not the same as being safe.',
        evidenceSource:
          'Nortriptyline hydrochloride United States prescribing information, Dosage and Administration; Coupland CAC et al., JAMA Intern Med 2019;179:1084-1093',
        doi: '10.1001/jamainternmed.2019.0677',
        inferredClaim:
          'That nortriptyline’s lower receptor-level anticholinergic load translates into better clinical outcomes in older adults — a pharmacological inference that no head-to-head outcome trial has tested',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A capsule — and the compound your body makes from amitriptyline',
        laymanDesc:
          'Anyone taking amitriptyline is already producing nortriptyline. Taking it directly skips a conversion step whose speed varies a lot between people.',
        molecularDetail:
          'Nortriptyline is the N-demethylated metabolite of amitriptyline, formed substantially by CYP2D6, and is marketed as a drug in its own right. Removing that single methyl group reduces muscarinic and histaminergic affinity and shifts reuptake selectivity toward noradrenaline.',
        iconName: 'GitBranch',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The same dose gives different people very different levels',
        laymanDesc:
          'How much drug ends up in your blood from a given tablet varies several-fold between people. That is why this label asks for a blood test.',
        molecularDetail:
          'The 1971 study behind the label’s plasma range noted that large individual variation in tricyclic pharmacokinetics makes prediction of plasma level from dose in a given individual virtually impossible without knowing the rate of elimination and apparent volume of distribution. CYP2D6 activity is the principal source of that variation.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The noradrenaline pump is blocked',
        laymanDesc:
          'It stops noradrenaline being vacuumed back into the nerve cell, leaving more in the gap. It does the same to serotonin, more weakly than its parent does.',
        molecularDetail:
          'Inhibition of the noradrenaline transporter with weaker serotonin transporter activity than amitriptyline. The label describes this in period language as interference with the transport, release and storage of catecholamines, and states that the mechanism of mood elevation by tricyclics is at present unknown.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Too much appears to work no better than too little',
        laymanDesc:
          'Unusually, pushing the dose higher does not keep helping. The improvement was best in the middle of the blood-level range and slight at both ends.',
        molecularDetail:
          'In 29 inpatients, amelioration was most pronounced between 50 and 139 ng/mL and slight both below and above. The authors attributed the upper fall-off to a phenothiazine-like receptor blockade being added to reuptake inhibition at higher concentrations, and concluded that there are two routes to therapeutic failure: too low a level and too high a one.',
        iconName: 'BarChart',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'What it demonstrably does, and where',
        laymanDesc:
          'Its clearest randomised result is helping people stop smoking — roughly doubling quit rates. For nerve pain, where guidelines recommend it, the evidence is much thinner.',
        molecularDetail:
          'Smoking cessation against placebo: risk ratio 2.03 (95% CI 1.48 to 2.78), 6 studies, 975 participants, in an indication it holds nowhere. Neuropathic pain: six studies, 310 participants, no first- or second-tier evidence, with the review naming duloxetine and pregabalin as the better-supported alternatives.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the tricyclic overdose risk is unchanged',
        laymanDesc:
          'Losing the methyl group made it easier to tolerate day to day. It did nothing to the danger of taking too much at once.',
        molecularDetail:
          'The overdose section names cardiac dysrhythmias, severe hypotension, shock, congestive heart failure, pulmonary oedema, convulsions and coma as critical manifestations, with QRS axis or width change as the clinically significant indicator. The mechanism, cardiac fast sodium channel blockade, is shared with amitriptyline.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Åsberg M et al., Br Med J 1971;3:331-334 — the plasma level study',
        phase: 'Open pharmacokinetic-pharmacodynamic study in psychiatric inpatients',
        sampleSize: 29,
        primaryEndpoint:
          'Relationship between plasma nortriptyline concentration and reduction in a psychiatric-interview depression rating after two weeks of treatment',
        endpointMet: true,
        statisticalPValue:
          'A curved relationship: amelioration most pronounced in the intermediate plasma range of 50 to 139 ng/mL and slight both at lower and at higher levels',
        unreportedAdverseSignals:
          'Twenty-nine inpatients, all diagnosed with endogenous depression, at a single centre, over two weeks, with no placebo arm and no blinding described in the abstract. This is the entire origin of the plasma range that has appeared on the label for over half a century.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Cochrane review of nortriptyline for neuropathic pain (Cochrane Database Syst Rev 2015;(1):CD011209)',
        phase: 'Systematic review of six randomised, double-blind trials of at least two weeks',
        sampleSize: 310,
        primaryEndpoint:
          'At least 50% pain intensity reduction, or Patient Global Impression of Change much or very much improved, in chronic neuropathic pain',
        endpointMet: false,
        statisticalPValue:
          'No study provided first- or second-tier evidence for any outcome; third-tier evidence indicated similar efficacy to gabapentin, morphine, chlorimipramine, amitriptyline and to placebo, at very low quality',
        unreportedAdverseSignals:
          'All studies had one or more sources of potential major bias, five of six used a cross-over design, and adverse event reporting was inconsistent and fragmented. More participants reported adverse events on nortriptyline than on placebo. No study addressed trigeminal neuralgia; no serious adverse events or deaths were reported.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId:
          'Cochrane review of antidepressants for smoking cessation (Cochrane Database Syst Rev 2020;(4):CD000031)',
        phase: 'Systematic review and meta-analysis of 115 randomised studies',
        sampleSize: 975,
        primaryEndpoint:
          'Long-term smoking abstinence on nortriptyline against placebo, within a review covering all antidepressants',
        endpointMet: true,
        statisticalPValue:
          'Risk ratio 2.03 (95% CI 1.48 to 2.78), I²=16%, across 6 studies and 975 participants',
        unreportedAdverseSignals:
          'Whether bupropion or nortriptyline is more effective could not be determined: RR 1.30 favouring bupropion, 95% CI 0.93 to 1.82, 3 studies, 417 participants. Nortriptyline holds no smoking cessation licence in any jurisdiction. Findings were sparse and inconsistent on whether either drug helped people with current or previous depression in particular.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A curved plasma-level-to-effect relationship in 29 inpatients, with improvement most pronounced between 50 and 139 ng/mL and slight at both extremes',
        'Smoking cessation risk ratio of 2.03 (95% CI 1.48 to 2.78) against placebo across six trials and 975 participants',
        'No first-tier or second-tier evidence for neuropathic pain across six trials and 310 participants',
        'More adverse events on nortriptyline than on placebo in the neuropathic pain trials, at very low quality of evidence',
      ],
      unsupportedInferences: [
        'That a plasma window derived from 29 patients in 1971 generalises to the population now prescribed the drug — it has never been re-derived at modern scale',
        'That guideline recommendation for neuropathic pain in Europe, the United Kingdom and the United States reflects an evidence base; the Cochrane review found none above third tier',
        'That the lower anticholinergic load translates into better outcomes in older adults, which no head-to-head outcome trial has tested',
        'That the antidepressant efficacy of the tricyclic class transfers to this molecule specifically; nortriptyline was not among the 21 drugs in the 2018 network meta-analysis',
      ],
      whatFailedInitially: [
        'The Cochrane review of neuropathic pain named duloxetine and pregabalin as better-supported alternatives and recommended against first-line use',
        'The label carries no clinical studies section, no effect size and no trial reference for its licensed indication',
        'The overdose profile is unchanged from amitriptyline: deaths may occur, with cardiac dysrhythmias, shock and pulmonary oedema among the critical manifestations',
        'It remains on the American Geriatrics Society Beers list despite being the less anticholinergic tricyclic',
      ],
      realWorldOutcome: [
        'First approved in the United States in 1964; brands discontinued and only 33 generic products listed, against 113 for amitriptyline',
        'About seventy-five per cent more expensive than amitriptyline at pharmacy acquisition cost',
        'The only antidepressant whose label instructs plasma monitoring to a defined range',
        'Its cleanest randomised result against placebo is in smoking cessation, an indication it holds in no jurisdiction',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule at 10, 25, 50 and 75 mg, and an oral solution; usually 25 mg three or four times daily, or the total daily dose given once, per the label',
      description:
        'Nortriptyline is itself the active metabolite of amitriptyline, and is further metabolised to 10-hydroxynortriptyline. CYP2D6 activity drives large between-person variation in plasma concentration at a given dose, which is the reason the label asks for plasma monitoring above 100 mg/day and caps the dose at 150 mg/day.',
      safetyProfile:
        'Boxed warning for suicidal thoughts and behaviours in children, adolescents and young adults; not recommended for children. Deaths may occur from overdosage with this class of drugs, with cardiac dysrhythmias, severe hypotension, shock, congestive heart failure, pulmonary oedema, convulsions and coma among the critical manifestations, and QRS axis or width change as the electrocardiographic indicator. Anticholinergic effects — dry mouth, constipation, blurred vision, urinary hesitancy — are present though less pronounced than with amitriptyline, along with sedation and postural hypotension. On the American Geriatrics Society Beers list for older adults. Lower dosages are directed for elderly and adolescent patients. Contraindicated with monoamine oxidase inhibitors, with 14 days required in either direction.',
    },
    commonQuestions: [
      {
        q: 'Why does my prescriber want a blood test for this and not for other antidepressants?',
        a: 'Because nortriptyline is the only one whose label asks for it. The dosing section states that when doses above 100 mg daily are used, plasma levels should be monitored and kept in the optimum range of 50 to 150 ng/mL, and that doses above 150 mg/day are not recommended. The reason is a finding that is unusual in this drug class: in a 1971 study of 29 inpatients, improvement was best in the middle of the concentration range and slight both below and above it, so pushing the dose higher was not simply more of the same. The same study noted that individual variation in tricyclic pharmacokinetics is large enough that you cannot predict a person’s blood level from their dose. That is a genuinely useful piece of pharmacology. It is also 29 people, two weeks, in 1971, and nothing at modern scale has been done to confirm or refine it.',
        auditNote:
          'A number that has survived on a label for fifty-five years without re-derivation is worth flagging, not because it is wrong but because nobody has checked.',
      },
      {
        q: 'Is nortriptyline just amitriptyline?',
        a: 'It is what amitriptyline becomes. Your liver removes a methyl group from amitriptyline and the result is nortriptyline, so anyone on the parent drug is carrying both. Removing that methyl group reduces the affinity for the muscarinic and histamine receptors substantially — which is exactly why nortriptyline is preferred when dry mouth, constipation, drowsiness and dizziness on standing are the problem, particularly in older people. What it does not change is the overdose risk: both block the sodium channel that fires each heartbeat, and both labels open their overdose sections by saying deaths may occur. Nortriptyline also costs about seventy-five per cent more and is stocked as far fewer products.',
      },
      {
        q: 'I was given this for nerve pain. What does the evidence say?',
        a: 'Less than the guidelines imply. Nortriptyline is recommended for neuropathic pain in European, British and American guidelines. The Cochrane review that looked for the evidence behind that found six randomised double-blind trials treating 310 people in total — five of them cross-over designs, all with at least one source of potential major bias — and no study providing first-tier or second-tier evidence for any outcome. Third-tier evidence suggested similar results to gabapentin, morphine, chlorimipramine, amitriptyline and to placebo. More people had adverse events on the drug than on placebo. The authors ended by naming alternatives: the results do not support nortriptyline as a first-line treatment, and medicines with much greater supportive evidence are available, such as duloxetine and pregabalin.',
      },
      {
        q: 'Is it true this helps with stopping smoking?',
        a: 'Yes, and it is the strongest randomised result the drug has. The 2020 Cochrane review of antidepressants for smoking cessation found nortriptyline roughly doubled long-term quit rates against placebo — risk ratio 2.03, 95% confidence interval 1.48 to 2.78, across six studies and 975 participants, with low heterogeneity. Whether bupropion beats it could not be determined: the direct comparison across three studies and 417 people gave a risk ratio of 1.30 favouring bupropion with an interval running from 0.93 to 1.82. The same review found no benefit for St John’s wort, the SSRIs or the MAOIs, and that bupropion is less effective than varenicline. Nortriptyline is not licensed for smoking cessation anywhere, which leaves the drug in the odd position of having its cleanest evidence for a use nobody has registered.',
      },
      {
        q: 'Why does the label say so little about how it works?',
        a: 'Because it was written in 1964 and never rewritten. The pharmacology section opens by saying the mechanism of mood elevation by tricyclic antidepressants is at present unknown, then reports that the drug increases the pressor effect of noradrenaline, blocks the pressor response of phenethylamine, and that operant conditioning techniques in rats and pigeons suggest a combination of stimulant and depressant properties. There is no clinical studies section, no effect size and no trial reference for the licensed indication, which is two sentences long. Nortriptyline was also not one of the 21 drugs assessed in the 2018 network meta-analysis, so unlike amitriptyline it has no modern comparative efficacy number either. That is not a claim the drug does not work — it is a statement that a reader has nothing to check it against.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Nortriptyline hydrochloride United States prescribing information — Indications and Usage, Clinical Pharmacology, Warnings, Dosage and Administration and Overdosage sections',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=nortriptyline',
        kind: 'regulatory',
      },
      {
        label:
          'Åsberg M, Crönholm B, Sjöqvist F, Tuck D. Relationship between plasma level and therapeutic effect of nortriptyline. Br Med J 1971;3(5770):331-334',
        identifier: '10.1136/bmj.3.5770.331',
        kind: 'doi',
      },
      {
        label:
          'Derry S, Wiffen PJ, Aldington D, Moore RA. Nortriptyline for neuropathic pain in adults. Cochrane Database Syst Rev 2015;(1):CD011209',
        identifier: '10.1002/14651858.CD011209.pub2',
        kind: 'doi',
      },
      {
        label:
          'Howes S, Hartmann-Boyce J, Livingstone-Banks J, Hong B, Lindson N. Antidepressants for smoking cessation. Cochrane Database Syst Rev 2020;(4):CD000031',
        identifier: '10.1002/14651858.CD000031.pub5',
        kind: 'doi',
      },
      {
        label:
          'Coupland CAC, Hill T, Dening T, Morriss R, Moore M, Hippisley-Cox J. Anticholinergic drug exposure and the risk of dementia: a nested case-control study. JAMA Intern Med 2019;179:1084-1093',
        identifier: '10.1001/jamainternmed.2019.0677',
        kind: 'doi',
      },
      NETWORK_META_SOURCE,
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — nortriptyline, 33 listed generic products, effective 18 February 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 4543 — nortriptyline structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4543',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Buspirone — a mechanism its label declares unknown, an effect that has never been shown
  //     past four weeks, and a blood level that a glass of grapefruit juice moves ninefold.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'buspirone',
    name: 'Buspirone',
    tradeName: 'BuSpar / Bucapsol — both discontinued as brands',
    sponsor:
      'Bristol-Myers Squibb (originator, NDA 018731); generic since 2001 and made by many manufacturers',
    targetGene: 'HTR1A',
    targetProtein:
      'Serotonin 5-HT1A receptor, for which the label reports high in vitro affinity, and brain D2 dopamine receptors, for which it reports moderate affinity. The label states buspirone has no significant affinity for benzodiazepine receptors and does not affect GABA binding',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1986,
    indication:
      'Management of anxiety disorders or the short-term relief of the symptoms of anxiety. Efficacy was demonstrated in controlled trials of outpatients whose diagnosis roughly corresponds to generalized anxiety disorder',
    patientFriendlyIndication: 'Anxiety',
    anatomicalSite:
      'Serotonin 5-HT1A receptors — presynaptic autoreceptors on raphe neurons and postsynaptic receptors in hippocampus and cortex; the label commits to neither',
    conditionContext: {
      conditionExplainer:
        'Generalized anxiety disorder is a chronic condition, usually measured over months and years. Buspirone’s licence covers the "management of anxiety disorders or the short-term relief of the symptoms of anxiety", and its own label states that effectiveness beyond three to four weeks has not been demonstrated in controlled trials.',
      whyItMatters:
        'Buspirone exists because it is not a benzodiazepine: no sedation, no muscle relaxation, no anticonvulsant effect, no dependence. That is a genuine and important difference. Everything else about it is uncertain — the label opens its pharmacology section by saying the mechanism of action is unknown, only about 1% of what circulates is the drug itself, and its blood level moves by orders of magnitude depending on what else a person takes.',
      whoTakesThis:
        'Adults with generalized anxiety disorder, particularly those who have not previously taken a benzodiazepine — the Cochrane review found the class useful "particularly for those participants who had not been on a benzodiazepine". It is contraindicated with monoamine oxidase inhibitors.',
      clinicalGoals:
        'A fall in an anxiety rating scale over four to nine weeks, which is the length of almost every trial ever run on it. No trial has established what happens after that.',
    },
    oneSentenceVerdict:
      'A 5-HT1A-binding anxiolytic with no benzodiazepine receptor affinity and no dependence liability, whose label opens by stating the mechanism of action is unknown and separately states that effectiveness beyond three to four weeks has not been demonstrated in controlled trials — and whose plasma exposure spans roughly a five-hundred-fold range across labelled interactions, from an 89.6% fall with rifampin to a 50-fold rise with nefazodone.',
    laymanHowItWorks:
      'Buspirone binds tightly to one particular serotonin receptor and moderately to a dopamine receptor. It does not touch the receptor that benzodiazepines use, so it does not sedate, does not relax muscles and is not habit-forming — which is the whole reason it exists. Beyond that, its own prescribing information says the mechanism of action is unknown. It also takes a couple of weeks to do anything, so it cannot be taken when anxiety strikes.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 55,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0423 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 156 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 29 September 1986 under NDA 018731 and generic since 2001; the BuSpar brand is no longer marketed. At about four United States cents a tablet it is the cheapest drug on this page, and it is the only one that is neither a controlled substance nor an antidepressant.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Buspirone’s position is defined by what it is not. Against a benzodiazepine it is slower, probably weaker and not habit-forming. Against an SSRI it has no antidepressant indication and no long-term data. The Cochrane review found that azapirones may be less effective than benzodiazepines and could not determine whether they beat antidepressants, kava or psychotherapy.',
      conventionalRx: [
        {
          name: 'Escitalopram, paroxetine or another SSRI',
          class: 'Selective serotonin reuptake inhibitors',
          howItCompares:
            'Several hold generalized anxiety disorder indications in their own right and have maintenance data buspirone does not. The Cochrane review of azapirones was unable to conclude whether they were superior to antidepressants, so the comparison is genuinely open rather than settled either way.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: long-term relapse-prevention data; also treat coexisting depression. Cons: sexual dysfunction; discontinuation symptoms that buspirone does not produce; a boxed warning for suicidality in young people that buspirone’s label does not carry.',
        },
        {
          name: 'A benzodiazepine such as lorazepam or clonazepam',
          class: 'Benzodiazepine receptor positive allosteric modulators',
          howItCompares:
            'Faster — they work within an hour where buspirone takes weeks — and probably more effective: the Cochrane review found azapirones may be less effective than benzodiazepines, and fewer participants stopped taking benzodiazepines than azapirones. What they carry instead is tolerance, dependence and withdrawal, none of which buspirone has.',
          typicalCost:
            'Lorazepam US$0.0360 and clonazepam US$0.0398 per unit at United States pharmacy acquisition cost (CMS NADAC medians, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: rapid onset; usable when needed rather than only on a schedule. Cons: dependence, withdrawal and cognitive effects; controlled substances; and buspirone cannot be used to cover a benzodiazepine withdrawal because it has no cross-tolerance.',
        },
        {
          name: 'Hydroxyzine',
          class: 'Sedating H1 antihistamine with an anxiety indication',
          howItCompares:
            'Like buspirone it is not a controlled substance and does not cause dependence. Unlike buspirone it works within an hour, and unlike buspirone it sedates heavily — which is either the point or the problem depending on the person.',
          typicalCost:
            'US$0.0627 per unit at United States pharmacy acquisition cost (CMS NADAC, median across listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: immediate effect; no dependence. Cons: substantial sedation and anticholinergic load; no long-term efficacy data either.',
        },
      ],
      naturalFoods: [
        {
          name: 'Kava (Piper methysticum) extract',
          activeCompound: 'Kavalactones, principally kavain, dihydrokavain and methysticin',
          biologicalMechanism:
            'Kavalactones modulate GABA-A signalling and block voltage-gated sodium and calcium channels — a benzodiazepine-like direction of action rather than buspirone’s, which is why it produces sedation where buspirone does not.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice, and the harm belongs in the same sentence as the benefit. The 2003 Cochrane review of 11 trials in 645 participants found a weighted mean difference on the Hamilton Anxiety scale of 5.0 points against placebo (95% CI 1.1 to 8.8, p=0.01, n=345), with adverse events in those trials mild and infrequent, while calling specifically for further investigation of long-term safety. In March 2002 the United States FDA had already issued a consumer advisory that kava-containing dietary supplements may be associated with severe liver injury, including hepatitis, cirrhosis and liver failure, and several European regulators removed kava products from sale. Kava was also one of the comparators in the Cochrane review of azapirones, which could not determine whether buspirone was superior to it.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Take it the same way every day — always with food or always without',
          action: 'The label says this directly, and the reason is a large one.',
          patientImpact:
            'In eight subjects given 20 mg with and without food, the area under the curve rose 84% and peak concentration 116% with food, without a change in total immunoreactive material — the label attributes this to food reducing presystemic clearance. Peak plasma levels of unchanged buspirone after a 20 mg dose are only 1 to 6 ng/mL, and unchanged drug accounts for about 1% of circulating radioactivity.',
          clinicalPrecaution:
            'Patient instruction 8 on the label reads: "You should take buspirone hydrochloride tablets consistently, either always with or always without food." Instruction 9 is to avoid drinking large amounts of grapefruit juice.',
        },
        {
          name: 'Do not expect it to work when you need it',
          action:
            'Buspirone is a daily drug, not a rescue drug, and it does not cover a benzodiazepine being stopped.',
          patientImpact:
            'The label states buspirone lacks the prominent sedative effect associated with more typical anxiolytics and exerts no anticonvulsant or muscle relaxant effect. Because it does not exhibit cross-tolerance with benzodiazepines or other sedative-hypnotics, it will not block the withdrawal syndrome seen when those drugs are stopped.',
          clinicalPrecaution:
            'The label therefore advises withdrawing patients gradually from a prior CNS depressant before starting buspirone, and lists the withdrawal syndrome as any combination of irritability, anxiety, agitation, insomnia, tremor, abdominal cramps, muscle cramps, vomiting, sweating, flu-like symptoms without fever, and occasionally seizures.',
        },
        {
          name: 'Name every other drug, including antibiotics and antifungals',
          action:
            'Few drugs in common use have their blood level moved as far by ordinary co-prescriptions as this one.',
          patientImpact:
            'Labelled interactions, all from healthy-volunteer studies: itraconazole raised buspirone Cmax 13-fold and AUC 19-fold; nefazodone raised Cmax up to 20-fold and AUC up to 50-fold; grapefruit juice raised Cmax 4.3-fold and AUC 9.2-fold; erythromycin raised Cmax 5-fold and AUC 6-fold; diltiazem raised AUC 5.5-fold; verapamil 3.4-fold; and rifampin lowered Cmax 83.7% and AUC 89.6%.',
          clinicalPrecaution:
            'The label recommends starting at 2.5 mg once or twice daily in combination with the strong inhibitors, and notes that with rifampin the dose may need raising to maintain any effect at all.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CCC2(C1)CC(=O)N(C(=O)C2)CCCCN3CCN(CC3)C4=NC=CC=N4',
      chemicalFormula: 'C21H31N5O2',
      molecularWeight: '385.50 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'The label states: "The mechanism of action of buspirone is unknown. Buspirone differs from typical benzodiazepine anxiolytics in that it does not exert anticonvulsant or muscle relaxant effects. It also lacks the prominent sedative effect that is associated with more typical anxiolytics. In vitro preclinical studies have shown that buspirone has a high affinity for serotonin (5-HT1A) receptors. Buspirone has no significant affinity for benzodiazepine receptors and does not affect GABA binding in vitro or in vivo when tested in preclinical models. Buspirone has moderate affinity for brain D2-dopamine receptors." It undergoes extensive first-pass metabolism by CYP3A4: unchanged buspirone accounts for about 1% of circulating radioactivity, peak levels after a 20 mg dose are 1 to 6 ng/mL at 40 to 90 minutes, and multiple-dose kinetics are non-linear. The principal metabolite, 1-pyrimidinylpiperazine, is pharmacologically active in its own right.',
      structureSource: {
        label:
          'PubChem CID 2477 (buspirone) — canonical SMILES, molecular formula and weight, as carried on the enriched record; all pharmacology and pharmacokinetic statements quoted from the buspirone hydrochloride United States prescribing information',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2477',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'bus-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the azaspirodecanedione and the 1-PP content',
          description:
            'The controlled impurity is 1-pyrimidinylpiperazine, which is both a synthetic precursor and the drug’s principal circulating metabolite, and is pharmacologically active. Because unchanged buspirone accounts for only about 1% of what circulates, a batch carrying excess 1-PP is meaningfully different from one that does not.',
          reagentsAndBuffer:
            'Buspirone hydrochloride and 1-(2-pyrimidinyl)piperazine reference standards, reverse-phase HPLC with UV detection, mass spectrometry for the azaspirodecanedione fragment, Karl Fischer titration',
        },
        {
          id: 'bus-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Link a spiro imide to a pyrimidinylpiperazine through a butyl chain',
          description:
            'Buspirone joins two halves: an 8-azaspiro[4.5]decane-7,9-dione and 1-(2-pyrimidinyl)piperazine, connected by a four-carbon chain. There are no stereocentres. The spiro imide half is what makes the molecule structurally unlike every benzodiazepine and every antidepressant, which is consistent with its binding neither the benzodiazepine site nor any monoamine transporter.',
          dependsOnStepId: 'bus-w1',
          reagentsAndBuffer:
            '8-Azaspiro[4.5]decane-7,9-dione, 1-(2-pyrimidinyl)piperazine, 1,4-dibromobutane or an equivalent linker, potassium carbonate in a dipolar aprotic solvent',
        },
        {
          id: 'bus-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the hydrochloride to a specified 1-PP limit',
          description:
            'Salt formation and recrystallisation with 1-PP as the release-critical impurity. Because the drug’s own systemic exposure is so low and so variable, an impurity that is itself active occupies an unusually large share of the pharmacological picture.',
          dependsOnStepId: 'bus-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in an alcoholic solvent, recrystallisation, HPLC release testing against a 1-PP limit',
        },
        {
          id: 'bus-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Distinguish presynaptic from postsynaptic 5-HT1A activity',
          description:
            'The label states high 5-HT1A affinity and stops there. Whether buspirone acts as a full agonist at presynaptic raphe autoreceptors and a partial agonist postsynaptically — the account usually given in textbooks — is a functional question that binding affinity cannot answer, and answering it is the difference between the mechanism being unknown and being known.',
          dependsOnStepId: 'bus-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells expressing human HTR1A with GTPγS binding and cyclic AMP readouts to establish intrinsic activity, raphe versus hippocampal tissue preparations for regional comparison, D2 radioligand binding run in parallel; buspirone and 1-PP as separate test articles',
        },
        {
          id: 'bus-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure parent and 1-PP separately across a CYP3A4 interaction range',
          description:
            'The single most striking fact about this drug is how far its exposure moves: an 89.6% fall with rifampin and a rise of up to fiftyfold with nefazodone, from labelled healthy-volunteer studies. Any assay describing buspirone has to resolve parent from metabolite at 1 ng/mL and stay linear across three orders of magnitude, or it cannot describe the same drug in two different patients.',
          dependsOnStepId: 'bus-w4',
          reagentsAndBuffer:
            'Liquid chromatography-tandem mass spectrometry with deuterated buspirone and 1-PP internal standards, calibrators from 0.1 to 100 ng/mL, standardised fed and fasted arms, CYP3A4 phenotyping with a probe substrate',
        },
      ],
    },
    keyAudits: [
      {
        id: 'bus-a1',
        category: 'inferred',
        title: 'Six words: "The mechanism of action of buspirone is unknown"',
        laymanSummary:
          'That is the opening sentence of the drug’s pharmacology section. Everything after it is a list of what buspirone binds and, more pointedly, what it does not.',
        technicalDetails:
          'The clinical pharmacology section opens: "The mechanism of action of buspirone is unknown." It then establishes the drug by negation — no anticonvulsant effect, no muscle relaxant effect, no prominent sedation, no significant affinity for benzodiazepine receptors, no effect on GABA binding in vitro or in vivo — before offering high in vitro affinity for 5-HT1A receptors and moderate affinity for brain D2 receptors, and noting that some studies suggest indirect effects on other neurotransmitter systems. The textbook account, that buspirone is a partial agonist at postsynaptic 5-HT1A receptors and a fuller agonist at presynaptic autoreceptors, appears nowhere on the document; binding affinity is reported, intrinsic activity is not. Two further facts make the gap larger than it looks. Unchanged buspirone accounts for only about 1% of circulating radioactivity, so most of what a patient carries is metabolites, one of which — 1-pyrimidinylpiperazine — is pharmacologically active. And the effect takes weeks to appear, which no receptor-occupancy account explains on its own. The label provides an unusually limited mechanism statement for a drug in routine use.',
        evidenceSource:
          'Buspirone hydrochloride United States prescribing information, Clinical Pharmacology section',
        inferredClaim:
          'That 5-HT1A partial agonism is the mechanism of buspirone’s anxiolytic effect — an account absent from the label, which reports affinity without intrinsic activity and declares the mechanism unknown',
        auditFlag: 'contested',
      },
      {
        id: 'bus-a2',
        category: 'failed',
        title: 'A chronic condition, and no efficacy shown past four weeks',
        laymanSummary:
          'Generalised anxiety disorder lasts years. Buspirone’s label states that its effectiveness beyond three to four weeks has not been demonstrated in controlled trials, and that no body of evidence addresses how long treatment should last.',
        technicalDetails:
          'The indications section reads: "The effectiveness of buspirone hydrochloride tablets in long-term use, that is, for more than 3 to 4 weeks, has not been demonstrated in controlled trials. There is no body of evidence available that systematically addresses the appropriate duration of treatment for GAD. However, in a study of long-term use, 264 patients were treated with buspirone hydrochloride tablets for 1 year without ill effect. Therefore, the physician who elects to use buspirone hydrochloride tablets for extended periods should periodically reassess the usefulness of the drug for the individual patient." The 264-patient study establishes tolerability over a year, not efficacy. The Cochrane review reaches the same point from the literature side: of 36 trials, study length ranged from four to nine weeks with a single 14-week study, and the authors concluded that "longer term studies are needed to show that azapirones are effective in treating GAD, which is a chronic long-term illness". This is a drug that takes two to four weeks to begin working and has never been shown to still be working at week five.',
        evidenceSource:
          'Buspirone hydrochloride United States prescribing information, Indications and Usage; Chessick CA, Allen MH, Thase M, et al. Azapirones for generalized anxiety disorder. Cochrane Database Syst Rev 2006;(3):CD006115',
        doi: '10.1002/14651858.CD006115',
        measuredMetric:
          'Longest duration over which controlled efficacy has been demonstrated, against the chronicity of the licensed condition',
        auditFlag: 'caution',
      },
      {
        id: 'bus-a3',
        category: 'measured',
        title: 'Better than placebo across 36 trials, with a wide confidence interval',
        laymanSummary:
          'Pooling 36 trials in 5,908 people, about four to five patients had to be treated for one extra person to improve on a global clinical scale. The confidence interval on that number ran from 2 to 15.',
        technicalDetails:
          'The Cochrane review of azapirones for generalized anxiety disorder included 36 trials reporting on 5,908 participants randomly allocated to azapirones and/or placebo, benzodiazepines, antidepressants, psychotherapy or kava. Azapirones, including buspirone, were superior to placebo, with a calculated number needed to treat on the Clinical Global Impression scale of 4.4 (95% CI 2.16 to 15.4). Azapirones may be less effective than benzodiazepines, and the review was unable to conclude whether they were superior to antidepressants, kava or psychotherapy. Azapirones appeared well tolerated and side effects were mild and non-serious, but fewer participants stopped taking benzodiazepines than azapirones — an acceptability finding that runs against the drug. A number needed to treat whose upper bound is 15.4 is compatible with a useful effect and with a marginal one, and the review does not narrow it further.',
        evidenceSource:
          'Chessick CA, Allen MH, Thase M, Batista Miralha da Cunha AB, Kapczinski FF, de Lima MS, dos Santos Souza JJ. Azapirones for generalized anxiety disorder. Cochrane Database Syst Rev 2006;(3):CD006115',
        doi: '10.1002/14651858.CD006115',
        measuredMetric:
          'Number needed to treat on the Clinical Global Impression scale, azapirones against placebo, across 36 trials and 5,908 participants',
        auditFlag: 'verified',
      },
      {
        id: 'bus-a4',
        category: 'failed',
        title: 'It works best in the people least likely to be offered it',
        laymanSummary:
          'The Cochrane review found azapirones useful "particularly for those participants who had not been on a benzodiazepine". In practice buspirone is most often reached for precisely because someone wants to avoid or come off a benzodiazepine.',
        technicalDetails:
          'The review’s conclusion reads: "Azapirones appeared to be useful in the treatment of GAD, particularly for those participants who had not been on a benzodiazepine." The label supplies the pharmacological reason and a second, separate problem: because buspirone does not exhibit cross-tolerance with benzodiazepines and other common sedative-hypnotics, it will not block the withdrawal syndrome seen when those drugs are stopped, and the label therefore advises withdrawing a patient gradually from the prior drug before starting buspirone rather than swapping one for the other. So the two commonest clinical situations in which buspirone is chosen — a patient already on a benzodiazepine, and a patient coming off one — are the situation where the evidence is weakest and the situation the label warns it cannot cover. Buspirone’s lack of sedation, which is its principal selling point, is also the most likely explanation for the prior-benzodiazepine effect: someone who knows what a benzodiazepine feels like has a reference point against which buspirone feels like nothing.',
        evidenceSource:
          'Chessick CA et al., Cochrane Database Syst Rev 2006;(3):CD006115; buspirone hydrochloride United States prescribing information, Precautions — Potential for Withdrawal Reactions in Sedative/Hypnotic/Anxiolytic Drug-Dependent Patients',
        doi: '10.1002/14651858.CD006115',
        measuredMetric:
          'Effect modification by prior benzodiazepine exposure, and the labelled absence of cross-tolerance',
        auditFlag: 'caution',
      },
      {
        id: 'bus-a5',
        category: 'measured',
        title: 'A blood level that moves five-hundredfold on what else you take',
        laymanSummary:
          'Grapefruit juice raises the amount of buspirone in your blood ninefold. An antifungal raises it nineteenfold. One antidepressant raised it up to fiftyfold. An antibiotic for tuberculosis cuts it by ninety per cent.',
        technicalDetails:
          'All figures are from healthy-volunteer studies on the label. Buspirone is metabolised by CYP3A4 and undergoes extensive first-pass metabolism: unchanged drug is about 1% of circulating radioactivity and peak levels after a 20 mg dose are 1 to 6 ng/mL. Against that low and variable baseline, the labelled interactions are: itraconazole 200 mg/day for 4 days, 13-fold Cmax and 19-fold AUC increase; nefazodone 250 mg twice daily, increases up to 20-fold in Cmax and up to 50-fold in AUC, with a roughly 50% fall in the active metabolite 1-PP; grapefruit juice 200 mL double-strength three times daily for 2 days, 4.3-fold Cmax and 9.2-fold AUC; erythromycin 1.5 g/day for 4 days, 5-fold Cmax and 6-fold AUC; diltiazem 60 mg three times daily, 5.5-fold AUC and 4-fold Cmax; verapamil 80 mg three times daily, 3.4-fold; and rifampin 600 mg/day for 5 days, an 83.7% fall in Cmax and 89.6% fall in AUC with loss of pharmacodynamic effect. Food alone raises AUC 84% and Cmax 116%. From the rifampin floor to the nefazodone ceiling is a span of roughly five hundredfold in exposure, which is why the label instructs patients to take the drug consistently with or without food and to avoid large amounts of grapefruit juice, and recommends starting at 2.5 mg with the strong inhibitors.',
        evidenceSource:
          'Buspirone hydrochloride United States prescribing information, Clinical Pharmacology and Precautions — Drug Interactions, Inhibitors and Inducers of Cytochrome P450 3A4',
        measuredMetric:
          'Fold change in buspirone Cmax and AUC across the labelled CYP3A4 inhibitor and inducer studies',
        auditFlag: 'caution',
      },
      {
        id: 'bus-a6',
        category: 'measured',
        title: 'STAR*D: as good as bupropion at remission, and harder to stay on',
        laymanSummary:
          'When citalopram had not worked, adding buspirone produced remission in 30.1% of patients and adding bupropion in 29.7% — effectively identical. But 20.6% dropped out of the buspirone arm for intolerance against 12.5% for bupropion.',
        technicalDetails:
          'STAR*D level 2 (NCT00021528) randomly assigned 565 adult outpatients with non-psychotic major depressive disorder who had not remitted despite a mean of 11.9 weeks of citalopram (mean final dose 55 mg/day) to augmentation with sustained-release bupropion up to 400 mg/day, and 286 to augmentation with buspirone up to 60 mg/day. Remission on the 17-item Hamilton scale, rated by telephone by blinded raters, was 29.7% with bupropion and 30.1% with buspirone; QIDS-SR-16 remission was 39.0% and 32.9%, and response 31.8% and 26.9%. Bupropion produced a greater reduction in QIDS-SR-16 score (25.3% against 17.1%, p<0.04), a lower final score (8.0 against 9.1, p<0.02) and a lower dropout rate due to intolerance (12.5% against 20.6%, p<0.009). There was no placebo arm, so neither augmentation can be read as beating no augmentation — and buspirone has no antidepressant indication. The two arms tie on the primary outcome and separate on everything secondary, all of it against buspirone.',
        evidenceSource:
          'Trivedi MH, Fava M, Wisniewski SR, et al. Medication augmentation after the failure of SSRIs for depression. N Engl J Med 2006;354:1243-1252',
        doi: '10.1056/NEJMoa052964',
        measuredMetric:
          'Remission on the 17-item Hamilton scale and dropout due to intolerance, buspirone against bupropion augmentation, in 851 patients',
        auditFlag: 'verified',
      },
      {
        id: 'bus-a7',
        category: 'failed',
        title: 'The dopamine receptor nobody talks about',
        laymanSummary:
          'The label records moderate affinity for brain dopamine D2 receptors and raises the question of what that might mean over time. Nothing on the document resolves it.',
        technicalDetails:
          'The pharmacology section states buspirone has moderate affinity for brain D2-dopamine receptors, and the precautions section opens a subsection headed "Possible Concerns Related to Buspirone’s Binding to Dopamine Receptors". That concern is not idle: the drugs that block D2 receptors for long periods are the antipsychotics, and their characteristic long-term harm is tardive dyskinesia. Buspirone’s D2 affinity is moderate rather than high and no such syndrome has been established for it. What has also never been established, for the same reason as everything else on this page, is what happens after four weeks — the point at which controlled efficacy data run out and at which any receptor-adaptation effect would begin to accumulate. The 264-patient year-long tolerability study is the only long exposure data the label offers, and it was not designed to detect a movement disorder.',
        evidenceSource:
          'Buspirone hydrochloride United States prescribing information, Clinical Pharmacology and Precautions — Possible Concerns Related to Buspirone’s Binding to Dopamine Receptors',
        measuredMetric:
          'Labelled D2 receptor affinity and the duration of the longest reported exposure study',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, and almost entirely destroyed on the way through',
        laymanDesc:
          'Nearly all of a dose is broken down before it reaches the bloodstream. Only about one per cent of what circulates is the drug itself.',
        molecularDetail:
          'Rapid absorption followed by extensive first-pass metabolism. In a radiolabelled study, unchanged buspirone accounted for about 1% of plasma radioactivity. Peak levels of 1 to 6 ng/mL appear 40 to 90 minutes after a 20 mg dose, and multiple-dose kinetics are non-linear, so repeated dosing gives higher levels than single-dose studies predict.',
        iconName: 'Filter',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'What survives depends on your breakfast and your other prescriptions',
        laymanDesc:
          'Food nearly doubles the amount that gets through. Grapefruit juice raises it ninefold. A tuberculosis antibiotic cuts it by ninety per cent.',
        molecularDetail:
          'CYP3A4 is the metabolising enzyme. Labelled interaction studies span an 89.6% AUC reduction with rifampin to increases of 9.2-fold with grapefruit juice, 19-fold with itraconazole and up to 50-fold with nefazodone. Food alone raises AUC 84% and Cmax 116% by reducing presystemic clearance.',
        iconName: 'AlertTriangle',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds a serotonin receptor, and not the benzodiazepine one',
        laymanDesc:
          'It sits on a particular serotonin receptor. It does not go near the receptor that Valium and its relatives use — which is why it does not sedate and is not habit-forming.',
        molecularDetail:
          'High in vitro affinity for 5-HT1A receptors and moderate affinity for brain D2 receptors. No significant affinity for benzodiazepine receptors and no effect on GABA binding in vitro or in vivo. No anticonvulsant or muscle relaxant effect and no prominent sedation.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And then the label stops',
        laymanDesc:
          'What happens after the receptor is bound is not stated. The prescribing information’s first sentence on pharmacology is that the mechanism of action is unknown.',
        molecularDetail:
          'The label reports binding affinity without intrinsic activity, so it does not distinguish agonism from antagonism, or presynaptic autoreceptor from postsynaptic receptor. It adds only that some studies suggest indirect effects on other neurotransmitter systems. The principal metabolite, 1-pyrimidinylpiperazine, is itself active and is present at far higher concentrations than the parent.',
        iconName: 'HelpCircle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Two to four weeks later, anxiety scores fall',
        laymanDesc:
          'It is not a tablet you take when anxiety strikes. It works over weeks, and about four to five people need treating for one extra person to improve.',
        molecularDetail:
          'Number needed to treat of 4.4 (95% CI 2.16 to 15.4) on the Clinical Global Impression scale across 36 trials and 5,908 participants. Azapirones may be less effective than benzodiazepines, and it could not be determined whether they beat antidepressants, kava or psychotherapy.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And after week four, nobody has looked',
        laymanDesc:
          'The label says effectiveness beyond three to four weeks has not been demonstrated in controlled trials. Anxiety disorders last years.',
        molecularDetail:
          'Trial durations in the Cochrane review ran four to nine weeks with a single 14-week study. The only long exposure data on the label is a tolerability study of 264 patients treated for one year "without ill effect", which establishes safety over that period and says nothing about whether the drug was still working.',
        iconName: 'Clock',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Cochrane review of azapirones for generalized anxiety disorder (Cochrane Database Syst Rev 2006;(3):CD006115)',
        phase: 'Systematic review and meta-analysis of 36 randomised trials',
        sampleSize: 5908,
        primaryEndpoint:
          'Clinical Global Impression response in generalized anxiety disorder, azapirones against placebo, benzodiazepines, antidepressants, psychotherapy or kava',
        endpointMet: true,
        statisticalPValue:
          'Superior to placebo, with a calculated number needed to treat on the Clinical Global Impression scale of 4.4 (95% CI 2.16 to 15.4)',
        unreportedAdverseSignals:
          'Azapirones may be less effective than benzodiazepines, and superiority over antidepressants, kava or psychotherapy could not be concluded. Fewer participants stopped taking benzodiazepines than azapirones. Trial lengths ran four to nine weeks with one at 14, and the authors state that longer-term studies are needed for what is a chronic illness. The benefit was particularly evident in participants who had not previously taken a benzodiazepine.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'STAR*D level 2 augmentation — NCT00021528 (N Engl J Med 2006;354:1243-1252)',
        phase:
          'Randomised, open augmentation with blinded telephone outcome rating; no placebo arm',
        sampleSize: 851,
        primaryEndpoint:
          'Remission, defined as a 17-item Hamilton score of 7 or less, after augmenting citalopram with sustained-release bupropion or with buspirone',
        endpointMet: true,
        statisticalPValue:
          'Hamilton remission 29.7% with bupropion (n=565) against 30.1% with buspirone (n=286); QIDS-SR-16 remission 39.0% against 32.9% and response 31.8% against 26.9%',
        unreportedAdverseSignals:
          'Bupropion produced a greater QIDS-SR-16 reduction (25.3% against 17.1%, p<0.04), a lower final score (8.0 against 9.1, p<0.02) and a lower dropout rate due to intolerance (12.5% against 20.6%, p<0.009). There was no placebo arm, so neither augmentation can be read as superior to no augmentation, and buspirone holds no antidepressant indication.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'One-year open tolerability study (NDA 018731, Indications and Usage)',
        phase: 'Long-term open-label exposure study',
        sampleSize: 264,
        primaryEndpoint:
          'Tolerability of buspirone over one year of continuous use, as summarised on the label',
        endpointMet: true,
        statisticalPValue:
          'The label states 264 patients were treated with buspirone for one year "without ill effect"; no efficacy result is reported',
        unreportedAdverseSignals:
          'This is the only long exposure data on the document and it addresses safety, not effectiveness. The same section states that effectiveness beyond three to four weeks has not been demonstrated in controlled trials and that no body of evidence systematically addresses the appropriate duration of treatment.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Number needed to treat of 4.4 (95% CI 2.16 to 15.4) on the Clinical Global Impression scale across 36 trials and 5,908 participants',
        'Remission of 30.1% with buspirone against 29.7% with bupropion as citalopram augmentation, with intolerance dropout of 20.6% against 12.5%',
        'Unchanged buspirone accounting for about 1% of circulating radioactivity, with peak levels of 1 to 6 ng/mL after 20 mg',
        'Exposure changes from an 89.6% AUC fall with rifampin to a rise of up to 50-fold with nefazodone, 19-fold with itraconazole and 9.2-fold with grapefruit juice',
        'Food raising AUC 84% and Cmax 116% relative to the fasted state',
      ],
      unsupportedInferences: [
        'That 5-HT1A partial agonism is the mechanism — the label reports affinity, not intrinsic activity, and calls the mechanism unknown',
        'That efficacy demonstrated over three to four weeks persists across the months and years a chronic anxiety disorder lasts',
        'That the one-year tolerability study in 264 patients says anything about continued effectiveness; it reports no efficacy outcome',
        'That buspirone can substitute for a benzodiazepine being withdrawn, which the label states it cannot because there is no cross-tolerance',
      ],
      whatFailedInitially: [
        'Effectiveness beyond three to four weeks has never been demonstrated in a controlled trial, per the label',
        'The Cochrane review found azapirones may be less effective than benzodiazepines and could not establish superiority over antidepressants, kava or psychotherapy',
        'The benefit was particularly evident in people who had not previously taken a benzodiazepine — not the population it is usually reached for',
        'In STAR*D it tied with bupropion on remission and lost on every secondary outcome, including a 20.6% intolerance dropout rate',
      ],
      realWorldOutcome: [
        'Approved in the United States on 29 September 1986 under NDA 018731, generic since 2001, at about four United States cents a tablet',
        'The only widely used anxiolytic that is neither a benzodiazepine nor an antidepressant, and neither a controlled substance nor carrying a suicidality boxed warning',
        'Its principal clinical value is what it does not do: no sedation, no muscle relaxation, no dependence, no withdrawal',
        'Its principal clinical limitation is the same one it has had since 1986: nobody has shown it still works at week five',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 5, 7.5, 10, 15 and 30 mg, taken two or three times daily, and to be taken consistently either always with or always without food',
      description:
        'Rapidly absorbed with extensive first-pass metabolism by CYP3A4; unchanged drug is about 1% of circulating radioactivity and peak concentrations after 20 mg are 1 to 6 ng/mL. Multiple-dose kinetics are non-linear. Food reduces presystemic clearance, raising AUC 84% and Cmax 116%, which is why the label asks for consistency rather than a particular choice. The principal metabolite 1-pyrimidinylpiperazine is itself pharmacologically active.',
      safetyProfile:
        'No boxed warning. Not a controlled substance and no dependence liability. Contraindicated with monoamine oxidase inhibitors and within 14 days of stopping one, in either direction, because of serotonin syndrome and hypertension risk, and with reversible MAOIs such as linezolid and intravenous methylene blue. No cross-tolerance with benzodiazepines, so it will not block sedative-hypnotic withdrawal, and prior CNS depressants should be tapered before starting. Dizziness, nausea, headache, nervousness and lightheadedness are the common reactions. Patients are advised not to drive until they know how it affects them, to avoid large amounts of grapefruit juice, and to be cautious with alcohol despite the absence of a demonstrated interaction on motor and mental performance.',
    },
    commonQuestions: [
      {
        q: 'Why doesn’t it work when I take it during a panic?',
        a: 'Because it is not that kind of drug, and it never was. Buspirone has no significant affinity for the benzodiazepine receptor and does not affect GABA binding, which is exactly why it does not sedate, does not relax muscles, is not anticonvulsant and is not habit-forming. The cost of all that is that it does nothing acutely. Its effect builds over roughly two to four weeks of regular dosing. Taking it when you feel anxious will produce, at most, the side effects — dizziness, lightheadedness, nausea — without the benefit. It is also worth knowing that if you have taken a benzodiazepine before, the evidence that buspirone will help you is weaker: the Cochrane review found the class useful particularly in people who had not been on one.',
      },
      {
        q: 'How long can I stay on it?',
        a: 'Longer than anyone has studied. The label is explicit: "The effectiveness of buspirone hydrochloride tablets in long-term use, that is, for more than 3 to 4 weeks, has not been demonstrated in controlled trials," and "There is no body of evidence available that systematically addresses the appropriate duration of treatment for GAD." What the label does offer is a study in which 264 patients took the drug for a year without ill effect — which is a safety finding, not an efficacy one. The Cochrane review says the same thing from the other direction: its 36 trials ran four to nine weeks with one at fourteen, and the authors concluded that longer studies are needed because generalised anxiety disorder is a chronic long-term illness. The label’s own instruction is that a prescriber using it for extended periods should periodically reassess whether it is still useful for that individual.',
        auditNote:
          'A drug that takes three to four weeks to start working and has never been tested past three to four weeks has an efficacy window one week wide. That is the single most striking fact about this molecule and it has been true since 1986.',
      },
      {
        q: 'Why was I told to avoid grapefruit juice?',
        a: 'Because buspirone is cleared almost entirely by a liver and gut enzyme called CYP3A4, which grapefruit juice inhibits — and this drug is unusually sensitive to that. In the study on the label, grapefruit juice raised peak buspirone concentrations 4.3-fold and total exposure 9.2-fold. It is not alone: itraconazole raised exposure nineteenfold, nefazodone up to fiftyfold, erythromycin sixfold, diltiazem five and a half. In the other direction, rifampin cut exposure by 89.6% and with it the drug’s effect. Even food matters, raising exposure by 84%, which is why the label asks you to take it consistently with or without food rather than specifying which. Very little of the drug survives to reach the blood in the first place — about 1% of what circulates is unchanged buspirone — so anything that changes that fraction changes it a lot.',
      },
      {
        q: 'How does it compare with a benzodiazepine?',
        a: 'Slower, probably weaker, and without the problems. The Cochrane review of 36 trials found azapirones may be less effective than benzodiazepines and that fewer people stopped taking the benzodiazepine than the azapirone — so on both effect and acceptability the comparison runs against buspirone. What buspirone does not have is tolerance, dependence, withdrawal, sedation or controlled-substance status, and it will not impair driving the way a benzodiazepine does. One important practical point: buspirone cannot be used to cover someone coming off a benzodiazepine. Because it has no cross-tolerance, the label says it will not block the withdrawal syndrome, and advises tapering the prior drug gradually before starting buspirone rather than switching between them.',
      },
      {
        q: 'Does it help depression?',
        a: 'It has no antidepressant indication, and the one large trial that tested it as an add-on gives a mixed answer. In STAR*D, 851 people whose depression had not remitted on citalopram were randomised to add sustained-release bupropion or buspirone. Remission on the blinded Hamilton scale was almost identical — 29.7% with bupropion, 30.1% with buspirone. On everything else bupropion won: a greater reduction in self-reported symptom scores (25.3% against 17.1%), a lower final score, and far fewer people dropping out because they could not tolerate it (12.5% against 20.6%). There was no placebo arm, so neither result shows that adding anything beat adding nothing. Buspirone is also sometimes added specifically to counter SSRI-related sexual dysfunction; that is a separate and much smaller literature, and it is not on the label.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Buspirone hydrochloride United States prescribing information — Indications and Usage, Clinical Pharmacology, Precautions (Drug Interactions, CYP3A4 inhibitors and inducers, withdrawal reactions, dopamine receptor binding), Information for Patients (NDA 018731)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018731',
        kind: 'regulatory',
      },
      {
        label:
          'Chessick CA, Allen MH, Thase M, Batista Miralha da Cunha AB, Kapczinski FF, de Lima MS, dos Santos Souza JJ. Azapirones for generalized anxiety disorder. Cochrane Database Syst Rev 2006;(3):CD006115',
        identifier: '10.1002/14651858.CD006115',
        kind: 'doi',
      },
      {
        label:
          'Trivedi MH, Fava M, Wisniewski SR, et al. Medication augmentation after the failure of SSRIs for depression. N Engl J Med 2006;354:1243-1252',
        identifier: '10.1056/NEJMoa052964',
        kind: 'doi',
      },
      {
        label: 'Sequenced Treatment Alternatives to Relieve Depression (STAR*D) registry record',
        identifier: 'NCT00021528',
        kind: 'nct',
      },
      {
        label:
          'Pittler MH, Ernst E. Kava extract for treating anxiety. Cochrane Database Syst Rev 2003;(1):CD003383',
        identifier: '10.1002/14651858.CD003383',
        kind: 'doi',
      },
      {
        label:
          'National Institutes of Health Office of Dietary Supplements — Kava, hosting the FDA consumer advisory of 25 March 2002 on the potential risk of severe liver injury associated with kava-containing dietary supplements',
        identifier: 'https://ods.od.nih.gov/HealthInformation/kava.aspx',
        kind: 'url',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — buspirone, 156 listed generic products, and lorazepam, clonazepam and hydroxyzine medians, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2477 — buspirone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2477',
        kind: 'url',
      },
    ],
  },
]
