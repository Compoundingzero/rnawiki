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
]
