import type { SeedDossier } from '@/lib/seed-types'

/**
 * Enriched batch 9 — the glucose-lowering drugs that are not metformin, not a statin and not new.
 *
 * Three insulin analogues, three sulfonylureas, a thiazolidinedione, an alpha-glucosidase inhibitor,
 * a meglitinide and a DPP-4 inhibitor. They are grouped together because they share one problem, and
 * it is the problem this site exists to describe: every one of them was licensed on HbA1c, which is
 * a surrogate, and the cardiovascular outcome evidence arrived later, separately, and in several
 * cases contradicted what the surrogate implied. Rosiglitazone forced the FDA to require outcome
 * trials at all; saxagliptin was one of the first drugs those trials caught.
 *
 * Every DOI, PMID and NCT number below was resolved at the time of writing — abstracts and numbers
 * through NCBI E-utilities, trial identity and enrolment through the ClinicalTrials.gov v2 API,
 * approval dates through the openFDA Drugs@FDA endpoint. Every effect size, arm size, hazard ratio,
 * confidence interval and p-value is copied from the published abstract, never from memory. Where a
 * number could not be sourced, the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. PRICING IS A PRICE, NOT A COST. `retailPricePerDoseOrYear` carries the United States pharmacy
 *    acquisition cost held on this record, which comes from the CMS National Average Drug
 *    Acquisition Cost survey. `synthesisCostPerDose` is empty on every dossier here, because no
 *    published per-dose cost-of-production figure for any of these molecules could be verified. The
 *    cost-of-production literature checked is Hill, Barber and Gotham in BMJ Global Health, which
 *    publishes an estimation method and aggregate ranges rather than per-dose figures for these
 *    compounds; it is cited as `costSource` so a reader can see what was checked and what it does
 *    not contain. A missing number beats a manufactured one.
 *
 * 2. THE SMILES STRINGS ARE THE ONES ALREADY ON THE RECORD. Each was pulled from PubChem by the
 *    ingestion pipeline and passed this repository's structure parser before curation began. The
 *    PubChem CID, molecular formula and molecular weight were re-checked against the PUG REST
 *    property endpoint while writing, and every one matched. The three insulins carry a SMILES for a
 *    51-residue disulphide-bonded protein, which is a faithful connection table and a nearly useless
 *    picture; each of those dossiers says so and gives the residue change that actually matters.
 *
 * 3. EVERY DOSSIER SEPARATES HbA1c FROM THE THING HbA1c IS A PROXY FOR. Six of these ten drugs have
 *    never had a cardiovascular outcome result of their own; three have one that was neutral; one
 *    has an outcome result that found harm. Which of those a page is describing is stated in as many
 *    words, and no page treats a fall in HbA1c as a demonstrated reduction in anything else.
 *
 * 4. THE AUDIT POINTS ARE NOT A HIGHLIGHT REEL. Every dossier carries at least one 'inferred' or
 *    'failed' entry, because the literature supplies them: prandial insulin aspart produced the most
 *    hypoglycaemia and the most weight gain of the three regimens in 4-T, detemir's weight advantage
 *    never became an outcome, degludec won on hypoglycaemia and drew on events, glyburide had the
 *    worst hypoglycaemia of any sulfonylurea and lost twice on it, glimepiride's cardiovascular
 *    safety rests on a non-inferiority trial and its durability failed in GRADE, pioglitazone missed
 *    its own primary endpoint in PROactive and caused heart failure and fractures, acarbose's
 *    prevention claim collapsed when the ACE trial reported, repaglinide has no outcome trial in
 *    anything, and saxagliptin raised heart-failure hospitalisation in SAVOR-TIMI 53.
 *
 * 5. NO DOSING, TITRATION OR PROCUREMENT GUIDANCE. Strengths, units and injection timing appear only
 *    where they are part of a trial's description or a label's identity. Nothing here tells a reader
 *    what to take, when to take it, or how to adjust it.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — United States pharmacy acquisition cost',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group; it publishes an estimation method and aggregate ranges, and carries no per-dose figure for the drugs in this file',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_9_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Insulin aspart — one amino acid swapped to stop the molecule clumping, which bought about a
  //    tenth of a percentage point of HbA1c and no reduction in severe hypoglycaemia.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'insulin-aspart',
    name: 'Insulin Aspart',
    tradeName: 'NovoLog / Fiasp / NovoLog Mix 70/30 / Kirsty / Merilog / Garzulys',
    sponsor: 'Novo Nordisk Inc. (originator); biosimilars from Biocon, Sanofi and others since 2025',
    targetGene: 'INSR',
    targetProtein:
      'Insulin receptor, a disulphide-linked alpha-2-beta-2 receptor tyrosine kinase on skeletal muscle, adipocyte and hepatocyte membranes',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 2000,
    indication:
      'To improve glycaemic control in adults and children with diabetes mellitus. Not recommended for the treatment of diabetic ketoacidosis in its premixed form, in which the proportions of rapid-acting and long-acting insulin are fixed.',
    patientFriendlyIndication: 'Diabetes — the fast insulin taken around meals',
    anatomicalSite:
      'Subcutaneous depot, then insulin receptors on skeletal muscle, fat and liver cells',
    conditionContext: {
      conditionExplainer:
        'Insulin is the signal that tells muscle and fat to take sugar out of the blood and tells the liver to stop releasing more. In type 1 diabetes the cells that make it have been destroyed. In advanced type 2 diabetes there is still some, but not enough at the moment a meal arrives. Either way the blood sugar spike after eating is the part that is hardest to cover.',
      whyItMatters:
        'Human insulin injected under the skin does not behave like insulin released into a vein. It sits in a subcutaneous depot as a six-molecule cluster that has to fall apart before anything is absorbed, so it peaks too late for the meal and is still working hours afterwards. That mismatch is where post-meal spikes and late hypoglycaemia both come from.',
      whoTakesThis:
        'Everyone with type 1 diabetes who eats, and people with type 2 diabetes whose basal insulin no longer covers meals. It is one of the most-dispensed insulins in the world and is on the WHO Model List of Essential Medicines.',
      clinicalGoals:
        'Cover the glucose rise from a meal without causing a hypo three hours later. The trials measured HbA1c and post-meal glucose; none of them measured whether people lived longer.',
    },
    oneSentenceVerdict:
      'Human insulin with proline at position 28 of the B chain replaced by aspartic acid so the molecule stops clumping and is absorbed faster — a change that lowered HbA1c by 0.12 percentage points against soluble human insulin in 1,070 randomised adults, and that a Cochrane review of nine trials and 2,693 people scored at -0.15 percentage points with no reduction in severe hypoglycaemia at all.',
    laymanHowItWorks:
      'Ordinary insulin injected under the skin does not stay as single molecules. Six of them lock together around a zinc atom, and that clump has to break apart before anything can be absorbed, which takes half an hour or more. Insulin aspart has one building block swapped for a negatively charged one, and the resulting electrical repulsion stops the six sticking together. The molecules go into the bloodstream faster, act on the same receptor as ordinary insulin, and are gone sooner.',
    auditConfidence: 'High Confidence',
    confidenceScore: 79,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$8.57 per millilitre at United States pharmacy acquisition cost, the median across 16 listed products in the CMS NADAC survey effective 19 August 2026',
      markupEstimate: '',
      openPatentNotes:
        'Approved as NovoLog under BLA 020986 on 7 June 2000, with NovoLog Mix 70/30 following under BLA 021172 in November 2001. The original patents have expired: interchangeable biosimilars have been licensed since 2025 — Kirsty (Biocon Biologics, BLA 761188), Merilog (Sanofi, BLA 761325) and Garzulys (Emerge Bioscience, BLA 761497).',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The honest comparison is between insulin aspart and ordinary soluble human insulin, which costs a fraction as much and which the pooled randomised evidence separates from it by about a seventh of a percentage point of HbA1c with no difference in severe hypoglycaemia. Aspart competes with insulin lispro and insulin glulisine, which do the same trick with different residues and have never been shown to differ from it. Nothing eaten, brewed or bought over a counter substitutes for insulin in type 1 diabetes, and this page does not pretend otherwise.',
      conventionalRx: [
        {
          name: 'Regular human insulin (Humulin R, Novolin R)',
          class: 'Recombinant human insulin, unmodified sequence',
          howItCompares:
            'The comparator in every registration trial. In the Cochrane pooling of nine randomised trials and 2,693 adults with type 1 diabetes, short-acting analogues beat regular human insulin on HbA1c by a mean difference of -0.15 percentage points (95% CI -0.2 to -0.1, p<0.00001) on low-quality evidence, and the odds ratio for severe hypoglycaemia was 0.89 (95% CI 0.71 to 1.12, p=0.31) — no difference.',
          typicalCost:
            'Sold over the counter in some United States states as Novolin R ReliOn at a small fraction of the analogue price; no NADAC figure is held on this record',
          prosAndCons:
            'Pros: far cheaper, decades of use, identical to the human sequence. Cons: has to be injected well before a meal because the hexamers must dissociate first, and the tail of action runs long enough to cause late hypoglycaemia.',
        },
        {
          name: 'Insulin lispro (Humalog, Admelog, Lyumjev)',
          class: 'Rapid-acting insulin analogue',
          howItCompares:
            'The same idea executed with a different edit — proline and lysine at B28 and B29 are swapped with each other rather than substituted. It reached the market four years earlier and no trial has separated the two on any clinical endpoint.',
          typicalCost: 'No NADAC figure for lispro is held on this record',
          prosAndCons:
            'Pros: interchangeable in practice, more biosimilar competition. Cons: same class, same limitations, same price problem.',
        },
        {
          name: 'Fast-acting insulin aspart (Fiasp)',
          class: 'Insulin aspart reformulated with niacinamide and L-arginine',
          howItCompares:
            'The same molecule with excipients that speed absorption further. In onset 1 (NCT01831765), a 1,290-participant phase 3 trial, mealtime faster aspart beat conventional aspart on HbA1c by an estimated treatment difference of -0.15 percentage points (95% CI -0.23 to -0.07, p=0.0003) and cut the one-hour post-meal glucose increment by 1.18 mmol/L (95% CI -1.65 to -0.71).',
          typicalCost:
            'Fiasp is one of the 16 products in the NADAC median quoted on this record; no separate figure is held',
          prosAndCons:
            'Pros: a real, measured, statistically significant improvement in post-meal glucose. Cons: the HbA1c gain is the same tenth of a percentage point the whole analogue class trades in, and hypoglycaemia rates were comparable.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Say out loud if you are stretching your insulin because of cost',
          action:
            'Tell the prescribing clinician if the supply is being made to last longer than it should. Cost-related underuse is common, it is invisible on a prescription record, and it is the single most likely explanation for an HbA1c that will not come down.',
          patientImpact:
            'In a single-centre survey of 199 patients at Yale, 51 (25.5%) reported cost-related insulin underuse in the preceding year. Those patients had three times the odds of an HbA1c of 9% or more (odds ratio 2.96, 95% CI 1.14 to 8.16, p=0.03).',
          clinicalPrecaution:
            'Rationing insulin in type 1 diabetes causes diabetic ketoacidosis, which kills people. This is a reason to say something, not a reason to manage it privately.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC[C@H](C)[C@@H](C(=O)N[C@@H](C(C)C)C(=O)N[C@@H](CCC(=O)O)C(=O)N[C@@H](CCC(=O)N)C(=O)N[C@@H](CS)C(=O)N[C@@H](CS)C(=O)N[C@@H]([C@@H](C)O)C(=O)N[C@@H](CO)C(=O)N[C@@H]([C@@H](C)CC)C(=O)N[C@@H](CS)C(=O)N[C@@H](CO)C(=O)N[C@@H](CC(C)C)C(=O)N[C@@H](CC1=CC=C(C=C1)O)C(=O)N[C@@H](CCC(=O)N)C(=O)N[C@@H](CC(C)C)C(=O)N[C@@H](CCC(=O)O)C(=O)N[C@@H](CC(=O)N)C(=O)N[C@@H](CC2=CC=C(C=C2)O)C(=O)N[C@@H](CS)C(=O)N[C@@H](CC(=O)N)C(=O)O)NC(=O)CN.C[C@H]([C@@H](C(=O)N[C@@H](CC(=O)O)C(=O)N[C@@H](CCCCN)C(=O)N[C@@H]([C@@H](C)O)C(=O)O)NC(=O)[C@H](CC1=CC=C(C=C1)O)NC(=O)[C@H](CC2=CC=CC=C2)NC(=O)[C@H](CC3=CC=CC=C3)NC(=O)CNC(=O)[C@H](CCCNC(=N)N)NC(=O)[C@H](CCC(=O)O)NC(=O)CNC(=O)[C@H](CS)NC(=O)[C@H](C(C)C)NC(=O)[C@H](CC(C)C)NC(=O)[C@H](CC4=CC=C(C=C4)O)NC(=O)[C@H](CC(C)C)NC(=O)[C@H](C)NC(=O)[C@H](CCC(=O)O)NC(=O)[C@H](C(C)C)NC(=O)[C@H](CC(C)C)NC(=O)[C@H](CC5=CN=CN5)NC(=O)[C@H](CO)NC(=O)CNC(=O)[C@H](CS)NC(=O)[C@H](CC(C)C)NC(=O)[C@H](CC6=CN=CN6)NC(=O)[C@H](CCC(=O)N)NC(=O)[C@H](CC(=O)N)NC(=O)[C@H](C(C)C)NC(=O)[C@H](CC7=CC=CC=C7)N)O',
      chemicalFormula: 'C256H387N65O79S6',
      molecularWeight: '5832 g/mol',
      targetReceptorAffinity:
        'Binds the insulin receptor with affinity close to that of human insulin; the substitution was chosen to alter self-association in the vial and under the skin, not receptor binding. Insulin aspart is human insulin with proline at position B28 replaced by aspartic acid. The added negative charge makes neighbouring monomers repel each other, so the zinc hexamer dissociates faster in the subcutaneous depot and absorption is quicker. Everything downstream of the receptor is unchanged.',
      structureSource: {
        label:
          'PubChem CID 16132418 (insulin aspart) — SMILES, molecular formula and weight, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16132418',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'asp-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Verification of the expression construct and the master cell bank',
          description:
            'Sequence the plasmid encoding the single-chain proinsulin aspart precursor and confirm the codon at position B28 encodes aspartate, then release the Saccharomyces cerevisiae master cell bank for identity, purity and plasmid retention. This is the only step at which the difference between insulin aspart and human insulin exists as a checkable fact rather than an assumption.',
          reagentsAndBuffer:
            'Plasmid preparation kit, Sanger and next-generation sequencing of the insert, YPD and selective minimal media, host-cell identity PCR, mycoplasma and bacteriophage screening panels',
        },
        {
          id: 'asp-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fed-batch yeast fermentation and secretion of the single-chain precursor',
          description:
            'Grow the recombinant yeast in a fed-batch bioreactor so it secretes a single-chain precursor in which the B chain and A chain are joined by a short connecting peptide. Secretion into the medium rather than accumulation in inclusion bodies is what makes the yeast route cheaper than the Escherichia coli route, because the disulphide bonds form correctly in the secretory pathway and nothing has to be refolded.',
          dependsOnStepId: 'asp-w1',
          reagentsAndBuffer:
            'Defined mineral salts medium with glucose feed, ammonium hydroxide for pH control, antifoam, dissolved-oxygen and pH probes, stainless-steel fed-batch bioreactor',
        },
        {
          id: 'asp-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Trypsin and carboxypeptidase B conversion, then reversed-phase and ion-exchange capture',
          description:
            'Cleave the connecting peptide enzymatically to release the two-chain molecule, then purify by successive reversed-phase and ion-exchange chromatography and crystallise with zinc. The related substances the monograph is written to catch are desamido forms and covalent dimers, both of which form on storage and neither of which is removed later.',
          dependsOnStepId: 'asp-w2',
          reagentsAndBuffer:
            'Trypsin and carboxypeptidase B, Tris buffer with calcium chloride, C18 reversed-phase resin with acetonitrile gradients, anion-exchange resin, zinc chloride and sodium citrate for crystallisation',
        },
        {
          id: 'asp-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Hexamer dissociation kinetics in a subcutaneous-mimetic buffer',
          description:
            'Dilute the zinc-phenol-stabilised formulation into a buffer that mimics interstitial fluid and follow the fall from hexamer to dimer to monomer. This is the step the aspartate substitution exists to accelerate, and it is where an analogue either differs from human insulin or does not; receptor assays cannot see it.',
          dependsOnStepId: 'asp-w3',
          reagentsAndBuffer:
            'Formulated drug product with zinc, m-cresol and phenol, isotonic phosphate buffer at pH 7.4, size-exclusion chromatography with online multi-angle light scattering, analytical ultracentrifugation',
        },
        {
          id: 'asp-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Receptor binding, IGF-1 receptor cross-reactivity and cell-based glucose uptake',
          description:
            'Measure competition against radiolabelled human insulin at the insulin receptor, measure cross-binding at the IGF-1 receptor separately, and read glucose uptake in differentiated adipocytes. All three are reported because an analogue that gains mitogenic IGF-1 receptor affinity while keeping metabolic potency is the specific failure mode that ended the development of one earlier analogue.',
          dependsOnStepId: 'asp-w4',
          reagentsAndBuffer:
            'Solubilised human insulin receptor and IGF-1 receptor preparations, iodine-125 labelled human insulin and IGF-1, scintillation proximity beads, differentiated 3T3-L1 adipocytes, tritiated 2-deoxyglucose',
        },
      ],
    },
    keyAudits: [
      {
        id: 'asp-a1',
        category: 'measured',
        title: 'The registration trial gained 0.12 percentage points of HbA1c in 1,070 adults',
        laymanSummary:
          'The trial that established insulin aspart randomised just over a thousand adults with type 1 diabetes for six months. The improvement in average blood sugar over the human insulin it replaced was about a tenth of a percentage point.',
        technicalDetails:
          'Home and colleagues randomised 1,070 adults with type 1 diabetes 2:1 to pre-meal insulin aspart or pre-meal soluble human insulin in a six-month multinational open-label trial. The baseline-adjusted difference in HbA1c was 0.12 percentage points (95% CI 0.03 to 0.22, p<0.02) in favour of aspart. Post-prandial glucose was lower after meals on aspart and pre-prandial glucose was higher. The relative risk of a major hypoglycaemic episode was 0.83 (95% CI 0.59 to 1.18, not significant); nocturnal episodes requiring treatment were reduced. Treatment satisfaction scores improved significantly.',
        evidenceSource: 'Home PD et al., Diabet Med 2000;17:762-770',
        doi: '10.1046/j.1464-5491.2000.00380.x',
        measuredMetric:
          'Baseline-adjusted difference in HbA1c at six months, and relative risk of major hypoglycaemia',
        auditFlag: 'verified',
      },
      {
        id: 'asp-a2',
        category: 'inferred',
        title: 'The whole class gains a seventh of a point and does not reduce severe hypoglycaemia',
        laymanSummary:
          'Pooling every randomised trial of fast analogues against ordinary human insulin in adults with type 1 diabetes gives an HbA1c advantage of 0.15 percentage points, on evidence the reviewers graded low quality, and no reduction in the severe lows the class is usually sold on preventing.',
        technicalDetails:
          'Fullerton and colleagues included nine randomised controlled trials with 2,693 participants and 24 to 52 weeks of intervention in a Cochrane review searched to April 2015. The mean difference in HbA1c was -0.15 percentage points (95% CI -0.2 to -0.1, p<0.00001), graded low quality. The odds ratio for severe hypoglycaemia was 0.89 (95% CI 0.71 to 1.12, p=0.31). The authors concluded the evidence demonstrated only minor benefits and that long-term efficacy and safety data on patient-relevant outcomes were needed. No trial in the pooling measured mortality, and none measured microvascular complications.',
        evidenceSource:
          'Fullerton B et al., Cochrane Database Syst Rev 2016;(6):CD012161 (PMID 27362975)',
        doi: '10.1002/14651858.CD012161',
        inferredClaim:
          'That rapid-acting analogues prevent severe hypoglycaemia relative to human insulin — the pooled odds ratio crosses 1 and the confidence interval is compatible with no effect in either direction',
        auditFlag: 'caution',
      },
      {
        id: 'asp-a3',
        category: 'failed',
        title:
          'In 4-T, the prandial aspart arm had the most hypoglycaemia and the most weight gain of the three',
        laymanSummary:
          'A three-year trial compared three ways of adding insulin to tablets in type 2 diabetes. The mealtime insulin aspart arm ended at the same average blood sugar as the others but with more than three times the rate of hypoglycaemia of the basal arm, and the most weight gain.',
        technicalDetails:
          'The Treating to Target in Type 2 Diabetes (4-T) trial randomised 708 patients with suboptimal HbA1c on metformin and sulfonylurea to biphasic insulin aspart twice daily, prandial insulin aspart three times daily, or basal insulin detemir once or twice daily, open-label, for three years. Median HbA1c was similar across the three arms — biphasic 7.1%, prandial 6.8%, basal 6.9% (p=0.28). Median rates of hypoglycaemia per patient per year were 1.7 in the basal group, 3.0 in the biphasic group and 5.7 in the prandial group (p<0.001 for the overall comparison). Mean weight gain was higher in the prandial group than in either the biphasic or the basal group. At one year the same trial had already shown biphasic and prandial regimens achieving better control than basal, but with greater hypoglycaemia and weight gain.',
        evidenceSource:
          'Holman RR et al., N Engl J Med 2009;361:1736-1747 (ISRCTN51125379); one-year results Holman RR et al., N Engl J Med 2007;357:1716-1730',
        doi: '10.1056/NEJMoa0905479',
        measuredMetric:
          'Median hypoglycaemia episodes per patient per year and mean weight gain at three years, by insulin regimen',
        auditFlag: 'verified',
      },
      {
        id: 'asp-a4',
        category: 'measured',
        title: 'Faster aspart beat ordinary aspart on post-meal glucose, and by the same 0.15 points',
        laymanSummary:
          'Reformulating the identical molecule with two absorption-accelerating additives measurably flattened the one-hour post-meal glucose rise. The average blood sugar advantage was the same tenth of a point the class always produces.',
        technicalDetails:
          'onset 1 (NCT01831765) randomised 1,290 adults with type 1 diabetes, after an 8-week run-in, to mealtime faster aspart (n=381), conventional insulin aspart (n=380) or post-meal faster aspart (n=382), each with insulin detemir, in a 26-week treat-to-target trial. Mealtime faster aspart was superior to conventional aspart on HbA1c with an estimated treatment difference of -0.15 percentage points (95% CI -0.23 to -0.07, p=0.0003). The post-prandial glucose increment was lower by 1.18 mmol/L at one hour (95% CI -1.65 to -0.71) and by 0.67 mmol/L at two hours (95% CI -1.29 to -0.04, p=0.0375). Hypoglycaemia rates and overall safety profiles were comparable between arms.',
        evidenceSource: 'Russell-Jones D et al., Diabetes Care 2017;40:943-950 (NCT01831765)',
        doi: '10.2337/dc16-1771',
        measuredMetric:
          'Estimated treatment difference in HbA1c at 26 weeks and post-prandial glucose increment at 1 and 2 hours',
        auditFlag: 'verified',
      },
      {
        id: 'asp-a5',
        category: 'conclusion_shift',
        title: 'The molecule became affordable only when the patents ran out, not when trials asked',
        laymanSummary:
          'For a quarter of a century this was a patented product with no generic, and a quarter of patients at one American clinic were using less of it than prescribed because of the price. Interchangeable biosimilars arrived in 2025.',
        technicalDetails:
          'NovoLog was approved on 7 June 2000 under BLA 020986. No interchangeable competitor existed in the United States until Kirsty (Biocon Biologics, BLA 761188) was submitted in July 2025, followed by Merilog (Sanofi, BLA 761325) and Garzulys (Emerge Bioscience, BLA 761497). During that period Herkert and colleagues surveyed 199 patients at a single Yale clinic and found 51 (25.5%) reporting cost-related insulin underuse in the preceding year, with an odds ratio of 2.96 for an HbA1c of 9% or more (95% CI 1.14 to 8.16, p=0.03). The clinical literature on insulin aspart contains no trial in which price was a randomised variable, and the pooled evidence separating analogues from human insulin — 0.15 HbA1c percentage points, no severe hypoglycaemia benefit — was available throughout.',
        evidenceSource:
          'Herkert D et al., JAMA Intern Med 2019;179:112-114; openFDA Drugs@FDA records for BLA 020986, 761188, 761325 and 761497',
        doi: '10.1001/jamainternmed.2018.5008',
        measuredMetric:
          'Proportion of surveyed patients reporting cost-related insulin underuse, and the associated odds of HbA1c at or above 9%',
        auditFlag: 'contested',
      },
      {
        id: 'asp-a6',
        category: 'measured',
        title: 'The advantage held for thirty months, and minor hypoglycaemia rose with it',
        laymanSummary:
          'Following the original trial participants for two and a half years, the small blood sugar advantage persisted. So did a 24% higher rate of minor hypoglycaemic episodes.',
        technicalDetails:
          'The 30-month extension of the registration trial followed 753 of the original participants. The baseline-adjusted HbA1c difference was -0.16 percentage points (95% CI -0.32 to -0.01, p=0.035) in favour of insulin aspart. Major hypoglycaemia was unchanged, with a relative risk of 1.00 (95% CI 0.72 to 1.39). Minor hypoglycaemic episodes were more frequent on aspart, relative risk 1.24 (95% CI 1.09 to 1.39, p=0.024). The authors described the drug as well tolerated and effective in long-term treatment, and the minor-hypoglycaemia signal sits in the same abstract.',
        evidenceSource: 'Home PD et al., Diabetes Res Clin Pract 2006;71:131-139 (PMID 16054266)',
        doi: '10.1016/j.diabres.2005.05.015',
        measuredMetric:
          'Baseline-adjusted HbA1c difference and relative risk of major and minor hypoglycaemia at 30 months',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected under the skin as a six-molecule cluster',
        laymanDesc:
          'What comes out of the pen is not single insulin molecules. They are packed in sixes around zinc atoms, which is how the liquid stays stable in a vial for weeks.',
        molecularDetail:
          'The formulation contains zinc and phenolic preservatives that hold insulin in the R-state hexamer. Hexamerisation is a storage-stability requirement, not a pharmacological one: the hexamer cannot cross the capillary endothelium and is pharmacologically inert until it dissociates.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'One swapped building block makes the cluster fall apart faster',
        laymanDesc:
          'In insulin aspart, one of the 51 building blocks carries a negative charge that the original did not. Like charges push apart, so the cluster of six breaks up sooner than it would otherwise.',
        molecularDetail:
          'Proline at position B28 is replaced by aspartic acid. The carboxylate sits at the dimer-forming interface and introduces electrostatic repulsion between monomers, shifting the hexamer-dimer-monomer equilibrium toward monomer. Nothing else in the 51-residue sequence is changed.',
        iconName: 'Split',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Monomers cross into the blood and reach the receptor',
        laymanDesc:
          'Single molecules are small enough to pass out of the tissue fluid into the bloodstream. From there they travel to muscle, fat and liver.',
        molecularDetail:
          'Only the monomer and, to a lesser extent, the dimer are absorbed across the subcutaneous capillary endothelium. The faster dissociation shortens time to maximum plasma concentration relative to soluble human insulin; the receptor the molecule then meets is the same one, with essentially unchanged affinity.',
        iconName: 'ArrowRightLeft',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The receptor switches on the machinery that pulls sugar out of the blood',
        laymanDesc:
          'Insulin binding flips a switch on the cell surface. Inside, a relay of signals moves glucose transporters to the membrane, where they start taking sugar in.',
        molecularDetail:
          'Binding to the alpha subunits triggers autophosphorylation of the beta-subunit tyrosine kinase, which phosphorylates insulin receptor substrate proteins and activates the PI3K-AKT pathway. AKT drives translocation of GLUT4 vesicles to the plasma membrane in muscle and adipose tissue, and suppresses hepatic gluconeogenesis and lipolysis.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The post-meal spike is blunted, and the tail is shorter',
        laymanDesc:
          'Blood sugar after a meal rises less, and the insulin is gone sooner, so there is less left over to cause a low hours later. Average blood sugar moves by roughly a tenth of a percentage point.',
        molecularDetail:
          'In onset 1 the one-hour post-prandial glucose increment fell by 1.18 mmol/L against conventional aspart, and in the registration trial post-prandial glucose was lower while pre-prandial glucose was higher. The HbA1c consequence is small and consistent: 0.12 points in the registration trial, 0.15 points in the Cochrane pooling, 0.15 points in onset 1.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Home 2000 registration trial, insulin aspart versus soluble human insulin',
        phase: 'Randomised multinational open-label trial, 6 months',
        sampleSize: 1070,
        primaryEndpoint: 'Baseline-adjusted difference in HbA1c at six months',
        endpointMet: true,
        statisticalPValue: 'P < 0.02 for a 0.12 percentage-point difference (95% CI 0.03 to 0.22)',
        unreportedAdverseSignals:
          'Pre-prandial glucose was higher on aspart, which the HbA1c figure absorbs and does not display.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Home 2006, 30-month extension of the registration trial',
        phase: 'Open-label extension, 30 months',
        sampleSize: 753,
        primaryEndpoint: 'Long-term safety, with baseline-adjusted HbA1c and hypoglycaemia rates',
        endpointMet: true,
        statisticalPValue:
          'P = 0.035 for a -0.16 percentage-point HbA1c difference; P = 0.024 for a 24% higher rate of minor hypoglycaemia',
        unreportedAdverseSignals:
          'Minor hypoglycaemia was significantly more frequent on aspart (RR 1.24, 95% CI 1.09 to 1.39). Major hypoglycaemia was identical (RR 1.00).',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'onset 1 (NCT01831765)',
        phase: 'Phase 3 treat-to-target randomised parallel-group trial, 26 weeks',
        sampleSize: 1290,
        primaryEndpoint: 'Change in HbA1c from baseline to week 26',
        endpointMet: true,
        statisticalPValue:
          'P = 0.0003 for an estimated treatment difference of -0.15 percentage points (95% CI -0.23 to -0.07)',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: '4-T, prandial insulin aspart arm (ISRCTN51125379)',
        phase: 'Open-label randomised three-arm trial, 3 years',
        sampleSize: 708,
        primaryEndpoint:
          'HbA1c, proportion reaching 6.5% or less, hypoglycaemia rate and weight gain across three insulin regimens',
        endpointMet: false,
        statisticalPValue:
          'P = 0.28 for the HbA1c comparison across arms; P < 0.001 for the difference in hypoglycaemia rates',
        unreportedAdverseSignals:
          'The prandial aspart arm recorded 5.7 hypoglycaemic episodes per patient per year against 1.7 in the basal arm, and the greatest weight gain of the three regimens.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Cochrane pooling of short-acting analogues in adults with type 1 diabetes',
        phase: 'Systematic review and meta-analysis of nine randomised trials, 24 to 52 weeks',
        sampleSize: 2693,
        primaryEndpoint:
          'HbA1c and severe hypoglycaemia against regular human insulin, with patient-relevant outcomes as co-primary',
        endpointMet: false,
        statisticalPValue:
          'P < 0.00001 for an HbA1c mean difference of -0.15 percentage points; P = 0.31 for severe hypoglycaemia (OR 0.89, 95% CI 0.71 to 1.12)',
        unreportedAdverseSignals:
          'No included trial reported mortality, microvascular complications or health-related quality of life over the long term. The reviewers graded the HbA1c evidence low quality.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 0.12 percentage-point HbA1c advantage over soluble human insulin in 1,070 randomised adults at six months, holding at -0.16 points in 753 of them at 30 months',
        'A pooled HbA1c mean difference of -0.15 percentage points across nine trials and 2,693 participants, graded low quality by the reviewers',
        'A 1.18 mmol/L reduction in the one-hour post-meal glucose increment for the accelerated formulation against conventional aspart in 1,290 participants',
        'A 24% higher rate of minor hypoglycaemic episodes on aspart over 30 months (RR 1.24, 95% CI 1.09 to 1.39)',
      ],
      unsupportedInferences: [
        'That rapid-acting analogues reduce severe hypoglycaemia — the pooled odds ratio is 0.89 with a confidence interval from 0.71 to 1.12',
        'That the HbA1c advantage translates into fewer amputations, less blindness, less kidney failure or fewer deaths — no trial of insulin aspart has measured any of those',
        'That a faster onset makes meal timing flexible in ordinary use; the trials that produced these numbers ran under trial-grade supervision and structured titration',
      ],
      whatFailedInitially: [
        'In 4-T, the prandial aspart regimen produced 5.7 hypoglycaemic episodes per patient per year against 1.7 on basal insulin, and the most weight gain of the three arms, for no HbA1c advantage at three years',
        'Pre-prandial glucose was consistently higher on aspart than on human insulin in the registration trial, a trade the single HbA1c number conceals',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines and among the most-dispensed insulins in the world',
        'US$8.57 per millilitre at United States pharmacy acquisition cost, the median across 16 listed products in the CMS NADAC survey',
        'Interchangeable biosimilars entered the United States in 2025 — Kirsty, Merilog and Garzulys — 25 years after the original approval',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection by pen, vial and syringe, or insulin pump; also given intravenously under supervision',
      description:
        'Supplied as a clear solution stabilised with zinc and phenolic preservatives, and as a premixed suspension with protamine-crystallised insulin aspart in a fixed 70:30 ratio. The premix cannot be adjusted for basal and mealtime needs independently, which is why its label carries that as an explicit limitation.',
      safetyProfile:
        'Hypoglycaemia is the commonest and most serious adverse effect of every insulin, and it is dose-related rather than analogue-specific. Hypokalaemia can follow any insulin dose. Injection-site reactions, lipodystrophy and weight gain occur. Hypersensitivity reactions including anaphylaxis are rare. The premixed products are not recommended for diabetic ketoacidosis. Concentration and product names are close enough that dispensing errors between insulin products are a recognised hazard.',
    },
    commonQuestions: [
      {
        q: 'Is insulin aspart actually better than ordinary human insulin?',
        a: 'Measurably, and by less than most people expect. The Cochrane review that pooled nine randomised trials and 2,693 adults with type 1 diabetes found an HbA1c advantage of 0.15 percentage points for the analogue class, on evidence the reviewers graded low quality, and no reduction at all in severe hypoglycaemia — the odds ratio was 0.89 with a confidence interval running from 0.71 to 1.12. The registration trial of insulin aspart itself found 0.12 points. What the analogue reliably does is change the shape of the curve: less glucose rise after a meal, less insulin left over hours later, and no waiting between injecting and eating. Whether that is worth the price difference is a question the trials were not designed to answer.',
        auditNote:
          'The class is usually sold on hypoglycaemia. The pooled hypoglycaemia result is the one number that has not moved.',
      },
      {
        q: 'What is the difference between NovoLog and Fiasp?',
        a: 'The insulin molecule is identical. Fiasp adds niacinamide and L-arginine to speed absorption from the injection site. In onset 1, a 1,290-participant trial, that reformulation cut the one-hour post-meal glucose increment by 1.18 mmol/L against conventional insulin aspart and improved HbA1c by 0.15 percentage points, with comparable hypoglycaemia. So the faster version is genuinely faster, and it buys the same tenth-of-a-point HbA1c improvement that the original bought over human insulin two decades earlier.',
      },
      {
        q: 'Why does mealtime insulin cause more low blood sugar than basal insulin?',
        a: 'Because it is being asked to match something that varies. The 4-T trial randomised 708 people with type 2 diabetes to three insulin regimens for three years and counted the episodes. The basal arm recorded a median of 1.7 hypoglycaemic episodes per patient per year, the biphasic arm 3.0, and the mealtime insulin aspart arm 5.7. All three arms ended at effectively the same HbA1c. Mealtime insulin has to be matched to a meal that has not been eaten yet, and every mismatch in that estimate is either a spike or a hypo.',
        auditNote:
          'This is a type 2 diabetes trial. It does not transfer to type 1, where mealtime insulin is not optional.',
      },
      {
        q: 'Why was there no cheaper version for 25 years?',
        a: 'Insulin analogues are biologics, not small molecules, so a competitor cannot simply file a generic — it has to run its own comparability programme and be licensed under its own biologics application. NovoLog was approved in June 2000 and the first interchangeable competitors were not submitted until 2025: Kirsty from Biocon Biologics, Merilog from Sanofi and Garzulys from Emerge Bioscience. During that quarter-century, a survey of 199 patients at one American clinic found 51 of them, 25.5%, using less insulin than prescribed because of cost, with three times the odds of an HbA1c at or above 9%.',
      },
      {
        q: 'Does this page show what the drug costs to make?',
        a: 'No, because no verifiable per-dose cost-of-production figure for recombinant insulin aspart could be found and cited. The figure shown is what United States pharmacies pay to acquire it — US$8.57 per millilitre, the median across 16 listed products in the CMS National Average Drug Acquisition Cost survey. That is a price, not a manufacturing cost, and the gap between the two is exactly the thing this page cannot measure.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Home PD, Lindholm A, Riis A. Insulin aspart vs. human insulin in the management of long-term blood glucose control in Type 1 diabetes mellitus: a randomized controlled trial. Diabet Med 2000;17:762-770',
        identifier: '10.1046/j.1464-5491.2000.00380.x',
        kind: 'doi',
      },
      {
        label:
          'Home PD, Hallgren P, Usadel KH et al. Pre-meal insulin aspart compared with pre-meal soluble human insulin in type 1 diabetes. Diabetes Res Clin Pract 2006;71:131-139',
        identifier: '16054266',
        kind: 'pmid',
      },
      {
        label:
          'Fullerton B, Siebenhofer A, Jeitler K et al. Short-acting insulin analogues versus regular human insulin for adults with type 1 diabetes mellitus. Cochrane Database Syst Rev 2016;(6):CD012161',
        identifier: '10.1002/14651858.CD012161',
        kind: 'doi',
      },
      {
        label:
          'Russell-Jones D, Bode BW, De Block C et al. Fast-Acting Insulin Aspart Improves Glycemic Control in Basal-Bolus Treatment for Type 1 Diabetes: Results of a 26-Week Trial (onset 1). Diabetes Care 2017;40:943-950',
        identifier: '10.2337/dc16-1771',
        kind: 'doi',
      },
      {
        label:
          'onset 1: Efficacy and Safety of FIAsp Compared to Insulin Aspart, Both in Combination With Insulin Detemir, in Adults With Type 1 Diabetes',
        identifier: 'NCT01831765',
        kind: 'nct',
      },
      {
        label:
          'Holman RR, Farmer AJ, Davies MJ et al. Three-year efficacy of complex insulin regimens in type 2 diabetes (4-T). N Engl J Med 2009;361:1736-1747',
        identifier: '10.1056/NEJMoa0905479',
        kind: 'doi',
      },
      {
        label:
          'Holman RR, Thorne KI, Farmer AJ et al. Addition of biphasic, prandial, or basal insulin to oral therapy in type 2 diabetes. N Engl J Med 2007;357:1716-1730',
        identifier: '10.1056/NEJMoa075392',
        kind: 'doi',
      },
      {
        label:
          'Herkert D, Vijayakumar P, Luo J et al. Cost-Related Insulin Underuse Among Patients With Diabetes. JAMA Intern Med 2019;179:112-114',
        identifier: '10.1001/jamainternmed.2018.5008',
        kind: 'doi',
      },
      {
        label:
          'openFDA Drugs@FDA — BLA 020986 (NOVOLOG, Novo Nordisk, original approval 7 June 2000) and the 2025 interchangeable applications BLA 761188, 761325 and 761497',
        identifier: 'https://api.fda.gov/drug/drugsfda.json?search=openfda.generic_name:%22insulin+aspart%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 16132418 — insulin aspart structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16132418',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 2. Insulin detemir — a fatty acid bolted on so albumin holds the molecule back, which produced
  //    less hypoglycaemia and less weight gain than NPH, and then left the United States market.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'insulin-detemir',
    name: 'Insulin Detemir',
    tradeName: 'Levemir',
    sponsor: 'Novo Nordisk Inc.',
    targetGene: 'INSR',
    targetProtein:
      'Insulin receptor, reached slowly from an albumin-bound circulating reservoir rather than from a crystalline subcutaneous depot',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 2005,
    indication:
      'To improve glycaemic control in adult and paediatric patients with diabetes mellitus. Not recommended for the treatment of diabetic ketoacidosis.',
    patientFriendlyIndication: 'Diabetes — the background insulin that works through the day',
    anatomicalSite:
      'Subcutaneous depot and the albumin pool of the bloodstream, then insulin receptors on liver, muscle and fat',
    conditionContext: {
      conditionExplainer:
        'Between meals and overnight the body still needs a low, steady level of insulin, or the liver keeps pouring glucose into the blood. Replacing that background level is a separate job from covering meals, and it is the job basal insulin does.',
      whyItMatters:
        'The older background insulin, NPH, is a crystalline suspension that has to be resuspended before injection and releases in a pronounced peak several hours later. That peak lands in the middle of the night, which is when hypoglycaemia is hardest to notice and most dangerous.',
      whoTakesThis:
        'People with type 1 diabetes as the background half of a basal-bolus regimen, and people with type 2 diabetes whose tablets are no longer enough. It was widely used in pregnancy, where it has a randomised trial NPH does not.',
      clinicalGoals:
        'Hold fasting glucose steady without an overnight peak. The trials measured HbA1c, hypoglycaemia rates and body weight; none measured cardiovascular events.',
    },
    oneSentenceVerdict:
      'Human insulin with the last B-chain residue removed and a 14-carbon fatty acid attached so the molecule binds albumin and is released slowly — a design that matched NPH insulin on HbA1c in 476 randomised adults while cutting all hypoglycaemia by 47% and halving the weight gain to 1.2 kg against 2.8 kg, and that Novo Nordisk has since withdrawn presentation by presentation from the United States market.',
    laymanHowItWorks:
      'Background insulin has to last. The older way of making it last was to crystallise insulin so it dissolves slowly, which produces a hump of activity in the middle of the night. Insulin detemir does it differently: a fatty acid tail is attached to the molecule, and that tail sticks to albumin, the most abundant protein in blood. Almost all of the injected drug is held on albumin at any moment, and only the small unbound fraction can reach a receptor. The reservoir empties gradually instead of in a wave.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$10.36 per millilitre at United States pharmacy acquisition cost, for the one branded product listed in the CMS NADAC survey effective 22 January 2025',
      markupEstimate: '',
      openPatentNotes:
        'Approved as Levemir under BLA 021536 on 16 June 2005. No biosimilar insulin detemir has been licensed in the United States. Drugs@FDA now lists the Levemir FlexPen, PenFill and InnoLet presentations as discontinued, with the vial and FlexTouch still listed as prescription products — a molecule leaving a market by commercial decision rather than by any safety finding.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Detemir was designed against NPH insulin and beat it on hypoglycaemia and weight while matching it on HbA1c. Against insulin glargine, the analogue it actually competed with commercially, it was non-inferior on HbA1c but needed roughly twice the units and a second daily injection in more than half of participants. Against insulin degludec, the successor from the same company, it lost on duration and on hypoglycaemia. Nothing eaten or bought over a counter substitutes for basal insulin.',
      conventionalRx: [
        {
          name: 'NPH insulin (Humulin N, Novolin N)',
          class: 'Isophane human insulin, a protamine-crystallised suspension',
          howItCompares:
            'The comparator in the registration programme. In a 476-participant 26-week treat-to-target trial, HbA1c fell by 1.8 points on detemir and 1.9 points on NPH (not significant) with 70% of each group reaching 7.0% or less, while the risk of all hypoglycaemia was 47% lower on detemir (p<0.001), nocturnal hypoglycaemia 55% lower (p<0.001), and mean weight gain 1.2 kg against 2.8 kg (p<0.001).',
          typicalCost:
            'Sold over the counter in some United States states at a fraction of the analogue price; no NADAC figure is held on this record',
          prosAndCons:
            'Pros: far cheaper, and the Cochrane review found no difference in HbA1c or in severe hypoglycaemia against the analogues. Cons: a suspension that must be resuspended before every injection, and a pronounced nocturnal peak.',
        },
        {
          name: 'Insulin glargine (Lantus, Basaglar, Semglee)',
          class: 'Long-acting insulin analogue that precipitates at subcutaneous pH',
          howItCompares:
            'The direct commercial competitor. In a 582-participant 52-week head-to-head, HbA1c fell from 8.6% to 7.2% on detemir and 7.1% on glargine (not significant), with no difference in the relative risk of overall or nocturnal hypoglycaemia. Detemir required a mean 0.78 U/kg per day against 0.44 IU/kg for glargine, and 55% of the detemir group finished on twice-daily dosing.',
          typicalCost: 'No NADAC figure for glargine is held on this record',
          prosAndCons:
            'Pros: once-daily in the trial by protocol, fewer units, biosimilars available. Cons: injection-site reactions were less frequent with glargine (1.4% against 4.5%), but weight gain was greater (3.9 kg against 3.0 kg in completers, p=0.01).',
        },
        {
          name: 'Insulin degludec (Tresiba)',
          class: 'Ultra-long-acting insulin analogue forming soluble multi-hexamers',
          howItCompares:
            'The successor from the same manufacturer, with a longer and flatter profile and a completed cardiovascular outcome trial that detemir never had. Degludec is the reason the commercial case for detemir ended.',
          typicalCost:
            'US$11.39 per millilitre at United States pharmacy acquisition cost (CMS NADAC, median across 6 listed products, effective 20 May 2026)',
          prosAndCons:
            'Pros: a randomised cardiovascular safety result and a lower severe-hypoglycaemia rate. Cons: no head-to-head against detemir with a hard outcome, and a higher acquisition cost per millilitre.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask what happens to your prescription if the product is withdrawn',
          action:
            'If a basal insulin presentation you use is being discontinued, ask for the switch to be planned rather than discovered at the pharmacy counter. Basal insulins are not unit-for-unit equivalent to each other.',
          patientImpact:
            'Drugs@FDA lists three of the five Levemir presentations — FlexPen, PenFill and InnoLet — as discontinued. In the 52-week head-to-head against glargine, the mean daily dose of detemir was 0.78 U/kg against 0.44 IU/kg for glargine, so a like-for-like unit conversion between basal insulins is not a safe assumption.',
          clinicalPrecaution:
            'Changing basal insulin changes the shape of the action curve as well as the number of units. That is a prescriber decision, and this page does not make it.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CCCCCCCCCCCCCC(=O)NCCCC[C@@H](C(=O)O)NC(=O)[C@@H]1CCCN1C(=O)[C@H]([C@@H](C)O)NC(=O)[C@H](CC2=CC=C(C=C2)O)NC(=O)[C@H](CC3=CC=CC=C3)NC(=O)[C@H](CC4=CC=CC=C4)NC(=O)CNC(=O)[C@H](CCCNC(=N)N)NC(=O)[C@H](CCC(=O)O)NC(=O)CNC(=O)[C@@H]5CSSC[C@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H]6CSSC[C@@H](C(=O)N[C@@H](CSSC[C@@H](C(=O)NCC(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N5)C(C)C)CC(C)C)CC7=CC=C(C=C7)O)CC(C)C)C)CCC(=O)O)C(C)C)CC(C)C)CC8=CNC=N8)CO)NC(=O)[C@H](CC(C)C)NC(=O)[C@H](CC9=CNC=N9)NC(=O)[C@H](CCC(=O)N)NC(=O)[C@H](CC(=O)N)NC(=O)[C@H](C(C)C)NC(=O)[C@H](CC1=CC=CC=C1)N)C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N6)[C@@H](C)CC)CO)[C@@H](C)O)NC(=O)[C@H](CCC(=O)N)NC(=O)[C@H](CCC(=O)O)NC(=O)[C@H](C(C)C)NC(=O)[C@H]([C@@H](C)CC)NC(=O)CN)CO)CC(C)C)CC1=CC=C(C=C1)O)CCC(=O)N)CC(C)C)CCC(=O)O)CC(=O)N)CC1=CC=C(C=C1)O)C(=O)N[C@@H](CC(=O)N)C(=O)O',
      chemicalFormula: 'C267H402N64O76S6',
      molecularWeight: '5917 g/mol',
      targetReceptorAffinity:
        'Insulin detemir is LysB29(N-epsilon-tetradecanoyl) des(B30) human insulin: threonine at position B30 is removed and a 14-carbon myristic acid is acylated onto the epsilon-amine of lysine B29. That fatty acid binds reversibly to serum albumin, so more than 98% of circulating drug is protein-bound and only the free fraction reaches the receptor. Its affinity for the insulin receptor itself is lower than that of human insulin, which is why the prescribed unit count runs higher — this is a pharmacokinetic design, not a potency improvement.',
      structureSource: {
        label:
          'PubChem CID 16137271 (insulin detemir) — SMILES, molecular formula and weight, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16137271',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'det-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirmation of the des(B30) precursor construct',
          description:
            'Sequence the expression construct and confirm the precursor terminates at B29 lysine with no threonine at B30. If B30 is present, the subsequent acylation has a second competing amine to react with and the product is a mixture, not a molecule.',
          reagentsAndBuffer:
            'Plasmid sequencing, host-cell identity PCR, intact-mass electrospray mass spectrometry against a des(B30) reference standard, peptide mapping with endoproteinase Glu-C',
        },
        {
          id: 'det-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fed-batch yeast fermentation of the des(B30) single-chain precursor',
          description:
            'Grow the recombinant Saccharomyces cerevisiae in a fed-batch bioreactor secreting the single-chain precursor, then convert it enzymatically to the two-chain des(B30) insulin. The three disulphide bonds form in the secretory pathway, which is what avoids a refolding step.',
          dependsOnStepId: 'det-w1',
          reagentsAndBuffer:
            'Defined mineral salts medium with glucose feed, trypsin for transpeptidation and chain conversion, Tris buffer with calcium chloride, dissolved-oxygen and pH control',
        },
        {
          id: 'det-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Chromatographic isolation of des(B30) human insulin',
          description:
            'Capture and polish the unacylated des(B30) intermediate by reversed-phase and ion-exchange chromatography before the fatty acid is attached. Acylating an impure intermediate makes every impurity a new acylated impurity, so this is the step that determines the final impurity profile.',
          dependsOnStepId: 'det-w2',
          reagentsAndBuffer:
            'C18 reversed-phase resin with acetonitrile and trifluoroacetic acid gradients, anion-exchange resin, ammonium acetate buffer, ultrafiltration for buffer exchange',
        },
        {
          id: 'det-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Selective myristoylation of the lysine B29 epsilon-amine',
          description:
            'Acylate the epsilon-amine of lysine B29 with an activated myristic acid ester under conditions that leave the two alpha-amines at glycine A1 and phenylalanine B1 unreacted. Selectivity here is the whole molecule: acylation at A1 or B1 gives an isomer with different albumin binding and different kinetics, and it has to be separated out afterwards.',
          dependsOnStepId: 'det-w3',
          reagentsAndBuffer:
            'Myristic acid N-hydroxysuccinimide ester in a polar aprotic co-solvent, aqueous buffer near pH 10 to differentiate amine reactivity, then acidification and reversed-phase separation of positional isomers',
        },
        {
          id: 'det-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Albumin binding and free-fraction measurement',
          description:
            'Measure the bound and free fractions in human serum albumin at physiological concentration by equilibrium dialysis and by surface plasmon resonance. More than 98% bound is the design specification; the free fraction is the only part of the dose that can reach a receptor, and it is what sets the flat profile the product is sold on.',
          dependsOnStepId: 'det-w4',
          reagentsAndBuffer:
            'Fatty-acid-free human serum albumin at 600 micromolar, equilibrium dialysis cassettes with a 10 kDa membrane, phosphate-buffered saline at pH 7.4, immobilised albumin sensor chips, immunoassay for total and free insulin detemir',
        },
        {
          id: 'det-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Receptor affinity, IGF-1 receptor cross-binding and mitogenic-to-metabolic ratio',
          description:
            'Determine insulin receptor and IGF-1 receptor affinities and read metabolic potency against mitogenic potency in parallel. Reporting the ratio rather than either number alone is the specific check the analogue class exists under, and detemir is the analogue whose receptor affinity is deliberately below that of human insulin.',
          dependsOnStepId: 'det-w5',
          reagentsAndBuffer:
            'Solubilised human insulin receptor and IGF-1 receptor preparations, iodine-125 labelled human insulin and IGF-1, scintillation proximity beads, primary human osteosarcoma cells for thymidine incorporation, rat adipocytes for lipogenesis',
        },
      ],
    },
    keyAudits: [
      {
        id: 'det-a1',
        category: 'measured',
        title: '47% less hypoglycaemia and half the weight gain of NPH, at the same HbA1c',
        laymanSummary:
          'In a 476-person trial adding background insulin to tablets, detemir and the older NPH insulin reached the same average blood sugar. Detemir got there with 47% fewer low-sugar episodes and 1.6 kg less weight gain.',
        technicalDetails:
          'Hermansen and colleagues randomised 476 people with type 2 diabetes and HbA1c of 7.5 to 10.0% to twice-daily insulin detemir or NPH insulin added to oral therapy, titrated over 24 weeks to a pre-breakfast and pre-dinner plasma glucose target of 6.0 mmol/L or less. HbA1c fell by 1.8 points on detemir (8.6% to 6.8%) and 1.9 points on NPH (8.5% to 6.6%), not significantly different; 70% of each group reached 7.0% or less. The risk of all hypoglycaemia was 47% lower on detemir (p<0.001) and nocturnal hypoglycaemia 55% lower (p<0.001). Mean weight gain was 1.2 kg on detemir against 2.8 kg on NPH (p<0.001), with a baseline-adjusted final weight difference of -1.58 kg (p<0.001). The proportion reaching target without hypoglycaemia was 34% against 25%, which did not reach significance (p=0.052).',
        evidenceSource: 'Hermansen K et al., Diabetes Care 2006;29:1269-1274',
        doi: '10.2337/dc05-1365',
        measuredMetric:
          'Relative risk of all and nocturnal hypoglycaemia, and mean weight gain, at 24 weeks against NPH insulin',
        auditFlag: 'verified',
      },
      {
        id: 'det-a2',
        category: 'inferred',
        title: 'The weight advantage belongs to the people who took less insulin',
        laymanSummary:
          'Detemir is sold on causing less weight gain than other insulins. In the head-to-head against glargine, that advantage came mainly from the 45% of participants who managed on one injection a day, and the other 55% needed twice as many units.',
        technicalDetails:
          'Rosenstock and colleagues randomised 582 insulin-naive adults with type 2 diabetes to detemir or glargine added to oral therapy for 52 weeks. HbA1c fell from 8.6% to 7.2% and 7.1% respectively (not significant), with no difference in the relative risk of overall or nocturnal hypoglycaemia and no difference in within-participant variability of fasting or pre-dinner glucose. Weight gain was 3.0 kg on detemir against 3.9 kg on glargine in completers (p=0.01) and 2.7 kg against 3.5 kg in the intention-to-treat population (p=0.03) — and the authors state the difference was "primarily related to completers on once-daily detemir". Mean daily detemir dose was 0.78 U/kg (0.52 with once-daily dosing, 1.00 U/kg with twice-daily) against 0.44 IU/kg for glargine, and 55% of the detemir group finished on twice-daily injections. Injection-site reactions were more frequent with detemir, 4.5% against 1.4%. No mechanism for a weight-sparing effect independent of dose was demonstrated in this trial.',
        evidenceSource: 'Rosenstock J et al., Diabetologia 2008;51:408-416',
        doi: '10.1007/s00125-007-0911-x',
        inferredClaim:
          'That insulin detemir has a weight-sparing pharmacological property — an effect concentrated in the subgroup taking the fewest units, in a trial where the comparator arm was barred by its own label from a second daily dose',
        auditFlag: 'caution',
      },
      {
        id: 'det-a3',
        category: 'failed',
        title: 'Basal insulin alone did not hold: four in five needed a second insulin within 3 years',
        laymanSummary:
          'In the 4-T trial, the arm started on detemir alone had the fewest hypoglycaemic episodes and the least weight gain. It also had the highest proportion of people who ended up needing a second type of insulin as well.',
        technicalDetails:
          'The Treating to Target in Type 2 Diabetes trial randomised 708 patients with suboptimal HbA1c on metformin and sulfonylurea to biphasic insulin aspart twice daily, prandial insulin aspart three times daily, or basal insulin detemir once or twice daily, and followed them for three years. Median HbA1c was 7.1%, 6.8% and 6.9% across the three arms (p=0.28). The basal detemir arm had the lowest median hypoglycaemia rate, 1.7 episodes per patient per year against 3.0 and 5.7, and the lowest weight gain. It also had the highest proportion adding a second type of insulin: 81.6%, against 67.7% in the biphasic arm and 73.6% in the prandial arm (p=0.002). Detemir monotherapy on top of oral agents was, for most participants, a starting point rather than a regimen.',
        evidenceSource: 'Holman RR et al., N Engl J Med 2009;361:1736-1747 (ISRCTN51125379)',
        doi: '10.1056/NEJMoa0905479',
        measuredMetric:
          'Proportion of each arm requiring the addition of a second type of insulin over three years',
        auditFlag: 'verified',
      },
      {
        id: 'det-a4',
        category: 'inferred',
        title: 'The Cochrane review found the basal analogue class buys only a minor clinical benefit',
        laymanSummary:
          'Pooling every trial of long-acting analogues against NPH insulin in type 2 diabetes found no meaningful difference in average blood sugar, no difference in severe hypoglycaemia, and no evidence at all on death, complications or quality of life.',
        technicalDetails:
          'Horvath and colleagues pooled six trials comparing insulin glargine with NPH (1,715 patients) and two comparing insulin detemir with NPH (578 patients), of 24 to 52 weeks. HbA1c and adverse effects showed no clinically relevant differences. Rates of symptomatic, overall and nocturnal hypoglycaemia were statistically significantly lower with the analogues; rates of severe hypoglycaemia were statistically similar. The reviewers found no evidence of benefit for mortality, morbidity, quality of life or costs, concluded the analogues offer "only a minor clinical benefit" in basal insulin therapy, and recommended caution until long-term data on patient-relevant outcomes became available. Those data have not arrived for insulin detemir.',
        evidenceSource:
          'Horvath K et al., Cochrane Database Syst Rev 2007;(2):CD005613 (PMID 17443605)',
        doi: '10.1002/14651858.CD005613.pub3',
        inferredClaim:
          'That the fall in nocturnal and symptomatic hypoglycaemia translates into fewer deaths, fewer complications or better quality of life — the reviewers found no evidence bearing on any of the three',
        auditFlag: 'caution',
      },
      {
        id: 'det-a5',
        category: 'measured',
        title: 'The one basal insulin with a randomised trial in pregnancy',
        laymanSummary:
          'A 310-woman randomised trial in pregnancy with type 1 diabetes compared detemir with NPH insulin. Average blood sugar at 36 weeks was equivalent, and fasting glucose was significantly lower on detemir.',
        technicalDetails:
          'Mathiesen and colleagues randomised 310 pregnant women with type 1 diabetes to insulin detemir (n=152) or NPH insulin (n=158), both with prandial insulin aspart, in a non-inferiority trial with a 0.4 percentage-point margin. Estimated HbA1c at 36 gestational weeks was 6.27% on detemir and 6.33% on NPH, a difference of -0.06 percentage points (95% CI -0.21 to 0.08) in the full analysis set. Fasting plasma glucose was significantly lower on detemir at 24 gestational weeks (96.8 against 113.8 mg/dL, p=0.012) and at 36 weeks (85.7 against 97.4 mg/dL, p=0.017). Hypoglycaemia rates were comparable between arms. This is a maternal-outcome trial: it establishes glycaemic non-inferiority and lower fasting glucose, not a reduction in any neonatal or obstetric outcome.',
        evidenceSource:
          'Mathiesen ER et al., Diabetes Care 2012;35:2012-2017 (Detemir in Pregnancy Study Group)',
        doi: '10.2337/dc11-2264',
        measuredMetric:
          'Estimated HbA1c difference at 36 gestational weeks and fasting plasma glucose at 24 and 36 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'det-a6',
        category: 'conclusion_shift',
        title: 'Withdrawn from the market it was approved for, presentation by presentation',
        laymanSummary:
          'Nothing was found wrong with this insulin. Its manufacturer brought out a longer-acting successor, and the older product has been taken off the American market one delivery device at a time.',
        technicalDetails:
          'Levemir was approved under BLA 021536 on 16 June 2005. Drugs@FDA now lists the Levemir FlexPen, Levemir PenFill and Levemir InnoLet presentations with a marketing status of Discontinued, while the vial and Levemir FlexTouch remain listed as prescription products. No safety finding, label restriction or withdrawal action underlies that change: the same manufacturer licensed insulin degludec in 2015 with a longer duration and, subsequently, a completed cardiovascular outcome trial. No biosimilar insulin detemir has been licensed in the United States, so the evidence base described on this page — including the only randomised basal-insulin trial conducted in pregnancy — is attached to a product a reader may no longer be able to obtain.',
        evidenceSource:
          'openFDA Drugs@FDA record for BLA 021536 (LEVEMIR, Novo Nordisk Inc.), product marketing statuses retrieved August 2026',
        inferredClaim:
          'That a drug remaining on a label means it remains available — market presence is a commercial fact and is decided separately from the evidence',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected as a clear solution, not a suspension',
        laymanDesc:
          'Unlike the older background insulin, this one is a clear liquid that does not need to be rolled or shaken before use. Nothing has to settle out and be stirred back in.',
        molecularDetail:
          'Insulin detemir is soluble at neutral pH and is formulated as a clear solution with zinc and phenol, in contrast to NPH, which is a protamine-crystallised suspension whose delivered dose depends on how well it was resuspended before drawing up.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A fatty tail makes it stick to the blood protein albumin',
        laymanDesc:
          'A 14-carbon fatty acid is attached to the insulin molecule. Fatty acids stick to albumin, the carrier protein that fills the bloodstream, and so does this one.',
        molecularDetail:
          'The myristoyl group on the epsilon-amine of lysine B29 occupies a fatty-acid binding site on serum albumin. More than 98% of circulating drug is albumin-bound at any moment. The bond is reversible, so bound and free are in continuous equilibrium.',
        iconName: 'Link',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Only the small free fraction can reach a receptor',
        laymanDesc:
          'Insulin held on albumin cannot leave the bloodstream or dock onto a cell. As the free molecules are used up, more come off the albumin to replace them, which is what makes the effect steady.',
        molecularDetail:
          'Albumin binding buffers the plasma concentration and delays distribution into peripheral tissue, flattening the concentration-time profile relative to NPH. The same buffering is also present in the subcutaneous depot, where the acylated molecule self-associates into di-hexamers before absorption.',
        iconName: 'Filter',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'At the receptor it does exactly what human insulin does',
        laymanDesc:
          'Once a free molecule reaches a cell it works through the same switch as any other insulin, moving glucose transporters to the surface and telling the liver to stop making sugar.',
        molecularDetail:
          'Receptor autophosphorylation, IRS phosphorylation, PI3K-AKT signalling and GLUT4 translocation are unchanged. Detemir binds the insulin receptor with lower affinity than human insulin, which is why the unit count is not interchangeable with other basal insulins: the trial mean was 0.78 U/kg against 0.44 IU/kg for glargine.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fasting glucose flattens, with fewer overnight lows',
        laymanDesc:
          'Without the middle-of-the-night hump the older insulin produces, overnight low-sugar episodes fall — by 55% against NPH in the registration trial — and weight gain is about half as much.',
        molecularDetail:
          'In the 476-participant treat-to-target trial, all hypoglycaemia fell 47% and nocturnal hypoglycaemia 55% against NPH at equal HbA1c, with weight gain of 1.2 kg against 2.8 kg. The pooled Cochrane analysis of the basal analogue class confirms lower symptomatic, overall and nocturnal hypoglycaemia and no difference in severe hypoglycaemia.',
        iconName: 'Moon',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Hermansen 2006 treat-to-target trial, detemir versus NPH added to oral therapy',
        phase: 'Randomised parallel-group multicentre trial, 26 weeks',
        sampleSize: 476,
        primaryEndpoint: 'HbA1c at 24 weeks, with hypoglycaemia risk and body weight as outcomes',
        endpointMet: true,
        statisticalPValue:
          'HbA1c difference not significant; P < 0.001 for a 47% lower risk of all hypoglycaemia and for weight gain of 1.2 kg against 2.8 kg',
        unreportedAdverseSignals:
          'The proportion reaching HbA1c 7.0% or less without hypoglycaemia was 34% against 25% and did not reach significance (p=0.052) — a trend the drug is often described as having demonstrated.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Rosenstock 2008 head-to-head against insulin glargine',
        phase: 'Randomised open-label non-inferiority trial, 52 weeks',
        sampleSize: 582,
        primaryEndpoint: 'HbA1c at 52 weeks, non-inferiority against insulin glargine',
        endpointMet: true,
        statisticalPValue:
          'HbA1c 7.2% against 7.1%, not significant; P = 0.01 for weight gain of 3.0 kg against 3.9 kg in completers',
        unreportedAdverseSignals:
          'Non-inferiority was achieved using a mean 0.78 U/kg per day against 0.44 IU/kg of glargine, with 55% of the detemir arm on twice-daily injections; the comparator was barred by its label from a second daily dose. Injection-site reactions were 4.5% against 1.4%.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Detemir in Pregnancy Study (Mathiesen 2012)',
        phase: 'Randomised controlled non-inferiority trial in pregnancy',
        sampleSize: 310,
        primaryEndpoint:
          'HbA1c at 36 gestational weeks, non-inferiority against NPH insulin with a 0.4 percentage-point margin',
        endpointMet: true,
        statisticalPValue:
          'Difference -0.06 percentage points (95% CI -0.21 to 0.08); P = 0.012 and P = 0.017 for lower fasting plasma glucose at 24 and 36 weeks',
        unreportedAdverseSignals:
          'The trial reports maternal glycaemic outcomes. It was not powered for neonatal or obstetric endpoints, and none is claimed.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: '4-T, basal insulin detemir arm (ISRCTN51125379)',
        phase: 'Open-label randomised three-arm trial, 3 years',
        sampleSize: 708,
        primaryEndpoint:
          'HbA1c, proportion at 6.5% or less, hypoglycaemia rate and weight gain across three insulin regimens',
        endpointMet: false,
        statisticalPValue:
          'P = 0.28 across arms for HbA1c; P = 0.002 for the difference in the proportion requiring a second type of insulin',
        unreportedAdverseSignals:
          'The basal arm had the best hypoglycaemia and weight results and the highest rate of needing a second insulin added — 81.6% by three years.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Cochrane pooling of long-acting analogues versus NPH in type 2 diabetes',
        phase: 'Systematic review of eight randomised trials, 24 to 52 weeks',
        sampleSize: 2293,
        primaryEndpoint:
          'HbA1c, hypoglycaemia, mortality, morbidity, quality of life and costs against NPH insulin',
        endpointMet: false,
        statisticalPValue:
          'No clinically relevant HbA1c difference; symptomatic, overall and nocturnal hypoglycaemia statistically significantly lower; severe hypoglycaemia statistically similar',
        unreportedAdverseSignals:
          'No included trial supplied evidence on mortality, morbidity, quality of life or costs. The reviewers described the class benefit as minor.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 47% lower risk of all hypoglycaemia and a 55% lower risk of nocturnal hypoglycaemia against NPH insulin at equal HbA1c, in 476 randomised adults',
        'Mean weight gain of 1.2 kg against 2.8 kg on NPH over 24 weeks (p<0.001)',
        'Non-inferiority to insulin glargine on HbA1c over 52 weeks in 582 adults, at a mean dose of 0.78 U/kg against 0.44 IU/kg',
        'Non-inferiority to NPH insulin on HbA1c at 36 gestational weeks in 310 pregnant women, with significantly lower fasting plasma glucose',
      ],
      unsupportedInferences: [
        'That insulin detemir has a weight-sparing property independent of dose — the advantage over glargine was concentrated in the once-daily completers, who were taking half the units of the twice-daily group',
        'That lower symptomatic and nocturnal hypoglycaemia translates into fewer deaths, fewer complications or better quality of life — the Cochrane reviewers found no evidence bearing on any of those',
        'That basal insulins convert unit-for-unit between products; the head-to-head trial mean doses differed by nearly a factor of two',
      ],
      whatFailedInitially: [
        'The proportion reaching HbA1c 7.0% or less without hypoglycaemia missed significance in the registration trial, 34% against 25%, p=0.052',
        'In 4-T, 81.6% of the basal detemir arm needed a second type of insulin added within three years, the highest of the three regimens',
        'More than half of participants in the head-to-head against glargine finished on twice-daily injections, undoing the once-daily convenience the class was sold on',
      ],
      realWorldOutcome: [
        'Approved 16 June 2005 under BLA 021536; no biosimilar insulin detemir has ever been licensed in the United States',
        'US$10.36 per millilitre at United States pharmacy acquisition cost for the single listed branded product (CMS NADAC, effective 22 January 2025)',
        'Drugs@FDA lists the FlexPen, PenFill and InnoLet presentations as discontinued, following the licensing of insulin degludec by the same manufacturer',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection by vial and syringe or prefilled pen; once or twice daily',
      description:
        'A clear neutral-pH solution, so it does not require resuspension before use — a practical difference from NPH insulin that is separate from any pharmacological one. In the 52-week head-to-head against glargine, 55% of participants finished on twice-daily rather than once-daily dosing.',
      safetyProfile:
        'Hypoglycaemia is the commonest and most serious adverse effect of any insulin. Injection-site reactions were more frequent than with insulin glargine, 4.5% against 1.4%, in the head-to-head trial. Hypokalaemia, lipodystrophy and weight gain occur, though weight gain was consistently less than with NPH. Not recommended for diabetic ketoacidosis. Unit counts are not interchangeable with other basal insulins.',
    },
    commonQuestions: [
      {
        q: 'Why does detemir cause less weight gain than other insulins?',
        a: 'That is the honest question, and the trials do not settle it. Against NPH insulin the difference is clear and randomised: 1.2 kg against 2.8 kg over 24 weeks in 476 people. Against insulin glargine the difference is smaller — 3.0 kg against 3.9 kg in completers — and the trial authors state it was primarily driven by the participants who stayed on one injection a day, who were taking about half the units of the twice-daily group. Mechanisms have been proposed, including preferential action on the liver because albumin-bound drug distributes less into peripheral tissue, but no trial on this page demonstrates one. What is measured is the weight. What is inferred is why.',
        auditNote:
          'A subgroup effect that tracks dose is the pattern you would expect if the explanation were simply less insulin, not different insulin.',
      },
      {
        q: 'Is it better than NPH insulin?',
        a: 'On hypoglycaemia, measurably: 47% less overall and 55% less at night in the registration trial, at the same HbA1c. On average blood sugar, no — the two were indistinguishable, and the Cochrane pooling of the whole basal analogue class found no clinically relevant HbA1c difference and no difference in severe hypoglycaemia. On anything a patient ultimately cares about — living longer, keeping their sight, keeping their kidneys — there is no evidence either way, because no trial of insulin detemir measured those. The Cochrane reviewers described the class benefit as minor and recommended caution until long-term outcome data arrived. For detemir, they never did.',
      },
      {
        q: 'Can I still get it?',
        a: 'Not in every form. Drugs@FDA lists the Levemir FlexPen, PenFill and InnoLet presentations as discontinued, while the vial and FlexTouch remain listed as prescription products. Nothing was found wrong with the drug: the same manufacturer licensed insulin degludec in 2015 with a longer, flatter profile and, later, a completed cardiovascular outcome trial, and no biosimilar insulin detemir has ever been licensed in the United States. If a switch is needed, the doses do not convert unit-for-unit — in the head-to-head trial the mean detemir dose was 0.78 U/kg against 0.44 IU/kg of glargine.',
        auditNote:
          'This is the clearest example on this site of a drug leaving a market for reasons that have nothing to do with its evidence.',
      },
      {
        q: 'Is it safe in pregnancy?',
        a: 'It has the randomised trial that most basal insulins do not. Mathiesen and colleagues randomised 310 pregnant women with type 1 diabetes to detemir or NPH, both with mealtime insulin aspart. HbA1c at 36 gestational weeks was 6.27% against 6.33%, a difference of -0.06 percentage points, meeting non-inferiority, and fasting glucose was significantly lower on detemir at both 24 and 36 weeks. Hypoglycaemia was comparable. What that trial establishes is maternal glucose control. It was not powered for neonatal or obstetric outcomes and does not report a reduction in any of them, and the choice belongs to the obstetric team.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no verifiable per-dose cost-of-production figure for recombinant acylated insulin analogues could be found and cited. What is shown is what United States pharmacies pay: US$10.36 per millilitre for the one listed branded product in the CMS National Average Drug Acquisition Cost survey. That is a price. The molecule takes a yeast fermentation, an enzymatic chain conversion, a selective acylation at one of three amines and a positional-isomer separation, which is consistent with a cost well above that of a tablet — but consistency is not a measurement, and this page will not invent one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Hermansen K, Davies M, Derezinski T et al. A 26-week, randomized, parallel, treat-to-target trial comparing insulin detemir with NPH insulin as add-on therapy to oral glucose-lowering drugs in insulin-naive people with type 2 diabetes. Diabetes Care 2006;29:1269-1274',
        identifier: '10.2337/dc05-1365',
        kind: 'doi',
      },
      {
        label:
          'Rosenstock J, Davies M, Home PD et al. A randomised, 52-week, treat-to-target trial comparing insulin detemir with insulin glargine when administered as add-on to glucose-lowering drugs in insulin-naive people with type 2 diabetes. Diabetologia 2008;51:408-416',
        identifier: '10.1007/s00125-007-0911-x',
        kind: 'doi',
      },
      {
        label:
          'Mathiesen ER, Hod M, Ivanisevic M et al. Maternal efficacy and safety outcomes in a randomized, controlled trial comparing insulin detemir with NPH insulin in 310 pregnant women with type 1 diabetes. Diabetes Care 2012;35:2012-2017',
        identifier: '10.2337/dc11-2264',
        kind: 'doi',
      },
      {
        label:
          'Horvath K, Jeitler K, Berghold A et al. Long-acting insulin analogues versus NPH insulin (human isophane insulin) for type 2 diabetes mellitus. Cochrane Database Syst Rev 2007;(2):CD005613',
        identifier: '10.1002/14651858.CD005613.pub3',
        kind: 'doi',
      },
      {
        label:
          'Holman RR, Farmer AJ, Davies MJ et al. Three-year efficacy of complex insulin regimens in type 2 diabetes (4-T). N Engl J Med 2009;361:1736-1747',
        identifier: '10.1056/NEJMoa0905479',
        kind: 'doi',
      },
      {
        label:
          'openFDA Drugs@FDA — BLA 021536 (LEVEMIR, Novo Nordisk Inc., original approval 16 June 2005) with per-presentation marketing statuses',
        identifier: 'https://api.fda.gov/drug/drugsfda.json?search=openfda.brand_name:%22LEVEMIR%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 16137271 — insulin detemir structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16137271',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Insulin degludec — the FDA refused it in 2013 over a cardiovascular signal, demanded an
  //    outcome trial, and the trial cleared it. It still has no HbA1c advantage over glargine.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'insulin-degludec',
    name: 'Insulin Degludec',
    tradeName: 'Tresiba',
    sponsor: 'Novo Nordisk Inc.',
    targetGene: 'INSR',
    targetProtein:
      'Insulin receptor, a disulphide-linked alpha-2-beta-2 receptor tyrosine kinase on skeletal muscle, adipocyte and hepatocyte membranes',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 2015,
    indication:
      'To improve glycaemic control in patients one year of age and older with diabetes mellitus. Not recommended for the treatment of diabetic ketoacidosis.',
    patientFriendlyIndication: 'Diabetes — the once-daily background insulin that lasts over 42 hours',
    anatomicalSite:
      'Subcutaneous depot, then circulating albumin, then insulin receptors on skeletal muscle, fat and liver cells',
    conditionContext: {
      conditionExplainer:
        'Between meals and overnight the liver keeps releasing glucose, and something has to hold that release in check. In healthy people a small trickle of insulin does it continuously. Basal insulin is the injected replacement for that trickle.',
      whyItMatters:
        'A background insulin that peaks is dangerous, because the peak arrives while the person is asleep and not eating. Every basal insulin since NPH has been an attempt to flatten that curve, and the endpoint that matters is not average blood sugar but how often someone wakes up at three in the morning sweating, or does not wake up at all.',
      whoTakesThis:
        'People with type 1 diabetes, as the background half of a basal-bolus regimen, and people with type 2 diabetes whose tablets no longer hold the fasting glucose down. Licensed in the United States down to one year of age.',
      clinicalGoals:
        'Hold fasting glucose steady with as little night-time hypoglycaemia as possible. The trials measured HbA1c, counted hypoglycaemic episodes, and — after the FDA insisted — counted heart attacks and strokes.',
    },
    oneSentenceVerdict:
      'Human insulin with the last amino acid of the B chain removed and a 16-carbon diacid chain bolted on, so that the molecule self-assembles into long multi-hexamer chains under the skin and dissolves out of them over more than 42 hours — a design that reduced overall symptomatic hypoglycaemia by 30% against insulin glargine in 721 randomised adults with type 2 diabetes, produced no HbA1c advantage at all, and was refused approval for two and a half years while the FDA required a 7,637-patient cardiovascular outcome trial that ultimately returned a hazard ratio of 0.91.',
    laymanHowItWorks:
      'Insulin normally has to be released slowly and steadily to keep the liver from dumping sugar into the blood overnight. Degludec achieves that with a chemical trick rather than a pump: a fatty acid chain attached to the molecule makes injected units link up into long strings the moment the preservative in the vial diffuses away. The string is a storage depot the body cannot absorb. Zinc leaks out of it slowly, and single insulin molecules peel off one end at a time, which is why one injection keeps working for the best part of two days.',
    auditConfidence: 'High Confidence',
    confidenceScore: 82,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$11.39 per millilitre at United States pharmacy acquisition cost, the median across 6 listed products in the CMS NADAC survey effective 20 May 2026',
      markupEstimate: '',
      openPatentNotes:
        'Approved as Tresiba under NDA 203314 on 25 September 2015, after the FDA issued a complete response letter on 8 February 2013. The application was deemed a biologics licence application on 23 March 2020 under the transition provision of the Biologics Price Competition and Innovation Act, which is what made a biosimilar route possible at all. No interchangeable biosimilar insulin degludec is recorded on this dossier.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The comparison that matters is against insulin glargine, and it has been run four times. Degludec never beat glargine on HbA1c and was never designed to: in BEGIN Basal-Bolus Type 2 the treatment difference was 0.08 percentage points with a confidence interval straddling zero. What it did was cut hypoglycaemia — by 11% overall in type 1 diabetes, by 30% in type 2, and by 40% for adjudicated severe episodes in the cardiovascular outcome trial. Against the newer concentrated glargine U300 that advantage disappeared: the CONCLUDE trial missed its primary endpoint. Nothing eaten or bought over a counter substitutes for basal insulin, and this page does not pretend otherwise.',
      conventionalRx: [
        {
          name: 'Insulin glargine U100 (Lantus, Basaglar, Semglee, Rezvoglar)',
          class: 'Long-acting insulin analogue, isoelectric-point precipitation',
          howItCompares:
            'The comparator in every head-to-head trial of degludec. In SWITCH 2, a double-blind crossover trial in 721 adults with type 2 diabetes, degludec produced 185.6 overall symptomatic hypoglycaemic episodes per 100 patient-years against 265.4 on glargine U100, a rate ratio of 0.70 (95% CI 0.61 to 0.80, p<0.001). Severe hypoglycaemia in the same trial was 1.6% versus 2.4%, which was not statistically significant (McNemar p=0.35).',
          typicalCost:
            'Interchangeable biosimilars Semglee and Rezvoglar are licensed in the United States; no NADAC figure for glargine is held on this record',
          prosAndCons:
            'Pros: much longer marketed, interchangeable biosimilars available, decades of outcome data through ORIGIN. Cons: a genuine peak at roughly 12 hours and higher measured rates of nocturnal hypoglycaemia in every head-to-head trial against degludec.',
        },
        {
          name: 'Insulin glargine U300 (Toujeo)',
          class: 'Concentrated long-acting insulin analogue',
          howItCompares:
            'The one comparator degludec failed to beat. CONCLUDE randomised 1,609 insulin-treated adults with type 2 diabetes and at least one hypoglycaemia risk factor to degludec U200 or glargine U300. The primary endpoint — overall symptomatic hypoglycaemia in the 36-week maintenance period — gave a rate ratio of 0.88 (95% CI 0.73 to 1.06), which is not significant, and the confirmatory testing procedure was stopped at that point.',
          typicalCost: 'No NADAC figure for glargine U300 is held on this record',
          prosAndCons:
            'Pros: the same flattening achieved by concentrating the depot rather than by acylation, at a comparable measured hypoglycaemia rate. Cons: has no dedicated cardiovascular outcome trial of its own of the size of DEVOTE.',
        },
        {
          name: 'NPH insulin (isophane, Humulin N, Novolin N)',
          class: 'Protamine-crystallised human insulin, unmodified sequence',
          howItCompares:
            'The insulin every analogue replaced. It is the cheapest basal insulin in the world and has a pronounced peak four to eight hours after injection, which is when nocturnal hypoglycaemia happens. No trial has compared degludec against NPH head to head; the Cochrane review of long-acting analogues versus NPH covered glargine and detemir only, and found the analogue benefit confined to nocturnal hypoglycaemia with no effect on late complications or mortality.',
          typicalCost:
            'Sold over the counter in some United States states at a small fraction of the analogue price; no NADAC figure is held on this record',
          prosAndCons:
            'Pros: far cheaper, human sequence, available without prescription in parts of the United States. Cons: peaks, requires resuspension before every injection, and produces the night-time lows the whole analogue class was built to avoid.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Teach one person at home what a night-time hypo looks like',
          action:
            'Severe hypoglycaemia is by definition an episode the person cannot treat themselves, so it is detected by somebody else or not at all. Sweating, confusion, unusual difficulty waking and seizure activity in sleep are what a household is being asked to recognise.',
          patientImpact:
            'In SWITCH 1, 10.3% of adults with type 1 diabetes on degludec and 17.1% on glargine U100 had a severe hypoglycaemic episode during the 16-week maintenance period. In DEVOTE, adjudicated severe hypoglycaemia occurred in 4.9% on degludec and 6.6% on glargine over a median 1.99 years. These are not rare events in either arm.',
          clinicalPrecaution:
            'This is recognition, not treatment. What to do about an episode, and any change to an insulin regimen after one, is a conversation with the prescribing clinician. This page gives no dosing guidance of any kind.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC[C@H](C)[C@H]1C(=O)N[C@H]2CSSC[C@@H](C(=O)N[C@@H](CSSC[C@@H](C(=O)NCC(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@@H](CSSC[C@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC2=O)CO)CC(C)C)CC3=CC=C(C=C3)O)CCC(=O)N)CC(C)C)CCC(=O)O)CC(=O)N)CC4=CC=C(C=C4)O)C(=O)N[C@@H](CC(=O)N)C(=O)O)C(=O)NCC(=O)N[C@@H](CCC(=O)O)C(=O)N[C@@H](CCCNC(=N)N)C(=O)NCC(=O)N[C@@H](CC5=CC=CC=C5)C(=O)N[C@@H](CC6=CC=CC=C6)C(=O)N[C@@H](CC7=CC=C(C=C7)O)C(=O)N[C@@H]([C@@H](C)O)C(=O)N8CCC[C@H]8C(=O)N[C@@H](CCCCNC(=O)CC[C@@H](C(=O)O)NC(=O)CCCCCCCCCCCCCCC(=O)O)C(=O)O)C(C)C)CC(C)C)CC9=CC=C(C=C9)O)CC(C)C)C)CCC(=O)O)C(C)C)CC(C)C)CC2=CNC=N2)CO)NC(=O)[C@H](CC(C)C)NC(=O)[C@H](CC2=CNC=N2)NC(=O)[C@H](CCC(=O)N)NC(=O)[C@H](CC(=O)N)NC(=O)[C@H](C(C)C)NC(=O)[C@H](CC2=CC=CC=C2)N)C(=O)N[C@H](C(=O)N[C@H](C(=O)N1)CO)[C@@H](C)O)NC(=O)[C@H](CCC(=O)N)NC(=O)[C@H](CCC(=O)O)NC(=O)[C@H](C(C)C)NC(=O)[C@H]([C@@H](C)CC)NC(=O)CN',
      chemicalFormula: 'C274H411N65O81S6',
      molecularWeight: '6104 g/mol',
      targetReceptorAffinity:
        'Binds serum albumin with an affinity corresponding to more than 99% plasma protein binding, and acts at the ordinary insulin receptor once released from it. The chemical name on the FDA label is LysB29(N-epsilon-hexadecandioyl-gamma-Glu) des(B30) human insulin: threonine at position B30 is deleted and a chain of glutamic acid plus a 16-carbon diacid is attached to the lysine at B29. The protraction is not receptor chemistry. The label attributes it predominantly to delayed absorption from the subcutaneous depot and only secondarily to albumin binding.',
      structureSource: {
        label:
          'PubChem CID 118984462 (insulin degludec) — SMILES, molecular formula and weight, re-checked against the PUG REST property endpoint and matched to the FDA label description section',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/118984462',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'deg-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Verification of the desB30 expression construct and the yeast master cell bank',
          description:
            'Sequence the plasmid encoding the single-chain precursor and confirm that the B chain terminates at position 29, then release the Saccharomyces cerevisiae master cell bank for identity, purity and plasmid retention. The deletion of threonine B30 is what leaves the B29 lysine as the only acylation site, so an error here produces a molecule that acylates in the wrong place and is not degludec.',
          reagentsAndBuffer:
            'Plasmid preparation kit, Sanger and next-generation sequencing of the insert, YPD and selective minimal media, host-cell identity PCR, mycoplasma and bacteriophage screening panels',
        },
        {
          id: 'deg-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fed-batch yeast fermentation and secretion of the single-chain precursor',
          description:
            'Grow the recombinant yeast in a fed-batch bioreactor so it secretes a single-chain precursor in which the B and A chains are joined by a connecting peptide. Secretion into the medium means the three disulphide bonds form in the secretory pathway and nothing has to be refolded from inclusion bodies.',
          dependsOnStepId: 'deg-w1',
          reagentsAndBuffer:
            'Defined mineral salts medium with glucose feed, ammonium hydroxide for pH control, antifoam, dissolved-oxygen and pH probes, stainless-steel fed-batch bioreactor',
        },
        {
          id: 'deg-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Enzymatic conversion to des(B30) human insulin and chromatographic capture',
          description:
            'Cleave the connecting peptide to release the two-chain des(B30) intermediate and purify it by successive reversed-phase and ion-exchange chromatography. This intermediate must be clean before acylation, because an unacylated des(B30) impurity carried through has ordinary short-acting kinetics and would shorten the profile of the finished product.',
          dependsOnStepId: 'deg-w2',
          reagentsAndBuffer:
            'Trypsin and carboxypeptidase B, Tris buffer with calcium chloride, C18 reversed-phase resin with acetonitrile gradients, anion-exchange resin',
        },
        {
          id: 'deg-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Site-selective acylation of the B29 lysine with gamma-glutamyl hexadecanedioate',
          description:
            'Attach a glutamic acid spacer carrying a 16-carbon dicarboxylic acid to the epsilon-amino group of lysine B29 in a controlled-pH reaction, then remove the protecting groups and re-purify. Selectivity is the whole difficulty: the A1 glycine and B1 phenylalanine amino groups are also nucleophilic, and acylation at either produces a positional isomer that has to be resolved chromatographically rather than tolerated.',
          dependsOnStepId: 'deg-w3',
          reagentsAndBuffer:
            'Activated N-hydroxysuccinimide ester of the gamma-glutamyl hexadecanedioyl side chain, protecting groups on the alpha-amino termini, aprotic solvent with controlled water content, buffered deprotection, preparative reversed-phase chromatography for isomer resolution',
        },
        {
          id: 'deg-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Multi-hexamer chain assembly on phenol depletion in a subcutaneous-mimetic buffer',
          description:
            'Dilute the zinc-, phenol- and metacresol-stabilised formulation into a buffer that mimics interstitial fluid and follow the assembly of dihexamers into long multi-hexamer chains as the phenolic preservative diffuses out, then the slow release of monomers as zinc leaves. This is the step that produces the 42-hour duration, and it is invisible to any receptor assay: the entire pharmacological difference between degludec and human insulin exists in this depot, not at the target.',
          dependsOnStepId: 'deg-w4',
          reagentsAndBuffer:
            'Formulated drug product at 100 or 200 units per millilitre with zinc, phenol and metacresol, isotonic phosphate buffer at pH 7.4, size-exclusion chromatography with online multi-angle light scattering, small-angle X-ray scattering, analytical ultracentrifugation',
        },
        {
          id: 'deg-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Insulin receptor binding, IGF-1 receptor cross-reactivity and albumin affinity',
          description:
            'Measure competition against radiolabelled human insulin at the insulin receptor, measure cross-binding at the IGF-1 receptor separately, and measure albumin affinity, which the FDA label states corresponds to greater than 99% plasma protein binding. An acylated analogue that gained IGF-1 receptor affinity while keeping metabolic potency is the specific failure mode that has ended earlier insulin analogue programmes, so it is measured rather than assumed.',
          dependsOnStepId: 'deg-w5',
          reagentsAndBuffer:
            'Solubilised human insulin receptor and IGF-1 receptor preparations, iodine-125 labelled human insulin and IGF-1, scintillation proximity beads, human serum albumin, equilibrium dialysis and surface plasmon resonance, differentiated 3T3-L1 adipocytes for glucose uptake',
        },
      ],
    },
    keyAudits: [
      {
        id: 'deg-a1',
        category: 'conclusion_shift',
        title: 'The FDA refused it in 2013 over a cardiovascular signal it had found itself',
        laymanSummary:
          'The application went in in 2011. Instead of approving it, the FDA wrote back in February 2013 saying its own pooled analysis of the trials had turned up a possible excess of heart attacks and strokes, and that only a new trial could settle it. Approval came two and a half years later, conditional on running that trial.',
        technicalDetails:
          'The NDA for Tresiba was received on 29 September 2011. The FDA issued a complete response action letter on 8 February 2013; Novo Nordisk submitted its complete response on 26 March 2015 and the drug was approved on 25 September 2015. The approval letter states in terms that "a signal of a serious risk of cardiovascular events was identified from a meta-analysis of data from clinical trials evaluating insulin degludec and insulin degludec and insulin aspart, and available data have not definitively excluded the potential for this serious risk." It records that spontaneous adverse-event reporting and the Sentinel pharmacovigilance system were both judged insufficient, and imposes postmarketing requirement 2954-2 under section 505(o): a randomised, double-blind, active-controlled trial whose objective is to show the upper bound of the two-sided 95% confidence interval for adjudicated MACE is below 1.3. That trial is DEVOTE.',
        evidenceSource:
          'FDA approval letter, NDA 203314, 25 September 2015 (Reference ID 3825141), postmarketing requirement 2954-2',
        measuredMetric:
          'Dates of the regulatory actions, and the text of the required postmarketing cardiovascular outcome trial',
        auditFlag: 'verified',
      },
      {
        id: 'deg-a2',
        category: 'measured',
        title: 'DEVOTE cleared the cardiovascular signal and cut severe hypoglycaemia by 40%',
        laymanSummary:
          'The trial the FDA demanded enrolled 7,637 people with type 2 diabetes, most of whom already had heart or kidney disease, and compared degludec against glargine for about two years. Heart attacks, strokes and cardiovascular deaths came out the same. Severe low blood sugar episodes were 40% less frequent on degludec.',
        technicalDetails:
          'DEVOTE (NCT01959529) randomised 7,637 patients with type 2 diabetes to insulin degludec (3,818) or insulin glargine U100 (3,819) once daily in a double-blind, treat-to-target, event-driven cardiovascular outcome trial. 6,509 participants (85.2%) had established cardiovascular disease, chronic kidney disease or both; mean age 65.0 years, mean diabetes duration 16.4 years, mean HbA1c 8.4%. The primary composite outcome occurred in 325 (8.5%) on degludec and 356 (9.3%) on glargine — hazard ratio 0.91 (95% CI 0.78 to 1.06, p<0.001 for non-inferiority). At 24 months mean HbA1c was 7.5% in both groups; mean fasting plasma glucose was lower on degludec, 128 against 136 mg/dL (p<0.001). Prespecified adjudicated severe hypoglycaemia occurred in 187 (4.9%) against 252 (6.6%), an absolute difference of 1.7 percentage points, rate ratio 0.60 (p<0.001 for superiority), odds ratio 0.73 (p<0.001 for superiority). Rates of adverse events did not differ.',
        evidenceSource: 'Marso SP et al., N Engl J Med 2017;377:723-732 (NCT01959529)',
        doi: '10.1056/NEJMoa1615692',
        measuredMetric:
          'Hazard ratio for adjudicated three-point MACE, and rate and odds ratios for adjudicated severe hypoglycaemia over a median 1.99 years',
        auditFlag: 'verified',
      },
      {
        id: 'deg-a3',
        category: 'inferred',
        title: 'It never lowered HbA1c more than glargine, and was not designed to',
        laymanSummary:
          'Every head-to-head trial was built to show degludec was no worse than glargine at controlling average blood sugar, not better. It was no worse. The difference in the 52-week trial was eight hundredths of a percentage point, with a confidence interval running through zero.',
        technicalDetails:
          'BEGIN Basal-Bolus Type 2 (NCT00972283) randomised 1,006 adults with type 2 diabetes 3:1 to degludec or glargine, each with mealtime insulin aspart, in a 52-week open-label treat-to-target non-inferiority trial at 123 sites in 12 countries. HbA1c fell by 1.1% on degludec and 1.2% on glargine; the estimated treatment difference was 0.08 percentage points (95% CI -0.05 to 0.21), confirming non-inferiority against a limit of 0.4%. Overall confirmed hypoglycaemia was 11.1 against 13.6 episodes per patient-year (rate ratio 0.82, 95% CI 0.69 to 0.99, p=0.0359) and nocturnal confirmed hypoglycaemia 1.4 against 1.8 (rate ratio 0.75, 95% CI 0.58 to 0.99, p=0.0399). The authors noted severe hypoglycaemia rates "seemed similar" — 0.06 against 0.05 episodes per patient-year — "but were too low for assessment of differences." In DEVOTE, with 7,637 patients and a treat-to-target design, mean HbA1c at 24 months was 7.5% in both arms.',
        evidenceSource: 'Garber AJ et al., Lancet 2012;379:1498-1507 (NCT00972283)',
        doi: '10.1016/S0140-6736(12)60205-0',
        inferredClaim:
          'That degludec controls blood sugar better than insulin glargine — no trial has shown this, all of them were designed as non-inferiority trials, and the point estimate in the 52-week trial favours glargine by 0.08 percentage points',
        auditFlag: 'caution',
      },
      {
        id: 'deg-a4',
        category: 'measured',
        title: 'The two SWITCH trials counted hypoglycaemia under blinding, and it fell',
        laymanSummary:
          'Two crossover trials gave every participant both insulins in turn, with neither patient nor doctor knowing which was which, and counted low blood sugar episodes. Overall episodes fell 11% in type 1 diabetes and 30% in type 2. Night-time episodes fell by a third and by 42%.',
        technicalDetails:
          'SWITCH 1 (NCT02034513) enrolled 501 adults with type 1 diabetes and at least one hypoglycaemia risk factor in a double-blind crossover trial of two 32-week periods. During the maintenance periods, overall severe or blood-glucose-confirmed symptomatic hypoglycaemia was 2,200.9 against 2,462.7 episodes per 100 person-years, rate ratio 0.89 (95% CI 0.85 to 0.94, p<0.001 for superiority); nocturnal episodes 277.1 against 428.6 per 100 person-years, rate ratio 0.64 (95% CI 0.56 to 0.73, p<0.001); severe hypoglycaemia in 10.3% against 17.1% of patients (McNemar p=0.002, risk difference -6.8%, 95% CI -10.8% to -2.7%). SWITCH 2 (NCT02030600) ran the same design in 721 adults with type 2 diabetes at 152 United States centres: overall symptomatic hypoglycaemia 185.6 against 265.4 episodes per 100 patient-years, rate ratio 0.70 (95% CI 0.61 to 0.80, p<0.001); nocturnal 55.2 against 93.6, rate ratio 0.58 (95% CI 0.46 to 0.74, p<0.001). Severe hypoglycaemia in SWITCH 2 was 1.6% against 2.4% and was not statistically significant (McNemar p=0.35, risk difference -0.8%, 95% CI -2.2% to 0.5%).',
        evidenceSource:
          'Lane W et al., JAMA 2017;318:33-44 (SWITCH 1, NCT02034513); Wysham C et al., JAMA 2017;318:45-56 (SWITCH 2, NCT02030600)',
        doi: '10.1001/jama.2017.7117',
        measuredMetric:
          'Rate ratios for overall and nocturnal symptomatic hypoglycaemia during blinded crossover maintenance periods, and the proportion of patients with severe hypoglycaemia',
        auditFlag: 'verified',
      },
      {
        id: 'deg-a5',
        category: 'failed',
        title: 'Against the newer concentrated glargine, CONCLUDE missed its primary endpoint',
        laymanSummary:
          'When degludec was tested against a more concentrated version of glargine rather than the original, the hypoglycaemia advantage vanished. The trial did not meet its main endpoint, and the statistical testing was stopped there. Everything reported afterwards is exploratory.',
        technicalDetails:
          'CONCLUDE (NCT03078478) randomised 1,609 insulin-treated adults with type 2 diabetes, HbA1c 9.5% or below, BMI 45 or below and at least one predefined hypoglycaemia risk factor, open-label 1:1 to degludec 200 U/mL or glargine 300 U/mL, both titrated to the same fasting target. The primary endpoint — number of overall symptomatic hypoglycaemic events during the 36-week maintenance period — gave a rate ratio of 0.88 (95% CI 0.73 to 1.06), not significant. The authors state that because there was no significant difference on the primary endpoint, the confirmatory testing procedure for superiority was stopped, and the prespecified confirmatory secondary endpoints "were now considered exploratory." Those exploratory analyses showed nocturnal symptomatic hypoglycaemia at rate ratio 0.63 (95% CI 0.48 to 0.84) and severe hypoglycaemia at rate ratio 0.20 (95% CI 0.07 to 0.57). A severe-hypoglycaemia rate ratio of 0.20 is a large number, and it carries no confirmatory weight, because the gate it had to pass through did not open.',
        evidenceSource: 'Philis-Tsimikas A et al., Diabetologia 2020;63:698-710 (NCT03078478)',
        doi: '10.1007/s00125-019-05080-9',
        measuredMetric:
          'Rate ratio for overall symptomatic hypoglycaemia in the 36-week maintenance period against insulin glargine U300',
        inferredClaim:
          'That degludec reduces severe hypoglycaemia against glargine U300 — the 0.20 rate ratio comes from an analysis the trial itself reclassified as exploratory after the primary endpoint failed',
        auditFlag: 'contested',
      },
      {
        id: 'deg-a6',
        category: 'measured',
        title: 'The 42-hour duration is a clamp-study measurement, not a marketing claim',
        laymanSummary:
          'A glucose clamp study in 21 people with type 1 diabetes measured how long one injection kept working after eight daily doses. The answer was at least 42 hours, with the strongest effect at around 12 hours and day-to-day variability of 20%.',
        technicalDetails:
          'The FDA label for Tresiba reports a euglycaemic glucose clamp study in 21 patients with type 1 diabetes after eight once-daily subcutaneous doses of 0.4 units/kg. Maximum glucose infusion rate was 2.0 mg/kg/min at a median of 12 hours post-dose, and the glucose-lowering effect lasted at least 42 hours after the last injection. Steady-state within-subject day-to-day variability in total glucose-lowering effect was 20% (coefficient of variation for AUC-GIR). Steady state was reached after three to four days. Half-life at steady state is approximately 25 hours, determined primarily by the rate of absorption from subcutaneous tissue rather than by clearance. Albumin affinity corresponds to greater than 99% plasma protein binding. The label attributes the protracted profile predominantly to delayed subcutaneous absorption and only to a lesser extent to albumin binding.',
        evidenceSource:
          'FDA prescribing information for TRESIBA (insulin degludec injection), sections 11, 12.1, 12.2 and 12.3, NDA 203314',
        measuredMetric:
          'Duration of glucose-lowering effect, time to maximum glucose infusion rate, day-to-day coefficient of variation and steady-state half-life in a euglycaemic clamp study',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected as pairs of six-molecule clusters',
        laymanDesc:
          'In the pen the insulin is held as dihexamers — twelve molecules locked together around zinc, kept stable by a phenol preservative. That is a storage form, not a working form.',
        molecularDetail:
          'The formulation contains zinc at 32.7 micrograms per millilitre in the U-100 presentation, with phenol and metacresol as phenolic ligands holding the molecule in a soluble dihexamer at pH 7.6. Nothing in this state is absorbable or pharmacologically active.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The preservative leaks away and the clusters link into long chains',
        laymanDesc:
          'Under the skin the phenol diffuses out within minutes. That uncaps the ends of each cluster, and the clusters snap together end to end into strings thousands of units long. The strings are the depot.',
        molecularDetail:
          'Loss of the phenolic ligands opens the hexamer end faces. The hexadecanedioic acid side chain on lysine B29 of one hexamer inserts into the neighbouring hexamer, and the process repeats, producing soluble multi-hexamer chains. The FDA label states plainly that TRESIBA forms multi-hexamers on subcutaneous injection, and that the protracted profile is predominantly due to delayed absorption from this depot.',
        iconName: 'Link',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Zinc leaves slowly and single molecules peel off the ends',
        laymanDesc:
          'Zinc atoms diffuse out of the chain gradually. As they go, the chain unzips from its ends and releases single insulin molecules — a few at a time, for the best part of two days.',
        molecularDetail:
          'Zinc diffusion is the rate-limiting step of the entire pharmacokinetic profile. Terminal-end dissociation releases monomers at a near-constant rate, giving steady-state half-life of approximately 25 hours, a time to maximum effect near 12 hours and a duration beyond 42 hours, with a day-to-day within-subject coefficient of variation of 20%.',
        iconName: 'Timer',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Albumin carries the released molecules and buffers the peak',
        laymanDesc:
          'The fatty acid chain that made the strings also sticks to the main protein in blood. More than 99% of the drug in circulation is bound to it at any moment, which smooths out whatever variation escapes the depot.',
        molecularDetail:
          'The diacid side chain binds serum albumin at an affinity corresponding to greater than 99% plasma protein binding, creating a circulating reservoir in equilibrium with free hormone. The label ranks this a secondary contributor to protraction; the subcutaneous depot does most of the work.',
        iconName: 'Shield',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The free hormone acts at the same receptor as any other insulin',
        laymanDesc:
          'Once free, the molecule does exactly what ordinary insulin does: tells muscle and fat to take sugar in and tells the liver to stop making more. Nothing about the target has been changed.',
        molecularDetail:
          'Binding to the alpha subunits of the insulin receptor triggers beta-subunit autophosphorylation, IRS phosphorylation and PI3K-AKT signalling, driving GLUT4 translocation in muscle and adipose tissue and suppressing hepatic gluconeogenesis and lipolysis. Degradation is described on the label as similar to that of human insulin, with all metabolites inactive.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'Fasting glucose falls, night-time lows fall, average blood sugar does not move',
        laymanDesc:
          'The measured result is a flatter overnight profile: fewer low blood sugar episodes, particularly at night, and slightly lower fasting glucose. Average blood sugar over three months ends up the same as on the drug it replaced.',
        molecularDetail:
          'In DEVOTE, mean fasting plasma glucose at 24 months was 128 against 136 mg/dL (p<0.001) while mean HbA1c was 7.5% in both arms. Adjudicated severe hypoglycaemia was 4.9% against 6.6%, rate ratio 0.60. In SWITCH 2, nocturnal symptomatic hypoglycaemia fell by 42% (rate ratio 0.58, 95% CI 0.46 to 0.74).',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'DEVOTE (NCT01959529)',
        phase:
          'Phase 3 double-blind, treat-to-target, event-driven cardiovascular outcome trial, median 1.99 years',
        sampleSize: 7637,
        primaryEndpoint:
          'Time to first adjudicated major adverse cardiovascular event: cardiovascular death, non-fatal myocardial infarction or non-fatal stroke, against a non-inferiority margin of 1.3',
        endpointMet: true,
        statisticalPValue:
          'P < 0.001 for non-inferiority; hazard ratio 0.91 (95% CI 0.78 to 1.06). Adjudicated severe hypoglycaemia rate ratio 0.60, P < 0.001 for superiority',
        unreportedAdverseSignals:
          'The trial was designed to exclude harm, not to demonstrate benefit; the upper confidence bound of 1.06 is compatible with no cardiovascular effect in either direction. Mean HbA1c was identical in the two arms at 24 months.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'SWITCH 1 (NCT02034513)',
        phase: 'Double-blind randomised crossover non-inferiority trial, two 32-week periods',
        sampleSize: 501,
        primaryEndpoint:
          'Rate of overall severe or blood-glucose-confirmed symptomatic hypoglycaemic episodes during the maintenance period, in type 1 diabetes',
        endpointMet: true,
        statisticalPValue:
          'P < 0.001 for superiority; rate ratio 0.89 (95% CI 0.85 to 0.94). Severe hypoglycaemia 10.3% against 17.1%, McNemar P = 0.002',
        unreportedAdverseSignals:
          'Only 395 of 501 randomised patients (78.8%) completed the trial. Every participant had at least one hypoglycaemia risk factor by design, so the absolute rates do not describe an unselected population.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'SWITCH 2 (NCT02030600)',
        phase: 'Double-blind randomised crossover treat-to-target trial, two 32-week periods',
        sampleSize: 721,
        primaryEndpoint:
          'Rate of overall symptomatic hypoglycaemic episodes during the maintenance period, in type 2 diabetes',
        endpointMet: true,
        statisticalPValue:
          'P < 0.001; rate ratio 0.70 (95% CI 0.61 to 0.80). Nocturnal rate ratio 0.58 (95% CI 0.46 to 0.74), P < 0.001',
        unreportedAdverseSignals:
          'Severe hypoglycaemia — the endpoint that matters most — was 1.6% against 2.4% and was not statistically significant (McNemar P = 0.35). 580 of 721 patients (80.4%) completed.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'CONCLUDE (NCT03078478)',
        phase: 'Open-label randomised treat-to-target head-to-head trial, up to 88 weeks',
        sampleSize: 1609,
        primaryEndpoint:
          'Number of overall symptomatic hypoglycaemic events during the 36-week maintenance period, degludec U200 against glargine U300',
        endpointMet: false,
        statisticalPValue:
          'Rate ratio 0.88 (95% CI 0.73 to 1.06) — not significant; the confirmatory testing procedure was stopped at this point',
        unreportedAdverseSignals:
          'The prespecified confirmatory secondary endpoints were reclassified as exploratory once the primary failed. The severe-hypoglycaemia rate ratio of 0.20 (95% CI 0.07 to 0.57) that is often quoted comes from those exploratory analyses.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'BEGIN Basal-Bolus Type 2 (NCT00972283)',
        phase: 'Phase 3 open-label treat-to-target non-inferiority trial, 52 weeks',
        sampleSize: 1006,
        primaryEndpoint:
          'Change in HbA1c from baseline to week 52, non-inferiority against insulin glargine with a limit of 0.4 percentage points',
        endpointMet: true,
        statisticalPValue:
          'Estimated treatment difference 0.08 percentage points (95% CI -0.05 to 0.21), confirming non-inferiority. Overall confirmed hypoglycaemia rate ratio 0.82 (95% CI 0.69 to 0.99, P = 0.0359)',
        unreportedAdverseSignals:
          'The trial randomised 3:1 in favour of degludec, so the glargine comparator arm was 251 patients. Severe hypoglycaemia was 0.06 against 0.05 episodes per patient-year and the authors state these were too infrequent to assess a difference.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A hazard ratio of 0.91 (95% CI 0.78 to 1.06) for three-point MACE against insulin glargine U100 in 7,637 patients over a median 1.99 years',
        'A 40% lower rate of adjudicated severe hypoglycaemia in the same trial — 4.9% against 6.6% of patients, rate ratio 0.60',
        'Rate ratios of 0.89 in type 1 diabetes and 0.70 in type 2 for overall symptomatic hypoglycaemia in two double-blind crossover trials totalling 1,222 participants',
        'A duration of glucose-lowering action beyond 42 hours and a steady-state half-life near 25 hours in a 21-patient euglycaemic clamp study on the FDA label',
      ],
      unsupportedInferences: [
        'That degludec lowers HbA1c better than insulin glargine — the 52-week head-to-head difference was 0.08 percentage points in favour of glargine, and mean HbA1c in DEVOTE was identical at 7.5% in both arms',
        'That degludec reduces cardiovascular events — DEVOTE was a non-inferiority trial designed to exclude a hazard ratio above 1.3, and its confidence interval reaches 1.06',
        'That the severe-hypoglycaemia advantage carries over against insulin glargine U300 — CONCLUDE tested exactly that and missed its primary endpoint',
        'That a 42-hour duration makes injection timing flexible in ordinary use; the clamp measurement was made after eight consecutive daily doses under supervision',
      ],
      whatFailedInitially: [
        'The FDA refused the application on 8 February 2013 after identifying a signal of serious cardiovascular risk in its own meta-analysis of the degludec trial programme, delaying approval by two and a half years and imposing a required outcome trial',
        'CONCLUDE failed its primary endpoint against glargine U300 (rate ratio 0.88, 95% CI 0.73 to 1.06), which stopped the confirmatory testing procedure and demoted every secondary result to exploratory',
        'Severe hypoglycaemia in SWITCH 2 — 1.6% against 2.4% — did not reach significance, so the type 2 hypoglycaemia case rests on overall and nocturnal episode counts rather than on the severe ones',
      ],
      realWorldOutcome: [
        'US$11.39 per millilitre at United States pharmacy acquisition cost, the median across 6 listed products in the CMS NADAC survey',
        'Licensed in the United States for patients from one year of age, and converted from a new drug application to a biologics licence application on 23 March 2020',
        'On the WHO Model List of Essential Medicines as a long-acting insulin analogue alongside glargine and detemir',
      ],
    },
    deliverySystem: {
      type: 'Once-daily subcutaneous injection by prefilled pen or cartridge, in 100 units/mL and 200 units/mL presentations',
      description:
        'A clear, colourless aqueous solution at pH approximately 7.6 containing glycerin, metacresol, phenol and zinc. The 200 units/mL presentation delivers the same total glucose-lowering effect as the 100 units/mL presentation at the same units/kg dose in clamp studies, in half the injected volume. Steady state is reached after three to four days, which is a property of the depot rather than of the dose.',
      safetyProfile:
        'Hypoglycaemia is the commonest and most serious adverse effect of every insulin and is dose-related rather than analogue-specific. Hypokalaemia can follow any insulin dose. Injection-site reactions, lipodystrophy, peripheral oedema and weight gain occur. Hypersensitivity reactions including anaphylaxis are rare. Not recommended for diabetic ketoacidosis. The 100 and 200 units/mL pens deliver different volumes for the same number of units, and the two must not be confused; product-name and concentration confusion between insulins is a recognised dispensing hazard.',
    },
    commonQuestions: [
      {
        q: 'Is degludec better than glargine?',
        a: 'On low blood sugar, measurably yes. On average blood sugar, no — and it was never designed to be. Two double-blind crossover trials found 11% fewer overall hypoglycaemic episodes in type 1 diabetes and 30% fewer in type 2, with night-time episodes down by a third and by 42% respectively. The 7,637-patient DEVOTE trial found 40% fewer adjudicated severe episodes. But HbA1c was identical in DEVOTE at 7.5% in both arms, and in the 52-week head-to-head trial the difference was 0.08 percentage points in favour of glargine. Against the newer concentrated glargine U300, the CONCLUDE trial found no significant difference in overall hypoglycaemia at all.',
        auditNote:
          'The comparator matters. Every hypoglycaemia claim on this page is against glargine U100. Against glargine U300 the primary endpoint was missed.',
      },
      {
        q: 'Why did the FDA reject it the first time?',
        a: 'Because the agency ran its own pooled analysis across the degludec trial programme and found a possible excess of major cardiovascular events. The approval letter states that "a signal of a serious risk of cardiovascular events was identified from a meta-analysis of data from clinical trials" and that available data had not definitively excluded it. The FDA issued a complete response letter on 8 February 2013 and required a new randomised, double-blind, active-controlled trial designed to show the upper bound of the 95% confidence interval for major adverse cardiovascular events was below 1.3. That requirement became DEVOTE, which reported a hazard ratio of 0.91 with an upper bound of 1.06. The drug was approved on 25 September 2015, conditional on completing it.',
      },
      {
        q: 'Does one injection really last more than 42 hours?',
        a: 'That is a measurement, not a claim. In a euglycaemic glucose clamp study of 21 people with type 1 diabetes given eight consecutive daily doses, the glucose-lowering effect of the last injection was still detectable at 42 hours, with the maximum effect at a median of 12 hours and a day-to-day variability of 20%. The half-life at steady state is about 25 hours, and it is set by how fast the drug leaves the depot under the skin, not by how fast the body clears it. What that duration is for is overlap: it means a late or early injection does not open a gap in coverage. It is not a licence to skip one, and this page gives no dosing guidance.',
      },
      {
        q: 'What actually makes it last so long?',
        a: 'A chemical assembly step that happens under the skin rather than in the vial. Degludec has the last amino acid of the B chain removed and a 16-carbon dicarboxylic acid attached through a glutamate spacer. In the pen, phenol keeps the molecule as pairs of six-unit clusters. Injected, the phenol diffuses away within minutes, the fatty acid tails link cluster to cluster, and the result is a soluble chain of thousands of units that the body cannot absorb as a whole. Zinc then leaks out of that chain slowly, and single molecules peel off the ends. The FDA label attributes the long profile predominantly to this delayed absorption and only secondarily to the fact that the released molecules stick to albumin in the blood.',
      },
      {
        q: 'Does this page show what the drug costs to make?',
        a: 'No, because no verifiable per-dose cost-of-production figure for recombinant insulin degludec could be found and cited. The figure shown is what United States pharmacies pay to acquire it — US$11.39 per millilitre, the median across 6 listed products in the CMS National Average Drug Acquisition Cost survey. That is a price, not a manufacturing cost, and the gap between the two is exactly the thing this page cannot measure.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Marso SP, McGuire DK, Zinman B et al. Efficacy and Safety of Degludec versus Glargine in Type 2 Diabetes (DEVOTE). N Engl J Med 2017;377:723-732',
        identifier: '10.1056/NEJMoa1615692',
        kind: 'doi',
      },
      {
        label: 'DEVOTE: A Trial Comparing Cardiovascular Safety of Insulin Degludec vs Insulin Glargine in Subjects With Type 2 Diabetes at High Risk of Cardiovascular Events',
        identifier: 'NCT01959529',
        kind: 'nct',
      },
      {
        label:
          'Lane W, Bailey TS, Gerety G et al. Effect of Insulin Degludec vs Insulin Glargine U100 on Hypoglycemia in Patients With Type 1 Diabetes: The SWITCH 1 Randomized Clinical Trial. JAMA 2017;318:33-44',
        identifier: '28672316',
        kind: 'pmid',
      },
      {
        label:
          'Wysham C, Bhargava A, Chaykin L et al. Effect of Insulin Degludec vs Insulin Glargine U100 on Hypoglycemia in Patients With Type 2 Diabetes: The SWITCH 2 Randomized Clinical Trial. JAMA 2017;318:45-56',
        identifier: '10.1001/jama.2017.7117',
        kind: 'doi',
      },
      {
        label:
          'Philis-Tsimikas A, Klonoff DC, Khunti K et al. Risk of hypoglycaemia with insulin degludec versus insulin glargine U300 in insulin-treated patients with type 2 diabetes: the randomised, head-to-head CONCLUDE trial. Diabetologia 2020;63:698-710',
        identifier: '10.1007/s00125-019-05080-9',
        kind: 'doi',
      },
      {
        label:
          'Garber AJ, King AB, Del Prato S et al. Insulin degludec, an ultra-longacting basal insulin, versus insulin glargine in basal-bolus treatment with mealtime insulin aspart in type 2 diabetes (BEGIN Basal-Bolus Type 2). Lancet 2012;379:1498-1507',
        identifier: '10.1016/S0140-6736(12)60205-0',
        kind: 'doi',
      },
      {
        label:
          'FDA approval letter, NDA 203314 (TRESIBA, insulin degludec injection), 25 September 2015 — records the 8 February 2013 complete response action and imposes postmarketing requirement 2954-2 for a cardiovascular outcome trial',
        identifier: 'https://www.accessdata.fda.gov/drugsatfda_docs/appletter/2015/203314Orig1s000ltr.pdf',
        kind: 'regulatory',
      },
      {
        label:
          'openFDA Drugs@FDA — NDA 203314 (TRESIBA, Novo Nordisk Inc., original approval 25 September 2015; deemed a BLA on 23 March 2020)',
        identifier: 'https://api.fda.gov/drug/drugsfda.json?search=openfda.brand_name:%22TRESIBA%22',
        kind: 'regulatory',
      },
      {
        label:
          'FDA prescribing information for TRESIBA (insulin degludec injection) — sections 11 Description, 12.1 Mechanism of Action, 12.2 Pharmacodynamics and 12.3 Pharmacokinetics',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22TRESIBA%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 118984462 — insulin degludec structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/118984462',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Glipizide — a 1984 sulfonylurea whose label still carries a cardiovascular mortality warning
  //    based on a different drug tested in 1970, and which lost the one randomised outcome
  //    comparison it has ever had.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'glipizide',
    name: 'Glipizide',
    tradeName: 'Glucotrol / Glucotrol XL',
    sponsor: 'Pfizer (Roerig division, originator); marketed almost entirely as generics',
    targetGene: 'ABCC8',
    targetProtein:
      'Sulfonylurea receptor 1 (SUR1), the regulatory subunit of the ATP-sensitive potassium channel formed with the Kir6.2 pore (KCNJ11) in the pancreatic beta-cell membrane',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1984,
    indication:
      'As an adjunct to diet and exercise to improve glycaemic control in adults with type 2 diabetes mellitus. Not for the treatment of type 1 diabetes or diabetic ketoacidosis.',
    patientFriendlyIndication: 'Type 2 diabetes — a tablet that squeezes more insulin out of the pancreas',
    anatomicalSite:
      'Pancreatic islet beta cell plasma membrane; the same channel subtype family also exists in cardiac and vascular smooth muscle',
    conditionContext: {
      conditionExplainer:
        'In type 2 diabetes the pancreas still makes insulin, but not enough of it at the right moment, and the tissues respond to it poorly. A sulfonylurea attacks the first half of that problem only: it forces the remaining beta cells to release more insulin, whether or not glucose is high.',
      whyItMatters:
        'Because the release is not conditional on blood sugar, the same mechanism that lowers glucose after a meal also lowers it during a missed meal. That is what hypoglycaemia is, and it is the defining risk of this whole drug class. It also means the drug depends on beta cells that still work, so its effect decays as the disease progresses.',
      whoTakesThis:
        'Adults with type 2 diabetes, usually after metformin. Glipizide is among the cheapest glucose-lowering drugs in existence and remains heavily prescribed for that reason, particularly where newer agents are not affordable.',
      clinicalGoals:
        'Lower HbA1c without causing hypoglycaemia. Nothing in the glipizide evidence base measures whether doing so prevents a heart attack; the one randomised trial that looked found it did worse than metformin.',
    },
    oneSentenceVerdict:
      'A sulfonylurea that closes the ATP-sensitive potassium channel on the pancreatic beta cell and forces insulin release regardless of blood glucose — a mechanism that reliably lowers HbA1c, that lost a 304-patient randomised cardiovascular outcome comparison against metformin with an adjusted hazard ratio of 0.54 in favour of metformin, and whose United States label has carried a special warning on increased cardiovascular mortality since 1970 based on a trial of a different sulfonylurea.',
    laymanHowItWorks:
      'Beta cells in the pancreas keep a set of potassium channels open when blood sugar is low, which keeps them electrically quiet. When sugar rises the cell burns it, the channels shut, and the cell fires and releases insulin. Glipizide shuts those channels chemically, so the cell fires whether or not there is sugar to justify it. Insulin comes out, blood sugar falls, and it keeps falling if the person has not eaten.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0464 per tablet at United States pharmacy acquisition cost, the median across 75 listed generic products in the CMS NADAC survey effective 19 August 2026',
      markupEstimate: '',
      openPatentNotes:
        'Approved as Glucotrol in 1984 and long off patent. The extended-release Glucotrol XL uses an osmotic push-pull tablet whose delivery system was separately patented; both immediate-release and extended-release generics are widely available, and 75 distinct products appear in the current NADAC file.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The honest comparison for glipizide is metformin, and it has been made once, head to head, with hard endpoints: in 304 patients with type 2 diabetes and established coronary disease, metformin produced an adjusted hazard ratio of 0.54 for recurrent cardiovascular events against glipizide over a median five years, at effectively identical HbA1c. Within the sulfonylurea class, glipizide is the one with the lower measured hypoglycaemia rate: a 13,963-person cohort found glyburide users at 1.9 times the risk of serious hypoglycaemia. Nothing in a supermarket replaces a glucose-lowering drug, and the evidence for diet and exercise is a different kind of evidence with a different kind of trial behind it.',
      conventionalRx: [
        {
          name: 'Metformin',
          class: 'Biguanide',
          howItCompares:
            'The only drug that has beaten glipizide on a hard cardiovascular endpoint in a randomised trial. SPREAD-DIMCAD randomised 304 patients with type 2 diabetes and a history of coronary artery disease to glipizide or metformin for three years, double-blind, and followed them a median of five. Ninety-one participants had 103 primary endpoints; the intention-to-treat adjusted hazard ratio for the composite of cardiovascular death, all-cause death, non-fatal myocardial infarction, non-fatal stroke or revascularisation was 0.54 (95% CI 0.30 to 0.90, p=0.026) favouring metformin. HbA1c at end of treatment was 7.1% on glipizide and 7.0% on metformin.',
          typicalCost: 'Comparable — both are among the cheapest oral drugs in the pharmacopoeia',
          prosAndCons:
            'Pros: does not cause hypoglycaemia on its own, does not cause weight gain, has the only randomised head-to-head cardiovascular win over glipizide. Cons: gastrointestinal intolerance is common, and it is contraindicated at low kidney function.',
        },
        {
          name: 'Glyburide (glibenclamide)',
          class: 'Second-generation sulfonylurea',
          howItCompares:
            'Same mechanism, more hypoglycaemia. In 13,963 Tennessee Medicaid enrollees aged 65 or over, the crude rate of serious hypoglycaemia was 16.6 per 1,000 person-years on glyburide, and the adjusted relative risk for glyburide against glipizide was 1.9 (95% CI 1.2 to 2.9), consistent across every stratum including dose and duration. A meta-analysis of 21 randomised trials found glyburide carried an 83% greater risk of at least one hypoglycaemic episode than other sulfonylureas (RR 1.83, 95% CI 1.35 to 2.49).',
          typicalCost: 'US$0.0668 per tablet at NADAC, marginally more than glipizide',
          prosAndCons:
            'Pros: none that the comparative data establish. Cons: measurably more hypoglycaemia at equivalent glucose control, and an active metabolite that accumulates in renal impairment.',
        },
        {
          name: 'DPP-4 inhibitors (sitagliptin, linagliptin, alogliptin)',
          class: 'Incretin enhancers',
          howItCompares:
            'Lower HbA1c by a similar amount without forcing insulin release when glucose is normal, so hypoglycaemia is rare. Their cardiovascular outcome trials were designed to exclude harm rather than show benefit, and one of them — saxagliptin in SAVOR-TIMI 53 — found an excess of heart-failure hospitalisation.',
          typicalCost:
            'Alogliptin is US$5.18 per tablet at NADAC, more than a hundred times the price of glipizide',
          prosAndCons:
            'Pros: no hypoglycaemia, weight neutral. Cons: far more expensive, and no cardiovascular benefit has been demonstrated for any of them.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Do not skip meals while taking a sulfonylurea without telling the prescriber',
          action:
            'This drug releases insulin whether or not food has arrived. A missed or delayed meal, unusual exertion or alcohol are the ordinary circumstances in which a sulfonylurea causes hypoglycaemia, and they are also the circumstances patients most often do not mention.',
          patientImpact:
            'In a cohort of 13,963 Medicaid enrollees aged 65 and over, 255 people had a first episode of serious hypoglycaemia — hospitalisation, emergency admission or death with a measured blood glucose under 50 mg/dL — during 20,715 person-years of sulfonylurea use. On glipizide the rate was lower than on glyburide or chlorpropamide, but it was not zero.',
          clinicalPrecaution:
            'Any change to a diabetes regimen, including around fasting for religious or medical reasons, belongs with the prescribing clinician. This page gives no dosing guidance of any kind.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=CN=C(C=N1)C(=O)NCCC2=CC=C(C=C2)S(=O)(=O)NC(=O)NC3CCCCC3',
      chemicalFormula: 'C21H27N5O4S',
      molecularWeight: '445.50 g/mol',
      targetReceptorAffinity:
        'Binds the sulfonylurea receptor SUR1 in the beta-cell plasma membrane, closing the associated ATP-sensitive potassium channel. The FDA label describes this mechanism directly and then, in the same section, states that "the mechanism by which glipizide lowers blood glucose during long-term administration has not been clearly established." Pharmacokinetically the molecule is short-lived: absolute bioavailability 100%, peak plasma concentration at 1 to 3 hours, elimination half-life 2 to 4 hours, and no accumulation on repeated dosing.',
      structureSource: {
        label:
          'PubChem CID 3478 (glipizide) — SMILES, molecular formula and weight, re-checked against the PUG REST property endpoint and matched to the FDA label description section',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3478',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'glp-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and pKa confirmation of the sulfonylurea starting materials',
          description:
            'Confirm the identity and purity of 5-methylpyrazine-2-carboxylic acid, 4-(2-aminoethyl)benzenesulfonamide and cyclohexyl isocyanate before any coupling. The pKa of the finished molecule is 5.9, which is why it is insoluble in water and soluble in 0.1 N sodium hydroxide, and an incorrect acid component changes that number and with it the dissolution behaviour of every tablet made from the batch.',
          reagentsAndBuffer:
            'Reference standards, nuclear magnetic resonance and infrared identity, Karl Fischer water determination, potentiometric titration in mixed aqueous-organic solvent for pKa',
        },
        {
          id: 'glp-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amide coupling then sulfonylurea formation',
          description:
            'Couple the pyrazine carboxylic acid to the aminoethyl side chain of the benzenesulfonamide to form the amide, then react the sulfonamide nitrogen with cyclohexyl isocyanate to close the sulfonylurea. Both steps are ordinary condensation chemistry, which is the reason this molecule costs under five cents a tablet.',
          dependsOnStepId: 'glp-w1',
          reagentsAndBuffer:
            'Carbodiimide or acyl chloride activation, triethylamine or potassium carbonate base, cyclohexyl isocyanate, anhydrous acetone or acetonitrile, controlled-temperature jacketed reactor',
        },
        {
          id: 'glp-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Base-acid recrystallisation and related-substances profiling',
          description:
            'Dissolve the crude solid in dilute sodium hydroxide, filter, and reprecipitate by acidification, then recrystallise to the specified polymorph. The related substances the monograph is written to catch are the uncyclised sulfonamide intermediate and cyclohexylurea, both of which are inactive and both of which suppress potency if carried through.',
          dependsOnStepId: 'glp-w2',
          reagentsAndBuffer:
            'Dilute sodium hydroxide, dilute hydrochloric acid, methanol-water recrystallisation, reversed-phase HPLC with ultraviolet detection at 275 nm, X-ray powder diffraction for polymorph identity',
        },
        {
          id: 'glp-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Osmotic push-pull tablet assembly and dissolution profiling',
          description:
            'For the extended-release presentation, compress a bilayer core — an active layer containing drug and a push layer containing osmotically active but pharmacologically inert polymer — coat it with a semipermeable cellulose acetate membrane, and laser-drill the delivery orifice. Water enters through the membrane, the push layer swells, and drug is extruded at a controlled rate. Dissolution testing is the release criterion, because the entire clinical difference between the two presentations lives in this membrane and not in the molecule.',
          dependsOnStepId: 'glp-w3',
          reagentsAndBuffer:
            'Polyethylene oxide, hypromellose, sodium chloride, cellulose acetate coating solution, polyethylene glycol plasticiser, laser drilling station, USP apparatus 2 dissolution in phosphate buffer',
        },
        {
          id: 'glp-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Rubidium efflux and patch-clamp confirmation of KATP channel block',
          description:
            'Measure inhibition of potassium efflux from beta-cell lines expressing SUR1 and Kir6.2, and confirm channel closure directly by inside-out patch clamp. Selectivity between SUR1 and the SUR2A and SUR2B isoforms in cardiac and vascular smooth muscle is measured in the same run, because those isoforms are the mechanistic basis of the cardiovascular concern that the label warning has carried since 1970.',
          dependsOnStepId: 'glp-w4',
          reagentsAndBuffer:
            'INS-1 or MIN6 beta-cell lines, HEK293 cells co-transfected with SUR1/Kir6.2, SUR2A/Kir6.2 and SUR2B/Kir6.1, rubidium-86 or thallium-flux dye, patch-clamp rig with inside-out excised patches, ATP-free and ATP-containing intracellular solutions',
        },
      ],
    },
    keyAudits: [
      {
        id: 'glp-a1',
        category: 'conclusion_shift',
        title: 'The label still carries a 1970 mortality warning about a drug that is not glipizide',
        laymanSummary:
          'Every glipizide package insert in the United States opens its warnings section with a statement that oral diabetes drugs increase death from heart disease. That statement comes from a trial that finished in 1970, tested tolbutamide, and enrolled 823 people. It was extended to glipizide on the reasoning that the drugs are chemically similar.',
        technicalDetails:
          'The FDA-approved glipizide label contains a section headed "SPECIAL WARNING ON INCREASED RISK OF CARDIOVASCULAR MORTALITY". It states that the University Group Diabetes Program, a 823-patient four-arm trial published in Diabetes in 1970, found patients treated for five to eight years with diet plus a fixed 1.5 g daily dose of tolbutamide had cardiovascular mortality approximately two and a half times that of patients on diet alone. Total mortality was not significantly increased, and the label acknowledges that tolbutamide was discontinued on the basis of the cardiovascular finding, "thus limiting the opportunity for the study to show an increase in overall mortality". The label then states: "Despite controversy regarding the interpretation of these results, the findings of the UGDP study provide an adequate basis for this warning", and extends it to the class because "it is prudent from a safety standpoint to consider that this warning may also apply to other oral hypoglycemic drugs in this class, in view of their close similarities in mode of action and chemical structure." Glipizide was approved fourteen years after UGDP reported and has never had a placebo-controlled cardiovascular outcome trial of its own.',
        evidenceSource:
          'FDA prescribing information for glipizide tablets USP, WARNINGS section; University Group Diabetes Program, Diabetes 1970;19(suppl 2):747-830',
        measuredMetric:
          'Cardiovascular mortality ratio in the tolbutamide arm of a 823-patient trial, and the regulatory extension of that finding to the sulfonylurea class',
        auditFlag: 'contested',
      },
      {
        id: 'glp-a2',
        category: 'failed',
        title: 'Glipizide lost its only randomised cardiovascular comparison, to metformin',
        laymanSummary:
          'A Chinese trial randomised 304 people with type 2 diabetes who had already had coronary disease to glipizide or metformin, blinded, for three years, then followed them for five. Both drugs controlled blood sugar equally. The metformin group had roughly half the rate of further cardiovascular events.',
        technicalDetails:
          'SPREAD-DIMCAD was a multicentre, randomised, double-blind, placebo-controlled trial of 304 patients with type 2 diabetes and a history of coronary artery disease, mean age 63.3 years, assigned to glipizide 30 mg daily or metformin 1.5 g daily for three years. At the end of study drug administration HbA1c was 7.1% in the glipizide group and 7.0% in the metformin group. At a median follow-up of 5.0 years, 91 participants had developed 103 primary endpoints. The intention-to-treat adjusted hazard ratio for the composite of cardiovascular death, death from any cause, non-fatal myocardial infarction, non-fatal stroke or arterial revascularisation was 0.54 (95% CI 0.30 to 0.90, p=0.026) for metformin against glipizide. Secondary endpoints and adverse events did not differ significantly. The trial is small, single-country and has not been replicated, and it is the only randomised comparison of glipizide against another agent with adjudicated cardiovascular endpoints in the literature.',
        evidenceSource: 'Hong J et al., Diabetes Care 2013;36:1304-1311 (SPREAD-DIMCAD)',
        doi: '10.2337/dc12-0719',
        measuredMetric:
          'Adjusted hazard ratio for the composite of recurrent cardiovascular events at a median 5.0 years, metformin against glipizide, at matched HbA1c',
        auditFlag: 'verified',
      },
      {
        id: 'glp-a3',
        category: 'measured',
        title: 'In UKPDS, sulfonylureas prevented eye and kidney damage but not heart attacks',
        laymanSummary:
          'The one large long-term trial that included glipizide followed 3,867 newly diagnosed patients for ten years. Tighter control cut microvascular complications — retinal damage, kidney damage — by a quarter. It did not significantly cut heart attacks, deaths from diabetes, or deaths from anything.',
        technicalDetails:
          'UKPDS 33 randomised 3,867 newly diagnosed patients with type 2 diabetes to an intensive policy with a sulphonylurea (chlorpropamide, glibenclamide or glipizide) or insulin, or a conventional policy with diet. Over ten years median HbA1c was 7.0% in the intensive group against 7.9% conventional, an 11% relative reduction. Risk in the intensive group was 12% lower for any diabetes-related endpoint (95% CI 1 to 21, p=0.029), 10% lower for any diabetes-related death (95% CI -11 to 27, p=0.34) and 6% lower for all-cause mortality (95% CI -10 to 20, p=0.44). Most of the aggregate benefit came from a 25% reduction in microvascular endpoints (95% CI 7 to 40, p=0.0099), including the need for retinal photocoagulation. Major hypoglycaemic episodes per year were 0.7% on conventional treatment, 1.0% on chlorpropamide, 1.4% on glibenclamide and 1.8% on insulin. Mean weight gain in the intensive group was 2.9 kg (p<0.001). The published between-agent comparisons in the abstract cover chlorpropamide, glibenclamide and insulin; glipizide was used at some centres and is not separately reported.',
        evidenceSource: 'UK Prospective Diabetes Study (UKPDS) Group, Lancet 1998;352:837-853 (UKPDS 33, PMID 9742976)',
        doi: '10.1016/S0140-6736(98)07019-6',
        measuredMetric:
          'Relative risk reductions for aggregate diabetes-related endpoints, microvascular endpoints and all-cause mortality at ten years, and major hypoglycaemia rates by agent',
        auditFlag: 'verified',
      },
      {
        id: 'glp-a4',
        category: 'measured',
        title: 'Glipizide causes about half as much serious hypoglycaemia as glyburide',
        laymanSummary:
          'A study of nearly 14,000 older people on Medicaid counted the episodes of low blood sugar severe enough to put someone in hospital. Glyburide users had nearly twice the risk of glipizide users, and the gap held in every subgroup examined.',
        technicalDetails:
          'Shorr and colleagues followed 13,963 Tennessee Medicaid enrollees aged 65 or over prescribed one of six sulfonylureas between 1985 and 1989, and identified 255 first episodes of serious hypoglycaemia — hospitalisation, emergency admission or death with neuroglycopenic or autonomic symptoms and a concomitant blood glucose below 2.8 mmol/L — during 20,715 person-years of use. The crude rate per 1,000 person-years was highest for glyburide at 16.6 (95% CI 13.2 to 19.9) and lowest for tolbutamide at 3.5 (95% CI 1.2 to 5.9). Among second-generation agents the adjusted relative risk for glyburide against glipizide was 1.9 (95% CI 1.2 to 2.9), and the excess persisted in every stratum defined by gender, race, nursing-home residence, dose and duration of use. This is an observational cohort, not a randomised comparison, and the authors themselves called for effectiveness data on individual agents that the field still largely lacks.',
        evidenceSource: 'Shorr RI, Ray WA, Daugherty JR, Griffin MR. J Am Geriatr Soc 1996;44:751-755',
        doi: '10.1111/j.1532-5415.1996.tb03729.x',
        measuredMetric:
          'Crude and adjusted rates of serious hypoglycaemia per 1,000 person-years by individual sulfonylurea in adults aged 65 and over',
        auditFlag: 'verified',
      },
      {
        id: 'glp-a5',
        category: 'inferred',
        title: 'The label concedes the long-term mechanism has not been established',
        laymanSummary:
          'The drug has been sold since 1984. Its own FDA-approved label says that how it lowers blood sugar over the long run is not clearly known, and that fasting insulin levels do not go up even after years of treatment.',
        technicalDetails:
          'The clinical pharmacology section of the glipizide label states that "the mechanism by which glipizide lowers blood glucose during long-term administration has not been clearly established", that fasting insulin levels are not elevated even on long-term administration while the post-prandial insulin response remains enhanced after at least six months, and that "extrapancreatic effects may play a part in the mechanism of action of oral sulfonylurea hypoglycemic drugs". The extended-release label adds that in two randomised double-blind dose-response studies totalling 347 patients, "the relationship between dose and reduction in hemoglobin A1c was not established", although fasting plasma glucose fell more at 20 mg than at 5 mg. A drug in continuous use for four decades whose dose-response relationship for its own registration endpoint is described on its label as not established is a fact worth stating plainly.',
        evidenceSource:
          'FDA prescribing information for glipizide tablets USP, CLINICAL PHARMACOLOGY; FDA prescribing information for GLUCOTROL XL, sections 12.1 and 12.2',
        inferredClaim:
          'That the glucose-lowering effect of long-term glipizide is fully explained by beta-cell insulin release — the label says otherwise and points at unspecified extrapancreatic effects',
        auditFlag: 'caution',
      },
      {
        id: 'glp-a6',
        category: 'measured',
        title: 'The molecule is gone in hours; the extended-release tablet is a plumbing solution',
        laymanSummary:
          'Glipizide itself is short-acting: fully absorbed, peaking in one to three hours, half of it cleared within four. The once-daily version works by encasing the drug in a membrane with a laser-drilled hole and pushing it out slowly with an osmotic layer.',
        technicalDetails:
          'The label reports absolute bioavailability of 100%, peak plasma concentrations at 1 to 3 hours after a single oral dose, an elimination half-life of 2 to 4 hours identical by oral and intravenous routes — indicating no significant first-pass metabolism — and no accumulation on repeated dosing. Blood-sugar control nonetheless persists in some patients up to 24 hours after a single dose, when plasma levels have fallen to a small fraction of peak. Glucotrol XL is an osmotically active bilayer core, an active drug layer and an inert push layer, surrounded by a semipermeable cellulose acetate membrane with a drilled orifice; the tablet shell is excreted intact. Each extended-release tablet is overfilled — 5.49 mg of glipizide to deliver a 5 mg dose — because the system does not empty completely.',
        evidenceSource:
          'FDA prescribing information for glipizide tablets USP, Pharmacokinetics; FDA prescribing information for GLUCOTROL XL, section 11 Description',
        measuredMetric:
          'Absolute bioavailability, time to peak plasma concentration, elimination half-life, and the overfill ratio of the extended-release tablet',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, completely absorbed, in the blood within an hour',
        laymanDesc:
          'The tablet dissolves and essentially all of the drug gets into the bloodstream. Peak levels arrive one to three hours later, and most of it is cleared within four hours.',
        molecularDetail:
          'Absolute bioavailability is 100%, with peak plasma concentration at 1 to 3 hours and an elimination half-life of 2 to 4 hours. The half-life is the same intravenously as orally, so there is no meaningful first-pass extraction. The molecule is highly protein-bound and metabolised in the liver to inactive products.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It docks on a receptor that sits on top of a potassium gate',
        laymanDesc:
          'On the surface of every insulin-producing cell is a gate that lets potassium out. Sitting on that gate is a protein that acts as its handle. Glipizide grips that handle.',
        molecularDetail:
          'Glipizide binds the sulfonylurea receptor SUR1, an ABC-transporter-family protein (gene ABCC8) that assembles as four copies around four copies of the inward-rectifier potassium pore Kir6.2 (gene KCNJ11). The binding site is on SUR1, not on the pore itself.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The gate shuts and the cell becomes electrically excitable',
        laymanDesc:
          'With potassium no longer leaking out, positive charge builds up inside the cell. That change in voltage is the trigger the cell normally waits for sugar to produce.',
        molecularDetail:
          'Channel closure removes the resting potassium conductance and depolarises the beta-cell membrane from roughly -70 mV toward the threshold for voltage-gated L-type calcium channels. Physiologically this depolarisation is produced by a rising ATP-to-ADP ratio from glucose metabolism; glipizide produces it chemically, independent of glucose.',
        iconName: 'Zap',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Calcium floods in and insulin granules fuse with the surface',
        laymanDesc:
          'Voltage-gated calcium channels open, calcium rushes in, and the pre-loaded packets of insulin inside the cell fuse with the membrane and empty into the blood.',
        molecularDetail:
          'L-type calcium channel opening raises cytosolic calcium, which triggers SNARE-mediated fusion of docked insulin granules. The label notes the insulinotropic response to a meal occurs within 30 minutes of an oral dose, and that elevated insulin levels do not persist beyond the meal challenge.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Blood sugar falls — and keeps falling if no food arrives',
        laymanDesc:
          'The released insulin drives glucose into muscle and fat and shuts down the liver. Because the release was not conditional on blood sugar being high, it continues when blood sugar is already normal.',
        molecularDetail:
          'This is the mechanistic origin of sulfonylurea hypoglycaemia: the drug bypasses the glucose-sensing step entirely. It is also why the effect decays as beta-cell function is lost, and why the label states the drug is ineffective in type 1 diabetes and diabetic ketoacidosis.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The same channel family exists in heart and blood vessels',
        laymanDesc:
          'Potassium channels of this type also sit in heart muscle and artery walls, where they open during oxygen starvation and are thought to protect tissue. Whether blocking them there matters is the question behind the warning on the label.',
        molecularDetail:
          'The cardiac and vascular isoforms pair Kir6.2 or Kir6.1 with SUR2A or SUR2B (gene ABCC9) rather than SUR1, and mediate ischaemic preconditioning. Sulfonylureas differ in their selectivity between SUR1 and SUR2. This is the proposed mechanism behind the UGDP finding and behind the SPREAD-DIMCAD result, and it remains a mechanism rather than a demonstrated cause of the clinical outcomes.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SPREAD-DIMCAD (Hong 2013)',
        phase:
          'Multicentre randomised double-blind trial, 3 years of treatment, median 5.0 years of follow-up',
        sampleSize: 304,
        primaryEndpoint:
          'Time to the composite of recurrent cardiovascular events — cardiovascular death, death from any cause, non-fatal myocardial infarction, non-fatal stroke or arterial revascularisation — glipizide against metformin',
        endpointMet: false,
        statisticalPValue:
          'Adjusted hazard ratio 0.54 (95% CI 0.30 to 0.90, P = 0.026) in favour of metformin, against glipizide',
        unreportedAdverseSignals:
          'Both arms reached effectively the same HbA1c (7.1% against 7.0%), so the difference in outcomes cannot be attributed to differential glucose control. The trial is small, single-country and unreplicated.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'UKPDS 33',
        phase: 'Randomised controlled trial of glycaemic policy, median 10 years',
        sampleSize: 3867,
        primaryEndpoint:
          'Three aggregate endpoints — any diabetes-related endpoint, diabetes-related death and all-cause mortality — for intensive control with a sulphonylurea or insulin against conventional dietary policy',
        endpointMet: true,
        statisticalPValue:
          'P = 0.029 for a 12% reduction in any diabetes-related endpoint; P = 0.0099 for a 25% reduction in microvascular endpoints; P = 0.34 for diabetes-related death and P = 0.44 for all-cause mortality',
        unreportedAdverseSignals:
          'Neither diabetes-related death nor all-cause mortality reached significance, and macrovascular disease was not reduced. Intensive treatment produced more hypoglycaemia (p<0.0001) and 2.9 kg more weight gain (p<0.001).',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'GLUCOTROL XL dose-response programme',
        phase: 'Two randomised double-blind dose-response studies',
        sampleSize: 347,
        primaryEndpoint: 'Reduction in HbA1c and fasting plasma glucose across doses',
        endpointMet: false,
        statisticalPValue:
          'The label states the relationship between dose and reduction in HbA1c was not established; fasting plasma glucose fell more at 20 mg than at 5 mg',
        unreportedAdverseSignals:
          'A dose-response relationship for the registration endpoint that could not be demonstrated in 347 randomised patients is stated on the label rather than resolved by a further trial.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'University Group Diabetes Program (UGDP), tolbutamide arm',
        phase: 'Long-term prospective randomised four-arm trial, 5 to 8 years',
        sampleSize: 823,
        primaryEndpoint:
          'Prevention or delay of vascular complications with glucose-lowering drugs in non-insulin-dependent diabetes',
        endpointMet: false,
        statisticalPValue:
          'Cardiovascular mortality approximately 2.5 times that of diet alone in the tolbutamide arm; total mortality was not significantly increased',
        unreportedAdverseSignals:
          'Tolbutamide was stopped on the cardiovascular finding, which the FDA label acknowledges limited the ability of the trial to detect an effect on overall mortality. The finding has been extended by regulation to glipizide, which was not studied.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'An adjusted hazard ratio of 0.54 (95% CI 0.30 to 0.90) for recurrent cardiovascular events favouring metformin over glipizide in 304 randomised patients with coronary disease, at matched HbA1c',
        'A 25% reduction in microvascular endpoints (95% CI 7 to 40, p=0.0099) with intensive sulfonylurea or insulin therapy in 3,867 newly diagnosed patients over ten years',
        'An adjusted relative risk of 1.9 (95% CI 1.2 to 2.9) for serious hypoglycaemia on glyburide against glipizide in 13,963 adults aged 65 and over',
        'Absolute bioavailability of 100%, peak at 1 to 3 hours and an elimination half-life of 2 to 4 hours',
      ],
      unsupportedInferences: [
        'That lowering HbA1c with glipizide prevents heart attacks — UKPDS found no significant macrovascular reduction, and the only randomised head-to-head comparison found glipizide worse than metformin',
        'That the 1970 UGDP cardiovascular mortality finding applies to glipizide — the label extends it by chemical analogy and says so, and glipizide has never been tested against placebo for cardiovascular outcomes',
        'That higher doses give proportionally better HbA1c control — the extended-release label states in terms that this relationship was not established across 347 randomised patients',
        'That the long-term glucose-lowering effect is fully explained by insulin release — the label says the long-term mechanism has not been clearly established and invokes unspecified extrapancreatic effects',
      ],
      whatFailedInitially: [
        'Glipizide lost SPREAD-DIMCAD to metformin on a composite hard cardiovascular endpoint, the only randomised outcome comparison it has',
        'UKPDS 33 did not show a significant reduction in diabetes-related death (p=0.34) or all-cause mortality (p=0.44) for intensive glycaemic control with sulfonylureas or insulin',
        'The dose-response relationship for HbA1c could not be established in the extended-release registration programme',
      ],
      realWorldOutcome: [
        'US$0.0464 per tablet at United States pharmacy acquisition cost, the median across 75 listed generic products in the CMS NADAC survey',
        'On the WHO Model List of Essential Medicines as a therapeutic alternative within the sulfonylurea class',
        'Still one of the most-prescribed oral diabetes drugs in the world four decades after approval, largely on price',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet — immediate-release, and an extended-release osmotic push-pull system',
      description:
        'The immediate-release tablet is a conventional compressed tablet of a poorly water-soluble weak acid with a pKa of 5.9. The extended-release tablet is an osmotic pump: a bilayer core of drug plus an inert swelling layer, inside a semipermeable cellulose acetate membrane with a laser-drilled orifice. Water crosses the membrane, the push layer expands, and drug is extruded through the hole at a controlled rate. The insoluble shell passes through the gut and is excreted intact, which patients sometimes notice and mistake for an unabsorbed tablet.',
      safetyProfile:
        'Hypoglycaemia is the defining risk and it is mechanistic, not idiosyncratic: the drug releases insulin whether or not glucose is high. Older patients, impaired renal or hepatic function, missed meals, alcohol and unaccustomed exertion all increase it. Weight gain is expected. The United States label opens its warnings with a special warning on increased risk of cardiovascular mortality derived from the 1970 UGDP trial of tolbutamide and extended to the class by analogy. Haemolytic anaemia has been reported in glucose-6-phosphate dehydrogenase deficiency. Rare hepatic and haematological reactions occur, as with any sulfonylurea.',
    },
    commonQuestions: [
      {
        q: 'Why does the label say this drug increases cardiovascular deaths?',
        a: 'Because of a trial that reported in 1970 and did not test glipizide. The University Group Diabetes Program randomised 823 people with type 2 diabetes to four arms, and found that those on a fixed dose of tolbutamide for five to eight years had cardiovascular mortality about two and a half times that of the diet-only group. Total mortality was not significantly increased, and the tolbutamide arm was stopped, which the label concedes limited the trial from detecting a mortality effect either way. The FDA extended the warning to every drug in the class "in view of their close similarities in mode of action and chemical structure". Glipizide was approved in 1984 and has never had its own placebo-controlled cardiovascular outcome trial. Whether the warning is right about glipizide specifically is unknown; the label states plainly that it is applied by analogy.',
        auditNote:
          'A warning extended by chemical similarity is a hypothesis with regulatory force. It is not a measurement of this drug.',
      },
      {
        q: 'Is glipizide worse than metformin?',
        a: 'On the one hard-endpoint comparison that exists, yes. SPREAD-DIMCAD randomised 304 people with type 2 diabetes and existing coronary artery disease to glipizide or metformin, double-blind, for three years, and followed them a median of five. Both arms reached the same average blood sugar — 7.1% against 7.0% HbA1c. The metformin group had an adjusted hazard ratio of 0.54 (95% CI 0.30 to 0.90, p=0.026) for the composite of cardiovascular death, death from any cause, heart attack, stroke or revascularisation. Because the glucose control was matched, the difference is not explained by glycaemia. It is one small trial in one country and it has not been replicated, which is a real limitation and also the reason it stands out: nothing else has tested the question.',
      },
      {
        q: 'Is glipizide safer than glyburide?',
        a: 'On hypoglycaemia, the observational evidence consistently says yes. In 13,963 Medicaid enrollees aged 65 and over, serious hypoglycaemia occurred at 16.6 episodes per 1,000 person-years on glyburide against a materially lower rate on glipizide, giving an adjusted relative risk of 1.9 (95% CI 1.2 to 2.9) for glyburide, and the gap persisted in every stratum including dose and duration. A meta-analysis of 21 randomised trials found glyburide carried an 83% greater risk of at least one hypoglycaemic episode than other sulfonylureas. Neither of those is a randomised head-to-head comparison of the two drugs for that outcome, so the direction is well supported and the magnitude is not precisely established.',
      },
      {
        q: 'Does it stop working?',
        a: 'The label says so in its own words: "Some patients fail to respond initially, or gradually lose their responsiveness to sulfonylurea drugs, including glipizide." The mechanism explains why. Glipizide does not make the pancreas produce more insulin; it forces the existing beta cells to release what they have. Type 2 diabetes involves progressive loss of those cells, so the lever gets shorter over time. UKPDS documented this drift across a decade of follow-up in nearly four thousand patients.',
      },
      {
        q: 'Does this page show what the drug costs to make?',
        a: 'No, because no verifiable per-dose cost-of-production figure for glipizide could be found and cited. The figure shown is what United States pharmacies pay to acquire it — US$0.0464 per tablet, the median across 75 listed generic products in the CMS National Average Drug Acquisition Cost survey. That is a price, not a manufacturing cost. At under five cents a tablet the two numbers are unlikely to be far apart, but this page does not know that and will not assert it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Hong J, Zhang Y, Lai S et al. Effects of metformin versus glipizide on cardiovascular outcomes in patients with type 2 diabetes and coronary artery disease (SPREAD-DIMCAD). Diabetes Care 2013;36:1304-1311',
        identifier: '10.2337/dc12-0719',
        kind: 'doi',
      },
      {
        label:
          'UK Prospective Diabetes Study (UKPDS) Group. Intensive blood-glucose control with sulphonylureas or insulin compared with conventional treatment and risk of complications in patients with type 2 diabetes (UKPDS 33). Lancet 1998;352:837-853',
        identifier: '9742976',
        kind: 'pmid',
      },
      {
        label:
          'Shorr RI, Ray WA, Daugherty JR, Griffin MR. Individual sulfonylureas and serious hypoglycemia in older people. J Am Geriatr Soc 1996;44:751-755',
        identifier: '10.1111/j.1532-5415.1996.tb03729.x',
        kind: 'doi',
      },
      {
        label:
          'Gangji AS, Cukierman T, Gerstein HC, Goldsmith CH, Clase CM. A systematic review and meta-analysis of hypoglycemia and cardiovascular events: a comparison of glyburide with other secretagogues and with insulin. Diabetes Care 2007;30:389-394',
        identifier: '10.2337/dc06-1789',
        kind: 'doi',
      },
      {
        label:
          'FDA prescribing information for glipizide tablets USP — WARNINGS (Special Warning on Increased Risk of Cardiovascular Mortality) and CLINICAL PHARMACOLOGY',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22glipizide%22',
        kind: 'regulatory',
      },
      {
        label:
          'FDA prescribing information for GLUCOTROL XL (glipizide) extended-release tablets — section 11 Description (osmotic push-pull system) and sections 12.1 to 12.3',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22GLUCOTROL+XL%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3478 — glipizide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3478',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Glyburide — the sulfonylurea with the most hypoglycaemia, dropped from pregnancy care after
  //    a 2,509-woman meta-analysis reversed the trial that put it there, and simultaneously the
  //    single most effective drug in medicine for a rare form of diabetes diagnosed in babies.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'glyburide',
    name: 'Glyburide',
    tradeName: 'Diabeta / Micronase / Glynase PresTab (glibenclamide outside the United States)',
    sponsor: 'Pfizer (Upjohn and Pharmacia originators); marketed almost entirely as generics',
    targetGene: 'ABCC8',
    targetProtein:
      'Sulfonylurea receptor 1 (SUR1) with the Kir6.2 pore (KCNJ11) on the pancreatic beta cell, and — unlike the more selective sulfonylureas — the SUR2A and SUR2B receptors of cardiac and vascular smooth muscle',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1984,
    indication:
      'As an adjunct to diet and exercise to improve glycaemic control in adults with type 2 diabetes mellitus.',
    patientFriendlyIndication: 'Type 2 diabetes — the strongest and longest-acting of the old sulfonylurea tablets',
    anatomicalSite:
      'Pancreatic islet beta cell plasma membrane, and the ATP-sensitive potassium channels of cardiac and vascular smooth muscle',
    conditionContext: {
      conditionExplainer:
        'Sulfonylureas force the pancreas to release insulin by chemically shutting a potassium channel that normally only shuts when blood sugar is high. Glyburide does this more potently and for longer than the others in its class, and its breakdown products keep doing it.',
      whyItMatters:
        'Potency and duration are not free. The measured consequence, across a randomised meta-analysis and a 13,963-person cohort, is more hypoglycaemia than any other second-generation sulfonylurea — and hypoglycaemia in an older person is a fall, a fracture, a hospital admission or a death.',
      whoTakesThis:
        'Adults with type 2 diabetes, usually after metformin, and disproportionately those for whom price is the binding constraint. Its use in pregnancy has fallen sharply since 2015. In a rare genetic form of diabetes diagnosed before six months of age it is the treatment of choice.',
      clinicalGoals:
        'Lower HbA1c. The label itself states that no clinical study has established conclusive evidence of macrovascular risk reduction with glyburide or any other antidiabetic drug.',
    },
    oneSentenceVerdict:
      'The most potent and longest-acting of the second-generation sulfonylureas, which closes the beta-cell potassium channel to force insulin release and produces 83% more hypoglycaemia than other sulfonylureas across 21 randomised trials — a drug that a 2,509-woman meta-analysis concluded should not be used in gestational diabetes if insulin or metformin is available, and that simultaneously allowed 44 of 49 patients with Kir6.2 neonatal diabetes to stop insulin altogether.',
    laymanHowItWorks:
      'Insulin-producing cells sit quietly because potassium leaks out of them through an open gate. When blood sugar rises the cell burns it, the gate shuts, and insulin is released. Glyburide jams that gate shut chemically, so insulin comes out whether or not there is sugar to justify it. It grips harder and stays longer than the other drugs of its type, and the liver turns it into breakdown products that do the same thing.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 52,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0668 per tablet at United States pharmacy acquisition cost, the median across 30 listed generic products in the CMS NADAC survey effective 19 August 2026',
      markupEstimate: '',
      openPatentNotes:
        'Long off patent and available as generics from many manufacturers. Two particle sizes are marketed and they are not interchangeable milligram for milligram: the conventional tablet and the micronised presentation sold as Glynase PresTab differ in bioavailability, which is a substitution hazard rather than a therapeutic distinction.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Within its own class, glyburide is the one with the worst measured hypoglycaemia record: 83% more than other sulfonylureas across 21 randomised trials, and 1.9 times the serious-hypoglycaemia risk of glipizide in a 13,963-person cohort of older adults. In pregnancy the comparison is settled against it — a meta-analysis of 15 randomised trials in 2,509 women found more macrosomia and more neonatal hypoglycaemia than insulin, and concluded it should not be used where insulin or metformin is available. In Kir6.2 neonatal diabetes there is no substitute for it, and insulin is the worse option.',
      conventionalRx: [
        {
          name: 'Metformin',
          class: 'Biguanide',
          howItCompares:
            'Does not force insulin release, so it does not cause hypoglycaemia on its own. In gestational diabetes the network of randomised comparisons puts metformin ahead of glyburide on birth weight (mean difference -209 g, 95% CI -314 to -104), macrosomia (risk ratio 0.33, 95% CI 0.13 to 0.81) and large-for-gestational-age newborns (risk ratio 0.44, 95% CI 0.21 to 0.92), though treatment failure requiring escalation was more common with metformin.',
          typicalCost: 'Comparable — both are among the cheapest oral drugs available',
          prosAndCons:
            'Pros: no hypoglycaemia alone, no weight gain, better fetal outcomes than glyburide. Cons: gastrointestinal intolerance, contraindicated at low kidney function, and more treatment failures in gestational diabetes.',
        },
        {
          name: 'Glipizide',
          class: 'Second-generation sulfonylurea',
          howItCompares:
            'Same mechanism, shorter duration, no active metabolites, and measurably less hypoglycaemia. In 13,963 Medicaid enrollees aged 65 or over, the adjusted relative risk of serious hypoglycaemia for glyburide against glipizide was 1.9 (95% CI 1.2 to 2.9), and the excess held in every stratum including dose and duration of use.',
          typicalCost: 'US$0.0464 per tablet at NADAC, marginally cheaper than glyburide',
          prosAndCons:
            'Pros: less hypoglycaemia at comparable glucose control, elimination half-life of 2 to 4 hours rather than a 24-hour tail. Cons: shares every class-level limitation, including the same 1970 label warning.',
        },
        {
          name: 'Insulin (in gestational diabetes)',
          class: 'Injected hormone replacement',
          howItCompares:
            'The comparator that glyburide was introduced to replace and that the evidence has now returned to. Against insulin in 2,509 randomised women, glibenclamide produced 109 g more birth weight (95% CI 35.9 to 181), 2.62 times the macrosomia (95% CI 1.35 to 5.08) and 2.04 times the neonatal hypoglycaemia (95% CI 1.30 to 3.20).',
          typicalCost: 'Substantially more expensive and requires injection and monitoring',
          prosAndCons:
            'Pros: does not cross the placenta in meaningful amounts, and the fetal outcomes are better. Cons: injections, cost, and maternal hypoglycaemia risk of its own.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Treat a missed meal on this drug as an event, not an inconvenience',
          action:
            'Glyburide peaks about four hours after a dose and is still measurable at twenty-four, and its liver breakdown products remain active. A skipped meal, alcohol or a long walk is therefore a longer exposure than on a shorter-acting sulfonylurea.',
          patientImpact:
            'In 13,963 Medicaid enrollees aged 65 and over, serious hypoglycaemia — hospitalisation, emergency admission or death with a measured blood glucose below 50 mg/dL — occurred at 16.6 episodes per 1,000 person-years on glyburide, the highest rate of the six sulfonylureas studied. The label states that hypoglycaemia may be difficult to recognise in the elderly and in people taking beta-blockers.',
          clinicalPrecaution:
            'Any change to a diabetes regimen, including for fasting, illness or a change in kidney function, belongs with the prescribing clinician. Renal impairment raises glyburide levels because its active metabolites are cleared by the kidney. This page gives no dosing guidance of any kind.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'COC1=C(C=C(C=C1)Cl)C(=O)NCCC2=CC=C(C=C2)S(=O)(=O)NC(=O)NC3CCCCC3',
      chemicalFormula: 'C23H28ClN3O5S',
      molecularWeight: '494.00 g/mol',
      targetReceptorAffinity:
        'Binds the sulfonylurea receptor with higher affinity and slower dissociation than glipizide or tolbutamide, and — distinctively within the class — is not selective for the pancreatic SUR1 isoform over the SUR2A and SUR2B isoforms found in cardiac and vascular smooth muscle. The FDA label reports significant absorption within one hour, peak levels at about four hours and low but detectable levels at twenty-four hours, and states that "the mechanism by which glyburide lowers blood glucose during long-term administration has not been clearly established". Hepatic metabolism yields hydroxylated products that retain hypoglycaemic activity and are cleared renally.',
      structureSource: {
        label:
          'PubChem CID 3488 (glyburide) — SMILES, molecular formula and weight, re-checked against the PUG REST property endpoint and matched to the FDA label description section (molecular weight 493.99)',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3488',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'gly-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the chlorinated methoxybenzamide fragment',
          description:
            'Confirm the identity and purity of 5-chloro-2-methoxybenzoic acid or its acyl chloride, 4-(2-aminoethyl)benzenesulfonamide and cyclohexyl isocyanate. The chloro-methoxy benzamide head is what distinguishes glyburide from glipizide, and it is the fragment responsible for the higher receptor affinity and the loss of SUR1 selectivity — an incorrect halogen position changes the pharmacology, not just the assay.',
          reagentsAndBuffer:
            'Reference standards, nuclear magnetic resonance and infrared identity, chloride content by ion chromatography, Karl Fischer water determination, residual solvent screening by headspace gas chromatography',
        },
        {
          id: 'gly-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Benzamide coupling then sulfonylurea closure',
          description:
            'Acylate the aminoethyl side chain of the benzenesulfonamide with the chlorinated methoxybenzoyl group, then react the sulfonamide nitrogen with cyclohexyl isocyanate to form the sulfonylurea bridge. Both steps are ordinary condensation chemistry and are the reason a tablet costs under seven cents.',
          dependsOnStepId: 'gly-w1',
          reagentsAndBuffer:
            'Acyl chloride or carbodiimide activation, triethylamine base, cyclohexyl isocyanate, anhydrous acetone or toluene, controlled-temperature jacketed reactor with inert-gas blanket',
        },
        {
          id: 'gly-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Base-acid reprecipitation and controlled particle-size reduction',
          description:
            'Reprecipitate from dilute alkali by acidification and recrystallise, then mill to the specified particle size. Particle size is not a cosmetic specification here: glyburide is practically insoluble in water, its dissolution is the rate-limiting step of absorption, and the micronised presentation is not bioequivalent to the conventional tablet at the same milligram strength. Two different products with the same generic name and different bioavailability is a dispensing hazard created at this step.',
          dependsOnStepId: 'gly-w2',
          reagentsAndBuffer:
            'Dilute sodium hydroxide, dilute hydrochloric acid, ethanol-water recrystallisation, jet mill or air classifier, laser diffraction particle-size analysis, reversed-phase HPLC with ultraviolet detection',
        },
        {
          id: 'gly-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Dissolution profiling and placental transfer modelling',
          description:
            'Run comparative dissolution across the marketed particle sizes, and characterise transfer across a placental barrier model. The placental question is specific to this molecule: the 404-woman trial that established glyburide in gestational diabetes reported that the drug was not detected in the cord serum of any infant, and the meta-analysis that displaced it fifteen years later found worse fetal outcomes anyway.',
          dependsOnStepId: 'gly-w3',
          reagentsAndBuffer:
            'USP apparatus 2 dissolution in phosphate buffer with surfactant, biorelevant fasted and fed simulated intestinal fluids, BeWo trophoblast monolayers or ex vivo perfused placental cotyledon, liquid chromatography with tandem mass spectrometry at low nanogram sensitivity',
        },
        {
          id: 'gly-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'SUR1 against SUR2A and SUR2B selectivity, and metabolite activity',
          description:
            'Measure binding and channel block at the pancreatic SUR1/Kir6.2 channel and at the cardiac SUR2A/Kir6.2 and vascular SUR2B/Kir6.1 channels in the same experiment, and repeat the panel for the hydroxylated metabolites. Non-selectivity is the mechanistic distinction of this molecule, and metabolite activity is the reason renal impairment prolongs its effect; neither can be inferred from the parent compound alone.',
          dependsOnStepId: 'gly-w4',
          reagentsAndBuffer:
            'HEK293 cells co-transfected with SUR1/Kir6.2, SUR2A/Kir6.2 and SUR2B/Kir6.1, tritiated glibenclamide for competition binding, inside-out patch clamp with ATP-free intracellular solution, synthesised 4-trans-hydroxy and 3-cis-hydroxy metabolite standards',
        },
      ],
    },
    keyAudits: [
      {
        id: 'gly-a1',
        category: 'measured',
        title: 'Across 21 randomised trials it caused 83% more hypoglycaemia than its own class',
        laymanSummary:
          'Someone gathered every randomised trial that compared glyburide directly against another drug that squeezes insulin out of the pancreas, and counted low blood sugar episodes. Glyburide caused about half again as many as the comparators, and nearly twice as many as other sulfonylureas.',
        technicalDetails:
          'Gangji and colleagues searched Medline, Embase, Cochrane and three trial registers from 1966 to 2005, reviewed 1,806 titles in duplicate and identified 21 parallel randomised trials of glyburide monotherapy against another secretagogue or insulin in type 2 diabetes. Glyburide carried a 52% greater risk of at least one hypoglycaemic episode than other secretagogues (relative risk 1.52, 95% CI 1.21 to 1.92) and an 83% greater risk than other sulfonylureas (1.83, 95% CI 1.35 to 2.49). It was not associated with an increased risk of cardiovascular events (0.84, 95% CI 0.56 to 1.26), death (0.87, 95% CI 0.70 to 1.07) or end-of-trial weight (weighted mean difference 1.69 kg, 95% CI -0.41 to 3.80). The authors record that reporting in the original trials was suboptimal, loss to follow-up exceeded 20% in some, and major hypoglycaemia specifically was infrequently reported — so the excess is established for hypoglycaemia in general and is imprecise for the severe episodes that matter most.',
        evidenceSource: 'Gangji AS, Cukierman T, Gerstein HC, Goldsmith CH, Clase CM. Diabetes Care 2007;30:389-394',
        doi: '10.2337/dc06-1789',
        measuredMetric:
          'Relative risk of at least one hypoglycaemic episode, cardiovascular events, death and weight, glyburide against other secretagogues and other sulfonylureas',
        auditFlag: 'verified',
      },
      {
        id: 'gly-a2',
        category: 'measured',
        title: 'It had the highest serious-hypoglycaemia rate of six sulfonylureas in older adults',
        laymanSummary:
          'A study of nearly 14,000 people over 65 counted episodes of low blood sugar severe enough to require a hospital. Glyburide had the highest rate of the six drugs examined, at about five times the rate of the lowest.',
        technicalDetails:
          'Shorr and colleagues followed 13,963 Tennessee Medicaid enrollees aged 65 or over prescribed one of six sulfonylureas between 1985 and 1989, identifying 255 first episodes of serious hypoglycaemia — hospitalisation, emergency admission or death with neuroglycopenic or autonomic symptoms and a concomitant blood glucose below 2.8 mmol/L — during 20,715 person-years of use. The crude rate per 1,000 person-years was 16.6 for glyburide (95% CI 13.2 to 19.9), the highest of the six, against 3.5 for tolbutamide (95% CI 1.2 to 5.9), the lowest. Glyburide users did not differ from chlorpropamide users, historically the class outlier for hypoglycaemia. Among second-generation agents the adjusted relative risk for glyburide against glipizide was 1.9 (95% CI 1.2 to 2.9), holding in every stratum defined by gender, race, nursing-home residence, dose and duration. This is an observational cohort and prescribing was not randomised.',
        evidenceSource: 'Shorr RI, Ray WA, Daugherty JR, Griffin MR. J Am Geriatr Soc 1996;44:751-755',
        doi: '10.1111/j.1532-5415.1996.tb03729.x',
        measuredMetric:
          'Crude serious-hypoglycaemia rate per 1,000 person-years by individual sulfonylurea, and adjusted relative risk against glipizide, in adults aged 65 and over',
        auditFlag: 'verified',
      },
      {
        id: 'gly-a3',
        category: 'conclusion_shift',
        title: 'A 404-woman trial made it standard in pregnancy; a 2,509-woman analysis reversed that',
        laymanSummary:
          'In 2000 a randomised trial concluded glyburide was a clinically effective alternative to insulin in gestational diabetes, and it became widely used. In 2015 a pooled analysis of fifteen randomised trials found babies born heavier, more than twice as much macrosomia and twice as much newborn low blood sugar, and concluded the drug should not be used if insulin or metformin was available.',
        technicalDetails:
          'Langer and colleagues randomised 404 women with singleton pregnancies and gestational diabetes requiring treatment, between 11 and 33 weeks, to glyburide or insulin. Mean blood glucose during treatment was 105 mg/dL in both arms (p=0.99); 8 women on glyburide (4%) required insulin; there were no significant differences in large-for-gestational-age infants (12% against 13%), macrosomia (7% against 4%), lung complications, neonatal hypoglycaemia (9% against 6%), NICU admission or fetal anomalies, and glyburide was not detected in the cord serum of any infant. The authors concluded glyburide was a clinically effective alternative. Balsells and colleagues then pooled 15 randomised articles totalling 2,509 subjects, searched to May 2014. Against insulin, glibenclamide produced a mean birth weight difference of 109 g (95% CI 35.9 to 181), a macrosomia risk ratio of 2.62 (95% CI 1.35 to 5.08) and a neonatal hypoglycaemia risk ratio of 2.04 (95% CI 1.30 to 3.20). Against metformin it produced 209 g more birth weight, 3.0 times the macrosomia and 2.3 times the large-for-gestational-age rate. Their conclusion is unambiguous: "glibenclamide is clearly inferior to both insulin and metformin", and it "should not be used for the treatment of women with gestational diabetes if insulin or metformin is available."',
        evidenceSource:
          'Langer O et al., N Engl J Med 2000;343:1134-1138; Balsells M et al., BMJ 2015;350:h102 (registration NCT01998113)',
        doi: '10.1136/bmj.h102',
        measuredMetric:
          'Mean birth weight difference, macrosomia risk ratio and neonatal hypoglycaemia risk ratio against insulin, pooled across 15 randomised trials in 2,509 women',
        auditFlag: 'contested',
      },
      {
        id: 'gly-a4',
        category: 'conclusion_shift',
        title: 'In babies with a specific channel mutation, it replaced insulin entirely',
        laymanSummary:
          'Diabetes diagnosed before six months of age is usually caused by a mutation that jams the same potassium gate this drug closes, permanently open. Of 49 patients switched from insulin to a sulfonylurea, 44 stopped insulin altogether and their average blood sugar improved.',
        technicalDetails:
          'Heterozygous activating mutations in KCNJ11, which encodes the Kir6.2 subunit of the ATP-sensitive potassium channel, cause 30 to 58% of diabetes diagnosed under six months of age. The channel fails to close in response to rising intracellular ATP, so glucose cannot trigger insulin release. Sulfonylureas close the channel by an ATP-independent route, which is precisely the step the mutation has broken. Pearson and colleagues assessed 49 consecutive patients with Kir6.2 mutations given appropriate sulfonylurea doses: 44 (90%) successfully discontinued insulin. HbA1c fell from 8.1% before treatment to 6.4% after 12 weeks (p<0.001), and the improvement was sustained at one year. The extent of tolbutamide blockade of mutant channels in Xenopus oocytes predicted the response seen in patients. Insulin secretion was more strongly stimulated by oral glucose or a mixed meal than by intravenous glucose, and exogenous glucagon increased insulin secretion only in the presence of sulfonylureas.',
        evidenceSource:
          'Pearson ER et al., N Engl J Med 2006;355:467-477, Neonatal Diabetes International Collaborative Group (NCT00334711)',
        doi: '10.1056/NEJMoa061759',
        measuredMetric:
          'Proportion of patients discontinuing insulin, and change in HbA1c at 12 weeks and one year, in 49 consecutive patients with Kir6.2 mutations',
        auditFlag: 'verified',
      },
      {
        id: 'gly-a5',
        category: 'inferred',
        title: 'The label states no drug in this field has conclusively reduced macrovascular risk',
        laymanSummary:
          'The precautions section of the glyburide label says plainly that no clinical study has established conclusive evidence that this drug — or any diabetes drug — reduces the risk of heart attacks and strokes. That sentence has been on the label for decades.',
        technicalDetails:
          'The PRECAUTIONS section of the glyburide label opens: "Macrovascular Outcomes: There have been no clinical studies establishing conclusive evidence of macrovascular risk reduction with glyburide tablets or any other anti-diabetic drug." The same label carries the class-wide special warning on increased risk of cardiovascular mortality derived from the University Group Diabetes Program, an 823-patient trial of tolbutamide reported in 1970 and extended to the class by chemical analogy. The randomised evidence that exists is neutral rather than reassuring: the Gangji meta-analysis found a cardiovascular event risk ratio of 0.84 (95% CI 0.56 to 1.26) and a death risk ratio of 0.87 (95% CI 0.70 to 1.07) against other secretagogues, both compatible with no difference in either direction, from trials not designed or powered for those endpoints. Glyburide has never had a dedicated cardiovascular outcome trial.',
        evidenceSource:
          'FDA prescribing information for glyburide tablets USP, PRECAUTIONS (Macrovascular Outcomes) and WARNINGS; Gangji AS et al., Diabetes Care 2007;30:389-394',
        inferredClaim:
          'That lowering HbA1c with glyburide reduces heart attacks and strokes — the label states no study has conclusively established this for any antidiabetic drug, and the pooled randomised estimate straddles no effect',
        auditFlag: 'caution',
      },
      {
        id: 'gly-a6',
        category: 'failed',
        title: 'In UKPDS, glibenclamide doubled major hypoglycaemia and moved no hard endpoint',
        laymanSummary:
          'The largest and longest trial of tight control in type 2 diabetes used glibenclamide as one of its intensive treatments. It doubled the rate of severe low blood sugar against dietary management, prevented eye and kidney damage, and did not significantly reduce deaths.',
        technicalDetails:
          'UKPDS 33 randomised 3,867 newly diagnosed patients with type 2 diabetes to intensive control with a sulphonylurea (chlorpropamide, glibenclamide or glipizide) or insulin, or conventional dietary policy, and followed them a median of ten years. Median HbA1c was 7.0% intensive against 7.9% conventional. Major hypoglycaemic episodes per year were 0.7% on conventional treatment, 1.0% on chlorpropamide, 1.4% on glibenclamide and 1.8% on insulin. Intensive treatment reduced any diabetes-related endpoint by 12% (95% CI 1 to 21, p=0.029), driven by a 25% reduction in microvascular endpoints (95% CI 7 to 40, p=0.0099); diabetes-related death fell 10% (95% CI -11 to 27, p=0.34) and all-cause mortality 6% (95% CI -10 to 20, p=0.44), neither significant. There was no difference in the three aggregate endpoints between chlorpropamide, glibenclamide and insulin. Mean weight gain in the intensive group was 2.9 kg (p<0.001).',
        evidenceSource:
          'UK Prospective Diabetes Study (UKPDS) Group, Lancet 1998;352:837-853 (UKPDS 33, PMID 9742976)',
        doi: '10.1016/S0140-6736(98)07019-6',
        measuredMetric:
          'Annual rate of major hypoglycaemic episodes by agent, and relative risk reductions for aggregate diabetes-related endpoints and mortality at ten years',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed slowly, peaking at about four hours',
        laymanDesc:
          'The drug is practically insoluble in water, so how fast it dissolves decides how fast it works. Meaningful levels appear within an hour, peak around four, and are still detectable a full day later.',
        molecularDetail:
          'The label reports significant absorption within one hour, peak drug levels at about four hours and low but detectable levels at twenty-four hours. Dissolution is rate-limiting, which is why the micronised presentation is not bioequivalent to the conventional tablet milligram for milligram.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It grips the potassium gate harder than the other drugs in its class',
        laymanDesc:
          'Like every sulfonylurea it binds the handle sitting on the beta cell potassium gate. Unlike the others, it binds more tightly, lets go more slowly, and also grips the versions of that handle found in the heart and blood vessels.',
        molecularDetail:
          'Glyburide binds SUR1 with higher affinity and slower off-rate than glipizide or tolbutamide, and lacks the SUR1-over-SUR2 selectivity of the newer agents. The chloro-methoxybenzamide head group is responsible for both properties.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The gate shuts, the cell depolarises, calcium enters',
        laymanDesc:
          'With potassium no longer leaking out, charge builds inside the cell. Voltage-gated calcium channels open, calcium rushes in, and the stored packets of insulin fuse with the cell surface and empty.',
        molecularDetail:
          'Channel closure removes the resting potassium conductance and depolarises the beta cell toward the L-type calcium channel threshold. Rising cytosolic calcium triggers SNARE-mediated exocytosis of docked insulin granules — the same final step glucose metabolism normally reaches by raising the ATP-to-ADP ratio.',
        iconName: 'Zap',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The liver makes breakdown products that do the same thing',
        laymanDesc:
          'Most drugs are switched off by the liver. Glyburide is converted into hydroxylated products that still lower blood sugar, and the kidney has to clear them. If kidney function is poor they build up.',
        molecularDetail:
          'Hepatic hydroxylation yields 4-trans-hydroxy and 3-cis-hydroxy metabolites that retain hypoglycaemic activity and depend on renal elimination. The label warns that renal or hepatic insufficiency may cause elevated glyburide levels and that hepatic impairment additionally reduces gluconeogenic capacity — two independent routes to the same event.',
        iconName: 'Recycle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Blood sugar falls, and keeps falling for longer than on other sulfonylureas',
        laymanDesc:
          'Insulin drives glucose into muscle and fat and shuts the liver down. Because the release was not conditional on blood sugar and the drug lingers, the fall continues past the point where it is useful.',
        molecularDetail:
          'This is the mechanistic origin of the measured excess: 83% more hypoglycaemia than other sulfonylureas across 21 randomised trials, and 16.6 serious episodes per 1,000 person-years in adults over 65 — the highest of six agents compared in the same cohort.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'In one rare disease, this exact mechanism is the cure',
        laymanDesc:
          'Some babies are born with a mutation that jams that potassium gate permanently open, so glucose can never trigger insulin. A drug that shuts the gate chemically bypasses the broken switch entirely.',
        molecularDetail:
          'Activating KCNJ11 mutations prevent ATP-dependent channel closure, which is why the affected beta cell cannot respond to glucose. Sulfonylureas close the channel by an ATP-independent route. In 49 consecutive patients, 44 discontinued insulin and HbA1c fell from 8.1% to 6.4% at 12 weeks. The degree of channel block measured in Xenopus oocytes predicted the clinical response.',
        iconName: 'Dna',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Balsells 2015 meta-analysis in gestational diabetes (NCT01998113)',
        phase: 'Systematic review and meta-analysis of 15 randomised controlled trials',
        sampleSize: 2509,
        primaryEndpoint:
          'Fourteen primary maternal and fetal outcomes comparing glibenclamide or metformin against insulin or against each other in gestational diabetes requiring drug treatment',
        endpointMet: false,
        statisticalPValue:
          'Against insulin: birth weight +109 g (95% CI 35.9 to 181); macrosomia risk ratio 2.62 (95% CI 1.35 to 5.08); neonatal hypoglycaemia risk ratio 2.04 (95% CI 1.30 to 3.20)',
        unreportedAdverseSignals:
          'The conclusion reverses the 404-woman randomised trial that established the practice: the reviewers state glibenclamide is clearly inferior to both insulin and metformin and should not be used where either is available.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Langer 2000 glyburide against insulin in gestational diabetes',
        phase: 'Randomised controlled trial, 11 to 33 weeks of gestation to delivery',
        sampleSize: 404,
        primaryEndpoint: 'Achievement of the desired level of glycaemic control',
        endpointMet: true,
        statisticalPValue:
          'Mean blood glucose during treatment 105 mg/dL in both arms (P = 0.99); no significant difference in any reported neonatal outcome',
        unreportedAdverseSignals:
          'Macrosomia was 7% against 4% and neonatal hypoglycaemia 9% against 6% — differences the trial was not powered to detect and which reached significance when pooled with fourteen later trials.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Pearson 2006 sulfonylurea transfer in Kir6.2 neonatal diabetes (NCT00334711)',
        phase: 'Prospective consecutive-series transfer study with in vitro channel assay, 1 year',
        sampleSize: 49,
        primaryEndpoint:
          'Glycaemic control after transfer from insulin to sulfonylurea in patients with KCNJ11 mutations',
        endpointMet: true,
        statisticalPValue:
          'P < 0.001 for a fall in HbA1c from 8.1% to 6.4% at 12 weeks; 44 of 49 patients (90%) discontinued insulin',
        unreportedAdverseSignals:
          'Not a randomised trial and not blinded; the authors describe safety as established only in the short term. Five patients did not come off insulin, and that subgroup is small.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'UKPDS 33, glibenclamide arm',
        phase: 'Randomised controlled trial of glycaemic policy, median 10 years',
        sampleSize: 3867,
        primaryEndpoint:
          'Any diabetes-related endpoint, diabetes-related death and all-cause mortality for intensive control against conventional dietary policy',
        endpointMet: true,
        statisticalPValue:
          'P = 0.029 for a 12% reduction in any diabetes-related endpoint; P = 0.0099 for a 25% reduction in microvascular endpoints; P = 0.34 and P = 0.44 for diabetes-related death and all-cause mortality',
        unreportedAdverseSignals:
          'Major hypoglycaemia was 1.4% per year on glibenclamide against 0.7% on conventional treatment. No macrovascular benefit was demonstrated.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'An 83% greater risk of at least one hypoglycaemic episode than other sulfonylureas across 21 randomised trials (RR 1.83, 95% CI 1.35 to 2.49)',
        'The highest serious-hypoglycaemia rate of six sulfonylureas in 13,963 adults aged 65 and over — 16.6 episodes per 1,000 person-years',
        'Against insulin in gestational diabetes: 109 g more birth weight, 2.62 times the macrosomia and 2.04 times the neonatal hypoglycaemia, pooled across 2,509 women',
        'In Kir6.2 neonatal diabetes: 44 of 49 patients discontinued insulin, with HbA1c falling from 8.1% to 6.4% at 12 weeks (p<0.001) and holding at one year',
      ],
      unsupportedInferences: [
        'That glyburide reduces heart attacks or strokes — its own label states no study has conclusively established macrovascular risk reduction for this or any antidiabetic drug',
        'That the absence of a cardiovascular signal in the meta-analysis is reassurance — the risk ratios of 0.84 for events and 0.87 for death come from trials not designed for those endpoints, with confidence intervals that include meaningful harm',
        'That undetectable cord-serum drug levels mean no fetal effect — the 2000 trial reported exactly that, and the pooled fetal outcomes fifteen years later were worse than insulin anyway',
        'That the micronised and conventional tablets are interchangeable milligram for milligram — they are not bioequivalent',
      ],
      whatFailedInitially: [
        'The gestational diabetes indication: a 404-woman randomised trial concluded glyburide was a clinically effective alternative to insulin, and a 15-trial meta-analysis in 2,509 women concluded it should not be used where insulin or metformin is available',
        'UKPDS 33 showed no significant reduction in diabetes-related death or all-cause mortality, at the cost of doubling major hypoglycaemia against dietary management',
        'The class-wide 1970 UGDP cardiovascular mortality warning still sits at the top of the label, unresolved by any trial of glyburide itself',
      ],
      realWorldOutcome: [
        'US$0.0668 per tablet at United States pharmacy acquisition cost, the median across 30 listed generic products in the CMS NADAC survey',
        'Use in pregnancy fell after 2015; use in type 2 diabetes persists, concentrated where price is the binding constraint',
        'It remains the treatment of choice for KCNJ11 and ABCC8 neonatal diabetes, a use discovered three decades after approval',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, in conventional and micronised particle-size presentations',
      description:
        'Glyburide is practically insoluble in water, so particle size determines how much reaches the blood. Two presentations are marketed with the same generic name and different bioavailability: a conventional tablet and a micronised tablet sold as Glynase PresTab. They are not interchangeable milligram for milligram, and confusing them is a substitution error rather than a therapeutic choice.',
      safetyProfile:
        'Hypoglycaemia is the defining risk, is mechanistic rather than idiosyncratic, and is measurably greater than for other sulfonylureas. Renal or hepatic impairment raises drug and active-metabolite levels; hepatic impairment separately reduces the capacity to make glucose. The label notes hypoglycaemia may be hard to recognise in older people and in those on beta-blockers, and is more likely with deficient calorie intake, prolonged exercise, alcohol or multiple glucose-lowering drugs. Weight gain occurs. A mild diuresis and rare disulfiram-like reactions are described on the label. The class-wide special warning on increased cardiovascular mortality, derived from the 1970 UGDP tolbutamide trial, applies.',
    },
    commonQuestions: [
      {
        q: 'Is glyburide worse than other sulfonylureas?',
        a: 'On hypoglycaemia, the measured answer is yes, and it has been measured twice by different methods. A meta-analysis of 21 randomised trials found an 83% greater risk of at least one hypoglycaemic episode than other sulfonylureas (RR 1.83, 95% CI 1.35 to 2.49). A cohort of 13,963 people aged 65 and over found the highest serious-hypoglycaemia rate of the six sulfonylureas studied, 16.6 episodes per 1,000 person-years, and an adjusted relative risk of 1.9 against glipizide that held in every subgroup. The mechanistic explanation is consistent: glyburide binds the receptor more tightly, releases it more slowly, is still detectable 24 hours after a dose, and its liver breakdown products remain active and depend on the kidney to clear them.',
        auditNote:
          'The same meta-analysis found no excess of cardiovascular events or death. Those confidence intervals are wide and the trials were not built to answer that question.',
      },
      {
        q: 'Why did doctors stop using it in pregnancy?',
        a: 'Because the evidence base grew and reversed. A 404-woman randomised trial published in 2000 found identical average blood glucose on glyburide and insulin, no significant difference in any neonatal outcome, and no glyburide detectable in cord serum, and concluded it was a clinically effective alternative. It became widely used on that basis. In 2015 a meta-analysis pooled fifteen randomised trials totalling 2,509 women and found that against insulin, glibenclamide produced 109 g more birth weight (95% CI 35.9 to 181), 2.62 times the macrosomia (95% CI 1.35 to 5.08) and 2.04 times the neonatal hypoglycaemia (95% CI 1.30 to 3.20). Its conclusion was that glibenclamide should not be used in gestational diabetes if insulin or metformin is available. The original trial was not wrong about what it measured; it was too small to detect the differences that mattered.',
      },
      {
        q: 'Why is an old, cheap tablet the best treatment for a rare kind of baby diabetes?',
        a: 'Because the mutation and the drug act on the same protein from opposite directions. Diabetes diagnosed before six months of age is often caused by an activating mutation in KCNJ11 or ABCC8, which leaves the beta cell potassium channel stuck open so that glucose can never trigger insulin release. Sulfonylureas close that channel by a route that does not need ATP, which bypasses the broken step entirely. In 49 consecutive patients switched from insulin, 44 came off insulin completely and average HbA1c fell from 8.1% to 6.4% within twelve weeks, sustained at a year. The degree to which each patient responded was predicted by how strongly the drug blocked the mutant channel of that patient in a frog-egg expression system.',
        auditNote:
          'This is a genotype-directed use in a rare monogenic disease. It says nothing about how the drug performs in ordinary type 2 diabetes.',
      },
      {
        q: 'Does glyburide prevent heart attacks?',
        a: 'No study has shown that, and the label says so. The precautions section states: "There have been no clinical studies establishing conclusive evidence of macrovascular risk reduction with glyburide tablets or any other anti-diabetic drug." The pooled randomised comparison against other secretagogues gave a cardiovascular event risk ratio of 0.84 with a confidence interval from 0.56 to 1.26, and a death risk ratio of 0.87 from 0.70 to 1.07 — both compatible with no difference in either direction, from trials that were not designed to answer the question. Glyburide has never had a dedicated cardiovascular outcome trial, and the 1970 warning that opens its label concerns a different drug.',
      },
      {
        q: 'Does this page show what the drug costs to make?',
        a: 'No, because no verifiable per-dose cost-of-production figure for glyburide could be found and cited. The figure shown is what United States pharmacies pay to acquire it — US$0.0668 per tablet, the median across 30 listed generic products in the CMS National Average Drug Acquisition Cost survey. That is a price, not a manufacturing cost, and this page will not guess at the difference.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Gangji AS, Cukierman T, Gerstein HC, Goldsmith CH, Clase CM. A systematic review and meta-analysis of hypoglycemia and cardiovascular events: a comparison of glyburide with other secretagogues and with insulin. Diabetes Care 2007;30:389-394',
        identifier: '10.2337/dc06-1789',
        kind: 'doi',
      },
      {
        label:
          'Shorr RI, Ray WA, Daugherty JR, Griffin MR. Individual sulfonylureas and serious hypoglycemia in older people. J Am Geriatr Soc 1996;44:751-755',
        identifier: '10.1111/j.1532-5415.1996.tb03729.x',
        kind: 'doi',
      },
      {
        label:
          'Balsells M, García-Patterson A, Solà I, Roqué M, Gich I, Corcoy R. Glibenclamide, metformin, and insulin for the treatment of gestational diabetes: a systematic review and meta-analysis. BMJ 2015;350:h102',
        identifier: '10.1136/bmj.h102',
        kind: 'doi',
      },
      {
        label:
          'Langer O, Conway DL, Berkus MD, Xenakis EM, Gonzales O. A comparison of glyburide and insulin in women with gestational diabetes mellitus. N Engl J Med 2000;343:1134-1138',
        identifier: '10.1056/NEJM200010193431601',
        kind: 'doi',
      },
      {
        label:
          'Pearson ER, Flechtner I, Njølstad PR et al. Switching from insulin to oral sulfonylureas in patients with diabetes due to Kir6.2 mutations. N Engl J Med 2006;355:467-477',
        identifier: '10.1056/NEJMoa061759',
        kind: 'doi',
      },
      {
        label:
          'Sulfonylurea Therapy in Patients With Permanent Neonatal Diabetes Due to Kir6.2 Mutations',
        identifier: 'NCT00334711',
        kind: 'nct',
      },
      {
        label:
          'UK Prospective Diabetes Study (UKPDS) Group. Intensive blood-glucose control with sulphonylureas or insulin compared with conventional treatment and risk of complications in patients with type 2 diabetes (UKPDS 33). Lancet 1998;352:837-853',
        identifier: '10.1016/S0140-6736(98)07019-6',
        kind: 'doi',
      },
      {
        label:
          'FDA prescribing information for glyburide tablets USP — CLINICAL PHARMACOLOGY, PRECAUTIONS (Macrovascular Outcomes, Hypoglycemia) and WARNINGS',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22glyburide%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3488 — glyburide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3488',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Glimepiride — the only sulfonylurea with a large cardiovascular outcome trial, which tested
  //    a competitor against it rather than it against placebo, and which lost the durability
  //    comparison in GRADE while producing the most severe hypoglycaemia of four arms.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'glimepiride',
    name: 'Glimepiride',
    tradeName: 'Amaryl',
    sponsor: 'Sanofi-Aventis US (originator, NDA 020496); marketed almost entirely as generics',
    targetGene: 'ABCC8',
    targetProtein:
      'Sulfonylurea receptor 1 (SUR1), the regulatory subunit of the ATP-sensitive potassium channel formed with the Kir6.2 pore (KCNJ11) in the pancreatic beta-cell membrane',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1995,
    indication:
      'As an adjunct to diet and exercise to improve glycaemic control in adults with type 2 diabetes mellitus. Not for treating type 1 diabetes mellitus or diabetic ketoacidosis.',
    patientFriendlyIndication: 'Type 2 diabetes — the sulfonylurea with the largest outcome trial behind it',
    anatomicalSite: 'Pancreatic islet beta cell plasma membrane',
    conditionContext: {
      conditionExplainer:
        'Glimepiride is the last sulfonylurea to reach the market, in 1995, and the only one for which someone eventually ran a six-year randomised trial with adjudicated heart attacks and strokes as the primary endpoint.',
      whyItMatters:
        'That trial, CAROLINA, is routinely described as having exonerated sulfonylureas of the cardiovascular concern that has sat on their labels since 1970. It did not have a placebo arm. What it showed is that a DPP-4 inhibitor was no better than glimepiride — which is a different statement, and the difference is the whole point of reading the design rather than the headline.',
      whoTakesThis:
        'Adults with type 2 diabetes, usually added to metformin. It costs under four cents a tablet and is one of the most-dispensed diabetes drugs in the world.',
      clinicalGoals:
        'Lower HbA1c and keep it down. In GRADE, the largest head-to-head comparison of second-line agents ever run, it did that less durably than insulin glargine or liraglutide and caused the most severe hypoglycaemia of the four arms.',
    },
    oneSentenceVerdict:
      'A sulfonylurea that closes the beta-cell ATP-sensitive potassium channel to force insulin release, lowering HbA1c by 1.8 percentage points against placebo in its 304-patient registration trial while adding 3.2 kg of weight — and the only drug of its class with a dedicated cardiovascular outcome trial, in which 37.7% of the 3,010 patients taking it had at least one hypoglycaemic event over 6.3 years against 10.6% on the comparator.',
    laymanHowItWorks:
      'Cells in the pancreas that make insulin stay quiet because potassium leaks out through an open channel. Rising blood sugar closes that channel and the cell releases insulin. Glimepiride closes it chemically instead, so insulin is released whether or not blood sugar is high. It works within two to three hours, is broken down by a liver enzyme into one product that still works and a second that does not, and it needs surviving beta cells to act on at all.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 62,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0373 per tablet at United States pharmacy acquisition cost, the median across 56 listed generic products in the CMS NADAC survey effective 19 August 2026',
      markupEstimate: '',
      openPatentNotes:
        'Approved as Amaryl under NDA 020496 on 30 November 1995 and long off patent. Fifty-six distinct generic products appear in the current NADAC file, which is why the median acquisition cost is under four cents a tablet — the cheapest drug in this file.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'GRADE is the comparison that answers this question, because it randomised 5,047 people already on metformin to glimepiride, insulin glargine, liraglutide or sitagliptin and followed them for five years. Glargine and liraglutide held HbA1c below 7.0% more durably than glimepiride; sitagliptin did worse than all three. Severe hypoglycaemia was rare in every arm but most frequent on glimepiride, at 2.2% against 0.7% on sitagliptin. Microvascular outcomes and death did not differ between the four. On price, nothing competes: glimepiride is under four cents a tablet and liraglutide is an injection costing orders of magnitude more.',
      conventionalRx: [
        {
          name: 'Insulin glargine U100',
          class: 'Long-acting insulin analogue',
          howItCompares:
            'In GRADE, the rate of failing to hold HbA1c below 7.0% was 26.5 per 100 participant-years on glargine against 30.4 on glimepiride, part of a global difference across four arms at p<0.001. Severe hypoglycaemia was 1.3% on glargine against 2.2% on glimepiride. Microvascular outcomes, MACE, heart-failure hospitalisation and death did not differ between the arms.',
          typicalCost: 'Substantially more expensive and requires injection',
          prosAndCons:
            'Pros: more durable glycaemic control and less severe hypoglycaemia than glimepiride in a five-year randomised comparison. Cons: injection, titration, cost, and weight gain of its own.',
        },
        {
          name: 'Liraglutide',
          class: 'GLP-1 receptor agonist',
          howItCompares:
            'Matched glargine on durability in GRADE (26.1 per 100 participant-years against 30.4 for glimepiride), had the lowest severe hypoglycaemia rate of the arms at 1.0%, and produced more weight loss. It was the only arm with a signal on any cardiovascular disease: hazard ratio 0.7 (95% CI 0.6 to 0.9) against the other three combined, in an analysis the authors state is not adjusted for multiple comparisons.',
          typicalCost: 'Injectable and among the most expensive options in type 2 diabetes',
          prosAndCons:
            'Pros: durability, weight loss, the only favourable cardiovascular signal in GRADE. Cons: gastrointestinal side effects were the most frequent of the four arms, injection, and cost.',
        },
        {
          name: 'Linagliptin',
          class: 'DPP-4 inhibitor',
          howItCompares:
            'The comparator in CAROLINA, the only large cardiovascular outcome trial involving a sulfonylurea. Over a median 6.3 years in 6,033 patients, the primary composite of cardiovascular death, non-fatal myocardial infarction and non-fatal stroke occurred in 11.8% on linagliptin and 12.0% on glimepiride — hazard ratio 0.98 (95.47% CI 0.84 to 1.14), meeting non-inferiority but not superiority (p=0.76). Hypoglycaemic adverse events occurred in 10.6% against 37.7%, hazard ratio 0.23 (95% CI 0.21 to 0.26).',
          typicalCost: 'Branded and far more expensive than glimepiride',
          prosAndCons:
            'Pros: roughly a quarter of the hypoglycaemia at equivalent cardiovascular outcomes. Cons: no cardiovascular benefit over glimepiride was demonstrated, and it is a great deal more expensive.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Say something before the first hypoglycaemic episode, not after',
          action:
            'Over a third of the people randomised to glimepiride in CAROLINA had at least one hypoglycaemic event across six years. Most were not severe; the pattern that precedes a severe one — episodes around missed meals, exercise or alcohol — is the information a clinician needs and the thing patients most often normalise and do not report.',
          patientImpact:
            'In CAROLINA, 1,132 of 3,010 patients on glimepiride (37.7%) had at least one hypoglycaemic adverse event, against 320 of 3,023 (10.6%) on linagliptin. In GRADE, severe hypoglycaemia — an episode needing another person to help — occurred in 2.2% of the glimepiride arm over five years, the highest of the four treatment groups.',
          clinicalPrecaution:
            'The label warns that impaired concentration and reaction from hypoglycaemia present a risk while driving or operating machinery, and that severe episodes can cause unconsciousness, convulsions, lasting brain injury or death. This page gives no dosing guidance of any kind.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCC1=C(CN(C1=O)C(=O)NCCC2=CC=C(C=C2)S(=O)(=O)NC(=O)NC3CCC(CC3)C)C',
      chemicalFormula: 'C24H34N4O5S',
      molecularWeight: '490.60 g/mol',
      targetReceptorAffinity:
        'Binds the sulfonylurea receptor in the beta-cell plasma membrane and closes the ATP-sensitive potassium channel, which the FDA label states in exactly those terms. Protein binding exceeds 99.5%. Peak concentrations occur 2 to 3 hours after a dose and time to minimum blood glucose in healthy subjects is the same 2 to 3 hours. Clearance is linear across the 1 mg to 8 mg range and there is no accumulation on repeated dosing. Metabolism is complete and oxidative: cytochrome P450 2C9 converts the parent to the cyclohexyl hydroxymethyl derivative M1, which in animals retains about one third of the pharmacological activity, and cytosolic enzymes convert M1 to the inactive carboxyl derivative M2.',
      structureSource: {
        label:
          'PubChem CID 3476 (glimepiride) — SMILES, molecular formula and weight, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3476',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'gli-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the pyrroline carboxamide and trans-methylcyclohexyl fragments',
          description:
            'Confirm the identity and stereochemistry of the 3-ethyl-4-methyl-2-oxo-3-pyrroline-1-carboxamide head and the trans-4-methylcyclohexylamine tail before coupling. The trans configuration of the methylcyclohexyl group is a specification, not a preference: the cis isomer is a different molecule with different receptor kinetics and is controlled as an impurity, not tolerated as an equivalent.',
          reagentsAndBuffer:
            'Reference standards, nuclear magnetic resonance with nuclear Overhauser measurements for cis/trans assignment, chiral and achiral HPLC, Karl Fischer water determination, residual solvent screening',
        },
        {
          id: 'gli-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amide coupling then sulfonylurea closure with the methylcyclohexyl isocyanate',
          description:
            'Acylate the aminoethyl side chain of 4-(2-aminoethyl)benzenesulfonamide with the pyrroline carboxylic acid derivative, then react the sulfonamide nitrogen with trans-4-methylcyclohexyl isocyanate to close the sulfonylurea bridge. The chemistry is the same two-step condensation as glipizide and glyburide; the fragments are what differ.',
          dependsOnStepId: 'gli-w1',
          reagentsAndBuffer:
            'Carbodiimide or mixed-anhydride activation, tertiary amine base, trans-4-methylcyclohexyl isocyanate, anhydrous acetonitrile or toluene, jacketed reactor under inert gas',
        },
        {
          id: 'gli-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation with cis-isomer and related-substance control',
          description:
            'Recrystallise to the specified polymorph while resolving the cis-methylcyclohexyl isomer and the uncyclised sulfonamide intermediate to below monograph limits. Glimepiride is practically insoluble in water, so polymorph and particle size govern dissolution and therefore the 2-to-3-hour time to peak that the label reports.',
          dependsOnStepId: 'gli-w2',
          reagentsAndBuffer:
            'Methanol-water or acetone-water recrystallisation, reversed-phase HPLC with ultraviolet detection, X-ray powder diffraction and differential scanning calorimetry for polymorph identity, laser diffraction particle sizing',
        },
        {
          id: 'gli-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Dissolution and CYP2C9 metabolite generation',
          description:
            'Run comparative dissolution in biorelevant media, then generate and quantify the M1 and M2 metabolites in human liver microsomes and hepatocytes. M1 is not an analytical curiosity: the label states it retains about a third of the pharmacological activity in animals, so the exposure that matters clinically is parent plus M1, and CYP2C9 genotype changes the ratio.',
          dependsOnStepId: 'gli-w3',
          reagentsAndBuffer:
            'USP apparatus 2 dissolution in phosphate buffer with surfactant, fasted and fed simulated intestinal fluids, pooled and CYP2C9-genotyped human liver microsomes, NADPH regenerating system, synthesised M1 and M2 reference standards, liquid chromatography with tandem mass spectrometry',
        },
        {
          id: 'gli-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Channel block, isoform selectivity and insulin secretion',
          description:
            'Measure block of the pancreatic SUR1/Kir6.2 channel by patch clamp, run the cardiac SUR2A and vascular SUR2B isoforms in the same experiment, and read glucose-stimulated insulin secretion from islets. Isoform selectivity is the mechanistic claim most often made for the newer sulfonylureas and least often measured alongside the clinical data, so it belongs in the same run rather than in a citation.',
          dependsOnStepId: 'gli-w4',
          reagentsAndBuffer:
            'HEK293 cells co-transfected with SUR1/Kir6.2, SUR2A/Kir6.2 and SUR2B/Kir6.1, inside-out excised patches with ATP-free intracellular solution, isolated rodent or human islets, static incubation at low and high glucose, insulin ELISA',
        },
      ],
    },
    keyAudits: [
      {
        id: 'gli-a1',
        category: 'measured',
        title: 'CAROLINA is the only large cardiovascular outcome trial of a sulfonylurea',
        laymanSummary:
          'Six thousand people with early type 2 diabetes and raised cardiovascular risk were randomly given glimepiride or a newer tablet, and followed for more than six years with heart attacks, strokes and cardiovascular deaths counted and adjudicated. The two arms came out the same.',
        technicalDetails:
          'CAROLINA (NCT01243424) randomised 6,042 adults at 607 sites in 43 countries — 6,033 treated and analysed — with type 2 diabetes, HbA1c 6.5% to 8.5% and elevated cardiovascular risk, to linagliptin 5 mg daily (n=3,023) or glimepiride 1 to 4 mg daily (n=3,010), double-blind, on top of usual care. Mean age was 64.0 years, mean HbA1c 7.2%, median diabetes duration 6.3 years, 42% had macrovascular disease and 59% were on metformin monotherapy. Over a median 6.3 years the primary composite of cardiovascular death, non-fatal myocardial infarction or non-fatal stroke occurred in 356 of 3,023 (11.8%) on linagliptin and 362 of 3,010 (12.0%) on glimepiride: hazard ratio 0.98 (95.47% CI 0.84 to 1.14), meeting the prespecified non-inferiority margin of 1.3 (p<0.001) but not superiority (p=0.76). Adjudicated acute pancreatitis occurred in 0.5% of each arm.',
        evidenceSource: 'Rosenstock J et al., JAMA 2019;322:1155-1166 (CAROLINA, NCT01243424)',
        doi: '10.1001/jama.2019.13772',
        measuredMetric:
          'Hazard ratio for adjudicated three-point MACE over a median 6.3 years, linagliptin against glimepiride, in 6,033 treated patients',
        auditFlag: 'verified',
      },
      {
        id: 'gli-a2',
        category: 'inferred',
        title: 'CAROLINA did not show glimepiride is cardiovascularly safe — it had no placebo arm',
        laymanSummary:
          'The trial is widely described as clearing sulfonylureas of the cardiovascular suspicion they have carried since 1970. It compared glimepiride against another active drug, not against nothing. Two treatments coming out equal does not establish that either one is harmless.',
        technicalDetails:
          'CAROLINA was designed as an active-controlled non-inferiority trial of linagliptin against glimepiride, with the stated objective of establishing that the upper bound of the two-sided 95.47% confidence interval for the hazard ratio of linagliptin relative to glimepiride was below 1.3. There was no placebo group and no untreated group. The conclusion the authors state is that linagliptin resulted in a non-inferior risk of a composite cardiovascular outcome — a statement about linagliptin. Reading the same result backwards as evidence that glimepiride does not increase cardiovascular risk requires assuming linagliptin itself is cardiovascularly neutral, which rests on separate placebo-controlled trials of linagliptin, and it exports a conclusion the trial was not designed to license. The label continues to carry both a warning on potential increased risk of cardiovascular mortality with sulfonylureas and the statement that no clinical study has established conclusive evidence of macrovascular risk reduction with glimepiride or any other antidiabetic drug.',
        evidenceSource:
          'Rosenstock J et al., JAMA 2019;322:1155-1166; FDA prescribing information for glimepiride tablets, sections 5.4 and 5.5',
        doi: '10.1001/jama.2019.13772',
        inferredClaim:
          'That CAROLINA proves sulfonylureas are cardiovascularly safe — the trial had no placebo arm, and its stated conclusion is about the comparator, not about glimepiride',
        auditFlag: 'caution',
      },
      {
        id: 'gli-a3',
        category: 'failed',
        title: 'Over a third of the glimepiride arm had a hypoglycaemic event across six years',
        laymanSummary:
          'In the same trial, 1,132 of the 3,010 people on glimepiride had at least one episode of low blood sugar. On the comparator it was 320 of 3,023. That is more than three times as many people affected.',
        technicalDetails:
          'At least one hypoglycaemic adverse event occurred in 320 of 3,023 participants (10.6%) in the linagliptin group and 1,132 of 3,010 (37.7%) in the glimepiride group, hazard ratio 0.23 (95% CI 0.21 to 0.26) for linagliptin against glimepiride. Overall adverse events were similar — 93.4% against 94.9% — so the difference is specific to hypoglycaemia rather than a general tolerability gap. In GRADE, run in a different population over five years, severe hypoglycaemia requiring assistance occurred in 2.2% of the glimepiride arm against 1.3% on insulin glargine, 1.0% on liraglutide and 0.7% on sitagliptin: rare in absolute terms, and significantly more frequent on glimepiride than on any of the three comparators, insulin included.',
        evidenceSource:
          'Rosenstock J et al., JAMA 2019;322:1155-1166 (CAROLINA); GRADE Study Research Group, N Engl J Med 2022;387:1063-1074 (NCT01794143)',
        doi: '10.1056/NEJMoa2200433',
        measuredMetric:
          'Proportion of participants with at least one hypoglycaemic adverse event over 6.3 years, and proportion with severe hypoglycaemia over 5 years by treatment arm',
        auditFlag: 'verified',
      },
      {
        id: 'gli-a4',
        category: 'failed',
        title: 'In GRADE it held blood sugar down less durably than glargine or liraglutide',
        laymanSummary:
          'The largest trial ever run of what to add after metformin gave 5,047 people one of four drugs and followed them for five years. Glimepiride lost control of blood sugar more often than insulin glargine or liraglutide, and less often than sitagliptin.',
        technicalDetails:
          'GRADE (NCT01794143) randomised 5,047 participants with type 2 diabetes of less than ten years duration, on metformin, with HbA1c 6.8% to 8.5%, to insulin glargine U-100, glimepiride, liraglutide or sitagliptin, and followed them a mean of 5.0 years. The primary metabolic outcome was a confirmed HbA1c of 7.0% or higher. Cumulative incidence differed significantly across the four groups (p<0.001 for the global test): 26.5 per 100 participant-years on glargine, 26.1 on liraglutide, 30.4 on glimepiride and 38.1 on sitagliptin. Differences on the secondary outcome of confirmed HbA1c above 7.5% paralleled the primary. There were no material differences across prespecified subgroups by sex, age or race and ethnicity, though among participants with higher baseline HbA1c glargine, liraglutide and glimepiride all appeared to do better than sitagliptin. The cohort was 19.8% Black and 18.6% Hispanic or Latinx.',
        evidenceSource:
          'GRADE Study Research Group; Nathan DM et al., N Engl J Med 2022;387:1063-1074 (NCT01794143)',
        doi: '10.1056/NEJMoa2200433',
        measuredMetric:
          'Cumulative incidence per 100 participant-years of a confirmed HbA1c of 7.0% or higher, by randomised second-line agent, over a mean 5.0 years',
        auditFlag: 'verified',
      },
      {
        id: 'gli-a5',
        category: 'measured',
        title: 'GRADE found no difference between the four drugs on complications or death',
        laymanSummary:
          'The same trial also counted kidney damage, nerve damage, heart attacks, heart failure and deaths. Across five years, the four drugs were indistinguishable on all of them. The only signal was a modest one favouring liraglutide on any cardiovascular disease.',
        technicalDetails:
          'Over a mean 5.0 years in 5,047 participants, GRADE found no material differences between glargine, glimepiride, liraglutide and sitagliptin in the development of hypertension or dyslipidaemia, or in microvascular outcomes: overall rates per 100 participant-years were 2.6 for moderately increased albuminuria, 1.1 for severely increased albuminuria, 2.9 for renal impairment and 16.7 for diabetic peripheral neuropathy. The groups did not differ on MACE (overall rate 1.0), hospitalisation for heart failure (0.4), cardiovascular death (0.3) or all deaths (0.6). Rates of any cardiovascular disease were 1.9, 1.9, 1.4 and 2.0 in the glargine, glimepiride, liraglutide and sitagliptin groups. Comparing each treatment against the combined other three, hazard ratios for any cardiovascular disease were 1.1 (95% CI 0.9 to 1.3) for glargine, 1.1 (95% CI 0.9 to 1.4) for glimepiride, 0.7 (95% CI 0.6 to 0.9) for liraglutide and 1.2 (95% CI 1.0 to 1.5) for sitagliptin. The authors state these confidence limits are not adjusted for multiple comparisons.',
        evidenceSource:
          'GRADE Study Research Group, N Engl J Med 2022;387:1075-1088 (NCT01794143)',
        doi: '10.1056/NEJMoa2200436',
        measuredMetric:
          'Event rates per 100 participant-years for microvascular outcomes, MACE, heart-failure hospitalisation and death, and unadjusted hazard ratios for any cardiovascular disease by arm',
        auditFlag: 'verified',
      },
      {
        id: 'gli-a6',
        category: 'measured',
        title: 'The registration trial measured a 1.8-point HbA1c effect and 3.2 kg of weight with it',
        laymanSummary:
          'The 14-week trial that got the drug approved took 304 people off their existing sulfonylurea, then gave them placebo or glimepiride. The placebo group got 1.5 percentage points worse. The 8 mg group got 0.4 points better, and gained about three kilograms more than the placebo group lost.',
        technicalDetails:
          'A 14-week multicentre randomised double-blind placebo-controlled trial enrolled 304 patients with type 2 diabetes already on sulfonylurea therapy, withdrew it, ran a three-week placebo washout, then randomised to placebo (n=74) or glimepiride 1 mg (n=78), 4 mg (n=76) or 8 mg (n=76). Baseline HbA1c was 7.9% to 8.0% across arms. Adjusted mean change from baseline was +1.5 percentage points on placebo, +0.3 on 1 mg, -0.3 on 4 mg and -0.4 on 8 mg; differences from placebo were -1.2 (95% CI -1.5 to -0.8, p<0.001), -1.8 (95% CI -2.1 to -1.4) and -1.8 (95% CI -2.2 to -1.5). Weight fell 2.3 kg on placebo and rose 1.0 kg on 8 mg, a difference from placebo of 3.2 kg (95% CI 2.5 to 4.0). Completion was 66% on placebo against 92% on 4 mg or 8 mg. The design matters to the number: much of the apparent effect size is deterioration in a placebo arm withdrawn from an active drug, not improvement on glimepiride, and the entire between-group HbA1c difference is bought with a 3.2 kg weight difference.',
        evidenceSource:
          'FDA prescribing information for glimepiride tablets, section 14.1 Monotherapy, Table 3',
        measuredMetric:
          'Adjusted mean change in HbA1c and body weight from baseline at 14 weeks by dose, with differences from placebo and 95% confidence intervals',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed and at peak within two to three hours',
        laymanDesc:
          'Blood levels peak two to three hours after a dose, and that is also when blood sugar hits its lowest point. Taking it with food shifts things only slightly.',
        molecularDetail:
          'Peak plasma concentration occurs 2 to 3 hours post-dose, and time to minimum blood glucose in healthy subjects is the same 2 to 3 hours. Food reduces mean peak concentration by 8% and exposure by 9%. Clearance is linear from 1 mg to 8 mg and there is no accumulation on repeated dosing. Protein binding exceeds 99.5%.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It binds the receptor sitting on the beta-cell potassium channel',
        laymanDesc:
          'On the surface of insulin-producing cells is a gate that lets potassium out, with a control protein attached. Glimepiride binds that control protein.',
        molecularDetail:
          'The label states the mechanism directly: sulfonylureas bind the sulfonylurea receptor in the pancreatic beta-cell plasma membrane, leading to closure of the ATP-sensitive potassium channel. The receptor is SUR1, an ABC-transporter-family protein encoded by ABCC8, assembled four-to-four with the Kir6.2 pore encoded by KCNJ11.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The channel shuts and the cell depolarises',
        laymanDesc:
          'With potassium no longer leaking out, positive charge accumulates inside. That voltage change is exactly what the cell normally waits for glucose to produce.',
        molecularDetail:
          'Channel closure removes the resting potassium conductance and depolarises the membrane toward the threshold for voltage-gated L-type calcium channels. Physiologically the trigger is a rising ATP-to-ADP ratio from glucose metabolism; here it is pharmacological and glucose-independent.',
        iconName: 'Zap',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Calcium enters and insulin granules empty',
        laymanDesc:
          'Calcium channels open, calcium floods the cell, and the packets of insulin already sitting at the membrane fuse with it and release their contents into the blood.',
        molecularDetail:
          'Rising cytosolic calcium triggers SNARE-mediated exocytosis of docked insulin granules. Because the drug supplies the depolarisation, secretion proceeds at normal and low glucose as well as high — the mechanistic origin of sulfonylurea hypoglycaemia.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The liver makes one product that still works and one that does not',
        laymanDesc:
          'A liver enzyme converts the drug into a first breakdown product that retains roughly a third of the activity, then a second enzyme converts that into an inactive one.',
        molecularDetail:
          'Metabolism is complete and oxidative. Cytochrome P450 2C9 converts glimepiride to the cyclohexyl hydroxymethyl derivative M1, which in animals possesses about one third of the pharmacological activity of the parent; cytosolic enzymes then convert M1 to the carboxyl derivative M2, which is inactive. CYP2C9 activity therefore shifts the active exposure, not just the clearance rate.',
        iconName: 'Recycle',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'HbA1c falls, weight rises, and the effect wears off over years',
        laymanDesc:
          'Average blood sugar comes down and stays down for a while. Weight goes up. Over five years the control slips faster than on insulin or a GLP-1 drug, because the drug depends on beta cells that are still being lost.',
        molecularDetail:
          'In the registration trial the 8 mg arm differed from placebo by -1.8 HbA1c percentage points and +3.2 kg. In GRADE, the rate of losing HbA1c control below 7.0% was 30.4 per 100 participant-years on glimepiride against 26.5 on insulin glargine and 26.1 on liraglutide, with severe hypoglycaemia at 2.2% against 1.3% and 1.0%.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CAROLINA (NCT01243424)',
        phase:
          'Randomised, double-blind, active-controlled non-inferiority cardiovascular outcome trial, median 6.3 years',
        sampleSize: 6033,
        primaryEndpoint:
          'Time to first cardiovascular death, non-fatal myocardial infarction or non-fatal stroke, linagliptin against glimepiride, non-inferiority margin 1.3',
        endpointMet: true,
        statisticalPValue:
          'P < 0.001 for non-inferiority; hazard ratio 0.98 (95.47% CI 0.84 to 1.14). Superiority not met (P = 0.76)',
        unreportedAdverseSignals:
          'There was no placebo arm, so the trial cannot establish that either drug is cardiovascularly neutral in absolute terms. At least one hypoglycaemic adverse event occurred in 37.7% of the glimepiride arm against 10.6% on linagliptin.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'GRADE — glycaemic outcomes (NCT01794143)',
        phase: 'Randomised comparative-effectiveness trial of four second-line agents, mean 5.0 years',
        sampleSize: 5047,
        primaryEndpoint:
          'Confirmed glycated haemoglobin of 7.0% or higher, comparing insulin glargine, glimepiride, liraglutide and sitagliptin added to metformin',
        endpointMet: false,
        statisticalPValue:
          'P < 0.001 for the global test across arms; 26.5, 26.1, 30.4 and 38.1 events per 100 participant-years for glargine, liraglutide, glimepiride and sitagliptin',
        unreportedAdverseSignals:
          'Severe hypoglycaemia was significantly more frequent on glimepiride (2.2%) than on glargine (1.3%), liraglutide (1.0%) or sitagliptin (0.7%) — more than on insulin.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'GRADE — microvascular and cardiovascular outcomes (NCT01794143)',
        phase: 'Prespecified secondary outcomes of the same randomised trial, mean 5.0 years',
        sampleSize: 5047,
        primaryEndpoint:
          'Albuminuria, renal impairment, peripheral neuropathy, MACE, heart-failure hospitalisation, any cardiovascular disease and death across the four arms',
        endpointMet: false,
        statisticalPValue:
          'No material differences on microvascular outcomes or death; hazard ratios against the combined other three arms for any cardiovascular disease were 1.1 (95% CI 0.9 to 1.4) for glimepiride and 0.7 (95% CI 0.6 to 0.9) for liraglutide',
        unreportedAdverseSignals:
          'The authors state the confidence limits are not adjusted for multiple comparisons, which applies to the liraglutide signal as much as to the rest.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Glimepiride 14-week placebo-controlled monotherapy registration trial',
        phase: 'Multicentre randomised double-blind placebo-controlled trial, 14 weeks',
        sampleSize: 304,
        primaryEndpoint: 'Change in HbA1c from baseline at 14 weeks against placebo',
        endpointMet: true,
        statisticalPValue:
          'P < 0.001 for the 1 mg arm; adjusted mean differences from placebo of -1.2 (95% CI -1.5 to -0.8), -1.8 (95% CI -2.1 to -1.4) and -1.8 (95% CI -2.2 to -1.5) percentage points at 1, 4 and 8 mg',
        unreportedAdverseSignals:
          'Patients were withdrawn from existing sulfonylurea therapy before randomisation, so the placebo arm deteriorated by 1.5 percentage points and supplies most of the between-group difference. Weight differed from placebo by 3.2 kg at 8 mg, and only 66% of the placebo arm completed against 92% on the higher doses.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A hazard ratio of 0.98 (95.47% CI 0.84 to 1.14) for three-point MACE, linagliptin against glimepiride, over a median 6.3 years in 6,033 patients',
        'At least one hypoglycaemic adverse event in 37.7% of the glimepiride arm against 10.6% of the comparator arm across the same 6.3 years',
        'A rate of 30.4 per 100 participant-years for losing HbA1c control below 7.0%, against 26.5 on insulin glargine and 26.1 on liraglutide, in 5,047 randomised patients over five years',
        'Severe hypoglycaemia in 2.2% of the glimepiride arm of GRADE, the highest of the four groups and higher than the insulin arm',
        'Adjusted mean HbA1c differences from placebo of -1.8 percentage points at 4 mg and 8 mg, with a 3.2 kg weight difference at 8 mg, in the 304-patient registration trial',
      ],
      unsupportedInferences: [
        'That CAROLINA established the cardiovascular safety of sulfonylureas — the trial had no placebo arm and its conclusion is a statement about linagliptin',
        'That glimepiride reduces macrovascular events — its label states no clinical study has conclusively established macrovascular risk reduction for this or any antidiabetic drug',
        'That the -1.8 percentage-point registration effect is what a person starting the drug should expect — the placebo arm had been withdrawn from an active sulfonylurea and deteriorated by 1.5 points',
        'That SUR1 selectivity translates into a clinical cardiovascular advantage over older sulfonylureas — that is a mechanistic argument, and no trial has compared glimepiride against glyburide or glipizide for cardiovascular outcomes',
      ],
      whatFailedInitially: [
        'Glimepiride was the least durable of the three effective arms in GRADE, and the only one whose severe hypoglycaemia rate exceeded insulin glargine',
        'CAROLINA met non-inferiority but not superiority (p=0.76), so no cardiovascular advantage was demonstrated in either direction',
        'The 1970 UGDP class warning survives on the label, in modern format as "Potential Increased Risk of Cardiovascular Mortality with Sulfonylureas", unresolved by the largest trial ever run in this class',
      ],
      realWorldOutcome: [
        'US$0.0373 per tablet at United States pharmacy acquisition cost, the median across 56 listed generic products in the CMS NADAC survey — the cheapest drug on this page',
        'On the WHO Model List of Essential Medicines as a therapeutic alternative within the sulfonylurea class',
        'The only sulfonylurea with a dedicated cardiovascular outcome trial, and the sulfonylurea most guidelines name when one is used at all',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, once daily, in 1 mg, 2 mg and 4 mg strengths',
      description:
        'A conventional immediate-release tablet of a practically water-insoluble sulfonylurea. Absorption is complete enough that food changes exposure by less than a tenth, and pharmacokinetics are linear across the marketed dose range with no accumulation. The drug is fully metabolised — nothing is excreted unchanged — through CYP2C9 to an active M1 metabolite and then to inactive M2.',
      safetyProfile:
        'Hypoglycaemia is the defining risk and can be severe: the label warns that impaired concentration and reaction may present a risk while driving or operating machinery, and that severe hypoglycaemia can cause unconsciousness, convulsions, temporary or permanent brain impairment, or death. Older patients and those with renal impairment are at higher risk. Weight gain is expected — 3.2 kg against placebo at the highest dose in the registration trial. Postmarketing hypersensitivity reports include anaphylaxis, angioedema and Stevens-Johnson syndrome. Haemolytic anaemia can occur in glucose-6-phosphate dehydrogenase deficiency, and the label suggests a non-sulfonylurea alternative in that setting. The label carries both a warning on potential increased cardiovascular mortality with sulfonylureas and a statement that no macrovascular benefit has been conclusively established for any antidiabetic drug.',
    },
    commonQuestions: [
      {
        q: 'Did CAROLINA prove sulfonylureas are safe for the heart?',
        a: 'It proved something narrower than that, and the difference matters. CAROLINA randomised 6,033 people with early type 2 diabetes and raised cardiovascular risk to linagliptin or glimepiride, double-blind, for a median 6.3 years, and counted adjudicated cardiovascular deaths, heart attacks and strokes. The rates were 11.8% and 12.0%, hazard ratio 0.98 with a 95.47% confidence interval from 0.84 to 1.14. There was no placebo arm. What the trial established is that linagliptin was not worse than glimepiride; reading it backwards to mean glimepiride is not worse than nothing requires assuming linagliptin is itself neutral, which comes from other trials. The FDA label still carries a warning on potential increased cardiovascular mortality with sulfonylureas.',
        auditNote:
          'A non-inferiority trial without a placebo arm bounds the difference between two treatments. It does not locate either of them relative to no treatment.',
      },
      {
        q: 'How much hypoglycaemia does it actually cause?',
        a: 'More than most people expect and less than the word implies. In CAROLINA, 1,132 of 3,010 people on glimepiride — 37.7% — had at least one hypoglycaemic adverse event over 6.3 years, against 10.6% on the comparator. Most of those episodes were mild. In GRADE, which counted severe episodes specifically, meaning ones needing another person to intervene, 2.2% of the glimepiride arm had one over five years, against 1.3% on insulin glargine, 1.0% on liraglutide and 0.7% on sitagliptin. So the severe rate is low in absolute terms, and it was still the highest of the four arms — higher than insulin.',
      },
      {
        q: 'Why does the drug seem to stop working?',
        a: 'Because it works by pushing on beta cells, and type 2 diabetes progressively destroys them. GRADE measured this directly: over five years the rate of losing control of HbA1c below 7.0% was 30.4 per 100 participant-years on glimepiride, against 26.5 on insulin glargine and 26.1 on liraglutide. Sitagliptin was worse still at 38.1. Injected insulin does not depend on surviving beta cells, which is the mechanistic reason it held up better. The same trial found no difference between any of the four drugs in kidney damage, nerve damage, heart attacks or deaths over those five years.',
      },
      {
        q: 'Why does the registration trial show such a large effect?',
        a: 'Because of how the placebo group was constructed. All 304 patients were already taking a sulfonylurea. They were taken off it, given three weeks of placebo washout, then randomised. Over the following 14 weeks the placebo arm got 1.5 percentage points worse, while the 8 mg glimepiride arm got 0.4 points better. The reported difference from placebo of 1.8 percentage points is therefore mostly the deterioration of people withdrawn from an active drug, not improvement on a new one. In the same table, the 8 mg arm ended 3.2 kg heavier than placebo, and only 66% of the placebo arm completed the trial against 92% of the higher-dose arms.',
        auditNote:
          'This is a withdrawal-design effect size. It is a real measurement and it is not the same quantity as the effect of starting the drug from untreated baseline.',
      },
      {
        q: 'Does this page show what the drug costs to make?',
        a: 'No, because no verifiable per-dose cost-of-production figure for glimepiride could be found and cited. The figure shown is what United States pharmacies pay to acquire it — US$0.0373 per tablet, the median across 56 listed generic products in the CMS National Average Drug Acquisition Cost survey. That is a price, not a manufacturing cost, and this page will not guess at the difference.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Rosenstock J, Kahn SE, Johansen OE et al. Effect of Linagliptin vs Glimepiride on Major Adverse Cardiovascular Outcomes in Patients With Type 2 Diabetes: The CAROLINA Randomized Clinical Trial. JAMA 2019;322:1155-1166',
        identifier: '10.1001/jama.2019.13772',
        kind: 'doi',
      },
      {
        label:
          'CAROLINA: Cardiovascular Outcome Study of Linagliptin Versus Glimepiride in Patients With Type 2 Diabetes',
        identifier: 'NCT01243424',
        kind: 'nct',
      },
      {
        label:
          'GRADE Study Research Group; Nathan DM, Lachin JM, Balasubramanyam A et al. Glycemia Reduction in Type 2 Diabetes — Glycemic Outcomes. N Engl J Med 2022;387:1063-1074',
        identifier: '10.1056/NEJMoa2200433',
        kind: 'doi',
      },
      {
        label:
          'GRADE Study Research Group. Glycemia Reduction in Type 2 Diabetes — Microvascular and Cardiovascular Outcomes. N Engl J Med 2022;387:1075-1088',
        identifier: '10.1056/NEJMoa2200436',
        kind: 'doi',
      },
      {
        label:
          'GRADE: Glycemia Reduction Approaches in Diabetes — A Comparative Effectiveness Study',
        identifier: 'NCT01794143',
        kind: 'nct',
      },
      {
        label:
          'FDA prescribing information for glimepiride tablets — sections 5.1 to 5.5, 12.1 to 12.3 and 14.1 with Table 3',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22glimepiride%22',
        kind: 'regulatory',
      },
      {
        label:
          'openFDA Drugs@FDA — NDA 020496 (AMARYL, Sanofi-Aventis US, original approval 30 November 1995)',
        identifier: 'https://api.fda.gov/drug/drugsfda.json?search=products.brand_name:%22AMARYL%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3476 — glimepiride structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3476',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Pioglitazone — a nuclear receptor drug that missed its own cardiovascular primary endpoint,
  //    is remembered for the secondary one, carries a boxed warning for heart failure, and had a
  //    bladder cancer restriction imposed in 2011 that a 193,099-person cohort later did not support.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'pioglitazone',
    name: 'Pioglitazone',
    tradeName: 'Actos',
    sponsor: 'Takeda Pharmaceuticals USA (originator, NDA 021073); marketed almost entirely as generics',
    targetGene: 'PPARG',
    targetProtein:
      'Peroxisome proliferator-activated receptor gamma (PPAR-gamma), a ligand-activated nuclear transcription factor that heterodimerises with the retinoid X receptor and binds PPAR response elements in adipose tissue, skeletal muscle and liver',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1999,
    indication:
      'As an adjunct to diet and exercise to improve glycaemic control in adults with type 2 diabetes mellitus. It exerts its antihyperglycaemic effect only in the presence of endogenous insulin and should not be used to treat type 1 diabetes or diabetic ketoacidosis.',
    patientFriendlyIndication: 'Type 2 diabetes — a tablet that makes the body respond to its own insulin',
    anatomicalSite:
      'Nuclei of adipocytes, skeletal muscle and hepatocytes; and the collecting duct of the kidney, where the same receptor drives the fluid retention',
    conditionContext: {
      conditionExplainer:
        'Most diabetes drugs push the pancreas to make more insulin or replace it. Pioglitazone does neither. It changes which genes fat cells transcribe, so that fat is stored where it belongs instead of in the liver and muscle, and the insulin already circulating starts working again.',
      whyItMatters:
        'That mechanism is slow — it takes weeks, because it acts through gene transcription — and it is not selective for the tissues you want. The same receptor in the kidney retains sodium, which is why this drug causes oedema and why it carries a boxed warning for congestive heart failure.',
      whoTakesThis:
        'Adults with type 2 diabetes and marked insulin resistance, usually after metformin. Use collapsed after 2011 when a bladder cancer restriction was added, and has partly recovered since the definitive cohort study reported.',
      clinicalGoals:
        'Lower HbA1c by restoring insulin sensitivity. Its own label states there is no conclusive evidence of macrovascular risk reduction with pioglitazone, and its cardiovascular outcome trial missed its primary endpoint.',
    },
    oneSentenceVerdict:
      'A nuclear receptor agonist that reprograms fat cells to restore insulin sensitivity rather than forcing insulin release — which missed its primary composite endpoint in a 5,238-patient cardiovascular outcome trial (HR 0.90, 95% CI 0.80 to 1.02, p=0.095) while hitting the secondary one (HR 0.84, 95% CI 0.72 to 0.98, p=0.027), reduced stroke and heart attack by 24% in 3,876 non-diabetic patients after a stroke, and does all of this at the cost of oedema, weight gain, fractures and a boxed warning for congestive heart failure.',
    laymanHowItWorks:
      'Fat cells decide what to do with fat by switching genes on and off, and a protein inside their nucleus makes that decision. Pioglitazone binds that protein and changes the decision: store fat in fat, not in liver and muscle. Once fat leaves the liver and muscle, the insulin the body already makes starts working again. Because the drug works by changing gene transcription rather than by blocking something, it takes weeks to show its full effect — and the same protein in the kidney tells the body to hold on to salt and water, which is where the swelling and the heart failure risk come from.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 61,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0903 per tablet at United States pharmacy acquisition cost, the median across 67 listed generic products in the CMS NADAC survey effective 19 August 2026',
      markupEstimate: '',
      openPatentNotes:
        'Approved as Actos under NDA 021073 on 15 July 1999 and long off patent; 67 distinct generic products appear in the current NADAC file. Rosiglitazone, the other thiazolidinedione marketed in the United States, was restricted in 2010 and its restrictions lifted in 2013 — the episode that made cardiovascular outcome trials mandatory for new diabetes drugs, and the reason PROactive exists.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Pioglitazone is the only insulin sensitiser other than metformin still on the United States market, and it does something no other oral diabetes drug does: it moves fat out of the liver. That is why it kept being tested in steatohepatitis, and why it failed the primary endpoint there too. Against the drugs it competes with in type 2 diabetes, its distinguishing features are a genuine cardiovascular signal in a non-diabetic stroke population, and a boxed warning for heart failure that none of the others carry.',
      conventionalRx: [
        {
          name: 'Metformin',
          class: 'Biguanide',
          howItCompares:
            'The other insulin sensitiser and the standard first drug. It does not cause fluid retention, weight gain, fractures or heart failure, and it has no boxed warning. It also does not clear fat from the liver the way a PPAR-gamma agonist does.',
          typicalCost: 'Comparable — both are inexpensive generics',
          prosAndCons:
            'Pros: no oedema, no heart failure warning, weight neutral or slightly favourable. Cons: gastrointestinal intolerance, contraindicated at low kidney function.',
        },
        {
          name: 'Vitamin E (in non-diabetic steatohepatitis specifically)',
          class: 'Antioxidant, 800 IU daily as studied',
          howItCompares:
            'In PIVENS, 247 adults with biopsy-proven non-alcoholic steatohepatitis and without diabetes were randomised to pioglitazone 30 mg, vitamin E 800 IU or placebo for 96 weeks. Vitamin E improved histology in 43% against 19% on placebo (p=0.001, meeting the prespecified 0.025 threshold). Pioglitazone improved histology in 34% against 19% (p=0.04), which did not meet that threshold. Neither improved fibrosis scores.',
          typicalCost: 'Inexpensive over the counter',
          prosAndCons:
            'Pros: met the primary endpoint in the trial pioglitazone missed, and did not cause weight gain. Cons: this is one trial in a non-diabetic population, no fibrosis benefit was shown, and high-dose vitamin E carries its own long-term safety literature.',
        },
        {
          name: 'SGLT2 inhibitors and GLP-1 receptor agonists',
          class: 'Newer glucose-lowering drugs with cardiovascular and renal outcome trials',
          howItCompares:
            'Both classes have placebo-controlled outcome trials that met their primary endpoints, which pioglitazone did not. SGLT2 inhibitors reduce heart-failure hospitalisation, the specific harm pioglitazone causes.',
          typicalCost: 'Branded and far more expensive than a nine-cent generic tablet',
          prosAndCons:
            'Pros: outcome trials that hit their primary endpoints, no fluid retention. Cons: cost, and neither clears hepatic fat the way pioglitazone does.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Weigh yourself and watch your ankles in the first weeks',
          action:
            'The boxed warning asks for exactly this: after starting, and after any dose increase, watch for rapid weight gain, breathlessness and swelling. Fluid retention from this drug is dose-related and is the mechanism by which it precipitates heart failure.',
          patientImpact:
            'In PROactive, 149 patients in the pioglitazone group and 108 on placebo were admitted to hospital with heart failure — 6% against 4% — although heart-failure mortality did not differ between the groups. In IRIS, oedema occurred in 35.6% of the pioglitazone arm against 24.9% on placebo (p<0.001), and 52.2% gained more than 4.5 kg against 33.7% (p<0.001).',
          clinicalPrecaution:
            'Pioglitazone is contraindicated in New York Heart Association class III or IV heart failure and not recommended in symptomatic heart failure of any class. Any change to the regimen belongs with the prescribing clinician. This page gives no dosing guidance of any kind.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCC1=CN=C(C=C1)CCOC2=CC=C(C=C2)CC3C(=O)NC(=O)S3',
      chemicalFormula: 'C19H20N2O3S',
      molecularWeight: '356.40 g/mol',
      targetReceptorAffinity:
        'A PPAR-gamma agonist. The FDA label states the mechanism depends on the presence of insulin: pioglitazone decreases insulin resistance in the periphery and the liver, increasing insulin-dependent glucose disposal and decreasing hepatic glucose output, and it is explicitly not an insulin secretagogue. Activation of PPAR-gamma nuclear receptors modulates transcription of insulin-responsive genes controlling glucose and lipid metabolism in adipose tissue, skeletal muscle and liver. Because it enhances the effect of circulating insulin rather than supplying it, it does not lower glucose in animal models lacking endogenous insulin. The thiazolidinedione head group is the pharmacophore that engages the receptor ligand-binding pocket.',
      structureSource: {
        label:
          'PubChem CID 4829 (pioglitazone) — SMILES, molecular formula and weight, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4829',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'pio-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the ethylpyridine ethanol and the thiazolidinedione fragments',
          description:
            'Confirm identity and purity of 2-(5-ethylpyridin-2-yl)ethanol, the 4-fluorobenzaldehyde or 4-hydroxybenzaldehyde coupling partner and 2,4-thiazolidinedione. The thiazolidinedione ring is the pharmacophore that occupies the PPAR-gamma ligand pocket; a batch in which it is partially hydrolysed is a batch of inactive material that still assays as organic solid.',
          reagentsAndBuffer:
            'Reference standards, nuclear magnetic resonance and infrared identity, Karl Fischer water determination, residual solvent screening by headspace gas chromatography, sulphated ash',
        },
        {
          id: 'pio-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ether formation, Knoevenagel condensation and reduction of the benzylidene',
          description:
            'Couple the pyridyl ethanol to the benzaldehyde through an ether linkage, condense the resulting aldehyde with 2,4-thiazolidinedione under Knoevenagel conditions to give the benzylidene, then reduce the exocyclic double bond. The reduction generates a stereocentre at position 5 of the thiazolidinedione ring; the marketed drug is a racemate, and the two enantiomers interconvert in vivo through the acidic ring proton, which is why resolving them would be pointless as well as expensive.',
          dependsOnStepId: 'pio-w1',
          reagentsAndBuffer:
            'Potassium carbonate or sodium hydride for etherification, piperidine or piperidinium acetate catalyst in toluene with azeotropic water removal, catalytic hydrogenation over palladium on carbon or borohydride reduction, dimethylformamide',
        },
        {
          id: 'pio-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride salt formation and polymorph control',
          description:
            'Form the hydrochloride salt, recrystallise to the specified polymorph and control the unreduced benzylidene intermediate, which is coloured, more potent in some in vitro assays and a specified impurity rather than an acceptable contaminant. Polymorph identity governs dissolution and therefore the exposure the clinical programme was built on.',
          dependsOnStepId: 'pio-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol or ethyl acetate, ethanol-water recrystallisation, reversed-phase HPLC with photodiode-array detection, X-ray powder diffraction and differential scanning calorimetry',
        },
        {
          id: 'pio-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Adipocyte differentiation and hepatocyte lipid-clearance assays',
          description:
            'Treat pre-adipocytes and differentiated adipocytes and measure lipid accumulation, adiponectin secretion and the transcriptional signature; separately, load hepatocytes with fatty acids and measure triglyceride clearance. This is the cellular step the drug exists to produce, and it takes days rather than minutes, because the effect is transcriptional. A receptor binding number alone cannot show it.',
          dependsOnStepId: 'pio-w3',
          reagentsAndBuffer:
            '3T3-L1 pre-adipocytes with differentiation cocktail, primary human adipocytes, Oil Red O staining, adiponectin and leptin ELISA, quantitative PCR panel for PPAR-gamma target genes, primary human hepatocytes with oleate loading, triglyceride quantitation',
        },
        {
          id: 'pio-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'PPAR-gamma transactivation with alpha and delta counter-screens, and renal sodium handling',
          description:
            'Run a PPAR-gamma reporter transactivation assay with PPAR-alpha and PPAR-delta counter-screens, and separately measure epithelial sodium channel activity in collecting-duct cells. The sodium arm is not optional: PPAR-gamma activation in the renal collecting duct is the accepted mechanism of the fluid retention behind the boxed warning, and a compound optimised only on the glucose readout would never see it.',
          dependsOnStepId: 'pio-w4',
          reagentsAndBuffer:
            'GAL4-PPAR-gamma, alpha and delta ligand-binding-domain chimaeras with luciferase reporter in HEK293 cells, coactivator recruitment by time-resolved fluorescence, mouse inner medullary collecting duct cells with amiloride-sensitive short-circuit current measurement in Ussing chambers',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pio-a1',
        category: 'failed',
        title: 'PROactive missed its primary endpoint and is remembered for its secondary one',
        laymanSummary:
          'The trial that was supposed to prove pioglitazone prevents cardiovascular events enrolled 5,238 people with type 2 diabetes and existing vascular disease. On the endpoint it had declared in advance, the result was not statistically significant. On a narrower endpoint declared as secondary, it was.',
        technicalDetails:
          'PROactive randomised 5,238 patients with type 2 diabetes and evidence of macrovascular disease to pioglitazone titrated from 15 mg to 45 mg (n=2,605) or matching placebo (n=2,633), on top of existing therapy, and observed them an average of 34.5 months. The prespecified primary endpoint was a composite of all-cause mortality, non-fatal myocardial infarction including silent infarction, stroke, acute coronary syndrome, endovascular or surgical intervention in the coronary or leg arteries, and above-ankle amputation. It occurred in 514 of 2,605 on pioglitazone and 572 of 2,633 on placebo: hazard ratio 0.90 (95% CI 0.80 to 1.02, p=0.095). The main secondary endpoint — the narrower composite of all-cause mortality, non-fatal myocardial infarction and stroke — occurred in 301 against 358 patients: hazard ratio 0.84 (95% CI 0.72 to 0.98, p=0.027). The published interpretation states that pioglitazone reduces the secondary composite. It does not claim the primary was met, because it was not.',
        evidenceSource:
          'Dormandy JA et al., Lancet 2005;366:1279-1289 (PROactive, NCT00174993)',
        doi: '10.1016/S0140-6736(05)67528-9',
        measuredMetric:
          'Hazard ratios for the prespecified primary composite endpoint and the main secondary composite endpoint over an average 34.5 months in 5,238 patients',
        inferredClaim:
          'That PROactive demonstrated pioglitazone prevents macrovascular events — the endpoint it was designed and powered around returned p=0.095',
        auditFlag: 'contested',
      },
      {
        id: 'pio-a2',
        category: 'failed',
        title: 'In the same trial it put half as many people again into hospital with heart failure',
        laymanSummary:
          'Alongside the cardiovascular result, PROactive counted admissions for heart failure. There were 149 in the pioglitazone group and 108 on placebo — 6% against 4%. This finding is the reason the drug carries a boxed warning.',
        technicalDetails:
          'In PROactive, 149 patients in the pioglitazone group and 108 in the placebo group were admitted to hospital with heart failure, 6% against 4%; mortality from heart failure did not differ between the groups. The United States label carries a boxed warning stating that thiazolidinediones including pioglitazone cause or exacerbate congestive heart failure in some patients, that patients must be monitored after initiation and after dose increases for excessive rapid weight gain, dyspnoea and oedema, that the drug is not recommended in symptomatic heart failure, and that initiation in established New York Heart Association class III or IV heart failure is contraindicated. The mechanism is not idiosyncratic: PPAR-gamma activation in the renal collecting duct promotes sodium reabsorption, and the label describes the fluid retention as dose-related and most common in combination with insulin.',
        evidenceSource:
          'Dormandy JA et al., Lancet 2005;366:1279-1289; FDA prescribing information for pioglitazone tablets, BOXED WARNING and section 5.1',
        doi: '10.1016/S0140-6736(05)67528-9',
        measuredMetric:
          'Hospital admissions for heart failure by arm in a 5,238-patient randomised trial, and the resulting boxed warning text',
        auditFlag: 'verified',
      },
      {
        id: 'pio-a3',
        category: 'measured',
        title: 'IRIS found a 24% reduction in stroke and heart attack — in people without diabetes',
        laymanSummary:
          'A different trial gave pioglitazone to 3,876 people who had recently had a stroke or mini-stroke, were insulin resistant, and did not have diabetes. Over almost five years, strokes and heart attacks fell from 11.8% to 9.0%, and new diabetes fell by half.',
        technicalDetails:
          'IRIS (Insulin Resistance Intervention after Stroke) was a multicentre double-blind trial randomising 3,876 patients with a recent ischaemic stroke or transient ischaemic attack, without diabetes, and with a HOMA-IR score above 3.0, to pioglitazone at a target dose of 45 mg daily or placebo. The primary outcome — fatal or non-fatal stroke or myocardial infarction — occurred by 4.8 years in 175 of 1,939 (9.0%) on pioglitazone and 228 of 1,937 (11.8%) on placebo: hazard ratio 0.76 (95% CI 0.62 to 0.93, p=0.007). New-onset diabetes occurred in 73 (3.8%) against 149 (7.7%): hazard ratio 0.48 (95% CI 0.33 to 0.69, p<0.001). All-cause mortality did not differ: hazard ratio 0.93 (95% CI 0.73 to 1.17, p=0.52). This is the only trial in which pioglitazone met its own prespecified primary endpoint, and it was run in a population without the disease the drug is licensed for.',
        evidenceSource: 'Kernan WN et al., N Engl J Med 2016;374:1321-1331 (IRIS)',
        doi: '10.1056/NEJMoa1506930',
        measuredMetric:
          'Hazard ratios for fatal or non-fatal stroke or myocardial infarction, new-onset diabetes and all-cause mortality by 4.8 years in 3,876 non-diabetic patients',
        auditFlag: 'verified',
      },
      {
        id: 'pio-a4',
        category: 'failed',
        title: 'The same trial measured what it cost: weight, oedema and fractures',
        laymanSummary:
          'IRIS reported the harms alongside the benefit. Over half the pioglitazone group gained more than 4.5 kg, a third developed swelling, and fractures serious enough to need surgery or hospital admission rose from 3.2% to 5.1%.',
        technicalDetails:
          'In IRIS, weight gain exceeding 4.5 kg occurred in 52.2% of the pioglitazone group against 33.7% on placebo (p<0.001); oedema in 35.6% against 24.9% (p<0.001); and bone fracture requiring surgery or hospitalisation in 5.1% against 3.2% (p=0.003). The fracture signal is a class effect of thiazolidinediones with a mechanistic explanation: PPAR-gamma activation drives mesenchymal stem cells toward adipocyte rather than osteoblast lineage, reducing bone formation. The United States label lists fractures among warnings and precautions, noting an increased incidence in female patients and advising that current standards of care for bone health be applied. Set against the primary result, the arithmetic is that treating for 4.8 years avoided about 2.8 strokes or heart attacks per 100 patients and caused about 1.9 additional serious fractures per 100.',
        evidenceSource:
          'Kernan WN et al., N Engl J Med 2016;374:1321-1331; FDA prescribing information for pioglitazone tablets, sections 5.5 and 5.6',
        doi: '10.1056/NEJMoa1506930',
        measuredMetric:
          'Proportions with weight gain above 4.5 kg, oedema and fracture requiring surgery or hospitalisation, by arm, over 4.8 years',
        auditFlag: 'verified',
      },
      {
        id: 'pio-a5',
        category: 'conclusion_shift',
        title: 'The bladder cancer restriction of 2011 was not supported by the definitive cohort',
        laymanSummary:
          'An interim analysis in 2011 suggested pioglitazone raised bladder cancer risk. France and Germany suspended it, the FDA added a warning, and prescribing collapsed. When the same cohort was followed for a decade and fully analysed, there was no significant association.',
        technicalDetails:
          'Lewis and colleagues followed 193,099 people aged 40 or over in the Kaiser Permanente Northern California cohort from 1997-2002 until December 2012, of whom 34,181 (18%) received pioglitazone for a median 2.8 years (range 0.2 to 13.2), with 1,261 incident bladder cancers. Crude incidence was 89.8 per 100,000 person-years in users and 75.9 in non-users. Ever use of pioglitazone was not associated with bladder cancer risk: adjusted hazard ratio 1.06 (95% CI 0.89 to 1.26). A nested case-control analysis of 464 cases and 464 matched controls agreed, adjusted odds ratio 1.18 (95% CI 0.78 to 1.80). No clear pattern of risk appeared for time since initiation, duration or cumulative dose. In a parallel cohort of 236,507 people examining ten further cancers, eight showed no association, while ever use was associated with prostate cancer (HR 1.13, 95% CI 1.02 to 1.26) and pancreatic cancer (HR 1.41, 95% CI 1.16 to 1.71), which the authors state merit further investigation as to whether they are causal or reflect chance, residual confounding or reverse causality. The authors are explicit that an increased bladder cancer risk could not be excluded. The current United States label still lists bladder cancer under warnings and precautions and advises against use in active bladder cancer.',
        evidenceSource: 'Lewis JD et al., JAMA 2015;314:265-277 (Kaiser Permanente Northern California cohort)',
        doi: '10.1001/jama.2015.7996',
        measuredMetric:
          'Adjusted hazard ratio for bladder cancer with ever use of pioglitazone in 193,099 persons over up to fifteen years, with matched case-control confirmation',
        auditFlag: 'contested',
      },
      {
        id: 'pio-a6',
        category: 'failed',
        title: 'In fatty liver disease it missed the primary endpoint that vitamin E met',
        laymanSummary:
          'A trial of 247 adults with fatty liver inflammation and no diabetes compared pioglitazone, vitamin E and placebo over almost two years, with liver biopsies at both ends. Vitamin E met the prespecified threshold. Pioglitazone did not, though it improved several individual measurements.',
        technicalDetails:
          'PIVENS randomised 247 adults with non-alcoholic steatohepatitis and without diabetes to pioglitazone 30 mg daily (n=80), vitamin E 800 IU daily (n=84) or placebo (n=83) for 96 weeks. Because two primary comparisons were planned, p values below 0.025 were prespecified as significant. Vitamin E improved histology in 43% against 19% on placebo (p=0.001); pioglitazone improved histology in 34% against 19% (p=0.04), which does not meet the threshold. Both agents reduced alanine and aspartate aminotransferase against placebo (p<0.001 for both), hepatic steatosis (p=0.005 vitamin E, p<0.001 pioglitazone) and lobular inflammation (p=0.02 and p=0.004), but neither improved fibrosis scores (p=0.24 and p=0.12). Subjects on pioglitazone gained more weight than either other group. The authors state there was no benefit of pioglitazone over placebo for the primary outcome, with significant benefits on some secondary outcomes.',
        evidenceSource: 'Sanyal AJ et al., N Engl J Med 2010;362:1675-1685 (PIVENS, NCT00063622)',
        doi: '10.1056/NEJMoa0907929',
        measuredMetric:
          'Proportion with histological improvement in non-alcoholic steatohepatitis at 96 weeks against a prespecified significance threshold of 0.025, with secondary biochemical and histological components',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed and carried into the cell nucleus',
        laymanDesc:
          'The tablet is absorbed and the drug moves into cells, and then into their nuclei — the compartment where genes are read. That is unusual: most drugs act on the cell surface.',
        molecularDetail:
          'Pioglitazone is a lipophilic thiazolidinedione that crosses membranes passively and enters the nucleus. It is metabolised largely by CYP2C8 and, to a lesser extent, CYP3A4, and several of its metabolites are pharmacologically active, which is why the effect outlasts the parent compound.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It binds a receptor that is itself a gene switch',
        laymanDesc:
          'Inside the nucleus sits a protein whose job is to sit on DNA and decide whether nearby genes get read. The drug slots into a pocket in that protein and changes its shape.',
        molecularDetail:
          'PPAR-gamma is a ligand-activated nuclear receptor. The thiazolidinedione head hydrogen-bonds within the ligand-binding pocket, stabilising helix 12 of the activation function 2 surface. The label states that PPAR receptors are found in tissues important for insulin action — adipose tissue, skeletal muscle and liver.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The changed switch pairs up and rewrites which genes get read',
        laymanDesc:
          'The reshaped protein pairs with a partner, sits down on specific stretches of DNA, and recruits the machinery that turns genes on. Dozens of genes controlling how fat is handled change their output.',
        molecularDetail:
          'Ligand binding releases corepressors and recruits coactivators. PPAR-gamma heterodimerises with the retinoid X receptor and binds PPAR response elements, modulating transcription of insulin-responsive genes controlling glucose and lipid metabolism — adiponectin, lipoprotein lipase, fatty acid transporters and GLUT4 among them.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Fat is redirected out of liver and muscle and back into fat tissue',
        laymanDesc:
          'Fat cells become better at their job of storing fat, so fat stops accumulating in the liver and in muscle. Those are the tissues where fat interferes with insulin working.',
        molecularDetail:
          'Subcutaneous adipocytes proliferate and increase triglyceride storage capacity while adiponectin secretion rises; ectopic lipid in hepatocytes and myocytes falls, restoring insulin signalling in both. In PIVENS, hepatic steatosis improved significantly against placebo (p<0.001) — the mechanism visible directly on biopsy.',
        iconName: 'ArrowRightLeft',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'Circulating insulin starts working again — over weeks, not hours',
        laymanDesc:
          'The insulin the body already makes becomes more effective, so blood sugar and insulin levels both fall. This takes weeks, because the drug works by changing which proteins the cell makes.',
        molecularDetail:
          'The label states that decreased insulin resistance produces lower plasma glucose, lower plasma insulin and lower HbA1c, that pioglitazone is not an insulin secretagogue, and that it does not lower glucose in models lacking endogenous insulin. Triglycerides fall and HDL cholesterol rises, with no consistent change in LDL or total cholesterol.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The same receptor in the kidney holds on to salt and water',
        laymanDesc:
          'The gene switch this drug flips is not only in fat. In the kidney it tells the body to keep sodium, which means keeping water. That is why ankles swell and why the drug can tip a weak heart into failure.',
        molecularDetail:
          'PPAR-gamma activation in the renal collecting duct increases epithelial sodium channel-mediated sodium reabsorption and plasma volume expansion. The label describes the fluid retention as dose-related and most common in combination with insulin. In IRIS oedema occurred in 35.6% against 24.9% on placebo; in PROactive, 149 pioglitazone patients against 108 on placebo were hospitalised for heart failure.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'PROactive (NCT00174993)',
        phase: 'Prospective randomised double-blind placebo-controlled outcome trial, average 34.5 months',
        sampleSize: 5238,
        primaryEndpoint:
          'Composite of all-cause mortality, non-fatal myocardial infarction including silent infarction, stroke, acute coronary syndrome, coronary or leg-artery intervention, and above-ankle amputation',
        endpointMet: false,
        statisticalPValue:
          'Hazard ratio 0.90 (95% CI 0.80 to 1.02, P = 0.095) — primary endpoint not met. Main secondary endpoint hazard ratio 0.84 (95% CI 0.72 to 0.98, P = 0.027)',
        unreportedAdverseSignals:
          'Hospital admission for heart failure occurred in 149 patients on pioglitazone against 108 on placebo (6% against 4%), though heart-failure mortality did not differ. The drug is generally cited for the secondary endpoint, not for the endpoint it was designed around.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'IRIS — Insulin Resistance Intervention after Stroke',
        phase: 'Multicentre randomised double-blind placebo-controlled trial, 4.8 years',
        sampleSize: 3876,
        primaryEndpoint:
          'Fatal or non-fatal stroke or myocardial infarction in patients without diabetes with recent ischaemic stroke or TIA and HOMA-IR above 3.0',
        endpointMet: true,
        statisticalPValue:
          'P = 0.007; hazard ratio 0.76 (95% CI 0.62 to 0.93). New-onset diabetes hazard ratio 0.48 (95% CI 0.33 to 0.69, P < 0.001)',
        unreportedAdverseSignals:
          'All-cause mortality did not differ (HR 0.93, 95% CI 0.73 to 1.17, P = 0.52). Weight gain above 4.5 kg occurred in 52.2% against 33.7%, oedema in 35.6% against 24.9%, and fracture requiring surgery or hospitalisation in 5.1% against 3.2% (P = 0.003).',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'PIVENS (NCT00063622)',
        phase: 'Randomised double-blind placebo-controlled trial with paired liver biopsies, 96 weeks',
        sampleSize: 247,
        primaryEndpoint:
          'Improvement in histological features of non-alcoholic steatohepatitis, composite of steatosis, lobular inflammation, hepatocellular ballooning and fibrosis scores',
        endpointMet: false,
        statisticalPValue:
          'Pioglitazone 34% against placebo 19%, P = 0.04 against a prespecified significance threshold of 0.025 — not met. Vitamin E 43% against 19%, P = 0.001 — met',
        unreportedAdverseSignals:
          'Neither agent improved fibrosis scores (P = 0.12 for pioglitazone). Subjects receiving pioglitazone gained more weight than either other group.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Lewis 2015 Kaiser Permanente Northern California bladder cancer cohort',
        phase: 'Population cohort with nested case-control analysis, 1997 to December 2012',
        sampleSize: 193099,
        primaryEndpoint:
          'Incident bladder cancer associated with ever use, duration, cumulative dose and time since initiation of pioglitazone',
        endpointMet: false,
        statisticalPValue:
          'Adjusted hazard ratio 1.06 (95% CI 0.89 to 1.26) for ever use — no significant association; nested case-control adjusted odds ratio 1.18 (95% CI 0.78 to 1.80)',
        unreportedAdverseSignals:
          'In a parallel cohort of 236,507 persons examining ten other cancers, ever use was associated with prostate cancer (HR 1.13, 95% CI 1.02 to 1.26) and pancreatic cancer (HR 1.41, 95% CI 1.16 to 1.71). The authors state an increased bladder cancer risk still could not be excluded.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A hazard ratio of 0.90 (95% CI 0.80 to 1.02, p=0.095) on the prespecified primary composite endpoint in 5,238 patients — not statistically significant',
        'A hazard ratio of 0.84 (95% CI 0.72 to 0.98, p=0.027) on the main secondary composite of death, non-fatal myocardial infarction and stroke in the same trial',
        'A hazard ratio of 0.76 (95% CI 0.62 to 0.93) for stroke or myocardial infarction in 3,876 non-diabetic patients with insulin resistance after stroke, over 4.8 years',
        'Weight gain above 4.5 kg in 52.2% against 33.7%, oedema in 35.6% against 24.9%, and serious fracture in 5.1% against 3.2%, in the same trial',
        'An adjusted hazard ratio of 1.06 (95% CI 0.89 to 1.26) for bladder cancer with ever use, in 193,099 people followed up to fifteen years',
      ],
      unsupportedInferences: [
        'That PROactive demonstrated a macrovascular benefit — the primary endpoint returned p=0.095, and the label states there is no conclusive evidence of macrovascular risk reduction with pioglitazone',
        'That the IRIS result transfers to people with type 2 diabetes — IRIS enrolled patients who did not have diabetes, selected on a HOMA-IR score above 3.0 after a stroke',
        'That the bladder cancer question is closed — the definitive cohort found no significant association and its authors state an increased risk could not be excluded, while the label warning remains',
        'That pioglitazone treats fatty liver disease — it missed the prespecified primary histological endpoint in PIVENS and improved no fibrosis score',
      ],
      whatFailedInitially: [
        'PROactive missed the primary composite endpoint it was designed and powered around, and the drug is remembered for the secondary one',
        'Hospital admissions for heart failure rose from 4% to 6% in PROactive, producing the boxed warning the drug still carries',
        'PIVENS did not meet its prespecified significance threshold in non-alcoholic steatohepatitis, in a trial where vitamin E did',
        'The 2011 bladder cancer signal drove regulatory restriction and a collapse in prescribing that a decade of follow-up in 193,099 people did not confirm',
      ],
      realWorldOutcome: [
        'US$0.0903 per tablet at United States pharmacy acquisition cost, the median across 67 listed generic products in the CMS NADAC survey',
        'The only thiazolidinedione in routine use in the United States, and the only oral diabetes drug that measurably clears fat from the liver',
        'Carries a boxed warning for congestive heart failure and is contraindicated in New York Heart Association class III or IV heart failure',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, once daily, in 15 mg, 30 mg and 45 mg strengths',
      description:
        'A conventional immediate-release tablet of the hydrochloride salt. The clinically important property is not the formulation but the time course: because the drug acts through gene transcription and adipose tissue remodelling, the full glycaemic effect takes weeks to appear and persists for weeks after stopping. The label states the antihyperglycaemic effect occurs only in the presence of endogenous insulin.',
      safetyProfile:
        'A boxed warning states that thiazolidinediones including pioglitazone cause or exacerbate congestive heart failure in some patients; the drug is not recommended in symptomatic heart failure and is contraindicated in NYHA class III or IV. Dose-related oedema occurs and is most common in combination with insulin. Fractures are increased, particularly in female patients. Bladder cancer is listed under warnings and precautions with advice not to use in active bladder cancer and caution with prior history. Postmarketing reports include hepatic failure, sometimes fatal, and macular oedema. Hypoglycaemia is not caused by pioglitazone alone but can occur when it is combined with insulin or an insulin secretagogue. The label states there have been no clinical studies establishing conclusive evidence of macrovascular risk reduction with pioglitazone.',
    },
    commonQuestions: [
      {
        q: 'Did PROactive show pioglitazone prevents heart attacks?',
        a: 'Not on the question it set out to answer. PROactive randomised 5,238 people with type 2 diabetes and existing vascular disease, and declared in advance that its primary endpoint was a broad composite including deaths, heart attacks, strokes, acute coronary syndromes, artery procedures and amputations. That endpoint returned a hazard ratio of 0.90 with a confidence interval from 0.80 to 1.02 and p=0.095 — not statistically significant. A narrower secondary composite of death, non-fatal heart attack and stroke returned 0.84 (0.72 to 0.98, p=0.027). Both numbers are real; only the second is significant, and it was not the endpoint the trial was designed around. The label continues to say there is no conclusive evidence of macrovascular risk reduction with pioglitazone.',
        auditNote:
          'A secondary endpoint that reaches significance after the primary fails is a hypothesis for the next trial, not a demonstration.',
      },
      {
        q: 'Then why is it still used?',
        a: 'Largely because of IRIS and because of what it does to the liver. IRIS gave pioglitazone to 3,876 people who had recently had a stroke or mini-stroke, were insulin resistant, and did not have diabetes, and it met its primary endpoint: stroke or heart attack fell from 11.8% to 9.0% over 4.8 years, hazard ratio 0.76 (95% CI 0.62 to 0.93, p=0.007). New diabetes fell by half. It is also the only oral diabetes drug that measurably clears fat from the liver, which is why it keeps being tested in steatohepatitis. And it costs nine cents a tablet. Against that: over half the IRIS pioglitazone group gained more than 4.5 kg, a third developed oedema, and serious fractures rose from 3.2% to 5.1%.',
      },
      {
        q: 'Does it cause bladder cancer?',
        a: 'The best available study says no significant association, and its authors decline to rule one out. In 2011 an interim analysis prompted an FDA safety communication, a label warning, and suspensions in France and Germany. The full analysis, published in 2015, followed 193,099 people in Kaiser Permanente Northern California from 1997 to the end of 2012, including 34,181 who took pioglitazone for a median of 2.8 years, and found 1,261 bladder cancers. The adjusted hazard ratio for ever use was 1.06 (95% CI 0.89 to 1.26), and a matched case-control analysis agreed. No pattern appeared by duration, dose or time since starting. The same paper found associations with prostate cancer (HR 1.13) and pancreatic cancer (HR 1.41) that it says need further investigation. The bladder warning remains on the label.',
        auditNote:
          'This is the clearest conclusion shift on this page, and it runs in the direction people rarely expect: a restriction imposed on an interim signal that the completed study did not support.',
      },
      {
        q: 'Why does it cause swelling and heart failure?',
        a: 'Because the gene switch it flips is not only in fat cells. PPAR-gamma is also expressed in the collecting duct of the kidney, where activating it increases sodium reabsorption through the epithelial sodium channel. Holding on to sodium means holding on to water, which expands plasma volume. In a healthy heart that is swollen ankles; in a weak one it is decompensation. PROactive recorded 149 heart-failure admissions on pioglitazone against 108 on placebo, and the boxed warning followed. The label describes the fluid retention as dose-related and most common when the drug is combined with insulin.',
      },
      {
        q: 'Does this page show what the drug costs to make?',
        a: 'No, because no verifiable per-dose cost-of-production figure for pioglitazone could be found and cited. The figure shown is what United States pharmacies pay to acquire it — US$0.0903 per tablet, the median across 67 listed generic products in the CMS National Average Drug Acquisition Cost survey. That is a price, not a manufacturing cost, and this page will not guess at the difference.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Dormandy JA, Charbonnel B, Eckland DJ et al. Secondary prevention of macrovascular events in patients with type 2 diabetes in the PROactive Study (PROspective pioglitAzone Clinical Trial In macroVascular Events): a randomised controlled trial. Lancet 2005;366:1279-1289',
        identifier: '10.1016/S0140-6736(05)67528-9',
        kind: 'doi',
      },
      {
        label: 'PROactive: PROspective pioglitAzone Clinical Trial In macroVascular Events',
        identifier: 'NCT00174993',
        kind: 'nct',
      },
      {
        label:
          'Kernan WN, Viscoli CM, Furie KL et al. Pioglitazone after Ischemic Stroke or Transient Ischemic Attack (IRIS). N Engl J Med 2016;374:1321-1331',
        identifier: '10.1056/NEJMoa1506930',
        kind: 'doi',
      },
      {
        label:
          'Lewis JD, Habel LA, Quesenberry CP et al. Pioglitazone Use and Risk of Bladder Cancer and Other Common Cancers in Persons With Diabetes. JAMA 2015;314:265-277',
        identifier: '10.1001/jama.2015.7996',
        kind: 'doi',
      },
      {
        label:
          'Sanyal AJ, Chalasani N, Kowdley KV et al. Pioglitazone, vitamin E, or placebo for nonalcoholic steatohepatitis (PIVENS). N Engl J Med 2010;362:1675-1685',
        identifier: '10.1056/NEJMoa0907929',
        kind: 'doi',
      },
      {
        label:
          'PIVENS: Pioglitazone Versus Vitamin E Versus Placebo for the Treatment of Nondiabetic Patients With Nonalcoholic Steatohepatitis',
        identifier: 'NCT00063622',
        kind: 'nct',
      },
      {
        label:
          'FDA prescribing information for pioglitazone tablets — BOXED WARNING (congestive heart failure), sections 5.1 to 5.8, 12.1 and 12.2',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22pioglitazone%22',
        kind: 'regulatory',
      },
      {
        label:
          'openFDA Drugs@FDA — NDA 021073 (ACTOS, Takeda Pharmaceuticals USA, original approval 15 July 1999)',
        identifier: 'https://api.fda.gov/drug/drugsfda.json?search=products.brand_name:%22ACTOS%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 4829 — pioglitazone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4829',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Acarbose — a bacterial fermentation product that barely enters the bloodstream, whose 2003
  //    cardiovascular claim was dismantled by a published critique and then refuted by a
  //    6,522-patient trial, and whose diabetes-prevention effect survived both.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'acarbose',
    name: 'Acarbose',
    tradeName: 'Precose',
    sponsor: 'Bayer HealthCare (originator); marketed as generics',
    targetGene: 'MGAM',
    targetProtein:
      'Membrane-bound intestinal alpha-glucosidases of the brush border — maltase-glucoamylase (MGAM) and sucrase-isomaltase (SI) — together with pancreatic alpha-amylase in the lumen of the small intestine',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1995,
    indication:
      'As an adjunct to diet and exercise to improve glycaemic control in adults with type 2 diabetes mellitus.',
    patientFriendlyIndication: 'Type 2 diabetes — a tablet that slows the digestion of starch in the gut',
    anatomicalSite:
      'The lumen and brush border of the small intestine. Less than 2% of a dose reaches the circulation as active drug.',
    conditionContext: {
      conditionExplainer:
        'Starch is not sugar until enzymes cut it into glucose, and that cutting happens in the small intestine. Acarbose is a decoy that those enzymes bind instead of the starch, so digestion slows and glucose enters the blood more gradually.',
      whyItMatters:
        'The drug does not enter the body in any meaningful quantity: less than 2% of a dose is absorbed as active drug. That makes it unusual — its effects, good and bad, are almost entirely local to the gut. It also makes its side effects predictable: carbohydrate that is not digested in the small intestine is fermented by bacteria in the large one.',
      whoTakesThis:
        'Adults with type 2 diabetes, alone or added to other drugs. Use is far more common in East Asia, where rice-based diets make the post-meal glucose spike a larger share of total exposure, than in North America or Europe.',
      clinicalGoals:
        'Flatten the post-meal glucose rise and lower HbA1c. Its label states there is no conclusive evidence of macrovascular risk reduction with acarbose or any other antidiabetic drug, and the 6,522-patient trial that tested exactly that found none.',
    },
    oneSentenceVerdict:
      'A bacterial oligosaccharide that competitively blocks the intestinal enzymes which turn starch into glucose, of which less than 2% is absorbed as active drug — which reduced conversion of impaired glucose tolerance to diabetes by 25% in 1,429 randomised patients and by 18% in 6,522 more, and whose widely cited 2003 claim of a 49% reduction in cardiovascular events was refuted by a hazard ratio of 0.98 when the question was finally tested properly.',
    laymanHowItWorks:
      'Starch has to be chopped into glucose before it can be absorbed, and enzymes lining the small intestine do the chopping. Acarbose looks enough like the starch fragments those enzymes normally cut that they grab it instead, and it does not come apart. The enzymes are occupied, digestion slows, and glucose trickles into the blood over a longer stretch of intestine instead of arriving all at once. The drug itself barely enters the bloodstream. The starch it failed to digest travels on to the large intestine, where bacteria ferment it, which is why the main side effect is gas.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 57,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1760 per tablet at United States pharmacy acquisition cost, the median across 12 listed generic products in the CMS NADAC survey effective 19 August 2026',
      markupEstimate: '',
      openPatentNotes:
        'Approved as Precose in 1995 and long off patent. Only 12 products appear in the current NADAC file, which is fewer than for any sulfonylurea in this batch and is reflected in a per-tablet price several times theirs. Acarbose is not synthesised: it is isolated from the fermentation broth of Actinoplanes utahensis, which puts a floor under its manufacturing cost that a purely synthetic molecule does not have.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Acarbose occupies an odd position: it is the only glucose-lowering drug in wide use that works without entering the body, and it is the only one whose diabetes-prevention effect has been shown twice, in 1,429 and then 6,522 randomised patients. It is also the only one in this file whose most-quoted benefit — a 49% reduction in cardiovascular events — was published, criticised in print as methodologically unsound, and then contradicted by a properly powered trial. Metformin prevents diabetes too, is better tolerated and is cheaper.',
      conventionalRx: [
        {
          name: 'Metformin',
          class: 'Biguanide',
          howItCompares:
            'Also prevents progression from impaired glucose tolerance to diabetes, is cheaper per tablet at NADAC, and does not cause the fermentation side effects that limit acarbose. It has no gut-local mechanism and does not flatten the post-meal spike the same way.',
          typicalCost: 'Cheaper than acarbose per tablet in the current NADAC file',
          prosAndCons:
            'Pros: better tolerated, cheaper, more evidence. Cons: gastrointestinal intolerance of a different kind, contraindicated at low kidney function.',
        },
        {
          name: 'Miglitol',
          class: 'Alpha-glucosidase inhibitor',
          howItCompares:
            'The same mechanism in a molecule that, unlike acarbose, is systemically absorbed and renally excreted. No trial has compared the two on any clinical outcome, and neither has a cardiovascular outcome result of its own beyond the acarbose ACE trial.',
          typicalCost: 'No NADAC figure for miglitol is held on this record',
          prosAndCons:
            'Pros: does not inhibit pancreatic amylase, which may shift the side-effect profile. Cons: absorbed systemically, so the local-only argument for this class does not apply to it.',
        },
        {
          name: 'DPP-4 inhibitors',
          class: 'Incretin enhancers',
          howItCompares:
            'Also target post-meal glucose, without hypoglycaemia and without gastrointestinal fermentation. Their cardiovascular outcome trials were designed to exclude harm rather than show benefit, and none has shown a cardiovascular benefit.',
          typicalCost: 'Alogliptin is US$5.18 per tablet at NADAC, roughly thirty times acarbose',
          prosAndCons:
            'Pros: far better tolerated, once daily. Cons: much more expensive, and no demonstrated benefit on any hard endpoint.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Know that ordinary sugar will not fix a hypo on this drug',
          action:
            'Acarbose alone does not cause hypoglycaemia, because it does not release insulin. Combined with a sulfonylurea or insulin it can contribute to one — and the drug that caused the problem also blocks the usual remedy. Table sugar is sucrose, and acarbose inhibits the enzyme that splits sucrose into absorbable glucose.',
          patientImpact:
            'The FDA label states directly that oral glucose (dextrose), whose absorption is not inhibited by acarbose, should be used instead of sucrose (cane sugar) for mild to moderate hypoglycaemia, and that sucrose is unsuitable for rapid correction because its hydrolysis is inhibited. Severe episodes may require intravenous glucose or glucagon.',
          clinicalPrecaution:
            'This is a fact about which sugar works, not a dosing instruction. Anyone taking acarbose alongside insulin or a sulfonylurea should have this planned with their prescribing clinician in advance. This page gives no dosing guidance of any kind.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@@H]1[C@H]([C@@H]([C@H]([C@H](O1)O[C@@H]2[C@H](O[C@@H]([C@@H]([C@H]2O)O)O[C@H]([C@@H](CO)O)[C@@H]([C@H](C=O)O)O)CO)O)O)N[C@H]3C=C([C@H]([C@@H]([C@H]3O)O)O)CO',
      chemicalFormula: 'C25H43NO18',
      molecularWeight: '645.60 g/mol',
      targetReceptorAffinity:
        'A competitive, reversible inhibitor of pancreatic alpha-amylase and of the membrane-bound intestinal alpha-glucoside hydrolases of the brush border, as the FDA label states. The molecule is a pseudotetrasaccharide: an unsaturated cyclitol joined through a nitrogen atom to a deoxyhexose and then to two glucose units. That nitrogen bridge is the point — it cannot be hydrolysed, so the enzyme binds a substrate mimic it cannot cut and is occupied. Acarbose has no inhibitory activity against lactase and does not induce lactose intolerance. In six healthy men, less than 2% of an oral dose was absorbed as active drug, while about 35% of total radioactivity from a carbon-14 labelled dose was absorbed and 51% was excreted in faeces as unabsorbed drug-related radioactivity within 96 hours.',
      structureSource: {
        label:
          'PubChem CID 9811704 (acarbose) — SMILES, molecular formula and weight, re-checked against the PUG REST property endpoint and matched to the FDA label description section',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9811704',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'aca-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Release of the Actinoplanes utahensis production strain',
          description:
            'Identify and release the working cell bank of Actinoplanes utahensis, confirming strain identity, purity and productivity. This is where acarbose differs from every other small molecule in this file: it is not made by chemistry, it is a secondary metabolite of a soil actinomycete, and the organism is the process.',
          reagentsAndBuffer:
            '16S ribosomal RNA sequencing and whole-genome identity, sporulation and vegetative growth media, contaminant screening, cryopreserved working cell bank vials with viability and productivity release testing',
        },
        {
          id: 'aca-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Submerged fed-batch fermentation with maltose feeding',
          description:
            'Grow the organism in submerged fed-batch culture and feed maltose or a maltose-rich carbon source, which the biosynthetic pathway extends into the pseudotetrasaccharide. Yield is dominated by the carbon feed regime: the same pathway produces a family of related pseudo-oligosaccharides of different chain lengths, and the ratio between them is set here, not later.',
          dependsOnStepId: 'aca-w1',
          reagentsAndBuffer:
            'Complex nitrogen source with maltose or starch hydrolysate feed, trace-element solution, antifoam, stainless-steel stirred-tank fermenter with dissolved-oxygen and pH control, off-gas mass spectrometry',
        },
        {
          id: 'aca-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Cation-exchange capture and separation from homologous components',
          description:
            'Clarify the broth, capture acarbose on cation-exchange resin using the basicity of its bridging nitrogen, then resolve it from component B, C and higher homologues by further chromatography and crystallise. Separation from the homologues is the hard part and the reason a fermentation-derived oligosaccharide costs several times what a two-step condensation product costs.',
          dependsOnStepId: 'aca-w2',
          reagentsAndBuffer:
            'Broth filtration and ultrafiltration, strong cation-exchange resin with ammonia elution, activated carbon decolourisation, preparative chromatography, high-performance anion-exchange chromatography with pulsed amperometric detection for homologue profiling',
        },
        {
          id: 'aca-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Brush-border membrane vesicle inhibition and simulated luminal digestion',
          description:
            'Prepare brush-border membrane vesicles from intestinal mucosa and measure inhibition of maltase, sucrase and isomaltase activity, then run a simulated luminal digestion of starch with pancreatic amylase in the presence and absence of drug. This step models the only compartment the drug ever reaches at therapeutic concentration, which is why an ordinary plasma pharmacokinetic study tells you almost nothing about this molecule.',
          dependsOnStepId: 'aca-w3',
          reagentsAndBuffer:
            'Rat or human intestinal brush-border membrane vesicles, maltose, sucrose and isomaltose substrates, glucose oxidase coupled detection, porcine pancreatic alpha-amylase, soluble starch, simulated intestinal fluid at pH 6.8',
        },
        {
          id: 'aca-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Lactase counter-screen and colonic fermentation gas measurement',
          description:
            'Confirm the absence of lactase inhibition, which the label claims explicitly, and quantify hydrogen and methane production when the undigested carbohydrate is incubated with faecal microbiota. The gas measurement is not a curiosity: colonic fermentation is the dose-limiting adverse effect of this drug and the reason 7% of patients in the ACE trial stopped or reduced it.',
          dependsOnStepId: 'aca-w4',
          reagentsAndBuffer:
            'Recombinant lactase-phlorizin hydrolase, lactose substrate, anaerobic batch fermentation with pooled human faecal inoculum, gas chromatography for hydrogen and methane, short-chain fatty acid quantitation',
        },
      ],
    },
    keyAudits: [
      {
        id: 'aca-a1',
        category: 'conclusion_shift',
        title: 'The 2003 claim of a 49% cardiovascular reduction did not survive being tested',
        laymanSummary:
          'A 2003 paper reported that acarbose cut cardiovascular events by half in people with pre-diabetes, and heart attacks by 91%. A published critique in 2004 called the underlying trial seriously flawed. In 2017 a trial six times larger, designed to answer the question directly, found no effect at all.',
        technicalDetails:
          'Chiasson and colleagues reported in JAMA in 2003 that among 1,429 patients with impaired glucose tolerance randomised to acarbose 100 mg three times daily or placebo and followed a mean 3.3 years, cardiovascular events fell with a hazard ratio of 0.51 (95% CI 0.28 to 0.95, p=0.03), a 2.5% absolute risk reduction, with the largest component being myocardial infarction at a hazard ratio of 0.09 (95% CI 0.01 to 0.72, p=0.02) — an effect resting on a very small number of events. Kaiser and Sawicki published a systematic review of the trial documentation in Diabetologia in 2004 reporting "several serious flaws in the STOP-NIDDM study, especially selection bias, inadequate blinding, bias in data analysis and reporting, and potential sponsoring bias", and concluded that the validity of the results was seriously flawed and the clinical benefit unproven. The Acarbose Cardiovascular Evaluation trial then randomised 6,522 Chinese patients with established coronary heart disease and impaired glucose tolerance to acarbose 50 mg three times daily or placebo on top of standard secondary prevention, and followed them a median 5.0 years. The primary five-point composite occurred in 470 of 3,272 (14%) against 479 of 3,250 (15%): hazard ratio 0.98 (95% CI 0.86 to 1.11, p=0.73). No secondary cardiovascular outcome differed either.',
        evidenceSource:
          'Chiasson JL et al., JAMA 2003;290:486-494; Kaiser T, Sawicki PT, Diabetologia 2004;47:575-580; Holman RR et al., Lancet Diabetes Endocrinol 2017;5:877-886 (ACE, NCT00829660)',
        doi: '10.1016/S2213-8587(17)30309-1',
        measuredMetric:
          'Hazard ratio for the five-point cardiovascular composite in 6,522 randomised patients over a median 5.0 years, against the 2003 estimate of 0.51 in 1,429 patients',
        auditFlag: 'contested',
      },
      {
        id: 'aca-a2',
        category: 'measured',
        title: 'The diabetes-prevention effect held up in both trials',
        laymanSummary:
          'The claim that did survive is the smaller one. In the original trial, 32% of the acarbose group progressed to diabetes against 42% on placebo. In the much larger 2017 trial, it was 13% against 16%. Both differences were statistically significant.',
        technicalDetails:
          'STOP-NIDDM randomised 714 patients with impaired glucose tolerance to acarbose 100 mg three times daily and 715 to placebo, excluding 61 (4%) who did not have impaired glucose tolerance or had no post-randomisation data. Diabetes, defined by yearly oral glucose tolerance test, developed in 221 of 682 (32%) on acarbose and 285 of 686 (42%) on placebo: relative hazard 0.75 (95% CI 0.63 to 0.90, p=0.0015). Acarbose also significantly increased reversion of impaired glucose tolerance to normal (p<0.0001). In the ACE trial, diabetes developed in 436 of 3,272 (13%; 3.17 per 100 person-years) on acarbose against 513 of 3,250 (16%; 3.84 per 100 person-years) on placebo: rate ratio 0.82 (95% CI 0.71 to 0.94, p=0.005). Two independent trials in different populations, one in Europe and Canada and one in China, agreeing on the direction and roughly on the magnitude, is the strongest claim on this page.',
        evidenceSource:
          'Chiasson JL et al., Lancet 2002;359:2072-2077 (STOP-NIDDM); Holman RR et al., Lancet Diabetes Endocrinol 2017;5:877-886 (ACE)',
        doi: '10.1016/S0140-6736(02)08905-5',
        measuredMetric:
          'Relative hazard and rate ratio for progression from impaired glucose tolerance to type 2 diabetes, in 1,368 and 6,522 randomised patients',
        auditFlag: 'verified',
      },
      {
        id: 'aca-a3',
        category: 'inferred',
        title: 'A third of the acarbose group left the trial, against a fifth on placebo',
        laymanSummary:
          'In the original prevention trial, far more people stopped taking acarbose than stopped taking placebo — 31% against 19%. And when everyone was switched to placebo for three months at the end, conversion to diabetes rose. Both facts complicate the claim that the drug prevents diabetes rather than masking it.',
        technicalDetails:
          'STOP-NIDDM reports that 211 of 682 patients (31%) in the acarbose group and 130 of 686 (19%) on placebo discontinued treatment early, with flatulence and diarrhoea the most frequent side effects of acarbose. Differential dropout of that magnitude, in a trial whose endpoint is a laboratory test administered yearly, is a route by which the two arms stop being comparable. The same paper records that at the end of the study, treatment with placebo for three months was associated with an increase in conversion of impaired glucose tolerance to diabetes — consistent with a pharmacological effect on the glucose tolerance test itself rather than with a durable change in disease trajectory. Kaiser and Sawicki flagged inadequate blinding and bias in data analysis and reporting in the same trial. The ACE trial, which used a lower dose and reported a smaller effect, did not resolve this question because it did not include a washout.',
        evidenceSource:
          'Chiasson JL et al., Lancet 2002;359:2072-2077; Kaiser T, Sawicki PT, Diabetologia 2004;47:575-580',
        doi: '10.1007/s00125-003-1318-y',
        inferredClaim:
          'That the reduced conversion rate reflects prevented diabetes rather than a drug effect on the oral glucose tolerance test used to diagnose it — the post-study placebo period, in which conversion rose, is compatible with either',
        auditFlag: 'caution',
      },
      {
        id: 'aca-a4',
        category: 'failed',
        title: 'Gas and diarrhoea are the dose-limiting effect, and they are mechanistic',
        laymanSummary:
          'Carbohydrate that the small intestine failed to digest arrives in the large intestine, where bacteria ferment it. The result is flatulence, bloating and diarrhoea — the most common reason people stop the drug, and a direct consequence of how it works.',
        technicalDetails:
          'In the ACE trial, gastrointestinal disorders were the most common adverse event associated with drug discontinuation or dose change: 215 of 3,263 patients (7%) on acarbose against 150 of 3,241 (5%) on placebo, p=0.0007. In STOP-NIDDM, at the higher 100 mg three-times-daily dose, flatulence and diarrhoea were the most frequent side effects and 31% of the acarbose arm discontinued treatment early. This is not an idiosyncratic reaction: undigested oligosaccharide reaching the colon is fermented to hydrogen, methane and short-chain fatty acids, which is the same process by which beans cause flatulence. It is therefore proportional to both the dose and the carbohydrate content of the meal, and it is the reason the drug is titrated slowly in practice.',
        evidenceSource:
          'Holman RR et al., Lancet Diabetes Endocrinol 2017;5:877-886; Chiasson JL et al., Lancet 2002;359:2072-2077',
        doi: '10.1016/S2213-8587(17)30309-1',
        measuredMetric:
          'Proportion of patients with gastrointestinal adverse events leading to discontinuation or dose change, and early discontinuation rates by arm',
        auditFlag: 'verified',
      },
      {
        id: 'aca-a5',
        category: 'measured',
        title: 'Liver enzymes rise in a dose-related way, reversibly',
        laymanSummary:
          'In year-long American studies, treatment-emergent rises in liver enzymes were about twice as common on acarbose as on placebo at every threshold measured. They were symptomless, reversible, and more frequent in women.',
        technicalDetails:
          'The FDA label reports that in long-term United States studies of up to 12 months, including doses up to 300 mg three times daily, treatment-emergent elevations of serum aspartate or alanine aminotransferase above the upper limit of normal, above 1.8 times that limit, and above 3 times that limit occurred in 14%, 6% and 3% of acarbose-treated patients respectively, against 7%, 2% and 1% of placebo-treated patients. The differences were statistically significant. The label characterises the elevations as asymptomatic, reversible, more common in females, generally unassociated with other evidence of liver dysfunction, and dose related. This is a case where the label carries a clean quantified signal that the trial literature does not foreground.',
        evidenceSource:
          'FDA prescribing information for acarbose tablets USP, PRECAUTIONS (Elevated Serum Transaminase Levels)',
        measuredMetric:
          'Proportion with treatment-emergent transaminase elevation at three thresholds, acarbose against placebo, in studies up to 12 months',
        auditFlag: 'verified',
      },
      {
        id: 'aca-a6',
        category: 'measured',
        title: 'Less than 2% of a dose is absorbed as active drug',
        laymanSummary:
          'Almost none of this drug gets into the bloodstream in a form that still works. It acts in the gut, on enzymes lining the gut wall, and most of it leaves in the stool.',
        technicalDetails:
          'In a study of six healthy men, less than 2% of an oral dose of acarbose was absorbed as active drug, while approximately 35% of total radioactivity from a carbon-14 labelled oral dose was absorbed — the difference being bacterial degradation products rather than intact drug — and an average of 51% of an oral dose was excreted in the faeces as unabsorbed drug-related radioactivity within 96 hours. The label states that acarbose does not enhance insulin secretion, in contrast to sulfonylureas, that its effect is additive to sulfonylureas, insulin or metformin because the mechanism differs, and that it diminishes the insulinotropic and weight-increasing effects of sulfonylureas. It has no inhibitory activity against lactase and would not be expected to induce lactose intolerance.',
        evidenceSource:
          'FDA prescribing information for acarbose tablets USP, CLINICAL PHARMACOLOGY and Pharmacokinetics',
        measuredMetric:
          'Fraction of an oral dose absorbed as active drug, fraction of total radioactivity absorbed, and fraction excreted unabsorbed in faeces within 96 hours',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed with food and stays in the gut',
        laymanDesc:
          'Unlike almost every other tablet, this one is not meant to be absorbed. It works in the same place the food is, and most of it leaves in the stool.',
        molecularDetail:
          'Less than 2% of an oral dose is absorbed as active drug; about 51% is excreted in faeces as unabsorbed drug-related radioactivity within 96 hours. The therapeutic compartment is the lumen and brush border of the small intestine, not plasma.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It impersonates the sugar chain the enzymes are built to cut',
        laymanDesc:
          'The molecule is a chain of sugar-like units that looks to the digestive enzymes exactly like the starch fragment they normally attack — except that one of the links cannot be cut.',
        molecularDetail:
          'Acarbose is a pseudotetrasaccharide: an unsaturated cyclitol linked through a secondary amine to a 4,6-dideoxyglucose and then to two glucose units. The nitrogen bridge mimics the oxocarbenium transition state of glycoside hydrolysis but is not hydrolysable, giving competitive, reversible inhibition with far higher affinity than the natural substrate.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Starch digestion slows in both the lumen and the gut wall',
        laymanDesc:
          'Two sets of enzymes are blocked: the ones released by the pancreas into the gut, and the ones anchored to the surface of the intestinal lining.',
        molecularDetail:
          'The label describes competitive reversible inhibition of pancreatic alpha-amylase, which cleaves complex starch to oligosaccharides in the lumen, and of the membrane-bound intestinal alpha-glucosidases of the brush border, which cleave oligosaccharides, trisaccharides and disaccharides to glucose. Lactase is not inhibited.',
        iconName: 'Split',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Glucose arrives more slowly and further down the intestine',
        laymanDesc:
          'The same total amount of glucose still gets absorbed. It just arrives spread out over a longer stretch of gut and a longer stretch of time, so the spike after a meal is lower.',
        molecularDetail:
          'Delayed hydrolysis moves the site of glucose absorption distally and flattens the post-prandial excursion. Because average blood glucose over time is what glycates haemoglobin, the flattened excursion translates into a lower HbA1c without any change in insulin secretion.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'Bacteria in the large intestine ferment what was not digested',
        laymanDesc:
          'Carbohydrate that escaped digestion reaches the colon, where gut bacteria break it down and produce gas. This is the dose-limiting side effect and it is inseparable from the mechanism.',
        molecularDetail:
          'Colonic microbiota ferment the undigested oligosaccharide to hydrogen, methane, carbon dioxide and short-chain fatty acids. In the ACE trial, gastrointestinal disorders led to discontinuation or dose change in 7% of the acarbose arm against 5% on placebo (p=0.0007); in STOP-NIDDM, at three times the dose, 31% of the acarbose arm discontinued early.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the same block makes table sugar useless in a hypo',
        laymanDesc:
          'If low blood sugar happens because acarbose is combined with insulin or a sulfonylurea, ordinary sugar will not lift it quickly, because the drug blocks the enzyme that splits it.',
        molecularDetail:
          'Sucrose requires sucrase-isomaltase hydrolysis to glucose and fructose before absorption, and that enzyme is inhibited. The label specifies oral glucose (dextrose), whose absorption is not inhibited, as the appropriate treatment for mild to moderate hypoglycaemia, and states that sucrose is unsuitable for rapid correction. Severe hypoglycaemia may require intravenous glucose or glucagon.',
        iconName: 'ShieldAlert',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ACE — Acarbose Cardiovascular Evaluation (NCT00829660)',
        phase: 'Phase 4 randomised double-blind placebo-controlled trial, median 5.0 years',
        sampleSize: 6522,
        primaryEndpoint:
          'Five-point composite of cardiovascular death, non-fatal myocardial infarction, non-fatal stroke, hospital admission for unstable angina and hospital admission for heart failure, in Chinese patients with coronary heart disease and impaired glucose tolerance',
        endpointMet: false,
        statisticalPValue:
          'Hazard ratio 0.98 (95% CI 0.86 to 1.11, P = 0.73) — no effect. Diabetes incidence rate ratio 0.82 (95% CI 0.71 to 0.94, P = 0.005)',
        unreportedAdverseSignals:
          'No secondary cardiovascular outcome differed either. Gastrointestinal disorders caused discontinuation or dose change in 7% against 5% (P = 0.0007). The trial was funded by Bayer AG, the originator.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'STOP-NIDDM — diabetes prevention endpoint',
        phase: 'Multicentre randomised double-blind placebo-controlled trial, mean 3.3 years',
        sampleSize: 1429,
        primaryEndpoint:
          'Development of type 2 diabetes on yearly oral glucose tolerance testing in patients with impaired glucose tolerance',
        endpointMet: true,
        statisticalPValue:
          'P = 0.0015; relative hazard 0.75 (95% CI 0.63 to 0.90). 221 of 682 (32%) against 285 of 686 (42%)',
        unreportedAdverseSignals:
          'Discontinuation was 31% on acarbose against 19% on placebo, and conversion to diabetes rose during a three-month placebo period at the end of the study — both compatible with an effect on the diagnostic test rather than on the disease.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'STOP-NIDDM — cardiovascular and hypertension analysis (JAMA 2003)',
        phase: 'Secondary analysis of the same randomised trial, mean 3.3 years',
        sampleSize: 1368,
        primaryEndpoint:
          'Development of major cardiovascular events and of hypertension in patients with impaired glucose tolerance',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 0.51 (95% CI 0.28 to 0.95, P = 0.03) for cardiovascular events; 0.09 (95% CI 0.01 to 0.72, P = 0.02) for myocardial infarction; 0.66 (95% CI 0.49 to 0.89, P = 0.006) for new hypertension',
        unreportedAdverseSignals:
          'A published critique in Diabetologia reported selection bias, inadequate blinding, bias in data analysis and reporting, and potential sponsoring bias, and concluded the validity of the results was seriously flawed. The 6,522-patient ACE trial subsequently found a hazard ratio of 0.98.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A hazard ratio of 0.98 (95% CI 0.86 to 1.11, p=0.73) for the five-point cardiovascular composite in 6,522 randomised patients over a median 5.0 years',
        'A relative hazard of 0.75 (95% CI 0.63 to 0.90) and a rate ratio of 0.82 (95% CI 0.71 to 0.94) for progression to diabetes, in two independent randomised trials',
        'Gastrointestinal adverse events causing discontinuation or dose change in 7% against 5% (p=0.0007), and 31% early discontinuation at the higher dose',
        'Treatment-emergent transaminase elevation above three times the upper limit of normal in 3% against 1% on placebo, dose related and reversible',
        'Less than 2% of an oral dose absorbed as active drug, with 51% excreted unabsorbed in faeces within 96 hours',
      ],
      unsupportedInferences: [
        'That acarbose reduces cardiovascular events — the 2003 estimate of a 49% reduction rested on very few events in a trial a published critique found seriously flawed, and a trial six times larger found a hazard ratio of 0.98',
        'That flattening the post-meal glucose spike prevents macrovascular disease — ACE tested that hypothesis directly in the population where it should have been easiest to show, and found nothing',
        'That the diabetes-prevention effect is prevention rather than masking — conversion rose during the post-study placebo period, and no washout was built into the confirmatory trial',
        'That the label supports a cardiovascular claim — it states there is no conclusive evidence of macrovascular risk reduction with acarbose or any other antidiabetic drug',
      ],
      whatFailedInitially: [
        'The 2003 cardiovascular claim was published in JAMA, criticised in Diabetologia in 2004 as resting on selection bias, inadequate blinding and biased analysis, and refuted by the ACE trial in 2017',
        'Nearly a third of the acarbose arm of the original prevention trial stopped treatment, against a fifth on placebo, almost entirely because of flatulence and diarrhoea',
        'No secondary cardiovascular outcome in the ACE trial differed either — not death, not myocardial infarction, not stroke, not unstable angina, not heart failure, not renal impairment',
      ],
      realWorldOutcome: [
        'US$0.1760 per tablet at United States pharmacy acquisition cost, the median across 12 listed generic products in the CMS NADAC survey — several times the price of the sulfonylureas, because it is a fermentation product',
        'Widely used in East Asia, where post-meal glucose is a larger share of total glycaemic exposure, and comparatively little used in North America and Europe',
        'The only oral glucose-lowering drug in common use that acts entirely within the gut lumen and brush border',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet taken with the first bite of a meal, in 25 mg, 50 mg and 100 mg strengths',
      description:
        'A conventional tablet of a water-soluble oligosaccharide with a pKa of 5.1, isolated from the fermentation broth of Actinoplanes utahensis. The timing relative to food is not a convenience: the drug and the starch have to reach the enzymes together, because the inhibition is competitive and reversible. Taken away from food it has nothing to compete with and does nothing.',
      safetyProfile:
        'Flatulence, abdominal distension and diarrhoea are the dominant adverse effects, are dose-related and meal-related, and are the usual reason for stopping. Dose-related, asymptomatic and reversible transaminase elevations occur, more commonly in women. Acarbose alone does not cause hypoglycaemia because it does not release insulin, but it increases the risk when combined with insulin or a sulfonylurea, and in that setting sucrose is unsuitable for rapid correction because its hydrolysis is inhibited — oral glucose is specified instead. The label states there have been no clinical studies establishing conclusive evidence of macrovascular risk reduction with acarbose or any other antidiabetic drug.',
    },
    commonQuestions: [
      {
        q: 'Does acarbose prevent heart attacks?',
        a: 'No, and the history of that question is worth knowing. In 2003 a secondary analysis of the STOP-NIDDM trial reported a 49% relative reduction in cardiovascular events with acarbose in people with impaired glucose tolerance, and a 91% reduction in myocardial infarction — a hazard ratio of 0.09 resting on a handful of events. In 2004, a systematic review of the trial documentation published in Diabetologia reported selection bias, inadequate blinding, bias in data analysis and reporting, and potential sponsoring bias, and concluded the trial validity was seriously flawed. In 2017 the ACE trial randomised 6,522 Chinese patients who already had coronary heart disease and impaired glucose tolerance, followed them a median five years, and found a hazard ratio of 0.98 (95% CI 0.86 to 1.11, p=0.73). No secondary cardiovascular outcome differed either.',
        auditNote:
          'This is the clearest sequence on this page: a claim, a documented methodological critique, and a properly powered refutation, all in the peer-reviewed record.',
      },
      {
        q: 'Does it prevent diabetes?',
        a: 'That claim survived, in both trials, with a caveat. STOP-NIDDM found 32% of the acarbose group progressing to diabetes against 42% on placebo, relative hazard 0.75 (95% CI 0.63 to 0.90, p=0.0015). The much larger ACE trial found 13% against 16%, rate ratio 0.82 (95% CI 0.71 to 0.94, p=0.005). Two independent trials in very different populations agreeing is a strong result. The caveat is that diabetes here is diagnosed by an oral glucose tolerance test, and acarbose blunts exactly the glucose rise that test measures. STOP-NIDDM reported that conversion to diabetes rose during a three-month placebo period at the end of the study, which is what you would expect if the drug had been masking rather than preventing. No trial has settled this.',
      },
      {
        q: 'Why does it cause so much gas?',
        a: 'Because that is the mechanism, seen from the other end. Acarbose blocks the enzymes that break starch into glucose in the small intestine. Some carbohydrate therefore passes undigested into the large intestine, where the resident bacteria ferment it into hydrogen, methane and short-chain fatty acids. It is the same chemistry that makes beans produce gas, deliberately induced. In the ACE trial, at 50 mg three times daily, gastrointestinal problems caused 7% of patients to stop or reduce the drug against 5% on placebo. In STOP-NIDDM, at twice the dose, 31% of the acarbose arm discontinued treatment early against 19% on placebo.',
      },
      {
        q: 'If I take this, will ordinary sugar still fix low blood sugar?',
        a: 'Not quickly, and the label addresses this directly. Acarbose on its own does not cause hypoglycaemia because it does not release insulin. But combined with insulin or a sulfonylurea it can contribute to an episode — and the enzyme it blocks is the same one that splits table sugar into absorbable glucose. The label states that oral glucose (dextrose), whose absorption is not inhibited, should be used instead of sucrose, and that sucrose is unsuitable for rapid correction because its hydrolysis is inhibited. Severe episodes may require intravenous glucose or glucagon. This is a fact about which sugar works; what to keep to hand and when is a conversation with the prescribing clinician.',
      },
      {
        q: 'Does this page show what the drug costs to make?',
        a: 'No, because no verifiable per-dose cost-of-production figure for acarbose could be found and cited. The figure shown is what United States pharmacies pay to acquire it — US$0.1760 per tablet, the median across 12 listed generic products in the CMS National Average Drug Acquisition Cost survey. That is several times the price of the sulfonylureas on this site, and there is a plausible structural reason: acarbose is not synthesised but isolated from a bacterial fermentation broth and separated from a family of closely related molecules. That is an explanation, not a measurement, and this page does not claim to know the manufacturing cost.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Chiasson JL, Josse RG, Gomis R, Hanefeld M, Karasik A, Laakso M. Acarbose for prevention of type 2 diabetes mellitus: the STOP-NIDDM randomised trial. Lancet 2002;359:2072-2077',
        identifier: '10.1016/S0140-6736(02)08905-5',
        kind: 'doi',
      },
      {
        label:
          'Chiasson JL, Josse RG, Gomis R, Hanefeld M, Karasik A, Laakso M. Acarbose treatment and the risk of cardiovascular disease and hypertension in patients with impaired glucose tolerance: the STOP-NIDDM trial. JAMA 2003;290:486-494',
        identifier: '10.1001/jama.290.4.486',
        kind: 'doi',
      },
      {
        label:
          'Kaiser T, Sawicki PT. Acarbose for prevention of diabetes, hypertension and cardiovascular events? A critical analysis of the STOP-NIDDM data. Diabetologia 2004;47:575-580',
        identifier: '10.1007/s00125-003-1318-y',
        kind: 'doi',
      },
      {
        label:
          'Holman RR, Coleman RL, Chan JCN et al. Effects of acarbose on cardiovascular and diabetes outcomes in patients with coronary heart disease and impaired glucose tolerance (ACE): a randomised, double-blind, placebo-controlled trial. Lancet Diabetes Endocrinol 2017;5:877-886',
        identifier: '10.1016/S2213-8587(17)30309-1',
        kind: 'doi',
      },
      {
        label: 'ACE: Acarbose Cardiovascular Evaluation Trial',
        identifier: 'NCT00829660',
        kind: 'nct',
      },
      {
        label:
          'FDA prescribing information for acarbose tablets USP — DESCRIPTION, CLINICAL PHARMACOLOGY (Mechanism of Action, Pharmacokinetics) and PRECAUTIONS (Macrovascular Outcomes, Hypoglycemia, Elevated Serum Transaminase Levels)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22acarbose%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 9811704 — acarbose structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9811704',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Repaglinide — thirty years on the market and, in the words of the Cochrane review, no study
  //    has reported its effect on mortality or morbidity. Contraindicated with a common fibrate
  //    that raises its exposure eightfold.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'repaglinide',
    name: 'Repaglinide',
    tradeName: 'Prandin',
    sponsor:
      'Novo Nordisk developed and launched Prandin; NDA 020741 is now held by Gemini Laboratories LLC, and the market is generic',
    targetGene: 'ABCC8',
    targetProtein:
      'Sulfonylurea receptor 1 (SUR1) on the pancreatic beta-cell ATP-sensitive potassium channel, at a binding site distinct from the sulfonylurea site',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1997,
    indication:
      'As an adjunct to diet and exercise to improve glycaemic control in adults with type 2 diabetes mellitus. Not for use in type 1 diabetes mellitus or diabetic ketoacidosis.',
    patientFriendlyIndication: 'Type 2 diabetes — a fast, short-acting tablet taken with meals',
    anatomicalSite: 'Pancreatic islet beta cell plasma membrane',
    conditionContext: {
      conditionExplainer:
        'Repaglinide does what a sulfonylurea does — close the beta-cell potassium channel to force insulin out — but it binds a different site, works within an hour and is gone within a few. The design intent was to cover meals rather than the whole day.',
      whyItMatters:
        'A shorter action should mean less hypoglycaemia between meals, and the pharmacology supports that. What no trial has ever measured is whether any of it changes how long people live or what happens to their eyes, kidneys, hearts or feet. The Cochrane review of the class says so in one sentence.',
      whoTakesThis:
        'Adults with type 2 diabetes, particularly where meal times are irregular or where kidney function makes a long-acting sulfonylurea risky, since repaglinide is cleared mainly by the liver.',
      clinicalGoals:
        'Blunt the post-meal glucose rise. The label states there have been no clinical studies establishing conclusive evidence of macrovascular risk reduction with repaglinide.',
    },
    oneSentenceVerdict:
      'A meglitinide that binds its own site on the beta-cell potassium channel to release insulin within an hour and stop within a few, lowering HbA1c by between 0.1 and 2.1 percentage points across eleven placebo-controlled trials — and for which, as the Cochrane review of fifteen trials and 3,781 participants states in terms, no study has reported an effect on mortality or morbidity.',
    laymanHowItWorks:
      'Insulin-producing cells sit quiet because potassium leaks out through an open channel. Repaglinide plugs that channel, the cell becomes electrically active, calcium rushes in, and insulin is released. It differs from the older sulfonylurea tablets in two ways: it grips a different part of the same channel, and it does everything fast — in the blood within an hour, largely gone within a few. That is why it is taken with meals rather than once a day.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 46,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0937 per tablet at United States pharmacy acquisition cost, the median across 17 listed generic products in the CMS NADAC survey effective 19 August 2026',
      markupEstimate: '',
      openPatentNotes:
        'Approved as Prandin under NDA 020741 on 22 December 1997 and long off patent, with 17 generic products in the current NADAC file. The application is now held by Gemini Laboratories LLC rather than by the developer.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The Cochrane review compared repaglinide against metformin in three trials and 248 participants and found a similar reduction in HbA1c, with up to three kilograms more weight gain in three months and more hypoglycaemia, though rarely severe enough to need assistance. Against nateglinide, the other meglitinide, repaglinide lowered HbA1c more in two trials and 342 participants. None of those trials measured mortality or morbidity, and neither meglitinide has a cardiovascular outcome trial that reported anything. Metformin does.',
      conventionalRx: [
        {
          name: 'Metformin',
          class: 'Biguanide',
          howItCompares:
            'In three randomised trials totalling 248 participants pooled by Cochrane, repaglinide had a similar effect on HbA1c to metformin. Weight gain was generally greater on the meglitinide — up to three kilograms in three months — diarrhoea occurred less often, and hypoglycaemia occurred more often though rarely severely.',
          typicalCost: 'Comparable or cheaper',
          prosAndCons:
            'Pros: no hypoglycaemia alone, no weight gain, and a randomised cardiovascular win over a sulfonylurea that no meglitinide has. Cons: gastrointestinal intolerance, contraindicated at low kidney function.',
        },
        {
          name: 'Nateglinide',
          class: 'Meglitinide (D-phenylalanine derivative)',
          howItCompares:
            'The same class with a shorter action and a weaker effect. Cochrane found HbA1c reductions of 0.1% to 2.1% for repaglinide across placebo-controlled trials against 0.2% to 0.6% for nateglinide, and in two direct comparisons totalling 342 participants repaglinide reduced HbA1c more. Nateglinide, unlike repaglinide, was tested in a 9,306-patient cardiovascular outcome trial, and failed all three of its co-primary endpoints.',
          typicalCost: 'US$0.2345 per tablet at NADAC, more than twice repaglinide',
          prosAndCons:
            'Pros: has actually been tested for outcomes, even though the answer was negative. Cons: weaker glycaemic effect, and the outcome trial found no benefit.',
        },
        {
          name: 'Sulfonylureas (glipizide, glimepiride)',
          class: 'Second-generation sulfonylureas',
          howItCompares:
            'The same channel, a different binding site, a much longer duration and a much lower price. Glimepiride is under four cents a tablet against nine for repaglinide, and it is the only drug of either class with a dedicated cardiovascular outcome trial. Repaglinide is cleared chiefly by the liver rather than the kidney, which is the usual argument for choosing it.',
          typicalCost: 'US$0.0373 to US$0.0668 per tablet at NADAC',
          prosAndCons:
            'Pros: cheaper, once daily, and one of them has a six-year outcome trial. Cons: longer duration means hypoglycaemia risk extends between meals and overnight, and renal impairment prolongs several of them.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Tell every prescriber and pharmacist that you take this drug',
          action:
            'Repaglinide has one of the strongest documented drug interactions of any oral diabetes drug. Gemfibrozil, a fibrate used for high triglycerides, raises repaglinide exposure more than eightfold, and the combination is contraindicated. Clopidogrel raises it around four to fivefold. Neither is an obscure medicine.',
          patientImpact:
            'In twelve healthy volunteers, gemfibrozil raised the area under the repaglinide concentration curve 8.1-fold, prolonged its half-life from 1.3 to 3.7 hours and increased the 7-hour plasma concentration 28.6-fold. Adding itraconazole raised exposure 19.4-fold and the 7-hour concentration 70.4-fold. The investigators wrote that repaglinide "became a long-acting and stronger antidiabetic".',
          clinicalPrecaution:
            'This is a reason to make sure prescribers know what you are taking, not a reason to adjust anything yourself. Any change belongs with the prescribing clinician. This page gives no dosing guidance of any kind.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCOC1=C(C=CC(=C1)CC(=O)N[C@@H](CC(C)C)C2=CC=CC=C2N3CCCCC3)C(=O)O',
      chemicalFormula: 'C27H36N2O4',
      molecularWeight: '452.60 g/mol',
      targetReceptorAffinity:
        'The FDA label states that repaglinide closes ATP-dependent potassium channels in the beta-cell membrane "by binding at characterizable sites", that insulin release is glucose-dependent and diminishes at low glucose concentrations, and that the ion channel mechanism is highly tissue selective with low affinity for heart and skeletal muscle. Absolute bioavailability is 56%, peak plasma concentration occurs within one hour, and the half-life is 1.0 to 1.4 hours with an individual range extending to 8 hours. Clearance is linear from 0.5 to 4 mg and the drug does not accumulate. Metabolism is by CYP2C8 and CYP3A4, which is why inhibitors of those enzymes produce interactions of unusual magnitude.',
      structureSource: {
        label:
          'PubChem CID 65981 (repaglinide) — SMILES, molecular formula and weight, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/65981',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'rep-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Chiral identity of the S-enantiomer building block',
          description:
            'Confirm the identity and enantiomeric purity of the (S)-2-ethoxy-4-substituted benzoic acid fragment and the (S)-3-methyl-1-(2-piperidin-1-ylphenyl)butylamine. Repaglinide is a single enantiomer and the R-enantiomer is far less active; enantiomeric excess is a release specification, not a preference, and it is set by the amine building block rather than recovered later.',
          reagentsAndBuffer:
            'Chiral HPLC with polysaccharide stationary phase, optical rotation, nuclear magnetic resonance identity, Karl Fischer water determination, residual solvent screening',
        },
        {
          id: 'rep-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amide coupling of the benzoic acid to the chiral butylamine',
          description:
            'Couple the ethoxy-substituted benzoic acid ester to the piperidinylphenyl butylamine to form the central amide, then hydrolyse the ester to reveal the free carboxylic acid that the finished molecule carries. Racemisation at the benzylic stereocentre during coupling is the process risk, so the activation chemistry and temperature are the controlled variables.',
          dependsOnStepId: 'rep-w1',
          reagentsAndBuffer:
            'Carbodiimide or mixed-anhydride activation with racemisation-suppressing additive, tertiary amine base, anhydrous dichloromethane or tetrahydrofuran at controlled low temperature, aqueous base for ester hydrolysis',
        },
        {
          id: 'rep-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation with chiral purity and polymorph release',
          description:
            'Recrystallise the free acid to the specified polymorph while confirming enantiomeric excess and controlling the des-ethoxy and unhydrolysed ester impurities. Repaglinide is poorly water soluble and its absolute bioavailability is 56%, so polymorph and particle size sit directly upstream of the exposure the clinical programme measured.',
          dependsOnStepId: 'rep-w2',
          reagentsAndBuffer:
            'Ethanol-water or acetone recrystallisation, chiral and achiral reversed-phase HPLC, X-ray powder diffraction, differential scanning calorimetry, laser diffraction particle sizing',
        },
        {
          id: 'rep-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'CYP2C8 and CYP3A4 phenotyping and OATP1B1 uptake',
          description:
            'Determine the relative contribution of CYP2C8 and CYP3A4 to clearance in human liver microsomes with selective inhibitors, and measure hepatic uptake through the OATP1B1 transporter. This step is where the eightfold gemfibrozil interaction is predictable in advance: gemfibrozil glucuronide is a mechanism-based CYP2C8 inhibitor and also inhibits OATP1B1, so two clearance routes close at once.',
          dependsOnStepId: 'rep-w3',
          reagentsAndBuffer:
            'Pooled and genotyped human liver microsomes, recombinant CYP2C8 and CYP3A4, montelukast and ketoconazole as selective inhibitors, gemfibrozil 1-O-beta-glucuronide, OATP1B1-transfected HEK293 cells, liquid chromatography with tandem mass spectrometry',
        },
        {
          id: 'rep-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Glucose-dependent insulin secretion and cardiac channel counter-screen',
          description:
            'Measure insulin secretion from islets at low and high glucose to test the label claim that release is glucose-dependent and diminishes at low glucose, and counter-screen the cardiac SUR2A and vascular SUR2B channels to test the claim of tissue selectivity. Both are assertions on the label and both are measurable; a page that repeats them without noting they are assay results rather than clinical findings has done the reader no favours.',
          dependsOnStepId: 'rep-w4',
          reagentsAndBuffer:
            'Isolated rodent or human islets, static incubation at 2.8 and 16.7 mmol/L glucose, insulin ELISA, HEK293 cells expressing SUR1/Kir6.2, SUR2A/Kir6.2 and SUR2B/Kir6.1, inside-out patch clamp',
        },
      ],
    },
    keyAudits: [
      {
        id: 'rep-a1',
        category: 'inferred',
        title: 'No study has reported the effect of this class on mortality or morbidity',
        laymanSummary:
          'A Cochrane review gathered every randomised trial of at least ten weeks comparing this class of drugs against placebo, against each other or against metformin. Fifteen trials, 3,781 people. Not one of them measured whether the drugs affect death or disease.',
        technicalDetails:
          'Black and colleagues searched the Cochrane Library, MEDLINE, EMBASE, ongoing-trial databases and the American Diabetes Association and European Association for the Study of Diabetes conference records, and contacted manufacturers, for randomised parallel or crossover trials of at least ten weeks of meglitinide treatment against placebo, head to head, against metformin or in combination with insulin. Fifteen trials involving 3,781 participants met the criteria. Their first stated result is that no included study reported the effect of meglitinides on mortality or morbidity. Across eleven placebo-controlled studies, repaglinide reduced HbA1c by 0.1 to 2.1 percentage points and nateglinide by 0.2 to 0.6. The reviewers concluded that meglitinides may offer an oral agent of similar potency to metformin where metformin is not tolerated or is contraindicated, but that there is no evidence available to indicate what effect meglitinides will have on important long-term outcomes, particularly mortality. That review was published in 2007, ten years after approval; no cardiovascular outcome trial of repaglinide has reported since.',
        evidenceSource:
          'Black C, Donnelly P, McIntyre L, Royle PL, Shepherd JP, Thomas S. Cochrane Database Syst Rev 2007;(2):CD004654 (PMID 17443551)',
        doi: '10.1002/14651858.CD004654.pub2',
        inferredClaim:
          'That lowering HbA1c with repaglinide reduces any clinical event — fifteen randomised trials in 3,781 people contain no measurement of mortality or morbidity, and the label states no macrovascular benefit has been conclusively established',
        auditFlag: 'caution',
      },
      {
        id: 'rep-a2',
        category: 'measured',
        title: 'Gemfibrozil raises exposure 8.1-fold, and the combination is contraindicated',
        laymanSummary:
          'A cholesterol drug commonly given to people with diabetes turns out to block the liver enzyme that clears repaglinide. In twelve volunteers it multiplied drug exposure eightfold and turned a short-acting tablet into a long-acting one. Combining them is now forbidden on the label.',
        technicalDetails:
          'Niemi and colleagues ran a randomised crossover study in 12 healthy volunteers who received gemfibrozil 600 mg twice daily, itraconazole, both, or placebo for three days, then a single 0.25 mg dose of repaglinide. Gemfibrozil raised the area under the repaglinide concentration-time curve 8.1-fold (range 5.5 to 15.0, p<0.001) and prolonged half-life from 1.3 to 3.7 hours (p<0.001). Itraconazole alone raised exposure 1.4-fold; the combination raised it 19.4-fold (range 12.9 to 24.7) and prolonged half-life to 6.1 hours. Plasma repaglinide at seven hours rose 28.6-fold with gemfibrozil and 70.4-fold with the combination (p<0.001). The authors reported that gemfibrozil alone and with itraconazole considerably enhanced and prolonged the glucose-lowering effect, and that repaglinide "became a long-acting and stronger antidiabetic". The FDA label now lists concomitant gemfibrozil under CONTRAINDICATIONS, and records clopidogrel raising exposure 3.9 to 5.1-fold and cyclosporine 2.5-fold.',
        evidenceSource:
          'Niemi M, Backman JT, Neuvonen M, Neuvonen PJ. Diabetologia 2003;46:347-351; FDA prescribing information for repaglinide tablets, sections 4 and 7',
        doi: '10.1007/s00125-003-1034-7',
        measuredMetric:
          'Fold change in repaglinide area under the curve, half-life and 7-hour plasma concentration with gemfibrozil alone and with itraconazole, in a randomised crossover study of 12 volunteers',
        auditFlag: 'verified',
      },
      {
        id: 'rep-a3',
        category: 'failed',
        title: 'Combined with NPH insulin it produced six myocardial ischaemia events to one',
        laymanSummary:
          'Across seven controlled trials, six serious events of reduced blood flow to the heart occurred in people taking repaglinide together with NPH insulin, against one in people on insulin alone. That combination is now explicitly not indicated.',
        technicalDetails:
          'The FDA label states, under Warnings and Precautions 5.2: "Across seven controlled trials, there were six serious adverse events of myocardial ischemia in patients treated with repaglinide plus NPH-insulin from two studies, and one event in patients using insulin formulations alone from another study." The label concludes that repaglinide is not indicated for use in combination with NPH insulin. Six events against one is a small number in absolute terms and the comparison is across studies rather than within a randomised contrast, which is exactly why it produced a labelling restriction rather than a mechanistic claim. It is nonetheless the only cardiovascular signal that has ever been attached to this drug, and it points in the wrong direction.',
        evidenceSource:
          'FDA prescribing information for repaglinide tablets, section 5.2 Serious Cardiovascular Adverse Reactions with Concomitant Use with NPH-insulin',
        measuredMetric:
          'Count of serious myocardial ischaemia adverse events with repaglinide plus NPH insulin against insulin alone, across seven controlled trials',
        auditFlag: 'caution',
      },
      {
        id: 'rep-a4',
        category: 'measured',
        title: 'Similar HbA1c to metformin, with more weight and more hypoglycaemia',
        laymanSummary:
          'Where the two were compared head to head, repaglinide brought average blood sugar down about as much as metformin. It also added up to three kilograms in three months and caused more low blood sugar, though rarely severe.',
        technicalDetails:
          'The Cochrane review pooled three trials with 248 participants comparing repaglinide against metformin and found a similar degree of HbA1c reduction. Weight gain was generally greater with meglitinides than with metformin, up to three kilograms in three months. Diarrhoea occurred less frequently and hypoglycaemia occurred more frequently, but rarely severely enough to require assistance. Two trials totalling 342 participants compared repaglinide against nateglinide, with greater HbA1c reduction on repaglinide. The reviewers described meglitinides as a possible alternative of similar potency to metformin where metformin is intolerable or contraindicated — a conditional recommendation, made in the absence of any long-term outcome data at all.',
        evidenceSource: 'Black C et al., Cochrane Database Syst Rev 2007;(2):CD004654',
        doi: '10.1002/14651858.CD004654.pub2',
        measuredMetric:
          'Pooled HbA1c reduction, weight change, diarrhoea and hypoglycaemia frequency for repaglinide against metformin across three randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'rep-a5',
        category: 'measured',
        title: 'It is in and out within hours, which is the entire design rationale',
        laymanSummary:
          'The tablet reaches peak levels within an hour and half of it is cleared within about ninety minutes. That short window is what the drug was built for: cover a meal, then stop.',
        technicalDetails:
          'The label reports complete gastrointestinal absorption, absolute bioavailability of 56%, peak plasma concentration within one hour, and a half-life of 1.0 to 1.4 hours with an individual range from 0.4 to 8.0 hours. Total body clearance is 38 ± 16 L/hr and volume of distribution at steady state 31 ± 12 L. Clearance does not change across the 0.5 to 4 mg range, indicating linear pharmacokinetics, and the drug does not accumulate in serum on repeated dosing. The individual half-life range reaching 8.0 hours is worth noting alongside the mean: the population value is short, and some individuals are not.',
        evidenceSource:
          'FDA prescribing information for repaglinide tablets, section 12.3 Pharmacokinetics, Tables 5 and 6',
        measuredMetric:
          'Absolute bioavailability, time to peak concentration, half-life with individual range, clearance and volume of distribution',
        auditFlag: 'verified',
      },
      {
        id: 'rep-a6',
        category: 'inferred',
        title: 'The tissue-selectivity and glucose-dependence claims are assay results',
        laymanSummary:
          'The label says insulin release on this drug is glucose-dependent and falls off when blood sugar is low, and that the drug barely touches the channels in heart and muscle. Both are laboratory findings. Neither has been shown to translate into fewer clinical events.',
        technicalDetails:
          'The mechanism section of the label states that "insulin release is glucose-dependent and diminishes at low glucose concentrations" and that "the ion channel mechanism is highly tissue selective with low affinity for heart and skeletal muscle". Both statements describe in vitro pharmacology. The clinical consequence that would follow — less hypoglycaemia and no cardiac liability relative to sulfonylureas — has not been demonstrated in an outcome trial, because no outcome trial of repaglinide exists. The Cochrane review found hypoglycaemia occurring more frequently on meglitinides than on metformin, and the only cardiovascular observation attached to the drug is the six-to-one myocardial ischaemia imbalance in combination with NPH insulin. The label separately states that no clinical study has established conclusive evidence of macrovascular risk reduction with repaglinide.',
        evidenceSource:
          'FDA prescribing information for repaglinide tablets, sections 12.1 and 5.3; Black C et al., Cochrane Database Syst Rev 2007;(2):CD004654',
        inferredClaim:
          'That glucose-dependent secretion and low cardiac channel affinity make repaglinide clinically safer than a sulfonylurea — these are in vitro properties, and no trial has compared clinical outcomes between the two classes',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed within an hour and cleared within a few',
        laymanDesc:
          'Taken with a meal, the drug is fully absorbed and peaks within an hour. Half of it is gone in roughly ninety minutes. The whole design is to be present while food is being digested and absent afterwards.',
        molecularDetail:
          'Complete gastrointestinal absorption, absolute bioavailability 56%, peak plasma concentration within one hour, half-life 1.0 to 1.4 hours with an individual range from 0.4 to 8.0 hours, linear clearance from 0.5 to 4 mg and no accumulation.',
        iconName: 'Timer',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It binds its own site on the same channel a sulfonylurea uses',
        laymanDesc:
          'The target is the potassium gate on insulin-producing cells — the same gate the old sulfonylurea tablets close, gripped at a different handhold.',
        molecularDetail:
          'The label states repaglinide closes ATP-dependent potassium channels in the beta-cell membrane "by binding at characterizable sites". The binding site on SUR1 is distinct from the classical sulfonylurea site, which is why the two classes are not simply additive at the receptor.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The channel closes, the cell depolarises, calcium enters',
        laymanDesc:
          'With potassium held in, the cell becomes electrically active, calcium channels open, and calcium floods in.',
        molecularDetail:
          'Potassium channel blockade depolarises the beta cell, which opens voltage-gated calcium channels; the resulting calcium influx induces insulin secretion. The label describes this sequence explicitly and notes the mechanism is highly tissue selective with low affinity for heart and skeletal muscle.',
        iconName: 'Zap',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Insulin is released — and the label says the release tracks glucose',
        laymanDesc:
          'Insulin comes out. The label states that this release depends on glucose and falls off when blood sugar is low, which would in principle make hypoglycaemia less likely than on a longer-acting drug.',
        molecularDetail:
          'Insulin release is described as glucose-dependent and diminishing at low glucose concentrations, and as dependent on functioning beta cells. This is in vitro pharmacology; the Cochrane pooling nonetheless found hypoglycaemia more frequent on meglitinides than on metformin.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Two liver enzymes clear it, and both can be blocked',
        laymanDesc:
          'The liver removes the drug using two enzymes. Some common medicines shut one of them down, and when that happens the drug stops being short-acting.',
        molecularDetail:
          'Metabolism is by CYP2C8 and CYP3A4, with hepatic uptake through OATP1B1. Gemfibrozil, whose glucuronide is a mechanism-based CYP2C8 inhibitor and an OATP1B1 inhibitor, raises exposure 8.1-fold and half-life from 1.3 to 3.7 hours; combined with itraconazole, 19.4-fold and 6.1 hours. Clopidogrel raises exposure 3.9 to 5.1-fold and cyclosporine 2.5-fold.',
        iconName: 'Recycle',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'HbA1c falls — and that is the end of what has been measured',
        laymanDesc:
          'Average blood sugar comes down by somewhere between a tenth of a point and two points, depending on the trial. Beyond that, nothing has been counted: not heart attacks, not kidney failure, not deaths.',
        molecularDetail:
          'Across eleven placebo-controlled trials pooled by Cochrane, repaglinide reduced HbA1c by 0.1 to 2.1 percentage points. The same review states that no included study reported the effect of meglitinides on mortality or morbidity, and the label states no clinical study has established conclusive evidence of macrovascular risk reduction with repaglinide.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane review of meglitinide analogues for type 2 diabetes',
        phase: 'Systematic review and meta-analysis of 15 randomised trials of at least 10 weeks',
        sampleSize: 3781,
        primaryEndpoint:
          'Effects of meglitinide analogues on glycaemic control, mortality, morbidity, weight and adverse events against placebo, head to head, or against metformin',
        endpointMet: false,
        statisticalPValue:
          'HbA1c reduction of 0.1 to 2.1 percentage points for repaglinide across eleven placebo-controlled studies; no pooled effect estimate for mortality or morbidity was possible',
        unreportedAdverseSignals:
          'The reviewers state that no included study reported the effect of meglitinides on mortality or morbidity, and that there is no evidence available to indicate what effect meglitinides will have on important long-term outcomes, particularly mortality.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Niemi 2003 gemfibrozil and itraconazole interaction study',
        phase: 'Randomised crossover pharmacokinetic and pharmacodynamic study in healthy volunteers',
        sampleSize: 12,
        primaryEndpoint:
          'Effect of gemfibrozil, itraconazole and their combination on repaglinide pharmacokinetics and blood glucose response',
        endpointMet: true,
        statisticalPValue:
          'P < 0.001 for an 8.1-fold increase in area under the curve with gemfibrozil and a 19.4-fold increase with the combination; half-life prolonged from 1.3 to 3.7 and 6.1 hours',
        unreportedAdverseSignals:
          'Twelve healthy volunteers at a single 0.25 mg dose. The clinical consequence in people with diabetes taking therapeutic doses is inferred from the magnitude, not measured — which is why the outcome was a contraindication rather than a warning.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Repaglinide plus NPH insulin safety observation across seven controlled trials',
        phase: 'Cross-study adverse event tabulation reported on the FDA label',
        sampleSize: 7,
        primaryEndpoint:
          'Serious adverse events of myocardial ischaemia with repaglinide plus NPH insulin against insulin formulations alone',
        endpointMet: false,
        statisticalPValue:
          'Six events with repaglinide plus NPH insulin across two studies against one event on insulin alone in another study; no statistical comparison is reported on the label',
        unreportedAdverseSignals:
          'This is a count across non-randomised comparisons between different studies, not a within-trial contrast. The sample size field is the number of controlled trials tabulated, not a participant count, which the label does not give.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'An HbA1c reduction of 0.1 to 2.1 percentage points across eleven placebo-controlled randomised trials',
        'A similar HbA1c effect to metformin in three trials and 248 participants, with up to three kilograms more weight gain in three months and more frequent hypoglycaemia',
        'An 8.1-fold increase in repaglinide exposure with gemfibrozil, and 19.4-fold with gemfibrozil plus itraconazole, in 12 randomised volunteers',
        'Absolute bioavailability of 56%, peak within one hour and a half-life of 1.0 to 1.4 hours with an individual range up to 8.0 hours',
      ],
      unsupportedInferences: [
        'That repaglinide changes any clinical outcome — the Cochrane review of 15 trials in 3,781 people states that no study reported an effect on mortality or morbidity',
        'That glucose-dependent secretion makes it clinically safer than a sulfonylurea — that is an in vitro property, and no trial has compared the classes for clinical outcomes',
        'That low affinity for cardiac and skeletal muscle channels confers cardiovascular safety — the only cardiovascular observation attached to the drug is an unfavourable one, in combination with NPH insulin',
        'That the short half-life protects against hypoglycaemia in every patient — the individual half-life range on the label extends to 8.0 hours, and enzyme inhibitors extend it much further',
      ],
      whatFailedInitially: [
        'Six serious myocardial ischaemia events against one, in combination with NPH insulin, produced a labelling restriction against that combination',
        'The gemfibrozil interaction was not recognised until 2003, six years after approval, and it moved the drug from marketed to contraindicated with a common fibrate',
        'No cardiovascular outcome trial of repaglinide has ever been run, nearly thirty years after approval; nateglinide, the other drug in the class, was tested and failed',
      ],
      realWorldOutcome: [
        'US$0.0937 per tablet at United States pharmacy acquisition cost, the median across 17 listed generic products in the CMS NADAC survey',
        'Cleared chiefly by the liver rather than the kidney, which is the usual clinical argument for choosing it over a sulfonylurea',
        'Contraindicated with gemfibrozil, and use with clopidogrel is to be avoided — both common medicines in the population that takes this drug',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet taken before meals, in 0.5 mg, 1 mg and 2 mg strengths',
      description:
        'A conventional immediate-release tablet of a poorly water-soluble carboxylic acid, taken in relation to meals rather than at a fixed time of day. The pharmacokinetics are what make that structure necessary rather than optional: peak concentration within an hour and a half-life near ninety minutes mean the drug covers a single meal and nothing else.',
      safetyProfile:
        'Hypoglycaemia can occur and can be severe, causing seizures and, rarely, death; the label notes awareness may be blunted in longstanding diabetes, diabetic neuropathy, beta-blocker use or recurrent hypoglycaemia. Concomitant gemfibrozil is a contraindication because it raises exposure 8.1-fold. Clopidogrel is to be avoided and cyclosporine requires caution. Combination with NPH insulin is not indicated after six serious myocardial ischaemia events were recorded against one on insulin alone. Weight gain occurs. The label states there have been no clinical studies establishing conclusive evidence of macrovascular risk reduction with repaglinide.',
    },
    commonQuestions: [
      {
        q: 'Has anyone ever measured whether this drug helps people live longer?',
        a: 'No. That is not a rhetorical framing — it is the first stated result of the Cochrane review of the class. Fifteen randomised trials involving 3,781 participants met the inclusion criteria, and the reviewers report that no included study reported the effect of meglitinides on mortality or morbidity, concluding that there is no evidence available to indicate what effect these drugs will have on important long-term outcomes, particularly mortality. That was published in 2007, ten years after approval. Nearly twenty years later, no cardiovascular outcome trial of repaglinide has reported. The drug has been shown to lower HbA1c and nothing else.',
        auditNote:
          'The other drug in this class, nateglinide, was tested in a 9,306-patient outcome trial. It failed. Repaglinide has never been tested.',
      },
      {
        q: 'Why is it forbidden with a cholesterol drug?',
        a: 'Because gemfibrozil closes the main route by which the body clears repaglinide, and the effect is enormous. In a randomised crossover study of twelve healthy volunteers, three days of gemfibrozil raised repaglinide exposure 8.1-fold and stretched its half-life from 1.3 hours to 3.7. Adding itraconazole took exposure to 19.4-fold and the seven-hour plasma concentration to 70.4 times control. The investigators wrote that repaglinide "became a long-acting and stronger antidiabetic" — which for a drug whose entire safety argument rests on being short-acting is the specific thing that must not happen. The FDA moved the combination into the contraindications section. Clopidogrel, which is not obscure either, raises exposure around four to fivefold and is to be avoided.',
      },
      {
        q: 'Is it safer than a sulfonylurea?',
        a: 'The pharmacology argues yes and the clinical evidence does not exist. The label states that insulin release on repaglinide is glucose-dependent and diminishes at low glucose, and that the ion channel mechanism is highly tissue selective with low affinity for heart and skeletal muscle. Both are laboratory measurements, and both are the kind of finding that should translate into less hypoglycaemia and no cardiac liability. Nobody has run the trial. The Cochrane pooling found hypoglycaemia more frequent on meglitinides than on metformin, and the only cardiovascular observation ever attached to repaglinide is unfavourable: six serious myocardial ischaemia events in combination with NPH insulin against one on insulin alone.',
      },
      {
        q: 'What is the point of a short-acting version?',
        a: 'To match the drug to the meal rather than to the day. A sulfonylurea keeps pushing insulin out for many hours after the food has gone, which is where between-meal and overnight hypoglycaemia comes from. Repaglinide peaks within an hour of a dose and has a half-life of 1.0 to 1.4 hours, so the exposure is tied to eating. The design also means the drug is cleared mainly by the liver rather than the kidney, which is why it is sometimes chosen when kidney function is poor. The individual half-life range on the label reaches 8.0 hours, so the short duration is a population average and not a guarantee for a particular person.',
      },
      {
        q: 'Does this page show what the drug costs to make?',
        a: 'No, because no verifiable per-dose cost-of-production figure for repaglinide could be found and cited. The figure shown is what United States pharmacies pay to acquire it — US$0.0937 per tablet, the median across 17 listed generic products in the CMS National Average Drug Acquisition Cost survey. That is a price, not a manufacturing cost, and this page will not guess at the difference.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Black C, Donnelly P, McIntyre L, Royle PL, Shepherd JP, Thomas S. Meglitinide analogues for type 2 diabetes mellitus. Cochrane Database Syst Rev 2007;(2):CD004654',
        identifier: '10.1002/14651858.CD004654.pub2',
        kind: 'doi',
      },
      {
        label:
          'Niemi M, Backman JT, Neuvonen M, Neuvonen PJ. Effects of gemfibrozil, itraconazole, and their combination on the pharmacokinetics and pharmacodynamics of repaglinide: potentially hazardous interaction between gemfibrozil and repaglinide. Diabetologia 2003;46:347-351',
        identifier: '10.1007/s00125-003-1034-7',
        kind: 'doi',
      },
      {
        label:
          'FDA prescribing information for repaglinide tablets — section 4 CONTRAINDICATIONS (gemfibrozil), 5.1 to 5.3, 7 DRUG INTERACTIONS, 12.1 and 12.3',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22repaglinide%22',
        kind: 'regulatory',
      },
      {
        label:
          'openFDA Drugs@FDA — NDA 020741 (PRANDIN, original approval 22 December 1997; application now held by Gemini Laboratories LLC)',
        identifier: 'https://api.fda.gov/drug/drugsfda.json?search=products.brand_name:%22PRANDIN%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 65981 — repaglinide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/65981',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Saxagliptin — the drug that proved the point of mandatory cardiovascular outcome trials by
  //     being the first modern diabetes agent one of them caught. Neutral on heart attacks, and 27%
  //     more heart-failure hospitalisations.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'saxagliptin',
    name: 'Saxagliptin',
    tradeName: 'Onglyza',
    sponsor:
      'AstraZeneca AB (NDA 022350), developed in alliance with Bristol-Myers Squibb; generics now marketed',
    targetGene: 'DPP4',
    targetProtein:
      'Dipeptidyl peptidase-4 (DPP-4, CD26), a serine exopeptidase that cleaves and inactivates the incretin hormones GLP-1 and GIP within minutes of their release',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2009,
    indication:
      'As an adjunct to diet and exercise to improve glycaemic control in adults with type 2 diabetes mellitus. Not recommended for the treatment of type 1 diabetes mellitus or diabetic ketoacidosis.',
    patientFriendlyIndication: 'Type 2 diabetes — a tablet that makes the gut hormone signal last longer',
    anatomicalSite:
      'Plasma and the endothelial surface, where DPP-4 circulates and is membrane-anchored; the downstream effect is on pancreatic alpha and beta cells',
    conditionContext: {
      conditionExplainer:
        'When food arrives, the small intestine releases hormones that tell the pancreas to make insulin — but only while blood sugar is high. An enzyme in the blood destroys those hormones within minutes. Saxagliptin blocks the enzyme, so the signal lasts longer.',
      whyItMatters:
        'Because the hormone signal itself is glucose-dependent, prolonging it does not cause hypoglycaemia the way forcing insulin out does. That was the class advantage. The question nobody had answered when these drugs were licensed was whether any of it prevents anything — and when a 16,492-patient trial finally asked, the answer on heart attacks was no and on heart failure was worse than no.',
      whoTakesThis:
        'Adults with type 2 diabetes, usually added to metformin, and particularly where hypoglycaemia is the constraint. It is now generic.',
      clinicalGoals:
        'Lower HbA1c without hypoglycaemia. The 16,492-patient outcome trial concluded that although saxagliptin improves glycaemic control, other approaches are necessary to reduce cardiovascular risk.',
    },
    oneSentenceVerdict:
      'A competitive inhibitor of the enzyme that destroys the gut hormones GLP-1 and GIP, which lowers blood sugar without causing hypoglycaemia on its own — and which, in a 16,492-patient randomised trial, changed the rate of cardiovascular death, heart attack and ischaemic stroke by nothing at all (hazard ratio 1.00) while raising hospitalisation for heart failure by 27% (hazard ratio 1.27, 95% CI 1.07 to 1.51, p=0.007), a finding now written into its label.',
    laymanHowItWorks:
      'Eating triggers the gut to release hormones that tell the pancreas to release insulin — but only while blood sugar is actually high, which is why they do not cause hypoglycaemia. An enzyme circulating in the blood chews those hormones up within a couple of minutes. Saxagliptin plugs that enzyme, so the hormones survive longer and their signal is stronger. The pancreas makes more insulin after meals and less glucagon, and the liver stops pushing out extra sugar.',
    auditConfidence: 'High Confidence',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.14 per tablet at United States pharmacy acquisition cost, the median across 16 listed products in the CMS NADAC survey effective 19 August 2026',
      markupEstimate: '',
      openPatentNotes:
        'Approved as Onglyza under NDA 022350 on 31 July 2009. Now off patent with generics in the current NADAC file, which is why the median acquisition cost is US$1.14 rather than the branded price. It remains roughly twelve times the price of the most expensive sulfonylurea on this site and about six times the price of acarbose.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Every DPP-4 inhibitor lowers HbA1c by a similar modest amount without hypoglycaemia, and every one of them has an outcome trial designed to exclude harm rather than demonstrate benefit. Saxagliptin is the one whose trial found harm. Against glimepiride, the DPP-4 inhibitor linagliptin was non-inferior on cardiovascular events with about a quarter of the hypoglycaemia; against placebo, saxagliptin was neutral on ischaemic events and worse on heart failure. The classes that have shown benefit on hard endpoints — SGLT2 inhibitors and GLP-1 receptor agonists — are different drugs entirely.',
      conventionalRx: [
        {
          name: 'Sitagliptin',
          class: 'DPP-4 inhibitor',
          howItCompares:
            'The same mechanism with a different molecule and a different outcome trial. No head-to-head cardiovascular comparison exists between the two. In the GRADE trial, sitagliptin was the weakest of four second-line agents at holding HbA1c below 7.0%, at 38.1 events per 100 participant-years against 30.4 for glimepiride, 26.5 for insulin glargine and 26.1 for liraglutide.',
          typicalCost: 'No NADAC figure for sitagliptin is held on this record',
          prosAndCons:
            'Pros: no heart-failure signal in its own outcome trial. Cons: same class, same modest glycaemic effect, same absence of demonstrated benefit.',
        },
        {
          name: 'Alogliptin',
          class: 'DPP-4 inhibitor',
          howItCompares:
            'The other DPP-4 inhibitor whose United States label carries a heart-failure discussion. Its outcome trial, EXAMINE, was run in patients recently hospitalised with acute coronary syndrome and was neutral on its primary endpoint.',
          typicalCost: 'US$5.18 per tablet at NADAC, more than four times saxagliptin',
          prosAndCons:
            'Pros: tested in the highest-risk population any DPP-4 trial enrolled. Cons: much more expensive at acquisition cost, and no benefit demonstrated.',
        },
        {
          name: 'SGLT2 inhibitors',
          class: 'Sodium-glucose cotransporter 2 inhibitors',
          howItCompares:
            'The class that reduces heart-failure hospitalisation, which is the specific harm saxagliptin was found to cause. Their outcome trials met superiority endpoints rather than non-inferiority margins.',
          typicalCost: 'Mostly branded and considerably more expensive',
          prosAndCons:
            'Pros: demonstrated reductions in heart-failure hospitalisation and renal outcomes. Cons: genital mycotic infection, volume depletion, and a rare risk of euglycaemic ketoacidosis.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report breathlessness, ankle swelling or sudden weight gain rather than waiting',
          action:
            'The heart-failure finding in SAVOR-TIMI 53 is on the label, and the label asks patients to be told the characteristic symptoms of heart failure and to report them immediately. Those symptoms are breathlessness on exertion or lying flat, swelling of the ankles or abdomen, and rapid unexplained weight gain.',
          patientImpact:
            'In SAVOR-TIMI 53, 289 of 8,280 patients on saxagliptin (3.5%) were hospitalised for heart failure against 228 of 8,212 on placebo (2.8%), hazard ratio 1.27 (95% CI 1.07 to 1.51). The label notes that patients with a prior history of heart failure and those with renal impairment had a higher risk irrespective of which treatment they received.',
          clinicalPrecaution:
            'Symptoms of heart failure need medical assessment, not self-management. Any change to a diabetes regimen belongs with the prescribing clinician. This page gives no dosing guidance of any kind.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1[C@@H]2C[C@@H]2N([C@@H]1C#N)C(=O)[C@H](C34CC5CC(C3)CC(C5)(C4)O)N',
      chemicalFormula: 'C18H25N3O2',
      molecularWeight: '315.40 g/mol',
      targetReceptorAffinity:
        'A competitive DPP-4 inhibitor. The FDA label explains the chain: GLP-1 and GIP are released from the small intestine in response to meals, cause glucose-dependent insulin release from beta cells, and are inactivated by DPP-4 within minutes; GLP-1 additionally lowers glucagon secretion from alpha cells and so reduces hepatic glucose production. In type 2 diabetes GLP-1 concentrations are reduced while the insulin response to GLP-1 is preserved, which is the therapeutic opening. Saxagliptin slows that inactivation and lowers fasting and post-prandial glucose in a glucose-dependent manner. It carries an adamantyl group and a cyanopyrrolidine warhead that forms a reversible covalent adduct with the catalytic serine. CYP3A4 and CYP3A5 convert it to 5-hydroxysaxagliptin, an active metabolite whose plasma exposure after a 5 mg dose is roughly three times that of the parent — 214 against 78 ng·h/mL.',
      structureSource: {
        label:
          'PubChem CID 11243969 (saxagliptin) — SMILES, molecular formula and weight, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11243969',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'sax-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Stereochemical release of the adamantylglycine and the cyanopyrrolidine',
          description:
            'Confirm identity and stereochemistry of the 3-hydroxyadamantyl glycine fragment and the (1S,3S,5S)-2-azabicyclo[3.1.0]hexane-3-carbonitrile. Saxagliptin has three defined stereocentres in the bicyclic nitrile alone; the wrong configuration binds DPP-4 far more weakly, so enantiomeric and diastereomeric purity is a potency specification rather than a cosmetic one.',
          reagentsAndBuffer:
            'Chiral HPLC and supercritical fluid chromatography, optical rotation, two-dimensional nuclear magnetic resonance, Karl Fischer water determination, cyanide content by ion chromatography',
        },
        {
          id: 'sax-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amide coupling of the protected amino acid to the bicyclic nitrile',
          description:
            'Couple the Boc-protected hydroxyadamantyl glycine to the strained bicyclic proline nitrile, then deprotect. The cyanopyrrolidine is the reactive warhead and it is also the process liability: under acidic or basic conditions the free amine cyclises intramolecularly onto the nitrile to give an inactive cyclic amidine, which is the principal degradation product of the drug substance.',
          dependsOnStepId: 'sax-w1',
          reagentsAndBuffer:
            'Carbodiimide or uronium coupling reagent with hydroxybenzotriazole additive, tertiary amine base, anhydrous dichloromethane at controlled low temperature, acidic Boc deprotection with immediate neutralisation',
        },
        {
          id: 'sax-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Salt or hydrate selection and cyclic amidine control',
          description:
            'Crystallise as the specified hydrate or salt form and control the cyclic amidine degradant to monograph limits, including under accelerated stability conditions. This impurity forms on storage as well as in the reactor, so the specification has to be met at release and again at the end of shelf life.',
          dependsOnStepId: 'sax-w2',
          reagentsAndBuffer:
            'Aqueous-organic recrystallisation, reversed-phase HPLC with ultraviolet detection and mass-spectrometric peak identification, X-ray powder diffraction, dynamic vapour sorption, accelerated stability chambers at 40 degrees Celsius and 75% relative humidity',
        },
        {
          id: 'sax-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'CYP3A4/5 conversion to 5-hydroxysaxagliptin and renal clearance modelling',
          description:
            'Quantify formation of the active 5-hydroxy metabolite in human liver microsomes and hepatocytes, and characterise renal handling of both parent and metabolite. This step matters clinically: the active metabolite carries roughly three times the plasma exposure of the parent after a single dose, and both are renally cleared, so kidney function changes total active exposure more than it changes parent concentration alone.',
          dependsOnStepId: 'sax-w3',
          reagentsAndBuffer:
            'Pooled human liver microsomes and cryopreserved hepatocytes, recombinant CYP3A4 and CYP3A5, ketoconazole as a selective inhibitor, synthesised 5-hydroxysaxagliptin standard, renal proximal tubule transporter panel, liquid chromatography with tandem mass spectrometry',
        },
        {
          id: 'sax-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'DPP-4 inhibition with DPP-8 and DPP-9 counter-screens, and active GLP-1 measurement',
          description:
            'Measure DPP-4 inhibition and plasma DPP-4 activity, counter-screen the closely related DPP-8 and DPP-9 enzymes, and quantify intact active GLP-1 after a meal challenge. The DPP-8 and DPP-9 counter-screen is not optional history: non-selective inhibitors of this family produced severe toxicity in preclinical species, and selectivity is the property that separates a drug from a compound in this class.',
          dependsOnStepId: 'sax-w4',
          reagentsAndBuffer:
            'Recombinant human DPP-4, DPP-8, DPP-9 and fibroblast activation protein, Gly-Pro-aminomethylcoumarin fluorogenic substrate, human plasma for ex vivo enzyme activity, DPP-4 inhibitor-stabilised blood tubes, active GLP-1 (7-36 amide) immunoassay',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sax-a1',
        category: 'failed',
        title: 'SAVOR-TIMI 53 found 27% more hospitalisations for heart failure',
        laymanSummary:
          'The trial required to prove saxagliptin did not cause harm found harm — not the harm it was looking for. Heart attacks and strokes were unchanged. Admissions to hospital for heart failure rose from 2.8% to 3.5%, and the finding is now printed on the label.',
        technicalDetails:
          'SAVOR-TIMI 53 randomised 16,492 patients with type 2 diabetes who had a history of, or were at risk for, cardiovascular events to saxagliptin or placebo, with physicians free to adjust other therapy, and followed them a median 2.1 years. More patients on saxagliptin were hospitalised for heart failure: 3.5% against 2.8%, hazard ratio 1.27 (95% CI 1.07 to 1.51, p=0.007). The FDA label reproduces the counts — 289 of 8,280 against 228 of 8,212 — and adds that patients with prior heart failure and those with renal impairment were at higher risk irrespective of treatment assignment. Section 5.2 of the label instructs prescribers to consider the risks and benefits before initiating in patients at higher risk of heart failure, to observe for signs and symptoms during therapy, to advise patients of the characteristic symptoms and to report them immediately, and to consider discontinuation if heart failure develops.',
        evidenceSource:
          'Scirica BM et al., N Engl J Med 2013;369:1317-1326 (SAVOR-TIMI 53, NCT01107886); FDA prescribing information for saxagliptin tablets, section 5.2',
        doi: '10.1056/NEJMoa1307684',
        measuredMetric:
          'Hazard ratio and absolute rates of hospitalisation for heart failure over a median 2.1 years in 16,492 randomised patients',
        auditFlag: 'verified',
      },
      {
        id: 'sax-a2',
        category: 'measured',
        title: 'On the endpoint it was built to test, the result was exactly nothing',
        laymanSummary:
          'The primary endpoint was cardiovascular death, heart attack or ischaemic stroke. It happened to 7.3% of the saxagliptin group and 7.2% of the placebo group. The hazard ratio was 1.00.',
        technicalDetails:
          'A primary endpoint event occurred in 613 patients on saxagliptin and 609 on placebo — 7.3% and 7.2% by two-year Kaplan-Meier estimate — hazard ratio 1.00 (95% CI 0.89 to 1.12), p=0.99 for superiority and p<0.001 for non-inferiority. The on-treatment analysis agreed at 1.03 (95% CI 0.91 to 1.17). The major secondary endpoint, a broader composite adding hospitalisation for unstable angina, coronary revascularisation and heart failure, occurred in 1,059 against 1,034 patients — 12.8% and 12.4% — hazard ratio 1.02 (95% CI 0.94 to 1.11, p=0.66). The trial authors concluded that DPP-4 inhibition with saxagliptin did not increase or decrease the rate of ischaemic events, and that "although saxagliptin improves glycemic control, other approaches are necessary to reduce cardiovascular risk in patients with diabetes."',
        evidenceSource: 'Scirica BM et al., N Engl J Med 2013;369:1317-1326 (NCT01107886)',
        doi: '10.1056/NEJMoa1307684',
        measuredMetric:
          'Hazard ratios for the primary composite of cardiovascular death, myocardial infarction or ischaemic stroke, and for the major secondary composite, in 16,492 patients',
        auditFlag: 'verified',
      },
      {
        id: 'sax-a3',
        category: 'conclusion_shift',
        title: 'This is the trial that justified making outcome trials compulsory',
        laymanSummary:
          'After rosiglitazone, the FDA started requiring every new diabetes drug to prove it did not increase cardiovascular risk. Saxagliptin was among the first drugs put through that requirement, and it was the first whose trial found a problem the licensing programme had missed entirely.',
        technicalDetails:
          'The DPP-4 inhibitors were licensed on HbA1c in phase 3 programmes that were not designed or powered to detect a difference in heart-failure hospitalisation. The signal in SAVOR-TIMI 53 emerged only because 16,492 patients were followed with adjudicated endpoints over a median 2.1 years — roughly two orders of magnitude more patient-years than a registration programme provides. The consequence was a labelling change rather than a withdrawal: the current United States label devotes a numbered warnings section to heart failure and reproduces the trial counts. The same class effect discussion appears on the alogliptin label. What changed was not the drug but what is known about it, and the mechanism by which that knowledge arrived was a regulatory requirement introduced because of a different drug entirely.',
        evidenceSource:
          'Scirica BM et al., N Engl J Med 2013;369:1317-1326; FDA prescribing information for saxagliptin tablets, section 5.2',
        doi: '10.1056/NEJMoa1307684',
        measuredMetric:
          'The heart-failure hazard ratio detectable only at 16,492 patients and a median 2.1 years, against a registration programme powered on HbA1c',
        auditFlag: 'verified',
      },
      {
        id: 'sax-a4',
        category: 'measured',
        title: 'Acute pancreatitis was numerically higher and not statistically distinguishable',
        laymanSummary:
          'Pancreatitis was the safety worry that dominated discussion of this class before the trial. In 16,413 patients it occurred in 17 on saxagliptin and 9 on placebo — 0.2% against 0.1%.',
        technicalDetails:
          'The FDA label reports that in SAVOR, definite acute pancreatitis was confirmed in 17 of 8,240 patients receiving saxagliptin (0.2%) against 9 of 8,173 receiving placebo (0.1%). Pre-existing risk factors for pancreatitis were identified in 15 of the 17 saxagliptin cases (88%) and in all 9 placebo cases. The published trial reports rates of adjudicated acute pancreatitis as similar between groups at 0.3% and 0.2%, and chronic pancreatitis at below 0.1% and 0.1%. The label nonetheless carries a numbered pancreatitis warning on the strength of postmarketing reports, instructing prompt discontinuation if pancreatitis is suspected. Twenty-six events across sixteen thousand patients is a small enough number that the confidence interval around any ratio would be wide, and the label does not present one.',
        evidenceSource:
          'FDA prescribing information for saxagliptin tablets, section 5.1; Scirica BM et al., N Engl J Med 2013;369:1317-1326',
        doi: '10.1056/NEJMoa1307684',
        measuredMetric:
          'Confirmed definite acute pancreatitis counts and rates by arm in the cardiovascular outcome trial, with pre-existing risk factor prevalence',
        auditFlag: 'caution',
      },
      {
        id: 'sax-a5',
        category: 'measured',
        title: 'Two class harms were only discovered after approval',
        laymanSummary:
          'Severe disabling joint pain and a blistering skin disease serious enough to require hospital admission were both added to the labels of this drug class from postmarketing reports, not from the trials that licensed them.',
        technicalDetails:
          'The current saxagliptin label carries two warnings derived entirely from postmarketing surveillance. Section 5.5 states that severe and disabling arthralgia has been reported in patients taking DPP-4 inhibitors, and instructs prescribers to consider the drug as a possible cause of severe joint pain and to discontinue if appropriate. Section 5.6 states that there have been postmarketing reports of bullous pemphigoid requiring hospitalisation in patients taking DPP-4 inhibitors, instructs that patients be told to report blisters or erosions, and requires discontinuation if bullous pemphigoid is suspected. Section 5.4 records postmarketing reports of serious hypersensitivity reactions including anaphylaxis, angioedema and exfoliative skin conditions. None of these appeared in the registration programme; all are class findings that accumulated after tens of millions of patient-exposures.',
        evidenceSource:
          'FDA prescribing information for saxagliptin tablets, sections 5.4, 5.5 and 5.6',
        measuredMetric:
          'Postmarketing-derived warnings for arthralgia, bullous pemphigoid and serious hypersensitivity added to the label after approval',
        auditFlag: 'caution',
      },
      {
        id: 'sax-a6',
        category: 'inferred',
        title: 'The active metabolite carries three times the exposure of the parent drug',
        laymanSummary:
          'The liver converts saxagliptin into a second compound that also blocks the enzyme, and there is about three times as much of it in the blood. Both are cleared by the kidney, so kidney function changes total active drug more than a parent-drug measurement suggests.',
        technicalDetails:
          'The label reports that after a single 5 mg oral dose in healthy subjects, mean plasma area under the curve was 78 ng·h/mL for saxagliptin and 214 ng·h/mL for the active metabolite 5-hydroxysaxagliptin, with peak concentrations of 24 and 47 ng/mL respectively. Exposure to both increases proportionally from 2.5 to 400 mg, variability is under 25%, and neither accumulates on repeated once-daily dosing. Formation of the metabolite is by CYP3A4 and CYP3A5, so strong inhibitors of those enzymes shift the parent-to-metabolite ratio. Both species are renally eliminated. A page describing this drug purely in terms of the parent compound is describing a quarter of the circulating active material.',
        evidenceSource:
          'FDA prescribing information for saxagliptin tablets, section 12.3 Pharmacokinetics',
        inferredClaim:
          'That saxagliptin plasma concentration describes the drug exposure — the active 5-hydroxy metabolite carries roughly three times the area under the curve, and both depend on renal clearance',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A meal makes the gut release two short-lived hormones',
        laymanDesc:
          'When food reaches the small intestine, cells there release hormones into the blood that prime the pancreas for the glucose about to arrive.',
        molecularDetail:
          'GLP-1 is released from intestinal L cells and GIP from K cells in response to nutrient arrival. The label states these hormones cause insulin release from pancreatic beta cells in a glucose-dependent manner. In type 2 diabetes GLP-1 concentrations are reduced while the insulin response to GLP-1 is preserved.',
        iconName: 'Utensils',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'An enzyme in the blood destroys them within minutes',
        laymanDesc:
          'A protein-cutting enzyme circulating in blood and anchored on blood vessel surfaces clips the ends off both hormones and switches them off almost immediately.',
        molecularDetail:
          'Dipeptidyl peptidase-4 removes the N-terminal dipeptide from GLP-1 and GIP, inactivating them within minutes of release. The half-life of intact active GLP-1 in plasma is of the order of a couple of minutes, which is what makes the enzyme, rather than the hormone, the practical drug target.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Saxagliptin sits in the enzyme active site and blocks the cut',
        laymanDesc:
          'The drug is shaped like the end of the hormone the enzyme normally grabs, so the enzyme grabs the drug instead — and this time nothing gets cut.',
        molecularDetail:
          'The cyanopyrrolidine nitrile forms a slowly reversible covalent adduct with the catalytic serine of DPP-4, giving competitive inhibition with a long residence time. Selectivity over the closely related DPP-8 and DPP-9 enzymes is a design requirement of the class, not an incidental property.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The hormone signal lasts longer, and only while sugar is high',
        laymanDesc:
          'With the enzyme blocked, the gut hormones survive longer and their message to the pancreas is louder. Crucially, the message itself only works when blood sugar is elevated.',
        molecularDetail:
          'The label states saxagliptin reduces fasting and post-prandial glucose "in a glucose-dependent manner". That dependence is the reason a DPP-4 inhibitor alone does not cause hypoglycaemia, and it is also the reason the effect size is modest compared with drugs that force insulin release unconditionally.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Insulin rises after meals and glucagon falls',
        laymanDesc:
          'Two things happen at once: the pancreas releases more insulin after eating, and it releases less of the hormone that tells the liver to make sugar.',
        molecularDetail:
          'GLP-1 raises glucose-dependent insulin secretion from beta cells and lowers glucagon secretion from alpha cells, reducing hepatic glucose production. Both arms contribute to the fall in fasting and post-prandial glucose that the label describes.',
        iconName: 'ArrowRightLeft',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'HbA1c falls, ischaemic events do not, and heart failure admissions rise',
        laymanDesc:
          'Average blood sugar comes down. Heart attacks and strokes stay exactly where they were. Admissions to hospital for heart failure went up by about a quarter in the trial that looked.',
        molecularDetail:
          'In SAVOR-TIMI 53, the primary composite hazard ratio was 1.00 (95% CI 0.89 to 1.12) and hospitalisation for heart failure 1.27 (95% CI 1.07 to 1.51, p=0.007). The mechanism of the heart-failure signal is unresolved; DPP-4 has substrates beyond the incretins, including stromal cell-derived factor-1 and brain natriuretic peptide, which is a hypothesis rather than a demonstrated cause.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SAVOR-TIMI 53 (NCT01107886)',
        phase: 'Randomised double-blind placebo-controlled cardiovascular outcome trial, median 2.1 years',
        sampleSize: 16492,
        primaryEndpoint:
          'Composite of cardiovascular death, myocardial infarction or ischaemic stroke, in patients with type 2 diabetes with a history of or at risk for cardiovascular events',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 1.00 (95% CI 0.89 to 1.12); P = 0.99 for superiority, P < 0.001 for non-inferiority. On-treatment analysis 1.03 (95% CI 0.91 to 1.17)',
        unreportedAdverseSignals:
          'Hospitalisation for heart failure was higher on saxagliptin — 3.5% against 2.8%, hazard ratio 1.27 (95% CI 1.07 to 1.51, P = 0.007) — a finding now carried in a numbered warnings section of the label. Definite acute pancreatitis was confirmed in 17 of 8,240 against 9 of 8,173.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A hazard ratio of 1.00 (95% CI 0.89 to 1.12) for cardiovascular death, myocardial infarction or ischaemic stroke in 16,492 randomised patients over a median 2.1 years',
        'A hazard ratio of 1.27 (95% CI 1.07 to 1.51, p=0.007) for hospitalisation for heart failure — 289 of 8,280 against 228 of 8,212',
        'A major secondary composite hazard ratio of 1.02 (95% CI 0.94 to 1.11, p=0.66)',
        'Definite acute pancreatitis confirmed in 17 of 8,240 on saxagliptin against 9 of 8,173 on placebo, with pre-existing risk factors in 88% and 100% of those cases',
        'An active 5-hydroxy metabolite whose plasma exposure after a 5 mg dose is 214 ng·h/mL against 78 for the parent compound',
      ],
      unsupportedInferences: [
        'That lowering HbA1c with saxagliptin reduces cardiovascular risk — the trial that tested it returned a hazard ratio of exactly 1.00, and its authors wrote that other approaches are necessary',
        'That the absence of hypoglycaemia makes the class clinically safer overall — the outcome trial found an excess of heart-failure hospitalisation instead',
        'That the heart-failure signal is explained by a known mechanism — DPP-4 has substrates beyond the incretins, and no causal pathway has been demonstrated',
        'That the pancreatitis question is resolved — 26 adjudicated events across 16,413 patients cannot exclude a modest effect, and the label carries a warning built on postmarketing reports',
      ],
      whatFailedInitially: [
        'Saxagliptin was the first modern diabetes drug whose mandatory cardiovascular outcome trial found a harm its registration programme had missed, and the label now carries a numbered heart-failure warning as a result',
        'Superiority on the primary endpoint was not merely unmet — the point estimate was 1.00, with the confidence interval symmetric about no effect',
        'Severe disabling arthralgia and bullous pemphigoid requiring hospitalisation were both added to the label from postmarketing reports after approval',
      ],
      realWorldOutcome: [
        'US$1.14 per tablet at United States pharmacy acquisition cost, the median across 16 listed products in the CMS NADAC survey — around twelve times the priciest sulfonylurea on this site',
        'Now off patent, with generics in the NADAC file, more than fifteen years after approval',
        'The heart-failure finding is reproduced verbatim on the current label, including the trial arm counts',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, once daily, in 2.5 mg and 5 mg strengths',
      description:
        'A conventional immediate-release tablet. Exposure to both saxagliptin and its active 5-hydroxy metabolite rises proportionally from 2.5 to 400 mg, variability is under 25%, and neither accumulates on repeated once-daily dosing. Both are renally eliminated, so the strength appropriate to a given level of kidney function is a prescribing decision this page does not enter into.',
      safetyProfile:
        'Saxagliptin alone does not cause hypoglycaemia, because the incretin signal it prolongs is itself glucose-dependent; combined with insulin or an insulin secretagogue the risk rises. Section 5.2 of the label carries the SAVOR heart-failure finding with its trial counts and asks prescribers to weigh risks and benefits in patients at higher risk, to monitor, and to consider discontinuation if heart failure develops. Postmarketing reports underlie warnings for acute pancreatitis, serious hypersensitivity including anaphylaxis and angioedema, severe and disabling arthralgia, and bullous pemphigoid requiring hospitalisation. It is not recommended in type 1 diabetes or diabetic ketoacidosis.',
    },
    commonQuestions: [
      {
        q: 'Does saxagliptin cause heart failure?',
        a: 'The randomised evidence says it increases hospitalisation for it, and the label says so too. SAVOR-TIMI 53 randomised 16,492 people with type 2 diabetes at cardiovascular risk to saxagliptin or placebo and followed them a median 2.1 years. Hospitalisation for heart failure occurred in 289 of 8,280 on saxagliptin (3.5%) against 228 of 8,212 on placebo (2.8%), hazard ratio 1.27 (95% CI 1.07 to 1.51, p=0.007). That is an absolute difference of about seven admissions per thousand patients over two years, and the confidence interval excludes no effect. The label reproduces those counts, notes that prior heart failure and renal impairment raise the risk regardless of treatment, and asks prescribers to weigh risks and benefits before starting the drug in higher-risk patients. What causes it is unknown; DPP-4 has substrates other than the incretin hormones, which is a hypothesis and not a demonstration.',
        auditNote:
          'A hazard ratio of 1.27 on a secondary endpoint would normally be treated as hypothesis-generating. It became a labelled warning because the trial was large, blinded, and the endpoint adjudicated.',
      },
      {
        q: 'Did it prevent anything?',
        a: 'No. The primary endpoint — cardiovascular death, heart attack or ischaemic stroke — occurred in 613 patients on saxagliptin and 609 on placebo, 7.3% against 7.2%, hazard ratio 1.00 with a confidence interval from 0.89 to 1.12. The broader secondary composite was 1.02. The trial met its non-inferiority margin, which was what it was designed to do, and its authors ended with a sentence worth quoting exactly: "Although saxagliptin improves glycemic control, other approaches are necessary to reduce cardiovascular risk in patients with diabetes." That is the manufacturer-funded trial saying so.',
      },
      {
        q: 'Why does this drug not cause low blood sugar?',
        a: 'Because it amplifies a signal that is itself conditional on blood sugar being high. GLP-1 and GIP are released by the gut in response to food and tell the pancreas to release insulin — but only in a glucose-dependent way, so when glucose is normal the signal does nothing. Saxagliptin blocks the enzyme that destroys those hormones, making the signal last longer and hit harder, without removing its conditionality. That is the class advantage over sulfonylureas, which force insulin out whether glucose is high or not. It is also why the glycaemic effect is more modest: the drug cannot push harder than the underlying physiology allows.',
      },
      {
        q: 'Why did nobody know about the heart failure risk before 2013?',
        a: 'Because the licensing programme was not built to find it. Saxagliptin was approved in 2009 on trials powered to show a change in HbA1c over a few months in a few thousand patients. Heart-failure hospitalisation at 3.5% against 2.8% over two years is invisible at that scale. After rosiglitazone, the FDA began requiring new diabetes drugs to demonstrate they did not increase cardiovascular risk, which meant tens of thousands of patients followed for years with adjudicated endpoints. SAVOR-TIMI 53 was one of the first of those trials to report, and it found something the approval package could not have. The result was a labelling change, not a withdrawal.',
      },
      {
        q: 'Does this page show what the drug costs to make?',
        a: 'No, because no verifiable per-dose cost-of-production figure for saxagliptin could be found and cited. The figure shown is what United States pharmacies pay to acquire it — US$1.14 per tablet, the median across 16 listed products in the CMS National Average Drug Acquisition Cost survey. That is a price, not a manufacturing cost. It is worth noting only that this is a generic price for an off-patent molecule, and it is still roughly twelve times what pharmacies pay for glimepiride.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Scirica BM, Bhatt DL, Braunwald E et al. Saxagliptin and cardiovascular outcomes in patients with type 2 diabetes mellitus (SAVOR-TIMI 53). N Engl J Med 2013;369:1317-1326',
        identifier: '10.1056/NEJMoa1307684',
        kind: 'doi',
      },
      {
        label:
          'SAVOR-TIMI 53: Does Saxagliptin Reduce the Risk of Cardiovascular Events When Used Alone or Added to Other Diabetes Medications',
        identifier: 'NCT01107886',
        kind: 'nct',
      },
      {
        label:
          'FDA prescribing information for saxagliptin tablets — sections 5.1 Pancreatitis, 5.2 Heart Failure, 5.4 Hypersensitivity-Related Events, 5.5 Arthralgia, 5.6 Bullous Pemphigoid, 12.1 and 12.3',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22saxagliptin%22',
        kind: 'regulatory',
      },
      {
        label:
          'openFDA Drugs@FDA — NDA 022350 (ONGLYZA, AstraZeneca AB, original approval 31 July 2009)',
        identifier: 'https://api.fda.gov/drug/drugsfda.json?search=products.brand_name:%22ONGLYZA%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 11243969 — saxagliptin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11243969',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
