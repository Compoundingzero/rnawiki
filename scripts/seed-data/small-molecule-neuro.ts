import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — small molecules acting on the nervous system, plus the analgesic and
 * anti-inflammatory drugs that sit beside them in a medicine cabinet.
 *
 * Every DOI, PMID, NCT number and Drugs@FDA application number below was resolved against Crossref,
 * PubMed, ClinicalTrials.gov v2 or the openFDA Drugs@FDA endpoint at the time of writing. Effect
 * sizes, arm sizes, p-values and confidence intervals are copied from the published abstract or the
 * label, never from memory. Where a number could not be sourced the field is absent.
 *
 * Four conventions apply to the whole group.
 *
 * 1. NO PRICING BLOCK, ANYWHERE. `SeedPricing` requires a synthesis cost per dose with a citable
 *    source. The published cost-of-production literature for small molecules (Hill, Barber & Gotham,
 *    BMJ Glob Health 2018; Barber et al., JAMA Netw Open 2024) reports either aggregate ranges or
 *    per-drug figures held in supplementary appendices this file could not verify line by line, and
 *    none of the twenty-two drugs here has a per-dose synthesis cost this file can quote and cite.
 *    So no dossier carries `pricing`. Actual United States pharmacy acquisition costs, which are a
 *    price and not a cost of manufacture, appear inside `substitutes` where the CMS National Average
 *    Drug Acquisition Cost file publishes them (all figures effective 17 December 2025). A missing
 *    cost beats a manufactured one.
 *
 * 2. THE SMILES STRINGS ARE PUBCHEM CANONICAL SMILES, PASTED, NOT RETYPED. Each one was pulled from
 *    the PubChem PUG REST `SMILES` property and then put through this repository's own connection
 *    table parser; the molecular formula the engine computes from the string matches the formula
 *    PubChem prints for that CID in every case, which is the arithmetic proof the transcription is
 *    right. Carbidopa-levodopa carries the levodopa structure, because a fixed-dose combination has
 *    two molecules and the field holds one; the dossier says so in as many words.
 *
 * 3. THE SEROTONIN QUESTION IS RECORDED FROM BOTH SIDES. Moncrieff et al.'s 2022 umbrella review and
 *    the substantive replies to it (Jauhar et al. 2023) are both cited on the SSRI pages, because
 *    the honest state of the field is that the low-serotonin story is not supported while the drugs
 *    still separate from placebo by an amount whose clinical size is genuinely contested. Recording
 *    only one half would be taking a side the evidence does not support.
 *
 * 4. THE AUDIT POINTS ARE NOT A HIGHLIGHT REEL. Every dossier here carries at least one 'inferred'
 *    or 'failed' entry, because every drug in this group has one: sertraline missed its primary
 *    endpoint in the largest primary-care trial ever run on it, pregabalin failed in sciatica,
 *    esketamine failed two of its three short-term trials, donepezil showed no effect on
 *    institutionalisation, aspirin's primary-prevention case collapsed in 2018, and sirolimus has
 *    replicated mouse lifespan data and no human lifespan trial at all.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) 2026 file, prices effective 17 December 2025',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

