import type { SeedDossier } from '@/lib/seed-types'

/**
 * siRNA (small interfering RNA) — the modality RNAwiki is named after.
 *
 * Every number on these pages was read out of the paper, the trial registry or the FDA label at
 * research time, and every identifier below resolves. Three conventions are worth knowing before
 * editing this file.
 *
 * 1. NO PRICING BLOCK. `SeedPricing` requires a synthesis cost per dose with a citable source.
 *    No peer-reviewed cost-of-production estimate exists for a GalNAc-conjugated siRNA — the only
 *    published oligonucleotide figure is Zhang & Tang's 1999 "<US$300 per gram" for unconjugated
 *    phosphorothioates, and turning that into a per-dose cost for a 2020s conjugate would be this
 *    file inventing a number. So `pricing` is omitted everywhere and the list price appears only
 *    where a peer-reviewed source states it (Sehgal 2024) or a government dataset publishes it
 *    (CMS NADAC). A missing price beats a manufactured one.
 *
 * 2. THE SEQUENCE IS THE GUIDE (ANTISENSE) STRAND, 5'->3', WITH THE MODIFICATIONS STRIPPED. The
 *    published strings are written 3'->5' with 2'-F / 2'-OMe / phosphorothioate notation; the
 *    engine's Layer 1 validates the A/U/C/G alphabet, so the base sequence is what is stored and
 *    the chemistry is described in prose. Each one was reversed by hand and then checked by
 *    base-pairing it back against its own sense strand — all six approved sequences pair perfectly
 *    across the duplex region, which is the arithmetic proof that the transcription is right.
 *    Olpasiran and zilebesiran have no published sequence, so they carry no sequence at all.
 *
 * 3. THE AUDIT POINTS ARE NOT A HIGHLIGHT REEL. Every dossier here carries at least one 'inferred'
 *    or 'failed' entry, because every drug in this class has one: inclisiran has never reported a
 *    cardiovascular outcome, patisiran was refused for cardiomyopathy, fitusiran carries a boxed
 *    warning written out of its own trial deaths, and lumasiran and nedosiran are approved on a
 *    urine chemistry rather than on kidney survival.
 */
