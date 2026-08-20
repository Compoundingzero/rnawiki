import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — performance compounds, grey-market "research chemicals" and the
 * approved medicines that sit alongside them in the same conversations.
 *
 * These are the drugs a reader has the fewest reliable places to look up. They are sold openly as
 * "research chemicals not for human consumption", taken by large numbers of people, and almost
 * none of them has a completed human safety programme. Wikipedia, PubChem, DrugBank and every
 * pharmacology textbook document them; publishing their pharmacology is ordinary reference work.
 *
 * Six conventions apply to the whole group.
 *
 * 1. THEY ARE WRITTEN STRAIGHT. No warning is bolted onto a sentence that did not earn it, and no
 *    fact about what a drug does is withheld because of what the drug is. Where a substance carries
 *    a documented harm — the drug-induced liver injury case series behind the SARMs, the rodent
 *    carcinogenicity that ended GW501516, the fatal hyperthermia of dinitrophenol — it is stated as
 *    a measured finding with its citation, in the same voice as an efficacy result.
 *
 * 2. NO PRICING BLOCK, ANYWHERE. `SeedPricing` requires a synthesis cost per dose with a citable
 *    source, and for a substance with no legal market there is no list price to cite either. A
 *    street price is not a published figure. So no dossier here carries `pricing`.
 *
 * 3. `laboratoryWorkflow` DESCRIBES ANALYSIS, NEVER MANUFACTURE. Every workflow in this file uses
 *    the QC, Purification (sample preparation), Cellular_Delivery (receptor expression) and
 *    Assay_Quantification phases: reference-standard identity, GC-MS and LC-MS/MS confirmation,
 *    HPLC purity, radioligand binding, reporter assays. The Synthesis phase is absent from every
 *    entry on purpose. This is the level of detail a forensic chemistry or doping-control paper
 *    carries, and it is what a reader of these pages actually needs.
 *
 * 4. THE SMILES STRINGS ARE PUBCHEM CANONICAL SMILES, PASTED, NOT RETYPED. Each was pulled from the
 *    PubChem PUG REST `SMILES` property and then put through this repository's own connection-table
 *    parser; the molecular formula the engine computes from the string matches the formula PubChem
 *    prints for that CID in every case, which is the arithmetic proof the transcription is right.
 *    Peptides carry a one-letter backbone sequence instead, with non-standard residues and terminal
 *    modifications in parentheses, because that is what the engine's peptide validator reads.
 *
 * 5. PRODUCT-CONTENT ANALYSES ARE PART OF THE PHARMACOLOGY HERE. Van Wagoner et al. bought 44
 *    products sold as SARMs and found that 52% contained a SARM at all, 39% contained a different
 *    unapproved drug, and 9% contained no active compound. On these pages the question "what does
 *    this compound do" and the question "is this compound in the bottle" are not separable, so both
 *    are answered.
 *
 * 6. THE APPROVAL STATUS FIELD IS A BADGE, NOT AN ARGUMENT. Where the vocabulary's ten statuses do
 *    not fit a substance cleanly — a drug registered in Russia and unapproved everywhere else, a
 *    compound approved for cattle and scheduled for humans — the badge is set to the least
 *    misleading option and the exact legal position is written out in prose, so the badge is never
 *    doing the work alone.
 */