export const SMALL_MOLECULE_NEURO_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Sertraline
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'sertraline',
    name: 'Sertraline',
    tradeName: 'Zoloft',
    sponsor: 'Pfizer',
    targetGene: 'SLC6A4',
    targetProtein: 'Sodium-dependent serotonin transporter (SERT, 5-HTT)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1991,
    indication:
      'Major depressive disorder, obsessive-compulsive disorder, panic disorder, post-traumatic stress disorder, social anxiety disorder, premenstrual dysphoric disorder',
    patientFriendlyIndication: 'Depression, anxiety disorders and obsessive-compulsive disorder',
    anatomicalSite: 'Presynaptic serotonergic terminals, raphe nuclei and cortical projections',
    conditionContext: {
      conditionExplainer:
        'Depression is diagnosed from a pattern of symptoms — low mood, loss of interest, disturbed sleep and appetite, poor concentration — not from a blood test or a scan. There is no laboratory measurement that confirms it and none that rules it out.',
      whyItMatters:
        'Because the diagnosis is a description rather than a measurement, the drugs that treat it are judged entirely on symptom rating scales in randomised trials. That makes the size of the drug-placebo gap, and who it applies to, the whole argument.',
      whoTakesThis:
        'Adults with moderate to severe depressive episodes, and adults and children aged 6 and older with obsessive-compulsive disorder. Sertraline is one of the two SSRIs (with escitalopram) that network meta-analysis ranks highest on the joint criterion of efficacy and acceptability.',
      clinicalGoals:
        'Reduce symptom scores enough to reach response or remission, and keep the patient on treatment long enough to get there — roughly half the value of an antidepressant in practice is that people tolerate it.',
    },
    oneSentenceVerdict:
      'A serotonin reuptake blocker that beat placebo across 522 randomised trials in the largest antidepressant network meta-analysis ever run, and then missed its primary endpoint at six weeks in the largest primary-care trial ever run on it.',
    laymanHowItWorks:
      'Nerve cells talk to each other by releasing a chemical messenger into the gap between them, and then vacuuming most of it back up to reuse. Sertraline blocks the vacuum for one messenger, serotonin, so more of it stays in the gap for longer. What happens next is not well understood: the blockade is complete within hours, but the mood change, when it comes, takes weeks. Whatever the drug is actually doing, it is not simply topping up a chemical that was low.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    substitutes: {
      summary:
        'Every one of the 21 antidepressants in the Cipriani network beat placebo, so the choice between them is about tolerability and interactions rather than potency. Psychological therapy has comparable evidence in moderate depression and no discontinuation syndrome. Exercise has real but smaller and much less well-blinded evidence.',
      conventionalRx: [
        {
          name: 'Escitalopram',
          class: 'Selective serotonin reuptake inhibitor',
          howItCompares:
            'The other SSRI that ranked in the top tier of the Cipriani network on both efficacy and acceptability. Fewer drug interactions than sertraline through CYP2D6; more QT signal at high dose.',
          typicalCost:
            'US$0.043 per 10 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 17 Dec 2025) — about US$1.29 for a 30-day supply',
          prosAndCons:
            'Pros: same evidence tier, simple once-daily dose. Cons: dose-dependent QT prolongation, and the same discontinuation syndrome.',
        },
        {
          name: 'Bupropion',
          class: 'Norepinephrine-dopamine reuptake inhibitor',
          howItCompares:
            'Does not touch the serotonin transporter at all, so it does not cause the sexual dysfunction that is the commonest reason people stop an SSRI. Weaker in anxiety disorders, and it lowers the seizure threshold.',
          typicalCost:
            'US$0.070 per 100 mg sustained-release tablet at pharmacy acquisition cost (CMS NADAC, effective 17 Dec 2025)',
          prosAndCons:
            'Pros: no sexual side effects, mildly activating, helps smoking cessation. Cons: contraindicated with seizure disorders and eating disorders, can worsen anxiety.',
        },
        {
          name: 'Cognitive behavioural therapy',
          class: 'Structured psychological treatment',
          howItCompares:
            'Comparable effect to antidepressants in moderate depression in head-to-head trials, with lower relapse after treatment stops and no pharmacological withdrawal.',
          typicalCost: 'Not priced here — cost depends entirely on health system and country',
          prosAndCons:
            'Pros: durable, no drug interactions, nothing to taper. Cons: requires a trained therapist and 12 to 20 sessions, and trials cannot be blinded.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Never stop abruptly — taper, and know the difference from relapse',
          action:
            'Reduce the dose gradually with a prescriber rather than stopping in one step, and note the timing of any symptoms.',
          patientImpact:
            'Discontinuation symptoms started within days of stopping in about 31% of people across 62 study groups, against 17% after stopping placebo. They are usually short. A depressive relapse takes weeks and looks different.',
          clinicalPrecaution:
            'The 31% figure includes symptoms that also appear on placebo withdrawal; the drug-attributable excess in randomised comparisons was about 8 percentage points, and severe symptoms about 2.8% versus 0.6%.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN[C@H]1CC[C@H](C2=CC=CC=C12)C3=CC(=C(C=C3)Cl)Cl',
      chemicalFormula: 'C17H17Cl2N',
      molecularWeight: '306.2 g/mol (free base); the marketed salt is sertraline hydrochloride',
      targetReceptorAffinity:
        'Selective for the serotonin transporter over the norepinephrine transporter; sertraline also has the highest affinity for the dopamine transporter of the SSRI class, which is why it is sometimes described as having a weak dopaminergic component',
      structureSource: {
        label: 'PubChem CID 68617 (sertraline) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/68617',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'sert-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the tetralone ketone and the amine',
          description:
            'Confirm identity and purity of 4-(3,4-dichlorophenyl)-3,4-dihydronaphthalen-1(2H)-one and of the methylamine solution before condensation. Residual water in the ketone drives the imine equilibrium backwards and costs yield at the next step.',
          reagentsAndBuffer:
            '4-(3,4-dichlorophenyl)-3,4-dihydronaphthalen-1(2H)-one reference standard, 40% aqueous methylamine, Karl Fischer titration, reversed-phase HPLC with UV detection at 254 nm, 1H NMR in CDCl3',
        },
        {
          id: 'sert-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Imine condensation and stereoselective hydrogenation',
          description:
            'Condense the tetralone with methylamine to the ketimine, then hydrogenate over palladium on carbon. The hydrogenation sets the second stereocentre and favours the cis diastereomer that carries the activity. Pfizer\'s redesigned commercial route runs the condensation, the reduction and the resolution in ethanol alone, replacing the dichloromethane, tetrahydrofuran, toluene and hexane of the original process — the change that won the 2002 Presidential Green Chemistry Challenge Award.',
          dependsOnStepId: 'sert-w1',
          reagentsAndBuffer:
            'Methylamine in ethanol; 5% palladium on carbon under hydrogen; absolute ethanol as the single process solvent',
        },
        {
          id: 'sert-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Diastereomeric salt resolution and salt formation',
          description:
            'Resolve the cis racemate as its D-(-)-mandelate salt, recover the (1S,4S) free base, and convert to the hydrochloride. Only the (1S,4S) enantiomer is sertraline; its mirror image is a different molecule with different transporter selectivity.',
          dependsOnStepId: 'sert-w2',
          reagentsAndBuffer:
            'D-(-)-mandelic acid in ethanol; aqueous sodium hydroxide for free-basing; hydrogen chloride in ethanol; chiral stationary-phase HPLC for enantiomeric excess',
        },
        {
          id: 'sert-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'SERT expression in a transfected cell line',
          description:
            'Express human SLC6A4 in HEK293 cells so that transporter function can be measured against a mock-transfected control, which is the only way to attribute uptake blockade to SERT rather than to a related carrier.',
          dependsOnStepId: 'sert-w3',
          reagentsAndBuffer:
            'HEK293 cells, human SLC6A4 expression plasmid, lipid transfection reagent, DMEM with 10% fetal bovine serum and geneticin selection',
        },
        {
          id: 'sert-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Serotonin uptake inhibition and radioligand displacement',
          description:
            'Measure inhibition of tritiated serotonin uptake across a concentration series to derive an IC50, and confirm site occupancy by displacement of a labelled SERT ligand. Run the same series against the norepinephrine and dopamine transporters to record selectivity rather than assume it.',
          dependsOnStepId: 'sert-w4',
          reagentsAndBuffer:
            '[3H]-5-hydroxytryptamine, [3H]-citalopram or [125I]-RTI-55 as SERT radioligand, Krebs-HEPES assay buffer with ascorbate and pargyline, glass-fibre filter harvest, liquid scintillation counting',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sert-a1',
        category: 'measured',
        title: 'All 21 antidepressants beat placebo across 522 trials and 116,477 participants',
        laymanSummary:
          'The biggest analysis ever done found that every antidepressant tested worked better than a dummy pill, with sertraline in the group that combined good results with people staying on it.',
        technicalDetails:
          'Cipriani et al. searched to January 2016 and included 522 double-blind randomised trials of 21 antidepressants in adults with major depressive disorder, 116,477 participants. All 21 were more efficacious than placebo on response rate, with odds ratios from 2.13 (95% CrI 1.89 to 2.41) for amitriptyline down to 1.37 (1.16 to 1.63) for reboxetine. The paper explicitly rated certainty of evidence with GRADE and found it moderate to very low for most comparisons.',
        evidenceSource: 'Cipriani A et al., Lancet 2018;391:1357-1366',
        doi: '10.1016/S0140-6736(17)32802-7',
        measuredMetric: 'Odds ratio for treatment response versus placebo, network meta-analysis',
        auditFlag: 'verified',
      },
      {
        id: 'sert-a2',
        category: 'failed',
        title: 'PANDA: sertraline missed its primary endpoint at six weeks in 653 primary-care patients',
        laymanSummary:
          'In the biggest trial of sertraline in ordinary general practice, depression scores at six weeks were no better than on placebo. Anxiety and self-rated mental health did improve.',
        technicalDetails:
          'Pragmatic, double-blind, placebo-controlled trial across 179 UK primary care surgeries; 655 randomised, 653 analysed, 550 with primary outcome data. Mean 6-week PHQ-9 was 7.98 (SD 5.63) on sertraline and 8.76 (5.86) on placebo — adjusted proportional difference 0.95, 95% CI 0.85 to 1.07, p=0.41. Secondary outcomes favoured sertraline for anxiety symptoms, mental health-related quality of life and self-rated improvement, and the authors reported weak evidence of a depressive-symptom effect by 12 weeks. The trial did not select on diagnostic threshold, which is exactly why it generalises to how the drug is actually prescribed.',
        evidenceSource: 'Lewis G et al., Lancet Psychiatry 2019;6:903-914 (ISRCTN84544741)',
        doi: '10.1016/S2215-0366(19)30366-9',
        measuredMetric: 'PHQ-9 depressive symptom score at 6 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'sert-a3',
        category: 'conclusion_shift',
        title: 'The serotonin-deficiency explanation lost its evidence base, and the drug did not',
        laymanSummary:
          'A 2022 review of every relevant research area found no consistent evidence that depression involves low serotonin. That is a claim about the explanation, not about whether the pills work — and both halves have to be held at once.',
        technicalDetails:
          'Moncrieff et al. ran an umbrella review of 17 studies covering 5-HIAA and serotonin concentrations, 5-HT1A receptor binding, SERT imaging and post-mortem levels, tryptophan depletion, and SERT gene and gene-environment studies. Two meta-analyses of 5-HIAA showed no association with depression (largest n=1002); one meta-analysis of plasma serotonin found no relationship and found lowered serotonin associated with antidepressant use (n=1869). Jauhar et al., writing for 35 co-authors, replied that the conclusion was overstated on grounds of selective reporting and misreading of the tryptophan-depletion and molecular-imaging literatures. Neither paper is a trial of sertraline, and neither changes the Cipriani estimate.',
        evidenceSource:
          'Moncrieff J et al., Mol Psychiatry 2023;28:3243-3256; reply Jauhar S et al., Mol Psychiatry 2023;28:3149-3152',
        doi: '10.1038/s41380-022-01661-0',
        inferredClaim:
          'That SSRIs work by correcting a serotonin deficiency — an explanation the biomarker literature does not support, and which was never what the efficacy trials measured',
        auditFlag: 'contested',
      },
      {
        id: 'sert-a4',
        category: 'inferred',
        title: 'Effect size versus placebo depends on baseline severity, and is small below the top of the range',
        laymanSummary:
          'Analysing the trial data the FDA holds rather than only what was published, the gap between drug and placebo grows as depression gets more severe, and is small for anyone who is not very severely ill.',
        technicalDetails:
          'Kirsch et al. obtained all clinical trials submitted to the FDA for four new-generation antidepressants including published and unpublished data, and modelled improvement against baseline severity. Drug-placebo differences increased with initial severity, reaching conventional criteria for clinical significance only at the upper end of the very severe category. The mechanism they identified was decreasing placebo responsiveness in severe depression, not increasing drug responsiveness. The finding is about the average patient in the regulatory dataset; it says nothing about any individual.',
        evidenceSource: 'Kirsch I et al., PLoS Med 2008;5:e45',
        doi: '10.1371/journal.pmed.0050045',
        inferredClaim:
          'That the average benefit found in trials of moderately depressed populations transfers to mild depression, where the drug-placebo gap in the FDA dataset is smallest',
        auditFlag: 'caution',
      },
      {
        id: 'sert-a5',
        category: 'measured',
        title: 'SADHART: safe after myocardial infarction, and the primary endpoint was safety, not mood',
        laymanSummary:
          'In 369 patients who had just had a heart attack or unstable angina, sertraline did not damage heart function. Its effect on depression was clearest in the most severe and most recurrent cases.',
        technicalDetails:
          'Randomised, double-blind, placebo-controlled, 40 centres, 369 patients with major depression after acute MI (74%) or unstable angina (26%), 24 weeks. The primary outcome was safety: no significant effect on left ventricular ejection fraction, ventricular premature complex runs, or QTc above 450 ms. Severe cardiovascular adverse events occurred in 14.5% on sertraline and 22.4% on placebo. CGI-I responder rates were 67% versus 53% overall (p=0.01), 72% versus 51% in those with a prior episode (p=0.003), and 78% versus 45% in the pre-specified severe subgroup (p=0.001). HAM-D did not separate in the total sample (p=0.14).',
        evidenceSource: 'Glassman AH et al., JAMA 2002;288:701-709',
        doi: '10.1001/jama.288.6.701',
        measuredMetric: 'Change in left ventricular ejection fraction; CGI-I responder rate',
        auditFlag: 'verified',
      },
      {
        id: 'sert-a6',
        category: 'measured',
        title: 'Discontinuation symptoms occur in about a third of people, and in a sixth after placebo',
        laymanSummary:
          'Stopping an antidepressant produced at least one withdrawal symptom in roughly 31 people in 100. Stopping a placebo produced one in 17 people in 100, so the drug-caused share is smaller than the headline number.',
        technicalDetails:
          'Henssler et al. pooled 79 studies (44 randomised trials, 35 observational) covering 21,002 patients; 16,532 discontinued an antidepressant and 4,470 discontinued placebo. Incidence of at least one discontinuation symptom was 0.31 (95% CI 0.27 to 0.35) after antidepressants and 0.17 (0.14 to 0.21) after placebo. Within randomised trials the summary difference in incidence was 0.08 (0.04 to 0.12). Severe symptoms occurred in 0.028 (0.014 to 0.057) after antidepressants against 0.006 (0.002 to 0.013) after placebo. Desvenlafaxine, venlafaxine and imipramine ranked highest for incidence.',
        evidenceSource: 'Henssler J et al., Lancet Psychiatry 2024;11:526-535',
        doi: '10.1016/S2215-0366(24)00133-0',
        measuredMetric: 'Incidence of at least one discontinuation symptom after stopping',
        auditFlag: 'verified',
      },
      {
        id: 'sert-a7',
        category: 'inferred',
        title: 'STAR*D: cumulative remission after four steps was 67%, and the number is not a drug effect',
        laymanSummary:
          'The largest real-world treatment study reported that two thirds of patients eventually remitted after up to four medication steps. There was no placebo group, so the figure cannot be attributed to the drugs.',
        technicalDetails:
          'STAR*D was an open, sequenced, non-randomised-to-placebo effectiveness study. QIDS-SR-16 remission rates were 36.8%, 30.6%, 13.7% and 13.0% at steps one to four, with an overall cumulative remission rate of 67%. Relapse during naturalistic follow-up rose with the number of steps required. The cumulative figure is routinely quoted as evidence of antidepressant efficacy; without a concurrent control arm it describes what happened to a cohort over a year, and cannot separate drug effect from natural course, regression to the mean and repeated measurement.',
        evidenceSource: 'Rush AJ et al., Am J Psychiatry 2006;163:1905-1917',
        doi: '10.1176/ajp.2006.163.11.1905',
        inferredClaim:
          'That the 67% cumulative remission rate is a measure of what antidepressants achieve, when the design has no comparator to measure it against',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, absorbed, and slow to reach steady state',
        laymanDesc:
          'The tablet is absorbed from the gut over several hours. It takes about a week of daily doses before the amount in the blood stops rising.',
        molecularDetail:
          'Oral absorption with a terminal half-life of roughly a day, so steady state is reached after about five to seven days of once-daily dosing. Extensive first-pass metabolism, principally to N-desmethylsertraline, which is far less active at the transporter.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Crosses into the brain and reaches the nerve terminals',
        laymanDesc:
          'The molecule is greasy enough to pass out of the blood into brain tissue, where it reaches the tips of the nerve cells that release serotonin.',
        molecularDetail:
          'High lipophilicity and extensive plasma protein binding; distributes into the central nervous system and accumulates at presynaptic serotonergic terminals in cortex, hippocampus and raphe projection fields.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Blocks the serotonin transporter',
        laymanDesc:
          'It plugs the pump that normally sucks serotonin back into the nerve cell after release, so the messenger stays in the gap between cells for longer.',
        molecularDetail:
          'Binds the central substrate site of SLC6A4, the sodium- and chloride-dependent serotonin transporter, preventing reuptake of 5-HT from the synaptic cleft. Occupancy is essentially complete at therapeutic doses within hours of the first dose.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Autoreceptors desensitise over weeks',
        laymanDesc:
          'At first the brain compensates by turning down serotonin release. Over a few weeks that brake wears off, which is the usual explanation for why the pills take weeks to work.',
        molecularDetail:
          'Acutely, raised 5-HT at somatodendritic 5-HT1A autoreceptors in the raphe suppresses cell firing. With continued exposure those autoreceptors desensitise, firing recovers, and net forebrain serotonergic transmission rises. Downstream changes in BDNF signalling and adult hippocampal neurogenesis have been proposed but are not established in humans.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptom scores fall, on average, by a contested amount',
        laymanDesc:
          'Across hundreds of trials, depression and anxiety scores fall more than on a dummy pill. How much more, and for whom, is the part that is still argued about.',
        molecularDetail:
          'The measurable endpoint is a rating-scale score, not a biological marker. Response odds ratio against placebo across the network was in the range reported by Cipriani et al.; PANDA found no six-week PHQ-9 separation in unselected primary care while finding anxiety and quality-of-life separation.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cipriani network meta-analysis (522 trials pooled)',
        phase: 'Systematic review and network meta-analysis',
        sampleSize: 116477,
        primaryEndpoint: 'Response rate (at least 50% symptom reduction) at 8 weeks versus placebo',
        endpointMet: true,
        statisticalPValue:
          'Odds ratios versus placebo ranged 1.37 to 2.13 with credible intervals excluding 1 for all 21 drugs',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PANDA (ISRCTN84544741)',
        phase: 'Pragmatic phase 4 randomised controlled trial',
        sampleSize: 653,
        primaryEndpoint: 'PHQ-9 depressive symptom score 6 weeks after randomisation',
        endpointMet: false,
        statisticalPValue: 'P = 0.41 (adjusted proportional difference 0.95, 95% CI 0.85 to 1.07)',
        unreportedAdverseSignals:
          'Seven adverse events in total, four on sertraline and three on placebo; three serious, two of them on sertraline, one judged possibly related.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'SADHART',
        phase: 'Phase 4 safety and efficacy trial',
        sampleSize: 369,
        primaryEndpoint: 'Change from baseline in left ventricular ejection fraction at 16 weeks',
        endpointMet: true,
        statisticalPValue:
          'All cardiac safety comparisons non-significant (P >= .05); CGI-I responder rate 67% vs 53%, P = .01',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Superiority over placebo on response rate in a network of 522 randomised trials and 116,477 participants',
        'No significant effect on left ventricular ejection fraction, VPC runs or QTc in 369 patients after acute coronary syndrome',
        'Discontinuation symptoms in 31% after stopping an antidepressant versus 17% after stopping placebo, an 8 percentage-point randomised difference',
        'No six-week PHQ-9 separation from placebo in 550 unselected UK primary-care patients',
      ],
      unsupportedInferences: [
        'That depression involves a serotonin deficiency that sertraline corrects — the umbrella review found no consistent biomarker evidence, and the efficacy trials never measured serotonin',
        "That STAR*D's 67% cumulative remission rate is an antidepressant effect, when the study had no placebo comparator",
        'That the average trial effect, drawn from populations selected for at least moderate severity, transfers unchanged to mild depression',
      ],
      whatFailedInitially: [
        'PANDA: primary endpoint missed at six weeks in the largest primary-care randomised trial of the drug',
        'HAM-D did not separate from placebo in the full SADHART sample, only in the pre-specified severe and recurrent subgroups',
      ],
      realWorldOutcome: [
        'Sertraline sits in the top tier of the Cipriani network on the joint criterion of efficacy and acceptability, which is why it is a common first choice',
        'PANDA changed UK guidance conversations by showing benefit in anxiety and self-rated mental health in patients who would not have qualified for a registration trial',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and oral solution, once daily',
      description:
        'Immediate-release tablets and an oral concentrate. Absorption is increased by food. Steady state is reached in about a week, so both benefit and side effects are judged over weeks rather than days.',
      safetyProfile:
        'The US label carries a boxed warning for increased risk of suicidal thoughts and behaviours in children, adolescents and young adults up to age 24. Common adverse effects are nausea, diarrhoea, insomnia and sexual dysfunction. Serotonin syndrome is a risk in combination with other serotonergic drugs including MAO inhibitors, which are contraindicated. Hyponatraemia occurs more often in older patients.',
    },
    commonQuestions: [
      {
        q: 'If depression is not caused by low serotonin, why does an SSRI work at all?',
        a: 'Because those are two different questions. The umbrella review looked for evidence that depressed people have low serotonin and did not find it. The trials looked at whether people given the drug improved more than people given a placebo, and found that they did. A drug can change a symptom without the target being the cause of the disease — aspirin relieves headache without headaches being caused by a prostaglandin deficiency. What sertraline actually does downstream of the transporter, and why it takes weeks, is not settled.',
        auditNote:
          'This page cites both Moncrieff et al. and the 35-author reply from Jauhar et al. deliberately. The state of this field is a live disagreement, not a settled result in either direction.',
      },
      {
        q: 'PANDA found nothing at six weeks. Should I not bother?',
        a: 'PANDA measured one thing at one time point in one population. Its primary endpoint — PHQ-9 at six weeks in patients recruited without a diagnostic threshold — did not separate from placebo. Its secondary outcomes did: anxiety symptoms, mental health-related quality of life and self-reported improvement all favoured sertraline, and the authors saw weak evidence of a depressive effect by 12 weeks. The trial authors themselves concluded that their findings support prescribing to a wider group than previously thought. It is a real negative result on a real endpoint, and it is not the whole picture.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost-of-production figure for sertraline could be verified and cited. The published cost-of-production literature — Hill, Barber and Gotham in BMJ Global Health, Barber and colleagues in JAMA Network Open — reports aggregate ranges or holds per-drug figures in supplementary appendices this file could not check line by line. Estimating one here would mean this page inventing a number. What is shown instead is the actual United States pharmacy acquisition cost from the CMS NADAC file, which is a price and not a cost of manufacture.',
      },
      {
        q: 'How dangerous is stopping?',
        a: 'The best pooled estimate is that about 31 people in 100 get at least one discontinuation symptom, against 17 in 100 who stop a placebo, so roughly 8 in 100 of those symptoms are attributable to the drug in randomised comparisons. Severe symptoms were about 2.8% against 0.6% on placebo. Sertraline has a moderate half-life, so it sits in the middle of the class — venlafaxine and paroxetine are worse, fluoxetine is better. Tapering rather than stopping abruptly is the standard advice and costs nothing.',
        auditNote:
          'The 31% headline is widely quoted without the placebo arm. The placebo arm is the reason the headline overstates the drug-attributable rate by roughly four-fold.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cipriani A et al. Comparative efficacy and acceptability of 21 antidepressant drugs for the acute treatment of adults with major depressive disorder. Lancet 2018;391:1357-1366',
        identifier: '10.1016/S0140-6736(17)32802-7',
        kind: 'doi',
      },
      {
        label:
          'Lewis G et al. The clinical effectiveness of sertraline in primary care (PANDA). Lancet Psychiatry 2019;6:903-914',
        identifier: '10.1016/S2215-0366(19)30366-9',
        kind: 'doi',
      },
      {
        label:
          'Moncrieff J et al. The serotonin theory of depression: a systematic umbrella review of the evidence. Mol Psychiatry 2023;28:3243-3256',
        identifier: '10.1038/s41380-022-01661-0',
        kind: 'doi',
      },
      {
        label:
          'Jauhar S et al. A leaky umbrella has little value: evidence clearly indicates the serotonin system is implicated in depression. Mol Psychiatry 2023;28:3149-3152',
        identifier: '10.1038/s41380-023-02095-y',
        kind: 'doi',
      },
      {
        label:
          'Kirsch I et al. Initial severity and antidepressant benefits: a meta-analysis of data submitted to the FDA. PLoS Med 2008;5:e45',
        identifier: '10.1371/journal.pmed.0050045',
        kind: 'doi',
      },
      {
        label:
          'Glassman AH et al. Sertraline treatment of major depression in patients with acute MI or unstable angina (SADHART). JAMA 2002;288:701-709',
        identifier: '10.1001/jama.288.6.701',
        kind: 'doi',
      },
      {
        label:
          'Henssler J et al. Incidence of antidepressant discontinuation symptoms: a systematic review and meta-analysis. Lancet Psychiatry 2024;11:526-535',
        identifier: '10.1016/S2215-0366(24)00133-0',
        kind: 'doi',
      },
      {
        label:
          'Rush AJ et al. Acute and longer-term outcomes in depressed outpatients requiring one or several treatment steps: a STAR*D report. Am J Psychiatry 2006;163:1905-1917',
        identifier: '10.1176/ajp.2006.163.11.1905',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA: ZOLOFT (sertraline hydrochloride), NDA 019839, approved 30 December 1991',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019839',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 68617 — sertraline structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/68617',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 2. Escitalopram
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'escitalopram',
    name: 'Escitalopram',
    tradeName: 'Lexapro / Cipralex',
    sponsor: 'H. Lundbeck, co-developed and marketed in the US by Forest Laboratories',
    targetGene: 'SLC6A4',
    targetProtein: 'Sodium-dependent serotonin transporter (SERT, 5-HTT)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2002,
    indication:
      'Major depressive disorder in adults and in patients aged 12 and older; generalised anxiety disorder in adults and in patients aged 7 and older',
    patientFriendlyIndication: 'Depression and generalised anxiety',
    anatomicalSite: 'Presynaptic serotonergic terminals, raphe nuclei and cortical projections',
    conditionContext: {
      conditionExplainer:
        'Escitalopram is the single active half of citalopram. Citalopram is a racemate — a 50:50 mixture of two mirror-image molecules — and only the S-enantiomer blocks the serotonin transporter with high affinity.',
      whyItMatters:
        'Isolating the active enantiomer of an existing drug is a legitimate pharmacological step and also a well-known way to extend a franchise past patent expiry. Both things are true here, and the evidence has to be read knowing that.',
      whoTakesThis:
        'Adults with major depression or generalised anxiety disorder, adolescents aged 12 and older with depression, and children aged 7 and older with generalised anxiety disorder.',
      clinicalGoals:
        'Symptom reduction on HAM-D, MADRS or HAM-A, at the lowest dose that achieves it — the dose-response work shows nothing is gained above the low end of the licensed range.',
    },
    oneSentenceVerdict:
      'The isolated active enantiomer of citalopram, ranked with sertraline in the top tier of the 21-drug antidepressant network on efficacy and acceptability, and licensed on a chemistry argument that was contested in print from the year it launched.',
    laymanHowItWorks:
      'Citalopram is a mixture of two molecules that are mirror images of each other, like a left and right hand. Only the left-handed one blocks the serotonin pump; the right-handed one does very little. Escitalopram is that mixture with the inactive hand removed. Beyond that it works exactly like any other SSRI: it plugs the pump that clears serotonin out of the gap between nerve cells.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 70,
    substitutes: {
      summary:
        'Generic citalopram contains the same active molecule mixed with its inactive twin and costs about the same. Sertraline shares the top tier of the network meta-analysis. Talking therapy has comparable evidence in moderate depression and nothing to taper.',
      conventionalRx: [
        {
          name: 'Citalopram (generic)',
          class: 'Racemic selective serotonin reuptake inhibitor',
          howItCompares:
            'Contains escitalopram plus the R-enantiomer. Whether the R-enantiomer is inert, or actively interferes with the S-enantiomer as Lundbeck argued, is the crux of the escitalopram case and was contested from 2003 onwards.',
          typicalCost:
            'Comparable to escitalopram at generic pharmacy acquisition cost; both are pennies per tablet',
          prosAndCons:
            'Pros: same active molecule, decades of use. Cons: FDA restricted the maximum dose in 2011 over dose-dependent QT prolongation.',
        },
        {
          name: 'Sertraline',
          class: 'Selective serotonin reuptake inhibitor',
          howItCompares:
            'The other SSRI in the top tier of the Cipriani network on the joint efficacy and acceptability criterion.',
          typicalCost:
            'US$0.039 per 50 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 17 Dec 2025)',
          prosAndCons:
            'Pros: no meaningful QT signal, broad indication list. Cons: more CYP2D6 interaction, more gastrointestinal upset early on.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask what dose the evidence supports, not what dose is licensed',
          action:
            'Discuss whether a dose increase is likely to add benefit before accepting one.',
          patientImpact:
            'The dose-response meta-analysis of 77 studies and 19,364 participants found SSRI efficacy rising to roughly 20 to 40 mg fluoxetine equivalents and then flat to declining, while dropouts from adverse effects rose steeply across the whole range.',
          clinicalPrecaution:
            'This is a population-level dose-response curve. It does not mean an individual never benefits from a higher dose, and dose changes belong with a prescriber.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(C)CCC[C@@]1(C2=C(CO1)C=C(C=C2)C#N)C3=CC=C(C=C3)F',
      chemicalFormula: 'C20H21FN2O',
      molecularWeight: '324.4 g/mol (free base); the marketed salt is escitalopram oxalate',
      targetReceptorAffinity:
        'The most selective SSRI for SERT over the norepinephrine and dopamine transporters; negligible affinity for muscarinic, histaminergic and adrenergic receptors',
      structureSource: {
        label: 'PubChem CID 146570 (escitalopram) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/146570',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'esci-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the racemic diol intermediate',
          description:
            'Confirm identity and achiral purity of the racemic 4-[4-(dimethylamino)-1-(4-fluorophenyl)-1-hydroxybutyl]-3-(hydroxymethyl)benzonitrile diol before resolution. Impurities carried into the resolution co-crystallise and destroy the enantiomeric excess.',
          reagentsAndBuffer:
            'Racemic diol reference standard, reversed-phase HPLC with UV at 240 nm, 1H and 13C NMR, Karl Fischer titration',
        },
        {
          id: 'esci-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Diastereomeric resolution and stereospecific ring closure',
          description:
            'Resolve the diol as its (+)-di-p-toluoyl-D-tartaric acid salt to isolate the S-configured alcohol, then close the dihydrofuran ring by activating the primary hydroxyl and displacing it intramolecularly. The ring closure proceeds with inversion at the activated centre and retention at the quaternary carbon, which is what fixes the S configuration in the product.',
          dependsOnStepId: 'esci-w1',
          reagentsAndBuffer:
            '(+)-di-p-toluoyl-D-tartaric acid in acetone or toluene; methanesulfonyl chloride with triethylamine in dichloromethane for activation; aqueous base for the cyclisation',
        },
        {
          id: 'esci-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Oxalate salt crystallisation and enantiomeric excess assay',
          description:
            'Crystallise the oxalate salt from ethanol or acetone and confirm enantiomeric excess by chiral HPLC. Residual R-enantiomer is the specification that separates escitalopram from citalopram, so it is the number that defines the product.',
          dependsOnStepId: 'esci-w2',
          reagentsAndBuffer:
            'Oxalic acid in ethanol; recrystallisation from ethanol/water; chiral stationary-phase HPLC (amylose or cellulose carbamate) with UV detection',
        },
        {
          id: 'esci-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'SERT-expressing cell preparation with an R-enantiomer control arm',
          description:
            'Express human SLC6A4 in HEK293 cells and prepare parallel plates for escitalopram, R-citalopram and the racemate, so the contribution of the R-enantiomer is measured rather than assumed.',
          dependsOnStepId: 'esci-w3',
          reagentsAndBuffer:
            'HEK293 cells stably expressing human SLC6A4, DMEM with 10% fetal bovine serum, geneticin selection, R-citalopram and racemic citalopram reference standards',
        },
        {
          id: 'esci-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Uptake inhibition across the three test articles',
          description:
            'Measure tritiated serotonin uptake inhibition for S-, R- and racemic citalopram in the same run, and derive the IC50 ratio directly. Running them separately on different days is how the enantiomer question stayed arguable for two decades.',
          dependsOnStepId: 'esci-w4',
          reagentsAndBuffer:
            '[3H]-5-hydroxytryptamine, Krebs-HEPES buffer with ascorbate and pargyline, filter harvest onto glass-fibre mats, liquid scintillation counting',
        },
      ],
    },
    keyAudits: [
      {
        id: 'esci-a1',
        category: 'measured',
        title: 'Top-tier ranking in the 21-drug network on efficacy and acceptability together',
        laymanSummary:
          'In the largest comparison of antidepressants ever assembled, escitalopram was in the small group that combined better-than-average results with better-than-average tolerability.',
        technicalDetails:
          'Cipriani et al. pooled 522 double-blind randomised trials and 116,477 participants across 21 antidepressants, with response rate as the efficacy primary and all-cause discontinuation as the acceptability primary. All 21 drugs beat placebo on efficacy; escitalopram was among those with both a favourable efficacy odds ratio and favourable acceptability. Certainty of evidence was rated moderate to very low across most comparisons, and the ranking is a network estimate, not a head-to-head result.',
        evidenceSource: 'Cipriani A et al., Lancet 2018;391:1357-1366',
        doi: '10.1016/S0140-6736(17)32802-7',
        measuredMetric: 'Response rate odds ratio and all-cause discontinuation odds ratio',
        auditFlag: 'verified',
      },
      {
        id: 'esci-a2',
        category: 'conclusion_shift',
        title: 'The "chiral chimera" objection was published the year escitalopram launched',
        laymanSummary:
          'From 2003 onwards, pharmacologists argued in print that separating out the active half of citalopram was a commercial move dressed as a scientific advance, because the comparisons used to prove superiority were not fair.',
        technicalDetails:
          'Svensson and Mansfield set out the objection in Psychotherapy and Psychosomatics: the claimed superiority of escitalopram over citalopram rested on comparisons in which escitalopram was tested at doses that were not milligram-equivalent to the citalopram comparator, on manufacturer-sponsored analyses, and on a mechanism — allosteric interference by the R-enantiomer — that was proposed rather than demonstrated in humans. Later independent reanalyses reached mixed conclusions. This is a dispute about the increment over the racemate, not about whether escitalopram works.',
        evidenceSource:
          'Svensson S, Mansfield PR. Escitalopram: superior to citalopram or a chiral chimera? Psychother Psychosom 2003',
        doi: '10.1159/000074435',
        inferredClaim:
          'That escitalopram is meaningfully superior to milligram-equivalent citalopram, rather than being the same active molecule delivered without its inactive partner',
        auditFlag: 'contested',
      },
      {
        id: 'esci-a3',
        category: 'measured',
        title: 'Adolescent depression: a 3.3-point CDRS-R separation in 312 patients',
        laymanSummary:
          'In the trial that supported the teenage indication, depression scores fell about three points further on escitalopram than on placebo over eight weeks, on a scale that runs from 17 to 113.',
        technicalDetails:
          'Emslie et al. randomised adolescents aged 12 to 17; 259 of 312 completed eight weeks of double-blind treatment. Baseline Children\'s Depression Rating Scale-Revised was 57.6 on escitalopram and 56.0 on placebo. Change at endpoint was -22.1 versus -18.8 (p=0.022, last observation carried forward). Discontinuation for adverse events was 2.6% versus 0.6%; serious adverse events 2.6% versus 1.3%; suicidality incidence similar between groups. The FDA granted the adolescent MDD indication on this evidence base.',
        evidenceSource: 'Emslie GJ et al., J Am Acad Child Adolesc Psychiatry 2009;48:721-729',
        doi: '10.1097/CHI.0b013e3181a2b304',
        measuredMetric: 'Change in CDRS-R total score at 8 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'esci-a4',
        category: 'failed',
        title: 'The paediatric citalopram trial behind the franchise was misreported, and court documents proved it',
        laymanSummary:
          'The children\'s trial of citalopram — escitalopram\'s parent drug — was published as positive. Litigation documents later showed the protocol-specified outcome had shown no difference from placebo.',
        technicalDetails:
          'Jureidini, Amsterdam and McHenry reconstructed the CIT-MD-18 paediatric depression trial from documents produced in litigation. They found efficacy and safety data inconsistent with the protocol criteria; unreported procedural deviations that conferred statistical significance on the primary outcome; an implausible claimed effect size; post-hoc positive measures introduced and negative secondary outcomes omitted; adverse events analysed misleadingly; and manuscript drafts prepared by company employees and outside ghostwriters with academic researchers solicited as authors. Their conclusion was that protocol-specified outcomes showed no statistically significant difference between citalopram and placebo. Forest Laboratories, escitalopram\'s US marketer, resolved related federal charges in 2010.',
        evidenceSource: 'Jureidini JN, Amsterdam JD, McHenry LB. Int J Risk Saf Med 2016;28:33-43',
        doi: '10.3233/JRS-160671',
        auditFlag: 'caution',
      },
      {
        id: 'esci-a5',
        category: 'inferred',
        title: 'Higher doses buy tolerability problems, not extra efficacy',
        laymanSummary:
          'Across 77 studies, SSRI benefit stopped increasing near the bottom of the licensed dose range while side-effect dropouts kept climbing all the way up it.',
        technicalDetails:
          'Furukawa et al. dose-response meta-analysis, 77 studies, 19,364 participants. For SSRIs (99 treatment groups) the dose-efficacy curve rose gradually to between 20 and 40 mg fluoxetine equivalents and was then flat to decreasing through the higher licensed doses up to 80 mg equivalents. Dropouts due to adverse effects increased steeply across the examined range, and optimal acceptability sat in the lower licensed range. The routine clinical inference that a partial responder should be titrated upward is not supported by this curve at the population level.',
        evidenceSource: 'Furukawa TA et al., Lancet Psychiatry 2019;6:601-609',
        doi: '10.1016/S2215-0366(19)30217-2',
        inferredClaim:
          'That increasing the dose of an SSRI in a partial responder increases the chance of response',
        auditFlag: 'caution',
      },
      {
        id: 'esci-a6',
        category: 'conclusion_shift',
        title: 'The serotonin-deficiency account is not supported, and the trial results are unchanged',
        laymanSummary:
          'The explanation given to patients for decades — that the drug corrects a chemical imbalance — has no consistent biomarker evidence behind it. That does not undo the trial results, and the trials never measured serotonin.',
        technicalDetails:
          'Moncrieff et al.\'s umbrella review of 17 studies found no consistent association between depression and serotonin metabolite concentrations, 5-HT1A binding, SERT binding, or SERT genetics, and reported evidence that lowered plasma serotonin was associated with antidepressant use rather than with depression. Jauhar et al., for 35 co-authors, argued the conclusion was overstated on methodological and interpretive grounds, particularly regarding tryptophan depletion and molecular imaging. Both papers are about pathophysiology. Neither reanalyses an escitalopram trial.',
        evidenceSource:
          'Moncrieff J et al., Mol Psychiatry 2023;28:3243-3256; Jauhar S et al., Mol Psychiatry 2023;28:3149-3152',
        doi: '10.1038/s41380-022-01661-0',
        inferredClaim:
          'That escitalopram corrects a measurable serotonin deficiency in depressed patients',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Once-daily tablet, absorbed independently of food',
        laymanDesc:
          'One tablet a day. Food does not meaningfully change how much is absorbed, and the level in the blood stops rising after about a week.',
        molecularDetail:
          'Oral bioavailability around 80%, absorption unaffected by food, terminal half-life of roughly 27 to 32 hours giving steady state in about a week. Metabolised by CYP2C19 and CYP3A4 to weakly active demethyl metabolites.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters the brain as a single enantiomer',
        laymanDesc:
          'Unlike citalopram, what arrives at the nerve terminals is only the active mirror-image form.',
        molecularDetail:
          'Crosses the blood-brain barrier and distributes to serotonergic projection fields. The R-enantiomer present in racemic citalopram is absent, which is the entire pharmacological difference between the two products.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Occupies the serotonin transporter',
        laymanDesc:
          'It blocks the pump that clears serotonin out of the gap between nerve cells, so the messenger lingers.',
        molecularDetail:
          'Binds the primary substrate site of SLC6A4. Escitalopram is the most SERT-selective of the SSRIs, with negligible activity at norepinephrine and dopamine transporters and at muscarinic, histaminergic and adrenergic receptors — which is why its side-effect profile is narrower than the older tricyclics.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Autoreceptor adaptation over weeks',
        laymanDesc:
          'The immediate effect is blocked within hours, but the mood change takes weeks, which points at slower adaptation rather than at a topped-up chemical.',
        molecularDetail:
          'Somatodendritic 5-HT1A autoreceptor desensitisation over two to four weeks releases the acute brake on raphe firing, raising net forebrain serotonergic transmission. The link from that adaptation to symptom change remains a hypothesis.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Rating-scale scores fall',
        laymanDesc:
          'The endpoint in every trial is a questionnaire score, not a laboratory value.',
        molecularDetail:
          'Efficacy is measured as MADRS, HAM-D, HAM-A or CDRS-R change. In the adolescent trial the separation was 3.3 CDRS-R points; in the adult network the estimate is an odds ratio on response rate.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cipriani network meta-analysis (522 trials pooled)',
        phase: 'Systematic review and network meta-analysis',
        sampleSize: 116477,
        primaryEndpoint: 'Response rate at 8 weeks and all-cause discontinuation',
        endpointMet: true,
        statisticalPValue:
          'All 21 drugs superior to placebo on efficacy with credible intervals excluding 1',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Emslie 2009 adolescent MDD trial',
        phase: 'Phase 3',
        sampleSize: 312,
        primaryEndpoint: 'Change in CDRS-R total score at 8 weeks',
        endpointMet: true,
        statisticalPValue: 'P = 0.022 (-22.1 vs -18.8, last observation carried forward)',
        unreportedAdverseSignals:
          'Discontinuation for adverse events 2.6% vs 0.6%; serious adverse events 2.6% vs 1.3%; suicidality incidence reported as similar between groups.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Furukawa dose-response meta-analysis',
        phase: 'Dose-response systematic review and meta-analysis',
        sampleSize: 19364,
        primaryEndpoint: 'Dose-efficacy and dose-acceptability curves for SSRIs',
        endpointMet: true,
        statisticalPValue:
          'Efficacy plateaued at 20-40 mg fluoxetine equivalents; results robust to several sensitivity analyses',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Superiority over placebo on response rate within the 522-trial, 116,477-participant network',
        'A 3.3-point CDRS-R separation from placebo at 8 weeks in 312 adolescents (p=0.022)',
        'A flat-to-declining SSRI dose-efficacy curve above 20-40 mg fluoxetine equivalents, with steeply rising adverse-effect dropouts',
      ],
      unsupportedInferences: [
        'That escitalopram is superior to milligram-equivalent racemic citalopram — the comparisons behind that claim were contested from 2003 and the allosteric mechanism proposed for it was never demonstrated in humans',
        'That titrating a partial responder to a higher dose improves the odds of response',
        'That the drug corrects a serotonin deficiency, an explanation the biomarker literature does not support',
      ],
      whatFailedInitially: [
        'CIT-MD-18, the paediatric trial of the parent drug citalopram, showed no significant difference from placebo on its protocol-specified outcome; the published article reported it as positive, and litigation documents showed how',
      ],
      realWorldOutcome: [
        'Escitalopram is among the most prescribed antidepressants worldwide and is generic in every major market',
        'The dose-response finding has moved guidance toward starting and staying low rather than titrating on principle',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and oral solution, once daily',
      description:
        'Immediate-release tablets and an oral solution. Absorption is not affected by food. The long half-life means a missed dose is forgiving and abrupt cessation still produces discontinuation symptoms.',
      safetyProfile:
        'The US label carries a boxed warning for increased suicidal thinking and behaviour in children, adolescents and young adults up to age 24. Common adverse effects are nausea, insomnia, somnolence, increased sweating and sexual dysfunction. Dose-dependent QT prolongation is a class concern that led the FDA to restrict maximum citalopram dosing in 2011; escitalopram labelling carries QT precautions. Hyponatraemia and serotonin syndrome are recognised risks.',
    },
    commonQuestions: [
      {
        q: 'Is escitalopram actually better than plain citalopram?',
        a: 'That is the contested question, and it has been contested since the year escitalopram launched. Escitalopram is the active half of citalopram, so 10 mg of escitalopram contains as much active molecule as roughly 20 mg of citalopram. Whether the removed R-enantiomer is merely inert or actively interferes — Lundbeck argued allosteric interference — was never demonstrated in humans, and Svensson and Mansfield laid out in 2003 why the superiority comparisons were not fair ones. What is not in dispute is that escitalopram works: it is in the top tier of the 21-drug network.',
        auditNote:
          'This page records the objection rather than resolving it, because the primary literature does not resolve it.',
      },
      {
        q: 'The teenage indication came from one trial. Is that enough?',
        a: 'The registration evidence for adolescent major depression is thin by adult standards: an 8-week trial in 312 patients with a 3.3-point separation on a 17-to-113 scale, p=0.022. That is a real result and a small one. It sits next to the history of the parent drug\'s paediatric trial, CIT-MD-18, whose protocol-specified outcome showed no difference from placebo while the published paper concluded the opposite. Both facts belong on the same page.',
        auditNote:
          'Reading the adolescent evidence base without the CIT-MD-18 reconstruction gives a misleadingly clean picture of how this indication was built.',
      },
      {
        q: 'Should I go up to a higher dose if 10 mg is not enough?',
        a: 'The population-level evidence says higher doses of SSRIs do not add efficacy and do add dropouts. Furukawa and colleagues pooled 77 studies and 19,364 participants and found the SSRI dose-efficacy curve flattening between 20 and 40 mg fluoxetine equivalents, with adverse-effect dropouts rising steeply across the whole licensed range. That is an average across a population, not a rule about you, and dose decisions belong with a prescriber. But the reflex to titrate upward is not supported by the curve.',
      },
      {
        q: 'Why does this page not show a manufacturing cost?',
        a: 'Because no verifiable per-dose cost-of-production figure for escitalopram could be cited. Published cost-of-production research exists for classes of medicines but this file could not check a per-drug figure for escitalopram line by line, and estimating one would mean inventing a number. Actual pharmacy acquisition costs from the CMS NADAC file are shown instead: about 4.3 US cents per 10 mg tablet, which is a price and not a cost of manufacture.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cipriani A et al. Comparative efficacy and acceptability of 21 antidepressant drugs. Lancet 2018;391:1357-1366',
        identifier: '10.1016/S0140-6736(17)32802-7',
        kind: 'doi',
      },
      {
        label:
          'Svensson S, Mansfield PR. Escitalopram: superior to citalopram or a chiral chimera? Psychother Psychosom 2003;72:177-179',
        identifier: '10.1159/000074435',
        kind: 'doi',
      },
      {
        label:
          'Emslie GJ et al. Escitalopram in the treatment of adolescent depression: a randomized placebo-controlled multisite trial. J Am Acad Child Adolesc Psychiatry 2009;48:721-729',
        identifier: '10.1097/CHI.0b013e3181a2b304',
        kind: 'doi',
      },
      {
        label:
          'Jureidini JN, Amsterdam JD, McHenry LB. The citalopram CIT-MD-18 pediatric depression trial: deconstruction of medical ghostwriting, data mischaracterisation and academic malfeasance. Int J Risk Saf Med 2016;28:33-43',
        identifier: '10.3233/JRS-160671',
        kind: 'doi',
      },
      {
        label:
          'Furukawa TA et al. Optimal dose of SSRIs, venlafaxine and mirtazapine in major depression: a dose-response meta-analysis. Lancet Psychiatry 2019;6:601-609',
        identifier: '10.1016/S2215-0366(19)30217-2',
        kind: 'doi',
      },
      {
        label:
          'Moncrieff J et al. The serotonin theory of depression: a systematic umbrella review. Mol Psychiatry 2023;28:3243-3256',
        identifier: '10.1038/s41380-022-01661-0',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA: LEXAPRO (escitalopram oxalate), NDA 021323, approved 14 August 2002',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021323',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 146570 — escitalopram structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/146570',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 3. Bupropion
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'bupropion',
    name: 'Bupropion',
    tradeName: 'Wellbutrin / Zyban',
    sponsor: 'Burroughs Wellcome, later GlaxoSmithKline',
    targetGene: 'SLC6A3',
    targetProtein:
      'Dopamine transporter (DAT) and norepinephrine transporter (NET), plus non-competitive antagonism at nicotinic acetylcholine receptors',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1985,
    indication:
      'Major depressive disorder, seasonal affective disorder, and as a smoking cessation aid (marketed as Zyban)',
    patientFriendlyIndication: 'Depression, and help with quitting smoking',
    anatomicalSite:
      'Dopaminergic and noradrenergic terminals in prefrontal cortex and striatum; nicotinic receptors in ventral tegmental area',
    conditionContext: {
      conditionExplainer:
        'Bupropion is the only widely used antidepressant that leaves serotonin alone. It works on dopamine and norepinephrine instead, and separately blocks the nicotinic receptor that nicotine acts on.',
      whyItMatters:
        'The commonest reason people abandon an SSRI is sexual dysfunction, which is a serotonergic effect. A drug that treats depression without touching serotonin is not a marginal alternative; for some patients it is the only tolerable one.',
      whoTakesThis:
        'Adults with major depression, particularly where sexual side effects or sedation have been a problem; adults with seasonal affective disorder; and people trying to stop smoking.',
      clinicalGoals:
        'Symptom reduction without the serotonergic side-effect burden, or sustained abstinence from smoking at six months and beyond.',
    },
    oneSentenceVerdict:
      'The antidepressant that skips serotonin entirely, with high-certainty Cochrane evidence that it raises long-term smoking quit rates by 64% — and a seizure risk that forced a dose ceiling, a generic that failed bioequivalence, and a cardiovascular outcome trial terminated for leaked interim data.',
    laymanHowItWorks:
      'Most antidepressants act on serotonin. Bupropion does not. It slows the removal of two other messengers, dopamine and norepinephrine, from the gaps between nerve cells. Separately, it plugs the receptor that nicotine binds to, which is why the same molecule sold under a different name helps people stop smoking: the cigarette stops delivering as much of a reward.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 74,
    substitutes: {
      summary:
        'For depression, every SSRI has more evidence in anxiety disorders and none has bupropion\'s freedom from sexual side effects. For smoking cessation, varenicline beat bupropion head to head in EAGLES and in the Cochrane review, and nicotine replacement matched it.',
      conventionalRx: [
        {
          name: 'Varenicline',
          class: 'Partial agonist at the alpha-4 beta-2 nicotinic receptor',
          howItCompares:
            'Beat bupropion directly in EAGLES (odds ratio 1.75, 95% CI 1.52 to 2.01) and in the Cochrane comparison (RR 0.71 favouring varenicline, 6 studies, 6,286 participants).',
          typicalCost: 'Not priced here — no verifiable current acquisition cost quoted for this page',
          prosAndCons:
            'Pros: the most effective single agent for smoking cessation. Cons: nausea in a quarter of users; its own neuropsychiatric boxed warning was removed in 2016 on the strength of EAGLES.',
        },
        {
          name: 'Nicotine replacement therapy (patch, gum, lozenge)',
          class: 'Nicotinic receptor agonist replacement',
          howItCompares:
            'No difference from bupropion on quit rates in the Cochrane comparison (RR 0.99, 95% CI 0.91 to 1.09; 10 studies, 8,230 participants), and available without prescription.',
          typicalCost: 'Not priced here — over-the-counter pricing varies widely by country and format',
          prosAndCons:
            'Pros: equal efficacy to bupropion, no seizure risk, no prescription needed. Cons: requires adherence to a schedule, and local irritation is common.',
        },
        {
          name: 'Sertraline or escitalopram',
          class: 'Selective serotonin reuptake inhibitors',
          howItCompares:
            'Better evidence in anxiety disorders, which bupropion does not treat well and can worsen. Both carry the sexual dysfunction bupropion avoids.',
          typicalCost:
            'US$0.039 per 50 mg sertraline tablet at pharmacy acquisition cost (CMS NADAC, effective 17 Dec 2025)',
          prosAndCons:
            'Pros: broad indication list, no seizure threshold concern. Cons: sexual dysfunction, weight gain, discontinuation symptoms.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Check which formulation you were dispensed',
          action:
            'Confirm whether a prescription is immediate release, sustained release (SR) or extended release (XL), and whether the manufacturer changed at the last refill.',
          patientImpact:
            'Seizure risk with bupropion is dose- and peak-concentration-dependent, so the release profile matters. In 2012 the FDA withdrew one 300 mg generic extended-release product after it failed a bioequivalence study against the reference.',
          clinicalPrecaution:
            'Never take two formulations together, and do not crush or split an extended-release tablet. Formulation changes belong with a prescriber and a pharmacist.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C(=O)C1=CC(=CC=C1)Cl)NC(C)(C)C',
      chemicalFormula: 'C13H18ClNO',
      molecularWeight: '239.74 g/mol (free base); marketed as bupropion hydrochloride',
      targetReceptorAffinity:
        'Relatively weak inhibitor of the dopamine and norepinephrine transporters at the transporter level; the active metabolite hydroxybupropion reaches far higher plasma concentrations than the parent and is a non-competitive nicotinic receptor antagonist',
      structureSource: {
        label: 'PubChem CID 444 (bupropion) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/444',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'bupr-w1',
          stepNumber: 1,
          phase: 'QC',
          name: "Incoming control of 3'-chloropropiophenone and tert-butylamine",
          description:
            "Confirm identity and purity of 3'-chloropropiophenone and of tert-butylamine. Positional chloro isomers in the ketone carry straight through the sequence and cannot be removed at the salt stage.",
          reagentsAndBuffer:
            "3'-chloropropiophenone reference standard, tert-butylamine, gas chromatography with flame ionisation detection, 1H NMR in CDCl3, Karl Fischer titration",
        },
        {
          id: 'bupr-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Alpha-bromination then amination with tert-butylamine',
          description:
            "Brominate the alpha carbon of 3'-chloropropiophenone, then displace the bromide with tert-butylamine to install the hindered secondary amine that defines the molecule. The bulky tert-butyl group is what keeps bupropion off the serotonin transporter.",
          dependsOnStepId: 'bupr-w1',
          reagentsAndBuffer:
            'Bromine in dichloromethane or acetic acid at controlled temperature; excess tert-butylamine in acetonitrile; aqueous workup with sodium bicarbonate',
        },
        {
          id: 'bupr-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride salt formation and residual-solvent control',
          description:
            'Convert the free base to the hydrochloride and recrystallise. Bupropion is thermally labile and hygroscopic as the salt, so the drying step is a specification and not a formality.',
          dependsOnStepId: 'bupr-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol or diethyl ether; recrystallisation from isopropanol; headspace gas chromatography for residual solvents; Karl Fischer for water content',
        },
        {
          id: 'bupr-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Transporter and nicotinic receptor cell systems in parallel',
          description:
            'Prepare HEK293 lines expressing human DAT and NET alongside a line expressing the alpha-4 beta-2 nicotinic acetylcholine receptor, because bupropion has two mechanisms and testing only the transporters describes half the drug.',
          dependsOnStepId: 'bupr-w3',
          reagentsAndBuffer:
            'HEK293 cells with human SLC6A3 or SLC6A2 expression constructs; SH-EP1 or HEK cells expressing alpha-4 beta-2 nAChR; DMEM with 10% fetal bovine serum and selection antibiotic',
        },
        {
          id: 'bupr-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Uptake inhibition and nicotinic antagonism, parent versus hydroxybupropion',
          description:
            'Measure dopamine and norepinephrine uptake inhibition and nicotinic receptor antagonism for bupropion and for hydroxybupropion side by side. The metabolite reaches much higher concentrations in patients than the parent, so a potency measured only on the parent misrepresents the clinical pharmacology.',
          dependsOnStepId: 'bupr-w4',
          reagentsAndBuffer:
            '[3H]-dopamine and [3H]-norepinephrine, Krebs-HEPES uptake buffer with ascorbate and pargyline, rubidium-86 efflux or calcium-flux readout for nAChR function, hydroxybupropion reference standard',
        },
      ],
    },
    keyAudits: [
      {
        id: 'bupr-a1',
        category: 'measured',
        title: 'High-certainty Cochrane evidence: 64% relative increase in long-term quit rates',
        laymanSummary:
          'Across 45 trials and nearly 18,000 people, bupropion raised the chance of still being off cigarettes six months or more later by about two thirds compared with placebo.',
        technicalDetails:
          'Howes et al. included 115 studies. Bupropion increased long-term smoking cessation with high-certainty evidence: RR 1.64 (95% CI 1.52 to 1.77), I-squared 15%, 45 studies, 17,866 participants. Bupropion was inferior to varenicline (RR 0.71, 95% CI 0.64 to 0.79; 6 studies, 6,286 participants) and no different from nicotine replacement (RR 0.99, 95% CI 0.91 to 1.09; 10 studies, 8,230 participants). Dropouts due to adverse events were higher on bupropion than placebo (RR 1.37, 95% CI 1.21 to 1.56, high certainty).',
        evidenceSource: 'Howes S et al., Cochrane Database Syst Rev 2020;4:CD000031',
        doi: '10.1002/14651858.CD000031.pub5',
        measuredMetric: 'Smoking abstinence at six months or longer, relative risk versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'bupr-a2',
        category: 'conclusion_shift',
        title: 'EAGLES removed the neuropsychiatric boxed warning that the FDA had imposed in 2009',
        laymanSummary:
          'A trial of 8,144 smokers, half of them with a psychiatric diagnosis, found no excess of serious mood or behaviour problems on bupropion compared with placebo or a nicotine patch. The warning came off.',
        technicalDetails:
          'EAGLES (NCT01456936) randomised 8,144 smokers into psychiatric and non-psychiatric cohorts. In the non-psychiatric cohort, moderate-to-severe neuropsychiatric adverse events occurred in 22 of 989 on bupropion (2.2%) versus 24 of 999 on placebo (2.4%); bupropion-placebo risk difference -0.08 (95% CI -1.37 to 1.21). In the psychiatric cohort, 68 of 1,017 (6.7%) versus 50 of 1,015 (4.9%); risk difference 1.78 (-0.24 to 3.81). Bupropion beat placebo on abstinence (OR 2.07, 95% CI 1.75 to 2.45) and lost to varenicline (OR 1.75 favouring varenicline, 1.52 to 2.01). The trial was funded by Pfizer and GlaxoSmithKline, the manufacturers of the two drugs under investigation.',
        evidenceSource: 'Anthenelli RM et al., Lancet 2016;387:2507-2520',
        doi: '10.1016/S0140-6736(16)30272-0',
        measuredMetric:
          'Incidence of moderate-to-severe neuropsychiatric adverse events; continuous abstinence weeks 9-12',
        auditFlag: 'verified',
      },
      {
        id: 'bupr-a3',
        category: 'failed',
        title: 'LIGHT: the cardiovascular outcome trial was terminated after its interim data leaked',
        laymanSummary:
          'A trial testing whether the naltrexone-bupropion weight-loss combination was safe for the heart was stopped early after partial results were made public, and it can no longer answer the question it was designed to answer.',
        technicalDetails:
          'LIGHT (NCT01601704) randomised 8,910 overweight or obese patients at increased cardiovascular risk. At the 25% interim, MACE occurred in 59 placebo patients (1.3%) and 35 on naltrexone-bupropion (0.8%); HR 0.59, 95% CI 0.39 to 0.90. At 50% of planned events the estimate had moved to 102 (2.3%) versus 90 (2.0%); HR 0.88, adjusted 99.7% CI 0.57 to 1.34. Because of unanticipated early termination the pre-specified non-inferiority margin of 1.4 could not be assessed. Nissen et al. concluded that cardiovascular safety remains uncertain and requires a new adequately powered trial. Adverse effects were more common on the combination: gastrointestinal 14.2% versus 1.9% (p<0.001), central nervous system 5.1% versus 1.2% (p<0.001).',
        evidenceSource: 'Nissen SE et al., JAMA 2016;315:990-1004',
        doi: '10.1001/jama.2016.1558',
        measuredMetric: 'Time to first major adverse cardiovascular event',
        auditFlag: 'caution',
      },
      {
        id: 'bupr-a4',
        category: 'failed',
        title: 'A 300 mg generic was withdrawn in 2012 after failing bioequivalence',
        laymanSummary:
          'One generic version of the 300 mg extended-release tablet did not release the drug the same way as the original. The FDA pulled it and changed how it approves generics of this class.',
        technicalDetails:
          'Woodcock, Khan and Yu, writing from the FDA Center for Drug Evaluation and Research, described the withdrawal of budeprion XL 300 mg for non-bioequivalence to the reference bupropion hydrochloride extended-release product. The original approval had relied on bioequivalence data from the 150 mg strength with the 300 mg strength waived by extrapolation; direct study of the 300 mg strength did not meet the standard. This is the reason the bupropion formulation on a prescription is a clinically relevant fact rather than a pharmacy detail.',
        evidenceSource: 'Woodcock J, Khan M, Yu LX. N Engl J Med 2012;367:2463-2465',
        doi: '10.1056/NEJMp1212969',
        auditFlag: 'verified',
      },
      {
        id: 'bupr-a5',
        category: 'inferred',
        title: 'The "no sexual side effects" advantage is real and mostly measured indirectly',
        laymanSummary:
          'Bupropion does not act on serotonin, and serotonin is the pathway behind SSRI sexual dysfunction. The absence of the side effect follows from the mechanism more than from a large dedicated trial programme.',
        technicalDetails:
          'The pharmacological premise is solid: bupropion has no meaningful affinity for the serotonin transporter, and SSRI-associated sexual dysfunction is a serotonergic class effect. The clinical evidence base is smaller and less systematic than the efficacy base — it rests on secondary endpoints and comparative trials rather than on a programme designed around sexual function as a primary outcome. The Cochrane smoking review found bupropion produced more psychiatric adverse events than placebo (RR 1.25, 95% CI 1.15 to 1.37; 6 studies, 4,439 participants), so "better tolerated" is not true across the board.',
        evidenceSource: 'Howes S et al., Cochrane Database Syst Rev 2020;4:CD000031',
        doi: '10.1002/14651858.CD000031.pub5',
        inferredClaim:
          'That bupropion is generally better tolerated than an SSRI, when what is well established is that it avoids one specific serotonergic side effect while adding insomnia, agitation and seizure risk',
        auditFlag: 'caution',
      },
      {
        id: 'bupr-a6',
        category: 'measured',
        title: 'Adult ADHD: a real but modest effect in the Cortese network',
        laymanSummary:
          'In the largest comparison of ADHD medicines, bupropion beat placebo in adults on clinician ratings, but by less than the stimulants did.',
        technicalDetails:
          'Cortese et al. pooled 133 double-blind randomised trials. In adults, on clinician-rated core ADHD symptoms closest to 12 weeks, bupropion gave SMD -0.46 (95% CI -0.85 to -0.07), against -0.79 (-0.99 to -0.58) for amphetamines and -0.49 (-0.64 to -0.35) for methylphenidate. Bupropion is not FDA-approved for ADHD; this is an off-label use with network-level evidence behind it.',
        evidenceSource: 'Cortese S et al., Lancet Psychiatry 2018;5:727-738',
        doi: '10.1016/S2215-0366(18)30269-4',
        measuredMetric: 'Standardised mean difference on clinician-rated ADHD core symptoms in adults',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, then largely converted to something else',
        laymanDesc:
          'Most of what reaches the bloodstream long-term is not bupropion itself but a chemical the liver makes from it.',
        molecularDetail:
          'Extensive hepatic metabolism, principally by CYP2B6, to hydroxybupropion, which circulates at far higher concentrations than the parent and has a longer half-life. Threohydrobupropion and erythrohydrobupropion are also formed. The pharmacology patients experience is largely metabolite pharmacology.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Crosses into the brain',
        laymanDesc:
          'Both the drug and its main breakdown product reach brain tissue.',
        molecularDetail:
          'Bupropion and hydroxybupropion cross the blood-brain barrier and reach dopaminergic and noradrenergic terminal fields in prefrontal cortex, striatum and the ventral tegmental projection system.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Blocks two reuptake pumps, and one receptor',
        laymanDesc:
          'It slows the clearance of dopamine and norepinephrine from the gaps between nerve cells, and separately plugs the receptor nicotine uses.',
        molecularDetail:
          'Inhibits the dopamine transporter (SLC6A3) and norepinephrine transporter (SLC6A2), and acts as a non-competitive antagonist at nicotinic acetylcholine receptors including the alpha-4 beta-2 subtype. The nicotinic action is the mechanistic basis for the smoking cessation indication and is largely attributed to hydroxybupropion.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Catecholamine tone rises; nicotine reward falls',
        laymanDesc:
          'Two effects at once: more of the alerting messengers stay around, and a cigarette delivers less of a kick.',
        molecularDetail:
          'Raised synaptic dopamine and norepinephrine underlie the antidepressant and pro-attentional effects; nicotinic blockade blunts nicotine-evoked dopamine release in the nucleus accumbens, which reduces the reinforcing value of smoking and the intensity of withdrawal.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Mood scores fall, or abstinence holds — and the seizure threshold falls with them',
        laymanDesc:
          'The measurable results are depression scale scores and verified quit rates. The measurable cost is a dose-dependent risk of seizure.',
        molecularDetail:
          'Efficacy endpoints are rating-scale change and biochemically verified continuous abstinence. Seizure risk is dose- and peak-concentration-dependent, which is why the immediate-release ceiling is 450 mg per day in divided doses and why extended-release formulations exist at all.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'EAGLES (NCT01456936)',
        phase: 'Phase 4',
        sampleSize: 8144,
        primaryEndpoint:
          'Incidence of moderate-to-severe neuropsychiatric adverse events in psychiatric and non-psychiatric cohorts',
        endpointMet: true,
        statisticalPValue:
          'Bupropion-placebo risk difference -0.08 (95% CI -1.37 to 1.21) non-psychiatric; 1.78 (-0.24 to 3.81) psychiatric',
        unreportedAdverseSignals:
          'Insomnia was the most frequent adverse event in the bupropion group, 12% of 2,006 participants.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'LIGHT (NCT01601704)',
        phase: 'Phase 3 cardiovascular outcome trial, terminated early',
        sampleSize: 8910,
        primaryEndpoint: 'Time to first major adverse cardiovascular event, non-inferiority margin 1.4',
        endpointMet: false,
        statisticalPValue:
          'HR 0.88 at 50% of planned events (adjusted 99.7% CI 0.57 to 1.34); non-inferiority to a margin of 1.4 could not be assessed',
        unreportedAdverseSignals:
          'Gastrointestinal adverse events 14.2% vs 1.9% and central nervous system symptoms 5.1% vs 1.2%, both P < .001.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Cochrane antidepressants for smoking cessation (bupropion arm)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 17866,
        primaryEndpoint: 'Smoking abstinence at six months or longer',
        endpointMet: true,
        statisticalPValue: 'RR 1.64 (95% CI 1.52 to 1.77), high-certainty evidence',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 64% relative increase in six-month smoking abstinence over placebo, high-certainty, across 45 trials and 17,866 participants',
        'No excess of moderate-to-severe neuropsychiatric events over placebo in 8,144 smokers including 4,116 with a psychiatric diagnosis',
        'Inferiority to varenicline on quit rates (RR 0.71) and equivalence to nicotine replacement (RR 0.99)',
        'A 300 mg generic extended-release product that failed direct bioequivalence testing and was withdrawn',
      ],
      unsupportedInferences: [
        'That naltrexone-bupropion is cardiovascularly safe — LIGHT was terminated before it could assess its own non-inferiority margin',
        'That bupropion is better tolerated than an SSRI overall, when it avoids one serotonergic side effect and adds insomnia, agitation and a dose-dependent seizure risk',
        'That the 150 mg strength bioequivalence of a generic guarantees the 300 mg strength, which is precisely the extrapolation the 2012 withdrawal falsified',
      ],
      whatFailedInitially: [
        'LIGHT terminated after interim results were disclosed, leaving the cardiovascular safety question open',
        'Budeprion XL 300 mg withdrawn in 2012 for non-bioequivalence',
        'The original immediate-release product carried a seizure incidence high enough to require a hard daily dose ceiling and the development of slower-release forms',
      ],
      realWorldOutcome: [
        'EAGLES led to removal of the neuropsychiatric boxed warning that had been applied to bupropion and varenicline for smoking cessation',
        'Bupropion remains the standard choice where SSRI-associated sexual dysfunction is the limiting problem, and is widely used off-label in adult ADHD on the strength of the Cortese network estimate',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet: immediate release, sustained release (SR) and extended release (XL)',
      description:
        'Three release profiles with different dosing schedules. The release profile is clinically relevant rather than cosmetic, because seizure risk tracks peak plasma concentration, and it is why a 300 mg generic that failed bioequivalence was withdrawn rather than relabelled.',
      safetyProfile:
        'The US label carries a boxed warning for suicidal thoughts and behaviours in children, adolescents and young adults. Bupropion is contraindicated in seizure disorders, in patients with current or prior bulimia or anorexia nervosa, and during abrupt discontinuation of alcohol or benzodiazepines, because all raise seizure risk. Common adverse effects are insomnia, dry mouth, headache, agitation and nausea. It should not be combined with MAO inhibitors.',
    },
    commonQuestions: [
      {
        q: 'Is bupropion the same drug as Zyban?',
        a: 'Yes. Wellbutrin and Zyban are the same molecule at overlapping doses, marketed under different names for depression and for smoking cessation. That is a regulatory and commercial arrangement, not a pharmacological difference, and taking both together would be a double dose of the same drug — which matters because seizure risk is dose-dependent.',
      },
      {
        q: 'How real is the seizure risk?',
        a: 'Real enough to have shaped the whole product line. Seizure incidence with bupropion is dose- and peak-concentration-dependent, which is why the immediate-release formulation has a hard daily ceiling in divided doses, why sustained- and extended-release forms were developed, and why the drug is contraindicated in anyone with a seizure disorder, an eating disorder history, or abrupt alcohol or benzodiazepine withdrawal. This page does not quote a single incidence percentage because the figures in circulation come from different formulations, doses and populations.',
        auditNote:
          'A precise per-dose seizure rate would need a specific labelled figure, and this page cites what it can verify rather than a remembered number.',
      },
      {
        q: 'Why was a cardiovascular trial stopped early, and does that mean the drug is dangerous?',
        a: 'It means the question is unanswered, which is a different thing. LIGHT was testing whether the naltrexone-bupropion weight-loss combination was cardiovascularly non-inferior to placebo. Interim results from the first 25% of events were disclosed publicly while the trial was still running; the trial was terminated. The published analysis shows the effect estimate moving from HR 0.59 at 25% of events to HR 0.88 at 50%, and the authors state plainly that non-inferiority to the pre-specified margin of 1.4 could not be assessed and a new trial is needed. No harm signal was demonstrated. No safety was demonstrated either.',
      },
      {
        q: 'Does it work as well as varenicline for quitting?',
        a: 'No, and this has been shown twice. In the Cochrane review, bupropion was inferior to varenicline with a relative risk of 0.71 (95% CI 0.64 to 0.79) across 6 studies and 6,286 participants. In EAGLES, varenicline beat bupropion with an odds ratio of 1.75 (1.52 to 2.01). Bupropion did beat placebo (OR 2.07) and was no different from nicotine replacement (RR 0.99). It is an effective second option, not the best one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Howes S et al. Antidepressants for smoking cessation. Cochrane Database Syst Rev 2020;4:CD000031',
        identifier: '10.1002/14651858.CD000031.pub5',
        kind: 'doi',
      },
      {
        label:
          'Anthenelli RM et al. Neuropsychiatric safety and efficacy of varenicline, bupropion, and nicotine patch in smokers with and without psychiatric disorders (EAGLES). Lancet 2016;387:2507-2520',
        identifier: '10.1016/S0140-6736(16)30272-0',
        kind: 'doi',
      },
      {
        label:
          'Nissen SE et al. Effect of naltrexone-bupropion on major adverse cardiovascular events in overweight and obese patients with cardiovascular risk factors. JAMA 2016;315:990-1004',
        identifier: '10.1001/jama.2016.1558',
        kind: 'doi',
      },
      {
        label:
          'Woodcock J, Khan M, Yu LX. Withdrawal of generic budeprion for nonbioequivalence. N Engl J Med 2012;367:2463-2465',
        identifier: '10.1056/NEJMp1212969',
        kind: 'doi',
      },
      {
        label:
          'Cortese S et al. Comparative efficacy and tolerability of medications for ADHD in children, adolescents, and adults. Lancet Psychiatry 2018;5:727-738',
        identifier: '10.1016/S2215-0366(18)30269-4',
        kind: 'doi',
      },
      {
        label: 'EAGLES: study evaluating the safety and efficacy of varenicline and bupropion for smoking cessation',
        identifier: 'NCT01456936',
        kind: 'nct',
      },
      {
        label: 'LIGHT: cardiovascular outcomes study of naltrexone SR/bupropion SR',
        identifier: 'NCT01601704',
        kind: 'nct',
      },
      {
        label: 'Drugs@FDA: WELLBUTRIN (bupropion hydrochloride), NDA 018644, approved 30 December 1985',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018644',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 444 — bupropion structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/444',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
]
