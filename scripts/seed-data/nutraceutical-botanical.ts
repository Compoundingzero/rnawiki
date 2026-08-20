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
      'Berberine barely gets into your bloodstream at all. What reaches the liver mildly slows the cell\'s power plants, and the cell reads that as being short of energy. It responds by switching on a master energy sensor called AMPK, which tells the liver to stop manufacturing sugar and to keep more cholesterol catchers on its surface. Separately, most of the dose never leaves the gut, where bacteria convert it into a more absorbable form and where it changes the microbial population directly.',
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
          typicalCost: 'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: decades of outcome evidence, regulated manufacture, known dose. Cons: gastrointestinal upset early on, and long-term use can lower vitamin B12.',
        },
        {
          name: 'Atorvastatin or rosuvastatin (generic)',
          class: 'HMG-CoA reductase inhibitor',
          howItCompares:
            'Lowers LDL cholesterol far more than berberine and by a completely different mechanism — blocking cholesterol synthesis rather than stabilising the LDL receptor messenger RNA, which is the route Kong et al. described for berberine in 2004.',
          typicalCost: 'Not priced here — no published cost-of-production figure is cited on this page',
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
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Viscous soluble fibre (oats, barley, psyllium)',
          activeCompound: 'Beta-glucan and arabinoxylan',
          biologicalMechanism:
            'Slows gastric emptying and traps bile acids, blunting the post-meal glucose rise and forcing the liver to spend cholesterol making replacement bile acids. A smaller effect than berberine on both readings, from a much better-characterised mechanism.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
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
          'Feng et al. (Sci Rep 2015) showed that gut bacterial nitroreductase converts berberine into dihydroberberine, which is absorbed roughly five times more efficiently and is then oxidised back to berberine in intestinal tissue. That reframes the pharmacology: the gut microbiota is not a nuisance in the absorption path, it is part of the activation step, and it also means the effect size should vary with a person\'s microbiome. Almost no clinical trial in this literature stratifies for that.',
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
        title: 'No trial has measured a clinical event, and the trial base is geographically narrow',
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
          'What reaches the liver piles up inside the cell\'s power plants, because their electrical charge pulls the positively charged molecule in.',
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
          'Glucose lowering follows from AMPK-mediated suppression of gluconeogenesis. LDL lowering is a distinct mechanism: Kong et al. showed berberine stabilises LDL receptor mRNA through its 3\' untranslated region, raising receptor density without engaging the SREBP pathway statins work through.',
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
        statisticalPValue: 'Significant for glucose and lipid parameters; see paper for per-outcome values',
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
        a: 'Yes, and this is the practical safety issue rather than direct toxicity. Berberine inhibits CYP3A4 and CYP2D6, the enzymes that clear a large share of prescription drugs, so it can raise the blood level of a co-administered medicine without anyone changing that medicine\'s dose. It is not a substance to add silently alongside a prescription.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'Yin J, Xing H, Ye J. Efficacy of berberine in patients with type 2 diabetes mellitus. Metabolism 2008;57:712-717',
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
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Curcumin — a bioavailability problem most trials never addressed, and a medicinal-chemistry
  // paper that reframed the whole literature.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'curcumin',
    name: 'Curcumin',
    tradeName: 'Sold as turmeric extract, and as branded complexes including Meriva, BCM-95 and Theracurmin',
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
          typicalCost: 'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: fast, cheap, thoroughly characterised. Cons: gastrointestinal and renal risk with chronic use, which is exactly the reason people look for an alternative.',
        },
        {
          name: 'Intra-articular corticosteroid injection',
          class: 'Glucocorticoid',
          howItCompares:
            'Acts directly at the joint rather than depending on absorption, which sidesteps the entire curcumin bioavailability problem. Short-lived effect and repeated injection carries its own cartilage concerns.',
          typicalCost: 'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: no absorption question, rapid relief. Cons: temporary, invasive, and not a long-term strategy.',
        },
      ],
      naturalFoods: [
        {
          name: 'Culinary turmeric',
          activeCompound: 'Curcumin, demethoxycurcumin and bisdemethoxycurcumin, roughly 2 to 5% of the rhizome',
          biologicalMechanism:
            'The same curcuminoids at food concentration. The important point is arithmetic: a standardised 95% extract capsule contains an order of magnitude more curcuminoid than a culinary portion of the spice, so trial results on the extract do not transfer to the kitchen.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Black pepper (Piper nigrum) alongside turmeric',
          activeCompound: 'Piperine',
          biologicalMechanism:
            'Piperine inhibits intestinal and hepatic glucuronidation, the main route by which curcumin is cleared. Shoba et al. measured a 2,000% increase in curcumin bioavailability in human volunteers when 20 mg piperine was co-administered with 2 g curcumin.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'The Shoba 1998 human arm co-administered 20 mg piperine with 2 g curcumin, which is the origin of the pairing now standard in supplements',
          monthlyCost: 'Not priced here — no published cost figure to cite',
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
            'Measure apparent permeability across a differentiated Caco-2 monolayer, with and without piperine, to reproduce the absorption limit rather than assume it away. This step exists because the compound\'s central clinical problem is here, not at the target.',
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
          'Wang et al. randomised 70 participants with symptomatic knee osteoarthritis and ultrasound-detected effusion-synovitis to Curcuma longa extract or placebo for 12 weeks. The extract group reported greater improvement in knee pain on the visual analogue scale, the trial\'s co-primary symptomatic endpoint.',
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
        title: 'A 2017 medicinal-chemistry review reclassified curcumin as an assay-interference compound',
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
        title: 'Curcumin did not slow Alzheimer\'s disease in a randomised trial',
        laymanSummary:
          'A 24-week trial in Alzheimer\'s patients found no cognitive benefit, and plasma levels of the drug were very low.',
        technicalDetails:
          'Ringman et al. randomised patients with mild-to-moderate Alzheimer\'s disease to oral curcumin at 2 g or 4 g daily, or placebo, for 24 weeks with a 24-week open-label extension. There was no difference in cognitive or biomarker outcomes. Native curcumin was largely undetectable in plasma, with only conjugated metabolites present, which is the pharmacokinetic finding that makes the negative efficacy result unsurprising rather than mysterious.',
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
        measuredMetric: 'Adjudicated cases of hepatocellular liver injury attributed to turmeric products',
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
        laymanDesc:
          'In cells and in some human trials, markers of inflammation come down.',
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
        trialId: 'Ringman 2012 (oral curcumin in Alzheimer\'s disease)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 36,
        primaryEndpoint: 'Tolerability and change in cognitive and biomarker measures over 24 weeks',
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
        'Alzheimer\'s disease: no cognitive or biomarker benefit over 24 weeks, with native curcumin undetectable in plasma',
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
        label: 'Anand P et al. Bioavailability of curcumin: problems and promises. Mol Pharm 2007;4:807-818',
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
          'Ringman JM et al. Oral curcumin for Alzheimer\'s disease: tolerability and efficacy in a 24-week randomized, double blind, placebo-controlled study. Alzheimers Res Ther 2012;4:43',
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
    patientFriendlyIndication: 'Marketed for stress and sleep; legal status differs between countries',
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
          typicalCost: 'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: regulatory review, clinician-rated endpoints, known interaction profile. Cons: sexual and gastrointestinal side effects, discontinuation symptoms.',
        },
        {
          name: 'Cognitive behavioural therapy',
          class: 'Structured psychological therapy',
          howItCompares:
            'Has the largest randomised evidence base of anything in this comparison and no hepatotoxicity signal. It costs time rather than money and is the only option here that changes behaviour rather than a blood measurement.',
          typicalCost: 'Not priced here — no published cost figure is cited on this page',
          prosAndCons: 'Pros: durable effect, no drug interaction. Cons: access, waiting lists, effort.',
        },
      ],
      naturalFoods: [
        {
          name: 'Regular aerobic exercise',
          activeCompound: 'Not applicable',
          biologicalMechanism:
            'Acute exercise raises cortisol and chronic training lowers resting cortisol reactivity, alongside effects on sleep architecture that ashwagandha trials do not attempt to control for.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: 'Not stated here — this page gives no prescriptive guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Consistent sleep timing',
          activeCompound: 'Not applicable',
          biologicalMechanism:
            'Cortisol follows a circadian rhythm with a morning peak. Irregular sleep timing flattens and shifts that curve, and morning serum cortisol — the endpoint most ashwagandha trials use — is directly sensitive to it.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: 'Not stated here — this page gives no prescriptive guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
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
        title: 'Nine randomised trials, 558 patients: perceived stress, anxiety and cortisol all fell',
        laymanSummary:
          'Pooling the randomised evidence, ashwagandha lowered self-rated stress, a clinician-rated anxiety scale, and the stress hormone in blood.',
        technicalDetails:
          'A 2024 systematic review and meta-analysis of nine randomised controlled trials in 558 patients found significant effects on the Perceived Stress Scale (MD -4.72, 95% CI -8.45 to -0.99), the Hamilton Anxiety Scale (MD -2.19, 95% CI -3.83 to -0.55) and serum cortisol (MD -2.58, 95% CI -4.99 to -0.16) against placebo. Four of the included studies reported mild to moderate adverse events. The confidence intervals are wide and the trial base is small, but the direction is consistent across three different kinds of measurement.',
        evidenceSource: 'Arumugam V et al. Explore (NY) 2024;20:103062',
        doi: '10.1016/j.explore.2024.103062',
        measuredMetric: 'Perceived Stress Scale, Hamilton Anxiety Scale and serum cortisol versus placebo',
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
        evidenceSource: 'Chandrasekhar K, Kapoor J, Anishetty S. Indian J Psychol Med 2012;34:255-262',
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
          'The body\'s stress hormone system runs quieter. The step at which the extract acts has not been pinned down in humans.',
        molecularDetail:
          'Proposed mechanisms include GABA-A receptor modulation, glucocorticoid receptor interaction and direct effects on adrenal steroidogenesis. None has been demonstrated at a human-achievable concentration, and the extract is a mixture, so a single-target account may not be the right shape of explanation.',
        iconName: 'Network',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Serum cortisol falls',
        laymanDesc:
          'The measurable consequence is less cortisol in the blood.',
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
        primaryEndpoint: 'Change in standard stress-assessment scale scores and serum cortisol at day 60',
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
        primaryEndpoint: 'Pooled effect on Perceived Stress Scale, Hamilton Anxiety Scale and serum cortisol',
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
      'Eleven placebo-controlled trials, moderate to good methodological quality, effects reported on physical and mental performance — and, in the systematic review\'s own words, a lack of independent replication of any single one of them.',
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
          typicalCost: 'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: larger effect, regulatory approval, decades of use. Cons: twice the adverse event rate of rhodiola in the one trial that measured both.',
        },
        {
          name: 'Caffeine',
          class: 'Adenosine receptor antagonist',
          howItCompares:
            'The best-characterised acute anti-fatigue compound in existence, with dose-response data rhodiola does not have. It is also the substance most rhodiola trial participants were already using, which very few of those trials controlled for.',
          typicalCost: 'Not priced here — no published cost figure is cited on this page',
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
          dailyUsage: 'Not stated here — this page gives no prescriptive guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
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
        measuredMetric: 'Composite fatigue index from cognitive performance tasks during night duty',
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
        laymanDesc:
          'People who are tired for a specific reason score better on the tests.',
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
      'L-theanine looks enough like glutamate, the brain\'s main excitatory signal, to be carried into the brain by the same transporter. Once there it interacts weakly with glutamate receptors and shifts the balance toward inhibition, which shows up on an EEG as increased alpha-wave activity — the pattern associated with relaxed wakefulness rather than drowsiness. Paired with caffeine, the combination reliably outperforms caffeine alone on attention tasks in the laboratory.',
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
            'First-line for chronic insomnia in every major guideline, with durable effects that outlast treatment. L-theanine\'s sleep evidence is a four-week crossover trial in 30 people using a self-report questionnaire.',
          typicalCost: 'Not priced here — no published cost figure is cited on this page',
          prosAndCons:
            'Pros: durable, no pharmacology, guideline-recommended. Cons: requires several weeks of structured effort and access to a therapist or programme.',
        },
      ],
      naturalFoods: [
        {
          name: 'Green tea',
          activeCompound: 'L-theanine at roughly 1 to 2% of dry leaf, alongside caffeine and catechins',
          biologicalMechanism:
            'Delivers theanine and caffeine together, which is the pairing the combination trials test. The EFSA opinion that rejected the L-theanine claims was specifically about L-theanine from Camellia sinensis, which is to say about this.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
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
        measuredMetric: 'PSQI, STAI-trait, SDS, verbal fluency and executive function over four weeks',
        auditFlag: 'caution',
      },
      {
        id: 'the-a3',
        category: 'failed',
        title: 'EFSA rejected every health claim submitted for L-theanine',
        laymanSummary:
          'Europe\'s food safety regulator looked at the claims for cognition, stress, sleep and menstrual discomfort and concluded that none of them was supported.',
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
          'Williams et al. reviewed the evidence for L-theanine consumption and the ability to manage stress and anxiety, and found supportive signals across acute-stress paradigms alongside considerable heterogeneity in dose, format and outcome measure, with few trials in clinically anxious populations. The review\'s value here is as a boundary: the case is for acute, situational stress in healthy people, not for anxiety as a diagnosis.',
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
        statisticalPValue: 'P = 0.019 SDS, P = 0.006 STAI-trait, P = 0.013 PSQI, P = 0.001 verbal fluency',
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
    ],
  },
]
