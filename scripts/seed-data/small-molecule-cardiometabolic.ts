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
  // ---------------------------------------------------------------------------------------------
  // 5. Losartan — the first angiotensin receptor blocker: a stroke result that carried an entire
  //    composite, a kidney result that did not touch mortality, and two head-to-head trials it lost.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'losartan',
    name: 'Losartan',
    tradeName: 'Cozaar',
    sponsor: 'DuPont Merck / Merck (originator); off-patent since 2010',
    targetGene: 'AGTR1',
    targetProtein: 'Type 1 angiotensin II receptor (AT1), a G-protein-coupled receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1995,
    indication:
      'Hypertension in adults and children aged 6 and older; reduction of stroke risk in hypertension with left ventricular hypertrophy; and treatment of diabetic nephropathy with elevated serum creatinine and proteinuria in type 2 diabetes',
    patientFriendlyIndication:
      'High blood pressure, thickened heart muscle, and kidney damage from type 2 diabetes',
    anatomicalSite:
      'AT1 receptors on vascular smooth muscle, adrenal zona glomerulosa and renal glomerular arterioles',
    conditionContext: {
      conditionExplainer:
        'Angiotensin II is the hormone that tightens arteries and tells the adrenal gland to hold on to salt. ACE inhibitors stop it being made. Losartan takes the other route and blocks the receptor it acts on, so the hormone can still be produced but has nowhere to land. Because the enzyme is left alone, bradykinin is still destroyed normally, which is why the dry cough of the ACE inhibitors largely does not occur.',
      whyItMatters:
        'When this class arrived, the open question was whether blocking the receptor would be as good as blocking the enzyme, or better. Two head-to-head trials against captopril were run to find out, in heart failure and after myocardial infarction. Neither showed superiority, and both pointed numerically the other way. That result is on this page.',
      whoTakesThis:
        'Widely prescribed for hypertension, particularly in people who could not tolerate an ACE inhibitor because of cough. Also used for diabetic kidney disease in type 2 diabetes and for hypertension with electrocardiographic left ventricular hypertrophy. It is on the WHO Model List of Essential Medicines.',
      clinicalGoals:
        'Lower blood pressure; in LIFE, reduce a composite of cardiovascular death, myocardial infarction and stroke; in RENAAL, delay doubling of serum creatinine and end-stage renal disease.',
    },
    oneSentenceVerdict:
      'The first angiotensin receptor blocker: it beat atenolol on a cardiovascular composite in 9,193 patients with left ventricular hypertrophy, but that composite was carried entirely by stroke while myocardial infarction went the other way, and in two head-to-head trials against captopril — in heart failure and after myocardial infarction — it was numerically worse on mortality both times.',
    laymanHowItWorks:
      'The hormone that tightens your blood vessels has to dock into a receptor on the muscle cell to do anything. Losartan sits in that docking site and blocks it. Your liver then converts most of the drug into a second, much stronger molecule that grips the same site so tightly the hormone effectively cannot displace it. Vessels relax, salt retention falls, and blood pressure comes down.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    substitutes: {
      summary:
        'Generic losartan potassium costs a few cents a tablet. Its natural comparators are an ACE inhibitor, which is equally cheap and has more post-infarction evidence but causes cough, and the newer angiotensin receptor blockers, which are also generic. Losartan is the only member of its class that lowers uric acid, which matters for people with gout and is also the subject of one of the more interesting inference problems on this page.',
      conventionalRx: [
        {
          name: 'Lisinopril or another ACE inhibitor',
          class: 'Angiotensin-converting enzyme inhibitor',
          howItCompares:
            'In OPTIMAAL, 5,477 high-risk patients after myocardial infarction were randomised to losartan or captopril: 499 deaths (18%) on losartan against 447 (16%) on captopril, relative risk 1.13 (95% CI 0.99 to 1.28), p=0.07. The authors concluded ACE inhibitors should remain first choice and that losartan cannot be generally recommended in that population.',
          typicalCost:
            'US$0.018 per 10 mg lisinopril tablet at pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: the larger post-infarction and heart failure evidence base. Cons: dry cough in 5% to 20%, and the same fetal toxicity, hyperkalaemia and creatinine rise.',
        },
        {
          name: 'Amlodipine (Norvasc)',
          class: 'Dihydropyridine calcium channel blocker',
          howItCompares:
            'Comparable blood pressure reduction by an unrelated mechanism, with no potassium effect, no creatinine rise and no pregnancy contraindication of the same kind. It causes ankle oedema, which losartan does not.',
          typicalCost:
            'Among the lowest-cost entries in the CMS NADAC file, a few cents a tablet',
          prosAndCons:
            'Pros: no metabolic or renal monitoring burden. Cons: dose-dependent oedema, and 38% more heart failure than a diuretic in ALLHAT.',
        },
        {
          name: 'Atenolol',
          class: 'Beta-1 selective beta blocker — the comparator in LIFE',
          howItCompares:
            'Achieved essentially the same blood pressure reduction as losartan in LIFE (29.1/16.8 against 30.2/16.6 mm Hg) and had more primary events: 588 against 508, relative risk 0.87, p=0.021. The gap was stroke: 309 against 232, relative risk 0.75, p=0.001.',
          typicalCost: 'A low-cost generic, in the same range as losartan',
          prosAndCons:
            'Pros: cheap, long history. Cons: lost on the composite and on stroke in LIFE, and more new-onset diabetes.',
        },
      ],
      naturalFoods: [
        {
          name: 'Potassium-rich foods, with a caution attached',
          activeCompound: 'Dietary potassium',
          biologicalMechanism:
            'Higher dietary potassium lowers blood pressure through natriuresis and vascular effects. But losartan reduces aldosterone, and aldosterone is what makes the kidney excrete potassium, so the same intake produces a higher serum level on this drug than off it.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. The relevant point for a reader on losartan is direction, not quantity: potassium accumulates more readily on this drug, and salt substitutes are usually potassium chloride.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Know that a creatinine rise on starting is expected',
          action:
            'Blood tests for kidney function and potassium are usually done one to two weeks after starting or increasing this drug.',
          patientImpact:
            'Losartan relaxes the vessel leaving the kidney filter, which lowers the pressure across the filter. Filtration rate falls slightly and creatinine rises slightly as a direct consequence of the intended mechanism. That is the same haemodynamic change that produced a 35% fall in proteinuria and a 28% reduction in end-stage renal disease in RENAAL.',
          clinicalPrecaution:
            'A large or continuing rise is different and is investigated, particularly where renal artery stenosis, dehydration or a non-steroidal anti-inflammatory drug is in the picture.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCCC1=NC(=C(N1CC2=CC=C(C=C2)C3=CC=CC=C3C4=NNN=N4)CO)Cl',
      chemicalFormula: 'C22H23ClN6O',
      molecularWeight: '422.9 g/mol (free acid form); dispensed as losartan potassium',
      targetReceptorAffinity:
        'A competitive, surmountable antagonist at AT1 in its own right. Roughly 14% of an oral dose is oxidised by CYP2C9 to the carboxylic acid metabolite EXP3174, which is 10 to 40 times more potent, is an insurmountable antagonist, and accounts for most of the clinical effect and most of the duration. The tetrazole ring is the carboxylate bioisostere that made the whole class orally usable.',
      structureSource: {
        label:
          'PubChem CID 3961 (losartan) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3961',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'los-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the trityl-protected biphenyltetrazole halide',
          description:
            'Assay the 5-[4-(bromomethyl)biphenyl-2-yl]-1-trityl-1H-tetrazole for isomeric purity and residual bromide before alkylation. The tetrazole must be trityl-protected through the coupling, because an unprotected tetrazole is acidic enough to deprotonate and compete as a nucleophile, producing a tetrazole-alkylated by-product that no downstream step removes cleanly.',
          reagentsAndBuffer:
            '5-[4-(bromomethyl)biphenyl-2-yl]-1-trityl-1H-tetrazole reference standard, 2-butyl-4-chloro-5-hydroxymethylimidazole, HPLC with UV detection at 254 nm, ion chromatography for bromide, Karl Fischer titration',
        },
        {
          id: 'los-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Regioselective N-alkylation of the imidazole',
          description:
            'Deprotonate the imidazole and alkylate it with the protected benzylic bromide. Regiochemistry is the whole problem: the imidazole has two nitrogens and only the less hindered one gives the active compound. Base, solvent and temperature are chosen to bias that ratio, and the wrong regioisomer is a specified impurity rather than a separable irrelevance.',
          dependsOnStepId: 'los-w1',
          reagentsAndBuffer:
            'Potassium tert-butoxide or sodium hydride in dimethylformamide or dimethylacetamide under nitrogen, controlled addition below 25 degrees Celsius, thin-layer chromatography monitoring against both regioisomer standards',
        },
        {
          id: 'los-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Trityl removal and potassium salt crystallisation',
          description:
            'Cleave the trityl group under aqueous acid, filter off the triphenylmethanol by-product, then form and crystallise the potassium salt. The potassium counter-ion is part of the product identity and part of the clinical picture: it is a small potassium load on a drug that also reduces the kidney\'s ability to excrete potassium.',
          dependsOnStepId: 'los-w2',
          reagentsAndBuffer:
            'Hydrochloric acid in aqueous methanol or tetrahydrofuran for detritylation, potassium hydroxide or potassium tert-butoxide for salt formation, isopropanol/cyclohexane recrystallisation, reversed-phase HPLC against the N2-regioisomer and the deschloro impurity',
        },
        {
          id: 'los-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Hepatocyte oxidation to the active metabolite EXP3174',
          description:
            'Incubate with primary human hepatocytes and with recombinant CYP2C9 to confirm formation of the carboxylic acid metabolite, and quantify both parent and metabolite. This step matters because most of the clinical effect is not the administered molecule: EXP3174 is 10 to 40 times more potent and behaves as an insurmountable antagonist, and CYP2C9 loss-of-function alleles change the ratio.',
          dependsOnStepId: 'los-w3',
          reagentsAndBuffer:
            'Cryopreserved primary human hepatocytes, recombinant CYP2C9 in a baculovirus-insect cell microsomal preparation, NADPH regenerating system, sulfaphenazole as a selective CYP2C9 inhibitor control, LC-MS/MS quantification of losartan and EXP3174',
        },
        {
          id: 'los-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'AT1 binding and functional antagonism readout',
          description:
            'Measure displacement of a radiolabelled angiotensin II analogue from AT1-expressing membranes, and separately measure inositol monophosphate accumulation in intact cells across a full angiotensin II concentration range. Running the full curve is the point: losartan shifts it rightward and EXP3174 depresses its maximum, and only the functional assay distinguishes those two behaviours.',
          dependsOnStepId: 'los-w4',
          reagentsAndBuffer:
            'CHO or HEK293 membranes stably expressing human AGTR1, iodine-125-labelled [Sar1,Ile8]-angiotensin II, 50 mM Tris-HCl with 5 mM magnesium chloride and 0.1% bovine serum albumin at pH 7.4, homogeneous time-resolved fluorescence inositol monophosphate accumulation kit, PD123319 as an AT2-selective control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'los-a1',
        category: 'measured',
        title: 'LIFE: 508 primary events against 588 on atenolol, at the same blood pressure',
        laymanSummary:
          'More than nine thousand people with high blood pressure and a thickened heart muscle were randomised to losartan or to atenolol. Both drugs lowered pressure by the same amount. The losartan group had fewer combined heart attacks, strokes and cardiovascular deaths.',
        technicalDetails:
          'LIFE randomised 9,193 participants aged 55 to 80 with essential hypertension (sitting pressure 160-200/95-115 mm Hg) and electrocardiographic left ventricular hypertrophy to once-daily losartan-based or atenolol-based treatment, for at least 4 years and until 1,040 primary events had occurred. Blood pressure fell by 30.2/16.6 mm Hg on losartan and 29.1/16.8 mm Hg on atenolol — effectively identical. The primary composite of cardiovascular death, myocardial infarction and stroke occurred in 508 losartan patients (23.8 per 1,000 patient-years) against 588 atenolol patients (27.9 per 1,000 patient-years): relative risk 0.87 (95% CI 0.77 to 0.98), p=0.021. New-onset diabetes was less frequent with losartan.',
        evidenceSource: 'Dahlöf B et al., LIFE, Lancet 2002;359:995-1003',
        doi: '10.1016/S0140-6736(02)08089-3',
        measuredMetric:
          'Composite of cardiovascular death, myocardial infarction and stroke over at least 4 years',
        auditFlag: 'verified',
      },
      {
        id: 'los-a2',
        category: 'inferred',
        title: 'The LIFE composite was carried by stroke alone, and myocardial infarction went the other way',
        laymanSummary:
          'Break the winning composite into its three parts and only one of them moved. Strokes fell by a quarter. Cardiovascular deaths did not change significantly. Heart attacks were slightly more common on losartan.',
        technicalDetails:
          'Within the LIFE primary composite, fatal or non-fatal stroke occurred in 232 losartan patients against 309 on atenolol: relative risk 0.75 (95% CI 0.63 to 0.89), p=0.001. Cardiovascular death occurred in 204 against 234: 0.89 (0.73 to 1.07), p=0.206, which does not exclude no effect. Fatal and non-fatal myocardial infarction occurred in 198 losartan patients against 188 on atenolol: 1.07 (0.88 to 1.31), p=0.491 — numerically in atenolol\'s favour. The paper\'s own interpretation, that losartan "seems to confer benefits beyond reduction in blood pressure", rests on the composite; the component analysis shows that what was demonstrated is a stroke difference, not a general cardiovascular one.',
        evidenceSource: 'Dahlöf B et al., LIFE, Lancet 2002;359:995-1003',
        doi: '10.1016/S0140-6736(02)08089-3',
        measuredMetric:
          'Component-level relative risks for stroke, myocardial infarction and cardiovascular death within the LIFE composite',
        inferredClaim:
          'That losartan reduces cardiovascular events in general beyond blood pressure lowering — the composite was driven by stroke, with myocardial infarction numerically higher and cardiovascular death not significant',
        auditFlag: 'contested',
      },
      {
        id: 'los-a3',
        category: 'measured',
        title: 'RENAAL: kidney endpoints moved and mortality did not',
        laymanSummary:
          'Fifteen hundred people with type 2 diabetes and kidney damage took losartan or placebo on top of their other blood pressure drugs. Fewer reached kidney failure. The same number died.',
        technicalDetails:
          'RENAAL randomised 1,513 patients with type 2 diabetes and nephropathy to losartan 50 to 100 mg daily or placebo, both added to conventional antihypertensive treatment excluding other renin-angiotensin drugs, for a mean of 3.4 years. The primary composite of doubling of serum creatinine, end-stage renal disease or death occurred in 327 losartan patients against 359 on placebo: a 16% risk reduction, p=0.02. Doubling of serum creatinine fell 25% (p=0.006) and end-stage renal disease fell 28% (p=0.002). There was no effect on the rate of death. The cardiovascular morbidity and mortality composite was similar between groups, though first hospitalisation for heart failure fell 32% (p=0.005). Proteinuria declined by 35% against placebo (p<0.001). The authors state the benefit exceeded that attributable to blood pressure change.',
        evidenceSource: 'Brenner BM et al., RENAAL, N Engl J Med 2001;345:861-869',
        doi: '10.1056/NEJMoa011161',
        measuredMetric:
          'Doubling of serum creatinine, end-stage renal disease and death over a mean 3.4 years',
        auditFlag: 'verified',
      },
      {
        id: 'los-a4',
        category: 'conclusion_shift',
        title: 'ELITE I suggested losartan beat captopril on survival; ELITE II found it did not',
        laymanSummary:
          'A first trial in elderly heart failure patients unexpectedly showed fewer deaths on losartan than on an ACE inhibitor. A larger trial was built to confirm it. Losartan came out numerically worse.',
        technicalDetails:
          'ELITE II randomised 3,152 patients aged 60 or older with NYHA class II-IV heart failure and ejection fraction of 40% or less, stratified for beta-blocker use, to losartan titrated to 50 mg once daily (n=1,578) or captopril titrated to 50 mg three times daily (n=1,574). Median follow-up was 555 days. Average annual all-cause mortality was 11.7% on losartan against 10.4% on captopril: hazard ratio 1.13 (95.7% CI 0.95 to 1.35), p=0.16. Sudden death or resuscitated arrest was 9.0% against 7.3%: 1.25 (0.98 to 1.60), p=0.08. Neither difference reached significance, and both point away from the ELITE I hypothesis. Losartan was better tolerated: 9.7% against 14.7% discontinued for adverse effects (p<0.001), with cough causing discontinuation in 0.3% against 2.7%.',
        evidenceSource: 'Pitt B et al., ELITE II, Lancet 2000;355:1582-1587',
        doi: '10.1016/S0140-6736(00)02213-3',
        measuredMetric: 'All-cause mortality, losartan versus captopril, in elderly heart failure',
        auditFlag: 'verified',
      },
      {
        id: 'los-a5',
        category: 'failed',
        title: 'OPTIMAAL: after a heart attack, more deaths on losartan than on captopril',
        laymanSummary:
          'Nearly five and a half thousand high-risk patients after a heart attack were randomised to losartan or an ACE inhibitor. Eighteen per cent of the losartan group died against sixteen per cent on the ACE inhibitor. The trial concluded ACE inhibitors should stay first choice.',
        technicalDetails:
          'OPTIMAAL recruited 5,477 patients aged 50 or older with confirmed acute myocardial infarction plus heart failure in the acute phase, or a new anterior Q-wave infarction or reinfarction, from 329 centres in seven European countries, randomised to losartan 50 mg once daily or captopril 50 mg three times daily as tolerated. Over a mean 2.7 years there were 946 deaths: 499 (18%) on losartan against 447 (16%) on captopril, relative risk 1.13 (95% CI 0.99 to 1.28), p=0.07. Sudden cardiac death or resuscitated arrest was 239 (9%) against 203 (7%), 1.19 (0.98 to 1.43), p=0.07. Reinfarction and all-cause hospital admission did not differ. Losartan was significantly better tolerated, with 458 (17%) against 624 (23%) discontinuing (p<0.0001). The stated interpretation is that ACE inhibitors should remain first-choice treatment and losartan cannot be generally recommended in this population.',
        evidenceSource: 'Dickstein K et al., OPTIMAAL, Lancet 2002;360:752-760',
        doi: '10.1016/S0140-6736(02)09895-1',
        measuredMetric: 'All-cause mortality over a mean 2.7 years after acute myocardial infarction',
        auditFlag: 'verified',
      },
      {
        id: 'los-a6',
        category: 'inferred',
        title: 'The uric acid explanation for LIFE is a post-hoc mediation analysis',
        laymanSummary:
          'Losartan is the only drug in its class that lowers uric acid. A later analysis suggested that effect explained about 29% of the trial\'s benefit. That analysis was done after the fact, on a variable nobody was randomised to.',
        technicalDetails:
          'A LIFE substudy examined serum uric acid across 4.8 years. Baseline uric acid was associated with cardiovascular events, hazard ratio 1.024 (95% CI 1.017 to 1.032) per 10 micromol/L. The rise in uric acid over the trial was attenuated by losartan relative to atenolol, and the analysis reports this as "appearing to explain 29% of the treatment effect on the primary composite end point", with a stronger association in women than men. The uricosuric effect is real and mechanistically specific — losartan inhibits the renal urate transporter URAT1, which the other angiotensin receptor blockers do not. But attributing a share of a randomised treatment effect to a post-randomisation biomarker requires assumptions that the trial design cannot test, and the figure is an estimate from a regression model rather than a measured contribution.',
        evidenceSource: 'Høieggen A et al., LIFE uric acid substudy, Kidney Int 2004;65:1041-1049',
        doi: '10.1111/j.1523-1755.2004.00484.x',
        inferredClaim:
          'That 29% of the LIFE benefit was caused by losartan lowering uric acid — a mediation estimate on a post-randomisation variable, not a randomised comparison',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, and then mostly turned into something stronger',
        laymanDesc:
          'The tablet is absorbed well, but the liver converts about one part in seven of it into a different molecule that is far more powerful and lasts much longer. Most of what you feel is from the conversion product, not the tablet.',
        molecularDetail:
          'Oral bioavailability is about 33% because of extensive first-pass metabolism. Roughly 14% of an absorbed dose is oxidised, principally by CYP2C9, to the carboxylic acid metabolite EXP3174. Losartan has a plasma half-life around 2 hours; EXP3174 around 6 to 9 hours, and it is 10 to 40 times more potent at the receptor.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches receptors on the outside of vessel and adrenal cells',
        laymanDesc:
          'The target sits on the outer surface of cells in artery walls, in the adrenal gland and in the kidney. Nothing has to get inside a cell for the drug to work.',
        molecularDetail:
          'AT1 is a class A G-protein-coupled receptor with an extracellular-facing orthosteric pocket, expressed on vascular smooth muscle, adrenal zona glomerulosa, renal proximal tubule and glomerular arterioles, and in cardiac tissue. Its AT2 counterpart, which losartan does not block, is largely unopposed as a result — the pharmacological difference between blocking the receptor and blocking the enzyme.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The tetrazole ring anchors it in the hormone\'s docking pocket',
        laymanDesc:
          'A ring of nitrogen atoms in the drug mimics the acidic end of the natural hormone closely enough to occupy the same slot, and once the liver has modified the molecule it holds on hard enough that the hormone cannot push it out.',
        molecularDetail:
          'The tetrazole is a carboxylate bioisostere with similar acidity and a larger, more lipophilic footprint, which is what gave this scaffold oral activity where earlier peptide antagonists had none. Losartan itself is a surmountable competitive antagonist; EXP3174 is insurmountable, depressing the maximal angiotensin II response rather than merely shifting the curve.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Downstream signalling stops, and the enzyme is left alone',
        laymanDesc:
          'With the receptor blocked, the squeeze signal and the salt-retention signal both stop. Because the enzyme itself is untouched, the molecule that causes the ACE inhibitor cough is still cleared normally.',
        molecularDetail:
          'Blocking AT1 removes Gq-mediated phospholipase C activation, so inositol trisphosphate and diacylglycerol fall, cytosolic calcium falls, and vascular smooth muscle relaxes; aldosterone release from the adrenal cortex falls, and efferent glomerular arteriolar tone falls. Because angiotensin-converting enzyme is not inhibited, kininase II activity is preserved and bradykinin is degraded normally, which is why cough caused discontinuation in 0.3% on losartan against 2.7% on captopril in ELITE II.',
        iconName: 'Split',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Pressure falls, and in LIFE there were 77 fewer strokes',
        laymanDesc:
          'Blood pressure comes down over weeks. In the trial that counted events, the difference against the comparator drug showed up in strokes, and in proteinuria and kidney failure in the diabetic kidney trial.',
        molecularDetail:
          'In LIFE, fatal or non-fatal stroke occurred in 232 losartan patients against 309 on atenolol at essentially identical blood pressures (relative risk 0.75, p=0.001). In RENAAL, proteinuria fell 35% against placebo and end-stage renal disease fell 28%, with no effect on death.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'LIFE',
        phase: 'Randomised double-masked active-controlled trial, at least 4 years',
        sampleSize: 9193,
        primaryEndpoint:
          'Composite of cardiovascular death, myocardial infarction and stroke, losartan versus atenolol',
        endpointMet: true,
        statisticalPValue: 'RR 0.87 (95% CI 0.77-0.98), P = 0.021',
        unreportedAdverseSignals:
          'Myocardial infarction was numerically higher on losartan (RR 1.07, p=0.491) and cardiovascular death was not significantly reduced (RR 0.89, p=0.206). The composite was carried by stroke.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'RENAAL',
        phase: 'Randomised double-blind placebo-controlled trial, mean 3.4 years',
        sampleSize: 1513,
        primaryEndpoint:
          'Composite of doubling of serum creatinine, end-stage renal disease or death in type 2 diabetic nephropathy',
        endpointMet: true,
        statisticalPValue: '16% risk reduction, P = 0.02',
        unreportedAdverseSignals:
          'No effect on the rate of death, and no difference in the cardiovascular morbidity and mortality composite. The renal components carried the result.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ELITE II',
        phase: 'Randomised double-blind active-controlled trial, median 555 days',
        sampleSize: 3152,
        primaryEndpoint: 'All-cause mortality, losartan versus captopril, in elderly heart failure',
        endpointMet: false,
        statisticalPValue: 'HR 1.13 (95.7% CI 0.95-1.35), P = 0.16 — numerically favouring captopril',
        unreportedAdverseSignals:
          'Sudden death or resuscitated arrest was also numerically higher on losartan (HR 1.25, p=0.08). Losartan was clearly better tolerated (9.7% against 14.7% discontinuation).',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'OPTIMAAL',
        phase: 'Randomised double-blind active-controlled trial, mean 2.7 years',
        sampleSize: 5477,
        primaryEndpoint: 'All-cause mortality after high-risk acute myocardial infarction',
        endpointMet: false,
        statisticalPValue: 'RR 1.13 (95% CI 0.99-1.28), P = 0.07 — numerically favouring captopril',
        unreportedAdverseSignals:
          'The trial was designed to test superiority or non-inferiority and delivered neither; the authors concluded losartan cannot be generally recommended in this population.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '508 primary composite events against 588 on atenolol in 9,193 patients at essentially identical blood pressure',
        '232 strokes against 309 on atenolol — the single component that carried the LIFE composite',
        'A 28% reduction in end-stage renal disease and a 35% fall in proteinuria in 1,513 patients with type 2 diabetic nephropathy',
        'Discontinuation for cough in 0.3% on losartan against 2.7% on captopril in 3,152 heart failure patients',
      ],
      unsupportedInferences: [
        'That losartan reduces cardiovascular events generally beyond blood pressure lowering — the LIFE composite was a stroke effect, with myocardial infarction numerically higher',
        'That 29% of the LIFE benefit is attributable to losartan lowering uric acid — a post-hoc mediation estimate on a post-randomisation variable',
        'That blocking the receptor is at least as good as blocking the enzyme — ELITE II and OPTIMAAL both pointed the other way and neither reached significance in either direction',
        'That RENAAL showed a survival benefit — it explicitly reported no effect on the rate of death',
      ],
      whatFailedInitially: [
        'ELITE I raised a survival advantage over captopril that ELITE II, built to confirm it, reversed in direction (HR 1.13)',
        'OPTIMAAL found 18% mortality on losartan against 16% on captopril and concluded ACE inhibitors should remain first choice after myocardial infarction',
        'Myocardial infarction in LIFE ran at a relative risk of 1.07 in the losartan arm, inside a composite the drug won',
      ],
      realWorldOutcome: [
        'The first angiotensin receptor blocker approved anywhere, in 1995, and on the WHO Model List of Essential Medicines',
        'US$0.032 per 50 mg generic tablet at United States pharmacy acquisition cost, effective 19 August 2026',
        'The class is now used mainly where an ACE inhibitor was not tolerated, which is precisely the difference the tolerability data in ELITE II and OPTIMAAL measured',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, and fixed combinations with hydrochlorothiazide',
      description:
        'Once or twice daily. Bioavailability is about a third because of first-pass metabolism, and the duration of effect comes from the active metabolite rather than the parent, so the plasma half-life of losartan itself understates how long the drug works.',
      safetyProfile:
        'The US label carries a boxed warning that drugs acting on the renin-angiotensin system can cause injury and death to the developing fetus and must be stopped when pregnancy is detected. Hyperkalaemia and a rise in serum creatinine occur, particularly with renal impairment, potassium supplements, salt substitutes or potassium-sparing diuretics. Symptomatic hypotension occurs in volume-depleted patients. Cough is far less frequent than with an ACE inhibitor; angioedema still occurs, though rarely. Losartan uniquely among the class lowers serum uric acid by inhibiting the renal urate transporter.',
    },
    commonQuestions: [
      {
        q: 'How is this different from an ACE inhibitor?',
        a: 'They interrupt the same pathway one step apart. An ACE inhibitor stops the hormone being made; losartan lets it be made and blocks the receptor it needs. The practical consequence is the cough: the converting enzyme also destroys bradykinin, so inhibiting it lets bradykinin build up in the airway, and losartan leaves that enzyme alone. In ELITE II, cough caused discontinuation in 0.3% on losartan against 2.7% on captopril. The consequence that gets discussed less is that in the two head-to-head trials that counted deaths — ELITE II in heart failure and OPTIMAAL after myocardial infarction — losartan came out numerically worse, at p=0.16 and p=0.07 respectively.',
        auditNote:
          'Neither head-to-head result was statistically significant. Both pointed the same way, which is why the guidelines still lead with ACE inhibitors in those two settings.',
      },
      {
        q: 'Did LIFE prove losartan is better than a beta blocker?',
        a: 'It proved something narrower than the headline. Across 9,193 patients at essentially identical blood pressures, the combined count of cardiovascular deaths, heart attacks and strokes was 508 on losartan against 588 on atenolol, p=0.021. But splitting the composite shows only one component moved: strokes fell from 309 to 232 (p=0.001), cardiovascular deaths went from 234 to 204 without reaching significance (p=0.206), and heart attacks were slightly more common on losartan, 198 against 188. So the trial demonstrated a stroke advantage in people with electrocardiographic left ventricular hypertrophy. Describing it as a general cardiovascular advantage is reading the composite instead of its parts.',
      },
      {
        q: 'Does it protect my kidneys if I have diabetes?',
        a: 'RENAAL measured exactly that in 1,513 people with type 2 diabetes and nephropathy over a mean of 3.4 years. Doubling of serum creatinine fell 25%, end-stage renal disease fell 28%, and proteinuria fell 35% against placebo — all statistically significant, all on top of other blood pressure drugs. Two things the trial explicitly did not show: any effect on the rate of death, and any difference in the combined cardiovascular morbidity and mortality endpoint. So the honest statement is that it delays kidney failure, which is a meaningful outcome in its own right, and that it was not shown to make people live longer.',
      },
      {
        q: 'I was told losartan is good if I have gout. Is that real?',
        a: 'The uric acid effect is real and is specific to this molecule rather than to the class: losartan inhibits URAT1, the transporter that reabsorbs urate in the kidney, so more is excreted. What is much less certain is the claim that follows it — that lowering uric acid explains a share of the drug\'s cardiovascular benefit. A LIFE substudy estimated that the uric acid difference "appeared to explain" 29% of the treatment effect. That is a statistical model applied to a measurement taken after randomisation, and nobody in LIFE was randomised to a uric acid level. Take the uricosuric effect as established and the 29% as an estimate with assumptions attached.',
      },
      {
        q: 'Why does my potassium need checking?',
        a: 'Because the drug does two things to potassium at once. Blocking the receptor reduces aldosterone, and aldosterone is the hormone that tells the kidney to get rid of potassium — so less is excreted. And the tablet itself is a potassium salt, so it adds a small amount. Neither matters much on its own in a person with normal kidneys, and both matter together in someone with reduced kidney function, on a potassium-sparing diuretic, taking potassium supplements, or using a salt substitute that is potassium chloride. High potassium usually causes no symptoms until it affects the heart rhythm, which is why it is checked by blood test rather than waited for.',
      },
      {
        q: 'Why does this page show no manufacturing cost?',
        a: 'Because no verified per-dose synthesis cost for losartan could be cited. What is shown is the acquisition price: about 3.2 cents for a 50 mg generic tablet in the CMS NADAC file effective 19 August 2026. The synthesis is a protected-tetrazole alkylation followed by deprotection and salt formation — a short route, but a short route is not a cost figure, and this page does not convert one into the other.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Dahlöf B et al. Cardiovascular morbidity and mortality in the Losartan Intervention For Endpoint reduction in hypertension study (LIFE). Lancet 2002;359:995-1003',
        identifier: '10.1016/S0140-6736(02)08089-3',
        kind: 'doi',
      },
      {
        label:
          'Brenner BM et al. Effects of losartan on renal and cardiovascular outcomes in patients with type 2 diabetes and nephropathy (RENAAL). N Engl J Med 2001;345:861-869',
        identifier: '10.1056/NEJMoa011161',
        kind: 'doi',
      },
      {
        label:
          'Pitt B et al. Effect of losartan compared with captopril on mortality in patients with symptomatic heart failure (ELITE II). Lancet 2000;355:1582-1587',
        identifier: '10.1016/S0140-6736(00)02213-3',
        kind: 'doi',
      },
      {
        label:
          'Dickstein K et al. Effects of losartan and captopril on mortality and morbidity in high-risk patients after acute myocardial infarction (OPTIMAAL). Lancet 2002;360:752-760',
        identifier: '10.1016/S0140-6736(02)09895-1',
        kind: 'doi',
      },
      {
        label:
          'Høieggen A et al. The impact of serum uric acid on cardiovascular outcomes in the LIFE study. Kidney Int 2004;65:1041-1049',
        identifier: '10.1111/j.1523-1755.2004.00484.x',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA: COZAAR (losartan potassium), NDA 020386, original approval 14 April 1995',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020386',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3961 — losartan structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3961',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Caffeine — the strongest evidence in this entire file. An umbrella review of 21 meta-analyses,
  // an FDA-approved neonatal drug that cut cerebral palsy, and one honest catch: withdrawal.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'caffeine',
    name: 'Caffeine',
    tradeName:
      'Caffeine anhydrous in supplements; caffeine citrate is an FDA-approved prescription drug for apnea of prematurity (Cafcit, NDA 020793)',
    sponsor:
      'No single sponsor — 1,3,7-trimethylxanthine, obtained from coffee decaffeination or synthesised from urea and dimethylurea, sold by many manufacturers',
    targetGene: 'ADORA2A',
    targetProtein:
      'Adenosine receptors A1 (ADORA1) and A2A (ADORA2A), both G-protein-coupled. Caffeine is a competitive, non-selective antagonist at both at ordinary human doses. Every other proposed mechanism — phosphodiesterase inhibition, ryanodine receptor sensitisation, GABA-A antagonism — requires concentrations that a person drinking coffee never reaches.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement and as an ingredient in coffee, tea, energy drinks and pre-workout formulas, for alertness and exercise performance. Caffeine citrate is separately an approved prescription drug under NDA 020793 for apnea of prematurity in very-low-birth-weight infants, where it reduced bronchopulmonary dysplasia and, at 18 months, death or neurodevelopmental disability.',
    patientFriendlyIndication: 'Taken for alertness, and before training or competition for performance',
    conditionContext: {
      conditionExplainer:
        'Adenosine accumulates in the brain across a waking day and, by acting on its receptors, is one of the signals that produces the feeling of sleepiness. Caffeine occupies those receptors without activating them. It does not add energy; it blocks the message that you are tired, and the adenosine keeps accumulating underneath.',
      whyItMatters:
        'This is the page in this file where the evidence is strongest, and saying so plainly is what makes the sceptical pages elsewhere worth reading. Caffeine is ergogenic across aerobic endurance, muscular strength, muscular endurance, power, jumping and speed, substantiated by 21 meta-analyses, and it is one of very few substances here that is also a licensed drug with a mortality-adjacent randomised benefit in a real disease.',
      whoTakesThis:
        'Roughly most adults on earth, mostly as coffee and tea. Also athletes taking measured doses before competition, shift workers, students, and — under prescription and by a completely different route — premature infants with apnea.',
      clinicalGoals:
        'Trials measured time-trial completion time, one-repetition maximum, repetitions to failure, peak power, jump height, ratings of perceived exertion, polysomnographic total sleep time, and in the neonatal programme bronchopulmonary dysplasia and neurodevelopmental disability at 18 to 21 months.',
    },
    oneSentenceVerdict:
      'Caffeine is the best-evidenced performance substance in this file and one of the best-evidenced in existence — ergogenic across six distinct exercise domains in 21 meta-analyses, and a licensed neonatal drug that cut death or neurodevelopmental disability from 46.2% to 40.2% — with the honest caveat that half of habitual users get a withdrawal headache on stopping, so part of the daily lift is the reversal of a deficit the habit created.',
    laymanHowItWorks:
      'A molecule called adenosine builds up in your brain the longer you are awake, and when it docks onto its receptors you feel tired. Caffeine is shaped enough like adenosine to sit in those receptors without switching them on, so the tiredness signal cannot be delivered. Nothing has been added; a brake has been released. Because the adenosine is still piling up behind the blockade, the tiredness returns when caffeine clears — and if you have been doing this daily, the brain has grown extra receptors to compensate, which is why missing a morning coffee produces a real headache rather than an imagined one.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    anatomicalSite:
      'Central nervous system, principally striatal and cortical adenosine A1 and A2A receptors; also skeletal muscle, adipose tissue and the renal afferent arteriole',
    substitutes: {
      summary:
        'For alertness the only intervention that genuinely beats caffeine is sleep, and it beats it decisively because it clears the adenosine rather than masking it. For exercise performance there is no legal, cheap, orally available substance with a comparable evidence base — which is the honest verdict this page exists to record.',
      conventionalRx: [
        {
          name: 'Caffeine citrate (Cafcit) for apnea of prematurity',
          class: 'Methylxanthine respiratory stimulant, FDA-approved under NDA 020793',
          howItCompares:
            'The same molecule as a licensed drug, given to very-low-birth-weight infants. In the 2,006-infant CAP trial it reduced bronchopulmonary dysplasia and, at 18 to 21 months corrected age, reduced death or neurodevelopmental disability from 46.2% to 40.2% and cerebral palsy from 7.3% to 4.4%.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: a genuine randomised benefit on hard neurological outcomes in a real disease, from a substance most people meet as a beverage. Cons: it tells you nothing about the coffee you drank this morning, and it is regularly cited as if it did.',
        },
        {
          name: 'Adequate sleep',
          class: 'The mechanism-matching comparator',
          howItCompares:
            'Sleep clears accumulated adenosine; caffeine occupies the receptor while the adenosine keeps accumulating. That difference is why caffeine reliably improves performance on a rested athlete and cannot substitute for sleep across days. It is also why 400 mg six hours before bed measurably reduces total sleep time.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: removes the underlying signal rather than blocking it, with no tolerance and no withdrawal. Cons: cannot be bought, which is precisely why the caffeine market exists.',
        },
      ],
      naturalFoods: [
        {
          name: 'Coffee',
          activeCompound: 'Caffeine, plus chlorogenic acids and diterpenes that anhydrous caffeine lacks',
          biologicalMechanism:
            'The caffeine in coffee and the caffeine in a capsule are the same molecule acting at the same receptors, and coffee has been used successfully in ergogenic trials. The differences are dose precision and the accompanying compounds: unfiltered coffee carries cafestol and kahweol, which raise LDL cholesterol, and filtered coffee does not.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: Goncalves\'s time-trial study used 6 mg per kilogram of body mass, and Drake\'s sleep study used a fixed 400 mg.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Tea',
          activeCompound: 'Caffeine at lower concentration, with L-theanine',
          biologicalMechanism:
            'Tea delivers less caffeine per serving alongside L-theanine, an amino acid that crosses the blood-brain barrier and is frequently combined with caffeine in supplement products on the claim that it smooths the stimulant effect. The receptor pharmacology of the caffeine is unchanged.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Separate the lift from the withdrawal reversal',
          action:
            'Notice whether the first dose of the day restores you to normal or takes you above it. In a habitual user those are different things, and only one of them is a drug effect on a neutral baseline.',
          patientImpact:
            'Juliano and Griffiths found headache in 50% of experimental caffeine-withdrawal subjects and clinically significant distress or functional impairment in 13%, with symptoms appearing from daily doses as low as 100 mg.',
          clinicalPrecaution:
            'Withdrawal onset is typically 12 to 24 hours after abstinence, peaks at 20 to 51 hours, and lasts 2 to 9 days. Expectancy is not the prime determinant — this was tested.',
        },
        {
          name: 'Count the hours before bed, not the cups',
          action:
            'Caffeine has a half-life of roughly five hours in a healthy adult, which is doubled by oral contraceptives and roughly halved in smokers.',
          patientImpact:
            'A fixed 400 mg dose taken six hours before bedtime significantly disrupted sleep against placebo, measured both by self-report and by a validated portable sleep monitor.',
          clinicalPrecaution:
            'That finding is the empirical basis of the standard advice to stop caffeine at least six hours before bed. Losing sleep to gain alertness is a bad trade at the level of adenosine, which is the thing caffeine is blocking.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
      chemicalFormula: 'C8H10N4O2',
      molecularWeight: '194.19 g/mol',
      targetReceptorAffinity:
        'Competitive antagonist at adenosine A1 and A2A with affinities in the low micromolar range, which is the concentration ordinary human consumption actually produces in plasma. Phosphodiesterase inhibition and ryanodine receptor effects require concentrations one to two orders of magnitude higher and are not the mechanism in a person.',
      structureSource: {
        label: 'PubChem CID 2519 — Caffeine, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2519',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'caf-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Caffeine content and undeclared-stimulant screen on pre-workout products',
          description:
            'Caffeine itself is easy to assay and rarely misstated, but the products it is sold inside are the most adulterated category in the supplement market. Screen for the synthetic stimulants that have repeatedly been found in pre-workout and weight-loss formulas, because a performance effect attributed to caffeine may not be caffeine at all.',
          reagentsAndBuffer:
            'Reversed-phase HPLC-UV at 273 nm against a caffeine reference standard; LC-MS/MS screen for 1,3-dimethylamylamine, 1,4-dimethylamylamine, higenamine, octopamine and synephrine; proprietary-blend products assayed for total caffeine including from guarana, yerba mate and green tea extract',
        },
        {
          id: 'caf-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of labelled caffeine and paraxanthine standards',
          description:
            'CYP1A2 activity varies several-fold between individuals and is the reason two people report opposite experiences of the same cup. Phenotyping requires quantifying caffeine against its primary metabolite, which needs both compounds as isotopically distinguishable standards.',
          dependsOnStepId: 'caf-w1',
          reagentsAndBuffer:
            'Caffeine-d9 and paraxanthine-d6 internal standards; theobromine and theophylline reference standards for the parallel demethylation routes; LC-MS/MS confirmation of isotopic purity',
        },
        {
          id: 'caf-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Salivary extraction for the paraxanthine-to-caffeine ratio',
          description:
            'Saliva tracks free plasma caffeine closely and can be collected without venepuncture, which makes serial sampling practical. The paraxanthine to caffeine ratio at a fixed interval after a standard dose is the accepted CYP1A2 phenotype metric, and it is what a genotype alone cannot give you.',
          dependsOnStepId: 'caf-w2',
          reagentsAndBuffer:
            'Timed saliva collection with a plain cotton swab, not a citric-acid-stimulated one; solid-phase extraction on a mixed-mode cartridge; methanol elution; LC-MS/MS quantification of caffeine and paraxanthine; parallel CYP1A2 rs762551 genotyping by restriction fragment length polymorphism PCR',
        },
        {
          id: 'caf-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'A1 and A2A receptor occupancy, and upregulation after chronic exposure',
          description:
            'Confirm competitive antagonism at both receptors at achievable concentrations, then run the chronic arm, because receptor upregulation is the substrate of tolerance and withdrawal and it does not appear in an acute experiment. This is the step that distinguishes a drug effect on a naive brain from the restoration of a habituated one.',
          dependsOnStepId: 'caf-w3',
          reagentsAndBuffer:
            'CHO cells stably expressing human A1 or A2A; [3H]DPCPX and [3H]ZM241385 radioligand binding; cAMP accumulation assay; caffeine at 1 to 50 micromolar to span human plasma exposure; 14-day continuous exposure arm with receptor density quantified by saturation binding at washout',
        },
        {
          id: 'caf-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Time-trial performance with perceived exertion and a sleep readout',
          description:
            'Report the performance outcome, the perceived-exertion outcome and the subsequent night\'s sleep from the same subjects. Doherty and Smith showed that exertion ratings account for roughly 29% of the variance in performance improvement, and Drake showed that a moderate dose six hours before bed disrupts sleep. A trial that reports only the time trial is reporting a third of the effect.',
          dependsOnStepId: 'caf-w4',
          reagentsAndBuffer:
            'Cycle ergometer simulated time trial with a validated protocol; Borg 6-20 rating of perceived exertion at fixed intervals; capillary blood lactate; matched placebo capsule plus a no-supplement control arm to detect placebo response; validated portable sleep monitor for the following night',
        },
      ],
    },
    keyAudits: [
      {
        id: 'caf-a1',
        category: 'measured',
        title: 'Twenty-one meta-analyses, six exercise domains, all ergogenic',
        laymanSummary:
          'Researchers reviewed every published meta-analysis of caffeine and exercise. Caffeine improved endurance, strength, muscular endurance, power, jumping and speed. This is not a marginal result.',
        technicalDetails:
          'Grgic and colleagues conducted an umbrella review across twelve databases, identifying eleven reviews containing 21 separate meta-analyses, all of moderate or high methodological quality by AMSTAR 2. Caffeine was ergogenic for aerobic endurance, muscle strength, muscle endurance, power, jumping performance and exercise speed. Using GRADE, the quality of evidence for muscle endurance, muscle strength, anaerobic power and aerobic endurance was moderate, coming from moderate-to-high quality systematic reviews; for the other outcomes the underlying evidence was low or very low. Two caveats are stated by the authors and belong here: not all analyses gave a definite direction of effect once the 95% prediction interval was considered, and most individual studies were conducted among young men. This is the strongest performance evidence base for any substance on this site, and it still carries a generalisability limit that the marketing does not mention.',
        evidenceSource: 'Grgic J et al. Br J Sports Med 2020;54:681-688',
        doi: '10.1136/bjsports-2018-100278',
        measuredMetric:
          'Pooled effect of caffeine across aerobic endurance, muscle strength, muscle endurance, power, jumping and speed',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a2',
        category: 'measured',
        title: 'It makes hard work feel easier, and that explains part of why it works',
        laymanSummary:
          'Across 21 studies caffeine made a given workload feel about six percent easier, and performance improved eleven percent. The two are linked.',
        technicalDetails:
          'Doherty and Smith pooled 21 studies yielding 109 effect sizes for ratings of perceived exertion. Against placebo, caffeine reduced RPE during constant-load exercise by 5.6% (95% CI -4.5% to -6.7%), an effect size of -0.47 (95% CI -0.35 to -0.59). Crucially, RPE at the point of exhaustion did not differ at all (0.01% change, 95% CI -1.9 to 2.0) — people stopped at the same subjective ceiling, they just reached more work before hitting it. Exercise performance improved by 11.2% (95% CI 4.6 to 17.8%), and regression showed that the reduction in RPE during exercise accounted for approximately 29% of the variance in performance improvement. This is a rare case of a supplement having a partly identified mechanism of action at the behavioural level, not just the molecular one.',
        evidenceSource: 'Doherty M, Smith PM. Scand J Med Sci Sports 2005;15:69-78',
        doi: '10.1111/j.1600-0838.2005.00445.x',
        measuredMetric:
          'Percentage change in rating of perceived exertion during constant-load exercise and in exercise performance',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a3',
        category: 'measured',
        title: 'CAP: 2,006 premature infants, less lung disease and less cerebral palsy',
        laymanSummary:
          'In the largest randomised trial ever run on caffeine, very premature babies given it needed less oxygen support and, at eighteen months, were less likely to have died or developed a disability.',
        technicalDetails:
          'The Caffeine for Apnea of Prematurity trial randomised 2,006 infants with birth weights of 500 to 1,250 g within the first ten days of life to caffeine or placebo until therapy for apnea was no longer needed. At 36 weeks postmenstrual age, 350 of 963 caffeine infants (36%) still required supplemental oxygen against 447 of 954 placebo infants (47%), adjusted odds ratio 0.63 (95% CI 0.52 to 0.76, P < 0.001), and positive airway pressure was discontinued a week earlier. Caffeine temporarily reduced weight gain, greatest at two weeks (mean difference -23 g, 95% CI -32 to -13, P < 0.001). At 18 to 21 months corrected age, the composite of death, cerebral palsy, cognitive delay, deafness or blindness occurred in 377 of 937 caffeine infants (40.2%) against 431 of 932 (46.2%) on placebo, adjusted odds ratio 0.77 (95% CI 0.64 to 0.93, P = 0.008). Cerebral palsy fell from 7.3% to 4.4% (aOR 0.58, 95% CI 0.39 to 0.87, P = 0.009) and cognitive delay from 38.3% to 33.8% (aOR 0.81, 95% CI 0.66 to 0.99, P = 0.04). Caffeine citrate holds an FDA approval for this indication under NDA 020793.',
        evidenceSource:
          'Schmidt B et al. N Engl J Med 2006;354:2112-2121; Schmidt B et al. N Engl J Med 2007;357:1893-1902',
        doi: '10.1056/NEJMoa073679',
        measuredMetric:
          'Bronchopulmonary dysplasia at 36 weeks postmenstrual age, and death or neurodevelopmental disability at 18 to 21 months',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a4',
        category: 'inferred',
        title: 'Half of habitual users get a withdrawal headache, from doses as low as 100 mg a day',
        laymanSummary:
          'Caffeine withdrawal is a real, validated syndrome with ten confirmed symptoms. Half of people get a headache, and it can be triggered by a daily habit as small as one cup.',
        technicalDetails:
          'Juliano and Griffiths reviewed 57 experimental and 9 survey studies. Of 49 candidate symptom categories, ten met validity criteria: headache, fatigue, decreased energy or activeness, decreased alertness, drowsiness, decreased contentedness, depressed mood, difficulty concentrating, irritability, and feeling foggy or not clearheaded. Flu-like symptoms, nausea or vomiting and muscle pain or stiffness were judged likely valid. In experimental studies the incidence of headache was 50% and of clinically significant distress or functional impairment 13%. Onset was typically 12 to 24 hours after abstinence, peak intensity at 20 to 51 hours, duration 2 to 9 days. Incidence and severity rose with daily dose, and abstinence from doses as low as 100 mg per day produced symptoms. The authors specifically reviewed and rejected expectancy as a prime determinant, and concluded that avoidance of withdrawal plays a central role in habitual consumption. The audit point is not that caffeine does not work — it plainly does — but that a habitual user\'s morning baseline is not a neutral one, and the daily subjective lift is partly the repair of a deficit the habit itself produced.',
        evidenceSource: 'Juliano LM, Griffiths RR. Psychopharmacology (Berl) 2004;176:1-29',
        doi: '10.1007/s00213-004-2000-x',
        measuredMetric:
          'Incidence, onset, peak and duration of validated caffeine withdrawal symptoms after abstinence',
        inferredClaim:
          'That the alertness a habitual user feels after their first coffee measures caffeine acting on a normal baseline, rather than the reversal of an overnight withdrawal',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a5',
        category: 'conclusion_shift',
        title: 'The habituation myth: heavy coffee drinkers get the same performance benefit',
        laymanSummary:
          'For years athletes were told to abstain from caffeine before competition so it would work better. A controlled study across low, moderate and heavy habitual users found their daily intake made no difference to the benefit.',
        technicalDetails:
          'Goncalves and colleagues ran a double-blind, crossover, counterbalanced study in 40 male endurance-trained cyclists, stratified into tertiles by habitual daily caffeine intake: low (58 +/- 29 mg/day), moderate (143 +/- 25) and high (351 +/- 139). Each completed three simulated cycling time trials after caffeine 6 mg/kg, placebo, or no supplement. Time-trial performance improved significantly with caffeine — 29.92 +/- 2.18 minutes against 30.81 +/- 2.67 for placebo and 31.14 +/- 2.71 for control (P = 0.0002). Analysis of covariance found no influence of habitual caffeine intake on the response (P = 0.47), performance did not differ across tertiles (P = 0.75), and there was no correlation between habitual intake and the absolute caffeine-minus-control change (P = 0.524). Individual analysis showed eight, seven and five responders in the low, moderate and high tertiles respectively, with no significant difference between them by Fisher\'s exact test. The withdrawal-abstinence protocols that dominated sports nutrition advice for two decades were, on this evidence, unnecessary — and worth noting for what it also shows: the tolerance that develops for alertness does not straightforwardly transfer to the ergogenic effect.',
        evidenceSource: 'Goncalves LS et al. J Appl Physiol (1985) 2017;123:213-220',
        doi: '10.1152/japplphysiol.00260.2017',
        measuredMetric:
          'Simulated cycling time-trial completion time by habitual caffeine intake tertile',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a6',
        category: 'inferred',
        title: 'CYP1A2 genotype: opposite heart-attack associations in slow and fast metabolisers',
        laymanSummary:
          'In a large case-control study, people who break caffeine down slowly had a higher risk of heart attack with heavy coffee intake. People who break it down quickly did not.',
        technicalDetails:
          'Cornelis and colleagues genotyped 2,014 cases with a first acute nonfatal myocardial infarction and 2,014 matched population controls in Costa Rica between 1994 and 2004. Among carriers of the slow CYP1A2*1F allele — 55% of cases and 54% of controls — the multivariate odds ratios for nonfatal MI at less than one, one, two to three, and four or more cups of coffee daily were 1.00, 0.99 (0.69 to 1.44), 1.36 (1.01 to 1.83) and 1.64 (1.14 to 2.34). Among rapid *1A/*1A metabolisers the corresponding odds ratios were 1.00, 0.75 (0.51 to 1.12), 0.78 (0.56 to 1.09) and 0.99 (0.66 to 1.48), with a gene-by-coffee interaction of P = .04. This is the most-cited evidence that individual caffeine responses are genetically stratified, and it must be read for what it is: a single-population observational case-control study with a modest interaction p-value, not a randomised result. Subsequent attempts to replicate the CYP1A2 interaction for cardiovascular outcomes have been inconsistent, and consumer genetic tests that report a caffeine sensitivity result on this basis are extrapolating well past what one case-control study supports.',
        evidenceSource: 'Cornelis MC, El-Sohemy A, Kabagambe EK, Campos H. JAMA 2006;295:1135-1141',
        doi: '10.1001/jama.295.10.1135',
        inferredClaim:
          'That a CYP1A2 genotype result can tell an individual how much coffee is safe for their heart',
        auditFlag: 'caution',
      },
      {
        id: 'caf-a7',
        category: 'measured',
        title: 'Four hundred milligrams six hours before bed measurably wrecks sleep',
        laymanSummary:
          'A controlled study gave people a moderate caffeine dose at bedtime, three hours before, and six hours before. All three disrupted sleep, including the one taken six hours ahead.',
        technicalDetails:
          'Drake and colleagues compared a fixed 400 mg caffeine dose administered at 0, 3 and 6 hours before habitual bedtime against placebo, with self-reported sleep and objective monitoring by a validated portable sleep monitor in the home. All three timings produced significant sleep disturbance relative to placebo (P < 0.05 for all). The authors concluded that the magnitude of reduction in total sleep time means caffeine taken six hours before bed has important disruptive effects, and that this provides the empirical basis for the standard sleep hygiene recommendation to stop caffeine at least six hours before bedtime. The result matters mechanistically and not just practically: caffeine works by blocking the adenosine signal that sleep exists to clear, so using it late costs the very recovery it is compensating for.',
        evidenceSource: 'Drake C, Roehrs T, Shambroom J, Roth T. J Clin Sleep Med 2013;9:1195-1200',
        doi: '10.5664/jcsm.3170',
        measuredMetric:
          'Self-reported and objectively monitored sleep disturbance after 400 mg caffeine at 0, 3 and 6 hours before bedtime',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed almost completely, and in the brain within an hour',
        laymanDesc:
          'Caffeine is small, fat-soluble and absorbed essentially in full. It crosses into the brain freely, which is why the effect arrives fast and does not depend on any transporter.',
        molecularDetail:
          'Oral bioavailability approaches 100% with peak plasma concentration typically 30 to 60 minutes after ingestion. Caffeine crosses the blood-brain barrier by passive diffusion and is not a substrate for efflux pumps at relevant concentrations, so brain concentration tracks plasma closely — an unusual property that removes most of the pharmacokinetic uncertainty that clouds other supplements in this file.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It occupies the tiredness receptor without switching it on',
        laymanDesc:
          'Adenosine builds up while you are awake and, when it docks, tells the brain to slow down. Caffeine fits the same dock and blocks it. Nothing is added; a signal is silenced.',
        molecularDetail:
          'Caffeine is a competitive, non-selective antagonist at adenosine A1 and A2A receptors with low-micromolar affinity, which is the range achieved by ordinary consumption. A2A antagonism in the striatum, where A2A forms heteromers with dopamine D2 receptors, accounts for most of the psychostimulant effect. Phosphodiesterase inhibition and ryanodine receptor sensitisation require concentrations far above human exposure and are not the operative mechanism.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The same workload starts to feel easier',
        laymanDesc:
          'The clearest measured consequence during exercise is not more force. It is that a given effort registers as less hard, so more work gets done before the same subjective ceiling is reached.',
        molecularDetail:
          'Doherty and Smith measured a 5.6% reduction in rating of perceived exertion during constant-load exercise with no change at all in RPE at exhaustion, and an 11.2% improvement in performance, with the RPE reduction accounting for about 29% of the performance variance. The endpoint moves because the perceptual cost of the work falls, not because the ceiling rises.',
        iconName: 'Gauge',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'CYP1A2 clears it, at very different speeds in different people',
        laymanDesc:
          'One liver enzyme does most of the work of breaking caffeine down, and how fast it runs varies several-fold between people, which is why identical cups produce opposite experiences.',
        molecularDetail:
          'CYP1A2 performs the initial N3-demethylation to paraxanthine, which accounts for roughly 80% of caffeine clearance. Half-life in a healthy adult is around five hours but is roughly doubled by oral contraceptives and in pregnancy, roughly halved by smoking, and modified by the rs762551 polymorphism that defines the *1A and *1F alleles. Cornelis found opposite directions of coffee-associated myocardial infarction risk in slow and rapid metabolisers, with a gene-by-coffee interaction of P = .04.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'Daily use builds more receptors, and stopping exposes them',
        laymanDesc:
          'Under a permanent blockade the brain adds more adenosine receptors. When the caffeine clears, all of them receive the accumulated signal at once, which is a genuine headache rather than a psychological one.',
        molecularDetail:
          'Chronic caffeine exposure upregulates adenosine receptor density, which is the physical substrate of tolerance and of withdrawal. Juliano and Griffiths validated ten withdrawal symptoms, with headache incidence of 50%, functional impairment in 13%, onset at 12 to 24 hours, peak at 20 to 51 hours and duration of 2 to 9 days, from doses as low as 100 mg per day. Notably, Goncalves found the ergogenic response was unaffected by habitual intake — tolerance for alertness does not simply transfer to tolerance for performance.',
        iconName: 'RefreshCw',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Grgic 2020 umbrella review of 21 meta-analyses of caffeine and exercise',
        phase: 'Umbrella review of 11 systematic reviews containing 21 meta-analyses',
        sampleSize: 21,
        primaryEndpoint:
          'Effect of caffeine ingestion on aerobic endurance, muscle strength, muscle endurance, power, jumping and speed',
        endpointMet: true,
        statisticalPValue:
          'Ergogenic across all six domains; GRADE moderate for muscle endurance, muscle strength, anaerobic power and aerobic endurance',
        unreportedAdverseSignals:
          'Not all analyses gave a definite direction of effect once the 95% prediction interval was considered, and most individual studies were conducted among young men. Sample size here counts meta-analyses, not participants.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Doherty 2005 meta-analysis of caffeine and rating of perceived exertion',
        phase: 'Meta-analysis of 21 studies yielding 109 effect sizes',
        sampleSize: 21,
        primaryEndpoint: 'Change in rating of perceived exertion and in exercise performance',
        endpointMet: true,
        statisticalPValue:
          'RPE during exercise -5.6% (95% CI -4.5 to -6.7), effect size -0.47; performance +11.2% (95% CI 4.6 to 17.8)',
        unreportedAdverseSignals:
          'RPE at exhaustion was completely unchanged (0.01%, 95% CI -1.9 to 2.0), which means caffeine does not raise the subjective ceiling — it delays arrival at it.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT00182312 — CAP, caffeine for apnea of prematurity',
        phase: 'Randomised double-blind placebo-controlled multicentre',
        sampleSize: 2006,
        primaryEndpoint:
          'Composite of death, cerebral palsy, cognitive delay, deafness or blindness at 18 to 21 months corrected age',
        endpointMet: true,
        statisticalPValue:
          '40.2% caffeine versus 46.2% placebo, adjusted OR 0.77 (95% CI 0.64 to 0.93), P = 0.008; cerebral palsy 4.4% versus 7.3%, aOR 0.58, P = 0.009',
        unreportedAdverseSignals:
          'Caffeine temporarily reduced weight gain, greatest at two weeks (mean difference -23 g, P < 0.001). Rates of death, ultrasonographic brain injury and necrotising enterocolitis did not differ in the short-term analysis.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Goncalves 2017 — habitual caffeine intake and the acute ergogenic response',
        phase: 'Double-blind randomised crossover, counterbalanced, with a no-supplement control arm',
        sampleSize: 40,
        primaryEndpoint: 'Simulated cycling time-trial completion time stratified by habitual intake',
        endpointMet: true,
        statisticalPValue:
          'Caffeine 29.92 min versus placebo 30.81 and control 31.14, P = 0.0002; habitual intake as covariate P = 0.47; between-tertile difference P = 0.75',
        unreportedAdverseSignals:
          'Twenty of 40 cyclists improved beyond the test variation, meaning half did not respond meaningfully. All participants were male endurance-trained cyclists.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Drake 2013 — caffeine 400 mg at 0, 3 and 6 hours before bedtime',
        phase: 'Randomised placebo-controlled crossover with objective home sleep monitoring',
        sampleSize: 12,
        primaryEndpoint: 'Self-reported and objectively monitored sleep disturbance',
        endpointMet: true,
        statisticalPValue: 'Significant sleep disturbance at all three timings versus placebo, P < 0.05',
        unreportedAdverseSignals:
          'A small sample, but the six-hour finding is the empirical basis of the standard sleep-hygiene recommendation and had not previously been tested directly in the home environment.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Caffeine is ergogenic for aerobic endurance, muscle strength, muscle endurance, power, jumping and speed across 21 meta-analyses',
        'It reduces rating of perceived exertion during exercise by 5.6% and improves performance by 11.2%, with the two statistically linked',
        'In 2,006 premature infants it reduced death or neurodevelopmental disability from 46.2% to 40.2% and cerebral palsy from 7.3% to 4.4%',
        'The ergogenic response did not vary across low, moderate and high habitual consumers in a controlled crossover',
        'Four hundred milligrams six hours before bed significantly disrupted objectively monitored sleep',
      ],
      unsupportedInferences: [
        'That the daily lift a habitual user feels is a drug effect on a neutral baseline rather than partly withdrawal reversal',
        'That a consumer CYP1A2 genotype result can tell an individual how much coffee is cardiovascularly safe',
        'That the neonatal cerebral palsy result says anything about caffeine in adults, which it does not',
        'That an ergogenic effect measured almost entirely in young men generalises unchanged to everyone',
      ],
      whatFailedInitially: [
        'The two-decade sports-nutrition practice of pre-competition caffeine abstinence, which a controlled crossover found unnecessary',
        'The pre-1990s belief that phosphodiesterase inhibition was the mechanism, which requires concentrations no human reaches',
      ],
      realWorldOutcome: [
        'This is the strongest evidence base in this file and the page says so without hedging',
        'The effect is genuine but not universal: half the cyclists in the habituation study did not improve beyond test variation',
        'Withdrawal is a validated syndrome with a 50% headache incidence, triggered by habits as small as 100 mg a day',
      ],
    },
    deliverySystem: {
      type: 'Beverage, tablet, capsule, gum, powder or energy drink; intravenous or oral caffeine citrate as a neonatal prescription drug',
      description:
        'Sold in the United States as a dietary supplement under DSHEA when in supplement form, and regulated as a food additive in beverages. Absorption is near-complete and rapid by any oral route, and caffeine gum is absorbed buccally and faster still. The problematic format is bulk anhydrous powder, where a teaspoon can contain a dose several times what a person would ever consume as coffee and domestic scales cannot weigh accurately at the required precision. Pre-workout formulas are the most adulterated supplement category, and a performance effect from one of them is not necessarily a caffeine effect.',
      safetyProfile:
        'Anxiety, tremor, palpitations, gastro-oesophageal reflux and diuresis at higher intakes. Sleep disruption is measurable from a moderate dose taken six hours before bed. Withdrawal is a validated syndrome: 50% headache incidence, 13% clinically significant impairment, onset 12 to 24 hours, duration 2 to 9 days, from habits as small as 100 mg per day. Clearance is roughly halved in smokers and roughly doubled by oral contraceptives and in pregnancy. Caffeine markedly raises exposure to and is raised by CYP1A2 interactions including fluvoxamine and ciprofloxacin. In slow CYP1A2 metabolisers a case-control study found higher myocardial infarction odds at four or more cups daily, which is observational and inconsistently replicated. Acute overdose from concentrated powder is the one genuinely lethal presentation.',
    },
    commonQuestions: [
      {
        q: 'Does caffeine actually improve performance, or is that marketing?',
        a: 'It works, and this page will not hedge it. An umbrella review of eleven systematic reviews containing 21 meta-analyses found caffeine ergogenic for aerobic endurance, muscle strength, muscle endurance, power, jumping and speed, with GRADE-moderate evidence for four of those. The mechanism is partly identified: it reduces how hard a given workload feels by about 5.6% without changing the effort level at which people quit, so more work happens before the same ceiling. That is a better-supported claim than anything else in this file.',
        auditNote:
          'The stated limits are worth keeping: most trials were in young men, and half the cyclists in one controlled study did not respond beyond test variation.',
      },
      {
        q: 'Do I need to stop caffeine before a race for it to work?',
        a: 'On the best available evidence, no. Forty trained cyclists split into low, moderate and high habitual consumers all improved their time trials with caffeine, and habitual intake had no influence on the size of the response as a covariate, across tertiles, or as a correlation. The abstinence protocols that dominated sports nutrition advice for two decades were built on an assumption rather than a test, and when the test was run it did not hold.',
      },
      {
        q: 'Is the morning coffee doing anything, or just fixing withdrawal?',
        a: 'Both, and the honest answer separates them. Caffeine withdrawal is a validated syndrome with ten confirmed symptoms; headache occurs in half of people and clinically significant impairment in 13%, from habits as small as 100 mg a day, with symptoms starting 12 to 24 hours after the last dose. So a habitual user\'s pre-coffee state is below their own neutral baseline, and part of what the first cup restores is that deficit. What that does not do is erase the performance evidence, which comes from controlled crossovers with placebo arms.',
      },
      {
        q: 'How late is too late?',
        a: 'A controlled study gave people 400 mg at bedtime, three hours before bed, and six hours before bed, and measured sleep both by report and by a validated home monitor. All three timings significantly disrupted sleep, including the six-hour one. The authors said the magnitude of total sleep time lost at six hours was large enough to justify the standard advice to stop at least six hours before bed. The mechanism makes this worse than it sounds: caffeine blocks the very adenosine signal that sleep exists to clear.',
      },
      {
        q: 'Is caffeine ever a real medicine?',
        a: 'Yes, and it is one of the more remarkable results in neonatology. In 2,006 infants weighing 500 to 1,250 g at birth, caffeine reduced the need for supplemental oxygen at 36 weeks from 47% to 36%, and at 18 to 21 months reduced the composite of death or neurodevelopmental disability from 46.2% to 40.2%, with cerebral palsy falling from 7.3% to 4.4%. Caffeine citrate holds an FDA approval for apnea of prematurity. None of that transfers to an adult drinking coffee, and it is regularly quoted as though it did.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'Juliano LM, Griffiths RR. A critical review of caffeine withdrawal: empirical validation of symptoms and signs, incidence, severity, and associated features. Psychopharmacology (Berl) 2004;176:1-29',
        identifier: '10.1007/s00213-004-2000-x',
        kind: 'doi',
      },
      {
        label:
          'Doherty M, Smith PM. Effects of caffeine ingestion on rating of perceived exertion during and after exercise: a meta-analysis. Scand J Med Sci Sports 2005;15:69-78',
        identifier: '10.1111/j.1600-0838.2005.00445.x',
        kind: 'doi',
      },
      {
        label:
          'Schmidt B et al. Caffeine therapy for apnea of prematurity. N Engl J Med 2006;354:2112-2121',
        identifier: '10.1056/NEJMoa054065',
        kind: 'doi',
      },
      {
        label:
          'Cornelis MC, El-Sohemy A, Kabagambe EK, Campos H. Coffee, CYP1A2 genotype, and risk of myocardial infarction. JAMA 2006;295:1135-1141',
        identifier: '10.1001/jama.295.10.1135',
        kind: 'doi',
      },
      {
        label:
          'Schmidt B et al. Long-term effects of caffeine therapy for apnea of prematurity. N Engl J Med 2007;357:1893-1902',
        identifier: '10.1056/NEJMoa073679',
        kind: 'doi',
      },
      {
        label: 'CAP trial registration — caffeine for apnea of prematurity',
        identifier: 'NCT00182312',
        kind: 'nct',
      },
      {
        label:
          'Drake C, Roehrs T, Shambroom J, Roth T. Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. J Clin Sleep Med 2013;9:1195-1200',
        identifier: '10.5664/jcsm.3170',
        kind: 'doi',
      },
      {
        label:
          'Goncalves LS et al. Dispelling the myth that habitual caffeine consumption influences the performance response to acute caffeine supplementation. J Appl Physiol (1985) 2017;123:213-220',
        identifier: '10.1152/japplphysiol.00260.2017',
        kind: 'doi',
      },
      {
        label:
          'Grgic J et al. Wake up and smell the coffee: caffeine supplementation and exercise performance — an umbrella review of 21 published meta-analyses. Br J Sports Med 2020;54:681-688',
        identifier: '10.1136/bjsports-2018-100278',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA — NDA 020793, CAFCIT (caffeine citrate) for apnea of prematurity',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020793',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2519 — Caffeine',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2519',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Metoprolol — a drug that saves lives in heart failure, kills people when given before
  //    surgery, and in 2024 was shown to do nothing after an uncomplicated heart attack.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'metoprolol',
    name: 'Metoprolol',
    tradeName: 'Lopressor (tartrate) / Toprol-XL (succinate)',
    sponsor:
      'AB Hässle / Astra (originator), now AstraZeneca; both salts long off-patent and made by many manufacturers',
    targetGene: 'ADRB1',
    targetProtein: 'Beta-1 adrenergic receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1978,
    indication:
      'Hypertension; angina pectoris; haemodynamically stable acute myocardial infarction to reduce cardiovascular mortality; and, for the extended-release succinate salt, stable symptomatic heart failure of ischaemic, hypertensive or cardiomyopathic origin',
    patientFriendlyIndication:
      'High blood pressure, chest pain, heart failure, and the period after a heart attack',
    anatomicalSite: 'Cardiac myocyte sarcolemma and juxtaglomerular cells of the kidney',
    conditionContext: {
      conditionExplainer:
        'Adrenaline and noradrenaline speed the heart and make it contract harder by acting on beta-1 receptors on heart muscle. In a failing heart that drive is chronically switched on, and over months it damages the muscle it is trying to compensate for. Blocking it feels counter-intuitive — slowing a struggling heart — and for thirty years it was considered contraindicated in heart failure.',
      whyItMatters:
        'Metoprolol is a drug whose benefit is entirely situational and where the situations have been tested one at a time with different answers. Chronic heart failure: a third fewer deaths. Immediately after a heart attack: fewer reinfarctions but more cardiogenic shock. Before non-cardiac surgery: fewer heart attacks and more deaths and strokes. After a modern, uncomplicated heart attack with a normal ejection fraction: nothing.',
      whoTakesThis:
        'One of the most-prescribed drugs in the world. The tartrate and succinate salts are not interchangeable: the survival evidence in heart failure belongs to the extended-release succinate, and only that salt carries the heart failure indication.',
      clinicalGoals:
        'In heart failure, reduce all-cause mortality — which MERIT-HF measured directly. In hypertension and angina, reduce blood pressure and anginal episodes. After myocardial infarction with preserved ejection fraction, the goal is now an open question rather than an established one.',
    },
    oneSentenceVerdict:
      'A beta-1 selective blocker with one of the cleanest mortality results in cardiology — 145 deaths against 217 in 3,991 heart failure patients — and one of the clearest demonstrations of harm, with 129 deaths against 97 and more than double the strokes in 8,351 patients given it before non-cardiac surgery, in a trial whose primary endpoint it technically met.',
    laymanHowItWorks:
      'Adrenaline docks onto receptors on heart muscle and tells the heart to beat faster and harder. Metoprolol occupies those receptors so adrenaline cannot. The heart slows, works less hard and uses less oxygen. In a heart that is failing, taking away that constant lash is what lets the muscle recover, which is why the drug helps despite doing the opposite of what intuition suggests.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 80,
    substitutes: {
      summary:
        'Both metoprolol salts are among the cheapest tablets dispensed. Within the class, bisoprolol and carvedilol have their own heart failure mortality trials, and carvedilol beat metoprolol tartrate head-to-head in COMET. Outside the class, the question after 2024 is often not which beta blocker but whether one is needed at all, and that depends heavily on ejection fraction.',
      conventionalRx: [
        {
          name: 'Bisoprolol',
          class: 'Beta-1 selective beta blocker',
          howItCompares:
            'Has its own placebo-controlled heart failure mortality trial and was one of the two beta blockers permitted in the beta-blocker arm of REDUCE-AMI. Comparable class, comparable price, no head-to-head mortality trial against metoprolol.',
          typicalCost: 'A low-cost generic, in the same range as metoprolol',
          prosAndCons:
            'Pros: greater beta-1 selectivity than metoprolol, once daily. Cons: same bradycardia, fatigue and bronchospasm considerations.',
        },
        {
          name: 'Carvedilol',
          class: 'Non-selective beta blocker with alpha-1 blockade',
          howItCompares:
            'Blocks beta-1, beta-2 and alpha-1, so it produces vasodilation that metoprolol does not. It has its own heart failure mortality evidence and is the drug of choice for some clinicians in that setting.',
          typicalCost: 'A low-cost generic',
          prosAndCons:
            'Pros: added vasodilation, no negative metabolic profile. Cons: twice daily, more postural hypotension, and beta-2 blockade matters in airways disease.',
        },
        {
          name: 'No beta blocker at all, after an uncomplicated myocardial infarction',
          class: 'A strategy rather than a drug — the comparator arm of REDUCE-AMI',
          howItCompares:
            'In 5,020 patients with acute myocardial infarction, early angiography and an ejection fraction of at least 50%, the composite of death or new infarction occurred in 7.9% on a beta blocker and 8.3% on none: hazard ratio 0.96 (95% CI 0.79 to 1.16), p=0.64. Death from any cause was 3.9% against 4.1%.',
          typicalCost: 'No acquisition cost',
          prosAndCons:
            'Pros: no fatigue, no bradycardia, one fewer tablet. Cons: ABYSS, published the same year, found that stopping an established beta blocker was not non-inferior to continuing it, so starting and stopping are not the same question.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Do not stop this drug abruptly on your own',
          action:
            'If you want to come off a beta blocker, ask for it to be tapered rather than stopping between one day and the next.',
          patientImpact:
            'Chronic beta blockade upregulates the receptors it blocks. Removing the block suddenly exposes a heart with more receptors than it started with to normal circulating catecholamines, and the result can be rebound tachycardia, hypertension, angina or infarction. The US label carries an explicit warning about abrupt cessation in patients with coronary artery disease.',
          clinicalPrecaution:
            'ABYSS is the relevant trial and it did not support routine interruption: 23.8% of patients who stopped reached the composite endpoint against 21.1% who continued, and quality of life did not improve.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)NCC(COC1=CC=C(C=C1)CCOC)O',
      chemicalFormula: 'C15H25NO3',
      molecularWeight:
        '267.36 g/mol (free base); dispensed as metoprolol tartrate or metoprolol succinate, which are not interchangeable',
      targetReceptorAffinity:
        'A competitive antagonist with roughly 70-fold selectivity for beta-1 over beta-2 at low exposure, a margin that erodes as the dose rises. Marketed metoprolol is a racemate and the (S)-enantiomer carries essentially all of the beta-blocking activity, while both enantiomers are cleared by CYP2D6 — so a poor metaboliser accumulates the active enantiomer and loses selectivity at the same time.',
      structureSource: {
        label:
          'PubChem CID 4171 (metoprolol) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4171',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'met2-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the methoxyethylphenol and the epoxide reagent',
          description:
            'Assay 4-(2-methoxyethyl)phenol for the ortho isomer and for residual catalyst, and epichlorohydrin for water and for chloride. The para-substituted methoxyethyl chain is what confers beta-1 selectivity; the ortho isomer produces a compound with the same molecular formula and a different receptor profile, which no assay downstream of the ether formation distinguishes on mass alone.',
          reagentsAndBuffer:
            '4-(2-methoxyethyl)phenol reference standard, epichlorohydrin, gas chromatography with flame ionisation detection, Karl Fischer titration, atomic absorption for residual metal catalyst',
        },
        {
          id: 'met2-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Williamson etherification and epoxide opening with isopropylamine',
          description:
            'Alkylate the phenol with epichlorohydrin under base to form the aryl glycidyl ether, then open the epoxide with isopropylamine to install the aminopropanol arm. The reaction creates the single stereocentre with no facial control, which is why the marketed drug is a racemate even though only one enantiomer blocks the receptor.',
          dependsOnStepId: 'met2-w1',
          reagentsAndBuffer:
            'Sodium hydroxide or potassium carbonate in isopropanol or toluene, epichlorohydrin in slight excess, isopropylamine in large excess to suppress the bis-adduct, reflux under nitrogen',
        },
        {
          id: 'met2-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Salt selection and crystallisation as tartrate or succinate',
          description:
            'Form and crystallise either the tartrate or the succinate salt. This is not a cosmetic choice: the tartrate is freely soluble and gives an immediate-release tablet, while the less soluble succinate is what makes the controlled-release multiple-unit pellet formulation possible, and the heart failure mortality evidence belongs to that formulation and not to the tartrate.',
          dependsOnStepId: 'met2-w2',
          reagentsAndBuffer:
            'L-(+)-tartaric acid or succinic acid in acetone/isopropanol, activated charcoal treatment, reversed-phase HPLC against the bis-adduct and the des-isopropyl impurity, differential scanning calorimetry to confirm the crystal form',
        },
        {
          id: 'met2-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'CYP2D6-dependent clearance in primary human hepatocytes',
          description:
            'Measure alpha-hydroxylation and O-demethylation in hepatocytes from genotyped donors spanning poor, intermediate, extensive and ultrarapid CYP2D6 metabolisers. Metoprolol is a textbook CYP2D6 substrate: exposure differs several-fold across genotypes, and the enantiomers are cleared at different rates, so the active (S)-enantiomer fraction changes with genotype as well as the total.',
          dependsOnStepId: 'met2-w3',
          reagentsAndBuffer:
            'Cryopreserved primary human hepatocytes from CYP2D6-genotyped donors, recombinant CYP2D6 microsomes, NADPH regenerating system, quinidine as a selective CYP2D6 inhibitor control, chiral LC-MS/MS to resolve (R)- and (S)-metoprolol',
        },
        {
          id: 'met2-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Beta-1 versus beta-2 selectivity readout',
          description:
            'Measure cyclic AMP accumulation in cells expressing human beta-1 and, in parallel, human beta-2 receptors, across a full isoprenaline concentration range with and without drug. Reporting both is the point: beta-1 selectivity is the clinical claim, it is relative rather than absolute, and it is lost at higher concentrations — which is what determines the bronchospasm risk in a person with airways disease.',
          dependsOnStepId: 'met2-w4',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human ADRB1 or ADRB2, isoprenaline as agonist, 3-isobutyl-1-methylxanthine to block phosphodiesterase, homogeneous time-resolved fluorescence cyclic AMP detection kit, CGP 20712A and ICI 118,551 as beta-1 and beta-2 selective reference antagonists',
        },
      ],
    },
    keyAudits: [
      {
        id: 'met2-a1',
        category: 'measured',
        title: 'MERIT-HF: 145 deaths against 217, and the trial was stopped early',
        laymanSummary:
          'Nearly four thousand people with heart failure took extended-release metoprolol or placebo on top of their usual treatment. After about a year the safety committee stopped the trial because the treated group was clearly dying less.',
        technicalDetails:
          'MERIT-HF enrolled 3,991 patients with chronic heart failure in NYHA class II-IV and ejection fraction of 0.40 or less, stabilised on optimum standard therapy, after a 2-week single-blind placebo run-in. 1,990 were assigned metoprolol CR/XL starting at 12.5 mg (class III-IV) or 25 mg (class II) once daily and up-titrated over 8 weeks toward a target of 200 mg; 2,001 received placebo. The independent safety committee recommended early stopping. Mean follow-up was 1 year. All-cause mortality was 145 deaths (7.2% per patient-year) on metoprolol against 217 (11.0%) on placebo: relative risk 0.66 (95% CI 0.53 to 0.81), p=0.00009, or p=0.0062 adjusted for interim analyses. Sudden deaths were 79 against 132 (0.59, 0.45 to 0.78, p=0.0002) and deaths from worsening heart failure 30 against 58 (0.51, 0.33 to 0.79, p=0.0023).',
        evidenceSource: 'MERIT-HF Study Group, Lancet 1999;353:2001-2007',
        doi: '10.1016/S0140-6736(99)04440-2',
        measuredMetric: 'All-cause mortality over a mean 1 year in chronic heart failure',
        auditFlag: 'verified',
      },
      {
        id: 'met2-a2',
        category: 'failed',
        title: 'POISE: the primary endpoint was met and the drug killed people',
        laymanSummary:
          'Eight thousand people were given extended-release metoprolol before non-cardiac surgery. They had fewer heart attacks, exactly as intended. They also had a third more deaths and more than double the strokes.',
        technicalDetails:
          'POISE randomised 8,351 patients with or at risk of atherosclerotic disease undergoing non-cardiac surgery to extended-release metoprolol succinate (n=4,174) or placebo (n=4,177), started 2 to 4 hours before surgery and continued for 30 days, across 190 hospitals in 23 countries. The composite primary endpoint of cardiovascular death, non-fatal myocardial infarction and non-fatal cardiac arrest occurred in 244 (5.8%) against 290 (6.9%): hazard ratio 0.84 (95% CI 0.70 to 0.99), p=0.0399 — the endpoint was met. Myocardial infarction fell from 239 (5.7%) to 176 (4.2%): 0.73 (0.60 to 0.89), p=0.0017. But there were 129 deaths (3.1%) on metoprolol against 97 (2.3%) on placebo: 1.33 (1.03 to 1.74), p=0.0317. Stroke occurred in 41 (1.0%) against 19 (0.5%): 2.17 (1.26 to 3.74), p=0.0053. The authors wrote that patients are unlikely to accept the risks associated with perioperative extended-release metoprolol.',
        evidenceSource: 'POISE Study Group, Lancet 2008;371:1839-1847 (NCT00182039)',
        doi: '10.1016/S0140-6736(08)60601-7',
        measuredMetric:
          'All-cause death and stroke at 30 days after non-cardiac surgery, alongside the composite primary endpoint',
        inferredClaim:
          'That a met composite primary endpoint means a drug helped — POISE met its endpoint while increasing death by 33% and stroke by 117%',
        auditFlag: 'caution',
      },
      {
        id: 'met2-a3',
        category: 'conclusion_shift',
        title: 'REDUCE-AMI: after a modern, uncomplicated heart attack, no benefit at all',
        laymanSummary:
          'For decades everyone leaving hospital after a heart attack went home on a beta blocker. In 2024 a trial of five thousand patients with normal pumping function found it made no difference to death or reinfarction.',
        technicalDetails:
          'REDUCE-AMI randomised 5,020 patients at 45 centres in Sweden, Estonia and New Zealand who had an acute myocardial infarction, had undergone coronary angiography and had a left ventricular ejection fraction of at least 50%, to long-term beta blocker (metoprolol or bisoprolol) or no beta blocker, open-label. Median follow-up was 3.5 years. The primary composite of death from any cause or new myocardial infarction occurred in 199 of 2,508 (7.9%) on beta blocker and 208 of 2,512 (8.3%) without: hazard ratio 0.96 (95% CI 0.79 to 1.16), p=0.64. No secondary endpoint favoured treatment either: death from any cause 3.9% against 4.1%, cardiovascular death 1.5% against 1.3%, myocardial infarction 4.5% against 4.7%, hospitalisation for atrial fibrillation 1.1% against 1.4%, hospitalisation for heart failure 0.8% against 0.9%. The evidence the practice rested on came from trials conducted before biomarker-based diagnosis, percutaneous intervention, high-intensity statins and renin-angiotensin blockade were standard.',
        evidenceSource: 'Yndigegn T et al., REDUCE-AMI, N Engl J Med 2024;390:1372-1381 (NCT03278509)',
        doi: '10.1056/NEJMoa2401479',
        measuredMetric:
          'Composite of death from any cause or new myocardial infarction over a median 3.5 years',
        auditFlag: 'verified',
      },
      {
        id: 'met2-a4',
        category: 'failed',
        title: 'ABYSS: stopping an established beta blocker was not non-inferior to continuing',
        laymanSummary:
          'A second trial published the same year asked the mirror question: is it safe to stop a beta blocker someone is already on? The answer was no, it did not meet the bar for non-inferiority, and quality of life did not improve either.',
        technicalDetails:
          'ABYSS randomised 3,698 patients at 49 French sites with a history of myocardial infarction, an ejection fraction of at least 40% on long-term beta blocker and no cardiovascular event in the previous 6 months, to interruption (n=1,846) or continuation (n=1,852). Median time since the last infarction was 2.9 years and median follow-up 3.0 years. The primary composite of death, non-fatal myocardial infarction, non-fatal stroke or cardiovascular hospitalisation occurred in 432 of 1,812 (23.8%) in the interruption group against 384 of 1,821 (21.1%) in the continuation group: risk difference 2.8 percentage points (95% CI under 0.1 to 5.5), hazard ratio 1.16 (1.01 to 1.33), p=0.44 for non-inferiority against a 3-percentage-point margin. Interruption did not improve quality of life on the EQ-5D. REDUCE-AMI and ABYSS are not in conflict: one asked whether to start, the other whether to stop.',
        evidenceSource: 'Silvain J et al., ABYSS, N Engl J Med 2024;391:1277-1286',
        doi: '10.1056/NEJMoa2404204',
        measuredMetric:
          'Composite of death, non-fatal infarction, non-fatal stroke or cardiovascular hospitalisation, interruption versus continuation',
        auditFlag: 'verified',
      },
      {
        id: 'met2-a5',
        category: 'failed',
        title: 'COMMIT: in 45,852 patients, neither co-primary endpoint moved',
        laymanSummary:
          'The largest trial of early beta blockade in acute heart attack found fewer reinfarctions and fewer dangerous rhythms, and exactly as many extra cases of circulatory collapse. Neither of the two main endpoints was reduced.',
        technicalDetails:
          'COMMIT/CCS-2 randomised 45,852 patients admitted within 24 hours of suspected acute myocardial infarction across 1,250 hospitals to metoprolol (up to 15 mg intravenous then 200 mg oral daily; n=22,929) or matching placebo (n=22,923), continued for up to 4 weeks. Neither co-primary outcome was significantly reduced: death, reinfarction or cardiac arrest occurred in 2,166 (9.4%) against 2,261 (9.9%), odds ratio 0.96 (95% CI 0.90 to 1.01), p=0.1; death alone in 1,774 (7.7%) against 1,797 (7.8%), 0.99 (0.92 to 1.05), p=0.69. Metoprolol produced 5 fewer reinfarctions per 1,000 treated (2.0% against 2.5%, p=0.001) and 5 fewer ventricular fibrillations per 1,000 (2.5% against 3.0%, p=0.001), counterbalanced by 11 more cases of cardiogenic shock per 1,000 (5.0% against 3.9%, odds ratio 1.30, 1.19 to 1.41, p<0.00001). The shock excess fell in days 0 to 1; the benefits emerged gradually afterwards. Net effect was significantly adverse on days 0 to 1 and significantly beneficial thereafter.',
        evidenceSource:
          'COMMIT collaborative group, Lancet 2005;366:1622-1632 (NCT00222573)',
        doi: '10.1016/S0140-6736(05)67661-1',
        measuredMetric:
          'Death, reinfarction or cardiac arrest, and death alone, during up to 4 weeks of treatment',
        auditFlag: 'verified',
      },
      {
        id: 'met2-a6',
        category: 'inferred',
        title: 'The two metoprolol salts are treated as one drug and their evidence is not shared',
        laymanSummary:
          'The survival benefit in heart failure was shown for the extended-release succinate salt. The immediate-release tartrate is a different product and does not carry that indication.',
        technicalDetails:
          'MERIT-HF studied metoprolol CR/XL, the controlled-release succinate formulation, dosed once daily and up-titrated over 8 weeks toward 200 mg. The US heart failure indication is written for the extended-release succinate product, not for the tartrate. The two salts differ in solubility, release profile and dosing frequency, and the peak-to-trough exposure ratio differs correspondingly — which matters for a drug whose beta-1 selectivity is concentration-dependent. Extrapolating the MERIT-HF mortality result to immediate-release metoprolol tartrate is an inference across formulations, not a finding, and prescribing databases that list "metoprolol" without the salt erase the distinction.',
        evidenceSource:
          'MERIT-HF Study Group, Lancet 1999;353:2001-2007; Drugs@FDA TOPROL-XL NDA 019962 and LOPRESSOR NDA 017963',
        doi: '10.1016/S0140-6736(99)04440-2',
        inferredClaim:
          'That the MERIT-HF mortality benefit applies to immediate-release metoprolol tartrate — a cross-formulation extrapolation from a trial that studied the extended-release succinate',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed completely, then mostly destroyed by one liver enzyme',
        laymanDesc:
          'Almost all of the tablet is absorbed, but a single enzyme in the liver removes most of it before it reaches the circulation. People who inherit a weak version of that enzyme end up with several times more drug.',
        molecularDetail:
          'Absorption is essentially complete, but first-pass metabolism leaves systemic bioavailability around 50% for the tartrate. Clearance is dominated by CYP2D6, which is highly polymorphic: poor metabolisers have several-fold higher exposure and a longer half-life, and the enantiomers are cleared at different rates so the active (S)-fraction shifts as well.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches beta-1 receptors on the outside of heart muscle cells',
        laymanDesc:
          'The receptors it blocks sit on the surface of heart muscle cells and on kidney cells that release the hormone starting the blood-pressure cascade.',
        molecularDetail:
          'Beta-1 adrenergic receptors are class A G-protein-coupled receptors on cardiac myocyte sarcolemma and on renal juxtaglomerular cells. Beta-2 receptors, which metoprolol blocks about 70-fold less avidly at low exposure, predominate in bronchial and vascular smooth muscle — the selectivity margin that matters in airways disease and that narrows as dose rises.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the adrenaline pocket without switching anything on',
        laymanDesc:
          'The drug fits the same slot adrenaline uses but does not activate it, so as long as it is sitting there the body\'s own adrenaline has nowhere to act.',
        molecularDetail:
          'Metoprolol is a competitive, reversible antagonist at the orthosteric catecholamine site, with essentially no intrinsic sympathomimetic activity. Because the antagonism is competitive, a sufficiently large surge of endogenous catecholamine can still displace it — which is the pharmacological basis of rebound after abrupt withdrawal, on receptors that chronic blockade has upregulated.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Cyclic AMP falls, so the heart slows and contracts less forcefully',
        laymanDesc:
          'The blocked receptor stops producing its internal messenger. Calcium handling slows, the heart rate falls, each beat is less forceful, and the heart\'s oxygen demand drops.',
        molecularDetail:
          'Loss of Gs-mediated adenylate cyclase activation lowers cyclic AMP and protein kinase A activity, reducing phosphorylation of L-type calcium channels, phospholamban and ryanodine receptors. Heart rate, contractility and atrioventricular conduction velocity all fall, cutting myocardial oxygen consumption. In the kidney, reduced beta-1 signalling on juxtaglomerular cells lowers renin release.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In chronic heart failure that produced a third fewer deaths — and elsewhere, harm',
        laymanDesc:
          'Where the heart has been under constant adrenaline drive for months, removing that drive lets it recover, and deaths fall. Where the body needs adrenaline right now — during surgery, or in a heart already tipping into shock — blocking it costs lives.',
        molecularDetail:
          'In MERIT-HF, all-cause mortality was 7.2% per patient-year on metoprolol CR/XL against 11.0% on placebo (RR 0.66, p=0.00009). In POISE, 30-day mortality was 3.1% against 2.3% (HR 1.33) and stroke 1.0% against 0.5% (HR 2.17). In COMMIT, 11 extra cases of cardiogenic shock per 1,000 offset 5 fewer reinfarctions and 5 fewer ventricular fibrillations.',
        iconName: 'Split',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'MERIT-HF',
        phase: 'Randomised double-blind placebo-controlled trial, stopped early, mean 1 year',
        sampleSize: 3991,
        primaryEndpoint: 'All-cause mortality in chronic heart failure with ejection fraction ≤0.40',
        endpointMet: true,
        statisticalPValue:
          'RR 0.66 (95% CI 0.53-0.81), P = 0.00009; P = 0.0062 adjusted for interim analyses',
        unreportedAdverseSignals:
          'The trial was stopped early for benefit, which inflates measured effect sizes. The result belongs to the extended-release succinate formulation only.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'POISE (NCT00182039)',
        phase: 'Randomised double-blind placebo-controlled trial, 30 days',
        sampleSize: 8351,
        primaryEndpoint:
          'Composite of cardiovascular death, non-fatal myocardial infarction and non-fatal cardiac arrest after non-cardiac surgery',
        endpointMet: true,
        statisticalPValue: 'HR 0.84 (95% CI 0.70-0.99), P = 0.0399',
        unreportedAdverseSignals:
          'All-cause death 3.1% against 2.3% (HR 1.33, p=0.0317) and stroke 1.0% against 0.5% (HR 2.17, p=0.0053). The endpoint was met and the drug caused net harm.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'REDUCE-AMI (NCT03278509)',
        phase: 'Randomised open-label registry-based trial, median 3.5 years',
        sampleSize: 5020,
        primaryEndpoint:
          'Death from any cause or new myocardial infarction after acute infarction with ejection fraction ≥50%',
        endpointMet: false,
        statisticalPValue: 'HR 0.96 (95% CI 0.79-1.16), P = 0.64',
        unreportedAdverseSignals:
          'No secondary endpoint favoured treatment either. The trial was open-label, and 95.4% of participants were Swedish.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'ABYSS',
        phase: 'Randomised open-label non-inferiority trial, median 3.0 years',
        sampleSize: 3698,
        primaryEndpoint:
          'Composite of death, non-fatal infarction, non-fatal stroke or cardiovascular hospitalisation, interruption versus continuation',
        endpointMet: false,
        statisticalPValue:
          'HR 1.16 (95% CI 1.01-1.33); P = 0.44 for non-inferiority — the non-inferiority margin was not met',
        unreportedAdverseSignals:
          'Interruption did not improve quality of life, which was the stated reason for asking the question.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'COMMIT/CCS-2 (NCT00222573)',
        phase: 'Randomised placebo-controlled trial, up to 4 weeks in hospital',
        sampleSize: 45852,
        primaryEndpoint:
          'Co-primary: death, reinfarction or cardiac arrest; and death from any cause during treatment',
        endpointMet: false,
        statisticalPValue:
          'OR 0.96 (95% CI 0.90-1.01), P = 0.1 for the composite; OR 0.99 (0.92-1.05), P = 0.69 for death',
        unreportedAdverseSignals:
          '11 more cases of cardiogenic shock per 1,000 treated (OR 1.30, p<0.00001), concentrated in the first day, against 5 fewer reinfarctions and 5 fewer ventricular fibrillations.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '145 deaths against 217 in 3,991 chronic heart failure patients over a mean 1 year, relative risk 0.66',
        '129 deaths against 97 and 41 strokes against 19 in 8,351 patients given it before non-cardiac surgery',
        '11 extra cases of cardiogenic shock per 1,000 in 45,852 patients treated early after myocardial infarction',
        'No difference in death or reinfarction in 5,020 patients with preserved ejection fraction after a modern heart attack',
      ],
      unsupportedInferences: [
        'That the MERIT-HF survival benefit extends to immediate-release metoprolol tartrate — a cross-formulation extrapolation',
        'That a met composite primary endpoint means net benefit — POISE met its endpoint while increasing death and stroke',
        'That the pre-2000 post-infarction beta blocker evidence applies to patients treated with modern reperfusion, statins and renin-angiotensin blockade — REDUCE-AMI tested that and found no benefit',
        'That REDUCE-AMI licenses stopping beta blockers in people already on them — ABYSS tested that separately and failed to show non-inferiority',
      ],
      whatFailedInitially: [
        'POISE: fewer myocardial infarctions, 33% more deaths and 117% more strokes, and an explicit author conclusion that patients would not accept the trade',
        'COMMIT: neither co-primary endpoint reduced in 45,852 patients, with the benefit and the harm arriving at different times',
        'REDUCE-AMI: a practice followed for four decades produced a hazard ratio of 0.96 when finally tested in the modern era',
      ],
      realWorldOutcome: [
        'Among the most-dispensed prescription drugs in the world, and on the WHO Model List of Essential Medicines',
        'US$0.019 per 50 mg metoprolol tartrate tablet and US$0.057 per 50 mg extended-release succinate tablet at United States pharmacy acquisition cost, effective 19 August 2026',
        'COMMIT changed practice from starting beta blockade immediately on admission to waiting until the patient is haemodynamically stable',
      ],
    },
    deliverySystem: {
      type:
        'Oral immediate-release tablet (tartrate), oral extended-release tablet (succinate), and intravenous solution for acute use',
      description:
        'The tartrate is taken with or immediately after food and is usually twice daily; the succinate is a controlled-release multiple-unit pellet system taken once daily and is the formulation with the heart failure evidence. The two are not interchangeable milligram for milligram and do not carry the same indications.',
      safetyProfile:
        'The US label warns explicitly against abrupt cessation in patients with coronary artery disease, because chronic blockade upregulates the receptor and sudden removal can precipitate angina or infarction. Bradycardia, fatigue, dizziness and cold extremities are common. Beta-1 selectivity is relative and is lost at higher exposure, so bronchospasm is a real risk in asthma. Blockade can mask the adrenergic warning symptoms of hypoglycaemia. Clearance is by CYP2D6, so genotype and CYP2D6 inhibitors substantially change exposure.',
    },
    commonQuestions: [
      {
        q: 'I had a heart attack. Do I still need this?',
        a: 'That depends on your ejection fraction, and the answer changed in 2024. REDUCE-AMI randomised 5,020 people who had a heart attack, had a coronary angiogram and had a pumping function of at least 50%, to a beta blocker or none, and followed them a median of 3.5 years. Death or new infarction occurred in 7.9% on the drug and 8.3% without: hazard ratio 0.96, p=0.64. No secondary endpoint favoured treatment either. If your ejection fraction is reduced, that trial does not apply to you and MERIT-HF very much does. And if you are already established on a beta blocker, ABYSS is the relevant trial rather than REDUCE-AMI, and it did not support stopping.',
        auditNote:
          'Two large trials on the same drug in the same year, answering the start question and the stop question, with different answers. Neither one alone settles what a given person should do.',
      },
      {
        q: 'How can a drug help my heart failure by slowing my heart down?',
        a: 'Because in chronic heart failure the adrenaline drive has been switched on continuously for months and is itself damaging the muscle. The failing heart compensates by being whipped harder, and that compensation costs oxygen, provokes arrhythmia and drives remodelling. Taking the whip away lets the muscle recover, which is why the dose has to be started very low and raised over about eight weeks — the initial effect of removing the drive is that the heart pumps less well, and only later does it pump better. In MERIT-HF that up-titration ran from 12.5 mg to a target of 200 mg over 8 weeks, and the mortality difference was 145 deaths against 217.',
      },
      {
        q: 'Why is a drug that met its primary endpoint in surgery not used before surgery?',
        a: 'POISE is the reason, and it is the best argument on this site for reading past a headline. The trial gave extended-release metoprolol to 8,351 people before non-cardiac surgery and met its composite primary endpoint: 5.8% against 6.9%, hazard ratio 0.84, p=0.0399. Heart attacks fell by a quarter. But deaths rose from 97 to 129 (hazard ratio 1.33) and strokes rose from 19 to 41 (hazard ratio 2.17). A composite endpoint counts each event once; it does not weigh a prevented heart attack against a caused stroke. The authors wrote the conclusion plainly: patients are unlikely to accept those risks.',
        auditNote:
          'This is the clearest case on the site of "primary endpoint met" and "the drug harmed people" being simultaneously true.',
      },
      {
        q: 'Is the tartrate the same as the succinate?',
        a: 'Not for the purpose that matters most. MERIT-HF, the trial with the mortality result, used metoprolol CR/XL — the controlled-release succinate, once daily, up-titrated over eight weeks. The heart failure indication in the US label belongs to the extended-release succinate product. The immediate-release tartrate is a different salt with different solubility, a different release profile and usually twice-daily dosing, and it does not carry that indication. For blood pressure and angina both are used; for heart failure survival, the evidence is formulation-specific and this page does not extend it.',
      },
      {
        q: 'Why do I feel so tired on this?',
        a: 'Because the drug is doing exactly what it is designed to do. Blocking beta-1 receptors reduces the heart rate rise that normally accompanies exertion, so the cardiac output available for exercise is capped, and the sensation is fatigue and reduced exercise tolerance. It is a pharmacological effect rather than a sign of something going wrong. What it is worth checking is whether you are a CYP2D6 poor metaboliser: metoprolol is cleared almost entirely by that enzyme, poor metabolisers reach several times the exposure of extensive metabolisers on the same dose, and the same genetic difference also erodes the beta-1 selectivity that keeps the drug out of your airways.',
      },
      {
        q: 'Why does this page show no manufacturing cost?',
        a: 'Because no verifiable per-dose synthesis cost for metoprolol could be cited. The prices shown are pharmacy acquisition costs from the CMS NADAC file effective 19 August 2026: about 1.9 cents for a 50 mg tartrate tablet and about 5.7 cents for a 50 mg extended-release succinate tablet. The gap between those two numbers is a formulation difference, not a molecule difference, and it is one of the few places on this site where a price comparison illustrates something real about manufacturing rather than about patents.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'MERIT-HF Study Group. Effect of metoprolol CR/XL in chronic heart failure: Metoprolol CR/XL Randomised Intervention Trial in Congestive Heart Failure (MERIT-HF). Lancet 1999;353:2001-2007',
        identifier: '10.1016/S0140-6736(99)04440-2',
        kind: 'doi',
      },
      {
        label:
          'POISE Study Group. Effects of extended-release metoprolol succinate in patients undergoing non-cardiac surgery (POISE trial). Lancet 2008;371:1839-1847',
        identifier: '10.1016/S0140-6736(08)60601-7',
        kind: 'doi',
      },
      {
        label:
          'Yndigegn T et al. Beta-Blockers after Myocardial Infarction and Preserved Ejection Fraction (REDUCE-AMI). N Engl J Med 2024;390:1372-1381',
        identifier: '10.1056/NEJMoa2401479',
        kind: 'doi',
      },
      {
        label:
          'Silvain J et al. Beta-Blocker Interruption or Continuation after Myocardial Infarction (ABYSS). N Engl J Med 2024;391:1277-1286',
        identifier: '10.1056/NEJMoa2404204',
        kind: 'doi',
      },
      {
        label:
          'COMMIT collaborative group. Early intravenous then oral metoprolol in 45,852 patients with acute myocardial infarction (COMMIT/CCS-2). Lancet 2005;366:1622-1632',
        identifier: '10.1016/S0140-6736(05)67661-1',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: TOPROL-XL (metoprolol succinate extended-release), NDA 019962, original approval 10 January 1992',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019962',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: LOPRESSOR (metoprolol tartrate), NDA 017963, original approval 7 August 1978',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=017963',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 4171 — metoprolol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4171',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Whey protein — the supplement effect is real, replicated, and 0.30 kg of fat-free mass. Above
  // 1.62 g/kg/day of total protein it stops entirely, and the anabolic window did not survive
  // controlling for total intake.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'whey-protein',
    name: 'Whey protein',
    tradeName:
      'Sold as whey concentrate, whey isolate and whey hydrolysate — three processing grades of the same starting material',
    sponsor:
      'No single sponsor — the soluble protein fraction of milk, a by-product of cheese manufacture, filtered and dried by many manufacturers',
    targetGene: 'MTOR',
    targetProtein:
      'mTOR complex 1, the nutrient-sensing kinase that switches on muscle protein synthesis. The specific input is leucine, sensed by Sestrin2 upstream of GATOR2, which relieves inhibition of mTORC1 at the lysosome. Whey matters because of how much leucine it delivers and how fast, not because whey protein is itself anabolic.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for muscle gain, recovery and satiety. Not approved by the FDA or EMA for any indication. Hydrolysed whey formulas are separately used clinically as hypoallergenic infant feeds and in enteral nutrition, which is a different product for a different purpose.',
    patientFriendlyIndication:
      'Taken after training to build muscle, and generally to hit a daily protein target',
    conditionContext: {
      conditionExplainer:
        'Muscle is in constant turnover. Resistance training raises the rate at which muscle protein is broken down and the rate at which it is built, and net gain over months depends on the balance. Eating protein raises the building rate for a few hours, and the amino acid leucine is the specific chemical trigger the cell reads.',
      whyItMatters:
        'Whey is the biggest-selling supplement category in the world and the one where the underlying science is most solid — and where the marketing has nonetheless invented several things the science does not support. Whey does raise muscle protein synthesis more than casein or soy. Adding it to a training programme does add muscle. The amount it adds, and the point at which adding more stops doing anything, are both known and both smaller than the aisle implies.',
      whoTakesThis:
        'Lifters and athletes, older adults being treated for sarcopenia, hospital patients on enteral nutrition, and a very large number of people who simply find a shake more convenient than cooking.',
      clinicalGoals:
        'Trials measured fractional rates of mixed muscle protein synthesis by stable-isotope infusion, one-repetition maximum strength, fat-free mass by DXA, muscle fibre cross-sectional area from biopsy, mid-femur cross-sectional area, and glomerular filtration rate in the safety literature.',
    },
    oneSentenceVerdict:
      'Across 49 trials in 1,863 people, protein supplementation added 0.30 kg of fat-free mass and 2.49 kg of one-repetition maximum on top of resistance training — a real, replicated, modest effect that stops entirely once total protein intake passes 1.62 g/kg/day, and the post-workout anabolic window disappeared once total daily intake was controlled for.',
    laymanHowItWorks:
      'Whey is the watery part of milk left behind when cheese is made, dried into a powder. It is digested unusually fast and is unusually rich in leucine, an amino acid that acts as a switch: when enough of it arrives in the blood at once, a sensor inside the muscle cell turns on the machinery that builds new protein. That switch stays on for a few hours and then turns off regardless of how much more protein you eat, which is why a very large dose is not proportionally better than a moderate one — the surplus is simply burned for energy.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 78,
    anatomicalSite:
      'Skeletal muscle fibre cytoplasm, at the lysosomal surface where mTORC1 is activated; digestion and absorption in the proximal small intestine',
    substitutes: {
      summary:
        'Whey has no advantage over food that survives contact with the meta-analysis. It is faster and more leucine-dense per gram than most whole foods, which matters acutely; over a training block, total daily protein is what predicts hypertrophy, and food supplies that perfectly well.',
      conventionalRx: [
        {
          name: 'Extensively hydrolysed whey infant formula',
          class: 'Medical nutrition, hypoallergenic feed',
          howItCompares:
            'The same starting material cut into peptides small enough to avoid triggering cow\'s milk protein allergy. A genuine clinical product with a genuine indication. It is not evidence for anything about muscle.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: solves a defined clinical problem. Cons: the word "hydrolysate" on a sports tub borrows credibility from this use, and hydrolysing whey for an adult buys speed of digestion, not a different biology.',
        },
      ],
      naturalFoods: [
        {
          name: 'Milk, cheese, yoghurt and any complete protein food',
          activeCompound: 'Leucine — about 10 to 11 percent of whey protein by weight',
          biologicalMechanism:
            'The cell senses leucine, not whey. Any food that delivers enough leucine in one sitting triggers the same mTORC1 response. Whey does it faster and with less volume, which is a convenience advantage and, in older adults with blunted anabolic sensitivity, sometimes a real one.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: Moore et al. found 20 g of whole egg protein maximally stimulated muscle protein synthesis after resistance exercise, and 40 g did not do more.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Soy protein isolate, as the tested comparator',
          activeCompound: 'Lower leucine content, still rapidly digested',
          biologicalMechanism:
            'Tang et al. measured it directly. After resistance exercise, muscle protein synthesis on whey was about 31% greater than on soy and about 122% greater than on casein, with soy sitting between the two — an ordering that tracks digestion speed and leucine delivery rather than any unique property of dairy.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Add up total daily protein before buying anything',
          action:
            'The meta-regression that established the supplement effect also established where it stops: beyond a total intake of 1.62 g per kg of body mass per day, additional protein produced no further training-induced gain in fat-free mass.',
          patientImpact:
            'Someone already eating above that threshold from food is buying a supplement whose measured incremental effect on fat-free mass is zero, at any dose.',
          clinicalPrecaution:
            'The same analysis found the benefit shrinks with age and is larger in people already resistance-trained, which is the opposite of the pattern most marketing assumes.',
        },
        {
          name: 'The post-workout window is not a window',
          action:
            'Check whether a protein-timing claim controlled for total daily protein intake. The pooled effect looks real until it does, and then it is not there.',
          patientImpact:
            'In a meta-regression of 20 strength studies and 23 hypertrophy studies, a simple pooled analysis showed a small-to-moderate hypertrophy effect of protein timing. In the full model controlling for covariates, no significant difference remained for strength or hypertrophy, and total protein intake was the strongest predictor of effect size.',
          clinicalPrecaution:
            'This is a clean example of a confounded pooled result: timing groups ate more protein, and it was the protein doing the work.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)C[C@@H](C(=O)O)N',
      chemicalFormula: 'C6H13NO2',
      molecularWeight:
        '131.17 g/mol. This is L-leucine, not whey. Whey protein is a mixture of hundreds of proteins — beta-lactoglobulin, alpha-lactalbumin, immunoglobulins, serum albumin, lactoferrin — with no single molecule to draw. Leucine is the marker the literature actually tracks, because it is the amino acid the muscle cell senses, and whey is distinguished from other proteins chiefly by how much of it whey delivers and how quickly.',
      structureSource: {
        label: 'PubChem CID 6106 — L-Leucine, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6106',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'whey-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amino acid profile and nitrogen-spiking check, plus a heavy metal panel',
          description:
            'Protein content on a supplement label is usually derived from total nitrogen, and total nitrogen can be inflated by adding cheap nitrogen-rich compounds that are not protein. The only assay that catches this is a full amino acid profile, which also gives the leucine content that actually determines the biological effect. Run a heavy metal panel in the same pass, because independent testing has repeatedly found arsenic, cadmium, mercury and lead in this product category.',
          reagentsAndBuffer:
            'Acid hydrolysis in 6 M HCl at 110 degrees C for 24 h; amino acid analysis by ion-exchange chromatography with ninhydrin detection; separate performic acid oxidation for cysteine and methionine; Kjeldahl nitrogen for comparison against the amino acid sum; ICP-MS for arsenic, cadmium, mercury and lead against certified standards',
        },
        {
          id: 'whey-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the stable-isotope tracer infusion',
          description:
            'Muscle protein synthesis is a rate, not a quantity, and it can only be measured by tracking a labelled amino acid into muscle protein over time. This is the technique that produced every number in this dossier about whey versus casein versus soy, and it is why those numbers are trustworthy in a way that scale weight is not.',
          dependsOnStepId: 'whey-w1',
          reagentsAndBuffer:
            'L-[ring-13C6]phenylalanine for the primed constant infusion; [1-13C]leucine for the parallel oxidation measurement; sterile pyrogen-free preparation; priming dose calculated from the subject\'s estimated pool size; background enrichment sampled before infusion',
        },
        {
          id: 'whey-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Muscle biopsy processing and isolation of the mixed muscle protein fraction',
          description:
            'Separate the bound protein pool from the free intracellular amino acid pool, because tracer in the free pool is the precursor and tracer in the bound pool is the product. Confusing the two is the commonest way a synthesis rate comes out wrong, and it is why the biopsy handling is a validated step rather than a technicality.',
          dependsOnStepId: 'whey-w2',
          reagentsAndBuffer:
            'Vastus lateralis needle biopsy under local anaesthesia; homogenisation in ice-cold perchloric acid; separation of intracellular free amino acids from the protein pellet; repeated washing of the pellet; acid hydrolysis of the mixed muscle protein fraction; derivatisation for GC-combustion-isotope ratio mass spectrometry',
        },
        {
          id: 'whey-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Leucine sensing at the lysosome, with the Sestrin2 arm',
          description:
            'Test whether the anabolic signal is leucine-specific rather than protein-specific by supplying matched essential amino acids with and without leucine, and by disrupting the sensor. If mTORC1 activation tracks leucine and not total protein, then the entire whey-versus-casein-versus-soy ordering has a single explanation.',
          dependsOnStepId: 'whey-w3',
          reagentsAndBuffer:
            'C2C12 myotubes and primary human myotubes; amino-acid-free DMEM baseline; leucine add-back at graded concentrations; Sestrin2 knockdown by siRNA; rapamycin and Torin1 as mTORC1 inhibitors; phospho-p70S6K Thr389 and phospho-4E-BP1 immunoblotting; lysosomal mTOR co-localisation by immunofluorescence',
        },
        {
          id: 'whey-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Fractional synthetic rate alongside a long-term body composition endpoint',
          description:
            'Report the acute synthesis rate and the chronic composition change together, because they do not agree as often as the field implies. Whey raises the acute rate substantially more than casein; the chronic supplementation meta-analysis finds 0.30 kg of fat-free mass across all protein types. An acute mechanistic win is not a training outcome.',
          dependsOnStepId: 'whey-w4',
          reagentsAndBuffer:
            'GC-combustion-IRMS for tracer enrichment in the bound protein pool; fractional synthetic rate expressed as percent per hour; DXA for fat-free mass with a standardised hydration and fasting protocol; muscle fibre cross-sectional area by immunohistochemistry on the same biopsy',
        },
      ],
    },
    keyAudits: [
      {
        id: 'whey-a1',
        category: 'measured',
        title: 'The supplement effect is real, replicated, and 0.30 kg of fat-free mass',
        laymanSummary:
          'Across 49 randomised trials in 1,863 people, adding protein to a training programme produced measurably more muscle and strength than training alone. The amount was about a third of a kilogram of lean mass.',
        technicalDetails:
          'Morton and colleagues meta-analysed randomised controlled trials with at least six weeks of resistance training plus protein supplementation. Across 49 studies and 1,863 participants, protein supplementation significantly increased one-repetition-maximum strength by 2.49 kg (95% CI 0.64 to 4.33), fat-free mass by 0.30 kg (95% CI 0.09 to 0.52), muscle fibre cross-sectional area by 310 square micrometres (95% CI 51 to 570) and mid-femur cross-sectional area by 7.2 square millimetres (95% CI 0.20 to 14.30). Every one of those is statistically significant and every one is small. Two meta-regression findings matter as much as the headline: the effect on fat-free mass fell with increasing age (-0.01 kg per year, P = 0.002) and was larger in people already resistance-trained (+0.75 kg, P = 0.03). The population most often sold protein for sarcopenia is the population in which the supplement effect is weakest.',
        evidenceSource: 'Morton RW et al. Br J Sports Med 2018;52:376-384',
        doi: '10.1136/bjsports-2017-097608',
        measuredMetric:
          'Change in fat-free mass, one-repetition maximum, muscle fibre cross-sectional area and mid-femur cross-sectional area',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a2',
        category: 'measured',
        title: 'It stops working above 1.62 g per kg per day, and the analysis says so exactly',
        laymanSummary:
          'The same meta-analysis found the point where extra protein stops adding anything: once total daily intake passes about 1.6 grams per kilogram of body weight, more protein produced no further muscle gain.',
        technicalDetails:
          'A two-phase break point analysis across the 49 included studies determined that protein supplementation beyond a total protein intake of 1.62 g/kg/day resulted in no further resistance-training-induced gains in fat-free mass. This is not an opinion or a rule of thumb — it is a break point estimated from the pooled data, and it defines the exact boundary of the product\'s usefulness. A person already eating above that from food is, on the best available evidence, buying a supplement with a measured incremental effect of zero on fat-free mass, no matter how much of it they take. The finding also reframes the whole category: whey is not a muscle-building agent, it is a convenient way to reach a threshold, and past the threshold it is protein-flavoured food.',
        evidenceSource: 'Morton RW et al. Br J Sports Med 2018;52:376-384',
        doi: '10.1136/bjsports-2017-097608',
        measuredMetric:
          'Two-phase break point in the relationship between total protein intake and change in fat-free mass',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a3',
        category: 'measured',
        title: 'Whey does beat casein and soy acutely, by 122% and 31%',
        laymanSummary:
          'A stable-isotope study measured muscle protein synthesis directly after equal amounts of essential amino acids from whey, casein or soy. Whey produced by far the biggest response.',
        technicalDetails:
          'Tang and colleagues gave three groups of six healthy young men drinks matched for essential amino acid content at 10 g, as whey hydrolysate, micellar casein or soy protein isolate, after unilateral leg resistance exercise, with mixed muscle protein synthesis measured by primed constant infusion of L-[ring-13C6]phenylalanine. Whey produced larger increases in blood essential amino acids, branched-chain amino acids and leucine than either comparator (P < 0.05). At rest, mixed muscle protein synthesis was 0.091 +/- 0.015 %/h on whey, 0.078 +/- 0.014 on soy and 0.047 +/- 0.008 on casein — whey approximately 93% greater than casein (P < 0.01) and 18% greater than soy (P = 0.067). After exercise the ordering held: whey approximately 122% greater than casein (P < 0.01) and 31% greater than soy (P < 0.05). This is a genuine, mechanistically clean advantage for whey, and it is an acute synthesis rate in six men per group, not a training outcome. The chronic meta-analysis that measured training outcomes did not separate protein sources.',
        evidenceSource: 'Tang JE, Moore DR, Kujbida GW, Tarnopolsky MA, Phillips SM. J Appl Physiol 2009;107:987-992',
        doi: '10.1152/japplphysiol.00076.2009',
        measuredMetric:
          'Fractional rate of mixed muscle protein synthesis, percent per hour, at rest and after resistance exercise',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a4',
        category: 'conclusion_shift',
        title: 'The anabolic window vanished when total protein was controlled for',
        laymanSummary:
          'The belief that protein must be taken within an hour of training looked supported until researchers accounted for the fact that the timing groups also ate more protein overall. Then the effect disappeared.',
        technicalDetails:
          'Schoenfeld, Aragon and Krieger ran a multi-level meta-regression of randomised controlled trials of protein timing. The strength analysis comprised 478 subjects and 96 effect sizes nested within 41 groups and 20 studies; the hypertrophy analysis comprised 525 subjects and 132 effect sizes nested within 47 groups and 23 studies. A simple pooled analysis without controlling for covariates showed a small-to-moderate effect of protein timing on hypertrophy and no significant effect on strength. In the full meta-regression model controlling for all covariates, no significant difference was found between treatment and control for either strength or hypertrophy, and the reduced model did not differ from the full model. Total protein intake was the strongest predictor of hypertrophy effect size. The authors wrote that these results refute the commonly held belief that timing of protein intake around a training session is critical. It is one of the cleanest published demonstrations that an apparently real effect was a confounder wearing a mechanism.',
        evidenceSource: 'Schoenfeld BJ, Aragon AA, Krieger JW. J Int Soc Sports Nutr 2013;10:53',
        doi: '10.1186/1550-2783-10-53',
        measuredMetric:
          'Effect size for muscle strength and hypertrophy attributable to protein timing, before and after covariate control',
        inferredClaim:
          'That protein consumed close to a training session produces adaptations beyond those explained by total daily protein intake',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a5',
        category: 'inferred',
        title: 'Twenty grams maxed out the response, and the surplus was oxidised',
        laymanSummary:
          'A dose-response study found muscle protein synthesis peaked at 20 grams of protein after training. Forty grams did not build more; it was burned for energy instead.',
        technicalDetails:
          'Moore and colleagues had six healthy young men perform intense leg resistance exercise on five separate occasions and consume, in randomised order, drinks containing 0, 5, 10, 20 or 40 g of whole egg protein, with protein synthesis and whole-body leucine oxidation measured over four hours by primed constant infusion of [1-13C]leucine. Muscle protein synthesis showed a dose response and was maximally stimulated at 20 g. Albumin synthesis also plateaued at 20 g. Leucine oxidation increased significantly after 20 and 40 g — that is, protein consumed above the threshold was demonstrably burned rather than incorporated. Phosphorylation of p70S6K, ribosomal protein S6 and eIF2B-epsilon was unaffected by any dose, which the authors read as evidence that the stimulation depends on amino acid availability rather than on further signalling amplification. Six men and whole egg protein is a narrow base, and larger doses matter more in older adults and after whole-body training. But the shape of the curve — a plateau with oxidation of the excess — is the single most useful fact about protein dosing and the one the 50-gram serving scoop ignores.',
        evidenceSource: 'Moore DR et al. Am J Clin Nutr 2009;89:161-168',
        doi: '10.3945/ajcn.2008.26401',
        measuredMetric:
          'Muscle and albumin protein synthesis and whole-body leucine oxidation across 0, 5, 10, 20 and 40 g protein doses',
        inferredClaim:
          'That a larger protein serving produces a proportionally larger anabolic response, when synthesis plateaued at 20 g and the surplus was oxidised',
        auditFlag: 'caution',
      },
      {
        id: 'whey-a6',
        category: 'conclusion_shift',
        title: 'The kidney warning did not survive the meta-analysis',
        laymanSummary:
          'High-protein diets were long said to damage kidneys. Pooling 28 randomised trials in healthy adults found no difference in the change in kidney filtration rate.',
        technicalDetails:
          'Devries and colleagues systematically reviewed randomised controlled trials longer than four days comparing higher-protein intakes (at least 1.5 g/kg body weight, or at least 20% of energy, or at least 100 g/day) against normal or lower protein intakes, in adults without kidney disease, with glomerular filtration rate as the outcome. Twenty-eight trials with 1,358 participants were analysed. The post-intervention comparison showed a trivial effect for GFR to be higher after higher-protein intakes (standardised mean difference 0.19, 95% CI 0.07 to 0.31, P = 0.002), while the change in GFR from pre- to post-intervention did not differ between interventions (SMD 0.11, 95% CI -0.05 to 0.27, P = 0.16). There was a linear relation between protein intake and post-intervention GFR (r = 0.332, P = 0.03) but not between protein intake and the change in GFR (r = 0.184, P = 0.33). The physiological reading is that a higher protein load raises filtration as an adaptive response, not as an injury. The caveat that belongs on the record: these are healthy adults, and the trials are short relative to a lifetime of habitual intake.',
        evidenceSource: 'Devries MC et al. J Nutr 2018;148:1760-1775',
        doi: '10.1093/jn/nxy197',
        measuredMetric:
          'Glomerular filtration rate, post-intervention and as change from baseline, on higher versus normal or lower protein intakes',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a7',
        category: 'inferred',
        title: 'Heavy metals: found repeatedly, then assessed as safe by industry-adjacent consultants',
        laymanSummary:
          'Consumer testing found arsenic, cadmium, mercury and lead in protein powders, with 40 percent of 133 products elevated. A follow-up risk assessment concluded the exposures were below regulatory thresholds. Its three authors all worked for the same litigation-support consultancy.',
        technicalDetails:
          'Bandara, Towle and Monnot performed a human health risk assessment responding to a Consumer Reports analysis of 15 protein powders, which had found that average heavy metal amounts in three servings per day exceeded the maximum limits proposed by the US Pharmacopeia, and to a follow-up study reporting that 40% of 133 protein powder products tested had elevated heavy metal levels. Using US EPA reference doses for arsenic and cadmium, the EPA screening level for mercury, and the EPA Adult Lead Methodology model, they calculated hazard quotients and a cumulative hazard index for each product at one and three servings per day. All hazard indices were below 1 and all modelled blood lead levels were below the CDC guidance value of 5 micrograms per decilitre. The highest hazard indices, approaching 1, were in mass-gain products; the lowest were in whey protein powders. Their conclusion was that typical intake would not result in adverse health effects. Two facts belong alongside that conclusion. First, all three authors were affiliated with Cardno ChemRisk, a consultancy whose work is frequently commissioned in product-liability contexts. Second, "hazard index below 1" is a regulatory screening threshold, not a demonstration of no effect, and the underlying contamination finding — that the metals are present, and elevated in a substantial minority of products — is not in dispute.',
        evidenceSource: 'Bandara SB, Towle KM, Monnot AD. Toxicol Rep 2020;7:1255-1262',
        doi: '10.1016/j.toxrep.2020.08.001',
        inferredClaim:
          'That a hazard index below the regulatory screening threshold, calculated by industry-adjacent consultants, closes the question of heavy metal contamination in protein powders',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Digested fast, which is the whole point of whey',
        laymanDesc:
          'Whey stays liquid in the stomach instead of clotting, so it empties quickly and floods the bloodstream with amino acids within about half an hour. Casein does the opposite.',
        molecularDetail:
          'Whey proteins remain soluble at gastric pH while casein micelles precipitate into a curd, producing a much faster gastric emptying and a sharper plasma aminoacidaemia. Tang et al. measured the consequence: blood essential amino acid, branched-chain amino acid and leucine concentrations all rose more after whey than after casein or soy (P < 0.05). Hydrolysing whey further accelerates this without changing the amino acids delivered.',
        iconName: 'Zap',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Leucine is the signal, not protein in general',
        laymanDesc:
          'The muscle cell is not counting grams of protein. It is watching for one amino acid, and when enough of it arrives at once, a switch flips.',
        molecularDetail:
          'Leucine binds Sestrin2, releasing its inhibition of GATOR2, which permits mTORC1 activation at the lysosomal surface. Whey is roughly 10 to 11 percent leucine by weight, higher than casein and considerably higher than most plant proteins, which is the single best explanation for the whey-over-soy-over-casein ordering in acute synthesis measurements.',
        iconName: 'ToggleRight',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'mTORC1 switches on the protein-building machinery',
        laymanDesc:
          'Once triggered, a master kinase turns on the cellular machinery that reads genetic instructions into new muscle protein. It stays on for a few hours.',
        molecularDetail:
          'Activated mTORC1 phosphorylates p70S6K and 4E-BP1, relieving translational repression and increasing translation initiation. Notably, Moore et al. found phosphorylation of p70S6K Thr389, ribosomal protein S6 Ser240/244 and eIF2B-epsilon Ser539 was unaffected across protein doses from 0 to 40 g, which argues the dose-response in synthesis is driven by substrate availability rather than by graded signalling.',
          iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The response saturates, and the surplus is burned',
        laymanDesc:
          'Past about twenty grams the building rate stops rising. Extra protein does not sit around waiting; it gets oxidised for energy.',
        molecularDetail:
          'Moore et al. found muscle protein synthesis and albumin synthesis both maximally stimulated at 20 g of whole egg protein after resistance exercise, with whole-body leucine oxidation rising significantly at 20 and 40 g. The plateau is a property of the anabolic response, not of absorption — the amino acids are absorbed either way, they are simply deaminated and the carbon skeletons oxidised.',
        iconName: 'Flame',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Over months this compounds into about a third of a kilogram',
        laymanDesc:
          'Repeated across a training block, the extra synthesis adds up to a small but genuine amount of additional muscle over training alone.',
        molecularDetail:
          'Across 49 randomised trials and 1,863 participants, protein supplementation added 0.30 kg of fat-free mass (95% CI 0.09 to 0.52), 2.49 kg of one-repetition maximum (95% CI 0.64 to 4.33) and 310 square micrometres of muscle fibre cross-sectional area (95% CI 51 to 570) beyond training alone — with the whole effect conditional on total protein intake being below 1.62 g/kg/day.',
        iconName: 'TrendingUp',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Morton 2018 meta-analysis of protein supplementation and resistance training',
        phase: 'Meta-analysis and meta-regression of 49 randomised controlled trials',
        sampleSize: 1863,
        primaryEndpoint: 'Change in fat-free mass and one-repetition-maximum strength',
        endpointMet: true,
        statisticalPValue:
          'FFM +0.30 kg (95% CI 0.09 to 0.52); 1RM +2.49 kg (95% CI 0.64 to 4.33); break point at 1.62 g/kg/day total protein, beyond which no further FFM gain',
        unreportedAdverseSignals:
          'Effect on fat-free mass declined with age (-0.01 kg per year, P = 0.002) and was larger in already-trained individuals (+0.75 kg, P = 0.03) — the reverse of the pattern implied by marketing aimed at beginners and older adults.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Tang 2009 — whey hydrolysate versus micellar casein versus soy isolate',
        phase: 'Randomised parallel-group stable-isotope infusion study',
        sampleSize: 18,
        primaryEndpoint:
          'Fractional rate of mixed muscle protein synthesis at rest and after resistance exercise',
        endpointMet: true,
        statisticalPValue:
          'After exercise, whey approximately 122% greater than casein (P < 0.01) and 31% greater than soy (P < 0.05); at rest 93% greater than casein (P < 0.01) and 18% greater than soy (P = 0.067)',
        unreportedAdverseSignals:
          'Six men per group and a single acute measurement. The resting whey-versus-soy comparison did not reach significance. Acute synthesis rates and long-term hypertrophy diverge often enough that this cannot be read as a training result.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Moore 2009 — ingested protein dose response after resistance exercise',
        phase: 'Randomised within-subject dose-response with stable-isotope infusion',
        sampleSize: 6,
        primaryEndpoint:
          'Muscle and albumin protein synthesis across 0, 5, 10, 20 and 40 g protein doses',
        endpointMet: true,
        statisticalPValue:
          'Maximal stimulation of muscle and albumin protein synthesis at 20 g; leucine oxidation significantly increased at 20 and 40 g',
        unreportedAdverseSignals:
          'Six young men, whole egg protein, single-limb exercise. The 20 g plateau is widely generalised to older adults and whole-body training, where the evidence suggests a higher threshold.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Schoenfeld 2013 meta-regression of protein timing',
        phase: 'Multi-level meta-regression of randomised controlled trials',
        sampleSize: 525,
        primaryEndpoint: 'Muscle strength and hypertrophy effect size attributable to protein timing',
        endpointMet: false,
        statisticalPValue:
          'Simple pooled analysis showed a small-to-moderate hypertrophy effect; in the full model controlling for covariates, no significant difference for strength or hypertrophy',
        unreportedAdverseSignals:
          'Total protein intake was the strongest predictor of hypertrophy effect size, meaning the apparent timing effect was a total-intake effect in disguise.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Devries 2018 meta-analysis of higher-protein intake and kidney function',
        phase: 'Systematic review and meta-analysis of 28 randomised controlled trials',
        sampleSize: 1358,
        primaryEndpoint: 'Glomerular filtration rate on higher versus normal or lower protein intake',
        endpointMet: false,
        statisticalPValue:
          'Post-intervention GFR SMD 0.19 (95% CI 0.07 to 0.31), P = 0.002; change in GFR SMD 0.11 (95% CI -0.05 to 0.27), P = 0.16',
        unreportedAdverseSignals:
          'Restricted to adults without kidney disease, and trials were short relative to habitual lifetime intake. Post-intervention GFR was higher on high protein, which is read as adaptive hyperfiltration rather than injury — a reading, not a measurement.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Protein supplementation added 0.30 kg fat-free mass and 2.49 kg one-repetition maximum across 49 trials in 1,863 people',
        'The break point was 1.62 g/kg/day total protein, beyond which no further fat-free mass gain occurred',
        'Whey raised post-exercise muscle protein synthesis approximately 122% above casein and 31% above soy',
        'Muscle protein synthesis plateaued at 20 g of protein, with leucine oxidation rising at 20 and 40 g',
        'Change in glomerular filtration rate did not differ between higher and lower protein intakes across 28 trials',
      ],
      unsupportedInferences: [
        'That protein must be taken in a window around training, which vanished when total daily intake was controlled for',
        'That a larger serving produces a proportionally larger response, when the response plateaued at 20 g',
        'That whey\'s acute superiority over casein and soy translates into superior long-term hypertrophy, which no chronic trial has separated',
        'That heavy metal contamination is a closed question because one industry-adjacent risk assessment computed a hazard index below 1',
      ],
      whatFailedInitially: [
        'The anabolic window, refuted in a meta-regression of 43 study groups once total protein was entered as a covariate',
        'The high-protein kidney warning, which did not survive 28 randomised trials in healthy adults',
      ],
      realWorldOutcome: [
        'Whey works, the mechanism is understood down to the amino acid, and this page says so without hedging',
        'The effect is small, is conditional on being below a total-intake threshold, and shrinks with age',
        'Protein powder is a convenience product for reaching a number, and above that number its measured incremental effect is zero',
      ],
    },
    deliverySystem: {
      type: 'Oral powder reconstituted in liquid; concentrate, isolate or hydrolysate',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy, safety or content before sale. The three grades differ by processing rather than by biology: concentrate retains more lactose and fat, isolate is filtered further to a higher protein percentage, and hydrolysate is pre-cleaved into peptides for faster absorption. All three deliver the same amino acids, and leucine content per gram of protein is nearly identical between them. Label protein content is usually derived from total nitrogen, which is inflatable by nitrogen-rich non-protein additives, so a full amino acid profile is the only assay that verifies the claim.',
      safetyProfile:
        'Bloating, flatulence and diarrhoea in lactose-intolerant users of concentrate, which isolate largely avoids. Cow\'s milk protein allergy is a genuine contraindication and is not the same as lactose intolerance. Higher protein intake does not change glomerular filtration rate in healthy adults across 28 randomised trials, but that evidence does not extend to existing chronic kidney disease, where protein restriction remains standard. Independent testing has repeatedly found arsenic, cadmium, mercury and lead in this product category, with plant-based and mass-gain formulas worse than whey; a subsequent risk assessment by industry-adjacent consultants calculated hazard indices below the regulatory screening threshold.',
    },
    commonQuestions: [
      {
        q: 'Does protein powder actually build muscle?',
        a: 'Yes, and the number is worth carrying. Across 49 randomised trials in 1,863 people, adding protein to at least six weeks of resistance training produced 0.30 kg more fat-free mass and 2.49 kg more on one-repetition maximum than training alone. Those are statistically significant and physically small. The important companion finding is the break point: beyond a total protein intake of 1.62 g per kilogram per day, additional protein produced no further gain in fat-free mass at all.',
        auditNote:
          'Whey is a convenient way to reach that threshold, not a separate anabolic agent.',
      },
      {
        q: 'Do I need to drink it right after training?',
        a: 'No. A meta-regression across 20 strength studies and 23 hypertrophy studies found that a simple pooled analysis suggested a timing effect, but once total protein intake and other covariates were entered into the model, no significant difference remained for strength or hypertrophy. Total protein intake was the strongest predictor of hypertrophy. The timing groups in those studies were eating more protein, and it was the protein doing the work.',
      },
      {
        q: 'Is whey better than casein or plant protein?',
        a: 'Acutely, yes, and by a lot: after resistance exercise, muscle protein synthesis on whey was about 122 percent higher than on casein and 31 percent higher than on soy in a stable-isotope study. The reason is leucine delivery and digestion speed, not anything unique to dairy. What has not been shown is that this acute advantage produces more muscle over a training block — the chronic meta-analysis that measured actual hypertrophy did not separate protein sources, and its effect size was the same modest 0.30 kg.',
      },
      {
        q: 'Will a big scoop work better than a small one?',
        a: 'Not for the anabolic response. A dose-response study found muscle protein synthesis maximally stimulated at 20 grams after resistance exercise, with no further increase at 40 grams, and leucine oxidation rising significantly at both — meaning the excess was measurably burned rather than built into muscle. That study used six young men and single-limb exercise, and the threshold is probably higher for older adults and whole-body sessions. But a plateau exists, and serving sizes are not set by it.',
      },
      {
        q: 'Is it bad for my kidneys?',
        a: 'Not in healthy adults, on the current evidence. Twenty-eight randomised trials in 1,358 participants without kidney disease found no difference in the change in glomerular filtration rate between higher and lower protein intakes. Post-intervention filtration was slightly higher on high protein, which is generally read as an adaptive response to a bigger nitrogen load rather than as damage. That reading is an interpretation, the trials are short, and none of it applies to someone who already has chronic kidney disease, where protein restriction remains standard care.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Moore DR et al. Ingested protein dose response of muscle and albumin protein synthesis after resistance exercise in young men. Am J Clin Nutr 2009;89:161-168',
        identifier: '10.3945/ajcn.2008.26401',
        kind: 'doi',
      },
      {
        label:
          'Tang JE, Moore DR, Kujbida GW, Tarnopolsky MA, Phillips SM. Ingestion of whey hydrolysate, casein, or soy protein isolate: effects on mixed muscle protein synthesis at rest and following resistance exercise in young men. J Appl Physiol 2009;107:987-992',
        identifier: '10.1152/japplphysiol.00076.2009',
        kind: 'doi',
      },
      {
        label:
          'Schoenfeld BJ, Aragon AA, Krieger JW. The effect of protein timing on muscle strength and hypertrophy: a meta-analysis. J Int Soc Sports Nutr 2013;10:53',
        identifier: '10.1186/1550-2783-10-53',
        kind: 'doi',
      },
      {
        label:
          'Morton RW et al. A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults. Br J Sports Med 2018;52:376-384',
        identifier: '10.1136/bjsports-2017-097608',
        kind: 'doi',
      },
      {
        label:
          'Devries MC et al. Changes in kidney function do not differ between healthy adults consuming higher- compared with lower- or normal-protein diets: a systematic review and meta-analysis. J Nutr 2018;148:1760-1775',
        identifier: '10.1093/jn/nxy197',
        kind: 'doi',
      },
      {
        label:
          'Bandara SB, Towle KM, Monnot AD. A human health risk assessment of heavy metal ingestion among consumers of protein powder supplements. Toxicol Rep 2020;7:1255-1262',
        identifier: '10.1016/j.toxrep.2020.08.001',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 6106 — L-Leucine, the marker amino acid tracked in the whey literature',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6106',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Rosuvastatin — a statin approved on LDL and made famous by an inflammation hypothesis, which
  //    then failed three consecutive times in the populations where inflammation is highest.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'rosuvastatin',
    name: 'Rosuvastatin',
    tradeName: 'Crestor',
    sponsor:
      'Shionogi (originator), licensed to and developed by AstraZeneca; generic in the United States since 2016',
    targetGene: 'HMGCR',
    targetProtein: '3-hydroxy-3-methylglutaryl-coenzyme A reductase',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2003,
    indication:
      'Reduction of cardiovascular event risk in adults without clinically evident coronary heart disease but with elevated high-sensitivity C-reactive protein and additional risk factors; slowing of atherosclerosis progression; and treatment of primary hyperlipidaemia, homozygous and heterozygous familial hypercholesterolaemia and hypertriglyceridaemia',
    patientFriendlyIndication: 'High cholesterol, and the risk of a heart attack or stroke',
    anatomicalSite: 'Hepatocyte endoplasmic reticulum (liver)',
    conditionContext: {
      conditionExplainer:
        'Arterial plaque is a lipid problem and an inflammation problem at the same time. LDL particles get into the artery wall; immune cells eat them and die there; the resulting inflamed core is what makes a plaque unstable. C-reactive protein is a blood marker that rises with that inflammation, and it predicts heart attacks independently of cholesterol.',
      whyItMatters:
        'JUPITER was built on the hypothesis that people with normal cholesterol but raised C-reactive protein would benefit from a statin, and it produced one of the largest relative risk reductions in the statin literature. The three trials that then tested rosuvastatin in the conditions with the highest inflammatory burden of all — systolic heart failure twice, and dialysis — all found nothing. Both facts belong on the same page.',
      whoTakesThis:
        'Widely used where a large LDL reduction is wanted, including familial hypercholesterolaemia and statin-treated patients who have not reached target on another agent. On the WHO Model List of Essential Medicines.',
      clinicalGoals:
        'Lower LDL cholesterol and, in JUPITER and HOPE-3, reduce a composite of myocardial infarction, stroke, revascularisation, unstable angina and cardiovascular death.',
    },
    oneSentenceVerdict:
      'The most potent oral statin per milligram, with two positive primary-prevention outcome trials in 17,802 and 12,705 participants, and three consecutive negative outcome trials in 5,011 patients with ischaemic heart failure, 4,574 with heart failure of any cause, and 2,776 on haemodialysis — a pattern that constrains the inflammation hypothesis its most famous trial was designed to prove.',
    laymanHowItWorks:
      'Rosuvastatin blocks the enzyme your liver uses to build cholesterol. The liver responds by putting out more collection receptors that pull LDL particles from the blood. It is more water-loving than most statins, so it depends heavily on a liver transporter to get into the cell, and it is barely metabolised — which is why its interaction profile differs from atorvastatin\'s.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    substitutes: {
      summary:
        'Generic rosuvastatin costs three to seven cents a tablet in the United States, roughly the same as atorvastatin, and lowers LDL slightly more per milligram. Ezetimibe and bempedoic acid add further LDL reduction by different mechanisms, both with their own outcome trials. No supplement has a comparable event trial, and the negative trials on this page are more informative about the drug than any comparison.',
      conventionalRx: [
        {
          name: 'Atorvastatin (Lipitor)',
          class: 'HMG-CoA reductase inhibitor',
          howItCompares:
            'Lowers LDL slightly less per milligram and has the larger secondary-prevention evidence base including TNT and ASCOT-LLA. It is metabolised by CYP3A4, where rosuvastatin is largely not, so their interaction profiles differ. No head-to-head outcome trial has been run between them.',
          typicalCost:
            'US$0.023 per 10 mg generic atorvastatin tablet at pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: broader outcome evidence, cheaper still at low strengths. Cons: CYP3A4 interactions including grapefruit, and higher rates of aminotransferase elevation at 80 mg in TNT.',
        },
        {
          name: 'Ezetimibe (Zetia)',
          class: 'Cholesterol absorption inhibitor',
          howItCompares:
            'Added to a statin it lowers LDL further by blocking intestinal uptake. IMPROVE-IT showed a 2.0 percentage-point absolute reduction in a composite endpoint over seven years when added to simvastatin.',
          typicalCost:
            'US$0.067 per 10 mg generic tablet at pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no muscle signal, additive mechanism. Cons: small absolute benefit, and two earlier surrogate trials that missed.',
        },
        {
          name: 'Evolocumab (Repatha)',
          class: 'PCSK9-directed monoclonal antibody, injected',
          howItCompares:
            'Produces LDL reductions no oral drug matches, added on top of a statin rather than replacing one, with cardiovascular outcome evidence in FOURIER.',
          typicalCost:
            'US$281.97 per mL of the 140 mg/mL autoinjector at pharmacy acquisition cost (CMS NADAC, REPATHA SURECLICK, effective 19 August 2026)',
          prosAndCons:
            'Pros: largest available LDL reduction, no muscle signal. Cons: injection, and an acquisition cost thousands of times that of a generic statin tablet.',
        },
      ],
      naturalFoods: [
        {
          name: 'Plant sterols and stanols',
          activeCompound: 'Beta-sitosterol, campesterol, sitostanol',
          biologicalMechanism:
            'Compete with cholesterol for incorporation into intestinal micelles, reducing absorption. This is the same target as ezetimibe reaches pharmacologically, at a smaller effect size and without an outcome trial.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. Randomised trials of sterol-enriched foods report LDL reductions of a few percent, with cholesterol as the endpoint, not events.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Muscle symptoms deserve a blinded rechallenge, not a permanent ban',
          action:
            'If aches begin after starting, ask whether a placebo-controlled or staged rechallenge is possible before writing the whole class off.',
          patientImpact:
            'In HOPE-3, muscle symptoms occurred in 5.8% on rosuvastatin against 4.7% on placebo (p=0.005) — a real excess of about 1 percentage point, and far smaller than the proportion of people who attribute their symptoms to the drug. The two n-of-1 programmes on the atorvastatin page found no difference at all in people who had already reported symptoms.',
          clinicalPrecaution:
            'Rhabdomyolysis is a separate, rare event with very high creatine kinase and dark urine and is a reason to stop immediately. It is not what the rechallenge conversation is about.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)C1=NC(=NC(=C1/C=C/[C@H](C[C@H](CC(=O)O)O)O)C2=CC=C(C=C2)F)N(C)S(=O)(=O)C',
      chemicalFormula: 'C22H28FN3O6S',
      molecularWeight: '481.5 g/mol (free acid); dispensed as rosuvastatin calcium',
      targetReceptorAffinity:
        'A nanomolar-range inhibitor of the catalytic domain of human HMG-CoA reductase, binding the HMG portion of the substrate site with the same dihydroxyheptenoic acid arm the class shares. The methanesulfonamide group is what makes it the most hydrophilic of the potent statins: it limits passive entry into non-hepatic tissue and makes hepatic uptake almost entirely dependent on the OATP1B1 transporter.',
      structureSource: {
        label:
          'PubChem CID 446157 (rosuvastatin) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/446157',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ros-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Chiral control of the dihydroxy side-chain synthon and the pyrimidine aldehyde',
          description:
            'Assay the (3R,5S)-configured protected dihydroxy phosphonate or Wittig synthon for diastereomeric excess, and the 4-(4-fluorophenyl)-6-isopropyl-2-(N-methyl-N-methanesulfonylamino)pyrimidine-5-carbaldehyde for regiochemical purity. The 3R,5S arrangement is the pharmacophore shared with every statin; a diastereomeric impurity is a compound with the correct mass and no activity.',
          reagentsAndBuffer:
            'tert-butyl (3R,5S)-6-(diphenylphosphinoylmethyl)-2,2-dimethyl-1,3-dioxane-4-acetate reference standard, the pyrimidine carbaldehyde reference standard, chiral HPLC, Karl Fischer titration, quantitative nuclear magnetic resonance for assay',
        },
        {
          id: 'ros-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Olefination to set the trans double bond linking heterocycle to side chain',
          description:
            'Couple the pyrimidine aldehyde to the phosphine oxide or phosphonate synthon under strong base to form the carbon-carbon double bond with E geometry. Geometry is load-bearing: the Z isomer positions the dihydroxy arm wrongly relative to the enzyme pocket and is a specified impurity, and the reaction conditions are chosen for E selectivity rather than for conversion.',
          dependsOnStepId: 'ros-w1',
          reagentsAndBuffer:
            'n-butyllithium or lithium diisopropylamide in tetrahydrofuran at minus 78 degrees Celsius under argon, anhydrous conditions throughout, thin-layer chromatography monitoring against the Z-isomer standard',
        },
        {
          id: 'ros-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Acetonide and ester cleavage, then calcium salt formation',
          description:
            'Remove the acetonide protecting group and hydrolyse the ester under mild acid then base, and precipitate the calcium salt. Rosuvastatin is unusually base-sensitive and light-sensitive for the class, so the lactone and the anti-isomer are both specified degradants and the process is run under nitrogen with amber containment.',
          dependsOnStepId: 'ros-w2',
          reagentsAndBuffer:
            'Hydrochloric acid in acetonitrile/water for acetonide cleavage, sodium hydroxide for ester hydrolysis, calcium chloride for salt formation, nitrogen blanket and amber glassware, reversed-phase HPLC against the rosuvastatin lactone and 5-oxo degradant standards',
        },
        {
          id: 'ros-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'OATP1B1-dependent uptake into hepatocytes, and BCRP efflux',
          description:
            'Measure uptake into sandwich-cultured primary human hepatocytes and into transporter-transfected cells, competing with a pan-OATP inhibitor, and separately measure BCRP-mediated efflux. Rosuvastatin is the statin most dependent on transport rather than diffusion: it barely enters cells passively, so OATP1B1 function and ABCG2 genotype together determine both hepatic exposure and how much of the drug reaches muscle.',
          dependsOnStepId: 'ros-w3',
          reagentsAndBuffer:
            'Sandwich-cultured primary human hepatocytes on collagen with Matrigel overlay, HEK293 cells transfected with SLCO1B1 or ABCG2, Krebs-Henseleit buffer, rifamycin SV as pan-OATP inhibitor, Ko143 as BCRP inhibitor, LC-MS/MS quantification',
        },
        {
          id: 'ros-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Enzyme inhibition with a parallel C-reactive protein readout',
          description:
            'Measure inhibition of recombinant HMG-CoA reductase by NADPH consumption, and in parallel measure interleukin-6-stimulated C-reactive protein secretion from hepatocytes. Running both is specific to this drug: the clinical claim JUPITER was built on is that the same treatment lowers LDL and an inflammatory marker, and only a paired assay shows the two effects are separable at the cellular level.',
          dependsOnStepId: 'ros-w4',
          reagentsAndBuffer:
            'Recombinant human HMG-CoA reductase catalytic domain, DL-3-hydroxy-3-methylglutaryl coenzyme A, NADPH followed at 340 nm, recombinant human interleukin-6 and interleukin-1 beta for hepatocyte stimulation, high-sensitivity C-reactive protein ELISA',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ros-a1',
        category: 'measured',
        title: 'JUPITER: a 44% relative reduction in 17,802 people with normal cholesterol',
        laymanSummary:
          'People with unremarkable cholesterol but a raised inflammation marker were given rosuvastatin or placebo. The trial was stopped after less than two years because the treated group had far fewer cardiovascular events.',
        technicalDetails:
          'JUPITER randomised 17,802 apparently healthy men and women with LDL cholesterol below 130 mg/dL and high-sensitivity C-reactive protein of 2.0 mg/L or higher to rosuvastatin 20 mg daily or placebo. The trial was stopped after a median 1.9 years. Rosuvastatin reduced LDL by 50% and high-sensitivity C-reactive protein by 37%. The primary composite of myocardial infarction, stroke, arterial revascularisation, hospitalisation for unstable angina or cardiovascular death occurred at 0.77 against 1.36 per 100 person-years: hazard ratio 0.56 (95% CI 0.46 to 0.69), p<0.00001. Myocardial infarction 0.46 (0.30 to 0.70), stroke 0.52 (0.34 to 0.79), death from any cause 0.80 (0.67 to 0.97), p=0.02. There was no significant increase in myopathy or cancer, but a higher incidence of physician-reported diabetes.',
        evidenceSource: 'Ridker PM et al., JUPITER, N Engl J Med 2008;359:2195-2207 (NCT00239681)',
        doi: '10.1056/NEJMoa0807646',
        measuredMetric:
          'Composite of myocardial infarction, stroke, revascularisation, unstable angina and cardiovascular death over a median 1.9 years',
        auditFlag: 'verified',
      },
      {
        id: 'ros-a2',
        category: 'inferred',
        title: 'JUPITER does not separate the LDL effect from the C-reactive protein effect',
        laymanSummary:
          'The trial is quoted as proof that lowering inflammation prevents heart attacks. It lowered both cholesterol and the inflammation marker at once, in the same people, and no arm of the trial separated them.',
        technicalDetails:
          'Rosuvastatin lowered LDL by 50% and high-sensitivity C-reactive protein by 37% in the same participants; there was no arm in which one moved without the other. A 50% LDL reduction from a baseline under 130 mg/dL is on its own sufficient to explain a large part of the event reduction under the dose-response relationship the Cholesterol Treatment Trialists established across 26 trials and 170,000 participants. Testing the inflammation hypothesis properly required a drug that lowers inflammation without touching LDL, which is what the later canakinumab and colchicine trials attempted. JUPITER is strong evidence that treating this population works, and it is not evidence about which of the two mechanisms did the work.',
        evidenceSource:
          'Ridker PM et al., JUPITER, N Engl J Med 2008;359:2195-2207; Cholesterol Treatment Trialists Collaboration, Lancet 2010;376:1670-1681',
        doi: '10.1016/S0140-6736(10)61350-5',
        inferredClaim:
          'That JUPITER demonstrates a benefit from lowering inflammation as distinct from lowering LDL — the two fell together in every participant and no design element separated them',
        auditFlag: 'caution',
      },
      {
        id: 'ros-a3',
        category: 'failed',
        title: 'CORONA: no benefit in 5,011 patients with ischaemic systolic heart failure',
        laymanSummary:
          'Five thousand older patients with heart failure from coronary disease took rosuvastatin or placebo for nearly three years. Cholesterol and the inflammation marker both fell substantially. Deaths and heart attacks did not.',
        technicalDetails:
          'CORONA randomised 5,011 patients aged at least 60 with NYHA class II-IV ischaemic systolic heart failure to rosuvastatin 10 mg daily or placebo. LDL fell 45.0% and high-sensitivity C-reactive protein 37.1% against placebo, both p<0.001. Over a median 32.8 months the primary composite of cardiovascular death, non-fatal myocardial infarction or non-fatal stroke occurred in 692 rosuvastatin patients against 732 on placebo: hazard ratio 0.92 (95% CI 0.83 to 1.02), p=0.12. Deaths were 728 against 759: 0.95 (0.86 to 1.05), p=0.31. There were no significant differences in the coronary outcome or in cardiovascular death. A prespecified secondary analysis found fewer cardiovascular hospitalisations on rosuvastatin (2,193 against 2,564, p<0.001). No excess of muscle-related events occurred.',
        evidenceSource: 'Kjekshus J et al., CORONA, N Engl J Med 2007;357:2248-2261 (NCT00206310)',
        doi: '10.1056/NEJMoa0706201',
        measuredMetric:
          'Composite of cardiovascular death, non-fatal myocardial infarction and non-fatal stroke over a median 32.8 months',
        auditFlag: 'verified',
      },
      {
        id: 'ros-a4',
        category: 'failed',
        title: 'GISSI-HF: a hazard ratio of exactly 1.00 in 4,574 heart failure patients',
        laymanSummary:
          'An Italian trial repeated the question in heart failure of any cause, over nearly four years. The number of deaths in the two arms was as close to identical as a trial can produce.',
        technicalDetails:
          'GISSI-HF randomised 4,574 patients aged 18 or older with chronic NYHA class II-IV heart failure of any cause and any ejection fraction, across 326 cardiology and 31 internal medicine centres in Italy, to rosuvastatin 10 mg daily (n=2,285) or placebo (n=2,289), followed for a median 3.9 years. Death from any cause occurred in 657 (29%) on rosuvastatin against 644 (28%) on placebo: adjusted hazard ratio 1.00 (95.5% CI 0.898 to 1.122), p=0.943. Death or admission for cardiovascular reasons occurred in 1,305 (57%) against 1,283 (56%): adjusted hazard ratio 1.01 (99% CI 0.908 to 1.112), p=0.903. Gastrointestinal disorders were the commonest adverse reaction and were less frequent on rosuvastatin than placebo.',
        evidenceSource:
          'GISSI-HF investigators, Tavazzi L et al., Lancet 2008;372:1231-1239 (NCT00336336)',
        doi: '10.1016/S0140-6736(08)61240-4',
        measuredMetric:
          'Time to death, and time to death or cardiovascular admission, over a median 3.9 years',
        auditFlag: 'verified',
      },
      {
        id: 'ros-a5',
        category: 'failed',
        title: 'AURORA: LDL fell 43% on dialysis and nothing else moved',
        laymanSummary:
          'In nearly three thousand people on haemodialysis, rosuvastatin lowered cholesterol substantially over almost four years and changed neither cardiovascular events nor deaths.',
        technicalDetails:
          'AURORA randomised 2,776 patients aged 50 to 80 on maintenance haemodialysis to rosuvastatin 10 mg daily or placebo. At 3 months mean LDL reduction was 43%, from a mean baseline of 100 mg/dL. Over a median 3.8 years, the combined primary endpoint of cardiovascular death, non-fatal myocardial infarction or non-fatal stroke occurred in 396 rosuvastatin patients against 408 on placebo: 9.2 against 9.5 events per 100 patient-years, hazard ratio 0.96 (95% CI 0.84 to 1.11), p=0.59. Rosuvastatin had no effect on any individual component. All-cause mortality was 13.5 against 14.0 events per 100 patient-years: hazard ratio 0.96 (0.86 to 1.07), p=0.51.',
        evidenceSource: 'Fellström BC et al., AURORA, N Engl J Med 2009;360:1395-1407 (NCT00240331)',
        doi: '10.1056/NEJMoa0810177',
        measuredMetric:
          'Cardiovascular death, non-fatal myocardial infarction or non-fatal stroke over a median 3.8 years in haemodialysis',
        auditFlag: 'verified',
      },
      {
        id: 'ros-a6',
        category: 'measured',
        title: 'HOPE-3: it works in intermediate risk, and it produces measurable side effects',
        laymanSummary:
          'A large, ethnically diverse trial in people at moderate risk without heart disease found a clear reduction in events. It also found more cataract surgery and more muscle symptoms than placebo.',
        technicalDetails:
          'HOPE-3 randomised 12,705 participants in 21 countries without cardiovascular disease and at intermediate risk to rosuvastatin 10 mg daily or placebo, median follow-up 5.6 years. Mean LDL was 26.5% lower on rosuvastatin. The first co-primary outcome of cardiovascular death, non-fatal myocardial infarction or non-fatal stroke occurred in 235 (3.7%) against 304 (4.8%): hazard ratio 0.76 (95% CI 0.64 to 0.91), p=0.002. The second co-primary outcome, adding revascularisation, heart failure and resuscitated arrest, occurred in 277 (4.4%) against 363 (5.7%): 0.75 (0.64 to 0.88), p<0.001. Results were consistent across baseline risk, lipid level, C-reactive protein, blood pressure and ethnic group. There was no excess of diabetes or cancer, but there was an excess of cataract surgery (3.8% against 3.1%, p=0.02) and of muscle symptoms (5.8% against 4.7%, p=0.005).',
        evidenceSource: 'Yusuf S et al., HOPE-3, N Engl J Med 2016;374:2021-2031 (NCT00468923)',
        doi: '10.1056/NEJMoa1600176',
        measuredMetric:
          'Two co-primary cardiovascular composites, plus cataract surgery and muscle symptoms, over a median 5.6 years',
        auditFlag: 'verified',
      },
      {
        id: 'ros-a7',
        category: 'conclusion_shift',
        title: 'Three failures in a row redrew the boundary of where statins work',
        laymanSummary:
          'Two heart failure trials and one dialysis trial all showed large falls in cholesterol and no change in outcomes. The lesson taken from them is that a statin helps where atherosclerotic events drive the risk, and not where something else does.',
        technicalDetails:
          'CORONA, GISSI-HF and AURORA together randomised 12,361 patients, achieved LDL reductions of 45%, an unreported but comparable magnitude, and 43% respectively, and produced hazard ratios of 0.92 (p=0.12), 1.00 (p=0.943) and 0.96 (p=0.59) on their primary endpoints. All three enrolled populations with high total mortality driven substantially by pump failure, arrhythmia and non-atherosclerotic vascular disease rather than by plaque rupture. The consistent interpretation is that lowering LDL reduces atherothrombotic events and does not reduce deaths that were never going to be atherothrombotic — a boundary condition the earlier trials could not reveal because they enrolled people whose risk was atherosclerotic. It also weakens any general claim that statin benefit tracks inflammatory burden, since all three of these populations have high C-reactive protein.',
        evidenceSource:
          'Kjekshus J et al., N Engl J Med 2007;357:2248-2261; Tavazzi L et al., Lancet 2008;372:1231-1239; Fellström BC et al., N Engl J Med 2009;360:1395-1407',
        doi: '10.1056/NEJMoa0810177',
        inferredClaim:
          'That statin benefit generalises to any population with high cardiovascular mortality or high inflammatory burden — three trials totalling 12,361 patients say it does not',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Poorly absorbed, barely metabolised, and mostly excreted unchanged',
        laymanDesc:
          'Only about a fifth of the tablet reaches the bloodstream, and the body hardly modifies what does. Most of it leaves in the faeces as the same molecule that went in.',
        molecularDetail:
          'Absolute bioavailability is roughly 20%. Metabolism is limited, with only minor CYP2C9 involvement and no meaningful CYP3A4 pathway, so the CYP3A4 interactions that dominate atorvastatin and simvastatin do not apply. About 90% of the dose is excreted unchanged in faeces. Systemic exposure is materially higher in East Asian populations, which the label addresses explicitly.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It cannot get into a cell without a transporter',
        laymanDesc:
          'The molecule is unusually water-loving for a statin, so it does not slip through membranes. It relies almost entirely on a specific pump in liver cells, which is what keeps it concentrated in the liver.',
        molecularDetail:
          'Hepatic uptake is mediated principally by OATP1B1 (SLCO1B1), with OATP1B3 and NTCP contributing; efflux involves BCRP (ABCG2). The hydrophilicity conferred by the methanesulfonamide group limits passive entry into skeletal muscle and other non-hepatic tissue. Reduced-function SLCO1B1 and ABCG2 variants raise systemic exposure and are the transporter genetics behind both efficacy variation and myopathy risk.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The dihydroxy arm occupies the enzyme\'s substrate slot',
        laymanDesc:
          'The business end of the molecule imitates the natural raw material closely enough to sit in its place, and the rest of the molecule fills the space next to it so nothing else fits.',
        molecularDetail:
          'The (3R,5S)-dihydroxyheptenoic acid arm mimics the HMG moiety of HMG-CoA in the reductase active site; the fluorophenyl-pyrimidine core occupies the adjacent hydrophobic groove. Rosuvastatin makes additional polar contacts through its methanesulfonamide that other statins do not, which is the structural basis of its higher potency per milligram.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The liver builds more LDL receptors and clears more particles',
        laymanDesc:
          'Short of cholesterol, the cell switches on the gene for the LDL catcher and puts more of them on its surface. Blood LDL falls because more is being taken out of circulation.',
        molecularDetail:
          'Falling intracellular sterol activates SREBP-2 through SCAP and the site-1 and site-2 proteases, raising LDLR transcription and surface receptor density. The same programme raises PCSK9, which degrades the receptor and limits the effect — the counter-regulatory step that PCSK9 antibodies remove. Hepatocyte C-reactive protein production also falls, by a route that is not the LDL receptor pathway.',
        iconName: 'Repeat',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'LDL falls up to 50%, and events fall where events were atherosclerotic',
        laymanDesc:
          'The blood number drops within weeks and by more than most statins achieve. Whether that translates into fewer events depends entirely on whether the person\'s risk came from artery plaque in the first place.',
        molecularDetail:
          'In JUPITER a 50% LDL reduction produced a hazard ratio of 0.56 in people whose risk was atherosclerotic. In AURORA a 43% LDL reduction in haemodialysis produced a hazard ratio of 0.96, and in GISSI-HF the hazard ratio for death was 1.00. The mechanism was engaged in all three; only in the first did engaging it change outcomes.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'JUPITER (NCT00239681)',
        phase: 'Randomised double-blind placebo-controlled trial, stopped early, median 1.9 years',
        sampleSize: 17802,
        primaryEndpoint:
          'Composite of myocardial infarction, stroke, arterial revascularisation, hospitalisation for unstable angina or cardiovascular death',
        endpointMet: true,
        statisticalPValue: 'HR 0.56 (95% CI 0.46-0.69), P < 0.00001',
        unreportedAdverseSignals:
          'A higher incidence of physician-reported diabetes. The trial was stopped at a median 1.9 years, which inflates measured effect size and gives no long-term safety data.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CORONA (NCT00206310)',
        phase: 'Randomised double-blind placebo-controlled trial, median 32.8 months',
        sampleSize: 5011,
        primaryEndpoint:
          'Cardiovascular death, non-fatal myocardial infarction or non-fatal stroke in ischaemic systolic heart failure',
        endpointMet: false,
        statisticalPValue: 'HR 0.92 (95% CI 0.83-1.02), P = 0.12',
        unreportedAdverseSignals:
          'LDL fell 45% and C-reactive protein 37% — the mechanism was fully engaged and the endpoint did not move.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'GISSI-HF rosuvastatin arm (NCT00336336)',
        phase: 'Randomised double-blind placebo-controlled trial, median 3.9 years',
        sampleSize: 4574,
        primaryEndpoint: 'Time to death, and time to death or cardiovascular hospitalisation',
        endpointMet: false,
        statisticalPValue: 'Adjusted HR 1.00 (95.5% CI 0.898-1.122), P = 0.943',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'AURORA (NCT00240331)',
        phase: 'Randomised double-blind placebo-controlled trial, median 3.8 years',
        sampleSize: 2776,
        primaryEndpoint:
          'Cardiovascular death, non-fatal myocardial infarction or non-fatal stroke in maintenance haemodialysis',
        endpointMet: false,
        statisticalPValue: 'HR 0.96 (95% CI 0.84-1.11), P = 0.59',
        unreportedAdverseSignals:
          'LDL fell 43% at 3 months. No individual component of the primary endpoint moved, and all-cause mortality was unchanged.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'HOPE-3 (NCT00468923)',
        phase: 'Randomised double-blind placebo-controlled 2-by-2 factorial trial, median 5.6 years',
        sampleSize: 12705,
        primaryEndpoint:
          'Co-primary composites of cardiovascular death, non-fatal myocardial infarction and non-fatal stroke, with and without revascularisation, heart failure and resuscitated arrest',
        endpointMet: true,
        statisticalPValue: 'HR 0.76 (95% CI 0.64-0.91), P = 0.002 for the first co-primary outcome',
        unreportedAdverseSignals:
          'Excess cataract surgery (3.8% against 3.1%, p=0.02) and excess muscle symptoms (5.8% against 4.7%, p=0.005).',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 50% LDL reduction and a hazard ratio of 0.56 for major cardiovascular events in 17,802 people with normal cholesterol and raised C-reactive protein',
        'A hazard ratio of 0.76 for the first co-primary composite in 12,705 intermediate-risk people across 21 countries',
        'Hazard ratios of 0.92, 1.00 and 0.96 in three trials totalling 12,361 patients with heart failure or on dialysis, all with large LDL reductions',
        'Cataract surgery in 3.8% against 3.1% and muscle symptoms in 5.8% against 4.7% over a median 5.6 years',
      ],
      unsupportedInferences: [
        'That JUPITER demonstrates a benefit of lowering inflammation independent of lowering LDL — both fell together in every participant',
        'That statin benefit generalises to populations with high cardiovascular mortality regardless of its cause — CORONA, GISSI-HF and AURORA say otherwise',
        'That the 44% relative reduction in JUPITER represents the long-run benefit — the trial ran a median 1.9 years and was stopped early',
        'That rosuvastatin is interchangeable with atorvastatin on outcomes — no head-to-head event trial has been run',
      ],
      whatFailedInitially: [
        'CORONA: 5,011 patients with ischaemic systolic heart failure, LDL down 45%, primary endpoint hazard ratio 0.92 (p=0.12)',
        'GISSI-HF: 4,574 patients with heart failure of any cause, hazard ratio for death of exactly 1.00 (p=0.943)',
        'AURORA: 2,776 patients on haemodialysis, LDL down 43%, primary endpoint hazard ratio 0.96 (p=0.59)',
      ],
      realWorldOutcome: [
        'Generic since 2016 and on the WHO Model List of Essential Medicines',
        'US$0.037 per 10 mg generic tablet at United States pharmacy acquisition cost, against US$8.81 for the branded CRESTOR tablet in the same file on the same date',
        'The three negative trials narrowed the indication in practice: statins are for people whose risk is atherosclerotic, not for anyone whose risk is high',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, four strengths',
      description:
        'Once daily at any time of day, with or without food. Absorption is limited and the drug is barely metabolised, so its interactions are transporter interactions rather than cytochrome interactions — which is why it is often chosen where CYP3A4 inhibitors are in the picture.',
      safetyProfile:
        'Muscle symptoms occurred in 5.8% against 4.7% on placebo in HOPE-3 (p=0.005) and rhabdomyolysis is rare. HOPE-3 also found an excess of cataract surgery (3.8% against 3.1%, p=0.02). JUPITER reported a higher incidence of physician-reported diabetes. Systemic exposure is roughly doubled in people of East Asian ancestry, which the label addresses. Interactions run through OATP1B1 and BCRP — ciclosporin, gemfibrozil and some antiretrovirals — rather than through CYP3A4.',
    },
    commonQuestions: [
      {
        q: 'Does this drug work by reducing inflammation?',
        a: 'It reduces an inflammation marker, and whether that is where its benefit comes from is genuinely unresolved. In JUPITER it lowered high-sensitivity C-reactive protein by 37% and LDL cholesterol by 50% in the same people, and no arm of the trial separated the two, so the result is equally consistent with either explanation or both. The strongest evidence against a large inflammation-specific effect is on this page: in CORONA, GISSI-HF and AURORA — populations with high inflammatory burden — the same drug lowered LDL and C-reactive protein substantially and changed no outcome at all. Testing the inflammation hypothesis properly needed a drug that lowers inflammation without touching LDL, and those trials were run later with other molecules.',
        auditNote:
          'JUPITER is one of the most-cited trials in preventive cardiology and its design cannot answer the question it is most often cited for.',
      },
      {
        q: 'Why did it fail in heart failure and on dialysis?',
        a: 'Because in both settings most of the deaths are not caused by the thing this drug prevents. A statin reduces atherothrombotic events — plaque rupture, clot, infarct. In advanced systolic heart failure, death typically comes from pump failure or arrhythmia; on dialysis, from sudden death, vascular calcification and infection. The mechanism worked in every trial: LDL fell 45% in CORONA and 43% in AURORA. What did not follow was an outcome change, because the outcome was being driven by something else. The hazard ratios were 0.92, 1.00 and 0.96 in 12,361 patients between them. That is not a weak signal; it is an absence of one.',
      },
      {
        q: 'Is rosuvastatin stronger than atorvastatin?',
        a: 'Per milligram, yes — it produces a larger LDL reduction at equivalent doses, which is a matter of measured potency rather than opinion. Whether that translates to better outcomes is unknown, because no trial has randomised people between the two and counted events. What differs more usefully is the interaction profile: rosuvastatin is barely metabolised by CYP3A4 and its interactions run through the OATP1B1 and BCRP transporters, whereas atorvastatin is a CYP3A4 substrate and so is affected by grapefruit and by a long list of drugs. That distinction is often the reason one is chosen over the other.',
      },
      {
        q: 'I was told my dose should be lower because of my ethnicity. Is that real?',
        a: 'Yes, and it is a pharmacokinetic fact reflected in the US label. Systemic exposure to rosuvastatin is approximately twice as high in people of East Asian ancestry as in white participants at the same dose, an observation attributed largely to the frequency of reduced-function variants in the transporters that handle the drug — SLCO1B1 for hepatic uptake and ABCG2 for efflux. Higher exposure at the same dose means more drug reaching muscle, which is the tissue where the dose-limiting toxicity occurs. This page states the direction and the label reference and does not give dosing guidance.',
      },
      {
        q: 'Should I worry about cataracts?',
        a: 'HOPE-3 found an excess and it was small. Over a median 5.6 years, cataract surgery occurred in 3.8% of the rosuvastatin group against 3.1% on placebo, p=0.02 — about seven extra procedures per thousand people over five and a half years. That is a real, randomised, statistically detected difference, and it belongs alongside the 235 against 304 cardiovascular events in the same trial. Both numbers came out of the same 12,705 participants and neither cancels the other.',
      },
      {
        q: 'Why does this page show no manufacturing cost?',
        a: 'Because no verified per-dose synthesis cost for rosuvastatin could be cited. What is shown is the pharmacy acquisition price: about 3.7 cents for a 10 mg generic tablet against US$8.81 for the branded CRESTOR tablet of the same strength in the same CMS NADAC file on the same date, 19 August 2026. Those two prices are for the identical molecule, which makes the comparison checkable, and neither is a cost of manufacture.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Ridker PM et al. Rosuvastatin to prevent vascular events in men and women with elevated C-reactive protein (JUPITER). N Engl J Med 2008;359:2195-2207',
        identifier: '10.1056/NEJMoa0807646',
        kind: 'doi',
      },
      {
        label:
          'Kjekshus J et al. Rosuvastatin in older patients with systolic heart failure (CORONA). N Engl J Med 2007;357:2248-2261',
        identifier: '10.1056/NEJMoa0706201',
        kind: 'doi',
      },
      {
        label:
          'Tavazzi L et al. Effect of rosuvastatin in patients with chronic heart failure (the GISSI-HF trial). Lancet 2008;372:1231-1239',
        identifier: '10.1016/S0140-6736(08)61240-4',
        kind: 'doi',
      },
      {
        label:
          'Fellström BC et al. Rosuvastatin and cardiovascular events in patients undergoing hemodialysis (AURORA). N Engl J Med 2009;360:1395-1407',
        identifier: '10.1056/NEJMoa0810177',
        kind: 'doi',
      },
      {
        label:
          'Yusuf S et al. Cholesterol lowering in intermediate-risk persons without cardiovascular disease (HOPE-3). N Engl J Med 2016;374:2021-2031',
        identifier: '10.1056/NEJMoa1600176',
        kind: 'doi',
      },
      {
        label:
          'Cholesterol Treatment Trialists Collaboration. Efficacy and safety of more intensive lowering of LDL cholesterol. Lancet 2010;376:1670-1681',
        identifier: '10.1016/S0140-6736(10)61350-5',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA: CRESTOR (rosuvastatin calcium), NDA 021366, original approval 12 August 2003',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021366',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 446157 — rosuvastatin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/446157',
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
  // ---------------------------------------------------------------------------------------------
  // Caffeine — the strongest evidence in this entire file. An umbrella review of 21 meta-analyses,
  // an FDA-approved neonatal drug that cut cerebral palsy, and one honest catch: withdrawal.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'caffeine',
    name: 'Caffeine',
    tradeName:
      'Caffeine anhydrous in supplements; caffeine citrate is an FDA-approved prescription drug for apnea of prematurity (Cafcit, NDA 020793)',
    sponsor:
      'No single sponsor — 1,3,7-trimethylxanthine, obtained from coffee decaffeination or synthesised from urea and dimethylurea, sold by many manufacturers',
    targetGene: 'ADORA2A',
    targetProtein:
      'Adenosine receptors A1 (ADORA1) and A2A (ADORA2A), both G-protein-coupled. Caffeine is a competitive, non-selective antagonist at both at ordinary human doses. Every other proposed mechanism — phosphodiesterase inhibition, ryanodine receptor sensitisation, GABA-A antagonism — requires concentrations that a person drinking coffee never reaches.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement and as an ingredient in coffee, tea, energy drinks and pre-workout formulas, for alertness and exercise performance. Caffeine citrate is separately an approved prescription drug under NDA 020793 for apnea of prematurity in very-low-birth-weight infants, where it reduced bronchopulmonary dysplasia and, at 18 months, death or neurodevelopmental disability.',
    patientFriendlyIndication: 'Taken for alertness, and before training or competition for performance',
    conditionContext: {
      conditionExplainer:
        'Adenosine accumulates in the brain across a waking day and, by acting on its receptors, is one of the signals that produces the feeling of sleepiness. Caffeine occupies those receptors without activating them. It does not add energy; it blocks the message that you are tired, and the adenosine keeps accumulating underneath.',
      whyItMatters:
        'This is the page in this file where the evidence is strongest, and saying so plainly is what makes the sceptical pages elsewhere worth reading. Caffeine is ergogenic across aerobic endurance, muscular strength, muscular endurance, power, jumping and speed, substantiated by 21 meta-analyses, and it is one of very few substances here that is also a licensed drug with a mortality-adjacent randomised benefit in a real disease.',
      whoTakesThis:
        'Roughly most adults on earth, mostly as coffee and tea. Also athletes taking measured doses before competition, shift workers, students, and — under prescription and by a completely different route — premature infants with apnea.',
      clinicalGoals:
        'Trials measured time-trial completion time, one-repetition maximum, repetitions to failure, peak power, jump height, ratings of perceived exertion, polysomnographic total sleep time, and in the neonatal programme bronchopulmonary dysplasia and neurodevelopmental disability at 18 to 21 months.',
    },
    oneSentenceVerdict:
      'Caffeine is the best-evidenced performance substance in this file and one of the best-evidenced in existence — ergogenic across six distinct exercise domains in 21 meta-analyses, and a licensed neonatal drug that cut death or neurodevelopmental disability from 46.2% to 40.2% — with the honest caveat that half of habitual users get a withdrawal headache on stopping, so part of the daily lift is the reversal of a deficit the habit created.',
    laymanHowItWorks:
      'A molecule called adenosine builds up in your brain the longer you are awake, and when it docks onto its receptors you feel tired. Caffeine is shaped enough like adenosine to sit in those receptors without switching them on, so the tiredness signal cannot be delivered. Nothing has been added; a brake has been released. Because the adenosine is still piling up behind the blockade, the tiredness returns when caffeine clears — and if you have been doing this daily, the brain has grown extra receptors to compensate, which is why missing a morning coffee produces a real headache rather than an imagined one.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    anatomicalSite:
      'Central nervous system, principally striatal and cortical adenosine A1 and A2A receptors; also skeletal muscle, adipose tissue and the renal afferent arteriole',
    substitutes: {
      summary:
        'For alertness the only intervention that genuinely beats caffeine is sleep, and it beats it decisively because it clears the adenosine rather than masking it. For exercise performance there is no legal, cheap, orally available substance with a comparable evidence base — which is the honest verdict this page exists to record.',
      conventionalRx: [
        {
          name: 'Caffeine citrate (Cafcit) for apnea of prematurity',
          class: 'Methylxanthine respiratory stimulant, FDA-approved under NDA 020793',
          howItCompares:
            'The same molecule as a licensed drug, given to very-low-birth-weight infants. In the 2,006-infant CAP trial it reduced bronchopulmonary dysplasia and, at 18 to 21 months corrected age, reduced death or neurodevelopmental disability from 46.2% to 40.2% and cerebral palsy from 7.3% to 4.4%.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: a genuine randomised benefit on hard neurological outcomes in a real disease, from a substance most people meet as a beverage. Cons: it tells you nothing about the coffee you drank this morning, and it is regularly cited as if it did.',
        },
        {
          name: 'Adequate sleep',
          class: 'The mechanism-matching comparator',
          howItCompares:
            'Sleep clears accumulated adenosine; caffeine occupies the receptor while the adenosine keeps accumulating. That difference is why caffeine reliably improves performance on a rested athlete and cannot substitute for sleep across days. It is also why 400 mg six hours before bed measurably reduces total sleep time.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: removes the underlying signal rather than blocking it, with no tolerance and no withdrawal. Cons: cannot be bought, which is precisely why the caffeine market exists.',
        },
      ],
      naturalFoods: [
        {
          name: 'Coffee',
          activeCompound: 'Caffeine, plus chlorogenic acids and diterpenes that anhydrous caffeine lacks',
          biologicalMechanism:
            'The caffeine in coffee and the caffeine in a capsule are the same molecule acting at the same receptors, and coffee has been used successfully in ergogenic trials. The differences are dose precision and the accompanying compounds: unfiltered coffee carries cafestol and kahweol, which raise LDL cholesterol, and filtered coffee does not.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: Goncalves\'s time-trial study used 6 mg per kilogram of body mass, and Drake\'s sleep study used a fixed 400 mg.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Tea',
          activeCompound: 'Caffeine at lower concentration, with L-theanine',
          biologicalMechanism:
            'Tea delivers less caffeine per serving alongside L-theanine, an amino acid that crosses the blood-brain barrier and is frequently combined with caffeine in supplement products on the claim that it smooths the stimulant effect. The receptor pharmacology of the caffeine is unchanged.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Separate the lift from the withdrawal reversal',
          action:
            'Notice whether the first dose of the day restores you to normal or takes you above it. In a habitual user those are different things, and only one of them is a drug effect on a neutral baseline.',
          patientImpact:
            'Juliano and Griffiths found headache in 50% of experimental caffeine-withdrawal subjects and clinically significant distress or functional impairment in 13%, with symptoms appearing from daily doses as low as 100 mg.',
          clinicalPrecaution:
            'Withdrawal onset is typically 12 to 24 hours after abstinence, peaks at 20 to 51 hours, and lasts 2 to 9 days. Expectancy is not the prime determinant — this was tested.',
        },
        {
          name: 'Count the hours before bed, not the cups',
          action:
            'Caffeine has a half-life of roughly five hours in a healthy adult, which is doubled by oral contraceptives and roughly halved in smokers.',
          patientImpact:
            'A fixed 400 mg dose taken six hours before bedtime significantly disrupted sleep against placebo, measured both by self-report and by a validated portable sleep monitor.',
          clinicalPrecaution:
            'That finding is the empirical basis of the standard advice to stop caffeine at least six hours before bed. Losing sleep to gain alertness is a bad trade at the level of adenosine, which is the thing caffeine is blocking.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
      chemicalFormula: 'C8H10N4O2',
      molecularWeight: '194.19 g/mol',
      targetReceptorAffinity:
        'Competitive antagonist at adenosine A1 and A2A with affinities in the low micromolar range, which is the concentration ordinary human consumption actually produces in plasma. Phosphodiesterase inhibition and ryanodine receptor effects require concentrations one to two orders of magnitude higher and are not the mechanism in a person.',
      structureSource: {
        label: 'PubChem CID 2519 — Caffeine, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2519',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'caf-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Caffeine content and undeclared-stimulant screen on pre-workout products',
          description:
            'Caffeine itself is easy to assay and rarely misstated, but the products it is sold inside are the most adulterated category in the supplement market. Screen for the synthetic stimulants that have repeatedly been found in pre-workout and weight-loss formulas, because a performance effect attributed to caffeine may not be caffeine at all.',
          reagentsAndBuffer:
            'Reversed-phase HPLC-UV at 273 nm against a caffeine reference standard; LC-MS/MS screen for 1,3-dimethylamylamine, 1,4-dimethylamylamine, higenamine, octopamine and synephrine; proprietary-blend products assayed for total caffeine including from guarana, yerba mate and green tea extract',
        },
        {
          id: 'caf-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of labelled caffeine and paraxanthine standards',
          description:
            'CYP1A2 activity varies several-fold between individuals and is the reason two people report opposite experiences of the same cup. Phenotyping requires quantifying caffeine against its primary metabolite, which needs both compounds as isotopically distinguishable standards.',
          dependsOnStepId: 'caf-w1',
          reagentsAndBuffer:
            'Caffeine-d9 and paraxanthine-d6 internal standards; theobromine and theophylline reference standards for the parallel demethylation routes; LC-MS/MS confirmation of isotopic purity',
        },
        {
          id: 'caf-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Salivary extraction for the paraxanthine-to-caffeine ratio',
          description:
            'Saliva tracks free plasma caffeine closely and can be collected without venepuncture, which makes serial sampling practical. The paraxanthine to caffeine ratio at a fixed interval after a standard dose is the accepted CYP1A2 phenotype metric, and it is what a genotype alone cannot give you.',
          dependsOnStepId: 'caf-w2',
          reagentsAndBuffer:
            'Timed saliva collection with a plain cotton swab, not a citric-acid-stimulated one; solid-phase extraction on a mixed-mode cartridge; methanol elution; LC-MS/MS quantification of caffeine and paraxanthine; parallel CYP1A2 rs762551 genotyping by restriction fragment length polymorphism PCR',
        },
        {
          id: 'caf-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'A1 and A2A receptor occupancy, and upregulation after chronic exposure',
          description:
            'Confirm competitive antagonism at both receptors at achievable concentrations, then run the chronic arm, because receptor upregulation is the substrate of tolerance and withdrawal and it does not appear in an acute experiment. This is the step that distinguishes a drug effect on a naive brain from the restoration of a habituated one.',
          dependsOnStepId: 'caf-w3',
          reagentsAndBuffer:
            'CHO cells stably expressing human A1 or A2A; [3H]DPCPX and [3H]ZM241385 radioligand binding; cAMP accumulation assay; caffeine at 1 to 50 micromolar to span human plasma exposure; 14-day continuous exposure arm with receptor density quantified by saturation binding at washout',
        },
        {
          id: 'caf-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Time-trial performance with perceived exertion and a sleep readout',
          description:
            'Report the performance outcome, the perceived-exertion outcome and the subsequent night\'s sleep from the same subjects. Doherty and Smith showed that exertion ratings account for roughly 29% of the variance in performance improvement, and Drake showed that a moderate dose six hours before bed disrupts sleep. A trial that reports only the time trial is reporting a third of the effect.',
          dependsOnStepId: 'caf-w4',
          reagentsAndBuffer:
            'Cycle ergometer simulated time trial with a validated protocol; Borg 6-20 rating of perceived exertion at fixed intervals; capillary blood lactate; matched placebo capsule plus a no-supplement control arm to detect placebo response; validated portable sleep monitor for the following night',
        },
      ],
    },
    keyAudits: [
      {
        id: 'caf-a1',
        category: 'measured',
        title: 'Twenty-one meta-analyses, six exercise domains, all ergogenic',
        laymanSummary:
          'Researchers reviewed every published meta-analysis of caffeine and exercise. Caffeine improved endurance, strength, muscular endurance, power, jumping and speed. This is not a marginal result.',
        technicalDetails:
          'Grgic and colleagues conducted an umbrella review across twelve databases, identifying eleven reviews containing 21 separate meta-analyses, all of moderate or high methodological quality by AMSTAR 2. Caffeine was ergogenic for aerobic endurance, muscle strength, muscle endurance, power, jumping performance and exercise speed. Using GRADE, the quality of evidence for muscle endurance, muscle strength, anaerobic power and aerobic endurance was moderate, coming from moderate-to-high quality systematic reviews; for the other outcomes the underlying evidence was low or very low. Two caveats are stated by the authors and belong here: not all analyses gave a definite direction of effect once the 95% prediction interval was considered, and most individual studies were conducted among young men. This is the strongest performance evidence base for any substance on this site, and it still carries a generalisability limit that the marketing does not mention.',
        evidenceSource: 'Grgic J et al. Br J Sports Med 2020;54:681-688',
        doi: '10.1136/bjsports-2018-100278',
        measuredMetric:
          'Pooled effect of caffeine across aerobic endurance, muscle strength, muscle endurance, power, jumping and speed',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a2',
        category: 'measured',
        title: 'It makes hard work feel easier, and that explains part of why it works',
        laymanSummary:
          'Across 21 studies caffeine made a given workload feel about six percent easier, and performance improved eleven percent. The two are linked.',
        technicalDetails:
          'Doherty and Smith pooled 21 studies yielding 109 effect sizes for ratings of perceived exertion. Against placebo, caffeine reduced RPE during constant-load exercise by 5.6% (95% CI -4.5% to -6.7%), an effect size of -0.47 (95% CI -0.35 to -0.59). Crucially, RPE at the point of exhaustion did not differ at all (0.01% change, 95% CI -1.9 to 2.0) — people stopped at the same subjective ceiling, they just reached more work before hitting it. Exercise performance improved by 11.2% (95% CI 4.6 to 17.8%), and regression showed that the reduction in RPE during exercise accounted for approximately 29% of the variance in performance improvement. This is a rare case of a supplement having a partly identified mechanism of action at the behavioural level, not just the molecular one.',
        evidenceSource: 'Doherty M, Smith PM. Scand J Med Sci Sports 2005;15:69-78',
        doi: '10.1111/j.1600-0838.2005.00445.x',
        measuredMetric:
          'Percentage change in rating of perceived exertion during constant-load exercise and in exercise performance',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a3',
        category: 'measured',
        title: 'CAP: 2,006 premature infants, less lung disease and less cerebral palsy',
        laymanSummary:
          'In the largest randomised trial ever run on caffeine, very premature babies given it needed less oxygen support and, at eighteen months, were less likely to have died or developed a disability.',
        technicalDetails:
          'The Caffeine for Apnea of Prematurity trial randomised 2,006 infants with birth weights of 500 to 1,250 g within the first ten days of life to caffeine or placebo until therapy for apnea was no longer needed. At 36 weeks postmenstrual age, 350 of 963 caffeine infants (36%) still required supplemental oxygen against 447 of 954 placebo infants (47%), adjusted odds ratio 0.63 (95% CI 0.52 to 0.76, P < 0.001), and positive airway pressure was discontinued a week earlier. Caffeine temporarily reduced weight gain, greatest at two weeks (mean difference -23 g, 95% CI -32 to -13, P < 0.001). At 18 to 21 months corrected age, the composite of death, cerebral palsy, cognitive delay, deafness or blindness occurred in 377 of 937 caffeine infants (40.2%) against 431 of 932 (46.2%) on placebo, adjusted odds ratio 0.77 (95% CI 0.64 to 0.93, P = 0.008). Cerebral palsy fell from 7.3% to 4.4% (aOR 0.58, 95% CI 0.39 to 0.87, P = 0.009) and cognitive delay from 38.3% to 33.8% (aOR 0.81, 95% CI 0.66 to 0.99, P = 0.04). Caffeine citrate holds an FDA approval for this indication under NDA 020793.',
        evidenceSource:
          'Schmidt B et al. N Engl J Med 2006;354:2112-2121; Schmidt B et al. N Engl J Med 2007;357:1893-1902',
        doi: '10.1056/NEJMoa073679',
        measuredMetric:
          'Bronchopulmonary dysplasia at 36 weeks postmenstrual age, and death or neurodevelopmental disability at 18 to 21 months',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a4',
        category: 'inferred',
        title: 'Half of habitual users get a withdrawal headache, from doses as low as 100 mg a day',
        laymanSummary:
          'Caffeine withdrawal is a real, validated syndrome with ten confirmed symptoms. Half of people get a headache, and it can be triggered by a daily habit as small as one cup.',
        technicalDetails:
          'Juliano and Griffiths reviewed 57 experimental and 9 survey studies. Of 49 candidate symptom categories, ten met validity criteria: headache, fatigue, decreased energy or activeness, decreased alertness, drowsiness, decreased contentedness, depressed mood, difficulty concentrating, irritability, and feeling foggy or not clearheaded. Flu-like symptoms, nausea or vomiting and muscle pain or stiffness were judged likely valid. In experimental studies the incidence of headache was 50% and of clinically significant distress or functional impairment 13%. Onset was typically 12 to 24 hours after abstinence, peak intensity at 20 to 51 hours, duration 2 to 9 days. Incidence and severity rose with daily dose, and abstinence from doses as low as 100 mg per day produced symptoms. The authors specifically reviewed and rejected expectancy as a prime determinant, and concluded that avoidance of withdrawal plays a central role in habitual consumption. The audit point is not that caffeine does not work — it plainly does — but that a habitual user\'s morning baseline is not a neutral one, and the daily subjective lift is partly the repair of a deficit the habit itself produced.',
        evidenceSource: 'Juliano LM, Griffiths RR. Psychopharmacology (Berl) 2004;176:1-29',
        doi: '10.1007/s00213-004-2000-x',
        measuredMetric:
          'Incidence, onset, peak and duration of validated caffeine withdrawal symptoms after abstinence',
        inferredClaim:
          'That the alertness a habitual user feels after their first coffee measures caffeine acting on a normal baseline, rather than the reversal of an overnight withdrawal',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a5',
        category: 'conclusion_shift',
        title: 'The habituation myth: heavy coffee drinkers get the same performance benefit',
        laymanSummary:
          'For years athletes were told to abstain from caffeine before competition so it would work better. A controlled study across low, moderate and heavy habitual users found their daily intake made no difference to the benefit.',
        technicalDetails:
          'Goncalves and colleagues ran a double-blind, crossover, counterbalanced study in 40 male endurance-trained cyclists, stratified into tertiles by habitual daily caffeine intake: low (58 +/- 29 mg/day), moderate (143 +/- 25) and high (351 +/- 139). Each completed three simulated cycling time trials after caffeine 6 mg/kg, placebo, or no supplement. Time-trial performance improved significantly with caffeine — 29.92 +/- 2.18 minutes against 30.81 +/- 2.67 for placebo and 31.14 +/- 2.71 for control (P = 0.0002). Analysis of covariance found no influence of habitual caffeine intake on the response (P = 0.47), performance did not differ across tertiles (P = 0.75), and there was no correlation between habitual intake and the absolute caffeine-minus-control change (P = 0.524). Individual analysis showed eight, seven and five responders in the low, moderate and high tertiles respectively, with no significant difference between them by Fisher\'s exact test. The withdrawal-abstinence protocols that dominated sports nutrition advice for two decades were, on this evidence, unnecessary — and worth noting for what it also shows: the tolerance that develops for alertness does not straightforwardly transfer to the ergogenic effect.',
        evidenceSource: 'Goncalves LS et al. J Appl Physiol (1985) 2017;123:213-220',
        doi: '10.1152/japplphysiol.00260.2017',
        measuredMetric:
          'Simulated cycling time-trial completion time by habitual caffeine intake tertile',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a6',
        category: 'inferred',
        title: 'CYP1A2 genotype: opposite heart-attack associations in slow and fast metabolisers',
        laymanSummary:
          'In a large case-control study, people who break caffeine down slowly had a higher risk of heart attack with heavy coffee intake. People who break it down quickly did not.',
        technicalDetails:
          'Cornelis and colleagues genotyped 2,014 cases with a first acute nonfatal myocardial infarction and 2,014 matched population controls in Costa Rica between 1994 and 2004. Among carriers of the slow CYP1A2*1F allele — 55% of cases and 54% of controls — the multivariate odds ratios for nonfatal MI at less than one, one, two to three, and four or more cups of coffee daily were 1.00, 0.99 (0.69 to 1.44), 1.36 (1.01 to 1.83) and 1.64 (1.14 to 2.34). Among rapid *1A/*1A metabolisers the corresponding odds ratios were 1.00, 0.75 (0.51 to 1.12), 0.78 (0.56 to 1.09) and 0.99 (0.66 to 1.48), with a gene-by-coffee interaction of P = .04. This is the most-cited evidence that individual caffeine responses are genetically stratified, and it must be read for what it is: a single-population observational case-control study with a modest interaction p-value, not a randomised result. Subsequent attempts to replicate the CYP1A2 interaction for cardiovascular outcomes have been inconsistent, and consumer genetic tests that report a caffeine sensitivity result on this basis are extrapolating well past what one case-control study supports.',
        evidenceSource: 'Cornelis MC, El-Sohemy A, Kabagambe EK, Campos H. JAMA 2006;295:1135-1141',
        doi: '10.1001/jama.295.10.1135',
        inferredClaim:
          'That a CYP1A2 genotype result can tell an individual how much coffee is safe for their heart',
        auditFlag: 'caution',
      },
      {
        id: 'caf-a7',
        category: 'measured',
        title: 'Four hundred milligrams six hours before bed measurably wrecks sleep',
        laymanSummary:
          'A controlled study gave people a moderate caffeine dose at bedtime, three hours before, and six hours before. All three disrupted sleep, including the one taken six hours ahead.',
        technicalDetails:
          'Drake and colleagues compared a fixed 400 mg caffeine dose administered at 0, 3 and 6 hours before habitual bedtime against placebo, with self-reported sleep and objective monitoring by a validated portable sleep monitor in the home. All three timings produced significant sleep disturbance relative to placebo (P < 0.05 for all). The authors concluded that the magnitude of reduction in total sleep time means caffeine taken six hours before bed has important disruptive effects, and that this provides the empirical basis for the standard sleep hygiene recommendation to stop caffeine at least six hours before bedtime. The result matters mechanistically and not just practically: caffeine works by blocking the adenosine signal that sleep exists to clear, so using it late costs the very recovery it is compensating for.',
        evidenceSource: 'Drake C, Roehrs T, Shambroom J, Roth T. J Clin Sleep Med 2013;9:1195-1200',
        doi: '10.5664/jcsm.3170',
        measuredMetric:
          'Self-reported and objectively monitored sleep disturbance after 400 mg caffeine at 0, 3 and 6 hours before bedtime',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed almost completely, and in the brain within an hour',
        laymanDesc:
          'Caffeine is small, fat-soluble and absorbed essentially in full. It crosses into the brain freely, which is why the effect arrives fast and does not depend on any transporter.',
        molecularDetail:
          'Oral bioavailability approaches 100% with peak plasma concentration typically 30 to 60 minutes after ingestion. Caffeine crosses the blood-brain barrier by passive diffusion and is not a substrate for efflux pumps at relevant concentrations, so brain concentration tracks plasma closely — an unusual property that removes most of the pharmacokinetic uncertainty that clouds other supplements in this file.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It occupies the tiredness receptor without switching it on',
        laymanDesc:
          'Adenosine builds up while you are awake and, when it docks, tells the brain to slow down. Caffeine fits the same dock and blocks it. Nothing is added; a signal is silenced.',
        molecularDetail:
          'Caffeine is a competitive, non-selective antagonist at adenosine A1 and A2A receptors with low-micromolar affinity, which is the range achieved by ordinary consumption. A2A antagonism in the striatum, where A2A forms heteromers with dopamine D2 receptors, accounts for most of the psychostimulant effect. Phosphodiesterase inhibition and ryanodine receptor sensitisation require concentrations far above human exposure and are not the operative mechanism.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The same workload starts to feel easier',
        laymanDesc:
          'The clearest measured consequence during exercise is not more force. It is that a given effort registers as less hard, so more work gets done before the same subjective ceiling is reached.',
        molecularDetail:
          'Doherty and Smith measured a 5.6% reduction in rating of perceived exertion during constant-load exercise with no change at all in RPE at exhaustion, and an 11.2% improvement in performance, with the RPE reduction accounting for about 29% of the performance variance. The endpoint moves because the perceptual cost of the work falls, not because the ceiling rises.',
        iconName: 'Gauge',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'CYP1A2 clears it, at very different speeds in different people',
        laymanDesc:
          'One liver enzyme does most of the work of breaking caffeine down, and how fast it runs varies several-fold between people, which is why identical cups produce opposite experiences.',
        molecularDetail:
          'CYP1A2 performs the initial N3-demethylation to paraxanthine, which accounts for roughly 80% of caffeine clearance. Half-life in a healthy adult is around five hours but is roughly doubled by oral contraceptives and in pregnancy, roughly halved by smoking, and modified by the rs762551 polymorphism that defines the *1A and *1F alleles. Cornelis found opposite directions of coffee-associated myocardial infarction risk in slow and rapid metabolisers, with a gene-by-coffee interaction of P = .04.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'Daily use builds more receptors, and stopping exposes them',
        laymanDesc:
          'Under a permanent blockade the brain adds more adenosine receptors. When the caffeine clears, all of them receive the accumulated signal at once, which is a genuine headache rather than a psychological one.',
        molecularDetail:
          'Chronic caffeine exposure upregulates adenosine receptor density, which is the physical substrate of tolerance and of withdrawal. Juliano and Griffiths validated ten withdrawal symptoms, with headache incidence of 50%, functional impairment in 13%, onset at 12 to 24 hours, peak at 20 to 51 hours and duration of 2 to 9 days, from doses as low as 100 mg per day. Notably, Goncalves found the ergogenic response was unaffected by habitual intake — tolerance for alertness does not simply transfer to tolerance for performance.',
        iconName: 'RefreshCw',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Grgic 2020 umbrella review of 21 meta-analyses of caffeine and exercise',
        phase: 'Umbrella review of 11 systematic reviews containing 21 meta-analyses',
        sampleSize: 21,
        primaryEndpoint:
          'Effect of caffeine ingestion on aerobic endurance, muscle strength, muscle endurance, power, jumping and speed',
        endpointMet: true,
        statisticalPValue:
          'Ergogenic across all six domains; GRADE moderate for muscle endurance, muscle strength, anaerobic power and aerobic endurance',
        unreportedAdverseSignals:
          'Not all analyses gave a definite direction of effect once the 95% prediction interval was considered, and most individual studies were conducted among young men. Sample size here counts meta-analyses, not participants.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Doherty 2005 meta-analysis of caffeine and rating of perceived exertion',
        phase: 'Meta-analysis of 21 studies yielding 109 effect sizes',
        sampleSize: 21,
        primaryEndpoint: 'Change in rating of perceived exertion and in exercise performance',
        endpointMet: true,
        statisticalPValue:
          'RPE during exercise -5.6% (95% CI -4.5 to -6.7), effect size -0.47; performance +11.2% (95% CI 4.6 to 17.8)',
        unreportedAdverseSignals:
          'RPE at exhaustion was completely unchanged (0.01%, 95% CI -1.9 to 2.0), which means caffeine does not raise the subjective ceiling — it delays arrival at it.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT00182312 — CAP, caffeine for apnea of prematurity',
        phase: 'Randomised double-blind placebo-controlled multicentre',
        sampleSize: 2006,
        primaryEndpoint:
          'Composite of death, cerebral palsy, cognitive delay, deafness or blindness at 18 to 21 months corrected age',
        endpointMet: true,
        statisticalPValue:
          '40.2% caffeine versus 46.2% placebo, adjusted OR 0.77 (95% CI 0.64 to 0.93), P = 0.008; cerebral palsy 4.4% versus 7.3%, aOR 0.58, P = 0.009',
        unreportedAdverseSignals:
          'Caffeine temporarily reduced weight gain, greatest at two weeks (mean difference -23 g, P < 0.001). Rates of death, ultrasonographic brain injury and necrotising enterocolitis did not differ in the short-term analysis.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Goncalves 2017 — habitual caffeine intake and the acute ergogenic response',
        phase: 'Double-blind randomised crossover, counterbalanced, with a no-supplement control arm',
        sampleSize: 40,
        primaryEndpoint: 'Simulated cycling time-trial completion time stratified by habitual intake',
        endpointMet: true,
        statisticalPValue:
          'Caffeine 29.92 min versus placebo 30.81 and control 31.14, P = 0.0002; habitual intake as covariate P = 0.47; between-tertile difference P = 0.75',
        unreportedAdverseSignals:
          'Twenty of 40 cyclists improved beyond the test variation, meaning half did not respond meaningfully. All participants were male endurance-trained cyclists.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Drake 2013 — caffeine 400 mg at 0, 3 and 6 hours before bedtime',
        phase: 'Randomised placebo-controlled crossover with objective home sleep monitoring',
        sampleSize: 12,
        primaryEndpoint: 'Self-reported and objectively monitored sleep disturbance',
        endpointMet: true,
        statisticalPValue: 'Significant sleep disturbance at all three timings versus placebo, P < 0.05',
        unreportedAdverseSignals:
          'A small sample, but the six-hour finding is the empirical basis of the standard sleep-hygiene recommendation and had not previously been tested directly in the home environment.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Caffeine is ergogenic for aerobic endurance, muscle strength, muscle endurance, power, jumping and speed across 21 meta-analyses',
        'It reduces rating of perceived exertion during exercise by 5.6% and improves performance by 11.2%, with the two statistically linked',
        'In 2,006 premature infants it reduced death or neurodevelopmental disability from 46.2% to 40.2% and cerebral palsy from 7.3% to 4.4%',
        'The ergogenic response did not vary across low, moderate and high habitual consumers in a controlled crossover',
        'Four hundred milligrams six hours before bed significantly disrupted objectively monitored sleep',
      ],
      unsupportedInferences: [
        'That the daily lift a habitual user feels is a drug effect on a neutral baseline rather than partly withdrawal reversal',
        'That a consumer CYP1A2 genotype result can tell an individual how much coffee is cardiovascularly safe',
        'That the neonatal cerebral palsy result says anything about caffeine in adults, which it does not',
        'That an ergogenic effect measured almost entirely in young men generalises unchanged to everyone',
      ],
      whatFailedInitially: [
        'The two-decade sports-nutrition practice of pre-competition caffeine abstinence, which a controlled crossover found unnecessary',
        'The pre-1990s belief that phosphodiesterase inhibition was the mechanism, which requires concentrations no human reaches',
      ],
      realWorldOutcome: [
        'This is the strongest evidence base in this file and the page says so without hedging',
        'The effect is genuine but not universal: half the cyclists in the habituation study did not improve beyond test variation',
        'Withdrawal is a validated syndrome with a 50% headache incidence, triggered by habits as small as 100 mg a day',
      ],
    },
    deliverySystem: {
      type: 'Beverage, tablet, capsule, gum, powder or energy drink; intravenous or oral caffeine citrate as a neonatal prescription drug',
      description:
        'Sold in the United States as a dietary supplement under DSHEA when in supplement form, and regulated as a food additive in beverages. Absorption is near-complete and rapid by any oral route, and caffeine gum is absorbed buccally and faster still. The problematic format is bulk anhydrous powder, where a teaspoon can contain a dose several times what a person would ever consume as coffee and domestic scales cannot weigh accurately at the required precision. Pre-workout formulas are the most adulterated supplement category, and a performance effect from one of them is not necessarily a caffeine effect.',
      safetyProfile:
        'Anxiety, tremor, palpitations, gastro-oesophageal reflux and diuresis at higher intakes. Sleep disruption is measurable from a moderate dose taken six hours before bed. Withdrawal is a validated syndrome: 50% headache incidence, 13% clinically significant impairment, onset 12 to 24 hours, duration 2 to 9 days, from habits as small as 100 mg per day. Clearance is roughly halved in smokers and roughly doubled by oral contraceptives and in pregnancy. Caffeine markedly raises exposure to and is raised by CYP1A2 interactions including fluvoxamine and ciprofloxacin. In slow CYP1A2 metabolisers a case-control study found higher myocardial infarction odds at four or more cups daily, which is observational and inconsistently replicated. Acute overdose from concentrated powder is the one genuinely lethal presentation.',
    },
    commonQuestions: [
      {
        q: 'Does caffeine actually improve performance, or is that marketing?',
        a: 'It works, and this page will not hedge it. An umbrella review of eleven systematic reviews containing 21 meta-analyses found caffeine ergogenic for aerobic endurance, muscle strength, muscle endurance, power, jumping and speed, with GRADE-moderate evidence for four of those. The mechanism is partly identified: it reduces how hard a given workload feels by about 5.6% without changing the effort level at which people quit, so more work happens before the same ceiling. That is a better-supported claim than anything else in this file.',
        auditNote:
          'The stated limits are worth keeping: most trials were in young men, and half the cyclists in one controlled study did not respond beyond test variation.',
      },
      {
        q: 'Do I need to stop caffeine before a race for it to work?',
        a: 'On the best available evidence, no. Forty trained cyclists split into low, moderate and high habitual consumers all improved their time trials with caffeine, and habitual intake had no influence on the size of the response as a covariate, across tertiles, or as a correlation. The abstinence protocols that dominated sports nutrition advice for two decades were built on an assumption rather than a test, and when the test was run it did not hold.',
      },
      {
        q: 'Is the morning coffee doing anything, or just fixing withdrawal?',
        a: 'Both, and the honest answer separates them. Caffeine withdrawal is a validated syndrome with ten confirmed symptoms; headache occurs in half of people and clinically significant impairment in 13%, from habits as small as 100 mg a day, with symptoms starting 12 to 24 hours after the last dose. So a habitual user\'s pre-coffee state is below their own neutral baseline, and part of what the first cup restores is that deficit. What that does not do is erase the performance evidence, which comes from controlled crossovers with placebo arms.',
      },
      {
        q: 'How late is too late?',
        a: 'A controlled study gave people 400 mg at bedtime, three hours before bed, and six hours before bed, and measured sleep both by report and by a validated home monitor. All three timings significantly disrupted sleep, including the six-hour one. The authors said the magnitude of total sleep time lost at six hours was large enough to justify the standard advice to stop at least six hours before bed. The mechanism makes this worse than it sounds: caffeine blocks the very adenosine signal that sleep exists to clear.',
      },
      {
        q: 'Is caffeine ever a real medicine?',
        a: 'Yes, and it is one of the more remarkable results in neonatology. In 2,006 infants weighing 500 to 1,250 g at birth, caffeine reduced the need for supplemental oxygen at 36 weeks from 47% to 36%, and at 18 to 21 months reduced the composite of death or neurodevelopmental disability from 46.2% to 40.2%, with cerebral palsy falling from 7.3% to 4.4%. Caffeine citrate holds an FDA approval for apnea of prematurity. None of that transfers to an adult drinking coffee, and it is regularly quoted as though it did.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'Juliano LM, Griffiths RR. A critical review of caffeine withdrawal: empirical validation of symptoms and signs, incidence, severity, and associated features. Psychopharmacology (Berl) 2004;176:1-29',
        identifier: '10.1007/s00213-004-2000-x',
        kind: 'doi',
      },
      {
        label:
          'Doherty M, Smith PM. Effects of caffeine ingestion on rating of perceived exertion during and after exercise: a meta-analysis. Scand J Med Sci Sports 2005;15:69-78',
        identifier: '10.1111/j.1600-0838.2005.00445.x',
        kind: 'doi',
      },
      {
        label:
          'Schmidt B et al. Caffeine therapy for apnea of prematurity. N Engl J Med 2006;354:2112-2121',
        identifier: '10.1056/NEJMoa054065',
        kind: 'doi',
      },
      {
        label:
          'Cornelis MC, El-Sohemy A, Kabagambe EK, Campos H. Coffee, CYP1A2 genotype, and risk of myocardial infarction. JAMA 2006;295:1135-1141',
        identifier: '10.1001/jama.295.10.1135',
        kind: 'doi',
      },
      {
        label:
          'Schmidt B et al. Long-term effects of caffeine therapy for apnea of prematurity. N Engl J Med 2007;357:1893-1902',
        identifier: '10.1056/NEJMoa073679',
        kind: 'doi',
      },
      {
        label: 'CAP trial registration — caffeine for apnea of prematurity',
        identifier: 'NCT00182312',
        kind: 'nct',
      },
      {
        label:
          'Drake C, Roehrs T, Shambroom J, Roth T. Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. J Clin Sleep Med 2013;9:1195-1200',
        identifier: '10.5664/jcsm.3170',
        kind: 'doi',
      },
      {
        label:
          'Goncalves LS et al. Dispelling the myth that habitual caffeine consumption influences the performance response to acute caffeine supplementation. J Appl Physiol (1985) 2017;123:213-220',
        identifier: '10.1152/japplphysiol.00260.2017',
        kind: 'doi',
      },
      {
        label:
          'Grgic J et al. Wake up and smell the coffee: caffeine supplementation and exercise performance — an umbrella review of 21 published meta-analyses. Br J Sports Med 2020;54:681-688',
        identifier: '10.1136/bjsports-2018-100278',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA — NDA 020793, CAFCIT (caffeine citrate) for apnea of prematurity',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020793',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2519 — Caffeine',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2519',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Whey protein — the supplement effect is real, replicated, and 0.30 kg of fat-free mass. Above
  // 1.62 g/kg/day of total protein it stops entirely, and the anabolic window did not survive
  // controlling for total intake.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'whey-protein',
    name: 'Whey protein',
    tradeName:
      'Sold as whey concentrate, whey isolate and whey hydrolysate — three processing grades of the same starting material',
    sponsor:
      'No single sponsor — the soluble protein fraction of milk, a by-product of cheese manufacture, filtered and dried by many manufacturers',
    targetGene: 'MTOR',
    targetProtein:
      'mTOR complex 1, the nutrient-sensing kinase that switches on muscle protein synthesis. The specific input is leucine, sensed by Sestrin2 upstream of GATOR2, which relieves inhibition of mTORC1 at the lysosome. Whey matters because of how much leucine it delivers and how fast, not because whey protein is itself anabolic.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for muscle gain, recovery and satiety. Not approved by the FDA or EMA for any indication. Hydrolysed whey formulas are separately used clinically as hypoallergenic infant feeds and in enteral nutrition, which is a different product for a different purpose.',
    patientFriendlyIndication:
      'Taken after training to build muscle, and generally to hit a daily protein target',
    conditionContext: {
      conditionExplainer:
        'Muscle is in constant turnover. Resistance training raises the rate at which muscle protein is broken down and the rate at which it is built, and net gain over months depends on the balance. Eating protein raises the building rate for a few hours, and the amino acid leucine is the specific chemical trigger the cell reads.',
      whyItMatters:
        'Whey is the biggest-selling supplement category in the world and the one where the underlying science is most solid — and where the marketing has nonetheless invented several things the science does not support. Whey does raise muscle protein synthesis more than casein or soy. Adding it to a training programme does add muscle. The amount it adds, and the point at which adding more stops doing anything, are both known and both smaller than the aisle implies.',
      whoTakesThis:
        'Lifters and athletes, older adults being treated for sarcopenia, hospital patients on enteral nutrition, and a very large number of people who simply find a shake more convenient than cooking.',
      clinicalGoals:
        'Trials measured fractional rates of mixed muscle protein synthesis by stable-isotope infusion, one-repetition maximum strength, fat-free mass by DXA, muscle fibre cross-sectional area from biopsy, mid-femur cross-sectional area, and glomerular filtration rate in the safety literature.',
    },
    oneSentenceVerdict:
      'Across 49 trials in 1,863 people, protein supplementation added 0.30 kg of fat-free mass and 2.49 kg of one-repetition maximum on top of resistance training — a real, replicated, modest effect that stops entirely once total protein intake passes 1.62 g/kg/day, and the post-workout anabolic window disappeared once total daily intake was controlled for.',
    laymanHowItWorks:
      'Whey is the watery part of milk left behind when cheese is made, dried into a powder. It is digested unusually fast and is unusually rich in leucine, an amino acid that acts as a switch: when enough of it arrives in the blood at once, a sensor inside the muscle cell turns on the machinery that builds new protein. That switch stays on for a few hours and then turns off regardless of how much more protein you eat, which is why a very large dose is not proportionally better than a moderate one — the surplus is simply burned for energy.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 78,
    anatomicalSite:
      'Skeletal muscle fibre cytoplasm, at the lysosomal surface where mTORC1 is activated; digestion and absorption in the proximal small intestine',
    substitutes: {
      summary:
        'Whey has no advantage over food that survives contact with the meta-analysis. It is faster and more leucine-dense per gram than most whole foods, which matters acutely; over a training block, total daily protein is what predicts hypertrophy, and food supplies that perfectly well.',
      conventionalRx: [
        {
          name: 'Extensively hydrolysed whey infant formula',
          class: 'Medical nutrition, hypoallergenic feed',
          howItCompares:
            'The same starting material cut into peptides small enough to avoid triggering cow\'s milk protein allergy. A genuine clinical product with a genuine indication. It is not evidence for anything about muscle.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: solves a defined clinical problem. Cons: the word "hydrolysate" on a sports tub borrows credibility from this use, and hydrolysing whey for an adult buys speed of digestion, not a different biology.',
        },
      ],
      naturalFoods: [
        {
          name: 'Milk, cheese, yoghurt and any complete protein food',
          activeCompound: 'Leucine — about 10 to 11 percent of whey protein by weight',
          biologicalMechanism:
            'The cell senses leucine, not whey. Any food that delivers enough leucine in one sitting triggers the same mTORC1 response. Whey does it faster and with less volume, which is a convenience advantage and, in older adults with blunted anabolic sensitivity, sometimes a real one.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: Moore et al. found 20 g of whole egg protein maximally stimulated muscle protein synthesis after resistance exercise, and 40 g did not do more.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Soy protein isolate, as the tested comparator',
          activeCompound: 'Lower leucine content, still rapidly digested',
          biologicalMechanism:
            'Tang et al. measured it directly. After resistance exercise, muscle protein synthesis on whey was about 31% greater than on soy and about 122% greater than on casein, with soy sitting between the two — an ordering that tracks digestion speed and leucine delivery rather than any unique property of dairy.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Add up total daily protein before buying anything',
          action:
            'The meta-regression that established the supplement effect also established where it stops: beyond a total intake of 1.62 g per kg of body mass per day, additional protein produced no further training-induced gain in fat-free mass.',
          patientImpact:
            'Someone already eating above that threshold from food is buying a supplement whose measured incremental effect on fat-free mass is zero, at any dose.',
          clinicalPrecaution:
            'The same analysis found the benefit shrinks with age and is larger in people already resistance-trained, which is the opposite of the pattern most marketing assumes.',
        },
        {
          name: 'The post-workout window is not a window',
          action:
            'Check whether a protein-timing claim controlled for total daily protein intake. The pooled effect looks real until it does, and then it is not there.',
          patientImpact:
            'In a meta-regression of 20 strength studies and 23 hypertrophy studies, a simple pooled analysis showed a small-to-moderate hypertrophy effect of protein timing. In the full model controlling for covariates, no significant difference remained for strength or hypertrophy, and total protein intake was the strongest predictor of effect size.',
          clinicalPrecaution:
            'This is a clean example of a confounded pooled result: timing groups ate more protein, and it was the protein doing the work.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)C[C@@H](C(=O)O)N',
      chemicalFormula: 'C6H13NO2',
      molecularWeight:
        '131.17 g/mol. This is L-leucine, not whey. Whey protein is a mixture of hundreds of proteins — beta-lactoglobulin, alpha-lactalbumin, immunoglobulins, serum albumin, lactoferrin — with no single molecule to draw. Leucine is the marker the literature actually tracks, because it is the amino acid the muscle cell senses, and whey is distinguished from other proteins chiefly by how much of it whey delivers and how quickly.',
      structureSource: {
        label: 'PubChem CID 6106 — L-Leucine, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6106',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'whey-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amino acid profile and nitrogen-spiking check, plus a heavy metal panel',
          description:
            'Protein content on a supplement label is usually derived from total nitrogen, and total nitrogen can be inflated by adding cheap nitrogen-rich compounds that are not protein. The only assay that catches this is a full amino acid profile, which also gives the leucine content that actually determines the biological effect. Run a heavy metal panel in the same pass, because independent testing has repeatedly found arsenic, cadmium, mercury and lead in this product category.',
          reagentsAndBuffer:
            'Acid hydrolysis in 6 M HCl at 110 degrees C for 24 h; amino acid analysis by ion-exchange chromatography with ninhydrin detection; separate performic acid oxidation for cysteine and methionine; Kjeldahl nitrogen for comparison against the amino acid sum; ICP-MS for arsenic, cadmium, mercury and lead against certified standards',
        },
        {
          id: 'whey-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the stable-isotope tracer infusion',
          description:
            'Muscle protein synthesis is a rate, not a quantity, and it can only be measured by tracking a labelled amino acid into muscle protein over time. This is the technique that produced every number in this dossier about whey versus casein versus soy, and it is why those numbers are trustworthy in a way that scale weight is not.',
          dependsOnStepId: 'whey-w1',
          reagentsAndBuffer:
            'L-[ring-13C6]phenylalanine for the primed constant infusion; [1-13C]leucine for the parallel oxidation measurement; sterile pyrogen-free preparation; priming dose calculated from the subject\'s estimated pool size; background enrichment sampled before infusion',
        },
        {
          id: 'whey-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Muscle biopsy processing and isolation of the mixed muscle protein fraction',
          description:
            'Separate the bound protein pool from the free intracellular amino acid pool, because tracer in the free pool is the precursor and tracer in the bound pool is the product. Confusing the two is the commonest way a synthesis rate comes out wrong, and it is why the biopsy handling is a validated step rather than a technicality.',
          dependsOnStepId: 'whey-w2',
          reagentsAndBuffer:
            'Vastus lateralis needle biopsy under local anaesthesia; homogenisation in ice-cold perchloric acid; separation of intracellular free amino acids from the protein pellet; repeated washing of the pellet; acid hydrolysis of the mixed muscle protein fraction; derivatisation for GC-combustion-isotope ratio mass spectrometry',
        },
        {
          id: 'whey-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Leucine sensing at the lysosome, with the Sestrin2 arm',
          description:
            'Test whether the anabolic signal is leucine-specific rather than protein-specific by supplying matched essential amino acids with and without leucine, and by disrupting the sensor. If mTORC1 activation tracks leucine and not total protein, then the entire whey-versus-casein-versus-soy ordering has a single explanation.',
          dependsOnStepId: 'whey-w3',
          reagentsAndBuffer:
            'C2C12 myotubes and primary human myotubes; amino-acid-free DMEM baseline; leucine add-back at graded concentrations; Sestrin2 knockdown by siRNA; rapamycin and Torin1 as mTORC1 inhibitors; phospho-p70S6K Thr389 and phospho-4E-BP1 immunoblotting; lysosomal mTOR co-localisation by immunofluorescence',
        },
        {
          id: 'whey-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Fractional synthetic rate alongside a long-term body composition endpoint',
          description:
            'Report the acute synthesis rate and the chronic composition change together, because they do not agree as often as the field implies. Whey raises the acute rate substantially more than casein; the chronic supplementation meta-analysis finds 0.30 kg of fat-free mass across all protein types. An acute mechanistic win is not a training outcome.',
          dependsOnStepId: 'whey-w4',
          reagentsAndBuffer:
            'GC-combustion-IRMS for tracer enrichment in the bound protein pool; fractional synthetic rate expressed as percent per hour; DXA for fat-free mass with a standardised hydration and fasting protocol; muscle fibre cross-sectional area by immunohistochemistry on the same biopsy',
        },
      ],
    },
    keyAudits: [
      {
        id: 'whey-a1',
        category: 'measured',
        title: 'The supplement effect is real, replicated, and 0.30 kg of fat-free mass',
        laymanSummary:
          'Across 49 randomised trials in 1,863 people, adding protein to a training programme produced measurably more muscle and strength than training alone. The amount was about a third of a kilogram of lean mass.',
        technicalDetails:
          'Morton and colleagues meta-analysed randomised controlled trials with at least six weeks of resistance training plus protein supplementation. Across 49 studies and 1,863 participants, protein supplementation significantly increased one-repetition-maximum strength by 2.49 kg (95% CI 0.64 to 4.33), fat-free mass by 0.30 kg (95% CI 0.09 to 0.52), muscle fibre cross-sectional area by 310 square micrometres (95% CI 51 to 570) and mid-femur cross-sectional area by 7.2 square millimetres (95% CI 0.20 to 14.30). Every one of those is statistically significant and every one is small. Two meta-regression findings matter as much as the headline: the effect on fat-free mass fell with increasing age (-0.01 kg per year, P = 0.002) and was larger in people already resistance-trained (+0.75 kg, P = 0.03). The population most often sold protein for sarcopenia is the population in which the supplement effect is weakest.',
        evidenceSource: 'Morton RW et al. Br J Sports Med 2018;52:376-384',
        doi: '10.1136/bjsports-2017-097608',
        measuredMetric:
          'Change in fat-free mass, one-repetition maximum, muscle fibre cross-sectional area and mid-femur cross-sectional area',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a2',
        category: 'measured',
        title: 'It stops working above 1.62 g per kg per day, and the analysis says so exactly',
        laymanSummary:
          'The same meta-analysis found the point where extra protein stops adding anything: once total daily intake passes about 1.6 grams per kilogram of body weight, more protein produced no further muscle gain.',
        technicalDetails:
          'A two-phase break point analysis across the 49 included studies determined that protein supplementation beyond a total protein intake of 1.62 g/kg/day resulted in no further resistance-training-induced gains in fat-free mass. This is not an opinion or a rule of thumb — it is a break point estimated from the pooled data, and it defines the exact boundary of the product\'s usefulness. A person already eating above that from food is, on the best available evidence, buying a supplement with a measured incremental effect of zero on fat-free mass, no matter how much of it they take. The finding also reframes the whole category: whey is not a muscle-building agent, it is a convenient way to reach a threshold, and past the threshold it is protein-flavoured food.',
        evidenceSource: 'Morton RW et al. Br J Sports Med 2018;52:376-384',
        doi: '10.1136/bjsports-2017-097608',
        measuredMetric:
          'Two-phase break point in the relationship between total protein intake and change in fat-free mass',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a3',
        category: 'measured',
        title: 'Whey does beat casein and soy acutely, by 122% and 31%',
        laymanSummary:
          'A stable-isotope study measured muscle protein synthesis directly after equal amounts of essential amino acids from whey, casein or soy. Whey produced by far the biggest response.',
        technicalDetails:
          'Tang and colleagues gave three groups of six healthy young men drinks matched for essential amino acid content at 10 g, as whey hydrolysate, micellar casein or soy protein isolate, after unilateral leg resistance exercise, with mixed muscle protein synthesis measured by primed constant infusion of L-[ring-13C6]phenylalanine. Whey produced larger increases in blood essential amino acids, branched-chain amino acids and leucine than either comparator (P < 0.05). At rest, mixed muscle protein synthesis was 0.091 +/- 0.015 %/h on whey, 0.078 +/- 0.014 on soy and 0.047 +/- 0.008 on casein — whey approximately 93% greater than casein (P < 0.01) and 18% greater than soy (P = 0.067). After exercise the ordering held: whey approximately 122% greater than casein (P < 0.01) and 31% greater than soy (P < 0.05). This is a genuine, mechanistically clean advantage for whey, and it is an acute synthesis rate in six men per group, not a training outcome. The chronic meta-analysis that measured training outcomes did not separate protein sources.',
        evidenceSource: 'Tang JE, Moore DR, Kujbida GW, Tarnopolsky MA, Phillips SM. J Appl Physiol 2009;107:987-992',
        doi: '10.1152/japplphysiol.00076.2009',
        measuredMetric:
          'Fractional rate of mixed muscle protein synthesis, percent per hour, at rest and after resistance exercise',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a4',
        category: 'conclusion_shift',
        title: 'The anabolic window vanished when total protein was controlled for',
        laymanSummary:
          'The belief that protein must be taken within an hour of training looked supported until researchers accounted for the fact that the timing groups also ate more protein overall. Then the effect disappeared.',
        technicalDetails:
          'Schoenfeld, Aragon and Krieger ran a multi-level meta-regression of randomised controlled trials of protein timing. The strength analysis comprised 478 subjects and 96 effect sizes nested within 41 groups and 20 studies; the hypertrophy analysis comprised 525 subjects and 132 effect sizes nested within 47 groups and 23 studies. A simple pooled analysis without controlling for covariates showed a small-to-moderate effect of protein timing on hypertrophy and no significant effect on strength. In the full meta-regression model controlling for all covariates, no significant difference was found between treatment and control for either strength or hypertrophy, and the reduced model did not differ from the full model. Total protein intake was the strongest predictor of hypertrophy effect size. The authors wrote that these results refute the commonly held belief that timing of protein intake around a training session is critical. It is one of the cleanest published demonstrations that an apparently real effect was a confounder wearing a mechanism.',
        evidenceSource: 'Schoenfeld BJ, Aragon AA, Krieger JW. J Int Soc Sports Nutr 2013;10:53',
        doi: '10.1186/1550-2783-10-53',
        measuredMetric:
          'Effect size for muscle strength and hypertrophy attributable to protein timing, before and after covariate control',
        inferredClaim:
          'That protein consumed close to a training session produces adaptations beyond those explained by total daily protein intake',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a5',
        category: 'inferred',
        title: 'Twenty grams maxed out the response, and the surplus was oxidised',
        laymanSummary:
          'A dose-response study found muscle protein synthesis peaked at 20 grams of protein after training. Forty grams did not build more; it was burned for energy instead.',
        technicalDetails:
          'Moore and colleagues had six healthy young men perform intense leg resistance exercise on five separate occasions and consume, in randomised order, drinks containing 0, 5, 10, 20 or 40 g of whole egg protein, with protein synthesis and whole-body leucine oxidation measured over four hours by primed constant infusion of [1-13C]leucine. Muscle protein synthesis showed a dose response and was maximally stimulated at 20 g. Albumin synthesis also plateaued at 20 g. Leucine oxidation increased significantly after 20 and 40 g — that is, protein consumed above the threshold was demonstrably burned rather than incorporated. Phosphorylation of p70S6K, ribosomal protein S6 and eIF2B-epsilon was unaffected by any dose, which the authors read as evidence that the stimulation depends on amino acid availability rather than on further signalling amplification. Six men and whole egg protein is a narrow base, and larger doses matter more in older adults and after whole-body training. But the shape of the curve — a plateau with oxidation of the excess — is the single most useful fact about protein dosing and the one the 50-gram serving scoop ignores.',
        evidenceSource: 'Moore DR et al. Am J Clin Nutr 2009;89:161-168',
        doi: '10.3945/ajcn.2008.26401',
        measuredMetric:
          'Muscle and albumin protein synthesis and whole-body leucine oxidation across 0, 5, 10, 20 and 40 g protein doses',
        inferredClaim:
          'That a larger protein serving produces a proportionally larger anabolic response, when synthesis plateaued at 20 g and the surplus was oxidised',
        auditFlag: 'caution',
      },
      {
        id: 'whey-a6',
        category: 'conclusion_shift',
        title: 'The kidney warning did not survive the meta-analysis',
        laymanSummary:
          'High-protein diets were long said to damage kidneys. Pooling 28 randomised trials in healthy adults found no difference in the change in kidney filtration rate.',
        technicalDetails:
          'Devries and colleagues systematically reviewed randomised controlled trials longer than four days comparing higher-protein intakes (at least 1.5 g/kg body weight, or at least 20% of energy, or at least 100 g/day) against normal or lower protein intakes, in adults without kidney disease, with glomerular filtration rate as the outcome. Twenty-eight trials with 1,358 participants were analysed. The post-intervention comparison showed a trivial effect for GFR to be higher after higher-protein intakes (standardised mean difference 0.19, 95% CI 0.07 to 0.31, P = 0.002), while the change in GFR from pre- to post-intervention did not differ between interventions (SMD 0.11, 95% CI -0.05 to 0.27, P = 0.16). There was a linear relation between protein intake and post-intervention GFR (r = 0.332, P = 0.03) but not between protein intake and the change in GFR (r = 0.184, P = 0.33). The physiological reading is that a higher protein load raises filtration as an adaptive response, not as an injury. The caveat that belongs on the record: these are healthy adults, and the trials are short relative to a lifetime of habitual intake.',
        evidenceSource: 'Devries MC et al. J Nutr 2018;148:1760-1775',
        doi: '10.1093/jn/nxy197',
        measuredMetric:
          'Glomerular filtration rate, post-intervention and as change from baseline, on higher versus normal or lower protein intakes',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a7',
        category: 'inferred',
        title: 'Heavy metals: found repeatedly, then assessed as safe by industry-adjacent consultants',
        laymanSummary:
          'Consumer testing found arsenic, cadmium, mercury and lead in protein powders, with 40 percent of 133 products elevated. A follow-up risk assessment concluded the exposures were below regulatory thresholds. Its three authors all worked for the same litigation-support consultancy.',
        technicalDetails:
          'Bandara, Towle and Monnot performed a human health risk assessment responding to a Consumer Reports analysis of 15 protein powders, which had found that average heavy metal amounts in three servings per day exceeded the maximum limits proposed by the US Pharmacopeia, and to a follow-up study reporting that 40% of 133 protein powder products tested had elevated heavy metal levels. Using US EPA reference doses for arsenic and cadmium, the EPA screening level for mercury, and the EPA Adult Lead Methodology model, they calculated hazard quotients and a cumulative hazard index for each product at one and three servings per day. All hazard indices were below 1 and all modelled blood lead levels were below the CDC guidance value of 5 micrograms per decilitre. The highest hazard indices, approaching 1, were in mass-gain products; the lowest were in whey protein powders. Their conclusion was that typical intake would not result in adverse health effects. Two facts belong alongside that conclusion. First, all three authors were affiliated with Cardno ChemRisk, a consultancy whose work is frequently commissioned in product-liability contexts. Second, "hazard index below 1" is a regulatory screening threshold, not a demonstration of no effect, and the underlying contamination finding — that the metals are present, and elevated in a substantial minority of products — is not in dispute.',
        evidenceSource: 'Bandara SB, Towle KM, Monnot AD. Toxicol Rep 2020;7:1255-1262',
        doi: '10.1016/j.toxrep.2020.08.001',
        inferredClaim:
          'That a hazard index below the regulatory screening threshold, calculated by industry-adjacent consultants, closes the question of heavy metal contamination in protein powders',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Digested fast, which is the whole point of whey',
        laymanDesc:
          'Whey stays liquid in the stomach instead of clotting, so it empties quickly and floods the bloodstream with amino acids within about half an hour. Casein does the opposite.',
        molecularDetail:
          'Whey proteins remain soluble at gastric pH while casein micelles precipitate into a curd, producing a much faster gastric emptying and a sharper plasma aminoacidaemia. Tang et al. measured the consequence: blood essential amino acid, branched-chain amino acid and leucine concentrations all rose more after whey than after casein or soy (P < 0.05). Hydrolysing whey further accelerates this without changing the amino acids delivered.',
        iconName: 'Zap',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Leucine is the signal, not protein in general',
        laymanDesc:
          'The muscle cell is not counting grams of protein. It is watching for one amino acid, and when enough of it arrives at once, a switch flips.',
        molecularDetail:
          'Leucine binds Sestrin2, releasing its inhibition of GATOR2, which permits mTORC1 activation at the lysosomal surface. Whey is roughly 10 to 11 percent leucine by weight, higher than casein and considerably higher than most plant proteins, which is the single best explanation for the whey-over-soy-over-casein ordering in acute synthesis measurements.',
        iconName: 'ToggleRight',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'mTORC1 switches on the protein-building machinery',
        laymanDesc:
          'Once triggered, a master kinase turns on the cellular machinery that reads genetic instructions into new muscle protein. It stays on for a few hours.',
        molecularDetail:
          'Activated mTORC1 phosphorylates p70S6K and 4E-BP1, relieving translational repression and increasing translation initiation. Notably, Moore et al. found phosphorylation of p70S6K Thr389, ribosomal protein S6 Ser240/244 and eIF2B-epsilon Ser539 was unaffected across protein doses from 0 to 40 g, which argues the dose-response in synthesis is driven by substrate availability rather than by graded signalling.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The response saturates, and the surplus is burned',
        laymanDesc:
          'Past about twenty grams the building rate stops rising. Extra protein does not sit around waiting; it gets oxidised for energy.',
        molecularDetail:
          'Moore et al. found muscle protein synthesis and albumin synthesis both maximally stimulated at 20 g of whole egg protein after resistance exercise, with whole-body leucine oxidation rising significantly at 20 and 40 g. The plateau is a property of the anabolic response, not of absorption — the amino acids are absorbed either way, they are simply deaminated and the carbon skeletons oxidised.',
        iconName: 'Flame',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Over months this compounds into about a third of a kilogram',
        laymanDesc:
          'Repeated across a training block, the extra synthesis adds up to a small but genuine amount of additional muscle over training alone.',
        molecularDetail:
          'Across 49 randomised trials and 1,863 participants, protein supplementation added 0.30 kg of fat-free mass (95% CI 0.09 to 0.52), 2.49 kg of one-repetition maximum (95% CI 0.64 to 4.33) and 310 square micrometres of muscle fibre cross-sectional area (95% CI 51 to 570) beyond training alone — with the whole effect conditional on total protein intake being below 1.62 g/kg/day.',
        iconName: 'TrendingUp',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Morton 2018 meta-analysis of protein supplementation and resistance training',
        phase: 'Meta-analysis and meta-regression of 49 randomised controlled trials',
        sampleSize: 1863,
        primaryEndpoint: 'Change in fat-free mass and one-repetition-maximum strength',
        endpointMet: true,
        statisticalPValue:
          'FFM +0.30 kg (95% CI 0.09 to 0.52); 1RM +2.49 kg (95% CI 0.64 to 4.33); break point at 1.62 g/kg/day total protein, beyond which no further FFM gain',
        unreportedAdverseSignals:
          'Effect on fat-free mass declined with age (-0.01 kg per year, P = 0.002) and was larger in already-trained individuals (+0.75 kg, P = 0.03) — the reverse of the pattern implied by marketing aimed at beginners and older adults.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Tang 2009 — whey hydrolysate versus micellar casein versus soy isolate',
        phase: 'Randomised parallel-group stable-isotope infusion study',
        sampleSize: 18,
        primaryEndpoint:
          'Fractional rate of mixed muscle protein synthesis at rest and after resistance exercise',
        endpointMet: true,
        statisticalPValue:
          'After exercise, whey approximately 122% greater than casein (P < 0.01) and 31% greater than soy (P < 0.05); at rest 93% greater than casein (P < 0.01) and 18% greater than soy (P = 0.067)',
        unreportedAdverseSignals:
          'Six men per group and a single acute measurement. The resting whey-versus-soy comparison did not reach significance. Acute synthesis rates and long-term hypertrophy diverge often enough that this cannot be read as a training result.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Moore 2009 — ingested protein dose response after resistance exercise',
        phase: 'Randomised within-subject dose-response with stable-isotope infusion',
        sampleSize: 6,
        primaryEndpoint:
          'Muscle and albumin protein synthesis across 0, 5, 10, 20 and 40 g protein doses',
        endpointMet: true,
        statisticalPValue:
          'Maximal stimulation of muscle and albumin protein synthesis at 20 g; leucine oxidation significantly increased at 20 and 40 g',
        unreportedAdverseSignals:
          'Six young men, whole egg protein, single-limb exercise. The 20 g plateau is widely generalised to older adults and whole-body training, where the evidence suggests a higher threshold.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Schoenfeld 2013 meta-regression of protein timing',
        phase: 'Multi-level meta-regression of randomised controlled trials',
        sampleSize: 525,
        primaryEndpoint: 'Muscle strength and hypertrophy effect size attributable to protein timing',
        endpointMet: false,
        statisticalPValue:
          'Simple pooled analysis showed a small-to-moderate hypertrophy effect; in the full model controlling for covariates, no significant difference for strength or hypertrophy',
        unreportedAdverseSignals:
          'Total protein intake was the strongest predictor of hypertrophy effect size, meaning the apparent timing effect was a total-intake effect in disguise.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Devries 2018 meta-analysis of higher-protein intake and kidney function',
        phase: 'Systematic review and meta-analysis of 28 randomised controlled trials',
        sampleSize: 1358,
        primaryEndpoint: 'Glomerular filtration rate on higher versus normal or lower protein intake',
        endpointMet: false,
        statisticalPValue:
          'Post-intervention GFR SMD 0.19 (95% CI 0.07 to 0.31), P = 0.002; change in GFR SMD 0.11 (95% CI -0.05 to 0.27), P = 0.16',
        unreportedAdverseSignals:
          'Restricted to adults without kidney disease, and trials were short relative to habitual lifetime intake. Post-intervention GFR was higher on high protein, which is read as adaptive hyperfiltration rather than injury — a reading, not a measurement.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Protein supplementation added 0.30 kg fat-free mass and 2.49 kg one-repetition maximum across 49 trials in 1,863 people',
        'The break point was 1.62 g/kg/day total protein, beyond which no further fat-free mass gain occurred',
        'Whey raised post-exercise muscle protein synthesis approximately 122% above casein and 31% above soy',
        'Muscle protein synthesis plateaued at 20 g of protein, with leucine oxidation rising at 20 and 40 g',
        'Change in glomerular filtration rate did not differ between higher and lower protein intakes across 28 trials',
      ],
      unsupportedInferences: [
        'That protein must be taken in a window around training, which vanished when total daily intake was controlled for',
        'That a larger serving produces a proportionally larger response, when the response plateaued at 20 g',
        'That whey\'s acute superiority over casein and soy translates into superior long-term hypertrophy, which no chronic trial has separated',
        'That heavy metal contamination is a closed question because one industry-adjacent risk assessment computed a hazard index below 1',
      ],
      whatFailedInitially: [
        'The anabolic window, refuted in a meta-regression of 43 study groups once total protein was entered as a covariate',
        'The high-protein kidney warning, which did not survive 28 randomised trials in healthy adults',
      ],
      realWorldOutcome: [
        'Whey works, the mechanism is understood down to the amino acid, and this page says so without hedging',
        'The effect is small, is conditional on being below a total-intake threshold, and shrinks with age',
        'Protein powder is a convenience product for reaching a number, and above that number its measured incremental effect is zero',
      ],
    },
    deliverySystem: {
      type: 'Oral powder reconstituted in liquid; concentrate, isolate or hydrolysate',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy, safety or content before sale. The three grades differ by processing rather than by biology: concentrate retains more lactose and fat, isolate is filtered further to a higher protein percentage, and hydrolysate is pre-cleaved into peptides for faster absorption. All three deliver the same amino acids, and leucine content per gram of protein is nearly identical between them. Label protein content is usually derived from total nitrogen, which is inflatable by nitrogen-rich non-protein additives, so a full amino acid profile is the only assay that verifies the claim.',
      safetyProfile:
        'Bloating, flatulence and diarrhoea in lactose-intolerant users of concentrate, which isolate largely avoids. Cow\'s milk protein allergy is a genuine contraindication and is not the same as lactose intolerance. Higher protein intake does not change glomerular filtration rate in healthy adults across 28 randomised trials, but that evidence does not extend to existing chronic kidney disease, where protein restriction remains standard. Independent testing has repeatedly found arsenic, cadmium, mercury and lead in this product category, with plant-based and mass-gain formulas worse than whey; a subsequent risk assessment by industry-adjacent consultants calculated hazard indices below the regulatory screening threshold.',
    },
    commonQuestions: [
      {
        q: 'Does protein powder actually build muscle?',
        a: 'Yes, and the number is worth carrying. Across 49 randomised trials in 1,863 people, adding protein to at least six weeks of resistance training produced 0.30 kg more fat-free mass and 2.49 kg more on one-repetition maximum than training alone. Those are statistically significant and physically small. The important companion finding is the break point: beyond a total protein intake of 1.62 g per kilogram per day, additional protein produced no further gain in fat-free mass at all.',
        auditNote:
          'Whey is a convenient way to reach that threshold, not a separate anabolic agent.',
      },
      {
        q: 'Do I need to drink it right after training?',
        a: 'No. A meta-regression across 20 strength studies and 23 hypertrophy studies found that a simple pooled analysis suggested a timing effect, but once total protein intake and other covariates were entered into the model, no significant difference remained for strength or hypertrophy. Total protein intake was the strongest predictor of hypertrophy. The timing groups in those studies were eating more protein, and it was the protein doing the work.',
      },
      {
        q: 'Is whey better than casein or plant protein?',
        a: 'Acutely, yes, and by a lot: after resistance exercise, muscle protein synthesis on whey was about 122 percent higher than on casein and 31 percent higher than on soy in a stable-isotope study. The reason is leucine delivery and digestion speed, not anything unique to dairy. What has not been shown is that this acute advantage produces more muscle over a training block — the chronic meta-analysis that measured actual hypertrophy did not separate protein sources, and its effect size was the same modest 0.30 kg.',
      },
      {
        q: 'Will a big scoop work better than a small one?',
        a: 'Not for the anabolic response. A dose-response study found muscle protein synthesis maximally stimulated at 20 grams after resistance exercise, with no further increase at 40 grams, and leucine oxidation rising significantly at both — meaning the excess was measurably burned rather than built into muscle. That study used six young men and single-limb exercise, and the threshold is probably higher for older adults and whole-body sessions. But a plateau exists, and serving sizes are not set by it.',
      },
      {
        q: 'Is it bad for my kidneys?',
        a: 'Not in healthy adults, on the current evidence. Twenty-eight randomised trials in 1,358 participants without kidney disease found no difference in the change in glomerular filtration rate between higher and lower protein intakes. Post-intervention filtration was slightly higher on high protein, which is generally read as an adaptive response to a bigger nitrogen load rather than as damage. That reading is an interpretation, the trials are short, and none of it applies to someone who already has chronic kidney disease, where protein restriction remains standard care.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Moore DR et al. Ingested protein dose response of muscle and albumin protein synthesis after resistance exercise in young men. Am J Clin Nutr 2009;89:161-168',
        identifier: '10.3945/ajcn.2008.26401',
        kind: 'doi',
      },
      {
        label:
          'Tang JE, Moore DR, Kujbida GW, Tarnopolsky MA, Phillips SM. Ingestion of whey hydrolysate, casein, or soy protein isolate: effects on mixed muscle protein synthesis at rest and following resistance exercise in young men. J Appl Physiol 2009;107:987-992',
        identifier: '10.1152/japplphysiol.00076.2009',
        kind: 'doi',
      },
      {
        label:
          'Schoenfeld BJ, Aragon AA, Krieger JW. The effect of protein timing on muscle strength and hypertrophy: a meta-analysis. J Int Soc Sports Nutr 2013;10:53',
        identifier: '10.1186/1550-2783-10-53',
        kind: 'doi',
      },
      {
        label:
          'Morton RW et al. A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults. Br J Sports Med 2018;52:376-384',
        identifier: '10.1136/bjsports-2017-097608',
        kind: 'doi',
      },
      {
        label:
          'Devries MC et al. Changes in kidney function do not differ between healthy adults consuming higher- compared with lower- or normal-protein diets: a systematic review and meta-analysis. J Nutr 2018;148:1760-1775',
        identifier: '10.1093/jn/nxy197',
        kind: 'doi',
      },
      {
        label:
          'Bandara SB, Towle KM, Monnot AD. A human health risk assessment of heavy metal ingestion among consumers of protein powder supplements. Toxicol Rep 2020;7:1255-1262',
        identifier: '10.1016/j.toxrep.2020.08.001',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 6106 — L-Leucine, the marker amino acid tracked in the whey literature',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6106',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Levothyroxine — replacement therapy that is indispensable in real hypothyroidism and, in
  //    randomised trials of the borderline condition it is most often prescribed for, does nothing.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'levothyroxine',
    name: 'Levothyroxine',
    tradeName: 'Synthroid / Euthyrox / Levoxyl / Unithroid / Tirosint',
    sponsor:
      'Multiple: AbbVie (Synthroid), EMD Serono (Euthyrox), Pfizer/King (Levoxyl), IBSA (Tirosint). No single originator — the molecule predates modern drug approval.',
    targetGene: 'THRA / THRB',
    targetProtein:
      'Nuclear thyroid hormone receptors alpha and beta, acting as ligand-activated transcription factors',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2002,
    indication:
      'Replacement therapy in primary, secondary and tertiary hypothyroidism; and as an adjunct to surgery and radioiodine in the management of thyrotropin-dependent well-differentiated thyroid cancer',
    patientFriendlyIndication: 'An underactive thyroid gland',
    anatomicalSite: 'Cell nucleus, essentially every tissue in the body',
    conditionContext: {
      conditionExplainer:
        'The thyroid makes a hormone that sets the metabolic pace of nearly every cell. The pituitary monitors that hormone and releases thyroid-stimulating hormone to demand more when it senses too little. So a raised TSH is the pituitary shouting, and it is the number both diagnosis and dose adjustment are built on.',
      whyItMatters:
        'Overt hypothyroidism — low thyroid hormone with a clearly raised TSH — is a condition where replacement is unambiguously necessary and untreated disease is dangerous. Subclinical hypothyroidism — a raised TSH with thyroid hormone still inside the reference range — is a laboratory pattern, not a disease, and it is the reason for a large share of the prescriptions. Those two situations have very different evidence, and this page separates them.',
      whoTakesThis:
        'One of the most-dispensed prescription drugs in the United States and in many other countries. On the WHO Model List of Essential Medicines. A substantial fraction of prescriptions are written for subclinical hypothyroidism or for symptoms in people whose thyroid tests are normal.',
      clinicalGoals:
        'In overt hypothyroidism, restore thyroid hormone and normalise TSH. In subclinical hypothyroidism the intended goal is symptom relief, and that is exactly what the randomised trials measured and did not find.',
    },
    oneSentenceVerdict:
      'Synthetic thyroxine is straightforward replacement therapy in overt hypothyroidism and one of the most useful drugs in medicine there, but in 737 older adults with subclinical hypothyroidism it normalised TSH and produced a between-group difference of 0.0 points on hypothyroid symptoms and 0.4 points on tiredness against a threshold for clinical importance of 9.',
    laymanHowItWorks:
      'Levothyroxine is the same molecule your thyroid makes. Once absorbed, tissues convert it into the more active form, which enters the cell nucleus, binds a receptor sitting on DNA, and switches metabolic genes on. It is not a stimulant and it does not add anything: it replaces what a gland is not producing, and if the gland is producing enough already, there is nothing for it to replace.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 87,
    substitutes: {
      summary:
        'Generic levothyroxine costs three to ten cents a tablet in the United States; the branded Synthroid tablet costs about US$1.66 for the same strength on the same day, a roughly thirtyfold difference for the same molecule. Desiccated thyroid extract and T4-plus-T3 combinations are the two most-requested alternatives, and a meta-analysis of 11 randomised trials in 1,216 patients found combination therapy no better than T4 alone on any symptom measured.',
      conventionalRx: [
        {
          name: 'Branded levothyroxine (Synthroid)',
          class: 'The identical molecule, at a different price',
          howItCompares:
            'Chemically the same hormone. The historical case for brand loyalty rested on tablet-to-tablet potency variation, which was real before the FDA required new drug applications for levothyroxine products in the late 1990s and drove the potency specification tighter.',
          typicalCost:
            'US$1.66 per 100 mcg SYNTHROID tablet against US$0.051 per 100 mcg generic levothyroxine tablet at pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: consistent single-manufacturer product, which matters for a narrow-therapeutic-index drug titrated on a laboratory number. Cons: roughly thirty times the acquisition cost of the identical molecule.',
        },
        {
          name: 'Liothyronine (T3) added to levothyroxine',
          class: 'Combination thyroid hormone therapy',
          howItCompares:
            'A meta-analysis of 11 randomised trials with 1,216 patients found no difference between T4-T3 combination and T4 alone on bodily pain, depression, anxiety, fatigue, quality of life, body weight or any lipid fraction. Adverse events did not differ either. The 2014 American Thyroid Association task force concluded levothyroxine should remain the standard of care.',
          typicalCost: 'Liothyronine is a generic; combination adds a second prescription',
          prosAndCons:
            'Pros: addresses a plausible physiological argument about tissue-level T3 in athyreotic patients. Cons: eleven randomised trials found no measurable advantage, and T3 has a short half-life producing peaks that T4 does not.',
        },
        {
          name: 'Desiccated thyroid extract',
          class: 'Animal-derived thyroid preparation containing both T4 and T3',
          howItCompares:
            'Contains both hormones in a ratio set by pig physiology rather than by human requirement. The 2014 American Thyroid Association guideline reviewed thyroid extracts alongside synthetic combination therapy and did not recommend them over levothyroxine.',
          typicalCost: 'Varies by product; several are marketed without an approved new drug application',
          prosAndCons:
            'Pros: some patients report preferring it. Cons: fixed hormone ratio not matched to human needs, batch variability, and no randomised trial showing superiority on a symptom endpoint.',
        },
      ],
      naturalFoods: [
        {
          name: 'Iodine — necessary, and not a treatment for this',
          activeCompound: 'Iodide',
          biologicalMechanism:
            'Iodine is the raw material the thyroid uses to build thyroxine, and severe deficiency causes hypothyroidism and goitre. In iodine-replete populations, hypothyroidism is usually autoimmune destruction of the gland, and supplying more raw material to a gland that has been destroyed changes nothing. Excess iodine can itself precipitate thyroid dysfunction.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here. The relevant distinction is between iodine deficiency, where iodine is the treatment, and autoimmune hypothyroidism, where it is not.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Keep the timing relative to food and other tablets consistent',
          action:
            'Absorption is affected by food and by several common supplements and medicines. Consistency matters more than any particular schedule.',
          patientImpact:
            'Calcium salts, iron salts, proton pump inhibitors, bile acid sequestrants and soy protein all reduce levothyroxine absorption. Because the dose is titrated against a TSH measured weeks later, an inconsistent absorption pattern produces an unstable number and repeated dose changes chasing it.',
          clinicalPrecaution:
            'This page does not give a dosing schedule. The point is that changing your routine changes your effective dose, and the blood test will show it.',
        },
        {
          name: 'Ask what your TSH actually is before asking for more',
          action:
            'If symptoms persist, ask for the numerical TSH rather than a description of it as normal or abnormal.',
          patientImpact:
            'In 17,684 Scottish patients on long-term thyroxine, those with a suppressed TSH at or below 0.03 mU/L had increased cardiovascular disease (hazard ratio 1.37), dysrhythmias (1.6) and fractures (2.02) against those in the reference range. Those with a low but unsuppressed TSH of 0.04 to 0.4 had no increased risk of any of the three.',
          clinicalPrecaution:
            'That is an observational cohort, not a trial. It establishes an association between over-replacement and harm, and the direction of that association has been consistent across studies.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=C(C=C(C(=C1I)OC2=CC(=C(C(=C2)I)O)I)I)C[C@@H](C(=O)O)N',
      chemicalFormula: 'C15H11I4NO4',
      molecularWeight: '776.87 g/mol; dispensed as levothyroxine sodium, usually as a hydrate',
      targetReceptorAffinity:
        'Levothyroxine (T4) is itself a low-affinity ligand for the nuclear thyroid hormone receptors. Activity comes from outer-ring deiodination by the selenoenzymes DIO1 and DIO2 to triiodothyronine (T3), which binds the receptor with roughly ten to fifteen times higher affinity. Giving T4 rather than T3 hands dose control to each tissue\'s own deiodinase, which is the pharmacological argument for T4 monotherapy.',
      structureSource: {
        label:
          'PubChem CID 5819 (levothyroxine) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5819',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lev-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Iodine content and enantiomeric purity of the incoming thyronine',
          description:
            'Assay L-thyronine or the diiodinated precursor for optical rotation and for total iodine before further iodination. Only the L-enantiomer is active; D-thyroxine was itself once marketed as a lipid-lowering drug and was withdrawn after excess mortality in the Coronary Drug Project, so enantiomeric purity here is a safety specification and not a technicality.',
          reagentsAndBuffer:
            'L-thyronine reference standard, oxygen-flask combustion followed by iodide titration or inductively coupled plasma mass spectrometry for total iodine, chiral HPLC, Karl Fischer titration',
        },
        {
          id: 'lev-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Controlled iodination to the 3,5,3-prime,5-prime tetraiodo compound',
          description:
            'Iodinate the thyronine ring system to place exactly four iodine atoms in the required positions. Control is the whole difficulty: under-iodination gives liothyronine, which is a different drug with a different half-life, and the tri- and tetra-iodinated species differ by one atom in a molecule of 777 daltons.',
          dependsOnStepId: 'lev-w1',
          reagentsAndBuffer:
            'Iodine with potassium iodide in aqueous ammonia or ethylamine, controlled pH and temperature, nitrogen atmosphere, reversed-phase HPLC monitoring against liothyronine and reverse-T3 reference standards',
        },
        {
          id: 'lev-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Sodium salt formation and potency standardisation',
          description:
            'Form the sodium salt, dry to a defined hydration state, and assay potency against a reference standard. This step is why levothyroxine is a case study in pharmaceutical quality: doses are measured in micrograms, the tablet is mostly excipient, and content uniformity and stability over shelf life are the reason the FDA required new drug applications for products that had been marketed for decades.',
          dependsOnStepId: 'lev-w2',
          reagentsAndBuffer:
            'Sodium hydroxide in aqueous ethanol, controlled drying to the pentahydrate, USP levothyroxine sodium reference standard, HPLC potency assay, accelerated stability chambers at 40 degrees Celsius and 75% relative humidity',
        },
        {
          id: 'lev-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'MCT8-mediated transport and deiodinase activation in target cells',
          description:
            'Measure uptake into cells expressing the monocarboxylate transporter MCT8 and conversion to T3 by type 2 deiodinase. Thyroid hormone does not diffuse into cells freely: it requires transporters, and loss-of-function MCT8 mutations cause a severe neurological syndrome in which circulating hormone is high and brain tissue is hypothyroid — the clearest demonstration that a normal blood level is not the same as a normal tissue level.',
          dependsOnStepId: 'lev-w3',
          reagentsAndBuffer:
            'HEK293 or JEG-3 cells transfected with SLC16A2 (MCT8), recombinant DIO2, iodine-125-labelled thyroxine, dithiothreitol as thiol cofactor, propylthiouracil to distinguish DIO1 from DIO2 activity, Sephadex LH-20 chromatography for iodide separation',
        },
        {
          id: 'lev-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Thyroid response element reporter and TSH suppression readout',
          description:
            'Measure transcriptional activation through a thyroid hormone response element reporter construct, and separately measure thyrotropin suppression in a pituitary cell line. Both matter because the clinical dose is titrated on TSH, which is a pituitary readout, and the assumption that pituitary suppression tracks peripheral tissue effect is precisely the assumption the persistent-symptoms literature questions.',
          dependsOnStepId: 'lev-w4',
          reagentsAndBuffer:
            'HepG2 or CV-1 cells transfected with a DR4 thyroid hormone response element luciferase reporter plus THRB expression vector, charcoal-stripped fetal bovine serum to remove endogenous hormone, TtT-97 or pituitary primary cells for TSH beta subunit measurement, dual-luciferase detection reagents',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lev-a1',
        category: 'failed',
        title: 'TRUST: TSH normalised, symptoms did not move at all',
        laymanSummary:
          'Seven hundred and thirty-seven adults over 65 with a mildly raised thyroid-stimulating hormone took levothyroxine or placebo for a year. The blood number corrected. The difference in symptoms between the two groups was zero.',
        technicalDetails:
          'TRUST randomised 737 adults aged at least 65 with persisting subclinical hypothyroidism (thyrotropin 4.60 to 19.99 mIU/L, free thyroxine within the reference range) to levothyroxine (n=368, starting at 50 mcg daily or 25 mcg if under 50 kg or with coronary disease, titrated to thyrotropin) or placebo with mock dose adjustment (n=369). Mean age was 74.4 years. Mean thyrotropin was 6.40 mIU/L at baseline and at 1 year had fallen to 3.63 on levothyroxine against 5.48 on placebo (p<0.001) at a median dose of 50 mcg. The two primary outcomes, change in the Hypothyroid Symptoms score and the Tiredness score at 1 year on a 0-to-100 scale with a minimum clinically important difference of 9 points, showed between-group differences of 0.0 (95% CI -2.0 to 2.1) and 0.4 (-2.1 to 2.9). No secondary outcome showed benefit.',
        evidenceSource: 'Stott DJ et al., TRUST, N Engl J Med 2017;376:2534-2544 (NCT01660126)',
        doi: '10.1056/NEJMoa1603825',
        measuredMetric:
          'Change in Hypothyroid Symptoms and Tiredness scores at 1 year against a 9-point clinical importance threshold',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a2',
        category: 'failed',
        title: 'The oldest patients, where the case seemed strongest, showed the same nothing',
        laymanSummary:
          'A planned combined analysis in people aged 80 and over — the group most often described as needing treatment — found no improvement in symptoms or fatigue.',
        technicalDetails:
          'A prospectively planned combined analysis pooled the participants aged 80 and older from TRUST with a second randomised trial, 251 community-dwelling adults with subclinical hypothyroidism, mean age 85, of whom 118 (47%) were women and 212 (84%) completed. 112 received levothyroxine and 139 placebo. The hypothyroid symptoms score fell from 21.7 to 19.3 on levothyroxine and from 19.8 to 17.4 on placebo: adjusted between-group difference 1.3 (95% CI -2.7 to 5.2), p=0.53. The tiredness score rose from 25.5 to 28.2 on levothyroxine and from 25.1 to 28.7 on placebo: adjusted difference -0.1 (-4.5 to 4.3), p=0.96. Both are far below the 9-point minimum clinically important difference. At least one adverse event occurred in 29.5% on levothyroxine and 28.8% on placebo.',
        evidenceSource:
          'Mooijaart SP et al., JAMA 2019;322:1977-1986 (NCT01660126, NTR3851)',
        doi: '10.1001/jama.2019.17274',
        measuredMetric:
          'ThyPRO hypothyroid symptoms and tiredness domain scores at 1 year in adults aged 80 and older',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a3',
        category: 'conclusion_shift',
        title: 'Twenty-one trials and 2,192 adults: no benefit on quality of life or symptoms',
        laymanSummary:
          'Pooling every randomised trial of thyroid hormone for subclinical hypothyroidism found the treatment reliably normalised the blood test and reliably failed to change how people felt.',
        technicalDetails:
          'Feller and colleagues screened 3,088 publications and included 21 randomised trials with 2,192 adults randomised, comparing thyroid hormone therapy with placebo or no therapy in non-pregnant adults with subclinical hypothyroidism, minimum follow-up 3 months. Thyroid hormone therapy lowered mean thyrotropin into the reference range (0.5 to 3.7 mIU/L against 4.6 to 14.7 on placebo) but was not associated with benefit in general quality of life (n=796; standardised mean difference -0.11, 95% CI -0.25 to 0.03; I-squared 66.7%) or thyroid-related symptoms (n=858; SMD 0.01, -0.12 to 0.14; I-squared 0.0%). Risk of bias was low and the GRADE quality of evidence was judged moderate to high. The stated conclusion is that these findings do not support routine use of thyroid hormone therapy in adults with subclinical hypothyroidism.',
        evidenceSource: 'Feller M et al., JAMA 2018;320:1349-1359',
        doi: '10.1001/jama.2018.13770',
        measuredMetric:
          'Standardised mean difference in general quality of life and thyroid-related symptoms across 21 randomised trials',
        inferredClaim:
          'That correcting a raised thyrotropin in subclinical hypothyroidism relieves symptoms — the surrogate corrects reliably and the symptoms do not',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a4',
        category: 'failed',
        title: 'Adding T3 to T4 failed on every symptom measured, across 11 trials',
        laymanSummary:
          'Patients who still feel unwell on levothyroxine often ask for the second thyroid hormone to be added. Eleven randomised trials in 1,216 patients found no advantage on any measure.',
        technicalDetails:
          'Grozinsky-Glasberg and colleagues pooled 11 randomised trials with 1,216 patients randomised, comparing T4-T3 combination therapy with T4 monotherapy in adults with clinical hypothyroidism. No difference was found for bodily pain (SMD 0.00, 95% CI -0.34 to 0.35), depression (0.07, -0.20 to 0.34), anxiety (0.00, -0.12 to 0.11), fatigue (-0.12, -0.33 to 0.09) or quality of life (0.03, -0.09 to 0.15), nor for body weight, total cholesterol, triglycerides, LDL or HDL. Adverse events did not differ. The 2014 American Thyroid Association task force reviewed thyroid extracts, synthetic combination therapy, liothyronine and compounded preparations and concluded that levothyroxine should remain the standard of care.',
        evidenceSource:
          'Grozinsky-Glasberg S et al., J Clin Endocrinol Metab 2006;91:2592-2599; Jonklaas J et al., ATA guidelines, Thyroid 2014;24:1670-1751',
        doi: '10.1210/jc.2006-0448',
        measuredMetric:
          'Standardised mean differences in pain, depression, anxiety, fatigue and quality of life, combination versus monotherapy',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a5',
        category: 'measured',
        title: 'Over-replacement carries measured harm; slightly-low TSH does not',
        laymanSummary:
          'A Scottish cohort of nearly eighteen thousand people on thyroxine found more heart disease, more rhythm disturbance and more fractures in those whose TSH was fully suppressed — but not in those whose TSH was merely on the low side.',
        technicalDetails:
          'Flynn and colleagues linked regional datasets covering all 17,684 patients on thyroxine replacement in Tayside, Scotland, between 1993 and 2001, categorising them by TSH: suppressed (≤0.03 mU/L), low (0.04-0.4), normal (0.4-4.0) or raised (>4.0). Against the normal category, patients with a raised TSH had adjusted hazard ratios of 1.95 (1.73-2.21) for cardiovascular disease, 1.80 (1.33-2.44) for dysrhythmias and 1.83 (1.41-2.37) for fractures. Patients with a suppressed TSH had 1.37 (1.17-1.60), 1.6 (1.10-2.33) and 2.02 (1.55-2.62). Patients with a low but unsuppressed TSH had no increased risk of any of the three: 1.1 (0.99-1.123), 1.13 (0.88-1.47) and 1.13 (0.92-1.39). This is an observational cohort and cannot separate the dose from the reason for it.',
        evidenceSource: 'Flynn RW et al., J Clin Endocrinol Metab 2010;95:186-193',
        doi: '10.1210/jc.2009-1625',
        measuredMetric:
          'Adjusted hazard ratios for cardiovascular disease, dysrhythmias and fractures by TSH category in 17,684 treated patients',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a6',
        category: 'conclusion_shift',
        title: 'One of the most-prescribed drugs in America had no approved application until 2002',
        laymanSummary:
          'Levothyroxine products were sold in the United States for decades without ever having gone through the modern approval process, because they predated it. The FDA required applications in the late 1990s after repeated potency and stability problems.',
        technicalDetails:
          'Because orally administered levothyroxine sodium products entered the market before the modern efficacy and approval requirements applied to them, they were marketed for decades as unapproved drugs. Following documented potency and stability problems the FDA required manufacturers to submit new drug applications. The Drugs@FDA record shows the resulting approvals arriving in the 2000s: UNITHROID on 21 August 2000, LEVOXYL on 25 May 2001, LEVO-T on 1 March 2002, EUTHYROX on 31 May 2002 and SYNTHROID — by then already among the most-dispensed prescriptions in the country — on 24 July 2002. This is the reverse of the usual pattern on this site: not a claim outrunning its evidence, but a product outrunning its regulatory file, and the potency specification that resulted is the reason brand-to-generic substitution is treated cautiously for this molecule.',
        evidenceSource:
          'Drugs@FDA application records: SYNTHROID NDA 021402 (approved 24 July 2002), UNITHROID NDA 021210 (21 August 2000), LEVOXYL NDA 021301 (25 May 2001), EUTHYROX NDA 021292 (31 May 2002)',
        measuredMetric:
          'Original approval dates on file for levothyroxine sodium products in Drugs@FDA',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed in the upper small intestine, and easily interfered with',
        laymanDesc:
          'Most of the tablet is absorbed in the first part of the small intestine. Food, calcium, iron and acid-reducing medicines all cut how much gets through.',
        molecularDetail:
          'Oral absorption is roughly 40 to 80% and occurs chiefly in the jejunum and upper ileum, requiring gastric acid for tablet dissolution. Calcium and iron salts, proton pump inhibitors, bile acid sequestrants, sucralfate and soy protein all reduce it. The elimination half-life is about 7 days, which is why a dose change takes six weeks to show up on a TSH measurement.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It travels bound to proteins, and needs a transporter to enter a cell',
        laymanDesc:
          'Almost all of the hormone in your blood is stuck to carrier proteins; only a tiny free fraction is available. Getting into a cell requires a specific transporter rather than simple diffusion.',
        molecularDetail:
          'More than 99.95% of circulating T4 is bound to thyroxine-binding globulin, transthyretin and albumin. Cellular entry is transporter-mediated, principally by MCT8 (SLC16A2) and OATP1C1. Loss-of-function MCT8 mutations produce the Allan-Herndon-Dudley syndrome, in which serum hormone is high and brain tissue is hypothyroid — direct evidence that serum concentration and tissue exposure can diverge.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Each tissue converts it to the active form at its own rate',
        laymanDesc:
          'T4 is largely a prohormone. Selenium-containing enzymes inside each tissue strip one iodine atom off to make the far more active T3, and each tissue controls how much it makes.',
        molecularDetail:
          'Type 1 and type 2 iodothyronine deiodinases (DIO1, DIO2) catalyse outer-ring deiodination of T4 to T3; type 3 (DIO3) inactivates both by inner-ring deiodination. Local deiodinase activity sets intracellular T3 independently of the circulating level, which is the mechanistic argument for giving T4 rather than T3 — the tissue keeps control of its own exposure.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'T3 binds a receptor already sitting on DNA and flips it from off to on',
        laymanDesc:
          'The receptor is parked on the gene before the hormone arrives, holding it switched off. When the hormone binds, the receptor swaps its silencing partners for activating ones and the gene turns on.',
        molecularDetail:
          'Thyroid hormone receptors alpha and beta occupy thyroid hormone response elements as heterodimers with the retinoid X receptor, bound to corepressors NCoR and SMRT with histone deacetylase activity in the unliganded state. T3 binding triggers corepressor release and coactivator recruitment, switching transcription of genes for mitochondrial oxidative metabolism, sodium-potassium ATPase, beta-adrenergic receptor density and hepatic LDL receptor expression.',
        iconName: 'Repeat',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The pituitary stops shouting, and in overt disease the person recovers',
        laymanDesc:
          'As hormone is restored, the pituitary lowers its demand signal and TSH falls back into range. In genuine hypothyroidism symptoms resolve. Where the gland was working adequately already, the number changes and nothing else does.',
        molecularDetail:
          'Negative feedback at the pituitary thyrotroph suppresses TSH beta subunit transcription, and TSH is what dosing is titrated on. In TRUST, thyrotropin fell from 6.40 to 3.63 mIU/L on levothyroxine against 5.48 on placebo (p<0.001), while the two primary symptom outcomes differed by 0.0 and 0.4 points on scales where 9 points is the threshold for clinical importance.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'TRUST (NCT01660126)',
        phase: 'Randomised double-blind placebo-controlled trial, 1 year',
        sampleSize: 737,
        primaryEndpoint:
          'Change at 1 year in the ThyPRO Hypothyroid Symptoms score and Tiredness score in subclinical hypothyroidism',
        endpointMet: false,
        statisticalPValue:
          'Between-group differences 0.0 (95% CI -2.0 to 2.1) and 0.4 (-2.1 to 2.9) against a 9-point minimum clinically important difference',
        unreportedAdverseSignals:
          'The surrogate responded exactly as intended: thyrotropin fell from 6.40 to 3.63 mIU/L. Only the symptoms did not.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'IEMO 80-plus combined analysis (NCT01660126, NTR3851)',
        phase: 'Prospectively planned combined analysis of two randomised trials, 1 year',
        sampleSize: 251,
        primaryEndpoint:
          'ThyPRO hypothyroid symptoms and tiredness scores at 1 year in adults aged 80 and older',
        endpointMet: false,
        statisticalPValue:
          'Adjusted differences 1.3 (95% CI -2.7 to 5.2), P = 0.53 and -0.1 (-4.5 to 4.3), P = 0.96',
        unreportedAdverseSignals:
          '84% completed. Adverse events occurred in 29.5% on levothyroxine and 28.8% on placebo, so the absence of benefit was not offset by an absence of risk.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Feller meta-analysis of thyroid hormone in subclinical hypothyroidism',
        phase: 'Systematic review and meta-analysis of 21 randomised trials, minimum 3 months',
        sampleSize: 2192,
        primaryEndpoint: 'General quality of life and thyroid-related symptoms',
        endpointMet: false,
        statisticalPValue:
          'SMD -0.11 (95% CI -0.25 to 0.03) for quality of life; SMD 0.01 (-0.12 to 0.14) for symptoms',
        unreportedAdverseSignals:
          'Heterogeneity was high for the quality-of-life outcome (I-squared 66.7%) and absent for symptoms (0.0%).',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Grozinsky-Glasberg meta-analysis of T4-T3 combination therapy',
        phase: 'Systematic review and meta-analysis of 11 randomised trials',
        sampleSize: 1216,
        primaryEndpoint:
          'Symptom, quality-of-life, weight and lipid outcomes on combination versus monotherapy',
        endpointMet: false,
        statisticalPValue:
          'No difference on any outcome; fatigue SMD -0.12 (95% CI -0.33 to 0.09), quality of life SMD 0.03 (-0.09 to 0.15)',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Thyrotropin fell from 6.40 to 3.63 mIU/L on levothyroxine against 5.48 on placebo in 737 older adults',
        'Between-group symptom differences of 0.0 and 0.4 points in the same trial, against a 9-point threshold for clinical importance',
        'No benefit on quality of life (SMD -0.11) or symptoms (SMD 0.01) across 21 randomised trials and 2,192 adults',
        'Suppressed thyrotropin in 17,684 treated patients was associated with hazard ratios of 1.37 for cardiovascular disease and 2.02 for fractures',
      ],
      unsupportedInferences: [
        'That normalising a raised thyrotropin in subclinical hypothyroidism relieves symptoms — the surrogate corrects and the symptoms do not',
        'That older or frailer patients benefit more — the 80-plus analysis found differences of 1.3 and -0.1 points',
        'That adding T3 helps people who still feel unwell on T4 — eleven trials in 1,216 patients found no difference on any outcome',
        'That the TRUST and meta-analysis results say anything about overt hypothyroidism, which they did not study and where replacement is not in question',
      ],
      whatFailedInitially: [
        'TRUST: both co-primary symptom outcomes, at 0.0 and 0.4 points against a 9-point threshold',
        'The prospectively planned 80-plus analysis, at p=0.53 and p=0.96',
        'T4-T3 combination therapy across 11 randomised trials, on pain, depression, anxiety, fatigue, quality of life, weight and every lipid fraction',
      ],
      realWorldOutcome: [
        'Among the most-dispensed prescription drugs in the United States, and on the WHO Model List of Essential Medicines',
        'US$0.051 per 100 mcg generic tablet against US$1.66 for the branded SYNTHROID tablet of the same strength, in the same file on 19 August 2026',
        'Levothyroxine products were marketed for decades without approved applications; the FDA required them in the late 1990s and the approvals arrived between 2000 and 2002',
      ],
    },
    deliverySystem: {
      type:
        'Oral tablet in twelve strengths, plus soft-gel capsules, an oral solution and an intravenous formulation for myxoedema coma',
      description:
        'Taken once daily on an empty stomach with water, kept consistent relative to food and to interacting medicines. The wide range of tablet strengths exists because dosing is titrated in small increments against a laboratory value with a six-week lag. Soft-gel and solution formulations exist because tablet dissolution depends on gastric acid, which several common drugs suppress.',
      safetyProfile:
        'The US label carries a boxed warning that thyroid hormones must not be used for obesity or weight loss, alone or with other agents, because doses within the normal range are ineffective for weight reduction and larger doses may produce serious or life-threatening toxicity. Over-replacement produces the features of thyrotoxicosis and, in the Tayside cohort, was associated with atrial fibrillation, cardiovascular disease and fractures. Absorption is reduced by calcium, iron, proton pump inhibitors, bile acid sequestrants and soy.',
    },
    commonQuestions: [
      {
        q: 'My TSH is slightly high. Will taking this make me feel better?',
        a: 'The randomised evidence says no, and it is unusually consistent. TRUST gave levothyroxine or placebo to 737 adults over 65 with a thyrotropin between 4.60 and 19.99 and normal free thyroxine, and titrated the dose properly: the number came down from 6.40 to 3.63. The difference between groups on hypothyroid symptoms was 0.0 points and on tiredness 0.4 points, on scales where 9 points is the smallest difference considered clinically meaningful. A planned analysis in those aged 80 and over found 1.3 and -0.1 points. A meta-analysis of 21 trials and 2,192 adults found standardised mean differences of -0.11 and 0.01. This is not one negative trial; it is a body of evidence.',
        auditNote:
          'None of this applies to overt hypothyroidism, where thyroid hormone is genuinely low and replacement is not controversial. The distinction is the whole point of this entry.',
      },
      {
        q: 'I still feel tired on levothyroxine. Should I add T3?',
        a: 'Eleven randomised trials with 1,216 patients between them have compared T4 plus T3 against T4 alone, and the pooled differences on bodily pain, depression, anxiety, fatigue and quality of life were all indistinguishable from zero, as were body weight and every lipid fraction. Adverse events did not differ. The 2014 American Thyroid Association task force reviewed the same territory including desiccated extracts and concluded levothyroxine should remain the standard of care. There is a real physiological argument on the other side — people without a thyroid have no glandular T3 source, and tissue deiodinase activity varies — but it has been tested and has not produced a measurable symptom benefit.',
      },
      {
        q: 'Is the brand better than the generic?',
        a: 'They are the same molecule, and the historical concern was about tablet content and stability rather than chemistry. That concern was real: levothyroxine products predated modern approval requirements and were marketed for decades without approved applications, and it took documented potency problems for the FDA to require them in the late 1990s. The approvals then arrived between 2000 and 2002, Synthroid on 24 July 2002. Since then the potency specification has been tight. What has not changed is the price difference: US$1.66 per branded 100 mcg tablet against 5.1 cents for the generic in the same acquisition-cost file on the same day. Because the dose is titrated on a lagged blood test, staying on one consistent product is a reasonable practice, and that is a different argument from the brand being better.',
      },
      {
        q: 'Can this help me lose weight?',
        a: 'No, and the US label carries a boxed warning specifically saying so. Doses within the normal replacement range do not produce weight loss, and larger doses may produce serious or life-threatening toxicity, particularly when combined with sympathomimetic amines. The mechanistic reason is that thyroid hormone raises metabolic rate by increasing energy expenditure in a way that also increases cardiac work and bone turnover, and the Tayside cohort of 17,684 treated patients found that a fully suppressed thyrotropin came with a hazard ratio of 1.37 for cardiovascular disease, 1.6 for dysrhythmias and 2.02 for fractures.',
      },
      {
        q: 'Why does a dose change take so long to show up?',
        a: 'Because levothyroxine has a half-life of about a week, so it takes roughly five to six weeks for blood levels to settle at a new steady state, and the pituitary then needs time to reset its own output. Checking a thyrotropin earlier than that measures the transition rather than the destination and invites a dose change chasing a moving number. The same slow kinetics are why a single missed tablet matters very little.',
      },
      {
        q: 'Why does this page show no manufacturing cost?',
        a: 'Because no verified per-dose synthesis cost for levothyroxine could be cited. The prices shown come from the CMS NADAC file effective 19 August 2026: 5.1 cents per 100 mcg generic tablet against US$1.66 for the branded Synthroid tablet of identical strength. That comparison is between two versions of the same molecule on the same day, which makes it checkable. Neither figure is a manufacturing cost, and this page does not convert one into the other.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Stott DJ et al. Thyroid hormone therapy for older adults with subclinical hypothyroidism (TRUST). N Engl J Med 2017;376:2534-2544',
        identifier: '10.1056/NEJMoa1603825',
        kind: 'doi',
      },
      {
        label:
          'Mooijaart SP et al. Association between levothyroxine treatment and thyroid-related symptoms among adults aged 80 years and older with subclinical hypothyroidism. JAMA 2019;322:1977-1986',
        identifier: '10.1001/jama.2019.17274',
        kind: 'doi',
      },
      {
        label:
          'Feller M et al. Association of thyroid hormone therapy with quality of life and thyroid-related symptoms in patients with subclinical hypothyroidism: a systematic review and meta-analysis. JAMA 2018;320:1349-1359',
        identifier: '10.1001/jama.2018.13770',
        kind: 'doi',
      },
      {
        label:
          'Grozinsky-Glasberg S et al. Thyroxine-triiodothyronine combination therapy versus thyroxine monotherapy for clinical hypothyroidism: meta-analysis of randomized controlled trials. J Clin Endocrinol Metab 2006;91:2592-2599',
        identifier: '10.1210/jc.2006-0448',
        kind: 'doi',
      },
      {
        label:
          'Jonklaas J et al. Guidelines for the treatment of hypothyroidism: prepared by the American Thyroid Association task force on thyroid hormone replacement. Thyroid 2014;24:1670-1751',
        identifier: '10.1089/thy.2014.0028',
        kind: 'doi',
      },
      {
        label:
          'Flynn RW et al. Serum thyroid-stimulating hormone concentration and morbidity from cardiovascular disease and fractures in patients on long-term thyroxine therapy. J Clin Endocrinol Metab 2010;95:186-193',
        identifier: '10.1210/jc.2009-1625',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: SYNTHROID (levothyroxine sodium), NDA 021402, original approval 24 July 2002',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021402',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: UNITHROID (levothyroxine sodium), NDA 021210, original approval 21 August 2000',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021210',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5819 — levothyroxine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5819',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Empagliflozin — approved to lower blood sugar, and now used mostly by cardiologists and
  //    nephrologists for reasons the glucose effect does not explain.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'empagliflozin',
    name: 'Empagliflozin',
    tradeName: 'Jardiance',
    sponsor: 'Boehringer Ingelheim with Eli Lilly',
    targetGene: 'SLC5A2',
    targetProtein: 'Sodium-glucose cotransporter 2 (SGLT2)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2014,
    indication:
      'Reduction of cardiovascular death in adults with type 2 diabetes and established cardiovascular disease; reduction of cardiovascular death and hospitalisation for heart failure in adults with heart failure; reduction of the risk of sustained eGFR decline, end-stage kidney disease, cardiovascular death and hospitalisation in adults with chronic kidney disease; and improvement of glycaemic control in type 2 diabetes',
    patientFriendlyIndication:
      'Heart failure, chronic kidney disease, and type 2 diabetes with heart or kidney risk',
    anatomicalSite: 'Brush border of the renal proximal convoluted tubule, segment S1 and S2',
    conditionContext: {
      conditionExplainer:
        'Every day the kidney filters about 180 grams of glucose out of the blood and then reabsorbs essentially all of it, mostly through one transporter in the first part of the tubule. Blocking that transporter makes the kidney throw sugar away in the urine, which lowers blood glucose without touching insulin at all.',
      whyItMatters:
        'The drug was developed and approved as a glucose-lowering agent. The mandated cardiovascular safety trial found a 32% reduction in death from any cause, which nobody had predicted from the glucose mechanism, and the class has since been established in heart failure and chronic kidney disease in people who do not have diabetes. The glucose effect is now the least important thing it does.',
      whoTakesThis:
        'People with heart failure across the ejection fraction range, people with chronic kidney disease at risk of progression, and people with type 2 diabetes and cardiovascular disease. On the WHO Model List of Essential Medicines.',
      clinicalGoals:
        'Reduce cardiovascular death and heart failure hospitalisation, and slow the decline in kidney function. Glycaemic control is now a secondary consideration and is modest.',
    },
    oneSentenceVerdict:
      'A glucose-lowering drug that turned out to be a heart failure and kidney drug: 5.7% against 8.3% all-cause mortality in 7,020 patients with type 2 diabetes, then positive primary endpoints in 3,730 patients with reduced ejection fraction, 5,988 with preserved ejection fraction and 6,609 with chronic kidney disease — and a clear miss in 6,522 patients after acute myocardial infarction.',
    laymanHowItWorks:
      'Your kidney filters sugar out of your blood and then reclaims almost all of it through a specific transporter. Empagliflozin blocks that transporter, so roughly 60 to 100 grams of glucose a day leaves in the urine, taking sodium, water and calories with it. That is the glucose effect. The heart and kidney effects are larger than the glucose effect can explain, and the mechanism behind them is still being argued about.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 90,
    substitutes: {
      summary:
        'Empagliflozin has no generic in the United States and costs about US$11 per tablet at pharmacy acquisition cost. Dapagliflozin is the closest comparator with an almost identical outcome portfolio. Metformin remains the cheapest glucose-lowering drug by three orders of magnitude and has its own mortality trial, but nothing in the diabetes formulary has this drug\'s heart failure and kidney evidence.',
      conventionalRx: [
        {
          name: 'Dapagliflozin (Farxiga)',
          class: 'SGLT2 inhibitor',
          howItCompares:
            'Same class, same mechanism, very similar outcome portfolio: positive in heart failure with reduced ejection fraction (DAPA-HF), with mildly reduced or preserved ejection fraction (DELIVER) and in chronic kidney disease (DAPA-CKD). Its diabetes cardiovascular outcome trial, DECLARE-TIMI 58, missed the MACE co-primary endpoint where EMPA-REG hit it.',
          typicalCost:
            'Also brand-only in the CMS NADAC file; both are in the US$10 to US$12 per tablet range at pharmacy acquisition cost',
          prosAndCons:
            'Pros: interchangeable class effects on heart failure and kidney outcomes. Cons: no head-to-head outcome trial exists between them, so any preference is inference from separate placebo comparisons.',
        },
        {
          name: 'Metformin',
          class: 'Biguanide',
          howItCompares:
            'The comparator empagliflozin was almost always added to rather than substituted for. In EMPA-REG, empagliflozin was tested on top of standard care. Metformin has its own randomised mortality result in UKPDS 34 and costs about a cent and a half a tablet.',
          typicalCost:
            'About US$0.014 per 500 mg tablet at United States pharmacy acquisition cost (CMS NADAC)',
          prosAndCons:
            'Pros: eight hundred times cheaper per tablet, long safety record. Cons: no heart failure or kidney outcome evidence of the kind on this page.',
        },
        {
          name: 'Sacubitril-valsartan (Entresto)',
          class: 'Angiotensin receptor-neprilysin inhibitor',
          howItCompares:
            'A different heart failure drug with its own mortality trial in reduced ejection fraction. In modern practice the two are used together rather than as alternatives, as parts of a four-drug foundation.',
          typicalCost: 'Brand-priced; a multiple of generic heart failure therapy',
          prosAndCons:
            'Pros: independent mortality evidence in reduced ejection fraction. Cons: hypotension, and it does not carry the kidney progression evidence.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Know that ketoacidosis can happen with a normal blood sugar',
          action:
            'If you develop nausea, vomiting, abdominal pain, unusual tiredness or breathlessness on this drug, say that you take an SGLT2 inhibitor, even if your glucose meter reads normal.',
          patientImpact:
            'The drug shifts metabolism toward fat oxidation and ketone production while simultaneously lowering blood glucose, so diabetic ketoacidosis can occur at glucose levels that would normally rule it out. Standard triage that screens on glucose alone can miss it.',
          clinicalPrecaution:
            'This is a labelled warning, not a theoretical concern. Risk rises with fasting, dehydration, acute illness and surgery.',
        },
        {
          name: 'Genital fungal infection is the commonest reason people stop',
          action: 'Expect and report genital itching or discharge, particularly in the first months.',
          patientImpact:
            'Glucose in the urine feeds yeast. EMPA-REG reported an increased rate of genital infection with no increase in other adverse events, and EMPEROR-Preserved reported more uncomplicated genital and urinary tract infections and more hypotension.',
          clinicalPrecaution:
            'A rare but serious complication is Fournier gangrene, a necrotising infection of the perineum, which is a labelled warning and a surgical emergency.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C1COC[C@H]1OC2=CC=C(C=C2)CC3=C(C=CC(=C3)[C@H]4[C@@H]([C@H]([C@@H]([C@H](O4)CO)O)O)O)Cl',
      chemicalFormula: 'C23H27ClO7',
      molecularWeight: '450.9 g/mol',
      targetReceptorAffinity:
        'A C-aryl glucoside with roughly 2,500-fold selectivity for SGLT2 over SGLT1, the highest selectivity ratio in the class. That margin matters clinically: SGLT1 handles intestinal glucose absorption, and inhibiting it causes diarrhoea, so the whole design problem was building a glucose mimic that the kidney transporter accepts and the gut transporter does not. The carbon-carbon glycosidic bond, rather than the natural oxygen linkage, is what makes the molecule resistant to hydrolysis by glucosidases.',
      structureSource: {
        label:
          'PubChem CID 11949646 (empagliflozin) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11949646',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'emp-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Anomeric and regiochemical control of the gluconolactone and aryl bromide',
          description:
            'Assay the persilylated gluconolactone for anomeric purity and the 4-chloro-3-(4-tetrahydrofuran-3-yloxybenzyl)phenyl bromide for regiochemistry and for the (S)-configuration at the tetrahydrofuran carbon. Every stereocentre in the finished molecule is set before or during the coupling, and the beta-anomer is the only one that fits the transporter.',
          reagentsAndBuffer:
            '2,3,4,6-tetra-O-trimethylsilyl-D-gluconolactone reference standard, the substituted aryl bromide reference standard, chiral HPLC, nuclear magnetic resonance for anomeric configuration, Karl Fischer titration',
        },
        {
          id: 'emp-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Aryl lithium addition to the gluconolactone and stereoselective reduction',
          description:
            'Generate the aryl lithium by halogen-metal exchange at low temperature and add it to the protected gluconolactone to form the anomeric lactol, then reduce that lactol with a silane under Lewis acid catalysis to set the beta-C-glycoside. This reduction is the key step in the whole class: it converts a hydrolysable acetal centre into a carbon-carbon bond that no glucosidase can cleave, which is what gives these drugs an oral half-life at all.',
          dependsOnStepId: 'emp-w1',
          reagentsAndBuffer:
            'n-butyllithium in tetrahydrofuran/toluene at minus 78 degrees Celsius under argon, triethylsilane with boron trifluoride diethyl etherate in acetonitrile/dichloromethane, methanesulfonic acid in methanol for the intermediate methyl acetal',
        },
        {
          id: 'emp-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Desilylation and crystallisation of the single beta-anomer',
          description:
            'Remove the silyl protecting groups and crystallise the free tetraol. Purification here is anomeric separation as much as impurity clearance: the alpha-anomer is nearly inactive at the transporter and is the specified diastereomeric impurity, and it is separated by crystallisation rather than by chromatography at manufacturing scale.',
          dependsOnStepId: 'emp-w2',
          reagentsAndBuffer:
            'Tetrabutylammonium fluoride or aqueous methanolic acid for desilylation, ethyl acetate/heptane recrystallisation, reversed-phase HPLC against the alpha-anomer and the des-chloro reference impurities, X-ray powder diffraction to confirm the crystal form',
        },
        {
          id: 'emp-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Apical presentation to SGLT2 in a polarised tubular monolayer',
          description:
            'Grow LLC-PK1 or HEK293 cells expressing human SLC5A2 on permeable supports and apply compound to the apical side, the side that faces urine in vivo. Sidedness is the point: SGLT2 sits on the brush border and is reached from the tubular lumen after the drug has been filtered and secreted, not from the blood side, and an assay that dosed the basolateral compartment would be measuring the wrong geometry.',
          dependsOnStepId: 'emp-w3',
          reagentsAndBuffer:
            'LLC-PK1 or HEK293 cells stably expressing human SLC5A2 on Transwell inserts, sodium-containing and sodium-free uptake buffers at pH 7.4, phlorizin as reference inhibitor, transepithelial electrical resistance monitoring for monolayer integrity',
        },
        {
          id: 'emp-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'SGLT2 versus SGLT1 selectivity and urinary glucose excretion readout',
          description:
            'Measure sodium-dependent uptake of a non-metabolisable glucose analogue in cells expressing SGLT2 and, in parallel, in cells expressing SGLT1, then confirm in vivo by measuring 24-hour urinary glucose excretion. Both halves are needed: the selectivity ratio predicts whether the compound will cause diarrhoea, and urinary glucose excretion is the only readout that shows the transporter was actually blocked in a living kidney.',
          dependsOnStepId: 'emp-w4',
          reagentsAndBuffer:
            'CHO or HEK293 cells expressing human SLC5A2 or SLC5A1, carbon-14-labelled alpha-methyl-D-glucopyranoside, sodium-replete and choline-substituted buffers, phlorizin as positive control, hexokinase-glucose-6-phosphate dehydrogenase enzymatic assay for urinary glucose',
        },
      ],
    },
    keyAudits: [
      {
        id: 'emp-a1',
        category: 'conclusion_shift',
        title: 'EMPA-REG OUTCOME: a safety trial found a 32% reduction in all-cause death',
        laymanSummary:
          'The trial existed because regulators require diabetes drugs to prove they do not cause heart attacks. It found that this one reduced deaths from any cause by a third, which no glucose-lowering drug had done in that setting.',
        technicalDetails:
          'EMPA-REG OUTCOME randomised patients with type 2 diabetes at high cardiovascular risk to empagliflozin 10 mg, 25 mg or placebo once daily on top of standard care; 7,020 were treated, median observation 3.1 years. The primary composite of cardiovascular death, non-fatal myocardial infarction or non-fatal stroke occurred in 490 of 4,687 (10.5%) on pooled empagliflozin against 282 of 2,333 (12.1%) on placebo: hazard ratio 0.86 (95.02% CI 0.74 to 0.99), p=0.04 for superiority. There were no significant between-group differences in myocardial infarction or stroke. The differences were in cardiovascular death (3.7% against 5.9%, a 38% relative reduction), hospitalisation for heart failure (2.7% against 4.1%, 35%) and death from any cause (5.7% against 8.3%, 32%). The key secondary composite, adding unstable angina, was not significant (p=0.08). Genital infection was increased with no increase in other adverse events.',
        evidenceSource:
          'Zinman B et al., EMPA-REG OUTCOME, N Engl J Med 2015;373:2117-2128 (NCT01131676)',
        doi: '10.1056/NEJMoa1504720',
        measuredMetric:
          'Death from any cause, cardiovascular death and heart failure hospitalisation over a median 3.1 years',
        auditFlag: 'verified',
      },
      {
        id: 'emp-a2',
        category: 'inferred',
        title: 'The benefit did not come from the glucose, and nobody has shown what it did come from',
        laymanSummary:
          'The heart attacks and strokes this drug was supposed to prevent did not change. What changed was heart failure and death. Several explanations have been proposed and none has been tested against the others.',
        technicalDetails:
          'In EMPA-REG the primary composite was driven entirely by cardiovascular death: myocardial infarction and stroke showed no significant difference, and the benefit appeared within months, far too early for an effect on atherosclerosis. The glycaemic difference between arms was small. Proposed mechanisms include osmotic diuresis and natriuresis reducing preload and afterload, a shift in cardiac fuel use toward ketone bodies, reduced myocardial sodium-hydrogen exchanger activity, reduced epicardial adipose inflammation, and restoration of tubuloglomerular feedback lowering intraglomerular pressure. No randomised design has isolated any one of them. That the effect is real is settled across four trials and more than 22,000 patients; why it happens is not.',
        evidenceSource:
          'Zinman B et al., N Engl J Med 2015;373:2117-2128; Packer M et al., N Engl J Med 2020;383:1413-1424',
        doi: '10.1056/NEJMoa2022190',
        inferredClaim:
          'That any single named mechanism — ketone fuel shift, sodium-hydrogen exchange, natriuresis — accounts for the cardiovascular benefit; each is plausible and none has been isolated',
        auditFlag: 'caution',
      },
      {
        id: 'emp-a3',
        category: 'measured',
        title: 'EMPEROR-Reduced: it works in heart failure whether or not the patient has diabetes',
        laymanSummary:
          'Nearly four thousand patients with a weakened heart, half of them without diabetes, took empagliflozin or placebo. Cardiovascular deaths and heart failure hospitalisations fell by a quarter.',
        technicalDetails:
          'EMPEROR-Reduced randomised 3,730 patients with NYHA class II-IV heart failure and ejection fraction of 40% or less to empagliflozin 10 mg daily or placebo on top of recommended therapy. Over a median 16 months the primary composite of cardiovascular death or hospitalisation for worsening heart failure occurred in 361 of 1,863 (19.4%) against 462 of 1,867 (24.7%): hazard ratio 0.75 (95% CI 0.65 to 0.86), p<0.001, consistent regardless of diabetes status. Total heart failure hospitalisations fell (hazard ratio 0.70, 0.58 to 0.85, p<0.001). The annual rate of eGFR decline was slower on empagliflozin (-0.55 against -2.28 mL/min/1.73 m2 per year, p<0.001) with a lower risk of serious renal outcomes. Uncomplicated genital tract infection was more frequent on empagliflozin.',
        evidenceSource:
          'Packer M et al., EMPEROR-Reduced, N Engl J Med 2020;383:1413-1424 (NCT03057977)',
        doi: '10.1056/NEJMoa2022190',
        measuredMetric:
          'Cardiovascular death or hospitalisation for worsening heart failure over a median 16 months',
        auditFlag: 'verified',
      },
      {
        id: 'emp-a4',
        category: 'measured',
        title: 'EMPEROR-Preserved: the first positive trial in a condition with no treatment',
        laymanSummary:
          'Heart failure with a normal pumping fraction had defeated every drug tried against it. In nearly six thousand patients this one reduced the combined endpoint, almost entirely through fewer hospitalisations.',
        technicalDetails:
          'EMPEROR-Preserved randomised 5,988 patients with NYHA class II-IV heart failure and ejection fraction above 40% to empagliflozin 10 mg daily or placebo on top of usual therapy. Over a median 26.2 months the primary composite of cardiovascular death or hospitalisation for heart failure occurred in 415 of 2,997 (13.8%) against 511 of 2,991 (17.1%): hazard ratio 0.79 (95% CI 0.69 to 0.90), p<0.001. The paper states the effect was mainly related to lower hospitalisation for heart failure rather than to cardiovascular death — a distinction that matters when the result is described as a mortality benefit, which it was not. Total heart failure hospitalisations were 407 against 541 (hazard ratio 0.73, 0.61 to 0.88, p<0.001). Uncomplicated genital and urinary tract infections and hypotension were more frequent on empagliflozin.',
        evidenceSource:
          'Anker SD et al., EMPEROR-Preserved, N Engl J Med 2021;385:1451-1461 (NCT03057951)',
        doi: '10.1056/NEJMoa2107038',
        measuredMetric:
          'Cardiovascular death or hospitalisation for heart failure over a median 26.2 months, ejection fraction above 40%',
        auditFlag: 'verified',
      },
      {
        id: 'emp-a5',
        category: 'measured',
        title: 'EMPA-KIDNEY: kidney progression slowed, and mortality did not change',
        laymanSummary:
          'In six and a half thousand people with chronic kidney disease, the drug slowed the loss of kidney function. Deaths from any cause were 4.5% against 5.1%, which is not a statistically demonstrated difference.',
        technicalDetails:
          'EMPA-KIDNEY randomised 6,609 patients with chronic kidney disease — eGFR 20 to under 45, or eGFR 45 to under 90 with a urinary albumin-to-creatinine ratio of at least 200 mg/g — to empagliflozin 10 mg daily or placebo. Over a median 2.0 years the primary composite of kidney disease progression or cardiovascular death occurred in 432 of 3,304 (13.1%) against 558 of 3,305 (16.9%): hazard ratio 0.72 (95% CI 0.64 to 0.82), p<0.001, consistent with and without diabetes and across eGFR strata. Hospitalisation from any cause was lower (hazard ratio 0.86, 0.78 to 0.95, p=0.003). But there were no significant between-group differences in the composite of heart failure hospitalisation or cardiovascular death (4.0% against 4.6%) or in death from any cause (4.5% against 5.1%). Serious adverse event rates were similar.',
        evidenceSource:
          'The EMPA-KIDNEY Collaborative Group, N Engl J Med 2023;388:117-127 (NCT03594110)',
        doi: '10.1056/NEJMoa2204233',
        measuredMetric:
          'Kidney disease progression or cardiovascular death over a median 2.0 years, and all-cause mortality',
        auditFlag: 'verified',
      },
      {
        id: 'emp-a6',
        category: 'failed',
        title: 'EMPACT-MI: the run of positive trials ended after acute myocardial infarction',
        laymanSummary:
          'Six and a half thousand patients at risk of heart failure after a heart attack were given the drug within two weeks. The primary endpoint was not reduced.',
        technicalDetails:
          'EMPACT-MI randomised 3,260 patients to empagliflozin 10 mg daily and 3,262 to placebo, started within 14 days of hospitalisation for acute myocardial infarction in patients at risk for heart failure, on top of standard care. Over a median 17.9 months the primary composite of first hospitalisation for heart failure or death from any cause occurred in 267 (8.2%) against 298 (9.1%): incidence rates 5.9 and 6.6 per 100 patient-years, hazard ratio 0.90 (95% CI 0.76 to 1.06), p=0.21. On the components, first heart failure hospitalisation was 118 (3.6%) against 153 (4.7%), hazard ratio 0.77 (0.60 to 0.98) — nominally lower — while death from any cause was 169 (5.2%) against 178 (5.5%), hazard ratio 0.96 (0.78 to 1.19). Adverse events matched the known profile. A component nominally favouring a drug inside a missed primary endpoint is a hypothesis, not a result.',
        evidenceSource: 'Butler J et al., EMPACT-MI, N Engl J Med 2024;390:1455-1466 (NCT04509674)',
        doi: '10.1056/NEJMoa2314051',
        measuredMetric:
          'First hospitalisation for heart failure or death from any cause over a median 17.9 months after acute myocardial infarction',
        auditFlag: 'verified',
      },
      {
        id: 'emp-a7',
        category: 'inferred',
        title: 'Empagliflozin and dapagliflozin are treated as interchangeable without a comparison',
        laymanSummary:
          'The two leading drugs in this class have never been tested against each other. Everything said about one being better or equal to the other comes from comparing separate trials against separate placebos.',
        technicalDetails:
          'Empagliflozin and dapagliflozin each have positive trials in heart failure with reduced ejection fraction, in heart failure with preserved or mildly reduced ejection fraction, and in chronic kidney disease, against placebo. They differ in their diabetes cardiovascular outcome trials: EMPA-REG met its primary endpoint with a 32% reduction in all-cause death, while DECLARE-TIMI 58 did not reduce major adverse cardiovascular events. That difference could be a drug difference or a population difference — DECLARE enrolled a much larger proportion of patients without established cardiovascular disease — and no trial has randomised anyone between the two molecules. Class-effect language is an inference from indirect comparison.',
        evidenceSource:
          'Zinman B et al., N Engl J Med 2015;373:2117-2128; Wiviott SD et al., DECLARE-TIMI 58, N Engl J Med 2019;380:347-357',
        doi: '10.1056/NEJMoa1812389',
        inferredClaim:
          'That the SGLT2 inhibitors are interchangeable on outcomes — an inference across separate placebo-controlled trials with different populations, never tested head to head',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed well, and delivered to the kidney tubule from the blood side',
        laymanDesc:
          'The tablet is absorbed quickly and travels in the blood to the kidney, where it is filtered and secreted into the tubule so it can reach its target from the urine side.',
        molecularDetail:
          'Oral bioavailability is high and absorption is rapid, with peak concentrations at about 1.5 hours; food slightly delays but does not meaningfully reduce it. Elimination is roughly half renal and half faecal, with metabolism dominated by glucuronidation via UGT2B7, UGT1A3, UGT1A8 and UGT1A9 rather than by cytochrome P450 — so its interaction profile is unusually clean.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the brush border of the first part of the kidney tubule',
        laymanDesc:
          'The target sits on the surface of cells lining the very beginning of the kidney tubule, facing the fluid that has just been filtered out of the blood.',
        molecularDetail:
          'SGLT2 is expressed almost exclusively on the apical brush border of proximal tubule segments S1 and S2, where it reabsorbs roughly 90% of filtered glucose. SGLT1, further along in S3 and throughout the small intestine, handles the remainder — which is why blocking SGLT2 alone does not eliminate all glucose reabsorption and why a maximally effective dose still leaves some reclamation intact.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'A glucose look-alike jams the transporter, and cannot be cut loose',
        laymanDesc:
          'The drug looks enough like glucose to occupy the transporter, but the link holding its sugar ring on is a carbon-carbon bond that the body\'s sugar-cleaving enzymes cannot break.',
        molecularDetail:
          'Empagliflozin is a C-aryl glucoside: replacing the natural oxygen glycosidic linkage with a carbon-carbon bond makes it resistant to beta-glucosidase hydrolysis, the flaw that made the natural product phlorizin unusable as a drug. Selectivity for SGLT2 over SGLT1 is roughly 2,500-fold, the highest in the class, which keeps intestinal glucose absorption intact.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Glucose, sodium and water leave in the urine together',
        laymanDesc:
          'Sugar that is not reclaimed carries water with it osmotically, and the sodium that would have travelled with it is left in the tubule too. The result is calorie loss, mild fluid loss and a signal to the rest of the kidney.',
        molecularDetail:
          'Urinary glucose excretion rises to roughly 60 to 100 grams daily, with accompanying osmotic diuresis and natriuresis. The delivery of extra sodium to the macula densa restores tubuloglomerular feedback, constricting the afferent arteriole and lowering intraglomerular pressure — which produces the characteristic initial dip in eGFR and is the leading candidate explanation for the long-term renal protection.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Heart failure hospitalisations and kidney decline fall; heart attacks do not',
        laymanDesc:
          'Across four large trials, fewer people were admitted for heart failure and kidney function declined more slowly. Heart attacks and strokes were not reduced, which is why the drug is now a cardiology and nephrology drug rather than an anti-atherosclerosis one.',
        molecularDetail:
          'In EMPA-REG, cardiovascular death fell 38% and heart failure hospitalisation 35% while myocardial infarction and stroke showed no significant difference. In EMPEROR-Reduced the annual eGFR decline was -0.55 against -2.28 mL/min/1.73 m2 per year. In EMPA-KIDNEY the primary composite hazard ratio was 0.72 with no significant difference in all-cause death.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'EMPA-REG OUTCOME (NCT01131676)',
        phase: 'Randomised double-blind placebo-controlled cardiovascular safety trial, median 3.1 years',
        sampleSize: 7020,
        primaryEndpoint:
          'Composite of cardiovascular death, non-fatal myocardial infarction and non-fatal stroke',
        endpointMet: true,
        statisticalPValue: 'HR 0.86 (95.02% CI 0.74-0.99), P = 0.04 for superiority',
        unreportedAdverseSignals:
          'Myocardial infarction and stroke did not differ significantly; the composite was carried by cardiovascular death. The key secondary endpoint adding unstable angina was not significant (p=0.08). Genital infection was increased.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'EMPEROR-Reduced (NCT03057977)',
        phase: 'Randomised double-blind placebo-controlled trial, median 16 months',
        sampleSize: 3730,
        primaryEndpoint:
          'Cardiovascular death or hospitalisation for worsening heart failure, ejection fraction ≤40%',
        endpointMet: true,
        statisticalPValue: 'HR 0.75 (95% CI 0.65-0.86), P < 0.001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'EMPEROR-Preserved (NCT03057951)',
        phase: 'Randomised double-blind placebo-controlled trial, median 26.2 months',
        sampleSize: 5988,
        primaryEndpoint:
          'Cardiovascular death or hospitalisation for heart failure, ejection fraction above 40%',
        endpointMet: true,
        statisticalPValue: 'HR 0.79 (95% CI 0.69-0.90), P < 0.001',
        unreportedAdverseSignals:
          'The paper states the effect was mainly related to lower heart failure hospitalisation rather than to cardiovascular death. More genital and urinary infections, and more hypotension.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'EMPA-KIDNEY (NCT03594110)',
        phase: 'Randomised double-blind placebo-controlled trial, median 2.0 years',
        sampleSize: 6609,
        primaryEndpoint: 'Progression of kidney disease or death from cardiovascular causes',
        endpointMet: true,
        statisticalPValue: 'HR 0.72 (95% CI 0.64-0.82), P < 0.001',
        unreportedAdverseSignals:
          'No significant difference in the composite of heart failure hospitalisation or cardiovascular death (4.0% against 4.6%), nor in death from any cause (4.5% against 5.1%).',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'EMPACT-MI (NCT04509674)',
        phase: 'Randomised double-blind placebo-controlled event-driven trial, median 17.9 months',
        sampleSize: 6522,
        primaryEndpoint:
          'First hospitalisation for heart failure or death from any cause after acute myocardial infarction',
        endpointMet: false,
        statisticalPValue: 'HR 0.90 (95% CI 0.76-1.06), P = 0.21',
        unreportedAdverseSignals:
          'First heart failure hospitalisation was nominally lower (HR 0.77, 0.60-0.98) inside a missed primary endpoint, which makes it hypothesis-generating rather than established.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'All-cause death 5.7% against 8.3% and cardiovascular death 3.7% against 5.9% in 7,020 patients with type 2 diabetes over a median 3.1 years',
        'Cardiovascular death or heart failure hospitalisation 19.4% against 24.7% in 3,730 patients with reduced ejection fraction',
        'The same composite 13.8% against 17.1% in 5,988 patients with an ejection fraction above 40%',
        'Kidney disease progression or cardiovascular death 13.1% against 16.9% in 6,609 patients with chronic kidney disease',
      ],
      unsupportedInferences: [
        'That any one named mechanism — ketone fuel shift, sodium-hydrogen exchange inhibition, natriuresis — explains the cardiovascular benefit; none has been isolated in a randomised design',
        'That EMPEROR-Preserved showed a mortality benefit — the paper attributes the effect mainly to fewer hospitalisations',
        'That empagliflozin and dapagliflozin are interchangeable on outcomes — no head-to-head trial exists',
        'That the benefit is an antiatherosclerotic effect — myocardial infarction and stroke did not differ significantly in EMPA-REG',
      ],
      whatFailedInitially: [
        'EMPACT-MI missed its primary endpoint in 6,522 patients after acute myocardial infarction (HR 0.90, p=0.21)',
        'EMPA-KIDNEY showed no significant difference in all-cause death or in the heart failure and cardiovascular death composite',
        'The EMPA-REG key secondary composite, adding unstable angina to the primary, was not significant (p=0.08)',
      ],
      realWorldOutcome: [
        'Added to the WHO Model List of Essential Medicines, and now a foundational heart failure therapy independent of diabetes status',
        'US$11.19 per 10 mg JARDIANCE tablet at United States pharmacy acquisition cost; no generic listing exists in the CMS NADAC file',
        'The regulatory requirement that produced EMPA-REG was a safety mandate created after the rosiglitazone controversy — the trial existed to rule out harm and instead found benefit',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, and fixed combinations with metformin and with linagliptin',
      description:
        'Once daily in the morning, with or without food. Metabolism is by glucuronidation rather than by cytochrome P450, so the drug has few of the interactions that complicate other cardiometabolic agents. Its glucose-lowering effect depends on filtered glucose load and therefore fades as kidney function falls, while the cardiovascular and renal benefits do not.',
      safetyProfile:
        'Genital mycotic infection is the commonest adverse effect and the commonest reason for stopping. Euglycaemic diabetic ketoacidosis is a labelled warning and can occur at glucose levels that would ordinarily exclude the diagnosis, with risk raised by fasting, dehydration, acute illness and surgery. Fournier gangrene, necrotising fasciitis of the perineum, is a rare labelled warning. Volume depletion and hypotension occur, particularly with loop diuretics. An expected initial dip in eGFR occurs on starting and is haemodynamic rather than injurious.',
    },
    commonQuestions: [
      {
        q: 'Why is a diabetes drug being prescribed for my heart failure?',
        a: 'Because that is where its evidence turned out to be strongest, and because the heart failure trials deliberately enrolled people without diabetes to check. EMPEROR-Reduced randomised 3,730 patients with a weakened heart and found the composite of cardiovascular death or heart failure hospitalisation fell from 24.7% to 19.4%, with the effect consistent regardless of whether the patient had diabetes. EMPEROR-Preserved did the same in 5,988 patients with a normal or near-normal ejection fraction — a condition that had previously defeated every drug tested against it — and found 13.8% against 17.1%. Your blood sugar is not the reason the drug is being given, and it will only fall a little if it is normal to begin with.',
      },
      {
        q: 'How does it work on the heart? Nobody seems to be able to tell me.',
        a: 'That is an accurate impression rather than a failure of explanation. The effect is well established: four trials, more than 22,000 patients, consistent direction. The mechanism is not. In EMPA-REG the heart attacks and strokes it was supposed to prevent did not change; cardiovascular death and heart failure hospitalisation did, and the separation appeared within months, far too early for anything to have happened to a plaque. Candidate explanations include fluid and sodium loss reducing the load on the heart, a shift in cardiac fuel use toward ketones, effects on a sodium-hydrogen exchanger in heart muscle, and reduced pressure inside the kidney filter. None has been isolated by a randomised design. Anyone who tells you which one it is, is telling you a hypothesis.',
        auditNote:
          'This is the largest genuine unknown on this page and it is unusual: a well-replicated clinical effect with an unresolved mechanism, rather than the more common reverse.',
      },
      {
        q: 'Did it not work after heart attacks?',
        a: 'It did not, at least not on the endpoint EMPACT-MI was built around. The trial gave empagliflozin or placebo to 6,522 patients within 14 days of a heart attack who were at risk of heart failure, and over a median of nearly a year and a half the composite of heart failure hospitalisation or death from any cause was 8.2% against 9.1%: hazard ratio 0.90, p=0.21. Looking inside the composite, heart failure hospitalisation alone was nominally lower and death from any cause was flat. A component that points the right way inside a missed primary endpoint is a hypothesis for the next trial, not a result. This is the one clear negative in an otherwise consistent run.',
      },
      {
        q: 'My kidney function dropped after I started. Should I stop?',
        a: 'The early dip is expected and is not kidney damage. Blocking glucose and sodium reabsorption in the first part of the tubule delivers more sodium to a sensor further along, which constricts the vessel entering the filter and lowers the pressure across it. Filtration rate falls as a direct result, and that lower pressure is the leading explanation for why the kidney lasts longer over years. The trials show both halves: in EMPEROR-Reduced the annual rate of eGFR decline was -0.55 on empagliflozin against -2.28 on placebo, and in EMPA-KIDNEY the primary kidney composite hazard ratio was 0.72. A dip on starting and a shallower slope thereafter is the pattern the drug is meant to produce.',
      },
      {
        q: 'What is euglycaemic ketoacidosis and why does it matter?',
        a: 'It is diabetic ketoacidosis occurring without the high blood sugar that normally announces it, and it matters because it can be missed. The drug lowers blood glucose by dumping it in urine while simultaneously shifting metabolism toward burning fat, which produces ketones. So the acid can accumulate while the glucose meter reads reassuringly normal. The practical consequence is that nausea, vomiting, abdominal pain, unusual fatigue or breathlessness on an SGLT2 inhibitor should be described to a clinician as occurring on an SGLT2 inhibitor, so that ketones are checked rather than ruled out by a normal glucose. Fasting, dehydration, acute illness and surgery raise the risk.',
      },
      {
        q: 'Why is there no generic and no manufacturing cost on this page?',
        a: 'There is no generic because the product is still on patent in the United States, and the CMS NADAC file effective 19 August 2026 lists only the branded JARDIANCE at US$11.19 per 10 mg tablet with no generic entry. No per-dose synthesis cost is shown because none could be verified and cited. What can be said about the chemistry is that the route runs through a low-temperature aryl lithium addition to a protected sugar followed by a stereoselective reduction — considerably more involved than the single-step condensations behind the cheapest drugs on this site — but process complexity is not a cost figure and this page does not convert one into the other.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Zinman B et al. Empagliflozin, cardiovascular outcomes, and mortality in type 2 diabetes (EMPA-REG OUTCOME). N Engl J Med 2015;373:2117-2128',
        identifier: '10.1056/NEJMoa1504720',
        kind: 'doi',
      },
      {
        label:
          'Packer M et al. Cardiovascular and renal outcomes with empagliflozin in heart failure (EMPEROR-Reduced). N Engl J Med 2020;383:1413-1424',
        identifier: '10.1056/NEJMoa2022190',
        kind: 'doi',
      },
      {
        label:
          'Anker SD et al. Empagliflozin in heart failure with a preserved ejection fraction (EMPEROR-Preserved). N Engl J Med 2021;385:1451-1461',
        identifier: '10.1056/NEJMoa2107038',
        kind: 'doi',
      },
      {
        label:
          'The EMPA-KIDNEY Collaborative Group. Empagliflozin in patients with chronic kidney disease. N Engl J Med 2023;388:117-127',
        identifier: '10.1056/NEJMoa2204233',
        kind: 'doi',
      },
      {
        label:
          'Butler J et al. Empagliflozin after acute myocardial infarction (EMPACT-MI). N Engl J Med 2024;390:1455-1466',
        identifier: '10.1056/NEJMoa2314051',
        kind: 'doi',
      },
      {
        label:
          'Wiviott SD et al. Dapagliflozin and cardiovascular outcomes in type 2 diabetes (DECLARE-TIMI 58). N Engl J Med 2019;380:347-357',
        identifier: '10.1056/NEJMoa1812389',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA: JARDIANCE (empagliflozin), NDA 204629, original approval 1 August 2014',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=204629',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 11949646 — empagliflozin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11949646',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
]
