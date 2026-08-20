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
]