export const PERFORMANCE_AND_GREY_MARKET_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Ostarine (enobosarm, MK-2866, GTx-024)
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ostarine',
    name: 'Ostarine',
    tradeName: 'Enobosarm (development name); also sold as MK-2866 and GTx-024',
    sponsor: 'GTx Inc., Memphis; enobosarm is now developed by Veru Inc.',
    targetGene: 'AR',
    targetProtein: 'Androgen receptor (nuclear receptor subfamily 3, group C, member 4)',
    modality: 'Small Molecule',
    approvalStatus: 'Phase 3 Clinical Trial',
    indication:
      'Investigated for cancer-associated muscle wasting, stress urinary incontinence and androgen-receptor-positive breast cancer. Never approved for any indication in any country.',
    patientFriendlyIndication: 'Muscle wasting — investigational only, and it failed its phase 3',
    anatomicalSite: 'Androgen receptor in skeletal muscle myonuclei and osteoblasts',
    conditionContext: {
      conditionExplainer:
        'Cancer-associated muscle wasting is loss of skeletal muscle that begins before weight loss is visible and predicts worse function and shorter survival independently of the tumour. It has no approved drug treatment anywhere.',
      whyItMatters:
        'Because there is no approved treatment, the regulatory bar was set on function, not on mass. The FDA required that a drug show people could do something better, not merely that a scan showed more lean tissue. Enobosarm cleared the mass bar and did not clear the function bar.',
      whoTakesThis:
        'In trials: adults with non-small-cell lung cancer starting first-line chemotherapy, and healthy older adults in the phase 2. Outside trials: mostly young men buying it online as a muscle-building compound, which is not a use anyone has studied.',
      clinicalGoals:
        'In the phase 3 programme the goals were a 10% or greater improvement in stair climb power and no loss of lean body mass, both measured at day 84.',
    },
    oneSentenceVerdict:
      'The most thoroughly studied SARM in humans: it raised lean body mass in every trial that measured it, missed its co-primary physical function endpoint in both identical phase 3 trials, and now appears in roughly a third of the products that claim to contain it.',
    laymanHowItWorks:
      'Testosterone tells muscle and bone to grow, and it tells the prostate, skin and hair follicles to do other things. Ostarine binds the same receptor as testosterone, but it is not a steroid, and the shape it forces the receptor into recruits a different set of helper proteins in different tissues. In muscle that shape acts like testosterone; in prostate tissue it acts much more weakly. That is the whole idea behind the class, and in the muscle-mass measurements it works. Whether more muscle mass makes a sick person stronger turned out to be a separate question, and the answer in the phase 3 trials was no.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 46,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@](COC1=CC=C(C=C1)C#N)(C(=O)NC2=CC(=C(C=C2)C#N)C(F)(F)F)O',
      chemicalFormula: 'C19H14F3N3O3',
      molecularWeight: '389.3 g/mol',
      targetReceptorAffinity:
        'Non-steroidal aryl propionamide, a tissue-selective partial agonist at the androgen receptor. In the phase 2 and phase 3 programme it produced dose-dependent gains in lean body mass at 1 mg and 3 mg once daily without the prostate and haematocrit signals that limit testosterone.',
      structureSource: {
        label:
          'PubChem CID 11326715 (enobosarm) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11326715',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ost-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the certified reference standard',
          description:
            'Confirm the reference material is (S)-enobosarm and not its enantiomer or a positional isomer before it is used to calibrate anything. Chiral separation is the step that matters: the R-enantiomer has a different receptor profile and co-elutes on an achiral column.',
          reagentsAndBuffer:
            'Certified enobosarm reference standard, deuterated enobosarm-d4 internal standard, chiral stationary-phase HPLC (amylose tris(3,5-dimethylphenylcarbamate)), 1H and 19F NMR in DMSO-d6, high-resolution accurate-mass ESI-MS',
        },
        {
          id: 'ost-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Purity and label-content assay of a seized or purchased product',
          description:
            'Quantify how much enobosarm a capsule, tablet or dropper bottle actually contains, and screen the same extract for the other compounds that turn up in these products. This is the assay behind the finding that only 52% of products sold as SARMs contained one.',
          dependsOnStepId: 'ost-w1',
          reagentsAndBuffer:
            'Methanol extraction with sonication, 0.45 um PTFE filtration, reversed-phase C18 HPLC with diode-array detection at 270 nm, quantitative 19F NMR against a maleic acid internal standard for fluorinated actives',
        },
        {
          id: 'ost-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Urine sample preparation for doping-control confirmation',
          description:
            'Enobosarm is excreted largely as glucuronide and sulfate conjugates, so a urine confirmation starts with enzymatic hydrolysis and solid-phase extraction. Skipping hydrolysis is the commonest reason a positive sample reads low.',
          dependsOnStepId: 'ost-w2',
          reagentsAndBuffer:
            'Beta-glucuronidase from E. coli, 0.8 M phosphate buffer pH 7.0, mixed-mode anion-exchange solid-phase extraction cartridges, methanol and 2% formic acid elution',
        },
        {
          id: 'ost-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Androgen receptor reporter cell line',
          description:
            'Express human AR with an androgen-response-element luciferase reporter so that transactivation can be measured against a mock-transfected control. This is the only way to attribute a signal to AR rather than to a related nuclear receptor, and it is how tissue selectivity claims are tested in vitro.',
          dependsOnStepId: 'ost-w3',
          reagentsAndBuffer:
            'HEK293 or CV-1 cells, human AR expression plasmid, MMTV-luciferase or ARE-luciferase reporter, charcoal-stripped fetal bovine serum in phenol-red-free DMEM',
        },
        {
          id: 'ost-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'LC-MS/MS quantification and radioligand displacement',
          description:
            'Quantify enobosarm and its hydroxylated and O-dephenylated metabolites by liquid chromatography with tandem mass spectrometry against the deuterated internal standard, and separately measure androgen receptor binding by displacement of a labelled reference ligand across a concentration series.',
          dependsOnStepId: 'ost-w4',
          reagentsAndBuffer:
            '[3H]-mibolerone or [3H]-R1881 as AR radioligand, rat ventral prostate cytosol or recombinant AR ligand-binding domain, TEGM assay buffer with molybdate, dextran-coated charcoal separation, electrospray negative-ion multiple-reaction monitoring on a triple quadrupole',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ost-a1',
        category: 'measured',
        title: 'Phase 2 in 120 healthy older adults: lean body mass rose dose-dependently',
        laymanSummary:
          'In 120 healthy men over 60 and postmenopausal women, twelve weeks of ostarine increased lean body mass measured by DXA scan, and the 3 mg dose also improved a stair-climb measure of physical function.',
        technicalDetails:
          'Dalton et al. ran a 12-week double-blind placebo-controlled phase 2 in 120 healthy elderly men over 60 and postmenopausal women. The primary endpoint was total lean body mass by dual-energy X-ray absorptiometry. GTx-024 produced dose-dependent increases that were statistically significant (P < 0.001, 3 mg versus placebo), with significant improvements in physical function (P = 0.013) and in insulin resistance (P = 0.013), both 3 mg versus placebo. Adverse event incidence was similar across groups. This is the trial the entire lean-mass claim rests on, and it was run in healthy volunteers, not in patients.',
        evidenceSource: 'Dalton JT et al., J Cachexia Sarcopenia Muscle 2011;2:153-161',
        doi: '10.1007/s13539-011-0034-6',
        measuredMetric: 'Total lean body mass by DXA at 12 weeks, 3 mg versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'ost-a2',
        category: 'failed',
        title: 'POWER 1 and POWER 2: the physical function co-primary missed in both',
        laymanSummary:
          'Two identical phase 3 trials in 651 lung cancer patients asked whether ostarine helped people climb stairs faster. In one trial slightly more people improved on drug than placebo; in the other, fewer did. Neither result was a win.',
        technicalDetails:
          'POWER 1 (NCT01355484, n=321) and POWER 2 (NCT01355497, n=330) were identically designed, randomised, double-blind, placebo-controlled phase 3 trials in patients starting first-line platinum chemotherapy for non-small-cell lung cancer, with co-primary responder endpoints at day 84: at least 10% improvement in stair climb power, and no loss of lean body mass. On the lean body mass endpoint enobosarm 3 mg beat placebo in both trials — 41.9% versus 30.4% in POWER 1 and 46.5% versus 37.9% in POWER 2. On stair climb power it did not: 29.4% versus 24.2% in POWER 1, and 19.5% versus 24.8% in POWER 2, numerically below placebo. A co-primary endpoint that fails is a failed trial, and both trials failed it.',
        evidenceSource:
          'ClinicalTrials.gov posted results, NCT01355484 and NCT01355497; design and endpoint definitions in Crawford J et al., Curr Oncol Rep 2016;18:37',
        doi: '10.1007/s11912-016-0522-0',
        measuredMetric:
          'Proportion of subjects with stair climb power improvement of at least 10% at day 84',
        auditFlag: 'verified',
      },
      {
        id: 'ost-a3',
        category: 'inferred',
        title: 'The phase 2 in cancer patients compared each arm with itself, not with placebo',
        laymanSummary:
          'The widely quoted cancer trial reported that ostarine increased muscle mass and that placebo did not. That is two separate before-and-after comparisons, not a comparison of the drug against the placebo.',
        technicalDetails:
          'Dobs et al. randomised 159 patients with cancer and at least 2% weight loss to enobosarm 1 mg, 3 mg or placebo for up to 113 days; 100 were evaluable for efficacy. The reported result is change from baseline within each arm: 1 mg median +1.5 kg (range -2.1 to 12.6, p=0.0012), 3 mg +1.0 kg (-4.8 to 11.5, p=0.046), placebo +0.02 kg (-5.8 to 6.7, p=0.88). Those p-values test each arm against its own baseline. "Significant on drug and not significant on placebo" is not the same statement as "significantly different from placebo", and the difference between the two is the difference between a hypothesis and a result. Note also the dose ordering: 1 mg produced a larger median gain than 3 mg.',
        evidenceSource: 'Dobs AS et al., Lancet Oncol 2013;14:335-345 (NCT00467844)',
        doi: '10.1016/S1470-2045(13)70055-X',
        inferredClaim:
          'That the phase 2 showed enobosarm to be superior to placebo for lean body mass in cancer patients, when the published analysis is a within-arm change from baseline in each group separately',
        auditFlag: 'caution',
      },
      {
        id: 'ost-a4',
        category: 'measured',
        title: 'Only 52% of products sold as SARMs contained a SARM',
        laymanSummary:
          'Researchers bought 44 products advertised as SARMs and analysed them. Half contained what they claimed. Four in ten contained a completely different unapproved drug, and one in eleven contained nothing active at all.',
        technicalDetails:
          'Van Wagoner et al. identified suppliers by web search between February and March 2016, purchased 44 products, and analysed them under chain of custody using WADA-approved procedures. Only 23 of 44 (52%) contained one or more SARMs (ostarine, LGD-4033 or andarine). A further 17 (39%) contained a different unapproved drug — ibutamoren, GW501516 or the REV-ERB agonist SR9009. No active compound at all was found in 4 (9%). Substances not listed on the label were present in 11 (25%). The measured amount matched the label in only 18 of 44 (41%). This is not an aside on a pharmacology page: it means a personal account of "what ostarine did to me" is, more often than not, an account of something else.',
        evidenceSource: 'Van Wagoner RM et al., JAMA 2017;318:2004-2010',
        doi: '10.1001/jama.2017.17069',
        measuredMetric:
          'Proportion of internet-purchased products whose analysed contents matched the label',
        auditFlag: 'verified',
      },
      {
        id: 'ost-a5',
        category: 'conclusion_shift',
        title:
          'The class was designed to avoid steroid liver injury, and then produced liver injury',
        laymanSummary:
          'SARMs were built specifically to give the muscle effects of steroids without the liver damage. Case reports of jaundice and cholestatic liver injury after ostarine have accumulated since 2021.',
        technicalDetails:
          'The stated rationale for the non-steroidal SARM class was to avoid the hepatotoxicity of 17-alpha-alkylated androgens, which ostarine is not. Bedi et al. reported significant cholestatic liver injury with ostarine in a pattern resembling anabolic steroid injury. Weinblatt and Roy reported hepatocellular drug-induced liver injury in a 31-year-old man three weeks after starting an enobosarm-containing supplement, resolving on withdrawal. Koller et al. reported two further cases with ligandrol and ostarine showing mixed injury with canalicular bile plugs and ductopenia on biopsy, recovering over three months. These are case reports, not an incidence estimate — nobody knows the denominator — but the specific claim the class was sold on is the one they contradict.',
        evidenceSource:
          'Bedi H et al., ACG Case Rep J 2021;8:e00518; Weinblatt D and Roy S, J Med Cases 2022;13:244-248; Koller T et al., World J Clin Cases 2021;9:4062-4071',
        doi: '10.14309/crj.0000000000000518',
        inferredClaim:
          'That being non-steroidal makes a SARM non-hepatotoxic — a mechanistic expectation that the case literature has not borne out',
        auditFlag: 'contested',
      },
      {
        id: 'ost-a6',
        category: 'measured',
        title: 'Detectable in hair after a single 20 mg dose',
        laymanSummary:
          'One dose is enough to show up in a hair test, which matters for the athletes who fail a drug test after taking a contaminated supplement once.',
        technicalDetails:
          'Ostarine is a WADA-prohibited substance in class S1.2 (other anabolic agents) at all times, in and out of competition. Analytical work has established detection windows well beyond the elimination of the parent compound: a single 20 mg oral dose was detectable in hair by liquid chromatography with tandem mass spectrometry. This is why the product-contamination finding above has consequences that are not merely theoretical — a tested athlete who takes one capsule of a mislabelled product can return an adverse analytical finding months later.',
        evidenceSource: 'Clin Chem Lab Med 2025;63:e229-e231, single-dose hair detection study',
        doi: '10.1515/cclm-2025-0633',
        measuredMetric: 'Detection of ostarine in hair after one 20 mg oral dose',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Taken by mouth and absorbed intact',
        laymanDesc:
          'It is a small molecule that survives the gut and the first pass through the liver, so it works as a capsule rather than an injection.',
        molecularDetail:
          'Oral aryl propionamide with a half-life supporting once-daily dosing at the 1 mg and 3 mg doses used across the phase 2 and phase 3 programme. Cleared by oxidative metabolism and by glucuronide and sulfate conjugation, which is why doping-control confirmation requires enzymatic hydrolysis before extraction.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters the cell and finds the androgen receptor',
        laymanDesc:
          'The androgen receptor sits inside the cell rather than on its surface, so the drug has to cross the membrane before it can bind anything.',
        molecularDetail:
          'Passive diffusion across the plasma membrane; binds the ligand-binding domain of the androgen receptor, displacing chaperone complexes and triggering nuclear translocation in the same way testosterone does.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Forces a receptor shape that reads differently in different tissues',
        laymanDesc:
          'The receptor folds slightly differently around this molecule than around testosterone, and that different shape attracts a different set of helper proteins depending on which tissue the cell is in.',
        molecularDetail:
          'The non-steroidal ligand stabilises a distinct helix-12 conformation of the AR ligand-binding domain. Coactivator and corepressor recruitment then depends on the tissue-specific complement of those proteins, which is the accepted structural account of why the compound behaves as a near-full agonist in muscle and a much weaker agonist in prostate.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Turns on muscle and bone gene programmes',
        laymanDesc:
          'The receptor, now carrying the drug, moves into the nucleus and switches on the genes that build muscle protein and bone.',
        molecularDetail:
          'The ligand-bound receptor dimerises, binds androgen response elements in target promoters, and drives transcription of the anabolic programme in myonuclei and osteoblasts. Downstream, satellite cell activity and myonuclear accretion increase; the measurable output is lean body mass by DXA.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Lean mass rises; measured function did not follow',
        laymanDesc:
          'Scans reliably show more lean tissue. The phase 3 trials tested whether people could climb stairs faster, and they could not.',
        molecularDetail:
          'Lean body mass responder rates favoured enobosarm in both POWER trials. Stair climb power responder rates did not, in either trial. Muscle cross-sectional area and contractile function are related but not identical quantities, and this programme is the clearest demonstration in the class that a mass endpoint does not stand in for a function endpoint.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Dalton 2011 phase 2 in healthy elderly subjects',
        phase: 'Phase 2',
        sampleSize: 120,
        primaryEndpoint: 'Total lean body mass by DXA at 12 weeks',
        endpointMet: true,
        statisticalPValue: 'P < 0.001, 3 mg versus placebo; physical function P = 0.013',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NCT00467844 (phase 2 in cancer patients)',
        phase: 'Phase 2',
        sampleSize: 159,
        primaryEndpoint: 'Change in total lean body mass from baseline at day 113',
        endpointMet: true,
        statisticalPValue:
          'Within-arm change from baseline: 1 mg p=0.0012, 3 mg p=0.046, placebo p=0.88. No between-arm comparison reported in the primary analysis',
        unreportedAdverseSignals:
          'Commonest serious adverse events were malignant neoplasm progression (15% placebo, 9% enobosarm 1 mg, 13% enobosarm 3 mg), pneumonia and febrile neutropenia; none judged related to study drug.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT01355484 (POWER 1)',
        phase: 'Phase 3',
        sampleSize: 321,
        primaryEndpoint:
          'Co-primary: proportion with at least 10% stair climb power improvement, and proportion with no lean body mass loss, both at day 84',
        endpointMet: false,
        statisticalPValue:
          'Stair climb power responders 29.4% enobosarm versus 24.2% placebo; lean body mass responders 41.9% versus 30.4%',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'NCT01355497 (POWER 2)',
        phase: 'Phase 3',
        sampleSize: 330,
        primaryEndpoint:
          'Co-primary: proportion with at least 10% stair climb power improvement, and proportion with no lean body mass loss, both at day 84',
        endpointMet: false,
        statisticalPValue:
          'Stair climb power responders 19.5% enobosarm versus 24.8% placebo; lean body mass responders 46.5% versus 37.9%',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Dose-dependent increase in total lean body mass by DXA in 120 healthy older adults over 12 weeks, P < 0.001 for 3 mg versus placebo',
        'Higher lean body mass responder rate than placebo in both phase 3 trials — 41.9% versus 30.4%, and 46.5% versus 37.9%',
        'No advantage over placebo on stair climb power in either phase 3 trial, and a numerically lower responder rate than placebo in POWER 2',
        'Of 44 internet products sold as SARMs, 52% contained a SARM, 39% contained a different unapproved drug, and 9% contained no active compound',
      ],
      unsupportedInferences: [
        'That the phase 2 in cancer patients demonstrated superiority to placebo — the published primary analysis compares each arm with its own baseline',
        'That gains in lean body mass translate into gains in physical function, which is the specific inference the phase 3 programme was designed to test and did not support',
        'That being non-steroidal makes the compound non-hepatotoxic, which the drug-induced liver injury case reports contradict',
        'That a personal report of an effect from a purchased product is a report about ostarine, when roughly half of such products contain something else',
      ],
      whatFailedInitially: [
        'Both POWER phase 3 trials missed the stair climb power co-primary endpoint at day 84',
        'The compound has never been approved for any indication in any jurisdiction, twenty years after first-in-human dosing',
      ],
      realWorldOutcome: [
        'Enobosarm remains in clinical development under Veru Inc. for androgen-receptor-positive breast cancer, an indication unrelated to how the compound is used outside trials',
        'It is prohibited at all times in sport under WADA class S1.2 and is detectable in hair after a single 20 mg dose, so contaminated supplements produce real sanctions',
        'The FDA has stated that SARMs are unapproved drugs and are excluded from the legal definition of a dietary supplement, which makes every product sold as an ostarine supplement an unapproved new drug',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, tablet or suspension; once daily in trials at 1 mg or 3 mg',
      description:
        'In trials, an oral formulation dosed once daily. Outside trials, most commonly a liquid suspension sold in a dropper bottle labelled "for research use only", a labelling convention with no analytical meaning — the same bottles are the ones that were assayed and found to be mislabelled 59% of the time.',
      safetyProfile:
        'Trial adverse event rates were similar to placebo across the phase 2 and phase 3 programme. Outside trials, the documented harms are drug-induced liver injury (cholestatic and hepatocellular patterns, several published case reports since 2021), suppression of endogenous testosterone and gonadotropins through negative feedback at the hypothalamus and pituitary, and reductions in HDL cholesterol. No long-term human safety data exist at any dose, and no dose used outside trials has been characterised at all.',
    },
    commonQuestions: [
      {
        q: 'If it increased muscle mass in every trial, why was it never approved?',
        a: 'Because increasing muscle mass was not the question the regulator asked. After discussion with the FDA, the phase 3 programme used two co-primary endpoints: no loss of lean body mass, and at least a 10% improvement in stair climb power. Enobosarm beat placebo on the first in both trials and did not beat placebo on the second in either — in POWER 2 the responder rate was 19.5% on drug against 24.8% on placebo. When a trial has co-primary endpoints, missing one is missing the trial. The programme is a clean demonstration that a body-composition measurement is not a stand-in for what a person can do.',
        auditNote:
          'The lean body mass results and the stair climb power results come from the same two trials. Quoting the first without the second is the single most common misreading of this drug.',
      },
      {
        q: 'Is what people buy online actually ostarine?',
        a: 'Often not. In the only chain-of-custody analysis of internet products, 44 items sold as SARMs were purchased and assayed: 52% contained a SARM of some kind, 39% contained a different unapproved drug entirely — ibutamoren, GW501516 or SR9009 — 25% contained a substance not on the label, and 9% contained no active compound at all. Only 41% matched their stated content. That result changes how every anecdote about this compound should be read, and it changes what a positive doping test means for someone who took one capsule.',
      },
      {
        q: 'Does it damage the liver, or was that the point of avoiding steroids?',
        a: 'Both halves are true and they are in tension. The class was explicitly designed to avoid the liver injury caused by 17-alpha-alkylated oral steroids, and ostarine is not an alkylated steroid. Published case reports since 2021 nonetheless describe jaundice, cholestatic and mixed liver injury with biopsy findings of canalicular bile plugs and ductopenia, in young men with no other cause found, resolving over weeks to months after stopping. Case reports establish that it happens; they cannot tell you how often, because nobody knows how many people are taking it.',
        auditNote:
          'The rate is unknown and this page does not estimate one. An unknown denominator is a reason to say "unknown", not a reason to say "rare".',
      },
      {
        q: 'Why does this page not show a price?',
        a: 'Because there is no legal market and therefore no list price to cite. This site prints acquisition costs from published sources such as the CMS National Average Drug Acquisition Cost file. A grey-market asking price is not a published figure, it varies by seller and by week, and printing one would amount to sourcing information. So the pricing block is absent rather than estimated.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Dalton JT et al. The selective androgen receptor modulator GTx-024 (enobosarm) improves lean body mass and physical function in healthy elderly men and postmenopausal women: results of a double-blind, placebo-controlled phase II trial. J Cachexia Sarcopenia Muscle 2011;2:153-161',
        identifier: '10.1007/s13539-011-0034-6',
        kind: 'doi',
      },
      {
        label:
          'Dobs AS et al. Effects of enobosarm on muscle wasting and physical function in patients with cancer: a double-blind, randomised controlled phase 2 trial. Lancet Oncol 2013;14:335-345',
        identifier: '10.1016/S1470-2045(13)70055-X',
        kind: 'doi',
      },
      {
        label:
          'Crawford J et al. Study design and rationale for the phase 3 clinical development program of enobosarm (POWER trials). Curr Oncol Rep 2016;18:37',
        identifier: '10.1007/s11912-016-0522-0',
        kind: 'doi',
      },
      {
        label: 'POWER 1 — phase 3 of GTx-024 in NSCLC, posted results',
        identifier: 'NCT01355484',
        kind: 'nct',
      },
      {
        label: 'POWER 2 — phase 3 of GTx-024 in NSCLC, posted results',
        identifier: 'NCT01355497',
        kind: 'nct',
      },
      {
        label: 'Phase 2 of GTx-024 in cancer-associated muscle wasting',
        identifier: 'NCT00467844',
        kind: 'nct',
      },
      {
        label:
          'Van Wagoner RM et al. Chemical composition and labeling of substances marketed as selective androgen receptor modulators and sold via the internet. JAMA 2017;318:2004-2010',
        identifier: '10.1001/jama.2017.17069',
        kind: 'doi',
      },
      {
        label:
          'Bedi H et al. Drug-induced liver injury from enobosarm (ostarine), a selective androgen receptor modulator. ACG Case Rep J 2021;8:e00518',
        identifier: '10.14309/crj.0000000000000518',
        kind: 'doi',
      },
      {
        label:
          'Weinblatt D, Roy S. Drug-induced liver injury secondary to enobosarm: a selective androgen receptor modulator. J Med Cases 2022;13:244-248',
        identifier: '10.14740/jmc3937',
        kind: 'doi',
      },
      {
        label:
          'Koller T et al. Liver injury associated with the use of selective androgen receptor modulators and post-cycle therapy: two case reports and literature review. World J Clin Cases 2021;9:4062-4071',
        identifier: '10.12998/wjcc.v9.i16.4062',
        kind: 'doi',
      },
      {
        label:
          'A single dose of 20 mg of ostarine is detectable in hair. Clin Chem Lab Med 2025;63:e229-e231',
        identifier: '10.1515/cclm-2025-0633',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 11326715 — enobosarm structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11326715',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 2. Ligandrol (LGD-4033, VK5211)
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ligandrol',
    name: 'Ligandrol',
    tradeName: 'LGD-4033; developed as VK5211',
    sponsor: 'Ligand Pharmaceuticals; licensed to Viking Therapeutics as VK5211',
    targetGene: 'AR',
    targetProtein: 'Androgen receptor (nuclear receptor subfamily 3, group C, member 4)',
    modality: 'Small Molecule',
    approvalStatus: 'Phase 2 Investigational',
    indication:
      'Investigated for recovery after hip fracture in older adults. Development stopped after phase 2. Never approved for any indication in any country.',
    patientFriendlyIndication:
      'Muscle loss after hip fracture — investigational only, and development stopped',
    anatomicalSite: 'Androgen receptor in skeletal muscle myonuclei and osteoblasts',
    conditionContext: {
      conditionExplainer:
        'After a hip fracture, older adults lose muscle fast during the weeks of immobility, and many never return to their previous walking ability. That loss is one of the reasons a hip fracture predicts death better than most other injuries of the same severity.',
      whyItMatters:
        'A drug that prevented that muscle loss would have an obvious rationale. Ligandrol was tested for exactly this, produced the largest placebo-corrected lean mass gain of any SARM in a randomised trial, and was not taken further.',
      whoTakesThis:
        'In trials: 76 healthy young men in the phase 1, and 108 adults aged 65 and over recovering from acute hip fracture in the phase 2. Outside trials: overwhelmingly young men buying it online, at doses far above anything tested.',
      clinicalGoals:
        'The phase 2 goal was placebo-corrected percentage change in total-body-less-head lean body mass at 12 weeks, measured by whole-body DXA.',
    },
    oneSentenceVerdict:
      'The SARM with the largest randomised lean-mass effect on record — up to 9.1% above placebo in twelve weeks — measured in a phase 2 that never tested whether anyone walked better, in a programme that stopped there.',
    laymanHowItWorks:
      'Ligandrol is a small molecule that binds the same receptor testosterone binds, and switches on the same muscle-building gene programme, without being a steroid. In the two randomised trials it did precisely that: lean body mass went up, in a straight line with the dose. It also did the other thing androgens do — it told the brain to stop making testosterone, and the men in the phase 1 saw their own testosterone, SHBG and HDL cholesterol fall dose-dependently. Those two facts are the same drug acting on the same receptor in two places.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 44,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1C[C@@H](N(C1)C2=CC(=C(C=C2)C#N)C(F)(F)F)[C@H](C(F)(F)F)O',
      chemicalFormula: 'C14H12F6N2O',
      molecularWeight: '338.25 g/mol',
      targetReceptorAffinity:
        'Non-steroidal pyrrolidinyl-benzonitrile. Described by its originators as binding the androgen receptor with high affinity and selectivity; in humans it has a long elimination half-life with dose-proportional accumulation on repeat dosing.',
      structureSource: {
        label:
          'PubChem CID 44137686 (LGD-4033) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/44137686',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lgd-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Reference standard identity and isomeric purity',
          description:
            'Confirm the standard is LGD-4033 and not a regioisomer or a des-fluoro analogue. Two trifluoromethyl groups make 19F NMR the fastest orthogonal identity check available, and it distinguishes the compound from most of the analogues sold under the same name.',
          reagentsAndBuffer:
            'Certified LGD-4033 reference standard, LGD-4033-d3 internal standard, 19F and 1H NMR in acetonitrile-d3, high-resolution accurate-mass ESI-MS, chiral HPLC on an immobilised polysaccharide column',
        },
        {
          id: 'lgd-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Quantitative content assay of a purchased product',
          description:
            'Determine how much LGD-4033 a capsule or dropper bottle contains and screen the same extract for the other compounds that appear in these products. Quantitative 19F NMR is the method of choice here because it needs no compound-specific response factor.',
          dependsOnStepId: 'lgd-w1',
          reagentsAndBuffer:
            'Methanol or acetonitrile extraction with sonication, 0.45 um PTFE filtration, quantitative 19F NMR against trifluorotoluene or maleic acid, reversed-phase C18 HPLC with diode-array detection',
        },
        {
          id: 'lgd-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Urine hydrolysis and extraction for long-term metabolite detection',
          description:
            'The parent compound clears long before the detection window closes. Doping-control confirmation targets the dihydroxylated and carboxylated metabolites, which requires enzymatic deconjugation before extraction.',
          dependsOnStepId: 'lgd-w2',
          reagentsAndBuffer:
            'Beta-glucuronidase from E. coli, phosphate buffer pH 7.0, liquid-liquid extraction with tert-butyl methyl ether at alkaline pH or mixed-mode solid-phase extraction, reconstitution in 20% acetonitrile',
        },
        {
          id: 'lgd-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Androgen receptor transactivation reporter',
          description:
            'Express human AR with an androgen-response-element reporter to measure agonist and antagonist activity. This matters for LGD-4033 specifically: at least one identified human metabolite is an AR antagonist, so the parent and its metabolites are not interchangeable in an activity assay.',
          dependsOnStepId: 'lgd-w3',
          reagentsAndBuffer:
            'HEK293 cells, human AR expression plasmid, ARE-luciferase reporter, charcoal-stripped serum in phenol-red-free medium, dihydrotestosterone as the positive control agonist',
        },
        {
          id: 'lgd-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'LC-HRMS metabolite profiling and quantification',
          description:
            'Quantify parent and metabolites by liquid chromatography with high-resolution mass spectrometry against the deuterated internal standard. Structure elucidation of the minor metabolites is an active analytical field, because which metabolite is present indicates how recently the substance was taken.',
          dependsOnStepId: 'lgd-w4',
          reagentsAndBuffer:
            'C18 or biphenyl analytical column, 0.1% formic acid in water and acetonitrile gradient, electrospray positive and negative ionisation, Orbitrap or quadrupole time-of-flight mass analyser with all-ion fragmentation',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lgd-a1',
        category: 'measured',
        title: 'Phase 2 after hip fracture: up to 9.1% more lean mass than placebo in 12 weeks',
        laymanSummary:
          'In 108 people aged 65 and over recovering from a hip fracture, twelve weeks of ligandrol added lean body mass in a straight line with the dose, and the effect was clearly larger than placebo at every dose tested.',
        technicalDetails:
          'VK5211 (NCT02578095) was a randomised, double-blind, placebo-controlled phase 2 in 108 patients aged 65 or older after acute hip fracture, run by Viking Therapeutics between October 2015 and December 2017. The posted primary result is placebo-corrected least-squares mean percentage change in total-body-less-head lean body mass by whole-body DXA at 12 weeks: 0.5 mg +4.75% (95% CI 1.70 to 7.80), 1.0 mg +7.15% (3.76 to 10.54), 2.0 mg +9.08% (5.55 to 12.60). All three confidence intervals exclude zero and the dose-response is monotonic. This is the largest placebo-controlled lean-mass effect published for any SARM.',
        evidenceSource:
          'ClinicalTrials.gov posted results, NCT02578095 (VK5211 hip fracture study)',
        measuredMetric:
          'Placebo-corrected percentage change in total-body-less-head lean body mass at week 12',
        auditFlag: 'verified',
      },
      {
        id: 'lgd-a2',
        category: 'inferred',
        title: 'The phase 2 measured mass, and stopped there',
        laymanSummary:
          'The hip fracture trial asked one question: does a scan show more lean tissue? It did not ask whether anyone walked further, recovered faster or fell less often, and the programme did not continue.',
        technicalDetails:
          'The registered and posted primary outcome for NCT02578095 is a DXA body-composition measurement at 12 weeks. The trial reports no functional co-primary and no fracture-recovery outcome as its primary result. Enobosarm had already shown, in two 300-patient phase 3 trials, that a lean-mass responder advantage can coexist with no advantage on measured physical function. A programme that stops at a body-composition endpoint has not tested the claim its rationale depends on, and this one did not continue to a trial that would have.',
        evidenceSource: 'ClinicalTrials.gov registration and posted results, NCT02578095',
        inferredClaim:
          'That a 9.1% placebo-corrected gain in lean body mass means faster recovery of function after hip fracture — an outcome the trial did not measure as its primary endpoint and no later trial tested',
        auditFlag: 'caution',
      },
      {
        id: 'lgd-a3',
        category: 'measured',
        title: 'Phase 1: dose-dependent suppression of testosterone, SHBG, HDL and triglycerides',
        laymanSummary:
          'In 76 healthy men taking it for three weeks, ligandrol raised lean mass and at the same time lowered their own testosterone, their HDL cholesterol and their triglycerides, more at higher doses. Everything returned to baseline after stopping.',
        technicalDetails:
          'Basaria et al. randomised 76 healthy men aged 21 to 50 to placebo or 0.1, 0.3 or 1.0 mg LGD-4033 daily for 21 days, with follow-up for five weeks after. Lean body mass increased dose-dependently while fat mass did not change significantly. There were dose-dependent reductions in total testosterone, sex hormone-binding globulin, HDL cholesterol and triglycerides; FSH and free testosterone fell significantly only at 1.0 mg. Haemoglobin, PSA, AST, ALT and QT interval did not change significantly at any dose. Hormones and lipids returned to baseline after discontinuation. Three weeks at 1 mg is the outer edge of what has ever been characterised in healthy people.',
        evidenceSource: 'Basaria S et al., J Gerontol A Biol Sci Med Sci 2013;68:87-95',
        doi: '10.1093/gerona/gls078',
        measuredMetric:
          'Change in total testosterone, SHBG, HDL cholesterol and lean body mass over 21 days',
        auditFlag: 'verified',
      },
      {
        id: 'lgd-a4',
        category: 'conclusion_shift',
        title: 'No liver signal in the phase 1; jaundice and cholestasis in the case reports',
        laymanSummary:
          'The three-week trial found no change in liver enzymes at any dose. Case reports since 2021 describe men who took it for months and developed jaundice and liver injury.',
        technicalDetails:
          'Basaria et al. found no significant change in AST or ALT over 21 days at up to 1.0 mg daily. Labban et al. reported a 52-year-old man with pruritic jaundice, weight loss and raised liver enzymes after three months of high-dose LGD-4033, with other causes excluded. Koller et al. reported cholestatic injury with canalicular bile plugs and ductopenia on biopsy in young men who used ligandrol or ostarine followed by post-cycle therapy, recovering over three months. The two findings are not in conflict: a 21-day trial at 1 mg is not a test of three months at an unmeasured dose. What the case reports contradict is the inference drawn from the trial, not the trial.',
        evidenceSource:
          'Basaria S et al., J Gerontol A 2013;68:87-95; Labban H et al., Cureus 2024;16:e69601; Koller T et al., World J Clin Cases 2021;9:4062-4071',
        doi: '10.7759/cureus.69601',
        inferredClaim:
          'That an unchanged liver panel over 21 days at 1 mg predicts liver safety over months at doses nobody has measured',
        auditFlag: 'contested',
      },
      {
        id: 'lgd-a5',
        category: 'measured',
        title: 'One of the three compounds that were actually in the bottles',
        laymanSummary:
          'When 44 products sold as SARMs were bought and analysed, LGD-4033 was one of only three compounds found in the half of products that contained a SARM at all.',
        technicalDetails:
          'In Van Wagoner et al., 23 of 44 internet-purchased products (52%) contained one or more SARMs, and those SARMs were ostarine, LGD-4033 or andarine. Seventeen products (39%) instead contained ibutamoren, GW501516 or SR9009; four (9%) contained no active compound; eleven (25%) contained a substance not on the label; and the measured content matched the label in only 18 of 44 (41%). Ligandrol is therefore one of the compounds most likely to be genuinely present in a product labelled as a SARM, and that is a statement about the market rather than about the drug.',
        evidenceSource: 'Van Wagoner RM et al., JAMA 2017;318:2004-2010',
        doi: '10.1001/jama.2017.17069',
        measuredMetric: 'Identity of active compounds found in 44 internet-purchased SARM products',
        auditFlag: 'verified',
      },
      {
        id: 'lgd-a6',
        category: 'failed',
        title: 'Development stopped after phase 2, with no stated efficacy failure',
        laymanSummary:
          'The hip fracture trial produced a clear positive result on its own endpoint, finished in 2017, and no phase 3 followed.',
        technicalDetails:
          'NCT02578095 completed in December 2017 with a monotonic dose-response and all confidence intervals excluding zero on its primary endpoint. No phase 3 programme for VK5211 has been registered since. A compound with a clean dose-response on its registered primary endpoint that is not advanced is an informative record in itself: it tells a reader that the sponsor, seeing the full dataset, did not consider a body-composition endpoint sufficient to build a registration programme on. This page records the absence of a phase 3 as a fact and does not speculate about the reason.',
        evidenceSource:
          'ClinicalTrials.gov, NCT02578095 (completed 17 December 2017); no subsequent registered phase 3 for VK5211',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Oral, and it accumulates',
        laymanDesc:
          'Taken as a capsule. It has a long half-life, so the amount in the blood keeps building for several days of daily dosing before it levels off.',
        molecularDetail:
          'Orally bioavailable with a long elimination half-life and dose-proportional accumulation on multiple dosing, characterised in the phase 1 at 0.1, 0.3 and 1.0 mg daily. Metabolised to dihydroxylated and carboxylated products that are the targets of doping-control confirmation.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Crosses into the cell',
        laymanDesc:
          'The receptor it acts on sits inside the cell, so the molecule has to get through the cell membrane first.',
        molecularDetail:
          'Passive diffusion into the cytoplasm; binds the androgen receptor ligand-binding domain, displacing heat-shock chaperones and permitting nuclear import.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binds the androgen receptor',
        laymanDesc:
          'It locks into the same pocket testosterone uses, holding the receptor in an active shape.',
        molecularDetail:
          'High-affinity, selective binding to AR. The non-steroidal scaffold stabilises a receptor conformation whose coregulator recruitment differs by tissue, which is the structural account offered for anabolic activity in muscle without a measurable PSA change over 21 days.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Two consequences at once: muscle genes on, gonadal axis off',
        laymanDesc:
          'In muscle it turns on growth genes. In the brain the same signal is read as "there is plenty of androgen here", so the body stops making its own.',
        molecularDetail:
          'Ligand-bound AR dimerises and transactivates androgen response elements in myonuclei. The identical signal at hypothalamic and pituitary AR suppresses GnRH and gonadotropin output, producing the dose-dependent falls in total testosterone, SHBG and, at 1 mg, FSH and free testosterone recorded in the phase 1. Hepatic androgen signalling reduces HDL cholesterol by the same class mechanism.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Lean mass rises measurably; nothing else was measured',
        laymanDesc:
          'Scans reliably show more lean tissue, dose for dose. No trial has published whether that made anyone stronger, faster or better able to walk.',
        molecularDetail:
          'Placebo-corrected TBLH lean body mass rose 4.75%, 7.15% and 9.08% at 0.5, 1.0 and 2.0 mg over 12 weeks in the hip fracture phase 2. Physical function was not the posted primary endpoint of that trial, and no larger trial followed.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Basaria 2013 phase 1 in healthy young men',
        phase: 'Phase 1',
        sampleSize: 76,
        primaryEndpoint: 'Safety, tolerability and pharmacokinetics over 21 days',
        endpointMet: true,
        statisticalPValue:
          'No drug-related serious adverse events; dose-dependent suppression of total testosterone, SHBG, HDL cholesterol and triglycerides; dose-dependent increase in lean body mass',
        unreportedAdverseSignals:
          'HDL cholesterol and triglycerides fell dose-dependently — a lipid change reported in the paper but rarely carried into secondary descriptions of the compound.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NCT02578095 (VK5211 acute hip fracture study)',
        phase: 'Phase 2',
        sampleSize: 108,
        primaryEndpoint:
          'Placebo-corrected percentage change in total-body-less-head lean body mass by DXA at week 12',
        endpointMet: true,
        statisticalPValue:
          '0.5 mg +4.75% (95% CI 1.70 to 7.80); 1.0 mg +7.15% (3.76 to 10.54); 2.0 mg +9.08% (5.55 to 12.60)',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Placebo-corrected lean body mass gains of 4.75%, 7.15% and 9.08% at 0.5, 1.0 and 2.0 mg over 12 weeks in 108 patients after hip fracture, all confidence intervals excluding zero',
        'Dose-dependent suppression of total testosterone, SHBG, HDL cholesterol and triglycerides over 21 days in 76 healthy men, reversing after discontinuation',
        'No significant change in haemoglobin, PSA, AST, ALT or QT interval over 21 days at up to 1.0 mg daily',
      ],
      unsupportedInferences: [
        'That a lean body mass gain of this size translates into improved physical function or faster fracture recovery — not measured as a primary endpoint in either trial',
        'That an unchanged 21-day liver panel predicts safety over the months-long, higher-dose exposures described in the case reports',
        'That the phase 1 safety profile applies at the doses used outside trials, which are typically several times the highest dose ever administered under protocol',
      ],
      whatFailedInitially: [
        'No phase 3 was registered after the phase 2 completed in December 2017 with a positive result on its own primary endpoint',
        'The compound has no approval anywhere and no completed trial with a functional primary endpoint',
      ],
      realWorldOutcome: [
        'Prohibited at all times in sport under WADA class S1.2; the dihydroxylated and carboxylated urinary metabolites give long detection windows',
        'One of only three SARMs actually found in the 52% of internet products that contained a SARM at all',
        'Case reports of cholestatic and mixed drug-induced liver injury have accumulated since 2021, several of them in men who also used post-cycle therapy agents',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, once daily; doses tested in trials were 0.1 mg to 2.0 mg',
      description:
        'A capsule in both trials. Outside trials it is most often a liquid in a dropper bottle sold as a research reagent. The entire published human dose range is 0.1 mg to 2.0 mg daily, and the higher of those two figures comes from a single 12-week trial in 108 people.',
      safetyProfile:
        'Over 21 days at up to 1 mg there were no drug-related serious adverse events and no change in liver enzymes, haemoglobin, PSA or QT. Documented harms outside that window are drug-induced liver injury with a cholestatic or mixed pattern, suppression of the hypothalamic-pituitary-gonadal axis with the gynaecomastia and hypogonadism that follow it, and reduced HDL cholesterol. Because it suppresses endogenous testosterone dose-dependently, users commonly follow it with clomiphene or an aromatase inhibitor, and two of the published liver injury cases occurred during that phase rather than during the SARM itself.',
    },
    commonQuestions: [
      {
        q: 'Is 9% more lean mass in twelve weeks a real number?',
        a: 'Yes, and it is worth being precise about what it measures. It is the placebo-corrected least-squares mean percentage change in total-body-less-head lean body mass on a whole-body DXA scan, at the 2 mg dose, in 108 people aged 65 and over recovering from a hip fracture, posted on ClinicalTrials.gov for NCT02578095. Lean body mass on DXA includes water. A drug that increases intracellular water and glycogen alongside contractile protein moves that number. The dose-response is clean and the confidence intervals exclude zero, so something real is happening; what the trial cannot tell you is how much of it is contractile tissue and whether any of it made a difference to walking.',
        auditNote:
          'The trial had no functional primary endpoint. Enobosarm is the cautionary case: two phase 3 trials with a lean-mass advantage and no physical function advantage in either.',
      },
      {
        q: 'Will it shut down my own testosterone?',
        a: 'The phase 1 measured this directly and the answer was yes, dose-dependently, within three weeks. Total testosterone and sex hormone-binding globulin fell at every dose; FSH and free testosterone fell significantly at 1 mg. All of it returned to baseline during the five-week follow-up after a 21-day exposure. Nobody has published what happens after longer courses at higher doses, which is what people actually take, and the case literature includes reversible gynaecomastia and hypogonadism in exactly that situation.',
      },
      {
        q: 'If the phase 2 worked, why did nobody develop it?',
        a: 'That is the honest question and this page will not invent an answer. The recorded facts are: the trial completed in December 2017, posted a monotonic dose-response on its primary endpoint with all confidence intervals excluding zero, and no phase 3 for VK5211 has been registered since. Sponsors stop programmes for reasons that include financing, portfolio priorities, regulatory feedback about endpoints, and safety findings that never reach a journal. Which of those applied here is not on the public record, so this page records the gap rather than filling it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Basaria S et al. The safety, pharmacokinetics, and effects of LGD-4033, a novel nonsteroidal oral, selective androgen receptor modulator, in healthy young men. J Gerontol A Biol Sci Med Sci 2013;68:87-95',
        identifier: '10.1093/gerona/gls078',
        kind: 'doi',
      },
      {
        label:
          'VK5211 phase 2 in patients 65 years or older after acute hip fracture — posted results, primary outcome by DXA at week 12',
        identifier: 'NCT02578095',
        kind: 'nct',
      },
      {
        label:
          'Van Wagoner RM et al. Chemical composition and labeling of substances marketed as selective androgen receptor modulators and sold via the internet. JAMA 2017;318:2004-2010',
        identifier: '10.1001/jama.2017.17069',
        kind: 'doi',
      },
      {
        label:
          'Labban H et al. LGD-4033 and a case of drug-induced liver injury: exploring the clinical implications of off-label selective androgen receptor modulator use in healthy adults. Cureus 2024;16:e69601',
        identifier: '10.7759/cureus.69601',
        kind: 'doi',
      },
      {
        label:
          'Koller T et al. Liver injury associated with the use of selective androgen receptor modulators and post-cycle therapy: two case reports and literature review. World J Clin Cases 2021;9:4062-4071',
        identifier: '10.12998/wjcc.v9.i16.4062',
        kind: 'doi',
      },
      {
        label:
          'Further insights into the metabolism of LGD-4033 in human urine, part 2: a new minor metabolite with antagonistic activity on the androgen receptor can indicate recent substance intake. Drug Test Anal 2026;18:159-169',
        identifier: '10.1002/dta.70005',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 44137686 — LGD-4033 structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/44137686',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 3. RAD-140 (testolone)
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'testolone',
    name: 'Testolone',
    tradeName: 'RAD140; sold online as testolone',
    sponsor: 'Radius Health, Inc.',
    targetGene: 'AR',
    targetProtein: 'Androgen receptor (nuclear receptor subfamily 3, group C, member 4)',
    modality: 'Small Molecule',
    approvalStatus: 'Pre-clinical / Open Source',
    indication:
      'The only registered human trial was a 20-patient phase 1 dose-escalation in postmenopausal women with androgen-receptor-positive, oestrogen-receptor-positive breast cancer. Never approved anywhere, and never trialled for muscle building in humans.',
    patientFriendlyIndication:
      'Nothing, in humans. Its human evidence is one 20-person cancer dose-finding study',
    anatomicalSite:
      'Androgen receptor in skeletal muscle myonuclei; in the oncology programme, AR in breast tumour cells',
    conditionContext: {
      conditionExplainer:
        'Radius Health developed RAD140 for a specific kind of breast cancer: tumours that carry both the androgen receptor and the oestrogen receptor. In that setting, switching the androgen receptor on suppresses oestrogen-receptor signalling and slows the tumour.',
      whyItMatters:
        'That is the entire clinical rationale on record. The muscle-building programme people buy it for was never run: no company has ever tested RAD140 for muscle mass or strength in a human being.',
      whoTakesThis:
        'In the one trial: 20 postmenopausal women with metastatic breast cancer. Outside it: young men, including the 16-year-old in the myopericarditis case report, buying it as a supposedly stronger alternative to ostarine.',
      clinicalGoals:
        'The phase 1 was a dose-escalation, so its goals were tolerability and pharmacokinetics rather than tumour response.',
    },
    oneSentenceVerdict:
      'The SARM with the thinnest human evidence and the heaviest case-report burden: one completed 20-patient phase 1 in breast cancer, no human muscle trial ever, and published reports of severe cholestatic liver injury and of myopericarditis after a single dose in a 16-year-old.',
    laymanHowItWorks:
      'RAD140 binds the androgen receptor — the same switch testosterone uses — and turns it on. In rodents it enlarges muscle fibres. In breast cancer cells it does something different and more interesting: switching the androgen receptor on turns the oestrogen receptor gene down, which is why a drug people buy for muscle was actually developed as a cancer treatment. Neither of those effects has been measured in a human being for the purpose people take it.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 22,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C=CC(=C1Cl)C#N)N[C@@H](C2=NN=C(O2)C3=CC=C(C=C3)C#N)[C@H](C)O',
      chemicalFormula: 'C20H16ClN5O2',
      molecularWeight: '393.8 g/mol',
      targetReceptorAffinity:
        'Non-steroidal 1,3,4-oxadiazole. Its originators report high affinity and specificity for the androgen receptor across a panel of four nuclear receptors, with tissue-selective activity: it activated AR in breast cancer cells but not in prostate cancer cells.',
      structureSource: {
        label:
          'PubChem CID 44200882 (RAD140) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/44200882',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'rad-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Reference standard identity',
          description:
            'Confirm the standard is RAD140 rather than one of the oxadiazole analogues that circulate under the same name. The chloro-methyl-benzonitrile and the para-cyanophenyl oxadiazole give distinctive fragmentation, and the accurate mass distinguishes it from every other common SARM.',
          reagentsAndBuffer:
            'Certified RAD140 reference standard, deuterated internal standard, 1H and 13C NMR in DMSO-d6, high-resolution accurate-mass ESI-MS with in-source fragmentation, chiral HPLC for enantiomeric purity',
        },
        {
          id: 'rad-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Content assay of a purchased product',
          description:
            'Quantify RAD140 in a capsule or dropper bottle and screen the same extract for other SARMs, aromatase inhibitors and growth hormone secretagogues, which co-occur in these products more often than not.',
          dependsOnStepId: 'rad-w1',
          reagentsAndBuffer:
            'Methanol extraction with sonication, PTFE filtration, reversed-phase C18 UHPLC with diode-array detection at 260 nm, quantitative 1H NMR against maleic acid for the non-fluorinated actives',
        },
        {
          id: 'rad-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Biological sample preparation for confirmation',
          description:
            'Extract parent compound and metabolites from blood, urine or hair. Hair analysis is the step that establishes repeated rather than single exposure, and it is what distinguishes an accidental contamination defence from a use pattern.',
          dependsOnStepId: 'rad-w2',
          reagentsAndBuffer:
            'Beta-glucuronidase hydrolysis in phosphate buffer for urine; hair decontamination in dichloromethane followed by pulverisation and overnight incubation in pH 8.4 phosphate buffer; solid-phase or liquid-liquid extraction and reconstitution in mobile phase',
        },
        {
          id: 'rad-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Tissue-selective receptor activity panel',
          description:
            'Measure transactivation in breast cancer and prostate cancer cell lines side by side against the same compound. That paired comparison is the experiment behind the tissue-selectivity claim, and it is not reproducible from a single cell line.',
          dependsOnStepId: 'rad-w3',
          reagentsAndBuffer:
            'MCF-7 or ZR-75-1 AR-positive, ER-positive breast cancer cells and LNCaP prostate cancer cells, ARE-luciferase reporter, charcoal-stripped serum in phenol-red-free medium, dihydrotestosterone control',
        },
        {
          id: 'rad-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Nuclear receptor binding panel and LC-MS/MS quantification',
          description:
            'Determine binding affinity against androgen, oestrogen, progesterone and glucocorticoid receptors in the same experiment, and quantify the compound in biological matrix by tandem mass spectrometry against an isotope-labelled internal standard.',
          dependsOnStepId: 'rad-w4',
          reagentsAndBuffer:
            '[3H]-R1881 for AR, [3H]-estradiol for ER, [3H]-R5020 for PR, [3H]-dexamethasone for GR; recombinant ligand-binding domains or cytosolic preparations; dextran-coated charcoal separation; C18 column with 0.1% formic acid gradient and multiple-reaction monitoring',
        },
      ],
    },
    keyAudits: [
      {
        id: 'rad-a1',
        category: 'measured',
        title: 'The only human trial is a completed 20-patient phase 1 in breast cancer',
        laymanSummary:
          'One registered human study exists. It gave RAD140 to 20 postmenopausal women with breast cancer to find a tolerable dose, ran from 2017 to 2020, and that is the whole human record.',
        technicalDetails:
          'NCT03088527, "Phase 1, First-in-Human Study of RAD140 in Postmenopausal Women With Breast Cancer", sponsored by Radius Health, enrolled 20 participants, started 23 October 2017 and completed 24 September 2020. It is a dose-escalation study in androgen-receptor-positive, oestrogen-receptor-positive metastatic breast cancer. No phase 2 followed. There has never been a registered trial of RAD140 for muscle mass, strength, physical function or body composition in humans, at any dose, in any population. Every claim about what it does to human muscle is an extrapolation from rodents.',
        evidenceSource: 'ClinicalTrials.gov, NCT03088527 (completed 24 September 2020)',
        measuredMetric: 'Number and size of completed human trials of RAD140',
        auditFlag: 'verified',
      },
      {
        id: 'rad-a2',
        category: 'measured',
        title: 'Preclinical: activates AR in breast cancer cells and suppresses the ESR1 gene',
        laymanSummary:
          'In laboratory models of breast cancer, turning the androgen receptor on with RAD140 turned the oestrogen receptor gene down and shrank tumours grown from patient tissue.',
        technicalDetails:
          'Yu et al. profiled RAD140 against four nuclear receptors and found high affinity and specificity for AR. It activated AR in breast cancer cells but not in prostate cancer cells. Oral administration substantially inhibited growth of androgen-receptor-positive, oestrogen-receptor-positive patient-derived xenografts, with AR activation and suppression of the ER pathway including the ESR1 gene itself; combining it with palbociclib improved efficacy further. This is a well-executed preclinical package and it is the basis of the phase 1. It is not evidence about muscle in people.',
        evidenceSource: 'Yu Z et al., Clin Cancer Res 2017;23:7608-7620',
        doi: '10.1158/1078-0432.CCR-17-0670',
        measuredMetric:
          'Tumour growth inhibition in AR-positive, ER-positive patient-derived xenografts; ESR1 suppression',
        auditFlag: 'verified',
      },
      {
        id: 'rad-a3',
        category: 'failed',
        title: 'In rats it added nothing on top of the training stimulus',
        laymanSummary:
          'When rats had their muscles overloaded to force growth, adding RAD140 did not make the muscles grow more than overload alone. It only increased fibre size in the rats that were doing nothing.',
        technicalDetails:
          'Puskas et al. randomised male Sprague-Dawley rats, 10 per group, to RAD140 or vehicle with or without functional overload of the plantaris, for 14 days. Muscle weight in the RAD140 plus overload group rose but was not statistically different from vehicle plus overload. Fibre cross-sectional area showed the same pattern: RAD140 significantly raised cross-sectional area in the sedentary control group, and did not add to overload. Micro-CT of the tibia showed no effect on cortical or trabecular bone morphometry at 14 days. A drug that works in the absence of a training stimulus and adds nothing in its presence is a specific and testable finding, and it is the opposite of how the compound is marketed.',
        evidenceSource: 'Puskas J et al., Physiol Rep 2025;13:e70463',
        doi: '10.14814/phy2.70463',
        measuredMetric:
          'Muscle weight and fibre cross-sectional area with and without functional overload; tibial micro-CT',
        auditFlag: 'verified',
      },
      {
        id: 'rad-a4',
        category: 'measured',
        title: 'Severe cholestatic liver injury, repeatedly, in published case reports',
        laymanSummary:
          'Several independent teams have published cases of young men developing jaundice and severe liver injury after taking RAD-140 bought online, some needing steroid treatment to recover.',
        technicalDetails:
          'Perananthan and George reported severe liver injury after RAD-140 taken for body building. A 2025 report in ACG Case Reports Journal describes cholestatic drug-induced liver injury from RAD-140 that required corticosteroid treatment. A further case appears in Proceedings (Baylor University Medical Center) in 2026. Reports of SARM-associated liver injury in general, in which RAD-140 features, appear across Cureus, JPGN Reports and Zeitschrift fur Gastroenterologie between 2024 and 2026. These are case reports and cannot give an incidence, but the pattern across independent centres and countries is consistent: cholestatic or mixed injury, weeks to months after starting, in young men with no other cause found.',
        evidenceSource:
          'Perananthan V, George J, Aust Prescr 2024;47:26-28; ACG Case Rep J 2025;12:e01803; Proc (Bayl Univ Med Cent) 2026',
        doi: '10.18773/austprescr.2024.004',
        measuredMetric:
          'Published cases of biopsy- or biochemistry-confirmed drug-induced liver injury',
        auditFlag: 'verified',
      },
      {
        id: 'rad-a5',
        category: 'measured',
        title: 'Myopericarditis in a 16-year-old after the first dose',
        laymanSummary:
          'A cardiology journal reported a 16-year-old boy who developed inflammation of the heart muscle and its lining after taking one dose of RAD-140.',
        technicalDetails:
          'Schwartzman et al. reported myopericarditis in a 16-year-old boy following the first dose of RAD-140. The authors note that these compounds are widely used by physically active young adults and that the adverse effects, which can be life-threatening, are not well characterised. A single case cannot establish causation and the report does not claim to. What it does establish is that the compound is being taken by minors, that a serious cardiac event was temporally associated with a first exposure, and that no safety database exists against which to judge whether such an event is expected or exceptional.',
        evidenceSource: 'Schwartzman KH et al., JACC Case Rep 2024;29:102423',
        doi: '10.1016/j.jaccas.2024.102423',
        measuredMetric:
          'Cardiac MRI and troponin-confirmed myopericarditis after a single exposure',
        auditFlag: 'caution',
      },
      {
        id: 'rad-a6',
        category: 'inferred',
        title: 'It was not among the SARMs actually found in tested products',
        laymanSummary:
          'When 44 products sold as SARMs were analysed, the SARMs found were ostarine, LGD-4033 and andarine. RAD-140 was not one of them, even though it is heavily marketed.',
        technicalDetails:
          'Van Wagoner et al. found one or more SARMs in 23 of 44 internet products (52%), and identified those compounds as ostarine, LGD-4033 or andarine. A further 39% of products contained ibutamoren, GW501516 or SR9009 instead. RAD140 does not appear in the list of compounds detected. The sampling was done in 2016, before RAD-140 reached its current popularity, so this is not evidence that RAD-140 products are empty today. It is a reason to treat the identity of the compound in any given bottle as unestablished — which, for a substance whose entire human record is one 20-person trial, means the exposure people describe is doubly unknown.',
        evidenceSource: 'Van Wagoner RM et al., JAMA 2017;318:2004-2010',
        doi: '10.1001/jama.2017.17069',
        inferredClaim:
          'That a product labelled RAD-140 contains RAD-140 — an assumption the only chain-of-custody analysis of this market gives no support to',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Orally bioavailable small molecule',
        laymanDesc:
          'It survives the gut and is absorbed as a tablet or a liquid, which is why it is sold as a capsule rather than an injection.',
        molecularDetail:
          'Non-steroidal oxadiazole, orally bioavailable in rodents and in the phase 1 dose-escalation. Human pharmacokinetics beyond that dose-escalation are not in the peer-reviewed literature.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters the cell and reaches the receptor',
        laymanDesc:
          'The androgen receptor is inside the cell, so the molecule diffuses across the membrane before binding anything.',
        molecularDetail:
          'Passive membrane diffusion, then binding to the AR ligand-binding domain with high affinity and with specificity over oestrogen, progesterone and glucocorticoid receptors in a four-receptor panel.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Activates the androgen receptor in some tissues and not others',
        laymanDesc:
          'It switched the receptor on in breast cancer cells and left it alone in prostate cancer cells, in the same set of experiments.',
        molecularDetail:
          'Tissue-selective transactivation: AR activation in AR-positive, ER-positive breast cancer lines and no equivalent activation in prostate cancer lines, attributed to differing coregulator availability rather than to differing receptor identity.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Turns the oestrogen receptor gene down',
        laymanDesc:
          'In breast tumour cells the activated androgen receptor suppresses the gene that makes the oestrogen receptor, which is what makes it a plausible cancer drug.',
        molecularDetail:
          'AR-mediated repression of ESR1 and of a subset of AR-repressed genes associated with DNA replication, with additive suppression when combined with the CDK4/6 inhibitor palbociclib. In skeletal muscle the corresponding programme is myofibre hypertrophy, shown in rats and never measured in people.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Tumour growth inhibition in xenografts; nothing measured in human muscle',
        laymanDesc:
          'The measurable outcome on record is smaller tumours in mice carrying human breast cancer tissue. There is no human muscle outcome of any kind.',
        molecularDetail:
          'Substantial growth inhibition of AR-positive, ER-positive patient-derived xenografts as monotherapy and in combination. In rats, increased fibre cross-sectional area in sedentary animals and no additive effect over functional overload. No human body-composition or strength endpoint has ever been reported.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT03088527 (first-in-human phase 1 in postmenopausal breast cancer)',
        phase: 'Phase 1',
        sampleSize: 20,
        primaryEndpoint: 'Dose escalation for safety, tolerability and pharmacokinetics',
        endpointMet: true,
        statisticalPValue:
          'Dose-escalation design with no comparative efficacy hypothesis; no phase 2 followed',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Puskas 2025 rat functional overload study',
        phase: 'Preclinical, randomised, 4 groups of 10 rats',
        sampleSize: 40,
        primaryEndpoint:
          'Triceps surae muscle weight and plantaris fibre cross-sectional area after 14 days, with and without functional overload',
        endpointMet: false,
        statisticalPValue:
          'RAD140 plus overload not statistically different from vehicle plus overload; RAD140 alone raised cross-sectional area versus vehicle alone; no effect on tibial cortical or trabecular morphometry',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'High-affinity, specific androgen receptor binding across a four-nuclear-receptor panel, with AR activation in breast cancer cells and not in prostate cancer cells',
        'Substantial inhibition of AR-positive, ER-positive patient-derived breast cancer xenograft growth, with suppression of ESR1',
        'Increased plantaris fibre cross-sectional area in sedentary rats, and no additive effect over functional overload',
        'One completed 20-patient phase 1 dose-escalation in humans, and no other registered human trial of any kind',
      ],
      unsupportedInferences: [
        'That RAD-140 builds muscle in humans — no human trial has ever measured muscle mass, strength or physical function with this compound',
        'That it is a stronger version of ostarine, a ranking derived from rodent anabolic potency assays and marketing copy rather than from any human comparison',
        'That the rodent hypertrophy effect adds to training, when the one study designed to test that found it did not',
      ],
      whatFailedInitially: [
        'The oncology programme did not progress past the completed phase 1; no phase 2 has been registered since 2020',
        'The rat study found no additive effect of RAD140 over functional overload and no bone effect at 14 days',
      ],
      realWorldOutcome: [
        'Independent case reports from Australia, the United States and Europe describe cholestatic and mixed drug-induced liver injury, one requiring corticosteroids',
        'A cardiology case report describes myopericarditis in a 16-year-old after a single dose',
        'Prohibited at all times in sport under WADA class S1.2; detectable in hair, which distinguishes repeated use from single exposure',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule or liquid suspension; no established human dose outside the phase 1 escalation',
      description:
        'Sold as a capsule or as a liquid in a dropper bottle labelled for research use. The doses used outside trials are not in the literature and cannot be compared with anything, because the only human dosing on record is an oncology dose-escalation whose levels are not published in a peer-reviewed paper.',
      safetyProfile:
        'No controlled human safety dataset exists. The published human record consists of case reports: severe cholestatic liver injury, one case requiring corticosteroid treatment, and myopericarditis in a 16-year-old after a first dose. Class effects that apply by mechanism include suppression of endogenous testosterone and gonadotropins with reversible gynaecomastia and hypogonadism, and reduced HDL cholesterol. Where an approved drug would have a safety database of thousands of exposures, this compound has twenty.',
    },
    commonQuestions: [
      {
        q: 'Is RAD-140 stronger than ostarine?',
        a: 'There is no human experiment that could answer that. Ostarine has a 120-person phase 2, a 159-person phase 2 in cancer patients and two 300-plus-patient phase 3 trials. RAD-140 has a 20-patient oncology dose-escalation and no muscle endpoint in any human, ever. Rankings of SARM potency circulate as though they came from head-to-head data; they come from rodent anabolic-to-androgenic ratio assays run by different groups under different conditions, which do not support a ranking even between rodents.',
        auditNote:
          'A comparison needs two measurements of the same thing. Here one of the two does not exist.',
      },
      {
        q: 'Why was a muscle drug developed for breast cancer?',
        a: 'Because that is what it does in the models it was tested in. Steroidal androgens were used to treat breast cancer decades ago and worked; the difficulty was their virilising effects. Radius Health built RAD140 to activate the androgen receptor in breast tumour cells while leaving prostate tissue alone, and in patient-derived xenografts it worked — including by suppressing ESR1, the gene for the oestrogen receptor. The muscle effect that people buy it for is a rodent finding from the same preclinical package that was never pursued clinically.',
      },
      {
        q: 'How dangerous is it?',
        a: 'Unquantifiable, and that is the honest answer rather than a hedge. Danger is a rate, and a rate needs a denominator — how many people took it, at what dose, for how long. None of that exists for RAD-140 outside the twenty patients in the phase 1. What does exist is a set of severe events published by independent clinicians who had no connection to each other: cholestatic liver injury needing corticosteroids, severe liver injury requiring hospital care, and myopericarditis in a minor after one dose. Those establish that these events happen. They cannot tell you how often.',
        auditNote:
          'This page does not describe the harms as rare or as common. Neither word is supported, and choosing one would be editorialising past the evidence.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Miller CP et al. Design, synthesis, and preclinical characterization of the selective androgen receptor modulator (SARM) RAD140. ACS Med Chem Lett 2011;2:124-129',
        identifier: '10.1021/ml1002508',
        kind: 'doi',
      },
      {
        label:
          'Yu Z et al. Selective androgen receptor modulator RAD140 inhibits the growth of androgen/estrogen receptor-positive breast cancer models with a distinct mechanism of action. Clin Cancer Res 2017;23:7608-7620',
        identifier: '10.1158/1078-0432.CCR-17-0670',
        kind: 'doi',
      },
      {
        label:
          'Jayaraman A et al. Selective androgen receptor modulator RAD140 is neuroprotective in cultured neurons and kainate-lesioned male rats. Endocrinology 2014;155:1398-1406',
        identifier: '10.1210/en.2013-1725',
        kind: 'doi',
      },
      {
        label: 'Phase 1, first-in-human study of RAD140 in postmenopausal women with breast cancer',
        identifier: 'NCT03088527',
        kind: 'nct',
      },
      {
        label:
          'Puskas J et al. Preclinical assessment of the selective androgen receptor modulator RAD140 to increase muscle mass and bone mineral density. Physiol Rep 2025;13:e70463',
        identifier: '10.14814/phy2.70463',
        kind: 'doi',
      },
      {
        label:
          'Perananthan V, George J. Severe liver injury following use of RAD-140, a selective androgen receptor modulator, for body building. Aust Prescr 2024;47:26-28',
        identifier: '10.18773/austprescr.2024.004',
        kind: 'doi',
      },
      {
        label:
          'Cholestatic drug-induced liver injury from RAD-140 successfully treated with corticosteroids. ACG Case Rep J 2025;12:e01803',
        identifier: '10.14309/crj.0000000000001803',
        kind: 'doi',
      },
      {
        label:
          'Schwartzman KH et al. Myopericarditis following use of selective androgen receptor modifier "RAD-140". JACC Case Rep 2024;29:102423',
        identifier: '10.1016/j.jaccas.2024.102423',
        kind: 'doi',
      },
      {
        label:
          'Van Wagoner RM et al. Chemical composition and labeling of substances marketed as selective androgen receptor modulators and sold via the internet. JAMA 2017;318:2004-2010',
        identifier: '10.1001/jama.2017.17069',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 44200882 — RAD140 structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/44200882',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 4. Cardarine (GW501516, GW1516)
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cardarine',
    name: 'Cardarine',
    tradeName: 'GW501516; also written GW1516 in anti-doping documents',
    sponsor: 'GlaxoSmithKline, in a collaboration with Ligand Pharmaceuticals',
    targetGene: 'PPARD',
    targetProtein: 'Peroxisome proliferator-activated receptor delta (PPAR-delta, PPAR-beta/delta)',
    modality: 'Small Molecule',
    approvalStatus: 'Phase 2 Investigational',
    indication:
      'Investigated for dyslipidaemia and features of the metabolic syndrome. Development was discontinued and the compound was never approved anywhere.',
    patientFriendlyIndication:
      'Abandoned cholesterol and metabolic drug, still sold as a fat burner',
    anatomicalSite: 'PPAR-delta in skeletal muscle, liver, adipose tissue and macrophages',
    conditionContext: {
      conditionExplainer:
        'PPAR-delta is a nuclear receptor that skeletal muscle uses to switch its fuel preference towards fat. Exercise raises its expression in muscle, which is why a drug that activates it was described from the beginning in the language of exercise.',
      whyItMatters:
        'The metabolic effects in humans were real and were measured properly. What ended the programme was not a lack of effect. That is what makes this compound unusual, and it is why it is still sold.',
      whoTakesThis:
        'In trials: 24 healthy volunteers, 18 moderately obese men, and dyslipidaemic patients with central obesity. Outside trials: endurance athletes and people wanting fat loss, at doses and durations nobody has studied.',
      clinicalGoals:
        'The trials measured HDL cholesterol, triglycerides, LDL cholesterol, apolipoprotein B, liver fat content and fatty acid oxidation.',
    },
    oneSentenceVerdict:
      'A metabolic drug that did exactly what it was designed to do in three separate human trials, was discontinued in development, and is now sold openly to athletes while the published animal data show it accelerating tumour growth.',
    laymanHowItWorks:
      'Muscle decides moment to moment whether to burn fat or sugar, and a nuclear receptor called PPAR-delta is part of how it decides. Exercise raises the amount of that receptor in muscle. Cardarine is a switch that turns it on directly: muscle burns more fat, triglycerides fall, HDL cholesterol rises, and liver fat drops. All of that was measured in people and all of it held up. The problem is that PPAR-delta is not only in muscle. It is also in the gut, the skin, the breast and the stomach, and in animals that already have a tumour or a genetic predisposition to one, switching it on makes the tumour grow faster.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 30,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C=CC(=C1)SCC2=C(N=C(S2)C3=CC=C(C=C3)C(F)(F)F)C)OCC(=O)O',
      chemicalFormula: 'C21H18F3NO3S2',
      molecularWeight: '453.5 g/mol',
      targetReceptorAffinity:
        'Potent and highly selective synthetic agonist of PPAR-delta, with selectivity over PPAR-alpha and PPAR-gamma. It is the reference PPAR-delta agonist in the pharmacology literature and is used as the positive control in most PPAR-delta experiments published since 2001.',
      structureSource: {
        label:
          'PubChem CID 9803963 (GW501516) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9803963',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'gw-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Reference standard identity and solid-form check',
          description:
            'Confirm the standard is GW501516 and identify which crystalline form it is. This is not pedantry: multiple polymorphs of cardarine have been characterised by X-ray diffraction and thermal analysis, and they differ in dissolution behaviour, so a purity assay run against the wrong form gives the wrong answer.',
          reagentsAndBuffer:
            'Certified GW501516 reference standard, GW501516-d4 internal standard, powder X-ray diffraction, differential scanning calorimetry, FTIR, 1H and 19F NMR in DMSO-d6',
        },
        {
          id: 'gw-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Content assay of a seized or purchased product',
          description:
            'Quantify GW501516 in a capsule or liquid and screen for the compounds that accompany it. Cardarine is one of the substances most often found in products that do not declare it, so this assay is run on products labelled as something else as often as on products labelled as cardarine.',
          dependsOnStepId: 'gw-w1',
          reagentsAndBuffer:
            'Methanol extraction with sonication, PTFE filtration, reversed-phase C18 UHPLC with diode-array detection, quantitative 19F NMR against an internal standard, LC-HRMS for unlabelled actives',
        },
        {
          id: 'gw-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hair and urine sample preparation',
          description:
            'GW1516 is extensively metabolised, so the parent compound is often absent from urine even when exposure is recent and substantial. In the documented poisoning case the parent was undetectable in urine while measurable in blood and hair, which is why hair analysis carries the exposure history here.',
          dependsOnStepId: 'gw-w2',
          reagentsAndBuffer:
            'Hair decontamination in dichloromethane, pulverisation, overnight incubation in pH 8.4 phosphate buffer; urine hydrolysis with beta-glucuronidase; liquid-liquid extraction into ethyl acetate and reconstitution in mobile phase',
        },
        {
          id: 'gw-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'PPAR isoform reporter panel',
          description:
            'Express PPAR-delta, PPAR-alpha and PPAR-gamma reporter constructs in parallel and run the compound against all three. Selectivity is the whole claim for this molecule, and selectivity is a comparison, so it cannot be measured in a single-isoform assay.',
          dependsOnStepId: 'gw-w3',
          reagentsAndBuffer:
            'PPAR-delta, PPAR-alpha and PPAR-gamma GAL4 chimeric reporter cell lines, UAS-luciferase reporter, charcoal-stripped serum, reference agonists GW7647 for alpha and rosiglitazone for gamma',
        },
        {
          id: 'gw-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'LC-MS/MS quantification and target gene expression readout',
          description:
            'Quantify parent and metabolites in blood, urine and hair by tandem mass spectrometry, and separately measure the transcriptional footprint — CPT1b, PDK4, ANGPTL4 and CD36 in muscle cells — which is the pharmacodynamic evidence that the receptor was actually engaged.',
          dependsOnStepId: 'gw-w4',
          reagentsAndBuffer:
            'C18 analytical column with 0.1% formic acid and acetonitrile gradient, electrospray positive-ion multiple-reaction monitoring, deuterated internal standard; quantitative PCR against CPT1b, PDK4, ANGPTL4 and CD36 with a housekeeping normaliser',
        },
      ],
    },
    keyAudits: [
      {
        id: 'gw-a1',
        category: 'measured',
        title: 'It works: HDL up, triglycerides down, in the first human study of the class',
        laymanSummary:
          'The first time a PPAR-delta agonist was given to people, two weeks of cardarine raised HDL cholesterol at both doses and improved how fast fat was cleared from the blood after a fatty meal.',
        technicalDetails:
          'Sprecher et al. allocated healthy volunteers to placebo (n=6) or GW501516 at 2.5 mg (n=9) or 10 mg (n=9) once daily for two weeks while hospitalised and sedentary. HDL cholesterol rose at both doses (2.5 mg P=0.004, 10 mg P<0.001) against an 11.5% fall in the placebo group (P=0.002). Serum triglycerides trended down at 10 mg (P=0.08) while post-fat-feeding triglyceride clearance improved on drug (P=0.02). In parallel human skeletal muscle cell culture, the compound induced fatty acid oxidation and upregulated CPT1 and CD36, with a two-fold increase in ABCA1 (P=0.002). This is the paper that named the effect and it holds up on its own terms.',
        evidenceSource: 'Sprecher DL et al., Arterioscler Thromb Vasc Biol 2007;27:359-365',
        doi: '10.1161/01.ATV.0000252790.70572.0c',
        measuredMetric: 'HDL cholesterol and post-prandial triglyceride clearance over 2 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'gw-a2',
        category: 'measured',
        title: 'In obese men it reversed several metabolic abnormalities at once',
        laymanSummary:
          'Two weeks of cardarine in moderately overweight men cut triglycerides by 30%, LDL cholesterol by 23% and liver fat by 20%, and increased the proportion of a meal that was burned as fat.',
        technicalDetails:
          'Riserus et al. ran a double-blind randomised three-parallel-group two-week study: GW501516 10 mg daily, the PPAR-alpha agonist GW590735 20 micrograms daily, or placebo, six moderately overweight subjects per group. GW501516 produced statistically significant reductions in fasting triglycerides (-30%), apolipoprotein B (-26%), LDL cholesterol (-23%) and insulin (-11%), with HDL cholesterol unchanged in this study. Liver fat content fell 20% (P < 0.05) and urinary isoprostanes, a global oxidative stress marker, fell 30% (P = 0.01). The proportion of exhaled CO2 derived from the fat in a test meal rose (P < 0.05) and skeletal muscle CPT1b expression increased. The PPAR-alpha comparator produced only the triglyceride change. Eighteen people is a small study, and it is a mechanistically complete one.',
        evidenceSource: 'Riserus U et al., Diabetes 2008;57:332-339',
        doi: '10.2337/db07-1318',
        measuredMetric:
          'Fasting triglycerides, apoB, LDL cholesterol, liver fat by imaging, urinary isoprostanes, meal-derived exhaled CO2',
        auditFlag: 'verified',
      },
      {
        id: 'gw-a3',
        category: 'conclusion_shift',
        title: 'The compound that promotes tumour growth in the published animal work',
        laymanSummary:
          'In mice genetically prone to bowel polyps, cardarine made the polyps bigger — five times as many large ones. In a second model it drove metastatic stomach cancer within two months.',
        technicalDetails:
          'Gupta et al. treated Apc(min) mice, which are predisposed to intestinal polyposis, with GW501516 and found a significant increase in both the number and the size of intestinal polyps, with a fivefold increase in the number of polyps larger than 2 mm. Pollock et al. built a gastric tumour model that is dependent on GW501516 following carcinogen administration: tumorigenesis progressed to highly metastatic squamous cell carcinoma of the forestomach within two months, with increased PDK1, Akt, beta-catenin and S100A9 expression. Later work has added colonic inflammation and tumour growth, KRAS-mutant pancreatic carcinogenesis and suppression of CD8 T-cell cytotoxicity to the same picture. These are promotion models rather than two-year carcinogenicity bioassays: they test whether the compound accelerates an existing or initiated process, and it does. The sponsor conducted its own long-term rodent carcinogenicity work, but that dataset has not appeared in the peer-reviewed literature, so this page cites the published experiments and does not quote figures it cannot check.',
        evidenceSource:
          'Gupta RA et al., Nat Med 2004;10:245-247; Pollock CB et al., PPAR Res 2010;2010:571783',
        doi: '10.1038/nm993',
        inferredClaim:
          'That a metabolic benefit measured over two weeks in eighteen people can be weighed against a carcinogenicity question the public record cannot quantify',
        auditFlag: 'caution',
      },
      {
        id: 'gw-a4',
        category: 'failed',
        title: 'Development stopped after phase 2, with the efficacy endpoints met',
        laymanSummary:
          'Three separate human studies showed the drug doing what it was supposed to do. It was never taken further, and it has no approval anywhere.',
        technicalDetails:
          'The published human programme consists of Sprecher et al. 2007 in healthy volunteers, Riserus et al. 2008 in moderately obese men, Ooi et al. 2011 on lipoprotein kinetics in dyslipidaemic subjects with central obesity, and a 2012 study in subjects with low HDL cholesterol and metabolic syndrome features. Every one of them reported the intended lipid or metabolic effect. No phase 3 was ever registered, no regulatory submission was made, and the compound is not approved in any jurisdiction. A drug that meets its endpoints and is abandoned is telling a reader something, and on this page the something is recorded as an unexplained discontinuation rather than dressed up as a conclusion.',
        evidenceSource:
          'Sprecher DL et al., ATVB 2007;27:359-365; Riserus U et al., Diabetes 2008;57:332-339; Ooi EM et al., J Clin Endocrinol Metab 2011;96:E1568-E1576; ATVB 2012;32:2289-2294',
        doi: '10.1210/jc.2011-1131',
        auditFlag: 'caution',
      },
      {
        id: 'gw-a5',
        category: 'measured',
        title: 'A documented human poisoning: transaminases in the thousands and CK above 86,000',
        laymanSummary:
          'A 43-year-old sports coach who took cardarine with ostarine arrived at hospital with muscle breakdown and liver damage. His creatine kinase was 86,435 and his AST 2,558. He recovered over six weeks.',
        technicalDetails:
          'Kintz et al. reported a 43-year-old male sports coach presenting with epigastric pain, myalgia and severe headache after several days of combined GW1516 and MK2866. ALT reached 922 IU/L, AST 2,558 IU/L and creatine phosphokinase 86,435 IU/L — massive rhabdomyolysis with hepatic cytolysis. Blood concentrations were 403 ng/mL cardarine and 1 ng/mL ostarine. The parent GW1516 was not detectable in urine because of extensive metabolism, while hair analysis of a 2 cm segment returned 146 pg/mg cardarine and 1,105 pg/mg ostarine, demonstrating repeated use over about two months. Asthenia persisted two weeks and the subject fully recovered by six weeks. Two compounds were taken together, so attribution to either alone is not possible, and the report says so.',
        evidenceSource: 'Kintz P et al., Toxics 2021;9:251',
        doi: '10.3390/toxics9100251',
        measuredMetric:
          'Peak ALT, AST and creatine phosphokinase; blood and hair concentrations of both compounds',
        auditFlag: 'verified',
      },
      {
        id: 'gw-a6',
        category: 'measured',
        title: 'Present in products that never mention it',
        laymanSummary:
          'When 44 products sold as SARMs were analysed, four in ten contained a different unapproved drug instead, and cardarine was one of the three found.',
        technicalDetails:
          'Van Wagoner et al. found that 17 of 44 internet-purchased products (39%) contained an unapproved drug other than a SARM, specifically ibutamoren, GW501516 or SR9009. Substances not listed on the label were present in 11 of 44 (25%). Because GW501516 is prohibited in sport and is analytically distinctive, its presence as an undeclared ingredient is one of the recurring routes to an adverse analytical finding in an athlete who believed they were taking something else. The compound is also detectable in hair, so the exposure history is recoverable months later.',
        evidenceSource:
          'Van Wagoner RM et al., JAMA 2017;318:2004-2010; hair detection method in Drug Test Anal 2020;12:980-986',
        doi: '10.1002/dta.2802',
        measuredMetric: 'Frequency of undeclared GW501516 in products sold as something else',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed orally and distributed widely',
        laymanDesc:
          'It is a small, fat-soluble acid taken by mouth, and it reaches every tissue that carries the receptor — which is most of them.',
        molecularDetail:
          'Oral phenoxyacetic acid with a thiazole head group. Extensively metabolised in humans, to the point that the parent compound was undetectable in urine in a documented poisoning case where blood and hair concentrations were both substantial.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters the cell and reaches a nuclear receptor',
        laymanDesc:
          'PPAR-delta sits on the DNA inside the nucleus, so the drug has to cross both the cell membrane and the nuclear envelope.',
        molecularDetail:
          'Diffuses into the cytoplasm and nucleus; binds the PPAR-delta ligand-binding domain with high potency and with selectivity over the alpha and gamma isoforms.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Switches on the fat-burning transcription programme',
        laymanDesc:
          'The receptor pairs up with a partner protein and sits down on a set of genes that control how cells burn fat, turning them on.',
        molecularDetail:
          'Ligand-bound PPAR-delta heterodimerises with RXR, binds peroxisome proliferator response elements and recruits coactivators. Target genes induced in human skeletal muscle include CPT1b, PDK4, CD36 and ANGPTL4; ABCA1 induction in muscle cells was the proposed route to the HDL effect.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Muscle shifts fuel preference towards fat',
        laymanDesc:
          'Muscle starts taking more of its energy from fat and less from sugar, which is measurable as more of a fatty meal being breathed out as carbon dioxide.',
        molecularDetail:
          'Increased fatty acid uptake and beta-oxidation; the proportion of exhaled CO2 directly derived from meal fat rose significantly in the obese-men study, with concurrent falls in fasting triglycerides, apolipoprotein B, LDL cholesterol and liver fat content.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The same receptor, switched on in the wrong tissue',
        laymanDesc:
          'PPAR-delta is not only in muscle. In animals with intestinal polyps or an initiated stomach cancer, turning it on made those grow faster.',
        molecularDetail:
          'PPAR-delta activation in epithelial and immune compartments promotes proliferation, angiogenesis through VEGF crosstalk and immune evasion. In Apc(min) mice GW501516 produced a fivefold increase in polyps larger than 2 mm; in a carcinogen-initiated model it produced metastatic forestomach carcinoma within two months. The therapeutic effect and the tumour-promoting effect are the same receptor being engaged in different cells.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Sprecher 2007 first-in-human study',
        phase: 'Phase 1',
        sampleSize: 24,
        primaryEndpoint: 'Serum lipids and post-prandial triglyceride clearance over 2 weeks',
        endpointMet: true,
        statisticalPValue:
          'HDL cholesterol raised at 2.5 mg (P=0.004) and 10 mg (P<0.001); triglyceride clearance after fat feeding improved (P=0.02)',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Riserus 2008 three-parallel-group study in moderately obese men',
        phase: 'Phase 2',
        sampleSize: 18,
        primaryEndpoint:
          'Metabolic profile after 2 weeks: lipids, liver fat, fatty acid oxidation, oxidative stress',
        endpointMet: true,
        statisticalPValue:
          'Triglycerides -30%, apoB -26%, LDL cholesterol -23%, insulin -11%; liver fat -20% (P<0.05); urinary isoprostanes -30% (P=0.01)',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Ooi 2011 randomised double-blind crossover, 6-week periods at 2.5 mg/day',
        phase: 'Phase 2',
        sampleSize: 13,
        primaryEndpoint:
          'Kinetics of VLDL, IDL and LDL apolipoprotein B-100, plasma apoC-III and HDL particles by stable isotope tracer',
        endpointMet: true,
        statisticalPValue:
          'Reduced VLDL-apoB by raising its fractional catabolic rate and reduced apoC-III production (P < 0.05); raised HDL cholesterol, apoA-II and LpA-I:A-II by raising apoA-II production (P < 0.05)',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'HDL cholesterol raised at 2.5 mg and 10 mg over two weeks in 24 healthy volunteers, against an 11.5% fall on placebo',
        'Fasting triglycerides -30%, apolipoprotein B -26%, LDL cholesterol -23%, liver fat -20% and urinary isoprostanes -30% over two weeks in moderately obese men',
        'A fivefold increase in intestinal polyps larger than 2 mm in Apc(min) mice given GW501516',
        'Metastatic forestomach carcinoma within two months in a carcinogen-initiated mouse model dependent on GW501516',
        'ALT 922, AST 2,558 and creatine phosphokinase 86,435 IU/L in a documented human case of combined GW1516 and ostarine use',
      ],
      unsupportedInferences: [
        'That because the metabolic effects were genuine, the compound is safe to take — the effect and the abandonment are separate facts and only one of them is explained on the public record',
        'That the tumour-promotion findings are irrelevant because the models were genetically predisposed or carcinogen-initiated; promotion models test acceleration of an existing process, which is the relevant question for a person of unknown baseline risk',
        'That endurance-performance claims rest on human data, when no human trial has ever measured exercise capacity with this compound',
      ],
      whatFailedInitially: [
        'No phase 3 was ever registered and no regulatory submission was ever made, despite every published human study meeting its endpoint',
        "The sponsor's own long-term rodent carcinogenicity dataset has never entered the peer-reviewed literature, so the most-cited fact about this compound is the one a reader can least check",
      ],
      realWorldOutcome: [
        'Prohibited at all times in sport as a metabolic modulator; detectable in hair by LC-MS/MS with confirmation by high-resolution mass spectrometry',
        'Found as an undeclared ingredient in products sold as SARMs, which is one of the recurring routes to an adverse analytical finding in athletes',
        'Remains widely available online more than fifteen years after development stopped',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule or liquid; doses given to humans were 2.5 mg and 10 mg once daily',
      description:
        'The entire human dosing record is two weeks at 2.5 mg or 10 mg daily in the two short studies, and six-week crossover periods at 2.5 mg daily in the thirteen-man kinetic study. Nothing longer than six weeks has ever been given to a human being under protocol, in trials totalling fewer than sixty people in all. Sold now as a capsule or dropper-bottle liquid, sometimes labelled as cardarine and sometimes present in products labelled as something else entirely.',
      safetyProfile:
        'No human safety signal emerged in the two-week trials, which is the correct thing to say about two weeks in fewer than sixty people and not a statement about longer exposure. The documented human harm is one published poisoning with rhabdomyolysis and hepatic cytolysis in combination with ostarine. The animal literature consistently shows promotion of tumour growth across intestinal, gastric, pancreatic and mammary models, together with suppression of CD8 T-cell cytotoxicity. There is no antidote question here and no acute toxidrome; the concern is a long-latency one that no available human dataset can address.',
    },
    commonQuestions: [
      {
        q: 'Does cardarine actually work?',
        a: 'On the endpoints it was tested against, yes, and the trials were well conducted. Two weeks at 10 mg cut fasting triglycerides by 30%, apolipoprotein B by 26%, LDL cholesterol by 23% and liver fat by 20% in moderately overweight men, while raising the proportion of a fatty meal burned as fat. In healthy volunteers it raised HDL cholesterol at both doses tested. Those are real, measured, published results. What was never tested in any human is endurance performance, which is what most people now take it for.',
        auditNote:
          'The "exercise in a pill" description comes from rodent running-time experiments, not from any human exercise trial.',
      },
      {
        q: 'Was it really abandoned for causing cancer?',
        a: "That is the widely repeated account, and this page will state precisely what is checkable and what is not. Checkable: the compound accelerated intestinal polyp growth in Apc(min) mice, with a fivefold increase in polyps over 2 mm, published in Nature Medicine in 2004. Checkable: it drove metastatic forestomach carcinoma within two months in a carcinogen-initiated mouse model, published in 2010. Checkable: development stopped after phase 2 and no phase 3 was ever registered. Not checkable from the public literature: the sponsor's own multi-organ two-year rodent carcinogenicity results, which are cited everywhere and published nowhere peer-reviewed. This page does not print figures from a study it cannot read.",
      },
      {
        q: 'If it is that dangerous, why is it still on sale?',
        a: 'Because it is sold as a research chemical rather than as a drug or a supplement, which places it outside both the drug approval system and food law in most countries. The label wording "not for human consumption" is a legal posture with no analytical meaning. Its status in sport is unambiguous — it is prohibited at all times as a metabolic modulator and is detectable in hair for months — but doping rules govern athletes, not commerce, and there is no equivalent enforcement reaching an ordinary online buyer.',
      },
      {
        q: 'Why is there no price on this page?',
        a: 'Because there is no legal market and no list price. This site publishes acquisition costs when a source such as the CMS National Average Drug Acquisition Cost file publishes one. A grey-market asking price is not a published figure and printing one would be sourcing information rather than reference information, so the pricing block is absent.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Sprecher DL et al. Triglyceride:high-density lipoprotein cholesterol effects in healthy subjects administered a peroxisome proliferator activated receptor delta agonist. Arterioscler Thromb Vasc Biol 2007;27:359-365',
        identifier: '10.1161/01.ATV.0000252790.70572.0c',
        kind: 'doi',
      },
      {
        label:
          'Riserus U et al. Activation of peroxisome proliferator-activated receptor (PPAR)delta promotes reversal of multiple metabolic abnormalities, reduces oxidative stress, and increases fatty acid oxidation in moderately obese men. Diabetes 2008;57:332-339',
        identifier: '10.2337/db07-1318',
        kind: 'doi',
      },
      {
        label:
          'Ooi EM et al. Mechanism of action of a peroxisome proliferator-activated receptor (PPAR)-delta agonist on lipoprotein metabolism in dyslipidemic subjects with central obesity. J Clin Endocrinol Metab 2011;96:E1568-E1576',
        identifier: '10.1210/jc.2011-1131',
        kind: 'doi',
      },
      {
        label:
          'Lipid effects of peroxisome proliferator-activated receptor-delta agonist GW501516 in subjects with low high-density lipoprotein cholesterol: characteristics of metabolic syndrome. Arterioscler Thromb Vasc Biol 2012;32:2289-2294',
        identifier: '10.1161/ATVBAHA.112.247890',
        kind: 'doi',
      },
      {
        label:
          'Gupta RA et al. Activation of nuclear hormone receptor peroxisome proliferator-activated receptor-delta accelerates intestinal adenoma growth. Nat Med 2004;10:245-247',
        identifier: '10.1038/nm993',
        kind: 'doi',
      },
      {
        label:
          'Pollock CB et al. Induction of metastatic gastric cancer by peroxisome proliferator-activated receptor delta activation. PPAR Res 2010;2010:571783',
        identifier: '10.1155/2010/571783',
        kind: 'doi',
      },
      {
        label:
          'Kintz P et al. PPAR-delta agonist and SARM abuse: clinical, analytical and biological data in a case involving a poisonous combination of GW1516 (cardarine) and MK2866 (ostarine). Toxics 2021;9:251',
        identifier: '10.3390/toxics9100251',
        kind: 'doi',
      },
      {
        label:
          'Testing for GW501516 (cardarine) in human hair using LC/MS-MS and confirmation by LC/HRMS. Drug Test Anal 2020;12:980-986',
        identifier: '10.1002/dta.2802',
        kind: 'doi',
      },
      {
        label:
          'Van Wagoner RM et al. Chemical composition and labeling of substances marketed as selective androgen receptor modulators and sold via the internet. JAMA 2017;318:2004-2010',
        identifier: '10.1001/jama.2017.17069',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 9803963 — GW501516 structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9803963',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 5. MK-677 (ibutamoren)
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ibutamoren',
    name: 'Ibutamoren',
    tradeName: 'MK-677, also written MK-0677; ibutamoren mesylate',
    sponsor: 'Merck Research Laboratories',
    targetGene: 'GHSR',
    targetProtein: 'Growth hormone secretagogue receptor type 1a (GHS-R1a, the ghrelin receptor)',
    modality: 'Small Molecule',
    approvalStatus: 'Phase 2 Investigational',
    indication:
      'Investigated for sarcopenia in healthy older adults, functional recovery after hip fracture, postmenopausal osteoporosis, growth hormone deficiency and Alzheimer disease. Never approved anywhere.',
    patientFriendlyIndication:
      'Age-related muscle loss and fracture recovery — investigational, and the programme ended',
    anatomicalSite:
      'Growth hormone secretagogue receptor on anterior pituitary somatotrophs and in the hypothalamic arcuate nucleus',
    conditionContext: {
      conditionExplainer:
        'Growth hormone output falls throughout adult life, and so does muscle mass. Merck built ibutamoren on the hypothesis that the two are causally linked, and that restoring growth hormone secretion to a young-adult pattern would restore muscle.',
      whyItMatters:
        'The hypothesis was tested properly, at scale, over years, with the right endpoints. It produced the cleanest demonstration in this whole field of a drug that hits its biological target perfectly and changes nothing a patient would notice.',
      whoTakesThis:
        'In trials: 65 healthy adults aged 60 to 81 over two years, 161 and then 123 patients recovering from hip fracture, 563 patients with mild to moderate Alzheimer disease, and postmenopausal women with osteoporosis. Outside trials: people wanting appetite, sleep and muscle gains, mostly alongside SARMs.',
      clinicalGoals:
        'Fat-free mass and abdominal visceral fat at one year in the ageing trial; functional performance measures and IGF-1 in the fracture trials; standard cognitive and functional scales in the Alzheimer trial.',
    },
    oneSentenceVerdict:
      'A growth hormone secretagogue that reliably does exactly what it says — IGF-1 up by 51 to 84 percent, fat-free mass up 1.1 kg against a 0.5 kg loss on placebo — and produced no measurable gain in strength, function or cognition in any trial that looked for one, before a hip fracture trial was stopped early for heart failure.',
    laymanHowItWorks:
      'Ghrelin is the hormone the stomach releases when it is empty; it makes you hungry and it tells the pituitary to release growth hormone. Ibutamoren copies ghrelin at its receptor, so it does both: appetite rises and growth hormone comes out in the pulsatile pattern of a young adult, which raises IGF-1 in the blood. That part is not in dispute and never has been. What Merck tested, repeatedly and expensively, was whether that translated into people being stronger, recovering better or thinking more clearly. In three different populations the answer was no.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 58,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)(C(=O)N[C@H](COCC1=CC=CC=C1)C(=O)N2CCC3(CC2)CN(C4=CC=CC=C34)S(=O)(=O)C)N',
      chemicalFormula: 'C27H36N4O5S',
      molecularWeight: '528.7 g/mol (free base); the form used in trials is ibutamoren mesylate',
      targetReceptorAffinity:
        'Non-peptide spiroindane agonist at the growth hormone secretagogue receptor GHS-R1a, the same receptor ghrelin acts on. Orally active at 25 mg once daily, which is the dose used in every published clinical trial of the compound.',
      structureSource: {
        label:
          'PubChem CID 178024 (ibutamoren) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/178024',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mk6-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Reference standard identity and salt form',
          description:
            'Confirm the material is ibutamoren and establish whether it is the free base or the mesylate, because the two differ in mass by the methanesulfonate counterion and a content assay reported against the wrong form is out by about 15%.',
          reagentsAndBuffer:
            'Certified ibutamoren mesylate reference standard, deuterated internal standard, 1H and 13C NMR in DMSO-d6, ion chromatography for methanesulfonate counterion, high-resolution accurate-mass ESI-MS',
        },
        {
          id: 'mk6-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Content assay of a purchased product',
          description:
            'Quantify ibutamoren in a capsule or liquid. This compound is one of the three most common undeclared actives in products sold as SARMs, so the assay is run as often on products that do not mention it as on products that do.',
          dependsOnStepId: 'mk6-w1',
          reagentsAndBuffer:
            'Methanol or acetonitrile extraction with sonication, PTFE filtration, reversed-phase C18 UHPLC with diode-array detection at 220 and 254 nm, LC-HRMS screening for co-formulated SARMs and aromatase inhibitors',
        },
        {
          id: 'mk6-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hair segment preparation for exposure history',
          description:
            'Ibutamoren incorporates into hair, and segmental analysis distinguishes a single exposure from months of use. Establishing the minimal detectable dose for the matrix is what makes a hair result interpretable rather than merely positive.',
          dependsOnStepId: 'mk6-w2',
          reagentsAndBuffer:
            'Hair decontamination in dichloromethane, segmentation into 1 cm lengths, pulverisation, overnight incubation in pH 8.4 phosphate buffer, liquid-liquid extraction into an organic solvent and reconstitution in mobile phase',
        },
        {
          id: 'mk6-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'GHS-R1a calcium-mobilisation assay',
          description:
            'Express the human ghrelin receptor in a cell line and read agonist activity as intracellular calcium release. GHS-R1a is a Gq-coupled receptor with high constitutive activity, so a proper assay reports both the agonist response and the shift in basal signal.',
          dependsOnStepId: 'mk6-w3',
          reagentsAndBuffer:
            'HEK293 or CHO cells stably expressing human GHSR1a, Fluo-4 AM calcium indicator, Hanks buffered salt solution with probenecid, acylated human ghrelin as the reference agonist',
        },
        {
          id: 'mk6-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'LC-MS/MS quantification and IGF-1 pharmacodynamic readout',
          description:
            'Quantify ibutamoren in plasma, urine or hair by tandem mass spectrometry against a deuterated internal standard, and measure serum IGF-1 by immunoassay as the pharmacodynamic marker. IGF-1 is the readout that made target engagement unambiguous in every trial of this compound.',
          dependsOnStepId: 'mk6-w4',
          reagentsAndBuffer:
            'C18 analytical column with 0.1% formic acid and acetonitrile gradient, electrospray positive-ion multiple-reaction monitoring, deuterated ibutamoren internal standard; IGF-1 chemiluminescent immunoassay with acid-ethanol extraction to release IGF-binding proteins',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mk6-a1',
        category: 'measured',
        title: 'Two years in 65 older adults: fat-free mass up 1.1 kg, strength unchanged',
        laymanSummary:
          'In a two-year randomised trial, ibutamoren raised growth hormone and IGF-1 into the young-adult range and added 1.1 kg of fat-free mass while placebo lost 0.5 kg. It made no difference to strength or function.',
        technicalDetails:
          'Nass et al. ran a two-year, double-blind, randomised, placebo-controlled, modified-crossover trial in 65 healthy adults aged 60 to 81, at 25 mg orally once daily. Growth hormone and IGF-1 rose into the healthy young-adult range. Fat-free mass changed by +1.1 kg (95% CI 0.7 to 1.5) on drug against -0.5 kg (-1.1 to 0.2) on placebo, P < 0.001; body cell mass by intracellular water followed the same pattern (P = 0.021). Body weight rose 2.7 kg against 0.8 kg (P = 0.003), with the average increase in limb fat greater on drug (1.1 kg versus 0.24 kg, P = 0.001) and no significant difference in abdominal visceral fat or total fat mass. The paper states plainly that the increased fat-free mass did not result in changes in strength or function, and that the two-year exploratory analyses confirmed the one-year results.',
        evidenceSource: 'Nass R et al., Ann Intern Med 2008;149:601-611',
        doi: '10.7326/0003-4819-149-9-200811040-00003',
        measuredMetric: 'Fat-free mass and abdominal visceral fat at 1 year, confirmed at 2 years',
        auditFlag: 'verified',
      },
      {
        id: 'mk6-a2',
        category: 'measured',
        title: 'Metabolic cost measured in the same trial: glucose up, insulin sensitivity down',
        laymanSummary:
          'The same two-year trial recorded a rise in fasting blood sugar, a fall in insulin sensitivity and a rise in cortisol, alongside the muscle gain.',
        technicalDetails:
          'In Nass et al., fasting blood glucose rose an average of 0.3 mmol/L (5 mg/dL) on MK-677 (P = 0.015) and insulin sensitivity decreased. Cortisol rose 47 nmol/L (95% CI 28 to 71), equivalent to 1.7 micrograms/dL (P = 0.020). LDL cholesterol fell 0.14 mmol/L relative to baseline (P = 0.026) with no between-group difference in total or HDL cholesterol. The commonest side effects were an increase in appetite that subsided over months, and transient mild lower-extremity oedema and muscle pain. These are the mechanistic consequences of chronic growth hormone elevation and they are reported in the same paper as the fat-free mass gain; secondary accounts of this compound often carry the first result and not the second.',
        evidenceSource: 'Nass R et al., Ann Intern Med 2008;149:601-611',
        doi: '10.7326/0003-4819-149-9-200811040-00003',
        measuredMetric:
          'Fasting glucose, insulin sensitivity, cortisol and lipid changes over 12 months',
        auditFlag: 'verified',
      },
      {
        id: 'mk6-a3',
        category: 'failed',
        title: 'Alzheimer disease: IGF-1 up 73%, and no effect on any clinical scale',
        laymanSummary:
          'In 563 patients with Alzheimer disease, a year of ibutamoren raised IGF-1 by nearly three quarters and changed nothing about the disease on any of the four measures used.',
        technicalDetails:
          'Sevigny et al. randomised 563 patients with mild to moderate Alzheimer disease to MK-677 25 mg or placebo daily for 12 months, with 416 completing. Serum IGF-1 rose 60.1% at six weeks and 72.9% at twelve months. In mixed-effects models there were no significant differences between groups on the CIBIC-plus, or on mean change from baseline in ADAS-Cog, ADCS-ADL or CDR sum of boxes. The authors state the conclusion in the paper title: despite evidence of target engagement, the drug was ineffective. This is the textbook shape of a target-engagement-without-clinical-benefit result, and it is a stronger negative than a trial that simply failed to reach its dose.',
        evidenceSource: 'Sevigny JJ et al., Neurology 2008;71:1702-1708',
        doi: '10.1212/01.wnl.0000335163.88054.e7',
        measuredMetric: 'CIBIC-plus, ADAS-Cog, ADCS-ADL and CDR-sob at 12 months',
        auditFlag: 'verified',
      },
      {
        id: 'mk6-a4',
        category: 'failed',
        title: 'A hip fracture trial stopped early for congestive heart failure',
        laymanSummary:
          'A 123-patient trial in people recovering from a hip fracture was terminated before it finished, because of a heart failure safety signal in a small number of patients.',
        technicalDetails:
          'Adunsky et al. randomised 123 elderly hip fracture patients to MK-0677 25 mg daily or placebo. IGF-1 rose 51.4 ng/mL against placebo (95% CI 34.42 to 68.44, P < 0.001). Mean stair climbing power at 24 weeks rose 12.5 W against placebo but the confidence interval crossed zero (95% CI -10.95 to 35.88, P = 0.292); gait speed showed a 0.7-score difference in means (95% CI 0.17 to 1.28, P = 0.011); several other functional measures showed no improvement. The trial was terminated early due to a safety signal of congestive heart failure in a limited number of patients, and the authors conclude that MK-0677 has an unfavourable safety profile in this population. An earlier 161-patient trial by Bach et al. had already found an 84% IGF-1 rise with no significant difference from placebo in functional performance or in the overall Sickness Impact Profile score.',
        evidenceSource:
          'Adunsky A et al., Arch Gerontol Geriatr 2011;53:183-189; earlier trial Bach MA et al., J Am Geriatr Soc 2004;52:516-523',
        doi: '10.1016/j.archger.2010.10.004',
        measuredMetric:
          'Functional performance measures and IGF-1 at 24 weeks; reason for early termination',
        auditFlag: 'verified',
      },
      {
        id: 'mk6-a5',
        category: 'inferred',
        title: 'IGF-1 is a target-engagement marker, not an outcome',
        laymanSummary:
          'Every trial showed IGF-1 rising, which proves the drug reached its target. Not one trial showed that reaching the target helped anybody.',
        technicalDetails:
          'IGF-1 rose 84% in Bach et al., 51.4 ng/mL over placebo in Adunsky et al., 60.1% at six weeks and 72.9% at twelve months in Sevigny et al., and into the young-adult range in Nass et al. Across those four trials, spanning 912 randomised participants and three distinct populations, the clinical outcomes were: no change in strength or function in healthy older adults, no significant difference in functional performance after hip fracture in the larger of the two fracture trials, and no effect on any Alzheimer scale. A biomarker that moves in every trial while the outcome moves in none is the definition of an unvalidated surrogate, and the entire consumer case for this compound rests on that biomarker.',
        evidenceSource:
          'Nass R et al., Ann Intern Med 2008;149:601-611; Sevigny JJ et al., Neurology 2008;71:1702-1708; Adunsky A et al., Arch Gerontol Geriatr 2011;53:183-189; Bach MA et al., J Am Geriatr Soc 2004;52:516-523',
        doi: '10.1111/j.1532-5415.2004.52156.x',
        inferredClaim:
          'That raising IGF-1 delivers the benefits attributed to growth hormone — the specific inference four randomised trials were built to test, and none supported',
        auditFlag: 'caution',
      },
      {
        id: 'mk6-a6',
        category: 'measured',
        title: 'Present as an undeclared drug in products, and hepatotoxicity reported',
        laymanSummary:
          'Ibutamoren turned up inside products sold as SARMs that did not list it, and a case of liver injury in a man in his early thirties has been published.',
        technicalDetails:
          'In Van Wagoner et al., 17 of 44 internet-purchased products (39%) contained an unapproved drug other than a SARM — ibutamoren, GW501516 or SR9009. Cobani et al. report transaminitis in an otherwise healthy man in his early thirties after two months of MK-677, resolving to normal after stopping. Reversible gynaecomastia and hypogonadism have been reported after commercial performance-enhancing supplement use involving this class. As with every case report on these pages, this establishes that the event occurs and gives no rate.',
        evidenceSource:
          'Van Wagoner RM et al., JAMA 2017;318:2004-2010; Cobani E et al., BMJ Case Rep 2025;18:e265728',
        doi: '10.1136/bcr-2025-265728',
        measuredMetric:
          'Frequency as an undeclared product ingredient; published hepatotoxicity case',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed once daily at 25 mg',
        laymanDesc:
          'An oral tablet or capsule. Every published trial used the same dose, 25 mg once a day.',
        molecularDetail:
          'Orally active non-peptide spiroindane. Twenty-five milligrams once daily is the dose in Bach 2004, Nass 2008, Sevigny 2008 and Adunsky 2011 alike, which is unusual and makes the trials directly comparable.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Reaches the pituitary and the hypothalamus',
        laymanDesc:
          'It crosses into the brain regions that control growth hormone release and appetite.',
        molecularDetail:
          'Distributes to anterior pituitary somatotrophs and to the hypothalamic arcuate nucleus, the two sites where GHS-R1a expression is highest and where ghrelin itself acts.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Activates the ghrelin receptor',
        laymanDesc:
          'It binds the receptor that the hunger hormone ghrelin normally uses, and switches it on.',
        molecularDetail:
          'Agonist at GHS-R1a, a Gq-coupled receptor. Activation raises intracellular calcium in somatotrophs and, in the arcuate nucleus, drives NPY and AgRP neurons — which is why appetite increase is the commonest adverse effect and was reported in the trials as subsiding over a few months.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Growth hormone pulses rise, and IGF-1 follows',
        laymanDesc:
          'The pituitary releases growth hormone in bursts, more of them and bigger, and the liver responds by making more IGF-1.',
        molecularDetail:
          'Enhanced pulsatile GH secretion rather than a continuous elevation, preserving the physiological pattern. Hepatic GH receptor signalling then raises circulating IGF-1 by 50% to 85% depending on the population, an effect that was measured and confirmed in every trial of the compound.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fat-free mass rises; the clinical outcomes did not',
        laymanDesc:
          'Scales and scans show more lean tissue and more body weight. Strength tests, walking tests, recovery from fracture and cognitive scores did not move.',
        molecularDetail:
          'Fat-free mass +1.1 kg against -0.5 kg on placebo over one year, confirmed at two. No change in strength or function in the same trial; no significant functional benefit in the larger hip fracture trial; no effect on four Alzheimer disease scales in 563 patients. Fasting glucose rose and insulin sensitivity fell, the expected metabolic consequence of sustained growth hormone elevation.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Nass 2008 two-year trial in healthy older adults',
        phase: 'Phase 2, randomised, double-blind, placebo-controlled, modified crossover',
        sampleSize: 65,
        primaryEndpoint: 'Fat-free mass and abdominal visceral fat after 1 year',
        endpointMet: true,
        statisticalPValue:
          'Fat-free mass +1.1 kg (95% CI 0.7 to 1.5) versus -0.5 kg (-1.1 to 0.2), P < 0.001; no significant difference in abdominal visceral fat',
        unreportedAdverseSignals:
          'Fasting glucose +0.3 mmol/L (P = 0.015) with decreased insulin sensitivity; cortisol +47 nmol/L (P = 0.020); increased appetite, transient lower-extremity oedema and muscle pain. Increased fat-free mass did not produce any change in strength or function.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Sevigny 2008, MK-677 Protocol 30 in Alzheimer disease',
        phase: 'Randomised, double-blind, placebo-controlled, multicentre, 12 months',
        sampleSize: 563,
        primaryEndpoint:
          'Mean change from baseline at month 12 on CIBIC-plus, ADAS-Cog, ADCS-ADL and CDR sum of boxes',
        endpointMet: false,
        statisticalPValue:
          'No significant differences between groups on any measure, despite IGF-1 rising 60.1% at 6 weeks and 72.9% at 12 months',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Adunsky 2011 phase 2b in hip fracture recovery',
        phase: 'Phase 2b, randomised, double-blind, placebo-controlled, multicentre',
        sampleSize: 123,
        primaryEndpoint:
          'Rank analysis of change in objective functional performance measures and in blood IGF-1',
        endpointMet: false,
        statisticalPValue:
          'Stair climbing power +12.5 W (95% CI -10.95 to 35.88, P = 0.292); gait speed 0.7-score difference (95% CI 0.17 to 1.28, P = 0.011); IGF-1 +51.4 ng/mL (P < 0.001); no improvement in several other functional measures',
        unreportedAdverseSignals:
          'The trial was terminated early because of a safety signal of congestive heart failure in a limited number of patients. The authors conclude the compound has an unfavourable safety profile in this population.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Bach 2004 hip fracture trial across 13 centres',
        phase:
          'Randomised, double-blind, placebo-controlled, 6 months treatment plus 6 months follow-up',
        sampleSize: 161,
        primaryEndpoint:
          'Change from week 6 to week 26 in a panel of functional performance measures',
        endpointMet: false,
        statisticalPValue:
          'IGF-I rose 84% (95% CI 63 to 107) versus 17% (8 to 28) on placebo; no significant differences in functional performance measures or overall Sickness Impact Profile score',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Growth hormone and IGF-1 restored to the young-adult range in healthy 60- to 81-year-olds at 25 mg daily',
        'Fat-free mass +1.1 kg against -0.5 kg on placebo over one year, confirmed by two-year exploratory analysis',
        'IGF-1 rose 84% in one hip fracture trial, 51.4 ng/mL over placebo in the other, and 72.9% at twelve months in the Alzheimer trial',
        'Fasting glucose +0.3 mmol/L with decreased insulin sensitivity, and cortisol +47 nmol/L, in the two-year trial',
        'Body weight +2.7 kg against +0.8 kg on placebo, with the excess partly in limb fat (1.1 kg versus 0.24 kg)',
      ],
      unsupportedInferences: [
        'That raising IGF-1 produces functional benefit — tested in three populations across 912 randomised participants and supported in none',
        'That a 1.1 kg fat-free mass gain represents contractile tissue, when body cell mass was inferred from intracellular water and strength did not change',
        'That the appetite and sleep effects reported by users are established outcomes; appetite increase is documented in the trials as an adverse effect that subsided, and sleep architecture was not a reported endpoint in any of them',
      ],
      whatFailedInitially: [
        'No effect on any of four clinical scales in 563 patients with Alzheimer disease despite unambiguous target engagement',
        'No significant functional benefit in either hip fracture trial, and the second was terminated early for a congestive heart failure signal',
        'No change in strength or function in the two-year healthy-ageing trial, which the authors state explicitly',
      ],
      realWorldOutcome: [
        'Never approved for any indication; the development programme ended after the hip fracture trial was stopped',
        'One of the three compounds most often found as an undeclared active in products sold as SARMs',
        'Prohibited at all times in sport as a growth hormone secretagogue, and detectable in hair with a characterised minimal detectable dose',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, capsule or liquid, 25 mg once daily in every published trial',
      description:
        'A once-daily oral dose. The unusual consistency of the clinical programme — 25 mg in all four major trials — means the human dose-response is narrow but the exposure is well characterised at that dose, over durations up to two years. That is far more human data than any SARM on this site has.',
      safetyProfile:
        'Documented in trials: increased appetite subsiding over months, transient mild lower-extremity oedema, muscle pain, a small rise in fasting glucose with decreased insulin sensitivity, and a rise in cortisol. The hip fracture phase 2b was terminated early for a congestive heart failure signal and its authors describe the safety profile in that population as unfavourable. Fluid retention and insulin resistance are the expected consequences of sustained growth hormone elevation and are the reason growth hormone itself is not given to healthy people. One published case of hepatotoxicity resolving on withdrawal.',
    },
    commonQuestions: [
      {
        q: 'Does it raise growth hormone?',
        a: 'Yes, unambiguously, and that is the least interesting true thing about it. Every trial measured it and every trial found it: IGF-1 rose 84% in one hip fracture trial, 51.4 ng/mL over placebo in the other, and 72.9% over twelve months in 563 Alzheimer patients, with growth hormone secretion restored to a young-adult pulsatile pattern in the healthy-ageing trial. Target engagement was never the question. The question was whether it helped, and across three populations and 912 randomised participants nothing measured as a clinical outcome moved.',
        auditNote:
          'This is why the site separates measured from inferred. "IGF-1 rose" is measured. "Therefore muscle works better" is the inference, and it was tested directly.',
      },
      {
        q: 'It did add fat-free mass. Is that not the point?',
        a: 'It added 1.1 kg of fat-free mass over a year while placebo lost 0.5 kg, and the paper reporting that result also reports, in the same results section, that the increase did not result in any change in strength or function. It also reports 2.7 kg of total weight gain, of which more was limb fat than on placebo, a rise in fasting glucose, and reduced insulin sensitivity. Fat-free mass on a body composition scan includes water; body cell mass in that trial was inferred from intracellular water. A number that goes up is not the same as a person who is better off, and this trial is one of the clearest places in medicine to see the difference.',
      },
      {
        q: 'Why did the hip fracture trial stop?',
        a: 'Because of a safety signal of congestive heart failure in a limited number of patients. The published paper states this directly and concludes that the compound has an unfavourable safety profile in that population. Growth hormone causes sodium and water retention, which is the mechanistic reason fluid overload is the expected risk in frail older patients, and it is consistent with the transient lower-limb oedema reported as a common side effect in the healthy-ageing trial.',
      },
      {
        q: 'Is it a SARM?',
        a: 'No, and the confusion matters. SARMs act on the androgen receptor. Ibutamoren acts on the ghrelin receptor and does nothing to androgen signalling. It is sold beside SARMs, is frequently found inside products labelled as SARMs, and shares their regulatory position as an unapproved drug, but its pharmacology, its side effects and its clinical evidence base are entirely different — and its evidence base is much larger.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Nass R et al. Effects of an oral ghrelin mimetic on body composition and clinical outcomes in healthy older adults: a randomized trial. Ann Intern Med 2008;149:601-611',
        identifier: '10.7326/0003-4819-149-9-200811040-00003',
        kind: 'doi',
      },
      {
        label:
          'Sevigny JJ et al. Growth hormone secretagogue MK-677: no clinical effect on AD progression in a randomized trial. Neurology 2008;71:1702-1708',
        identifier: '10.1212/01.wnl.0000335163.88054.e7',
        kind: 'doi',
      },
      {
        label:
          'Adunsky A et al. MK-0677 (ibutamoren mesylate) for the treatment of patients recovering from hip fracture: a multicenter, randomized, placebo-controlled phase IIb study. Arch Gerontol Geriatr 2011;53:183-189',
        identifier: '10.1016/j.archger.2010.10.004',
        kind: 'doi',
      },
      {
        label:
          'Bach MA et al. The effects of MK-0677, an oral growth hormone secretagogue, in patients with hip fracture. J Am Geriatr Soc 2004;52:516-523',
        identifier: '10.1111/j.1532-5415.2004.52156.x',
        kind: 'doi',
      },
      {
        label:
          'Murphy MG et al. Effect of alendronate and MK-677, individually and in combination, on markers of bone turnover and bone mineral density in postmenopausal osteoporotic women. J Clin Endocrinol Metab 2001;86:1116-1125',
        identifier: '10.1210/jcem.86.3.7294',
        kind: 'doi',
      },
      {
        label: 'Cobani E et al. Hepatotoxicity induced by MK-677. BMJ Case Rep 2025;18:e265728',
        identifier: '10.1136/bcr-2025-265728',
        kind: 'doi',
      },
      {
        label:
          'Van Wagoner RM et al. Chemical composition and labeling of substances marketed as selective androgen receptor modulators and sold via the internet. JAMA 2017;318:2004-2010',
        identifier: '10.1001/jama.2017.17069',
        kind: 'doi',
      },
      {
        label:
          'Knowing the minimal detectable dose can facilitate the interpretation of a hair test result: II. Case example with ibutamoren (MK-677). Clin Chim Acta 2026;578:120578',
        identifier: '10.1016/j.cca.2025.120578',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 178024 — ibutamoren structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/178024',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 6. YK-11
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'yk-11',
    name: 'YK-11',
    tradeName: 'No trade name; sold under its laboratory code',
    sponsor:
      'No pharmaceutical sponsor. First described by Kanno and colleagues at Toho University',
    targetGene: 'AR',
    targetProtein:
      'Androgen receptor (partial agonist, acting without the N/C-terminal interaction)',
    modality: 'Small Molecule',
    approvalStatus: 'Pre-clinical / Open Source',
    indication:
      'None. No company has ever developed it, no indication has ever been proposed in a regulatory filing, and no human trial of any kind has ever been registered or published.',
    patientFriendlyIndication:
      'None — this compound has never been given to a human under protocol',
    anatomicalSite: 'Androgen receptor in skeletal myoblasts and osteoblasts, in cell culture',
    conditionContext: {
      conditionExplainer:
        "YK-11 exists because an academic group at Toho University asked a specific structural question: can a steroid activate the androgen receptor without the normal folding interaction between the receptor's two ends? The compound they made answered yes, and that answer is the entire reason it exists.",
      whyItMatters:
        'It was never a drug candidate. It is a laboratory probe that escaped into the supplement market, and the "myostatin inhibitor" marketing attached to it rests on one cell-culture paper about follistatin in mouse myoblasts.',
      whoTakesThis:
        'Nobody, under protocol. Outside protocol, people buying it as the strongest available SARM on the strength of the myostatin claim.',
      clinicalGoals: 'There are none. No clinical goal has ever been defined for this compound.',
    },
    oneSentenceVerdict:
      'A steroidal androgen receptor partial agonist made as a structural probe, with three cell-culture papers and no human evidence whatsoever, marketed on a follistatin result obtained in mouse myoblasts and on nothing else.',
    laymanHowItWorks:
      'YK-11 is a steroid built around a slightly unusual chemistry: it turns the androgen receptor on, but only partly, and it does so without the receptor folding head-to-tail the way testosterone makes it fold. In mouse muscle precursor cells that partial activation switched on follistatin, a protein that blocks myostatin — and myostatin is the brake on muscle growth. That is the whole basis of the claim that YK-11 is a myostatin inhibitor. It was measured in a dish, in mouse cells, in 2013, and it has never been measured in a person.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 12,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@]12CC[C@H]3[C@H]([C@@H]1CC[C@@]24/C(=C\\C(=O)OC)/OC(O4)(C)OC)CCC5=CC(=O)CC[C@H]35',
      chemicalFormula: 'C25H34O6',
      molecularWeight: '430.5 g/mol',
      targetReceptorAffinity:
        'A 19-norprogesterone-derived steroid, formally (17alpha,20E)-17,20-[(1-methoxyethylidene)bis(oxy)]-3-oxo-19-norpregna-4,20-diene-21-carboxylic acid methyl ester. Characterised as a partial agonist of the androgen receptor that activates the receptor without the N-terminal/C-terminal interaction, which is what distinguishes it structurally from dihydrotestosterone.',
      structureSource: {
        label:
          'PubChem CID 119058028 (YK-11) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/119058028',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'yk-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Reference standard identity — a harder problem than for the aryl SARMs',
          description:
            'YK-11 is a steroid, not an aryl propionamide, so it has no fluorine to make 19F NMR easy and no nitrile chromophore to make UV detection distinctive. Identity rests on the full 1H and 13C assignment of the orthoester and the alpha,beta-unsaturated ester, and on accurate mass.',
          reagentsAndBuffer:
            'Certified YK-11 reference standard where available, 1H, 13C, COSY and HSQC NMR in CDCl3, high-resolution accurate-mass ESI-MS with sodium adduct confirmation, deuterated steroid internal standard',
        },
        {
          id: 'yk-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Screening dietary supplements for steroidal and non-steroidal SARMs together',
          description:
            'A single validated LC-MS/MS method screens for the common SARMs in one injection. Steroidal YK-11 and the non-steroidal SARMs ionise differently, so a method that misses the polarity switch will report a YK-11-containing product as clean.',
          dependsOnStepId: 'yk-w1',
          reagentsAndBuffer:
            'Methanol extraction with sonication, PTFE filtration, C18 UHPLC with polarity-switching electrospray, multiple-reaction monitoring transitions for six SARMs, matrix-matched calibration in supplement placebo',
        },
        {
          id: 'yk-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Urine hydrolysis and extraction for confirmation',
          description:
            'Confirming a YK-11 finding in a doping control sample requires deconjugation and extraction like any steroid. The first published confirmation in a human doping control sample came from the UCLA Olympic Analytical Laboratory in 2024.',
          dependsOnStepId: 'yk-w2',
          reagentsAndBuffer:
            'Beta-glucuronidase hydrolysis in phosphate buffer pH 7.0, liquid-liquid extraction into tert-butyl methyl ether at alkaline pH, evaporation and reconstitution in aqueous methanol',
        },
        {
          id: 'yk-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'C2C12 myoblast differentiation model',
          description:
            'The entire anabolic claim for YK-11 comes from this model: mouse C2C12 myoblasts induced to differentiate, with myogenic regulatory factor and follistatin expression read out. Reproducing the claim means reproducing this assay, including the antibody-blocking arm that established follistatin as the mediator.',
          dependsOnStepId: 'yk-w3',
          reagentsAndBuffer:
            'C2C12 mouse myoblasts, DMEM with 10% fetal bovine serum for growth and 2% horse serum for differentiation, dihydrotestosterone as the comparator agonist, anti-follistatin neutralising antibody, quantitative PCR for MyoD, Myf5 and myogenin',
        },
        {
          id: 'yk-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Nuclear receptor selectivity panel and LC-MS/MS quantification',
          description:
            'Measure activity across several nuclear receptors rather than the androgen receptor alone. This matters specifically for YK-11: it is a progesterone-derived steroid, and a 2026 study comparing docking predictions with measured selectivity across five nuclear receptors found the computational predictions did not hold.',
          dependsOnStepId: 'yk-w4',
          reagentsAndBuffer:
            'Reporter cell lines for androgen, progesterone, glucocorticoid, mineralocorticoid and oestrogen receptors, matched reference agonists for each, luciferase substrate; C18 LC-MS/MS with electrospray for quantification against a deuterated steroid internal standard',
        },
      ],
    },
    keyAudits: [
      {
        id: 'yk-a1',
        category: 'measured',
        title: 'It is a partial agonist that works without the N/C interaction',
        laymanSummary:
          'The original 2011 paper established what YK-11 is: a compound that switches the androgen receptor partly on, using a different structural route from testosterone.',
        technicalDetails:
          'Kanno et al. characterised YK-11 as a partial agonist of the androgen receptor that activates the receptor without the N-terminal/C-terminal interaction — the intramolecular fold that full agonists such as dihydrotestosterone induce. This is a real, reproducible structural pharmacology finding and it is the only well-established fact about the compound. It describes what the molecule does to a receptor in a reporter assay. It does not describe what it does to a person, and the paper does not claim to.',
        evidenceSource: 'Kanno Y et al., Biol Pharm Bull 2011;34:318-323',
        doi: '10.1248/bpb.34.318',
        measuredMetric: 'Androgen receptor transactivation with and without the N/C interaction',
        auditFlag: 'verified',
      },
      {
        id: 'yk-a2',
        category: 'measured',
        title: 'The follistatin result: mouse myoblasts, in a dish, in 2013',
        laymanSummary:
          'In mouse muscle precursor cells, YK-11 switched on follistatin, and blocking follistatin with an antibody abolished the effect. This single experiment is the origin of every "myostatin inhibitor" claim about the compound.',
        technicalDetails:
          'Kanno et al. treated C2C12 mouse myoblasts with YK-11 or dihydrotestosterone. Induction of the myogenic regulatory factors MyoD, Myf5 and myogenin was more marked with YK-11 than with DHT. YK-11, but not DHT, induced follistatin expression, and the YK-11-mediated differentiation was reversed by an anti-follistatin antibody. The authors conclude that follistatin induction is important for the anabolic effect of YK-11. Follistatin binds and inhibits myostatin, which is where the marketing term comes from. What is measured here is a mouse cell line differentiating in culture. It is not muscle growth, it is not in a mammal with a circulation, and it is not in a human.',
        evidenceSource: 'Kanno Y et al., Biol Pharm Bull 2013;36:1460-1465',
        doi: '10.1248/bpb.b13-00231',
        measuredMetric:
          'Follistatin expression and myogenic regulatory factor induction in C2C12 cells, with antibody reversal',
        auditFlag: 'verified',
      },
      {
        id: 'yk-a3',
        category: 'inferred',
        title:
          'From a cell-culture follistatin signal to "myostatin inhibitor" in a product listing',
        laymanSummary:
          'Being called a myostatin inhibitor implies the compound blocks the protein that limits muscle growth in the body. What was actually shown is that a mouse cell line made more of a follistatin protein in a dish.',
        technicalDetails:
          'The chain of inference runs: YK-11 induces follistatin in C2C12 cells; follistatin binds myostatin; therefore YK-11 inhibits myostatin; therefore YK-11 removes the brake on muscle growth in humans. Every link after the first is unmeasured for this compound. No study has shown YK-11 reducing circulating or intramuscular myostatin in any animal, no study has shown it increasing muscle mass in any animal, and no study has given it to a human. Actual myostatin-pathway drugs — bimagrumab, landogrozumab, domagrozumab — were tested in humans and repeatedly increased lean mass without improving function, which is the same pattern seen with the SARMs, so even a successful inference would land somewhere less impressive than the marketing implies.',
        evidenceSource: 'Kanno Y et al., Biol Pharm Bull 2013;36:1460-1465',
        doi: '10.1248/bpb.b13-00231',
        inferredClaim:
          'That YK-11 is a myostatin inhibitor in humans — a four-step inference from a single mouse-cell experiment, with no step after the first ever tested',
        auditFlag: 'caution',
      },
      {
        id: 'yk-a4',
        category: 'measured',
        title: 'In rats it produced hippocampal oxidative stress and mitochondrial dysfunction',
        laymanSummary:
          'Five weeks of YK-11 in rats damaged the antioxidant systems and mitochondria of the hippocampus, a brain region used for memory. Swimming exercise protected against some of it but not most of it.',
        technicalDetails:
          'Dahleh et al. gave male Wistar rats YK-11 with or without a five-week swimming protocol. YK-11 altered the endogenous antioxidant system, increased oxidative stress and proteotoxic markers, and impaired all measured mitochondrial function markers in the hippocampus. Exercise alone was neuroprotective. In combination, exercise prevented some mitochondrial toxicity markers, including MnSOD/SOD2 and MTT reduction capacity, but did not reverse the increased oxidative stress or the dysfunction of the mitochondrial respiratory chain and mitochondrial dynamics proteins. A companion 2024 paper in Chemico-Biological Interactions extends the hippocampal findings. This is the only in vivo toxicology on the compound and it is in rats.',
        evidenceSource:
          'Dahleh MMM et al., J Steroid Biochem Mol Biol 2023;233:106364; companion study Chem Biol Interact 2024;394:110971',
        doi: '10.1016/j.jsbmb.2023.106364',
        measuredMetric:
          'Hippocampal antioxidant enzymes, mitochondrial respiratory chain markers and mitochondrial dynamics proteins after 5 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'yk-a5',
        category: 'failed',
        title: 'Docking predictions of its selectivity did not hold up',
        laymanSummary:
          'A 2026 study compared what computer models predicted about which receptors YK-11 binds with what measurement showed, and the predictions were wrong.',
        technicalDetails:
          'A 2026 study in the International Journal of Molecular Sciences compared molecular docking predictions of SARM selectivity with measured activity across five nuclear receptors, using YK-11 and ostarine as the test cases, and reported that docking failed to predict selectivity. This is directly relevant to YK-11 because it is derived from 19-norprogesterone, so progesterone, glucocorticoid and mineralocorticoid receptor cross-reactivity is a live structural question rather than a hypothetical one, and the computational shortcut that a supplement vendor might invoke does not answer it.',
        evidenceSource:
          'Limitations of molecular docking in predicting the selectivity of SARMs: a comparative study of YK11 and ostarine across five nuclear receptors. Int J Mol Sci 2026;27:5765',
        doi: '10.3390/ijms27135765',
        auditFlag: 'verified',
      },
      {
        id: 'yk-a6',
        category: 'measured',
        title: 'Confirmed in a human doping control sample for the first time in 2024',
        laymanSummary:
          "The UCLA Olympic Analytical Laboratory published the first confirmed detection of YK-11 in an athlete's sample in 2024, which is the first documented human exposure of any kind.",
        technicalDetails:
          'Sobolevsky et al. at the UCLA Olympic Analytical Laboratory reported detection of YK-11 in a doping control sample. YK-11 also appears in validated LC-MS/MS screening methods for SARMs in dietary supplements, and in equine metabolism studies where the urinary and plasma metabolite profile after oral administration has been characterised. The notable point for a reference page is what this record consists of: the human data on this compound is entirely forensic. There is no pharmacokinetic study, no dose-finding, no safety observation — only the fact that laboratories can now identify it when someone has taken it.',
        evidenceSource:
          'Sobolevsky T et al., Drug Test Anal 2024;16:655-660; equine metabolism in Drug Test Anal 2023;15:388-407',
        doi: '10.1002/dta.3604',
        measuredMetric: 'Confirmed identification in a human anti-doping sample',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Taken orally as a steroid of unknown human pharmacokinetics',
        laymanDesc:
          'Sold as a capsule or powder. How much of a dose reaches the blood, and how long it stays, has never been measured in a person.',
        molecularDetail:
          'A 19-norpregnadiene with an orthoester at C17/C20. No human pharmacokinetic study exists. The metabolic fate after oral administration has been characterised in horses, where urinary and plasma metabolites were identified for doping control purposes.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters the cell',
        laymanDesc:
          'As a steroid it crosses cell membranes easily and reaches the receptor inside.',
        molecularDetail:
          'Lipophilic steroid, passive membrane diffusion, binding the androgen receptor ligand-binding domain in the cytoplasm.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Partially activates the receptor by an unusual route',
        laymanDesc:
          'It turns the receptor on only part of the way, and without the head-to-tail fold that testosterone causes.',
        molecularDetail:
          'Partial agonism at AR without the N-terminal/C-terminal interaction. Differential DNA binding and cofactor recruitment have been proposed as the determinants of the resulting gene expression profile, based on work in AR-positive breast cancer cells.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Induces follistatin in mouse myoblasts',
        laymanDesc:
          'In mouse muscle precursor cells it switched on follistatin, which binds and blocks the growth-limiting protein myostatin.',
        molecularDetail:
          'YK-11, unlike dihydrotestosterone, induced follistatin expression in C2C12 cells, with stronger induction of MyoD, Myf5 and myogenin than DHT; anti-follistatin antibody reversed the differentiation effect. No corresponding measurement of myostatin or follistatin exists in any whole animal or human given YK-11.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In the only in vivo study, a brain toxicity signal',
        laymanDesc:
          'The one experiment in living animals looked at the hippocampus and found oxidative stress and damaged mitochondria after five weeks.',
        molecularDetail:
          'Increased hippocampal oxidative stress and proteotoxicity with impairment of all measured mitochondrial function markers in rats over five weeks; exercise prevented some markers and did not reverse the respiratory chain or mitochondrial dynamics findings. There is no in vivo muscle outcome for this compound in any species.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'No human trial exists',
        phase: 'None',
        sampleSize: 0,
        primaryEndpoint:
          'No registered or published human study of YK-11 exists for any endpoint, at any dose',
        endpointMet: false,
        statisticalPValue: 'Not applicable — there is no human dataset to analyse',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Kanno 2013 C2C12 myoblast differentiation study',
        phase: 'Preclinical, cell culture',
        sampleSize: 0,
        primaryEndpoint:
          'Myogenic regulatory factor and follistatin expression in mouse C2C12 myoblasts, with anti-follistatin antibody reversal',
        endpointMet: true,
        statisticalPValue:
          'Follistatin induced by YK-11 and not by dihydrotestosterone; differentiation reversed by anti-follistatin antibody',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Dahleh 2023 rat hippocampal toxicology study',
        phase: 'Preclinical, in vivo, 5 weeks, male Wistar rats',
        sampleSize: 0,
        primaryEndpoint:
          'Hippocampal oxidative stress and mitochondrial function markers with and without a swimming exercise protocol',
        endpointMet: true,
        statisticalPValue:
          'Increased oxidative stress and proteotoxicity; impairment of all measured mitochondrial function markers; exercise prevented some but not most',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Partial agonism at the androgen receptor without the N-terminal/C-terminal interaction, in a reporter assay',
        'Induction of follistatin and of MyoD, Myf5 and myogenin in mouse C2C12 myoblasts, reversed by an anti-follistatin antibody',
        'Hippocampal oxidative stress and impairment of every measured mitochondrial function marker in rats over five weeks',
        'Confirmed identification in a human anti-doping control sample in 2024, and characterised metabolism in horses',
      ],
      unsupportedInferences: [
        'That YK-11 inhibits myostatin in a human being — the finding is follistatin induction in a mouse cell line, and no step downstream of it has been measured in any organism',
        'That it is the strongest SARM available, a ranking with no in vivo anabolic measurement in any species to support it',
        'That being a partial agonist makes it safer, when the only in vivo toxicology available shows brain mitochondrial dysfunction',
      ],
      whatFailedInitially: [
        'Molecular docking failed to predict its selectivity across five nuclear receptors when compared with measurement',
        'No pharmaceutical sponsor has ever developed it, and no human trial has ever been registered',
      ],
      realWorldOutcome: [
        'Sold as a dietary supplement ingredient and detected in validated LC-MS/MS supplement screening methods',
        'Prohibited in sport as an anabolic agent; first published confirmation in a human doping control sample in 2024',
        'The entire published human record for this compound consists of forensic identifications, not observations of effect',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule or powder; no established or studied human dose',
      description:
        'Sold as a capsule or a bulk powder. There is no human dose because there has never been a human study. Any figure quoted as a dose for this compound has been extrapolated from cell-culture concentrations or from another compound entirely, and neither extrapolation is valid.',
      safetyProfile:
        'No human safety data of any kind exist. The available toxicology is a five-week rat study showing hippocampal oxidative stress, proteotoxicity and impairment of every measured mitochondrial function marker. As a 19-norprogesterone derivative, progestogenic and other steroid receptor cross-reactivity is a structural possibility that the docking-versus-measurement study specifically shows cannot be resolved computationally. The androgen-receptor class effects — suppression of endogenous testosterone, reduced HDL cholesterol — apply by mechanism but have not been measured for this compound in anything.',
    },
    commonQuestions: [
      {
        q: 'Is YK-11 a myostatin inhibitor?',
        a: 'No study has ever measured myostatin in an animal or a person given YK-11. What was measured, in 2013, is that mouse C2C12 myoblasts treated with YK-11 made more follistatin, and that blocking follistatin with an antibody abolished the differentiation effect. Follistatin binds myostatin, so the label is a plausible extrapolation — but it is an extrapolation from a mouse cell line to a human body, across four unmeasured steps. Every genuine myostatin-pathway drug that has been tested in humans increased lean mass without improving physical function, so even if the extrapolation held, the destination is not what the marketing suggests.',
        auditNote:
          'This is the clearest single example on this site of a marketing term derived from one in vitro experiment and never tested further.',
      },
      {
        q: 'How does it compare with ostarine or LGD-4033?',
        a: 'It cannot be compared with them, because comparison needs measurements of the same thing and YK-11 has none. Ostarine has two phase 3 trials in 651 people. LGD-4033 has a 76-man phase 1 and a 108-patient phase 2 with a posted dose-response. YK-11 has three cell-culture papers, one rat brain toxicology study, and a forensic identification. Potency claims that place it above the others come from marketing copy, not from any in vivo anabolic measurement in any species.',
      },
      {
        q: 'What is actually known about the risks?',
        a: 'Almost nothing, and the little that exists is not reassuring. The single in vivo study gave it to rats for five weeks and found increased oxidative stress and impairment of every mitochondrial function marker measured in the hippocampus, only partly prevented by exercise. There is no human safety observation at all — the only human data are laboratory confirmations that someone took it. This page will not describe that as safe or as dangerous, because neither word is supported by a dataset of this size.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Kanno Y et al. (17alpha,20E)-17,20-[(1-methoxyethylidene)bis(oxy)]-3-oxo-19-norpregna-4,20-diene-21-carboxylic acid methyl ester (YK11) is a partial agonist of the androgen receptor. Biol Pharm Bull 2011;34:318-323',
        identifier: '10.1248/bpb.34.318',
        kind: 'doi',
      },
      {
        label:
          'Kanno Y et al. Selective androgen receptor modulator, YK11, regulates myogenic differentiation of C2C12 myoblasts by follistatin expression. Biol Pharm Bull 2013;36:1460-1465',
        identifier: '10.1248/bpb.b13-00231',
        kind: 'doi',
      },
      {
        label:
          'Kanno Y et al. Selective androgen receptor modulator, YK11, up-regulates osteoblastic proliferation and differentiation in MC3T3-E1 cells. Biol Pharm Bull 2018;41:394-398',
        identifier: '10.1248/bpb.b17-00748',
        kind: 'doi',
      },
      {
        label:
          'Dahleh MMM et al. YK11 induces oxidative stress and mitochondrial dysfunction in hippocampus: the interplay between a selective androgen receptor modulator and exercise. J Steroid Biochem Mol Biol 2023;233:106364',
        identifier: '10.1016/j.jsbmb.2023.106364',
        kind: 'doi',
      },
      {
        label:
          'From gains to gaps? How selective androgen receptor modulator YK11 impacts hippocampal function: in silico, in vivo, and ex vivo perspectives. Chem Biol Interact 2024;394:110971',
        identifier: '10.1016/j.cbi.2024.110971',
        kind: 'doi',
      },
      {
        label:
          'Sobolevsky T et al. Detection of selective androgen receptor modulator YK-11 in a doping control sample. Drug Test Anal 2024;16:655-660',
        identifier: '10.1002/dta.3604',
        kind: 'doi',
      },
      {
        label:
          'Limitations of molecular docking in predicting the selectivity of selective androgen receptor modulators: a comparative study of YK11 and ostarine across five nuclear receptors. Int J Mol Sci 2026;27:5765',
        identifier: '10.3390/ijms27135765',
        kind: 'doi',
      },
      {
        label:
          'Development and validation of a liquid chromatography-tandem mass spectrometry method for screening six selective androgen receptor modulators in dietary supplements. Food Addit Contam Part A 2021;38:1075-1086',
        identifier: '10.1080/19440049.2021.1906954',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 119058028 — YK-11 structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/119058028',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 7. S-23
  // ---------------------------------------------------------------------------------------------
  {
    slug: 's-23',
    name: 'S-23',
    tradeName: 'No trade name; sold under its laboratory code',
    sponsor: 'Characterised at The Ohio State University by Jones, Dalton and colleagues',
    targetGene: 'AR',
    targetProtein: 'Androgen receptor (full agonist in vitro, tissue-selective in vivo)',
    modality: 'Small Molecule',
    approvalStatus: 'Pre-clinical / Open Source',
    indication:
      'Characterised in rats as a candidate for reversible hormonal male contraception, in combination with oestradiol benzoate. No human trial has ever been registered.',
    patientFriendlyIndication: 'Male contraception in rats — never tested in humans for anything',
    anatomicalSite:
      'Androgen receptor in levator ani muscle, prostate, bone, and the hypothalamic-pituitary axis',
    conditionContext: {
      conditionExplainer:
        'A hormonal male contraceptive works by shutting down the pituitary signals that drive sperm production, while replacing enough androgen elsewhere in the body that the man does not become hypogonadal. That balance is the hard part, and it is what S-23 was built to solve.',
      whyItMatters:
        'S-23 is the only compound in this group whose intended purpose was to stop sperm production. It is sold to men who want muscle, and the finding it is best characterised for is that four of six rats given it had no sperm in the testis at all.',
      whoTakesThis:
        'Rats, in the published work. Outside that, men buying it online as the most potent available SARM, and at least one volunteer who took a single 8 mg tablet for an analytical study.',
      clinicalGoals:
        'In the rat work: suppression of LH and FSH to abolish spermatogenesis, with preserved lean mass and bone mineral density, and full reversibility after stopping.',
    },
    oneSentenceVerdict:
      "A rat male-contraceptive candidate with an androgen receptor binding constant of 1.7 nM, in which four of six treated animals had no sperm in the testis, sold as a muscle-building compound to men on the strength of the same paper's lean-mass finding.",
    laymanHowItWorks:
      'S-23 binds the androgen receptor very tightly and, unlike the SARMs designed to spare the prostate, it behaves as a full agonist. In rats that produced two effects at once. In muscle and bone it acted like a strong androgen: lean mass up, bone density up, fat down, all dose-dependently. In the brain it acted like a strong androgen too, which meant the pituitary stopped sending the signals that drive the testis, and sperm production stopped. In four of six animals at the contraceptive dose there was no sperm in the testis at all, and there were no pregnancies. Both halves are the same drug at the same receptor.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 18,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@](COC1=CC(=C(C=C1)Cl)F)(C(=O)NC2=CC(=C(C=C2)C#N)C(F)(F)F)O',
      chemicalFormula: 'C18H13ClF4N2O3',
      molecularWeight: '416.8 g/mol',
      targetReceptorAffinity:
        'Aryl propionamide, formally (2S)-N-(4-cyano-3-trifluoromethylphenyl)-3-(3-fluoro-4-chlorophenoxy)-2-hydroxy-2-methyl-propanamide. Inhibitory constant 1.7 plus or minus 0.2 nM at the androgen receptor and a full agonist in vitro. In castrated rats the ED50 was 0.079 mg/day in levator ani muscle and 0.43 mg/day in prostate, a roughly fivefold tissue separation.',
      structureSource: {
        label:
          'PubChem CID 24892822 (S-23) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/24892822',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 's23-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Reference standard identity and enantiomeric purity',
          description:
            'Only the (2S) enantiomer is S-23. The compound shares the 4-cyano-3-trifluoromethylphenyl head with ostarine and differs in the ether tail, so an accurate-mass and fragmentation comparison against both standards is what separates them.',
          reagentsAndBuffer:
            'Certified S-23 reference standard, deuterated internal standard, 19F and 1H NMR in DMSO-d6, chiral HPLC on an immobilised polysaccharide column, high-resolution accurate-mass ESI-MS in negative ion mode',
        },
        {
          id: 's23-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Content assay of a purchased product',
          description:
            'Quantify S-23 in a capsule or dropper bottle. Because S-23 appeared on the market later than the other SARMs, older screening methods do not include its transitions, and a product can pass an out-of-date screen while containing it.',
          dependsOnStepId: 's23-w1',
          reagentsAndBuffer:
            'Methanol extraction with sonication, PTFE filtration, quantitative 19F NMR against an internal standard, C18 UHPLC with diode-array detection and LC-HRMS confirmation',
        },
        {
          id: 's23-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Urine hydrolysis and extraction across a 28-day window',
          description:
            'A single 8 mg oral dose remains detectable in hydrolysed urine for 28 days, so the extraction has to work at sub-nanogram-per-millilitre concentrations at the tail of that window. Hydrolysis is essential: glucuronides are the dominant conjugates in the in vitro metabolite panel.',
          dependsOnStepId: 's23-w2',
          reagentsAndBuffer:
            'Beta-glucuronidase from E. coli in phosphate buffer pH 7.0, liquid-liquid extraction or mixed-mode solid-phase extraction, evaporation under nitrogen and reconstitution in 20% acetonitrile',
        },
        {
          id: 's23-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Human liver microsome metabolite generation',
          description:
            'Incubate S-23 with human liver microsomes to generate the CYP- and UGT-dependent metabolites before looking for them in urine. Doing it in this order is what allowed the four in vitro metabolites to be named, and then allowed the discovery that only one of them appears in real urine.',
          dependsOnStepId: 's23-w3',
          reagentsAndBuffer:
            'Pooled human liver microsomes, NADPH regenerating system for phase I, UDP-glucuronic acid and alamethicin for phase II, potassium phosphate buffer pH 7.4, acetonitrile protein crash',
        },
        {
          id: 's23-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'UPLC-MS/MS and Q-TOF quantification of parent and metabolites',
          description:
            'Quantify parent S-23 and hydroxy-S-23 by triple-quadrupole tandem mass spectrometry, and use quadrupole time-of-flight for untargeted identification of metabolites the microsome panel did not predict, such as the dihydroxy metabolite found only in vivo.',
          dependsOnStepId: 's23-w4',
          reagentsAndBuffer:
            'C18 UPLC column, 0.1% formic acid in water and acetonitrile gradient, electrospray negative-ion multiple-reaction monitoring on a triple quadrupole, and UPLC-Q-TOF for accurate-mass metabolite identification',
        },
      ],
    },
    keyAudits: [
      {
        id: 's23-a1',
        category: 'measured',
        title: 'Binding constant 1.7 nM, and a full agonist rather than a partial one',
        laymanSummary:
          'S-23 binds the androgen receptor about as tightly as anything in this class, and switches it fully on rather than partly on.',
        technicalDetails:
          'Jones et al. characterised S-23 with an inhibitory constant of 1.7 plus or minus 0.2 nM and identified it as a full agonist in vitro. In castrated male rats the ED50 was 0.079 mg/day for levator ani muscle and 0.43 mg/day for prostate, a separation of roughly fivefold in favour of muscle. That tissue selectivity is real and it is much narrower than the separation the prostate-sparing SARMs were designed for. A full agonist with a fivefold window is closer in behaviour to an anabolic steroid than to enobosarm, and its endocrine effects in the same paper bear that out.',
        evidenceSource: 'Jones A et al., Endocrinology 2009;150:385-395',
        doi: '10.1210/en.2008-0674',
        measuredMetric: 'Androgen receptor Ki; ED50 in levator ani muscle and in prostate',
        auditFlag: 'verified',
      },
      {
        id: 's23-a2',
        category: 'measured',
        title: 'Four of six rats had no sperm in the testis, and no pregnancies resulted',
        laymanSummary:
          'At the contraceptive dose, combined with oestradiol, four of six male rats had no sperm at all and none of six mating trials produced a pregnancy. Fertility returned completely after 100 days off the drug.',
        technicalDetails:
          'In intact male rats treated for 14 days, S-23 alone suppressed LH by more than 50% at doses above 0.1 mg/day, with prostate shrinkage and levator ani growth at the same time. In intact rats treated for up to 10 weeks with S-23 plus oestradiol benzoate — the oestradiol being required to maintain sexual behaviour in rats — S-23 suppressed both LH and FSH and produced biphasic effects on androgenic tissue and spermatogenesis. In the oestradiol plus S-23 0.1 mg/day group, four of six animals showed no sperm in the testis and zero of six mating trials produced a pregnancy. Oestradiol alone had no effect on spermatogenesis. After treatment stopped, infertility was fully reversible, with a 100% pregnancy rate after 100 days of recovery.',
        evidenceSource: 'Jones A et al., Endocrinology 2009;150:385-395',
        doi: '10.1210/en.2008-0674',
        measuredMetric:
          'Testicular sperm presence and pregnancy rate in mating trials; LH and FSH suppression',
        auditFlag: 'verified',
      },
      {
        id: 's23-a3',
        category: 'measured',
        title: 'The anabolic finding and the contraceptive finding are the same experiment',
        laymanSummary:
          'The same study that abolished sperm production also reported dose-dependent increases in bone density and lean mass and a fall in fat mass. Both results come from the same animals.',
        technicalDetails:
          'Jones et al. report that S-23 increased bone mineral density and lean mass and reduced fat mass in a dose-dependent manner, in the same rat programme that established its contraceptive effect. This matters because the two findings are routinely separated in the way the compound is described: the body composition result is quoted in supplement listings and the azoospermia result is not, although they are two paragraphs of one paper describing one set of animals given one drug. There is no dose in that paper at which the anabolic effect appeared and the gonadotropin suppression did not.',
        evidenceSource: 'Jones A et al., Endocrinology 2009;150:385-395',
        doi: '10.1210/en.2008-0674',
        measuredMetric: 'Bone mineral density, lean mass and fat mass by dose in the same animals',
        auditFlag: 'verified',
      },
      {
        id: 's23-a4',
        category: 'inferred',
        title: 'Rat contraception does not transfer to humans, in either direction',
        laymanSummary:
          'The rat work cannot tell you that S-23 will make a man infertile, and it cannot tell you that it will not. Nobody has looked.',
        technicalDetails:
          'The rat regimen required oestradiol benzoate to maintain sexual behaviour, a species-specific requirement that has no human equivalent, and rat spermatogenesis differs from human spermatogenesis in duration and in gonadotropin dependence. Extrapolating the azoospermia finding to men is therefore not valid — and neither is dismissing it, because the mechanism through which it happened, suppression of LH and FSH by androgen receptor agonism at the hypothalamus and pituitary, is the same mechanism that operates in men and is well documented for every androgen. The honest position is that S-23 has never been assessed for effects on human spermatogenesis at any dose.',
        evidenceSource: 'Jones A et al., Endocrinology 2009;150:385-395',
        doi: '10.1210/en.2008-0674',
        inferredClaim:
          'That the rat contraceptive result either does or does not apply to men — neither direction has been tested, and the underlying mechanism is species-general',
        auditFlag: 'caution',
      },
      {
        id: 's23-a5',
        category: 'measured',
        title: 'One 8 mg tablet stayed detectable in urine for 28 days',
        laymanSummary:
          'A volunteer took a single 8 mg dose. It was detectable in urine from two hours afterwards until 28 days later. A hair sample taken a month afterwards was negative.',
        technicalDetails:
          'Ameline et al. generated four S-23 metabolites with human liver microsomes — hydroxy-S-23, O-dephenylate-S-23, S-23-glucuronide and hydroxy-S-23-glucuronide — and then studied urine after a single oral administration of approximately 8 mg to a volunteer. Parent S-23 was detectable in hydrolysed urine from 2 hours to 28 days post administration, at concentrations between 0.5 and 93 ng/mL. Only one of the four in vitro metabolites, hydroxy-S-23, was found in urine, also up to 28 days, and it did not extend the detection window because its ratio to parent was always below 1. A dihydroxy metabolite not predicted in vitro was found in vivo. A hair sample taken one month after a single tablet was negative for both, with a limit of quantification of 0.1 pg/mg. This is the only published human administration of S-23 and its purpose was analytical, not clinical.',
        evidenceSource: 'Ameline A et al., J Pharm Biomed Anal 2022;212:114660',
        doi: '10.1016/j.jpba.2022.114660',
        measuredMetric:
          'Urinary detection window and concentration range after a single 8 mg oral dose',
        auditFlag: 'verified',
      },
      {
        id: 's23-a6',
        category: 'conclusion_shift',
        title: 'A contraceptive candidate rebranded as the strongest SARM',
        laymanSummary:
          'Every published fact about S-23 comes from a programme whose goal was to stop sperm production. It is now sold as a performance compound, with that goal unmentioned.',
        technicalDetails:
          'The paper that established S-23 states its purpose in the title: a selective androgen receptor modulator for hormonal male contraception. Its potency, its full-agonist behaviour and its steep gonadotropin suppression are the properties that made it a contraceptive candidate, and they are the same properties now cited as making it the strongest SARM available. No pharmaceutical sponsor took it further, no human trial was registered, and the compound entered the doping market recently enough that its analytical characterisation postdates its consumer availability. The reframing is not a scientific development; it is the same molecule described by people with a different purpose.',
        evidenceSource:
          'Jones A et al., Endocrinology 2009;150:385-395; Ameline A et al., J Pharm Biomed Anal 2022;212:114660',
        doi: '10.1210/en.2008-0674',
        inferredClaim:
          'That potency in a rat anabolic assay is the relevant fact about this compound, when the same potency is what suppressed spermatogenesis in the same animals',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Oral, with a long tail',
        laymanDesc: 'Taken by mouth. One 8 mg dose was still measurable in urine four weeks later.',
        molecularDetail:
          'Aryl propionamide with oral bioavailability described as favourable in the rat characterisation. In the single documented human administration, parent compound was measurable in hydrolysed urine from 2 hours to 28 days at 0.5 to 93 ng/mL.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters the cell and binds tightly',
        laymanDesc:
          'It crosses the cell membrane and locks onto the androgen receptor at very low concentrations.',
        molecularDetail:
          'Passive diffusion, then binding the AR ligand-binding domain with a Ki of 1.7 nM. In vitro it behaves as a full agonist, not a partial one, which distinguishes it from most of the class.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Switches the receptor fully on',
        laymanDesc:
          'Unlike the SARMs designed to be gentle on the prostate, it turns the receptor all the way on, with only a modest preference for muscle.',
        molecularDetail:
          'Full agonism at AR, with an ED50 of 0.079 mg/day in levator ani muscle against 0.43 mg/day in prostate in castrated rats — roughly fivefold selectivity, narrow by the standards of the compounds developed for prostate sparing.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Muscle and bone build; the pituitary shuts down',
        laymanDesc:
          'Lean mass and bone density rise. At the same time the brain reads the signal as an excess of androgen and stops driving the testis.',
        molecularDetail:
          'Dose-dependent increases in lean mass and bone mineral density with reduced fat mass. Concurrently, LH suppressed by more than 50% at doses above 0.1 mg/day over 14 days, with FSH suppression over the longer regimen — the negative feedback that abolished spermatogenesis.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Azoospermia, and full reversal after 100 days',
        laymanDesc:
          'Four of six rats had no sperm in the testis and none of six mating trials produced a pregnancy. All of it reversed after a hundred days off the drug.',
        molecularDetail:
          'Four of six animals in the oestradiol plus S-23 0.1 mg/day group showed no testicular sperm, with zero pregnancies in six mating trials. Full reversibility with a 100% pregnancy rate after 100 days of recovery. No human equivalent has been measured.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Jones 2009 rat characterisation for hormonal male contraception',
        phase: 'Preclinical, male rats, up to 10 weeks',
        sampleSize: 0,
        primaryEndpoint:
          'Spermatogenesis and fertility in mating trials, with lean mass, fat mass and bone mineral density as secondary measures',
        endpointMet: true,
        statisticalPValue:
          'Four of six animals with no testicular sperm and zero of six pregnancies at S-23 0.1 mg/day with oestradiol benzoate; full reversal with 100% pregnancy rate after 100 days',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Ameline 2022 single-dose human administration, analytical purpose',
        phase: 'Analytical excretion study, one volunteer',
        sampleSize: 1,
        primaryEndpoint:
          'Urinary detection window and metabolite profile after a single approximately 8 mg oral dose',
        endpointMet: true,
        statisticalPValue:
          'Parent detectable 2 hours to 28 days at 0.5 to 93 ng/mL; hydroxy-S-23 detectable to 28 days; hair negative at one month with LOQ 0.1 pg/mg',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Androgen receptor inhibitory constant of 1.7 plus or minus 0.2 nM, full agonist in vitro',
        'ED50 0.079 mg/day in levator ani muscle and 0.43 mg/day in prostate in castrated rats',
        'LH suppressed more than 50% at doses above 0.1 mg/day over 14 days in intact rats',
        'Four of six rats with no testicular sperm and zero of six pregnancies at the contraceptive dose, fully reversible after 100 days',
        'Dose-dependent increases in lean mass and bone mineral density with reduced fat mass, in the same animals',
        'A single 8 mg human dose detectable in hydrolysed urine from 2 hours to 28 days',
      ],
      unsupportedInferences: [
        'That the rat body composition result predicts a human muscle effect — no human has been studied for any clinical endpoint',
        'That the rat contraceptive result does not apply to men, when the mechanism producing it is the same negative feedback that operates in every mammal',
        'That it is "the strongest SARM", a claim resting on rodent potency assays that were designed to select a contraceptive, not a performance compound',
      ],
      whatFailedInitially: [
        'No pharmaceutical sponsor advanced it and no human trial has ever been registered, seventeen years after its characterisation',
        'Its tissue selectivity window is roughly fivefold, far narrower than the class was designed to achieve',
      ],
      realWorldOutcome: [
        'Appeared on the doping market recently enough that its analytical characterisation postdates its consumer availability',
        'Prohibited in sport as an anabolic agent; detectable in urine for four weeks after a single dose',
        'Sold on the basis of one paragraph of a paper whose title and purpose were hormonal male contraception',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule or liquid; no established human dose',
      description:
        'Sold as a capsule or dropper-bottle liquid. The only documented human dose is a single 8 mg tablet taken for an analytical excretion study. The rat doses that produced both the anabolic and the contraceptive effects were 0.1 mg/day and above, in animals of about 300 grams, and cannot be scaled to a person by any simple arithmetic.',
      safetyProfile:
        'No human safety data exist. In rats, the documented effects at contraceptive doses are suppression of LH and FSH, abolition of spermatogenesis in most animals, and prostate shrinkage, alongside increases in lean mass and bone density. All of it reversed within 100 days of stopping in that species. The androgen class effects — suppression of endogenous testosterone, reduced HDL cholesterol, and the drug-induced liver injury reported across this class — apply by mechanism and have not been measured for this compound in humans.',
    },
    commonQuestions: [
      {
        q: 'Will S-23 make me infertile?',
        a: 'Nobody knows, because nobody has measured it in a human. What is on record is that in rats it suppressed LH by more than half at doses above 0.1 mg/day, and that at the contraceptive dose with oestradiol four of six animals had no sperm in the testis and none of six mating trials produced a pregnancy. Fertility returned completely after 100 days off the drug in that species. The mechanism — androgen receptor agonism at the hypothalamus and pituitary shutting down the gonadotropins — is not species-specific, and it is the same reason exogenous testosterone suppresses sperm production in men. That is a mechanistic expectation, not a measurement.',
        auditNote:
          'This is the one compound in this group whose published purpose was contraception. The information is not obscure; it is in the title of the paper everything else about the drug comes from.',
      },
      {
        q: 'Is it the strongest SARM?',
        a: 'It has the tightest published receptor binding of the group at 1.7 nM and it is a full agonist rather than a partial one, so on those two in vitro measures it is the most potent compound on this page. What that potency bought, in the animals it was measured in, was a narrow fivefold separation between muscle and prostate and a steep suppression of the gonadotropins. Potency and selectivity are different quantities, and the compounds with the widest selectivity windows are the ones that reached human trials.',
      },
      {
        q: 'How long does it stay detectable?',
        a: 'Twenty-eight days in urine after one 8 mg tablet, at concentrations falling from 93 ng/mL to about 0.5 ng/mL, with the hydroxy metabolite detectable across the same window. A hair sample taken a month after that single tablet was negative down to 0.1 pg/mg, which is the expected result for a one-off exposure — hair analysis records repeated use, not single doses. For a tested athlete the practical consequence is that a single exposure from a contaminated product remains findable for a month.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Jones A et al. Preclinical characterization of (S)-N-(4-cyano-3-trifluoromethyl-phenyl)-3-(3-fluoro, 4-chlorophenoxy)-2-hydroxy-2-methyl-propanamide: a selective androgen receptor modulator for hormonal male contraception. Endocrinology 2009;150:385-395',
        identifier: '10.1210/en.2008-0674',
        kind: 'doi',
      },
      {
        label:
          'Ameline A et al. In vitro characterization of S-23 metabolites produced by human liver microsomes, and subsequent application to urine after a controlled oral administration. J Pharm Biomed Anal 2022;212:114660',
        identifier: '10.1016/j.jpba.2022.114660',
        kind: 'doi',
      },
      {
        label:
          'Investigations into the urinary metabolite elimination profile of the selective androgen receptor modulator S-23 in studies mimicking contaminated product ingestion for doping control purposes. Biomed Chromatogr 2025;39:e70090',
        identifier: '10.1002/bmc.70090',
        kind: 'doi',
      },
      {
        label:
          'Detection of the selective androgen receptor modulator S-23 and its metabolites in equine urine and plasma following oral administration. Drug Test Anal 2025;17:601-611',
        identifier: '10.1002/dta.3758',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 24892822 — S-23 structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/24892822',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 8. Trenbolone
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'trenbolone',
    name: 'Trenbolone',
    tradeName:
      'Approved in the United States only for cattle, as trenbolone acetate implants (Finaplix, and in combination products such as Revalor and Synovex Plus)',
    sponsor:
      'Originally Roussel Uclaf. Veterinary implants are marketed by Merck Animal Health and Zoetis',
    targetGene: 'AR',
    targetProtein: 'Androgen receptor; also binds progesterone and glucocorticoid receptors',
    modality: 'Small Molecule',
    approvalStatus: 'Controlled / No Approved Use',
    indication:
      'No approved human indication anywhere. In the United States it is a Schedule III anabolic steroid under 21 CFR 1308.13 and is approved only as a growth-promoting implant for cattle under 21 CFR 522.2476 and 522.2477.',
    patientFriendlyIndication:
      'None in people. It is a cattle growth implant and a controlled substance',
    anatomicalSite: 'Androgen receptor in skeletal muscle myonuclei, bone and adipose tissue',
    conditionContext: {
      conditionExplainer:
        'Trenbolone was developed to put weight on cattle. It is implanted behind the ear as a slow-release pellet, usually with oestradiol, and it is one of the most economically significant veterinary drugs in North American beef production.',
      whyItMatters:
        'Its pharmacology is genuinely unusual and genuinely interesting: it cannot be converted to a more potent androgen by 5-alpha-reductase and it cannot be aromatised to oestrogen, which gives it a tissue profile no human androgen has. That is why it is studied as a model compound, and why it is used.',
      whoTakesThis:
        'Cattle, lawfully. People, unlawfully — a Global Drug Survey analysis identified 237 men out of 1,146 past-year anabolic steroid users who had injected trenbolone in the preceding twelve months.',
      clinicalGoals:
        'There are none in humans. In the rodent literature the measured goals are preservation of muscle and bone after orchiectomy without prostate enlargement or polycythaemia.',
    },
    oneSentenceVerdict:
      'A cattle growth implant and Schedule III anabolic steroid whose rodent pharmacology is unusually clean — muscle and bone preserved without prostate growth at low dose — and whose human record, drawn from 1,146 steroid users, is the worst psychiatric and cardiovascular harm profile in its class.',
    laymanHowItWorks:
      'Testosterone gets changed by the body into two other things: dihydrotestosterone, which is more potent in the prostate and skin, and oestradiol, which does its own separate job. Trenbolone can be converted into neither. It binds the androgen receptor directly and stays what it is, everywhere. In rats that produces a striking result: at low doses it grows muscle by 35 to 40 percent and protects bone while leaving the prostate and the red blood cell count where they were. At high doses that separation disappears. In the men who use it, it is the compound associated with the highest rates of mood instability, irritability, depressive symptoms and cardiac and liver concerns of any steroid surveyed.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 40,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@]12C=CC3=C4CCC(=O)C=C4CC[C@H]3[C@@H]1CC[C@@H]2O',
      chemicalFormula: 'C18H22O2',
      molecularWeight:
        '270.4 g/mol (free 17beta-alcohol; marketed as the acetate or enanthate ester)',
      targetReceptorAffinity:
        'An estr-4,9,11-triene, formally 17beta-hydroxyestra-4,9,11-trien-3-one. It binds the androgen receptor with high affinity and is not a substrate for 5-alpha-reductase or for aromatase, so its activity is the same in every tissue rather than being amplified in the prostate and skin. It also has appreciable affinity for the progesterone and glucocorticoid receptors, which is the accepted explanation for several of its distinctive effects.',
      structureSource: {
        label:
          'PubChem CID 25015 (trenbolone) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/25015',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tren-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Reference standard identity and ester determination',
          description:
            'Establish whether the material is trenbolone base, trenbolone acetate or trenbolone enanthate, because the ester determines the mass, the release profile and the metabolite pattern. The triene chromophore gives an unusually strong ultraviolet absorbance near 340 nm, which is diagnostic.',
          reagentsAndBuffer:
            'Certified trenbolone, trenbolone acetate and trenbolone enanthate reference standards, deuterated trenbolone internal standard, 1H and 13C NMR in CDCl3, UV spectrophotometry with the 340 nm maximum, high-resolution accurate-mass ESI-MS',
        },
        {
          id: 'tren-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Content and sterility assessment of an injectable preparation',
          description:
            'Quantify the ester and the free steroid in an oil-based injectable and check the carrier. Underground injectables are the dosage form here, so the assay covers concentration, the identity of the oil and benzyl alcohol carrier, and microbial and endotoxin burden.',
          dependsOnStepId: 'tren-w1',
          reagentsAndBuffer:
            'Methanol or acetonitrile dilution of the oil phase, reversed-phase C18 HPLC with UV detection at 340 nm, gas chromatography with flame ionisation for the oil and benzyl alcohol carrier, membrane filtration bioburden and limulus amoebocyte lysate endotoxin assay',
        },
        {
          id: 'tren-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Urine hydrolysis and extraction, with route of administration in mind',
          description:
            'Trenbolone metabolites in urine differ depending on whether the drug was injected or taken orally, and that difference is diagnostically useful. Confirmation targets 17-epitrenbolone and the conjugated metabolites rather than the parent.',
          dependsOnStepId: 'tren-w2',
          reagentsAndBuffer:
            'Beta-glucuronidase from E. coli in phosphate buffer pH 7.0, solid-phase extraction on a polymeric reversed-phase sorbent, methanol elution, evaporation and reconstitution; derivatisation with MSTFA, ammonium iodide and ethanethiol for GC-MS confirmation',
        },
        {
          id: 'tren-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Multi-receptor reporter panel',
          description:
            'Read activity at androgen, progesterone and glucocorticoid receptors in parallel. For trenbolone this is not optional: its progestogenic and glucocorticoid activity is part of its pharmacology, and an androgen-receptor-only assay misses the receptors that account for several of its characteristic effects.',
          dependsOnStepId: 'tren-w3',
          reagentsAndBuffer:
            'Reporter cell lines stably expressing human AR, PR and GR with matched response-element luciferase constructs, charcoal-stripped serum in phenol-red-free medium, dihydrotestosterone, progesterone and dexamethasone as matched reference agonists',
        },
        {
          id: 'tren-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'GC-MS/MS and LC-MS/MS confirmation with isotope ratio backup',
          description:
            'Quantify trenbolone and 17-epitrenbolone in urine by tandem mass spectrometry. Because trenbolone is used lawfully in beef cattle, a positive finding at very low concentration raises a dietary-contamination question, and the same laboratories run residue methods against the tolerances set in 21 CFR 556.739.',
          dependsOnStepId: 'tren-w4',
          reagentsAndBuffer:
            'Deuterated trenbolone internal standard, GC-MS/MS on a 5% phenyl methylpolysiloxane column after trimethylsilyl derivatisation, and LC-MS/MS with electrospray positive-ion multiple-reaction monitoring for the underivatised analytes',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tren-a1',
        category: 'measured',
        title:
          'In rats, 35 to 40 percent muscle gain with prostate and haemoglobin spared at low dose',
        laymanSummary:
          'In castrated and intact rats, trenbolone enanthate increased androgen-sensitive muscle mass by 35 to 40 percent and protected bone. At the lowest doses the prostate and the red cell count stayed at normal levels; at high doses the prostate grew by 68 percent.',
        technicalDetails:
          'Yarrow et al. gave graded doses of trenbolone enanthate, supraphysiological testosterone enanthate or vehicle to intact and orchiectomised 3-month-old male F344 rats for 29 days. All trenbolone doses and supraphysiological testosterone increased levator ani and bulbocavernosus muscle mass by 35 to 40% above shams (P <= 0.001), with dose-dependent partial protection against orchiectomy-induced total and trabecular bone mineral density loss (P < 0.05) and against visceral fat accumulation (P < 0.05). The lowest trenbolone doses maintained prostate mass and haemoglobin at sham levels in both intact and orchiectomised animals, while supraphysiological testosterone and high-dose trenbolone raised prostate mass by 84% and 68% respectively (P < 0.01). The tissue separation is real and it is dose-dependent, which is the part usually left out.',
        evidenceSource: 'Yarrow JF et al., Am J Physiol Endocrinol Metab 2011;300:E650-E660',
        doi: '10.1152/ajpendo.00440.2010',
        measuredMetric:
          'Levator ani/bulbocavernosus mass, bone mineral density, prostate mass and haemoglobin by dose',
        auditFlag: 'verified',
      },
      {
        id: 'tren-a2',
        category: 'measured',
        title: 'It preserved bone strength in mature rats where testosterone did not',
        laymanSummary:
          'In older castrated rats, trenbolone prevented bone density loss and increased femoral neck strength by 28 percent. Testosterone prevented the density loss but did not improve strength, and nearly doubled the prostate.',
        technicalDetails:
          'McCoy et al. randomised forty 10-month-old male F344/Brown Norway rats to sham, orchiectomy, orchiectomy plus testosterone enanthate 7.0 mg/week, or orchiectomy plus trenbolone enanthate 1.0 mg/week, treating for five weeks. Orchiectomy reduced total and trabecular bone mineral density at the distal femoral metaphysis; both trenbolone and testosterone completely prevented that. Trenbolone additionally increased femoral neck strength by 28% compared with orchiectomised animals (P < 0.05), which testosterone did not. Testosterone nearly doubled prostate mass compared with shams (P < 0.05), while trenbolone did not. The dose ratio matters: 1.0 mg of trenbolone per week did what 7.0 mg of testosterone per week did, and more.',
        evidenceSource: 'McCoy SC et al., Bone 2012;51:667-673',
        doi: '10.1016/j.bone.2012.07.008',
        measuredMetric:
          'Distal femoral bone mineral density, femoral neck strength and prostate mass in skeletally mature rats',
        auditFlag: 'verified',
      },
      {
        id: 'tren-a3',
        category: 'measured',
        title:
          'In 1,146 steroid-using men, the trenbolone group reported more harm on every domain tested',
        laymanSummary:
          'A survey of 1,146 men who had used anabolic steroids in the past year compared the 237 who used trenbolone with the 909 who did not. The trenbolone group reported significantly more mood instability, irritability, depression, and heart and liver concerns.',
        technicalDetails:
          'Bonenti et al. analysed male respondents to the Global Drug Survey 2024 reporting past-year anabolic-androgenic steroid use (N = 1,146, mean age 31.46, SD 9.93), split into a trenbolone group (n = 237) and a non-trenbolone group (n = 909) by past-12-month injectable trenbolone use. Psychosocial concerns — mood instability, irritability, depressive symptoms — were significantly more common in the trenbolone group (all P < 0.001, phi 0.13 to 0.20). Physical concerns, particularly cardiovascular and hepatic, were also significantly more prevalent (all P < 0.001, phi 0.18 to 0.20). UpSet plots showed denser clustering of co-occurring harms in the trenbolone group. This is self-reported and cross-sectional, so it establishes association rather than causation, and the men who choose trenbolone may differ in other ways. It is nonetheless the largest human dataset that exists on this compound.',
        evidenceSource: 'Bonenti B et al., Drug Alcohol Rev 2026;45:e70162',
        doi: '10.1111/dar.70162',
        measuredMetric:
          'Prevalence of self-reported psychosocial and physical concerns, trenbolone versus non-trenbolone steroid users',
        auditFlag: 'caution',
      },
      {
        id: 'tren-a4',
        category: 'inferred',
        title: 'The rat prostate-sparing result is dose-specific and is quoted as if it were not',
        laymanSummary:
          'Trenbolone spared the prostate in rats only at the lowest doses tested. At the high dose the prostate grew by 68 percent, which is close to what testosterone did.',
        technicalDetails:
          'In Yarrow et al. the prostate-sparing and haemoglobin-sparing findings applied to the lowest trenbolone doses. High-dose trenbolone raised prostate mass by 68%, against 84% for supraphysiological testosterone. The muscle effect was 35 to 40% at all doses. So the therapeutic window in that experiment is a low-dose window, and the doses used outside laboratories are chosen for maximum anabolic effect. Citing "trenbolone does not enlarge the prostate" without the dose qualifier inverts the finding: at the doses people actually use, the animal data predict prostate enlargement of the same order as high-dose testosterone.',
        evidenceSource: 'Yarrow JF et al., Am J Physiol Endocrinol Metab 2011;300:E650-E660',
        doi: '10.1152/ajpendo.00440.2010',
        inferredClaim:
          'That trenbolone is prostate-sparing as a property of the molecule, when the animal data show it is a property of the low-dose range only',
        auditFlag: 'caution',
      },
      {
        id: 'tren-a5',
        category: 'measured',
        title: 'It raises myostatin protein while it grows muscle',
        laymanSummary:
          'Trenbolone and testosterone both increased mature myostatin protein in rodent muscle at the same time as they increased muscle size and satellite cell number, which is the opposite of the simple story.',
        technicalDetails:
          'Yarrow and colleagues reported that testosterone enanthate and trenbolone enanthate increase mature myostatin protein expression despite increasing skeletal muscle hypertrophy and satellite cell number in rodent muscle. Myostatin is the negative regulator of muscle mass, so a compound that raises it while producing hypertrophy is doing something more complicated than switching off a brake. This matters for the wider claims made about anabolic compounds and myostatin across this whole group of substances: the relationship between the two is not the linear one those claims assume.',
        evidenceSource: 'Yarrow JF et al., Andrologia 2017;49:e12622',
        doi: '10.1111/and.12622',
        measuredMetric:
          'Mature myostatin protein, muscle mass and satellite cell number in rodent muscle',
        auditFlag: 'verified',
      },
      {
        id: 'tren-a6',
        category: 'conclusion_shift',
        title:
          'From a proposed androgen replacement therapy to the highest-harm compound in its class',
        laymanSummary:
          'The rat papers argued trenbolone had advantages over testosterone and deserved study as a hormone replacement therapy. The human survey data place it at the severe end of the risk range within steroid use.',
        technicalDetails:
          'Yarrow et al. concluded in 2011 that their findings indicated trenbolone has advantages over supraphysiological testosterone and supported preclinical study of it as an option for androgen replacement therapy. No such programme followed and no human trial of trenbolone for any indication has ever been registered. The human evidence that did accumulate came from surveys of people using it without supervision: the Global Drug Survey analysis places the trenbolone subgroup at significantly higher prevalence of psychosocial and physical harms than other steroid users, with denser co-occurrence of those harms. These two bodies of evidence are not contradictory — one is low-dose rats and the other is high-dose men — but the distance between them is the whole story of this compound.',
        evidenceSource:
          'Yarrow JF et al., Am J Physiol Endocrinol Metab 2011;300:E650-E660; Bonenti B et al., Drug Alcohol Rev 2026;45:e70162',
        doi: '10.1111/dar.70162',
        inferredClaim:
          'That a favourable low-dose rodent tissue-selectivity profile predicts the human experience of a compound used at multiples of that dose without supervision',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected as an ester, released slowly',
        laymanDesc:
          'The acetate and enanthate forms are oils injected into muscle. The ester is cleaved off gradually, which is what makes one injection last days to weeks.',
        molecularDetail:
          'Trenbolone acetate and trenbolone enanthate are 17beta esters. Tissue esterases hydrolyse them to free 17beta-hydroxy trenbolone; the longer enanthate chain gives slower release. In cattle the lawful form is a compressed subcutaneous ear implant releasing trenbolone acetate over months.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters cells everywhere, unchanged',
        laymanDesc:
          'It is not converted into anything more potent in the prostate or into oestrogen in fat, which is what makes it different from testosterone.',
        molecularDetail:
          'Not a substrate for 5-alpha-reductase and not aromatisable. Testosterone is amplified to dihydrotestosterone in prostate and skin and converted to oestradiol in adipose tissue; trenbolone undergoes neither, so its receptor occupancy is uniform across tissues.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binds the androgen receptor, and two others',
        laymanDesc:
          'It locks onto the androgen receptor strongly, and also onto the progesterone and stress-hormone receptors, which testosterone barely touches.',
        molecularDetail:
          'High-affinity androgen receptor agonism with appreciable progesterone receptor and glucocorticoid receptor binding. The progestogenic component is the standard explanation for its effect on prolactin and libido, and the glucocorticoid interaction for some of its metabolic and behavioural effects.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Muscle protein synthesis rises; the gonadal axis shuts down',
        laymanDesc:
          'Muscle and bone build. At the same time the brain stops signalling the testes, and with no oestrogen being made from the drug, oestrogen falls too.',
        molecularDetail:
          'Androgen response element transactivation in myonuclei with increased satellite cell number, alongside a rise in mature myostatin protein. Hypothalamic and pituitary androgen receptor agonism suppresses LH and FSH. Because the compound does not aromatise, endogenous oestradiol falls without any drug-derived oestrogen replacing it, a state that has its own consequences for lipid profile, bone and mood.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Large anabolic effect in rats; the worst harm profile in men who use it',
        laymanDesc:
          'In animals, 35 to 40 percent more androgen-sensitive muscle and stronger bone. In the men surveyed, significantly more mood instability, irritability, depression, and heart and liver concerns than other steroid users.',
        molecularDetail:
          'Rodent hypertrophy of 35 to 40% above sham at all doses tested with a 28% gain in femoral neck strength. In 1,146 human steroid users, the 237-man trenbolone subgroup showed significantly higher prevalence of psychosocial and cardiovascular and hepatic concerns, all P < 0.001, with effect sizes phi 0.13 to 0.20.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'No human trial of trenbolone has ever been registered for any indication',
        phase: 'None',
        sampleSize: 0,
        primaryEndpoint:
          'No human clinical trial exists. The compound has never been given to a person under an approved protocol',
        endpointMet: false,
        statisticalPValue: 'Not applicable',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Yarrow 2011 graded-dose orchiectomised and intact rat study',
        phase: 'Preclinical, 29 days, male F344 rats',
        sampleSize: 0,
        primaryEndpoint:
          'Androgen-sensitive muscle mass, bone mineral density, visceral fat, prostate mass and haemoglobin',
        endpointMet: true,
        statisticalPValue:
          'Muscle mass +35 to 40% above shams (P <= 0.001); bone and visceral fat protection P < 0.05; high-dose prostate mass +68% (P < 0.01)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Global Drug Survey 2024 comparative analysis',
        phase: 'Cross-sectional survey of self-reported harms',
        sampleSize: 1146,
        primaryEndpoint:
          'Prevalence of psychosocial and physical concerns, trenbolone users versus other anabolic steroid users',
        endpointMet: true,
        statisticalPValue:
          'All between-group differences P < 0.001, phi 0.13 to 0.20 for psychosocial and 0.18 to 0.20 for physical concerns',
        unreportedAdverseSignals:
          'Self-report and cross-sectional: establishes association, not causation, and cannot exclude that men who choose trenbolone differ from other steroid users in other ways.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Androgen-sensitive muscle mass increased 35 to 40% above sham at every dose in intact and orchiectomised rats',
        'Femoral neck strength increased 28% in skeletally mature orchiectomised rats where testosterone produced no strength gain',
        'Prostate mass maintained at sham level at the lowest doses and increased 68% at high dose',
        'Mature myostatin protein rose alongside hypertrophy and increased satellite cell number in rodent muscle',
        'Significantly higher prevalence of self-reported mood instability, irritability, depressive symptoms and cardiovascular and hepatic concerns in 237 trenbolone users versus 909 other steroid users',
      ],
      unsupportedInferences: [
        'That trenbolone is prostate-sparing, which held only at the lowest doses in the rat study and reversed at high dose',
        'That the favourable rodent tissue-selectivity profile transfers to human use at multiples of those doses',
        'That the survey association proves causation — it is cross-sectional and self-reported, and this page says so rather than treating it as a trial',
      ],
      whatFailedInitially: [
        'The 2011 recommendation that trenbolone be studied as an androgen replacement therapy was never taken up; no human trial has been registered in the fifteen years since',
        'Its progesterone and glucocorticoid receptor activity means the "clean androgen" framing is incomplete even in the animal data',
      ],
      realWorldOutcome: [
        'Listed in 21 CFR 1308.13 as a Schedule III anabolic steroid: "(86) trenbolone (17beta-hydroxyestr-4,9,11-trien-3-one)"',
        'Lawfully approved in the United States only for cattle, under 21 CFR 522.2476 and 522.2477, with residue tolerances set in 21 CFR 556.739',
        'Prohibited at all times in sport; urinary metabolite profile differs by route of administration, which is analytically informative',
      ],
    },
    deliverySystem: {
      type: 'Oil-based intramuscular injection of the acetate or enanthate ester; lawfully, a subcutaneous ear implant in cattle',
      description:
        'In cattle, a compressed pellet implanted subcutaneously behind the ear, usually combined with oestradiol, releasing over the finishing period. In human use, an oil-based intramuscular injection of trenbolone acetate or enanthate prepared outside any pharmaceutical quality system. There is no human dosage form, no pharmacopoeial monograph for a human preparation and no established human dose.',
      safetyProfile:
        'There is no clinical safety dataset because there has never been a clinical trial. The available human evidence is a cross-sectional comparison within 1,146 steroid users in which the trenbolone subgroup reported significantly more mood instability, irritability, depressive symptoms and cardiovascular and hepatic concerns than users of other steroids, all at P < 0.001. Mechanistically expected effects include complete suppression of endogenous testosterone and gonadotropins, suppression of oestradiol without any aromatised replacement, marked reduction in HDL cholesterol, and progestogenic effects on prolactin. Isolated case reports describe hypercalcaemia. As an oil-based underground injectable, the preparation itself carries sterility and dosing-accuracy risks independent of the drug.',
    },
    commonQuestions: [
      {
        q: 'Why is a cattle drug regulated so differently from a human one?',
        a: 'Because the two approval systems ask different questions. A food-animal approval asks whether the drug is safe and effective in the animal and whether residues in edible tissue stay below a tolerance that is safe for the person eating the beef — that tolerance is set in 21 CFR 556.739. It never asks what the drug does to a human taking it directly, because that was never the proposed use. Trenbolone has an approval for cattle under 21 CFR 522.2476 and simultaneously sits in Schedule III of the Controlled Substances Act under 21 CFR 1308.13 for human purposes. Both facts are true and they are answers to different questions.',
      },
      {
        q: 'Is it really "five times stronger than testosterone"?',
        a: 'The ratio comes from rodent assays that compare growth of the levator ani muscle against growth of the prostate and seminal vesicles, and those assays do give trenbolone a much higher anabolic-to-androgenic ratio than testosterone. In the McCoy study, 1.0 mg of trenbolone per week matched and exceeded what 7.0 mg of testosterone per week achieved for bone. But a ratio from a castrated rat is a ratio from a castrated rat. It has never been measured in a person, and the two receptors that make trenbolone unusual in humans — progesterone and glucocorticoid — are not part of what that assay measures at all.',
        auditNote:
          'Anabolic-to-androgenic ratios circulate as though they were human potency figures. Every one of them comes from the rodent levator ani assay.',
      },
      {
        q: 'What does the human evidence actually show?',
        a: 'One dataset, and it is a survey rather than a trial. Among 1,146 men who reported using anabolic steroids in the previous year, the 237 who had injected trenbolone reported significantly more mood instability, irritability and depressive symptoms, and significantly more cardiovascular and hepatic concerns, than the 909 who used other steroids — all differences at P < 0.001, with small-to-moderate effect sizes. Harms also clustered more densely in that group. This is self-report, it is cross-sectional, and men who choose trenbolone may differ in ways the survey cannot see. Within those limits it is the only human comparison that exists, and it points one way.',
      },
      {
        q: 'Why is there no price on this page?',
        a: 'Because there is no lawful human market. The cattle implant has a list price and it is a veterinary product measured in doses for a 600 kg steer, which is not a meaningful figure for a reader of this page. This site prints prices from published sources for human medicines and prints nothing where no such source exists.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Yarrow JF et al. 17beta-hydroxyestra-4,9,11-trien-3-one (trenbolone) exhibits tissue selective anabolic activity: effects on muscle, bone, adiposity, hemoglobin, and prostate. Am J Physiol Endocrinol Metab 2011;300:E650-E660',
        identifier: '10.1152/ajpendo.00440.2010',
        kind: 'doi',
      },
      {
        label:
          'McCoy SC et al. 17beta-hydroxyestra-4,9,11-trien-3-one (trenbolone) preserves bone mineral density in skeletally mature orchiectomized rats without prostate enlargement. Bone 2012;51:667-673',
        identifier: '10.1016/j.bone.2012.07.008',
        kind: 'doi',
      },
      {
        label:
          'Yarrow JF et al. Testosterone and trenbolone enanthate increase mature myostatin protein expression despite increasing skeletal muscle hypertrophy and satellite cell number in rodent muscle. Andrologia 2017;49:e12622',
        identifier: '10.1111/and.12622',
        kind: 'doi',
      },
      {
        label:
          'Bonenti B et al. The Trenbolo(g)ne sandwich: an international study comparing health harms among men who use anabolic-androgenic steroids with and without trenbolone. Drug Alcohol Rev 2026;45:e70162',
        identifier: '10.1111/dar.70162',
        kind: 'doi',
      },
      {
        label:
          'The influence of the route of drug administration on the metabolic profile of trenbolone in doping control urine samples. Steroids 2026;225:109716',
        identifier: '10.1016/j.steroids.2025.109716',
        kind: 'doi',
      },
      {
        label:
          '21 CFR 1308.13(f) — Schedule III anabolic steroids, entry (86) trenbolone (17beta-hydroxyestr-4,9,11-trien-3-one)',
        identifier: 'https://www.ecfr.gov/current/title-21/chapter-II/part-1308/section-1308.13',
        kind: 'regulatory',
      },
      {
        label: '21 CFR 522.2476 — Trenbolone acetate, approved implants for cattle',
        identifier:
          'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-E/part-522/section-522.2476',
        kind: 'regulatory',
      },
      {
        label: '21 CFR 556.739 — Trenbolone, tolerances for residues in edible tissue',
        identifier:
          'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-E/part-556/section-556.739',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 25015 — trenbolone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/25015',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 9. Oxandrolone
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'oxandrolone',
    name: 'Oxandrolone',
    tradeName: 'Oxandrin',
    sponsor:
      'Originally G. D. Searle; the Oxandrin label was held by Savient Pharmaceuticals. Generics were approved to Sandoz, Upsher-Smith, Par and Roxane between 2006 and 2007',
    targetGene: 'AR',
    targetProtein: 'Androgen receptor',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    indication:
      'Approved as adjunctive therapy to promote weight gain after weight loss following extensive surgery, chronic infection or severe trauma, to offset the protein catabolism of prolonged corticosteroid administration, and for the relief of bone pain accompanying osteoporosis. Every oxandrolone product listed in Drugs@FDA is now marked Discontinued.',
    patientFriendlyIndication:
      'Weight gain after severe illness, injury or burns — approved, and no longer marketed in the United States',
    anatomicalSite:
      'Androgen receptor in skeletal muscle myonuclei; hepatic first-pass metabolism minimal',
    conditionContext: {
      conditionExplainer:
        'A severe burn triggers a hypermetabolic state that can last a year: the body burns through its own muscle protein at a rate no amount of feeding fully offsets. That catabolism, not the wound, is what determines how well many burn patients recover.',
      whyItMatters:
        'Oxandrolone is the only anabolic steroid on this site with a large randomised evidence base in a real clinical population. Fourteen randomised trials in 2,822 burn patients have been pooled, and the picture that emerges is neither the promotional one nor the dismissive one.',
      whoTakesThis:
        'Patients with major burns, in the countries where it remains available, and historically patients with AIDS wasting, Turner syndrome and constitutional growth delay. Outside medicine, bodybuilders using it as a "mild" oral steroid.',
      clinicalGoals:
        'In the burn literature: lean body mass in the recovery phase, length of stay normalised to burn surface area, number of surgical procedures, infection rate and mortality.',
    },
    oneSentenceVerdict:
      'The one anabolic steroid here with 2,822 randomised patients behind it: pooled trials show fewer operations, shorter stay and more lean mass in burn care, no mortality benefit, no reduction in infections, and transaminase elevations in 19% of adults against 5% on placebo.',
    laymanHowItWorks:
      'Oxandrolone is testosterone rebuilt so that a ring oxygen replaces one carbon and a methyl group blocks the position the liver normally attacks. Those two changes mean it survives being swallowed, and that it is a weak androgen relative to how strongly it builds muscle. In a burn patient, whose body is dismantling its own muscle to fuel the healing, that shifts the protein balance back. The same methyl group that makes it work as a tablet is what makes it stress the liver, and the label carries a boxed warning about blood-filled cysts in the liver and about liver tumours.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 62,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@]12CC[C@H]3[C@H]([C@@H]1CC[C@]2(C)O)CC[C@@H]4[C@@]3(COC(=O)C4)C',
      chemicalFormula: 'C19H30O3',
      molecularWeight: '306.4 g/mol',
      targetReceptorAffinity:
        'A 17alpha-methylated, 2-oxa steroid: the carbon at position 2 of the A-ring is replaced by oxygen, and a methyl group at C17 blocks hepatic 17-oxidation so the drug survives first pass. It is a weak androgen with a high anabolic-to-androgenic ratio in the classical rodent assays, and it does not aromatise appreciably.',
      structureSource: {
        label:
          'PubChem CID 5878 (oxandrolone) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5878',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'oxa-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Reference standard identity and the lactone problem',
          description:
            'The 2-oxa lactone in the A-ring is the structural feature that identifies oxandrolone and it is also its stability weak point: it opens under alkaline conditions. Identity and stability testing therefore run together, because a degraded standard gives a low content result that looks like an underdosed product.',
          reagentsAndBuffer:
            'Certified oxandrolone USP reference standard, deuterated oxandrolone internal standard, 1H and 13C NMR in CDCl3, FTIR for the lactone carbonyl near 1735 per cm, high-resolution accurate-mass ESI-MS, forced-degradation panel at pH 1 to pH 10',
        },
        {
          id: 'oxa-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Tablet content uniformity and dissolution',
          description:
            'For a genuine pharmaceutical tablet, content uniformity and dissolution against the compendial method. For a product bought outside the supply chain, the same assay answers a blunter question, which is whether the tablet contains oxandrolone or a cheaper 17-alkylated steroid.',
          dependsOnStepId: 'oxa-w1',
          reagentsAndBuffer:
            'Methanol extraction with sonication, reversed-phase C18 HPLC with UV detection at 200 to 210 nm because oxandrolone has no strong chromophore, or LC-MS/MS where UV sensitivity is insufficient; USP dissolution apparatus 2 in aqueous medium with surfactant',
        },
        {
          id: 'oxa-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Urine extraction for the long-term metabolites',
          description:
            'Oxandrolone is excreted substantially unchanged relative to most steroids, but confirmation still targets the hydroxylated and conjugated metabolites, which extend the detection window well beyond the parent.',
          dependsOnStepId: 'oxa-w2',
          reagentsAndBuffer:
            'Beta-glucuronidase hydrolysis in phosphate buffer pH 7.0, solid-phase extraction on a polymeric sorbent, derivatisation with MSTFA, ammonium iodide and ethanethiol for GC-MS/MS, or direct LC-MS/MS on the underivatised extract',
        },
        {
          id: 'oxa-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Androgen receptor transactivation with a hepatocyte comparison',
          description:
            'Read androgen receptor activity in a reporter line and, in parallel, run the compound on primary human hepatocytes or HepaRG cells with bile-acid transport readouts. For a 17-alkylated steroid the liver arm is not an afterthought — cholestatic injury is the signature toxicity of the chemical class.',
          dependsOnStepId: 'oxa-w3',
          reagentsAndBuffer:
            'AR reporter cell line with ARE-luciferase, charcoal-stripped serum in phenol-red-free medium; HepaRG or primary human hepatocytes in sandwich culture, cholyl-lysyl-fluorescein for BSEP-mediated efflux, lactate dehydrogenase release for cytotoxicity',
        },
        {
          id: 'oxa-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'GC-MS/MS quantification and clinical chemistry panel',
          description:
            'Quantify oxandrolone and metabolites against a deuterated internal standard, and pair that with the liver panel that the clinical literature makes the relevant safety readout: ALT and AST against twice the upper limit of normal, which is the threshold the burn meta-analyses used.',
          dependsOnStepId: 'oxa-w4',
          reagentsAndBuffer:
            'Deuterated oxandrolone internal standard, GC-MS/MS after trimethylsilyl derivatisation on a 5% phenyl methylpolysiloxane column, or LC-MS/MS with atmospheric-pressure chemical ionisation; standard clinical chemistry for ALT, AST, bilirubin and gamma-glutamyl transferase',
        },
      ],
    },
    keyAudits: [
      {
        id: 'oxa-a1',
        category: 'measured',
        title: 'Fourteen randomised trials, 2,822 burn patients: fewer operations and shorter stay',
        laymanSummary:
          'Pooling every randomised trial of oxandrolone in burn patients from 2005 to 2025 showed fewer surgical procedures, shorter hospital stay for the size of the burn, and more weight and lean mass gained.',
        technicalDetails:
          'Lou et al. searched nine databases and pooled 14 randomised controlled trials published between 2005 and 2025, totalling 2,822 patients (1,203 intervention, 1,619 control). Random-effects meta-analysis found significant reductions in surgical procedures (SMD -1.25, 95% CI -2.45 to -0.04, P = 0.04) and in length of stay normalised to total burn surface area (SMD -1.07, 95% CI -2.43 to 0.29, P = 0.007), with increased weight gain (SMD 0.58, P < 0.001) and lean mass (SMD 1.30, P < 0.001). Heterogeneity was extreme throughout, I-squared at or above 95%, and the authors say so directly. Note that two of those confidence intervals cross zero while the reported P-values do not, which is a reporting inconsistency in the source paper that this page reproduces rather than smooths over.',
        evidenceSource: 'Lou J et al., World J Emerg Surg 2025;20:75',
        doi: '10.1186/s13017-025-00648-w',
        measuredMetric:
          'Surgical procedures, length of stay per unit burn surface area, weight gain and lean mass',
        auditFlag: 'caution',
      },
      {
        id: 'oxa-a2',
        category: 'failed',
        title: 'No mortality benefit, no reduction in infection, no better donor-site healing',
        laymanSummary:
          'In the same pooled analysis, oxandrolone did not reduce deaths, did not reduce infections and did not improve healing of the skin-graft donor sites.',
        technicalDetails:
          'In the same 14-trial, 2,822-patient meta-analysis: mortality risk ratio 1.04 (95% CI 0.47 to 2.32, P = 0.913); infection risk ratio 0.83 (95% CI 0.67 to 1.02, P = 0.639); donor site healing SMD -1.48 (95% CI -2.18 to 0.77, P = 0.116). The endpoints that moved are process and body-composition endpoints. The endpoints that did not move are the ones a patient would name first. A drug can genuinely shorten a hospital stay without saving a life, and the honest description of oxandrolone in burn care is exactly that.',
        evidenceSource: 'Lou J et al., World J Emerg Surg 2025;20:75',
        doi: '10.1186/s13017-025-00648-w',
        measuredMetric: 'All-cause mortality, infection rate and donor site healing',
        auditFlag: 'verified',
      },
      {
        id: 'oxa-a3',
        category: 'measured',
        title: 'Transaminase elevation in 19% of adults against 5% on placebo',
        laymanSummary:
          'Nearly one in five adults treated with oxandrolone in the pooled burn trials had liver enzymes rise to at least twice the normal limit, against one in twenty on placebo.',
        technicalDetails:
          'The same meta-analysis reports a non-significant overall increase in treatment-related side effects defined as hepatic dysfunction (ALT or AST at or above twice the upper limit of normal) or oedema (RR 1.82, 95% CI 0.52 to 6.42, P = 0.34), but notably higher transaminase elevations in adults specifically: 19% against 5% on placebo, P = 0.002. A separate single-centre analysis compared transaminitis incidence between oxandrolone and testosterone therapy in major burn injury. The measured liver signal is therefore real, dose-relevant and adult-specific, and it sits alongside the efficacy findings rather than replacing them.',
        evidenceSource:
          'Lou J et al., World J Emerg Surg 2025;20:75; DeWitt A et al., J Burn Care Res 2026;47:37-43',
        doi: '10.1093/jbcr/iraf118',
        measuredMetric: 'Proportion with ALT or AST at or above twice the upper limit of normal',
        auditFlag: 'verified',
      },
      {
        id: 'oxa-a4',
        category: 'measured',
        title: 'The label carries a boxed warning about peliosis hepatis and liver tumours',
        laymanSummary:
          'The approved US label warns in capital letters that this class of drug can cause blood-filled cysts in the liver and liver tumours, sometimes silent until a life-threatening bleed, and that it markedly worsens the blood lipid profile.',
        technicalDetails:
          "The Oxandrin label's boxed warning states that peliosis hepatis, in which liver and sometimes splenic tissue is replaced with blood-filled cysts, has been reported with androgenic anabolic steroid therapy; that these cysts are often unrecognised until life-threatening liver failure or intra-abdominal haemorrhage develops; that liver cell tumours are also reported, most often benign and androgen-dependent but sometimes fatally malignant; and that such tumours are more vascular than other hepatic tumours and may be silent until intra-abdominal haemorrhage develops. It separately warns that blood lipid changes associated with increased atherosclerosis risk — decreased HDL and sometimes increased LDL — occur, may be very marked, and could seriously affect coronary risk. The label also records the drug's Schedule III status under the Anabolic Steroids Control Act of 1990.",
        evidenceSource:
          'Oxandrin (oxandrolone tablets, USP) CIII prescribing information, Savient Pharmaceuticals, via DailyMed',
        measuredMetric: 'Boxed warning text on the approved United States label',
        auditFlag: 'verified',
      },
      {
        id: 'oxa-a5',
        category: 'conclusion_shift',
        title: 'Approved, generically available, and then withdrawn from the market entirely',
        laymanSummary:
          'Oxandrolone had an approved label and five generic versions approved in 2006 and 2007. Every one of them is now listed as discontinued, and no oxandrolone product is marketed in the United States.',
        technicalDetails:
          'Drugs@FDA lists five oxandrolone ANDAs — Sandoz and Upsher-Smith approved 1 December 2006, Upsher-Smith 22 March 2007, Par 22 June 2007 and Roxane 10 July 2007 — and every one carries the marketing status Discontinued, as does the Oxandrin brand. This is a commercial withdrawal rather than a safety withdrawal: the approval was never rescinded and the label was never pulled for a new finding. The consequence for a reader is nonetheless concrete. A drug with fourteen randomised trials behind it in burn care is unobtainable through the lawful supply chain in the United States, while the same molecule is freely purchasable from grey-market sellers with none of the manufacturing controls the ANDAs required.',
        evidenceSource:
          'openFDA Drugs@FDA: ANDA076761, ANDA076897, ANDA077249, ANDA077827, ANDA078033 and the Oxandrin brand, all marketing status Discontinued',
        inferredClaim:
          'That a drug being off the market means it was withdrawn for safety — here the approvals stand and only the marketing stopped',
        auditFlag: 'verified',
      },
      {
        id: 'oxa-a6',
        category: 'inferred',
        title: '"Mild" is a claim about androgenic side effects, not about the liver',
        laymanSummary:
          'Oxandrolone is described as the gentlest oral steroid. That reputation comes from its weak masculinising effects, which is a different question from what it does to the liver.',
        technicalDetails:
          'The classical rodent bioassays give oxandrolone a high anabolic-to-androgenic ratio, and it was the steroid chosen for use in children with Turner syndrome and constitutional growth delay for exactly that reason. But it is 17alpha-alkylated, and 17-alkylation is the structural feature that causes the cholestatic and peliotic liver injury the boxed warning describes. Those are two independent properties of the same molecule. The pooled burn data quantify the second: 19% of adults with transaminases at twice the upper limit of normal against 5% on placebo. Describing the drug as mild without that qualifier carries a true statement about virilisation into a false implication about hepatotoxicity.',
        evidenceSource:
          'Lou J et al., World J Emerg Surg 2025;20:75; Oxandrin prescribing information',
        doi: '10.1186/s13017-025-00648-w',
        inferredClaim:
          'That a low androgenic-to-anabolic ratio implies liver safety, when the liver risk comes from the 17alpha-methyl group rather than from androgenicity',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Survives the first pass because of a methyl group',
        laymanDesc:
          'A methyl group at one position blocks the enzyme the liver would use to destroy it, so it works as a tablet rather than an injection.',
        molecularDetail:
          '17alpha-methylation blocks hepatic 17beta-hydroxysteroid dehydrogenase oxidation, which is what confers oral bioavailability on this whole family of steroids. The 2-oxa substitution in the A-ring further reduces androgenicity relative to the anabolic effect.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Diffuses into cells throughout the body',
        laymanDesc:
          'A small lipophilic steroid that enters cells freely and reaches the receptor inside.',
        molecularDetail:
          'Passive membrane diffusion; binds the cytoplasmic androgen receptor. It is not appreciably aromatised, so it does not generate oestradiol.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binds the androgen receptor weakly but effectively',
        laymanDesc:
          'It attaches to the same receptor as testosterone with less masculinising force, but enough to switch on the muscle programme.',
        molecularDetail:
          'Androgen receptor agonism with a high anabolic-to-androgenic ratio in the classical levator ani assay. That ratio is the reason it was the steroid of choice in paediatric indications where virilisation was the limiting concern.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Shifts protein balance in a catabolic body',
        laymanDesc:
          'In a burn patient whose body is consuming its own muscle for fuel, it pushes the balance back towards building.',
        molecularDetail:
          'Androgen response element transactivation raises muscle protein synthesis and reduces net proteolysis during the burn hypermetabolic response. The same 17alpha-methyl group that permits oral dosing impairs canalicular bile transport in hepatocytes, which is the mechanistic route to the cholestatic injury and the peliosis in the boxed warning.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Lean mass, fewer operations, shorter stay; deaths and infections unchanged',
        laymanDesc:
          'Across fourteen trials the measurable gains were body composition, operations and length of stay. Death rate and infection rate did not change.',
        molecularDetail:
          'Pooled SMD 1.30 for lean mass and 0.58 for weight gain, both P < 0.001; surgical procedures SMD -1.25, P = 0.04; length of stay per unit burn surface area SMD -1.07, P = 0.007. Mortality RR 1.04, P = 0.913; infection RR 0.83, P = 0.639. Adult transaminase elevation 19% against 5%, P = 0.002.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Lou 2025 systematic review and meta-analysis of 14 randomised trials',
        phase: 'Systematic review and meta-analysis of randomised controlled trials, 2005 to 2025',
        sampleSize: 2822,
        primaryEndpoint:
          'Lean body mass in the recovery phase, hepatic dysfunction or oedema, infections, mortality, surgical procedures and length of stay normalised to burn surface area',
        endpointMet: true,
        statisticalPValue:
          'Surgical procedures SMD -1.25 (P = 0.04); LOS/TBSA SMD -1.07 (P = 0.007); lean mass SMD 1.30 and weight gain SMD 0.58 (both P < 0.001); mortality RR 1.04 (P = 0.913); infections RR 0.83 (P = 0.639)',
        unreportedAdverseSignals:
          'Heterogeneity was extreme across outcomes, I-squared at or above 95%. Adult transaminase elevation 19% versus 5% on placebo (P = 0.002). Two efficacy confidence intervals reported in the abstract cross zero while their P-values do not.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'DeWitt 2026 oxandrolone versus testosterone transaminitis analysis',
        phase: 'Single-centre comparative analysis in major burn injury',
        sampleSize: 0,
        primaryEndpoint:
          'Incidence of transaminitis with oxandrolone compared with testosterone therapy',
        endpointMet: true,
        statisticalPValue:
          'Reported as a preliminary comparative incidence analysis rather than a powered randomised comparison',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Across 14 randomised trials and 2,822 burn patients: fewer surgical procedures, shorter stay normalised to burn surface area, and greater weight and lean mass gain',
        'No mortality benefit (RR 1.04), no reduction in infection (RR 0.83) and no improvement in donor site healing',
        'Transaminase elevation to at least twice the upper limit of normal in 19% of adults against 5% on placebo (P = 0.002)',
        'A boxed warning on the approved label for peliosis hepatis, hepatic tumours and marked adverse blood lipid changes',
        'Every oxandrolone product in Drugs@FDA carries the marketing status Discontinued',
      ],
      unsupportedInferences: [
        'That oxandrolone is a "mild" steroid in the sense that matters — the mildness is androgenic, and the liver risk comes from 17alpha-alkylation, which it has',
        'That improvements in lean mass and length of stay imply a survival benefit, which the pooled mortality estimate specifically excludes',
        'That the burn-care evidence supports use in healthy people for body composition, a population no trial has included',
      ],
      whatFailedInitially: [
        'Mortality, infection rate and donor-site healing all failed to separate from control in the pooled analysis',
        'Heterogeneity across the pooled trials was extreme, I-squared at or above 95% for most outcomes, which the authors flag as a reason for cautious interpretation',
      ],
      realWorldOutcome: [
        'Listed in 21 CFR 1308.13 as a Schedule III anabolic steroid, entry (76)',
        'No longer marketed in the United States, while remaining available in some other countries and widely obtainable from grey-market sellers',
        'Prohibited at all times in sport; long-term urinary metabolites give an extended detection window',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, 2.5 mg and 10 mg strengths in the approved product',
      description:
        'Oxandrin was supplied as 2.5 mg and 10 mg oral tablets. Five generic ANDAs were approved between December 2006 and July 2007 and all are now discontinued, as is the brand. What circulates outside the supply chain is a tablet or capsule with no content uniformity testing behind it.',
      safetyProfile:
        'The approved label carries a boxed warning covering peliosis hepatis, hepatic tumours that may be silent until intra-abdominal haemorrhage, and blood lipid changes associated with increased atherosclerotic risk. In the pooled burn trials, transaminase elevation to at least twice the upper limit of normal occurred in 19% of adults against 5% on placebo. Contraindications on the label include known or suspected prostate or male breast carcinoma, breast carcinoma in women with hypercalcaemia, and pregnancy. Suppression of endogenous testosterone and gonadotropins follows by mechanism, as with every androgen.',
    },
    commonQuestions: [
      {
        q: 'Does oxandrolone actually work in burn patients?',
        a: 'On some endpoints, yes, with the largest randomised base of any drug on this page. Pooling fourteen trials and 2,822 patients found fewer surgical procedures, shorter hospital stay for the size of burn, and greater gains in weight and lean mass. On the endpoints that matter most it did not: mortality risk ratio 1.04, infection risk ratio 0.83, no improvement in donor site healing. Heterogeneity between trials was extreme, at or above 95%, which means the pooled numbers are averages over studies that disagreed substantially with each other. It is a real adjunct with a real and bounded effect.',
      },
      {
        q: 'Is it the safe oral steroid?',
        a: "It is the least virilising one, which is a different claim. Its reputation was earned in paediatrics, where it was used in Turner syndrome and constitutional growth delay precisely because it masculinises weakly for the muscle it builds. But it is 17alpha-alkylated, and that is the structural feature responsible for cholestatic liver injury and peliosis hepatis across the whole oral steroid class. The pooled burn trials put a number on it: 19% of adults reached twice the upper limit of normal on transaminases, against 5% on placebo. The label's boxed warning describes liver cysts and tumours that may remain silent until a life-threatening bleed.",
        auditNote:
          'Low androgenicity and low hepatotoxicity are independent properties. Oxandrolone has the first and not the second.',
      },
      {
        q: 'Why can I not get it in the United States?',
        a: 'Because every manufacturer stopped making it. Drugs@FDA lists the Oxandrin brand and five generic approvals from 2006 and 2007, and all of them are marked Discontinued. The approvals were never rescinded and no new safety finding pulled the label — this is a commercial withdrawal. The practical result is that a drug with a large randomised evidence base in burn care is unavailable through pharmacies while the same molecule is easy to buy from sellers who do none of the testing the generic approvals required.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Lou J et al. Oxandrolone for burn patients: a systematic review and updated meta-analysis of randomized controlled trials from 2005 to 2025. World J Emerg Surg 2025;20:75',
        identifier: '10.1186/s13017-025-00648-w',
        kind: 'doi',
      },
      {
        label:
          'The efficacy and safety of androgen analog oxandrolone in improving clinical outcomes in burn patients: a systematic review and meta-analysis of randomized controlled trials. Front Med (Lausanne) 2025;12:1485474',
        identifier: '10.3389/fmed.2025.1485474',
        kind: 'doi',
      },
      {
        label:
          'DeWitt A et al. A preliminary analysis of the incidence of transaminitis observed in oxandrolone versus testosterone therapy in major burn injury. J Burn Care Res 2026;47:37-43',
        identifier: '10.1093/jbcr/iraf118',
        kind: 'doi',
      },
      {
        label:
          'Administration and effects of beta blockers and oxandrolone in severely burned adults: a post hoc analysis of the RE-ENERGIZE trial. Burns Trauma 2024;12:tkad063',
        identifier: '10.1093/burnst/tkad063',
        kind: 'doi',
      },
      {
        label:
          'Oxandrin (oxandrolone tablets, USP) CIII prescribing information, Savient Pharmaceuticals — boxed warning, indications and Schedule III statement',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f622616e-4c11-4149-bf00-5ea5ce97800b',
        kind: 'regulatory',
      },
      {
        label:
          '21 CFR 1308.13(f) — Schedule III anabolic steroids, entry (76) oxandrolone (17alpha-methyl-17beta-hydroxy-2-oxa-5alpha-androstan-3-one)',
        identifier: 'https://www.ecfr.gov/current/title-21/chapter-II/part-1308/section-1308.13',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5878 — oxandrolone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5878',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 10. Stanozolol
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'stanozolol',
    name: 'Stanozolol',
    tradeName: 'Winstrol',
    sponsor: 'Originally Winthrop Laboratories; the Winstrol application was held by Lundbeck Inc.',
    targetGene: 'AR',
    targetProtein: 'Androgen receptor',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 1962,
    indication:
      'Winstrol was approved in the United States on 9 January 1962 as a 2 mg oral tablet; its surviving indication was prophylaxis of hereditary angioedema. The application is listed Discontinued and no human stanozolol product is marketed in the United States.',
    patientFriendlyIndication:
      'Hereditary angioedema prevention and anaemia — approved in 1962, no longer sold',
    anatomicalSite:
      'Androgen receptor in skeletal muscle and bone marrow; hepatic canalicular transport',
    conditionContext: {
      conditionExplainer:
        'Hereditary angioedema is a genetic deficiency of C1 esterase inhibitor that causes episodes of severe swelling, including of the airway. Androgens raise hepatic production of the deficient protein, which is why an anabolic steroid was a mainstay of prevention for decades before targeted drugs existed.',
      whyItMatters:
        'That is the clinical history the molecule actually has, and it is almost never the reason anyone looks it up. Stanozolol is the most famous doping compound in history and it is also a drug that prevented airway swelling in people who had no alternative.',
      whoTakesThis:
        'Historically, patients with hereditary angioedema and with aplastic anaemia; in some countries it is still used for lower-risk myelodysplastic syndromes and non-severe aplastic anaemia. Otherwise, athletes and bodybuilders.',
      clinicalGoals:
        'In the haematological literature the goal is a haemoglobin or platelet response; in angioedema prophylaxis, a reduction in attack frequency.',
    },
    oneSentenceVerdict:
      'The steroid that made doping a public subject, approved in 1962 and long discontinued, with a distinctive drug-induced liver injury signature described prospectively in 18 young men: marked bilirubin rise, mild transaminase rise, near-normal gamma-glutamyl transferase.',
    laymanHowItWorks:
      'Stanozolol is testosterone with a pyrazole ring fused onto one end and a methyl group added at the other. The pyrazole ring makes it a poor substrate for aromatase, so it produces no oestrogen; the methyl group lets it survive being swallowed. Both of those are why it was popular. The methyl group is also why it damages the liver, and the injury it causes has an unusual fingerprint: the bilirubin climbs high enough to turn people yellow while the enzymes that normally flag bile duct problems stay close to normal.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 48,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@]12CC[C@H]3[C@H]([C@@H]1CC[C@]2(C)O)CC[C@@H]4[C@@]3(CC5=C(C4)NN=C5)C',
      chemicalFormula: 'C21H32N2O',
      molecularWeight: '328.5 g/mol',
      targetReceptorAffinity:
        'A 17alpha-methylated dihydrotestosterone derivative with a pyrazole ring fused to the A-ring, formally 17alpha-methyl-17beta-hydroxy-5alpha-androst-2-eno[3,2-c]-pyrazole. It is not a substrate for aromatase, so it generates no oestrogen, and the 17alpha-methyl group confers oral activity at the cost of the hepatic toxicity characteristic of the class.',
      structureSource: {
        label:
          'PubChem CID 25249 (stanozolol) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/25249',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'stan-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Reference standard identity — the pyrazole makes it easy',
          description:
            'The fused pyrazole is unique among the common anabolic steroids and gives stanozolol a distinctive nitrogen-containing accurate mass and a basic nitrogen that ionises well in positive electrospray. Identity is straightforward; distinguishing the aqueous suspension from the oil-based preparation matters more in practice.',
          reagentsAndBuffer:
            'Certified stanozolol reference standard, stanozolol-d3 internal standard, 1H and 13C NMR in DMSO-d6, high-resolution accurate-mass ESI-MS in positive ion mode, melting point determination',
        },
        {
          id: 'stan-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Content and particulate assessment of an aqueous suspension',
          description:
            'Stanozolol is unusual among injectables in being formulated as a water-based microcrystalline suspension rather than an oil solution. Particle size distribution governs release and injection-site reaction, so an assay covers concentration, particle size and sterility together.',
          dependsOnStepId: 'stan-w1',
          reagentsAndBuffer:
            'Methanol dissolution of the suspension, reversed-phase C18 HPLC with UV detection at 240 to 254 nm or LC-MS/MS, laser diffraction particle sizing, membrane filtration bioburden and limulus amoebocyte lysate endotoxin assay',
        },
        {
          id: 'stan-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Urine preparation targeting the N-glucuronides',
          description:
            'Routine anti-doping analysis for stanozolol now targets the N-glucuronide metabolites directly rather than hydrolysing them, because they are more abundant and give a longer detection window than the parent or 16beta-hydroxystanozolol. Online solid-phase extraction into high-resolution mass spectrometry is the current approach.',
          dependsOnStepId: 'stan-w2',
          reagentsAndBuffer:
            'Direct dilution or online solid-phase extraction of untreated urine, ammonium formate buffered aqueous mobile phase, reference standards for stanozolol N-glucuronide isomers and for 16beta-hydroxystanozolol',
        },
        {
          id: 'stan-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Hepatocyte cholestasis model alongside the receptor assay',
          description:
            'Run androgen receptor transactivation and a bile-salt export pump inhibition assay on the same compound. The clinical phenotype of stanozolol liver injury is cholestatic with near-normal gamma-glutamyl transferase, which points at canalicular transport rather than at bile duct injury, and that is what this assay interrogates.',
          dependsOnStepId: 'stan-w3',
          reagentsAndBuffer:
            'AR reporter cell line with ARE-luciferase in charcoal-stripped serum; sandwich-cultured primary human hepatocytes or HepaRG cells, cholyl-lysyl-fluorescein or taurocholate for BSEP-mediated efflux, membrane vesicle BSEP inhibition assay',
        },
        {
          id: 'stan-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'LC-HRMS quantification and the clinical biochemistry signature',
          description:
            'Quantify stanozolol N-glucuronides in urine by high-resolution mass spectrometry, and separately record the biochemistry pattern that identifies the injury clinically: total bilirubin markedly raised, transaminases mildly raised, gamma-glutamyl transferase within or slightly above normal.',
          dependsOnStepId: 'stan-w4',
          reagentsAndBuffer:
            'C18 or biphenyl column with formic acid and acetonitrile gradient, Orbitrap or quadrupole time-of-flight detection, deuterated internal standard; clinical panel for total and direct bilirubin, ALT, AST, alkaline phosphatase and gamma-glutamyl transferase',
        },
      ],
    },
    keyAudits: [
      {
        id: 'stan-a1',
        category: 'measured',
        title: 'A distinctive liver injury signature in 18 prospectively followed young men',
        laymanSummary:
          'A Latin American registry followed 18 men aged 19 to 48 who developed liver injury after using stanozolol for appearance. All had high bilirubin and jaundice, with only mild enzyme rises and a normal gamma-GT — an unusual combination that identifies the cause.',
        technicalDetails:
          'Nunes et al. prospectively evaluated 18 individuals through the Latin American DILI Registry between 2013 and 2023. All were young males aged 19 to 48 using stanozolol for aesthetic purposes. Mean latency to symptom onset was 55 days. Jaundice and pruritus predominated. Total bilirubin was elevated in every case while gamma-glutamyl transferase remained within or only slightly above the normal range, with transaminases mildly raised — a biochemical pattern the authors identify as characteristic of stanozolol. Ten of the eighteen reported concurrent use of other substances, so attribution in those cases is not clean, and the paper says so.',
        evidenceSource: 'Nunes V et al., J Clin Exp Hepatol 2025;15:102506',
        doi: '10.1016/j.jceh.2025.102506',
        measuredMetric:
          'Total bilirubin, transaminases and gamma-glutamyl transferase at presentation; latency to symptom onset',
        auditFlag: 'verified',
      },
      {
        id: 'stan-a2',
        category: 'measured',
        title: 'Approved in 1962, and every product discontinued',
        laymanSummary:
          'Winstrol was approved by the FDA on 9 January 1962 as a 2 mg tablet. That application is now listed as discontinued and there is no marketed human stanozolol product in the United States.',
        technicalDetails:
          "Drugs@FDA records NDA 012885 for WINSTROL, stanozolol 2 mg tablet, held latterly by Lundbeck Inc., with original approval dated 9 January 1962 and supplements approved in 1986, 1987, 1991 and 2003. The product's marketing status is Discontinued and a DailyMed search for a current stanozolol human label returns nothing. The last indication the product carried in the United States was prophylaxis against attacks of hereditary angioedema, an indication now served by C1 esterase inhibitor concentrates, a kallikrein inhibitor and a bradykinin receptor antagonist — targeted drugs that did not exist when stanozolol was the alternative.",
        evidenceSource:
          'openFDA Drugs@FDA, NDA 012885 (WINSTROL, stanozolol 2 mg tablet), original approval 9 January 1962, marketing status Discontinued',
        measuredMetric: 'Approval date, dosage form and current marketing status',
        auditFlag: 'verified',
      },
      {
        id: 'stan-a3',
        category: 'measured',
        title: 'Hepatocellular adenoma after long-term oral use',
        laymanSummary:
          'A 2025 case report describes a benign liver tumour that developed after long-term oral stanozolol, which is the specific lesion the anabolic steroid class carries a boxed warning about.',
        technicalDetails:
          'A 2025 case report in Frontiers in Medicine describes hepatocellular adenoma attributed to long-term oral stanozolol administration. Hepatocellular adenoma and peliosis hepatis are the lesions named in the boxed warning that appears on approved anabolic steroid labels in the United States, which states that such tumours are more vascular than other hepatic tumours and may remain silent until life-threatening intra-abdominal haemorrhage develops. A single case report cannot establish incidence. What it does is confirm that the lesion the label warns about is still being seen in people using the drug outside medical supervision.',
        evidenceSource:
          'Case report: hepatocellular adenoma due to long-term oral stanozolol administration. Front Med (Lausanne) 2025;12:1654316',
        doi: '10.3389/fmed.2025.1654316',
        measuredMetric:
          'Histologically characterised hepatocellular adenoma attributed to stanozolol',
        auditFlag: 'caution',
      },
      {
        id: 'stan-a4',
        category: 'measured',
        title: 'Anti-doping analysis moved to the N-glucuronides, and detection windows lengthened',
        laymanSummary:
          'Laboratories stopped looking for stanozolol itself and started looking directly for the sugar-conjugated forms the body makes, which stay detectable far longer.',
        technicalDetails:
          'Stanozolol-N-glucuronide metabolites are now established as suitable targets for routine anti-doping analysis, with validated online solid-phase extraction methods coupled to high-resolution mass spectrometry analysing them directly in untreated urine. Earlier methods targeted the parent and 16beta-hydroxystanozolol after hydrolysis. The practical consequence is that detection windows for stanozolol lengthened substantially without any change in the drug, which is a recurring pattern in this field: an apparent change in how often a substance is found can be a change in what the laboratory is looking for.',
        evidenceSource:
          'Stanozolol-N-glucuronide metabolites in human urine samples as suitable targets in terms of routine anti-doping analysis. Drug Test Anal 2021;13:1668-1677',
        doi: '10.1002/dta.3109',
        measuredMetric: 'Analytical target selection and resulting urinary detection window',
        auditFlag: 'verified',
      },
      {
        id: 'stan-a5',
        category: 'conclusion_shift',
        title: 'A drug for airway swelling and anaemia became a drug for appearance',
        laymanSummary:
          'Every published clinical use of stanozolol is haematological or immunological. Every documented case of harm in the recent literature is in a young man using it to look a certain way.',
        technicalDetails:
          'The clinical literature on stanozolol concerns hereditary angioedema prophylaxis, non-severe aplastic anaemia, and anaemia in lower-risk myelodysplastic syndromes after failure of epoetin alfa, where retrospective series still report responses. The recent harm literature concerns a different population entirely: all 18 patients in the Latin American DILI registry series were young men using it for aesthetic purposes, mean latency 55 days. The molecule did not change. The population taking it did, and the evidence base did not follow, so what is known about efficacy comes from one group of patients and what is known about harm comes from another.',
        evidenceSource:
          'Nunes V et al., J Clin Exp Hepatol 2025;15:102506; Ann Hematol 2021;100:1451-1457 on stanozolol in lower-risk myelodysplastic syndromes',
        doi: '10.1007/s00277-021-04508-w',
        inferredClaim:
          'That the safety experience from supervised haematological use transfers to unsupervised use for appearance, when the dose, duration, monitoring and co-exposures all differ',
        auditFlag: 'contested',
      },
      {
        id: 'stan-a6',
        category: 'inferred',
        title: '"It does not aromatise" is true and is not a safety statement',
        laymanSummary:
          'Stanozolol genuinely produces no oestrogen, which is why it does not cause breast tissue growth or water retention. That says nothing about the liver, the cholesterol or the heart.',
        technicalDetails:
          'The fused pyrazole ring makes stanozolol a poor aromatase substrate, so it does not generate oestradiol, and the oestrogenic effects that limit other steroids do not occur. That is a real pharmacological property. It is routinely offered as a reason the compound is safe, which does not follow: the documented harms are hepatic — cholestatic injury with a characteristic biochemical signature, and hepatocellular adenoma — plus the marked HDL suppression the class boxed warning describes, and the loss of endogenous testosterone. Not aromatising removes one category of side effect and touches none of those.',
        evidenceSource:
          'Nunes V et al., J Clin Exp Hepatol 2025;15:102506; boxed warning text common to approved anabolic steroid labels',
        doi: '10.1016/j.jceh.2025.102506',
        inferredClaim:
          'That absence of oestrogenic side effects implies overall safety, when the documented harms of this compound are hepatic and lipid-related',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Oral tablet or aqueous suspension',
        laymanDesc:
          'It is one of the few steroids formulated as a water-based injectable as well as a tablet, because it does not dissolve well in oil.',
        molecularDetail:
          '17alpha-methylation blocks hepatic 17-oxidation and confers oral activity. The injectable form is a microcrystalline aqueous suspension rather than an oil solution, which gives it a short half-life and a reputation for injection-site pain.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters cells and reaches the receptor',
        laymanDesc: 'A lipophilic steroid that diffuses into cells and binds the receptor inside.',
        molecularDetail:
          'Passive diffusion; binds the cytoplasmic androgen receptor. As a 5alpha-reduced derivative it is not a substrate for 5-alpha-reductase and, because of the pyrazole ring, not appreciably a substrate for aromatase.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Androgen receptor agonism with no oestrogen produced',
        laymanDesc:
          'It switches the androgen receptor on and, unlike testosterone, generates no oestrogen at all along the way.',
        molecularDetail:
          'Androgen receptor transactivation without aromatisation, so no oestradiol is produced from the drug and endogenous oestradiol falls as the gonadal axis is suppressed. In hepatocytes the same molecule impairs canalicular bile salt export, the mechanistic basis of the cholestatic injury.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Raises C1 inhibitor production and stimulates erythropoiesis',
        laymanDesc:
          'In the liver it increases production of the missing protein in hereditary angioedema. In the bone marrow it stimulates red cell production, which is why it was used for anaemia.',
        molecularDetail:
          'Hepatic androgen receptor signalling increases C1 esterase inhibitor synthesis, the basis of the angioedema indication. Marrow effects, including on regulatory T cell populations, underlie its continued use in non-severe aplastic anaemia and lower-risk myelodysplastic syndromes in some centres.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Cholestatic jaundice at a mean of 55 days',
        laymanDesc:
          'In the men followed prospectively, jaundice and itching appeared after about eight weeks, with bilirubin high and the usual bile duct enzyme normal.',
        molecularDetail:
          'Mean latency to symptom onset 55 days across 18 prospectively evaluated cases; total bilirubin raised in all, transaminases mildly raised, gamma-glutamyl transferase within or slightly above normal. Hepatocellular adenoma reported after long-term oral use.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Latin American DILI Registry prospective case series, 2013 to 2023',
        phase: 'Prospective registry case series',
        sampleSize: 18,
        primaryEndpoint:
          'Clinical and biochemical phenotype of stanozolol-induced liver injury, with other causes excluded',
        endpointMet: true,
        statisticalPValue:
          'Descriptive: total bilirubin raised in all 18; gamma-glutamyl transferase within or slightly above normal; mean latency 55 days',
        unreportedAdverseSignals:
          'Ten of eighteen reported concurrent use of other substances, so attribution to stanozolol alone is not possible in those cases.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Retrospective series in lower-risk myelodysplastic syndromes after epoetin alfa failure',
        phase: 'Retrospective cohort',
        sampleSize: 0,
        primaryEndpoint: 'Haematological response to stanozolol after failure of epoetin alfa',
        endpointMet: true,
        statisticalPValue:
          'Retrospective and uncontrolled; reports response rates without a randomised comparator',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A characteristic drug-induced liver injury phenotype in 18 prospectively evaluated young men: raised total bilirubin in all, mild transaminase rise, near-normal gamma-glutamyl transferase, mean latency 55 days',
        'Hepatocellular adenoma reported after long-term oral administration',
        'Approval of WINSTROL, stanozolol 2 mg tablet, on 9 January 1962 under NDA 012885, now Discontinued',
        'Stanozolol N-glucuronides established as the routine anti-doping analytical target, lengthening the detection window',
      ],
      unsupportedInferences: [
        'That the absence of aromatisation makes the compound safe, when the documented harms are hepatic and lipid-related',
        'That safety experience from supervised use in angioedema and anaemia transfers to unsupervised use for appearance at different doses and durations',
        'That an oral tablet is inherently milder than an injection, when 17alpha-alkylation is precisely what makes the oral forms hepatotoxic',
      ],
      whatFailedInitially: [
        'The approved human product was discontinued and no stanozolol human label is currently listed in DailyMed',
        'Its angioedema indication was superseded by targeted C1 inhibitor, kallikrein and bradykinin receptor therapies',
      ],
      realWorldOutcome: [
        'Listed in 21 CFR 1308.13 as a Schedule III anabolic steroid, entry (81)',
        'Still used in some countries for non-severe aplastic anaemia and lower-risk myelodysplastic syndromes, on retrospective evidence',
        'Remains one of the most frequently detected substances in anti-doping analysis, with detection windows extended by the shift to N-glucuronide targets',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, 2 mg in the approved product; also an aqueous microcrystalline injectable suspension',
      description:
        'The approved United States product was a 2 mg oral tablet. The injectable form is an aqueous microcrystalline suspension rather than an oil solution, which is unusual among anabolic steroids and gives a shorter duration and a well-known injection-site reaction. Neither form is available through the lawful United States supply chain today.',
      safetyProfile:
        'Cholestatic drug-induced liver injury with a characteristic biochemical signature is the best-documented harm: marked bilirubin elevation with only mild transaminase rise and near-normal gamma-glutamyl transferase, at a mean of 55 days. Hepatocellular adenoma has been reported after long-term oral use, and the boxed warning carried by approved anabolic steroid labels describes peliosis hepatis and hepatic tumours that may be silent until intra-abdominal haemorrhage. Marked reduction in HDL cholesterol and suppression of endogenous testosterone and gonadotropins follow by class mechanism. It does not aromatise, so oestrogenic effects do not occur.',
    },
    commonQuestions: [
      {
        q: 'What was stanozolol actually approved for?',
        a: 'Winstrol was approved in the United States on 9 January 1962 as a 2 mg tablet, and the indication it carried longest was prevention of attacks in hereditary angioedema — a genetic deficiency of C1 esterase inhibitor that causes airway-threatening swelling. Androgens raise hepatic production of that protein, and before C1 inhibitor concentrates, kallikrein inhibitors and bradykinin receptor antagonists existed, this was one of the few options. It has also been used for aplastic anaemia and is still used in some countries for anaemia in lower-risk myelodysplastic syndromes. None of that is why most people look it up.',
      },
      {
        q: 'How would a doctor recognise stanozolol liver injury?',
        a: 'By an unusual combination. In the eighteen prospectively followed cases, every patient had a markedly raised total bilirubin and was jaundiced and itching, while the transaminases were only mildly up and gamma-glutamyl transferase — the enzyme that usually rises in cholestasis — was within or barely above normal. That pattern is uncommon enough to be a pointer. Median onset was 55 days after starting, so the drug is often the thing a patient stopped mentioning by the time they present.',
        auditNote:
          'Ten of the eighteen were also using other substances, which the authors report and which limits attribution in those cases.',
      },
      {
        q: 'Is it true that it does not cause oestrogen side effects?',
        a: 'Yes. The fused pyrazole ring makes it a poor substrate for aromatase, so no oestradiol is produced from the drug and the breast tissue growth and water retention associated with aromatisable steroids do not occur. That is a genuine property and it is often the reason it is chosen. It has no bearing at all on the harms this compound is actually documented to cause, which are hepatic and lipid-related, and it does not prevent the suppression of endogenous testosterone that follows from any androgen.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Nunes V et al. Stanozolol-induced liver injury: a distinctive cholestatic clinical and biochemical phenotype at presentation. J Clin Exp Hepatol 2025;15:102506',
        identifier: '10.1016/j.jceh.2025.102506',
        kind: 'doi',
      },
      {
        label:
          'Case report: hepatocellular adenoma due to long-term oral stanozolol administration. Front Med (Lausanne) 2025;12:1654316',
        identifier: '10.3389/fmed.2025.1654316',
        kind: 'doi',
      },
      {
        label:
          'Stanozolol-N-glucuronide metabolites in human urine samples as suitable targets in terms of routine anti-doping analysis. Drug Test Anal 2021;13:1668-1677',
        identifier: '10.1002/dta.3109',
        kind: 'doi',
      },
      {
        label:
          'Stanozolol for the treatment of anemic lower-risk myelodysplastic syndromes without del(5q) after failure of epoetin alfa: findings from a retrospective study. Ann Hematol 2021;100:1451-1457',
        identifier: '10.1007/s00277-021-04508-w',
        kind: 'doi',
      },
      {
        label:
          'openFDA Drugs@FDA — NDA 012885, WINSTROL (stanozolol) 2 mg tablet, original approval 9 January 1962, marketing status Discontinued',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=application_number:%22NDA012885%22',
        kind: 'regulatory',
      },
      {
        label:
          '21 CFR 1308.13(f) — Schedule III anabolic steroids, entry (81) stanozolol (17alpha-methyl-17beta-hydroxy-5alpha-androst-2-eno[3,2-c]-pyrazole)',
        identifier: 'https://www.ecfr.gov/current/title-21/chapter-II/part-1308/section-1308.13',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 25249 — stanozolol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/25249',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 11. Nandrolone decanoate
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'nandrolone-decanoate',
    name: 'Nandrolone Decanoate',
    tradeName: 'Deca-Durabolin',
    sponsor:
      'Originally Organon. United States generic applications were held by Watson Laboratories, Abraxis, Epic Pharma, Quad Pharmaceuticals and others',
    targetGene: 'AR',
    targetProtein: 'Androgen receptor; the parent 19-nortestosterone also binds the progesterone receptor',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    indication:
      'Approved in the United States for the management of the anaemia of renal insufficiency, where it was shown to increase haemoglobin and red cell mass. Every United States application is now listed Discontinued.',
    patientFriendlyIndication:
      'Anaemia of kidney failure — approved, and no longer marketed in the United States',
    anatomicalSite:
      'Androgen receptor in skeletal muscle myonuclei, bone and erythroid progenitors in bone marrow',
    conditionContext: {
      conditionExplainer:
        'Before recombinant erythropoietin, patients on dialysis were anaemic and the available treatment was an androgen that pushed the bone marrow to make more red cells. Nandrolone decanoate was one of the standards of care for that.',
      whyItMatters:
        'Erythropoietin made the indication obsolete, and the product disappeared from the American market. The molecule did not disappear: it remains the most recognisable injectable anabolic steroid in the world and one of the most frequently detected in anti-doping analysis.',
      whoTakesThis:
        'Historically, dialysis patients with anaemia and postmenopausal women with osteoporosis. Now, almost entirely people using it for muscle, and patients in the countries where it remains registered.',
      clinicalGoals:
        'In the approved indication, haemoglobin and red cell mass. In the osteoporosis trials, fracture incidence, bone mineral density and bone pain.',
    },
    oneSentenceVerdict:
      'The anabolic steroid with a genuine randomised fracture-reduction result in postmenopausal osteoporosis across seven small trials, an approved indication that erythropoietin made obsolete, and a metabolite that turns up in anti-doping laboratories more often than almost anything else.',
    laymanHowItWorks:
      'Nandrolone is testosterone with one carbon removed from the top of the steroid skeleton. That single change has two consequences that define the drug. The enzyme that normally amplifies testosterone in the prostate and scalp converts nandrolone instead into a weaker compound, so it is comparatively kind to the prostate and the hairline. And the resulting molecule looks enough like progesterone that it binds the progesterone receptor too, which is why it affects prolactin and libido in ways testosterone does not. The decanoate ester is a ten-carbon chain that makes one injection last weeks.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 55,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@]12CC[C@H]3[C@H]([C@@H]1CC[C@@H]2O)CCC4=CC(=O)CC[C@H]34',
      chemicalFormula: 'C18H26O2',
      molecularWeight:
        '274.4 g/mol for nandrolone (19-nortestosterone); the marketed drug is the decanoate ester, C28H44O3, 428.7 g/mol',
      targetReceptorAffinity:
        'Nandrolone is 19-nortestosterone: testosterone lacking the C19 methyl group. 5-alpha-reductase converts it to 5alpha-dihydronandrolone, which binds the androgen receptor more weakly than nandrolone itself — the reverse of what happens to testosterone, and the reason for its comparatively low androgenic profile in skin and prostate. It also has appreciable progesterone receptor affinity.',
      structureSource: {
        label:
          'PubChem CID 9904 (nandrolone) — canonical SMILES, molecular formula and molecular weight of the free steroid',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9904',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'nan-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Reference standard identity and ester chain length',
          description:
            'Establish which ester is present. Nandrolone circulates as the decanoate, the phenylpropionate and occasionally as the free steroid, and the ester determines the release profile and the interpretation of a blood concentration. Chain length is read directly from the accurate mass.',
          reagentsAndBuffer:
            'Certified nandrolone, nandrolone decanoate and nandrolone phenylpropionate reference standards, deuterated internal standards, 1H and 13C NMR in CDCl3, high-resolution accurate-mass ESI-MS, UV maximum near 240 nm from the enone',
        },
        {
          id: 'nan-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Content and sterility of an oil-based injectable',
          description:
            'Quantify the ester in the oil vehicle and assess the vehicle itself. For a licensed product this is routine release testing; for an underground preparation it answers whether the concentration on the label is real and whether the vial is sterile.',
          dependsOnStepId: 'nan-w1',
          reagentsAndBuffer:
            'Methanol or acetonitrile dilution of the oil phase, reversed-phase C18 HPLC with UV detection at 240 nm, gas chromatography with flame ionisation for the carrier oil and benzyl alcohol, membrane filtration bioburden and limulus amoebocyte lysate endotoxin testing',
        },
        {
          id: 'nan-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Urine preparation for 19-norandrosterone, and the threshold problem',
          description:
            'Anti-doping confirmation targets 19-norandrosterone rather than nandrolone. Because trace amounts can arise endogenously and from some meat and supplement sources, the analysis is threshold-based and requires isotope-ratio mass spectrometry to distinguish pharmaceutical from endogenous origin in borderline cases.',
          dependsOnStepId: 'nan-w2',
          reagentsAndBuffer:
            'Beta-glucuronidase hydrolysis in phosphate buffer pH 7.0, solid-phase extraction, MSTFA derivatisation for GC-MS/MS; high-performance liquid chromatography fraction collection ahead of gas chromatography combustion isotope ratio mass spectrometry',
        },
        {
          id: 'nan-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Androgen and progesterone receptor panel with 5-alpha-reductase co-incubation',
          description:
            'Read androgen and progesterone receptor activity, and repeat the androgen assay with 5-alpha-reductase present. For nandrolone this reverses the usual result: the reduced metabolite is less active than the parent, which is the mechanistic basis of its tissue profile and cannot be seen in an assay without the enzyme.',
          dependsOnStepId: 'nan-w3',
          reagentsAndBuffer:
            'AR and PR reporter cell lines with matched response-element luciferase constructs, recombinant SRD5A2 or a prostate-derived cell line expressing it, charcoal-stripped serum in phenol-red-free medium, dihydrotestosterone and progesterone as reference agonists',
        },
        {
          id: 'nan-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Ester quantification in dried blood spots and metabolite quantification in urine',
          description:
            'Quantify intact steroid esters in blood, which proves exogenous administration outright because an ester cannot be endogenous, and quantify 19-norandrosterone in urine against the reporting threshold. Dried blood spot methods for intact esters are the significant recent development in this area.',
          dependsOnStepId: 'nan-w4',
          reagentsAndBuffer:
            'Dried blood spot cards, methanolic extraction, LC-MS with multi-stage fragmentation for the intact ester; GC-MS/MS after trimethylsilyl derivatisation for 19-norandrosterone with a deuterated internal standard',
        },
      ],
    },
    keyAudits: [
      {
        id: 'nan-a1',
        category: 'measured',
        title: 'Seven randomised trials in postmenopausal osteoporosis reduced fracture risk',
        laymanSummary:
          'Pooling seven randomised trials in 293 postmenopausal women with osteoporosis, nandrolone decanoate reduced fractures, increased forearm bone mineral content, reduced pain and increased muscle mass. It also caused facial hair, acne and voice changes.',
        technicalDetails:
          'Camara et al. conducted a PRISMA-compliant systematic review and meta-analysis registered on PROSPERO (CRD420251147647), comparing nandrolone decanoate with placebo in postmenopausal women with primary osteoporosis. Seven trials with 293 participants were included, with sample sizes varying by outcome. Nandrolone reduced fracture risk with moderate-certainty evidence; produced modest increases in bone mineral density at low certainty and more substantial gains in forearm bone mineral content at moderate certainty; reduced pain and increased muscle mass, both at moderate certainty. It was associated with a higher incidence of mostly mild virilising adverse events — hirsutism, acne, voice changes — at low certainty. The authors note the small sample sizes and methodological limitations of the older trials. A fracture-reduction signal in a randomised comparison is a genuinely uncommon thing for a compound in this group to have.',
        evidenceSource: 'Camara LC et al., Cureus 2025;17:e98114 (PROSPERO CRD420251147647)',
        doi: '10.7759/cureus.98114',
        measuredMetric:
          'Fracture incidence, bone mineral density, forearm bone mineral content, pain and muscle mass versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'nan-a2',
        category: 'measured',
        title: 'The approved indication was anaemia of renal insufficiency, and the label says so',
        laymanSummary:
          'The United States label reads that nandrolone decanoate is indicated for the anaemia of kidney failure and has been shown to increase haemoglobin and red cell mass, with surgically anephric patients responding less well.',
        technicalDetails:
          'The nandrolone decanoate prescribing information states the indication as management of the anaemia of renal insufficiency, with the drug shown to increase haemoglobin and red cell mass, and notes that surgically induced anephric patients have been reported to be less responsive. That last clause is a mechanistic clue in itself: it points to a component of the effect that depends on residual renal erythropoietin production, which is exactly what recombinant erythropoietin later replaced. Contraindications listed include breast carcinoma in men, known or suspected prostate carcinoma, breast carcinoma in women with hypercalcaemia, pregnancy, and nephrosis or the nephrotic phase of nephritis.',
        evidenceSource:
          'Nandrolone decanoate injection prescribing information, Watson Laboratories, via DailyMed',
        measuredMetric: 'Approved indication text on the United States label',
        auditFlag: 'verified',
      },
      {
        id: 'nan-a3',
        category: 'measured',
        title: 'The same peliosis hepatis warning that the whole class carries',
        laymanSummary:
          'The label warns in capital letters about blood-filled cysts in the liver and about liver tumours, exactly as the oxandrolone label does.',
        technicalDetails:
          'The nandrolone decanoate label carries the class warning: peliosis hepatis, in which liver and sometimes splenic tissue is replaced with blood-filled cysts, has been reported in patients receiving androgenic anabolic steroid therapy; the cysts are sometimes present with minimal hepatic dysfunction and at other times associated with liver failure, and are often unrecognised until life-threatening liver failure or intra-abdominal haemorrhage develops. It is worth being precise about what this warning is and is not: it is a class warning applied to injectable and oral anabolic steroids alike, and the hepatotoxicity best documented in the recent clinical literature belongs to the 17alpha-alkylated orals. Nandrolone decanoate is not 17-alkylated.',
        evidenceSource:
          'Nandrolone decanoate injection prescribing information, Watson Laboratories, via DailyMed',
        measuredMetric: 'Warning text on the United States label',
        auditFlag: 'verified',
      },
      {
        id: 'nan-a4',
        category: 'conclusion_shift',
        title: 'Erythropoietin removed the indication, and the market removed the drug',
        laymanSummary:
          'Recombinant erythropoietin made an androgen unnecessary for dialysis anaemia. Every nandrolone decanoate product in the United States is now listed as discontinued.',
        technicalDetails:
          'Drugs@FDA lists a series of nandrolone decanoate applications — Watson Laboratories, Abraxis, Epic Pharma, Quad Pharmaceuticals and others — and every one carries the marketing status Discontinued. The clinical reason is not obscure: recombinant human erythropoietin, approved from 1989, treats the anaemia of renal insufficiency directly and without androgenic effects, and the guideline position moved with it. The consequence is the pattern this whole group repeats. A molecule with real randomised evidence in two indications is unavailable through pharmacies, while remaining one of the most widely used and most frequently detected compounds in unsupervised use.',
        evidenceSource:
          'openFDA Drugs@FDA — nandrolone decanoate applications ANDA086385, ANDA087519, ANDA088290 and others, all marketing status Discontinued',
        inferredClaim:
          'That withdrawal from the market implies a safety judgement, when here it followed the arrival of a better drug for the same indication',
        auditFlag: 'verified',
      },
      {
        id: 'nan-a5',
        category: 'measured',
        title: 'A small randomised trial in burn patients, published as a case for reinstatement',
        laymanSummary:
          'Forty burn patients were randomised to nandrolone decanoate or standard care in a study whose authors explicitly framed it as an argument for bringing the drug back.',
        technicalDetails:
          'Ali and Ali ran a prospective randomised controlled study in 40 patients with burns covering 20% to 40% of body surface, assessing both groups clinically and biochemically through to full recovery, with a recall safety assessment years later. The paper is titled as proposing a new potential indication after recall. Forty patients is a small trial, it was single-centre, and the framing is openly advocacy for an indication rather than a neutral test of one. It is included here because it is the only randomised burn evidence for this specific steroid, and because the reader should be able to see how thin it is next to the fourteen-trial, 2,822-patient oxandrolone base for the same clinical problem.',
        evidenceSource: 'Ali YH, Ali T, Burns 2022;48:59-68',
        doi: '10.1016/j.burns.2021.04.011',
        measuredMetric:
          'Clinical and laboratory course to full recovery in 40 patients with 20 to 40% burns',
        auditFlag: 'caution',
      },
      {
        id: 'nan-a6',
        category: 'inferred',
        title: '"Kind to the prostate" is a real mechanism with real limits',
        laymanSummary:
          'Nandrolone genuinely becomes weaker rather than stronger in tissues that carry 5-alpha-reductase, which is the reverse of testosterone. That explains a lower prostate and scalp effect and says nothing about the heart.',
        technicalDetails:
          'Testosterone is converted by 5-alpha-reductase into dihydrotestosterone, which binds the androgen receptor more strongly, amplifying androgenic effects in prostate and skin. Nandrolone is converted by the same enzyme into 5alpha-dihydronandrolone, which binds more weakly. That inversion is well established and it is the mechanistic basis for the drug\'s comparatively favourable prostate and scalp profile. It has no bearing on the cardiac literature, where rodent studies show adverse myocardial proteome changes and cardiac tissue effects when nandrolone is combined with resistance training, or on the profound and often prolonged suppression of the hypothalamic-pituitary-gonadal axis that follows a long-acting injectable androgen.',
        evidenceSource:
          'Steroids 2021;175:108916 on myocardial proteome; Steroids 2025;214:109559 on cardiac tissue with resistance training',
        doi: '10.1016/j.steroids.2021.108916',
        inferredClaim:
          'That a favourable prostate and scalp profile makes the compound broadly safer, when the documented concerns are cardiac and endocrine',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected as a long-chain ester, released over weeks',
        laymanDesc:
          'The decanoate is a ten-carbon fatty chain attached to the steroid. It sits in an oil depot in the muscle and releases slowly, so a single injection lasts weeks.',
        molecularDetail:
          'Nandrolone decanoate is dissolved in a vegetable oil vehicle and injected intramuscularly. Tissue esterases cleave the decanoate to release free nandrolone, with the long chain giving a terminal half-life measured in days to weeks. The phenylpropionate ester is the shorter-acting alternative.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters cells throughout the body',
        laymanDesc: 'The freed steroid diffuses into cells everywhere and reaches the receptor inside.',
        molecularDetail:
          'Passive membrane diffusion of free 19-nortestosterone; binding to the cytoplasmic androgen receptor with high affinity, and to the progesterone receptor with meaningful affinity.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Gets weaker, not stronger, where 5-alpha-reductase is present',
        laymanDesc:
          'In the prostate and scalp, the enzyme that makes testosterone more powerful makes nandrolone less powerful. That is the inversion the whole drug is built on.',
        molecularDetail:
          '5-alpha-reductase converts nandrolone to 5alpha-dihydronandrolone, which has lower androgen receptor affinity than the parent — the opposite of the testosterone-to-dihydrotestosterone conversion. Aromatisation to oestradiol occurs but at a much lower rate than for testosterone.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Muscle, bone and marrow respond; the gonadal axis and prolactin do too',
        laymanDesc:
          'Muscle and bone build, and the bone marrow makes more red cells. Meanwhile the brain stops signalling the testes, and the progesterone-like activity affects prolactin.',
        molecularDetail:
          'Androgen response element transactivation in myonuclei, osteoblasts and erythroid progenitors. Hypothalamic and pituitary androgen receptor agonism suppresses LH and FSH, and the long ester makes that suppression prolonged. Progesterone receptor agonism is the standard explanation for the prolactin and libido effects that distinguish this compound from testosterone.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fractures reduced in the osteoporosis trials, with virilisation',
        laymanDesc:
          'Across seven randomised trials in postmenopausal women it reduced fractures, increased forearm bone content and muscle, reduced pain, and caused hirsutism, acne and voice changes.',
        molecularDetail:
          'Moderate-certainty fracture reduction and pain reduction, moderate-certainty forearm bone mineral content and muscle mass gains, low-certainty bone mineral density gains, and low-certainty higher incidence of mostly mild virilising adverse events, across 293 randomised participants.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Camara 2025 meta-analysis of 7 randomised trials in postmenopausal osteoporosis',
        phase: 'Systematic review and meta-analysis of randomised controlled trials',
        sampleSize: 293,
        primaryEndpoint:
          'Fracture risk, bone mineral density, forearm bone mineral content, pain and muscle mass versus placebo',
        endpointMet: true,
        statisticalPValue:
          'Fracture reduction at moderate certainty; forearm bone mineral content gain at moderate certainty; bone mineral density gain at low certainty; pain reduction and muscle mass gain at moderate certainty',
        unreportedAdverseSignals:
          'Higher incidence of mostly mild virilising adverse events — hirsutism, acne, voice changes — at low certainty. Sample sizes were small and the constituent trials are old, which the authors flag as limiting.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Ali 2022 randomised controlled study in burn patients',
        phase: 'Prospective randomised controlled study, single centre',
        sampleSize: 40,
        primaryEndpoint:
          'Clinical and laboratory course through to full recovery in burns covering 20 to 40% of body surface',
        endpointMet: true,
        statisticalPValue:
          'Small single-centre trial reported as supporting a new indication; not powered for hard clinical outcomes',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Fracture risk reduced versus placebo across seven randomised trials and 293 postmenopausal women, at moderate certainty',
        'Forearm bone mineral content, muscle mass and pain all improved at moderate certainty in the same pooled analysis',
        'Higher incidence of mostly mild virilising adverse events in the treated arms',
        'An approved United States indication for the anaemia of renal insufficiency, with the label recording increased haemoglobin and red cell mass',
        'Every United States nandrolone decanoate application now carries the marketing status Discontinued',
      ],
      unsupportedInferences: [
        'That a favourable prostate and scalp profile implies broad safety, when the concerns documented for this compound are cardiac and endocrine',
        'That the osteoporosis fracture result, obtained in small old trials at doses used under medical supervision, describes what happens at the doses used for muscle',
        'That the peliosis hepatis class warning applies to this drug with the same force as to the 17alpha-alkylated orals, which it is not',
      ],
      whatFailedInitially: [
        'Its approved indication was made obsolete by recombinant erythropoietin, and every United States product was discontinued',
        'The randomised osteoporosis evidence consists of small, methodologically limited trials from a previous era and has never been repeated with modern methods',
      ],
      realWorldOutcome: [
        'Listed in 21 CFR 1308.13 as a Schedule III anabolic steroid, with nandrolone appearing among the named substances',
        'Its urinary metabolite 19-norandrosterone is one of the most frequently reported findings in anti-doping analysis, on a threshold basis with isotope-ratio confirmation for borderline cases',
        'Remains registered and prescribed in a number of countries outside the United States',
      ],
    },
    deliverySystem: {
      type: 'Oil-based intramuscular injection of the decanoate ester; 100 mg/mL and 200 mg/mL strengths in the approved products',
      description:
        'An oil solution injected intramuscularly, dosed at intervals of one to four weeks because of the long ester. The approved United States products were 100 mg/mL and 200 mg/mL. What circulates outside the supply chain is the same ester in an oil vehicle prepared without sterility assurance or content testing.',
      safetyProfile:
        'The label carries the class warning on peliosis hepatis and hepatic tumours, and contraindicates the drug in male breast or prostate carcinoma, in female breast carcinoma with hypercalcaemia, in pregnancy, and in nephrosis. In the osteoporosis trials the reported harms were mostly mild virilising effects: hirsutism, acne and voice change. By mechanism, a long-acting injectable androgen suppresses LH and FSH profoundly and for a prolonged period after the last dose. Rodent studies report adverse myocardial proteome changes and cardiac tissue effects when combined with strenuous resistance training. Progesterone receptor activity distinguishes its side effect profile from testosterone.',
    },
    commonQuestions: [
      {
        q: 'Does it really reduce fractures?',
        a: 'In the pooled randomised evidence, yes, at moderate certainty — which is a stronger statement than anything else on these pages can make. Seven trials totalling 293 postmenopausal women with primary osteoporosis found reduced fracture risk, larger gains in forearm bone mineral content than in areal bone mineral density, reduced pain and increased muscle mass. The caveats belong in the same sentence: the trials are small and old, the certainty grading is moderate rather than high, and the treated women more often developed hirsutism, acne and voice changes. Modern osteoporosis drugs were not the comparator, and no contemporary trial has repeated the comparison.',
      },
      {
        q: 'Why is it "safer for the prostate" than testosterone?',
        a: 'Because of an inversion that is genuinely unusual. Testosterone is converted by 5-alpha-reductase into dihydrotestosterone, which binds the androgen receptor more strongly — so testosterone is amplified in the prostate and scalp, where that enzyme is abundant. Nandrolone is converted by the same enzyme into 5alpha-dihydronandrolone, which binds more weakly. The tissues that amplify testosterone attenuate nandrolone. That is a real mechanism with a real consequence, and it applies to the prostate and the hairline. It does not apply to the heart, the lipid profile or the shutdown of the body\'s own testosterone.',
      },
      {
        q: 'Why can I not get it in the United States?',
        a: 'Because recombinant erythropoietin replaced it. Its approved indication was the anaemia of renal insufficiency, and from 1989 there was a drug that treated that anaemia directly, without androgenic effects and with better control. Every nandrolone decanoate application in Drugs@FDA now carries the marketing status Discontinued. This is a market withdrawal driven by a superior alternative rather than a safety action, and the drug remains registered in a number of other countries.',
      },
      {
        q: 'Why do laboratories look for 19-norandrosterone rather than nandrolone?',
        a: 'Because that metabolite is what survives long enough in urine to be found. It brings a complication with it: very small amounts can arise endogenously and from certain foods and supplements, so the test is threshold-based rather than simply present-or-absent, and borderline results are resolved with isotope-ratio mass spectrometry that distinguishes pharmaceutical carbon from the body\'s own. Newer methods measure the intact ester in dried blood spots, which settles the question outright, because an ester of a steroid cannot be made by a human body.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Camara LC et al. Nandrolone decanoate for postmenopausal osteoporosis: a systematic review and meta-analysis of randomized trials. Cureus 2025;17:e98114',
        identifier: '10.7759/cureus.98114',
        kind: 'doi',
      },
      {
        label:
          'Ali YH, Ali T. Nandrolone decanoate safely combats catabolism in burned patients: a new potential indication after recall. Burns 2022;48:59-68',
        identifier: '10.1016/j.burns.2021.04.011',
        kind: 'doi',
      },
      {
        label:
          'Nandrolone combined with strenuous resistance training impairs myocardial proteome profile of rats. Steroids 2021;175:108916',
        identifier: '10.1016/j.steroids.2021.108916',
        kind: 'doi',
      },
      {
        label:
          'The effect of resistance training and nandrolone decanoate administration on cardiac tissue in mice. Steroids 2025;214:109559',
        identifier: '10.1016/j.steroids.2024.109559',
        kind: 'doi',
      },
      {
        label:
          'Detection of anabolic androgenic steroids and steroid esters: comparing dried blood spot collection devices and urine samples. Drug Test Anal 2025;17:2374-2383',
        identifier: '10.1002/dta.3950',
        kind: 'doi',
      },
      {
        label:
          'Nandrolone decanoate injection prescribing information, Watson Laboratories — indication, contraindications and peliosis hepatis warning',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a586b484-1b46-40b9-9508-fd28002ad383',
        kind: 'regulatory',
      },
      {
        label: '21 CFR 1308.13(f) — Schedule III anabolic steroids, nandrolone among the named substances',
        identifier: 'https://www.ecfr.gov/current/title-21/chapter-II/part-1308/section-1308.13',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 9904 — nandrolone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9904',
        kind: 'url',
      },
    ],
  },
]
