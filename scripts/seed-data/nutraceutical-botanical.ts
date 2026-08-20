import type { SeedDossier } from '@/lib/seed-types'

/**
 * Nutraceuticals and botanicals — where the gap between what is sold and what was measured is
 * widest, and where almost nobody records that gap neutrally.
 *
 * These are not drugs with a label. They are sold under DSHEA in the United States as dietary
 * supplements, which means no agency has reviewed their efficacy before sale, and the claim on the
 * bottle is legally allowed to describe a "structure or function" rather than a disease outcome.
 * That regulatory fact is the single most important thing on every page in this file, and it is
 * why the audit layer exists at all. Four conventions apply throughout.
 *
 * 1. NO PRICING BLOCK ANYWHERE. `SeedPricing` requires a synthesis cost per dose with a citable
 *    source, and cost-of-production research (Hill et al. and successors) covers antivirals,
 *    oncology drugs and diabetes medicines — not plant extracts and fermentation products. There
 *    is no peer-reviewed cost-of-goods estimate for curcumin, ashwagandha or nicotinamide
 *    riboside. Estimating one here would be this file inventing a number, so `pricing` is omitted
 *    on every entry and cost appears nowhere. A missing price beats a manufactured one.
 *
 * 2. THE STRUCTURE IS THE MARKER COMPOUND, NOT THE PRODUCT. A botanical extract is a mixture; a
 *    SMILES string describes one molecule. Where a dossier carries a structure it is the named
 *    marker compound that trials standardise against — withaferin A for ashwagandha, hyperforin
 *    for St John's wort, valerenic acid for valerian — taken from PubChem and swept by the engine.
 *    Each such page says in prose that the marker is not the extract. Where no single molecule is
 *    meaningful, as with a live bacterial strain, no structure string is given at all.
 *
 * 3. DOSES APPEAR ONLY AS TRIAL FACTS. This repository gives no dosage, protocol or procurement
 *    guidance in any form. Where an amount appears it is a description of what a cited trial
 *    administered, in the past tense, because a reader cannot judge an effect size without knowing
 *    what produced it. It is never advice, and no page here says what anyone should take.
 *
 * 4. THE AUDIT IS THE PRODUCT. Every dossier carries at least one 'inferred' or 'failed' entry,
 *    because every substance here has one: NAD+ precursors raise a blood metabolite and have shown
 *    almost no clinical outcome, ginkgo failed the largest dementia prevention trial ever run,
 *    glucosamine missed its endpoint in a 1,583-patient NIH trial, and resveratrol carries both a
 *    research-misconduct history and, separately, a real body of null human trials. Those two
 *    resveratrol facts are kept distinct on that page, because conflating them would be its own
 *    kind of error.
 */
