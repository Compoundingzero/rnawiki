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
  // ---------------------------------------------------------------------------------------------
  // Magnesium glycinate — a real but small blood-pressure effect, a negative Cochrane review for
  // the cramps everyone buys it for, and a "superior form" claim resting on twelve patients.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'magnesium-glycinate',
    name: 'Magnesium glycinate',
    tradeName: 'Sold as magnesium bisglycinate or magnesium diglycinate chelate',
    sponsor:
      'No single sponsor — magnesium bis-glycinate chelate, manufactured by reacting a magnesium salt with two equivalents of glycine, sold by many supplement brands',
    targetGene: 'TRPM6',
    targetProtein:
      'TRPM6, the transient receptor potential melastatin channel-kinase that carries active transcellular magnesium absorption in the distal small intestine and colon and reabsorption in the renal distal convoluted tubule. Magnesium itself has no single protein target: it is a cofactor for hundreds of ATP-dependent enzymes, a physiological blocker of the NMDA receptor pore and a calcium antagonist at vascular smooth muscle.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for sleep, anxiety, muscle cramps, migraine and blood pressure. Not approved by the FDA or EMA for any of them. Magnesium sulphate given intravenously is a genuine drug with genuine approvals — for eclampsia and for torsades de pointes — and that is a different product taken by a different route for a different reason.',
    patientFriendlyIndication:
      'Taken for sleep, cramps and stress, on the belief that the glycinate form absorbs better',
    conditionContext: {
      conditionExplainer:
        'Magnesium is the fourth most abundant cation in the body and roughly half of it is locked in bone. Most of the rest is inside cells, bound to ATP. Less than one percent circulates in serum, which is why a normal serum magnesium result tells you very little about whether the tissue pool is full.',
      whyItMatters:
        'Because the status test is weak, almost anyone can be told they are deficient. Survey data showing average intakes below the recommended allowance are then read as a population-wide deficiency, and the supplement is sold against symptoms — poor sleep, cramps, anxiety — that are common enough that most buyers will improve on their own.',
      whoTakesThis:
        'Adults buying it for sleep or stress, athletes buying it for cramps, and people with genuine depletion from proton pump inhibitors, loop or thiazide diuretics, chronic alcohol use, uncontrolled diabetes or intestinal resection. Only the last group has a documented reason.',
      clinicalGoals:
        'The randomised trials measured systolic and diastolic blood pressure, cramp frequency per week, insomnia severity index scores, PHQ-9 depression scores and, in the intravenous cardiology programme, 28- and 30-day all-cause mortality.',
    },
    oneSentenceVerdict:
      'Oral magnesium lowers blood pressure by about 2 mmHg in a 34-trial meta-analysis, which is real and small, while the two claims that sell it — cramps and sleep — rest respectively on a Cochrane review that found nothing and a single 46-person trial in which total sleep time did not differ between groups.',
    laymanHowItWorks:
      'Magnesium is a mineral your enzymes cannot work without, and it also sits inside the pore of a brain receptor that carries excitatory signals, plugging it until the cell is stimulated enough to push the magnesium out. Those two facts are the whole basis of the sleep and relaxation marketing. What supplementation actually does is top up a body pool that, in most people eating an ordinary diet, is already close to full — and the glycinate form is sold on the idea that it is absorbed better than the cheap oxide, which one small trial in twelve patients half-supports.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 41,
    anatomicalSite:
      'Intestinal enterocyte brush border for absorption; thereafter intracellular ATP-magnesium complexes in every tissue, with bone as the reservoir',
    substitutes: {
      summary:
        'For a documented deficiency, magnesium is not optional and food or a supplement will both work. For everything else the honest comparison is with the interventions that beat it on their own outcome: sleep hygiene and CBT-I for insomnia, and for blood pressure a 2 mmHg mineral effect sits far below what dietary sodium reduction or a first-line antihypertensive achieves.',
      conventionalRx: [
        {
          name: 'Intravenous magnesium sulphate for eclampsia and torsades de pointes',
          class: 'Parenteral electrolyte, genuine emergency drug',
          howItCompares:
            'This is the one setting where magnesium is unambiguously a drug that saves lives, and it is given by infusion under monitoring in an obstetric or coronary care unit. It is not evidence for a capsule. The same programme that established magnesium in eclampsia failed twice in myocardial infarction.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: large, replicated mortality and morbidity benefit in its own indication. Cons: entirely irrelevant to an oral supplement, and routinely cited as though it were not.',
        },
        {
          name: 'Magnesium oxide, the cheap comparator',
          class: 'Inorganic magnesium salt',
          howItCompares:
            'Firoz and Graber measured fractional absorption of magnesium oxide at about 4 percent against significantly higher and mutually equivalent absorption from magnesium chloride, lactate and aspartate. That study is the source of most "oxide is poorly absorbed" marketing. It did not test glycinate.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: cheapest form, and its poor absorption is exactly why it works as a laxative. Cons: the 4 percent figure is one small urinary-excretion study in normal volunteers, and it is being used to sell a form it never compared against.',
        },
      ],
      naturalFoods: [
        {
          name: 'Legumes, nuts, seeds, whole grains and dark leafy greens',
          activeCompound: 'Magnesium, chiefly as the central ion of chlorophyll in green leaves',
          biologicalMechanism:
            'Dietary magnesium is absorbed by the same two routes as the supplement: a saturable TRPM6-dependent transcellular path that dominates at low intake, and a passive paracellular path that dominates at high intake. Nothing about a capsule bypasses either.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: the trials pooled by Zhang et al. used a median supplemental dose of 368 mg per day, which is roughly the whole daily reference intake for an adult.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Hard tap water and mineral water',
          activeCompound: 'Dissolved magnesium and calcium salts',
          biologicalMechanism:
            'Magnesium in water is already dissociated and needs no digestion, and in populations drinking hard water it is a non-trivial share of total intake. It is also the reason intake surveys that count only food underestimate what people actually get.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask which form was actually tested before believing a magnesium result',
          action:
            'For any magnesium finding, check the salt. The blood-pressure meta-analysis pooled many forms, the depression trial used magnesium chloride, the insomnia trial used a generic 500 mg tablet, and the cardiology trials used intravenous sulphate.',
          patientImpact:
            'Almost none of the magnesium literature was generated with bisglycinate. Buying the glycinate and citing the chloride trial is the standard move in this category.',
          clinicalPrecaution:
            'Oral magnesium causes diarrhoea, and did so measurably: across the four Cochrane cramp trials that reported it, minor adverse events ran from 11 to 37 percent on magnesium against 10 to 14 percent on placebo. In renal impairment magnesium accumulates and can become dangerous, because the kidney is the only meaningful route out.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C(C(=O)[O-])N.C(C(=O)[O-])N.[Mg+2]',
      chemicalFormula: 'C4H8MgN2O4',
      molecularWeight: '172.42 g/mol, of which 24.31 g/mol — about 14 percent — is elemental magnesium',
      structureSource: {
        label: 'PubChem CID 84645 — Magnesium glycinate, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/84645',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mgg-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Elemental magnesium assay and confirmation that the chelate is actually a chelate',
          description:
            'A product labelled bisglycinate can be a true chelate, a physical blend of magnesium oxide with free glycine, or anything in between, and an elemental magnesium assay passes all three identically. The discriminating test is spectroscopic: in the chelate the carboxylate stretch shifts and the amine nitrogen coordinates, which free glycine mixed with oxide does not show.',
          reagentsAndBuffer:
            'ICP-MS against a certified magnesium standard for elemental content; FTIR with attenuated total reflectance comparing carboxylate asymmetric stretch positions against authentic magnesium bisglycinate, glycine and magnesium oxide references; loss on drying',
        },
        {
          id: 'mgg-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the stable-isotope-labelled tracer',
          description:
            'Magnesium absorption cannot be measured against the endogenous pool without a tracer, because the pool is enormous and serum barely moves. Synthesise the bisglycinate from isotopically enriched magnesium so that absorbed magnesium is distinguishable from body magnesium by mass rather than by concentration.',
          dependsOnStepId: 'mgg-w1',
          reagentsAndBuffer:
            'Magnesium-26 enriched magnesium oxide or carbonate; glycine, two molar equivalents; deionised water at controlled pH; isotopic enrichment confirmed by ICP-MS 26Mg to 24Mg ratio',
        },
        {
          id: 'mgg-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Removal of free glycine and unreacted inorganic magnesium',
          description:
            'Unreacted magnesium oxide and free glycine both carry through the reaction and both confound an absorption study, since free glycine has its own transport route and oxide has its own dissolution behaviour. Separate them before any human or cell exposure, and quantify what is left.',
          dependsOnStepId: 'mgg-w2',
          reagentsAndBuffer:
            'Recrystallisation from aqueous ethanol; cation-exchange chromatography; ninhydrin assay for residual free glycine; ion chromatography for residual chloride or sulphate counter-ions',
        },
        {
          id: 'mgg-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Caco-2 transport with a peptide-transporter block, testing the intact-uptake claim',
          description:
            'The commercial case for glycinate is that the chelate is absorbed intact through a dipeptide route rather than as a free ion, which Schuette et al. suggested but did not demonstrate in cells. Apply labelled bisglycinate to differentiated Caco-2 monolayers with and without a PepT1 inhibitor, and separately with TRPM6 knocked down, and see which block abolishes transport.',
          dependsOnStepId: 'mgg-w3',
          reagentsAndBuffer:
            'Caco-2 monolayers on Transwell inserts, transepithelial electrical resistance above 300 ohm cm2; Hanks balanced salt solution at apical pH 6.0; 26Mg-bisglycinate; glycyl-sarcosine as competitive PepT1 substrate; TRPM6 siRNA and scrambled control; mannitol as paracellular leak marker',
        },
        {
          id: 'mgg-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Isotope-ratio quantification of true fractional absorption',
          description:
            'Report fractional absorption as the recovered fraction of the administered isotope, not as a change in serum magnesium, because serum is buffered by bone and by renal handling and moves too little to resolve a difference between forms. This is the step where most published form-comparison claims stop short.',
          dependsOnStepId: 'mgg-w4',
          reagentsAndBuffer:
            'Complete 24-hour urine collections; ICP-MS isotope-ratio analysis of 26Mg to 24Mg; creatinine normalisation; paired oral and intravenous tracer administration for the double-isotope correction',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mgg-a1',
        category: 'measured',
        title: 'Zhang 2016: blood pressure fell 2.00 over 1.78 mmHg across 34 trials',
        laymanSummary:
          'Pooling 34 double-blind placebo-controlled trials, magnesium lowered blood pressure. The size of the effect was about two points on the top number.',
        technicalDetails:
          'A meta-analysis of 34 randomised, double-blind, placebo-controlled trials involving 2,028 participants, searched to February 2016. At a median dose of 368 mg per day for a median of three months, magnesium supplementation reduced systolic blood pressure by 2.00 mmHg (95% CI 0.43 to 3.58) and diastolic by 1.78 mmHg (95% CI 0.73 to 2.82), accompanied by a 0.05 mmol/L (95% CI 0.03 to 0.07) rise in serum magnesium. A restricted cubic spline suggested 300 mg per day or one month was sufficient to move both. Serum magnesium was negatively associated with diastolic but not systolic pressure. The authors noted residual heterogeneity persisting after stratification and called for further well-designed trials. Two millimetres of mercury is a genuine effect that no reader should mistake for an antihypertensive.',
        evidenceSource: 'Zhang X et al. Hypertension 2016;68:324-333',
        doi: '10.1161/HYPERTENSIONAHA.116.07664',
        measuredMetric:
          'Weighted mean difference in systolic and diastolic blood pressure versus placebo, mmHg',
        auditFlag: 'verified',
      },
      {
        id: 'mgg-a2',
        category: 'failed',
        title: 'Cochrane 2020: no cramp benefit in older adults, and the certainty was high',
        laymanSummary:
          'The single most common reason people buy magnesium is night cramps. A Cochrane review of eleven trials found the difference against placebo was about a fifth of one cramp per week, which is nothing.',
        technicalDetails:
          'Eleven randomised trials enrolling 735 people, five in pregnancy-associated leg cramps and five in idiopathic cramps in older adults (mean ages 61.6 to 69.3 years). For idiopathic cramps the difference from placebo in the number of cramps per week at four weeks was -0.18 (95% CI -0.84 to 0.49; five studies, 307 participants; moderate-certainty evidence), and the percentage change from baseline in cramps per week was -9.59% (95% CI -23.14% to 3.97%; three studies, 177 participants). The proportion achieving at least a 25% reduction in cramp rate gave a risk ratio of 1.04 (95% CI 0.84 to 1.29) and was graded HIGH certainty. Heterogeneity was 0 to 12%. Minor adverse events, mostly diarrhoea, were more common on magnesium (RR 1.51, 95% CI 0.98 to 2.33). The authors wrote that it is unlikely magnesium supplementation provides clinically meaningful cramp prophylaxis to older adults.',
        evidenceSource: 'Garrison SR et al. Cochrane Database Syst Rev 2020;9:CD009402',
        doi: '10.1002/14651858.CD009402.pub3',
        measuredMetric:
          'Number of cramps per week at four weeks, and proportion achieving a 25% or greater reduction from baseline',
        auditFlag: 'verified',
      },
      {
        id: 'mgg-a3',
        category: 'inferred',
        title: 'The glycinate advantage rests on twelve patients with surgically shortened bowels',
        laymanSummary:
          'The one human trial comparing magnesium glycinate against the cheap oxide form found no overall difference in absorption. It was run in twelve people who had had part of their intestine removed.',
        technicalDetails:
          'Schuette, Lashner and Janghorbani ran a double-blind randomised crossover in twelve patients with ileal resections, comparing a 100 mg dose of 26Mg-labelled magnesium diglycinate against 26Mg-labelled magnesium oxide. For the group as a whole, absorption was low and not different between the two forms: 23.5% for the chelate against 22.8% for the oxide. A difference emerged only in the four patients with the worst oxide absorption (23.5% against 11.8%, P < .05). Peak isotope enrichment came earlier after the chelate (mean difference 3.2 +/- 1.3 hours, P < .05) and the area under the enrichment curve was greater. The authors concluded that some portion of the diglycinate is probably absorbed intact by a dipeptide pathway and that it may be a good alternative in patients with intestinal resection — a conclusion about surgical patients that the retail category has generalised to everyone. Separately, Firoz and Graber\'s much-cited bioavailability comparison of US commercial preparations tested oxide, chloride, lactate and aspartate. It did not include glycinate at all.',
        evidenceSource:
          'Schuette SA, Lashner BA, Janghorbani M. JPEN J Parenter Enteral Nutr 1994;18:430-435; Firoz M, Graber M. Magnes Res 2001;14:257-262',
        doi: '10.1177/0148607194018005430',
        inferredClaim:
          'That magnesium bisglycinate is meaningfully better absorbed than other magnesium salts in people with normal intestines, and that trials run with other magnesium salts therefore transfer to it',
        auditFlag: 'caution',
      },
      {
        id: 'mgg-a4',
        category: 'inferred',
        title: 'The sleep trial: 46 people, and total sleep time did not differ',
        laymanSummary:
          'The trial behind "magnesium for sleep" had 46 elderly participants. Questionnaire scores improved. The amount of time people actually slept was no different from placebo.',
        technicalDetails:
          'Abbasi et al. randomised 46 elderly subjects with primary insomnia to 500 mg magnesium or placebo for eight weeks. Between-group improvements were reported for insomnia severity index score (P = 0.006), sleep efficiency (P = 0.03), sleep onset latency (P = 0.02), serum renin (P < 0.001), melatonin (P = 0.007) and cortisol (P = 0.008). But total sleep time showed no significant between-group difference (P = 0.37), early morning awakening was only marginal (P = 0.08), and — the detail that undercuts the mechanism — the between-group difference in serum magnesium concentration itself was only marginally significant (P = 0.06). A supplement that did not clearly raise the analyte it delivers, in 46 people, is the entire randomised basis for one of the largest supplement marketing claims in the category.',
        evidenceSource: 'Abbasi B et al. J Res Med Sci 2012;17:1161-1169',
        measuredMetric:
          'Insomnia severity index, sleep onset latency, sleep efficiency and total sleep time over eight weeks',
        inferredClaim:
          'That magnesium is an established sleep aid in adults generally, on the strength of a 46-person trial whose total sleep time endpoint was null',
        auditFlag: 'caution',
      },
      {
        id: 'mgg-a5',
        category: 'conclusion_shift',
        title: 'The cardiology reversal: a 24% mortality benefit that 6,213 patients erased',
        laymanSummary:
          'In 1992 a trial of 2,316 heart attack patients reported that magnesium cut deaths by a quarter. Two much larger trials, one with 58,050 patients and one with 6,213, did not confirm it, and the treatment was abandoned.',
        technicalDetails:
          'LIMIT-2 randomised 2,316 patients with suspected acute myocardial infarction to intravenous magnesium sulphate or saline and reported 28-day all-cause mortality of 7.8% against 10.3% (2p = 0.04), a relative reduction of 24% (95% CI 1 to 43%), with left ventricular failure in the coronary care unit down 25% (7 to 39%, 2p = 0.009). The authors wrote that magnesium\'s efficacy in reducing early mortality was comparable to, but independent of, thrombolytic or antiplatelet therapy. ISIS-4 then randomised 58,050 patients in a 2x2x2 factorial design including 24 hours of intravenous magnesium sulphate versus open control. By 2002 the MAGIC investigators recorded in their own background section that "conflicting results have been reported in clinical trials," and settled it: 6,213 patients, 30-day all-cause mortality 475 (15.3%) on magnesium against 472 (15.2%) on placebo, odds ratio 1.0 (95% CI 0.9 to 1.2, p = 0.96), with no benefit or harm in eight prespecified and fifteen exploratory subgroups. Their conclusion was that there is no indication for routine intravenous magnesium in STEMI. The mechanism was never wrong — magnesium really is a vasodilator, platelet inhibitor and antiarrhythmic — it simply did not produce the outcome.',
        evidenceSource:
          'Woods KL et al. Lancet 1992;339:1553-1558; ISIS-4 Collaborative Group. Lancet 1995;345:669-685; MAGIC Trial Investigators. Lancet 2002;360:1189-1196',
        doi: '10.1016/S0140-6736(02)11278-5',
        measuredMetric: '28-day and 30-day all-cause mortality after acute myocardial infarction',
        inferredClaim:
          'That a plausible mechanism plus a positive medium-sized trial establishes a clinical effect',
        auditFlag: 'verified',
      },
      {
        id: 'mgg-a6',
        category: 'inferred',
        title: 'The depression result is large, fast, and completely unblinded',
        laymanSummary:
          'An often-cited trial reported that magnesium improved depression scores by six points in two weeks. Nobody was blinded, there was no placebo, and participants knew exactly when they were taking it.',
        technicalDetails:
          'Tarleton et al. ran an open-label, blocked, randomised crossover trial in 126 adults with PHQ-9 scores of 5 to 19, comparing six weeks of 248 mg elemental magnesium as magnesium chloride against six weeks of no treatment. Net improvement in PHQ-9 was -6.0 points (95% CI -7.9 to -4.2, P < 0.001) and in GAD-7 -4.5 points (95% CI -6.6 to -2.4, P < 0.001), with effects appearing within two weeks and no dependence on baseline magnesium level. The design is the problem: an open-label crossover against no treatment in a self-reported symptom score is the configuration that maximises expectancy effects, and a six-point PHQ-9 swing exceeds what several licensed antidepressants achieve over placebo in blinded trials. Note also the salt: this was magnesium chloride, not glycinate.',
        evidenceSource: 'Tarleton EK et al. PLoS One 2017;12:e0180067',
        doi: '10.1371/journal.pone.0180067',
        inferredClaim:
          'That magnesium has an antidepressant effect of the size this trial reports, when the trial had no blind and no placebo',
        auditFlag: 'caution',
      },
      {
        id: 'mgg-a7',
        category: 'measured',
        title: 'The deficiency test is weak, which is what makes the category sellable',
        laymanSummary:
          'The blood test used to call people magnesium-deficient measures less than one percent of the body\'s magnesium, and the normal range it is judged against was never set from health outcomes.',
        technicalDetails:
          'Costello et al. argue in Advances in Nutrition that the widely used serum magnesium reference interval is not evidence-based: it derives from population distributions rather than from any relationship to clinical outcome, and it is set low enough that people with genuine chronic latent deficiency fall inside it. Serum holds a small, tightly regulated fraction of total body magnesium, buffered by exchange with bone, so it falls late and returns to range quickly. The practical consequence runs both directions. A normal result does not rule out depletion, which is the honest half of the marketing claim. And no ordinary test can confirm the depletion either, which means a supplement sold against it can never be shown to have been unnecessary.',
        evidenceSource: 'Costello RB et al. Adv Nutr 2016;7:977-993',
        doi: '10.3945/an.116.012765',
        measuredMetric:
          'Serum magnesium reference interval and its relationship to total body magnesium status',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Two absorption routes, and the efficient one shuts down as intake rises',
        laymanDesc:
          'The gut has an active pump for magnesium that works hardest when you have least, plus a passive leak between cells that handles the rest. Take more and a smaller fraction of it gets in.',
        molecularDetail:
          'Transcellular uptake through TRPM6 in the distal small intestine and colon is saturable and dominates at low luminal concentration; paracellular diffusion through claudin-2 and claudin-12 tight junctions dominates at high concentration and is not regulated. Fractional absorption therefore falls as dose rises, which is why any form comparison must state the dose it was run at. Firoz and Graber measured about 4 percent fractional absorption for magnesium oxide at roughly 21 mEq per day.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The glycinate claim: absorbed as a whole molecule, or taken apart first',
        laymanDesc:
          'The premium form is sold on the idea that magnesium bound to two glycine molecules slips through a different door, the one used for digested protein fragments. One small trial hinted at this.',
        molecularDetail:
          'Schuette et al. inferred intact dipeptide-pathway absorption from an earlier peak isotope enrichment (3.2 +/- 1.3 hours sooner) and a greater area under the enrichment curve for the diglycinate against the oxide, in ileal-resection patients. Total fractional absorption was not different (23.5% against 22.8%). Earlier and higher is a kinetic observation; a distinct transporter is an inference from it, and no cell-level demonstration accompanies the claim.',
        iconName: 'DoorOpen',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Into the cell, where it spends its life stuck to ATP',
        laymanDesc:
          'Almost no magnesium floats free. Inside cells it is bound to the energy molecule ATP, and it is that complex, not ATP alone, that enzymes actually use.',
        molecularDetail:
          'The biologically active substrate of most kinases, ATPases and polymerases is Mg-ATP, not ATP. Intracellular free magnesium is held near 0.5 to 1.0 mmol/L against a total cellular content roughly twenty times higher, and the bone reservoir buffers the extracellular pool. This buffering is exactly why serum magnesium moved only 0.05 mmol/L across the 34 trials in Zhang\'s meta-analysis.',
        iconName: 'Battery',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Plugging the NMDA receptor, which is the whole basis of the calm claim',
        laymanDesc:
          'Magnesium physically sits inside the pore of an excitatory brain receptor and blocks it until the cell is strongly stimulated. That is the pharmacological story behind selling it for anxiety and sleep.',
        molecularDetail:
          'Extracellular magnesium occupies the NMDA receptor channel in a voltage-dependent manner and is expelled on depolarisation, making the receptor a coincidence detector. The step from that to a clinical anxiolytic effect requires brain extracellular magnesium to change measurably with oral intake, which is bounded by the same homeostasis that keeps serum flat. The randomised evidence for the endpoint is the 46-person Abbasi trial and the unblinded Tarleton crossover.',
        iconName: 'Brain',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'What comes out the other end, measurably',
        laymanDesc:
          'The kidney is the only real exit, so magnesium status is set by how much the kidney lets go — and whatever the gut does not absorb pulls water into the bowel on its way out.',
        molecularDetail:
          'The distal convoluted tubule reabsorbs magnesium through TRPM6 and sets the whole-body set point, which is why renal impairment turns a harmless supplement into an accumulating one. Unabsorbed luminal magnesium is osmotically active: across the Cochrane cramp trials, minor adverse events, mostly diarrhoea, ran 11 to 37 percent on magnesium against 10 to 14 percent on control, risk ratio 1.51 (95% CI 0.98 to 2.33).',
        iconName: 'Droplets',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Zhang 2016 meta-analysis of 34 double-blind placebo-controlled magnesium trials',
        phase: 'Meta-analysis of randomised double-blind placebo-controlled trials',
        sampleSize: 2028,
        primaryEndpoint: 'Change in systolic and diastolic blood pressure versus placebo',
        endpointMet: true,
        statisticalPValue:
          'Systolic -2.00 mmHg (95% CI 0.43 to 3.58); diastolic -1.78 mmHg (95% CI 0.73 to 2.82)',
        unreportedAdverseSignals:
          'Residual heterogeneity persisted after stratification by trial quality and dropout rate. Serum magnesium rose only 0.05 mmol/L, so the effect is not traceable to a large change in the measured analyte.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane CD009402 — magnesium for skeletal muscle cramps',
        phase: 'Cochrane systematic review of 11 randomised trials',
        sampleSize: 735,
        primaryEndpoint: 'Percentage change from baseline in number of cramps per week at four weeks',
        endpointMet: false,
        statisticalPValue:
          'MD -9.59% (95% CI -23.14 to 3.97); cramps per week MD -0.18 (95% CI -0.84 to 0.49); 25% responder RR 1.04 (95% CI 0.84 to 1.29), high certainty',
        unreportedAdverseSignals:
          'More minor adverse events on magnesium than control, RR 1.51 (95% CI 0.98 to 2.33). No randomised trials at all were found for exercise-associated cramps, which is a large part of the market.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Schuette 1994 — 26Mg-labelled diglycinate versus oxide in ileal resection',
        phase: 'Double-blind randomised crossover stable-isotope study',
        sampleSize: 12,
        primaryEndpoint: 'Fractional absorption of a 100 mg 26Mg-labelled dose',
        endpointMet: false,
        statisticalPValue:
          'No group difference: 23.5% chelate versus 22.8% oxide; subgroup of four poorest absorbers 23.5% versus 11.8% (P < .05)',
        unreportedAdverseSignals:
          'Twelve patients, all with surgically shortened bowels, is the entire direct human evidence base for the form that dominates the retail market.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Abbasi 2012 — magnesium for primary insomnia in the elderly',
        phase: 'Double-blind randomised placebo-controlled',
        sampleSize: 46,
        primaryEndpoint: 'Insomnia severity index and sleep log measures over eight weeks',
        endpointMet: true,
        statisticalPValue:
          'ISI P = 0.006, sleep onset latency P = 0.02, sleep efficiency P = 0.03; total sleep time P = 0.37 (not significant)',
        unreportedAdverseSignals:
          'The between-group difference in serum magnesium itself reached only P = 0.06, and total sleep time — arguably the endpoint a buyer cares about — was null.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'MAGIC — intravenous magnesium in ST-elevation myocardial infarction',
        phase: 'Randomised double-blind placebo-controlled',
        sampleSize: 6213,
        primaryEndpoint: '30-day all-cause mortality',
        endpointMet: false,
        statisticalPValue: 'Odds ratio 1.0 (95% CI 0.9 to 1.2), p = 0.96',
        unreportedAdverseSignals:
          'No benefit or harm in eight prespecified and fifteen exploratory subgroups. The trial exists because a 2,316-patient predecessor had reported a 24% mortality reduction that larger studies did not sustain.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Systolic blood pressure fell 2.00 mmHg and diastolic 1.78 mmHg across 34 double-blind trials in 2,028 people',
        'Serum magnesium rose by only 0.05 mmol/L across those same trials, because bone and kidney buffer the pool',
        'Fractional absorption of magnesium oxide was about 4 percent in normal volunteers, lower than chloride, lactate and aspartate',
        'Oral magnesium reliably increases minor gastrointestinal adverse events, RR 1.51 in the Cochrane pooled analysis',
      ],
      unsupportedInferences: [
        'That bisglycinate is better absorbed in people with normal intestines — the one comparative trial found no group difference in twelve ileal-resection patients',
        'That magnesium prevents muscle cramps, which Cochrane rated as high-certainty no in older adults and untested in exercise',
        'That magnesium is an established sleep aid, when the trial behind the claim was null for total sleep time in 46 people',
        'That a 6-point PHQ-9 improvement in an open-label, no-placebo crossover measures a drug effect rather than expectancy',
      ],
      whatFailedInitially: [
        'Intravenous magnesium in myocardial infarction: a 24% mortality reduction in 2,316 patients that 6,213 patients later flattened to an odds ratio of 1.0',
        'The idea that serum magnesium can adjudicate deficiency, which the reference interval was never built to do',
      ],
      realWorldOutcome: [
        'Magnesium is genuinely required, genuinely depleted by common drugs including proton pump inhibitors and diuretics, and genuinely under-consumed relative to reference intakes',
        'None of that establishes the specific retail claims, and the specific retail form has almost no trial literature of its own',
        'The one unambiguous consumer-facing effect of taking too much is diarrhoea, which is also how magnesium salts work as laxatives',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule or tablet, magnesium bis-glycinate chelate',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy or safety before sale. Elemental magnesium is only about 14 percent of the bisglycinate molecule by mass, so a 1,000 mg capsule of "magnesium glycinate" delivers on the order of 140 mg of magnesium — a labelling distinction that decides whether a product is comparable to the trials at all. Products may also be blends of magnesium oxide with free glycine rather than true chelates, which an elemental assay cannot detect.',
      safetyProfile:
        'Diarrhoea and abdominal cramping are dose-related and are the mechanism by which magnesium salts act as laxatives. Magnesium is cleared almost entirely by the kidney, so in chronic kidney disease supplemental magnesium accumulates and hypermagnesaemia — bradycardia, hypotension, respiratory depression at high levels — becomes a real risk. Oral magnesium also chelates tetracycline and fluoroquinolone antibiotics and bisphosphonates in the gut, reducing their absorption.',
    },
    commonQuestions: [
      {
        q: 'Is glycinate really better absorbed than the cheap magnesium oxide?',
        a: 'The honest answer is that the direct comparison has been run once, in twelve patients who had had part of their ileum surgically removed, and it found no difference for the group as a whole: 23.5 percent absorption for the glycinate against 22.8 percent for the oxide. The glycinate was absorbed faster and reached a higher peak, and it did better in the four patients who absorbed the oxide worst. That is a reasonable basis for preferring it in intestinal disease. It is not a basis for the claim printed on the tub.',
        auditNote:
          'The Firoz and Graber bioavailability study that most "oxide is poorly absorbed" copy points to did not test glycinate.',
      },
      {
        q: 'Does magnesium stop night cramps?',
        a: 'A Cochrane review of eleven trials in 735 people says no, and it graded one of those null results as high certainty. In older adults with idiopathic night cramps the difference against placebo was about a fifth of one cramp per week. For pregnancy-associated cramps the trials genuinely conflict and the review would not pool them. For exercise cramps there are no randomised trials at all, which is worth knowing before reading any confident claim about them.',
      },
      {
        q: 'What about magnesium for sleep and anxiety?',
        a: 'The mechanism is real and interesting: magnesium physically blocks the pore of the NMDA receptor. The clinical evidence is thinner than the marketing suggests. The insomnia trial had 46 elderly participants, improved questionnaire scores, and found no significant difference in total sleep time. The depression and anxiety trial had no blind and no placebo and used magnesium chloride, not glycinate. Neither is worthless; neither supports the confidence with which the claim is sold.',
        auditNote:
          'Glycine, the other half of the molecule, has its own small sleep literature and is a separate record on this site.',
      },
      {
        q: 'How would I know if I am actually deficient?',
        a: 'You largely would not, and that is the structural problem in this category. Serum magnesium is under one percent of the body\'s magnesium and is buffered by bone, so it falls late and recovers fast, and the reference interval it is judged against was set from population distributions rather than from outcomes. A normal result does not rule out depletion. It also means a supplement sold against invisible depletion can never be shown to have been unnecessary, which is a commercially useful property.',
      },
      {
        q: 'Who has a documented reason to take it?',
        a: 'People with real, mechanistically explained losses: long-term proton pump inhibitor use, loop and thiazide diuretics, chronic alcohol use, poorly controlled diabetes, and intestinal resection or malabsorption. The FDA has warned specifically about hypomagnesaemia with prolonged proton pump inhibitor therapy. That population is well defined and is not the population the retail category is aimed at.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Woods KL, Fletcher S, Roffe C, Haider Y. Intravenous magnesium sulphate in suspected acute myocardial infarction: results of the second Leicester Intravenous Magnesium Intervention Trial (LIMIT-2). Lancet 1992;339:1553-1558',
        identifier: '10.1016/0140-6736(92)91828-V',
        kind: 'doi',
      },
      {
        label:
          'Schuette SA, Lashner BA, Janghorbani M. Bioavailability of magnesium diglycinate vs magnesium oxide in patients with ileal resection. JPEN J Parenter Enteral Nutr 1994;18:430-435',
        identifier: '10.1177/0148607194018005430',
        kind: 'doi',
      },
      {
        label:
          'ISIS-4 Collaborative Group. ISIS-4: a randomised factorial trial assessing early oral captopril, oral mononitrate, and intravenous magnesium sulphate in 58,050 patients with suspected acute myocardial infarction. Lancet 1995;345:669-685',
        identifier: '10.1016/S0140-6736(95)90865-X',
        kind: 'doi',
      },
      {
        label:
          'Firoz M, Graber M. Bioavailability of US commercial magnesium preparations. Magnes Res 2001;14:257-262',
        identifier: '11794633',
        kind: 'pmid',
      },
      {
        label:
          'Magnesium in Coronaries (MAGIC) Trial Investigators. Early administration of intravenous magnesium to high-risk patients with acute myocardial infarction in the MAGIC Trial: a randomised controlled trial. Lancet 2002;360:1189-1196',
        identifier: '10.1016/S0140-6736(02)11278-5',
        kind: 'doi',
      },
      {
        label:
          'Abbasi B et al. The effect of magnesium supplementation on primary insomnia in elderly: a double-blind placebo-controlled clinical trial. J Res Med Sci 2012;17:1161-1169',
        identifier: '23853635',
        kind: 'pmid',
      },
      {
        label:
          'Zhang X et al. Effects of magnesium supplementation on blood pressure: a meta-analysis of randomized double-blind placebo-controlled trials. Hypertension 2016;68:324-333',
        identifier: '10.1161/HYPERTENSIONAHA.116.07664',
        kind: 'doi',
      },
      {
        label:
          'Costello RB et al. Perspective: the case for an evidence-based reference interval for serum magnesium: the time has come. Adv Nutr 2016;7:977-993',
        identifier: '10.3945/an.116.012765',
        kind: 'doi',
      },
      {
        label:
          'Tarleton EK, Littenberg B, MacLean CD, Kennedy AG, Daley C. Role of magnesium supplementation in the treatment of depression: a randomized clinical trial. PLoS One 2017;12:e0180067',
        identifier: '10.1371/journal.pone.0180067',
        kind: 'doi',
      },
      {
        label:
          'Garrison SR et al. Magnesium for skeletal muscle cramps. Cochrane Database Syst Rev 2020;9:CD009402',
        identifier: '10.1002/14651858.CD009402.pub3',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 84645 — Magnesium glycinate',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/84645',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Zinc — a real but dose-and-salt-dependent effect on cold duration, and two harms the category
  // does not print on the label: permanent anosmia from the nasal route, and copper depletion.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'zinc',
    name: 'Zinc',
    tradeName:
      'Sold as zinc gluconate, acetate, picolinate, citrate or oxide; the prescription zinc acetate product for Wilson disease is Galzin',
    sponsor:
      'No single sponsor — an essential trace element sold as several salts by many manufacturers. Zinc acetate is also an FDA-approved prescription drug under NDA 020458.',
    targetGene: 'SLC39A4',
    targetProtein:
      'ZIP4 (SLC39A4), the apical enterocyte zinc importer whose loss-of-function mutations cause acrodermatitis enteropathica. The counterpart that explains most of zinc\'s harms is metallothionein, a cysteine-rich cytosolic chelator that zinc itself induces in the enterocyte and that binds copper more tightly than zinc, trapping it for excretion in shed cells.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold over the counter for the common cold, immunity, skin and testosterone. Zinc acetate is separately an FDA-approved prescription drug for maintenance therapy in Wilson disease, and oral zinc is a WHO- and UNICEF-recommended treatment for acute childhood diarrhoea. Those two are genuine, evidenced indications, and neither is why most zinc is bought.',
    patientFriendlyIndication:
      'Taken at the first sign of a cold, and daily for immune support',
    conditionContext: {
      conditionExplainer:
        'The common cold is a self-limiting viral illness that resolves on its own in about a week. Any treatment for it is therefore competing with spontaneous recovery, and any trial has to separate a real shortening from the ordinary variation in how long colds last. This is why the zinc literature is so noisy: the effect being chased is a day or two against a background that already ends by itself.',
      whyItMatters:
        'Zinc is one of the very few over-the-counter cold remedies with a positive randomised signal, and the reason it took thirty years to make sense of is that the dose and the chemical salt both matter. It is also the supplement with the clearest documented ability to cause lasting harm: permanent loss of smell by one route, and copper deficiency with anaemia and spinal cord damage by another.',
      whoTakesThis:
        'Adults taking lozenges at cold onset, people on daily multivitamins containing zinc, children in low-income settings treated for diarrhoea under WHO guidance, patients with Wilson disease on prescription zinc acetate, and people with genuine deficiency from malabsorption, vegetarian diets high in phytate, or acrodermatitis enteropathica.',
      clinicalGoals:
        'Trials measured cold duration in days, proportion still symptomatic at follow-up, global symptom severity, diarrhoea duration in hours, progression to advanced macular degeneration, and — in the harm literature — olfactory threshold testing, serum copper, ceruloplasmin and neutrophil counts.',
    },
    oneSentenceVerdict:
      'Zinc lozenges probably do shorten a cold, but only above about 75 mg per day and best as the acetate salt, which is why half the trials found nothing; the prevention claim is null across 1,449 participants, and the two documented harms — permanent anosmia from nasal gels and copper deficiency from sustained high oral intake — are real and undersold.',
    laymanHowItWorks:
      'Zinc is a structural component of thousands of proteins, so a genuine shortage disables enzymes and immune cells across the body. What a lozenge does is different and local: it releases free zinc ions into the throat, where they appear to interfere with the rhinovirus replication cycle and with the receptor the virus uses to enter cells. That only happens if the lozenge actually releases free ionic zinc, which depends on what the zinc is bound to and how much of it there is. Swallowed daily at high doses, the same element blocks copper absorption, and copper deficiency is not a subtle condition.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 54,
    anatomicalSite:
      'Oropharyngeal mucosa for the lozenge effect; duodenal and jejunal enterocyte for absorption and for the copper interaction',
    substitutes: {
      summary:
        'For an acute cold there is no comparator that clearly beats zinc, because there is no established treatment for the common cold at all — the Cochrane authors say so in the first paragraph of their background. For deficiency, food and prescription zinc both work. For the nasal route there is no acceptable substitute discussion, because that route should not be used.',
      conventionalRx: [
        {
          name: 'Zinc acetate as prescription therapy for Wilson disease',
          class: 'Copper absorption blocker, FDA-approved under NDA 020458',
          howItCompares:
            'The same salt, prescribed precisely because it induces intestinal metallothionein and stops copper being absorbed. The mechanism regulators approved as the therapeutic action is identical to the mechanism that makes high-dose zinc supplementation dangerous in a person with normal copper handling.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: a clean, approved, mechanistically transparent use. Cons: it is also the clearest possible warning label for the supplement, and it is almost never presented as one.',
        },
        {
          name: 'Oral zinc for acute childhood diarrhoea, per WHO and UNICEF',
          class: 'Public-health mineral supplementation',
          howItCompares:
            'This is the strongest efficacy evidence zinc has anywhere. In children over six months, 33 trials in 10,841 children found diarrhoea shortened by about eleven hours, and in malnourished children by about a day, graded high certainty.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: large, replicated, and in the population where baseline zinc deficiency is common. Cons: in children under six months the same review found no effect, and the trials were run mostly in Asian settings at high risk of deficiency, so it is a repletion result rather than a general antiviral one.',
        },
      ],
      naturalFoods: [
        {
          name: 'Oysters, red meat, shellfish and organ meat',
          activeCompound: 'Zinc, in a form unencumbered by phytate',
          biologicalMechanism:
            'Animal-source zinc is absorbed far more efficiently than plant-source zinc because it is not bound to phytic acid, which chelates zinc in the gut lumen and blocks ZIP4-mediated uptake. Oysters carry more zinc per gram than any other common food by a wide margin.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: the Cochrane cold-treatment trials used zinc gluconate lozenges at 45 to 276 mg per day, which is many times any dietary intake.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Legumes and whole grains, as the phytate problem',
          activeCompound: 'Zinc bound to phytic acid',
          biologicalMechanism:
            'Phytate forms insoluble complexes with zinc in the intestinal lumen, which is why populations eating unleavened high-phytate staples have measurably higher rates of zinc deficiency despite adequate total zinc intake. Soaking, sprouting and leavening degrade phytate and raise absorption.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Never put zinc up your nose',
          action:
            'Distinguish the lozenge from the nasal gel or nasal swab. They are different products with different risk profiles, and only one of them has caused permanent injury.',
          patientImpact:
            'Twenty-five patients presenting to a single nasal dysfunction clinic with acute anosmia after homeopathic intranasal zinc gluconate gel were enough to satisfy all nine Bradford Hill criteria for causation. Zinc ions are directly toxic to olfactory epithelium.',
          clinicalPrecaution:
            'The loss was long-lasting or permanent in some cases. The authors of that analysis called for increased FDA oversight of homeopathic medications on the strength of it.',
        },
        {
          name: 'If a daily zinc habit is long-term, copper is the thing to watch',
          action:
            'Sustained high-dose zinc induces intestinal metallothionein, which binds copper and carries it out in shed enterocytes. The result is a copper deficiency that presents haematologically or neurologically, often without the zinc being suspected.',
          patientImpact:
            'Willis et al. reported three cases first recognised on bone marrow examination: sideroblastic anaemia and severe neutropenia, two of them with progressive peripheral neuropathy. Kumar\'s Mayo Clinic series describes a copper deficiency myelopathy with spastic gait and sensory ataxia that mimics vitamin B12 subacute combined degeneration.',
          clinicalPrecaution:
            'Copper replacement resolves the anaemia and neutropenia promptly and completely. The neurological damage often does not recover; supplementation mainly prevents further deterioration. AREDS included 2 mg of copper alongside its 80 mg of zinc for exactly this reason.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(=O)[O-].CC(=O)[O-].[Zn+2]',
      chemicalFormula: 'C4H6O4Zn',
      molecularWeight:
        '183.5 g/mol for zinc acetate, of which 65.4 g/mol is elemental zinc. The marker salt here is the acetate because it is the form that produced the largest cold-duration effect in Hemila\'s dose-stratified analysis, and the form approved as a prescription drug.',
      structureSource: {
        label: 'PubChem CID 11192 — Zinc acetate, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11192',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'zn-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Elemental zinc content and cadmium and lead screen on the raw salt',
          description:
            'Zinc ores carry cadmium and lead, and both follow zinc through refining. A label states elemental zinc; it does not state what came along with it. Assay both the declared element and the contaminants before anything is formulated, because a lozenge is dosed at many times dietary intake and so multiplies any contaminant proportionally.',
          reagentsAndBuffer:
            'Microwave acid digestion in nitric acid and hydrogen peroxide; ICP-MS against certified zinc, cadmium and lead standards; NIST-traceable reference material as the accuracy control; loss on drying and residue on ignition',
        },
        {
          id: 'zn-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Formulation of lozenges with and without free-ion-quenching excipients',
          description:
            'The active species in the throat is the free zinc ion, and common lozenge excipients bind it. Citric acid, tartaric acid, sorbitol and mannitol chelate zinc and abolish ionic release, which is the most likely reason many early lozenge trials were flatly negative. Prepare matched lozenges that differ only in whether a chelating excipient is present.',
          dependsOnStepId: 'zn-w1',
          reagentsAndBuffer:
            'Zinc acetate dihydrate and zinc gluconate; glycine as a non-quenching buffer; citric acid, tartaric acid, sorbitol and mannitol as the deliberate negative-control excipients; hard-candy base compressed without heat degradation',
        },
        {
          id: 'zn-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Measurement of free ionic zinc release into simulated saliva',
          description:
            'Separate total zinc from free ionic zinc. A lozenge can dissolve completely and release almost no free Zn2+ if the counter-ion or excipient holds it, and total-zinc assays cannot tell the two situations apart. This is the step that converts a formulation into a testable dose of the actual active species.',
          dependsOnStepId: 'zn-w2',
          reagentsAndBuffer:
            'Simulated saliva at pH 7.4 with mucin and salivary electrolytes at 37 degrees C; zinc-selective fluorescent probe (FluoZin-3) calibrated against zinc-EGTA buffers; ion-selective electrode as an orthogonal method; ultrafiltration to separate bound from free zinc',
        },
        {
          id: 'zn-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Rhinovirus replication in human airway epithelium under defined free-zinc exposure',
          description:
            'Expose differentiated primary human nasal or bronchial epithelial cultures at air-liquid interface to rhinovirus and to the free-zinc concentrations actually achieved in step three, not to a nominal salt concentration. Include a metallothionein induction readout, because the same exposure that inhibits virus also starts the copper-binding process that causes the systemic harm.',
          dependsOnStepId: 'zn-w3',
          reagentsAndBuffer:
            'Primary human airway epithelial cells at air-liquid interface; rhinovirus serotype 14 and serotype 1B; zinc-buffered media at defined free Zn2+; TPEN as a membrane-permeant zinc chelator control; qPCR for MT2A induction; ICAM-1 surface staining',
        },
        {
          id: 'zn-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Viral titre alongside a copper-status panel, reported together',
          description:
            'Quantify viral RNA copies and infectious titre, and in any in vivo arm report serum copper, ceruloplasmin, neutrophil count and serum zinc from the same subjects at the same visits. Reporting efficacy without the copper panel is how zinc-induced copper deficiency stayed a case-report finding for decades rather than a trial finding.',
          dependsOnStepId: 'zn-w4',
          reagentsAndBuffer:
            'Rhinovirus RT-qPCR standard curve; TCID50 titration on HeLa-H1 cells; ICP-MS serum copper and zinc; immunoturbidimetric ceruloplasmin; automated differential white cell count',
        },
      ],
    },
    keyAudits: [
      {
        id: 'zn-a1',
        category: 'measured',
        title: 'Cochrane 2024: about two days off a cold, at low certainty, and nothing for prevention',
        laymanSummary:
          'Thirty-four trials in 8,526 people. Taking zinc once a cold has started may shorten it by roughly two days. Taking it to avoid catching one does nothing.',
        technicalDetails:
          'Thirty-four randomised trials (15 prevention, 19 treatment) in 8,526 participants, 22 in adults and 12 in children. For treatment, mean duration of cold fell by 2.37 days (95% CI -4.21 to -0.53) across 8 studies and 972 participants, but with I-squared of 97% and graded LOW certainty. Whether zinc reduced the risk of still having a cold at end of follow-up was uncertain (RR 0.52, 95% CI 0.21 to 1.27, very low certainty), and global symptom severity showed nothing (SMD -0.03, 95% CI -0.56 to 0.50). For prevention there may be little or no reduction in the risk of developing a cold (RR 0.93, 95% CI 0.85 to 1.01; 9 studies, 1,449 participants; low certainty) and little or no reduction in the number of colds over 5 to 18 months. Non-serious adverse events were probably increased by treatment zinc (RR 1.34, 95% CI 1.15 to 1.55; 16 studies, 2,084 participants; moderate certainty) — the highest certainty grade attached to any treatment finding in the review is the harm, not the benefit.',
        evidenceSource: 'Nault D et al. Cochrane Database Syst Rev 2024;5:CD014914',
        doi: '10.1002/14651858.CD014914.pub2',
        measuredMetric:
          'Mean duration of cold in days, proportion developing a cold, and rate of non-serious adverse events',
        auditFlag: 'verified',
      },
      {
        id: 'zn-a2',
        category: 'conclusion_shift',
        title: 'Hemila 2011 explained thirty years of contradiction: the dose and the salt',
        laymanSummary:
          'Zinc trials had contradicted each other for decades. Splitting them by how much zinc was given resolved it: below a threshold, every trial found nothing; above it, they found a large effect.',
        technicalDetails:
          'Hemila pooled thirteen placebo-controlled comparisons of zinc lozenges in natural colds. Five trials using a total daily zinc dose below 75 mg uniformly found no effect. Three trials using zinc acetate above 75 mg per day pooled to a 42% reduction in cold duration (95% CI 35% to 48%). Five trials using zinc salts other than acetate above 75 mg per day pooled to a 20% reduction (95% CI 12% to 28%). The conclusion is that the lozenge effect is heterogeneous by design rather than by chance: the negative trials were not failed replications, they were tests of a dose that could not work. The chemistry underneath is that only free ionic zinc is active, and common lozenge excipients such as citric acid, tartaric acid, sorbitol and mannitol chelate it. This is the cleanest example on this site of a field changing its mind not about whether something works but about what "it" was.',
        evidenceSource: 'Hemila H. Open Respir Med J 2011;5:51-58',
        doi: '10.2174/1874306401105010051',
        measuredMetric:
          'Pooled percentage reduction in common cold duration, stratified by total daily zinc dose and by zinc salt',
        auditFlag: 'verified',
      },
      {
        id: 'zn-a3',
        category: 'failed',
        title: 'COVID A to Z: 214 patients, stopped early, zinc did nothing',
        laymanSummary:
          'A randomised trial of high-dose zinc and vitamin C in outpatients with COVID-19 was halted early because there was no sign either was working.',
        technicalDetails:
          'A multicentre open-label factorial randomised trial at Cleveland Clinic sites in Ohio and Florida enrolled 214 outpatients with PCR-confirmed SARS-CoV-2 between April and October 2020, allocated 1:1:1:1 to ten days of zinc gluconate 50 mg, ascorbic acid 8,000 mg, both, or usual care. The primary endpoint was days to a 50% reduction in a four-symptom severity score. The study was stopped for low conditional power for benefit. Usual care reached 50% symptom reduction at a mean of 6.7 (SD 4.4) days, against 5.9 (4.9) days for zinc, 5.5 (3.7) for ascorbic acid and 5.5 (3.4) for both — overall P = .45, with no significant difference in any secondary outcome. The trial is open-label and was not designed to detect a small effect, but it is the direct randomised test of the exact combination that was being bought by the million during the pandemic.',
        evidenceSource: 'Thomas S et al. JAMA Netw Open 2021;4:e210369',
        doi: '10.1001/jamanetworkopen.2021.0369',
        measuredMetric: 'Days to 50% reduction in a composite fever, cough, dyspnoea and fatigue score',
        auditFlag: 'verified',
      },
      {
        id: 'zn-a4',
        category: 'failed',
        title: 'Intranasal zinc gluconate causes anosmia, and the causation analysis is formal',
        laymanSummary:
          'A homeopathic zinc nasal gel sold for colds destroyed people\'s sense of smell. In some cases it never came back.',
        technicalDetails:
          'Jafek, Linschoten and Murrow reported a case series of severe hyposmia and anosmia following intranasal zinc gluconate, concluding that zinc ions are toxic to olfactory epithelium and that the loss appeared long-lasting or permanent in some cases, with the mechanism attributed to direct action of the divalent zinc ion on the olfactory receptor cell. Davidson and Smith later applied all nine Bradford Hill criteria — strength, consistency, specificity, temporality, biological gradient, plausibility, coherence, experimental evidence and analogy — to 25 patients presenting to the University of California San Diego Nasal Dysfunction Clinic with acute-onset anosmia after intranasal homeopathic zinc gluconate gel, and concluded that the clinical, biological and experimental data support causation. Their stated conclusion was that increased FDA oversight of homeopathic medications is needed. This is a harm caused by route, not by element: the same zinc in a lozenge does not do this.',
        evidenceSource:
          'Jafek BW, Linschoten MR, Murrow BW. Am J Rhinol 2004;18:137-141; Davidson TM, Smith WM. Arch Otolaryngol Head Neck Surg 2010;136:673-676',
        doi: '10.1001/archoto.2010.111',
        measuredMetric: 'Olfactory function after intranasal zinc gluconate exposure',
        auditFlag: 'verified',
      },
      {
        id: 'zn-a5',
        category: 'inferred',
        title: 'Copper depletion: the approved drug action, sold as a side effect nobody mentions',
        laymanSummary:
          'High-dose zinc blocks copper absorption. That is not a rare quirk — it is the reason the FDA approved zinc as a prescription drug for a copper-overload disease. In people without that disease it causes anaemia, low white cells and spinal cord damage.',
        technicalDetails:
          'Zinc induces metallothionein in the enterocyte; metallothionein binds copper with higher affinity than zinc and holds it until the cell is shed, so copper never reaches the circulation. The FDA approved zinc acetate under NDA 020458 for maintenance therapy in Wilson disease on exactly this mechanism. In people with normal copper handling, Willis et al. reported three cases of zinc-induced copper deficiency first suspected on bone marrow examination: sideroblastic anaemia and severe neutropenia, two of the three with progressive peripheral neuropathy, one of them arising from zinc taken for acrodermatitis enteropathica. Kumar\'s Mayo Clinic review of copper deficiency myelopathy describes a spastic gait with prominent sensory ataxia that mirrors vitamin B12 subacute combined degeneration, lists excess zinc ingestion among the established causes, and records the crucial asymmetry: copper replacement resolves the anaemia and neutropenia promptly and completely, while neurological improvement is often only subjective and mainly prevents further deterioration.',
        evidenceSource:
          'Willis MS et al. Am J Clin Pathol 2005;123:125-131; Kumar N. Mayo Clin Proc 2006;81:1371-1384',
        doi: '10.1309/V6GVYW2QTYD5C5PJ',
        inferredClaim:
          'That daily high-dose zinc is a benign long-term habit, when the same mechanism is licensed as a copper-blocking drug and its failure mode includes irreversible myelopathy',
        auditFlag: 'caution',
      },
      {
        id: 'zn-a6',
        category: 'measured',
        title: 'AREDS: the eye result everyone cites, where zinc alone missed significance',
        laymanSummary:
          'The famous eye trial that put zinc in millions of supplements found the full antioxidant-plus-zinc formula worked. Zinc on its own did not reach the significance bar in the whole group.',
        technicalDetails:
          'The Age-Related Eye Disease Study randomised 3,640 participants aged 55 to 80 to antioxidants (vitamin C 500 mg, vitamin E 400 IU, beta carotene 15 mg), zinc 80 mg as zinc oxide with copper 2 mg as cupric oxide, both, or placebo, with average follow-up of 6.3 years and a prespecified significance level of .01. Against placebo, antioxidants plus zinc reduced the odds of progression to advanced AMD (OR 0.72, 99% CI 0.52 to 0.98). Zinc alone gave OR 0.75 (99% CI 0.55 to 1.03) and antioxidants alone OR 0.80 (99% CI 0.59 to 1.09) — neither crossing the threshold in the full cohort. Excluding the 1,063 lowest-risk participants, whose five-year probability of progression was only 1.3%, zinc alone reached OR 0.71 (99% CI 0.52 to 0.99). The only significant reduction in at least moderate visual acuity loss was in the combined arm (OR 0.73, 99% CI 0.54 to 0.99). Two facts the supplement aisle rarely carries forward: the benefit was confined to people already at high risk, and copper was included in the formulation specifically to offset zinc-induced copper deficiency.',
        evidenceSource:
          'Age-Related Eye Disease Study Research Group. AREDS Report No. 8. Arch Ophthalmol 2001;119:1417-1436',
        doi: '10.1001/archopht.119.10.1417',
        measuredMetric:
          'Odds of photographic progression to advanced AMD and of at least 15-letter visual acuity loss over 6.3 years',
        auditFlag: 'verified',
      },
      {
        id: 'zn-a7',
        category: 'measured',
        title: 'Childhood diarrhoea: the strongest zinc evidence anywhere, and it is age-limited',
        laymanSummary:
          'In children over six months old, zinc shortens acute diarrhoea by about half a day, and by a full day in malnourished children. In babies under six months it does nothing.',
        technicalDetails:
          'Thirty-three trials in 10,841 children, mostly in Asian settings at high risk of zinc deficiency. In children older than six months, zinc shortened mean diarrhoea duration by 11.46 hours (95% CI -19.72 to -3.19; 2,581 children, 9 trials, low certainty) and probably reduced the proportion whose diarrhoea persisted to day seven (RR 0.73, 95% CI 0.61 to 0.88; 3,865 children, 6 trials, moderate certainty). In children with signs of malnutrition the effect was larger and the certainty higher: 26.39 hours shorter (95% CI -36.54 to -16.23; 419 children, 5 trials, HIGH certainty). In children younger than six months the evidence suggests no effect on mean duration. There was not enough evidence to say whether zinc reduces death or hospitalisation. The pattern is the same one that runs through this whole file: the effect is largest where the deficiency is real, and disappears where it is not.',
        evidenceSource: 'Lazzerini M, Wanzira H. Cochrane Database Syst Rev 2016;12:CD005436',
        doi: '10.1002/14651858.CD005436.pub5',
        measuredMetric:
          'Mean duration of acute diarrhoea in hours, and proportion with diarrhoea persisting to day seven',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The lozenge only matters if it lets the zinc ion go',
        laymanDesc:
          'A zinc lozenge is not a dose of zinc — it is a dose of whatever free zinc it releases in your mouth. Many common sweeteners and acids grab the zinc and never let go, and a lozenge like that does nothing.',
        molecularDetail:
          'The proposed antiviral species is free Zn2+ released in the oropharynx. Citric acid, tartaric acid, sorbitol and mannitol chelate zinc and suppress ionic release. Hemila\'s dose stratification is the observable consequence: below 75 mg per day, five trials found nothing at all, while zinc acetate above 75 mg pooled to a 42% duration reduction.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Free zinc meets the airway epithelium the virus is replicating in',
        laymanDesc:
          'Rhinovirus enters cells lining the nose and throat through a specific docking protein. Zinc ions in that space appear to interfere both with the docking and with the virus assembling copies of itself.',
        molecularDetail:
          'Rhinovirus major-group serotypes enter through ICAM-1. Proposed zinc actions include interference with the viral 3C protease cleavage of the polyprotein and with capsid assembly, plus upregulation of interferon responses. None of these has been demonstrated in vivo at achievable mucosal free-zinc concentrations, which is why the Cochrane certainty grade for the duration effect is low despite the effect being real in the pooled estimate.',
        iconName: 'ShieldAlert',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Swallowed zinc takes a different path entirely, through ZIP4',
        laymanDesc:
          'Zinc that goes down rather than staying in the throat is absorbed in the small intestine by a dedicated importer, the same one that is broken in a rare inherited disease of zinc deficiency.',
        molecularDetail:
          'ZIP4 (SLC39A4) on the apical enterocyte membrane carries most dietary zinc uptake and is upregulated during deficiency. Loss-of-function mutations cause acrodermatitis enteropathica, the disease that established zinc as essential. Luminal phytate chelates zinc and blocks this step, which is the mechanistic basis of zinc deficiency in high-phytate diets.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Zinc induces the protein that traps copper, and copper never gets in',
        laymanDesc:
          'Inside gut cells zinc switches on a small binding protein. That protein prefers copper. Copper gets stuck to it, the cell is shed into the gut a few days later, and the copper leaves with it.',
        molecularDetail:
          'Metallothionein induction by zinc is dose-dependent, and metallothionein binds Cu(I) with higher affinity than Zn(II). Copper is sequestered in the enterocyte and lost on cell turnover. This is the licensed pharmacology of zinc acetate in Wilson disease under NDA 020458, and it is the same event that produces sideroblastic anaemia, neutropenia and myelopathy in people who do not have Wilson disease.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Two outcomes from one element, separated only by dose and duration',
        laymanDesc:
          'Short bursts at cold onset may take a day or two off a cold. Sustained high daily intake quietly strips copper, and the first sign of that is often a blood count or a change in the way someone walks.',
        molecularDetail:
          'The therapeutic window is defined by time, not just amount. Cochrane found treatment courses of 4.5 to 21 days, over which copper depletion does not develop. Willis\'s three cases and Kumar\'s myelopathy series arose from sustained intake. Anaemia and neutropenia reverse completely on copper replacement; the neurological deficit generally does not.',
        iconName: 'GitBranch',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane CD014914 — zinc for prevention and treatment of the common cold',
        phase: 'Cochrane systematic review of 34 randomised trials',
        sampleSize: 8526,
        primaryEndpoint:
          'Proportion developing a cold (prevention) and mean duration of cold in days (treatment)',
        endpointMet: true,
        statisticalPValue:
          'Treatment duration MD -2.37 days (95% CI -4.21 to -0.53), I2 = 97%, low certainty; prevention RR 0.93 (95% CI 0.85 to 1.01), low certainty',
        unreportedAdverseSignals:
          'Non-serious adverse events probably increased with treatment zinc, RR 1.34 (95% CI 1.15 to 1.55), moderate certainty — a higher certainty grade than any efficacy finding in the review. No treatment study reported serious adverse events at all.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Hemila 2011 dose-stratified pooling of 13 zinc lozenge comparisons',
        phase: 'Systematic review with dose stratification',
        sampleSize: 13,
        primaryEndpoint: 'Percentage reduction in common cold duration by total daily zinc dose',
        endpointMet: true,
        statisticalPValue:
          'Zinc acetate above 75 mg/day: 42% reduction (95% CI 35% to 48%); other salts above 75 mg/day: 20% (95% CI 12% to 28%); below 75 mg/day: uniformly no effect',
        unreportedAdverseSignals:
          'Sample size here counts trial comparisons, not participants. High-dose zinc lozenges taste unpleasant, which makes blinding hard, and the review could not exclude unblinding as a contributor.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT04342728 — COVID A to Z, zinc and ascorbic acid in ambulatory COVID-19',
        phase: 'Randomised open-label factorial',
        sampleSize: 214,
        primaryEndpoint: 'Days to a 50% reduction in composite symptom severity score',
        endpointMet: false,
        statisticalPValue: 'Overall P = .45 across the four arms',
        unreportedAdverseSignals:
          'Stopped early for low conditional power for benefit. Open-label with a subjective primary endpoint, so it was biased toward finding an effect and still found none.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'AREDS Report No. 8 — antioxidants and zinc for age-related macular degeneration',
        phase: 'Randomised double-masked placebo-controlled',
        sampleSize: 3640,
        primaryEndpoint:
          'Photographic progression to advanced AMD and at least 15-letter visual acuity loss',
        endpointMet: true,
        statisticalPValue:
          'Antioxidants plus zinc OR 0.72 (99% CI 0.52 to 0.98); zinc alone OR 0.75 (99% CI 0.55 to 1.03), not significant at the prespecified .01 level',
        unreportedAdverseSignals:
          'Benefit was confined to participants already at high risk; the 1,063 lowest-risk participants had only a 1.3% five-year progression probability. The formulation included 2 mg copper to offset zinc-induced copper deficiency, and the beta carotene component was later removed after lung cancer signals in smokers.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Cochrane CD005436 — oral zinc for acute diarrhoea in children',
        phase: 'Cochrane systematic review of 33 randomised trials',
        sampleSize: 10841,
        primaryEndpoint: 'Duration and severity of diarrhoea',
        endpointMet: true,
        statisticalPValue:
          'Over six months: MD -11.46 hours (95% CI -19.72 to -3.19), low certainty; malnourished children MD -26.39 hours (95% CI -36.54 to -16.23), high certainty',
        unreportedAdverseSignals:
          'No effect in children under six months. Not enough evidence to say whether zinc reduces death or hospitalisation. Trials were concentrated in populations at high baseline risk of zinc deficiency.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Zinc lozenges above 75 mg per day shortened colds; zinc acetate pooled to a 42% duration reduction and other salts to 20%',
        'Below 75 mg per day, five placebo-controlled trials uniformly found no effect at all',
        'Zinc did not prevent colds across 9 studies and 1,449 participants, RR 0.93 (95% CI 0.85 to 1.01)',
        'In children over six months, zinc shortened acute diarrhoea by about 11 hours, and by 26 hours in malnourished children at high certainty',
        'Intranasal zinc gluconate causes hyposmia and anosmia, sometimes permanently, satisfying all nine Bradford Hill criteria',
      ],
      unsupportedInferences: [
        'That daily zinc supports immunity in a replete adult — the prevention arm of the Cochrane review is null',
        'That the cold benefit transfers across salts and doses, when the entire effect is confined to high-dose acetate and near-acetate formulations',
        'That the AREDS eye result licenses zinc for the general population, when zinc alone missed the prespecified significance level in the full cohort',
        'That long-term high-dose zinc is harmless, when the same mechanism is an approved copper-blocking drug',
      ],
      whatFailedInitially: [
        'Zinc and vitamin C in outpatient COVID-19: 214 patients, stopped early, P = .45',
        'The first two decades of zinc lozenge trials, which were testing doses and formulations that could not release free zinc',
        'Intranasal zinc as a cold remedy, which caused permanent olfactory loss and was withdrawn from the US market in 2009',
      ],
      realWorldOutcome: [
        'Zinc is one of very few over-the-counter cold treatments with any positive randomised signal, and the signal is genuine within its dose and salt window',
        'The best-evidenced use of oral zinc anywhere is childhood diarrhoea in populations where deficiency is common — a repletion effect, not an antiviral one',
        'Copper deficiency from sustained zinc is under-recognised because it presents to haematology or neurology, not to the person selling the zinc',
      ],
    },
    deliverySystem: {
      type: 'Oral lozenge, tablet, capsule or syrup; formerly also an intranasal gel',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy or safety before sale. The lozenge and the swallowed capsule are pharmacologically different interventions: the lozenge acts locally in the oropharynx through free ionic zinc, the capsule acts systemically after ZIP4-mediated absorption, and evidence for one does not transfer to the other. The intranasal route is a third thing again and caused permanent injury. Elemental zinc is a minority of every salt by mass — 36% of zinc acetate, 14% of zinc gluconate — so label doses are not comparable unless the elemental figure is given.',
      safetyProfile:
        'Unpleasant taste, nausea and mouth irritation are common with high-dose lozenges and probably compromised blinding in some trials; Cochrane found non-serious adverse events probably increased with treatment zinc at RR 1.34. Sustained high-dose oral zinc induces intestinal metallothionein and causes copper deficiency, presenting as sideroblastic anaemia, neutropenia, or a myelopathy with spastic gait and sensory ataxia in which the haematology reverses on copper replacement and the neurology often does not. Zinc reduces absorption of tetracycline and fluoroquinolone antibiotics and of penicillamine. Intranasal zinc gluconate is directly toxic to olfactory epithelium and should not be used.',
    },
    commonQuestions: [
      {
        q: 'Does zinc actually shorten a cold?',
        a: 'Probably, within a narrow window. The 2024 Cochrane review found treatment shortened colds by about 2.4 days but graded that low certainty because the trials disagreed enormously. Hemila\'s earlier analysis explains why they disagreed: every trial using less than 75 mg of zinc a day found nothing, and the trials using more than that — especially as zinc acetate — found reductions of 20 to 42 percent. So the honest answer is that some zinc products plausibly work and many cannot, and the label rarely tells you which you have bought.',
        auditNote:
          'Free ionic zinc is the active species, and citric acid, tartaric acid, sorbitol and mannitol in a lozenge chelate it away.',
      },
      {
        q: 'Should I take zinc every day to avoid getting colds?',
        a: 'The prevention evidence is null. Across nine trials and 1,449 participants the risk ratio for developing a cold was 0.93 with a confidence interval that crosses one, graded low certainty. Meanwhile daily long-term zinc is the exposure that causes copper depletion, and copper depletion is not a mild condition. Prevention is the use with the weakest evidence and the greatest cumulative exposure, which is an unfavourable combination.',
      },
      {
        q: 'How can zinc cause a copper deficiency?',
        a: 'Because it is supposed to. Zinc switches on metallothionein inside gut cells, metallothionein binds copper harder than it binds zinc, and the trapped copper leaves the body when the cell is shed a few days later. The FDA licensed zinc acetate as a prescription drug for Wilson disease on precisely this mechanism, because in Wilson disease blocking copper is the goal. In anyone else, sustained high-dose zinc has produced sideroblastic anaemia, severe neutropenia and a spinal cord syndrome resembling B12 deficiency. The blood problems fix completely with copper. The neurological ones frequently do not.',
        auditNote:
          'AREDS put 2 mg of copper into its formula alongside 80 mg of zinc for exactly this reason.',
      },
      {
        q: 'What happened with zinc nasal sprays?',
        a: 'They destroyed people\'s sense of smell. Jafek and colleagues described a series of severe hyposmia and anosmia after intranasal zinc gluconate and concluded that zinc ions are directly toxic to olfactory epithelium, with loss that was long-lasting or permanent in some cases. Davidson and Smith later ran the full nine Bradford Hill causation criteria over 25 such patients and found causation supported. The products were withdrawn from the US market in 2009. Nothing about that finding applies to a lozenge, and nothing about lozenge evidence excused the nasal product.',
      },
      {
        q: 'Is the zinc in my multivitamin doing anything?',
        a: 'If you are not zinc-deficient, most likely nothing you would notice, and it is far below the lozenge doses that shortened colds. If you are deficient — through malabsorption, a very high-phytate diet, or acrodermatitis enteropathica — then zinc is genuinely essential and repletion matters a great deal. The pattern across the whole zinc literature, from childhood diarrhoea to cold duration, is that the effect is biggest where the deficiency is real and vanishes where it is not.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Age-Related Eye Disease Study Research Group. A randomized, placebo-controlled, clinical trial of high-dose supplementation with vitamins C and E, beta carotene, and zinc for age-related macular degeneration and vision loss: AREDS report no. 8. Arch Ophthalmol 2001;119:1417-1436',
        identifier: '10.1001/archopht.119.10.1417',
        kind: 'doi',
      },
      {
        label:
          'Jafek BW, Linschoten MR, Murrow BW. Anosmia after intranasal zinc gluconate use. Am J Rhinol 2004;18:137-141',
        identifier: '15283486',
        kind: 'pmid',
      },
      {
        label:
          'Willis MS et al. Zinc-induced copper deficiency: a report of three cases initially recognized on bone marrow examination. Am J Clin Pathol 2005;123:125-131',
        identifier: '10.1309/V6GVYW2QTYD5C5PJ',
        kind: 'doi',
      },
      {
        label: 'Kumar N. Copper deficiency myelopathy (human swayback). Mayo Clin Proc 2006;81:1371-1384',
        identifier: '10.4065/81.10.1371',
        kind: 'doi',
      },
      {
        label:
          'Davidson TM, Smith WM. The Bradford Hill criteria and zinc-induced anosmia: a causality analysis. Arch Otolaryngol Head Neck Surg 2010;136:673-676',
        identifier: '10.1001/archoto.2010.111',
        kind: 'doi',
      },
      {
        label:
          'Hemila H. Zinc lozenges may shorten the duration of colds: a systematic review. Open Respir Med J 2011;5:51-58',
        identifier: '10.2174/1874306401105010051',
        kind: 'doi',
      },
      {
        label:
          'Lazzerini M, Wanzira H. Oral zinc for treating diarrhoea in children. Cochrane Database Syst Rev 2016;12:CD005436',
        identifier: '10.1002/14651858.CD005436.pub5',
        kind: 'doi',
      },
      {
        label:
          'Thomas S et al. Effect of high-dose zinc and ascorbic acid supplementation vs usual care on symptom length and reduction among ambulatory patients with SARS-CoV-2 infection: the COVID A to Z randomized clinical trial. JAMA Netw Open 2021;4:e210369',
        identifier: '10.1001/jamanetworkopen.2021.0369',
        kind: 'doi',
      },
      {
        label: 'COVID A to Z trial registration',
        identifier: 'NCT04342728',
        kind: 'nct',
      },
      {
        label:
          'Nault D et al. Zinc for prevention and treatment of the common cold. Cochrane Database Syst Rev 2024;5:CD014914',
        identifier: '10.1002/14651858.CD014914.pub2',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA — NDA 020458, GALZIN (zinc acetate) capsules for Wilson disease',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020458',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 11192 — Zinc acetate',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11192',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Atorvastatin — the best-selling drug in history, and the cleanest case of a measured
  //    surrogate, a measured outcome, and a side effect that two n-of-1 trials could not find.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'atorvastatin',
    name: 'Atorvastatin',
    tradeName: 'Lipitor',
    sponsor:
      'Parke-Davis / Warner-Lambert (originator), acquired by Pfizer; generic in the United States since November 2011',
    targetGene: 'HMGCR',
    targetProtein: '3-hydroxy-3-methylglutaryl-coenzyme A reductase',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Reduction of the risk of myocardial infarction, stroke, revascularisation and angina in adults with multiple risk factors or type 2 diabetes; secondary prevention in coronary heart disease; and reduction of elevated LDL cholesterol in primary hyperlipidaemia and heterozygous familial hypercholesterolaemia',
    patientFriendlyIndication: 'High cholesterol, and the risk of a heart attack or a stroke',
    anatomicalSite: 'Hepatocyte endoplasmic reticulum (liver)',
    conditionContext: {
      conditionExplainer:
        'LDL particles carry cholesterol through the blood. When there are too many of them for too long, some lodge in the artery wall, are taken up by immune cells, and build a plaque. A plaque that ruptures forms a clot, and the clot is the heart attack. The liver both makes cholesterol and clears LDL particles out of the blood, and it does the second job using a receptor whose number it adjusts according to how much cholesterol it has.',
      whyItMatters:
        'Two different things are being counted on this page and they are not the same thing. LDL cholesterol is a number in a blood tube, measured in weeks. A heart attack is an event, counted over years. Atorvastatin has trials of both, which is why it is on this list — most drugs that move a blood number have never been asked to move an event.',
      whoTakesThis:
        'Adults with established cardiovascular disease, adults with diabetes and a risk factor, and adults whose calculated risk crosses a guideline threshold. It is on the WHO Model List of Essential Medicines and was the highest-grossing pharmaceutical product ever sold.',
      clinicalGoals:
        'Lower LDL cholesterol and, in the outcome trials, reduce the count of non-fatal myocardial infarction, fatal coronary heart disease and stroke. In ASCOT-LLA and CARDS those event reductions were reached. All-cause mortality was not significantly reduced in either.',
    },
    oneSentenceVerdict:
      'The most-studied lipid-lowering drug there is: 100 versus 154 primary coronary events in 10,305 hypertensive patients in ASCOT-LLA and a 37% event reduction in 2,838 diabetic patients in CARDS, both statistically solid, alongside two independent n-of-1 trial programmes that found no difference at all between atorvastatin and placebo in muscle symptoms among people who had already reported them.',
    laymanHowItWorks:
      'Cholesterol is manufactured inside liver cells by a chain of chemical steps, and atorvastatin jams the slowest step of that chain. The cell notices it is short of cholesterol and responds by putting more collection receptors on its surface, which pull LDL particles out of the bloodstream. The blood number falls mainly because the liver is now clearing more of it, not because less is being made.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 92,
    substitutes: {
      summary:
        'Atorvastatin costs between two and seven cents a tablet in the United States at pharmacy acquisition cost, depending on strength. Rosuvastatin lowers LDL slightly further at equivalent strengths and costs about the same. Ezetimibe adds a real but small further reduction on top of a statin. The injectable PCSK9 antibodies lower LDL much further and cost roughly four thousand times as much per unit of dispensing. No food or supplement has an event trial.',
      conventionalRx: [
        {
          name: 'Rosuvastatin (Crestor)',
          class: 'HMG-CoA reductase inhibitor',
          howItCompares:
            'Lowers LDL slightly more per milligram and has its own primary-prevention outcome trials in JUPITER and HOPE-3. It also failed in heart failure and in dialysis, where atorvastatin was never tested at scale. Neither statin has beaten the other on events in a head-to-head outcome trial.',
          typicalCost:
            'US$0.037 per 10 mg generic rosuvastatin calcium tablet at pharmacy acquisition cost (CMS NADAC, effective 19 August 2026); brand CRESTOR was US$8.81 per tablet in the same file',
          prosAndCons:
            'Pros: greater LDL reduction per milligram, less dependent on CYP3A4 so fewer interactions. Cons: same class-wide diabetes signal, and the negative trials in CORONA, GISSI-HF and AURORA belong to it.',
        },
        {
          name: 'Ezetimibe (Zetia)',
          class: 'Niemann-Pick C1-Like 1 cholesterol absorption inhibitor',
          howItCompares:
            'Added to simvastatin in IMPROVE-IT it lowered LDL by a further 0.4 mmol/L and cut the composite endpoint from 34.7% to 32.7% over seven years — a 2.0 percentage-point absolute difference, p=0.016. That is a real effect and a small one, and it is the trial that made the case that the benefit tracks the LDL reduction rather than the statin.',
          typicalCost:
            'US$0.067 per 10 mg generic tablet at pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no muscle signal, works by a different mechanism, cheap. Cons: small absolute benefit, and its two earlier surrogate trials, ENHANCE and SEAS, both missed.',
        },
        {
          name: 'Evolocumab (Repatha)',
          class: 'PCSK9-directed monoclonal antibody, injected',
          howItCompares:
            'Lowers LDL far below anything an oral drug reaches, on top of a statin, and reduced cardiovascular events in FOURIER. It is added to a statin in the trials, not substituted for one.',
          typicalCost:
            'US$281.97 per mL of the 140 mg/mL autoinjector at pharmacy acquisition cost (CMS NADAC, REPATHA SURECLICK, effective 19 August 2026)',
          prosAndCons:
            'Pros: largest LDL reduction available, no muscle signal. Cons: injection, and an acquisition cost per unit roughly four orders of magnitude above generic atorvastatin.',
        },
      ],
      naturalFoods: [
        {
          name: 'Red yeast rice (Monascus purpureus fermented rice)',
          activeCompound: 'Monacolin K, which is chemically identical to lovastatin',
          biologicalMechanism:
            'Monacolin K is the same molecule as the statin lovastatin and inhibits the same enzyme. Its presence in a supplement is not an alternative to statin pharmacology; it is unmeasured statin pharmacology.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. The relevant fact is that monacolin content varies between products by more than an order of magnitude and is not declared, so the reader cannot know the exposure.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Soluble fibre (oats, barley, psyllium)',
          activeCompound: 'Beta-glucan and other viscous soluble fibres',
          biologicalMechanism:
            'Binds bile acids in the gut lumen so they are excreted rather than reabsorbed, forcing the liver to convert more cholesterol into replacement bile acids. This is the same principle as the bile acid sequestrant drugs, at a much smaller effect size.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. The measured LDL reductions from soluble fibre in randomised feeding studies are a few percent, against roughly 40 to 50% for atorvastatin at its higher strengths.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask for a rechallenge rather than abandoning the drug',
          action:
            'If muscle aches began after starting a statin, ask whether a blinded or staged rechallenge is possible before concluding the drug caused them.',
          patientImpact:
            'In SAMSON, symptom scores were 16.3 on atorvastatin and 15.4 on placebo, with no statistically detectable difference between them (p=0.388), against 8.0 in months with no tablet at all. In StatinWISE, 151 people who had already reported severe muscle symptoms on a statin showed a mean difference of -0.11 points on a 0-10 scale between statin and placebo periods.',
          clinicalPrecaution:
            'Rhabdomyolysis is real, rare and different: it comes with very high creatine kinase and dark urine, and it is a reason to stop immediately. The nocebo finding applies to the common aches, not to that.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)C1=C(C(=C(N1CC[C@H](C[C@H](CC(=O)O)O)O)C2=CC=C(C=C2)F)C3=CC=CC=C3)C(=O)NC4=CC=CC=C4',
      chemicalFormula: 'C33H35FN2O5',
      molecularWeight: '558.6 g/mol (free acid); dispensed as atorvastatin calcium trihydrate',
      targetReceptorAffinity:
        'A nanomolar-range inhibition constant against the catalytic portion of human HMG-CoA reductase. Istvan and Deisenhofer solved the crystal structures of that domain with six statins bound and showed the mechanism: the dihydroxyheptanoic acid arm occupies the HMG portion of the substrate site, blocking access for HMG-CoA, while several catalytically relevant residues near the carboxyl terminus become disordered to make room for the bulky hydrophobic half of the drug.',
      structureSource: {
        label:
          'PubChem CID 60823 (atorvastatin) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60823',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ato-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Chiral purity control of the dioxane side-chain amine',
          description:
            'Assay the incoming (4R,6R)-configured protected diol amine, the fragment that becomes the drug\'s active dihydroxyheptanoic acid arm, for enantiomeric and diastereomeric purity before it is committed to the ring-forming step. Both stereocentres are the pharmacology: the enantiomer with inverted configuration does not inhibit the enzyme, and once the pyrrole is built the mistake cannot be corrected.',
          reagentsAndBuffer:
            'tert-butyl (4R,6R)-6-(2-aminoethyl)-2,2-dimethyl-1,3-dioxane-4-acetate reference standard, chiral HPLC on an amylose tris(3,5-dimethylphenylcarbamate) column with hexane/isopropanol, Karl Fischer titration for water content',
        },
        {
          id: 'ato-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Paal-Knorr condensation to build the tetrasubstituted pyrrole',
          description:
            'Condense the chiral primary amine with the 1,4-diketone bearing the 4-fluorophenyl, phenyl, isopropyl and anilide substituents. The two carbonyls close onto the nitrogen and dehydrate, forming the fully substituted pyrrole core in one operation with the stereocentres untouched. Water is removed azeotropically because the equilibrium is driven by its removal.',
          dependsOnStepId: 'ato-w1',
          reagentsAndBuffer:
            '4-fluoro-alpha-(2-methyl-1-oxopropyl)-gamma-oxo-N,beta-diphenylbenzenebutanamide, pivalic acid as catalyst, toluene/n-heptane/tetrahydrofuran with a Dean-Stark trap under nitrogen',
        },
        {
          id: 'ato-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Acetonide and ester cleavage, then calcium salt crystallisation',
          description:
            'Cleave the acetonide protecting group and the tert-butyl ester under aqueous acid to unmask the 3,5-dihydroxy acid, neutralise, and precipitate the hemicalcium trihydrate salt. The salt form is what gets tabletted; the lactone that forms if the free acid is left in acid is a specified impurity and is what the recrystallisation is written to clear.',
          dependsOnStepId: 'ato-w2',
          reagentsAndBuffer:
            'Hydrochloric acid in methanol/water, sodium hydroxide for neutralisation, calcium acetate hemihydrate for salt formation, methanol/water recrystallisation, reversed-phase HPLC against the atorvastatin lactone and desfluoro reference impurities',
        },
        {
          id: 'ato-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'OATP1B1-dependent uptake into primary human hepatocytes',
          description:
            'Confirm in sandwich-cultured primary human hepatocytes that uptake is transporter-mediated by competing it with a known OATP inhibitor. This step is not a formality: the SLCO1B1 c.521T>C variant that reduces OATP1B1 function raises systemic statin exposure and is the one genetic association with statin myopathy that has replicated, so uptake capacity is the difference between hepatic action and muscle exposure.',
          dependsOnStepId: 'ato-w3',
          reagentsAndBuffer:
            'Cryopreserved primary human hepatocytes in sandwich culture on collagen with Matrigel overlay, Krebs-Henseleit buffer, rifamycin SV as pan-OATP inhibitor control, LC-MS/MS quantification of intracellular atorvastatin',
        },
        {
          id: 'ato-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Enzyme inhibition and LDL receptor upregulation readout',
          description:
            'Measure inhibition of the recombinant catalytic domain of human HMG-CoA reductase by following NADPH consumption, and in parallel measure fluorescent LDL uptake in hepatocytes cultured in lipoprotein-deficient serum. Both readouts are needed because they answer different questions: the enzyme assay shows the drug binds, the LDL uptake assay shows the cell responded by putting out more receptors, and the second is what actually lowers the blood number.',
          dependsOnStepId: 'ato-w4',
          reagentsAndBuffer:
            'Recombinant human HMG-CoA reductase catalytic domain, DL-3-hydroxy-3-methylglutaryl coenzyme A, NADPH with absorbance followed at 340 nm, DMEM with 5% lipoprotein-deficient fetal bovine serum, DiI-labelled human LDL',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ato-a1',
        category: 'measured',
        title: 'ASCOT-LLA: 100 versus 154 primary events in 10,305 hypertensive patients',
        laymanSummary:
          'Hypertensive patients with ordinary, not high, cholesterol were randomised to a low strength of atorvastatin or placebo. The trial was stopped early because the atorvastatin group was having a third fewer heart attacks and coronary deaths.',
        technicalDetails:
          'Of 19,342 hypertensive patients aged 40 to 79 with at least three other cardiovascular risk factors, the 10,305 with non-fasting total cholesterol of 6.5 mmol/L or less were randomly assigned atorvastatin 10 mg or placebo. Treatment was stopped after a median follow-up of 3.3 years against a planned 5 years. The primary endpoint of non-fatal myocardial infarction plus fatal coronary heart disease occurred in 100 patients on atorvastatin against 154 on placebo, hazard ratio 0.64 (95% CI 0.50 to 0.83), p=0.0005; the separation appeared within the first year. Fatal and non-fatal stroke fell from 121 to 89 (HR 0.73, 0.56 to 0.96, p=0.024) and total cardiovascular events from 486 to 389 (HR 0.79, 0.69 to 0.90, p=0.0005). Total serum cholesterol was about 1.3 mmol/L lower than placebo at 12 months. All-cause deaths were 185 against 212, HR 0.87 (0.71 to 1.06), p=0.16, which is not a significant difference.',
        evidenceSource: 'Sever PS et al., ASCOT-LLA, Lancet 2003;361:1149-1158',
        doi: '10.1016/S0140-6736(03)12948-0',
        measuredMetric:
          'Non-fatal myocardial infarction and fatal coronary heart disease over a median 3.3 years',
        auditFlag: 'verified',
      },
      {
        id: 'ato-a2',
        category: 'measured',
        title: 'CARDS: a 37% event reduction in type 2 diabetes without high LDL',
        laymanSummary:
          'People with type 2 diabetes and no history of heart disease were given a low strength of atorvastatin or placebo. The trial was stopped two years early because the benefit had already crossed the prespecified stopping threshold.',
        technicalDetails:
          'A total of 2,838 patients aged 40 to 75 across 132 centres in the United Kingdom and Ireland were randomised to placebo (n=1,410) or atorvastatin 10 mg daily (n=1,428). Entrants had no documented cardiovascular disease, LDL cholesterol of 4.14 mmol/L or lower, and at least one of retinopathy, albuminuria, current smoking or hypertension. The trial stopped 2 years early on the prespecified efficacy rule. Over a median 3.9 years, 127 placebo patients (2.46 per 100 person-years) and 83 atorvastatin patients (1.54 per 100 person-years) had a major cardiovascular event, a rate reduction of 37% (95% CI -52 to -17), p=0.001. Stroke fell 48% (-69 to -11). The death rate fell 27% (-48 to 1), p=0.059, which does not reach significance.',
        evidenceSource: 'Colhoun HM et al., CARDS, Lancet 2004;364:685-696 (NCT00327418)',
        doi: '10.1016/S0140-6736(04)16895-5',
        measuredMetric:
          'First acute coronary event, coronary revascularisation or stroke, over a median 3.9 years',
        auditFlag: 'verified',
      },
      {
        id: 'ato-a3',
        category: 'failed',
        title: 'ASPEN: the LDL fell 29% and the composite endpoint did not move',
        laymanSummary:
          'A fourth trial in type 2 diabetes gave the same drug at the same strength for four years. Cholesterol dropped just as much as in the successful trials. The count of cardiovascular events did not fall.',
        technicalDetails:
          'ASPEN randomised 2,410 subjects with type 2 diabetes to atorvastatin 10 mg or placebo in a 4-year double-blind parallel-group study. Mean LDL cholesterol reduction over 4 years was 29% against placebo (p<0.0001) — a surrogate effect equal to that in CARDS. Composite primary endpoint rates were 13.7% on atorvastatin against 15.0% on placebo, hazard ratio 0.90 (95% CI 0.73 to 1.12), which does not exclude no effect. In the 1,905 subjects without prior myocardial infarction or intervention the hazard ratio was 0.97 (0.74 to 1.28). Fatal and non-fatal myocardial infarction fell 27% overall, p=0.10. The investigators attributed the null result to study design, recruitment and protocol changes forced by evolving guidelines, and stated the trial "did not confirm the benefit of therapy".',
        evidenceSource: 'Knopp RH et al., ASPEN, Diabetes Care 2006;29:1478-1485',
        doi: '10.2337/dc05-2415',
        measuredMetric:
          'Composite of cardiovascular death, non-fatal myocardial infarction, non-fatal stroke, revascularisation, resuscitated arrest and hospitalised angina over 4 years',
        inferredClaim:
          'That a given percentage LDL reduction reliably delivers a proportional event reduction in every population — ASPEN produced the LDL change without the event change',
        auditFlag: 'caution',
      },
      {
        id: 'ato-a4',
        category: 'conclusion_shift',
        title: 'SAMSON: atorvastatin and placebo produced the same muscle symptoms',
        laymanSummary:
          'Sixty people who had abandoned statins because of side effects took twelve monthly bottles: four with atorvastatin, four with placebo, four empty. Symptoms were about twice as bad in any month with a tablet, and identical whether the tablet contained the drug or not.',
        technicalDetails:
          'Participants received 12 one-month bottles — 4 atorvastatin 20 mg, 4 placebo, 4 empty — and recorded daily symptom intensity on a 1 to 100 scale by app. Sixty were randomised and 49 completed the 12-month protocol. Mean symptom score was 8.0 (95% CI 4.7 to 11.3) in no-tablet months, 16.3 (13.0 to 19.6) in statin months and 15.4 (12.1 to 18.7) in placebo months; both tablet conditions exceeded no-tablet at p<0.001, and statin did not differ from placebo (p=0.388). The nocebo ratio, the fraction of tablet-induced symptoms also induced by placebo, was 0.90. Neither symptom intensity on starting (OR 1.02, 0.98 to 1.06, p=0.28) nor relief on stopping (OR 1.01, 0.98 to 1.05, p=0.48) distinguished statin from placebo. Six months after the trial, 30 of 60 participants were back on statins.',
        evidenceSource:
          'Wood FA et al., SAMSON, N Engl J Med 2020;383:2182-2184; full report Howard JP et al., J Am Coll Cardiol 2021;78:1210-1222 (NCT02668016)',
        doi: '10.1016/j.jacc.2021.07.022',
        measuredMetric: 'Daily symptom intensity score in statin, placebo and no-tablet months',
        auditFlag: 'verified',
      },
      {
        id: 'ato-a5',
        category: 'conclusion_shift',
        title: 'StatinWISE replicated it in 200 people in ordinary general practice',
        laymanSummary:
          'A second, larger, independent set of n-of-1 trials recruited people who had already stopped or were about to stop statins because of muscle pain. Across six alternating two-month periods, the difference between drug and placebo was effectively zero.',
        technicalDetails:
          'StatinWISE recruited 200 participants across 50 United Kingdom primary care sites between December 2016 and April 2018, each randomised to a sequence of six double-blind two-month periods of atorvastatin 20 mg daily or placebo, rating muscle symptoms on a 0-10 visual analogue scale at the end of each period. 151 provided scores for at least one statin and one placebo period and entered the primary analysis. The mean difference, statin minus placebo, was -0.11 (95% CI -0.36 to 0.14), p=0.40. Withdrawals for intolerable muscle symptoms were 18 (9%) during a statin period and 13 (7%) during a placebo period. Two thirds of those completing intended to restart long-term statin treatment.',
        evidenceSource:
          'Herrett E et al., StatinWISE, BMJ 2021;372:n135 (ISRCTN30952488, NCT02781064)',
        doi: '10.1136/bmj.n135',
        measuredMetric:
          'Mean difference in muscle symptom score, statin periods minus placebo periods',
        auditFlag: 'verified',
      },
      {
        id: 'ato-a6',
        category: 'measured',
        title: 'The diabetes signal is real, quantified, and small',
        laymanSummary:
          'Statins raise the chance of being diagnosed with diabetes. Pooling thirteen trials, treating 255 people for four years produces one extra case.',
        technicalDetails:
          'Sattar and colleagues pooled 13 statin trials with 91,140 participants, of whom 4,278 developed diabetes over a mean of 4 years — 2,226 on statin against 2,052 on control. Statin therapy carried a 9% increased odds of incident diabetes (OR 1.09, 95% CI 1.02 to 1.17) with little heterogeneity (I-squared 11%). Treating 255 patients (95% CI 150 to 852) for 4 years produced one extra case. Risk was highest in trials with older participants; neither baseline body-mass index nor the size of the LDL reduction explained the residual variation. Preiss and colleagues then compared intensive with moderate dosing across 5 trials and 32,752 participants: OR 1.12 (1.04 to 1.22) for new-onset diabetes against OR 0.84 (0.75 to 0.94) for cardiovascular events, a number needed to harm per year of 498 set against a number needed to treat per year of 155.',
        evidenceSource:
          'Sattar N et al., Lancet 2010;375:735-742; Preiss D et al., JAMA 2011;305:2556-2564',
        doi: '10.1016/S0140-6736(09)61965-6',
        measuredMetric:
          'Odds ratio for incident diabetes on statin versus control, and number needed to harm',
        auditFlag: 'verified',
      },
      {
        id: 'ato-a7',
        category: 'measured',
        title: 'TNT: more atorvastatin bought 2.2 percentage points and no extra survival',
        laymanSummary:
          'Ten thousand patients with stable coronary disease took either 10 mg or 80 mg of the same drug for five years. The high strength prevented more events. It did not reduce deaths, and it produced six times as many liver enzyme abnormalities.',
        technicalDetails:
          'TNT randomised 10,001 patients with clinically evident coronary heart disease and LDL below 130 mg/dL to double-blind atorvastatin 10 mg or 80 mg, followed for a median 4.9 years. Mean on-treatment LDL was 77 mg/dL on 80 mg against 101 mg/dL on 10 mg. A primary event occurred in 434 patients (8.7%) on 80 mg against 548 (10.9%) on 10 mg: an absolute reduction of 2.2 percentage points, a 22% relative reduction, hazard ratio 0.78 (95% CI 0.69 to 0.89), p<0.001. There was no difference between groups in overall mortality. Persistent elevations in liver aminotransferases occurred in 1.2% on 80 mg against 0.2% on 10 mg, p<0.001.',
        evidenceSource: 'LaRosa JC et al., TNT, N Engl J Med 2005;352:1425-1435 (NCT00327691)',
        doi: '10.1056/NEJMoa050461',
        measuredMetric:
          'First major cardiovascular event over a median 4.9 years, 80 mg versus 10 mg',
        auditFlag: 'verified',
      },
      {
        id: 'ato-a8',
        category: 'inferred',
        title: 'The "pleiotropic effects" story is mechanism, not a tested endpoint',
        laymanSummary:
          'Statins are often credited with anti-inflammatory and plaque-stabilising actions beyond cholesterol lowering. Those actions are real in the laboratory. No trial has separated them from the cholesterol lowering in people.',
        technicalDetails:
          'Blocking HMG-CoA reductase depletes not only cholesterol but the isoprenoid intermediates farnesyl and geranylgeranyl pyrophosphate, which are required to anchor Rho, Rac and Ras to membranes; that biochemistry is well established and is the mechanistic basis of the pleiotropy claim. What does not exist is a randomised comparison isolating it. The strongest quantitative evidence runs the other way: the Cholesterol Treatment Trialists pooled individual data from 26 randomised trials and 170,000 participants and found benefit scaling with the size of the LDL reduction, each 1.0 mmol/L reduction cutting the annual rate of major vascular events by just over a fifth, with no threshold across the range studied. A benefit that scales with the LDL change is evidence for the LDL change, not against pleiotropy, but it leaves the pleiotropic contribution unmeasured.',
        evidenceSource:
          'Cholesterol Treatment Trialists Collaboration, Baigent C et al., Lancet 2010;376:1670-1681; Istvan ES, Deisenhofer J, Science 2001;292:1160-1164',
        doi: '10.1016/S0140-6736(10)61350-5',
        inferredClaim:
          'That a measurable share of the clinical benefit comes from anti-inflammatory or plaque-stabilising actions independent of LDL lowering — biochemically plausible, never isolated in a randomised trial',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed as the active drug, and mostly removed before it reaches the body',
        laymanDesc:
          'Unlike some statins, atorvastatin arrives already active. Most of a dose is captured by the liver on its first pass, which is convenient, because the liver is where it is meant to work.',
        molecularDetail:
          'Atorvastatin calcium is administered as the active hydroxy acid rather than as a lactone prodrug. Absorption is rapid but absolute systemic bioavailability is low because of extensive first-pass extraction by the liver, which concentrates drug at the site of action while limiting systemic exposure. Metabolism is by CYP3A4 to ortho- and para-hydroxylated metabolites that are themselves active inhibitors.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A liver transporter pulls it into the hepatocyte',
        laymanDesc:
          'A pump on the surface of liver cells carries the drug inside. People who inherit a weaker version of that pump end up with more drug circulating in the rest of the body.',
        molecularDetail:
          'Organic anion transporting polypeptide 1B1 (OATP1B1, encoded by SLCO1B1) mediates hepatic uptake. The reduced-function c.521T>C variant increases systemic statin exposure and is the one genetic association with statin-related myopathy that has replicated across studies, which is the mechanistic reason hepatic uptake capacity and muscle exposure are inversely linked.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It plugs the substrate slot of the cholesterol-making enzyme',
        laymanDesc:
          'The drug slots into the space where the enzyme normally grips its raw material, so the raw material cannot get in and the assembly line stops at its slowest step.',
        molecularDetail:
          'The 3,5-dihydroxyheptanoic acid arm mimics the HMG moiety of HMG-CoA and occupies that part of the reductase active site. Crystal structures of the human catalytic domain with six statins bound show that catalytically relevant residues near the carboxyl terminus become disordered to accommodate the bulky hydrophobic half of the drug; without that flexibility the statin could not bind at all.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The starved cell builds more LDL collection receptors',
        laymanDesc:
          'Sensing it is short of cholesterol, the cell switches on the gene for the receptor that catches LDL particles and puts more of those receptors on its surface.',
        molecularDetail:
          'Falling intracellular sterol releases SREBP-2 from the endoplasmic reticulum via SCAP and the site-1 and site-2 proteases; the cleaved transcription factor enters the nucleus and drives transcription of LDLR. Surface LDL receptor density rises and hepatic clearance of circulating LDL particles increases. The same programme also raises PCSK9, which degrades the receptor — the counter-regulation that the PCSK9 antibodies were designed to remove.',
        iconName: 'Repeat',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'LDL in the blood falls, and over years fewer arteries block',
        laymanDesc:
          'The blood number drops within weeks. The reduction in heart attacks takes years to accumulate and is measured by counting events, not by measuring cholesterol.',
        molecularDetail:
          'Across 26 randomised trials and 170,000 participants, each 1.0 mmol/L reduction in LDL cholesterol reduced the annual rate of major vascular events by just over a fifth, with no threshold detected across the range studied. In ASCOT-LLA the corresponding event count was 100 against 154 over a median 3.3 years.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ASCOT-LLA',
        phase: 'Randomised double-blind placebo-controlled trial, stopped at median 3.3 years',
        sampleSize: 10305,
        primaryEndpoint: 'Non-fatal myocardial infarction and fatal coronary heart disease',
        endpointMet: true,
        statisticalPValue: 'HR 0.64 (95% CI 0.50-0.83), P = 0.0005',
        unreportedAdverseSignals:
          'All-cause mortality was 185 against 212, HR 0.87 (0.71-1.06), p=0.16 — not a significant difference, and often quoted as though it were.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CARDS (NCT00327418)',
        phase: 'Randomised placebo-controlled trial, stopped 2 years early, median 3.9 years',
        sampleSize: 2838,
        primaryEndpoint:
          'Time to first acute coronary heart disease event, coronary revascularisation or stroke',
        endpointMet: true,
        statisticalPValue: 'Rate reduction 37% (95% CI -52 to -17), P = 0.001',
        unreportedAdverseSignals:
          'The death rate reduction of 27% did not reach significance (p=0.059) and the trial was stopped early, which inflates measured effect sizes.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ASPEN',
        phase: 'Randomised double-blind placebo-controlled trial, 4 years',
        sampleSize: 2410,
        primaryEndpoint:
          'Composite of cardiovascular death, non-fatal myocardial infarction, non-fatal stroke, revascularisation, resuscitated arrest and hospitalised angina',
        endpointMet: false,
        statisticalPValue: 'HR 0.90 (95% CI 0.73-1.12) — not statistically significant',
        unreportedAdverseSignals:
          'LDL cholesterol fell 29% against placebo (p<0.0001). The surrogate moved and the endpoint did not.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'TNT (NCT00327691)',
        phase: 'Randomised double-blind dose-comparison trial, median 4.9 years',
        sampleSize: 10001,
        primaryEndpoint:
          'First major cardiovascular event on atorvastatin 80 mg versus 10 mg in stable coronary disease',
        endpointMet: true,
        statisticalPValue: 'HR 0.78 (95% CI 0.69-0.89), P < 0.001; absolute reduction 2.2 points',
        unreportedAdverseSignals:
          'No difference in overall mortality, and persistent aminotransferase elevation in 1.2% on 80 mg against 0.2% on 10 mg (p<0.001).',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SAMSON (NCT02668016)',
        phase: 'Randomised n-of-1 crossover trial, 12 monthly periods',
        sampleSize: 60,
        primaryEndpoint:
          'Daily symptom intensity score in atorvastatin, placebo and no-tablet months',
        endpointMet: true,
        statisticalPValue:
          'Statin 16.3 versus placebo 15.4, P = 0.388; both versus no-tablet 8.0, P < 0.001',
        unreportedAdverseSignals:
          'Eleven of 60 did not complete the 12-month protocol. The finding is that symptoms are real and tablet-triggered, not that they are imagined.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'StatinWISE (ISRCTN30952488, NCT02781064)',
        phase: 'Series of randomised placebo-controlled n-of-1 trials, six 2-month periods',
        sampleSize: 200,
        primaryEndpoint:
          'Muscle symptom score on a 0-10 visual analogue scale, statin periods versus placebo periods',
        endpointMet: true,
        statisticalPValue: 'Mean difference -0.11 (95% CI -0.36 to 0.14), P = 0.40',
        unreportedAdverseSignals:
          'Only 151 of 200 contributed to the primary analysis. Withdrawals for intolerable symptoms were 9% on statin against 7% on placebo.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '100 versus 154 primary coronary events in 10,305 hypertensive patients over a median 3.3 years, HR 0.64, p=0.0005',
        'A 37% reduction in first major cardiovascular events in 2,838 patients with type 2 diabetes, p=0.001',
        'A 2.2 percentage-point absolute event reduction from 80 mg over 10 mg in 10,001 patients with stable coronary disease',
        'No detectable difference in muscle symptoms between atorvastatin and placebo in two independent n-of-1 programmes totalling 260 participants',
        'A 9% increased odds of incident diabetes across 91,140 participants — one extra case per 255 people treated for 4 years',
      ],
      unsupportedInferences: [
        'That atorvastatin reduces all-cause mortality — neither ASCOT-LLA (p=0.16) nor CARDS (p=0.059) reached significance for death, and TNT found no mortality difference between strengths',
        'That a given LDL reduction always delivers a proportional event reduction — ASPEN produced a 29% LDL fall and a hazard ratio of 0.90 that crossed 1',
        'That anti-inflammatory "pleiotropic" actions account for a measurable share of the benefit — plausible biochemistry, never isolated in a randomised trial',
        'That common muscle aches on a statin are pharmacological in origin, which is what both n-of-1 programmes were built to test and did not find',
      ],
      whatFailedInitially: [
        'ASPEN missed its composite primary endpoint in 2,410 patients with type 2 diabetes despite a 29% LDL reduction',
        'The 80 mg strength in TNT bought no survival advantage over 10 mg and produced six times the rate of persistent liver enzyme elevation',
        'The class raises incident diabetes, and raises it further at intensive doses: OR 1.12 for diabetes against OR 0.84 for cardiovascular events in 32,752 participants',
      ],
      realWorldOutcome: [
        'The highest-grossing pharmaceutical product ever sold, generic in the United States since November 2011 and on the WHO Model List of Essential Medicines',
        'US$0.023 per 10 mg tablet at United States pharmacy acquisition cost, against US$13.41 for the branded LIPITOR 10 mg tablet in the same file',
        'Half the SAMSON participants — all of whom had previously abandoned statins over side effects — were back on a statin six months after seeing their own data',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, four strengths',
      description:
        'Taken once daily at any time of day; unlike the shorter-acting statins it does not need to be taken at night, because its active metabolites give it a long effective duration. Absorption is not meaningfully affected by food.',
      safetyProfile:
        'The commonest reported complaint is muscle ache, and the two randomised n-of-1 programmes above could not distinguish it from placebo. Rhabdomyolysis with acute renal failure is rare, real and distinguishable by markedly elevated creatine kinase. Persistent aminotransferase elevation occurred in 1.2% at 80 mg against 0.2% at 10 mg in TNT. The class raises incident diabetes by about 9%, more at intensive doses. CYP3A4 inhibitors raise exposure, which is the basis of the interaction warnings.',
    },
    commonQuestions: [
      {
        q: 'My muscles ache since I started this. Is it the statin?',
        a: 'Possibly, but two randomised programmes designed specifically to answer that question in people exactly like you could not find a difference. In SAMSON, 60 people who had already abandoned statins took twelve monthly bottles — four atorvastatin, four placebo, four empty. Symptoms roughly doubled in any month with a tablet, and were statistically indistinguishable between the real drug and the placebo (16.3 against 15.4, p=0.388). In StatinWISE, 151 people with previously severe statin-attributed muscle symptoms showed a mean difference of -0.11 points on a 0-10 scale between statin and placebo periods. The symptoms in these trials were real and were genuinely triggered by taking a tablet; what was not established is that the drug inside the tablet was doing it.',
        auditNote:
          'This is the finding on this page most likely to be misread as "your pain is imaginary". It is not what either trial reported. Both measured real symptoms and found the same intensity with an inert tablet.',
      },
      {
        q: 'Does it actually stop me dying, or just improve my numbers?',
        a: 'It reduces the count of heart attacks and strokes, which is an event and not a number. Whether it reduces death from any cause is less clearly established than most summaries imply: in ASCOT-LLA there were 185 deaths on atorvastatin against 212 on placebo, which is a hazard ratio of 0.87 with a p-value of 0.16 — not significant. In CARDS the death rate fell 27% with a p-value of 0.059 — also not significant. In TNT, eight times the strength produced no mortality difference at all. Both those trials were stopped early on the event endpoint, which limits their power to detect a mortality difference; that is an explanation, not a result.',
      },
      {
        q: 'If cholesterol dropped, why did one big trial show no benefit?',
        a: 'ASPEN is the trial in question, and it is the most useful one on this page. It gave the same drug at the same strength to 2,410 people with type 2 diabetes for four years and achieved a 29% LDL reduction against placebo — as large as in CARDS, which succeeded. The event rates were 13.7% against 15.0%, a hazard ratio of 0.90 whose confidence interval runs from 0.73 to 1.12 and therefore includes no effect. The investigators pointed to design, recruitment and mid-trial guideline changes. What the trial demonstrates regardless of the explanation is that the blood number moving is not itself the outcome, and that a page which shows you only the LDL change has not shown you the thing that matters.',
        auditNote:
          'ASPEN is rarely cited alongside CARDS. Both were atorvastatin 10 mg in type 2 diabetes; one hit and one missed.',
      },
      {
        q: 'Will this give me diabetes?',
        a: 'It slightly raises the chance of crossing the diagnostic threshold, and the size is known. Pooling 13 trials and 91,140 participants, statins carried a 9% increase in the odds of incident diabetes — treating 255 people for four years produced one additional case. Comparing intensive with moderate dosing across 32,752 participants, the odds ratio was 1.12 for new-onset diabetes against 0.84 for cardiovascular events, which works out to one extra diabetes diagnosis per 498 patient-years set against one cardiovascular event prevented per 155 patient-years. Those two numbers belong side by side, and neither is a reason to present the drug as free of cost.',
      },
      {
        q: 'Is red yeast rice a natural alternative?',
        a: 'Its active constituent, monacolin K, is the same molecule as the statin lovastatin. Taking it is not an alternative to statin pharmacology; it is statin pharmacology at an undeclared and highly variable dose, without the pharmacopoeial identity and impurity controls that a prescription tablet carries, and without any outcome trial. If the objection to atorvastatin is the mechanism, red yeast rice shares it. If the objection is the manufacturing oversight, red yeast rice has less of it.',
      },
      {
        q: 'Why does this page show no manufacturing cost?',
        a: 'Because no per-dose synthesis cost for atorvastatin could be verified and cited, and inventing one would be worse than omitting it. What is shown is the United States pharmacy acquisition cost from the CMS NADAC file: about 2.3 cents for a 10 mg generic tablet, against US$13.41 for the branded LIPITOR tablet of the same strength in the same file on the same date. That is a price comparison between two versions of an identical molecule, which is a checkable fact, rather than a markup calculation resting on a number this page would have had to guess.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Sever PS et al. Prevention of coronary and stroke events with atorvastatin in hypertensive patients who have average or lower-than-average cholesterol concentrations (ASCOT-LLA). Lancet 2003;361:1149-1158',
        identifier: '10.1016/S0140-6736(03)12948-0',
        kind: 'doi',
      },
      {
        label:
          'Colhoun HM et al. Primary prevention of cardiovascular disease with atorvastatin in type 2 diabetes (CARDS). Lancet 2004;364:685-696',
        identifier: '10.1016/S0140-6736(04)16895-5',
        kind: 'doi',
      },
      {
        label:
          'Knopp RH et al. Efficacy and safety of atorvastatin in the prevention of cardiovascular end points in subjects with type 2 diabetes (ASPEN). Diabetes Care 2006;29:1478-1485',
        identifier: '10.2337/dc05-2415',
        kind: 'doi',
      },
      {
        label:
          'LaRosa JC et al. Intensive lipid lowering with atorvastatin in patients with stable coronary disease (TNT). N Engl J Med 2005;352:1425-1435',
        identifier: '10.1056/NEJMoa050461',
        kind: 'doi',
      },
      {
        label:
          'Wood FA et al. N-of-1 Trial of a Statin, Placebo, or No Treatment to Assess Side Effects (SAMSON). N Engl J Med 2020;383:2182-2184',
        identifier: '10.1056/NEJMc2031173',
        kind: 'doi',
      },
      {
        label:
          'Howard JP et al. Side Effect Patterns in a Crossover Trial of Statin, Placebo, and No Treatment (SAMSON full report). J Am Coll Cardiol 2021;78:1210-1222',
        identifier: '10.1016/j.jacc.2021.07.022',
        kind: 'doi',
      },
      {
        label:
          'Herrett E et al. Statin treatment and muscle symptoms: series of randomised, placebo controlled n-of-1 trials (StatinWISE). BMJ 2021;372:n135',
        identifier: '10.1136/bmj.n135',
        kind: 'doi',
      },
      {
        label:
          'Cholesterol Treatment Trialists Collaboration. Efficacy and safety of more intensive lowering of LDL cholesterol: a meta-analysis of data from 170,000 participants in 26 randomised trials. Lancet 2010;376:1670-1681',
        identifier: '10.1016/S0140-6736(10)61350-5',
        kind: 'doi',
      },
      {
        label:
          'Sattar N et al. Statins and risk of incident diabetes: a collaborative meta-analysis of randomised statin trials. Lancet 2010;375:735-742',
        identifier: '10.1016/S0140-6736(09)61965-6',
        kind: 'doi',
      },
      {
        label:
          'Preiss D et al. Risk of incident diabetes with intensive-dose compared with moderate-dose statin therapy: a meta-analysis. JAMA 2011;305:2556-2564',
        identifier: '10.1001/jama.2011.860',
        kind: 'doi',
      },
      {
        label:
          'Istvan ES, Deisenhofer J. Structural mechanism for statin inhibition of HMG-CoA reductase. Science 2001;292:1160-1164',
        identifier: '10.1126/science.1059344',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA: LIPITOR (atorvastatin calcium), NDA 020702, original approval 17 December 1996',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020702',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 60823 — atorvastatin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60823',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Vitamin C — an 8% shorter cold, a Nobel laureate's cancer claim that two randomised trials
  // buried, and a sepsis trial in which intravenous vitamin C made patients measurably worse.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'vitamin-c-ascorbic-acid',
    name: 'Vitamin C',
    tradeName: 'Ascorbic acid; L-ascorbate',
    sponsor:
      'No single sponsor — L-ascorbic acid, manufactured industrially from glucose by the Reichstein process or by two-step bacterial fermentation, sold by many manufacturers',
    targetGene: 'P4HA1',
    targetProtein:
      'The Fe(II)- and 2-oxoglutarate-dependent dioxygenases, above all prolyl 4-hydroxylase (P4HA1) and lysyl hydroxylase, which hydroxylate collagen and cannot complete their catalytic cycle without ascorbate to re-reduce the active-site iron. Transport into cells is by the sodium-dependent vitamin C transporters SVCT1 (SLC23A1) and SVCT2 (SLC23A2).',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold for colds, immunity, skin and antioxidant protection. Not approved by the FDA or EMA for any of those. Ascorbic acid is separately a genuine treatment for scurvy, which is a real and rapidly fatal disease that vitamin C cures completely.',
    patientFriendlyIndication: 'Taken to prevent or shorten colds, and for general immune support',
    conditionContext: {
      conditionExplainer:
        'Humans are among the few mammals that cannot make vitamin C, because the gene for the last enzyme in the synthesis pathway, L-gulonolactone oxidase, is a broken pseudogene in our species. Without dietary ascorbate, collagen cannot be hydroxylated, connective tissue fails, and scurvy kills. That is the deficiency disease, and it is completely reversed by small amounts.',
      whyItMatters:
        'The gap between "essential nutrient whose absence kills" and "supplement that does something useful in a person who already has enough" is the widest in this file for vitamin C, and it was opened deliberately. Linus Pauling, a double Nobel laureate, spent the last decades of his life arguing that gram doses prevented colds and treated cancer. The randomised answer to the first is a small effect and to the second is no effect at all.',
      whoTakesThis:
        'Almost everyone at some point, usually at the first sneeze. Also people with genuinely low intake — smokers, people with very restricted diets, patients on dialysis or with malabsorption — and, for a period after 2017, critically ill patients in intensive care units that adopted an intravenous protocol.',
      clinicalGoals:
        'Trials measured incidence and duration of colds, cardiovascular events, cancer incidence, organ failure scores in sepsis, 28-day mortality, and incident kidney stones.',
    },
    oneSentenceVerdict:
      'Regular vitamin C shortens colds by about 8% in adults and does not prevent them in the general population, except in people under extreme physical stress where it halves incidence; the cancer claim failed two randomised trials, and in 872 septic ICU patients intravenous vitamin C increased death or persistent organ dysfunction.',
    laymanHowItWorks:
      'Vitamin C is not an antioxidant in the way the label implies. Its actual job is to keep the iron atom inside a family of enzymes in the right chemical state so those enzymes can keep working — most importantly the ones that build collagen, which is why running out causes teeth to loosen and old wounds to reopen. Once those enzymes have what they need, extra vitamin C has nothing to do. Above a certain intake the gut simply stops absorbing it and the kidney dumps the rest, which is why the plasma level is nearly flat across a very wide range of doses.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 46,
    anatomicalSite:
      'Cytosol of every cell via SVCT2, with the highest concentrations in adrenal cortex, pituitary, brain and neutrophils; absorption is SVCT1-mediated in the small intestine',
    substitutes: {
      summary:
        'For scurvy, vitamin C is not substitutable and works within days. For colds, the honest comparator is nothing, since 8% of a seven-day cold is about half a day. For sepsis the comparator turned out to be placebo, and placebo won.',
      conventionalRx: [
        {
          name: 'Ascorbic acid as treatment for scurvy',
          class: 'Nutrient replacement for a defined deficiency disease',
          howItCompares:
            'Complete and rapid cure of a disease that is otherwise fatal, established well before controlled trials existed. It is the strongest possible evidence that vitamin C is essential, and it says nothing whatever about the effect of extra vitamin C in someone who is not deficient.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: unambiguous, mechanistically understood, fast. Cons: routinely used as rhetorical cover for claims about replete adults, which is the central error this file exists to name.',
        },
        {
          name: 'Intravenous vitamin C in sepsis, as the cautionary comparator',
          class: 'Investigational critical-care intervention, now negative',
          howItCompares:
            'Between 2017 and 2022 this went from a widely adopted ICU protocol to a randomised finding of harm. LOVIT found death or persistent organ dysfunction at day 28 in 44.5% on vitamin C against 38.5% on placebo, risk ratio 1.21 (95% CI 1.04 to 1.40, P = 0.01).',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: none demonstrated. Cons: a randomised signal of harm, from a trial designed to look for benefit.',
        },
      ],
      naturalFoods: [
        {
          name: 'Citrus, capsicum, blackcurrant, broccoli and potatoes',
          activeCompound: 'L-ascorbic acid, chemically identical to the synthetic form',
          biologicalMechanism:
            'Dietary and synthetic ascorbate are the same molecule and use the same SVCT1 transporter. The only meaningful difference is dose: food delivers amounts in the range where absorption is near-complete, whereas gram doses fall on the saturated part of the curve and are largely excreted.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: the Cochrane review excluded any trial using less than 0.2 g per day, and its adult duration effect came from regimens at or above that.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Vitamin C taken with a plant-source iron meal',
          activeCompound: 'Ascorbate as a non-haem iron reductant and chelator',
          biologicalMechanism:
            'Ascorbate reduces dietary Fe(III) to Fe(II) and forms a soluble chelate that survives the alkaline duodenum, substantially increasing non-haem iron absorption. This is one of the few supplemental vitamin C effects that is mechanistically direct, measurable, and useful in ordinary people.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Check whether a vitamin C result was prevention or treatment',
          action:
            'The Cochrane review separates regular daily supplementation from taking it once symptoms start. The two gave different answers, and the popular claim conflates them.',
          patientImpact:
            'Regular supplementation shortened colds by 8% in adults and 14% in children. Taking vitamin C after symptoms began produced no consistent effect on duration or severity in the therapeutic trials.',
          clinicalPrecaution:
            'Doses above roughly a gram exceed absorptive capacity and cause osmotic diarrhoea, and in a Swedish cohort of 23,355 men supplement users had roughly twice the incidence of kidney stones.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C([C@@H]([C@@H]1C(=C(C(=O)O1)O)O)O)O',
      chemicalFormula: 'C6H8O6',
      molecularWeight: '176.12 g/mol',
      targetReceptorAffinity:
        'Not a receptor ligand. It is a co-substrate: it reduces the Fe(III) that accumulates at the active site of 2-oxoglutarate-dependent dioxygenases back to Fe(II), restoring catalytic competence.',
      structureSource: {
        label: 'PubChem CID 54670067 — L-Ascorbic acid, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54670067',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'vitc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Assay for intact ascorbate against its oxidation product',
          description:
            'Ascorbate oxidises to dehydroascorbate in air, in light, and in neutral aqueous solution, and dehydroascorbate is not what any of the biology needs. A total-vitamin-C assay reports both together and will pass a degraded preparation. Discriminate them before anything else happens, and re-check at the point of use rather than only at manufacture.',
          reagentsAndBuffer:
            'HPLC with electrochemical detection at low potential; metaphosphoric acid with EDTA as the stabilising extraction medium; tris(2-carboxyethyl)phosphine reduction step run in parallel to give total versus reduced ascorbate; amber glassware and argon headspace',
        },
        {
          id: 'vitc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the 13C-labelled tracer for a saturation-kinetics study',
          description:
            'Because plasma ascorbate is tightly controlled by intestinal saturation and renal threshold, a dose-response study needs a tracer to separate newly absorbed vitamin from the existing body pool. This is the step that produced the finding that plasma concentration is nearly flat above a modest oral intake.',
          dependsOnStepId: 'vitc-w1',
          reagentsAndBuffer:
            '13C6-L-ascorbic acid; deoxygenated water; nitrogen-purged dissolution; LC-MS/MS confirmation of isotopic enrichment and absence of the dehydro form',
        },
        {
          id: 'vitc-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Sample handling that does not destroy the analyte before measurement',
          description:
            'More published vitamin C measurements have been ruined by sample handling than by any assay problem. Whole blood must be acidified and frozen fast; ascorbate in plasma left at room temperature is measurably gone within hours. Establish the handling protocol as a validated step, not an afterthought.',
          dependsOnStepId: 'vitc-w2',
          reagentsAndBuffer:
            'Immediate 1:1 dilution into 10% metaphosphoric acid with 1 mM EDTA and 1 mM dithiothreitol; centrifugation at 4 degrees C within 30 minutes; storage at -80 degrees C; documented freeze-thaw stability curve',
        },
        {
          id: 'vitc-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'SVCT2-dependent uptake and the pro-oxidant crossover at pharmacological concentration',
          description:
            'At oral doses ascorbate is an electron donor that keeps enzyme iron reduced. At the millimolar plasma concentrations only intravenous infusion can reach, it reduces free transition metals and generates hydrogen peroxide, which is the proposed anticancer mechanism and also the most plausible explanation for harm in critically ill patients whose free iron is elevated. Run both concentration regimes in the same system.',
          dependsOnStepId: 'vitc-w3',
          reagentsAndBuffer:
            'SVCT2-expressing and SVCT2-knockdown cell lines; sodium-free choline buffer as the transporter specificity control; ascorbate at 50 micromolar and at 5 millimolar; catalase to quench extracellular hydrogen peroxide; Amplex Red peroxide assay; calcein-AM labile iron pool measurement',
        },
        {
          id: 'vitc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Prolyl hydroxylation as the functional readout, not an antioxidant proxy',
          description:
            'Report the enzymatic consequence, since that is what the vitamin actually does. Measure 4-hydroxyproline content of newly synthesised collagen and the hydroxylation status of HIF-1alpha, which are direct outputs of ascorbate-dependent dioxygenases. Total antioxidant capacity assays measure a chemical property of the sample and predict nothing clinical.',
          dependsOnStepId: 'vitc-w4',
          reagentsAndBuffer:
            'Amino acid analysis for 4-hydroxyproline in acid-hydrolysed collagen; HIF-1alpha hydroxyproline-402/564 specific antibodies; proline hydroxylase activity assay with 2-oxoglutarate and Fe(II); ascorbate-depleted Gulo-knockout mouse fibroblasts as the deficiency control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'vitc-a1',
        category: 'measured',
        title: 'Cochrane: no prevention in the general public, 8% shorter colds in adults',
        laymanSummary:
          'Across 11,306 people, daily vitamin C did not reduce how often adults caught colds. It did make colds slightly shorter — about eight percent, or roughly half a day.',
        technicalDetails:
          'Twenty-nine trial comparisons in 11,306 participants contributed to the incidence analysis. In general-community trials covering 10,708 participants the pooled risk ratio for developing a cold was 0.97 (95% CI 0.94 to 1.00) — a boundary result at best. Thirty-one comparisons covering 9,745 cold episodes examined duration: colds were 8% shorter in adults (95% CI 3% to 12%) and 14% shorter in children (95% CI 7% to 21%), with 1 to 2 g per day in children shortening colds by 18%. Trials using less than 0.2 g per day and trials without a placebo were excluded, so this is the higher-dose literature. The therapeutic trials, in which vitamin C was started after symptoms began, showed no consistent effect. The distinction between regular prophylaxis and treatment-at-onset is where nearly all popular confusion about vitamin C lives.',
        evidenceSource: 'Hemila H, Chalker E. Cochrane Database Syst Rev 2013;1:CD000980',
        doi: '10.1002/14651858.CD000980.pub4',
        measuredMetric:
          'Risk ratio for developing at least one cold, and percentage reduction in mean cold duration',
        auditFlag: 'verified',
      },
      {
        id: 'vitc-a2',
        category: 'measured',
        title: 'The one population where it halved cold incidence: extreme physical stress',
        laymanSummary:
          'In marathon runners, skiers and soldiers on subarctic exercises, vitamin C cut the number of colds by half. In everyone else it did nothing.',
        technicalDetails:
          'Five trials in a total of 598 marathon runners, skiers and soldiers undertaking subarctic exercises pooled to a risk ratio of 0.48 (95% CI 0.35 to 0.64) for developing a cold, against 0.97 (95% CI 0.94 to 1.00) in the 10,708 general-community participants. This is one of the sharpest subgroup separations anywhere in the supplement literature, and it is not a subgroup fished from a single trial: it is a prespecified population category with five independent trials pointing the same way. The interpretation is genuinely unsettled. It may be a repletion effect in people whose intake cannot keep up with turnover under extreme exertion, or a specific effect of oxidative stress at that intensity. Either way, the honest statement is that the population in which vitamin C halves cold incidence is one almost nobody buying it belongs to.',
        evidenceSource: 'Hemila H, Chalker E. Cochrane Database Syst Rev 2013;1:CD000980',
        doi: '10.1002/14651858.CD000980.pub4',
        measuredMetric:
          'Pooled risk ratio for developing a cold in subjects under extreme short-term physical stress',
        auditFlag: 'verified',
      },
      {
        id: 'vitc-a3',
        category: 'conclusion_shift',
        title: 'Pauling\'s cancer claim, and the two Mayo trials that ended it',
        laymanSummary:
          'A double Nobel laureate spent decades arguing that high-dose vitamin C treated advanced cancer. Two randomised double-blind trials found no benefit whatsoever.',
        technicalDetails:
          'Moertel and colleagues at the Mayo Clinic randomised 100 patients with advanced colorectal cancer, none of whom had received any prior cytotoxic drugs — the precise population in which the claim was said to hold — to 10 g of vitamin C daily or placebo, double-blind. There was no advantage over placebo in time from start of treatment to disease progression or in survival, and among patients with measurable disease none had objective improvement. The authors wrote that on the basis of this and their previous randomised study, high-dose vitamin C is not effective against advanced malignant disease regardless of prior chemotherapy. The scientific residue of the episode is instructive: Pauling\'s original supporting data came from a non-randomised comparison against historical controls at a hospital where patients entering the vitamin C group were selected differently. The mechanism was never absurd — ascorbate at millimolar concentration does generate hydrogen peroxide near tumour cells — but that mechanism was tested and did not produce the outcome.',
        evidenceSource: 'Moertel CG et al. N Engl J Med 1985;312:137-141',
        doi: '10.1056/NEJM198501173120301',
        measuredMetric:
          'Interval from start of treatment to disease progression, survival, and objective tumour response',
        inferredClaim:
          'That a plausible biochemical mechanism plus an eminent advocate plus a favourable non-randomised series establishes a treatment effect',
        auditFlag: 'verified',
      },
      {
        id: 'vitc-a4',
        category: 'failed',
        title: 'LOVIT: intravenous vitamin C made septic patients worse',
        laymanSummary:
          'In 872 intensive-care patients with sepsis, those given intravenous vitamin C were more likely to die or still be on organ support at 28 days than those given placebo.',
        technicalDetails:
          'LOVIT randomised 872 adults who had been in the ICU no longer than 24 hours with proven or suspected infection as the main diagnosis and who were receiving a vasopressor, to vitamin C 50 mg/kg or matched placebo every 6 hours for up to 96 hours. The composite primary outcome of death or persistent organ dysfunction at day 28 occurred in 191 of 429 (44.5%) on vitamin C against 167 of 434 (38.5%) on placebo — risk ratio 1.21 (95% CI 1.04 to 1.40, P = 0.01). Death alone was 35.4% against 31.6% (RR 1.17, 95% CI 0.98 to 1.40) and persistent organ dysfunction 9.1% against 6.9% (RR 1.30, 95% CI 0.83 to 2.05). One vitamin C patient had a severe hypoglycaemic episode and another a serious anaphylaxis event. Organ dysfunction scores, biomarkers, six-month survival and quality of life were similar. This is a randomised finding of harm from a trial powered and designed to detect benefit, and it is the single most important vitamin C result of the last decade.',
        evidenceSource: 'Lamontagne F et al. N Engl J Med 2022;386:2387-2398',
        doi: '10.1056/NEJMoa2200644',
        measuredMetric:
          'Composite of death or persistent organ dysfunction at day 28 in septic ICU patients on vasopressors',
        auditFlag: 'verified',
      },
      {
        id: 'vitc-a5',
        category: 'conclusion_shift',
        title: 'The sepsis protocol that spread from a 47-patient before-after study',
        laymanSummary:
          'A single small retrospective study reported that a vitamin C protocol cut sepsis deaths from 40 percent to 8 percent. Intensive care units adopted it worldwide. The randomised trials that followed found nothing, then found harm.',
        technicalDetails:
          'Marik and colleagues published a retrospective before-after study of 47 treated and 47 historical control patients, reporting hospital mortality of 8.5% against 40.4% (P < .001) and a propensity-adjusted odds ratio for mortality of 0.13 (95% CI 0.04 to 0.48). The design is the weakest one that can produce a number: no randomisation, no blinding, sequential time periods, and a control group assembled from the preceding seven months. Adoption nevertheless outran the evidence by years. CITRIS-ALI then randomised 167 patients with sepsis and ARDS and found no difference in the primary endpoints — modified SOFA score change from baseline to 96 hours differed by -0.10 (95% CI -1.23 to 1.03, P = .86), C-reactive protein P = .33. The VITAMINS trial compared vitamin C, hydrocortisone and thiamine against hydrocortisone alone in septic shock and found no difference in time alive and free of vasopressors. LOVIT then found harm. CHEST published an Editor\'s Note attached to the original 2017 paper in 2023.',
        evidenceSource:
          'Marik PE et al. Chest 2017;151:1229-1238; Fowler AA et al. JAMA 2019;322:1261-1270; Fujii T et al. JAMA 2020;323:423-431',
        doi: '10.1001/jama.2019.11825',
        measuredMetric:
          'Hospital mortality (retrospective), modified SOFA score change to 96 hours, and time alive and free of vasopressor support',
        inferredClaim:
          'That a before-after study with historical controls can establish a mortality benefit large enough to change practice before randomisation',
        auditFlag: 'contested',
      },
      {
        id: 'vitc-a6',
        category: 'failed',
        title: 'Physicians\' Health Study II: 14,641 men, eight years, no cardiovascular effect',
        laymanSummary:
          'A long randomised trial gave 500 mg of vitamin C a day to nearly fifteen thousand male doctors for eight years. It made no difference to heart attacks, strokes or cardiovascular death.',
        technicalDetails:
          'The Physicians\' Health Study II randomised 14,641 male physicians aged 50 or older to vitamin C 500 mg daily, vitamin E 400 IU every other day, both, or placebo, in a factorial design with a mean follow-up of eight years. Neither vitamin C nor vitamin E reduced the composite of major cardiovascular events, and neither reduced total mortality. Vitamin E was associated with an increased risk of haemorrhagic stroke. The companion cancer analysis from the same cohort found neither vitamin reduced prostate cancer or total cancer incidence. Eight years of randomised supplementation in a well-nourished population is exactly the design that should have detected an antioxidant benefit if one existed at that dose, and it detected none.',
        evidenceSource: 'Sesso HD et al. JAMA 2008;300:2123-2133',
        doi: '10.1001/jama.2008.600',
        measuredMetric:
          'Composite of nonfatal myocardial infarction, nonfatal stroke and cardiovascular death over eight years',
        auditFlag: 'verified',
      },
      {
        id: 'vitc-a7',
        category: 'inferred',
        title: 'Kidney stones: roughly double the incidence in supplement users',
        laymanSummary:
          'In a cohort of 23,355 Swedish men followed for eleven years, those taking vitamin C supplements developed kidney stones at about twice the rate of non-users.',
        technicalDetails:
          'Thomas and colleagues followed 23,355 men in the Cohort of Swedish Men from 1998 to 2009 and identified 436 first incident kidney stones: 31 among ascorbic acid supplement users and 405 among non-users. The multivariable-adjusted relative risk for ascorbic-acid-only supplement users against non-users was 1.92 (95% CI 1.33 to 2.77), with a dose gradient — men taking seven or more tablets weekly had a relative risk of 2.23 (95% CI 1.28 to 3.88). The mechanism is direct: oxalate is a terminal metabolite of ascorbate, and urinary oxalate is the dominant driver of calcium oxalate stone formation. This is observational, so confounding by indication cannot be excluded, and the absolute numbers are small. It is nonetheless the most concrete harm signal attached to ordinary consumer use of vitamin C, and it is not on any label.',
        evidenceSource: 'Thomas LDK et al. JAMA Intern Med 2013;173:386-388',
        doi: '10.1001/jamainternmed.2013.2296',
        measuredMetric:
          'Incidence of first kidney stone over 11 years in ascorbic acid supplement users versus non-users',
        inferredClaim:
          'That high-dose vitamin C is harmless because the excess is excreted — the excess is excreted as oxalate, through the kidney',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A broken gene is why we need it at all',
        laymanDesc:
          'Most animals make their own vitamin C. Humans carry the gene for the final step of the pathway, but it is broken, so we have to eat it.',
        molecularDetail:
          'L-gulonolactone oxidase (GULO) is a non-functional pseudogene in haplorrhine primates, guinea pigs and some bats. Every other step of the glucose-to-ascorbate pathway is intact in humans. The consequence is that ascorbate is a vitamin for us and a metabolite for a rat, which is why rodent models of vitamin C biology require the Gulo-knockout mouse to be informative at all.',
        iconName: 'Dna',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorption saturates, and the kidney does the rest',
        laymanDesc:
          'The gut can only take up so much at a time, and once blood levels pass a threshold the kidney simply excretes the surplus. This is why a gram and ten grams end up looking nearly the same in the bloodstream.',
        molecularDetail:
          'SVCT1 (SLC23A1) mediates saturable sodium-dependent absorption in the small intestine and reabsorption in the renal proximal tubule. Fractional absorption falls steeply with dose while the renal threshold caps plasma concentration, producing a near-flat plasma dose-response above a modest intake. This pharmacokinetic ceiling is the single most important fact about oral vitamin C and the reason intravenous administration was pursued at all.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Its real job: resetting the iron inside collagen-building enzymes',
        laymanDesc:
          'Vitamin C is not mopping up damage. It is a repair crew for a specific set of enzymes whose iron atom gets stuck in the wrong state after each reaction and cannot work again until something resets it.',
        molecularDetail:
          'Prolyl 4-hydroxylase and lysyl hydroxylase are Fe(II)- and 2-oxoglutarate-dependent dioxygenases. Uncoupled turnover leaves Fe(III) at the active site; ascorbate reduces it back to Fe(II). Without that reset, procollagen is under-hydroxylated, the triple helix is unstable, and connective tissue fails. The same enzyme family includes the HIF prolyl hydroxylases and several DNA and histone demethylases, which is why ascorbate has effects on gene regulation that have nothing to do with antioxidant chemistry.',
        iconName: 'Wrench',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'At intravenous concentrations it stops being an antioxidant',
        laymanDesc:
          'At the enormous concentrations only a drip can produce, vitamin C flips character and starts generating hydrogen peroxide. That was the hoped-for anticancer mechanism, and it is also the most likely reason it hurt septic patients.',
        molecularDetail:
          'At millimolar extracellular concentration ascorbate reduces catalytically available transition metals, driving Fenton chemistry and generating extracellular hydrogen peroxide. Critically ill patients have elevated free iron and impaired antioxidant defences, which is the condition under which that chemistry does damage rather than good. LOVIT\'s risk ratio of 1.21 for death or persistent organ dysfunction is the clinical form of this step.',
        iconName: 'Flame',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'What leaves the body, and where it goes on the way out',
        laymanDesc:
          'The vitamin C you do not use is broken down partly into oxalate and passed in urine — which is the chemical that forms the most common kind of kidney stone.',
        molecularDetail:
          'Ascorbate degrades through dehydroascorbate and 2,3-diketogulonate to oxalate, which is excreted renally and is the anion in calcium oxalate stones. In the Cohort of Swedish Men, ascorbic-acid-only supplement users had a multivariable relative risk of first kidney stone of 1.92 (95% CI 1.33 to 2.77) with a dose gradient to 2.23 at seven or more tablets weekly.',
        iconName: 'Droplets',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane CD000980 — vitamin C for preventing and treating the common cold',
        phase: 'Cochrane systematic review of placebo-controlled trials',
        sampleSize: 11306,
        primaryEndpoint: 'Incidence and duration of the common cold under regular supplementation',
        endpointMet: false,
        statisticalPValue:
          'General community incidence RR 0.97 (95% CI 0.94 to 1.00); adult duration reduced 8% (95% CI 3% to 12%); children 14% (95% CI 7% to 21%)',
        unreportedAdverseSignals:
          'Trials using less than 0.2 g/day were excluded, so this is not evidence about ordinary multivitamin doses. Therapeutic administration at symptom onset showed no consistent effect, which is the way most people actually use it.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Moertel 1985 — high-dose vitamin C in advanced colorectal cancer',
        phase: 'Randomised double-blind placebo-controlled',
        sampleSize: 100,
        primaryEndpoint: 'Time to disease progression and survival on 10 g/day vitamin C',
        endpointMet: false,
        statisticalPValue:
          'No advantage over placebo for time to progression or survival; no objective response among patients with measurable disease',
        unreportedAdverseSignals:
          'This was the second Mayo Clinic randomised trial to test the claim, and it was run specifically in chemotherapy-naive patients because that was the population the claim had retreated to after the first.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Physicians\' Health Study II — vitamin C and vitamin E in cardiovascular prevention',
        phase: 'Randomised double-blind placebo-controlled factorial',
        sampleSize: 14641,
        primaryEndpoint:
          'Composite of nonfatal myocardial infarction, nonfatal stroke and cardiovascular death',
        endpointMet: false,
        statisticalPValue: 'No significant effect of vitamin C on the composite endpoint over eight years',
        unreportedAdverseSignals:
          'Vitamin E in the same trial was associated with an increased risk of haemorrhagic stroke. The companion analysis found no reduction in prostate or total cancer.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CITRIS-ALI — intravenous vitamin C in sepsis with acute respiratory failure',
        phase: 'Randomised double-blind placebo-controlled multicentre',
        sampleSize: 167,
        primaryEndpoint:
          'Change in modified SOFA score from baseline to 96 hours, plus CRP and thrombomodulin',
        endpointMet: false,
        statisticalPValue:
          'Modified SOFA difference -0.10 (95% CI -1.23 to 1.03), P = .86; CRP P = .33',
        unreportedAdverseSignals:
          'Only 103 of 167 patients (62%) completed follow-up to day 60. Secondary mortality analyses from this trial were widely quoted as positive despite the primary endpoints being null.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'LOVIT — intravenous vitamin C in adults with sepsis in the ICU',
        phase: 'Randomised placebo-controlled',
        sampleSize: 872,
        primaryEndpoint: 'Composite of death or persistent organ dysfunction at day 28',
        endpointMet: false,
        statisticalPValue: 'Risk ratio 1.21 (95% CI 1.04 to 1.40), P = 0.01 — favouring placebo',
        unreportedAdverseSignals:
          'One severe hypoglycaemic episode and one serious anaphylaxis event in the vitamin C group. High-dose ascorbate also interferes with point-of-care glucose meters, which is a documented cause of dangerous mismanagement.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Regular vitamin C shortened colds by 8% in adults and 14% in children across 9,745 cold episodes',
        'It did not reduce cold incidence in the general community, RR 0.97 (95% CI 0.94 to 1.00) in 10,708 participants',
        'It halved cold incidence in marathon runners, skiers and soldiers on subarctic exercises, RR 0.48 across five trials',
        'Intravenous vitamin C increased death or persistent organ dysfunction in septic ICU patients, RR 1.21 (P = 0.01)',
        'Supplement users in a 23,355-man cohort had roughly double the incidence of kidney stones, with a dose gradient',
      ],
      unsupportedInferences: [
        'That vitamin C prevents colds in ordinary people, which the largest pooled estimate rules out to within a few percent',
        'That taking it once symptoms start helps, which the therapeutic trials do not support',
        'That high-dose vitamin C treats cancer, tested twice at the Mayo Clinic and negative both times',
        'That because the excess is excreted, more is harmless — the excess is excreted partly as oxalate',
      ],
      whatFailedInitially: [
        'Pauling\'s cancer programme, which rested on a non-randomised comparison against historical controls',
        'The Marik sepsis protocol, adopted worldwide from a 47-patient before-after study and then negative in CITRIS-ALI, VITAMINS and LOVIT',
        'Vitamin C as cardiovascular prevention, null across 14,641 men and eight years in Physicians\' Health Study II',
      ],
      realWorldOutcome: [
        'Vitamin C is unambiguously essential, and scurvy is a real disease that it cures completely and quickly',
        'The measurable supplement effects in replete people are small: about half a day off a cold, and better absorption of non-haem iron',
        'The clearest large effects in the modern literature are in the wrong direction — harm in sepsis, and stones in the community',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, capsule, powder or effervescent; intravenous infusion in the critical-care literature',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy or safety before sale. The oral and intravenous routes are not the same intervention: intestinal saturation caps oral plasma concentrations in the tens of micromolar, while infusion reaches millimolar, which is a different chemistry with a different risk profile. Liposomal and "buffered" formulations are marketed on the premise of beating the absorption ceiling; the ceiling is transporter-mediated and renal, and claims to have circumvented it need transporter-level evidence, not a plasma curve from a single small study.',
      safetyProfile:
        'Osmotic diarrhoea and abdominal cramping above roughly a gram, which is a direct consequence of unabsorbed ascorbate in the lumen. Increased urinary oxalate and, in a large prospective cohort, roughly double the incidence of kidney stones in supplement users. High-dose ascorbate causes falsely elevated readings on many point-of-care glucose meters, a documented hazard in hospitalised patients. In glucose-6-phosphate dehydrogenase deficiency, very high intravenous doses have precipitated haemolysis. In sepsis, intravenous administration increased death or persistent organ dysfunction in a randomised trial.',
    },
    commonQuestions: [
      {
        q: 'Does vitamin C stop me getting colds?',
        a: 'No, not if you are an ordinary person eating an ordinary diet. Across 10,708 people in general-community trials the risk ratio was 0.97 with a confidence interval reaching 1.00. The one striking exception is people under extreme short-term physical stress — marathon runners, skiers, soldiers on subarctic exercises — where five trials in 598 subjects pooled to a risk ratio of 0.48. That is a real and unusual finding, and it describes a population most buyers are not in.',
      },
      {
        q: 'Will it make my cold shorter if I take it now?',
        a: 'Probably not. The 8% shortening in adults comes from trials where people took vitamin C every day, before they got ill. Trials that started vitamin C once symptoms had already begun did not show a consistent effect on duration or severity. So the version of the habit almost everyone practises — reaching for it at the first sneeze — is the version with the weakest support.',
        auditNote:
          'Eight percent of a seven-day cold is about half a day, even in the prophylactic trials.',
      },
      {
        q: 'What happened with vitamin C and sepsis?',
        a: 'It is one of the clearest cautionary tales in modern critical care. A 47-patient retrospective before-after study in 2017 reported mortality falling from 40 percent to 8.5 percent, and units around the world adopted the protocol. CITRIS-ALI then randomised 167 patients and found no difference in its primary endpoints. The VITAMINS trial found no difference in time alive and free of vasopressors. Then LOVIT randomised 872 patients and found death or persistent organ dysfunction in 44.5 percent on vitamin C against 38.5 percent on placebo, risk ratio 1.21, P = 0.01. The sequence took five years and went from spectacular benefit to measurable harm.',
        auditNote:
          'CHEST attached an Editor\'s Note to the original 2017 paper in 2023.',
      },
      {
        q: 'Is there any downside to taking a lot?',
        a: 'Two documented ones. Above about a gram the gut cannot absorb it and the surplus draws water into the bowel, causing diarrhoea. And ascorbate is metabolised partly to oxalate, the anion in the commonest type of kidney stone: in 23,355 Swedish men followed eleven years, supplement users had a relative risk of first stone of 1.92, rising to 2.23 in those taking seven or more tablets weekly. High doses also make many hospital glucose meters read falsely high, which has led to real mismanagement.',
      },
      {
        q: 'Why is a nutrient that cures scurvy so weak as a supplement?',
        a: 'Because those are two different questions, and this is the cleanest example of the difference in the whole supplement aisle. Scurvy is what happens when a specific set of iron-dependent enzymes cannot complete their catalytic cycle. Restore enough ascorbate for those enzymes and they work; add more and there is nothing further for it to do, because the enzymes are already saturated and the kidney excretes the surplus. A deficiency effect is not a supplement effect, and vitamin C is the case that proves it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Moertel CG et al. High-dose vitamin C versus placebo in the treatment of patients with advanced cancer who have had no prior chemotherapy: a randomized double-blind comparison. N Engl J Med 1985;312:137-141',
        identifier: '10.1056/NEJM198501173120301',
        kind: 'doi',
      },
      {
        label:
          'Sesso HD et al. Vitamins E and C in the prevention of cardiovascular disease in men: the Physicians\' Health Study II randomized controlled trial. JAMA 2008;300:2123-2133',
        identifier: '10.1001/jama.2008.600',
        kind: 'doi',
      },
      {
        label:
          'Hemila H, Chalker E. Vitamin C for preventing and treating the common cold. Cochrane Database Syst Rev 2013;1:CD000980',
        identifier: '10.1002/14651858.CD000980.pub4',
        kind: 'doi',
      },
      {
        label:
          'Thomas LDK, Elinder CG, Tiselius HG, Wolk A, Akesson A. Ascorbic acid supplements and kidney stone incidence among men: a prospective study. JAMA Intern Med 2013;173:386-388',
        identifier: '10.1001/jamainternmed.2013.2296',
        kind: 'doi',
      },
      {
        label:
          'Marik PE et al. Hydrocortisone, vitamin C, and thiamine for the treatment of severe sepsis and septic shock: a retrospective before-after study. Chest 2017;151:1229-1238',
        identifier: '10.1016/j.chest.2016.11.036',
        kind: 'doi',
      },
      {
        label:
          'Fowler AA et al. Effect of vitamin C infusion on organ failure and biomarkers of inflammation and vascular injury in patients with sepsis and severe acute respiratory failure: the CITRIS-ALI randomized clinical trial. JAMA 2019;322:1261-1270',
        identifier: '10.1001/jama.2019.11825',
        kind: 'doi',
      },
      {
        label:
          'Fujii T et al. Effect of vitamin C, hydrocortisone, and thiamine vs hydrocortisone alone on time alive and free of vasopressor support among patients with septic shock: the VITAMINS randomized clinical trial. JAMA 2020;323:423-431',
        identifier: '10.1001/jama.2019.22176',
        kind: 'doi',
      },
      {
        label:
          'Lamontagne F et al. Intravenous vitamin C in adults with sepsis in the intensive care unit. N Engl J Med 2022;386:2387-2398',
        identifier: '10.1056/NEJMoa2200644',
        kind: 'doi',
      },
      {
        label: 'CHEST Editor\'s Note attached to Marik PE et al. Chest 2017;151:1229-1238',
        identifier: '10.1016/j.chest.2023.04.021',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 54670067 — L-Ascorbic acid',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54670067',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Lisinopril — an outcome drug after myocardial infarction, and the arm of ALLHAT that lost
  //    to a diuretic costing a fraction as much.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lisinopril',
    name: 'Lisinopril',
    tradeName: 'Zestril / Prinivil',
    sponsor:
      'ICI / Zeneca, now AstraZeneca (Zestril) and Merck (Prinivil); long off-patent and made by many manufacturers',
    targetGene: 'ACE',
    targetProtein:
      'Angiotensin-converting enzyme, also called peptidyl-dipeptidase A and kininase II',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1988,
    indication:
      'Hypertension in adults and children aged 6 and older; adjunctive therapy for heart failure with reduced ejection fraction; and treatment within 24 hours of acute myocardial infarction in haemodynamically stable patients to improve survival',
    patientFriendlyIndication: 'High blood pressure, heart failure, and the days after a heart attack',
    anatomicalSite:
      'Vascular endothelium, principally pulmonary capillary endothelium, plus renal proximal tubule',
    conditionContext: {
      conditionExplainer:
        'The kidney runs a hormone cascade that raises blood pressure when it senses low flow. Renin cuts angiotensinogen into angiotensin I, and a converting enzyme sitting on the surface of blood vessel lining cells clips two more amino acids off to make angiotensin II, which constricts arteries and tells the adrenal gland to hold on to salt. In hypertension and in a failing heart, that cascade stays switched on when it should not be.',
      whyItMatters:
        'The same enzyme also destroys bradykinin, a peptide that dilates vessels and irritates airway nerves. Blocking it therefore does two things at once, and the second one is the source of the dry cough and, rarely, the angioedema. The side effect and the mechanism are the same fact seen from two sides.',
      whoTakesThis:
        'One of the most-prescribed drugs in the United States. Used for hypertension, for heart failure with reduced ejection fraction, in the days after a myocardial infarction, and to slow progression of diabetic kidney disease. It is on the WHO Model List of Essential Medicines.',
      clinicalGoals:
        'Lower blood pressure, and in the trials that counted events, reduce 6-week death after myocardial infarction and reduce hospitalisation in heart failure.',
    },
    oneSentenceVerdict:
      'A converting-enzyme inhibitor with a genuine randomised survival result in 19,394 patients started within 24 hours of a heart attack — 6-week mortality odds ratio 0.88 — and a genuine randomised defeat in ALLHAT, where 9,054 patients on lisinopril had more strokes, more heart failure and more combined cardiovascular disease than 15,255 on a thiazide-type diuretic that cost far less.',
    laymanHowItWorks:
      'Your body makes a hormone that squeezes blood vessels tight, and it makes it by having an enzyme snip two pieces off an inactive precursor. Lisinopril sits in that enzyme and blocks the snip, so the squeezing hormone is not produced. The same enzyme normally destroys a second, vessel-relaxing molecule, so blocking it also leaves more of that around — which is why blood pressure falls from both directions, and why some people get a persistent dry cough.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 86,
    substitutes: {
      summary:
        'Lisinopril costs between one and five cents a tablet in the United States at pharmacy acquisition cost. Chlorthalidone, the comparator that beat it in ALLHAT on three secondary endpoints, costs about the same. Losartan and the other angiotensin receptor blockers do not cause the cough and have their own outcome trials. The honest summary is that this is a crowded class where the cheapest option won the largest head-to-head trial ever run.',
      conventionalRx: [
        {
          name: 'Chlorthalidone',
          class: 'Thiazide-type diuretic',
          howItCompares:
            'In ALLHAT, with 15,255 participants on chlorthalidone against 9,054 on lisinopril and a mean 4.9 years of follow-up, the primary endpoint was identical (relative risk 0.99, 95% CI 0.91 to 1.08) but lisinopril had higher 6-year rates of combined cardiovascular disease (33.3% against 30.9%), stroke (6.3% against 5.6%) and heart failure (8.7% against 7.7%). Five-year systolic pressure was 2 mm Hg higher on lisinopril.',
          typicalCost:
            'US$0.023 per 10 mg lisinopril tablet at pharmacy acquisition cost (CMS NADAC, effective 19 August 2026) — the diuretic is in the same order of magnitude',
          prosAndCons:
            'Pros: cheapest class, won the largest randomised comparison, no cough. Cons: hypokalaemia, hyperuricaemia and gout, new-onset diabetes, and a photosensitivity-linked skin cancer signal in Danish registry data.',
        },
        {
          name: 'Losartan (Cozaar)',
          class: 'Angiotensin II receptor blocker',
          howItCompares:
            'Blocks the receptor rather than the enzyme, so bradykinin is not spared and the dry cough largely does not occur. It has its own outcome trials in LIFE and RENAAL. In ELITE II it did not prove superior to an ACE inhibitor for mortality in heart failure, and in OPTIMAAL it did not prove superior after myocardial infarction.',
          typicalCost:
            'US$0.032 per 50 mg generic losartan potassium tablet at pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no cough, similar blood pressure effect. Cons: angioedema still occurs, if less often; the head-to-head trials against ACE inhibitors did not establish superiority.',
        },
        {
          name: 'Amlodipine (Norvasc)',
          class: 'Dihydropyridine calcium channel blocker',
          howItCompares:
            'In the third ALLHAT arm, amlodipine matched chlorthalidone on the primary endpoint and on all-cause mortality, but had a 38% higher 6-year rate of heart failure (10.2% against 7.7%). It does not cause cough, and it does not raise potassium.',
          typicalCost:
            'Generic amlodipine besylate is among the lowest-cost tablets in the CMS NADAC file, in the same range as lisinopril',
          prosAndCons:
            'Pros: no metabolic effects, no cough, no potassium problem, effective across ethnic groups. Cons: dose-dependent ankle oedema, and the heart-failure excess in ALLHAT.',
        },
      ],
      naturalFoods: [
        {
          name: 'Dietary sodium reduction',
          activeCompound: 'The absence of sodium chloride',
          biologicalMechanism:
            'Lowering sodium intake reduces extracellular volume and lowers blood pressure through a different lever than the renin-angiotensin system. It also raises renin, which is one reason its effect and an ACE inhibitor\'s effect are partly additive rather than redundant.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here. Sodium reduction has randomised trials with blood pressure as the endpoint; this page does not give intake targets.',
          monthlyCost: 'No cost — it is a subtraction, not a purchase',
        },
      ],
      homeRemedies: [
        {
          name: 'Report a new dry cough rather than tolerating it',
          action:
            'Tell the prescriber if a persistent tickly cough begins after starting this drug, particularly within the first weeks.',
          patientImpact:
            'Cough occurs in 5% to 20% of patients on an ACE inhibitor, recurs on rechallenge with the same or another drug of the class, and is more common in women. A short withdrawal identifies it cheaply. Switching to a different ACE inhibitor is specifically not recommended, because the mechanism is shared.',
          clinicalPrecaution:
            'Swelling of the lips, tongue or throat is angioedema, not cough. It occurs in 0.1% to 0.2% of patients, usually within hours to a week of starting, and is an airway emergency rather than a tolerability question.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1C[C@H](N(C1)C(=O)[C@H](CCCCN)N[C@@H](CCC2=CC=CC=C2)C(=O)O)C(=O)O',
      chemicalFormula: 'C21H31N3O5',
      molecularWeight: '405.5 g/mol; dispensed as lisinopril dihydrate',
      targetReceptorAffinity:
        'A zinc-binding active-site inhibitor of angiotensin-converting enzyme. Unlike captopril it has no thiol group and unlike enalapril it is not an ester prodrug: the carboxylate coordinates the catalytic zinc directly, so the molecule administered is the molecule that binds. It is not metabolised at all and is excreted unchanged in urine.',
      structureSource: {
        label:
          'PubChem CID 5362119 (lisinopril) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5362119',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lis-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Stereochemical control of the lysyl-proline dipeptide',
          description:
            'Verify the configuration of the protected L-lysyl-L-proline starting dipeptide and the enantiomeric purity of the phenylbutanoate keto ester before the reductive amination. Lisinopril has three stereocentres and all three must be S; the (R,S,S) diastereomer formed at the new centre is the principal process-related impurity and the reason the purification step exists.',
          reagentsAndBuffer:
            'N-epsilon-(benzyloxycarbonyl)-L-lysyl-L-proline reference standard, ethyl 2-oxo-4-phenylbutanoate, chiral HPLC, polarimetry, Karl Fischer titration',
        },
        {
          id: 'lis-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Reductive amination to install the (S)-carboxypropyl arm',
          description:
            'Condense the free alpha-amino group of the protected lysyl-proline with the keto ester and reduce the resulting imine under hydrogen. This forms the carbon-nitrogen bond that carries the third stereocentre, and it is the step whose diastereoselectivity determines yield: the catalyst and solvent are chosen for facial bias, not for rate.',
          dependsOnStepId: 'lis-w1',
          reagentsAndBuffer:
            'Ethyl 2-oxo-4-phenylbutanoate, Raney nickel under hydrogen (or sodium cyanoborohydride as the laboratory-scale alternative), methanol/water with acetic acid to buffer the imine equilibrium',
        },
        {
          id: 'lis-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Deprotection, diastereomer separation and dihydrate crystallisation',
          description:
            'Remove the benzyloxycarbonyl group from the lysine side chain by hydrogenolysis, hydrolyse the ethyl ester, then separate the wanted (S,S,S) diastereomer from the (R,S,S) by ion-exchange chromatography and crystallise the dihydrate. The hydrate stoichiometry is part of the identity: the label strength is stated for lisinopril, and water content is a release specification.',
          dependsOnStepId: 'lis-w2',
          reagentsAndBuffer:
            'Palladium on carbon under hydrogen, aqueous sodium hydroxide for ester hydrolysis, strong-acid cation exchange resin with ammonia elution, water/acetone recrystallisation, Karl Fischer for the dihydrate specification',
        },
        {
          id: 'lis-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'PEPT1-mediated transport across an intestinal monolayer',
          description:
            'Measure apical-to-basolateral flux across differentiated Caco-2 monolayers and confirm it is carrier-mediated by competing it with a dipeptide. Lisinopril is a charged tripeptide analogue with no passive permeability worth the name; it is absorbed because the intestinal peptide transporter mistakes it for food, which is also why its oral bioavailability is only about a quarter of the dose and is variable between people.',
          dependsOnStepId: 'lis-w3',
          reagentsAndBuffer:
            'Caco-2 cells on polycarbonate Transwell inserts, Hanks balanced salt solution at pH 6.0 apical and 7.4 basolateral, glycylsarcosine as competing PEPT1 substrate, lucifer yellow as monolayer integrity marker, LC-MS/MS quantification',
        },
        {
          id: 'lis-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Angiotensin-converting enzyme inhibition assay',
          description:
            'Measure inhibition of the dipeptidyl carboxypeptidase activity of ACE against a synthetic tripeptide substrate, reading the released dipeptide fluorimetrically. Running the assay against both the angiotensin I substrate and a bradykinin substrate in parallel is the point: the same catalytic site does both jobs, and the second reaction is the one that produces the cough.',
          dependsOnStepId: 'lis-w4',
          reagentsAndBuffer:
            'Purified angiotensin-converting enzyme, hippuryl-L-histidyl-L-leucine substrate, 100 mM potassium phosphate with 300 mM sodium chloride at pH 8.3, o-phthalaldehyde for fluorimetric His-Leu detection, captopril as positive control inhibitor',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lis-a1',
        category: 'measured',
        title: 'GISSI-3: a 12% relative reduction in 6-week death across 19,394 patients',
        laymanSummary:
          'Nearly twenty thousand people in Italian coronary care units were randomised, within a day of their heart attack, to six weeks of lisinopril or to no lisinopril. Fewer of the treated group were dead at six weeks.',
        technicalDetails:
          'Between June 1991 and July 1993, 19,394 patients were randomised in 200 Italian coronary care units within 24 hours of symptom onset, in a factorial design of oral lisinopril (5 mg then 10 mg daily for 6 weeks) or open control, crossed with transdermal glyceryl trinitrate or open control. Complete 6-week follow-up was available for 18,895 patients (97.4%). Overall 6-week mortality was 6.7%. Lisinopril reduced overall mortality with an odds ratio of 0.88 (95% CI 0.79 to 0.99) and the combined outcome of mortality plus severe ventricular dysfunction with an odds ratio of 0.90 (0.84 to 0.98). Transdermal nitrate alone showed no independent effect on either (0.94, 0.84 to 1.05; and 0.94, 0.87 to 1.02). The result was obtained against a background of thrombolysis in 72%, aspirin in 84% and beta-blockade in 31%.',
        evidenceSource:
          'GISSI-3 investigators, Lancet 1994;343:1115-1122 (PMID 7910229)',
        doi: '10.1016/S0140-6736(94)90232-1',
        measuredMetric: 'All-cause mortality at 6 weeks after acute myocardial infarction',
        auditFlag: 'verified',
      },
      {
        id: 'lis-a2',
        category: 'failed',
        title: 'ALLHAT: lisinopril lost to a cheap diuretic on stroke, heart failure and combined disease',
        laymanSummary:
          'The largest hypertension trial ever run compared lisinopril with a thiazide-type diuretic in more than 24,000 people. On the main endpoint they tied. On three secondary endpoints the diuretic won.',
        technicalDetails:
          'ALLHAT randomised 33,357 hypertensive participants aged 55 or older with at least one other coronary risk factor to chlorthalidone 12.5-25 mg (n=15,255), amlodipine 2.5-10 mg (n=9,048) or lisinopril 10-40 mg (n=9,054), mean follow-up 4.9 years. The primary endpoint of fatal coronary heart disease plus non-fatal myocardial infarction did not differ: 6-year rates 11.5% on chlorthalidone against 11.4% on lisinopril, relative risk 0.99 (95% CI 0.91 to 1.08). All-cause mortality did not differ either. But lisinopril had higher 6-year rates of combined cardiovascular disease (33.3% against 30.9%; RR 1.10, 1.05 to 1.16), stroke (6.3% against 5.6%; RR 1.15, 1.02 to 1.30) and heart failure (8.7% against 7.7%; RR 1.19, 1.07 to 1.31). Five-year systolic blood pressure was 2 mm Hg higher on lisinopril (p<0.001). The investigators concluded that thiazide-type diuretics should be preferred for first-step therapy.',
        evidenceSource:
          'ALLHAT Officers and Coordinators, JAMA 2002;288:2981-2997 (NCT00000542)',
        doi: '10.1001/jama.288.23.2981',
        measuredMetric:
          'Six-year rates of stroke, heart failure and combined cardiovascular disease, lisinopril versus chlorthalidone',
        auditFlag: 'verified',
      },
      {
        id: 'lis-a3',
        category: 'inferred',
        title: 'The 2 mm Hg gap in ALLHAT is used to explain the loss, and cannot be shown to',
        laymanSummary:
          'Defenders of the drug argue lisinopril only lost because it controlled blood pressure slightly less well in that trial. That is a plausible explanation. It is not something the trial measured, because you cannot randomise people to a blood pressure.',
        technicalDetails:
          'Five-year systolic pressure was 2 mm Hg higher in the lisinopril arm than in the chlorthalidone arm (p<0.001), and the excess events were concentrated in outcomes most sensitive to systolic pressure. The inference that the entire difference is attributable to achieved blood pressure is a post-randomisation comparison: participants were randomised to a drug, not to a pressure, and any analysis conditioning on achieved pressure breaks the randomisation. The trial supports the statement that a chlorthalidone-based strategy produced fewer strokes and less heart failure than a lisinopril-based strategy. It does not support the statement that the drugs are equivalent once pressure is accounted for.',
        evidenceSource: 'ALLHAT Officers and Coordinators, JAMA 2002;288:2981-2997',
        doi: '10.1001/jama.288.23.2981',
        inferredClaim:
          'That lisinopril and chlorthalidone are equivalent once achieved blood pressure is adjusted for — an adjustment that discards the randomisation that made the comparison trustworthy',
        auditFlag: 'contested',
      },
      {
        id: 'lis-a4',
        category: 'measured',
        title: 'ATLAS: dose matters for hospitalisation, and did not reach significance for death',
        laymanSummary:
          'Three thousand heart failure patients were randomised to a low or a high dose of the same drug. The high dose kept more people out of hospital. The reduction in deaths did not reach statistical significance.',
        technicalDetails:
          'ATLAS randomised 3,164 patients with NYHA class II to IV heart failure and an ejection fraction of 30% or less to double-blind low-dose lisinopril (2.5 to 5.0 mg daily, n=1,596) or high-dose lisinopril (32.5 to 35 mg daily, n=1,568) for 39 to 58 months, on top of background heart failure therapy. The high-dose group had a non-significant 8% lower risk of death (p=0.128), a significant 12% lower risk of death or hospitalisation for any reason (p=0.002), and 24% fewer hospitalisations for heart failure (p=0.002). Dizziness and renal insufficiency were more frequent on high dose, but the two groups did not differ in the number of patients who had to discontinue.',
        evidenceSource: 'Packer M et al., ATLAS, Circulation 1999;100:2312-2318',
        doi: '10.1161/01.CIR.100.23.2312',
        measuredMetric:
          'All-cause mortality and the composite of death or hospitalisation, high-dose versus low-dose lisinopril',
        auditFlag: 'verified',
      },
      {
        id: 'lis-a5',
        category: 'inferred',
        title: 'ATLAS is routinely cited as showing high doses save lives. Its mortality result was p=0.128',
        laymanSummary:
          'Guidelines say to push ACE inhibitor doses toward the target used in trials. The trial that tested exactly that found a mortality difference that could have been chance.',
        technicalDetails:
          'The mortality comparison in ATLAS gave an 8% relative reduction with p=0.128, which does not exclude no effect. The composite of death or all-cause hospitalisation was reduced by 12% (p=0.002) and heart failure hospitalisation by 24% (p=0.002), and those results carry the recommendation. The distinction is not pedantry: a composite driven by hospitalisation is a health-service outcome and a mortality endpoint is a survival outcome, and ATLAS is evidence for the first and not the second. The trial authors themselves framed the conclusion as patients not being maintained on very low doses, and stated that any difference between intermediate and high doses is likely to be very small.',
        evidenceSource: 'Packer M et al., ATLAS, Circulation 1999;100:2312-2318',
        doi: '10.1161/01.CIR.100.23.2312',
        inferredClaim:
          'That high-dose ACE inhibition reduces mortality in heart failure — ATLAS reduced hospitalisation, and its mortality comparison did not reach significance',
        auditFlag: 'caution',
      },
      {
        id: 'lis-a6',
        category: 'measured',
        title: 'The cough is bradykinin, it is common, and switching within the class does not help',
        laymanSummary:
          'Between one in twenty and one in five people on this class develop a persistent dry cough. It comes back if you try a different drug of the same class, because the cause is the shared mechanism.',
        technicalDetails:
          'Israili and Hall reviewed more than 400 articles and selected 200 reporting incidence or mechanism. Cough occurs in 5% to 20% of patients on an ACE inhibitor, is more common in women, and recurs on reintroduction of the same or another agent in the class. The proposed mechanism is accumulation of bradykinin, substance P and prostaglandins, all substrates the same enzyme degrades. A four-day withdrawal or temporary substitution identifies causation cheaply. Switching to a different ACE inhibitor is specifically not recommended. Angioedema occurs in 0.1% to 0.2%, usually within hours to a week of starting, and requires airway protection first and a change of drug class after.',
        evidenceSource: 'Israili ZH, Hall WD, Ann Intern Med 1992;117:234-242',
        doi: '10.7326/0003-4819-117-3-234',
        measuredMetric: 'Reported incidence of cough and of angioedema on ACE inhibitor therapy',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed by a food transporter, then left alone entirely',
        laymanDesc:
          'The molecule looks enough like a small piece of digested protein that the gut carries it in using the machinery meant for food. About a quarter of the dose gets through, and the body never chemically alters it.',
        molecularDetail:
          'Lisinopril is a lysine-containing tripeptide analogue, permanently charged and effectively impermeable by passive diffusion; intestinal absorption is mediated by the proton-coupled peptide transporter PEPT1, giving roughly 25% bioavailability with wide between-person variation. It undergoes no metabolism and is excreted unchanged in urine, which is why renal function determines its accumulation.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the enzyme on the surface of blood vessel lining',
        laymanDesc:
          'The target enzyme is anchored to the outside of the cells that line blood vessels, especially in the lungs. The drug does not need to enter a cell to work.',
        molecularDetail:
          'Angiotensin-converting enzyme is a type-I membrane-anchored ectoenzyme with its catalytic domains facing the vascular lumen, most densely on pulmonary capillary endothelium. Because the active site faces the blood, an inhibitor that never crosses a plasma membrane can fully engage it.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The carboxylate grabs the catalytic zinc',
        laymanDesc:
          'The enzyme depends on a zinc atom at its centre to do its cutting. The drug reaches in and locks onto the zinc, and nothing else can be processed while it is there.',
        molecularDetail:
          'The terminal carboxylate coordinates the active-site zinc ion, while the phenylpropyl and lysyl side chains occupy the S1 and S1-prime subsites. Unlike enalapril, no esterase activation is required, and unlike captopril there is no thiol, which removes the sulfhydryl-associated taste disturbance and rash but not the class effects.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Two peptides change at once: less angiotensin II, more bradykinin',
        laymanDesc:
          'The blocked enzyme had two jobs. It made the vessel-tightening hormone and destroyed a vessel-relaxing one. Blocking it reduces the first and preserves the second.',
        molecularDetail:
          'Conversion of angiotensin I to angiotensin II falls, reducing AT1-receptor-mediated vasoconstriction, aldosterone release and sodium retention, and reducing efferent arteriolar tone in the glomerulus. Simultaneously, bradykinin and substance P are no longer degraded by kininase II, raising nitric oxide and prostacyclin release from endothelium — and irritating airway C-fibres, which is the cough.',
        iconName: 'Split',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Pressure falls, and after a heart attack fewer people die at six weeks',
        laymanDesc:
          'Blood pressure comes down over days. In the trial that counted deaths after a heart attack, six weeks of treatment produced a measurable reduction in mortality.',
        molecularDetail:
          'Reduced afterload and reduced aldosterone-driven remodelling underlie the post-infarction result: in GISSI-3, 6-week mortality odds ratio 0.88 (95% CI 0.79 to 0.99) across 19,394 patients. In chronic hypertension, ALLHAT showed that this pressure reduction did not translate into fewer strokes or less heart failure than a thiazide-type diuretic achieved.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'GISSI-3',
        phase: 'Randomised open-control factorial trial, 6 weeks',
        sampleSize: 19394,
        primaryEndpoint:
          'All-cause mortality at 6 weeks, and the combined endpoint of mortality plus severe ventricular dysfunction',
        endpointMet: true,
        statisticalPValue:
          'Odds ratio 0.88 (95% CI 0.79-0.99) for mortality; 0.90 (0.84-0.98) for the combined endpoint',
        unreportedAdverseSignals:
          'The control arm was open, not placebo. Non-protocol ACE inhibitor use was permitted for specific clinical indications, which biases toward the null rather than away from it.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ALLHAT lisinopril arm (NCT00000542)',
        phase: 'Randomised double-blind active-controlled trial, mean 4.9 years',
        sampleSize: 24309,
        primaryEndpoint:
          'Combined fatal coronary heart disease or non-fatal myocardial infarction, lisinopril versus chlorthalidone',
        endpointMet: false,
        statisticalPValue: 'RR 0.99 (95% CI 0.91-1.08) — no difference on the primary endpoint',
        unreportedAdverseSignals:
          'Lisinopril had higher 6-year rates of stroke (RR 1.15), heart failure (RR 1.19) and combined cardiovascular disease (RR 1.10), all statistically significant.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ATLAS',
        phase: 'Randomised double-blind dose-comparison trial, 39 to 58 months',
        sampleSize: 3164,
        primaryEndpoint: 'All-cause mortality, high-dose versus low-dose lisinopril in heart failure',
        endpointMet: false,
        statisticalPValue: '8% lower risk of death, P = 0.128 — not statistically significant',
        unreportedAdverseSignals:
          'The significant results were the composite of death or hospitalisation (12%, p=0.002) and heart failure hospitalisation (24%, p=0.002). Dizziness and renal insufficiency were more frequent on high dose.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 6-week all-cause mortality odds ratio of 0.88 across 19,394 patients randomised within 24 hours of myocardial infarction',
        'Higher 6-year rates of stroke, heart failure and combined cardiovascular disease on lisinopril than on chlorthalidone in ALLHAT',
        'A 12% reduction in death or all-cause hospitalisation and 24% fewer heart failure hospitalisations at high dose versus low dose in 3,164 patients',
        'Cough in 5% to 20% of patients, recurring on rechallenge; angioedema in 0.1% to 0.2%',
      ],
      unsupportedInferences: [
        'That lisinopril and chlorthalidone are equivalent once the 2 mm Hg blood pressure difference in ALLHAT is adjusted for — an adjustment that discards the randomisation',
        'That high-dose ACE inhibition reduces mortality in heart failure — the ATLAS mortality comparison gave p=0.128',
        'That the ALLHAT result is a lisinopril-specific defect rather than a property of an ACE-inhibitor-first strategy in that population — the trial randomised strategies, not molecules in isolation',
        'That switching to a different ACE inhibitor resolves the cough — the reviewed literature says it recurs, and specifically advises against it',
      ],
      whatFailedInitially: [
        'ALLHAT: 9,054 patients on lisinopril against 15,255 on chlorthalidone, with the diuretic better on three secondary endpoints and no worse on any',
        'ATLAS could not demonstrate a mortality benefit from a roughly tenfold dose increase',
        'Transdermal nitrate, tested in the same factorial design as lisinopril in GISSI-3, showed no independent effect on either endpoint',
      ],
      realWorldOutcome: [
        'Among the most-dispensed prescription drugs in the United States, and on the WHO Model List of Essential Medicines',
        'US$0.018 per 10 mg tablet at United States pharmacy acquisition cost, effective 19 August 2026',
        'ALLHAT changed guidelines toward thiazide-type diuretics as first-step therapy, a recommendation that has been argued about ever since without a larger trial being run to settle it',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, and an oral solution for children and for people who cannot swallow tablets',
      description:
        'Once daily. Absorption is by the intestinal peptide transporter rather than by passive diffusion, so bioavailability is around a quarter of the dose and varies between people; food does not meaningfully change it. The drug is cleared unchanged by the kidney, so renal impairment raises exposure.',
      safetyProfile:
        'The US label carries a boxed warning that drugs acting on the renin-angiotensin system can cause injury and death to the developing fetus and must be discontinued when pregnancy is detected. Dry cough affects 5% to 20%. Angioedema affects 0.1% to 0.2% and is an airway emergency. Hyperkalaemia and a rise in serum creatinine occur, particularly with renal artery stenosis, volume depletion, potassium supplements or potassium-sparing diuretics. First-dose hypotension occurs in volume-depleted patients.',
    },
    commonQuestions: [
      {
        q: 'Why do I have this dry cough that will not go away?',
        a: 'Because the enzyme this drug blocks has a second job. Angiotensin-converting enzyme is the same molecule as kininase II, and kininase II is what destroys bradykinin. Block the enzyme and bradykinin accumulates, along with substance P, in airway tissue where they irritate the sensory nerve endings that trigger cough. The reviewed incidence is 5% to 20%, higher in women. The important practical point is that it recurs if you are switched to a different drug in the same class, because every drug in the class blocks the same enzyme. Moving to an angiotensin receptor blocker, which acts one step further down, avoids it.',
      },
      {
        q: 'Is a water tablet really better than this?',
        a: 'In the largest randomised comparison ever run, on three endpoints, yes. ALLHAT put 15,255 people on chlorthalidone and 9,054 on lisinopril and followed them for a mean of 4.9 years. Heart attacks and coronary deaths came out identical. But the lisinopril group had more strokes (6.3% against 5.6% at six years), more heart failure (8.7% against 7.7%) and more combined cardiovascular disease (33.3% against 30.9%), all statistically significant. Blood pressure control was also 2 mm Hg worse on lisinopril, and whether that explains the whole difference is the argument that has run ever since. What is not in dispute is which arm had fewer events.',
        auditNote:
          'This is the single most-cited result on this page and the one most often left off drug information sheets for lisinopril.',
      },
      {
        q: 'Does it protect my kidneys?',
        a: 'It reduces pressure inside the filtering units of the kidney by relaxing the vessel leaving the glomerulus, which is a real and measurable haemodynamic effect and is the basis for using this class in proteinuric kidney disease. What this page will not claim is a size for that benefit in lisinopril specifically, because the large kidney-outcome trials in this area were run with other molecules — losartan in RENAAL, for one — and their results belong on those pages. Note the immediate consequence of the same mechanism: serum creatinine typically rises slightly when the drug is started, and that expected rise is not kidney damage.',
      },
      {
        q: 'My potassium came back high. Is that this drug?',
        a: 'Very possibly. Blocking angiotensin II production reduces aldosterone, and aldosterone is the hormone that tells the kidney to excrete potassium. Less aldosterone means potassium is retained. The risk is higher with impaired kidney function, with potassium supplements, with salt substitutes that are potassium chloride, and with potassium-sparing diuretics such as spironolactone. This is monitored with a blood test rather than by symptoms, because a dangerous potassium level often produces none until it affects the heart rhythm.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no verifiable per-dose synthesis cost for lisinopril could be cited, and the alternative would be to make one up. The acquisition price is shown instead: about 1.8 cents for a 10 mg tablet in the United States CMS NADAC file effective 19 August 2026. That number is a price at which pharmacies acquire the product, not what it costs to make, and this page does not convert one into the other.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'GISSI-3: effects of lisinopril and transdermal glyceryl trinitrate singly and together on 6-week mortality and ventricular function after acute myocardial infarction. Lancet 1994;343:1115-1122',
        identifier: '7910229',
        kind: 'pmid',
      },
      {
        label:
          'ALLHAT Officers and Coordinators. Major outcomes in high-risk hypertensive patients randomized to angiotensin-converting enzyme inhibitor or calcium channel blocker vs diuretic (ALLHAT). JAMA 2002;288:2981-2997',
        identifier: '10.1001/jama.288.23.2981',
        kind: 'doi',
      },
      {
        label:
          'ALLHAT: Antihypertensive and Lipid-Lowering Treatment to Prevent Heart Attack Trial, ClinicalTrials.gov registration',
        identifier: 'NCT00000542',
        kind: 'nct',
      },
      {
        label:
          'Packer M et al. Comparative effects of low and high doses of the angiotensin-converting enzyme inhibitor, lisinopril, on morbidity and mortality in chronic heart failure (ATLAS). Circulation 1999;100:2312-2318',
        identifier: '10.1161/01.CIR.100.23.2312',
        kind: 'doi',
      },
      {
        label:
          'Israili ZH, Hall WD. Cough and angioneurotic edema associated with angiotensin-converting enzyme inhibitor therapy. Ann Intern Med 1992;117:234-242',
        identifier: '10.7326/0003-4819-117-3-234',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: ZESTRIL (lisinopril), NDA 019777, original approval 19 May 1988',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019777',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5362119 — lisinopril structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5362119',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Amlodipine — a trial that missed its primary endpoint and is remembered as positive, and a
  //    subgroup that promised a 46% mortality reduction and delivered nothing.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'amlodipine',
    name: 'Amlodipine',
    tradeName: 'Norvasc',
    sponsor: 'Pfizer (originator); off-patent since 2007 and made by many manufacturers',
    targetGene: 'CACNA1C',
    targetProtein:
      'Alpha-1C pore-forming subunit of the L-type voltage-gated calcium channel (Cav1.2)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1992,
    indication:
      'Hypertension in adults and children aged 6 and older; chronic stable angina; vasospastic (Prinzmetal) angina; and angiographically documented coronary artery disease to reduce hospitalisation for angina and coronary revascularisation',
    patientFriendlyIndication: 'High blood pressure, and chest pain from narrowed heart arteries',
    anatomicalSite: 'Arterial smooth muscle cell membrane (systemic resistance arterioles)',
    conditionContext: {
      conditionExplainer:
        'The muscle wrapped around small arteries contracts when calcium enters it through voltage-gated channels in its membrane. The more of those channels are open, the tighter the artery and the higher the pressure needed to push blood through. Cardiac muscle uses the same family of channels, which is why the choice of which one a drug prefers determines whether it lowers pressure or weakens the heart.',
      whyItMatters:
        'The calcium channel blockers split into two groups. The ones that act on the heart as much as on vessels were shown decades ago to increase deaths in heart failure. Amlodipine was designed to be far more selective for vascular tissue, and PRAISE was run specifically to test whether that selectivity made it safe in heart failure. Whether it did is the interesting part of this page.',
      whoTakesThis:
        'Among the most-dispensed drugs in the world for hypertension, alone or in fixed combinations. Also used for chronic stable angina and for coronary spasm. It is on the WHO Model List of Essential Medicines.',
      clinicalGoals:
        'Lower blood pressure and reduce anginal episodes. In ASCOT-BPLA an amlodipine-based regimen produced fewer strokes and fewer new diabetes diagnoses than an atenolol-based one; in ALLHAT it produced more heart failure than a diuretic.',
    },
    oneSentenceVerdict:
      'A long-acting vascular-selective calcium channel blocker whose flagship trial, ASCOT-BPLA, did not reach statistical significance on the primary endpoint it was designed around (429 versus 474 events, p=0.1052) while reaching it convincingly on stroke, all-cause mortality and new-onset diabetes — and whose most striking subgroup result, a 46% mortality reduction in non-ischaemic cardiomyopathy, evaporated completely in the trial run to confirm it.',
    laymanHowItWorks:
      'The muscle around your small arteries needs calcium flowing in through tiny gates to stay contracted. Amlodipine dissolves into the fatty part of the cell membrane, works its way sideways into those gates and blocks them. The muscle relaxes, the arteries widen, and pressure falls. It binds and releases very slowly, which is why it lasts a full day and why the pressure does not swing.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 85,
    substitutes: {
      summary:
        'Generic amlodipine besylate is among the lowest-cost tablets dispensed anywhere. Its realistic alternatives are a thiazide-type diuretic, which beat it on heart failure in ALLHAT, and an angiotensin receptor blocker, which does not cause ankle swelling. There is no supplement with a comparable event trial, and grapefruit is a genuine interaction rather than a folk warning.',
      conventionalRx: [
        {
          name: 'Chlorthalidone',
          class: 'Thiazide-type diuretic',
          howItCompares:
            'In ALLHAT, 9,048 participants on amlodipine matched 15,255 on chlorthalidone for the primary coronary endpoint (RR 0.98, 95% CI 0.90 to 1.07) and for all-cause mortality, but had a 38% higher 6-year rate of heart failure (10.2% against 7.7%; RR 1.38, 1.25 to 1.52).',
          typicalCost:
            'Both are among the cheapest entries in the CMS NADAC file; generic amlodipine besylate and generic chlorthalidone are each a few cents a tablet',
          prosAndCons:
            'Pros for the diuretic: less heart failure, cheapest available. Cons: hypokalaemia, gout, new-onset diabetes. Pros for amlodipine: no metabolic penalty, no potassium effect, works well across ethnic groups.',
        },
        {
          name: 'Losartan (Cozaar)',
          class: 'Angiotensin II receptor blocker',
          howItCompares:
            'Comparable blood pressure reduction without ankle oedema and without the heart failure excess seen in ALLHAT. Its outcome evidence is in LIFE and RENAAL rather than in a head-to-head against amlodipine.',
          typicalCost:
            'US$0.032 per 50 mg generic losartan potassium tablet at pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no oedema, potassium-sparing in the useful direction for some patients. Cons: hyperkalaemia, contraindicated in pregnancy, and creatinine rises on starting.',
        },
        {
          name: 'Atenolol plus a thiazide',
          class: 'Beta blocker with diuretic — the comparator regimen in ASCOT-BPLA',
          howItCompares:
            'Lost to the amlodipine-based regimen on stroke (422 against 327 events; HR 0.77, p=0.0003), on total cardiovascular events (1,602 against 1,362; HR 0.84, p<0.0001), on all-cause mortality (820 against 738; HR 0.89, p=0.025) and on new-onset diabetes (799 against 567; HR 0.70, p<0.0001) in 19,257 patients — but not on the trial\'s designated primary endpoint.',
          typicalCost: 'Both components are low-cost generics',
          prosAndCons:
            'Pros: beta blockade has independent indications after myocardial infarction and in heart failure. Cons: as a first-line hypertension strategy it lost on four separate measured endpoints in ASCOT-BPLA.',
        },
      ],
      naturalFoods: [
        {
          name: 'Beetroot and other dietary nitrate sources',
          activeCompound: 'Inorganic nitrate, reduced to nitrite and then to nitric oxide',
          biologicalMechanism:
            'Nitric oxide relaxes vascular smooth muscle through soluble guanylate cyclase and cyclic GMP, which is a different lever from blocking calcium entry. The two act on the same tissue by unrelated routes.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. The randomised evidence for dietary nitrate uses blood pressure as its endpoint over weeks, not cardiovascular events over years.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Swollen ankles are a known drug effect, not fluid overload',
          action:
            'Report new ankle or lower leg swelling. It is dose-related and does not mean the heart is failing.',
          patientImpact:
            'Both PRAISE trials recorded higher frequencies of peripheral oedema on amlodipine than on placebo. The mechanism is preferential dilation of the arteriole feeding the capillary bed while the venule draining it stays constricted, which raises capillary pressure and pushes fluid into tissue.',
          clinicalPrecaution:
            'Because it is not volume overload, a diuretic treats it poorly. Swelling accompanied by breathlessness lying flat is a different problem and needs assessment.',
        },
        {
          name: 'Grapefruit is a real interaction here',
          action: 'Ask before making grapefruit or Seville orange a daily habit on this drug.',
          patientImpact:
            'Amlodipine is cleared by CYP3A4, and furanocoumarins in grapefruit irreversibly inactivate intestinal CYP3A4, raising exposure to the drug.',
          clinicalPrecaution:
            'This is a pharmacokinetic fact about the enzyme, not a claim about how much any individual will be affected, which depends on the fruit, the quantity and the person.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCOC(=O)C1=C(NC(=C(C1C2=CC=CC=C2Cl)C(=O)OC)C)COCCN',
      chemicalFormula: 'C20H25ClN2O5',
      molecularWeight: '408.9 g/mol (free base); dispensed as amlodipine besylate',
      targetReceptorAffinity:
        'Binds the dihydropyridine site on the alpha-1C subunit of the L-type calcium channel, reached from within the lipid bilayer rather than from the aqueous pore. Binding and unbinding are unusually slow for the class, which is what gives a 30-to-50-hour effective half-life and a smooth 24-hour effect from a single daily dose. Marketed amlodipine is the racemate; the (S)-enantiomer carries essentially all of the channel-blocking activity.',
      structureSource: {
        label:
          'PubChem CID 2162 (amlodipine) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2162',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'aml-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the azido-ether ketoester and the chlorobenzaldehyde',
          description:
            'Assay 2-chlorobenzaldehyde for the 4-chloro and unsubstituted isomers, and the 4-(2-azidoethoxy)acetoacetate ester for azide content and residual solvent, before either enters the ring-forming step. The ortho-chloro position is what forces the aryl ring perpendicular to the dihydropyridine and is therefore load-bearing for potency; the wrong isomer produces a compound that looks right on a mass spectrum and does not block the channel.',
          reagentsAndBuffer:
            '2-chlorobenzaldehyde reference standard, ethyl 4-(2-azidoethoxy)acetoacetate, gas chromatography with flame ionisation detection for isomeric purity, infrared confirmation of the azide stretch near 2100 wavenumbers, Karl Fischer titration',
        },
        {
          id: 'aml-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Hantzsch cyclisation to the 1,4-dihydropyridine',
          description:
            'Condense the aldehyde with the azido-ether ketoester and close the ring against methyl 3-aminocrotonate. The Hantzsch reaction builds the whole dihydropyridine core in one pot and installs the C4 stereocentre without control, which is why the drug is sold as a racemate rather than as the active (S)-enantiomer.',
          dependsOnStepId: 'aml-w1',
          reagentsAndBuffer:
            'Methyl 3-aminocrotonate, ethanol or isopropanol at reflux under nitrogen, catalytic acetic acid, with the intermediate Knoevenagel adduct monitored by thin-layer chromatography',
        },
        {
          id: 'aml-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Azide reduction to the primary amine and besylate salt formation',
          description:
            'Reduce the azide to the aminoethoxymethyl side chain, then crystallise the benzenesulfonate salt. The besylate exists because the free base is poorly crystalline and hygroscopic; the salt is what gives a tablet with a usable shelf life. The dihydropyridine core is light-sensitive and oxidises to the aromatic pyridine, which is the specified degradant the release assay looks for.',
          dependsOnStepId: 'aml-w2',
          reagentsAndBuffer:
            'Palladium on carbon under hydrogen (or triphenylphosphine with water as the Staudinger alternative), benzenesulfonic acid in methanol/acetone for salt formation, amber glassware and nitrogen headspace, reversed-phase HPLC against the amlodipine pyridine oxidation impurity',
        },
        {
          id: 'aml-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Membrane partitioning into Cav1.2-expressing cells',
          description:
            'Load HEK293 cells stably expressing the CACNA1C alpha-1C subunit with its beta and alpha-2-delta partners and allow the compound to equilibrate into the bilayer. This step is separated out because the dihydropyridine binding site faces the lipid, not the pore: the drug reaches its target by dissolving in the membrane and diffusing laterally, which is why lipophilicity predicts onset and why washout is so slow.',
          dependsOnStepId: 'aml-w3',
          reagentsAndBuffer:
            'HEK293 cells stably co-expressing CACNA1C, CACNB2 and CACNA2D1, extracellular solution with 10 mM barium as charge carrier, tetraethylammonium chloride to suppress potassium currents, 0.1% bovine serum albumin carrier control',
        },
        {
          id: 'aml-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Whole-cell patch clamp and isolated artery tension readout',
          description:
            'Measure inhibition of barium current through the expressed channel at holding potentials that mimic resting and depolarised vascular smooth muscle, and in parallel measure relaxation of pre-contracted isolated artery rings. Both are needed because the whole selling point of the dihydropyridines is voltage-dependence: they bind the inactivated state far more tightly, so they act on chronically depolarised arterial muscle far more than on cardiac muscle, and only a paired assay shows that.',
          dependsOnStepId: 'aml-w4',
          reagentsAndBuffer:
            'Borosilicate patch pipettes with caesium methanesulfonate internal solution, EGTA and Mg-ATP, isolated rat mesenteric artery rings mounted in a wire myograph, Krebs-Henseleit buffer gassed with 95% oxygen and 5% carbon dioxide, phenylephrine for pre-contraction, nifedipine as reference blocker',
        },
      ],
    },
    keyAudits: [
      {
        id: 'aml-a1',
        category: 'failed',
        title: 'ASCOT-BPLA missed the primary endpoint it was designed to test',
        laymanSummary:
          'The trial everyone cites as showing amlodipine beat the older regimen did not, on the measure it was built around. Heart attacks and coronary deaths came out 429 against 474, a difference that could have been chance.',
        technicalDetails:
          'ASCOT-BPLA randomised 19,257 hypertensive patients aged 40 to 79 with at least three other cardiovascular risk factors to an amlodipine-based regimen adding perindopril as required (n=9,639) or an atenolol-based regimen adding bendroflumethiazide as required (n=9,618). The trial was stopped prematurely after a median 5.5 years, accumulating 106,153 patient-years. The prespecified primary endpoint, non-fatal myocardial infarction including silent infarction plus fatal coronary heart disease, occurred in 429 on the amlodipine-based regimen against 474 on the atenolol-based regimen: unadjusted hazard ratio 0.90 (95% CI 0.79 to 1.02), p=0.1052. The paper states the direction "though not significant" in its first sentence of findings. Early stopping reduces the power to detect the primary effect, which is an explanation, not a result.',
        evidenceSource: 'Dahlöf B et al., ASCOT-BPLA, Lancet 2005;366:895-906',
        doi: '10.1016/S0140-6736(05)67185-1',
        measuredMetric: 'Non-fatal myocardial infarction and fatal coronary heart disease',
        inferredClaim:
          'That ASCOT-BPLA established amlodipine-based therapy as superior for coronary events — its coronary primary endpoint did not reach significance',
        auditFlag: 'caution',
      },
      {
        id: 'aml-a2',
        category: 'measured',
        title: 'The same trial did reach significance on stroke, death and new diabetes',
        laymanSummary:
          'On four other outcomes, the amlodipine-based regimen clearly won: a quarter fewer strokes, fewer total cardiovascular events, fewer deaths from any cause, and 30% fewer new diabetes diagnoses.',
        technicalDetails:
          'Against the atenolol-based regimen, the amlodipine-based regimen produced fewer fatal and non-fatal strokes (327 against 422; HR 0.77, 95% CI 0.66 to 0.89, p=0.0003), fewer total cardiovascular events and procedures (1,362 against 1,602; HR 0.84, 0.78 to 0.90, p<0.0001), lower all-cause mortality (738 against 820; HR 0.89, 0.81 to 0.99, p=0.025) and a lower incidence of new-onset diabetes (567 against 799; HR 0.70, 0.63 to 0.78, p<0.0001). These are secondary endpoints in a trial that missed its primary one, which is exactly why they should be read as a strong and internally consistent set of measured differences rather than as confirmation of the primary hypothesis.',
        evidenceSource: 'Dahlöf B et al., ASCOT-BPLA, Lancet 2005;366:895-906',
        doi: '10.1016/S0140-6736(05)67185-1',
        measuredMetric:
          'Fatal and non-fatal stroke, total cardiovascular events, all-cause mortality and new-onset diabetes over a median 5.5 years',
        auditFlag: 'verified',
      },
      {
        id: 'aml-a3',
        category: 'conclusion_shift',
        title: 'PRAISE promised a 46% mortality reduction; PRAISE-2 delivered a hazard ratio of 1.09',
        laymanSummary:
          'In a heart failure trial, a subgroup of patients whose disease was not caused by blocked arteries appeared to have their risk of death nearly halved. A second trial was run in exactly that subgroup. It found nothing at all.',
        technicalDetails:
          'PRAISE randomised 1,153 patients with severe heart failure and ejection fraction under 30% to amlodipine (n=571) or placebo (n=582) for 6 to 33 months. The primary combined endpoint of death or hospitalisation for major cardiovascular events was reached in 42% on placebo and 39% on amlodipine, a 9% reduction whose interval ran from 24% reduction to 10% increase, p=0.31. Death occurred in 38% against 33%, a 16% reduction, p=0.07. In the prespecified non-ischaemic subgroup, amlodipine reduced the combined endpoint by 31% (p=0.04) and death by 46% (p<0.001). PRAISE-2 then randomised 1,654 patients with severe non-ischaemic cardiomyopathy: 278 deaths on amlodipine against 262 on placebo, hazard ratio 1.09 (95% CI 0.92 to 1.29), p=0.33. Pooling both trials in non-ischaemic patients gave a hazard ratio of 0.97 (0.83 to 1.13), p=0.66. The authors close by naming the lesson: great caution is needed when striking benefits appear in subgroups or in trials not designed to test them.',
        evidenceSource:
          'Packer M et al., PRAISE, N Engl J Med 1996;335:1107-1114; Packer M et al., PRAISE-2, JACC Heart Fail 2013;1:308-314',
        doi: '10.1016/j.jchf.2013.04.004',
        measuredMetric:
          'All-cause mortality in severe non-ischaemic cardiomyopathy, confirmatory trial versus originating subgroup',
        auditFlag: 'verified',
      },
      {
        id: 'aml-a4',
        category: 'failed',
        title: 'ALLHAT: 38% more heart failure than on a thiazide-type diuretic',
        laymanSummary:
          'In the largest hypertension trial ever run, amlodipine matched the diuretic on heart attacks and on death, but produced substantially more heart failure over six years.',
        technicalDetails:
          'ALLHAT randomised 9,048 participants to amlodipine 2.5-10 mg against 15,255 to chlorthalidone 12.5-25 mg, mean follow-up 4.9 years. The primary endpoint of fatal coronary heart disease plus non-fatal myocardial infarction did not differ: 6-year rates 11.3% against 11.5%, relative risk 0.98 (95% CI 0.90 to 1.07). All-cause mortality did not differ. Secondary outcomes were similar except for heart failure, where the 6-year rate was 10.2% on amlodipine against 7.7% on chlorthalidone: relative risk 1.38 (1.25 to 1.52). Five-year systolic blood pressure was 0.8 mm Hg higher on amlodipine (p=0.03), a difference far too small to account for the heart failure gap.',
        evidenceSource:
          'ALLHAT Officers and Coordinators, JAMA 2002;288:2981-2997 (NCT00000542)',
        doi: '10.1001/jama.288.23.2981',
        measuredMetric: 'Six-year rate of heart failure, amlodipine versus chlorthalidone',
        auditFlag: 'verified',
      },
      {
        id: 'aml-a5',
        category: 'measured',
        title: 'CAMELOT: fewer events in coronary disease at a blood pressure already called normal',
        laymanSummary:
          'Two thousand people with narrowed coronary arteries and blood pressure in the normal range were given amlodipine, an ACE inhibitor or placebo for two years. Amlodipine reduced cardiovascular events. The ACE inhibitor did not, significantly.',
        technicalDetails:
          'CAMELOT randomised 1,991 patients with angiographically documented coronary artery disease and diastolic pressure below 100 mm Hg to amlodipine 10 mg, enalapril 20 mg or placebo for 24 months. Baseline pressure averaged 129/78 mm Hg. Pressure rose 0.7/0.6 mm Hg on placebo and fell 4.8/2.5 on amlodipine and 4.9/2.4 on enalapril (p<0.001 for both against placebo). Cardiovascular events occurred in 151 placebo patients (23.1%), 110 amlodipine patients (16.6%; HR 0.69, 95% CI 0.54 to 0.88, p=0.003) and 136 enalapril patients (20.2%; HR 0.85, 0.67 to 1.07, p=0.16). The direct enalapril versus amlodipine comparison was not significant (HR 0.81, 0.63 to 1.04, p=0.10).',
        evidenceSource: 'Nissen SE et al., CAMELOT, JAMA 2004;292:2217-2225',
        doi: '10.1001/jama.292.18.2217',
        measuredMetric:
          'Incidence of a composite of cardiovascular events over 24 months, amlodipine versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'aml-a6',
        category: 'inferred',
        title: 'The "slows atherosclerosis" claim comes from a substudy that was not significant',
        laymanSummary:
          'CAMELOT included an ultrasound look inside the coronary arteries. Amlodipine appeared to slow plaque growth. The comparison against placebo did not reach statistical significance, and only one subgroup did.',
        technicalDetails:
          'The intravascular ultrasound substudy of CAMELOT measured change in percent atheroma volume between baseline and study completion. The amlodipine versus placebo comparison showed a trend, p=0.12. Significance was reached only in the subgroup whose systolic pressure was above the study mean, p=0.02. Within-group changes showed progression on placebo (p<0.001), a trend toward progression on enalapril (p=0.08) and no progression on amlodipine (p=0.31); an absence of within-group significance is not a between-group difference. The correlation between blood pressure reduction and atheroma progression in the amlodipine group was r=0.19, p=0.07. The paper describes this as evidence of slowing; the number attached to the headline comparison is 0.12.',
        evidenceSource: 'Nissen SE et al., CAMELOT, JAMA 2004;292:2217-2225',
        doi: '10.1001/jama.292.18.2217',
        inferredClaim:
          'That amlodipine slows the progression of coronary atherosclerosis — a substudy trend of p=0.12, with significance only in an above-mean-pressure subgroup',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed slowly and completely, and eliminated over days',
        laymanDesc:
          'The tablet is absorbed over hours and cleared over days. It takes about a week of daily doses for the effect to reach its full size, and it fades just as slowly if a dose is missed.',
        molecularDetail:
          'Oral bioavailability is 64 to 90%, unaffected by food, with peak plasma concentration at 6 to 12 hours. Elimination half-life is 30 to 50 hours and steady state is reached after 7 to 8 days. Clearance is hepatic, largely by CYP3A4, to inactive pyridine metabolites.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It dissolves into the cell membrane rather than entering the cell',
        laymanDesc:
          'The molecule is greasy and settles inside the fatty double layer that forms the cell surface. From there it moves sideways to reach its target, instead of floating up to it through water.',
        molecularDetail:
          'Amlodipine partitions strongly into the phospholipid bilayer and, being partly ionised at physiological pH, anchors near the membrane surface. Access to the dihydropyridine site is lateral, from within the lipid phase, which is why the on- and off-rates are slow and why the pharmacodynamic half-life exceeds the plasma half-life.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It locks the calcium gate preferentially where the gate is already tired',
        laymanDesc:
          'The gates it blocks have three states: closed, open, and a spent state after opening. The drug grips the spent state hardest, and artery muscle spends far more time in that state than heart muscle does.',
        molecularDetail:
          'The dihydropyridine site on the alpha-1C subunit is state-dependent, with much higher affinity for the inactivated channel. Vascular smooth muscle sits at a more depolarised resting potential than cardiac myocytes, so a larger fraction of its L-type channels is inactivated at rest. That single biophysical fact is the basis for vascular selectivity and for the absence of the negative inotropy that condemned the earlier calcium blockers in heart failure.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Less calcium enters, so the contraction machinery stands down',
        laymanDesc:
          'Without calcium coming in, the enzyme that keeps the muscle fibres pulling is not switched on, and the artery wall relaxes.',
        molecularDetail:
          'Reduced calcium influx lowers cytosolic calcium, so less binds calmodulin, so myosin light chain kinase activity falls and myosin light chain phosphorylation declines. Actin-myosin cross-bridge cycling slows and the vessel dilates. Because the drug acts on arterioles far more than on venules, capillary hydrostatic pressure rises — which is the mechanism of the ankle oedema, and the reason a diuretic treats that oedema badly.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Resistance falls, pressure falls, and in ASCOT there were fewer strokes',
        laymanDesc:
          'Widened arteries mean the heart pushes against less resistance. Over years, in the trials that counted them, that produced fewer strokes and fewer deaths than the older regimen it was compared with.',
        molecularDetail:
          'Reduced systemic vascular resistance lowers arterial pressure without reflex tachycardia at steady state, because the onset is too slow to trigger a baroreflex surge. In ASCOT-BPLA the amlodipine-based regimen produced 327 strokes against 422 (HR 0.77, p=0.0003) and 738 deaths against 820 (HR 0.89, p=0.025) across 19,257 patients.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ASCOT-BPLA',
        phase: 'Randomised open, blinded-endpoint trial, stopped early at median 5.5 years',
        sampleSize: 19257,
        primaryEndpoint:
          'Non-fatal myocardial infarction including silent infarction, plus fatal coronary heart disease',
        endpointMet: false,
        statisticalPValue: 'HR 0.90 (95% CI 0.79-1.02), P = 0.1052 — not statistically significant',
        unreportedAdverseSignals:
          'Stroke, total cardiovascular events, all-cause mortality and new-onset diabetes all favoured the amlodipine-based regimen with p-values from 0.025 to below 0.0001. The trial is remembered for those and not for the endpoint it was designed around.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'PRAISE',
        phase: 'Randomised double-blind placebo-controlled trial, 6 to 33 months',
        sampleSize: 1153,
        primaryEndpoint:
          'Death from any cause plus hospitalisation for major cardiovascular events in severe heart failure',
        endpointMet: false,
        statisticalPValue: '9% reduction (95% CI 24% reduction to 10% increase), P = 0.31',
        unreportedAdverseSignals:
          'The 46% mortality reduction in the non-ischaemic subgroup (p<0.001) was a subgroup of a trial that missed its own primary endpoint.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'PRAISE-2',
        phase: 'Randomised double-blind placebo-controlled confirmatory trial',
        sampleSize: 1654,
        primaryEndpoint:
          'All-cause mortality in severe heart failure due to non-ischaemic cardiomyopathy',
        endpointMet: false,
        statisticalPValue: 'HR 1.09 (95% CI 0.92-1.29), P = 0.33',
        unreportedAdverseSignals:
          'Both PRAISE trials recorded higher frequencies of peripheral oedema and pulmonary oedema on amlodipine.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'ALLHAT amlodipine arm (NCT00000542)',
        phase: 'Randomised double-blind active-controlled trial, mean 4.9 years',
        sampleSize: 24303,
        primaryEndpoint:
          'Combined fatal coronary heart disease or non-fatal myocardial infarction, amlodipine versus chlorthalidone',
        endpointMet: false,
        statisticalPValue: 'RR 0.98 (95% CI 0.90-1.07) — no difference',
        unreportedAdverseSignals:
          'Six-year heart failure rate 10.2% against 7.7% on chlorthalidone, RR 1.38 (1.25-1.52).',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'CAMELOT',
        phase: 'Randomised double-blind placebo-controlled trial, 24 months',
        sampleSize: 1991,
        primaryEndpoint:
          'Incidence of a composite of cardiovascular events, amlodipine versus placebo, in coronary disease with normal blood pressure',
        endpointMet: true,
        statisticalPValue: 'HR 0.69 (95% CI 0.54-0.88), P = 0.003',
        unreportedAdverseSignals:
          'The intravascular ultrasound substudy comparison against placebo was p=0.12 and is widely quoted as though it were positive.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '327 strokes against 422, 738 deaths against 820, and 567 new diabetes diagnoses against 799, in 19,257 patients over a median 5.5 years',
        'Cardiovascular events in 16.6% on amlodipine against 23.1% on placebo over 24 months in coronary disease with normal blood pressure',
        'A 38% higher six-year rate of heart failure than chlorthalidone in ALLHAT (10.2% against 7.7%)',
        '278 deaths against 262 in 1,654 patients with non-ischaemic cardiomyopathy — the confirmatory trial of the famous subgroup',
      ],
      unsupportedInferences: [
        'That ASCOT-BPLA showed amlodipine-based therapy prevents coronary events — the coronary primary endpoint gave p=0.1052',
        'That amlodipine slows coronary atherosclerosis — the CAMELOT ultrasound comparison against placebo was p=0.12',
        'That amlodipine prolongs survival in non-ischaemic dilated cardiomyopathy — the hypothesis PRAISE raised and PRAISE-2 refuted',
        'That the ASCOT-BPLA advantage cannot be explained by blood pressure — the paper itself flags this as an open question addressed in a companion analysis',
      ],
      whatFailedInitially: [
        'ASCOT-BPLA did not reach significance on its designated primary endpoint and was stopped early',
        'PRAISE missed its own primary endpoint (p=0.31) before producing the subgroup that PRAISE-2 then failed to confirm',
        'ALLHAT found 38% more heart failure on amlodipine than on a diuretic costing about the same',
      ],
      realWorldOutcome: [
        'One of the most-dispensed medicines in the world, on the WHO Model List of Essential Medicines, and available as a low-cost generic since 2007',
        'Peripheral oedema is the commonest reason people stop it, and it is a consequence of the mechanism rather than of fluid overload',
        'The PRAISE to PRAISE-2 sequence is taught as a standing example of why a striking subgroup result requires a confirmatory trial',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, and oral suspensions for children; also sold in many fixed-dose combinations',
      description:
        'Once daily, with or without food. Absorption is slow and the elimination half-life is 30 to 50 hours, so the effect builds over about a week and a missed dose does not produce a rebound. That slow onset is also why it does not cause the reflex tachycardia and flushing of the short-acting dihydropyridines.',
      safetyProfile:
        'Dose-dependent peripheral oedema is the characteristic effect and was more frequent than placebo in both PRAISE trials. Flushing, headache and palpitations occur early and usually settle. It does not depress cardiac contractility at usual exposures, which is the design intent behind its vascular selectivity. Clearance is by CYP3A4, so strong inhibitors including grapefruit furanocoumarins raise exposure.',
    },
    commonQuestions: [
      {
        q: 'My ankles are swollen. Does that mean my heart is failing?',
        a: 'Almost certainly not, and the mechanism explains why. Amlodipine dilates the small artery feeding a capillary bed much more than it dilates the vein draining it. Pressure inside the capillary therefore rises, and fluid is pushed out into the surrounding tissue by simple hydrostatics. This is not fluid retention, which is why a diuretic often fails to shift it while lowering the dose or adding a drug that dilates the venous side usually does. Both PRAISE trials recorded higher rates of peripheral oedema on amlodipine than on placebo, so it is an expected effect of the drug rather than a surprise. Swelling that comes with breathlessness when lying flat is a different problem and does need assessment.',
      },
      {
        q: 'Is the trial that made this drug famous actually positive?',
        a: 'Partly, and the part that is positive is not the part it was designed around. ASCOT-BPLA set out to test whether an amlodipine-based regimen prevented more heart attacks and coronary deaths than an atenolol-based one. It found 429 against 474 events, hazard ratio 0.90, p=0.1052 — a difference consistent with chance. On four other measures the amlodipine-based regimen won convincingly: a quarter fewer strokes, fewer total cardiovascular events, fewer deaths from any cause and 30% fewer new diabetes diagnoses. Those are real, large and internally consistent. They are also secondary endpoints in a trial stopped early, and calling the trial "positive" without saying which endpoint you mean loses the distinction.',
        auditNote:
          'This page states the primary endpoint result first on purpose. Most summaries of ASCOT-BPLA lead with the stroke number.',
      },
      {
        q: 'What happened with the heart failure subgroup?',
        a: 'It is one of the cleanest cautionary tales in cardiology. PRAISE tested amlodipine in 1,153 people with severe heart failure and missed its primary endpoint (p=0.31). Inside that trial, patients whose heart failure was not caused by coronary disease appeared to have a 46% lower risk of death, with a p-value below 0.001. That is a striking number, and a trial of 1,654 patients was funded to confirm it. PRAISE-2 found 278 deaths on amlodipine against 262 on placebo, hazard ratio 1.09, p=0.33. Pooling both trials gave a hazard ratio of 0.97. The investigators wrote the conclusion themselves: great caution is needed when striking benefits are seen in subgroups.',
        auditNote:
          'The confirmatory trial was published seventeen years after the subgroup that prompted it. The subgroup result is still occasionally quoted without it.',
      },
      {
        q: 'Should I be on a water tablet instead?',
        a: 'On heart failure, ALLHAT says the diuretic did better: a six-year rate of 10.2% on amlodipine against 7.7% on chlorthalidone, a relative risk of 1.38. On heart attacks and on death from any cause the two were indistinguishable. Against the older beta blocker plus thiazide regimen in ASCOT-BPLA, the amlodipine-based regimen came out ahead on stroke, total events, death and new diabetes. The two trials used different comparators, so they are not in conflict; together they say amlodipine is a reasonable first choice unless heart failure risk is the dominant concern.',
      },
      {
        q: 'Does grapefruit really matter?',
        a: 'Yes, and it is a fact about an enzyme rather than a general warning about fruit. Amlodipine is cleared by CYP3A4, much of it in the wall of the small intestine, and the furanocoumarins in grapefruit and Seville oranges destroy that intestinal enzyme irreversibly, so more of each dose survives into the bloodstream until new enzyme is made over a day or two. How much difference that makes to any individual depends on the fruit, the quantity and the person, and this page will not put a number on it. What is not uncertain is the direction: exposure goes up, not down.',
      },
      {
        q: 'Why does this page show no manufacturing cost?',
        a: 'Because no per-dose synthesis cost for amlodipine could be verified and cited. Generic amlodipine besylate is among the cheapest tablets in the CMS National Average Drug Acquisition Cost file, which is a price paid by pharmacies, not a cost of manufacture. The synthesis is a single-pot Hantzsch condensation followed by an azide reduction and a salt formation — a short route from commodity starting materials, which is consistent with a low price. Consistency is not a measurement, so no number is given.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Dahlöf B et al. Prevention of cardiovascular events with an antihypertensive regimen of amlodipine adding perindopril as required versus atenolol adding bendroflumethiazide as required (ASCOT-BPLA). Lancet 2005;366:895-906',
        identifier: '10.1016/S0140-6736(05)67185-1',
        kind: 'doi',
      },
      {
        label:
          'Packer M et al. Effect of amlodipine on morbidity and mortality in severe chronic heart failure (PRAISE). N Engl J Med 1996;335:1107-1114',
        identifier: '10.1056/NEJM199610103351504',
        kind: 'doi',
      },
      {
        label:
          'Packer M et al. Effect of amlodipine on the survival of patients with severe chronic heart failure due to a nonischemic cardiomyopathy (PRAISE-2). JACC Heart Fail 2013;1:308-314',
        identifier: '10.1016/j.jchf.2013.04.004',
        kind: 'doi',
      },
      {
        label:
          'ALLHAT Officers and Coordinators. Major outcomes in high-risk hypertensive patients randomized to angiotensin-converting enzyme inhibitor or calcium channel blocker vs diuretic (ALLHAT). JAMA 2002;288:2981-2997',
        identifier: '10.1001/jama.288.23.2981',
        kind: 'doi',
      },
      {
        label:
          'Nissen SE et al. Effect of antihypertensive agents on cardiovascular events in patients with coronary disease and normal blood pressure (CAMELOT). JAMA 2004;292:2217-2225',
        identifier: '10.1001/jama.292.18.2217',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA: NORVASC (amlodipine besylate), NDA 019787, original approval 31 July 1992',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019787',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2162 — amlodipine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2162',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Melatonin — the sleep-onset effect is real and it is seven minutes, the dose people take is ten
  // times physiological, and in 25 US gummy brands the melatonin ranged from 74% to 347% of label.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'melatonin',
    name: 'Melatonin',
    tradeName:
      'Prolonged-release melatonin is a prescription medicine in the EU as Circadin (EMEA/H/C/000695); in the US the same molecule is an unregulated dietary supplement',
    sponsor:
      'No single sponsor for the supplement — N-acetyl-5-methoxytryptamine, synthesised industrially. The EU prolonged-release product is held by RAD Neurim Pharmaceuticals.',
    targetGene: 'MTNR1A',
    targetProtein:
      'MT1 (MTNR1A) and MT2 (MTNR1B), Gi-coupled seven-transmembrane receptors. MT1 in the suprachiasmatic nucleus acutely suppresses neuronal firing, and MT2 mediates the phase-shifting of the circadian clock. The effect is chronobiotic before it is hypnotic: melatonin tells the clock what time it is rather than sedating the brain.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold over the counter in the US for insomnia, jet lag and children\'s sleep. In the European Union the same molecule requires a prescription, and prolonged-release melatonin is authorised only as short-term monotherapy for primary insomnia in patients aged 55 or over. The regulatory gap between the two jurisdictions is the largest for any substance in this file.',
    patientFriendlyIndication: 'Taken to fall asleep faster, and to reset the clock after flying',
    conditionContext: {
      conditionExplainer:
        'Melatonin is not a sedative. It is the hormone the pineal gland releases when it gets dark, and its job is to tell every clock-bearing cell in the body that night has begun. Taking it is closer to moving the hands of a clock than to switching off a light, which is why timing matters more than dose and why it works far better for a circadian problem than for ordinary insomnia.',
      whyItMatters:
        'It is the most-consumed sleep aid in the United States and the substance children are most often poisoned by. US sales rose from 285 million dollars in 2016 to 821 million in 2020, and over the same decade paediatric ingestions reported to poison centres rose 530 percent. Meanwhile the product is unregulated for content, and analyses keep finding that what is in the bottle is not what is on the label.',
      whoTakesThis:
        'Adults with insomnia, shift workers, travellers crossing time zones, people with delayed sleep-wake phase disorder, blind people with non-24-hour rhythms, and — increasingly and without good evidence for long-term use — children, often given it by parents.',
      clinicalGoals:
        'Trials measured sleep onset latency in minutes, total sleep time in minutes, sleep efficiency as a percentage of time in bed, subjective sleep quality scores, and circadian phase by dim-light melatonin onset.',
    },
    oneSentenceVerdict:
      'Melatonin genuinely shortens sleep onset, by about seven minutes across 19 trials and 1,683 people, and genuinely shifts circadian phase, which is a different and better-supported claim — but the typical retail dose is roughly ten times the physiological one, and in 25 US gummy brands the measured content ran from 74% to 347% of what the label said, with one containing no melatonin at all.',
    laymanHowItWorks:
      'When the light fades, a gland in your brain releases melatonin into the blood, and receptors on the master clock read that as the signal that night has started. Swallowing melatonin adds that signal at whatever hour you take it, which nudges the clock — forward if taken in the evening, backward if taken in the morning. It also has a mild direct drowsiness effect at the right moment in the evening. What it does not do is sedate you the way a sleeping pill does, which is why people who expect a knockout are disappointed and people who use it to move a body clock across time zones tend not to be.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    anatomicalSite:
      'Suprachiasmatic nucleus of the hypothalamus, where MT1 and MT2 receptors are densest; also retina, pars tuberalis and peripheral vasculature',
    substitutes: {
      summary:
        'For chronic insomnia, cognitive behavioural therapy for insomnia is the first-line treatment in every major guideline and outperforms melatonin substantially. For a circadian problem — jet lag, delayed sleep phase, shift work — correctly timed melatonin and correctly timed bright light are the two interventions with a mechanism that matches the problem.',
      conventionalRx: [
        {
          name: 'Prolonged-release melatonin 2 mg (Circadin), EU prescription medicine',
          class: 'Melatonin receptor agonist, authorised medicine',
          howItCompares:
            'The regulated version of the same molecule, assessed by the EMA and authorised in 2007 for short-term monotherapy in primary insomnia in patients aged 55 or over. Across three trials in 681 patients, 32% on Circadin (86 of 265) reported significant symptom improvement at three weeks against 19% on placebo (51 of 272).',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: known content, known release profile, a defined indication and an age restriction. Cons: a 13-percentage-point responder difference is modest, and the authorisation is deliberately narrow in a way the US supplement market simply is not.',
        },
        {
          name: 'Cognitive behavioural therapy for insomnia (CBT-I)',
          class: 'Behavioural therapy, first-line in guidelines',
          howItCompares:
            'Directly addresses the conditioned arousal and time-in-bed behaviours that maintain chronic insomnia. Its effect sizes on sleep onset latency and sleep efficiency are substantially larger than melatonin\'s and, unlike melatonin, persist after treatment stops.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: durable, no pharmacology, no content-variability problem. Cons: requires weeks of effort and access to a clinician or a structured programme, which is why a gummy wins on convenience every time.',
        },
      ],
      naturalFoods: [
        {
          name: 'Darkness in the two hours before bed',
          activeCompound: 'Endogenous melatonin, released when retinal light input falls',
          biologicalMechanism:
            'Melanopsin-containing retinal ganglion cells signal light directly to the suprachiasmatic nucleus, which suppresses pineal melatonin release. Short-wavelength light in the evening is the most potent suppressor. Removing that light restores the body\'s own signal at the correct time and correct amplitude, which no tablet can reproduce.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. The mechanistic point is that this is the same signal the supplement imitates, delivered by the system that knows the right dose.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Morning bright light, for the opposite direction',
          activeCompound: 'High-illuminance broad-spectrum light on the retina',
          biologicalMechanism:
            'Light in the early biological morning advances circadian phase, which is the intervention that pairs with evening melatonin for delayed sleep-wake phase disorder. The phase-response curves for light and for melatonin run in roughly opposite directions, which is why the two are used together and why timing errors make either one useless or counterproductive.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no timing or intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Treat melatonin as a clock signal, not a sedative',
          action:
            'Ask whether the sleep problem is a timing problem or an inability to sleep at a normal hour. Melatonin has a real mechanism for the first and a weak one for the second.',
          patientImpact:
            'For jet lag, a Cochrane review of ten randomised trials found melatonin remarkably effective. For primary insomnia, the pooled sleep onset benefit is about seven minutes.',
          clinicalPrecaution:
            'Melatonin was the substance most frequently ingested by children reported to US poison control centres in 2020. Over 2012 to 2021 there were 260,435 paediatric ingestions, a 530 percent increase, with five children requiring mechanical ventilation and two deaths.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(=O)NCCC1=CNC2=C1C=C(C=C2)OC',
      chemicalFormula: 'C13H16N2O2',
      molecularWeight: '232.28 g/mol',
      targetReceptorAffinity:
        'Sub-nanomolar affinity at MT1 and MT2, both Gi-coupled. The relevant comparison is physiological: night-time plasma melatonin peaks in the tens to low hundreds of picomolar, while a 3 to 10 mg oral dose produces plasma concentrations one to two orders of magnitude above that, sustained for hours.',
      structureSource: {
        label: 'PubChem CID 896 — Melatonin, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/896',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mel-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Content assay and screen for serotonin in the finished retail product',
          description:
            'This step is not routine here — it is the finding. Melatonin supplements are not tested for content before sale in the United States, and independent analyses find both gross content deviation and the presence of serotonin, a related indoleamine that has no business in a sleep gummy. Any study using a commercial product must assay the actual lot it used.',
          reagentsAndBuffer:
            'Ultra-performance liquid chromatography with electrochemical detection for melatonin quantification; UPLC-MS confirmation for serotonin identity; melatonin and 5-hydroxytryptamine reference standards; separate assays on multiple lots of the same product to capture lot-to-lot variance',
        },
        {
          id: 'mel-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the deuterated internal standard for plasma pharmacokinetics',
          description:
            'Endogenous melatonin is present in the same samples at picomolar concentration, so exogenous melatonin cannot be quantified against it without a mass-distinguishable standard. This is what makes it possible to state that a retail dose produces plasma levels far above the physiological night-time peak rather than merely restoring it.',
          dependsOnStepId: 'mel-w1',
          reagentsAndBuffer:
            'Melatonin-d4 internal standard; deuterium-labelled 6-sulphatoxymelatonin for the urinary metabolite; isotopic purity confirmation by LC-MS/MS; amber vials, because melatonin is light-sensitive in solution',
        },
        {
          id: 'mel-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Dim-light sample collection and extraction for melatonin onset timing',
          description:
            'Dim-light melatonin onset is the reference standard for circadian phase, and it is destroyed by the room lights. Samples must be collected under fewer than 10 lux with the subject awake, seated and unexposed to screens, then extracted immediately. A phase measurement taken under normal indoor lighting is not a phase measurement.',
          dependsOnStepId: 'mel-w2',
          reagentsAndBuffer:
            'Saliva collection under sub-10-lux red-filtered lighting at 30- to 60-minute intervals; solid-phase extraction on C18 cartridges; methanol elution and nitrogen evaporation; salivary melatonin radioimmunoassay or LC-MS/MS cross-validated against plasma',
        },
        {
          id: 'mel-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'MT1 and MT2 receptor engagement and desensitisation at supraphysiological exposure',
          description:
            'Test the receptors at both physiological and retail-dose concentrations in the same system. MT2 internalises and desensitises on sustained agonist exposure, which is the mechanistic reason a large dose held high all night is not simply a bigger version of the natural signal — it may be a worse one.',
          dependsOnStepId: 'mel-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human MT1 or MT2; cAMP accumulation assay with forskolin stimulation; luzindole as a non-selective antagonist and 4-P-PDOT as an MT2-selective antagonist; beta-arrestin recruitment assay; melatonin at 100 picomolar and at 10 nanomolar to bracket physiological and retail exposure',
        },
        {
          id: 'mel-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Polysomnography with a phase-shift readout, reported separately',
          description:
            'Report the hypnotic effect and the chronobiotic effect as two different results, because they are two different claims with different evidence. Polysomnographic sleep onset latency answers "did it make sleep come faster tonight"; the shift in dim-light melatonin onset across days answers "did it move the clock". Studies that report only a questionnaire answer neither.',
          dependsOnStepId: 'mel-w4',
          reagentsAndBuffer:
            'Full polysomnography with EEG, EOG and chin EMG scored to AASM criteria; wrist actigraphy for the free-living arm; serial salivary dim-light melatonin onset before and after intervention; placebo matched for taste and appearance',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mel-a1',
        category: 'measured',
        title: 'Seven minutes faster to sleep, eight minutes longer asleep',
        laymanSummary:
          'Across nineteen randomised trials in 1,683 people, melatonin cut the time to fall asleep by about seven minutes and added about eight minutes of total sleep.',
        technicalDetails:
          'Ferracioli-Oda and colleagues pooled 19 randomised placebo-controlled trials in 1,683 subjects with primary sleep disorders. Melatonin reduced sleep onset latency by a weighted mean difference of 7.06 minutes (95% CI 4.37 to 9.75, Z = 5.15, P < 0.001) and increased total sleep time by 8.25 minutes (95% CI 1.74 to 14.75, Z = 2.48, P = 0.013). Overall sleep quality improved with a standardised mean difference of 0.22 (95% CI 0.12 to 0.32, P < 0.001). Meta-regression found longer trials and higher doses produced larger effects on latency and total sleep time, but no dose or duration effect on sleep quality. The authors stated plainly that the absolute benefit is smaller than that of other pharmacological treatments for insomnia, while noting the effect did not appear to dissipate with continued use — which is a genuine advantage over hypnotics that lose effect. The earlier Brzezinski meta-analysis of 17 studies in 284 subjects found the same picture at a smaller scale: sleep onset latency down 4.0 minutes (95% CI 2.5 to 5.4), sleep efficiency up 2.2% (95% CI 0.2 to 4.2), total sleep duration up 12.8 minutes (95% CI 2.9 to 22.8).',
        evidenceSource:
          'Ferracioli-Oda E, Qawasmi A, Bloch MH. PLoS One 2013;8:e63773; Brzezinski A et al. Sleep Med Rev 2005;9:41-50',
        doi: '10.1371/journal.pone.0063773',
        measuredMetric:
          'Weighted mean difference in sleep onset latency and total sleep time, in minutes, versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'mel-a2',
        category: 'failed',
        title: 'Label accuracy: 74% to 347% of the stated dose, and one gummy with none at all',
        laymanSummary:
          'Researchers bought 25 melatonin gummy products in the US and measured what was actually in them. Only three matched the label within ten percent. One contained no melatonin.',
        technicalDetails:
          'Cohen and colleagues analysed 25 melatonin gummy brands sold in the United States. The actual quantity of melatonin ranged from 74% to 347% of the labelled quantity. Only three of the 25 (12%) contained melatonin within plus or minus 10% of the declared amount. One product contained no detectable melatonin at all but did contain 31.3 mg of CBD. Among the five products containing CBD, CBD content was accurate — 104% to 118% of label — which makes the melatonin failure harder to attribute to general analytical difficulty. Erland and Saxena had found the same problem earlier in 31 supplements: melatonin content ranged from -83% to +478% of label, lot-to-lot variation within a single product reached 465%, more than 71% of supplements missed their label by more than 10%, and serotonin was identified in eight of them at 1 to 75 micrograms. This is the defining fact about the retail category, and it means a person taking "5 mg" may be taking anywhere from under 1 mg to over 17 mg.',
        evidenceSource:
          'Cohen PA et al. JAMA 2023;329:1401-1402; Erland LAE, Saxena PK. J Clin Sleep Med 2017;13:275-281',
        doi: '10.1001/jama.2023.2296',
        measuredMetric:
          'Measured melatonin content as a percentage of the labelled quantity, across commercial products',
        auditFlag: 'caution',
      },
      {
        id: 'mel-a3',
        category: 'conclusion_shift',
        title: 'The physiological dose worked; the pharmacological dose worked and overshot',
        laymanSummary:
          'A dose-ranging study found that a small dose matching the body\'s own night-time level restored sleep efficiency. A ten-times-larger dose also worked, but dropped body temperature and left melatonin circulating into the next day.',
        technicalDetails:
          'Zhdanova and colleagues ran a double-blind placebo-controlled crossover in 30 subjects over 50 — 15 with actigraphically confirmed reduced sleep efficiency and 15 normal sleepers — giving placebo and 0.1, 0.3 and 3.0 mg melatonin 30 minutes before bed for a week each, with polysomnography on the last three nights of each period. The physiological dose of 0.3 mg restored sleep efficiency (P < 0.0001), acting principally in the middle third of the night, and raised plasma melatonin to the normal nocturnal range (P < 0.0008). The pharmacological 3.0 mg dose also improved sleep, but induced hypothermia and caused plasma melatonin to remain elevated into the daylight hours. The 0.1 mg dose also improved sleep. Crucially, control subjects with equally low melatonin levels showed no sleep effect at any dose. Retail products in the US are commonly sold at 3, 5 and 10 mg, which is ten to thirty times the dose that this study showed sufficed, and the surplus does not simply vanish: it keeps signalling night into the following morning, which is the opposite of what a circadian intervention should do.',
        evidenceSource: 'Zhdanova IV et al. J Clin Endocrinol Metab 2001;86:4727-4730',
        doi: '10.1210/jcem.86.10.7901',
        measuredMetric:
          'Polysomnographic sleep efficiency and plasma melatonin profile across 0.1, 0.3 and 3.0 mg doses',
        inferredClaim:
          'That more melatonin is more effective, when the dose-ranging data show the physiological amount was sufficient and the larger amount extended the signal into the next day',
        auditFlag: 'verified',
      },
      {
        id: 'mel-a4',
        category: 'measured',
        title: 'Jet lag is the strong indication, and it is a different mechanism',
        laymanSummary:
          'For jet lag — a genuine mismatch between the body clock and local time — a Cochrane review of ten randomised trials found melatonin remarkably effective. This is the use with the best evidence and the least marketing.',
        technicalDetails:
          'Herxheimer and Petrie identified ten randomised trials in airline passengers, staff and military personnel, all comparing melatonin with placebo and one additionally with the hypnotic zolpidem. Jet lag is the one condition where the pharmacology and the pathology match exactly: the problem is that the internal clock is set to the departure time zone, and melatonin is the signal that moves it. The evidence is coherent for eastward travel across several time zones, where the required phase advance is the harder direction. Adverse event reports were searched systematically outside the randomised trials as well, in Side Effects of Drugs, Reactions Weekly, MEDLINE, and the WHO Uppsala Monitoring Centre and FDA adverse reaction databases. The contrast with the insomnia literature is the point of this audit: the same molecule has a strong indication with a matching mechanism and a weak indication without one, and the weak one is what the aisle sells.',
        evidenceSource: 'Herxheimer A, Petrie KJ. Cochrane Database Syst Rev 2002;2:CD001520',
        doi: '10.1002/14651858.CD001520',
        measuredMetric:
          'Subjective jet lag ratings and related components after eastward and westward transmeridian flight',
        auditFlag: 'verified',
      },
      {
        id: 'mel-a5',
        category: 'failed',
        title: 'Paediatric ingestions rose 530 percent, with two deaths',
        laymanSummary:
          'As melatonin gummies spread, so did children eating them. Over ten years US poison centres logged more than a quarter of a million paediatric melatonin ingestions, five children needed ventilators and two died.',
        technicalDetails:
          'Lelak and colleagues analysed the American Association of Poison Control Centers National Poison Data System for isolated melatonin ingestions in people aged 19 or under from 2012 to 2021. There were 260,435 paediatric melatonin ingestions over the decade and the annual number rose 530%. Melatonin accounted for 4.9% of all paediatric ingestions reported in 2021 against 0.6% in 2012, and in 2020 it became the substance most frequently ingested by children reported to poison centres. Hospitalisations and serious outcomes increased, driven mainly by unintentional ingestion in children aged five or under. Five children required mechanical ventilation and two died. US sales rose from 285 million dollars in 2016 to 821 million in 2020 over the same period. A sweet, brightly coloured, unregulated product with no child-resistant requirement and no reliable content standard is the direct explanation, and the content variability audit above compounds it: a child eating a handful of gummies may be receiving several times more melatonin per gummy than the label implies.',
        evidenceSource: 'Lelak K et al. MMWR Morb Mortal Wkly Rep 2022;71:725-729',
        doi: '10.15585/mmwr.mm7122a1',
        measuredMetric:
          'Annual paediatric melatonin ingestions reported to US poison control centres, and associated outcomes',
        auditFlag: 'verified',
      },
      {
        id: 'mel-a6',
        category: 'inferred',
        title: 'The regulated version exists, and its authorised claim is much narrower',
        laymanSummary:
          'In Europe melatonin is a prescription drug. Regulators approved it only for short-term use in people over 55, and the trial result behind that approval was 32 percent responding against 19 percent on placebo.',
        technicalDetails:
          'The EMA authorised Circadin, prolonged-release melatonin 2 mg, on 29 June 2007 under EMEA/H/C/000695, as monotherapy for the short-term treatment of primary insomnia characterised by poor quality of sleep in patients aged 55 or over, available only on prescription and for up to 13 weeks. Across three main studies in 681 patients, 32% of Circadin patients (86 of 265) reported significant improvement in sleep quality and next-day functioning at three weeks against 19% on placebo (51 of 272). Everything in that sentence is a restriction the US supplement carries none of: a specific formulation, a specific dose, an age floor, a duration cap and a prescription requirement. The inference to audit is the reverse of the usual one — American consumers routinely treat the availability of melatonin without a prescription as evidence that it is mild and broadly indicated, when the jurisdiction that assessed it concluded the opposite about scope while agreeing it is safe enough to prescribe.',
        evidenceSource:
          'European Medicines Agency, Circadin EPAR summary, marketing authorisation issued 29 June 2007',
        measuredMetric:
          'Proportion reporting significant improvement in sleep quality and next-day functioning at three weeks',
        inferredClaim:
          'That over-the-counter availability in the US reflects a wider evidence-supported indication than the one European regulators actually granted',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Darkness starts the signal, and light stops it',
        laymanDesc:
          'Special cells in the retina report ambient light straight to the body\'s master clock. When light falls, the clock releases the brake on the pineal gland and melatonin rises.',
        molecularDetail:
          'Melanopsin-expressing intrinsically photosensitive retinal ganglion cells project through the retinohypothalamic tract to the suprachiasmatic nucleus, which controls pineal melatonin synthesis through a multisynaptic pathway ending in sympathetic input to the pineal. Evening short-wavelength light suppresses release. Dim-light melatonin onset, measured under sub-10-lux conditions, is the reference standard for circadian phase precisely because it is the least contaminated marker available.',
        iconName: 'Moon',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Swallowed melatonin overshoots the natural peak by a wide margin',
        laymanDesc:
          'Night-time melatonin in the blood is a very small quantity. A typical retail tablet produces far more than that, and keeps producing it for hours.',
        molecularDetail:
          'Physiological nocturnal plasma melatonin peaks in the tens to low hundreds of picomolar. Zhdanova showed that 0.3 mg was sufficient to restore that range and restore sleep efficiency in older insomniacs, while 3.0 mg induced hypothermia and left plasma melatonin elevated into daylight hours. Oral melatonin also undergoes extensive first-pass CYP1A2 metabolism, which is highly variable between individuals and is inhibited by fluvoxamine and by caffeine.',
        iconName: 'TrendingUp',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds two receptors on the clock itself',
        laymanDesc:
          'Melatonin docks onto two specific receptors concentrated in the small cluster of cells that runs the body\'s daily timing. One quietens those cells; the other moves the clock.',
        molecularDetail:
          'MT1 (MTNR1A) and MT2 (MTNR1B) are Gi-coupled receptors densely expressed in the suprachiasmatic nucleus. MT1 activation acutely suppresses SCN neuronal firing; MT2 mediates phase shifts. Both inhibit adenylyl cyclase and lower cAMP. MT2 internalises and desensitises under sustained agonist exposure, which is why a large dose held high for many hours is not a scaled-up version of the physiological pulse.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The clock moves in a direction that depends entirely on when you took it',
        laymanDesc:
          'Evening melatonin pulls the clock earlier. Morning melatonin pushes it later. Take it at the wrong hour and it makes the problem worse rather than better.',
        molecularDetail:
          'The melatonin phase-response curve is roughly opposite in shape to the light phase-response curve. Administration in the hours before habitual dim-light melatonin onset advances phase; administration in the late night or early morning delays it. This is why the jet lag evidence is strong and direction-specific, and why an insomnia trial that ignores timing is measuring a hypnotic effect that melatonin barely has instead of a chronobiotic effect it clearly does.',
        iconName: 'Clock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The measurable result is minutes, not hours',
        laymanDesc:
          'Pooled across nineteen trials, melatonin got people to sleep about seven minutes sooner and kept them asleep about eight minutes longer. That is a real effect and a small one.',
        molecularDetail:
          'Weighted mean difference in sleep onset latency 7.06 minutes (95% CI 4.37 to 9.75) and total sleep time 8.25 minutes (95% CI 1.74 to 14.75), with a sleep quality standardised mean difference of 0.22. The authors of that meta-analysis noted that the absolute benefit is smaller than other pharmacological insomnia treatments but does not dissipate with continued use — an unusual and genuinely favourable property.',
        iconName: 'Timer',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Ferracioli-Oda 2013 meta-analysis of melatonin in primary sleep disorders',
        phase: 'Meta-analysis of 19 randomised placebo-controlled trials',
        sampleSize: 1683,
        primaryEndpoint: 'Sleep onset latency, total sleep time and sleep quality versus placebo',
        endpointMet: true,
        statisticalPValue:
          'Sleep latency WMD -7.06 min (95% CI 4.37 to 9.75), P < 0.001; total sleep time +8.25 min (95% CI 1.74 to 14.75), P = 0.013; sleep quality SMD 0.22, P < 0.001',
        unreportedAdverseSignals:
          'The authors state the absolute benefit is smaller than that of other pharmacological insomnia treatments. Effects were dose- and duration-dependent for latency but not for sleep quality, which argues the quality finding is not a pharmacological dose-response.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Brzezinski 2005 meta-analysis of exogenous melatonin on sleep',
        phase: 'Meta-analysis of 17 studies',
        sampleSize: 284,
        primaryEndpoint: 'Sleep onset latency, total sleep duration and sleep efficiency',
        endpointMet: true,
        statisticalPValue:
          'Sleep onset latency -4.0 min (95% CI 2.5 to 5.4); sleep efficiency +2.2% (95% CI 0.2 to 4.2); total sleep duration +12.8 min (95% CI 2.9 to 22.8)',
        unreportedAdverseSignals:
          'The included studies were highly heterogeneous in inclusion criteria, insomnia measures, dose and route, which the authors state explicitly as the reason the field had been unable to agree.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Zhdanova 2001 — dose-ranging melatonin in age-related insomnia',
        phase: 'Double-blind placebo-controlled randomised crossover with polysomnography',
        sampleSize: 30,
        primaryEndpoint: 'Polysomnographic sleep efficiency across 0.1, 0.3 and 3.0 mg doses',
        endpointMet: true,
        statisticalPValue:
          'Sleep efficiency restored at 0.3 mg, P < 0.0001; plasma melatonin normalised at 0.3 mg, P < 0.0008',
        unreportedAdverseSignals:
          'The 3.0 mg dose induced hypothermia and left plasma melatonin elevated into daylight hours. Normal-sleeping controls with equally low melatonin levels showed no benefit at any dose, which argues the effect is repletion in a specific phenotype rather than a general hypnotic action.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Circadin EU registration programme (EMEA/H/C/000695)',
        phase: 'Three randomised placebo-controlled trials supporting marketing authorisation',
        sampleSize: 681,
        primaryEndpoint:
          'Proportion reporting significant improvement in sleep quality and next-day functioning at three weeks',
        endpointMet: true,
        statisticalPValue: '32% on Circadin (86/265) versus 19% on placebo (51/272)',
        unreportedAdverseSignals:
          'The authorised indication is deliberately narrow: monotherapy, short-term, primary insomnia, age 55 or over, prescription only, up to 13 weeks. None of those restrictions exist for the identical molecule sold over the counter in the United States.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cohen 2023 — quantity of melatonin and CBD in US melatonin gummies',
        phase: 'Analytical survey of marketed products',
        sampleSize: 25,
        primaryEndpoint: 'Measured melatonin content as a percentage of labelled quantity',
        endpointMet: false,
        statisticalPValue:
          'Melatonin content 74% to 347% of label; only 3 of 25 within plus or minus 10%; one product contained no melatonin and 31.3 mg CBD',
        unreportedAdverseSignals:
          'CBD content in the five CBD-containing products was accurate at 104% to 118% of label, which removes analytical difficulty as an explanation for the melatonin failures.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Sleep onset latency fell by 7.06 minutes and total sleep time rose by 8.25 minutes across 19 trials in 1,683 people',
        'A 0.3 mg physiological dose restored polysomnographic sleep efficiency in older insomniacs; 3.0 mg induced hypothermia and prolonged the signal into daylight',
        'Melatonin content in 25 US gummy products ranged from 74% to 347% of label, with only 3 within 10%',
        'Paediatric melatonin ingestions reported to US poison centres rose 530% over 2012 to 2021, totalling 260,435, with two deaths',
      ],
      unsupportedInferences: [
        'That melatonin is a sedative — it is a circadian signal, and the pooled hypnotic effect is minutes',
        'That a larger dose is a better dose, when 0.3 mg sufficed and 3.0 mg overshot into the next morning',
        'That over-the-counter availability in the US implies a broad evidence-supported indication, when the EU authorisation is restricted to short-term use in people 55 and over',
        'That a labelled dose is the dose received, which is false in 88% of the gummy products tested',
      ],
      whatFailedInitially: [
        'Insomnia trials that ignored administration timing, which measured a hypnotic effect melatonin barely has instead of the chronobiotic effect it clearly does',
        'The US supplement content control regime, which permitted a 4.7-fold spread around label across a single product category',
      ],
      realWorldOutcome: [
        'The strongest evidence is for jet lag and circadian phase disorders, where mechanism and pathology actually match',
        'The effect on ordinary insomnia is real, replicated, and small — and unusually, it does not fade with continued use',
        'The largest practical risk is not the pharmacology but the packaging: sweet, unregulated, and now the substance children are most often poisoned by',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, capsule, gummy, liquid or spray; prolonged-release tablet as an EU prescription medicine',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy, safety or content before sale. In the European Union, the United Kingdom, Australia, Canada and Japan the same molecule is a medicine requiring a prescription or pharmacist supply. Immediate-release and prolonged-release products are pharmacokinetically different interventions and their trial evidence is not interchangeable. Gummy formats are the fastest-growing and the worst-characterised: they are the format at the centre of both the content-accuracy failure and the paediatric ingestion epidemic.',
      safetyProfile:
        'Short-term tolerability is good and the EMA lists most adverse effects at frequencies between 1 and 10 per 1,000, including irritability, restlessness, abnormal dreams, headache, dizziness and daytime somnolence. Doses well above physiological leave melatonin circulating into the morning, which produces grogginess and, in principle, works against the circadian correction being sought. Melatonin is metabolised by CYP1A2, so fluvoxamine markedly raises exposure and smoking lowers it. Long-term safety in children, including any effect on pubertal timing, has not been established by adequate trials, which matters given how widely it is now given to them. In 2020 melatonin became the substance most frequently ingested by children reported to US poison control centres.',
    },
    commonQuestions: [
      {
        q: 'Does melatonin actually work?',
        a: 'Yes, and the size of the effect is the part worth knowing. Across nineteen randomised trials in 1,683 people it shortened the time to fall asleep by about seven minutes and added about eight minutes of sleep. The authors of that analysis said outright that the absolute benefit is smaller than other insomnia drugs. They also noted something unusual in its favour: the effect did not fade with continued use, which is not true of most hypnotics.',
      },
      {
        q: 'Am I taking too much?',
        a: 'Probably, if you are taking a typical US retail product. A dose-ranging study with full polysomnography found 0.3 mg restored sleep efficiency in older insomniacs and brought plasma melatonin to the normal night-time range. The 3 mg dose also worked but caused hypothermia and left melatonin circulating into the following day. Products are commonly sold at 3, 5 and 10 mg. Extending a night signal into the morning is the opposite of what a circadian intervention is meant to do.',
        auditNote:
          'And because content accuracy is poor, the actual dose received may be several times the number printed on the bottle.',
      },
      {
        q: 'Is what is in the bottle what is on the label?',
        a: 'Frequently not. In 25 melatonin gummy brands sold in the US, measured melatonin ran from 74% to 347% of the labelled amount and only three products were within ten percent. One contained no melatonin at all, though it did contain 31.3 mg of CBD. An earlier analysis of 31 supplements found a range of -83% to +478%, lot-to-lot variation within one product of up to 465%, and serotonin present in eight of them. In the same 2023 study the CBD content was accurate, so this is a quality-control failure specific to melatonin, not an analytical limitation.',
      },
      {
        q: 'Is it safe to give to children?',
        a: 'That question has not been properly answered, and the exposure data are alarming. US poison centres logged 260,435 paediatric melatonin ingestions between 2012 and 2021, a 530 percent rise; five children required mechanical ventilation and two died. In 2020 melatonin became the substance children most often ingested. Long-term trials in children, including any effect on the timing of puberty, do not exist at adequate scale. The combination of a sweet unregulated format, inaccurate labelling and no child-resistant requirement is the mechanism here, and it is not a pharmacological one.',
      },
      {
        q: 'What is it genuinely good for?',
        a: 'Problems of timing rather than problems of sleep drive. Jet lag is the clearest case — a Cochrane review of ten randomised trials found it effective, and the mechanism matches the pathology exactly, since the complaint is that the internal clock is set to the wrong time zone and melatonin is the signal that moves clocks. Delayed sleep-wake phase disorder and non-24-hour rhythm in blind people are the same category. For someone who simply cannot fall asleep at a normal hour for behavioural reasons, cognitive behavioural therapy for insomnia is the first-line treatment and outperforms it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Zhdanova IV, Wurtman RJ, Regan MM, Taylor JA, Shi JP, Leclair OU. Melatonin treatment for age-related insomnia. J Clin Endocrinol Metab 2001;86:4727-4730',
        identifier: '10.1210/jcem.86.10.7901',
        kind: 'doi',
      },
      {
        label:
          'Herxheimer A, Petrie KJ. Melatonin for the prevention and treatment of jet lag. Cochrane Database Syst Rev 2002;2:CD001520',
        identifier: '10.1002/14651858.CD001520',
        kind: 'doi',
      },
      {
        label:
          'Brzezinski A et al. Effects of exogenous melatonin on sleep: a meta-analysis. Sleep Med Rev 2005;9:41-50',
        identifier: '10.1016/j.smrv.2004.06.004',
        kind: 'doi',
      },
      {
        label:
          'European Medicines Agency. Circadin (prolonged-release melatonin 2 mg), EMEA/H/C/000695, marketing authorisation issued 29 June 2007',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/EPAR/circadin',
        kind: 'regulatory',
      },
      {
        label:
          'Ferracioli-Oda E, Qawasmi A, Bloch MH. Meta-analysis: melatonin for the treatment of primary sleep disorders. PLoS One 2013;8:e63773',
        identifier: '10.1371/journal.pone.0063773',
        kind: 'doi',
      },
      {
        label:
          'Erland LAE, Saxena PK. Melatonin natural health products and supplements: presence of serotonin and significant variability of melatonin content. J Clin Sleep Med 2017;13:275-281',
        identifier: '10.5664/jcsm.6462',
        kind: 'doi',
      },
      {
        label:
          'Lelak K et al. Pediatric melatonin ingestions — United States, 2012-2021. MMWR Morb Mortal Wkly Rep 2022;71:725-729',
        identifier: '10.15585/mmwr.mm7122a1',
        kind: 'doi',
      },
      {
        label:
          'Cohen PA, Avula B, Wang Y, Katragunta K, Khan I. Quantity of melatonin and CBD in melatonin gummies sold in the US. JAMA 2023;329:1401-1402',
        identifier: '10.1001/jama.2023.2296',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 896 — Melatonin',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/896',
        kind: 'url',
      },
    ],
  },
]
