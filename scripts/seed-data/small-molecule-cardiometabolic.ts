import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the small molecules of cardiometabolic medicine.
 *
 * These are the most-prescribed drugs on earth. Metformin, atorvastatin, lisinopril, amlodipine and
 * levothyroxine each account for tens of millions of prescriptions a year in the United States
 * alone, so these pages will be the most-read on this site and are the ones a reader is most likely
 * to arrive at with a claim they heard somewhere else. Every DOI, PMID, NCT number and Drugs@FDA
 * application number below was resolved against Crossref, PubMed, the ClinicalTrials.gov v2 API or
 * the openFDA Drugs@FDA endpoint at the time of writing. Effect sizes, arm sizes, hazard ratios,
 * confidence intervals and p-values are copied from the published abstract or the label, never from
 * memory. Where a number could not be sourced, the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. NO PRICING BLOCK, ANYWHERE. `SeedPricing` requires a synthesis cost per dose together with a
 *    citable source. The published cost-of-production literature for small molecules — Hill, Barber
 *    and Gotham in BMJ Global Health, Barber and colleagues in JAMA Network Open — reports aggregate
 *    ranges or holds per-drug figures in supplementary appendices this file could not verify line by
 *    line, and none of the drugs here has a per-dose synthesis cost that can be quoted and cited.
 *    So no dossier carries `pricing`. United States pharmacy acquisition costs, which are a price
 *    and emphatically not a cost of manufacture, appear inside `substitutes` where the CMS National
 *    Average Drug Acquisition Cost file publishes them. Unless a line says otherwise, every NADAC
 *    figure here is the value effective 17 December 2025, which is the same file the other seed
 *    groups quote. A missing cost beats a manufactured one.
 *
 * 2. THE SMILES STRINGS ARE PUBCHEM CANONICAL SMILES, PASTED, NOT RETYPED. Each was pulled from the
 *    PubChem PUG REST `SMILES` property for the named CID and then put through this repository's own
 *    connection-table parser; all twenty-four passed the deterministic sweep before a line of prose
 *    was written. Warfarin carries the racemate, because that is what is dispensed and what PubChem
 *    returns for the name; the dossier says so and says which enantiomer does the work.
 *
 * 3. EVERY DOSSIER SEPARATES THE MEASURED SURROGATE FROM THE INFERRED OUTCOME. This class of drug is
 *    where that distinction earns its keep. A statin trial measures LDL cholesterol and counts heart
 *    attacks; a DPP-4 inhibitor trial measures HbA1c and counts nothing else; resmetirom was
 *    approved on a liver biopsy score with no outcome trial reported. Which of those a page is
 *    describing is stated in as many words.
 *
 * 4. THE AUDIT POINTS ARE NOT A HIGHLIGHT REEL. Every dossier carries at least one 'inferred' or
 *    'failed' entry, because every drug here has one: metformin's longevity case rests on a trial
 *    that has never enrolled a participant, atorvastatin missed its primary endpoint in ASPEN,
 *    rosuvastatin failed three times over in heart failure and dialysis, lisinopril lost to a
 *    diuretic in ALLHAT, metoprolol killed people in POISE, empagliflozin missed in EMPACT-MI,
 *    dapagliflozin missed MACE in DECLARE, sitagliptin has never reduced a cardiovascular event, and
 *    genotype-guided warfarin dosing did not beat a clinical algorithm.
 *
 * 5. NO DOSING, TITRATION OR PROCUREMENT GUIDANCE. Strengths appear only where they are part of a
 *    trial's description or a label's identity. Nothing here tells a reader what to take.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) 2026 file, prices effective 17 December 2025',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

