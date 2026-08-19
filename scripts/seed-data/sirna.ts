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
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Psyllium husk (Plantago ovata)',
          activeCompound: 'Arabinoxylan soluble viscous fibre',
          biologicalMechanism:
            'Forms a viscous gel that traps bile acids in the gut lumen, forcing the liver to convert more cholesterol into replacement bile acids.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'The doses pooled in a 2025 dose-response meta-analysis of 41 randomised trials (Genes & Nutrition), which found a statistically significant reduction in LDL cholesterol',
          monthlyCost: 'Not priced here — no published cost figure to cite',
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
]
