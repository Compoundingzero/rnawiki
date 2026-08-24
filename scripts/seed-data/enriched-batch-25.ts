import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the statins and the cardiovascular staples that predate them: the
 * five HMG-CoA reductase inhibitors that are not atorvastatin or rosuvastatin, the cardiac
 * glycoside that has been prescribed since the eighteenth century, the two nitrates, the central
 * alpha-2 agonist and the direct arterial vasodilator.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES, molecular weight — are copied from the enriched record rather than
 * researched again.
 *
 * Every DOI, PMID, NCT number and FDA application number below was resolved against the NCBI
 * E-utilities, the Crossref API, the ClinicalTrials.gov registry or the openFDA label endpoint at
 * the time of writing. Sample sizes, hazard ratios, confidence intervals and p-values are copied
 * from the published abstract or the FDA label, never from memory. Where a number could not be
 * sourced, the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. A CHOLESTEROL NUMBER IS A SURROGATE. LDL cholesterol is what four of these drugs are licensed
 *    on and what most of their trials measured. Deaths and infarctions are what a reader cares
 *    about, and the two are not the same measurement. Simvastatin, pravastatin and lovastatin each
 *    have hard-endpoint trials and they are on the page; fluvastatin and pitavastatin do not, and
 *    those pages say so in the first sentence.
 *
 * 2. A CLASS EFFECT IS AN INFERENCE, NOT A MEASUREMENT. The statins share a mechanism and do not
 *    share an evidence base. Pravastatin has four outcome trials and one of them failed;
 *    pitavastatin has an outcome trial only in people living with HIV; fluvastatin has two
 *    modest ones in populations nobody else studied. Every page that borrows evidence from a
 *    sibling molecule names the molecule the evidence came from.
 *
 * 3. PRICING IS A PRICE, NOT A COST. Every price here is the CMS National Average Drug Acquisition
 *    Cost — what a United States retail pharmacy pays a wholesaler — and is labelled as such.
 *    `synthesisCostPerDose` is empty on every dossier in this file: the cost-of-production
 *    literature for the WHO Essential Medicines List publishes a method and an aggregate, and its
 *    per-molecule cardiovascular figures sit in a supplementary appendix that could not be
 *    resolved and verified at the time of writing. An unverified cost is worse than an absent one.
 *
 * 4. NO DOSING, TITRATION, MONITORING OR PROCUREMENT GUIDANCE. Strengths and titration schedules
 *    appear only where they are part of a trial’s description or a product’s identity. Nothing here
 *    tells a reader what to take, how to move between doses, or where to obtain it.
 *
 * 5. THE MOST INSTRUCTIVE RECORDS IN THIS GROUP ARE THE DOSES AND INDICATIONS THAT WERE TAKEN
 *    BACK. Simvastatin 80 mg was approved and then restricted by the regulator that approved it.
 *    Digoxin was given for two centuries before a placebo-controlled trial measured its effect on
 *    mortality and found none. Clonidine was given before surgery to prevent heart attacks until a
 *    10,010-patient trial found it caused more of them. Those stories are on their pages at the
 *    same weight as the successes, because that is what an evidence audit is for.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group. It publishes an estimation method over 148 medicines and an aggregate result; its per-molecule cardiovascular figures are in a supplementary appendix that could not be resolved at the time of writing, so no per-dose cost is stated on these pages',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_25_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Simvastatin — the trial that ended the cholesterol argument, and the dose the regulator
  //    approved and then took back.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'simvastatin',
    name: 'Simvastatin',
    tradeName: 'Zocor / Flolipid',
    sponsor:
      'Organon (current holder of NDA 019766, transferred from Merck Sharp & Dohme); generic in the United States since 2006 and made by many manufacturers',
    targetGene: 'HMGCR',
    targetProtein:
      '3-hydroxy-3-methylglutaryl-coenzyme A reductase, inhibited not by simvastatin itself but by simvastatin acid, the open β-hydroxyacid formed after the lactone ring is hydrolysed in the body',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1991,
    indication:
      'To reduce the risk of total mortality by reducing coronary heart disease death, non-fatal myocardial infarction and stroke, and the need for coronary and non-coronary revascularisation, in adults with established coronary, cerebrovascular or peripheral vascular disease or diabetes who are at high risk of coronary events; and as an adjunct to diet to reduce LDL cholesterol in primary hyperlipidaemia, heterozygous and homozygous familial hypercholesterolaemia, primary dysbetalipoproteinaemia and hypertriglyceridaemia',
    patientFriendlyIndication:
      'High cholesterol, and the prevention of heart attacks and strokes in people who already have vascular disease or diabetes',
    anatomicalSite:
      'Hepatocyte cytoplasm — the endoplasmic reticulum membrane of the liver cell, where HMG-CoA reductase sits, reached through the OATP1B1 transporter',
    conditionContext: {
      conditionExplainer:
        'Cholesterol is not a disease. It is a molecule the body needs and makes, and the problem is the LDL particles that carry it: at high enough numbers, for long enough, they lodge in artery walls and build the plaque that eventually ruptures and blocks the vessel. Nothing about the number hurts. The rupture does.',
      whyItMatters:
        'Before 1994 it was genuinely uncertain whether lowering cholesterol with a drug made anyone live longer. Earlier cholesterol-lowering trials had reduced heart attacks while total deaths stayed flat or drifted up, and a serious body of opinion held that the drugs were trading cardiac deaths for other ones. Simvastatin is the molecule that settled the argument, in the trial described below.',
      whoTakesThis:
        'Adults with established coronary, cerebrovascular or peripheral arterial disease, adults with diabetes at high coronary risk, and adults and children from age ten with familial hypercholesterolaemia.',
      clinicalGoals:
        'A lower LDL cholesterol is the measurement. Fewer deaths and fewer infarctions is the point, and for this molecule both have been measured in trials with tens of thousands of people.',
    },
    oneSentenceVerdict:
      'The statin that ended the argument about whether lowering cholesterol saves lives — 4S cut all-cause death from 12% to 8% in 4,444 people with coronary disease (RR 0.70, 95% CI 0.58 to 0.85, p=0.0003) — and the same molecule at 80 mg caused myopathy in 0.9% against 0.03% at 20 mg while failing to significantly reduce vascular events, which is why the FDA restricted the highest dose it had itself approved.',
    laymanHowItWorks:
      'Most of the cholesterol in your blood is not eaten, it is manufactured, mostly by the liver, and simvastatin blocks the slowest step in that assembly line. Starved of the cholesterol it used to make, the liver cell responds by putting more LDL receptors on its surface — hooks that pull cholesterol-carrying particles out of the bloodstream. The blood level falls because the liver is now removing LDL faster, not because anything was blocked in the artery. The tablet you swallow is not the active drug: it is a closed-ring form that has to be opened by the body into simvastatin acid before it inhibits anything.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0314 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 90 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in December 1991 under NDA 019766 and generic since June 2006. The brand is no longer marketed in the 5 mg or 80 mg strengths at all, so the dose that produced the myopathy signal is now only obtainable as a generic, and only in people who have already tolerated it for a year.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Simvastatin is among the cheapest drugs in medicine and among the best evidenced, and its weakness is specific rather than general: it is metabolised by CYP3A4, so it collides with a long list of common drugs, and its own high dose is restricted. Where those collisions matter, the alternatives are the statins that are not CYP3A4 substrates.',
      conventionalRx: [
        {
          name: 'Atorvastatin (Lipitor)',
          class: 'HMG-CoA reductase inhibitor',
          howItCompares:
            'Lowers LDL further at equivalent tablet strengths and has its own large outcome trials, so it is the usual replacement where simvastatin 40 mg is not enough. It is also a CYP3A4 substrate, so it does not solve the interaction problem — it only moves it, because its plasma levels rise less steeply than simvastatin’s do.',
          typicalCost:
            'US$0.0281 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 278 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: higher LDL reduction per tablet; no dose restriction. Cons: still a CYP3A4 substrate; the same class-wide muscle and glycaemia signals.',
        },
        {
          name: 'Pravastatin (Pravachol)',
          class: 'HMG-CoA reductase inhibitor, not metabolised by CYP3A4',
          howItCompares:
            'Weaker on LDL and much cleaner on interactions: pravastatin is not a significant CYP3A4 substrate, so the azole antifungals, macrolides and protease inhibitors that are contraindicated with simvastatin are not contraindicated with it. It has its own mortality trials in three separate populations.',
          typicalCost:
            'US$0.0620 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 93 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: far fewer drug interactions; hard-endpoint trials of its own. Cons: about twice the acquisition price for less LDL lowering per milligram.',
        },
        {
          name: 'Ezetimibe (Zetia)',
          class: 'Cholesterol absorption inhibitor at NPC1L1',
          howItCompares:
            'Added to simvastatin it lowers LDL further, and the two trials that tested whether that extra lowering does anything disagreed in an instructive way: ENHANCE found no improvement in carotid wall thickness, IMPROVE-IT later found a 2.0 percentage point absolute reduction in cardiovascular events over seven years. It is what a doctor reaches for when a statin alone is not enough or is not tolerated.',
          typicalCost:
            'US$0.2278 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 87 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no muscle toxicity signal of its own; works by a different mechanism. Cons: small effect alone; the outcome benefit added to a statin is real but modest.',
        },
      ],
      naturalFoods: [
        {
          name: 'Red yeast rice',
          activeCompound: 'Monacolin K, which is chemically identical to lovastatin',
          biologicalMechanism:
            'EFSA states that monacolin K in lactone form is identical to lovastatin, the active ingredient of authorised prescription medicines. It is produced by the mould Monascus purpureus grown on rice, inhibits HMG-CoA reductase by the same mechanism as simvastatin, and carries the same muscle and liver risks.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the European Food Safety Authority concluded in 2018 that it was unable to identify a dietary intake of monacolins from red yeast rice that does not give rise to concerns about harmful effects to health, having received individual case reports of severe muscle and liver injury at intakes as low as 3 mg a day. A product sold as a supplement that delivers a statin is a drug with none of a drug’s controls.',
          monthlyCost: '',
        },
        {
          name: 'Plant sterols and stanols — fortified spreads, oats, nuts, seeds',
          activeCompound: 'β-sitosterol, campesterol, sitostanol',
          biologicalMechanism:
            'Structurally similar to cholesterol, they compete with it for space in the intestinal micelle and reduce how much is absorbed — the same target as ezetimibe by a cruder route. This is additive to a statin, because a statin blocks synthesis and this blocks absorption.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the LDL reductions reported in randomised trials of sterol-fortified foods are in the region of 5 to 10%, against about 35% for simvastatin in 4S, and no trial of plant sterols has reported a cardiovascular outcome.',
          monthlyCost: '',
        },
        {
          name: 'Soluble fibre — oat β-glucan, barley, psyllium, legumes',
          activeCompound: 'β-glucan and other viscous soluble fibres',
          biologicalMechanism:
            'Viscous fibre traps bile acids in the gut so they are excreted rather than reabsorbed. The liver must then make new bile acids out of cholesterol, which draws down its cholesterol pool and, as with a statin, prompts more LDL receptors on the cell surface. The final step of the mechanism is the same one simvastatin exploits.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the effect measured in randomised trials is a few percent on LDL, an order of magnitude smaller than a statin, and no fibre trial has reported a mortality outcome.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Leave grapefruit out of it',
          action: 'Avoid grapefruit and grapefruit juice while taking simvastatin.',
          patientImpact:
            'Simvastatin is metabolised by CYP3A4, and grapefruit contains furanocoumarins that inactivate intestinal CYP3A4 irreversibly. The enzyme has to be resynthesised, so the effect lasts long after the juice is gone and cannot be dodged by spacing the doses apart.',
          clinicalPrecaution:
            'The label contraindicates simvastatin with strong CYP3A4 inhibitors — selected azole antifungals, macrolide antibiotics, antivirals and nefazodone — and separately with ciclosporin, danazol and gemfibrozil. Grapefruit belongs to the same mechanism, not to a separate folk category.',
        },
        {
          name: 'Report muscle pain rather than tolerating it',
          action:
            'Say so promptly if muscles become unexplainedly painful, tender or weak, particularly with malaise or fever.',
          patientImpact:
            'The label defines the thing being watched for: unexplained muscle weakness, pain or tenderness with creatine kinase above ten times the upper limit of normal. In 24,747 treated patients followed a median four years the incidence was about 0.03% at 20 mg, 0.08% at 40 mg and 0.61% at 80 mg.',
          clinicalPrecaution:
            'Risk is higher at 65 and over, in uncontrolled hypothyroidism, in renal impairment, with interacting drugs and at higher doses, and the label records that Chinese patients may be at higher risk.',
        },
        {
          name: 'Ask whether the 80 mg tablet is still appropriate',
          action:
            'If you are on 80 mg, ask when it was started and whether it is being continued under the restriction.',
          patientImpact:
            'The label restricts the 80 mg daily dosage to patients who have already been taking simvastatin 80 mg chronically — twelve months or more — without evidence of muscle toxicity. It is not a dose that is started in anyone, including people already on a lower dose of the same drug.',
          clinicalPrecaution:
            'The maximum recommended dosage of the brand is now 40 mg once daily, and the label directs that patients needing a high-intensity statin be given a different LDL-lowering treatment instead.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CCC(C)(C)C(=O)O[C@H]1C[C@H](C=C2[C@H]1[C@H]([C@H](C=C2)C)CC[C@@H]3C[C@H](CC(=O)O3)O)C',
      chemicalFormula: 'C25H38O5',
      molecularWeight: '418.60 g/mol',
      targetReceptorAffinity:
        'A lactone prodrug. The label states that simvastatin is hydrolysed in vivo to its active β-hydroxyacid form, simvastatin acid, and that this acid and its metabolites inhibit HMG-CoA reductase. Both simvastatin and the acid metabolite are about 95% bound to human plasma protein. First-pass extraction by the liver is extensive, so systemic availability of the parent is under 5% — the drug is designed to be captured by the organ it acts on. Metabolism is by CYP3A4, and 13% of an oral dose is excreted in urine against 60% in faeces.',
      structureSource: {
        label:
          'PubChem CID 54454 (simvastatin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; prodrug hydrolysis, protein binding and metabolic route from the ZOCOR label, section 12',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54454',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'sim-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Measure the lactone-to-acid ratio, not just the assay',
          description:
            'Simvastatin is supplied as the closed lactone and is active only as the open hydroxyacid. The two interconvert with pH and moisture, so a bulk sample that assays correctly for total simvastatin can carry a different proportion of the ring-opened acid than the reference material. Since the acid is the species that inhibits the enzyme and also the species associated with the muscle signal, the ratio is a specification, not a curiosity.',
          reagentsAndBuffer:
            'Simvastatin USP reference standard, reversed-phase HPLC with separate lactone and hydroxyacid peaks, ammonium acetate buffer at controlled pH, Karl Fischer titration for water content, forced-degradation samples at acid and alkaline pH as system suitability',
        },
        {
          id: 'sim-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Exchange the side chain on a fungal natural product',
          description:
            'Simvastatin is not built from scratch. It is made from lovastatin, a metabolite of Aspergillus terreus, by replacing the 2-methylbutyryl ester side chain with a 2,2-dimethylbutyryl one — a single added methyl group that is the entire chemical difference between the two marketed drugs. Classically this is done by hydrolysing the ester off, protecting the lactone and the hydroxyl, re-acylating, then deprotecting; the enzymatic route using an acyltransferase does it in one step.',
          dependsOnStepId: 'sim-w1',
          reagentsAndBuffer:
            'Lovastatin from Aspergillus terreus fermentation, lithium amide or a comparable base for α-methylation of the ester, tert-butyldimethylsilyl protection of the C13 hydroxyl, 2,2-dimethylbutyryl chloride, tetrabutylammonium fluoride for deprotection, anhydrous tetrahydrofuran under nitrogen',
        },
        {
          id: 'sim-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Remove residual lovastatin and the dimeric impurities',
          description:
            'The starting material and the product differ by fourteen mass units and chromatograph closely, so residual lovastatin is the impurity that matters, and it is itself an active statin. Anhydro and dimeric degradants form under acid. Release testing has to resolve all of them from the parent, which is why the specification is a chromatographic profile rather than a single assay number.',
          dependsOnStepId: 'sim-w2',
          reagentsAndBuffer:
            'Crystallisation from methanol or acetonitrile-water, preparative reversed-phase chromatography where required, butylated hydroxyanisole as antioxidant in the finished formulation, HPLC release testing against USP-specified related-substance limits',
        },
        {
          id: 'sim-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Test hepatocyte uptake across SLCO1B1 genotypes',
          description:
            'Simvastatin acid does not diffuse into the hepatocyte; it is carried in by OATP1B1, the transporter encoded by SLCO1B1. The rs4149056 C allele reduces that transport, keeps the acid in the circulation and is the single strongest genetic predictor of statin myopathy known. An uptake assay run only in wild-type cells measures the drug in the people least likely to be harmed by it.',
          dependsOnStepId: 'sim-w3',
          reagentsAndBuffer:
            'HEK293 or CHO cells stably expressing wild-type OATP1B1 and the rs4149056 (Val174Ala) variant, sandwich-cultured primary human hepatocytes as the orthogonal system, radiolabelled or LC-MS/MS-quantified simvastatin acid, rifampicin as the transport inhibitor control',
        },
        {
          id: 'sim-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Inhibit the enzyme with the acid, and count LDL receptors as the real readout',
          description:
            'The enzyme assay must use simvastatin acid, because the lactone that is dispensed inhibits almost nothing. The clinically meaningful readout is one step further on: LDL receptor upregulation on the hepatocyte surface and the LDL uptake that follows, which is what actually lowers blood cholesterol. An enzyme IC50 alone reports potency at a target and says nothing about the receptor response that produces the effect.',
          dependsOnStepId: 'sim-w4',
          reagentsAndBuffer:
            'Recombinant human HMG-CoA reductase catalytic domain, HMG-CoA and NADPH with absorbance readout at 340 nm, simvastatin acid prepared by controlled alkaline hydrolysis of the lactone, HepG2 cells for LDLR surface quantification by flow cytometry and fluorescent-LDL uptake',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sim-a1',
        category: 'measured',
        title: '4S: the first trial in which cholesterol lowering reduced total mortality',
        laymanSummary:
          'Four and a half thousand people with heart disease took simvastatin or placebo for five and a half years. Twelve per cent of the placebo group died against eight per cent on the drug. That gap is the reason statins are prescribed.',
        technicalDetails:
          '4S randomised 4,444 patients with angina or previous myocardial infarction and serum cholesterol 5.5 to 8.0 mmol/L on a lipid-lowering diet to double-blind simvastatin or placebo. Over a median 5.4 years, simvastatin produced mean changes of −25% in total cholesterol, −35% in LDL cholesterol and +8% in HDL. 256 patients (12%) in the placebo group died against 182 (8%) on simvastatin: relative risk of death 0.70 (95% CI 0.58 to 0.85, p=0.0003). Coronary deaths were 189 against 111 (RR 0.58, 95% CI 0.46 to 0.73), while non-cardiovascular deaths were 49 and 46 — the trial did not trade cardiac deaths for other ones, which is precisely what the earlier cholesterol-lowering literature had been accused of. Major coronary events occurred in 622 (28%) against 431 (19%), RR 0.66 (95% CI 0.59 to 0.75, p<0.00001).',
        evidenceSource:
          'Scandinavian Simvastatin Survival Study Group. Lancet 1994;344:1383-1389 (4S)',
        doi: '10.1016/S0140-6736(94)90566-5',
        measuredMetric:
          'All-cause mortality over a median 5.4 years in 4,444 patients with coronary heart disease',
        auditFlag: 'verified',
      },
      {
        id: 'sim-a2',
        category: 'conclusion_shift',
        title: 'The Heart Protection Study moved the target from a number to a risk',
        laymanSummary:
          'Twenty thousand high-risk people were given simvastatin or placebo regardless of their cholesterol. The benefit was the same in people whose cholesterol was already low as in people whose cholesterol was high. Treatment stopped being about the number on the test.',
        technicalDetails:
          'HPS randomised 20,536 UK adults aged 40 to 80 with coronary disease, other occlusive arterial disease or diabetes to 40 mg simvastatin daily or placebo for five years. All-cause mortality was 1,328 (12.9%) against 1,507 (14.7%), p=0.0003, driven by an 18% proportional reduction in coronary death (5.7% against 6.9%, p=0.0005). Major vascular events fell 24% (95% CI 19 to 28): 2,033 (19.8%) against 2,585 (25.2%), p<0.0001. The proportional reduction was similar and significant in every subgroup, including — the authors flagged this as most notable — participants presenting with LDL cholesterol below 3.0 mmol/L (116 mg/dL) or total cholesterol below 5.0 mmol/L. The conclusion the field drew, and now acts on, is that the size of the benefit depends chiefly on overall vascular risk rather than on blood lipid concentration. The annual excess risk of myopathy on this regimen was about 0.01%.',
        evidenceSource: 'Heart Protection Study Collaborative Group. Lancet 2002;360:7-22',
        doi: '10.1016/S0140-6736(02)09327-3',
        measuredMetric:
          'Major vascular events and all-cause mortality in 20,536 high-risk adults, stratified by baseline LDL cholesterol',
        auditFlag: 'verified',
      },
      {
        id: 'sim-a3',
        category: 'failed',
        title:
          'SEARCH: four times the dose, thirty times the myopathy, no significant extra benefit',
        laymanSummary:
          'Twelve thousand heart attack survivors were randomised to 80 mg or 20 mg of the same drug. The higher dose lowered cholesterol a little further and did not significantly reduce events. It caused muscle injury in about one in a hundred people against one in five thousand.',
        technicalDetails:
          'SEARCH randomised 12,064 men and women aged 18 to 80 with a history of myocardial infarction to 80 mg or 20 mg simvastatin daily. Over a mean 6.7 years, 80 mg produced an average 0.35 mmol/L greater LDL reduction. Major vascular events occurred in 1,477 (24.5%) on 80 mg against 1,553 (25.7%) on 20 mg — a 6% proportional reduction, risk ratio 0.94 (95% CI 0.88 to 1.01), p=0.10. Vascular deaths were 565 (9.4%) against 572 (9.5%). Against two (0.03%) cases of myopathy on 20 mg there were 53 (0.9%) on 80 mg. The authors were careful about what this does and does not show: a 6% event reduction for 0.35 mmol/L is consistent with the rest of the statin literature, so the trial is not evidence that further LDL lowering fails — it is evidence that this molecule is the wrong vehicle for it, and the interpretation says so, that intensive LDL lowering can be achieved safely with other regimens.',
        evidenceSource: 'SEARCH Collaborative Group. Lancet 2010;376:1658-1669',
        doi: '10.1016/S0140-6736(10)60310-8',
        measuredMetric:
          'Major vascular events and myopathy incidence, 80 mg against 20 mg simvastatin, mean 6.7 years',
        auditFlag: 'caution',
      },
      {
        id: 'sim-a4',
        category: 'conclusion_shift',
        title: 'The regulator restricted a dose it had approved',
        laymanSummary:
          'The 80 mg tablet was approved, marketed and widely prescribed. In 2011 the FDA said it should not be started in anyone new, and the brand no longer makes it at all.',
        technicalDetails:
          'The current ZOCOR label states that an 80 mg daily dosage is restricted to patients who have been taking simvastatin 80 mg daily chronically, for twelve months or more, without evidence of muscle toxicity, and that the maximum recommended dosage is 40 mg once daily. It records that in 24,747 treated patients followed a median four years, myopathy incidence was approximately 0.03% at 20 mg, 0.08% at 40 mg and 0.61% at 80 mg, and that in the 12,064-patient SEARCH population it was 0.02% at 20 mg and 0.9% at 80 mg, with rhabdomyolysis at approximately 0% and 0.4%. The label further directs that patients who need a high-intensity statin be prescribed a different LDL-lowering treatment rather than a higher simvastatin dose, and states that the brand is no longer marketed in the 5 mg and 80 mg strengths. A dose that a regulator approves and then withdraws from new starts is the clearest kind of evidence audit there is: the harm was dose-dependent, it was measurable, and it took a 12,000-patient trial to make it visible against a background rate of one in five thousand.',
        evidenceSource:
          'ZOCOR (simvastatin) United States prescribing information, sections 2.1 and 5.1 (NDA 019766)',
        measuredMetric:
          'Dose-stratified myopathy and rhabdomyolysis incidence, and the resulting change to the licensed maximum dose',
        auditFlag: 'caution',
      },
      {
        id: 'sim-a5',
        category: 'measured',
        title: 'One common gene variant explains most of the muscle injury',
        laymanSummary:
          'A genome-wide search across people who developed muscle injury on high-dose simvastatin found a single culprit: a variant in the gene for the transporter that carries the drug into the liver. Fifteen per cent of people carry it, and it accounts for more than sixty per cent of the cases.',
        technicalDetails:
          'The SEARCH Collaborative Group scanned about 300,000 markers in 85 subjects with definite or incipient myopathy against 90 controls, all taking 80 mg simvastatin daily within the 12,000-patient trial. A single strong association emerged at rs4363657 in SLCO1B1 on chromosome 12 (p=4×10⁻⁹), in near-complete linkage disequilibrium (r²=0.97) with the nonsynonymous rs4149056. SLCO1B1 encodes OATP1B1, which carries statins into the hepatocyte. The C allele prevalence was 15%; the odds ratio for myopathy was 4.5 (95% CI 2.6 to 7.7) per copy and 16.9 (95% CI 4.7 to 61.1) for CC against TT homozygotes. More than 60% of myopathy cases in this population were attributable to the C variant, and the association replicated in a 20,000-participant trial of 40 mg simvastatin. The mechanism is coherent with everything else on this page: less hepatic uptake means more simvastatin acid left in the circulation, and the muscle is where it does damage.',
        evidenceSource: 'SEARCH Collaborative Group. N Engl J Med 2008;359:789-799',
        doi: '10.1056/NEJMoa0801936',
        measuredMetric:
          'Odds ratio for myopathy per copy of the SLCO1B1 rs4149056 C allele in a genome-wide association study',
        auditFlag: 'verified',
      },
      {
        id: 'sim-a6',
        category: 'failed',
        title: 'ENHANCE: more LDL lowering, no movement in the artery wall',
        laymanSummary:
          'Adding a second cholesterol drug to high-dose simvastatin lowered LDL by a further sixteen per cent. The thickness of the artery wall, which the trial was designed to measure, did not improve at all — if anything it went the other way.',
        technicalDetails:
          'ENHANCE randomised 720 patients with familial hypercholesterolaemia to 80 mg simvastatin plus either placebo or 10 mg ezetimibe for 24 months, with carotid intima-media thickness by B-mode ultrasound as the primary outcome. Mean change in carotid IMT was 0.0058 ± 0.0037 mm on simvastatin alone against 0.0111 ± 0.0038 mm on the combination (p=0.29) — numerically worse on the arm with lower cholesterol. End-of-study LDL was 192.7 mg/dL against 141.3 mg/dL, a 16.5% between-group difference, p<0.01, with greater reductions in triglycerides and C-reactive protein too. Every lipid measurement moved in the expected direction and the imaging surrogate did not follow. This does not mean ezetimibe fails — IMPROVE-IT later randomised 18,144 post-acute-coronary-syndrome patients to simvastatin 40 mg with or without ezetimibe and found a primary event rate of 32.7% against 34.7% at seven years (HR 0.936, 95% CI 0.89 to 0.99, p=0.016). Instead, the evidence shows that carotid intima-media thickness was not a reliable stand-in for events, and the field discovered that by being wrong in public.',
        evidenceSource: 'Kastelein JJP et al. N Engl J Med 2008;358:1431-1443 (ENHANCE)',
        doi: '10.1056/NEJMoa0800742',
        inferredClaim:
          'That a surrogate imaging endpoint — carotid intima-media thickness — tracks cardiovascular events closely enough to substitute for them',
        auditFlag: 'contested',
      },
      {
        id: 'sim-a7',
        category: 'inferred',
        title: 'The label now warns about blood sugar, which the mortality trials did not measure',
        laymanSummary:
          'Statins raise blood sugar slightly. The label says so. None of the big survival trials were designed to measure that, and it was added to the class label years after they finished.',
        technicalDetails:
          'The ZOCOR warnings section states that increases in HbA1c and fasting serum glucose have been reported with statins including simvastatin. This entry arrived through a class-wide labelling change long after 4S and HPS reported, and neither of those trials was powered or designed to detect it. What follows from that is a genuine asymmetry that a reader should hold in mind: the mortality benefit was measured prospectively in randomised trials with tens of thousands of participants, and the glycaemic signal was assembled afterwards from meta-analysis and surveillance. They are not equally strong measurements, and the direction of that inequality favours the benefit.',
        evidenceSource:
          'ZOCOR (simvastatin) United States prescribing information, section 5, Increases in HbA1c and Fasting Serum Glucose Levels (NDA 019766)',
        inferredClaim:
          'That the size of the glycaemic effect is known with the same confidence as the mortality effect, when one was a prespecified randomised endpoint and the other was not measured in the trials at all',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'What you swallow is not the drug',
        laymanDesc:
          'The tablet contains a closed-ring molecule that inhibits almost nothing. The body has to snap the ring open first, and the opened form is what does the work.',
        molecularDetail:
          'Simvastatin is a lactone prodrug hydrolysed in vivo to simvastatin acid, the β-hydroxyacid. The label states that the acid and its metabolites are the inhibitors of HMG-CoA reductase. Both parent and acid are about 95% plasma-protein bound.',
        iconName: 'Unlock',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver takes almost all of it out of the blood',
        laymanDesc:
          'On the first pass through the liver, most of the dose is captured before it ever reaches the rest of the body. That is deliberate: the liver is where it needs to be.',
        molecularDetail:
          'Extensive first-pass hepatic extraction leaves systemic availability of the parent below 5%. Uptake into the hepatocyte is carrier-mediated through OATP1B1, the product of SLCO1B1. Peak concentrations of active and total inhibitors are attained within 1.3 to 2.4 hours.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the slowest step in making cholesterol',
        laymanDesc:
          'Cholesterol is built in the liver along a long assembly line. Simvastatin acid jams the slowest station on that line, so the whole line backs up.',
        molecularDetail:
          'Simvastatin acid inhibits HMG-CoA reductase, the rate-limiting enzyme converting HMG-CoA to mevalonate, the committed precursor of cholesterol. The acid is a transition-state analogue of the substrate, which is why the open ring is required and the lactone is inert.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The liver responds by pulling cholesterol out of the blood',
        laymanDesc:
          'Short of cholesterol it can no longer make, the liver cell puts more hooks on its surface to grab cholesterol-carrying particles out of the bloodstream. That, not the blocked enzyme, is what lowers your blood level.',
        molecularDetail:
          'The label states that inhibition of HMG-CoA reductase accelerates expression of LDL receptors, followed by uptake of LDL-C from blood into the liver, decreasing plasma LDL-C and total cholesterol; sustained inhibition also decreases VLDL. Maximum LDL-C reduction is usually reached by four weeks and maintained thereafter.',
        iconName: 'Download',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer people die',
        laymanDesc:
          'In people who already have heart disease, that chain of events translates into measurably fewer deaths — the finding that made statins standard treatment.',
        molecularDetail:
          '4S: all-cause death 8% against 12% over a median 5.4 years in 4,444 patients, RR 0.70 (95% CI 0.58 to 0.85, p=0.0003). HPS: all-cause death 12.9% against 14.7% in 20,536 high-risk adults, p=0.0003, with major vascular events down 24% (19.8% against 25.2%, p<0.0001).',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The same route that carries it in decides who gets hurt',
        laymanDesc:
          'If the transporter that carries the drug into the liver works poorly, more of the active form stays in the bloodstream, and that is where the muscle injury comes from.',
        molecularDetail:
          'SLCO1B1 rs4149056 reduces OATP1B1-mediated hepatic uptake. Odds ratio for myopathy 4.5 (95% CI 2.6 to 7.7) per C allele copy, 16.9 (95% CI 4.7 to 61.1) for CC against TT; more than 60% of myopathy cases in the 80 mg population were attributable to the variant. Dose-stratified myopathy on the label: 0.03% at 20 mg, 0.08% at 40 mg, 0.61% at 80 mg.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: '4S — Scandinavian Simvastatin Survival Study (Lancet 1994;344:1383-1389)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 4444,
        primaryEndpoint:
          'All-cause mortality in patients with angina or previous myocardial infarction and serum cholesterol 5.5 to 8.0 mmol/L',
        endpointMet: true,
        statisticalPValue:
          '182 deaths (8%) against 256 (12%); relative risk 0.70 (95% CI 0.58 to 0.85), p=0.0003 over a median 5.4 years',
        unreportedAdverseSignals:
          'Non-cardiovascular deaths were 46 against 49 — the reduction in coronary death was not offset by a rise elsewhere, which was the specific fear the trial was designed to answer. Enrolment required cholesterol between 5.5 and 8.0 mmol/L, so the result does not by itself extend to people outside that range; HPS was the trial that tested that.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'HPS — MRC/BHF Heart Protection Study (Lancet 2002;360:7-22)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 20536,
        primaryEndpoint:
          'Mortality overall, and fatal or non-fatal vascular events by subcategory, in adults with occlusive arterial disease or diabetes',
        endpointMet: true,
        statisticalPValue:
          'All-cause mortality 12.9% against 14.7%, p=0.0003; major vascular events 19.8% against 25.2%, a 24% proportional reduction (95% CI 19 to 28), p<0.0001',
        unreportedAdverseSignals:
          'The reduction in major vascular events was not significant during the first year and became highly significant in every subsequent year, so a short trial of the same drug would have reported a null result. Average compliance was 85% and 17% of the placebo group took a non-study statin, so the intention-to-treat comparison understates the effect of actually taking the drug.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SEARCH (Lancet 2010;376:1658-1669; ISRCTN74348595)',
        phase: 'Phase 3, randomised, double-blind, active-controlled dose comparison',
        sampleSize: 12064,
        primaryEndpoint:
          'Major vascular events — coronary death, myocardial infarction, stroke or arterial revascularisation — with 80 mg against 20 mg simvastatin daily',
        endpointMet: false,
        statisticalPValue:
          '24.5% against 25.7%; risk ratio 0.94 (95% CI 0.88 to 1.01), p=0.10 over a mean 6.7 years, for an average 0.35 mmol/L greater LDL reduction',
        unreportedAdverseSignals:
          'Myopathy in 53 (0.9%) on 80 mg against two (0.03%) on 20 mg. The FDA subsequently restricted the 80 mg dose to patients already tolerating it for twelve months or more, and the brand stopped marketing that strength.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ENHANCE (N Engl J Med 2008;358:1431-1443; NCT00552097)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled add-on',
        sampleSize: 720,
        primaryEndpoint:
          'Change in mean carotid-artery intima-media thickness over 24 months, simvastatin 80 mg plus ezetimibe against simvastatin 80 mg alone, in familial hypercholesterolaemia',
        endpointMet: false,
        statisticalPValue:
          'Change in carotid IMT 0.0111 ± 0.0038 mm on the combination against 0.0058 ± 0.0037 mm on simvastatin alone, p=0.29, despite a 16.5% lower end-of-study LDL (p<0.01)',
        unreportedAdverseSignals:
          'Side-effect and safety profiles were similar between arms. The trial is on this page for what it says about surrogate endpoints rather than about ezetimibe: IMPROVE-IT later found a real if modest event reduction for the same combination in 18,144 patients (32.7% against 34.7% at seven years, HR 0.936, p=0.016).',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'All-cause mortality 8% against 12% over a median 5.4 years in 4,444 patients with coronary disease (4S; RR 0.70, 95% CI 0.58 to 0.85, p=0.0003)',
        'All-cause mortality 12.9% against 14.7% and major vascular events 19.8% against 25.2% in 20,536 high-risk adults (HPS; p=0.0003 and p<0.0001)',
        'A 6% non-significant reduction in major vascular events for a further 0.35 mmol/L of LDL lowering at 80 mg against 20 mg (SEARCH; RR 0.94, p=0.10)',
        'Dose-stratified myopathy incidence of approximately 0.03%, 0.08% and 0.61% at 20, 40 and 80 mg in 24,747 treated patients followed a median four years',
        'An odds ratio for myopathy of 4.5 per copy of the SLCO1B1 rs4149056 C allele, with more than 60% of cases in the 80 mg population attributable to it',
      ],
      unsupportedInferences: [
        'That carotid intima-media thickness stands in for cardiovascular events — ENHANCE lowered LDL a further 16.5% and the wall thickness did not improve',
        'That more LDL lowering is always better regardless of the molecule delivering it: at 80 mg this molecule bought 6% fewer events, not significantly, at thirty times the myopathy rate',
        'That red yeast rice is a gentler alternative, when its active constituent is chemically identical to a prescription statin at an unregulated and highly variable dose',
        'That the glycaemic signal in the current label is quantified as precisely as the mortality benefit, when it was never a prespecified endpoint in either mortality trial',
      ],
      whatFailedInitially: [
        'SEARCH: quadrupling the dose did not significantly reduce major vascular events (p=0.10)',
        'ENHANCE: the imaging surrogate did not move despite a large additional LDL reduction',
        'The 80 mg dose was approved, marketed, and then restricted by the FDA to patients who had already tolerated it for twelve months; the brand no longer markets that strength at all',
        'Before 4S, cholesterol-lowering trials had repeatedly reduced coronary events without reducing total mortality, which is exactly why 4S was designed around all-cause death',
      ],
      realWorldOutcome: [
        'Approved in the United States in December 1991 under NDA 019766 and generic since June 2006',
        'Priced at about three United States cents a tablet at pharmacy acquisition cost — one of the largest measured mortality benefits per unit cost in medicine',
        'The maximum recommended brand dosage is now 40 mg once daily, with high-intensity treatment directed to a different molecule entirely',
        'Contraindicated with strong CYP3A4 inhibitors, ciclosporin, danazol and gemfibrozil, which is the practical reason a patient is often moved to pravastatin or rosuvastatin instead',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, taken once daily in the evening; also an oral suspension (Flolipid)',
      description:
        'Absorbed and then heavily extracted by the liver on first pass, so under 5% of the parent reaches the general circulation. Plasma concentrations of total radioactivity peak at four hours and fall to about 10% of peak by twelve hours. Peak concentrations of active and total inhibitors are attained within 1.3 to 2.4 hours. A low-fat meal does not affect the plasma profile. Metabolised by CYP3A4 to simvastatin acid and its 6′-hydroxy, 6′-hydroxymethyl and 6′-exomethylene derivatives; 13% of a dose is excreted in urine and 60% in faeces. Evening dosing exploits the fact that hepatic cholesterol synthesis runs highest overnight.',
      safetyProfile:
        'Contraindicated with strong CYP3A4 inhibitors (selected azole antifungals, macrolide antibiotics, antivirals and nefazodone), with ciclosporin, danazol or gemfibrozil, in acute liver failure or decompensated cirrhosis, and in hypersensitivity — anaphylaxis, angioedema and Stevens-Johnson syndrome have been reported. Myopathy and rhabdomyolysis are the defining risks: incidence rises with dose, with age 65 and over, with uncontrolled hypothyroidism, with renal impairment and with interacting drugs, and the label records that Chinese patients may be at higher risk. Rare immune-mediated necrotising myopathy has been reported and does not resolve simply on stopping. Transaminase rises occur, occasionally persistent, with rare reports of fatal and non-fatal hepatic failure. Increases in HbA1c and fasting glucose have been reported with statins including this one.',
    },
    commonQuestions: [
      {
        q: 'Does simvastatin actually make people live longer, or just improve a blood test?',
        a: 'The cited randomised trials found lower mortality. In 4S, 4,444 people with existing coronary disease took simvastatin or placebo for a median of five and a half years: 8% of the simvastatin group died against 12% on placebo, a relative risk of 0.70 at p=0.0003. Non-cardiovascular deaths were almost identical between the groups — 46 against 49 — addressing the concern that cholesterol drugs might trade heart deaths for other causes. HPS then found lower all-cause mortality in 20,536 higher-risk adults: 12.9% against 14.7%.',
        auditNote:
          'This is one of the few pages on this site where the primary endpoint of the pivotal trial was death itself rather than a surrogate. That is unusual and it is why the confidence rating here is high.',
      },
      {
        q: 'Why is 80 mg treated as a special case?',
        a: 'Because a 12,064-patient trial measured what it costs. SEARCH randomised heart attack survivors to 80 mg or 20 mg of the same drug for a mean 6.7 years. The higher dose lowered LDL by a further 0.35 mmol/L and reduced major vascular events by 6%, which was not statistically significant (p=0.10). It caused myopathy in 53 people (0.9%) against two (0.03%) on 20 mg. The FDA responded by restricting 80 mg to people who had already been taking it for a year or more without muscle problems, and the maximum recommended dose of the brand is now 40 mg. If a higher-intensity effect is wanted, the label directs a different drug rather than a higher dose of this one.',
      },
      {
        q: 'Why does everyone warn me about grapefruit, and does it really matter?',
        a: 'It matters more for this statin than for most drugs. Simvastatin is broken down by the enzyme CYP3A4, and it is broken down so thoroughly on first pass through the gut and liver that less than 5% of what you swallow reaches the general circulation. Grapefruit contains furanocoumarins that permanently inactivate the intestinal copies of that enzyme, so a much larger fraction survives. Because the enzyme has to be rebuilt from scratch, the effect lasts long after the juice is gone and cannot be avoided by taking the tablet at a different time of day. The same mechanism is why the label outright contraindicates simvastatin with strong CYP3A4 inhibitors such as certain azole antifungals, macrolide antibiotics, antivirals and nefazodone.',
      },
      {
        q: 'Is the muscle pain real, or is it in people’s heads?',
        a: 'Both questions have answers and they are different answers. Serious muscle injury — defined on the label as unexplained weakness, pain or tenderness with creatine kinase above ten times normal — is real, dose-dependent and rare: about 0.03% at 20 mg, 0.08% at 40 mg and 0.61% at 80 mg in 24,747 treated patients. There is also a strong genetic component: a variant in SLCO1B1, the transporter that pulls the drug into the liver, carries an odds ratio of 4.5 per copy and accounts for more than 60% of cases at the highest dose. Separately, the large blinded trials of statins have generally found that everyday muscle aches occur at similar rates on drug and on placebo, which means many people who attribute aching to a statin are correct that they ache and mistaken about the cause. Both facts are true at once, and neither cancels the other.',
      },
      {
        q: 'What about red yeast rice instead?',
        a: 'Red yeast rice contains monacolin K, and the European Food Safety Authority states that monacolin K in lactone form is identical to lovastatin, the active ingredient of authorised prescription medicines. It is not an alternative to a statin, it is a statin. EFSA’s 2018 opinion concluded that it was unable to identify an intake of monacolins from red yeast rice that does not give rise to concerns about harmful effects to health, and it had case reports of severe musculoskeletal and liver injury at intakes as low as 3 mg a day. The muscle and liver risks that apply to simvastatin apply here too, without the dose control, the contraindication list or the outcome trials.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Scandinavian Simvastatin Survival Study Group. Randomised trial of cholesterol lowering in 4444 patients with coronary heart disease (4S). Lancet 1994;344:1383-1389',
        identifier: '10.1016/S0140-6736(94)90566-5',
        kind: 'doi',
      },
      {
        label:
          'Heart Protection Study Collaborative Group. MRC/BHF Heart Protection Study of cholesterol lowering with simvastatin in 20,536 high-risk individuals: a randomised placebo-controlled trial. Lancet 2002;360:7-22',
        identifier: '10.1016/S0140-6736(02)09327-3',
        kind: 'doi',
      },
      {
        label:
          'SEARCH Collaborative Group. Intensive lowering of LDL cholesterol with 80 mg versus 20 mg simvastatin daily in 12,064 survivors of myocardial infarction: a double-blind randomised trial. Lancet 2010;376:1658-1669',
        identifier: '10.1016/S0140-6736(10)60310-8',
        kind: 'doi',
      },
      {
        label:
          'SEARCH Collaborative Group. SLCO1B1 variants and statin-induced myopathy — a genomewide study. N Engl J Med 2008;359:789-799',
        identifier: '10.1056/NEJMoa0801936',
        kind: 'doi',
      },
      {
        label:
          'Kastelein JJP, Akdim F, Stroes ESG, et al. Simvastatin with or without ezetimibe in familial hypercholesterolemia (ENHANCE). N Engl J Med 2008;358:1431-1443',
        identifier: '10.1056/NEJMoa0800742',
        kind: 'doi',
      },
      {
        label:
          'Cannon CP, Blazing MA, Giugliano RP, et al. Ezetimibe added to statin therapy after acute coronary syndromes (IMPROVE-IT). N Engl J Med 2015;372:2387-2397',
        identifier: '10.1056/NEJMoa1410489',
        kind: 'doi',
      },
      {
        label: 'ENHANCE registration record on ClinicalTrials.gov',
        identifier: 'NCT00552097',
        kind: 'nct',
      },
      {
        label:
          'ZOCOR (simvastatin) United States prescribing information — Indications 1, Dosage 2.1, Contraindications 4, Warnings and Precautions 5.1 to 5.3, Clinical Pharmacology 12.1 to 12.3 (NDA 019766)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019766',
        kind: 'regulatory',
      },
      {
        label:
          'EFSA Panel on Food Additives and Nutrient Sources added to Food. Scientific opinion on the safety of monacolins in red yeast rice. EFSA Journal 2018;16(8):5368',
        identifier: '10.2903/j.efsa.2018.5368',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — simvastatin, 90 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 54454 — simvastatin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54454',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Pravastatin — three positive mortality trials, one negative one, and a cancer signal the
  //    field examined and then set aside.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'pravastatin',
    name: 'Pravastatin',
    tradeName: 'Pravachol',
    sponsor:
      'Bristol Myers Squibb (originator, NDA 019898); discovered at Sankyo and generic in the United States since 2006',
    targetGene: 'HMGCR',
    targetProtein:
      '3-hydroxy-3-methylglutaryl-coenzyme A reductase, inhibited reversibly by pravastatin itself — unlike simvastatin and lovastatin, this drug is administered in its active open-acid form',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1991,
    indication:
      'To reduce the risk of myocardial infarction, revascularisation and cardiovascular mortality in hypercholesterolaemic adults without clinically evident coronary heart disease; to reduce the risk of total mortality by reducing coronary death, myocardial infarction, revascularisation, stroke and transient ischaemic attack and to slow the progression of coronary atherosclerosis in adults with clinically evident coronary heart disease; and to reduce elevated total cholesterol, LDL cholesterol, apolipoprotein B and triglycerides in primary hypercholesterolaemia, mixed dyslipidaemia, hypertriglyceridaemia, primary dysbetalipoproteinaemia and heterozygous familial hypercholesterolaemia from age eight',
    patientFriendlyIndication:
      'High cholesterol, and the prevention of heart attacks, strokes and cardiovascular death',
    anatomicalSite:
      'Hepatocyte cytoplasm — reached almost exclusively through the OATP1B1 transporter, because this statin is water-soluble and cannot cross membranes unaided',
    conditionContext: {
      conditionExplainer:
        'The disease being treated is atherosclerosis: LDL particles accumulating in artery walls over decades until a plaque ruptures and a clot closes the vessel. The cholesterol number is a marker for how fast that accumulation is happening, not the thing that hurts you.',
      whyItMatters:
        'Pravastatin is the statin with the most complete public trial record — and the most instructive, because not all of it is positive. Three placebo-controlled trials in three different populations found mortality and event reductions. A fourth, comparing it against usual care rather than placebo, found nothing at all. Reading them together tells you more about how drug trials work than any one of them does alone.',
      whoTakesThis:
        'Adults with high cholesterol and no known heart disease, adults with established coronary disease, children from age eight with familial hypercholesterolaemia, and — in practice — people taking drugs that collide with the CYP3A4-metabolised statins.',
      clinicalGoals:
        'Lower LDL cholesterol is the measurement. Fewer coronary deaths is the licensed claim, and for this molecule it rests on named trials rather than on the class.',
    },
    oneSentenceVerdict:
      'The water-soluble statin with three placebo-controlled mortality trials — LIPID cut overall mortality from 14.1% to 11.0% in 9,014 patients (p<0.001) — and one trial against usual care, ALLHAT-LLT, in which it did nothing at all to all-cause mortality in 10,355 people (RR 0.99, p=0.88) because the control group started taking statins too.',
    laymanHowItWorks:
      'Pravastatin blocks the enzyme the liver uses to build cholesterol, so the liver cell puts more LDL receptors on its surface and pulls cholesterol-carrying particles out of the bloodstream instead. What separates it from most statins is that it is water-soluble rather than fat-soluble: it cannot drift through cell membranes and has to be carried into the liver by a specific transporter. That makes it much more confined to the liver than its relatives, and it also means the body clears it by simple chemical rearrangement rather than through the busy CYP3A4 enzyme, so it collides with far fewer other drugs.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0620 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 93 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1991 under NDA 019898 and generic since 2006. It costs about twice what simvastatin costs per tablet and delivers less LDL lowering per milligram, which is why it is rarely a first choice — and why the reason to reach for it is almost always an interaction rather than an efficacy argument.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Pravastatin is the statin you choose for what it does not do. On LDL lowering it is beaten by every newer molecule in the class; on drug interactions it beats all of them except rosuvastatin. The comparison that matters is not potency but which enzyme clears the drug.',
      conventionalRx: [
        {
          name: 'Rosuvastatin (Crestor)',
          class: 'HMG-CoA reductase inhibitor, hydrophilic, minimally CYP-metabolised',
          howItCompares:
            'The other hydrophilic statin, and the more potent one: it lowers LDL considerably further at ordinary doses while sharing pravastatin’s freedom from CYP3A4. It is the usual modern answer to the problem pravastatin was chosen to solve.',
          typicalCost:
            'US$0.0449 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 179 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper per tablet than pravastatin and far stronger; its own large outcome trial in JUPITER. Cons: interacts with ciclosporin and some antivirals through transporters rather than CYP; dose limits apply in East Asian populations.',
        },
        {
          name: 'Simvastatin (Zocor)',
          class: 'HMG-CoA reductase inhibitor, lipophilic, CYP3A4 substrate',
          howItCompares:
            'Cheaper and better evidenced on mortality, with 4S and the Heart Protection Study behind it. Its weakness is precisely pravastatin’s strength: simvastatin is contraindicated with strong CYP3A4 inhibitors, and pravastatin is not.',
          typicalCost:
            'US$0.0314 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 90 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: half the price; larger mortality trials. Cons: a long contraindication list; a dose-restricted top strength; grapefruit matters.',
        },
        {
          name: 'Atorvastatin (Lipitor)',
          class: 'HMG-CoA reductase inhibitor, lipophilic, CYP3A4 substrate',
          howItCompares:
            'Substantially more LDL lowering per tablet, at a lower acquisition price, with outcome trials of its own. It is a CYP3A4 substrate, but its plasma concentrations rise less steeply on enzyme inhibition than simvastatin’s do, so the interactions are managed by dose limits rather than by contraindication.',
          typicalCost:
            'US$0.0281 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 278 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheapest of the four listed here and the strongest of the lipophilic options. Cons: still CYP3A4-dependent, so the interaction problem is reduced rather than removed.',
        },
      ],
      naturalFoods: [
        {
          name: 'Soluble fibre — oat β-glucan, psyllium, barley, legumes',
          activeCompound: 'Viscous soluble fibre, principally β-glucan',
          biologicalMechanism:
            'Soluble fibre binds bile acids in the gut so they leave the body rather than being reabsorbed. The liver replaces them by consuming cholesterol, its internal pool falls, and it puts out more LDL receptors — the identical last step to the one pravastatin triggers by a different route.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: randomised trials of oat β-glucan report LDL reductions of a few per cent, against 26 to 34% for pravastatin 40 mg in WOSCOPS and PROSPER, and no fibre trial has reported a mortality endpoint.',
          monthlyCost: '',
        },
        {
          name: 'Plant sterols and stanols — fortified spreads, nuts, seeds, vegetable oils',
          activeCompound: 'β-sitosterol, campesterol, sitostanol',
          biologicalMechanism:
            'Close structural analogues of cholesterol that compete with it for incorporation into intestinal micelles, reducing absorption. This acts on the absorption side while a statin acts on the synthesis side, so the two are additive rather than redundant.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the LDL reductions measured in randomised trials of sterol-fortified foods are roughly 5 to 10%, and no such trial has reported a cardiovascular outcome.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Tell whoever prescribes an antibiotic',
          action:
            'Mention that you take pravastatin if you are being started on clarithromycin, erythromycin or colchicine.',
          patientImpact:
            'The label limits pravastatin to 40 mg once daily with clarithromycin and to 20 mg once daily with ciclosporin, and it directs caution with other macrolides and with colchicine. These are dose limits, not contraindications, which is a meaningfully lighter constraint than the one on simvastatin.',
          clinicalPrecaution:
            'Concomitant gemfibrozil should be avoided, and fibrates and lipid-modifying doses of niacin at 1 g a day or more raise the risk of muscle injury.',
        },
        {
          name: 'The evening dose is not arbitrary',
          action: 'Take it as directed rather than switching to mornings for convenience.',
          patientImpact:
            'The label records that systemic bioavailability after a bedtime dose is 60% lower than after a morning dose, and that despite this the evening dose was marginally — though not statistically significantly — more effective. Hepatic cholesterol synthesis peaks overnight, and the drug is aimed at the liver rather than at the bloodstream.',
          clinicalPrecaution:
            'Food reduces systemic bioavailability but the lipid-lowering effect is similar with or without it, so meals are not the variable to manage.',
        },
        {
          name: 'Muscle symptoms are still worth reporting',
          action:
            'Report unexplained or persistent muscle pain, tenderness or weakness, particularly with malaise or fever.',
          patientImpact:
            'Myopathy — muscle aching or weakness with creatine kinase above ten times the upper limit of normal — was rare, under 0.1%, in the pravastatin trial programme. Rare rhabdomyolysis with acute renal failure has been reported. Predisposing factors are age 65 and over, uncontrolled hypothyroidism and renal impairment.',
          clinicalPrecaution:
            'Immune-mediated necrotising myopathy is a separate and rarer entity: proximal weakness with raised creatine kinase that persists after the statin is stopped, with anti-HMG-CoA reductase antibodies. It does not resolve on discontinuation alone.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC[C@H](C)C(=O)O[C@H]1C[C@@H](C=C2[C@H]1[C@H]([C@H](C=C2)C)CC[C@H](C[C@H](CC(=O)O)O)O)O',
      chemicalFormula: 'C23H36O7',
      molecularWeight: '424.50 g/mol',
      targetReceptorAffinity:
        'A reversible competitive inhibitor of HMG-CoA reductase, given orally in the active open-acid form rather than as a lactone prodrug. The label records average oral absorption of 34% with absolute bioavailability 17%, hepatic first-pass extraction ratio 0.66, approximately 50% plasma protein binding — half that of the lipophilic statins — and an elimination half-life of about 1.8 hours. Metabolism is by isomerisation to 6-epi pravastatin and the 3α-hydroxyisomer SQ 31,906 and by enzymatic ring hydroxylation to SQ 31,945, not by CYP3A4; the 3α-hydroxy isomer retains only a tenth to a fortieth of the parent’s inhibitory activity. After intravenous dosing about 47% of total body clearance is renal.',
      structureSource: {
        label:
          'PubChem CID 54687 (pravastatin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; absorption, binding, metabolism and clearance from the pravastatin sodium label, section 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54687',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'pra-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Test acid stability and quantify the 3α-hydroxy isomer',
          description:
            'Pravastatin is a sodium salt of an open hydroxyacid and it is acid-labile: in acid it isomerises toward the 3α-hydroxy compound and lactonises. The label states that the 3α-hydroxy isomer has only a tenth to a fortieth of the parent’s activity, so isomer content is a potency specification and not a cosmetic impurity limit. A batch that has seen low pH is weaker than its total assay implies.',
          reagentsAndBuffer:
            'Pravastatin sodium USP reference standard, reversed-phase HPLC resolving pravastatin from 6-epi pravastatin, the 3α-hydroxyisomer and the lactone, phosphate buffer at controlled pH, forced degradation at pH 2 and pH 9 as system suitability, Karl Fischer titration',
        },
        {
          id: 'pra-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Hydroxylate a fungal statin with a bacterial cytochrome P450',
          description:
            'Pravastatin is a two-organism product. A Penicillium fermentation produces compactin, and a second, bacterial fermentation hydroxylates it at the 6β position using a cytochrome P450 that no practical chemical route reproduces with the same regio- and stereoselectivity. The lactone is then opened to the sodium salt. The single added hydroxyl is what makes the molecule water-soluble, and therefore what makes it dependent on a transporter to reach the liver.',
          dependsOnStepId: 'pra-w1',
          reagentsAndBuffer:
            'Compactin (mevastatin) from Penicillium citrinum fermentation, whole-cell biotransformation by Streptomyces carbophilus or Actinomadura, dissolved-oxygen-controlled fed-batch fermenter, sodium hydroxide for lactone ring opening and salt formation',
        },
        {
          id: 'pra-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separate the epimer and remove unconverted compactin',
          description:
            'The biotransformation is not quantitative, so unconverted compactin — itself an active statin with a different pharmacology — has to be removed, along with 6-epi pravastatin. Because the product is a water-soluble sodium salt rather than a crystalline lactone, purification runs through aqueous chromatography and controlled crystallisation rather than the organic recrystallisations used for lovastatin and simvastatin.',
          dependsOnStepId: 'pra-w2',
          reagentsAndBuffer:
            'Adsorption chromatography on macroporous resin, preparative reversed-phase chromatography, controlled crystallisation of the sodium salt from aqueous alcohol, HPLC release testing against USP related-substance limits for compactin and the epimer',
        },
        {
          id: 'pra-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Prove hepatoselectivity by comparing liver cells with muscle cells',
          description:
            'The clinical claim for this molecule is that it stays in the liver. That is testable directly: measure uptake into human hepatocytes, which express OATP1B1, against uptake into skeletal-muscle myotubes, which do not, and compare the ratio with a lipophilic statin run in parallel. A statin that reaches muscle cells only through a transporter those cells lack should show a far larger ratio than one that diffuses through the membrane.',
          dependsOnStepId: 'pra-w3',
          reagentsAndBuffer:
            'Sandwich-cultured primary human hepatocytes and HEK293 cells expressing OATP1B1, differentiated human skeletal-muscle myotubes as the non-expressing comparator, simvastatin acid as the lipophilic reference, rifampicin as transport inhibitor, LC-MS/MS quantification',
        },
        {
          id: 'pra-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Enzyme inhibition, then LDL receptor upregulation as the real readout',
          description:
            'Inhibition of the isolated enzyme establishes potency; it does not establish effect. The effect is the LDL receptor response that follows depletion of the hepatocyte cholesterol pool, and that has to be measured in a cell. Running both is what distinguishes a compound that binds the target from a compound that lowers cholesterol.',
          dependsOnStepId: 'pra-w4',
          reagentsAndBuffer:
            'Recombinant human HMG-CoA reductase catalytic domain with HMG-CoA and NADPH, absorbance readout at 340 nm, HepG2 cells for LDLR surface quantification by flow cytometry, fluorescently labelled LDL for uptake, sterol-depleted medium as the positive control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pra-a1',
        category: 'measured',
        title: 'LIPID: overall mortality fell, not just coronary mortality',
        laymanSummary:
          'Nine thousand people with previous heart attacks or unstable angina took pravastatin or placebo for six years. Eleven per cent of the drug group died against fourteen per cent on placebo.',
        technicalDetails:
          'LIPID randomised 9,014 patients aged 31 to 75 with previous myocardial infarction or hospitalisation for unstable angina and total cholesterol 155 to 271 mg/dL to pravastatin 40 mg daily or placebo, mean follow-up 6.1 years. Death from coronary heart disease, the primary outcome, occurred in 6.4% against 8.3% — a 24% relative reduction (95% CI 12 to 35, p<0.001). Overall mortality was 11.0% against 14.1%, a 22% relative reduction (95% CI 13 to 31, p<0.001). Myocardial infarction fell 29% (p<0.001), stroke 19% (p=0.048) and coronary revascularisation 20% (p<0.001), with effects similar across all predefined subgroups. This is the trial that carries the label claim of reduced total mortality for this molecule.',
        evidenceSource:
          'LIPID Study Group. N Engl J Med 1998;339:1349-1357 (Long-Term Intervention with Pravastatin in Ischaemic Disease)',
        doi: '10.1056/NEJM199811053391902',
        measuredMetric:
          'Coronary and all-cause mortality over a mean 6.1 years in 9,014 patients with established coronary disease',
        auditFlag: 'verified',
      },
      {
        id: 'pra-a2',
        category: 'failed',
        title: 'ALLHAT-LLT: nothing, in ten thousand people',
        laymanSummary:
          'The largest pravastatin trial compared it not against a placebo but against whatever doctors would normally do. Deaths were identical. Coronary events were not significantly different. The reason is that a third of the comparison group started taking statins too.',
        technicalDetails:
          'ALLHAT-LLT randomised 10,355 ambulatory adults aged 55 or over with LDL cholesterol 120 to 189 mg/dL and hypertension plus at least one further coronary risk factor to open-label pravastatin 40 mg daily or usual care, with all-cause mortality as the primary outcome and follow-up to eight years. All-cause mortality was 14.9% against 15.3% at six years — relative risk 0.99 (95% CI 0.89 to 1.11), p=0.88. Coronary events were 9.3% against 10.4%, RR 0.91 (95% CI 0.79 to 1.04), p=0.16. The trial’s own explanation is arithmetic rather than pharmacological: 32% of usual-care participants with known coronary disease and 29% without started lipid-lowering drugs during the trial, so the achieved separation was only 9.6% in total cholesterol and 16.7% in LDL, against roughly 26 to 35% in the placebo-controlled trials. The lesson is not that pravastatin does not work. It is that a trial measures the difference between two arms, not the effect of a drug, and that an unblinded usual-care comparator in an era when the treatment is spreading will erase almost any effect.',
        evidenceSource: 'ALLHAT Officers and Coordinators. JAMA 2002;288:2998-3007 (ALLHAT-LLT)',
        doi: '10.1001/jama.288.23.2998',
        measuredMetric:
          'All-cause mortality at six years, pravastatin 40 mg against usual care, in 10,355 hypertensive adults',
        auditFlag: 'caution',
      },
      {
        id: 'pra-a3',
        category: 'inferred',
        title: 'WOSCOPS is cited for a mortality benefit that missed significance',
        laymanSummary:
          'The famous primary-prevention trial reduced heart attacks convincingly. Its reduction in deaths from any cause was 22% with a confidence interval that just touched zero, and a p value of 0.051. It is regularly described as though it had proved a survival benefit.',
        technicalDetails:
          'WOSCOPS randomised 6,595 men aged 45 to 64 with mean plasma cholesterol 272 mg/dL and no history of infarction to pravastatin 40 mg each evening or placebo, average follow-up 4.9 years. The primary endpoint — definite non-fatal myocardial infarction or coronary death — occurred 174 times against 248, a 31% relative reduction (95% CI 17 to 43, p<0.001). Death from all cardiovascular causes fell 32% (p=0.033). Death from any cause fell 22%, 95% CI 0 to 40, p=0.051 — on the wrong side of the conventional threshold, with a lower bound of exactly zero. Death from coronary heart disease counting definite cases alone fell 28% at p=0.13, and only reached p=0.042 when suspected cases were added. There was no excess of non-cardiovascular death, which was the specific reassurance the trial was designed to provide. All of that is a strong result. It is not a demonstrated all-cause mortality benefit, and the distinction matters most precisely in primary prevention, where the people being treated are well.',
        evidenceSource:
          'Shepherd J, Cobbe SM, Ford I, et al. N Engl J Med 1995;333:1301-1307 (WOSCOPS)',
        doi: '10.1056/NEJM199511163332001',
        inferredClaim:
          'That WOSCOPS demonstrated a reduction in all-cause mortality in primary prevention, when the result was 22% at p=0.051 with a confidence interval reaching zero',
        auditFlag: 'caution',
      },
      {
        id: 'pra-a4',
        category: 'conclusion_shift',
        title: 'PROSPER found more cancers, and the field decided it was noise',
        laymanSummary:
          'In the trial of pravastatin in people aged seventy to eighty-two, new cancer diagnoses were 25% more common on the drug, and the difference was statistically significant. Pooling every statin trial afterwards showed no overall increase, and that pooled answer is the one medicine now works from.',
        technicalDetails:
          'PROSPER randomised 5,804 men and women aged 70 to 82 with vascular disease or risk factors to pravastatin 40 mg daily or placebo for an average 3.2 years. The primary composite of coronary death, non-fatal myocardial infarction and fatal or non-fatal stroke fell from 473 to 408 events, hazard ratio 0.85 (95% CI 0.74 to 0.97, p=0.014), and coronary death fell 24% (p=0.043). New cancer diagnoses were more frequent on pravastatin: hazard ratio 1.25 (95% CI 1.04 to 1.51), p=0.020. The authors did the correct thing with their own inconvenient finding — they folded it into a meta-analysis of all pravastatin and all statin trials, which showed no overall increase in risk, and reported both. That is the shape of a genuine conclusion shift: a significant signal in one trial, examined against the whole evidence base, and set aside on the strength of it rather than ignored. A reader should note that the setting-aside is itself an inference, drawn from pooled data rather than from a trial designed to test carcinogenicity.',
        evidenceSource:
          'Shepherd J, Blauw GJ, Murphy MB, et al. Lancet 2002;360:1623-1630 (PROSPER)',
        doi: '10.1016/s0140-6736(02)11600-x',
        measuredMetric:
          'Incident cancer diagnoses on pravastatin against placebo in 5,804 people aged 70 to 82 (HR 1.25, 95% CI 1.04 to 1.51, p=0.020)',
        auditFlag: 'contested',
      },
      {
        id: 'pra-a5',
        category: 'failed',
        title: 'PROSPER: no effect on stroke whatsoever',
        laymanSummary:
          'The same elderly trial reduced heart attacks and coronary deaths and did absolutely nothing to stroke — a hazard ratio of 1.03 with a p value of 0.8.',
        technicalDetails:
          'Stroke risk in PROSPER was unaffected: hazard ratio 1.03 (95% CI 0.81 to 1.31), p=0.8, over an average 3.2 years in people aged 70 to 82. The hazard ratio for transient ischaemic attack was 0.75 (95% CI 0.55 to 1.00, p=0.051). This sits against LIPID, where stroke fell 19% (p=0.048) in a younger secondary-prevention population, and CARE, where stroke fell 31% (p=0.03). The same molecule at the same dose produced a stroke benefit in two trials and none in a third, and the population that did not benefit is the one at highest absolute stroke risk. Three years may simply be too short for a lipid intervention to move stroke rates in the elderly; the trial measured no effect and did not explain why.',
        evidenceSource: 'Shepherd J et al. Lancet 2002;360:1623-1630 (PROSPER)',
        doi: '10.1016/s0140-6736(02)11600-x',
        measuredMetric:
          'Fatal and non-fatal stroke on pravastatin against placebo in people aged 70 to 82 (HR 1.03, p=0.8)',
        auditFlag: 'caution',
      },
      {
        id: 'pra-a6',
        category: 'measured',
        title: 'The interaction list is short because CYP3A4 is not involved',
        laymanSummary:
          'Most statins are broken down by a liver enzyme that dozens of common drugs block. This one is not, and its official interaction list is correspondingly short — dose limits rather than outright bans.',
        technicalDetails:
          'The label describes pravastatin’s major biotransformation pathways as isomerisation to 6-epi pravastatin and the 3α-hydroxyisomer SQ 31,906, and enzymatic ring hydroxylation to SQ 31,945. CYP3A4 is not the route. The consequences are visible in the interactions section: ciclosporin limits pravastatin to 20 mg once daily and clarithromycin to 40 mg once daily, gemfibrozil should be avoided, and fibrates, colchicine and lipid-modifying doses of niacin warrant caution. Every one of these is a dose limit or a caution. Simvastatin, by contrast, is outright contraindicated with strong CYP3A4 inhibitors, ciclosporin, danazol and gemfibrozil. That difference — not potency, in which pravastatin loses to everything modern — is the clinical reason to choose this molecule.',
        evidenceSource:
          'Pravastatin sodium United States prescribing information, sections 7.1 to 7.5 and 12.3',
        measuredMetric:
          'Metabolic route and the resulting drug-interaction constraints, from the label pharmacology and interactions sections',
        auditFlag: 'verified',
      },
      {
        id: 'pra-a7',
        category: 'measured',
        title: 'CARE: the benefit extended to people whose cholesterol was already normal',
        laymanSummary:
          'Four thousand people who had had a heart attack but whose cholesterol was average took pravastatin or placebo. Coronary events fell by a quarter, in people no cholesterol guideline of the time would have treated.',
        technicalDetails:
          'CARE randomised 4,159 post-infarction patients — 3,583 men and 576 women — with total cholesterol below 240 mg/dL (mean 209) and LDL 115 to 174 mg/dL (mean 139) to pravastatin 40 mg daily or placebo for five years. The primary endpoint of fatal coronary event or non-fatal myocardial infarction occurred in 10.2% against 13.2%: a 24% relative reduction (95% CI 9 to 36), p=0.003, on an absolute difference of three percentage points. Bypass surgery fell 26% (p=0.005), angioplasty 23% (p=0.01) and stroke 31% (p=0.03). There were no significant differences in overall mortality or in non-cardiovascular mortality — the trial was not powered for them. Two subgroup observations are worth keeping in view precisely because they are subgroup observations: the reduction was larger in women than in men, and larger in patients with higher pretreatment LDL.',
        evidenceSource:
          'Sacks FM, Pfeffer MA, Moye LA, et al. N Engl J Med 1996;335:1001-1009 (CARE)',
        doi: '10.1056/NEJM199610033351401',
        measuredMetric:
          'Fatal coronary events or non-fatal myocardial infarction over five years in post-infarction patients with average cholesterol',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It arrives already switched on',
        laymanDesc:
          'Unlike simvastatin and lovastatin, this tablet does not need the body to activate it. The molecule that inhibits the enzyme is the molecule you swallow.',
        molecularDetail:
          'Pravastatin is administered orally in the active open-hydroxyacid form as the sodium salt, not as a lactone prodrug. Average oral absorption is 34% with absolute bioavailability 17%; peak plasma concentrations occur at 1 to 1.5 hours.',
        iconName: 'Zap',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Being water-soluble means it needs a door',
        laymanDesc:
          'Fat-soluble statins slip through cell membranes anywhere in the body. This one cannot: it has to be carried into the liver cell by a specific transporter, and cells without that transporter barely see it.',
        molecularDetail:
          'The 6β-hydroxyl makes pravastatin hydrophilic, so hepatic entry depends on OATP1B1 rather than on passive diffusion. Hepatic first-pass extraction ratio is 0.66. Plasma protein binding is approximately 50%, against roughly 95% for the lipophilic statins.',
        iconName: 'DoorOpen',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It jams the rate-limiting step of cholesterol synthesis',
        laymanDesc:
          'Inside the liver cell it blocks the enzyme that performs the slowest step in building cholesterol, and the whole pathway backs up behind it.',
        molecularDetail:
          'Reversible competitive inhibition of HMG-CoA reductase, the enzyme catalysing conversion of HMG-CoA to mevalonate — an early and rate-limiting step in cholesterol biosynthesis. VLDL and triglycerides fall and HDL cholesterol rises.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The liver starts clearing LDL out of the blood',
        laymanDesc:
          'Deprived of the cholesterol it used to manufacture, the liver cell puts more receptors on its surface and pulls LDL particles out of the bloodstream. That is what lowers the number on the test.',
        molecularDetail:
          'Depletion of the intracellular sterol pool activates SREBP-2 and upregulates LDL receptor expression, increasing hepatic clearance of circulating LDL. Pravastatin 40 mg lowered LDL cholesterol by 26% in WOSCOPS and 34% in PROSPER.',
        iconName: 'Download',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer coronary deaths, in three separate populations',
        laymanDesc:
          'Men with high cholesterol and no heart disease, people who had had a heart attack with normal cholesterol, and people with established coronary disease — all three groups had measurably fewer coronary events.',
        molecularDetail:
          'WOSCOPS: definite coronary events 174 against 248, a 31% reduction (p<0.001). CARE: 10.2% against 13.2%, a 24% reduction (p=0.003). LIPID: coronary death 6.4% against 8.3% and overall mortality 11.0% against 14.1%, both p<0.001.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And, in one trial, nothing at all',
        laymanDesc:
          'The largest trial of the lot compared it against ordinary care rather than a dummy tablet, and found no difference in deaths. A third of the comparison group had started taking statins of their own.',
        molecularDetail:
          'ALLHAT-LLT: all-cause mortality 14.9% against 15.3% at six years, RR 0.99 (95% CI 0.89 to 1.11), p=0.88, in 10,355 participants. Achieved separation was 9.6% in total cholesterol and 16.7% in LDL, against 26 to 35% in the placebo-controlled trials.',
        iconName: 'MinusCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'WOSCOPS — West of Scotland Coronary Prevention Study (N Engl J Med 1995;333:1301-1307)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 6595,
        primaryEndpoint:
          'Combined incidence of definite non-fatal myocardial infarction and death from coronary heart disease in men aged 45 to 64 with hypercholesterolaemia and no prior infarction',
        endpointMet: true,
        statisticalPValue:
          '174 definite coronary events against 248; 31% relative risk reduction (95% CI 17 to 43), p<0.001, over an average 4.9 years',
        unreportedAdverseSignals:
          'All-cause mortality fell 22% but with a 95% CI of 0 to 40 and p=0.051 — not significant, though the trial is routinely cited as though it were. Coronary death counting definite cases alone fell 28% at p=0.13. The population was men only, aged 45 to 64, with mean cholesterol 272 mg/dL, so nothing here transfers directly to women or to lower baseline cholesterol.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CARE — Cholesterol and Recurrent Events (N Engl J Med 1996;335:1001-1009)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 4159,
        primaryEndpoint:
          'Fatal coronary event or non-fatal myocardial infarction over five years in post-infarction patients with average cholesterol levels',
        endpointMet: true,
        statisticalPValue:
          '10.2% against 13.2%; a 24% relative risk reduction (95% CI 9 to 36), p=0.003, on an absolute difference of three percentage points',
        unreportedAdverseSignals:
          'There were no significant differences in overall mortality or in non-cardiovascular mortality; the trial was not powered for either. The reported greater benefit in women rests on 576 women, and the greater benefit at higher pretreatment LDL is a subgroup analysis — both are hypothesis-generating rather than established.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'LIPID (N Engl J Med 1998;339:1349-1357)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 9014,
        primaryEndpoint:
          'Mortality from coronary heart disease over a mean 6.1 years in patients with previous myocardial infarction or unstable angina and a broad range of cholesterol levels',
        endpointMet: true,
        statisticalPValue:
          '6.4% against 8.3%; a 24% relative reduction (95% CI 12 to 35), p<0.001, with overall mortality 11.0% against 14.1% (22% reduction, 95% CI 13 to 31, p<0.001)',
        unreportedAdverseSignals:
          'The publication reports no clinically significant adverse effects of treatment. Stroke reduction was 19% at p=0.048, which is a real but marginal result and sits against PROSPER, where stroke was entirely unaffected.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PROSPER (Lancet 2002;360:1623-1630)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 5804,
        primaryEndpoint:
          'Composite of coronary death, non-fatal myocardial infarction and fatal or non-fatal stroke in men and women aged 70 to 82',
        endpointMet: true,
        statisticalPValue:
          '408 events against 473; hazard ratio 0.85 (95% CI 0.74 to 0.97), p=0.014, over an average 3.2 years',
        unreportedAdverseSignals:
          'New cancer diagnoses were more frequent on pravastatin: HR 1.25 (95% CI 1.04 to 1.51), p=0.020. A meta-analysis of all pravastatin and all statin trials showed no overall increase. Stroke risk was unaffected (HR 1.03, p=0.8) despite stroke being part of the primary composite. There was no significant effect on cognitive function or disability.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'ALLHAT-LLT (JAMA 2002;288:2998-3007)',
        phase: 'Phase 3, randomised, open-label, usual-care controlled',
        sampleSize: 10355,
        primaryEndpoint:
          'All-cause mortality with follow-up to eight years, pravastatin 40 mg daily against usual care, in hypertensive adults aged 55 or over with moderately elevated LDL cholesterol',
        endpointMet: false,
        statisticalPValue:
          'Six-year mortality 14.9% against 15.3%; relative risk 0.99 (95% CI 0.89 to 1.11), p=0.88. Coronary events 9.3% against 10.4%, RR 0.91 (95% CI 0.79 to 1.04), p=0.16',
        unreportedAdverseSignals:
          'During the trial 32% of usual-care participants with known coronary disease and 29% without started lipid-lowering drugs, leaving a differential of only 9.6% in total cholesterol and 16.7% in LDL. The trial is a demonstration of what happens to an unblinded active-control design when the control treatment becomes standard practice mid-trial, and the authors say so in their own conclusion.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Coronary mortality 6.4% against 8.3% and overall mortality 11.0% against 14.1% in 9,014 patients over 6.1 years (LIPID, both p<0.001)',
        'Definite coronary events reduced 31% in 6,595 men without prior infarction (WOSCOPS, 95% CI 17 to 43, p<0.001)',
        'Fatal coronary events or non-fatal infarction 10.2% against 13.2% in post-infarction patients with average cholesterol (CARE, p=0.003)',
        'A primary composite hazard ratio of 0.85 in 5,804 people aged 70 to 82 (PROSPER, p=0.014)',
        'No reduction in all-cause mortality against usual care in 10,355 hypertensive adults (ALLHAT-LLT, RR 0.99, p=0.88)',
        'Incident cancer diagnoses 25% more frequent on pravastatin in PROSPER (HR 1.25, 95% CI 1.04 to 1.51, p=0.020)',
      ],
      unsupportedInferences: [
        'That WOSCOPS demonstrated an all-cause mortality benefit in primary prevention — the result was 22% at p=0.051 with a confidence interval touching zero',
        'That the stroke reductions in CARE and LIPID are a property of the drug rather than of the population, when PROSPER found a hazard ratio of 1.03 at p=0.8',
        'That the greater benefit in women reported in CARE is established, when it rests on a subgroup of 576 women in a trial not powered for it',
        'That ALLHAT-LLT shows pravastatin does not work, when what it shows is a trial whose control arm adopted the treatment',
      ],
      whatFailedInitially: [
        'ALLHAT-LLT: no significant reduction in all-cause mortality or coronary events against usual care',
        'PROSPER: stroke entirely unaffected, hazard ratio 1.03, p=0.8',
        'PROSPER: a statistically significant excess of new cancer diagnoses, which pooled analysis of the whole statin literature did not confirm',
        'WOSCOPS: all-cause mortality missed the conventional significance threshold at p=0.051',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1991 under NDA 019898 and generic since 2006',
        'Carries a licensed claim of reduced total mortality in established coronary disease, resting on LIPID',
        'Now largely displaced by rosuvastatin, which is hydrophilic like pravastatin, considerably more potent, and cheaper per tablet at pharmacy acquisition cost',
        'Retains a specific niche wherever CYP3A4 interactions rule out the lipophilic statins, and is the statin most often used alongside protease inhibitors and ciclosporin for that reason',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 10, 20, 40 and 80 mg, taken once daily, usually in the evening',
      description:
        'Given in the active acid form, so no metabolic activation is required. Peak plasma concentrations occur at 1 to 1.5 hours; average oral absorption is 34% and absolute bioavailability 17%, with a hepatic extraction ratio of 0.66. Systemic bioavailability after a bedtime dose is 60% lower than after a morning dose, and the evening dose was nonetheless marginally more effective — the drug is aimed at an organ whose cholesterol synthesis peaks overnight, not at the bloodstream. Food reduces systemic bioavailability without changing the lipid-lowering effect. Elimination half-life is about 1.8 hours; 20% of an oral dose appears in urine and 70% in faeces, and after intravenous dosing 47% of total body clearance is renal.',
      safetyProfile:
        'Contraindicated in hypersensitivity, in active liver disease or unexplained persistent transaminase elevation, in pregnancy and during breastfeeding. Myopathy with creatine kinase above ten times the upper limit of normal was rare, under 0.1%, in the trial programme; rare rhabdomyolysis with acute renal failure has been reported. Predisposing factors are age 65 and over, uncontrolled hypothyroidism and renal impairment. Immune-mediated necrotising myopathy is a separate rare entity that persists after the drug is stopped and carries anti-HMG-CoA reductase antibodies. Persistent transaminase elevations occur. Interactions are handled by dose limits rather than contraindications: 20 mg maximum with ciclosporin, 40 mg maximum with clarithromycin, avoid gemfibrozil, caution with other fibrates, colchicine and niacin at 1 g a day or more.',
    },
    commonQuestions: [
      {
        q: 'Why would anyone choose pravastatin over a stronger statin?',
        a: 'Because of what it is not metabolised by. Most statins are cleared through CYP3A4, an enzyme blocked by a long list of common drugs — certain antifungals, macrolide antibiotics, HIV protease inhibitors, some antivirals — and blocking it raises statin levels enough that simvastatin is outright contraindicated with several of them. Pravastatin is cleared by simple isomerisation and ring hydroxylation instead, so its interaction section is a short list of dose limits: 20 mg with ciclosporin, 40 mg with clarithromycin, avoid gemfibrozil. If you are a transplant recipient, or on treatment for HIV, or on a drug regimen that already has three CYP3A4 collisions in it, that is the entire argument, and it is a good one.',
        auditNote:
          'On potency pravastatin loses to every modern statin, and rosuvastatin now offers the same freedom from CYP3A4 at a lower acquisition price. The niche is real and it is narrower than it was.',
      },
      {
        q: 'One big trial found it did nothing. Does it work or not?',
        a: 'It works, and the trial that found nothing is worth understanding rather than dismissing. ALLHAT-LLT randomised 10,355 people to pravastatin or to usual care — not to placebo — and found all-cause mortality of 14.9% against 15.3%, p=0.88. The reason is in the trial’s own results: about 30% of the usual-care group started taking statins during the study, so by year four the difference in LDL between the two arms was 16.7% instead of the 26 to 35% achieved in the placebo-controlled trials. A trial measures the gap between two arms. When the control arm quietly adopts the treatment, the gap closes and the drug looks inert. The three placebo-controlled trials — WOSCOPS, CARE and LIPID — all found significant reductions in coronary events, and LIPID found a reduction in death from any cause.',
      },
      {
        q: 'Do statins cause cancer? I read that they do.',
        a: 'That worry has a specific origin and a specific resolution. PROSPER, the trial of pravastatin in people aged 70 to 82, found new cancer diagnoses 25% more common on the drug, hazard ratio 1.25, p=0.020 — a statistically significant result. Its authors then pooled every pravastatin trial and every statin trial and found no overall increase in cancer risk, and reported both findings in the same paper. That pooled answer is what medicine now works from, and it is the right way to handle a single significant signal in a trial not designed to look for it. What a careful reader should hold on to is that the reassurance comes from pooled observational aggregation of trials, not from a trial designed to test carcinogenicity, and that no such trial exists.',
      },
      {
        q: 'Is pravastatin gentler on muscles than other statins?',
        a: 'The mechanism suggests it should be and the trial data are consistent with it, but the comparison has never been made head to head in a trial large enough to settle it. Pravastatin is water-soluble and cannot diffuse into cells; it needs the OATP1B1 transporter, which liver cells express and skeletal muscle cells largely do not. Myopathy in the pravastatin trial programme was recorded as rare, under 0.1%. Against that, rhabdomyolysis with acute renal failure has been reported with pravastatin as with the rest of the class, immune-mediated necrotising myopathy is a class effect, and the label lists the same predisposing factors. Lower risk is a reasonable reading of the mechanism and the trial rates; it is not a measured comparison.',
      },
      {
        q: 'Why in the evening?',
        a: 'Because the liver makes most of its cholesterol overnight. The label records something counter-intuitive about this: a bedtime dose produces 60% lower systemic bioavailability than a morning dose, and it was still marginally the more effective schedule, though not significantly so. That is a clean illustration of what the drug is for — it is not trying to reach a blood concentration, it is trying to reach an organ at the hour that organ is busiest, and blood levels are a side effect of that rather than the goal.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Shepherd J, Cobbe SM, Ford I, et al. Prevention of coronary heart disease with pravastatin in men with hypercholesterolemia (WOSCOPS). N Engl J Med 1995;333:1301-1307',
        identifier: '10.1056/NEJM199511163332001',
        kind: 'doi',
      },
      {
        label:
          'Sacks FM, Pfeffer MA, Moye LA, et al. The effect of pravastatin on coronary events after myocardial infarction in patients with average cholesterol levels (CARE). N Engl J Med 1996;335:1001-1009',
        identifier: '10.1056/NEJM199610033351401',
        kind: 'doi',
      },
      {
        label:
          'The Long-Term Intervention with Pravastatin in Ischaemic Disease (LIPID) Study Group. Prevention of cardiovascular events and death with pravastatin in patients with coronary heart disease and a broad range of initial cholesterol levels. N Engl J Med 1998;339:1349-1357',
        identifier: '10.1056/NEJM199811053391902',
        kind: 'doi',
      },
      {
        label:
          'Shepherd J, Blauw GJ, Murphy MB, et al. Pravastatin in elderly individuals at risk of vascular disease (PROSPER): a randomised controlled trial. Lancet 2002;360:1623-1630',
        identifier: '10.1016/s0140-6736(02)11600-x',
        kind: 'doi',
      },
      {
        label:
          'ALLHAT Officers and Coordinators for the ALLHAT Collaborative Research Group. Major outcomes in moderately hypercholesterolemic, hypertensive patients randomized to pravastatin vs usual care (ALLHAT-LLT). JAMA 2002;288:2998-3007',
        identifier: '10.1001/jama.288.23.2998',
        kind: 'doi',
      },
      {
        label:
          'Pravastatin sodium United States prescribing information — Indications 1.1 to 1.3, Contraindications 4, Warnings and Precautions 5.1 to 5.3, Drug Interactions 7.1 to 7.5, Clinical Pharmacology 12.1 and 12.3 (NDA 019898)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019898',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — pravastatin, 93 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 54687 — pravastatin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54687',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Lovastatin — the first statin, whose primary-prevention licence lists heart attacks and
  //    revascularisations and pointedly does not list death, and which is also sold as a food.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lovastatin',
    name: 'Lovastatin',
    tradeName: 'Mevacor / Altoprev',
    sponsor:
      'Merck Sharp & Dohme (originator, NDA 019643); Covis Pharma holds the Altoprev extended-release form; generic in the United States since 2001',
    targetGene: 'HMGCR',
    targetProtein:
      '3-hydroxy-3-methylglutaryl-coenzyme A reductase, inhibited by the β-hydroxyacid formed when the lactone ring is hydrolysed in the body',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1987,
    indication:
      'In individuals without symptomatic cardiovascular disease with average to moderately elevated total and LDL cholesterol and below-average HDL cholesterol, to reduce the risk of myocardial infarction, unstable angina and coronary revascularisation procedures; to slow the progression of coronary atherosclerosis in patients with coronary heart disease; and as an adjunct to diet to reduce elevated total and LDL cholesterol in primary hypercholesterolaemia and in adolescents with heterozygous familial hypercholesterolaemia',
    patientFriendlyIndication:
      'High cholesterol, and the prevention of a first heart attack in people with average cholesterol and low HDL',
    anatomicalSite:
      'Hepatocyte cytoplasm — the endoplasmic reticulum membrane of the liver cell, reached after extensive CYP3A4-dependent first-pass extraction',
    conditionContext: {
      conditionExplainer:
        'Atherosclerosis is a decades-long process in which LDL particles accumulate in artery walls. Lovastatin acts on the rate at which that accumulation happens, not on a plaque that is already there.',
      whyItMatters:
        'This is the molecule that started the class. It was isolated from the mould Aspergillus terreus, approved in 1987 as the first HMG-CoA reductase inhibitor anywhere, and it is the reason every other drug on this list exists. It is also the only statin that is simultaneously a prescription medicine and, in a slightly different container, a food supplement — because monacolin K in red yeast rice is structurally the same molecule.',
      whoTakesThis:
        'Adults with high cholesterol; adults with average cholesterol and low HDL at raised coronary risk; adolescents with familial hypercholesterolaemia. Not people on strong CYP3A4 inhibitors, in whom it is contraindicated outright.',
      clinicalGoals:
        'A lower LDL cholesterol, and — in the population its primary prevention licence describes — fewer heart attacks, fewer episodes of unstable angina and fewer revascularisations. Not, according to the licence, fewer deaths.',
    },
    oneSentenceVerdict:
      'The first statin ever approved, which in 6,605 people with average cholesterol and low HDL cut first acute major coronary events from 5.5% to 3.5% over a median 5.1 years (p<0.001) while sudden cardiac death was 8 against 9 — and whose primary-prevention indication accordingly lists myocardial infarction, unstable angina and revascularisation, and does not list death.',
    laymanHowItWorks:
      'Lovastatin is made by a mould, and like the mould compound it came from it is a closed-ring molecule that the body has to open before it does anything. The opened form blocks the enzyme performing the slowest step in building cholesterol, so the liver cell runs short and responds by putting more LDL receptors on its surface, pulling cholesterol-carrying particles out of the blood. Because it is broken down almost entirely by the liver enzyme CYP3A4, anything that blocks that enzyme sends its levels up sharply, which is why its list of forbidden combinations is the longest of any statin.',
    auditConfidence: 'High Confidence',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0430 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 31 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1987 under NDA 019643, the first HMG-CoA reductase inhibitor licensed anywhere, and generic since 2001. It has largely been displaced by later statins that lower LDL further with shorter interaction lists, and its most common modern encounter is not in a pharmacy at all — it is the monacolin K in a red yeast rice supplement.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Lovastatin is the weakest of the widely used statins on LDL lowering and carries the most restrictive interaction table. Every reason to prefer another statin is one of those two facts; the reason it survives is that it is cheap and very well characterised.',
      conventionalRx: [
        {
          name: 'Atorvastatin (Lipitor)',
          class: 'HMG-CoA reductase inhibitor, lipophilic, CYP3A4 substrate',
          howItCompares:
            'Considerably more LDL lowering per tablet at a lower acquisition price, with hard-endpoint trials of its own. It shares the CYP3A4 route, but its exposure rises less steeply on enzyme inhibition, so its interactions are managed with dose caps rather than the outright contraindications lovastatin carries.',
          typicalCost:
            'US$0.0281 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 278 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper, stronger, less restricted. Cons: still CYP3A4-dependent; the same class muscle and glycaemia signals.',
        },
        {
          name: 'Rosuvastatin (Crestor)',
          class: 'HMG-CoA reductase inhibitor, hydrophilic, minimally CYP-metabolised',
          howItCompares:
            'The strongest LDL reduction of the four and almost no CYP3A4 involvement, so the antifungals, macrolides and protease inhibitors that are contraindicated with lovastatin are not contraindicated with it. Its outcome evidence comes from JUPITER rather than from a primary prevention trial in this exact population.',
          typicalCost:
            'US$0.0449 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 179 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: potency plus freedom from CYP3A4. Cons: transporter-mediated interactions with ciclosporin and some antivirals; lower dose ceilings in East Asian populations.',
        },
        {
          name: 'Simvastatin (Zocor)',
          class: 'HMG-CoA reductase inhibitor, lipophilic, CYP3A4 substrate',
          howItCompares:
            'A single extra methyl group on the same fungal scaffold, and a substantially larger evidence base: 4S and the Heart Protection Study both measured all-cause mortality and both found it reduced, which lovastatin has never demonstrated.',
          typicalCost:
            'US$0.0314 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 90 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: mortality trials; cheaper. Cons: shares the CYP3A4 problem; its own top dose is restricted.',
        },
      ],
      naturalFoods: [
        {
          name: 'Red yeast rice',
          activeCompound: 'Monacolin K, which NCCIH states is structurally identical to lovastatin',
          biologicalMechanism:
            'Monascus purpureus grown on rice produces monacolin K, the same molecule as this drug. It inhibits HMG-CoA reductase by exactly the mechanism described on this page and carries the same muscle and liver risks, without a stated dose.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: NCCIH reports that across 26 brands found to contain monacolin K, the quantity ranged more than 60-fold, from 0.09 to 5.48 mg per 1,200 mg of red yeast rice, and that labels do not usually state it. EFSA concluded in 2018 that it was unable to identify a dietary intake of monacolins from red yeast rice that does not give rise to concerns about harmful effects to health, with case reports of severe muscle and liver injury at intakes as low as 3 mg a day.',
          monthlyCost: '',
        },
        {
          name: 'Soluble fibre — oat β-glucan, psyllium, barley, legumes',
          activeCompound: 'Viscous soluble fibre, principally β-glucan',
          biologicalMechanism:
            'Traps bile acids so they are excreted rather than reabsorbed; the liver rebuilds them from cholesterol, depletes its internal pool and upregulates LDL receptors — the same final step lovastatin reaches by blocking synthesis instead.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: randomised trials report LDL reductions of a few per cent, against 25% for lovastatin 20 to 40 mg in AFCAPS/TexCAPS, and none has reported a cardiovascular outcome.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Grapefruit juice is on the label, not in folklore',
          action: 'Avoid grapefruit juice.',
          patientImpact:
            'The label’s interaction table lists grapefruit juice alongside the pharmaceutical CYP3A4 inhibitors with the instruction to avoid it. Grapefruit furanocoumarins inactivate intestinal CYP3A4 irreversibly, so spacing the tablet and the juice apart does not help.',
          clinicalPrecaution:
            'The same table contraindicates ketoconazole, itraconazole, posaconazole, voriconazole, erythromycin, clarithromycin, telithromycin, HIV protease inhibitors, boceprevir, telaprevir, nefazodone and cobicistat-containing products.',
        },
        {
          name: 'Say if you already take a heart-rhythm or blood-pressure drug',
          action: 'Mention diltiazem, verapamil, amiodarone or dronedarone before starting.',
          patientImpact:
            'The label caps lovastatin at 40 mg daily with any of those four, and at 20 mg daily with ciclosporin or danazol. Gemfibrozil is to be avoided altogether.',
          clinicalPrecaution:
            'These are not theoretical limits: myopathy risk rises with plasma concentration of HMG-CoA reductase inhibitory activity, and each of these drugs raises it.',
        },
        {
          name: 'Do not treat a red yeast rice capsule as a milder option',
          action:
            'If you are taking red yeast rice, tell whoever prescribes for you, and do not take it alongside a statin.',
          patientImpact:
            'You would be taking two doses of the same drug class, one of them of unknown size. NCCIH found more than a 60-fold range of monacolin K content across brands, and the amount is not usually on the label.',
          clinicalPrecaution:
            'NCCIH states that red yeast rice products with enhanced or added lovastatin cannot be marketed as dietary supplements in the United States. Whether any given imported product complies is not something a purchaser can determine from the container.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC[C@H](C)C(=O)O[C@H]1C[C@H](C=C2[C@H]1[C@H]([C@H](C=C2)C)CC[C@@H]3C[C@H](CC(=O)O3)O)C',
      chemicalFormula: 'C24H36O5',
      molecularWeight: '404.50 g/mol',
      targetReceptorAffinity:
        'A lactone prodrug. The label states that lovastatin is a lactone readily hydrolysed in vivo to the corresponding β-hydroxyacid, a strong inhibitor of HMG-CoA reductase. The molecule differs from simvastatin by a single methyl group on the ester side chain: lovastatin carries 2-methylbutyryl where simvastatin carries 2,2-dimethylbutyryl. It is metabolised by CYP3A4, which is why strong inhibitors of that enzyme are contraindicated rather than dose-capped, and why grapefruit juice appears in the same table as ketoconazole.',
      structureSource: {
        label:
          'PubChem CID 53232 (lovastatin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; prodrug hydrolysis and metabolic route from the lovastatin United States prescribing information, Clinical Pharmacology',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/53232',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lov-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Separate lovastatin from the other monacolins the mould also makes',
          description:
            'Aspergillus terreus and Monascus purpureus both produce a family of related monacolins, not a single compound: monacolin J, hydroxy and dehydro analogues, and the ring-opened acids of each. Several are weakly active. A total-monacolin assay will therefore pass material whose lovastatin content is wrong, which is exactly the failure mode that makes red yeast rice unquantifiable as a supplement.',
          reagentsAndBuffer:
            'Lovastatin USP reference standard, reversed-phase HPLC resolving lovastatin lactone, lovastatin hydroxyacid, monacolin J and dehydro analogues, ammonium acetate buffer at controlled pH, citrinin screening by fluorescence detection for Monascus-derived material, Karl Fischer titration',
        },
        {
          id: 'lov-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ferment the mould and let its own enzymes install the side chain',
          description:
            'Lovastatin is a natural product, not a semisynthesis. The decalin core is assembled by the iterative polyketide synthase LovB with the enoyl reductase LovC, and the 2-methylbutyryl side chain is attached by the acyltransferase LovD. The commercial process is fermentation and extraction; the chemistry that matters happens inside the organism, and process control is a fermentation problem rather than a reaction problem.',
          dependsOnStepId: 'lov-w1',
          reagentsAndBuffer:
            'Aspergillus terreus production strain, carbohydrate-limited fed-batch fermentation with controlled dissolved oxygen and pH, solvent extraction of the broth, activated carbon treatment for pigment removal',
        },
        {
          id: 'lov-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the lactone and hold the acid form to specification',
          description:
            'The lactone crystallises well and the ring-opened acid does not, so crystallisation both purifies and sets the lactone-to-acid ratio. Since the acid is the active species and the lactone is the dispensed one, that ratio has to be a release specification rather than an outcome.',
          dependsOnStepId: 'lov-w2',
          reagentsAndBuffer:
            'Recrystallisation from acetone-water or methanol, butylated hydroxyanisole as antioxidant in the finished tablet, HPLC release testing against USP related-substance limits, dissolution testing in the finished dosage form',
        },
        {
          id: 'lov-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure what a CYP3A4 inhibitor does to hepatic exposure',
          description:
            'The clinically decisive property of this molecule is not its potency but its dependence on CYP3A4 for first-pass clearance. The assay that captures that runs hepatocyte incubations with and without a strong inhibitor and measures the change in exposure of the active hydroxyacid. A programme that measures only intrinsic potency will not predict the interaction table, which is where the harm actually comes from.',
          dependsOnStepId: 'lov-w3',
          reagentsAndBuffer:
            'Cryopreserved primary human hepatocytes and recombinant CYP3A4 with NADPH-regenerating system, ketoconazole as the strong inhibitor control, 6′-β-hydroxytestosterone as the CYP3A4 activity marker, LC-MS/MS quantification of lovastatin lactone and hydroxyacid separately',
        },
        {
          id: 'lov-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Inhibit the enzyme with the opened acid, then count LDL receptors',
          description:
            'Only the hydroxyacid inhibits the enzyme, so the assay must be run on hydrolysed material. The endpoint that corresponds to the clinical effect is one step further along: LDL receptor upregulation and LDL uptake in a hepatic cell line. The label itself describes the mechanism in those terms — reduced VLDL and induction of the LDL receptor — rather than in terms of enzyme occupancy.',
          dependsOnStepId: 'lov-w4',
          reagentsAndBuffer:
            'Recombinant human HMG-CoA reductase catalytic domain, HMG-CoA and NADPH with 340 nm absorbance readout, lovastatin hydroxyacid prepared by controlled alkaline hydrolysis, HepG2 cells for LDLR flow cytometry and fluorescent-LDL uptake, mevalonate rescue as the specificity control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lov-a1',
        category: 'measured',
        title: 'AFCAPS/TexCAPS: fewer first heart attacks in people with unremarkable cholesterol',
        laymanSummary:
          'Six and a half thousand people with average cholesterol and low HDL, none of whom had known heart disease, took lovastatin or placebo for five years. First major coronary events fell from 5.5% to 3.5%.',
        technicalDetails:
          'AFCAPS/TexCAPS randomised 6,605 participants — 5,608 men aged 45 to 73 and 997 women aged 55 to 73 — without symptomatic cardiovascular disease, with total cholesterol 180 to 264 mg/dL, LDL 130 to 190 mg/dL and HDL at or below 45 mg/dL in men and 47 mg/dL in women, to lovastatin 20 to 40 mg daily or placebo. Over an average 5.2 years the primary endpoint of first acute major coronary event occurred 116 times against 183: relative risk 0.63 (95% CI 0.50 to 0.79), p<0.001, or 3.5% against 5.5% on the label’s presentation. Myocardial infarction fell 40% (1.7% against 2.9%, p=0.002), unstable angina 32% (1.8% against 2.6%, p=0.023) and coronary revascularisation 33% (3.2% against 4.8%, p=0.001). Lovastatin lowered LDL by 25% to 115 mg/dL and raised HDL 6%. The trial is important because it treated people whose cholesterol no guideline of the time flagged, and it found a benefit.',
        evidenceSource:
          'Downs JR, Clearfield M, Weis S, et al. JAMA 1998;279:1615-1622 (AFCAPS/TexCAPS)',
        doi: '10.1001/jama.279.20.1615',
        measuredMetric:
          'First acute major coronary event — myocardial infarction, unstable angina or sudden cardiac death — over an average 5.2 years',
        auditFlag: 'verified',
      },
      {
        id: 'lov-a2',
        category: 'inferred',
        title: 'The licence lists heart attacks and revascularisations, and not death',
        laymanSummary:
          'Read the indication carefully. For primary prevention, lovastatin is licensed to reduce heart attacks, unstable angina and stenting or bypass. Death is not on the list, and the fatal component of its own trial did not move.',
        technicalDetails:
          'The lovastatin primary prevention indication reads: in individuals without symptomatic cardiovascular disease, average to moderately elevated total and LDL cholesterol and below-average HDL, lovastatin is indicated to reduce the risk of myocardial infarction, unstable angina and coronary revascularisation procedures. There is no mortality claim, and the contrast with sibling molecules is deliberate rather than accidental: simvastatin is licensed to reduce the risk of total mortality, and pravastatin is licensed to reduce the risk of total mortality by reducing coronary death. Within AFCAPS/TexCAPS itself, the label reports the three components of the primary composite as myocardial infarction 54 against 94, unstable angina 54 against 80 and sudden cardiac death 8 against 9. The composite moved because two non-fatal components moved. The fatal component did not, and the trial was never large enough to expect it to. A reader told that a statin "prevents death" should check which statin and which label.',
        evidenceSource:
          'Lovastatin United States prescribing information, Indications and Usage, Primary Prevention of Coronary Heart Disease, and Clinical Pharmacology, Clinical Studies in Adults (NDA 019643)',
        inferredClaim:
          'That the AFCAPS/TexCAPS composite demonstrates a survival benefit, when its fatal component was 8 events against 9 and the licensed indication makes no mortality claim',
        auditFlag: 'caution',
      },
      {
        id: 'lov-a3',
        category: 'failed',
        title: 'Two angiographic trials of the same drug, and they disagreed',
        laymanSummary:
          'The label reports two studies that photographed coronary arteries before and after. One found lovastatin slowed the disease. The other found no significant difference at all on its main measurement.',
        technicalDetails:
          'The label describes the Canadian Coronary Atherosclerosis Intervention Trial (CCAIT), in which lovastatin 20 to 80 mg daily significantly slowed lesion progression and reduced the proportion of patients with disease progression (33% against 50%) and with new lesions (16% against 32%). It then states that in the Monitored Atherosclerosis Regression Study (MARS), of similar design at lovastatin 80 mg daily, no statistically significant difference between lovastatin and placebo was seen for the primary endpoint. The MARS publication bears that out and shows how the disagreement arose: in 270 patients, average percent diameter stenosis — the primary endpoint — increased 2.2% on placebo and 1.6% on lovastatin, p>0.20. The secondary global change score did separate, +0.9 against +0.4, p=0.002, with 28 lovastatin recipients against 13 on placebo showing regression, and in lesions of 50% or more stenosis the drug arm improved by 4.1% while placebo worsened by 0.9%, p=0.005. So the trial missed its primary endpoint, hit its secondary one, and is described in the literature as positive and on the label as negative. Both descriptions are accurate about different measurements, which is exactly the problem with imaging surrogates — the same problem ENHANCE later demonstrated for simvastatin and carotid wall thickness.',
        evidenceSource:
          'Blankenhorn DH, Azen SP, Kramsch DM, et al. Ann Intern Med 1993;119:969-976 (MARS); lovastatin United States prescribing information, Clinical Pharmacology, Atherosclerosis (NDA 019643)',
        doi: '10.7326/0003-4819-119-10-199311150-00002',
        measuredMetric:
          'Per-patient change in percent diameter stenosis by quantitative coronary angiography, primary endpoint of MARS: +2.2% on placebo against +1.6% on lovastatin, p>0.20',
        auditFlag: 'contested',
      },
      {
        id: 'lov-a4',
        category: 'measured',
        title: 'EXCEL measured the dose-dependence of muscle injury directly',
        laymanSummary:
          'A 48-week safety study in over six and a half thousand people found one case of muscle injury among those on 20 to 40 mg, and four among the smaller group on 80 mg.',
        technicalDetails:
          'The label reports that in EXCEL, a clinical study in which patients were carefully monitored and some interacting drugs were excluded, there was one case of myopathy among 4,933 patients randomised to lovastatin 20 to 40 mg daily for 48 weeks, and four among 1,649 patients randomised to 80 mg daily. Myopathy is defined as muscle pain, tenderness or weakness with creatine kinase above ten times the upper limit of normal, and the label states that the risk of myopathy and rhabdomyolysis is dose related and is increased by high plasma levels of HMG-CoA reductase inhibitory activity. Reading across the class, the same dose-dependence appears in the simvastatin record at 20, 40 and 80 mg, which is the mechanistic reason a class-wide interaction table exists at all.',
        evidenceSource:
          'Lovastatin United States prescribing information, Warnings, Myopathy/Rhabdomyolysis — EXCEL (NDA 019643)',
        measuredMetric:
          'Myopathy incidence at 20 to 40 mg against 80 mg over 48 weeks under monitored conditions with interacting drugs excluded',
        auditFlag: 'verified',
      },
      {
        id: 'lov-a5',
        category: 'conclusion_shift',
        title: 'The same molecule is a prescription drug and a supplement',
        laymanSummary:
          'Monacolin K in red yeast rice is structurally identical to lovastatin. So a capsule sold as a food contains a statin, at a dose that varies more than sixtyfold between brands and is not printed on the label.',
        technicalDetails:
          'NCCIH states that monacolin K is structurally identical to the medicine lovastatin, that in 26 brands found to contain monacolin K the quantity ranged more than 60-fold from 0.09 to 5.48 mg per 1,200 mg of red yeast rice, and that red yeast rice products with enhanced or added lovastatin cannot be marketed as dietary supplements in the United States. EFSA reached a compatible conclusion from the other direction in 2018: it was unable to identify a dietary intake of monacolins from red yeast rice that does not give rise to concerns about harmful effects to health, having received case reports of severe musculoskeletal and liver injury at intakes as low as 3 mg a day, and noted that monacolin K in lactone form is identical to lovastatin. The regulatory conclusion has shifted in one direction over three decades: from treating red yeast rice as a food, to treating monacolin content as the thing that determines whether it is a food or a drug.',
        evidenceSource:
          'NCCIH, Red Yeast Rice: What You Need To Know (National Center for Complementary and Integrative Health); EFSA Journal 2018;16(8):5368',
        doi: '10.2903/j.efsa.2018.5368',
        inferredClaim:
          'That a red yeast rice supplement is a gentler botanical alternative to a statin, when it is the same molecule at an undeclared and highly variable dose',
        auditFlag: 'caution',
      },
      {
        id: 'lov-a6',
        category: 'failed',
        title: 'The longest contraindication table of any statin',
        laymanSummary:
          'Twelve named drug classes are contraindicated outright, two more cap the dose at 20 mg, four more cap it at 40 mg, and grapefruit juice is on the same list. This is what total dependence on one liver enzyme costs.',
        technicalDetails:
          'The label contraindicates lovastatin with strong CYP3A4 inhibitors: ketoconazole, itraconazole, posaconazole, voriconazole, erythromycin, clarithromycin, telithromycin, HIV protease inhibitors, boceprevir, telaprevir, nefazodone and cobicistat-containing products. Gemfibrozil is to be avoided. Ciclosporin and danazol cap the dose at 20 mg daily; diltiazem, dronedarone, verapamil and amiodarone cap it at 40 mg daily; grapefruit juice is to be avoided. Because CYP3A4 is the enzyme that clears the majority of small-molecule drugs, this is not a rare edge case — it is a routine collision, and it is the practical reason lovastatin has been displaced. Compare pravastatin, which is cleared by isomerisation and ring hydroxylation and whose entire interaction section consists of two dose caps and three cautions.',
        evidenceSource:
          'Lovastatin United States prescribing information, Contraindications and Warnings, Myopathy/Rhabdomyolysis interaction table (NDA 019643)',
        measuredMetric:
          'The label’s enumerated contraindications and dose caps arising from CYP3A4 dependence',
        auditFlag: 'caution',
      },
      {
        id: 'lov-a7',
        category: 'inferred',
        title: 'The trial could not tell whether it helps people whose only risk factor is age',
        laymanSummary:
          'AFCAPS/TexCAPS enrolled people who mostly had another risk factor alongside their age. For the group whose only risk factor was being older, the label says there were too few events to say anything.',
        technicalDetails:
          'The label records that 63% of AFCAPS/TexCAPS participants had at least one risk factor beyond age — HDL below 35 mg/dL, hypertension, family history, smoking or diabetes — and that participants with two or more risk factors had risk reductions of 43% in acute major coronary events and 37% in revascularisation. It then states that because there were too few events among participants with age as their only risk factor, the effect of lovastatin on outcomes could not be adequately assessed in that subgroup. Women were 997 of 6,605 participants, and the trend across sexes is described as consistent rather than separately significant. The trial is often cited as establishing statin benefit in low-risk primary prevention; what it establishes is benefit in people with average lipids and at least one additional risk factor, which is a narrower and more useful claim.',
        evidenceSource:
          'Lovastatin United States prescribing information, Clinical Pharmacology, AFCAPS/TexCAPS subgroup findings (NDA 019643); Downs JR et al. JAMA 1998;279:1615-1622',
        doi: '10.1001/jama.279.20.1615',
        inferredClaim:
          'That AFCAPS/TexCAPS demonstrates benefit in genuinely low-risk primary prevention, when the label states the effect could not be assessed in participants whose only risk factor was age',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A mould makes it, and the ring starts closed',
        laymanDesc:
          'Lovastatin is a natural product of the mould Aspergillus terreus, and what you swallow is a closed-ring form that does not inhibit anything until the body opens it.',
        molecularDetail:
          'The label describes lovastatin as a lactone readily hydrolysed in vivo to the corresponding β-hydroxyacid, a strong inhibitor of HMG-CoA reductase. The decalin core is assembled by the polyketide synthase LovB with LovC, and the 2-methylbutyryl side chain installed by the acyltransferase LovD.',
        iconName: 'Sprout',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'One liver enzyme decides how much survives',
        laymanDesc:
          'Almost all of the dose is destroyed on its first pass through the liver by a single enzyme. Anything that blocks that enzyme raises the drug level sharply.',
        molecularDetail:
          'Lovastatin is a CYP3A4 substrate with extensive first-pass extraction. The label contraindicates twelve named strong CYP3A4 inhibitors outright and caps the dose in the presence of ciclosporin, danazol, diltiazem, dronedarone, verapamil and amiodarone; grapefruit juice appears in the same table.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The opened acid blocks the rate-limiting enzyme',
        laymanDesc:
          'Inside the liver cell, the opened form jams the enzyme that performs the slowest step in cholesterol synthesis.',
        molecularDetail:
          'Specific inhibition of HMG-CoA reductase, the enzyme catalysing conversion of HMG-CoA to mevalonate, an early step in cholesterol biosynthesis. The hydroxyacid is a transition-state analogue of the substrate; the lactone is essentially inactive.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'LDL receptors go up and cholesterol comes down',
        laymanDesc:
          'Short of cholesterol, the liver cell makes more receptors and pulls LDL out of the blood. The label describes the effect as both making less and clearing more.',
        molecularDetail:
          'The label states that the LDL-lowering effect may involve both reduction of VLDL cholesterol concentration and induction of the LDL receptor, leading to reduced production and increased catabolism of LDL. Apolipoprotein B also falls. Lovastatin 20 to 40 mg reduced LDL by 25% in AFCAPS/TexCAPS.',
        iconName: 'Download',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer first heart attacks',
        laymanDesc:
          'In people with average cholesterol, low HDL and no known heart disease, first major coronary events fell by a bit over a third.',
        molecularDetail:
          'AFCAPS/TexCAPS: first acute major coronary event 116 against 183, RR 0.63 (95% CI 0.50 to 0.79), p<0.001, or 3.5% against 5.5%. Myocardial infarction 1.7% against 2.9% (p=0.002); unstable angina 1.8% against 2.6% (p=0.023); revascularisation 3.2% against 4.8% (p=0.001).',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the licence does not claim',
        laymanDesc:
          'Not death. The primary-prevention indication lists heart attack, unstable angina and revascularisation, and stops there.',
        molecularDetail:
          'Sudden cardiac death within the AFCAPS/TexCAPS primary composite was 8 events against 9. The indication makes no mortality claim, unlike the simvastatin and pravastatin labels. The label also states the effect could not be adequately assessed in participants whose only risk factor was age.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'AFCAPS/TexCAPS (JAMA 1998;279:1615-1622)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 6605,
        primaryEndpoint:
          'First acute major coronary event — fatal or non-fatal myocardial infarction, unstable angina or sudden cardiac death — in adults without clinically evident cardiovascular disease with average cholesterol and below-average HDL',
        endpointMet: true,
        statisticalPValue:
          '116 first events against 183; relative risk 0.63 (95% CI 0.50 to 0.79), p<0.001, over an average 5.2 years; 3.5% against 5.5% on the label’s presentation',
        unreportedAdverseSignals:
          'The composite was driven by its non-fatal components: myocardial infarction 54 against 94 and unstable angina 54 against 80, while sudden cardiac death was 8 against 9. The label states that too few events occurred among participants whose only risk factor was age for the effect in that subgroup to be assessed. Women were 997 of 6,605 participants.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'EXCEL — Expanded Clinical Evaluation of Lovastatin (reported in the NDA 019643 label)',
        phase: 'Phase 3, randomised, double-blind, 48-week safety and efficacy study',
        sampleSize: 6582,
        primaryEndpoint:
          'Lipid response and safety across lovastatin 20 to 80 mg daily under monitoring with some interacting drugs excluded',
        endpointMet: true,
        statisticalPValue:
          'Myopathy in one of 4,933 patients on 20 to 40 mg daily against four of 1,649 on 80 mg daily over 48 weeks',
        unreportedAdverseSignals:
          'Interacting drugs were excluded and monitoring was close, so the myopathy rates are a floor rather than a population estimate. The 48-week duration means no cardiovascular endpoint was measured; the sample size shown here is the sum of the two randomised groups the label quotes.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'MARS — Monitored Atherosclerosis Regression Study (Ann Intern Med 1993;119:969-976)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled angiographic trial',
        sampleSize: 270,
        primaryEndpoint:
          'Per-patient change in percent diameter stenosis by quantitative coronary angiography, lovastatin 80 mg daily against placebo, in patients aged 37 to 67 with angiographically defined coronary disease',
        endpointMet: false,
        statisticalPValue:
          'Average percent diameter stenosis increased 2.2% on placebo and 1.6% on lovastatin, p>0.20, despite LDL cholesterol falling 38% and total cholesterol 32% (p<0.001)',
        unreportedAdverseSignals:
          'The secondary global change score did separate: +0.9 against +0.4, p=0.002, with 28 lovastatin recipients against 13 on placebo scored as regressing, and in lesions of 50% stenosis or more the drug arm improved 4.1% while placebo worsened 0.9% (p=0.005). The trial is consequently cited as positive in the literature and reported as negative on the label. The companion trial CCAIT did find significant slowing on its own primary measurement.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'First acute major coronary events 116 against 183 in 6,605 adults with average cholesterol and low HDL (AFCAPS/TexCAPS, RR 0.63, 95% CI 0.50 to 0.79, p<0.001)',
        'Myocardial infarction 1.7% against 2.9% (p=0.002), unstable angina 1.8% against 2.6% (p=0.023) and revascularisation 3.2% against 4.8% (p=0.001) in the same trial',
        'Sudden cardiac death within that composite: 8 events against 9',
        'Myopathy in one of 4,933 patients at 20 to 40 mg against four of 1,649 at 80 mg over 48 weeks (EXCEL)',
        'LDL cholesterol reduced 25% and HDL raised 6% on lovastatin 20 to 40 mg daily',
      ],
      unsupportedInferences: [
        'That lovastatin has been shown to reduce death — its primary-prevention indication lists myocardial infarction, unstable angina and revascularisation, and no mortality claim',
        'That AFCAPS/TexCAPS establishes benefit in low-risk primary prevention, when 63% of participants had a further risk factor and the label says the age-only subgroup could not be assessed',
        'That angiographic slowing translates reliably into fewer events, when this drug’s two imaging trials disagreed and MARS missed its own primary endpoint at p>0.20',
        'That red yeast rice is a botanical alternative rather than the same molecule at an undeclared dose',
      ],
      whatFailedInitially: [
        'MARS missed its primary angiographic endpoint — percent diameter stenosis +2.2% on placebo against +1.6% on lovastatin, p>0.20 — while CCAIT met its own',
        'The fatal component of the AFCAPS/TexCAPS composite, sudden cardiac death, did not separate: 8 events against 9',
        'The effect in participants whose only risk factor was age could not be assessed for want of events',
        'Total dependence on CYP3A4 produced the longest contraindication table in the class and is the reason the drug has been displaced clinically',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1987 as the first HMG-CoA reductase inhibitor licensed anywhere; generic since 2001',
        'About four United States cents a tablet at pharmacy acquisition cost, and largely superseded by atorvastatin and rosuvastatin on both potency and interactions',
        'Its most common present-day encounter is as monacolin K in red yeast rice, where NCCIH found a more than 60-fold range of content across brands',
        'Its licence remains the one statin licence in this file that makes no mortality claim of any kind',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 10, 20 and 40 mg with the evening meal; also an extended-release tablet (Altoprev) taken at bedtime',
      description:
        'Absorbed as the lactone and hydrolysed in vivo to the active β-hydroxyacid. First-pass extraction by the liver is extensive and CYP3A4-dependent, so systemic exposure to the active inhibitors is a small fraction of the dose and rises steeply when that enzyme is inhibited. The immediate-release tablet is taken with the evening meal because absorption is greater with food and because hepatic cholesterol synthesis peaks overnight. In severe renal insufficiency, with creatinine clearance below 30 mL/min, the label directs that increases above 20 mg a day be considered carefully and implemented cautiously.',
      safetyProfile:
        'Contraindicated in hypersensitivity, in active liver disease or unexplained persistent transaminase elevation, in pregnancy and lactation, and with strong CYP3A4 inhibitors — ketoconazole, itraconazole, posaconazole, voriconazole, erythromycin, clarithromycin, telithromycin, HIV protease inhibitors, boceprevir, telaprevir, nefazodone and cobicistat-containing products. Gemfibrozil should be avoided; ciclosporin and danazol cap the dose at 20 mg daily; diltiazem, dronedarone, verapamil and amiodarone cap it at 40 mg daily; grapefruit juice should be avoided. Myopathy with creatine kinase above ten times normal occurs and is dose related, sometimes as rhabdomyolysis with or without acute renal failure, and rare fatalities have occurred. Immune-mediated necrotising myopathy has been reported rarely and persists after discontinuation. Persistent transaminase rises above three times the upper limit of normal occurred in 1.9% of adults treated for at least a year in early trials, and fell slowly when the drug was interrupted.',
    },
    commonQuestions: [
      {
        q: 'Is lovastatin the same thing as red yeast rice?',
        a: 'Effectively yes, in one direction. NCCIH states that monacolin K, the active constituent of red yeast rice, is structurally identical to the medicine lovastatin. So a red yeast rice capsule is a statin capsule whose dose is unknown: NCCIH found that across 26 brands containing monacolin K, the quantity ranged more than 60-fold, from 0.09 to 5.48 mg per 1,200 mg of red yeast rice, and that labels do not usually say. EFSA reached the same molecular conclusion in 2018 and could not identify any intake of monacolins from red yeast rice that does not raise safety concerns. NCCIH also notes that products with enhanced or added lovastatin cannot legally be marketed as dietary supplements in the United States. If you would not take a statin of unknown strength, you should not take red yeast rice either — and you should certainly not take both.',
        auditNote:
          'This is the clearest example on the site of a regulatory boundary drawn by chemistry rather than by botany. The same molecule is a drug or a food depending on how much of it is in the container.',
      },
      {
        q: 'Does lovastatin stop people dying of heart disease?',
        a: 'That has not been shown for this molecule, and the licence reflects it. In primary prevention lovastatin is indicated to reduce the risk of myocardial infarction, unstable angina and coronary revascularisation procedures. There is no mortality claim. Its trial, AFCAPS/TexCAPS, reduced first acute major coronary events from 5.5% to 3.5% — a real result — but the fatal component of that composite was 8 sudden cardiac deaths against 9, and the trial was never large enough to measure survival. Simvastatin and pravastatin do carry mortality claims on their labels, resting on 4S, the Heart Protection Study and LIPID. If survival is the question, those are the molecules with the answer.',
      },
      {
        q: 'Why does lovastatin have such a long list of drugs to avoid?',
        a: 'Because it depends entirely on one enzyme, CYP3A4, to be cleared, and CYP3A4 handles a large share of all small-molecule drugs. When something blocks it, lovastatin levels rise, and muscle injury tracks the plasma level of inhibitory activity. The label therefore contraindicates twelve named strong inhibitors outright, caps the dose at 20 mg with ciclosporin or danazol and at 40 mg with diltiazem, dronedarone, verapamil or amiodarone, tells you to avoid gemfibrozil, and tells you to avoid grapefruit juice in the same table. Pravastatin and rosuvastatin do not go through CYP3A4 and their interaction sections are correspondingly short, which is why one of them is usually the answer when a collision is unavoidable.',
      },
      {
        q: 'Two trials looked at my arteries with X-rays and disagreed. What should I take from that?',
        a: 'Pictures of arteries are not the same measurement as clinical events, and the drug’s own label makes that distinction. CCAIT found lovastatin significantly slowed lesion progression, with disease progression in 33% against 50% and new lesions in 16% against 32%. MARS, of similar design at a higher dose, missed its primary endpoint — average percent diameter stenosis rose 2.2% on placebo and 1.6% on lovastatin, p>0.20 — while its secondary global change score separated at p=0.002. MARS is therefore quoted as positive in reviews and reported as negative on the label because those accounts use different endpoints from the same paper. Imaging endpoints are cheaper, faster and smaller than outcome trials, but less reliable; the same problem appeared again when adding ezetimibe to simvastatin lowered LDL further without improving carotid wall thickness.',
      },
      {
        q: 'It was the first statin. Is there any reason to choose it now?',
        a: 'Rarely. It lowers LDL less than atorvastatin or rosuvastatin, it costs more per tablet than atorvastatin at pharmacy acquisition price, and it carries the most restrictive interaction table in the class. Its historical importance is enormous and its clinical position is residual. Where it still appears is in people long established on it without problems, and — unintentionally — in people taking red yeast rice.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Downs JR, Clearfield M, Weis S, et al. Primary prevention of acute coronary events with lovastatin in men and women with average cholesterol levels: results of AFCAPS/TexCAPS. JAMA 1998;279:1615-1622',
        identifier: '10.1001/jama.279.20.1615',
        kind: 'doi',
      },
      {
        label:
          'Lovastatin United States prescribing information — Indications and Usage, Contraindications, Warnings (Myopathy/Rhabdomyolysis, EXCEL, interaction table), Clinical Pharmacology (Clinical Studies in Adults, AFCAPS/TexCAPS, CCAIT, MARS) (NDA 019643)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019643',
        kind: 'regulatory',
      },
      {
        label:
          'Blankenhorn DH, Azen SP, Kramsch DM, et al. Coronary angiographic changes with lovastatin therapy: the Monitored Atherosclerosis Regression Study (MARS). Ann Intern Med 1993;119:969-976',
        identifier: '10.7326/0003-4819-119-10-199311150-00002',
        kind: 'doi',
      },
      {
        label:
          'National Center for Complementary and Integrative Health. Red Yeast Rice: What You Need To Know — monacolin K identity with lovastatin, the more than 60-fold range of content across brands, and the United States marketing position',
        identifier: 'https://www.nccih.nih.gov/health/red-yeast-rice',
        kind: 'url',
      },
      {
        label:
          'EFSA Panel on Food Additives and Nutrient Sources added to Food. Scientific opinion on the safety of monacolins in red yeast rice. EFSA Journal 2018;16(8):5368',
        identifier: '10.2903/j.efsa.2018.5368',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — lovastatin, 31 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 53232 — lovastatin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/53232',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Fluvastatin — the first fully synthetic statin, which missed the primary endpoint in two of
  //    its three outcome trials, has the narrowest cardiovascular licence of the class, and costs
  //    about ninety times what simvastatin costs.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'fluvastatin',
    name: 'Fluvastatin',
    tradeName: 'Lescol / Lescol XL',
    sponsor:
      'Novartis Pharmaceuticals (originator, from Sandoz); generic in the United States, with the extended-release tablet the surviving presentation',
    targetGene: 'HMGCR',
    targetProtein:
      '3-hydroxy-3-methylglutaryl-coenzyme A reductase, inhibited competitively by fluvastatin itself — an entirely synthetic indole, not a fungal product or a derivative of one',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1993,
    indication:
      'To reduce the risk of undergoing coronary revascularisation procedures and to slow the progression of coronary atherosclerosis in adults with clinically evident coronary heart disease; as an adjunct to diet to reduce LDL cholesterol in adults with primary hyperlipidaemia; and as an adjunct to diet to reduce LDL cholesterol in adults and children aged 10 and over with heterozygous familial hypercholesterolaemia who require 80 mg of fluvastatin daily',
    patientFriendlyIndication:
      'High cholesterol, and reducing the chance of needing a stent or a bypass in people who already have coronary disease',
    anatomicalSite:
      'Hepatocyte cytoplasm — cleared mainly by CYP2C9 rather than by CYP3A4, which gives this statin an interaction profile that looks nothing like the rest of the class',
    conditionContext: {
      conditionExplainer:
        'The target is atherosclerosis, the decades-long accumulation of LDL particles in artery walls. Statins slow the accumulation; they do not remove what is already there.',
      whyItMatters:
        'Fluvastatin was the first statin designed rather than harvested — a synthetic indole with no fungal ancestor. That is a genuine scientific milestone and it did not translate into a genuine clinical advantage. Its licence claims less than any other statin’s, two of its three outcome trials missed their primary endpoints, and it is the most expensive statin in the American pharmacy by a very wide margin.',
      whoTakesThis:
        'Adults with coronary disease and high cholesterol, adults and children from ten with familial hypercholesterolaemia, and — historically — patients on drug regimens where the CYP3A4 statins were unusable.',
      clinicalGoals:
        'Lower LDL cholesterol, and a lower chance of coronary revascularisation. The licence does not claim reduced myocardial infarction or reduced death, and no fluvastatin trial has demonstrated either as a primary endpoint.',
    },
    oneSentenceVerdict:
      'The first fully synthetic statin, licensed only to reduce coronary revascularisations and slow atherosclerotic progression — never to prevent infarction or death — which met its primary endpoint in LIPS (major adverse cardiac events 21.4% against 26.7%, RR 0.78, p=0.01) and missed it in both ALERT (RR 0.83, p=0.139) and FLARE (p=0.95), and which costs about ninety times as much per tablet as simvastatin.',
    laymanHowItWorks:
      'Fluvastatin blocks the enzyme the liver uses to make cholesterol, so the liver cell puts out more receptors and pulls LDL particles from the bloodstream instead. Two things set it apart. It is entirely man-made — an indole ring designed to mimic what the fungal statins do, rather than a mould product tinkered with afterwards. And it is broken down mostly by a different liver enzyme, CYP2C9, which is why the drugs it interferes with are warfarin, phenytoin and glyburide rather than the antifungals and antibiotics that collide with the rest of the class.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$2.82 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 15 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Genericised, and still priced at about ninety times simvastatin per tablet at pharmacy acquisition cost — US$2.82 against US$0.0314, both from the same CMS survey effective 19 August 2026. Only 15 products are listed against 90 for simvastatin and 278 for atorvastatin, and thin generic competition is the ordinary explanation for a price that stays high after patent expiry. Nothing about the drug’s measured performance supports the difference.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'There is no property of fluvastatin that another statin does not match more cheaply, with one narrow exception: it is the statin least dependent on CYP3A4 and CYP2C19, so it occupies a small corner of the interaction space that rosuvastatin and pravastatin do not quite cover. Everything else about it — potency, evidence, price — argues for something else.',
      conventionalRx: [
        {
          name: 'Atorvastatin (Lipitor)',
          class: 'HMG-CoA reductase inhibitor, CYP3A4 substrate',
          howItCompares:
            'Roughly a hundredth of the price per tablet, substantially more LDL lowering, and outcome trials that measured infarction and death rather than revascularisation alone.',
          typicalCost:
            'US$0.0281 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 278 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: price, potency, evidence. Cons: CYP3A4-dependent, so it collides with azoles, macrolides and protease inhibitors where fluvastatin does not.',
        },
        {
          name: 'Rosuvastatin (Crestor)',
          class: 'HMG-CoA reductase inhibitor, hydrophilic, minimally CYP-metabolised',
          howItCompares:
            'The strongest LDL reduction available and almost no CYP involvement at all, at about a sixtieth of fluvastatin’s price. It is the obvious answer whenever fluvastatin is being considered for interaction reasons.',
          typicalCost:
            'US$0.0449 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 179 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: potency plus a clean interaction profile plus price. Cons: transporter-mediated interactions with ciclosporin and some antivirals; lower dose ceilings in East Asian populations.',
        },
        {
          name: 'Pravastatin (Pravachol)',
          class: 'HMG-CoA reductase inhibitor, hydrophilic, not CYP3A4-metabolised',
          howItCompares:
            'Comparable modest potency and a comparably clean interaction profile, at about a forty-fifth of the price — and with three placebo-controlled trials that measured coronary and all-cause mortality rather than revascularisation.',
          typicalCost:
            'US$0.0620 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 93 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: mortality evidence; price. Cons: like fluvastatin, weak on LDL by modern standards.',
        },
      ],
      naturalFoods: [
        {
          name: 'Soluble fibre — oat β-glucan, psyllium, barley, legumes',
          activeCompound: 'Viscous soluble fibre, principally β-glucan',
          biologicalMechanism:
            'Binds bile acids so they are excreted rather than reabsorbed; the liver rebuilds them out of cholesterol, its internal pool falls and LDL receptor expression rises — the same final step fluvastatin reaches by blocking synthesis.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: LDL reductions reported in randomised trials are a few per cent, against 32 to 37% for fluvastatin 80 mg in ALERT and FLARE, and none has reported a cardiovascular outcome.',
          monthlyCost: '',
        },
        {
          name: 'Plant sterols and stanols — fortified spreads, nuts, seeds',
          activeCompound: 'β-sitosterol, campesterol, sitostanol',
          biologicalMechanism:
            'Compete with cholesterol for incorporation into intestinal micelles and reduce absorption, acting on the absorption side rather than the synthesis side and therefore additive to a statin.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: LDL reductions of roughly 5 to 10% in randomised trials, with no cardiovascular outcome trial.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'If you take warfarin, the INR needs watching',
          action:
            'Say so before starting or stopping fluvastatin, and expect blood tests around the change.',
          patientImpact:
            'The label directs obtaining an INR before starting fluvastatin and frequently enough after initiation or discontinuation to ensure no significant alteration occurs, then at regular intervals once stable. Warfarin is a CYP2C9 substrate and so is fluvastatin, which is the whole reason.',
          clinicalPrecaution:
            'The same mechanism puts phenytoin and glyburide on the list: the label directs monitoring plasma phenytoin levels and blood glucose respectively when fluvastatin is started.',
        },
        {
          name: 'Ciclosporin and fluconazole are avoid, not adjust',
          action:
            'Mention any transplant immunosuppressant or antifungal treatment before this statin is started.',
          patientImpact:
            'The label directs avoiding fluvastatin with ciclosporin and with fluconazole, and avoiding gemfibrozil. Fibrates, colchicine and lipid-modifying doses of niacin at 1 g a day or more require a judgement that the benefit outweighs the increased risk of myopathy and rhabdomyolysis, with monitoring during initiation and titration.',
          clinicalPrecaution:
            'This matters historically as well as practically: fluvastatin’s largest outcome trial was conducted in renal transplant recipients, a group in which ciclosporin is a common immunosuppressant, and the current label directs avoiding that combination.',
        },
        {
          name: 'Report muscle symptoms promptly',
          action:
            'Report unexplained muscle pain, tenderness or weakness, particularly with malaise or fever.',
          patientImpact:
            'Myopathy — muscle aching or weakness with creatine kinase above ten times the upper limit of normal — occurred in under 0.1% of the fluvastatin programme. Risk factors are age 65 and over, uncontrolled hypothyroidism, renal impairment and concomitant interacting drugs.',
          clinicalPrecaution:
            'Immune-mediated necrotising myopathy has been reported rarely with statins including this one, and it persists after the drug is stopped. Transaminase rises occur, some persistent, with rare reports of fatal and non-fatal hepatic failure.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)N1C2=CC=CC=C2C(=C1/C=C/[C@@H](C[C@@H](CC(=O)O)O)O)C3=CC=C(C=C3)F',
      chemicalFormula: 'C24H26FNO4',
      molecularWeight: '411.50 g/mol',
      targetReceptorAffinity:
        'A competitive inhibitor of HMG-CoA reductase built on a wholly synthetic 3-fluorophenyl indole scaffold rather than on the fungal decalin the earlier statins share. The label states that fluvastatin has two enantiomers, that both are metabolised similarly, and that metabolism proceeds by hydroxylation of the indole ring at the 5- and 6-positions with N-dealkylation and side-chain β-oxidation. CYP2C9 handles approximately 75% of it, CYP3A4 about 20% and CYP2C8 about 5%. Elimination half-life is about three hours; roughly 90% of a dose leaves in the faeces as metabolites with under 2% unchanged, and about 5% appears in urine. The hydroxy metabolites have some pharmacological activity but do not circulate.',
      structureSource: {
        label:
          'PubChem CID 1548972 (fluvastatin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; enantiomers, metabolic routes and CYP fractions from the fluvastatin sodium extended-release label, section 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1548972',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'flu-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the E geometry of the vinyl bridge and the enantiomer ratio',
          description:
            'The pharmacophore of fluvastatin is a trans-configured vinyl bridge connecting the indole to the 3,5-dihydroxyheptenoic acid chain. The Z isomer is not the drug, and the double bond is the light-sensitive part of the molecule, so a geometry specification is a stability specification. The product is a racemate of two enantiomers that the label states are metabolised similarly, so enantiomeric ratio is set at manufacture rather than left to vary.',
          reagentsAndBuffer:
            'Fluvastatin sodium reference standard, reversed-phase HPLC resolving the E and Z isomers with photodiode-array detection, chiral HPLC for the enantiomer ratio, controlled-illumination photostability chamber per ICH Q1B, Karl Fischer titration',
        },
        {
          id: 'flu-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the indole first, then the dihydroxy acid chain onto it',
          description:
            'Nothing here is fermented. The 3-(4-fluorophenyl)-1-isopropylindole core is constructed synthetically, formylated at the 2-position, and the aldehyde is olefinated to install the E-vinyl bridge. The 3,5-dihydroxy acid is then elaborated with stereocontrol at both hydroxyls, and the product is isolated as the sodium salt. Being fully synthetic is what makes the molecule cheap in principle to produce, which is worth holding against its price.',
          dependsOnStepId: 'flu-w1',
          reagentsAndBuffer:
            '3-(4-fluorophenyl)-1-isopropylindole, Vilsmeier-Haack formylation reagents, Horner-Wadsworth-Emmons or Wittig olefination for the E-alkene, diethylmethoxyborane with sodium borohydride for syn-selective 1,3-diol reduction, sodium hydroxide for salt formation, anhydrous solvents under nitrogen with light exclusion',
        },
        {
          id: 'flu-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Remove the Z isomer and the anti-diol, then formulate for light',
          description:
            'The two impurities that matter are geometric and diastereomeric: the Z-alkene and the anti-1,3-diol. Both are structurally close enough to co-elute on a careless method. Because the alkene photoisomerises, the finished extended-release tablet also has to be protected from light — a formulation constraint, not a chemistry one, but one that follows directly from the structure.',
          dependsOnStepId: 'flu-w2',
          reagentsAndBuffer:
            'Preparative reversed-phase chromatography, crystallisation of the sodium salt from aqueous alcohol under amber light, hypromellose matrix for the extended-release tablet, opaque blister packaging, HPLC release testing against isomeric-purity limits',
        },
        {
          id: 'flu-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Test clearance against CYP2C9 variants rather than CYP3A4 inhibitors',
          description:
            'For every other statin in this file, the interaction question is what happens when CYP3A4 is blocked. For fluvastatin the label puts approximately 75% of metabolism through CYP2C9, so the experiment that predicts its behaviour is a CYP2C9 one: recombinant CYP2C9*1 against the reduced-function *2 and *3 variants, with fluconazole as the inhibitor probe. Running the standard ketoconazole panel on this molecule would measure the 20% and miss the 75%.',
          dependsOnStepId: 'flu-w3',
          reagentsAndBuffer:
            'Recombinant human CYP2C9*1, *2 and *3 with NADPH-regenerating system, cryopreserved primary human hepatocytes, fluconazole as the CYP2C9 inhibitor control, diclofenac 4′-hydroxylation as the CYP2C9 activity marker, warfarin as the clinically relevant competing substrate, LC-MS/MS quantification',
        },
        {
          id: 'flu-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Enzyme inhibition, then LDL receptor upregulation',
          description:
            'Fluvastatin is given in the active acid form, so the enzyme assay needs no hydrolysis step. The readout that corresponds to the clinical effect is still one stage further on: the label describes the pharmacodynamics as accelerated LDL receptor expression followed by hepatic uptake of LDL, with maximum reduction reached by four weeks. A four-week time constant in patients is a several-day time constant in culture, and an assay read at twenty-four hours will understate it.',
          dependsOnStepId: 'flu-w4',
          reagentsAndBuffer:
            'Recombinant human HMG-CoA reductase catalytic domain with HMG-CoA and NADPH, 340 nm absorbance readout, HepG2 cells in sterol-depleted medium for LDLR flow cytometry, fluorescently labelled LDL for uptake, mevalonate rescue as the specificity control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'flv-a1',
        category: 'inferred',
        title: 'The licence claims revascularisations, not heart attacks and not death',
        laymanSummary:
          'Read the indication. Fluvastatin is licensed to reduce the chance of needing a stent or a bypass and to slow the disease on an angiogram. It is not licensed to reduce heart attacks, and it is not licensed to reduce death.',
        technicalDetails:
          'The fluvastatin extended-release indication reads: to reduce the risk of undergoing coronary revascularisation procedures and slow the progression of coronary atherosclerosis in adults with clinically evident coronary heart disease; and, as an adjunct to diet, to reduce LDL cholesterol in primary hyperlipidaemia and in heterozygous familial hypercholesterolaemia. Set that beside the siblings. Simvastatin: to reduce the risk of total mortality by reducing coronary heart disease death, non-fatal myocardial infarction and stroke. Pravastatin: to reduce the risk of total mortality by reducing coronary death. Lovastatin: to reduce myocardial infarction, unstable angina and revascularisation. Fluvastatin claims the least of the four, and the reason is visible in its trial record — one positive composite in a post-angioplasty population, and two trials that missed their primary endpoints. A regulator writes an indication from what was measured, and this indication is what fluvastatin measured.',
        evidenceSource:
          'Fluvastatin sodium extended-release tablets United States prescribing information, section 1',
        inferredClaim:
          'That fluvastatin carries the class-wide claim of preventing infarction and death, when its own licence claims neither',
        auditFlag: 'caution',
      },
      {
        id: 'flv-a2',
        category: 'measured',
        title: 'LIPS: the one primary endpoint fluvastatin met',
        laymanSummary:
          'In 1,677 people who had just had a successful first angioplasty, major cardiac events over four years fell from 26.7% to 21.4%.',
        technicalDetails:
          'LIPS randomised 1,677 patients aged 18 to 80 with stable or unstable angina or silent ischaemia after a first successful percutaneous coronary intervention, with total cholesterol 135 to 270 mg/dL, to fluvastatin 80 mg daily (n=844) or placebo (n=833), started a median two days after the procedure, with median follow-up 3.9 years. At least one major adverse cardiac event — cardiac death, non-fatal myocardial infarction or reintervention — occurred in 181 (21.4%) against 222 (26.7%): relative risk 0.78 (95% CI 0.64 to 0.95), p=0.01. The result was independent of baseline cholesterol above or below the median. There were no creatine kinase elevations of ten times the upper limit of normal and no rhabdomyolysis in the fluvastatin arm. Two subgroup findings — diabetes, RR 0.53 in 202 patients, and multivessel disease, RR 0.66 in 614 — are hypothesis-generating rather than established.',
        evidenceSource:
          'Serruys PWJC, de Feyter P, Macaya C, et al. JAMA 2002;287:3215-3222 (LIPS)',
        doi: '10.1001/jama.287.24.3215',
        measuredMetric:
          'Major adverse cardiac events over a median 3.9 years after a first successful percutaneous coronary intervention',
        auditFlag: 'verified',
      },
      {
        id: 'flv-a3',
        category: 'failed',
        title: 'ALERT missed its primary endpoint in 2,102 transplant recipients',
        laymanSummary:
          'The largest fluvastatin trial ran for five years in kidney transplant patients and did not reach significance on what it set out to measure. A secondary measure did separate, and that is what gets quoted.',
        technicalDetails:
          'ALERT randomised 2,102 renal transplant recipients with total cholesterol 4.0 to 9.0 mmol/L to fluvastatin (n=1,050) or placebo (n=1,052), with follow-up of five to six years and a mean of 5.1. Fluvastatin lowered LDL cholesterol by 32%. The primary endpoint — a major adverse cardiac event, defined as cardiac death, non-fatal myocardial infarction or coronary intervention — gave a risk ratio of 0.83 (95% CI 0.64 to 1.06), p=0.139. Not significant. The secondary combination of cardiac death or non-fatal myocardial infarction was 70 events against 104, risk ratio 0.65 (95% CI 0.48 to 0.88), p=0.005. Coronary intervention procedures and the other secondary endpoints did not differ. The authors’ own interpretation is careful: although cardiac deaths and non-fatal myocardial infarction seemed to be reduced, fluvastatin did not generally reduce rates of coronary intervention procedures or mortality. A secondary endpoint in a trial that missed its primary is a hypothesis, and the trial’s prespecified subgroup analyses were themselves precluded by the primary result.',
        evidenceSource:
          'Holdaas H, Fellström B, Jardine AG, et al. Lancet 2003;361:2024-2031 (ALERT)',
        doi: '10.1016/S0140-6736(03)13638-0',
        measuredMetric:
          'Major adverse cardiac events over a mean 5.1 years in renal transplant recipients (risk ratio 0.83, 95% CI 0.64 to 1.06, p=0.139)',
        auditFlag: 'caution',
      },
      {
        id: 'flv-a4',
        category: 'failed',
        title: 'FLARE: no effect on the thing it was designed to measure',
        laymanSummary:
          'Fluvastatin was given before and after balloon angioplasty to stop the artery re-narrowing. It did not. The re-narrowing was identical to two decimal places.',
        technicalDetails:
          'FLARE randomised 1,054 patients to fluvastatin 40 mg twice daily or placebo, starting two to four weeks before planned balloon angioplasty and continuing to follow-up angiography at 26 weeks. The rationale was a laboratory claim that fluvastatin inhibits proliferating vascular myocytes more than other statins independently of lipid lowering. The primary endpoint — loss in minimal luminal diameter — was 0.23 ± 0.49 mm on fluvastatin against 0.23 ± 0.52 mm on placebo, p=0.95. Angiographic restenosis was 28% against 31%, p=0.42. The composite clinical endpoint at 40 weeks was 22.4% against 23.3%, p=0.74. Everything the trial was built to detect came back flat, and the authors state that fluvastatin did not affect the process of restenosis and is not indicated for that purpose. A post-hoc observation of lower death and myocardial infarction — six patients (1.4%) against 17 (4.0%), log-rank p=0.025 — is included here because the authors themselves called it unprecedented and called for a priori investigation. That investigation became LIPS.',
        evidenceSource: 'Serruys PW, Foley DP, Jackson G, et al. Eur Heart J 1999;20:58-69 (FLARE)',
        doi: '10.1053/euhj.1998.1150',
        measuredMetric:
          'Loss in minimal luminal diameter at 26 weeks after balloon angioplasty: 0.23 mm on fluvastatin against 0.23 mm on placebo, p=0.95',
        auditFlag: 'caution',
      },
      {
        id: 'flv-a5',
        category: 'measured',
        title: 'A different enzyme, and therefore a different list of collisions',
        laymanSummary:
          'Most statins are cleared by CYP3A4, so they clash with antifungals and antibiotics. This one is cleared mostly by CYP2C9, so it clashes with warfarin, phenytoin and a diabetes tablet instead.',
        technicalDetails:
          'The label states that CYP2C9 is primarily involved in fluvastatin metabolism, at approximately 75%, with CYP3A4 at about 20% and CYP2C8 at about 5%. The interaction section follows directly from that: obtain an INR before starting warfarin-treated patients and monitor after initiation or discontinuation; monitor plasma phenytoin when fluvastatin is started; monitor blood glucose when it is started in patients on glyburide. Gemfibrozil, ciclosporin and fluconazole are to be avoided. The clinically important consequence is that a prescriber who has learned the statin interaction table from simvastatin will get this molecule wrong in both directions — expecting collisions that do not happen, and missing the anticoagulation one that does.',
        evidenceSource:
          'Fluvastatin sodium extended-release tablets United States prescribing information, sections 7.1, 7.2 and 12.3',
        measuredMetric:
          'Fraction of fluvastatin metabolism attributable to each cytochrome P450 isoenzyme, and the resulting interaction directions',
        auditFlag: 'verified',
      },
      {
        id: 'flv-a6',
        category: 'conclusion_shift',
        title: 'Ninety times the price of simvastatin, for less',
        laymanSummary:
          'A fluvastatin tablet costs a pharmacy about two dollars eighty. A simvastatin tablet costs about three cents. Both are generic, both block the same enzyme, and only one of them has trials measuring survival.',
        technicalDetails:
          'From the same CMS National Average Drug Acquisition Cost survey effective 19 August 2026: fluvastatin US$2.82 per unit across 15 listed products; simvastatin US$0.0314 across 90; atorvastatin US$0.0281 across 278; rosuvastatin US$0.0449 across 179; pravastatin US$0.0620 across 93. Fluvastatin is roughly ninety times simvastatin, sixty times rosuvastatin and a hundred times atorvastatin. It is also the weakest of the five on LDL reduction and carries the narrowest cardiovascular indication. The proximate explanation for the price is the product count: 15 listed generics against 90 to 278 for the others, and a market that thin does not compete a price down. What that means for a reader is specific — a fluvastatin prescription is almost always a decision worth asking about, because the properties that would justify it are held by cheaper molecules.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, effective 19 August 2026, medians across listed products for fluvastatin, simvastatin, atorvastatin, rosuvastatin and pravastatin',
        measuredMetric:
          'Pharmacy acquisition cost per unit across the statin class, from a single survey date',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Designed, not harvested',
        laymanDesc:
          'Every earlier statin came from a mould. This one was drawn on paper: a synthetic indole built to do the same job as the fungal molecules.',
        molecularDetail:
          'A 3-(4-fluorophenyl)-1-isopropylindole carrying an E-vinyl bridge to a 3,5-dihydroxyheptenoic acid, given as the sodium salt. It has two enantiomers, and the label states both are metabolised in a similar manner.',
        iconName: 'PenTool',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Cleared by CYP2C9, not CYP3A4',
        laymanDesc:
          'The liver enzyme that disposes of it is a different one from the enzyme that handles most statins, which is why its list of clashing drugs looks unfamiliar.',
        molecularDetail:
          'Metabolism proceeds by hydroxylation of the indole ring at the 5- and 6-positions with N-dealkylation and side-chain β-oxidation. CYP2C9 accounts for approximately 75%, CYP3A4 about 20% and CYP2C8 about 5%. Half-life is about three hours; about 90% of a dose leaves in the faeces.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It competes with HMG-CoA for the enzyme',
        laymanDesc:
          'Inside the liver cell it occupies the site the enzyme uses to build cholesterol, and the pathway stalls.',
        molecularDetail:
          'Competitive inhibition of HMG-CoA reductase, the rate-limiting enzyme converting HMG-CoA to mevalonate. Given in the active acid form, so no metabolic activation step is required.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'LDL receptors rise and cholesterol falls',
        laymanDesc:
          'The liver responds by putting more receptors on its surface and pulling LDL particles out of the blood, reaching full effect after about a month.',
        molecularDetail:
          'The label states that inhibition of HMG-CoA reductase accelerates expression of LDL receptors, followed by uptake of LDL-C from blood to the liver, and that sustained inhibition also decreases VLDL. Maximum LDL reduction is usually achieved by four weeks and maintained. LDL fell 32% in ALERT and 37% at the time of angioplasty in FLARE.',
        iconName: 'Download',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'After an angioplasty, fewer cardiac events',
        laymanDesc:
          'The one trial in which the drug met its main goal was in people who had just had a first successful angioplasty.',
        molecularDetail:
          'LIPS: major adverse cardiac events in 181 of 844 (21.4%) against 222 of 833 (26.7%), relative risk 0.78 (95% CI 0.64 to 0.95), p=0.01, over a median 3.9 years, with no rhabdomyolysis and no creatine kinase elevation above ten times normal in the treated arm.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And two trials where it did not',
        laymanDesc:
          'It did not stop arteries re-narrowing after angioplasty, and it did not reach significance on its main measure in kidney transplant patients.',
        molecularDetail:
          'FLARE: loss in minimal luminal diameter 0.23 mm against 0.23 mm, p=0.95; restenosis 28% against 31%, p=0.42. ALERT: major adverse cardiac events risk ratio 0.83 (95% CI 0.64 to 1.06), p=0.139, over a mean 5.1 years in 2,102 renal transplant recipients.',
        iconName: 'MinusCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'LIPS — Lescol Intervention Prevention Study (JAMA 2002;287:3215-3222)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 1677,
        primaryEndpoint:
          'Survival time free of major adverse cardiac events — cardiac death, non-fatal myocardial infarction or reintervention — after a first successful percutaneous coronary intervention',
        endpointMet: true,
        statisticalPValue:
          '181 of 844 (21.4%) against 222 of 833 (26.7%); relative risk 0.78 (95% CI 0.64 to 0.95), p=0.01, over a median 3.9 years',
        unreportedAdverseSignals:
          'The composite includes reintervention, which is a decision as much as an event and is not blinded to the treating cardiologist in the same way a death is. The diabetes and multivessel-disease subgroup results are exploratory. There were no creatine kinase elevations above ten times normal and no rhabdomyolysis in the fluvastatin arm.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'ALERT — Assessment of Lescol in Renal Transplantation (Lancet 2003;361:2024-2031)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 2102,
        primaryEndpoint:
          'Major adverse cardiac event — cardiac death, non-fatal myocardial infarction or coronary intervention procedure — in renal transplant recipients over five to six years',
        endpointMet: false,
        statisticalPValue:
          'Risk ratio 0.83 (95% CI 0.64 to 1.06), p=0.139, over a mean 5.1 years, with LDL cholesterol lowered 32%',
        unreportedAdverseSignals:
          'The secondary combination of cardiac death or non-fatal myocardial infarction was 70 against 104, risk ratio 0.65 (95% CI 0.48 to 0.88), p=0.005 — and it is the number usually quoted from this trial. Coronary intervention procedures and all other secondary endpoints, including all-cause mortality and graft loss, did not differ. Because the primary endpoint was not met, the prespecified subgroup analyses could not be interpreted.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'FLARE — Fluvastatin Angiographic Restenosis Trial (Eur Heart J 1999;20:58-69)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 1054,
        primaryEndpoint:
          'Angiographic restenosis measured as loss in minimal luminal diameter at 26 weeks after successful balloon angioplasty without a stent',
        endpointMet: false,
        statisticalPValue:
          '0.23 ± 0.49 mm on fluvastatin against 0.23 ± 0.52 mm on placebo, p=0.95; restenosis rate 28% against 31%, p=0.42; composite clinical endpoint at 40 weeks 22.4% against 23.3%, p=0.74',
        unreportedAdverseSignals:
          'A post-hoc lower incidence of death and myocardial infarction — six (1.4%) against 17 (4.0%), log-rank p=0.025 — was described by the authors as not previously reported with statin therapy, and they called for a trial designed a priori to test it. That trial was LIPS. Only 836 of the 1,054 randomised patients entered the intention-to-treat analysis, because entry required a successful angioplasty after at least two weeks of pre-treatment.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Major adverse cardiac events 21.4% against 26.7% after a first successful percutaneous coronary intervention (LIPS, RR 0.78, 95% CI 0.64 to 0.95, p=0.01)',
        'No significant reduction in major adverse cardiac events in 2,102 renal transplant recipients (ALERT, RR 0.83, 95% CI 0.64 to 1.06, p=0.139)',
        'No effect on restenosis after balloon angioplasty (FLARE, 0.23 mm against 0.23 mm, p=0.95)',
        'LDL cholesterol lowered 32% in ALERT and 37% at the time of angioplasty in FLARE',
        'Approximately 75% of metabolism through CYP2C9, 20% through CYP3A4 and 5% through CYP2C8',
      ],
      unsupportedInferences: [
        'That fluvastatin reduces myocardial infarction or death — neither is in its licensed indication, and its only positive primary endpoint was a composite containing reintervention',
        'That the ALERT secondary result of cardiac death or non-fatal infarction stands on its own, when the trial missed its primary endpoint and could not interpret its subgroups',
        'That fluvastatin inhibits vascular smooth muscle proliferation to clinically useful effect — the hypothesis FLARE was built on and disproved',
        'That its price reflects any measured advantage; on potency, licence breadth and outcome evidence it is behind every cheaper statin in the class',
      ],
      whatFailedInitially: [
        'FLARE: no effect at all on restenosis, the endpoint the whole trial was designed around',
        'ALERT: primary endpoint not met at p=0.139 after five years in the largest fluvastatin population studied',
        'The antiproliferative mechanism claimed to distinguish fluvastatin from other statins did not produce a clinical effect when tested directly',
        'The licence, written from what was actually measured, claims neither infarction reduction nor mortality reduction',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1993 as the first fully synthetic HMG-CoA reductase inhibitor',
        'Now the most expensive statin at United States pharmacy acquisition cost by roughly two orders of magnitude, on 15 listed products against 90 to 278 for its competitors',
        'Retains a narrow pharmacological niche as the statin least dependent on CYP3A4, largely covered more cheaply by rosuvastatin and pravastatin',
        'The extended-release tablet is the surviving presentation, and its licence remains the narrowest cardiovascular claim in the class',
      ],
    },
    deliverySystem: {
      type: 'Oral extended-release tablet at 80 mg once daily; formerly also an immediate-release capsule at 20 and 40 mg',
      description:
        'The extended-release tablet reaches peak concentration at about three hours fasting and has a mean relative bioavailability of approximately 29%, with a wide range of 9% to 66%, compared with the immediate-release capsule taken fasting. A high-fat meal delays absorption to a peak at six hours and raises bioavailability by about 50%, though the peak concentration still stays below that of the immediate-release forms. Elimination half-life is about three hours. Around 90% of a dose is excreted in the faeces as metabolites with under 2% unchanged, and about 5% is recovered in urine. Plasma levels do not differ significantly in patients over 65.',
      safetyProfile:
        'Contraindicated in acute liver failure or decompensated cirrhosis and in hypersensitivity, with anaphylaxis, angioedema and Stevens-Johnson syndrome reported. Myopathy with creatine kinase above ten times the upper limit of normal occurred in under 0.1% of the programme; risk factors are age 65 and over, uncontrolled hypothyroidism, renal impairment and concomitant interacting drugs. Rhabdomyolysis with acute kidney injury and rare fatalities has occurred with statins including this one. Immune-mediated necrotising myopathy has been reported rarely and persists after discontinuation. Transaminase increases occur, some persistent, with rare reports of fatal and non-fatal hepatic failure. Avoid gemfibrozil, ciclosporin and fluconazole. Warfarin requires INR monitoring on starting and stopping; phenytoin levels and, in patients on glyburide, blood glucose should be monitored when fluvastatin is initiated.',
    },
    commonQuestions: [
      {
        q: 'Why is fluvastatin so much more expensive than the other statins?',
        a: 'Not because of anything it does. From one CMS survey effective 19 August 2026, fluvastatin costs a pharmacy US$2.82 a tablet, against US$0.0314 for simvastatin, US$0.0281 for atorvastatin, US$0.0449 for rosuvastatin and US$0.0620 for pravastatin. The proximate reason is competition: 15 generic products are listed for fluvastatin against 90 for simvastatin and 278 for atorvastatin, and a market that thin has nothing forcing the price down. It is worth asking why a particular prescription is for this molecule, because the properties that would justify it — freedom from CYP3A4, modest potency, a long safety record — are all available for a fraction of the price.',
        auditNote:
          'This is the largest price gap in this file between drugs that do the same thing by the same mechanism, and it is not explained by any measured difference in effect.',
      },
      {
        q: 'Does it prevent heart attacks?',
        a: 'That is not what its licence claims and not what its trials measured as a primary endpoint. Fluvastatin is indicated to reduce the risk of undergoing coronary revascularisation and to slow the progression of coronary atherosclerosis. Its one successful outcome trial, LIPS, met a composite of cardiac death, non-fatal infarction and reintervention in people who had just had an angioplasty — 21.4% against 26.7%, p=0.01. Its largest trial, ALERT, missed its primary endpoint in 2,102 kidney transplant patients at p=0.139, although a secondary combination of cardiac death or non-fatal infarction did separate. Compare simvastatin and pravastatin, whose licences carry explicit total-mortality claims resting on trials designed to measure death.',
      },
      {
        q: 'I take warfarin. Does that matter?',
        a: 'Yes, and it is the interaction most likely to be missed, because it is not the one the statin class is known for. About 75% of fluvastatin is cleared by CYP2C9, and warfarin is a CYP2C9 substrate. The label directs obtaining an INR before starting fluvastatin, then frequently enough after starting or stopping it to be sure nothing has shifted, and at regular intervals once stable. The same enzyme is why the label tells you to monitor phenytoin levels and, in people on glyburide, blood glucose when fluvastatin is started. Meanwhile the antifungals and macrolides that are contraindicated with simvastatin are largely irrelevant here — except fluconazole, which inhibits CYP2C9 and is on the avoid list.',
      },
      {
        q: 'Was it supposed to stop arteries closing up again after angioplasty?',
        a: 'It was, and it did not. The FLARE trial was built on laboratory evidence that fluvastatin inhibits proliferating vascular muscle cells more than other statins, independently of any effect on cholesterol. It randomised 1,054 patients to fluvastatin or placebo starting weeks before balloon angioplasty. The loss in minimal luminal diameter at 26 weeks was 0.23 mm in both arms, p=0.95; restenosis was 28% against 31%, p=0.42; the clinical composite at 40 weeks was 22.4% against 23.3%, p=0.74. The authors wrote that fluvastatin did not affect restenosis and is therefore not indicated for it. It is a clean example of a mechanism that is real in a dish and absent in a person.',
      },
      {
        q: 'Is there any patient for whom fluvastatin is the right choice?',
        a: 'A narrow one. It is the statin least dependent on CYP3A4 and it does not use CYP2C19, so in a regimen already crowded with CYP3A4 inhibitors it can slot in where simvastatin, lovastatin and atorvastatin cannot. But rosuvastatin and pravastatin occupy almost the same space, lower LDL as well or better, cost between a forty-fifth and a sixtieth as much, and have broader licensed claims. The genuinely fluvastatin-shaped patient is someone in whom those two are also ruled out, and that is not a common situation.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Serruys PWJC, de Feyter P, Macaya C, et al. Fluvastatin for prevention of cardiac events following successful first percutaneous coronary intervention: a randomized controlled trial (LIPS). JAMA 2002;287:3215-3222',
        identifier: '10.1001/jama.287.24.3215',
        kind: 'doi',
      },
      {
        label:
          'Holdaas H, Fellström B, Jardine AG, et al. Effect of fluvastatin on cardiac outcomes in renal transplant recipients: a multicentre, randomised, placebo-controlled trial (ALERT). Lancet 2003;361:2024-2031',
        identifier: '10.1016/S0140-6736(03)13638-0',
        kind: 'doi',
      },
      {
        label:
          'Serruys PW, Foley DP, Jackson G, et al. A randomized placebo-controlled trial of fluvastatin for prevention of restenosis after successful coronary balloon angioplasty: final results of the fluvastatin angiographic restenosis (FLARE) trial. Eur Heart J 1999;20:58-69',
        identifier: '10.1053/euhj.1998.1150',
        kind: 'doi',
      },
      {
        label:
          'Fluvastatin sodium extended-release tablets United States prescribing information — Indications 1, Contraindications 4, Warnings and Precautions 5.1 to 5.3, Drug Interactions 7.1 and 7.2, Clinical Pharmacology 12.1 to 12.3',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=fluvastatin',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — fluvastatin at 15 listed generic products, with simvastatin, atorvastatin, rosuvastatin and pravastatin medians from the same survey, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 1548972 — fluvastatin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1548972',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Pitavastatin — a positive outcome trial in 7,769 people that has not entered its licensed
  //    indication, a glycaemic-neutrality reputation its own trial contradicts, and forty times
  //    the price of the statin it was shown to be no better than.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'pitavastatin',
    name: 'Pitavastatin',
    tradeName: 'Livalo / Zypitamag / Nikita',
    sponsor:
      'Kowa Pharmaceuticals America (NDA 022363 for LIVALO); developed in Japan by Kowa and Nissan Chemical; Zypitamag is the magnesium salt from Medicure',
    targetGene: 'HMGCR',
    targetProtein:
      '3-hydroxy-3-methylglutaryl-coenzyme A reductase, inhibited by pitavastatin, a synthetic cyclopropyl-quinoline given in the active acid form as the calcium or magnesium salt',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2009,
    indication:
      'As an adjunct to diet to reduce low-density lipoprotein cholesterol in adults with primary hyperlipidaemia, and in adults and children aged 8 years and older with heterozygous familial hypercholesterolaemia',
    patientFriendlyIndication: 'High cholesterol',
    anatomicalSite:
      'Hepatocyte cytoplasm — entered through OATP transporters and cleared by glucuronidation rather than by the cytochrome P450 system',
    conditionContext: {
      conditionExplainer:
        'The disease is atherosclerosis. LDL cholesterol is the measurement that tracks how quickly it advances, and it is the only thing this drug is licensed to change.',
      whyItMatters:
        'Pitavastatin is the newest statin on the American market and the one whose evidence and licence have drifted furthest apart. In 2023 a 7,769-participant trial in people living with HIV found it reduced major cardiovascular events by a third and was stopped early for efficacy. Its United States indication still says only that it reduces LDL cholesterol. Meanwhile the property most often claimed to distinguish it — that it does not raise blood sugar the way other statins do — is contradicted by both the diabetes counts in that trial and its own label.',
      whoTakesThis:
        'Adults with high cholesterol, children from age eight with familial hypercholesterolaemia, and — increasingly — people living with HIV, because it is the statin least likely to collide with antiretroviral therapy.',
      clinicalGoals:
        'A lower LDL cholesterol, which is what the licence covers. In the HIV population there is now outcome evidence as well, and it is not on the label.',
    },
    oneSentenceVerdict:
      'The only statin with a modern placebo-controlled outcome trial that is not reflected in its licence: REPRIEVE cut major cardiovascular events from 7.32 to 4.81 per 1,000 person-years in 7,769 people with HIV (HR 0.65, 95% CI 0.48 to 0.90, p=0.002) and was stopped early, while the United States indication still reads only "to reduce LDL-C" — and the same trial recorded diabetes in 5.3% against 4.0%, which is awkward for the drug’s reputation as the glycaemically neutral statin.',
    laymanHowItWorks:
      'Pitavastatin blocks the liver enzyme that makes cholesterol, so the liver cell puts out more receptors and pulls LDL particles from the blood. What makes it unusual is how the body disposes of it: instead of being burned by the cytochrome enzymes that handle almost every other statin, it is tagged with a sugar molecule and excreted. That single difference means it barely interacts with the antivirals, antifungals and antibiotics that constrain the rest of the class, which is why it ended up being the statin tested in people living with HIV.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.14 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 30 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in August 2009 under NDA 022363, one of the last new statins to reach the market, and now genericised. It still costs about forty times atorvastatin per tablet — US$1.14 against US$0.0281 in the same CMS survey — against a label whose own comparative studies found pitavastatin 4 mg non-inferior to atorvastatin 20 mg and pitavastatin 2 mg non-inferior to atorvastatin 10 mg on LDL reduction.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The case for pitavastatin is a metabolic one: it is the statin least dependent on cytochrome P450, so it is the easiest to fit into a crowded antiretroviral or antifungal regimen. The case against it is arithmetic: on LDL reduction its own label found it no better than atorvastatin at a fortieth of the price, and rosuvastatin and pravastatin also avoid CYP3A4.',
      conventionalRx: [
        {
          name: 'Atorvastatin (Lipitor)',
          class: 'HMG-CoA reductase inhibitor, CYP3A4 substrate',
          howItCompares:
            'The LIVALO label’s own comparative study found pitavastatin 4 mg non-inferior to atorvastatin 20 mg — mean treatment difference 1% (95% CI −2% to 4%) — and pitavastatin 2 mg non-inferior to atorvastatin 10 mg, difference 0% (−3% to 3%). Same LDL reduction, about a fortieth of the price. Atorvastatin does go through CYP3A4, which is the one place pitavastatin genuinely wins.',
          typicalCost:
            'US$0.0281 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 278 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: identical measured LDL effect at a fraction of the price; large outcome trial programme. Cons: CYP3A4-dependent, so protease inhibitors and azoles constrain it.',
        },
        {
          name: 'Rosuvastatin (Crestor)',
          class: 'HMG-CoA reductase inhibitor, hydrophilic, minimally CYP-metabolised',
          howItCompares:
            'Also almost untouched by CYP3A4, and stronger than pitavastatin on LDL at a twenty-fifth of the price. It shares pitavastatin’s vulnerability to transporter inhibitors such as ciclosporin, which is why both labels treat that combination as a hard constraint.',
          typicalCost:
            'US$0.0449 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 179 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: potency, price and a clean CYP profile. Cons: dose caps with certain antiretrovirals; lower ceilings in East Asian populations.',
        },
        {
          name: 'Pravastatin (Pravachol)',
          class: 'HMG-CoA reductase inhibitor, hydrophilic, not CYP3A4-metabolised',
          howItCompares:
            'The traditional answer to the same problem, with three placebo-controlled mortality trials behind it and about an eighteenth of pitavastatin’s price. Weaker on LDL, and its interaction management is dose caps rather than contraindications.',
          typicalCost:
            'US$0.0620 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 93 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: mortality evidence; price; long record in transplant and HIV populations. Cons: modest LDL reduction.',
        },
      ],
      naturalFoods: [
        {
          name: 'Soluble fibre — oat β-glucan, psyllium, barley, legumes',
          activeCompound: 'Viscous soluble fibre, principally β-glucan',
          biologicalMechanism:
            'Sequesters bile acids in the gut so they are excreted; the liver rebuilds them from cholesterol, depletes its pool and raises LDL receptor expression — the same last step pitavastatin reaches by blocking synthesis.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: LDL reductions of a few per cent in randomised trials, against 38% for pitavastatin 2 mg and 45% for 4 mg in the label’s comparative study, and no cardiovascular outcome trial.',
          monthlyCost: '',
        },
        {
          name: 'Plant sterols and stanols — fortified spreads, nuts, seeds',
          activeCompound: 'β-sitosterol, campesterol, sitostanol',
          biologicalMechanism:
            'Compete with cholesterol for micelle incorporation in the intestine and reduce its absorption, acting on the absorption side and therefore additive to a statin rather than redundant with it.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: 5 to 10% LDL reduction in randomised trials, with no cardiovascular outcome trial.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Ciclosporin is a contraindication, not a caution',
          action:
            'If you take ciclosporin for a transplant or an autoimmune condition, say so before this statin is started.',
          patientImpact:
            'The label states that ciclosporin significantly increases pitavastatin exposure and increases the risk of myopathy and rhabdomyolysis, and that concomitant use is contraindicated. This is one of only three contraindications on the label.',
          clinicalPrecaution:
            'Erythromycin caps the dose at 1 mg once daily and rifampin at 2 mg once daily, both because they raise pitavastatin exposure. Gemfibrozil should be avoided.',
        },
        {
          name: 'The evening dose is a small preference, not a rule',
          action: 'Take it as directed; timing matters less for this statin than for some others.',
          patientImpact:
            'The label records that peak concentration and total exposure did not differ between evening and morning dosing, and that in healthy volunteers on 4 mg the LDL reduction after evening dosing was slightly greater than after morning dosing. A high-fat meal cuts peak concentration by 43%.',
          clinicalPrecaution:
            'Nothing here is a reason to change a schedule that is working. It is a reason not to worry excessively about one.',
        },
        {
          name: 'Ask about blood sugar rather than assuming it is neutral',
          action:
            'If you have prediabetes or diabetes, ask for the glucose and HbA1c to be watched as they would be on any statin.',
          patientImpact:
            'The label carries the same statin class warning as the others: increases in HbA1c and fasting serum glucose have been reported with statins including this one. In REPRIEVE, diabetes mellitus occurred in 206 pitavastatin participants (5.3%) against 155 on placebo (4.0%).',
          clinicalPrecaution:
            'The reputation for glycaemic neutrality comes largely from short metabolic studies and reviews. The largest randomised trial of the drug did not confirm it, and the label does not claim it.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CC1C2=NC3=CC=CC=C3C(=C2/C=C/[C@H](C[C@H](CC(=O)O)O)O)C4=CC=C(C=C4)F',
      chemicalFormula: 'C25H24FNO4',
      molecularWeight: '421.50 g/mol',
      targetReceptorAffinity:
        'A wholly synthetic cyclopropyl-quinoline bearing an E-vinyl bridge to a 3,5-dihydroxyheptenoic acid, dispensed as the calcium salt in LIVALO and the magnesium salt in Zypitamag. Peak plasma concentration comes about one hour after an oral dose and absolute bioavailability of the oral solution is 51%. The label states that the principal route of metabolism is glucuronidation by hepatic UGT1A3 and UGT2B7 with subsequent formation of pitavastatin lactone, that there is only minimal metabolism by the cytochrome P450 system, and that it is marginally metabolised by CYP2C9 and to a lesser extent CYP2C8. About 79% of a dose is excreted in faeces and 15% in urine within seven days; mean plasma elimination half-life is approximately 12 hours. A thorough QT study in 174 participants found no clinically meaningful QTc prolongation at daily doses up to 16 mg, four times the maximum recommended dose.',
      structureSource: {
        label:
          'PubChem CID 5282452 (pitavastatin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; metabolism, excretion and half-life from the LIVALO label, section 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5282452',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'pit-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Set the single-enantiomer specification and the lactone limit',
          description:
            'Unlike fluvastatin, which is a racemate, pitavastatin is marketed as one stereoisomer, so the enantiomeric excess is a potency specification rather than a ratio to be maintained. The lactone is simultaneously the major circulating metabolite and a degradation product formed on storage, so lactone content in the drug substance is a stability specification that has to be read separately from the metabolite that appears in plasma.',
          reagentsAndBuffer:
            'Pitavastatin calcium reference standard, chiral HPLC for enantiomeric excess, reversed-phase HPLC resolving the open acid, the lactone and the E and Z alkene isomers, photostability testing per ICH Q1B, Karl Fischer titration',
        },
        {
          id: 'pit-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the quinoline, then install both hydroxyls with stereocontrol',
          description:
            'The core is a 2-cyclopropyl-4-(4-fluorophenyl)quinoline, formylated at the 3-position and olefinated to give the E-vinyl bridge. The 3,5-dihydroxy acid is then constructed with defined configuration at both centres — the step that determines whether the product is the drug or its mirror image — and the acid is converted to the calcium or magnesium salt.',
          dependsOnStepId: 'pit-w1',
          reagentsAndBuffer:
            '2-cyclopropyl-4-(4-fluorophenyl)quinoline-3-carbaldehyde, Horner-Wadsworth-Emmons olefination reagents for the E-alkene, chiral catalyst or auxiliary for the 3R,5S diol, diethylmethoxyborane with sodium borohydride for syn-selective reduction, calcium chloride or magnesium salt formation, light-excluded anhydrous conditions',
        },
        {
          id: 'pit-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Remove the enantiomer, the Z isomer and the lactone',
          description:
            'Three closely related impurities have to be driven out and each fails the product in a different way: the opposite enantiomer is inactive mass, the Z alkene is not the pharmacophore, and the lactone changes the dissolution and the assay. Because the salt is hygroscopic, the crystallisation conditions and the water content are part of the same control problem.',
          dependsOnStepId: 'pit-w2',
          reagentsAndBuffer:
            'Preparative chiral and reversed-phase chromatography, controlled crystallisation of the calcium salt from aqueous alcohol under amber light, controlled-humidity drying, HPLC release testing against enantiomeric and isomeric purity limits',
        },
        {
          id: 'pit-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Test transporter inhibition, because there is no CYP left to inhibit',
          description:
            'The label contraindicates ciclosporin because it significantly increases pitavastatin exposure. That cannot be a cytochrome effect: the label also states there is only minimal metabolism by the cytochrome P450 system. What remains is transport, so the assay that predicts this drug’s interactions is an OATP uptake assay with ciclosporin, rifampicin and erythromycin as inhibitors, not the CYP3A4 panel that is standard for the rest of the class. Running the wrong panel on this molecule returns a clean result and misses the only contraindication it has.',
          dependsOnStepId: 'pit-w3',
          reagentsAndBuffer:
            'HEK293 cells stably expressing human OATP1B1 and OATP1B3, sandwich-cultured primary human hepatocytes, ciclosporin, rifampicin and erythromycin as inhibitor probes, estradiol-17β-glucuronide as the reference OATP substrate, LC-MS/MS quantification of pitavastatin acid and lactone separately',
        },
        {
          id: 'pit-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure glucuronidation and enzyme inhibition on the same material',
          description:
            'Clearance runs through UGT1A3 and UGT2B7 to an ester glucuronide that then cyclises to the lactone, and the lactone is the major species in human plasma. An assay that measures only the parent acid will therefore under-report total drug-related material. Potency is measured separately against the isolated enzyme and confirmed as LDL receptor upregulation in a hepatic cell line, because enzyme occupancy is not the clinical effect.',
          dependsOnStepId: 'pit-w4',
          reagentsAndBuffer:
            'Recombinant human UGT1A3 and UGT2B7 with UDP-glucuronic acid and alamethicin-permeabilised microsomes, recombinant human HMG-CoA reductase catalytic domain with HMG-CoA and NADPH at 340 nm, HepG2 cells in sterol-depleted medium for LDLR flow cytometry and fluorescent-LDL uptake',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pta-a1',
        category: 'measured',
        title: 'REPRIEVE: a third fewer cardiovascular events, and the trial stopped early',
        laymanSummary:
          'Nearly eight thousand people living with HIV, none of them at high cardiovascular risk, took pitavastatin or placebo. Major cardiovascular events fell by about a third and the trial was halted ahead of schedule because the answer was clear.',
        technicalDetails:
          'REPRIEVE randomised 7,769 participants with HIV infection at low to moderate cardiovascular risk, receiving antiretroviral therapy, to pitavastatin calcium 4 mg daily or placebo. Median age was 50; median CD4 count 621 cells/mm³; HIV RNA was below quantification in 5,250 of 5,997 participants with data (87.5%). The primary outcome was a composite of cardiovascular death, myocardial infarction, hospitalisation for unstable angina, stroke, transient ischaemic attack, peripheral arterial ischaemia, revascularisation, or death from an undetermined cause. The trial was stopped early for efficacy after a median 5.1 years. Incidence was 4.81 per 1,000 person-years on pitavastatin against 7.32 on placebo: hazard ratio 0.65 (95% CI 0.48 to 0.90), p=0.002. This is a genuine primary-prevention outcome result in a population that had never had one, and it is the strongest piece of evidence any statin holds specifically for people living with HIV.',
        evidenceSource:
          'Grinspoon SK, Fitch KV, Zanni MV, et al. N Engl J Med 2023;389:687-699 (REPRIEVE)',
        doi: '10.1056/NEJMoa2304146',
        measuredMetric:
          'Major adverse cardiovascular events per 1,000 person-years over a median 5.1 years in 7,769 people with HIV',
        auditFlag: 'verified',
      },
      {
        id: 'pta-a2',
        category: 'inferred',
        title: 'That outcome trial is not in the licensed indication',
        laymanSummary:
          'REPRIEVE reported in 2023 and was positive. The United States indication for pitavastatin still says only that it lowers LDL cholesterol in high cholesterol and familial hypercholesterolaemia. There is no cardiovascular claim on the label at all.',
        technicalDetails:
          'The LIVALO indication reads in full: as an adjunct to diet to reduce low-density lipoprotein cholesterol in adults with primary hyperlipidaemia, and in adults and paediatric patients aged 8 years and older with heterozygous familial hypercholesterolaemia. Nothing about events, nothing about mortality, nothing about HIV. Compare simvastatin, licensed to reduce total mortality; pravastatin, licensed to reduce total mortality by reducing coronary death; lovastatin, licensed to reduce infarction and revascularisation. A licence changes only when a sponsor applies to change it, and the gap between what a drug has been shown to do and what its label says it does is a gap in the regulatory record rather than in the science. A reader should know that in this case the evidence is stronger than the label, which is the opposite of the usual direction and worth naming for that reason.',
        evidenceSource:
          'LIVALO (pitavastatin) United States prescribing information, section 1 (NDA 022363); Grinspoon SK et al. N Engl J Med 2023;389:687-699',
        doi: '10.1056/NEJMoa2304146',
        inferredClaim:
          'That the licensed indication reflects the current evidence — here it does not, and the drug has an outcome trial its label does not mention',
        auditFlag: 'caution',
      },
      {
        id: 'pta-a3',
        category: 'failed',
        title: 'The glycaemic-neutrality claim did not survive its own outcome trial',
        laymanSummary:
          'Pitavastatin has a reputation for being the statin that does not raise blood sugar. In its own largest trial, more people on pitavastatin developed diabetes than on placebo, and its label carries the same sugar warning as every other statin.',
        technicalDetails:
          'A body of narrative review and short-term metabolic literature describes pitavastatin as having favourable or neutral effects on glucose tolerance relative to other statins, and it is a recurring reason given for choosing it. Two harder measurements point the other way. First, the LIVALO label carries the class warning verbatim: increases in HbA1c and fasting serum glucose levels have been reported with statins, including LIVALO. It makes no neutrality claim. Second, REPRIEVE recorded diabetes mellitus in 206 pitavastatin participants (5.3%) against 155 on placebo (4.0%) over a median 5.1 years — a difference in the same direction as the class, in the largest randomised comparison the drug has. Muscle-related symptoms in the same trial were 91 (2.3%) against 53 (1.4%). None of this makes the drug a poor choice; the cardiovascular benefit in REPRIEVE was clear. It does mean the distinguishing property most often cited for it is not one its own evidence supports.',
        evidenceSource:
          'Grinspoon SK et al. N Engl J Med 2023;389:687-699 (REPRIEVE); LIVALO United States prescribing information, section 5; Arsh H, Ali A, Khenhrani RR, et al., Curr Probl Cardiol 2023;48:101981, as an example of the neutrality literature',
        doi: '10.1056/NEJMoa2304146',
        inferredClaim:
          'That pitavastatin is glycaemically neutral — a claim absent from its label and contradicted by the diabetes counts in its own outcome trial',
        auditFlag: 'contested',
      },
      {
        id: 'pta-a4',
        category: 'measured',
        title: 'Its own label shows it is no better than atorvastatin, at forty times the price',
        laymanSummary:
          'The comparison study in the package insert found pitavastatin 4 mg lowered LDL by the same amount as atorvastatin 20 mg. A pitavastatin tablet costs a pharmacy about a dollar fourteen; an atorvastatin tablet costs under three cents.',
        technicalDetails:
          'LIVALO Study 301 randomised 817 adults with primary hyperlipidaemia or mixed dyslipidaemia to 12 weeks of pitavastatin or atorvastatin, with non-inferiority defined as a 95% CI lower bound above −6% for mean percentage change in LDL cholesterol. Pitavastatin 2 mg against atorvastatin 10 mg gave a mean treatment difference of 0% (95% CI −3% to 3%); pitavastatin 4 mg against atorvastatin 20 mg gave 1% (−2% to 4%). Mean LDL reductions were −38% and −45% for pitavastatin 2 mg and 4 mg, and −38% and −44% for atorvastatin 10 mg and 20 mg. The two drugs are, on the label’s own measurement, interchangeable on LDL. From the same CMS survey effective 19 August 2026, pitavastatin costs US$1.14 per unit across 30 listed products and atorvastatin US$0.0281 across 278. That is roughly a fortyfold difference for an identical measured effect, and the only defensible reason to pay it is the metabolic profile rather than the lipid result.',
        evidenceSource:
          'LIVALO United States prescribing information, section 14, Study 301 (NDA 022363); CMS NADAC survey effective 19 August 2026',
        measuredMetric:
          'Mean percentage change in LDL cholesterol at 12 weeks, pitavastatin against atorvastatin, with pharmacy acquisition cost from the same survey date',
        auditFlag: 'verified',
      },
      {
        id: 'pta-a5',
        category: 'measured',
        title: 'Almost no cytochrome metabolism, which is the whole point of the molecule',
        laymanSummary:
          'Nearly every other statin is burned up by cytochrome enzymes that dozens of common drugs block. This one is tagged with a sugar and excreted instead, so those collisions mostly do not happen.',
        technicalDetails:
          'The label states that the principal route of pitavastatin metabolism is glucuronidation by hepatic UGT1A3 and UGT2B7 with subsequent formation of pitavastatin lactone, that there is only minimal metabolism by the cytochrome P450 system, and that it is marginally metabolised by CYP2C9 and to a lesser extent CYP2C8. The interaction table is correspondingly short and, revealingly, has nothing to do with cytochromes: ciclosporin is contraindicated because it significantly increases exposure; erythromycin caps the dose at 1 mg daily and rifampin at 2 mg daily for the same reason; gemfibrozil is avoided. Those three drugs are transporter inhibitors, not primarily CYP3A4 inhibitors of this molecule, which is why the constraint survives despite the absence of cytochrome metabolism. This is the property that made pitavastatin the statin chosen for a trial in people on antiretroviral therapy, where CYP3A4 is already crowded.',
        evidenceSource:
          'LIVALO United States prescribing information, sections 4, 7 and 12.3 (NDA 022363)',
        measuredMetric:
          'Metabolic route and the resulting contraindication and dose-cap list, from the label',
        auditFlag: 'verified',
      },
      {
        id: 'pta-a6',
        category: 'inferred',
        title: 'A trial in one population is not a trial in every population',
        laymanSummary:
          'REPRIEVE studied people living with HIV on antiretroviral treatment. Whether the same benefit appears in people without HIV at the same estimated risk was not tested, and cannot be read off this trial.',
        technicalDetails:
          'REPRIEVE enrolled 7,769 participants with HIV infection receiving antiretroviral therapy, at low to moderate cardiovascular risk by conventional scoring, with a median CD4 count of 621 and viral suppression in 87.5% of those with data. The rationale for the trial was that cardiovascular risk is increased in HIV beyond what conventional risk scores capture — chronic immune activation and inflammation being the usual explanation. If that is why the absolute event rate was high enough to detect a benefit in a nominally low-risk group, then the result belongs to that population and does not automatically transfer to an HIV-negative person with the same risk score. Nothing in REPRIEVE settles whether a statin is worthwhile in genuinely low-risk primary prevention generally, and the trial does not claim to.',
        evidenceSource: 'Grinspoon SK et al. N Engl J Med 2023;389:687-699 (REPRIEVE); NCT02344290',
        doi: '10.1056/NEJMoa2304146',
        inferredClaim:
          'That REPRIEVE demonstrates statin benefit in low-risk primary prevention generally, when it was conducted entirely in people with HIV on antiretroviral therapy',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A synthetic quinoline, given already active',
        laymanDesc:
          'No mould was involved and no activation is needed. The molecule that blocks the enzyme is the one in the tablet, delivered as a calcium or magnesium salt.',
        molecularDetail:
          'A 2-cyclopropyl-4-(4-fluorophenyl)quinoline linked by an E-vinyl bridge to a 3,5-dihydroxyheptenoic acid. Peak plasma concentration comes at about one hour; absolute bioavailability of the oral solution is 51%. A high-fat meal reduces peak concentration by 43%.',
        iconName: 'PenTool',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Carried into the liver, not burned by cytochromes',
        laymanDesc:
          'It enters liver cells through a transporter and leaves the body tagged with a sugar molecule, bypassing the enzyme system that constrains every other statin.',
        molecularDetail:
          'Hepatic uptake is transporter-mediated. The label states the principal metabolic route is glucuronidation by UGT1A3 and UGT2B7 with subsequent lactone formation, with only minimal cytochrome P450 involvement — marginal CYP2C9 and lesser CYP2C8. About 79% of a dose leaves in faeces, 15% in urine; half-life is about 12 hours.',
        iconName: 'DoorOpen',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the rate-limiting enzyme',
        laymanDesc:
          'Inside the cell it occupies the site the enzyme needs to build cholesterol, and the pathway stalls.',
        molecularDetail:
          'Inhibition of HMG-CoA reductase, the enzyme catalysing conversion of HMG-CoA to mevalonate, the rate-limiting step in cholesterol biosynthesis.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'LDL receptors rise and cholesterol falls',
        laymanDesc:
          'The liver responds by making more receptors and clearing LDL out of the blood. Four milligrams does what twenty milligrams of atorvastatin does.',
        molecularDetail:
          'The label states that expression of LDL receptors is accelerated, followed by uptake of LDL from blood to liver, and that sustained inhibition also decreases VLDL. Study 301: LDL −45% on pitavastatin 4 mg against −44% on atorvastatin 20 mg, mean treatment difference 1% (95% CI −2% to 4%).',
        iconName: 'Download',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In people living with HIV, a third fewer cardiovascular events',
        laymanDesc:
          'The one outcome trial ran in nearly eight thousand people with HIV and was stopped early because the benefit was clear.',
        molecularDetail:
          'REPRIEVE: major adverse cardiovascular events 4.81 against 7.32 per 1,000 person-years, hazard ratio 0.65 (95% CI 0.48 to 0.90), p=0.002, over a median 5.1 years in 7,769 participants at low to moderate conventional risk.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And more diabetes, in the same trial',
        laymanDesc:
          'The drug is often described as the statin that spares blood sugar. In that trial, more people on it developed diabetes than on placebo.',
        molecularDetail:
          'REPRIEVE: diabetes mellitus in 206 (5.3%) against 155 (4.0%); muscle-related symptoms in 91 (2.3%) against 53 (1.4%). The label carries the class warning that increases in HbA1c and fasting serum glucose have been reported with statins including this one, and makes no neutrality claim.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'REPRIEVE (N Engl J Med 2023;389:687-699; NCT02344290)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 7769,
        primaryEndpoint:
          'Composite of cardiovascular death, myocardial infarction, hospitalisation for unstable angina, stroke, transient ischaemic attack, peripheral arterial ischaemia, revascularisation or death from an undetermined cause, in people with HIV on antiretroviral therapy at low to moderate cardiovascular risk',
        endpointMet: true,
        statisticalPValue:
          '4.81 against 7.32 events per 1,000 person-years; hazard ratio 0.65 (95% CI 0.48 to 0.90), p=0.002, over a median 5.1 years, with the trial stopped early for efficacy',
        unreportedAdverseSignals:
          'Diabetes mellitus occurred in 206 participants (5.3%) on pitavastatin against 155 (4.0%) on placebo, and muscle-related symptoms in 91 (2.3%) against 53 (1.4%). Stopping early for efficacy tends to overstate effect size. The population was entirely people with HIV on antiretroviral therapy, so the result does not transfer automatically to HIV-negative people at the same conventional risk score.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'LIVALO Study 301 — active-controlled comparison with atorvastatin (NDA 022363)',
        phase: 'Phase 3, randomised, double-blind, double-dummy, active-controlled non-inferiority',
        sampleSize: 817,
        primaryEndpoint:
          'Mean percentage change in LDL cholesterol from baseline at week 12, pitavastatin against atorvastatin, with non-inferiority declared if the 95% CI lower bound exceeded −6%',
        endpointMet: true,
        statisticalPValue:
          'Pitavastatin 2 mg against atorvastatin 10 mg: mean treatment difference 0% (95% CI −3% to 3%). Pitavastatin 4 mg against atorvastatin 20 mg: 1% (−2% to 4%). LDL reductions −38% and −45% against −38% and −44%',
        unreportedAdverseSignals:
          'This is a 12-week lipid study and measured no clinical event of any kind. Non-inferiority on a surrogate against a comparator that costs a fortieth as much is a commercially useful result and a clinically neutral one.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Major adverse cardiovascular events 4.81 against 7.32 per 1,000 person-years in 7,769 people with HIV (REPRIEVE, HR 0.65, 95% CI 0.48 to 0.90, p=0.002)',
        'Diabetes mellitus in 5.3% against 4.0% and muscle-related symptoms in 2.3% against 1.4% in the same trial',
        'LDL cholesterol reduced 45% by pitavastatin 4 mg against 44% by atorvastatin 20 mg over 12 weeks (Study 301)',
        'Principal metabolic route is glucuronidation by UGT1A3 and UGT2B7, with only minimal cytochrome P450 involvement',
        'No clinically meaningful QTc prolongation at daily doses up to 16 mg, four times the maximum recommended dose, in 174 participants',
      ],
      unsupportedInferences: [
        'That pitavastatin is glycaemically neutral — absent from the label and contradicted by the REPRIEVE diabetes counts',
        'That REPRIEVE extends to low-risk primary prevention generally, when every participant had HIV and was on antiretroviral therapy',
        'That the price premium buys a better lipid effect, when the label’s own comparison found it equivalent to atorvastatin milligram for milligram of effect',
        'That the licensed indication reflects the current evidence, when a positive outcome trial from 2023 appears nowhere in it',
      ],
      whatFailedInitially: [
        'The glycaemic-neutrality proposition, which the drug’s largest randomised trial did not support',
        'The absence of any cardiovascular claim in the United States indication despite a positive outcome trial',
        'Freedom from cytochrome metabolism did not buy freedom from interactions: ciclosporin remains an outright contraindication and erythromycin and rifampin impose hard dose caps',
      ],
      realWorldOutcome: [
        'Approved in the United States in 2009 under NDA 022363 and now generic, at about US$1.14 a tablet across 30 listed products',
        'The statin with the strongest specific evidence in people living with HIV, on the strength of REPRIEVE',
        'Its licensed indication remains LDL reduction alone, with no cardiovascular or mortality claim of any kind',
        'Costs roughly forty times atorvastatin for an LDL effect its own label found equivalent',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 1, 2 and 4 mg once daily, as pitavastatin calcium (Livalo) or magnesium (Zypitamag)',
      description:
        'Peak plasma concentration is reached about one hour after dosing and exposure rises approximately dose-proportionally from 1 mg to 24 mg. Absolute bioavailability of the oral solution is 51%. Absorption occurs in the small intestine and very little in the colon. A high-fat meal reduces peak concentration by 43%. Peak concentration and total exposure did not differ between evening and morning administration, although the LDL reduction after evening dosing was slightly greater in healthy volunteers on 4 mg. Metabolism is by glucuronidation through UGT1A3 and UGT2B7 with subsequent lactone formation; the lactone is the major plasma metabolite. About 79% of a dose is excreted in faeces and 15% in urine within seven days, with a mean plasma half-life of about 12 hours. Exposure is 10% higher in peak and 30% higher in area under the curve in people aged 65 and over.',
      safetyProfile:
        'Contraindicated with ciclosporin, in acute liver failure or decompensated cirrhosis, and in hypersensitivity — angioedema, rash, pruritus and urticaria have been reported. Myopathy and rhabdomyolysis occur, with acute kidney injury secondary to myoglobinuria and rare fatalities reported for statins including this one; risk factors are age 65 or over, uncontrolled hypothyroidism, renal impairment, interacting drugs and higher dosage. Immune-mediated necrotising myopathy has been reported rarely and persists after discontinuation. Transaminase increases occur, some persistent, with rare reports of fatal and non-fatal hepatic failure. Increases in HbA1c and fasting serum glucose have been reported. Erythromycin caps the dose at 1 mg daily and rifampin at 2 mg daily; gemfibrozil should be avoided and fibrates require a benefit-risk judgement with monitoring.',
    },
    commonQuestions: [
      {
        q: 'Why would a doctor pick pitavastatin when it costs forty times as much as atorvastatin?',
        a: 'For one reason, and it is a real one: metabolism. Nearly every other statin is cleared by cytochrome P450 enzymes, and CYP3A4 in particular is blocked by a long list of antivirals, antifungals and antibiotics. Pitavastatin is cleared by glucuronidation instead — the label says cytochrome involvement is minimal — so it slots into regimens where the others are contraindicated or dose-capped. That is why it was the statin chosen for a 7,769-person trial in people on antiretroviral therapy. On the lipid effect alone there is no case for it: the LIVALO label’s own study found 4 mg equivalent to atorvastatin 20 mg, difference 1% with a confidence interval from −2% to 4%. Rosuvastatin and pravastatin also avoid CYP3A4 and cost a fraction as much, so even the metabolic argument needs a specific reason those two will not do.',
        auditNote:
          'A fortyfold price difference for an effect the manufacturer’s own trial shows to be equivalent is the kind of thing worth asking about directly.',
      },
      {
        q: 'I read that pitavastatin does not raise blood sugar like other statins. Is that right?',
        a: 'That claim is common in review articles and it is not supported by the drug’s own strongest evidence. In REPRIEVE, its 7,769-participant outcome trial, diabetes mellitus occurred in 206 people on pitavastatin (5.3%) against 155 on placebo (4.0%) over a median 5.1 years — more, not fewer, and in the same direction as the class. The LIVALO label carries the identical class warning to every other statin: increases in HbA1c and fasting serum glucose have been reported with statins, including LIVALO. It makes no neutrality claim of its own. The favourable glycaemic literature exists and is mostly short-term metabolic work; the largest randomised comparison points the other way, and it is the measurement that should carry the most weight.',
      },
      {
        q: 'The trial was positive. Why does the label not mention it?',
        a: 'Because labels change only when a manufacturer applies to change them, and a positive academic trial does not update an indication by itself. REPRIEVE was funded by the National Institutes of Health and others, reported in 2023, and found a 35% relative reduction in major cardiovascular events with the trial stopped early for efficacy. The United States indication for pitavastatin still reads only that it is an adjunct to diet to reduce LDL cholesterol in primary hyperlipidaemia and heterozygous familial hypercholesterolaemia. That gap is a fact about the regulatory system rather than about the drug. It is unusual in being in this direction — most gaps between label and evidence run the other way, with claims outrunning the data.',
      },
      {
        q: 'Does the HIV trial mean statins are worthwhile for everyone at low risk?',
        a: 'No, and that is the most common misreading of it. REPRIEVE enrolled only people with HIV on antiretroviral therapy. The reason the trial existed is that cardiovascular risk in HIV appears higher than conventional risk scores predict, and chronic immune activation is the usual explanation. If that is why enough events occurred in a nominally low-risk group to detect a benefit, the result is about that population. Whether an HIV-negative person with the same risk score would benefit was not tested here, and the trial makes no such claim.',
      },
      {
        q: 'If it barely uses the liver enzymes, why is ciclosporin still forbidden?',
        a: 'Because interactions do not only happen at metabolism. Getting into the liver cell at all requires uptake transporters, and ciclosporin blocks them. The label states that ciclosporin significantly increases pitavastatin exposure and increases the risk of myopathy and rhabdomyolysis, and makes the combination one of only three contraindications on the whole label. The same mechanism explains why erythromycin caps the dose at 1 mg daily and rifampin at 2 mg. So the drug escapes the cytochrome problem and inherits a transporter one, which is smaller but not zero.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Grinspoon SK, Fitch KV, Zanni MV, et al. Pitavastatin to prevent cardiovascular disease in HIV infection (REPRIEVE). N Engl J Med 2023;389:687-699',
        identifier: '10.1056/NEJMoa2304146',
        kind: 'doi',
      },
      {
        label: 'REPRIEVE registration record on ClinicalTrials.gov',
        identifier: 'NCT02344290',
        kind: 'nct',
      },
      {
        label:
          'LIVALO (pitavastatin) United States prescribing information — Indications 1, Contraindications 4, Warnings and Precautions 5.1 to 5.3, Drug Interactions 7, Clinical Pharmacology 12.1 to 12.3, Clinical Studies 14 (Study 301) (NDA 022363)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022363',
        kind: 'regulatory',
      },
      {
        label:
          'Efficacy and safety of pitavastatin in patients with impaired glucose tolerance: an updated review. Curr Probl Cardiol 2023;48:101981 — cited as an example of the glycaemic-neutrality literature this page tests against the trial data',
        identifier: '10.1016/j.cpcardiol.2023.101981',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — pitavastatin at 30 listed generic products, with atorvastatin, rosuvastatin and pravastatin medians from the same survey, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5282452 — pitavastatin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5282452',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Digoxin — prescribed since 1785, first tested against placebo for mortality in 1997, and
  //    found to have none. Its own label says so in the indication.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'digoxin',
    name: 'Digoxin',
    tradeName: 'Lanoxin / Lanoxin Pediatric / Lanoxicaps',
    sponsor:
      'Azurity Pharmaceuticals holds NDA 009330 (injection, originally approved 16 November 1954); Advanz Pharma holds NDA 020405 (tablets, originally approved 30 September 1997). Generic and made by many manufacturers',
    targetGene: 'ATP1A1',
    targetProtein:
      'The alpha subunit of sodium-potassium ATPase — the sodium pump — inhibited at its extracellular potassium-binding site, which is why low serum potassium potentiates the drug and high potassium blunts it',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1954,
    indication:
      'Treatment of mild to moderate heart failure in adults; increasing myocardial contractility in paediatric patients with heart failure; and control of resting ventricular rate in adults with chronic atrial fibrillation',
    patientFriendlyIndication:
      'Heart failure symptoms, and slowing a fast resting pulse in long-standing atrial fibrillation',
    anatomicalSite:
      'The cardiac myocyte membrane and the atrioventricular node — the sodium pump on the outside of the heart muscle cell, and the conduction tissue it slows indirectly through the vagus nerve',
    conditionContext: {
      conditionExplainer:
        'Heart failure means the heart cannot move enough blood for the body’s needs at normal filling pressures, so fluid backs up into the lungs and legs and exertion becomes difficult. Atrial fibrillation means the atria quiver rather than contract, and the ventricles are driven irregularly and often too fast.',
      whyItMatters:
        'Digoxin is the oldest drug on this site by a wide margin. William Withering published his account of foxglove in dropsy in 1785; digoxin itself was isolated from Digitalis lanata in 1930 and marketed as an injection in the United States in 1954. The first adequately powered placebo-controlled trial of its effect on survival reported in 1997. That is the interval that makes this record worth reading: two centuries of confident use, then one trial, and the answer was no.',
      whoTakesThis:
        'Adults with heart failure symptoms persisting on a diuretic and an ACE inhibitor, adults needing resting rate control in chronic atrial fibrillation, and children with heart failure. Not people with ventricular fibrillation, and not people with Wolff-Parkinson-White syndrome who develop atrial fibrillation.',
      clinicalGoals:
        'Fewer heart failure hospitalisations, better exercise capacity, a slower resting pulse. Explicitly not longer life — the label states that outright.',
    },
    oneSentenceVerdict:
      'A drug in continuous use since 1785 whose first placebo-controlled mortality trial, in 1997, randomised 6,800 patients and found deaths of 34.8% against 35.1% (RR 0.99, 95% CI 0.91 to 1.07, p=0.80) while heart-failure hospitalisations fell from 34.7% to 26.8% (p<0.001) — a result its own FDA label now states in the indication itself, in the phrase "while having no effect on mortality".',
    laymanHowItWorks:
      'Every heart muscle cell runs a pump in its outer membrane that pushes sodium out and pulls potassium in. Digoxin jams that pump. Sodium builds up inside the cell, which slows a second exchanger that normally removes calcium, so calcium accumulates and each contraction becomes stronger. Separately and probably more importantly, digoxin acts on the nervous system to increase vagal tone, which slows conduction through the electrical junction between the atria and the ventricles and brings a fast resting pulse down. The margin between a useful dose and a toxic one is narrower than for almost any other common drug.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 55,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1614 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 33 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The injection was approved in the United States on 16 November 1954 under NDA 009330 and the tablet under NDA 020405 on 30 September 1997 — the same year the DIG trial reported. A drug that had been prescribed for two centuries received its modern tablet approval and its first mortality answer within months of each other.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Every drug class that displaced digoxin in heart failure did so on the endpoint digoxin does not move. ACE inhibitors, beta-blockers, mineralocorticoid receptor antagonists and SGLT2 inhibitors each have placebo-controlled trials showing reduced mortality. Digoxin has one showing none. For rate control in atrial fibrillation the comparison is less lopsided but still unfavourable, because digoxin controls the resting rate and not the exercise rate.',
      conventionalRx: [
        {
          name: 'Beta-blockers — carvedilol, bisoprolol, metoprolol succinate',
          class: 'Beta-adrenergic antagonists',
          howItCompares:
            'In heart failure with reduced ejection fraction each of these three has its own placebo-controlled trial showing reduced all-cause mortality, which digoxin does not. In atrial fibrillation they control heart rate during exertion as well as at rest, where the label records that digoxin reduced resting heart rate but not heart rate during exercise.',
          typicalCost:
            'US$0.0214 per tablet for carvedilol at United States pharmacy acquisition cost (CMS NADAC, median across 88 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: mortality evidence; rate control that survives walking upstairs. Cons: bradycardia and fatigue; contraindicated in decompensated failure and, for non-selective agents, in asthma.',
        },
        {
          name: 'Diltiazem or verapamil',
          class: 'Rate-slowing calcium channel blockers',
          howItCompares:
            'Effective for ventricular rate control in atrial fibrillation at rest and on exertion, without digoxin’s narrow therapeutic index. Neither should be used in heart failure with reduced ejection fraction, which is exactly the population where digoxin is still reached for.',
          typicalCost:
            'US$0.3196 per unit for diltiazem at United States pharmacy acquisition cost (CMS NADAC, median across 177 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: wide margin of safety; exercise rate control. Cons: negatively inotropic, so unsuitable in systolic heart failure; both raise levels of several other drugs.',
        },
        {
          name: 'The disease-modifying heart failure regimen — ACE inhibitor or ARNI, beta-blocker, MRA, SGLT2 inhibitor',
          class: 'Neurohormonal and metabolic modulators',
          howItCompares:
            'These are the drugs that changed survival in heart failure with reduced ejection fraction, each on its own randomised mortality trial. Digoxin sits outside that group: its label describes improved ejection fraction, exercise capacity and hospitalisation, and no effect on mortality. It is a symptom and admission drug layered on top, not a substitute for any of them.',
          typicalCost:
            'Several are generic and among the cheapest prescription drugs in the United States; sacubitril/valsartan and the SGLT2 inhibitors are substantially more expensive',
          prosAndCons:
            'Pros: measured survival benefit. Cons: each requires titration and monitoring; renal function and potassium constrain several of them.',
        },
      ],
      naturalFoods: [
        {
          name: 'Hawthorn extract (Crataegus, WS 1442)',
          activeCompound: 'Oligomeric procyanidins and flavonoids from Crataegus leaf and flower',
          biologicalMechanism:
            'Hawthorn extracts show weak positive inotropic and vasodilatory activity in isolated preparations, sometimes described as a mild digitalis-like effect. The largest randomised test of that idea, SPICE, put 2,681 patients with NYHA II to III heart failure and ejection fraction at or below 35% on 900 mg a day of WS 1442 or placebo for 24 months on top of optimal therapy.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: SPICE missed its primary endpoint — time to first cardiac event, 27.9% against 28.9%, hazard ratio 0.95 (95% CI 0.82 to 1.10), p=0.476 — and cardiac mortality was not significantly reduced (HR 0.89, p=0.269). A subgroup with ejection fraction at or above 25% showed 39.7% less sudden cardiac death (HR 0.59, 95% CI 0.37 to 0.94, p=0.025), which is a subgroup finding in a negative trial and should be read as one. Adverse events were comparable to placebo.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Never eat the plant',
          action:
            'Foxglove is not a home remedy. Do not consume any part of Digitalis, and do not take an unstandardised digitalis preparation alongside prescribed digoxin.',
          patientImpact:
            'Digoxin has one of the narrowest margins in medicine: the label records that serum levels below 0.5 ng/mL are associated with diminished efficacy and levels above 2 ng/mL with increased toxicity without increased benefit. A plant delivers an unknown quantity of several cardiac glycosides at once.',
          clinicalPrecaution:
            'Toxicity presents as nausea, vomiting, visual disturbance and cardiac arrhythmias. Advanced age, low body weight, impaired renal function and electrolyte abnormalities all predispose to it.',
        },
        {
          name: 'Potassium is part of the mechanism, not a side issue',
          action:
            'Report vomiting, prolonged diarrhoea or any change in diuretic treatment, and do not start potassium supplements or salt substitutes on your own.',
          patientImpact:
            'Digoxin binds the sodium pump at a site that competes with extracellular potassium. Low potassium therefore increases digoxin binding and toxicity at an unchanged blood level, and high potassium reduces its effect. Diuretics, vomiting and diarrhoea all move potassium.',
          clinicalPrecaution:
            'The label lists electrolyte abnormalities among the factors predisposing to digoxin toxicity, and directs that a serum digoxin concentration be interpreted in the overall clinical context rather than used in isolation to change a dose.',
        },
        {
          name: 'A blood level is only meaningful at the right moment',
          action: 'If a digoxin level is being checked, the timing of the last dose matters.',
          patientImpact:
            'The label directs obtaining serum digoxin concentrations just before the next scheduled dose, or at least six hours after the last one. A sample taken during distribution reads high and can prompt a dose reduction that was never needed.',
          clinicalPrecaution:
            'The label also warns explicitly against using an isolated concentration as the basis for increasing or decreasing the dose.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@@H]1[C@H]([C@H](C[C@@H](O1)O[C@@H]2[C@H](O[C@H](C[C@@H]2O)O[C@@H]3[C@H](O[C@H](C[C@@H]3O)O[C@H]4CC[C@]5([C@@H](C4)CC[C@@H]6[C@@H]5C[C@H]([C@]7([C@@]6(CC[C@@H]7C8=CC(=O)OC8)O)C)O)C)C)C)O)O',
      chemicalFormula: 'C41H64O14',
      molecularWeight: '780.90 g/mol',
      targetReceptorAffinity:
        'A cardenolide: a steroid nucleus carrying an unsaturated five-membered lactone at C17 and a chain of three digitoxose sugars at C3. The lactone is what binds the sodium pump and the sugars set the pharmacokinetics — digoxin differs from digitoxin by a single hydroxyl at C12, and that hydroxyl is why digoxin is cleared renally with a half-life measured in days while digitoxin is cleared hepatically over weeks. The label states that all of digoxin’s actions are mediated through its effects on Na-K ATPase, and that inhibition increases intracellular calcium availability with consequent increased inotropy, increased automaticity and reduced conduction velocity, alongside indirect parasympathetic stimulation acting on the sinoatrial and atrioventricular nodes.',
      structureSource: {
        label:
          'PubChem CID 2724385 (digoxin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; mechanism from the LANOXIN label, section 12.1',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2724385',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dgx-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Assay and content uniformity are safety specifications here, not paperwork',
          description:
            'For most drugs a tablet a few per cent off specification is inconsequential. For digoxin the label puts diminished efficacy below 0.5 ng/mL and toxicity above 2 ng/mL, a fourfold window covering the whole useful range, and the tablet is dosed in micrograms. Content uniformity and dissolution therefore sit directly on the clinical margin. The related glycosides — digitoxin, which differs by one hydroxyl and is cleared over weeks rather than days, and the partially hydrolysed mono- and bis-digitoxosides — must be resolved from the parent rather than assayed with it.',
          reagentsAndBuffer:
            'Digoxin USP reference standard, reversed-phase HPLC with ultraviolet detection at 220 nm resolving digoxin, digitoxin, digoxigenin and the mono- and bis-digitoxosides, USP dissolution apparatus with content-uniformity testing on individual tablets, Karl Fischer titration',
        },
        {
          id: 'dgx-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Extract from Digitalis lanata and hydrolyse the parent glycoside',
          description:
            'Digoxin is not synthesised commercially. It is obtained from the leaves of Digitalis lanata, the woolly foxglove, where it exists as lanatoside C. Controlled removal of the acetyl group gives deacetyl-lanatoside C, and removal of the terminal glucose gives digoxin. Because the plant makes a family of closely related cardenolides in ratios that vary with cultivar, season and drying, the chemistry is inseparable from agronomy.',
          dependsOnStepId: 'dgx-w1',
          reagentsAndBuffer:
            'Dried Digitalis lanata leaf, aqueous alcohol extraction, controlled alkaline deacetylation of lanatoside C, enzymatic or acid-catalysed removal of the terminal glucose, lead acetate or resin clarification of the crude extract',
        },
        {
          id: 'dgx-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Drive out digitoxin, because the two behave nothing alike in the body',
          description:
            'The single most consequential impurity is digitoxin. It has similar potency at the pump and radically different pharmacokinetics — hepatic clearance and a half-life of weeks rather than renal clearance over days — so a batch carrying digitoxin behaves correctly on the first day and accumulates for a month. Immunoassays used to monitor patients cross-react between the two, which means the error would be invisible from the clinic.',
          dependsOnStepId: 'dgx-w2',
          reagentsAndBuffer:
            'Preparative reversed-phase or silica chromatography, repeated crystallisation from aqueous ethanol, HPLC release testing against USP limits for digitoxin and related cardenolides, reference standards for each named related substance',
        },
        {
          id: 'dgx-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure pump inhibition across a potassium gradient, not at one concentration',
          description:
            'Digoxin binds the extracellular face of the sodium pump at a site where potassium competes with it. Running the inhibition assay at a single potassium concentration therefore reports one point on a surface and hides the clinically decisive fact: the same plasma concentration is more toxic when the patient is hypokalaemic. The assay that reproduces the clinic varies extracellular potassium across the physiological and hypokalaemic range and reports the shift.',
          dependsOnStepId: 'dgx-w3',
          reagentsAndBuffer:
            'Purified porcine or human Na+/K+-ATPase preparations and human induced-pluripotent-stem-cell-derived cardiomyocytes, ATPase activity by inorganic phosphate release or coupled pyruvate kinase/lactate dehydrogenase assay, extracellular potassium varied from 2.5 to 5.5 mmol/L, ouabain as the reference cardiac glycoside, calcium imaging for the downstream inotropic readout',
        },
        {
          id: 'dgx-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Validate the serum assay against the two things that break it',
          description:
            'Patient monitoring depends on an immunoassay, and two known interferences invalidate it. Endogenous digoxin-like immunoreactive substances give falsely raised readings in renal failure, pregnancy and the newborn — exactly the states in which a clinician most wants a number. And after digoxin-specific antibody fragments are given for toxicity, total measured digoxin rises sharply while free, active digoxin collapses, so the conventional assay reads dangerously high at the moment the patient is being treated. A monitoring method that has not been characterised against both is a method that fails when it matters.',
          dependsOnStepId: 'dgx-w4',
          reagentsAndBuffer:
            'Digoxin immunoassay platform with matched free-digoxin ultrafiltration protocol, LC-MS/MS as the orthogonal reference method, sera from renal failure, third-trimester pregnancy and neonatal donors as interference matrices, digoxin immune Fab as the post-treatment interference control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dgx-a1',
        category: 'failed',
        title: 'The DIG trial: no effect on mortality, and the label says so in the indication',
        laymanSummary:
          'Six thousand eight hundred people with heart failure were randomised to digoxin or placebo. Almost exactly the same proportion died in each group. Hospital admissions for heart failure fell substantially.',
        technicalDetails:
          'The DIG main trial randomised 6,800 patients with left ventricular ejection fraction of 0.45 or less to digoxin (n=3,397, median 0.25 mg daily) or placebo (n=3,403) on top of diuretics and ACE inhibitors, with average follow-up 37 months. There were 1,181 deaths (34.8%) on digoxin and 1,194 (35.1%) on placebo: risk ratio 0.99 (95% CI 0.91 to 1.07), p=0.80. Death attributed to worsening heart failure showed a non-significant trend downward (RR 0.88, 95% CI 0.77 to 1.01, p=0.06). Hospitalisation for worsening heart failure fell from 34.7% to 26.8%, RR 0.72 (95% CI 0.66 to 0.79), p<0.001, with 6% fewer hospitalisations overall. An ancillary trial in 988 patients with ejection fraction above 0.45 was consistent. The regulatory consequence is unusual: the LANOXIN indication for heart failure states that the drug improves ejection fraction, exercise capacity and hospitalisation "while having no effect on mortality". Negative mortality findings are rarely written directly into an indication.',
        evidenceSource: 'The Digitalis Investigation Group. N Engl J Med 1997;336:525-533',
        doi: '10.1056/NEJM199702203360801',
        measuredMetric:
          'All-cause mortality over an average 37 months in 6,800 patients with heart failure and ejection fraction 0.45 or below',
        auditFlag: 'verified',
      },
      {
        id: 'dgx-a2',
        category: 'conclusion_shift',
        title: 'Two hundred and twelve years between the first description and the first trial',
        laymanSummary:
          'Foxglove was written up as a treatment for dropsy in 1785. The first properly powered placebo-controlled trial of whether digoxin helps people live longer reported in 1997, and it did not.',
        technicalDetails:
          'William Withering published his account of the foxglove and its medical uses in 1785. Digoxin was isolated from Digitalis lanata in 1930 and the injection was approved in the United States on 16 November 1954 under NDA 009330, before efficacy evidence was a condition of approval. The tablet received its own approval under NDA 020405 on 30 September 1997 — the same year the DIG trial reported. So the modern regulatory approval of the tablet and the first answer to the question of whether the drug prolongs life arrived within months of each other, after two centuries of continuous prescribing. The result was neutral on mortality and positive on hospitalisation, which is neither vindication nor refutation. It is what an unmeasured practice looks like once someone finally measures it, and the value of the record is that it shows how long a therapy can be used confidently without anyone knowing.',
        evidenceSource:
          'FDA Drugs@FDA application records NDA 009330 (original approval 16 November 1954) and NDA 020405 (original approval 30 September 1997); The Digitalis Investigation Group, N Engl J Med 1997;336:525-533',
        doi: '10.1056/NEJM199702203360801',
        measuredMetric:
          'Interval between first published clinical description and first adequately powered placebo-controlled mortality trial',
        auditFlag: 'caution',
      },
      {
        id: 'dgx-a3',
        category: 'failed',
        title: 'For atrial fibrillation it controls the resting rate and not the exercise rate',
        laymanSummary:
          'The label states that digoxin reduced the resting heart rate but not the heart rate during exercise, and that in a head-to-head trial it gave the least satisfactory rate control of the three drugs tested.',
        technicalDetails:
          'The LANOXIN clinical studies section reports that digoxin reduced resting heart rate but not heart rate during exercise. In three randomised double-blind trials totalling 315 adults comparing digoxin with placebo for conversion of recent-onset atrial fibrillation, conversion was equally likely and equally rapid in both groups — digoxin does not cardiovert. In a randomised 120-patient trial comparing digoxin, sotalol and amiodarone, patients randomised to digoxin had the lowest incidence of conversion to sinus rhythm and the least satisfactory rate control when conversion did not occur. The licensed indication is correspondingly precise: control of resting ventricular rate in adults with chronic atrial fibrillation. A patient whose pulse is acceptable in a clinic chair and unacceptable climbing stairs has been treated exactly as the label describes, and the label does not claim otherwise.',
        evidenceSource:
          'LANOXIN (digoxin) United States prescribing information, sections 1.3 and 14.2 (NDA 020405)',
        inferredClaim:
          'That digoxin provides rate control in atrial fibrillation generally, when its label records an effect on resting rate only and the worst performance of three drugs in a head-to-head comparison',
        auditFlag: 'caution',
      },
      {
        id: 'dgx-a4',
        category: 'conclusion_shift',
        title: 'The therapeutic range was moved downward by a re-analysis of the DIG data',
        laymanSummary:
          'A re-analysis of the same trial found that men whose blood levels sat between 0.5 and 0.8 did better than placebo, and men whose levels were 1.2 or above did substantially worse. The target range came down as a result.',
        technicalDetails:
          'Rathore and colleagues re-analysed DIG restricted to 3,782 men with ejection fraction 45% or below, dividing the digoxin arm by serum digoxin concentration at one month. Crude all-cause mortality rose across the bands: 29.9% at 0.5 to 0.8 ng/mL, 38.8% at 0.9 to 1.1 and 48.0% at 1.2 or above, p=0.006 for trend. Against placebo, the lowest band had a 6.3% lower absolute mortality (95% CI 2.1% to 10.5%), the middle band no reduction (2.6% increase, 95% CI −3.0% to 8.3%), and the highest band an 11.8% higher absolute mortality (95% CI 5.7% to 18.0%). Adjusted hazard ratios were 0.80, 0.89 and 1.16 against placebo. The current label reflects the shift: levels below 0.5 ng/mL are associated with diminished efficacy and levels above 2 ng/mL with increased toxicity without increased benefit, and the label directs that a concentration be interpreted in clinical context rather than used in isolation to change a dose. This is a post-hoc analysis of an observed rather than randomised variable, so it cannot prove that lowering a level saves a life. It is strong enough that practice moved, and the reader should know which of those two statements the evidence supports.',
        evidenceSource:
          'Rathore SS, Curtis JP, Wang Y, Bristow MR, Krumholz HM. JAMA 2003;289:871-878',
        doi: '10.1001/jama.289.7.871',
        measuredMetric:
          'All-cause mortality by serum digoxin concentration band against placebo in 3,782 men from the DIG trial',
        auditFlag: 'contested',
      },
      {
        id: 'dgx-a5',
        category: 'failed',
        title: 'In the same trial, women on digoxin died more often than women on placebo',
        laymanSummary:
          'A post-hoc analysis found the drug behaved differently by sex: women randomised to digoxin had a higher death rate than women on placebo, while men showed no difference.',
        technicalDetails:
          'Rathore, Wang and Krumholz analysed the 6,800 DIG participants for an interaction between sex and digoxin on all-cause mortality. The absolute difference between men and women in digoxin’s effect was 5.8 percentage points (95% CI 0.5 to 11.1), p=0.034 for interaction. Women on digoxin died at 33.1% against 28.9% on placebo — absolute difference 4.2%, 95% CI −0.5% to 8.8%. Men died at 35.2% against 36.9%, difference −1.6%, 95% CI −4.2% to 1.0%. In multivariable analysis digoxin carried an adjusted hazard ratio of 1.23 (95% CI 1.02 to 1.47) in women and 0.93 (95% CI 0.85 to 1.02) in men, interaction p=0.014. This is a post-hoc subgroup analysis and the confidence interval on the women’s absolute difference crosses zero, so it is a signal rather than a finding. It is also mechanistically coherent with the concentration analysis published the following year, since women in DIG achieved higher serum concentrations for a given dose. Two independent post-hoc analyses of the same trial pointing at the same explanation is worth more than either alone, and still less than a trial designed to test it.',
        evidenceSource: 'Rathore SS, Wang Y, Krumholz HM. N Engl J Med 2002;347:1403-1411',
        doi: '10.1056/NEJMoa021266',
        measuredMetric:
          'All-cause mortality by sex in the DIG trial (women: adjusted HR 1.23, 95% CI 1.02 to 1.47; men: 0.93, 95% CI 0.85 to 1.02; interaction p=0.014)',
        auditFlag: 'contested',
      },
      {
        id: 'dgx-a6',
        category: 'inferred',
        title: 'In atrial fibrillation, the mortality signal is observational and disputed',
        laymanSummary:
          'An analysis of a large atrial fibrillation trial found people taking digoxin died more often, by about 40%. But they were not randomised to it, and sicker people are more likely to be given it in the first place.',
        technicalDetails:
          'Whitbeck and colleagues analysed digoxin use within the AFFIRM trial using multivariable Cox models. Digoxin was associated with increased all-cause mortality (estimated hazard ratio 1.41, 95% CI 1.19 to 1.67, p<0.001), cardiovascular mortality (1.35, 95% CI 1.06 to 1.71, p=0.016) and arrhythmic mortality (1.61, 95% CI 1.12 to 2.30, p=0.009). The association held both in patients without heart failure (1.37, 95% CI 1.05 to 1.79, p=0.019) and with it (1.41, 95% CI 1.09 to 1.84, p=0.010), and there was no significant interaction with sex. The authors concluded that the findings call into question the widespread use of digoxin in atrial fibrillation. The standard objection is confounding by indication — digoxin tends to be given to patients who are sicker — and the authors addressed it by adjustment rather than by randomisation, which is not the same thing. What can be said with confidence is that there is no randomised evidence of a mortality benefit for digoxin in atrial fibrillation, that the observational evidence points the other way, and that no adequately powered randomised trial has settled it.',
        evidenceSource:
          'Whitbeck MG, Charnigo RJ, Khairy P, et al. Eur Heart J 2013;34:1481-1488 (AFFIRM analysis)',
        doi: '10.1093/eurheartj/ehs348',
        inferredClaim:
          'That digoxin causes the excess mortality observed in atrial fibrillation cohorts — an association from a non-randomised comparison within a randomised trial, adjusted but not randomised',
        auditFlag: 'contested',
      },
      {
        id: 'dgx-a7',
        category: 'measured',
        title: 'The narrowest useful window of any common cardiac drug',
        laymanSummary:
          'Below about 0.5 the drug does little; above about 2 it becomes dangerous without becoming more effective. Age, weight, kidney function and salt balance all move where a given dose lands inside that window.',
        technicalDetails:
          'The label states that serum digoxin levels below 0.5 ng/mL have been associated with diminished efficacy and levels above 2 ng/mL with increased toxicity without increased benefit — a fourfold window in a drug dosed in micrograms and cleared renally. Toxicity presents as nausea, vomiting, visual disturbance and cardiac arrhythmias, and advanced age, low body weight, impaired renal function and electrolyte abnormalities all predispose to it. The drug is contraindicated in ventricular fibrillation. It is specifically dangerous in Wolff-Parkinson-White syndrome with atrial fibrillation, where slowing atrioventricular conduction more than accessory-pathway conduction raises the risk of a rapid ventricular response and ventricular fibrillation. It can cause severe sinus bradycardia or sinoatrial block in pre-existing sinus node disease and advanced heart block in pre-existing incomplete AV block. It is not recommended in acute myocardial infarction and should be avoided in myocarditis, and it carries a risk of ventricular arrhythmias during electrical cardioversion. The mechanism explains the fragility: the binding site on the sodium pump is one where extracellular potassium competes, so a fall in potassium increases effective drug action at an unchanged blood level.',
        evidenceSource:
          'LANOXIN (digoxin) United States prescribing information, sections 2, 4, 5.1 to 5.6 and 12.1 (NDA 020405)',
        measuredMetric:
          'Serum concentration thresholds for diminished efficacy and for toxicity, and the enumerated predisposing factors, from the label',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A steroid with a lactone and three sugars',
        laymanDesc:
          'Digoxin comes from the leaves of woolly foxglove. Its business end is a small ring that latches onto a pump in the heart cell membrane; the sugar chain attached to it decides how long the drug stays in the body.',
        molecularDetail:
          'A cardenolide: steroid nucleus, unsaturated five-membered lactone at C17, three digitoxose sugars at C3. It differs from digitoxin by a single C12 hydroxyl, which redirects clearance from hepatic over weeks to renal over days.',
        iconName: 'Sprout',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It jams the sodium pump',
        laymanDesc:
          'Every cell runs a pump that pushes sodium out and pulls potassium in. Digoxin blocks it from the outside — at the same site potassium uses, which is why low potassium makes the drug stronger.',
        molecularDetail:
          'The label states that all of digoxin’s actions are mediated through its effects on Na-K ATPase, the enzyme responsible for moving sodium out of and potassium into cells. Binding is at the extracellular face where potassium competes.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Calcium accumulates and the contraction gets stronger',
        laymanDesc:
          'With sodium building up inside, the exchanger that normally clears calcium out of the cell slows down. More calcium means a more forceful beat.',
        molecularDetail:
          'The label states that inhibiting Na-K ATPase causes increased availability of intracellular calcium in the myocardium and conduction system, with consequent increased inotropy, increased automaticity and reduced conduction velocity — an increase in the force and velocity of systolic contraction.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'And the nervous system slows the heart down',
        laymanDesc:
          'Separately from the pump, digoxin increases vagal tone and resets pressure sensors, which slows conduction through the junction between the upper and lower chambers. That is what brings a fast resting pulse down.',
        molecularDetail:
          'The label describes indirect parasympathetic stimulation of the autonomic nervous system with effects on the sinoatrial and atrioventricular nodes, reduced catecholamine reuptake at nerve terminals, and increased baroreceptor sensitisation with enhanced sympathetic withdrawal. At higher concentrations it increases central sympathetic outflow and allows efflux of intracellular potassium.',
        iconName: 'Activity',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'Fewer admissions, better exercise capacity',
        laymanDesc:
          'In heart failure the measurable result is fewer hospital stays and a better ability to walk, not a longer life.',
        molecularDetail:
          'DIG: hospitalisation for worsening heart failure 26.8% against 34.7%, RR 0.72 (95% CI 0.66 to 0.79), p<0.001, with 6% fewer hospitalisations overall. RADIANCE and PROVED, the two withdrawal trials in 178 and 88 patients, showed better preservation of exercise capacity on continued digoxin.',
        iconName: 'Home',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And no difference in survival',
        laymanDesc:
          'The same trial found deaths of 34.8% on the drug and 35.1% on placebo. The label puts that finding inside the indication itself.',
        molecularDetail:
          'DIG: 1,181 deaths (34.8%) against 1,194 (35.1%), risk ratio 0.99 (95% CI 0.91 to 1.07), p=0.80, over an average 37 months. The LANOXIN heart failure indication states the drug improves ejection fraction, exercise capacity and hospitalisation "while having no effect on mortality".',
        iconName: 'MinusCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'DIG — Digitalis Investigation Group main trial (N Engl J Med 1997;336:525-533)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 6800,
        primaryEndpoint:
          'All-cause mortality in patients with heart failure and left ventricular ejection fraction 0.45 or below, on diuretics and ACE inhibitors',
        endpointMet: false,
        statisticalPValue:
          '1,181 deaths (34.8%) on digoxin against 1,194 (35.1%) on placebo; risk ratio 0.99 (95% CI 0.91 to 1.07), p=0.80, over an average 37 months',
        unreportedAdverseSignals:
          'Hospitalisation for worsening heart failure did fall, 26.8% against 34.7%, RR 0.72 (95% CI 0.66 to 0.79), p<0.001. Death from worsening heart failure trended down (RR 0.88, p=0.06) while total deaths did not move, which implies an offsetting rise in other cardiac deaths. Two later post-hoc analyses of this dataset found higher mortality in women on digoxin and a concentration-dependent mortality gradient, neither of which was a randomised comparison.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'RADIANCE and PROVED withdrawal trials (reported in the NDA 020405 label)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled withdrawal',
        sampleSize: 266,
        primaryEndpoint:
          'Preservation of exercise capacity on continued digoxin against withdrawal to placebo over 12 weeks in NYHA class II to III heart failure previously treated with oral digoxin',
        endpointMet: true,
        statisticalPValue:
          'Both trials demonstrated better preservation of exercise capacity on continued LANOXIN, and continued treatment reduced heart-failure-related hospitalisations, emergency care and the need for additional heart failure therapy',
        unreportedAdverseSignals:
          'These are withdrawal designs in patients already established and tolerating the drug, which selects for responders and cannot answer whether starting digoxin in a new patient helps. They are 12 weeks long and measured no mortality endpoint. Sample size shown is the sum of the two trials the label describes, 178 and 88.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Atrial fibrillation programme — conversion and rate control trials (NDA 020405 label)',
        phase: 'Randomised, double-blind, placebo- and active-controlled',
        sampleSize: 315,
        primaryEndpoint:
          'Conversion of recent-onset atrial fibrillation to sinus rhythm, and ventricular rate control in chronic atrial fibrillation',
        endpointMet: false,
        statisticalPValue:
          'Across three randomised double-blind trials totalling 315 adults, conversion was equally likely and equally rapid on digoxin and placebo. Digoxin reduced resting heart rate but not heart rate during exercise',
        unreportedAdverseSignals:
          'In a separate randomised 120-patient trial against sotalol and amiodarone, digoxin had the lowest incidence of conversion to sinus rhythm and the least satisfactory rate control when conversion did not occur. The licensed indication is limited accordingly to control of resting ventricular rate in chronic atrial fibrillation.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'All-cause mortality 34.8% against 35.1% in 6,800 patients with heart failure (DIG, RR 0.99, 95% CI 0.91 to 1.07, p=0.80)',
        'Hospitalisation for worsening heart failure 26.8% against 34.7% in the same trial (RR 0.72, 95% CI 0.66 to 0.79, p<0.001)',
        'Conversion of recent-onset atrial fibrillation equally likely and equally rapid on digoxin and placebo across three randomised trials totalling 315 adults',
        'Resting heart rate reduced in chronic atrial fibrillation; heart rate during exercise not reduced',
        'Crude mortality in DIG men by serum concentration band: 29.9% at 0.5 to 0.8 ng/mL, 38.8% at 0.9 to 1.1, 48.0% at 1.2 or above (p=0.006 for trend)',
      ],
      unsupportedInferences: [
        'That digoxin prolongs life in heart failure — measured directly and found not to',
        'That it provides rate control in atrial fibrillation generally, when the effect measured was on resting rate only',
        'That the concentration-mortality gradient proves lowering a level saves lives, when serum concentration was observed rather than randomised',
        'That the AFFIRM association proves digoxin causes death in atrial fibrillation, when patients were not randomised to it and sicker patients receive it more often',
        'That two centuries of clinical confidence constituted evidence of survival benefit before 1997',
      ],
      whatFailedInitially: [
        'The mortality endpoint of the only adequately powered placebo-controlled trial, at p=0.80',
        'Conversion of atrial fibrillation to sinus rhythm — no better than placebo in three randomised trials',
        'Exercise heart rate control in atrial fibrillation, and the head-to-head comparison against sotalol and amiodarone',
        'Post-hoc analyses of the trial dataset found higher mortality in women and at higher serum concentrations, in the direction of harm rather than benefit',
      ],
      realWorldOutcome: [
        'Injection approved in the United States on 16 November 1954 under NDA 009330; tablet under NDA 020405 on 30 September 1997',
        'About sixteen United States cents a tablet at pharmacy acquisition cost across 33 listed products',
        'Displaced from first-line heart failure therapy by every class that demonstrated a mortality benefit, and retained as a symptom and admission drug added on top',
        'Its label is one of very few that state a negative mortality result inside the indication itself',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, oral solution and intravenous injection; paediatric formulations available',
      description:
        'Cleared predominantly by the kidney, so renal function largely sets the maintenance dose, and the elimination half-life is measured in days rather than hours. That is why an adequate blood level takes about a week to establish without a loading strategy, and why a fall in renal function raises the level over the same timescale. The label directs obtaining serum digoxin concentrations immediately before the next scheduled dose or at least six hours after the last, and interpreting the number in the overall clinical context rather than using an isolated measurement to change the dose.',
      safetyProfile:
        'Contraindicated in ventricular fibrillation and in known hypersensitivity to digoxin or other digitalis preparations. In Wolff-Parkinson-White syndrome with atrial fibrillation, digoxin slows atrioventricular conduction more than accessory-pathway conduction and increases the risk of a rapid ventricular response leading to ventricular fibrillation. It may cause severe sinus bradycardia or sinoatrial block in pre-existing sinus node disease, and advanced or complete heart block in pre-existing incomplete AV block, so a pacemaker should be considered first. It is not recommended in acute myocardial infarction, should be avoided in myocarditis, and carries a risk of ventricular arrhythmias during electrical cardioversion. Toxicity presents as nausea, vomiting, visual disturbance and cardiac arrhythmias; advanced age, low body weight, impaired renal function and electrolyte abnormalities predispose to it. Levels below 0.5 ng/mL are associated with diminished efficacy and levels above 2 ng/mL with increased toxicity without increased benefit.',
    },
    commonQuestions: [
      {
        q: 'Does digoxin help people with heart failure live longer?',
        a: 'No, and this is one of the few drugs where the label itself says so. The DIG trial randomised 6,800 patients with heart failure to digoxin or placebo for an average of 37 months: 34.8% of the digoxin group died against 35.1% on placebo, a risk ratio of 0.99 at p=0.80. What it did do was reduce hospital admissions for worsening heart failure from 34.7% to 26.8%. The LANOXIN indication describes exactly that — improved ejection fraction, improved exercise capacity, fewer heart-failure hospitalisations and emergency visits — and then adds the phrase "while having no effect on mortality". Fewer admissions and better exercise tolerance are worth having. They are a different thing from living longer, and the label does not blur them.',
        auditNote:
          'A negative mortality result written into a licensed indication is rare enough to be worth noticing. Most labels simply omit what was not shown.',
      },
      {
        q: 'It has been used since the eighteenth century. Doesn’t that count as evidence?',
        a: 'It counts as evidence that the drug does something noticeable, which it does — Withering’s 1785 account of foxglove in dropsy describes a real effect on a real disease. It does not count as evidence about survival, because survival cannot be judged from individual cases. Digoxin was isolated in 1930 and the injection was approved in the United States in 1954, before efficacy evidence was a condition of approval. The first adequately powered placebo-controlled mortality trial reported in 1997, and the answer was neutral. That is the specific value of this record: it shows how long a therapy can be prescribed with complete confidence while the question everyone assumed was settled had never actually been asked.',
      },
      {
        q: 'Why is the blood test such a big deal with this drug?',
        a: 'Because the window between useless and dangerous is unusually narrow. The label puts diminished efficacy below 0.5 ng/mL and toxicity without added benefit above 2 ng/mL, in a drug dosed in micrograms and cleared by the kidneys. A re-analysis of the DIG trial in 3,782 men found crude mortality of 29.9% at concentrations of 0.5 to 0.8 ng/mL, 38.8% at 0.9 to 1.1 and 48.0% at 1.2 or above. Timing matters too: the label directs sampling immediately before the next dose or at least six hours after the last one, because a sample drawn while the drug is still distributing reads falsely high. And it warns against changing a dose on an isolated number, which is worth knowing if a single result comes back unexpectedly.',
      },
      {
        q: 'I have atrial fibrillation and my pulse is fine sitting down but races when I walk. Is that the drug failing?',
        a: 'That is the drug doing exactly what the label describes. The LANOXIN clinical studies section states that digoxin reduced resting heart rate but not heart rate during exercise, and the licensed indication is specifically control of resting ventricular rate in chronic atrial fibrillation. The mechanism explains it: much of digoxin’s rate-slowing works through increased vagal tone, and exercise withdraws vagal tone. In a randomised 120-patient comparison against sotalol and amiodarone, digoxin gave the least satisfactory rate control of the three. Beta-blockers and the rate-slowing calcium channel blockers control the rate during exertion as well as at rest.',
      },
      {
        q: 'I read that digoxin increases the risk of death in atrial fibrillation. Should I be worried?',
        a: 'It deserves a conversation and not alarm. The finding comes from an analysis of the AFFIRM trial in which digoxin use was associated with a 41% higher all-cause mortality (95% CI 1.19 to 1.67, p<0.001) after adjustment for clinical characteristics, in patients with and without heart failure alike. The important caveat is that nobody was randomised to digoxin in that comparison — it records what happened to people who were given it, and the people given it tend to be sicker in ways no statistical adjustment fully captures. The authors said their findings call the widespread use of digoxin in atrial fibrillation into question, which is a fair summary. What is definitely true is that there is no randomised evidence that digoxin improves survival in atrial fibrillation, and no trial has been done that would settle the question either way.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'The Digitalis Investigation Group. The effect of digoxin on mortality and morbidity in patients with heart failure. N Engl J Med 1997;336:525-533',
        identifier: '10.1056/NEJM199702203360801',
        kind: 'doi',
      },
      {
        label:
          'Rathore SS, Wang Y, Krumholz HM. Sex-based differences in the effect of digoxin for the treatment of heart failure. N Engl J Med 2002;347:1403-1411',
        identifier: '10.1056/NEJMoa021266',
        kind: 'doi',
      },
      {
        label:
          'Rathore SS, Curtis JP, Wang Y, Bristow MR, Krumholz HM. Association of serum digoxin concentration and outcomes in patients with heart failure. JAMA 2003;289:871-878',
        identifier: '10.1001/jama.289.7.871',
        kind: 'doi',
      },
      {
        label:
          'Whitbeck MG, Charnigo RJ, Khairy P, et al. Increased mortality among patients taking digoxin — analysis from the AFFIRM study. Eur Heart J 2013;34:1481-1488',
        identifier: '10.1093/eurheartj/ehs348',
        kind: 'doi',
      },
      {
        label:
          'Holubarsch CJF, Colucci WS, Meinertz T, et al. The efficacy and safety of Crataegus extract WS 1442 in patients with heart failure: the SPICE trial. Eur J Heart Fail 2008;10:1255-1263',
        identifier: '10.1016/j.ejheart.2008.10.004',
        kind: 'doi',
      },
      {
        label:
          'LANOXIN (digoxin) United States prescribing information — Indications 1.1 to 1.3, Dosage 2, Contraindications 4, Warnings and Precautions 5.1 to 5.6, Clinical Pharmacology 12.1, Clinical Studies 14.1 and 14.2 (NDA 020405, original approval 30 September 1997)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020405',
        kind: 'regulatory',
      },
      {
        label:
          'FDA Drugs@FDA record for LANOXIN injection, NDA 009330, original approval 16 November 1954',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=009330',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — digoxin, 33 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2724385 — digoxin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2724385',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Isosorbide dinitrate — a drug whose own label states that continuous use makes it stop
  //    working, that dose escalation has consistently failed to overcome that, and that no
  //    regimen should be expected to work for more than about twelve hours a day.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'isosorbide-dinitrate',
    name: 'Isosorbide Dinitrate',
    tradeName:
      'Isordil / Dilatrate-SR / Sorbitrate; as a fixed combination with hydralazine, BiDil',
    sponsor:
      'Bausch Health holds Isordil; generic tablets are marketed under numerous ANDAs including 086923, 086925 and 087537. The fixed-dose combination with hydralazine is BiDil, NDA 020727',
    targetGene: 'GUCY1A1',
    targetProtein:
      'Soluble guanylate cyclase in vascular smooth muscle, activated by nitric oxide released when the nitrate ester is bioactivated — although the label itself declines to name a molecular target and describes only relaxation of vascular smooth muscle',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1959,
    indication:
      'Prevention of angina pectoris due to coronary artery disease. The onset of action of immediate-release oral isosorbide dinitrate is not sufficiently rapid for it to be useful in aborting an acute anginal episode',
    patientFriendlyIndication: 'Preventing angina — chest pain from narrowed heart arteries',
    anatomicalSite:
      'Vascular smooth muscle, predominantly on the venous side — the veins dilate more than the arteries, which is why the drug works by reducing what returns to the heart rather than by opening the blockage',
    conditionContext: {
      conditionExplainer:
        'Angina is chest pain that appears when the heart muscle needs more blood than narrowed arteries can deliver. Nitrates do not clear the narrowing. They reduce how hard the heart has to work, mostly by pooling blood in the veins so less returns to the heart with each beat.',
      whyItMatters:
        'This page is worth reading for one reason above all others: the drug’s own prescribing information says, in plain language, that taking it continuously makes it stop working, that giving more does not fix that, and that no dosing schedule should be expected to deliver more than about twelve hours of anti-anginal effect a day. Very few labels are that candid about a drug’s central limitation.',
      whoTakesThis:
        'Adults with stable angina, as prevention rather than rescue. In the fixed combination with hydralazine, adults with heart failure — an indication written for self-identified black patients, and one of the most contested labelling decisions in modern regulatory history.',
      clinicalGoals:
        'Fewer episodes of angina and better exercise tolerance during the hours the drug is working. Not survival, and not a smaller blockage.',
    },
    oneSentenceVerdict:
      'A nitrate whose FDA label states that in the large majority of controlled exercise trials continuously delivered nitrates were no more effective than placebo after 24 hours or less, that attempts to overcome this by dose escalation "have consistently failed", and that no regimen should be expected to provide more than about twelve hours of anti-anginal efficacy a day — and which, combined with hydralazine, produced a 43% reduction in death in A-HeFT (6.2% against 10.2%, p=0.02) in an indication written for one self-identified racial group on the strength of retrospective subgroup analyses.',
    laymanHowItWorks:
      'Isosorbide dinitrate is a nitrate ester. Once in the body it releases nitric oxide, the signalling molecule blood vessels use to relax themselves, and the veins relax more than the arteries do. With the veins holding more blood, less returns to the heart, so the heart does less work per beat and needs less oxygen — and the chest pain that comes from an oxygen shortfall eases. The problem is that blood vessels adapt: keep nitric oxide arriving continuously and within a day the vessels stop responding. The only fix anyone has found is to stop taking it for part of every day.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 60,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1972 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 59 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'On the United States market since 1959 and generic for decades. The interesting pricing story is not the tablet but the combination: isosorbide dinitrate and hydralazine are both very old generics, and putting the two in one tablet as BiDil created a patented product with a race-specific indication out of two molecules that had been in the public domain for half a century.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For angina prevention, the comparison is against drugs that do not stop working when taken continuously. Beta-blockers and calcium channel blockers have no tolerance problem and beta-blockers have outcome evidence after infarction that nitrates do not. Nitrates keep their place because they act on a different variable and can be added to either.',
      conventionalRx: [
        {
          name: 'Beta-blockers — metoprolol, bisoprolol, atenolol',
          class: 'Beta-adrenergic antagonists',
          howItCompares:
            'Reduce angina by lowering heart rate and contractility, work continuously without developing tolerance, and after myocardial infarction several members of the class have mortality evidence. Nitrates have none of that.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: no tolerance; outcome evidence in the post-infarction setting; once daily. Cons: fatigue and bradycardia; contraindicated in decompensated heart failure and, for non-selective agents, in asthma.',
        },
        {
          name: 'Amlodipine or diltiazem',
          class: 'Calcium channel blockers',
          howItCompares:
            'Prevent angina by relaxing arteries and, for diltiazem and verapamil, by slowing the heart. They do not develop nitrate-style tolerance and do not need a drug-free interval, so they cover the whole 24 hours rather than about twelve.',
          typicalCost:
            'US$0.3196 per unit for diltiazem at United States pharmacy acquisition cost (CMS NADAC, median across 177 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: continuous cover; no tolerance. Cons: ankle swelling with amlodipine; diltiazem and verapamil are unsuitable in systolic heart failure and raise levels of several other drugs.',
        },
        {
          name: 'Isosorbide mononitrate',
          class: 'Organic nitrate',
          howItCompares:
            'The active metabolite of isosorbide dinitrate, marketed as a drug in its own right, with the advantage of near-complete and far less variable bioavailability — the dinitrate’s bioavailability ranges from 10% to 90% with a mean around 25%. It has the same tolerance problem and the same requirement for a daily nitrate-free interval, because the problem is the class rather than the molecule.',
          typicalCost:
            'US$0.0977 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 35 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: predictable absorption; fewer daily doses. Cons: identical tolerance; identical phosphodiesterase-inhibitor contraindication; no outcome evidence.',
        },
      ],
      naturalFoods: [
        {
          name: 'Dietary nitrate — beetroot, rocket, spinach and other leafy greens',
          activeCompound:
            'Inorganic nitrate, reduced to nitrite by bacteria on the tongue and then to nitric oxide in tissue',
          biologicalMechanism:
            'The nitrate-nitrite-nitric oxide pathway reaches the same endpoint as a nitrate drug — nitric oxide in vascular smooth muscle — by a route that does not use the ester bioactivation enzymes and does not appear to produce the same rapid tolerance. Antibacterial mouthwash abolishes the effect, which is unusually direct evidence that the oral bacteria are the necessary step.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: randomised trials of dietary nitrate are short, mostly weeks, and measure blood pressure, exercise performance or endothelial function rather than angina episodes or cardiovascular events. None has been run as a substitute for a prescribed nitrate, and none should be treated as one.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'The gap in the schedule is the treatment, not a lapse in it',
          action:
            'Take it on the schedule prescribed, including the long interval with no dose, and do not fill the gap.',
          patientImpact:
            'The label states that every dosing regimen must provide a daily dose-free interval to minimise tolerance, and that with immediate-release tablets the interval must be at least 14 hours. A patient who spaces doses evenly through the day to "cover" the night will lose the drug’s effect entirely within about a day.',
          clinicalPrecaution:
            'The label also states that the effects of the second and later doses have been smaller and shorter-lasting than the effects of the first, and that no regimen should be expected to provide more than about 12 hours of continuous anti-anginal efficacy per day.',
        },
        {
          name: 'Erectile dysfunction drugs are an absolute contraindication',
          action:
            'Never combine this with sildenafil, tadalafil or vardenafil, and say you take a nitrate before any such prescription.',
          patientImpact:
            'The label contraindicates concomitant use, stating it can cause severe hypotension, syncope or myocardial ischaemia. Both drug classes raise cyclic GMP by different steps of the same pathway, so their effects multiply rather than add.',
          clinicalPrecaution:
            'The soluble guanylate cyclase stimulator riociguat is contraindicated for the same reason. The label notes that the time course and dose dependence of the sildenafil interaction have not been studied, so there is no safe interval to quote.',
        },
        {
          name: 'This tablet is not for an attack in progress',
          action:
            'Know which of your nitrates is the preventive one and which is the rescue one, and do not substitute.',
          patientImpact:
            'The indication states that the onset of action of immediate-release oral isosorbide dinitrate is not sufficiently rapid for it to be useful in aborting an acute anginal episode. Serum levels peak about an hour after ingestion.',
          clinicalPrecaution:
            'The label also states that the benefits of immediate-release oral isosorbide dinitrate in acute myocardial infarction or congestive heart failure have not been established, and that because its effects are difficult to terminate rapidly the formulation is not recommended in those settings.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1[C@H]([C@@H]2[C@H](O1)[C@H](CO2)O[N+](=O)[O-])O[N+](=O)[O-]',
      chemicalFormula: 'C6H8N2O8',
      molecularWeight: '236.14 g/mol',
      targetReceptorAffinity:
        'A dinitrate ester of isosorbide, the bicyclic sugar alcohol derived from sorbitol. The label describes the principal action as relaxation of vascular smooth muscle with dilatation of peripheral arteries and especially veins, and states outright that the relative importance of preload reduction, afterload reduction and coronary dilatation remains undefined. Oral absorption is nearly complete but bioavailability is highly variable, from 10% to 90%, averaging about 25%, because of extensive hepatic first-pass metabolism; most studies observe progressive increases in bioavailability during chronic therapy. Serum levels peak about an hour after ingestion. Volume of distribution is 2 to 4 L/kg cleared at 2 to 4 L/min, giving a serum half-life of about an hour — and since that clearance exceeds hepatic blood flow, the label concludes considerable extrahepatic metabolism must also occur. The 2- and 5-mononitrate metabolites are themselves active, and isosorbide 5-mononitrate is separately marketed as a drug.',
      structureSource: {
        label:
          'PubChem CID 6883 (isosorbide dinitrate) — canonical SMILES, molecular formula and weight, as carried on the enriched record; pharmacology and pharmacokinetics from the isosorbide dinitrate tablets United States prescribing information, Clinical Pharmacology',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6883',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'isd-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Handle it as an energetic material and assay it against its own metabolites',
          description:
            'Isosorbide dinitrate is a nitrate ester and the undiluted solid is shock- and heat-sensitive, so pharmaceutical material is supplied pre-diluted onto an inert carrier and the diluted assay is the specification. Chromatographically, the compounds that must be resolved from the parent are its own active metabolites, the 2- and 5-mononitrates — and the 5-mononitrate is a marketed drug in its own right, so it is simultaneously an impurity here and an active ingredient elsewhere.',
          reagentsAndBuffer:
            'Isosorbide dinitrate diluted USP reference standard, gas chromatography with electron capture or HPLC with ultraviolet detection resolving the dinitrate from the 2- and 5-mononitrates and from isosorbide, lactose or mannitol as the dilution carrier, differential scanning calorimetry for thermal-hazard characterisation of any undiluted material',
        },
        {
          id: 'isd-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Nitrate both hydroxyls of isosorbide under strict thermal control',
          description:
            'Isosorbide is made by double dehydration of sorbitol and carries exactly two hydroxyls, one exo and one endo, so nitration gives the dinitrate with no possibility of a trinitrate. The reaction is the same mixed-acid nitration used for nitroglycerin and carries the same runaway risk, which is why it is run cold, dilute and with the product quenched immediately onto the diluent rather than isolated neat.',
          dependsOnStepId: 'isd-w1',
          reagentsAndBuffer:
            'Isosorbide from sorbitol double dehydration, mixed nitric and sulfuric acid at controlled low temperature, immediate quench into iced water, neutralisation and direct trituration onto lactose to give the diluted drug substance',
        },
        {
          id: 'isd-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Strip the mononitrates and fix the dilution ratio as a release specification',
          description:
            'Partial nitration leaves both mononitrates behind, and because both are pharmacologically active they cannot be dismissed as inert impurities — they change the duration profile of the product rather than merely diluting it. The dilution ratio onto the carrier is itself a release specification, since it is what makes the material safe to handle and what the assay is calibrated against.',
          dependsOnStepId: 'isd-w2',
          reagentsAndBuffer:
            'Recrystallisation from aqueous ethanol, column chromatography where required, controlled blending onto lactose to a specified percentage, HPLC release testing against USP limits for the mononitrates, uniformity testing on the diluted blend',
        },
        {
          id: 'isd-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Build tolerance deliberately, because tolerance is the drug’s defining behaviour',
          description:
            'An assay that measures relaxation of a fresh vessel ring on first exposure measures the one condition under which every nitrate works. The label’s central finding is about the second day, not the first: continuously delivered nitrates were no more effective than placebo after 24 hours or less, and dose escalation did not rescue them. The protocol that reproduces that runs paired preparations — continuous exposure against intermittent exposure with a drug-free interval — and reports the ratio, then confirms that escalating the concentration in the continuous arm does not restore the response.',
          dependsOnStepId: 'isd-w3',
          reagentsAndBuffer:
            'Rat or human artery and vein rings on isometric force transducers, phenylephrine precontraction, paired continuous and intermittent exposure protocols over 24 to 48 hours, dose-escalation arm in the tolerant preparations, endothelium-denuded controls, ODQ as soluble guanylate cyclase inhibitor',
        },
        {
          id: 'isd-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure cyclic GMP, not just the vessel’s diameter',
          description:
            'Relaxation is the outcome; cyclic GMP accumulation is the mechanism. Measuring both separates the two candidate explanations for tolerance — reduced bioactivation of the nitrate ester upstream, or desensitisation of soluble guanylate cyclase downstream — which a force trace alone cannot distinguish. It also gives the assay that predicts the phosphodiesterase-inhibitor contraindication, since sildenafil and its relatives raise the same second messenger by blocking its breakdown.',
          dependsOnStepId: 'isd-w4',
          reagentsAndBuffer:
            'Cultured human aortic smooth muscle cells, cyclic GMP enzyme immunoassay, sodium nitroprusside as a bioactivation-independent nitric oxide donor to localise the tolerance step, sildenafil as the phosphodiesterase-5 inhibitor probe, ODQ as the soluble guanylate cyclase inhibitor control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'isd-a1',
        category: 'failed',
        title: 'The label says continuous use makes it stop working',
        laymanSummary:
          'Take a nitrate around the clock and within a day it does no more than a placebo. The prescribing information states this directly, and adds that taking more does not help.',
        technicalDetails:
          'The Clinical Pharmacology section reads: "Dosing regimens for most chronically used drugs are designed to provide plasma concentrations that are continuously greater than a minimally effective concentration. This strategy is inappropriate for organic nitrates. Several well-controlled clinical trials have used exercise testing to assess the anti-anginal efficacy of continuously-delivered nitrates. In the large majority of these trials, active agents were no more effective than placebo after 24 hours (or less) of continuous therapy. Attempts to overcome nitrate tolerance by dose escalation, even to doses far in excess of those used acutely, have consistently failed. Only after nitrates have been absent from the body for several hours has their anti-anginal efficacy been restored." The dosage section follows through: every regimen must provide a daily dose-free interval, at least 14 hours long for immediate-release tablets, the effects of the second and later doses have been smaller and shorter-lasting than the first, and no regimen should be expected to provide more than about 12 hours of continuous anti-anginal efficacy per day. This is a drug whose licensed performance ceiling is half a day, stated by the regulator.',
        evidenceSource:
          'Isosorbide dinitrate tablets United States prescribing information, Clinical Pharmacology and Dosage and Administration',
        measuredMetric:
          'Anti-anginal efficacy on exercise testing after 24 hours or less of continuous nitrate delivery, across several well-controlled trials summarised in the label',
        auditFlag: 'caution',
      },
      {
        id: 'isd-a2',
        category: 'measured',
        title: 'A-HeFT: a 43% reduction in death, and the trial stopped early',
        laymanSummary:
          'A fixed-dose combination of this drug with hydralazine was tested in a thousand black patients with advanced heart failure. Deaths fell from 10.2% to 6.2% and the trial was halted early.',
        technicalDetails:
          'A-HeFT randomised 1,050 black patients with NYHA class III or IV heart failure and dilated ventricles to a fixed dose of isosorbide dinitrate plus hydralazine or placebo, on top of standard therapy including neurohormonal blockade. The primary endpoint was a weighted composite of death from any cause, first heart failure hospitalisation and change in quality of life. The study was terminated early because mortality was significantly higher on placebo: 10.2% against 6.2%, p=0.02, a 43% relative reduction in death from any cause (hazard ratio 0.57, p=0.01). First hospitalisation for heart failure fell 33% in relative terms, 16.4% against 22.4%, p=0.001, and quality of life improved (p=0.02). The composite score was −0.1 ± 1.9 against −0.5 ± 2.0, p=0.01. This is a real, substantial, placebo-controlled mortality result on top of modern background therapy, and it is the strongest evidence either molecule holds.',
        evidenceSource:
          'Taylor AL, Ziesche S, Yancy C, et al. N Engl J Med 2004;351:2049-2057 (A-HeFT)',
        doi: '10.1056/NEJMoa042934',
        measuredMetric:
          'All-cause mortality and a weighted composite in 1,050 black patients with advanced heart failure',
        auditFlag: 'verified',
      },
      {
        id: 'isd-a3',
        category: 'conclusion_shift',
        title: 'A race-specific indication built on retrospective subgroups',
        laymanSummary:
          'The combination is licensed specifically for self-identified black patients. That restriction came not from A-HeFT but from re-examining two older trials after the fact, and finding an effect in one racial subgroup and not the other.',
        technicalDetails:
          'The BiDil label narrates its own origin with unusual clarity. Of V-HeFT I it states there was no overall significant difference in mortality between the treatment groups, but a trend favouring hydralazine and isosorbide dinitrate which "on retrospective analysis, was attributable to an effect in blacks (n=128)", with survival in white patients (n=324) similar on placebo and combination. Of V-HeFT II it states the combination was inferior to enalapril overall, but that retrospective analysis showed the difference was observed in the white population (n=574) with essentially no difference in the black population (n=215). The label then states: "Based on these retrospective analyses suggesting an effect on survival in black patients, but showing little evidence of an effect in the white population, a third study was conducted among black patients." That third study was A-HeFT, which enrolled only black patients and therefore could not test whether the effect is race-specific — it could only confirm that the drug works in the group it enrolled. The indication reads: for the treatment of heart failure as an adjunct to standard therapy in self-identified black patients. Two things are true at once. The trial result is solid. The racial restriction rests on post-hoc subgroups from trials in 128 and 215 black participants, and no trial has ever compared the combination against placebo in a non-black population on modern background therapy.',
        evidenceSource:
          'BiDil (isosorbide dinitrate and hydralazine hydrochloride) United States prescribing information, sections 1.1 and 14 (NDA 020727); Taylor AL et al. N Engl J Med 2004;351:2049-2057',
        doi: '10.1056/NEJMoa042934',
        inferredClaim:
          'That the benefit of isosorbide dinitrate with hydralazine is confined to self-identified black patients — an inference from retrospective subgroups of 128 and 215 people, never tested by a randomised comparison across groups',
        auditFlag: 'contested',
      },
      {
        id: 'isd-a4',
        category: 'inferred',
        title: 'The generic label says the heart failure benefit has not been established',
        laymanSummary:
          'The same molecule, sold on its own, carries a warning that its benefit in heart failure and after a heart attack has not been established. Sold in a fixed combination it carries a survival claim.',
        technicalDetails:
          'The generic isosorbide dinitrate tablet label states: "The benefits of immediate-release oral isosorbide dinitrate in patients with acute myocardial infarction or congestive heart failure have not been established. If one elects to use isosorbide dinitrate in these conditions, careful clinical or hemodynamic monitoring must be used to avoid the hazards of hypotension and tachycardia. Because the effects of oral isosorbide dinitrate are so difficult to terminate rapidly, this formulation is not recommended in these settings." The BiDil label, for the same nitrate at a fixed dose with hydralazine, is indicated to improve survival in heart failure. Both statements are correct, and the distinction between them is not pharmacological but evidentiary: the combination was tested and the single agent at these doses and schedules was not. A reader should draw the specific conclusion rather than the general one — this nitrate is not interchangeable with the combination product, and prescribing the two generics separately reproduces the tested doses only if the doses and schedule match, which is a question for a prescriber rather than an assumption.',
        evidenceSource:
          'Isosorbide dinitrate tablets United States prescribing information, Warnings; BiDil United States prescribing information, section 1.1 (NDA 020727)',
        inferredClaim:
          'That the survival benefit demonstrated for the fixed combination transfers automatically to isosorbide dinitrate used alone, when the single-agent label states the heart failure benefit has not been established',
        auditFlag: 'caution',
      },
      {
        id: 'isd-a5',
        category: 'measured',
        title: 'Bioavailability varies ninefold between people',
        laymanSummary:
          'How much of a swallowed tablet reaches the bloodstream ranges from a tenth to nearly all of it depending on the person, and it drifts upward the longer someone takes it.',
        technicalDetails:
          'The label states that oral absorption is nearly complete but bioavailability is highly variable, from 10% to 90%, with extensive hepatic first-pass metabolism, and that average bioavailability is about 25%. It adds that most studies have observed progressive increases in bioavailability during chronic therapy — so the same tablet delivers more drug after weeks than on the first day, in a drug that also becomes less effective with continuous exposure. Serum half-life is about an hour, and because clearance of 2 to 4 L/min exceeds hepatic blood flow, the label concludes considerable extrahepatic metabolism must also occur. This is the pharmacological reason isosorbide 5-mononitrate exists as a separate product: it is the active metabolite, and giving it directly removes the first-pass step that makes the parent so unpredictable.',
        evidenceSource:
          'Isosorbide dinitrate tablets United States prescribing information, Clinical Pharmacology, Pharmacokinetics',
        measuredMetric:
          'Oral bioavailability range and mean, serum half-life and total clearance, from the label',
        auditFlag: 'verified',
      },
      {
        id: 'isd-a6',
        category: 'failed',
        title: 'The label declines to say which of its three actions does the work',
        laymanSummary:
          'Nitrates dilate veins, dilate arteries and dilate the coronary vessels. After sixty years on the market the prescribing information still says the relative importance of the three is undefined.',
        technicalDetails:
          'The Clinical Pharmacology section describes three separate effects: dilatation of veins promoting peripheral pooling and reducing preload; arteriolar relaxation reducing systemic vascular resistance and afterload; and dilatation of the coronary arteries. It then states that the relative importance of preload reduction, afterload reduction and coronary dilatation remains undefined. That matters more than it looks. A mechanism that is not resolved cannot be optimised, and it is why the tolerance problem has never been engineered around — nobody can say with confidence which of the three effects is being lost. The label also does not name nitric oxide, soluble guanylate cyclase or any molecular target anywhere in this section; the nitric-oxide account of nitrate action is well established in the laboratory literature and is not what the regulatory document asserts.',
        evidenceSource:
          'Isosorbide dinitrate tablets United States prescribing information, Clinical Pharmacology',
        inferredClaim:
          'That the anti-anginal effect of nitrates is understood well enough to attribute to one mechanism, when the label states the relative importance of the three candidate mechanisms remains undefined',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A sugar alcohol with two nitrate groups on it',
        laymanDesc:
          'Isosorbide is a small ring molecule derived from sorbitol. Attaching two nitrate groups turns it into a drug that releases nitric oxide inside the body.',
        molecularDetail:
          'A dinitrate ester of isosorbide, the bicyclic dianhydro-sorbitol. Both available hydroxyls are nitrated, so no trinitrate is possible. The 2- and 5-mononitrate metabolites are themselves active, and isosorbide 5-mononitrate is separately marketed.',
        iconName: 'Layers',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver destroys most of it, unpredictably',
        laymanDesc:
          'Absorption from the gut is nearly complete, but the liver removes most of the dose before it reaches the circulation — and how much varies enormously between people.',
        molecularDetail:
          'Bioavailability ranges from 10% to 90% with a mean of about 25% because of extensive hepatic first-pass metabolism; most studies show progressive increases during chronic therapy. Serum levels peak about an hour after ingestion, half-life is about an hour, and clearance of 2 to 4 L/min exceeds hepatic blood flow, implying substantial extrahepatic metabolism.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It relaxes vascular smooth muscle, veins most of all',
        laymanDesc:
          'What survives reaches blood vessel walls and relaxes them. The veins relax more than the arteries.',
        molecularDetail:
          'The label describes the principal pharmacological action as relaxation of vascular smooth muscle with consequent dilatation of peripheral arteries and veins, especially the latter, along with dilatation of the coronary arteries.',
        iconName: 'Waves',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Less blood returns, so the heart does less work',
        laymanDesc:
          'With blood pooling in the veins, less returns to the heart with each beat, filling pressures fall and the muscle needs less oxygen. That is what stops the pain.',
        molecularDetail:
          'Venodilatation promotes peripheral pooling and decreases venous return, reducing left ventricular end-diastolic pressure and pulmonary capillary wedge pressure — preload. Arteriolar relaxation reduces systemic vascular resistance and mean arterial pressure — afterload. The label states the relative importance of preload reduction, afterload reduction and coronary dilatation remains undefined.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And within a day, the vessels stop listening',
        laymanDesc:
          'Keep the drug in the blood continuously and the effect disappears. More drug does not restore it. Only time without any does.',
        molecularDetail:
          'The label states that in the large majority of well-controlled exercise trials, continuously delivered nitrates were no more effective than placebo after 24 hours or less; that dose escalation far beyond acute doses has consistently failed; and that efficacy is restored only after nitrates have been absent for several hours. A dose-free interval of at least 14 hours is required for immediate-release tablets.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Combined with hydralazine, fewer deaths',
        laymanDesc:
          'Paired with hydralazine in one tablet and given to black patients with advanced heart failure, it cut deaths from about ten per cent to about six.',
        molecularDetail:
          'A-HeFT: all-cause mortality 6.2% against 10.2%, p=0.02, hazard ratio 0.57 (p=0.01); first heart failure hospitalisation 16.4% against 22.4%, p=0.001, in 1,050 patients on standard therapy including neurohormonal blockers. The trial was terminated early for the mortality difference.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'A-HeFT — African-American Heart Failure Trial (N Engl J Med 2004;351:2049-2057)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 1050,
        primaryEndpoint:
          'Weighted composite score of death from any cause, first hospitalisation for heart failure and change in quality of life, in black patients with NYHA class III or IV heart failure and dilated ventricles',
        endpointMet: true,
        statisticalPValue:
          'Composite −0.1 ± 1.9 against −0.5 ± 2.0, p=0.01; all-cause mortality 6.2% against 10.2%, p=0.02 (hazard ratio 0.57, p=0.01); first heart failure hospitalisation 16.4% against 22.4%, p=0.001',
        unreportedAdverseSignals:
          'The trial was terminated early for the mortality difference, which tends to overstate effect size. It enrolled only black patients, so it cannot establish that the benefit is confined to that group — it can only show the drug worked in the group studied. The label notes there is little experience in NYHA class IV.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'V-HeFT I — Veterans Administration Cooperative Study (N Engl J Med 1986;314:1547-1552)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled three-arm trial',
        sampleSize: 642,
        primaryEndpoint:
          'Mortality in men with impaired cardiac function and reduced exercise tolerance on digoxin and a diuretic, randomised to placebo, prazosin, or hydralazine 300 mg plus isosorbide dinitrate 160 mg daily',
        endpointMet: true,
        statisticalPValue:
          'Mortality at two years, a protocol-specified endpoint, 25.6% against 34.3% — a 34% risk reduction, p<0.028; at three years 36.2% against 46.9%. Mortality over the entire follow-up was lower on the combination but of borderline statistical significance',
        unreportedAdverseSignals:
          'The BiDil label describes this trial as showing no overall significant difference in mortality between the two groups, with the favourable trend attributable on retrospective analysis to an effect in 128 black participants and no difference among 324 white participants. Both descriptions are accurate about different analyses of the same trial, and the difference between them is the whole origin of the race-specific indication. Prazosin performed like placebo.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'V-HeFT II (N Engl J Med 1991;325:303-310)',
        phase: 'Phase 3, randomised, double-blind, active-controlled',
        sampleSize: 804,
        primaryEndpoint:
          'Mortality with enalapril 20 mg daily against hydralazine 300 mg plus isosorbide dinitrate 160 mg daily, in men on digoxin and diuretics',
        endpointMet: false,
        statisticalPValue:
          'Two-year mortality 18% on enalapril against 25% on hydralazine-isosorbide dinitrate, p=0.016, a 28% reduction favouring enalapril; overall mortality tended lower on enalapril at p=0.08',
        unreportedAdverseSignals:
          'The nitrate-hydralazine arm was not without merit: peak exercise oxygen consumption increased only in that arm (p<0.05) and ejection fraction rose more in the first 13 weeks. The enalapril advantage came from fewer sudden deaths and was more prominent in less symptomatic patients. The BiDil label reports that retrospective analysis located the enalapril advantage in the 574 white participants, with essentially no difference among the 215 black participants — again a post-hoc subgroup, and again the basis for the eventual indication.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'All-cause mortality 6.2% against 10.2% and heart failure hospitalisation 16.4% against 22.4% in 1,050 black patients with advanced heart failure (A-HeFT)',
        'Two-year mortality 25.6% against 34.3% with hydralazine plus isosorbide dinitrate against placebo in 642 men (V-HeFT I, p<0.028)',
        'Two-year mortality 25% on hydralazine plus isosorbide dinitrate against 18% on enalapril in 804 men (V-HeFT II, p=0.016) — the combination lost',
        'Continuously delivered nitrates were no more effective than placebo after 24 hours or less in the large majority of controlled exercise trials summarised in the label',
        'Oral bioavailability ranging from 10% to 90% with a mean of about 25%, and a serum half-life of about one hour',
      ],
      unsupportedInferences: [
        'That the benefit of the combination is specific to self-identified black patients — an inference from retrospective subgroups of 128 and 215 people, never tested head to head',
        'That single-agent isosorbide dinitrate carries the heart failure survival benefit, when its own label says that benefit has not been established',
        'That the anti-anginal mechanism is understood, when the label states the relative importance of preload, afterload and coronary dilatation remains undefined',
        'That a higher nitrate dose overcomes loss of effect — the label says dose escalation has consistently failed',
      ],
      whatFailedInitially: [
        'Continuous nitrate dosing, which the label reports as no better than placebo within 24 hours',
        'Dose escalation as a remedy for tolerance, which the label describes as having consistently failed',
        'Hydralazine plus isosorbide dinitrate against enalapril in V-HeFT II, where the combination was inferior on two-year mortality',
        'Overall mortality in V-HeFT I, which the BiDil label describes as showing no significant difference between groups',
      ],
      realWorldOutcome: [
        'On the United States market since 1959, generic for decades, at about twenty United States cents a tablet',
        'Its licensed single-agent indication remains angina prevention only, explicitly not the aborting of an attack',
        'The fixed combination with hydralazine, BiDil, carries the first and still most contested race-specific indication in the modern United States drug label',
        'Its own label documents a performance ceiling of about twelve hours a day, which no formulation change has moved',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, sublingual tablet and extended-release capsule; also available as a fixed-dose oral combination with hydralazine',
      description:
        'Oral absorption is nearly complete but heavily first-pass extracted, so bioavailability ranges from 10% to 90% with a mean of about 25% and rises progressively during chronic therapy. Serum concentrations peak about an hour after ingestion and the serum half-life is about an hour, with clearance exceeding hepatic blood flow, implying considerable extrahepatic metabolism. Every regimen must include a daily dose-free interval — at least 14 hours for immediate-release tablets — because continuous plasma levels produce refractory tolerance. The label states that no dosing regimen should be expected to provide more than about 12 hours of continuous anti-anginal efficacy per day.',
      safetyProfile:
        'Contraindicated in allergy to isosorbide dinitrate, with phosphodiesterase-5 inhibitors including sildenafil, tadalafil and vardenafil — concomitant use can cause severe hypotension, syncope or myocardial ischaemia — and with the soluble guanylate cyclase stimulator riociguat. The label notes that the time course and dose dependence of the sildenafil interaction have not been studied, and suggests treating amplified hypotension as a nitrate overdose with elevation of the extremities and central volume expansion. Benefits in acute myocardial infarction or congestive heart failure have not been established for the immediate-release oral form, which is not recommended in those settings because its effects are difficult to terminate rapidly; if used, careful clinical or haemodynamic monitoring is required to avoid hypotension and tachycardia.',
    },
    commonQuestions: [
      {
        q: 'Why am I told to leave a long gap every day instead of taking it evenly?',
        a: 'Because the gap is what keeps the drug working, and this is stated on the label rather than being a matter of opinion. Continuous nitrate levels produce refractory tolerance: in the large majority of controlled exercise trials, continuously delivered nitrates were no more effective than placebo after 24 hours or less. Efficacy comes back only after the nitrate has been absent from the body for several hours, and the label specifies a dose-free interval of at least 14 hours for immediate-release tablets. It also warns that the second and later doses of the day have smaller and shorter-lasting effects than the first. Filling in the gap to get night-time cover is the one change that reliably destroys the benefit.',
        auditNote:
          'It is unusual for a label to describe a drug’s performance ceiling this explicitly — about twelve hours of anti-anginal efficacy per day, no matter the regimen.',
      },
      {
        q: 'Can I just take a higher dose so it lasts longer?',
        a: 'No, and the label closes this off in one sentence: "Attempts to overcome nitrate tolerance by dose escalation, even to doses far in excess of those used acutely, have consistently failed." Tolerance is not a matter of the concentration being too low. Something in the pathway that turns the nitrate into a vasodilator signal stops responding, and adding more substrate does not restart it. The only intervention that works is absence.',
      },
      {
        q: 'Why is the erectile dysfunction warning so absolute?',
        a: 'Because the two drugs act on the same signal at different points and their effects multiply. A nitrate raises cyclic GMP in blood vessel walls, and sildenafil, tadalafil and vardenafil block the enzyme that breaks cyclic GMP down. Together they can produce severe hypotension, syncope or myocardial ischaemia, and the label makes the combination an outright contraindication rather than a caution. It also states that the time course and dose dependence of the interaction have not been studied, which is why no one can give you a safe number of hours to leave between them. The same logic applies to riociguat, which stimulates the enzyme that makes cyclic GMP.',
      },
      {
        q: 'What is BiDil, and why is it only licensed for black patients?',
        a: 'BiDil is a fixed-dose tablet containing this nitrate plus hydralazine, and its indication reads: for the treatment of heart failure as an adjunct to standard therapy in self-identified black patients. The evidence has two halves. A-HeFT randomised 1,050 black patients with advanced heart failure and found all-cause mortality of 6.2% against 10.2% on placebo, p=0.02, with the trial stopped early — a strong result. But A-HeFT enrolled only black patients, so it cannot show the effect is confined to them. The racial restriction comes from retrospective re-analyses of two much older trials, V-HeFT I and V-HeFT II, in which the apparent benefit sat in subgroups of 128 and 215 black participants. The BiDil label says so in as many words. So the drug’s effect in that population is well measured, and the claim that it is specific to that population is a post-hoc inference that no trial has tested directly.',
      },
      {
        q: 'If it does not shrink the blockage, what is it actually doing?',
        a: 'Reducing demand rather than increasing supply, mostly. Nitrates relax blood vessels, and they relax veins more than arteries, so blood pools in the venous system and less returns to the heart with each beat. Filling pressures fall, the heart wall works against less tension, and the muscle needs less oxygen — which is enough to prevent pain in an artery that cannot deliver more. The label lists three candidate mechanisms — preload reduction, afterload reduction and coronary dilatation — and then says outright that their relative importance remains undefined. After more than sixty years on the market, that sentence is still there.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Taylor AL, Ziesche S, Yancy C, et al. Combination of isosorbide dinitrate and hydralazine in blacks with heart failure (A-HeFT). N Engl J Med 2004;351:2049-2057',
        identifier: '10.1056/NEJMoa042934',
        kind: 'doi',
      },
      {
        label:
          'Cohn JN, Archibald DG, Ziesche S, et al. Effect of vasodilator therapy on mortality in chronic congestive heart failure: results of a Veterans Administration Cooperative Study (V-HeFT I). N Engl J Med 1986;314:1547-1552',
        identifier: '10.1056/NEJM198606123142404',
        kind: 'doi',
      },
      {
        label:
          'Cohn JN, Johnson G, Ziesche S, et al. A comparison of enalapril with hydralazine-isosorbide dinitrate in the treatment of chronic congestive heart failure (V-HeFT II). N Engl J Med 1991;325:303-310',
        identifier: '10.1056/NEJM199108013250502',
        kind: 'doi',
      },
      {
        label:
          'Isosorbide dinitrate tablets United States prescribing information — Indications and Usage, Contraindications, Warnings, Clinical Pharmacology and Dosage and Administration',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=isosorbide+dinitrate',
        kind: 'regulatory',
      },
      {
        label:
          'BiDil (isosorbide dinitrate and hydralazine hydrochloride) United States prescribing information — Indications 1.1 and 1.2, Clinical Studies 14 (NDA 020727)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020727',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — isosorbide dinitrate, 59 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 6883 — isosorbide dinitrate structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6883',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Nitroglycerin — an explosive turned medicine in 1879, whose two largest outcome trials,
  //    together enrolling 77,444 patients after myocardial infarction, both found nothing.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'nitroglycerin',
    name: 'Nitroglycerin',
    tradeName:
      'Nitrostat / Nitro-Dur / Minitran / Transderm-Nitro / Nitrolingual / Nitroglycerin in 5% Dextrose Injection',
    sponsor:
      'Many. Pfizer holds NDA 021134 for NITROSTAT sublingual tablets; Hospira markets nitroglycerin in 5% dextrose injection; the transdermal systems and ointments are held by several manufacturers',
    targetGene: 'ALDH2',
    targetProtein:
      'Mitochondrial aldehyde dehydrogenase, which reduces the nitrate ester to release nitric oxide; the nitric oxide then activates soluble guanylate cyclase in vascular smooth muscle',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1981,
    indication:
      'Sublingual tablets and spray: acute relief of an attack, or acute prophylaxis, of angina pectoris due to coronary artery disease. Transdermal and ointment forms: prevention of angina. Intravenous in 5% dextrose: treatment of peri-operative hypertension, control of heart failure in the setting of acute myocardial infarction, treatment of angina not responding to sublingual nitroglycerin and beta-blockers, and induction of intra-operative hypotension',
    patientFriendlyIndication:
      'Stopping an angina attack that has started, and preventing one that is expected',
    anatomicalSite:
      'Vascular smooth muscle, with the bioactivation step inside the mitochondrion — the enzyme that turns the drug into a signal is not on the cell surface but in the cell’s power plant',
    conditionContext: {
      conditionExplainer:
        'Angina is the pain of a heart muscle asking for more blood than a narrowed artery can supply. Nitroglycerin does not clear the narrowing; it reduces how much work the heart has to do, mainly by pooling blood in the veins so less returns to it.',
      whyItMatters:
        'Nitroglycerin is the oldest cardiovascular drug still in daily use and the most reliably dramatic: a tablet under the tongue relieves an angina attack within minutes. It has also been tested for outcome twice, in 58,050 and 19,394 patients after myocardial infarction, and neither trial found any effect on survival. Both facts belong on the same page. It is very good at what it is licensed to do and it has never been shown to make anyone live longer.',
      whoTakesThis:
        'Adults with angina, for relief of an attack or before an activity known to provoke one. Not people taking phosphodiesterase-5 inhibitors, not people in shock, not people with severe anaemia or raised intracranial pressure.',
      clinicalGoals:
        'The attack stops, or does not start. Nothing beyond that has been demonstrated.',
    },
    oneSentenceVerdict:
      'The nitrate that reliably relieves an angina attack within minutes by releasing nitric oxide after mitochondrial aldehyde dehydrogenase reduces it — and which, given systematically after myocardial infarction, produced no survival benefit in either of its two mega-trials: ISIS-4 found 5-week mortality of 7.34% against 7.54% in 58,050 patients, and GISSI-3 found an odds ratio of 0.94 (95% CI 0.84 to 1.05) for transdermal glyceryl trinitrate in 19,394.',
    laymanHowItWorks:
      'Nitroglycerin is a nitrate ester — chemically the same substance as the explosive, at a dose measured in fractions of a milligram. Inside the body an enzyme in the mitochondria of blood vessel cells strips a nitrate group off it and releases nitric oxide, the molecule the body itself uses to tell vessels to relax. Nitric oxide switches on an enzyme that makes cyclic GMP, and cyclic GMP relaxes the muscle in the vessel wall. Veins relax more than arteries, so blood pools away from the heart, filling pressure falls, and the heart needs less oxygen than it did a minute ago. The pain stops because demand came down, not because supply went up.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1279 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 72 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Nitroglycerin has been used medically since 1879 and no composition patent has existed for well over a century. What is patentable is delivery: the stabilised sublingual tablet, the transdermal reservoir and matrix systems, the metered lingual spray and the premixed intravenous bag are each separate products with separate approvals, and the median price above spans all of them.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For stopping an attack that has already started there is no real alternative in general practice — that is nitroglycerin’s uncontested territory. For preventing attacks the picture reverses: beta-blockers and calcium channel blockers work continuously without tolerance, and beta-blockers have post-infarction mortality evidence that nitrates lack entirely.',
      conventionalRx: [
        {
          name: 'Beta-blockers — metoprolol, bisoprolol, atenolol',
          class: 'Beta-adrenergic antagonists',
          howItCompares:
            'For prevention rather than rescue. They cut angina by lowering heart rate and contractility, do not develop tolerance, and several members of the class have mortality evidence after myocardial infarction, which no nitrate has. They cannot stop an attack in progress.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: continuous protection; outcome evidence. Cons: fatigue and bradycardia; no rescue role.',
        },
        {
          name: 'Amlodipine, diltiazem or verapamil',
          class: 'Calcium channel blockers',
          howItCompares:
            'Also preventive rather than rescue. They relax arteries and, for diltiazem and verapamil, slow the heart, and they cover the full 24 hours because they do not require a drug-free interval.',
          typicalCost:
            'US$0.3196 per unit for diltiazem at United States pharmacy acquisition cost (CMS NADAC, median across 177 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no tolerance; useful in vasospastic angina where beta-blockers can worsen things. Cons: ankle swelling with amlodipine; diltiazem and verapamil are unsuitable in systolic heart failure.',
        },
        {
          name: 'Isosorbide dinitrate or mononitrate',
          class: 'Longer-acting organic nitrates',
          howItCompares:
            'The same class in a slower form, for prevention rather than rescue. They carry the identical tolerance problem, and the sublingual nitroglycerin label warns specifically that a decrease in its therapeutic effect may result from use of long-acting nitrates — so a preventive nitrate can blunt the rescue one.',
          typicalCost:
            'US$0.0977 per tablet for isosorbide mononitrate at United States pharmacy acquisition cost (CMS NADAC, median across 35 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: prevention with a familiar mechanism. Cons: tolerance; the same absolute contraindication with phosphodiesterase-5 inhibitors; can reduce the effect of the rescue tablet.',
        },
      ],
      naturalFoods: [
        {
          name: 'Dietary nitrate — beetroot, rocket, spinach and other leafy greens',
          activeCompound:
            'Inorganic nitrate, reduced to nitrite by oral bacteria and then to nitric oxide in tissue',
          biologicalMechanism:
            'Reaches the same endpoint — nitric oxide acting on soluble guanylate cyclase — without needing mitochondrial aldehyde dehydrogenase, the enzyme whose inhibition explains nitrate tolerance. That is mechanistically interesting and it is not a treatment for angina.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice, and specifically not as a substitute for a rescue medicine. For scale only: randomised trials of dietary nitrate run for weeks and measure blood pressure, exercise capacity or endothelial function. None has measured angina episodes against a nitrate drug, and nothing in this literature supports leaving a prescribed rescue tablet at home.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Sit down before you take it',
          action:
            'Take the tablet or spray sitting, not standing, and stay seated for a few minutes.',
          patientImpact:
            'The label directs administering it at rest, preferably in the sitting position. Severe hypotension, particularly with upright posture, can occur even at small doses, and may be accompanied by paradoxical bradycardia and increased angina. Nausea, vomiting, weakness, pallor, sweating and collapse can happen at therapeutic doses.',
          clinicalPrecaution:
            'Risk is higher in constrictive pericarditis, aortic or mitral stenosis, volume depletion and existing hypotension. The label directs seeking prompt medical attention if pain persists after three tablets in fifteen minutes, or if the pain is different from usual.',
        },
        {
          name: 'The container is part of the medicine',
          action:
            'Keep the tablets in their original glass bottle with the cap tightly closed, and do not decant them into a pill organiser.',
          patientImpact:
            'Nitroglycerin is volatile and migrates into plastics and cotton wadding. Tablets moved into a weekly organiser or a plastic vial lose potency, and a rescue medicine that has quietly lost potency fails at the worst possible moment.',
          clinicalPrecaution:
            'This is a property of the molecule rather than a manufacturing quirk, and it is why the stabilised sublingual tablet was a genuine pharmaceutical advance rather than a repackaging exercise.',
        },
        {
          name: 'Headache is the drug working, and it usually fades',
          action:
            'Expect headache at the start of treatment, and report it if it is severe or persistent.',
          patientImpact:
            'The label states that nitroglycerin produces dose-related headaches, especially at the start of therapy, which may be severe and persist but usually subside with continued use. The same vasodilatation that relieves the angina dilates cerebral vessels.',
          clinicalPrecaution:
            'It is contraindicated where intracranial pressure may already be raised — cerebral haemorrhage or traumatic brain injury — because it may precipitate or aggravate that rise.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C(C(CO[N+](=O)[O-])O[N+](=O)[O-])O[N+](=O)[O-]',
      chemicalFormula: 'C3H5N3O9',
      molecularWeight: '227.09 g/mol',
      targetReceptorAffinity:
        'Glycerol with all three hydroxyls nitrated — chemically identical to the explosive, dispensed at a fraction of a milligram and always diluted onto an inert carrier. The label states that nitroglycerin forms free radical nitric oxide, which activates guanylate cyclase, raising cyclic GMP in smooth muscle, leading to dephosphorylation of myosin light chains and vasodilatation. Venous effects predominate but dilation of both arterial and venous beds is dose-related. The label also states that nitroglycerin dilates large epicardial coronary arteries but that the extent to which this contributes to the relief of exertional angina is unclear. Heart rate is usually slightly increased as a compensatory response, and myocardial oxygen demand falls on every standard index.',
      structureSource: {
        label:
          'PubChem CID 4510 (nitroglycerin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; mechanism and pharmacodynamics from the NITROSTAT label, sections 12.1 and 12.2 (NDA 021134)',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4510',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ntg-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Treat it as an explosive and as a volatile, both at once',
          description:
            'Two properties dominate the quality problem and neither is about chemistry in the usual sense. Undiluted nitroglycerin is a primary high explosive, so pharmaceutical material never exists neat — it is manufactured straight onto lactose or into propylene glycol and assayed as the dilution. And the molecule is volatile enough to migrate out of a tablet into plastics and packaging over months, so container-closure and potency-on-storage are the same test. A sublingual tablet that has lost a third of its content looks identical.',
          reagentsAndBuffer:
            'Diluted nitroglycerin USP reference standard, HPLC with ultraviolet detection resolving glyceryl trinitrate from the 1,2- and 1,3-dinitrates and mononitrates, lactose or propylene glycol as the dilution matrix, container-closure migration testing against glass, polyethylene and cotton wadding, accelerated stability at controlled temperature and humidity',
        },
        {
          id: 'ntg-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Nitrate glycerol continuously, never in a batch',
          description:
            'The reaction is Sobrero’s and Nobel’s: glycerol into mixed nitric and sulfuric acid. It is strongly exothermic and autocatalytic if the temperature runs away, which is why pharmaceutical and industrial manufacture alike moved to continuous injector processes holding only grams of product at any instant. The chemistry is trivial and the engineering is the entire problem.',
          dependsOnStepId: 'ntg-w1',
          reagentsAndBuffer:
            'Anhydrous glycerol, mixed nitric and sulfuric acid at strictly controlled low temperature, continuous nitrator with immediate separation and quench, sodium carbonate washes, direct transfer into the dilution carrier without isolation of neat product',
        },
        {
          id: 'ntg-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Wash out every trace of acid, then dilute before doing anything else',
          description:
            'Residual acid catalyses autocatalytic decomposition, so the alkaline wash is a stability step and a safety step at the same time. The partially nitrated glyceryl dinitrates and mononitrates must be resolved from the parent because the 1,2-dinitrate is the drug’s own bioactivation product and a marker of degradation as well.',
          dependsOnStepId: 'ntg-w2',
          reagentsAndBuffer:
            'Repeated sodium carbonate and water washes to neutral, immediate trituration onto lactose or dissolution in propylene glycol to a specified percentage, HPLC release testing against limits for the dinitrates and mononitrates, acidity testing on the finished dilution',
        },
        {
          id: 'ntg-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure bioactivation at the mitochondrial enzyme, not at the vessel',
          description:
            'The step that turns this molecule into a drug is a reduction carried out by mitochondrial aldehyde dehydrogenase, producing 1,2-glyceryl dinitrate and nitrite. That is where both the interindividual variation and the tolerance live: the enzyme is inhibited in vessels made tolerant by nitroglycerin, and it is functionally reduced in people carrying the glu504lys variant. An assay that reports vessel relaxation without measuring the enzyme step cannot distinguish a tolerant preparation from a genetically low-activity one, and the two need different answers.',
          dependsOnStepId: 'ntg-w3',
          reagentsAndBuffer:
            'Purified mitochondrial aldehyde dehydrogenase and isolated vascular mitochondria, quantification of 1,2-glyceryl dinitrate and nitrite by chemiluminescence and LC-MS/MS, disulfiram as the enzyme inhibitor control, ALDH2 glu504lys and wild-type cell lines, sodium nitroprusside as the bioactivation-independent nitric oxide donor',
        },
        {
          id: 'ntg-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Read cyclic GMP and run a tolerance protocol on the same preparation',
          description:
            'Cyclic GMP accumulation is the signal the vessel actually responds to, and reading it alongside force lets the tolerance question be localised: if nitroprusside still raises cyclic GMP in a preparation where nitroglycerin no longer does, the failure is upstream at bioactivation rather than downstream at the cyclase. That distinction is the difference between the 2002 mechanism and a century of description.',
          dependsOnStepId: 'ntg-w4',
          reagentsAndBuffer:
            'Rat aortic and human artery rings on isometric force transducers with paired continuous and intermittent exposure, cyclic GMP enzyme immunoassay, ODQ as soluble guanylate cyclase inhibitor, sodium nitroprusside as the downstream positive control, phenylephrine precontraction',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ntg-a1',
        category: 'failed',
        title: 'ISIS-4: no survival benefit in 58,050 patients',
        laymanSummary:
          'The largest trial ever run on a nitrate gave an oral nitrate to nearly thirty thousand people after a suspected heart attack and compared them with nearly thirty thousand on placebo. Five-week deaths were 7.34% against 7.54%. No subgroup did better.',
        technicalDetails:
          'ISIS-4 randomised 58,050 patients entering 1,086 hospitals up to 24 hours after the onset of suspected acute myocardial infarction, in a 2×2×2 factorial design testing captopril, oral controlled-release mononitrate and intravenous magnesium. For the nitrate comparison there was no significant reduction in five-week mortality either overall — 2,129 deaths (7.34%) against 2,190 (7.54%) — or in any subgroup examined, including patients already receiving short-term non-study nitrates at entry. Further follow-up showed no later survival advantage. The only significant side effect was an increase of 15 per 1,000 in hypotension. Two things are worth taking from this. First, the trial was large enough to exclude anything but a very small benefit, which is what makes a null result here informative rather than merely inconclusive. Second, in the same trial captopril produced a significant 7% proportional mortality reduction (7.19% against 7.69%, 2p=0.02), so the design was demonstrably capable of detecting an effect of that size.',
        evidenceSource: 'ISIS-4 Collaborative Group. Lancet 1995;345:669-685',
        measuredMetric:
          'Five-week all-cause mortality with oral controlled-release mononitrate against placebo in 58,050 patients with suspected acute myocardial infarction',
        auditFlag: 'caution',
      },
      {
        id: 'ntg-a2',
        category: 'failed',
        title: 'GISSI-3: transdermal nitroglycerin had no independent effect either',
        laymanSummary:
          'Nearly twenty thousand patients after a heart attack were given nitroglycerin patches or not. The patches made no difference to death or to heart function. The ACE inhibitor tested in the same trial did.',
        technicalDetails:
          'GISSI-3 randomised 19,394 patients from 200 Italian coronary care units within 24 hours of infarct symptoms, in a factorial design testing lisinopril and nitrates — intravenous for the first 24 hours followed by transdermal glyceryl trinitrate 10 mg daily — against open control. Overall six-week mortality was 6.7%. Lisinopril produced significant reductions in overall mortality (odds ratio 0.88, 95% CI 0.79 to 0.99) and in the combined outcome of mortality and severe ventricular dysfunction (0.90, 95% CI 0.84 to 0.98). Systematic transdermal glyceryl trinitrate showed no independent effect on either: 0.94 (95% CI 0.84 to 1.05) and 0.94 (95% CI 0.87 to 1.02). The combination of lisinopril and nitrate did reduce both, but so did lisinopril alone. The background care was intensive — thrombolysis in 72%, beta-blockade in 31%, aspirin in 84% — and non-protocol nitrate use was permitted for clinical indications, which would dilute a real effect. Taken with ISIS-4, 77,444 randomised patients have now been asked whether routine nitrate therapy after infarction saves lives, and the answer both times was no.',
        evidenceSource: 'GISSI-3 Investigators. Lancet 1994;343:1115-1122',
        measuredMetric:
          'Six-week mortality and combined mortality plus severe ventricular dysfunction with transdermal glyceryl trinitrate in 19,394 patients after acute myocardial infarction',
        auditFlag: 'caution',
      },
      {
        id: 'ntg-a3',
        category: 'conclusion_shift',
        title: 'After 123 years of use, the activating enzyme was finally identified',
        laymanSummary:
          'Nitroglycerin was used as a medicine from 1879. The enzyme that converts it into the active signal, and whose failure explains why it stops working, was identified in 2002.',
        technicalDetails:
          'Chen, Zhang and Stamler purified a nitrate reductase that specifically catalyses formation of 1,2-glyceryl dinitrate and nitrite from glyceryl trinitrate, leading to cyclic GMP production and vascular smooth muscle relaxation both in vitro and in vivo, and identified it as mitochondrial aldehyde dehydrogenase. Crucially, they showed the enzyme is inhibited in blood vessels made tolerant by nitroglycerin — which supplies a mechanism for tolerance rather than a description of it, and locates the failure upstream at bioactivation rather than downstream at the cyclase. Their own paper opens by noting the drug had been used to treat angina and heart failure for over 130 years while the molecular mechanism of biotransformation remained a mystery. This is what a genuinely delayed mechanism looks like: not a controversy, simply a question nobody could answer while the drug was prescribed daily to millions.',
        evidenceSource: 'Chen Z, Zhang J, Stamler JS. Proc Natl Acad Sci USA 2002;99:8306-8311',
        doi: '10.1073/pnas.122225199',
        measuredMetric:
          'Identification of mitochondrial aldehyde dehydrogenase as the nitrate reductase bioactivating glyceryl trinitrate, and its inhibition in tolerant vessels',
        auditFlag: 'verified',
      },
      {
        id: 'ntg-a4',
        category: 'measured',
        title: 'A common East Asian gene variant blunts the response by about 40%',
        laymanSummary:
          'The enzyme that activates nitroglycerin is the same one that clears alcohol’s toxic breakdown product. People with the common East Asian variant of that gene — the one that causes facial flushing after a drink — get substantially less vasodilatation from the drug.',
        technicalDetails:
          'Mackenzie and colleagues measured forearm blood flow responses to intra-arterial nitroglycerin, sodium nitroprusside and verapamil in 12 healthy volunteers before and after aldehyde dehydrogenase inhibition with disulfiram. All three drugs dilated dose-dependently, but only the nitroglycerin response fell after disulfiram — a 33% reduction in area under the curve, p=0.002. Separately, 11 subjects of East Asian origin carrying the loss-of-function glu504lys mutation in ALDH2 received the same three infusions: only the nitroglycerin response was lower than in East Asian and non-Asian wild-type controls, a 40% reduction in area under the curve, p=0.02. The authors concluded that ALDH2 is involved in nitroglycerin bioactivation in humans in vivo but accounts for less than half of total bioactivation. The clinical implication they draw is precise: this may matter in patients with ALDH2 mutations and in those taking drugs that inhibit the enzyme. The specificity of the finding is what makes it strong — nitroprusside, which releases nitric oxide without needing the enzyme, was unaffected in both experiments.',
        evidenceSource:
          'Mackenzie IS, Maki-Petaja KM, McEniery CM, et al. Arterioscler Thromb Vasc Biol 2005;25:1891-1895',
        doi: '10.1161/01.ATV.0000179599.71086.89',
        measuredMetric:
          'Forearm blood flow response to intra-arterial nitroglycerin after ALDH2 inhibition (−33% AUC, p=0.002) and in glu504lys carriers (−40% AUC, p=0.02)',
        auditFlag: 'verified',
      },
      {
        id: 'ntg-a5',
        category: 'inferred',
        title: 'It probably is not opening the coronary artery, and the label says so',
        laymanSummary:
          'The common explanation — that the tablet opens up the blocked artery — is not what the prescribing information supports. It says the contribution of coronary dilatation to relief of exertional angina is unclear.',
        technicalDetails:
          'The NITROSTAT pharmacodynamics section states that nitroglycerin dilates large epicardial coronary arteries, and then immediately adds: "however, the extent to which this latter effect contributes to the relief of exertional angina is unclear." What it does assert without hedging is the demand side: dilation of postcapillary vessels including large veins promotes peripheral pooling, decreases venous return and reduces left ventricular end-diastolic pressure; arteriolar relaxation reduces peripheral resistance and arterial pressure; and myocardial oxygen consumption or demand, measured by pressure-rate product, tension-time index and stroke-work index, is decreased. The label even notes that effective coronary perfusion pressure can be compromised if blood pressure falls excessively or heart rate rises enough to shorten diastolic filling. So the mechanism the regulator stands behind is that the heart is asked to do less, not that more blood is delivered. That difference explains why the drug works so well for symptoms and did nothing for survival in two mega-trials.',
        evidenceSource:
          'NITROSTAT (nitroglycerin) sublingual tablets United States prescribing information, section 12.2 (NDA 021134)',
        inferredClaim:
          'That nitroglycerin relieves angina by opening the narrowed coronary artery — an explanation the label describes as of unclear contribution, against demand reduction which it states without qualification',
        auditFlag: 'caution',
      },
      {
        id: 'ntg-a6',
        category: 'failed',
        title: 'A preventive nitrate can blunt the rescue one',
        laymanSummary:
          'The sublingual tablet’s own label warns that taking a long-acting nitrate can reduce how well the emergency tablet works. Two prescriptions from the same class can undermine each other.',
        technicalDetails:
          'The NITROSTAT warnings section states: "Excessive use may lead to the development of tolerance. Only the smallest dose required for effective relief of the acute angina attack should be used. A decrease in therapeutic effect of sublingual nitroglycerin may result from use of long-acting nitrates." That is a specific and under-appreciated interaction between two members of the same class prescribed for the same disease — the preventive nitrate maintains the continuous exposure that induces tolerance, and the rescue nitrate then has to act on a tolerant vessel. It is mechanistically coherent with the 2002 finding that mitochondrial aldehyde dehydrogenase is inhibited in vessels made tolerant by nitroglycerin: the enzyme the rescue tablet depends on has already been suppressed by the patch or the tablet taken for prevention.',
        evidenceSource:
          'NITROSTAT United States prescribing information, section 5.1 (NDA 021134); Chen Z, Zhang J, Stamler JS. Proc Natl Acad Sci USA 2002;99:8306-8311',
        doi: '10.1073/pnas.122225199',
        measuredMetric:
          'Label-stated reduction in sublingual nitroglycerin effect resulting from use of long-acting nitrates',
        auditFlag: 'caution',
      },
      {
        id: 'ntg-a7',
        category: 'measured',
        title: 'Five absolute contraindications, and one of them is anaemia',
        laymanSummary:
          'Besides the well-known ban on erectile dysfunction drugs, nitroglycerin is contraindicated in severe anaemia, in raised pressure inside the skull, and in shock — each for a different and specific reason.',
        technicalDetails:
          'The label lists five contraindications. Phosphodiesterase-5 inhibitors — avanafil, sildenafil, tadalafil, vardenafil — because concomitant use can cause severe hypotension, syncope or myocardial ischaemia; soluble guanylate cyclase stimulators such as riociguat for the same pathway reason. Severe anaemia, because large doses of nitroglycerin may oxidise haemoglobin to methaemoglobin and could exacerbate the anaemia — a chemical consequence of giving a nitrate to blood that is already short of oxygen-carrying capacity. Possible increased intracranial pressure, such as cerebral haemorrhage or traumatic brain injury, because the drug may precipitate or aggravate that rise. Acute circulatory failure and shock, where reducing venous return is precisely the wrong intervention. And hypersensitivity to nitroglycerin, other nitrates or nitrites, or any excipient. The label separately warns that nitrate therapy may aggravate the angina caused by hypertrophic cardiomyopathy, where reducing preload worsens outflow obstruction.',
        evidenceSource:
          'NITROSTAT United States prescribing information, sections 4.1 to 4.5 and 5.3 (NDA 021134)',
        measuredMetric: 'Enumerated contraindications and the stated physiological reason for each',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Under the tongue, straight into the blood',
        laymanDesc:
          'The tablet dissolves against the lining of the mouth and is absorbed directly into the circulation, bypassing the liver — which is why it works in minutes rather than an hour.',
        molecularDetail:
          'Sublingual and buccal absorption avoids the extensive hepatic first-pass extraction that reduces oral nitrate bioavailability to a fraction of the dose. The label directs one tablet at the first sign of an attack, repeated every five minutes to a maximum of three in fifteen minutes, taken sitting.',
        iconName: 'Zap',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A mitochondrial enzyme cuts off a nitrate group',
        laymanDesc:
          'Inside the blood vessel cell, an enzyme in the mitochondria strips one nitrate off the molecule and releases nitric oxide. That enzyme is the same one that clears the toxic breakdown product of alcohol.',
        molecularDetail:
          'Mitochondrial aldehyde dehydrogenase catalyses formation of 1,2-glyceryl dinitrate and nitrite from glyceryl trinitrate. Inhibition with disulfiram reduced the human forearm blood flow response by 33% (p=0.002), and carriers of the glu504lys loss-of-function variant showed a 40% reduction (p=0.02), while the response to nitroprusside was unaffected in both.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Nitric oxide switches on guanylate cyclase',
        laymanDesc:
          'The released nitric oxide activates an enzyme that produces a second messenger, and that messenger tells the muscle in the vessel wall to let go.',
        molecularDetail:
          'The label states that nitroglycerin forms free radical nitric oxide which activates guanylate cyclase, increasing cyclic GMP in smooth muscle and other tissues, leading to dephosphorylation of myosin light chains and vasodilatation.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Veins widen, so the heart is asked to do less',
        laymanDesc:
          'The veins relax more than the arteries, so blood pools away from the heart. With less blood returning, the heart does less work and needs less oxygen.',
        molecularDetail:
          'Venous effects predominate. Dilation of postcapillary vessels promotes peripheral pooling, decreases venous return and reduces left ventricular end-diastolic pressure; arteriolar relaxation reduces peripheral resistance and arterial pressure. Myocardial oxygen consumption falls on pressure-rate product, tension-time index and stroke-work index.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The attack stops, usually within minutes',
        laymanDesc:
          'That is what the drug is licensed for and what it reliably does: relief of an angina attack, or prevention of one expected in the next few minutes.',
        molecularDetail:
          'The indication is acute relief of an attack or acute prophylaxis of angina pectoris due to coronary artery disease. The label directs seeking prompt medical attention if pain persists after three tablets in fifteen minutes or if the pain differs from the usual pattern.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And nothing beyond that has been shown',
        laymanDesc:
          'Given routinely after a heart attack in two trials totalling more than seventy-seven thousand people, nitrates made no difference to survival.',
        molecularDetail:
          'ISIS-4: five-week mortality 7.34% against 7.54% with oral mononitrate in 58,050 patients, no significant reduction overall or in any subgroup. GISSI-3: transdermal glyceryl trinitrate odds ratio 0.94 (95% CI 0.84 to 1.05) for mortality in 19,394 patients, no independent effect, while lisinopril in the same trial gave 0.88 (0.79 to 0.99).',
        iconName: 'MinusCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'ISIS-4 — Fourth International Study of Infarct Survival (Lancet 1995;345:669-685)',
        phase: 'Phase 3, randomised, placebo-controlled, 2×2×2 factorial',
        sampleSize: 58050,
        primaryEndpoint:
          'Five-week all-cause mortality with one month of oral controlled-release mononitrate against matching placebo, in patients randomised up to 24 hours after onset of suspected acute myocardial infarction',
        endpointMet: false,
        statisticalPValue:
          '2,129 deaths (7.34%) on mononitrate against 2,190 (7.54%) on placebo — no significant reduction overall or in any subgroup examined, and no later survival advantage on further follow-up',
        unreportedAdverseSignals:
          'The only significant side effect was an increase of 15 per 1,000 in hypotension. Patients allocated active treatment had somewhat fewer deaths on days 0 to 1, which the investigators described as reassuring about the safety of early nitrate use. Captopril in the same factorial design achieved a significant 7% proportional mortality reduction (7.19% against 7.69%, 2p=0.02), demonstrating the trial could detect an effect of that magnitude.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'GISSI-3 (Lancet 1994;343:1115-1122)',
        phase: 'Phase 3, randomised, open-control, factorial',
        sampleSize: 19394,
        primaryEndpoint:
          'Six-week mortality, and the combined outcome of mortality plus severe ventricular dysfunction, with intravenous then transdermal glyceryl trinitrate against open control after acute myocardial infarction',
        endpointMet: false,
        statisticalPValue:
          'Odds ratio 0.94 (95% CI 0.84 to 1.05) for overall mortality and 0.94 (95% CI 0.87 to 1.02) for the combined endpoint — no independent effect. Lisinopril in the same trial gave 0.88 (95% CI 0.79 to 0.99) and 0.90 (95% CI 0.84 to 0.98)',
        unreportedAdverseSignals:
          'The design was open-control rather than placebo-controlled, and non-protocol nitrate use was permitted for specific clinical indications, both of which would dilute a genuine effect. Background therapy was intensive: thrombolysis 72%, beta-blockade 31%, aspirin 84%. No excess of clinically relevant unfavourable events was reported in the treated groups.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Mackenzie IS et al., forearm blood flow study of ALDH2 and nitroglycerin (Arterioscler Thromb Vasc Biol 2005;25:1891-1895)',
        phase: 'Mechanistic human physiology study, within-subject and genotype-controlled',
        sampleSize: 23,
        primaryEndpoint:
          'Forearm blood flow response to intra-arterial nitroglycerin, sodium nitroprusside and verapamil, before and after ALDH2 inhibition with disulfiram, and in carriers of the ALDH2 glu504lys variant against wild-type controls',
        endpointMet: true,
        statisticalPValue:
          'Nitroglycerin response reduced 33% in area under the curve after disulfiram (p=0.002) and 40% in glu504lys carriers (p=0.02); nitroprusside and verapamil responses unchanged in both experiments',
        unreportedAdverseSignals:
          'Twelve volunteers in the disulfiram arm and eleven in the genotype arm — small numbers, which is normal for invasive forearm plethysmography and still a limit on precision. The authors conclude ALDH2 accounts for less than half of total nitroglycerin bioactivation, so a second pathway exists and is uncharacterised. Sample size shown is the sum of the two groups.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Five-week mortality 7.34% against 7.54% with oral mononitrate in 58,050 patients after suspected myocardial infarction (ISIS-4, not significant)',
        'Six-week mortality odds ratio 0.94 (95% CI 0.84 to 1.05) with transdermal glyceryl trinitrate in 19,394 patients (GISSI-3, no independent effect)',
        'Mitochondrial aldehyde dehydrogenase identified as the nitrate reductase producing 1,2-glyceryl dinitrate and nitrite from glyceryl trinitrate, and shown inhibited in tolerant vessels',
        'Human forearm blood flow response to nitroglycerin reduced 33% by disulfiram and 40% in ALDH2 glu504lys carriers, with nitroprusside unaffected',
        'Reduction in myocardial oxygen demand on pressure-rate product, tension-time index and stroke-work index',
      ],
      unsupportedInferences: [
        'That nitroglycerin relieves angina by opening the narrowed coronary artery — the label calls the contribution of coronary dilatation unclear',
        'That routine nitrate therapy after myocardial infarction improves survival — tested in 77,444 randomised patients and found not to',
        'That a long-acting nitrate and a sublingual rescue tablet are independent treatments, when the label states the former can reduce the effect of the latter',
        'That ALDH2 explains nitrate bioactivation completely — the authors of the human study state it accounts for less than half',
      ],
      whatFailedInitially: [
        'ISIS-4: no significant mortality reduction with oral mononitrate, overall or in any subgroup',
        'GISSI-3: no independent effect of transdermal glyceryl trinitrate on mortality or on ventricular dysfunction',
        'Continuous nitrate exposure, which induces tolerance by inhibiting the very enzyme the drug depends on',
        'The mechanism of bioactivation remained unidentified for 123 years of clinical use',
      ],
      realWorldOutcome: [
        'In medical use since 1879 and still the standard immediate treatment for an angina attack',
        'About thirteen United States cents per unit at pharmacy acquisition cost across 72 listed products spanning tablets, patches, ointments, sprays and premixed infusions',
        'Its licensed claim remains relief and short-term prevention of angina; no nitrate carries a mortality claim',
        'Its activating enzyme is the same one responsible for the alcohol-flushing phenotype, which makes the drug measurably weaker in a large share of people of East Asian descent',
      ],
    },
    deliverySystem: {
      type: 'Sublingual tablet, lingual spray, transdermal patch, topical ointment and intravenous infusion in 5% dextrose',
      description:
        'Sublingual and buccal absorption bypasses hepatic first-pass extraction, which is why relief arrives in minutes; the label directs one tablet at the first sign of an attack, one more every five minutes, no more than three in fifteen minutes, taken at rest and preferably sitting, and allows prophylactic use five to ten minutes before an activity expected to provoke an attack. For patients with a dry mouth the label suggests a small sip of water first to aid dissolution. Transdermal and ointment forms are for prevention rather than rescue and require a daily nitrate-free interval for the same tolerance reason as the oral nitrates. The molecule is volatile and migrates into plastics, so the original glass container with a tight closure is part of the product.',
      safetyProfile:
        'Contraindicated with phosphodiesterase-5 inhibitors (avanafil, sildenafil, tadalafil, vardenafil) and soluble guanylate cyclase stimulators such as riociguat, in severe anaemia because large doses may oxidise haemoglobin to methaemoglobin, in possible raised intracranial pressure such as cerebral haemorrhage or traumatic brain injury, in acute circulatory failure and shock, and in hypersensitivity to nitroglycerin, other nitrates or nitrites. Severe hypotension can occur at small doses, particularly upright, and may be accompanied by paradoxical bradycardia and increased angina; risk is higher in constrictive pericarditis, aortic or mitral stenosis, volume depletion and existing hypotension. Nitrate therapy may aggravate the angina of hypertrophic cardiomyopathy. Dose-related headache is common at the start of therapy, may be severe and persistent, and usually subsides with continued use. Excessive use leads to tolerance, and long-acting nitrates may reduce the effect of the sublingual form.',
    },
    commonQuestions: [
      {
        q: 'Is this really the same chemical as dynamite?',
        a: 'It is the same molecule, at a completely different scale and never in undiluted form. Nitroglycerin is glycerol with all three hydroxyl groups nitrated, and pharmaceutical manufacture puts it straight onto lactose or into propylene glycol without ever isolating the neat material. A sublingual tablet contains a fraction of a milligram. Alfred Nobel’s contribution was making the pure compound safe to transport by absorbing it into diatomaceous earth; the pharmaceutical industry solved essentially the same problem for a dose ten thousand times smaller.',
        auditNote:
          'The molecule’s volatility is also why nitroglycerin tablets are dispensed in a glass bottle with a tight cap. Moved into a plastic pill organiser, they lose potency quietly.',
      },
      {
        q: 'Does the tablet open up my blocked artery?',
        a: 'Probably not, and the label declines to claim it. The prescribing information says nitroglycerin dilates large epicardial coronary arteries, then immediately adds that the extent to which this contributes to relief of exertional angina is unclear. What it states without hedging is that the veins dilate, blood pools away from the heart, filling pressure falls, and myocardial oxygen demand goes down on every standard index. So the pain stops because the heart is asked to do less work, not because more blood is getting through. That distinction is not academic: it is why a drug that reliably abolishes chest pain within minutes did nothing at all for survival in two trials totalling more than seventy-seven thousand patients.',
      },
      {
        q: 'Why does it seem to work less well than it used to?',
        a: 'Tolerance, and there are two ways in. The first is simple overuse — the label states that excessive use may lead to tolerance and that only the smallest dose required for relief should be used. The second is less obvious and is on the same label: "A decrease in therapeutic effect of sublingual nitroglycerin may result from use of long-acting nitrates." If you also take a nitrate patch or a long-acting nitrate tablet for prevention, the continuous exposure suppresses the mitochondrial enzyme that the rescue tablet depends on, and the rescue tablet then has to work on a vessel that has already stopped responding. This is worth raising directly with whoever prescribes both.',
      },
      {
        q: 'I flush when I drink alcohol. Does that affect this drug?',
        a: 'It may, and the connection is exact rather than coincidental. The enzyme that activates nitroglycerin is mitochondrial aldehyde dehydrogenase, the same enzyme that clears acetaldehyde after a drink. The common East Asian glu504lys variant that causes alcohol flushing is a loss-of-function variant of that enzyme. In a forearm blood flow study, carriers of that variant had a 40% smaller response to intra-arterial nitroglycerin than wild-type controls (p=0.02), while their response to nitroprusside — which releases nitric oxide without needing the enzyme — was normal. Blocking the enzyme pharmacologically with disulfiram produced a 33% reduction in the same experiment. The authors concluded the enzyme accounts for less than half of total bioactivation, so the effect is blunted rather than abolished. It is not a reason to avoid the drug; it is a reason for a smaller-than-expected response to be taken seriously rather than dismissed.',
      },
      {
        q: 'If it does not save lives, why is it still used so much?',
        a: 'Because relieving a specific, frightening, disabling symptom within minutes is a legitimate goal in its own right, and this drug does it more reliably than anything else available outside hospital. The two mega-trials asked a different question — whether giving nitrates routinely to everyone after a heart attack improves survival — and the answer was no, in 58,050 patients in ISIS-4 and 19,394 in GISSI-3. Those results do not say the drug fails to relieve angina; they say the relief does not translate into fewer deaths. Both statements are true, and a page that reported only one of them would be misleading in a different direction.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'ISIS-4 (Fourth International Study of Infarct Survival) Collaborative Group. A randomised factorial trial assessing early oral captopril, oral mononitrate, and intravenous magnesium sulphate in 58,050 patients with suspected acute myocardial infarction. Lancet 1995;345:669-685',
        identifier: '7661937',
        kind: 'pmid',
      },
      {
        label:
          'GISSI-3: effects of lisinopril and transdermal glyceryl trinitrate singly and together on 6-week mortality and ventricular function after acute myocardial infarction. Lancet 1994;343:1115-1122',
        identifier: '7910229',
        kind: 'pmid',
      },
      {
        label:
          'Chen Z, Zhang J, Stamler JS. Identification of the enzymatic mechanism of nitroglycerin bioactivation. Proc Natl Acad Sci USA 2002;99:8306-8311',
        identifier: '10.1073/pnas.122225199',
        kind: 'doi',
      },
      {
        label:
          'Mackenzie IS, Maki-Petaja KM, McEniery CM, et al. Aldehyde dehydrogenase 2 plays a role in the bioactivation of nitroglycerin in humans. Arterioscler Thromb Vasc Biol 2005;25:1891-1895',
        identifier: '10.1161/01.ATV.0000179599.71086.89',
        kind: 'doi',
      },
      {
        label:
          'NITROSTAT (nitroglycerin) sublingual tablets United States prescribing information — Indications 1, Dosage 2, Contraindications 4.1 to 4.5, Warnings and Precautions 5.1 to 5.4, Clinical Pharmacology 12.1 and 12.2 (NDA 021134)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021134',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — nitroglycerin, 72 listed products across all dosage forms, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 4510 — nitroglycerin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4510',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Clonidine — an antihypertensive whose own label says no controlled trial has shown it
  //    reduces risk, which was given before surgery to prevent heart attacks until a 10,010-patient
  //    trial found it caused more cardiac arrests, and which is now mostly used for other things.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'clonidine',
    name: 'Clonidine',
    tradeName:
      'Catapres / Catapres-TTS / Nexiclon / Javadin / Duraclon; extended-release tablets for ADHD',
    sponsor:
      'Boehringer Ingelheim originated Catapres and holds NDA 018891 for the Catapres-TTS transdermal system; Azurity holds NDA 220256 for the Javadin oral solution; Duraclon epidural injection is NDA 020615. Generic and made by many manufacturers',
    targetGene: 'ADRA2A',
    targetProtein:
      'Alpha-2 adrenergic receptors in the brainstem, whose stimulation reduces sympathetic outflow from the central nervous system — although the label states the exact relationship between the drug’s pharmacological actions and its antihypertensive effect has not been fully elucidated',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1974,
    indication:
      'Treatment of hypertension in adults, alone or with other antihypertensive agents. Extended-release tablets are separately indicated for attention deficit hyperactivity disorder as monotherapy or as adjunctive therapy to stimulants. Epidural clonidine (Duraclon) is indicated in combination with opiates for severe cancer pain not adequately relieved by opioid analgesics alone',
    patientFriendlyIndication:
      'High blood pressure; separately, in an extended-release form, attention deficit hyperactivity disorder',
    anatomicalSite:
      'Brainstem alpha-2 adrenergic receptors — this drug lowers blood pressure by acting on the brain rather than on the blood vessel',
    conditionContext: {
      conditionExplainer:
        'High blood pressure is a number, not a sensation, and it damages arteries, kidneys and brain over decades without symptoms. Most antihypertensives act on the vessel or the kidney; clonidine acts on the part of the brainstem that sets sympathetic tone, turning the signal down at its source.',
      whyItMatters:
        'Clonidine has drifted a long way from what it was licensed for. It is a 1974 antihypertensive whose modern label states there are no controlled trials demonstrating risk reduction with it, and much of its present use — attention deficit hyperactivity disorder, opioid withdrawal, menopausal hot flushes, tics, sedation in intensive care — grew up around it afterwards. Only the ADHD use has since acquired a licence of its own.',
      whoTakesThis:
        'Adults with high blood pressure, usually after other classes; children and adults with ADHD, in the extended-release form; and, off-label, people in opioid withdrawal and people with severe hot flushes.',
      clinicalGoals:
        'A lower blood pressure, or fewer ADHD symptoms. Not a demonstrated reduction in cardiovascular events, which the label explicitly declines to claim.',
    },
    oneSentenceVerdict:
      'A brainstem alpha-2 agonist whose current United States label states outright that "there are no controlled trials demonstrating risk reduction" with it, and which — given before non-cardiac surgery to prevent perioperative infarction, a practice built on plausible physiology — was tested in 10,010 patients in POISE-2 and did not reduce death or infarction (HR 1.08, p=0.29) while raising clinically important hypotension from 37.1% to 47.6% (p<0.001) and tripling nonfatal cardiac arrest (HR 3.20, 95% CI 1.17 to 8.73, p=0.02).',
    laymanHowItWorks:
      'Blood pressure is partly set by how much signal the brainstem sends down the sympathetic nerves to the heart and blood vessels. Clonidine stimulates a receptor on those brainstem neurons that acts as a brake on their own output, so less signal leaves the brain. Heart rate falls, vessels relax, and pressure comes down — without the drug ever touching the blood vessel directly. The same reduction in sympathetic drive is why it causes drowsiness, why it eases the agitation of opioid withdrawal, and why stopping it suddenly releases a flood of the signal it was suppressing.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 52,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0319 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 95 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'On the United States market since 1974 and generic for decades at about three cents a tablet. The instructive comparison is lofexidine, an alpha-2 agonist of the same class approved in 2018 specifically for opioid withdrawal — the use clonidine has served off-label for forty years — at US$8.6563 per tablet in the same CMS survey, roughly 270 times the price.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For blood pressure the comparison is unflattering: thiazide-like diuretics, ACE inhibitors, angiotensin receptor blockers and calcium channel blockers all have hard-endpoint trials, and clonidine has none. For ADHD, guanfacine is the same class with a longer half-life and less sedation. For opioid withdrawal, lofexidine is the same class with an actual licence — and 270 times the price.',
      conventionalRx: [
        {
          name: 'Guanfacine extended-release',
          class: 'Selective alpha-2A adrenergic agonist',
          howItCompares:
            'The same receptor class with greater selectivity for the alpha-2A subtype and a longer half-life, so once-daily dosing is genuine rather than approximate and sedation is generally less. It carries its own ADHD indication and, in immediate-release form, a hypertension indication.',
          typicalCost:
            'US$0.1573 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 67 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: less sedation; smoother pharmacokinetics; same rebound precautions but generally milder. Cons: about five times the price of clonidine; the same absence of cardiovascular outcome evidence.',
        },
        {
          name: 'Lofexidine (Lucemyra)',
          class: 'Central alpha-2 adrenergic agonist',
          howItCompares:
            'Indicated for mitigation of opioid withdrawal symptoms to facilitate abrupt opioid discontinuation in adults — the one thing clonidine has been used for extensively without ever being licensed for it. Same mechanism, an actual approval, and a price of US$8.6563 a tablet against clonidine’s US$0.0319.',
          typicalCost:
            'US$8.6563 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 8 listed products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: a licensed indication and the trial programme behind it. Cons: roughly 270 times the acquisition price of a drug in the same class doing the same job.',
        },
        {
          name: 'Thiazide-like diuretics, ACE inhibitors, ARBs, calcium channel blockers',
          class: 'First-line antihypertensive classes',
          howItCompares:
            'Every one of these has randomised outcome trials showing reduced strokes, infarctions or death. Clonidine’s label states there are no controlled trials demonstrating risk reduction with it, and adds that the benefit of lowering blood pressure has been shown for drugs from a wide variety of pharmacologic classes — an inference borrowed from other molecules.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: outcome evidence in the actual indication; no rebound hypertension on stopping; no sedation. Cons: each class has its own adverse effects, from electrolyte disturbance to cough to ankle swelling.',
        },
      ],
      naturalFoods: [
        {
          name: 'The DASH dietary pattern — fruit, vegetables and low-fat dairy, with reduced saturated and total fat',
          activeCompound:
            'No single compound; the effect is attributed to the combined potassium, magnesium, calcium and fibre content of the pattern',
          biologicalMechanism:
            'A whole-diet intervention rather than a molecule, tested as one. Sodium intake and body weight were held constant in the trial, so the reduction is attributable to the dietary pattern itself rather than to salt restriction or weight loss.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: in the DASH trial, 459 adults were fed a control diet for three weeks then randomised for eight weeks. The combination diet lowered systolic and diastolic pressure by 5.5 and 3.0 mmHg more than control (p<0.001 for each); among the 133 participants with hypertension it lowered them by 11.4 and 5.5 mmHg more (p<0.001 for each). That is a blood pressure endpoint over eight weeks in fed volunteers, not a cardiovascular outcome, and no dietary trial has measured events.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Never stop it suddenly',
          action:
            'Do not discontinue without medical advice, and say early if you are running low or cannot get a refill.',
          patientImpact:
            'The label records that sudden cessation has produced nervousness, agitation, headache, tremor and confusion accompanied or followed by a rapid rise in blood pressure and raised plasma catecholamines, and that rare instances of hypertensive encephalopathy, cerebrovascular accidents and death have been reported after clonidine withdrawal. The dose should be reduced gradually over two to four days.',
          clinicalPrecaution:
            'The risk is greater after higher doses and where a beta-blocker is being taken as well. If both are to be stopped, the label directs withdrawing the beta-blocker several days before the gradual discontinuation of clonidine, not the other way round.',
        },
        {
          name: 'Tell the surgical team before an operation',
          action:
            'Say you take clonidine when any surgery is planned, and follow the instruction given about the morning of the operation.',
          patientImpact:
            'The Javadin label directs continuing administration up to four hours before surgery and resuming promptly afterwards with close blood pressure monitoring, because an unplanned interruption around an operation is exactly the situation that produces rebound.',
          clinicalPrecaution:
            'This is the opposite of starting clonidine before an operation, which POISE-2 tested in 10,010 patients and found increased hypotension and nonfatal cardiac arrest without preventing infarction.',
        },
        {
          name: 'Expect drowsiness, and plan around it',
          action:
            'Do not drive or operate machinery until you know how it affects you, particularly on starting or after a dose increase.',
          patientImpact:
            'Sedation and somnolence are labelled warnings, not incidental effects — they are the central nervous system consequence of the same reduction in sympathetic outflow that lowers the blood pressure.',
          clinicalPrecaution:
            'The label also warns of bradycardia, cardiac conduction abnormalities and symptomatic hypotension, and directs slow titration in patients with syncope, heart block or vascular disease, and avoidance of other drugs affecting sinus or atrioventricular node function.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CN=C(N1)NC2=C(C=CC=C2Cl)Cl',
      chemicalFormula: 'C9H9Cl2N3',
      molecularWeight: '230.09 g/mol',
      targetReceptorAffinity:
        'A 2,6-dichlorophenyl aminoimidazoline. The label states that clonidine stimulates alpha-adrenoreceptors in the brainstem, reducing sympathetic outflow from the central nervous system and decreasing peripheral resistance, renal vascular resistance, heart rate and blood pressure, while renal blood flow and glomerular filtration rate remain essentially unchanged and normal postural reflexes stay intact. Acute studies show a 15% to 20% reduction in supine cardiac output with no change in peripheral resistance; during long-term therapy cardiac output returns toward control while peripheral resistance stays reduced. Plasma renin activity and the excretion of aldosterone and catecholamines fall. The label then states that the exact relationship of these pharmacological actions to the antihypertensive effect has not been fully elucidated. Absolute bioavailability from the transdermal system is approximately 60%, delivering drug at an approximately constant rate for seven days.',
      structureSource: {
        label:
          'PubChem CID 2803 (clonidine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; pharmacology from the Catapres-TTS label, Clinical Pharmacology (NDA 018891)',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2803',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'clo-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Content uniformity at the microgram scale, and the tautomer question',
          description:
            'Clonidine tablets contain 0.1 to 0.3 mg of drug, so blend uniformity dominates the quality risk in a way it does not for a 500 mg tablet — a segregated blend produces tablets that are individually out of specification while the batch assay passes. Separately, the aminoimidazoline exists as tautomers whose ratio shifts with pH and solvent, which matters for spectroscopic identity testing and for the interpretation of any impurity peak sitting close to the parent.',
          reagentsAndBuffer:
            'Clonidine hydrochloride USP reference standard, reversed-phase HPLC with ultraviolet detection, individual-tablet content uniformity per USP, blend uniformity sampling across the compression run, ¹H NMR in deuterated dimethyl sulfoxide and deuterium oxide to characterise the tautomeric ratio',
        },
        {
          id: 'clo-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Condense 2,6-dichloroaniline onto an imidazoline',
          description:
            'The molecule is a 2,6-dichloroaniline joined through a nitrogen to a 2-aminoimidazoline ring. The classic route activates the aniline as an isothiocyanate or thiourea and condenses it with ethylenediamine, then cyclises. The two ortho chlorines are what force the aromatic ring out of plane with the imidazoline, and that twist is a large part of the receptor selectivity — a mono-chloro analogue is a different pharmacology, not a slightly weaker version of the same one.',
          dependsOnStepId: 'clo-w1',
          reagentsAndBuffer:
            '2,6-dichloroaniline, thiophosgene or ammonium thiocyanate for isothiocyanate formation, ethylenediamine, mercuric oxide or carbodiimide-mediated cyclisation, hydrogen chloride in isopropanol for salt formation, anhydrous solvents under nitrogen',
        },
        {
          id: 'clo-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Remove the mono-chloro and regioisomeric anilines',
          description:
            'Commercial 2,6-dichloroaniline carries 2,4- and 2,5-dichloro isomers and mono-chloro material, and each carries straight through the condensation into a structurally similar impurity. Because the ortho-ortho substitution pattern is what produces the pharmacology, these impurities are not inert — they are related compounds with their own receptor activity, which is why they are specified individually rather than as a total.',
          dependsOnStepId: 'clo-w2',
          reagentsAndBuffer:
            'Recrystallisation of the hydrochloride from ethanol or isopropanol, activated carbon treatment, HPLC release testing against individually specified limits for the positional isomers and des-chloro analogue, reference standards for each named related substance',
        },
        {
          id: 'clo-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Separate the alpha-2 subtypes and test the imidazoline site alongside them',
          description:
            'The label declines to state exactly how the antihypertensive effect arises, and there is a specific reason: clonidine binds both alpha-2 adrenergic receptors and imidazoline binding sites, and the three alpha-2 subtypes do opposite things. Alpha-2A in the brainstem lowers sympathetic outflow; alpha-2B on vascular smooth muscle constricts, which is why high or rapid doses can raise blood pressure transiently before lowering it. An assay that reports a single alpha-2 affinity averages a brake and an accelerator.',
          dependsOnStepId: 'clo-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human ADRA2A, ADRA2B and ADRA2C separately, forskolin-stimulated cyclic AMP inhibition as the Gi-coupled readout, yohimbine and rauwolscine as antagonist controls, moxonidine and rilmenidine as imidazoline-preferring comparators, isolated vessel rings for the alpha-2B-mediated constriction',
        },
        {
          id: 'clo-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Model the withdrawal, not just the effect',
          description:
            'The clinically dangerous property of this drug is not what it does but what happens when it stops. Chronic alpha-2 agonism upregulates the sympathetic system it has been suppressing, and abrupt removal releases it — the label records hypertensive encephalopathy, stroke and death after withdrawal. A protocol that measures only acute effect will never see that. The experiment that does is chronic exposure followed by abrupt washout, with catecholamine release and receptor density measured across the transition.',
          dependsOnStepId: 'clo-w4',
          reagentsAndBuffer:
            'Chronic infusion model with abrupt cessation, plasma and tissue catecholamine quantification by LC-MS/MS, radioligand binding for alpha-2 receptor density before and after withdrawal, paired arms with and without concurrent beta-blockade to reproduce the labelled interaction, phentolamine as the reversal agent control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'clo-a1',
        category: 'inferred',
        title: 'The label says no controlled trial has shown it reduces risk',
        laymanSummary:
          'It lowers blood pressure. Whether it prevents strokes and heart attacks has not been tested for this drug, and the prescribing information says so in as many words.',
        technicalDetails:
          'The Javadin clonidine oral solution indication reads: "JAVADIN is indicated for the treatment of hypertension in adult patients, to lower blood pressure. Lowering blood pressure reduces the risk of fatal and nonfatal cardiovascular events, primarily strokes and myocardial infarctions. These benefits have been seen in controlled trials of antihypertensive drugs from a wide variety of pharmacologic classes. There are no controlled trials demonstrating risk reduction with JAVADIN." That final sentence is the whole audit. The benefit is a borrowed one: it rests on the general proposition that lowering blood pressure reduces events, established for other classes in other trials, and applied here by inference. Every first-line antihypertensive class — thiazide-like diuretics, ACE inhibitors, angiotensin receptor blockers, calcium channel blockers — has its own outcome trials. Clonidine, half a century after approval, does not.',
        evidenceSource:
          'JAVADIN (clonidine hydrochloride) oral solution United States prescribing information, section 1 (NDA 220256)',
        inferredClaim:
          'That the blood pressure reduction measured with clonidine converts into fewer cardiovascular events — a class-level inference the label explicitly declines to make for this molecule',
        auditFlag: 'caution',
      },
      {
        id: 'clo-a2',
        category: 'failed',
        title: 'POISE-2: given before surgery, it caused harm rather than preventing it',
        laymanSummary:
          'Clonidine was given before non-cardiac operations to blunt the surgical stress response and prevent heart attacks. In ten thousand patients it prevented nothing, doubled the rate of serious low blood pressure and tripled cardiac arrests.',
        technicalDetails:
          'POISE-2 randomised 10,010 patients with or at risk for atherosclerotic disease undergoing non-cardiac surgery at 135 centres in 23 countries, in a 2×2 factorial design, to low-dose clonidine 0.2 mg daily or placebo starting just before surgery and continuing to 72 hours afterwards. The primary outcome, death or nonfatal myocardial infarction at 30 days, occurred in 367 clonidine patients against 339 on placebo: hazard ratio 1.08 (95% CI 0.93 to 1.26), p=0.29. Myocardial infarction alone was 6.6% against 5.9%, hazard ratio 1.11 (95% CI 0.95 to 1.30), p=0.18. Clinically important hypotension occurred in 2,385 patients (47.6%) against 1,854 (37.1%), hazard ratio 1.32 (95% CI 1.24 to 1.40), p<0.001. Nonfatal cardiac arrest occurred in 16 patients (0.3%) against 5 (0.1%), hazard ratio 3.20 (95% CI 1.17 to 8.73), p=0.02. The rationale — that marked sympathetic activation occurs during and after surgery and that blunting it should prevent perioperative infarction without haemodynamic instability — was sound physiology. It was wrong on both halves: no prevention, and considerable instability.',
        evidenceSource:
          'Devereaux PJ, Sessler DI, Leslie K, et al. N Engl J Med 2014;370:1504-1513 (POISE-2)',
        doi: '10.1056/NEJMoa1401106',
        measuredMetric:
          'Composite of death or nonfatal myocardial infarction at 30 days after non-cardiac surgery, with clinically important hypotension and nonfatal cardiac arrest as safety outcomes',
        auditFlag: 'caution',
      },
      {
        id: 'clo-a3',
        category: 'failed',
        title: 'Stopping it abruptly has killed people',
        laymanSummary:
          'Because the drug suppresses the sympathetic nervous system, stopping suddenly releases it. The label records hypertensive brain injury, strokes and deaths after clonidine withdrawal.',
        technicalDetails:
          'The Catapres-TTS warnings section states: "Sudden cessation of clonidine treatment has, in some cases, resulted in symptoms such as nervousness, agitation, headache, tremor, and confusion accompanied or followed by a rapid rise in blood pressure and elevated catecholamine concentrations in the plasma… Rare instances of hypertensive encephalopathy, cerebrovascular accidents and death have been reported after clonidine withdrawal." The likelihood is greater after higher doses and where a beta-blocker is being taken concurrently. The label directs reducing the dose gradually over two to four days, treating an excessive rise after transdermal discontinuation with oral clonidine or intravenous phentolamine, and — where both drugs are being stopped — withdrawing the beta-blocker several days before the clonidine, because unopposed alpha stimulation during clonidine rebound is the mechanism of harm. This is a class property of central sympatholytics and it is the single most important practical fact about the drug.',
        evidenceSource:
          'Catapres-TTS (clonidine) United States prescribing information, Warnings, Withdrawal (NDA 018891); JAVADIN prescribing information, section 5.2 (NDA 220256)',
        measuredMetric:
          'Reported outcomes after abrupt clonidine discontinuation, and the labelled tapering and sequencing instructions',
        auditFlag: 'caution',
      },
      {
        id: 'clo-a4',
        category: 'failed',
        title: 'The label records that the blood pressure effect can simply wear off',
        laymanSummary:
          'Some people stop responding to clonidine over time. The prescribing information states this and says therapy should then be reconsidered.',
        technicalDetails:
          'The Clinical Pharmacology section states: "Tolerance to the antihypertensive effect may develop in some patients, necessitating a reevaluation of therapy." This sits alongside a second observation in the same paragraph that is easy to read past: acute studies showed a 15% to 20% reduction in supine cardiac output with no change in peripheral resistance, but during long-term therapy cardiac output returns toward control values while peripheral resistance stays reduced. So the haemodynamic route by which the drug lowers pressure at week one is not the route by which it lowers pressure at month six. A drug whose mechanism shifts with time and whose effect fades in some patients is a drug whose early response does not predict its later one.',
        evidenceSource:
          'Catapres-TTS (clonidine) United States prescribing information, Clinical Pharmacology (NDA 018891)',
        measuredMetric:
          'Labelled statement of tolerance to the antihypertensive effect, and the shift in haemodynamic mechanism between acute and long-term therapy',
        auditFlag: 'caution',
      },
      {
        id: 'clo-a5',
        category: 'inferred',
        title: 'Fifty years on, the label says the mechanism is not fully elucidated',
        laymanSummary:
          'The prescribing information lists several measured effects — lower sympathetic outflow, lower renin, lower catecholamine excretion — and then says how they add up to a lower blood pressure has not been fully worked out.',
        technicalDetails:
          'The label states that clonidine stimulates alpha-adrenoreceptors in the brainstem, reducing sympathetic outflow, peripheral resistance, renal vascular resistance, heart rate and blood pressure, and separately that plasma renin activity and excretion of aldosterone and catecholamines fall. It then states: "The exact relationship of these pharmacologic actions to the antihypertensive effect of clonidine has not been fully elucidated." There is a concrete reason for the hedge. Clonidine binds both alpha-2 adrenergic receptors and imidazoline binding sites, and the alpha-2 subtypes act in opposite directions — alpha-2A in the brainstem reduces sympathetic outflow while alpha-2B on vascular smooth muscle causes constriction, which is why rapid or high dosing can transiently raise pressure before lowering it. The mechanism is not mysterious so much as plural, and the regulator declines to apportion it.',
        evidenceSource:
          'Catapres-TTS (clonidine) United States prescribing information, Clinical Pharmacology (NDA 018891)',
        inferredClaim:
          'That clonidine’s antihypertensive effect is attributable to central alpha-2 agonism alone, when the label states the relationship between its measured pharmacological actions and its antihypertensive effect has not been fully elucidated',
        auditFlag: 'contested',
      },
      {
        id: 'clo-a6',
        category: 'conclusion_shift',
        title: 'The drug moved indications without moving labels',
        laymanSummary:
          'Clonidine was approved for blood pressure. Most of what it is used for now — ADHD, opioid withdrawal, hot flushes, tics, sedation — grew up around it afterwards, and only ADHD ever acquired an approval.',
        technicalDetails:
          'The original licence is hypertension, and it remains the indication on the immediate-release tablets, the oral solution and the transdermal system. Extended-release clonidine tablets carry a separate and later indication for attention deficit hyperactivity disorder as monotherapy and as adjunctive therapy to stimulants. Epidural clonidine, Duraclon, is indicated only in combination with opiates for severe cancer pain not adequately relieved by opioids alone, and its label states that the safety of the product has been established only in a highly selected group of cancer patients after an adequate trial of opioid analgesia, and that other use is of unproven safety and is not recommended. Opioid withdrawal — probably the best-known use of clonidine among clinicians — has never been a licensed indication for it; lofexidine, an alpha-2 agonist of the same class, was approved for that purpose in 2018. A drug whose commonest uses sit outside its licence is not necessarily being misused, but the evidence supporting those uses is not the evidence a regulator reviewed, and that distinction is invisible at the point of prescribing.',
        evidenceSource:
          'Clonidine hydrochloride tablets, extended-release tablets and Catapres-TTS United States prescribing information; DURACLON (clonidine hydrochloride injection) prescribing information, Indications and Usage (NDA 020615); LUCEMYRA (lofexidine) prescribing information, section 1 (NDA 209229)',
        inferredClaim:
          'That clonidine’s widespread off-label uses carry the same evidentiary standing as its licensed one, when only the ADHD use has been through a regulatory review of its own',
        auditFlag: 'caution',
      },
      {
        id: 'clo-a7',
        category: 'measured',
        title: 'Epidural clonidine carries a boxed warning against the perioperative use',
        laymanSummary:
          'The injectable form for cancer pain opens with a warning not to use it for childbirth, after delivery or around surgery, because the blood pressure and heart rate instability may be unacceptable.',
        technicalDetails:
          'The Duraclon boxed warning reads: "Duraclon (epidural clonidine) is not recommended for obstetrical, post-partum, or peri-operative pain management. The risk of hemodynamic instability, especially hypotension and bradycardia, from epidural clonidine may be unacceptable in these patients. However, in a rare obstetrical, post-partum or peri-operative patient, potential benefits may outweigh the possible risks." Placed beside POISE-2, the two records point the same way from opposite directions: a boxed warning derived from clinical experience with epidural administration, and a 10,010-patient randomised trial of the oral drug that found a 47.6% rate of clinically important hypotension and a tripling of nonfatal cardiac arrest. Haemodynamic instability around surgery is the consistent finding for this molecule by every route it has been studied in.',
        evidenceSource:
          'DURACLON (clonidine hydrochloride injection) United States prescribing information, boxed warning and Indications and Usage (NDA 020615)',
        measuredMetric:
          'Boxed warning restricting epidural clonidine from obstetrical, post-partum and peri-operative use on haemodynamic grounds',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A twisted little molecule that reaches the brain',
        laymanDesc:
          'Clonidine is small, fat-soluble and crosses into the brain easily — which is the point, because the receptor it needs is in the brainstem rather than in the blood vessel.',
        molecularDetail:
          'A 2,6-dichlorophenyl aminoimidazoline. The two ortho chlorines force the aromatic ring out of plane with the imidazoline, and that twist underlies its alpha-2 selectivity. Transdermal absolute bioavailability is approximately 60%, delivered at an approximately constant rate over seven days.',
        iconName: 'Brain',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It presses the brake on sympathetic outflow',
        laymanDesc:
          'On brainstem neurons that drive the sympathetic nervous system, it stimulates a receptor that turns those neurons down. Less signal leaves the brain.',
        molecularDetail:
          'The label states that clonidine stimulates alpha-adrenoreceptors in the brainstem, resulting in reduced sympathetic outflow from the central nervous system. Alpha-2A is the subtype responsible; alpha-2B on vascular smooth muscle acts in the opposite direction and explains transient pressor effects at high or rapid doses.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Heart rate, resistance and renin all fall',
        laymanDesc:
          'With less sympathetic drive, the heart slows, the vessels relax and the kidney releases less of the hormone that raises pressure.',
        molecularDetail:
          'Decreases in peripheral resistance, renal vascular resistance, heart rate and blood pressure, with renal blood flow and glomerular filtration rate essentially unchanged and normal postural reflexes intact. Plasma renin activity and the excretion of aldosterone and catecholamines are reduced.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'And the mechanism changes with time',
        laymanDesc:
          'In the first weeks the pressure falls mostly because the heart pumps less. Months later the heart output has returned to normal and the vessels are doing the work instead.',
        molecularDetail:
          'Acute studies show a 15% to 20% reduction in supine cardiac output with no change in peripheral resistance; during long-term therapy cardiac output tends to return to control values while peripheral resistance remains decreased. The label adds that tolerance to the antihypertensive effect may develop in some patients.',
        iconName: 'Repeat',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'Blood pressure comes down',
        laymanDesc:
          'That is the licensed effect and it is reliably achieved. What it prevents has never been measured for this drug.',
        molecularDetail:
          'The indication states: lowering blood pressure reduces the risk of fatal and nonfatal cardiovascular events, these benefits have been seen in controlled trials of antihypertensive drugs from a wide variety of pharmacologic classes, and there are no controlled trials demonstrating risk reduction with this drug.',
        iconName: 'Gauge',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Stop it suddenly and the brake releases',
        laymanDesc:
          'The suppressed sympathetic system rebounds. Blood pressure can surge, and the label records strokes and deaths from exactly that.',
        molecularDetail:
          'Sudden cessation has produced nervousness, agitation, headache, tremor and confusion with a rapid rise in blood pressure and elevated plasma catecholamines; rare instances of hypertensive encephalopathy, cerebrovascular accidents and death have been reported. Taper over two to four days, and withdraw any concurrent beta-blocker several days first.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'POISE-2 clonidine comparison (N Engl J Med 2014;370:1504-1513; NCT01082874)',
        phase: 'Phase 3, randomised, blinded, placebo-controlled, 2×2 factorial',
        sampleSize: 10010,
        primaryEndpoint:
          'Composite of death or nonfatal myocardial infarction at 30 days in patients with or at risk for atherosclerotic disease undergoing non-cardiac surgery, with clonidine 0.2 mg daily started just before surgery and continued to 72 hours after',
        endpointMet: false,
        statisticalPValue:
          '367 primary events on clonidine against 339 on placebo; hazard ratio 1.08 (95% CI 0.93 to 1.26), p=0.29. Myocardial infarction alone 6.6% against 5.9%, hazard ratio 1.11 (95% CI 0.95 to 1.30), p=0.18',
        unreportedAdverseSignals:
          'Clinically important hypotension occurred in 47.6% against 37.1%, hazard ratio 1.32 (95% CI 1.24 to 1.40), p<0.001. Nonfatal cardiac arrest occurred in 16 patients (0.3%) against 5 (0.1%), hazard ratio 3.20 (95% CI 1.17 to 8.73), p=0.02. The trial did not merely fail to show benefit; it measured harm on two prespecified safety outcomes.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'DASH — Dietary Approaches to Stop Hypertension (N Engl J Med 1997;336:1117-1124), cited as the comparator dietary intervention',
        phase: 'Randomised, controlled feeding trial',
        sampleSize: 459,
        primaryEndpoint:
          'Change in systolic and diastolic blood pressure over eight weeks on a combination diet rich in fruit, vegetables and low-fat dairy with reduced saturated and total fat, against a control diet, with sodium intake and body weight held constant',
        endpointMet: true,
        statisticalPValue:
          'Combination diet lowered systolic and diastolic pressure by 5.5 and 3.0 mmHg more than control (p<0.001 for each); among the 133 participants with hypertension, by 11.4 and 5.5 mmHg more (p<0.001 for each)',
        unreportedAdverseSignals:
          'This is a controlled feeding study in which all food was provided, over eight weeks, measuring blood pressure and not events. Adherence outside a feeding trial is a different question, and no dietary pattern trial has measured cardiovascular outcomes. It is included here because it is the best-measured non-drug comparator for the same surrogate endpoint clonidine is licensed on.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No reduction in death or nonfatal myocardial infarction at 30 days after non-cardiac surgery in 10,010 patients (POISE-2, HR 1.08, 95% CI 0.93 to 1.26, p=0.29)',
        'Clinically important hypotension 47.6% against 37.1% in the same trial (HR 1.32, p<0.001)',
        'Nonfatal cardiac arrest 0.3% against 0.1% in the same trial (HR 3.20, 95% CI 1.17 to 8.73, p=0.02)',
        'A 15% to 20% acute reduction in supine cardiac output, with peripheral resistance falling only during long-term therapy',
        'Transdermal absolute bioavailability of approximately 60%, with delivery at an approximately constant rate for seven days',
      ],
      unsupportedInferences: [
        'That clonidine reduces cardiovascular events — the label states there are no controlled trials demonstrating risk reduction with it',
        'That blunting the surgical sympathetic surge prevents perioperative infarction — plausible physiology, tested in 10,010 patients, and wrong',
        'That the antihypertensive effect is fully explained by central alpha-2 agonism, when the label says the relationship has not been fully elucidated',
        'That its widespread off-label uses carry the evidentiary standing of a licensed indication',
      ],
      whatFailedInitially: [
        'POISE-2: no benefit on the primary composite, with more hypotension and more cardiac arrests',
        'Tolerance to the antihypertensive effect develops in some patients, per the label',
        'Abrupt withdrawal has produced hypertensive encephalopathy, cerebrovascular accidents and death',
        'Half a century after approval the molecule still has no cardiovascular outcome trial of its own',
      ],
      realWorldOutcome: [
        'Approved for hypertension in the United States in 1974 and generic at about three cents a tablet across 95 listed products',
        'Displaced from first-line hypertension therapy by classes that have outcome trials, and retained mainly as a later-line or specific-situation agent',
        'Its extended-release form acquired an ADHD indication; its best-known use, opioid withdrawal, never acquired one',
        'Lofexidine, the same class licensed for opioid withdrawal in 2018, costs about 270 times as much per tablet',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, extended-release tablet, oral solution, transdermal patch applied weekly, and epidural injection',
      description:
        'The transdermal system delivers clonidine at an approximately constant rate for seven days with an absolute bioavailability of about 60%, which is what makes weekly application viable and also what makes an accidentally removed patch a withdrawal event. Oral forms are dosed two or three times daily in immediate-release form. The Javadin oral solution label directs continuing administration up to four hours before surgery and resuming promptly afterwards with close blood pressure monitoring — a schedule written around the rebound risk rather than around the pharmacokinetics.',
      safetyProfile:
        'Contraindicated in hypersensitivity to clonidine or any component. Labelled warnings cover bradycardia, cardiac conduction abnormalities and symptomatic hypotension, with slow titration directed in patients with syncope, heart block or vascular disease and avoidance of other drugs affecting sinus or atrioventricular node function; sedation and somnolence, with caution about driving and machinery; and rebound hypertension on abrupt discontinuation, tapered over two to four days. Sudden cessation has produced nervousness, agitation, headache, tremor and confusion with a rapid rise in blood pressure and elevated plasma catecholamines, and rare instances of hypertensive encephalopathy, cerebrovascular accidents and death have been reported. Where a beta-blocker is being taken concurrently, it should be withdrawn several days before the clonidine. Epidural clonidine carries a boxed warning against obstetrical, post-partum and peri-operative pain management on grounds of haemodynamic instability.',
    },
    commonQuestions: [
      {
        q: 'Does clonidine prevent strokes and heart attacks?',
        a: 'Unknown for this drug, and its label says so directly. The indication reads that lowering blood pressure reduces the risk of fatal and nonfatal cardiovascular events, that these benefits have been seen in controlled trials of antihypertensive drugs from a wide variety of pharmacologic classes, and then: "There are no controlled trials demonstrating risk reduction with JAVADIN." The benefit is borrowed from other classes. Thiazide-like diuretics, ACE inhibitors, angiotensin receptor blockers and calcium channel blockers all have their own randomised outcome trials; clonidine, fifty years after approval, has none. That is a reason it sits behind those classes in guidelines rather than a reason it does not work.',
        auditNote:
          'A label that names its own evidentiary gap is doing something unusual and useful. Most simply omit what was not shown.',
      },
      {
        q: 'Why is stopping it treated as more dangerous than starting it?',
        a: 'Because the drug works by holding the sympathetic nervous system down, and the system adapts to being held. Remove the drug abruptly and what has been suppressed comes back at once: the label describes nervousness, agitation, headache, tremor and confusion accompanied or followed by a rapid rise in blood pressure and raised plasma catecholamines, and records rare instances of hypertensive encephalopathy, cerebrovascular accidents and death. The direction is a gradual reduction over two to four days. There is one sequencing detail worth knowing if you take a beta-blocker as well: the label says to withdraw the beta-blocker several days before the clonidine, because stopping clonidine while a beta-blocker is still on board leaves the surge unopposed on the alpha side.',
      },
      {
        q: 'It was given before operations to protect the heart. What happened?',
        a: 'POISE-2 happened. The reasoning was good: surgery produces a large sympathetic surge, that surge is implicated in perioperative heart attacks, and clonidine blunts it centrally without the haemodynamic instability a beta-blocker causes. Ten thousand and ten patients across 23 countries were randomised to clonidine or placebo starting just before surgery. Death or nonfatal infarction at 30 days occurred in 367 clonidine patients against 339 on placebo, hazard ratio 1.08, p=0.29 — no benefit. Clinically important hypotension rose from 37.1% to 47.6%, p<0.001. Nonfatal cardiac arrest rose from 5 patients to 16, hazard ratio 3.20, p=0.02. Both halves of the rationale were wrong, and this is one of the cleaner examples in cardiology of a physiologically compelling idea that a large trial simply refuted.',
      },
      {
        q: 'Why is it used for ADHD and opioid withdrawal if it is a blood pressure drug?',
        a: 'Because the effect it has on blood pressure and the effects it has elsewhere come from the same action. Reducing central sympathetic outflow lowers pressure, and it also produces sedation, reduces the autonomic storm of opioid withdrawal — the sweating, agitation, tachycardia and cramping — and appears to help the hyperarousal component of ADHD. The regulatory positions differ sharply, though. Extended-release clonidine tablets carry a licensed ADHD indication as monotherapy or added to a stimulant. Opioid withdrawal never became a licensed indication for clonidine; lofexidine, an alpha-2 agonist of the same class, was approved for that in 2018 and costs about 270 times as much per tablet.',
      },
      {
        q: 'Is the drowsiness going to wear off?',
        a: 'Often it lessens, and it is worth knowing it is not a nuisance effect layered on top of the real one — it is the same mechanism. The drug reduces sympathetic outflow from the brainstem, and reduced arousal is what that feels like from the inside. The label carries sedation and somnolence as a formal warning with advice about driving and operating machinery. Separately, the label also notes that tolerance to the antihypertensive effect may develop in some patients, so a fading response is a recognised possibility rather than something to work around by taking more.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Devereaux PJ, Sessler DI, Leslie K, et al. Clonidine in patients undergoing noncardiac surgery (POISE-2). N Engl J Med 2014;370:1504-1513',
        identifier: '10.1056/NEJMoa1401106',
        kind: 'doi',
      },
      {
        label: 'POISE-2 registration record on ClinicalTrials.gov',
        identifier: 'NCT01082874',
        kind: 'nct',
      },
      {
        label:
          'Appel LJ, Moore TJ, Obarzanek E, et al. A clinical trial of the effects of dietary patterns on blood pressure (DASH). N Engl J Med 1997;336:1117-1124',
        identifier: '10.1056/NEJM199704173361601',
        kind: 'doi',
      },
      {
        label:
          'CATAPRES-TTS (clonidine) transdermal system United States prescribing information — Indications and Usage, Contraindications, Warnings (Withdrawal), Clinical Pharmacology (NDA 018891)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018891',
        kind: 'regulatory',
      },
      {
        label:
          'JAVADIN (clonidine hydrochloride) oral solution United States prescribing information — Indications 1, Warnings and Precautions 5.1 to 5.3 (NDA 220256)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=220256',
        kind: 'regulatory',
      },
      {
        label:
          'DURACLON (clonidine hydrochloride injection) United States prescribing information — boxed warning and Indications and Usage (NDA 020615)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020615',
        kind: 'regulatory',
      },
      {
        label:
          'LUCEMYRA (lofexidine) United States prescribing information — Indications 1 (NDA 209229)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=209229',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — clonidine at 95 listed generic products, with lofexidine and guanfacine medians from the same survey, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2803 — clonidine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2803',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Hydralazine — a 1953 vasodilator whose mechanism the label still calls not fully
  //     understood, which is contraindicated in coronary artery disease, causes a lupus-like
  //     illness that can outlast the drug by years, and is half of the first race-specific
  //     indication in American medicine.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'hydralazine',
    name: 'Hydralazine',
    tradeName: 'Apresoline / Dralzine; as a fixed combination with isosorbide dinitrate, BiDil',
    sponsor:
      'Originated at Ciba, now Novartis, as Apresoline; generic in the United States for decades under numerous ANDAs. The fixed-dose combination with isosorbide dinitrate is BiDil, NDA 020727',
    targetGene: 'NAT2',
    targetProtein:
      'No confirmed molecular target. The label states that the precise mechanism of action is not fully understood and attributes the effect to direct relaxation of vascular smooth muscle through interference with calcium movements. NAT2 is listed here because polymorphic N-acetylation is the best-characterised determinant of who gets a high plasma level and who gets the lupus reaction',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1953,
    indication:
      'Essential hypertension, alone or as an adjunct. The injectable form is indicated for severe essential hypertension when the drug cannot be given orally or when there is an urgent need to lower blood pressure. In the fixed combination with isosorbide dinitrate, treatment of heart failure as an adjunct to standard therapy in self-identified black patients',
    patientFriendlyIndication:
      'High blood pressure, including when it must be brought down urgently; and, combined with a nitrate, heart failure',
    anatomicalSite:
      'Arteriolar smooth muscle — hydralazine dilates the small arteries far more than the veins, which is why it raises cardiac output rather than dropping it',
    conditionContext: {
      conditionExplainer:
        'Blood pressure is set largely by the tone of the small arteries. Hydralazine relaxes them directly, by a mechanism nobody has fully pinned down, and the body responds by speeding the heart and retaining salt — which is why it is almost never given alone.',
      whyItMatters:
        'Hydralazine is three things at once and they sit oddly together. It is a seventy-year-old antihypertensive that no modern guideline puts near the front. It is half of the combination that produced one of the clearest mortality results in heart failure, and the first drug in the United States licensed for a single self-identified racial group. And it is the archetypal cause of drug-induced lupus, an illness that its own label warns can leave residua detectable many years after the drug is stopped.',
      whoTakesThis:
        'Adults with hypertension not controlled by other agents, patients needing urgent parenteral blood pressure reduction, and — in the fixed combination — black patients with heart failure. Not people with coronary artery disease or mitral valvular rheumatic heart disease, in whom it is contraindicated.',
      clinicalGoals:
        'A lower blood pressure, or, in the combination, survival in heart failure. The single agent has no cardiovascular outcome trial of its own.',
    },
    oneSentenceVerdict:
      'A direct arteriolar vasodilator whose label states after seventy years that "the precise mechanism of action of hydrALAZINE is not fully understood", which is contraindicated in coronary artery disease and "has been implicated in the production of myocardial infarction", whose lupus-like reaction can leave residua detectable many years after withdrawal — and which, paired with isosorbide dinitrate, cut all-cause mortality from 10.2% to 6.2% in A-HeFT and lost to enalapril in V-HeFT II (two-year mortality 25% against 18%, p=0.016).',
    laymanHowItWorks:
      'Hydralazine relaxes the muscle wrapped around small arteries, so those arteries widen and blood pressure falls. Exactly how it does this is still not settled; the prescribing information says only that it interferes with the calcium movements the muscle needs in order to contract. Because it opens arteries and barely touches veins, more blood reaches the heart than leaves it under pressure, so the heart speeds up and pumps harder in response, and the kidney reads the falling pressure as a signal to retain salt. Those two reflexes fight the drug, which is why it is usually combined with something that slows the heart and something that removes salt.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 54,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0356 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 69 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'On the United States market since 1953 and generic for most of that time at under four cents a tablet. The commercially interesting fact is what happened when it was combined with another very old generic: BiDil, hydralazine plus isosorbide dinitrate in one tablet, was approved in 2005 as a patented branded product with a race-specific indication, built from two molecules that had been in the public domain for half a century.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For ordinary hypertension every first-line class beats hydralazine on evidence and on tolerability, and hydralazine’s reflex tachycardia and salt retention mean it is rarely used alone anyway. Its two remaining strongholds are the heart failure combination and urgent parenteral blood pressure reduction — and in pregnancy, the setting where it was long the default, a meta-analysis found it worse than the alternatives on almost every outcome measured.',
      conventionalRx: [
        {
          name: 'ACE inhibitors — enalapril, lisinopril, ramipril',
          class: 'Angiotensin-converting enzyme inhibitors',
          howItCompares:
            'V-HeFT II compared them head to head in heart failure and enalapril won: two-year mortality 18% against 25% for hydralazine plus isosorbide dinitrate, p=0.016, with the advantage coming from fewer sudden deaths. In hypertension they have outcome trials that hydralazine has never had, and they do not provoke reflex tachycardia.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: a direct randomised win over this drug in heart failure; large outcome evidence; no compensatory tachycardia. Cons: cough, hyperkalaemia, contraindicated in pregnancy — which is precisely where hydralazine is still used.',
        },
        {
          name: 'Labetalol or nifedipine',
          class: 'Combined alpha/beta blocker; dihydropyridine calcium channel blocker',
          howItCompares:
            'The alternatives in severe hypertension of pregnancy. A meta-analysis of 21 randomised trials in 893 women found hydralazine associated with more maternal hypotension, more caesarean sections, more placental abruption, more maternal oliguria, more adverse fetal heart rate effects and more low one-minute Apgar scores, and concluded that the data do not support hydralazine as first-line treatment.',
          typicalCost:
            'US$0.1421 per tablet for labetalol at United States pharmacy acquisition cost (CMS NADAC, median across 86 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: better comparative outcomes in the pregnancy meta-analysis; no lupus signal. Cons: the meta-analysis authors describe their own results as not robust enough to guide practice and call for adequately powered trials.',
        },
        {
          name: 'Minoxidil',
          class: 'Direct arteriolar vasodilator, potassium channel opener',
          howItCompares:
            'The other direct arterial dilator, more potent and correspondingly harder to use: it causes the same reflex tachycardia and salt retention more severely, plus pericardial effusion and hypertrichosis, and is reserved for hypertension resistant to everything else. It has a defined molecular mechanism, which hydralazine does not.',
          typicalCost:
            'US$0.1658 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 15 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: works when nothing else does; mechanism understood. Cons: obligatory concurrent diuretic and beta-blocker; pericardial effusion; hair growth.',
        },
      ],
      naturalFoods: [
        {
          name: 'The DASH dietary pattern — fruit, vegetables and low-fat dairy, with reduced saturated and total fat',
          activeCompound:
            'No single compound; the effect is attributed to the combined potassium, magnesium, calcium and fibre content of the pattern',
          biologicalMechanism:
            'A whole-diet intervention tested as one, with sodium intake and body weight held constant so the reduction is attributable to the pattern rather than to salt restriction or weight loss. It is included here as the best-measured non-drug comparator on the same surrogate endpoint hydralazine is licensed on.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: in the DASH trial, 459 adults were fed a control diet for three weeks then randomised for eight weeks; the combination diet lowered systolic and diastolic pressure by 5.5 and 3.0 mmHg more than control (p<0.001 for each), and among the 133 participants with hypertension by 11.4 and 5.5 mmHg more (p<0.001 for each). Blood pressure, over eight weeks, in fed volunteers — not a cardiovascular outcome.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Joint pain, rash or fever is a reason to be seen, not to wait',
          action:
            'Report new joint pain, muscle aching, rash, fever or persistent fatigue while taking hydralazine.',
          patientImpact:
            'The label warns that in a few patients hydralazine may produce a clinical picture simulating systemic lupus erythematosus including glomerulonephritis, that symptoms usually regress when the drug is stopped but residua have been detected many years later, and that long-term treatment with steroids may be necessary.',
          clinicalPrecaution:
            'The label directs complete blood counts and antinuclear antibody titre determinations before and periodically during prolonged therapy even in asymptomatic patients, and states that a positive antinuclear antibody titre requires the physician to weigh the implications carefully against the benefit of continuing.',
        },
        {
          name: 'Pins and needles may need vitamin B6, not reassurance',
          action:
            'Report numbness, tingling or burning in the hands or feet rather than putting it down to age.',
          patientImpact:
            'The label records peripheral neuritis evidenced by paraesthesia, numbness and tingling, and states that published evidence suggests an antipyridoxine effect and that pyridoxine should be added to the regimen if symptoms develop. Hydralazine is a hydrazine, and hydrazines react with the aldehyde group of pyridoxal phosphate.',
          clinicalPrecaution:
            'This is a specific and correctable interaction rather than a general neuropathy, and it is on the label.',
        },
        {
          name: 'Mention any chest pain immediately',
          action: 'Report new or worsening chest pain, and say if you have known coronary disease.',
          patientImpact:
            'The label states that myocardial stimulation produced by hydralazine can cause anginal attacks and ECG changes of myocardial ischaemia, and that the drug has been implicated in the production of myocardial infarction. Coronary artery disease is a listed contraindication.',
          clinicalPrecaution:
            'Mitral valvular rheumatic heart disease is the other contraindication, and the label notes that the hyperdynamic circulation hydralazine produces may raise pulmonary artery pressure in mitral valve disease.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC=C2C(=C1)C=NN=C2NN',
      chemicalFormula: 'C8H8N4',
      molecularWeight: '160.18 g/mol',
      targetReceptorAffinity:
        'A hydrazinophthalazine — a phthalazine ring carrying a free hydrazine group, which is both the pharmacophore and the source of most of its trouble. The label states that although the precise mechanism of action is not fully understood, hydralazine apparently lowers blood pressure by direct relaxation of vascular smooth muscle, altering cellular calcium metabolism and interfering with the calcium movements responsible for initiating or maintaining the contractile state. Preferential dilatation of arterioles compared with veins minimises postural hypotension and promotes an increase in cardiac output, alongside increased heart rate and stroke volume. Plasma renin activity usually rises through reflex sympathetic discharge, generating angiotensin II, aldosterone stimulation and sodium reabsorption. Renal and cerebral blood flow are maintained or increased. Oral absorption is rapid with peak plasma levels at 1 to 2 hours and an apparent half-life of 3 to 7 hours. Hydralazine is subject to polymorphic acetylation: slow acetylators generally have higher plasma levels and require lower doses.',
      structureSource: {
        label:
          'PubChem CID 3637 (hydralazine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; mechanism, haemodynamics and acetylator pharmacokinetics from the hydralazine hydrochloride tablets United States prescribing information, Clinical Pharmacology',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3637',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'hyd-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Screen for hydrazone formation with the excipients themselves',
          description:
            'A free hydrazine group condenses with aldehydes and reducing sugars, so hydralazine forms hydrazones with excipients that are inert for almost every other drug — lactose being the classic case. The compatibility screen is therefore not a formality but a formulation constraint, and a tablet that assays correctly at release can lose content to its own filler on storage. The molecule also oxidises readily in solution, which is why the injection is a different stability problem from the tablet.',
          reagentsAndBuffer:
            'Hydralazine hydrochloride USP reference standard, reversed-phase HPLC with ultraviolet detection resolving hydralazine from hydralazine hydrazone adducts and phthalazinone, binary drug-excipient compatibility studies against lactose, mannitol and starch under accelerated conditions, oxygen-headspace-controlled stability for the injectable',
        },
        {
          id: 'hyd-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Displace chlorine from phthalazine with hydrazine',
          description:
            'The route is short: 1-chlorophthalazine, made from phthalazinone with a chlorinating agent, is displaced by hydrazine hydrate to give 1-hydrazinophthalazine, isolated as the hydrochloride. Two steps and no stereochemistry, which is why the drug is among the cheapest in the pharmacopoeia. The reagent, hydrazine, is also the impurity that has to be controlled to a genotoxic limit downstream.',
          dependsOnStepId: 'hyd-w1',
          reagentsAndBuffer:
            'Phthalazin-1(2H)-one, phosphorus oxychloride or thionyl chloride for chlorination, hydrazine hydrate in ethanol under reflux, hydrogen chloride for salt formation, nitrogen blanket throughout to limit oxidation',
        },
        {
          id: 'hyd-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Control residual hydrazine to a genotoxic limit',
          description:
            'Free hydrazine is a known genotoxic impurity and it is also the reagent used to make the drug, so the purification step and the safety specification are the same operation. Phthalazinone from incomplete reaction and the oxidative dimer are the other named related substances. Because hydrazine is small, volatile and poorly retained on ordinary reversed-phase columns, it needs a derivatisation method of its own rather than being read off the main impurity chromatogram.',
          dependsOnStepId: 'hyd-w2',
          reagentsAndBuffer:
            'Recrystallisation of the hydrochloride from aqueous ethanol, benzaldehyde or acetone derivatisation of residual hydrazine with GC-MS or LC-MS quantification at parts-per-million level, HPLC release testing against limits for phthalazinone and the dimer',
        },
        {
          id: 'hyd-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Show the arteriolar preference directly, because it drives the whole side-effect profile',
          description:
            'The label’s central haemodynamic claim is that hydralazine dilates arterioles preferentially over veins, and that this is why postural hypotension is uncommon and cardiac output rises. That is a testable statement rather than a description: run resistance arterioles and conduit veins from the same animal side by side and report the ratio. The reflex tachycardia, the rise in renin and the sodium retention that make hydralazine unusable as monotherapy all follow from that ratio, so an assay that measures relaxation in a single vessel type cannot predict the clinical picture.',
          dependsOnStepId: 'hyd-w3',
          reagentsAndBuffer:
            'Paired mesenteric resistance arterioles and saphenous vein segments on wire myographs, phenylephrine or endothelin precontraction, calcium-free and calcium-restored buffers to isolate the calcium-handling component, sodium nitroprusside as the venodilator-predominant reference, endothelium-denuded controls',
        },
        {
          id: 'hyd-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Stratify by acetylator genotype and screen for autoantibody induction',
          description:
            'Two of the drug’s defining clinical facts are pharmacogenetic and immunological, and both are measurable. The label states that slow acetylators generally have higher plasma levels and require lower doses, so a pharmacokinetic study that does not stratify by NAT2 genotype reports an average belonging to nobody. And the lupus-like syndrome is the reason for periodic antinuclear antibody testing on the label, so a preclinical programme that never looks for autoantibody induction is not testing the thing most likely to stop the drug.',
          dependsOnStepId: 'hyd-w4',
          reagentsAndBuffer:
            'NAT2-genotyped human hepatocytes and recombinant NAT2 rapid and slow variants with acetyl-coenzyme A, LC-MS/MS quantification of hydralazine and its acetylated metabolites, primary human T-cell cultures for DNA methylation assessment, antinuclear antibody immunofluorescence and anti-histone antibody ELISA as the immunological readouts',
        },
      ],
    },
    keyAudits: [
      {
        id: 'hyd-a1',
        category: 'failed',
        title: 'It causes a lupus-like illness that can outlast the drug by years',
        laymanSummary:
          'Hydralazine can produce something that looks like systemic lupus, including kidney inflammation. Stopping usually helps, but the label says traces have been found many years later and steroids may be needed long term.',
        technicalDetails:
          'The Warnings section reads: "In a few patients hydrALAZINE may produce a clinical picture simulating systemic lupus erythematosus including glomerulonephritis. In such patients hydrALAZINE should be discontinued unless the benefit-to-risk determination requires continued antihypertensive therapy with this drug. Symptoms and signs usually regress when the drug is discontinued but residua have been detected many years later. Long-term treatment with steroids may be necessary." The Precautions section adds that complete blood counts and antinuclear antibody titre determinations are indicated before and periodically during prolonged therapy even though the patient is asymptomatic, and that a positive titre requires the physician to weigh the results carefully against the benefits of continuing. Two label facts connect to make this predictable rather than random: hydralazine is subject to polymorphic acetylation, and slow acetylators generally have higher plasma levels and require lower doses. The people who accumulate the drug are the people most likely to develop the syndrome. Very few antihypertensives require routine autoantibody surveillance in patients with no symptoms; this one does.',
        evidenceSource:
          'Hydralazine hydrochloride tablets United States prescribing information, Warnings, Precautions (Laboratory Tests) and Clinical Pharmacology',
        measuredMetric:
          'Labelled drug-induced lupus warning including glomerulonephritis and persistence of residua, with the accompanying antinuclear antibody monitoring requirement',
        auditFlag: 'caution',
      },
      {
        id: 'hyd-a2',
        category: 'failed',
        title: 'A cardiovascular drug contraindicated in coronary artery disease',
        laymanSummary:
          'Hydralazine is contraindicated in coronary artery disease, and the label states the drug has been implicated in causing heart attacks. That is an unusual sentence to find on a blood pressure medicine.',
        technicalDetails:
          'The Contraindications section lists hypersensitivity to hydralazine, coronary artery disease, and mitral valvular rheumatic heart disease. The Precautions section explains why: "Myocardial stimulation produced by hydrALAZINE can cause anginal attacks and ECG changes of myocardial ischemia. The drug has been implicated in the production of myocardial infarction. It must, therefore, be used with caution in patients with suspected coronary artery disease." The mechanism is the drug’s own haemodynamic signature. It dilates arterioles far more than veins, so blood pressure falls while cardiac output, stroke volume and heart rate all rise — the label’s own word for the resulting state is "hyperdynamic". A faster, harder-working heart in a narrowed coronary bed is precisely the physiology of demand ischaemia. The same hyperdynamic response is why the label warns it may raise pulmonary artery pressure in mitral valve disease.',
        evidenceSource:
          'Hydralazine hydrochloride tablets United States prescribing information, Contraindications, Precautions (General) and Clinical Pharmacology',
        measuredMetric:
          'Labelled contraindications and the stated haemodynamic mechanism producing angina, ischaemic ECG change and reported infarction',
        auditFlag: 'caution',
      },
      {
        id: 'hyd-a3',
        category: 'measured',
        title: 'A-HeFT: with a nitrate, a 43% reduction in death',
        laymanSummary:
          'Paired with isosorbide dinitrate in a single tablet and given to a thousand black patients with advanced heart failure, hydralazine helped cut deaths from about ten per cent to about six, and the trial was stopped early.',
        technicalDetails:
          'A-HeFT randomised 1,050 black patients with NYHA class III or IV heart failure and dilated ventricles to a fixed dose of isosorbide dinitrate plus hydralazine or placebo on top of standard therapy including neurohormonal blockers. The trial was terminated early because mortality was significantly higher on placebo: 10.2% against 6.2%, p=0.02, a hazard ratio of 0.57 for death from any cause (p=0.01). First hospitalisation for heart failure fell from 22.4% to 16.4%, p=0.001, and quality of life improved (p=0.02). This is a placebo-controlled mortality result on top of modern background therapy and it is the strongest evidence hydralazine has ever produced. It is worth being precise about what it establishes: the trial tested the combination, not hydralazine alone, and it enrolled only black patients, so it cannot say which molecule carries the effect or whether the effect is confined to the group studied.',
        evidenceSource:
          'Taylor AL, Ziesche S, Yancy C, et al. N Engl J Med 2004;351:2049-2057 (A-HeFT)',
        doi: '10.1056/NEJMoa042934',
        measuredMetric:
          'All-cause mortality and heart failure hospitalisation in 1,050 black patients with advanced heart failure',
        auditFlag: 'verified',
      },
      {
        id: 'hyd-a4',
        category: 'failed',
        title: 'V-HeFT II: it lost to an ACE inhibitor, and the race split came afterwards',
        laymanSummary:
          'Compared head to head against enalapril in eight hundred men with heart failure, the hydralazine-nitrate combination was worse: 25% died within two years against 18% on enalapril.',
        technicalDetails:
          'V-HeFT II randomised 804 men on digoxin and diuretics to enalapril 20 mg daily or hydralazine 300 mg plus isosorbide dinitrate 160 mg daily. Two-year mortality was 18% on enalapril against 25% on the combination, p=0.016, a 28% relative reduction favouring enalapril, with overall mortality also tending lower (p=0.08). The advantage came from fewer sudden deaths and was more prominent in less symptomatic patients. The combination was not useless — peak exercise oxygen consumption increased only in that arm (p<0.05) and ejection fraction rose more in the first 13 weeks — but on the endpoint that matters it lost. The BiDil label then reports that retrospective analysis located the enalapril advantage in the 574 white participants, with essentially no difference among the 215 black participants, and states that this, together with a similar retrospective finding in V-HeFT I, is the basis on which a third trial was conducted among black patients. So the racial restriction on the modern indication traces back to subgroup analyses of a trial the combination lost overall.',
        evidenceSource:
          'Cohn JN, Johnson G, Ziesche S, et al. N Engl J Med 1991;325:303-310 (V-HeFT II); BiDil United States prescribing information, section 14 (NDA 020727)',
        doi: '10.1056/NEJM199108013250502',
        measuredMetric:
          'Two-year mortality with hydralazine plus isosorbide dinitrate against enalapril in 804 men with chronic heart failure',
        auditFlag: 'caution',
      },
      {
        id: 'hyd-a5',
        category: 'conclusion_shift',
        title:
          'In severe hypertension of pregnancy, the default drug came off worse than the alternatives',
        laymanSummary:
          'Hydralazine was for decades the standard injection for dangerously high blood pressure in pregnancy. A meta-analysis of twenty-one randomised trials found more low blood pressure, more caesareans, more placental separation and worse newborn scores compared with the alternatives.',
        technicalDetails:
          'Magee and colleagues pooled 21 randomised trials in 893 women comparing hydralazine with other short-acting antihypertensives for severe hypertension in pregnancy — eight against nifedipine, five against labetalol. Hydralazine was associated with more maternal hypotension (relative risk 3.29, 95% CI 1.50 to 7.23, 13 trials); more caesarean sections (1.30, 1.08 to 1.59, 14 trials); more placental abruption (4.17, 1.19 to 14.28, five trials); more maternal oliguria (4.00, 1.22 to 12.50, three trials); more adverse effects on fetal heart rate (2.04, 1.32 to 3.16, 12 trials); more low one-minute Apgar scores (2.70, 1.27 to 5.88, three trials); and more maternal side effects (1.50, 1.16 to 1.94, 12 trials). Against labetalol there was a trend towards less persistent severe hypertension and less neonatal bradycardia. The authors are careful and their caution belongs in the record: the results are not robust enough to guide clinical practice, there was significant heterogeneity and differences in methodological quality, and adequately powered trials are needed. What they do say is that the data do not support hydralazine as first-line treatment for severe hypertension in pregnancy — a conclusion about the drug’s longest-standing role, drawn from its own comparative trials.',
        evidenceSource:
          'Magee LA, Cham C, Waterman EJ, Ohlsson A, von Dadelszen P. BMJ 2003;327:955-960',
        doi: '10.1136/bmj.327.7421.955',
        measuredMetric:
          'Pooled relative risks for maternal and fetal outcomes with hydralazine against other short-acting antihypertensives across 21 randomised trials in 893 women',
        auditFlag: 'contested',
      },
      {
        id: 'hyd-a6',
        category: 'inferred',
        title: 'Seventy years on, the mechanism is still not fully understood',
        laymanSummary:
          'The prescribing information opens its pharmacology section by saying the precise mechanism of action is not fully understood, and then offers a description of what happens rather than an explanation of why.',
        technicalDetails:
          'The Clinical Pharmacology section begins: "Although the precise mechanism of action of hydrALAZINE is not fully understood, the major effects are on the cardiovascular system. HydrALAZINE apparently lowers blood pressure by exerting a peripheral vasodilating effect through a direct relaxation of vascular smooth muscle. HydrALAZINE, by altering cellular calcium metabolism, interferes with the calcium movements within the vascular smooth muscle that are responsible for initiating or maintaining the contractile state." Note the two hedges — "apparently" and "not fully understood" — and note that no receptor, channel or enzyme is named. This matters practically rather than academically. Without a molecular target there is no rational way to separate the wanted arteriolar dilatation from the unwanted hyperdynamic response, no structural handle for making a better version, and no mechanistic account of why a hydrazine group produces both vasodilatation and an autoimmune syndrome. The drug has been prescribed since 1953 and remains, in mechanistic terms, a description.',
        evidenceSource:
          'Hydralazine hydrochloride tablets United States prescribing information, Clinical Pharmacology',
        inferredClaim:
          'That hydralazine’s vasodilator action is understood well enough to attribute to a defined molecular target, when the label names none and calls the precise mechanism not fully understood',
        auditFlag: 'contested',
      },
      {
        id: 'hyd-a7',
        category: 'measured',
        title: 'The body fights the drug, which is why it is almost never given alone',
        laymanSummary:
          'Opening the arteries makes the heart speed up and the kidney hold on to salt. Both reflexes push the blood pressure back up, so hydralazine is normally paired with a drug that slows the heart and a drug that removes salt.',
        technicalDetails:
          'The label documents the compensatory cascade in sequence. Peripheral vasodilatation decreases arterial pressure — diastolic more than systolic — and peripheral vascular resistance, while increasing heart rate, stroke volume and cardiac output. Preferential dilatation of arterioles compared with veins minimises postural hypotension and promotes the rise in cardiac output. Plasma renin activity usually increases, presumed to follow from increased renin secretion by juxtaglomerular cells in response to reflex sympathetic discharge; the resulting angiotensin II stimulates aldosterone and consequent sodium reabsorption. So the drug provokes both arms of the response that modern antihypertensive therapy is designed to block. The clinical consequence is that hydralazine monotherapy tends to lose effect, and that its practical use is as a third agent alongside a beta-blocker and a diuretic — or, in heart failure, alongside a nitrate that supplies the venodilatation hydralazine does not.',
        evidenceSource:
          'Hydralazine hydrochloride tablets United States prescribing information, Clinical Pharmacology',
        measuredMetric:
          'Labelled haemodynamic and neurohormonal response to hydralazine: cardiac output, heart rate, plasma renin activity, aldosterone and sodium reabsorption',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A phthalazine with a hydrazine group hanging off it',
        laymanDesc:
          'The molecule is small and simple, and the reactive hydrazine group on it is both the reason it works and the reason it causes trouble.',
        molecularDetail:
          'A 1-hydrazinophthalazine. The free hydrazine condenses with aldehydes, which explains both the pyridoxal phosphate interaction behind its peripheral neuritis and the excipient incompatibilities that constrain its formulation. Oral absorption is rapid with peak levels at 1 to 2 hours and an apparent half-life of 3 to 7 hours.',
        iconName: 'Layers',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'How fast you acetylate decides your dose',
        laymanDesc:
          'The body disposes of hydralazine by tagging it with an acetyl group, and people do that at very different speeds. Slow acetylators end up with more drug from the same tablet.',
        molecularDetail:
          'The label states that hydralazine is subject to polymorphic acetylation and that slow acetylators generally have higher plasma levels and require lower doses to maintain control of blood pressure. NAT2 genotype is the determinant, and slow acetylation is also the best-established risk factor for the lupus-like syndrome.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It relaxes arteriolar muscle, by a route nobody has pinned down',
        laymanDesc:
          'It makes the muscle around small arteries let go. The prescribing information says the precise mechanism is not fully understood and points vaguely at calcium handling.',
        molecularDetail:
          'The label states that hydralazine apparently lowers blood pressure by direct relaxation of vascular smooth muscle, and that by altering cellular calcium metabolism it interferes with the calcium movements responsible for initiating or maintaining the contractile state. No receptor, channel or enzyme is named.',
        iconName: 'HelpCircle',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Arteries open, veins do not, and output rises',
        laymanDesc:
          'Because it opens arteries and leaves veins alone, blood pressure falls without the dizziness on standing that other vasodilators cause — but the heart ends up pumping more.',
        molecularDetail:
          'Decreased arterial pressure, diastolic more than systolic, and decreased peripheral vascular resistance, with increased heart rate, stroke volume and cardiac output. Preferential arteriolar dilatation minimises postural hypotension and promotes the rise in output. Renal and cerebral blood flow are maintained or increased.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The reflexes push back',
        laymanDesc:
          'The heart speeds up and the kidney retains salt, both of which raise the pressure again. That is why the drug is given with a beta-blocker and a diuretic, or with a nitrate.',
        molecularDetail:
          'Plasma renin activity usually rises through reflex sympathetic discharge, generating angiotensin II, aldosterone stimulation and sodium reabsorption. The label describes the resulting state as a hyperdynamic circulation, and warns it can accentuate specific cardiovascular inadequacies.',
        iconName: 'Repeat',
        visualStage: 'cellular_entry',
      },
      {
        step: 6,
        title: 'With a nitrate, fewer deaths in heart failure',
        laymanDesc:
          'Paired with isosorbide dinitrate, which supplies the vein dilatation hydralazine does not, it produced one of the clearest survival results in heart failure.',
        molecularDetail:
          'A-HeFT: all-cause mortality 6.2% against 10.2%, p=0.02, hazard ratio 0.57 (p=0.01); heart failure hospitalisation 16.4% against 22.4%, p=0.001, in 1,050 patients on standard therapy including neurohormonal blockers, with the trial stopped early. V-HeFT II, by contrast, found the same combination inferior to enalapril: two-year mortality 25% against 18%, p=0.016.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'A-HeFT — African-American Heart Failure Trial (N Engl J Med 2004;351:2049-2057)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 1050,
        primaryEndpoint:
          'Weighted composite of death from any cause, first hospitalisation for heart failure and change in quality of life, in black patients with NYHA class III or IV heart failure and dilated ventricles, on top of standard therapy',
        endpointMet: true,
        statisticalPValue:
          'Composite −0.1 ± 1.9 against −0.5 ± 2.0, p=0.01; all-cause mortality 6.2% against 10.2%, p=0.02 (hazard ratio 0.57, p=0.01); first heart failure hospitalisation 16.4% against 22.4%, p=0.001',
        unreportedAdverseSignals:
          'The trial tested the fixed combination and cannot attribute the effect to hydralazine alone. It was stopped early for the mortality difference, which tends to overstate effect size. It enrolled only black patients and therefore cannot establish that the benefit is specific to that group. The BiDil label notes little experience in NYHA class IV.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'V-HeFT II (N Engl J Med 1991;325:303-310)',
        phase: 'Phase 3, randomised, double-blind, active-controlled',
        sampleSize: 804,
        primaryEndpoint:
          'Mortality with hydralazine 300 mg plus isosorbide dinitrate 160 mg daily against enalapril 20 mg daily, in men with chronic congestive heart failure on digoxin and diuretics',
        endpointMet: false,
        statisticalPValue:
          'Two-year mortality 25% on hydralazine plus isosorbide dinitrate against 18% on enalapril, p=0.016 — a 28% reduction favouring enalapril; overall mortality tended lower on enalapril at p=0.08',
        unreportedAdverseSignals:
          'The combination arm did better on two physiological measures: peak exercise oxygen consumption increased only in that arm (p<0.05) and ejection fraction rose more during the first 13 weeks. The enalapril advantage came from fewer sudden deaths and was more prominent in less symptomatic patients. The BiDil label reports that retrospective analysis placed the enalapril advantage in the 574 white participants with essentially no difference among the 215 black participants — a post-hoc subgroup that became the basis for a race-specific indication.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Magee LA et al., meta-analysis of hydralazine for severe hypertension in pregnancy (BMJ 2003;327:955-960)',
        phase: 'Meta-analysis of 21 randomised controlled trials published 1966 to September 2002',
        sampleSize: 893,
        primaryEndpoint:
          'Maternal and perinatal outcomes with hydralazine against other short-acting antihypertensives — principally nifedipine and labetalol — for severe hypertension in pregnancy',
        endpointMet: false,
        statisticalPValue:
          'Hydralazine associated with more maternal hypotension (RR 3.29, 95% CI 1.50 to 7.23), more caesarean sections (1.30, 1.08 to 1.59), more placental abruption (4.17, 1.19 to 14.28), more maternal oliguria (4.00, 1.22 to 12.50), more adverse fetal heart rate effects (2.04, 1.32 to 3.16) and more low one-minute Apgar scores (2.70, 1.27 to 5.88)',
        unreportedAdverseSignals:
          'The authors state their results are not robust enough to guide clinical practice, report significant heterogeneity between trials and differences in methodological quality, and call for adequately powered trials with labetalol and nifedipine described as showing the most promise. Hydralazine showed a trend towards less persistent severe hypertension than labetalol and less neonatal bradycardia. This is a synthesis of small trials, not a single adequately powered comparison.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'All-cause mortality 6.2% against 10.2% with the fixed hydralazine-nitrate combination in 1,050 black patients with advanced heart failure (A-HeFT, p=0.02)',
        'Two-year mortality 25% on hydralazine plus isosorbide dinitrate against 18% on enalapril in 804 men (V-HeFT II, p=0.016)',
        'Pooled relative risks against other short-acting antihypertensives in pregnancy: maternal hypotension 3.29, placental abruption 4.17, caesarean section 1.30, low one-minute Apgar 2.70',
        'Increased heart rate, stroke volume, cardiac output and plasma renin activity following arteriolar dilatation, per the label',
        'Higher plasma levels and lower dose requirement in slow acetylators, per the label',
      ],
      unsupportedInferences: [
        'That hydralazine alone carries the A-HeFT survival benefit, when the trial tested a fixed combination with a nitrate',
        'That the benefit is specific to self-identified black patients, an inference from retrospective subgroups of 128 and 215 participants in trials the combination did not win overall',
        'That the vasodilator mechanism is understood, when the label names no molecular target and calls the precise mechanism not fully understood',
        'That hydralazine is the appropriate first choice for severe hypertension in pregnancy, which its own comparative meta-analysis does not support',
      ],
      whatFailedInitially: [
        'V-HeFT II: the combination was inferior to enalapril on two-year mortality',
        'The pregnancy meta-analysis found worse maternal and fetal outcomes on almost every measure examined',
        'Monotherapy is undermined by the drug’s own reflex tachycardia, renin rise and sodium retention',
        'Coronary artery disease and mitral valvular rheumatic heart disease are contraindications, and the label states the drug has been implicated in causing myocardial infarction',
        'Drug-induced lupus with glomerulonephritis, whose residua the label says have been detected many years after discontinuation',
      ],
      realWorldOutcome: [
        'On the United States market since 1953, generic at under four cents a tablet across 69 listed products',
        'Absent from first-line hypertension therapy and retained as a later-line agent, a parenteral option for urgent reduction, and half of a heart failure combination',
        'Combined with isosorbide dinitrate as BiDil, it became half of the first race-specific indication approved in the United States',
        'One of very few antihypertensives requiring periodic antinuclear antibody testing in asymptomatic patients on prolonged therapy',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, and intramuscular or intravenous injection for urgent reduction of severe hypertension; also available as a fixed-dose oral combination with isosorbide dinitrate',
      description:
        'Rapidly absorbed after oral administration with peak plasma levels at 1 to 2 hours and an apparent plasma half-life of 3 to 7 hours. Clearance runs through polymorphic N-acetylation, so slow acetylators generally reach higher plasma levels and require lower doses — the same tablet is a materially different exposure in different people. The injectable route exists because the drug is one of the few antihypertensives that can be given parenterally to bring a dangerously high pressure down quickly, which is the setting in which its comparative record against labetalol and nifedipine has been questioned.',
      safetyProfile:
        'Contraindicated in hypersensitivity to hydralazine, in coronary artery disease, and in mitral valvular rheumatic heart disease. It may produce a clinical picture simulating systemic lupus erythematosus including glomerulonephritis; symptoms usually regress on discontinuation but residua have been detected many years later and long-term steroid treatment may be necessary. Complete blood counts and antinuclear antibody titres are indicated before and periodically during prolonged therapy even in asymptomatic patients. Myocardial stimulation can cause anginal attacks and ischaemic ECG changes, and the drug has been implicated in the production of myocardial infarction. The hyperdynamic circulation it produces may raise pulmonary artery pressure in mitral valve disease and may accentuate other cardiovascular inadequacies. Postural hypotension can occur but is less common than with ganglionic blockers. Caution is directed in cerebrovascular accident and in advanced renal damage. Peripheral neuritis with paraesthesia, numbness and tingling has been observed, attributed to an antipyridoxine effect, and the label directs adding pyridoxine if symptoms develop.',
    },
    commonQuestions: [
      {
        q: 'Why do I need blood tests for lupus when I feel fine?',
        a: 'Because hydralazine is the classic cause of drug-induced lupus, and the label directs the testing regardless of symptoms. It states that in a few patients hydralazine may produce a clinical picture simulating systemic lupus erythematosus including glomerulonephritis, that symptoms usually regress when the drug is stopped but that residua have been detected many years later, and that long-term steroid treatment may be necessary. The Precautions section directs complete blood counts and antinuclear antibody titres before and periodically during prolonged therapy even in asymptomatic patients. Risk is not evenly spread: the drug is cleared by acetylation, and the label notes that slow acetylators reach higher plasma levels on the same dose — so the people who accumulate the most drug are the people most likely to develop the reaction.',
        auditNote:
          'Routine autoantibody surveillance in a symptom-free patient is an unusual requirement for a blood pressure drug, and it is the clearest signal of how seriously the label takes this reaction.',
      },
      {
        q: 'How does it actually work?',
        a: 'Nobody is entirely sure, and the label says so in its first sentence on the subject: "Although the precise mechanism of action of hydrALAZINE is not fully understood…" It then says the drug apparently lowers blood pressure by directly relaxing vascular smooth muscle and, by altering cellular calcium metabolism, interferes with the calcium movements that initiate or maintain contraction. No receptor, channel or enzyme is named. This is a genuine gap rather than a labelling formality: without a target there is no rational route to separating the wanted arteriolar dilatation from the unwanted rise in heart rate and cardiac output, and no mechanistic explanation for why a molecule that relaxes arteries also provokes an autoimmune syndrome.',
      },
      {
        q: 'Why is it prescribed alongside other blood pressure drugs rather than on its own?',
        a: 'Because taken alone it triggers the body’s own defences against a falling pressure. Hydralazine dilates arterioles far more than veins, so pressure and resistance fall while heart rate, stroke volume and cardiac output all rise — the label calls the result a hyperdynamic circulation. At the same time the kidney reads the falling pressure as a reason to release renin, which generates angiotensin II, which stimulates aldosterone, which makes the body retain sodium. So the drug provokes both the sympathetic and the renin-angiotensin responses that modern antihypertensive therapy exists to block. In practice it is used with something that slows the heart and something that removes salt, or — in heart failure — with a nitrate that supplies the venous dilatation it does not.',
      },
      {
        q: 'Why is a blood pressure drug contraindicated in heart disease?',
        a: 'Because of that same hyperdynamic response. The label lists coronary artery disease as a contraindication, and the Precautions section explains: myocardial stimulation produced by hydralazine can cause anginal attacks and ECG changes of myocardial ischaemia, and the drug has been implicated in the production of myocardial infarction. A heart that is beating faster and contracting harder needs more oxygen, and in a narrowed coronary artery that demand cannot be met. Mitral valvular rheumatic heart disease is the other contraindication, because the raised cardiac output can drive pulmonary artery pressure up.',
      },
      {
        q: 'Why is the combination product licensed only for black patients?',
        a: 'It is the first race-specific indication approved in the United States and the reasoning is documented on the BiDil label itself. A-HeFT randomised 1,050 black patients with advanced heart failure and found mortality of 6.2% against 10.2% on placebo, p=0.02 — a strong result, but in a trial that enrolled only black patients and therefore could not compare across groups. The restriction came from earlier work: V-HeFT I showed no significant overall mortality difference, with the favourable trend attributed on retrospective analysis to 128 black participants; V-HeFT II showed the combination inferior to enalapril overall, with retrospective analysis placing that inferiority among the 574 white participants and essentially no difference among the 215 black participants. So the population restriction rests on post-hoc subgroups from two older trials, one of which the combination lost. The trial result in black patients is well measured. The claim that the benefit stops at a racial boundary has never been tested directly.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Taylor AL, Ziesche S, Yancy C, et al. Combination of isosorbide dinitrate and hydralazine in blacks with heart failure (A-HeFT). N Engl J Med 2004;351:2049-2057',
        identifier: '10.1056/NEJMoa042934',
        kind: 'doi',
      },
      {
        label:
          'Cohn JN, Johnson G, Ziesche S, et al. A comparison of enalapril with hydralazine-isosorbide dinitrate in the treatment of chronic congestive heart failure (V-HeFT II). N Engl J Med 1991;325:303-310',
        identifier: '10.1056/NEJM199108013250502',
        kind: 'doi',
      },
      {
        label:
          'Cohn JN, Archibald DG, Ziesche S, et al. Effect of vasodilator therapy on mortality in chronic congestive heart failure (V-HeFT I). N Engl J Med 1986;314:1547-1552',
        identifier: '10.1056/NEJM198606123142404',
        kind: 'doi',
      },
      {
        label:
          'Magee LA, Cham C, Waterman EJ, Ohlsson A, von Dadelszen P. Hydralazine for treatment of severe hypertension in pregnancy: meta-analysis. BMJ 2003;327:955-960',
        identifier: '10.1136/bmj.327.7421.955',
        kind: 'doi',
      },
      {
        label:
          'Appel LJ, Moore TJ, Obarzanek E, et al. A clinical trial of the effects of dietary patterns on blood pressure (DASH). N Engl J Med 1997;336:1117-1124',
        identifier: '10.1056/NEJM199704173361601',
        kind: 'doi',
      },
      {
        label:
          'Hydralazine hydrochloride tablets United States prescribing information — Indications and Usage, Contraindications, Warnings, Precautions (General, Laboratory Tests) and Clinical Pharmacology',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=hydralazine',
        kind: 'regulatory',
      },
      {
        label:
          'BiDil (isosorbide dinitrate and hydralazine hydrochloride) United States prescribing information — Indications 1.1 and Clinical Studies 14 (NDA 020727)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020727',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — hydralazine at 69 listed generic products, with labetalol and minoxidil medians from the same survey, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 3637 — hydralazine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3637',
        kind: 'url',
      },
    ],
  },
]