export const SMALL_MOLECULE_CARDIOMETABOLIC_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Metformin — the master reference's own worked example, rebuilt from primary sources.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'metformin',
    name: 'Metformin',
    tradeName: 'Glucophage',
    sponsor: 'Bristol-Myers Squibb (originator); now off-patent and made by hundreds of manufacturers',
    targetGene: 'PRKAA1',
    targetProtein:
      'AMP-activated protein kinase catalytic subunit alpha-1, downstream of mitochondrial respiratory complex I',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1995,
    indication:
      'Adjunct to diet and exercise to improve glycaemic control in adults and children aged 10 and older with type 2 diabetes mellitus',
    patientFriendlyIndication: 'Type 2 diabetes, and blood sugar that is too high',
    anatomicalSite: 'Hepatocyte mitochondria and cytoplasm (liver)',
    conditionContext: {
      conditionExplainer:
        'In type 2 diabetes the liver keeps releasing stored sugar into the blood as though the body were starving, while muscle and fat cells respond poorly to the insulin that is meant to tell them to take that sugar up. Blood glucose stays high between meals as well as after them.',
      whyItMatters:
        'Sustained high glucose damages small blood vessels, which is how diabetes causes blindness, kidney failure and nerve damage. Whether a given drug prevents those outcomes is a separate question from whether it lowers the number, and the two have come apart repeatedly in this field.',
      whoTakesThis:
        'First-line drug therapy for type 2 diabetes in essentially every major guideline, and widely used off-label in polycystic ovary syndrome. It is on the WHO Model List of Essential Medicines.',
      clinicalGoals:
        'Lower fasting and post-meal glucose, and in UKPDS 34 reduce diabetes-related endpoints and all-cause mortality in overweight patients — the one hard-outcome result the drug actually owns.',
    },
    oneSentenceVerdict:
      'A 1950s biguanide that suppresses the liver\'s own glucose production, and the only glucose-lowering drug with a randomised all-cause mortality reduction in overweight type 2 diabetes — 36% in 753 patients in UKPDS 34, a result that has never been repeated and is routinely stretched into a longevity claim no trial has tested.',
    laymanHowItWorks:
      'Your liver makes sugar and releases it into the blood between meals. Metformin gets carried into liver cells by a specific transporter, mildly slows one step of their energy production, and the cell reads that dip as a signal that it cannot afford to be manufacturing sugar. Output falls. It does not push insulin out of the pancreas, which is why it does not cause low blood sugar on its own.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    substitutes: {
      summary:
        'Metformin costs about a cent and a half per tablet at United States pharmacy acquisition cost and is the comparator every newer drug is added on top of. The SGLT2 inhibitors and GLP-1 agonists have outcome trials metformin does not, at roughly eight hundred times the price per tablet. Berberine is the supplement most often sold as a substitute; the honest comparison is that it has no cardiovascular outcome trial at all.',
      conventionalRx: [
        {
          name: 'Empagliflozin (Jardiance)',
          class: 'SGLT2 inhibitor',
          howItCompares:
            'Reduced cardiovascular death and all-cause mortality against placebo in 7,020 patients with established cardiovascular disease in EMPA-REG OUTCOME — an outcome result on top of background therapy that usually included metformin, not instead of it.',
          typicalCost:
            'US$11.19 per 10 mg tablet at pharmacy acquisition cost (CMS NADAC, JARDIANCE, effective 19 August 2026 — no generic listing exists in the file)',
          prosAndCons:
            'Pros: cardiovascular, heart-failure and kidney outcome data. Cons: roughly eight hundred times the per-tablet acquisition cost of metformin, genital mycotic infections, rare euglycaemic ketoacidosis.',
        },
        {
          name: 'Glimepiride (generic sulfonylurea)',
          class: 'Sulfonylurea insulin secretagogue',
          howItCompares:
            'Lowers HbA1c comparably and costs about as little, but works by forcing insulin secretion rather than by reducing hepatic output, so it causes hypoglycaemia and weight gain. In UKPDS 34 metformin outperformed chlorpropamide, glibenclamide and insulin on diabetes-related endpoints, all-cause mortality and stroke.',
          typicalCost:
            'US$0.030 per 2 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 17 Dec 2025) — about US$0.91 for a 30-day supply',
          prosAndCons:
            'Pros: cheap, fast, decades of use. Cons: severe hypoglycaemia in 2.2% of GRADE participants versus 0.7% on sitagliptin, weight gain, and the worst survival of any first-line monotherapy in the CPRD cohort.',
        },
        {
          name: 'Sitagliptin (Januvia)',
          class: 'DPP-4 inhibitor',
          howItCompares:
            'Lowers HbA1c with almost no hypoglycaemia, but in the GRADE trial it was the least durable of four add-ons to metformin, and in TECOS it did not reduce cardiovascular events.',
          typicalCost:
            'US$3.77 per 100 mg generic sitagliptin phosphate tablet at pharmacy acquisition cost (CMS NADAC, effective 5 August 2026); the brand JANUVIA was US$10.55 per tablet at 17 Dec 2025',
          prosAndCons:
            'Pros: very well tolerated, weight-neutral. Cons: weakest glycaemic durability in GRADE, no outcome benefit, and a class heart-failure signal from saxagliptin in SAVOR-TIMI 53.',
        },
      ],
      naturalFoods: [
        {
          name: 'Berberine (Coptis chinensis, Berberis species)',
          activeCompound: 'Berberine hydrochloride, an isoquinoline alkaloid',
          biologicalMechanism:
            'Inhibits mitochondrial respiratory complex I and raises the AMP to ATP ratio, activating AMPK — the same proximal step attributed to metformin. The mechanism is shared; the evidence base is not.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. The randomised trials of berberine in type 2 diabetes are small, short and almost all conducted in China; none has reported a cardiovascular or mortality endpoint.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask whether your B12 has been checked',
          action:
            'Request a serum vitamin B12 measurement if you have been on metformin for years, particularly if you have new numbness or tingling.',
          patientImpact:
            'In a 4.3-year randomised trial, metformin lowered B12 by 19% against placebo and raised the absolute risk of frank deficiency by 7.2 percentage points — a number needed to harm of 13.8 over 4.3 years.',
          clinicalPrecaution:
            'B12 deficiency and diabetic neuropathy produce similar symptoms and have different treatments. Only a blood test tells them apart.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(C)C(=N)N=C(N)N',
      chemicalFormula: 'C4H11N5',
      molecularWeight: '129.16 g/mol (free base); dispensed as metformin hydrochloride',
      targetReceptorAffinity:
        'No high-affinity receptor. Metformin is a cation that accumulates in the mitochondrial matrix down the membrane potential and inhibits complex I only in the millimolar intracellular range, which is why the transporter that concentrates it — OCT1, encoded by SLC22A1 — matters more than binding affinity does.',
      structureSource: {
        label: 'PubChem CID 4091 (metformin) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4091',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'met-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of dicyandiamide and dimethylamine',
          description:
            'Confirm identity and water content of 2-cyanoguanidine and of the dimethylamine hydrochloride before the melt condensation. Wet dicyandiamide hydrolyses to guanylurea, which carries through the whole process and is the impurity the pharmacopoeial monograph is written to catch.',
          reagentsAndBuffer:
            '2-cyanoguanidine (dicyandiamide) reference standard, dimethylamine hydrochloride, Karl Fischer titration, reversed-phase HPLC with UV detection at 218 nm, melamine and guanylurea reference impurities',
        },
        {
          id: 'met-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Condensation of dimethylamine hydrochloride with dicyandiamide',
          description:
            'Heat equimolar dimethylamine hydrochloride and dicyandiamide together so the amine adds across the nitrile and cyclisation is avoided. The reaction is the one Emil Werner and James Bell published in 1922 and is still the industrial route; it is a single bond-forming step from two commodity chemicals, which is why the finished tablet costs cents.',
          dependsOnStepId: 'met-w1',
          reagentsAndBuffer:
            'Dimethylamine hydrochloride and 2-cyanoguanidine in a 1:1 molar ratio, heated neat or in toluene; nitrogen blanket to exclude moisture',
        },
        {
          id: 'met-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation of the hydrochloride and impurity clearance',
          description:
            'Recrystallise the crude salt from hot aqueous ethanol with activated charcoal treatment, then assay against the monograph for related substances. Melamine, formed if the melt runs too hot, and residual dicyandiamide are the two the specification names.',
          dependsOnStepId: 'met-w2',
          reagentsAndBuffer:
            '95% ethanol and purified water, activated charcoal, phosphate buffer pH 6.6 with acetonitrile for the HPLC assay, UV detection at 218 nm',
        },
        {
          id: 'met-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'OCT1-dependent uptake into primary human hepatocytes',
          description:
            'Dose cryopreserved primary human hepatocytes and confirm that intracellular accumulation depends on organic cation transporter 1, by competing with a known OCT1 substrate. Metformin is a hydrophilic cation and does not cross membranes on its own; without the transporter there is no pharmacology to measure.',
          dependsOnStepId: 'met-w3',
          reagentsAndBuffer:
            "Cryopreserved primary human hepatocytes, InVitroGRO CP thawing medium, Williams' E medium with GlutaMAX, collagen-coated plates, 1-methyl-4-phenylpyridinium as competing OCT1 substrate",
        },
        {
          id: 'met-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Glucose output and AMPK phosphorylation readout',
          description:
            'Measure glucose released into glucose-free medium from lactate and pyruvate substrates, and in parallel blot for AMPK phosphorylated at threonine 172. Reporting both matters: the glucose number is the effect, the phosphorylation is the proposed explanation, and there are published conditions where one moves without the other.',
          dependsOnStepId: 'met-w4',
          reagentsAndBuffer:
            'Glucose-free DMEM with sodium lactate and sodium pyruvate, colorimetric glucose oxidase assay, RIPA lysis buffer with phosphatase inhibitors, anti-phospho-AMPK(Thr172) and anti-total-AMPK antibodies',
        },
      ],
    },
    keyAudits: [
      {
        id: 'met-a1',
        category: 'measured',
        title: 'UKPDS 34: 36% lower all-cause mortality in 753 randomised overweight patients',
        laymanSummary:
          'Over a median of nearly eleven years, overweight patients randomised to metformin had a third fewer deaths from any cause than those managed by diet alone. This is the drug\'s one hard-outcome result and nothing since has repeated it.',
        technicalDetails:
          'Of 1,704 overweight patients with newly diagnosed type 2 diabetes, 753 entered the randomised comparison: intensive control with metformin (n=342) versus conventional policy, primarily diet (n=411), median 10.7 years. Median HbA1c was 7.4% on metformin against 8.0% on conventional therapy. Risk reductions were 32% for any diabetes-related endpoint (95% CI 13 to 47, p=0.002), 42% for diabetes-related death (9 to 63, p=0.017) and 36% for all-cause mortality (9 to 55, p=0.011). Against the other intensive arms, metformin beat chlorpropamide, glibenclamide and insulin for any diabetes-related endpoint (p=0.0034), all-cause mortality (p=0.021) and stroke (p=0.032).',
        evidenceSource: 'UK Prospective Diabetes Study (UKPDS) Group, Lancet 1998;352:854-865',
        doi: '10.1016/S0140-6736(98)07037-8',
        measuredMetric: 'All-cause mortality and aggregate diabetes-related endpoints at median 10.7 years',
        auditFlag: 'verified',
      },
      {
        id: 'met-a2',
        category: 'inferred',
        title: 'The longevity claim rests on a trial that has never enrolled a single participant',
        laymanSummary:
          'TAME, the trial designed to test whether metformin slows ageing, has been designed and publicised for a decade and has never started. Every statement that metformin extends healthy lifespan in people is an extrapolation.',
        technicalDetails:
          'TAME (Targeting Aging with Metformin) was proposed by Barzilai and colleagues in Cell Metabolism in 2016 as a six-year, roughly 3,000-participant trial using a composite of incident age-related disease as its endpoint, coordinated through the American Federation for Aging Research. As of August 2026 it has no ClinicalTrials.gov registration, no enrolment and no completed funding: a search of the ClinicalTrials.gov v2 API for the trial title returns no matching study. The one large randomised trial actually running on a non-diabetic outcome is VA-IMPACT (NCT02915198), a 7,410-participant phase 4 trial of metformin in prediabetes with established atherosclerotic disease, recruiting, with an estimated completion date of 28 September 2029.',
        evidenceSource:
          'Barzilai N et al., Cell Metab 2016;23:1060-1065; AFAR TAME programme page; ClinicalTrials.gov NCT02915198',
        doi: '10.1016/j.cmet.2016.05.011',
        inferredClaim:
          'That metformin extends healthy lifespan or slows ageing in humans — a hypothesis with a published trial design, no trial, and no result',
        auditFlag: 'caution',
      },
      {
        id: 'met-a3',
        category: 'conclusion_shift',
        title: 'The cancer-prevention literature collapsed once immortal time bias was removed',
        laymanSummary:
          'From 2005 onwards, dozens of observational studies reported that metformin users got much less cancer. In 2012 the statistical flaw producing that pattern was identified. Studies that avoid it find nothing, and the randomised trials find nothing.',
        technicalDetails:
          'Suissa and Yu reviewed the field in Diabetes Care in 2023 under the title "Metformin and Cancer: Solutions to a Real-World Evidence Failure". The observational signal was driven by time-related biases, principally immortal time bias, which systematically exaggerates a drug\'s apparent benefit. Observational studies designed to avoid those biases found no association. Randomised trials of metformin as adjuvant cancer therapy likewise found no reduction in incidence or outcomes, and the largest — a phase 3 adjuvant breast cancer trial of 3,649 women with five-year follow-up — found no benefit for disease-free or overall survival. The authors note the same preventable biases were still prominent in the 2022 literature.',
        evidenceSource: 'Yu OHY, Suissa S, Diabetes Care 2023;46:904-912',
        doi: '10.2337/dci22-0047',
        inferredClaim:
          'That metformin prevents or treats cancer — an inference from cohort studies whose design produced the effect',
        auditFlag: 'contested',
      },
      {
        id: 'met-a4',
        category: 'failed',
        title: 'Adding metformin to sulfonylurea nearly doubled diabetes-related death in UKPDS 34',
        laymanSummary:
          'The same paper that found the mortality benefit also found harm. In a separate randomisation, patients already on maximum sulfonylurea who had metformin added had a 96% higher risk of dying from a diabetes-related cause.',
        technicalDetails:
          'The supplementary randomised comparison in UKPDS 34 allocated 537 patients already receiving maximum sulfonylurea therapy with raised fasting plasma glucose to continued sulfonylurea alone (n=269) or the addition of metformin (n=268). Early addition of metformin was associated with a 96% increased risk of diabetes-related death (95% CI 2 to 275, p=0.039). The investigators then ran an epidemiological assessment across 4,416 patients and found no increased risk of diabetes-related death on combination therapy (risk reduction 5%, 95% CI -33 to 32, p=0.78), and treated the randomised finding as most likely a chance result. Both analyses are in the same paper; the randomised one is the one with the randomisation.',
        evidenceSource: 'UK Prospective Diabetes Study (UKPDS) Group, Lancet 1998;352:854-865',
        doi: '10.1016/S0140-6736(98)07037-8',
        measuredMetric: 'Diabetes-related death in the sulfonylurea-plus-metformin randomisation',
        auditFlag: 'caution',
      },
      {
        id: 'met-a5',
        category: 'failed',
        title: 'Metformin blocked the mitochondrial gains from exercise training in older adults',
        laymanSummary:
          'In a double-blind trial, older adults who exercised for twelve weeks improved their fitness and insulin sensitivity. Those who took metformin alongside the training did not improve as much, and their muscle mitochondria did not adapt at all.',
        technicalDetails:
          'Konopka et al. randomised 53 adults with a mean age of 62 to placebo (n=26) or metformin (n=27) during twelve weeks of aerobic exercise training. Training reduced fat mass, HbA1c, fasting insulin, 24-hour mean glucose and glycaemic variability irrespective of treatment. Metformin attenuated the increase in whole-body insulin sensitivity and in VO2 max after training, and abrogated the training-induced rise in skeletal muscle mitochondrial respiration. The change in insulin sensitivity correlated with the change in mitochondrial respiration. Responses were highly variable, with both positive and negative responders in the metformin arm. The authors conclude that more work is needed before metformin is prescribed to slow ageing.',
        evidenceSource: 'Konopka AR et al., Aging Cell 2019;18:e12880',
        doi: '10.1111/acel.12880',
        measuredMetric: 'Change in VO2 max, whole-body insulin sensitivity and mitochondrial respiration after 12 weeks of training',
        auditFlag: 'verified',
      },
      {
        id: 'met-a6',
        category: 'measured',
        title: 'B12 deficiency is a real, randomised, dose-of-time-dependent harm',
        laymanSummary:
          'Over more than four years, metformin lowered vitamin B12 levels by about a fifth compared with placebo, and pushed roughly one person in fourteen into outright deficiency.',
        technicalDetails:
          'De Jager et al. randomised 390 insulin-treated patients with type 2 diabetes to metformin 850 mg three times daily or placebo for 4.3 years. Metformin produced a mean 19% decrease in vitamin B12 (95% CI -24% to -14%, p<0.001) and a 5% decrease in folate. The absolute risk of B12 deficiency below 150 pmol/L was 7.2 percentage points higher on metformin (95% CI 2.3 to 12.1, p=0.004), a number needed to harm of 13.8 over 4.3 years; the risk of a low B12 of 150 to 220 pmol/L was 11.2 points higher (p=0.001). Homocysteine rose 5% (95% CI -1% to 11%, p=0.091).',
        evidenceSource: 'de Jager J et al., BMJ 2010;340:c2181 (NCT00375388)',
        doi: '10.1136/bmj.c2181',
        measuredMetric: 'Percentage change in serum vitamin B12 and absolute risk of deficiency at 4.3 years',
        auditFlag: 'verified',
      },
      {
        id: 'met-a7',
        category: 'conclusion_shift',
        title: 'The lactic acidosis contraindication did not survive its own evidence review',
        laymanSummary:
          'Metformin was kept away from patients with heart, kidney and lung disease for decades on the grounds that it caused a dangerous build-up of lactic acid. Pooling 347 studies found not one case, in either arm.',
        technicalDetails:
          'Salpeter et al. pooled 347 comparative trials and cohort studies in the Cochrane review and found no case of fatal or non-fatal lactic acidosis in 70,490 patient-years of metformin use, nor in 55,451 patient-years of non-metformin comparators. By Poisson statistics the upper bound on the true incidence was 4.3 cases per 100,000 patient-years on metformin and 5.4 on comparators. Blood lactate did not differ, either as a mean level or as change from baseline. The contraindication that produced the original fear belonged to phenformin, a different biguanide withdrawn in the 1970s; the FDA replaced metformin\'s creatinine-based renal contraindication with an eGFR-based one in 2016.',
        evidenceSource: 'Salpeter SR et al., Cochrane Database Syst Rev 2010;(4):CD002967',
        doi: '10.1002/14651858.CD002967.pub4',
        inferredClaim:
          'That metformin causes clinically meaningful lactic acidosis at therapeutic doses — a class inference carried over from phenformin that the pooled data do not support',
        auditFlag: 'verified',
      },
      {
        id: 'met-a8',
        category: 'inferred',
        title: 'Metformin users outliving non-diabetic controls is an observational finding, not a drug effect',
        laymanSummary:
          'A widely quoted UK database study found that people starting metformin lived longer than matched people without diabetes at all. It is not a trial, and who gets prescribed metformin is not random.',
        technicalDetails:
          'Bannister et al. used the UK Clinical Practice Research Datalink to compare 78,241 patients started on metformin monotherapy, 12,222 started on sulfonylurea monotherapy, and 90,463 matched non-diabetic controls, over 503,384 censored person-years with 7,498 deaths. Taking metformin initiators as the reference, adjusted median survival time was 15% lower in matched non-diabetic controls (STR 0.85, 95% CI 0.81 to 0.90) and 38% lower in sulfonylurea initiators (0.62, 0.58 to 0.66). The design cannot separate a metformin effect from confounding by indication: metformin is preferentially started in patients with preserved renal function, no heart failure and no frailty, and those are the same people who would outlive the average person without diabetes anyway.',
        evidenceSource: 'Bannister CA et al., Diabetes Obes Metab 2014;16:1165-1173',
        doi: '10.1111/dom.12354',
        inferredClaim:
          'That metformin confers a survival advantage over having no diabetes — an unadjustable healthy-user contrast presented as a drug effect',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, absorbed slowly, and never metabolised',
        laymanDesc:
          'The tablet dissolves in the upper gut and is absorbed over several hours. The body does not break the molecule down at all: whatever goes in comes out unchanged in the urine.',
        molecularDetail:
          'Absolute oral bioavailability of roughly 50 to 60%, absorption largely complete within six hours, no hepatic metabolism and no plasma protein binding. Elimination is entirely renal by active tubular secretion, which is why declining kidney function raises exposure and why the label is written around eGFR.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A transporter carries it into liver cells',
        laymanDesc:
          'Metformin carries a positive charge and cannot slip through a cell membrane on its own. A specific pump on the liver-cell surface pulls it in, which is why the liver sees far more of it than the rest of the body.',
        molecularDetail:
          'Organic cation transporter 1 (OCT1, SLC22A1) moves metformin across the hepatocyte sinusoidal membrane; MATE1 and MATE2-K handle biliary and renal efflux. Reduced-function OCT1 variants blunt the glucose-lowering effect, which is the cleanest evidence that hepatic uptake is rate-limiting.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It gathers in the mitochondria and mildly slows one step',
        laymanDesc:
          'Inside the cell, the positive charge drags metformin into the mitochondria, where it accumulates far above its concentration in blood and gently slows the first step of energy production.',
        molecularDetail:
          'The membrane potential across the inner mitochondrial membrane concentrates the cation several hundred-fold in the matrix, where it inhibits complex I (NADH:ubiquinone oxidoreductase). The inhibition is partial and reversible; the intracellular concentration required is millimolar, far above the micromolar plasma concentration, which is the whole reason the transporter step matters.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The cell reads a fall in energy charge and stops making sugar',
        laymanDesc:
          'A small drop in cellular energy switches on a sensor that tells the cell to stop expensive manufacturing. Making glucose from scratch is expensive, so it stops.',
        molecularDetail:
          'The rising AMP to ATP ratio activates AMPK via LKB1-dependent phosphorylation at Thr172 and, independently of AMPK, AMP inhibits fructose-1,6-bisphosphatase and adenylate cyclase. Hepatic gluconeogenesis falls through reduced PEPCK and G6Pase transcription and reduced glucagon signalling. Which of these branches dominates in humans is still argued in the literature.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fasting glucose falls, without pushing insulin out',
        laymanDesc:
          'Blood sugar comes down because the liver is releasing less of it, not because more insulin is being forced out of the pancreas. That is why metformin alone almost never causes a hypo.',
        molecularDetail:
          'Reduced hepatic glucose output lowers fasting plasma glucose and HbA1c without stimulating pancreatic beta cells. In UKPDS 34 the achieved median HbA1c was 7.4% against 8.0% on conventional policy, and severe hypoglycaemia was less frequent than with sulfonylureas or insulin.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'UKPDS 34 (metformin versus conventional policy)',
        phase: 'Randomised controlled trial, median 10.7 years',
        sampleSize: 753,
        primaryEndpoint:
          'Aggregate of any diabetes-related clinical endpoint, diabetes-related death and all-cause mortality',
        endpointMet: true,
        statisticalPValue:
          'P = 0.002 for any diabetes-related endpoint; P = 0.011 for all-cause mortality',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'UKPDS 34 supplementary randomisation (metformin added to sulfonylurea)',
        phase: 'Randomised controlled trial',
        sampleSize: 537,
        primaryEndpoint: 'Diabetes-related death with metformin added to maximum sulfonylurea therapy',
        endpointMet: false,
        statisticalPValue: 'P = 0.039 for a 96% increased risk of diabetes-related death',
        unreportedAdverseSignals:
          'The harm signal is in the published abstract. The same paper reports an epidemiological analysis across 4,416 patients showing no such risk, and the investigators favoured chance as the explanation.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'de Jager vitamin B12 trial (NCT00375388)',
        phase: 'Phase 4 randomised placebo-controlled trial, 4.3 years',
        sampleSize: 390,
        primaryEndpoint: 'Percentage change in vitamin B12, folate and homocysteine from baseline',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 for the 19% reduction in vitamin B12',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Konopka exercise-interaction trial',
        phase: 'Double-blind randomised trial, 12 weeks',
        sampleSize: 53,
        primaryEndpoint:
          'Change in whole-body insulin sensitivity and skeletal muscle mitochondrial respiration after aerobic training',
        endpointMet: false,
        statisticalPValue:
          'Metformin attenuated the training-induced rise in insulin sensitivity and VO2 max and abrogated the mitochondrial response',
        unreportedAdverseSignals:
          'Responses were bimodal: the metformin arm contained both positive and negative responders, and the group mean hides that.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'VA-IMPACT (NCT02915198)',
        phase: 'Phase 4 cardiovascular outcome trial',
        sampleSize: 7410,
        primaryEndpoint:
          'Time to death, non-fatal myocardial infarction, stroke, hospitalisation for unstable angina or symptom-driven coronary revascularisation',
        endpointMet: false,
        statisticalPValue: 'Not reported — recruiting, estimated completion 28 September 2029',
        unreportedAdverseSignals:
          'The trial has not reported. `endpointMet: false` here means "no result exists yet", not "the endpoint was missed".',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'TAME (Targeting Aging with Metformin)',
        phase: 'Designed but never launched',
        sampleSize: 0,
        primaryEndpoint:
          'Composite time to first incident age-related chronic disease — as designed, never measured',
        endpointMet: false,
        statisticalPValue:
          'No result. No ClinicalTrials.gov registration and no participants enrolled as of August 2026.',
        unreportedAdverseSignals:
          'This row exists because TAME is cited in popular writing as though it were running. A sample size of zero is the accurate entry.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '36% lower all-cause mortality and 32% fewer diabetes-related endpoints in 753 randomised overweight patients over a median 10.7 years',
        'Median HbA1c of 7.4% on metformin against 8.0% on conventional diet policy in the same trial',
        'A 19% reduction in serum vitamin B12 against placebo over 4.3 years, with a 7.2 percentage-point absolute increase in frank deficiency',
        'No case of lactic acidosis in 70,490 patient-years of metformin exposure across 347 pooled studies',
      ],
      unsupportedInferences: [
        'That metformin slows ageing or extends lifespan in humans — TAME was designed in 2016, has no registration and has never enrolled anyone',
        'That metformin prevents cancer — the observational signal was produced by immortal time bias and disappears in studies that avoid it',
        'That metformin initiators outliving non-diabetic controls in a UK database is a drug effect rather than confounding by indication',
        'That the UKPDS 34 mortality benefit generalises to non-overweight patients, to modern background therapy, or to people without diabetes',
      ],
      whatFailedInitially: [
        'The supplementary UKPDS randomisation: adding metformin to maximum sulfonylurea raised diabetes-related death by 96% (p=0.039)',
        'Twelve weeks of aerobic training produced no mitochondrial adaptation in older adults taking metformin, and a blunted rise in VO2 max and insulin sensitivity',
        'Phenformin, the earlier biguanide, was withdrawn for fatal lactic acidosis and left metformin with a contraindication the evidence never supported',
      ],
      realWorldOutcome: [
        'First-line therapy in essentially every type 2 diabetes guideline worldwide, and on the WHO Model List of Essential Medicines',
        'About US$0.014 per 500 mg tablet at United States pharmacy acquisition cost, which is the reason no company will fund the ageing trial',
        'The FDA replaced the creatinine-based renal contraindication with an eGFR-based one in 2016, widening eligibility to patients previously excluded',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, immediate-release and extended-release, and an oral solution',
      description:
        'Taken with food to reduce gastrointestinal effects. The extended-release formulation exists because the immediate-release one causes diarrhoea and nausea in a substantial minority in the first weeks, and that intolerance is the commonest reason people stop.',
      safetyProfile:
        'The US label carries a boxed warning for lactic acidosis, with risk factors of renal impairment, concomitant drugs affecting renal function, age 65 and older, radiological contrast studies, surgery, hypoxic states, excessive alcohol and hepatic impairment. The pooled trial and cohort evidence found no excess of lactic acidosis at therapeutic doses. Common effects are diarrhoea, nausea and abdominal discomfort. Long-term use lowers vitamin B12, and the label recommends periodic measurement.',
    },
    commonQuestions: [
      {
        q: 'Does metformin make you live longer?',
        a: 'Nobody knows, because the trial designed to answer that question has never started. TAME was published as a design in 2016, was intended to enrol about 3,000 older adults, and as of August 2026 has no ClinicalTrials.gov registration and no participants. What exists instead is an observational finding — people started on metformin in a UK database outlived matched people without diabetes — and that comparison cannot separate the drug from the fact that metformin is preferentially prescribed to people with good kidneys, no heart failure and no frailty. The one large randomised trial running on a non-diabetic population, VA-IMPACT, is not due to complete until September 2029.',
        auditNote:
          'This is the single largest gap on this page. It is also the one most often filled in by writing that treats a trial design as though it were a trial result.',
      },
      {
        q: 'Is metformin dangerous for my kidneys?',
        a: 'It does not damage kidneys. The concern runs the other way: metformin is cleared entirely by the kidneys and not metabolised at all, so if kidney function falls, the drug accumulates. That is why the label is written around estimated GFR rather than around any effect of the drug on the kidney. The lactic acidosis warning that drove decades of caution came from phenformin, a different biguanide withdrawn in the 1970s; a Cochrane pooling of 347 studies found no case of lactic acidosis in 70,490 patient-years of metformin use, nor in the comparator arms.',
      },
      {
        q: 'Should I take berberine instead?',
        a: 'They share a proposed proximal mechanism — both inhibit mitochondrial complex I and activate AMPK — and that is where the comparison ends. Metformin has UKPDS 34, a randomised trial with a mortality endpoint and a median follow-up of nearly eleven years. Berberine has small, short trials, mostly conducted in one country, none of which has reported a cardiovascular or mortality endpoint, and it is sold as a supplement without the manufacturing controls a pharmacopoeial monograph imposes. Sharing a mechanism is not the same as sharing an evidence base.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost-of-production figure for metformin could be verified and cited. The published cost-of-production literature reports aggregate ranges or holds per-drug figures in supplementary appendices this file could not check line by line, and estimating one here would mean this page inventing a number. What is shown instead is the actual United States pharmacy acquisition cost from the CMS NADAC file — about 1.4 cents per 500 mg tablet — which is a price, not a cost of manufacture. The synthesis itself is a single condensation of two commodity chemicals first published in 1922, which is consistent with the price being low, but consistency is not a measurement.',
      },
      {
        q: 'Does it stop exercise from working?',
        a: 'In one double-blind trial it blunted part of the effect. Konopka and colleagues randomised 53 adults averaging 62 years old to metformin or placebo during twelve weeks of aerobic training. Everyone improved on fat mass, HbA1c and glucose variability. But the metformin group gained less whole-body insulin sensitivity and less VO2 max, and showed no rise at all in skeletal muscle mitochondrial respiration. The responses were bimodal — some people in the metformin arm improved and some got worse — so the group average conceals two different stories. This is one trial of 53 people, and it is enough to make "metformin for healthy ageing in an active person" an open question rather than a settled one.',
        auditNote:
          'The trial that most complicates the longevity story was funded and run to test the longevity story. It is quoted here in full rather than filtered.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'UK Prospective Diabetes Study (UKPDS) Group. Effect of intensive blood-glucose control with metformin on complications in overweight patients with type 2 diabetes (UKPDS 34). Lancet 1998;352:854-865',
        identifier: '10.1016/S0140-6736(98)07037-8',
        kind: 'doi',
      },
      {
        label:
          'Barzilai N, Crandall JP, Kritchevsky SB, Espeland MA. Metformin as a Tool to Target Aging. Cell Metab 2016;23:1060-1065',
        identifier: '10.1016/j.cmet.2016.05.011',
        kind: 'doi',
      },
      {
        label: 'American Federation for Aging Research — TAME (Targeting Aging with Metformin) programme page',
        identifier: 'https://www.afar.org/tame-trial',
        kind: 'url',
      },
      {
        label:
          'VA-IMPACT: Investigation of Metformin in Pre-Diabetes on Atherosclerotic Cardiovascular Outcomes',
        identifier: 'NCT02915198',
        kind: 'nct',
      },
      {
        label:
          'Yu OHY, Suissa S. Metformin and Cancer: Solutions to a Real-World Evidence Failure. Diabetes Care 2023;46:904-912',
        identifier: '10.2337/dci22-0047',
        kind: 'doi',
      },
      {
        label:
          'Konopka AR et al. Metformin inhibits mitochondrial adaptations to aerobic exercise training in older adults. Aging Cell 2019;18:e12880',
        identifier: '10.1111/acel.12880',
        kind: 'doi',
      },
      {
        label:
          'de Jager J et al. Long term treatment with metformin in patients with type 2 diabetes and risk of vitamin B-12 deficiency: randomised placebo controlled trial. BMJ 2010;340:c2181',
        identifier: '10.1136/bmj.c2181',
        kind: 'doi',
      },
      {
        label:
          'Salpeter SR et al. Risk of fatal and nonfatal lactic acidosis with metformin use in type 2 diabetes mellitus. Cochrane Database Syst Rev 2010;(4):CD002967',
        identifier: '10.1002/14651858.CD002967.pub4',
        kind: 'doi',
      },
      {
        label:
          'Bannister CA et al. Can people with type 2 diabetes live longer than those without? Diabetes Obes Metab 2014;16:1165-1173',
        identifier: '10.1111/dom.12354',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: GLUCOPHAGE (metformin hydrochloride), NDA 020357, original approval 3 March 1995',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020357',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 4091 — metformin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4091',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
]