export const NUTRACEUTICAL_BOTANICAL_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // Berberine — the "nature's Ozempic" claim, against its own meta-analysis.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'berberine',
    name: 'Berberine',
    sponsor: 'No single sponsor — an isoquinoline alkaloid sold by many supplement manufacturers',
    targetGene: 'PRKAA1',
    targetProtein:
      'AMP-activated protein kinase catalytic subunit alpha-1, reached indirectly through inhibition of mitochondrial respiratory complex I',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for blood glucose and lipid support. Not approved by the FDA or EMA for any disease, and never submitted for one.',
    patientFriendlyIndication: 'Marketed for blood sugar and cholesterol, approved for neither',
    conditionContext: {
      conditionExplainer:
        'In type 2 diabetes the liver keeps releasing stored sugar into the blood while muscle takes up less of it, so glucose stays high between meals as well as after them. Berberine is a yellow alkaloid from Coptis, Berberis and goldenseal that has been studied against exactly that picture.',
      whyItMatters:
        'Berberine is the most heavily trialled supplement in metabolic health and the one most often described as a natural substitute for a prescription drug. Whether it earns that description is a question about trial quality, not about mechanism.',
      whoTakesThis:
        'Adults with prediabetes, type 2 diabetes, high cholesterol or polycystic ovary syndrome, usually buying it themselves rather than being prescribed it.',
      clinicalGoals:
        'The trials measured fasting glucose, HbA1c, LDL cholesterol and body weight. No trial has measured heart attacks, strokes, kidney failure or death.',
    },
    oneSentenceVerdict:
      'A plant alkaloid with a real, replicated effect on glucose and lipid blood chemistry, almost no oral absorption, and a 23-trial meta-analysis showing a 0.88 kg weight difference — which is not what "nature\'s Ozempic" means to anyone who says it.',
    laymanHowItWorks:
      "Berberine barely gets into your bloodstream at all. What reaches the liver mildly slows the cell's power plants, and the cell reads that as being short of energy. It responds by switching on a master energy sensor called AMPK, which tells the liver to stop manufacturing sugar and to keep more cholesterol catchers on its surface. Separately, most of the dose never leaves the gut, where bacteria convert it into a more absorbable form and where it changes the microbial population directly.",
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    anatomicalSite: 'Intestinal lumen and hepatocyte mitochondria (liver)',
    substitutes: {
      summary:
        'Metformin reaches the same AMPK endpoint by a similar route, costs cents a day, and has 60 years of outcome data behind it — berberine has none. The honest comparison is not potency on a glucose reading, it is that one of the two has been shown to change what happens to patients.',
      conventionalRx: [
        {
          name: 'Metformin (generic)',
          class: 'Biguanide',
          howItCompares:
            'Acts on the same complex I / AMPK axis in the hepatocyte and was the active comparator in the 2008 Yin trial, where the two produced a similar fall in glucose over three months in 36 newly diagnosed patients. Metformin also has randomised mortality data; berberine does not.',
          typicalCost:
            'Generic. Medicaid NADAC: metformin 500 mg at $0.014 a tablet, February 2026',
          prosAndCons:
            'Pros: decades of outcome evidence, regulated manufacture, known dose. Cons: gastrointestinal upset early on, and long-term use can lower vitamin B12.',
        },
        {
          name: 'Atorvastatin or rosuvastatin (generic)',
          class: 'HMG-CoA reductase inhibitor',
          howItCompares:
            'Lowers LDL cholesterol far more than berberine and by a completely different mechanism — blocking cholesterol synthesis rather than stabilising the LDL receptor messenger RNA, which is the route Kong et al. described for berberine in 2004.',
          typicalCost:
            'Generic. Medicaid NADAC: atorvastatin 20 mg $0.031, rosuvastatin 10 mg $0.038 a tablet',
          prosAndCons:
            'Pros: cardiovascular outcome trials exist. Cons: muscle symptoms in a minority, and no effect on glucose.',
        },
      ],
      naturalFoods: [
        {
          name: 'Goldenseal, Coptis chinensis and Berberis species',
          activeCompound: 'Berberine and related protoberberine alkaloids',
          biologicalMechanism:
            'The same alkaloid in its original plant matrix, at whatever concentration that plant and that preparation happen to contain — which is the problem, because the meta-analyses pooled standardised extracts, not the raw herb.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. Trials pooled by Lan et al. (J Ethnopharmacol 2015) used standardised berberine hydrochloride, not whole herb, so a herb intake cannot be read off them.',
          monthlyCost: '',
        },
        {
          name: 'Viscous soluble fibre (oats, barley, psyllium)',
          activeCompound: 'Beta-glucan and arabinoxylan',
          biologicalMechanism:
            'Slows gastric emptying and traps bile acids, blunting the post-meal glucose rise and forcing the liver to spend cholesterol making replacement bile acids. A smaller effect than berberine on both readings, from a much better-characterised mechanism.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'The amounts are named in 21 CFR 101.81: 3 g or more a day of beta-glucan from whole oats or barley, or 7 g or more of soluble fibre from psyllium husk, for the authorised heart disease claim.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask what the trial measured before reading the headline',
          action:
            'For any berberine claim, check whether the endpoint was a blood chemistry value or a clinical event.',
          patientImpact:
            'Every positive berberine result is a laboratory value. No trial has reported a heart attack, stroke or death endpoint, so the entire clinical case is an extrapolation.',
          clinicalPrecaution:
            'Berberine inhibits CYP3A4 and CYP2D6 and can raise the blood level of drugs cleared by them. Anyone on prescription medicine should raise it with a clinician rather than assume a plant extract is inert.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'COC1=C(C2=C[N+]3=C(C=C2C=C1)C4=CC5=C(C=C4CC3)OCO5)OC',
      chemicalFormula: 'C20H18NO4+',
      molecularWeight: '336.4 g/mol (berberine cation, PubChem CID 2353)',
      structureSource: {
        label: 'PubChem CID 2353 — Berberine, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2353',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ber-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Botanical identity and alkaloid profile of the incoming root',
          description:
            'Confirm the species of the incoming material before extraction. Coptis chinensis, Berberis aristata and Hydrastis canadensis all carry berberine but differ in their accompanying alkaloids, and palmatine and jatrorrhizine co-elute closely enough that an identity check on berberine alone will pass adulterated material.',
          reagentsAndBuffer:
            'Reference standards of berberine chloride, palmatine chloride and jatrorrhizine; DNA barcoding of the ITS2 and rbcL regions; HPTLC on silica gel 60 F254 with n-butanol / acetic acid / water',
        },
        {
          id: 'ber-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Acidified ethanol extraction of the milled root',
          description:
            'Extract the milled rhizome into acidified aqueous ethanol so the quaternary ammonium alkaloid stays in its charged, soluble form, then concentrate under reduced pressure.',
          dependsOnStepId: 'ber-w1',
          reagentsAndBuffer:
            '70% aqueous ethanol acidified to pH 2 to 3 with hydrochloric acid; reflux extraction; rotary evaporation below 50 degrees C',
        },
        {
          id: 'ber-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation as the hydrochloride and preparative HPLC polish',
          description:
            'Precipitate berberine hydrochloride from the concentrate by chloride addition and cooling, then polish by preparative reversed-phase HPLC and confirm identity by mass and by ultraviolet spectrum, which shows the characteristic 345 nm and 430 nm absorbances.',
          dependsOnStepId: 'ber-w2',
          reagentsAndBuffer:
            'Saturated sodium chloride; C18 preparative column; acetonitrile / 0.1% aqueous phosphoric acid gradient; diode-array detection at 345 nm; LC-MS confirmation of m/z 336.1',
        },
        {
          id: 'ber-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Free-uptake exposure of primary human hepatocytes',
          description:
            'Dose cryopreserved primary human hepatocytes without a transfection reagent, since the mechanism under test is passive and transporter-mediated entry into the cell followed by mitochondrial accumulation driven by the membrane potential.',
          dependsOnStepId: 'ber-w3',
          reagentsAndBuffer:
            "Cryopreserved primary human hepatocytes; Williams' E medium with GlutaMAX; collagen-coated plates; tetraphenylphosphonium as a membrane-potential control",
        },
        {
          id: 'ber-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Phospho-AMPK and hepatic glucose output readout',
          description:
            'Quantify AMPK alpha phosphorylation at Thr172 by immunoblot and measure glucose released into glucose-free medium over six hours, against a metformin-treated positive control on the same plate.',
          dependsOnStepId: 'ber-w4',
          reagentsAndBuffer:
            'Phospho-AMPK alpha (Thr172) and total AMPK alpha antibodies; RIPA lysis buffer with phosphatase inhibitors; glucose-free DMEM with sodium lactate and pyruvate; amplex red glucose oxidase assay',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ber-a1',
        category: 'measured',
        title: 'Yin 2008: HbA1c fell from 9.5% to 7.5% in newly diagnosed type 2 diabetes',
        laymanSummary:
          'In a small Chinese pilot trial, three months of berberine moved long-term blood sugar about as much as metformin did.',
        technicalDetails:
          'Study A randomised 36 adults with newly diagnosed type 2 diabetes to berberine or metformin for three months. HbA1c fell from 9.5 +/- 0.5% to 7.5 +/- 0.4% (P < 0.01), fasting glucose from 10.6 +/- 0.9 to 6.9 +/- 0.5 mmol/L (P < 0.01) and postprandial glucose from 19.8 +/- 1.7 to 11.1 +/- 0.9 mmol/L (P < 0.01). Study B added berberine to existing therapy in 48 poorly controlled patients, with HbA1c falling from 8.1 +/- 0.2% to 7.3 +/- 0.3% (P < 0.001). Twenty of 58 patients, 34.5%, had transient gastrointestinal adverse effects.',
        evidenceSource: 'Yin J, Xing H, Ye J. Metabolism 2008;57:712-717',
        doi: '10.1016/j.metabol.2008.01.013',
        measuredMetric: 'HbA1c, fasting and postprandial plasma glucose over three months',
        auditFlag: 'verified',
      },
      {
        id: 'ber-a2',
        category: 'measured',
        title: 'Kong 2004: a cholesterol mechanism genuinely distinct from statins',
        laymanSummary:
          'Berberine lowers cholesterol by making liver cells hold on to the instructions for their LDL catchers for longer, which is not how statins work.',
        technicalDetails:
          'Nature Medicine 2004. Berberine was identified from a screen of Chinese medicinal herbs as an upregulator of LDL receptor expression acting through stabilisation of LDL receptor mRNA, rather than through the SREBP-dependent transcriptional route that statins engage. The paper reported reductions in serum cholesterol, triglycerides and LDL-C in hyperlipidaemic hamsters and in a small human cohort. The mechanistic claim, not the clinical one, is what has replicated.',
        evidenceSource: 'Kong W et al. Nat Med 2004;10:1344-1351',
        doi: '10.1038/nm1135',
        measuredMetric: 'Hepatic LDL receptor mRNA stability and serum lipid concentrations',
        auditFlag: 'verified',
      },
      {
        id: 'ber-a3',
        category: 'failed',
        title: 'Oral bioavailability is under 1%: almost none of a dose reaches the blood',
        laymanSummary:
          'Ninety-nine percent of swallowed berberine never gets into the bloodstream, which means most explanations of how it works cannot be about the blood level.',
        technicalDetails:
          'Liu et al. showed in rats that oral berberine undergoes extensive intestinal first-pass elimination and is then concentrated in the liver, leaving plasma levels far too low to explain the systemic effects reported in trials. The paper is the standard reference for berberine bioavailability in the low single-digit percentage range or below. This is not a minor pharmacokinetic footnote: it means any mechanism proposed from a cell-culture concentration achievable only by direct dosing is unlikely to be what happens in a person.',
        evidenceSource: 'Liu YT et al. Drug Metab Dispos 2010;38:1779-1784',
        doi: '10.1124/dmd.110.033936',
        measuredMetric: 'Plasma and tissue berberine concentration after oral dosing in rats',
        auditFlag: 'caution',
      },
      {
        id: 'ber-a4',
        category: 'conclusion_shift',
        title: 'The field moved the mechanism into the gut after the absorption problem surfaced',
        laymanSummary:
          'Once it was clear berberine barely reaches the blood, researchers stopped explaining it as a blood-borne drug and started explaining it as something that acts in the intestine.',
        technicalDetails:
          "Feng et al. (Sci Rep 2015) showed that gut bacterial nitroreductase converts berberine into dihydroberberine, which is absorbed roughly five times more efficiently and is then oxidised back to berberine in intestinal tissue. That reframes the pharmacology: the gut microbiota is not a nuisance in the absorption path, it is part of the activation step, and it also means the effect size should vary with a person's microbiome. Almost no clinical trial in this literature stratifies for that.",
        evidenceSource: 'Feng R et al. Sci Rep 2015;5:12155',
        doi: '10.1038/srep12155',
        inferredClaim:
          'That a fixed oral amount produces a comparable systemic exposure across people, when the conversion step is microbial and therefore individual',
        auditFlag: 'contested',
      },
      {
        id: 'ber-a5',
        category: 'inferred',
        title: 'The weight-loss claim rests on a 0.88 kg mean difference',
        laymanSummary:
          'The full pooled evidence for berberine and body weight is a difference of under a kilogram — a real effect, and not remotely what the marketing implies.',
        technicalDetails:
          'A 2026 systematic review and meta-analysis of 23 randomised controlled trials found berberine reduced body weight by a mean difference of -0.88 kg (95% CI -1.36 to -0.39, P = 0.0003), BMI by -0.48 kg/m2 (95% CI -0.89 to -0.07) and waist circumference by -1.32 cm (95% CI -2.24 to -0.41), with no significant change in waist-to-hip ratio. The authors explicitly called for better reporting of purity, potency and gram amounts, and flagged lack of blinding and randomisation as common biases. The comparison implied by calling berberine a natural GLP-1 agonist is with agents that produce double-digit percentage weight loss in trials designed to measure it.',
        evidenceSource: 'Elahi Vahed I et al. Int J Obes (Lond) 2026;50:53-73',
        doi: '10.1038/s41366-025-01943-x',
        inferredClaim:
          'That berberine is a natural equivalent of a GLP-1 receptor agonist for weight loss',
        auditFlag: 'caution',
      },
      {
        id: 'ber-a6',
        category: 'inferred',
        title:
          'No trial has measured a clinical event, and the trial base is geographically narrow',
        laymanSummary:
          'Every positive berberine result is a number from a blood test. Nobody has run a trial long enough or large enough to see whether anything happens to patients.',
        technicalDetails:
          'The 2015 meta-analysis by Lan et al. pooled 27 randomised trials in type 2 diabetes, hyperlipidaemia and hypertension and found effects on glucose and lipid parameters comparable to oral hypoglycaemics and lipid-lowering drugs, with the important qualifier that the included trials were small, largely conducted in China, and of limited methodological quality. No cardiovascular outcome trial, no renal outcome trial and no mortality trial has been conducted for berberine in any indication.',
        evidenceSource: 'Lan J et al. J Ethnopharmacol 2015;161:69-81',
        doi: '10.1016/j.jep.2014.09.049',
        inferredClaim:
          'That a berberine-induced fall in HbA1c or LDL-C carries the same clinical benefit as the same fall produced by a drug with outcome trials behind it',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, and then mostly not absorbed',
        laymanDesc:
          'The capsule dissolves and the alkaloid enters the gut, where the overwhelming majority of it stays. Very little crosses into the bloodstream.',
        molecularDetail:
          'Berberine is a permanently charged quaternary protoberberine cation, which limits passive membrane transit, and it is a P-glycoprotein substrate actively pumped back into the intestinal lumen. Liu et al. attributed the low plasma level to extensive intestinal first-pass elimination followed by predominant hepatic distribution of what does get through.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Gut bacteria convert it into a form that can be absorbed',
        laymanDesc:
          'Bacteria in the intestine chemically alter berberine into a related molecule that crosses the gut wall far more easily, then the body turns it back.',
        molecularDetail:
          'Bacterial nitroreductase reduces berberine to dihydroberberine, which Feng et al. measured as roughly five-fold more absorbable, and which is reoxidised to berberine in intestinal tissue. Absorption is therefore a microbial function and varies between people.',
        iconName: 'Bug',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Inside the liver cell it collects in the mitochondria',
        laymanDesc:
          "What reaches the liver piles up inside the cell's power plants, because their electrical charge pulls the positively charged molecule in.",
        molecularDetail:
          'The delocalised cationic charge drives accumulation in the mitochondrial matrix down the inner-membrane potential gradient, where berberine mildly inhibits complex I of the respiratory chain and raises the cellular AMP to ATP ratio.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The energy sensor switches on and liver sugar production slows',
        laymanDesc:
          'The cell reads the drop in energy as a shortage and flips on its master energy switch, which tells the liver to stop making new sugar.',
        molecularDetail:
          'The raised AMP to ATP ratio promotes LKB1-dependent phosphorylation of AMPK alpha at Thr172. Active AMPK suppresses transcription of the gluconeogenic enzymes PEPCK and G6Pase and shifts hepatic metabolism from synthesis toward oxidation.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Blood glucose and LDL fall, on a separate route each',
        laymanDesc:
          'Less sugar leaves the liver, and separately the liver keeps more of its cholesterol catchers, so both readings come down.',
        molecularDetail:
          "Glucose lowering follows from AMPK-mediated suppression of gluconeogenesis. LDL lowering is a distinct mechanism: Kong et al. showed berberine stabilises LDL receptor mRNA through its 3' untranslated region, raising receptor density without engaging the SREBP pathway statins work through.",
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Yin 2008 study A (berberine versus metformin, newly diagnosed type 2 diabetes)',
        phase: 'Investigator-initiated randomised pilot',
        sampleSize: 36,
        primaryEndpoint: 'Change in HbA1c and fasting plasma glucose at three months',
        endpointMet: true,
        statisticalPValue: 'P < 0.01 for HbA1c and fasting glucose within the berberine arm',
        unreportedAdverseSignals:
          'Transient gastrointestinal adverse effects in 20 of 58 patients across both study arms, 34.5%. The trial was not blinded and had no placebo group.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Lan 2015 pooled analysis (27 randomised trials)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 2569,
        primaryEndpoint:
          'Pooled effect on glucose and lipid parameters in type 2 diabetes, hyperlipidaemia and hypertension',
        endpointMet: true,
        statisticalPValue:
          'Significant for glucose and lipid parameters; see paper for per-outcome values',
        unreportedAdverseSignals:
          'The authors flagged that included trials were small, largely Chinese, and of limited methodological quality. No included trial reported a clinical event endpoint.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Elahi Vahed 2026 obesity meta-analysis (23 randomised trials)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 0,
        primaryEndpoint: 'Change in body weight, BMI, waist circumference and waist-to-hip ratio',
        endpointMet: true,
        statisticalPValue: 'P = 0.0003 for body weight; waist-to-hip ratio not significant',
        unreportedAdverseSignals:
          'Sample size is recorded as 0 because the paper reports the number of trials rather than a single pooled participant total. The effect on weight was -0.88 kg.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'HbA1c fell from 9.5% to 7.5% over three months in 36 newly diagnosed patients, comparable to metformin in the same trial',
        'Pooled body weight difference of -0.88 kg across 23 randomised trials',
        'Stabilisation of hepatic LDL receptor mRNA, a mechanism distinct from the statin pathway',
        'Conversion of berberine to the far more absorbable dihydroberberine by gut bacterial nitroreductase',
      ],
      unsupportedInferences: [
        'That berberine is a natural equivalent of a GLP-1 receptor agonist — the measured weight difference is under one kilogram',
        'That a berberine-driven fall in HbA1c or LDL-C carries the clinical benefit that the same fall carries for metformin or a statin',
        'That the trial evidence generalises freely, when the pooled base is small, mostly unblinded and geographically concentrated',
      ],
      whatFailedInitially: [
        'Oral bioavailability below 1%, which invalidated the first generation of blood-concentration-based mechanistic explanations',
        'Trial reporting quality: the 2026 meta-analysis had to ask its own included studies for basic purity, potency and gram amounts',
      ],
      realWorldOutcome: [
        'Berberine is the most-trialled metabolic supplement and the effects on blood chemistry are real and repeatable',
        'No regulator has reviewed it for efficacy, and CYP3A4 and CYP2D6 inhibition makes drug interaction a genuine rather than theoretical concern',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule or tablet, usually berberine hydrochloride',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, which means no premarket efficacy or safety review. Content and purity vary by manufacturer, and the 2026 meta-analysis specifically noted poor reporting of purity and potency in the trial literature itself.',
      safetyProfile:
        'Gastrointestinal effects — constipation, diarrhoea, cramping — were reported in about a third of participants in the Yin trial. Berberine inhibits CYP3A4 and CYP2D6 and can raise concentrations of co-administered drugs cleared by those enzymes. It is contraindicated in neonates because of its potential to displace bilirubin from albumin, and it is not recommended in pregnancy.',
    },
    commonQuestions: [
      {
        q: 'Is berberine really "nature\'s Ozempic"?',
        a: 'No, and the arithmetic is not close. The pooled evidence across 23 randomised trials is a mean weight difference of 0.88 kg against control. Semaglutide and tirzepatide were tested in trials designed and powered to measure weight loss and produced double-digit percentage reductions. Berberine does something real to glucose and lipid chemistry; it does not do what a GLP-1 receptor agonist does, and the phrase implies otherwise.',
        auditNote:
          'This is the largest single gap between marketing language and measured effect anywhere in this file.',
      },
      {
        q: 'If almost none of it is absorbed, how can it do anything?',
        a: 'Two ways, both of which are supported. A small fraction is absorbed after gut bacteria convert it to dihydroberberine, and that fraction concentrates in the liver rather than distributing evenly, so the hepatic exposure is much higher than the plasma level suggests. Separately, the large unabsorbed fraction acts in the intestine itself, on the bile acid pool and on the microbial population. What the low bioavailability does rule out is any explanation that depends on a high blood concentration.',
      },
      {
        q: 'Has anyone shown berberine prevents a heart attack or kidney failure?',
        a: 'No. Every positive result in this literature is a laboratory value — HbA1c, fasting glucose, LDL cholesterol, body weight. No trial has enrolled enough people for long enough to count clinical events, and none is registered to do so. The clinical case for berberine is entirely an extrapolation from surrogate markers.',
        auditNote:
          'The same gap exists for many approved drugs. The difference is that a regulator reviewed those before sale.',
      },
      {
        q: 'Does it interact with prescription medicine?',
        a: "Yes, and this is the practical safety issue rather than direct toxicity. Berberine inhibits CYP3A4 and CYP2D6, the enzymes that clear a large share of prescription drugs, so it can raise the blood level of a co-administered medicine without anyone changing that medicine's dose. It is not a substance to add silently alongside a prescription.",
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Yin J, Xing H, Ye J. Efficacy of berberine in patients with type 2 diabetes mellitus. Metabolism 2008;57:712-717',
        identifier: '10.1016/j.metabol.2008.01.013',
        kind: 'doi',
      },
      {
        label:
          'Kong W et al. Berberine is a novel cholesterol-lowering drug working through a unique mechanism distinct from statins. Nat Med 2004;10:1344-1351',
        identifier: '10.1038/nm1135',
        kind: 'doi',
      },
      {
        label:
          'Lan J et al. Meta-analysis of the effect and safety of berberine in the treatment of type 2 diabetes mellitus, hyperlipemia and hypertension. J Ethnopharmacol 2015;161:69-81',
        identifier: '10.1016/j.jep.2014.09.049',
        kind: 'doi',
      },
      {
        label:
          'Liu YT et al. Extensive intestinal first-pass elimination and predominant hepatic distribution of berberine explain its low plasma levels in rats. Drug Metab Dispos 2010;38:1779-1784',
        identifier: '10.1124/dmd.110.033936',
        kind: 'doi',
      },
      {
        label:
          'Feng R et al. Transforming berberine into its intestine-absorbable form by the gut microbiota. Sci Rep 2015;5:12155',
        identifier: '10.1038/srep12155',
        kind: 'doi',
      },
      {
        label:
          'Elahi Vahed I et al. The effect of berberine on obesity indices: a systematic review and meta-analysis. Int J Obes (Lond) 2026;50:53-73',
        identifier: '10.1038/s41366-025-01943-x',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 2353 — Berberine',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2353',
        kind: 'url',
      },
      {
        label:
          '21 CFR 101.81 — Health claims: soluble fiber from certain foods and risk of coronary heart disease',
        identifier:
          'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-E/section-101.81',
        kind: 'regulatory',
      },
      {
        label:
          'NADAC (National Average Drug Acquisition Cost) 2026 — Centers for Medicare and Medicaid Services pharmacy acquisition-cost survey',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Curcumin — a bioavailability problem most trials never addressed, and a medicinal-chemistry
  // paper that reframed the whole literature.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'curcumin',
    name: 'Curcumin',
    tradeName:
      'Sold as turmeric extract, and as branded complexes including Meriva, BCM-95 and Theracurmin',
    sponsor: 'No single sponsor — a diarylheptanoid from Curcuma longa rhizome',
    targetGene: 'NFKB1',
    targetProtein:
      'No single validated target. Curcumin has been reported to bind dozens of proteins, and the 2017 medicinal-chemistry review argues that most of those reports are assay artefacts.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for joint comfort and inflammation. No approved indication in any jurisdiction; over 200 registered human trials have produced no regulatory approval.',
    patientFriendlyIndication: 'Marketed for inflammation and joint pain, approved for neither',
    conditionContext: {
      conditionExplainer:
        'Turmeric is the rhizome of Curcuma longa; curcumin is the yellow pigment in it, and makes up roughly 2 to 5% of the spice by weight. Almost all supplement marketing collapses the two, but a trial of standardised 95% curcuminoid extract is not a trial of turmeric and vice versa.',
      whyItMatters:
        'Curcumin is among the most-studied natural products in history and among the least successfully translated. The reason is a specific, well-documented chemistry problem, and it is the thing most reporting about curcumin leaves out.',
      whoTakesThis:
        'Adults with osteoarthritis, inflammatory conditions or general wellness intent, largely self-directed.',
      clinicalGoals:
        'Trials have measured self-reported pain scales, inflammatory markers and, in one case, MRI-measured knee effusion-synovitis. The last of those is the endpoint that matters most and the one that did not move.',
    },
    oneSentenceVerdict:
      'A compound that reduces self-reported knee pain in randomised trials, does not change the MRI-visible joint pathology underneath it, is absorbed so poorly that most trials cannot have achieved a systemic concentration, and has a documented liver injury signal at extract strength.',
    laymanHowItWorks:
      'Curcumin is the yellow pigment in turmeric. In a test tube it interferes with a very long list of proteins, which is why the early literature described it as anti-inflammatory, anti-cancer and anti-almost-everything. In a person, almost none of it survives the gut and liver — it is broken down and cleared within minutes — so the blood level after a normal dose is often too low to measure. Manufacturers respond by adding black pepper extract or wrapping it in fat, which raises the level but does not resolve the deeper question of what it is doing when it gets there.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 34,
    anatomicalSite: 'Intestinal epithelium and, at low concentrations, systemic circulation',
    substitutes: {
      summary:
        'For knee osteoarthritis pain, the comparator that matters is ibuprofen, which curcumin was tested against directly and did not lose to on the pain scale. For anything systemic the comparison is harder, because the compound may never reach the tissue in question.',
      conventionalRx: [
        {
          name: 'Ibuprofen',
          class: 'Non-steroidal anti-inflammatory drug',
          howItCompares:
            'Kuptniratsaikul et al. randomised 367 patients with primary knee osteoarthritis to Curcuma domestica extract or ibuprofen for four weeks and reported non-inferiority on the WOMAC pain subscale, with fewer gastrointestinal adverse events in the extract arm.',
          typicalCost:
            'Generic. Medicaid NADAC: ibuprofen 800 mg $0.057, over-the-counter 200 mg $0.033 a tablet',
          prosAndCons:
            'Pros: fast, cheap, thoroughly characterised. Cons: gastrointestinal and renal risk with chronic use, which is exactly the reason people look for an alternative.',
        },
        {
          name: 'Intra-articular corticosteroid injection',
          class: 'Glucocorticoid',
          howItCompares:
            'Acts directly at the joint rather than depending on absorption, which sidesteps the entire curcumin bioavailability problem. Short-lived effect and repeated injection carries its own cartilage concerns.',
          typicalCost: '',
          prosAndCons:
            'Pros: no absorption question, rapid relief. Cons: temporary, invasive, and not a long-term strategy.',
        },
      ],
      naturalFoods: [
        {
          name: 'Culinary turmeric',
          activeCompound:
            'Curcumin, demethoxycurcumin and bisdemethoxycurcumin, roughly 2 to 5% of the rhizome',
          biologicalMechanism:
            'The same curcuminoids at food concentration. The important point is arithmetic: a standardised 95% extract capsule contains an order of magnitude more curcuminoid than a culinary portion of the spice, so trial results on the extract do not transfer to the kitchen.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'The trials dosed curcuminoids in grams: 2 g in the Shoba pharmacokinetic arm, and 2 or 4 g daily for 24 weeks in Ringman et al. The rhizome itself is 2 to 5 percent curcuminoid by weight.',
          monthlyCost: '',
        },
        {
          name: 'Black pepper (Piper nigrum) alongside turmeric',
          activeCompound: 'Piperine',
          biologicalMechanism:
            'Piperine inhibits intestinal and hepatic glucuronidation, the main route by which curcumin is cleared. Shoba et al. measured a 2,000% increase in curcumin bioavailability in human volunteers when 20 mg piperine was co-administered with 2 g curcumin.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'The Shoba 1998 human arm co-administered 20 mg piperine with 2 g curcumin, which is the origin of the pairing now standard in supplements',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Check whether the trial used turmeric or a standardised extract',
          action:
            'Before applying a curcumin study to a spice, read the intervention description: whole rhizome powder, 95% curcuminoid extract and a phospholipid complex are three different things.',
          patientImpact:
            'Most positive trials used standardised extracts at concentrations unreachable through food, so a headline about turmeric is usually a headline about a supplement.',
          clinicalPrecaution:
            'The Drug-Induced Liver Injury Network case series concerned turmeric-containing products at supplement strength, not culinary use.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'COC1=C(C=CC(=C1)/C=C/C(=O)CC(=O)/C=C/C2=CC(=C(C=C2)O)OC)O',
      chemicalFormula: 'C21H20O6',
      molecularWeight: '368.4 g/mol (PubChem CID 969516)',
      structureSource: {
        label: 'PubChem CID 969516 — Curcumin, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/969516',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cur-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Rhizome identity and synthetic-dye adulteration screen',
          description:
            'Confirm Curcuma longa identity and screen for the synthetic colourants used to brighten low-grade turmeric. Metanil yellow and lead chromate adulteration of turmeric is documented well enough that an extract programme that does not test for it is not a controlled programme.',
          reagentsAndBuffer:
            'Curcumin, demethoxycurcumin and bisdemethoxycurcumin reference standards; HPTLC on silica gel; ICP-MS for lead and chromium; spot test and LC-MS for metanil yellow',
        },
        {
          id: 'cur-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solvent extraction of curcuminoids from milled rhizome',
          description:
            'Extract the milled dried rhizome into ethanol or supercritical carbon dioxide, then concentrate. Curcumin degrades rapidly above pH 7 and under light, so the extract is handled acidic and dark from this point on.',
          dependsOnStepId: 'cur-w1',
          reagentsAndBuffer:
            'Food-grade ethanol or supercritical CO2 with ethanol cosolvent; amber glassware; nitrogen headspace; rotary evaporation below 45 degrees C',
        },
        {
          id: 'cur-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation to a defined curcuminoid ratio',
          description:
            'Recrystallise to a defined total curcuminoid content, typically 95%, and report the ratio of the three curcuminoids rather than the total alone, because trials differ in which ratio they used and the ratio is part of the intervention.',
          dependsOnStepId: 'cur-w2',
          reagentsAndBuffer:
            'Ethanol / water recrystallisation; C18 HPLC with 0.1% acetic acid and acetonitrile; diode-array detection at 425 nm',
        },
        {
          id: 'cur-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Caco-2 monolayer permeability with and without a glucuronidation inhibitor',
          description:
            "Measure apparent permeability across a differentiated Caco-2 monolayer, with and without piperine, to reproduce the absorption limit rather than assume it away. This step exists because the compound's central clinical problem is here, not at the target.",
          dependsOnStepId: 'cur-w3',
          reagentsAndBuffer:
            'Caco-2 cells on Transwell inserts, 21-day differentiation; Hanks balanced salt solution with HEPES; piperine as UGT inhibitor; lucifer yellow monolayer integrity control',
        },
        {
          id: 'cur-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Counter-screen against assay interference before reporting any target',
          description:
            'Run any reported target engagement against the interference controls the 2017 medicinal-chemistry review demands: curcumin is fluorescent, redox-active, aggregates in aqueous buffer and degrades, and each of those produces false positives in a different assay format.',
          dependsOnStepId: 'cur-w4',
          reagentsAndBuffer:
            'Detergent counter-screen with 0.01% Triton X-100 for colloidal aggregation; catalase control for hydrogen peroxide generation; fluorescence quench control; freshly prepared stock with LC-MS stability check at assay pH',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cur-a1',
        category: 'measured',
        title: 'Curcuma longa extract reduced knee pain in a 70-patient randomised trial',
        laymanSummary:
          'People taking turmeric extract reported meaningfully less knee pain than people taking placebo over twelve weeks.',
        technicalDetails:
          "Wang et al. randomised 70 participants with symptomatic knee osteoarthritis and ultrasound-detected effusion-synovitis to Curcuma longa extract or placebo for 12 weeks. The extract group reported greater improvement in knee pain on the visual analogue scale, the trial's co-primary symptomatic endpoint.",
        evidenceSource: 'Wang Z et al. Ann Intern Med 2020;173:861-869',
        doi: '10.7326/M20-0990',
        measuredMetric: 'Change in knee pain on a visual analogue scale at 12 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'cur-a2',
        category: 'failed',
        title: 'The same trial found no change in the MRI-measured joint pathology',
        laymanSummary:
          'The pain score improved and the actual swelling inside the joint, measured by scan, did not.',
        technicalDetails:
          'The co-primary structural endpoint in Wang et al. was change in MRI-assessed effusion-synovitis volume, and it did not differ between the Curcuma longa and placebo groups. The authors concluded that the extract improved symptoms but had no effect on the underlying effusion-synovitis, and that larger trials were required before it could be recommended. A symptom benefit without a structural one is a real finding; presenting it as disease modification is not.',
        evidenceSource: 'Wang Z et al. Ann Intern Med 2020;173:861-869',
        doi: '10.7326/M20-0990',
        measuredMetric: 'Change in MRI-assessed effusion-synovitis volume at 12 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'cur-a3',
        category: 'conclusion_shift',
        title:
          'A 2017 medicinal-chemistry review reclassified curcumin as an assay-interference compound',
        laymanSummary:
          'Chemists showed that many of the thousands of published curcumin results are probably artefacts of the way the tests were run, not real effects on the proteins claimed.',
        technicalDetails:
          'Nelson et al. reviewed the medicinal chemistry of curcumin in the Journal of Medicinal Chemistry and classified it as both a PAINS compound (pan-assay interference) and an IMPS compound (invalid metabolic panacea). The specific mechanisms are chemical rather than rhetorical: curcumin is intrinsically fluorescent and interferes with fluorescence readouts; it is redox-active and generates hydrogen peroxide in buffer; it forms colloidal aggregates that non-specifically inhibit enzymes; it is chemically unstable at physiological pH; and it is a covalent Michael acceptor. The paper reported that no double-blinded, placebo-controlled trial of curcumin had then been successful, despite very large numbers of trials.',
        evidenceSource: 'Nelson KM et al. J Med Chem 2017;60:1620-1637',
        doi: '10.1021/acs.jmedchem.6b00975',
        inferredClaim:
          'That the very large in vitro literature identifies genuine curcumin targets, when much of it is explicable as assay interference',
        auditFlag: 'contested',
      },
      {
        id: 'cur-a4',
        category: 'inferred',
        title: 'Most trials never established that the compound reached the tissue',
        laymanSummary:
          'Curcumin is cleared so fast that a plain capsule often produces no measurable blood level at all, and most trials did not check.',
        technicalDetails:
          'Anand et al. reviewed curcumin pharmacokinetics and documented poor absorption, rapid intestinal and hepatic glucuronidation and sulfation, and rapid systemic elimination, producing serum concentrations in the low nanomolar range or below detection after oral dosing. Shoba et al. had earlier shown in human volunteers that co-administering 20 mg piperine with 2 g curcumin raised bioavailability by 2,000%, which is the origin of the piperine pairing in commercial products. A trial that reports an outcome without a plasma concentration cannot distinguish a systemic drug effect from a gut-local one or from chance.',
        evidenceSource:
          'Anand P et al. Mol Pharm 2007;4:807-818; Shoba G et al. Planta Med 1998;64:353-356',
        doi: '10.1021/mp700113r',
        inferredClaim:
          'That an oral curcumin dose produces a systemic concentration comparable to the one used in the cell experiments it is justified by',
        auditFlag: 'caution',
      },
      {
        id: 'cur-a5',
        category: 'failed',
        title: "Curcumin did not slow Alzheimer's disease in a randomised trial",
        laymanSummary:
          "A 24-week trial in Alzheimer's patients found no cognitive benefit, and plasma levels of the drug were very low.",
        technicalDetails:
          "Ringman et al. randomised patients with mild-to-moderate Alzheimer's disease to oral curcumin at 2 g or 4 g daily, or placebo, for 24 weeks with a 24-week open-label extension. There was no difference in cognitive or biomarker outcomes. Native curcumin was largely undetectable in plasma, with only conjugated metabolites present, which is the pharmacokinetic finding that makes the negative efficacy result unsurprising rather than mysterious.",
        evidenceSource: 'Ringman JM et al. Alzheimers Res Ther 2012;4:43',
        doi: '10.1186/alzrt146',
        measuredMetric: 'Change in ADAS-Cog and plasma curcumin concentration over 24 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'cur-a6',
        category: 'measured',
        title: 'Turmeric supplements have a documented liver-injury signal',
        laymanSummary:
          'The US network that tracks supplement-caused liver damage has published a growing series of cases from turmeric products.',
        technicalDetails:
          'Halegoua-DeMarzio et al. reported ten cases of turmeric-associated liver injury enrolled in the Drug-Induced Liver Injury Network, describing the problem as growing. Injury was predominantly hepatocellular and included cases requiring hospitalisation. Susceptibility has been linked to the HLA-B*35:01 allele. The exposure in these cases is concentrated supplement extract, not culinary turmeric, and the risk is plausibly higher for the enhanced-absorption formulations precisely because they work.',
        evidenceSource: 'Halegoua-DeMarzio D et al. Am J Med 2023;136:200-206',
        doi: '10.1016/j.amjmed.2022.09.026',
        measuredMetric:
          'Adjudicated cases of hepatocellular liver injury attributed to turmeric products',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, and immediately up against a solubility wall',
        laymanDesc:
          'Curcumin barely dissolves in water, so most of a plain capsule passes through the gut without ever entering the body.',
        molecularDetail:
          'Aqueous solubility is in the low microgram-per-millilitre range at physiological pH, and the molecule degrades within minutes above pH 7 to ferulic acid, feruloylmethane and vanillin. Dissolution, not permeability, is the first rate-limiting step.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'What does get absorbed is conjugated almost immediately',
        laymanDesc:
          'The gut wall and liver tag the molecule for disposal within minutes, so what circulates is mostly the deactivated version.',
        molecularDetail:
          'Extensive UGT-mediated glucuronidation and SULT-mediated sulfation in enterocytes and hepatocytes produce curcumin glucuronide and sulfate as the dominant circulating species. Piperine raises exposure by inhibiting exactly this step, which is why Shoba et al. measured a 2,000% increase.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'At the cell it engages many things weakly rather than one thing strongly',
        laymanDesc:
          'Curcumin does not have a single lock it fits. It touches a long list of proteins loosely, which is a very different pharmacology from a normal drug.',
        molecularDetail:
          'Reported interactions span NF-kappaB signalling, COX-2, 5-LOX, STAT3, beta-catenin and many others, typically at micromolar concentrations. Nelson et al. argue that the promiscuity itself is the warning sign: covalent Michael addition, redox cycling and colloidal aggregation each generate apparent activity against unrelated targets.',
        iconName: 'Network',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Downstream, inflammatory signalling is reported to fall',
        laymanDesc: 'In cells and in some human trials, markers of inflammation come down.',
        molecularDetail:
          'The most consistently reported downstream effect is reduced NF-kappaB-dependent transcription with lower TNF-alpha, IL-6 and CRP. Whether that is target engagement or a downstream consequence of redox stress is exactly the question the interference literature raises.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Reported pain improves; measured joint structure does not',
        laymanDesc:
          'In knee osteoarthritis the pain score gets better and the scan of the joint stays the same.',
        molecularDetail:
          'Wang et al. separated these two endpoints deliberately and found the split: improvement on the visual analogue pain scale, no change in MRI effusion-synovitis volume. Symptom relief without structural change is the honest description of the strongest curcumin result to date.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Wang 2020 (Curcuma longa extract, knee osteoarthritis, Ann Intern Med)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 70,
        primaryEndpoint:
          'Co-primary: change in knee pain on a visual analogue scale, and change in MRI effusion-synovitis volume, at 12 weeks',
        endpointMet: false,
        statisticalPValue:
          'Pain endpoint significant in favour of extract; MRI effusion-synovitis endpoint not significant',
        unreportedAdverseSignals:
          'Recorded as endpoint not met because one of the two co-primary endpoints failed. The pain result on its own was positive.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Kuptniratsaikul 2014 (Curcuma domestica extract versus ibuprofen)',
        phase: 'Randomised, double-blind, active-controlled non-inferiority',
        sampleSize: 367,
        primaryEndpoint: 'WOMAC pain, stiffness and function scores at four weeks',
        endpointMet: true,
        statisticalPValue: 'Non-inferiority against ibuprofen met on the WOMAC pain subscale',
        unreportedAdverseSignals:
          'No placebo arm, so the shared improvement in both groups cannot be separated from regression to the mean and expectation effects.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: "Ringman 2012 (oral curcumin in Alzheimer's disease)",
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 36,
        primaryEndpoint:
          'Tolerability and change in cognitive and biomarker measures over 24 weeks',
        endpointMet: false,
        statisticalPValue: 'No significant difference from placebo on any efficacy measure',
        unreportedAdverseSignals:
          'Native curcumin was largely undetectable in plasma; only conjugated metabolites were measurable, which limits what the null result can be attributed to.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Reduced self-reported knee pain versus placebo at 12 weeks in 70 patients',
        'Non-inferiority to ibuprofen on the WOMAC pain subscale in 367 patients over four weeks',
        'A 2,000% increase in curcumin bioavailability when 20 mg piperine was co-administered with 2 g curcumin in human volunteers',
        'Ten adjudicated cases of turmeric-associated hepatocellular liver injury in the US Drug-Induced Liver Injury Network',
      ],
      unsupportedInferences: [
        'That curcumin modifies joint disease — the MRI structural endpoint in the trial designed to test it did not move',
        'That the large in vitro target list reflects real binding, when the compound is a documented pan-assay interference and invalid metabolic panacea compound',
        'That eating turmeric delivers what a 95% curcuminoid extract delivers',
        'That a trial without a plasma concentration measurement tested a systemic effect at all',
      ],
      whatFailedInitially: [
        "Alzheimer's disease: no cognitive or biomarker benefit over 24 weeks, with native curcumin undetectable in plasma",
        'The compound has never produced a successful, replicated, double-blind placebo-controlled trial sufficient for any regulatory approval, despite hundreds of registered studies',
      ],
      realWorldOutcome: [
        'The symptomatic knee osteoarthritis result is real and reproducible, and it is the strongest claim this substance can currently support',
        'Enhanced-absorption formulations solve the pharmacokinetic problem and may raise the hepatotoxicity risk in doing so',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule: standardised curcuminoid extract, often with piperine or as a phospholipid or nanoparticle complex',
      description:
        'Sold as a dietary supplement with no premarket efficacy review. The formulation is not cosmetic: plain 95% extract, piperine-paired extract and phospholipid complexes produce very different plasma exposures, so trials on one do not transfer to another. Product labels frequently do not state which was tested.',
      safetyProfile:
        'Generally well tolerated at culinary exposure. At supplement strength the documented signal is hepatocellular liver injury, with ten adjudicated cases in the DILIN series and an HLA-B*35:01 susceptibility association. Curcumin also inhibits platelet aggregation and CYP3A4, so interaction with anticoagulants and with drugs cleared by CYP3A4 is plausible.',
    },
    commonQuestions: [
      {
        q: 'Does curcumin work for knee osteoarthritis?',
        a: 'For pain, the evidence says probably yes and modestly. Two randomised trials support it: a 70-patient placebo-controlled trial found less pain at 12 weeks, and a 367-patient trial found it non-inferior to ibuprofen over four weeks. For the joint itself, the answer is no — the MRI effusion-synovitis endpoint in the placebo-controlled trial did not change. Feeling better and being structurally better are different claims and this literature separates them cleanly.',
      },
      {
        q: 'Is the bioavailability problem actually solved by black pepper?',
        a: 'It is improved, substantially and measurably. Shoba et al. recorded a 2,000% increase in human volunteers with 20 mg piperine alongside 2 g curcumin, by blocking the glucuronidation step that clears it. Two caveats belong with that number: piperine inhibits the same enzymes that clear many prescription drugs, so the interaction risk rises with the absorption, and raising exposure does not answer the separate question of what curcumin does once it is there.',
        auditNote:
          'The absorption problem and the target-validity problem are independent. Solving the first does not touch the second.',
      },
      {
        q: 'Why does a compound with thousands of papers have no approved use?',
        a: 'Because the papers and the approvals measure different things. Nelson et al. set out the chemistry: curcumin is fluorescent, redox-active, aggregation-prone, chemically unstable at physiological pH and a covalent Michael acceptor, and each of those properties generates false positives in a common assay format. A very large in vitro literature built on those assays does not become clinical evidence by accumulating. As of that review, no double-blinded placebo-controlled curcumin trial had been successful.',
      },
      {
        q: 'Can turmeric supplements damage the liver?',
        a: 'The US Drug-Induced Liver Injury Network has published ten adjudicated cases and described the problem as growing, with a genetic susceptibility signal at HLA-B*35:01. The exposure in these cases was concentrated supplement extract rather than food, and the enhanced-absorption products are the ones that deliver the most compound. This is one of the clearest examples in this file of a safety issue arriving with a formulation improvement.',
        auditNote:
          'Ten adjudicated cases is a signal, not an incidence rate. No denominator exists because supplement exposure is not tracked.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Nelson KM et al. The Essential Medicinal Chemistry of Curcumin. J Med Chem 2017;60:1620-1637',
        identifier: '10.1021/acs.jmedchem.6b00975',
        kind: 'doi',
      },
      {
        label:
          'Wang Z et al. Effectiveness of Curcuma longa Extract for the Treatment of Symptoms and Effusion-Synovitis of Knee Osteoarthritis: A Randomized Trial. Ann Intern Med 2020;173:861-869',
        identifier: '10.7326/M20-0990',
        kind: 'doi',
      },
      {
        label:
          'Kuptniratsaikul V et al. Efficacy and safety of Curcuma domestica extracts compared with ibuprofen in patients with knee osteoarthritis: a multicenter study. Clin Interv Aging 2014;9:451-458',
        identifier: '10.2147/CIA.S58535',
        kind: 'doi',
      },
      {
        label:
          'Anand P et al. Bioavailability of curcumin: problems and promises. Mol Pharm 2007;4:807-818',
        identifier: '10.1021/mp700113r',
        kind: 'doi',
      },
      {
        label:
          'Shoba G et al. Influence of piperine on the pharmacokinetics of curcumin in animals and human volunteers. Planta Med 1998;64:353-356',
        identifier: '10.1055/s-2006-957450',
        kind: 'doi',
      },
      {
        label:
          "Ringman JM et al. Oral curcumin for Alzheimer's disease: tolerability and efficacy in a 24-week randomized, double blind, placebo-controlled study. Alzheimers Res Ther 2012;4:43",
        identifier: '10.1186/alzrt146',
        kind: 'doi',
      },
      {
        label:
          'Halegoua-DeMarzio D et al. Liver Injury Associated with Turmeric — A Growing Problem: Ten Cases from the Drug-Induced Liver Injury Network. Am J Med 2023;136:200-206',
        identifier: '10.1016/j.amjmed.2022.09.026',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 969516 — Curcumin',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/969516',
        kind: 'url',
      },
      {
        label:
          'NADAC (National Average Drug Acquisition Cost) 2026 — Centers for Medicare and Medicaid Services pharmacy acquisition-cost survey',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Ashwagandha — a replicated stress effect, a real hepatotoxicity signal, and one regulator who
  // reached a different conclusion from everyone else.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ashwagandha',
    name: 'Ashwagandha',
    tradeName: 'Sold as standardised root extracts including KSM-66 and Sensoril',
    sponsor: 'No single sponsor — root extract of Withania somnifera',
    targetGene: 'NR3C1',
    targetProtein:
      'No validated single target. The most consistently measured human effect is a fall in serum cortisol, which implicates the hypothalamic-pituitary-adrenal axis without identifying where in it the compound acts.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for stress, anxiety and sleep. Not approved as a medicine anywhere, and banned outright in food supplements in Denmark since 2023.',
    patientFriendlyIndication:
      'Marketed for stress and sleep; legal status differs between countries',
    conditionContext: {
      conditionExplainer:
        'Chronic psychological stress keeps the hypothalamic-pituitary-adrenal axis active, and cortisol stays elevated when it should be falling. Ashwagandha root extract is the most-trialled botanical against that pattern, usually measured by a self-report stress scale plus a morning serum cortisol.',
      whyItMatters:
        'This is one of the few supplements in this file where the efficacy signal is reasonably consistent across trials and the safety signal is the harder question. Both belong on the page.',
      whoTakesThis:
        'Adults reporting chronic stress, poor sleep or anxiety, buying it directly. It is also marketed to men for testosterone and to athletes for strength, on a much thinner evidence base than the stress claim.',
      clinicalGoals:
        'Trials have measured the Perceived Stress Scale, the Hamilton Anxiety Scale and serum cortisol. None has measured a diagnosed psychiatric outcome against an active antidepressant or anxiolytic.',
    },
    oneSentenceVerdict:
      'Nine randomised trials pooling 558 patients show a real reduction in perceived stress, anxiety scores and serum cortisol; five published cases of cholestatic liver injury and a Danish national ban show that "herbal" and "harmless" are not the same word.',
    laymanHowItWorks:
      'Ashwagandha root contains a family of steroid-like molecules called withanolides. In people under chronic stress, taking a standardised extract lowers the amount of cortisol circulating in the blood and lowers the score people give themselves on stress questionnaires. What nobody has established is which withanolide does it, or where in the stress axis it acts — the effect is measured at the output, not at the mechanism.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 52,
    anatomicalSite: 'Hypothalamic-pituitary-adrenal axis, measured at the adrenal cortisol output',
    substitutes: {
      summary:
        'For measured anxiety, the comparators with real trial evidence are cognitive behavioural therapy and SSRIs, neither of which has been tested head-to-head against ashwagandha. For cortisol specifically, sleep regularisation and aerobic exercise have larger and better-characterised effects.',
      conventionalRx: [
        {
          name: 'SSRIs (sertraline, escitalopram)',
          class: 'Selective serotonin reuptake inhibitor',
          howItCompares:
            'Approved for generalised anxiety disorder on the strength of large randomised trials with clinician-rated endpoints. No trial has randomised ashwagandha against an SSRI, so the comparison is between different evidence classes rather than between two treatments.',
          typicalCost:
            'Generic. Medicaid NADAC: sertraline 50 mg $0.036, escitalopram 10 mg $0.042 a tablet',
          prosAndCons:
            'Pros: regulatory review, clinician-rated endpoints, known interaction profile. Cons: sexual and gastrointestinal side effects, discontinuation symptoms.',
        },
        {
          name: 'Cognitive behavioural therapy',
          class: 'Structured psychological therapy',
          howItCompares:
            'Has the largest randomised evidence base of anything in this comparison and no hepatotoxicity signal. It costs time rather than money and is the only option here that changes behaviour rather than a blood measurement.',
          typicalCost: '',
          prosAndCons:
            'Pros: durable effect, no drug interaction. Cons: access, waiting lists, effort.',
        },
      ],
      naturalFoods: [
        {
          name: 'Regular aerobic exercise',
          activeCompound: 'Not applicable',
          biologicalMechanism:
            'Acute exercise raises cortisol and chronic training lowers resting cortisol reactivity, alongside effects on sleep architecture that ashwagandha trials do not attempt to control for.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'The WHO 2020 guidelines put the studied amount at 150 to 300 minutes of moderate or 75 to 150 minutes of vigorous aerobic activity a week, plus muscle strengthening.',
          monthlyCost: '',
        },
        {
          name: 'Consistent sleep timing',
          activeCompound: 'Not applicable',
          biologicalMechanism:
            'Cortisol follows a circadian rhythm with a morning peak. Irregular sleep timing flattens and shifts that curve, and morning serum cortisol — the endpoint most ashwagandha trials use — is directly sensitive to it.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'The AASM and Sleep Research Society consensus statement sets the amount at 7 or more hours a night on a regular basis.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Note the jaundice window if you use it',
          action:
            'The published liver injury cases appeared 2 to 12 weeks after starting, presenting with jaundice, itching, nausea and lethargy.',
          patientImpact:
            'All five patients in the Icelandic and DILIN series recovered, with liver tests normalising within one to five months, but the itching and high bilirubin lasted 5 to 20 weeks.',
          clinicalPrecaution:
            'Yellowing of the skin or eyes, dark urine or persistent itching while taking ashwagandha is a reason to stop and seek medical assessment, not a reason to wait.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC1=C(C(=O)O[C@H](C1)[C@@H](C)[C@H]2CC[C@@H]3[C@@]2(CC[C@H]4[C@H]3C[C@@H]5[C@]6([C@@]4(C(=O)C=C[C@@H]6O)C)O5)C)CO',
      chemicalFormula: 'C28H38O6',
      molecularWeight: '470.6 g/mol (withaferin A, PubChem CID 265237)',
      structureSource: {
        label: 'PubChem CID 265237 — Withaferin A, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/265237',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ash-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Species and plant-part verification before extraction',
          description:
            'Confirm Withania somnifera and confirm that the material is root, not leaf. This is not pedantry: the DTU risk assessment that led to the Danish ban explicitly noted that harmful effects had been reported for extracts of plant parts other than root, and leaf material carries a markedly higher withaferin A content than root.',
          reagentsAndBuffer:
            'ITS2 and matK DNA barcoding; withaferin A and withanolide A reference standards; HPTLC on silica gel 60 F254 with toluene / ethyl acetate / formic acid',
        },
        {
          id: 'ash-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Aqueous or hydroalcoholic extraction of the milled root',
          description:
            'Extract the milled root. The choice of solvent is part of the intervention: the two most-trialled commercial extracts differ in whether they are water-based or hydroalcoholic and in their stated withanolide percentage, and trials on one are not evidence for the other.',
          dependsOnStepId: 'ash-w1',
          reagentsAndBuffer:
            'Water or aqueous ethanol; controlled temperature below 60 degrees C; spray drying onto a defined carrier',
        },
        {
          id: 'ash-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Withanolide quantification and marker profile',
          description:
            'Quantify total withanolides by HPLC and report the individual profile rather than the total alone, because withaferin A and withanolide A have different pharmacology and different safety profiles.',
          dependsOnStepId: 'ash-w2',
          reagentsAndBuffer:
            'C18 HPLC with water / acetonitrile gradient; detection at 227 nm; LC-MS confirmation; ICP-MS for lead, arsenic and mercury given documented heavy-metal findings in Ayurvedic products',
        },
        {
          id: 'ash-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Hepatocyte exposure at extract-relevant concentration',
          description:
            'Expose primary human hepatocytes to the standardised extract, not to purified withaferin A alone, so that the cholestatic signal reported in the clinical case series has a matching in vitro model.',
          dependsOnStepId: 'ash-w3',
          reagentsAndBuffer:
            "Cryopreserved primary human hepatocytes in sandwich culture; Williams' E medium with GlutaMAX; cholyl-lysyl-fluorescein for bile-canalicular efflux imaging",
        },
        {
          id: 'ash-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Bile salt export pump inhibition and cortisol-axis readout',
          description:
            'Measure BSEP-mediated taurocholate transport inhibition as the mechanistic hypothesis for the cholestatic injury phenotype, and separately measure cortisol output in an adrenocortical cell line as the efficacy-side readout.',
          dependsOnStepId: 'ash-w4',
          reagentsAndBuffer:
            'BSEP-expressing membrane vesicles with tritiated taurocholate; H295R adrenocortical cells with forskolin stimulation; cortisol ELISA on conditioned medium',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ash-a1',
        category: 'measured',
        title:
          'Nine randomised trials, 558 patients: perceived stress, anxiety and cortisol all fell',
        laymanSummary:
          'Pooling the randomised evidence, ashwagandha lowered self-rated stress, a clinician-rated anxiety scale, and the stress hormone in blood.',
        technicalDetails:
          'A 2024 systematic review and meta-analysis of nine randomised controlled trials in 558 patients found significant effects on the Perceived Stress Scale (MD -4.72, 95% CI -8.45 to -0.99), the Hamilton Anxiety Scale (MD -2.19, 95% CI -3.83 to -0.55) and serum cortisol (MD -2.58, 95% CI -4.99 to -0.16) against placebo. Four of the included studies reported mild to moderate adverse events. The confidence intervals are wide and the trial base is small, but the direction is consistent across three different kinds of measurement.',
        evidenceSource: 'Arumugam V et al. Explore (NY) 2024;20:103062',
        doi: '10.1016/j.explore.2024.103062',
        measuredMetric:
          'Perceived Stress Scale, Hamilton Anxiety Scale and serum cortisol versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'ash-a2',
        category: 'measured',
        title: 'Chandrasekhar 2012: cortisol fell alongside every stress scale in 64 adults',
        laymanSummary:
          'The most-cited single trial gave 300 mg of root extract twice daily for 60 days and found lower stress scores and lower cortisol than placebo.',
        technicalDetails:
          'Single-centre, prospective, double-blind, randomised, placebo-controlled trial in 64 adults with a history of chronic stress. The treatment arm received 300 mg of a high-concentration full-spectrum root extract twice daily for 60 days. Scores on all stress-assessment scales fell significantly against placebo (P < 0.0001) and serum cortisol fell substantially (P = 0.0006). Adverse effects were mild and comparable between groups. This is a 64-person single-centre trial, which is the honest scale to hold the result at.',
        evidenceSource:
          'Chandrasekhar K, Kapoor J, Anishetty S. Indian J Psychol Med 2012;34:255-262',
        doi: '10.4103/0253-7176.106022',
        measuredMetric: 'Stress-assessment scale scores and serum cortisol at day 60',
        auditFlag: 'verified',
      },
      {
        id: 'ash-a3',
        category: 'failed',
        title: 'Five published cases of cholestatic liver injury from ashwagandha supplements',
        laymanSummary:
          'Five people in Iceland and the United States developed jaundice and severe itching from ashwagandha products, and it took months to resolve.',
        technicalDetails:
          'Björnsson et al. reported five cases of liver injury attributed to ashwagandha-containing supplements, three collected in Iceland during 2017 to 2018 and two from the US Drug-Induced Liver Injury Network in 2016, with causality assessed by the DILIN structured expert opinion approach. Mean age 43. All developed jaundice after a latency of 2 to 12 weeks. Injury was cholestatic or mixed (R ratios 1.4 to 3.3). Pruritus and hyperbilirubinaemia were prolonged, 5 to 20 weeks. No patient developed hepatic failure and liver tests normalised within one to five months in the four with follow-up. Chemical analysis confirmed ashwagandha in the available supplements and identified no other toxic compound.',
        evidenceSource: 'Björnsson HK et al. Liver Int 2020;40:825-829',
        doi: '10.1111/liv.14393',
        measuredMetric: 'Adjudicated cases of cholestatic or mixed drug-induced liver injury',
        auditFlag: 'caution',
      },
      {
        id: 'ash-a4',
        category: 'conclusion_shift',
        title: 'Denmark banned it in 2023; no other major regulator followed',
        laymanSummary:
          'One European country decided the safety data were not good enough to set any safe intake and prohibited ashwagandha in supplements. Everyone else kept selling it.',
        technicalDetails:
          'The Technical University of Denmark carried out a risk assessment for the Danish Veterinary and Food Administration in 2020, citing reported effects on thyroid and sex hormones, effects on sperm quality in animal studies, and a possible abortifacient effect. The assessment concluded that no safe lower intake limit could be established, and Denmark prohibited ashwagandha in food supplements in April 2023. The FDA, the EMA and other European regulators have not followed. The critique published in the Ayurvedic literature notes the DTU report was not peer-reviewed and that the abortifacient claim was not supported by clinical evidence. Both the ban and the criticism of it are facts about the same document.',
        evidenceSource:
          'McKeown M. Why did Denmark ban Ashwagandha? McGill Office for Science and Society, 2 June 2023',
        inferredClaim:
          'That absence of a ban elsewhere means the safety question was settled, when in most jurisdictions it was never formally asked',
        auditFlag: 'contested',
      },
      {
        id: 'ash-a5',
        category: 'inferred',
        title: 'The testosterone and strength marketing is not what the stress evidence supports',
        laymanSummary:
          'The pooled evidence that survives scrutiny is about stress, anxiety and cortisol. The claims about testosterone and muscle rest on a much smaller and weaker set of trials.',
        technicalDetails:
          'The 2024 meta-analysis pooled nine trials and restricted itself to stress and anxiety outcomes, both subjective and objective. Testosterone, sperm parameters and strength outcomes come from individual small trials that have not been pooled to the same standard, and several were conducted or funded by extract manufacturers. Reading the stress meta-analysis as general validation of the ingredient, and then applying it to a hormonal claim, is the specific inference this page flags.',
        evidenceSource: 'Arumugam V et al. Explore (NY) 2024;20:103062',
        doi: '10.1016/j.explore.2024.103062',
        inferredClaim:
          'That a replicated effect on cortisol and perceived stress validates the separate marketed claims about testosterone, fertility and muscle',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A standardised root extract, not a single molecule',
        laymanDesc:
          'The capsule contains a mixture of dozens of related plant steroids, standardised to a stated percentage of the group as a whole.',
        molecularDetail:
          'Withanolides are C28 steroidal lactones. Commercial extracts state total withanolide percentage rather than individual composition, so two products at the same stated strength can have different withaferin A content and therefore different pharmacology.',
        iconName: 'Leaf',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorbed, and metabolised in the liver',
        laymanDesc:
          'Withanolides are absorbed from the gut and processed by the liver, which is also where the documented injury cases occurred.',
        molecularDetail:
          'Withanolides undergo hepatic phase I and phase II metabolism. The published injury phenotype is cholestatic or mixed rather than hepatocellular, with R ratios of 1.4 to 3.3, which points toward interference with bile transport rather than direct hepatocyte necrosis.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Something in the stress axis is dampened, and nobody has established what',
        laymanDesc:
          "The body's stress hormone system runs quieter. The step at which the extract acts has not been pinned down in humans.",
        molecularDetail:
          'Proposed mechanisms include GABA-A receptor modulation, glucocorticoid receptor interaction and direct effects on adrenal steroidogenesis. None has been demonstrated at a human-achievable concentration, and the extract is a mixture, so a single-target account may not be the right shape of explanation.',
        iconName: 'Network',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Serum cortisol falls',
        laymanDesc: 'The measurable consequence is less cortisol in the blood.',
        molecularDetail:
          'The 2024 pooled estimate is a mean difference of -2.58 in serum cortisol against placebo (95% CI -4.99 to -0.16). This is the only objective biochemical endpoint in the meta-analysis, and its confidence interval nearly touches zero.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Self-rated stress and clinician-rated anxiety improve',
        laymanDesc:
          'People report feeling less stressed, and an interviewer-scored anxiety scale agrees.',
        molecularDetail:
          'Perceived Stress Scale MD -4.72 and Hamilton Anxiety Scale MD -2.19 against placebo across nine trials. The Hamilton scale is clinician-rated, which matters: it is harder to move with expectation alone than a self-report questionnaire is.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Chandrasekhar 2012 (chronic stress, 60 days)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 64,
        primaryEndpoint:
          'Change in standard stress-assessment scale scores and serum cortisol at day 60',
        endpointMet: true,
        statisticalPValue: 'P < 0.0001 for stress scales; P = 0.0006 for serum cortisol',
        unreportedAdverseSignals:
          'Single centre, 60 days, and no active comparator. Adverse effects were mild and comparable between arms.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Arumugam 2024 pooled analysis (nine randomised trials)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 558,
        primaryEndpoint:
          'Pooled effect on Perceived Stress Scale, Hamilton Anxiety Scale and serum cortisol',
        endpointMet: true,
        statisticalPValue: 'All three pooled estimates significant; confidence intervals wide',
        unreportedAdverseSignals:
          'Four of nine included studies reported mild to moderate adverse events. The review noted that long-term safety information remains insufficient.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Björnsson 2020 (hepatotoxicity case series, Iceland and US DILIN)',
        phase: 'Adjudicated case series',
        sampleSize: 5,
        primaryEndpoint: 'Clinical phenotype of suspected ashwagandha-induced liver injury',
        endpointMet: true,
        statisticalPValue:
          'Not applicable — causality assessed by DILIN structured expert opinion rather than by hypothesis test',
        unreportedAdverseSignals:
          'Four of five patients were taking additional supplements, and in one case rhodiola was a possible co-causative agent. This limits attribution without weakening the signal.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Perceived Stress Scale MD -4.72, Hamilton Anxiety Scale MD -2.19 and serum cortisol MD -2.58 against placebo across nine randomised trials in 558 patients',
        'Significant reduction in every stress scale and in serum cortisol over 60 days in a 64-person placebo-controlled trial',
        'Five adjudicated cases of cholestatic or mixed liver injury with a 2 to 12 week latency and 5 to 20 weeks of prolonged jaundice and itching',
      ],
      unsupportedInferences: [
        'That the stress and cortisol evidence validates the separately marketed testosterone, fertility and strength claims',
        'That trials on one commercial extract apply to another with a different solvent, plant part or withanolide profile',
        'That a botanical with a documented hepatotoxicity signal is safe to combine silently with prescription medicine',
      ],
      whatFailedInitially: [
        'Denmark could not establish a safe lower intake limit and banned the ingredient in food supplements in 2023',
        'No trial has compared ashwagandha with an approved anxiolytic or antidepressant on a clinician-rated endpoint',
      ],
      realWorldOutcome: [
        'This is one of the better-supported efficacy signals in this file, at a small scale and over short durations',
        'The regulatory position now differs by country for the same product, which is unusual and worth knowing before travelling with it',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule or tablet of standardised root extract',
      description:
        'Sold as a dietary supplement in most jurisdictions with no premarket efficacy review, and prohibited in food supplements in Denmark since April 2023. Commercial extracts differ in solvent, plant part and stated withanolide percentage, and the trial literature is extract-specific rather than ingredient-general.',
      safetyProfile:
        'Commonly reported effects are gastrointestinal upset and drowsiness. The documented serious signal is cholestatic or mixed drug-induced liver injury, with jaundice appearing 2 to 12 weeks after starting and pruritus lasting up to 20 weeks; all five published cases resolved without hepatic failure. Withanolides have been reported to affect thyroid and sex hormone measurements. Denmark cited a possible abortifacient effect, which critics note was not supported by clinical evidence.',
    },
    commonQuestions: [
      {
        q: 'Does ashwagandha actually lower stress, or is it placebo?',
        a: 'The pooled randomised evidence says it does something real. Across nine trials in 558 patients, three separate measurements moved in the same direction: a self-report stress scale, a clinician-rated anxiety scale, and serum cortisol. The clinician-rated and biochemical endpoints matter more than the self-report one, because they are harder to move by expectation. What the evidence does not yet support is a size claim — the confidence intervals are wide and the trials are small and short.',
      },
      {
        q: 'Why is it banned in Denmark but sold everywhere else?',
        a: 'Because Denmark asked the question formally and most countries did not. The Technical University of Denmark carried out a risk assessment in 2020, could not establish a safe lower intake limit given reported hormonal effects and animal fertility findings, and Denmark prohibited it in food supplements in April 2023. The FDA and EMA have not conducted equivalent reviews, and under DSHEA in the United States no such review is required before sale. Absence of a ban is not the same as a clean bill of health.',
        auditNote:
          'The DTU report itself has been criticised in the Ayurvedic literature as not peer-reviewed and as asserting an abortifacient effect without clinical support. Both facts stand.',
      },
      {
        q: 'How serious is the liver risk?',
        a: 'Five published, formally adjudicated cases, none fatal, all resolving within one to five months — but with jaundice and severe itching lasting weeks to months in the meantime. That is a real signal without a known incidence rate, because supplement exposure is not tracked and there is no denominator. The practical implication is specific: jaundice, dark urine or persistent itching starting 2 to 12 weeks after beginning ashwagandha is a reason to stop and be assessed.',
      },
      {
        q: 'Does it raise testosterone?',
        a: 'That claim rests on a different and much thinner evidence base than the stress claim, drawn from individual small trials rather than a pooled analysis, several with manufacturer involvement. The nine-trial meta-analysis on this page measured stress, anxiety and cortisol, and nothing else. Treating a positive result on those endpoints as validation of a hormonal claim is the inference this page flags.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Arumugam V et al. Effects of Ashwagandha (Withania somnifera) on stress and anxiety: A systematic review and meta-analysis. Explore (NY) 2024;20:103062',
        identifier: '10.1016/j.explore.2024.103062',
        kind: 'doi',
      },
      {
        label:
          'Chandrasekhar K, Kapoor J, Anishetty S. A prospective, randomized double-blind, placebo-controlled study of safety and efficacy of a high-concentration full-spectrum extract of ashwagandha root in reducing stress and anxiety in adults. Indian J Psychol Med 2012;34:255-262',
        identifier: '10.4103/0253-7176.106022',
        kind: 'doi',
      },
      {
        label:
          'Björnsson HK et al. Ashwagandha-induced liver injury: A case series from Iceland and the US Drug-Induced Liver Injury Network. Liver Int 2020;40:825-829',
        identifier: '10.1111/liv.14393',
        kind: 'doi',
      },
      {
        label:
          'McKeown M. Why did Denmark ban Ashwagandha? McGill University Office for Science and Society, 2 June 2023',
        identifier:
          'https://www.mcgill.ca/oss/article/critical-thinking-health-and-nutrition/why-did-denmark-ban-ashwagandha',
        kind: 'url',
      },
      {
        label: 'PubChem CID 265237 — Withaferin A',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/265237',
        kind: 'url',
      },
      {
        label:
          'Bull FC et al. World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med 2020;54:1451-1462',
        identifier: '10.1136/bjsports-2020-102955',
        kind: 'doi',
      },
      {
        label:
          'Watson NF et al. Recommended amount of sleep for a healthy adult: a joint consensus statement of the American Academy of Sleep Medicine and Sleep Research Society. Sleep 2015;38:843-844',
        identifier: '10.5665/sleep.4716',
        kind: 'doi',
      },
      {
        label:
          'NADAC (National Average Drug Acquisition Cost) 2026 — Centers for Medicare and Medicaid Services pharmacy acquisition-cost survey',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Rhodiola rosea — eleven placebo-controlled trials and almost no independent replication.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'rhodiola-rosea',
    name: 'Rhodiola rosea',
    tradeName: 'Sold as golden root or arctic root, often as the SHR-5 standardised extract',
    sponsor: 'No single sponsor — root extract of Rhodiola rosea',
    targetGene: 'SLC6A4',
    targetProtein:
      'No validated single target. Monoamine transporter and monoamine oxidase interactions have been proposed from in vitro work; none has been demonstrated at a human-achievable concentration.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for fatigue, stress and mental performance. Registered as a traditional herbal medicinal product for temporary stress symptoms in parts of Europe, which is a registration based on traditional use rather than on efficacy trials.',
    patientFriendlyIndication: 'Marketed for fatigue and mental performance under stress',
    conditionContext: {
      conditionExplainer:
        'Rhodiola rosea is an arctic stonecrop whose root has been used in Scandinavian and Russian traditional medicine for fatigue. Modern trials mostly test whether a standardised extract improves performance in people who are tired for a specific reason — night shifts, exam periods, military duty — rather than in a diagnosed condition.',
      whyItMatters:
        'Rhodiola is a case study in what a moderate-quality trial base looks like when nobody replicates anybody. The individual trials are not badly run; the problem is that each stands alone.',
      whoTakesThis:
        'Shift workers, students, endurance athletes and adults with self-described burnout. It is also taken for low mood, on the strength of one 57-person phase 2 trial.',
      clinicalGoals:
        'Trials have measured fatigue indices, cognitive test batteries, and in one case the Hamilton Depression Rating Scale against sertraline. None has measured a hard clinical outcome.',
    },
    oneSentenceVerdict:
      "Eleven placebo-controlled trials, moderate to good methodological quality, effects reported on physical and mental performance — and, in the systematic review's own words, a lack of independent replication of any single one of them.",
    laymanHowItWorks:
      'Rhodiola root contains two families of marker compounds: rosavins, which are close to unique to this species, and salidroside, which is not. Trials give a standardised extract to people who are tired and measure whether they perform better on tests. What the extract is doing at the molecular level in a human being has not been established; the animal and cell work points at monoamine signalling and at stress-hormone regulation, but at concentrations nobody has shown a person reaches.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 40,
    anatomicalSite: 'Central nervous system, inferred rather than localised',
    substitutes: {
      summary:
        'For fatigue under acute stress the honest comparators are sleep and caffeine, both of which have far larger and better-characterised effects. For depression, the trial that compared rhodiola with sertraline found sertraline worked better and caused more side effects, which is a real trade-off rather than a win for either.',
      conventionalRx: [
        {
          name: 'Sertraline',
          class: 'Selective serotonin reuptake inhibitor',
          howItCompares:
            'Directly compared in Mao et al. 2015. Sertraline produced a larger fall in the Hamilton Depression Rating Scale (-8.2, 95% CI -12.7 to -3.6) than rhodiola (-5.1, 95% CI -8.8 to -1.3) or placebo (-4.6, 95% CI -8.6 to -0.6), with no significant difference between groups, and adverse events in 63.2% of the sertraline arm against 30.0% on rhodiola and 16.7% on placebo (P = 0.012).',
          typicalCost:
            'Generic. Medicaid NADAC: sertraline 50 mg at $0.036 a tablet, February 2026',
          prosAndCons:
            'Pros: larger effect, regulatory approval, decades of use. Cons: twice the adverse event rate of rhodiola in the one trial that measured both.',
        },
        {
          name: 'Caffeine',
          class: 'Adenosine receptor antagonist',
          howItCompares:
            'The best-characterised acute anti-fatigue compound in existence, with dose-response data rhodiola does not have. It is also the substance most rhodiola trial participants were already using, which very few of those trials controlled for.',
          typicalCost: '',
          prosAndCons:
            'Pros: reliable, immediate, thoroughly studied. Cons: tolerance, sleep disruption, and it does nothing for the underlying sleep debt.',
        },
      ],
      naturalFoods: [
        {
          name: 'Recovering the missing sleep',
          activeCompound: 'Not applicable',
          biologicalMechanism:
            'Most rhodiola trials enrol people whose fatigue is caused by sleep restriction — night-duty physicians, students in exam periods, cadets. Sleep is the intervention with the effect size everything else in this comparison is measured against.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'The AASM and Sleep Research Society consensus quantifies it as 7 or more hours a night on a regular basis, which is the exposure these night-duty and exam-period cohorts were short of.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Check the species on the label',
          action:
            'Rhodiola rosea is the species with the trial evidence. Rhodiola crenulata is a different species that is cheaper and is a documented substitute in the supply chain.',
          patientImpact:
            'Rosavins are close to specific to R. rosea; salidroside is present across the genus. A product standardised only to salidroside does not establish which species is in the bottle.',
          clinicalPrecaution:
            'In the Icelandic and DILIN ashwagandha liver injury series, one patient was taking rhodiola alongside, and it was named as a possible co-causative agent. That is a single ambiguous case, not an established signal.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC(=CC=C1CCO[C@H]2[C@@H]([C@H]([C@@H]([C@H](O2)CO)O)O)O)O',
      chemicalFormula: 'C14H20O7',
      molecularWeight: '300.30 g/mol (salidroside, PubChem CID 159278)',
      structureSource: {
        label: 'PubChem CID 159278 — Salidroside, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/159278',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'rho-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Species authentication against Rhodiola crenulata',
          description:
            'Confirm the material is Rhodiola rosea and not a congener. This is the single most important control in the whole workflow: rosavin, rosin and rosarin are close to specific to R. rosea, while salidroside occurs across the genus, so a salidroside-only specification cannot distinguish the species with the trial evidence from the one without it.',
          reagentsAndBuffer:
            'Rosavin, rosin, rosarin and salidroside reference standards; ITS and matK DNA barcoding; HPTLC on silica gel with chloroform / methanol / water',
        },
        {
          id: 'rho-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Hydroalcoholic extraction of dried rhizome and root',
          description:
            'Extract dried, milled rhizome into aqueous ethanol and concentrate under reduced pressure. Cinnamyl glycosides are heat-labile, so the concentration temperature is a specification and not an incidental detail.',
          dependsOnStepId: 'rho-w1',
          reagentsAndBuffer:
            '70% aqueous ethanol; percolation extraction at ambient temperature; rotary evaporation below 45 degrees C; spray drying onto maltodextrin',
        },
        {
          id: 'rho-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Standardisation to a stated rosavin and salidroside ratio',
          description:
            'Quantify rosavins and salidroside separately and standardise to a stated ratio. The trials that report effects used extracts specified on both markers, most commonly at a 3:1 rosavin to salidroside ratio, so a product specified on one marker is not the tested intervention.',
          dependsOnStepId: 'rho-w2',
          reagentsAndBuffer:
            'C18 HPLC with water / acetonitrile gradient; detection at 250 nm for cinnamyl glycosides and 275 nm for salidroside; LC-MS confirmation',
        },
        {
          id: 'rho-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Blood-brain barrier permeability screen',
          description:
            'Measure apparent permeability across an in vitro blood-brain barrier model, because every proposed central mechanism for this extract requires the marker compounds to reach the brain and that step has not been demonstrated in humans.',
          dependsOnStepId: 'rho-w3',
          reagentsAndBuffer:
            'hCMEC/D3 monolayer on Transwell inserts; transendothelial electrical resistance monitoring; sodium fluorescein paracellular control; LC-MS/MS quantification of salidroside and rosavin in the basolateral compartment',
        },
        {
          id: 'rho-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Monoamine transporter and MAO inhibition panel with a potency cut-off',
          description:
            'Run the proposed serotonin and norepinephrine transporter and monoamine oxidase activities as a concentration-response, and report whether the IC50 sits above or below the concentration measured in the permeability step. A reported activity at a concentration nothing reaches is not a mechanism.',
          dependsOnStepId: 'rho-w4',
          reagentsAndBuffer:
            'HEK293 cells expressing human SERT and NET with tritiated substrate uptake; recombinant human MAO-A and MAO-B with kynuramine substrate; fluoxetine and clorgyline reference inhibitors',
        },
      ],
    },
    keyAudits: [
      {
        id: 'rho-a1',
        category: 'measured',
        title: 'Eleven placebo-controlled trials of moderate to good quality, and no replication',
        laymanSummary:
          'A systematic review found eleven decent placebo-controlled trials with positive results, and pointed out that not one of them had been independently repeated.',
        technicalDetails:
          'Hung, Perry and Ernst searched six databases without language restriction and identified eleven randomised controlled trials, all placebo-controlled: six on physical performance, four on mental performance and two in diagnosed mental health conditions. Methodological quality was moderate or good, with five of ten scoring more than three points on the Jadad scale. The conclusion was that R. rosea may have beneficial effects on physical performance, mental performance and certain mental health conditions, and that there is a lack of independent replication of the single different studies. Only mild adverse events were reported.',
        evidenceSource: 'Hung SK, Perry R, Ernst E. Phytomedicine 2011;18:235-244',
        doi: '10.1016/j.phymed.2010.08.014',
        measuredMetric: 'Pooled qualitative assessment of eleven placebo-controlled trials',
        auditFlag: 'verified',
      },
      {
        id: 'rho-a2',
        category: 'measured',
        title: 'Darbinyan 2000: a crossover trial in physicians on night duty',
        laymanSummary:
          'Doctors working night shifts scored better on mental performance tests while taking a standardised rhodiola extract than while taking placebo.',
        technicalDetails:
          'A double-blind crossover study of the standardised SHR-5 extract on a repeated low-dose regimen in healthy physicians during night duty, reporting improvement on a fatigue index built from cognitive performance tasks. The design is the strongest feature: crossover with each participant as their own control removes between-person variation, which matters at this sample size. The weakness is that it has not been independently repeated in the twenty-five years since.',
        evidenceSource: 'Darbinyan V et al. Phytomedicine 2000;7:365-371',
        doi: '10.1016/S0944-7113(00)80055-0',
        measuredMetric:
          'Composite fatigue index from cognitive performance tasks during night duty',
        auditFlag: 'verified',
      },
      {
        id: 'rho-a3',
        category: 'failed',
        title: 'Mao 2015: no significant difference from placebo on any depression scale',
        laymanSummary:
          'In the only trial to compare rhodiola against a real antidepressant, nothing reached statistical significance — including the antidepressant.',
        technicalDetails:
          'Phase 2 randomised placebo-controlled trial, 57 subjects randomised to 12 weeks of standardised R. rosea extract, sertraline or placebo for mild to moderate major depressive disorder. Reductions in HAM-D, BDI and CGI/C were modest and statistically non-significant, with no significant difference between groups (P = 0.79, 0.28 and 0.17). The HAM-D decline was -8.2 for sertraline, -5.1 for rhodiola and -4.6 for placebo. Adverse events were reported by 63.2% on sertraline, 30.0% on rhodiola and 16.7% on placebo (P = 0.012). The authors framed the result as a more favourable risk-to-benefit ratio for rhodiola, which is a defensible reading of a trial that was underpowered for efficacy and did detect the tolerability difference.',
        evidenceSource: 'Mao JJ et al. Phytomedicine 2015;22:394-399',
        doi: '10.1016/j.phymed.2015.01.010',
        measuredMetric: 'Change in Hamilton Depression Rating Scale over 12 weeks',
        auditFlag: 'caution',
      },
      {
        id: 'rho-a4',
        category: 'inferred',
        title: 'The sports-performance claim does not survive a systematic review',
        laymanSummary:
          'A 2023 review of randomised trials in athletes found the evidence for rhodiola improving sports performance thin and inconsistent.',
        technicalDetails:
          'A 2023 systematic review of randomised controlled trials on Rhodiola rosea and sports performance in Phytotherapy Research assessed the trial base and found it heterogeneous in dose, extract, duration and outcome measure, with results that do not converge. Six of the eleven trials in the 2011 systematic review were on physical performance, so this is the same underlying literature re-examined a decade later with a sport-specific lens, and it did not consolidate.',
        evidenceSource: 'Sanz-Barrio PM et al. Phytother Res 2023;37:4414-4428',
        doi: '10.1002/ptr.7950',
        inferredClaim:
          'That an anti-fatigue effect in sleep-deprived shift workers transfers to a performance effect in trained athletes',
        auditFlag: 'caution',
      },
      {
        id: 'rho-a5',
        category: 'inferred',
        title: 'The fatigue evidence is a systematic review of small, heterogeneous trials',
        laymanSummary:
          'A 2012 review of rhodiola for fatigue could not pool the studies, because they measured different things in different people for different lengths of time.',
        technicalDetails:
          'Ishaque et al. reviewed the randomised evidence for R. rosea in physical and mental fatigue in BMC Complementary and Alternative Medicine and reported that the studies varied so much in population, extract, dose, duration and outcome that a meaningful pooled estimate could not be produced. Absence of a pooled estimate is not evidence of absence of effect. It does mean the effect size is unknown, which is what the marketing implicitly supplies.',
        evidenceSource: 'Ishaque S et al. BMC Complement Altern Med 2012;12:70',
        doi: '10.1186/1472-6882-12-70',
        inferredClaim:
          'That a specific effect size can be attributed to rhodiola for fatigue, when the trials cannot be pooled to produce one',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A two-marker extract, and the species matters',
        laymanDesc:
          'The capsule is a root extract standardised on two different families of compounds, one of which is close to unique to this species.',
        molecularDetail:
          'Rosavin, rosin and rosarin are cinnamyl glycosides largely specific to Rhodiola rosea. Salidroside, a tyrosol glucoside, occurs across the genus including in the cheaper R. crenulata. Trial extracts are specified on both, most often at a 3:1 rosavin to salidroside ratio.',
        iconName: 'Leaf',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorbed, and hydrolysed on the way',
        laymanDesc:
          'The glycosides are absorbed after the sugar is cleaved off, so what circulates is not exactly what was swallowed.',
        molecularDetail:
          'Salidroside is hydrolysed to its aglycone tyrosol by intestinal and microbial beta-glucosidases; rosavins are similarly deglycosylated. Human pharmacokinetic characterisation of either family is sparse, and no trial in the systematic review measured a plasma concentration.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'A proposed central action that has not been located',
        laymanDesc:
          'The favoured explanation is an effect on brain messenger chemicals, but nobody has shown it happening in a person.',
        molecularDetail:
          'Cell and animal work reports monoamine oxidase inhibition and effects on serotonin and dopamine turnover, and effects on the hypothalamic-pituitary-adrenal axis. The unresolved step is whether the marker compounds cross the blood-brain barrier at the concentrations an oral dose produces.',
        iconName: 'Network',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Fatigue indices improve in acutely stressed people',
        laymanDesc: 'People who are tired for a specific reason score better on the tests.',
        molecularDetail:
          'The most consistent trial signal is in populations under acute stress with sleep restriction — night-duty physicians, students, cadets — rather than in healthy rested volunteers, which is a pattern worth noticing about what the extract may be compensating for.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And each result stands alone',
        laymanDesc:
          'The individual trials are reasonable. Nobody has repeated any of them independently.',
        molecularDetail:
          'This is the finding the 2011 systematic review put in its conclusion, and it has not changed. Eleven placebo-controlled trials, moderate to good quality, no independent replication of any single one.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Mao 2015 (R. rosea versus sertraline versus placebo, major depressive disorder)',
        phase: 'Phase 2 randomised, placebo-controlled',
        sampleSize: 57,
        primaryEndpoint: 'Change in Hamilton Depression Rating Scale over 12 weeks',
        endpointMet: false,
        statisticalPValue: 'P = 0.79 for HAM-D between groups; adverse event difference P = 0.012',
        unreportedAdverseSignals:
          'Neither active arm separated from placebo, so this is an underpowered trial rather than a demonstration that rhodiola equals sertraline. The tolerability difference was the only significant finding.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Darbinyan 2000 (SHR-5 extract, physicians on night duty)',
        phase: 'Double-blind crossover',
        sampleSize: 56,
        primaryEndpoint: 'Composite fatigue index from cognitive performance tasks',
        endpointMet: true,
        statisticalPValue: 'Significant improvement against placebo on the fatigue index',
        unreportedAdverseSignals:
          'Two-week crossover with a low-dose repeated regimen. Not independently replicated in the twenty-five years since publication.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Hung 2011 systematic review (eleven placebo-controlled trials)',
        phase: 'Systematic review',
        sampleSize: 0,
        primaryEndpoint:
          'Assessment of evidence for and against efficacy across physical performance, mental performance and mental health',
        endpointMet: true,
        statisticalPValue: 'Not applicable — narrative synthesis, no pooled estimate',
        unreportedAdverseSignals:
          'Sample size recorded as 0 because the review reports trial counts rather than a pooled participant total. Only mild adverse events were reported across the included trials.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Eleven placebo-controlled randomised trials of moderate to good methodological quality reporting effects on physical and mental performance',
        'Improvement on a composite fatigue index in physicians during night duty, in a crossover design',
        'Adverse events in 30.0% on rhodiola against 63.2% on sertraline and 16.7% on placebo over 12 weeks',
      ],
      unsupportedInferences: [
        'That rhodiola is comparable to sertraline for depression — in the one trial that tested it, neither arm separated from placebo',
        'That an anti-fatigue effect in sleep-restricted shift workers transfers to athletic performance',
        'That a specific effect size exists for fatigue, when the trials are too heterogeneous to pool into one',
        'That a product standardised only on salidroside contains the species with the trial evidence',
      ],
      whatFailedInitially: [
        'No efficacy separation from placebo on any depression scale in the one active-controlled trial',
        'A 2023 systematic review of sports performance found the trial base too inconsistent to support the claim',
      ],
      realWorldOutcome: [
        'The tolerability finding is real and is the most defensible thing on this page: markedly fewer adverse events than sertraline over 12 weeks',
        'Fifteen years after the systematic review named the problem, independent replication is still missing',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule or tablet of standardised root and rhizome extract',
      description:
        'Sold as a dietary supplement in the United States with no premarket efficacy review, and registered in parts of Europe as a traditional herbal medicinal product, a registration granted on documented traditional use rather than on trial evidence. Substitution with the cheaper Rhodiola crenulata is a documented supply-chain issue, which is why the rosavin specification matters.',
      safetyProfile:
        'Only mild adverse events were reported across the eleven trials in the systematic review, and the rate in the sertraline comparison was half that of the drug and roughly double that of placebo. Reported effects include dizziness, dry mouth and, given the proposed monoamine activity, a theoretical interaction with serotonergic drugs that has not been formally studied. One patient in the ashwagandha liver injury case series was taking rhodiola concurrently and it was named as a possible co-causative agent.',
    },
    commonQuestions: [
      {
        q: 'Does rhodiola work for fatigue?',
        a: 'The trials say something is happening and cannot say how much. Eleven placebo-controlled trials of moderate to good quality report effects on physical and mental performance, mostly in people who are acutely stressed and sleep-restricted rather than healthy and rested. What is missing is the thing that would settle it: not one of those trials has been independently replicated, and a 2012 review found them too heterogeneous to pool into a single effect size.',
        auditNote:
          'A systematic review naming the lack of replication in 2011, still unaddressed in 2026, is itself a finding about the field.',
      },
      {
        q: 'Is it as good as an antidepressant?',
        a: 'The one trial that tested that found neither arm beat placebo. In 57 patients over 12 weeks, HAM-D fell 8.2 points on sertraline, 5.1 on rhodiola and 4.6 on placebo, with no significant difference between groups. The interpretable finding is the tolerability one: 63.2% of the sertraline arm reported adverse events against 30.0% on rhodiola. That is a real trade-off, and it is not the same as showing rhodiola treats depression.',
      },
      {
        q: 'Why does the species on the label matter?',
        a: 'Because the trial evidence is species-specific and the supply chain is not. Rosavins are close to unique to Rhodiola rosea and are what the tested extracts are standardised on; salidroside occurs throughout the genus, including in the cheaper Rhodiola crenulata. A product specified only on salidroside content cannot tell you which species you have, and therefore cannot connect itself to the trials.',
      },
      {
        q: 'Does it help athletic performance?',
        a: 'A 2023 systematic review of thirteen randomised trials in 263 participants found the evidence heterogeneous and inconsistent. The underlying trials differ in extract, dose, duration and outcome, and they do not converge on a result. Six of the eleven trials in the 2011 review were physical-performance studies, so this is the same literature examined more closely rather than a separate body of evidence that failed.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Hung SK, Perry R, Ernst E. The effectiveness and efficacy of Rhodiola rosea L.: a systematic review of randomized clinical trials. Phytomedicine 2011;18:235-244',
        identifier: '10.1016/j.phymed.2010.08.014',
        kind: 'doi',
      },
      {
        label:
          'Mao JJ et al. Rhodiola rosea versus sertraline for major depressive disorder: A randomized placebo-controlled trial. Phytomedicine 2015;22:394-399',
        identifier: '10.1016/j.phymed.2015.01.010',
        kind: 'doi',
      },
      {
        label:
          'Darbinyan V et al. Rhodiola rosea in stress induced fatigue: a double blind cross-over study of a standardized extract SHR-5. Phytomedicine 2000;7:365-371',
        identifier: '10.1016/S0944-7113(00)80055-0',
        kind: 'doi',
      },
      {
        label:
          'Ishaque S et al. Rhodiola rosea for physical and mental fatigue: a systematic review. BMC Complement Altern Med 2012;12:70',
        identifier: '10.1186/1472-6882-12-70',
        kind: 'doi',
      },
      {
        label:
          'Sanz-Barrio PM et al. Rhodiola rosea supplementation on sports performance: A systematic review of randomized controlled trials. Phytother Res 2023;37:4414-4428',
        identifier: '10.1002/ptr.7950',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 159278 — Salidroside',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/159278',
        kind: 'url',
      },
      {
        label:
          'Watson NF et al. Recommended amount of sleep for a healthy adult: a joint consensus statement of the American Academy of Sleep Medicine and Sleep Research Society. Sleep 2015;38:843-844',
        identifier: '10.5665/sleep.4716',
        kind: 'doi',
      },
      {
        label:
          'NADAC (National Average Drug Acquisition Cost) 2026 — Centers for Medicare and Medicaid Services pharmacy acquisition-cost survey',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // L-theanine — a real acute effect on attention, a regulator that rejected every health claim.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'l-theanine',
    name: 'L-theanine',
    tradeName: 'Sold as Suntheanine and as generic L-theanine',
    sponsor:
      'No single sponsor — a non-protein amino acid from Camellia sinensis, now made industrially by fermentation or enzymatic synthesis',
    targetGene: 'GRIN1',
    targetProtein:
      'Glutamate receptor family, engaged weakly. L-theanine is a glutamate analogue with low-affinity activity at ionotropic glutamate receptors and at the glutamine transporter.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for calm focus, stress and sleep. Every health claim submitted to the European Food Safety Authority under Article 13(1) was rejected.',
    patientFriendlyIndication: 'Marketed for calm alertness; no approved health claim in the EU',
    conditionContext: {
      conditionExplainer:
        'L-theanine is the amino acid that gives green tea its savoury taste and makes up roughly 1 to 2% of dry tea leaf. It is the reason tea is described as producing a different kind of alertness from coffee, and the paired caffeine-plus-theanine experiments are an attempt to test that description directly.',
      whyItMatters:
        'This is the clearest example in this file of a substance with a genuine, repeatable acute laboratory effect and no accepted health claim anywhere. Both facts are true at once, and the reason is that they answer different questions.',
      whoTakesThis:
        'Adults seeking focus without caffeine jitteriness, people with sleep-onset difficulty, and heavy users of nootropic stacks. It is also added to energy drinks specifically to soften caffeine.',
      clinicalGoals:
        'Trials have measured attention tasks, reaction time, self-rated anxiety, and the Pittsburgh Sleep Quality Index. None has measured a diagnosed disorder against an approved treatment.',
    },
    oneSentenceVerdict:
      'A tea amino acid with a reproducible acute effect on attention when paired with caffeine, a four-week trial showing better sleep-quality and verbal-fluency scores, an excellent safety record, and a European regulator that rejected every claim made for it.',
    laymanHowItWorks:
      "L-theanine looks enough like glutamate, the brain's main excitatory signal, to be carried into the brain by the same transporter. Once there it interacts weakly with glutamate receptors and shifts the balance toward inhibition, which shows up on an EEG as increased alpha-wave activity — the pattern associated with relaxed wakefulness rather than drowsiness. Paired with caffeine, the combination reliably outperforms caffeine alone on attention tasks in the laboratory.",
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 46,
    anatomicalSite: 'Central nervous system, entered via the large neutral amino acid transporter',
    substitutes: {
      summary:
        'Green tea delivers L-theanine and caffeine together in roughly the ratio the combination trials use, which is not a coincidence — the combination studies were designed to model tea. For sleep specifically the comparators with real trial evidence are sleep-restriction therapy and CBT for insomnia.',
      conventionalRx: [
        {
          name: 'Cognitive behavioural therapy for insomnia',
          class: 'Structured behavioural therapy',
          howItCompares:
            "First-line for chronic insomnia in every major guideline, with durable effects that outlast treatment. L-theanine's sleep evidence is a four-week crossover trial in 30 people using a self-report questionnaire.",
          typicalCost: '',
          prosAndCons:
            'Pros: durable, no pharmacology, guideline-recommended. Cons: requires several weeks of structured effort and access to a therapist or programme.',
        },
      ],
      naturalFoods: [
        {
          name: 'Green tea',
          activeCompound:
            'L-theanine at roughly 1 to 2% of dry leaf, alongside caffeine and catechins',
          biologicalMechanism:
            'Delivers theanine and caffeine together, which is the pairing the combination trials test. The EFSA opinion that rejected the L-theanine claims was specifically about L-theanine from Camellia sinensis, which is to say about this.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Keenan et al. measured 7.9 mg of theanine in a 200 mL cup of green tea and 24.2 mg in black tea. Hidese et al. gave 200 mg a day for four weeks.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Separate the acute and chronic questions',
          action:
            'Ask whether a theanine study measured performance in the hour after a dose, or a change after weeks of daily use. They are different literatures.',
          patientImpact:
            'The acute attention data with caffeine are the strongest evidence here. The chronic sleep and mood data come from a single small crossover trial funded by the ingredient supplier.',
          clinicalPrecaution:
            'L-theanine has an excellent safety record at the amounts studied. The risk in this category is not the compound; it is the caffeine it is usually sold alongside.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCNC(=O)CC[C@@H](C(=O)O)N',
      chemicalFormula: 'C7H14N2O3',
      molecularWeight: '174.20 g/mol (PubChem CID 439378)',
      structureSource: {
        label: 'PubChem CID 439378 — L-theanine, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/439378',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'the-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric purity check on the incoming material',
          description:
            'Confirm the material is the L-enantiomer. This is the one specification that separates the tested substance from the cheaper alternative: chemical synthesis produces a racemic DL mixture, and every trial in this dossier used L-theanine.',
          reagentsAndBuffer:
            'Chiral HPLC on a crown-ether or teicoplanin stationary phase; L- and D-theanine reference standards; optical rotation measurement',
        },
        {
          id: 'the-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Enzymatic synthesis from glutamine and ethylamine',
          description:
            'Produce L-theanine enzymatically using glutaminase acting on L-glutamine with ethylamine as the acceptor, which gives the L-enantiomer directly rather than requiring a resolution step afterwards.',
          dependsOnStepId: 'the-w1',
          reagentsAndBuffer:
            'Bacterial glutaminase, L-glutamine, ethylamine hydrochloride, phosphate buffer pH 10 to 11, 30 to 37 degrees C with pH-stat control',
        },
        {
          id: 'the-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Ion-exchange capture and crystallisation',
          description:
            'Capture the product on a cation-exchange resin, elute with ammonia, and crystallise. The critical impurities to clear are residual glutamine and glutamate, both of which are chromatographically close and neither of which is inert.',
          dependsOnStepId: 'the-w2',
          reagentsAndBuffer:
            'Strong cation-exchange resin in the hydrogen form; 2 M aqueous ammonia eluent; ethanol / water crystallisation; amino acid analysis for residual glutamine and glutamate',
        },
        {
          id: 'the-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'LAT1 transporter competition assay at the blood-brain barrier',
          description:
            'Confirm that entry into the brain compartment is via the large neutral amino acid transporter and is competitively inhibited by leucine, since that shared route predicts a meal-dependent variation in central exposure that no clinical trial has controlled for.',
          dependsOnStepId: 'the-w3',
          reagentsAndBuffer:
            'hCMEC/D3 or MDCK-LAT1 monolayer; tritiated L-theanine; excess L-leucine and BCH as competitive inhibitors; sodium-free buffer control',
        },
        {
          id: 'the-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Quantitative EEG alpha-power readout',
          description:
            'Measure occipital and parietal alpha-band power under eyes-closed rest as the pharmacodynamic marker, because this is the endpoint the acute human literature is actually built on and it is measurable rather than self-reported.',
          dependsOnStepId: 'the-w4',
          reagentsAndBuffer:
            '64-channel EEG with 8 to 13 Hz band-pass; eyes-closed and eyes-open resting blocks; caffeine and placebo comparison arms; within-subject crossover design',
        },
      ],
    },
    keyAudits: [
      {
        id: 'the-a1',
        category: 'measured',
        title: 'Theanine plus caffeine beats caffeine alone on attention',
        laymanSummary:
          'In controlled laboratory tests, the combination sharpens attention more than caffeine on its own does.',
        technicalDetails:
          'Kahathuduwa et al. measured the acute effects of theanine, caffeine and the combination on attention in a within-subject design and found the combination produced the largest improvement. A subsequent functional MRI study by the same group reported that the combination improved target-specific attention to visual stimuli by decreasing mind wandering, with the imaging showing reduced default-mode network activity during the task. Two different measurement modalities pointing the same way is the strongest evidence on this page.',
        evidenceSource:
          'Kahathuduwa CN et al. Nutr Neurosci 2017;20:369-377; Kahathuduwa CN et al. Nutr Res 2018;49:67-78',
        doi: '10.1080/1028415X.2016.1144845',
        measuredMetric: 'Acute attention task performance and task-related fMRI activation',
        auditFlag: 'verified',
      },
      {
        id: 'the-a2',
        category: 'measured',
        title: 'Four weeks improved sleep-quality and verbal-fluency scores in 30 adults',
        laymanSummary:
          'A month of daily L-theanine improved sleep questionnaire scores and two cognitive test scores in a small crossover trial.',
        technicalDetails:
          'Hidese et al. ran a randomised, placebo-controlled, crossover, double-blind trial in 30 healthy adults with no major psychiatric illness, giving 200 mg/day L-theanine or placebo for four weeks. Self-rating Depression Scale, State-Trait Anxiety Inventory-trait and Pittsburgh Sleep Quality Index scores all fell after L-theanine (P = 0.019, 0.006 and 0.013). PSQI subscale scores for sleep latency, sleep disturbance and use of sleep medication all reduced against placebo. Verbal fluency and executive function scores improved (P = 0.001 and 0.031). Two of the seven authors are employees of the company that supplied the L-theanine and placebo tablets, which the paper discloses.',
        evidenceSource: 'Hidese S et al. Nutrients 2019;11:2362',
        doi: '10.3390/nu11102362',
        measuredMetric:
          'PSQI, STAI-trait, SDS, verbal fluency and executive function over four weeks',
        auditFlag: 'caution',
      },
      {
        id: 'the-a3',
        category: 'failed',
        title: 'EFSA rejected every health claim submitted for L-theanine',
        laymanSummary:
          "Europe's food safety regulator looked at the claims for cognition, stress, sleep and menstrual discomfort and concluded that none of them was supported.",
        technicalDetails:
          'The EFSA Panel on Dietetic Products, Nutrition and Allergies assessed L-theanine from Camellia sinensis under Article 13(1) of Regulation (EC) No 1924/2006 across four claim areas: improvement of cognitive function (claim IDs 1104, 1222, 1600, 1601, 1707, 1935, 2004, 2005), alleviation of psychological stress (1598, 1601), maintenance of normal sleep (1222, 1737, 2004) and reduction of menstrual discomfort (1599). No cause and effect relationship was established for any of them. That is a regulatory judgement about whether the evidence supports a claim on a package, not a finding that the laboratory results are wrong.',
        evidenceSource: 'EFSA NDA Panel. EFSA Journal 2011;9(6):2238',
        doi: '10.2903/j.efsa.2011.2238',
        inferredClaim:
          'That an acute laboratory effect on an attention task supports a package claim about cognitive function, stress or sleep',
        auditFlag: 'verified',
      },
      {
        id: 'the-a4',
        category: 'inferred',
        title: 'The systematic review found the evidence promising and the trial base small',
        laymanSummary:
          'A 2020 review concluded L-theanine probably helps with acute stress and that the studies are too few and too small to say more.',
        technicalDetails:
          "Williams et al. reviewed the evidence for L-theanine consumption and the ability to manage stress and anxiety, and found supportive signals across acute-stress paradigms alongside considerable heterogeneity in dose, format and outcome measure, with few trials in clinically anxious populations. The review's value here is as a boundary: the case is for acute, situational stress in healthy people, not for anxiety as a diagnosis.",
        evidenceSource: 'Williams JL et al. Plant Foods Hum Nutr 2020;75:12-23',
        doi: '10.1007/s11130-019-00771-5',
        inferredClaim:
          'That an effect in acute laboratory stress paradigms extends to diagnosed anxiety disorders',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed intact from the small intestine',
        laymanDesc:
          'Unlike most compounds in this file, L-theanine is a simple amino acid and the body absorbs it readily.',
        molecularDetail:
          'L-theanine is absorbed by intestinal amino acid transporters and appears in plasma within roughly 30 minutes, peaking in the first hour or two. This is the pharmacokinetic contrast with curcumin and berberine: absorption is not the limiting problem here.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Carried into the brain on the glutamate lookalike route',
        laymanDesc:
          'Because it resembles a common amino acid, a transporter at the blood-brain barrier carries it across.',
        molecularDetail:
          'Transit is via the large neutral amino acid transporter LAT1, which theanine shares with leucine, phenylalanine and tryptophan. That sharing means central exposure is in principle competitive with dietary amino acids, a variable no clinical trial in this dossier controlled.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Weak engagement with glutamate receptors',
        laymanDesc:
          'In the brain it interacts loosely with the receptors for the main excitatory signal, nudging the balance toward calm.',
        molecularDetail:
          'L-theanine is a glutamine and glutamate structural analogue with low-affinity activity at AMPA, kainate and NMDA receptors, and it inhibits glutamine transport. The affinities are low enough that the pharmacology remains debated, and no receptor occupancy has been demonstrated in a human brain.',
        iconName: 'Network',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'EEG alpha activity rises',
        laymanDesc:
          'Brain recordings show more of the wave pattern associated with being relaxed but awake.',
        molecularDetail:
          'Increased occipital and parietal alpha-band power under resting conditions is the most consistently reproduced pharmacodynamic marker for L-theanine, and it distinguishes the effect from sedation, which shows a different signature.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'With caffeine, attention improves beyond caffeine alone',
        laymanDesc:
          'The practical result is the pairing: sharper focus with less of the edge caffeine brings on its own.',
        molecularDetail:
          'The combination outperformed caffeine alone on attention tasks, and the fMRI follow-up attributed the gain to reduced mind wandering rather than to general arousal. This is the specific, replicated, measurable claim; the broader wellness claims were the ones EFSA rejected.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Hidese 2019 (200 mg/day L-theanine, four weeks, healthy adults)',
        phase: 'Randomised, placebo-controlled, double-blind crossover',
        sampleSize: 30,
        primaryEndpoint:
          'Change in stress-related symptom scales and cognitive function over four weeks',
        endpointMet: true,
        statisticalPValue:
          'P = 0.019 SDS, P = 0.006 STAI-trait, P = 0.013 PSQI, P = 0.001 verbal fluency',
        unreportedAdverseSignals:
          'Two authors are employees of the company that supplied both the L-theanine and the placebo tablets. The trial discloses this and it does not invalidate the result, but it belongs beside it.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Kahathuduwa 2017 (acute theanine, caffeine and combination on attention)',
        phase: 'Randomised within-subject crossover',
        sampleSize: 20,
        primaryEndpoint: 'Acute performance on an attention task',
        endpointMet: true,
        statisticalPValue: 'Combination superior to caffeine alone on attention performance',
        unreportedAdverseSignals:
          'Acute single-dose design in healthy young adults. It measures a laboratory task, not a day of work or study.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'EFSA Article 13(1) assessment of L-theanine health claims',
        phase: 'Regulatory scientific opinion',
        sampleSize: 0,
        primaryEndpoint:
          'Whether a cause and effect relationship is established for cognitive function, psychological stress, normal sleep or menstrual discomfort',
        endpointMet: false,
        statisticalPValue: 'Not applicable — regulatory assessment, not a hypothesis test',
        unreportedAdverseSignals:
          'Sample size recorded as 0 because this is an evidence assessment rather than a trial. No cause and effect relationship was established for any claim.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Attention task performance improved more with theanine plus caffeine than with caffeine alone, with a supporting fMRI finding of reduced mind wandering',
        'Four weeks of 200 mg/day improved PSQI, STAI-trait, SDS, verbal fluency and executive function scores in 30 healthy adults',
        'Increased EEG alpha-band power under resting conditions, the most reproducible pharmacodynamic marker for this compound',
      ],
      unsupportedInferences: [
        'That an acute effect on a laboratory attention task supports a package claim about cognitive function, stress or sleep — EFSA assessed exactly that and rejected it',
        'That results in healthy volunteers under acute stress extend to diagnosed anxiety disorders',
        'That a supplier-funded 30-person crossover trial settles the chronic-use question',
      ],
      whatFailedInitially: [
        'Every L-theanine health claim submitted to EFSA under Article 13(1) — cognition, psychological stress, sleep and menstrual discomfort — failed to establish a cause and effect relationship',
      ],
      realWorldOutcome: [
        'The caffeine pairing is the most defensible use and is the one with two independent measurement modalities behind it',
        'The safety record is genuinely good, which is not true of most substances in this file',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, tablet or powder; also added to beverages',
      description:
        'Sold as a dietary supplement, and self-affirmed GRAS for use in beverages in the United States. Industrial material is made enzymatically or by fermentation rather than extracted from tea, so enantiomeric purity is a manufacturing specification rather than a botanical given. Every trial cited here used the L-enantiomer.',
      safetyProfile:
        'Among the best-tolerated substances in this file. Adverse events in the trials were minimal and comparable to placebo, and no serious safety signal has emerged. The practical caution is contextual: L-theanine is usually consumed alongside caffeine, and the caffeine is where the cardiovascular and sleep-disruption risk lives.',
    },
    commonQuestions: [
      {
        q: 'Does L-theanine actually do anything, or is it just tea marketing?',
        a: 'It does something measurable and specific. Paired with caffeine it outperforms caffeine alone on attention tasks, and an fMRI study located the difference in reduced mind wandering rather than in general arousal. It also reliably raises EEG alpha-band power, the pattern associated with relaxed wakefulness. What it has not done is convert those laboratory findings into an accepted health claim.',
      },
      {
        q: 'Why did EFSA reject every claim if the trials are positive?',
        a: 'Because they are answering different questions. The trials measure acute task performance and short-term questionnaire scores in small groups of healthy volunteers. A health claim on a package is a statement that a cause and effect relationship has been established between consuming the substance and a stated health benefit. EFSA assessed the submitted evidence for cognitive function, psychological stress, sleep and menstrual discomfort, and found it insufficient for all four. Neither conclusion contradicts the other.',
        auditNote:
          'This distinction — measurable laboratory effect versus substantiated health claim — is the single most transferable idea on this page.',
      },
      {
        q: 'Does it help sleep?',
        a: 'The evidence is one crossover trial in 30 healthy adults, using a self-report questionnaire, funded in part by the ingredient supplier. Pittsburgh Sleep Quality Index scores did improve, including the sleep-latency and sleep-disturbance subscales. That is a genuine result at a genuinely small scale, and it has not been independently replicated with objective sleep measurement.',
      },
      {
        q: 'Is there any safety concern?',
        a: 'Very little, which makes it unusual in this file. Adverse events across the trials were minimal and matched placebo, and it has self-affirmed GRAS status for beverage use in the United States. The realistic caution is what it is combined with: theanine is routinely sold inside caffeinated products, and the caffeine carries the risk profile.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific Opinion on the substantiation of health claims related to L-theanine from Camellia sinensis (L.) Kuntze (tea). EFSA Journal 2011;9(6):2238',
        identifier: '10.2903/j.efsa.2011.2238',
        kind: 'doi',
      },
      {
        label:
          'Hidese S et al. Effects of L-Theanine Administration on Stress-Related Symptoms and Cognitive Functions in Healthy Adults: A Randomized Controlled Trial. Nutrients 2019;11:2362',
        identifier: '10.3390/nu11102362',
        kind: 'doi',
      },
      {
        label:
          'Kahathuduwa CN et al. Acute effects of theanine, caffeine and theanine-caffeine combination on attention. Nutr Neurosci 2017;20:369-377',
        identifier: '10.1080/1028415X.2016.1144845',
        kind: 'doi',
      },
      {
        label:
          'Kahathuduwa CN et al. l-Theanine and caffeine improve target-specific attention to visual stimuli by decreasing mind wandering: a human functional magnetic resonance imaging study. Nutr Res 2018;49:67-78',
        identifier: '10.1016/j.nutres.2017.11.002',
        kind: 'doi',
      },
      {
        label:
          'Williams JL et al. The Effects of Green Tea Amino Acid L-Theanine Consumption on the Ability to Manage Stress and Anxiety Levels: a Systematic Review. Plant Foods Hum Nutr 2020;75:12-23',
        identifier: '10.1007/s11130-019-00771-5',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 439378 — L-theanine',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/439378',
        kind: 'url',
      },
      {
        label:
          'Keenan EK et al. How much theanine in a cup of tea? Effects of tea type and method of preparation. Food Chem 2011;125:588-594',
        identifier: '10.1016/j.foodchem.2010.08.071',
        kind: 'doi',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Resveratrol — two separate problems that are routinely conflated: a research-misconduct case
  // and, quite independently of it, a body of null human trials.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'resveratrol',
    name: 'Resveratrol',
    sponsor: 'No single sponsor — a stilbenoid from grape skin, Japanese knotweed and peanuts',
    targetGene: 'SIRT1',
    targetProtein:
      'NAD-dependent protein deacetylase sirtuin-1, proposed as the target in 2003 and shown in 2010 not to be directly activated by resveratrol in the absence of a fluorophore-tagged substrate',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for cardiovascular and longevity support. No approved indication anywhere, and no successful phase 3 programme in any disease.',
    patientFriendlyIndication: 'Marketed for longevity and heart health, approved for neither',
    conditionContext: {
      conditionExplainer:
        'Resveratrol became famous as the proposed explanation for the "French paradox" — the observation that French populations had lower cardiovascular mortality than their saturated fat intake predicted — and then as a calorie-restriction mimetic said to work through the sirtuin enzymes.',
      whyItMatters:
        'Two distinct things went wrong with resveratrol, and reporting almost always merges them. One was a research-misconduct case at the University of Connecticut. The other, entirely separate, was that carefully conducted independent human trials kept returning null. Merging them lets the field dismiss the null trials as fallout from the fraud, which they are not.',
      whoTakesThis:
        'Adults taking it for longevity, cardiovascular or metabolic reasons, usually on the strength of animal and cell literature rather than human trials.',
      clinicalGoals:
        'Human trials have measured insulin sensitivity by clamp, blood pressure, lipids, inflammatory markers, mitochondrial function and training response. The consistent finding across the best-controlled of them is no benefit, and in one case harm.',
    },
    oneSentenceVerdict:
      'A compound whose proposed target was shown not to be directly engaged, whose most enthusiastic laboratory produced 145 counts of data fabrication, and whose independent human trials — separately and on their own merits — repeatedly found nothing, including one that found resveratrol blunted the benefits of exercise.',
    laymanHowItWorks:
      'The original story was that resveratrol switches on an enzyme called SIRT1 that mimics the effects of eating less, and that this explains longer life in yeast, worms and mice. That story has two holes. In 2010 a pharmaceutical group showed the SIRT1 activation was an artefact of the fluorescent tag used in the assay: with a normal substrate, resveratrol does not activate the enzyme. And in humans, oral resveratrol is absorbed and then almost entirely conjugated within minutes, so the blood carries the deactivated form.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 20,
    anatomicalSite:
      'Intestinal epithelium and liver, where it is conjugated before reaching tissue',
    substitutes: {
      summary:
        'Everything resveratrol was proposed to do — improve insulin sensitivity, lower blood pressure, improve cardiovascular fitness — is done more reliably by exercise, which is also the one intervention resveratrol was shown to interfere with.',
      conventionalRx: [
        {
          name: 'High-intensity exercise training',
          class: 'Non-pharmacological',
          howItCompares:
            'Directly compared, unintentionally. In Gliemann et al., eight weeks of high-intensity training raised maximal oxygen uptake 45% more in the placebo group than in the resveratrol group, and lowered mean arterial pressure in the placebo group only.',
          typicalCost: '',
          prosAndCons:
            'Pros: the outcome resveratrol was supposed to produce, produced. Cons: requires doing it.',
        },
        {
          name: 'Statins',
          class: 'HMG-CoA reductase inhibitor',
          howItCompares:
            'The lipid endpoint resveratrol was marketed against. Statins have cardiovascular outcome trials; resveratrol was shown in Gliemann et al. to abolish exercise-induced improvements in LDL, the total-to-HDL cholesterol ratio and triglycerides.',
          typicalCost:
            'Generic. Medicaid NADAC: atorvastatin 20 mg at $0.031 a tablet, December 2025',
          prosAndCons: 'Pros: outcome evidence. Cons: muscle symptoms in a minority.',
        },
      ],
      naturalFoods: [
        {
          name: 'Red wine, grapes and peanuts',
          activeCompound: 'trans-Resveratrol at food concentration',
          biologicalMechanism:
            'The dietary source, and the origin of the whole hypothesis. Semba et al. measured 24-hour urinary resveratrol metabolites in 783 community-dwelling adults over 65 in the Chianti region and found no association with inflammation, cancer, cardiovascular disease or all-cause mortality over nine years.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Dietary intake in the InCHIANTI cohort produced a mean log total urinary metabolite concentration of 7.08 nmol/g creatinine, which was not associated with any outcome measured',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Keep the fraud and the null trials separate',
          action:
            'When reading about resveratrol, check whether a claim traces to the retracted University of Connecticut work or to an independent trial.',
          patientImpact:
            'The misconduct case explains why part of the preclinical literature is unreliable. It does not explain why Yoshino, Poulsen and Gliemann found nothing — those were independent groups running clean trials, and their results stand on their own.',
          clinicalPrecaution:
            'Resveratrol inhibits CYP3A4 and CYP2C9 and has antiplatelet activity, so interaction with anticoagulants and with drugs cleared by those enzymes is plausible.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC(=CC=C1/C=C/C2=CC(=CC(=C2)O)O)O',
      chemicalFormula: 'C14H12O3',
      molecularWeight: '228.24 g/mol (trans-resveratrol, PubChem CID 445154)',
      structureSource: {
        label: 'PubChem CID 445154 — trans-Resveratrol, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/445154',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'res-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'trans versus cis isomer verification of incoming material',
          description:
            'Confirm the material is the trans isomer and quantify cis content. The isomerisation is light-driven and fast, and the cis form has different activity, so a product that has sat in a clear bottle is not the substance the trials used.',
          reagentsAndBuffer:
            'trans- and cis-resveratrol reference standards; C18 HPLC with detection at 306 nm for trans and 285 nm for cis; amber glassware throughout; UV exposure control sample',
        },
        {
          id: 'res-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Extraction from Polygonum cuspidatum root',
          description:
            'Extract Japanese knotweed root, which is the commercial source for almost all supplement resveratrol rather than grapes. Emodin, an anthraquinone laxative present in the same root, is the impurity that has to be cleared and is not always declared.',
          dependsOnStepId: 'res-w1',
          reagentsAndBuffer:
            'Aqueous ethanol extraction under nitrogen and low light; emodin reference standard; rotary evaporation below 40 degrees C',
        },
        {
          id: 'res-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation and emodin clearance',
          description:
            'Recrystallise to greater than 98% trans-resveratrol and confirm emodin below specification, since residual emodin produces a gastrointestinal effect that is easily mistaken for a resveratrol effect.',
          dependsOnStepId: 'res-w2',
          reagentsAndBuffer:
            'Ethanol / water recrystallisation; preparative C18 HPLC; LC-MS/MS quantification of emodin down to 10 ppm',
        },
        {
          id: 'res-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Conjugation-competent hepatocyte model rather than a cell line',
          description:
            'Use primary human hepatocytes rather than a transformed line, because the central pharmacokinetic fact about resveratrol is near-complete first-pass glucuronidation and sulfation, and most immortalised lines have lost that capacity. A cell-line result at 50 micromolar free resveratrol describes a state no human plasma reaches.',
          dependsOnStepId: 'res-w3',
          reagentsAndBuffer:
            'Cryopreserved primary human hepatocytes; UGT and SULT cofactors UDPGA and PAPS; LC-MS/MS quantification of free, glucuronidated and sulfated resveratrol',
        },
        {
          id: 'res-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'SIRT1 deacetylation assay with a native, untagged substrate',
          description:
            'Run the SIRT1 activity assay against a native peptide substrate rather than a fluorophore-conjugated one. This is the specific control that overturned the original finding: Pacholec et al. showed the apparent activation depends on the covalently attached fluorophore and disappears with a native substrate.',
          dependsOnStepId: 'res-w4',
          reagentsAndBuffer:
            'Recombinant human SIRT1; native acetylated p53 peptide substrate; matched Fluor-de-Lys tagged substrate as the artefact-positive control; NAD+ cofactor; mass-spectrometric detection of deacetylated product',
        },
      ],
    },
    keyAudits: [
      {
        id: 'res-a1',
        category: 'conclusion_shift',
        title: 'The SIRT1 activation was an artefact of the assay substrate',
        laymanSummary:
          'The enzyme resveratrol was famous for switching on turned out not to be switched on by it — the effect only appeared when the test used a fluorescent tag.',
        technicalDetails:
          'Pacholec et al. tested resveratrol and the synthetic SIRT1 activators SRT1720, SRT2183 and SRT1460 against SIRT1 and found that apparent activation required a fluorophore-containing peptide substrate. With native peptide substrates the activation disappeared, and the compounds showed extensive off-target activity instead. This is a mechanistic correction rather than a misconduct finding, published by an independent pharmaceutical group, and it is the single most consequential paper in the resveratrol literature.',
        evidenceSource: 'Pacholec M et al. J Biol Chem 2010;285:8340-8351',
        doi: '10.1074/jbc.M109.088682',
        inferredClaim:
          'That resveratrol is a direct SIRT1 activator and therefore a calorie-restriction mimetic',
        auditFlag: 'contested',
      },
      {
        id: 'res-a2',
        category: 'conclusion_shift',
        title: 'A separate matter: 145 counts of data fabrication at the University of Connecticut',
        laymanSummary:
          'A leading resveratrol researcher was found to have fabricated and falsified data 145 times, and eleven journals were formally notified.',
        technicalDetails:
          'A three-year investigation by the University of Connecticut Health Center, prompted by an anonymous allegation in 2008 and covering more than seven years of laboratory activity, concluded that Dipak K. Das, professor of surgery and director of the Cardiovascular Research Center, was guilty of 145 counts of fabrication and falsification of data. The report ran to approximately 60,000 pages. Letters of notification were sent to 11 scientific journals; the Health Center froze externally funded research in the laboratory and declined US$890,000 in federal grants. Retraction notices followed, including in the Journal of Cellular and Molecular Medicine. This affected a specific body of cardioprotection work and did not produce the SIRT1 correction, which was independent, nor the null clinical trials, which were run by other groups.',
        evidenceSource:
          'University of Connecticut Health Center statement, 11 January 2012; retraction notice, J Cell Mol Med 2012;16:2548',
        doi: '10.1111/j.1582-4934.2012.01620.x',
        auditFlag: 'retracted',
      },
      {
        id: 'res-a3',
        category: 'failed',
        title: 'Poulsen 2013: high-dose resveratrol did nothing in obese men',
        laymanSummary:
          'Four weeks of high-dose resveratrol in obese men changed nothing measurable, including the primary endpoint.',
        technicalDetails:
          'Randomised, placebo-controlled, double-blinded, parallel-group trial in 24 obese but otherwise healthy men, with insulin sensitivity by hyperinsulinaemic euglycaemic clamp as the primary outcome. Insulin sensitivity deteriorated insignificantly in both groups. Endogenous glucose production and glucose turnover and oxidation rates were unchanged. There was no effect on blood pressure, resting energy expenditure, lipid oxidation, ectopic or visceral fat content, or inflammatory and metabolic biomarkers. The authors wrote that the lack of effect disagrees with persuasive rodent data and raises doubt about the justification of resveratrol as a human nutritional supplement in metabolic disorders.',
        evidenceSource: 'Poulsen MM et al. Diabetes 2013;62:1186-1195',
        doi: '10.2337/db12-0975',
        measuredMetric:
          'Insulin sensitivity by hyperinsulinaemic euglycaemic clamp over four weeks',
        auditFlag: 'verified',
      },
      {
        id: 'res-a4',
        category: 'failed',
        title: 'Yoshino 2012: no metabolic improvement in nonobese women either',
        laymanSummary:
          'A carefully controlled trial in healthy-weight postmenopausal women found no metabolic benefit, and measured the supposed molecular targets directly to show they had not moved either.',
        technicalDetails:
          'Forty-five lean and overweight postmenopausal women were randomised to placebo, resveratrol 75 mg/day, or calorie restriction for 12 weeks. Plasma resveratrol rose, and nothing else did: no change in body composition, resting metabolic rate, plasma lipids or inflammatory markers, and no increase in liver, skeletal muscle or adipose tissue insulin sensitivity on a two-stage hyperinsulinaemic euglycaemic clamp with labelled tracers. The paper also measured the putative molecular targets directly — AMPK, SIRT1, NAMPT and PPARGC1A — in muscle and adipose tissue, and none was affected. Together with Poulsen 2013 this closes both ends of the metabolic hypothesis.',
        evidenceSource: 'Yoshino J et al. Cell Metab 2012;16:658-664',
        doi: '10.1016/j.cmet.2012.09.015',
        measuredMetric:
          'Tissue-specific insulin sensitivity by clamp, and muscle and adipose expression of AMPK, SIRT1, NAMPT and PPARGC1A',
        auditFlag: 'verified',
      },
      {
        id: 'res-a5',
        category: 'failed',
        title: 'Gliemann 2013: resveratrol blunted the benefits of exercise training',
        laymanSummary:
          'Older men who took resveratrol while training got less out of the training than men who took placebo.',
        technicalDetails:
          'Twenty-seven healthy physically inactive men aged around 65 were randomised to 250 mg trans-resveratrol daily or placebo alongside eight weeks of high-intensity exercise training. Training raised maximal oxygen uptake 45% more in the placebo group than in the resveratrol group (P < 0.05), and mean arterial pressure fell in the placebo group only (-4.8 +/- 1.7 mmHg, P < 0.05). Resveratrol also abolished the exercise-induced improvements in LDL, the total-to-HDL cholesterol ratio and triglycerides (P < 0.05). Interstitial prostacyclin was lower and muscle thromboxane synthase higher in the resveratrol group. SIRT1 protein levels were unaffected. A supplement that reverses an established benefit is a stronger finding than one that produces none.',
        evidenceSource: 'Gliemann L et al. J Physiol 2013;591:5047-5059',
        doi: '10.1113/jphysiol.2013.258061',
        measuredMetric:
          'Training-induced change in maximal oxygen uptake, mean arterial pressure and blood lipids over eight weeks',
        auditFlag: 'caution',
      },
      {
        id: 'res-a6',
        category: 'inferred',
        title: 'Dietary resveratrol exposure predicted nothing over nine years',
        laymanSummary:
          'Measuring how much resveratrol 783 older Italians were actually getting from their diet showed no link to inflammation, disease or death.',
        technicalDetails:
          'The InCHIANTI prospective cohort followed 783 community-dwelling men and women aged 65 or older in two Chianti villages from 1998 to 2009, using 24-hour urinary resveratrol metabolites as the exposure. Over nine years 268 participants, 34.3%, died. Mortality across quartiles of urinary resveratrol was 34.4%, 31.6%, 33.5% and 37.4% (P = 0.67), with a hazard ratio of 0.80 (95% CI 0.54 to 1.17) for the lowest against the highest quartile. Resveratrol levels were not associated with CRP, IL-6, IL-1 beta, TNF, or prevalent or incident cardiovascular disease or cancer. This is the French-paradox hypothesis tested where it was born, with a direct biochemical exposure measure rather than a food questionnaire.',
        evidenceSource: 'Semba RD et al. JAMA Intern Med 2014;174:1077-1084',
        doi: '10.1001/jamainternmed.2014.1582',
        inferredClaim:
          'That dietary resveratrol exposure explains the cardiovascular mortality pattern the French paradox described',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed well, and then almost entirely deactivated',
        laymanDesc:
          'Resveratrol crosses the gut wall easily and is then tagged for disposal within minutes, so very little free compound reaches the bloodstream.',
        molecularDetail:
          'Oral absorption is roughly 70%, but first-pass glucuronidation and sulfation in enterocytes and hepatocytes are so extensive that free trans-resveratrol in plasma is typically in the low nanomolar range while conjugates are in the micromolar range. Almost every cell experiment uses free resveratrol at 10 to 100 micromolar.',
        iconName: 'Filter',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The conjugates circulate; whether they are active is unresolved',
        laymanDesc:
          'What actually travels around the body is the tagged version, and nobody has established that it does anything.',
        molecularDetail:
          'Resveratrol-3-O-glucuronide and resveratrol-3-O-sulfate are the dominant circulating species. A partial deconjugation hypothesis at target tissue exists and has not been demonstrated at the concentrations an oral dose produces.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The proposed target is not directly engaged',
        laymanDesc:
          'The enzyme the whole story was built on is not activated by resveratrol when the test is run properly.',
        molecularDetail:
          'Pacholec et al. showed the apparent SIRT1 activation required a fluorophore-conjugated peptide substrate and vanished with native substrates. Gliemann et al. separately measured SIRT1 protein in trained older men and found it unaffected by resveratrol supplementation.',
        iconName: 'Network',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Indirect routes remain plausible and unproven in humans',
        laymanDesc:
          'Other explanations exist — mild mitochondrial stress, effects on an energy-sensing enzyme — but none has been shown to happen in a person.',
        molecularDetail:
          'Proposed indirect mechanisms include AMPK activation downstream of phosphodiesterase inhibition and mild mitochondrial complex I inhibition. Each is reported at concentrations well above measured human free plasma levels.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And in the best human trials, nothing happens — or worse',
        laymanDesc:
          'The trials that controlled everything properly found no benefit, and one found resveratrol cancelled out the benefits of exercise.',
        molecularDetail:
          'Poulsen 2013 and Yoshino 2012 found no metabolic effect in obese men and in nonobese women respectively. Gliemann 2013 found a 45% smaller training-induced rise in maximal oxygen uptake in the resveratrol arm, and abolition of the exercise-induced lipid improvements.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Poulsen 2013 (high-dose resveratrol in obese men)',
        phase: 'Randomised, double-blind, placebo-controlled, parallel group',
        sampleSize: 24,
        primaryEndpoint:
          'Insulin sensitivity by hyperinsulinaemic euglycaemic clamp after four weeks',
        endpointMet: false,
        statisticalPValue:
          'No significant difference; insulin sensitivity deteriorated insignificantly in both arms',
        unreportedAdverseSignals:
          'No effect on any secondary endpoint either: blood pressure, resting energy expenditure, lipid oxidation, ectopic or visceral fat, inflammatory or metabolic biomarkers.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Yoshino 2012 (75 mg/day for 12 weeks, nonobese postmenopausal women)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 45,
        primaryEndpoint:
          'Insulin sensitivity by two-stage hyperinsulinaemic euglycaemic clamp with labelled tracer infusion, after 12 weeks',
        endpointMet: false,
        statisticalPValue: 'No significant improvement in any measure of metabolic function',
        unreportedAdverseSignals:
          'Forty-five women randomised across three arms of 15 — placebo, resveratrol 75 mg/day, and calorie restriction — so the resveratrol comparison itself rests on 15 against 14 completers. Resveratrol did not affect AMPK, SIRT1, NAMPT or PPARGC1A in muscle or adipose tissue.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Gliemann 2013 (resveratrol with high-intensity training in aged men)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 27,
        primaryEndpoint:
          'Training-induced change in cardiovascular health parameters over eight weeks',
        endpointMet: false,
        statisticalPValue:
          'P < 0.05 in favour of placebo for maximal oxygen uptake, mean arterial pressure and blood lipids',
        unreportedAdverseSignals:
          'This trial did not merely fail to show benefit — the resveratrol arm did worse than placebo on the training response, which is a harm signal in a healthy population.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Semba 2014 (InCHIANTI prospective cohort, urinary resveratrol metabolites)',
        phase: 'Prospective observational cohort, nine years',
        sampleSize: 783,
        primaryEndpoint:
          'All-cause mortality by quartile of 24-hour urinary resveratrol metabolites',
        endpointMet: false,
        statisticalPValue:
          'P = 0.67 across quartiles; HR 0.80 (95% CI 0.54 to 1.17) lowest versus highest',
        unreportedAdverseSignals:
          'Observational, so confounding cannot be excluded — but the exposure measure is biochemical rather than a dietary questionnaire, which is stronger than most nutritional epidemiology.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'SIRT1 activation by resveratrol requires a fluorophore-conjugated substrate and disappears with native peptide substrates',
        'No effect on clamp-measured insulin sensitivity or any secondary metabolic endpoint in 24 obese men over four weeks, and none in 45 postmenopausal women over 12 weeks',
        'A 45% smaller training-induced rise in maximal oxygen uptake in the resveratrol arm than in placebo, in 27 aged men',
        'No association between 24-hour urinary resveratrol metabolites and inflammation, cancer, cardiovascular disease or nine-year mortality in 783 older adults',
        '145 counts of fabrication and falsification of data adjudicated by the University of Connecticut Health Center, with 11 journals notified',
      ],
      unsupportedInferences: [
        'That resveratrol is a direct SIRT1 activator or a calorie-restriction mimetic in humans',
        'That lifespan extension in yeast, worms and mice predicts anything about human healthspan',
        'That the French paradox is explained by dietary resveratrol — tested directly in Chianti and not supported',
        'That the null human trials are collateral damage from the misconduct case; they were run by independent groups and stand on their own',
      ],
      whatFailedInitially: [
        'The metabolic hypothesis failed in both directions: no effect in obese insulin-resistant men, no effect in lean metabolically healthy women',
        'The exercise-adjunct hypothesis failed in the opposite direction from expected, with resveratrol blunting training benefits',
        'The mechanistic foundation failed when the assay artefact was identified in 2010',
      ],
      realWorldOutcome: [
        'Resveratrol remains one of the best-selling longevity supplements despite having no positive independent human efficacy trial of consequence',
        'The pharmacokinetic problem is unresolved: what circulates after an oral dose is almost entirely the conjugated form',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule of trans-resveratrol, usually extracted from Polygonum cuspidatum',
      description:
        'Sold as a dietary supplement with no premarket efficacy review. Almost all commercial resveratrol comes from Japanese knotweed root rather than grapes; emodin, a laxative anthraquinone from the same root, is the impurity to watch and is not always specified. trans-Resveratrol isomerises to the cis form on light exposure.',
      safetyProfile:
        'High doses produce gastrointestinal effects including nausea and diarrhoea, some of which may be residual emodin rather than resveratrol. Resveratrol inhibits CYP3A4 and CYP2C9 and has antiplatelet activity, giving a plausible interaction with anticoagulants. The one signal from a controlled trial is the blunting of exercise training adaptations in older men.',
    },
    commonQuestions: [
      {
        q: 'Was the resveratrol research all fraudulent?',
        a: 'No, and this is the distinction that matters most on this page. One laboratory — Dipak Das at the University of Connecticut — was found to have committed 145 counts of data fabrication and falsification, affecting a specific body of cardioprotection work, with 11 journals notified. That is real and serious. It is also separate from the two other things that went wrong: the 2010 finding that the SIRT1 activation was an assay artefact, published by an independent pharmaceutical group, and the string of null human trials run by independent academic groups in Denmark, the United States and elsewhere. If the fraud had never happened, the null trials would still be null.',
        auditNote:
          'Conflating the misconduct with the null results lets both sides misread the field. This page keeps them apart deliberately.',
      },
      {
        q: 'Does resveratrol extend lifespan?',
        a: 'It has extended lifespan in yeast, nematodes and some mouse studies. In humans there is no lifespan evidence of any kind, and the nearest available test — a nine-year prospective cohort in the Chianti region using urinary resveratrol metabolites as the exposure measure — found no association with mortality, inflammation, cancer or cardiovascular disease across 783 older adults.',
      },
      {
        q: 'Why do cell studies show so much when human trials show nothing?',
        a: 'Because the concentrations are not comparable. Cell experiments typically use free trans-resveratrol at 10 to 100 micromolar. In a person, oral resveratrol is absorbed well and then almost completely glucuronidated and sulfated on first pass, leaving free resveratrol in plasma at low nanomolar concentrations — roughly a thousand-fold lower. A result at a concentration nothing in the body reaches is a chemistry result, not a pharmacology one.',
      },
      {
        q: 'Is there a reason not to take it?',
        a: 'One controlled trial found active harm rather than absence of benefit. In 27 physically inactive men around 65 undergoing eight weeks of high-intensity training, the resveratrol arm gained 45% less maximal oxygen uptake than placebo, showed no fall in mean arterial pressure, and lost the exercise-induced improvements in LDL, the cholesterol ratio and triglycerides. A plausible reading is that the antioxidant activity interferes with the oxidative signalling exercise uses to drive adaptation. It is one trial in 27 people, and it points the wrong way.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Pacholec M et al. SRT1720, SRT2183, SRT1460, and resveratrol are not direct activators of SIRT1. J Biol Chem 2010;285:8340-8351',
        identifier: '10.1074/jbc.M109.088682',
        kind: 'doi',
      },
      {
        label:
          'University of Connecticut Health Center. Scientific Journals Notified Following Research Misconduct Investigation, 11 January 2012',
        identifier:
          'https://today.uconn.edu/2012/01/scientific-journals-notified-following-research-misconduct-investigation/',
        kind: 'url',
      },
      {
        label:
          'Retracted: Differential proteomic profiling to study the mechanism of cardiac pharmacological preconditioning by resveratrol. J Cell Mol Med 2012;16:2548',
        identifier: '10.1111/j.1582-4934.2012.01620.x',
        kind: 'doi',
      },
      {
        label:
          'Poulsen MM et al. High-dose resveratrol supplementation in obese men: an investigator-initiated, randomized, placebo-controlled clinical trial. Diabetes 2013;62:1186-1195',
        identifier: '10.2337/db12-0975',
        kind: 'doi',
      },
      {
        label:
          'Yoshino J et al. Resveratrol supplementation does not improve metabolic function in nonobese women with normal glucose tolerance. Cell Metab 2012;16:658-664',
        identifier: '10.1016/j.cmet.2012.09.015',
        kind: 'doi',
      },
      {
        label:
          'Gliemann L et al. Resveratrol blunts the positive effects of exercise training on cardiovascular health in aged men. J Physiol 2013;591:5047-5059',
        identifier: '10.1113/jphysiol.2013.258061',
        kind: 'doi',
      },
      {
        label:
          'Semba RD et al. Resveratrol levels and all-cause mortality in older community-dwelling adults. JAMA Intern Med 2014;174:1077-1084',
        identifier: '10.1001/jamainternmed.2014.1582',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 445154 — trans-Resveratrol',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/445154',
        kind: 'url',
      },
      {
        label:
          'NADAC (National Average Drug Acquisition Cost) 2026 — Centers for Medicare and Medicaid Services pharmacy acquisition-cost survey',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Quercetin — a small blood pressure effect, and a senolytic story that has now had its first
  // properly randomised test.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'quercetin',
    name: 'Quercetin',
    sponsor: 'No single sponsor — a flavonol from onions, capers, apples and tea',
    targetGene: 'BCL2L1',
    targetProtein:
      'BCL-xL and related anti-apoptotic proteins, in the senolytic context. Quercetin is also a broad, weak inhibitor of many kinases and a documented pan-assay interference compound.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for allergy, immunity, blood pressure and, increasingly, as a senolytic. It is also the quercetin half of the dasatinib-plus-quercetin combination under investigation in clinical trials, which is a prescription oncology drug plus a supplement.',
    patientFriendlyIndication:
      'Marketed for allergy and immunity; investigated as a senescent-cell killer',
    conditionContext: {
      conditionExplainer:
        'Quercetin is the most abundant flavonol in the ordinary diet. Two very different claims attach to it. The consumer claim is about allergy, immunity and blood pressure. The research claim is that in combination with the leukaemia drug dasatinib it selectively kills senescent cells — worn-out cells that accumulate with age and secrete inflammatory signals.',
      whyItMatters:
        'The senolytic story is one of the most closely watched ideas in ageing biology, and quercetin is inside it. Following what that research has and has not shown is a good test of whether a supplement page can report a live scientific programme honestly.',
      whoTakesThis:
        'Adults taking it for seasonal allergy or immune support, and separately a small number of trial participants receiving it alongside dasatinib under supervision.',
      clinicalGoals:
        'Trials have measured blood pressure, endurance capacity, senescent cell burden in fat and skin biopsies, and — in the first randomised senolytic trial — bone turnover markers.',
    },
    oneSentenceVerdict:
      'A dietary flavonol with a small measured blood pressure reduction, a trivial-to-small effect on endurance, real evidence that it clears senescent cells from human fat tissue when combined with a prescription leukaemia drug, and a first randomised senolytic trial whose primary endpoint it missed.',
    laymanHowItWorks:
      'Two stories. As a supplement, quercetin is a broad weak inhibitor of a great many enzymes and a stabiliser of the cells that release histamine, which is where the allergy claim comes from. As a senolytic, it is used with dasatinib to disable the survival proteins that keep senescent cells alive when they should have died, so that those cells self-destruct. The senolytic use is a combination with a prescription drug, in supervised trials, and is not what is in a bottle on a shelf.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 34,
    anatomicalSite:
      'Adipose tissue and vascular endothelium, in the trials that measured tissue directly',
    substitutes: {
      summary:
        'For blood pressure, every approved antihypertensive class produces several times the 3 mmHg systolic reduction quercetin achieved, with outcome trials behind it. For allergy, second-generation antihistamines have regulatory approval and quercetin does not.',
      conventionalRx: [
        {
          name: 'Any first-line antihypertensive (ACE inhibitor, ARB, thiazide, calcium channel blocker)',
          class: 'Antihypertensive',
          howItCompares:
            'Produces roughly 8 to 10 mmHg systolic reduction at standard dose, against the 3.04 mmHg pooled estimate for quercetin, and has cardiovascular outcome trials that quercetin has never attempted.',
          typicalCost:
            'Generic. Medicaid NADAC: lisinopril 10 mg $0.019, amlodipine 5 mg $0.011 a tablet',
          prosAndCons:
            'Pros: larger effect, outcome data, regulatory review. Cons: class-specific side effects.',
        },
        {
          name: 'Cetirizine or loratadine',
          class: 'Second-generation H1 antihistamine',
          howItCompares:
            'Blocks the histamine receptor directly rather than attempting to stabilise the mast cell that releases it, and is approved for allergic rhinitis on randomised evidence. No trial has compared quercetin with an antihistamine.',
          typicalCost:
            'Generic. Medicaid NADAC: cetirizine 10 mg $0.061, loratadine 10 mg $0.053 a tablet',
          prosAndCons: 'Pros: approved, predictable, cheap. Cons: mild sedation in some people.',
        },
      ],
      naturalFoods: [
        {
          name: 'Onions, capers, apples and tea',
          activeCompound: 'Quercetin glycosides, principally quercetin-4-glucoside and rutin',
          biologicalMechanism:
            'The dietary form is glycosylated and is deglycosylated before absorption, giving a different pharmacokinetic profile from the aglycone in supplements. Ordinary dietary intake is roughly one to two orders of magnitude below the amounts used in the blood pressure trials.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'The blood pressure meta-analysis found the effect was possibly limited to, or greater at, doses above 500 mg/day, which is far above ordinary dietary intake',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Do not read the senolytic trials as supplement evidence',
          action:
            'Check whether a senolytic result used quercetin alone or dasatinib plus quercetin. Every published human senolytic study used the combination.',
          patientImpact:
            'Dasatinib is a prescription tyrosine kinase inhibitor with serious toxicities including pleural effusion and myelosuppression. The senescent-cell clearance measured in these studies is attributed to the combination, and quercetin alone has not been shown to do it in humans.',
          clinicalPrecaution:
            'Quercetin inhibits CYP3A4 and P-glycoprotein and can raise the blood level of co-administered drugs, which is one reason the combination is given under supervision.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC(=C(C=C1C2=C(C(=O)C3=C(C=C(C=C3O2)O)O)O)O)O',
      chemicalFormula: 'C15H10O7',
      molecularWeight: '302.23 g/mol (PubChem CID 5280343)',
      structureSource: {
        label: 'PubChem CID 5280343 — Quercetin, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5280343',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'que-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Aglycone versus glycoside specification of incoming material',
          description:
            'Establish whether the material is quercetin aglycone, rutin, isoquercitrin or a phytosome complex. These are absorbed differently and are not interchangeable, and the senolytic trials used a defined phytosome preparation rather than plain aglycone.',
          reagentsAndBuffer:
            'Quercetin dihydrate, rutin and isoquercitrin reference standards; C18 HPLC with 0.1% formic acid and acetonitrile; detection at 370 nm; Karl Fischer for hydrate water content',
        },
        {
          id: 'que-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Extraction from Sophora japonica bud and enzymatic deglycosylation',
          description:
            'Extract rutin from Japanese pagoda tree bud, the commercial source, then hydrolyse enzymatically to the aglycone. Acid hydrolysis is cheaper and degrades the B-ring catechol, so the route is a specification rather than a detail.',
          dependsOnStepId: 'que-w1',
          reagentsAndBuffer:
            'Aqueous ethanol extraction; naringinase or rhamnosidase for enzymatic hydrolysis at pH 4.5 and 50 degrees C; nitrogen sparging to protect the catechol from oxidation',
        },
        {
          id: 'que-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation and oxidation-product clearance',
          description:
            'Recrystallise and quantify quinone oxidation products, since the same catechol that gives quercetin its antioxidant chemistry makes it oxidise in air and in aqueous buffer, generating reactive species that produce false positives downstream.',
          dependsOnStepId: 'que-w2',
          reagentsAndBuffer:
            'Ethanol / water recrystallisation under nitrogen; LC-MS for quercetin quinone and dimer products; ascorbate as a stabiliser control',
        },
        {
          id: 'que-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Senescent versus proliferating primary cell exposure',
          description:
            'Expose matched senescent and proliferating human preadipocytes to the compound alone and to the dasatinib combination, so that selectivity for the senescent state is measured rather than assumed. General cytotoxicity is not senolysis.',
          dependsOnStepId: 'que-w3',
          reagentsAndBuffer:
            'Primary human preadipocytes with irradiation-induced senescence; matched proliferating controls; dasatinib as combination partner; detergent counter-screen for colloidal aggregation',
        },
        {
          id: 'que-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'p16INK4A, p21CIP1 and SA-beta-galactosidase quantification',
          description:
            'Quantify the senescence markers the human trials used, so that an in vitro result is expressed in the same units as the clinical biopsy data rather than in a proprietary viability index.',
          dependsOnStepId: 'que-w4',
          reagentsAndBuffer:
            'p16INK4A and p21CIP1 RT-qPCR and immunostaining; senescence-associated beta-galactosidase histochemistry at pH 6.0; multiplex immunoassay for SASP factors including IL-6 and MMP-9',
        },
      ],
    },
    keyAudits: [
      {
        id: 'que-a1',
        category: 'measured',
        title: 'Pooled blood pressure reduction of 3.04 mmHg systolic across seven trials',
        laymanSummary:
          'Adding up the randomised trials, quercetin lowered blood pressure by about 3 points systolic and 2.6 diastolic.',
        technicalDetails:
          'Serban et al. pooled seven placebo-controlled randomised trials comprising nine treatment arms and 587 patients. Systolic BP fell by a weighted mean difference of -3.04 mmHg (95% CI -5.75 to -0.33, P = 0.028) and diastolic by -2.63 mmHg (95% CI -3.26 to -2.01, P < 0.001). Subgroup analysis suggested the effect was limited to, or greater at, doses above 500 mg/day. The authors themselves called for further work on whether the effect is clinically relevant.',
        evidenceSource: 'Serban MC et al. J Am Heart Assoc 2016;5:e002713',
        doi: '10.1161/JAHA.115.002713',
        measuredMetric:
          'Weighted mean difference in systolic and diastolic blood pressure versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'que-a2',
        category: 'measured',
        title: 'Dasatinib plus quercetin measurably cleared senescent cells from human fat',
        laymanSummary:
          'Nine patients with diabetic kidney disease took the combination for three days, and biopsies eleven days later showed fewer worn-out cells in their fat tissue.',
        technicalDetails:
          'Hickson et al. ran an open-label phase 1 pilot in nine subjects with diabetic kidney disease, mean age 68.7, giving three days of oral dasatinib 100 mg plus quercetin 1000 mg. Adipose tissue, skin biopsies and blood were collected before and 11 days after. Adipose senescent cell burden fell, with decreases in p16INK4A- and p21CIP1-expressing cells, cells with senescence-associated beta-galactosidase activity, and adipocyte progenitors with limited replicative potential. This was the first peer-reviewed demonstration that senolytics reduce senescent cells in humans. It is nine people, open-label, with no control group, and it is the combination rather than quercetin alone.',
        evidenceSource: 'Hickson LJ et al. EBioMedicine 2019;47:446-456',
        doi: '10.1016/j.ebiom.2019.08.069',
        measuredMetric:
          'p16INK4A, p21CIP1 and SA-beta-galactosidase positive cell counts in adipose biopsy',
        auditFlag: 'caution',
      },
      {
        id: 'que-a3',
        category: 'failed',
        title: 'The first randomised senolytic trial missed its primary endpoint',
        laymanSummary:
          'When the combination was finally tested properly against a control in 60 postmenopausal women, the main bone measurement did not move.',
        technicalDetails:
          'Khosla and colleagues ran a phase 2 randomised controlled trial of intermittent dasatinib plus quercetin in 60 postmenopausal women. The primary endpoint, percentage change at 20 weeks in the bone resorption marker CTx, did not differ between groups: median -4.1% (IQR -13.2 to 2.6) on D+Q against -7.7% (IQR -20.1 to 14.3) on control, P = 0.611. The bone formation marker P1NP rose significantly against control at 2 weeks (+16%, P = 0.020) and 4 weeks (+16%, P = 0.024) but not at 20 weeks. No serious adverse events occurred. In exploratory analysis restricted to women in the highest tertile of T cell p16 mRNA, D+Q increased P1NP by 34% and reduced CTx by 11% at two weeks and raised radius bone mineral density by 2.7% at 20 weeks. The authors were explicit that the overall group showed no reduction in bone resorption and that the senescent-cell-burden hypothesis needs its own test.',
        evidenceSource: 'Khosla S et al. Nat Med 2024;30:2605-2612',
        doi: '10.1038/s41591-024-03096-2',
        measuredMetric: 'Percentage change in serum CTx at 20 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'que-a4',
        category: 'inferred',
        title: 'The endurance-performance claim is a 2% improvement, called trivial to small',
        laymanSummary:
          'Pooling eleven trials, quercetin improved endurance by about 2%, which the authors themselves described as between trivial and small.',
        technicalDetails:
          'Kressler et al. pooled eleven studies with data on 254 human subjects, median treatment duration 11 days at a median 1,000 mg/day. The combined effect size for VO2max and endurance performance favoured quercetin (ES = 0.15, P = 0.021, 95% CI 0.02 to 0.27) but the magnitude was described as between trivial and small, equating to approximately a 2% improvement over placebo. Meta-regression against fitness level and against achieved plasma quercetin concentration was not significant, meaning the effect does not scale with exposure — which is what a real pharmacological effect usually does.',
        evidenceSource:
          'Kressler J, Millard-Stafford M, Warren GL. Med Sci Sports Exerc 2011;43:2396-2404',
        doi: '10.1249/MSS.0b013e31822495a7',
        inferredClaim:
          'That quercetin is an ergogenic aid of practical significance for endurance athletes',
        auditFlag: 'caution',
      },
      {
        id: 'que-a5',
        category: 'inferred',
        title: 'The senolytic evidence is for a combination containing a prescription cancer drug',
        laymanSummary:
          'Every human senolytic study used quercetin together with dasatinib, a leukaemia drug. None tested quercetin on its own.',
        technicalDetails:
          'The first-in-human senolytic study, an open-label two-centre trial in 14 patients with idiopathic pulmonary fibrosis, gave dasatinib 100 mg/day plus quercetin 1250 mg/day for three days a week over three weeks, with retention and completion as its primary endpoints. The diabetic kidney disease pilot and the randomised bone trial both used the same combination. Dasatinib is a BCR-ABL tyrosine kinase inhibitor with recognised toxicities. Reading these results as evidence for the supplement on a shelf attributes the effect of a two-drug combination to one of its components, and to the one whose contribution has never been isolated.',
        evidenceSource: 'Justice JN et al. EBioMedicine 2019;40:554-563',
        doi: '10.1016/j.ebiom.2018.12.052',
        inferredClaim:
          'That quercetin taken alone as a supplement clears senescent cells in humans',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed as an aglycone after the sugar is removed',
        laymanDesc:
          'Dietary quercetin arrives with a sugar attached, which has to come off before the body can absorb it.',
        molecularDetail:
          'Quercetin glycosides are hydrolysed by lactase phlorizin hydrolase at the brush border or by cytosolic beta-glucosidase after transport. Supplement aglycone bypasses this and is absorbed less efficiently in water, which is why phytosome and phospholipid complexes are used in the trials.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Conjugated on first pass, like most flavonoids',
        laymanDesc:
          'The liver tags most of it immediately, so what circulates is largely the modified form.',
        molecularDetail:
          'Extensive glucuronidation, sulfation and methylation give quercetin-3-glucuronide and isorhamnetin conjugates as the dominant plasma species. Whether these are active, or are deconjugated at inflamed tissue, remains unresolved.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds many proteins weakly, which is both the mechanism and the problem',
        laymanDesc:
          'Quercetin touches a great many enzymes loosely rather than one strongly, and some of those interactions are artefacts of how the tests are run.',
        molecularDetail:
          'Reported activities include PI3K, Src-family and other kinase inhibition, mast cell stabilisation, and inhibition of anti-apoptotic BCL-2 family proteins including BCL-xL, which is the senolytic-relevant one. Quercetin is also a documented pan-assay interference compound: it is redox-active, aggregates and quenches fluorescence.',
        iconName: 'Network',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'In the senolytic combination, worn-out cells lose their survival signal',
        laymanDesc:
          'Together with dasatinib, quercetin disables the proteins that keep senescent cells from dying, so they self-destruct.',
        molecularDetail:
          'The senescent cell anti-apoptotic pathway network keeps senescent cells alive despite pro-apoptotic signalling. Dasatinib targets ephrin-dependent survival in one senescent cell type and quercetin targets BCL-xL and PI3K-dependent survival in another, which is the stated rationale for pairing them rather than using either alone.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Senescent cells fall in biopsy; the clinical endpoint has not followed',
        laymanDesc:
          'Fat biopsies show fewer worn-out cells. The first properly controlled trial of what that does to bone found nothing on its main measure.',
        molecularDetail:
          'Hickson et al. measured the biological effect directly in nine patients. Khosla et al. then tested whether it produces a clinical effect: CTx at 20 weeks did not differ between arms (P = 0.611). The mechanism is real and its clinical consequence is unproven, which is precisely the boundary this page exists to mark.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Khosla 2024 (intermittent dasatinib plus quercetin, postmenopausal women)',
        phase: 'Phase 2 randomised controlled trial',
        sampleSize: 60,
        primaryEndpoint: 'Percentage change in the bone resorption marker CTx at 20 weeks',
        endpointMet: false,
        statisticalPValue: 'P = 0.611',
        unreportedAdverseSignals:
          'No serious adverse events. The positive findings were exploratory and restricted to the highest tertile of T cell p16 mRNA, which is a subgroup analysis and is presented as hypothesis-generating by the authors.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Hickson 2019 (dasatinib plus quercetin, diabetic kidney disease)',
        phase: 'Open-label phase 1 pilot',
        sampleSize: 9,
        primaryEndpoint: 'Change in adipose tissue senescent cell burden 11 days after treatment',
        endpointMet: true,
        statisticalPValue:
          'Significant reductions in p16INK4A, p21CIP1 and SA-beta-gal positive cells',
        unreportedAdverseSignals:
          'Nine participants, open-label, no control group, three days of treatment. This is a mechanism demonstration and was designed as one.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Justice 2019 (dasatinib plus quercetin, idiopathic pulmonary fibrosis)',
        phase: 'Two-centre open-label first-in-human',
        sampleSize: 14,
        primaryEndpoint: 'Retention rate and completion rate for planned clinical assessments',
        endpointMet: true,
        statisticalPValue:
          'Not applicable — the primary endpoints were feasibility measures, not efficacy',
        unreportedAdverseSignals:
          'One serious adverse event was reported. Non-serious events were primarily mild to moderate and predominantly respiratory. Retention was 100%.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Serban 2016 pooled analysis (seven placebo-controlled trials, nine arms)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 587,
        primaryEndpoint: 'Weighted mean difference in systolic and diastolic blood pressure',
        endpointMet: true,
        statisticalPValue: 'P = 0.028 systolic, P < 0.001 diastolic',
        unreportedAdverseSignals:
          'The authors flagged that clinical relevance of a 3 mmHg systolic reduction remains to be established, and that the effect appeared confined to doses above 500 mg/day.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Systolic blood pressure -3.04 mmHg and diastolic -2.63 mmHg against placebo across 587 patients in seven trials',
        'Reduced p16INK4A, p21CIP1 and SA-beta-galactosidase positive cells in human adipose tissue 11 days after three days of dasatinib plus quercetin',
        'Endurance and VO2max effect size 0.15, approximately 2%, across 254 subjects — described by the authors as between trivial and small',
      ],
      unsupportedInferences: [
        'That quercetin taken alone clears senescent cells in humans — every human study used the dasatinib combination',
        'That a 3 mmHg systolic reduction is clinically meaningful; the meta-analysis authors asked for that question to be tested and it has not been',
        'That reduced senescent cell burden in a biopsy translates into a clinical benefit; the first randomised test of that missed its primary endpoint',
      ],
      whatFailedInitially: [
        'The phase 2 randomised senolytic trial in 60 postmenopausal women missed its primary bone resorption endpoint (P = 0.611)',
        'The endurance effect does not scale with achieved plasma concentration, which is not how a pharmacological effect normally behaves',
      ],
      realWorldOutcome: [
        'The senolytic programme is genuine, ongoing and among the more interesting things in ageing biology — and it is a supervised two-drug combination, not a supplement regimen',
        'Quercetin inhibits CYP3A4 and P-glycoprotein, so the interaction risk is real for anyone taking prescription medicine',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule of quercetin aglycone, dihydrate or phytosome complex',
      description:
        'Sold as a dietary supplement with no premarket efficacy review. Formulation matters more than the label suggests: plain aglycone, rutin and phospholipid phytosome complexes differ substantially in absorption, and the senolytic trials used a defined phytosome preparation. In those trials it is co-administered with dasatinib, a prescription-only tyrosine kinase inhibitor.',
      safetyProfile:
        'Generally well tolerated at supplement amounts, with headache and gastrointestinal upset reported. High intravenous doses have caused renal toxicity in early oncology studies. Quercetin inhibits CYP3A4 and P-glycoprotein, raising exposure to co-administered substrates. In the senolytic trials the safety profile is dominated by dasatinib rather than by quercetin.',
    },
    commonQuestions: [
      {
        q: 'Is quercetin a senolytic I can buy?',
        a: 'Not on the evidence available. Every published human senolytic study used dasatinib plus quercetin together, and the rationale for pairing them is explicitly that they target different survival pathways in different senescent cell types. No human study has tested quercetin alone. Dasatinib is a prescription tyrosine kinase inhibitor given under supervision. Attributing the combination result to the supplement half is the central inference error on this page.',
        auditNote:
          'This is the clearest case in this file of trial evidence for one thing being used to sell a different thing.',
      },
      {
        q: 'Did the senolytic trials work?',
        a: 'Partly, and the split is informative. The biology worked: three days of the combination measurably reduced senescent cell markers in human fat biopsies. The clinical test has not yet worked: the first phase 2 randomised trial, in 60 postmenopausal women, found no difference in the bone resorption marker CTx at 20 weeks (P = 0.611). Exploratory analysis suggested benefit in women with the highest senescent cell burden, which is a hypothesis for the next trial rather than a result from this one.',
      },
      {
        q: 'Does quercetin lower blood pressure?',
        a: 'By about 3 mmHg systolic and 2.6 diastolic in the pooled randomised evidence, apparently only at doses above 500 mg/day. That is statistically solid and clinically modest — a standard antihypertensive produces roughly three times as much, with cardiovascular outcome trials behind it. The meta-analysis authors specifically asked whether the effect is clinically relevant, and nobody has answered.',
      },
      {
        q: 'Will it help my endurance training?',
        a: 'By around 2%, pooled across eleven studies in 254 people, which the authors of that meta-analysis themselves classified as between trivial and small. One detail is worth more than the effect size: the benefit did not correlate with achieved plasma quercetin concentration. A genuine pharmacological effect normally scales with exposure, and this one does not.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Serban MC et al. Effects of Quercetin on Blood Pressure: A Systematic Review and Meta-Analysis of Randomized Controlled Trials. J Am Heart Assoc 2016;5:e002713',
        identifier: '10.1161/JAHA.115.002713',
        kind: 'doi',
      },
      {
        label:
          'Hickson LJ et al. Senolytics decrease senescent cells in humans: Preliminary report from a clinical trial of Dasatinib plus Quercetin in individuals with diabetic kidney disease. EBioMedicine 2019;47:446-456',
        identifier: '10.1016/j.ebiom.2019.08.069',
        kind: 'doi',
      },
      {
        label:
          'Justice JN et al. Senolytics in idiopathic pulmonary fibrosis: Results from a first-in-human, open-label, pilot study. EBioMedicine 2019;40:554-563',
        identifier: '10.1016/j.ebiom.2018.12.052',
        kind: 'doi',
      },
      {
        label:
          'Khosla S et al. Effects of intermittent senolytic therapy on bone metabolism in postmenopausal women: a phase 2 randomized controlled trial. Nat Med 2024;30:2605-2612',
        identifier: '10.1038/s41591-024-03096-2',
        kind: 'doi',
      },
      {
        label:
          'Kressler J, Millard-Stafford M, Warren GL. Quercetin and endurance exercise capacity: a systematic review and meta-analysis. Med Sci Sports Exerc 2011;43:2396-2404',
        identifier: '10.1249/MSS.0b013e31822495a7',
        kind: 'doi',
      },
      {
        label:
          'Targeting Cellular Senescence With Senolytics to Improve Skeletal Health in Older Humans',
        identifier: 'NCT04313634',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 5280343 — Quercetin',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5280343',
        kind: 'url',
      },
      {
        label:
          'NADAC (National Average Drug Acquisition Cost) 2026 — Centers for Medicare and Medicaid Services pharmacy acquisition-cost survey',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Saffron extract — a large pooled effect on self-report scales, nothing on clinician-rated
  // ones, documented publication bias, and the most adulterated spice in the world.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'saffron-extract',
    name: 'Saffron extract',
    tradeName: "Sold as affron, Safr'Inside and other standardised Crocus sativus stigma extracts",
    sponsor: 'No single sponsor — stigma extract of Crocus sativus',
    targetGene: 'SLC6A4',
    targetProtein:
      'Serotonin transporter, proposed from animal work. No human target-engagement study exists; the crocins and safranal are the standardisation markers rather than confirmed active moieties.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for low mood, anxiety and eye health. Not approved as an antidepressant in any jurisdiction.',
    patientFriendlyIndication: 'Marketed for mood and anxiety',
    conditionContext: {
      conditionExplainer:
        'Saffron is the dried stigma of the Crocus sativus flower, harvested by hand, and by weight the most expensive agricultural product in the world. It has been used for low mood in Persian traditional medicine, and since 2005 a series of Iranian randomised trials has compared standardised extracts against antidepressants.',
      whyItMatters:
        'The pooled effect sizes for saffron in depression are among the largest for any supplement anywhere. So are the warning signs attached to them: publication bias detected by the reviewers themselves, geographic concentration of the trials, and a complete split between what self-report and clinician-rated scales show.',
      whoTakesThis:
        'Adults with low mood or mild anxiety, often as an alternative to an antidepressant they do not want to take.',
      clinicalGoals:
        'Trials have measured the Beck Depression Inventory, the Beck Anxiety Inventory, the Hamilton Depression Rating Scale and the Hamilton Anxiety Rating Scale. Which of those a trial used turns out to determine the answer.',
    },
    oneSentenceVerdict:
      'Thirty-four randomised trials show saffron improving self-reported depression and anxiety scores with moderate GRADE certainty — and no significant effect on any clinician-rated scale, which is exactly the pattern an expectation effect produces.',
    laymanHowItWorks:
      'Saffron stigma contains crocins, which give the colour, picrocrocin, which gives the taste, and safranal, which gives the smell. Animal work suggests the crocins interfere with serotonin reuptake, which would put saffron loosely in the same family as an SSRI. Nothing has confirmed that in a person. What the trials show is that people taking saffron rate themselves as less depressed and less anxious, and that when a trained clinician does the rating instead, the difference disappears.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 44,
    anatomicalSite: 'Central nervous system, proposed rather than demonstrated',
    substitutes: {
      summary:
        'The only head-to-head trials compared saffron with fluoxetine in mild-to-moderate depression and found no significant difference — in 40 patients, at a single Tehran centre, over six weeks. That is a starting point, not a conclusion.',
      conventionalRx: [
        {
          name: 'Fluoxetine',
          class: 'Selective serotonin reuptake inhibitor',
          howItCompares:
            'Directly compared in Noorbala et al. 2005: 40 outpatients with DSM-IV major depression randomised to saffron 30 mg/day or fluoxetine 20 mg/day for six weeks, with saffron found similar to fluoxetine (F = 0.13, df = 1, P = 0.71) and no significant difference in side effects. An equivalence claim from 40 patients over six weeks is not an equivalence demonstration.',
          typicalCost: 'Generic. Medicaid NADAC: fluoxetine 20 mg at $0.030 a capsule, March 2026',
          prosAndCons:
            'Pros: regulatory approval, decades of use, known interaction profile. Cons: sexual side effects, discontinuation symptoms.',
        },
      ],
      naturalFoods: [
        {
          name: 'Culinary saffron',
          activeCompound: 'Crocins, picrocrocin and safranal',
          biologicalMechanism:
            'The same stigma material used in cooking. The trials used standardised extracts, and the pooled evidence is on those; culinary use has not been tested for mood.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'The Noorbala fluoxetine comparison used 30 mg/day of a hydro-alcoholic stigma extract, which is a laboratory-standardised preparation rather than a cooking quantity',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask which scale a saffron trial used',
          action:
            'Check whether the reported outcome came from a self-report inventory such as the BDI, or from a clinician-administered scale such as the HDRS.',
          patientImpact:
            'The 2026 GRADE-assessed meta-analysis found significant effects on the BDI and BAI and no significant effect on the HDRS, HARS or POMS. Which instrument a trial chose predicted its result.',
          clinicalPrecaution:
            'Saffron is the most adulterated spice in commerce. If it is being taken for a reason, the identity of the material matters.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C/C(=C\\C=C\\C=C(\\C=C\\C=C(\\C(=O)O[C@@H]1O[C@@H]([C@H]([C@@H]([C@H]1O)O)O)CO[C@@H]2O[C@@H]([C@H]([C@@H]([C@H]2O)O)O)CO)/C)/C)/C=C/C=C(/C(=O)O[C@@H]3O[C@@H]([C@H]([C@@H]([C@H]3O)O)O)CO[C@@H]4O[C@@H]([C@H]([C@@H]([C@H]4O)O)O)CO)\\C',
      chemicalFormula: 'C44H64O24',
      molecularWeight: '977.0 g/mol (crocin, PubChem CID 5281233)',
      structureSource: {
        label: 'PubChem CID 5281233 — Crocin, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5281233',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'saf-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Multi-method adulteration screen on incoming stigma',
          description:
            'Screen for adulteration before anything else. Saffron is the most adulterated spice in commerce, and a 2019 Food Chemistry study applying multiple tests to market samples both found new adulterant materials and reported that first-grade saffron is rare in the market. Morphology alone does not detect a powdered bulking agent.',
          reagentsAndBuffer:
            'ISO 3632 spectrophotometric determination of crocin, picrocrocin and safranal; DNA barcoding for Crocus sativus and for safflower and gardenia adulterants; HPTLC; real-time PCR for Carthamus tinctorius',
        },
        {
          id: 'saf-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Hydro-alcoholic extraction of the dried stigma',
          description:
            'Extract the dried stigma into aqueous ethanol at controlled temperature. Crocins are light- and heat-labile carotenoid glycosides and lose colour value quickly, so the extraction and drying conditions are part of the product specification.',
          dependsOnStepId: 'saf-w1',
          reagentsAndBuffer:
            'Aqueous ethanol; extraction below 45 degrees C in the dark; nitrogen headspace; spray drying onto a defined carrier',
        },
        {
          id: 'saf-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Standardisation to a stated crocin and safranal content',
          description:
            'Quantify crocins and safranal separately and standardise to a stated content, because the commercial extracts used in trials are specified this way and a differently standardised extract is a different intervention.',
          dependsOnStepId: 'saf-w2',
          reagentsAndBuffer:
            'C18 HPLC with water / acetonitrile gradient; detection at 440 nm for crocins and 310 nm for safranal; crocin and safranal reference standards; LC-MS confirmation',
        },
        {
          id: 'saf-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Blood-brain barrier transit of crocin and its aglycone',
          description:
            'Measure whether crocin, a large diglycosylated carotenoid, or its aglycone crocetin crosses an in vitro blood-brain barrier model. Crocin is close to a kilodalton and heavily glycosylated, which makes central access the least plausible step in the proposed mechanism and therefore the one worth measuring.',
          dependsOnStepId: 'saf-w3',
          reagentsAndBuffer:
            'hCMEC/D3 monolayer on Transwell inserts; transendothelial electrical resistance monitoring; LC-MS/MS quantification of crocin and crocetin in the basolateral compartment',
        },
        {
          id: 'saf-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Serotonin transporter uptake inhibition with a potency cut-off',
          description:
            'Run SERT uptake inhibition as a concentration-response and report the IC50 against the concentration measured in the permeability step. The proposed mechanism is SSRI-like; whether the compound reaches an SSRI-like concentration at the transporter is the question.',
          dependsOnStepId: 'saf-w4',
          reagentsAndBuffer:
            'HEK293 cells expressing human SERT; tritiated serotonin uptake; fluoxetine reference inhibitor; crocin, crocetin and safranal test articles',
        },
      ],
    },
    keyAudits: [
      {
        id: 'saf-a1',
        category: 'measured',
        title: 'Thirty-four trials: self-reported depression and anxiety scores improved',
        laymanSummary:
          'Across 34 randomised trials in 1,769 people, saffron improved the questionnaires people fill in about themselves.',
        technicalDetails:
          'A 2026 GRADE-assessed systematic review and meta-analysis pooled 34 randomised controlled trials comprising 1,769 participants, with interventions of at least four weeks and saffron as the sole difference between arms. Beck Depression Inventory scores fell by a weighted mean difference of -4.39 (95% CI -6.64 to -2.15, P < 0.001, I2 = 92.3%, 14 trials, 817 participants) and Beck Anxiety Inventory scores by -5.06 (95% CI -8.44 to -1.68, P = 0.003, I2 = 94.8%, six trials, 339 participants). Certainty of evidence was rated moderate. The heterogeneity above 90% on both estimates is very high.',
        evidenceSource:
          'Effect of saffron on depression, anxiety and mood disorder: a GRADE assessed systematic review and meta-analysis of 34 randomized controlled trials. Nutr Neurosci 2026;29:816-837',
        doi: '10.1080/1028415X.2025.2602153',
        measuredMetric:
          'Weighted mean difference in Beck Depression Inventory and Beck Anxiety Inventory',
        auditFlag: 'verified',
      },
      {
        id: 'saf-a2',
        category: 'failed',
        title: 'No significant effect on any clinician-rated scale in the same analysis',
        laymanSummary:
          'When a trained clinician did the rating instead of the participant, the effect vanished.',
        technicalDetails:
          'The same 2026 meta-analysis found no significant effects for the Hamilton Depression Rating Scale, the Hamilton Anxiety Rating Scale or the Profile of Mood States. The authors wrote that the lack of clinician-rated effects underscores the need for high-quality trials. This split is diagnostic rather than incidental: self-report instruments are the ones most sensitive to expectation, and an intervention that moves them while leaving trained-observer scales unmoved is behaving the way a strong placebo behaves.',
        evidenceSource:
          'Effect of saffron on depression, anxiety and mood disorder: a GRADE assessed systematic review and meta-analysis of 34 randomized controlled trials. Nutr Neurosci 2026;29:816-837',
        doi: '10.1080/1028415X.2025.2602153',
        measuredMetric:
          'Hamilton Depression Rating Scale, Hamilton Anxiety Rating Scale and Profile of Mood States',
        auditFlag: 'caution',
      },
      {
        id: 'saf-a3',
        category: 'inferred',
        title: 'The earlier meta-analysis found publication bias and a lack of regional diversity',
        laymanSummary:
          'A 2019 review reported very large effects and then said the pattern of results suggested negative trials were missing, and that nearly all the trials came from one place.',
        technicalDetails:
          "Marx et al. pooled 23 studies and reported a large positive effect size for saffron against placebo for depressive symptoms (Hedges g = 0.99, P < 0.001) and anxiety symptoms (g = 0.95, P = 0.006), and a large effect as an adjunct to antidepressants (g = 1.23, P = 0.028). Egger's regression test found evidence of publication bias. The authors concluded that further trials are required because of that bias and the lack of regional diversity. An effect size approaching 1.0 for any depression intervention is larger than most approved antidepressants achieve against placebo, which is itself a reason for caution rather than enthusiasm.",
        evidenceSource: 'Marx W et al. Nutr Rev 2019;77:557-571',
        doi: '10.1093/nutrit/nuz023',
        inferredClaim:
          'That a pooled effect size near 1.0 reflects the true effect, when the same analysis detected publication bias',
        auditFlag: 'caution',
      },
      {
        id: 'saf-a4',
        category: 'measured',
        title: 'Noorbala 2005: no significant difference from fluoxetine in 40 outpatients',
        laymanSummary:
          'The first head-to-head trial found saffron and fluoxetine performing similarly in 40 people with mild-to-moderate depression over six weeks.',
        technicalDetails:
          'Forty adult outpatients meeting DSM-IV criteria for major depression, mild to moderate, were randomised in a double-blind single-centre six-week trial at Roozbeh Hospital, Tehran, to saffron stigma hydro-alcoholic extract 30 mg/day or fluoxetine 20 mg/day. Saffron was found effective similarly to fluoxetine (F = 0.13, df = 1, P = 0.71), with no significant difference in observed side effects. The authors themselves concluded that a large-scale trial is justified. Twenty patients per arm without a placebo group cannot establish equivalence: a trial this size lacks the power to detect a difference that matters, and finding no difference is the expected outcome regardless.',
        evidenceSource: 'Noorbala AA et al. J Ethnopharmacol 2005;97:281-284',
        doi: '10.1016/j.jep.2004.11.004',
        measuredMetric: 'Hamilton Depression Rating Scale over six weeks against fluoxetine',
        auditFlag: 'caution',
      },
      {
        id: 'saf-a5',
        category: 'inferred',
        title: 'First-grade saffron is rare in the market, and new adulterants keep appearing',
        laymanSummary:
          'Testing market samples found widespread adulteration and identified adulterant materials nobody had catalogued before.',
        technicalDetails:
          'A 2019 Food Chemistry study applied multiple analytical tests to commercial saffron samples, found new adulterant materials, and reported that first-grade saffron is rare in the market. Documented adulterants include safflower, gardenia, turmeric, marigold, dyed plant fibres and synthetic colourants. For a spice this is a commercial fraud problem. For a supplement taken for depression it is an identity problem: a product that is not what it says cannot be connected to the trial evidence at all.',
        evidenceSource:
          'Multiple tests on saffron find new adulterant materials and reveal that Ist grade saffron is rare in the market. Food Chem 2019;272:635-642',
        doi: '10.1016/j.foodchem.2018.08.089',
        inferredClaim:
          'That a commercial saffron supplement contains the material the trials tested',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A standardised stigma extract, with three marker families',
        laymanDesc:
          "The capsule contains an extract of the flower's stigma, standardised on the compounds that give saffron its colour, taste and smell.",
        molecularDetail:
          'Crocins are diglycosylated crocetin esters responsible for colour; picrocrocin is the bitter glycoside; safranal is the volatile aroma compound derived from picrocrocin. Standardisation is on crocin and safranal, not on a demonstrated active moiety.',
        iconName: 'Leaf',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Crocin is cleaved to crocetin before absorption',
        laymanDesc:
          'The large coloured molecule is too big to absorb intact, so the gut removes its sugars first.',
        molecularDetail:
          'Crocin is hydrolysed in the intestinal lumen and at the brush border to crocetin, which is far smaller and lipophilic enough to be absorbed. What circulates is therefore crocetin and its conjugates, not the crocin the product is standardised on.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'A proposed serotonergic action that has not been shown in a person',
        laymanDesc:
          'The favoured explanation is a mild SSRI-like effect. No human study has demonstrated it.',
        molecularDetail:
          'Animal work reports serotonin reuptake inhibition and NMDA antagonism for crocin and safranal. No human target-engagement study, receptor occupancy measurement or central pharmacokinetic study exists for either.',
        iconName: 'Network',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Self-rated scores fall substantially',
        laymanDesc: 'People report feeling meaningfully better, and the pooled effect is large.',
        molecularDetail:
          'BDI -4.39 and BAI -5.06 against placebo across 34 trials, with GRADE certainty rated moderate and heterogeneity above 90% on both estimates.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Clinician-rated scores do not move',
        laymanDesc:
          'The trained observer does not see what the participant reports, which is the finding that needs explaining.',
        molecularDetail:
          'HDRS, HARS and POMS all showed no significant effect in the same analysis. The divergence between self-report and observer-rated instruments is the most informative single fact in the saffron literature, and it is the one the marketing never mentions.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Nutr Neurosci 2026 GRADE meta-analysis (34 randomised trials)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 1769,
        primaryEndpoint:
          'Pooled effect on BDI, BAI, HDRS, HARS and POMS in adults over interventions of at least four weeks',
        endpointMet: false,
        statisticalPValue: 'BDI P < 0.001 and BAI P = 0.003; HDRS, HARS and POMS not significant',
        unreportedAdverseSignals:
          'Recorded as endpoint not met because the clinician-rated scales showed no effect. Heterogeneity was 92.3% for BDI and 94.8% for BAI, which is very high.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Marx 2019 meta-analysis (23 studies)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 0,
        primaryEndpoint:
          'Pooled effect size for depressive and anxiety symptoms versus placebo and versus pharmacotherapy',
        endpointMet: true,
        statisticalPValue: 'g = 0.99 P < 0.001 depression; g = 0.95 P = 0.006 anxiety',
        unreportedAdverseSignals:
          "Egger's regression test found evidence of publication bias, and the authors flagged lack of regional diversity. Sample size recorded as 0 because the review reports study counts rather than a single pooled total.",
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Noorbala 2005 (saffron versus fluoxetine, mild to moderate depression)',
        phase: 'Double-blind randomised active-controlled',
        sampleSize: 40,
        primaryEndpoint: 'Depression score over six weeks compared with fluoxetine 20 mg/day',
        endpointMet: true,
        statisticalPValue: 'F = 0.13, df = 1, P = 0.71 — no significant difference between arms',
        unreportedAdverseSignals:
          'Single centre, 20 per arm, six weeks, no placebo group. A non-significant difference at this sample size is what an underpowered trial produces whether or not a difference exists.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Beck Depression Inventory -4.39 and Beck Anxiety Inventory -5.06 against placebo across 34 randomised trials in 1,769 participants, GRADE certainty moderate',
        'No significant effect on the Hamilton Depression Rating Scale, Hamilton Anxiety Rating Scale or Profile of Mood States in the same analysis',
        "Evidence of publication bias by Egger's regression test in the 2019 pooled analysis",
        'New adulterant materials identified in market saffron, with first-grade material reported as rare',
      ],
      unsupportedInferences: [
        'That saffron is equivalent to fluoxetine, on the strength of a 40-patient six-week single-centre trial with no placebo arm',
        'That a pooled effect size near 1.0 is the true effect when the same analysis detected publication bias',
        'That improvement on a self-report inventory establishes an antidepressant effect when the observer-rated scales in the same dataset show nothing',
      ],
      whatFailedInitially: [
        'Every clinician-rated outcome in the largest and most recent meta-analysis',
        'Regional diversity: the trial base remains geographically concentrated fifteen years after the first review said so',
      ],
      realWorldOutcome: [
        'Saffron is among the best-tolerated interventions in this file, with side-effect rates comparable to placebo in the fluoxetine comparison',
        'Product identity is a live problem for a spice this valuable, and it undermines any attempt to connect a purchase to the trial literature',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule or tablet of standardised stigma extract',
      description:
        'Sold as a dietary supplement with no premarket efficacy review. Commercial extracts are standardised to a stated crocin or safranal content and are branded, and the trials are extract-specific. Given documented adulteration in the raw spice market, a certificate of analysis on the finished extract is the only thing connecting a product to the evidence.',
      safetyProfile:
        'Well tolerated in trials at the amounts studied, with side-effect rates not significantly different from fluoxetine in the head-to-head comparison. High doses of saffron are toxic and abortifacient in the traditional literature, and the amounts in extracts are far below that range. No serious safety signal has emerged from the randomised trials.',
    },
    commonQuestions: [
      {
        q: 'Is saffron really as good as an antidepressant?',
        a: 'The claim comes from one 40-patient trial at a single Tehran hospital over six weeks with no placebo group, which found no significant difference from fluoxetine (P = 0.71). That is not a demonstration of equivalence — a trial with 20 people per arm cannot detect a difference that matters, so finding none is expected. The authors themselves wrote that a large-scale trial is justified, and it has not been run.',
        auditNote:
          'Absence of a detected difference in an underpowered trial is the most common way equivalence gets claimed without being shown.',
      },
      {
        q: 'Why do the self-report and clinician scales disagree?',
        a: 'That is the most important question on this page and it has no settled answer. The 2026 meta-analysis found significant improvement on the Beck inventories, which participants complete themselves, and no significant effect on the Hamilton scales and Profile of Mood States, which a trained rater administers. Self-report instruments are the ones most sensitive to expectation. An intervention that moves them and not the observer-rated ones is behaving the way a strong placebo behaves, and saffron — expensive, exotic, distinctively coloured and smelled — is unusually well equipped to produce one.',
      },
      {
        q: 'What does "evidence of publication bias" mean here?',
        a: "Marx et al. ran Egger's regression test on their pooled data and found the pattern that appears when small negative trials are missing from the literature: small studies showing large effects, without the corresponding small studies showing nothing. That inflates the pooled estimate. It is why an effect size of 0.99 for a depression intervention — larger than most approved antidepressants achieve against placebo — should read as a warning rather than a result.",
      },
      {
        q: 'Does it matter that saffron is adulterated?',
        a: 'For a supplement taken for a reason, yes, more than for a spice. A 2019 study applying multiple analytical methods to market samples found new adulterant materials and reported that first-grade saffron is rare. Documented substitutes include safflower, gardenia, turmeric and dyed plant fibre. A product that is not Crocus sativus stigma cannot be connected to the trials, whatever the label says, so an independent certificate of analysis is the only thing that links a purchase to the evidence.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Effect of saffron on depression, anxiety and mood disorder: a GRADE assessed systematic review and meta-analysis of 34 randomized controlled trials. Nutr Neurosci 2026;29:816-837',
        identifier: '10.1080/1028415X.2025.2602153',
        kind: 'doi',
      },
      {
        label:
          'Marx W et al. Effect of saffron supplementation on symptoms of depression and anxiety: a systematic review and meta-analysis. Nutr Rev 2019;77:557-571',
        identifier: '10.1093/nutrit/nuz023',
        kind: 'doi',
      },
      {
        label:
          'Noorbala AA et al. Hydro-alcoholic extract of Crocus sativus L. versus fluoxetine in the treatment of mild to moderate depression: a double-blind, randomized pilot trial. J Ethnopharmacol 2005;97:281-284',
        identifier: '10.1016/j.jep.2004.11.004',
        kind: 'doi',
      },
      {
        label:
          'Multiple tests on saffron find new adulterant materials and reveal that Ist grade saffron is rare in the market. Food Chem 2019;272:635-642',
        identifier: '10.1016/j.foodchem.2018.08.089',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 5281233 — Crocin',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5281233',
        kind: 'url',
      },
      {
        label:
          'NADAC (National Average Drug Acquisition Cost) 2026 — Centers for Medicare and Medicaid Services pharmacy acquisition-cost survey',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // St John's wort — the one botanical in this file with genuine replicated antidepressant
  // efficacy, and the one whose drug interactions have caused organ rejection.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'st-johns-wort',
    name: "St John's wort",
    tradeName:
      'Sold as standardised Hypericum perforatum extracts including LI-160, WS 5570 and Ze 117',
    sponsor: 'No single sponsor — flowering aerial parts of Hypericum perforatum',
    targetGene: 'NR1I2',
    targetProtein:
      'Pregnane X receptor. Activation of PXR by hyperforin induces CYP3A4 and P-glycoprotein, which is the mechanism behind the interactions and is far better established than the antidepressant mechanism.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold in the United States as a dietary supplement. Licensed as a prescription medicine for mild to moderate depression in Germany and available as a registered traditional herbal medicinal product elsewhere in Europe.',
    patientFriendlyIndication: 'Mild to moderate depression — with serious interactions',
    conditionContext: {
      conditionExplainer:
        'Hypericum perforatum is a yellow-flowered perennial whose extracts have been used for low mood for centuries. It is the most rigorously tested botanical antidepressant in existence: 29 randomised double-blind trials in 5,489 patients were pooled by Cochrane in 2008.',
      whyItMatters:
        'Two facts about this plant are both true and are almost never presented together. It works for mild to moderate depression, about as well as a standard antidepressant, with fewer side effects. And it induces the enzyme that clears roughly half of all prescription drugs, which has caused transplant rejection, contraceptive failure and loss of HIV viral suppression.',
      whoTakesThis:
        'Adults with mild to moderate depressive symptoms, very often self-medicating and very often without telling a doctor — which is exactly the circumstance in which the interaction risk becomes dangerous.',
      clinicalGoals:
        'Trials have measured response rate on the Hamilton Depression Rating Scale against placebo and against tricyclics and SSRIs. Interaction studies have measured plasma concentrations of specific co-administered drugs.',
    },
    oneSentenceVerdict:
      'Twenty-nine randomised trials in 5,489 patients show hypericum extracts superior to placebo and similarly effective to standard antidepressants with fewer side effects — while the same plant induces CYP3A4 strongly enough to have caused acute heart transplant rejection, and failed twice in severe major depression in US trials where sertraline also failed.',
    laymanHowItWorks:
      "St John's wort contains hyperforin, hypericin and several flavonoids. Hyperforin inhibits the reuptake of serotonin, noradrenaline and dopamine, which is a plausible antidepressant mechanism. Hyperforin also binds a receptor in the liver called PXR, which switches on the body's main drug-clearing enzyme, CYP3A4, and the transport pump P-glycoprotein. That second effect is the reason a plant sold beside vitamins can cause a transplanted heart to be rejected.",
    auditConfidence: 'High Confidence',
    confidenceScore: 71,
    anatomicalSite:
      'Central synapses for the antidepressant effect; hepatocyte and enterocyte nuclei for the PXR-mediated interaction',
    substitutes: {
      summary:
        'Standard antidepressants match hypericum on efficacy in the pooled trials and lose on side effects — but they do not induce CYP3A4, which for anyone on another medicine is the decisive difference.',
      conventionalRx: [
        {
          name: 'SSRIs (sertraline, fluoxetine, escitalopram)',
          class: 'Selective serotonin reuptake inhibitor',
          howItCompares:
            "Across 12 comparisons in the Cochrane review, the response rate ratio for hypericum against SSRIs was 1.00 (95% CI 0.90 to 1.11) — statistically indistinguishable — with fewer adverse effects reported for hypericum. SSRIs do not induce CYP3A4, and combining an SSRI with St John's wort risks serotonin syndrome.",
          typicalCost:
            'Generic. Medicaid NADAC: sertraline $0.036, fluoxetine $0.030, escitalopram $0.042 a unit',
          prosAndCons:
            'Pros: no enzyme induction, prescriber oversight, known dose. Cons: more adverse effects in the pooled comparison.',
        },
        {
          name: 'Tricyclic and tetracyclic antidepressants',
          class: 'Non-selective monoamine reuptake inhibitor',
          howItCompares:
            'Response rate ratio 1.02 (95% CI 0.90 to 1.15) across five comparisons, again indistinguishable from hypericum, with a considerably heavier side-effect burden.',
          typicalCost:
            'Generic. Medicaid NADAC: amitriptyline 25 mg at $0.054 a tablet, April 2026',
          prosAndCons:
            'Pros: long clinical record, useful in some pain syndromes. Cons: anticholinergic effects, cardiac toxicity in overdose.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Tell the prescriber, every time',
          action:
            "Disclose St John's wort to any prescriber, pharmacist or surgeon, and treat it as a drug rather than as a supplement.",
          patientImpact:
            'Markowitz et al. measured a 1.4-fold increase in the clearance of an intravenous CYP3A4 probe and a 2.5-fold reduction in oral bioavailability after 14 days. Half of all prescription drugs go through CYP3A4.',
          clinicalPrecaution:
            'Documented consequences include acute heart transplant rejection from loss of ciclosporin levels, breakthrough bleeding and contraceptive failure, and an 81% fall in indinavir exposure in HIV treatment.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)C(=O)[C@]12C(=O)C(=C([C@](C1=O)(C[C@@H]([C@@]2(C)CCC=C(C)C)CC=C(C)C)CC=C(C)C)O)CC=C(C)C',
      chemicalFormula: 'C35H52O4',
      molecularWeight: '536.8 g/mol (hyperforin, PubChem CID 441298)',
      structureSource: {
        label: 'PubChem CID 441298 — Hyperforin, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/441298',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'sjw-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Hyperforin and hypericin content on the incoming herb',
          description:
            'Quantify hyperforin and hypericin separately before extraction, because they behave differently and matter for different reasons: hyperforin drives both the reuptake inhibition and the CYP3A4 induction, hypericin is the traditional standardisation marker and the phototoxicity risk. Low-hyperforin extracts have been developed specifically to reduce interaction risk, and knowing which one is in hand is the whole point of this step.',
          reagentsAndBuffer:
            'Hyperforin dicyclohexylammonium salt and hypericin reference standards; C18 HPLC with detection at 590 nm for hypericin and 275 nm for hyperforin; amber glassware and cold chain, since hyperforin oxidises rapidly',
        },
        {
          id: 'sjw-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ethanolic or methanolic extraction of flowering aerial parts',
          description:
            'Extract the flowering tops under inert atmosphere. Extraction solvent determines the hyperforin content of the finished product more than any other variable, which is why the licensed European extracts are named and specified rather than generic.',
          dependsOnStepId: 'sjw-w1',
          reagentsAndBuffer:
            '60 to 80% aqueous ethanol or methanol; nitrogen blanket throughout; ascorbate as an antioxidant; vacuum concentration below 45 degrees C',
        },
        {
          id: 'sjw-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Standardisation and hyperforin stability specification',
          description:
            'Standardise to stated hyperforin and hypericin content and set a stability specification, since hyperforin degrades on air exposure and a product tested at manufacture may not be the product taken months later.',
          dependsOnStepId: 'sjw-w2',
          reagentsAndBuffer:
            'Spray drying onto silicon dioxide; accelerated stability at 40 degrees C and 75% relative humidity; oxidised hyperforin degradant profiling by LC-MS',
        },
        {
          id: 'sjw-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'PXR reporter and CYP3A4 induction in human hepatocytes',
          description:
            'Measure PXR activation and CYP3A4 induction in primary human hepatocytes as a release specification, not as a research question. This is the assay that predicts the clinically documented interactions, and a low-hyperforin extract claim is only meaningful if this readout supports it.',
          dependsOnStepId: 'sjw-w3',
          reagentsAndBuffer:
            'Primary human hepatocytes in sandwich culture; PXR-luciferase reporter in HepG2; rifampicin as positive control; CYP3A4 mRNA by RT-qPCR and midazolam 1-hydroxylation as the activity readout',
        },
        {
          id: 'sjw-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Monoamine reuptake inhibition panel',
          description:
            'Quantify serotonin, noradrenaline and dopamine reuptake inhibition for the extract and for purified hyperforin, so the efficacy-side pharmacology is measured in the same units as the interaction-side risk.',
          dependsOnStepId: 'sjw-w4',
          reagentsAndBuffer:
            'HEK293 cells expressing human SERT, NET and DAT; tritiated substrate uptake; imipramine and fluoxetine reference inhibitors',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sjw-a1',
        category: 'measured',
        title: 'Cochrane 2008: superior to placebo and equivalent to standard antidepressants',
        laymanSummary:
          "Twenty-nine randomised trials in nearly 5,500 patients found St John's wort better than placebo and about as good as prescription antidepressants, with fewer side effects.",
        technicalDetails:
          'Linde et al. included 29 randomised double-blind trials comprising 5,489 patients, with 18 placebo comparisons and 17 comparisons against synthetic antidepressants. Placebo-controlled results were markedly heterogeneous: in nine larger trials the combined response rate ratio was 1.28 (95% CI 1.10 to 1.49), and in nine smaller trials 1.87 (95% CI 1.22 to 2.87). Comparisons against standard antidepressants were statistically homogeneous, with response rate ratios of 1.02 (95% CI 0.90 to 1.15) against tricyclics and tetracyclics across five trials and 1.00 (95% CI 0.90 to 1.11) against SSRIs across 12 trials. Fewer patients dropped out for adverse effects on hypericum. The authors flagged that country of origin and trial precision were associated with effect size, which complicates interpretation.',
        evidenceSource: 'Linde K et al. Cochrane Database Syst Rev 2008;(4):CD000448',
        doi: '10.1002/14651858.CD000448.pub3',
        measuredMetric: 'Response rate ratio against placebo and against standard antidepressants',
        auditFlag: 'verified',
      },
      {
        id: 'sjw-a2',
        category: 'failed',
        title: 'Two US trials in more severe depression found nothing — and neither did sertraline',
        laymanSummary:
          "In two large American trials in properly diagnosed major depression, St John's wort did not beat placebo. In one of them, the antidepressant used as a comparator did not either.",
        technicalDetails:
          'Shelton et al. randomised 200 outpatients with major depression and a baseline HAM-D of at least 20 across 11 US academic centres to hypericum extract or placebo for eight weeks, and found no significant treatment effect on HAM-D, HAM-A, CGI-S or CGI-I. The Hypericum Depression Trial Study Group then randomised 340 outpatients across 12 centres to hypericum, placebo or sertraline as an active comparator for eight weeks: neither hypericum nor sertraline separated from placebo on the two primary outcomes. HAM-D change was -9.20 for placebo, -8.68 for hypericum (P = 0.59) and -10.53 for sertraline (P = 0.18). Full response occurred in 31.9% on placebo, 23.9% on hypericum and 24.8% on sertraline. The authors noted the failure of the active comparator raises the question of assay sensitivity, while adding that the complete absence of any trend toward efficacy for hypericum is noteworthy.',
        evidenceSource:
          'Shelton RC et al. JAMA 2001;285:1978-1986; Hypericum Depression Trial Study Group. JAMA 2002;287:1807-1814',
        doi: '10.1001/jama.287.14.1807',
        measuredMetric: 'Change in Hamilton Depression Rating Scale over eight weeks',
        auditFlag: 'verified',
      },
      {
        id: 'sjw-a3',
        category: 'measured',
        title: "Acute heart transplant rejection caused by St John's wort",
        laymanSummary:
          "Two heart transplant patients began rejecting their transplants after starting St John's wort, because it stripped out the drug protecting the graft.",
        technicalDetails:
          "Ruschitzka et al. reported acute heart transplant rejection in two patients who had started St John's wort while on stable ciclosporin. Ciclosporin trough concentrations fell to subtherapeutic levels through CYP3A4 and P-glycoprotein induction, rejection followed, and levels and graft function recovered on stopping the herb and increasing the dose. This is the case report that converted a theoretical interaction into a clinical one, and it is why the plant is contraindicated in transplant medicine.",
        evidenceSource: 'Ruschitzka F et al. Lancet 2000;355:548-549',
        doi: '10.1016/S0140-6736(99)05467-7',
        measuredMetric:
          'Ciclosporin trough concentration and endomyocardial biopsy rejection grade',
        auditFlag: 'caution',
      },
      {
        id: 'sjw-a4',
        category: 'measured',
        title:
          'CYP3A4 induction measured directly: 1.4-fold clearance, 2.5-fold bioavailability loss',
        laymanSummary:
          "Fourteen days of St John's wort measurably sped up the body's main drug-clearing enzyme and more than halved how much of an oral test drug got into the blood.",
        technicalDetails:
          "Markowitz et al. gave healthy volunteers St John's wort for 14 days and measured the pharmacokinetics of intravenous and oral alprazolam and midazolam as CYP3A4 probes. Systemic clearance increased and oral bioavailability fell substantially, consistent with induction of intestinal and hepatic CYP3A4. CYP3A4 is responsible for the metabolism of roughly half of all marketed drugs, so this is not one interaction but a class of them.",
        evidenceSource: 'Markowitz JS et al. JAMA 2003;290:1500-1504',
        doi: '10.1001/jama.290.11.1500',
        measuredMetric: 'Systemic clearance and oral bioavailability of CYP3A4 probe substrates',
        auditFlag: 'caution',
      },
      {
        id: 'sjw-a5',
        category: 'measured',
        title: 'Oral contraceptive failure and HIV treatment failure, both documented',
        laymanSummary:
          'The same enzyme induction breaks hormonal contraception and strips out HIV drugs.',
        technicalDetails:
          "Hall et al. studied the interaction between St John's wort and a low-dose oral contraceptive in healthy women and found increased contraceptive steroid clearance with breakthrough bleeding, a recognised marker of reduced contraceptive reliability. Piscitelli et al. separately measured an 81% reduction in indinavir area under the curve in healthy volunteers, an exposure loss large enough to permit viral rebound and resistance. These are not incidental findings: they are the two interactions most likely to be encountered by someone who buys the product without telling anyone.",
        evidenceSource:
          'Hall SD et al. Clin Pharmacol Ther 2003;74:525-535; Piscitelli SC et al. Lancet 2000;355:547-548',
        doi: '10.1016/j.clpt.2003.08.009',
        measuredMetric:
          'Contraceptive steroid clearance and breakthrough bleeding; indinavir area under the concentration-time curve',
        auditFlag: 'caution',
      },
      {
        id: 'sjw-a6',
        category: 'conclusion_shift',
        title:
          'Effect size tracked country of origin, which the Cochrane authors flagged themselves',
        laymanSummary:
          'The trials showing the biggest benefits were disproportionately from one part of the world, and the reviewers said so.',
        technicalDetails:
          'Linde et al. reported marked heterogeneity among placebo-controlled trials, with smaller trials showing response rate ratios nearly twice those of larger ones (1.87 versus 1.28), and stated that the association of country of origin and precision with effect size complicates interpretation. German-speaking countries, where hypericum is a licensed prescription medicine, contributed a large share of the positive trials, while the two large US trials found nothing. That geographic pattern is the honest reason the pooled estimate sits where it does rather than higher.',
        evidenceSource: 'Linde K et al. Cochrane Database Syst Rev 2008;(4):CD000448',
        doi: '10.1002/14651858.CD000448.pub3',
        inferredClaim:
          'That the pooled response rate ratio applies uniformly across populations and severities',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A multi-component extract, with hyperforin doing most of the work',
        laymanDesc:
          'The extract contains several active families, and one of them is responsible for both the benefit and the danger.',
        molecularDetail:
          'Hyperforin is a prenylated phloroglucinol; hypericin is a naphthodianthrone; the extract also contains flavonoids including rutin and quercetin. Hyperforin content varies with solvent and degrades on air exposure, which is why the licensed European extracts are individually named and specified.',
        iconName: 'Leaf',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorbed, and it reaches both brain and liver',
        laymanDesc:
          'It gets into the bloodstream well enough to act on the brain — and on the liver, which is where the trouble starts.',
        molecularDetail:
          'Hyperforin is absorbed with a plasma half-life of around nine hours and reaches concentrations consistent with its in vitro reuptake inhibition. The same systemic exposure delivers it to hepatocytes and enterocytes, where the induction occurs.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'At the synapse it blocks reuptake of three transmitters at once',
        laymanDesc:
          'It keeps serotonin, noradrenaline and dopamine in the synapse for longer, which is broadly what antidepressants do.',
        molecularDetail:
          'Hyperforin inhibits synaptosomal reuptake of serotonin, noradrenaline and dopamine, and also GABA and glutamate, apparently by dissipating the sodium gradient the transporters depend on rather than by binding them directly. That non-selective mechanism differs from every prescription antidepressant class.',
        iconName: 'Network',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'At the liver it switches on the main drug-clearing enzyme',
        laymanDesc:
          'In the liver, the same compound activates a genetic switch that ramps up the machinery for destroying medicines.',
        molecularDetail:
          'Hyperforin is a potent pregnane X receptor agonist. Activated PXR transcriptionally induces CYP3A4 and the efflux transporter P-glycoprotein in liver and intestine, increasing both first-pass metabolism and systemic clearance of their substrates.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Depression improves; co-administered drugs stop working',
        laymanDesc:
          'The mood effect is real. So is the failure of whatever else the person is taking.',
        molecularDetail:
          'Response rate ratio 1.28 against placebo in larger trials and 1.00 against SSRIs. In parallel: ciclosporin loss causing transplant rejection, an 81% fall in indinavir exposure, and contraceptive steroid clearance sufficient to cause breakthrough bleeding.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Linde 2008 Cochrane review (29 randomised double-blind trials)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 5489,
        primaryEndpoint:
          'Response rate on depression scales versus placebo and versus standard antidepressants',
        endpointMet: true,
        statisticalPValue:
          'RR 1.28 (95% CI 1.10 to 1.49) versus placebo in larger trials; RR 1.00 (0.90 to 1.11) versus SSRIs',
        unreportedAdverseSignals:
          'Marked heterogeneity in the placebo comparisons, with smaller trials showing far larger effects, and an association between country of origin and effect size that the authors said complicates interpretation.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Hypericum Depression Trial Study Group 2002 (hypericum, sertraline, placebo)',
        phase: 'Randomised, double-blind, placebo-controlled with active comparator',
        sampleSize: 340,
        primaryEndpoint:
          'Change in HAM-D total score from baseline to eight weeks, and full response rate',
        endpointMet: false,
        statisticalPValue:
          'P = 0.59 for hypericum versus placebo; P = 0.18 for sertraline versus placebo',
        unreportedAdverseSignals:
          'The active comparator also failed, which raises assay sensitivity as an explanation. The authors noted that the complete absence of any trend toward efficacy for hypericum is nevertheless noteworthy.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Shelton 2001 (hypericum versus placebo, major depression, 11 US centres)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 200,
        primaryEndpoint: 'Rate of change on the Hamilton Depression Rating Scale over eight weeks',
        endpointMet: false,
        statisticalPValue: 'P = 0.16 for treatment effect on HAM-D',
        unreportedAdverseSignals:
          'Remission was significantly more frequent on hypericum (14.3% versus 4.9%, P = 0.02) but at very low absolute rates. Headache was more common on hypericum, 41% versus 25%.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Response rate ratio 1.28 (95% CI 1.10 to 1.49) against placebo across nine larger trials',
        'Response rate ratio 1.00 (95% CI 0.90 to 1.11) against SSRIs across 12 trials, with fewer withdrawals for adverse effects',
        'Acute heart transplant rejection in two patients after starting the herb on stable ciclosporin',
        'An 81% reduction in indinavir exposure, and increased contraceptive steroid clearance with breakthrough bleeding',
        'Direct measurement of CYP3A4 induction using intravenous and oral probe substrates over 14 days',
      ],
      unsupportedInferences: [
        'That efficacy in mild to moderate depression extends to severe major depression — two large US trials found nothing there',
        'That a botanical sold beside vitamins carries a supplement-level interaction risk',
        'That the pooled effect applies uniformly, when effect size tracked country of origin and trial precision',
      ],
      whatFailedInitially: [
        'Shelton 2001 in 200 US outpatients with major depression: no significant treatment effect on any primary or secondary scale',
        'The Hypericum Depression Trial Study Group in 340 patients: neither hypericum nor sertraline separated from placebo',
      ],
      realWorldOutcome: [
        'This is the strongest efficacy evidence for any botanical in this file, and it is confined to mild to moderate depression',
        'It is also the most dangerous substance here for anyone taking another medicine, and it is bought without a prescription',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet or capsule of standardised Hypericum perforatum extract',
      description:
        'Sold as a dietary supplement in the United States and licensed as a prescription antidepressant for mild to moderate depression in Germany. Extracts differ substantially in hyperforin content depending on solvent, and low-hyperforin preparations exist specifically to reduce interaction risk. Trial evidence attaches to named extracts, not to the plant generically.',
      safetyProfile:
        'Direct adverse effects are mild and fewer than with standard antidepressants; headache was the only event more frequent than placebo in Shelton 2001, at 41% versus 25%. Photosensitivity is associated with hypericin. The dominant risk is pharmacokinetic: CYP3A4 and P-glycoprotein induction reduces exposure to ciclosporin, tacrolimus, oral contraceptives, warfarin, protease inhibitors, some anticonvulsants, statins and many oncology drugs. Combining it with an SSRI risks serotonin syndrome.',
    },
    commonQuestions: [
      {
        q: "Does St John's wort actually treat depression?",
        a: 'For mild to moderate depression, yes, and the evidence is better than for anything else in this file: 29 randomised double-blind trials in 5,489 patients, superior to placebo (RR 1.28 in the larger trials) and indistinguishable from SSRIs and tricyclics, with fewer patients stopping because of side effects. Two important limits: the two large US trials in more severely depressed patients found nothing, and effect size tracked country of origin closely enough that the Cochrane authors said so in their conclusions.',
      },
      {
        q: 'How dangerous are the interactions really?',
        a: 'Two heart transplant patients rejected their grafts. Indinavir exposure fell 81% in healthy volunteers, enough to permit HIV viral rebound and resistance. Oral contraceptive steroid clearance rose with breakthrough bleeding. Direct probe studies confirm CYP3A4 induction after 14 days. Since CYP3A4 clears roughly half of all marketed drugs, this is not a list of interactions to memorise — it is a reason to treat the plant as a prescription drug and disclose it to every prescriber.',
        auditNote:
          'The risk is amplified by how it is bought: over the counter, often without telling a doctor, precisely because it is perceived as natural.',
      },
      {
        q: 'Why did the American trials fail when the European ones worked?',
        a: 'Nobody has settled it, and both trials that failed are informative in different ways. Shelton 2001 enrolled 200 patients with HAM-D of at least 20 and found no effect. The 2002 trial enrolled 340 and found neither hypericum nor sertraline separated from placebo, which points to assay sensitivity — a trial that cannot detect a known-effective drug cannot rule out a new one. But those trials also enrolled more severely depressed patients than the European mild-to-moderate trials, and the Cochrane review found effect size associated with country of origin. Severity and geography are both live explanations.',
      },
      {
        q: 'Is a low-hyperforin extract safer?',
        a: 'That is the design intent, since hyperforin is the pregnane X receptor agonist driving CYP3A4 induction, and low-hyperforin preparations show less induction in the laboratory. The complication is that hyperforin is also the component most associated with the reuptake inhibition, so reducing it may reduce both the risk and the effect. The trials in the Cochrane review used specific named extracts with specific hyperforin contents, and a claim about one does not transfer to another.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          "Linde K et al. St John's wort for major depression. Cochrane Database Syst Rev 2008;(4):CD000448",
        identifier: '10.1002/14651858.CD000448.pub3',
        kind: 'doi',
      },
      {
        label:
          "Hypericum Depression Trial Study Group. Effect of Hypericum perforatum (St John's wort) in major depressive disorder: a randomized controlled trial. JAMA 2002;287:1807-1814",
        identifier: '10.1001/jama.287.14.1807',
        kind: 'doi',
      },
      {
        label:
          "Shelton RC et al. Effectiveness of St John's wort in major depression: a randomized controlled trial. JAMA 2001;285:1978-1986",
        identifier: '10.1001/jama.285.15.1978',
        kind: 'doi',
      },
      {
        label:
          "Ruschitzka F et al. Acute heart transplant rejection due to Saint John's wort. Lancet 2000;355:548-549",
        identifier: '10.1016/S0140-6736(99)05467-7',
        kind: 'doi',
      },
      {
        label:
          "Markowitz JS et al. Effect of St John's wort on drug metabolism by induction of cytochrome P450 3A4 enzyme. JAMA 2003;290:1500-1504",
        identifier: '10.1001/jama.290.11.1500',
        kind: 'doi',
      },
      {
        label:
          "Hall SD et al. The interaction between St John's wort and an oral contraceptive. Clin Pharmacol Ther 2003;74:525-535",
        identifier: '10.1016/j.clpt.2003.08.009',
        kind: 'doi',
      },
      {
        label:
          "Piscitelli SC et al. Indinavir concentrations and St John's wort. Lancet 2000;355:547-548",
        identifier: '10.1016/S0140-6736(99)05712-8',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 441298 — Hyperforin',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/441298',
        kind: 'url',
      },
      {
        label:
          'NADAC (National Average Drug Acquisition Cost) 2026 — Centers for Medicare and Medicaid Services pharmacy acquisition-cost survey',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Valerian root — safe, and in the most rigorous trials, not effective.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'valerian-root',
    name: 'Valerian root',
    sponsor: 'No single sponsor — root and rhizome of Valeriana officinalis',
    targetGene: 'GABRA1',
    targetProtein:
      'GABA-A receptor, proposed. Valerenic acid modulates the beta-3 subunit in vitro; whether the modulation occurs at concentrations an oral dose produces has not been established.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for sleep and mild anxiety. Registered in parts of Europe as a traditional herbal medicinal product, a status granted on documented traditional use rather than on efficacy trials.',
    patientFriendlyIndication: 'Marketed as a sleep aid',
    conditionContext: {
      conditionExplainer:
        'Insomnia affects roughly a third of adults at some point and drives absenteeism, health care use and social disability. Valerian root has been the leading herbal sleep aid in Europe and North America for decades, which makes the size and consistency of its trial base worth examining closely.',
      whyItMatters:
        'Valerian is the clearest example in this file of a pattern that recurs across supplement research: an early literature of small, methodologically weak, positive studies, and then, as trials got better, the effect disappearing. The transition is documented well enough here to be readable.',
      whoTakesThis:
        'Adults with sleep-onset difficulty or non-restorative sleep, usually self-directed and often as an alternative to a prescription hypnotic.',
      clinicalGoals:
        'Trials have measured self-reported sleep quality, sleep latency, wake after sleep onset, sleep efficiency, and in the better studies polysomnography and actigraphy.',
    },
    oneSentenceVerdict:
      'Sixteen trials in 1,093 patients produced a relative risk of improved sleep of 1.8 with documented publication bias, and a review of 37 studies concluded that none of the most recent and most methodologically rigorous ones found any effect on sleep at all.',
    laymanHowItWorks:
      'Valerian root contains valerenic acid and a family of unstable compounds called valepotriates. The proposed mechanism is that valerenic acid nudges the GABA-A receptor — the same receptor benzodiazepines act on, though far more weakly — toward inhibition. In practice, when trials measured sleep with electrodes rather than questionnaires, the difference from placebo did not appear, and in one crossover trial in older women, time awake after falling asleep actually increased.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 24,
    anatomicalSite: 'Central nervous system, proposed at the GABA-A receptor',
    substitutes: {
      summary:
        'For chronic insomnia, cognitive behavioural therapy is first-line in every major guideline and has durable effects. Among the things people take instead, valerian has the best safety record and the weakest efficacy evidence.',
      conventionalRx: [
        {
          name: 'Cognitive behavioural therapy for insomnia',
          class: 'Structured behavioural therapy',
          howItCompares:
            'Recommended as first-line treatment for chronic insomnia, with effects that persist after treatment ends. Valerian has not been compared with it in any trial.',
          typicalCost: '',
          prosAndCons:
            'Pros: durable, no pharmacology, guideline-recommended. Cons: requires several weeks of structured effort.',
        },
        {
          name: 'Z-drugs (zolpidem, zopiclone)',
          class: 'Non-benzodiazepine GABA-A receptor agonist',
          howItCompares:
            'Acts at the receptor valerian is proposed to act at, with unambiguous polysomnographic effects — which is precisely the contrast: when sleep is measured objectively, the drug shows up and valerian does not.',
          typicalCost:
            'Generic. Medicaid NADAC: zolpidem 10 mg $0.039, eszopiclone 3 mg $0.086 a tablet',
          prosAndCons:
            'Pros: measurable effect on sleep latency. Cons: dependence, next-day impairment, complex sleep behaviours.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Notice which trials used electrodes',
          action:
            'When reading a valerian study, check whether sleep was measured by questionnaire or by polysomnography and actigraphy.',
          patientImpact:
            'Taibi et al. measured both in the same 16 women and found no significant difference from placebo on any measure — self-reported or objective — while time awake after sleep onset rose 17.7 minutes against baseline on valerian.',
          clinicalPrecaution:
            'Valerian is genuinely safe, with rare adverse events across 37 studies. The cost of taking it is the sleep problem going untreated while it is tried.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@@H]1CC[C@H](C2=C(CC[C@H]12)C)/C=C(\\C)/C(=O)O',
      chemicalFormula: 'C15H22O2',
      molecularWeight: '234.33 g/mol (valerenic acid, PubChem CID 6440940)',
      structureSource: {
        label: 'PubChem CID 6440940 — Valerenic acid, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6440940',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'val-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Species confirmation and valerenic acid assay',
          description:
            'Confirm Valeriana officinalis rather than V. edulis or Indian valerian, and assay valerenic acid. The species differ markedly in valepotriate content, and the trial literature is on V. officinalis, so a species substitution silently disconnects a product from every study cited here.',
          reagentsAndBuffer:
            'Valerenic acid and acetoxyvalerenic acid reference standards; C18 HPLC with detection at 225 nm; DNA barcoding of the ITS region; valepotriate profiling by LC-MS',
        },
        {
          id: 'val-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Aqueous-ethanolic extraction of dried root and rhizome',
          description:
            'Extract dried root and rhizome. Valepotriates are epoxide-containing iridoids that decompose on drying, heating and storage into baldrinals, so the extraction conditions determine what is in the finished product far more than the raw material does.',
          dependsOnStepId: 'val-w1',
          reagentsAndBuffer:
            '70% aqueous ethanol; extraction at ambient temperature; concentration below 40 degrees C; nitrogen headspace',
        },
        {
          id: 'val-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Standardisation with a valepotriate degradation specification',
          description:
            'Standardise to a stated valerenic acid content and set a limit for baldrinal and homobaldrinal, the decomposition products of the valepotriates, which are alkylating and are the reason valepotriate-rich preparations are avoided.',
          dependsOnStepId: 'val-w2',
          reagentsAndBuffer:
            'Preparative HPLC; LC-MS quantification of baldrinal and homobaldrinal; accelerated stability at 40 degrees C and 75% relative humidity',
        },
        {
          id: 'val-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'GABA-A beta-3 subunit expression system with a potency cut-off',
          description:
            'Express recombinant GABA-A receptors containing the beta-3 subunit valerenic acid is reported to modulate, and record the concentration-response. The point of this step is to establish the EC50 so it can be compared with achievable plasma concentration rather than quoted on its own.',
          dependsOnStepId: 'val-w3',
          reagentsAndBuffer:
            'Xenopus oocytes or HEK293 cells expressing alpha-1 beta-3 gamma-2 GABA-A receptors; two-electrode voltage clamp; GABA EC20 baseline; diazepam and loreclezole reference modulators',
        },
        {
          id: 'val-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Rodent polysomnography rather than a sedation proxy',
          description:
            'Score sleep architecture by EEG in a rodent model rather than inferring sedation from open-field activity. The human literature failed specifically at the point where objective sleep measurement replaced self-report, so a preclinical programme that skips objective measurement repeats the error one level down.',
          dependsOnStepId: 'val-w4',
          reagentsAndBuffer:
            'Implanted EEG and EMG telemetry; automated sleep stage scoring; zolpidem positive control; vehicle-matched crossover design',
        },
      ],
    },
    keyAudits: [
      {
        id: 'val-a1',
        category: 'measured',
        title:
          'Bent 2006: relative risk of improved sleep 1.8, with publication bias in the same estimate',
        laymanSummary:
          'A meta-analysis found people were more likely to report improved sleep on valerian, and found in the same breath that negative studies appeared to be missing.',
        technicalDetails:
          'Bent et al. identified 16 eligible randomised placebo-controlled trials examining 1,093 patients. Six studies reported a dichotomous sleep-quality outcome, improved or not, and pooling those gave a relative risk of improved sleep of 1.8 (95% CI 1.2 to 2.9). The authors stated directly that there was evidence of publication bias in this summary measure, that most studies had significant methodological problems, and that valerian doses, preparations and treatment lengths varied considerably. Their conclusion was that valerian might improve sleep quality without producing side effects, and that future studies should use standardised preparations and standard measures.',
        evidenceSource: 'Bent S et al. Am J Med 2006;119:1005-1012',
        doi: '10.1016/j.amjmed.2006.02.026',
        measuredMetric: 'Relative risk of a dichotomous improved-sleep outcome across six trials',
        auditFlag: 'caution',
      },
      {
        id: 'val-a2',
        category: 'conclusion_shift',
        title: 'Taibi 2007: the most rigorous studies were the ones that found nothing',
        laymanSummary:
          'A wider review of 37 studies found that as trial quality improved, the effect disappeared, and that the newest and best studies found no effect at all.',
        technicalDetails:
          "Taibi et al. screened 592 articles and reviewed 37 separate studies — 29 controlled trials assessed for efficacy and safety, plus eight open-label trials for safety only. Most studies found no significant difference between valerian and placebo, in healthy individuals or in people with general sleep disturbance or insomnia. The authors wrote that none of the most recent studies, which were also the most methodologically rigorous, found significant effects of valerian on sleep, and concluded that while valerian is a safe herb associated with only rare adverse events, the evidence does not support its clinical efficacy as a sleep aid for insomnia. The paper's title states the finding plainly: safe but not effective.",
        evidenceSource: 'Taibi DM et al. Sleep Med Rev 2007;11:209-230',
        doi: '10.1016/j.smrv.2007.03.002',
        inferredClaim:
          'That the pooled positive estimate from the earlier literature reflects a real hypnotic effect rather than the quality gradient in the trials producing it',
        auditFlag: 'contested',
      },
      {
        id: 'val-a3',
        category: 'failed',
        title: 'Taibi 2009: no effect on any sleep measure, and wake time increased',
        laymanSummary:
          'In a crossover trial that measured sleep with electrodes as well as questionnaires, valerian did nothing — and time spent awake in the night went up.',
        technicalDetails:
          'Sixteen older women with insomnia, mean age 69.4, took 300 mg of concentrated valerian extract or placebo 30 minutes before bed for two weeks in a phase 2 randomised double-blind crossover trial. Sleep was assessed in the laboratory by self-report and polysomnography over nine laboratory nights, and at home by sleep logs and actigraphy. There were no statistically significant differences between valerian and placebo after a single dose or after two weeks on any measure of sleep latency, wake after sleep onset, sleep efficiency or self-rated sleep quality. Against baseline, wake after sleep onset increased significantly after two weeks of valerian (+17.7 +/- 25.6 minutes, P = 0.02) but not after placebo (+6.8 +/- 26.4 minutes, not significant). Side effects were minor and did not differ from placebo. The authors concluded the findings add to the evidence that does not support valerian in clinical management of insomnia.',
        evidenceSource: 'Taibi DM et al. Sleep Med 2009;10:319-328',
        doi: '10.1016/j.sleep.2008.02.001',
        measuredMetric:
          'Polysomnographic sleep latency, wake after sleep onset and sleep efficiency, plus actigraphy and self-report',
        auditFlag: 'verified',
      },
      {
        id: 'val-a4',
        category: 'inferred',
        title: 'The preparations in the trials were not comparable to each other',
        laymanSummary:
          'The studies used different doses, different extracts and different treatment lengths, so pooling them assumes a consistency the products do not have.',
        technicalDetails:
          'Bent et al. noted that valerian doses, preparations and length of treatment varied considerably across the 16 included trials. This is not incidental for valerian specifically: valepotriates decompose during drying and storage into baldrinals, so two extracts of the same root at the same nominal strength can differ chemically depending on how they were processed and how long they sat. A pooled estimate across heterogeneous preparations attributes to an ingredient what may belong to a particular preparation, or to none of them.',
        evidenceSource: 'Bent S et al. Am J Med 2006;119:1005-1012',
        doi: '10.1016/j.amjmed.2006.02.026',
        inferredClaim:
          'That valerian is a single intervention whose trials can be meaningfully pooled',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A chemically unstable root extract',
        laymanDesc:
          'The root contains compounds that break down during drying and storage, so what is in the capsule depends on how it was made.',
        molecularDetail:
          'Valerenic acid is a sesquiterpenoid and is comparatively stable. The valepotriates are epoxide-containing iridoid esters that decompose on drying, heat and storage into baldrinal and homobaldrinal. This instability is why nominally identical products are not chemically identical.',
        iconName: 'Leaf',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorbed, with poorly characterised human pharmacokinetics',
        laymanDesc:
          'Valerenic acid enters the bloodstream, but how much reaches the brain has not been well established.',
        molecularDetail:
          'Human pharmacokinetic data for valerenic acid are sparse, with plasma concentrations reported in the low nanogram-per-millilitre range after typical extract doses. No study has related a measured plasma or brain concentration to the in vitro receptor potency.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'A proposed GABA-A action at the same receptor as benzodiazepines',
        laymanDesc:
          "Valerenic acid nudges the brain's main calming receptor, at a different site from sleeping pills and far more weakly.",
        molecularDetail:
          'Valerenic acid is a positive allosteric modulator of GABA-A receptors containing the beta-2 or beta-3 subunit, acting at the loreclezole site rather than the benzodiazepine site. The reported potency sits well above the plasma concentrations an oral extract produces.',
        iconName: 'Network',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Subjective sleep quality improves in the weaker studies',
        laymanDesc: 'When people are asked how they slept, more of them say better on valerian.',
        molecularDetail:
          'Relative risk of improved sleep 1.8 (95% CI 1.2 to 2.9) across six trials reporting a dichotomous outcome — with publication bias detected in that same summary measure by the authors who computed it.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Objective sleep does not change, and may get slightly worse',
        laymanDesc:
          'Measured with electrodes, nothing improves, and in one trial time awake during the night went up.',
        molecularDetail:
          'Taibi 2009 found no significant difference on polysomnographic sleep latency, wake after sleep onset or sleep efficiency, with wake after sleep onset rising 17.7 minutes from baseline on valerian (P = 0.02) and not on placebo. Taibi 2007 found that none of the most rigorous studies detected any effect.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Taibi 2009 (300 mg valerian extract, older women with insomnia)',
        phase: 'Phase 2 randomised, double-blind, crossover',
        sampleSize: 16,
        primaryEndpoint:
          'Polysomnographic and self-reported sleep latency, wake after sleep onset, sleep efficiency and sleep quality',
        endpointMet: false,
        statisticalPValue:
          'No significant difference from placebo on any measure; wake after sleep onset increased from baseline on valerian, P = 0.02',
        unreportedAdverseSignals:
          'Side effects were minor and did not differ from placebo. The increase in wake after sleep onset was a within-arm comparison against baseline rather than against placebo, so it is a signal rather than a demonstrated harm.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Bent 2006 meta-analysis (16 randomised placebo-controlled trials)',
        phase: 'Systematic review and meta-analysis',
        sampleSize: 1093,
        primaryEndpoint: 'Improvement in sleep quality versus placebo',
        endpointMet: true,
        statisticalPValue:
          'RR 1.8 (95% CI 1.2 to 2.9) for a dichotomous improved-sleep outcome across six trials',
        unreportedAdverseSignals:
          'The authors reported evidence of publication bias in this summary measure, and that most included studies had significant methodological problems with considerable variation in dose, preparation and treatment length.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Taibi 2007 systematic review (37 studies, 29 controlled trials)',
        phase: 'Systematic review',
        sampleSize: 0,
        primaryEndpoint:
          'Efficacy of valerian as a sleep aid, stratified by preparation and population',
        endpointMet: false,
        statisticalPValue:
          'Not applicable — narrative synthesis with standardised quality criteria',
        unreportedAdverseSignals:
          'Sample size recorded as 0 because the review reports study counts rather than a pooled total. None of the most recent and most methodologically rigorous studies found any significant effect on sleep.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Relative risk of improved sleep 1.8 (95% CI 1.2 to 2.9) across six trials with a dichotomous outcome, with publication bias detected in the same estimate',
        'No significant difference from placebo on polysomnographic sleep latency, wake after sleep onset, sleep efficiency or self-rated quality in a crossover trial with nine laboratory nights per participant',
        'Wake after sleep onset increased 17.7 minutes from baseline after two weeks of nightly valerian (P = 0.02), and did not on placebo',
        'Rare adverse events across 37 studies including eight open-label safety trials',
      ],
      unsupportedInferences: [
        'That the pooled relative risk of 1.8 represents a hypnotic effect, when publication bias was detected in that estimate and the most rigorous trials found nothing',
        'That an in vitro GABA-A modulation at concentrations far above achievable plasma levels explains a clinical effect',
        'That trials of chemically divergent preparations can be pooled as though testing one intervention',
      ],
      whatFailedInitially: [
        'Every objective sleep measure in the trial that used polysomnography and actigraphy alongside self-report',
        'The most recent and most methodologically rigorous studies in the 37-study review, without exception',
      ],
      realWorldOutcome: [
        'Valerian has one of the best safety records of anything in this file: rare adverse events, no dependence, no next-day impairment',
        'The cost of using it is the untreated insomnia during the trial period, and insomnia has an effective first-line treatment that is not a pill',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, tablet or tincture of root and rhizome extract',
      description:
        'Sold as a dietary supplement in the United States and registered as a traditional herbal medicinal product in parts of Europe, a status based on documented long-standing use rather than on trial evidence. Preparations vary widely in extraction solvent, valerenic acid content and valepotriate degradation state, and the trial literature reflects that variation rather than controlling for it.',
      safetyProfile:
        'Consistently safe across 37 reviewed studies with only rare adverse events, and side effects not different from placebo in the crossover trial. Reported effects are headache, dizziness and gastrointestinal upset. Valepotriate decomposition products are alkylating in vitro, which is why modern preparations are specified on valerenic acid rather than valepotriates. No dependence or withdrawal syndrome has been described.',
    },
    commonQuestions: [
      {
        q: 'Does valerian help you sleep?',
        a: 'The best evidence says no. The often-quoted positive figure — a relative risk of improved sleep of 1.8 — comes from six trials reporting a yes-or-no sleep-quality question, and the authors who calculated it reported publication bias in that same estimate. A larger review covering 37 studies found that most showed no difference from placebo and that none of the most recent, most rigorous studies found any effect. When one trial measured sleep with polysomnography and actigraphy as well as questionnaires, nothing differed from placebo on any measure.',
        auditNote:
          'The title of the 2007 review states the position the field arrived at: safe but not effective.',
      },
      {
        q: 'Why did the early studies look positive?',
        a: "Three reasons, all documented rather than speculated. Most of the early trials had significant methodological problems, by the reviewers' own assessment. Publication bias was detected statistically in the pooled estimate, meaning small negative trials appear to be missing. And the outcome that produced the positive result was a self-reported yes-or-no question about sleep quality, which is the measure most sensitive to expectation. As trials adopted objective measurement, the effect went away.",
      },
      {
        q: 'Is it safe?',
        a: 'Yes, and unusually so. Across 37 studies including eight open-label safety trials, adverse events were rare, and in the crossover trial side effects did not differ from placebo. There is no dependence, no withdrawal and no next-day impairment of the kind associated with hypnotics. The real cost of valerian is not toxicity; it is the weeks of untreated insomnia while it is being tried.',
      },
      {
        q: 'Why do products differ so much?',
        a: 'Because the chemistry is unstable. The valepotriates decompose during drying, heating and storage into baldrinal and homobaldrinal, so two products from the same species at the same nominal strength can be chemically different depending on processing and shelf time. Bent et al. specifically noted that doses, preparations and treatment lengths varied considerably across the trials, which means the pooled evidence describes a category rather than a product.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Bent S et al. Valerian for sleep: a systematic review and meta-analysis. Am J Med 2006;119:1005-1012',
        identifier: '10.1016/j.amjmed.2006.02.026',
        kind: 'doi',
      },
      {
        label:
          'Taibi DM et al. A systematic review of valerian as a sleep aid: safe but not effective. Sleep Med Rev 2007;11:209-230',
        identifier: '10.1016/j.smrv.2007.03.002',
        kind: 'doi',
      },
      {
        label:
          'Taibi DM et al. A randomized clinical trial of valerian fails to improve self-reported, polysomnographic, and actigraphic sleep in older women with insomnia. Sleep Med 2009;10:319-328',
        identifier: '10.1016/j.sleep.2008.02.001',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 6440940 — Valerenic acid',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6440940',
        kind: 'url',
      },
      {
        label:
          'NADAC (National Average Drug Acquisition Cost) 2026 — Centers for Medicare and Medicaid Services pharmacy acquisition-cost survey',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
]
