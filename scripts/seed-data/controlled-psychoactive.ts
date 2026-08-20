import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — controlled and grey-market psychoactive substances.
 *
 * These are the drugs a reference work is most tempted to leave out and least able to justify
 * leaving out. Wikipedia, PubChem, DrugBank, the EMCDDA and every pharmacology textbook document
 * them; a drug reference that stops at the approved formulary is a formulary, not a reference. The
 * reader arriving here is an adult looking up a fact, and the page's job is to state what was
 * measured, by whom, in how many people, and where the measurement stops.
 *
 * Six conventions apply to the whole group.
 *
 * 1. NO PRICING BLOCK, ANYWHERE. `SeedPricing` needs a synthesis cost per dose with a citable
 *    source and a list price with another. For a substance with no legal market there is no list
 *    price — a street price is a survey artefact, not a published figure, and this file does not
 *    print numbers it cannot source. The substances here that DO have an approved product
 *    (diamorphine in the UK, cocaine hydrochloride topical solution, Desoxyn, Xyrem, Epidiolex)
 *    still carry no per-dose cost of production this file could verify line by line, so the field
 *    is absent everywhere rather than present for a subset and quietly meaning something different.
 *
 * 2. NO SYNTHESIS ROUTE, ANYWHERE. `laboratoryWorkflow` on these pages describes ANALYSIS —
 *    identification, purity assay, quantification in a biological matrix, receptor binding. That is
 *    the level of detail a forensic chemistry or a receptor-pharmacology paper carries and it is
 *    what a reader of this page needs. The `Synthesis` and `Purification` phases are deliberately
 *    unused for every scheduled substance in this file.
 *
 * 3. THE HARMS ARE STATED AS FINDINGS, NOT AS WARNINGS. Serotonergic axon loss, ketamine
 *    cystitis, MDMA hyponatraemia, the fatalities in the tianeptine and kratom case series, the
 *    respiratory depression of the nitazenes — each is written the way an efficacy result is
 *    written: the measurement, the sample, the citation. Moralising is not more protective than a
 *    number and it costs the page its usefulness.
 *
 * 4. THE MEASURED/INFERRED SPLIT RUNS THE OPPOSITE WAY FROM THE SUPPLEMENT PAGES. These molecules
 *    mostly have real, replicated receptor pharmacology and contested clinical claims. The
 *    'inferred' audits here are usually about therapeutic conclusions drawn from trials that could
 *    not be blinded, not about mechanisms nobody has demonstrated.
 *
 * 5. FUNCTIONAL UNBLINDING IS RECORDED AS A MEASUREMENT WHEREVER THE NUMBER EXISTS. A trial in
 *    which 100% of the drug arm and 10% of the placebo arm report perceptual changes has an
 *    integrity problem that the p-value does not describe. Where a paper published those rates,
 *    this file quotes them.
 *
 * 6. EVERY DOI, PMID, NCT NUMBER AND REGULATORY URL BELOW WAS RESOLVED at the time of writing —
 *    DOIs against the Crossref API, PMIDs against NCBI E-utilities, NCT numbers against the
 *    ClinicalTrials.gov v2 API, structures against the PubChem PUG REST `SMILES` property. Effect
 *    sizes, arm sizes, p-values and confidence intervals are copied from the published abstract or
 *    the regulatory document. Where a number could not be sourced the field is absent.
 */

const CSA_SCHEDULES_SOURCE = {
  label:
    'Controlled Substances Act schedules, 21 CFR 1308.11 (Schedule I) and 1308.12 (Schedule II), current eCFR text',
  identifier: 'https://www.ecfr.gov/current/title-21/chapter-II/part-1308/section-1308.11',
  kind: 'regulatory' as const,
}

export const CONTROLLED_PSYCHOACTIVE_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. LSD (lysergic acid diethylamide)
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lsd',
    name: 'LSD (Lysergic Acid Diethylamide)',
    tradeName: 'Delysid (Sandoz, 1947-1966); MM120 / lysergide D-tartrate in current trials',
    sponsor:
      'Originally Sandoz Ltd. Current clinical development by Mind Medicine (MindMed) as MM120 and by academic groups in Basel',
    targetGene: 'HTR2A',
    targetProtein: 'Serotonin 5-HT2A receptor (with activity at 5-HT1A, 5-HT2C and D2)',
    modality: 'Small Molecule',
    approvalStatus: 'Controlled / No Approved Use',
    indication:
      'No approved medical indication. Schedule I in the United States. Under investigation in phase 3 for generalised anxiety disorder and in phase 2 for anxiety associated with life-threatening illness',
    patientFriendlyIndication:
      'Nothing, legally, in the United States — it is a Schedule I drug. It is being tested in late-stage trials for generalised anxiety disorder',
    anatomicalSite:
      'Cortical layer V pyramidal neurons and thalamocortical circuits, via 5-HT2A receptors',
    conditionContext: {
      conditionExplainer:
        'Generalised anxiety disorder is persistent, hard-to-control worry lasting six months or more, rated on the Hamilton Anxiety Rating Scale. A score of 20 or above is moderate to severe, and the smallest change most clinicians treat as meaningful is 2.5 points.',
      whyItMatters:
        'The existing drugs are SSRIs, which take weeks and are stopped by a third of patients, and benzodiazepines, which work in an hour and cause dependence. A single-dose treatment with an effect lasting months would be a different category of thing, which is why the trials are being run.',
      whoTakesThis:
        'In trials: adults aged 18 to 74 with a primary diagnosis of generalised anxiety disorder and a HAM-A of at least 20. Outside trials there is no lawful medical route to it in the United States.',
      clinicalGoals:
        'A durable reduction in anxiety score from one supervised administration, with the drug given in a monitored session rather than taken daily.',
    },
    oneSentenceVerdict:
      'A 5-HT2A agonist with an unusually clean acute toxicology record, a real dose-response signal in a 198-patient phase 2b anxiety trial, and a blinding problem so complete that 100% of the top-dose arm knew what they had been given.',
    laymanHowItWorks:
      'LSD latches onto one particular serotonin receptor on nerve cells in the outer layer of the brain and switches it on. That receptor normally helps filter and organise incoming signals. With it over-stimulated, the filtering changes: sensory information arrives less sorted, and the sense of what is significant attaches to things it usually does not. Blocking that single receptor with another drug beforehand abolishes almost the entire experience, which is how the receptor was identified as the one that matters.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCN(CC)C(=O)[C@H]1CN([C@@H]2CC3=CNC4=CC=CC(=C34)C2=C1)C',
      chemicalFormula: 'C20H25N3O',
      molecularWeight:
        '323.4 g/mol (free base). Trial material is lysergide D-tartrate; doses are quoted as freebase equivalent',
      targetReceptorAffinity:
        'Partial to full agonist at 5-HT2A with nanomolar affinity; also binds 5-HT1A, 5-HT2C, 5-HT6, and dopamine D1/D2 receptors. The subjective effect is 5-HT2A-mediated: ketanserin pretreatment abolishes it.',
      structureSource: {
        label: 'PubChem CID 5761 (lysergide) — SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5761',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lsd-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Presumptive colour test and immunoassay screen',
          description:
            'A seized or clinical sample is screened before any instrumental work. Ergoline alkaloids give a characteristic response to the Ehrlich reagent, and LSD-specific immunoassays are used on urine. Both are presumptive only: neither distinguishes LSD from other ergolines and neither is admissible as an identification on its own.',
          reagentsAndBuffer:
            'Ehrlich reagent (p-dimethylaminobenzaldehyde in acid), ELISA or homogeneous enzyme immunoassay kit with an LSD antibody, negative and positive control urine',
        },
        {
          id: 'lsd-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Confirmatory identification by LC-MS/MS against a certified reference standard',
          description:
            'The screen is confirmed against a certified reference material by retention time and at least two multiple-reaction-monitoring transitions. LSD is thermolabile and fluoresces, so liquid chromatography is preferred over GC-MS, which degrades it in the injection port. Doses are in the tens of micrograms, so the working range sits three orders of magnitude below a typical stimulant assay.',
          dependsOnStepId: 'lsd-w1',
          reagentsAndBuffer:
            'LSD certified reference standard and LSD-d3 internal standard, C18 reversed-phase column, ammonium formate/acetonitrile gradient, electrospray positive ionisation, MRM transitions m/z 324 to 223 and 324 to 208',
        },
        {
          id: 'lsd-w3',
          stepNumber: 3,
          phase: 'Cellular_Delivery',
          name: 'Heterologous 5-HT2A expression for receptor work',
          description:
            'Human HTR2A is expressed in a cell line that does not carry the receptor natively, so that any signal measured can be attributed to 5-HT2A rather than to a related serotonin receptor present in brain tissue.',
          dependsOnStepId: 'lsd-w2',
          reagentsAndBuffer:
            'HEK293 or CHO cells, human HTR2A expression plasmid, lipid transfection reagent, DMEM with 10% fetal bovine serum and antibiotic selection',
        },
        {
          id: 'lsd-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Radioligand binding and functional signalling',
          description:
            'Competition binding against a labelled 5-HT2A ligand gives affinity; an inositol phosphate accumulation or calcium mobilisation assay gives efficacy, which is the number that separates a full agonist from a partial one. Running the same series against 5-HT2C and 5-HT1A records selectivity instead of assuming it.',
          dependsOnStepId: 'lsd-w3',
          reagentsAndBuffer:
            '[3H]-ketanserin or [125I]-DOI as 5-HT2A radioligand, unlabelled ketanserin for non-specific binding, Tris-HCl assay buffer with ascorbate, IP-One HTRF or Fluo-4 calcium kit, glass-fibre filter harvest and scintillation counting',
        },
        {
          id: 'lsd-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Plasma pharmacokinetics at picogram sensitivity',
          description:
            'Quantify LSD and its main metabolite 2-oxo-3-hydroxy-LSD in plasma across a session. The parent compound peaks at low nanogram-per-millilitre concentrations after a 100 to 200 microgram dose, so the assay has to be validated down to single-digit picograms per millilitre and samples protected from light.',
          dependsOnStepId: 'lsd-w2',
          reagentsAndBuffer:
            'Amber tubes, protein precipitation or solid-phase extraction, LSD-d3 internal standard, UHPLC-MS/MS with a validated lower limit of quantification in the low pg/mL range',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lsd-a1',
        category: 'measured',
        title: 'Phase 2b in 198 adults: a real dose-response on HAM-A at four weeks',
        laymanSummary:
          'In the largest modern LSD trial, one dose cut anxiety scores by five to six points more than placebo a month later — but only at the two highest doses. The two low doses did nothing.',
        technicalDetails:
          'Multicentre, double-blind, placebo-controlled phase 2b at 22 US outpatient sites, August 2022 to August 2023. 198 adults with primary GAD and HAM-A at least 20 were randomised to a single freebase-equivalent dose of 25 µg (n=39), 50 µg (n=40), 100 µg (n=40), 200 µg (n=40) or placebo (n=39); 194 formed the full analysis set. The primary outcome was the dose-response relationship for HAM-A change at week 4 by MCP-Mod. Least-squares mean difference versus placebo was -5.0 points (95% CI -9.6 to -0.4) at 100 µg and -6.0 (95% CI -9.8 to -2.0) at 200 µg; 25 µg gave -1.2 (95% CI -6.0 to 3.5) and 50 µg gave -1.8 (95% CI -7.6 to 4.0), neither reaching significance. The pre-specified minimal clinically important difference was 2.5 points. Endpoint ratings were made by independent central raters blinded to protocol, allocation and visit date.',
        evidenceSource:
          'Robison R et al. Single Treatment With MM120 (Lysergide) in Generalized Anxiety Disorder. JAMA 2025;334:1358-1372 (NCT05407064)',
        doi: '10.1001/jama.2025.13481',
        measuredMetric: 'Change in Hamilton Anxiety Rating Scale score at 4 weeks, MCP-Mod',
        auditFlag: 'verified',
      },
      {
        id: 'lsd-a2',
        category: 'inferred',
        title: 'The blind did not hold, and the trial reported the numbers that prove it',
        laymanSummary:
          'Everyone in the 200 microgram group noticed visual changes. One in ten of the placebo group did. Whatever else the trial measured, it did not measure a blinded comparison.',
        technicalDetails:
          'Visual perceptual changes — illusion, pseudo-hallucination, visual hallucination — were recorded in 46.2% at 25 µg, 75.0% at 50 µg, 92.5% at 100 µg, 100% at 200 µg and 10.3% on placebo. Nausea ran 7.7 / 27.5 / 40.0 / 60.0 / 7.7 percent across the same arms. A participant experiencing a 12-hour perceptual event has been unblinded by the drug itself, and expectancy about that event is not separable from the pharmacological effect on a self- and clinician-rated anxiety scale. Central independent raters blinded to visit date reduce but do not remove the problem, because the participant supplies the ratings. This is a limitation of design, not a defect of conduct, and it applies to every psychedelic efficacy trial in this file.',
        evidenceSource: 'Robison R et al., JAMA 2025;334:1358-1372, adverse-event table',
        doi: '10.1001/jama.2025.13481',
        inferredClaim:
          'That the four-week HAM-A separation is a pharmacological effect on anxiety rather than a pharmacological effect plus an expectancy effect that the design cannot separate from it',
        auditFlag: 'caution',
      },
      {
        id: 'lsd-a3',
        category: 'measured',
        title: 'Blocking one receptor abolishes the experience',
        laymanSummary:
          'Give people a drug that plugs the 5-HT2A receptor before giving them LSD, and almost the entire LSD experience does not happen. That is how the receptor was pinned down.',
        technicalDetails:
          'Preller et al. ran a double-blind, randomised, counterbalanced, cross-over study in 24 healthy participants with three conditions: placebo, LSD 100 µg, and LSD 100 µg preceded by the selective 5-HT2A antagonist ketanserin. Ketanserin pretreatment normalised the LSD-induced attribution of personal relevance to previously meaningless stimuli and blocked the subjective drug effects, alongside the associated changes in cortical connectivity. The design is the reason 5-HT2A is described as necessary rather than merely correlated: the antagonist is the manipulation.',
        evidenceSource: 'Preller KH et al., Curr Biol 2017;27:451-457',
        doi: '10.1016/j.cub.2016.12.030',
        measuredMetric:
          'Subjective drug effect and personal-relevance attribution under LSD with and without ketanserin pretreatment',
        auditFlag: 'verified',
      },
      {
        id: 'lsd-a4',
        category: 'measured',
        title: 'Crossover phase 2 in 42 patients: anxiety down 16 STAI points at 16 weeks',
        laymanSummary:
          'A Swiss trial gave 200 microgram doses to people with severe anxiety and found their scores were still substantially lower four months later.',
        technicalDetails:
          'Investigator-initiated two-centre, double-blind, placebo-controlled, two-period random-order crossover trial, two sessions of oral LSD 200 µg or placebo per period, in 42 patients with anxiety with or without a life-threatening illness. Primary endpoint was the Spielberger State-Trait Anxiety Inventory global score 16 weeks after the last session. Between-subjects first-period analysis is the one reported, because of carryover: least-squares mean change-from-baseline difference -16.2 (SE 5.8), 95% CI -27.8 to -4.5, d = -1.18, p = 0.007. HAM-D-21 fell by -7.0 (95% CI -10.8 to -3.2, d = -1.1, p = 0.0004) and BDI by -6.1 (95% CI -11.4 to -0.9, d = -0.72, p = 0.02). Eight patients (19%) had transient mild acute untoward effects; one treatment-related serious adverse event, an episode of acute transient anxiety (2%).',
        evidenceSource: 'Holze F et al., Biol Psychiatry 2023;93:215-223',
        doi: '10.1016/j.biopsych.2022.08.025',
        measuredMetric: 'STAI-Global score 16 weeks after the last treatment session',
        auditFlag: 'verified',
      },
      {
        id: 'lsd-a5',
        category: 'measured',
        title: 'Massive accidental overdose: eight people, all survived',
        laymanSummary:
          'Eight people snorted pure LSD powder by mistake and were treated within fifteen minutes. They had coma, dangerous fever, respiratory arrest and bleeding — and every one of them recovered.',
        technicalDetails:
          'Klock, Boerner and Becker described eight patients seen within 15 minutes of intranasal self-administration of large amounts of pure LSD tartrate powder. Presentation was emesis and collapse with sympathetic overactivity, hyperthermia, coma and respiratory arrest; mild generalised bleeding occurred in several and platelet dysfunction was demonstrable in all. Serum LSD tartrate ranged 2.1 to 26 ng/mL and gastric content 1,000 to 7,000 µg per 100 mL — roughly three orders of magnitude above a recreational dose. All recovered with supportive care. The case series is the reason the pharmacology literature describes LSD as having a very high therapeutic index for acute lethality; it says nothing about behavioural risk during intoxication, which is where the documented deaths come from.',
        evidenceSource:
          'Klock JC, Boerner U, Becker CE. Coma, hyperthermia and bleeding associated with massive LSD overdose: a report of eight cases. West J Med 1974;120:183-188; also Clin Toxicol 1975;8:191-203',
        doi: '10.3109/15563657508988063',
        measuredMetric: 'Serum and gastric LSD tartrate concentration with clinical outcome, n=8',
        auditFlag: 'verified',
      },
      {
        id: 'lsd-a6',
        category: 'conclusion_shift',
        title: 'Marketed 1947, banned 1970, in phase 3 in 2026 — the same molecule throughout',
        laymanSummary:
          'Sandoz sold LSD to psychiatrists as Delysid for nineteen years. The US then put it in the strictest schedule, defined as having no accepted medical use. It is now in phase 3 trials for anxiety.',
        technicalDetails:
          'Sandoz distributed LSD as Delysid from 1947 and withdrew it in 1966. The Controlled Substances Act of 1970 placed lysergic acid diethylamide in Schedule I, a category defined by high abuse potential, no currently accepted medical use in the United States, and a lack of accepted safety for use under medical supervision — the finding that makes prescription impossible regardless of trial results. As of 2026 the same molecule is in three active phase 3 programmes registered on ClinicalTrials.gov (Panorama NCT06809595, n=245, GAD; Voyage NCT06741228, n=214, GAD; Emerge NCT06941844, n=149, MDD). Schedule I status is not a scientific verdict that has been overturned; it is an administrative finding that has not yet been revisited, and rescheduling requires a separate HHS and DEA process that a positive phase 3 does not automatically trigger.',
        evidenceSource:
          '21 CFR 1308.11(d); ClinicalTrials.gov NCT06809595, NCT06741228, NCT06941844',
        measuredMetric:
          'Regulatory classification versus current clinical trial phase for the same molecule',
        auditFlag: 'contested',
      },
      {
        id: 'lsd-a7',
        category: 'inferred',
        title: 'A 12-patient pilot is quoted as evidence far beyond what 12 patients can carry',
        laymanSummary:
          'The 2014 study that restarted LSD research had twelve people in it, four of whom knew they were on the low dose. It is a pilot, and it is often cited as if it were a result.',
        technicalDetails:
          'Gasser et al. randomised 12 patients with anxiety associated with life-threatening disease to LSD 200 µg (n=8) or an active placebo of LSD 20 µg (n=4), the latter with open-label crossover to 200 µg after unmasking. At two months STAI trait anxiety showed a positive trend (p=0.033, d=1.1) and state anxiety fell significantly (p=0.021, d=1.2), sustained at 12 months. No serious treatment-related adverse events. With four participants in the comparator arm, and that arm unmasked and crossed over, the trial establishes feasibility and acute safety in a monitored setting. It does not establish an effect size, and the effect sizes it reports have wide, unstated uncertainty.',
        evidenceSource: 'Gasser P et al., J Nerv Ment Dis 2014;202:513-520',
        doi: '10.1097/NMD.0000000000000113',
        inferredClaim:
          'That a 12-patient pilot with a 4-patient comparator arm supports an effect-size estimate, rather than only the feasibility and acute-safety conclusion its authors drew',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Taken by mouth in microgram amounts',
        laymanDesc:
          'Active doses are measured in millionths of a gram — a hundredth of the mass of a typical painkiller tablet. Effects begin in about half an hour and last most of a day.',
        molecularDetail:
          'Oral administration of 25 to 200 µg freebase equivalent. Peak plasma concentration is in the low nanogram-per-millilitre range, reached at roughly 1.5 hours, with subjective effects lasting 8 to 12 hours in a dose-dependent way.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Crosses into the brain and reaches the cortex',
        laymanDesc:
          'The molecule passes easily out of the blood into brain tissue and reaches the outer layers where most of the target receptors sit.',
        molecularDetail:
          'Lipophilic ergoline; distributes into the central nervous system and reaches 5-HT2A-dense regions including layer V of the neocortex, the claustrum and thalamic nuclei. Metabolised principally by CYP enzymes to 2-oxo-3-hydroxy-LSD, the analytical target in delayed urine sampling.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binds and activates the 5-HT2A receptor',
        laymanDesc:
          'It locks into a serotonin receptor and switches it on. Because a lid of the receptor closes over the molecule, it stays bound for hours rather than minutes.',
        molecularDetail:
          'Agonist at 5-HT2A with nanomolar affinity; crystallographic work shows an extracellular loop closing over the bound ligand, which is the structural correlate of the unusually slow off-rate and the long duration. Also engages 5-HT1A, 5-HT2C and dopamine receptors, which contribute to the autonomic profile.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Cortical signal filtering changes',
        laymanDesc:
          'The receptor sits on cells that help decide which incoming signals matter. Over-stimulating it changes what the brain treats as significant.',
        molecularDetail:
          'Gq-coupled signalling in layer V pyramidal neurons increases glutamatergic drive and desynchronises thalamocortical gating. Preller et al. showed the LSD-induced attribution of personal relevance to neutral stimuli, and the accompanying connectivity changes, are abolished by ketanserin.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Anxiety scores fall, in trials, for weeks afterwards',
        laymanDesc:
          'In the trials, anxiety ratings a month or four months later are lower than after placebo. Nobody has isolated how a single day-long experience produces a change that outlasts the drug.',
        molecularDetail:
          'The measured endpoint is a rating scale — HAM-A at 4 weeks in the phase 2b, STAI-G at 16 weeks in the Basel crossover. The drug is undetectable long before either timepoint. Persistence is a real observation in search of a mechanism; candidate explanations involving 5-HT2A-driven structural plasticity are preclinical and not established in humans.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT05407064 (MM120 phase 2b, generalised anxiety disorder)',
        phase: 'Phase 2b dose-finding',
        sampleSize: 198,
        primaryEndpoint:
          'Dose-response relationship for change in HAM-A total score at week 4, by MCP-Mod',
        endpointMet: true,
        statisticalPValue:
          'Significant dose-response at 100 µg (LSMD -5.0, 95% CI -9.6 to -0.4) and 200 µg (LSMD -6.0, 95% CI -9.8 to -2.0); not significant at 25 µg or 50 µg',
        unreportedAdverseSignals:
          'Visual perceptual changes in 92.5% at 100 µg and 100% at 200 µg versus 10.3% on placebo — a functional unblinding rate the efficacy analysis cannot adjust for.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Basel LSD-assisted therapy crossover (Holze et al. 2023)',
        phase: 'Phase 2 randomised crossover',
        sampleSize: 42,
        primaryEndpoint: 'STAI-Global anxiety score 16 weeks after the last treatment session',
        endpointMet: true,
        statisticalPValue: 'LSMD -16.2 (SE 5.8), 95% CI -27.8 to -4.5, d = -1.18, p = 0.007',
        unreportedAdverseSignals:
          'One treatment-related serious adverse event (acute transient anxiety, 2%); transient mild acute untoward effects in 8 of 42 (19%). Carryover between periods forced the primary analysis onto the first period alone.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Gasser et al. 2014 pilot (anxiety with life-threatening illness)',
        phase: 'Phase 2 pilot, active-placebo controlled',
        sampleSize: 12,
        primaryEndpoint: 'STAI state and trait anxiety at 2 months',
        endpointMet: true,
        statisticalPValue: 'State anxiety p = 0.021 (d = 1.2); trait anxiety p = 0.033 (d = 1.1)',
        unreportedAdverseSignals:
          'No acute or chronic adverse effects persisting beyond one day and no treatment-related serious adverse events, in a sample of 12.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A statistically significant dose-response for HAM-A change at 4 weeks in 194 analysed adults, at 100 µg and 200 µg but not at 25 µg or 50 µg',
        'A 16.2-point STAI-Global reduction versus placebo 16 weeks after dosing in a 42-patient crossover trial',
        'Abolition of the subjective effect and of the personal-relevance attribution by ketanserin pretreatment in 24 healthy participants',
        'Survival of all eight patients in the only published massive-overdose series, at serum concentrations roughly a thousand-fold above recreational',
      ],
      unsupportedInferences: [
        'That the four-week anxiety separation is purely pharmacological, when 100% of the top-dose arm and 10% of placebo reported perceptual changes',
        'That a 12-patient pilot with a four-patient comparator arm supports an effect-size estimate rather than feasibility',
        'That an acute-toxicity profile with no reported lethal dose in the overdose series means the drug carries no risk — the documented deaths are behavioural and cardiovascular, not overdose',
        'That positive phase 3 results would reschedule the drug; rescheduling is a separate HHS and DEA administrative process',
      ],
      whatFailedInitially: [
        'The 25 µg and 50 µg arms of the phase 2b both failed to separate from placebo, which is what makes the higher-dose result a dose-response rather than a class effect',
        'Carryover in the Basel crossover forced abandonment of the planned within-subject analysis in favour of the first period alone',
      ],
      realWorldOutcome: [
        'Three phase 3 trials are active as of 2026, two in generalised anxiety disorder and one in major depressive disorder',
        'Schedule I status is unchanged; there is no lawful prescribing route in the United States and expanded access is limited to registered trials',
      ],
    },
    deliverySystem: {
      type: 'Oral solution or tablet, single supervised dose in a monitored session',
      description:
        'In trials the drug is given once, in a session lasting most of a day, with two monitors present throughout and structured preparation and integration visits around it. The delivery system is as much the room and the monitors as it is the tablet, and no trial has tested the drug without them.',
      safetyProfile:
        'Acute effects last 8 to 12 hours and include marked perceptual change, transient anxiety, nausea, mydriasis, raised blood pressure and heart rate. In the phase 2b, nausea reached 60% at 200 µg and headache 27.5%. The published massive-overdose series recorded hyperthermia, coma, respiratory arrest and platelet dysfunction with full recovery in all eight patients. Hallucinogen persisting perception disorder is a recognised DSM-5 diagnosis following hallucinogen use; its incidence is not established. LSD is not associated with a physical withdrawal syndrome. Serotonergic and 5-HT2A-active co-medication, uncontrolled hypertension and personal or family history of psychosis are the standard trial exclusions.',
    },
    commonQuestions: [
      {
        q: 'If the phase 2b worked, why is it still Schedule I?',
        a: 'Because those decisions are made by different processes. Schedule I is an administrative finding under the Controlled Substances Act that a substance has no currently accepted medical use in the United States. It is not automatically revisited when a trial reads out. Rescheduling requires a formal petition, an HHS scientific and medical evaluation, and a DEA rulemaking — the route psilocybin and MDMA are also on. Approval of a specific product by the FDA is a normal trigger for that process, but it is a separate step, and the phase 3 programmes are not finished.',
      },
      {
        q: 'Can a trial of a drug this obvious ever really be blinded?',
        a: 'Not in the ordinary sense, and the phase 2b published the numbers that show it: perceptual changes in 100% of the 200 microgram arm against 10.3% on placebo. Trials mitigate this — central raters blinded to allocation and to visit date, active low-dose comparators, pre-specified analysis — but they cannot remove it, because the participant supplies the anxiety rating and the participant knows. This is the single largest interpretive caveat on every psychedelic efficacy result, and it applies equally to the psilocybin and MDMA pages on this site.',
        auditNote:
          'The low-dose arms are the useful control here. If expectancy alone drove the result, 25 µg — where 46% still noticed perceptual changes — should have separated from placebo. It did not.',
      },
      {
        q: 'How toxic is it?',
        a: 'Acutely, in the one published series of massive accidental overdose, eight people took a dose roughly a thousand times recreational, arrived with coma, hyperthermia, respiratory arrest and platelet dysfunction, and all eight survived with supportive care. That is the basis for the standard pharmacology-textbook statement that the acute lethal dose in humans is not established. It is a statement about acute toxicology and nothing else: the harms that actually appear in the literature are behavioural injury during a 12-hour intoxication, persistent perceptual disturbance, and precipitation of psychosis in people predisposed to it.',
      },
      {
        q: 'Why does this page show no price?',
        a: 'Because there is no published price to show. LSD has no legal market and therefore no list price, no acquisition cost and no reimbursement rate. A street price is a survey estimate of what people report paying, not a published figure, and this site does not print numbers it cannot source to a document. Trial material is manufactured to GMP by the sponsor and its cost is not disclosed.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Robison R et al. Single Treatment With MM120 (Lysergide) in Generalized Anxiety Disorder: A Randomized Clinical Trial. JAMA 2025;334:1358-1372',
        identifier: '10.1001/jama.2025.13481',
        kind: 'doi',
      },
      {
        label:
          'Holze F et al. Lysergic Acid Diethylamide-Assisted Therapy in Patients With Anxiety With and Without a Life-Threatening Illness. Biol Psychiatry 2023;93:215-223',
        identifier: '10.1016/j.biopsych.2022.08.025',
        kind: 'doi',
      },
      {
        label:
          'Gasser P et al. Safety and efficacy of lysergic acid diethylamide-assisted psychotherapy for anxiety associated with life-threatening diseases. J Nerv Ment Dis 2014;202:513-520',
        identifier: '10.1097/NMD.0000000000000113',
        kind: 'doi',
      },
      {
        label:
          'Preller KH et al. The Fabric of Meaning and Subjective Effects in LSD-Induced States Depend on Serotonin 2A Receptor Activation. Curr Biol 2017;27:451-457',
        identifier: '10.1016/j.cub.2016.12.030',
        kind: 'doi',
      },
      {
        label:
          'Klock JC, Boerner U, Becker CE. Coma, hyperthermia and bleeding associated with massive LSD overdose: a report of eight cases. Clin Toxicol 1975;8:191-203',
        identifier: '10.3109/15563657508988063',
        kind: 'doi',
      },
      {
        label: 'Nichols DE. Psychedelics. Pharmacol Rev 2016;68:264-355',
        identifier: '10.1124/pr.115.011478',
        kind: 'doi',
      },
      {
        label: 'ClinicalTrials.gov NCT05407064 — MM120 phase 2b in generalised anxiety disorder',
        identifier: 'NCT05407064',
        kind: 'nct',
      },
      {
        label: 'ClinicalTrials.gov NCT06809595 — Panorama, phase 3 MM120 in GAD',
        identifier: 'NCT06809595',
        kind: 'nct',
      },
      {
        label: 'ClinicalTrials.gov NCT06741228 — Voyage, phase 3 MM120 in GAD',
        identifier: 'NCT06741228',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 5761 — lysergide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5761',
        kind: 'url',
      },
      CSA_SCHEDULES_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 2. Psilocybin
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'psilocybin',
    name: 'Psilocybin',
    tradeName: 'COMP360 (COMPASS Pathways synthetic formulation); no marketed product',
    sponsor:
      'COMPASS Pathways (COMP360), Usona Institute, Imperial College London and Johns Hopkins. No commercial sponsor holds an approval',
    targetGene: 'HTR2A',
    targetProtein:
      'Serotonin 5-HT2A receptor — engaged by psilocin, the dephosphorylated active metabolite',
    modality: 'Small Molecule',
    approvalStatus: 'Controlled / No Approved Use',
    indication:
      'No approved medical indication. Schedule I in the United States. Phase 3 in treatment-resistant depression; phase 2 completed in major depressive disorder and in cancer-related depression and anxiety. Lawfully administered outside the FDA route only in Oregon and Colorado state-regulated supervised-use programmes',
    patientFriendlyIndication:
      'Nothing approved. Tested for depression that has not responded to other treatments, and for depression and anxiety in people with cancer',
    anatomicalSite:
      'Cortical 5-HT2A receptors, with the largest reported functional changes in the default mode network',
    conditionContext: {
      conditionExplainer:
        'Treatment-resistant depression means a current depressive episode that has failed at least two adequate courses of antidepressant. The trials rate it on the Montgomery-Asberg Depression Rating Scale, where 0 is no symptoms and 60 is the maximum, and entry scores average around 32.',
      whyItMatters:
        'Roughly a third of people with major depression reach this category, and the licensed options narrow sharply — augmentation, esketamine, electroconvulsive therapy. A single supervised dose with an effect lasting weeks would change the shape of that decision, which is why three phase 3 trials are running.',
      whoTakesThis:
        'In trials: adults with treatment-resistant depression or with major depressive disorder, screened out for personal or family history of psychosis or mania and for active suicidal intent. In Oregon and Colorado, adults aged 21 and over may take psilocybin at a licensed service centre with a trained facilitator; that is a supervised-use programme under state law, not a prescription and not a medical treatment.',
      clinicalGoals:
        'A reduction in MADRS score sustained for weeks after one or two administrations, without a daily medication.',
    },
    oneSentenceVerdict:
      'The most heavily trialled classic psychedelic, with a clean 25 mg versus 1 mg dose separation in 233 patients, a JAMA trial showing a 12-point MADRS advantage over niacin, and a head-to-head against escitalopram whose primary endpoint it did not win.',
    laymanHowItWorks:
      'Psilocybin itself does almost nothing. An enzyme in the gut wall and liver strips a phosphate group off it within minutes, and the product — psilocin — is the molecule that acts. Psilocin switches on the same serotonin receptor LSD does, mostly on cells in the outer layer of the brain, and the networks that normally keep the brain organised into stable, habitual patterns become temporarily less rigid. The lasting change in mood scores that some trials find weeks later is not explained by that; the drug is gone within a day.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 64,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(C)CCC1=CNC2=C1C(=CC=C2)OP(=O)(O)O',
      chemicalFormula: 'C12H17N2O4P',
      molecularWeight:
        '284.25 g/mol. Psilocybin is a prodrug: alkaline phosphatase removes the 4-phosphate to give psilocin, C12H16N2O, 204.27 g/mol, PubChem CID 4980',
      targetReceptorAffinity:
        'Psilocybin has negligible affinity at 5-HT2A. Psilocin is the active species, an agonist at 5-HT2A with additional activity at 5-HT1A and 5-HT2C. Ketanserin pretreatment attenuates the subjective effect, as with LSD.',
      structureSource: {
        label: 'PubChem CID 10624 (psilocybin) — SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/10624',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'psi-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identification in mushroom material or a formulated capsule',
          description:
            'Fungal material is a matrix problem, not a chemistry problem: psilocybin sits alongside psilocin, baeocystin and norbaeocystin, and the ratio between them shifts with drying and storage. Extraction is into aqueous methanol with the sample kept cold and dark, then identification against certified reference standards. A GMP capsule is far simpler and is assayed as a single synthetic entity.',
          reagentsAndBuffer:
            'Psilocybin and psilocin certified reference standards, 75:25 methanol/water extraction with sonication, 0.45 µm filtration, amber vials, storage at -20 °C',
        },
        {
          id: 'psi-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Purity and content assay by HPLC-UV or LC-MS/MS',
          description:
            'Psilocybin is a zwitterion and does not chromatograph well on plain reversed phase, so ion-pairing or a polar-embedded stationary phase is used. Content uniformity for clinical material is the assay that matters: the difference between a 25 mg and a 10 mg arm in the phase 2b was the difference between a significant and a non-significant result.',
          dependsOnStepId: 'psi-w1',
          reagentsAndBuffer:
            'C18 or biphenyl column, ammonium formate buffer at pH 3.5 with acetonitrile gradient, UV detection at 267 nm, or ESI-positive MRM transitions m/z 285 to 205 for psilocybin and 205 to 58 for psilocin',
        },
        {
          id: 'psi-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'Plasma pharmacokinetics of psilocin after enzymatic hydrolysis',
          description:
            'Psilocybin is essentially undetectable in plasma after an oral dose because conversion is near-complete on first pass, so the analyte is psilocin — and most circulating psilocin is glucuronidated. Total psilocin therefore requires beta-glucuronidase hydrolysis before extraction, and reporting free versus total psilocin without saying which was measured is the commonest error in this literature.',
          dependsOnStepId: 'psi-w2',
          reagentsAndBuffer:
            'Beta-glucuronidase from Helix pomatia in ammonium acetate buffer pH 5.0, psilocin-d10 internal standard, solid-phase extraction, UHPLC-MS/MS',
        },
        {
          id: 'psi-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Heterologous 5-HT2A expression for receptor work',
          description:
            'Human HTR2A expressed in a cell line lacking the native receptor, so that binding and signalling can be attributed to 5-HT2A rather than to another serotonin receptor subtype.',
          dependsOnStepId: 'psi-w2',
          reagentsAndBuffer:
            'HEK293 or CHO cells, human HTR2A expression plasmid, lipid transfection reagent, DMEM with 10% fetal bovine serum and selection antibiotic',
        },
        {
          id: 'psi-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Radioligand binding and functional efficacy for psilocybin against psilocin',
          description:
            'Run the parent and the metabolite side by side in the same competition-binding and calcium-mobilisation assays. The result — orders-of-magnitude weaker binding for psilocybin — is the experimental basis for calling it a prodrug rather than a drug, and it is why oral bioavailability and phosphatase activity, not receptor affinity, set the dose.',
          dependsOnStepId: 'psi-w4',
          reagentsAndBuffer:
            '[3H]-ketanserin as 5-HT2A radioligand, unlabelled ketanserin for non-specific binding, Tris-HCl buffer with ascorbate, Fluo-4 calcium assay or IP-One HTRF, glass-fibre filter harvest and scintillation counting',
        },
      ],
    },
    keyAudits: [
      {
        id: 'psi-a1',
        category: 'measured',
        title: '25 mg beat 1 mg in 233 patients with treatment-resistant depression; 10 mg did not',
        laymanSummary:
          'The largest randomised psilocybin trial found a single 25 mg dose cut depression scores by 6.6 points more than a 1 mg comparator at three weeks. The middle dose failed.',
        technicalDetails:
          'Phase 2b, double-blind, 79 participants at 25 mg, 75 at 10 mg, 79 at 1 mg (control), all with psychological support. Mean baseline MADRS was 32 or 33 in each group. Least-squares mean change to week 3 was -12.0 at 25 mg, -7.9 at 10 mg and -5.4 at 1 mg; 25 mg versus 1 mg was -6.6 (95% CI -10.2 to -2.9, P<0.001), 10 mg versus 1 mg was -2.5 (95% CI -6.2 to 1.2, P=0.18). Response and remission at week 3 supported the primary result; sustained response at 12 weeks did not. Adverse events occurred in 179 of 233 participants (77%), commonly headache, nausea and dizziness. Suicidal ideation, suicidal behaviour or self-injury occurred in all three dose groups, including the 1 mg arm.',
        evidenceSource:
          'Goodwin GM et al. Single-Dose Psilocybin for a Treatment-Resistant Episode of Major Depression. N Engl J Med 2022;387:1637-1648 (NCT03775200)',
        doi: '10.1056/NEJMoa2206443',
        measuredMetric: 'Change in MADRS total score from baseline to week 3',
        auditFlag: 'verified',
      },
      {
        id: 'psi-a2',
        category: 'failed',
        title: 'Against escitalopram, psilocybin did not win its primary endpoint',
        laymanSummary:
          "Head to head with a standard antidepressant, psilocybin was not significantly better on the trial's main measure. The secondary measures favoured it, but they were not corrected for multiple testing.",
        technicalDetails:
          'Phase 2, double-blind, 59 patients with long-standing moderate-to-severe major depressive disorder: 30 to two 25 mg psilocybin doses three weeks apart plus daily placebo, 29 to two 1 mg psilocybin doses plus six weeks of escitalopram, all with psychological support. Primary outcome was QIDS-SR-16 change at week 6. Mean change was -8.0 (SE 1.0) with psilocybin and -6.0 (SE 1.0) with escitalopram, a between-group difference of 2.0 points (95% CI -5.0 to 0.9, P=0.17). Response was 70% versus 48% (difference 22 points, 95% CI -3 to 48) and remission 57% versus 28% (difference 28 points, 95% CI 2 to 54). Sixteen secondary outcomes generally favoured psilocybin, none corrected for multiplicity. The escitalopram arm received a 1 mg psilocybin dose, so both arms had a session; the escitalopram dose was 10 mg for three weeks then 20 mg.',
        evidenceSource:
          'Carhart-Harris R et al. Trial of Psilocybin versus Escitalopram for Depression. N Engl J Med 2021;384:1402-1411 (NCT03429075)',
        doi: '10.1056/NEJMoa2032994',
        measuredMetric: 'Change in QIDS-SR-16 score at week 6, psilocybin versus escitalopram',
        auditFlag: 'verified',
      },
      {
        id: 'psi-a3',
        category: 'measured',
        title: 'A 12.3-point MADRS advantage over niacin in 104 adults with major depression',
        laymanSummary:
          'Against an active placebo chosen because it causes flushing, one 25 mg dose lowered depression scores by about 12 points more at six weeks, rated by assessors who never met the participants in person.',
        technicalDetails:
          'Phase 2, 11 US sites, December 2019 to June 2022, 104 adults aged 21 to 65 with MDD of at least 60 days and moderate or greater severity, randomised 1:1 to a single 25 mg synthetic psilocybin capsule or 100 mg niacin, both with psychological support. Primary outcome was central rater-assessed MADRS change from baseline to day 43: mean difference -12.3 (95% CI -17.5 to -7.2, P<0.001). Day 8 difference was -12.0 (95% CI -16.6 to -7.4, P<0.001). Sheehan Disability Scale difference at day 43 was -2.31 (95% CI -3.50 to -1.11, P<0.001). More psilocybin participants had sustained response but not sustained remission. No serious treatment-emergent adverse events; higher overall and higher severe adverse-event rates on psilocybin. Participants, site staff, sponsor, raters and statisticians were all blinded to allocation.',
        evidenceSource:
          'Raison CL et al. Single-Dose Psilocybin Treatment for Major Depressive Disorder. JAMA 2023;330:843-853 (NCT03866174)',
        doi: '10.1001/jama.2023.14530',
        measuredMetric: 'Change in central-rater MADRS score from baseline to day 43',
        auditFlag: 'verified',
      },
      {
        id: 'psi-a4',
        category: 'inferred',
        title: 'The niacin comparator does not solve the blinding problem, and the authors knew it',
        laymanSummary:
          'Niacin was chosen because it makes people flush, so they might think they got the drug. A flush lasts twenty minutes; a psilocybin session lasts six hours.',
        technicalDetails:
          'Active placebos in this field — 100 mg niacin in the Usona trial, 1 mg psilocybin in the COMPASS and Imperial trials — are intended to produce a noticeable somatic effect and so preserve the blind. None produces the six-to-eight-hour perceptual state of a 25 mg dose. No psilocybin trial to date has published a formal blinding-integrity assessment showing participants could not guess allocation, and the ones that have measured guess accuracy in adjacent psychedelic trials report it well above chance. The consequence is not that the effects are placebo effects; it is that the trials cannot quantify how much of the effect is expectancy, and effect sizes from an unblinded design are systematically inflated relative to a blinded one.',
        evidenceSource:
          'Raison CL et al., JAMA 2023;330:843-853, and Goodwin GM et al., N Engl J Med 2022;387:1637-1648 — comparator design in both',
        doi: '10.1001/jama.2023.14530',
        inferredClaim:
          'That an active comparator producing a brief somatic sensation maintains a blind against a six-hour psychedelic experience',
        auditFlag: 'caution',
      },
      {
        id: 'psi-a5',
        category: 'measured',
        title: 'Cancer-related depression and anxiety: 51 patients, effects held at six months',
        laymanSummary:
          'In people with life-threatening cancer, a high dose produced large drops in depression and anxiety, and about eight in ten still had clinically significant improvement six months later.',
        technicalDetails:
          'Randomised, double-blind, crossover trial in 51 patients with life-threatening cancer diagnoses and symptoms of depression or anxiety, comparing a very low placebo-like dose (1 or 3 mg/70 kg) with a high dose (22 or 30 mg/70 kg) in counterbalanced order, five weeks between sessions, six-month follow-up. High-dose psilocybin produced large decreases in clinician- and self-rated depressed mood and anxiety, with increases in quality of life, life meaning and optimism and decreases in death anxiety. At six months about 80% of participants still showed clinically significant decreases in depressed mood and anxiety, and community observer ratings moved correspondingly. Mystical-type experience on session day mediated the dose-outcome relationship. The crossover design means the six-month figure describes patients who had all received the high dose by then.',
        evidenceSource: 'Griffiths RR et al., J Psychopharmacol 2016;30:1181-1197 (NCT00465595)',
        doi: '10.1177/0269881116675513',
        measuredMetric:
          'Clinician- and self-rated depression and anxiety at 5 weeks and 6 months, high versus low dose',
        auditFlag: 'verified',
      },
      {
        id: 'psi-a6',
        category: 'measured',
        title:
          'Suicidal ideation and self-injury appeared in every arm of the phase 2b, including 1 mg',
        laymanSummary:
          'The largest trial recorded suicidal thoughts, suicidal behaviour or self-harm in all three dose groups, not only the high one. This is a population with treatment-resistant depression, and the events are reported rather than hidden.',
        technicalDetails:
          'Goodwin et al. state that suicidal ideation or behaviour or self-injury occurred in all dose groups of the 233-participant trial, and that adverse events overall occurred in 179 of 233 participants (77%). The presence of events in the 1 mg control arm is the relevant control information: it establishes a base rate in treatment-resistant depression rather than attributing every event to the drug. It does not establish that the drug is neutral on this outcome, because the trial was not powered for it and no trial in this field is.',
        evidenceSource: 'Goodwin GM et al., N Engl J Med 2022;387:1637-1648, safety reporting',
        doi: '10.1056/NEJMoa2206443',
        measuredMetric:
          'Incidence of suicidal ideation, suicidal behaviour or self-injury by dose arm',
        auditFlag: 'verified',
      },
      {
        id: 'psi-a7',
        category: 'conclusion_shift',
        title: 'Two US states legalised supervised use while the drug stayed federally Schedule I',
        laymanSummary:
          'Oregon and Colorado created licensed programmes where an adult can take psilocybin with a trained facilitator. Federally the same drug is still in the schedule reserved for substances with no accepted medical use.',
        technicalDetails:
          'Psilocybin remains in Schedule I of the Controlled Substances Act, 21 CFR 1308.11(d). Oregon voters passed Measure 109 in November 2020, and the Oregon Health Authority licensed the first psilocybin service centres in 2023 under Oregon Revised Statutes chapter 475A; Colorado followed under the Natural Medicine Health Act. These are supervised-use programmes administered by state health authorities, not prescriptions: there is no diagnosis, no prescriber, no pharmacy and no product approval, and they confer no protection under federal law. The regulatory picture is therefore three different answers to the same question in the same country, running simultaneously.',
        evidenceSource:
          '21 CFR 1308.11(d); Oregon Health Authority, Oregon Psilocybin Services (ORS 475A)',
        measuredMetric:
          'Federal schedule versus state supervised-use licensure for the same substance',
        auditFlag: 'contested',
      },
      {
        id: 'psi-a8',
        category: 'inferred',
        title: 'The phase 3 programme has not reported in the peer-reviewed literature',
        laymanSummary:
          'The first phase 3 trial has finished and the second is still running. Neither has published a paper or posted results on the trial registry, so this page quotes phase 2 numbers only.',
        technicalDetails:
          'COMP005 (NCT05624268, n=258, COMP360 25 mg versus placebo, primary outcome MADRS change from baseline) is registered as completed with a completion date of 15 April 2026 and, as of the date of this audit, has no results posted on ClinicalTrials.gov and no peer-reviewed publication indexed in PubMed. COMP006 (NCT05711940, n=572, two administrations, three dose arms) is active and not recruiting. Sponsor announcements have described topline outcomes; a press release is not a data source this file will quote figures from, because it is not a document whose numbers a reader can check against a protocol and an analysis plan. Every efficacy figure on this page therefore comes from phase 2.',
        evidenceSource:
          'ClinicalTrials.gov NCT05624268 and NCT05711940, record status and results availability at time of audit',
        inferredClaim:
          'That phase 3 confirmation exists in a citable form — it does not yet, and phase 2 effect sizes in this field have historically shrunk on replication at scale',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed as a capsule, converted before it reaches the blood',
        laymanDesc:
          'The capsule contains psilocybin, which is not the active drug. Enzymes strip a chemical group off it during absorption, and what circulates is a different molecule.',
        molecularDetail:
          'Oral 1 to 30 mg. Alkaline phosphatase in the intestinal wall, kidney and liver dephosphorylates psilocybin to psilocin during first pass; the parent compound is essentially undetectable in plasma. Peak plasma psilocin is reached at roughly 2 hours, with most of it circulating as the glucuronide.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Psilocin crosses into the brain',
        laymanDesc:
          'The converted molecule is small and fat-soluble enough to pass out of the blood into brain tissue within minutes.',
        molecularDetail:
          'Psilocin, 204.27 g/mol, crosses the blood-brain barrier readily and distributes to cortical regions with high 5-HT2A receptor density, including prefrontal and posterior cingulate cortex.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Activates the 5-HT2A receptor',
        laymanDesc:
          'It switches on the same serotonin receptor LSD uses. Blocking that receptor first blunts the experience.',
        molecularDetail:
          'Psilocin is an agonist at 5-HT2A, with additional activity at 5-HT1A and 5-HT2C. Duration is shorter than LSD — four to six hours rather than eight to twelve — consistent with faster receptor dissociation and rapid glucuronidation and renal clearance.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Large-scale network organisation changes for a few hours',
        laymanDesc:
          'Brain regions that normally work as a tightly coupled group become less tightly coupled, and regions that usually do not talk to each other do.',
        molecularDetail:
          'Gq-coupled signalling in layer V pyramidal neurons increases cortical excitability. Functional imaging during psilocybin sessions reports desegregation of default mode network connectivity and increased global connectivity between normally distinct networks. The correlation between these measures and clinical outcome is reported inconsistently and is not an established mediator.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Depression scores fall for weeks after the drug has gone',
        laymanDesc:
          'Ratings taken three to six weeks later are lower than after the comparator. The drug cleared the body on day one; nothing established explains the gap.',
        molecularDetail:
          'Measured endpoints are MADRS at day 21 or day 43 and QIDS-SR-16 at week 6. Psilocin is cleared within about 24 hours. Candidate mechanisms for persistence — 5-HT2A-driven dendritic spine formation, altered predictive processing — are preclinical or theoretical and have not been demonstrated to mediate the clinical effect in humans.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT03775200 (COMP360 phase 2b, treatment-resistant depression)',
        phase: 'Phase 2b dose-ranging',
        sampleSize: 233,
        primaryEndpoint: 'Change in MADRS total score from baseline to week 3',
        endpointMet: true,
        statisticalPValue:
          '25 mg vs 1 mg: -6.6 (95% CI -10.2 to -2.9), P<0.001. 10 mg vs 1 mg: -2.5 (95% CI -6.2 to 1.2), P=0.18',
        unreportedAdverseSignals:
          'Adverse events in 179 of 233 (77%). Suicidal ideation, suicidal behaviour or self-injury occurred in all three dose groups. Sustained response at 12 weeks did not support the primary result.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT03866174 (Usona phase 2, major depressive disorder)',
        phase: 'Phase 2 randomised, niacin-controlled',
        sampleSize: 104,
        primaryEndpoint: 'Change in central-rater MADRS score from baseline to day 43',
        endpointMet: true,
        statisticalPValue: 'Mean difference -12.3 (95% CI -17.5 to -7.2), P<0.001',
        unreportedAdverseSignals:
          'No serious treatment-emergent adverse events, but higher overall and higher severe adverse-event rates on psilocybin than on niacin.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT03429075 (psilocybin versus escitalopram)',
        phase: 'Phase 2 double-blind active comparator',
        sampleSize: 59,
        primaryEndpoint: 'Change in QIDS-SR-16 score at week 6',
        endpointMet: false,
        statisticalPValue: 'Between-group difference 2.0 points (95% CI -5.0 to 0.9), P=0.17',
        unreportedAdverseSignals:
          'Sixteen secondary outcomes generally favoured psilocybin and none was corrected for multiple comparisons, which is why the trial is frequently cited as a psilocybin win despite a negative primary.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NCT00465595 (Johns Hopkins, cancer-related depression and anxiety)',
        phase: 'Phase 2 randomised crossover',
        sampleSize: 51,
        primaryEndpoint:
          'Clinician- and self-rated depression and anxiety after high versus low dose, with 6-month follow-up',
        endpointMet: true,
        statisticalPValue:
          'Large decreases on clinician- and self-rated measures after high dose; about 80% still clinically significantly improved at 6 months',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 6.6-point MADRS advantage of 25 mg over 1 mg at week 3 in 233 patients with treatment-resistant depression, with the 10 mg arm failing to separate',
        'A 12.3-point MADRS advantage over niacin at day 43 in 104 adults with major depressive disorder, rated by blinded central assessors',
        'No significant difference from escitalopram on QIDS-SR-16 at week 6 in 59 patients',
        'Sustained reduction in depression and anxiety at six months in about 80% of 51 patients with life-threatening cancer',
      ],
      unsupportedInferences: [
        'That an active comparator producing a 20-minute flush or a 1 mg microdose preserves the blind against a six-hour psychedelic session',
        'That the escitalopram trial showed psilocybin superior — its primary endpoint was negative and its secondary outcomes were uncorrected for multiplicity',
        'That default mode network desegregation mediates the clinical effect; the association is reported inconsistently and has not been established as a mediator',
        'That phase 3 results exist in citable form — the first phase 3 has no posted results and no publication as of this audit',
      ],
      whatFailedInitially: [
        'The 10 mg arm of the phase 2b did not separate from the 1 mg control',
        'Sustained response at 12 weeks in the phase 2b did not support the week-3 primary result',
        'The head-to-head against escitalopram missed its primary endpoint',
      ],
      realWorldOutcome: [
        'Two phase 3 trials in treatment-resistant depression, one completed and one active, with no published results yet',
        'Oregon and Colorado run state-licensed supervised-use programmes while the substance stays federally Schedule I',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, one or two supervised administrations with psychological support',
      description:
        "Synthetic psilocybin in a capsule, given in a session of six to eight hours with trained monitors present and structured preparation and integration visits around it. The psychological support is part of every trial protocol in this file and has never been removed as an experimental variable, so the drug's effect without it is unmeasured.",
      safetyProfile:
        'Acute effects last four to six hours: perceptual change, anxiety, nausea, headache, transient rise in blood pressure and heart rate. Headache after the session day is common and usually resolves within 24 hours. In the 233-patient phase 2b, adverse events occurred in 77% of participants and suicidal ideation, suicidal behaviour or self-injury occurred in all dose arms including the 1 mg control. Personal or family history of psychosis or bipolar I disorder is an exclusion in every trial. Psilocybin does not produce physical dependence or a withdrawal syndrome; tolerance to the subjective effect develops rapidly and resets over about a week. Mushroom material carries a separate risk that the pure compound does not: misidentification of the species.',
    },
    commonQuestions: [
      {
        q: 'Is psilocybin better than an antidepressant?',
        a: 'The one trial that asked that question directly did not show it. Psilocybin versus escitalopram in 59 patients gave a two-point QIDS-SR-16 difference at six weeks with a confidence interval crossing zero, P=0.17. Remission favoured psilocybin, 57% against 28%, but that was one of sixteen secondary outcomes and none of them was corrected for multiple comparisons. The honest reading is that the trial was not large enough to detect a difference of the size either drug is likely to produce, and that a 59-patient comparison of two active treatments is underpowered almost by construction.',
        auditNote:
          'This trial is cited in both directions more than any other in the field. Its primary endpoint was negative. Its authors said so in the conclusion.',
      },
      {
        q: 'Why does the 1 mg dose count as a placebo?',
        a: 'Because 1 mg produces almost no subjective effect while still being the same substance, so it controls for the ritual, the room, the monitors and the expectation of taking something. It is a better control than an inert capsule and a worse one than a genuinely indistinguishable comparator, which does not exist for this class. The trials are explicit about this. It is also why the 10 mg arm matters: it sits between the two, it produced a real subjective effect, and it still did not separate from 1 mg on the primary endpoint.',
      },
      {
        q: 'What about Oregon and Colorado — is it legal now?',
        a: 'In those two states an adult aged 21 or over can take psilocybin at a licensed service centre with a trained facilitator, under a state health authority programme. That is not a prescription: there is no diagnosis, no prescriber, no pharmacy and no FDA-approved product, and the programmes explicitly do not present themselves as medical treatment. Federally, psilocybin is still Schedule I, and a state licence is not a defence under federal law. Three regulators are giving three different answers about the same molecule in the same country at the same time.',
      },
      {
        q: 'How dangerous is it?',
        a: 'The acute physiological risk in a screened, monitored trial population is low — no serious treatment-emergent adverse events in the 104-patient JAMA trial, transient cardiovascular changes, headache and nausea as the common events. The risks that actually appear are psychiatric and situational: intense anxiety during the session, precipitation of psychosis or mania in people predisposed to it, which is why every trial excludes that history, and behavioural risk during a six-hour altered state without supervision. The phase 2b recorded suicidal ideation, behaviour or self-injury in all three arms, which is a reminder that the trial population is severely depressed regardless of what they were given.',
      },
      {
        q: 'Why does this page show no price?',
        a: 'There is no approved product and therefore no list price, no acquisition cost and no reimbursement rate. The Oregon service-centre fees are prices for a service under state law rather than a published drug price, and they vary by centre. This site does not print a number it cannot source to a document.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Goodwin GM et al. Single-Dose Psilocybin for a Treatment-Resistant Episode of Major Depression. N Engl J Med 2022;387:1637-1648',
        identifier: '10.1056/NEJMoa2206443',
        kind: 'doi',
      },
      {
        label:
          'Carhart-Harris R et al. Trial of Psilocybin versus Escitalopram for Depression. N Engl J Med 2021;384:1402-1411',
        identifier: '10.1056/NEJMoa2032994',
        kind: 'doi',
      },
      {
        label:
          'Raison CL et al. Single-Dose Psilocybin Treatment for Major Depressive Disorder: A Randomized Clinical Trial. JAMA 2023;330:843-853',
        identifier: '10.1001/jama.2023.14530',
        kind: 'doi',
      },
      {
        label:
          'Griffiths RR et al. Psilocybin produces substantial and sustained decreases in depression and anxiety in patients with life-threatening cancer. J Psychopharmacol 2016;30:1181-1197',
        identifier: '10.1177/0269881116675513',
        kind: 'doi',
      },
      {
        label: 'Nichols DE. Psychedelics. Pharmacol Rev 2016;68:264-355',
        identifier: '10.1124/pr.115.011478',
        kind: 'doi',
      },
      {
        label:
          'ClinicalTrials.gov NCT03775200 — COMP360 phase 2b in treatment-resistant depression',
        identifier: 'NCT03775200',
        kind: 'nct',
      },
      {
        label: 'ClinicalTrials.gov NCT05624268 — COMP005, phase 3, completed, no results posted',
        identifier: 'NCT05624268',
        kind: 'nct',
      },
      {
        label: 'ClinicalTrials.gov NCT05711940 — COMP006, phase 3, active and not recruiting',
        identifier: 'NCT05711940',
        kind: 'nct',
      },
      {
        label: 'Oregon Health Authority — Oregon Psilocybin Services, licensed under ORS 475A',
        identifier:
          'https://www.oregon.gov/oha/ph/preventionwellness/pages/oregon-psilocybin-services.aspx',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 10624 — psilocybin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/10624',
        kind: 'url',
      },
      {
        label: 'PubChem CID 4980 — psilocin, the active dephosphorylated metabolite',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4980',
        kind: 'url',
      },
      CSA_SCHEDULES_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 3. MDMA (midomafetamine)
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'mdma',
    name: 'MDMA (3,4-Methylenedioxymethamphetamine)',
    tradeName:
      'Midomafetamine — the proposed non-proprietary name in NDA 215455. No marketed product',
    sponsor:
      'MAPS Public Benefit Corporation, then Lykos Therapeutics; ClinicalTrials.gov now lists Resilient Pharmaceuticals as lead sponsor of MAPP1 and MAPP2',
    targetGene: 'SLC6A4',
    targetProtein:
      'Serotonin transporter (SERT), acting as a substrate-type releaser, with parallel release at NET and DAT and partial agonism at 5-HT2A',
    modality: 'Small Molecule',
    approvalStatus: 'Controlled / No Approved Use',
    indication:
      'No approved medical indication. Schedule I in the United States. NDA 215455 for post-traumatic stress disorder was submitted by Lykos Therapeutics and received a complete response letter in August 2024',
    patientFriendlyIndication:
      'Nothing approved. Two completed phase 3 trials tested it, with therapy, for post-traumatic stress disorder; the FDA turned the application down and asked for another trial',
    anatomicalSite:
      'Presynaptic monoamine terminals — serotonergic projections to amygdala and prefrontal cortex',
    conditionContext: {
      conditionExplainer:
        'Post-traumatic stress disorder is rated in these trials on the Clinician-Administered PTSD Scale for DSM-5 (CAPS-5), where 0 is no symptoms and the maximum is 80. Entry scores in the phase 3 programme averaged the mid-thirties to low forties, which is severe.',
      whyItMatters:
        'Two SSRIs are approved for PTSD and their effect sizes are modest; trauma-focused psychotherapy works but has high dropout. A drug given three times inside a course of therapy, rather than daily for years, would be a different treatment model — which is why the FDA review turned into an argument about how to evaluate a drug and a therapy together.',
      whoTakesThis:
        'In the phase 3 trials: adults with moderate to severe PTSD, after psychiatric medication washout, receiving three preparatory and nine integrative therapy sessions around three eight-hour dosing sessions. There is no lawful medical route to it in the United States.',
      clinicalGoals:
        'Reduce CAPS-5 severity and Sheehan Disability Scale impairment, measured by independent assessors who were not in the dosing room.',
    },
    oneSentenceVerdict:
      'Two positive phase 3 trials, a rejected new drug application, and a retracted Science paper — the clearest example on this site of a drug whose pharmacology is settled and whose evidence base is not.',
    laymanHowItWorks:
      'Most drugs that raise serotonin block the pump that clears it away. MDMA does something more forceful: it runs the pump backwards, so serotonin is pushed out of the nerve cell into the gap in bulk, along with noradrenaline and some dopamine. The result is a few hours of raised mood, sociability and reduced fear response, followed by depletion — the cell has emptied a store it takes days to refill. In the trials that state is used as a window in which someone can talk about a traumatic memory without the fear response that normally shuts the conversation down.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 47,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(CC1=CC2=C(C=C1)OCO2)NC',
      chemicalFormula: 'C11H15NO2',
      molecularWeight:
        '193.24 g/mol (free base). Clinical material is MDMA hydrochloride; the proposed doses in NDA 215455 were 120 mg and 180 mg of the hydrochloride salt',
      targetReceptorAffinity:
        'A substrate at SERT, NET and DAT rather than a blocker: it is transported into the terminal and reverses the carrier, producing carrier-mediated release. Relative potency for release is serotonin > norepinephrine > dopamine. Also a weak 5-HT2A partial agonist and a releaser of oxytocin and vasopressin. Metabolised by CYP2D6, which it also strongly inhibits — the basis of its non-linear pharmacokinetics.',
      structureSource: {
        label: 'PubChem CID 1615 (MDMA) — SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1615',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mdma-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Presumptive identification of a seized tablet or powder',
          description:
            'Colour tests give a first answer and no more: Marquis reagent turns purple-black with MDMA and also with amphetamine and with several substituted cathinones, and Simon reagent distinguishes secondary from primary amines. Tablets sold as MDMA routinely contain something else, so a presumptive result is a reason to run the instrument, not a conclusion.',
          reagentsAndBuffer:
            'Marquis reagent (formaldehyde in concentrated sulfuric acid), Simon reagent (sodium nitroprusside with acetaldehyde and sodium carbonate), Mecke reagent, positive and negative controls',
        },
        {
          id: 'mdma-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Confirmatory identification and purity by GC-MS',
          description:
            'Electron-ionisation GC-MS against a certified reference standard is the reference method for this class: MDMA gives a dominant m/z 58 iminium fragment with 135 and 193 as confirming ions, and the retention time separates it from MDA, MDEA and the methylenedioxy-substituted cathinones. Quantify by internal standard rather than by peak area alone.',
          dependsOnStepId: 'mdma-w1',
          reagentsAndBuffer:
            'MDMA hydrochloride certified reference standard, MDMA-d5 internal standard, methanol extraction, 5% phenyl methylpolysiloxane capillary column, helium carrier, EI at 70 eV scanning m/z 40 to 400',
        },
        {
          id: 'mdma-w3',
          stepNumber: 3,
          phase: 'Cellular_Delivery',
          name: 'Transporter-expressing cell line for release assays',
          description:
            'Human SLC6A4, SLC6A2 and SLC6A3 are each expressed separately in HEK293 cells so that release at SERT, NET and DAT can be measured one transporter at a time. Brain tissue cannot separate them and a mixed preparation cannot attribute the effect.',
          dependsOnStepId: 'mdma-w2',
          reagentsAndBuffer:
            'HEK293 cells, separate human SLC6A4, SLC6A2 and SLC6A3 expression plasmids, lipid transfection reagent, DMEM with 10% fetal bovine serum and selection antibiotic',
        },
        {
          id: 'mdma-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Superfusion release assay and uptake inhibition side by side',
          description:
            'Preload the cells with tritiated monoamine, superfuse, then apply MDMA and measure efflux. This is the experiment that distinguishes a releaser from a reuptake inhibitor: a blocker raises synaptic monoamine by preventing clearance and produces no efflux from a preloaded cell, while a substrate produces efflux. Running uptake inhibition in the same system gives both numbers from one preparation.',
          dependsOnStepId: 'mdma-w3',
          reagentsAndBuffer:
            '[3H]-5-HT, [3H]-noradrenaline and [3H]-dopamine, superfusion chambers, Krebs-HEPES buffer with ascorbate and pargyline, reserpine-free preload conditions, liquid scintillation counting',
        },
        {
          id: 'mdma-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Plasma pharmacokinetics with CYP2D6 genotyping',
          description:
            'Quantify MDMA and its metabolites MDA, HMMA and HMA in plasma. MDMA inhibits the enzyme that clears it, so exposure rises faster than dose and a second dose two hours after the first behaves differently from a single larger one. Genotyping CYP2D6 is part of the assay design rather than an optional extra, because poor metabolisers sit on a different exposure curve.',
          dependsOnStepId: 'mdma-w2',
          reagentsAndBuffer:
            'MDMA-d5 and MDA-d5 internal standards, solid-phase extraction, UHPLC-MS/MS, CYP2D6 genotyping panel covering *3, *4, *5, *6 and copy-number variants',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mdma-a1',
        category: 'measured',
        title: 'MAPP1: a 10.5-point CAPS-5 advantage over placebo with the same therapy',
        laymanSummary:
          'In the first phase 3 trial, 90 people with severe PTSD got identical therapy; half also got MDMA. The MDMA group improved by about ten more points on the standard PTSD scale.',
        technicalDetails:
          'Randomised, double-blind, placebo-controlled, multi-site phase 3 (NCT03537014). After psychiatric medication washout, 90 participants with severe PTSD were randomised 1:1 to manualised therapy with MDMA or with placebo, each combined with three preparatory and nine integrative therapy sessions. Primary endpoint was CAPS-5 total severity at two months after the last experimental session, assessed by blinded independent assessors. Mean CAPS-5 change among completers was -24.4 (SD 11.6) with MDMA and -13.9 (SD 11.5) with placebo, P<0.0001, d=0.91. Sheehan Disability Scale change was significant at P=0.0116, d=0.43. The paper reports no adverse events of abuse potential, no suicidality signal and no QT prolongation. Comorbid dissociation, depression, alcohol and substance use history and childhood trauma were all admitted rather than excluded.',
        evidenceSource:
          'Mitchell JM et al. MDMA-assisted therapy for severe PTSD: a randomized, double-blind, placebo-controlled phase 3 study. Nat Med 2021;27:1025-1033 (NCT03537014)',
        doi: '10.1038/s41591-021-01336-3',
        measuredMetric: 'CAPS-5 total severity change at 2 months after the last dosing session',
        auditFlag: 'verified',
      },
      {
        id: 'mdma-a2',
        category: 'measured',
        title: 'MAPP2 replicated it in a more diverse sample, with a smaller effect',
        laymanSummary:
          'The confirmatory trial found the same direction of result in 104 people, with an effect about a quarter smaller than the first trial.',
        technicalDetails:
          'Multi-site, randomised, double-blind confirmatory phase 3 (NCT04077437): 53 to MDMA-assisted therapy, 51 to placebo with identical therapy. 26.9% had moderate and 73.1% severe PTSD; 26.9% identified as Hispanic or Latino and 33.7% as other than White. Least-squares mean CAPS-5 change was -23.7 (95% CI -26.94 to -20.44) with MDMA versus -14.8 (95% CI -18.28 to -11.28) with placebo, P<0.001, d=0.7 — against d=0.91 in MAPP1. Sheehan Disability Scale change was -3.3 (95% CI -4.03 to -2.60) versus -2.1 (95% CI -2.89 to -1.33), P=0.03, d=0.4. Seven participants had a severe treatment-emergent adverse event, five on MDMA (9.4%) and two on placebo (3.9%); no deaths and no serious treatment-emergent adverse events.',
        evidenceSource:
          'Mitchell JM et al. MDMA-assisted therapy for moderate to severe PTSD: a randomized, placebo-controlled phase 3 trial. Nat Med 2023;29:2473-2480 (NCT04077437)',
        doi: '10.1038/s41591-023-02565-4',
        measuredMetric: 'CAPS-5 total severity change, blinded independent assessors',
        auditFlag: 'verified',
      },
      {
        id: 'mdma-a3',
        category: 'failed',
        title: 'The FDA rejected the application in August 2024 and asked for another phase 3',
        laymanSummary:
          'Two positive phase 3 trials were not enough. The FDA issued a complete response letter, which means the application is not approvable as filed, and told the sponsor to run another trial.',
        technicalDetails:
          'NDA 215455, midomafetamine (MDMA) capsules, was submitted by Lykos Therapeutics for the treatment of post-traumatic stress disorder. The Psychopharmacologic Drugs Advisory Committee met on 4 June 2024 at FDA White Oak to discuss the application and was asked to discuss the overall benefit-risk profile including potential public health impact (89 FR 38903, docket FDA-2024-N-1938). In August 2024 the FDA issued a complete response letter requiring more clinical evidence before approval and requesting an additional phase 3 trial to further explore efficacy and safety in adults with PTSD. A complete response letter is not a finding that the drug does not work; it is a finding that the application as submitted does not support approval. As of this audit no replacement phase 3 trial for the PTSD indication is registered on ClinicalTrials.gov.',
        evidenceSource:
          'Federal Register 89 FR 38903 (8 May 2024), PDAC notice of meeting on NDA 215455; and Stanicic F et al. PLoS One 2025, reporting the complete response letter and the request for an additional phase 3 trial',
        doi: '10.1371/journal.pone.0327778',
        measuredMetric: 'Regulatory outcome of NDA 215455',
        auditFlag: 'verified',
      },
      {
        id: 'mdma-a4',
        category: 'failed',
        title: 'Ricaurte 2002 was retracted: the monkeys had been given methamphetamine',
        laymanSummary:
          'A Science paper reported that recreational doses of MDMA destroyed dopamine neurons in primates. The lab later found the vials had been mislabelled and the animals had received methamphetamine instead. The paper was withdrawn a year later.',
        technicalDetails:
          'Ricaurte et al. reported severe dopaminergic neurotoxicity in non-human primates after a dose regimen modelled on human recreational use, concluding that MDMA users might be putting themselves at risk of dopamine- or serotonin-related neuropsychiatric disorders. The paper was retracted in Science on 12 September 2003 after the authors determined that the vials used had contained methamphetamine rather than MDMA — Science\'s own news coverage titled the report "Paper on toxic party drug is pulled over vial mix-up". The retraction is a textbook case of a result that entered policy discussion before it entered replication: the paper appeared while MDMA scheduling legislation was under debate, and the dopaminergic finding it reported has never been reproduced with correctly labelled MDMA. It says nothing either way about the separate and much older serotonergic literature.',
        evidenceSource:
          'Ricaurte GA et al., Science 2002;297:2260-2263 (doi 10.1126/science.1074501), RETRACTED; retraction Science 2003;301:1479; news report Holden C, Science 2003;301:1454',
        doi: '10.1126/science.301.5639.1479b',
        inferredClaim:
          'That a common recreational MDMA regimen produces severe dopaminergic neurotoxicity in primates — the experiment that produced this claim was performed with a different drug',
        auditFlag: 'retracted',
      },
      {
        id: 'mdma-a5',
        category: 'conclusion_shift',
        title: 'Serotonergic neurotoxicity in humans: measured once by PET, then complicated',
        laymanSummary:
          'A 1998 imaging study found fewer serotonin transporters in the brains of ecstasy users, in proportion to how much they had used. A carefully controlled 2011 study of users who took almost nothing else found little cognitive difference from non-users.',
        technicalDetails:
          'McCann et al. imaged 14 abstinent MDMA users and 15 never-users with PET and the SERT-selective ligand [11C]McN-5652, and found decreased global and regional 5-HT transporter binding in users, correlating positively with extent of previous use. That is a real measurement in a small, self-selected, polydrug-exposed sample. Halpern et al. later compared 52 illicit ecstasy users with 59 non-users, excluding anyone with significant lifetime exposure to other illicit drugs or alcohol, restricting both groups to the same subculture, and verifying abstinence with breath, urine and hair testing; across 15 neuropsychological tests they found little evidence of decreased cognitive performance, save poorer strategic self-regulation which they noted might be pre-morbid. Their own conclusion was that the finding contrasted with many previous results including their own. Neither study settles the question; together they define its shape — reduced transporter binding is measured, functional consequence in humans is not established.',
        evidenceSource:
          'McCann UD et al., Lancet 1998;352:1433-1437; Halpern JH et al., Addiction 2011;106:777-786',
        doi: '10.1111/j.1360-0443.2010.03252.x',
        measuredMetric:
          'Brain 5-HT transporter binding by PET, and neuropsychological performance in confound-minimised field study',
        auditFlag: 'contested',
      },
      {
        id: 'mdma-a6',
        category: 'measured',
        title: 'Acute safety pharmacology in 166 healthy volunteers, with the numbers by dose',
        laymanSummary:
          'Pooling nine controlled studies, a third of people given 125 mg had blood pressure over 160, and one in five ran a temperature above 38 degrees. Women had more adverse effects than men.',
        technicalDetails:
          'Vizeli and Liechti pooled nine double-blind, placebo-controlled crossover studies performed in one laboratory, 166 healthy subjects, single 75 mg or 125 mg doses. Subjective effects lasted 4.2 ± 1.3 hours (range 1.4 to 8.2). MDMA raised systolic blood pressure above 160 mmHg in 33%, heart rate above 100 beats per minute in 29% and body temperature above 38 °C in 19% of subjects, each significantly more often at 125 mg than at 75 mg. Acute and subacute adverse effects were dose-dependent and more frequent in women, as were bad subjective drug effects. No effect on liver or kidney function at end of study 29 ± 22 days later, and no serious adverse events. The authors state plainly that risk is likely higher in cardiovascular disease and remains uninvestigated in psychiatric patients.',
        evidenceSource: 'Vizeli P, Liechti ME. J Psychopharmacol 2017;31:576-588',
        doi: '10.1177/0269881117691569',
        measuredMetric:
          'Proportion of subjects exceeding blood pressure, heart rate and temperature thresholds by dose',
        auditFlag: 'verified',
      },
      {
        id: 'mdma-a7',
        category: 'inferred',
        title: 'The trials measured a drug plus a therapy, and cannot say what the drug did alone',
        laymanSummary:
          'Both arms of both phase 3 trials received the same twelve therapy sessions. That is good design for testing the package and no design at all for separating the pill from the talking.',
        technicalDetails:
          'MAPP1 and MAPP2 both compared manualised therapy with MDMA against manualised therapy with placebo — three preparatory sessions, three eight-hour experimental sessions and nine integrative sessions in each arm. The comparison is therefore MDMA-versus-placebo within a fixed therapy, which is the right question for a combination product and answers nothing about MDMA given without that therapy, or about the therapy given without MDMA. Because MDMA produces unmistakable acute effects, participants and therapists in the room could generally tell allocation, so the "identical therapy" was delivered by people who knew which arm they were in; the CAPS-5 was rated by independent assessors who were not, which mitigates but does not remove the problem. A JAMA Psychiatry viewpoint made the psychotherapy component itself the central question about the validity of these trials.',
        evidenceSource:
          'Mitchell JM et al., Nat Med 2021 and 2023, trial design; and the JAMA Psychiatry 2024 viewpoint on the psychotherapy component',
        doi: '10.1001/jamapsychiatry.2024.2887',
        inferredClaim:
          'That the CAPS-5 separation measures the pharmacological effect of MDMA, when the trial measures a drug-and-therapy package against a therapy-and-placebo package delivered by unblinded therapists',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed as a capsule, with a top-up two hours later',
        laymanDesc:
          'A capsule by mouth, then usually a smaller second dose after about two hours to extend the session. Effects begin within about half an hour.',
        molecularDetail:
          'Oral 75 to 180 mg of the hydrochloride. Peak plasma concentration at roughly 2 hours. MDMA inhibits CYP2D6, the enzyme that clears it, so exposure rises more than proportionally with dose and a split regimen produces a different exposure profile from a single equivalent dose.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Carried into the nerve terminal by the transporter it targets',
        laymanDesc:
          'The molecule is not just blocking the serotonin pump — it is picked up by the pump and carried inside the cell.',
        molecularDetail:
          'MDMA is a substrate at SERT, NET and DAT rather than a blocker, so it is translocated into the presynaptic terminal. Once inside it also disrupts the vesicular monoamine transporter, moving serotonin from vesicles into the cytoplasm.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Reverses the transporter and empties the terminal',
        laymanDesc:
          'The pump runs backwards. Instead of clearing serotonin from the gap it pours it out, along with noradrenaline and some dopamine.',
        molecularDetail:
          'Carrier-mediated efflux through SERT, NET and DAT, with relative potency serotonin > norepinephrine > dopamine. MDMA also releases oxytocin and vasopressin and is a weak 5-HT2A partial agonist. The superfusion release assay is what distinguishes this from reuptake blockade.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Fear response drops for a few hours',
        laymanDesc:
          'People report reduced defensiveness and less fear when recalling a traumatic memory, which is the state the therapy protocol is built around.',
        molecularDetail:
          'Reduced amygdala reactivity to threat cues and increased prefrontal engagement are the reported functional correlates. Whether this window is causally necessary for the clinical outcome has not been tested, because no trial has given MDMA without the therapy or the therapy without MDMA in the same design.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'PTSD severity falls, and the store takes days to refill',
        laymanDesc:
          'PTSD scores measured two months later are lower than after placebo with the same therapy. In the days immediately after a session, mood is often worse — the cell has emptied a supply it has to rebuild.',
        molecularDetail:
          'Measured endpoints are CAPS-5 total severity and Sheehan Disability Scale, rated by blinded independent assessors. The subacute low-mood period reflects depletion of releasable serotonin, which recovers over days; it is dose-dependent and more frequent in women.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT03537014 (MAPP1)',
        phase: 'Phase 3',
        sampleSize: 90,
        primaryEndpoint:
          'CAPS-5 total severity score change from baseline, 2 months after the last experimental session',
        endpointMet: true,
        statisticalPValue: 'P < 0.0001, d = 0.91 (mean change -24.4 vs -13.9)',
        unreportedAdverseSignals:
          'No adverse events of abuse potential, suicidality or QT prolongation reported. Participants and therapists could generally identify allocation from the acute drug effect.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT04077437 (MAPP2)',
        phase: 'Phase 3 confirmatory',
        sampleSize: 104,
        primaryEndpoint: 'CAPS-5 total severity score change, blinded independent assessors',
        endpointMet: true,
        statisticalPValue:
          'LS mean change -23.7 (95% CI -26.94 to -20.44) vs -14.8 (95% CI -18.28 to -11.28), P < 0.001, d = 0.7',
        unreportedAdverseSignals:
          'Severe treatment-emergent adverse events in 5 of 53 on MDMA (9.4%) versus 2 of 51 on placebo (3.9%). Effect size fell from 0.91 in MAPP1 to 0.7 here.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Pooled safety pharmacology, nine controlled crossover studies (Vizeli & Liechti)',
        phase: 'Phase 1 pooled analysis',
        sampleSize: 166,
        primaryEndpoint:
          'Cardiovascular, thermoregulatory and subjective safety parameters after single 75 mg or 125 mg doses',
        endpointMet: true,
        statisticalPValue:
          'Systolic BP >160 mmHg in 33%, heart rate >100 bpm in 29%, temperature >38 °C in 19%; all significantly more frequent at 125 mg than 75 mg',
        unreportedAdverseSignals:
          'Adverse effects and bad subjective drug effects significantly more frequent in women. No cardiovascular or psychiatric patients were studied.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A CAPS-5 advantage over placebo with identical therapy in two randomised phase 3 trials, d=0.91 in 90 participants and d=0.7 in 104',
        'Carrier-mediated release at SERT, NET and DAT — a substrate, not a reuptake blocker, demonstrated by superfusion efflux from preloaded cells',
        'Systolic blood pressure above 160 mmHg in 33%, heart rate above 100 in 29% and temperature above 38 °C in 19% of 166 healthy volunteers',
        'Reduced brain 5-HT transporter binding on PET in 14 abstinent users versus 15 never-users, correlating with extent of prior use',
      ],
      unsupportedInferences: [
        'That the trials measured what MDMA does — both arms received the same twelve therapy sessions from therapists who could tell which arm they were in',
        'That severe dopaminergic neurotoxicity follows a recreational regimen in primates: the experiment behind that claim used methamphetamine and was retracted',
        'That reduced SERT binding in users establishes functional cognitive harm — the best-controlled field study found little cognitive difference',
        'That two positive phase 3 trials imply approvability; the FDA concluded otherwise on the application as filed',
      ],
      whatFailedInitially: [
        'NDA 215455 received a complete response letter in August 2024 with a request for an additional phase 3 trial',
        'Ricaurte et al., Science 2002, retracted in September 2003 after the vials were found to contain methamphetamine',
        'The MAPP2 effect size was smaller than MAPP1, the usual direction of travel on replication',
      ],
      realWorldOutcome: [
        'No approved product. MDMA remains Schedule I and there is no lawful medical route to it in the United States',
        'As of this audit no replacement phase 3 trial for the PTSD indication is registered on ClinicalTrials.gov',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, three supervised eight-hour sessions inside a twelve-session therapy course',
      description:
        'In the phase 3 protocol the drug is given three times, each in an eight-hour session with two therapists present, surrounded by three preparatory and nine integrative 90-minute sessions. The product under review was explicitly a drug plus a psychological intervention, which is part of why the review was difficult: the agency was being asked to approve something it does not have a standard framework for evaluating.',
      safetyProfile:
        'Acute effects last about four hours. In 166 healthy volunteers, systolic blood pressure exceeded 160 mmHg in a third, heart rate exceeded 100 in 29% and body temperature exceeded 38 °C in 19%, all dose-dependent, with adverse effects more frequent in women. The recognised acute emergencies outside a clinical setting are hyperthermia and dilutional hyponatraemia, the latter from drinking large volumes of water while vasopressin release impairs free-water excretion. A subacute low-mood period over the following days reflects depletion of releasable serotonin. Concurrent serotonergic drugs, especially MAO inhibitors, carry a serotonin-syndrome risk. Cardiovascular disease was an exclusion in every study cited here, so the risk in that group is uncharacterised.',
    },
    commonQuestions: [
      {
        q: 'Two positive phase 3 trials and the FDA still said no. Why?',
        a: 'A complete response letter says the application as submitted does not support approval; it does not say the drug does not work. The public record shows the Psychopharmacologic Drugs Advisory Committee met on 4 June 2024 to discuss NDA 215455 and the overall benefit-risk profile, and that in August 2024 the FDA required more clinical evidence and asked for an additional phase 3 trial. The substantive difficulties are visible in the trials themselves: participants and therapists could tell who got the drug, the product is a drug bundled with a specific psychotherapy that the agency has no framework for approving, and questions were raised about conduct in the earlier phase 2 programme. This page does not quote the advisory committee vote counts, because it could not verify them against a primary document.',
        auditNote:
          'The meeting itself, the NDA number, the applicant and the indication are all in the Federal Register notice, 89 FR 38903, docket FDA-2024-N-1938. The vote tallies are not.',
      },
      {
        q: 'Does MDMA damage serotonin neurons?',
        a: 'In animals given repeated high doses, yes — that finding is old, replicated and not seriously disputed. In humans it is unresolved. A 1998 PET study of 14 abstinent users found reduced serotonin transporter binding proportional to prior use, which is a real measurement in a small polydrug-exposed sample. A 2011 study designed specifically to strip out the usual confounds — excluding people with other drug or alcohol exposure, matching subculture, verifying abstinence by hair and urine — found little cognitive difference from non-users, and the authors said so against their own earlier work. Separately, the single most-cited primate neurotoxicity paper was retracted because the animals were given methamphetamine by mistake. The clinical trials used three supervised doses in a lifetime, a regimen with no neurotoxicity signal in any published dataset.',
      },
      {
        q: 'What actually killed people at festivals?',
        a: "The two acute emergencies documented in the literature are hyperthermia and dilutional hyponatraemia. MDMA raises core temperature — 19% of volunteers in a controlled laboratory setting exceeded 38 °C — and sustained physical exertion in a hot, crowded environment removes the body's ability to shed that heat, which is why the clinical picture is a heat-stroke picture. Hyponatraemia is the mirror image: MDMA promotes vasopressin release, which impairs free-water excretion, so drinking large volumes of plain water dilutes serum sodium to the point of cerebral oedema. Neither risk is specific to a dose; both are strongly modified by the setting, which is the difference between a festival and a clinic.",
      },
      {
        q: 'Is the pill sold as MDMA actually MDMA?',
        a: "Often not, and that is a separate fact from anything on this page about the molecule. Every pharmacological figure here comes from studies using analytically confirmed MDMA hydrochloride of known purity. A tablet from an unregulated supply has not been through the identification described in this page's analytical workflow, and the colour tests that a buyer might use are presumptive only — Marquis reagent turns the same colour for amphetamine and for several substituted cathinones. Everything measured about MDMA is measured about MDMA.",
      },
      {
        q: 'Why does this page show no price?',
        a: 'There is no approved product, so there is no list price, no acquisition cost and no reimbursement rate. A published cost-effectiveness model assumed a hypothetical price per session for the purposes of its analysis; an assumed input to a model is not a price, and this site does not print it as one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Mitchell JM et al. MDMA-assisted therapy for severe PTSD: a randomized, double-blind, placebo-controlled phase 3 study. Nat Med 2021;27:1025-1033',
        identifier: '10.1038/s41591-021-01336-3',
        kind: 'doi',
      },
      {
        label:
          'Mitchell JM et al. MDMA-assisted therapy for moderate to severe PTSD: a randomized, placebo-controlled phase 3 trial. Nat Med 2023;29:2473-2480',
        identifier: '10.1038/s41591-023-02565-4',
        kind: 'doi',
      },
      {
        label:
          'Ricaurte GA et al. Severe dopaminergic neurotoxicity in primates after a common recreational dose regimen of MDMA. Science 2002;297:2260-2263 — RETRACTED',
        identifier: '10.1126/science.1074501',
        kind: 'doi',
      },
      {
        label: 'Retraction of Ricaurte GA et al. Science 2003;301:1479',
        identifier: '10.1126/science.301.5639.1479b',
        kind: 'doi',
      },
      {
        label:
          'Holden C. Paper on toxic party drug is pulled over vial mix-up. Science 2003;301:1454',
        identifier: '10.1126/science.301.5639.1454b',
        kind: 'doi',
      },
      {
        label:
          'McCann UD et al. Positron emission tomographic evidence of toxic effect of MDMA on brain serotonin neurons in human beings. Lancet 1998;352:1433-1437',
        identifier: '10.1016/s0140-6736(98)04329-3',
        kind: 'doi',
      },
      {
        label:
          'Halpern JH et al. Residual neurocognitive features of long-term ecstasy users with minimal exposure to other drugs. Addiction 2011;106:777-786',
        identifier: '10.1111/j.1360-0443.2010.03252.x',
        kind: 'doi',
      },
      {
        label:
          'Vizeli P, Liechti ME. Safety pharmacology of acute MDMA administration in healthy subjects. J Psychopharmacol 2017;31:576-588',
        identifier: '10.1177/0269881117691569',
        kind: 'doi',
      },
      {
        label:
          'Stanicic F et al. MDMA-assisted therapy and current treatment options for chronic, treatment-resistant, moderate or higher severity PTSD: systematic literature review. PLoS One 2025;20:e0327778 — reports the FDA complete response letter and the request for an additional phase 3 trial',
        identifier: '10.1371/journal.pone.0327778',
        kind: 'doi',
      },
      {
        label:
          'Federal Register 89 FR 38903 (8 May 2024) — Psychopharmacologic Drugs Advisory Committee notice of meeting on NDA 215455, midomafetamine capsules, Lykos Therapeutics, for PTSD; docket FDA-2024-N-1938',
        identifier:
          'https://www.federalregister.gov/documents/2024/05/08/2024-10053/psychopharmacologic-drugs-advisory-committee-notice-of-meeting-establishment-of-a-public-docket',
        kind: 'regulatory',
      },
      {
        label: 'ClinicalTrials.gov NCT03537014 — MAPP1',
        identifier: 'NCT03537014',
        kind: 'nct',
      },
      {
        label: 'ClinicalTrials.gov NCT04077437 — MAPP2',
        identifier: 'NCT04077437',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 1615 — MDMA structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1615',
        kind: 'url',
      },
      CSA_SCHEDULES_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 4. Ketamine
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ketamine',
    name: 'Ketamine',
    tradeName:
      'Ketalar (injectable anaesthetic). Esketamine, the S-enantiomer, is a separate product',
    sponsor:
      'Parke-Davis originally; Ketalar NDA 016812 currently held by Par Pharmaceutical, with multiple generic injectables',
    targetGene: 'GRIN1',
    targetProtein:
      'NMDA glutamate receptor — non-competitive open-channel blocker at the PCP site within the pore',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1970,
    indication:
      'Approved as a general anaesthetic: sole anaesthetic agent for diagnostic and surgical procedures not requiring skeletal muscle relaxation, induction before other agents, and supplementation of low-potency agents. Schedule III. Every psychiatric use is off-label',
    patientFriendlyIndication:
      'Approved for anaesthesia and sedation. Widely used off-label for depression that has not responded to other treatments, and widely used recreationally',
    anatomicalSite:
      'NMDA receptors on cortical and hippocampal GABAergic interneurons, and in the spinal dorsal horn',
    conditionContext: {
      conditionExplainer:
        'Ketamine occupies three different roles at once: a fifty-year-old anaesthetic on the WHO Essential Medicines List, an off-label rapid-acting antidepressant delivered in a large private clinic sector, and a recreational dissociative with a documented, severe urological toxicity in heavy users. The pharmacology is the same in all three.',
      whyItMatters:
        'The antidepressant effect is the fastest reliably demonstrated in psychiatry — hours rather than weeks — and it is delivered by a generic drug with no patent, which is why almost all of the commercial effort went into the single-enantiomer nasal spray instead. The gap between what the evidence supports and what the clinic sector sells is the reason this page exists.',
      whoTakesThis:
        'Anaesthesia: all ages, including in settings without ventilators, because it preserves airway reflexes and respiratory drive. Off-label psychiatry: adults with treatment-resistant depression, usually by intravenous infusion at 0.5 mg/kg over 40 minutes. Recreationally: by insufflation, where the doses and frequencies that produce bladder injury are far higher than any clinical regimen.',
      clinicalGoals:
        'Anaesthesia: dissociative anaesthesia with preserved airway reflexes. Psychiatry: a reduction in depression rating scale score within 24 hours, and some way of sustaining it.',
    },
    oneSentenceVerdict:
      'An approved anaesthetic that turned out to be the fastest antidepressant in psychiatry, non-inferior to electroconvulsive therapy in 403 patients, and the cause of an irreversible destructive cystitis in heavy recreational users.',
    laymanHowItWorks:
      "Glutamate is the brain's main excitatory signal, and one of its receptors works like a channel through the cell membrane. Ketamine sits inside that channel and plugs it. The cells it silences first are the inhibitory ones — the brakes — so the immediate result is a burst of glutamate release, not a reduction. That burst triggers a growth-factor cascade that builds new synaptic connections over the following hours, which is the leading explanation for why a single 40-minute infusion can change depression scores the next day. The dissociation, the sense of detachment from the body, comes from the same channel block interrupting the loop between the thalamus and cortex.",
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 78,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CNC1(CCCCC1=O)C2=CC=CC=C2Cl',
      chemicalFormula: 'C13H16ClNO',
      molecularWeight:
        '237.72 g/mol. The marketed anaesthetic is racemic ketamine hydrochloride — a 50:50 mixture of S- and R-enantiomers. The S-enantiomer alone is esketamine, which has its own record on this site',
      targetReceptorAffinity:
        'Non-competitive antagonist at the NMDA receptor, binding the PCP site inside the open channel, so block is use-dependent — the channel must open before the drug can enter it. S-ketamine has roughly three to four times the NMDA affinity of R-ketamine. Also has activity at HCN1 channels, opioid receptors and monoamine transporters; the metabolite (2R,6R)-hydroxynorketamine has antidepressant-like activity in rodents without NMDA antagonism, which is an active and unsettled question.',
      structureSource: {
        label: 'PubChem CID 3821 (ketamine) — SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3821',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ket-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and content of an injectable vial or a seized powder',
          description:
            'A pharmaceutical vial is assayed for content and for the preservative benzethonium chloride; a seized powder is identified against a certified reference standard. The relevant distinction for a non-pharmaceutical sample is ketamine against its structural neighbours — deschloroketamine, 2-fluorodeschloroketamine, methoxetamine — which share the fragmentation pattern and differ by one substituent.',
          reagentsAndBuffer:
            'Ketamine hydrochloride certified reference standard, ketamine-d4 internal standard, methanol, reversed-phase HPLC with UV detection at 269 nm',
        },
        {
          id: 'ket-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Chiral separation of the S- and R-enantiomers',
          description:
            'Racemic ketamine and esketamine are chemically identical to an achiral assay, so distinguishing them requires a chiral stationary phase. This matters clinically and forensically: the approved nasal spray is single-enantiomer, the approved injectable is racemic, and their labels, schedules and prices differ.',
          dependsOnStepId: 'ket-w1',
          reagentsAndBuffer:
            'Amylose- or cellulose-derived chiral stationary phase, hexane/isopropanol/diethylamine mobile phase or supercritical CO2, UV or MS detection, S- and R-ketamine reference standards',
        },
        {
          id: 'ket-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'Plasma ketamine, norketamine and hydroxynorketamine',
          description:
            'Quantify the parent and both major metabolite classes. Norketamine is the active N-demethylated metabolite; (2R,6R)- and (2S,6S)-hydroxynorketamine are the ones the mechanism argument is about, and separating the hydroxynorketamine stereoisomers requires the chiral method rather than the achiral one. Reporting "hydroxynorketamine" without specifying the stereoisomer is the commonest reporting error in this literature.',
          dependsOnStepId: 'ket-w2',
          reagentsAndBuffer:
            'Ketamine-d4 and norketamine-d4 internal standards, liquid-liquid or solid-phase extraction, UHPLC-MS/MS, chiral column for hydroxynorketamine stereoisomers',
        },
        {
          id: 'ket-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'NMDA receptor expression with defined subunit composition',
          description:
            'Co-express GRIN1 with a chosen GRIN2 subunit in HEK293 cells or Xenopus oocytes. Subunit composition changes channel kinetics and therefore apparent potency, so a stated IC50 without a stated subunit combination is an incomplete number.',
          dependsOnStepId: 'ket-w1',
          reagentsAndBuffer:
            'HEK293 cells or Xenopus oocytes, GRIN1 plus GRIN2A/2B/2C/2D expression constructs, transfection reagent or cRNA injection, Mg2+-free extracellular solution with glycine',
        },
        {
          id: 'ket-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Whole-cell patch clamp for use-dependent open-channel block',
          description:
            'Apply glutamate and glycine to open the channel, then apply ketamine and measure the decay of current. The experiment that defines the mechanism is the demonstration that block develops only while the channel is open and traps the drug when it closes — which is why potency measured at rest and potency measured during activity are different numbers.',
          dependsOnStepId: 'ket-w4',
          reagentsAndBuffer:
            'Glutamate and glycine agonist solution, Mg2+-free bath, borosilicate patch pipettes with caesium-based internal solution, MK-801 as a positive control open-channel blocker',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ket-a1',
        category: 'measured',
        title: 'ELEKT-D: non-inferior to electroconvulsive therapy in 403 patients',
        laymanSummary:
          'In the largest head-to-head trial, ketamine matched ECT for response in treatment-resistant depression without psychosis, and did far less damage to memory.',
        technicalDetails:
          'Open-label randomised non-inferiority trial at five sites; 403 patients referred to ECT clinics for treatment-resistant major depression without psychosis were randomised 1:1. Over three weeks, ECT three times weekly or ketamine 0.5 mg/kg over 40 minutes twice weekly. Primary outcome was response, a fall of at least 50% in QIDS-SR-16; the non-inferiority margin was -10 percentage points. Response was 55.4% with ketamine and 41.2% with ECT, difference 14.2 percentage points (95% CI 3.9 to 24.2), P<0.001 for non-inferiority. Delayed recall on the Hopkins Verbal Learning Test-Revised fell by -0.9 ± 1.1 T-score points with ketamine and -9.7 ± 1.2 with ECT, recovering gradually over follow-up. Patient-reported quality of life improved similarly. ECT caused musculoskeletal adverse effects; ketamine caused dissociation. The trial was open-label, which is unavoidable when one arm involves a general anaesthetic and a seizure.',
        evidenceSource:
          'Anand A et al. Ketamine versus ECT for Nonpsychotic Treatment-Resistant Major Depression. N Engl J Med 2023;388:2315-2325 (NCT03113968)',
        doi: '10.1056/NEJMoa2302399',
        measuredMetric:
          'Response rate (>=50% QIDS-SR-16 reduction) at 3 weeks, ketamine versus ECT',
        auditFlag: 'verified',
      },
      {
        id: 'ket-a2',
        category: 'measured',
        title: 'Zarate 2006: an effect size of 1.46 at 24 hours from one infusion',
        laymanSummary:
          'Eighteen people with depression that had resisted other treatments got one 40-minute infusion. Seven in ten had responded by the next day.',
        technicalDetails:
          'Randomised, placebo-controlled, double-blind crossover at the NIMH Mood Disorders Research Unit, November 2004 to September 2005. Eighteen subjects with treatment-resistant DSM-IV major depression, two-week drug-free period, then intravenous ketamine hydrochloride 0.5 mg/kg or placebo on two test days a week apart, rated on the 21-item Hamilton Depression Rating Scale. Significant improvement appeared within 110 minutes and persisted through the week. Effect size for the drug difference was d=1.46 (95% CI 0.91 to 2.01) at 24 hours and d=0.68 (95% CI 0.13 to 1.23) at one week. Of 17 subjects treated, 71% met response and 29% met remission criteria the day after infusion; 35% maintained response for at least a week. The blind in this design is compromised by dissociation, which saline does not produce.',
        evidenceSource: 'Zarate CA et al., Arch Gen Psychiatry 2006;63:856-864',
        doi: '10.1001/archpsyc.63.8.856',
        measuredMetric: 'HDRS-21 change at 24 hours and 1 week after a single 0.5 mg/kg infusion',
        auditFlag: 'verified',
      },
      {
        id: 'ket-a3',
        category: 'measured',
        title: 'Ketamine uropathy: 59 heavy users, half with hydronephrosis',
        laymanSummary:
          'Hong Kong urologists described 59 regular ketamine users with severe bladder symptoms. All had bladder inflammation, half had swollen kidneys from back-pressure, and some had permanent kidney damage.',
        technicalDetails:
          'Retrospective series of 59 street-ketamine users referred to two Hong Kong urology units between March 2000 and December 2007. All had moderate to severe lower urinary tract symptoms — frequency, urgency, dysuria, urge incontinence, sometimes painful haematuria — with no bacterial infection. Cystoscopy in 42 (71%) showed epithelial inflammation resembling chronic interstitial cystitis, and all 12 available bladder biopsies had matching histology. Video-urodynamics found detrusor overactivity or reduced bladder compliance, with or without vesico-ureteric reflux, in all 47 patients studied. Thirty (51%) had unilateral or bilateral hydronephrosis; four (7%) had radiological features suggesting papillary necrosis; eight had raised serum creatinine. The authors state explicitly that the series does not establish cause or incidence. Contracted bladder in advanced cases can be irreversible.',
        evidenceSource: 'Chu PS et al., BJU Int 2008;102:1616-1622',
        doi: '10.1111/j.1464-410X.2008.07920.x',
        measuredMetric:
          'Cystoscopic, histological, urodynamic and radiological findings in 59 regular ketamine users',
        auditFlag: 'verified',
      },
      {
        id: 'ket-a4',
        category: 'inferred',
        title:
          'The trials infused it once or twice a week for three weeks; the clinics did not stop there',
        laymanSummary:
          'Every controlled trial on this page used a short, defined course. Maintenance infusions continuing for months or years have no comparable evidence behind them.',
        technicalDetails:
          "Zarate's trial was a single infusion; ELEKT-D was twice weekly for three weeks with a six-month observational follow-up of responders only. Neither establishes an evidence base for indefinite maintenance infusion, for oral or sublingual compounded ketamine, or for at-home unsupervised use, all of which are offered commercially. The known dose- and frequency-dependent harm — the destructive uropathy in the Hong Kong series — is a harm of repeated exposure, so the safety data from a three-week trial does not transfer to a two-year regimen. This is an inference gap, not a demonstrated harm of clinical maintenance dosing: nobody has run the trial that would settle it either way.",
        evidenceSource:
          'Anand A et al., N Engl J Med 2023;388:2315-2325, treatment schedule; Zarate CA et al., Arch Gen Psychiatry 2006;63:856-864, single-infusion design',
        doi: '10.1056/NEJMoa2302399',
        inferredClaim:
          'That efficacy and safety demonstrated over a three-week course of supervised intravenous infusions transfer to open-ended maintenance or to compounded oral formulations at home',
        auditFlag: 'caution',
      },
      {
        id: 'ket-a5',
        category: 'conclusion_shift',
        title: 'From "just an anaesthetic" to the fastest antidepressant, on a seven-patient trial',
        laymanSummary:
          'A drug in use since 1970 was re-read as an antidepressant on the strength of a study with seven completers. Two decades later the finding is one of the most replicated in psychiatry.',
        technicalDetails:
          'Ketalar was approved on 19 February 1970 under NDA 016812 as a dissociative anaesthetic. In 2000 Berman et al. published the first placebo-controlled test of an NMDA antagonist in depression: seven subjects completed two test days with intravenous ketamine 0.5 mg/kg or saline, and the 25-item Hamilton score fell by 14 ± 10 points after ketamine against 0 ± 12 after placebo within 72 hours. Seven completers is a pilot. What makes the case unusual is direction of travel: the finding replicated at NIMH in 2006, then in dozens of trials, then non-inferiority to ECT in 403 patients in 2023, and it produced an approved single-enantiomer product in 2019. The framework it displaced — that antidepressants necessarily act on monoamines and necessarily take weeks — had been assumed rather than tested.',
        evidenceSource:
          'Berman RM et al., Biol Psychiatry 2000;47:351-354; Drugs@FDA NDA 016812, KETALAR, original approval 19 February 1970',
        doi: '10.1016/s0006-3223(99)00230-9',
        measuredMetric:
          'HDRS-25 change 72 hours after a single infusion in the first placebo-controlled trial (n=7 completers)',
        auditFlag: 'verified',
      },
      {
        id: 'ket-a6',
        category: 'inferred',
        title:
          'The mechanism is not settled, and the enantiomer data pull against the simple story',
        laymanSummary:
          'Blocking the glutamate channel is the textbook explanation. But a metabolite that does not block that channel has antidepressant effects in animals, and the weaker-binding enantiomer failed against placebo in humans.',
        technicalDetails:
          'The standard account is NMDA open-channel block on GABAergic interneurons, disinhibiting glutamate release and driving BDNF-dependent synaptogenesis. Two findings complicate it. First, (2R,6R)-hydroxynorketamine, a downstream metabolite, produces antidepressant-like effects in rodents at concentrations that do not antagonise NMDA receptors, implying at least one NMDA-independent route. Second, S-ketamine has three to four times the NMDA affinity of R-ketamine, yet randomised controlled trials of R-ketamine found no significant antidepressant efficacy against placebo — the opposite of what a purely NMDA-affinity-driven account predicts, in the direction of R-ketamine having been over-promised on preclinical grounds. Both observations are in the literature; neither has produced a replacement mechanism.',
        evidenceSource:
          'Johnston JN et al. The antidepressant actions of ketamine and its enantiomers. Pharmacol Ther 2023;246:108431',
        doi: '10.1016/j.pharmthera.2023.108431',
        inferredClaim:
          'That NMDA receptor antagonism is the necessary and sufficient mechanism of the antidepressant effect',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Given by injection, or by nose, or by mouth with poor absorption',
        laymanDesc:
          'Injected into a vein or muscle it works within minutes. Swallowed, most of it is destroyed by the liver before it reaches the blood.',
        molecularDetail:
          'Intravenous bioavailability is complete; intramuscular about 93%; intranasal roughly 25 to 50%; oral 16 to 20% because of extensive first-pass N-demethylation by CYP3A4 and CYP2B6 to norketamine. The clinical antidepressant regimen is 0.5 mg/kg intravenously over 40 minutes.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters the brain fast and enters the ion channel',
        laymanDesc:
          'It crosses into the brain within a minute or two and then has to wait for the glutamate channel to open before it can get inside it.',
        molecularDetail:
          'High lipophilicity gives rapid blood-brain equilibration. Block is use-dependent: the drug enters the NMDA receptor pore only when the channel is opened by glutamate and glycine, and is trapped when it closes.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Plugs the NMDA channel, preferentially on inhibitory cells',
        laymanDesc:
          'The cells that fire most often are blocked first — and those are the inhibitory ones. Taking the brakes off produces a surge of excitatory signal, not a reduction.',
        molecularDetail:
          'Non-competitive block at the PCP site within the pore. Fast-spiking parvalbumin GABAergic interneurons are preferentially affected because block is use-dependent and they fire tonically, producing cortical disinhibition and a glutamate surge measurable as increased AMPA receptor throughput.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'A growth-factor cascade builds new synapses over hours',
        laymanDesc:
          'The glutamate surge triggers the machinery that makes new connections between nerve cells. That takes hours, which matches how long the antidepressant effect takes to appear.',
        molecularDetail:
          'AMPA receptor activation drives BDNF release, TrkB signalling and mTORC1-dependent translation of synaptic proteins, with increased dendritic spine density in prefrontal cortex in rodents. Whether this is the mechanism in humans is inferred from the animal work and the timing, not demonstrated directly.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Depression scores fall within 24 hours and drift back within a week or two',
        laymanDesc:
          'Ratings the next day are dramatically lower. Without repeat dosing, most of that has faded within one to two weeks, which is the whole problem with using it.',
        molecularDetail:
          'Measured endpoints are HDRS-21 at 24 hours and one week, and QIDS-SR-16 response at three weeks. Effect size in the NIMH crossover fell from d=1.46 at 24 hours to d=0.68 at one week. Sustaining the effect is what every subsequent trial has been about.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT03113968 (ELEKT-D, ketamine versus ECT)',
        phase: 'Phase 4 open-label randomised non-inferiority',
        sampleSize: 403,
        primaryEndpoint: 'Response, defined as >=50% reduction in QIDS-SR-16 after 3 weeks',
        endpointMet: true,
        statisticalPValue:
          'Response 55.4% ketamine vs 41.2% ECT, difference 14.2 percentage points (95% CI 3.9 to 24.2), P<0.001 for non-inferiority',
        unreportedAdverseSignals:
          'Delayed recall fell by -9.7 T-score points with ECT versus -0.9 with ketamine. Ketamine caused dissociation; ECT caused musculoskeletal adverse effects. The trial was open-label by necessity.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NIMH crossover (Zarate et al. 2006)',
        phase: 'Phase 2 randomised double-blind crossover',
        sampleSize: 18,
        primaryEndpoint:
          'Change in 21-item Hamilton Depression Rating Scale after a single infusion',
        endpointMet: true,
        statisticalPValue:
          'd = 1.46 (95% CI 0.91 to 2.01) at 24 hours; d = 0.68 (0.13 to 1.23) at 1 week',
        unreportedAdverseSignals:
          'Dissociation during infusion makes the double blind unreliable against a saline comparator; the paper reports the design honestly and cannot repair it.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Berman et al. 2000 (first placebo-controlled trial in depression)',
        phase: 'Phase 2 pilot crossover',
        sampleSize: 7,
        primaryEndpoint: 'Change in 25-item Hamilton Depression Rating Scale within 72 hours',
        endpointMet: true,
        statisticalPValue: 'HDRS-25 fell 14 ± 10 points after ketamine versus 0 ± 12 after saline',
        unreportedAdverseSignals:
          'Seven completers. The result that started the field would not be publishable as evidence of efficacy on its own today.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Non-inferiority to electroconvulsive therapy on 3-week response rate in 403 patients, 55.4% versus 41.2%',
        'A 24-hour effect size of 1.46 against placebo from a single 0.5 mg/kg infusion in 18 treatment-resistant patients',
        'Far smaller memory impairment than ECT: delayed recall -0.9 versus -9.7 T-score points',
        'Interstitial-cystitis-like bladder pathology in 42 of 59 heavy users, with hydronephrosis in 51% and raised creatinine in 8',
      ],
      unsupportedInferences: [
        'That three weeks of supervised infusions establish safety or efficacy for open-ended maintenance dosing or for compounded oral ketamine at home',
        'That NMDA antagonism alone explains the antidepressant effect, when a non-NMDA-antagonist metabolite is active in animals and the higher-affinity enantiomer story does not hold up',
        'That a saline-controlled double blind was maintained in trials of a drug that reliably produces dissociation',
      ],
      whatFailedInitially: [
        'The antidepressant effect from a single infusion decays: d=1.46 at 24 hours falls to d=0.68 at one week',
        'Randomised trials of R-ketamine, the enantiomer preclinical work favoured, found no significant efficacy against placebo',
      ],
      realWorldOutcome: [
        'Ketamine is on the WHO Model List of Essential Medicines as an anaesthetic and is generic, which is why commercial development moved to the single-enantiomer nasal spray',
        'A large private clinic sector delivers infusions off-label under a label written in 1970 for anaesthesia',
      ],
    },
    deliverySystem: {
      type: 'Intravenous or intramuscular injection; off-label intranasal, sublingual and oral routes',
      description:
        'The approved product is an injectable solution for anaesthesia. Psychiatric use is off-label and almost always intravenous at 0.5 mg/kg over 40 minutes with monitoring, because that is the regimen the trials used. Compounded oral, sublingual and nasal formulations are dispensed by some clinics; oral bioavailability is 16 to 20%, so an oral dose is a different exposure profile from the one that was studied.',
      safetyProfile:
        "The anaesthetic label's characteristic problem is emergence phenomena — vivid dreams, delirium and confusion on waking, more common in adults. At subanaesthetic doses the reliable acute effects are dissociation, transient rises in blood pressure and heart rate, nausea and dizziness. Ketamine preserves airway reflexes and respiratory drive better than most anaesthetics, which is why it is used where ventilators are not available. Repeated heavy use causes a destructive ulcerative cystitis with reduced bladder capacity, and in the Hong Kong series 51% of 59 users had hydronephrosis and 7% had features of papillary necrosis; advanced bladder contracture can be irreversible. Ketamine is Schedule III in the United States and produces psychological dependence with tolerance to the dissociative effect.",
    },
    commonQuestions: [
      {
        q: 'Is ketamine approved for depression?',
        a: 'No. The only FDA-approved ketamine products are injectable anaesthetics, under a label first approved on 19 February 1970 that says nothing about depression. Every psychiatric use of racemic ketamine is off-label, which is lawful for a physician and is not the same as approved. The single-enantiomer nasal spray esketamine is separately approved for treatment-resistant depression and has its own record on this site; it is a different product with a different label, a different risk-management programme and a different price.',
      },
      {
        q: 'How does it compare with ECT?',
        a: 'In the one large head-to-head trial, better on the primary endpoint and much better on memory. Among 403 patients referred to ECT clinics for treatment-resistant depression without psychosis, 55.4% responded to ketamine against 41.2% to ECT, which met and exceeded the non-inferiority margin. Delayed verbal recall fell by 0.9 T-score points with ketamine and 9.7 with ECT. The trial was open-label — you cannot blind a seizure — and it excluded psychotic depression, where ECT has its strongest and longest-standing evidence.',
      },
      {
        q: 'What does long-term use do to the bladder?',
        a: 'In heavy recreational users it produces an ulcerative cystitis that is not an infection: bladder wall inflammation, urgency, frequency, pain, blood in the urine, and in advanced cases a shrunken bladder that does not recover. In the Hong Kong series of 59 users, cystoscopy was abnormal in 71%, all biopsies showed interstitial-cystitis-like changes, half had hydronephrosis from back-pressure and eight had raised creatinine. The authors were careful to say their data establish neither cause nor incidence. What is clear is that this is a toxicity of repeated high exposure, and it is the reason frequency matters more than dose here.',
      },
      {
        q: 'Why does this page show no price?',
        a: 'Racemic ketamine is a generic injectable with many suppliers, and the number a reader would actually want — what an infusion clinic charges for a course — is a service fee that varies by clinic and by country, not a published drug price. This site prints prices it can source to a public pricing file, and there is no single such figure for this drug.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Anand A et al. Ketamine versus ECT for Nonpsychotic Treatment-Resistant Major Depression. N Engl J Med 2023;388:2315-2325',
        identifier: '10.1056/NEJMoa2302399',
        kind: 'doi',
      },
      {
        label:
          'Zarate CA et al. A randomized trial of an N-methyl-D-aspartate antagonist in treatment-resistant major depression. Arch Gen Psychiatry 2006;63:856-864',
        identifier: '10.1001/archpsyc.63.8.856',
        kind: 'doi',
      },
      {
        label:
          'Berman RM et al. Antidepressant effects of ketamine in depressed patients. Biol Psychiatry 2000;47:351-354',
        identifier: '10.1016/s0006-3223(99)00230-9',
        kind: 'doi',
      },
      {
        label:
          'Chu PS et al. The destruction of the lower urinary tract by ketamine abuse: a new syndrome? BJU Int 2008;102:1616-1622',
        identifier: '10.1111/j.1464-410X.2008.07920.x',
        kind: 'doi',
      },
      {
        label:
          'Johnston JN et al. The antidepressant actions of ketamine and its enantiomers. Pharmacol Ther 2023;246:108431',
        identifier: '10.1016/j.pharmthera.2023.108431',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: KETALAR (ketamine hydrochloride) injection, NDA 016812, original approval 19 February 1970',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=016812',
        kind: 'regulatory',
      },
      {
        label: 'ClinicalTrials.gov NCT03113968 — ELEKT-D',
        identifier: 'NCT03113968',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 3821 — ketamine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3821',
        kind: 'url',
      },
      {
        label:
          'Controlled Substances Act Schedule III, 21 CFR 1308.13 — ketamine listed at 1308.13(c)',
        identifier: 'https://www.ecfr.gov/current/title-21/chapter-II/part-1308/section-1308.13',
        kind: 'regulatory',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 5. Cannabis (the plant preparation)
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cannabis',
    name: 'Cannabis (Plant Preparation)',
    tradeName:
      'Sold as flower, resin, concentrate and edible. Isolated delta-9-THC and cannabidiol have their own records on this site',
    sponsor:
      'No sponsor. State-licensed cultivators in the United States; Bedrocan and licensed producers in the Netherlands, Canada and Germany',
    targetGene: 'CNR1',
    targetProtein:
      'Cannabinoid CB1 receptor, engaged by delta-9-tetrahydrocannabinol; over 100 other phytocannabinoids and a terpene fraction are present and mostly uncharacterised',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Controlled / No Approved Use',
    indication:
      'The botanical has no FDA-approved indication and remains Schedule I. Rescheduling to Schedule III was proposed on 21 May 2024 and the rulemaking is still open, with a DEA hearing beginning 29 June 2026. A separate final rule of 28 April 2026 placed FDA-approved drug products containing marijuana in Schedule III',
    patientFriendlyIndication:
      'Nothing approved as a plant. Used under state medical-cannabis programmes for chronic pain, chemotherapy nausea and multiple sclerosis spasticity, where the trial evidence is for isolated or standardised cannabinoids rather than for smoked flower',
    anatomicalSite:
      'CB1 receptors on presynaptic terminals throughout cortex, hippocampus, basal ganglia and cerebellum',
    conditionContext: {
      conditionExplainer:
        'Cannabis is a plant preparation, not a molecule. What a person consumes contains delta-9-THC, cannabidiol, dozens of minor cannabinoids and a variable terpene fraction, in proportions that differ between cultivars, harvests and preparations. Almost every clinical trial in the field used a defined cannabinoid — dronabinol, nabiximols, purified cannabidiol — and not the plant.',
      whyItMatters:
        'That gap is the single most important fact about the evidence. A meta-analysis finding moderate-quality evidence for cannabinoids in chronic pain is not a finding about smoked flower of unknown potency, and the potency of what is actually sold has risen sharply over the period the studies span.',
      whoTakesThis:
        'In the United States, adults under state medical or adult-use programmes; a smaller number under research authorisations. Across Europe, patients under national medical-cannabis schemes using standardised, analysed plant material rather than an unregulated supply.',
      clinicalGoals:
        'Where cannabis is used medically the targets are symptomatic: pain scores, spasticity scales, chemotherapy-induced nausea and vomiting. None of the trial evidence addresses disease modification.',
    },
    oneSentenceVerdict:
      'A plant whose principal active molecule is well characterised and whose preparations are not, with moderate-quality trial evidence for cannabinoids in pain and spasticity, a replicated dose-dependent association with psychotic disorder, and a federal schedule that has been under formal review since 2024.',
    laymanHowItWorks:
      "The body already makes its own cannabis-like signalling molecules, which nerve cells release backwards across a synapse to tell the cell upstream to quieten down. THC is close enough in shape to hijack that system, but it arrives everywhere at once and stays far longer than the body's own version, which is switched off within seconds. The result is a broad, indiscriminate turning-down of neurotransmitter release across cortex, hippocampus, basal ganglia and cerebellum — which is why the effects span mood, memory, appetite, coordination and time perception rather than any one of them.",
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 55,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCCCC1=CC(=C2[C@@H]3C=C(CC[C@H]3C(OC2=C1)(C)C)C)O',
      chemicalFormula: 'C21H30O2',
      molecularWeight:
        '314.5 g/mol. THIS IS THE MARKER, NOT THE PREPARATION: the structure shown is delta-9-tetrahydrocannabinol, the principal psychoactive constituent, given here because a structure field holds one molecule and cannabis is a mixture of more than a hundred. Cannabidiol has the same formula and mass and a different structure',
      targetReceptorAffinity:
        'Delta-9-THC is a partial agonist at CB1 and CB2. Cannabidiol is not a CB1 agonist and at some concentrations antagonises CB1 signalling, which is the pharmacological basis of the claim that CBD-rich cultivars produce a different effect; the claim is plausible and not established in controlled human trials of whole plant material.',
      structureSource: {
        label:
          'PubChem CID 16078 (dronabinol, delta-9-tetrahydrocannabinol) — SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16078',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'can-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Potency panel by HPLC with the acids left intact',
          description:
            'Fresh plant material contains almost no delta-9-THC. It contains THCA, the carboxylic acid, which decarboxylates on heating. Liquid chromatography at ambient temperature reports THCA and THC separately; gas chromatography decarboxylates in the injector and reports only the total. "Total THC" is therefore a calculated number, conventionally THC + 0.877 × THCA, and a laboratory that does not say which it reported has not reported a potency.',
          reagentsAndBuffer:
            'THCA-A, delta-9-THC, delta-8-THC, CBDA, CBD, CBN and CBG certified reference standards, methanol/chloroform or ethanol extraction, C18 column, 0.1% formic acid in water and acetonitrile gradient, diode-array detection at 220 and 280 nm',
        },
        {
          id: 'can-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Contaminant screen: pesticides, solvents, heavy metals, microbes and mycotoxins',
          description:
            'Cannabis is a bioaccumulator grown in soil and often extracted with solvents, and it is usually inhaled, so the contaminant panel matters as much as the potency panel. Aspergillus is the organism state programmes screen for; residual butane and other class 1 and 2 solvents come from concentrate production.',
          dependsOnStepId: 'can-w1',
          reagentsAndBuffer:
            'QuEChERS extraction with LC-MS/MS and GC-MS/MS multiresidue pesticide panels, headspace GC-FID for residual solvents, ICP-MS for lead, cadmium, arsenic and mercury, qPCR or plate culture for Aspergillus and total yeast and mould, LC-MS/MS for aflatoxins and ochratoxin A',
        },
        {
          id: 'can-w3',
          stepNumber: 3,
          phase: 'QC',
          name: 'Terpene profile by headspace GC-MS',
          description:
            'The terpene fraction is what distinguishes cultivars by smell and is the basis of most marketing claims about strain-specific effects. Measuring it is straightforward; the pharmacology attached to it in retail settings is not supported by controlled human data, and the measurement is worth having precisely so the claim can be checked against something.',
          dependsOnStepId: 'can-w1',
          reagentsAndBuffer:
            'Headspace or SPME sampling, myrcene, limonene, linalool, beta-caryophyllene, alpha-pinene and terpinolene reference standards, non-polar capillary column, EI-MS with retention-index confirmation',
        },
        {
          id: 'can-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Blood THC and metabolites, with the interpretation problem stated',
          description:
            'Quantify delta-9-THC, 11-hydroxy-THC and the inactive carboxy metabolite THC-COOH in whole blood. The analytical step is routine; the interpretation is not. THC redistributes into fat and returns slowly, so in a frequent user a blood concentration reflects accumulated exposure rather than recent use, and the relationship between blood THC and impairment is much weaker than the corresponding relationship for alcohol. Per-se blood limits rest on an assumption this assay does not support.',
          dependsOnStepId: 'can-w1',
          reagentsAndBuffer:
            'THC-d3, 11-OH-THC-d3 and THC-COOH-d9 internal standards, solid-phase or supported-liquid extraction, derivatisation for GC-MS/MS or direct UHPLC-MS/MS, whole-blood calibrators in the low ng/mL range',
        },
        {
          id: 'can-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'CB1 radioligand binding for the isolated constituents',
          description:
            'Individual cannabinoids are profiled at CB1 and CB2 by competition binding and functional assay. This is where the plant stops being testable as a plant: an extract can be assayed, but the result belongs to that extract at that cannabinoid ratio and does not generalise to the next harvest.',
          dependsOnStepId: 'can-w1',
          reagentsAndBuffer:
            '[3H]-CP55,940 as CB1/CB2 radioligand, membranes from CNR1- or CNR2-transfected HEK293 cells, Tris-HCl buffer with 0.5% bovine serum albumin (cannabinoids adsorb to plastic without it), GTPγS binding for functional efficacy',
        },
      ],
    },
    keyAudits: [
      {
        id: 'can-a1',
        category: 'measured',
        title:
          '79 randomised trials: moderate-quality evidence in pain and spasticity, and small effects',
        laymanSummary:
          'A JAMA review pooled 79 trials in 6,462 people. Cannabinoids beat placebo for chemotherapy nausea and moved pain and spasticity scores a little. Only four of the 79 trials were judged at low risk of bias.',
        technicalDetails:
          'Whiting et al. searched 28 databases to April 2015 and included 79 randomised trials, 6,462 participants; 4 were judged at low risk of bias. Complete nausea and vomiting response was 47% versus 20% (OR 3.82, 95% CI 1.55 to 9.42, 3 trials). Pain response was 37% versus 31% (OR 1.41, 95% CI 0.99 to 2.00, 8 trials) with a weighted mean difference of -0.46 points on a 0-10 numerical rating scale (95% CI -0.80 to -0.11, 6 trials). Ashworth spasticity fell by a weighted mean of -0.36 (95% CI -0.69 to -0.05, 7 trials). The authors graded evidence as moderate quality for chronic pain and spasticity and low quality for nausea and vomiting, HIV weight gain, sleep and Tourette syndrome, and recorded an increased risk of short-term adverse events including serious ones. Almost all the included trials used defined cannabinoid products, not smoked plant material.',
        evidenceSource: 'Whiting PF et al. Cannabinoids for Medical Use. JAMA 2015;313:2456-2473',
        doi: '10.1001/jama.2015.6358',
        measuredMetric:
          'Pooled odds ratios and weighted mean differences for pain, spasticity and nausea across 79 randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'can-a2',
        category: 'measured',
        title:
          'EU-GEI: daily use of high-potency cannabis carried nearly five times the odds of psychosis',
        laymanSummary:
          'Across eleven European sites, people with a first episode of psychosis were far more likely to be daily users of high-strength cannabis. Where high-strength cannabis was common, first-episode rates were higher.',
        technicalDetails:
          'Multicentre case-control study, 901 patients aged 18 to 64 with first-episode psychosis and 1,237 population controls across 11 sites in Europe and Brazil, May 2010 to April 2015. Types of cannabis were classified by expected THC concentration into low potency (<10%) and high potency (>=10%). Daily use carried an adjusted odds ratio of 3.2 (95% CI 2.2 to 4.1) versus never use, rising to 4.8 (2.5 to 6.3) for daily use of high-potency types. Assuming causality, the population attributable fraction for high-potency cannabis was 12.2% (3.0 to 16.1) across all sites, 30.3% (15.2 to 40.0) in London and 50.3% (27.4 to 66.0) in Amsterdam. Site-level incidence correlated with prevalence of high-potency use (r=0.7, p=0.0286) and of daily use (r=0.8, p=0.0109). The design is case-control: it measures association and cannot exclude reverse causation or shared liability, and the authors state the causal assumption explicitly when reporting the attributable fractions.',
        evidenceSource: 'Di Forti M et al., Lancet Psychiatry 2019;6:427-436',
        doi: '10.1016/S2215-0366(19)30048-3',
        measuredMetric:
          'Adjusted odds ratio for first-episode psychotic disorder by frequency and potency of cannabis use',
        auditFlag: 'verified',
      },
      {
        id: 'can-a3',
        category: 'inferred',
        title: 'The trials studied cannabinoids; the dispensary sells a plant',
        laymanSummary:
          'The evidence base for medical cannabis is almost entirely built on defined drugs with known doses. Smoked flower of unknown potency is not the thing that was tested.',
        technicalDetails:
          'Of the 79 trials in the JAMA review, the interventions were overwhelmingly nabiximols, dronabinol, nabilone, purified cannabidiol and defined extracts — products with a stated milligram content and a fixed cannabinoid ratio. Whole-plant material is variable by cultivar, harvest, storage and preparation; the delivered dose from inhalation additionally depends on the person\'s inhalation pattern. The result is that a systematic review of "cannabinoids for medical use" cannot be read as a review of cannabis as consumed, and the direction of the discrepancy is not knowable in advance: the plant could be more effective than the isolate through additive constituents, or less, and no adequately powered trial of standardised whole-plant material against placebo exists for the main indications.',
        evidenceSource:
          'Whiting PF et al., JAMA 2015;313:2456-2473, intervention list; and NASEM, The Health Effects of Cannabis and Cannabinoids, 2017',
        doi: '10.17226/24625',
        inferredClaim:
          'That trial results obtained with dronabinol, nabiximols and purified cannabinoids transfer to inhaled plant material of unstated composition',
        auditFlag: 'caution',
      },
      {
        id: 'can-a4',
        category: 'measured',
        title: 'Cannabinoid hyperemesis syndrome: described in 2004, initially disbelieved',
        laymanSummary:
          'Heavy long-term users can develop cycles of severe vomiting that stop when they stop using and come back when they restart. Hot showers relieve it, which is how the syndrome was first spotted.',
        technicalDetails:
          'Allen et al. described a series of chronic cannabis users in South Australia presenting with cyclical vomiting, in whom symptoms resolved on cessation and recurred on rechallenge, and who used compulsive hot bathing for relief. The paradox — an antiemetic drug causing intractable vomiting — meant the syndrome was doubted for years before independent case series accumulated. It is now a recognised presentation in emergency medicine. Frequency is not established; the syndrome is defined by the temporal relationship to use and by resolution on abstinence, which is also the only reliable treatment.',
        evidenceSource:
          'Allen JH et al. Cannabinoid hyperemesis: cyclical hyperemesis in association with chronic cannabis abuse. Gut 2004;53:1566-1570',
        doi: '10.1136/gut.2003.036350',
        measuredMetric:
          'Symptom resolution on cessation and recurrence on rechallenge in a chronic-user case series',
        auditFlag: 'verified',
      },
      {
        id: 'can-a5',
        category: 'conclusion_shift',
        title:
          'Federal rescheduling has been formally under way since May 2024 and is not finished',
        laymanSummary:
          'The Justice Department proposed moving cannabis from Schedule I to Schedule III in 2024. The hearing was cancelled, restarted, and began again in June 2026. Meanwhile FDA-approved drug products containing marijuana were moved to Schedule III by a separate final rule.',
        technicalDetails:
          'A notice of proposed rulemaking published 21 May 2024 proposed transferring marijuana from Schedule I to Schedule III of the Controlled Substances Act. DEA published a notice of hearing on 29 August 2024. On 28 April 2026 DEA withdrew that notice and terminated the pending hearing proceedings (91 FR 22778), and in the same issue published a new notice of hearing with proceedings beginning 29 June 2026 (91 FR 22777), citing Executive Order 14370. Separately and on the same date, a final rule (91 FR 22714) placed FDA-approved drug products containing marijuana in Schedule III, an action taken to satisfy United States obligations under the Single Convention on Narcotic Drugs. The botanical itself remains in Schedule I while the rulemaking is open. Schedule III would not make cannabis a prescribable medicine: it would remove the Schedule I research barriers and the section 280E tax treatment, and leave FDA approval as a separate requirement no plant preparation has met.',
        evidenceSource:
          'Federal Register 91 FR 22777, 91 FR 22778 and 91 FR 22714, all 28 April 2026, Drug Enforcement Administration',
        measuredMetric: 'Status of the marijuana rescheduling rulemaking as of this audit',
        auditFlag: 'contested',
      },
      {
        id: 'can-a6',
        category: 'inferred',
        title: 'Blood THC is not a blood alcohol concentration, and per-se limits assume it is',
        laymanSummary:
          'THC hides in body fat and leaks back out for days. In a frequent user, a blood level says how much has accumulated, not how impaired they are right now.',
        technicalDetails:
          'Delta-9-THC is highly lipophilic and distributes into adipose tissue, from which it redistributes over days to weeks in frequent users. Blood concentration therefore falls rapidly after inhalation while impairment persists, and remains detectable in frequent users long after impairment has resolved — the two curves diverge in opposite directions in different populations. The consequence is that a per-se blood threshold of the kind used for alcohol has a much weaker relationship to functional impairment, and this is a measurement fact about the analyte, not a policy opinion. The analytical measurement is reliable; the inference drawn from it is the problem.',
        evidenceSource:
          'Volkow ND et al. Adverse Health Effects of Marijuana Use. N Engl J Med 2014;370:2219-2227; NASEM 2017, chapter on injury and death',
        doi: '10.1056/NEJMra1402309',
        inferredClaim:
          'That a whole-blood delta-9-THC concentration indexes current impairment the way a blood alcohol concentration does',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Inhaled, or eaten and converted into something stronger',
        laymanDesc:
          'Inhaled, it reaches the brain in minutes. Eaten, it takes an hour or more and the liver turns it into a metabolite that is more potent than the original — which is why edibles behave differently.',
        molecularDetail:
          'Inhalation gives peak plasma THC within minutes with bioavailability of roughly 10 to 35%, highly dependent on inhalation topography. Oral bioavailability is about 6 to 20% with peak at 1 to 3 hours, and extensive first-pass conversion to 11-hydroxy-THC, which is CB1-active and crosses into the brain readily.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Distributes into fat and comes back out slowly',
        laymanDesc:
          'The molecule is extremely greasy. It leaves the blood into fatty tissue quickly and returns from it over days, which is why tests stay positive long after the effects have gone.',
        molecularDetail:
          'Very high lipophilicity and 95 to 99% plasma protein binding. Rapid distribution into adipose tissue with slow redistribution; terminal elimination half-life in frequent users is measured in days. THC-COOH, the inactive carboxy metabolite, is the analyte urine screens detect.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Partially activates CB1 receptors everywhere at once',
        laymanDesc:
          "It docks into a receptor that normally responds to the body's own short-lived signalling molecules — but it arrives across the whole brain and stays for hours.",
        molecularDetail:
          'Partial agonism at CB1, a Gi/o-coupled receptor located presynaptically throughout cortex, hippocampus, basal ganglia, cerebellum and hypothalamus. Endogenous ligands anandamide and 2-arachidonoylglycerol are synthesised on demand and hydrolysed within seconds; THC is neither localised nor rapidly cleared.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Neurotransmitter release is turned down across many circuits',
        laymanDesc:
          "The receptor's job is to tell the upstream nerve cell to release less. Doing that everywhere produces effects on memory, appetite, mood, coordination and time sense together.",
        molecularDetail:
          'CB1 activation inhibits adenylyl cyclase and presynaptic calcium channels, suppressing release of glutamate, GABA, dopamine and other transmitters. Circuit-specific consequences follow from receptor density: hippocampal CB1 for short-term memory, basal ganglia and cerebellum for movement, hypothalamic and mesolimbic for appetite and reward.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptom scores move a little; risk accrues with frequency and potency',
        laymanDesc:
          'In trials of defined cannabinoids the effects on pain and spasticity are real and small. The documented harms — psychosis risk, dependence, hyperemesis — track how often and how strongly a person uses.',
        molecularDetail:
          'Measured endpoints are 0-10 pain scales, the Ashworth spasticity scale and complete-response rates for chemotherapy-induced nausea. The psychosis association is dose-dependent by frequency and by THC concentration, with an adjusted odds ratio of 4.8 for daily high-potency use in EU-GEI. Tolerance to most effects develops with regular use, and a withdrawal syndrome with irritability, sleep disturbance and appetite change is recognised in DSM-5.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Whiting et al. 2015 systematic review and meta-analysis',
        phase: 'Systematic review of 79 randomised trials',
        sampleSize: 6462,
        primaryEndpoint:
          'Pain response, spasticity score and complete nausea and vomiting response versus placebo',
        endpointMet: true,
        statisticalPValue:
          'Nausea complete response OR 3.82 (95% CI 1.55 to 9.42); pain OR 1.41 (0.99 to 2.00); pain NRS WMD -0.46 (-0.80 to -0.11); Ashworth WMD -0.36 (-0.69 to -0.05)',
        unreportedAdverseSignals:
          'Only 4 of 79 trials were judged at low risk of bias, and cannabinoids carried an increased risk of short-term adverse events including serious ones.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'EU-GEI multicentre case-control study',
        phase: 'Observational case-control, 11 sites',
        sampleSize: 2138,
        primaryEndpoint:
          'Odds of first-episode psychotic disorder by pattern and potency of cannabis use',
        endpointMet: true,
        statisticalPValue:
          'Daily use adjusted OR 3.2 (95% CI 2.2 to 4.1); daily high-potency use OR 4.8 (2.5 to 6.3)',
        unreportedAdverseSignals:
          'Case-control design: association only. The population attributable fractions are calculated under an explicitly stated assumption of causality.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 0.46-point reduction on a 0-10 pain scale and a 0.36-point reduction in Ashworth spasticity, pooled across randomised trials of defined cannabinoids',
        'Complete chemotherapy nausea and vomiting response in 47% versus 20% on placebo across three trials',
        'An adjusted odds ratio of 4.8 for first-episode psychotic disorder with daily use of cannabis containing 10% or more THC',
        'Cyclical vomiting resolving on cessation and recurring on rechallenge in chronic users',
      ],
      unsupportedInferences: [
        'That trial results from dronabinol, nabiximols and purified cannabinoids describe what inhaled plant material of unstated potency does',
        'That a whole-blood THC concentration indexes current impairment the way a blood alcohol concentration does',
        'That the terpene profile of a named cultivar predicts a distinct clinical effect — the profile is measurable, the effect claim is not tested',
        'That Schedule III would make cannabis a prescribable medicine; FDA approval is a separate requirement no plant preparation has met',
      ],
      whatFailedInitially: [
        'Cannabinoid hyperemesis syndrome was doubted for years because an antiemetic causing intractable vomiting looked implausible, until independent case series accumulated',
        'Only 4 of the 79 trials in the largest systematic review were judged at low risk of bias, which is the real state of this evidence base',
      ],
      realWorldOutcome: [
        'The botanical remains Schedule I while the rescheduling rulemaking opened in May 2024 stays unresolved, with a DEA hearing beginning 29 June 2026',
        'A final rule of 28 April 2026 placed FDA-approved drug products containing marijuana in Schedule III, separating the approved products from the plant',
      ],
    },
    deliverySystem: {
      type: 'Inhaled flower or concentrate, oral edible, oral oil, topical preparation',
      description:
        'Route changes the drug substantially. Inhalation delivers THC within minutes and gives the user rapid feedback on dose. Oral dosing takes one to three hours and produces 11-hydroxy-THC through first-pass metabolism, a more potent CB1 agonist than the parent — the pharmacological basis for the well-documented pattern of accidental over-consumption with edibles. Concentrates raise the delivered dose per inhalation by an order of magnitude over dried flower.',
      safetyProfile:
        'Acute effects include tachycardia, conjunctival injection, impaired short-term memory, impaired coordination and reaction time, and anxiety or panic, which is dose-related and commoner in inexperienced users. Acute psychotic symptoms can occur at high THC exposure. With regular use: a DSM-5 cannabis use disorder with a recognised withdrawal syndrome, cannabinoid hyperemesis syndrome in a minority of chronic heavy users, and the dose-dependent association with psychotic disorder measured in EU-GEI. Smoking delivers combustion products; the respiratory evidence is confounded by concurrent tobacco use in most cohorts. Cannabis is not associated with fatal overdose through respiratory depression, because CB1 receptors are sparse in the brainstem respiratory centres.',
    },
    commonQuestions: [
      {
        q: 'Does cannabis cause psychosis?',
        a: 'The association is strong, dose-dependent and replicated; the causal question is not settled by the study designs available. EU-GEI found daily use carried three times the odds of a first psychotic episode and daily use of high-potency cannabis nearly five times, and site-level incidence tracked how common high-potency use was in that city. Case-control studies cannot rule out that early psychotic symptoms drive heavier use, or that a shared genetic liability drives both. What the data do support is that the risk scales with frequency and with THC concentration, which is a more useful statement than a yes or no.',
        auditNote:
          'The population attributable fractions in that paper — 12% across sites, 30% in London, 50% in Amsterdam — are calculated under an explicitly stated assumption of causality. They are widely quoted without that clause.',
      },
      {
        q: 'Is medical cannabis proven to work?',
        a: 'Cannabinoids are, modestly, for a few things. The largest systematic review found moderate-quality evidence for chronic pain and for multiple sclerosis spasticity, with effects of about half a point on a ten-point pain scale, and low-quality evidence for chemotherapy nausea, HIV weight gain, sleep and Tourette syndrome. Four of the 79 trials were at low risk of bias. Almost all of them used defined products with a stated milligram dose, not the plant. So the accurate answer is that some cannabinoids have modest evidence for some symptoms, and that this is not the same claim as "medical cannabis works".',
      },
      {
        q: 'Why is it still Schedule I if rescheduling was proposed in 2024?',
        a: 'Because a proposed rule is not a rule. The Justice Department published the proposal on 21 May 2024, DEA noticed a hearing that August, and on 28 April 2026 DEA withdrew that notice, terminated the proceedings and issued a fresh notice of hearing beginning 29 June 2026. The botanical stays in Schedule I until a final rule says otherwise. A separate final rule on the same day did move FDA-approved drug products containing marijuana into Schedule III — that is a narrow action about approved medicines, not about the plant.',
      },
      {
        q: 'Why does the structure on this page show only THC?',
        a: 'Because the field holds one molecule and cannabis is not one molecule. Delta-9-THC is shown as the marker for the principal psychoactive constituent, in the same way a botanical extract is standardised to a named compound. The preparation a person actually consumes contains over a hundred cannabinoids plus a terpene fraction in ratios that vary by cultivar and harvest, and the structure shown does not describe it. Isolated delta-9-THC and cannabidiol have their own records on this site.',
      },
      {
        q: 'Why does this page show no price?',
        a: 'There is no approved product and therefore no list price or acquisition cost. State dispensary retail prices are real transaction prices but they vary by state, licence class and tax regime and there is no single sourceable figure, so this page prints none.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Whiting PF et al. Cannabinoids for Medical Use: A Systematic Review and Meta-analysis. JAMA 2015;313:2456-2473',
        identifier: '10.1001/jama.2015.6358',
        kind: 'doi',
      },
      {
        label:
          'Di Forti M et al. The contribution of cannabis use to variation in the incidence of psychotic disorder across Europe (EU-GEI). Lancet Psychiatry 2019;6:427-436',
        identifier: '10.1016/S2215-0366(19)30048-3',
        kind: 'doi',
      },
      {
        label:
          'National Academies of Sciences, Engineering, and Medicine. The Health Effects of Cannabis and Cannabinoids: The Current State of Evidence and Recommendations for Research. Washington DC: The National Academies Press, 2017',
        identifier: '10.17226/24625',
        kind: 'doi',
      },
      {
        label:
          'Allen JH et al. Cannabinoid hyperemesis: cyclical hyperemesis in association with chronic cannabis abuse. Gut 2004;53:1566-1570',
        identifier: '10.1136/gut.2003.036350',
        kind: 'doi',
      },
      {
        label:
          'Volkow ND et al. Adverse Health Effects of Marijuana Use. N Engl J Med 2014;370:2219-2227',
        identifier: '10.1056/NEJMra1402309',
        kind: 'doi',
      },
      {
        label:
          'Federal Register 91 FR 22777 (28 April 2026) — DEA notice of hearing on the proposed rescheduling of marijuana to Schedule III, proceedings beginning 29 June 2026',
        identifier:
          'https://www.federalregister.gov/documents/2026/04/28/2026-08177/schedules-of-controlled-substances-rescheduling-of-marijuana',
        kind: 'regulatory',
      },
      {
        label:
          'Federal Register 91 FR 22778 (28 April 2026) — DEA withdrawal of the 29 August 2024 notice of hearing and termination of the pending proceedings',
        identifier:
          'https://www.federalregister.gov/documents/2026/04/28/2026-08178/schedules-of-controlled-substances-rescheduling-of-marijuana-withdrawal',
        kind: 'regulatory',
      },
      {
        label:
          'Federal Register 91 FR 22714 (28 April 2026) — final rule placing FDA-approved drug products containing marijuana in Schedule III',
        identifier:
          'https://www.federalregister.gov/documents/2026/04/28/2026-08176/schedules-of-controlled-substances-rescheduling-of-food-and-drug-administration-approved-products',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 16078 — delta-9-tetrahydrocannabinol, shown as the marker constituent for this preparation',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16078',
        kind: 'url',
      },
      CSA_SCHEDULES_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 6. Delta-9-tetrahydrocannabinol
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tetrahydrocannabinol',
    name: 'Delta-9-Tetrahydrocannabinol (THC)',
    tradeName: 'Marinol and Syndros as dronabinol, the synthetic form; a component of nabiximols',
    sponsor:
      'Marinol NDA 018651, currently Alkem Laboratories; Syndros NDA 205525, Wellhouse Pharma (discontinued); generic dronabinol capsules from several manufacturers',
    targetGene: 'CNR1',
    targetProtein: 'Cannabinoid CB1 receptor, with partial agonism also at CB2',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1985,
    indication:
      'As dronabinol: nausea and vomiting associated with cancer chemotherapy in patients who have failed to respond adequately to conventional antiemetics, and anorexia associated with weight loss in patients with AIDS. Delta-9-THC as a constituent of cannabis remains Schedule I; dronabinol capsules are Schedule III and the oral solution was Schedule II',
    patientFriendlyIndication:
      'Chemotherapy sickness that other anti-sickness drugs have not controlled, and appetite loss with weight loss in AIDS',
    anatomicalSite:
      'CB1 receptors on presynaptic terminals in cortex, hippocampus, basal ganglia, cerebellum and hypothalamus; area postrema for the antiemetic effect',
    conditionContext: {
      conditionExplainer:
        'Delta-9-THC is the molecule that makes cannabis psychoactive, and it has been an approved medicine in the United States since 1985 under the name dronabinol. The same molecule is in Schedule I when it comes from a plant and Schedule III when it is synthesised and put in a capsule.',
      whyItMatters:
        'It means the scheduling question about cannabis has never been a question about this molecule. Delta-9-THC has an accepted medical use, an FDA label, a defined dose in milligrams and forty years of prescribing experience. What it does not have is an approval for the indications most people use cannabis for.',
      whoTakesThis:
        'Patients with chemotherapy-induced nausea and vomiting refractory to conventional antiemetics, and patients with AIDS-related anorexia and weight loss. In research, healthy volunteers given intravenous THC in psychosis-modelling studies.',
      clinicalGoals:
        'Control of emesis when 5-HT3 antagonists and steroids have failed, and appetite stimulation with weight maintenance.',
    },
    oneSentenceVerdict:
      'The psychoactive constituent of cannabis, approved as a prescription antiemetic in 1985, which reproduces transient positive and negative symptoms of schizophrenia in healthy volunteers at 2.5 to 5 mg intravenously.',
    laymanHowItWorks:
      "THC is shaped enough like the body's own cannabinoid signals to fit the same receptor, which sits on the sending end of a synapse and tells it to release less transmitter. The body makes its own version on demand and destroys it within seconds; THC arrives everywhere and stays for hours. In the vomiting centre of the brainstem that broad damping is useful, which is what the prescription product is for. In the cortex and hippocampus the same damping produces the memory, perception and thought effects — and at a high enough dose, symptoms that look like a brief episode of psychosis.",
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCCCC1=CC(=C2[C@@H]3C=C(CC[C@H]3C(OC2=C1)(C)C)C)O',
      chemicalFormula: 'C21H30O2',
      molecularWeight:
        '314.5 g/mol. The active natural isomer is (-)-trans-delta-9-THC, which is what dronabinol is; delta-8-THC is a positional isomer with the same formula and mass and has its own record on this site',
      targetReceptorAffinity:
        'Partial agonist at CB1 and CB2, low nanomolar affinity at both. Partial rather than full agonism matters: it means THC produces a submaximal response and can behave as a functional antagonist against a full agonist, which is the pharmacological reason synthetic full-agonist cannabinoids like JWH-018 are qualitatively more dangerous.',
      structureSource: {
        label:
          'PubChem CID 16078 (dronabinol, delta-9-tetrahydrocannabinol) — SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16078',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'thc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Isomer-resolving identification of delta-9 against delta-8',
          description:
            'Delta-9- and delta-8-THC are positional isomers: same formula, same nominal mass, near-identical mass spectra. They separate on retention time, not on mass, so an identification that rests on the mass spectrum alone cannot tell them apart. This is the single most consequential analytical distinction in the cannabinoid field, because the two isomers sit in different legal categories in the United States.',
          reagentsAndBuffer:
            'Delta-9-THC and delta-8-THC certified reference standards, delta-9-THC-d3 internal standard, C18 or biphenyl column with shallow acetonitrile gradient, diode-array detection at 220 nm with MS confirmation',
        },
        {
          id: 'thc-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Content and stability assay for a capsule or oral solution',
          description:
            'Dronabinol is an oil dissolved in sesame oil in a soft gelatin capsule, and it oxidises to cannabinol on exposure to air and light. Content assay against a reference standard plus a cannabinol limit is what distinguishes a within-specification product from a degraded one, and it is the reason the label carries refrigerated storage.',
          dependsOnStepId: 'thc-w1',
          reagentsAndBuffer:
            'Dronabinol reference standard, cannabinol reference standard as the degradation marker, ethanol extraction from the capsule fill, reversed-phase HPLC-UV, amber glassware throughout',
        },
        {
          id: 'thc-w3',
          stepNumber: 3,
          phase: 'Cellular_Delivery',
          name: 'CB1- and CB2-expressing membranes for binding work',
          description:
            'Membranes prepared from HEK293 or CHO cells expressing human CNR1 or CNR2 separately. Cannabinoids adsorb strongly to plastic and glass, so every buffer in this workflow carries bovine serum albumin — an assay run without it systematically underestimates potency.',
          dependsOnStepId: 'thc-w1',
          reagentsAndBuffer:
            'HEK293 or CHO cells with human CNR1 or CNR2 constructs, membrane preparation by differential centrifugation, Tris-HCl with 0.5% fatty-acid-free bovine serum albumin, siliconised tubes',
        },
        {
          id: 'thc-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Competition binding and GTP-gamma-S functional efficacy',
          description:
            'Affinity comes from displacement of a labelled cannabinoid; efficacy comes from stimulation of GTP-gamma-S binding, expressed relative to a reference full agonist. The efficacy number is the one that separates THC from the synthetic cannabinoids, and it is the number retail descriptions of "synthetic THC" leave out.',
          dependsOnStepId: 'thc-w3',
          reagentsAndBuffer:
            '[3H]-CP55,940 radioligand, unlabelled CP55,940 or WIN55,212-2 as the full-agonist reference, [35S]-GTP-gamma-S, GDP-containing assay buffer, glass-fibre filter harvest with polyethyleneimine pretreatment',
        },
        {
          id: 'thc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Plasma THC, 11-hydroxy-THC and THC-COOH',
          description:
            'Quantify the parent, the active 11-hydroxy metabolite and the inactive carboxy metabolite. The ratio between them carries the information: a high 11-hydroxy-THC to THC ratio indicates oral rather than inhaled administration, and THC-COOH alone indicates exposure at some point in the preceding days or weeks with no timing information at all.',
          dependsOnStepId: 'thc-w1',
          reagentsAndBuffer:
            'THC-d3, 11-OH-THC-d3 and THC-COOH-d9 internal standards, supported-liquid extraction, UHPLC-MS/MS with calibrators down to 0.5 ng/mL in whole blood',
        },
      ],
    },
    keyAudits: [
      {
        id: 'thc-a1',
        category: 'measured',
        title:
          'Intravenous THC produced transient schizophrenia-like symptoms in 22 healthy people',
        laymanSummary:
          'Given 2.5 or 5 mg of pure THC into a vein, healthy volunteers with no psychiatric history developed brief positive and negative symptoms resembling schizophrenia, along with memory and attention deficits.',
        technicalDetails:
          'Three-day, double-blind, randomised, counterbalanced study in 22 healthy individuals who had used cannabis but had never met criteria for a cannabis use disorder, comparing 0, 2.5 and 5 mg intravenous delta-9-THC. THC produced schizophrenia-like positive and negative symptoms, altered perception, increased anxiety and euphoria; disrupted immediate and delayed word recall while sparing recognition recall; impaired distractibility, verbal fluency and working memory; did not impair orientation; and raised plasma cortisol. Prospective safety follow-up at 1, 3 and 6 months was collected. The dissociation between recall and recognition is the informative detail: it localises the deficit to retrieval rather than to encoding failure or global sedation.',
        evidenceSource: "D'Souza DC et al., Neuropsychopharmacology 2004;29:1558-1572",
        doi: '10.1038/sj.npp.1300496',
        measuredMetric:
          'PANSS-rated positive and negative symptoms and cognitive battery after 2.5 and 5 mg intravenous THC',
        auditFlag: 'verified',
      },
      {
        id: 'thc-a2',
        category: 'measured',
        title: 'Seized cannabis potency tripled and the THC:CBD ratio went from 14:1 to 80:1',
        laymanSummary:
          'Across 38,681 DEA-seized samples, average THC content rose from about 4% in 1995 to about 12% in 2014 while CBD fell, so the ratio between them changed almost six-fold.',
        technicalDetails:
          'ElSohly et al. analysed 38,681 cannabis preparations confiscated by the DEA between 1 January 1995 and 31 December 2014 by validated GC-FID. Mean potency of illicit cannabis plant material rose from approximately 4% in 1995 to approximately 12% in 2014, with a shift in production from regular marijuana to sinsemilla. Mean cannabidiol content fell from about 0.28% in 2001 to below 0.15% in 2014. The resulting delta-9-THC to cannabidiol ratio moved from about 14 to about 80 over the period. The dataset is DEA seizures, so it describes the illicit supply of that era rather than the legal-market product that followed, and it is the empirical basis for the statement that studies of cannabis conducted before 2000 studied a materially different preparation.',
        evidenceSource: 'ElSohly MA et al., Biol Psychiatry 2016;79:613-619',
        doi: '10.1016/j.biopsych.2016.01.004',
        measuredMetric:
          'Delta-9-THC and cannabidiol content of 38,681 seized samples, 1995 to 2014',
        auditFlag: 'verified',
      },
      {
        id: 'thc-a3',
        category: 'conclusion_shift',
        title: 'The same molecule is Schedule I from a plant and Schedule III in a capsule',
        laymanSummary:
          'Delta-9-THC in cannabis is in the schedule for drugs with no accepted medical use. Delta-9-THC synthesised and put in a sesame-oil capsule has been an approved prescription medicine since 1985.',
        technicalDetails:
          'Marinol, dronabinol soft gelatin capsules, was approved on 31 May 1985 under NDA 018651 for chemotherapy-induced nausea and vomiting refractory to conventional antiemetics, with the AIDS anorexia indication added later. Syndros, dronabinol oral solution, was approved on 1 July 2016 under NDA 205525 and is now discontinued. Dronabinol capsules sit in Schedule III; the oral solution was placed in Schedule II. Delta-9-THC as a constituent of the cannabis plant remains in Schedule I. Because the molecule is identical, the schedule is doing work that has nothing to do with the pharmacology: it is tracking the source and the formulation, and the "no currently accepted medical use" finding for Schedule I coexists with a forty-year-old FDA label for the same substance.',
        evidenceSource:
          'Drugs@FDA NDA 018651 (MARINOL, approved 31 May 1985) and NDA 205525 (SYNDROS, approved 1 July 2016); 21 CFR 1308.11 and 1308.13',
        measuredMetric:
          'Regulatory classification of the identical molecule by source and formulation',
        auditFlag: 'verified',
      },
      {
        id: 'thc-a4',
        category: 'inferred',
        title: 'A capsule of dronabinol is not the same exposure as an inhaled dose of THC',
        laymanSummary:
          'Swallowed, most THC is destroyed by the liver first and what survives is converted to a more potent metabolite over an hour or more. Inhaled, it hits the brain in minutes as the parent molecule.',
        technicalDetails:
          "Oral dronabinol has bioavailability of roughly 10 to 20% with peak plasma concentrations at 1 to 3 hours, and undergoes extensive first-pass conversion to 11-hydroxy-delta-9-THC, itself a CB1 agonist that crosses the blood-brain barrier readily. Inhalation delivers the parent compound with peak concentrations within minutes and much less 11-hydroxy metabolite. The two routes therefore differ in onset by an order of magnitude, in the identity of the predominant active species, and in the user's ability to titrate. Efficacy and safety established for oral dronabinol in a labelled indication do not transfer to inhaled THC, and neither do the label's dosing intervals.",
        evidenceSource:
          'Marinol prescribing information, NDA 018651, pharmacokinetics section; Volkow ND et al., N Engl J Med 2014;370:2219-2227',
        doi: '10.1056/NEJMra1402309',
        inferredClaim:
          'That the pharmacokinetics and clinical evidence for oral dronabinol describe inhaled delta-9-THC',
        auditFlag: 'caution',
      },
      {
        id: 'thc-a5',
        category: 'measured',
        title: 'Partial agonism is why THC has a ceiling and the synthetics do not',
        laymanSummary:
          'THC only partly switches the receptor on, so pushing the dose up stops adding effect at some point. The laboratory-made cannabinoids sold as spice switch it on fully, which is why they behave differently.',
        technicalDetails:
          'In [35S]-GTP-gamma-S functional assays delta-9-THC produces a submaximal response relative to full agonists such as CP55,940 and WIN55,212-2, and behaves as a partial agonist at CB1. A partial agonist has a ceiling on its maximal effect and can reduce the response to a full agonist by competing for the same site. The practical consequence appears on the synthetic cannabinoid page: JWH-018 and its successors are full agonists with higher CB1 affinity, so their dose-response has no comparable ceiling, and clinical presentations of seizure, agitated delirium and death occur with them and not with delta-9-THC.',
        evidenceSource:
          'Standard CB1 pharmacology as summarised in NASEM 2017 and in the receptor-binding literature; efficacy measured relative to CP55,940 in GTP-gamma-S assays',
        doi: '10.17226/24625',
        measuredMetric:
          'Maximal GTP-gamma-S stimulation at CB1 relative to a full agonist reference',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed in an oil capsule, or inhaled',
        laymanDesc:
          'The prescription form is an oil in a capsule taken by mouth. It works within an hour or two. Inhaled, the same molecule works in minutes.',
        molecularDetail:
          'Dronabinol is delta-9-THC dissolved in sesame oil. Oral bioavailability 10 to 20% with peak at 1 to 3 hours and extensive first-pass conversion to 11-hydroxy-THC. Inhalation gives peak plasma concentrations within minutes with a much lower metabolite-to-parent ratio.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Partitions into fat and into the brain',
        laymanDesc:
          'It is one of the greasiest drugs in common use, so it leaves the blood fast — into brain tissue, and into body fat where it lingers.',
        molecularDetail:
          'Log P around 7 with 95 to 99% plasma protein binding. Rapid brain uptake, extensive adipose sequestration and slow redistribution give a terminal half-life measured in days in frequent users.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Partially activates CB1 on the sending side of the synapse',
        laymanDesc:
          'It docks into a receptor whose job is to tell a nerve terminal to release less. It only half-activates it, which puts a ceiling on the effect.',
        molecularDetail:
          'Partial agonism at Gi/o-coupled CB1, inhibiting adenylyl cyclase and presynaptic voltage-gated calcium channels. Submaximal GTP-gamma-S stimulation relative to full agonists is the measurement that defines the partial agonism.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Emetic reflex damped; cortical and hippocampal signalling damped too',
        laymanDesc:
          'In the brainstem vomiting centre that damping is the therapeutic effect. In the memory and perception circuits it is the side effect, or the point, depending on why it was taken.',
        molecularDetail:
          "CB1 in the area postrema and nucleus tractus solitarius mediates the antiemetic effect; hippocampal CB1 mediates the recall deficit measured by D'Souza et al.; mesolimbic and hypothalamic CB1 mediate appetite stimulation, which is the basis of the AIDS anorexia indication.",
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Vomiting controlled, appetite up, cognition transiently down',
        laymanDesc:
          "The label's endpoints are emesis control and weight. The dose-limiting effects are the psychological ones, which is why the label starts low and titrates.",
        molecularDetail:
          'Labelled endpoints are antiemetic response in chemotherapy patients refractory to conventional agents, and appetite and weight in AIDS-related anorexia. Dose-limiting toxicity is central: dysphoria, anxiety, disorientation and impaired cognition, which in controlled dosing studies reproduced transient psychotic-spectrum symptoms.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: "D'Souza et al. 2004, intravenous THC in healthy volunteers",
        phase: 'Phase 1 double-blind randomised counterbalanced',
        sampleSize: 22,
        primaryEndpoint:
          'Positive and negative psychotic symptoms, perception, cognition and plasma cortisol after 0, 2.5 and 5 mg intravenous delta-9-THC',
        endpointMet: true,
        statisticalPValue:
          'Dose-dependent production of positive and negative symptoms, perceptual alteration, anxiety and recall impairment, with orientation spared',
        unreportedAdverseSignals:
          'Prospective safety follow-up at 1, 3 and 6 months was collected in a population screened to exclude cannabis use disorder — the transient symptoms cannot be generalised to people with a psychosis vulnerability, who were excluded.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ElSohly et al. 2016, DEA seizure potency series',
        phase: 'Analytical surveillance series',
        sampleSize: 38681,
        primaryEndpoint:
          'Delta-9-THC and cannabidiol content of confiscated cannabis preparations, 1995 to 2014',
        endpointMet: true,
        statisticalPValue:
          'Mean THC rose from ~4% to ~12%; CBD fell from ~0.28% to <0.15%; THC:CBD ratio rose from ~14 to ~80',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Dose-dependent production of transient positive and negative psychotic symptoms by 2.5 and 5 mg intravenous THC in 22 healthy volunteers',
        'A rise in mean seized-cannabis THC content from ~4% to ~12% and a THC:CBD ratio shift from ~14 to ~80 across 38,681 samples',
        'Submaximal CB1 activation relative to full agonists in GTP-gamma-S functional assays — THC is a partial agonist',
        'FDA approval of synthetic delta-9-THC as dronabinol on 31 May 1985 for refractory chemotherapy-induced nausea and vomiting',
      ],
      unsupportedInferences: [
        'That the efficacy and safety of oral dronabinol transfer to inhaled THC, where onset, bioavailability and the predominant active species all differ',
        'That Schedule I status for plant-derived delta-9-THC reflects a pharmacological judgement, when the identical synthetic molecule is Schedule III with an FDA label',
        'That "synthetic THC" and "synthetic cannabinoid" describe the same thing — dronabinol is delta-9-THC, a partial agonist; JWH-type compounds are structurally unrelated full agonists',
      ],
      whatFailedInitially: [
        'Syndros, the dronabinol oral solution approved in 2016, is now listed as discontinued in Drugs@FDA',
        'Dronabinol never displaced the 5-HT3 antagonists in chemotherapy-induced nausea; its label is explicitly second-line, for patients who have already failed conventional antiemetics',
      ],
      realWorldOutcome: [
        'Dronabinol has been prescribable in the United States for four decades, in Schedule III, while the same molecule from a plant sits in Schedule I',
        'The potency shift documented to 2014 means older clinical and epidemiological studies of cannabis studied a materially weaker preparation than the one now sold',
      ],
    },
    deliverySystem: {
      type: 'Oral soft gelatin capsule (dronabinol in sesame oil); oral solution, now discontinued',
      description:
        'The approved products are oral. Capsules require refrigerated or cool storage because delta-9-THC oxidises to cannabinol, and the label instructs titration from a low starting dose because the dose-limiting effects are psychological rather than physical. Inhaled THC, whether from plant material or a vaporised concentrate, is not an approved delivery system for this molecule.',
      safetyProfile:
        "The dronabinol label's common adverse reactions are abdominal pain, nausea, vomiting, dizziness, euphoria, paranoid reaction, somnolence and abnormal thinking. Dose-limiting toxicity is central rather than organ toxicity: dysphoria, anxiety, disorientation and cognitive impairment. In controlled dosing, 2.5 to 5 mg intravenously produced transient positive and negative psychotic symptoms in healthy volunteers screened to exclude cannabis use disorder. Tachycardia and orthostatic hypotension occur, and the label cautions in cardiac disease. Delta-9-THC is not associated with fatal respiratory depression; CB1 density in brainstem respiratory nuclei is low.",
    },
    commonQuestions: [
      {
        q: 'THC is a Schedule I drug with no accepted medical use, and also a prescription medicine?',
        a: 'Both statements are on the books at once. Delta-9-THC as a constituent of cannabis is in Schedule I. Synthetic delta-9-THC in a sesame-oil capsule is dronabinol, approved on 31 May 1985, and sits in Schedule III. The molecule is the same; the schedule tracks the source and the formulation. This is the sharpest available illustration that a Schedule I listing is an administrative classification rather than a pharmacological finding.',
      },
      {
        q: 'Is dronabinol just cannabis in a pill?',
        a: 'It is one constituent of cannabis in a pill, at a stated milligram dose, without the other hundred-plus cannabinoids or the terpene fraction, and by a route that converts most of it to a different active molecule before it reaches the brain. Whether that makes it better or worse than the plant for any given purpose has not been tested head-to-head at adequate power. What it definitely makes it is a different exposure.',
      },
      {
        q: 'Why is modern cannabis described as stronger?',
        a: "Because it was measured. Across 38,681 DEA seizures between 1995 and 2014, average delta-9-THC content rose from about 4% to about 12% while cannabidiol fell from about 0.28% to under 0.15%, moving the ratio between them from roughly 14:1 to roughly 80:1. That is a surveillance series of the illicit supply of that period, not of today's legal market, but it establishes the direction and rough magnitude, and it is why epidemiological studies from the 1980s and 1990s are not straightforwardly comparable to studies done now.",
      },
      {
        q: 'Does THC cause psychosis in healthy people?',
        a: 'Transiently, at controlled intravenous doses, yes — and that was measured directly rather than inferred. Twenty-two healthy volunteers given 2.5 or 5 mg intravenously developed positive and negative symptoms resembling schizophrenia, perceptual change, anxiety and recall impairment, with orientation preserved, all short-lived. Those volunteers had used cannabis before and had no psychiatric diagnosis. Whether repeated exposure causes persistent psychotic illness is the separate question the cannabis page covers, and it is answered by epidemiology rather than by a dosing study.',
      },
      {
        q: 'Why does this page show no price?',
        a: 'Generic dronabinol capsules are dispensed at prices set by pharmacy contracts that vary widely, and the seed file that produced this page could not verify a per-dose cost of production for it. A missing number is preferable to an invented one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          "D'Souza DC et al. The psychotomimetic effects of intravenous delta-9-tetrahydrocannabinol in healthy individuals: implications for psychosis. Neuropsychopharmacology 2004;29:1558-1572",
        identifier: '10.1038/sj.npp.1300496',
        kind: 'doi',
      },
      {
        label:
          'ElSohly MA et al. Changes in Cannabis Potency Over the Last 2 Decades (1995-2014). Biol Psychiatry 2016;79:613-619',
        identifier: '10.1016/j.biopsych.2016.01.004',
        kind: 'doi',
      },
      {
        label:
          'Volkow ND et al. Adverse Health Effects of Marijuana Use. N Engl J Med 2014;370:2219-2227',
        identifier: '10.1056/NEJMra1402309',
        kind: 'doi',
      },
      {
        label:
          'National Academies of Sciences, Engineering, and Medicine. The Health Effects of Cannabis and Cannabinoids, 2017',
        identifier: '10.17226/24625',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: MARINOL (dronabinol) capsules, NDA 018651, original approval 31 May 1985',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018651',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: SYNDROS (dronabinol) oral solution, NDA 205525, original approval 1 July 2016, now discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=205525',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 16078 — delta-9-tetrahydrocannabinol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16078',
        kind: 'url',
      },
      CSA_SCHEDULES_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 7. Cannabidiol
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cannabidiol',
    name: 'Cannabidiol (CBD)',
    tradeName:
      'Epidiolex (oral solution); Epidyolex in Europe. Also sold unapproved in consumer products',
    sponsor: 'GW Pharmaceuticals, now Jazz Pharmaceuticals (NDA 210365)',
    targetGene: 'TRPV1',
    targetProtein:
      'No single established target. Not a CB1 agonist. Documented activity at TRPV1, GPR55, 5-HT1A, adenosine reuptake and voltage-gated sodium channels; the anticonvulsant mechanism is not identified',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2018,
    indication:
      'Seizures associated with Lennox-Gastaut syndrome, Dravet syndrome or tuberous sclerosis complex in patients 1 year of age and older',
    patientFriendlyIndication:
      'Seizures in three severe childhood epilepsies. Nothing else is approved, including everything CBD is sold for in shops',
    anatomicalSite:
      'Central nervous system; no identified anatomical or molecular site of the anticonvulsant action',
    conditionContext: {
      conditionExplainer:
        'Dravet syndrome and Lennox-Gastaut syndrome are developmental epileptic encephalopathies that begin in childhood, resist most antiseizure medicines and carry a high mortality. Tuberous sclerosis complex is a genetic disorder in which benign tumours grow in the brain and elsewhere and cause seizures.',
      whyItMatters:
        'These are populations where an added 20 percentage points of seizure reduction is a large clinical result, because the alternatives have largely already failed. That is the setting in which cannabidiol was tested, and it is a very long way from the settings it is sold for.',
      whoTakesThis:
        'Patients aged 1 year and older with one of the three labelled epilepsies, on top of conventional antiseizure medication, with liver enzymes measured before starting and monitored during treatment.',
      clinicalGoals:
        'Reduce convulsive or drop-seizure frequency by a measurable percentage against baseline, without transaminase elevation.',
    },
    oneSentenceVerdict:
      'A cannabis constituent with genuine, replicated randomised evidence in three rare epilepsies, no identified mechanism, a real drug-interaction and liver signal, and a consumer market built on indications it has never been tested for.',
    laymanHowItWorks:
      'Nobody knows. That is the honest answer and it is unusual for an approved drug. Cannabidiol does not switch on the cannabinoid receptor that THC uses, which is why it is not intoxicating. It touches a long list of other targets in the laboratory — a heat-sensing ion channel, an orphan receptor, a serotonin receptor, sodium channels — and none of them has been shown to be the one that stops seizures. What is established is the clinical result: in three specific childhood epilepsies, added to existing medication, seizure counts fall further than on placebo.',
    auditConfidence: 'High Confidence',
    confidenceScore: 74,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCCCC1=CC(=C(C(=C1)O)[C@@H]2C=C(CC[C@H]2C(=C)C)C)O',
      chemicalFormula: 'C21H30O2',
      molecularWeight:
        '314.5 g/mol — the same formula and mass as delta-9-THC, which is why mass spectrometry alone cannot distinguish them and chromatographic separation is mandatory',
      targetReceptorAffinity:
        'Essentially no agonist activity at CB1, which is why it is not intoxicating; at some concentrations it behaves as a negative allosteric modulator of CB1. Reported activity at TRPV1, GPR55, 5-HT1A, PPAR-gamma, adenosine reuptake and voltage-gated sodium channels, mostly at concentrations well above those achieved clinically. A potent inhibitor of CYP2C19 and CYP3A4, which is the origin of its clinically important interactions.',
      structureSource: {
        label: 'PubChem CID 644019 (cannabidiol) — SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/644019',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cbd-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Separation of cannabidiol from delta-9- and delta-8-THC',
          description:
            'CBD, delta-9-THC and delta-8-THC all have the formula C21H30O2 and a nominal mass of 314. A mass spectrum will not separate them. Chromatographic resolution against all three certified standards is the whole of the identification, and it is the step that consumer-product testing most often skips or fails.',
          reagentsAndBuffer:
            'Cannabidiol, delta-9-THC and delta-8-THC certified reference standards, CBD-d3 internal standard, biphenyl or pentafluorophenyl column with shallow gradient, diode-array detection at 220 nm with MS confirmation',
        },
        {
          id: 'cbd-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Label-claim assay and residual THC limit for a consumer product',
          description:
            'The two questions a consumer CBD product raises are how much cannabidiol it contains against the label, and how much delta-9-THC it contains at all. Both are answered by the same run. This is a routine assay and its routine result is the reason the question is worth asking.',
          dependsOnStepId: 'cbd-w1',
          reagentsAndBuffer:
            'Methanol or ethanol extraction from oil, tincture, gummy or topical matrix, matrix-matched calibrators, HPLC-UV for content with LC-MS/MS for the THC limit at low ng/mL sensitivity',
        },
        {
          id: 'cbd-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'Plasma cannabidiol and 7-OH-CBD with a food-effect design',
          description:
            'Cannabidiol has low and highly variable oral bioavailability and a large food effect — a high-fat meal raises exposure several-fold — so any pharmacokinetic statement without fed or fasted status attached is uninterpretable. Quantify the parent and the active 7-hydroxy metabolite.',
          dependsOnStepId: 'cbd-w1',
          reagentsAndBuffer:
            'CBD-d3 and 7-OH-CBD-d3 internal standards, protein precipitation or supported-liquid extraction, UHPLC-MS/MS, standardised high-fat and fasted meal conditions',
        },
        {
          id: 'cbd-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Hepatocyte and recombinant CYP systems for the interaction work',
          description:
            'The clinically important pharmacology of cannabidiol is metabolic, not receptor-mediated. Human liver microsomes and recombinant CYP2C19 and CYP3A4 are used to measure inhibition, and cryopreserved hepatocytes to measure it in an intact cell.',
          dependsOnStepId: 'cbd-w2',
          reagentsAndBuffer:
            'Pooled human liver microsomes, recombinant CYP2C19 and CYP3A4 supersomes, NADPH regenerating system, probe substrates (S-mephenytoin for 2C19, midazolam for 3A4), cryopreserved human hepatocytes',
        },
        {
          id: 'cbd-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Target deconvolution across the candidate receptor panel',
          description:
            'Screen cannabidiol against TRPV1, GPR55, 5-HT1A, PPAR-gamma, adenosine transport and voltage-gated sodium channels, recording the concentration at which each effect appears and comparing it with the plasma concentration achieved at a 20 mg/kg/day clinical dose. Most reported targets fail that comparison, which is why the anticonvulsant mechanism is still open.',
          dependsOnStepId: 'cbd-w4',
          reagentsAndBuffer:
            'Calcium-flux assays for TRPV1, beta-arrestin recruitment for GPR55, [3H]-8-OH-DPAT competition for 5-HT1A, automated patch clamp for Nav1.1 to Nav1.6, with clinical Cmax as the reference concentration on every plot',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cbd-a1',
        category: 'measured',
        title:
          'Dravet syndrome: convulsive seizures more than halved against a placebo that barely moved',
        laymanSummary:
          'In 120 children and young adults, monthly convulsive seizures fell from 12.4 to 5.9 on cannabidiol and from 14.9 to 14.1 on placebo.',
        technicalDetails:
          'Double-blind, placebo-controlled trial, 120 children and young adults with Dravet syndrome and drug-resistant seizures randomised to cannabidiol oral solution 20 mg/kg/day or placebo added to standard antiepileptic treatment. Primary endpoint was change in convulsive-seizure frequency over 14 weeks against a 4-week baseline. Median monthly convulsive seizures fell from 12.4 to 5.9 with cannabidiol and 14.9 to 14.1 with placebo; adjusted median difference -22.8 percentage points (95% CI -41.1 to -5.4, P=0.01). At least 50% reduction occurred in 43% versus 27% (OR 2.00, 95% CI 0.93 to 4.30, P=0.08) — a secondary endpoint that did not reach significance. Caregiver Global Impression of Change improved by at least one category in 62% versus 34% (P=0.02). Seizure freedom was 5% versus 0% (P=0.08). Adverse events more common on cannabidiol were diarrhoea, vomiting, fatigue, pyrexia, somnolence and abnormal liver function tests, with more withdrawals in the cannabidiol group.',
        evidenceSource:
          'Devinsky O et al. Trial of Cannabidiol for Drug-Resistant Seizures in the Dravet Syndrome. N Engl J Med 2017;376:2011-2020 (NCT02091375)',
        doi: '10.1056/NEJMoa1611618',
        measuredMetric: 'Change in monthly convulsive-seizure frequency over 14 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'cbd-a2',
        category: 'measured',
        title: 'Lennox-Gastaut: both doses beat placebo on drop seizures in 225 patients',
        laymanSummary:
          'Drop seizures fell by about 42% on the higher dose and 37% on the lower, against 17% on placebo. Nine percent of treated patients had raised liver enzymes.',
        technicalDetails:
          'Double-blind, placebo-controlled trial at 30 centres, 225 patients aged 2 to 55 with Lennox-Gastaut syndrome and at least two drop seizures per week at baseline, randomised to cannabidiol 20 mg/kg/day (n=76), 10 mg/kg/day (n=73) or placebo (n=76) for 14 weeks. Median baseline drop-seizure count was 85 per 28 days across groups. Median percentage reduction was 41.9% at 20 mg/kg, 37.2% at 10 mg/kg and 17.2% on placebo (P=0.005 and P=0.002 respectively versus placebo). Commonest adverse events were somnolence, decreased appetite and diarrhoea, more frequent at the higher dose. Six patients on 20 mg/kg and one on 10 mg/kg withdrew for adverse events. Fourteen cannabidiol-treated patients (9%) had elevated liver aminotransferases. That the two doses were close to each other and both well clear of placebo is what a real dose-response with a plateau looks like.',
        evidenceSource:
          'Devinsky O et al. Effect of Cannabidiol on Drop Seizures in the Lennox-Gastaut Syndrome. N Engl J Med 2018;378:1888-1897 (GWPCARE3, NCT02224560)',
        doi: '10.1056/NEJMoa1714631',
        measuredMetric: 'Median percentage change from baseline in drop-seizure frequency',
        auditFlag: 'verified',
      },
      {
        id: 'cbd-a3',
        category: 'measured',
        title: 'The liver signal is real, and it is mostly a drug interaction',
        laymanSummary:
          'Raised liver enzymes happened in about a third of patients taking cannabidiol together with valproate and clobazam, against a small percentage on cannabidiol with neither.',
        technicalDetails:
          "The approved label requires serum transaminases and total bilirubin before starting and during treatment. In the controlled studies in Lennox-Gastaut and Dravet syndromes at 10 and 20 mg/kg/day, ALT elevation above three times the upper limit of normal occurred in 30% of patients taking both concomitant valproate and clobazam, 21% of those on valproate without clobazam, and 4% of those on clobazam without valproate. The majority of elevations occurred in patients taking valproate. Cannabidiol is a potent CYP2C19 inhibitor and raises N-desmethylclobazam, clobazam's active metabolite, which is also the likely source of part of the observed somnolence and of some of the apparent efficacy in clobazam-treated patients. The interaction is not an incidental finding; it shapes how the efficacy results should be read.",
        evidenceSource:
          'EPIDIOLEX (cannabidiol) oral solution prescribing information, NDA 210365, sections 5.1, 7.2 and 7.3',
        measuredMetric:
          'Incidence of ALT elevation above 3x upper limit of normal by concomitant antiseizure medication',
        auditFlag: 'verified',
      },
      {
        id: 'cbd-a4',
        category: 'inferred',
        title:
          'Everything CBD is actually sold for is unapproved and mostly untested at the doses sold',
        laymanSummary:
          'The approval covers three rare epilepsies at 10 to 20 mg per kilogram per day. A retail CBD product typically supplies a fraction of that and is sold for anxiety, sleep and pain, none of which is an approved indication.',
        technicalDetails:
          "The labelled dose in the pivotal trials was 10 to 20 mg/kg/day — 700 to 1,400 mg daily for a 70 kg adult. Consumer CBD products commonly supply 10 to 50 mg per serving, one to two orders of magnitude lower, and are marketed for anxiety, sleep, pain and inflammation. No adequately powered randomised trial supports any of those indications at any dose, and the pharmacokinetics compound the gap: oral cannabidiol has low and variable bioavailability with a large food effect, so a fasted low-dose consumer product delivers a plasma concentration far below anything studied. Separately, cannabidiol's CYP2C19 and CYP3A4 inhibition is dose-dependent and is the mechanism by which a supplement can alter the level of a prescription medicine.",
        evidenceSource:
          'EPIDIOLEX prescribing information, NDA 210365, dosage and clinical pharmacology sections, against the labelled indications',
        inferredClaim:
          'That evidence generated at 10 to 20 mg/kg/day in three rare epilepsies supports retail doses of 10 to 50 mg for anxiety, sleep or pain',
        auditFlag: 'caution',
      },
      {
        id: 'cbd-a5',
        category: 'conclusion_shift',
        title: 'Schedule I, then Schedule V, then not a controlled substance at all',
        laymanSummary:
          'When Epidiolex was approved in 2018 the DEA put it in Schedule V. It is now, according to its own label, not a controlled substance.',
        technicalDetails:
          'Cannabidiol derived from cannabis fell within the Schedule I definition of marijuana. On 28 September 2018, three months after Epidiolex was approved on 25 June 2018, DEA published a final rule placing FDA-approved drug products containing cannabidiol derived from cannabis with no more than 0.1% tetrahydrocannabinols in Schedule V (83 FR 48950). The current FDA-approved prescribing information for Epidiolex states in section 9.1 that it is not a controlled substance. The abuse-potential data behind that are on the same label: cannabidiol does not generalise to delta-9-THC in animal drug-discrimination studies, does not support animal self-administration, and was studied in non-dependent adult recreational drug users at 750, 1,500 and 4,500 mg. Three regulatory positions on one molecule inside a few years, each following the evidence rather than preceding it.',
        evidenceSource:
          'Federal Register 83 FR 48950 (28 September 2018); EPIDIOLEX prescribing information, NDA 210365, section 9.1',
        measuredMetric: 'Control status of the same molecule across successive determinations',
        auditFlag: 'verified',
      },
      {
        id: 'cbd-a6',
        category: 'inferred',
        title: 'An approved drug with no identified mechanism',
        laymanSummary:
          'Cannabidiol works in these epilepsies and nobody can say why. The many receptors it touches in a dish mostly need higher concentrations than the body ever reaches.',
        technicalDetails:
          "The proposed targets — TRPV1, GPR55, 5-HT1A, PPAR-gamma, adenosine reuptake, voltage-gated sodium channels, negative allosteric modulation of CB1 — are each supported by in-vitro data, and most of the reported effects appear at concentrations above the plasma concentrations achieved at 20 mg/kg/day. No target has been shown to be necessary for the anticonvulsant effect by the kind of antagonist or knockout experiment that established 5-HT2A for LSD. The label's mechanism-of-action section says the mechanism is unknown. This does not weaken the clinical result, which was measured directly in randomised trials; it does mean that mechanistic claims made for consumer CBD are unsupported at the source.",
        evidenceSource:
          'EPIDIOLEX prescribing information, NDA 210365, mechanism of action section',
        inferredClaim:
          'That any of the reported in-vitro targets of cannabidiol mediates its anticonvulsant effect in humans',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Oral solution in sesame oil, twice daily, taken consistently with food or without',
        laymanDesc:
          'A liquid measured by body weight and given twice a day. Food raises absorption several-fold, so it has to be taken the same way every time.',
        molecularDetail:
          'Cannabidiol in sesame oil with anhydrous ethanol. Low and variable oral bioavailability with a substantial high-fat food effect. Starting dose 2.5 mg/kg twice daily, maintenance 5 mg/kg twice daily, maximum 10 mg/kg twice daily in Lennox-Gastaut and Dravet syndromes.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Metabolised in the liver, where it also blocks two enzymes',
        laymanDesc:
          'The liver converts it to an active form, and while doing so cannabidiol slows down two of the enzymes that clear other medicines.',
        molecularDetail:
          'Metabolised by CYP2C19 and CYP3A4 to 7-hydroxy-cannabidiol, itself active, then to 7-carboxy-CBD. Cannabidiol inhibits CYP2C19, raising N-desmethylclobazam several-fold in patients taking clobazam, and interacts with valproate to produce the transaminase signal.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Reaches the brain and engages no identified single target',
        laymanDesc:
          'It gets into the brain and does something anticonvulsant. Which molecule it acts on to do that is not known.',
        molecularDetail:
          'Not a CB1 agonist. Candidate targets include TRPV1, GPR55, 5-HT1A, PPAR-gamma, adenosine reuptake and voltage-gated sodium channels; the label states the mechanism by which cannabidiol exerts anticonvulsant effects is unknown.',
        iconName: 'HelpCircle',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Seizure networks are damped by an unidentified route',
        laymanDesc:
          'Seizure counts fall. The step between the drug reaching the brain and the seizures reducing is a gap in the record, not a simplification for the reader.',
        molecularDetail:
          'No demonstrated causal chain. Reductions in neuronal excitability via sodium-channel modulation and via GPR55 antagonism are the most commonly proposed routes; neither has been shown to be necessary using an antagonist or genetic manipulation in a seizure model at clinically relevant concentrations.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Convulsive and drop seizures fall against placebo',
        laymanDesc:
          'In the trials, seizures fell by around 20 percentage points more than on placebo. That is the endpoint the approval rests on.',
        molecularDetail:
          'Measured endpoints: monthly convulsive-seizure frequency in Dravet syndrome (adjusted median difference -22.8 percentage points) and median percentage reduction in drop seizures in Lennox-Gastaut syndrome (41.9% and 37.2% versus 17.2%). Tuberous sclerosis complex was added by efficacy supplement on 31 July 2020.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT02091375 (Dravet syndrome)',
        phase: 'Phase 3 double-blind placebo-controlled',
        sampleSize: 120,
        primaryEndpoint:
          'Change in monthly convulsive-seizure frequency over 14 weeks versus a 4-week baseline',
        endpointMet: true,
        statisticalPValue:
          'Adjusted median difference -22.8 percentage points (95% CI -41.1 to -5.4), P=0.01',
        unreportedAdverseSignals:
          'The 50% responder rate, a secondary endpoint, was 43% versus 27% and did not reach significance (P=0.08). More withdrawals occurred in the cannabidiol group.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT02224560 (GWPCARE3, Lennox-Gastaut syndrome)',
        phase: 'Phase 3 double-blind placebo-controlled, two doses',
        sampleSize: 225,
        primaryEndpoint: 'Median percentage change from baseline in drop-seizure frequency',
        endpointMet: true,
        statisticalPValue:
          '41.9% (20 mg/kg) and 37.2% (10 mg/kg) versus 17.2% placebo; P=0.005 and P=0.002',
        unreportedAdverseSignals:
          'Elevated liver aminotransferases in 14 cannabidiol-treated patients (9%); 6 withdrawals at 20 mg/kg against 1 at 10 mg/kg.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 22.8 percentage-point adjusted median advantage over placebo in monthly convulsive-seizure frequency in 120 patients with Dravet syndrome',
        'Median drop-seizure reduction of 41.9% and 37.2% against 17.2% on placebo in 225 patients with Lennox-Gastaut syndrome',
        'ALT elevation above three times the upper limit of normal in 30% of patients on both valproate and clobazam, against 4% on clobazam alone',
        'No generalisation to delta-9-THC in animal drug discrimination and no self-administration, the abuse-potential data behind the non-controlled status',
      ],
      unsupportedInferences: [
        'That evidence at 10 to 20 mg/kg/day in three rare epilepsies supports 10 to 50 mg retail doses for anxiety, sleep or pain',
        'That any identified in-vitro target mediates the anticonvulsant effect — the label states the mechanism is unknown',
        'That a consumer CBD product is pharmacologically inert with respect to prescription medicines, when the molecule inhibits CYP2C19 and CYP3A4',
      ],
      whatFailedInitially: [
        'The 50% responder rate in the Dravet trial, a secondary endpoint, did not reach significance at P=0.08',
        'Non-convulsive seizures in the Dravet trial were not significantly reduced, and seizure freedom at 5% versus 0% did not reach significance',
      ],
      realWorldOutcome: [
        'Approved 25 June 2018, with tuberous sclerosis complex added by efficacy supplement on 31 July 2020',
        'Placed in Schedule V in September 2018 and subsequently not a controlled substance at all, per the current label',
      ],
    },
    deliverySystem: {
      type: 'Oral solution, 100 mg/mL in sesame oil, twice daily, dosed by body weight',
      description:
        'A liquid measured in mg per kg and given twice daily. Because absorption rises several-fold with a high-fat meal, the label requires a consistent relationship to food. Serum transaminases and total bilirubin must be measured before starting and monitored during treatment.',
      safetyProfile:
        'Labelled warnings are hepatocellular injury, somnolence and sedation, suicidal behaviour and ideation, hypersensitivity reactions, and increased seizure frequency or status epilepticus if withdrawn abruptly. Concomitant valproate and higher cannabidiol doses raise the risk of transaminase elevation; in the controlled epilepsy studies ALT above three times the upper limit of normal occurred in 30% of patients on both valproate and clobazam. Commonest adverse events across the pivotal trials were somnolence, decreased appetite, diarrhoea, fatigue and pyrexia. Cannabidiol is not intoxicating, does not generalise to THC in animal discrimination studies and does not support self-administration; the current label states it is not a controlled substance.',
    },
    commonQuestions: [
      {
        q: 'Does CBD work for anxiety, sleep or pain?',
        a: 'Not on any evidence base comparable to the one behind its approval. Cannabidiol is approved for three rare epilepsies on the strength of two large randomised trials with objective, countable endpoints. For anxiety, sleep and pain there are small trials, inconsistent results and no adequately powered randomised evidence, and the doses studied in the positive epilepsy trials were 700 to 1,400 mg a day for an adult — one to two orders of magnitude above a typical retail serving, taken with a fixed relationship to food because absorption varies so much. Those are different claims about a different exposure.',
      },
      {
        q: 'Will CBD show up on a drug test or get me high?',
        a: "Cannabidiol is not intoxicating: it does not activate the CB1 receptor, does not generalise to delta-9-THC in animal drug-discrimination studies, and does not support self-administration. That is the data behind its current non-controlled status. The complication is the product rather than the molecule. CBD, delta-9-THC and delta-8-THC share a formula and a mass, and separating them takes chromatography, so a product's actual THC content is an analytical question and not a labelling one.",
      },
      {
        q: 'Is CBD safe to take with my other medicines?',
        a: 'It is a real drug interaction question, not a formality. Cannabidiol inhibits CYP2C19 and CYP3A4, and in the epilepsy trials that produced a measurable and clinically significant effect: raised N-desmethylclobazam levels in patients on clobazam, and liver enzyme elevations above three times the upper limit of normal in 30% of patients taking both valproate and clobazam. The approved label requires liver monitoring for that reason. The interaction mechanism does not switch off because the product is sold as a supplement.',
      },
      {
        q: 'Why does the page say the mechanism is unknown?',
        a: 'Because the label does. Cannabidiol has a long list of in-vitro targets and no demonstrated causal route from any of them to seizure reduction in humans, and most of the reported effects occur at concentrations higher than the blood levels the drug reaches. This is unusual and it is not a defect in the approval: the trials measured seizure counts directly and found a difference. It does mean that any mechanistic claim made for a consumer CBD product is being asserted rather than cited.',
        auditNote:
          'An approved drug with a measured clinical effect and an unidentified mechanism is the cleanest illustration on this site of why measurement and explanation are recorded separately.',
      },
      {
        q: 'Why does this page show no price?',
        a: 'Epidiolex is a specialty prescription product whose net price after rebates is not published, and the seed file that produced this page could not verify a per-dose cost of production. Retail CBD prices are prices for unapproved products of unverified content, which is a different thing again.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'Devinsky O et al. Trial of Cannabidiol for Drug-Resistant Seizures in the Dravet Syndrome. N Engl J Med 2017;376:2011-2020',
        identifier: '10.1056/NEJMoa1611618',
        kind: 'doi',
      },
      {
        label:
          'Devinsky O et al. Effect of Cannabidiol on Drop Seizures in the Lennox-Gastaut Syndrome. N Engl J Med 2018;378:1888-1897',
        identifier: '10.1056/NEJMoa1714631',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: EPIDIOLEX (cannabidiol) oral solution, NDA 210365, original approval 25 June 2018; tuberous sclerosis complex efficacy supplement approved 31 July 2020',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=210365',
        kind: 'regulatory',
      },
      {
        label:
          'EPIDIOLEX prescribing information (DailyMed SPL 8bf27097-4870-43fb-94f0-f3d0871d1eec) — sections 5.1 hepatocellular injury, 7.2 and 7.3 interactions, 9.1 controlled substance status',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8bf27097-4870-43fb-94f0-f3d0871d1eec',
        kind: 'regulatory',
      },
      {
        label:
          'Federal Register 83 FR 48950 (28 September 2018) — DEA final rule placing certain FDA-approved cannabidiol drug products in Schedule V',
        identifier:
          'https://www.federalregister.gov/documents/2018/09/28/2018-21121/schedules-of-controlled-substances-placement-in-schedule-v-of-certain-fda-approved-drugs-containing',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 644019 — cannabidiol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/644019',
        kind: 'url',
      },
      {
        label: 'ClinicalTrials.gov NCT02091375 — cannabidiol in Dravet syndrome',
        identifier: 'NCT02091375',
        kind: 'nct',
      },
      {
        label: 'ClinicalTrials.gov NCT02224560 — GWPCARE3, cannabidiol in Lennox-Gastaut syndrome',
        identifier: 'NCT02224560',
        kind: 'nct',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 8. Heroin / diamorphine
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'heroin',
    name: 'Heroin (Diamorphine, Diacetylmorphine)',
    tradeName:
      'Diamorphine Hydrochloride for Injection — a licensed medicine in the United Kingdom. Originally marketed by Bayer as Heroin from 1898',
    sponsor:
      'No US sponsor — Schedule I. In the United Kingdom, licensed injection products from several manufacturers; heroin-assisted treatment programmes are run by health services in Switzerland, the Netherlands, Germany, Denmark, Canada and the UK',
    targetGene: 'OPRM1',
    targetProtein:
      'Mu-opioid receptor — engaged not by heroin itself but by its metabolites 6-monoacetylmorphine and morphine',
    modality: 'Small Molecule',
    approvalStatus: 'Controlled / No Approved Use',
    indication:
      'No approved medical use in the United States, where it is Schedule I. Licensed in the United Kingdom for severe pain associated with surgical procedures, myocardial infarction or pain in the terminally ill, and for relief of dyspnoea in acute pulmonary oedema. Used as supervised injectable maintenance treatment for refractory heroin dependence in several European countries and Canada',
    patientFriendlyIndication:
      'In the UK, severe pain after surgery, during a heart attack, in terminal illness, and breathlessness in acute heart failure. In the US, nothing — it is in the schedule reserved for drugs with no accepted medical use',
    anatomicalSite:
      'Mu-opioid receptors in the periaqueductal grey, spinal dorsal horn, ventral tegmental area and the pre-Bötzinger complex of the brainstem',
    conditionContext: {
      conditionExplainer:
        'Diamorphine is morphine with two acetyl groups attached. Those groups make it far more lipid-soluble, so it crosses into the brain much faster; once there it is stripped back to morphine, which is what actually binds the receptor. It is a delivery modification of a drug that has been in medical use for two centuries.',
      whyItMatters:
        'Two competent regulators looked at the same molecule and reached opposite conclusions. The United States placed it in Schedule I, defined as having no currently accepted medical use. The United Kingdom licensed it and puts it in ambulances. Nothing about the pharmacology differs between the two countries.',
      whoTakesThis:
        'In UK medicine: patients with severe acute pain, myocardial infarction, terminal illness or acute pulmonary oedema. In heroin-assisted treatment: people with long-standing opioid dependence who have failed repeated conventional treatment including methadone. Outside medicine: an illicit market in which the substance sold as heroin increasingly is not heroin.',
      clinicalGoals:
        'In pain: analgesia at a smaller injected volume than morphine requires, which matters for subcutaneous infusion in palliative care. In heroin-assisted treatment: retention in treatment and cessation of street-heroin use.',
    },
    oneSentenceVerdict:
      'The same molecule is a licensed injectable medicine in the United Kingdom and a Schedule I substance with no accepted medical use in the United States, and randomised trials in two countries found supervised injectable heroin retained treatment-refractory patients better than oral methadone.',
    laymanHowItWorks:
      "Heroin is not itself an opioid painkiller. It is morphine with two greasy handles bolted on, which let it cross from blood into brain several times faster than morphine can. Enzymes in the blood and brain then snap those handles off, and what is left binding the receptor is morphine — the same drug, arriving faster. That speed is the entire difference: the receptor, the analgesia, the constipation and the respiratory depression are morphine's, and the rush is the rate of arrival.",
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 72,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(=O)O[C@H]1C=C[C@H]2[C@H]3CC4=C5[C@]2([C@H]1OC5=C(C=C4)OC(=O)C)CCN3C',
      chemicalFormula: 'C21H23NO5',
      molecularWeight:
        '369.4 g/mol (free base). Clinical and illicit material is the hydrochloride. Morphine, the ultimate active species, is C17H19NO3 at 285.3 g/mol',
      targetReceptorAffinity:
        'Diamorphine has low intrinsic affinity for the mu-opioid receptor. It is a prodrug: plasma and tissue esterases deacetylate it within minutes to 6-monoacetylmorphine, which is a potent mu agonist and crosses the blood-brain barrier readily, and then to morphine. Analgesia and respiratory depression are mu-receptor effects of the metabolites.',
      structureSource: {
        label: 'PubChem CID 5462328 (heroin) — SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5462328',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'her-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identification and purity of a powder, with the adulterant panel run first',
          description:
            'The identification is straightforward; the adulterant screen is the part that matters now. Material sold as heroin in North America and increasingly in Europe frequently contains fentanyl analogues, nitazenes or xylazine, at concentrations that dominate the pharmacology, and a purity figure for diacetylmorphine says nothing about what else is present. The panel is run before, not after, the potency assay.',
          reagentsAndBuffer:
            'Diacetylmorphine, 6-monoacetylmorphine, morphine, papaverine and noscapine reference standards; fentanyl-analogue, nitazene and xylazine screening libraries; GC-MS and LC-QTOF with non-targeted acquisition',
        },
        {
          id: 'her-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Impurity profiling to distinguish source and route',
          description:
            'Opium-derived heroin carries a characteristic residue of the other poppy alkaloids — papaverine, noscapine, acetylcodeine — in ratios that fingerprint the region and the process. This is standard forensic provenance work and is independent of purity: two samples of identical strength can have entirely different impurity signatures.',
          dependsOnStepId: 'her-w1',
          reagentsAndBuffer:
            'Acetylcodeine, papaverine, noscapine and meconin reference standards, GC-MS with flame ionisation for quantification, principal component analysis against a reference impurity database',
        },
        {
          id: 'her-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'The 6-monoacetylmorphine window in blood and urine',
          description:
            'This is the one analyte that proves heroin exposure specifically. Morphine in urine can come from heroin, from morphine, from codeine or from poppy seeds. 6-monoacetylmorphine can only come from heroin — but its half-life is short, so it is detectable in urine for only a few hours after use. A negative 6-MAM does not exclude heroin; a positive one confirms it.',
          dependsOnStepId: 'her-w1',
          reagentsAndBuffer:
            '6-MAM-d3, morphine-d3 and codeine-d3 internal standards, solid-phase extraction at pH 9 with immediate freezing (6-MAM hydrolyses in stored samples), UHPLC-MS/MS with a validated limit of quantification near 1 ng/mL',
        },
        {
          id: 'her-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Mu-opioid receptor expression for the metabolite comparison',
          description:
            'Human OPRM1 expressed in a cell line, so that diacetylmorphine, 6-monoacetylmorphine and morphine can be compared in the same system. This is the experiment behind calling heroin a prodrug: the parent is the weakest of the three at the receptor and the most potent in a whole animal.',
          dependsOnStepId: 'her-w2',
          reagentsAndBuffer:
            'CHO or HEK293 cells with human OPRM1, membrane preparation, Tris-HCl assay buffer with MgCl2 and EDTA, esterase inhibitor (sodium fluoride) to prevent hydrolysis during the incubation',
        },
        {
          id: 'her-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Binding affinity and functional efficacy across the three species',
          description:
            'Competition binding against a labelled mu ligand gives affinity; GTP-gamma-S or cAMP inhibition gives efficacy. Running all three compounds side by side, with esterase inhibited so the parent survives the incubation, is what separates "heroin is more potent than morphine" (true in vivo, a pharmacokinetic statement) from "heroin binds the receptor better than morphine" (false).',
          dependsOnStepId: 'her-w4',
          reagentsAndBuffer:
            '[3H]-DAMGO as mu radioligand, naloxone for non-specific binding, [35S]-GTP-gamma-S with GDP, sodium fluoride to block esterase activity, glass-fibre filter harvest with scintillation counting',
        },
      ],
    },
    keyAudits: [
      {
        id: 'her-a1',
        category: 'conclusion_shift',
        title: 'Schedule I in the United States, a licensed medicine in the United Kingdom',
        laymanSummary:
          'The US classifies heroin as having no accepted medical use. The UK licenses it for heart attack pain, surgical pain, terminal illness and acute heart failure, and carries it in ambulances.',
        technicalDetails:
          'Heroin is listed in Schedule I of the United States Controlled Substances Act at 21 CFR 1308.11(c), a schedule defined by high abuse potential, no currently accepted medical use in the United States, and lack of accepted safety for use under medical supervision. In the United Kingdom, Diamorphine Hydrochloride for Injection holds a marketing authorisation with the licensed indications "severe pain associated with surgical procedures, myocardial infarction or pain in the terminally ill and for the relief of dyspnoea in acute pulmonary oedema"; it is a Class A drug under the Misuse of Drugs Act 1971 and sits in Schedule 2 of the Misuse of Drugs Regulations 2001, the schedule for controlled drugs with recognised medical use. Two regulators, one molecule, opposite findings on the single question of whether an accepted medical use exists. The disagreement is not scientific: the UK use is documented and the US finding is a legal determination that has not been revisited for this substance.',
        evidenceSource:
          '21 CFR 1308.11(c); Diamorphine Hydrochloride for Injection Summary of Product Characteristics, section 4.1, UK electronic Medicines Compendium',
        measuredMetric:
          'Existence of a licensed medical indication for the same molecule in two jurisdictions',
        auditFlag: 'contested',
      },
      {
        id: 'her-a2',
        category: 'measured',
        title:
          'RIOTT: supervised injectable heroin beat oral methadone with a number needed to treat of 2.2',
        laymanSummary:
          'In 127 long-term users who kept injecting street heroin despite being on methadone, supervised medical heroin got 72% off street heroin against 27% on optimised oral methadone.',
        technicalDetails:
          'Multisite, open-label randomised controlled trial in three supervised injecting clinics in England. 127 chronic heroin users, all on conventional oral treatment for at least six months and still injecting street heroin on at least half of days in the preceding three months, randomised to supervised injectable methadone (n=42), supervised injectable heroin (n=43) or optimised oral methadone (n=42) for 26 weeks. Primary outcome was 50% or more negative weekly urine specimens for street heroin during weeks 14 to 26. At 26 weeks, 80% remained in assigned treatment: 81% injectable methadone, 88% injectable heroin, 69% oral methadone. Primary outcome achieved by 72% on injectable heroin versus 27% on oral methadone (OR 7.42, 95% CI 2.69 to 20.46, p<0.0001; adjusted 66% versus 19%, OR 8.17, 2.88 to 23.16, p<0.0001), number needed to treat 2.17 (95% CI 1.60 to 3.97). Injectable methadone versus oral methadone was not significant (OR 1.74, 95% CI 0.66 to 4.60, p=0.264). Differences appeared within the first six weeks. ISRCTN01338071.',
        evidenceSource: 'Strang J et al., Lancet 2010;375:1885-1895 (RIOTT, ISRCTN01338071)',
        doi: '10.1016/S0140-6736(10)60349-2',
        measuredMetric:
          'Proportion with 50% or more street-heroin-negative weekly urine specimens, weeks 14 to 26',
        auditFlag: 'verified',
      },
      {
        id: 'her-a3',
        category: 'measured',
        title: 'NAOMI: 88% retention against 54% on methadone, with overdoses in the heroin arm',
        laymanSummary:
          'A Canadian trial in 226 people who had failed treatment twice found injectable heroin kept far more of them in treatment — and produced ten overdoses and six seizures that supervision caught.',
        technicalDetails:
          "Open-label phase 3 randomised controlled trial in Canada comparing injectable diacetylmorphine (115 patients) with oral methadone maintenance (111 patients) in long-term injecting heroin users who had failed at least two previous treatment attempts including at least one methadone treatment. Primary outcomes at 12 months were retention in addiction treatment or drug-free status, and reduction in illicit-drug use or other illegal activity on the European Addiction Severity Index; outcomes were determined in 95.2% of participants. Intention-to-treat retention was 87.8% with diacetylmorphine versus 54.1% with methadone (rate ratio 1.62, 95% CI 1.35 to 1.95, P<0.001). Reduction in illicit-drug use or other illegal activity was 67.0% versus 47.7% (rate ratio 1.40, 95% CI 1.11 to 1.77, P=0.004). The most common serious adverse events with diacetylmorphine were overdoses in 10 patients and seizures in 6. The authors' conclusion includes the constraint: this treatment must be delivered where prompt medical intervention is available.",
        evidenceSource:
          'Oviedo-Joekes E et al. Diacetylmorphine versus Methadone for the Treatment of Opioid Addiction. N Engl J Med 2009;361:777-786 (NCT00175357)',
        doi: '10.1056/NEJMoa0810635',
        measuredMetric: 'Retention in addiction treatment at 12 months, intention to treat',
        auditFlag: 'verified',
      },
      {
        id: 'her-a4',
        category: 'measured',
        title:
          'Cochrane: the benefit is real, and it is confined to people conventional treatment failed',
        laymanSummary:
          'The systematic review concluded heroin maintenance helps a specific group — people who have already failed methadone — and should be delivered in supervised clinics because of the overdose risk.',
        technicalDetails:
          "Ferri, Davoli and Perucci reviewed randomised controlled trials of heroin maintenance versus other maintenance treatments in chronic heroin-dependent individuals for the Cochrane Database of Systematic Reviews. The review's scope is deliberately narrow: it addresses supervised injectable heroin as a second-line treatment for people not benefiting from methadone, not as a first-line option, and it records the serious adverse events — including overdose during supervised administration — that define the delivery requirements. The consistent finding across the European and Canadian trials is retention and reduction in street-drug use, in a population selected for prior treatment failure. Generalising the result to unselected opioid-dependent populations is not supported by any of the included trials, because none of them enrolled one.",
        evidenceSource:
          'Ferri M, Davoli M, Perucci CA. Heroin maintenance for chronic heroin-dependent individuals. Cochrane Database Syst Rev 2011;(12):CD003410',
        doi: '10.1002/14651858.CD003410.pub4',
        measuredMetric:
          'Pooled retention and illicit-use outcomes across randomised heroin maintenance trials',
        auditFlag: 'verified',
      },
      {
        id: 'her-a5',
        category: 'measured',
        title: 'Heroin is a prodrug and is weaker than morphine at the receptor it is famous for',
        laymanSummary:
          'Diamorphine barely binds the opioid receptor. It gets into the brain fast and is converted there into morphine, which does the binding.',
        technicalDetails:
          "Diacetylmorphine has low affinity at the mu-opioid receptor relative to morphine in binding assays run with esterase activity blocked. In vivo, plasma and tissue esterases deacetylate it within minutes to 6-monoacetylmorphine — a potent mu agonist that crosses the blood-brain barrier readily — and then to morphine. The two acetyl groups raise lipophilicity enough to increase the rate of central nervous system entry several-fold over morphine, which is the whole of the difference in onset. The clinical consequences follow: analgesic potency by injection is higher than morphine on a milligram basis, the receptor pharmacology is morphine's, and the higher aqueous solubility of the hydrochloride is why palliative-care services value it for subcutaneous infusion in small volumes.",
        evidenceSource:
          'Standard opioid pharmacology; UK Diamorphine Hydrochloride for Injection SmPC, pharmacological properties; forensic 6-MAM interpretation literature',
        measuredMetric:
          'Mu-opioid receptor affinity of diacetylmorphine versus 6-monoacetylmorphine versus morphine',
        auditFlag: 'verified',
      },
      {
        id: 'her-a6',
        category: 'inferred',
        title:
          'What is sold as heroin now often is not heroin, and the risk figures have not caught up',
        laymanSummary:
          'The illicit supply in North America is increasingly fentanyl, nitazenes and xylazine rather than heroin. Statements about heroin overdose risk drawn from older data are describing a different drug.',
        technicalDetails:
          'Every dose-response, overdose-risk and treatment-outcome figure on this page was generated with analytically confirmed diacetylmorphine — pharmaceutical-grade in the trials, or opium-derived material of measured purity in the epidemiology. The substance now sold as heroin in much of North America contains illicitly manufactured fentanyl and its analogues, benzimidazole opioids of the nitazene class, and the veterinary alpha-2 agonist xylazine, in combinations that vary between batches. Those have different potencies, different durations, and in the case of xylazine no response to naloxone. The inference that fails is the ordinary one a reader would make: that risk information about heroin describes the risk of what is being sold as heroin. Each of those adulterants has its own record on this site.',
        evidenceSource:
          'Composition of the illicit opioid supply — see the fentanyl, nitazene and xylazine records on this site for the primary sources',
        inferredClaim:
          'That overdose risk, potency and naloxone responsiveness figures for diacetylmorphine describe the material currently sold as heroin',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected, smoked or insufflated; medically, injected',
        laymanDesc:
          'The UK medicine is a powder dissolved and injected into a vein, a muscle or under the skin. It dissolves in far less water than morphine, which is why it suits slow infusion pumps.',
        molecularDetail:
          'Diamorphine hydrochloride is supplied as a freeze-dried powder for reconstitution and given intramuscularly, intravenously or subcutaneously; glucose infusion is the preferred diluent for continuous administration. Its high aqueous solubility relative to morphine salts is the practical reason for its use in palliative-care syringe drivers.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Crosses into the brain several times faster than morphine',
        laymanDesc:
          'The two acetyl groups make the molecule much greasier, so it slips through the blood-brain barrier far more quickly than morphine can.',
        molecularDetail:
          'Acetylation at the 3- and 6-positions raises lipophilicity substantially, increasing the rate of blood-brain barrier penetration by roughly an order of magnitude over morphine. This rate difference, not a receptor difference, is what produces the characteristic rapid onset.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Deacetylated to 6-monoacetylmorphine and then to morphine',
        laymanDesc:
          'Enzymes strip off the added groups within minutes. What ends up on the receptor is morphine, plus an intermediate that is itself a strong opioid.',
        molecularDetail:
          'Plasma and tissue esterases hydrolyse diacetylmorphine to 6-monoacetylmorphine within minutes, then more slowly to morphine. 6-MAM is a potent mu agonist and is the analyte that proves heroin exposure specifically, because it has no other source.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Mu-opioid receptors are activated across pain, reward and respiratory circuits',
        laymanDesc:
          'The receptor sits in the pain pathways, the reward pathways and the part of the brainstem that sets breathing rate. It is activated in all three at once.',
        molecularDetail:
          'Mu-opioid receptor agonism in the periaqueductal grey and spinal dorsal horn produces analgesia; in the ventral tegmental area, reward; in the pre-Bötzinger complex, dose-dependent suppression of respiratory drive. The therapeutic and the lethal effect are the same receptor in different tissue, which is why no mu agonist has separated them.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'Analgesia, or retention in treatment, or respiratory arrest',
        laymanDesc:
          'In a hospital it relieves severe pain. In a supervised clinic it keeps people in treatment. Unsupervised, in a supply of unknown composition, it stops breathing.',
        molecularDetail:
          'Measured endpoints across this page: licensed analgesic use in the UK; 72% versus 27% street-heroin-negative urines in RIOTT; 87.8% versus 54.1% treatment retention in NAOMI. Respiratory depression is dose-dependent and reversible by naloxone, which competitively displaces the agonist — a fact that does not extend to xylazine-adulterated supply.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'RIOTT (ISRCTN01338071)',
        phase: 'Multisite open-label randomised controlled trial',
        sampleSize: 127,
        primaryEndpoint:
          '50% or more street-heroin-negative weekly urine specimens during weeks 14 to 26',
        endpointMet: true,
        statisticalPValue:
          'Injectable heroin 72% vs oral methadone 27%, OR 7.42 (95% CI 2.69 to 20.46), p<0.0001; NNT 2.17',
        unreportedAdverseSignals:
          'Injectable methadone did not separate significantly from oral methadone (OR 1.74, p=0.264), so the effect is specific to heroin rather than to the injectable route or the supervised clinic.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NAOMI (NCT00175357)',
        phase: 'Phase 3 open-label randomised controlled trial',
        sampleSize: 226,
        primaryEndpoint:
          'Retention in addiction treatment or drug-free status at 12 months, and reduction in illicit-drug use or other illegal activity',
        endpointMet: true,
        statisticalPValue:
          'Retention 87.8% vs 54.1% (rate ratio 1.62, 95% CI 1.35 to 1.95, P<0.001); illicit-activity reduction 67.0% vs 47.7% (rate ratio 1.40, 1.11 to 1.77, P=0.004)',
        unreportedAdverseSignals:
          'Overdoses in 10 patients and seizures in 6 in the diacetylmorphine arm, all in a supervised setting with medical staff present — which is why the authors made supervision a condition of the conclusion.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '72% versus 27% achieving predominantly street-heroin-negative urines on supervised injectable heroin against optimised oral methadone, NNT 2.17',
        '87.8% versus 54.1% retention in treatment at 12 months in 226 Canadian patients refractory to at least two prior treatments',
        'Ten overdoses and six seizures in the supervised diacetylmorphine arm of NAOMI, all managed on site',
        'A licensed UK indication for severe surgical, myocardial-infarction and terminal pain, and for dyspnoea in acute pulmonary oedema',
      ],
      unsupportedInferences: [
        'That heroin binds the mu receptor more strongly than morphine — it is a prodrug with low intrinsic affinity, and the difference is rate of brain entry',
        'That the trial results generalise beyond people who have already failed conventional treatment; no trial enrolled an unselected population',
        'That risk figures for diacetylmorphine describe the material now sold as heroin, which frequently contains fentanyl analogues, nitazenes or xylazine',
        'That Schedule I status reflects an assessment that medical use is impossible, when the same molecule is licensed elsewhere',
      ],
      whatFailedInitially: [
        'Supervised injectable methadone, the intermediate arm of RIOTT, did not separate significantly from optimised oral methadone',
        'Bayer marketed heroin from 1898 as a cough remedy and a supposedly non-addictive morphine substitute; the non-addictive claim was wrong and the US banned medical use in 1924',
      ],
      realWorldOutcome: [
        'Heroin-assisted treatment is an established second-line service in Switzerland, the Netherlands, Germany, Denmark, Canada and the UK',
        'The molecule remains Schedule I in the United States, where it cannot be prescribed for any indication',
      ],
    },
    deliverySystem: {
      type: 'Injection — intravenous, intramuscular or subcutaneous; freeze-dried powder for reconstitution',
      description:
        'The UK medicine is a sterile freeze-dried powder reconstituted before use. Its high solubility means a large opioid dose fits in a small volume, which is the practical reason palliative-care services use it in subcutaneous syringe drivers where morphine salts would need several times the fluid. In heroin-assisted treatment the injection is given in a licensed clinic, witnessed, with medical staff and resuscitation equipment present — a requirement that came directly out of the overdose and seizure events recorded in the trials.',
      safetyProfile:
        'Class effects of a mu-opioid agonist: dose-dependent respiratory depression, sedation, miosis, constipation, nausea, pruritus and urinary retention, with tolerance developing to most of them except constipation and miosis. Respiratory depression is the fatal mechanism and is reversible by naloxone. Physical dependence develops with repeated use and abrupt cessation produces a withdrawal syndrome that is severely unpleasant and not usually life-threatening in otherwise healthy adults, in contrast to alcohol or benzodiazepine withdrawal. In the supervised trials, overdose and seizure occurred at measurable rates even with pharmaceutical-grade material of known strength, which is the argument for supervision rather than against the treatment.',
    },
    commonQuestions: [
      {
        q: 'Heroin is a medicine in Britain?',
        a: 'Yes, under its non-proprietary name diamorphine. Its UK licence covers severe pain associated with surgical procedures, myocardial infarction, pain in the terminally ill, and dyspnoea in acute pulmonary oedema. It is a Class A controlled drug in Schedule 2 of the Misuse of Drugs Regulations, the schedule for controlled drugs with recognised medical use, and it is carried by ambulance services. In the United States the same molecule is in Schedule I, the schedule defined by having no currently accepted medical use. That is not two readings of ambiguous evidence; it is one country having a licensed product and another having a legal determination that predates it.',
        auditNote:
          'This is the clearest conclusion_shift on the site: two regulators, one molecule, opposite findings, both current.',
      },
      {
        q: 'Is heroin stronger than morphine?',
        a: "By injection, on a milligram basis, yes — and not because it binds the receptor better. Diacetylmorphine has low affinity at the mu-opioid receptor. The two acetyl groups make it much more fat-soluble, so it crosses into the brain far faster, and once inside it is stripped back to 6-monoacetylmorphine and then to morphine, which are what actually bind. So the potency difference is a delivery difference and the pharmacology is morphine's. That is also why the side effects, the overdose mechanism and the naloxone response are identical.",
      },
      {
        q: 'Does prescribing heroin to dependent people work?',
        a: 'In the population that has been studied, yes, and the effect size is unusually large. In RIOTT, 72% of patients on supervised injectable heroin achieved predominantly street-heroin-negative urines against 27% on optimised oral methadone, with a number needed to treat of about two. In NAOMI, retention at twelve months was 87.8% against 54.1%. Both trials enrolled people who had already failed conventional treatment repeatedly, so the result applies to that group and no other. Both also recorded overdoses and seizures during supervised administration, which is why every programme requires a clinic with medical staff present rather than a take-home prescription.',
      },
      {
        q: 'Is the heroin sold on the street still heroin?',
        a: "Increasingly not, particularly in North America. The illicit opioid supply now routinely contains illicitly manufactured fentanyl and its analogues, benzimidazole opioids of the nitazene class, and xylazine, in proportions that vary between batches and are unknown to the person using them. Those substances have different potencies, different durations and, in xylazine's case, no response to naloxone. Everything measured on this page was measured with confirmed diacetylmorphine, and that is not what the phrase describes any more.",
      },
      {
        q: 'Why does this page show no price?',
        a: 'There is no US market and therefore no US price. The UK product has an NHS list price, but the seed file that produced this page could not verify a per-dose cost of production for it, and `SeedPricing` requires both. A street price is a survey estimate of what people report paying, not a published figure, and this site does not print it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Strang J et al. Supervised injectable heroin or injectable methadone versus optimised oral methadone as treatment for chronic heroin addicts in England (RIOTT). Lancet 2010;375:1885-1895',
        identifier: '10.1016/S0140-6736(10)60349-2',
        kind: 'doi',
      },
      {
        label:
          'Oviedo-Joekes E et al. Diacetylmorphine versus Methadone for the Treatment of Opioid Addiction (NAOMI). N Engl J Med 2009;361:777-786',
        identifier: '10.1056/NEJMoa0810635',
        kind: 'doi',
      },
      {
        label:
          'Ferri M, Davoli M, Perucci CA. Heroin maintenance for chronic heroin-dependent individuals. Cochrane Database Syst Rev 2011;(12):CD003410',
        identifier: '10.1002/14651858.CD003410.pub4',
        kind: 'doi',
      },
      {
        label:
          'Diamorphine Hydrochloride 10mg for Injection — Summary of Product Characteristics, UK electronic Medicines Compendium (licensed indications, section 4.1)',
        identifier: 'https://www.medicines.org.uk/emc/product/1466/smpc',
        kind: 'regulatory',
      },
      {
        label:
          'UK Home Office, Controlled drugs: list of drugs and precursor chemicals — diamorphine as a Class A drug in Schedule 2 of the Misuse of Drugs Regulations 2001',
        identifier: 'https://www.gov.uk/government/publications/controlled-drugs-list--2',
        kind: 'regulatory',
      },
      {
        label: 'ClinicalTrials.gov NCT00175357 — NAOMI',
        identifier: 'NCT00175357',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 5462328 — heroin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5462328',
        kind: 'url',
      },
      CSA_SCHEDULES_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 9. Cocaine
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cocaine',
    name: 'Cocaine',
    tradeName: 'Goprelto and Numbrino — cocaine hydrochloride nasal solution 4%',
    sponsor:
      'Goprelto, NDA 209963, approved 14 December 2017; Numbrino, NDA 209575, approved 10 January 2020. Both are 4% cocaine hydrochloride nasal solutions',
    targetGene: 'SLC6A3',
    targetProtein:
      'Dopamine transporter (DAT), with parallel blockade of the norepinephrine and serotonin transporters; separately a voltage-gated sodium channel blocker, which is the local-anaesthetic action',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2017,
    indication:
      'Induction of local anaesthesia of the mucous membranes when performing diagnostic procedures and surgeries on or through the nasal cavities in adults. Schedule II',
    patientFriendlyIndication:
      'Numbing the inside of the nose for procedures and surgery there. That is the whole of its approved use',
    anatomicalSite:
      'Nasal mucosa for the approved indication; dopaminergic terminals of the nucleus accumbens and striatum for the systemic effect',
    conditionContext: {
      conditionExplainer:
        'Cocaine is two drugs in one molecule. It blocks voltage-gated sodium channels, which makes it a local anaesthetic, and it blocks the dopamine transporter, which makes it a stimulant. The nasal solution is licensed for the first property; the second is why it is Schedule II and why it is on the street.',
      whyItMatters:
        'It is the counterexample to the assumption that a scheduled drug has no medical use. Cocaine sits in Schedule II with a current, live, FDA-approved indication and two products approved this decade — and it also produces a 24-fold spike in heart attack risk in the hour after use.',
      whoTakesThis:
        "Medically: adults undergoing diagnostic procedures or surgery on or through the nasal cavity, where the drug's simultaneous vasoconstriction is a practical advantage over other local anaesthetics. Otherwise: a large recreational population, using material of unknown purity that is frequently adulterated with levamisole.",
      clinicalGoals:
        'Mucosal anaesthesia with vasoconstriction in the same application, so the surgical field is both numb and less bloody.',
    },
    oneSentenceVerdict:
      'A Schedule II drug with two nasal-anaesthetic products approved since 2017, a measured 23.7-fold increase in myocardial infarction risk in the hour after use, and no approved pharmacotherapy for dependence on it after four decades of trials.',
    laymanHowItWorks:
      'Dopamine is released into the gap between nerve cells and then pumped back for reuse. Cocaine plugs that pump, so dopamine piles up in the gap — most consequentially in the reward circuitry, where the signal is normally a brief pulse and becomes a sustained flood. Separately and independently, cocaine blocks the sodium channels that nerves use to fire at all, which is why painting it on a mucous membrane makes that membrane numb. The medical use is entirely the second property; everything else about the drug is the first.',
    auditConfidence: 'High Confidence',
    confidenceScore: 76,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1[C@H]2CC[C@@H]1[C@H]([C@H](C2)OC(=O)C3=CC=CC=C3)C(=O)OC',
      chemicalFormula: 'C17H21NO4',
      molecularWeight:
        '303.35 g/mol (free base). The nasal solution and most illicit powder are the hydrochloride; freebase and crack are the same molecule as the free base, which is volatile enough to be smoked',
      targetReceptorAffinity:
        'Blocks the dopamine, norepinephrine and serotonin transporters with broadly comparable low-micromolar to high-nanomolar potency; the reinforcing effect tracks dopamine transporter occupancy in the striatum. Independently blocks voltage-gated sodium channels as an ester-type local anaesthetic, which is a distinct site and a distinct pharmacology from the transporter block.',
      structureSource: {
        label: 'PubChem CID 446220 (cocaine) — SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/446220',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'coc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identification, purity and the adulterant panel',
          description:
            'Cocaine identification against a certified standard is routine. The informative part of the analysis is the cutting agents: levamisole is present in a large share of seized cocaine, and phenacetin, caffeine, lidocaine, benzocaine and diltiazem are common. A purity percentage without an adulterant list is an incomplete answer to the question a clinician is actually asking.',
          reagentsAndBuffer:
            'Cocaine hydrochloride certified reference standard, cocaine-d3 internal standard, levamisole, phenacetin, lidocaine, benzocaine, caffeine and diltiazem standards, GC-MS with EI at 70 eV, characteristic cocaine ions m/z 82, 182 and 303',
        },
        {
          id: 'coc-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Salt-form and enantiomeric identity',
          description:
            'Only the naturally occurring (R)-(-)-cocaine has the pharmacology described on this page; its enantiomer is far weaker at the transporter. Distinguishing hydrochloride from free base is a solubility and melting-point question that determines route: the salt is water-soluble and insufflated or injected, the free base is volatile and smoked.',
          dependsOnStepId: 'coc-w1',
          reagentsAndBuffer:
            'Chiral stationary-phase HPLC with (R)- and (S)-cocaine standards, FTIR for salt-form confirmation, melting-point determination',
        },
        {
          id: 'coc-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'Benzoylecgonine and cocaethylene in blood and urine',
          description:
            'Cocaine hydrolyses fast — its plasma half-life is under an hour — so the analyte in urine is benzoylecgonine, which persists far longer and tells you nothing about timing. Cocaethylene, formed only when cocaine and ethanol are present together, is the marker that proves concurrent alcohol use and is itself an active, longer-lived DAT blocker.',
          dependsOnStepId: 'coc-w1',
          reagentsAndBuffer:
            'Sodium fluoride preservative tubes (cocaine hydrolyses in unpreserved blood), benzoylecgonine-d3 and cocaethylene-d3 internal standards, solid-phase extraction, UHPLC-MS/MS',
        },
        {
          id: 'coc-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Separate DAT, NET and SERT expressing lines',
          description:
            'Human SLC6A3, SLC6A2 and SLC6A4 expressed individually in HEK293 cells, so that transporter selectivity is measured rather than assumed. Cocaine is not selective, and the point of the experiment is to quantify how unselective it is.',
          dependsOnStepId: 'coc-w2',
          reagentsAndBuffer:
            'HEK293 cells with separate human SLC6A3, SLC6A2 and SLC6A4 constructs, lipid transfection reagent, DMEM with 10% fetal bovine serum and selection antibiotic',
        },
        {
          id: 'coc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Uptake inhibition and sodium-channel block, measured separately',
          description:
            "Two independent assays for two independent actions. Tritiated monoamine uptake inhibition gives the transporter IC50 across all three carriers; whole-cell patch clamp on a sodium-channel-expressing line gives the local-anaesthetic potency. Reporting one and calling it cocaine's potency is the standard error in this literature, because the medical product depends entirely on the second and the schedule depends entirely on the first.",
          dependsOnStepId: 'coc-w4',
          reagentsAndBuffer:
            '[3H]-dopamine, [3H]-noradrenaline and [3H]-5-HT, Krebs-HEPES buffer with ascorbate and pargyline; separately Nav1.5 or Nav1.7 expressing cells with whole-cell patch clamp and use-dependent block protocols',
        },
      ],
    },
    keyAudits: [
      {
        id: 'coc-a1',
        category: 'measured',
        title: 'Myocardial infarction risk rose 23.7-fold in the hour after use',
        laymanSummary:
          'In a study of 3,946 heart attack patients, the risk of a heart attack in the hour after using cocaine was about twenty-four times baseline, and it fell away quickly after that.',
        technicalDetails:
          'Determinants of Myocardial Infarction Onset Study: 3,946 patients with acute myocardial infarction, including 1,282 women, interviewed on average four days after infarction. Thirty-eight (1%) reported cocaine use in the prior year and nine reported use within the 60 minutes preceding symptom onset. Using a case-crossover design with self-matched controls, the risk of myocardial infarction onset was elevated 23.7-fold over baseline (95% CI 8.5 to 66.3) in the 60 minutes after cocaine use, decreasing rapidly thereafter. Cocaine users in the cohort were younger (mean 44 versus 61 years), more likely male and far more likely to be current smokers. The wide confidence interval reflects nine exposed cases; the case-crossover design removes between-person confounding by construction, because each patient is his own control.',
        evidenceSource:
          'Mittleman MA et al. Triggering of myocardial infarction by cocaine. Circulation 1999;99:2737-2741',
        doi: '10.1161/01.cir.99.21.2737',
        measuredMetric:
          'Relative risk of acute myocardial infarction onset in the 60 minutes after cocaine use, case-crossover',
        auditFlag: 'verified',
      },
      {
        id: 'coc-a2',
        category: 'measured',
        title: 'Two nasal anaesthetic products approved in the last decade, both Schedule II',
        laymanSummary:
          'The FDA approved a 4% cocaine nasal solution in December 2017 and another in January 2020, for numbing the inside of the nose during procedures.',
        technicalDetails:
          'Goprelto, cocaine hydrochloride nasal solution 4%, was approved on 14 December 2017 under NDA 209963. Numbrino, also cocaine hydrochloride nasal solution 4%, was approved on 10 January 2020 under NDA 209575. The labelled indication is induction of local anaesthesia of the mucous membranes when performing diagnostic procedures and surgeries on or through the nasal cavities in adults. Both labels state that the product contains cocaine, a Schedule II controlled substance with a high potential for abuse, and carry warnings about misuse, abuse and diversion. This is the concrete answer to the common assumption that a scheduled drug is one nobody has found a use for: cocaine is in the same schedule as morphine and oxycodone, which is the schedule for substances with accepted medical use and high abuse potential, and it has current approvals.',
        evidenceSource:
          'Drugs@FDA NDA 209963 (GOPRELTO, 14 December 2017) and NDA 209575 (NUMBRINO, 10 January 2020); NUMBRINO prescribing information sections 1 and 9.1',
        measuredMetric: 'Existence and date of current FDA approvals for cocaine hydrochloride',
        auditFlag: 'verified',
      },
      {
        id: 'coc-a3',
        category: 'measured',
        title: 'Levamisole in the supply causes agranulocytosis, and nobody knows why it is there',
        laymanSummary:
          'A veterinary and former human medicine turns up in a large share of street cocaine. It can wipe out white blood cells. The reason it is added has never been established.',
        technicalDetails:
          "Levamisole has been found as an adulterant in street cocaine at high prevalence, and case reports link it to agranulocytosis in cocaine users. Agranulocytosis is a known hazard of therapeutic levamisole and contributed to its withdrawal from the US market; levamisole had been an FDA-approved immunomodulator, chemotherapy adjuvant and anthelmintic. The purpose of the adulteration is unresolved. One hypothesis rests on the metabolism of levamisole to aminorex — an amphetamine-like compound with abuse potential — but that conversion has been demonstrated in racehorses and not reported in humans. So the adulterant is documented, its haematological toxicity is documented, and the motive for its presence remains, in the authors' word, an enigma.",
        evidenceSource:
          'Chang A, Osterloh J, Thomas J. Levamisole: a dangerous new cocaine adulterant. Clin Pharmacol Ther 2010;88:408-411',
        doi: '10.1038/clpt.2010.156',
        measuredMetric:
          'Presence of levamisole in seized cocaine and reported agranulocytosis in exposed users',
        auditFlag: 'verified',
      },
      {
        id: 'coc-a4',
        category: 'failed',
        title: 'No approved medication for cocaine use disorder, after four decades of trials',
        laymanSummary:
          'Opioid dependence has methadone and buprenorphine. Alcohol has three approved drugs. Cocaine has none, and it is not for want of trying.',
        technicalDetails:
          'There is no FDA-approved pharmacotherapy for cocaine use disorder. Candidate agents tested in randomised trials over four decades include dopamine agonists and partial agonists, disulfiram, modafinil, topiramate, bupropion, N-acetylcysteine, and an anti-cocaine vaccine; none has produced a replicated effect large and consistent enough to support an approval. The interventions with the most consistent randomised evidence are behavioural — contingency management in particular. The absence is informative rather than merely disappointing: opioid substitution works because a receptor agonist can occupy the same site with a slower onset, and there is no comparable substitution strategy for a reuptake blocker whose reinforcing effect depends on the rate of transporter occupancy.',
        evidenceSource:
          'Absence of any approved product for cocaine use disorder in Drugs@FDA; the only current cocaine approvals are the two nasal anaesthetics',
        measuredMetric:
          'Number of FDA-approved pharmacotherapies for cocaine use disorder as of this audit: zero',
        auditFlag: 'verified',
      },
      {
        id: 'coc-a5',
        category: 'inferred',
        title: 'The rate of arrival, not the amount, is what makes a route reinforcing',
        laymanSummary:
          'Chewed coca leaf, insufflated powder and smoked freebase are the same molecule. They differ in how fast the drug reaches the brain, and that difference is the addiction liability.',
        technicalDetails:
          "Cocaine's reinforcing effect tracks the rate of rise of striatal dopamine transporter occupancy rather than the peak concentration alone. Smoked free base and intravenous injection produce brain concentrations within seconds; insufflated hydrochloride takes minutes because it must cross the nasal mucosa and because cocaine's own vasoconstriction limits its absorption; oral or buccal coca leaf takes far longer still and reaches much lower concentrations. The same relationship explains why the approved nasal product, applied topically at low concentration to a vasoconstricted mucosa, has a very different abuse profile from the same salt insufflated recreationally — the label still classifies it as Schedule II with a high potential for abuse, which is the appropriately cautious position rather than a measured equivalence.",
        evidenceSource:
          'NUMBRINO prescribing information, sections 5.1 and 9; pharmacokinetics of topical mucosal application versus insufflation',
        inferredClaim:
          'That a topical mucosal application of 4% cocaine solution carries the same reinforcing liability as recreational insufflation of the same salt — the schedule assumes it, the pharmacokinetics do not support it, and no study has measured it',
        auditFlag: 'caution',
      },
      {
        id: 'coc-a6',
        category: 'measured',
        title: 'Cocaine plus alcohol makes a third drug',
        laymanSummary:
          'Taken together, the liver joins cocaine and alcohol into cocaethylene, which is itself active, lasts longer than cocaine, and is more cardiotoxic.',
        technicalDetails:
          'In the presence of ethanol, hepatic carboxylesterase transesterifies cocaine to cocaethylene (benzoylecgonine ethyl ester). Cocaethylene is an active dopamine transporter blocker with a longer plasma half-life than cocaine and greater cardiotoxicity in animal models, and it is detectable in blood and urine only when the two drugs were used together — which makes it a specific analytical marker for concurrent use. Because cocaine and alcohol are commonly used together, this is not an exotic interaction; it is the ordinary case, and it means the pharmacokinetics measured for cocaine alone understate the duration of exposure in the usual real-world pattern.',
        evidenceSource:
          'Forensic toxicology of cocaethylene as summarised in the analytical literature; the analyte is standard in cocaine confirmation panels',
        measuredMetric:
          'Formation and detection of cocaethylene when cocaine and ethanol are co-administered',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Applied to a mucous membrane, insufflated, injected or smoked',
        laymanDesc:
          'Medically it is dabbed onto the lining of the nose. Recreationally the salt is snorted or injected and the free base is smoked, which is far faster.',
        molecularDetail:
          "The approved product is a 4% cocaine hydrochloride solution applied topically to nasal mucosa. Cocaine's own vasoconstrictor action limits its systemic absorption from that route. Smoked free base and intravenous administration produce peak brain concentrations within seconds.",
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters the brain quickly and is destroyed quickly',
        laymanDesc:
          'It crosses into the brain fast and is broken down fast — the plasma half-life is under an hour, which is why the effect is short and repeated dosing is the pattern.',
        molecularDetail:
          'Rapid blood-brain barrier penetration; plasma half-life of roughly 40 to 60 minutes with hydrolysis by plasma and hepatic esterases to benzoylecgonine and ecgonine methyl ester. In the presence of ethanol, transesterification yields cocaethylene, which is active and longer-lived.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Blocks the dopamine transporter, and the noradrenaline and serotonin ones too',
        laymanDesc:
          'It plugs the pump that clears dopamine from the synapse. Dopamine accumulates where it would normally have been cleared within milliseconds.',
        molecularDetail:
          'Competitive blockade of DAT, NET and SERT. Reinforcement tracks striatal DAT occupancy and its rate of rise. Noradrenaline transporter blockade drives the cardiovascular effects: tachycardia, hypertension and coronary vasoconstriction.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Separately, sodium channels stop conducting',
        laymanDesc:
          'The second, unrelated action: nerves cannot fire where the drug is applied. That is the numbing, and it is the only reason there is an approved product.',
        molecularDetail:
          'Use-dependent block of voltage-gated sodium channels as an ester-type local anaesthetic. In cardiac tissue the same sodium-channel block contributes to QRS widening and arrhythmia at high systemic concentrations — the local-anaesthetic property becoming a cardiac toxicity.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Mucosal anaesthesia with a dry field, or a 24-fold spike in infarction risk',
        laymanDesc:
          'On a nasal membrane: numbness and less bleeding, which is why surgeons use it. Systemically: a short, sharp rise in heart attack risk that fades within the hour.',
        molecularDetail:
          'Approved endpoint is mucosal anaesthesia for nasal procedures. Systemic effects measured in the epidemiology: 23.7-fold elevation of myocardial infarction risk in the first 60 minutes (95% CI 8.5 to 66.3), driven by coronary vasoconstriction, tachycardia, hypertension and increased platelet aggregation on top of accelerated atherosclerosis in chronic users.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Determinants of Myocardial Infarction Onset Study, cocaine analysis',
        phase: 'Case-crossover epidemiological study',
        sampleSize: 3946,
        primaryEndpoint:
          'Relative risk of acute myocardial infarction onset in the 60 minutes following cocaine use',
        endpointMet: true,
        statisticalPValue: 'Relative risk 23.7 (95% CI 8.5 to 66.3) in the hour after use',
        unreportedAdverseSignals:
          'Nine exposed cases out of 3,946 interviews, which is what produces the very wide confidence interval; the case-crossover design nonetheless removes between-person confounding by construction.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 23.7-fold elevation in myocardial infarction risk in the 60 minutes after use, in a self-matched case-crossover design',
        'FDA approval of two 4% cocaine hydrochloride nasal solutions, in December 2017 and January 2020, for mucosal anaesthesia',
        'Levamisole as a widespread adulterant of street cocaine, with reported agranulocytosis in exposed users',
        'Formation of cocaethylene, an active longer-lived transporter blocker, whenever cocaine and ethanol are taken together',
      ],
      unsupportedInferences: [
        'That a Schedule II listing implies no accepted medical use — cocaine has two current approvals',
        'That topical 4% mucosal application carries the reinforcing liability of recreational insufflation; the label assumes it and no study has measured it',
        'That levamisole is added to potentiate cocaine — the aminorex metabolism that would support it has been shown in horses, not humans',
      ],
      whatFailedInitially: [
        'Every candidate pharmacotherapy for cocaine use disorder tested over four decades, including dopamine agonists, disulfiram, modafinil, topiramate and an anti-cocaine vaccine',
        'Levamisole itself was withdrawn from the US market as a medicine, in part over agranulocytosis — the same toxicity it now causes as a cocaine adulterant',
      ],
      realWorldOutcome: [
        'Cocaine has current, marketed, FDA-approved products and remains one of the most commonly used illicit stimulants',
        'There is still no approved medication for cocaine use disorder; the interventions with the most consistent randomised evidence are behavioural',
      ],
    },
    deliverySystem: {
      type: 'Topical nasal solution, 4% cocaine hydrochloride, applied to the mucous membrane',
      description:
        "The approved product is a solution applied directly to the nasal mucosa before a procedure. The drug's own vasoconstriction limits its systemic absorption and simultaneously reduces bleeding in the surgical field, which is the property that has kept it in use despite the regulatory burden of a Schedule II listing.",
      safetyProfile:
        "The nasal solution's labelling covers hypertension and cardiovascular risk, with contraindications relating to blood pressure, and carries a warning that the product contains a Schedule II substance with high potential for abuse, misuse and diversion. Systemically, cocaine produces tachycardia, hypertension, coronary vasoconstriction and increased platelet aggregation; the measured consequence is a 23.7-fold elevation of myocardial infarction risk in the first hour after use, falling rapidly thereafter. At high systemic concentrations sodium-channel block produces QRS widening and arrhythmia. Chronic intranasal use causes mucosal atrophy and septal perforation through repeated vasoconstriction. Levamisole adulteration of the illicit supply causes agranulocytosis, which is a hazard of the supply rather than of the molecule.",
    },
    commonQuestions: [
      {
        q: 'Cocaine is an approved medicine?',
        a: 'Yes, and recently. Goprelto was approved on 14 December 2017 and Numbrino on 10 January 2020, both 4% cocaine hydrochloride nasal solutions for inducing local anaesthesia of the nasal mucous membranes during procedures and surgery. Cocaine is Schedule II, the same schedule as morphine, fentanyl and oxycodone — the schedule for substances with a high abuse potential and an accepted medical use. Schedule I, the one people usually mean when they say "banned", is a different category and cocaine has never been in it.',
      },
      {
        q: 'Why do surgeons use it rather than lidocaine?',
        a: 'Because it does two useful things at once. It blocks sodium channels, so the mucosa goes numb, and it blocks noradrenaline reuptake, so the blood vessels in that mucosa constrict and the field bleeds less. Any other local anaesthetic needs a vasoconstrictor added separately. That single-agent convenience in nasal surgery is the reason a Schedule II drug with a heavy regulatory burden still had two new approvals in the last decade.',
      },
      {
        q: 'How dangerous is it for the heart?',
        a: 'The best-quantified figure is a 23.7-fold increase in the risk of a heart attack in the 60 minutes after use, with the risk falling away rapidly after that. That comes from a case-crossover analysis of 3,946 infarction patients, in which each patient served as his own control, so it is not confounded by who uses cocaine. Nine of those patients had used within the hour, which is why the confidence interval runs from 8.5 to 66.3. The mechanisms are coronary vasoconstriction, tachycardia and hypertension against a background of accelerated atherosclerosis in chronic users, plus increased platelet aggregation.',
      },
      {
        q: 'What is levamisole doing in cocaine?',
        a: 'Nobody has established that. Levamisole is a veterinary anthelmintic that was once an approved human medicine and was withdrawn partly because it causes agranulocytosis — destruction of the white cells that fight infection. It now appears as an adulterant in a large share of street cocaine and has been linked to agranulocytosis in users. The leading hypothesis is that it is metabolised to aminorex, an amphetamine-like compound, but that conversion has been demonstrated in racehorses and never reported in humans. The toxicity is documented; the motive is not.',
      },
      {
        q: 'Why does this page show no price?',
        a: 'The approved nasal solutions are specialty hospital products whose acquisition prices vary by contract, and no per-dose cost of production could be verified for them. A street price is not a published figure. Both halves of `SeedPricing` are missing, so the block is absent.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Mittleman MA et al. Triggering of myocardial infarction by cocaine. Circulation 1999;99:2737-2741',
        identifier: '10.1161/01.cir.99.21.2737',
        kind: 'doi',
      },
      {
        label:
          'Chang A, Osterloh J, Thomas J. Levamisole: a dangerous new cocaine adulterant. Clin Pharmacol Ther 2010;88:408-411',
        identifier: '10.1038/clpt.2010.156',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: GOPRELTO (cocaine hydrochloride) nasal solution 4%, NDA 209963, approved 14 December 2017',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=209963',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: NUMBRINO (cocaine hydrochloride) nasal solution 4%, NDA 209575, approved 10 January 2020',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=209575',
        kind: 'regulatory',
      },
      {
        label:
          'NUMBRINO prescribing information (DailyMed SPL d724b5b4-6654-4bf5-9eed-e2c7943084ed) — indication, section 1; controlled substance status, section 9.1',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d724b5b4-6654-4bf5-9eed-e2c7943084ed',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 446220 — cocaine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/446220',
        kind: 'url',
      },
      {
        label:
          'Controlled Substances Act Schedule II, 21 CFR 1308.12 — cocaine listed among the coca-derived substances',
        identifier: 'https://www.ecfr.gov/current/title-21/chapter-II/part-1308/section-1308.12',
        kind: 'regulatory',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 10. Methamphetamine
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'methamphetamine',
    name: 'Methamphetamine',
    tradeName: 'Desoxyn (methamphetamine hydrochloride tablets), plus generics',
    sponsor:
      'Desoxyn, NDA 005378, original approval 31 December 1943; generic methamphetamine hydrochloride tablets from Mayne Pharma, Hikma and Dr. Reddy\'s',
    targetGene: 'SLC6A3',
    targetProtein:
      'Dopamine transporter (DAT) and vesicular monoamine transporter 2 (VMAT2) — a substrate-type releaser at both, not a reuptake blocker',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1943,
    indication:
      'Attention deficit disorder with hyperactivity in children over 6 years of age, as part of a total treatment programme; and short-term adjunctive treatment of exogenous obesity. Schedule II',
    patientFriendlyIndication:
      'ADHD in children over six, as one part of a wider treatment plan. The label also carries a short-term weight-loss indication that is essentially never used',
    anatomicalSite:
      'Dopaminergic terminals of the striatum and nucleus accumbens; noradrenergic terminals throughout',
    conditionContext: {
      conditionExplainer:
        'Methamphetamine has been an approved prescription medicine in the United States since 1943 and remains one. The tablet and the street drug are the same molecule; what differs is dose, route, frequency and purity, and every one of those differences matters more than it does for most drugs.',
      whyItMatters:
        'The gap between Desoxyn and the street drug is the clearest available demonstration that a molecule\'s risk profile is not a property of the molecule alone. A dopamine terminal exposed to a small oral dose once a day is in a different pharmacological situation from one exposed to a large smoked or injected dose repeatedly over days.',
      whoTakesThis:
        'Medically: children over six with ADHD, in practice rarely, because there are many alternatives and the prescribing burden is high. Otherwise: a large population using illicitly manufactured methamphetamine, which is now high-purity and cheap in North America.',
      clinicalGoals:
        'A stabilising effect on distractibility, attention span, hyperactivity, emotional lability and impulsivity, as part of a programme that includes psychological, educational and social measures.',
    },
    oneSentenceVerdict:
      'A Schedule II drug approved for childhood ADHD since 1943 whose label warns that misuse may cause sudden death, and whose dopamine transporter losses in heavy users partially recover after more than a year of abstinence.',
    laymanHowItWorks:
      'Cocaine plugs the dopamine pump. Methamphetamine does something more forceful: it is carried into the nerve terminal by the pump, empties dopamine out of the storage vesicles into the cell interior, and then runs the pump backwards so the dopamine floods out into the synapse. The consequence is a much larger and much longer-lasting release than a reuptake blocker can produce, and it also leaves dopamine sitting in the cytoplasm where it oxidises — which is the leading explanation for why heavy use damages the terminals themselves rather than just overstimulating them.',
    auditConfidence: 'High Confidence',
    confidenceScore: 75,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@@H](CC1=CC=CC=C1)NC',
      chemicalFormula: 'C10H15N',
      molecularWeight:
        '149.23 g/mol (free base). The structure shown is the (S)-(+) enantiomer, dextromethamphetamine, which is the prescription drug and the psychoactive one. Its mirror image, levmetamfetamine, is a nasal decongestant sold over the counter in the United States (PubChem CID 36604)',
      targetReceptorAffinity:
        'A substrate at DAT and NET and at the vesicular monoamine transporter VMAT2, producing carrier-mediated release rather than reuptake blockade. Also a weak monoamine oxidase inhibitor. The (S)-(+) enantiomer is far more potent centrally than the (R)-(-) enantiomer, which is why the same formula and mass can be a Schedule II stimulant or an over-the-counter decongestant depending on chirality.',
      structureSource: {
        label:
          'PubChem CID 10836 (methamphetamine, the (S)-(+) enantiomer) — SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/10836',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'met-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identification of methamphetamine against amphetamine and the phentermine class',
          description:
            'GC-MS identification against a certified standard. The confounders are structural neighbours that share fragments: amphetamine, phentermine, MDMA and the pseudoephedrine that immunoassays cross-react with. An immunoassay screen alone is not an identification for this class and never has been.',
          reagentsAndBuffer:
            'Methamphetamine hydrochloride certified reference standard, methamphetamine-d5 internal standard, amphetamine, phentermine and pseudoephedrine standards, GC-MS with EI, characteristic ions m/z 58, 91 and 134',
        },
        {
          id: 'met-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Chiral resolution of the d- and l-enantiomers',
          description:
            'This is not an academic refinement. The (S)-(+) enantiomer is the Schedule II stimulant; the (R)-(-) enantiomer is levmetamfetamine, an over-the-counter nasal decongestant. Both appear in a urine screen as methamphetamine, and the only thing that distinguishes them is a chiral separation — which is why forensic laboratories run one before reporting a positive with legal consequences.',
          dependsOnStepId: 'met-w1',
          reagentsAndBuffer:
            'Derivatisation with (S)-(-)-N-trifluoroacetylprolyl chloride, or a chiral stationary-phase column, with d- and l-methamphetamine reference standards and GC-MS detection',
        },
        {
          id: 'met-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'Methamphetamine and amphetamine in blood or urine',
          description:
            'Amphetamine is a metabolite of methamphetamine, so a positive for both is the expected pattern; amphetamine alone points to a different source drug. Quantify both, with the parent-to-metabolite ratio reported, because that ratio carries the interpretive information.',
          dependsOnStepId: 'met-w2',
          reagentsAndBuffer:
            'Methamphetamine-d5 and amphetamine-d5 internal standards, alkaline liquid-liquid or mixed-mode solid-phase extraction, UHPLC-MS/MS or GC-MS after derivatisation',
        },
        {
          id: 'met-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'DAT- and VMAT2-expressing preparations',
          description:
            'Human SLC6A3 expressed in HEK293 cells for plasma-membrane transporter work, and isolated synaptic vesicle preparations or VMAT2-expressing cells for the vesicular component. Methamphetamine acts at both, and an assay that measures only the plasma-membrane transporter misses half the mechanism.',
          dependsOnStepId: 'met-w2',
          reagentsAndBuffer:
            'HEK293 cells with human SLC6A3, rat or human synaptic vesicle preparations or VMAT2-transfected cells, sucrose-HEPES vesicle buffer with ATP and Mg2+',
        },
        {
          id: 'met-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Superfusion release and vesicular depletion measured together',
          description:
            'Preload with tritiated dopamine, superfuse, apply methamphetamine and measure efflux — the experiment that shows it is a releaser and not a blocker. In parallel, measure loss of vesicular [3H]-dopamine uptake to capture the VMAT2 component. Together these give the full mechanism, and the cytoplasmic dopamine accumulation they demonstrate is the proposed origin of the terminal toxicity.',
          dependsOnStepId: 'met-w4',
          reagentsAndBuffer:
            '[3H]-dopamine, superfusion chambers, Krebs-HEPES buffer with ascorbate and pargyline, reserpine and tetrabenazine as VMAT2 reference inhibitors, liquid scintillation counting',
        },
      ],
    },
    keyAudits: [
      {
        id: 'met-a1',
        category: 'conclusion_shift',
        title: 'Approved for children in 1943, and the label warns that misuse may cause sudden death',
        laymanSummary:
          'The same drug is a prescription treatment for childhood ADHD and carries a warning in capital letters that misusing it can kill you suddenly.',
        technicalDetails:
          'Desoxyn was originally approved on 31 December 1943 under NDA 005378 and the product remains marketed, with generic methamphetamine hydrochloride tablets from several manufacturers. The current label indicates it for attention deficit disorder with hyperactivity in children over 6 as part of a total treatment programme, and as a short-term adjunct in exogenous obesity. The label opens with a boxed statement that methamphetamine has a high potential for abuse, that it should be prescribed or dispensed sparingly, and that misuse may cause sudden death and serious cardiovascular adverse events; it records that the drug has been extensively abused and that tolerance, extreme psychological dependence and severe social disability have occurred. Both statements are true of the same molecule and neither is rhetorical. The variable is the exposure pattern, not the substance.',
        evidenceSource:
          'Methamphetamine hydrochloride tablets prescribing information (Mayne Pharma, DailyMed) and Drugs@FDA NDA 005378, original approval 31 December 1943',
        measuredMetric:
          'Labelled indication and labelled abuse warning for the same approved product',
        auditFlag: 'verified',
      },
      {
        id: 'met-a2',
        category: 'measured',
        title: 'Dopamine transporter loss in heavy users partially recovers after long abstinence',
        laymanSummary:
          'Brain imaging showed methamphetamine users had substantially fewer dopamine transporters than controls. After more than a year abstinent, the deficit had partly reversed.',
        technicalDetails:
          'Volkow and colleagues imaged dopamine transporter availability with PET in methamphetamine abusers and controls. In the first study, DAT reduction was associated with psychomotor impairment and with memory deficits, establishing that the imaging finding tracked function rather than being an isolated marker. In the follow-up, abusers re-scanned after protracted abstinence of more than a year showed significant recovery of DAT binding, while performance on motor and memory tasks did not fully normalise. The two results together are the substance of the neurotoxicity claim and its limit: the transporter loss is real and measurable, part of it reverses with time, and the functional recovery is incomplete over the periods studied. The imaging measures transporter protein availability, not neuron death, and the distinction is not resolvable by PET.',
        evidenceSource:
          'Volkow ND et al., Am J Psychiatry 2001;158:377-382; and Volkow ND et al., J Neurosci 2001;21:9414-9418',
        doi: '10.1523/JNEUROSCI.21-23-09414.2001',
        measuredMetric:
          'Striatal dopamine transporter availability by PET in abusers versus controls, and after >1 year of abstinence',
        auditFlag: 'verified',
      },
      {
        id: 'met-a3',
        category: 'measured',
        title: 'ADAPT-2: naltrexone plus bupropion worked, and it worked in 13.6% of people',
        laymanSummary:
          'The best result any medicine has produced for methamphetamine use disorder: about 14 people in 100 responded, against 2.5 in 100 on placebo.',
        technicalDetails:
          'Multisite, double-blind, two-stage, placebo-controlled trial with a sequential parallel comparison design in adults with moderate or severe methamphetamine use disorder, testing extended-release injectable naltrexone plus oral extended-release bupropion. 403 participants entered stage 1 and 225 stage 2. Response was defined as at least three methamphetamine-negative urine samples out of four at the end of a stage. Stage 1: 18 of 109 (16.5%) on naltrexone-bupropion versus 10 of 294 (3.4%) on placebo. Stage 2: 13 of 114 (11.4%) versus 2 of 111 (1.8%). Weighted average across both stages was 13.6% versus 2.5%, treatment effect 11.1 percentage points, Wald z=4.53, P<0.001. Adverse events included gastrointestinal disorders, tremor, malaise, hyperhidrosis and anorexia; serious adverse events in 8 of 223 (3.6%) receiving the combination. The authors\' own summary is the honest one: the response was low, and it was higher than placebo.',
        evidenceSource:
          'Trivedi MH et al. Bupropion and Naltrexone in Methamphetamine Use Disorder. N Engl J Med 2021;384:140-153 (ADAPT-2, NCT03078075)',
        doi: '10.1056/NEJMoa2020214',
        measuredMetric:
          'Weighted response rate — at least 3 of 4 methamphetamine-negative urines at end of stage',
        auditFlag: 'verified',
      },
      {
        id: 'met-a4',
        category: 'measured',
        title: 'The mirror image of the same molecule is sold over the counter',
        laymanSummary:
          'Levmetamfetamine, the left-handed version of methamphetamine, is the active ingredient in some over-the-counter nasal inhalers.',
        technicalDetails:
          'Methamphetamine has one stereocentre and therefore two enantiomers with identical molecular formula (C10H15N) and mass (149.23). The (S)-(+) enantiomer, dextromethamphetamine, is the Schedule II prescription drug and the psychoactive one. The (R)-(-) enantiomer, levmetamfetamine (PubChem CID 36604), is a peripherally acting sympathomimetic used as a topical nasal decongestant in over-the-counter inhalers in the United States. Both give a positive result on a standard amphetamine-class urine immunoassay; only a chiral separation distinguishes them. This is a routine analytical fact with non-routine consequences, and it is the reason forensic laboratories perform chiral confirmation before reporting a methamphetamine positive in a context with legal consequences.',
        evidenceSource:
          'PubChem CID 10836 (dextromethamphetamine) and CID 36604 (levmetamfetamine); standard forensic chiral confirmation practice',
        measuredMetric:
          'Enantiomeric identity as the determinant of pharmacology and legal status for one formula',
        auditFlag: 'verified',
      },
      {
        id: 'met-a5',
        category: 'failed',
        title: 'Nothing else has worked, and the winner works in one patient in seven',
        laymanSummary:
          'Methamphetamine use disorder has no approved medication. The best-performing combination in a rigorous trial helped about one in seven people.',
        technicalDetails:
          'Despite a large trial programme spanning bupropion alone, mirtazapine, modafinil, methylphenidate substitution, naltrexone alone and topiramate, no pharmacotherapy is approved for methamphetamine use disorder. ADAPT-2\'s naltrexone-bupropion combination produced the largest and most rigorously demonstrated effect to date, and it was a weighted response rate of 13.6% against 2.5%. The reason is structural rather than a failure of effort: substitution therapy works for opioids because a slower-onset agonist occupies the same receptor, and there is no equivalent for a releaser whose reinforcing effect depends on the magnitude and rate of dopamine efflux. Contingency management remains the intervention with the most consistent randomised evidence, and it is a behavioural programme rather than a drug.',
        evidenceSource:
          'Trivedi MH et al., N Engl J Med 2021;384:140-153; absence of any approved product for methamphetamine use disorder in Drugs@FDA',
        doi: '10.1056/NEJMoa2020214',
        measuredMetric:
          'Number of approved pharmacotherapies for methamphetamine use disorder as of this audit: zero',
        auditFlag: 'verified',
      },
      {
        id: 'met-a6',
        category: 'inferred',
        title: 'The prescription dose and the street exposure are not comparable, and the label is written for one of them',
        laymanSummary:
          'Everything documented about Desoxyn comes from small oral doses once a day. Everything documented about methamphetamine neurotoxicity comes from repeated large smoked or injected doses.',
        technicalDetails:
          'The safety data supporting the Desoxyn label were generated with oral tablets at therapeutic doses in a monitored population. The imaging studies showing dopamine transporter reduction studied heavy users with a route and frequency that produce far higher peak brain concentrations. Neither dataset speaks to the other. The specific mechanism proposed for the terminal toxicity — dopamine displaced from vesicles into the cytoplasm, where it auto-oxidises to quinones and reactive oxygen species — is concentration- and duration-dependent, so it is not a property that transfers unchanged across a hundred-fold difference in exposure. What cannot be said is that the prescription product is therefore safe at any dose, or that the street exposure describes what the tablet does. Both are inferences the available data do not support.',
        evidenceSource:
          'Methamphetamine hydrochloride tablets prescribing information versus Volkow ND et al., J Neurosci 2001;21:9414-9418',
        inferredClaim:
          'That dopamine terminal toxicity documented in heavy high-dose users describes the risk of therapeutic oral dosing, or that the therapeutic safety record describes the risk of heavy use',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed as a tablet, or smoked, insufflated or injected',
        laymanDesc:
          'The medicine is a tablet taken once a day. Illicit use is usually smoked or injected, which puts a much larger amount into the brain much faster.',
        molecularDetail:
          'Oral absorption is good with a long elimination half-life of roughly 10 hours, so the prescription tablet is once-daily. Smoked or intravenous routes produce peak brain concentrations within minutes at far higher magnitude. About 62% of an oral dose is eliminated in urine within 24 hours, roughly a third as intact drug.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters the brain and then enters the nerve terminal',
        laymanDesc:
          'It crosses into the brain easily, and then is carried inside the dopamine-releasing nerve endings by the very pump it is going to sabotage.',
        molecularDetail:
          'High lipophilicity gives rapid blood-brain barrier penetration; methamphetamine is then translocated into presynaptic terminals as a substrate of DAT and NET, and diffuses across membranes as a weak base.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Empties the storage vesicles and reverses the pump',
        laymanDesc:
          'Inside the terminal it dumps dopamine out of its storage packets into the cell fluid, then makes the pump run backwards so it pours into the synapse.',
        molecularDetail:
          'Disrupts the vesicular pH gradient and acts at VMAT2, releasing vesicular dopamine into the cytosol; then reverses DAT to produce carrier-mediated efflux. The result is a far larger and longer-lasting synaptic dopamine elevation than a reuptake blocker such as cocaine produces.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Cytoplasmic dopamine oxidises, and the terminal is damaged',
        laymanDesc:
          'Dopamine sitting outside its storage packets breaks down into reactive chemicals. That, rather than the stimulation itself, is the leading explanation for the damage seen in heavy users.',
        molecularDetail:
          'Cytosolic dopamine auto-oxidises to quinones and reactive oxygen species, with hyperthermia and glutamate excitotoxicity as contributing factors in animal models. PET imaging in heavy human users shows reduced striatal DAT availability that partially recovers with abstinence over more than a year, while task performance recovers incompletely.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'ADHD symptoms stabilise, or dependence and cardiovascular injury develop',
        laymanDesc:
          'At therapeutic doses the label\'s endpoint is a stabilising effect on attention and impulsivity. At heavy exposure the outcomes are dependence, psychosis and heart damage.',
        molecularDetail:
          'Labelled endpoint is stabilisation of distractibility, attention span, hyperactivity, emotional lability and impulsivity in children over 6. At heavy exposure: stimulant psychosis, methamphetamine-associated cardiomyopathy, and the transporter changes measured by PET. The label states that misuse may cause sudden death and serious cardiovascular adverse events.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ADAPT-2 (NCT03078075)',
        phase: 'Phase 3 double-blind, two-stage sequential parallel comparison',
        sampleSize: 403,
        primaryEndpoint:
          'Response — at least 3 of 4 methamphetamine-negative urine samples at the end of stage 1 or stage 2',
        endpointMet: true,
        statisticalPValue:
          'Weighted response 13.6% vs 2.5%, treatment effect 11.1 percentage points, Wald z = 4.53, P<0.001',
        unreportedAdverseSignals:
          'Serious adverse events in 8 of 223 (3.6%) receiving naltrexone-bupropion. The absolute response rate of 13.6% is low, and the trial has not produced an approved product.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Volkow PET series, dopamine transporter availability in methamphetamine abusers',
        phase: 'Imaging case-control with longitudinal abstinence follow-up',
        sampleSize: 15,
        primaryEndpoint:
          'Striatal dopamine transporter availability, and its association with psychomotor and memory performance',
        endpointMet: true,
        statisticalPValue:
          'Significant DAT reduction versus controls, associated with psychomotor impairment; significant DAT recovery after more than 1 year of abstinence with incomplete functional recovery',
        unreportedAdverseSignals:
          'Small sample. PET measures transporter protein availability, which is not the same as neuron loss, and the two cannot be distinguished by this method.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'FDA approval since 31 December 1943 for ADHD in children over 6 and short-term adjunctive treatment of exogenous obesity',
        'A weighted response rate of 13.6% versus 2.5% on placebo for naltrexone-bupropion in 403 adults with methamphetamine use disorder',
        'Reduced striatal dopamine transporter availability in heavy users, associated with psychomotor impairment, partially recovering after more than a year of abstinence',
        'Carrier-mediated dopamine efflux through DAT and vesicular depletion via VMAT2 — a releaser, not a reuptake blocker',
      ],
      unsupportedInferences: [
        'That neurotoxicity documented in heavy smoked or injected use describes the risk of therapeutic oral dosing, or vice versa',
        'That reduced PET transporter binding demonstrates neuron death — it demonstrates reduced transporter availability, and the two are not separable by this method',
        'That a positive amphetamine-class urine screen identifies dextromethamphetamine, when the over-the-counter decongestant enantiomer gives the same result',
      ],
      whatFailedInitially: [
        'Every candidate pharmacotherapy for methamphetamine use disorder, with the largest rigorous effect being a 13.6% response rate that has not produced an approval',
        'Functional recovery after abstinence was incomplete even where dopamine transporter binding recovered',
      ],
      realWorldOutcome: [
        'Desoxyn and its generics remain marketed prescription products in Schedule II, prescribed rarely because alternatives exist',
        'The illicit supply in North America is high-purity and inexpensive, and no medication is approved for dependence on it',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, once daily, in the approved product',
      description:
        'The prescription product is a plain oral tablet with a long half-life, giving once-daily dosing and a slow rise in brain concentration. That pharmacokinetic profile is the difference between the medicine and the street drug: the reinforcing effect of a releaser depends on how fast dopamine efflux rises, and an oral tablet raises it slowly.',
      safetyProfile:
        'The label states in capitals that methamphetamine has a high potential for abuse, should be prescribed or dispensed sparingly, and that misuse may cause sudden death and serious cardiovascular adverse events. It records extensive abuse, tolerance, extreme psychological dependence and severe social disability; abrupt cessation after prolonged high dosage produces extreme fatigue and mental depression with sleep EEG changes; chronic intoxication produces severe dermatoses, marked insomnia, irritability and a psychosis clinically indistinguishable from schizophrenia. Growth suppression has been reported with long-term stimulant use in children. Cardiovascular effects include tachycardia, hypertension and, with chronic heavy use, cardiomyopathy.',
    },
    commonQuestions: [
      {
        q: 'Methamphetamine is prescribed to children?',
        a: 'It is approved for that, and it is rarely used. Desoxyn was approved on 31 December 1943 and the current label indicates methamphetamine hydrochloride tablets for attention deficit disorder with hyperactivity in children over six, as part of a treatment programme that also includes psychological, educational and social measures. In practice it sits behind methylphenidate, amphetamine salts and non-stimulants, because those work and carry less prescribing burden. The label also retains a short-term obesity indication that is essentially historical.',
      },
      {
        q: 'What is the difference between the tablet and the street drug?',
        a: 'The molecule is identical. The differences are dose, route, frequency and purity. An oral tablet with a ten-hour half-life raises brain dopamine slowly; smoked or injected methamphetamine raises it within minutes to a far higher peak, and the reinforcing effect of a releaser depends on that rate. The proposed mechanism of terminal damage — dopamine displaced into the cytoplasm where it oxidises — is concentration- and duration-dependent, so it does not transfer across a hundred-fold difference in exposure. That does not make the tablet risk-free; its own label warns that misuse may cause sudden death.',
      },
      {
        q: 'Does methamphetamine permanently damage the brain?',
        a: 'The measurement is more specific than the question. PET imaging in heavy users found substantially reduced striatal dopamine transporter availability, and that reduction tracked psychomotor and memory impairment. Re-scanned after more than a year of abstinence, transporter binding had significantly recovered — while task performance had not fully normalised. So: a real, measurable loss, partial reversal with prolonged abstinence, incomplete functional recovery over the periods studied. PET measures how much transporter protein is available, which is not the same as counting neurons, and no imaging method available then or now can separate those two.',
        auditNote:
          'Both halves of this result are usually reported separately. The recovery finding is as robust as the loss finding and comes from the same group.',
      },
      {
        q: 'Is there a medicine for methamphetamine addiction?',
        a: 'Nothing is approved. The best result from a rigorous randomised trial is ADAPT-2, in which extended-release injectable naltrexone plus extended-release bupropion produced a weighted response rate of 13.6% against 2.5% on placebo across 403 and then 225 participants. That is a real, statistically robust effect and it helped about one person in seven. There is no substitution therapy analogous to methadone, because a releaser\'s reinforcing effect depends on the size and speed of dopamine efflux and no slow-onset partial version of that exists. Contingency management has the most consistent randomised evidence of anything in this area.',
      },
      {
        q: 'Why does this page show no price?',
        a: 'Generic methamphetamine hydrochloride tablets are dispensed at prices set by pharmacy contracts that vary widely, and no per-dose cost of production could be verified. The illicit market has no published price. Both halves of `SeedPricing` are missing, so the block is absent.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Trivedi MH et al. Bupropion and Naltrexone in Methamphetamine Use Disorder. N Engl J Med 2021;384:140-153',
        identifier: '10.1056/NEJMoa2020214',
        kind: 'doi',
      },
      {
        label:
          'Volkow ND et al. Loss of dopamine transporters in methamphetamine abusers recovers with protracted abstinence. J Neurosci 2001;21:9414-9418',
        identifier: '10.1523/JNEUROSCI.21-23-09414.2001',
        kind: 'doi',
      },
      {
        label:
          'Volkow ND et al. Association of dopamine transporter reduction with psychomotor impairment in methamphetamine abusers. Am J Psychiatry 2001;158:377-382',
        identifier: '10.1176/appi.ajp.158.3.377',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: DESOXYN (methamphetamine hydrochloride) tablets, NDA 005378, original approval 31 December 1943',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=005378',
        kind: 'regulatory',
      },
      {
        label:
          'Methamphetamine hydrochloride tablets prescribing information (DailyMed SPL f31f580f-1f08-4a0f-b078-0b9e3308f712) — indications, abuse warning and DEA schedule II statement',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f31f580f-1f08-4a0f-b078-0b9e3308f712',
        kind: 'regulatory',
      },
      {
        label: 'ClinicalTrials.gov NCT03078075 — ADAPT-2',
        identifier: 'NCT03078075',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 10836 — dextromethamphetamine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/10836',
        kind: 'url',
      },
      {
        label:
          'PubChem CID 36604 — levmetamfetamine, the (R)-(-) enantiomer sold as an over-the-counter nasal decongestant',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/36604',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 11. DMT (N,N-dimethyltryptamine)
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'dmt',
    name: 'DMT (N,N-Dimethyltryptamine)',
    tradeName:
      'No marketed product. The principal psychoactive constituent of ayahuasca; SPL026 and similar synthetic DMT fumarate formulations are in clinical trials',
    sponsor:
      'No approved sponsor. Clinical work by Small Pharma / Cybin, Imperial College London, and the Universidade Federal do Rio Grande do Norte (ayahuasca)',
    targetGene: 'HTR2A',
    targetProtein:
      'Serotonin 5-HT2A receptor, with activity at 5-HT1A and 5-HT2C and reported binding at the sigma-1 receptor',
    modality: 'Small Molecule',
    approvalStatus: 'Controlled / No Approved Use',
    indication:
      'No approved medical indication. Schedule I in the United States. Ayahuasca has been tested in a randomised placebo-controlled trial in treatment-resistant depression; synthetic DMT is in early-phase trials for depression',
    patientFriendlyIndication:
      'Nothing approved. A single randomised trial of ayahuasca in 29 people with depression that had not responded to other treatments',
    anatomicalSite: 'Cortical 5-HT2A receptors, principally in layer V pyramidal neurons',
    conditionContext: {
      conditionExplainer:
        'DMT is destroyed by monoamine oxidase in the gut and liver, so swallowing it does nothing. Ayahuasca solves that by combining a DMT-containing plant with a second plant whose harmala alkaloids inhibit that enzyme. Injected or inhaled, DMT bypasses the problem and produces an experience that peaks in about two minutes and is over in half an hour.',
      whyItMatters:
        'That extreme brevity is the reason for the clinical interest: a psychedelic session that lasts twenty minutes rather than eight hours has a completely different cost structure for a health service. Whether a twenty-minute experience produces the same durable change as a six-hour one is unanswered.',
      whoTakesThis:
        'In trials: adults with treatment-resistant depression, given ayahuasca or intravenous synthetic DMT in a monitored session. In practice: participants in ayahuasca ceremonies, and members of two syncretic churches with a US legal exemption.',
      clinicalGoals:
        'Reduction in depression rating scale score in the days following a single administration.',
    },
    oneSentenceVerdict:
      'A tryptamine that is inactive by mouth unless paired with an enzyme inhibitor, produces its entire effect in under half an hour, and has one 29-patient randomised trial in treatment-resistant depression with a day-seven effect size of 1.49.',
    laymanHowItWorks:
      'DMT is structurally almost identical to serotonin, with two extra methyl groups. Those groups are what stop the body\'s ordinary handling of it and let it reach the same receptor psilocybin and LSD use. Swallowed on its own it is destroyed within minutes by an enzyme in the gut wall, which is why the Amazonian brew pairs it with a vine whose alkaloids switch that enzyme off. Injected or smoked it reaches the brain in seconds, peaks in about two minutes, and is essentially gone in thirty.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 48,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(C)CCC1=CNC2=CC=CC=C21',
      chemicalFormula: 'C12H16N2',
      molecularWeight:
        '188.27 g/mol (free base). Trial material is DMT fumarate. Ayahuasca additionally contains the beta-carboline alkaloids harmine, harmaline and tetrahydroharmine from Banisteriopsis caapi, which are reversible monoamine oxidase A inhibitors and are what make the oral route work',
      targetReceptorAffinity:
        'Agonist at 5-HT2A, 5-HT1A and 5-HT2C. Reported binding at the sigma-1 receptor and as a substrate for the serotonin transporter and vesicular monoamine transporter 2. As with LSD and psilocin, the subjective effect is attributed to 5-HT2A; DMT is a substrate for monoamine oxidase A, which is why oral bioavailability is essentially zero without an inhibitor.',
      structureSource: {
        label:
          'PubChem CID 6089 (N,N-dimethyltryptamine) — SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6089',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dmt-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identification in plant material, brew or synthetic powder',
          description:
            'Identification against a certified DMT standard. In an ayahuasca preparation the DMT assay alone is not the analysis: the beta-carbolines determine whether the DMT is orally active at all, so harmine, harmaline and tetrahydroharmine are quantified in the same run. Brews vary several-fold in both components between preparations.',
          reagentsAndBuffer:
            'DMT, harmine, harmaline and tetrahydroharmine certified reference standards, DMT-d6 internal standard, acidified methanol extraction, C18 column with formic acid/acetonitrile gradient, diode-array and MS detection',
        },
        {
          id: 'dmt-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Distinguishing DMT from its close analogues',
          description:
            'N,N-DMT, 5-MeO-DMT, 4-AcO-DMT and the N-methyl and diethyl homologues are all substituted tryptamines that share the m/z 58 iminium fragment. Retention time against authenticated standards, not the mass spectrum, does the discrimination — and 5-MeO-DMT in particular is active at roughly a tenth the dose, so the distinction is consequential.',
          dependsOnStepId: 'dmt-w1',
          reagentsAndBuffer:
            'DMT, 5-MeO-DMT, DET, NMT and 4-AcO-DMT reference standards, GC-MS with retention-index confirmation and LC-MS/MS with distinct MRM transitions per analyte',
        },
        {
          id: 'dmt-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'Plasma DMT with a sampling schedule matched to a two-minute peak',
          description:
            'The pharmacokinetics are the unusual part. Peak plasma concentration and peak subjective effect occur within two minutes of intravenous administration and are negligible by thirty. A conventional sampling schedule with a first draw at fifteen minutes misses the entire curve, so the assay design matters more than the assay chemistry.',
          dependsOnStepId: 'dmt-w2',
          reagentsAndBuffer:
            'DMT-d6 internal standard, sampling at 1, 2, 5, 10, 15, 20 and 30 minutes, immediate cooling and acidification, solid-phase extraction, UHPLC-MS/MS',
        },
        {
          id: 'dmt-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Heterologous 5-HT2A and MAO-A preparations',
          description:
            'Human HTR2A expressed in a cell line for receptor work, and recombinant human monoamine oxidase A for the metabolic work. Both halves are needed, because DMT\'s defining pharmacological property is the interaction between its receptor agonism and its rate of enzymatic destruction.',
          dependsOnStepId: 'dmt-w2',
          reagentsAndBuffer:
            'HEK293 or CHO cells with human HTR2A, recombinant human MAO-A and MAO-B preparations, clorgyline and selegiline as isoform-selective reference inhibitors',
        },
        {
          id: 'dmt-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Receptor binding and MAO-A inhibition by the beta-carbolines, measured together',
          description:
            'Competition binding gives DMT\'s 5-HT2A affinity; an MAO-A activity assay with harmine, harmaline and tetrahydroharmine gives the inhibition constants that explain why the brew works orally and pure DMT does not. Running both is what converts an ethnobotanical description into a pharmacological one.',
          dependsOnStepId: 'dmt-w4',
          reagentsAndBuffer:
            '[3H]-ketanserin for 5-HT2A, Tris-HCl buffer with ascorbate; kynuramine or Amplex Red MAO-A activity assay with harmine, harmaline and tetrahydroharmine across a concentration series',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dmt-a1',
        category: 'measured',
        title: 'Ayahuasca beat placebo in 29 patients with treatment-resistant depression',
        laymanSummary:
          'A single dose lowered depression scores more than placebo at one, two and seven days, with the gap widening over the week. Response at day seven was 64% against 27%.',
        technicalDetails:
          'Parallel-arm, double-blind, randomised placebo-controlled trial in 29 patients with treatment-resistant depression; a single dose of ayahuasca or placebo, with MADRS and HAM-D measured at baseline and at 1, 2 and 7 days. MADRS was significantly lower in the ayahuasca group at day 1 and day 2 (p=0.04) and at day 7 (p<0.0001). Between-group effect sizes rose across the week: Cohen\'s d 0.84 at day 1, 0.84 at day 2 and 1.49 at day 7. Response rates were high in both arms early and significantly higher with ayahuasca at day 7, 64% versus 27% (p=0.04); remission was 36% versus 7% (p=0.054, a trend). The placebo was a brew designed to mimic taste and appearance. This is the first controlled trial of a psychedelic in treatment-resistant depression and it has 29 patients in it.',
        evidenceSource:
          'Palhano-Fontes F et al. Rapid antidepressant effects of the psychedelic ayahuasca in treatment-resistant depression: a randomized placebo-controlled trial. Psychol Med 2019;49:655-663 (NCT02914769)',
        doi: '10.1017/S0033291718001356',
        measuredMetric: 'MADRS score at days 1, 2 and 7 after a single dose',
        auditFlag: 'verified',
      },
      {
        id: 'dmt-a2',
        category: 'measured',
        title: 'Strassman: full dose-response in humans, peaking at two minutes',
        laymanSummary:
          'Intravenous DMT was given at four doses to experienced volunteers. Blood levels and effects peaked within two minutes and were negligible at thirty. Hallucinogenic effects appeared only at the two highest doses.',
        technicalDetails:
          'Double-blind, saline placebo-controlled, randomised dose-response study of intravenous dimethyltryptamine fumarate at 0.05, 0.1, 0.2 and 0.4 mg/kg in 11 experienced hallucinogen users, treatments at least a week apart. Peak blood levels and subjective effects occurred within 2 minutes and were negligible at 30 minutes. DMT dose-dependently raised blood pressure, heart rate, pupil diameter and rectal temperature, and raised blood beta-endorphin, corticotropin, cortisol and prolactin. Growth hormone rose equally at all doses. The companion paper reported that hallucinogenic effects appeared at 0.2 and 0.4 mg/kg, that 0.1 mg/kg produced the least desirable effects, and that psychological effects peaked at 90 to 120 seconds and were almost completely resolved by 30 minutes. These were the first US studies of a Schedule I hallucinogen in humans in two decades.',
        evidenceSource:
          'Strassman RJ, Qualls CR. Arch Gen Psychiatry 1994;51:85-97 (part I); Strassman RJ et al., Arch Gen Psychiatry 1994;51:98-108 (part II)',
        doi: '10.1001/archpsyc.1994.03950020009001',
        measuredMetric:
          'Neuroendocrine, cardiovascular, autonomic and subjective dose-response to intravenous DMT',
        auditFlag: 'verified',
      },
      {
        id: 'dmt-a3',
        category: 'failed',
        title: 'The pineal gland claim: DMT did not move melatonin, and the pineal was never shown to make it',
        laymanSummary:
          'The popular story that the pineal gland releases DMT has no supporting human data. In the one controlled study that measured it, DMT left melatonin — the pineal\'s actual product — completely unchanged.',
        technicalDetails:
          'DMT is an endogenous compound: it has been detected in mammalian tissue and body fluids, and the enzyme INMT that could synthesise it is expressed in several tissues. The specific claim that the pineal gland synthesises and releases DMT, particularly at birth or death, is not supported by any human measurement. Strassman\'s own dose-response study, which is the source most often invoked for the pineal hypothesis, reported that melatonin levels were unaffected by DMT at any dose — melatonin being the pineal\'s characteristic secretory product and the obvious index of pineal involvement. Detecting a compound in tissue establishes its presence, not its physiological function, its concentration at a receptor, or its release from a particular organ. The endogenous-DMT literature and the pineal story are two different claims, and only the first has evidence.',
        evidenceSource:
          'Strassman RJ, Qualls CR, Arch Gen Psychiatry 1994;51:85-97 — melatonin unaffected across all DMT doses',
        doi: '10.1001/archpsyc.1994.03950020009001',
        inferredClaim:
          'That the pineal gland synthesises and releases DMT — a claim with no human measurement behind it, and one contradicted by the melatonin data in the study usually cited for it',
        auditFlag: 'contested',
      },
      {
        id: 'dmt-a4',
        category: 'inferred',
        title: 'The ayahuasca trial tested a brew, and the brew is not standardised',
        laymanSummary:
          'The trial used one preparation from one source. Ayahuasca varies several-fold in both its active components between batches, and the DMT is only active because of the second plant.',
        technicalDetails:
          'Ayahuasca is a decoction whose DMT content comes from one plant and whose oral activity depends on beta-carboline monoamine oxidase inhibitors from another. Published analyses of ceremonial preparations show several-fold variation in both DMT and beta-carboline content between brews. The randomised trial administered a single characterised batch, which is correct trial practice and also means the result belongs to that preparation. Extending it requires either standardising the brew or moving to synthetic DMT with a defined dose — which is what the current early-phase programmes do, and which makes them a different intervention rather than a confirmation. Separately, the MAO-A inhibition that makes the brew work is a real pharmacological interaction, and it applies to serotonergic drugs and to tyramine-containing foods in the same way any MAO inhibitor does.',
        evidenceSource:
          'Palhano-Fontes F et al., Psychol Med 2019;49:655-663, single-batch preparation; composition variability documented in the ayahuasca analytical literature',
        doi: '10.1017/S0033291718001356',
        inferredClaim:
          'That a result obtained with one characterised batch of a plant decoction generalises to ayahuasca as a category, or to synthetic DMT',
        auditFlag: 'caution',
      },
      {
        id: 'dmt-a5',
        category: 'conclusion_shift',
        title: 'The Supreme Court allowed a Schedule I sacrament, unanimously',
        laymanSummary:
          'In 2006 the US Supreme Court held that a small church could import and drink an ayahuasca tea containing DMT, because the government had not shown a compelling reason to stop it.',
        technicalDetails:
          'In Gonzales v. O Centro Espírita Beneficente União do Vegetal, 546 U.S. 418 (2006), decided 21 February 2006, the Court affirmed a preliminary injunction permitting a religious sect to import and consume hoasca, a sacramental tea brewed from Amazonian plants containing DMT, a Schedule I substance. Chief Justice Roberts wrote for the Court. The decision turned on the Religious Freedom Restoration Act, which requires the government to demonstrate a compelling interest served by the least restrictive means when it substantially burdens religious exercise; the government had not made that showing on the record before the Court, notwithstanding the Controlled Substances Act\'s categorical Schedule I treatment. The case is an unusual and instructive shift: Schedule I status was not overturned, and an exemption from it was upheld anyway, on grounds that had nothing to do with the pharmacology.',
        evidenceSource:
          'Gonzales v. O Centro Espírita Beneficente União do Vegetal, 546 U.S. 418 (2006), No. 04-1084, opinion of the Court by Chief Justice Roberts',
        measuredMetric:
          'Judicial outcome on a Religious Freedom Restoration Act challenge to Schedule I enforcement',
        auditFlag: 'verified',
      },
      {
        id: 'dmt-a6',
        category: 'measured',
        title: 'A twenty-minute psychedelic, and the clinical question that follows from it',
        laymanSummary:
          'Injected DMT peaks in two minutes and is over in thirty. That is a fraction of a psilocybin session, and it is the main reason companies are developing it.',
        technicalDetails:
          'Strassman\'s dose-response work established the human time course directly: peak plasma concentration and peak subjective effect within 2 minutes of intravenous administration, negligible by 30 minutes, with psychological effects almost completely resolved at that point. A psilocybin session runs six to eight hours and a supported LSD session eight to twelve. The clinical implication is a cost implication: monitored time is the dominant cost of psychedelic-assisted therapy, and a twenty-minute drug effect changes it by an order of magnitude. The unresolved question is whether the durable outcome depends on duration. No trial has compared a short-acting and a long-acting psychedelic head to head at matched intensity, so this is currently an economic argument with a pharmacological premise and no clinical evidence either way.',
        evidenceSource: 'Strassman RJ et al., Arch Gen Psychiatry 1994;51:98-108, subjective effects time course',
        doi: '10.1001/archpsyc.1994.03950020022002',
        measuredMetric: 'Time to peak and time to resolution of subjective effects after intravenous DMT',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Inactive by mouth unless an enzyme is blocked first',
        laymanDesc:
          'Swallowed alone, DMT is destroyed before it can reach the brain. The Amazonian brew adds a second plant that switches off the enzyme doing the destroying.',
        molecularDetail:
          'DMT is a substrate for monoamine oxidase A in the gut wall and liver, giving essentially zero oral bioavailability. Ayahuasca supplies harmine, harmaline and tetrahydroharmine, reversible MAO-A inhibitors, which is what makes the oral route pharmacologically possible.',
        iconName: 'Leaf',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Injected or inhaled, it reaches the brain in seconds',
        laymanDesc:
          'Bypassing the gut entirely, the molecule crosses into the brain almost immediately and peaks about two minutes later.',
        molecularDetail:
          'Intravenous dimethyltryptamine fumarate produces peak plasma concentration and peak subjective effect within 2 minutes; effects are negligible at 30 minutes. The time course is set by rapid distribution and rapid MAO-A metabolism rather than by receptor kinetics.',
        iconName: 'Syringe',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Activates 5-HT2A, the same receptor as LSD and psilocin',
        laymanDesc:
          'It is close enough in shape to serotonin to switch on the receptor that all the classic psychedelics use.',
        molecularDetail:
          'Agonist at 5-HT2A with additional 5-HT1A and 5-HT2C activity, plus reported sigma-1 receptor binding. Structurally it is serotonin with two N-methyl groups and no 5-hydroxyl, which removes the polar group that would otherwise limit brain entry.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Cortical activity is reorganised, briefly and completely',
        laymanDesc:
          'For a few minutes the ordinary flow of experience is replaced rather than modified. Volunteers described it as more vivid and compelling than dreaming or waking.',
        molecularDetail:
          'Gq-coupled 5-HT2A signalling in layer V pyramidal neurons, as with the other classic psychedelics. Strassman\'s volunteers described effects that "completely replaced" ongoing mental experience at 0.2 and 0.4 mg/kg, with lower doses producing primarily affective and somaesthetic effects.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Depression scores fall for at least a week after one dose',
        laymanDesc:
          'In the one randomised trial, the gap between drug and placebo was largest at day seven — after the drug had been gone for six and a half days.',
        molecularDetail:
          'Measured endpoint is MADRS at days 1, 2 and 7. Between-group effect size rose from d=0.84 at day 1 to d=1.49 at day 7, in 29 patients. DMT is cleared within an hour of administration, so the day-7 result is not a drug-concentration effect and no mechanism for its persistence has been demonstrated.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT02914769 (ayahuasca in treatment-resistant depression)',
        phase: 'Phase 2 randomised, double-blind, placebo-controlled',
        sampleSize: 29,
        primaryEndpoint: 'MADRS score change at 1, 2 and 7 days after a single dose',
        endpointMet: true,
        statisticalPValue:
          'p=0.04 at days 1 and 2, p<0.0001 at day 7; between-group Cohen\'s d rose from 0.84 to 1.49 across the week',
        unreportedAdverseSignals:
          '29 patients in total. Vomiting is an expected and near-universal effect of the brew, which makes the placebo comparison difficult to maintain even with a taste-matched control.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Strassman intravenous DMT dose-response (parts I and II)',
        phase: 'Phase 1 double-blind, placebo-controlled, randomised dose-response',
        sampleSize: 11,
        primaryEndpoint:
          'Neuroendocrine, cardiovascular, autonomic and subjective response across four intravenous doses',
        endpointMet: true,
        statisticalPValue:
          'Dose-dependent elevation of blood pressure, heart rate, pupil diameter, rectal temperature, beta-endorphin, corticotropin, cortisol and prolactin; hallucinogenic threshold at 0.2 mg/kg',
        unreportedAdverseSignals:
          'Melatonin was unaffected at every dose — the measurement that the pineal-gland hypothesis has to account for and does not.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A day-7 between-group effect size of 1.49 on MADRS after a single dose of ayahuasca in 29 patients with treatment-resistant depression',
        'Peak plasma concentration and peak subjective effect within 2 minutes of intravenous DMT, negligible by 30 minutes',
        'Dose-dependent elevation of blood pressure, heart rate, pupil diameter, temperature, beta-endorphin, corticotropin, cortisol and prolactin',
        'No effect of DMT on melatonin at any dose tested',
      ],
      unsupportedInferences: [
        'That the pineal gland synthesises and releases DMT — no human measurement supports it, and melatonin was unmoved in the study most often cited for it',
        'That detecting endogenous DMT in tissue establishes a physiological signalling role for it',
        'That a result from one characterised batch of a plant decoction generalises to ayahuasca as a category or to synthetic DMT',
        'That a twenty-minute drug effect produces the same durable outcome as a six-hour one — no trial has compared them',
      ],
      whatFailedInitially: [
        'Remission at day 7 in the ayahuasca trial, 36% versus 7%, did not reach significance (p=0.054)',
        'The 0.1 mg/kg intravenous dose produced the least desirable subjective effects of any dose tested, which is not a linear dose-response',
      ],
      realWorldOutcome: [
        'DMT remains Schedule I; the Supreme Court upheld a religious exemption for one church\'s sacramental use in 2006',
        'Synthetic DMT is in early-phase clinical development on the basis of its very short duration, not a larger effect',
      ],
    },
    deliverySystem: {
      type: 'Intravenous or inhaled for the pure compound; oral decoction when combined with an MAO inhibitor',
      description:
        'Three routes with three different pharmacologies. Intravenous synthetic DMT gives a controlled, very short exposure and is what the current trials use. Inhalation gives a similarly abrupt onset with an uncontrolled dose. The oral route works only in combination with monoamine oxidase inhibitors, which extends the experience to several hours and introduces the interaction profile of an MAO inhibitor alongside it.',
      safetyProfile:
        'Acute effects are dose-dependent rises in blood pressure, heart rate, body temperature and pupil diameter, with elevations of cortisol, corticotropin, prolactin and beta-endorphin, all measured directly in the intravenous dose-response study. Subjectively, the higher doses produce a state that displaces ordinary experience entirely, with a brief overwhelming onset that volunteers described as loss of control and in which euphoria and anxiety coexisted. Vomiting is a near-universal effect of ayahuasca and is treated within the ceremonial context as expected rather than adverse. The MAO-A inhibition in the oral preparation carries the interaction profile of any MAO inhibitor: serotonergic drugs, including SSRIs, and tyramine-containing foods are the relevant hazards. DMT does not produce physical dependence.',
    },
    commonQuestions: [
      {
        q: 'Why does ayahuasca need two plants?',
        a: 'Because DMT swallowed on its own does nothing. Monoamine oxidase A in the gut wall and liver destroys it before it can reach the circulation. The second plant, Banisteriopsis caapi, supplies harmine, harmaline and tetrahydroharmine — reversible inhibitors of that enzyme. Block the enzyme and the DMT survives absorption. This is a pharmacologically precise solution that was arrived at without any of the pharmacology, and it is one of the more striking things in ethnobotany. It also means an ayahuasca preparation carries the interaction profile of an MAO inhibitor, which matters for anyone taking a serotonergic drug.',
      },
      {
        q: 'Is DMT released by the pineal gland when you die?',
        a: 'There is no evidence for that. DMT is genuinely endogenous — it has been detected in mammalian tissue and the enzyme that could make it is expressed in several places. What has never been shown is that the pineal gland makes it, releases it, or does either at birth or at death. The study most often cited in support measured melatonin, the pineal\'s characteristic product, across four doses of intravenous DMT and found it unaffected at all of them. Finding a molecule in tissue tells you it is present. It does not tell you what organ made it, what concentration reaches a receptor, or whether it does anything.',
        auditNote:
          'The melatonin result is in the same paper the pineal hypothesis is usually attributed to. It is rarely quoted alongside it.',
      },
      {
        q: 'What did the one randomised trial actually find?',
        a: 'In 29 patients with treatment-resistant depression, a single dose of ayahuasca lowered MADRS scores more than a taste-matched placebo at one, two and seven days, and the gap grew over the week — Cohen\'s d of 0.84 at day one and 1.49 at day seven. Response at day seven was 64% against 27%. Remission was 36% against 7%, which did not quite reach significance. It is a real, well-conducted, positive randomised trial and it has 29 patients in it, has not been replicated, and used one batch of a preparation that varies between batches.',
      },
      {
        q: 'Why is anyone developing a drug that lasts twenty minutes?',
        a: 'Because monitored time is what makes psychedelic-assisted therapy expensive. A psilocybin session runs six to eight hours with two trained people present; an LSD session runs longer. Intravenous DMT peaks in two minutes and is essentially over in thirty, which changes the staffing cost by an order of magnitude. The premise being tested is that the durable effect does not depend on the duration of the experience. Nobody has compared a short-acting and a long-acting psychedelic head to head, so that premise is currently an assumption with commercial consequences.',
      },
      {
        q: 'How is a Schedule I drug legal for a church?',
        a: 'Under the Religious Freedom Restoration Act rather than under drug law. In Gonzales v. O Centro Espírita Beneficente União do Vegetal, decided in February 2006, the Supreme Court affirmed an injunction allowing a small religious sect to import and drink a DMT-containing sacramental tea, on the ground that the government had not demonstrated a compelling interest pursued by the least restrictive means. The Schedule I listing was not disturbed. It is an exemption from enforcement, granted on constitutional and statutory grounds that have nothing to do with the drug\'s pharmacology.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Palhano-Fontes F et al. Rapid antidepressant effects of the psychedelic ayahuasca in treatment-resistant depression: a randomized placebo-controlled trial. Psychol Med 2019;49:655-663',
        identifier: '10.1017/S0033291718001356',
        kind: 'doi',
      },
      {
        label:
          'Strassman RJ, Qualls CR. Dose-response study of N,N-dimethyltryptamine in humans. I. Neuroendocrine, autonomic, and cardiovascular effects. Arch Gen Psychiatry 1994;51:85-97',
        identifier: '10.1001/archpsyc.1994.03950020009001',
        kind: 'doi',
      },
      {
        label:
          'Strassman RJ et al. Dose-response study of N,N-dimethyltryptamine in humans. II. Subjective effects and preliminary results of a new rating scale. Arch Gen Psychiatry 1994;51:98-108',
        identifier: '10.1001/archpsyc.1994.03950020022002',
        kind: 'doi',
      },
      {
        label:
          'Gonzales v. O Centro Espírita Beneficente União do Vegetal, 546 U.S. 418 (2006), No. 04-1084 — opinion of the Court',
        identifier: 'https://www.law.cornell.edu/supct/html/04-1084.ZO.html',
        kind: 'regulatory',
      },
      {
        label: 'ClinicalTrials.gov NCT02914769 — ayahuasca in treatment-resistant depression',
        identifier: 'NCT02914769',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 6089 — N,N-dimethyltryptamine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6089',
        kind: 'url',
      },
      {
        label:
          'PubChem CID 5280953 — harmine, one of the beta-carboline MAO-A inhibitors that make ayahuasca orally active',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5280953',
        kind: 'url',
      },
      CSA_SCHEDULES_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 12. Mescaline
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'mescaline',
    name: 'Mescaline',
    tradeName:
      'No marketed product. The principal alkaloid of peyote (Lophophora williamsii) and San Pedro (Trichocereus / Echinopsis species)',
    sponsor: 'None. No sponsor holds an IND or an approval for mescaline',
    targetGene: 'HTR2A',
    targetProtein: 'Serotonin 5-HT2A receptor, with activity at 5-HT2C and 5-HT1A',
    modality: 'Small Molecule',
    approvalStatus: 'Controlled / No Approved Use',
    indication:
      'No approved medical indication and no completed controlled clinical trial. Schedule I in the United States, with a standing regulatory exemption at 21 CFR 1307.31 for the non-drug use of peyote in bona fide religious ceremonies of the Native American Church',
    patientFriendlyIndication:
      'Nothing. Mescaline is the only classic psychedelic in this group with no modern randomised trial at all',
    anatomicalSite: 'Cortical 5-HT2A receptors',
    conditionContext: {
      conditionExplainer:
        'Mescaline is the oldest documented psychedelic in continuous human use and the least studied of the classic four in modern clinical terms. It is a phenethylamine rather than a tryptamine — structurally closer to amphetamine and to the 2C series than to LSD or psilocybin — and it reaches the same receptor by a different structural route.',
      whyItMatters:
        'The evidence base is survey data and 1950s literature. That is a real gap and it is worth stating plainly rather than filling with the psilocybin data by analogy, because the compounds differ in potency by three orders of magnitude and in duration by a factor of two.',
      whoTakesThis:
        'Members of the Native American Church, under a federal regulatory exemption for ceremonial peyote. Otherwise, people using peyote or San Pedro cactus or synthetic mescaline outside any medical or legal framework.',
      clinicalGoals:
        'None defined, because no controlled clinical trial of mescaline for any indication has been completed.',
    },
    oneSentenceVerdict:
      'The classic psychedelic with the longest documented human use and the thinnest modern evidence base: no completed randomised trial, a survey literature of 452 respondents, and a federal exemption that protects the cactus rather than the molecule.',
    laymanHowItWorks:
      'Mescaline reaches the same serotonin receptor as LSD and psilocybin, but it belongs to a different chemical family — it is built on the same skeleton as amphetamine, with three methoxy groups added to the ring. Those groups are what convert a stimulant scaffold into a psychedelic one. It is roughly a thousand times weaker than LSD by weight, so the amount needed is measured in hundreds of milligrams rather than micrograms, and the experience runs ten to twelve hours.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 38,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'COC1=CC(=CC(=C1OC)OC)CCN',
      chemicalFormula: 'C11H17NO3',
      molecularWeight:
        '211.26 g/mol (free base). Peyote and San Pedro contain mescaline together with a range of minor phenethylamine and tetrahydroisoquinoline alkaloids; the structure shown is the marker constituent, not the cactus',
      targetReceptorAffinity:
        'Agonist at 5-HT2A with additional 5-HT2C and 5-HT1A activity. Its affinity at 5-HT2A is roughly three orders of magnitude lower than LSD\'s, which is the direct explanation for the difference in active dose. It is a 3,4,5-trimethoxy-substituted phenethylamine, the parent structure of the 2C series and of DOM and DOI.',
      structureSource: {
        label: 'PubChem CID 4076 (mescaline) — SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4076',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mes-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Alkaloid profiling of cactus material',
          description:
            'Mescaline content in Lophophora williamsii and Trichocereus species varies widely with species, age, growing conditions and which part of the plant was taken, and the material contains a range of minor alkaloids alongside it. Quantifying mescaline in dried plant material against a certified standard is the only way to convert a botanical description into a pharmacological quantity.',
          reagentsAndBuffer:
            'Mescaline hydrochloride certified reference standard, mescaline-d9 internal standard, acidified methanol extraction with sonication, C18 column with formic acid/acetonitrile gradient, diode-array detection at 210 and 280 nm',
        },
        {
          id: 'mes-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Separation from the substituted-phenethylamine family',
          description:
            'Mescaline sits in a family of ring-substituted phenethylamines that includes the 2C series, the DO series and the NBOMes, and several share fragment ions. Because those compounds differ from mescaline in active dose by two to three orders of magnitude, distinguishing them is not a formality — a mescaline identification on a phenethylamine-positive sample must be made against authenticated standards.',
          dependsOnStepId: 'mes-w1',
          reagentsAndBuffer:
            'Mescaline, 2C-B, 2C-I, DOM and 25I-NBOMe reference standards, GC-MS with retention-index confirmation, LC-MS/MS with compound-specific MRM transitions',
        },
        {
          id: 'mes-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'Plasma mescaline over a twelve-hour window',
          description:
            'The duration is the analytical constraint here, in the opposite direction from DMT: mescaline produces effects for ten to twelve hours, so a pharmacokinetic study needs sampling across a full working day and beyond, and elimination is substantially renal with unchanged drug appearing in urine.',
          dependsOnStepId: 'mes-w2',
          reagentsAndBuffer:
            'Mescaline-d9 internal standard, sampling across 12 to 24 hours, solid-phase extraction, UHPLC-MS/MS, paired urine collection for unchanged drug and the 3,4,5-trimethoxyphenylacetic acid metabolite',
        },
        {
          id: 'mes-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Heterologous 5-HT2A expression',
          description:
            'Human HTR2A expressed in a cell line lacking the native receptor, so that mescaline\'s affinity can be measured directly rather than inferred from its behavioural potency.',
          dependsOnStepId: 'mes-w2',
          reagentsAndBuffer:
            'HEK293 or CHO cells with human HTR2A, lipid transfection reagent, DMEM with 10% fetal bovine serum and selection antibiotic',
        },
        {
          id: 'mes-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Comparative binding against LSD and psilocin in one system',
          description:
            'Run mescaline, LSD and psilocin side by side in the same competition-binding and functional assays. The three-order-of-magnitude affinity gap this reveals is the entire explanation for why active doses differ from micrograms to hundreds of milligrams, and it is the number that makes cross-compound dose comparison possible at all.',
          dependsOnStepId: 'mes-w4',
          reagentsAndBuffer:
            '[3H]-ketanserin as 5-HT2A radioligand, LSD and psilocin as comparator ligands, Tris-HCl buffer with ascorbate, IP-One HTRF or calcium mobilisation for functional efficacy',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mes-a1',
        category: 'failed',
        title: 'No completed randomised controlled trial of mescaline exists',
        laymanSummary:
          'LSD, psilocybin and MDMA all have modern randomised trials. Mescaline has none. The evidence is 1950s literature and two online surveys.',
        technicalDetails:
          'Of the four classic psychedelics, mescaline is the only one with no completed modern randomised controlled trial for any clinical indication. The mid-twentieth-century literature is substantial but predates modern trial standards, randomisation, blinded outcome assessment and adverse-event reporting. The contemporary evidence consists of retrospective self-report surveys. This absence has a mundane explanation — mescaline\'s ten-to-twelve-hour duration, its lack of a commercial sponsor, its low potency relative to the compounds attracting investment, and the ethical and supply constraints around peyote — and no scientific one. What it means for a reader is that this page contains no efficacy claim, because there is no efficacy measurement to report.',
        evidenceSource:
          'Cassels BK, Sáez-Briones P. Dark Classics in Chemical Neuroscience: Mescaline. ACS Chem Neurosci 2018;9:2448-2458',
        doi: '10.1021/acschemneuro.8b00215',
        measuredMetric:
          'Number of completed randomised controlled trials of mescaline for a clinical indication: zero',
        auditFlag: 'verified',
      },
      {
        id: 'mes-a2',
        category: 'inferred',
        title: '452 people answered a survey; that is the modern therapeutic literature',
        laymanSummary:
          'Two studies of the same 452-person online survey found most respondents said their depression or anxiety improved. Everyone in it had chosen to take mescaline and chose to answer.',
        technicalDetails:
          'An anonymous online questionnaire of 452 adults reporting naturalistic mescaline use asked about self-reported mental health benefits. Among respondents reporting histories of depression, anxiety, PTSD, alcohol use disorder or drug use disorder, 68 to 86% reported subjective improvement following their most memorable mescaline experience. Those reporting improvement rated acute mystical-type, psychological-insight and ego-dissolution effects significantly higher than those who did not, with Cohen\'s d from 0.7 to 1.5. Between 35 and 50% rated the experience among the five most spiritually significant of their lives. A companion analysis of the same survey found most respondents used mescaline once a year or less, 74% for spiritual exploration or connection with nature, with 9% reporting craving, 1% legal problems, 1% psychological problems and none seeking medical attention. Every one of these numbers is retrospective self-report from a self-selected sample of people who chose to use the drug and chose to answer questions about it, with no control group and no verification of what was taken. The authors of both papers say so.',
        evidenceSource:
          'Agin-Liebes G et al., ACS Pharmacol Transl Sci 2021;4:543-552; Uthaug MV et al., J Psychopharmacol 2022;36:309-320',
        doi: '10.1021/acsptsci.1c00018',
        inferredClaim:
          'That self-reported improvement in a self-selected online sample estimates a treatment effect — it estimates what people who liked the experience say about it afterwards',
        auditFlag: 'caution',
      },
      {
        id: 'mes-a3',
        category: 'conclusion_shift',
        title: 'The exemption protects a ceremony, not a molecule',
        laymanSummary:
          'Federal regulation exempts ceremonial peyote use by the Native American Church from Schedule I. Mescaline itself, and San Pedro cactus, and synthetic mescaline, are not covered.',
        technicalDetails:
          '21 CFR 1307.31 states that the listing of peyote as a Schedule I controlled substance does not apply to the non-drug use of peyote in bona fide religious ceremonies of the Native American Church, and that members so using peyote are exempt from registration; anyone manufacturing or distributing peyote to the Church must register annually and comply with all other requirements. The exemption is written around a plant, a religious body and a ceremonial context. It does not cover isolated mescaline, other mescaline-containing cacti, or use outside that context. This is the same structural pattern as the DMT exemption upheld in Gonzales v. O Centro Espírita: an exception to enforcement granted on religious-freedom grounds, with the scheduling of the substance left entirely intact.',
        evidenceSource: '21 CFR 1307.31, Native American Church, current eCFR text',
        measuredMetric: 'Scope of the federal regulatory exemption for peyote',
        auditFlag: 'verified',
      },
      {
        id: 'mes-a4',
        category: 'measured',
        title: 'Three orders of magnitude weaker than LSD, and that is a receptor fact',
        laymanSummary:
          'An active mescaline dose is measured in hundreds of milligrams; an active LSD dose in tens of micrograms. The difference comes straight from how tightly each binds the receptor.',
        technicalDetails:
          'Mescaline is a 3,4,5-trimethoxyphenethylamine — the parent compound of the substituted-phenethylamine psychedelics including the 2C and DO series. Its affinity at 5-HT2A is roughly a thousand-fold lower than LSD\'s, which accounts directly for the difference in active dose without invoking any difference in mechanism. Duration is 10 to 12 hours, comparable to LSD and roughly double psilocybin. The practical consequence is that mescaline is not a plausible target for the microdosing and short-session formats being commercialised for other psychedelics, and that potency comparisons between psychedelics are meaningful only when normalised to receptor occupancy rather than to milligrams.',
        evidenceSource: 'Cassels BK, Sáez-Briones P. ACS Chem Neurosci 2018;9:2448-2458',
        doi: '10.1021/acschemneuro.8b00215',
        measuredMetric: '5-HT2A receptor affinity of mescaline relative to LSD',
        auditFlag: 'verified',
      },
      {
        id: 'mes-a5',
        category: 'inferred',
        title: 'Peyote is a slow-growing wild plant, and demand is a conservation question',
        laymanSummary:
          'Peyote takes many years to reach a harvestable size and does not survive careless harvesting. Rising interest in mescaline is a supply pressure on a wild population that already supplies a religious community.',
        technicalDetails:
          'Lophophora williamsii is a slow-growing cactus with a limited natural range in south Texas and northern Mexico; individual plants take years to reach maturity, and harvesting technique determines whether the root survives to regrow. The plant is the sacrament of the Native American Church, whose supply is legally protected and practically finite. San Pedro and related Trichocereus species grow far faster and are widely cultivated, and synthetic mescaline is chemically straightforward, so neither the ceremonial supply nor the wild population is a necessary source for research or for recreational demand. This is a resource claim rather than a pharmacological one, and it is on the page because a drug reference that discusses mescaline without it is describing a molecule and ignoring where it comes from.',
        evidenceSource:
          'Uthaug MV et al., J Psychopharmacol 2022;36:309-320 — most respondents reported using peyote or San Pedro rather than synthetic mescaline',
        doi: '10.1177/02698811211013583',
        inferredClaim:
          'That growing interest in mescaline can be met from cactus material without affecting a wild population that is also a protected religious supply',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, as dried cactus or as the isolated alkaloid',
        laymanDesc:
          'Taken by mouth. Effects begin within an hour or two and continue for most of a day. Nausea and vomiting early in the experience are the rule rather than the exception.',
        molecularDetail:
          'Oral administration of dried cactus material or mescaline salt. Onset within 45 to 90 minutes, peak at 2 to 4 hours, total duration 10 to 12 hours. Gastrointestinal upset early in the time course is characteristic and is attributed both to mescaline and to the other cactus constituents.',
        iconName: 'Leaf',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Distributes into the brain and is largely excreted unchanged',
        laymanDesc:
          'It reaches the brain and a large share of it leaves the body intact in urine rather than being broken down.',
        molecularDetail:
          'A substantial fraction of an oral dose is excreted unchanged in urine, with 3,4,5-trimethoxyphenylacetic acid as the principal metabolite from monoamine oxidase-mediated deamination. The long duration reflects slow clearance rather than slow receptor dissociation.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Activates 5-HT2A, weakly',
        laymanDesc:
          'It reaches the same receptor as LSD but grips it about a thousand times less tightly, which is why the dose is a thousand times larger.',
        molecularDetail:
          'Agonist at 5-HT2A with additional 5-HT2C and 5-HT1A activity. The roughly thousand-fold lower affinity relative to LSD is the direct determinant of the milligram dose, and the mechanism is otherwise the same as the other classic psychedelics.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Cortical processing changes for ten to twelve hours',
        laymanDesc:
          'The same broad reorganisation the other psychedelics produce, sustained across most of a day.',
        molecularDetail:
          'Gq-coupled 5-HT2A signalling in cortical pyramidal neurons, as with LSD, psilocin and DMT. Human functional imaging of mescaline specifically is very limited; the mechanistic account here is largely extrapolated from the better-studied compounds in the class, and this page marks that as extrapolation.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'No measured clinical outcome',
        laymanDesc:
          'There is no trial endpoint to report. What exists is what people said afterwards in a survey.',
        molecularDetail:
          'No randomised clinical endpoint exists for mescaline. The available outcome data are retrospective self-reports from 452 survey respondents, in which 68 to 86% of those with a psychiatric history reported subjective improvement, with no control group and no verification of the substance taken.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Naturalistic mescaline use survey (Agin-Liebes et al. / Uthaug et al.)',
        phase: 'Retrospective anonymous online survey, not a trial',
        sampleSize: 452,
        primaryEndpoint:
          'Self-reported improvement in depression, anxiety, PTSD, alcohol use disorder and drug use disorder after the most memorable mescaline experience',
        endpointMet: true,
        statisticalPValue:
          '68 to 86% of respondents with a relevant history reported subjective improvement; Cohen\'s d 0.7 to 1.5 for acute-effect ratings between improvers and non-improvers',
        unreportedAdverseSignals:
          'Self-selected sample, no control group, no verification of substance identity or dose, and recall of a single self-nominated "most memorable" experience. 9% reported craving; 1% reported psychological problems.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Agonism at 5-HT2A with roughly three orders of magnitude lower affinity than LSD, accounting for the milligram-scale active dose',
        'A 10 to 12 hour duration of action with substantial renal excretion of unchanged drug',
        'A standing federal exemption at 21 CFR 1307.31 for non-drug ceremonial peyote use by the Native American Church',
        'Self-reported improvement in 68 to 86% of survey respondents with a psychiatric history, in a sample of 452',
      ],
      unsupportedInferences: [
        'That survey self-report from people who chose to take mescaline estimates a treatment effect',
        'That the psilocybin and LSD trial results transfer to mescaline by class analogy, when the compounds differ by a thousand-fold in potency and by a factor of two in duration',
        'That the peyote exemption extends to mescaline, San Pedro or ceremonial use outside the Native American Church',
      ],
      whatFailedInitially: [
        'No modern randomised controlled trial of mescaline for any indication has been completed, which is the central fact about its evidence base',
        'The mid-twentieth-century clinical literature predates randomisation, blinded outcome assessment and systematic adverse-event reporting, and cannot substitute for one',
      ],
      realWorldOutcome: [
        'Mescaline remains Schedule I with no clinical development programme and no commercial sponsor',
        'Ceremonial peyote use continues under a regulatory exemption while wild peyote remains a slow-growing and finite resource',
      ],
    },
    deliverySystem: {
      type: 'Oral — dried cactus material, a decoction, or the isolated salt',
      description:
        'Taken by mouth in every documented context. Dried peyote buttons and San Pedro preparations deliver a dose that depends on the alkaloid content of that specific plant material, which varies with species, age and growing conditions, so the delivered dose from plant material is not knowable without an assay.',
      safetyProfile:
        'Nausea and vomiting early in the time course are characteristic. Acute effects include sympathomimetic changes — raised blood pressure, heart rate and pupil diameter — with a 10 to 12 hour course of perceptual and cognitive change. In the survey of 452 naturalistic users, 9% reported drug craving or desire, 1% reported legal problems, 1% reported psychological problems, and none reported seeking medical attention; that is self-report from a self-selected sample and should be read as such. As with the other classic psychedelics, personal or family history of psychosis is the risk that matters and there is no controlled data on it here. Mescaline does not produce physical dependence, and tolerance develops rapidly with repeated dosing.',
    },
    commonQuestions: [
      {
        q: 'Why is there so much less evidence for mescaline than for psilocybin?',
        a: 'Because nobody has run the trials. Mescaline lasts ten to twelve hours, which makes a supervised session expensive; it has no commercial sponsor; it is far less potent than the compounds attracting investment; and the best-known source plant is a slow-growing cactus that is also a protected religious sacrament. None of those is a scientific finding about the drug. The consequence is that this page carries no efficacy claim at all, and any statement that mescaline "works" for a psychiatric condition is currently an extrapolation from other compounds in the class or from survey self-report.',
      },
      {
        q: 'Is peyote legal?',
        a: 'For one specific use. Federal regulation exempts the non-drug use of peyote in bona fide religious ceremonies of the Native American Church, and members using it that way are exempt from registration; anyone supplying peyote to the Church must register annually. The exemption is drawn around the plant, the religious body and the ceremonial context. It does not cover isolated mescaline, San Pedro cactus, or peyote used outside that setting, all of which remain Schedule I.',
      },
      {
        q: 'How does a mescaline dose compare with an LSD dose?',
        a: 'By weight, roughly a thousand-fold larger, and that ratio comes straight from receptor binding rather than from any difference in what the two drugs do. Both are 5-HT2A agonists; LSD binds about three orders of magnitude more tightly. That is why LSD is dosed in micrograms and mescaline in hundreds of milligrams, and it is a useful general point: comparing psychedelics by milligrams tells you about their affinity, not about their effects.',
      },
      {
        q: 'Why does the page mention cactus conservation?',
        a: 'Because peyote is where most people who take mescaline get it — most respondents in the survey reported using peyote or San Pedro rather than synthetic material — and Lophophora williamsii is a slow-growing wild plant with a limited range that also supplies a religious community with a legally protected claim on it. San Pedro grows far faster and is widely cultivated, and synthetic mescaline is chemically straightforward. So the pressure on the wild population is a consequence of choice rather than necessity, and a reference that describes the molecule without saying where it comes from is describing half the subject.',
      },
      {
        q: 'Why does this page show no price?',
        a: 'There is no legal market and therefore no published price, no cost of production this file could verify, and no approved product. A street price is not a sourceable figure.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cassels BK, Sáez-Briones P. Dark Classics in Chemical Neuroscience: Mescaline. ACS Chem Neurosci 2018;9:2448-2458',
        identifier: '10.1021/acschemneuro.8b00215',
        kind: 'doi',
      },
      {
        label:
          'Agin-Liebes G et al. Naturalistic Use of Mescaline Is Associated with Self-Reported Psychiatric Improvements and Enduring Positive Life Changes. ACS Pharmacol Transl Sci 2021;4:543-552',
        identifier: '10.1021/acsptsci.1c00018',
        kind: 'doi',
      },
      {
        label:
          'Uthaug MV et al. The epidemiology of mescaline use: pattern of use, motivations for consumption, and perceived consequences, benefits, and acute and enduring subjective effects. J Psychopharmacol 2022;36:309-320',
        identifier: '10.1177/02698811211013583',
        kind: 'doi',
      },
      {
        label:
          '21 CFR 1307.31 — Native American Church exemption for non-drug ceremonial use of peyote',
        identifier: 'https://www.ecfr.gov/current/title-21/chapter-II/part-1307/section-1307.31',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 4076 — mescaline structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4076',
        kind: 'url',
      },
      CSA_SCHEDULES_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 13. Ibogaine
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ibogaine',
    name: 'Ibogaine',
    tradeName: 'No marketed product. Historically sold in France as Lambarène, a Tabernanthe extract tonic, until 1966',
    sponsor:
      'No commercial sponsor holds an approved product. Development history runs through a NIDA-funded programme in the 1990s that was not carried to trial, DemeRx and its noribogaine work, private clinics in Mexico and New Zealand, and a Texas state consortium created by Senate Bill 2308 in June 2025',
    targetGene: 'CHRNA3 / CHRNB4',
    targetProtein:
      'α3β4 nicotinic acetylcholine receptor (noncompetitive antagonist), with NMDA-receptor channel block, κ- and μ-opioid activity, SERT inhibition, and off-target hERG (Kv11.1) potassium-channel block',
    modality: 'Small Molecule',
    approvalStatus: 'Controlled / No Approved Use',
    indication:
      'No approved medical indication anywhere. Schedule I in the United States. Used in unregulated clinics in Mexico, Costa Rica and elsewhere, and lawfully by prescription-holding providers in New Zealand and Brazil, for opioid withdrawal and post-detoxification abstinence',
    patientFriendlyIndication:
      'Nothing approved. People travel to clinics outside the United States to take it for opioid withdrawal, and the published observational studies of those clinics are the entire clinical evidence base',
    anatomicalSite:
      'Medial habenula and interpeduncular nucleus, where α3β4 nicotinic receptors are densest; ventral tegmental area; and cardiac ventricular myocardium, where the hERG channel sits',
    conditionContext: {
      conditionExplainer:
        'Opioid withdrawal is the physical syndrome that follows stopping a mu-opioid agonist in a dependent person: pain, vomiting, diarrhoea, insomnia and craving, peaking over two to four days. It is rated on the Subjective Opioid Withdrawal Scale, a 16-item self-report running 0 to 64.',
      whyItMatters:
        'The approved treatments are methadone and buprenorphine, which work by replacing the opioid, and the relapse rate after any detoxification without them is high. A single dose that ends withdrawal and is followed by weeks of reduced use would be a different mechanism from anything approved, which is why the observational reports attracted attention despite their design.',
      whoTakesThis:
        'In the published series: adults with long opioid-use histories and an average of three previous failed treatment episodes, who paid to attend clinics outside the United States. No randomised trial in opioid use disorder has been completed.',
      clinicalGoals:
        'Suppression of the withdrawal syndrome within about 24 hours of a single dose, followed by an interval of abstinence or reduced use that the person can build on.',
    },
    oneSentenceVerdict:
      'A single dose reduced Subjective Opioid Withdrawal Scale scores from 31 to 14 in an uncontrolled series of 30 people, and the same molecule blocks the hERG cardiac potassium channel at the same low-micromolar concentrations at which it hits its brain targets — 19 deaths within 1.5 to 76 hours of ingestion have been catalogued.',
    laymanHowItWorks:
      'Ibogaine blocks a specific nicotinic receptor found in a small pair of brain structures that sit between the emotional and reward circuits, and it also blocks the NMDA receptor and acts at opioid receptors. Nobody has isolated which of those actions ends opioid withdrawal. It stays in the body for days as a long-lived metabolite, noribogaine, which is why one dose has an effect measured in weeks. The same molecule also plugs a potassium channel that resets the heartbeat, which lengthens the QT interval and is the mechanism behind the recorded deaths.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 41,
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC[C@H]1C[C@@H]2C[C@@H]3[C@H]1N(C2)CCC4=C3NC5=C4C=C(C=C5)OC',
      chemicalFormula: 'C20H26N2O',
      molecularWeight:
        '310.4 g/mol (free base). Clinic and case-series doses are quoted as ibogaine hydrochloride; total-alkaloid root-bark extract is a different material with a different ibogaine content',
      targetReceptorAffinity:
        'Noncompetitive antagonist at α3β4 nicotinic acetylcholine receptors, NMDA-receptor channel blocker, κ-opioid agonist with additional μ-opioid activity, and serotonin-transporter inhibitor. Off-target hERG block occurs in the low micromolar range — the same concentrations at which it engages several of its brain targets, which is the reason the cardiac effect is not separable from the psychoactive dose.',
      structureSource: {
        label: 'PubChem CID 197060 (ibogaine) — SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/197060',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ibo-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identify the alkaloid and separate it from its congeners',
          description:
            'Tabernanthe iboga root bark contains ibogaine alongside ibogaline, ibogamine and tabernanthine, which share a mass and fragment similarly. Identification is by chromatographic separation with mass spectrometry against certified reference standards for each alkaloid, not by total-alkaloid assay, because a sample sold as ibogaine may be any point on the range from purified hydrochloride to crude extract.',
          reagentsAndBuffer:
            'Ibogaine hydrochloride certified reference standard plus ibogaline and ibogamine standards, C18 reversed-phase column, ammonium acetate/acetonitrile gradient, electrospray positive ionisation, diode-array detection at 226 nm',
        },
        {
          id: 'ibo-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Quantify ibogaine content in the presented material',
          description:
            'The number a clinic or a coroner needs is milligrams of ibogaine per gram of the material actually taken. Total-alkaloid extract ("TA") from root bark typically carries well under half the ibogaine content of the hydrochloride salt by mass, so a dose calculated as though the two were interchangeable is not the dose delivered. Alper et al. list uninformed use of ethnopharmacological forms among the risk factors in the fatality series.',
          dependsOnStepId: 'ibo-w1',
          reagentsAndBuffer:
            'Calibration curve in matrix across the expected range, deuterated ibogaine internal standard, methanolic extraction with sonication, external-standard quantification with duplicate injections',
        },
        {
          id: 'ibo-w3',
          stepNumber: 3,
          phase: 'Cellular_Delivery',
          name: 'Express hERG in a mammalian line for patch-clamp work',
          description:
            'The cardiac liability is measured, not assumed. Human KCNH2 (hERG) is expressed in tsA-201 or HEK293 cells so that the potassium current recorded belongs to that one channel. Thurner et al. used exactly this preparation, and added the Y652A and F656A pore mutants to locate the binding site inside the inner cavity.',
          dependsOnStepId: 'ibo-w1',
          reagentsAndBuffer:
            'tsA-201 or HEK293 cells, human KCNH2 expression plasmid plus Y652A and F656A pore mutants, calcium-phosphate or lipid transfection, DMEM with 10% fetal bovine serum, external bath solution with 4 mM K+',
        },
        {
          id: 'ibo-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Whole-cell patch clamp for hERG, Nav1.5 and Cav1.2 block',
          description:
            'Concentration-response curves for tail-current inhibition give the potency of hERG block; the same panel run against Nav1.5 sodium and Cav1.2 calcium channels is what showed ibogaine also reduces those currents at higher concentrations. Koenig et al. found the calcium block partly offsets the action-potential prolongation in guinea-pig myocytes, which is why an in-vitro action-potential recording alone understates the human QT risk and a human ventricular model was used instead.',
          dependsOnStepId: 'ibo-w3',
          reagentsAndBuffer:
            'Whole-cell voltage clamp, borosilicate pipettes 2-4 MΩ, intracellular KCl/EGTA/HEPES solution, extracellular Tyrode solution, ibogaine and 18-methoxycoronaridine dilution series, dofetilide as positive control',
        },
        {
          id: 'ibo-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Plasma ibogaine and noribogaine with CYP2D6 genotype',
          description:
            'Ibogaine is O-demethylated to noribogaine by CYP2D6, an enzyme with common loss-of-function variants. Two people given the same milligram dose therefore reach different parent-drug concentrations and hold them for different lengths of time, which matters because the parent compound is the stronger hERG blocker. Quantifying both analytes alongside a genotype is the only way to attribute an ECG finding to an exposure.',
          dependsOnStepId: 'ibo-w2',
          reagentsAndBuffer:
            'LC-MS/MS with deuterated ibogaine and noribogaine internal standards, protein precipitation from EDTA plasma, CYP2D6 genotyping panel covering *3, *4, *5, *6 and copy-number variants, serial sampling to at least 96 hours',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ibo-a1',
        category: 'measured',
        title: 'Withdrawal scores more than halved in 30 people, with no control group',
        laymanSummary:
          'Thirty people with opioid dependence took a single large dose at a Mexican clinic. Their withdrawal scores fell from 31 to 14 over about three days, and half of them reported no opioid use in the following month.',
        technicalDetails:
          'Brown and Alper ran a prospective observational study of 30 subjects (25 male, 5 female) with DSM-IV opioid dependence who received a mean total dose of 1,540 ± 920 mg ibogaine hydrochloride. Subjects were using oxycodone (n=21, 250 ± 180 mg/day) and/or heroin (n=18, 1.3 ± 0.94 g/day) and averaged 3.1 ± 2.6 previous treatment episodes. Subjective Opioid Withdrawal Scale scores fell from 31.0 ± 11.6 pretreatment to 14.0 ± 9.8 at 76.5 ± 30 hours (t = 7.07, df = 26, p < 0.001). At one month, 15 of 30 (50%) reported no opioid use in the previous 30 days; Addiction Severity Index composite scores for drug use, legal and family/social status were improved at every timepoint out to 12 months (p < 0.001), with the drug-use effect maximal at one month and smaller thereafter. There was no control arm, no blinding and no randomisation: the comparison is against each subject\'s own baseline.',
        evidenceSource: 'Brown TK, Alper K. Am J Drug Alcohol Abuse 2018;44:24-36',
        doi: '10.1080/00952990.2017.1320802',
        measuredMetric:
          'SOWS change from pretreatment to 76.5 hours, and 30-day self-reported opioid abstinence, n=30',
        auditFlag: 'verified',
      },
      {
        id: 'ibo-a2',
        category: 'measured',
        title: 'Nineteen deaths within 1.5 to 76 hours of ingestion',
        laymanSummary:
          'A forensic review collected every known death outside West Central Africa linked in time to ibogaine between 1990 and 2008. There were nineteen. In most of them a pre-existing heart problem or another drug explained or contributed to the death.',
        technicalDetails:
          'Alper, Stajić and Gill systematically reviewed all available autopsy, toxicological and investigative reports for the consecutive series of known fatalities temporally related to ibogaine use from 1990 through 2008, excluding West Central Africa. Nineteen individuals died — 15 men and four women, aged 24 to 54 — within 1.5 to 76 hours of taking it. The clinical and postmortem findings did not suggest a characteristic neurotoxic syndrome. In 12 of the 14 cases with adequate postmortem data, advanced pre-existing comorbidity, mainly cardiovascular, and/or one or more commonly abused substances explained or contributed to the death. Additional identified risk factors were seizures on withdrawal from alcohol or benzodiazepines, and uninformed use of ethnopharmacological (root-bark) preparations. The denominator is unknown, so this series establishes a mechanism and a risk profile, not an incidence.',
        evidenceSource: 'Alper KR, Stajić M, Gill JR. J Forensic Sci 2012;57:398-412',
        doi: '10.1111/j.1556-4029.2011.02008.x',
        measuredMetric:
          'Consecutive fatality case series, n=19, with time from ingestion to death and postmortem findings',
        auditFlag: 'verified',
      },
      {
        id: 'ibo-a3',
        category: 'measured',
        title: 'The cardiac channel is blocked at the same concentrations as the brain targets',
        laymanSummary:
          'Ibogaine plugs the potassium channel that lets heart muscle reset between beats, at the same strength at which it acts on the brain receptors it is taken for. That is the mechanism of the QT prolongation seen in patients.',
        technicalDetails:
          'Koenig et al. showed that heterologously expressed hERG currents are reduced by ibogaine at low micromolar concentrations — the same range as its affinity for several known brain targets — and that at higher concentrations it also reduces human Nav1.5 sodium and Cav1.2 calcium currents. In guinea-pig cardiomyocytes the action potential was not prolonged at low micromolar concentrations, and was shortened above 10 µM, because calcium-channel block partly offsets the hERG effect; implementing the measured human channel data in a human ventricular myocyte model, by contrast, predicted action-potential prolongation. Thurner et al. then localised the block: ibogaine reaches the channel from the cytosolic side, binds preferentially to the open and inactivated states, and loses potency against the Y652A and F656A pore mutants. The congener 18-methoxycoronaridine blocked the same currents with lower potency.',
        evidenceSource:
          'Koenig X et al. Toxicol Appl Pharmacol 2013;273:259-268; Thurner P et al. J Pharmacol Exp Ther 2014;348:346-358',
        doi: '10.1016/j.taap.2013.05.012',
        measuredMetric:
          'hERG, Nav1.5 and Cav1.2 current inhibition by whole-cell patch clamp, with pore-mutant mapping of the binding site',
        auditFlag: 'verified',
      },
      {
        id: 'ibo-a4',
        category: 'inferred',
        title: 'Effect sizes above 2.0 from an open-label study of 30 self-selected veterans',
        laymanSummary:
          'A Stanford team followed thirty special-operations veterans who had already decided to fly to Mexico for ibogaine. Their trauma, depression and anxiety scores improved enormously. There was no comparison group and no blinding, and the effect sizes are larger than almost any controlled psychiatric trial reports.',
        technicalDetails:
          'Cherian et al. reported a prospective observational study of the Magnesium-Ibogaine Stanford Traumatic Injury to the CNS protocol in 30 male Special Operations Forces veterans with predominantly mild traumatic brain injury, delivered with complementary treatment modalities at a clinic in Mexico (NCT04313712). WHODAS disability improved immediately after treatment (P corrected < 0.001, d = 0.74) and at one month (d = 2.20); CAPS-5 PTSD improved at one month (d = 2.54), MADRS depression (d = 2.80) and HAM-A anxiety (d = 2.13). No unexpected or serious adverse events occurred. The authors state plainly that controlled trials are needed. The design cannot separate drug effect from the expectancy of a cohort who self-funded international travel for the treatment, from the complementary modalities delivered alongside it, or from regression to the mean in a group enrolled at a personal low point. Several authors hold patent applications on the protocol and three are shareholders in the company that provides the treatment, which the paper discloses.',
        evidenceSource: 'Cherian KN et al. Nat Med 2024;30:373-381 (NCT04313712)',
        doi: '10.1038/s41591-023-02705-w',
        inferredClaim:
          'That effect sizes of d = 2.2 to 2.8 in an uncontrolled, unblinded, self-selected cohort receiving several interventions at once estimate the effect of ibogaine',
        auditFlag: 'caution',
      },
      {
        id: 'ibo-a5',
        category: 'measured',
        title: 'A 12-month follow-up of 14 legal treatments, one of which was fatal',
        laymanSummary:
          'New Zealand allows ibogaine treatment by a registered provider, so researchers could follow patients for a year. Fourteen took part, eight completed every interview, drug-use scores fell and stayed down — and one of the fourteen died during treatment.',
        technicalDetails:
          'Noller, Frampton and Yazar-Klosinski measured Addiction Severity Index-Lite scores in 14 participants (50% female) over 12 months after a single legal ibogaine treatment by one of two New Zealand providers. Among the eight who completed all interviews, the ASI-Lite drug-use composite fell significantly from baseline to 12 months (Friedman test, p = 0.002) and BDI-II depression scores fell (p < 0.001). Subjective Opioid Withdrawal Scale scores fell acutely after treatment across all 14 (p = 0.015). One patient enrolled in the study died during treatment. That is one death in a prospective sample of 14, reported by the investigators in the same paper as the efficacy result, and it is the reason this record carries the fatality series alongside the outcome series rather than in a separate section.',
        evidenceSource: 'Noller GE, Frampton CM, Yazar-Klosinski B. Am J Drug Alcohol Abuse 2018;44:37-46',
        doi: '10.1080/00952990.2017.1310218',
        measuredMetric:
          'ASI-Lite drug-use composite and BDI-II at 12 months (n=8 completers of 14 enrolled), with one on-treatment death',
        auditFlag: 'caution',
      },
      {
        id: 'ibo-a6',
        category: 'conclusion_shift',
        title: 'A Schedule I drug that a US state has now legislated to put through FDA trials',
        laymanSummary:
          'Ibogaine is in the strictest US drug schedule, defined as having no accepted medical use. In June 2025 Texas passed a law creating a consortium specifically to run FDA drug-development trials on it.',
        technicalDetails:
          'Ibogaine is listed in Schedule I of the Controlled Substances Act, the category defined by high abuse potential, no currently accepted medical use in the United States and a lack of accepted safety under medical supervision. Texas Senate Bill 2308 of the 89th Legislature, signed by the governor and effective 11 June 2025, establishes a consortium to conduct FDA drug-development clinical trials with ibogaine for opioid use disorder, co-occurring substance use disorder and other conditions for which it demonstrates efficacy. The companion House bill, HB 3717, was laid on the table on 12 May 2025 with SB 2308 considered in its place. This does not change the drug\'s schedule and does not make it prescribable: it funds the trials that a rescheduling petition would eventually need. The gap between the statutory finding of "no accepted medical use" and a state statute funding the trials is the record here.',
        evidenceSource:
          'Texas SB 2308, 89th Legislature (2025), effective 11 June 2025; 21 CFR 1308.11(d)',
        measuredMetric:
          'Federal scheduling status versus enacted state legislation funding FDA trials on the same molecule',
        auditFlag: 'contested',
      },
      {
        id: 'ibo-a7',
        category: 'inferred',
        title: 'The GDNF mechanism is a rat result being used to explain a human one',
        laymanSummary:
          'The best-known explanation for why one dose has lasting effects is that ibogaine raises a nerve growth factor in a reward-circuit brain region. That was shown in rats drinking alcohol. It has not been demonstrated in a person.',
        technicalDetails:
          'He et al. showed in rats that ibogaine reduces alcohol self-administration and that this depends on glial cell line-derived neurotrophic factor in the ventral tegmental area: ibogaine increased GDNF expression there, intra-VTA GDNF reproduced the reduction in drinking, and blocking GDNF signalling prevented ibogaine\'s effect. That is a well-constructed causal chain in a rodent alcohol model. It is routinely quoted as the mechanism for durable human anti-addictive effects across opioids, stimulants and nicotine, which the experiment does not address. No human study has measured GDNF, and the α3β4 nicotinic antagonism, NMDA block and κ-opioid agonism are alternative candidate mechanisms that have not been separated in people.',
        evidenceSource: 'He DY et al. J Neurosci 2005;25:619-628',
        doi: '10.1523/JNEUROSCI.3959-04.2005',
        inferredClaim:
          'That VTA GDNF induction, demonstrated in a rat alcohol model, is the mechanism of the durable effects reported in human opioid case series',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed as a single large dose',
        laymanDesc:
          'Doses in the published series are around a gram and a half, taken once, with the acute effects running most of a day and the after-effects days longer.',
        molecularDetail:
          'Oral ibogaine hydrochloride; the Brown and Alper series used a mean total dose of 1,540 ± 920 mg. Absorption and first-pass metabolism are variable, and the material itself varies: purified hydrochloride and total-alkaloid root-bark extract are not equivalent by mass.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Converted by a liver enzyme into a long-lived metabolite',
        laymanDesc:
          'The liver strips a methyl group off, producing noribogaine, which lingers for days. How fast this happens depends on a gene that varies between people.',
        molecularDetail:
          'CYP2D6-mediated O-demethylation to noribogaine. Loss-of-function CYP2D6 variants raise and prolong parent-drug exposure, which matters because ibogaine is the more potent hERG blocker of the two. Noribogaine\'s long half-life is the pharmacokinetic basis for effects lasting beyond the acute session.',
        iconName: 'FlaskConical',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Blocks nicotinic, NMDA and opioid receptors at once',
        laymanDesc:
          'Rather than acting on one target, it acts weakly on several — a nicotinic receptor concentrated in a small relay between the emotional and reward circuits, the NMDA glutamate receptor, and opioid receptors.',
        molecularDetail:
          'Noncompetitive antagonism at α3β4 nicotinic acetylcholine receptors, densest in the medial habenula and interpeduncular nucleus; NMDA-receptor channel block; κ-opioid agonism with additional μ-opioid activity; serotonin-transporter inhibition. No single action has been shown to be necessary for the anti-withdrawal effect in humans.',
        iconName: 'Network',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The withdrawal syndrome stops',
        laymanDesc:
          'Within a day, the physical withdrawal from opioids is largely gone. This is the most consistent observation across every published series, and it is also the one most likely to be exaggerated by the absence of a control group.',
        molecularDetail:
          'SOWS fell from 31.0 to 14.0 at 76.5 hours in the 30-subject Mexico series and fell significantly across all 14 New Zealand participants. Both are within-subject comparisons in people who expected the effect; opioid withdrawal also resolves on its own over a similar interval, which an uncontrolled design cannot subtract.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And the QT interval lengthens',
        laymanDesc:
          'At the same time and at the same concentrations, the drug is slowing the electrical reset of the heart. This is not a rare idiosyncratic reaction; it is the expected pharmacology of the dose.',
        molecularDetail:
          'hERG (Kv11.1) block from the cytosolic side, state-dependent and localised to Y652 and F656 in the inner cavity. A human ventricular myocyte model incorporating the measured channel data predicts action-potential prolongation. Nineteen catalogued deaths occurred 1.5 to 76 hours after ingestion, most with cardiovascular comorbidity or co-ingested drugs.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Brown & Alper 2018 Mexico observational series (opioid use disorder)',
        phase: 'Prospective observational, uncontrolled',
        sampleSize: 30,
        primaryEndpoint:
          'SOWS change from pretreatment to 76.5 hours, with ASI composite scores to 12 months',
        endpointMet: true,
        statisticalPValue: 'SOWS 31.0 ± 11.6 to 14.0 ± 9.8, t = 7.07, df = 26, p < 0.001',
        unreportedAdverseSignals:
          'No control arm, no blinding, no randomisation. Self-reported abstinence was not corroborated by toxicology. Opioid withdrawal resolves spontaneously over a similar interval, and the design cannot subtract that.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Noller et al. 2018 New Zealand 12-month follow-up',
        phase: 'Prospective observational, uncontrolled',
        sampleSize: 14,
        primaryEndpoint: 'ASI-Lite drug-use composite at 12 months',
        endpointMet: true,
        statisticalPValue:
          'ASI-Lite drug use p = 0.002 and BDI-II p < 0.001 among 8 completers; SOWS p = 0.015 acutely across all 14',
        unreportedAdverseSignals:
          'One of the 14 enrolled patients died during treatment. Six of 14 did not complete all interviews, and the primary analysis is on the 8 who did.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT04313712 (MISTIC, magnesium-ibogaine in veterans with TBI)',
        phase: 'Open-label prospective observational',
        sampleSize: 30,
        primaryEndpoint: 'Change in WHODAS 2.0 disability score immediately after treatment',
        endpointMet: true,
        statisticalPValue:
          'WHODAS P corrected < 0.001, d = 0.74 immediately and d = 2.20 at 1 month; CAPS-5 d = 2.54, MADRS d = 2.80, HAM-A d = 2.13 at 1 month',
        unreportedAdverseSignals:
          'No unexpected or serious adverse events reported. No control group, no blinding, complementary treatments delivered alongside, and a self-selected cohort who had already chosen to travel for treatment. Author patent applications and shareholdings in the treatment provider are disclosed in the paper.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A fall in SOWS from 31.0 to 14.0 at 76.5 hours after a single mean dose of 1,540 mg in 30 subjects, and 50% self-reported 30-day abstinence at one month',
        'Nineteen deaths within 1.5 to 76 hours of ingestion between 1990 and 2008, with cardiovascular comorbidity or co-ingestants explaining or contributing in 12 of 14 evaluable cases',
        'hERG potassium-current block at low micromolar concentrations, state-dependent, mapped to Y652 and F656 in the channel\'s inner cavity',
        'One on-treatment death among 14 prospectively enrolled New Zealand patients, reported by the investigators alongside their efficacy result',
      ],
      unsupportedInferences: [
        'That effect sizes of d = 2.2 to 2.8 from an uncontrolled, unblinded, self-selected veteran cohort receiving multiple concurrent interventions estimate the drug\'s effect',
        'That GDNF induction in the rat ventral tegmental area is the mechanism of durable human anti-addictive effects',
        'That the 19 catalogued deaths represent a rate — the number of exposures worldwide is unknown, so no incidence can be calculated in either direction',
        'That co-administered magnesium makes the cardiac risk acceptable; the claim rests on a proposed mitigation and an uncontrolled series with no comparator, not on a measured reduction in arrhythmia',
      ],
      whatFailedInitially: [
        'The NIDA-funded development programme of the 1990s did not carry ibogaine into a controlled human trial',
        'Every published human study of ibogaine in addiction to date is observational; no randomised, controlled efficacy trial in opioid use disorder has been completed',
      ],
      realWorldOutcome: [
        'Treatment continues in unregulated clinics outside the United States, and lawfully through registered providers in New Zealand, which is how the follow-up data exist at all',
        'Texas Senate Bill 2308, effective 11 June 2025, created a state consortium to fund FDA drug-development trials; the federal Schedule I listing is unchanged',
      ],
    },
    deliverySystem: {
      type: 'Single oral dose in a supervised session lasting 24 to 72 hours',
      description:
        'Administration in the published series is a single oral dose of the hydrochloride, given at a clinic with the person monitored through an acute phase of roughly 24 hours and a subsequent day or two of insomnia and residual effects. Continuous cardiac monitoring, pre-treatment ECG and electrolyte correction are the stated precautions in protocols that report them; there is no regulatory standard because there is no regulated product.',
      safetyProfile:
        'Ataxia, vomiting, tremor and profound bradycardia are usual during the acute phase. QT prolongation is expected pharmacology rather than an idiosyncratic reaction, and torsades de pointes is the mechanism implicated in the fatality series: 19 deaths 1.5 to 76 hours after ingestion, 12 of 14 evaluable cases with cardiovascular comorbidity or co-ingested drugs. Seizures on withdrawal from alcohol or benzodiazepines, hepatic injury, and the use of root-bark preparations of unknown ibogaine content are additional documented risk factors. CYP2D6 poor metabolisers hold higher parent-drug concentrations for longer. Co-administered QT-prolonging drugs, methadone in particular, compound the effect.',
    },
    commonQuestions: [
      {
        q: 'Does it actually stop opioid withdrawal?',
        a: 'Every published series says the withdrawal score falls sharply within a day or so, and the effect sizes are large. None of those series had a control group. Opioid withdrawal also resolves by itself over three to five days, and the people in these studies had paid to travel for a treatment they expected to work. So the honest statement is: a consistent, large, within-subject reduction has been measured repeatedly, and no study has yet measured it against anything.',
        auditNote:
          'The 76.5-hour timepoint in the Brown and Alper series is roughly when untreated withdrawal would also be improving. That is the specific reason a controlled trial is needed rather than another case series.',
      },
      {
        q: 'How dangerous is the heart problem?',
        a: 'The mechanism is established: ibogaine blocks the hERG potassium channel at the same low-micromolar concentrations at which it hits its brain targets, so QT prolongation is expected at any psychoactive dose rather than being a rare reaction. Nineteen deaths within 1.5 to 76 hours of ingestion were catalogued for 1990 to 2008, and in most of the evaluable cases pre-existing cardiovascular disease or another drug contributed. What cannot be stated is a rate, because nobody knows how many people have taken it.',
      },
      {
        q: 'Does magnesium make it safe?',
        a: 'That is the premise of the Stanford MISTIC protocol, and it is a proposal supported by magnesium\'s general role in managing torsades de pointes — not a measured reduction in arrhythmia with ibogaine. The 30-veteran study reported no serious adverse events, but with no comparator arm, 30 participants and screening that excluded cardiac risk, it cannot distinguish an effective mitigation from a low event rate in a healthy sample.',
      },
      {
        q: 'Why does this page show no price?',
        a: 'There is no approved product and therefore no list price. Clinics outside the United States charge fees that are commercial arrangements, not published prices, and this site does not print numbers it cannot source to a document.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Brown TK, Alper K. Treatment of opioid use disorder with ibogaine: detoxification and drug use outcomes. Am J Drug Alcohol Abuse 2018;44:24-36',
        identifier: '10.1080/00952990.2017.1320802',
        kind: 'doi',
      },
      {
        label:
          'Noller GE, Frampton CM, Yazar-Klosinski B. Ibogaine treatment outcomes for opioid dependence from a twelve-month follow-up observational study. Am J Drug Alcohol Abuse 2018;44:37-46',
        identifier: '10.1080/00952990.2017.1310218',
        kind: 'doi',
      },
      {
        label:
          'Alper KR, Stajić M, Gill JR. Fatalities temporally associated with the ingestion of ibogaine. J Forensic Sci 2012;57:398-412',
        identifier: '10.1111/j.1556-4029.2011.02008.x',
        kind: 'doi',
      },
      {
        label:
          'Koenig X et al. Anti-addiction drug ibogaine inhibits voltage-gated ionic currents: a study to assess the drug\'s cardiac ion channel profile. Toxicol Appl Pharmacol 2013;273:259-268',
        identifier: '10.1016/j.taap.2013.05.012',
        kind: 'doi',
      },
      {
        label:
          'Thurner P et al. Mechanism of hERG channel block by the psychoactive indole alkaloid ibogaine. J Pharmacol Exp Ther 2014;348:346-358',
        identifier: '10.1124/jpet.113.209643',
        kind: 'doi',
      },
      {
        label:
          'Cherian KN et al. Magnesium-ibogaine therapy in veterans with traumatic brain injuries. Nat Med 2024;30:373-381',
        identifier: '10.1038/s41591-023-02705-w',
        kind: 'doi',
      },
      {
        label:
          'He DY et al. Glial cell line-derived neurotrophic factor mediates the desirable actions of the anti-addiction drug ibogaine against alcohol consumption. J Neurosci 2005;25:619-628',
        identifier: '10.1523/JNEUROSCI.3959-04.2005',
        kind: 'doi',
      },
      {
        label: 'Alper KR. Ibogaine: a review. Alkaloids Chem Biol 2001;56:1-38',
        identifier: '10.1016/s0099-9598(01)56005-8',
        kind: 'doi',
      },
      {
        label: 'ClinicalTrials.gov NCT04313712 — MISTIC, magnesium-ibogaine in veterans',
        identifier: 'NCT04313712',
        kind: 'nct',
      },
      {
        label:
          'Texas Senate Bill 2308, 89th Legislature (2025) — ibogaine clinical trial consortium, signed 11 June 2025',
        identifier: 'https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB2308',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 197060 — ibogaine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/197060',
        kind: 'url',
      },
      CSA_SCHEDULES_SOURCE,
    ],
  },
]
