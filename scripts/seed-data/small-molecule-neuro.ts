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
 *    current evidence does not support the low-serotonin story, while the drugs
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
          typicalCost: '',
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
            "Condense the tetralone with methylamine to the ketimine, then hydrogenate over palladium on carbon. The hydrogenation sets the second stereocentre and favours the cis diastereomer that carries the activity. Pfizer's redesigned commercial route runs the condensation, the reduction and the resolution in ethanol alone, replacing the dichloromethane, tetrahydrofuran, toluene and hexane of the original process — the change that won the 2002 Presidential Green Chemistry Challenge Award.",
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
        title:
          'PANDA: sertraline missed its primary endpoint at six weeks in 653 primary-care patients',
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
        title:
          'Effect size versus placebo depends on baseline severity, and is small below the top of the range',
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
        title:
          'SADHART: safe after myocardial infarction, and the primary endpoint was safety, not mood',
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
        title:
          'Discontinuation symptoms occur in about a third of people, and in a sixth after placebo',
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
        title:
          'STAR*D: cumulative remission after four steps was 67%, and the number is not a drug effect',
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
        label:
          'Drugs@FDA: ZOLOFT (sertraline hydrochloride), NDA 019839, approved 30 December 1991',
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
          action: 'Discuss whether a dose increase is likely to add benefit before accepting one.',
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
          "Emslie et al. randomised adolescents aged 12 to 17; 259 of 312 completed eight weeks of double-blind treatment. Baseline Children's Depression Rating Scale-Revised was 57.6 on escitalopram and 56.0 on placebo. Change at endpoint was -22.1 versus -18.8 (p=0.022, last observation carried forward). Discontinuation for adverse events was 2.6% versus 0.6%; serious adverse events 2.6% versus 1.3%; suicidality incidence similar between groups. The FDA granted the adolescent MDD indication on this evidence base.",
        evidenceSource: 'Emslie GJ et al., J Am Acad Child Adolesc Psychiatry 2009;48:721-729',
        doi: '10.1097/CHI.0b013e3181a2b304',
        measuredMetric: 'Change in CDRS-R total score at 8 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'esci-a4',
        category: 'failed',
        title:
          'The paediatric citalopram trial behind the franchise was misreported, and court documents proved it',
        laymanSummary:
          "The children's trial of citalopram — escitalopram's parent drug — was published as positive. Litigation documents later showed the protocol-specified outcome had shown no difference from placebo.",
        technicalDetails:
          "Jureidini, Amsterdam and McHenry reconstructed the CIT-MD-18 paediatric depression trial from documents produced in litigation. They found efficacy and safety data inconsistent with the protocol criteria; unreported procedural deviations that conferred statistical significance on the primary outcome; an implausible claimed effect size; post-hoc positive measures introduced and negative secondary outcomes omitted; adverse events analysed misleadingly; and manuscript drafts prepared by company employees and outside ghostwriters with academic researchers solicited as authors. Their conclusion was that protocol-specified outcomes showed no statistically significant difference between citalopram and placebo. Forest Laboratories, escitalopram's US marketer, resolved related federal charges in 2010.",
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
        title:
          'The serotonin-deficiency account is not supported, and the trial results are unchanged',
        laymanSummary:
          'The explanation given to patients for decades — that the drug corrects a chemical imbalance — has no consistent biomarker evidence behind it. That does not undo the trial results, and the trials never measured serotonin.',
        technicalDetails:
          "Moncrieff et al.'s umbrella review of 17 studies found no consistent association between depression and serotonin metabolite concentrations, 5-HT1A binding, SERT binding, or SERT genetics, and reported evidence that lowered plasma serotonin was associated with antidepressant use rather than with depression. Jauhar et al., for 35 co-authors, argued the conclusion was overstated on methodological and interpretive grounds, particularly regarding tryptophan depletion and molecular imaging. Both papers are about pathophysiology. Neither reanalyses an escitalopram trial.",
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
        laymanDesc: 'The endpoint in every trial is a questionnaire score, not a laboratory value.',
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
        a: "The registration evidence for adolescent major depression is thin by adult standards: an 8-week trial in 312 patients with a 3.3-point separation on a 17-to-113 scale, p=0.022. That is a real result and a small one. It sits next to the history of the parent drug's paediatric trial, CIT-MD-18, whose protocol-specified outcome showed no difference from placebo while the published paper concluded the opposite. Both facts belong on the same page.",
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
        "For depression, every SSRI has more evidence in anxiety disorders and none has bupropion's freedom from sexual side effects. For smoking cessation, varenicline beat bupropion head to head in EAGLES and in the Cochrane review, and nicotine replacement matched it.",
      conventionalRx: [
        {
          name: 'Varenicline',
          class: 'Partial agonist at the alpha-4 beta-2 nicotinic receptor',
          howItCompares:
            'Beat bupropion directly in EAGLES (odds ratio 1.75, 95% CI 1.52 to 2.01) and in the Cochrane comparison (RR 0.71 favouring varenicline, 6 studies, 6,286 participants).',
          typicalCost: '',
          prosAndCons:
            'Pros: the most effective single agent for smoking cessation. Cons: nausea in a quarter of users; its own neuropsychiatric boxed warning was removed in 2016 on the strength of EAGLES.',
        },
        {
          name: 'Nicotine replacement therapy (patch, gum, lozenge)',
          class: 'Nicotinic receptor agonist replacement',
          howItCompares:
            'No difference from bupropion on quit rates in the Cochrane comparison (RR 0.99, 95% CI 0.91 to 1.09; 10 studies, 8,230 participants), and available without prescription.',
          typicalCost: '',
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
        title:
          'LIGHT: the cardiovascular outcome trial was terminated after its interim data leaked',
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
        measuredMetric:
          'Standardised mean difference on clinician-rated ADHD core symptoms in adults',
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
        laymanDesc: 'Both the drug and its main breakdown product reach brain tissue.',
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
        primaryEndpoint:
          'Time to first major adverse cardiovascular event, non-inferiority margin 1.4',
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
        a: 'It means the question is unanswered, which is a different thing. LIGHT was testing whether the naltrexone-bupropion weight-loss combination was cardiovascularly non-inferior to placebo. Interim results from the first 25% of events were disclosed publicly while the trial was still running; the trial was terminated. The published analysis shows the effect estimate moving from HR 0.59 at 25% of events to HR 0.88 at 50%, and the authors state that non-inferiority to the pre-specified margin of 1.4 could not be assessed and a new trial is needed. No harm signal was demonstrated. No safety was demonstrated either.',
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
        label:
          'EAGLES: study evaluating the safety and efficacy of varenicline and bupropion for smoking cessation',
        identifier: 'NCT01456936',
        kind: 'nct',
      },
      {
        label: 'LIGHT: cardiovascular outcomes study of naltrexone SR/bupropion SR',
        identifier: 'NCT01601704',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: WELLBUTRIN (bupropion hydrochloride), NDA 018644, approved 30 December 1985',
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

  // ---------------------------------------------------------------------------------------------
  // 4. Gabapentin
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'gabapentin',
    name: 'Gabapentin',
    tradeName: 'Neurontin / Gralise / Horizant',
    sponsor: 'Parke-Davis (Warner-Lambert), later Pfizer',
    targetGene: 'CACNA2D1',
    targetProtein: 'Alpha-2-delta-1 auxiliary subunit of voltage-gated calcium channels',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1993,
    indication:
      'Adjunctive therapy for partial-onset seizures, and management of postherpetic neuralgia',
    patientFriendlyIndication: 'Nerve pain after shingles, and add-on treatment for some seizures',
    anatomicalSite: 'Presynaptic terminals in dorsal horn and cortex; alpha-2-delta-1 subunit',
    conditionContext: {
      conditionExplainer:
        "Gabapentin is named after GABA, the brain's main inhibitory messenger, and it does not act on GABA receptors at all. Its target is a helper subunit that sits on voltage-gated calcium channels and controls how many of them get to the nerve terminal.",
      whyItMatters:
        'The name is the first misleading thing about this drug and the licensed indications are the second: gabapentin is approved for two conditions and prescribed for dozens. The gap between those two facts is documented in court records, not just in the literature.',
      whoTakesThis:
        'Licensed for adults with postherpetic neuralgia and for adjunctive seizure control. In practice it is prescribed far more widely — for back pain, sciatica, fibromyalgia, anxiety, alcohol withdrawal and perioperative pain, all off-label.',
      clinicalGoals:
        'A 30% or 50% reduction in pain intensity in neuropathic pain, or reduced seizure frequency as an add-on. Neither goal is a cure and neither is achieved in most patients treated.',
    },
    oneSentenceVerdict:
      'An alpha-2-delta calcium channel ligand with moderate-quality evidence in two neuropathic pain conditions, essentially no evidence in the back pain it is most often prescribed for, and a $430 million federal settlement over the marketing campaign that created the gap.',
    laymanHowItWorks:
      'Despite the name, gabapentin does not act on GABA. It binds a small helper protein attached to the calcium channels on nerve endings. With that helper occupied, fewer channels reach the surface, less calcium enters when the nerve fires, and less of the pain-signalling chemical is released. It damps down an over-firing nerve rather than blocking a pain signal on its way past.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 61,
    substitutes: {
      summary:
        'For postherpetic neuralgia and painful diabetic neuropathy, gabapentin, pregabalin, duloxetine and tricyclics all have comparable moderate-quality evidence and the choice is about side effects. For low back pain there is no evidence gabapentin helps, and there is evidence it harms.',
      conventionalRx: [
        {
          name: 'Pregabalin',
          class: 'Alpha-2-delta ligand',
          howItCompares:
            'Same target, more predictable absorption because it is not saturably transported, and a controlled-substance schedule in the United States that gabapentin does not carry federally.',
          typicalCost:
            'US$0.057 per 75 mg capsule at pharmacy acquisition cost (CMS NADAC, effective 17 Dec 2025)',
          prosAndCons:
            'Pros: linear pharmacokinetics, twice-daily dosing. Cons: Schedule V federally, Class C in the United Kingdom since April 2019, same dizziness and somnolence burden.',
        },
        {
          name: 'Amitriptyline (generic tricyclic)',
          class: 'Tricyclic antidepressant used at low dose for neuropathic pain',
          howItCompares:
            'Long-standing first-line option in neuropathic pain with comparable effect sizes and a completely different adverse-effect profile.',
          typicalCost: '',
          prosAndCons:
            'Pros: cheap, once nightly, helps sleep. Cons: anticholinergic effects, cardiac conduction concerns in older patients.',
        },
        {
          name: 'Topical lidocaine 5% patch',
          class: 'Local sodium channel blocker',
          howItCompares:
            'Acts only where it is applied, so it avoids the dizziness and somnolence that cause most gabapentin withdrawals. Useful specifically in localised postherpetic neuralgia.',
          typicalCost: '',
          prosAndCons:
            'Pros: negligible systemic exposure. Cons: only works for well-localised pain, and the patch is expensive in some markets.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask whether your indication is one of the two licensed ones',
          action:
            'Ask directly whether gabapentin is being prescribed for postherpetic neuralgia or as an add-on anticonvulsant, or for something else.',
          patientImpact:
            'Those are the only two FDA-approved indications for the immediate-release product. Off-label prescribing is legal and sometimes appropriate, but for chronic low back pain the pooled evidence is three trials, 185 participants, and a mean difference of 0.22 pain units rated very low quality.',
          clinicalPrecaution:
            'Never stop an anticonvulsant abruptly. Off-label does not mean wrong; it means the evidence has to be judged case by case rather than assumed.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CCC(CC1)(CC(=O)O)CN',
      chemicalFormula: 'C9H17NO2',
      molecularWeight: '171.24 g/mol',
      targetReceptorAffinity:
        'Binds the alpha-2-delta-1 auxiliary subunit of voltage-gated calcium channels; has no measurable affinity for GABA-A or GABA-B receptors and is not converted to GABA',
      structureSource: {
        label: 'PubChem CID 3446 (gabapentin) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3446',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'gaba-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the cyclohexane diacetic acid precursor',
          description:
            'Confirm identity and purity of 1,1-cyclohexanediacetic acid and its anhydride before imide formation. The quaternary cyclohexane centre is what fixes the conformation of the finished amino acid, so a ring-substituted impurity is a different pharmacology, not a lower yield.',
          reagentsAndBuffer:
            '1,1-cyclohexanediacetic acid reference standard, acetic anhydride, titrimetric acid value, 1H NMR in DMSO-d6, differential scanning calorimetry for melting range',
        },
        {
          id: 'gaba-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Imide formation and Hofmann rearrangement',
          description:
            'Convert the diacid anhydride to the cyclic imide with ammonia, then degrade one carbonyl to a primary amine by Hofmann rearrangement with hypobromite. The rearrangement is the step that converts a carboxamide into the aminomethyl group and turns a diacid into an amino acid.',
          dependsOnStepId: 'gaba-w1',
          reagentsAndBuffer:
            'Aqueous ammonia; sodium hypobromite generated in situ from bromine and sodium hydroxide at controlled low temperature; aqueous hydrochloric acid for neutralisation',
        },
        {
          id: 'gaba-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Ion-exchange isolation and lactam control',
          description:
            'Isolate the zwitterionic amino acid on a cation-exchange resin and crystallise. The critical impurity is the internal lactam formed by intramolecular cyclisation, which is neurotoxic in preclinical work and is a named specification limit on the drug substance.',
          dependsOnStepId: 'gaba-w2',
          reagentsAndBuffer:
            'Strong cation-exchange resin eluted with dilute aqueous ammonia; crystallisation from ethanol/water; HPLC with charged-aerosol or UV detection for gabapentin-related lactam',
        },
        {
          id: 'gaba-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Alpha-2-delta-1 membrane preparation and LAT1 transport system',
          description:
            'Prepare porcine or recombinant alpha-2-delta-1 membranes for binding, and separately a cell line expressing the large neutral amino acid transporter LAT1, because gabapentin absorption is carrier-mediated and saturable and that is the reason its dose-response flattens.',
          dependsOnStepId: 'gaba-w3',
          reagentsAndBuffer:
            'Cortical membrane preparation or recombinant CACNA2D1-expressing cells; HEK293 or Caco-2 monolayers for LAT1 transport; HEPES-buffered transport medium with sodium-free controls',
        },
        {
          id: 'gaba-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Radioligand displacement and saturable uptake kinetics',
          description:
            'Measure displacement of tritiated gabapentin from the alpha-2-delta-1 site to confirm target engagement, and measure uptake across the transporter monolayer at increasing concentrations to demonstrate saturation. Both numbers are needed: one shows what the drug binds, the other shows why more tablets do not mean proportionally more drug.',
          dependsOnStepId: 'gaba-w4',
          reagentsAndBuffer:
            '[3H]-gabapentin, unlabelled gabapentin and pregabalin as competitors, HEPES-buffered saline, glass-fibre filtration with polyethyleneimine pre-treatment, liquid scintillation counting; LC-MS/MS quantification of transported drug',
        },
      ],
    },
    keyAudits: [
      {
        id: 'gaba-a1',
        category: 'measured',
        title: 'Postherpetic neuralgia: 32% reached substantial pain relief against 17% on placebo',
        laymanSummary:
          'In nerve pain after shingles, about a third of people on gabapentin got at least half their pain taken away, against about one in six on a dummy pill. Roughly seven people have to be treated for one to benefit.',
        technicalDetails:
          'Wiffen et al. pooled 37 studies and 5,914 participants. In postherpetic neuralgia at 1,200 mg daily or more: substantial benefit (at least 50% pain relief or PGIC very much improved) in 32% versus 17%, RR 1.8 (95% CI 1.5 to 2.1), NNT 6.7 (5.4 to 8.7), 8 studies, 2,260 participants, moderate-quality evidence. Moderate benefit in 46% versus 25%, NNT 4.8. In painful diabetic neuropathy: substantial benefit 38% versus 21%, RR 1.9 (1.5 to 2.3), NNT 5.9, 6 studies, 1,277 participants.',
        evidenceSource: 'Wiffen PJ et al., Cochrane Database Syst Rev 2017;6:CD007938',
        doi: '10.1002/14651858.CD007938.pub4',
        measuredMetric:
          'Proportion achieving at least 50% pain intensity reduction, versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'gaba-a2',
        category: 'failed',
        title: 'Chronic low back pain: no benefit, and a measurable harm profile',
        laymanSummary:
          'For the back pain gabapentin is very often prescribed for, pooling every trial that exists found essentially no pain improvement and a clear increase in dizziness, fatigue and thinking problems.',
        technicalDetails:
          'Shanthanna et al. found eight eligible studies out of 1,385 citations. Gabapentin versus placebo (3 studies, n=185) gave a mean difference of 0.22 pain units, 95% CI -0.5 to 0.07, GRADE very low. Pregabalin versus other analgesics (3 studies, n=332) favoured the comparator, MD 0.42 (0.20 to 0.64). Adverse events versus placebo: dizziness RR 1.99 (1.17 to 3.37), NNH 7; fatigue RR 1.85 (1.12 to 3.05), NNH 8; difficulties with mentation RR 3.34 (1.54 to 7.25), NNH 6; visual disturbance RR 5.72 (1.94 to 16.91), NNH 6. The authors concluded the use of gabapentinoids in chronic low back pain merits caution.',
        evidenceSource: 'Shanthanna H et al., PLoS Med 2017;14:e1002369',
        doi: '10.1371/journal.pmed.1002369',
        measuredMetric: 'Mean difference in pain intensity versus placebo, chronic low back pain',
        auditFlag: 'verified',
      },
      {
        id: 'gaba-a3',
        category: 'conclusion_shift',
        title: 'Warner-Lambert paid $430 million in 2004 for promoting the off-label uses',
        laymanSummary:
          'The company that made gabapentin pleaded guilty and paid $430 million for marketing it for conditions it had never been approved for. Internal documents released in that litigation show how the evidence base was shaped.',
        technicalDetails:
          "The Department of Justice announced on 13 May 2004 that Warner-Lambert would plead guilty and pay more than $430 million over its Parke-Davis division's promotion of Neurontin for unapproved uses; the drug had been approved in December 1993 solely for adjunctive anti-seizure use. Steinman et al. analysed the internal industry documents produced in that litigation and traced a strategy in which publication planning, continuing medical education and advisory boards were used as promotional channels. Landefeld and Steinman later described the episode in the New England Journal of Medicine as marketing through misinformation and manipulation. The lesson is not historical: a large share of current gabapentin prescribing is for indications this campaign popularised.",
        evidenceSource:
          'US Department of Justice press release, 13 May 2004; Steinman MA et al., Ann Intern Med 2006;145:284-293; Landefeld CS, Steinman MA, N Engl J Med 2009;360:103-106',
        doi: '10.7326/0003-4819-145-4-200608150-00008',
        auditFlag: 'verified',
      },
      {
        id: 'gaba-a4',
        category: 'measured',
        title:
          'Combining gabapentin with an opioid was associated with a 60% higher odds of opioid death',
        laymanSummary:
          'In a population study of people prescribed opioids, those also taking gabapentin were around 60% more likely to die of an opioid-related cause, and nearly half of gabapentin users were also getting an opioid.',
        technicalDetails:
          'Gomes et al. ran a nested case-control study in Ontario public drug plan beneficiaries. Moderate-dose and high-dose gabapentin co-prescription with opioids were each associated with roughly a 60% increase in the odds of opioid-related death (adjusted OR 1.56, 95% CI 1.06 to 2.28 and adjusted OR 1.58, 95% CI 1.09 to 2.27). Co-prescription of opioids with NSAIDs showed no such association (adjusted OR 1.14, 0.98 to 1.32), which is the internal control that makes the gabapentin result harder to dismiss as confounding by indication. In 2013, 46.0% of gabapentin users (45,173 of 98,288) received at least one concomitant opioid prescription.',
        evidenceSource: 'Gomes T et al., PLoS Med 2017;14:e1002396',
        doi: '10.1371/journal.pmed.1002396',
        measuredMetric: 'Adjusted odds ratio for opioid-related death with concomitant gabapentin',
        auditFlag: 'caution',
      },
      {
        id: 'gaba-a5',
        category: 'measured',
        title: 'Documented misuse potential, concentrated in people who also use opioids',
        laymanSummary:
          'Gabapentinoids are misused by a small fraction of the general population and by a much larger fraction of people who misuse opioids, and international adverse-event reports of abuse rose sharply after 2012.',
        technicalDetails:
          'Evoy et al. systematically reviewed 59 studies. Prevalence of gabapentinoid abuse was 1.6% in the general population and ranged from 3% to 68% among people who abuse opioids. An international adverse-event database contained 11,940 reports of gabapentinoid abuse between 2004 and 2015, with more than 75% of them reported since 2012. Risk factors were a history of substance abuse, particularly opioids, and psychiatric comorbidity. The authors noted gabapentinoids are increasingly identified in post-mortem toxicology.',
        evidenceSource: 'Evoy KE, Morrison MD, Saklad SR. Drugs 2017;77:403-426',
        doi: '10.1007/s40265-017-0700-x',
        measuredMetric: 'Prevalence of gabapentinoid abuse by population',
        auditFlag: 'caution',
      },
      {
        id: 'gaba-a6',
        category: 'failed',
        title:
          'Perioperative use: 281 trials, 24,682 patients, and no clinically significant analgesia',
        laymanSummary:
          'Giving gabapentin or pregabalin around surgery lowered pain scores by less than the amount considered clinically meaningful, and increased dizziness and visual disturbance.',
        technicalDetails:
          'Verret et al. included 281 trials and 24,682 participants. Compared with control, gabapentinoids reduced postoperative pain on a 100-point scale by 10 points at 6 hours (95% CI -12 to -9), 9 at 12 hours, 7 at 24 hours and 3 at 48 hours — all at or below the 10-point minimally important difference. No effect on pain at 72 hours, or on subacute or chronic postoperative pain. Gabapentinoids reduced postoperative nausea and vomiting but increased dizziness and visual disturbance. The authors concluded the results do not support routine perioperative use.',
        evidenceSource: 'Verret M et al., Anesthesiology 2020;133:265-279',
        doi: '10.1097/ALN.0000000000003428',
        measuredMetric: 'Mean difference in postoperative pain intensity on a 100-point scale',
        auditFlag: 'verified',
      },
      {
        id: 'gaba-a7',
        category: 'inferred',
        title: 'Prescribing kept rising after the negative evidence arrived',
        laymanSummary:
          'The share of American adults taking a gabapentinoid reached 4.0% in 2015 and 4.7% in 2021, after the negative low-back-pain and perioperative evidence had been published.',
        technicalDetails:
          'Johansen and Maust used the Medical Expenditure Panel Survey through 2021 and reported gabapentinoid users rising from 4.0% of the adult population in 2015 to 4.7% in 2021. Use was much more likely among people also taking other chronic-pain medicines, and new users clearly outnumbered stoppers between 2011-2012 and 2017-2018. The inference this page flags is the common assumption that prescribing volume tracks evidence. Between 2017 and 2021 the evidence for the biggest off-label uses got worse and the prescribing did not fall.',
        evidenceSource: 'Johansen ME, Maust DT. Ann Fam Med 2024;22:45-49',
        doi: '10.1370/afm.3052',
        inferredClaim:
          'That widespread prescribing of gabapentin for an indication reflects evidence supporting that indication',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed by a transporter that runs out of capacity',
        laymanDesc:
          'Gabapentin cannot cross the gut wall by itself; it has to hitch a ride on a carrier meant for amino acids. There are only so many carriers, so doubling the dose does not double the amount absorbed.',
        molecularDetail:
          'Absorption is mediated by the large neutral amino acid transporter LAT1 in the small intestine and is saturable, so bioavailability falls as dose rises. This non-linearity is why gabapentin is given three times daily and why the extended-release prodrug gabapentin enacarbil was developed.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Carried across the blood-brain barrier by the same kind of transporter',
        laymanDesc:
          'The same amino acid carriers move it out of the blood into the brain and spinal cord.',
        molecularDetail:
          'System L amino acid transport carries gabapentin across the blood-brain barrier. It is not metabolised in humans and is eliminated unchanged by the kidney, so dose must be reduced in renal impairment.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binds alpha-2-delta-1, not GABA',
        laymanDesc:
          'It sticks to a helper protein on calcium channels. It has nothing to do with GABA, despite the name.',
        molecularDetail:
          'Binds the alpha-2-delta-1 auxiliary subunit encoded by CACNA2D1. No measurable affinity for GABA-A or GABA-B receptors, no conversion to GABA, and no effect on GABA uptake or metabolism at therapeutic concentrations.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Fewer calcium channels reach the nerve terminal',
        laymanDesc:
          'With the helper occupied, fewer calcium gates get delivered to the nerve ending, so less calcium rushes in when the nerve fires and less pain messenger is released.',
        molecularDetail:
          'Alpha-2-delta-1 acts as a trafficking chaperone for pore-forming calcium channel subunits. Gabapentin binding reduces forward trafficking to the presynaptic membrane, lowering depolarisation-evoked calcium influx and reducing release of glutamate, substance P and calcitonin gene-related peptide. The trafficking mechanism operates over days, which fits the clinical observation that effect builds rather than appearing with the first dose.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Pain scores fall in some conditions, and dizziness rises in all of them',
        laymanDesc:
          'In shingles pain and diabetic nerve pain, roughly one extra person in six gets meaningful relief. In back pain, essentially nobody does. The dizziness and drowsiness arrive either way.',
        molecularDetail:
          'Cochrane reports NNT 6.7 for substantial benefit in postherpetic neuralgia and 5.9 in painful diabetic neuropathy, against NNH 7.5 for any adverse event and NNH 30 for withdrawal due to adverse events. Dizziness affected 19%, somnolence 14%, peripheral oedema 7% and gait disturbance 14%.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane gabapentin for chronic neuropathic pain (37 studies pooled)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 5914,
        primaryEndpoint:
          'Proportion with at least 50% pain intensity reduction or PGIC very much improved',
        endpointMet: true,
        statisticalPValue:
          'Postherpetic neuralgia RR 1.8 (95% CI 1.5 to 2.1), NNT 6.7; painful diabetic neuropathy RR 1.9 (1.5 to 2.3), NNT 5.9',
        unreportedAdverseSignals:
          'Any adverse event 63% vs 49% (NNH 7.5); adverse event withdrawals 11% vs 8.2% (NNH 30); eight deaths, rated very low quality evidence.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Shanthanna gabapentinoids in chronic low back pain (PROSPERO CRD42016034040)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 185,
        primaryEndpoint: 'Change in pain intensity versus placebo in chronic low back pain',
        endpointMet: false,
        statisticalPValue: 'Mean difference 0.22 units, 95% CI -0.5 to 0.07; GRADE very low',
        unreportedAdverseSignals:
          'Dizziness NNH 7, fatigue NNH 8, difficulties with mentation NNH 6, visual disturbance NNH 6.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Verret perioperative gabapentinoid meta-analysis (281 trials pooled)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 24682,
        primaryEndpoint:
          'Postoperative pain intensity on a 100-point scale at 6, 12, 24 and 48 hours',
        endpointMet: false,
        statisticalPValue:
          'All effects below the 10-point minimally important difference (-10, -9, -7, -3 respectively)',
        unreportedAdverseSignals:
          'More dizziness and visual disturbance; less postoperative nausea and vomiting.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Substantial pain relief in 32% versus 17% in postherpetic neuralgia and 38% versus 21% in painful diabetic neuropathy, moderate-quality evidence',
        'No clinically significant analgesia across 281 perioperative trials and 24,682 patients',
        'A mean difference of 0.22 pain units against placebo in chronic low back pain, from three trials and 185 participants',
        'A roughly 60% higher adjusted odds of opioid-related death when gabapentin was co-prescribed with an opioid, with an NSAID control arm showing no such association',
      ],
      unsupportedInferences: [
        'That gabapentin acts on the GABA system — it is named for GABA, binds a calcium channel subunit, and has no meaningful GABA receptor activity',
        'That the volume of gabapentin prescribing reflects the strength of evidence for the indications it is prescribed for',
        'That an anticonvulsant with proven effect in one neuropathic condition will work in unrelated chronic pain, which is the inference the off-label campaign was built on',
      ],
      whatFailedInitially: [
        'Chronic low back pain: no pain benefit and significant harms across every trial that exists',
        'Perioperative analgesia: effects below the minimally important difference at every time point measured',
        'The marketing that created much of the off-label use ended in a guilty plea and a $430 million settlement in 2004',
      ],
      realWorldOutcome: [
        'Gabapentinoid use reached 4.7% of the US adult population by 2021, still rising after the negative evidence was published',
        'The FDA-approved indications remain postherpetic neuralgia and adjunctive seizure control; most prescriptions are for neither',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, tablet and solution; immediate release three times daily',
      description:
        'Immediate-release gabapentin is dosed three times daily because absorption is saturable and non-linear. Gralise (once-daily gastroretentive) and Horizant (gabapentin enacarbil, a transported prodrug) exist specifically to work around that transporter limit, and they are not interchangeable with each other or with immediate-release gabapentin.',
      safetyProfile:
        'Commonest adverse effects are dizziness, somnolence, peripheral oedema and gait disturbance. Renal elimination is complete and unchanged, so dose reduction is mandatory in renal impairment and after dialysis. Respiratory depression is a recognised risk when combined with opioids or other CNS depressants and in patients with underlying respiratory compromise. Abrupt withdrawal of an anticonvulsant can precipitate seizures.',
    },
    commonQuestions: [
      {
        q: 'Is gabapentin a GABA drug?',
        a: 'No, and this is the most persistent misconception about it. Gabapentin was designed as a GABA analogue and named accordingly, then turned out not to work that way. It has no meaningful affinity for GABA-A or GABA-B receptors, is not converted into GABA, and does not change GABA uptake or breakdown at therapeutic concentrations. Its actual target is alpha-2-delta-1, a helper subunit that controls how many voltage-gated calcium channels reach the nerve terminal.',
      },
      {
        q: 'Will it help my back pain?',
        a: 'The pooled evidence says almost certainly not. Shanthanna and colleagues searched 1,385 citations, found eight eligible studies, and reported a mean difference of 0.22 pain units against placebo from three trials and 185 participants — rated very low quality. What the same analysis did find with more confidence was harm: dizziness with a number needed to harm of 7, difficulties with mentation of 6, visual disturbance of 6. Their conclusion was that use in chronic low back pain merits caution.',
        auditNote:
          'Chronic low back pain is one of the commonest reasons gabapentin is prescribed and one of the indications with the least evidence behind it. That gap is the single most important fact on this page.',
      },
      {
        q: 'Is it addictive?',
        a: 'Gabapentin is not a federally scheduled controlled substance in the United States, though several states have scheduled it, and the United Kingdom reclassified both gabapentin and pregabalin as Class C controlled drugs in April 2019. The systematic evidence puts abuse prevalence at 1.6% in the general population and between 3% and 68% among people who abuse opioids. The serious risk in ordinary practice is not addiction but the interaction: co-prescription with an opioid was associated with roughly 60% higher odds of opioid-related death in a population study with an NSAID control arm that showed nothing.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no verifiable per-dose cost-of-production figure for gabapentin could be cited, and estimating one would mean this page inventing a number. Actual US pharmacy acquisition cost from the CMS NADAC file is about 3.4 US cents per 300 mg capsule, which is a price and not a cost of manufacture. Gabapentin has been generic since 2004 and is one of the cheapest drugs in this file.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Wiffen PJ et al. Gabapentin for chronic neuropathic pain in adults. Cochrane Database Syst Rev 2017;6:CD007938',
        identifier: '10.1002/14651858.CD007938.pub4',
        kind: 'doi',
      },
      {
        label:
          'Shanthanna H et al. Benefits and safety of gabapentinoids in chronic low back pain: a systematic review and meta-analysis. PLoS Med 2017;14:e1002369',
        identifier: '10.1371/journal.pmed.1002369',
        kind: 'doi',
      },
      {
        label:
          'Steinman MA et al. Narrative review: the promotion of gabapentin — an analysis of internal industry documents. Ann Intern Med 2006;145:284-293',
        identifier: '10.7326/0003-4819-145-4-200608150-00008',
        kind: 'doi',
      },
      {
        label:
          'Landefeld CS, Steinman MA. The Neurontin legacy — marketing through misinformation and manipulation. N Engl J Med 2009;360:103-106',
        identifier: '10.1056/NEJMp0808659',
        kind: 'doi',
      },
      {
        label:
          'Gomes T et al. Gabapentin, opioids, and the risk of opioid-related death: a population-based nested case-control study. PLoS Med 2017;14:e1002396',
        identifier: '10.1371/journal.pmed.1002396',
        kind: 'doi',
      },
      {
        label:
          'Evoy KE, Morrison MD, Saklad SR. Abuse and misuse of pregabalin and gabapentin. Drugs 2017;77:403-426',
        identifier: '10.1007/s40265-017-0700-x',
        kind: 'doi',
      },
      {
        label:
          'Verret M et al. Perioperative use of gabapentinoids for the management of postoperative acute pain. Anesthesiology 2020;133:265-279',
        identifier: '10.1097/ALN.0000000000003428',
        kind: 'doi',
      },
      {
        label:
          'Johansen ME, Maust DT. Update to gabapentinoid use in the United States, 2002-2021. Ann Fam Med 2024;22:45-49',
        identifier: '10.1370/afm.3052',
        kind: 'doi',
      },
      {
        label:
          'US Department of Justice: Warner-Lambert to pay $430 million to resolve criminal and civil health care liability relating to off-label promotion, 13 May 2004',
        identifier: 'https://www.justice.gov/archive/opa/pr/2004/May/04_civ_322.htm',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: NEURONTIN (gabapentin), NDA 020235, approved 30 December 1993',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020235',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3446 — gabapentin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3446',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 5. Pregabalin
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'pregabalin',
    name: 'Pregabalin',
    tradeName: 'Lyrica',
    sponsor: 'Pfizer',
    targetGene: 'CACNA2D1',
    targetProtein: 'Alpha-2-delta-1 auxiliary subunit of voltage-gated calcium channels',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2004,
    indication:
      'Neuropathic pain associated with diabetic peripheral neuropathy, postherpetic neuralgia, and spinal cord injury; fibromyalgia; adjunctive therapy for partial-onset seizures',
    patientFriendlyIndication: 'Nerve pain, fibromyalgia and add-on treatment for some seizures',
    anatomicalSite: 'Presynaptic terminals in dorsal horn and cortex; alpha-2-delta-1 subunit',
    conditionContext: {
      conditionExplainer:
        'Pregabalin hits the same target as gabapentin but is absorbed by a transporter that does not saturate, so blood levels rise in proportion to the dose. That single pharmacokinetic difference is most of what separates the two drugs.',
      whyItMatters:
        'Predictable absorption makes pregabalin easier to dose and also easier to misuse, because a person taking a large amount actually gets a large amount. It is a Schedule V controlled substance in the United States and a Class C controlled drug in the United Kingdom since April 2019.',
      whoTakesThis:
        'Adults with diabetic peripheral neuropathic pain, postherpetic neuralgia, neuropathic pain after spinal cord injury, or fibromyalgia, and adults and children aged one month and older as add-on treatment for partial-onset seizures.',
      clinicalGoals:
        'A 30% or 50% reduction in pain intensity. In fibromyalgia the realistic target is that roughly one extra person in eleven gets substantial relief compared with placebo.',
    },
    oneSentenceVerdict:
      'A predictably absorbed alpha-2-delta ligand with solid moderate-quality evidence in postherpetic neuralgia, much weaker evidence in diabetic neuropathy, a clean randomised failure in sciatica, and enough misuse to have been made a controlled drug in the United Kingdom.',
    laymanHowItWorks:
      'Pregabalin binds a helper protein on the calcium gates of nerve endings. With the helper occupied, fewer gates get delivered to the surface, less calcium enters when an over-excited nerve fires, and less pain-signalling chemical is released. Unlike gabapentin, the gut absorbs it in proportion to how much is swallowed, so the dose and the blood level track each other.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 64,
    substitutes: {
      summary:
        'Gabapentin hits the same target more cheaply and less predictably. Duloxetine and amitriptyline have comparable evidence in diabetic neuropathy. For sciatica, the best randomised evidence says pregabalin does nothing, so the comparison is against other conservative management rather than against another drug.',
      conventionalRx: [
        {
          name: 'Gabapentin',
          class: 'Alpha-2-delta ligand',
          howItCompares:
            'Same molecular target. Cheaper, absorbed by a saturable transporter so the dose-response flattens, and not federally scheduled in the United States.',
          typicalCost:
            'US$0.034 per 300 mg capsule at pharmacy acquisition cost (CMS NADAC, effective 17 Dec 2025)',
          prosAndCons:
            'Pros: cheapest option in the class. Cons: three-times-daily dosing, unpredictable bioavailability at higher doses.',
        },
        {
          name: 'Duloxetine',
          class: 'Serotonin-norepinephrine reuptake inhibitor',
          howItCompares:
            'Approved for diabetic peripheral neuropathic pain and fibromyalgia, with a different adverse-effect profile — nausea and sweating rather than dizziness and oedema.',
          typicalCost: '',
          prosAndCons:
            'Pros: no controlled-substance status, treats comorbid depression. Cons: discontinuation syndrome, hepatic precautions.',
        },
        {
          name: 'Amitriptyline',
          class: 'Tricyclic antidepressant at analgesic dose',
          howItCompares:
            'Decades of use in neuropathic pain at doses far below antidepressant doses. Comparable effect estimates in most indirect comparisons.',
          typicalCost: '',
          prosAndCons:
            'Pros: cheap, once nightly, helps sleep. Cons: anticholinergic burden and cardiac conduction effects, especially in older patients.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Judge the drug at four weeks, not at four months',
          action:
            'Agree with a prescriber in advance what a successful response looks like and when it will be reviewed.',
          patientImpact:
            'The trials that support pregabalin assess response after 8 to 13 weeks of stable dosing, and the enriched-withdrawal fibromyalgia design showed that only about 10% of the initial population reaches and keeps a maintained therapeutic response. A drug that has not worked by then is unlikely to start.',
          clinicalPrecaution:
            'Do not stop an anticonvulsant abruptly. Tapering is required, and discontinuation symptoms including insomnia, nausea and anxiety are documented.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)C[C@@H](CC(=O)O)CN',
      chemicalFormula: 'C8H17NO2',
      molecularWeight: '159.23 g/mol',
      targetReceptorAffinity:
        'Binds alpha-2-delta-1 with higher affinity than gabapentin; like gabapentin it has no meaningful GABA-A or GABA-B receptor activity. Only the (S)-enantiomer is active, which is why the manufacturing route is built around a resolution',
      structureSource: {
        label: 'PubChem CID 5486971 (pregabalin) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5486971',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'preg-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the racemic cyanoester and the lipase',
          description:
            'Confirm identity and purity of racemic ethyl 3-cyano-5-methylhexanoate and confirm the activity of the lipase preparation before the resolution. An under-active enzyme lot silently converts a kinetic resolution into a low-yield racemic process.',
          reagentsAndBuffer:
            'Racemic 3-cyano-5-methylhexanoate diester reference standard, Thermomyces lanuginosus lipase preparation, gas chromatography with flame ionisation detection, enzyme activity assay against a p-nitrophenyl ester substrate',
        },
        {
          id: 'preg-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Enzymatic kinetic resolution, decarboxylation and nitrile hydrogenation',
          description:
            "Hydrolyse one enantiomer of the racemic cyanodiester selectively with lipase, decarboxylate the resulting mono-acid, then hydrogenate the nitrile over Raney nickel to the primary amine. Pfizer's enzymatic route replaced a classical resolution that discarded half the material at the last step; performing the resolution first is what raised the atom economy and won the 2005 Presidential Green Chemistry Challenge Award for the process.",
          dependsOnStepId: 'preg-w1',
          reagentsAndBuffer:
            'Immobilised Thermomyces lanuginosus lipase in aqueous buffer at controlled pH; heat for decarboxylation; Raney nickel under hydrogen in aqueous ammonia or methanol',
        },
        {
          id: 'preg-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and enantiomeric excess determination',
          description:
            'Crystallise the zwitterionic amino acid from an aqueous alcohol and determine enantiomeric excess by chiral chromatography of a derivative. Only the (S)-enantiomer is active, so enantiomeric excess is a potency specification, not a cosmetic one.',
          dependsOnStepId: 'preg-w2',
          reagentsAndBuffer:
            'Isopropanol/water recrystallisation; Marfey or dansyl derivatisation for chiral HPLC; ion chromatography for residual nickel',
        },
        {
          id: 'preg-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Alpha-2-delta-1 membrane preparation and transporter comparison',
          description:
            'Prepare alpha-2-delta-1 membranes for binding and a LAT1-expressing monolayer for transport, running gabapentin in parallel. The comparison is the point: the two drugs share a target and differ in absorption, and only a side-by-side transport experiment shows that.',
          dependsOnStepId: 'preg-w3',
          reagentsAndBuffer:
            'Cortical or recombinant CACNA2D1 membranes; Caco-2 or LAT1-transfected HEK293 monolayers on permeable supports; HEPES-buffered transport medium; gabapentin reference standard',
        },
        {
          id: 'preg-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Binding affinity and linear-versus-saturable uptake',
          description:
            'Measure displacement of tritiated gabapentin by pregabalin to derive relative affinity, and measure apparent permeability across the monolayer at increasing donor concentrations for both drugs. Linearity for pregabalin and saturation for gabapentin is the experimental signature of the clinical difference between them.',
          dependsOnStepId: 'preg-w4',
          reagentsAndBuffer:
            '[3H]-gabapentin, unlabelled pregabalin and gabapentin, polyethyleneimine-treated glass-fibre filters, liquid scintillation counting; LC-MS/MS quantification of receiver-chamber drug',
        },
      ],
    },
    keyAudits: [
      {
        id: 'preg-a1',
        category: 'measured',
        title: 'Postherpetic neuralgia: 32% versus 13% substantial relief at 300 mg daily',
        laymanSummary:
          'In nerve pain after shingles, pregabalin roughly doubled to tripled the proportion of people whose pain fell by half, depending on dose.',
        technicalDetails:
          'Derry et al. pooled 45 studies and 11,906 participants. Postherpetic neuralgia at 300 mg daily: at least 30% pain reduction in 50% versus 25% (RR 2.1, 95% CI 1.6 to 2.6, NNTB 3.9); at least 50% reduction in 32% versus 13% (RR 2.5, 1.9 to 3.4, NNTB 5.3). At 600 mg daily: at least 30% in 62% versus 24% (NNTB 2.7); at least 50% in 41% versus 15% (NNTB 3.9). Somnolence at 300 mg was 16% versus 5.5% and dizziness 29% versus 8.1%; at 600 mg, 25% versus 5.8% and 35% versus 8.8%.',
        evidenceSource: 'Derry S et al., Cochrane Database Syst Rev 2019;1:CD007076',
        doi: '10.1002/14651858.CD007076.pub3',
        measuredMetric:
          'Proportion achieving at least 50% pain intensity reduction versus placebo, by dose',
        auditFlag: 'verified',
      },
      {
        id: 'preg-a2',
        category: 'inferred',
        title:
          'Diabetic neuropathy: the same drug, a far weaker effect, and a number needed to treat of 22',
        laymanSummary:
          'In painful diabetic nerve damage the benefit was much smaller than in shingles pain. At 300 mg, 22 people had to be treated for one extra person to get a 30% reduction in pain.',
        technicalDetails:
          'From the same Cochrane review: painful diabetic neuropathy at 300 mg daily gave at least 30% pain reduction in 47% versus 42% (RR 1.1, 95% CI 1.01 to 1.2, NNTB 22, range 12 to 200; 8 studies, 2,320 participants) and at least 50% reduction in 31% versus 24% (RR 1.3, NNTB 22). At 600 mg the estimates improved but the evidence was rated low quality. The clinical inference this page flags is the routine treatment of pregabalin as one drug with one effect size; the effect in postherpetic neuralgia and the effect in diabetic neuropathy differ by roughly four-fold on number needed to treat.',
        evidenceSource: 'Derry S et al., Cochrane Database Syst Rev 2019;1:CD007076',
        doi: '10.1002/14651858.CD007076.pub3',
        inferredClaim:
          'That the effect size demonstrated for pregabalin in postherpetic neuralgia carries across to other neuropathic pain conditions',
        auditFlag: 'caution',
      },
      {
        id: 'preg-a3',
        category: 'failed',
        title: 'PRECISE: pregabalin did nothing for sciatica at 8 weeks or at 52 weeks',
        laymanSummary:
          'In a randomised trial of 209 patients with sciatica, leg pain was slightly worse on pregabalin than on placebo at both time points, and there were nearly twice as many adverse events.',
        technicalDetails:
          'Mathieson et al., randomised, double-blind, placebo-controlled (ACTRN12613000530729). 209 randomised, 108 to pregabalin and 101 to placebo, 2 later excluded. At week 8, mean unadjusted leg-pain intensity was 3.7 on pregabalin and 3.1 on placebo — adjusted mean difference 0.5, 95% CI -0.2 to 1.2, P=0.19. At week 52, 3.4 versus 3.0 — adjusted mean difference 0.3, 95% CI -0.5 to 1.0, P=0.46. No significant between-group difference on any secondary outcome at either time point. 227 adverse events on pregabalin against 124 on placebo, with dizziness more common.',
        evidenceSource: 'Mathieson S et al., N Engl J Med 2017;376:1111-1120',
        doi: '10.1056/NEJMoa1614292',
        measuredMetric: 'Leg-pain intensity score at week 8 (primary) and week 52',
        auditFlag: 'verified',
      },
      {
        id: 'preg-a4',
        category: 'measured',
        title: 'Fibromyalgia: about 9 extra people in 100 get substantial relief',
        laymanSummary:
          'In fibromyalgia, 14 people in 100 got at least half their pain relieved on placebo and about 23 in 100 did on pregabalin — a real difference, and a modest one.',
        technicalDetails:
          'Derry et al. included eight studies; five with a classic design randomised 3,283 participants. Substantial benefit (at least 50% pain intensity reduction after 12 to 13 weeks of stable treatment) at 450 mg: RR 1.8 (95% CI 1.4 to 2.1), 1,874 participants, 5 studies, high-quality evidence — about 14% on placebo and about 9 percentage points more on pregabalin 300 to 600 mg. Moderate benefit at 450 mg: RR 1.5 (1.3 to 1.7), 28% on placebo and about 11 points more on pregabalin. NNTs ranged from 7 to 14. Two enriched-enrolment randomised-withdrawal studies found maintained therapeutic response in 40% on pregabalin against 20% on placebo, but normalised to the starting population only about 10% achieved it. Between 70% and 90% of participants in all groups had an adverse event.',
        evidenceSource: 'Derry S et al., Cochrane Database Syst Rev 2016;9:CD011790',
        doi: '10.1002/14651858.CD011790.pub2',
        measuredMetric:
          'Proportion with at least 50% pain intensity reduction after 12-13 weeks of stable treatment',
        auditFlag: 'verified',
      },
      {
        id: 'preg-a5',
        category: 'conclusion_shift',
        title: 'The United Kingdom made pregabalin a controlled drug in 2019',
        laymanSummary:
          'After deaths involving pregabalin rose, the UK reclassified it and gabapentin as Class C controlled drugs, which changed how they can be prescribed and dispensed.',
        technicalDetails:
          'The UK Home Office announced that from 1 April 2019 pregabalin and gabapentin would be controlled as Class C substances under the Misuse of Drugs Act 1971 and scheduled under Schedule 3 of the Misuse of Drugs Regulations 2001, following advice from the Advisory Council on the Misuse of Drugs. The systematic evidence behind that decision put gabapentinoid abuse prevalence at 1.6% in the general population and 3% to 68% among people who abuse opioids, with 11,940 international adverse-event reports of gabapentinoid abuse between 2004 and 2015 and more than 75% of them since 2012. Pregabalin is Schedule V in the United States.',
        evidenceSource:
          'UK Home Office, Pregabalin and gabapentin to be controlled as Class C drugs; Evoy KE et al., Drugs 2017;77:403-426',
        doi: '10.1007/s40265-017-0700-x',
        auditFlag: 'verified',
      },
      {
        id: 'preg-a6',
        category: 'failed',
        title: 'Chronic low back pain: pregabalin lost to the analgesics it was compared against',
        laymanSummary:
          'When pregabalin was compared with other painkillers for chronic low back pain, the other painkillers did better.',
        technicalDetails:
          "In Shanthanna et al.'s systematic review, three studies comparing pregabalin with other analgesic medication (n=332) showed greater improvement in the comparator group: mean difference 0.42 units, 95% CI 0.20 to 0.64, I-squared 0, GRADE very low. Studies using pregabalin as an adjuvant (n=423) were not pooled for heterogeneity, but the largest showed no benefit from adding pregabalin to tapentadol. Verret et al. separately found no clinically significant perioperative analgesia from either gabapentinoid across 281 trials and 24,682 patients.",
        evidenceSource:
          'Shanthanna H et al., PLoS Med 2017;14:e1002369; Verret M et al., Anesthesiology 2020;133:265-279',
        doi: '10.1371/journal.pmed.1002369',
        measuredMetric: 'Mean difference in pain intensity versus active comparator',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed rapidly and in proportion to dose',
        laymanDesc:
          'Unlike gabapentin, doubling the pregabalin dose roughly doubles the amount in the blood. That predictability is the main practical difference between the two drugs.',
        molecularDetail:
          'Bioavailability above 90% and independent of dose, with peak plasma concentration around one hour. Absorption is transporter-mediated but not saturable across the therapeutic range, giving linear pharmacokinetics.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters the central nervous system unchanged',
        laymanDesc:
          'The liver leaves it alone. It passes into the brain and spinal cord and then leaves the body through the kidneys in the form it arrived.',
        molecularDetail:
          'Negligible metabolism in humans; more than 90% is excreted unchanged in urine, so dosing must be reduced according to creatinine clearance. No cytochrome P450 interactions.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binds alpha-2-delta-1 with higher affinity than gabapentin',
        laymanDesc: 'It sticks to the same helper protein as gabapentin, and sticks harder.',
        molecularDetail:
          'Binds the alpha-2-delta-1 auxiliary subunit encoded by CACNA2D1 with higher affinity than gabapentin. Only the (S)-enantiomer binds. No meaningful GABA-A or GABA-B receptor activity.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Presynaptic calcium entry and transmitter release fall',
        laymanDesc:
          'Fewer calcium gates reach the nerve ending, so an over-firing pain nerve releases less of its signalling chemicals.',
        molecularDetail:
          'Reduced forward trafficking of alpha-2-delta-1-associated calcium channels lowers depolarisation-evoked calcium influx and decreases release of glutamate, substance P and calcitonin gene-related peptide in the dorsal horn. Effect develops over days rather than with the first dose.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Pain falls in some conditions and not in others, and dizziness follows everywhere',
        laymanDesc:
          'Strong effect in shingles pain, weak effect in diabetic nerve pain, nothing in sciatica. Dizziness and drowsiness in roughly a third of people at higher doses regardless.',
        molecularDetail:
          'NNTB 5.3 for at least 50% relief in postherpetic neuralgia at 300 mg against NNTB 22 in painful diabetic neuropathy, and no separation from placebo at 8 or 52 weeks in sciatica. Dizziness reached 35% and somnolence 25% at 600 mg in the neuropathic pain trials.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'PRECISE (ACTRN12613000530729)',
        phase: 'Phase 3 randomised placebo-controlled trial',
        sampleSize: 209,
        primaryEndpoint: 'Leg-pain intensity score at week 8 in sciatica',
        endpointMet: false,
        statisticalPValue: 'P = 0.19 at week 8 (adjusted mean difference 0.5, 95% CI -0.2 to 1.2)',
        unreportedAdverseSignals:
          '227 adverse events in the pregabalin group versus 124 on placebo; dizziness significantly more common.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Cochrane pregabalin for neuropathic pain (45 studies pooled)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 11906,
        primaryEndpoint:
          'Proportion with at least 50% pain intensity reduction versus placebo, by condition and dose',
        endpointMet: true,
        statisticalPValue:
          'Postherpetic neuralgia 300 mg RR 2.5 (95% CI 1.9 to 3.4), NNTB 5.3; painful diabetic neuropathy 300 mg RR 1.3, NNTB 22',
        unreportedAdverseSignals:
          'Somnolence up to 25% and dizziness up to 35% at 600 mg, against 5.8% and 8.8% on placebo.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane pregabalin for fibromyalgia (8 studies pooled)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 3283,
        primaryEndpoint:
          'At least 50% pain intensity reduction after 12-13 weeks of stable treatment',
        endpointMet: true,
        statisticalPValue: 'RR 1.8 (95% CI 1.4 to 2.1) at 450 mg, high-quality evidence',
        unreportedAdverseSignals:
          'Between 70% and 90% of participants in all treatment groups, including placebo, experienced adverse events.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '32% versus 13% substantial pain relief in postherpetic neuralgia at 300 mg daily, moderate-quality evidence',
        'A number needed to treat of 22 for a 30% pain reduction in painful diabetic neuropathy at the same dose',
        'No separation from placebo on leg pain at 8 or 52 weeks in 209 randomised patients with sciatica',
        'About 9 extra people in 100 achieving substantial pain relief in fibromyalgia, high-quality evidence',
      ],
      unsupportedInferences: [
        'That pregabalin has one effect size across neuropathic pain, when the number needed to treat differs roughly four-fold between postherpetic neuralgia and diabetic neuropathy',
        'That a drug effective in peripheral neuropathic pain will work in radicular pain — sciatica is the test case and the answer was no',
        'That predictable absorption makes pregabalin safer than gabapentin, when it is the reason pregabalin is a controlled drug in the United Kingdom and Schedule V in the United States',
      ],
      whatFailedInitially: [
        'PRECISE: no effect on sciatica at either time point, with nearly twice the adverse events',
        'Chronic low back pain: inferior to comparator analgesics, and no benefit as an adjuvant to tapentadol in the largest such study',
        'Perioperative analgesia: below the minimally important difference across 281 trials',
      ],
      realWorldOutcome: [
        'Reclassified as a Class C controlled drug in the United Kingdom from 1 April 2019 after rising misuse and deaths',
        'Remains a first-line option in postherpetic neuralgia, where the evidence is strongest and the number needed to treat is lowest',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, oral solution, and extended-release tablet; two or three times daily',
      description:
        'Immediate-release capsules are given two or three times daily; an extended-release tablet exists for once-daily dosing in some indications. Absorption is rapid and dose-proportional, so blood levels are predictable and dose adjustment for renal function is mandatory.',
      safetyProfile:
        'Commonest adverse effects are dizziness, somnolence, peripheral oedema, weight gain and blurred vision, all dose-dependent. Respiratory depression is a recognised risk in combination with opioids and other CNS depressants and in patients with respiratory compromise. Pregabalin is Schedule V in the United States and Class C in the United Kingdom. Abrupt discontinuation can precipitate withdrawal symptoms and, in patients treated for epilepsy, seizures.',
    },
    commonQuestions: [
      {
        q: 'What is the actual difference between pregabalin and gabapentin?',
        a: 'They bind the same target, alpha-2-delta-1. The differences are pharmacokinetic and regulatory. Pregabalin is absorbed in proportion to dose, so blood levels are predictable and dosing is twice or three times daily; gabapentin depends on a saturable amino acid transporter, so higher doses give diminishing returns and it is given three times daily. Pregabalin binds with higher affinity. Pregabalin is a scheduled controlled substance in the United States and the United Kingdom; gabapentin is not federally scheduled in the United States, though several states have scheduled it and the UK controls both.',
      },
      {
        q: 'It did not help my sciatica. Is that unusual?',
        a: 'No. PRECISE is the definitive randomised trial on that question and it was clearly negative: 209 patients, leg pain 3.7 on pregabalin against 3.1 on placebo at week 8 (P=0.19), 3.4 against 3.0 at week 52 (P=0.46), no secondary outcome separating at either point, and 227 adverse events on drug against 124 on placebo. The trial was published in the New England Journal of Medicine in 2017 and has not been contradicted.',
        auditNote:
          'Sciatica remains a common reason for a pregabalin prescription. The trial evidence against it is unusually clean for a negative result.',
      },
      {
        q: 'Is the fibromyalgia benefit worth taking?',
        a: 'That is a judgement, and here is the arithmetic behind it. In the Cochrane analysis, about 14 in 100 people got at least half their pain relieved on placebo and about 23 in 100 did on pregabalin — roughly 9 extra people per 100, numbers needed to treat between 7 and 14, on high-quality evidence. Between 70% and 90% of participants in every group, including placebo, reported an adverse event. In the enriched-withdrawal design, once you normalise back to everyone who started, only about 10% reached and kept a maintained response.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no verifiable per-dose cost-of-production figure for pregabalin could be cited, and this file does not estimate one. The US pharmacy acquisition cost from the CMS NADAC file is about 5.7 US cents per 75 mg capsule, which is a price rather than a cost of manufacture. Pregabalin went generic in the United States in 2019.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Derry S et al. Pregabalin for neuropathic pain in adults. Cochrane Database Syst Rev 2019;1:CD007076',
        identifier: '10.1002/14651858.CD007076.pub3',
        kind: 'doi',
      },
      {
        label:
          'Mathieson S et al. Trial of pregabalin for acute and chronic sciatica (PRECISE). N Engl J Med 2017;376:1111-1120',
        identifier: '10.1056/NEJMoa1614292',
        kind: 'doi',
      },
      {
        label:
          'Derry S et al. Pregabalin for pain in fibromyalgia in adults. Cochrane Database Syst Rev 2016;9:CD011790',
        identifier: '10.1002/14651858.CD011790.pub2',
        kind: 'doi',
      },
      {
        label:
          'Shanthanna H et al. Benefits and safety of gabapentinoids in chronic low back pain. PLoS Med 2017;14:e1002369',
        identifier: '10.1371/journal.pmed.1002369',
        kind: 'doi',
      },
      {
        label:
          'Verret M et al. Perioperative use of gabapentinoids for the management of postoperative acute pain. Anesthesiology 2020;133:265-279',
        identifier: '10.1097/ALN.0000000000003428',
        kind: 'doi',
      },
      {
        label:
          'Evoy KE, Morrison MD, Saklad SR. Abuse and misuse of pregabalin and gabapentin. Drugs 2017;77:403-426',
        identifier: '10.1007/s40265-017-0700-x',
        kind: 'doi',
      },
      {
        label:
          'UK Home Office: Pregabalin and gabapentin to be controlled as Class C drugs, in force 1 April 2019',
        identifier:
          'https://www.gov.uk/government/news/pregabalin-and-gabapentin-to-be-controlled-as-class-c-drugs',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: LYRICA (pregabalin), NDA 021446, approved 30 December 2004',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021446',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5486971 — pregabalin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5486971',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 6. Esketamine
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'esketamine',
    name: 'Esketamine',
    tradeName: 'Spravato',
    sponsor: 'Janssen Pharmaceuticals (Johnson & Johnson)',
    targetGene: 'GRIN1',
    targetProtein: 'N-methyl-D-aspartate (NMDA) glutamate receptor, open-channel site',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2019,
    indication:
      'Treatment-resistant depression in adults, in conjunction with an oral antidepressant; and depressive symptoms in adults with major depressive disorder with acute suicidal ideation or behaviour',
    patientFriendlyIndication:
      'Depression that has not responded to at least two other antidepressants',
    anatomicalSite: 'Cortical and hippocampal glutamatergic synapses; NMDA receptor channel pore',
    conditionContext: {
      conditionExplainer:
        "Esketamine is the S-enantiomer of ketamine, an anaesthetic in use since the 1960s. It acts on glutamate, the brain's main excitatory messenger, rather than on serotonin, and its antidepressant effect appears within hours rather than weeks.",
      whyItMatters:
        'A rapid-onset antidepressant is genuinely new, and the drug is dissociative, which makes blinding a trial extremely difficult. Almost every dispute about esketamine traces back to that one methodological problem.',
      whoTakesThis:
        'Adults whose depression has not responded to at least two adequate trials of oral antidepressants. Administration is restricted to certified healthcare settings under a Risk Evaluation and Mitigation Strategy, with at least two hours of observation after each dose.',
      clinicalGoals:
        'A rapid reduction in MADRS score in a population where nothing else has worked, and then delay of relapse if that reduction is achieved.',
    },
    oneSentenceVerdict:
      'The first genuinely rapid-acting antidepressant to reach the market, approved on one positive short-term trial out of three, with a strong relapse-prevention result and a blinding problem that its critics argue makes the whole efficacy estimate uncertain.',
    laymanHowItWorks:
      'Most antidepressants nudge serotonin and take weeks. Esketamine blocks a receptor for glutamate, the brain\'s main "go" signal, and does something different: within hours it appears to trigger a burst of new connections between nerve cells. The nasal spray is given in a clinic because the same receptor blockade also causes a temporary out-of-body feeling and a rise in blood pressure, and patients have to be watched for two hours afterwards.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 62,
    substitutes: {
      summary:
        'Quetiapine extended-release lost to esketamine head to head in ESCAPE-TRD. Generic racemic ketamine given intravenously is far cheaper and is used off-label for the same purpose without the same registration programme. Electroconvulsive therapy remains the reference treatment in severe treatment-resistant depression.',
      conventionalRx: [
        {
          name: 'Quetiapine extended-release',
          class: 'Atypical antipsychotic used for antidepressant augmentation',
          howItCompares:
            'Beaten by esketamine on remission at week 8 in ESCAPE-TRD (27.1% versus 17.6%, P=0.003) in 676 patients with treatment-resistant depression.',
          typicalCost: '',
          prosAndCons:
            'Pros: oral, generic, no clinic visit. Cons: sedation, weight gain, metabolic effects, and it lost the head-to-head comparison.',
        },
        {
          name: 'Racemic ketamine, intravenous (off-label)',
          class: 'NMDA receptor antagonist',
          howItCompares:
            'The same pharmacological class as a generic drug at a fraction of the cost, used off-label for depression for two decades. It has never been through the registration programme esketamine went through, so its evidence base is broader and shallower.',
          typicalCost: '',
          prosAndCons:
            'Pros: generic, decades of anaesthetic safety data. Cons: no approved depression indication, no REMS framework, and clinic practice varies enormously.',
        },
        {
          name: 'Electroconvulsive therapy',
          class: 'Neurostimulation',
          howItCompares:
            'Still the treatment with the largest effect size in severe treatment-resistant depression, and the comparator esketamine has not been tested against in a large randomised trial.',
          typicalCost: '',
          prosAndCons:
            'Pros: the largest effect size available. Cons: general anaesthesia, cognitive side effects, and considerable stigma.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Arrange transport and a supervised evening in advance',
          action:
            'Do not plan to drive or operate machinery after a dose, and arrange to be accompanied home.',
          patientImpact:
            'Dissociation, sedation, vertigo and blood pressure rise are the most frequent adverse effects, appear shortly after dosing, and in the pivotal trial had generally resolved by about 90 minutes. The label requires at least two hours of clinical observation.',
          clinicalPrecaution:
            'This is a REMS-restricted product administered only in certified settings. It is not a take-home medicine, and the observation period is a labelled requirement rather than a precaution.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN[C@@]1(CCCCC1=O)C2=CC=CC=C2Cl',
      chemicalFormula: 'C13H16ClNO',
      molecularWeight: '237.72 g/mol (free base); marketed as esketamine hydrochloride',
      targetReceptorAffinity:
        'Non-competitive open-channel blocker of the NMDA receptor with roughly three to four times the affinity of the R-enantiomer; also has activity at opioid and monoamine sites at higher concentrations',
      structureSource: {
        label: 'PubChem CID 182137 (esketamine) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/182137',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'esk-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of 2-chlorophenyl cyclopentyl ketone and methylamine',
          description:
            'Confirm identity and purity of the 2-chlorophenyl cyclopentyl ketone precursor and of the methylamine feed. The ortho-chloro position is what makes the thermal ring expansion work; a meta or para isomer will not rearrange to the cyclohexanone.',
          reagentsAndBuffer:
            '(2-chlorophenyl)(cyclopentyl)methanone reference standard, methylamine solution, gas chromatography with mass detection, 1H NMR in CDCl3',
        },
        {
          id: 'esk-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Bromination, amination and thermal ring expansion',
          description:
            'Brominate the cyclopentyl ring alpha to the carbonyl, displace with methylamine to give the hydroxyimine, then heat in a high-boiling solvent so the alpha-hydroxyimine rearranges by ring expansion to the cyclohexanone. The rearrangement is the step that converts a five-membered ring into the six-membered ketamine skeleton.',
          dependsOnStepId: 'esk-w1',
          reagentsAndBuffer:
            'Bromine in carbon tetrachloride or dichloromethane; methylamine in benzene or toluene; decalin or another high-boiling hydrocarbon at reflux for the rearrangement',
        },
        {
          id: 'esk-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Tartrate resolution to the S-enantiomer',
          description:
            'Resolve racemic ketamine as its L-(+)-tartrate salt, recover the S-enantiomer free base, and convert to the hydrochloride. The R-enantiomer is a different drug with lower NMDA affinity and different clinical properties, so enantiomeric excess is the specification that defines the product.',
          dependsOnStepId: 'esk-w2',
          reagentsAndBuffer:
            'L-(+)-tartaric acid in aqueous ethanol; repeated recrystallisation; aqueous sodium hydroxide for free-basing; hydrogen chloride in ethanol; chiral HPLC for enantiomeric excess',
        },
        {
          id: 'esk-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Cortical neuron culture with NMDA receptor recording',
          description:
            'Prepare primary cortical neuron cultures on multi-electrode arrays or under whole-cell patch clamp, so that channel block can be observed in a cell that expresses the native receptor subunit composition rather than in a recombinant surrogate.',
          dependsOnStepId: 'esk-w3',
          reagentsAndBuffer:
            'Primary rat or human iPSC-derived cortical neurons, Neurobasal medium with B27 supplement, extracellular recording solution with glycine and nominally zero magnesium to relieve the resting block',
        },
        {
          id: 'esk-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Use-dependent channel block and downstream synaptic markers',
          description:
            'Measure NMDA-evoked current inhibition for the S- and R-enantiomers side by side to quantify the affinity difference, then measure the downstream markers the rapid-antidepressant hypothesis rests on: mTORC1 activation and synaptic protein expression. The second measurement is the one that is inferred rather than established in humans.',
          dependsOnStepId: 'esk-w4',
          reagentsAndBuffer:
            'NMDA and glycine as agonists, S- and R-ketamine reference standards, whole-cell patch-clamp amplifier; phospho-S6 and PSD-95 antibodies for immunoblot; BDNF ELISA on conditioned medium',
        },
      ],
    },
    keyAudits: [
      {
        id: 'esk-a1',
        category: 'measured',
        title: 'TRANSFORM-2: a 4.0-point MADRS separation at day 28',
        laymanSummary:
          'The one short-term trial that succeeded showed depression scores four points lower on esketamine than on placebo spray at four weeks, on a 60-point scale.',
        technicalDetails:
          'Popova et al. (NCT02418585) randomised 227 of 435 screened patients with treatment-resistant depression to flexibly dosed esketamine nasal spray plus a newly initiated oral antidepressant, or to placebo spray plus a newly initiated antidepressant; 197 completed the 28-day double-blind phase. Difference of least-squares means on MADRS at day 28 was -4.0 (SE 1.69, 95% CI -7.31 to -0.64). The five most common adverse events were dissociation, nausea, vertigo, dysgeusia and dizziness, all more frequent on esketamine; 7% versus 0.9% discontinued for an adverse event. Events generally appeared shortly after dosing and resolved by 1.5 hours.',
        evidenceSource: 'Popova V et al., Am J Psychiatry 2019;176:428-438',
        doi: '10.1176/appi.ajp.2019.19020172',
        measuredMetric: 'Change in MADRS total score from baseline to day 28',
        auditFlag: 'verified',
      },
      {
        id: 'esk-a2',
        category: 'failed',
        title: 'Two of the three short-term trials missed their primary endpoint',
        laymanSummary:
          'The fixed-dose trial and the trial in older adults both failed to reach statistical significance. Approval rested on the third.',
        technicalDetails:
          'TRANSFORM-1 (Fedgchin et al., NCT02417064, 346 registered): esketamine 84 mg versus placebo gave an LS means difference of -3.2 (95% CI -6.88 to 0.45), two-sided P=0.088 — statistical significance not achieved, and because of the testing hierarchy the 56 mg arm could not be formally tested (nominal difference -4.1, P=0.027). TRANSFORM-3 (Ochs-Ross et al., NCT02422186, 139 elderly patients): median-unbiased treatment difference -3.6 (95% CI -7.20 to 0.07), z=1.89, two-sided P=0.059 — the authors state that the primary endpoint was not achieved. Post-hoc, the effect was larger in patients aged 65 to 74 (-4.9, P=0.017 nominal) than in those 75 and older (-0.4, P=0.930).',
        evidenceSource:
          'Fedgchin M et al., Int J Neuropsychopharmacol 2019;22:616-630; Ochs-Ross R et al., Am J Geriatr Psychiatry 2020;28:121-141',
        doi: '10.1093/ijnp/pyz039',
        measuredMetric: 'Change in MADRS total score at day 28, fixed-dose and elderly populations',
        auditFlag: 'caution',
      },
      {
        id: 'esk-a3',
        category: 'measured',
        title:
          'SUSTAIN-1: relapse risk cut by half to two thirds in patients who had already responded',
        laymanSummary:
          'Among patients who got better on esketamine and then continued it, relapse over the following months was roughly half as likely as in those switched to placebo spray.',
        technicalDetails:
          'Daly et al. (NCT02493868) followed 297 adults into a randomised maintenance phase. Among 176 who achieved stable remission, relapse occurred in 24 of 90 (26.7%) on esketamine plus antidepressant versus 39 of 86 (45.3%) on antidepressant plus placebo (log-rank P=.003, NNT 6; HR 0.49, 95% CI 0.29 to 0.84). Among 121 with stable response, relapse occurred in 16 of 62 (25.8%) versus 34 of 59 (57.6%) (log-rank P<.001, NNT 4; HR 0.30, 95% CI 0.16 to 0.55). This is an enriched-withdrawal design: everybody randomised had already responded to esketamine, so the result describes maintenance, not initial efficacy.',
        evidenceSource: 'Daly EJ et al., JAMA Psychiatry 2019;76:893-903',
        doi: '10.1001/jamapsychiatry.2019.1189',
        measuredMetric: 'Time to relapse after randomised withdrawal',
        auditFlag: 'verified',
      },
      {
        id: 'esk-a4',
        category: 'inferred',
        title: 'Functional unblinding: a dissociative drug cannot be reliably placebo-controlled',
        laymanSummary:
          'Esketamine produces an unmistakable out-of-body sensation within minutes. Patients and raters can usually tell who got the real spray, which weakens every double-blind estimate in the programme.',
        technicalDetails:
          'Turner set out seven concerns about the approval: the reliance on a single positive short-term trial; the use of a two-of-three standard applied unevenly; the discontinuation-design maintenance trial being counted toward efficacy; the small absolute MADRS separations; deaths in the programme; the near-inevitable functional unblinding of a dissociative agent; and the choice of an active-comparator-free design. Horowitz and Moncrieff argued in the British Journal of Psychiatry that the field risks repeating past errors by treating a drug with obvious acute psychoactive effects as if it were blinded. Neither critique disputes that patients improved; both dispute how much of that improvement the placebo comparison can be trusted to isolate.',
        evidenceSource:
          'Turner EH, Lancet Psychiatry 2019;6:977-979; Horowitz MA, Moncrieff J, Br J Psychiatry 2021;219:614-617',
        doi: '10.1016/S2215-0366(19)30394-3',
        inferredClaim:
          'That the placebo-controlled MADRS differences in the esketamine programme measure a pharmacological effect uncontaminated by patients and raters knowing who received active drug',
        auditFlag: 'contested',
      },
      {
        id: 'esk-a5',
        category: 'measured',
        title: 'ESCAPE-TRD: beat quetiapine head to head on remission at week 8',
        laymanSummary:
          'Against the standard oral alternative, esketamine got more patients into remission at eight weeks — 27% against 18% — in a 676-patient randomised comparison.',
        technicalDetails:
          'Reif et al. (NCT04338321) randomised 336 patients to esketamine nasal spray plus an SSRI or SNRI and 340 to extended-release quetiapine plus an SSRI or SNRI. Remission at week 8 occurred in 91 of 336 (27.1%) versus 60 of 340 (17.6%), P=0.003. No relapse through week 32 after week-8 remission occurred in 73 of 336 (21.7%) versus 48 of 340 (14.1%). Over 32 weeks, remission, response and MADRS change all favoured esketamine. The trial was open-label by necessity — quetiapine and esketamine cannot be blinded against each other — which is a real limitation and also a reason it is not subject to the placebo-blinding objection.',
        evidenceSource: 'Reif A et al., N Engl J Med 2023;389:1298-1309',
        doi: '10.1056/NEJMoa2304145',
        measuredMetric: 'Remission (MADRS 10 or lower) at week 8',
        auditFlag: 'verified',
      },
      {
        id: 'esk-a6',
        category: 'measured',
        title:
          'Suicidal ideation: rapid symptom reduction, no measured effect on the ideation itself',
        laymanSummary:
          'In patients with active suicidal thoughts, esketamine reduced depression scores within a day. The suicidal ideation score itself did not separate from placebo.',
        technicalDetails:
          'Fu et al. reported the ASPIRE I trial in patients with major depressive disorder and active suicidal ideation with intent. The primary endpoint, change in MADRS total score at 24 hours, favoured esketamine plus standard of care. The key secondary endpoint of change in the Clinical Global Impression of Severity of Suicidality did not reach statistical significance. The approved indication is therefore worded as depressive symptoms in patients with acute suicidal ideation or behaviour, and the label does not claim a reduction in suicidal ideation or in suicide.',
        evidenceSource: 'Fu DJ et al., J Clin Psychiatry 2020;81:19m13191',
        doi: '10.4088/JCP.19m13191',
        measuredMetric: 'Change in MADRS total score at 24 hours; CGI-SS-r as key secondary',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Sprayed into the nose, in a clinic',
        laymanDesc:
          'The dose is given as a nasal spray under supervision, and the patient stays for at least two hours.',
        molecularDetail:
          'Intranasal administration bypasses first-pass metabolism, giving roughly 48% bioavailability and a peak plasma concentration within 20 to 40 minutes. Administration is restricted to REMS-certified healthcare settings with a minimum two-hour observation period after each dose.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Reaches the brain within minutes',
        laymanDesc:
          'It is small and greasy enough to cross into brain tissue almost immediately, which is why the effects start during the appointment.',
        molecularDetail:
          'High lipophilicity and low protein binding give rapid central nervous system penetration. Metabolised principally by CYP2B6 and CYP3A4 to noresketamine, which retains some NMDA activity.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Blocks the NMDA channel from the inside',
        laymanDesc:
          'It slips into the open pore of a glutamate receptor and plugs it, preferentially on the receptors that are firing most.',
        molecularDetail:
          'Non-competitive open-channel block of the NMDA receptor, requiring the channel to be open to bind, which makes the block use-dependent. Esketamine has roughly three to four times the NMDA affinity of the R-enantiomer.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'A glutamate burst, then new synapses — the part that is inferred',
        laymanDesc:
          'The leading explanation is that blocking these receptors on inhibitory cells releases a burst of glutamate that triggers the growth of new connections. Most of that evidence is from rodents.',
        molecularDetail:
          'The prevailing model holds that preferential block of NMDA receptors on GABAergic interneurons disinhibits pyramidal cells, producing a glutamate surge that activates AMPA receptors, BDNF release, TrkB signalling and mTORC1-dependent synaptogenesis in prefrontal cortex. The rodent evidence for this cascade is substantial. Direct human evidence that it is the mechanism of the antidepressant effect is not.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Depression scores fall within hours, and dissociation does too',
        laymanDesc:
          'Improvement can appear within a day. So can the dissociation, nausea and blood pressure rise, and they usually pass within 90 minutes.',
        molecularDetail:
          'Measured endpoints are MADRS change at 24 hours and 28 days, and time to relapse. Dissociation, sedation, vertigo, dysgeusia, nausea and transient blood pressure elevation appear shortly after dosing and generally resolve by about 1.5 hours.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'TRANSFORM-2 (NCT02418585)',
        phase: 'Phase 3',
        sampleSize: 227,
        primaryEndpoint: 'Change in MADRS total score from baseline to day 28',
        endpointMet: true,
        statisticalPValue:
          'Difference of least-squares means -4.0 (SE 1.69, 95% CI -7.31 to -0.64)',
        unreportedAdverseSignals:
          'Discontinuation for adverse events 7% versus 0.9%; dissociation, nausea, vertigo, dysgeusia and dizziness all more frequent on esketamine.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'TRANSFORM-1 (NCT02417064)',
        phase: 'Phase 3 fixed-dose',
        sampleSize: 346,
        primaryEndpoint: 'Change in MADRS total score from baseline to day 28, esketamine 84 mg',
        endpointMet: false,
        statisticalPValue: 'LS means difference -3.2 (95% CI -6.88 to 0.45), two-sided P = 0.088',
        unreportedAdverseSignals:
          'The 56 mg arm could not be formally tested because of the fixed testing sequence; its nominal difference was -4.1 (P = 0.027).',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'TRANSFORM-3 (NCT02422186)',
        phase: 'Phase 3 in patients aged 65 and older',
        sampleSize: 139,
        primaryEndpoint: 'Change in MADRS total score from baseline to day 28',
        endpointMet: false,
        statisticalPValue: 'Median-unbiased difference -3.6 (95% CI -7.20 to 0.07), P = 0.059',
        unreportedAdverseSignals:
          'Post-hoc, the effect was concentrated in patients aged 65-74 and absent in those 75 and older (-0.4, nominal P = 0.930).',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'SUSTAIN-1 (NCT02493868)',
        phase: 'Phase 3 randomised withdrawal',
        sampleSize: 297,
        primaryEndpoint: 'Time to relapse among patients in stable remission',
        endpointMet: true,
        statisticalPValue: 'Log-rank P = .003 (HR 0.49, 95% CI 0.29 to 0.84), NNT 6',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ESCAPE-TRD (NCT04338321)',
        phase: 'Phase 3b open-label active comparator',
        sampleSize: 676,
        primaryEndpoint: 'Remission at week 8 versus extended-release quetiapine',
        endpointMet: true,
        statisticalPValue: 'P = 0.003 (27.1% versus 17.6%)',
        unreportedAdverseSignals:
          'Open-label by necessity: esketamine and quetiapine cannot be blinded against one another.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 4.0-point MADRS separation from placebo spray at day 28 in TRANSFORM-2',
        'Relapse in 26.7% versus 45.3% among patients in stable remission in SUSTAIN-1, NNT 6',
        'Remission at week 8 in 27.1% versus 17.6% against extended-release quetiapine in ESCAPE-TRD',
        'Two of three short-term registration trials that did not achieve statistical significance on their primary endpoint',
      ],
      unsupportedInferences: [
        'That the placebo-controlled effect sizes are uncontaminated by functional unblinding, when the drug produces unmistakable dissociation within minutes',
        'That esketamine reduces suicidal ideation — the ASPIRE key secondary endpoint on ideation did not reach significance, and the label claims depressive symptoms only',
        'That the rodent glutamate-burst and synaptogenesis cascade is the demonstrated human mechanism',
      ],
      whatFailedInitially: [
        'TRANSFORM-1: primary endpoint missed at 84 mg (P=0.088), with the 56 mg arm untestable under the fixed sequence',
        'TRANSFORM-3: primary endpoint missed in patients aged 65 and older (P=0.059), with no signal at all above 75',
        'ASPIRE: the suicidal ideation key secondary endpoint did not separate from placebo',
      ],
      realWorldOutcome: [
        'Administered only in REMS-certified settings with a two-hour observation period, which makes it a clinic service rather than a prescription',
        'US pharmacy acquisition cost is about US$397 per 56 mg dose pack (CMS NADAC, effective 17 Dec 2025), against pennies per dose for the oral antidepressants it is added to',
      ],
    },
    deliverySystem: {
      type: 'Intranasal spray device, administered under supervision in a certified healthcare setting',
      description:
        'Single-use nasal spray devices delivering 28 mg each, used in combination to give 56 or 84 mg. Self-administered by the patient under direct observation, with blood pressure checked before and after and at least two hours of monitoring. It cannot be dispensed for home use.',
      safetyProfile:
        'The US label carries a boxed warning covering sedation, dissociation, abuse and misuse, and increased risk of suicidal thoughts and behaviours; the product is available only through a restricted programme under a Risk Evaluation and Mitigation Strategy. Common adverse effects are dissociation, dizziness, nausea, sedation, vertigo, dysgeusia and transient blood pressure elevation. Esketamine is a Schedule III controlled substance in the United States.',
    },
    commonQuestions: [
      {
        q: 'It failed two of three trials. How was it approved?',
        a: "The FDA accepted a package consisting of one positive short-term trial (TRANSFORM-2, a 4.0-point MADRS separation) plus a positive randomised-withdrawal maintenance trial (SUSTAIN-1) as substantial evidence of effectiveness, in a population — depression that has failed at least two antidepressants — with no approved options. TRANSFORM-1 missed at P=0.088 and TRANSFORM-3 missed at P=0.059. Turner's Lancet Psychiatry critique lists this as one of seven concerns, in particular the counting of a discontinuation-design study toward efficacy. Both facts are true: the approval was defensible on unmet need, and the efficacy package was thinner than the usual two adequate and well-controlled trials.",
        auditNote:
          'The approval relied on one positive short-term trial plus a randomised-withdrawal maintenance trial; the other two short-term trials missed their primary endpoints.',
      },
      {
        q: 'What does "functional unblinding" mean and why does it matter here?',
        a: 'A double-blind trial only works if nobody can tell which arm they are in. Esketamine causes dissociation — a distinct out-of-body feeling — within minutes, in a substantial proportion of patients. Both the patient and the clinician rating their depression score can usually guess correctly. When that happens, expectation effects load onto the active arm and away from placebo, and the measured difference includes some unknown amount of that. It does not mean the drug does nothing; ESCAPE-TRD beat an active comparator. It means the size of the placebo-controlled effect is less certain than the confidence intervals suggest.',
      },
      {
        q: 'Does it stop people from taking their own lives?',
        a: 'That has not been shown, and the label does not claim it. The indication is worded as depressive symptoms in adults with major depressive disorder with acute suicidal ideation or behaviour, because the ASPIRE trials met their primary endpoint of rapid MADRS reduction at 24 hours while the key secondary endpoint measuring suicidal ideation itself did not reach statistical significance. Faster relief of depressive symptoms in a person at acute risk is clinically valuable; it is not the same claim as a reduction in suicide.',
        auditNote:
          'The distinction between the indication wording and the popular understanding of it is one of the clearest examples of inference overreach in modern psychiatry labelling.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no verifiable per-dose cost-of-production figure for esketamine could be cited, and this file does not estimate one. The US pharmacy acquisition cost from the CMS NADAC file is about US$397 per 56 mg dose pack, and that is before the clinic visit and two hours of observation the label requires. That is a price, not a manufacturing cost.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Popova V et al. Efficacy and safety of flexibly dosed esketamine nasal spray combined with a newly initiated oral antidepressant in treatment-resistant depression (TRANSFORM-2). Am J Psychiatry 2019;176:428-438',
        identifier: '10.1176/appi.ajp.2019.19020172',
        kind: 'doi',
      },
      {
        label:
          'Fedgchin M et al. Efficacy and safety of fixed-dose esketamine nasal spray combined with a new oral antidepressant in treatment-resistant depression (TRANSFORM-1). Int J Neuropsychopharmacol 2019;22:616-630',
        identifier: '10.1093/ijnp/pyz039',
        kind: 'doi',
      },
      {
        label:
          'Ochs-Ross R et al. Efficacy and safety of esketamine nasal spray plus an oral antidepressant in elderly patients with treatment-resistant depression (TRANSFORM-3). Am J Geriatr Psychiatry 2020;28:121-141',
        identifier: '10.1016/j.jagp.2019.10.008',
        kind: 'doi',
      },
      {
        label:
          'Daly EJ et al. Efficacy of esketamine nasal spray plus oral antidepressant treatment for relapse prevention (SUSTAIN-1). JAMA Psychiatry 2019;76:893-903',
        identifier: '10.1001/jamapsychiatry.2019.1189',
        kind: 'doi',
      },
      {
        label:
          'Reif A et al. Esketamine nasal spray versus quetiapine for treatment-resistant depression (ESCAPE-TRD). N Engl J Med 2023;389:1298-1309',
        identifier: '10.1056/NEJMoa2304145',
        kind: 'doi',
      },
      {
        label:
          'Turner EH. Esketamine for treatment-resistant depression: seven concerns about efficacy and FDA approval. Lancet Psychiatry 2019;6:977-979',
        identifier: '10.1016/S2215-0366(19)30394-3',
        kind: 'doi',
      },
      {
        label:
          'Horowitz MA, Moncrieff J. Are we repeating mistakes of the past? A review of the evidence for esketamine. Br J Psychiatry 2021;219:614-617',
        identifier: '10.1192/bjp.2020.89',
        kind: 'doi',
      },
      {
        label:
          'Fu DJ et al. Esketamine nasal spray for rapid reduction of major depressive disorder symptoms in patients who have active suicidal ideation with intent (ASPIRE I). J Clin Psychiatry 2020;81:19m13191',
        identifier: '10.4088/JCP.19m13191',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA: SPRAVATO (esketamine hydrochloride), NDA 211243, approved 5 March 2019',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=211243',
        kind: 'regulatory',
      },
      {
        label: 'SPRAVATO (esketamine) nasal spray, US prescribing information — DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d81a6a79-a74a-44b7-822c-0dfa3036eaed',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 182137 — esketamine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/182137',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 7. Naltrexone
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'naltrexone',
    name: 'Naltrexone',
    tradeName: 'ReVia / Vivitrol',
    sponsor: 'DuPont (oral), Alkermes (extended-release injectable)',
    targetGene: 'OPRM1',
    targetProtein: 'Mu-opioid receptor (with kappa and delta antagonism)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1984,
    indication:
      'Treatment of alcohol dependence, and blockade of the effects of exogenously administered opioids; the extended-release injectable is indicated for alcohol dependence and for prevention of relapse to opioid dependence after opioid detoxification',
    patientFriendlyIndication:
      'Alcohol use disorder, and relapse prevention in opioid use disorder',
    anatomicalSite:
      'Mu-opioid receptors in ventral tegmental area, nucleus accumbens and brainstem',
    conditionContext: {
      conditionExplainer:
        'Naltrexone blocks opioid receptors rather than stimulating them. In alcohol use disorder it blunts the reward that follows a drink; in opioid use disorder it makes an opioid dose have no effect at all.',
      whyItMatters:
        'Because it is a pure antagonist, naltrexone has no abuse potential and no withdrawal on stopping. That also means a patient must be fully detoxified before starting it, and that is where most of its real-world failures happen.',
      whoTakesThis:
        'Adults with alcohol use disorder, and adults with opioid use disorder who have already completed withdrawal. Naltrexone must not be started in anyone with opioids on board — it will precipitate severe withdrawal.',
      clinicalGoals:
        'Fewer heavy drinking days in alcohol use disorder, or sustained abstinence from opioids once induction has been achieved.',
    },
    oneSentenceVerdict:
      'An opioid receptor blocker with a modest but replicated effect in alcohol use disorder (number needed to treat 12 to prevent return to heavy drinking), and an opioid indication whose real-world limitation is not the drug but the detoxification required before it can be started.',
    laymanHowItWorks:
      "Alcohol and opioids both end up releasing the body's own opioid-like chemicals, which is a large part of why they feel rewarding. Naltrexone sits in the same receptors those chemicals use and does nothing there — it just occupies the seat. Drinking still happens, but it delivers less of a payoff, and taking an opioid on top of naltrexone produces no effect at all.",
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    substitutes: {
      summary:
        'For alcohol use disorder, acamprosate has an equal or slightly better number needed to treat and a different failure mode. For opioid use disorder, buprenorphine and methadone are easier to start and have mortality evidence naltrexone does not.',
      conventionalRx: [
        {
          name: 'Acamprosate',
          class: 'Glutamatergic modulator for alcohol use disorder',
          howItCompares:
            'Number needed to treat 12 to prevent return to any drinking, against 20 for oral naltrexone in the same review; the two showed no statistically significant difference when compared head to head.',
          typicalCost: '',
          prosAndCons:
            'Pros: no hepatic concerns, safe in liver disease. Cons: three-times-daily dosing, and it showed no effect in the COMBINE trial.',
        },
        {
          name: 'Buprenorphine-naloxone',
          class: 'Partial mu-opioid agonist for opioid use disorder',
          howItCompares:
            'In X:BOT, 94% of patients assigned to buprenorphine-naloxone were successfully inducted against 72% assigned to extended-release naltrexone, and that induction gap drove the whole difference in relapse.',
          typicalCost:
            'US$0.72 per 8 mg / 2 mg sublingual tablet at pharmacy acquisition cost (CMS NADAC, effective 17 Dec 2025)',
          prosAndCons:
            'Pros: can be started while still using, mortality benefit demonstrated. Cons: it is an opioid, with its own dependence and diversion questions.',
        },
        {
          name: 'Topiramate (off-label for alcohol use disorder)',
          class: 'Anticonvulsant',
          howItCompares:
            'Moderate evidence of an association with reduced heavy drinking days (weighted mean difference -9.0%, 95% CI -15.3 to -2.7) in the same systematic review, without an approved indication.',
          typicalCost: '',
          prosAndCons:
            'Pros: real effect size, cheap generic. Cons: off-label, cognitive side effects, requires titration.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Carry documentation that you are on an opioid blocker',
          action:
            'Keep a card or medical alert stating that you take naltrexone, and tell any treating clinician before surgery or emergency care.',
          patientImpact:
            'While naltrexone occupies the receptor, opioid analgesia will not work normally. Emergency pain management requires a different plan, and attempts to override the blockade with large opioid doses are dangerous.',
          clinicalPrecaution:
            'Opioid tolerance falls during naltrexone treatment. Returning to a previously usual opioid dose after stopping naltrexone carries a high overdose risk.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CC1CN2CC[C@]34[C@@H]5C(=O)CC[C@]3([C@H]2CC6=C4C(=C(C=C6)O)O5)O',
      chemicalFormula: 'C20H23NO4',
      molecularWeight: '341.4 g/mol (free base); marketed as naltrexone hydrochloride',
      targetReceptorAffinity:
        'Competitive antagonist with highest affinity at the mu-opioid receptor and lower affinity at kappa and delta; the N-cyclopropylmethyl group in place of N-methyl is what converts an agonist scaffold into an antagonist',
      structureSource: {
        label: 'PubChem CID 5360515 (naltrexone) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5360515',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'nal-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the oxymorphone intermediate',
          description:
            'Confirm identity, purity and residual solvent profile of the oxymorphone starting material, which is itself derived from thebaine. Morphinan-related impurities at this stage carry through the whole sequence and are controlled as named alkaloid specifications.',
          reagentsAndBuffer:
            'Oxymorphone reference standard, HPLC with UV at 230 nm, thin-layer chromatography against morphinan alkaloid markers, loss on drying, 1H NMR in DMSO-d6',
        },
        {
          id: 'nal-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'N-demethylation and N-cyclopropylmethylation',
          description:
            'Remove the N-methyl group from oxymorphone and reinstall a cyclopropylmethyl group on the same nitrogen. This single substitution is what turns a potent agonist into a pure antagonist, and it is the whole chemical basis of the drug.',
          dependsOnStepId: 'nal-w1',
          reagentsAndBuffer:
            'Cyanogen bromide or a chloroformate for N-demethylation followed by hydrolysis; cyclopropylmethyl bromide with a base such as sodium bicarbonate in dimethylformamide; aqueous workup',
        },
        {
          id: 'nal-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride crystallisation and alkaloid impurity control',
          description:
            'Form and recrystallise the hydrochloride salt, then assay for residual noroxymorphone, oxymorphone and 10-hydroxy degradation products. Naltrexone is a controlled precursor in several jurisdictions, so chain-of-custody documentation is part of the purification record.',
          dependsOnStepId: 'nal-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol; recrystallisation from ethanol/water; gradient HPLC with UV and mass detection for related substances',
        },
        {
          id: 'nal-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Mu-, kappa- and delta-opioid receptor cell lines in parallel',
          description:
            'Express human OPRM1, OPRK1 and OPRD1 in separate CHO or HEK293 lines so that selectivity is measured rather than assumed. Naltrexone is described as a mu antagonist, and its kappa antagonism is clinically relevant to the alcohol indication.',
          dependsOnStepId: 'nal-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human OPRM1, OPRK1 or OPRD1; Ham F-12 or DMEM with 10% fetal bovine serum and selection antibiotic',
        },
        {
          id: 'nal-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Radioligand displacement and functional antagonism',
          description:
            'Measure displacement of a labelled opioid ligand at each receptor to derive Ki values, and confirm functional antagonism by showing suppression of agonist-stimulated GTP-gamma-S binding or cyclic AMP inhibition with no effect when given alone.',
          dependsOnStepId: 'nal-w4',
          reagentsAndBuffer:
            '[3H]-DAMGO for mu, [3H]-U69,593 for kappa, [3H]-DPDPE for delta; [35S]-GTP-gamma-S with GDP in Tris-magnesium-sodium buffer; forskolin-stimulated cyclic AMP assay for the functional readout',
        },
      ],
    },
    keyAudits: [
      {
        id: 'nal-a1',
        category: 'measured',
        title: 'COMBINE: naltrexone reduced the risk of a heavy drinking day, acamprosate did not',
        laymanSummary:
          'In the largest US trial of alcohol treatment, adding naltrexone to medical management cut the chance of a heavy drinking day by about a quarter. Acamprosate showed nothing in the same trial.',
        technicalDetails:
          'Anton et al. (NCT00006206) randomised 1,383 patients across eight groups. Percent days abstinent was 80.6 with naltrexone plus medical management, 79.2 with combined behavioural intervention plus medical management, 77.1 with both, and 75.1 with placebo plus medical management; the naltrexone-by-behavioural-intervention interaction was significant (P=.009). Naltrexone reduced the risk of a heavy drinking day over time (hazard ratio 0.72, 97.5% CI 0.53 to 0.98, P=.02), most evident in patients receiving medical management without the behavioural intervention. Acamprosate showed no significant effect alone or in any combination. One year after treatment the between-group effects were similar but no longer significant.',
        evidenceSource: 'Anton RF et al., JAMA 2006;295:2003-2017',
        doi: '10.1001/jama.295.17.2003',
        measuredMetric: 'Percent days abstinent, and hazard of a first heavy drinking day',
        auditFlag: 'verified',
      },
      {
        id: 'nal-a2',
        category: 'measured',
        title: 'Number needed to treat 12 to prevent return to heavy drinking',
        laymanSummary:
          'Pooling 53 naltrexone trials, twelve people have to take it for one extra person to avoid returning to heavy drinking. That is a real effect and a modest one.',
        technicalDetails:
          "Jonas et al. included 122 randomised trials and one cohort study, 22,803 participants. For oral naltrexone 50 mg daily, the number needed to treat to prevent return to heavy drinking was 12 (95% CI 8 to 26; risk difference -0.09, 95% CI -0.13 to -0.04); to prevent return to any drinking it was 20 (95% CI 11 to 500). Acamprosate's NNT to prevent return to any drinking was 12 (8 to 26). Direct comparison of the two found no statistically significant difference. Number needed to harm for withdrawal from trials due to adverse events was 48 (30 to 112) for naltrexone.",
        evidenceSource: 'Jonas DE et al., JAMA 2014;311:1889-1900',
        doi: '10.1001/jama.2014.3628',
        measuredMetric: 'Number needed to treat to prevent return to heavy drinking',
        auditFlag: 'verified',
      },
      {
        id: 'nal-a3',
        category: 'failed',
        title:
          'X:BOT: the injectable lost on intention to treat, entirely because of induction failure',
        laymanSummary:
          'Extended-release naltrexone looked worse than buprenorphine overall, but almost all of the difference came from patients who never managed to start it. Among those who did start, the two were equal.',
        technicalDetails:
          'Lee et al. (NCT02032433) randomised 570 patients with opioid use disorder. Induction succeeded in 204 of 283 (72%) assigned to extended-release naltrexone versus 270 of 287 (94%) assigned to buprenorphine-naloxone (P<0.0001). In the intention-to-treat population, 24-week relapse occurred in 185 of 283 (65%) versus 163 of 287 (57%), hazard ratio 1.36 (95% CI 1.10 to 1.68) — but 70 of the 79 naltrexone induction failures (89%) accounted for most or all of that difference. In the per-protocol population of 474 successfully inducted patients, relapse events were similar (P=0.44), as were opioid-negative urines and abstinent days. Five fatal overdoses occurred, two on naltrexone and three on buprenorphine.',
        evidenceSource: 'Lee JD et al., Lancet 2018;391:309-318',
        doi: '10.1016/S0140-6736(17)32812-X',
        measuredMetric: 'Successful induction rate, and 24-week relapse by intention to treat',
        auditFlag: 'verified',
      },
      {
        id: 'nal-a4',
        category: 'inferred',
        title: 'No mortality benefit demonstrated, and the comparison is not a fair one',
        laymanSummary:
          'A large cohort study found reduced death rates with buprenorphine and methadone after an overdose, and no such association for naltrexone — but only 6% of the cohort received naltrexone and mostly for a month.',
        technicalDetails:
          'Larochelle et al. followed opioid overdose survivors in Massachusetts. Methadone was associated with reduced all-cause mortality (adjusted hazard ratio 0.47, 95% CI 0.32 to 0.71) and opioid-related mortality (0.41, 0.24 to 0.70); buprenorphine with 0.63 (0.46 to 0.87) and 0.62 (0.41 to 0.92). No association was identified for naltrexone (all-cause AHR 1.44, 95% CI 0.84 to 2.46; opioid-related 1.42, 0.73 to 2.79). The authors explicitly flag the limitation: only 1,099 people (6%) received naltrexone, for a median of one month, against a median of four to five months for the agonists. This is an absence of evidence with a stated reason, not a demonstrated absence of effect.',
        evidenceSource: 'Larochelle MR et al., Ann Intern Med 2018;169:137-145',
        doi: '10.7326/M17-3107',
        inferredClaim:
          'That naltrexone does not reduce mortality in opioid use disorder — a conclusion the study itself declines to draw because of how few people received it and for how briefly',
        auditFlag: 'caution',
      },
      {
        id: 'nal-a5',
        category: 'measured',
        title:
          'Krupitsky: extended-release naltrexone tripled confirmed abstinent weeks against placebo',
        laymanSummary:
          'In a placebo-controlled trial in patients who had already completed detoxification, monthly naltrexone injections produced 90% confirmed abstinent weeks against 35% on placebo.',
        technicalDetails:
          'Krupitsky et al. randomised 250 patients (126 to extended-release naltrexone, 124 to placebo) in a multicentre Russian trial. Median proportion of weeks of confirmed abstinence was 90.0% (95% CI 69.9 to 92.4) versus 35.0% (11.4 to 63.8), P=0.0002. Self-reported opioid-free days were 99.2% versus 60.4% (P=0.0004). Median retention exceeded 168 days versus 96 days (P=0.0042). Naloxone challenge confirmed relapse to physiological dependence in 17 placebo patients versus one on naltrexone. Two patients in each group discontinued for adverse events; no naltrexone-treated patient died or overdosed. The trial enrolled only patients already detoxified, which is exactly the population X:BOT showed is hard to assemble in practice.',
        evidenceSource: 'Krupitsky E et al., Lancet 2011;377:1506-1513',
        doi: '10.1016/S0140-6736(11)60358-9',
        measuredMetric: 'Median proportion of weeks with confirmed opioid abstinence',
        auditFlag: 'verified',
      },
      {
        id: 'nal-a6',
        category: 'failed',
        title: 'Low-dose naltrexone did not beat placebo for fibromyalgia pain',
        laymanSummary:
          'The best randomised test of low-dose naltrexone in fibromyalgia — a use widely promoted online — found no difference from placebo on pain.',
        technicalDetails:
          'Due Bruun et al. randomised 99 women with fibromyalgia to naltrexone 6 mg daily (n=49) or placebo (n=50) with no loss to follow-up. Mean change in pain intensity was -1.3 points (95% CI -1.7 to -0.8) on low-dose naltrexone and -0.9 (-1.4 to -0.5) on placebo, a between-group difference of -0.34 (95% CI -0.95 to 0.27; p=0.27, Cohen\'s d 0.23). Adverse events occurred in 84% versus 86%. The authors reported a possible signal on memory symptoms and recommended it be investigated. An accompanying commentary in the same journal was titled "Is low-dose naltrexone for fibromyalgia another treatment disappointment?"',
        evidenceSource: 'Due Bruun K et al., Lancet Rheumatol 2024;6:e31-e39',
        doi: '10.1016/S2665-9913(23)00278-3',
        measuredMetric: 'Between-group difference in pain intensity change',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed daily, or injected monthly',
        laymanDesc:
          'Two very different products: a daily tablet, and a monthly injection into muscle that releases slowly from a polymer.',
        molecularDetail:
          'Oral naltrexone undergoes extensive first-pass metabolism to 6-beta-naltrexol, which is itself an antagonist and circulates at higher concentrations than the parent. The extended-release injectable suspends naltrexone in a polylactide-co-glycolide microsphere matrix for once-monthly intramuscular administration, bypassing first pass entirely.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Distributes to opioid receptors throughout the brain',
        laymanDesc:
          "It reaches the reward circuits and the brainstem, where the body's own opioid signals normally act.",
        molecularDetail:
          'Crosses the blood-brain barrier and occupies mu-opioid receptors in the ventral tegmental area, nucleus accumbens and brainstem. Receptor occupancy after a monthly injection remains high for weeks, which is what gives the depot formulation its dosing interval.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Occupies the receptor and does nothing',
        laymanDesc:
          'It fits the lock but does not turn it, and while it is there nothing else can get in.',
        molecularDetail:
          'Competitive antagonism at mu-opioid receptors with lower-affinity kappa and delta antagonism. No intrinsic activity: naltrexone produces no euphoria, no analgesia and no respiratory depression, and stopping it produces no withdrawal.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The reward signal that follows a drink is blunted',
        laymanDesc:
          "Alcohol releases the body's own opioid-like chemicals, which is part of why a first drink leads to a second. With the receptors occupied, that chain is weakened.",
        molecularDetail:
          'Alcohol consumption triggers endogenous beta-endorphin release that disinhibits ventral tegmental dopamine neurons. Mu-receptor blockade attenuates that alcohol-induced dopamine response, which is the pharmacological basis for the reduction in heavy drinking days rather than in drinking at all.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer heavy drinking days, or complete opioid blockade',
        laymanDesc:
          'In alcohol use disorder the measurable result is fewer heavy drinking days, not abstinence. In opioid use disorder it is that an opioid dose has no effect.',
        molecularDetail:
          'Measured endpoints are percent days abstinent, hazard of a heavy drinking day, and confirmed opioid-negative urine. The clinical constraint that dominates practice is that a patient must be fully withdrawn before the first dose, because antagonism in a physically dependent patient precipitates severe withdrawal.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'COMBINE (NCT00006206)',
        phase: 'Phase 3',
        sampleSize: 1383,
        primaryEndpoint:
          'Percent days abstinent and time to first heavy drinking day over 16 weeks',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 0.72 for a heavy drinking day (97.5% CI 0.53 to 0.98, P = .02); naltrexone-by-behavioural-intervention interaction P = .009',
        unreportedAdverseSignals:
          'Acamprosate showed no significant effect in any combination, which was not the pre-trial expectation.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'X:BOT (NCT02032433)',
        phase: 'Phase 4 comparative effectiveness',
        sampleSize: 570,
        primaryEndpoint: '24-week opioid relapse events, intention to treat',
        endpointMet: false,
        statisticalPValue:
          'Hazard ratio 1.36 (95% CI 1.10 to 1.68) against buprenorphine-naloxone by intention to treat; P = 0.44 in the per-protocol population',
        unreportedAdverseSignals:
          'Five fatal overdoses, two in the naltrexone group and three in the buprenorphine group; mild-to-moderate injection site reactions.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Krupitsky extended-release naltrexone trial',
        phase: 'Phase 3',
        sampleSize: 250,
        primaryEndpoint: 'Proportion of weeks with confirmed opioid abstinence',
        endpointMet: true,
        statisticalPValue: 'P = 0.0002 (median 90.0% versus 35.0%)',
        unreportedAdverseSignals:
          'Two discontinuations for adverse events in each group; no deaths or overdoses in the naltrexone group.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'FINAL low-dose naltrexone in fibromyalgia',
        phase: 'Randomised double-blind placebo-controlled trial',
        sampleSize: 99,
        primaryEndpoint: 'Change in pain intensity',
        endpointMet: false,
        statisticalPValue: 'Between-group difference -0.34 (95% CI -0.95 to 0.27), p = 0.27',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A hazard ratio of 0.72 for a heavy drinking day in 1,383 patients, with a significant interaction with behavioural treatment',
        'Number needed to treat 12 to prevent return to heavy drinking, pooled across 53 naltrexone trials',
        '90.0% versus 35.0% confirmed abstinent weeks in 250 already-detoxified opioid-dependent patients',
        'An induction success rate of 72% against 94% for buprenorphine-naloxone in 570 randomised patients',
      ],
      unsupportedInferences: [
        'That naltrexone is inferior to buprenorphine once treatment has started — the per-protocol comparison in X:BOT showed no difference (P=0.44)',
        'That the absence of a mortality association in the Larochelle cohort demonstrates no mortality benefit, when only 6% received naltrexone and for a median of one month',
        'That low-dose naltrexone relieves fibromyalgia pain, which the best randomised test did not find',
      ],
      whatFailedInitially: [
        'X:BOT intention-to-treat result, driven almost entirely by patients who never completed induction',
        'Low-dose naltrexone in fibromyalgia: no separation from placebo on the primary pain endpoint',
        'Acamprosate, tested alongside naltrexone in COMBINE, showed no effect at all in that trial despite positive European evidence',
      ],
      realWorldOutcome: [
        'Naltrexone is the only medication for opioid use disorder with no abuse potential and no withdrawal on stopping, which makes it the preferred option in settings where an agonist is unacceptable',
        'The requirement for complete detoxification before the first dose is the practical barrier that X:BOT quantified: nearly three in ten patients assigned to it never started',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet daily, or extended-release intramuscular injection monthly',
      description:
        'The 50 mg oral tablet is taken daily; the extended-release injectable suspension delivers 380 mg into the gluteal muscle every four weeks from a polylactide-co-glycolide microsphere depot. The injectable removes the daily adherence question and replaces it with a monthly clinic visit.',
      safetyProfile:
        'A boxed warning for hepatotoxicity was removed from the US labelling in 2013 after the accumulated evidence did not support it; hepatic monitoring precautions remain. Naltrexone will precipitate severe opioid withdrawal in a physically dependent patient, so complete detoxification is required first. Opioid tolerance falls during treatment, so overdose risk is elevated if opioid use resumes after stopping. The injectable carries a risk of injection-site reactions including necrosis.',
    },
    commonQuestions: [
      {
        q: 'Is naltrexone worse than buprenorphine for opioid use disorder?',
        a: 'Not once you are on it. X:BOT randomised 570 patients and found more relapse on extended-release naltrexone by intention to treat (hazard ratio 1.36), but 89% of the excess came from the 79 patients who never completed induction. Among the 474 patients who were successfully inducted, relapse rates, opioid-negative urines and abstinent days were all statistically indistinguishable between the two drugs. The difference is a starting problem, not a maintenance problem — naltrexone requires full detoxification first and buprenorphine does not.',
        auditNote:
          'The intention-to-treat headline and the per-protocol result point in different directions, and reporting only one of them misrepresents the trial in either direction.',
      },
      {
        q: 'How big is the effect in alcohol use disorder, really?',
        a: 'Twelve people need to take oral naltrexone for one extra person to avoid returning to heavy drinking, with a 95% confidence interval from 8 to 26. To prevent return to any drinking, the number needed to treat is 20 with an interval running from 11 to 500. That is a real, replicated effect and a modest one, and it is comparable to acamprosate rather than better. The COMBINE trial also found the effect was clearest when naltrexone was given with medical management rather than with intensive behavioural therapy, which is an unusual and clinically useful finding.',
      },
      {
        q: 'Does low-dose naltrexone work for fibromyalgia or long COVID?',
        a: 'For fibromyalgia the best randomised evidence says no. A 99-patient double-blind trial of naltrexone 6 mg daily found a between-group difference in pain of -0.34 points, 95% CI -0.95 to 0.27, p=0.27, with no loss to follow-up. The accompanying editorial in the same journal called it another treatment disappointment. There is a possible signal on memory symptoms the authors flagged for future study. This page makes no statement about long COVID because there is no verified randomised evidence to state.',
        auditNote:
          'Low-dose naltrexone is heavily promoted online for a long list of conditions. This page records only what has been tested and reported.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no verifiable per-dose cost-of-production figure for naltrexone could be cited, and this file does not estimate one. The US pharmacy acquisition cost from the CMS NADAC file is about US$1.26 per 50 mg tablet — notably higher than most of the generics on this site, and still a price rather than a manufacturing cost. The extended-release injectable is priced in an entirely different range and is not quoted here.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Anton RF et al. Combined pharmacotherapies and behavioral interventions for alcohol dependence: the COMBINE study. JAMA 2006;295:2003-2017',
        identifier: '10.1001/jama.295.17.2003',
        kind: 'doi',
      },
      {
        label:
          'Jonas DE et al. Pharmacotherapy for adults with alcohol use disorders in outpatient settings: a systematic review and meta-analysis. JAMA 2014;311:1889-1900',
        identifier: '10.1001/jama.2014.3628',
        kind: 'doi',
      },
      {
        label:
          'Lee JD et al. Comparative effectiveness of extended-release naltrexone versus buprenorphine-naloxone for opioid relapse prevention (X:BOT). Lancet 2018;391:309-318',
        identifier: '10.1016/S0140-6736(17)32812-X',
        kind: 'doi',
      },
      {
        label:
          'Krupitsky E et al. Injectable extended-release naltrexone for opioid dependence: a double-blind, placebo-controlled, multicentre randomised trial. Lancet 2011;377:1506-1513',
        identifier: '10.1016/S0140-6736(11)60358-9',
        kind: 'doi',
      },
      {
        label:
          'Larochelle MR et al. Medication for opioid use disorder after nonfatal opioid overdose and association with mortality. Ann Intern Med 2018;169:137-145',
        identifier: '10.7326/M17-3107',
        kind: 'doi',
      },
      {
        label:
          'Due Bruun K et al. Naltrexone 6 mg once daily versus placebo in women with fibromyalgia. Lancet Rheumatol 2024;6:e31-e39',
        identifier: '10.1016/S2665-9913(23)00278-3',
        kind: 'doi',
      },
      {
        label:
          'Häuser W. Is low-dose naltrexone for fibromyalgia another treatment disappointment? Lancet Rheumatol 2024;6:e2-e3',
        identifier: '10.1016/S2665-9913(23)00297-7',
        kind: 'doi',
      },
      {
        label: 'X:BOT — extended-release naltrexone versus buprenorphine for opioid treatment',
        identifier: 'NCT02032433',
        kind: 'nct',
      },
      {
        label: 'Drugs@FDA: REVIA (naltrexone hydrochloride), NDA 018932, approved 20 November 1984',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018932',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: VIVITROL (naltrexone extended-release injectable), NDA 021897, approved 13 April 2006',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021897',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5360515 — naltrexone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5360515',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 8. Buprenorphine
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'buprenorphine',
    name: 'Buprenorphine',
    tradeName: 'Subutex / Suboxone / Butrans / Belbuca / Sublocade',
    sponsor: 'Reckitt Benckiser, later Indivior; originally synthesised at Reckitt & Colman',
    targetGene: 'OPRM1',
    targetProtein: 'Mu-opioid receptor (partial agonist) and kappa-opioid receptor (antagonist)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2002,
    indication:
      'Treatment of opioid use disorder; separate formulations are indicated for the management of pain severe enough to require an opioid analgesic',
    patientFriendlyIndication: 'Opioid use disorder, and severe long-term pain',
    anatomicalSite:
      'Mu- and kappa-opioid receptors in brainstem respiratory centres, ventral tegmental area and dorsal horn',
    conditionContext: {
      conditionExplainer:
        'Buprenorphine is a partial agonist: it turns the opioid receptor on, but only part of the way, and it holds on very tightly. That combination is why it relieves withdrawal without producing the full effect of a strong opioid, and why it displaces other opioids from the receptor.',
      whyItMatters:
        'The partial agonism produces a ceiling on respiratory depression that full agonists do not have. That single pharmacological property is the reason buprenorphine can be prescribed from an ordinary clinic when methadone cannot.',
      whoTakesThis:
        'Adults and adolescents aged 16 and older with opioid use disorder. Separate transdermal and buccal formulations are used for chronic pain at much lower doses.',
      clinicalGoals:
        'Retention in treatment, suppression of illicit opioid use, and — the outcome that matters most — staying alive.',
    },
    oneSentenceVerdict:
      'A tightly binding partial opioid agonist that keeps people in treatment better than placebo at every dose tested, and is associated with roughly a halving of all-cause mortality in the year after an overdose — with a ceiling on respiratory depression that is its defining safety property and a precipitated-withdrawal risk that is its defining practical problem.',
    laymanHowItWorks:
      'Opioid receptors work like a dimmer switch. Heroin and fentanyl turn it all the way up, which is what stops breathing at high doses. Buprenorphine turns it partway up and then refuses to go further, however much you take. It also grips the receptor far more tightly than other opioids, so it pushes them off and keeps them off. That is why it stops withdrawal without producing a full high, and also why taking it too soon after another opioid throws the person straight into withdrawal.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 86,
    substitutes: {
      summary:
        'Methadone retains patients better and requires daily attendance at a licensed clinic. Extended-release naltrexone has no abuse potential and cannot be started until detoxification is complete. All three are supported; none is universally better.',
      conventionalRx: [
        {
          name: 'Methadone',
          class: 'Full mu-opioid agonist',
          howItCompares:
            'Better at retaining patients in treatment than flexible-dose buprenorphine (RR 0.83 favouring methadone, 95% CI 0.72 to 0.95; 5 studies, 788 participants), with no difference in suppression of illicit use among those retained.',
          typicalCost: '',
          prosAndCons:
            'Pros: highest retention, decades of mortality evidence. Cons: full agonist with no respiratory ceiling, and in most countries it requires daily supervised dosing at a licensed clinic.',
        },
        {
          name: 'Extended-release naltrexone',
          class: 'Mu-opioid antagonist',
          howItCompares:
            'Equal to buprenorphine-naloxone once successfully started, but only 72% of patients assigned to it in X:BOT could be inducted against 94% for buprenorphine.',
          typicalCost:
            'US$1.26 per 50 mg oral naltrexone tablet (CMS NADAC, effective 17 Dec 2025); the injectable is priced separately',
          prosAndCons:
            'Pros: no abuse potential, no withdrawal on stopping. Cons: requires complete detoxification first, which is where most patients are lost.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Time the first dose by withdrawal, not by the clock',
          action:
            'Wait until objective withdrawal is clearly present before the first dose, using a structured scale with a clinician rather than a fixed number of hours.',
          patientImpact:
            'Buprenorphine binds so tightly that it displaces other opioids from the receptor while only partly activating it. Taking it while a full agonist is still occupying the receptor precipitates immediate, severe withdrawal — the commonest reason a first attempt at treatment is abandoned.',
          clinicalPrecaution:
            'Induction after high-potency synthetic opioids is harder than the classical protocols assume, and belongs entirely with an experienced prescriber.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@]([C@H]1C[C@@]23CC[C@@]1([C@H]4[C@@]25CCN([C@@H]3CC6=C5C(=C(C=C6)O)O4)CC7CC7)OC)(C(C)(C)C)O',
      chemicalFormula: 'C29H41NO4',
      molecularWeight: '467.6 g/mol (free base); marketed as buprenorphine hydrochloride',
      targetReceptorAffinity:
        'Very high affinity partial agonist at the mu-opioid receptor with slow dissociation, and antagonist at the kappa-opioid receptor. The high affinity and slow off-rate are what displace full agonists and what produce precipitated withdrawal',
      structureSource: {
        label:
          'PubChem CID 644073 (buprenorphine) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/644073',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'bup-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of thebaine and the Diels-Alder adduct',
          description:
            'Confirm identity and purity of thebaine and of the methyl vinyl ketone Diels-Alder adduct that opens the synthesis. Thebaine is a controlled narcotic raw material, so identity, assay and chain of custody are all part of the same record.',
          reagentsAndBuffer:
            'Thebaine reference standard, HPLC with UV at 285 nm, 1H NMR in CDCl3, optical rotation, controlled-substance reconciliation log',
        },
        {
          id: 'bup-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Grignard addition, O- and N-demethylation, and N-cyclopropylmethylation',
          description:
            'Add tert-butylmagnesium chloride to the ketone to install the tertiary alcohol that gives buprenorphine its extraordinary receptor affinity, then remove the 3-O-methyl and the N-methyl groups and alkylate the nitrogen with cyclopropylmethyl bromide. The bulky tert-butyl carbinol and the N-cyclopropylmethyl group together convert a morphinan into a partial agonist.',
          dependsOnStepId: 'bup-w1',
          reagentsAndBuffer:
            'tert-butylmagnesium chloride in tetrahydrofuran under nitrogen; potassium hydroxide in diethylene glycol at high temperature for O-demethylation; cyanogen bromide followed by hydrolysis for N-demethylation; cyclopropylmethyl bromide with sodium bicarbonate in dimethylformamide',
        },
        {
          id: 'bup-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride crystallisation and morphinan impurity profiling',
          description:
            'Crystallise the hydrochloride and profile for thebaine-derived and norbuprenorphine-related impurities. Norbuprenorphine is also the principal human metabolite, so the same analytical method serves both release testing and pharmacokinetic work.',
          dependsOnStepId: 'bup-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol; recrystallisation from ethanol/water; gradient HPLC with UV and mass detection; reference standards for thebaine, norbuprenorphine and buprenorphine-3-glucuronide',
        },
        {
          id: 'bup-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Mu- and kappa-receptor cell systems with a full-agonist comparator',
          description:
            'Express human OPRM1 and OPRK1 in separate cell lines and run buprenorphine alongside a full agonist such as DAMGO or fentanyl. Partial agonism only exists relative to a full agonist, so a system without that comparator cannot demonstrate it.',
          dependsOnStepId: 'bup-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human OPRM1 or OPRK1; DAMGO and fentanyl reference agonists; naloxone as antagonist control; DMEM with 10% fetal bovine serum and selection antibiotic',
        },
        {
          id: 'bup-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Ceiling-effect dose-response and dissociation kinetics',
          description:
            'Construct full concentration-response curves for buprenorphine and the full agonist in the same assay to demonstrate the maximal-effect ceiling, and measure radioligand dissociation kinetics to quantify the slow off-rate. The ceiling explains the respiratory safety profile; the off-rate explains precipitated withdrawal. Both are properties a single-concentration assay cannot see.',
          dependsOnStepId: 'bup-w4',
          reagentsAndBuffer:
            '[35S]-GTP-gamma-S with GDP in Tris-magnesium-sodium buffer; [3H]-diprenorphine for dissociation kinetics; forskolin-stimulated cyclic AMP accumulation as an orthogonal functional readout',
        },
      ],
    },
    keyAudits: [
      {
        id: 'bup-a1',
        category: 'measured',
        title: 'High-certainty evidence for retention in treatment at every dose tested',
        laymanSummary:
          'Across 31 trials and 5,430 people, buprenorphine kept patients in treatment better than a dummy pill at low, medium and high doses. Only the high dose reliably reduced illicit opioid use.',
        technicalDetails:
          'Mattick et al. included 31 trials, 5,430 participants. High-certainty evidence that buprenorphine retained participants better than placebo at low dose 2-6 mg (RR 1.50, 95% CI 1.19 to 1.88; 5 studies, 1,131 participants), medium dose 7-15 mg (RR 1.74, 1.06 to 2.87; 4 studies, 887), and high dose 16 mg or more (RR 1.82, 1.15 to 2.90; 5 studies, 1,001). Moderate-certainty evidence that only high-dose buprenorphine suppressed illicit opioid use on urinalysis (SMD -1.17, 95% CI -1.85 to -0.49; 3 studies, 729), while low dose (SMD 0.10) and medium dose (SMD -0.08) did not. Against methadone, flexible-dose buprenorphine retained fewer patients (RR 0.83, 95% CI 0.72 to 0.95; 5 studies, 788) with no difference in suppression of use among those retained.',
        evidenceSource: 'Mattick RP et al., Cochrane Database Syst Rev 2014;2:CD002207',
        doi: '10.1002/14651858.CD002207.pub4',
        measuredMetric: 'Retention in treatment, relative risk versus placebo by dose band',
        auditFlag: 'verified',
      },
      {
        id: 'bup-a2',
        category: 'measured',
        title: 'All-cause mortality more than halves while a person is in buprenorphine treatment',
        laymanSummary:
          'Pooling cohorts covering nearly 16,000 people on buprenorphine, the death rate was 4.3 per 1,000 person-years while in treatment and 9.5 while out of it.',
        technicalDetails:
          'Sordo et al. pooled 19 cohorts: 122,885 people treated with methadone over 1.3 to 13.9 years and 15,831 treated with buprenorphine over 1.1 to 4.5 years. Pooled all-cause mortality was 4.3 per 1,000 person-years in buprenorphine treatment and 9.5 out of it (unadjusted out-to-in rate ratio 2.20, 95% CI 1.34 to 3.61); for methadone, 11.3 in and 36.1 out (rate ratio 3.20, 2.65 to 3.86). Overdose mortality was 1.4 in and 4.6 out of buprenorphine treatment. All-cause mortality dropped sharply over the first four weeks of methadone treatment but remained stable during buprenorphine induction — the induction period is the dangerous one for methadone and not for buprenorphine. The authors flag confounding and selection bias as unresolved limitations of any between-drug comparison.',
        evidenceSource: 'Sordo L et al., BMJ 2017;357:j1550',
        doi: '10.1136/bmj.j1550',
        measuredMetric:
          'All-cause and overdose mortality per 1,000 person-years, in versus out of treatment',
        auditFlag: 'verified',
      },
      {
        id: 'bup-a3',
        category: 'measured',
        title:
          'After a non-fatal overdose, buprenorphine was associated with 37% lower all-cause mortality',
        laymanSummary:
          'Among people who survived an opioid overdose, those who went on to receive buprenorphine were about a third less likely to die in the following year. Only 17% of them received it.',
        technicalDetails:
          'Larochelle et al. followed opioid overdose survivors in Massachusetts. In the 12 months after a non-fatal overdose, 3,022 people (17%) received buprenorphine for a median of four months. Compared with no medication for opioid use disorder, buprenorphine was associated with decreased all-cause mortality (adjusted hazard ratio 0.63, 95% CI 0.46 to 0.87) and opioid-related mortality (0.62, 0.41 to 0.92). Methadone showed 0.47 (0.32 to 0.71) and 0.41 (0.24 to 0.70). Overall cohort all-cause mortality was 4.7 deaths per 100 person-years. The authors note that only a minority of overdose survivors received any medication at all.',
        evidenceSource: 'Larochelle MR et al., Ann Intern Med 2018;169:137-145',
        doi: '10.7326/M17-3107',
        measuredMetric: 'Adjusted hazard ratio for all-cause and opioid-related mortality',
        auditFlag: 'verified',
      },
      {
        id: 'bup-a4',
        category: 'measured',
        title: 'X:BOT: easier to start than naltrexone, and equal once both were started',
        laymanSummary:
          'Nearly all patients assigned to buprenorphine were able to start it, against fewer than three quarters assigned to naltrexone. Among those who started either drug, outcomes were the same.',
        technicalDetails:
          'Lee et al. (NCT02032433) randomised 570 patients. Induction succeeded in 270 of 287 (94%) assigned to buprenorphine-naloxone against 204 of 283 (72%) assigned to extended-release naltrexone (P<0.0001). Intention-to-treat 24-week relapse was 163 of 287 (57%) versus 185 of 283 (65%), hazard ratio 1.36 (95% CI 1.10 to 1.68) favouring buprenorphine — but in the per-protocol population of 474 successfully inducted patients, relapse events were similar (P=0.44). Opioid-negative urine samples and abstinent days favoured buprenorphine on intention to treat and were similar per protocol. Self-reported craving was initially lower on naltrexone (P=0.0012) and converged by week 24.',
        evidenceSource: 'Lee JD et al., Lancet 2018;391:309-318',
        doi: '10.1016/S0140-6736(17)32812-X',
        measuredMetric: 'Induction success rate and 24-week relapse',
        auditFlag: 'verified',
      },
      {
        id: 'bup-a5',
        category: 'conclusion_shift',
        title: 'The X-waiver was eliminated in 2023, and access did not automatically follow',
        laymanSummary:
          'For two decades, prescribing buprenorphine required a special federal waiver. That requirement was removed at the end of 2022, and the number of clinicians actually prescribing it did not jump the way the change implied it would.',
        technicalDetails:
          'The Consolidated Appropriations Act, 2023 eliminated the DATA 2000 waiver requirement, so any clinician with a DEA registration to prescribe controlled substances may now prescribe buprenorphine for opioid use disorder. Saloner and colleagues argued in Substance Abuse that removing the waiver addresses only one of several barriers — the others being pharmacy stocking, insurance prior authorisation, clinician confidence with induction, and stigma — and that expanded prescribing authority is a necessary but not sufficient condition for expanded access. The audit point here is the inference: a regulatory barrier being removed is not the same as a treatment gap closing.',
        evidenceSource: 'Saloner B et al., Subst Abus 2023;44:169-172',
        doi: '10.1177/08897077231186212',
        inferredClaim:
          'That eliminating the X-waiver would by itself substantially expand access to buprenorphine treatment',
        auditFlag: 'caution',
      },
      {
        id: 'bup-a6',
        category: 'inferred',
        title:
          'The classical induction protocol was built for a drug landscape that no longer exists',
        laymanSummary:
          'The standard advice on when to take the first dose was developed when the opioids people used cleared quickly. High-potency synthetic opioids behave differently, and precipitated withdrawal has become a more common problem.',
        technicalDetails:
          "Buprenorphine's very high mu-receptor affinity and slow dissociation displace full agonists from the receptor while only partly activating it. The classical induction protocols specify waiting for objective withdrawal, typically assessed with a structured scale, before the first dose. Those protocols were developed and validated in a population using heroin and prescription opioids. This page records that the Cochrane evidence base for buprenorphine retention and suppression of use predates the widespread presence of high-potency synthetic opioids in the illicit supply, and that the applicability of induction timing derived from that era is an assumption rather than a finding.",
        evidenceSource: 'Mattick RP et al., Cochrane Database Syst Rev 2014;2:CD002207',
        doi: '10.1002/14651858.CD002207.pub4',
        inferredClaim:
          'That induction protocols and effect estimates derived from a heroin-era treatment population transfer unchanged to a population using high-potency synthetic opioids',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Dissolved under the tongue, not swallowed',
        laymanDesc:
          'The tablet or film goes under the tongue and is absorbed through the lining of the mouth, because the gut and liver would destroy almost all of it.',
        molecularDetail:
          'Sublingual administration bypasses extensive first-pass metabolism; oral bioavailability is very low. Suboxone combines buprenorphine with naloxone, which is poorly absorbed sublingually but active if the product is injected — a deterrent formulation rather than a therapeutic combination.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Reaches opioid receptors and stays there',
        laymanDesc:
          'It grips the receptor much more tightly than heroin, morphine or fentanyl, and lets go very slowly.',
        molecularDetail:
          'Very high mu-opioid receptor affinity with slow dissociation kinetics. Metabolised by CYP3A4 to norbuprenorphine and by glucuronidation. The long receptor residence time is what allows every-other-day or thrice-weekly dosing in maintenance.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Turns the receptor partway on, and blocks kappa',
        laymanDesc:
          'It activates the receptor only partially, and it blocks a second receptor associated with dysphoria.',
        molecularDetail:
          'Partial agonism at the mu-opioid receptor with submaximal intrinsic efficacy relative to a full agonist, and antagonism at the kappa-opioid receptor. The kappa antagonism is thought to contribute to mood effects and is one reason buprenorphine has been investigated in depression.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Respiratory depression hits a ceiling',
        laymanDesc:
          'Taking more does not depress breathing further past a point, which is the property that makes it safe enough to prescribe outside a clinic.',
        molecularDetail:
          'Because intrinsic efficacy is submaximal, the dose-response curve for respiratory depression plateaus rather than continuing to rise as it does for full agonists. The ceiling is not absolute — it can be overwhelmed in combination with benzodiazepines, alcohol or other CNS depressants, and it does not apply to opioid-naive individuals in the same way.',
        iconName: 'ShieldCheck',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Withdrawal suppressed, illicit use falls, mortality falls',
        laymanDesc:
          'Cravings and withdrawal are controlled, more people stay in treatment, and fewer of them die.',
        molecularDetail:
          'Measured endpoints are retention in treatment (RR 1.50 to 1.82 versus placebo depending on dose), suppression of illicit use on urinalysis (only at 16 mg or more), and all-cause mortality of 4.3 versus 9.5 per 1,000 person-years in versus out of treatment.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane buprenorphine maintenance (31 trials pooled)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 5430,
        primaryEndpoint: 'Retention in treatment and suppression of illicit opioid use',
        endpointMet: true,
        statisticalPValue:
          'Retention versus placebo RR 1.50 (low dose), 1.74 (medium), 1.82 (high); illicit use suppressed only at 16 mg or more (SMD -1.17)',
        unreportedAdverseSignals:
          'Few studies reported adverse events, which the review authors flag as a limitation of the underlying trial literature.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Sordo mortality meta-analysis (19 cohorts pooled)',
        phase: 'Systematic review and meta-analysis of cohort studies',
        sampleSize: 15831,
        primaryEndpoint: 'All-cause and overdose mortality in and out of treatment',
        endpointMet: true,
        statisticalPValue:
          'Out-to-in all-cause rate ratio 2.20 (95% CI 1.34 to 3.61) for buprenorphine; 3.20 (2.65 to 3.86) for methadone',
        unreportedAdverseSignals:
          'The authors state that confounding and selection bias are not fully accounted for and that between-drug comparisons should be treated with caution.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'X:BOT (NCT02032433)',
        phase: 'Phase 4 comparative effectiveness',
        sampleSize: 570,
        primaryEndpoint: '24-week opioid relapse events, intention to treat',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 1.36 (95% CI 1.10 to 1.68) favouring buprenorphine-naloxone by intention to treat; P = 0.44 per protocol',
        unreportedAdverseSignals:
          'Five fatal overdoses across both arms, three in the buprenorphine group and two in the naltrexone group.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Better retention than placebo at low, medium and high dose, high-certainty evidence across 31 trials',
        'Suppression of illicit opioid use on urinalysis only at 16 mg or more, not at lower doses',
        'All-cause mortality 4.3 per 1,000 person-years in treatment versus 9.5 out of it',
        'Adjusted hazard ratio 0.63 for all-cause mortality after a non-fatal overdose',
        'Induction success in 94% of patients assigned to buprenorphine-naloxone against 72% assigned to extended-release naltrexone',
      ],
      unsupportedInferences: [
        'That the respiratory-depression ceiling makes overdose impossible — it plateaus the curve and can still be overwhelmed with benzodiazepines, alcohol or other depressants',
        'That eliminating the X-waiver in 2023 would by itself expand access, when pharmacy stocking, prior authorisation and prescriber confidence remain',
        'That induction protocols validated in the heroin era transfer unchanged to a supply dominated by high-potency synthetic opioids',
      ],
      whatFailedInitially: [
        'Low- and medium-dose buprenorphine did not suppress illicit opioid use on urinalysis, despite retaining patients better than placebo',
        'Flexible-dose buprenorphine retained fewer patients than methadone (RR 0.83), which is a real and consistently replicated disadvantage',
      ],
      realWorldOutcome: [
        'Buprenorphine can be prescribed from ordinary clinical settings because of its respiratory ceiling, which is the single largest structural difference from methadone',
        'US pharmacy acquisition cost for the buprenorphine-naloxone 8 mg / 2 mg sublingual tablet is about US$0.72 (CMS NADAC, effective 17 Dec 2025)',
      ],
    },
    deliverySystem: {
      type: 'Sublingual tablet and film, transdermal patch, buccal film, and extended-release subcutaneous injection',
      description:
        'Opioid use disorder is treated with sublingual tablets or films, usually combined with naloxone as a misuse deterrent, or with a monthly extended-release subcutaneous depot. Chronic pain uses entirely different products at far lower doses: a weekly transdermal patch and a twice-daily buccal film. These are not interchangeable.',
      safetyProfile:
        'Respiratory depression plateaus with dose because of partial agonism, but this ceiling can be overwhelmed by benzodiazepines, alcohol or other CNS depressants and does not protect opioid-naive individuals or children. Buprenorphine precipitates withdrawal if given while a full agonist still occupies the receptor. It is a Schedule III controlled substance in the United States. Neonatal opioid withdrawal syndrome occurs with use in pregnancy, and pregnancy is nonetheless an indication for treatment rather than a reason to stop.',
    },
    commonQuestions: [
      {
        q: 'Why does buprenorphine cause withdrawal if it is an opioid?',
        a: 'Because it binds the receptor far more tightly than the opioid already there, and only turns it partway on. If someone is physically dependent on a full agonist and takes buprenorphine too early, the buprenorphine displaces the full agonist from the receptor and replaces a full signal with a partial one. The net effect at the receptor is a sudden drop, and the person experiences immediate severe withdrawal. This is why induction waits for objective withdrawal to appear first, and why it is harder with high-potency synthetic opioids than the classical protocols assume.',
      },
      {
        q: 'Is it just swapping one addiction for another?',
        a: 'That framing does not survive contact with the mortality data. Pooled across 19 cohorts, all-cause mortality was 4.3 per 1,000 person-years while on buprenorphine and 9.5 while off it. After a non-fatal overdose, buprenorphine was associated with an adjusted hazard ratio of 0.63 for all-cause death and 0.62 for opioid-related death. Physical dependence on buprenorphine is real; so is the halving of the death rate. Those are different things, and only one of them is measured in years of life.',
        auditNote:
          'The Sordo authors are explicit that confounding and selection bias are not fully resolved in observational mortality comparisons. The direction and size of the association is nonetheless consistent across cohorts.',
      },
      {
        q: 'Is it better than methadone?',
        a: 'Not on retention. Flexible-dose buprenorphine retained fewer patients than methadone across five trials and 788 participants (RR 0.83, 95% CI 0.72 to 0.95), and among those retained there was no difference in suppression of illicit use. What buprenorphine has is the respiratory ceiling, which means it can be prescribed from an ordinary clinic and dispensed by a community pharmacy rather than requiring daily attendance at a licensed programme. For many patients that access difference matters more than the retention difference.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no verifiable per-dose cost-of-production figure for buprenorphine could be cited, and this file does not estimate one. The US pharmacy acquisition cost from the CMS NADAC file is about 72 US cents for an 8 mg / 2 mg buprenorphine-naloxone sublingual tablet. That is a price rather than a manufacturing cost, and it does not include the clinical infrastructure the treatment requires.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'Mattick RP et al. Buprenorphine maintenance versus placebo or methadone maintenance for opioid dependence. Cochrane Database Syst Rev 2014;2:CD002207',
        identifier: '10.1002/14651858.CD002207.pub4',
        kind: 'doi',
      },
      {
        label:
          'Sordo L et al. Mortality risk during and after opioid substitution treatment: systematic review and meta-analysis of cohort studies. BMJ 2017;357:j1550',
        identifier: '10.1136/bmj.j1550',
        kind: 'doi',
      },
      {
        label:
          'Larochelle MR et al. Medication for opioid use disorder after nonfatal opioid overdose and association with mortality. Ann Intern Med 2018;169:137-145',
        identifier: '10.7326/M17-3107',
        kind: 'doi',
      },
      {
        label:
          'Lee JD et al. Comparative effectiveness of extended-release naltrexone versus buprenorphine-naloxone for opioid relapse prevention (X:BOT). Lancet 2018;391:309-318',
        identifier: '10.1016/S0140-6736(17)32812-X',
        kind: 'doi',
      },
      {
        label:
          'Saloner B et al. Will the end of the X-waiver expand access to buprenorphine treatment? Achieving the full potential of the 2023 Consolidated Appropriations Act. Subst Abus 2023;44:169-172',
        identifier: '10.1177/08897077231186212',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: SUBUTEX (buprenorphine hydrochloride), NDA 020732, approved 8 October 2002',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020732',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 644073 — buprenorphine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/644073',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
]