export const SIRNA_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // Inclisiran — the reference wireframe's featured example, rebuilt from primary sources.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'inclisiran',
    name: 'Inclisiran',
    tradeName: 'Leqvio',
    sponsor: 'Novartis (licensed from Alnylam Pharmaceuticals)',
    targetGene: 'PCSK9',
    targetProtein: 'Proprotein convertase subtilisin/kexin type 9',
    modality: 'siRNA (Small Interfering RNA)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2021,
    indication:
      'Adjunct to diet and exercise to reduce LDL cholesterol in adults with hypercholesterolemia, and in patients aged 12 and older with heterozygous or homozygous familial hypercholesterolemia',
    patientFriendlyIndication: 'High LDL cholesterol that stays high despite statins',
    conditionContext: {
      conditionExplainer:
        "LDL particles carry cholesterol through the blood, and the liver clears them by catching them on LDL receptors. A liver protein called PCSK9 binds those receptors and sends them to be destroyed instead of reused, so the more PCSK9 a person makes, the fewer receptors survive and the higher their LDL cholesterol runs.",
      whyItMatters:
        'Lifetime LDL exposure is the best-established causal driver of atherosclerosis, and people with familial hypercholesterolemia inherit high LDL from birth. The open question inclisiran does not yet answer is whether lowering the number this way lowers the events.',
      whoTakesThis:
        'Adults with hypercholesterolemia or heterozygous familial hypercholesterolemia who are already on the highest statin dose they tolerate, and patients aged 12 and older with familial hypercholesterolemia.',
      clinicalGoals:
        'A roughly 50% LDL-C reduction sustained on two injections a year, given in a clinic so that adherence is observed rather than assumed.',
    },
    oneSentenceVerdict:
      'A GalNAc-tagged siRNA that makes liver cells destroy their own PCSK9 messenger RNA, cutting LDL cholesterol by 52.3% and 49.9% against placebo at day 510 in ORION-10 and ORION-11 — a blood measurement, not yet a demonstrated reduction in heart attacks.',
    laymanHowItWorks:
      'Your liver pulls cholesterol out of the blood using catchers on its surface called LDL receptors. A protein named PCSK9 grabs those catchers and drags them off to be destroyed, so you end up with fewer of them. Inclisiran is a short piece of RNA with a sugar tag that only liver cells recognise; once inside, it hands the liver a template for shredding its own PCSK9 instructions. The catchers survive and get reused, and LDL in the blood falls for about six months per injection.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    anatomicalSite: 'Hepatocyte cytoplasm (liver)',
    substitutes: {
      summary:
        'Generic statins and ezetimibe reach a similar LDL target for a few dollars a month and, unlike inclisiran, already have outcome trials behind them. Plant stanols and psyllium produce a real but much smaller reduction. The honest comparison is not potency, it is whether the endpoint that matters has been measured.',
      conventionalRx: [
        {
          name: 'Atorvastatin (generic)',
          class: 'HMG-CoA reductase inhibitor',
          howItCompares:
            'Lowers LDL-C by a comparable amount at high dose and is the therapy inclisiran was added on top of in every ORION trial. It is the only class in this list with decades of randomised mortality data.',
          typicalCost:
            'US$0.042 per 40 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 17 Dec 2025) — about US$1.27 for a 30-day supply',
          prosAndCons:
            'Pros: cardiovascular outcome evidence, cents per day, oral. Cons: taken daily, and a minority of patients report muscle symptoms.',
        },
        {
          name: 'Ezetimibe (generic)',
          class: 'NPC1L1 cholesterol-absorption inhibitor',
          howItCompares:
            'Blocks intestinal cholesterol uptake for a further LDL-C reduction on top of a statin. Weaker than inclisiran on the LDL number, but with a completed cardiovascular outcome trial.',
          typicalCost:
            'US$0.074 per 10 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 17 Dec 2025) — about US$2.23 for a 30-day supply',
          prosAndCons:
            'Pros: very cheap, well tolerated, combines with any statin dose. Cons: modest effect used alone.',
        },
        {
          name: 'Evolocumab (Repatha)',
          class: 'Anti-PCSK9 monoclonal antibody',
          howItCompares:
            'Hits the same protein but from outside the cell, mopping up circulating PCSK9 rather than stopping its manufacture. Injected every two to four weeks instead of twice a year, and it has already reported a cardiovascular outcome trial.',
          typicalCost:
            'About US$7,306 per year in the United States (Sehgal, Eells & Hudson, Pharmacy 2024)',
          prosAndCons:
            'Pros: outcome data exist for the class. Cons: far more injections, and self-administration means adherence is not observed.',
        },
        {
          name: 'Alirocumab (Praluent)',
          class: 'Anti-PCSK9 monoclonal antibody',
          howItCompares:
            'The second antibody against PCSK9, with the same every-two-weeks rhythm and a completed outcome trial.',
          typicalCost:
            'About US$6,539 per year in the United States (Sehgal, Eells & Hudson, Pharmacy 2024)',
          prosAndCons:
            'Pros: same endpoint, same target, evidence one step further along. Cons: cost and injection frequency.',
        },
      ],
      naturalFoods: [
        {
          name: 'Plant stanol esters (fortified spreads, yoghurt drinks, supplements)',
          activeCompound: 'Sitostanol and campestanol fatty-acid esters',
          biologicalMechanism:
            'Compete with dietary and biliary cholesterol for space in intestinal mixed micelles, so less cholesterol is absorbed and the liver upregulates its own LDL receptors to compensate.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            '1.5 to 2.4 g of plant stanols daily, the intake range reviewed in Lipids in Health and Disease (2012), which reported LDL-C reductions of 7 to 10% and no further gain above roughly 2.5 g/day',
          monthlyCost: '',
        },
        {
          name: 'Psyllium husk (Plantago ovata)',
          activeCompound: 'Arabinoxylan soluble viscous fibre',
          biologicalMechanism:
            'Forms a viscous gel that traps bile acids in the gut lumen, forcing the liver to convert more cholesterol into replacement bile acids.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'The doses pooled in a 2025 dose-response meta-analysis of 41 randomised trials (Genes & Nutrition), which found a statistically significant reduction in LDL cholesterol',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask for the LDL number, not the percentage',
          action:
            'Request the absolute LDL-C in mg/dL before and after any change in therapy, alongside the percentage.',
          patientImpact:
            'A 50% cut from a low starting point moves fewer mg/dL than a 30% cut from a high one, and it is the absolute reduction that maps onto risk in the statin literature.',
          clinicalPrecaution:
            'Percentages are how trials report and how marketing quotes. They are not interchangeable between patients.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'ACAAAAGCAAAACAGGUCUAGAA',
      chemicalFormula: 'C529H664F12N176Na43O316P43S6',
      molecularWeight: '17,284.72 g/mol (inclisiran sodium, per the FDA label)',
      structureSource: {
        label:
          'Kim & Berkhout, The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024 (Table 1, sequences taken from the FDA inserts)',
        identifier: '10.1124/molpharm.124.000895',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 'inc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of amidites and GalNAc solid support',
          description:
            'Confirm identity and purity of the 2\'-F and 2\'-OMe phosphoramidites and the loading of the triantennary GalNAc (L96) controlled-pore-glass support before any coupling is attempted. A low-purity amidite becomes a truncation the anion-exchange step cannot separate.',
          reagentsAndBuffer:
            "2'-F and 2'-OMe A/C/G/U phosphoramidites, L96-GalNAc CPG support, anhydrous acetonitrile (<30 ppm water), Karl Fischer titration, 31P NMR",
        },
        {
          id: 'inc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase phosphoramidite assembly of both strands',
          description:
            'Assemble the 21-mer sense strand on the GalNAc support and the 23-mer antisense strand on standard support, sulfurising the six terminal linkages that the label specifies as phosphorothioate and oxidising the rest, then cleave and deprotect.',
          dependsOnStepId: 'inc-w1',
          reagentsAndBuffer:
            '5-(ethylthio)-1H-tetrazole activator in acetonitrile; 3% dichloroacetic acid in toluene for detritylation; acetic anhydride / N-methylimidazole capping; 0.02 M iodine in THF/pyridine/water for oxidation; phenylacetyl disulfide for sulfurisation; concentrated aqueous ammonia for cleavage and deprotection',
        },
        {
          id: 'inc-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange HPLC and tangential-flow desalting',
          description:
            'Resolve full-length product from n-1 and n-2 truncations on a strong anion exchanger, pool by UV and mass, then exchange the salt gradient out by ultrafiltration.',
          dependsOnStepId: 'inc-w2',
          reagentsAndBuffer:
            'Quaternary-amine strong anion-exchange resin; 20 mM sodium phosphate pH 8.5 with 20% acetonitrile (buffer A) and the same buffer plus 1 M sodium bromide (buffer B); 3 kDa tangential-flow membrane against water for injection',
        },
        {
          id: 'inc-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Duplex annealing and conjugate confirmation',
          description:
            'Anneal equimolar sense and antisense strands into the duplex and confirm by ion-pair LC-MS that the intact mass carries the triantennary GalNAc ligand and the expected fluorine and phosphorothioate counts.',
          dependsOnStepId: 'inc-w3',
          reagentsAndBuffer:
            'Equimolar strands in phosphate-buffered saline, held at 90 degrees C and cooled slowly to ambient; ion-pair reversed-phase LC-MS with hexafluoroisopropanol / triethylamine mobile phase',
        },
        {
          id: 'inc-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'ASGPR-mediated uptake in primary human hepatocytes',
          description:
            'Dose cryopreserved primary human hepatocytes in free-uptake conditions, with no transfection reagent, so that entry depends on the asialoglycoprotein receptor rather than on a lipid carrier.',
          dependsOnStepId: 'inc-w4',
          reagentsAndBuffer:
            "Cryopreserved primary human hepatocytes, InVitroGRO CP thawing medium, Williams' E medium with GlutaMAX, collagen-coated plates; asialofetuin competition control",
        },
        {
          id: 'inc-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'PCSK9 transcript knockdown by RT-qPCR',
          description:
            'Quantify PCSK9 mRNA against a housekeeping control at 48 and 72 hours, and confirm the knockdown at the protein level by ELISA on the culture supernatant.',
          dependsOnStepId: 'inc-w5',
          reagentsAndBuffer:
            'TaqMan Fast Advanced Master Mix with a PCSK9 FAM probe and a GAPDH VIC endogenous control; human PCSK9 sandwich ELISA on conditioned medium',
        },
      ],
    },
    keyAudits: [
      {
        id: 'inc-a1',
        category: 'measured',
        title: 'ORION-10 and ORION-11: 52.3% and 49.9% placebo-adjusted LDL-C reduction at day 510',
        laymanSummary:
          'Two trials, 3,178 patients between them, both showed LDL cholesterol about half of what the placebo group reached, held there for 17 months on two injections a year.',
        technicalDetails:
          'Randomised, double-blind, placebo-controlled. Baseline LDL-C 104.7 mg/dL (ORION-10, n=1561) and 105.5 mg/dL (ORION-11, n=1617). Day-510 reduction 52.3% (95% CI 48.8 to 55.7) and 49.9% (95% CI 46.6 to 53.1); time-adjusted reductions 53.8% and 49.2%; P<0.001 for all comparisons against placebo.',
        evidenceSource: 'Ray KK et al., N Engl J Med 2020;382:1507-1519',
        doi: '10.1056/NEJMoa1912387',
        measuredMetric: 'Percentage change in serum LDL-C at day 510 versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'inc-a2',
        category: 'inferred',
        title: 'Cardiovascular benefit is inferred from LDL biology, not measured for this drug',
        laymanSummary:
          'No completed trial has shown that inclisiran prevents heart attacks or strokes. The argument that it does is borrowed from statins, where lowering LDL did reduce events.',
        technicalDetails:
          'ORION-4 (NCT03705234, 16,124 participants) is active but not recruiting with a primary completion date of October 2026, and VICTORION-2-PREVENT (NCT05030428, 17,004 participants) runs to October 2027. Neither has reported. The only cardiovascular signal is a post-hoc patient-level pooling of the phase 3 lipid trials, in which composite MACE fell (OR 0.74, 95% CI 0.58 to 0.94) while the individual components did not reach significance: myocardial infarction OR 0.80 (0.50 to 1.27) and stroke OR 0.86 (0.41 to 1.81). Drug and Therapeutics Bulletin reviewed that analysis under the headline "No meaningful cardiovascular outcome data for inclisiran".',
        evidenceSource:
          'Ray KK et al., Eur Heart J 2023;44:129-138; commentary in Drug Ther Bull 2023;61:86',
        doi: '10.1093/eurheartj/ehac594',
        inferredClaim:
          'That a 50% LDL-C reduction with inclisiran translates into the event reduction seen with statins and PCSK9 antibodies',
        auditFlag: 'caution',
      },
      {
        id: 'inc-a3',
        category: 'failed',
        title: 'ORION-5: no LDL-C reduction in adults with homozygous familial hypercholesterolemia',
        laymanSummary:
          'In the most severe inherited form of high cholesterol, inclisiran wiped out PCSK9 exactly as designed and LDL cholesterol did not move.',
        technicalDetails:
          'Phase 3, 56 patients, randomised 2:1. Placebo-corrected change in LDL-C from baseline to day 150 was -1.68% (95% CI -29.19 to 25.83; P=0.90), while PCSK9 fell 60.6% (P<0.0001). Apolipoprotein B, total cholesterol and non-HDL-C were likewise unchanged. The mechanism needs a working LDL receptor to act on, and in HoFH there is little or none.',
        evidenceSource: 'Raal F et al., Circulation 2024;149:354-362',
        doi: '10.1161/CIRCULATIONAHA.122.063460',
        measuredMetric: 'Placebo-corrected percentage change in LDL-C at day 150',
        auditFlag: 'verified',
      },
      {
        id: 'inc-a4',
        category: 'conclusion_shift',
        title: 'Adolescent HoFH was later approved on 13 patients, after the adult HoFH trial failed',
        laymanSummary:
          'The adult trial in homozygous familial hypercholesterolemia found nothing. A 13-patient adolescent trial found a 33% reduction, and the label now covers 12-year-olds with the same condition.',
        technicalDetails:
          'ORION-13 randomised 13 adolescents aged 12 to under 18 with genetically confirmed HoFH, explicitly excluding LDLR null/null genotypes. Placebo-adjusted LDL-C change to day 330 was -33.3% (95% CI -59.2 to -7.3). The exclusion is the whole story: patients with some residual receptor function respond, and the adult ORION-5 population included those with none. The current FDA label carries the pediatric HoFH indication.',
        evidenceSource: 'Wiegman A et al., Circulation 2025 (ORION-13)',
        doi: '10.1161/CIRCULATIONAHA.124.073233',
        auditFlag: 'caution',
      },
      {
        id: 'inc-a5',
        category: 'failed',
        title: 'The first FDA submission was refused in December 2020 over a manufacturing inspection',
        laymanSummary:
          'The FDA turned inclisiran down a year before approving it, and not because of the science.',
        technicalDetails:
          'Novartis received a complete response letter on 18 December 2020 citing unresolved facility inspection-related conditions at a third-party manufacturing site that the agency had been unable to inspect during COVID-19 travel restrictions. The letter raised no efficacy or safety concerns. The European Commission had granted marketing authorisation one week earlier, on 11 December 2020; the FDA approved on 22 December 2021.',
        evidenceSource: 'Novartis media release, 18 December 2020',
        auditFlag: 'verified',
      },
      {
        id: 'inc-a6',
        category: 'measured',
        title: 'ORION-9: 47.9 percentage-point separation from placebo in heterozygous FH',
        laymanSummary:
          'In inherited high cholesterol with one bad copy of the gene, LDL fell 39.7% on inclisiran and rose 8.2% on placebo.',
        technicalDetails:
          'Phase 3, 482 patients with HeFH, baseline LDL-C 153 mg/dL. Day-510 change was -39.7% (95% CI -43.7 to -35.7) with inclisiran and +8.2% (95% CI 4.3 to 12.2) with placebo, a between-group difference of -47.9 percentage points (95% CI -53.5 to -42.3; P<0.001). Reductions held across FH genotypes.',
        evidenceSource: 'Raal FJ et al., N Engl J Med 2020;382:1520-1530',
        doi: '10.1056/NEJMoa1913805',
        measuredMetric: 'Percentage change in LDL-C at day 510 versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'inc-a7',
        category: 'measured',
        title: 'ORION-3: LDL-C lowering held for four years of open-label dosing',
        laymanSummary:
          'Patients who stayed on inclisiran for four years kept the reduction. The trial was open-label, so this shows durability, not a fresh comparison against placebo.',
        technicalDetails:
          'Four-year open-label extension of the phase 2 ORION-1 trial across 52 sites in five countries (NCT03060577). The inclisiran-only arm continued twice-yearly 300 mg inclisiran sodium; the switching arm received evolocumab to day 360 before transitioning. Endpoints ran to day 1440. No placebo control existed after ORION-1 ended.',
        evidenceSource: 'Ray KK et al., Lancet Diabetes Endocrinol 2023;11:109-119',
        doi: '10.1016/S2213-8587(22)00353-9',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Subcutaneous dose, then a sugar tag finds the liver',
        laymanDesc:
          'The injection goes under the skin. Three sugar molecules on the end of the drug act as a postcode that only liver cells read, so almost all of it ends up where it is meant to be.',
        molecularDetail:
          'The triantennary N-acetylgalactosamine ligand (L96) is attached to the 3\' terminus of the 21-mer sense strand and binds the asialoglycoprotein receptor, which is expressed at roughly a million copies per hepatocyte and recycles every 15 minutes.',
        iconName: 'Target',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Pulled inside and slowly released',
        laymanDesc:
          'The liver cell swallows the drug in a bubble. Most of it is broken down, but a small fraction leaks into the cell body and is held there for months, which is why one injection lasts half a year.',
        molecularDetail:
          'Clathrin-mediated endocytosis delivers the duplex to the endosome. A small proportion escapes into the cytoplasm; the rest forms a slowly released intracellular depot, which is what decouples the plasma half-life of hours from the pharmacodynamic duration of months.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The guide strand is loaded into the cell\'s own cutting machine',
        laymanDesc:
          'The two strands separate. One is discarded; the other is loaded into a protein complex the cell already uses to silence its own genes.',
        molecularDetail:
          'The 23-nucleotide antisense strand is loaded into Argonaute 2 within the RNA-induced silencing complex. The sense strand is cleaved and discarded. The 2\'-F and 2\'-OMe ribose modifications and the six terminal phosphorothioate linkages are what let the strand survive nuclease attack long enough to be loaded.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'PCSK9 messenger RNA is cut, and the complex moves on',
        laymanDesc:
          'The loaded complex hunts down the instructions for PCSK9 and cuts them. It then releases the pieces and goes looking for the next copy, which is why so little drug does so much.',
        molecularDetail:
          'The guide strand base-pairs with a conserved site in the 3\' untranslated region of PCSK9 mRNA with full complementarity, and Argonaute 2 catalyses endonucleolytic cleavage between the nucleotides paired to guide positions 10 and 11. The cleaved transcript is degraded by cellular exonucleases and the complex is recycled — a catalytic, not stoichiometric, mechanism.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'LDL receptors survive, and LDL cholesterol falls',
        laymanDesc:
          'With less PCSK9 around, the liver keeps its cholesterol catchers instead of destroying them. More catchers means more LDL cleared from the blood.',
        molecularDetail:
          'Reduced PCSK9 secretion means fewer LDL receptors are routed to lysosomal degradation after endocytosis, so surface receptor density rises and hepatic LDL particle clearance increases. In ORION-10 and ORION-11 this produced a 52.3% and 49.9% placebo-adjusted LDL-C reduction at day 510.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ORION-9 (NCT03397121)',
        phase: 'Phase 3',
        sampleSize: 482,
        primaryEndpoint: 'Percentage change in LDL-C from baseline to day 510 in heterozygous FH',
        endpointMet: true,
        statisticalPValue: 'P < 0.001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ORION-10 (NCT03399370)',
        phase: 'Phase 3',
        sampleSize: 1561,
        primaryEndpoint: 'Percentage change in LDL-C from baseline to day 510',
        endpointMet: true,
        statisticalPValue: 'P < 0.001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ORION-11 (NCT03400800)',
        phase: 'Phase 3',
        sampleSize: 1617,
        primaryEndpoint: 'Percentage change in LDL-C from baseline to day 510',
        endpointMet: true,
        statisticalPValue: 'P < 0.001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ORION-5 (homozygous FH)',
        phase: 'Phase 3',
        sampleSize: 56,
        primaryEndpoint: 'Percentage change in LDL-C from baseline to day 150',
        endpointMet: false,
        statisticalPValue: 'P = 0.90',
        unreportedAdverseSignals:
          'None specific to this trial; adverse events did not differ from placebo. The failure was of efficacy, not safety.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ORION-4 (NCT03705234)',
        phase: 'Phase 3 cardiovascular outcome trial',
        sampleSize: 16124,
        primaryEndpoint: 'Number of participants with a major adverse cardiovascular event',
        endpointMet: false,
        statisticalPValue: 'Not reported — primary completion date October 2026',
        unreportedAdverseSignals:
          'The trial has not reported. `endpointMet: false` here means "no result exists yet", not "the endpoint was missed".',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'VICTORION-2-PREVENT (NCT05030428)',
        phase: 'Phase 3 cardiovascular outcome trial',
        sampleSize: 17004,
        primaryEndpoint: 'Time to first occurrence of 3-point major adverse cardiovascular events',
        endpointMet: false,
        statisticalPValue: 'Not reported — primary completion date 13 October 2027',
        unreportedAdverseSignals:
          'The trial has not reported. `endpointMet: false` here means "no result exists yet", not "the endpoint was missed".',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '52.3% and 49.9% placebo-adjusted LDL-C reduction at day 510 across 3,178 randomised patients',
        '47.9 percentage-point separation from placebo in 482 patients with heterozygous familial hypercholesterolemia',
        'Injection-site adverse events in 2.6% and 4.7% of inclisiran patients versus 0.9% and 0.5% on placebo, all mild and none persistent',
        'PCSK9 protein reduction of about 60% even in patients whose LDL-C did not change',
      ],
      unsupportedInferences: [
        'That inclisiran reduces heart attacks, strokes or cardiovascular death — no completed trial has measured this',
        'That two injections a year is equivalent to a daily statin on outcomes, when only one of the two has outcome data',
        'That the exploratory pooled MACE signal (OR 0.74) is an outcome result; it is a post-hoc analysis of trials designed and powered for a lipid endpoint',
      ],
      whatFailedInitially: [
        'ORION-5: no LDL-C change in adults with homozygous familial hypercholesterolemia despite a 60.6% PCSK9 reduction',
        'The December 2020 FDA complete response letter, caused by an uninspected third-party manufacturing site rather than by the data',
      ],
      realWorldOutcome: [
        'Twice-yearly clinic administration converts adherence from a patient behaviour into a scheduling problem, which is the practical argument for the drug',
        'The LDL-C effect held through four years of open-label dosing in ORION-3, without a concurrent placebo group',
      ],
    },
    deliverySystem: {
      type: 'GalNAc-conjugated siRNA, subcutaneous prefilled syringe',
      description:
        'A single-dose prefilled syringe containing 284 mg of inclisiran in 1.5 mL, given by a healthcare professional at day 1, month 3, and every 6 months thereafter. No lipid nanoparticle and no premedication: the triantennary GalNAc ligand does the targeting on its own.',
      safetyProfile:
        'The FDA label carries one warning, hypersensitivity reactions including anaphylaxis and angioedema, and contraindicates the drug after a prior serious reaction. Adverse reactions at 3% or more in trials were injection-site reaction, arthralgia and bronchitis. No hepatic or renal toxicity signal was identified in the phase 3 programme.',
    },
    commonQuestions: [
      {
        q: 'Does inclisiran prevent heart attacks?',
        a: 'Nobody knows yet. It has been shown to lower LDL cholesterol by about half and to keep it there for six months at a time. The two trials designed to answer the heart-attack question — ORION-4 with 16,124 participants and VICTORION-2-PREVENT with 17,004 — are still running, with primary completion dates of October 2026 and October 2027. Until one of them reports, any statement that inclisiran prevents events is an extrapolation from what LDL lowering did for other drug classes.',
        auditNote:
          'This is the single largest gap on this page, and it is the reason the confidence score sits below the LDL evidence would otherwise justify.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no peer-reviewed cost-of-production estimate exists for a GalNAc-conjugated siRNA. The nearest published figure is from 1999 and covers unconjugated phosphorothioate oligonucleotides at "less than US$300 per gram", which is a different molecule made by a different process. Converting that into a per-dose cost for inclisiran would mean this page inventing a number, so it does not. The list price is quoted where a peer-reviewed source states it.',
      },
      {
        q: 'It failed in homozygous familial hypercholesterolemia but is approved for it in teenagers. How?',
        a: 'The two populations are not the same. ORION-5 enrolled 56 adults with HoFH including patients with no functional LDL receptor at all, and found nothing — a 1.68% placebo-corrected change with P=0.90. ORION-13 enrolled 13 adolescents and explicitly excluded LDLR null/null genotypes, and found a 33.3% placebo-adjusted reduction. Inclisiran works by preserving LDL receptors, so a patient with no receptors has nothing to preserve.',
        auditNote:
          'A 13-patient randomised trial supporting a label indication is a small evidence base, and the confidence interval (-59.2% to -7.3%) is correspondingly wide.',
      },
      {
        q: 'Is twice a year better than a daily statin?',
        a: 'For adherence, plainly yes — a dose given in a clinic cannot be forgotten. For outcomes, the comparison has never been made. Every ORION trial gave inclisiran on top of the maximum tolerated statin dose, so the drug has been tested as an addition, not as a replacement, and no trial has randomised inclisiran against a statin on any clinical endpoint.',
      },
      {
        q: 'How can one injection last six months when the drug clears from blood in hours?',
        a: 'Because the two things are not connected. Inclisiran leaves the bloodstream within hours, but the fraction taken up by liver cells forms an intracellular depot that releases slowly into the cytoplasm, and the loaded silencing complex acts catalytically — one complex cuts many messenger RNAs. The plasma half-life describes disappearance from blood; the six-month effect describes what is still happening inside the hepatocyte.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Ray KK et al. Two Phase 3 Trials of Inclisiran in Patients with Elevated LDL Cholesterol. N Engl J Med 2020;382:1507-1519',
        identifier: '10.1056/NEJMoa1912387',
        kind: 'doi',
      },
      {
        label:
          'Raal FJ et al. Inclisiran for the Treatment of Heterozygous Familial Hypercholesterolemia. N Engl J Med 2020;382:1520-1530',
        identifier: '10.1056/NEJMoa1913805',
        kind: 'doi',
      },
      {
        label:
          'Raal F et al. Efficacy, Safety, and Tolerability of Inclisiran in Patients With Homozygous Familial Hypercholesterolemia: ORION-5. Circulation 2024',
        identifier: '10.1161/CIRCULATIONAHA.122.063460',
        kind: 'doi',
      },
      {
        label:
          'Wiegman A et al. Efficacy and Safety of Inclisiran in Adolescents With Homozygous Familial Hypercholesterolemia: ORION-13. Circulation 2025',
        identifier: '10.1161/CIRCULATIONAHA.124.073233',
        kind: 'doi',
      },
      {
        label:
          'Ray KK et al. Inclisiran and cardiovascular events: a patient-level analysis of phase III trials. Eur Heart J 2023;44:129-138',
        identifier: '10.1093/eurheartj/ehac594',
        kind: 'doi',
      },
      {
        label: 'No meaningful cardiovascular outcome data for inclisiran. Drug Ther Bull 2023;61:86',
        identifier: '10.1136/dtb.2023.000024',
        kind: 'doi',
      },
      {
        label:
          'Ray KK et al. Long-term efficacy and safety of inclisiran (ORION-3). Lancet Diabetes Endocrinol 2023;11:109-119',
        identifier: '10.1016/S2213-8587(22)00353-9',
        kind: 'doi',
      },
      {
        label: 'ORION-4: A Randomized Trial Assessing the Effects of Inclisiran on Clinical Outcomes',
        identifier: 'NCT03705234',
        kind: 'nct',
      },
      {
        label: 'VICTORION-2-PREVENT: Inclisiran to Prevent CV Events in Established CV Disease',
        identifier: 'NCT05030428',
        kind: 'nct',
      },
      {
        label: 'LEQVIO (inclisiran) injection, US prescribing information — DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6fc0afca-4513-4c35-b594-6544aee29a44',
        kind: 'regulatory',
      },
      {
        label:
          'Novartis receives complete response letter from U.S. FDA for inclisiran, 18 December 2020',
        identifier:
          'https://www.globenewswire.com/news-release/2020/12/18/2148121/0/en/Novartis-receives-complete-response-letter-from-U-S-FDA-for-inclisiran',
        kind: 'url',
      },
      {
        label:
          'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024 — Table 1 sequences from the FDA inserts',
        identifier: '10.1124/molpharm.124.000895',
        kind: 'doi',
      },
      {
        label:
          'Sehgal I, Eells K, Hudson I. A Comparison of Currently Approved siRNA Medications to Alternative Treatments by Costs, Indications, and Medicaid Coverage. Pharmacy 2024;12:58',
        identifier: '10.3390/pharmacy12020058',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC), 2026 file, prices effective 17 December 2025',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label:
          'Dose-dependent LDL-cholesterol lowering effect by plant stanol ester consumption. Lipids Health Dis 2012;11:140',
        identifier: '10.1186/1476-511X-11-140',
        kind: 'doi',
      },
      {
        label:
          'Psyllium supplementation and lipid profiles: systematic review and dose-response meta-analysis. Genes Nutr 2025',
        identifier: '10.1186/s12263-025-00786-5',
        kind: 'doi',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Patisiran — the first RNAi therapeutic ever approved, and the first to be refused a second time.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'patisiran',
    name: 'Patisiran',
    tradeName: 'Onpattro',
    sponsor: 'Alnylam Pharmaceuticals',
    targetGene: 'TTR',
    targetProtein: 'Transthyretin',
    modality: 'siRNA (Small Interfering RNA)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2018,
    indication:
      'Polyneuropathy of hereditary transthyretin-mediated amyloidosis in adults',
    patientFriendlyIndication: 'Nerve damage caused by inherited transthyretin amyloidosis',
    conditionContext: {
      conditionExplainer:
        'Transthyretin is a liver protein that normally travels as a four-part complex. A mutation makes the complex come apart, and the loose pieces misfold and stack into amyloid fibrils that deposit in nerves and in the heart. Once deposited, they are not cleared.',
      whyItMatters:
        'Untreated hereditary ATTR polyneuropathy is progressive and fatal, typically within about a decade of symptom onset. Before 2018 the only disease-modifying option was liver transplantation.',
      whoTakesThis:
        'Adults with a confirmed TTR variant and established polyneuropathy. The drug does not remove amyloid that is already there; it stops the supply of new material.',
      clinicalGoals:
        'Halt or reverse progression of the neuropathy score, preserve walking speed and nutritional status.',
    },
    oneSentenceVerdict:
      'The first RNAi therapy ever approved: a lipid nanoparticle drops a TTR-silencing siRNA into liver cells, and in APOLLO the neuropathy score improved by 6.0 points while placebo worsened by 28.0, a 34-point separation at 18 months.',
    laymanHowItWorks:
      'A faulty version of a liver protein called transthyretin comes apart in the blood and the fragments clump into deposits that strangle nerves. Patisiran is a short RNA wrapped in a fat bubble; the bubble is absorbed by the liver, and the RNA inside tells liver cells to shred the instructions for making transthyretin. Less protein made means less new deposit forming, and in the trial the nerve damage stopped getting worse and modestly improved.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 82,
    anatomicalSite: 'Hepatocyte cytoplasm (liver)',
    substitutes: {
      summary:
        'Transthyretin stabilisers (tafamidis, acoramidis, off-label diflunisal) hold the protein complex together instead of stopping its manufacture, and inotersen silences the same gene with a different chemistry. No food or supplement has been shown to affect transthyretin amyloid deposition.',
      conventionalRx: [
        {
          name: 'Tafamidis (Vyndaqel / Vyndamax)',
          class: 'Transthyretin tetramer stabiliser, oral',
          howItCompares:
            'Binds the transthyretin tetramer and slows its dissociation rather than reducing how much is made. Oral daily capsule, approved for the cardiomyopathy in the United States.',
          typicalCost:
            'About US$263,844 per year in the United States (Sehgal, Eells & Hudson, Pharmacy 2024)',
          prosAndCons:
            'Pros: oral, no infusion, established cardiac outcome data. Cons: slows rather than stops the supply of misfolding protein.',
        },
        {
          name: 'Inotersen (Tegsedi)',
          class: 'Antisense oligonucleotide against TTR, subcutaneous',
          howItCompares:
            'Knocks down the same transcript by RNase H recruitment rather than RNA interference. Weekly self-injection.',
          typicalCost:
            'About US$389,376 per year in the United States (Sehgal, Eells & Hudson, Pharmacy 2024)',
          prosAndCons:
            'Pros: no infusion centre required. Cons: requires platelet and renal monitoring; in the same peer-reviewed FAERS comparison, decreased platelet count was its most common reported reaction category.',
        },
        {
          name: 'Diflunisal (generic, off-label)',
          class: 'NSAID with transthyretin-stabilising activity',
          howItCompares:
            'A generic anti-inflammatory that happens to bind the transthyretin tetramer. Used off-label where the branded stabilisers are unaffordable.',
          typicalCost:
            'US$1.17 per 500 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 17 December 2025)',
          prosAndCons:
            'Pros: several orders of magnitude cheaper than every other option here. Cons: NSAID renal, gastrointestinal and fluid-retention risk in a population that often has cardiac and renal involvement.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Vitamin A supplementation at the recommended daily allowance',
          action:
            'Take vitamin A at the recommended daily allowance for the duration of treatment, as the label directs, and report any night-vision or dry-eye symptoms.',
          patientImpact:
            'Transthyretin is the carrier for retinol-binding protein, so silencing it lowers serum vitamin A. The label instructs supplementation at the RDA and warns against taking more to chase a normal serum level.',
          clinicalPrecaution:
            'Higher-than-RDA doses are specifically advised against in the FDA label. Ocular symptoms should be referred to an ophthalmologist rather than self-managed.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'AUGGAAUACUCUUGGUUACTT',
      chemicalFormula: 'C412H480N148Na40O290P40',
      molecularWeight: '14,304 Da (patisiran sodium, per the FDA label)',
      structureSource: {
        label:
          'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024 (Table 1, sequences from the FDA inserts); molecular formula and mass from the ONPATTRO label',
        identifier: '10.1124/molpharm.124.000895',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 'pat-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amidite and lipid excipient release testing',
          description:
            'Release-test the four ionisable and helper lipids named in the label alongside the phosphoramidites. Lipid identity matters as much as oligonucleotide identity here, because the particle is the delivery mechanism.',
          reagentsAndBuffer:
            'DLin-MC3-DMA, DSPC, cholesterol USP and PEG2000-C-DMG reference standards; 2\'-OMe and unmodified phosphoramidites; Karl Fischer titration and HPLC-CAD purity',
        },
        {
          id: 'pat-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase assembly of the 21-mer sense and antisense strands',
          description:
            'Assemble both strands with the 2\'-OMe pattern the label specifies and the 3\'-terminal deoxythymidine overhangs, then cleave and deprotect. Patisiran carries no phosphorothioate backbone and no conjugate — the particle, not the chemistry, does the protecting.',
          dependsOnStepId: 'pat-w1',
          reagentsAndBuffer:
            '5-(ethylthio)-1H-tetrazole activator in acetonitrile; 3% dichloroacetic acid in toluene; acetic anhydride / N-methylimidazole capping; 0.02 M iodine in THF/pyridine/water; concentrated aqueous ammonia for cleavage and deprotection',
        },
        {
          id: 'pat-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange purification and duplex annealing',
          description:
            'Purify each strand to full length, desalt, then anneal equimolar strands to the duplex and confirm complete duplex formation before any lipid is introduced.',
          dependsOnStepId: 'pat-w2',
          reagentsAndBuffer:
            'Strong anion-exchange resin, 20 mM sodium phosphate pH 8.5 with a sodium bromide gradient; 3 kDa tangential-flow desalting; annealing in phosphate-buffered saline from 90 degrees C',
        },
        {
          id: 'pat-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Lipid nanoparticle encapsulation by rapid ethanol dilution',
          description:
            'Mix the lipids in ethanol against the duplex in acidic buffer so the ionisable lipid is protonated and captures the RNA, then raise the pH to neutralise the particle surface and dialyse into the final buffer.',
          dependsOnStepId: 'pat-w3',
          reagentsAndBuffer:
            'DLin-MC3-DMA, DSPC, cholesterol and PEG2000-C-DMG in ethanol; 25 mM sodium acetate pH 4.0 aqueous phase; microfluidic or T-junction rapid mixing; dialysis into phosphate-buffered saline at pH 7.4; dynamic light scattering and RiboGreen encapsulation efficiency',
        },
        {
          id: 'pat-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'TTR transcript and protein knockdown',
          description:
            'Dose primary human hepatocytes with the finished particle and quantify TTR mRNA by RT-qPCR and secreted transthyretin by ELISA. Apolipoprotein E in the serum-containing medium is required, because it is the opsonin that routes the particle to the LDL receptor.',
          dependsOnStepId: 'pat-w4',
          reagentsAndBuffer:
            'Cryopreserved primary human hepatocytes in Williams\' E medium with serum; TaqMan Fast Advanced Master Mix with a TTR FAM probe and GAPDH control; human prealbumin (transthyretin) ELISA',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pat-a1',
        category: 'measured',
        title: 'APOLLO: 34.0-point separation on mNIS+7 at 18 months',
        laymanSummary:
          'The neuropathy score improved slightly on patisiran and got substantially worse on placebo. The gap between the two groups was 34 points on a 304-point scale.',
        technicalDetails:
          'Phase 3, 225 patients randomised 2:1 to intravenous patisiran 0.3 mg/kg every three weeks or placebo. Least-squares mean change in mNIS+7 was -6.0 (SE 1.7) with patisiran versus +28.0 (SE 2.6) with placebo, difference -34.0 points, P<0.001. Norfolk QOL-DN difference -21.1 points, P<0.001. Gait speed difference 0.31 m/s, P<0.001. Modified BMI difference 115.7, P<0.001.',
        evidenceSource: 'Adams D et al., N Engl J Med 2018;379:11-21',
        doi: '10.1056/NEJMoa1716153',
        measuredMetric: 'Change from baseline in mNIS+7 at 18 months',
        auditFlag: 'verified',
      },
      {
        id: 'pat-a2',
        category: 'failed',
        title: 'APOLLO-B met its endpoint and the FDA still refused the cardiomyopathy indication',
        laymanSummary:
          'In heart involvement, patisiran preserved about 15 metres of six-minute walking distance over a year. An FDA advisory committee voted 9 to 3 that this was worth it. The FDA disagreed and rejected the application.',
        technicalDetails:
          'APOLLO-B randomised 360 patients with hereditary or wild-type ATTR cardiac amyloidosis. The primary endpoint, change in 6-minute walk distance at 12 months, favoured patisiran by a Hodges-Lehmann median difference of 14.69 m (95% CI 0.69 to 28.69; P=0.02). KCCQ-OS differed by 3.7 points (95% CI 0.2 to 7.2; P=0.04). The second secondary endpoint, a composite of death, cardiovascular events and 6-minute walk change, showed no significant benefit. On 9 October 2023 Alnylam disclosed a complete response letter stating that clinical meaningfulness had not been established; the letter identified no safety, study-conduct, quality or manufacturing issue.',
        evidenceSource: 'Maurer MS et al., N Engl J Med 2023;389:1553-1565; Alnylam release, 9 October 2023',
        doi: '10.1056/NEJMoa2300757',
        inferredClaim:
          'That a statistically significant 6-minute walk difference is by itself a clinically meaningful cardiac benefit',
        auditFlag: 'contested',
      },
      {
        id: 'pat-a3',
        category: 'conclusion_shift',
        title: 'The lipid nanoparticle was superseded by a sugar tag within four years',
        laymanSummary:
          'Patisiran needs an intravenous infusion, a fat-bubble carrier and three premedications. Vutrisiran hits the same target with a subcutaneous injection four times a year. The delivery problem was solved, and the solution changed the drug class.',
        technicalDetails:
          'Patisiran requires 0.3 mg/kg intravenously every three weeks over roughly 80 minutes, with a corticosteroid, acetaminophen and antihistamines given first because infusion-related reactions occurred in about 20% of treated patients. GalNAc conjugation removed the particle, the infusion and the premedication entirely. In HELIOS-A, vutrisiran given subcutaneously every three months was non-inferior to within-study patisiran on transthyretin reduction.',
        evidenceSource:
          'ONPATTRO US prescribing information; Adams D et al., Amyloid 2023;30:1-9 (HELIOS-A)',
        doi: '10.1080/13506129.2022.2091985',
        auditFlag: 'verified',
      },
      {
        id: 'pat-a4',
        category: 'inferred',
        title: 'Silencing does not clear amyloid that is already deposited',
        laymanSummary:
          'The drug turns off the tap. It does not empty the sink. Improvement in the trial came from stopping new deposition, not from removing what had already accumulated.',
        technicalDetails:
          'Patisiran reduces hepatic transthyretin synthesis and therefore the circulating precursor pool. No endpoint in APOLLO or APOLLO-B measured regression of established amyloid deposits, and the mechanism provides no route to it. Patients whose organ damage is already advanced have less to gain, which is one plausible reading of the smaller cardiac effect in APOLLO-B.',
        evidenceSource: 'Adams D et al., N Engl J Med 2018;379:11-21',
        doi: '10.1056/NEJMoa1716153',
        inferredClaim:
          'That TTR knockdown reverses amyloid deposition rather than preventing further deposition',
        auditFlag: 'caution',
      },
      {
        id: 'pat-a5',
        category: 'measured',
        title: 'Serum vitamin A falls as a direct consequence of the mechanism',
        laymanSummary:
          'Transthyretin is the taxi that carries vitamin A around the body. Silencing it lowers vitamin A, and the label tells patients to supplement — but only at the normal daily amount.',
        technicalDetails:
          'Transthyretin binds retinol-binding protein 4, so reducing transthyretin reduces measured serum retinol. The FDA label instructs supplementation at the recommended daily allowance and explicitly warns against higher doses aimed at normalising the serum level, because the low reading reflects loss of carrier rather than deficiency of the vitamin. Ocular symptoms warrant ophthalmology referral.',
        evidenceSource: 'ONPATTRO US prescribing information, section 5.2',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Intravenous infusion of a fat-bubble carrier',
        laymanDesc:
          'The drug is given as an 80-minute drip, after steroids and antihistamines, because the fat bubble itself can provoke a reaction.',
        molecularDetail:
          'A lipid nanoparticle of DLin-MC3-DMA, DSPC, cholesterol and PEG2000-C-DMG carries the duplex. Premedication with a corticosteroid, acetaminophen and H1 and H2 antihistamines is mandated by the label; infusion-related reactions were reported in about 20% of treated patients versus 10% on placebo.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Coated with apolipoprotein E and taken up by the liver',
        laymanDesc:
          'In the bloodstream the bubble picks up a natural protein coat that the liver recognises as cargo, and gets pulled inside.',
        molecularDetail:
          'The PEG lipid sheds in circulation and apolipoprotein E adsorbs onto the exposed particle surface, making it a ligand for the hepatocyte LDL receptor. Uptake is therefore receptor-mediated but borrowed, rather than designed, targeting.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The ionisable lipid protonates and the RNA escapes the endosome',
        laymanDesc:
          'As the bubble is drawn into the acidic interior of the cell, the fat becomes electrically charged, breaks the bubble open and lets the RNA out.',
        molecularDetail:
          'Endosomal acidification protonates DLin-MC3-DMA, which then ion-pairs with anionic endosomal phospholipids and drives a lamellar-to-hexagonal phase transition that destabilises the membrane. Only a small percentage of internalised siRNA reaches the cytoplasm; the rest is degraded.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'TTR messenger RNA is cut in the untranslated tail',
        laymanDesc:
          'The RNA loads into the cell\'s silencing machinery, which finds the transthyretin instructions and cuts them, so no protein is made from that copy.',
        molecularDetail:
          'The 21-nucleotide antisense strand with its 3\' dTdT overhang loads into Argonaute 2 and directs cleavage of a genetically conserved site in the 3\' untranslated region shared by mutant and wild-type TTR mRNA, which is why the drug works on both variant and wild-type disease.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Circulating transthyretin falls and nerve decline stops',
        laymanDesc:
          'With far less of the faulty protein in the blood, new deposits stop forming. In the trial, nerve function stopped worsening and improved slightly, while untreated patients kept declining.',
        molecularDetail:
          'Reduced hepatic secretion lowers the circulating tetramer pool available for dissociation and fibrillogenesis. In APOLLO this produced a -6.0 versus +28.0 point mNIS+7 change at 18 months and a 0.31 m/s advantage in gait speed. Serum retinol falls in parallel because transthyretin is the retinol-binding protein carrier.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'APOLLO (NCT01960348)',
        phase: 'Phase 3',
        sampleSize: 225,
        primaryEndpoint: 'Change from baseline in mNIS+7 at 18 months',
        endpointMet: true,
        statisticalPValue: 'P < 0.001',
        unreportedAdverseSignals:
          'Infusion-related reactions in about 20% of treated patients versus 10% on placebo; all patients received premedication.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'APOLLO-B (NCT03997383)',
        phase: 'Phase 3',
        sampleSize: 360,
        primaryEndpoint: 'Change from baseline in 6-minute walk distance at 12 months',
        endpointMet: true,
        statisticalPValue: 'P = 0.02',
        unreportedAdverseSignals:
          'The endpoint was met statistically and the FDA still refused the indication on clinical meaningfulness. The second secondary composite endpoint showed no benefit.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '34.0-point mNIS+7 separation from placebo at 18 months in 225 randomised patients',
        '21.1-point advantage on the Norfolk quality-of-life score and 0.31 m/s on gait speed',
        '14.69 m median advantage in 6-minute walk distance at 12 months in ATTR cardiac amyloidosis',
        'Infusion-related reactions in roughly one patient in five, all under mandatory premedication',
      ],
      unsupportedInferences: [
        'That patisiran clears amyloid already deposited in nerve or heart tissue',
        'That the APOLLO-B walk-distance result establishes a clinically meaningful cardiac benefit — the FDA reviewed exactly this claim and refused it',
        'That the neuropathy result transfers to patients with predominantly cardiac disease',
      ],
      whatFailedInitially: [
        'The October 2023 complete response letter for the ATTR cardiomyopathy indication, issued despite a 9-to-3 advisory committee vote in favour',
        'Unformulated siRNA does not reach hepatocytes at all; the lipid nanoparticle exists because naked duplexes are cleared renally before they arrive',
      ],
      realWorldOutcome: [
        'The infusion, the premedication and the every-three-weeks schedule are why the same target moved to a subcutaneous GalNAc conjugate within four years',
        'In a peer-reviewed FAERS comparison covering 2018 to 2023, death was the most common reported reaction category for both patisiran and its oral comparator tafamidis, at 7.8% and 27.6% of cases respectively',
      ],
    },
    deliverySystem: {
      type: 'Lipid nanoparticle, intravenous infusion',
      description:
        'A 2 mg/mL suspension given at 0.3 mg/kg every three weeks (30 mg fixed dose at 100 kg or more), filtered, diluted and infused over approximately 80 minutes by a healthcare professional. Premedication with a corticosteroid, acetaminophen and antihistamines is required.',
      safetyProfile:
        'Two labelled warnings: infusion-related reactions, and reduced serum vitamin A with a specific instruction to supplement only at the recommended daily allowance. The most frequent adverse reactions occurring in at least 10% of treated patients and at least 3% more often than placebo were upper respiratory tract infections and infusion-related reactions.',
    },
    commonQuestions: [
      {
        q: 'Will this reverse the nerve damage I already have?',
        a: 'Partly, and less than the headline suggests. In APOLLO the treated group improved by 6.0 points on a 304-point neuropathy scale while the placebo group worsened by 28.0. Most of the 34-point difference is decline that did not happen rather than damage that was repaired. The drug reduces the supply of misfolding protein; it has no mechanism for removing amyloid that is already deposited.',
      },
      {
        q: 'Why was it rejected for heart involvement if the trial worked?',
        a: 'Because meeting a statistical threshold and showing a meaningful benefit are different questions, and the FDA answered them differently. APOLLO-B produced a 14.69 m median advantage in six-minute walk distance at 12 months with P=0.02. An advisory committee voted 9 to 3 that the benefits outweighed the risks. The FDA issued a complete response letter on 9 October 2023 saying clinical meaningfulness had not been established. It raised no safety, quality or study-conduct concern.',
        auditNote:
          'This is the clearest example on the site of a regulator and its own advisory committee reaching opposite conclusions from identical data.',
      },
      {
        q: 'Why do I need vitamin A if my blood level is low?',
        a: 'The low reading is expected and is not by itself a deficiency. Transthyretin carries retinol-binding protein, so silencing transthyretin removes the carrier and the measured serum level falls. The label instructs supplementation at the recommended daily allowance and specifically advises against higher doses aimed at pushing the number back to normal.',
      },
      {
        q: 'Is patisiran better or worse than vutrisiran?',
        a: 'On transthyretin reduction, HELIOS-A found subcutaneous vutrisiran every three months non-inferior to within-study intravenous patisiran every three weeks. On convenience there is no contest. The two have never been compared head to head on a clinical outcome, and vutrisiran is the one with a completed cardiovascular outcome trial.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Adams D et al. Patisiran, an RNAi Therapeutic, for Hereditary Transthyretin Amyloidosis. N Engl J Med 2018;379:11-21',
        identifier: '10.1056/NEJMoa1716153',
        kind: 'doi',
      },
      {
        label:
          'Maurer MS et al. Patisiran Treatment in Patients with Transthyretin Cardiac Amyloidosis (APOLLO-B). N Engl J Med 2023;389:1553-1565',
        identifier: '10.1056/NEJMoa2300757',
        kind: 'doi',
      },
      {
        label:
          'Adams D et al. Efficacy and safety of vutrisiran (HELIOS-A). Amyloid 2023;30:1-9 — the non-inferiority comparison against within-study patisiran',
        identifier: '10.1080/13506129.2022.2091985',
        kind: 'doi',
      },
      {
        label: 'APOLLO: The Study of Patisiran for Hereditary ATTR Amyloidosis',
        identifier: 'NCT01960348',
        kind: 'nct',
      },
      {
        label: 'APOLLO-B: Patisiran in Transthyretin Amyloidosis with Cardiomyopathy',
        identifier: 'NCT03997383',
        kind: 'nct',
      },
      {
        label: 'ONPATTRO (patisiran) injection, US prescribing information — DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e87ec36f-b4b4-49d4-aea4-d4ffb09b0970',
        kind: 'regulatory',
      },
      {
        label:
          'Alnylam Announces Receipt of Complete Response Letter from U.S. FDA for the Patisiran sNDA in ATTR Cardiomyopathy, 9 October 2023',
        identifier: 'https://investors.alnylam.com/press-release?id=27741',
        kind: 'url',
      },
      {
        label:
          'Sehgal I, Eells K, Hudson I. A Comparison of Currently Approved siRNA Medications to Alternative Treatments. Pharmacy 2024;12:58',
        identifier: '10.3390/pharmacy12020058',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC), 2026 file, prices effective 17 December 2025',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label:
          'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024 — Table 1 sequences from the FDA inserts',
        identifier: '10.1124/molpharm.124.000895',
        kind: 'doi',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Vutrisiran — the only siRNA in this file with a completed mortality outcome trial.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'vutrisiran',
    name: 'Vutrisiran',
    tradeName: 'Amvuttra',
    sponsor: 'Alnylam Pharmaceuticals',
    targetGene: 'TTR',
    targetProtein: 'Transthyretin',
    modality: 'siRNA (Small Interfering RNA)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2022,
    indication:
      'Polyneuropathy of hereditary transthyretin-mediated amyloidosis in adults, and the cardiomyopathy of wild-type or hereditary transthyretin-mediated amyloidosis in adults to reduce cardiovascular mortality, cardiovascular hospitalisations and urgent heart failure visits',
    patientFriendlyIndication: 'Transthyretin amyloidosis affecting the nerves or the heart',
    conditionContext: {
      conditionExplainer:
        'Transthyretin circulates as a four-part complex made by the liver. In hereditary disease a mutation destabilises it, and in wild-type disease age alone does; either way the pieces misfold into amyloid fibrils that stiffen the heart muscle and damage peripheral nerves.',
      whyItMatters:
        'Wild-type ATTR cardiomyopathy is now recognised as a common and badly underdiagnosed cause of heart failure with preserved ejection fraction in older adults, and it is fatal without treatment.',
      whoTakesThis:
        'Adults with hereditary ATTR polyneuropathy, and adults with wild-type or hereditary ATTR cardiomyopathy, including those already taking a transthyretin stabiliser.',
      clinicalGoals:
        'Reduce death and cardiovascular events, preserve six-minute walk distance and quality of life, halt neuropathy progression.',
    },
    oneSentenceVerdict:
      'The same TTR-silencing mechanism as patisiran on a sugar tag instead of a fat bubble, and the only siRNA in this file that has reduced deaths: in HELIOS-B the hazard ratio for death or recurrent cardiovascular events was 0.72 across 655 patients.',
    laymanHowItWorks:
      'A liver protein called transthyretin falls apart and its fragments build up as stiff deposits in the heart and nerves. Vutrisiran is a short RNA carrying three sugar molecules that only liver cells recognise. Once inside, it directs the cell to destroy its own transthyretin instructions, so far less of the protein is made. One injection under the skin every three months keeps the level down, and over three years fewer treated patients died or were hospitalised for heart problems.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 90,
    anatomicalSite: 'Hepatocyte cytoplasm (liver)',
    substitutes: {
      summary:
        'Transthyretin stabilisers keep the complex from coming apart rather than reducing how much is made, and in HELIOS-B roughly two in five patients were taking one at baseline. Diflunisal is the cheap off-label version of the same idea. No food or supplement has been shown to affect amyloid deposition.',
      conventionalRx: [
        {
          name: 'Tafamidis (Vyndaqel / Vyndamax)',
          class: 'Transthyretin tetramer stabiliser, oral',
          howItCompares:
            'Slows dissociation of the tetramer instead of silencing its production. It is the incumbent in ATTR cardiomyopathy and was allowed as background therapy in HELIOS-B.',
          typicalCost:
            'About US$263,844 per year in the United States (Sehgal, Eells & Hudson, Pharmacy 2024)',
          prosAndCons:
            'Pros: oral, long cardiac track record. Cons: does not reduce the supply of misfolding precursor.',
        },
        {
          name: 'Patisiran (Onpattro)',
          class: 'siRNA against TTR, lipid nanoparticle, intravenous',
          howItCompares:
            'The same target and the same silencing mechanism, delivered by infusion every three weeks with mandatory premedication. HELIOS-A found subcutaneous vutrisiran non-inferior to it on transthyretin reduction.',
          typicalCost:
            'About US$375,561 per year in the United States (Sehgal, Eells & Hudson, Pharmacy 2024)',
          prosAndCons:
            'Pros: the longer neuropathy track record. Cons: infusion centre, premedication, and a refused cardiomyopathy application.',
        },
        {
          name: 'Diflunisal (generic, off-label)',
          class: 'NSAID with transthyretin-stabilising activity',
          howItCompares:
            'Binds the same site on the tetramer as the branded stabilisers, at a generic price.',
          typicalCost:
            'US$1.17 per 500 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 17 December 2025)',
          prosAndCons:
            'Pros: affordable where nothing else is. Cons: NSAID renal, gastrointestinal and fluid-retention risks in a heart-failure population.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Vitamin A at the recommended daily allowance, and nothing above it',
          action:
            'Supplement vitamin A at the recommended daily allowance while on treatment, and report night-vision or dry-eye symptoms rather than raising the dose.',
          patientImpact:
            'Serum vitamin A falls because transthyretin is its carrier protein. The label calls for RDA supplementation and warns against higher doses aimed at normalising the serum number.',
          clinicalPrecaution:
            'Ocular symptoms suggestive of vitamin A deficiency should be referred to an ophthalmologist.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'UCUUGGUUACAUGAAAUCCCAUC',
      chemicalFormula: 'C530H672F9N171Na43O323P43S6',
      molecularWeight:
        '17,290 Da (vutrisiran sodium); 16,345 Da for the free acid, per the FDA label',
      structureSource: {
        label:
          'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024 (Table 1, sequences from the FDA inserts); formula and mass from the AMVUTTRA label',
        identifier: '10.1124/molpharm.124.000895',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 'vut-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amidite and GalNAc support release testing',
          description:
            'Verify amidite purity and the loading of the triantennary GalNAc support. Vutrisiran carries nine fluorines against inclisiran\'s twelve, so the 2\'-F amidite lots are tracked separately by lot to keep the modification pattern reproducible.',
          reagentsAndBuffer:
            "2'-F and 2'-OMe A/C/G/U phosphoramidites, L96-GalNAc CPG support, anhydrous acetonitrile, 31P NMR and HPLC purity, Karl Fischer water determination",
        },
        {
          id: 'vut-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase assembly of the 21-mer sense and 23-mer antisense strands',
          description:
            'Assemble both strands, sulfurising the terminal linkages to give the six phosphorothioates in the finished molecule and oxidising the remainder, then cleave and deprotect.',
          dependsOnStepId: 'vut-w1',
          reagentsAndBuffer:
            '5-(ethylthio)-1H-tetrazole in acetonitrile; 3% dichloroacetic acid in toluene; acetic anhydride / N-methylimidazole capping; 0.02 M iodine in THF/pyridine/water; phenylacetyl disulfide for sulfurisation; concentrated aqueous ammonia',
        },
        {
          id: 'vut-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange HPLC and ultrafiltration',
          description:
            'Separate full-length product from truncations, pool on UV and mass criteria, and buffer-exchange into water for injection.',
          dependsOnStepId: 'vut-w2',
          reagentsAndBuffer:
            'Strong anion-exchange resin; 20 mM sodium phosphate pH 8.5 with 20% acetonitrile and a sodium bromide gradient; 3 kDa tangential-flow ultrafiltration',
        },
        {
          id: 'vut-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Duplex annealing and intact-mass confirmation',
          description:
            'Anneal the strands and confirm by ion-pair LC-MS that the intact mass matches the label formula, including the GalNAc ligand, nine fluorines and six sulfurs.',
          dependsOnStepId: 'vut-w3',
          reagentsAndBuffer:
            'Equimolar strands in phosphate-buffered saline, 90 degrees C with slow cooling; ion-pair reversed-phase LC-MS with hexafluoroisopropanol / triethylamine',
        },
        {
          id: 'vut-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Free uptake into primary human hepatocytes',
          description:
            'Dose hepatocytes without any transfection reagent so that entry depends entirely on the asialoglycoprotein receptor, with an asialofetuin block as the specificity control.',
          dependsOnStepId: 'vut-w4',
          reagentsAndBuffer:
            "Cryopreserved primary human hepatocytes, InVitroGRO CP thawing medium, Williams' E medium with GlutaMAX, collagen-coated plates, asialofetuin competitor",
        },
        {
          id: 'vut-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'TTR knockdown by RT-qPCR and prealbumin ELISA',
          description:
            'Quantify TTR transcript against a housekeeping control and secreted transthyretin in the medium, so that message and protein knockdown are read out on the same plate.',
          dependsOnStepId: 'vut-w5',
          reagentsAndBuffer:
            'TaqMan Fast Advanced Master Mix with a TTR FAM probe and a GAPDH VIC control; human prealbumin (transthyretin) sandwich ELISA',
        },
      ],
    },
    keyAudits: [
      {
        id: 'vut-a1',
        category: 'measured',
        title: 'HELIOS-B: fewer deaths and cardiovascular events over three years',
        laymanSummary:
          'Across 655 patients with amyloid heart disease, the treated group had a lower risk of dying or having a cardiovascular event. This is the outcome result the whole siRNA class had been missing.',
        technicalDetails:
          'Double-blind, 1:1 randomisation to vutrisiran 25 mg or placebo every 12 weeks for up to 36 months. Primary composite of all-cause death and recurrent cardiovascular events: hazard ratio 0.72 (95% CI 0.56 to 0.93; P=0.01) in the overall population and 0.67 (95% CI 0.49 to 0.93; P=0.02) in the monotherapy population. All-cause death through 42 months: hazard ratio 0.65 (95% CI 0.46 to 0.90; P=0.01). 125 vutrisiran and 159 placebo patients had at least one primary event. Six-minute walk distance favoured vutrisiran by 26.5 m (95% CI 13.4 to 39.6; P<0.001) and KCCQ-OS by 5.8 points (95% CI 2.4 to 9.2; P<0.001).',
        evidenceSource: 'Fontana M et al., N Engl J Med 2025;392:33-44',
        doi: '10.1056/NEJMoa2409134',
        measuredMetric:
          'Hazard ratio for the composite of all-cause death and recurrent cardiovascular events',
        auditFlag: 'verified',
      },
      {
        id: 'vut-a2',
        category: 'inferred',
        title: 'HELIOS-A had no placebo group of its own',
        laymanSummary:
          'The neuropathy trial that won the first approval was open-label and compared its results against the placebo patients from a different, earlier trial.',
        technicalDetails:
          'HELIOS-A was a global open-label study of 164 patients randomised 3:1 to subcutaneous vutrisiran or intravenous patisiran, with the placebo comparator supplied externally by the 77 placebo patients of the APOLLO trial. The primary mNIS+7 endpoint at 9 months was met with P=3.54 x 10^-12, and the significant improvements reported for quality of life, walk test and mNIS+7 at 18 months are all against that external control. The within-study comparison — vutrisiran versus patisiran on transthyretin reduction — was a non-inferiority analysis, not a placebo comparison.',
        evidenceSource: 'Adams D et al., Amyloid 2023;30:1-9',
        doi: '10.1080/13506129.2022.2091985',
        inferredClaim:
          'That the HELIOS-A neuropathy results carry the weight of a concurrently randomised placebo-controlled trial',
        auditFlag: 'caution',
      },
      {
        id: 'vut-a3',
        category: 'conclusion_shift',
        title:
          'The same target was refused for cardiomyopathy in 2023 and approved for it in 2025',
        laymanSummary:
          'The FDA turned down patisiran for amyloid heart disease because a walking-distance benefit was not convincing enough. Two years later it approved vutrisiran for the same disease, because the trial had measured deaths instead.',
        technicalDetails:
          'Patisiran received a complete response letter on 9 October 2023 for the ATTR cardiomyopathy indication after APOLLO-B met a 6-minute walk endpoint by 14.69 m. Vutrisiran received an efficacy supplement approval on 20 March 2025 (NDA 215515, supplement 6) on the strength of HELIOS-B, whose primary endpoint was death and recurrent cardiovascular events. The mechanism did not change between those two decisions; the endpoint did.',
        evidenceSource: 'Drugs@FDA NDA 215515 supplement 6, approved 20 March 2025; NDA 210922 history',
        auditFlag: 'verified',
      },
      {
        id: 'vut-a4',
        category: 'measured',
        title: 'Adverse event rates were essentially identical to placebo',
        laymanSummary:
          'Almost everyone in both arms had some adverse event, and serious events were slightly less common on the drug than on placebo.',
        technicalDetails:
          'In HELIOS-B, adverse events occurred in 99% of vutrisiran patients and 98% of placebo patients; serious adverse events in 62% and 67% respectively. The FDA label carries one warning, reduced serum vitamin A. Adverse reactions at 5% or more were pain in extremity, arthralgia, dyspnoea and decreased vitamin A.',
        evidenceSource:
          'Fontana M et al., N Engl J Med 2025;392:33-44; AMVUTTRA US prescribing information',
        doi: '10.1056/NEJMoa2409134',
        auditFlag: 'verified',
      },
      {
        id: 'vut-a5',
        category: 'inferred',
        title: 'Silencing prevents new deposition; it does not dissolve old amyloid',
        laymanSummary:
          'Turning off transthyretin production stops the raw material arriving. Nothing in the mechanism removes the deposits already in the heart.',
        technicalDetails:
          'Vutrisiran reduces hepatic transthyretin synthesis, lowering the circulating precursor pool available for fibrillogenesis. Neither HELIOS-A nor HELIOS-B used amyloid clearance as a primary endpoint, and the mechanism offers no clearance route. Benefit therefore depends on how much organ reserve remains at the time treatment starts.',
        evidenceSource: 'Fontana M et al., N Engl J Med 2025;392:33-44',
        doi: '10.1056/NEJMoa2409134',
        inferredClaim: 'That transthyretin silencing reverses established cardiac amyloid burden',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A quarterly injection under the skin, with a liver postcode attached',
        laymanDesc:
          'A 25 mg injection every three months. Three sugar molecules on the end act as an address label that only liver cells can read, so no infusion or premedication is needed.',
        molecularDetail:
          'Triantennary N-acetylgalactosamine (L96) on the 3\' terminus of the sense strand binds the hepatocyte asialoglycoprotein receptor. The enhanced stabilisation chemistry — nine 2\'-F residues, the remainder 2\'-OMe, six phosphorothioate linkages — is what allows a quarterly rather than a monthly interval.',
        iconName: 'Target',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Endocytosis and a slow-release intracellular depot',
        laymanDesc:
          'The liver cell pulls the drug inside. Most is destroyed, but a reservoir is retained and trickles out over months, which is why the injections are so far apart.',
        molecularDetail:
          'Clathrin-mediated endocytosis via ASGPR delivers the duplex to the endosome; the receptor recycles to the surface within minutes. A minority of the internalised duplex escapes into the cytoplasm, and the endolysosomal depot sustains loading long after plasma clearance is complete.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Guide strand loaded into Argonaute 2',
        laymanDesc:
          'The two strands separate; one is thrown away and the other is loaded into the machine the cell already uses to silence its own genes.',
        molecularDetail:
          'The 23-nucleotide antisense strand is loaded into Argonaute 2 within RISC and the passenger strand is cleaved and discarded. The 2\'-F and 2\'-OMe pattern is chosen so that the thermodynamic asymmetry favours loading the correct strand.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'TTR messenger RNA is cut, mutant and wild-type alike',
        laymanDesc:
          'The complex finds the transthyretin instructions and cuts them. It targets a stretch shared by the normal and the faulty gene, so it works in both inherited and age-related disease.',
        molecularDetail:
          'The guide directs Argonaute 2 to a conserved site in the 3\' untranslated region of TTR mRNA that is identical in variant and wild-type transcripts, and catalyses endonucleolytic cleavage. The complex is then recycled onto the next transcript.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer amyloid precursors, and measurably fewer deaths',
        laymanDesc:
          'With the supply cut off, less new amyloid forms. Over three years that showed up as fewer deaths and fewer cardiovascular hospitalisations.',
        molecularDetail:
          'Reduced circulating tetramer lowers the flux into fibril formation. In HELIOS-B this produced a hazard ratio of 0.72 for death or recurrent cardiovascular events and 0.65 for all-cause death through 42 months, alongside a 26.5 m preservation of six-minute walk distance.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'HELIOS-A (NCT03759379)',
        phase: 'Phase 3, open-label with external placebo',
        sampleSize: 164,
        primaryEndpoint: 'Change from baseline in mNIS+7 at 9 months versus external placebo',
        endpointMet: true,
        statisticalPValue: 'P = 3.54 x 10^-12',
        unreportedAdverseSignals:
          'The placebo comparator came from the earlier APOLLO trial rather than from concurrent randomisation.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'HELIOS-B (NCT04153149)',
        phase: 'Phase 3',
        sampleSize: 655,
        primaryEndpoint:
          'Composite of death from any cause and recurrent cardiovascular events over up to 36 months',
        endpointMet: true,
        statisticalPValue: 'P = 0.01 (hazard ratio 0.72, 95% CI 0.56 to 0.93)',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Hazard ratio 0.72 for death or recurrent cardiovascular events across 655 randomised patients',
        'Hazard ratio 0.65 for all-cause death through 42 months',
        '26.5 m preservation of six-minute walk distance and 5.8 points on the KCCQ overall summary',
        'Non-inferiority to intravenous patisiran on transthyretin reduction within HELIOS-A',
      ],
      unsupportedInferences: [
        'That vutrisiran clears amyloid already deposited in the heart',
        'That the HELIOS-A neuropathy result rests on a concurrent placebo group — the placebo data came from a different trial',
        'That the cardiomyopathy result can be read as superiority over tafamidis; HELIOS-B allowed tafamidis as background therapy and never randomised against it',
      ],
      whatFailedInitially: [
        'The lipid-nanoparticle route this molecule replaced required infusion, premedication and a three-weekly schedule',
        'The FDA refused the same mechanism for cardiomyopathy in 2023 when the evidence was a walk-distance endpoint rather than a mortality endpoint',
      ],
      realWorldOutcome: [
        'One subcutaneous injection every three months, given by a healthcare professional, removes the infusion centre from the treatment pathway entirely',
        'In the FAERS comparison covering 2022 to 2023, vutrisiran had 87 reported adverse event cases and 11 reported deaths — a small denominator, since the drug had only just launched',
      ],
    },
    deliverySystem: {
      type: 'GalNAc-conjugated siRNA, subcutaneous prefilled syringe',
      description:
        '25 mg in 0.5 mL, injected subcutaneously once every three months by a healthcare professional. No lipid carrier, no infusion, no premedication.',
      safetyProfile:
        'One labelled warning: reduced serum vitamin A, with instructions to supplement at the recommended daily allowance and not above it. Adverse reactions at 5% or more were pain in extremity, arthralgia, dyspnoea and decreased vitamin A. In HELIOS-B serious adverse events were slightly less frequent on drug (62%) than on placebo (67%).',
    },
    commonQuestions: [
      {
        q: 'Does vutrisiran actually keep people alive longer?',
        a: 'In HELIOS-B, yes, on the trial timescale. All-cause death through 42 months had a hazard ratio of 0.65 (95% CI 0.46 to 0.90; P=0.01), and the primary composite of death and recurrent cardiovascular events had a hazard ratio of 0.72. That makes it the only drug on this page with a completed mortality result, and it is the reason its confidence score is the highest here.',
      },
      {
        q: 'Should I stop tafamidis if I start vutrisiran?',
        a: 'HELIOS-B does not answer that. Patients already on tafamidis were allowed to continue, and the trial reported the overall population and a separate monotherapy population — those not taking tafamidis at baseline. Both showed benefit against placebo. What was never done is a randomised comparison of vutrisiran against tafamidis, or of the combination against either alone.',
        auditNote:
          'A benefit in a population where 40% are on background therapy is not evidence about whether to remove that therapy.',
      },
      {
        q: 'Why did the neuropathy trial not have a placebo group?',
        a: 'HELIOS-A was open-label and randomised 164 patients 3:1 to vutrisiran or patisiran, using the 77 placebo patients from the earlier APOLLO trial as the comparator. Cross-trial controls carry real risks — different eras, different sites, different background care — and every "versus placebo" number from HELIOS-A inherits them. The cardiomyopathy trial, HELIOS-B, was properly double-blind and placebo-controlled.',
      },
      {
        q: 'Will it dissolve the amyloid already in my heart?',
        a: 'No, and nothing in the mechanism could. Vutrisiran reduces how much transthyretin the liver makes, which cuts off the supply of new fibril material. Deposits already laid down are not targeted. This is why the benefit depends heavily on how much heart and nerve function remains when treatment begins.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'Fontana M et al. Vutrisiran in Patients with Transthyretin Amyloidosis with Cardiomyopathy (HELIOS-B). N Engl J Med 2025;392:33-44',
        identifier: '10.1056/NEJMoa2409134',
        kind: 'doi',
      },
      {
        label:
          'Adams D et al. Efficacy and safety of vutrisiran for hATTR amyloidosis with polyneuropathy (HELIOS-A). Amyloid 2023;30:1-9',
        identifier: '10.1080/13506129.2022.2091985',
        kind: 'doi',
      },
      { label: 'HELIOS-A', identifier: 'NCT03759379', kind: 'nct' },
      { label: 'HELIOS-B', identifier: 'NCT04153149', kind: 'nct' },
      {
        label: 'AMVUTTRA (vutrisiran) injection, US prescribing information — DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8db0facb-81b6-4006-9239-27dc6409c5d3',
        kind: 'regulatory',
      },
      {
        label:
          'Sehgal I, Eells K, Hudson I. A Comparison of Currently Approved siRNA Medications to Alternative Treatments. Pharmacy 2024;12:58',
        identifier: '10.3390/pharmacy12020058',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC), 2026 file, prices effective 17 December 2025',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label:
          'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024 — Table 1 sequences from the FDA inserts',
        identifier: '10.1124/molpharm.124.000895',
        kind: 'doi',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Givosiran — the only approved siRNA that cuts inside the coding sequence rather than the 3' UTR.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'givosiran',
    name: 'Givosiran',
    tradeName: 'Givlaari',
    sponsor: 'Alnylam Pharmaceuticals',
    targetGene: 'ALAS1',
    targetProtein: 'Delta-aminolevulinate synthase 1',
    modality: 'siRNA (Small Interfering RNA)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2019,
    indication: 'Acute hepatic porphyria in adults',
    patientFriendlyIndication: 'Acute porphyria attacks — severe abdominal pain crises',
    conditionContext: {
      conditionExplainer:
        'Making haem takes eight enzymes working in order. In acute hepatic porphyria one of the later enzymes is faulty, so when the liver ramps up the first enzyme, ALAS1, the pathway backs up behind the blockage and two intermediates — aminolevulinic acid and porphobilinogen — flood the body. They are neurotoxic, and the result is attacks of severe abdominal pain, vomiting, weakness and sometimes seizures or paralysis.',
      whyItMatters:
        'Attacks are excruciating, frequently misdiagnosed for years, and each one carries a risk of lasting nerve damage. Before givosiran the only preventive option was repeated intravenous haemin through a permanent central line.',
      whoTakesThis:
        'Adults with acute hepatic porphyria, most of whom have acute intermittent porphyria, the commonest subtype.',
      clinicalGoals:
        'Fewer attacks requiring hospital care, less haemin use, lower daily pain, and lower urinary aminolevulinic acid and porphobilinogen.',
    },
    oneSentenceVerdict:
      'Silences the first enzyme of haem synthesis so the toxic intermediates stop accumulating, cutting the annualised porphyria attack rate from 12.5 to 3.2 in ENVISION — a 74% reduction bought at the cost of more liver and kidney adverse events.',
    laymanHowItWorks:
      'Your liver builds haem on an assembly line. In acute porphyria one station is broken, so when the line speeds up the half-finished parts pile up, and those parts are poisonous to nerves. Givosiran tells liver cells to stop making the machine that starts the line, so the pile-up never forms. Attacks became about four times less frequent in the trial, though liver enzymes and kidney measurements moved more often on treatment than on placebo.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    anatomicalSite: 'Hepatocyte cytoplasm (liver)',
    substitutes: {
      summary:
        'Intravenous haemin suppresses the same enzyme by feeding back on it, and was the standard preventive treatment before givosiran; in the one peer-reviewed cost comparison, twice-weekly haemin prophylaxis is more expensive than the siRNA. Liver transplantation is curative and correspondingly drastic. No food or supplement prevents attacks.',
      conventionalRx: [
        {
          name: 'Haemin (Panhematin)',
          class: 'Intravenous haem preparation',
          howItCompares:
            'Supplies the end product of the pathway, which switches ALAS1 off by negative feedback. Given intravenously, usually through a central line when used for prevention.',
          typicalCost:
            'About US$889,075 per year for twice-weekly prophylaxis (Sehgal, Eells & Hudson, Pharmacy 2024)',
          prosAndCons:
            'Pros: decades of use, works acutely during an attack. Cons: venous access is a chronic problem, and in the same peer-reviewed FAERS comparison phlebitis was its most common reported reaction.',
        },
        {
          name: 'Liver transplantation',
          class: 'Surgical replacement of the enzyme-deficient organ',
          howItCompares:
            'Curative for the biochemical defect, because the transplanted liver carries a working pathway. It does not reverse nerve damage already sustained.',
          typicalCost:
            'About US$878,000 over a lifetime (Sehgal, Eells & Hudson, Pharmacy 2024)',
          prosAndCons:
            'Pros: definitive. Cons: major surgery, lifelong immunosuppression, and it does not undo established neuropathy.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Identify and remove attack precipitants',
          action:
            'Keep a written list of prescribed and over-the-counter medicines, alcohol intake, fasting episodes and hormonal cycle timing, and review it against a porphyria drug-safety database with the treating specialist.',
          patientImpact:
            'Attacks are commonly triggered by agents that induce hepatic cytochrome P450 and therefore drive ALAS1 upward, and by fasting. Removing a trigger removes attacks that no drug then has to prevent.',
          clinicalPrecaution:
            'This is a discussion to have with a porphyria specialist, not a self-directed medication change. Stopping a necessary drug without a substitute can be more dangerous than the porphyria.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'UAAGAUGAGACACUCUUUCUGGU',
      chemicalFormula: 'C524H651F16N173Na43O316P43S6',
      molecularWeight:
        '17,245.56 Da (givosiran sodium); 16,300.34 Da for the free acid, per the FDA label',
      structureSource: {
        label:
          'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024 (Table 1, sequences from the FDA inserts); formula and mass from the GIVLAARI label',
        identifier: '10.1124/molpharm.124.000895',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 'giv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amidite and GalNAc support release testing',
          description:
            'Release-test the phosphoramidites and the triantennary GalNAc support. Givosiran carries sixteen 2\'-F residues, the highest fluorine content of the approved GalNAc conjugates, so 2\'-F amidite quality dominates the impurity profile.',
          reagentsAndBuffer:
            "2'-F and 2'-OMe A/C/G/U phosphoramidites, L96-GalNAc CPG support, anhydrous acetonitrile, 31P NMR, HPLC purity, Karl Fischer titration",
        },
        {
          id: 'giv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase assembly of the 21-mer sense and 23-mer antisense strands',
          description:
            'Assemble both strands, sulfurise the terminal linkages to give six phosphorothioates and oxidise the rest, then cleave from the support and deprotect.',
          dependsOnStepId: 'giv-w1',
          reagentsAndBuffer:
            '5-(ethylthio)-1H-tetrazole in acetonitrile; 3% dichloroacetic acid in toluene; acetic anhydride / N-methylimidazole capping; 0.02 M iodine in THF/pyridine/water; phenylacetyl disulfide; concentrated aqueous ammonia',
        },
        {
          id: 'giv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange HPLC and desalting',
          description:
            'Resolve full-length material from n-1 truncations and depurination products, then buffer-exchange into water for injection.',
          dependsOnStepId: 'giv-w2',
          reagentsAndBuffer:
            'Strong anion-exchange resin; 20 mM sodium phosphate pH 8.5 with 20% acetonitrile and a sodium bromide gradient; 3 kDa tangential-flow ultrafiltration',
        },
        {
          id: 'giv-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Duplex annealing and conjugate mass confirmation',
          description:
            'Anneal the strands and confirm the intact mass against the label formula, checking the sixteen fluorines and six sulfurs explicitly.',
          dependsOnStepId: 'giv-w3',
          reagentsAndBuffer:
            'Equimolar strands in phosphate-buffered saline from 90 degrees C; ion-pair reversed-phase LC-MS with hexafluoroisopropanol / triethylamine',
        },
        {
          id: 'giv-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Free uptake into primary human hepatocytes',
          description:
            'Dose hepatocytes without transfection reagent so uptake is ASGPR-dependent, and induce ALAS1 beforehand so the assay measures suppression of an induced target rather than a resting one.',
          dependsOnStepId: 'giv-w4',
          reagentsAndBuffer:
            "Cryopreserved primary human hepatocytes, Williams' E medium with GlutaMAX, collagen-coated plates; ALAS1 induction control; asialofetuin competitor",
        },
        {
          id: 'giv-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'ALAS1 transcript knockdown and porphyrin precursor readout',
          description:
            'Quantify ALAS1 mRNA by RT-qPCR and measure aminolevulinic acid and porphobilinogen in the supernatant, so that message knockdown is tied to the metabolites that actually cause the disease.',
          dependsOnStepId: 'giv-w5',
          reagentsAndBuffer:
            'TaqMan Fast Advanced Master Mix with an ALAS1 FAM probe and a GAPDH VIC control; LC-MS/MS quantification of aminolevulinic acid and porphobilinogen',
        },
      ],
    },
    keyAudits: [
      {
        id: 'giv-a1',
        category: 'measured',
        title: 'ENVISION: annualised attack rate 3.2 versus 12.5 on placebo',
        laymanSummary:
          'Patients on givosiran had roughly a quarter as many attacks needing hospital care, urgent visits or intravenous haemin.',
        technicalDetails:
          'Double-blind, placebo-controlled phase 3. 94 patients randomised, 48 to givosiran 2.5 mg/kg monthly and 46 to placebo, for 6 months. Among the 89 patients with acute intermittent porphyria the mean annualised composite attack rate was 3.2 with givosiran and 12.5 with placebo, a 74% lower rate (P<0.001). Urinary aminolevulinic acid and porphobilinogen fell, haemin use fell and daily worst-pain scores improved.',
        evidenceSource: 'Balwani M et al., N Engl J Med 2020;382:2289-2301',
        doi: '10.1056/NEJMoa1913147',
        measuredMetric:
          'Annualised rate of composite porphyria attacks (hospitalisation, urgent visit or home intravenous haemin)',
        auditFlag: 'verified',
      },
      {
        id: 'giv-a2',
        category: 'measured',
        title: 'The efficacy came with more hepatic and renal adverse events',
        laymanSummary:
          'Liver enzymes rose, kidney measurements moved, and injection sites reacted more often on the drug than on placebo. The paper says so in its own conclusion.',
        technicalDetails:
          'ENVISION reported that key adverse events observed more frequently with givosiran were elevations in serum aminotransferases, changes in serum creatinine and estimated glomerular filtration rate, and injection-site reactions, and the authors wrote that "the increased efficacy was accompanied by a higher frequency of hepatic and renal adverse events". The FDA label carries warnings for anaphylaxis, hepatic toxicity with scheduled liver testing, renal toxicity, injection-site reactions including recall reactions, increased blood homocysteine and pancreatitis. Nausea and injection-site reactions each occur in at least 20% of patients.',
        evidenceSource:
          'Balwani M et al., N Engl J Med 2020;382:2289-2301; GIVLAARI US prescribing information',
        doi: '10.1056/NEJMoa1913147',
        auditFlag: 'caution',
      },
      {
        id: 'giv-a3',
        category: 'inferred',
        title: 'Six months of attack data are not evidence about the long-term complications',
        laymanSummary:
          'The trial ran half a year and counted attacks. It did not measure whether kidney function, nerve damage or liver cancer risk change over the years people will actually take this drug.',
        technicalDetails:
          'ENVISION\'s randomised period was 6 months with a primary endpoint of annualised attack rate in 89 patients. Chronic kidney disease progression, established neuropathy, and the elevated hepatocellular carcinoma risk associated with acute hepatic porphyria were not endpoints. The homocysteine elevation named in the label has no established clinical consequence in this population and no trial has tested treating it.',
        evidenceSource: 'Balwani M et al., N Engl J Med 2020;382:2289-2301; GIVLAARI label section 5.5',
        doi: '10.1056/NEJMoa1913147',
        inferredClaim:
          'That fewer attacks over six months means fewer long-term hepatic, renal and neurological complications',
        auditFlag: 'caution',
      },
      {
        id: 'giv-a4',
        category: 'measured',
        title: 'The attack endpoint is defined by healthcare use, not by a biomarker',
        laymanSummary:
          'An "attack" in this trial meant a hospital admission, an urgent care visit, or haemin given at home. That is a real-world definition, and it depends on how easy those things are to reach.',
        technicalDetails:
          'The composite primary endpoint counted events resulting in hospitalisation, an urgent healthcare visit, or intravenous haemin administration at home. This grounds the endpoint in consequences patients feel, but it also makes it partly a measure of healthcare access and physician threshold, which differ between sites and countries. The biochemical endpoints — urinary aminolevulinic acid and porphobilinogen — were secondary.',
        evidenceSource: 'Balwani M et al., N Engl J Med 2020;382:2289-2301',
        doi: '10.1056/NEJMoa1913147',
        measuredMetric: 'Composite attack count as defined by healthcare utilisation',
        auditFlag: 'verified',
      },
      {
        id: 'giv-a5',
        category: 'conclusion_shift',
        title: 'Givosiran is the one approved siRNA that cuts inside the coding sequence',
        laymanSummary:
          'Every other approved siRNA aims at the untranslated tail of its target message. Givosiran aims at the protein-coding body of ALAS1 instead.',
        technicalDetails:
          'A 2024 review of the approved RNAi therapeutics notes that givosiran targets the coding sequence of ALAS1 mRNA with near-complete binding, while patisiran, lumasiran, inclisiran, vutrisiran and nedosiran all act on the 3\' untranslated regions of their targets. The design consequence is that the guide must tolerate the sequence constraints of a coding region, where synonymous variation is limited.',
        evidenceSource: 'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024',
        doi: '10.1124/molpharm.124.000895',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Monthly subcutaneous dose with a liver-specific tag',
        laymanDesc:
          'An injection under the skin once a month, dosed by body weight. Three sugar molecules on the drug make liver cells grab it and almost nothing else does.',
        molecularDetail:
          'Triantennary N-acetylgalactosamine (L96) on the sense strand binds the hepatocyte asialoglycoprotein receptor. The label dose is 2.5 mg/kg monthly, with reduction to 1.25 mg/kg after significant transaminase elevation.',
        iconName: 'Target',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Endocytosis into the hepatocyte',
        laymanDesc:
          'The liver cell swallows the drug into an internal compartment, and a fraction leaks out into the working part of the cell.',
        molecularDetail:
          'ASGPR-mediated clathrin endocytosis routes the duplex to the endosome, where the receptor releases its cargo at acidic pH and recycles. A small proportion escapes to the cytoplasm and is available for RISC loading.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Guide strand loaded into the silencing complex',
        laymanDesc:
          'The two strands split; one is loaded into the cell\'s gene-silencing machinery and the other is discarded.',
        molecularDetail:
          'The 23-nucleotide antisense strand loads into Argonaute 2 within RISC. The extensive 2\'-F and 2\'-OMe substitution and the six phosphorothioate linkages give it the nuclease resistance to survive long enough to be loaded.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'ALAS1 messenger RNA is cut inside its coding body',
        laymanDesc:
          'The complex finds the instructions for the enzyme that starts the haem assembly line, and cuts them.',
        molecularDetail:
          'Unusually for this class, the guide binds the coding sequence of ALAS1 mRNA with near-complete complementarity rather than a 3\' untranslated region, and Argonaute 2 catalyses cleavage. Reduced ALAS1 protein means reduced flux into the haem pathway upstream of the deficient enzyme.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The toxic intermediates stop accumulating and attacks become rarer',
        laymanDesc:
          'With the assembly line slowed at its start, the poisonous half-finished parts stop piling up. Attacks fell from about 12.5 a year to about 3.2.',
        molecularDetail:
          'Lower ALAS1 activity reduces production of aminolevulinic acid and porphobilinogen, the neurotoxic intermediates that accumulate behind the deficient downstream enzyme. Urinary levels of both fell in ENVISION alongside the attack-rate reduction, haemin use and daily worst-pain scores.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ENVISION (NCT03338816)',
        phase: 'Phase 3',
        sampleSize: 94,
        primaryEndpoint:
          'Annualised rate of composite porphyria attacks over 6 months in acute intermittent porphyria',
        endpointMet: true,
        statisticalPValue: 'P < 0.001',
        unreportedAdverseSignals:
          'Aminotransferase elevations, serum creatinine and eGFR changes, and injection-site reactions were all more frequent with givosiran; the trial authors state the efficacy came with more hepatic and renal adverse events.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '74% lower annualised composite attack rate over 6 months in 89 patients with acute intermittent porphyria',
        'Lower urinary aminolevulinic acid and porphobilinogen, fewer days of haemin use, better daily worst-pain scores',
        'More frequent aminotransferase elevation, creatinine and eGFR change, and injection-site reaction than placebo',
      ],
      unsupportedInferences: [
        'That six months of attack reduction predicts fewer long-term neurological, renal or hepatic complications',
        'That the labelled homocysteine elevation is clinically inert — nobody has measured what it does over years',
        'That the attack-rate benefit generalises beyond acute intermittent porphyria, which supplied 89 of the 94 randomised patients',
      ],
      whatFailedInitially: [
        'Chronic intravenous haemin prophylaxis, the prior standard, requires venous access that frequently fails and carries phlebitis as its most commonly reported adverse reaction',
      ],
      realWorldOutcome: [
        'Monthly self-administration replaces a central line for many patients, which is the practical change the drug delivered',
        'In the FAERS comparison covering 2019 to 2023, acute porphyria itself was the most common reported reaction category for givosiran at 32.7% of cases — that is a report of the underlying disease, not necessarily a drug effect, and it illustrates how hard passive surveillance is to read in a rare disease',
      ],
    },
    deliverySystem: {
      type: 'GalNAc-conjugated siRNA, subcutaneous injection',
      description:
        'A 1 mL single-dose vial containing 189 mg of givosiran, dosed at 2.5 mg/kg of actual body weight once monthly by subcutaneous injection, with dose reduction to 1.25 mg/kg after a significant transaminase elevation that then improves.',
      safetyProfile:
        'Labelled warnings for anaphylaxis, hepatic toxicity with baseline and periodic liver testing, renal toxicity, injection-site reactions including recall reactions, increased blood homocysteine and pancreatitis. Nausea and injection-site reactions each occur in at least 20% of patients.',
    },
    commonQuestions: [
      {
        q: 'Does givosiran cure porphyria?',
        a: 'No. It suppresses the first enzyme of the haem pathway so the toxic intermediates stop piling up, but the underlying enzyme deficiency is untouched and returns as soon as the drug is stopped. In the trial it reduced attacks by 74% over six months; it did not eliminate them, and the mean rate on treatment was still 3.2 a year.',
      },
      {
        q: 'What are the liver and kidney warnings about?',
        a: 'They come directly out of the pivotal trial. Aminotransferase elevations, serum creatinine changes and eGFR changes were all more common on givosiran than on placebo, and the authors wrote that the increased efficacy was accompanied by a higher frequency of hepatic and renal adverse events. The label therefore requires liver testing at baseline and periodically, and renal monitoring as clinically indicated.',
        auditNote:
          'This is the one drug in this file whose own pivotal publication names a safety trade-off in its conclusion.',
      },
      {
        q: 'Why does my homocysteine go up?',
        a: 'Because the haem pathway and the methionine pathway share the vitamin B6-dependent enzyme cystathionine beta-synthase, and reducing ALAS1 flux appears to affect it. What that elevation does over years has not been measured, and no trial has tested whether treating it changes anything. The label lists it as a warning; that is the extent of what is known.',
      },
      {
        q: 'How long do I have to keep taking it?',
        a: 'Indefinitely, on current evidence. ALAS1 silencing lasts weeks, not years, which is why the schedule is monthly, and no trial has tested stopping. There is no published withdrawal study and no evidence of durable remission after discontinuation.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Balwani M et al. Phase 3 Trial of RNAi Therapeutic Givosiran for Acute Intermittent Porphyria (ENVISION). N Engl J Med 2020;382:2289-2301',
        identifier: '10.1056/NEJMoa1913147',
        kind: 'doi',
      },
      { label: 'ENVISION', identifier: 'NCT03338816', kind: 'nct' },
      {
        label: 'GIVLAARI (givosiran) injection, US prescribing information — DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=167e663c-11e1-497b-a3fc-951d65d58eaa',
        kind: 'regulatory',
      },
      {
        label:
          'Sehgal I, Eells K, Hudson I. A Comparison of Currently Approved siRNA Medications to Alternative Treatments. Pharmacy 2024;12:58',
        identifier: '10.3390/pharmacy12020058',
        kind: 'doi',
      },
      {
        label:
          'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024 — sequences and target-site analysis',
        identifier: '10.1124/molpharm.124.000895',
        kind: 'doi',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Lumasiran — approved on a urine chemistry, in an indication written as a urine chemistry.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lumasiran',
    name: 'Lumasiran',
    tradeName: 'Oxlumo',
    sponsor: 'Alnylam Pharmaceuticals',
    targetGene: 'HAO1',
    targetProtein: 'Glycolate oxidase (hydroxyacid oxidase 1)',
    modality: 'siRNA (Small Interfering RNA)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2020,
    indication:
      'Primary hyperoxaluria type 1, to lower urinary and plasma oxalate levels in paediatric and adult patients',
    patientFriendlyIndication: 'Primary hyperoxaluria type 1 — a genetic cause of kidney stones and kidney failure',
    conditionContext: {
      conditionExplainer:
        'In primary hyperoxaluria type 1 a faulty liver enzyme lets glyoxylate escape into a pathway that turns it into oxalate. Oxalate has no metabolic use and must leave through the kidney, where it crystallises with calcium into stones and deposits, scarring the kidney until it fails and then depositing throughout the body.',
      whyItMatters:
        'Untreated PH1 commonly reaches kidney failure in childhood or early adulthood, and dialysis cannot keep up with the oxalate load, so the standard cure has been a combined liver and kidney transplant.',
      whoTakesThis:
        'Children and adults with genetically confirmed PH1. Lumasiran is dosed by body weight, with a monthly loading phase followed by quarterly maintenance in most weight bands.',
      clinicalGoals:
        'Bring 24-hour urinary oxalate to normal or near-normal and keep it there, in the hope — not yet the demonstration — that stones and kidney decline follow.',
    },
    oneSentenceVerdict:
      'Silences glycolate oxidase so the liver diverts glyoxylate away from oxalate, cutting 24-hour urinary oxalate by 53.5 percentage points against placebo in 39 patients — a biochemical endpoint, which is exactly what the FDA indication says it is licensed for.',
    laymanHowItWorks:
      'A broken liver enzyme lets a chemical called glyoxylate turn into oxalate, which the kidneys cannot handle and which forms stones and scarring. Lumasiran does not fix the broken enzyme. It switches off an earlier one, so far less glyoxylate is produced in the first place and there is less raw material to turn into oxalate. Urine oxalate dropped into the normal range for most patients within a few months.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 70,
    anatomicalSite: 'Hepatocyte peroxisome and cytoplasm (liver)',
    substitutes: {
      summary:
        'Pyridoxine restores partial enzyme function in a minority of genotypes, and high fluid intake with citrate keeps oxalate in solution rather than reducing it. Both are cheap. Neither addresses the overproduction, and combined liver-kidney transplantation remains the only curative option.',
      conventionalRx: [
        {
          name: 'Pyridoxine (vitamin B6)',
          class: 'Cofactor supplementation',
          howItCompares:
            'Acts as a chaperone for the misfolded AGT enzyme in a minority of genotypes, partially restoring its function. Where it works it lowers oxalate; where the genotype is unresponsive it does nothing.',
          typicalCost:
            'Under US$120 per year (Sehgal, Eells & Hudson, Pharmacy 2024)',
          prosAndCons:
            'Pros: oral, trivially cheap, decades of use. Cons: genotype-dependent, and unresponsive patients gain nothing.',
        },
        {
          name: 'Potassium citrate solution',
          class: 'Urinary alkalinising agent',
          howItCompares:
            'Does not reduce oxalate production at all. It raises urinary citrate, which complexes calcium and keeps calcium oxalate in solution rather than crystallising.',
          typicalCost:
            'Under US$120 per year (Sehgal, Eells & Hudson, Pharmacy 2024); US$0.18 per 10 mEq extended-release tablet at pharmacy acquisition cost (CMS NADAC, effective 17 December 2025)',
          prosAndCons:
            'Pros: cheap, addresses the crystallisation step directly. Cons: purely a solubility measure, and adherence to high-volume fluid regimens is hard.',
        },
        {
          name: 'Nedosiran (Rivfloza)',
          class: 'siRNA against LDHA',
          howItCompares:
            'Silences the last enzyme in the pathway rather than an earlier one, and is also approved for PH1 only. The two have never been compared head to head.',
          typicalCost: '',
          prosAndCons:
            'Pros: acts at the terminal step, which in theory applies to more PH subtypes. Cons: the PH2 subgroup in its own pivotal trial showed no consistent effect.',
        },
        {
          name: 'Combined liver and kidney transplantation',
          class: 'Surgical replacement of the enzyme-deficient organ and the damaged one',
          howItCompares:
            'The only curative option, because the transplanted liver carries a working AGT enzyme. The prior standard of care in advanced disease.',
          typicalCost:
            'About US$414,800 over a lifetime for the renal transplant component (Sehgal, Eells & Hudson, Pharmacy 2024)',
          prosAndCons:
            'Pros: definitive. Cons: two organs, major surgery, lifelong immunosuppression. RNAi therapy has begun to make kidney-only transplantation an option in selected patients.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'High fluid intake, maintained around the clock',
          action:
            'Keep urine dilute continuously, including overnight, at the volume target set by the treating nephrologist.',
          patientImpact:
            'Calcium oxalate crystallises when its concentration exceeds solubility. Dilution does not lower how much oxalate is made, but it changes whether that oxalate forms a stone.',
          clinicalPrecaution:
            'Volume targets are individual and must come from the nephrology team, particularly once kidney function is reduced. Do not set them from a website.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'UAUAUUUCCAGGAUGAAAGUCCA',
      chemicalFormula: 'C530H669F10N173O320P43S6Na43',
      molecularWeight: '17,286 Da (lumasiran sodium, per the FDA label)',
      structureSource: {
        label:
          'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024 (Table 1, sequences from the FDA inserts); formula and mass from the OXLUMO label',
        identifier: '10.1124/molpharm.124.000895',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 'lum-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amidite and GalNAc support release testing',
          description:
            'Confirm amidite identity and purity and the loading of the triantennary GalNAc support before synthesis begins.',
          reagentsAndBuffer:
            "2'-F and 2'-OMe A/C/G/U phosphoramidites, L96-GalNAc CPG support, anhydrous acetonitrile, 31P NMR, HPLC purity, Karl Fischer titration",
        },
        {
          id: 'lum-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase assembly of the 21-mer sense and 23-mer antisense strands',
          description:
            'Assemble both strands with the label\'s modification pattern, sulfurising the terminal linkages and oxidising the rest, then cleave and deprotect.',
          dependsOnStepId: 'lum-w1',
          reagentsAndBuffer:
            '5-(ethylthio)-1H-tetrazole in acetonitrile; 3% dichloroacetic acid in toluene; acetic anhydride / N-methylimidazole capping; 0.02 M iodine in THF/pyridine/water; phenylacetyl disulfide; concentrated aqueous ammonia',
        },
        {
          id: 'lum-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange HPLC and ultrafiltration',
          description:
            'Separate full-length product from truncations and desalt into water for injection.',
          dependsOnStepId: 'lum-w2',
          reagentsAndBuffer:
            'Strong anion-exchange resin; 20 mM sodium phosphate pH 8.5 with 20% acetonitrile and a sodium bromide gradient; 3 kDa tangential-flow ultrafiltration',
        },
        {
          id: 'lum-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Duplex annealing and intact-mass confirmation',
          description:
            'Anneal the two strands and confirm the conjugated duplex mass against the label formula by ion-pair LC-MS.',
          dependsOnStepId: 'lum-w3',
          reagentsAndBuffer:
            'Equimolar strands in phosphate-buffered saline from 90 degrees C; ion-pair reversed-phase LC-MS with hexafluoroisopropanol / triethylamine',
        },
        {
          id: 'lum-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Free uptake into primary human hepatocytes',
          description:
            'Dose hepatocytes with no transfection reagent so that entry is ASGPR-dependent, with an asialofetuin block as the specificity control.',
          dependsOnStepId: 'lum-w4',
          reagentsAndBuffer:
            "Cryopreserved primary human hepatocytes, Williams' E medium with GlutaMAX, collagen-coated plates, asialofetuin competitor",
        },
        {
          id: 'lum-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'HAO1 knockdown, glycolate accumulation and oxalate output',
          description:
            'Quantify HAO1 mRNA by RT-qPCR and measure both glycolate and oxalate in the medium. Glycolate rising while oxalate falls is the signature that the block is where it is supposed to be.',
          dependsOnStepId: 'lum-w5',
          reagentsAndBuffer:
            'TaqMan Fast Advanced Master Mix with a HAO1 FAM probe and a GAPDH VIC control; ion chromatography or LC-MS/MS for glycolate and oxalate',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lum-a1',
        category: 'measured',
        title: 'ILLUMINATE-A: 53.5 percentage-point reduction in 24-hour urinary oxalate',
        laymanSummary:
          'Urinary oxalate fell by about two-thirds on lumasiran and barely moved on placebo, and 84% of treated patients reached a normal or near-normal level by six months against none on placebo.',
        technicalDetails:
          'Double-blind phase 3, 39 patients aged 6 and over randomised 2:1. Least-squares mean difference in change in 24-hour urinary oxalate excretion, lumasiran minus placebo, was -53.5 percentage points (P<0.001), with a 65.4% reduction in the lumasiran group. Plasma oxalate difference -39.5 percentage points (P<0.001). 84% of lumasiran patients versus 0% of placebo patients had 24-hour urinary oxalate no higher than 1.5 times the upper limit of normal at month 6 (P<0.001). Mild transient injection-site reactions in 38%.',
        evidenceSource: 'Garrelfs SF et al., N Engl J Med 2021;384:1216-1226',
        doi: '10.1056/NEJMoa2021712',
        measuredMetric: 'Percent change in 24-hour urinary oxalate excretion at month 6',
        auditFlag: 'verified',
      },
      {
        id: 'lum-a2',
        category: 'inferred',
        title: 'The indication is written as a chemistry, because the chemistry is what was measured',
        laymanSummary:
          'The FDA licensed lumasiran "to lower urinary and plasma oxalate levels". It did not license it to prevent kidney stones or kidney failure, because the trial did not measure those.',
        technicalDetails:
          'The approved indication reads: "for the treatment of primary hyperoxaluria type 1 (PH1) to lower urinary and plasma oxalate levels in pediatric and adult patients". Urinary oxalate is a surrogate: it is the mechanistic cause of stone formation and nephrocalcinosis, and it is strongly associated with progression, but the pivotal trial\'s 6-month randomised period was never powered for stone events or for eGFR decline. Longer-term data are open-label extensions without a concurrent control.',
        evidenceSource: 'OXLUMO US prescribing information, section 1',
        inferredClaim:
          'That normalising urinary oxalate prevents stones, nephrocalcinosis and progression to kidney failure',
        auditFlag: 'caution',
      },
      {
        id: 'lum-a3',
        category: 'measured',
        title: 'Sixty-month follow-up sustained the biochemical effect without a control group',
        laymanSummary:
          'Patients followed for five years kept the low oxalate levels. Everyone in that extension was on the drug, so there is nothing to compare against.',
        technicalDetails:
          'ILLUMINATE-A ran a 6-month double-blind placebo-controlled period followed by an extension of up to 54 months in which all patients received lumasiran. The final report describes sustained reductions in urinary and plasma oxalate and "encouraging clinical outcomes", with mild injection-site reactions the most common adverse event. From month 6 onward there was no randomised comparator.',
        evidenceSource: 'Final Results of the ILLUMINATE-A Phase 3 Clinical Trial, CJASN 2026',
        doi: '10.2215/CJN.0000000916',
        auditFlag: 'verified',
      },
      {
        id: 'lum-a4',
        category: 'measured',
        title: 'The drug blocks a step and the substrate backs up behind it',
        laymanSummary:
          'Because lumasiran turns off an enzyme partway down the pathway, the chemical feeding that enzyme accumulates instead. Rising glycolate is the expected signature of the drug working.',
        technicalDetails:
          'Silencing HAO1 removes glycolate oxidase, which converts glycolate to glyoxylate. Glyoxylate flux to oxalate therefore falls and plasma and urinary glycolate rise. Isolated glycolate accumulation has no known pathological consequence, and elevated glycolate is used as a pharmacodynamic confirmation of target engagement rather than treated as an adverse finding.',
        evidenceSource: 'Garrelfs SF et al., N Engl J Med 2021;384:1216-1226',
        doi: '10.1056/NEJMoa2021712',
        measuredMetric: 'Plasma and urinary glycolate as a target-engagement marker',
        auditFlag: 'verified',
      },
      {
        id: 'lum-a5',
        category: 'inferred',
        title: 'Thirty-nine patients is the entire randomised evidence base',
        laymanSummary:
          'The pivotal trial enrolled 39 people, 26 of them on the drug. In a disease this rare that is a reasonable trial, but it is a small number to carry a licence.',
        technicalDetails:
          'ILLUMINATE-A randomised 39 patients aged 6 and over, 26 to lumasiran and 13 to placebo. Subsequent studies — ILLUMINATE-B in infants and young children and ILLUMINATE-C in advanced kidney disease — were single-arm. No randomised trial of lumasiran has been powered for a clinical event.',
        evidenceSource: 'Garrelfs SF et al., N Engl J Med 2021;384:1216-1226',
        doi: '10.1056/NEJMoa2021712',
        inferredClaim:
          'That effect sizes from 26 treated patients transfer confidently to every PH1 genotype and age band',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Weight-based subcutaneous dose with a liver tag',
        laymanDesc:
          'An injection under the skin, dosed by weight, monthly at first and then usually once every three months. The sugar tag means it goes to the liver and nowhere else that matters.',
        molecularDetail:
          'Triantennary N-acetylgalactosamine binds hepatocyte ASGPR. The label gives a three-dose monthly loading phase followed by quarterly maintenance for patients at 20 kg and above, with different bands below that.',
        iconName: 'Target',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Uptake into the hepatocyte',
        laymanDesc:
          'Liver cells pull the drug inside. A portion escapes into the cell body and forms a reservoir that lasts for months.',
        molecularDetail:
          'ASGPR-mediated endocytosis delivers the duplex to the endosome; a fraction escapes into the cytoplasm and the remainder forms the slow-release depot responsible for the quarterly dosing interval.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'RISC loading',
        laymanDesc:
          'One of the two strands is loaded into the cell\'s own silencing machinery; the other is discarded.',
        molecularDetail:
          'The 23-nucleotide antisense strand loads into Argonaute 2. Lumasiran is one of the three approved siRNAs whose guide binds its target with complete base-pair complementarity.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'HAO1 messenger RNA is cut and glycolate oxidase disappears',
        laymanDesc:
          'The complex destroys the instructions for glycolate oxidase, the enzyme that makes the raw material for oxalate.',
        molecularDetail:
          'Argonaute 2 cleaves HAO1 mRNA in its 3\' untranslated region. Loss of hepatic glycolate oxidase reduces conversion of glycolate to glyoxylate, so less substrate reaches the lactate dehydrogenase step that produces oxalate. This is substrate reduction therapy: the deficient enzyme AGT is never touched.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Urinary oxalate falls into the normal range',
        laymanDesc:
          'Less oxalate is made, so less arrives at the kidney. In the trial 84% of treated patients reached a normal or near-normal urine level within six months.',
        molecularDetail:
          'Reduced hepatic oxalate synthesis lowers 24-hour urinary oxalate by a placebo-adjusted 53.5 percentage points and plasma oxalate by 39.5 percentage points, with glycolate rising as the substrate accumulates behind the block. Whether that translates into fewer stones and preserved eGFR has not been tested against a control.',
        iconName: 'Droplets',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ILLUMINATE-A (NCT03681184)',
        phase: 'Phase 3',
        sampleSize: 39,
        primaryEndpoint:
          'Percent change in 24-hour urinary oxalate excretion from baseline to month 6',
        endpointMet: true,
        statisticalPValue: 'P < 0.001',
        unreportedAdverseSignals:
          'Mild transient injection-site reactions in 38% of treated patients. The randomised comparison ends at month 6; everything after that is open-label.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '53.5 percentage-point placebo-adjusted reduction in 24-hour urinary oxalate at month 6',
        '39.5 percentage-point placebo-adjusted reduction in plasma oxalate',
        '84% of treated patients versus 0% on placebo reaching urinary oxalate at or below 1.5 times the upper limit of normal',
        'Sustained biochemical effect through 60 months of open-label follow-up',
      ],
      unsupportedInferences: [
        'That lowering urinary oxalate prevents kidney stones — no randomised trial has counted stone events',
        'That lowering urinary oxalate preserves kidney function — eGFR was not a powered endpoint',
        'That the 39-patient effect size transfers unchanged across all PH1 genotypes and ages',
      ],
      whatFailedInitially: [
        'Pyridoxine, the prior pharmacological option, works only in a minority of AGXT genotypes and leaves the rest with fluid and citrate management alone',
      ],
      realWorldOutcome: [
        'Combined liver-kidney transplantation was the standard cure; RNAi therapy has begun to make kidney-only transplantation viable in selected patients, alongside hyperhydration, urinary alkalinisation and vitamin B6 where applicable',
        'In the FAERS comparison covering 2020 to 2023, lumasiran had 53 reported adverse event cases and no reported deaths, with "drug ineffective" the most common reported category at 13.2%',
      ],
    },
    deliverySystem: {
      type: 'GalNAc-conjugated siRNA, subcutaneous injection',
      description:
        'A preservative-free solution containing 94.5 mg of lumasiran in 0.5 mL. Weight-banded dosing: three monthly loading doses, then quarterly maintenance for patients weighing 20 kg or more, with different bands below that weight.',
      safetyProfile:
        'The label carries no boxed warning and no warnings-and-precautions section. The only adverse reaction reported in at least 20% of patients is injection-site reaction, and in the pivotal trial these were mild and transient.',
    },
    commonQuestions: [
      {
        q: 'Will lumasiran stop me forming kidney stones?',
        a: 'Nobody has measured that in a controlled trial. What was measured is urinary oxalate, which fell by a placebo-adjusted 53.5 percentage points, with 84% of treated patients reaching a normal or near-normal level. Oxalate is the material stones are made of, so the reasoning is strong — but the FDA indication is worded "to lower urinary and plasma oxalate levels", and that wording is deliberate.',
        auditNote:
          'The gap between "lowers the chemical that causes stones" and "prevents stones" is the whole reason this page exists.',
      },
      {
        q: 'Why does my glycolate level go up on treatment?',
        a: 'Because that is the drug working. Lumasiran removes glycolate oxidase, the enzyme that converts glycolate into glyoxylate. With the enzyme gone, glycolate accumulates instead of moving down the pathway toward oxalate. Isolated glycolate elevation has no known harm and is used as confirmation that the target was engaged.',
      },
      {
        q: 'Does it work for primary hyperoxaluria types 2 and 3?',
        a: 'It is not approved for them and has not been shown to work in them. Lumasiran targets HAO1, which sits upstream in the type 1 pathway. Types 2 and 3 have different enzyme defects, and the FDA indication is restricted to PH1.',
      },
      {
        q: 'Can I stop the fluids and the citrate now?',
        a: 'That is a question for the nephrology team, and the evidence does not settle it. Lumasiran reduces how much oxalate is made; fluid and citrate change whether the remaining oxalate crystallises. No trial has tested withdrawing supportive measures once urinary oxalate normalises, so there is no evidence base for doing so.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Garrelfs SF et al. Lumasiran, an RNAi Therapeutic for Primary Hyperoxaluria Type 1 (ILLUMINATE-A). N Engl J Med 2021;384:1216-1226',
        identifier: '10.1056/NEJMoa2021712',
        kind: 'doi',
      },
      {
        label: 'Final Results of the ILLUMINATE-A Phase 3 Clinical Trial of Lumasiran. CJASN 2026',
        identifier: '10.2215/CJN.0000000916',
        kind: 'doi',
      },
      { label: 'ILLUMINATE-A', identifier: 'NCT03681184', kind: 'nct' },
      {
        label: 'OXLUMO (lumasiran) injection, US prescribing information — DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=16985a31-f5e4-4557-9266-fc78d4bc5055',
        kind: 'regulatory',
      },
      {
        label:
          'Sehgal I, Eells K, Hudson I. A Comparison of Currently Approved siRNA Medications to Alternative Treatments. Pharmacy 2024;12:58',
        identifier: '10.3390/pharmacy12020058',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC), 2026 file, prices effective 17 December 2025',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label:
          'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024 — Table 1 sequences from the FDA inserts',
        identifier: '10.1124/molpharm.124.000895',
        kind: 'doi',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Nedosiran — a stem-loop conjugate, and the one approved siRNA whose own sequence sources disagree.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'nedosiran',
    name: 'Nedosiran',
    tradeName: 'Rivfloza',
    sponsor: 'Novo Nordisk (originated at Dicerna Pharmaceuticals)',
    targetGene: 'LDHA',
    targetProtein: 'Lactate dehydrogenase A',
    modality: 'siRNA (Small Interfering RNA)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2023,
    indication:
      'Primary hyperoxaluria type 1, to lower urinary oxalate levels in children aged 2 and older and adults with relatively preserved kidney function (eGFR 30 mL/min/1.73 m2 or above)',
    patientFriendlyIndication: 'Primary hyperoxaluria type 1 — a genetic cause of kidney stones and kidney failure',
    conditionContext: {
      conditionExplainer:
        'Primary hyperoxaluria is a family of liver enzyme defects that all end in the same place: too much glyoxylate reaching the enzyme that converts it into oxalate. Oxalate cannot be metabolised, so it leaves through the kidney, crystallises with calcium and destroys it.',
      whyItMatters:
        'Kidney failure in childhood or early adulthood is the usual course untreated. Dialysis cannot clear oxalate fast enough, and the deposits then spread through bone, heart and retina.',
      whoTakesThis:
        'Children aged 2 and over and adults with PH1 whose kidney function is still relatively preserved. The label draws that line at an eGFR of 30 mL/min/1.73 m2.',
      clinicalGoals:
        'Lower 24-hour urinary oxalate toward the normal range and keep it there, in the hope that stones and kidney decline follow.',
    },
    oneSentenceVerdict:
      'Silences the last enzyme in the oxalate pathway rather than an earlier one, and in PHYOX2 half of treated patients reached a normal or near-normal urinary oxalate against none on placebo — but only in type 1, because the type 2 subgroup showed no consistent effect.',
    laymanHowItWorks:
      'Every form of primary hyperoxaluria funnels through one final enzyme that turns glyoxylate into oxalate. Nedosiran switches that last enzyme off in liver cells, so the conversion cannot happen no matter which upstream enzyme is broken. That was the theory. In practice the trial showed the effect clearly in type 1 disease and not in the small type 2 group, and the licence follows the data rather than the theory.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 65,
    anatomicalSite: 'Hepatocyte cytoplasm (liver)',
    substitutes: {
      summary:
        'Lumasiran blocks the same pathway one step earlier and is also approved for PH1 only; the two have never been compared head to head. Pyridoxine helps a minority of genotypes, and fluid and citrate change whether oxalate crystallises rather than how much is made.',
      conventionalRx: [
        {
          name: 'Lumasiran (Oxlumo)',
          class: 'siRNA against HAO1',
          howItCompares:
            'Blocks glycolate oxidase upstream, reducing the substrate that reaches lactate dehydrogenase. Both drugs are approved for PH1 and both were licensed on urinary oxalate, not on stone or kidney outcomes.',
          typicalCost:
            'About US$1,638,694 in the first year including the loading phase (Sehgal, Eells & Hudson, Pharmacy 2024)',
          prosAndCons:
            'Pros: longer follow-up, and a 60-month final analysis published. Cons: same surrogate endpoint, same absence of a controlled clinical outcome.',
        },
        {
          name: 'Pyridoxine (vitamin B6)',
          class: 'Cofactor supplementation',
          howItCompares:
            'Chaperones the misfolded AGT enzyme in responsive AGXT genotypes. Where it works it reduces oxalate production directly and costs almost nothing.',
          typicalCost: 'Under US$120 per year (Sehgal, Eells & Hudson, Pharmacy 2024)',
          prosAndCons:
            'Pros: oral, negligible cost, long history. Cons: only a minority of genotypes respond.',
        },
        {
          name: 'Potassium citrate solution',
          class: 'Urinary alkalinising agent',
          howItCompares:
            'Changes the solubility of calcium oxalate rather than the amount produced. Complementary to, not competitive with, an siRNA.',
          typicalCost:
            'US$0.18 per 10 mEq extended-release tablet at pharmacy acquisition cost (CMS NADAC, effective 17 December 2025)',
          prosAndCons:
            'Pros: cheap and directly targets crystallisation. Cons: does nothing about overproduction.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Sustained high fluid intake',
          action:
            'Maintain the urine volume target set by the nephrology team, including overnight.',
          patientImpact:
            'Dilution keeps calcium oxalate below its solubility limit. It does not reduce oxalate production, so it is used alongside, not instead of, drug therapy.',
          clinicalPrecaution:
            'Volume targets must be individualised, especially once eGFR falls. Do not set them without the treating team.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'UCAGAGAAAAAGGACAACAUGG',
      chemicalFormula: 'C662H808F19N231O413P57S6Na57',
      molecularWeight: '22,238 Da (nedosiran sodium, per the FDA label)',
      structureSource: {
        label:
          'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024 (Table 1, antisense strand as printed in the FDA insert — see the sequence-discrepancy audit point); formula and mass from the RIVFLOZA label',
        identifier: '10.1124/molpharm.124.000895',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 'ned-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amidite and GalNAc-nucleoside release testing',
          description:
            'Nedosiran is conjugated differently from the L96 drugs: four separate GalNAc-conjugated ribonucleosides sit in the loop of the sense strand, so the conjugated amidites themselves are release-tested as individual building blocks.',
          reagentsAndBuffer:
            "GalNAc-conjugated adenosine and guanosine phosphoramidites, 2'-F and 2'-OMe A/C/G/U amidites, anhydrous acetonitrile, 31P NMR, HPLC purity, Karl Fischer titration",
        },
        {
          id: 'ned-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase assembly of the hairpin sense strand and 22-mer antisense strand',
          description:
            'Assemble the long sense strand that folds back on itself into a stem-loop, incorporating the four GalNAc-bearing nucleosides in the tetraloop, and the 22-nucleotide antisense strand separately.',
          dependsOnStepId: 'ned-w1',
          reagentsAndBuffer:
            '5-(ethylthio)-1H-tetrazole in acetonitrile; 3% dichloroacetic acid in toluene; acetic anhydride / N-methylimidazole capping; 0.02 M iodine in THF/pyridine/water; phenylacetyl disulfide for the phosphorothioate positions; concentrated aqueous ammonia',
        },
        {
          id: 'ned-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange HPLC of a folded strand',
          description:
            'Purify each strand. The hairpin sense strand is the harder problem: it must be resolved under conditions that do not denature the stem-loop the conjugate depends on.',
          dependsOnStepId: 'ned-w2',
          reagentsAndBuffer:
            'Strong anion-exchange resin; 20 mM sodium phosphate pH 8.5 with 20% acetonitrile and a sodium bromide gradient at controlled temperature; 3 kDa tangential-flow ultrafiltration',
        },
        {
          id: 'ned-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Duplex annealing and tetraloop confirmation',
          description:
            'Anneal the antisense strand to the stem of the folded sense strand and confirm both the intact mass and the folded state, because a sense strand that failed to form its loop presents its four GalNAc groups incorrectly.',
          dependsOnStepId: 'ned-w3',
          reagentsAndBuffer:
            'Equimolar strands in phosphate-buffered saline from 90 degrees C with controlled cooling; ion-pair reversed-phase LC-MS; non-denaturing anion-exchange or UV melting for the folded state',
        },
        {
          id: 'ned-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Free uptake into primary human hepatocytes',
          description:
            'Dose without transfection reagent so uptake depends on the tetraloop GalNAc cluster engaging ASGPR.',
          dependsOnStepId: 'ned-w4',
          reagentsAndBuffer:
            "Cryopreserved primary human hepatocytes, Williams' E medium with GlutaMAX, collagen-coated plates, asialofetuin competitor",
        },
        {
          id: 'ned-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'LDHA knockdown and oxalate output',
          description:
            'Quantify LDHA mRNA by RT-qPCR and oxalate in the medium, with lactate measured alongside because lactate dehydrogenase A also carries out the pyruvate-to-lactate step.',
          dependsOnStepId: 'ned-w5',
          reagentsAndBuffer:
            'TaqMan Fast Advanced Master Mix with an LDHA FAM probe and a GAPDH VIC control; LC-MS/MS or ion chromatography for oxalate; enzymatic lactate assay',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ned-a1',
        category: 'measured',
        title: 'PHYOX2: half of treated patients reached normal or near-normal urinary oxalate',
        laymanSummary:
          'Urinary oxalate fell substantially on nedosiran and rose on placebo, and 50% of treated patients reached a normal or near-normal level on two consecutive visits against none in the placebo group.',
        technicalDetails:
          'Double-blind, placebo-controlled, 35 participants randomised 2:1 with eGFR of 30 or above. Primary endpoint, the area under the curve of percent reduction from baseline in 24-hour urinary oxalate between day 90 and day 180: least-squares mean +3507 (SE 788) with nedosiran versus -1664 (SE 1190) with placebo, difference 5172 (95% CI 2929 to 7414; P<0.001). 50% versus 0% achieved normal or near-normal urinary oxalate on two or more consecutive visits (P=0.002). Injection-site reactions in 9%, all mild and self-limiting.',
        evidenceSource: 'Baum MA et al., Kidney Int 2023;103:207-217',
        doi: '10.1016/j.kint.2022.07.025',
        measuredMetric:
          'Area under the curve of percent reduction in 24-hour urinary oxalate, days 90 to 180',
        auditFlag: 'verified',
      },
      {
        id: 'ned-a2',
        category: 'failed',
        title: 'The type 2 subgroup showed no consistent effect, and the licence excludes it',
        laymanSummary:
          'Nedosiran targets the last enzyme in the pathway, which in theory should work for every type of primary hyperoxaluria. In the six type 2 patients it did not, and the drug is approved for type 1 only.',
        technicalDetails:
          'PHYOX2 enrolled 29 patients with PH1 and 6 with PH2. The PH1 subgroup showed a sustained urinary oxalate reduction — 64.7% versus 0% achieving normal or near-normal levels, P<0.001 — and a significant plasma oxalate reduction (P=0.017). The paper states that no consistent effect was seen in the PH2 subgroup. The FDA indication is restricted to PH1. Six patients cannot exclude a real effect, but they also cannot establish one, and the label followed the data.',
        evidenceSource: 'Baum MA et al., Kidney Int 2023;103:207-217',
        doi: '10.1016/j.kint.2022.07.025',
        inferredClaim:
          'That silencing the terminal enzyme of the pathway works across all primary hyperoxaluria subtypes',
        auditFlag: 'verified',
      },
      {
        id: 'ned-a3',
        category: 'conclusion_shift',
        title: 'Two published sources disagree about one base of the drug\'s own guide strand',
        laymanSummary:
          'The FDA label and a separate published database describe the sixth letter of nedosiran\'s active strand differently — a G in one, a C in the other. The sequence on this page is the one printed in the label.',
        technicalDetails:
          'A 2024 review that transcribed the approved siRNA sequences from the FDA inserts records, in the footnote to its own table, that "the guanosine at position 6 from the 5\' end of the nedosiran antisense strand is instead called a cytosine in an alternative source (Siramshetty et al., 2022) to the FDA label". The sequence stored here is the label version. One base changes the predicted base-pairing with the LDHA transcript, so this is not a typographical curiosity.',
        evidenceSource:
          'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024, Table 1 and Table 2 footnotes',
        doi: '10.1124/molpharm.124.000895',
        auditFlag: 'contested',
      },
      {
        id: 'ned-a4',
        category: 'inferred',
        title: 'Approved on a urine chemistry, like lumasiran, and for the same reason',
        laymanSummary:
          'The indication is worded "to lower urinary oxalate levels". Stones, nephrocalcinosis and kidney survival were not the endpoints.',
        technicalDetails:
          'The FDA indication reads "to lower urinary oxalate levels in children 2 years of age and older and adults with primary hyperoxaluria type 1 and relatively preserved kidney function". PHYOX2 ran six months with a biochemical primary endpoint in 35 patients. Long-term data come from PHYOX3, an open-label extension without a concurrent control.',
        evidenceSource:
          'RIVFLOZA US prescribing information, section 1; PHYOX3, Kidney Int Rep 2025;10:1993-2002',
        doi: '10.1016/j.ekir.2025.03.031',
        inferredClaim:
          'That lowering urinary oxalate prevents stones or preserves kidney function — neither has been shown against a control',
        auditFlag: 'caution',
      },
      {
        id: 'ned-a5',
        category: 'conclusion_shift',
        title: 'The paediatric range was widened from 9 years to 2 years after approval',
        laymanSummary:
          'The drug was first approved for children aged 9 and over. An efficacy supplement in March 2025 extended it down to age 2.',
        technicalDetails:
          'NDA 215842 was approved as a new molecular entity on 29 September 2023 and an efficacy supplement was approved on 27 March 2025. The current label covers children aged 2 and older, with a separate weight-banded dose for the 2-to-under-12 band.',
        evidenceSource: 'Drugs@FDA NDA 215842 submission history; RIVFLOZA prescribing information',
        auditFlag: 'verified',
      },
      {
        id: 'ned-a6',
        category: 'measured',
        title: 'A hairpin sense strand with four GalNAc groups in its loop',
        laymanSummary:
          'Every other approved siRNA here hangs a single three-branched sugar cluster off the end of one strand. Nedosiran folds its passenger strand into a loop and puts four separate sugars inside it.',
        technicalDetails:
          'The 2024 review notes that "the sense strand of newly approved nedosiran is designed to form a hairpin or stem-loop structure in which the loop is comprised of four GalNAc aminosugar conjugated ribonucleosides". The consequence for manufacture is that the conjugate is built from individual GalNAc-nucleoside amidites during synthesis rather than attached to a pre-loaded support, and that folding must be confirmed as part of release.',
        evidenceSource:
          'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024, Table 1 legend',
        doi: '10.1124/molpharm.124.000895',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Monthly subcutaneous dose carried by a looped sugar cluster',
        laymanDesc:
          'An injection under the skin once a month. Instead of one branched sugar tag on the end, this drug folds part of itself into a loop and studs the loop with four sugars.',
        molecularDetail:
          'The sense strand folds into a stem-loop whose tetraloop is composed of four GalNAc-conjugated ribonucleosides, which together engage the hepatocyte asialoglycoprotein receptor. This is the GalXC conjugation architecture rather than the triantennary L96 cluster used by the Alnylam conjugates.',
        iconName: 'Target',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Receptor-mediated uptake into the liver cell',
        laymanDesc:
          'Liver cells recognise the sugar cluster and pull the whole molecule inside.',
        molecularDetail:
          'ASGPR-mediated clathrin endocytosis internalises the conjugate; the receptor releases its cargo at endosomal pH and recycles. A fraction of the duplex escapes to the cytoplasm.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Guide strand loaded into Argonaute 2',
        laymanDesc:
          'The 22-letter active strand is loaded into the cell\'s silencing machinery and the folded carrier strand is discarded.',
        molecularDetail:
          'The 22-nucleotide antisense strand loads into Argonaute 2 within RISC. Nedosiran is one of the two approved siRNAs described as binding its target with near-complete rather than complete complementarity.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'LDHA messenger RNA is cut and the last enzyme disappears',
        laymanDesc:
          'The complex destroys the instructions for lactate dehydrogenase A, the enzyme that performs the final conversion into oxalate.',
        molecularDetail:
          'Argonaute 2 cleaves LDHA mRNA in its 3\' untranslated region. Hepatic lactate dehydrogenase A catalyses the terminal glyoxylate-to-oxalate step common to all primary hyperoxaluria subtypes, which is the theoretical basis for subtype-agnostic activity that PHYOX2 did not confirm in type 2.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Urinary oxalate falls in type 1 disease',
        laymanDesc:
          'Less oxalate is produced, so less reaches the kidney. Half of treated patients got to a normal or near-normal urine level; none of the placebo patients did.',
        molecularDetail:
          'Reduced hepatic oxalate synthesis produced a between-group difference of 5172 in the area under the curve of percent urinary oxalate reduction across days 90 to 180 (P<0.001), with a significant plasma oxalate reduction in the PH1 subgroup (P=0.017) and no consistent effect in the six PH2 participants.',
        iconName: 'Droplets',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'PHYOX2 (NCT03847909)',
        phase: 'Phase 2 pivotal',
        sampleSize: 35,
        primaryEndpoint:
          'Area under the curve of percent reduction from baseline in 24-hour urinary oxalate, days 90 to 180',
        endpointMet: true,
        statisticalPValue: 'P < 0.001',
        unreportedAdverseSignals:
          'The six PH2 participants showed no consistent effect; the trial was not powered to test that subgroup separately.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Between-group difference of 5172 in the AUC of percent urinary oxalate reduction across days 90 to 180 (P<0.001)',
        '50% of treated patients versus 0% on placebo reaching normal or near-normal urinary oxalate on two consecutive visits',
        'Significant plasma oxalate reduction in the PH1 subgroup (P=0.017)',
        'Injection-site reactions in 9% of treated participants, all mild and self-limiting',
      ],
      unsupportedInferences: [
        'That blocking the terminal enzyme works across all primary hyperoxaluria subtypes — the PH2 subgroup did not respond consistently',
        'That lower urinary oxalate means fewer stones or preserved kidney function; neither was measured against a control',
        'That nedosiran and lumasiran are interchangeable, or that either is superior — they have never been compared',
      ],
      whatFailedInitially: [
        'The subtype-agnostic hypothesis, in the only randomised test it has had',
      ],
      realWorldOutcome: [
        'The label restricts use to eGFR at or above 30 mL/min/1.73 m2, so the patients in greatest danger from oxalosis are outside the studied population',
        'RNAi therapy has begun to make kidney-only transplantation an option in PH1 patients who would previously have needed a combined liver-kidney transplant',
      ],
    },
    deliverySystem: {
      type: 'GalNAc stem-loop conjugate (GalXC), subcutaneous injection',
      description:
        'Prefilled syringe delivering 160 mg in 1 mL or 128 mg in 0.8 mL, and an 80 mg vial, given subcutaneously once monthly with weight-banded and age-banded dosing.',
      safetyProfile:
        'No boxed warning. The only adverse reaction reported in at least 20% of patients is injection-site reaction; in the pivotal trial these occurred in 9% and were all mild and self-limiting.',
    },
    commonQuestions: [
      {
        q: 'It targets the final step, so why does it only work in type 1?',
        a: 'That is exactly the question PHYOX2 raised and did not settle. Lactate dehydrogenase A performs the terminal glyoxylate-to-oxalate conversion in every subtype, so the theory predicts subtype-independent activity. The trial enrolled 29 PH1 and 6 PH2 patients; the PH1 group responded and the PH2 group showed no consistent effect. Six patients is too few to disprove the theory, and it was also too few to license the indication.',
        auditNote:
          'This is a case where the mechanism and the evidence point in different directions, and the label followed the evidence.',
      },
      {
        q: 'Should I take nedosiran or lumasiran?',
        a: 'There is no evidence to answer that. Both are approved for PH1 only, both were licensed on urinary oxalate rather than on stones or kidney survival, and no trial has compared them. They block different steps of the same pathway — lumasiran removes the enzyme that makes glyoxylate, nedosiran removes the enzyme that converts it to oxalate.',
      },
      {
        q: 'Why does the label restrict it to reasonably preserved kidney function?',
        a: 'Because that is who was studied. PHYOX2 required an eGFR of at least 30 mL/min/1.73 m2, and the indication follows the trial. Patients with advanced kidney failure — the ones facing systemic oxalosis — were outside the studied population, and their oxalate handling is different because the kidney is no longer clearing it.',
      },
      {
        q: 'Why does this page flag a disagreement about the sequence?',
        a: 'Because there is one, in print. A 2024 review that transcribed the approved sequences from the FDA inserts notes in its own table footnote that a separate published source lists the sixth base of the guide strand as a cytosine where the FDA label shows a guanosine. The sequence stored here is the label version, and the disagreement is recorded rather than quietly resolved.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Baum MA et al. PHYOX2: a pivotal randomized study of nedosiran in primary hyperoxaluria type 1 or 2. Kidney Int 2023;103:207-217',
        identifier: '10.1016/j.kint.2022.07.025',
        kind: 'doi',
      },
      {
        label:
          'PHYOX3: Nedosiran Long-Term Safety and Efficacy in Patients With Primary Hyperoxaluria Type 1. Kidney Int Rep 2025;10:1993-2002',
        identifier: '10.1016/j.ekir.2025.03.031',
        kind: 'doi',
      },
      { label: 'PHYOX2', identifier: 'NCT03847909', kind: 'nct' },
      {
        label: 'RIVFLOZA (nedosiran) injection, US prescribing information — DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ace9d4bc-4d20-4beb-9e9d-888690424833',
        kind: 'regulatory',
      },
      {
        label:
          'The Growing Class of Novel RNAi Therapeutics, Mol Pharmacol 2024 — Table 1 sequences and the nedosiran sequence-discrepancy footnote',
        identifier: '10.1124/molpharm.124.000895',
        kind: 'doi',
      },
      {
        label:
          'Sehgal I, Eells K, Hudson I. A Comparison of Currently Approved siRNA Medications to Alternative Treatments. Pharmacy 2024;12:58',
        identifier: '10.3390/pharmacy12020058',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC), 2026 file, prices effective 17 December 2025',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Fitusiran — the only siRNA here whose boxed warning was written out of its own trial deaths.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'fitusiran',
    name: 'Fitusiran',
    tradeName: 'Qfitlia',
    sponsor: 'Sanofi (Genzyme), developed with Alnylam Pharmaceuticals',
    targetGene: 'SERPINC1',
    targetProtein: 'Antithrombin',
    modality: 'siRNA (Small Interfering RNA)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2025,
    indication:
      'Routine prophylaxis to prevent or reduce the frequency of bleeding episodes in patients aged 12 and older with haemophilia A or B, with or without factor VIII or IX inhibitors',
    patientFriendlyIndication: 'Haemophilia A or B, including when factor replacement no longer works',
    conditionContext: {
      conditionExplainer:
        'Clotting is a balance between proteins that make clots and proteins that dissolve or restrain them. Haemophilia removes one of the clot-forming factors. Fitusiran does not put it back — it removes antithrombin, one of the natural brakes, so that whatever clotting capacity remains goes further.',
      whyItMatters:
        'Some people with haemophilia develop inhibitors, antibodies that neutralise replacement factor and leave them with almost nothing. Rebalancing works regardless of which factor is missing and regardless of inhibitor status.',
      whoTakesThis:
        'People aged 12 and over with haemophilia A or B, with or without inhibitors, on routine prophylaxis. Antithrombin activity is measured before and during treatment and the dose is adjusted to keep it inside a defined band.',
      clinicalGoals:
        'Fewer treated bleeds per year, on an injection schedule measured in months rather than days, without pushing antithrombin so low that clots form where they should not.',
    },
    oneSentenceVerdict:
      'Silences antithrombin to release the brake on clotting rather than replacing the missing factor, cutting the annualised bleeding rate by 90.8% against on-demand treatment in patients with inhibitors — and carrying a boxed warning for thrombosis written from its own trial data.',
    laymanHowItWorks:
      'Blood clotting is a tug of war between proteins that build clots and proteins that hold them back. Haemophilia takes away one of the builders. Instead of replacing it, fitusiran removes one of the holders — a liver protein called antithrombin — so the remaining builders can do more. It works whichever factor is missing, and it works even when the immune system has learned to destroy replacement factor. The danger is obvious from the mechanism: take the brake off too far and clots form where they should not, which is exactly what happened at the original dose.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    anatomicalSite: 'Hepatocyte cytoplasm (liver)',
    substitutes: {
      summary:
        'Factor replacement and emicizumab work by restoring or mimicking the missing clotting activity rather than removing a brake. All of them were the comparators fitusiran was not tested against: both pivotal trials randomised fitusiran against on-demand treatment, not against prophylaxis.',
      conventionalRx: [
        {
          name: 'Emicizumab (Hemlibra)',
          class: 'Bispecific antibody bridging factor IXa and factor X',
          howItCompares:
            'Substitutes for the missing factor VIII function rather than removing a brake, and works with or without inhibitors — but only in haemophilia A. Subcutaneous, weekly to monthly.',
          typicalCost: '',
          prosAndCons:
            'Pros: established prophylaxis standard in haemophilia A, no antithrombin monitoring. Cons: does not cover haemophilia B.',
        },
        {
          name: 'Factor VIII or factor IX concentrate',
          class: 'Recombinant or plasma-derived clotting factor replacement',
          howItCompares:
            'Replaces exactly what is missing. This was the on-demand comparator arm in both fitusiran phase 3 trials, where the annualised bleeding rate was 31.0 in haemophilia without inhibitors.',
          typicalCost: '',
          prosAndCons:
            'Pros: direct correction, decades of experience, no rebalancing risk. Cons: frequent intravenous dosing, and useless once inhibitors develop.',
        },
        {
          name: 'Bypassing agents (aPCC, recombinant factor VIIa)',
          class: 'Haemostatic agents for inhibitor patients',
          howItCompares:
            'The on-demand comparator in ATLAS-INH, where the annualised bleeding rate was 18.1. Used to treat bleeds rather than to prevent them.',
          typicalCost: '',
          prosAndCons:
            'Pros: work in the presence of inhibitors. Cons: on-demand rather than preventive, and combining them with antithrombin lowering is precisely the situation the QFITLIA label warns about.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Know your antithrombin number and the bleed-management plan that goes with it',
          action:
            'Keep a current record of the most recent antithrombin activity result and the haemophilia centre\'s written bleed-management plan, and carry both when travelling or attending any other hospital.',
          patientImpact:
            'The boxed warning names persistent antithrombin activity below 15%, an indwelling venous catheter, and the post-operative setting when bleed management guidelines were not followed as thrombosis risk factors. Every one of those is a situation where another clinician needs the information immediately.',
          clinicalPrecaution:
            'This is documentation, not self-management. Any change to dosing or to bleed management belongs to the treating haemophilia centre.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      chemicalFormula: 'C520H636F21N175Na43O309P43S6',
      molecularWeight: '17,193 Da (fitusiran sodium, per the FDA label)',
      structureSource: {
        label:
          'QFITLIA (fitusiran) US prescribing information, section 11 — molecular formula and mass. No nucleotide sequence has been published for fitusiran, so none is stored here.',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6dd2f8ac-6f90-4cbf-b197-97d74964135c',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'fit-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amidite and GalNAc support release testing',
          description:
            'Release-test the phosphoramidites and the triantennary GalNAc support. The label formula names twenty-one fluorines and six sulfurs, and both counts are release criteria for the finished conjugate.',
          reagentsAndBuffer:
            "2'-F and 2'-OMe A/C/G/U phosphoramidites, triantennary GalNAc CPG support, anhydrous acetonitrile, 31P NMR, HPLC purity, Karl Fischer titration",
        },
        {
          id: 'fit-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase assembly of both strands',
          description:
            'Assemble the sense strand on the GalNAc support and the antisense strand separately, sulfurising the terminal linkages and oxidising the rest, then cleave and deprotect.',
          dependsOnStepId: 'fit-w1',
          reagentsAndBuffer:
            '5-(ethylthio)-1H-tetrazole in acetonitrile; 3% dichloroacetic acid in toluene; acetic anhydride / N-methylimidazole capping; 0.02 M iodine in THF/pyridine/water; phenylacetyl disulfide; concentrated aqueous ammonia',
        },
        {
          id: 'fit-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange HPLC and desalting',
          description:
            'Resolve full-length product from truncation impurities and buffer-exchange into water for injection.',
          dependsOnStepId: 'fit-w2',
          reagentsAndBuffer:
            'Strong anion-exchange resin; 20 mM sodium phosphate pH 8.5 with 20% acetonitrile and a sodium bromide gradient; 3 kDa tangential-flow ultrafiltration',
        },
        {
          id: 'fit-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Duplex annealing and intact-mass confirmation',
          description:
            'Anneal the strands and confirm the conjugated duplex mass against the label formula by ion-pair LC-MS.',
          dependsOnStepId: 'fit-w3',
          reagentsAndBuffer:
            'Equimolar strands in phosphate-buffered saline from 90 degrees C; ion-pair reversed-phase LC-MS with hexafluoroisopropanol / triethylamine',
        },
        {
          id: 'fit-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Free uptake into primary human hepatocytes',
          description:
            'Dose hepatocytes with no transfection reagent so entry depends on the asialoglycoprotein receptor.',
          dependsOnStepId: 'fit-w4',
          reagentsAndBuffer:
            "Cryopreserved primary human hepatocytes, Williams' E medium with GlutaMAX, collagen-coated plates, asialofetuin competitor",
        },
        {
          id: 'fit-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'SERPINC1 knockdown, antithrombin activity and thrombin generation',
          description:
            'Quantify SERPINC1 mRNA and secreted antithrombin, then measure thrombin generation in factor-deficient plasma. All three matter, because the label ties dosing to antithrombin activity rather than to drug concentration.',
          dependsOnStepId: 'fit-w5',
          reagentsAndBuffer:
            'TaqMan Fast Advanced Master Mix with a SERPINC1 FAM probe and a GAPDH VIC control; chromogenic antithrombin activity assay; calibrated automated thrombogram in factor VIII- or IX-deficient plasma',
        },
      ],
    },
    keyAudits: [
      {
        id: 'fit-a1',
        category: 'measured',
        title: 'ATLAS-INH: 90.8% lower annualised bleeding rate in patients with inhibitors',
        laymanSummary:
          'In people whose immune systems destroy replacement factor, monthly fitusiran cut the bleeding rate roughly tenfold, and two-thirds had no treated bleeds at all.',
        technicalDetails:
          'Open-label, randomised 2:1, 57 participants aged 12 and over with haemophilia A or B with inhibitors, previously on on-demand bypassing agents. Negative binomial model-based mean annualised bleeding rate 1.7 (95% CI 1.0 to 2.7) with fitusiran prophylaxis versus 18.1 (95% CI 10.6 to 30.8) with on-demand bypassing agents, a 90.8% reduction (95% CI 80.8 to 95.6; P<0.0001). 25 of 38 (66%) had zero treated bleeds versus 1 of 19 (5%).',
        evidenceSource: 'Young G et al., Lancet 2023;401:1427-1437',
        doi: '10.1016/S0140-6736(23)00284-2',
        measuredMetric: 'Mean annualised bleeding rate over the 9-month efficacy period',
        auditFlag: 'verified',
      },
      {
        id: 'fit-a2',
        category: 'measured',
        title: 'ATLAS-A/B: bleeding rate ratio of 0.101 without inhibitors',
        laymanSummary:
          'In haemophilia without inhibitors, the bleeding rate on fitusiran was about a tenth of the on-demand rate, and half the treated group had no bleeds at all.',
        technicalDetails:
          'Open-label, randomised 2:1, 120 participants across 45 sites in 17 countries. Estimated mean annualised bleeding rate 3.1 (95% CI 2.3 to 4.3) with fitusiran versus 31.0 (95% CI 21.1 to 45.5) with on-demand clotting factor concentrates; rate ratio 0.101 (95% CI 0.064 to 0.159; P<0.0001). 40 of 79 treated participants (51%) had no treated bleeds versus 2 of 40 (5%). No treatment-related thrombosis or deaths were reported in this trial.',
        evidenceSource: 'Srivastava A et al., Lancet Haematol 2023;10:e322-e332',
        doi: '10.1016/S2352-3026(23)00037-6',
        measuredMetric: 'Annualised bleeding rate, intention-to-treat',
        auditFlag: 'verified',
      },
      {
        id: 'fit-a3',
        category: 'failed',
        title: 'The original 80 mg monthly dose caused fatal thrombosis and is no longer approved',
        laymanSummary:
          'The dose used in both pivotal trials is not the dose on the label. It caused clots, including a fatal one in the brain, and the FDA label now says it must not be used.',
        technicalDetails:
          'The QFITLIA boxed warning states that thrombotic events were reported in 2.6% of patients receiving the 80 mg once-monthly dose, at 2.3 events per 100 person-years, including a fatal event of cerebral venous sinus thrombosis, and that "the 80 mg once monthly dose is not approved or recommended for use". Thrombotic events were reported in 1.4% of patients on the approved prophylaxis regimen. Named risk factors are persistent antithrombin activity below 15%, an indwelling venous catheter and the post-operative setting when bleed-management guidelines were not followed.',
        evidenceSource: 'QFITLIA US prescribing information, boxed warning and section 5.1',
        auditFlag: 'caution',
      },
      {
        id: 'fit-a4',
        category: 'conclusion_shift',
        title: 'Dosing was rebuilt around a lab value after the programme was paused',
        laymanSummary:
          'After clots appeared, dosing stopped being a fixed monthly amount and became a target: keep antithrombin activity between 15% and 35%, and adjust the dose until it is.',
        technicalDetails:
          'The original dose regimen of 80 mg monthly was replaced by an antithrombin-based dose regimen targeting antithrombin activity of 15% to 35%, starting at 50 mg once every two months and adjusted individually. ATLAS-OLE evaluated this regimen; at interim data cut-off 213 participants were on it, 78% on a two-monthly schedule, with integrated safety analysed across 286 participants. The approved label requires antithrombin measurement before initiation, forbids starting if antithrombin activity is below 60%, and requires monitoring with an FDA-cleared test.',
        evidenceSource: 'Kenet G et al., ATLAS-OLE, Blood 2025',
        doi: '10.1182/blood.2024027008',
        auditFlag: 'verified',
      },
      {
        id: 'fit-a5',
        category: 'inferred',
        title: 'Both pivotal trials compared fitusiran against on-demand treatment, not prophylaxis',
        laymanSummary:
          'The tenfold bleeding reduction is against treating bleeds as they happen. It is not a comparison against the preventive treatments most patients would otherwise be on.',
        technicalDetails:
          'ATLAS-INH randomised against on-demand bypassing agents and ATLAS-A/B against on-demand clotting factor concentrates. Neither randomised against factor prophylaxis or against emicizumab. Both were open-label, and the annualised bleeding rate depends on participant reporting of bleeds, which is not blinded in either direction.',
        evidenceSource:
          'Young G et al., Lancet 2023;401:1427-1437; Srivastava A et al., Lancet Haematol 2023;10:e322-e332',
        doi: '10.1016/S0140-6736(23)00284-2',
        inferredClaim:
          'That fitusiran prophylaxis is superior to established factor or emicizumab prophylaxis',
        auditFlag: 'caution',
      },
      {
        id: 'fit-a6',
        category: 'measured',
        title: 'Liver enzyme elevation was the most common adverse event in both trials',
        laymanSummary:
          'About a third of patients with inhibitors and about a quarter without had raised liver enzymes on treatment, and the label requires monthly liver testing for the first six months.',
        technicalDetails:
          'Increased alanine aminotransferase was the most frequent treatment-emergent adverse event in ATLAS-INH, in 13 of 41 safety-population participants (32%), with none in the comparator arm, and in 18 of 79 (23%) in ATLAS-A/B. The label requires liver tests at baseline, monthly for at least six months after initiation and after any dose increase, and periodically thereafter. Acute and recurrent gallbladder disease shares the boxed warning with thrombosis.',
        evidenceSource:
          'Young G et al., Lancet 2023;401:1427-1437; QFITLIA US prescribing information',
        doi: '10.1016/S0140-6736(23)00284-2',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Subcutaneous injection, dosed to a laboratory target',
        laymanDesc:
          'An injection under the skin every two months for most people, but the amount is set by a blood test rather than fixed, because the whole treatment is a balancing act.',
        molecularDetail:
          'A triantennary GalNAc conjugate binds hepatocyte ASGPR. Uniquely among the drugs on this page, the label ties dosing to a pharmacodynamic measurement — antithrombin activity, maintained between 15% and 35% using an FDA-cleared assay — rather than to body weight or a fixed schedule.',
        iconName: 'Target',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Uptake into the liver cell',
        laymanDesc:
          'Liver cells recognise the sugar tag and internalise the drug, holding a reservoir that releases over weeks.',
        molecularDetail:
          'ASGPR-mediated endocytosis delivers the conjugate to the endosome; the receptor recycles and a fraction of the duplex escapes into the cytoplasm, with the endolysosomal depot supporting a two-monthly interval.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Guide strand loaded into the silencing complex',
        laymanDesc:
          'One strand is loaded into the cell\'s gene-silencing machinery; the other is discarded.',
        molecularDetail:
          'The antisense strand loads into Argonaute 2 within RISC. No nucleotide sequence has been published for fitusiran, so this page records the chemistry from the label formula — twenty-one fluorines and six phosphorothioate sulfurs — and does not assert a sequence.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'SERPINC1 messenger RNA is cut and antithrombin production falls',
        laymanDesc:
          'The complex destroys the instructions for antithrombin, the protein that restrains clotting. With less of it, the clotting that remains goes further.',
        molecularDetail:
          'Argonaute 2 cleaves SERPINC1 mRNA, reducing hepatic antithrombin synthesis. Antithrombin is the principal physiological inhibitor of thrombin and factor Xa, so lowering it increases thrombin generation independently of which coagulation factor is deficient — the reason the drug covers haemophilia A and B, with or without inhibitors.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Rebalanced haemostasis, and a narrow window',
        laymanDesc:
          'Bleeding falls sharply. Push antithrombin too low and the balance tips the other way into dangerous clots, which is why the dose is chased to a target rather than fixed.',
        molecularDetail:
          'Increased thrombin generation reduced the annualised bleeding rate by 90.8% against on-demand bypassing agents and gave a rate ratio of 0.101 against on-demand factor. The therapeutic window is defined by antithrombin activity: persistent activity below 15% is a named risk factor for thrombosis in the boxed warning, and the target band is 15% to 35%.',
        iconName: 'Scale',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ATLAS-INH (NCT03417102)',
        phase: 'Phase 3, open-label',
        sampleSize: 57,
        primaryEndpoint: 'Mean annualised bleeding rate over the 9-month efficacy period',
        endpointMet: true,
        statisticalPValue: 'P < 0.0001',
        unreportedAdverseSignals:
          'Increased alanine aminotransferase in 32% of the fitusiran safety population and none in the comparator arm; suspected or confirmed thromboembolic events in 2 of 38 participants (5%). The 80 mg monthly regimen used here is no longer approved.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'ATLAS-A/B (NCT03417245)',
        phase: 'Phase 3, open-label',
        sampleSize: 120,
        primaryEndpoint: 'Annualised bleeding rate, intention-to-treat',
        endpointMet: true,
        statisticalPValue: 'P < 0.0001 (rate ratio 0.101, 95% CI 0.064 to 0.159)',
        unreportedAdverseSignals:
          'Increased alanine aminotransferase in 23% of the fitusiran safety population. No treatment-related thrombosis or deaths in this trial, though thrombosis appeared elsewhere in the programme.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '90.8% lower annualised bleeding rate against on-demand bypassing agents in haemophilia with inhibitors',
        'Rate ratio 0.101 against on-demand factor concentrate in haemophilia without inhibitors',
        '66% and 51% of treated participants with zero treated bleeds, against 5% in both comparator arms',
        'Thrombotic events in 2.6% of patients on the withdrawn 80 mg monthly dose, including a fatal cerebral venous sinus thrombosis',
      ],
      unsupportedInferences: [
        'That fitusiran is better than factor prophylaxis or emicizumab — neither was a randomised comparator',
        'That the trial bleeding rates transfer to the approved regimen, which is a different dose on a different schedule',
        'That an open-label, patient-reported bleeding count is free of expectation effects in either direction',
      ],
      whatFailedInitially: [
        'The 80 mg once-monthly regimen used throughout the phase 3 programme, now explicitly not approved or recommended in the FDA label',
        'Dosing to a fixed amount at all: the regimen was rebuilt around a target antithrombin activity band of 15% to 35%',
      ],
      realWorldOutcome: [
        'The approved schedule is as few as six injections a year, against intravenous factor several times a week',
        'Treatment now requires a laboratory service — antithrombin activity measured on an FDA-cleared assay — as a condition of safe use',
      ],
    },
    deliverySystem: {
      type: 'GalNAc-conjugated siRNA, subcutaneous prefilled pen or vial',
      description:
        'A 50 mg single-dose prefilled pen delivering 0.5 mL, and a 20 mg single-dose vial delivering 0.2 mL, for subcutaneous use under the supervision of a clinician experienced in bleeding disorders. Antithrombin activity is measured before initiation and monitored on an FDA-cleared test thereafter.',
      safetyProfile:
        'Boxed warning for thrombotic events and for acute and recurrent gallbladder disease. Additional warning for hepatotoxicity, with liver tests required at baseline, monthly for at least six months after initiation and after dose increases, and periodically thereafter. Common adverse reactions above 10% are viral infection, nasopharyngitis and bacterial infection.',
    },
    commonQuestions: [
      {
        q: 'How can a drug that removes a clotting brake be safe in a bleeding disorder?',
        a: 'It is safe only inside a narrow band, and the label is built around policing that band. Antithrombin restrains thrombin; removing some of it lets whatever clotting capacity remains do more work. Remove too much and clots form. The boxed warning names persistent antithrombin activity below 15% as a thrombosis risk factor, dosing targets 15% to 35%, and treatment cannot be started if antithrombin activity is below 60%.',
      },
      {
        q: 'Is the dose in the published trials the dose I would receive?',
        a: 'No. Both ATLAS-INH and ATLAS-A/B used 80 mg once monthly. That regimen produced thrombotic events in 2.6% of patients including a fatal cerebral venous sinus thrombosis, and the FDA label now states it is not approved or recommended for use. The approved regimen starts at 50 mg once every two months and is adjusted to the antithrombin target.',
        auditNote:
          'This is the clearest case on the site of headline efficacy numbers being generated by a regimen that was subsequently withdrawn.',
      },
      {
        q: 'Is it better than emicizumab?',
        a: 'Unknown. Fitusiran was never randomised against emicizumab, or against factor prophylaxis. Both pivotal trials used on-demand treatment as the comparator, which is a much lower bar. What fitusiran offers that emicizumab does not is coverage of haemophilia B as well as A.',
      },
      {
        q: 'Why does this page not show a sequence?',
        a: 'Because no nucleotide sequence for fitusiran has been published in a source this file could verify. The FDA label gives the molecular formula and mass, which are recorded, and prints the structure only as an image. Inventing a plausible sequence to fill the gap would be worse than leaving it empty, so it is left empty and the structure carries no machine-verification badge.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Young G et al. Efficacy and safety of fitusiran prophylaxis in people with haemophilia A or B with inhibitors (ATLAS-INH). Lancet 2023;401:1427-1437',
        identifier: '10.1016/S0140-6736(23)00284-2',
        kind: 'doi',
      },
      {
        label:
          'Srivastava A et al. Fitusiran prophylaxis in people with severe haemophilia A or B without inhibitors (ATLAS-A/B). Lancet Haematol 2023;10:e322-e332',
        identifier: '10.1016/S2352-3026(23)00037-6',
        kind: 'doi',
      },
      {
        label:
          'Safety and efficacy of a fitusiran antithrombin-based dose regimen in people with hemophilia A or B: the ATLAS-OLE study. Blood 2025',
        identifier: '10.1182/blood.2024027008',
        kind: 'doi',
      },
      { label: 'ATLAS-INH', identifier: 'NCT03417102', kind: 'nct' },
      { label: 'ATLAS-A/B', identifier: 'NCT03417245', kind: 'nct' },
      {
        label: 'QFITLIA (fitusiran) injection, US prescribing information — DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6dd2f8ac-6f90-4cbf-b197-97d74964135c',
        kind: 'regulatory',
      },
      {
        label:
          'FDA Approves Novel Treatment for Hemophilia A or B, with or without Factor Inhibitors, 28 March 2025',
        identifier:
          'https://www.fda.gov/news-events/press-announcements/fda-approves-novel-treatment-hemophilia-or-b-or-without-factor-inhibitors',
        kind: 'regulatory',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Olpasiran — a near-total biomarker reduction with no outcome data, in a target that has burned
  // the field before.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'olpasiran',
    name: 'Olpasiran',
    tradeName: 'AMG 890 (investigational)',
    sponsor: 'Amgen',
    targetGene: 'LPA',
    targetProtein: 'Apolipoprotein(a)',
    modality: 'siRNA (Small Interfering RNA)',
    approvalStatus: 'Phase 3 Clinical Trial',
    indication:
      'Investigational: reduction of lipoprotein(a) in adults with established atherosclerotic cardiovascular disease and elevated lipoprotein(a)',
    patientFriendlyIndication: 'High lipoprotein(a) — an inherited cardiovascular risk factor with no approved treatment',
    conditionContext: {
      conditionExplainer:
        'Lipoprotein(a) is an LDL particle with an extra protein, apolipoprotein(a), bolted onto it. How much of it a person carries is set almost entirely by the LPA gene they inherited, it barely moves with diet or exercise, and about one adult in five carries a level considered high.',
      whyItMatters:
        'Genetic studies place lipoprotein(a) upstream of atherosclerosis and aortic stenosis, and it is the commonest inherited cardiovascular risk factor for which no approved treatment exists. Statins do not lower it.',
      whoTakesThis:
        'In trials so far, adults with established atherosclerotic cardiovascular disease and a lipoprotein(a) concentration above 150 nmol/L, almost all of them already on a statin.',
      clinicalGoals:
        'The trial goal has been to remove lipoprotein(a) from circulation. Whether removing it prevents events is the question the phase 3 trial exists to answer, and it has not answered it yet.',
    },
    oneSentenceVerdict:
      'Silences apolipoprotein(a) production so completely that placebo-adjusted lipoprotein(a) fell by 97% to 101% at week 36 in phase 2 — a biomarker that no drug has yet been shown to lower to any clinical benefit.',
    laymanHowItWorks:
      'Lipoprotein(a) is a cholesterol particle with an extra protein attached, and how much you have is decided by the genes you were born with. Olpasiran is a short RNA with a liver-targeting sugar tag; it tells liver cells to destroy the instructions for that extra protein, so the particle cannot be assembled. In the phase 2 trial the level fell essentially to the floor of the assay. Whether that prevents heart attacks is being tested now in 7,297 people, and the answer is not expected before 2028.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 52,
    anatomicalSite: 'Hepatocyte cytoplasm (liver)',
    substitutes: {
      summary:
        'Nothing approved lowers lipoprotein(a) meaningfully. Lipoprotein apheresis removes it mechanically. Everything else on this list is a way of reducing the rest of a patient\'s cardiovascular risk, which is currently the only evidence-based response to a high lipoprotein(a) result.',
      conventionalRx: [
        {
          name: 'Intensive LDL lowering (high-intensity statin plus ezetimibe)',
          class: 'HMG-CoA reductase inhibitor plus NPC1L1 inhibitor',
          howItCompares:
            'Does not lower lipoprotein(a). It lowers the rest of the atherogenic particle burden, which is the only intervention with outcome evidence available to a patient with a high lipoprotein(a) today.',
          typicalCost:
            'US$0.042 per 40 mg atorvastatin tablet and US$0.074 per 10 mg ezetimibe tablet at pharmacy acquisition cost (CMS NADAC, effective 17 December 2025) — under US$4 a month combined',
          prosAndCons:
            'Pros: cheap, and it is the option with completed outcome trials. Cons: it does not touch the risk factor in question.',
        },
        {
          name: 'Lipoprotein apheresis',
          class: 'Extracorporeal removal of apoB-containing lipoproteins',
          howItCompares:
            'Physically removes lipoprotein(a) from the circulation rather than stopping its synthesis. Used in specialist centres for severe refractory cases.',
          typicalCost: '',
          prosAndCons:
            'Pros: acts immediately and does not depend on a genetic pathway. Cons: repeated sessions, vascular access, and availability limited to a small number of centres.',
        },
        {
          name: 'Extended-release niacin',
          class: 'Nicotinic acid derivative',
          howItCompares:
            'The cautionary precedent for this whole page. Niacin moved every lipid marker in the direction the field wanted and produced no reduction in vascular events in two large outcome trials.',
          typicalCost:
            'US$0.275 per 1,000 mg extended-release tablet at pharmacy acquisition cost (CMS NADAC, effective 17 December 2025)',
          prosAndCons:
            'Pros: cheap, and instructive. Cons: AIM-HIGH was stopped early for lack of efficacy and HPS2-THRIVE found no significant effect on major vascular events in 25,673 patients.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Have lipoprotein(a) measured once, in nmol/L',
          action:
            'Ask for a single lipoprotein(a) measurement reported in nmol/L rather than mg/dL, and keep the result.',
          patientImpact:
            'The level is largely genetic and stable through life, so one measurement usually settles the question for good. Reporting units matter: nmol/L counts particles and mg/dL weighs mass, and apolipoprotein(a) varies enormously in size between people, so the two are not reliably interconvertible.',
          clinicalPrecaution:
            'A high result does not currently lead to a lipoprotein(a)-lowering treatment, because none is approved. It changes how aggressively the rest of the risk profile is treated.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      laboratoryWorkflow: [
        {
          id: 'olp-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amidite and GalNAc support release testing',
          description:
            'Release-test amidites and the GalNAc support. No nucleotide sequence, molecular formula or mass has been published for olpasiran in a source this file could verify, so the record here describes the process class rather than asserting the molecule.',
          reagentsAndBuffer:
            "2'-F and 2'-OMe A/C/G/U phosphoramidites, triantennary GalNAc CPG support, anhydrous acetonitrile, 31P NMR, HPLC purity, Karl Fischer titration",
        },
        {
          id: 'olp-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase phosphoramidite assembly of both strands',
          description:
            'Assemble the sense strand on the conjugated support and the antisense strand separately, with sulfurisation at the terminal linkages, then cleave and deprotect.',
          dependsOnStepId: 'olp-w1',
          reagentsAndBuffer:
            '5-(ethylthio)-1H-tetrazole in acetonitrile; 3% dichloroacetic acid in toluene; acetic anhydride / N-methylimidazole capping; 0.02 M iodine in THF/pyridine/water; phenylacetyl disulfide; concentrated aqueous ammonia',
        },
        {
          id: 'olp-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange HPLC and desalting',
          description:
            'Resolve full-length product from truncations and exchange into water for injection.',
          dependsOnStepId: 'olp-w2',
          reagentsAndBuffer:
            'Strong anion-exchange resin; 20 mM sodium phosphate pH 8.5 with 20% acetonitrile and a sodium bromide gradient; 3 kDa tangential-flow ultrafiltration',
        },
        {
          id: 'olp-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Free uptake into primary human hepatocytes',
          description:
            'Dose hepatocytes without transfection reagent so entry depends on the asialoglycoprotein receptor, with an asialofetuin block as the specificity control.',
          dependsOnStepId: 'olp-w3',
          reagentsAndBuffer:
            "Cryopreserved primary human hepatocytes, Williams' E medium with GlutaMAX, collagen-coated plates, asialofetuin competitor",
        },
        {
          id: 'olp-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'LPA knockdown and apolipoprotein(a) secretion',
          description:
            'Quantify LPA transcript by RT-qPCR and secreted apolipoprotein(a) by an isoform-independent immunoassay, because apolipoprotein(a) size varies widely between donors and a mass-based assay would confound knockdown with isoform size.',
          dependsOnStepId: 'olp-w4',
          reagentsAndBuffer:
            'TaqMan Fast Advanced Master Mix with an LPA FAM probe and a GAPDH VIC control; isoform-independent apolipoprotein(a) immunoassay calibrated in nmol/L',
        },
      ],
    },
    keyAudits: [
      {
        id: 'olp-a1',
        category: 'measured',
        title: 'OCEAN(a)-DOSE: placebo-adjusted lipoprotein(a) reduction of 97% to 101% at week 36',
        laymanSummary:
          'Lipoprotein(a) fell essentially to nothing at the higher doses, in patients whose baseline level was more than three times the threshold considered high.',
        technicalDetails:
          'Randomised, double-blind, placebo-controlled dose-finding trial in 281 patients with established atherosclerotic cardiovascular disease and lipoprotein(a) above 150 nmol/L. Median baseline lipoprotein(a) 260.3 nmol/L; median LDL-C 67.5 mg/dL; 88% on a statin, 52% on ezetimibe, 23% on a PCSK9 inhibitor. Placebo-adjusted mean percent change at week 36: -70.5% (10 mg every 12 weeks), -97.4% (75 mg every 12 weeks), -101.1% (225 mg every 12 weeks) and -100.5% (225 mg every 24 weeks). Injection-site reactions, mostly pain, were the most common drug-related adverse events.',
        evidenceSource: "O'Donoghue ML et al., N Engl J Med 2022;387:1855-1864",
        doi: '10.1056/NEJMoa2211023',
        measuredMetric: 'Placebo-adjusted mean percent change in lipoprotein(a) at week 36',
        auditFlag: 'verified',
      },
      {
        id: 'olp-a2',
        category: 'inferred',
        title: 'No trial has shown that lowering lipoprotein(a) prevents anything',
        laymanSummary:
          'Genetics say lipoprotein(a) causes heart disease. No drug has yet shown that removing it prevents heart attacks, and olpasiran\'s outcome trial does not finish until 2028.',
        technicalDetails:
          'OCEAN(a)-Outcomes (NCT05581303) is a phase 3 cardiovascular outcome trial with 7,297 participants enrolled, currently active but not recruiting, with a primary completion date of 31 March 2028. The phase 2 trial\'s own conclusion states that "longer and larger trials will be necessary to determine the effect of olpasiran therapy on cardiovascular disease". Until that reports, the causal argument rests on Mendelian randomisation and epidemiology, not on a randomised drug trial.',
        evidenceSource:
          "O'Donoghue ML et al., N Engl J Med 2022;387:1855-1864; OCEAN(a)-Outcomes registry record",
        doi: '10.1056/NEJMoa2211023',
        inferredClaim:
          'That near-complete removal of lipoprotein(a) will reduce myocardial infarction, stroke or cardiovascular death',
        auditFlag: 'caution',
      },
      {
        id: 'olp-a3',
        category: 'failed',
        title: 'The precedent: niacin moved every lipid marker and prevented nothing',
        laymanSummary:
          'The last drug class to be added on top of statins because it improved a blood measurement was niacin. Two large trials found no benefit, and one was stopped early for futility.',
        technicalDetails:
          'AIM-HIGH randomised 3,414 patients to extended-release niacin or placebo on background simvastatin and was stopped after a mean 3 years for lack of efficacy, despite raising HDL-C from 35 to 42 mg/dL and lowering triglycerides and LDL-C. HPS2-THRIVE randomised 25,673 patients to extended-release niacin with laropiprant or placebo; over a median 3.9 years the niacin arm had LDL-C 10 mg/dL lower and HDL-C 6 mg/dL higher, with major vascular events in 13.2% versus 13.7%, rate ratio 0.96. This is why a 100% biomarker reduction is not the same as a treatment.',
        evidenceSource:
          'AIM-HIGH, N Engl J Med 2011;365:2255-2267; HPS2-THRIVE, N Engl J Med 2014;371:203-212',
        doi: '10.1056/NEJMoa1300955',
        auditFlag: 'verified',
      },
      {
        id: 'olp-a4',
        category: 'measured',
        title: 'A placebo-adjusted reduction above 100% is arithmetic, not a miracle',
        laymanSummary:
          'One dose group shows -101.1%. That does not mean lipoprotein(a) went below zero. It means the placebo group\'s level rose while the treated group\'s fell to the bottom of the assay.',
        technicalDetails:
          'Lipoprotein(a) increased by a mean of 3.6% in the placebo group over 36 weeks. A placebo-adjusted change is the treated change minus the placebo change, so a treated reduction approaching 100% against a rising comparator produces a figure past -100%. Reading -101.1% as more than complete elimination is a units error, and it is the kind of number that gets quoted without its denominator.',
        evidenceSource: "O'Donoghue ML et al., N Engl J Med 2022;387:1855-1864",
        doi: '10.1056/NEJMoa2211023',
        measuredMetric: 'Placebo-adjusted percent change, where the placebo arm rose 3.6%',
        auditFlag: 'verified',
      },
      {
        id: 'olp-a5',
        category: 'measured',
        title: 'The effect persists for about a year after the last dose',
        laymanSummary:
          'Nearly a year after their final injection, patients still had lipoprotein(a) roughly 40% below where they started. That is durability, and it is also irreversibility.',
        technicalDetails:
          'In the OCEAN(a)-DOSE extension, 276 of 281 participants entered off-treatment follow-up after the last dose at week 36. For the 225 mg every-12-weeks group, placebo-adjusted mean percent change from baseline was -84.4%, -61.6%, -52.2% and -36.4% at weeks 60, 72, 84 and 96 respectively, all P<0.001. No new safety concerns were identified. Participants on doses of 75 mg or above sustained a 40% to 50% reduction close to one year after the last dose.',
        evidenceSource: "O'Donoghue ML et al., J Am Coll Cardiol 2024;84:790-797",
        doi: '10.1016/j.jacc.2024.05.058',
        measuredMetric: 'Off-treatment placebo-adjusted percent change in lipoprotein(a)',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Subcutaneous injection every 12 weeks with a liver tag',
        laymanDesc:
          'An injection under the skin once every three months. The sugar tag makes liver cells absorb it, which matters because the liver is the only place lipoprotein(a) is made.',
        molecularDetail:
          'A GalNAc-conjugated duplex binds hepatocyte ASGPR. Doses of 75 mg and above every 12 weeks produced the near-complete reductions in phase 2; a 225 mg every-24-weeks arm performed comparably at week 36.',
        iconName: 'Target',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Receptor-mediated uptake into the hepatocyte',
        laymanDesc:
          'The liver cell pulls the drug inside and retains a slowly released reservoir, which is why the effect outlasts the drug by many months.',
        molecularDetail:
          'ASGPR-mediated endocytosis routes the conjugate to the endosome; a fraction escapes into the cytoplasm and the remainder forms the depot responsible for the year-long off-treatment persistence measured in the extension study.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Guide strand loaded into Argonaute 2',
        laymanDesc:
          'The active strand is loaded into the cell\'s silencing machinery. No sequence has been published for this drug, so this page describes the mechanism, not the letters.',
        molecularDetail:
          'The antisense strand loads into Argonaute 2 within RISC and directs it to LPA transcripts. No nucleotide sequence for olpasiran has been published in a verifiable source, so none is recorded here and the structure carries no machine-verification badge.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'LPA messenger RNA is cut and apolipoprotein(a) is never made',
        laymanDesc:
          'The complex destroys the instructions for the extra protein. Without it the lipoprotein(a) particle cannot be assembled at all.',
        molecularDetail:
          'Argonaute 2 cleaves LPA mRNA, preventing translation of apolipoprotein(a). Lipoprotein(a) assembly requires a disulfide link between apolipoprotein(a) and the apolipoprotein B-100 of an LDL particle, so with no apolipoprotein(a) available the particle is not formed rather than being cleared faster.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Circulating lipoprotein(a) approaches the assay floor',
        laymanDesc:
          'The measured level drops essentially to nothing at the higher doses, and stays far below baseline for about a year after the last injection.',
        molecularDetail:
          'Placebo-adjusted reductions of 97.4% to 101.1% at week 36, from a median baseline of 260.3 nmol/L. Whether that produces a clinical benefit is unknown: the phase 3 outcome trial has 7,297 participants and a primary completion date of March 2028.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'OCEAN(a)-DOSE (NCT04270760)',
        phase: 'Phase 2',
        sampleSize: 281,
        primaryEndpoint:
          'Placebo-adjusted mean percent change in lipoprotein(a) from baseline to week 36',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 for all dose comparisons with baseline',
        unreportedAdverseSignals:
          'A dose-finding trial with a biomarker endpoint. It was neither designed nor powered to detect a difference in clinical events.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'OCEAN(a)-Outcomes (NCT05581303)',
        phase: 'Phase 3 cardiovascular outcome trial',
        sampleSize: 7297,
        primaryEndpoint: 'Major adverse cardiovascular events',
        endpointMet: false,
        statisticalPValue: 'Not reported — primary completion date 31 March 2028',
        unreportedAdverseSignals:
          'The trial has not reported. `endpointMet: false` here means "no result exists yet", not "the endpoint was missed".',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Placebo-adjusted lipoprotein(a) reduction of 70.5% to 101.1% at week 36 across four dose groups',
        'A 40% to 50% reduction still present close to one year after the last dose',
        'Injection-site reactions, principally pain, as the most common drug-related adverse event',
      ],
      unsupportedInferences: [
        'That lowering lipoprotein(a) reduces cardiovascular events — the trial designed to test this reports in 2028',
        'That -101.1% means more than total elimination; it is a placebo-adjusted figure against a comparator arm that rose 3.6%',
        'That a Mendelian randomisation argument for causality is evidence that a drug intervention works',
      ],
      whatFailedInitially: [
        'Niacin, the previous lipid biomarker added on top of statins, failed in AIM-HIGH and in 25,673 patients in HPS2-THRIVE',
      ],
      realWorldOutcome: [
        'No lipoprotein(a)-lowering therapy is approved anywhere, so a high result currently changes how aggressively other risk factors are treated and nothing else',
        'The year-long persistence after the last dose is an efficiency argument and a safety consideration at the same time: the effect cannot be withdrawn quickly',
      ],
    },
    deliverySystem: {
      type: 'GalNAc-conjugated siRNA, subcutaneous injection (investigational)',
      description:
        'Subcutaneous administration every 12 weeks in the doses that produced near-complete reductions, with a 24-weekly arm also studied. No approved presentation exists.',
      safetyProfile:
        'In phase 2 the overall incidence of adverse events was similar across trial groups, and the most common drug-related events were injection-site reactions, primarily pain. The extension study identified no new safety concerns over a median 86 weeks of study exposure. There is no FDA label, so there is no labelled warning set.',
    },
    commonQuestions: [
      {
        q: 'If it removes almost all of my lipoprotein(a), does that make me safer?',
        a: 'Nobody knows. That is not hedging — it is the actual state of the evidence. The phase 2 trial measured a blood level and said so in its own conclusion: longer and larger trials will be necessary to determine the effect on cardiovascular disease. OCEAN(a)-Outcomes, with 7,297 participants, has a primary completion date of March 2028.',
        auditNote:
          'Every drug on this page that lowers a number has this question. Olpasiran is the one where the answer is furthest away.',
      },
      {
        q: 'Why does one dose group show a reduction of more than 100%?',
        a: 'Because the figure is placebo-adjusted and lipoprotein(a) rose 3.6% in the placebo group. Subtract a rise from a near-total fall and you get a number past -100%. It does not mean the level went below zero, and quoting it without the placebo change attached makes it sound like something it is not.',
      },
      {
        q: 'Can I lower lipoprotein(a) with diet?',
        a: 'Not meaningfully, and this page cites no dietary option because there is none to cite. Lipoprotein(a) is set almost entirely by the LPA gene and is stable through adult life. That is precisely why an siRNA against LPA was worth building.',
      },
      {
        q: 'What happens if I stop?',
        a: 'The level comes back slowly. In the extension study, patients on 225 mg every 12 weeks were still 84.4% below baseline at week 60 and 36.4% below at week 96, roughly a year after their last injection. That durability is convenient and it also means the effect cannot be reversed quickly if a reason to reverse it emerged.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          "O'Donoghue ML et al. Small Interfering RNA to Reduce Lipoprotein(a) in Cardiovascular Disease (OCEAN(a)-DOSE). N Engl J Med 2022;387:1855-1864",
        identifier: '10.1056/NEJMoa2211023',
        kind: 'doi',
      },
      {
        label:
          "O'Donoghue ML et al. The Off-Treatment Effects of Olpasiran on Lipoprotein(a) Lowering. J Am Coll Cardiol 2024;84:790-797",
        identifier: '10.1016/j.jacc.2024.05.058',
        kind: 'doi',
      },
      { label: 'OCEAN(a)-DOSE', identifier: 'NCT04270760', kind: 'nct' },
      { label: 'OCEAN(a)-Outcomes', identifier: 'NCT05581303', kind: 'nct' },
      {
        label:
          'AIM-HIGH. Niacin in patients with low HDL cholesterol levels receiving intensive statin therapy. N Engl J Med 2011;365:2255-2267',
        identifier: '10.1056/NEJMoa1107579',
        kind: 'doi',
      },
      {
        label:
          'HPS2-THRIVE. Effects of extended-release niacin with laropiprant in high-risk patients. N Engl J Med 2014;371:203-212',
        identifier: '10.1056/NEJMoa1300955',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC), 2026 file, prices effective 17 December 2025',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Zilebesiran — the effect that cannot be switched off, and the one that shrinks when the
  // background therapy already blocks the same pathway.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'zilebesiran',
    name: 'Zilebesiran',
    tradeName: 'ALN-AGT01 (investigational)',
    sponsor: 'Alnylam Pharmaceuticals (with Roche)',
    targetGene: 'AGT',
    targetProtein: 'Angiotensinogen',
    modality: 'siRNA (Small Interfering RNA)',
    approvalStatus: 'Phase 2 Investigational',
    indication:
      'Investigational: hypertension, studied as monotherapy and as add-on to standard antihypertensive therapy',
    patientFriendlyIndication: 'High blood pressure, dosed twice a year instead of daily',
    conditionContext: {
      conditionExplainer:
        'The renin-angiotensin system is a cascade: the liver makes angiotensinogen, renin cuts it, and further processing produces angiotensin II, which constricts blood vessels and retains salt. Almost every blood pressure drug that targets this system acts somewhere downstream. Zilebesiran removes the raw material at the top.',
      whyItMatters:
        'Roughly half of treated hypertensive patients never reach target, and the commonest reason is that daily tablets are not taken daily. An injection given twice a year removes adherence from the equation entirely.',
      whoTakesThis:
        'In trials so far, adults with mild to moderate hypertension after antihypertensive washout, and adults whose blood pressure remains uncontrolled on one or more standard agents.',
      clinicalGoals:
        'Sustained reduction in 24-hour ambulatory systolic blood pressure from a single injection, on a dosing interval of three to six months.',
    },
    oneSentenceVerdict:
      'Silences hepatic angiotensinogen at the top of the blood-pressure cascade, lowering 24-hour ambulatory systolic pressure by 14 to 17 mmHg against placebo at three months from a single injection — with hyperkalaemia and acute kidney injury signals, and an effect that cannot be switched off for six months.',
    laymanHowItWorks:
      'Your body makes a hormone chain that tightens blood vessels, and it starts with a protein the liver produces called angiotensinogen. Most blood pressure pills interrupt that chain somewhere in the middle. Zilebesiran stops the liver making the starting material at all. One injection lowers blood pressure for three to six months, which solves the problem of forgotten tablets and creates a new one: if the pressure needs to come back up quickly, there is no way to make that happen.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 55,
    anatomicalSite: 'Hepatocyte cytoplasm (liver)',
    substitutes: {
      summary:
        'The three drugs zilebesiran was tested on top of in KARDIA-2 are generic and cost a few dollars a month between them. That trial is also where the honest comparison lives: added to a diuretic the extra reduction was 12.1 mmHg, and added to an angiotensin receptor blocker acting on the same pathway it was 4.5 mmHg.',
      conventionalRx: [
        {
          name: 'Amlodipine (generic)',
          class: 'Dihydropyridine calcium channel blocker',
          howItCompares:
            'Acts on vascular smooth muscle, a completely different pathway. In KARDIA-2, zilebesiran added 9.7 mmHg on top of it.',
          typicalCost:
            'US$0.011 per 5 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 17 December 2025) — about US$0.33 for a 30-day supply',
          prosAndCons:
            'Pros: pennies, decades of outcome data, oral. Cons: taken daily, and ankle oedema is common.',
        },
        {
          name: 'Indapamide (generic)',
          class: 'Thiazide-like diuretic',
          howItCompares:
            'Reduces volume rather than vasoconstriction, and activates the renin-angiotensin system as a counter-regulatory response — which is why zilebesiran added the most on top of it, 12.1 mmHg.',
          typicalCost:
            'US$0.119 per 2.5 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 17 December 2025) — about US$3.56 for a 30-day supply',
          prosAndCons:
            'Pros: cheap, and mechanistically complementary. Cons: electrolyte monitoring, and combining a diuretic with angiotensinogen silencing is exactly the setting where hyperkalaemia and kidney injury need watching.',
        },
        {
          name: 'Olmesartan (generic)',
          class: 'Angiotensin II receptor blocker',
          howItCompares:
            'Blocks the same pathway at the receptor rather than at the source. In KARDIA-2 the added benefit of zilebesiran on top of it was 4.5 mmHg, the smallest of the three cohorts.',
          typicalCost:
            'US$0.123 per 40 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 17 December 2025) — about US$3.68 for a 30-day supply',
          prosAndCons:
            'Pros: cheap, outcome evidence, reversible within days if it needs to stop. Cons: taken daily.',
        },
      ],
      naturalFoods: [
        {
          name: 'Dietary sodium reduction',
          activeCompound: 'Sodium (reduction rather than supplementation)',
          biologicalMechanism:
            'Lower sodium intake reduces extracellular volume and lowers blood pressure. It also interacts directly with this drug: in the phase 1 study the antihypertensive effect of zilebesiran was attenuated on a high-salt diet and augmented by an angiotensin receptor blocker.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'EFSA considers a sodium intake of 2.0 g/day the level at which there is sufficient confidence in a reduced cardiovascular risk in the general adult population (EFSA Journal, 2019)',
          monthlyCost: 'No cost — this is a reduction, not a purchase',
        },
      ],
      homeRemedies: [
        {
          name: 'Measure at home, not only in the clinic',
          action:
            'Use a validated upper-arm home monitor and record readings over a week, or ask for 24-hour ambulatory monitoring.',
          patientImpact:
            'Every efficacy figure in KARDIA-1 and KARDIA-2 is a 24-hour ambulatory measurement, not an office reading. KARDIA-3 used office systolic pressure and produced a much smaller number. Comparing across those two kinds of measurement is not valid.',
          clinicalPrecaution:
            'Home readings inform the conversation with the clinician; they do not replace it, and no dose should change on the strength of them alone.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      laboratoryWorkflow: [
        {
          id: 'zil-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amidite and GalNAc support release testing',
          description:
            'Release-test amidites and the GalNAc support. No nucleotide sequence, molecular formula or mass has been published for zilebesiran in a source this file could verify, so nothing about the molecule itself is asserted here.',
          reagentsAndBuffer:
            "2'-F and 2'-OMe A/C/G/U phosphoramidites, triantennary GalNAc CPG support, anhydrous acetonitrile, 31P NMR, HPLC purity, Karl Fischer titration",
        },
        {
          id: 'zil-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase phosphoramidite assembly of both strands',
          description:
            'Assemble the conjugated sense strand and the antisense strand, with sulfurisation at the terminal linkages, then cleave and deprotect.',
          dependsOnStepId: 'zil-w1',
          reagentsAndBuffer:
            '5-(ethylthio)-1H-tetrazole in acetonitrile; 3% dichloroacetic acid in toluene; acetic anhydride / N-methylimidazole capping; 0.02 M iodine in THF/pyridine/water; phenylacetyl disulfide; concentrated aqueous ammonia',
        },
        {
          id: 'zil-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange HPLC and desalting',
          description:
            'Resolve full-length product from truncations and exchange into water for injection.',
          dependsOnStepId: 'zil-w2',
          reagentsAndBuffer:
            'Strong anion-exchange resin; 20 mM sodium phosphate pH 8.5 with 20% acetonitrile and a sodium bromide gradient; 3 kDa tangential-flow ultrafiltration',
        },
        {
          id: 'zil-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Free uptake into primary human hepatocytes',
          description:
            'Dose hepatocytes without transfection reagent so uptake is ASGPR-dependent, with an asialofetuin block as the specificity control.',
          dependsOnStepId: 'zil-w3',
          reagentsAndBuffer:
            "Cryopreserved primary human hepatocytes, Williams' E medium with GlutaMAX, collagen-coated plates, asialofetuin competitor",
        },
        {
          id: 'zil-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'AGT knockdown and serum angiotensinogen',
          description:
            'Quantify AGT transcript by RT-qPCR and secreted angiotensinogen by immunoassay. Serum angiotensinogen is the pharmacodynamic marker used clinically, and in the phase 1 study its reduction correlated with dose.',
          dependsOnStepId: 'zil-w4',
          reagentsAndBuffer:
            'TaqMan Fast Advanced Master Mix with an AGT FAM probe and a GAPDH VIC control; human angiotensinogen sandwich ELISA',
        },
      ],
    },
    keyAudits: [
      {
        id: 'zil-a1',
        category: 'measured',
        title: 'KARDIA-1: 14 to 17 mmHg placebo-adjusted reduction from a single injection',
        laymanSummary:
          'One injection lowered 24-hour average systolic pressure by about 15 mmHg more than placebo at three months, across every dose tested.',
        technicalDetails:
          'Phase 2, randomised, double-blind, dose-ranging, 78 sites in 4 countries, 394 randomised and 377 in the full analysis set. Least-squares mean differences versus placebo in change from baseline to month 3 in 24-hour mean ambulatory systolic pressure: -14.1 mmHg (150 mg every 6 months), -16.7 mmHg (300 mg every 3 or 6 months) and -15.7 mmHg (600 mg every 6 months), all P<.001. Over 6 months, adverse events occurred in 60.9% of zilebesiran patients versus 50.7% of placebo, serious adverse events in 3.6% versus 6.7%, and non-serious drug-related events in 16.9% versus 8.0%, principally injection-site reactions and mild hyperkalaemia.',
        evidenceSource: 'Bakris GL et al., JAMA 2024;331:740-749',
        doi: '10.1001/jama.2024.0728',
        measuredMetric: '24-hour mean ambulatory systolic blood pressure at month 3',
        auditFlag: 'verified',
      },
      {
        id: 'zil-a2',
        category: 'measured',
        title: 'KARDIA-2: the added effect shrinks to 4.5 mmHg on top of an ARB',
        laymanSummary:
          'On top of a diuretic, zilebesiran added 12.1 mmHg. On top of a calcium channel blocker, 9.7. On top of a drug already blocking the same hormone pathway, only 4.5.',
        technicalDetails:
          'Phase 2, 150 sites in 8 countries. 1,491 patients entered an open-label run-in on indapamide 2.5 mg, amlodipine 5 mg or olmesartan 40 mg; 663 with 24-hour ambulatory systolic pressure of 130 to 160 mmHg were randomised 1:1 to a single subcutaneous 600 mg dose of zilebesiran or placebo. Least-squares mean differences at 3 months: -12.1 mmHg (indapamide, 95% CI -16.5 to -7.6, P<.001), -9.7 mmHg (amlodipine, 95% CI -12.9 to -6.6, P<.001) and -4.5 mmHg (olmesartan, 95% CI -8.2 to -0.8, P=.02). Hyperkalaemia occurred in 5.5% versus 1.8%, hypotension in 4.3% versus 2.1% and acute kidney failure in 4.9% versus 1.5%.',
        evidenceSource: 'Desai AS et al., JAMA 2025;334:46-55',
        doi: '10.1001/jama.2025.6681',
        measuredMetric:
          '24-hour mean ambulatory systolic blood pressure at 3 months, by background agent',
        auditFlag: 'verified',
      },
      {
        id: 'zil-a3',
        category: 'inferred',
        title: 'No cardiovascular outcome has been measured, and the phase 3 trial has not reported',
        laymanSummary:
          'Everything measured so far is blood pressure. Whether that translates into fewer strokes and heart attacks is the point of a trial that was only announced in August 2025.',
        technicalDetails:
          'All completed zilebesiran studies are phase 1 or phase 2 with blood pressure endpoints. Roche and Alnylam announced in August 2025 that ZENITH, a cardiovascular outcome trial of approximately 11,000 patients comparing zilebesiran 300 mg every six months against placebo in uncontrolled hypertension with established or high cardiovascular risk on two or more antihypertensives including a diuretic, would proceed. Blood pressure reduction has a strong outcome track record across drug classes, but it has never been established for this class.',
        evidenceSource:
          'Roche media release, 30 August 2025; Bakris GL et al., JAMA 2024;331:740-749',
        inferredClaim:
          'That a 15 mmHg ambulatory systolic reduction from an siRNA reduces cardiovascular events as it does from a daily tablet',
        auditFlag: 'caution',
      },
      {
        id: 'zil-a4',
        category: 'failed',
        title: 'The dosing interval is also the problem: the effect cannot be withdrawn',
        laymanSummary:
          'A pill can be stopped today. An injection that works for six months cannot. If a patient becomes dehydrated, septic or hypotensive, the drug is still working.',
        technicalDetails:
          'Zilebesiran produces sustained angiotensinogen suppression from a single dose, with blood-pressure effects consistent through the diurnal cycle and sustained at 24 weeks in the phase 1 study. A 2026 review frames the unresolved clinical question directly: how acute illness should be managed when upstream renin-angiotensin suppression cannot be rapidly attenuated. The safety signals that make this concrete are already visible — hyperkalaemia in 5.5%, hypotension in 4.3% and acute kidney failure in 4.9% of KARDIA-2 patients, against 1.8%, 2.1% and 1.5% on placebo.',
        evidenceSource:
          'Zilebesiran in Hypertension: Reversibility, Acute Illness, and Therapeutic Flexibility. Am J Cardiovasc Drugs 2026; Desai AS et al., JAMA 2025;334:46-55',
        doi: '10.1007/s40256-026-00823-7',
        auditFlag: 'caution',
      },
      {
        id: 'zil-a5',
        category: 'measured',
        title: 'The effect depends on dietary salt and on background therapy',
        laymanSummary:
          'A high-salt diet blunts the drug and an angiotensin blocker amplifies it. This is a treatment whose size depends on what else the patient is doing.',
        technicalDetails:
          'The phase 1 study enrolled 107 patients across single ascending doses of 10 to 800 mg. Part B assessed the 800 mg dose under low- and high-salt diets and Part E in combination with irbesartan; the results were consistent with attenuation of the blood-pressure effect by a high-salt diet and augmentation by coadministration with an angiotensin receptor blocker. Serum angiotensinogen reduction correlated with dose (r = -0.56 at week 8; 95% CI -0.69 to -0.39).',
        evidenceSource: 'Desai AS et al., N Engl J Med 2023;389:228-238',
        doi: '10.1056/NEJMoa2208391',
        measuredMetric:
          'Change in 24-hour ambulatory blood pressure under low- and high-salt conditions and with irbesartan',
        auditFlag: 'verified',
      },
      {
        id: 'zil-a6',
        category: 'conclusion_shift',
        title: 'The number gets smaller as the population gets harder',
        laymanSummary:
          'Sixteen millimetres of mercury in patients washed off their medication. Four and a half on top of an ARB. Five in a higher-risk group on multiple drugs, with a p-value of 0.043.',
        technicalDetails:
          'KARDIA-1 measured 24-hour ambulatory systolic pressure after antihypertensive washout and reported differences of 14.1 to 16.7 mmHg. KARDIA-2 measured the same endpoint on top of a single background agent and reported 12.1, 9.7 and 4.5 mmHg depending on which. Roche and Alnylam reported that KARDIA-3, in patients with established or high cardiovascular risk on two or more antihypertensives, produced a placebo-adjusted office systolic reduction of -5.0 mmHg at the month-3 primary endpoint (p=0.0431) in a cohort of 270 randomised patients. Note that KARDIA-3 reports an office measurement while KARDIA-1 and KARDIA-2 report 24-hour ambulatory measurements, so the three numbers are not directly comparable.',
        evidenceSource:
          'Bakris GL et al., JAMA 2024; Desai AS et al., JAMA 2025; Roche media release, 30 August 2025',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One subcutaneous injection every three to six months',
        laymanDesc:
          'A single injection under the skin. The sugar tag sends it to the liver, which is where the starting material for the blood-pressure hormone chain is made.',
        molecularDetail:
          'A GalNAc-conjugated duplex binds hepatocyte ASGPR. Doses of 150 to 600 mg have been studied at three- and six-monthly intervals; the phase 3 outcome trial uses 300 mg every six months.',
        iconName: 'Target',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Uptake into the hepatocyte and a months-long reservoir',
        laymanDesc:
          'The liver cell absorbs the drug and holds a store that releases slowly, which is why one dose lasts half a year.',
        molecularDetail:
          'ASGPR-mediated endocytosis routes the conjugate to the endosome; a fraction escapes to the cytoplasm and the endolysosomal depot sustains angiotensinogen suppression for months after plasma clearance.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Guide strand loaded into Argonaute 2',
        laymanDesc:
          'The active strand enters the cell\'s silencing machinery. No sequence has been published for this drug, so this page describes the mechanism rather than the letters.',
        molecularDetail:
          'The antisense strand loads into Argonaute 2 within RISC and directs it to AGT transcripts. No nucleotide sequence for zilebesiran has been published in a verifiable source, so none is recorded and the structure carries no machine-verification badge.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'AGT messenger RNA is cut and the cascade loses its substrate',
        laymanDesc:
          'The complex destroys the instructions for angiotensinogen. Renin can still work, but it has nothing left to work on.',
        molecularDetail:
          'Argonaute 2 cleaves AGT mRNA, reducing hepatic angiotensinogen secretion. Angiotensinogen is the sole precursor of every angiotensin peptide, so removing it depletes the cascade at its source rather than blocking one enzyme or one receptor downstream. Serum angiotensinogen reduction correlated with dose in the phase 1 study.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Blood pressure falls for months, and cannot be raised back quickly',
        laymanDesc:
          'Twenty-four-hour average pressure dropped by about 15 mmHg more than placebo and stayed down. The same durability means there is no way to switch the effect off if it becomes unwanted.',
        molecularDetail:
          'Sustained angiotensinogen depletion produced placebo-adjusted 24-hour ambulatory systolic reductions of 14.1 to 16.7 mmHg at month 3, consistent through the diurnal cycle and sustained to 24 weeks. Hyperkalaemia, hypotension and acute kidney failure were each roughly three times more common than placebo in KARDIA-2, and none of them can be addressed by stopping the drug.',
        iconName: 'Gauge',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Phase 1 (NCT03934307)',
        phase: 'Phase 1',
        sampleSize: 107,
        primaryEndpoint: 'Safety, pharmacokinetics and pharmacodynamics of single ascending doses',
        endpointMet: true,
        statisticalPValue:
          'Dose correlation with serum angiotensinogen reduction r = -0.56 (95% CI -0.69 to -0.39) at week 8',
        unreportedAdverseSignals:
          'Five patients had mild transient injection-site reactions. No hypotension, hyperkalaemia or renal deterioration requiring intervention at this stage — signals that did appear in the larger phase 2 studies.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'KARDIA-1 (NCT04936035)',
        phase: 'Phase 2',
        sampleSize: 394,
        primaryEndpoint:
          'Between-group difference in change from baseline to month 3 in 24-hour mean ambulatory systolic blood pressure',
        endpointMet: true,
        statisticalPValue: 'P < .001 for all dose groups',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'KARDIA-2 (NCT05103332)',
        phase: 'Phase 2',
        sampleSize: 663,
        primaryEndpoint:
          'Difference versus placebo in change from baseline to 3 months in 24-hour mean ambulatory systolic blood pressure, within each background-therapy cohort',
        endpointMet: true,
        statisticalPValue: 'P < .001 (indapamide and amlodipine cohorts); P = .02 (olmesartan cohort)',
        unreportedAdverseSignals:
          'Hyperkalaemia 5.5% versus 1.8%, hypotension 4.3% versus 2.1% and acute kidney failure 4.9% versus 1.5% against placebo.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Placebo-adjusted 24-hour ambulatory systolic reductions of 14.1 to 16.7 mmHg at month 3 from a single injection',
        'Added reductions of 12.1, 9.7 and 4.5 mmHg on top of indapamide, amlodipine and olmesartan respectively',
        'Hyperkalaemia, hypotension and acute kidney failure each roughly three times more frequent than placebo in KARDIA-2',
        'Attenuation of the blood-pressure effect by a high-salt diet and augmentation by an angiotensin receptor blocker',
      ],
      unsupportedInferences: [
        'That the blood pressure reduction reduces strokes, heart attacks or death — no outcome trial has reported',
        'That the KARDIA-1 monotherapy effect size applies to patients already on renin-angiotensin blockade; KARDIA-2 shows it does not',
        'That KARDIA-3\'s office systolic reduction can be compared with KARDIA-1\'s ambulatory figures — they are different measurements',
      ],
      whatFailedInitially: [
        'The effect size fell from roughly 16 mmHg after washout to 4.5 mmHg on top of an angiotensin receptor blocker, because both act on the same pathway',
      ],
      realWorldOutcome: [
        'Twice-yearly dosing removes non-adherence, which is the commonest reason treated hypertension stays uncontrolled',
        'The same durability creates a management problem with no precedent in hypertension: an antihypertensive that cannot be stopped when a patient becomes acutely unwell',
      ],
    },
    deliverySystem: {
      type: 'GalNAc-conjugated siRNA, subcutaneous injection (investigational)',
      description:
        'A single subcutaneous injection, studied at 150 mg, 300 mg and 600 mg every six months and 300 mg every three months. The announced phase 3 outcome trial uses 300 mg every six months. No approved presentation exists.',
      safetyProfile:
        'No FDA label and therefore no labelled warning set. In KARDIA-1, adverse events occurred in 60.9% of zilebesiran patients versus 50.7% on placebo, with serious events less frequent on drug (3.6% versus 6.7%). In the larger KARDIA-2 study hyperkalaemia (5.5% versus 1.8%), hypotension (4.3% versus 2.1%) and acute kidney failure (4.9% versus 1.5%) were all more common than placebo, though most episodes were described as mild and resolved without medical intervention.',
    },
    commonQuestions: [
      {
        q: 'Two injections a year instead of daily pills — what is the catch?',
        a: 'That it cannot be undone. A tablet stops working within a day or two of stopping it. A single zilebesiran dose suppresses angiotensinogen for months, so if a patient develops sepsis, severe dehydration, kidney injury or hypotension, the drug is still working and there is no antidote and no washout. A 2026 review names this as the central unresolved question for the class.',
        auditNote:
          'The hyperkalaemia, hypotension and acute kidney failure rates in KARDIA-2 are what make this concrete rather than theoretical.',
      },
      {
        q: 'Why was the effect so much smaller in KARDIA-2?',
        a: 'Because of what patients were already taking. Zilebesiran removes the substrate at the top of the renin-angiotensin cascade. If a patient is already on an angiotensin receptor blocker, the pathway is already blocked downstream and there is less left to gain — 4.5 mmHg, against 12.1 mmHg on top of a diuretic, which actually activates the pathway and therefore leaves more room.',
      },
      {
        q: 'Does it prevent strokes and heart attacks?',
        a: 'Unknown. Every completed trial has measured blood pressure. Lowering blood pressure has a very strong outcome record across older drug classes, which is the basis for optimism, but it is an extrapolation. The ZENITH outcome trial of roughly 11,000 patients was announced in August 2025 and has not reported.',
      },
      {
        q: 'Does my salt intake change how well it works?',
        a: 'Yes, measurably. In the phase 1 study the blood-pressure effect was attenuated on a high-salt diet and augmented when combined with an angiotensin receptor blocker. That makes dietary sodium a genuine variable in how much benefit a given patient gets, which is unusual among blood pressure drugs.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Bakris GL et al. RNA Interference With Zilebesiran for Mild to Moderate Hypertension: The KARDIA-1 Randomized Clinical Trial. JAMA 2024;331:740-749',
        identifier: '10.1001/jama.2024.0728',
        kind: 'doi',
      },
      {
        label:
          'Desai AS et al. Add-On Treatment With Zilebesiran for Inadequately Controlled Hypertension: The KARDIA-2 Randomized Clinical Trial. JAMA 2025;334:46-55',
        identifier: '10.1001/jama.2025.6681',
        kind: 'doi',
      },
      {
        label:
          'Desai AS et al. Zilebesiran, an RNA Interference Therapeutic Agent for Hypertension. N Engl J Med 2023;389:228-238',
        identifier: '10.1056/NEJMoa2208391',
        kind: 'doi',
      },
      {
        label:
          'Zilebesiran in Hypertension: Reversibility, Acute Illness, and Therapeutic Flexibility. Am J Cardiovasc Drugs 2026',
        identifier: '10.1007/s40256-026-00823-7',
        kind: 'doi',
      },
      { label: 'KARDIA-1', identifier: 'NCT04936035', kind: 'nct' },
      { label: 'KARDIA-2', identifier: 'NCT05103332', kind: 'nct' },
      { label: 'KARDIA-3', identifier: 'NCT06272487', kind: 'nct' },
      {
        label:
          'Roche and Alnylam advance zilebesiran into global phase III cardiovascular outcomes trial, 30 August 2025 — KARDIA-3 results and the ZENITH design',
        identifier: 'https://www.roche.com/media/releases/med-cor-2025-08-30',
        kind: 'url',
      },
      {
        label: 'EFSA NDA Panel. Dietary reference values for sodium. EFSA Journal 2019',
        identifier: '10.2903/j.efsa.2019.5778',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC), 2026 file, prices effective 17 December 2025',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
]
