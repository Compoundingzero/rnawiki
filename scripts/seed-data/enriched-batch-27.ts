import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the diabetes and thyroid drugs. The two human insulins that the
 * analogues were supposed to replace, the DPP-4 inhibitors, the SGLT2 inhibitors, the fixed-dose
 * combination, and the three drugs that move the thyroid axis in one direction or the other.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES — are copied from the enriched record rather than researched again.
 *
 * Every DOI, PMID, NCT number and FDA application number below was resolved against Crossref, the
 * NCBI E-utilities, the ClinicalTrials.gov registry or the openFDA Drugs@FDA and label endpoints at
 * the time of writing. Sample sizes, hazard ratios, confidence intervals and p-values are copied
 * from the published abstract or the FDA label, never from memory. Where a number could not be
 * sourced, the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. HAEMOGLOBIN A1c AND TSH ARE SURROGATES AND EVERY PAGE SAYS SO. A percentage point of A1c and a
 *    milli-unit of thyrotropin are what these drugs are licensed on and what almost all of their
 *    trials measured. Blindness, amputation, dialysis, stroke and death are what a reader cares
 *    about, and the two are not the same measurement. Where the surrogate and the outcome came
 *    apart — ACCORD, CANVAS, VERTIS CV, the levothyroxine-plus-liothyronine trials — the divergence
 *    is on the page at the same weight as the licensing result.
 *
 * 2. A CLASS EFFECT IS AN INFERENCE, NOT A MEASUREMENT. The SGLT2 inhibitors do not have the same
 *    outcome trials as each other, and the DPP-4 inhibitors have four separate cardiovascular
 *    safety trials with four different results, one of which found a heart failure signal.
 *    Empagliflozin's mortality result is not canagliflozin's and is not ertugliflozin's. Every page
 *    that borrows evidence from a sibling molecule says which molecule the evidence came from.
 *
 * 3. PRICING IS A PRICE, NOT A COST. Every price here is the CMS National Average Drug Acquisition
 *    Cost — what a United States retail pharmacy pays a wholesaler — and is labelled as such.
 *    `synthesisCostPerDose` is empty on every dossier in this file: the published cost-of-production
 *    literature for these molecules reports an estimation method and an aggregate, and the
 *    per-molecule figures sit in supplementary appendices that could not be resolved and verified
 *    at the time of writing. An unverified cost is worse than an absent one.
 *
 * 4. NO DOSING, TITRATION, MONITORING OR PROCUREMENT GUIDANCE. Strengths, unit concentrations and
 *    titration schedules appear only where they are part of a trial's description or a product's
 *    identity. Nothing here tells a reader what to take, how to move between doses, or where to
 *    obtain it. This matters more in this group than in most: insulin and the antithyroid drugs are
 *    dose-titrated against a laboratory number, and a reference page is not a prescriber.
 *
 * 5. THE MOST INSTRUCTIVE RECORD IN THIS GROUP IS AN AMPUTATION BOX. Canagliflozin carried a boxed
 *    warning for lower-limb amputation from 2017 to 2020, on the strength of its own outcome trial,
 *    and the warning was then removed. That sequence — a signal found, a box added, the box taken
 *    off — is the clearest available demonstration of what an evidence audit is for, and it is on
 *    the canagliflozin page in full.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group. It publishes an estimation method over 148 medicines and an aggregate result; its per-molecule figures for the diabetes and thyroid agents are in a supplementary appendix that could not be resolved at the time of writing, so no per-dose cost is stated on these pages',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_27_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Insulin human — the first recombinant DNA medicine, whose own outcome trials show that
  //    lowering glucose harder does not reliably lower the things people are afraid of.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'insulin-human',
    name: 'Insulin Human',
    tradeName: 'Humulin R / Humulin R U-500 / Novolin R / Afrezza (inhaled)',
    sponsor:
      'Eli Lilly and Company (Humulin, NDA 018780); Novo Nordisk (Novolin); MannKind Corporation (Afrezza, inhalation powder)',
    targetGene: 'INSR',
    targetProtein:
      'Insulin receptor — a disulphide-linked alpha-2/beta-2 receptor tyrosine kinase on muscle, fat and liver cells. The drug molecule is itself the product of the human INS gene, made in Escherichia coli by recombinant DNA',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 1982,
    indication:
      'To improve glycaemic control in adults and paediatric patients with diabetes mellitus. The U-500 concentration is indicated for patients requiring more than 200 units of insulin per day, with the label stating that its safety and efficacy in combination with other insulins has not been determined',
    patientFriendlyIndication: 'Diabetes — replacing the hormone the body cannot make enough of',
    anatomicalSite:
      'Insulin receptor on skeletal muscle, adipocyte and hepatocyte surfaces, reached from a subcutaneous depot',
    conditionContext: {
      conditionExplainer:
        'Insulin is the hormone that tells muscle and fat to take glucose out of the blood and tells the liver to stop making more. In type 1 diabetes the cells that make it have been destroyed and there is none. In type 2 diabetes there is some, but the tissues respond to it poorly and the supply eventually fails. Injected insulin is the same molecule, put back.',
      whyItMatters:
        'This is one of the few drugs in medicine that replaces a missing substance rather than blocking a process. Without it, type 1 diabetes is fatal in weeks. That fact — true, dramatic, and about type 1 — is routinely borrowed to argue for driving blood glucose as low as possible in type 2 diabetes, where the trials have repeatedly failed to show it and once showed the opposite.',
      whoTakesThis:
        'Everyone with type 1 diabetes. People with type 2 diabetes whose glucose is not controlled by tablets, and people in hospital with severe hyperglycaemia or ketoacidosis. The U-500 concentration is for the small group requiring more than 200 units a day.',
      clinicalGoals:
        'A glucose level, measured as haemoglobin A1c, which is a surrogate. The outcome that has been demonstrated most clearly is fewer microvascular complications — eyes, kidneys, nerves. Fewer heart attacks and fewer deaths have not been demonstrated for insulin, and the one trial that pushed glucose hardest found more deaths.',
    },
    oneSentenceVerdict:
      'The human hormone itself, made in bacteria since 1982, whose glucose lowering is not in doubt and whose outcome record splits cleanly: a 76% reduction in retinopathy development in type 1 diabetes at the cost of a two-to-threefold rise in severe hypoglycaemia (DCCT, 1,441 patients), a 25% reduction in microvascular endpoints in type 2 diabetes with myocardial infarction missing significance at p=0.052 (UKPDS 33, 3,867 patients), and 54 extra deaths in the arm that pushed A1c lowest (ACCORD, 10,251 patients, HR 1.22, p=0.04).',
    laymanHowItWorks:
      'Injected insulin is the identical molecule your pancreas would have made, grown in bacteria that have been given the human gene for it. It binds a receptor on the surface of muscle, fat and liver cells, which switches on a chain of signals inside the cell that pulls glucose transporters to the cell surface. Glucose moves out of the blood and into the cells, and the liver stops manufacturing more of it. Because the dose is fixed at the moment of injection and the body’s need is not, too much insulin for the food eaten produces hypoglycaemia — which is the drug’s main danger and the thing that limits how hard it can be used.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 74,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$5.82 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 16 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Banting, Best and Collip assigned the 1923 insulin patent to the University of Toronto for one dollar each, on the stated principle that the discovery should not be owned. No composition patent has covered human insulin for decades. Price is nonetheless the governing clinical fact for this drug in the United States: in a 2017 survey of 199 insulin-treated patients at the Yale Diabetes Center, 51 (25.5%) reported cost-related insulin underuse in the previous year, and those patients had nearly three times the odds of an A1c at or above 9% (OR 2.96, 95% CI 1.14 to 8.16, p=0.03).',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The comparison that matters for human insulin is not against tablets — in type 1 diabetes there is no alternative and the question does not arise — but against the rapid- and long-acting analogues that displaced it, at several times the price, on the argument that their pharmacokinetics would translate into better control and less hypoglycaemia. Two large independent assessments have now tested that argument directly, and neither found what was promised.',
      conventionalRx: [
        {
          name: 'Insulin lispro, aspart or glulisine (rapid-acting analogues)',
          class: 'Modified insulin analogues with accelerated subcutaneous absorption',
          howItCompares:
            'Faster on and faster off, so they can be injected at the meal rather than half an hour before. The Cochrane review of 10 randomised trials in 2,751 adults with type 2 diabetes found a difference in A1c change of −0.03% (95% CI −0.16 to 0.09) against regular human insulin, and could not pool severe hypoglycaemia because the trials defined it differently.',
          typicalCost:
            'Substantially more than regular human insulin at United States acquisition cost; the JAMA analysis of basal insulin describes long-acting analogues as costing two to ten times more than NPH',
          prosAndCons:
            'Pros: convenience at the meal; a genuinely different absorption curve. Cons: the convenience has not been shown to convert into a better A1c or fewer severe hypoglycaemic episodes in type 2 diabetes, and the price difference is large.',
        },
        {
          name: 'Insulin glargine or detemir (long-acting basal analogues)',
          class: 'Modified insulin analogues with a flattened, extended action profile',
          howItCompares:
            'In 25,489 patients with type 2 diabetes starting basal insulin in Kaiser Permanente Northern California, the adjusted hazard ratio for a hypoglycaemia-related emergency visit or admission with an analogue against NPH was 1.16 (95% CI 0.71 to 1.78) — no reduction. A1c fell 1.2 points on the analogue and 1.5 on NPH.',
          typicalCost: 'Two to ten times the cost of NPH, per the same JAMA analysis',
          prosAndCons:
            'Pros: a flatter profile and less nocturnal hypoglycaemia in the randomised literature. Cons: in the population that actually uses it, no reduction in the hypoglycaemia that reaches a hospital and no better glycaemic control.',
        },
        {
          name: 'Metformin, and the oral agents generally',
          class: 'Oral glucose-lowering drugs',
          howItCompares:
            'Irrelevant to type 1 diabetes, where there is no substitute for insulin. In type 2 diabetes they are the first line, and in UKPDS the three intensive agents — chlorpropamide, glibenclamide and insulin — produced no difference between them on any of the three aggregate endpoints.',
          typicalCost: 'Among the cheapest prescription drugs in the United States',
          prosAndCons:
            'Pros: no injection, far less hypoglycaemia, no weight gain with metformin. Cons: they require residual beta-cell function, and in UKPDS the insulin arm gained 4.0 kg against 1.7 kg on glibenclamide.',
        },
      ],
      naturalFoods: [
        {
          name: 'Carbohydrate quantity in the meal',
          activeCompound: 'Dietary carbohydrate',
          biologicalMechanism:
            'Injected insulin is dosed against the carbohydrate content of a meal, so the meal is one of the two variables in the equation and the only one under a person’s direct control. This is not a substitute for insulin and nothing here suggests it is; it is the reason carbohydrate counting is part of insulin therapy rather than an alternative to it.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. Any change in carbohydrate intake by someone taking insulin alters the insulin requirement immediately and is a matter for the prescribing clinician, not a reference page.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Carry fast-acting glucose',
          action: 'Keep glucose tablets or an equivalent within reach at all times.',
          patientImpact:
            'Hypoglycaemia is the most common and most serious adverse reaction of all insulins, and severe hypoglycaemia can cause seizures and may be fatal. In DCCT, intensive therapy produced a two-to-threefold increase in severe hypoglycaemia against conventional therapy.',
          clinicalPrecaution:
            'Beta-blockers, clonidine, guanethidine and reserpine may blunt or abolish the warning symptoms. Repeated hypoglycaemia itself reduces awareness of the next episode.',
        },
        {
          name: 'Check the concentration on the vial before every fill',
          action: 'Confirm whether the product is U-100 or U-500 and that the syringe matches.',
          patientImpact:
            'U-500 human insulin contains five times as much insulin per millilitre as U-100. A U-500 volume drawn with a U-100 assumption is a fivefold overdose, and this is a recognised and recurring dispensing error rather than a theoretical one.',
          clinicalPrecaution:
            'The U-500 label carries a specific warning about medication errors between concentrations and states that its safety and efficacy in combination with other insulins has not been determined.',
        },
        {
          name: 'Say if you are rationing it',
          action:
            'Tell the prescriber if you have been stretching vials, skipping doses or delaying a refill because of cost.',
          patientImpact:
            'In the Yale survey, 25.5% of insulin-treated patients reported cost-related underuse and those patients had an odds ratio of 2.96 (95% CI 1.14 to 8.16) for an A1c at or above 9%. Under-dosing insulin is not a minor deviation; in type 1 diabetes it is the route to ketoacidosis.',
          clinicalPrecaution:
            'Regular human insulin is one of the least expensive insulins available and is a clinically reasonable option for many people. Any switch between insulin products or concentrations is a prescribing decision.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC[C@H](C)[C@H]1C(=O)N[C@H]2CSSC[C@@H](C(=O)N[C@@H](CSSC[C@@H](C(=O)NCC(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@@H](CSSC[C@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@@H](NC2=O)CO)CC(C)C)CC3=CC=C(C=C3)O)CCC(=O)N)CC(C)C)CCC(=O)O)CC(=O)N)CC4=CC=C(C=C4)O)C(=O)N[C@@H](CC(=O)N)C(=O)O)C(=O)NCC(=O)N[C@@H](CCC(=O)O)C(=O)N[C@@H](CCCNC(=N)N)C(=O)NCC(=O)N[C@@H](CC5=CC=CC=C5)C(=O)N[C@@H](CC6=CC=CC=C6)C(=O)N[C@@H](CC7=CC=C(C=C7)O)C(=O)N[C@@H]([C@@H](C)O)C(=O)N8CCC[C@H]8C(=O)N[C@@H](CCCCN)C(=O)N[C@@H]([C@@H](C)O)C(=O)O)C(C)C)CC(C)C)CC9=CC=C(C=C9)O)CC(C)C)C)CCC(=O)O)C(C)C)CC(C)C)CC2=CNC=N2)CO)NC(=O)[C@H](CC(C)C)NC(=O)[C@H](CC2=CNC=N2)NC(=O)[C@H](CCC(=O)N)NC(=O)[C@H](CC(=O)N)NC(=O)[C@H](C(C)C)NC(=O)[C@H](CC2=CC=CC=C2)N)C(=O)N[C@H](C(=O)N[C@H](C(=O)N1)CO)[C@@H](C)O)NC(=O)[C@H](CCC(=O)N)NC(=O)[C@H](CCC(=O)O)NC(=O)[C@H](C(C)C)NC(=O)[C@H]([C@@H](C)CC)NC(=O)CN',
      chemicalFormula: 'C257H383N65O77S6',
      molecularWeight: '5808.00 g/mol',
      targetReceptorAffinity:
        'Two chains — A of 21 residues and B of 30 — held together by two interchain disulphide bridges with a third intrachain bridge in the A chain. The sequence is identical to endogenous human insulin, which is what distinguishes it from the analogues: lispro, aspart and glulisine each carry deliberate substitutions in the B-chain C-terminus to weaken the self-association that slows absorption. In the vial the molecule sits as a zinc-coordinated hexamer and must dissociate to monomer before it can cross the capillary wall, which is why regular human insulin has a slower onset than an analogue engineered not to hexamerise.',
      structureSource: {
        label:
          'PubChem CID 118984375 (human insulin) — isomeric SMILES, molecular formula and weight, as carried on the enriched record; chain composition and disulphide arrangement from the HUMULIN R prescribing information, section 11',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/118984375',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ins-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Verify the expression construct and the host cell bank',
          description:
            'The product is defined by its sequence, and the sequence is defined by a plasmid in a bacterial cell bank that will be grown for decades. Sequencing the construct and characterising the master cell bank is the only point at which an identity error is cheap to find; after fermentation it is a batch of protein that looks correct on most assays.',
          reagentsAndBuffer:
            'Master and working cell banks of a non-pathogenic Escherichia coli strain, plasmid preparation, Sanger or next-generation sequencing of the proinsulin fusion cassette, host-cell identity testing and phage screening',
        },
        {
          id: 'ins-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ferment the proinsulin fusion protein',
          description:
            'Human insulin is not synthesised chemically at scale. It is expressed as a single-chain proinsulin fusion in Escherichia coli, which deposits it in inclusion bodies as insoluble aggregate. The advantage is yield and the cost is that the protein comes out of the cell in the wrong conformation and has to be refolded.',
          dependsOnStepId: 'ins-w1',
          reagentsAndBuffer:
            'Defined fermentation medium, induction of the proinsulin fusion cassette, cell harvest by centrifugation, inclusion-body isolation and washing in urea-containing buffer',
        },
        {
          id: 'ins-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Refold, then cut the connecting peptide out',
          description:
            'Solubilise and refold the single chain so that all three disulphide bridges form in the correct pairing, then excise the C-peptide enzymatically to leave the two-chain hormone. Both steps have characteristic failure modes: mispaired disulphide isomers and incomplete cleavage products that co-purify with the drug and are inactive or nearly so.',
          dependsOnStepId: 'ins-w2',
          reagentsAndBuffer:
            'Chaotrope solubilisation, controlled oxidative refolding with a thiol redox pair, trypsin and carboxypeptidase B for enzymatic conversion, ion-exchange capture',
        },
        {
          id: 'ins-w4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Separate the isomers by reversed-phase chromatography and crystallise',
          description:
            'Reversed-phase HPLC resolves the correctly folded hormone from disulphide isomers, deamidated forms and high-molecular-weight aggregate. Crystallisation from a zinc-containing buffer then serves both as a final purification and as the form in which the substance is stored.',
          dependsOnStepId: 'ins-w3',
          reagentsAndBuffer:
            'Preparative reversed-phase HPLC, size-exclusion polishing for aggregate removal, zinc chloride and citrate crystallisation buffer, peptide mapping and mass spectrometry for release',
        },
        {
          id: 'ins-w5',
          stepNumber: 5,
          phase: 'Conjugation',
          name: 'Formulate as the zinc hexamer and fix the concentration',
          description:
            'Regular human insulin is presented as a zinc-coordinated hexamer with phenolic preservative, which stabilises it in the vial and is also the reason it is slower in onset than a monomeric analogue. The concentration set here is a safety-critical property of the product, not a formulation detail: U-100 and U-500 differ fivefold and are confusable.',
          dependsOnStepId: 'ins-w4',
          reagentsAndBuffer:
            'Zinc chloride, m-cresol or phenol as preservative, glycerin for tonicity, sodium hydroxide or hydrochloric acid for pH adjustment, sterile filtration and aseptic fill at the declared unit concentration',
        },
        {
          id: 'ins-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Measure potency in units of biological activity, not milligrams',
          description:
            'Insulin is dosed in international units of biological activity because the clinically relevant property is receptor activation, not mass. Release testing therefore reads out receptor autophosphorylation or glucose disposal against a reference standard, alongside the physicochemical panel. A batch that is chemically correct and biologically weak fails here and nowhere earlier.',
          dependsOnStepId: 'ins-w5',
          reagentsAndBuffer:
            'Insulin receptor autophosphorylation or lipogenesis bioassay against the WHO or USP insulin reference standard, RP-HPLC for related substances, size-exclusion chromatography for high-molecular-weight proteins, endotoxin and sterility testing',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ins-a1',
        category: 'measured',
        title:
          'DCCT: a 76% reduction in retinopathy, bought with a threefold rise in hypoglycaemia',
        laymanSummary:
          'In type 1 diabetes, treating glucose intensively rather than conventionally cut the development of eye disease by three quarters and nerve damage by three fifths. It also produced two to three times as many severe hypoglycaemic episodes.',
        technicalDetails:
          'The Diabetes Control and Complications Trial randomised 1,441 patients with insulin-dependent diabetes to intensive therapy — an external pump or three or more injections daily with frequent glucose monitoring — or to conventional therapy, and followed them a mean 6.5 years. In the primary-prevention cohort intensive therapy reduced the adjusted mean risk of developing retinopathy by 76% (95% CI 62 to 85). In the secondary-intervention cohort it slowed progression by 54% (95% CI 39 to 66). Microalbuminuria fell 39% (95% CI 21 to 52), albuminuria 54% (95% CI 19 to 74), and clinical neuropathy 60% (95% CI 38 to 74). The trade-off was explicit in the report: a two-to-threefold increase in severe hypoglycaemia. This is the strongest evidence in the file for insulin therapy, and every one of the endpoints it moved is microvascular.',
        evidenceSource:
          'The Diabetes Control and Complications Trial Research Group. N Engl J Med 1993;329:977-986',
        doi: '10.1056/NEJM199309303291401',
        measuredMetric:
          'Development and progression of retinopathy, nephropathy and neuropathy in type 1 diabetes; severe hypoglycaemia rate',
        auditFlag: 'verified',
      },
      {
        id: 'ins-a2',
        category: 'measured',
        title: 'UKPDS 33: microvascular endpoints moved, myocardial infarction missed at p=0.052',
        laymanSummary:
          'In newly diagnosed type 2 diabetes, ten years of intensive glucose control lowered A1c from 7.9% to 7.0% and cut small-vessel complications by a quarter. Heart attacks fell by 16% and that result did not reach statistical significance. Deaths did not differ.',
        technicalDetails:
          'UKPDS 33 randomised 3,867 newly diagnosed patients with type 2 diabetes, median age 54, to intensive control with a sulphonylurea or insulin, or to conventional control with diet. Over ten years A1c was 7.0% (interquartile range 6.2 to 8.2) against 7.9% (6.9 to 8.8). Risk in the intensive group was 12% lower for any diabetes-related endpoint (95% CI 1 to 21, p=0.029); 10% lower for any diabetes-related death (−11 to 27, p=0.34); and 6% lower for all-cause mortality (−10 to 20, p=0.44). Most of the aggregate effect was a 25% reduction in microvascular endpoints (7 to 40, p=0.0099), including the need for retinal photocoagulation. Major hypoglycaemic episodes ran at 0.7% per year on conventional treatment and 1.8% on insulin. Weight gain was 4.0 kg on insulin against 1.7 kg on glibenclamide. There was no difference between the three intensive agents on any of the three aggregate endpoints — which is to say the trial does not distinguish insulin from a sulphonylurea.',
        evidenceSource: 'UK Prospective Diabetes Study Group. Lancet 1998;352:837-853 (UKPDS 33)',
        doi: '10.1016/S0140-6736(98)07019-6',
        measuredMetric:
          'Aggregate diabetes-related endpoints, microvascular endpoints, diabetes-related death and all-cause mortality over ten years',
        auditFlag: 'verified',
      },
      {
        id: 'ins-a3',
        category: 'failed',
        title: 'ACCORD: the arm that pushed glucose lowest had more deaths, and was stopped',
        laymanSummary:
          'A trial that tried to drive A1c below 6% in people with type 2 diabetes and high cardiovascular risk was halted early because more people in that arm died — 257 against 203 — and the major cardiovascular endpoint had not improved.',
        technicalDetails:
          'ACCORD randomised 10,251 patients with type 2 diabetes, mean age 62.2, 35% with a previous cardiovascular event, to intensive therapy targeting A1c below 6.0% or standard therapy targeting 7.0 to 7.9%. The primary composite of nonfatal myocardial infarction, nonfatal stroke or cardiovascular death occurred in 352 against 371 patients (HR 0.90, 95% CI 0.78 to 1.04, p=0.16). All-cause mortality was 257 against 203 (HR 1.22, 95% CI 1.01 to 1.46, p=0.04) and the intensive arm was discontinued after a mean 3.5 years. The excess mortality has never been fully explained; severe hypoglycaemia and weight gain were both markedly more frequent in the intensive arm. Whatever its cause, this is a randomised trial in which lowering the surrogate further made the outcome worse, and it is the reason A1c targets stopped being written as "as low as possible".',
        evidenceSource:
          'Action to Control Cardiovascular Risk in Diabetes Study Group. N Engl J Med 2008;358:2545-2559',
        doi: '10.1056/NEJMoa0802743',
        measuredMetric:
          'All-cause mortality and major adverse cardiovascular events under an intensive against a standard A1c target',
        auditFlag: 'caution',
      },
      {
        id: 'ins-a4',
        category: 'inferred',
        title: 'Insulin has never been shown to prevent cardiovascular events',
        laymanSummary:
          'The largest trial designed to test whether giving basal insulin early in dysglycaemia protects the heart found no difference at all — 12,537 people, six years, and the two arms sat on top of each other.',
        technicalDetails:
          'ORIGIN randomised 12,537 people with cardiovascular risk factors plus impaired fasting glucose, impaired glucose tolerance or type 2 diabetes to insulin glargine targeting a fasting glucose at or below 5.3 mmol/L, or standard care, for a median 6.2 years. The first co-primary outcome — nonfatal myocardial infarction, nonfatal stroke or cardiovascular death — occurred at 2.94 against 2.85 events per 100 person-years (HR 1.02, 95% CI 0.94 to 1.11, p=0.63). The second, adding revascularisation or heart failure hospitalisation, was 5.52 against 5.28 (HR 1.04, 95% CI 0.97 to 1.11, p=0.27). Severe hypoglycaemia was 1.00 against 0.31 per 100 person-years and weight rose 1.6 kg against a 0.5 kg fall. Cancer incidence did not differ (HR 1.00, 95% CI 0.88 to 1.13, p=0.97), which settled a separate observational scare. ORIGIN tested insulin glargine and not regular human insulin, and that distinction is stated on this page rather than glossed; what it removes is the general proposition that supplying basal insulin early buys cardiovascular protection.',
        evidenceSource: 'ORIGIN Trial Investigators. N Engl J Med 2012;367:319-328',
        doi: '10.1056/NEJMoa1203858',
        inferredClaim:
          'That normalising glucose with insulin prevents heart attacks, strokes and cardiovascular death — a claim tested directly in 12,537 people and not supported',
        auditFlag: 'caution',
      },
      {
        id: 'ins-a5',
        category: 'conclusion_shift',
        title:
          'The analogues were supposed to beat human insulin, and in type 2 diabetes they did not',
        laymanSummary:
          'Newer engineered insulins largely replaced human insulin at several times the price, on the argument that their absorption profiles would give better control and less hypoglycaemia. Two large independent assessments have now looked, and found neither.',
        technicalDetails:
          'The Cochrane review of short-acting analogues against regular human insulin in adult non-pregnant patients with type 2 diabetes pooled 10 randomised trials in 2,751 participants over 24 to 104 weeks and found a mean difference in A1c change of −0.03% (95% CI −0.16 to 0.09, low-certainty evidence). All-cause mortality was 5 against 3 deaths (Peto OR 1.66, 95% CI 0.41 to 6.64). Severe hypoglycaemia could not be pooled because the trials defined it differently, and the review concluded there were no clear benefits of the analogues. Separately, a cohort of 25,489 patients with type 2 diabetes initiating basal insulin in Kaiser Permanente Northern California between 2006 and 2015 found an adjusted hazard ratio of 1.16 (95% CI 0.71 to 1.78) for hypoglycaemia-related emergency department visits or hospital admissions with an analogue against NPH, and an adjusted difference-in-differences in A1c of −0.22% (95% CI −0.09 to −0.37) favouring NPH. The pharmacokinetic argument for the analogues was real and the clinical superiority inferred from it was not demonstrated at the level of the outcomes patients experience.',
        evidenceSource:
          'Fullerton B et al. Cochrane Database Syst Rev 2018;12:CD013228; Lipska KJ et al. JAMA 2018;320:53-62',
        doi: '10.1002/14651858.CD013228',
        inferredClaim:
          'That the engineered absorption profiles of insulin analogues translate into better glycaemic control and less severe hypoglycaemia than human insulin in type 2 diabetes',
        auditFlag: 'contested',
      },
      {
        id: 'ins-a6',
        category: 'failed',
        title: 'A quarter of insulin users at one clinic were rationing it',
        laymanSummary:
          'A survey at a United States academic diabetes centre found that one in four insulin-treated patients had used less than prescribed, not filled a prescription, or stopped, because of the cost. Their blood glucose was correspondingly worse.',
        technicalDetails:
          'Of 354 eligible patients approached at the Yale Diabetes Center between June and August 2017, 199 (56.2%) completed the survey and 51 (25.5%) reported cost-related insulin underuse in the previous twelve months. Underuse was associated with an odds ratio of 2.96 (95% CI 1.14 to 8.16, p=0.03) for an A1c at or above 9%. The income gradient was not monotonic: only 1 of 24 (4.2%) of those earning US$100,000 or more reported underuse, while the odds ratios against that group were 12.51 for the US$50,000 to US$99,999 band and 11.50 for the US$25,000 to US$49,999 band. This is a single-centre survey with a 56% response rate and it should be read as such. It is included because the effectiveness of a drug whose patent was sold for a dollar is, in this setting, limited by its price rather than by its pharmacology — and because regular human insulin at US$5.82 per mL is among the cheapest insulins available.',
        evidenceSource: 'Herkert D, Vijayakumar P, Luo J, et al. JAMA Intern Med 2019;179:112-114',
        doi: '10.1001/jamainternmed.2018.5008',
        measuredMetric:
          'Self-reported cost-related insulin underuse and its association with A1c at or above 9%',
        auditFlag: 'caution',
      },
      {
        id: 'ins-a7',
        category: 'failed',
        title: 'U-500 and U-100 are the same drug at fivefold different strength',
        laymanSummary:
          'Concentrated human insulin holds five times as much per millilitre as the ordinary product. Confusing the two is a fivefold dosing error, and the label carries a specific warning about it.',
        technicalDetails:
          'HUMULIN R U-500 is indicated for adults and paediatric patients with diabetes requiring more than 200 units of insulin per day. Its label states as a Limitation of Use that the safety and efficacy of U-500 in combination with other insulins has not been determined, and carries a Warnings and Precautions entry on medication errors arising from confusion between insulin concentrations. The failure mode is arithmetic rather than pharmacological: a volume drawn on the assumption of 100 units per millilitre from a vial containing 500 delivers five times the intended dose of a drug whose overdose is severe hypoglycaemia. This is a property of the product presentation, not of the molecule, and it is the reason the concentration appears on this page at all.',
        evidenceSource:
          'HUMULIN R U-500 United States prescribing information, Indications 1, Limitations of Use, and Warnings and Precautions (NDA 018780)',
        measuredMetric:
          'Unit concentration per millilitre as a product-level safety property, from the label',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A human gene, expressed in bacteria',
        laymanDesc:
          'The insulin in the vial is the identical molecule a working pancreas would make. It is grown in Escherichia coli that carry the human gene, which is why it is called human insulin even though no human made it.',
        molecularDetail:
          'A 51-residue two-chain polypeptide — A chain of 21 residues, B chain of 30 — joined by two interchain disulphides with a third intrachain bridge in the A chain, expressed as a single-chain proinsulin fusion in a non-pathogenic Escherichia coli strain and converted enzymatically. Formula C257H383N65O77S6, molecular weight 5,808 g/mol. Humulin was approved in 1982 as the first recombinant DNA medicine of any kind.',
        iconName: 'Dna',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The hexamer has to fall apart before anything happens',
        laymanDesc:
          'In the vial the insulin is clumped in groups of six around zinc atoms. Injected under the skin, those clumps have to break up into single molecules before they can enter the bloodstream, which is why regular insulin takes about half an hour to start working.',
        molecularDetail:
          'Zinc-coordinated hexamers dissociate to dimers and then monomers in the subcutaneous depot before capillary absorption. This dissociation step sets the onset time and is precisely what the rapid-acting analogues engineer away: lispro inverts the B28-B29 proline-lysine pair, aspart substitutes B28 with aspartate, glulisine substitutes B3 and B29 — each weakening self-association without touching receptor binding.',
        iconName: 'Layers',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds a receptor that is already a tyrosine kinase',
        laymanDesc:
          'Insulin docks onto a receptor sitting in the surface of muscle, fat and liver cells. The receptor changes shape and starts adding chemical tags to proteins inside the cell, which is how the message gets across the membrane.',
        molecularDetail:
          'Binding to the extracellular alpha subunits of the alpha-2/beta-2 insulin receptor relieves autoinhibition of the intracellular beta-subunit tyrosine kinase domains, which trans-autophosphorylate and then phosphorylate insulin receptor substrate proteins IRS-1 and IRS-2. Because the drug is sequence-identical to the endogenous hormone, its receptor pharmacology is the hormone’s, with no off-target receptor profile of its own.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Glucose transporters are pulled to the cell surface',
        laymanDesc:
          'The signal ends by moving glucose doorways from inside the cell out to its surface. Glucose then flows out of the blood and into muscle and fat, and the liver is told to stop manufacturing more.',
        molecularDetail:
          'The IRS/PI3-kinase/Akt arm drives translocation of GLUT4-containing vesicles to the plasma membrane of skeletal muscle and adipocytes, and suppresses hepatic gluconeogenesis and glycogenolysis. In parallel the label records that insulins inhibit lipolysis and proteolysis and enhance protein synthesis and the conversion of excess glucose into fat — the anabolic actions that account for weight gain on therapy.',
        iconName: 'ArrowDownCircle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The dose is fixed and the requirement is not',
        laymanDesc:
          'Once injected, the insulin will act whether or not the meal arrives. The mismatch between a fixed dose and a variable need is what produces low blood sugar, and it is the reason this drug cannot simply be used harder.',
        molecularDetail:
          'Subcutaneous insulin is not under feedback control. Hypoglycaemia is the most common adverse reaction of all insulins and the dose-limiting one: DCCT recorded a two-to-threefold increase in severe episodes with intensive therapy, UKPDS 1.8% major episodes per year on insulin against 0.7% on diet, and ORIGIN 1.00 against 0.31 per 100 person-years. Beta-blockers, clonidine, guanethidine and reserpine may blunt the warning symptoms.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the glucose lowering has and has not bought',
        laymanDesc:
          'Small-vessel damage — eyes, kidneys, nerves — clearly improves. Heart attacks, strokes and deaths have not been shown to, and the trial that pushed glucose lowest recorded more deaths, not fewer.',
        molecularDetail:
          'Microvascular endpoints: DCCT 76% reduction in retinopathy development, UKPDS 33 a 25% reduction in microvascular endpoints (p=0.0099). Macrovascular endpoints: UKPDS myocardial infarction 16% (0 to 29, p=0.052, not significant); ORIGIN primary composite HR 1.02 (p=0.63); ACCORD all-cause mortality HR 1.22 (p=0.04) against intensive control. The surrogate and the hard outcome have separated repeatedly in this drug class and the direction of the separation is not always favourable.',
        iconName: 'Scale',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'DCCT (N Engl J Med 1993;329:977-986)',
        phase: 'Phase 3, randomised, controlled, unblinded',
        sampleSize: 1441,
        primaryEndpoint:
          'Development and progression of diabetic retinopathy in insulin-dependent diabetes under intensive against conventional insulin therapy',
        endpointMet: true,
        statisticalPValue:
          'Retinopathy development reduced 76% (95% CI 62 to 85) in primary prevention; progression slowed 54% (39 to 66) in secondary intervention; clinical neuropathy reduced 60% (38 to 74) over a mean 6.5 years',
        unreportedAdverseSignals:
          'A two-to-threefold increase in severe hypoglycaemia in the intensive arm, reported in the paper itself rather than unreported, and the reason intensive therapy is not simply recommended to everyone. The endpoints moved were microvascular; no cardiovascular benefit was demonstrated within the trial period.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'UKPDS 33 (Lancet 1998;352:837-853)',
        phase: 'Phase 3, randomised, controlled, multicentre',
        sampleSize: 3867,
        primaryEndpoint:
          'Three aggregate endpoints — any diabetes-related endpoint, diabetes-related death, all-cause mortality — under intensive glucose control with a sulphonylurea or insulin against conventional diet-based control',
        endpointMet: true,
        statisticalPValue:
          'Any diabetes-related endpoint 12% lower (95% CI 1 to 21, p=0.029); microvascular endpoints 25% lower (7 to 40, p=0.0099); diabetes-related death 10% lower (−11 to 27, p=0.34); all-cause mortality 6% lower (−10 to 20, p=0.44)',
        unreportedAdverseSignals:
          'Myocardial infarction fell 16% (0 to 29) at p=0.052 and did not reach significance. Major hypoglycaemic episodes were 1.8% per year on insulin against 0.7% on conventional treatment, and weight gain was 4.0 kg on insulin. There was no difference between chlorpropamide, glibenclamide and insulin on any aggregate endpoint.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'ACCORD (N Engl J Med 2008;358:2545-2559)',
        phase: 'Phase 3, randomised, open-label, stopped early',
        sampleSize: 10251,
        primaryEndpoint:
          'Composite of nonfatal myocardial infarction, nonfatal stroke or death from cardiovascular causes, under an A1c target below 6.0% against 7.0 to 7.9%',
        endpointMet: false,
        statisticalPValue:
          '352 against 371 primary events, HR 0.90 (95% CI 0.78 to 1.04), p=0.16 — not met',
        unreportedAdverseSignals:
          'All-cause mortality was higher in the intensive arm: 257 against 203 deaths, HR 1.22 (95% CI 1.01 to 1.46), p=0.04. The intensive arm was discontinued after a mean 3.5 years and the excess mortality has never been fully explained.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ORIGIN (N Engl J Med 2012;367:319-328)',
        phase: 'Phase 3, randomised, open-label, 2x2 factorial',
        sampleSize: 12537,
        primaryEndpoint:
          'Nonfatal myocardial infarction, nonfatal stroke or cardiovascular death with basal insulin glargine targeting fasting glucose at or below 5.3 mmol/L, against standard care',
        endpointMet: false,
        statisticalPValue:
          '2.94 against 2.85 events per 100 person-years, HR 1.02 (95% CI 0.94 to 1.11), p=0.63 over a median 6.2 years',
        unreportedAdverseSignals:
          'Severe hypoglycaemia 1.00 against 0.31 per 100 person-years and weight change +1.6 kg against −0.5 kg. Cancer incidence did not differ (HR 1.00, 95% CI 0.88 to 1.13, p=0.97). The trial used insulin glargine, not regular human insulin.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 76% reduction (95% CI 62 to 85) in the development of retinopathy with intensive insulin therapy in type 1 diabetes over a mean 6.5 years (DCCT, 1,441 patients)',
        'A 25% reduction in microvascular endpoints (95% CI 7 to 40, p=0.0099) with intensive glucose control in newly diagnosed type 2 diabetes (UKPDS 33, 3,867 patients)',
        'A two-to-threefold increase in severe hypoglycaemia with intensive therapy in DCCT, and 1.8% major episodes per year on insulin against 0.7% on diet in UKPDS',
        'Weight gain of 4.0 kg on insulin against 1.7 kg on glibenclamide over ten years in UKPDS 33',
        'No difference in A1c change between short-acting analogues and regular human insulin in type 2 diabetes: −0.03% (95% CI −0.16 to 0.09) across 10 trials and 2,751 participants',
      ],
      unsupportedInferences: [
        'That lowering glucose further is always better — ACCORD randomised 10,251 patients to test it and found 54 more deaths in the intensive arm',
        'That insulin therapy prevents cardiovascular events, which ORIGIN tested directly in 12,537 people and did not find (HR 1.02, p=0.63)',
        'That the engineered analogues deliver better control or less severe hypoglycaemia than human insulin in type 2 diabetes',
        'That the life-saving character of insulin in type 1 diabetes transfers to intensive insulin use in type 2 diabetes; the trial evidence for the two situations is not the same evidence',
      ],
      whatFailedInitially: [
        'The ACCORD intensive-control arm was stopped early for excess all-cause mortality (HR 1.22, 95% CI 1.01 to 1.46, p=0.04)',
        'Myocardial infarction in UKPDS 33 fell 16% at p=0.052 and did not reach significance',
        'ORIGIN missed both co-primary cardiovascular composites, at p=0.63 and p=0.27',
        'The clinical superiority claimed for insulin analogues over human insulin did not appear in a Cochrane review of 2,751 randomised participants or in a 25,489-patient cohort',
      ],
      realWorldOutcome: [
        'Humulin was approved in 1982 as the first recombinant DNA medicine ever licensed, replacing animal-sourced insulin within a decade',
        'The 1923 patent was assigned to the University of Toronto for one dollar per inventor, and no composition patent has covered human insulin for decades',
        'Regular human insulin at US$5.82 per mL of pharmacy acquisition cost is among the least expensive insulins on the United States market, and the analogues that displaced it cost two to ten times more per the JAMA basal-insulin analysis',
        'In a 2017 single-centre survey, 25.5% of insulin-treated patients reported cost-related underuse, with an odds ratio of 2.96 for an A1c at or above 9%',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection from a vial or pen at U-100 or U-500 concentration; also an inhalation powder (Afrezza) and an intravenous premix (Myxredlin)',
      description:
        'Regular human insulin is absorbed from a subcutaneous depot only after the zinc hexamer dissociates, giving an onset of roughly half an hour and a duration of several hours — slower on and longer off than a rapid-acting analogue. U-500 is five times as concentrated and is intended for people requiring more than 200 units daily. The inhaled powder delivers the same molecule across the alveolar membrane with a much faster onset, and carries its own boxed warning for acute bronchospasm in asthma and chronic obstructive pulmonary disease.',
      safetyProfile:
        'Hypoglycaemia is the most common adverse reaction and can be severe, causing seizures, and may be fatal. Hypokalaemia can follow the intracellular potassium shift and may be fatal if untreated. Other reactions include injection-site reactions, lipodystrophy, weight gain, oedema and hypersensitivity including anaphylaxis. Beta-blockers, clonidine, guanethidine and reserpine may blunt the warning symptoms of hypoglycaemia. Concentration errors between U-100 and U-500 are a named labelled risk. Never share a pen device between people even with a changed needle.',
    },
    commonQuestions: [
      {
        q: 'Is human insulin worse than the newer insulins?',
        a: 'Not on the measurements that have been made in type 2 diabetes. The analogues are genuinely different molecules with genuinely faster or flatter absorption, and that is the argument for them. When the argument was tested, a Cochrane review of 10 trials in 2,751 people found a difference in A1c change of −0.03% (95% CI −0.16 to 0.09), and a cohort of 25,489 people starting basal insulin found a hazard ratio of 1.16 (0.71 to 1.78) for hypoglycaemia serious enough to reach an emergency department, with A1c falling slightly more on NPH. The randomised literature does show less nocturnal hypoglycaemia with long-acting analogues, which is a real advantage for some people. In type 1 diabetes, where the timing of a meal dose matters more, the case for the rapid analogues is stronger and less well quantified against human insulin. Which is right for a given person is a prescribing question and this page does not answer it.',
        auditNote:
          'A better pharmacokinetic curve is a measurement. A better clinical outcome is a different measurement, and the second does not follow from the first.',
      },
      {
        q: 'Does keeping my blood sugar as low as possible protect me?',
        a: 'Not as a general rule, and the evidence against it is a randomised trial. ACCORD put 10,251 people with type 2 diabetes and high cardiovascular risk on a target A1c below 6% or 7 to 7.9%. The cardiovascular endpoint did not improve (HR 0.90, p=0.16) and all-cause mortality was higher in the intensive arm — 257 deaths against 203, HR 1.22, p=0.04 — so that arm was stopped. What glucose control has been shown to do, repeatedly, is reduce small-vessel damage: DCCT cut new retinopathy by 76% in type 1 diabetes and UKPDS cut microvascular endpoints by 25% in type 2. Those are real and they are not the same as preventing a heart attack. Targets are individualised for exactly this reason.',
        auditNote:
          'ACCORD is the cleanest example in diabetes of a surrogate and an outcome pointing in opposite directions.',
      },
      {
        q: 'Why does insulin make me gain weight?',
        a: 'Because that is part of what the hormone does. The prescribing information records that insulins inhibit the breakdown of fat and protein and enhance protein synthesis and the conversion of excess glucose into fat. In UKPDS 33 the insulin arm gained 4.0 kg over ten years against 1.7 kg on glibenclamide, and in ORIGIN basal insulin produced a 1.6 kg gain where standard care lost 0.5 kg. Some of the early gain is also recovery of calories that were previously being lost as glucose in the urine.',
      },
      {
        q: 'What is the difference between U-100 and U-500?',
        a: 'Concentration, by a factor of five. U-500 holds 500 units of insulin per millilitre where U-100 holds 100, and it is indicated for adults and children requiring more than 200 units a day. The same volume therefore delivers five times the dose, which is why the label carries a specific warning about medication errors between insulin concentrations and states that the safety and efficacy of U-500 combined with other insulins has not been determined. This is a product-presentation hazard rather than anything about the molecule, and it is the reason to check the concentration printed on the vial at every fill.',
      },
      {
        q: 'Insulin is over a hundred years old and the patent was given away. Why is it expensive?',
        a: 'The molecule is not patented and has not been for decades; the sustained cost sits in manufacturing, regulatory and distribution structures rather than in intellectual property on the hormone. Whatever the cause, the consequence is measurable: in a survey of 199 insulin-treated patients at one United States academic centre in 2017, 51 (25.5%) reported having used less insulin than prescribed, not filled a prescription, or stopped, because of cost, and those patients had an odds ratio of 2.96 (95% CI 1.14 to 8.16) for an A1c at or above 9%. It is a single centre with a 56% response rate. Regular human insulin is among the least expensive insulins available, at US$5.82 per mL of pharmacy acquisition cost in the most recent CMS survey.',
        auditNote:
          'A drug that is not taken has no efficacy, whatever its trials showed. Cost-related underuse is a pharmacological event.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'The Diabetes Control and Complications Trial Research Group. The effect of intensive treatment of diabetes on the development and progression of long-term complications in insulin-dependent diabetes mellitus. N Engl J Med 1993;329:977-986',
        identifier: '10.1056/NEJM199309303291401',
        kind: 'doi',
      },
      {
        label:
          'UK Prospective Diabetes Study (UKPDS) Group. Intensive blood-glucose control with sulphonylureas or insulin compared with conventional treatment and risk of complications in patients with type 2 diabetes (UKPDS 33). Lancet 1998;352:837-853',
        identifier: '10.1016/S0140-6736(98)07019-6',
        kind: 'doi',
      },
      {
        label:
          'Action to Control Cardiovascular Risk in Diabetes Study Group. Effects of intensive glucose lowering in type 2 diabetes. N Engl J Med 2008;358:2545-2559 (ACCORD)',
        identifier: '10.1056/NEJMoa0802743',
        kind: 'doi',
      },
      {
        label:
          'ORIGIN Trial Investigators. Basal insulin and cardiovascular and other outcomes in dysglycemia. N Engl J Med 2012;367:319-328',
        identifier: '10.1056/NEJMoa1203858',
        kind: 'doi',
      },
      {
        label:
          'Fullerton B, Siebenhofer A, Jeitler K, et al. Short-acting insulin analogues versus regular human insulin for adult, non-pregnant persons with type 2 diabetes mellitus. Cochrane Database Syst Rev 2018;12:CD013228',
        identifier: '10.1002/14651858.CD013228',
        kind: 'doi',
      },
      {
        label:
          'Lipska KJ, Parker MM, Moffet HH, Huang ES, Karter AJ. Association of initiation of basal insulin analogs vs neutral protamine Hagedorn insulin with hypoglycemia-related emergency department visits or hospital admissions and with glycemic control in patients with type 2 diabetes. JAMA 2018;320:53-62',
        identifier: '10.1001/jama.2018.7993',
        kind: 'doi',
      },
      {
        label:
          'Herkert D, Vijayakumar P, Luo J, et al. Cost-related insulin underuse among patients with diabetes. JAMA Intern Med 2019;179:112-114',
        identifier: '10.1001/jamainternmed.2018.5008',
        kind: 'doi',
      },
      {
        label:
          'HUMULIN R and HUMULIN R U-500 (insulin human) United States prescribing information — Indications 1, Limitations of Use, Warnings and Precautions 5, Description 11, Clinical Pharmacology 12.1 (NDA 018780)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018780',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 118984375 — human insulin, isomeric SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/118984375',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 2. Insulin isophane (NPH) — human insulin crystallised with a fish protein to slow it down.
  //    Declared obsolete by the analogues; the two largest independent assessments put it back.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'insulin-susp-isophane-recombinant-human',
    name: 'Insulin Susp Isophane Recombinant Human',
    tradeName: 'Humulin N / Novolin N (NPH)',
    sponsor: 'Eli Lilly and Company (Humulin N, BLA 018781); Novo Nordisk (Novolin N, BLA 019959)',
    targetGene: 'INSR',
    targetProtein:
      'Insulin receptor — the same receptor as regular human insulin, reached more slowly. The drug substance is human insulin co-crystallised with protamine sulfate; the protamine changes the absorption rate and nothing about the receptor pharmacology',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 1982,
    indication:
      'An intermediate-acting human insulin indicated to improve glycaemic control in adult and paediatric patients with diabetes mellitus',
    patientFriendlyIndication: 'Diabetes — the slow-acting background insulin',
    anatomicalSite:
      'Subcutaneous depot, where the protamine-insulin crystal must dissolve before the hormone reaches the insulin receptor on muscle, fat and liver',
    conditionContext: {
      conditionExplainer:
        'Insulin therapy needs two things: a background supply covering the hours between meals and overnight, and a sharp burst covering the meal itself. NPH is a background insulin. Human insulin is crystallised with protamine, a small basic protein originally obtained from fish sperm, and the crystal has to dissolve in the tissue before the hormone can act — which is what makes it slow.',
      whyItMatters:
        'NPH is the drug the long-acting analogues were built to replace. That replacement happened fast and at several times the price. Since then a Cochrane review of 24 randomised trials and a 25,489-patient cohort have both looked at what was gained, and the answer is narrower than the marketing: the same A1c, less nocturnal hypoglycaemia in the randomised literature, and no reduction in the hypoglycaemia severe enough to reach a hospital.',
      whoTakesThis:
        'People with type 1 or type 2 diabetes needing background insulin. It remains on the WHO Model List of Essential Medicines, where it was added in 2019 and reaffirmed in the 2023 list.',
      clinicalGoals:
        'A fasting glucose and an A1c, both surrogates. No trial of NPH against an analogue has been powered for death, heart attack or blindness; the Cochrane review states that information on patient-relevant outcomes such as death from any cause was insufficient or lacking in almost all included trials.',
    },
    oneSentenceVerdict:
      'Human insulin held in a protamine crystal so it releases over hours rather than minutes, with a median peak effect at 6.5 hours that ranged from 2.8 to 13 hours across four occasions in the same sixteen healthy subjects in its own label — and which, when the long-acting analogues that replaced it were tested against it, matched them on A1c (6.97% against 6.96% in 756 patients) and was not beaten on severe hypoglycaemia in the Cochrane pooling (glargine RR 0.68, 95% CI 0.46 to 1.01).',
    laymanHowItWorks:
      'This is the same insulin molecule your body would make, but packed into microscopic crystals with a protein called protamine. The crystals cannot be absorbed as they are; they have to dissolve slowly in the tissue under the skin, releasing insulin over several hours. That is why the vial is cloudy and has to be rolled to mix before use, and why one injection can cover a night or most of a day. Once the insulin does get free it works exactly like any other insulin — it tells muscle and fat to take up glucose and tells the liver to stop making it.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$5.22 per mL at United States pharmacy acquisition cost (CMS NADAC, median of the four listed NPH products, survey effective 19 August 2026; the range runs from US$4.27 for a Humulin N vial to US$9.04 for a Humulin N KwikPen)',
      markupEstimate: '',
      openPatentNotes:
        'NPH was formulated by Hans Christian Hagedorn and colleagues in the 1930s and no composition patent has covered it for decades; the recombinant human insulin inside it has been unpatented for decades as well. It is listed on the WHO Model List of Essential Medicines, added in the 21st list in 2019. The JAMA analysis of 25,489 basal-insulin initiators describes the long-acting analogues that displaced it as costing two to ten times more.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Every alternative to NPH is a long-acting analogue, and the comparison has been made repeatedly in randomised trials and once in a very large cohort. The honest summary is that the analogues do not lower A1c further, do reduce nocturnal hypoglycaemia in the randomised literature, did not reduce hypoglycaemia serious enough to reach an emergency department in routine care, and cost several times more.',
      conventionalRx: [
        {
          name: 'Insulin glargine (Lantus, Basaglar, Toujeo)',
          class: 'Long-acting insulin analogue',
          howItCompares:
            'In the Treat-to-Target trial, 756 patients titrated to a fasting glucose target ended at A1c 6.96% on glargine and 6.97% on NPH — identical. The difference was that 33.2% against 26.7% reached A1c at or below 7% without documented nocturnal hypoglycaemia (p<0.05). Across 16 randomised trials in the Cochrane review, severe hypoglycaemia gave a risk ratio of 0.68 (95% CI 0.46 to 1.01) — a reduction that does not exclude no effect.',
          typicalCost:
            'Two to ten times the cost of NPH, per the JAMA analysis of basal insulin initiation',
          prosAndCons:
            'Pros: flatter profile, once-daily dosing, less nocturnal hypoglycaemia in trials, no resuspension. Cons: identical A1c, no demonstrated reduction in severe hypoglycaemia in the pooled analysis, and no outcome data.',
        },
        {
          name: 'Insulin detemir (Levemir) and insulin degludec (Tresiba)',
          class: 'Long-acting and ultra-long-acting insulin analogues',
          howItCompares:
            'The Cochrane review pooled 8 trials of detemir against NPH: severe hypoglycaemia risk ratio 0.45 (95% CI 0.17 to 1.20), which again includes no effect, while serious hypoglycaemia reached a Peto odds ratio of 0.16 (95% CI 0.04 to 0.61). HbA1c changes were comparable throughout.',
          typicalCost: 'Substantially more than NPH at United States acquisition cost',
          prosAndCons:
            'Pros: the flattest profiles available and the strongest signal on serious hypoglycaemia in the pooled data. Cons: the reviewers judged information on outcomes such as all-cause death insufficient or lacking in almost all included trials.',
        },
        {
          name: 'Regular human insulin (Humulin R, Novolin R)',
          class: 'Short-acting human insulin',
          howItCompares:
            'Not a substitute but the other half of the pair. Regular human insulin is the same molecule without protamine, giving onset in about half an hour where NPH peaks at a median 6.5 hours. The two are often used together and are supplied premixed at fixed ratios.',
          typicalCost:
            'US$5.82 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 16 listed products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: covers a meal rather than a night; clear solution needing no resuspension. Cons: will not cover the overnight period; using it as a background insulin requires far more injections.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Roll it until it is uniformly cloudy',
          action: 'Mix the vial or pen before every dose and look at what you have mixed.',
          patientImpact:
            'NPH is a suspension, not a solution: the active drug is in crystals that settle. The label directs inspecting the product visually before use, states that it should appear uniformly cloudy after mixing, and directs not using it if particulate matter is seen. An unmixed dose is an unpredictable dose of the drug whose overdose is hypoglycaemia.',
          clinicalPrecaution:
            'Do not use if it has been frozen. Vials are limited to 31 days total at room temperature and KwikPens to 14 days, per the label storage table.',
        },
        {
          name: 'Tell a cardiologist or anaesthetist that you use NPH',
          action:
            'Mention NPH insulin before cardiac catheterisation, bypass surgery or any procedure where heparin will be reversed.',
          patientImpact:
            'Heparin is reversed with protamine sulfate — the same protein that is in NPH. Prior exposure through NPH is a recognised risk factor for severe protamine reactions. A pooled analysis of the surgical literature reported 2.1% against 0.12%, an odds ratio of 15.52.',
          clinicalPrecaution:
            'This is a hazard of the formulation and not of insulin. It is a matter for the procedural team to plan around, not a reason to change insulin on a reference page’s advice.',
        },
        {
          name: 'Treat the 3 a.m. episodes as information',
          action: 'Report overnight hypoglycaemia rather than only daytime readings.',
          patientImpact:
            'The one thing the analogues reliably beat NPH on is nocturnal hypoglycaemia. In the Treat-to-Target trial the endpoint that separated them was A1c at or below 7% without documented nocturnal hypoglycaemia, at 33.2% against 26.7% (p<0.05), with the daytime A1c identical.',
          clinicalPrecaution:
            'Repeated hypoglycaemia degrades the warning symptoms of the next episode. Any change of insulin product is a prescribing decision.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'generic_formula',
      targetReceptorAffinity:
        'The label describes insulin isophane human as a suspension of crystals produced by combining human insulin and protamine sulfate under conditions suitable for crystal formation. The amino acid sequence is identical to human insulin, with the empirical formula C257H383N65O77S6 and a molecular weight of 5.808 kDa. Each millilitre of HUMULIN N contains 100 units of insulin human, protamine sulfate 0.35 mg, zinc ion 0.035 mg, dibasic sodium phosphate 3.78 mg, glycerin 16 mg, metacresol 1.6 mg and phenol 0.65 mg, at pH 7.0 to 7.5. No single SMILES string describes the drug product, because the product is a co-crystal of two proteins and a metal ion rather than one molecule, and none is stated here rather than one being invented.',
      structureSource: {
        label:
          'HUMULIN N (insulin isophane human) injectable suspension United States prescribing information, section 11 Description (BLA 018781)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22HUMULIN+N%22',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'nph-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Characterise the protamine, not just the insulin',
          description:
            'Protamine is a heterogeneous mixture of arginine-rich peptides from fish, and its composition is what determines both the crystal habit and the immunogenic risk. Testing only the insulin leaves the variable component of the product untested, and that component is the one implicated in protamine reactions during heparin reversal.',
          reagentsAndBuffer:
            'Protamine sulfate reference standard, amino acid analysis and RP-HPLC peptide profiling, endotoxin testing, insulin human drug substance released against the WHO or USP insulin reference standard',
        },
        {
          id: 'nph-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Produce the human insulin drug substance',
          description:
            'The hormone is the same recombinant human insulin used in the clear regular product: expressed as a proinsulin fusion in Escherichia coli, refolded, enzymatically converted and purified. Nothing about the protamine step alters the sequence, which is why the label can state the amino acid sequence is identical to human insulin.',
          dependsOnStepId: 'nph-w1',
          reagentsAndBuffer:
            'Recombinant Escherichia coli fermentation, oxidative refolding, trypsin and carboxypeptidase B conversion, ion-exchange and reversed-phase purification',
        },
        {
          id: 'nph-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Reach the isophane stoichiometry exactly',
          description:
            'Isophane means the ratio of insulin to protamine at which neither is left over in the supernatant. Off-ratio material leaves free insulin in solution, which acts immediately, or free protamine, which does not. The pharmacokinetics that define the product are a property of hitting this stoichiometry, not of the ingredients being present.',
          dependsOnStepId: 'nph-w2',
          reagentsAndBuffer:
            'Controlled titration of protamine sulfate against insulin at pH 7.0 to 7.5, dibasic sodium phosphate buffer, zinc oxide adjusted to 0.035 mg zinc ion per mL, supernatant assay for unbound insulin',
        },
        {
          id: 'nph-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Crystallise, preserve and fill as a suspension',
          description:
            'Crystallisation under controlled temperature and phenol content gives the rod-shaped crystals whose dissolution rate is the drug’s action profile. The product is then filled as a suspension, which is why it is cloudy and why every dose depends on the patient resuspending it before drawing.',
          dependsOnStepId: 'nph-w3',
          reagentsAndBuffer:
            'Metacresol 1.6 mg/mL and phenol 0.65 mg/mL as preservative and crystal habit modifier, glycerin 16 mg/mL for tonicity, controlled cooling crystallisation, aseptic fill at 100 units/mL',
        },
        {
          id: 'nph-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure the time course, not only the potency',
          description:
            'For an intermediate-acting suspension the release curve is the product. The label’s own euglycaemic clamp study in 16 healthy subjects gave a median maximum effect at 6.5 hours with a range of 2.8 to 13 hours across four occasions, and a median peak serum concentration at about 4 hours with a range of 1 to 12 — variability that belongs in the release characterisation rather than being discovered by a patient.',
          dependsOnStepId: 'nph-w4',
          reagentsAndBuffer:
            'Euglycaemic glucose clamp with glucose infusion rate as the pharmacodynamic readout, insulin immunoassay for serum concentration, in vitro dissolution and crystal size distribution, resuspendability testing after defined settling',
        },
      ],
    },
    keyAudits: [
      {
        id: 'nph-a1',
        category: 'measured',
        title: 'Against glargine, the A1c was identical; the difference was overnight',
        laymanSummary:
          'When 756 patients were titrated to the same fasting glucose target on either NPH or the newer glargine, they finished at the same A1c to two decimal places. What separated the drugs was how many reached target without a low blood sugar at night.',
        technicalDetails:
          'The Treat-to-Target trial randomised 756 overweight adults with type 2 diabetes inadequately controlled on one or two oral agents to bedtime insulin glargine or bedtime NPH, titrated to a fasting plasma glucose below 5.55 mmol/L over 24 weeks. End-of-study A1c was 6.96% on glargine and 6.97% on NPH, with roughly 60% of each arm reaching 7% or below. The endpoint that separated them was reaching A1c at or below 7% without documented nocturnal hypoglycaemia: 33.2% against 26.7%, p<0.05, with other categories of symptomatic hypoglycaemia 21% to 48% lower on glargine. This is the trial most often cited to show that the analogue is better, and what it shows precisely is equal glycaemic control with less nocturnal hypoglycaemia — not better glycaemic control.',
        evidenceSource: 'Riddle MC, Rosenstock J, Gerich J. Diabetes Care 2003;26:3080-3086',
        doi: '10.2337/diacare.26.11.3080',
        measuredMetric:
          'End-of-study HbA1c and the proportion reaching HbA1c at or below 7% without documented nocturnal hypoglycaemia',
        auditFlag: 'verified',
      },
      {
        id: 'nph-a2',
        category: 'inferred',
        title: 'Pooled across 24 trials, the severe-hypoglycaemia advantage does not exclude zero',
        laymanSummary:
          'The Cochrane review of every randomised trial of long-acting analogues against NPH found the reduction in severe hypoglycaemia was consistent with there being no reduction at all, and A1c was comparable throughout.',
        technicalDetails:
          'Semlitsch and colleagues pooled 24 randomised controlled trials in adults with type 2 diabetes — 16 of insulin glargine against NPH (3,419 participants randomised to glargine) and 8 of insulin detemir against NPH (1,321 randomised to detemir). For glargine, severe hypoglycaemia gave a risk ratio of 0.68 (95% CI 0.46 to 1.01; absolute risk reduction −1.2%, 95% CI −2.0 to 0) and serious hypoglycaemia 0.75 (0.52 to 1.09). For detemir, severe hypoglycaemia gave 0.45 (0.17 to 1.20) and serious hypoglycaemia a Peto odds ratio of 0.16 (0.04 to 0.61). Changes in HbA1c were comparable. The reviewers stated that information on patient-relevant outcomes such as death from any cause was insufficient or lacking in almost all included trials. The class replacement therefore rests on nocturnal hypoglycaemia and convenience, both real, and not on severe hypoglycaemia, glycaemic control or any hard outcome.',
        evidenceSource:
          'Semlitsch T, Engler J, Siebenhofer A, Jeitler K, Berghold A, Horvath K. Cochrane Database Syst Rev 2020;11:CD005613',
        doi: '10.1002/14651858.CD005613.pub4',
        inferredClaim:
          'That long-acting insulin analogues reduce severe hypoglycaemia and improve outcomes relative to NPH — a claim whose pooled confidence intervals include no effect and whose outcome data the reviewers judged insufficient or absent',
        auditFlag: 'contested',
      },
      {
        id: 'nph-a3',
        category: 'failed',
        title: 'In routine care, the analogue advantage did not appear at all',
        laymanSummary:
          'Among 25,489 people with type 2 diabetes starting a background insulin in a large United States health system, starting an analogue rather than NPH did not reduce the low blood sugars that put people in hospital, and their A1c fell slightly less.',
        technicalDetails:
          'A retrospective cohort of 25,489 adults with type 2 diabetes initiating basal insulin in Kaiser Permanente Northern California between 2006 and 2015 — 1,928 starting an analogue and 23,561 starting NPH, all with full medical and prescription coverage — reported an adjusted hazard ratio of 1.16 (95% CI 0.71 to 1.78) for hypoglycaemia-related emergency department visits or hospital admissions with an analogue against NPH. A1c fell 1.2 percentage points with the analogue and 1.5 with NPH, an adjusted difference-in-differences of −0.22% (95% CI −0.09 to −0.37) in favour of NPH. The cohort is observational and the analogue group is far smaller than the NPH group, both of which limit it. It is nonetheless the largest look at what happened when the substitution was made in practice, and the answer was no reduction in the hypoglycaemia that reaches a hospital.',
        evidenceSource: 'Lipska KJ, Parker MM, Moffet HH, Huang ES, Karter AJ. JAMA 2018;320:53-62',
        doi: '10.1001/jama.2018.7993',
        measuredMetric:
          'Hypoglycaemia-related emergency department visits or hospital admissions, and A1c change, after initiation of a basal analogue against NPH',
        auditFlag: 'caution',
      },
      {
        id: 'nph-a4',
        category: 'failed',
        title: 'The protamine in it can make heparin reversal dangerous later',
        laymanSummary:
          'The protein that slows this insulin down is the same one given in operating theatres to switch off heparin. People who have used NPH are markedly more likely to have a severe reaction when they receive it.',
        technicalDetails:
          'Protamine sulfate is the standard agent for reversing heparin during cardiac catheterisation and cardiopulmonary bypass. Repeated subcutaneous exposure through protamine-containing insulin sensitises some patients. In a series of 7,750 catheterisation procedures with protamine given in 3,341, adverse reactions occurred in 0.6% (1 of 171) of NPH users against 0.06% (2 of 3,170) of non-insulin patients, an odds ratio of 7.96 in that dataset; the authors’ meta-analysis of the surgical literature gave 2.1% against 0.12%, an odds ratio of 15.52, attributed to the larger protamine doses used in surgery and to prior sensitisation at catheterisation. The absolute numbers in the catheterisation series are very small and the confidence around them correspondingly wide. The point stands regardless: this is an adverse effect of the excipient that makes NPH slow, not of the hormone, and it appears years after the exposure in a setting where nobody is thinking about insulin.',
        evidenceSource:
          'Levy JH, Schwieger IM, Zaidan JR, Faraj BA, Weintraub WS. Catheterization and Cardiovascular Diagnosis 1991 — protamine allergy reactions during cardiac catheterization and cardiac surgery in patients taking protamine-insulin preparations',
        measuredMetric:
          'Incidence of adverse protamine reactions during catheterisation and cardiac surgery, stratified by prior NPH insulin exposure',
        auditFlag: 'caution',
      },
      {
        id: 'nph-a5',
        category: 'measured',
        title: 'The label’s own study found the peak anywhere between 2.8 and 13 hours',
        laymanSummary:
          'In sixteen healthy volunteers each injected on four separate occasions, the strongest effect of the same dose arrived at a median of six and a half hours — but somewhere between under three hours and thirteen hours depending on the occasion.',
        technicalDetails:
          'Section 12.2 of the HUMULIN N label reports a study in which 16 healthy subjects received subcutaneous HUMULIN N at 0.4 unit/kg on four occasions, with insulin activity measured by glucose infusion rate. The median maximum effect occurred at 6.5 hours with a range of 2.8 to 13 hours. Section 12.3 reports median peak serum insulin at approximately 4 hours with a range of 1 to 12 hours. The label states that the time course may vary between individuals and within the same individual, that the onset, peak and duration parameters should be considered only as general guidelines, and that absorption is affected by injection site and physical activity. This is measured variability published by the manufacturer, and it is simultaneously the honest description of the product and the strongest pharmacological argument the analogues have.',
        evidenceSource:
          'HUMULIN N United States prescribing information, sections 12.2 and 12.3 (BLA 018781)',
        measuredMetric:
          'Time to maximum glucose-lowering effect and to peak serum insulin after a fixed 0.4 unit/kg subcutaneous dose',
        auditFlag: 'verified',
      },
      {
        id: 'nph-a6',
        category: 'conclusion_shift',
        title: 'Written off as obsolete, then put back on the essential medicines list',
        laymanSummary:
          'For about fifteen years NPH was treated as a drug the analogues had superseded. The World Health Organization added it to its essential medicines list in 2019, and two large independent assessments since then have found the case against it thinner than assumed.',
        technicalDetails:
          'Soluble and isophane human insulin were added to the WHO Model List of Essential Medicines in the 21st list in 2019 and carried forward in the 23rd list in 2023. The reversal is not a rehabilitation of NPH on new efficacy data — no new trial found it superior. It is a re-reading of the existing data in which the analogue advantage was resolved into its parts: equal A1c (Treat-to-Target, 6.97% against 6.96%), a nocturnal hypoglycaemia benefit that is real, a severe hypoglycaemia benefit whose pooled confidence interval includes no effect (RR 0.68, 95% CI 0.46 to 1.01), no reduction in hospital-level hypoglycaemia in a 25,489-patient cohort, and no outcome data on either side. What changed was not the evidence but the weight put on the price, which the JAMA analysis puts at two to ten times.',
        evidenceSource:
          'WHO Model List of Essential Medicines, 23rd list (2023); Semlitsch T et al. Cochrane Database Syst Rev 2020;11:CD005613; Lipska KJ et al. JAMA 2018;320:53-62',
        inferredClaim:
          'That NPH had been superseded and was no longer an appropriate first choice for basal insulin — an inference from a pharmacokinetic advantage that the outcome-level comparisons did not sustain',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Insulin locked inside a crystal',
        laymanDesc:
          'The active drug is ordinary human insulin, but it has been crystallised together with protamine, a small protein from fish. The crystals are why the liquid is cloudy and why it works slowly.',
        molecularDetail:
          'The label describes a suspension of crystals produced by combining human insulin and protamine sulfate under conditions suitable for crystal formation. Amino acid sequence identical to human insulin, empirical formula C257H383N65O77S6, molecular weight 5.808 kDa. Each millilitre carries 100 units of insulin, 0.35 mg protamine sulfate and 0.035 mg zinc ion at pH 7.0 to 7.5.',
        iconName: 'Box',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It has to be shaken back into suspension every time',
        laymanDesc:
          'The crystals settle. If the vial or pen is not rolled until it is evenly cloudy, the dose drawn is not the dose intended — and there is no way to tell from the syringe.',
        molecularDetail:
          'Section 2.1 of the label directs visual inspection before use, states the product should appear uniformly cloudy after mixing, and directs not using it if particulate matter is seen. This is the only insulin presentation in common use whose delivered dose depends on a patient-performed physical step, and it is a recognised source of dose variability independent of the pharmacokinetics.',
        iconName: 'RefreshCw',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'The crystal dissolves over hours in the tissue',
        laymanDesc:
          'Under the skin, the crystals slowly break down and release free insulin. That dissolution is the whole design: it turns one injection into a background supply lasting most of a day.',
        molecularDetail:
          'Subcutaneous dissolution of the isophane crystal is rate-limiting for absorption, giving an intermediate-acting profile with slower onset and longer duration than regular human insulin. Median peak serum insulin at about 4 hours (range 1 to 12) and median maximum effect at 6.5 hours (range 2.8 to 13) at 0.4 unit/kg in 16 healthy subjects. Absorption is affected by injection site and physical activity.',
        iconName: 'Hourglass',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The freed insulin does what insulin does',
        laymanDesc:
          'Once out of the crystal, the molecule is indistinguishable from the body’s own insulin. It docks on its receptor and moves glucose out of the blood.',
        molecularDetail:
          'Section 12.1: HUMULIN N lowers blood glucose by stimulating peripheral glucose uptake by skeletal muscle and fat and by inhibiting hepatic glucose production; insulins inhibit lipolysis and proteolysis and enhance protein synthesis. Receptor pharmacology is that of human insulin, unchanged by the protamine, which never enters the mechanism after the crystal dissolves.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'The peak is real, and its timing is not reliable',
        laymanDesc:
          'Unlike the newer background insulins, NPH has a pronounced peak. Its arrival time varies between people and between days in the same person, which is why hypoglycaemia at night is its characteristic problem.',
        molecularDetail:
          'The label states the parameters of activity should be considered only as general guidelines and that the time course may vary within the same individual. The clinical correlate is the endpoint that separated NPH from glargine in Treat-to-Target: A1c at or below 7% without documented nocturnal hypoglycaemia, 26.7% against 33.2% (p<0.05), while end-of-study A1c was identical at 6.97% against 6.96%.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'What was gained by replacing it, measured',
        laymanDesc:
          'The newer background insulins reduce night-time lows. They did not lower A1c further, did not clearly reduce severe lows, and in routine care did not reduce the lows that reach hospital.',
        molecularDetail:
          'Cochrane 2020: glargine against NPH severe hypoglycaemia RR 0.68 (95% CI 0.46 to 1.01); detemir 0.45 (0.17 to 1.20); HbA1c comparable; mortality data insufficient or lacking in almost all trials. JAMA 2018 cohort of 25,489: hypoglycaemia-related emergency visits or admissions adjusted HR 1.16 (0.71 to 1.78), A1c difference-in-differences −0.22% favouring NPH.',
        iconName: 'Scale',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Treat-to-Target Trial (Diabetes Care 2003;26:3080-3086)',
        phase: 'Phase 4, randomised, open-label, parallel-group, 24 weeks',
        sampleSize: 756,
        primaryEndpoint:
          'Percentage of patients reaching HbA1c at or below 7% without documented nocturnal hypoglycaemia, with bedtime insulin glargine against bedtime NPH added to oral therapy and titrated to a fasting plasma glucose target',
        endpointMet: true,
        statisticalPValue:
          '33.2% on glargine against 26.7% on NPH, p<0.05; end-of-study A1c 6.96% against 6.97%, with about 60% of each arm at or below 7%',
        unreportedAdverseSignals:
          'Glycaemic control was identical between the arms; the entire separation was in nocturnal hypoglycaemia, with other categories of symptomatic hypoglycaemia 21% to 48% lower on glargine. The trial ran 24 weeks and measured no clinical outcome.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Cochrane pooled analysis of 24 randomised trials of (ultra-)long-acting analogues against NPH (Cochrane Database Syst Rev 2020;11:CD005613)',
        phase: 'Systematic review and meta-analysis of randomised controlled trials',
        sampleSize: 4740,
        primaryEndpoint:
          'Severe and serious hypoglycaemia, HbA1c change and all-cause mortality with insulin glargine, detemir or degludec against NPH in adults with type 2 diabetes. The sample size shown is the sum of participants randomised to an analogue arm — 3,419 to glargine across 16 trials and 1,321 to detemir across 8; the NPH comparator arms are additional and were not separately stated in the abstract',
        endpointMet: false,
        statisticalPValue:
          'Glargine against NPH severe hypoglycaemia RR 0.68 (95% CI 0.46 to 1.01), serious hypoglycaemia RR 0.75 (0.52 to 1.09); detemir against NPH severe hypoglycaemia RR 0.45 (0.17 to 1.20), serious hypoglycaemia Peto OR 0.16 (0.04 to 0.61); HbA1c changes comparable',
        unreportedAdverseSignals:
          'The reviewers state that information on patient-relevant outcomes such as death from any cause was insufficient or lacking in almost all included trials. Both severe-hypoglycaemia confidence intervals cross unity.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Kaiser Permanente Northern California basal insulin cohort (JAMA 2018;320:53-62)',
        phase: 'Retrospective observational cohort, not randomised',
        sampleSize: 25489,
        primaryEndpoint:
          'Hypoglycaemia-related emergency department visits or hospital admissions after initiation of a basal insulin analogue against NPH in type 2 diabetes, 2006 to 2015',
        endpointMet: false,
        statisticalPValue:
          'Adjusted hazard ratio 1.16 (95% CI 0.71 to 1.78) — no reduction; A1c fell 1.2 points on the analogue against 1.5 on NPH, adjusted difference-in-differences −0.22% (95% CI −0.09 to −0.37)',
        unreportedAdverseSignals:
          'Observational and unbalanced by design: 1,928 analogue initiators against 23,561 NPH initiators, in an insured population with full prescription coverage. Residual confounding by indication cannot be excluded.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'End-of-study A1c 6.97% on NPH against 6.96% on insulin glargine in 756 patients titrated to the same fasting glucose target',
        'A median maximum effect at 6.5 hours with a range of 2.8 to 13 hours across four occasions in 16 healthy subjects at 0.4 unit/kg, from the manufacturer’s own clamp study',
        'Severe hypoglycaemia risk ratio 0.68 (95% CI 0.46 to 1.01) for glargine against NPH pooled over 16 randomised trials',
        'An adjusted hazard ratio of 1.16 (95% CI 0.71 to 1.78) for hypoglycaemia-related hospital contact with an analogue against NPH in 25,489 real-world initiators',
        'Composition per millilitre from the label: 100 units insulin human, 0.35 mg protamine sulfate, 0.035 mg zinc ion, pH 7.0 to 7.5',
      ],
      unsupportedInferences: [
        'That the long-acting analogues achieve better glycaemic control than NPH — the trial most cited for that found A1c identical to two decimal places',
        'That the analogues reduce severe hypoglycaemia — the pooled confidence intervals for both glargine and detemir include no effect',
        'That the nocturnal hypoglycaemia advantage seen in trials carries through to hypoglycaemia serious enough to need a hospital, which a 25,489-patient cohort did not find',
        'That any basal insulin, NPH or analogue, has been shown to change mortality or cardiovascular outcomes; the Cochrane reviewers found such data insufficient or lacking in almost all trials',
      ],
      whatFailedInitially: [
        'The severe hypoglycaemia reduction with glargine against NPH did not reach significance in the Cochrane pooling (RR 0.68, 95% CI 0.46 to 1.01)',
        'The analogue advantage in hypoglycaemia-related emergency visits did not appear at all in routine care (aHR 1.16, 95% CI 0.71 to 1.78)',
        'Adjusted A1c change favoured NPH by 0.22 percentage points in the same cohort',
        'The protamine that gives the product its duration sensitises some patients to protamine sulfate, with a pooled surgical odds ratio of 15.52 for adverse reactions during heparin reversal',
      ],
      realWorldOutcome: [
        'Approved in 1982 alongside regular human insulin and largely displaced by long-acting analogues over the following two decades',
        'Added to the WHO Model List of Essential Medicines in the 21st list in 2019 and carried forward in the 23rd list in 2023',
        'US$5.22 per mL at United States pharmacy acquisition cost, against analogues the JAMA analysis puts at two to ten times more',
        'Remains the only widely used insulin whose delivered dose depends on the patient resuspending a settled crystal suspension before every injection',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection only, from a 10 mL multiple-dose vial or a 3 mL single-patient KwikPen or FlexPen at 100 units/mL',
      description:
        'A white, cloudy suspension that must be resuspended and inspected before every dose, and must not be used if particulate matter is seen. Subcutaneous only — the label states it must not be given intravenously. Median peak serum insulin at about 4 hours and median maximum effect at 6.5 hours at 0.4 unit/kg, with wide ranges. Vials are limited to 31 days total at room temperature and KwikPens to 14 days; do not freeze, and do not use if frozen.',
      safetyProfile:
        'Hypoglycaemia may be life-threatening and is the dose-limiting adverse effect, with nocturnal episodes the characteristic pattern for an intermediate-acting peaked insulin. Other labelled risks are hyperglycaemia or hypoglycaemia around any change of insulin regimen; hypoglycaemia due to mix-ups between insulin products; hypersensitivity reactions that may be life-threatening; hypokalaemia; and fluid retention and heart failure when combined with thiazolidinediones. Rotate injection sites to reduce lipodystrophy and localised cutaneous amyloidosis. Never share a pen or syringe between patients even with a changed needle. Separately, prior NPH exposure is a recognised risk factor for severe reactions to protamine sulfate given later to reverse heparin.',
    },
    commonQuestions: [
      {
        q: 'Why is this insulin cloudy when my other one is clear?',
        a: 'Because it is a suspension rather than a solution. The insulin has been crystallised with protamine, a small protein originally obtained from fish sperm, and those crystals scatter light. The crystals also settle, which is why the label directs inspecting the product before use and confirming it looks uniformly cloudy after mixing, and directs not using it if you can see particles. The cloudiness is the mechanism: the crystals have to dissolve in the tissue before the insulin can act, and that dissolution is what stretches one injection across most of a day.',
      },
      {
        q: 'Is NPH worse than the newer long-acting insulins?',
        a: 'On the measurements that exist, it is worse on one thing and equal on the rest. The Treat-to-Target trial titrated 756 people to the same fasting glucose target and finished with A1c of 6.97% on NPH and 6.96% on glargine. What separated them was reaching that target without a documented low blood sugar overnight — 26.7% against 33.2%, p<0.05. The Cochrane review of 24 trials found A1c comparable throughout, severe hypoglycaemia with a risk ratio of 0.68 (95% CI 0.46 to 1.01) for glargine and 0.45 (0.17 to 1.20) for detemir — both intervals including no effect — and outcome data on death insufficient or lacking in almost every trial. A cohort of 25,489 people starting basal insulin in routine care found no reduction in hypoglycaemia that reached an emergency department. Which is right for a given person depends on how much the overnight risk matters to them, and that is a prescribing conversation.',
        auditNote:
          'The nocturnal hypoglycaemia advantage is real and specific. It is not the same claim as better control, and it is routinely reported as though it were.',
      },
      {
        q: 'Why does the same dose act differently on different days?',
        a: 'Because it does, and the manufacturer measured it. In the label’s own study, 16 healthy subjects were given the identical dose of 0.4 unit/kg on four separate occasions; the median time to maximum effect was 6.5 hours, and the range across occasions was 2.8 to 13 hours. Median peak blood level came at about 4 hours with a range of 1 to 12. The label states explicitly that the time course may vary between individuals and within the same individual, that the stated onset, peak and duration should be treated only as general guidelines, and that injection site and physical activity affect absorption. Incomplete resuspension adds a further, avoidable source of variability on top of that.',
      },
      {
        q: 'I am having a heart procedure. Does using NPH matter?',
        a: 'Tell the team, yes. Heparin used during cardiac catheterisation and bypass surgery is reversed with protamine sulfate — the same protein that is in NPH — and prior exposure through NPH is a recognised risk factor for a severe reaction. In one series of 7,750 catheterisation procedures, adverse reactions occurred in 1 of 171 NPH users (0.6%) against 2 of 3,170 non-insulin patients (0.06%); the authors’ pooled analysis of the surgical literature reported 2.1% against 0.12%, an odds ratio of 15.52, which they attributed to larger protamine doses in surgery and to earlier sensitisation. The absolute numbers are small and the uncertainty around them is wide. It is a planning matter for the procedural team, not a reason to change insulin on your own.',
        auditNote:
          'The hazard belongs to the excipient that makes the product slow, not to insulin, and it surfaces years later in a setting where nobody is thinking about diabetes.',
      },
      {
        q: 'If it is this old, is it still a reasonable choice?',
        a: 'The World Health Organization added soluble and isophane human insulin to its Model List of Essential Medicines in 2019 and kept them there in the 2023 list, which is the clearest institutional answer available. The evidence did not change to produce that: no trial has found NPH superior. What changed was that the analogue advantage was resolved into its components — equal A1c, a real nocturnal hypoglycaemia benefit, a severe hypoglycaemia benefit whose interval crosses zero, no hospital-level benefit in routine care, and no outcome data — against a price the JAMA analysis puts at two to ten times NPH.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Riddle MC, Rosenstock J, Gerich J. The Treat-to-Target Trial: randomized addition of glargine or human NPH insulin to oral therapy of type 2 diabetic patients. Diabetes Care 2003;26:3080-3086',
        identifier: '10.2337/diacare.26.11.3080',
        kind: 'doi',
      },
      {
        label:
          'Semlitsch T, Engler J, Siebenhofer A, Jeitler K, Berghold A, Horvath K. (Ultra-)long-acting insulin analogues versus NPH insulin (human isophane insulin) for adults with type 2 diabetes mellitus. Cochrane Database Syst Rev 2020;11:CD005613',
        identifier: '10.1002/14651858.CD005613.pub4',
        kind: 'doi',
      },
      {
        label:
          'Lipska KJ, Parker MM, Moffet HH, Huang ES, Karter AJ. Association of initiation of basal insulin analogs vs neutral protamine Hagedorn insulin with hypoglycemia-related emergency department visits or hospital admissions and with glycemic control in patients with type 2 diabetes. JAMA 2018;320:53-62',
        identifier: '10.1001/jama.2018.7993',
        kind: 'doi',
      },
      {
        label:
          'Levy JH, Schwieger IM, Zaidan JR, Faraj BA, Weintraub WS. Protamine allergy reactions during cardiac catheterization and cardiac surgery: risk in patients taking protamine-insulin preparations. Cathet Cardiovasc Diagn 1991',
        identifier: '1831070',
        kind: 'pmid',
      },
      {
        label:
          'HUMULIN N (insulin isophane human) injectable suspension United States prescribing information — Indications 1, Dosage and Administration 2.1 and 2.2, Warnings and Precautions 5, Description 11, Clinical Pharmacology 12.1 to 12.3, How Supplied and Storage 16 (BLA 018781)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018781',
        kind: 'regulatory',
      },
      {
        label: 'WHO Model List of Essential Medicines, 23rd list (2023) — insulin, human isophane',
        identifier: 'https://www.who.int/publications/i/item/WHO-MHP-HPS-EML-2023.02',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost, 2026 file — NDC descriptions HUMULIN N and NOVOLIN N, survey effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 3. Sitagliptin / metformin — a fixed-dose combination whose own label states that none of the
  //    efficacy studies it cites was conducted with the product being sold.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'sitagliptin-metformin',
    name: 'Sitagliptin / Metformin',
    tradeName: 'Janumet / Janumet XR / Zituvimet',
    sponsor:
      'Merck Sharp & Dohme LLC (JANUMET, NDA 022044; JANUMET XR, NDA 202270); generic sitagliptin and metformin hydrochloride tablets are now marketed by multiple manufacturers',
    targetGene: 'DPP4',
    targetProtein:
      'Dipeptidyl peptidase-4, inhibited by sitagliptin. Metformin has no single accepted molecular target; the label describes its actions as decreased hepatic glucose production, decreased intestinal glucose absorption and improved peripheral insulin sensitivity',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2007,
    indication:
      'Adjunct to diet and exercise to improve glycaemic control in adults with type 2 diabetes mellitus. Limitations of Use: not for type 1 diabetes; not studied in patients with a history of pancreatitis',
    patientFriendlyIndication: 'Type 2 diabetes — two glucose-lowering drugs in one tablet',
    anatomicalSite:
      'Sitagliptin acts on DPP-4 in plasma and on endothelial surfaces; metformin acts principally in the hepatocyte and the intestinal wall',
    conditionContext: {
      conditionExplainer:
        'Type 2 diabetes is a state in which the body still makes insulin but responds to it poorly, and the pancreas eventually cannot keep up. The two drugs in this tablet attack different parts of that. Metformin reduces the glucose the liver pours into the blood. Sitagliptin protects the gut hormones that tell the pancreas to release insulin when a meal arrives.',
      whyItMatters:
        'This is one of the most-dispensed combination tablets in diabetes, and it is a clean example of a product approved on arithmetic rather than on its own trial. Its label states plainly that none of the efficacy studies it reports was conducted with the combination product; approval rests on demonstrating that the tablet is bioequivalent to the two drugs taken separately.',
      whoTakesThis:
        'Adults with type 2 diabetes not adequately controlled on metformin alone, or starting both drugs together. Not for type 1 diabetes, and not studied in people with a history of pancreatitis.',
      clinicalGoals:
        'A lower A1c, which is a surrogate. Metformin has an all-cause mortality result from UKPDS 34 in 342 overweight patients. Sitagliptin has a cardiovascular safety trial in 14,671 patients which showed it does not increase events and does not reduce them either.',
    },
    oneSentenceVerdict:
      'A tablet combining a DPP-4 inhibitor and a biguanide that lowers A1c by 2.1 percentage points more than placebo at its top dose (95% CI −2.3 to −1.8, 1,091 patients, 24 weeks) but has never itself been studied for efficacy — the label says so — and whose sitagliptin component, tested in 14,671 patients over three years, neither increased nor reduced cardiovascular events (HR 0.98, 95% CI 0.88 to 1.09).',
    laymanHowItWorks:
      'The tablet holds two different drugs. Metformin works mainly on the liver, telling it to stop manufacturing and releasing glucose between meals, and it makes muscle a little more responsive to insulin. Sitagliptin works on a gut signal: when you eat, the intestine releases hormones that prompt the pancreas to make insulin, and an enzyme called DPP-4 destroys those hormones within minutes. Sitagliptin blocks that enzyme, so the signal lasts longer and more insulin is released — but only when glucose is actually high, which is why it rarely causes low blood sugar on its own.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$5.28 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across the 15 listed JANUMET and JANUMET XR products, survey effective 19 August 2026; the 100-1,000 mg extended-release tablet is listed at US$10.56)',
      markupEstimate: '',
      openPatentNotes:
        'JANUMET was approved in 2007 under NDA 022044 and JANUMET XR in 2012 under NDA 202270. Sitagliptin has since gone generic and is listed at a median US$3.58 per 100 mg tablet in the same CMS survey, while metformin is among the cheapest drugs in the United States. The combination tablet is still priced as a brand, which is the arithmetic a reader is entitled to do for themselves.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Everything in this tablet is available separately and more cheaply, which makes the comparison unusually simple: the question is not whether an alternative works but whether the fixed combination adds anything beyond one fewer tablet. On the evidence, metformin is the component with an outcome result and sitagliptin is the component with a neutral outcome trial.',
      conventionalRx: [
        {
          name: 'Metformin alone',
          class: 'Biguanide',
          howItCompares:
            'The component with the outcome data. In UKPDS 34, 342 overweight newly diagnosed patients allocated metformin had a 32% reduction in any diabetes-related endpoint (95% CI 13 to 47, p=0.002), 42% for diabetes-related death (9 to 63, p=0.017) and 36% for all-cause mortality (9 to 55, p=0.011), with a greater effect than chlorpropamide, glibenclamide or insulin on any diabetes-related endpoint (p=0.0034).',
          typicalCost: 'Among the cheapest prescription drugs in the United States',
          prosAndCons:
            'Pros: the only glucose-lowering arm in UKPDS with an all-cause mortality result; no weight gain; no hypoglycaemia alone. Cons: gastrointestinal intolerance; a boxed warning for lactic acidosis; lowers vitamin B12.',
        },
        {
          name: 'Sitagliptin and metformin taken as two separate tablets',
          class: 'The same two drugs, unbundled',
          howItCompares:
            'Pharmacologically identical by definition — the combination product was approved on demonstrating bioequivalence to exactly this. Generic sitagliptin is listed at a median US$3.58 per 100 mg tablet in the CMS survey against US$5.28 for the branded combination tablet, and generic metformin costs a few cents.',
          typicalCost:
            'US$3.58 per sitagliptin 100 mg tablet at United States pharmacy acquisition cost (CMS NADAC median across 84 listed generic products, survey effective 5 August 2026), plus a few cents for metformin',
          prosAndCons:
            'Pros: cheaper; each drug can be titrated or stopped independently. Cons: two tablets rather than one, and adherence to fixed-dose combinations is generally better in observational data.',
        },
        {
          name: 'An SGLT2 inhibitor added to metformin (empagliflozin, dapagliflozin)',
          class: 'Sodium-glucose cotransporter 2 inhibitor',
          howItCompares:
            'Where sitagliptin’s outcome trial was neutral, empagliflozin and dapagliflozin have cardiovascular and kidney outcome trials with positive results in their own right. This is a different evidence class, not a better version of the same one, and the specific molecule matters — see the canagliflozin and ertugliflozin pages in this file for how far apart the members of that class are.',
          typicalCost: 'Brand-priced; substantially more than generic sitagliptin per tablet',
          prosAndCons:
            'Pros: outcome trials with positive primary endpoints for some molecules. Cons: genital mycotic infection, volume depletion, euglycaemic ketoacidosis; the class results are not interchangeable between molecules.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Stop it before a contrast scan or an operation',
          action:
            'Tell the radiology or surgical team you take metformin before any contrast study or procedure.',
          patientImpact:
            'The boxed warning lists radiological studies with contrast, surgery and other procedures among the risk factors for metformin-associated lactic acidosis, alongside renal impairment, age 65 or over, hypoxic states, excessive alcohol and hepatic impairment.',
          clinicalPrecaution:
            'The label directs immediate discontinuation and hospital management if lactic acidosis is suspected, with prompt haemodialysis recommended. When and how to hold the drug is a decision for the clinical team.',
        },
        {
          name: 'Have your vitamin B12 checked',
          action: 'Ask whether B12 has been measured, particularly after years of metformin.',
          patientImpact:
            'Section 5.5 of the label states that metformin may lower vitamin B12 levels and directs measuring haematological parameters annually and vitamin B12 at two- to three-year intervals. Low B12 can produce a neuropathy that looks like diabetic neuropathy.',
          clinicalPrecaution:
            'This is a labelled monitoring instruction to the prescriber, not a self-test recommendation.',
        },
        {
          name: 'Report severe joint pain or new blisters',
          action:
            'Say if you develop disabling joint pain or blistering skin lesions while on this drug.',
          patientImpact:
            'Sections 5.8 and 5.9 record severe and disabling arthralgia with DPP-4 inhibitors, and postmarketing reports of bullous pemphigoid requiring hospitalisation. Both are labelled reasons to consider stopping the drug.',
          clinicalPrecaution:
            'Also labelled: acute pancreatitis including fatal haemorrhagic or necrotising cases, and serious hypersensitivity including anaphylaxis, angioedema and Stevens-Johnson syndrome.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'generic_formula',
      targetReceptorAffinity:
        'A two-drug product with no single molecular structure, and none is stated here rather than one being invented. Sitagliptin is a beta-amino amide bearing a trifluorophenyl group and a triazolopyrazine, marketed as the phosphate monohydrate; the label states it is selective for DPP-4 and does not inhibit DPP-8 or DPP-9 in vitro at concentrations approximating therapeutic doses — a selectivity that matters because DPP-8/9 inhibition was toxic in preclinical work. Metformin is 1,1-dimethylbiguanide hydrochloride, a small, highly polar, cationic molecule that requires organic cation transporters to enter hepatocytes at all, which is why renal clearance and OCT-inhibiting drugs govern its accumulation.',
      structureSource: {
        label:
          'JANUMET (sitagliptin and metformin hydrochloride) United States prescribing information, Description 11 and Clinical Pharmacology 12.1 (NDA 022044)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.application_number:%22NDA022044%22',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'sim-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Screen the metformin for nitrosamine contamination before anything else',
          description:
            'Metformin drug substance and extended-release products have been the subject of nitrosamine recalls, and the contaminant arises from the chemistry and the packaging rather than from the design. A release panel that measures assay and dissolution but not N-nitrosodimethylamine will pass a batch that should not ship.',
          reagentsAndBuffer:
            'Metformin hydrochloride and sitagliptin phosphate monohydrate reference standards, LC-MS/MS nitrosamine assay at part-per-billion sensitivity, Karl Fischer titration, X-ray powder diffraction for the sitagliptin phosphate monohydrate form',
        },
        {
          id: 'sim-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Make the sitagliptin stereocentre by asymmetric hydrogenation',
          description:
            'Sitagliptin is a single enantiomer and the industrial route sets that centre by rhodium-catalysed asymmetric hydrogenation of an unprotected enamine — later replaced in part by a transaminase biocatalytic route. Both are notable for the same reason: the alternative is a resolution that discards half the material.',
          dependsOnStepId: 'sim-w1',
          reagentsAndBuffer:
            'Triazolopyrazine and trifluorophenyl beta-keto acid intermediates, rhodium-ferrocenyl phosphine catalyst under hydrogen pressure or an engineered transaminase with pyridoxal phosphate and isopropylamine, phosphoric acid for salt formation',
        },
        {
          id: 'sim-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the phosphate monohydrate and control enantiomeric purity',
          description:
            'The marketed salt form is the phosphate monohydrate, and its solid form governs dissolution. Enantiomeric purity has to be measured directly: the wrong enantiomer is not a DPP-4 inhibitor and will not show up in a total-assay determination.',
          dependsOnStepId: 'sim-w2',
          reagentsAndBuffer:
            'Controlled-cooling crystallisation from aqueous isopropanol, chiral HPLC for enantiomeric excess, dynamic vapour sorption for hydrate stability, particle size distribution by laser diffraction',
        },
        {
          id: 'sim-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Build a bilayer tablet that keeps a 1,000 mg drug and a 50 mg drug apart',
          description:
            'The two actives differ roughly twentyfold in dose and behave very differently on compression; metformin is a high-dose, poorly compressible, hygroscopic salt. The formulation problem is holding both in one tablet without one component dictating the release of the other, which is why the extended-release version is a distinct engineering exercise rather than a coating change.',
          dependsOnStepId: 'sim-w3',
          reagentsAndBuffer:
            'Wet or roller-compaction granulation of metformin hydrochloride, separate sitagliptin blend, microcrystalline cellulose, povidone, sodium stearyl fumarate, hypromellose matrix for the extended-release layer, film coat',
        },
        {
          id: 'sim-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Prove bioequivalence, because that is what the approval rests on',
          description:
            'The label states that none of the efficacy studies it reports was conducted with the combination product, and that bioequivalence of the tablet with coadministered sitagliptin and metformin tablets was demonstrated. For the extended-release product the label goes further and states that no clinical efficacy or safety studies were conducted with it to characterise its effect on A1c. Bioequivalence is therefore not a formality here; it is the entire evidentiary bridge between the tablet and the trials.',
          dependsOnStepId: 'sim-w4',
          reagentsAndBuffer:
            'Crossover pharmacokinetic study in healthy volunteers against coadministered reference tablets, LC-MS/MS plasma assay for sitagliptin and metformin, AUC and Cmax 90% confidence intervals against the 80 to 125% bioequivalence limits, in vitro dissolution across pH 1.2 to 6.8',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sim-a1',
        category: 'inferred',
        title: 'The label says none of the efficacy studies used this product',
        laymanSummary:
          'Every efficacy result printed on this tablet’s label comes from studies of the two drugs taken separately. The label states that outright, and says the tablet was approved by showing it delivers the same blood levels.',
        technicalDetails:
          'Section 14 of the JANUMET label reads: "None of the clinical efficacy studies described below was conducted with JANUMET; however, bioequivalence of JANUMET with coadministered sitagliptin and metformin HCl tablets was demonstrated." The extended-release label is more explicit still: "There have been no clinical efficacy or safety studies conducted with JANUMET XR to characterize its effect on hemoglobin A1c (A1C) reduction. Bioequivalence of JANUMET XR tablets with coadministered sitagliptin and extended-release metformin tablets has been demonstrated for all tablet strengths." This is a legitimate and standard regulatory pathway for a fixed-dose combination of two approved drugs, and it is also exactly the kind of statement a reader should be shown: the efficacy of the product being sold is inferred from the components, not measured on the product.',
        evidenceSource:
          'JANUMET United States prescribing information, section 14 (NDA 022044); JANUMET XR United States prescribing information, section 14 (NDA 202270)',
        inferredClaim:
          'That the efficacy demonstrated for coadministered sitagliptin and metformin transfers to the fixed-dose tablet — an inference supported by bioequivalence data and never tested directly on the product',
        auditFlag: 'caution',
      },
      {
        id: 'sim-a2',
        category: 'measured',
        title: 'The combination does lower A1c, and the effect is roughly additive',
        laymanSummary:
          'In a 1,091-patient trial that tested each drug alone and together, the pair at full dose lowered A1c by about 2.1 percentage points more than placebo, and two thirds of that group reached the target of under 7%.',
        technicalDetails:
          'A 24-week randomised, double-blind, placebo-controlled factorial study in 1,091 patients with type 2 diabetes inadequately controlled on diet and exercise (baseline A1c 7.5 to 11%) compared placebo, sitagliptin 100 mg once daily, metformin 500 mg or 1,000 mg twice daily, and sitagliptin 50 mg twice daily with each metformin dose. Adjusted mean A1c change from a baseline of about 8.8% was +0.2% on placebo, −0.7% on sitagliptin alone, −0.8% and −1.1% on the two metformin doses, and −1.4% and −1.9% on the two combinations. Differences from placebo were −0.8% (95% CI −1.1 to −0.6) for sitagliptin, −1.3% (−1.5 to −1.1) for metformin 1,000 mg twice daily, and −2.1% (−2.3 to −1.8) for the top combination, all p<0.001. The proportion reaching A1c below 7% was 9% on placebo, 20% on sitagliptin, 38% on metformin 1,000 mg twice daily, and 66% on the top combination. The effect is real, large for a glucose surrogate, and approximately the sum of the parts — which is the pharmacological basis for combining them and is not the same as an outcome.',
        evidenceSource:
          'JANUMET United States prescribing information, section 14, Table 9 (NDA 022044)',
        measuredMetric:
          'Adjusted mean change in A1c from baseline at 24 weeks and proportion reaching A1c below 7%',
        auditFlag: 'verified',
      },
      {
        id: 'sim-a3',
        category: 'failed',
        title: 'Sitagliptin was tested for cardiovascular benefit in 14,671 people and had none',
        laymanSummary:
          'A three-year trial in nearly fifteen thousand people with diabetes and established heart disease found sitagliptin neither raised nor lowered the rate of heart attacks, strokes and cardiovascular deaths. It was designed to prove safety and it did exactly that, and no more.',
        technicalDetails:
          'TECOS randomised 14,671 patients with type 2 diabetes and established cardiovascular disease to sitagliptin or placebo added to usual care, with a median follow-up of 3.0 years. The primary composite of cardiovascular death, nonfatal myocardial infarction, nonfatal stroke or hospitalisation for unstable angina occurred in 839 patients (11.4%) on sitagliptin against 851 (11.6%) on placebo — hazard ratio 0.98 (95% CI 0.88 to 1.09), meeting the prespecified non-inferiority criterion at p<0.001. Hospitalisation for heart failure gave a hazard ratio of 1.00 (95% CI 0.83 to 1.20, p=0.98). Acute pancreatitis (p=0.07) and pancreatic cancer (p=0.32) did not differ significantly. Read correctly, this is a clean safety result and a null efficacy result: whatever the A1c reduction is worth in this population, it did not appear as fewer cardiovascular events over three years.',
        evidenceSource:
          'Green JB, Bethel MA, Armstrong PW, et al. N Engl J Med 2015;373:232-242 (TECOS)',
        doi: '10.1056/NEJMoa1501352',
        measuredMetric:
          'Composite of cardiovascular death, nonfatal myocardial infarction, nonfatal stroke or hospitalisation for unstable angina over a median 3.0 years',
        auditFlag: 'verified',
      },
      {
        id: 'sim-a4',
        category: 'conclusion_shift',
        title: 'A heart failure warning borrowed from two other molecules in the class',
        laymanSummary:
          'The label warns about heart failure — and says the observation came from two other drugs in the same class, not from this one. Sitagliptin’s own trial found no heart failure signal at all.',
        technicalDetails:
          'Section 5.3 of the label reads that heart failure "has been observed with two other members of the DPP-4 inhibitor class" and directs considering the risks and benefits in patients with known heart failure risk factors. The observation traces to SAVOR-TIMI 53, in which 16,492 patients randomised to saxagliptin or placebo had a neutral primary composite (HR 1.00, 95% CI 0.89 to 1.12) but more hospitalisations for heart failure — 3.5% against 2.8%, hazard ratio 1.27 (95% CI 1.07 to 1.51, p=0.007) — and to a numerically similar finding with alogliptin. TECOS, in 14,671 patients, found a hazard ratio of exactly 1.00 (95% CI 0.83 to 1.20, p=0.98) for the same endpoint with sitagliptin. So the class warning on this product is an inference from sibling molecules that the product’s own dedicated trial did not reproduce. That does not make the warning wrong — a class precaution is a reasonable regulatory posture when a mechanism is shared — but it does mean the page must say which molecule the evidence came from, because it did not come from this one.',
        evidenceSource:
          'JANUMET United States prescribing information, section 5.3 (NDA 022044); Scirica BM et al. N Engl J Med 2013;369:1317-1326 (SAVOR-TIMI 53); Green JB et al. N Engl J Med 2015;373:232-242 (TECOS)',
        doi: '10.1056/NEJMoa1307684',
        inferredClaim:
          'That sitagliptin carries the heart failure risk observed with saxagliptin and alogliptin — a class-level inference contradicted for this molecule by a 14,671-patient trial reporting a hazard ratio of 1.00',
        auditFlag: 'contested',
      },
      {
        id: 'sim-a5',
        category: 'measured',
        title: 'Metformin is the component with a mortality result, from 342 patients',
        laymanSummary:
          'Metformin is the only glucose-lowering treatment in the UK Prospective Diabetes Study that reduced deaths from any cause. That result comes from a subgroup of 342 overweight patients, and it has carried the drug for a quarter of a century.',
        technicalDetails:
          'UKPDS 34 allocated 753 overweight newly diagnosed patients with type 2 diabetes to conventional diet-based treatment (n=411) or intensive control with metformin (n=342). Metformin produced risk reductions of 32% for any diabetes-related endpoint (95% CI 13 to 47, p=0.002), 42% for diabetes-related death (9 to 63, p=0.017) and 36% for all-cause mortality (9 to 55, p=0.011), with a greater effect than chlorpropamide, glibenclamide or insulin for any diabetes-related endpoint (p=0.0034). This is the single most consequential result in oral diabetes therapy and it rests on 342 randomised patients — a fact worth stating alongside it, because effect sizes from small subgroups regress, and no equally clean replication has been done.',
        evidenceSource: 'UK Prospective Diabetes Study Group. Lancet 1998;352:854-865 (UKPDS 34)',
        doi: '10.1016/S0140-6736(98)07037-8',
        measuredMetric:
          'Any diabetes-related endpoint, diabetes-related death and all-cause mortality with metformin in overweight newly diagnosed type 2 diabetes',
        auditFlag: 'verified',
      },
      {
        id: 'sim-a6',
        category: 'failed',
        title:
          'The same trial found adding metformin to a sulphonylurea raised diabetes-related death',
        laymanSummary:
          'In the same study that made metformin’s reputation, patients who already took a sulphonylurea and had metformin added had nearly double the rate of diabetes-related death. The finding was never explained and it was never withdrawn.',
        technicalDetails:
          'In a supplementary randomisation within UKPDS, 537 patients already on a sulphonylurea had metformin added early or continued sulphonylurea alone. Early addition of metformin in sulphonylurea-treated patients was associated with a 96% increased risk of diabetes-related death (95% CI 2 to 275, p=0.039). The confidence interval is enormous, the comparison was not the trial’s primary question, and epidemiological analyses since have not consistently reproduced it — the usual reasons a finding is set aside. It is on this page because the combination of a sulphonylurea and metformin remains one of the most widely prescribed pairings in the world, because the result came from the same trial whose metformin arm is cited as definitive, and because a page that reports UKPDS 34’s good news and omits its bad news is not an audit.',
        evidenceSource:
          'UK Prospective Diabetes Study Group. Lancet 1998;352:854-865 (UKPDS 34), supplementary randomisation',
        doi: '10.1016/S0140-6736(98)07037-8',
        measuredMetric:
          'Diabetes-related death with early addition of metformin to sulphonylurea in 537 patients',
        auditFlag: 'contested',
      },
      {
        id: 'sim-a7',
        category: 'measured',
        title: 'A boxed warning for an acidosis that kills, and a vitamin the drug quietly removes',
        laymanSummary:
          'Metformin carries the strongest form of warning the FDA issues, for a rare build-up of lactic acid that has caused deaths. It also lowers vitamin B12, and the label tells prescribers to measure it every two to three years.',
        technicalDetails:
          'The boxed warning states that postmarketing cases of metformin-associated lactic acidosis have resulted in death, hypothermia, hypotension and resistant bradyarrhythmias, with a subtle onset marked only by malaise, myalgia, respiratory distress, somnolence and abdominal pain, and characterised by blood lactate above 5 mmol/L, anion gap acidosis without ketosis, an increased lactate/pyruvate ratio and metformin plasma levels generally above 5 mcg/mL. Named risk factors are renal impairment, carbonic anhydrase inhibitors such as topiramate, age 65 or over, radiological studies with contrast, surgery and other procedures, hypoxic states including acute congestive heart failure, excessive alcohol and hepatic impairment. Prompt haemodialysis is recommended. Separately, section 5.5 states metformin may lower vitamin B12 and directs annual haematological parameters and B12 measurement every two to three years. Sections 5.2, 5.4 and 5.7 to 5.9 add acute pancreatitis including fatal haemorrhagic and necrotising cases, acute renal failure sometimes requiring dialysis, serious hypersensitivity including Stevens-Johnson syndrome, severe and disabling arthralgia, and bullous pemphigoid requiring hospitalisation.',
        evidenceSource:
          'JANUMET United States prescribing information, Boxed Warning and Warnings and Precautions 5.1 to 5.9 (NDA 022044)',
        measuredMetric:
          'Labelled adverse reactions and their named risk factors, from the boxed warning and section 5',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Two drugs, two entirely different problems',
        laymanDesc:
          'One tablet, two mechanisms that do not overlap. Metformin lowers the glucose the liver releases. Sitagliptin makes the pancreas respond better when a meal arrives.',
        molecularDetail:
          'The label describes two antihyperglycaemic agents with complementary mechanisms: sitagliptin, a DPP-4 inhibitor, and metformin, a biguanide. Because the mechanisms are independent, the A1c effects are approximately additive — −0.8% and −1.3% against placebo separately, −2.1% together at the top doses in the factorial study.',
        iconName: 'Combine',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Metformin cannot get into a liver cell on its own',
        laymanDesc:
          'Metformin is a very small, permanently charged molecule. It cannot slip through a cell membrane and has to be carried in by dedicated transporters, which is why kidney function governs how much of it accumulates.',
        molecularDetail:
          'Metformin is a hydrophilic organic cation dependent on OCT1 for hepatocyte uptake and OCT2 and MATE transporters for renal elimination, and is not metabolised. Renal impairment therefore raises plasma levels directly, which is the mechanistic basis for the boxed warning: metformin-associated lactic acidosis is characterised by plasma levels generally above 5 mcg/mL.',
        iconName: 'DoorOpen',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The liver stops manufacturing glucose',
        laymanDesc:
          'Inside the liver cell, metformin restrains the machinery that builds new glucose out of other molecules. It also slows glucose absorption from the gut and makes muscle a little more responsive to insulin.',
        molecularDetail:
          'Section 12.1 states metformin decreases hepatic glucose production, decreases intestinal absorption of glucose and improves insulin sensitivity by increasing peripheral glucose uptake and utilisation, with insulin secretion unchanged and fasting and day-long insulin levels possibly falling. The label does not commit to a single molecular target, and none is stated here rather than one being asserted.',
        iconName: 'Factory',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Sitagliptin protects a gut hormone from being destroyed',
        laymanDesc:
          'When you eat, the intestine releases hormones that tell the pancreas to make insulin. An enzyme chews them up within minutes. Sitagliptin blocks that enzyme, so the signal lasts longer.',
        molecularDetail:
          'Sitagliptin slows the inactivation of the incretins GLP-1 and GIP by DPP-4, raising and prolonging concentrations of the active intact hormones. The label states sitagliptin is selective for DPP-4 and does not inhibit DPP-8 or DPP-9 in vitro at concentrations approximating therapeutic doses — a distinction that mattered because DPP-8/9 inhibition produced severe toxicity in preclinical species.',
        iconName: 'ShieldCheck',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'Insulin rises only when glucose is already high',
        laymanDesc:
          'The incretin signal only works when blood sugar is elevated. That is why this half of the tablet almost never causes a hypo by itself — and why it also does less when glucose is near normal.',
        molecularDetail:
          'When glucose is normal or elevated, GLP-1 and GIP increase insulin synthesis and release from beta cells through cyclic AMP signalling, and GLP-1 lowers glucagon secretion from alpha cells, reducing hepatic glucose production. The label describes the net effect as increased insulin release and decreased glucagon in a glucose-dependent manner. Section 5.6 notes that hypoglycaemia risk rises when the product is combined with insulin or an insulin secretagogue.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'What that buys, and what it does not',
        laymanDesc:
          'A large fall in blood sugar. Metformin has an old survival result in 342 patients; sitagliptin was tested in 14,671 and changed nothing either way.',
        molecularDetail:
          'A1c falls 2.1 percentage points more than placebo at the top combination dose, with 66% reaching below 7%. UKPDS 34: metformin all-cause mortality reduction 36% (95% CI 9 to 55, p=0.011) in 342 patients. TECOS: sitagliptin primary composite HR 0.98 (0.88 to 1.09), heart failure hospitalisation HR 1.00 (0.83 to 1.20, p=0.98). The combination product itself has no outcome trial and no efficacy trial.',
        iconName: 'Scale',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Sitagliptin and metformin factorial study (JANUMET label section 14, Table 9)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, factorial, 24 weeks',
        sampleSize: 1091,
        primaryEndpoint:
          'Change from baseline in A1C at 24 weeks in patients with type 2 diabetes inadequately controlled on diet and exercise, comparing placebo, sitagliptin alone, metformin alone and the two in combination',
        endpointMet: true,
        statisticalPValue:
          'Difference from placebo −2.1% (95% CI −2.3 to −1.8) for sitagliptin 50 mg twice daily with metformin 1,000 mg twice daily, p<0.001; 66% reached A1C below 7% against 9% on placebo',
        unreportedAdverseSignals:
          'Patients failing glycaemic goals were rescued with glyburide, and 32% of the placebo arm required rescue against 2% of the top combination arm, which compresses the apparent placebo deterioration. The trial ran 24 weeks and measured no clinical outcome. It was conducted with coadministered tablets, not with the combination product.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Sitagliptin add-on to metformin (JANUMET label section 14, Table 10)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, 24 weeks',
        sampleSize: 701,
        primaryEndpoint:
          'Change from baseline in A1C with sitagliptin 100 mg once daily or placebo added to metformin at least 1,500 mg per day',
        endpointMet: true,
        statisticalPValue:
          'Significant improvements in A1C, fasting plasma glucose and 2-hour postprandial glucose against placebo with metformin; rescue therapy used in 5% on sitagliptin against 14% on placebo',
        unreportedAdverseSignals:
          'Pioglitazone rescue was used for glycaemic failure, and the differential rescue rate again affects the observed placebo arm. Twenty-four weeks, surrogate endpoint, no outcome measured.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'TECOS (N Engl J Med 2015;373:232-242)',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled cardiovascular safety trial',
        sampleSize: 14671,
        primaryEndpoint:
          'Composite of cardiovascular death, nonfatal myocardial infarction, nonfatal stroke or hospitalisation for unstable angina, with sitagliptin added to usual care in type 2 diabetes and established cardiovascular disease',
        endpointMet: true,
        statisticalPValue:
          '839 (11.4%) against 851 (11.6%), hazard ratio 0.98 (95% CI 0.88 to 1.09), non-inferiority p<0.001, over a median 3.0 years',
        unreportedAdverseSignals:
          'The endpoint met was non-inferiority, not superiority: no reduction in cardiovascular events was demonstrated. Hospitalisation for heart failure HR 1.00 (95% CI 0.83 to 1.20, p=0.98); acute pancreatitis p=0.07; pancreatic cancer p=0.32.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'UKPDS 34 (Lancet 1998;352:854-865)',
        phase: 'Phase 3, randomised, controlled, multicentre',
        sampleSize: 753,
        primaryEndpoint:
          'Any diabetes-related endpoint, diabetes-related death and all-cause mortality with intensive control using metformin (n=342) against conventional diet-based treatment (n=411) in overweight newly diagnosed type 2 diabetes',
        endpointMet: true,
        statisticalPValue:
          'Any diabetes-related endpoint reduced 32% (95% CI 13 to 47, p=0.002); diabetes-related death 42% (9 to 63, p=0.017); all-cause mortality 36% (9 to 55, p=0.011)',
        unreportedAdverseSignals:
          'In a supplementary randomisation of 537 patients already on a sulphonylurea, early addition of metformin was associated with a 96% increased risk of diabetes-related death (95% CI 2 to 275, p=0.039). The metformin arm itself comprised 342 patients.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A1C difference from placebo of −2.1% (95% CI −2.3 to −1.8) for sitagliptin 50 mg twice daily with metformin 1,000 mg twice daily over 24 weeks, with 66% reaching A1C below 7%',
        'Cardiovascular composite hazard ratio 0.98 (95% CI 0.88 to 1.09) for sitagliptin in 14,671 patients over a median 3.0 years',
        'Hospitalisation for heart failure hazard ratio 1.00 (95% CI 0.83 to 1.20, p=0.98) with sitagliptin in the same trial',
        'All-cause mortality reduced 36% (95% CI 9 to 55, p=0.011) with metformin in 342 overweight newly diagnosed patients',
        'Bioequivalence of the fixed-dose tablet to coadministered sitagliptin and metformin tablets, at all strengths',
      ],
      unsupportedInferences: [
        'That the fixed-dose tablet has demonstrated efficacy of its own — the label states none of the efficacy studies was conducted with it, and for the extended-release product that no efficacy or safety study was conducted at all',
        'That lowering A1C by 2.1 percentage points with this combination reduces cardiovascular events, which TECOS tested for the sitagliptin component and did not find',
        'That sitagliptin carries the heart failure risk seen with saxagliptin, which its own 14,671-patient trial did not reproduce',
        'That metformin’s 342-patient mortality result generalises without qualification to every population and every combination, when the same trial found harm on adding it to a sulphonylurea',
      ],
      whatFailedInitially: [
        'TECOS met non-inferiority and showed no cardiovascular benefit: HR 0.98 (95% CI 0.88 to 1.09)',
        'The DPP-4 class heart failure signal arose in SAVOR-TIMI 53 with saxagliptin (HR 1.27, 95% CI 1.07 to 1.51, p=0.007) and produced a class warning on a molecule whose own result was 1.00',
        'Adding metformin to a sulphonylurea in UKPDS was associated with a 96% increase in diabetes-related death (95% CI 2 to 275, p=0.039), never explained and never withdrawn',
        'Metformin extended-release products have been subject to nitrosamine recalls, a manufacturing failure independent of the pharmacology',
      ],
      realWorldOutcome: [
        'JANUMET approved in 2007 under NDA 022044 and JANUMET XR in 2012 under NDA 202270; among the most-dispensed diabetes combinations in the United States',
        'Sitagliptin is now generic at a median US$3.58 per 100 mg tablet, while the branded combination tablet is listed at US$5.28 and the 100-1,000 mg extended-release tablet at US$10.56',
        'Carries a boxed warning for lactic acidosis inherited from metformin and a class heart failure precaution inherited from two sibling molecules',
        'Metformin remains first-line in essentially every type 2 diabetes guideline on the strength of a 342-patient randomised arm from 1998',
      ],
    },
    deliverySystem: {
      type: 'Oral film-coated tablet, immediate-release twice daily or extended-release once daily, at fixed sitagliptin/metformin strengths',
      description:
        'Immediate-release strengths pair 50 mg of sitagliptin with 500 mg or 1,000 mg of metformin hydrochloride and are taken twice daily with meals; the extended-release product pairs 50 mg or 100 mg of sitagliptin with 500 mg or 1,000 mg of extended-release metformin for once-daily dosing. The label reports that each extended-release metformin regimen was at least as effective as immediate-release metformin for A1C and fasting plasma glucose in a 338-patient dose-ranging trial, and that bioequivalence of the fixed-dose tablets to coadministered components was demonstrated at all strengths.',
      safetyProfile:
        'Boxed warning for metformin-associated lactic acidosis, with named risk factors of renal impairment, carbonic anhydrase inhibitors such as topiramate, age 65 or over, contrast radiology, surgery and other procedures, hypoxic states including acute congestive heart failure, excessive alcohol and hepatic impairment; prompt haemodialysis is recommended if it occurs. Further labelled risks: acute pancreatitis including fatal haemorrhagic or necrotising cases; heart failure, observed with two other DPP-4 inhibitors; acute renal failure sometimes requiring dialysis, with renal function to be assessed before starting and at least annually; vitamin B12 deficiency, with B12 measured every two to three years; hypoglycaemia when combined with insulin or an insulin secretagogue; serious hypersensitivity including anaphylaxis, angioedema and Stevens-Johnson syndrome; severe and disabling arthralgia; and bullous pemphigoid requiring hospitalisation. Not for type 1 diabetes, and not studied in patients with a history of pancreatitis.',
    },
    commonQuestions: [
      {
        q: 'Is the combination tablet better than taking the two drugs separately?',
        a: 'Pharmacologically it is the same thing, and the regulator approved it on that basis. The label states that bioequivalence of the fixed-dose tablet with coadministered sitagliptin and metformin tablets was demonstrated for all strengths, and that none of the efficacy studies it reports was conducted with the combination product. What the tablet adds is one fewer thing to swallow, which does improve adherence in observational data. What it costs is the difference between a branded combination at a median US$5.28 per tablet and generic sitagliptin at US$3.58 plus a few cents of metformin.',
        auditNote:
          'A fixed-dose combination trades flexibility and price for convenience. That is a legitimate trade and it is not a pharmacological advantage.',
      },
      {
        q: 'Does this drug protect my heart?',
        a: 'The sitagliptin half was tested for exactly that and did not. TECOS randomised 14,671 people with type 2 diabetes and established cardiovascular disease to sitagliptin or placebo for a median three years; cardiovascular death, heart attack, stroke or unstable angina occurred in 11.4% against 11.6%, a hazard ratio of 0.98 (95% CI 0.88 to 1.09). The trial was designed to show the drug was not harmful, and it succeeded at that. The metformin half has an older and much smaller result: in UKPDS 34, 342 overweight newly diagnosed patients on metformin had 36% lower all-cause mortality (95% CI 9 to 55, p=0.011). If cardiovascular protection is the goal, the drug classes with positive outcome trials are different ones, and which molecule within those classes matters.',
      },
      {
        q: 'Why is there a heart failure warning if the trial found nothing?',
        a: 'Because the warning is about the class, and the label says so: heart failure "has been observed with two other members of the DPP-4 inhibitor class". The signal came from SAVOR-TIMI 53, where saxagliptin produced hospitalisation for heart failure in 3.5% against 2.8%, a hazard ratio of 1.27 (95% CI 1.07 to 1.51, p=0.007), and from a similar numerical finding with alogliptin. Sitagliptin’s own trial, four times larger than the number needed to see such a signal, reported a hazard ratio of 1.00 (95% CI 0.83 to 1.20, p=0.98). A shared mechanism is a reasonable basis for a shared caution. It is not a measurement on this molecule, and the two should not be reported in the same tone.',
        auditNote:
          'This is a class-effect inference running in the cautious direction. The audit is the same either way: name the molecule the evidence came from.',
      },
      {
        q: 'How dangerous is the lactic acidosis warning?',
        a: 'It is rare and it is serious, and the label is specific about who is at risk. The boxed warning records postmarketing cases resulting in death, hypothermia, hypotension and resistant bradyarrhythmias, with an onset described as subtle and marked only by malaise, muscle aches, breathlessness, drowsiness and abdominal pain. The named risk factors are renal impairment, drugs such as topiramate, age 65 or over, contrast radiology, surgery and other procedures, low-oxygen states including acute heart failure, heavy alcohol use and liver impairment. Almost all of those work by raising metformin levels or by loading the same metabolic pathway. The practical consequence for most people is the reason the drug is held around contrast scans and operations, and the reason kidney function is checked before starting and at least annually.',
      },
      {
        q: 'Should I be checking my vitamin B12?',
        a: 'The label instructs the prescriber to. Section 5.5 states that metformin may lower vitamin B12 levels and directs measuring haematological parameters annually and vitamin B12 at two- to three-year intervals, managing any abnormality. This matters more than it sounds because B12 deficiency causes a peripheral neuropathy that is easily mistaken for diabetic neuropathy, in a patient who has diabetes, on a drug that causes the deficiency. It is a labelled monitoring instruction, so it is a reasonable thing to ask about at a review.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'JANUMET (sitagliptin and metformin hydrochloride) United States prescribing information — Indications 1, Boxed Warning, Warnings and Precautions 5.1 to 5.9, Clinical Pharmacology 12.1, Clinical Studies 14 (NDA 022044)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022044',
        kind: 'regulatory',
      },
      {
        label:
          'JANUMET XR (sitagliptin and metformin hydrochloride extended-release) United States prescribing information — Clinical Studies 14, stating no clinical efficacy or safety studies were conducted with the product (NDA 202270)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=202270',
        kind: 'regulatory',
      },
      {
        label:
          'Green JB, Bethel MA, Armstrong PW, et al. Effect of sitagliptin on cardiovascular outcomes in type 2 diabetes. N Engl J Med 2015;373:232-242 (TECOS)',
        identifier: '10.1056/NEJMoa1501352',
        kind: 'doi',
      },
      {
        label:
          'Scirica BM, Bhatt DL, Braunwald E, et al. Saxagliptin and cardiovascular outcomes in patients with type 2 diabetes mellitus. N Engl J Med 2013;369:1317-1326 (SAVOR-TIMI 53)',
        identifier: '10.1056/NEJMoa1307684',
        kind: 'doi',
      },
      {
        label:
          'UK Prospective Diabetes Study (UKPDS) Group. Effect of intensive blood-glucose control with metformin on complications in overweight patients with type 2 diabetes (UKPDS 34). Lancet 1998;352:854-865',
        identifier: '10.1016/S0140-6736(98)07037-8',
        kind: 'doi',
      },
      {
        label:
          'ClinicalTrials.gov record for TECOS — Sitagliptin Cardiovascular Outcome Study, 14,671 participants',
        identifier: 'NCT00790205',
        kind: 'nct',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost, 2026 file — NDC descriptions JANUMET, JANUMET XR and SITAGLIPTIN PHOSPHATE',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 4. Canagliflozin — the drug that got a boxed warning for amputation on the strength of its own
  //    outcome trial, and had it taken off again three years later.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'canagliflozin',
    name: 'Canagliflozin',
    tradeName: 'Invokana (also Invokamet and Invokamet XR with metformin)',
    sponsor: 'Janssen Pharmaceuticals, a Johnson & Johnson company (NDA 204042)',
    targetGene: 'SLC5A2',
    targetProtein:
      'Sodium-glucose co-transporter 2 (SGLT2), expressed in the proximal renal tubule, where the label states it is responsible for the majority of the reabsorption of filtered glucose',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2013,
    indication:
      'Adjunct to diet and exercise to improve glycaemic control in adults and paediatric patients aged 10 and older with type 2 diabetes; to reduce the risk of major adverse cardiovascular events in adults with type 2 diabetes and established cardiovascular disease; and to reduce the risk of end-stage kidney disease, doubling of serum creatinine, cardiovascular death and hospitalisation for heart failure in adults with type 2 diabetes and diabetic nephropathy with albuminuria above 300 mg/day',
    patientFriendlyIndication:
      'Type 2 diabetes, and protecting the kidneys and heart in diabetic kidney disease',
    anatomicalSite: 'Proximal convoluted tubule of the kidney nephron',
    conditionContext: {
      conditionExplainer:
        'The kidney filters glucose out of the blood all day and then reclaims essentially all of it before urine leaves the body. A single transporter, SGLT2, does most of that reclaiming. Blocking it means glucose leaves in the urine instead of going back into the blood — a mechanism that lowers blood sugar without touching insulin at all.',
      whyItMatters:
        'Canagliflozin is the clearest documented case in modern diabetes of a real harm being found, formally warned about at the highest level available, and then unwarned. The FDA added a boxed warning for leg and foot amputation in May 2017 after the drug’s own outcome trial found the rate roughly doubled, and the label approved in August 2020 removed it. Both decisions were evidence-based, and holding them side by side is the entire point of an evidence audit.',
      whoTakesThis:
        'Adults and children aged 10 and over with type 2 diabetes; adults with type 2 diabetes and established cardiovascular disease; and adults with type 2 diabetes and albuminuric diabetic kidney disease. Not recommended for glycaemic control in type 1 diabetes or at an eGFR below 30 mL/min/1.73 m².',
      clinicalGoals:
        'Unusually for a diabetes drug, the goals here are outcomes rather than only a surrogate: fewer cardiovascular events, and slower progression to dialysis. Both are in the licensed indication because both were the primary endpoints of trials that met them.',
    },
    oneSentenceVerdict:
      'A kidney glucose-transporter blocker that reduced cardiovascular events by a hazard ratio of 0.86 (95% CI 0.75 to 0.97) in 10,142 patients and slowed progression to dialysis by 0.70 (95% CI 0.59 to 0.82) in 4,401 with diabetic nephropathy — and in the first of those trials nearly doubled lower-limb amputations (6.3 against 3.4 per 1,000 patient-years, HR 1.97, 95% CI 1.41 to 2.75), a finding that produced a boxed warning in May 2017 and lost it in August 2020.',
    laymanHowItWorks:
      'Your kidneys filter a large amount of glucose out of your blood every day and then reabsorb almost all of it back before it can be lost. Canagliflozin blocks the main protein that does the reabsorbing, so roughly a teaspoon or two of sugar a day leaves in the urine instead. Blood glucose falls without any extra insulin being involved. Two side effects follow directly from the mechanism rather than being unrelated: sugary urine encourages genital yeast infections, and the extra water lost with the glucose can leave people dehydrated. The kidney protection appears to come from a separate consequence — more sodium reaching the far end of the nephron, which the label says is believed to reduce the pressure inside the filtering unit.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$19.11 per tablet at United States pharmacy acquisition cost (CMS NADAC, median of the four listed INVOKANA 100 mg and 300 mg products, survey effective 19 August 2026). The canagliflozin-metformin combination INVOKAMET is listed separately at a median US$9.57 per tablet across seven products in the same survey',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 29 March 2013 under NDA 204042, the first SGLT2 inhibitor licensed there. Still brand-priced in the CMS survey; no generic canagliflozin product appears in the 2026 NADAC file at the time of writing. Note that the enriched record for this slug carried a per-tablet figure matching the INVOKAMET combination rather than INVOKANA; the figure stated above is the single-agent tablet, taken directly from the dataset.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The SGLT2 inhibitors are routinely discussed as a class, and their outcome trials are not interchangeable. Empagliflozin has a cardiovascular death result canagliflozin does not have; dapagliflozin has heart failure and kidney trials in people without diabetes; ertugliflozin missed superiority entirely. Canagliflozin is the only one of them that has carried a boxed warning for amputation. Comparing on price alone across this class discards the part that matters.',
      conventionalRx: [
        {
          name: 'Empagliflozin (Jardiance)',
          class: 'SGLT2 inhibitor',
          howItCompares:
            'The molecule with the strongest mortality result in the class and no amputation signal of the kind seen in CANVAS. Its outcome trials are its own; canagliflozin’s cardiovascular result (HR 0.86, 95% CI 0.75 to 0.97) and empagliflozin’s are separate measurements and should not be pooled in a reader’s head.',
          typicalCost: 'Brand-priced in the United States, in the same range as canagliflozin',
          prosAndCons:
            'Pros: broad outcome evidence including heart failure and chronic kidney disease. Cons: the same mechanism-linked adverse effects — genital mycotic infection, volume depletion, ketoacidosis, Fournier’s gangrene.',
        },
        {
          name: 'Dapagliflozin (Farxiga)',
          class: 'SGLT2 inhibitor',
          howItCompares:
            'Licensed in heart failure and chronic kidney disease including in people without diabetes, which is a wider outcome footprint than canagliflozin has. Canagliflozin’s distinctive result is CREDENCE, which was run specifically in albuminuric diabetic nephropathy and reduced the composite of end-stage kidney disease, creatinine doubling and renal or cardiovascular death by a hazard ratio of 0.70.',
          typicalCost: 'Brand-priced in the United States',
          prosAndCons:
            'Pros: indications extending beyond diabetes. Cons: same class adverse-effect profile; the kidney evidence in diabetic nephropathy specifically is canagliflozin’s.',
        },
        {
          name: 'An ACE inhibitor or angiotensin receptor blocker',
          class: 'Renin-angiotensin system blockade',
          howItCompares:
            'The established background therapy for diabetic kidney disease rather than an alternative to it: CREDENCE required participants to be on a maximum tolerated dose of an ACE inhibitor or ARB, so the 30% reduction in the primary composite was on top of that, not instead of it.',
          typicalCost: 'Among the cheapest prescription drugs in the United States',
          prosAndCons:
            'Pros: decades of outcome evidence, negligible cost. Cons: does not lower glucose; hyperkalaemia and acute kidney injury risk; not sufficient on its own in albuminuric nephropathy on the CREDENCE evidence.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Look at your feet',
          action:
            'Check both feet regularly and report any new ulcer, infection, pain or tenderness immediately.',
          patientImpact:
            'Section 5.2 of the label directs monitoring for infection including osteomyelitis, new pain or tenderness, and ulcers of the lower limb, and discontinuing the drug if these occur. In CANVAS and CANVAS-R together, 99 of 140 amputations in canagliflozin patients were toe or midfoot and 41 involved the leg below or above the knee. Lower limb infection, gangrene and diabetic foot ulcer were the most common precipitating events.',
          clinicalPrecaution:
            'The label states risk was highest in patients with a prior amputation, peripheral vascular disease or neuropathy, and directs counselling on routine preventative foot care.',
        },
        {
          name: 'Drink enough, especially on a diuretic',
          action: 'Report light-headedness on standing, and mention any loop diuretic you take.',
          patientImpact:
            'Section 5.3 warns that volume depletion may result in acute kidney injury and directs assessing and correcting volume status before starting in patients with renal impairment, elderly patients and those on loop diuretics. Glucose leaving in the urine takes water with it by osmosis, so the diuretic effect is intrinsic to the mechanism.',
          clinicalPrecaution:
            'Section 5.4 separately covers urosepsis and pyelonephritis arising from urinary tract infection.',
        },
        {
          name: 'Ketoacidosis can happen at a normal blood sugar',
          action:
            'If you are vomiting, breathless, confused or severely unwell, say that you take an SGLT2 inhibitor even if your glucose reading looks fine.',
          patientImpact:
            'Section 5.1 directs assessing for ketoacidosis regardless of presenting blood glucose level and discontinuing the drug if it is suspected. This is the defining diagnostic trap of the class: the usual clue, a very high glucose, is absent because the drug is removing glucose in the urine.',
          clinicalPrecaution:
            'The label directs monitoring for resolution of ketoacidosis before restarting. Section 5.6 covers necrotising fasciitis of the perineum, Fournier’s gangrene, described as serious and life-threatening and occurring in both sexes.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC1=C(C=C(C=C1)[C@H]2[C@@H]([C@H]([C@@H]([C@H](O2)CO)O)O)O)CC3=CC=C(S3)C4=CC=C(C=C4)F',
      chemicalFormula: 'C24H25FO5S',
      molecularWeight: '444.50 g/mol',
      targetReceptorAffinity:
        'A C-glycoside: the sugar ring is joined to the aromatic scaffold by a carbon-carbon bond rather than the oxygen linkage of the natural product phlorizin from which this class descends. That single change is the reason the drug survives intestinal beta-glucosidases and can be given orally, and it is the structural decision the whole class rests on. Selectivity for SGLT2 over the intestinal SGLT1 is high but not absolute for canagliflozin, which retains measurable SGLT1 activity at higher exposure — a difference from its siblings that is real and has never been shown to explain the amputation finding.',
      structureSource: {
        label:
          'PubChem CID 24812758 (canagliflozin) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/24812758',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cana-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the C-glycoside linkage and the beta anomeric configuration',
          description:
            'Everything about this class depends on the sugar being attached through carbon rather than oxygen, and on that centre being beta. An O-glycoside impurity would be hydrolysed in the gut and is not the drug; an alpha anomer is a different molecule with different transporter affinity. Neither is visible on a total-assay determination.',
          reagentsAndBuffer:
            'Canagliflozin reference standard, 1H and 13C NMR with HMBC to establish the C-aryl linkage, chiral and achiral HPLC for anomeric and enantiomeric purity, high-resolution mass spectrometry, Karl Fischer titration',
        },
        {
          id: 'cana-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the diarylmethane and attach the sugar through carbon',
          description:
            'The scaffold is a thiophene bridging a fluorophenyl ring and a methylphenyl ring; the glucose unit is installed by adding an aryl metal species to a protected gluconolactone and then reducing the resulting hemiketal stereoselectively to the beta C-glycoside. That reduction is the step that decides whether the batch is the drug.',
          dependsOnStepId: 'cana-w1',
          reagentsAndBuffer:
            '2-(4-fluorophenyl)-5-bromothiophene and methylbenzyl intermediates, Friedel-Crafts or cross-coupling to assemble the diarylmethane, 2,3,4,6-tetra-O-trimethylsilyl-D-gluconolactone, n-butyllithium or a Grignard reagent under anhydrous conditions, triethylsilane and boron trifluoride for stereoselective reduction',
        },
        {
          id: 'cana-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Deprotect, crystallise and fix the solid form',
          description:
            'Remove the silyl protecting groups and crystallise the free molecule as its hemihydrate. The solid form governs dissolution and therefore exposure, and canagliflozin exposure is directly linked to the frequency of the mechanism-derived adverse effects, so form control is a safety property and not only a quality one.',
          dependsOnStepId: 'cana-w2',
          reagentsAndBuffer:
            'Acidic or fluoride-mediated desilylation, controlled-cooling crystallisation with seeding to the hemihydrate form, X-ray powder diffraction and differential scanning calorimetry for form confirmation, residual solvent testing by headspace gas chromatography',
        },
        {
          id: 'cana-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure SGLT2 and SGLT1 inhibition as separate numbers',
          description:
            'SGLT2 sits in the kidney and SGLT1 in the gut and heart. Canagliflozin is the least SGLT2-selective member of the marketed class, and a single potency figure against SGLT2 hides that. Whether the residual SGLT1 activity matters clinically is unresolved, which is precisely why it should be measured rather than assumed away.',
          dependsOnStepId: 'cana-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human SLC5A2 or SLC5A1, sodium-dependent uptake of radiolabelled alpha-methyl-D-glucopyranoside, sodium-free control buffer, phlorizin as reference inhibitor, concentration-response across at least four log units on both transporters',
        },
        {
          id: 'cana-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Quantify urinary glucose and the water that leaves with it',
          description:
            'The pharmacodynamic readout for this class is not a plasma concentration but grams of glucose excreted per day and the change in the renal threshold for glucose. The osmotic water loss that accompanies it is the mechanistic origin of the volume depletion warning, and measuring glucose excretion without measuring urine volume and haematocrit reports half the effect.',
          dependsOnStepId: 'cana-w4',
          reagentsAndBuffer:
            '24-hour urine collection with enzymatic glucose assay, renal threshold for glucose determined by stepped hyperglycaemic clamp, urine volume and osmolality, haematocrit and serum creatinine as volume-status readouts',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cana-a1',
        category: 'measured',
        title: 'CANVAS: fewer cardiovascular events, and almost twice as many amputations',
        laymanSummary:
          'In 10,142 people with type 2 diabetes at high cardiovascular risk, the drug cut heart attacks, strokes and cardiovascular deaths. In the same trial, leg and foot amputations went from 3.4 to 6.3 per thousand patient-years.',
        technicalDetails:
          'The CANVAS Program pooled two trials in 10,142 participants with type 2 diabetes and high cardiovascular risk. The primary composite of cardiovascular death, nonfatal myocardial infarction or nonfatal stroke occurred at 26.9 against 31.5 per 1,000 patient-years, hazard ratio 0.86 (95% CI 0.75 to 0.97, p=0.02 for superiority). Progression of albuminuria gave a hazard ratio of 0.73 (95% CI 0.67 to 0.79) and a composite renal outcome of sustained 40% eGFR reduction, renal replacement therapy or renal death gave 0.60 (95% CI 0.47 to 0.77). Amputation of toes, feet or legs occurred at 6.3 against 3.4 per 1,000 patient-years, hazard ratio 1.97 (95% CI 1.41 to 2.75), primarily at the toe or metatarsal level. The two results came from the same randomised comparison and neither can be discounted in favour of the other; the whole clinical argument about this drug is how to weigh them against each other in a given patient.',
        evidenceSource:
          'Neal B, Perkovic V, Mahaffey KW, et al. N Engl J Med 2017;377:644-657 (CANVAS Program)',
        doi: '10.1056/NEJMoa1611925',
        measuredMetric:
          'Composite of cardiovascular death, nonfatal myocardial infarction or nonfatal stroke, and rate of lower-limb amputation, per 1,000 patient-years',
        auditFlag: 'verified',
      },
      {
        id: 'cana-a2',
        category: 'conclusion_shift',
        title: 'A boxed warning added in 2017 and taken off in 2020',
        laymanSummary:
          'The FDA put its strongest warning on this drug for amputation in May 2017, on the trial data above. In August 2020 it removed that warning, after further trials found the risk lower than first described and found new heart and kidney benefits. The warning about amputation itself remains — just not in a box.',
        technicalDetails:
          'The boxed warning was added in May 2017 after the roughly doubled amputation rate in CANVAS and CANVAS-R. The label approved in August 2020 records the reversal in its own Recent Major Changes table, as “Boxed Warning, Lower Limb Amputation — Removed 08/2020”, alongside revisions to Indications and Usage and to Warnings and Precautions 5.1 to 5.3 dated the same month. The 2017 label carried it as “WARNING: LOWER LIMB AMPUTATION” in the Highlights, describing amputations most frequently of the toe and midfoot with some involving the leg. The reversal followed the cardiovascular indication approved in 2018 and the renal indication approved in 2019. The current label carries Lower Limb Amputation as Warnings and Precautions section 5.2 rather than as a boxed warning. It reports the underlying rates unchanged: 5.9 against 2.8 events per 1,000 patient-years in CANVAS and 7.5 against 4.2 in CANVAS-R, at both the 100 mg and 300 mg doses. Nothing about the original observation was retracted. What changed was the weight assigned to it once two more outcome trials had reported, which is what a regulator revising a judgement in public looks like.',
        evidenceSource:
          'INVOKANA prescribing information as approved 08/2020, Recent Major Changes: “Boxed Warning, Lower Limb Amputation — Removed 08/2020”, against the 2017 revision carrying “WARNING: LOWER LIMB AMPUTATION”; INVOKANA United States prescribing information, section 5.2 (NDA 204042)',
        inferredClaim:
          'That the amputation risk seen in CANVAS was large enough to require the highest-level warning available — a judgement the regulator made in 2017 and reversed in 2020 without the underlying rates changing',
        auditFlag: 'contested',
      },
      {
        id: 'cana-a3',
        category: 'measured',
        title: 'CREDENCE: a 30% reduction in progression to dialysis, on top of standard therapy',
        laymanSummary:
          'In 4,401 people with type 2 diabetes and protein in the urine, already on maximum kidney-protective therapy, the drug cut the combined rate of kidney failure, doubled creatinine and renal or cardiovascular death by about a third. Amputations and fractures did not differ in this trial.',
        technicalDetails:
          'CREDENCE randomised 4,401 patients with type 2 diabetes and albuminuric chronic kidney disease, all on a maximum tolerated dose of an ACE inhibitor or angiotensin receptor blocker, to canagliflozin 100 mg or placebo. The primary composite of end-stage kidney disease, doubling of serum creatinine or death from renal or cardiovascular causes occurred at 43.2 against 61.2 per 1,000 patient-years, hazard ratio 0.70 (95% CI 0.59 to 0.82, p=0.00001). The renal-specific composite gave 0.66 (0.53 to 0.81, p<0.001), end-stage kidney disease alone 0.68 (0.54 to 0.86, p=0.002), cardiovascular death, myocardial infarction or stroke 0.80 (0.67 to 0.95, p=0.01), and hospitalisation for heart failure 0.61 (0.47 to 0.80, p<0.001). There were no significant differences in rates of amputation or fracture. The trial was stopped early for efficacy. This is the result that changed the drug from a glucose-lowering agent with a safety problem into a kidney drug, and it is also the trial that most weakened the amputation case.',
        evidenceSource:
          'Perkovic V, Jardine MJ, Neal B, et al. N Engl J Med 2019;380:2295-2306 (CREDENCE)',
        doi: '10.1056/NEJMoa1811744',
        measuredMetric:
          'Composite of end-stage kidney disease, doubling of serum creatinine, or renal or cardiovascular death, per 1,000 patient-years',
        auditFlag: 'verified',
      },
      {
        id: 'cana-a4',
        category: 'failed',
        title: 'Bone fractures started at twelve weeks in the same trial programme',
        laymanSummary:
          'The label records an increased fracture risk appearing as early as three months after starting the drug, seen in CANVAS. Whatever causes it acts too fast to be explained by long-term bone loss.',
        technicalDetails:
          'Section 5.9 of the label states that an increased risk of bone fracture, occurring as early as 12 weeks after treatment initiation, was observed in adult patients using canagliflozin in the CANVAS trial, and directs considering contributory fracture risk factors before starting. A twelve-week onset is mechanistically awkward: bone mineral density does not change meaningfully on that timescale, which points towards falls arising from volume depletion and postural hypotension, or towards an acute effect on calcium and phosphate handling in the same tubule the drug acts on. CREDENCE found no significant difference in fractures. The finding therefore sits in the same category as the amputation signal — a real observation in one trial programme, not reproduced in another, with the mechanism unestablished.',
        evidenceSource:
          'INVOKANA United States prescribing information, sections 5.9 and 14.3 (NDA 204042); Perkovic V et al. N Engl J Med 2019;380:2295-2306',
        doi: '10.1056/NEJMoa1811744',
        measuredMetric:
          'Time to first bone fracture in CANVAS, with onset recorded from 12 weeks after initiation',
        auditFlag: 'caution',
      },
      {
        id: 'cana-a5',
        category: 'failed',
        title: 'Ketoacidosis without the high blood sugar that normally announces it',
        laymanSummary:
          'This class can cause diabetic ketoacidosis while the glucose meter reads normal, because the drug is dumping glucose into the urine. The label tells clinicians to test for it regardless of the glucose reading.',
        technicalDetails:
          'Section 5.1 directs considering ketone monitoring in patients at risk, assessing for ketoacidosis regardless of presenting blood glucose levels, discontinuing the drug if ketoacidosis is suspected, and monitoring for resolution before restarting. The drug is not recommended for glycaemic control in type 1 diabetes for this reason. The failure being described is diagnostic rather than pharmacological: the standard clinical trigger for suspecting ketoacidosis is a very high glucose, and the drug removes that trigger while leaving the ketoacidosis. Section 5.6 records a second mechanism-linked harm of the same character, necrotising fasciitis of the perineum — Fournier’s gangrene — described as serious and life-threatening and occurring in both females and males, plausibly downstream of the glycosuria that is the drug’s intended effect.',
        evidenceSource:
          'INVOKANA United States prescribing information, sections 5.1 and 5.6 (NDA 204042)',
        measuredMetric:
          'Labelled instruction to assess for ketoacidosis independently of blood glucose, and the perineal necrotising fasciitis warning',
        auditFlag: 'caution',
      },
      {
        id: 'cana-a6',
        category: 'inferred',
        title: 'The kidney mechanism is stated in the label as a belief, not a finding',
        laymanSummary:
          'The explanation everyone gives for why these drugs protect kidneys — that they reduce the pressure inside the filter — is written into the label with the words "is believed to". The benefit is measured; the reason for it is not.',
        technicalDetails:
          'Section 12.1 reads: "Canagliflozin increases the delivery of sodium to the distal tubule by blocking SGLT2-dependent glucose and sodium reabsorption. This is believed to increase tubuloglomerular feedback and reduce intraglomerular pressure." The phrasing is deliberate. The tubuloglomerular feedback account is coherent, is consistent with the acute dip in eGFR seen on starting the drug, and has never been directly demonstrated in humans as the cause of the outcome benefit. The size of the CREDENCE effect — and the fact that it appeared on top of maximal renin-angiotensin blockade, which works through a different lever on the same pressure — is compatible with the story and does not establish it. The distinction matters for anyone reasoning about which patients should benefit most, because a mechanism assumed rather than measured cannot safely be extrapolated beyond the populations that were randomised.',
        evidenceSource: 'INVOKANA United States prescribing information, section 12.1 (NDA 204042)',
        inferredClaim:
          'That the renal benefit of canagliflozin is caused by restored tubuloglomerular feedback lowering intraglomerular pressure — the standard account, and one the label itself marks as a belief',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A sugar molecule bolted on through carbon',
        laymanDesc:
          'The drug is built around a glucose-like unit attached to a larger scaffold. Attaching it through a carbon bond rather than the usual oxygen bond is what stops the gut from digesting it, and is why this can be a tablet.',
        molecularDetail:
          'A C-glycoside descended from the natural O-glycoside phlorizin, formula C24H25FO5S, molecular weight 444.50 g/mol. The carbon-carbon anomeric linkage resists intestinal beta-glucosidases. Canagliflozin retains measurable SGLT1 activity alongside its SGLT2 inhibition, making it the least selective member of the marketed class.',
        iconName: 'Link',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It works in the kidney tubule, not the pancreas',
        laymanDesc:
          'The target sits in the first stretch of the kidney tubule, where glucose that has just been filtered out of the blood is normally hauled back in. Insulin plays no part in any of this.',
        molecularDetail:
          'Section 12.1: SGLT2, expressed in the proximal renal tubules, is responsible for the majority of the reabsorption of filtered glucose from the tubular lumen. Because the mechanism is insulin-independent, the drug lowers glucose in people with substantial beta-cell failure and causes essentially no hypoglycaemia on its own — section 5.5 restricts that warning to combination with insulin or an insulin secretagogue.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The threshold for spilling sugar is lowered',
        laymanDesc:
          'Normally glucose only appears in urine when blood levels are very high. The drug resets that threshold downward, so sugar leaves the body at ordinary blood levels.',
        molecularDetail:
          'By inhibiting SGLT2, canagliflozin reduces reabsorption of filtered glucose and lowers the renal threshold for glucose, increasing urinary glucose excretion. The pharmacodynamic endpoint for this class is grams of glucose excreted per day and the shift in renal threshold, not a plasma concentration.',
        iconName: 'TrendingDown',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Sodium reaches the far end of the nephron, and pressure falls',
        laymanDesc:
          'Blocking the transporter also stops sodium being reabsorbed there. More sodium arriving downstream is a signal the kidney uses to dial back the pressure inside its own filter — which is the leading explanation for the kidney protection.',
        molecularDetail:
          'Section 12.1: canagliflozin increases delivery of sodium to the distal tubule by blocking SGLT2-dependent glucose and sodium reabsorption; this is believed to increase tubuloglomerular feedback and reduce intraglomerular pressure. The label states this as a belief. The acute eGFR dip on initiation is consistent with it and is not proof of it.',
        iconName: 'Gauge',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Water follows the sugar out',
        laymanDesc:
          'Glucose in the urine drags water with it. That osmotic diuresis is where the dehydration, the blood pressure drop and part of the weight loss come from — and the sugary urine is why yeast infections are common.',
        molecularDetail:
          'Osmotic diuresis underlies the labelled warnings for volume depletion leading to acute kidney injury (5.3), urosepsis and pyelonephritis (5.4), genital mycotic infections (5.7) and, plausibly, necrotising fasciitis of the perineum (5.6). The label directs assessing and correcting volume status before initiation in renal impairment, the elderly and patients on loop diuretics.',
        iconName: 'Droplets',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'Two outcome trials, and one signal that would not settle',
        laymanDesc:
          'Fewer cardiovascular events in ten thousand patients, and a third less progression to dialysis in four thousand. Against that, amputations nearly doubled in the first trial and did not differ in the second.',
        molecularDetail:
          'CANVAS: primary composite HR 0.86 (95% CI 0.75 to 0.97); amputation 6.3 against 3.4 per 1,000 patient-years, HR 1.97 (1.41 to 2.75); fracture risk from 12 weeks. CREDENCE: primary composite HR 0.70 (0.59 to 0.82, p=0.00001), heart failure hospitalisation 0.61 (0.47 to 0.80), with no significant difference in amputation or fracture. Boxed warning added May 2017 and removed in the label approved 08/2020; the section 5.2 warning remains.',
        iconName: 'Scale',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CANVAS Program (N Engl J Med 2017;377:644-657)',
        phase: 'Phase 3, two integrated randomised, double-blind, placebo-controlled trials',
        sampleSize: 10142,
        primaryEndpoint:
          'Composite of death from cardiovascular causes, nonfatal myocardial infarction or nonfatal stroke in type 2 diabetes at high cardiovascular risk',
        endpointMet: true,
        statisticalPValue:
          '26.9 against 31.5 per 1,000 patient-years, hazard ratio 0.86 (95% CI 0.75 to 0.97), p<0.001 for non-inferiority and p=0.02 for superiority',
        unreportedAdverseSignals:
          'Amputation of toes, feet or legs occurred at 6.3 against 3.4 per 1,000 patient-years, hazard ratio 1.97 (95% CI 1.41 to 2.75), predominantly toe or metatarsal. An increased risk of bone fracture was observed from as early as 12 weeks. These findings produced a boxed warning in May 2017.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'CREDENCE (N Engl J Med 2019;380:2295-2306)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, stopped early for efficacy',
        sampleSize: 4401,
        primaryEndpoint:
          'Composite of end-stage kidney disease, doubling of serum creatinine, or death from renal or cardiovascular causes, in type 2 diabetes with albuminuric chronic kidney disease on maximum tolerated ACE inhibitor or ARB',
        endpointMet: true,
        statisticalPValue:
          '43.2 against 61.2 per 1,000 patient-years, hazard ratio 0.70 (95% CI 0.59 to 0.82), p=0.00001',
        unreportedAdverseSignals:
          'No significant differences in rates of amputation or fracture were observed in this trial — a direct non-replication of the two CANVAS safety signals, and the principal evidence cited when the boxed warning was removed. The trial was stopped early for efficacy, which tends to inflate observed effect sizes.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Cardiovascular composite hazard ratio 0.86 (95% CI 0.75 to 0.97) in 10,142 patients, 26.9 against 31.5 events per 1,000 patient-years',
        'Amputation 6.3 against 3.4 per 1,000 patient-years, hazard ratio 1.97 (95% CI 1.41 to 2.75), in the same trial programme',
        'Renal composite hazard ratio 0.70 (95% CI 0.59 to 0.82, p=0.00001) in 4,401 patients with albuminuric diabetic nephropathy',
        'Hospitalisation for heart failure hazard ratio 0.61 (95% CI 0.47 to 0.80, p<0.001) in the same trial',
        'Labelled amputation rates of 5.9 against 2.8 per 1,000 patient-years in CANVAS and 7.5 against 4.2 in CANVAS-R, at both 100 mg and 300 mg',
      ],
      unsupportedInferences: [
        'That the renal benefit is caused by restored tubuloglomerular feedback lowering intraglomerular pressure — the label writes this as "is believed to"',
        'That the SGLT2 inhibitors are interchangeable; canagliflozin is the only member that has carried an amputation boxed warning and the only one with the CREDENCE result in albuminuric nephropathy',
        'That the removal of the boxed warning means the amputation risk was disproved; the FDA stated the risk is still increased, and the warning remains in section 5.2',
        'That canagliflozin’s residual SGLT1 activity explains the amputation finding, which is a plausible hypothesis with no supporting demonstration',
      ],
      whatFailedInitially: [
        'Lower-limb amputations nearly doubled in CANVAS, producing an FDA boxed warning in May 2017',
        'Bone fractures were increased from as early as 12 weeks after initiation in the same programme',
        'Diabetic ketoacidosis occurs at normal or near-normal blood glucose, removing the usual diagnostic trigger; the drug is not recommended for glycaemic control in type 1 diabetes',
        'Necrotising fasciitis of the perineum, described in the label as serious and life-threatening, has occurred in both sexes',
      ],
      realWorldOutcome: [
        'Approved 29 March 2013 under NDA 204042 as the first SGLT2 inhibitor licensed in the United States',
        'Boxed warning for lower-limb amputation added May 2017 and removed in the label approved 08/2020, with the section 5.2 warning retained',
        'Cardiovascular indication added in 2018 and the diabetic nephropathy indication in 2019, both on the trials above',
        'Listed at US$19.11 per tablet of pharmacy acquisition cost in the CMS survey effective 19 August 2026, with no generic in the file at the time of writing',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 100 mg or 300 mg, taken once daily before the first meal of the day',
      description:
        'Absorbed orally and acting at the luminal face of the proximal tubule after renal excretion of the parent drug and its metabolites. Efficacy for glucose lowering falls as glomerular filtration falls, because a drug that works on filtered glucose needs filtration; the label does not recommend it for glycaemic control below an eGFR of 30 mL/min/1.73 m², while the kidney-protective indication was established in a population with reduced eGFR.',
      safetyProfile:
        'No boxed warning at the time of writing; the amputation boxed warning added in May 2017 was removed in the label approved 08/2020 and the risk is now described in Warnings and Precautions 5.2. Labelled warnings cover diabetic ketoacidosis in type 1 diabetes and other ketoacidosis, to be assessed regardless of blood glucose; lower limb amputation, with monitoring for lower-limb infection and ulcers and discontinuation if they occur; volume depletion that may cause acute kidney injury; urosepsis and pyelonephritis; hypoglycaemia when combined with insulin or an insulin secretagogue; necrotising fasciitis of the perineum in both sexes; genital mycotic infections; hypersensitivity reactions; and bone fracture from as early as 12 weeks. Risk of amputation was highest in patients with a prior amputation, peripheral vascular disease or neuropathy.',
    },
    commonQuestions: [
      {
        q: 'Was the amputation risk real, or was the warning a mistake?',
        a: 'It was real and it was measured. In the CANVAS Program, amputations ran at 6.3 per thousand patient-years on canagliflozin against 3.4 on placebo, a hazard ratio of 1.97 (95% CI 1.41 to 2.75), in the same randomised trial that showed the cardiovascular benefit. The FDA added a boxed warning in May 2017 on that basis. The label approved in August 2020 removed the box, recording the change in its own Recent Major Changes table as “Boxed Warning, Lower Limb Amputation — Removed 08/2020”; the main new evidence was CREDENCE, in which amputations and fractures did not differ. Nothing was retracted. The warning still exists; it moved from the box to section 5.2, which still prints the original rates. The honest summary is that a signal appeared, a second large trial did not reproduce it, and the regulator reduced the prominence of the warning without withdrawing it.',
        auditNote:
          'This is what a public revision of a safety judgement looks like. Both the 2017 decision and the 2020 decision were made on evidence, and neither cancels the other.',
      },
      {
        q: 'Does it actually protect my kidneys, or just lower my sugar?',
        a: 'Both, and the kidney result is the stronger one. CREDENCE randomised 4,401 people with type 2 diabetes and albuminuria who were already on the maximum tolerated dose of an ACE inhibitor or angiotensin receptor blocker. The combined rate of kidney failure, doubled creatinine or renal or cardiovascular death fell from 61.2 to 43.2 per thousand patient-years, a hazard ratio of 0.70 at p=0.00001. End-stage kidney disease alone fell by a hazard ratio of 0.68, and hospitalisation for heart failure by 0.61. That benefit was on top of standard kidney-protective therapy, not instead of it, and the trial was stopped early because the effect was large enough that continuing was not justified.',
      },
      {
        q: 'Why do I have to be told to check for ketoacidosis when my sugar is normal?',
        a: 'Because this class breaks the usual warning sign. Diabetic ketoacidosis is normally announced by a very high blood glucose, which is what prompts anyone to test for ketones. Canagliflozin removes glucose through the urine, so the glucose reading can be normal or only mildly raised while ketoacidosis is developing. The label deals with this directly: assess for ketoacidosis regardless of presenting blood glucose levels, discontinue the drug if it is suspected, and monitor for resolution before restarting. It is also why the drug is not recommended for glycaemic control in type 1 diabetes.',
        auditNote:
          'The failure here is diagnostic rather than pharmacological — the drug does not cause more ketoacidosis so much as it hides the signal that would have caught it.',
      },
      {
        q: 'Are all the SGLT2 inhibitors the same?',
        a: 'No, and this drug is the clearest illustration of why. Canagliflozin has a cardiovascular result (HR 0.86) and a kidney result in albuminuric diabetic nephropathy that are its own; empagliflozin and dapagliflozin have their own trials with their own populations and their own endpoints; ertugliflozin, tested in 8,246 patients, did not achieve superiority on its cardiovascular endpoint at all. Canagliflozin is the only member of the class that has carried a boxed warning for amputation, and the only one whose label records a fracture signal from twelve weeks. The class shares a mechanism and does not share an evidence base.',
        auditNote:
          'A class effect is an inference. Where four molecules have four trials with four different results, treating them as one drug discards the measurements.',
      },
      {
        q: 'Why does the mechanism explanation sound so hedged?',
        a: 'Because the label hedges it. Section 12.1 says that blocking the transporter increases sodium delivery to the distal tubule, and that this "is believed to increase tubuloglomerular feedback and reduce intraglomerular pressure". The benefit is measured; the causal story is the best available account rather than a demonstrated fact. That is worth knowing, because a mechanism that is assumed rather than shown cannot be safely extrapolated to patient groups the trials did not enrol — which is exactly what happens when a drug becomes popular faster than its trials accumulate.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Neal B, Perkovic V, Mahaffey KW, et al. Canagliflozin and cardiovascular and renal events in type 2 diabetes. N Engl J Med 2017;377:644-657 (CANVAS Program)',
        identifier: '10.1056/NEJMoa1611925',
        kind: 'doi',
      },
      {
        label:
          'Perkovic V, Jardine MJ, Neal B, et al. Canagliflozin and renal outcomes in type 2 diabetes and nephropathy. N Engl J Med 2019;380:2295-2306 (CREDENCE)',
        identifier: '10.1056/NEJMoa1811744',
        kind: 'doi',
      },
      {
        label: 'ClinicalTrials.gov record for CREDENCE, 4,401 participants',
        identifier: 'NCT02065791',
        kind: 'nct',
      },
      {
        label: 'ClinicalTrials.gov record for CANVAS, the first of the two integrated trials',
        identifier: 'NCT01032629',
        kind: 'nct',
      },
      {
        label:
          'INVOKANA (canagliflozin) United States prescribing information — Indications 1, Warnings and Precautions 5.1 to 5.9, Clinical Pharmacology 12.1, Clinical Studies 14.3 (NDA 204042)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=204042',
        kind: 'regulatory',
      },
      {
        label:
          'INVOKANA (canagliflozin) prescribing information as approved 08/2020 (NDA 204042 supplement 034) — Recent Major Changes records “Boxed Warning, Lower Limb Amputation — Removed 08/2020”',
        identifier: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2020/204042s034lbl.pdf',
        kind: 'regulatory',
      },
      {
        label:
          'INVOKANA (canagliflozin) prescribing information as approved in 2017 (NDA 204042 supplement 026) — carries “WARNING: LOWER LIMB AMPUTATION” in the Highlights',
        identifier: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2017/204042s026lbl.pdf',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost, 2026 file — NDC descriptions INVOKANA and INVOKAMET, survey effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 5. Ertugliflozin — the SGLT2 inhibitor whose outcome trial met non-inferiority and nothing
  //    else, and whose label consequently carries no cardiovascular or kidney indication.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ertugliflozin',
    name: 'Ertugliflozin',
    tradeName: 'Steglatro (also Segluromet with metformin and Steglujan with sitagliptin)',
    sponsor: 'Merck Sharp & Dohme LLC in alliance with Pfizer (NDA 209803); discovered at Pfizer',
    targetGene: 'SLC5A2',
    targetProtein:
      'Sodium-glucose co-transporter 2 (SGLT2), described in the label as the predominant transporter responsible for reabsorption of glucose from the glomerular filtrate back into the circulation',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2017,
    indication:
      'Adjunct to diet and exercise to improve glycaemic control in adults with type 2 diabetes mellitus. Limitation of Use: not recommended to improve glycaemic control in patients with type 1 diabetes mellitus',
    patientFriendlyIndication: 'Type 2 diabetes — lowering blood sugar through the kidneys',
    anatomicalSite: 'Proximal tubule of the kidney nephron',
    conditionContext: {
      conditionExplainer:
        'The kidney reclaims nearly all the glucose it filters out of the blood, and one transporter does most of that work. Blocking it makes glucose leave in the urine instead. It is the same mechanism as every other drug ending in -gliflozin.',
      whyItMatters:
        'Ertugliflozin is the control experiment for the SGLT2 class. Its siblings have cardiovascular, heart failure and kidney indications won on outcome trials. Ertugliflozin ran an 8,246-patient outcome trial of its own, met only non-inferiority, and its United States label still carries a single indication: glycaemic control. It is the clearest available demonstration that a shared mechanism does not guarantee a shared result.',
      whoTakesThis:
        'Adults with type 2 diabetes needing better glucose control. Not recommended for glycaemic control in type 1 diabetes.',
      clinicalGoals:
        'A lower A1c, and nothing else that has been demonstrated for this molecule. The cardiovascular and renal claims that attach to the class are not on this label.',
    },
    oneSentenceVerdict:
      'A kidney glucose-transporter blocker whose 8,246-patient cardiovascular outcome trial produced a hazard ratio of 0.97 (95.6% CI 0.85 to 1.11) — non-inferior to placebo and not superior to it, with events at 11.9% in both arms — and whose label, unlike those of its class siblings, therefore claims nothing beyond glucose lowering while still carrying the class warnings for amputation, ketoacidosis and Fournier’s gangrene.',
    laymanHowItWorks:
      'Every day your kidneys filter a large quantity of glucose out of your blood and then pull essentially all of it back in before urine leaves the body. Ertugliflozin blocks the transporter that does most of that pulling, so glucose is lost in the urine and blood sugar falls. Insulin is not involved anywhere in this, which is why the drug works even when the pancreas is failing and why it rarely causes low blood sugar on its own. The water that leaves with the glucose accounts for the mild dehydration and blood pressure drop; the sugar left behind in the urinary tract accounts for the yeast infections.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$11.44 per tablet at United States pharmacy acquisition cost (CMS NADAC, median of the four listed STEGLATRO 5 mg and 15 mg products, survey effective 19 August 2026). The ertugliflozin-metformin combination SEGLUROMET is listed at a median US$5.71 per tablet and the ertugliflozin-sitagliptin combination STEGLUJAN at US$17.54, in the same survey',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in December 2017 under NDA 209803, the fourth SGLT2 inhibitor to reach that market. It was launched at a deliberate discount to the established members of the class, which is the commercial context for a molecule arriving late with a mechanism already proven by others. No generic ertugliflozin product appears in the 2026 CMS file at the time of writing.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'This is the one drug in its class where the substitution question has a clean answer, because the outcome trials differ and the labels record the difference. Empagliflozin, dapagliflozin and canagliflozin each carry indications beyond glucose lowering, won on their own randomised endpoints. Ertugliflozin does not, and its trial is the reason.',
      conventionalRx: [
        {
          name: 'Empagliflozin (Jardiance)',
          class: 'SGLT2 inhibitor',
          howItCompares:
            'Same mechanism, different evidence. Empagliflozin holds cardiovascular and heart failure indications won on its own outcome trials. Ertugliflozin’s trial, in 8,246 patients over a mean 3.5 years, produced a major adverse cardiovascular event rate of 11.9% in both arms.',
          typicalCost:
            'Brand-priced in the United States, generally above ertugliflozin per tablet',
          prosAndCons:
            'Pros: outcome indications on the label. Cons: identical mechanism-derived adverse effects — ketoacidosis, genitourinary infection, volume depletion.',
        },
        {
          name: 'Canagliflozin (Invokana)',
          class: 'SGLT2 inhibitor',
          howItCompares:
            'Holds both a cardiovascular indication and a diabetic-nephropathy indication, the latter from CREDENCE (HR 0.70, 95% CI 0.59 to 0.82). It is also the molecule that carried an amputation boxed warning from 2017 to 2020. The two drugs demonstrate the same point from opposite ends: within one mechanism, the individual trials are what count.',
          typicalCost:
            'US$19.11 per tablet at United States pharmacy acquisition cost (CMS NADAC, median of four listed INVOKANA products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: outcome indications for heart and kidney. Cons: the strongest amputation signal in the class, and a labelled fracture risk from 12 weeks.',
        },
        {
          name: 'Metformin',
          class: 'Biguanide',
          howItCompares:
            'The comparator that matters for a drug licensed only on glucose lowering. Metformin has an all-cause mortality result from UKPDS 34 — a 36% reduction (95% CI 9 to 55, p=0.011) in 342 overweight newly diagnosed patients — which is more than ertugliflozin’s label claims, at a small fraction of the price.',
          typicalCost: 'Among the cheapest prescription drugs in the United States',
          prosAndCons:
            'Pros: cost, an old outcome result, first-line in every guideline. Cons: gastrointestinal intolerance, a lactic acidosis boxed warning, vitamin B12 depletion.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Inspect your feet and report ulcers early',
          action: 'Report any new foot infection, ulcer, pain or tenderness promptly.',
          patientImpact:
            'Section 5.2 records non-traumatic lower-limb amputation rates in the cardiovascular outcome trial of 4.7, 5.7 and 6.0 events per 1,000 patient-years on placebo, 5 mg and 15 mg respectively. Amputation of toe and foot were most frequent — 81 of 109 patients — and lower-limb infection, gangrene and diabetic foot ulcer were the most common precipitating events.',
          clinicalPrecaution:
            'The label records that patients with amputations were more likely to be male, to have higher baseline A1c, and to have a history of peripheral arterial disease, prior amputation or revascularisation, or diabetic foot, and to have been taking diuretics or insulin.',
        },
        {
          name: 'A normal glucose does not rule out ketoacidosis',
          action:
            'If you become severely unwell — vomiting, breathless, confused — say that you take an SGLT2 inhibitor even if your meter reads normal.',
          patientImpact:
            'Section 5.1 directs assessing for ketoacidosis regardless of presenting blood glucose levels and discontinuing the drug if it is suspected. The drug removes glucose in the urine, which removes the high reading that would normally prompt the test.',
          clinicalPrecaution:
            'The label directs monitoring for resolution before restarting, and does not recommend the drug for glycaemic control in type 1 diabetes.',
        },
        {
          name: 'Genital or perineal pain with fever is an emergency',
          action:
            'Seek immediate assessment for pain, tenderness, redness or swelling in the genital or perineal area with fever or malaise.',
          patientImpact:
            'Section 5.4 groups urosepsis, pyelonephritis, necrotising fasciitis of the perineum (Fournier’s gangrene) and genital mycotic infections together, and directs immediate evaluation, discontinuation and prompt medical or surgical intervention if necrotising fasciitis is suspected.',
          clinicalPrecaution:
            'Section 5.3 separately warns that volume depletion may cause acute kidney injury and directs assessing and correcting volume status before starting in renal impairment, low systolic blood pressure, the elderly and patients on diuretics.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CCOC1=CC=C(C=C1)CC2=C(C=CC(=C2)[C@@]34[C@@H]([C@H]([C@@H]([C@@](O3)(CO4)CO)O)O)O)Cl',
      chemicalFormula: 'C22H25ClO7',
      molecularWeight: '436.90 g/mol',
      targetReceptorAffinity:
        'A C-glycoside like the rest of the class, but with a distinguishing structural feature: the sugar is locked into a bicyclic dioxabicyclo[3.2.1]octane cage rather than the ordinary six-membered pyranose ring the others use. The cage rigidifies the sugar into the conformation the transporter binds, which is the medicinal-chemistry argument for the molecule. It buys high SGLT2 potency and high selectivity over SGLT1. It did not buy a different outcome-trial result, which is the useful lesson: binding chemistry and clinical endpoint are separate measurements.',
      structureSource: {
        label:
          'PubChem CID 44814423 (ertugliflozin) — isomeric SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/44814423',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ertu-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the bicyclic cage and the co-former in the marketed salt',
          description:
            'The distinguishing feature of this molecule is a bridged bicyclic sugar, and a batch in which the bridge has not formed is a different compound with different transporter affinity. The marketed drug substance is also a co-crystal with L-pyroglutamic acid rather than the free molecule, so both components have to be identified and quantified.',
          reagentsAndBuffer:
            'Ertugliflozin L-pyroglutamic acid reference standard, 1H and 13C NMR with HMBC to confirm the dioxabicyclo[3.2.1]octane bridge, X-ray powder diffraction for the co-crystal form, ion chromatography or HPLC for co-former stoichiometry, Karl Fischer titration',
        },
        {
          id: 'ertu-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Assemble the chlorinated diarylmethane and add the sugar through carbon',
          description:
            'The aglycone is a chlorophenyl ring bearing an ethoxybenzyl group; the sugar is installed as a beta C-glycoside by adding the aryl anion to a protected gluconolactone and reducing the hemiketal. The same anomeric problem as every other member of the class: the reduction decides whether the batch is the drug.',
          dependsOnStepId: 'ertu-w1',
          reagentsAndBuffer:
            'Bromochlorophenyl and 4-ethoxybenzyl intermediates, Friedel-Crafts acylation and reduction to the diarylmethane, protected D-gluconolactone, n-butyllithium under anhydrous conditions, triethylsilane with a Lewis acid for stereoselective anomeric reduction',
        },
        {
          id: 'ertu-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Close the bicyclic bridge and crystallise the co-crystal',
          description:
            'Selective oxidation of the primary alcohol and intramolecular ketalisation close the bridge that defines the molecule; the product is then crystallised with L-pyroglutamic acid, which is what gives the drug substance workable solid-state properties. Both operations are yield-determining and both are the point at which related substances are rejected.',
          dependsOnStepId: 'ertu-w2',
          reagentsAndBuffer:
            'TEMPO or equivalent selective oxidation, acid-catalysed intramolecular ketalisation, L-pyroglutamic acid, controlled-cooling crystallisation with seeding, preparative HPLC for related-substance control',
        },
        {
          id: 'ertu-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure SGLT2 and SGLT1 potency side by side',
          description:
            'The selectivity claim for this molecule is quantitative and is one of the reasons it was developed after three competitors already existed. Measuring both transporters in the same assay system on the same day is the only way that number means anything; cross-laboratory comparisons of single-transporter potencies do not.',
          dependsOnStepId: 'ertu-w3',
          reagentsAndBuffer:
            'HEK293 or CHO cells stably expressing human SLC5A2 or SLC5A1, sodium-dependent uptake of radiolabelled alpha-methyl-D-glucopyranoside, sodium-free control buffer, phlorizin as reference inhibitor, matched concentration-response curves on both transporters',
        },
        {
          id: 'ertu-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Quantify urinary glucose excretion and then stop inferring',
          description:
            'Urinary glucose excretion is what this drug does and it can be measured precisely. What it cannot do is predict the outcome trial: ertugliflozin achieves the class-typical glycosuria and its 8,246-patient cardiovascular trial produced a hazard ratio of 0.97. The pharmacodynamic assay is the end of what the laboratory can say, and the page should stop there too.',
          dependsOnStepId: 'ertu-w4',
          reagentsAndBuffer:
            '24-hour urine collection with enzymatic glucose assay, renal threshold for glucose by stepped hyperglycaemic clamp, urine volume and osmolality, plasma ertugliflozin by LC-MS/MS for exposure-response',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ertu-a1',
        category: 'failed',
        title: 'VERTIS CV: 11.9% against 11.9%, and no superiority claim available',
        laymanSummary:
          'The cardiovascular outcome trial enrolled 8,246 people with diabetes and established heart disease and followed them three and a half years. The rate of cardiovascular death, heart attack or stroke was 11.9% in both groups. The drug was shown not to be harmful, and that is the whole finding.',
        technicalDetails:
          'VERTIS CV randomised 8,246 patients with type 2 diabetes and atherosclerotic cardiovascular disease to ertugliflozin 5 mg, 15 mg or placebo, with a non-inferiority margin of 1.3 on the hazard ratio. Among 8,238 who received at least one dose, a major adverse cardiovascular event — cardiovascular death, nonfatal myocardial infarction or nonfatal stroke — occurred in 653 of 5,493 (11.9%) on ertugliflozin and 327 of 2,745 (11.9%) on placebo, hazard ratio 0.97 (95.6% CI 0.85 to 1.11), p<0.001 for non-inferiority. The first key secondary endpoint, cardiovascular death or hospitalisation for heart failure, occurred in 444 of 5,499 (8.1%) against 250 of 2,747 (9.1%), hazard ratio 0.88 (95.8% CI 0.75 to 1.03, p=0.11 for superiority) — it missed. Cardiovascular death gave 0.92 (95.8% CI 0.77 to 1.11) and the renal composite of renal death, renal replacement therapy or doubling of serum creatinine gave 0.81 (95.8% CI 0.63 to 1.04), both intervals crossing unity. The authors’ stated conclusion is the whole of it: ertugliflozin was noninferior to placebo with respect to major adverse cardiovascular events.',
        evidenceSource:
          'Cannon CP, Pratley R, Dagogo-Jack S, et al. N Engl J Med 2020;383:1425-1435 (VERTIS CV)',
        doi: '10.1056/NEJMoa2004967',
        measuredMetric:
          'Composite of cardiovascular death, nonfatal myocardial infarction or nonfatal stroke over a mean 3.5 years, against a non-inferiority margin of 1.3',
        auditFlag: 'verified',
      },
      {
        id: 'ertu-a2',
        category: 'inferred',
        title: 'The class indications are not on this label',
        laymanSummary:
          'Three other drugs with the same mechanism are licensed to protect the heart or the kidneys. This one is licensed only to lower blood sugar, and the difference is not an oversight — it is what its trial found.',
        technicalDetails:
          'The STEGLATRO indication reads in full: an adjunct to diet and exercise to improve glycaemic control in adults with type 2 diabetes mellitus, with a Limitation of Use that it is not recommended for glycaemic control in type 1 diabetes. There is no cardiovascular indication, no heart failure indication and no kidney indication. Canagliflozin, by contrast, carries all three of the outcome claims its trials supported. The mechanism section is nearly word-for-word the same as its siblings’: SGLT2 is the predominant transporter responsible for reabsorption of glucose from the glomerular filtrate, ertugliflozin inhibits it, lowering the renal threshold for glucose and increasing urinary glucose excretion. Identical mechanism, identical pharmacodynamics, different label — because the outcome trial is a separate measurement from the mechanism and this one did not deliver. Anyone reasoning "SGLT2 inhibitors protect the heart and kidneys, therefore this one does" is making a class inference this specific molecule tested and failed to support.',
        evidenceSource:
          'STEGLATRO United States prescribing information, Indications 1 and Clinical Pharmacology 12.1 (NDA 209803); INVOKANA United States prescribing information, Indications 1 (NDA 204042)',
        inferredClaim:
          'That ertugliflozin shares the cardiovascular and renal benefits of its class — an inference contradicted by its own 8,246-patient trial and absent from its label',
        auditFlag: 'caution',
      },
      {
        id: 'ertu-a3',
        category: 'measured',
        title: 'It keeps the class harms it did not earn the class benefits from',
        laymanSummary:
          'The same trial that found no cardiovascular benefit recorded amputation rates rising from 4.7 per thousand patient-years on placebo to 6.0 on the higher dose. The warning is on the label; the benefit is not.',
        technicalDetails:
          'Section 5.2 reports non-traumatic lower-limb amputations in the cardiovascular outcome study at 4.7, 5.7 and 6.0 events per 1,000 patient-years in the placebo, 5 mg and 15 mg arms. Amputation of toe and foot were most frequent, 81 of 109 patients with amputations; some patients had multiple amputations including both limbs; lower-limb infections, gangrene and diabetic foot ulcers were the most common precipitating events. Patients who were amputated were more likely to be male, to have a higher baseline A1c, to have peripheral arterial disease, prior amputation or revascularisation or diabetic foot, and to be taking diuretics or insulin. Section 5.4 covers urosepsis, pyelonephritis, necrotising fasciitis of the perineum and genital mycotic infection; 5.1 covers ketoacidosis assessed independently of blood glucose; 5.3 covers volume depletion causing acute kidney injury. The dose-ordered amputation numbers are not large and their confidence limits are not stated in the label, but the ordering is there and the label prints it.',
        evidenceSource:
          'STEGLATRO United States prescribing information, Warnings and Precautions 5.1 to 5.5 (NDA 209803)',
        measuredMetric:
          'Non-traumatic lower-limb amputation rate per 1,000 patient-years by treatment arm in the cardiovascular outcome study',
        auditFlag: 'caution',
      },
      {
        id: 'ertu-a4',
        category: 'conclusion_shift',
        title: 'Non-inferiority is a safety verdict being read as an efficacy one',
        laymanSummary:
          'A headline saying the trial "met its primary endpoint" is technically accurate and thoroughly misleading. The endpoint it met was that the drug is not worse than nothing by more than a set margin.',
        technicalDetails:
          'The primary objective of VERTIS CV was non-inferiority against a hazard ratio margin of 1.3, the standard design mandated for diabetes drugs after the 2008 FDA guidance that followed the rosiglitazone controversy. Those trials exist to exclude cardiovascular harm, not to demonstrate benefit. Ertugliflozin met that objective at p<0.001 with a point estimate of 0.97 and a confidence interval running from 0.85 to 1.11 — an interval comfortably containing 1.0. When the first key secondary endpoint was tested for superiority it returned p=0.11. Several of the class’s siblings ran the same design and went on to demonstrate superiority; this one did not. The distinction between "did not increase cardiovascular risk" and "reduced cardiovascular risk" is the whole content of this trial, and it is the distinction most reliably lost between a trial report and a prescriber’s memory of it.',
        evidenceSource:
          'Cannon CP et al. N Engl J Med 2020;383:1425-1435; STEGLATRO United States prescribing information, Indications 1 (NDA 209803)',
        doi: '10.1056/NEJMoa2004967',
        inferredClaim:
          'That meeting the primary endpoint of a cardiovascular outcome trial means the drug protects the heart, when the endpoint met was non-inferiority against a margin of 1.3',
        auditFlag: 'contested',
      },
      {
        id: 'ertu-a5',
        category: 'inferred',
        title: 'A better-designed molecule that did not produce a better result',
        laymanSummary:
          'Ertugliflozin was engineered with a rigid, locked sugar to bind the transporter more tightly and more selectively than its predecessors. It arrived fourth, and the clinical trial did not reward the chemistry.',
        technicalDetails:
          'The distinguishing structural feature is a dioxabicyclo[3.2.1]octane cage in place of the ordinary pyranose ring, which pre-organises the sugar into its binding conformation and delivers high SGLT2 potency with high selectivity over the intestinal transporter SGLT1. That is a genuine medicinal-chemistry advance and it is what a fourth entrant to a crowded class needs in order to exist. It produced the class-typical glycosuria and the class-typical A1c reduction, and then an 8,246-patient trial with a hazard ratio of 0.97. The audit point is not that the chemistry is bad; it is that improved target engagement is a laboratory measurement, and improved outcome is a clinical one, and the second does not follow from the first. Nothing in the published record establishes why this molecule’s outcome trial differed from its siblings’, and no page should assert one.',
        evidenceSource:
          'STEGLATRO United States prescribing information, Description 11 and Clinical Pharmacology 12.1 (NDA 209803); Cannon CP et al. N Engl J Med 2020;383:1425-1435',
        inferredClaim:
          'That higher SGLT2 potency and selectivity translate into better clinical outcomes — an inference the molecule engineered for exactly that did not confirm',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A sugar locked into a cage',
        laymanDesc:
          'Like the rest of its class the drug carries a glucose-like unit, but here that unit is fused into a rigid bicyclic cage rather than a normal flexible ring. The idea was to pre-set the shape the transporter wants to see.',
        molecularDetail:
          'A C-glycoside with the pyranose replaced by a 6,8-dioxabicyclo[3.2.1]octane cage; formula C22H25ClO7, molecular weight 436.90 g/mol, marketed as a co-crystal with L-pyroglutamic acid. Conformational pre-organisation delivers high SGLT2 potency and high selectivity over SGLT1.',
        iconName: 'Lock',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It works in the kidney, past any pancreas',
        laymanDesc:
          'The target sits on the lining of the kidney tubule. Nothing about this mechanism needs insulin, so it works regardless of how much of it a person makes.',
        molecularDetail:
          'Section 12.1: SGLT2 is the predominant transporter responsible for reabsorption of glucose from the glomerular filtrate back into the circulation, and ertugliflozin is an inhibitor of SGLT2. Because the mechanism is insulin-independent, section 5.5 restricts the hypoglycaemia warning to combination with insulin or an insulin secretagogue.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The kidney starts letting sugar go',
        laymanDesc:
          'Blocking the transporter lowers the level at which the kidney starts spilling glucose into urine, so sugar leaves the body at ordinary blood levels instead of only at extreme ones.',
        molecularDetail:
          'By inhibiting SGLT2, ertugliflozin reduces renal reabsorption of filtered glucose and lowers the renal threshold for glucose, thereby increasing urinary glucose excretion. Grams per day of glucose excreted and the shift in renal threshold are the pharmacodynamic endpoints for the class.',
        iconName: 'TrendingDown',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Water and pressure follow the sugar',
        laymanDesc:
          'Glucose in the urine drags water with it. Blood pressure and weight fall a little, and so can blood volume — which is where the dehydration and kidney-injury warnings come from.',
        molecularDetail:
          'Osmotic diuresis underlies section 5.3, volume depletion that may result in acute kidney injury, with assessment and correction of volume status directed before initiation in renal impairment, low systolic blood pressure, the elderly and patients on diuretics; and section 5.4, genitourinary infections including urosepsis, pyelonephritis, Fournier’s gangrene and genital mycotic infection.',
        iconName: 'Droplets',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'A1c falls, exactly as the class does',
        laymanDesc:
          'Blood sugar comes down about as much as with any other drug in this family. There is no dispute about that part.',
        molecularDetail:
          'Glycaemic control is the sole indication on the United States label, and the Limitation of Use excludes glycaemic control in type 1 diabetes. Section 5.1 requires assessing for ketoacidosis regardless of presenting blood glucose, because the drug removes the hyperglycaemia that would normally prompt the test.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'And then the outcome trial found nothing',
        laymanDesc:
          'Eight thousand patients, three and a half years, and the rate of cardiovascular death, heart attack and stroke was the same in both arms. The drug is safe for the heart. It was not shown to help it.',
        molecularDetail:
          'VERTIS CV primary composite 11.9% against 11.9%, hazard ratio 0.97 (95.6% CI 0.85 to 1.11), p<0.001 for non-inferiority against a margin of 1.3. First key secondary, cardiovascular death or heart failure hospitalisation, 8.1% against 9.1%, HR 0.88 (95.8% CI 0.75 to 1.03, p=0.11). Renal composite HR 0.81 (95.8% CI 0.63 to 1.04). Amputation rates 4.7, 5.7 and 6.0 per 1,000 patient-years on placebo, 5 mg and 15 mg.',
        iconName: 'Scale',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'VERTIS CV (N Engl J Med 2020;383:1425-1435)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled cardiovascular outcome trial',
        sampleSize: 8246,
        primaryEndpoint:
          'Non-inferiority for major adverse cardiovascular events — cardiovascular death, nonfatal myocardial infarction or nonfatal stroke — against a hazard ratio margin of 1.3, in type 2 diabetes with atherosclerotic cardiovascular disease',
        endpointMet: true,
        statisticalPValue:
          '653 of 5,493 (11.9%) against 327 of 2,745 (11.9%), hazard ratio 0.97 (95.6% CI 0.85 to 1.11), p<0.001 for non-inferiority, over a mean 3.5 years',
        unreportedAdverseSignals:
          'The endpoint met was non-inferiority, not superiority. The first key secondary — cardiovascular death or hospitalisation for heart failure — was 8.1% against 9.1%, HR 0.88 (95.8% CI 0.75 to 1.03) at p=0.11, and missed. Cardiovascular death HR 0.92 (0.77 to 1.11) and the renal composite HR 0.81 (0.63 to 1.04) both had intervals crossing unity. Label-reported amputation rates rose with dose: 4.7, 5.7 and 6.0 per 1,000 patient-years.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Major adverse cardiovascular events 11.9% against 11.9%, hazard ratio 0.97 (95.6% CI 0.85 to 1.11), in 8,246 patients over a mean 3.5 years',
        'Cardiovascular death or hospitalisation for heart failure 8.1% against 9.1%, hazard ratio 0.88 (95.8% CI 0.75 to 1.03), p=0.11 for superiority',
        'Renal composite of renal death, renal replacement therapy or doubling of serum creatinine, hazard ratio 0.81 (95.8% CI 0.63 to 1.04)',
        'Non-traumatic lower-limb amputation at 4.7, 5.7 and 6.0 events per 1,000 patient-years on placebo, 5 mg and 15 mg respectively',
        'Increased urinary glucose excretion through a lowered renal threshold for glucose, the class-defining pharmacodynamic effect',
      ],
      unsupportedInferences: [
        'That ertugliflozin reduces cardiovascular events, which its own trial in 8,246 patients did not show',
        'That it protects the kidneys, a claim absent from its label and not established by a renal composite whose interval runs from 0.63 to 1.04',
        'That meeting the primary endpoint of a cardiovascular outcome trial means demonstrating benefit, when the endpoint was non-inferiority against a margin of 1.3',
        'That higher SGLT2 potency and selectivity than earlier members of the class translate into better clinical results',
      ],
      whatFailedInitially: [
        'Superiority on the primary cardiovascular composite was not achieved: hazard ratio 0.97 with a confidence interval containing 1.0',
        'The first key secondary endpoint missed superiority at p=0.11',
        'The renal composite did not reach significance (HR 0.81, 95.8% CI 0.63 to 1.04)',
        'Amputation rates rose in dose order across the three arms while no offsetting outcome benefit was demonstrated',
      ],
      realWorldOutcome: [
        'Approved in the United States in December 2017 under NDA 209803 as the fourth SGLT2 inhibitor in that market, and launched at a deliberate price discount to the class',
        'Its label carries a single indication — glycaemic control — where three class siblings carry cardiovascular, heart failure or kidney indications',
        'Listed at US$11.44 per tablet of pharmacy acquisition cost against US$19.11 for canagliflozin in the CMS survey effective 19 August 2026',
        'Marketed also as SEGLUROMET with metformin and STEGLUJAN with sitagliptin, at US$5.71 and US$17.54 per tablet respectively in the same survey',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 5 mg or 15 mg, taken once daily',
      description:
        'Absorbed orally and acting from the tubular lumen of the kidney after renal handling. Like every drug in the class its glucose-lowering effect depends on glomerular filtration delivering glucose to the site of action, so efficacy falls as kidney function falls. It is also supplied as a fixed-dose combination with metformin (SEGLUROMET) and with sitagliptin (STEGLUJAN).',
      safetyProfile:
        'No boxed warning. Labelled warnings: diabetic ketoacidosis in type 1 diabetes and other ketoacidosis, to be assessed regardless of presenting blood glucose and the drug discontinued if suspected; lower limb amputation, with monitoring for lower-limb infection and ulcers, at rates of 4.7, 5.7 and 6.0 events per 1,000 patient-years on placebo, 5 mg and 15 mg in the cardiovascular outcome study; volume depletion that may cause acute kidney injury, with volume status assessed and corrected before initiation in renal impairment, low systolic blood pressure, the elderly and patients on diuretics; genitourinary infections including urosepsis, pyelonephritis, necrotising fasciitis of the perineum and genital mycotic infections, with immediate evaluation and discontinuation if necrotising fasciitis is suspected; and hypoglycaemia when combined with insulin or an insulin secretagogue.',
    },
    commonQuestions: [
      {
        q: 'Does this drug protect my heart like the other ones in its class?',
        a: 'It has not been shown to. VERTIS CV randomised 8,246 people with type 2 diabetes and established atherosclerotic cardiovascular disease and followed them a mean of three and a half years. Cardiovascular death, heart attack or stroke occurred in 11.9% of those on ertugliflozin and 11.9% of those on placebo — hazard ratio 0.97, with a confidence interval from 0.85 to 1.11. The trial was designed to show the drug was not worse than placebo by more than a set margin, and it succeeded at that. The first key secondary endpoint, cardiovascular death or heart failure admission, missed superiority at p=0.11. That is why the United States label lists glycaemic control and nothing else, while canagliflozin, empagliflozin and dapagliflozin carry outcome indications won on their own trials.',
        auditNote:
          'Shared mechanism, separate evidence. Four molecules, four trials, four different labels — that is a measurement, not a technicality.',
      },
      {
        q: 'The press release said the trial met its primary endpoint. Is that not good news?',
        a: 'It is accurate and it is not what most readers take it to mean. The primary endpoint was non-inferiority against a hazard ratio margin of 1.3 — the safety design that regulators have required of every diabetes drug since 2008. Meeting it means the trial excluded a certain amount of cardiovascular harm. It does not mean benefit was found, and here it was not: the point estimate was 0.97 with a confidence interval running through 1.0. Several other drugs in the same class ran the same design and then went on to demonstrate superiority. This one tested for superiority on its first key secondary endpoint and got p=0.11.',
        auditNote:
          'The gap between "did not increase risk" and "reduced risk" is the single most reliably lost distinction in cardiovascular trial reporting.',
      },
      {
        q: 'Why does it still carry an amputation warning if the newer data is reassuring?',
        a: 'Because the warning describes this drug’s own trial. Section 5.2 records non-traumatic lower-limb amputations in the cardiovascular outcome study at 4.7 events per thousand patient-years on placebo, 5.7 on 5 mg and 6.0 on 15 mg. Toe and foot amputations were most frequent — 81 of 109 patients — and lower-limb infection, gangrene and diabetic foot ulcer were the usual precipitating events. The people affected were more likely to have peripheral arterial disease, a previous amputation or revascularisation, or diabetic foot, and to be on diuretics or insulin. The absolute rates are low and the label does not give confidence intervals for them. What it does give is a dose ordering, on a drug whose outcome trial found no offsetting cardiovascular benefit.',
      },
      {
        q: 'Is it worth taking at all?',
        a: 'It lowers blood glucose as reliably as any drug in its class, and for someone who needs glucose lowering and tolerates it, that is a real effect. What it does not carry is the extra reason the class is usually chosen. If the goal is glucose control alone, metformin is far cheaper and has an old randomised mortality result this drug does not have. If the goal includes heart or kidney protection, the molecules with those indications have them because their trials produced them. This is a prescribing decision and the page does not make it; it sets out what each label claims and what each trial measured.',
      },
      {
        q: 'Why do I have to be assessed for ketoacidosis when my sugar reads normal?',
        a: 'Because this class removes the warning sign. Diabetic ketoacidosis is normally suspected when blood glucose is very high, which is what prompts anyone to check for ketones. Ertugliflozin excretes glucose in the urine, so the reading can look acceptable while ketoacidosis develops underneath it. Section 5.1 of the label deals with this directly: assess for ketoacidosis regardless of presenting blood glucose levels, discontinue if it is suspected, and monitor for resolution before restarting. The drug is also not recommended for glycaemic control in type 1 diabetes.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cannon CP, Pratley R, Dagogo-Jack S, et al. Cardiovascular outcomes with ertugliflozin in type 2 diabetes. N Engl J Med 2020;383:1425-1435 (VERTIS CV)',
        identifier: '10.1056/NEJMoa2004967',
        kind: 'doi',
      },
      {
        label:
          'ClinicalTrials.gov record for VERTIS CV — Cardiovascular Outcomes Following Ertugliflozin Treatment in Type 2 Diabetes Mellitus Participants With Vascular Disease, 8,246 participants',
        identifier: 'NCT01986881',
        kind: 'nct',
      },
      {
        label:
          'STEGLATRO (ertugliflozin) United States prescribing information — Indications 1, Warnings and Precautions 5.1 to 5.5, Description 11, Clinical Pharmacology 12.1, Clinical Studies 14.2 (NDA 209803)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=209803',
        kind: 'regulatory',
      },
      {
        label:
          'INVOKANA (canagliflozin) United States prescribing information — Indications 1, cited here for the contrast in licensed claims within one mechanism (NDA 204042)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=204042',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 44814423 — ertugliflozin, isomeric SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/44814423',
        kind: 'url',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost, 2026 file — NDC descriptions STEGLATRO, SEGLUROMET, STEGLUJAN and INVOKANA, survey effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 6. Linagliptin — the DPP-4 inhibitor sold on not needing a kidney dose adjustment, whose
  //    kidney outcome trial found no kidney benefit at all.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'linagliptin',
    name: 'Linagliptin',
    tradeName: 'Tradjenta (also Jentadueto with metformin and Glyxambi with empagliflozin)',
    sponsor: 'Boehringer Ingelheim Pharmaceuticals in alliance with Eli Lilly (NDA 201280)',
    targetGene: 'DPP4',
    targetProtein:
      'Dipeptidyl peptidase-4, the enzyme that degrades the incretin hormones glucagon-like peptide-1 and glucose-dependent insulinotropic polypeptide',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2011,
    indication:
      'Adjunct to diet and exercise to improve glycaemic control in adults with type 2 diabetes mellitus. Limitations of Use: not recommended in patients with type 1 diabetes mellitus as it would not be effective; has not been studied in patients with a history of pancreatitis',
    patientFriendlyIndication:
      'Type 2 diabetes — one tablet a day, no dose change for kidney function',
    anatomicalSite:
      'Dipeptidyl peptidase-4 in plasma and on endothelial and immune cell surfaces; the downstream consequence is at the pancreatic islet',
    conditionContext: {
      conditionExplainer:
        'When food arrives, the intestine releases hormones that tell the pancreas to make insulin. An enzyme in the blood destroys those hormones within a couple of minutes. Linagliptin blocks the enzyme, so the signal lasts longer and more insulin is released — but only while glucose is actually raised, which is why it hardly ever causes a hypo on its own.',
      whyItMatters:
        'Linagliptin’s distinguishing feature is not efficacy — every DPP-4 inhibitor lowers A1c by a similar amount — but elimination: about 85% of a dose leaves through the bile and gut rather than the kidney, so it is the one member of the class needing no dose adjustment at any level of kidney function. That is a real and useful pharmacokinetic fact, and it is routinely allowed to slide into a different and unsupported claim: that the drug is good for kidneys. Its own 6,979-patient renal outcome trial found a kidney composite hazard ratio of 1.04.',
      whoTakesThis:
        'Adults with type 2 diabetes, including those with severe renal impairment and those on dialysis, where most alternatives require dose reduction or are contraindicated. Not for type 1 diabetes, where the label says it would not be effective.',
      clinicalGoals:
        'A lower A1c, and avoidance of hypoglycaemia. Both are demonstrated. Cardiovascular and kidney protection are not, and its two large outcome trials are the reason we can say so with confidence rather than by omission.',
    },
    oneSentenceVerdict:
      'A once-daily DPP-4 inhibitor that is 85% eliminated through the bile rather than the kidney and therefore needs no renal dose adjustment — a genuine convenience — whose 6,979-patient trial in patients selected for high renal risk produced a cardiovascular hazard ratio of 1.02 (95% CI 0.89 to 1.17) and a kidney composite of 1.04 (95% CI 0.89 to 1.22, p=0.62), and whose one real advantage over a sulphonylurea is hypoglycaemia at 10.6% against 37.7% with no difference in cardiovascular events.',
    laymanHowItWorks:
      'Eating triggers the gut to release two hormones that prompt the pancreas to produce insulin. An enzyme called DPP-4 breaks those hormones down almost immediately. Linagliptin blocks that enzyme, so the hormones survive longer, more insulin is released after a meal, and the liver is told to release less glucose. The effect switches itself off when blood sugar is normal, because the gut hormones only stimulate insulin when glucose is raised. Unlike the rest of its class, this molecule is cleared almost entirely through the bile and bowel rather than the kidneys, which is why the dose is the same 5 mg for everyone regardless of kidney function.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$16.80 per 5 mg tablet at United States pharmacy acquisition cost (CMS NADAC, median of the three listed TRADJENTA products, survey effective 19 August 2026). The linagliptin-metformin combination JENTADUETO is listed at a median US$8.45 per tablet and the linagliptin-empagliflozin combination GLYXAMBI at US$11.22, in the same survey',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 2011 under NDA 201280. No generic linagliptin product appears in the 2026 CMS NADAC file at the time of writing, which is the practical reason the branded tablet is listed at nearly five times the price of generic sitagliptin (median US$3.58) for a drug of the same class and comparable A1c effect. Note that the enriched record for this slug carried a per-tablet figure matching the JENTADUETO combination rather than TRADJENTA; the figure above is the single-agent tablet, taken directly from the dataset.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The honest comparison is in two parts. Against other DPP-4 inhibitors, linagliptin buys one thing — no renal dose adjustment — at roughly five times the price of generic sitagliptin. Against the drug classes with positive outcome trials, it does not compete on outcomes at all, and its own trials establish that rather than leaving it open.',
      conventionalRx: [
        {
          name: 'Sitagliptin (Januvia)',
          class: 'DPP-4 inhibitor',
          howItCompares:
            'The same mechanism and a comparable A1c effect, now generic. It requires dose reduction in renal impairment, which is precisely the gap linagliptin fills. Its cardiovascular outcome trial, TECOS in 14,671 patients, gave a hazard ratio of 0.98 (95% CI 0.88 to 1.09) — the same null result as linagliptin’s.',
          typicalCost:
            'US$3.58 per 100 mg tablet at United States pharmacy acquisition cost (CMS NADAC median across 84 listed generic products, survey effective 5 August 2026)',
          prosAndCons:
            'Pros: about a fifth of the price for the same class effect. Cons: dose adjustment required as kidney function falls, and dose errors in that adjustment are a real clinical problem.',
        },
        {
          name: 'Glimepiride and the sulphonylureas',
          class: 'Insulin secretagogue',
          howItCompares:
            'Directly compared in CAROLINA, 6,033 patients over a median 6.3 years: cardiovascular death, nonfatal myocardial infarction or nonfatal stroke gave a hazard ratio of 0.98 (95.47% CI 0.84 to 1.14) — no difference. Hypoglycaemic adverse events occurred in 10.6% on linagliptin against 37.7% on glimepiride, hazard ratio 0.23 (95% CI 0.21 to 0.26).',
          typicalCost: 'Among the cheapest prescription drugs in the United States',
          prosAndCons:
            'Pros: a fraction of the price, decades of use. Cons: nearly four times the rate of hypoglycaemia and weight gain, against no cardiovascular penalty in the head-to-head trial.',
        },
        {
          name: 'An SGLT2 inhibitor or a GLP-1 receptor agonist',
          class: 'Sodium-glucose cotransporter 2 inhibitors and incretin mimetics',
          howItCompares:
            'These are the classes with positive cardiovascular and kidney outcome trials for specific molecules. Linagliptin acts on the same incretin system a GLP-1 agonist does, from the other end — protecting the natural hormone rather than replacing it with a long-acting analogue — and the two produce very different clinical results.',
          typicalCost:
            'Brand-priced; SGLT2 inhibitors around US$11 to US$19 per tablet in the CMS survey',
          prosAndCons:
            'Pros: outcome indications on the label for several molecules. Cons: class-specific harms — ketoacidosis and genital infection for SGLT2 inhibitors, gastrointestinal intolerance for GLP-1 agonists — and higher cost.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report new blisters',
          action: 'Say straight away if you develop blisters or skin erosions.',
          patientImpact:
            'Section 5.5 records reports of bullous pemphigoid requiring hospitalisation, directs telling patients to report blisters or erosions, and directs discontinuing the drug if bullous pemphigoid is suspected. It is uncommon and it is a labelled reason to stop.',
          clinicalPrecaution:
            'Section 5.3 separately covers serious hypersensitivity including anaphylaxis, angioedema and exfoliative skin conditions.',
        },
        {
          name: 'Severe joint pain is a listed reason to stop',
          action: 'Report disabling joint pain rather than assuming it is unrelated arthritis.',
          patientImpact:
            'Section 5.4 states that severe and disabling arthralgia has been reported and directs considering the drug as a possible cause and discontinuing if appropriate. This is a class effect of DPP-4 inhibitors and it resolves in most people who stop.',
          clinicalPrecaution:
            'Section 5.1 covers acute pancreatitis, including fatal pancreatitis, with prompt discontinuation directed if pancreatitis is suspected.',
        },
        {
          name: 'The hypo risk arrives with the other drug, not this one',
          action:
            'Ask whether the dose of any sulphonylurea or insulin should be lowered when this is started.',
          patientImpact:
            'Section 5.2 directs considering a lower dose of an insulin secretagogue or insulin when initiating linagliptin. On its own the drug produced hypoglycaemic events in 10.6% of CAROLINA participants against 37.7% on glimepiride.',
          clinicalPrecaution:
            'This is a labelled instruction to the prescriber. Nothing here is a direction to change any dose.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC#CCN1C2=C(N=C1N3CCC[C@H](C3)N)N(C(=O)N(C2=O)CC4=NC5=CC=CC=C5C(=N4)C)C',
      chemicalFormula: 'C25H28N8O2',
      molecularWeight: '472.50 g/mol',
      targetReceptorAffinity:
        'A xanthine — structurally a caffeine relative — rather than the peptidomimetic or beta-amino amide scaffolds the rest of the class uses, carrying a butynyl group, a quinazoline and an aminopiperidine. The binding is unusually tight and unusually slow to reverse, and the pharmacokinetics show it: plasma protein binding falls from about 99% at 1 nmol/L to 75-89% above 30 nmol/L as binding to DPP-4 itself saturates, and the terminal half-life is about 200 hours while the accumulation half-life that governs dosing is about 11 hours. The 200-hour figure is target binding, not drug persistence, which is why quoting a single half-life for this molecule misleads in both directions.',
      structureSource: {
        label:
          'PubChem CID 10096344 (linagliptin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; binding and half-life figures from the TRADJENTA label, section 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/10096344',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lina-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the single stereocentre on the aminopiperidine',
          description:
            'The molecule has exactly one stereocentre, on the 3-aminopiperidine, and the wrong enantiomer is a far weaker inhibitor. With a xanthine core dominating the ultraviolet spectrum, a standard assay will not distinguish them; the determination has to be chiral.',
          reagentsAndBuffer:
            'Linagliptin reference standard, chiral HPLC on a polysaccharide phase, 1H and 13C NMR, high-resolution mass spectrometry, residual palladium testing by ICP-MS given the coupling chemistry upstream',
        },
        {
          id: 'lina-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the xanthine and alkylate it twice',
          description:
            'The route assembles a substituted xanthine, alkylates the N7 position with a chloromethyl-methylquinazoline and the N1 position with a butynyl bromide, then installs the protected chiral aminopiperidine by displacement at C8. The order matters because the xanthine nitrogens differ little in reactivity and mis-alkylation gives regioisomers that co-elute.',
          dependsOnStepId: 'lina-w1',
          reagentsAndBuffer:
            '8-bromo-xanthine intermediate, 2-chloromethyl-4-methylquinazoline, 1-bromo-2-butyne, (R)-3-aminopiperidine with a Boc or phthalimide protecting group, potassium carbonate in dimethylformamide, anhydrous conditions',
        },
        {
          id: 'lina-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Deprotect and crystallise the free base',
          description:
            'Remove the amine protecting group and crystallise the free base — linagliptin is marketed as the free base rather than a salt, so the crystal form and its stability define the drug product with no counter-ion to buffer them. Regioisomeric alkylation products are rejected here or not at all.',
          dependsOnStepId: 'lina-w2',
          reagentsAndBuffer:
            'Acidic or hydrazinolytic deprotection, controlled-cooling crystallisation with seeding, preparative HPLC for regioisomer removal, X-ray powder diffraction and differential scanning calorimetry for form confirmation',
        },
        {
          id: 'lina-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure DPP-4 occupancy over time, not a single IC50',
          description:
            'This molecule’s pharmacology is dominated by slow off-rate binding to its target, which is what produces the concentration-dependent plasma protein binding and the 200-hour terminal half-life. A single equilibrium potency figure captures none of that. Selectivity against DPP-8 and DPP-9 must be measured separately, because inhibition of those enzymes was toxic in preclinical species.',
          dependsOnStepId: 'lina-w3',
          reagentsAndBuffer:
            'Recombinant human DPP-4, DPP-8 and DPP-9, fluorogenic Gly-Pro-aminomethylcoumarin substrate, pre-incubation and jump-dilution protocols for off-rate determination, human plasma ex vivo DPP-4 activity assay',
        },
        {
          id: 'lina-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Trace the elimination route, because the route is the selling point',
          description:
            'The clinical claim distinguishing this molecule from its class is that the kidney is not its exit. That is a mass-balance measurement: after an oral radiolabelled dose in healthy subjects, about 85% of the radioactivity was recovered within four days, 80% through the enterohepatic system and 5% in urine. Everything the drug is chosen for in renal impairment rests on that number.',
          dependsOnStepId: 'lina-w4',
          reagentsAndBuffer:
            'Oral [14C]-linagliptin, scintillation counting of urine and faeces over four days, LC-MS/MS plasma assay for parent and the inactive metabolite, dedicated open-label pharmacokinetic study across creatinine clearance strata including below 30 mL/min',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lina-a1',
        category: 'failed',
        title: 'CARMELINA: a kidney trial, in kidney patients, with no kidney benefit',
        laymanSummary:
          'Nearly seven thousand people with diabetes at high kidney and cardiovascular risk were randomised for over two years. Kidney failure, kidney death or a sustained 40% loss of filtration occurred in 9.4% on the drug and 8.8% on placebo. Cardiovascular events were the same in both arms.',
        technicalDetails:
          'CARMELINA randomised 6,979 treated participants — 3,494 linagliptin and 3,485 placebo — with type 2 diabetes and high cardiovascular and renal risk. The primary composite of cardiovascular death, nonfatal myocardial infarction or nonfatal stroke occurred in 12.4% against 12.1%, hazard ratio 1.02 (95% CI 0.89 to 1.17), p<0.001 for non-inferiority against the prespecified margin. The secondary kidney composite of renal death, end-stage kidney disease or sustained 40% decline in eGFR occurred in 9.4% against 8.8%, hazard ratio 1.04 (95% CI 0.89 to 1.22, p=0.62). The registry lists 6,991 enrolled. This trial was designed and powered in a population enriched for renal disease, which is the population linagliptin is most often chosen for, and it returned a point estimate on the wrong side of unity for the kidney endpoint. The renal-dosing convenience is a pharmacokinetic property. It is not a kidney benefit, and CARMELINA is the trial that separates the two.',
        evidenceSource:
          'Rosenstock J, Perkovic V, Johansen OE, et al. JAMA 2019;321:69-79 (CARMELINA)',
        doi: '10.1001/jama.2018.18269',
        measuredMetric:
          'Composite of cardiovascular death, nonfatal myocardial infarction or nonfatal stroke, and a secondary composite of renal death, end-stage kidney disease or sustained 40% eGFR decline',
        auditFlag: 'verified',
      },
      {
        id: 'lina-a2',
        category: 'measured',
        title:
          'CAROLINA: against a sulphonylurea, no cardiovascular difference and a quarter of the hypos',
        laymanSummary:
          'Head to head against glimepiride in 6,033 people over more than six years, cardiovascular events were identical. Low blood sugar episodes were not: 10.6% against 37.7%.',
        technicalDetails:
          'CAROLINA randomised 6,033 treated participants — 3,023 linagliptin and 3,010 glimepiride — with relatively early type 2 diabetes and elevated cardiovascular risk. The primary composite of cardiovascular death, nonfatal myocardial infarction or nonfatal stroke gave a hazard ratio of 0.98 (95.47% CI 0.84 to 1.14), meeting non-inferiority. Hypoglycaemic adverse events occurred in 10.6% on linagliptin against 37.7% on glimepiride, hazard ratio 0.23 (95% CI 0.21 to 0.26). The registry lists 6,103 enrolled. This is the only active-comparator cardiovascular outcome trial in the DPP-4 class and it does two useful things at once: it establishes that a sulphonylurea does not carry the cardiovascular penalty that decades of observational data suggested, and it quantifies precisely what the newer drug buys — a four-fold reduction in hypoglycaemia and nothing measurable beyond it.',
        evidenceSource:
          'Rosenstock J, Kahn SE, Johansen OE, et al. JAMA 2019;322:1155-1166 (CAROLINA)',
        doi: '10.1001/jama.2019.13772',
        measuredMetric:
          'Composite of cardiovascular death, nonfatal myocardial infarction or nonfatal stroke, and hypoglycaemic adverse event rate, against glimepiride',
        auditFlag: 'verified',
      },
      {
        id: 'lina-a3',
        category: 'inferred',
        title: 'Not needing a kidney dose adjustment is not the same as protecting kidneys',
        laymanSummary:
          'The drug leaves the body through the bile rather than the kidneys, which is why the dose never changes however poor kidney function is. That is a convenience. It is repeatedly presented as though it made the drug kidney-friendly in a therapeutic sense, and its own trial says otherwise.',
        technicalDetails:
          'Section 12.3 of the label reports that after an oral [14C]-linagliptin dose, approximately 85% of the administered radioactivity was eliminated within four days, 80% via the enterohepatic system and 5% in urine, and that the majority — about 90% — is excreted unchanged, metabolism being a minor pathway. A dedicated open-label study across creatinine clearance strata down to below 30 mL/min supports the single 5 mg dose for all renal function. Every part of that is a measured pharmacokinetic fact and it genuinely simplifies prescribing in advanced kidney disease, where sitagliptin, saxagliptin and alogliptin all require dose reduction and where dosing errors are common. What it does not do is slow kidney disease: CARMELINA, in 6,979 patients selected for renal risk, gave a kidney composite hazard ratio of 1.04 (95% CI 0.89 to 1.22, p=0.62). Two distinct claims share one adjective, and only one of them has been measured.',
        evidenceSource:
          'TRADJENTA United States prescribing information, sections 12.3 and 8.6 (NDA 201280); Rosenstock J et al. JAMA 2019;321:69-79',
        doi: '10.1001/jama.2018.18269',
        inferredClaim:
          'That a drug requiring no renal dose adjustment is protective of the kidney — a slide from pharmacokinetic convenience to therapeutic benefit that the drug’s own renal outcome trial contradicts',
        auditFlag: 'contested',
      },
      {
        id: 'lina-a4',
        category: 'inferred',
        title: 'Another heart failure warning inherited from molecules that are not this one',
        laymanSummary:
          'The label warns about heart failure and says the observation came from two other drugs in the class. As with sitagliptin, that warning is a class inference rather than a finding about this molecule.',
        technicalDetails:
          'Section 5.6 reads that heart failure "has been observed with two other members of the DPP-4 inhibitor class" and directs considering risks and benefits in patients with known heart failure risk factors. The source is SAVOR-TIMI 53, where saxagliptin in 16,492 patients produced hospitalisation for heart failure at 3.5% against 2.8%, hazard ratio 1.27 (95% CI 1.07 to 1.51, p=0.007), together with a numerically similar finding for alogliptin. Sitagliptin’s dedicated trial reported a hazard ratio of exactly 1.00 for the same endpoint. A shared mechanism justifies a shared caution; it does not convert a sibling molecule’s result into a measurement on this one, and a page that reports the warning without naming its source has misdescribed the evidence.',
        evidenceSource:
          'TRADJENTA United States prescribing information, section 5.6 (NDA 201280); Scirica BM et al. N Engl J Med 2013;369:1317-1326 (SAVOR-TIMI 53)',
        doi: '10.1056/NEJMoa1307684',
        inferredClaim:
          'That linagliptin carries the heart failure risk observed with saxagliptin and alogliptin — a class-level inference, labelled as such by the label itself',
        auditFlag: 'caution',
      },
      {
        id: 'lina-a5',
        category: 'measured',
        title: 'A 200-hour half-life that has almost nothing to do with how long the drug lasts',
        laymanSummary:
          'The label quotes a terminal half-life of about 200 hours and an accumulation half-life of about 11. Both are correct. The long one measures how slowly the drug lets go of its target, not how long it stays in the body at doses that matter.',
        technicalDetails:
          'Section 12.3 reports a terminal half-life at steady state of about 200 hours and an accumulation half-life of about 11 hours, with renal clearance at steady state of approximately 70 mL/min. It also reports plasma protein binding that is concentration-dependent, falling from about 99% at 1 nmol/L to 75-89% at or above 30 nmol/L, explicitly reflecting saturation of binding to DPP-4 as concentration rises. The 200-hour terminal phase is the slow release of drug bound to its own target at very low concentrations; the 11-hour accumulation half-life governs the once-daily dosing interval. Absolute bioavailability is about 30% and a high-fat meal is not clinically relevant. This is included because a half-life is one of the most commonly quoted and most commonly misused numbers in pharmacology, and this molecule has two of them that differ eighteen-fold.',
        evidenceSource:
          'TRADJENTA United States prescribing information, section 12.3 (NDA 201280)',
        measuredMetric:
          'Terminal and accumulation half-lives, concentration-dependent plasma protein binding, and absolute bioavailability',
        auditFlag: 'verified',
      },
      {
        id: 'lina-a6',
        category: 'failed',
        title: 'Bullous pemphigoid, disabling joint pain, and fatal pancreatitis',
        laymanSummary:
          'The three uncommon harms that define this class are all on the label: a blistering skin disease that has needed hospital admission, joint pain severe enough to disable, and pancreatitis including fatal cases.',
        technicalDetails:
          'Section 5.1 records acute pancreatitis, including fatal pancreatitis, with prompt discontinuation directed if suspected, and the Limitations of Use state the drug has not been studied in patients with a history of pancreatitis. Section 5.4 records severe and disabling arthralgia, directing that the drug be considered as a possible cause of severe joint pain and discontinued if appropriate. Section 5.5 records reports of bullous pemphigoid requiring hospitalisation, directing patients to report blisters or erosions and the drug to be discontinued if it is suspected. Section 5.3 covers serious hypersensitivity including anaphylaxis, angioedema and exfoliative skin conditions. None of these is common, all are class effects rather than peculiar to linagliptin, and all three of the first group were identified after approval rather than in the registration programme — which is the usual and unavoidable pattern for adverse effects at these frequencies.',
        evidenceSource:
          'TRADJENTA United States prescribing information, Indications 1 Limitations of Use and Warnings and Precautions 5.1 to 5.5 (NDA 201280)',
        measuredMetric:
          'Labelled postmarketing adverse reactions and the actions the label directs on each',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A caffeine relative that blocks an enzyme',
        laymanDesc:
          'The molecule is built on a xanthine core — the same chemical family as caffeine — rather than the peptide-like scaffolds the other drugs in its class use. It binds its target enzyme very tightly and lets go very slowly.',
        molecularDetail:
          'A xanthine bearing butynyl, methylquinazolinylmethyl and (R)-3-aminopiperidinyl substituents; formula C25H28N8O2, molecular weight 472.50 g/mol, marketed as the free base at a single 5 mg strength. Slow off-rate target binding produces the concentration-dependent plasma protein binding recorded in section 12.3.',
        iconName: 'Coffee',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It leaves through the bile, not the kidney',
        laymanDesc:
          'About four fifths of a dose is excreted through the liver into the gut and out. Only about a twentieth leaves in urine, which is why the dose never changes with kidney function.',
        molecularDetail:
          'After an oral [14C] dose, approximately 85% of radioactivity was eliminated within four days — 80% via the enterohepatic system and 5% in urine — and about 90% of the drug is excreted unchanged, metabolism being a minor pathway with one pharmacologically inactive metabolite at 13.3% relative steady-state exposure. Absolute bioavailability about 30%.',
        iconName: 'Route',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'DPP-4 is occupied and the incretins survive',
        laymanDesc:
          'The enzyme that normally destroys the meal hormones is blocked, so those hormones stay active for much longer than the couple of minutes they would otherwise get.',
        molecularDetail:
          'Section 12.1: linagliptin is an inhibitor of DPP-4, the enzyme that degrades GLP-1 and GIP, thereby increasing concentrations of active incretin hormones. Binding is tight enough that plasma protein binding falls from 99% to 75-89% as DPP-4 itself saturates with rising concentration.',
        iconName: 'ShieldCheck',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Insulin rises, glucagon falls, but only when glucose is up',
        laymanDesc:
          'The surviving hormones tell the pancreas to release insulin and to stop releasing glucagon. Both effects depend on glucose actually being high, which is why the drug alone almost never causes a hypo.',
        molecularDetail:
          'GLP-1 and GIP increase insulin biosynthesis and secretion from beta cells in the presence of normal and elevated glucose; GLP-1 additionally reduces glucagon secretion from alpha cells, lowering hepatic glucose output. Section 5.2 directs considering a lower dose of an insulin secretagogue or insulin when initiating linagliptin, which is where the hypoglycaemia risk actually lives.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'A1c falls modestly, and hypos stay rare',
        laymanDesc:
          'The glucose effect is real and moderate. Its distinctive advantage is what it does not do: in the head-to-head trial against a sulphonylurea, hypoglycaemia was about a quarter as frequent.',
        molecularDetail:
          'CAROLINA, 6,033 treated participants over a median 6.3 years: hypoglycaemic adverse events 10.6% against 37.7% on glimepiride, hazard ratio 0.23 (95% CI 0.21 to 0.26), with the cardiovascular composite at 0.98 (95.47% CI 0.84 to 1.14). Not recommended in type 1 diabetes, where the label states it would not be effective.',
        iconName: 'ShieldOff',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And then two outcome trials that found nothing',
        laymanDesc:
          'Against placebo in high-risk patients, and against a sulphonylurea in earlier disease, cardiovascular events were identical. In the kidney-risk trial, kidney outcomes were identical too.',
        molecularDetail:
          'CARMELINA, 6,979 treated: primary cardiovascular composite 12.4% against 12.1%, HR 1.02 (95% CI 0.89 to 1.17); kidney composite 9.4% against 8.8%, HR 1.04 (0.89 to 1.22, p=0.62). CAROLINA, 6,033 treated: HR 0.98 (95.47% CI 0.84 to 1.14) against glimepiride. Both trials met non-inferiority and neither demonstrated benefit.',
        iconName: 'Scale',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CARMELINA (JAMA 2019;321:69-79)',
        phase:
          'Phase 3, randomised, double-blind, placebo-controlled cardiovascular and renal outcome trial',
        sampleSize: 6979,
        primaryEndpoint:
          'Non-inferiority for a composite of cardiovascular death, nonfatal myocardial infarction or nonfatal stroke, in type 2 diabetes with high cardiovascular and renal risk',
        endpointMet: true,
        statisticalPValue:
          '12.4% against 12.1%, hazard ratio 1.02 (95% CI 0.89 to 1.17), p<0.001 for non-inferiority',
        unreportedAdverseSignals:
          'The secondary kidney composite of renal death, end-stage kidney disease or sustained 40% eGFR decline was 9.4% against 8.8%, hazard ratio 1.04 (95% CI 0.89 to 1.22, p=0.62) — no renal benefit in a trial enriched for renal risk. The endpoint met was non-inferiority, not superiority. The registry lists 6,991 enrolled against 6,979 treated.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'CAROLINA (JAMA 2019;322:1155-1166)',
        phase: 'Phase 3, randomised, double-blind, active-comparator cardiovascular outcome trial',
        sampleSize: 6033,
        primaryEndpoint:
          'Non-inferiority to glimepiride for a composite of cardiovascular death, nonfatal myocardial infarction or nonfatal stroke, in type 2 diabetes with elevated cardiovascular risk',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 0.98 (95.47% CI 0.84 to 1.14) over a median 6.3 years; hypoglycaemic adverse events 10.6% against 37.7%, hazard ratio 0.23 (95% CI 0.21 to 0.26)',
        unreportedAdverseSignals:
          'A non-inferiority result against an active comparator, not a demonstration of benefit over it. The trial also establishes the opposite of what it is often quoted for: glimepiride showed no cardiovascular penalty against linagliptin. The registry lists 6,103 enrolled against 6,033 treated and analysed.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Cardiovascular composite 12.4% against 12.1%, hazard ratio 1.02 (95% CI 0.89 to 1.17), in 6,979 patients at high cardiovascular and renal risk',
        'Kidney composite 9.4% against 8.8%, hazard ratio 1.04 (95% CI 0.89 to 1.22, p=0.62), in the same trial',
        'Cardiovascular composite hazard ratio 0.98 (95.47% CI 0.84 to 1.14) against glimepiride in 6,033 patients over a median 6.3 years',
        'Hypoglycaemic adverse events 10.6% against 37.7% versus glimepiride, hazard ratio 0.23 (95% CI 0.21 to 0.26)',
        'About 85% of an oral radiolabelled dose eliminated within four days, 80% enterohepatically and 5% in urine, with roughly 90% excreted unchanged',
      ],
      unsupportedInferences: [
        'That a drug needing no renal dose adjustment protects the kidney — its own renal outcome trial returned a hazard ratio of 1.04',
        'That linagliptin reduces cardiovascular events, which two large trials, one placebo-controlled and one active-controlled, did not show',
        'That linagliptin carries the heart failure risk seen with saxagliptin and alogliptin, which the label itself attributes to those molecules',
        'That the 200-hour terminal half-life describes how long the drug persists at clinically relevant concentrations, when the accumulation half-life is about 11 hours',
      ],
      whatFailedInitially: [
        'The kidney composite in CARMELINA was numerically worse on the drug: 9.4% against 8.8%, p=0.62',
        'Neither outcome trial demonstrated superiority on any cardiovascular endpoint; both met non-inferiority only',
        'Bullous pemphigoid requiring hospitalisation, severe and disabling arthralgia, and fatal acute pancreatitis were all added to the label after approval',
        'The label states the drug is not recommended in type 1 diabetes because it would not be effective',
      ],
      realWorldOutcome: [
        'Approved in the United States in 2011 under NDA 201280; the only DPP-4 inhibitor requiring no dose adjustment at any level of renal function',
        'Listed at US$16.80 per tablet of pharmacy acquisition cost against US$3.58 for generic sitagliptin in the same CMS survey period',
        'CAROLINA is the only active-comparator cardiovascular outcome trial in the DPP-4 class, and it exonerated the sulphonylurea it was designed to beat',
        'Also marketed as JENTADUETO with metformin at US$8.45 per tablet and GLYXAMBI with empagliflozin at US$11.22',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, 5 mg once daily, with or without food',
      description:
        'A single strength for every patient: no dose adjustment for renal impairment at any level including dialysis, and none for hepatic impairment. Absolute bioavailability about 30%; a high-fat meal reduces peak concentration by 15% and increases exposure by 4%, which the label describes as not clinically relevant. Apparent volume of distribution at steady state about 1,110 L, indicating extensive tissue distribution.',
      safetyProfile:
        'No boxed warning. Labelled warnings: acute pancreatitis including fatal pancreatitis, with prompt discontinuation if suspected; hypoglycaemia when combined with an insulin secretagogue or insulin, with a lower dose of the partner drug to be considered; serious hypersensitivity reactions including anaphylaxis, angioedema and exfoliative skin conditions; severe and disabling arthralgia, to be considered as a cause of severe joint pain and the drug discontinued if appropriate; bullous pemphigoid requiring hospitalisation, with patients told to report blisters or erosions; and heart failure, observed with two other members of the DPP-4 inhibitor class. Not recommended in type 1 diabetes, where the label states it would not be effective, and not studied in patients with a history of pancreatitis.',
    },
    commonQuestions: [
      {
        q: 'I was told this one is better for my kidneys. Is that right?',
        a: 'It is better for prescribing in kidney disease, which is not the same thing. About 85% of a dose leaves through the bile and bowel and only about 5% in urine, so the dose stays at 5 mg however poor kidney function is — including on dialysis — while sitagliptin, saxagliptin and alogliptin all need reducing. That removes a common source of dosing error. Whether it slows kidney disease was tested directly: CARMELINA randomised 6,979 people selected for high renal risk and the composite of kidney failure, kidney death or a sustained 40% loss of filtration occurred in 9.4% on linagliptin and 8.8% on placebo, a hazard ratio of 1.04 (95% CI 0.89 to 1.22, p=0.62). Convenience in renal impairment, yes. Kidney protection, no.',
        auditNote:
          'One adjective, two claims. The pharmacokinetic one is measured and the therapeutic one was tested and not found.',
      },
      {
        q: 'Does it protect my heart?',
        a: 'It has not been shown to, and this drug has more evidence on that question than most. CARMELINA compared it with placebo in 6,979 high-risk patients: cardiovascular death, heart attack or stroke in 12.4% against 12.1%, hazard ratio 1.02. CAROLINA compared it head to head with glimepiride in 6,033 patients over a median six and a bit years: hazard ratio 0.98 (95.47% CI 0.84 to 1.14). Both trials were designed to show the drug was not worse by more than a set margin, and both succeeded at that and nothing further. If cardiovascular protection is the aim, the classes with positive superiority trials are different ones.',
      },
      {
        q: 'How does it compare with an old sulphonylurea like glimepiride?',
        a: 'That comparison has actually been run, which is unusual. In CAROLINA, cardiovascular events were the same — hazard ratio 0.98, with a confidence interval from 0.84 to 1.14. What differed was hypoglycaemia: 10.6% of the linagliptin group had a hypoglycaemic adverse event against 37.7% of the glimepiride group, a hazard ratio of 0.23. So the newer drug buys about a four-fold reduction in low blood sugar episodes, and in this trial it bought nothing else. The trial also settled an older argument in the sulphonylurea’s favour: decades of observational data had suggested sulphonylureas raise cardiovascular risk, and the randomised comparison did not find that.',
        auditNote:
          'An active-comparator outcome trial is rare and valuable precisely because it tells you the size of what the newer drug adds, in the same units.',
      },
      {
        q: 'The label says the half-life is 200 hours. Why is it taken every day?',
        a: 'Because the 200-hour figure is not measuring what most people assume. The label reports a terminal half-life of about 200 hours and an accumulation half-life of about 11 hours. The long terminal phase is the drug slowly detaching from DPP-4 itself at very low concentrations — the same tight binding that makes plasma protein binding fall from 99% to 75-89% as the target saturates. The 11-hour figure is the one that governs how much drug builds up on repeated dosing, and it is why the interval is daily. Two correct numbers, eighteen-fold apart, measuring different things.',
      },
      {
        q: 'Why is it so much more expensive than sitagliptin?',
        a: 'Because sitagliptin is generic and linagliptin is not. In the most recent CMS acquisition-cost survey, generic sitagliptin is listed at a median US$3.58 per 100 mg tablet and branded TRADJENTA at US$16.80 per 5 mg tablet, for drugs of the same class with comparable A1c effect and equally null cardiovascular outcome trials. What the price difference buys is the renal-dosing property, which matters most for people with advanced kidney disease and matters little for people without it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Rosenstock J, Perkovic V, Johansen OE, et al. Effect of linagliptin vs placebo on major cardiovascular events in adults with type 2 diabetes and high cardiovascular and renal risk: the CARMELINA randomized clinical trial. JAMA 2019;321:69-79',
        identifier: '10.1001/jama.2018.18269',
        kind: 'doi',
      },
      {
        label:
          'Rosenstock J, Kahn SE, Johansen OE, et al. Effect of linagliptin vs glimepiride on major adverse cardiovascular outcomes in patients with type 2 diabetes: the CAROLINA randomized clinical trial. JAMA 2019;322:1155-1166',
        identifier: '10.1001/jama.2019.13772',
        kind: 'doi',
      },
      {
        label: 'ClinicalTrials.gov record for CARMELINA, 6,991 participants enrolled',
        identifier: 'NCT01897532',
        kind: 'nct',
      },
      {
        label: 'ClinicalTrials.gov record for CAROLINA, 6,103 participants enrolled',
        identifier: 'NCT01243424',
        kind: 'nct',
      },
      {
        label:
          'Scirica BM, Bhatt DL, Braunwald E, et al. Saxagliptin and cardiovascular outcomes in patients with type 2 diabetes mellitus. N Engl J Med 2013;369:1317-1326 (SAVOR-TIMI 53), the source of the class heart failure warning',
        identifier: '10.1056/NEJMoa1307684',
        kind: 'doi',
      },
      {
        label:
          'TRADJENTA (linagliptin) United States prescribing information — Indications 1 and Limitations of Use, Dosage 2.1, Warnings and Precautions 5.1 to 5.6, Clinical Pharmacology 12.1 and 12.3, Use in Specific Populations 8.6 (NDA 201280)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=201280',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost, 2026 file — NDC descriptions TRADJENTA, JENTADUETO, GLYXAMBI and SITAGLIPTIN PHOSPHATE',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 7. Methimazole — a 1950 drug whose label still does not name its molecular target, and which
  //    is teratogenic in the trimester when hyperthyroidism most needs treating.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'methimazole',
    name: 'Methimazole',
    tradeName: 'Tapazole',
    sponsor:
      'King Pharmaceuticals holds the Tapazole application (NDA 007517); the drug is now dispensed almost entirely as generics under multiple ANDAs',
    targetGene: 'TPO',
    targetProtein:
      'Thyroid peroxidase — the heme enzyme that iodinates thyroglobulin tyrosines and couples them into thyroxine. Named in the pharmacological literature rather than in the United States label, which says only that the drug inhibits the synthesis of thyroid hormones',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1950,
    indication:
      'In patients with Graves’ disease with hyperthyroidism or toxic multinodular goitre for whom surgery or radioactive iodine therapy is not an appropriate treatment option; and to ameliorate symptoms of hyperthyroidism in preparation for thyroidectomy or radioactive iodine therapy',
    patientFriendlyIndication: 'Overactive thyroid',
    anatomicalSite: 'Apical membrane of the thyroid follicular cell, at the colloid interface',
    conditionContext: {
      conditionExplainer:
        'In Graves’ disease the immune system makes an antibody that mimics the pituitary hormone TSH and jams the thyroid switch permanently on. The gland then produces thyroid hormone continuously, and the body runs fast: weight loss, tremor, palpitations, heat intolerance, atrial fibrillation. Methimazole does not touch the antibody. It stops the gland manufacturing new hormone.',
      whyItMatters:
        'This is one of very few drugs in common use that treats an autoimmune disease by blocking the target organ rather than the immune attack, and everything odd about it follows from that. It does not work immediately, because the gland already holds weeks of stored hormone. It does not cure anything, because the antibody is untouched. And it is teratogenic in the first trimester, which is precisely when the disease most needs controlling.',
      whoTakesThis:
        'People with Graves’ disease or toxic multinodular goitre, and people being prepared for thyroid surgery or radioiodine. The current United States label frames it as the option for those in whom surgery or radioiodine is not appropriate — a narrower framing than practice in much of the world.',
      clinicalGoals:
        'A normal free thyroxine and, eventually, a normal thyrotropin. Both are surrogates for the symptoms and for the cardiac and bone consequences of untreated thyrotoxicosis. The endpoint most patients care about — lasting remission after stopping — depends heavily on how long the drug is continued.',
    },
    oneSentenceVerdict:
      'A 1950 thionamide that blocks thyroid hormone synthesis by inhibiting thyroid peroxidase — a target its own United States label never names — producing agranulocytosis in about 0.11% of 50,385 treated Graves’ patients at a median 69 days, and birth defects in 9.1% of first-trimester-exposed Danish children against 5.7% unexposed (adjusted OR 1.66, 95% CI 1.35 to 2.04); continuing it for five to ten years rather than eighteen months cut relapse from 53% to 15% in a 258-patient randomised trial.',
    laymanHowItWorks:
      'Your thyroid builds its hormone by attaching iodine onto a large protein and then joining the iodinated pieces together. A single enzyme does both jobs, and methimazole blocks it. New hormone stops being made. What is already stored inside the gland — several weeks’ worth — carries on being released, which is why the drug takes weeks rather than days to work and why a beta-blocker is often used alongside it at the start to control the symptoms in the meantime. It does nothing to the antibody that caused the problem, so when the drug stops, the disease may simply resume.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 77,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0707 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 31 listed generic products at 5 mg and 10 mg, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved as Tapazole under NDA 007517 and off patent for decades; every product in the current CMS acquisition-cost file is a generic. At seven United States cents a tablet it is among the least expensive drugs in this file, and the cost of treating Graves’ disease with it is dominated by the blood tests rather than the drug.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'There are only three treatments for Graves’ disease — the drug, radioiodine and surgery — and the choice between them has moved twice in twenty years. Radioiodine became less attractive after a 2019 analysis of a cohort followed since 1946 found a dose-dependent association with solid cancer mortality; long-term low-dose antithyroid drug therapy became more attractive after a randomised trial cut relapse from 53% to 15%.',
      conventionalRx: [
        {
          name: 'Propylthiouracil',
          class: 'Thionamide antithyroid drug',
          howItCompares:
            'The same mechanism plus a peripheral block on conversion of thyroxine to the more active triiodothyronine. It carries a boxed warning for severe liver injury including fatal cases and is reserved for the first trimester of pregnancy, thyroid storm, and intolerance of methimazole. In the Danish cohort its first-trimester birth-defect prevalence was 8.0% against 9.1% for methimazole and 5.7% unexposed.',
          typicalCost:
            'US$0.2701 per 50 mg tablet at United States pharmacy acquisition cost (CMS NADAC, median across 8 listed products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: less severe and differently patterned teratogenicity, and it blocks peripheral T4-to-T3 conversion. Cons: a boxed hepatotoxicity warning, three-times-daily dosing, and it is nearly four times the price.',
        },
        {
          name: 'Radioactive iodine (iodine-131)',
          class: 'Definitive ablative therapy',
          howItCompares:
            'Destroys thyroid tissue and usually cures the hyperthyroidism by producing hypothyroidism, which is then treated for life with levothyroxine. In 18,805 patients followed from 1946 in the Cooperative Thyrotoxicosis Therapy Follow-up Study, the relative risk of all solid cancer mortality was 1.06 (95% CI 1.02 to 1.10) per 100 mGy to the stomach and of female breast cancer mortality 1.12 (95% CI 1.003 to 1.32) per 100 mGy to the breast.',
          typicalCost: 'A single procedural course rather than a per-tablet price',
          prosAndCons:
            'Pros: definitive, one treatment, no daily adherence. Cons: a dose-dependent association with solid cancer mortality in the longest cohort available; permanent hypothyroidism; can worsen Graves’ eye disease; contraindicated in pregnancy.',
        },
        {
          name: 'Thyroidectomy',
          class: 'Surgery',
          howItCompares:
            'Immediate and definitive, and the option when the gland is very large, when there is a suspicious nodule, or in moderate-to-severe eye disease. Methimazole is used beforehand to render the patient euthyroid, which is one of the two indications actually printed on its label.',
          typicalCost: 'A single surgical episode rather than a per-tablet price',
          prosAndCons:
            'Pros: immediate cure, no radiation. Cons: recurrent laryngeal nerve injury and hypoparathyroidism, general anaesthesia, and lifelong levothyroxine.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'A fever or a sore throat is an emergency until proven otherwise',
          action:
            'Stop nothing on your own, but seek a same-day full blood count for any fever or sore throat while taking this drug.',
          patientImpact:
            'The label directs patients to report immediately any symptom suggestive of agranulocytosis, such as fever or sore throat. In 50,385 Graves’ patients, 50 developed agranulocytosis at a median 69 days from starting, range 11 to 233 days. Untreated agranulocytosis kills through overwhelming infection.',
          clinicalPrecaution:
            'The label directs discontinuation in the presence of agranulocytosis or aplastic anaemia and monitoring of bone marrow indices. Leukopenia, thrombocytopenia and aplastic anaemia may also occur.',
        },
        {
          name: 'Do not start or continue it in early pregnancy without advice',
          action:
            'Tell the prescriber immediately if you are pregnant or planning to be, before the first trimester rather than after it.',
          patientImpact:
            'The label states methimazole crosses the placental membranes and can cause fetal harm in the first trimester, listing aplasia cutis, choanal atresia, facial dysmorphism, oesophageal atresia with or without tracheo-oesophageal fistula, omphalocele and omphalomesenteric duct abnormalities. In the Danish nationwide cohort of 817,093 live-born children, birth defects occurred in 9.1% of methimazole-exposed against 5.7% unexposed, adjusted odds ratio 1.66 (95% CI 1.35 to 2.04).',
          clinicalPrecaution:
            'The label also records that untreated or inadequately treated Graves’ disease in pregnancy carries increased risk of maternal heart failure, miscarriage, preterm birth, stillbirth and fetal or neonatal hyperthyroidism. Neither treating nor not treating is free, and the label suggests switching back to methimazole for the second and third trimesters given propylthiouracil’s hepatotoxicity.',
        },
        {
          name: 'Yellow eyes or dark urine means stop and be seen',
          action:
            'Report jaundice, dark urine, pale stools or right upper abdominal pain promptly.',
          patientImpact:
            'The label records hepatotoxicity including acute liver failure with methimazole, and hepatitis in which jaundice may persist for several weeks after the drug is stopped. Methimazole hepatotoxicity is typically cholestatic where propylthiouracil’s is hepatocellular.',
          clinicalPrecaution:
            'Other major reactions on the label include a lupus-like syndrome, insulin autoimmune syndrome that can cause hypoglycaemic coma, periarteritis, hypoprothrombinaemia, rare nephritis, postmarketing acute pancreatitis, and ANCA-associated vasculitis with severe complications.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1C=CNC1=S',
      chemicalFormula: 'C4H6N2S',
      molecularWeight: '114.17 g/mol',
      targetReceptorAffinity:
        'The label describes it as 1-methylimidazole-2-thiol, a white crystalline substance freely soluble in water, and notes that it differs chemically from the thiouracil series primarily in having a five- rather than a six-membered ring. The pharmacologically active form is the thione tautomer drawn here; the sulphur is what the enzyme oxidises instead of iodide, and it is what the whole class is built around. At 114 g/mol this is one of the smallest drug molecules in routine clinical use, roughly a fiftieth the mass of the insulin on the first page of this file.',
      structureSource: {
        label:
          'PubChem CID 1349907 (methimazole) — canonical SMILES, molecular formula and weight, as carried on the enriched record; chemical description from the methimazole tablets USP label, Description section',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1349907',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mmi-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Establish which tautomer and which ring size you have',
          description:
            'Methimazole exists as a thione and a thiol tautomer, and the label’s own definition of the drug turns on ring size — five-membered imidazole rather than the six-membered pyrimidine of the thiouracils. Both are identity questions that a melting point will not answer and that determine whether the material is this drug or its sibling class.',
          reagentsAndBuffer:
            'Methimazole USP reference standard, 1H and 13C NMR in DMSO-d6 to resolve the tautomer, infrared spectroscopy for the C=S stretch, HPLC with ultraviolet detection for related substances, melting point and loss on drying',
        },
        {
          id: 'mmi-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Close the imidazole ring around a sulphur',
          description:
            'The molecule is small enough that the synthesis is a single ring-forming condensation: an aminoacetaldehyde equivalent, a methylamine source and a thiocyanate or thiourea component cyclise to the 2-mercapto-1-methylimidazole. There is no stereochemistry, no protecting group strategy and no chromatography — which is why this drug costs seven cents.',
          dependsOnStepId: 'mmi-w1',
          reagentsAndBuffer:
            'Aminoacetaldehyde dimethyl acetal, methyl isothiocyanate or potassium thiocyanate, aqueous acid for cyclisation, activated carbon treatment, recrystallisation from water or ethanol',
        },
        {
          id: 'mmi-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallise from water and control the sulphur-oxidised impurities',
          description:
            'The molecule is freely soluble in water, so recrystallisation is straightforward and is the only purification needed. The impurities that matter are oxidation products at the sulphur — disulphides and sulphonates — which form on storage as readily as in the reactor and which are pharmacologically inert.',
          dependsOnStepId: 'mmi-w2',
          reagentsAndBuffer:
            'Recrystallisation from water or aqueous ethanol under nitrogen, HPLC for sulphur-oxidation related substances, packaging under controlled humidity, accelerated stability at 40°C/75% relative humidity',
        },
        {
          id: 'mmi-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Measure thyroid peroxidase inhibition, since the label will not name the target',
          description:
            'The United States label says only that the drug inhibits the synthesis of thyroid hormones, does not inactivate existing thyroxine or triiodothyronine, and does not interfere with administered hormone. The molecular target — thyroid peroxidase — comes from the pharmacological literature. The assay that establishes it directly is peroxidase-catalysed iodination and coupling, run with and without drug.',
          dependsOnStepId: 'mmi-w3',
          reagentsAndBuffer:
            'Purified human or porcine thyroid peroxidase, hydrogen peroxide, radiolabelled iodide, thyroglobulin or a tyrosine surrogate as acceptor, guaiacol oxidation assay as the peroxidase activity control, drug pre-incubation series to distinguish reversible from mechanism-based inhibition',
        },
        {
          id: 'mmi-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Then measure the delay the stored hormone imposes',
          description:
            'Enzyme inhibition is immediate and the clinical effect is not, because the follicular colloid holds weeks of finished hormone. Anything characterising this drug has to measure both: the block on synthesis and the lag before circulating free thyroxine responds. Judging efficacy by an early thyroid function test is the commonest error this pharmacology produces.',
          dependsOnStepId: 'mmi-w4',
          reagentsAndBuffer:
            'Serial free thyroxine, total triiodothyronine and thyrotropin immunoassays, thyrotropin receptor antibody assay for the underlying autoimmunity, radioiodine uptake as an orthogonal measure of glandular trapping',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mmi-a1',
        category: 'inferred',
        title: 'The label never names the enzyme the drug inhibits',
        laymanSummary:
          'Every textbook says methimazole blocks thyroid peroxidase. The United States prescribing information says only that it inhibits the synthesis of thyroid hormones — the target is nowhere in the document.',
        technicalDetails:
          'The Clinical Pharmacology section reads, in full: "Methimazole inhibits the synthesis of thyroid hormones and thus is effective in the treatment of hyperthyroidism. The drug does not inactivate existing thyroxine and triiodothyronine that are stored in the thyroid or circulating in the blood nor does it interfere with the effectiveness of thyroid hormones given by mouth or by injection. Methimazole is readily absorbed in the gastrointestinal tract, metabolized in the liver, and excreted in the urine." That is the whole of it. Thyroid peroxidase is not mentioned, nor is iodination, nor coupling. The mechanism is well established in the pharmacological literature — the thionamide sulphur is oxidised by the peroxidase in place of iodide, blocking both organification and coupling — but it is not what the regulator has approved as the description of this drug. That is unremarkable for a 1950 approval and it is worth stating plainly, because "the label says" and "the textbook says" are different claims and this page distinguishes them everywhere else.',
        evidenceSource:
          'Methimazole tablets USP United States prescribing information, Clinical Pharmacology section (ANDA 040547 and ANDA 040350); Tapazole originally approved under NDA 007517',
        inferredClaim:
          'That methimazole acts by inhibiting thyroid peroxidase — established in the pharmacological literature and absent from the United States label, which states only that it inhibits hormone synthesis',
        auditFlag: 'caution',
      },
      {
        id: 'mmi-a2',
        category: 'measured',
        title: 'Agranulocytosis in about one in a thousand, at a median of 69 days',
        laymanSummary:
          'In 50,385 people treated for Graves’ disease, 50 lost their infection-fighting white cells and 5 lost all blood cell lines. It happened at a median of ten weeks in, and the study could not identify who was at risk.',
        technicalDetails:
          'A retrospective cohort of 50,385 patients with Graves’ disease diagnosed between January 1983 and December 2002 identified 55 with documented haematopoietic damage: 50 agranulocytosis (0.11%) and 5 pancytopenia (0.01%). Median interval from starting antithyroid drug therapy to agranulocytosis was 69 days (range 11 to 233) and to pancytopenia 41 days (range 32 to 97). The authors state explicitly that the study failed to identify risk factors for antithyroid drug-induced haematopoietic damage. That last sentence is the operationally important one: because no risk factor was found, no patient can be reassured in advance, which is why the labelled instruction is behavioural — report fever or sore throat immediately — rather than a screening schedule. Routine white cell monitoring has never been shown to prevent these events, because they develop faster than any practical monitoring interval.',
        evidenceSource:
          'Watanabe N, Narimatsu H, Noh JY, et al. J Clin Endocrinol Metab 2012;97:E49-E53',
        doi: '10.1210/jc.2011-2221',
        measuredMetric:
          'Incidence and time to onset of antithyroid drug-induced agranulocytosis and pancytopenia in a 50,385-patient cohort',
        auditFlag: 'verified',
      },
      {
        id: 'mmi-a3',
        category: 'failed',
        title: 'It causes birth defects in the trimester the disease most needs treating',
        laymanSummary:
          'In a Danish study of 817,093 births, birth defects occurred in 9.1% of children exposed to methimazole in early pregnancy against 5.7% of unexposed children. Some of the specific malformations were more than twenty times more common.',
        technicalDetails:
          'The Danish nationwide cohort of 817,093 live-born children between 1996 and 2008 found birth defect prevalence of 9.1% with methimazole or carbimazole exposure in early pregnancy (adjusted OR 1.66, 95% CI 1.35 to 2.04), 8.0% with propylthiouracil (adjusted OR 1.41, 95% CI 1.03 to 1.92), 10.1% in mothers who switched between them (adjusted OR 1.82, 95% CI 1.08 to 3.07), and 5.7% in never-exposed children. The malformations characteristic of methimazole gave a combined adjusted odds ratio of 21.8 (95% CI 13.4 to 35.4). The label lists the pattern: aplasia cutis, facial dysmorphism and choanal atresia, oesophageal atresia with or without tracheo-oesophageal fistula, omphalocele and omphalomesenteric duct abnormalities. The trap is that the alternative is not safety: the same label records that untreated or inadequately treated Graves’ disease in pregnancy increases maternal heart failure, spontaneous abortion, preterm birth, stillbirth and fetal or neonatal hyperthyroidism, and the switched-drug group in the Danish data had the highest defect rate of all. Every available option in the first trimester carries a measured harm.',
        evidenceSource:
          'Andersen SL, Olsen J, Wu CS, Laurberg P. Birth defects after early pregnancy use of antithyroid drugs: a Danish nationwide study. J Clin Endocrinol Metab 2013;98:4373-4381; methimazole tablets USP label, Warnings',
        doi: '10.1210/jc.2013-2831',
        measuredMetric:
          'Prevalence of birth defects by first-trimester antithyroid drug exposure in 817,093 live-born children',
        auditFlag: 'caution',
      },
      {
        id: 'mmi-a4',
        category: 'conclusion_shift',
        title: 'Eighteen months was never the right length, and a trial showed it',
        laymanSummary:
          'For decades the rule was twelve to eighteen months of treatment and then stop, with roughly half relapsing. A randomised trial that kept people on a low dose for five to ten years cut relapse from 53% to 15%, and found almost no new side effects after the first eighteen months.',
        technicalDetails:
          'Azizi and colleagues enrolled 302 consecutive patients with untreated first episodes of Graves’ hyperthyroidism. After 18 to 24 months of methimazole, 258 (85.4%) were randomised to a further 36 to 102 months — total scheduled 60 to 120 months — or to discontinuation. Within 48 months of methimazole withdrawal, hyperthyroidism recurred in 15% (18 of 119) of the long-term group against 53% (65 of 123) of the conventional group. Adverse reactions clustered entirely in the first 18 months: 14 cutaneous reactions and 2 liver enzyme elevations, with no further methimazole-related reactions observed despite continued therapy for up to 118 additional months. That temporal pattern matters as much as the relapse figure, because the historical argument for stopping at 18 months was cumulative toxicity, and this trial found the toxicity is front-loaded rather than cumulative. It is a single trial in one centre with an open design, and it has changed how the question is framed rather than settling it.',
        evidenceSource:
          'Azizi F, Amouzegar A, Tohidi M, et al. Increased remission rates after long-term methimazole therapy in patients with Graves’ disease: results of a randomized clinical trial. Thyroid 2019;29:1192-1200',
        doi: '10.1089/thy.2019.0180',
        measuredMetric:
          'Recurrence of hyperthyroidism within 48 months of withdrawal, after 18-24 months against 60-120 months of methimazole',
        auditFlag: 'verified',
      },
      {
        id: 'mmi-a5',
        category: 'conclusion_shift',
        title: 'The alternative got worse: radioiodine and cancer mortality',
        laymanSummary:
          'Radioactive iodine was for decades the default American treatment and the reason methimazole was often framed as a stopgap. A 2019 analysis of patients followed since 1946 found a dose-dependent association between the radiation dose and dying of cancer.',
        technicalDetails:
          'The Cooperative Thyrotoxicosis Therapy Follow-up Study, extended by 24 years and covering 18,805 patients treated with radioactive iodine who had no cancer history at first treatment, followed for nearly seven decades from 1946, reported a relative risk of all solid cancer mortality of 1.06 (95% CI 1.02 to 1.10) at a 100 mGy dose to the stomach and of female breast cancer mortality of 1.12 (95% CI 1.003 to 1.32) at a 100 mGy dose to the breast. The effects are small per unit dose, the study is observational, and the treatment doses used decades ago differ from those used now. What it changed was the balance of the choice: methimazole’s label still describes it as the option for patients in whom radioiodine or surgery is not appropriate, while the evidence base for the alternatives moved underneath that framing. Read alongside the long-term methimazole trial, the two findings push in the same direction and neither was available when the treatment algorithm was written.',
        evidenceSource:
          'Kitahara CM, Berrington de Gonzalez A, Bouville A, et al. Association of radioactive iodine treatment with cancer mortality in patients with hyperthyroidism. JAMA Intern Med 2019;179:1034-1042',
        doi: '10.1001/jamainternmed.2019.0981',
        inferredClaim:
          'That definitive radioiodine therapy is the preferable default and antithyroid drug therapy a temporising measure — a positioning built before the long-term cohort and the long-term drug trial reported',
        auditFlag: 'contested',
      },
      {
        id: 'mmi-a6',
        category: 'failed',
        title: 'It does not treat the disease, only the gland',
        laymanSummary:
          'Graves’ disease is caused by an antibody. Methimazole does nothing to that antibody. It stops the gland responding, and when the drug is withdrawn the disease is still there in about half of people.',
        technicalDetails:
          'The label states the drug inhibits the synthesis of thyroid hormones, does not inactivate stored or circulating thyroxine and triiodothyronine, and does not interfere with administered hormone. It says nothing about the thyrotropin receptor antibody that drives Graves’ disease, because it does nothing to it. Three consequences follow directly. First, onset is slow: the follicular colloid holds weeks of finished hormone that continues to be released after synthesis stops. Second, relapse after withdrawal is the expected outcome rather than a failure of the drug — 53% within 48 months in the conventional arm of the randomised trial above. Third, the predictors of relapse identified in that trial are markers of the autoimmunity and the host rather than of the drug: older age, higher triiodothyronine or thyrotropin receptor antibody concentrations, lower thyrotropin, and the rs1879877 CD28 and DQB1-05 HLA polymorphisms. A drug that suppresses an endpoint without touching the cause is a legitimate therapy and it should not be described as a cure.',
        evidenceSource:
          'Methimazole tablets USP label, Clinical Pharmacology section; Azizi F et al. Thyroid 2019;29:1192-1200',
        doi: '10.1089/thy.2019.0180',
        measuredMetric:
          'Recurrence rate after drug withdrawal, and the immunological and genetic predictors of that recurrence',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One of the smallest drugs in the pharmacopoeia',
        laymanDesc:
          'Methimazole is tiny — a five-membered ring carrying a sulphur atom, and little else. That sulphur is the entire active principle.',
        molecularDetail:
          '1-methylimidazole-2-thiol, formula C4H6N2S, molecular weight 114.17, freely soluble in water. The label defines it against the thiouracils by ring size: five-membered rather than six. It is readily absorbed from the gastrointestinal tract, metabolised in the liver and excreted in the urine.',
        iconName: 'Atom',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It concentrates in the thyroid itself',
        laymanDesc:
          'The drug accumulates in the gland it acts on, which is why a small daily dose can shut down an organ working at full tilt.',
        molecularDetail:
          'Thionamides are concentrated within the thyroid follicular cell, so intrathyroidal concentration considerably exceeds plasma concentration. This is the reason the duration of the biological effect outlasts the short plasma half-life and the basis for once-daily dosing at maintenance, which the pharmacological literature establishes rather than the label.',
        iconName: 'Crosshair',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The sulphur is oxidised in place of iodide',
        laymanDesc:
          'The gland uses an enzyme to activate iodine before attaching it to protein. The drug offers its own sulphur to that enzyme instead, and iodine never gets activated.',
        molecularDetail:
          'Thyroid peroxidase, a heme enzyme at the apical membrane, oxidises iodide with hydrogen peroxide before organification. The thionamide sulphur is oxidised preferentially, blocking both iodination of thyroglobulin tyrosines and the coupling of iodotyrosines into thyroxine and triiodothyronine. This is the mechanism in the pharmacological literature; the United States label states only that hormone synthesis is inhibited.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'New hormone stops; stored hormone does not',
        laymanDesc:
          'The gland holds weeks of finished hormone in storage. That keeps being released after the factory has been switched off, which is why nothing seems to happen for the first few weeks.',
        molecularDetail:
          'The label is explicit: the drug does not inactivate existing thyroxine and triiodothyronine stored in the thyroid or circulating in the blood, nor does it interfere with the effectiveness of thyroid hormones given by mouth or by injection. Colloid stores account for the lag between enzyme inhibition, which is immediate, and biochemical response, which takes weeks.',
        iconName: 'Hourglass',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The antibody is untouched throughout',
        laymanDesc:
          'The cause of Graves’ disease is an antibody stimulating the thyroid. Nothing in this mechanism affects it. The gland is silenced; the disease continues.',
        molecularDetail:
          'No step in the thionamide mechanism involves the thyrotropin receptor antibody. Relapse after withdrawal was 53% within 48 months in the conventional arm of the randomised trial, and its predictors were higher thyrotropin receptor antibody and triiodothyronine, lower thyrotropin, older age, and the rs1879877 CD28 and DQB1-05 HLA polymorphisms — all markers of the autoimmune process rather than of drug failure.',
        iconName: 'ShieldOff',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Two rare harms, both arriving on their own schedule',
        laymanDesc:
          'Loss of white cells, at a median of ten weeks. Liver injury. And in early pregnancy, a distinct pattern of birth defects. None is common; all are on the label.',
        molecularDetail:
          'Agranulocytosis 0.11% and pancytopenia 0.01% in 50,385 Graves’ patients, median onset 69 and 41 days respectively, with no identified risk factors. Hepatotoxicity including acute liver failure, typically cholestatic. First-trimester birth defects at 9.1% against 5.7% unexposed, adjusted OR 1.66 (95% CI 1.35 to 2.04), with a characteristic malformation pattern at a combined adjusted OR of 21.8 (13.4 to 35.4).',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Long-term methimazole in Graves’ disease (Thyroid 2019;29:1192-1200)',
        phase: 'Randomised clinical trial, open-label, single centre',
        sampleSize: 258,
        primaryEndpoint:
          'Recurrence of hyperthyroidism within 48 months of methimazole withdrawal, after 60-120 months of therapy against the conventional 18-24 months',
        endpointMet: true,
        statisticalPValue:
          'Recurrence 15% (18 of 119) in the long-term group against 53% (65 of 123) in the conventional group, within 48 months of withdrawal',
        unreportedAdverseSignals:
          'Adverse reactions were confined to the first 18 months — 14 cutaneous reactions and 2 liver enzyme elevations — with no further methimazole-related reactions during up to 118 additional months of therapy. Single centre, open label, and 302 enrolled with 258 randomised, so the result needs replication before it is treated as settled.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Antithyroid drug-induced haematopoietic damage cohort (J Clin Endocrinol Metab 2012;97:E49-E53)',
        phase: 'Retrospective cohort study, not randomised',
        sampleSize: 50385,
        primaryEndpoint:
          'Incidence and timing of agranulocytosis and pancytopenia in patients with Graves’ disease treated with antithyroid drugs, 1983 to 2002',
        endpointMet: true,
        statisticalPValue:
          '50 agranulocytosis (0.11%) and 5 pancytopenia (0.01%) among 50,385 patients; median onset 69 days (range 11 to 233) and 41 days (range 32 to 97) respectively',
        unreportedAdverseSignals:
          'The study failed to identify risk factors for antithyroid drug-induced haematopoietic damage, which is why the labelled precaution is symptom reporting rather than scheduled monitoring. Retrospective and single-country, so ascertainment of milder cases is incomplete.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Danish nationwide birth defects cohort (J Clin Endocrinol Metab 2013;98:4373-4381)',
        phase: 'Nationwide register-based cohort study, not randomised',
        sampleSize: 817093,
        primaryEndpoint:
          'Prevalence of birth defects in live-born children by maternal antithyroid drug exposure in early pregnancy, 1996 to 2008',
        endpointMet: true,
        statisticalPValue:
          'Methimazole or carbimazole 9.1% (adjusted OR 1.66, 95% CI 1.35 to 2.04); propylthiouracil 8.0% (adjusted OR 1.41, 95% CI 1.03 to 1.92); switched between them 10.1% (adjusted OR 1.82, 95% CI 1.08 to 3.07); never exposed 5.7%',
        unreportedAdverseSignals:
          'The group that switched drugs in early pregnancy had the highest defect prevalence of all, which complicates the standard advice to switch. Characteristic methimazole malformations gave a combined adjusted OR of 21.8 (95% CI 13.4 to 35.4). Register-based and observational, with confounding by indication not fully excluded.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Agranulocytosis in 0.11% and pancytopenia in 0.01% of 50,385 Graves’ patients, at median onsets of 69 and 41 days',
        'Birth defects in 9.1% of first-trimester methimazole-exposed children against 5.7% unexposed, adjusted OR 1.66 (95% CI 1.35 to 2.04), in 817,093 births',
        'Recurrence within 48 months of withdrawal of 15% after 60-120 months of methimazole against 53% after 18-24 months, in 258 randomised patients',
        'Adverse reactions confined to the first 18 months of therapy, with none observed during up to 118 further months',
        'Radioiodine, the main alternative: solid cancer mortality relative risk 1.06 (95% CI 1.02 to 1.10) per 100 mGy to the stomach in 18,805 patients followed from 1946',
      ],
      unsupportedInferences: [
        'That methimazole treats Graves’ disease; it suppresses hormone synthesis and does nothing to the causative antibody',
        'That thyroid peroxidase inhibition is the labelled mechanism — the United States label says only that hormone synthesis is inhibited and never names the enzyme',
        'That 12 to 18 months is the correct treatment duration, a convention the randomised trial above directly contradicts',
        'That routine white cell monitoring prevents agranulocytosis, when the cohort that measured it could identify no risk factors and onsets ranged from 11 to 233 days',
      ],
      whatFailedInitially: [
        'First-trimester exposure produces a characteristic malformation pattern at a combined adjusted odds ratio of 21.8 (95% CI 13.4 to 35.4)',
        'Switching antithyroid drug in early pregnancy produced the highest birth-defect prevalence of any exposure group, at 10.1%',
        'About half of patients relapse within four years of stopping conventional-duration therapy',
        'Hepatotoxicity including acute liver failure, ANCA-associated vasculitis, a lupus-like syndrome and insulin autoimmune syndrome causing hypoglycaemic coma are all on the label',
      ],
      realWorldOutcome: [
        'Approved as Tapazole under NDA 007517 in 1950 and dispensed almost entirely as generics at US$0.0707 per tablet',
        'Became first-line over propylthiouracil after the 2010 hepatotoxicity boxed warning was added to that drug',
        'The current United States label positions it for patients in whom surgery or radioiodine is not appropriate, a framing predating both the long-term therapy trial and the radioiodine cancer mortality analysis',
        'Remains contraindicated in practice during the first trimester, where propylthiouracil is used instead despite its own boxed warning',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 5 mg or 10 mg',
      description:
        'Readily absorbed from the gastrointestinal tract, metabolised in the liver and excreted in the urine. It concentrates within the thyroid, so the duration of biological effect outlasts the plasma half-life, which is the basis for once-daily maintenance dosing. Onset of biochemical response takes weeks because the gland already holds finished hormone that the drug cannot touch.',
      safetyProfile:
        'No boxed warning, but the Warnings section leads with first-trimester teratogenicity: methimazole crosses the placenta and rare congenital defects including aplasia cutis, facial dysmorphism, choanal atresia, oesophageal atresia with or without tracheo-oesophageal fistula, omphalocele and omphalomesenteric duct abnormalities have occurred. Agranulocytosis is described as potentially life-threatening, with patients instructed to report fever or sore throat immediately; leukopenia, thrombocytopenia and aplastic anaemia may also occur, and the drug is to be discontinued with bone marrow indices monitored. Hepatotoxicity including acute liver failure is recorded. Other major reactions: drug fever, a lupus-like syndrome, insulin autoimmune syndrome that can cause hypoglycaemic coma, hepatitis with jaundice persisting weeks after withdrawal, periarteritis, hypoprothrombinaemia, rare nephritis, postmarketing acute pancreatitis, and ANCA-associated vasculitis with severe complications. Minor reactions include rash, urticaria, nausea, arthralgia, paraesthesia, loss of taste, hair loss, pruritus and lymphadenopathy.',
    },
    commonQuestions: [
      {
        q: 'Why has nothing changed after two weeks on it?',
        a: 'Because the drug stops the thyroid making new hormone and does nothing to the hormone already made. The label says this directly: it does not inactivate existing thyroxine and triiodothyronine stored in the thyroid or circulating in the blood. The gland holds weeks of finished hormone in its follicles, and that continues to be released after synthesis has been blocked. Biochemical improvement therefore takes several weeks, and a beta-blocker is often used at the start to control the tremor and palpitations in the meantime. Judging the dose on a thyroid function test taken too early is the commonest error this pharmacology produces.',
      },
      {
        q: 'What exactly should I do if I get a sore throat?',
        a: 'Get a full blood count the same day. The label instructs patients to report immediately any symptoms suggestive of agranulocytosis, such as fever or sore throat, because the loss of infection-fighting white cells can be complete and can be fatal through infection. In a cohort of 50,385 people treated for Graves’ disease, 50 developed agranulocytosis, at a median of 69 days after starting and anywhere from 11 to 233 days. The same study could not identify who was at risk, which is why the instruction is to react to a symptom rather than to follow a monitoring schedule — the event develops faster than any practical testing interval would catch.',
        auditNote:
          'A safety instruction that depends on the patient acting is a real limitation of this drug, not a formality. The study that quantified the risk explicitly failed to find predictors.',
      },
      {
        q: 'Is it safe in pregnancy?',
        a: 'No, and neither is the alternative of leaving hyperthyroidism untreated, which is what makes this genuinely difficult. In a Danish study of 817,093 births, birth defects occurred in 9.1% of children exposed to methimazole or carbimazole in early pregnancy against 5.7% of unexposed children, with an adjusted odds ratio of 1.66. The label lists the characteristic pattern — aplasia cutis, choanal atresia, oesophageal atresia, omphalocele — and in the Danish data that specific cluster had a combined adjusted odds ratio of 21.8. Propylthiouracil was lower at 8.0% but carries its own boxed warning for fatal liver injury, and mothers who switched between the two had the highest defect rate of all, at 10.1%. Meanwhile the label records that untreated Graves’ disease in pregnancy increases maternal heart failure, miscarriage, preterm birth and stillbirth. This is a specialist decision and nothing on this page should influence it.',
        auditNote:
          'Every option in the first trimester has a measured harm. That is the finding, and presenting any one of them as the safe choice misrepresents the data.',
      },
      {
        q: 'How long do I have to take it?',
        a: 'Longer than the traditional answer, on the best trial available. The convention was 12 to 18 months and then stop, with roughly half of people relapsing. A randomised trial of 258 patients continued methimazole for a scheduled total of 60 to 120 months in one arm and stopped at 18 to 24 months in the other: recurrence within four years of withdrawal was 15% against 53%. Just as importantly, the side effects appeared almost entirely in the first 18 months — 14 skin reactions and 2 liver enzyme rises — with none after that during up to 118 further months of treatment, which undercuts the original reason for stopping. It is one open-label trial from one centre and has not been replicated, so it has changed the question rather than closed it.',
      },
      {
        q: 'Should I just have the radioactive iodine and be done with it?',
        a: 'That was the standard American answer for decades and it is less settled than it was. In 2019 an extension of a cohort followed since 1946, covering 18,805 patients treated with radioactive iodine, reported a dose-dependent association with cancer mortality: a relative risk of 1.06 (95% CI 1.02 to 1.10) for all solid cancer per 100 mGy to the stomach, and 1.12 (95% CI 1.003 to 1.32) for breast cancer mortality per 100 mGy to the breast. The effect per unit dose is small, the study is observational, and doses used today differ from those given in the 1950s. It nonetheless moved the balance, at the same time as the long-term drug trial moved it from the other side. Radioiodine also produces permanent hypothyroidism requiring lifelong levothyroxine, can worsen Graves’ eye disease, and is contraindicated in pregnancy. There is no option here without a cost, which is precisely why it is a decision and not a protocol.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Watanabe N, Narimatsu H, Noh JY, et al. Antithyroid drug-induced hematopoietic damage: a retrospective cohort study of agranulocytosis and pancytopenia involving 50,385 patients with Graves’ disease. J Clin Endocrinol Metab 2012;97:E49-E53',
        identifier: '10.1210/jc.2011-2221',
        kind: 'doi',
      },
      {
        label:
          'Andersen SL, Olsen J, Wu CS, Laurberg P. Birth defects after early pregnancy use of antithyroid drugs: a Danish nationwide study. J Clin Endocrinol Metab 2013;98:4373-4381',
        identifier: '10.1210/jc.2013-2831',
        kind: 'doi',
      },
      {
        label:
          'Azizi F, Amouzegar A, Tohidi M, et al. Increased remission rates after long-term methimazole therapy in patients with Graves’ disease: results of a randomized clinical trial. Thyroid 2019;29:1192-1200',
        identifier: '10.1089/thy.2019.0180',
        kind: 'doi',
      },
      {
        label:
          'Kitahara CM, Berrington de Gonzalez A, Bouville A, et al. Association of radioactive iodine treatment with cancer mortality in patients with hyperthyroidism. JAMA Intern Med 2019;179:1034-1042',
        identifier: '10.1001/jamainternmed.2019.0981',
        kind: 'doi',
      },
      {
        label:
          'Methimazole tablets USP United States prescribing information — Indications and Usage, Clinical Pharmacology, Warnings (first trimester use, agranulocytosis, liver toxicity), Adverse Reactions, Pregnancy (ANDA 040547, ANDA 040350)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22METHIMAZOLE%22',
        kind: 'regulatory',
      },
      {
        label: 'TAPAZOLE (methimazole) Drugs@FDA record, NDA 007517, King Pharmaceuticals',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=007517',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 1349907 — methimazole, canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1349907',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 8. Propylthiouracil — a 1947 drug demoted to second line by a 2010 boxed warning whose own
  //    label states that monitoring for the boxed harm does not work.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'propylthiouracil',
    name: 'Propylthiouracil',
    tradeName: '',
    sponsor:
      'PH Health holds the reference application (NDA 006188, originally approved 28 July 1947); the drug is dispensed as generics under multiple ANDAs',
    targetGene: 'TPO',
    targetProtein:
      'Thyroid peroxidase, blocking hormone synthesis; and, uniquely among the thionamides in clinical use, type 1 iodothyronine deiodinase in peripheral tissues, blocking conversion of thyroxine to the more active triiodothyronine',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1947,
    indication:
      'In patients with Graves’ disease with hyperthyroidism or toxic multinodular goitre who are intolerant of methimazole and for whom surgery or radioactive iodine therapy is not an appropriate treatment option; and to ameliorate symptoms of hyperthyroidism in preparation for thyroidectomy or radioactive iodine therapy in patients who are intolerant of methimazole',
    patientFriendlyIndication: 'Overactive thyroid, when methimazole cannot be used',
    anatomicalSite:
      'Thyroid follicular cell apical membrane, and peripheral tissues — chiefly liver, kidney and thyroid — where type 1 deiodinase converts thyroxine to triiodothyronine',
    conditionContext: {
      conditionExplainer:
        'Propylthiouracil blocks the same enzyme in the thyroid that methimazole does, stopping the manufacture of new hormone. It also does something methimazole cannot: it blocks the enzyme that converts thyroxine, the storage form, into triiodothyronine, the active form, out in the tissues. That second action is why it is still used in thyroid storm, where hours matter.',
      whyItMatters:
        'This is a drug that lost an argument. For decades it was the American default and methimazole the alternative. In 2010 the FDA added a boxed warning for severe liver injury and acute liver failure, and the indication was rewritten to restrict it to patients who cannot tolerate methimazole. Its own label then says something remarkable: monitoring liver function is not expected to reduce the risk, because the injury is too fast and too unpredictable.',
      whoTakesThis:
        'People intolerant of methimazole; people in or just before the first trimester of pregnancy, where the boxed warning itself carves out an exception; and people in thyroid storm, where the peripheral conversion block is wanted. It is specifically not recommended in children unless methimazole is not tolerated and surgery or radioiodine are not appropriate.',
      clinicalGoals:
        'A normal free thyroxine and a resolution of thyrotoxic symptoms, both surrogates. There is no randomised trial demonstrating that propylthiouracil improves any hard outcome in thyroid storm, only the mechanistic argument and long practice.',
    },
    oneSentenceVerdict:
      'A 1947 thionamide that blocks thyroid peroxidase and, unlike methimazole, also blocks peripheral conversion of thyroxine to triiodothyronine — carrying since April 2010 a boxed warning for severe liver injury and acute liver failure that reserves it for methimazole-intolerant patients, with a reporting-ratio for severe liver injury in children under 17 of 17 (90% CI 11.5 to 24.1) and a label stating in terms that liver function monitoring is not expected to attenuate the risk.',
    laymanHowItWorks:
      'The thyroid makes its hormone by attaching iodine to a protein using one particular enzyme. Propylthiouracil blocks that enzyme, so no new hormone is built — though the gland’s existing stores keep being released for weeks. It also does a second thing that its sister drug cannot: the hormone the thyroid releases is mostly an inactive storage form that has to be converted in the liver, kidney and elsewhere into the active version, and propylthiouracil blocks that conversion too. That is why it is chosen in a thyroid crisis, when the active hormone level needs to come down within hours rather than weeks.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 70,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2701 per 50 mg tablet at United States pharmacy acquisition cost (CMS NADAC, median across 8 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Originally approved on 28 July 1947 under NDA 006188 and long off patent. It is nonetheless listed at nearly four times the acquisition cost of methimazole (US$0.0707), and because the usual daily dose is given in three divided doses rather than one, the daily cost difference is larger again. That is a price gradient running in the opposite direction to the evidence: the cheaper drug is the one with the better safety profile and the broader indication.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Propylthiouracil is itself the substitute now. Its label defines it by exclusion — for patients intolerant of methimazole, for whom radioiodine and surgery are not appropriate — so the honest comparison is against the drug that displaced it and against the two definitive treatments it is a second choice to.',
      conventionalRx: [
        {
          name: 'Methimazole (Tapazole)',
          class: 'Thionamide antithyroid drug',
          howItCompares:
            'The drug propylthiouracil is now defined against. It blocks the same thyroid enzyme, is dosed once daily rather than three times, costs about a quarter as much, and carries no boxed warning. The FDA’s stated basis for the 2010 boxed warning was that propylthiouracil is associated with higher risk of clinically serious or fatal liver injury than methimazole in both adults and children, and the propylthiouracil label records that no cases of liver failure have been reported with methimazole in paediatric patients.',
          typicalCost:
            'US$0.0707 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 31 listed products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper, once daily, no boxed warning, and the only thionamide with a randomised trial of long-term therapy. Cons: a distinct and more severe first-trimester teratogenic pattern, which is the one situation propylthiouracil is preferred.',
        },
        {
          name: 'Radioactive iodine (iodine-131)',
          class: 'Definitive ablative therapy',
          howItCompares:
            'One of the two definitive options the propylthiouracil indication requires to be inappropriate before the drug is used. In 18,805 patients followed from 1946, all solid cancer mortality carried a relative risk of 1.06 (95% CI 1.02 to 1.10) per 100 mGy to the stomach.',
          typicalCost: 'A single procedural course rather than a per-tablet price',
          prosAndCons:
            'Pros: definitive; no daily adherence; no hepatotoxicity. Cons: permanent hypothyroidism, a dose-dependent cancer mortality association in the longest cohort available, contraindicated in pregnancy.',
        },
        {
          name: 'Thyroidectomy',
          class: 'Surgery',
          howItCompares:
            'The other definitive option. Propylthiouracil’s second labelled indication is precisely to render a methimazole-intolerant patient euthyroid before this operation, which is a preparatory rather than a therapeutic role.',
          typicalCost: 'A single surgical episode rather than a per-tablet price',
          prosAndCons:
            'Pros: immediate and definitive, no radiation, appropriate for large goitres and severe eye disease. Cons: recurrent laryngeal nerve injury, hypoparathyroidism, anaesthesia, lifelong levothyroxine.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Learn the liver symptoms, because the blood tests will not save you',
          action:
            'Report loss of appetite, itching, right upper abdominal pain, nausea, dark urine or yellowing immediately, especially in the first six months.',
          patientImpact:
            'The label states that biochemical monitoring of liver function and hepatocellular integrity is not expected to attenuate the risk of severe liver injury because of its rapid and unpredictable onset, and directs instead that patients be informed of the risk and instructed to report symptoms of hepatic dysfunction, particularly in the first six months. When symptoms occur the label directs immediate discontinuation and liver testing.',
          clinicalPrecaution:
            'This is one of very few labels that states outright that scheduled monitoring will not prevent its boxed harm. It shifts detection entirely onto symptom recognition.',
        },
        {
          name: 'Fever or sore throat, same rule as methimazole',
          action: 'Seek a same-day full blood count for fever or sore throat.',
          patientImpact:
            'The label records agranulocytosis in approximately 0.2% to 0.5% of patients, typically within the first three months of therapy, and describes it as potentially life-threatening. Leukopenia, thrombocytopenia and aplastic anaemia may also occur.',
          clinicalPrecaution:
            'The label instructs patients to report any symptom suggestive of agranulocytosis immediately. As with methimazole, the timing is unpredictable enough that scheduled counts are not a reliable substitute.',
        },
        {
          name: 'Three doses, eight hours apart',
          action: 'Ask specifically about the schedule rather than assuming once daily.',
          patientImpact:
            'The label directs that the total daily dosage is usually given in three equal doses at approximately eight-hour intervals — a consequence of the drug’s short duration of action and a major practical disadvantage against once-daily methimazole. Adherence to a three-times-daily schedule is reliably worse than to a once-daily one.',
          clinicalPrecaution:
            'The label notes severe liver injury has been reported at doses as low as 50 mg/day, though most cases were at 300 mg/day and higher. Nothing here is dosing advice.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCC1=CC(=O)NC(=S)N1',
      chemicalFormula: 'C7H10N2OS',
      molecularWeight: '170.23 g/mol',
      targetReceptorAffinity:
        'The label describes it as one of the thiocarbamide compounds: a white, bitter-tasting crystalline substance, very slightly soluble in water. Structurally it is a six-membered thiouracil ring carrying a propyl group, which is precisely the distinction the methimazole label draws when it says the imidazoles differ from the thiouracil series primarily in having a five- rather than six-membered ring. That ring difference is not cosmetic: the thiouracil scaffold is what confers inhibition of type 1 iodothyronine deiodinase, the peripheral conversion enzyme, which methimazole does not inhibit at all. It is also, on the epidemiology, the scaffold associated with the hepatotoxicity.',
      structureSource: {
        label:
          'PubChem CID 657298 (propylthiouracil) — canonical SMILES, molecular formula and weight, as carried on the enriched record; chemical description from the propylthiouracil tablets USP label, Description section',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/657298',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ptu-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Distinguish it from methimazole by ring size, deliberately',
          description:
            'The two antithyroid drugs are confusable by name, by indication and by appearance, and they are now separated by a boxed warning. The identity test that matters is the one that resolves a six-membered thiouracil from a five-membered imidazole, and it should be run as an identity check rather than assumed from the container label.',
          reagentsAndBuffer:
            'Propylthiouracil USP reference standard, 1H and 13C NMR in DMSO-d6, infrared spectroscopy, HPLC with ultraviolet detection against both propylthiouracil and methimazole standards, melting point, loss on drying',
        },
        {
          id: 'ptu-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Condense a beta-ketoester with thiourea',
          description:
            'A single classical condensation: ethyl butyrylacetate and thiourea cyclise under base to the 6-propyl-2-thiouracil. Like methimazole, the route has no stereocentres and no chromatography, and the drug is correspondingly cheap to make — which is why its higher price relative to methimazole is a market fact rather than a manufacturing one.',
          dependsOnStepId: 'ptu-w1',
          reagentsAndBuffer:
            'Ethyl butyrylacetate, thiourea, sodium ethoxide in ethanol under reflux, acidification to precipitate the product, water washes',
        },
        {
          id: 'ptu-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallise and control sulphur-oxidation impurities',
          description:
            'The compound is only very slightly soluble in water, so recrystallisation is done from hot aqueous alkali with reacidification or from ethanol. As with every thionamide the degradation chemistry is at the sulphur, and the oxidised products are inactive.',
          dependsOnStepId: 'ptu-w2',
          reagentsAndBuffer:
            'Recrystallisation from ethanol or from dilute alkali with controlled reacidification, activated carbon treatment, HPLC for sulphur-oxidation related substances, accelerated stability testing',
        },
        {
          id: 'ptu-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Measure the two enzymes separately, because only one is shared with methimazole',
          description:
            'The clinical case for using this drug over its safer sibling rests entirely on the second enzyme. Thyroid peroxidase inhibition is a class property; type 1 deiodinase inhibition is not, and it is the only pharmacological reason to accept a boxed warning. Assaying only the peroxidase would measure the property the drug is not chosen for.',
          dependsOnStepId: 'ptu-w3',
          reagentsAndBuffer:
            'Purified thyroid peroxidase with hydrogen peroxide and radiolabelled iodide for the organification assay; recombinant human type 1 iodothyronine deiodinase with reverse triiodothyronine or thyroxine substrate and dithiothreitol as cofactor for the deiodinase assay; methimazole run in parallel as the negative control on the deiodinase',
        },
        {
          id: 'ptu-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Characterise the hepatotoxicity that the clinic cannot monitor for',
          description:
            'The label states that biochemical liver monitoring is not expected to attenuate the risk of severe liver injury because onset is rapid and unpredictable. That is a statement about the failure of a clinical surveillance strategy, and it makes preclinical mechanistic work the only place the hazard can be characterised at all — reactive metabolite formation, covalent binding and immune-mediated injury rather than dose-dependent toxicity.',
          dependsOnStepId: 'ptu-w4',
          reagentsAndBuffer:
            'Human liver microsomes and hepatocytes with NADPH, glutathione and cyanide trapping for reactive metabolite detection by LC-MS/MS, myeloperoxidase-mediated bioactivation system, covalent binding assay with radiolabelled drug, HLA-genotyped hepatocyte donors',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ptu-a1',
        category: 'conclusion_shift',
        title: 'A 1947 first-line drug demoted by boxed warning in 2010',
        laymanSummary:
          'For most of its life this was the standard American treatment for an overactive thyroid. In April 2010 the FDA added its strongest warning for liver failure and the indication was rewritten to cover only people who cannot take the alternative.',
        technicalDetails:
          'Propylthiouracil was originally approved on 28 July 1947 under NDA 006188. A labelling supplement was approved on 1 April 2010 adding the boxed warning, which reads: severe liver injury and acute liver failure, in some cases fatal, have been reported; these reports include cases requiring liver transplantation in adult and paediatric patients; propylthiouracil should be reserved for patients who cannot tolerate methimazole and in whom radioactive iodine therapy or surgery are not appropriate; and it may be the treatment of choice when an antithyroid drug is indicated during or just prior to the first trimester of pregnancy. The indications section was rewritten to match, restricting it to patients intolerant of methimazole. Nothing about the drug changed in 2010. What changed was that sixty years of accumulated postmarketing reports were finally analysed against a comparator, and the comparator won. This is the clearest case in this file of a drug being demoted not by a new trial but by a retrospective look at what had already been reported and never aggregated.',
        evidenceSource:
          'Propylthiouracil tablets USP United States prescribing information, Boxed Warning and Indications and Usage; Drugs@FDA record for NDA 006188 showing original approval 28 July 1947 and labelling supplement 20 approved 1 April 2010',
        inferredClaim:
          'That propylthiouracil was an appropriate first-line antithyroid drug — the standing position for six decades, reversed on aggregated postmarketing hepatotoxicity data rather than on a trial',
        auditFlag: 'contested',
      },
      {
        id: 'ptu-a2',
        category: 'failed',
        title: 'The label says monitoring for the boxed harm does not work',
        laymanSummary:
          'The obvious response to a liver-failure warning is regular liver blood tests. The label says explicitly that those tests are not expected to reduce the risk, because the injury comes on too fast and too unpredictably to be caught.',
        technicalDetails:
          'The Warnings section reads: "Biochemical monitoring of liver function (bilirubin, alkaline phosphatase) and hepatocellular integrity (ALT, AST) is not expected to attenuate the risk of severe liver injury due to its rapid and unpredictable onset." It goes on to direct that patients be informed of the risk of liver failure and instructed to report any symptoms of hepatic dysfunction — anorexia, pruritus, right upper quadrant pain — particularly in the first six months, with immediate discontinuation and liver testing when symptoms occur. This is an unusually candid admission and it has a specific consequence: the entire safety strategy for the boxed harm is patient education and symptom reporting, with no laboratory safety net. It also means the reassurance a patient may take from a normal set of liver tests is not one the label supports.',
        evidenceSource:
          'Propylthiouracil tablets USP United States prescribing information, Warnings, Liver Toxicity',
        measuredMetric:
          'The labelled statement that biochemical liver monitoring is not expected to attenuate the risk of severe liver injury',
        auditFlag: 'caution',
      },
      {
        id: 'ptu-a3',
        category: 'measured',
        title: 'In children the hepatotoxicity signal is seventeenfold and it is not shared',
        laymanSummary:
          'A data-mining analysis of forty years of adverse event reports found severe liver injury reported for propylthiouracil in children at seventeen times the background rate. Methimazole in children did not produce that signal at all.',
        technicalDetails:
          'Rivkees and Szarfman applied the multi-item gamma-Poisson shrinker algorithm to more than forty years of FDA adverse event data. For propylthiouracil in patients under 17, severe liver injury gave an empirical Bayes geometric mean of 17 (90% CI 11.5 to 24.1), with vasculitis also disproportionately reported. Methimazole’s disproportionality was in a different pattern entirely — mild liver injury with a cholestatic character, empirical Bayes geometric mean 4.8 (90% CI 3.3 to 6.8), and in patients aged 61 and over. The propylthiouracil label states directly that no cases of liver failure have been reported with the use of methimazole in paediatric patients, and that propylthiouracil is therefore not recommended in children except when methimazole is not tolerated and surgery or radioiodine are not appropriate. Disproportionality analysis of spontaneous reports cannot give an incidence and is subject to reporting bias; what it can do, and did here, is show that two drugs of the same class have different and non-overlapping toxicity signatures.',
        evidenceSource:
          'Rivkees SA, Szarfman A. Dissimilar hepatotoxicity profiles of propylthiouracil and methimazole in children. J Clin Endocrinol Metab 2010;95:3260-3267',
        doi: '10.1210/jc.2009-2546',
        measuredMetric:
          'Empirical Bayes geometric mean disproportionality for severe liver injury in patients under 17, propylthiouracil against background',
        auditFlag: 'verified',
      },
      {
        id: 'ptu-a4',
        category: 'inferred',
        title: 'The thyroid storm indication rests on a mechanism and the word "may"',
        laymanSummary:
          'Propylthiouracil is preferred in a thyroid crisis because it blocks the conversion of stored hormone into active hormone. The label puts that carefully — it says the drug "may therefore be an effective treatment" — and there is no randomised trial.',
        technicalDetails:
          'The Clinical Pharmacology section reads: "Propylthiouracil inhibits the conversion of thyroxine to triiodothyronine in peripheral tissues and may therefore be an effective treatment for thyroid storm." The mechanism is real and is not shared with methimazole: the thiouracil scaffold inhibits type 1 iodothyronine deiodinase, the enzyme that produces most circulating triiodothyronine from thyroxine. The inference from that to clinical benefit in thyroid storm is what the label’s "may" is doing. Thyroid storm is a rare emergency with a substantial mortality and no randomised comparison of antithyroid drugs in it exists or is likely to; the practice rests on the mechanism, on case series, and on the reasonable proposition that lowering active hormone faster is better. It is a defensible inference and it is an inference, and the drug is not licensed for thyroid storm at all — the indication section covers Graves’ disease, toxic multinodular goitre and preparation for definitive treatment, all restricted to methimazole-intolerant patients.',
        evidenceSource:
          'Propylthiouracil tablets USP United States prescribing information, Clinical Pharmacology and Indications and Usage',
        inferredClaim:
          'That propylthiouracil improves outcomes in thyroid storm through its peripheral deiodinase block — a mechanistically coherent claim, hedged in the label itself, and never tested against methimazole in a randomised trial',
        auditFlag: 'caution',
      },
      {
        id: 'ptu-a5',
        category: 'failed',
        title: 'The pregnancy exception is a lesser harm, not a safe option',
        laymanSummary:
          'It is preferred to methimazole in the first trimester because its birth defects are less severe. Its own defect rate is still above background, and mothers who switched between the two drugs had the worst outcomes of any group.',
        technicalDetails:
          'The boxed warning carves out the exception: propylthiouracil may be the treatment of choice when an antithyroid drug is indicated during or just prior to the first trimester. The Danish nationwide cohort of 817,093 live-born children puts numbers on what that exception buys: birth defect prevalence 8.0% with propylthiouracil (adjusted OR 1.41, 95% CI 1.03 to 1.92) against 9.1% with methimazole or carbimazole (adjusted OR 1.66, 95% CI 1.35 to 2.04) and 5.7% in never-exposed children — and 10.1% in mothers who switched between the two in early pregnancy (adjusted OR 1.82, 95% CI 1.08 to 3.07), the highest of any group. Separately, the propylthiouracil label records cases of liver injury including liver failure and death in women treated during pregnancy, and two reports of in utero exposure with liver failure and death of a newborn; it states the drug crosses the placenta and can cause fetal goitre and cretinism, and advises that after the first trimester an alternative may be advisable. The pregnancy strategy in current practice — propylthiouracil early, methimazole later — is therefore constructed from two drugs each of which is teratogenic, with a switching manoeuvre that the largest cohort associates with the worst result.',
        evidenceSource:
          'Andersen SL, Olsen J, Wu CS, Laurberg P. J Clin Endocrinol Metab 2013;98:4373-4381; propylthiouracil tablets USP label, Boxed Warning and Warnings, Use in Pregnancy',
        doi: '10.1210/jc.2013-2831',
        measuredMetric:
          'Birth defect prevalence by first-trimester antithyroid drug exposure, including the switched-drug group',
        auditFlag: 'caution',
      },
      {
        id: 'ptu-a6',
        category: 'measured',
        title: 'Agranulocytosis at 0.2 to 0.5%, plus a vasculitis that kills',
        laymanSummary:
          'Loss of infection-fighting white cells occurs in up to one in two hundred people, usually in the first three months. A blood vessel inflammation linked to a specific antibody is also on the label, with severe complications and death.',
        technicalDetails:
          'The label states agranulocytosis occurs in approximately 0.2% to 0.5% of patients, typically within the first three months of therapy, is potentially life-threatening, and that leukopenia, thrombocytopenia and aplastic anaemia may also occur; patients are instructed to report fever or sore throat immediately. The Adverse Reactions section adds a lupus-like syndrome including splenomegaly and vasculitis, periarteritis, hypoprothrombinaemia and bleeding, nephritis, glomerulonephritis, interstitial pneumonitis, exfoliative dermatitis, erythema nodosum, rare Stevens-Johnson syndrome and toxic epidermal necrolysis, and reports of vasculitis associated with anti-neutrophil cytoplasmic antibodies resulting in severe complications and death. The ANCA-associated vasculitis deserves separate mention because it is far more characteristic of propylthiouracil than of methimazole and because it can present months or years into treatment, long after the period anyone is watching for adverse effects. The label’s own caveat applies to all of these: the reports come from voluntary reporting from a population of uncertain size, so frequency cannot be reliably estimated.',
        evidenceSource:
          'Propylthiouracil tablets USP United States prescribing information, Warnings, Agranulocytosis, and Adverse Reactions',
        measuredMetric:
          'Labelled incidence and timing of agranulocytosis, and the full set of labelled severe adverse reactions',
        auditFlag: 'caution',
      },
      {
        id: 'ptu-a7',
        category: 'inferred',
        title: 'Nearly four times the price of the drug that beat it',
        laymanSummary:
          'The safer, once-daily, first-line drug costs about seven cents a tablet. The one restricted by a boxed warning and taken three times a day costs about twenty-seven.',
        technicalDetails:
          'In the CMS National Average Drug Acquisition Cost survey effective 19 August 2026, propylthiouracil 50 mg is listed at a median of US$0.2701 per tablet across 8 products and methimazole at US$0.0707 across 31 products at 5 mg and 10 mg. The label directs that the total daily propylthiouracil dose is usually given in three equal doses at approximately eight-hour intervals, where methimazole’s intrathyroidal concentration supports once-daily maintenance dosing, so the per-day gap is wider than the per-tablet gap. Neither drug is patented and neither is difficult to make — both are single-step condensations with no stereochemistry. The price ordering is therefore a property of the generic supply market, with eight listed suppliers against thirty-one, and not of either drug’s cost or value. It is included because a reader comparing the two on a pharmacy shelf would reasonably assume the more expensive drug is the better one, and here the ordering is exactly inverted.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost, 2026 file, survey effective 19 August 2026; propylthiouracil tablets USP label, Dosage and Administration',
        inferredClaim:
          'That price signals clinical standing — inverted here, where the boxed-warning second-line drug costs nearly four times the unrestricted first-line one',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A six-membered ring where methimazole has five',
        laymanDesc:
          'Chemically this is the older, larger cousin of methimazole: a thiouracil ring with a propyl group. That difference in ring shape gives it an extra action and, on the epidemiology, an extra hazard.',
        molecularDetail:
          '6-propyl-2-thiouracil, formula C7H10N2OS, molecular weight 170.23; described in the label as one of the thiocarbamide compounds, white, crystalline, bitter and very slightly soluble in water. The methimazole label defines the imidazoles against exactly this series by ring size.',
        iconName: 'Hexagon',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It blocks the thyroid enzyme, like its sibling',
        laymanDesc:
          'In the gland, it stops the enzyme that attaches iodine to protein, so no new hormone is manufactured. What is already stored keeps being released for weeks.',
        molecularDetail:
          'The label states it inhibits the synthesis of thyroid hormones and does not inactivate existing thyroxine and triiodothyronine stored in the thyroid or circulating in the blood, nor interfere with administered hormone. As with methimazole, thyroid peroxidase is the target in the pharmacological literature and is not named in the label.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'And then it blocks the conversion enzyme too',
        laymanDesc:
          'Most of the hormone the thyroid releases is an inactive storage form. Elsewhere in the body an enzyme converts it into the active version. Propylthiouracil blocks that enzyme as well — and methimazole does not.',
        molecularDetail:
          'The label states it inhibits the conversion of thyroxine to triiodothyronine in peripheral tissues and may therefore be an effective treatment for thyroid storm. The enzyme is type 1 iodothyronine deiodinase, a selenoenzyme in liver, kidney and thyroid; the thiouracil scaffold inhibits it and the imidazole scaffold does not. This is the sole pharmacological reason to prefer this drug.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Short-acting, so three times a day',
        laymanDesc:
          'Unlike methimazole it does not accumulate in the gland enough to be taken once daily. The label sets out three doses about eight hours apart, which is harder to keep to.',
        molecularDetail:
          'The label directs the total daily dosage usually be given in three equal doses at approximately eight-hour intervals. It is readily absorbed and extensively metabolised, with approximately 35% excreted in the urine in intact and conjugated forms within 24 hours.',
        iconName: 'Clock',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'A liver injury nobody can screen for',
        laymanDesc:
          'Severe liver injury and liver failure, sometimes fatal, sometimes needing a transplant. The label says liver blood tests are not expected to reduce the risk because it comes on too fast.',
        molecularDetail:
          'Boxed warning since April 2010, restricting the drug to methimazole-intolerant patients. Warnings section: biochemical monitoring of bilirubin, alkaline phosphatase, ALT and AST is not expected to attenuate the risk due to rapid and unpredictable onset; patients are to report hepatic symptoms particularly in the first six months. Severe injury reported at doses as low as 50 mg/day, most at 300 mg/day and higher. Disproportionality for severe liver injury under age 17: empirical Bayes geometric mean 17 (90% CI 11.5 to 24.1).',
        iconName: 'AlertOctagon',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What is left of the drug: two narrow places',
        laymanDesc:
          'A thyroid crisis, where blocking hormone conversion within hours matters, and the first trimester of pregnancy, where the alternative is more damaging to the fetus. Everywhere else, methimazole.',
        molecularDetail:
          'The indication is restricted to methimazole-intolerant patients for whom radioiodine and surgery are inappropriate. The boxed warning carves out the first trimester, where Danish nationwide data give a birth defect prevalence of 8.0% (adjusted OR 1.41, 95% CI 1.03 to 1.92) against 9.1% for methimazole and 5.7% unexposed. Thyroid storm is not in the licensed indication at all.',
        iconName: 'Scale',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'FDA Adverse Event Reporting System disproportionality analysis (J Clin Endocrinol Metab 2010;95:3260-3267)',
        phase: 'Pharmacovigilance disproportionality analysis of spontaneous reports, not a trial',
        sampleSize: 0,
        primaryEndpoint:
          'Empirical Bayes geometric mean disproportionality for hepatic adverse events with propylthiouracil and with methimazole, by age stratum, across more than forty years of adverse event reports. Sample size is recorded as zero because a disproportionality analysis has no denominator: it compares reporting rates within a spontaneous-report database and cannot yield an incidence',
        endpointMet: true,
        statisticalPValue:
          'Propylthiouracil, severe liver injury under age 17: empirical Bayes geometric mean 17 (90% CI 11.5 to 24.1). Methimazole, mild cholestatic liver injury age 61 and over: 4.8 (90% CI 3.3 to 6.8)',
        unreportedAdverseSignals:
          'Spontaneous reporting is subject to under-reporting, stimulated reporting after publicity, and no denominator. A disproportionality signal establishes that the pattern differs between two drugs; it cannot establish how often either occurs.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Danish nationwide birth defects cohort (J Clin Endocrinol Metab 2013;98:4373-4381)',
        phase: 'Nationwide register-based cohort study, not randomised',
        sampleSize: 817093,
        primaryEndpoint:
          'Prevalence of birth defects in live-born children by maternal antithyroid drug exposure in early pregnancy, 1996 to 2008',
        endpointMet: true,
        statisticalPValue:
          'Propylthiouracil 8.0% (adjusted OR 1.41, 95% CI 1.03 to 1.92); methimazole or carbimazole 9.1% (adjusted OR 1.66, 95% CI 1.35 to 2.04); switched between them 10.1% (adjusted OR 1.82, 95% CI 1.08 to 3.07); never exposed 5.7%',
        unreportedAdverseSignals:
          'Propylthiouracil is preferred in the first trimester on the strength of this comparison, and its own defect prevalence is still well above the unexposed rate. The switching strategy that current practice recommends carried the highest prevalence of any group.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Agranulocytosis in approximately 0.2% to 0.5% of patients, typically within the first three months, per the label',
        'Severe liver injury disproportionality in patients under 17: empirical Bayes geometric mean 17 (90% CI 11.5 to 24.1)',
        'Birth defect prevalence 8.0% with first-trimester propylthiouracil against 5.7% unexposed in 817,093 Danish live births (adjusted OR 1.41, 95% CI 1.03 to 1.92)',
        'Approximately 35% of the drug excreted in urine in intact and conjugated forms within 24 hours',
        'A median United States pharmacy acquisition cost of US$0.2701 per 50 mg tablet against US$0.0707 for methimazole',
      ],
      unsupportedInferences: [
        'That propylthiouracil improves outcomes in thyroid storm — mechanistically coherent, hedged as "may" in the label, never randomised, and not a licensed indication',
        'That regular liver blood tests protect against the boxed harm, which the label states in terms they are not expected to do',
        'That the first-trimester preference makes the drug safe in pregnancy, when its own defect prevalence is 8.0% against 5.7% unexposed',
        'That a higher price indicates a better drug, where the ordering here is exactly inverted',
      ],
      whatFailedInitially: [
        'Six decades as a first-line antithyroid drug ended with a boxed warning added on 1 April 2010 and an indication rewritten to methimazole-intolerant patients only',
        'The label states that biochemical monitoring is not expected to attenuate the risk of severe liver injury because of its rapid and unpredictable onset',
        'Severe liver injury has been reported at doses as low as 50 mg/day, though most cases occurred at 300 mg/day and higher',
        'It is not recommended in children at all except where methimazole is not tolerated and definitive therapy is inappropriate, because no paediatric methimazole liver failure has been reported',
      ],
      realWorldOutcome: [
        'Originally approved 28 July 1947 under NDA 006188; labelling supplement adding the boxed warning approved 1 April 2010',
        'Now defined by exclusion: for Graves’ disease or toxic multinodular goitre in patients intolerant of methimazole for whom surgery and radioiodine are inappropriate',
        'Retains two narrow places in practice — thyroid storm, on mechanism rather than trial, and the first trimester of pregnancy, on a lesser-of-two-teratogens comparison',
        'Listed at nearly four times the acquisition cost of the drug that displaced it, and dosed three times daily against once daily',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, 50 mg, the total daily dose usually given in three equal doses about eight hours apart',
      description:
        'Readily absorbed and extensively metabolised, with approximately 35% excreted in urine in intact and conjugated forms within 24 hours. The short duration of action is the reason for three-times-daily dosing, in contrast to methimazole’s once-daily maintenance. As with all thionamides, biochemical response lags enzyme inhibition by weeks because the drug cannot touch hormone already stored in the gland.',
      safetyProfile:
        'Boxed warning since April 2010 for severe liver injury and acute liver failure, in some cases fatal, including cases requiring liver transplantation in adults and children; the drug is to be reserved for patients who cannot tolerate methimazole and in whom radioiodine or surgery are not appropriate, with an exception for use during or just prior to the first trimester of pregnancy. The label states biochemical liver monitoring is not expected to attenuate that risk and directs symptom reporting instead, particularly in the first six months. Agranulocytosis occurs in approximately 0.2% to 0.5%, typically within the first three months; leukopenia, thrombocytopenia and aplastic anaemia may also occur. Further labelled reactions: a lupus-like syndrome with splenomegaly and vasculitis, periarteritis, hypoprothrombinaemia and bleeding, nephritis, glomerulonephritis, interstitial pneumonitis, exfoliative dermatitis, erythema nodosum, rare Stevens-Johnson syndrome and toxic epidermal necrolysis, and ANCA-associated vasculitis resulting in severe complications and death. It crosses the placenta and can cause fetal goitre and cretinism. Not recommended in paediatric patients except where methimazole is not tolerated and definitive therapy is inappropriate.',
    },
    commonQuestions: [
      {
        q: 'Why was I given this instead of methimazole?',
        a: 'There are only three usual reasons, and the label names two of them. The first is intolerance of methimazole — a rash, a reaction, a previous problem — which is what the indication is written around. The second is the first trimester of pregnancy or the period just before it, where the boxed warning itself carves out an exception because methimazole’s pattern of birth defects is more severe. The third, not in the licensed indication at all, is thyroid storm, where propylthiouracil is preferred because it also blocks the conversion of stored thyroid hormone into its active form and methimazole does not. Outside those situations the label directs methimazole.',
      },
      {
        q: 'Should I be having regular liver blood tests?',
        a: 'Your prescriber may well arrange them, and the label is unusually blunt about what they will and will not do: "Biochemical monitoring of liver function (bilirubin, alkaline phosphatase) and hepatocellular integrity (ALT, AST) is not expected to attenuate the risk of severe liver injury due to its rapid and unpredictable onset." The strategy the label actually directs is different: patients are to be informed of the risk of liver failure and instructed to report any symptoms of liver trouble — loss of appetite, itching, pain under the right ribs — particularly during the first six months, at which point the drug is stopped immediately and tests are done. A normal set of results last month is not evidence that this month is safe, and the label says so.',
        auditNote:
          'A label that admits its own monitoring strategy does not work is rare and it is the single most important sentence on this page.',
      },
      {
        q: 'Is it safe in pregnancy?',
        a: 'It is the preferred antithyroid drug in the first trimester, which is not the same as safe. In the Danish study of 817,093 births, birth defects occurred in 8.0% of children exposed to propylthiouracil in early pregnancy against 5.7% of unexposed children — an adjusted odds ratio of 1.41 — compared with 9.1% for methimazole. So the preference buys a difference in kind and degree of defect, not an absence of one. The label also records liver injury including failure and death in women treated during pregnancy, and two reports of in utero exposure with liver failure and death of a newborn, and it says the drug crosses the placenta and can cause fetal goitre and cretinism. Complicating this further, the group in the Danish data with the highest defect prevalence of all, at 10.1%, was mothers who switched between the two drugs in early pregnancy — which is exactly what the standard advice recommends doing. This is a specialist decision.',
        auditNote:
          'Every option in the first trimester carries measured harm. The literature supports choosing between harms, not avoiding one.',
      },
      {
        q: 'Why three times a day when methimazole is once?',
        a: 'Because it does not last as long. Methimazole concentrates inside the thyroid gland itself, so its biological effect outlives its presence in the blood and once-daily maintenance dosing works. Propylthiouracil is readily absorbed and extensively metabolised, with about 35% appearing in the urine within a day, and the label directs the total daily dose be given in three equal doses at roughly eight-hour intervals. That is a real practical disadvantage: adherence to a three-times-daily schedule is consistently worse than to a once-daily one, and in a drug where lapses let hyperthyroidism return, that matters.',
      },
      {
        q: 'What should make me stop and seek help urgently?',
        a: 'Two things, from the label. Any sign of liver trouble — loss of appetite, itching, pain in the right upper abdomen, dark urine, yellowing of the eyes or skin — especially in the first six months; the label directs immediate discontinuation and liver testing. And any fever or sore throat, which may signal agranulocytosis, the sudden loss of infection-fighting white cells that occurs in roughly 0.2% to 0.5% of patients, usually within the first three months; that needs a same-day blood count. There are rarer things on the label as well, including a blood-vessel inflammation linked to ANCA antibodies that has caused severe complications and death, and severe skin reactions. None is common. All of them are reasons the drug is now second line.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Propylthiouracil tablets USP United States prescribing information — Boxed Warning, Indications and Usage, Clinical Pharmacology, Warnings (liver toxicity, use in pregnancy, agranulocytosis), Adverse Reactions, Dosage and Administration (ANDA 080016 and ANDA 080172)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22PROPYLTHIOURACIL%22',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA record for propylthiouracil, NDA 006188 — original approval 28 July 1947 and labelling supplement 20 approved 1 April 2010, the submission that added the boxed warning',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=006188',
        kind: 'regulatory',
      },
      {
        label:
          'Rivkees SA, Szarfman A. Dissimilar hepatotoxicity profiles of propylthiouracil and methimazole in children. J Clin Endocrinol Metab 2010;95:3260-3267',
        identifier: '10.1210/jc.2009-2546',
        kind: 'doi',
      },
      {
        label:
          'Andersen SL, Olsen J, Wu CS, Laurberg P. Birth defects after early pregnancy use of antithyroid drugs: a Danish nationwide study. J Clin Endocrinol Metab 2013;98:4373-4381',
        identifier: '10.1210/jc.2013-2831',
        kind: 'doi',
      },
      {
        label:
          'Kitahara CM, Berrington de Gonzalez A, Bouville A, et al. Association of radioactive iodine treatment with cancer mortality in patients with hyperthyroidism. JAMA Intern Med 2019;179:1034-1042 — cited for the definitive-therapy alternative the indication requires to be inappropriate',
        identifier: '10.1001/jamainternmed.2019.0981',
        kind: 'doi',
      },
      {
        label:
          'PubChem CID 657298 — propylthiouracil, canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/657298',
        kind: 'url',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost, 2026 file — NDC descriptions PROPYLTHIOURACIL and METHIMAZOLE, survey effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 9. Liothyronine — the active thyroid hormone itself, whose one famous positive trial in 33
  //    patients was never replicated, and whose UK price rose over 1,110% in eight years.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'liothyronine',
    name: 'Liothyronine',
    tradeName: 'Cytomel (oral); Triostat (intravenous)',
    sponsor:
      'Pfizer holds the Cytomel application (NDA 010379), acquired through King Pharmaceuticals; dispensed largely as generics',
    targetGene: 'THRA and THRB',
    targetProtein:
      'Nuclear thyroid hormone receptors alpha and beta, bound to DNA. The label describes thyroid hormones as acting through control of DNA transcription and protein synthesis, with T3 and T4 diffusing into the nucleus and binding thyroid receptor proteins attached to DNA',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1956,
    indication:
      'Replacement therapy in primary, secondary and tertiary congenital or acquired hypothyroidism; pituitary TSH suppression as an adjunct to surgery and radioiodine in well-differentiated thyroid cancer; and as a diagnostic agent in thyroid suppression tests. Not indicated for suppression of benign thyroid nodules or nontoxic diffuse goitre in iodine-sufficient patients, nor for hypothyroidism during the recovery phase of subacute thyroiditis',
    patientFriendlyIndication: 'Underactive thyroid — the active hormone, given directly',
    anatomicalSite: 'Nuclear thyroid hormone receptor on DNA, in essentially every nucleated cell',
    conditionContext: {
      conditionExplainer:
        'A healthy thyroid mostly releases thyroxine, a storage form, and the body converts it into triiodothyronine — the version that actually works — in the liver, kidney and other tissues. Liothyronine is that active version, given directly. It skips the conversion step entirely, which is both the reason people ask for it and the reason it behaves so differently from standard treatment.',
      whyItMatters:
        'Standard hypothyroidism treatment is levothyroxine alone, and a substantial minority of people on it remain symptomatic despite normal blood tests. In 1999 a 33-patient crossover trial found that swapping part of the thyroxine dose for liothyronine improved mood and cognition, and that finding has driven a quarter of a century of demand. Eleven randomised trials in 1,216 patients since then have not reproduced it on any measured outcome. That gap between a persuasive small result and a null replication record is the whole story of this drug.',
      whoTakesThis:
        'People with hypothyroidism, most often as an addition to levothyroxine rather than alone; people needing TSH suppression after thyroid cancer; and, as the intravenous form, patients in myxoedema coma. The oral form is specifically not to be used for myxoedema coma.',
      clinicalGoals:
        'Thyroid function tests within range, which are a surrogate, and relief of symptoms, which is the endpoint patients actually want and the one the combination trials failed to move.',
    },
    oneSentenceVerdict:
      'Synthetic triiodothyronine — the active thyroid hormone, given directly rather than made from thyroxine — whose famous 1999 crossover trial in 33 patients showed better mood and cognition when part of the thyroxine dose was replaced by it, and whose subsequent meta-analysis of 11 randomised trials in 1,216 patients found no difference in depression (SMD 0.07, 95% CI −0.20 to 0.34), fatigue (−0.12, −0.33 to 0.09) or quality of life (0.03, −0.09 to 0.15); its UK price rose from £20 to £248 a pack between 2009 and 2017, for which the Competition and Markets Authority fined its supplier and former owners £99 million.',
    laymanHowItWorks:
      'Your thyroid mostly makes thyroxine, which is essentially a reservoir chemical: it has to have one iodine atom removed, elsewhere in the body, to become the active hormone. Liothyronine is that active hormone. It goes straight into cell nuclei, binds to receptors sitting on your DNA, and switches genes on — which is how thyroid hormone works everywhere in the body, from heart rate to bone turnover to how fast you think. Because it bypasses the conversion step, it acts within hours rather than weeks, and because your body normally releases it slowly and steadily, giving it as a tablet twice a day produces peaks and troughs that natural physiology does not.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 63,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.3217 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 29 listed generic products at 5, 25 and 50 mcg, survey effective 19 August 2026). For comparison, the same survey listed a median of US$0.7701 per tablet in December 2013, so the United States price has fallen by more than half over that period',
      markupEstimate: '',
      openPatentNotes:
        'Approved in 1956 under NDA 010379 and long off patent. The most consequential pricing event for this molecule happened in the United Kingdom rather than the United States: the Competition and Markets Authority found that the sole supplier raised the price from £20 to £248 per box between 2009 and 2017, an increase of over 1,110%, while NHS annual spending went from £600,000 in 2006 to over £2.3 million in 2009 and more than £30 million by 2016 with the quantity prescribed broadly stable. The CMA fined Advanz Pharma £40.9 million and its former private equity owners Cinven £51.9 million and HgCapital £6.2 million in July 2021, a total of £99 million; the Competition Appeal Tribunal upheld the decision in August 2023 and the Court of Appeal upheld it again, as announced on 8 May 2025.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For hypothyroidism the comparison is straightforward and unusually well evidenced: levothyroxine alone remains the treatment of choice on the meta-analytic record, and the combination this drug is used for has been tested eleven times without producing a difference. The interesting question is not which works better but why a null result this consistent has not settled the matter.',
      conventionalRx: [
        {
          name: 'Levothyroxine (T4) alone',
          class: 'Synthetic thyroxine',
          howItCompares:
            'The standard. It has a long half-life, so one daily dose produces stable levels, and the body converts it to the active hormone at the rate each tissue needs. The meta-analysis of 11 randomised trials in 1,216 patients concluded that thyroxine monotherapy should remain the treatment of choice for clinical hypothyroidism, finding no difference against combination therapy in bodily pain, depression, anxiety, fatigue, quality of life, body weight or lipids.',
          typicalCost: 'Among the cheapest prescription drugs in the United States',
          prosAndCons:
            'Pros: stable levels on once-daily dosing, physiological conversion, decades of use, negligible cost. Cons: a minority of patients remain symptomatic on it with normal blood tests, which is the entire reason liothyronine is asked for.',
        },
        {
          name: 'Levothyroxine plus liothyronine combination',
          class: 'T4 with added T3',
          howItCompares:
            'The regimen the 1999 trial tested and the eleven trials since did not confirm. A 2021 joint consensus document from the American, European and British thyroid associations set out the case for further trials of combination therapy rather than declaring the question closed, which is a fair reading of a body of small, short trials with a consistent null result and a persistent clinical complaint they may not have been designed to detect.',
          typicalCost:
            'The cost of levothyroxine plus US$0.3217 per liothyronine tablet at United States acquisition cost',
          prosAndCons:
            'Pros: some patients report benefit; the question is formally open rather than settled. Cons: no randomised evidence of superiority on any measured outcome; unphysiological peaks and troughs; and the same over-replacement risks of atrial fibrillation and bone loss.',
        },
        {
          name: 'Desiccated thyroid extract',
          class: 'Animal-derived thyroid preparation',
          howItCompares:
            'Contains both hormones in a fixed animal ratio, which differs from the human one, and is not an FDA-approved drug product. The Cytomel label notes that hormones in natural preparations are absorbed in a manner similar to the synthetic hormones, which is a statement about absorption and not about content consistency.',
          typicalCost:
            'Variable; not listed in the CMS acquisition-cost survey as an approved product',
          prosAndCons:
            'Pros: some patients report preferring it. Cons: not an approved product, fixed non-human hormone ratio, batch-to-batch variability, and no randomised outcome evidence.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'It is not a weight-loss drug, and the label says so in a box',
          action: 'Do not take it, or accept it, for weight loss.',
          patientImpact:
            'The boxed warning reads: thyroid hormones, including CYTOMEL, either alone or with other therapeutic agents, should not be used for the treatment of obesity or for weight loss; in euthyroid patients, doses within the range of daily hormonal requirements are ineffective for weight reduction; larger doses may produce serious or even life-threatening manifestations of toxicity, particularly when given with sympathomimetic amines such as those used for their anorectic effects.',
          clinicalPrecaution:
            'That combination — thyroid hormone plus a stimulant appetite suppressant — is the specific one the boxed warning names, and it is the historical source of the deaths behind the warning.',
        },
        {
          name: 'Palpitations are the dose signal, not a side issue',
          action: 'Report palpitations, an irregular pulse, tremor or chest pain promptly.',
          patientImpact:
            'Section 5.1 warns that overtreatment may increase heart rate, cardiac wall thickness and contractility and may precipitate angina or arrhythmias, particularly in patients with cardiovascular disease and in the elderly, and directs starting below full replacement dose in those groups. Atrial fibrillation is named specifically in the highlights.',
          clinicalPrecaution:
            'Section 5.6 adds that over-replacement increases bone resorption and decreases bone mineral density, directing the lowest effective dose. Both risks are consequences of too much hormone, not of this particular molecule.',
        },
        {
          name: 'Say if you have adrenal problems or diabetes',
          action:
            'Mention any adrenal insufficiency before starting, and expect glucose control to shift if you have diabetes.',
          patientImpact:
            'Section 5.3 directs treating concomitant adrenal insufficiency with replacement glucocorticoids before starting liothyronine, because starting thyroid hormone first can precipitate acute adrenal crisis. Section 5.5 records that therapy may worsen glycaemic control and increase antidiabetic or insulin requirements.',
          clinicalPrecaution:
            'Section 5.2 states that oral thyroid hormone products must not be used to treat myxoedema coma — the intravenous formulation exists for that and the tablet is not a substitute.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC(=C(C=C1OC2=C(C=C(C=C2I)C[C@@H](C(=O)O)N)I)I)O',
      chemicalFormula: 'C15H12I3NO4',
      molecularWeight: '650.97 g/mol',
      targetReceptorAffinity:
        'The label designates it chemically as L-tyrosine, O-(4-hydroxy-3-iodophenyl)-3,5-diiodo-, monosodium salt: two iodinated phenol rings joined by an ether bridge, hung off a tyrosine. Three iodine atoms account for well over half the molecular weight, which is why iodine deficiency is a thyroid disease and why radioiodine is a thyroid therapy — the gland is the only organ that concentrates the element in quantity. Liothyronine differs from levothyroxine by a single iodine atom in the outer ring, and that atom is the whole difference between a storage hormone and an active one. The label records that T3 is not firmly bound to serum protein, where T4 has higher affinity for thyroid-binding globulin and prealbumin, which it says partially explains T4’s higher serum levels and longer half-life.',
      structureSource: {
        label:
          'PubChem CID 5920 (liothyronine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; chemical designation from the CYTOMEL label, section 11',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5920',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lio-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Count the iodines and check the stereocentre',
          description:
            'Liothyronine and levothyroxine differ by one iodine atom and are otherwise the same molecule; the D-isomer is far less active than the L. Both are identity questions that dominate everything else about this drug substance, and both are invisible to a routine potency assay because a tetraiodinated contaminant assays as thyroid hormone.',
          reagentsAndBuffer:
            'Liothyronine sodium USP reference standard, high-resolution mass spectrometry for iodine count, chiral HPLC for enantiomeric purity, ICP-MS for total iodine, HPLC with ultraviolet detection against a levothyroxine standard run in parallel',
        },
        {
          id: 'lio-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the diphenyl ether and iodinate it in a controlled order',
          description:
            'The molecule is assembled by coupling an iodinated phenol to a protected iodotyrosine to form the diaryl ether, then iodinating under conditions that stop at three rather than four. Over-iodination gives levothyroxine, which is not an impurity in any ordinary sense — it is a different marketed drug, and it will be pharmacologically active in the tablet.',
          dependsOnStepId: 'lio-w1',
          reagentsAndBuffer:
            'Protected 3,5-diiodo-L-tyrosine, 4-methoxyphenyl or equivalent coupling partner, copper or Ullmann-type ether coupling, controlled iodination with iodine monochloride or equivalent under monitored stoichiometry, deprotection, sodium salt formation',
        },
        {
          id: 'lio-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separate the tri- from the tetra-iodinated species and control content uniformity',
          description:
            'The tablet strengths are 5, 25 and 50 micrograms, which puts the active ingredient at a fraction of a percent of tablet mass. At that loading, content uniformity is the dominant manufacturing risk and blend segregation produces tablets that are individually out of specification while the batch mean is correct.',
          dependsOnStepId: 'lio-w2',
          reagentsAndBuffer:
            'Preparative reversed-phase chromatography to resolve T3 from T4 and diiodinated species, recrystallisation of the sodium salt, geometric dilution blending with calcium sulfate and corn starch, individual-tablet content uniformity testing by HPLC, stability testing for deiodination on storage',
        },
        {
          id: 'lio-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure nuclear receptor binding and transcriptional response, not enzyme inhibition',
          description:
            'Unlike most drugs in this file, the target is a transcription factor and the readout is gene expression rather than a blocked enzyme. Affinity for the alpha and beta receptor isoforms differs, and the isoforms sit in different tissues — beta in liver and pituitary, alpha prominently in heart — which is the mechanistic origin of the cardiac adverse effects at supraphysiological exposure.',
          dependsOnStepId: 'lio-w3',
          reagentsAndBuffer:
            'Recombinant human THRA1 and THRB1 ligand-binding domains, radiolabelled T3 competition binding, thyroid hormone response element reporter constructs in transfected cells, quantitative PCR for endogenous T3-responsive genes such as DIO1 and ME1',
        },
        {
          id: 'lio-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Characterise the peak-and-trough profile the physiology does not have',
          description:
            'A healthy thyroid and the peripheral deiodinases together deliver T3 to tissues at a near-constant rate. An oral tablet cannot: the label records that T3 is almost totally absorbed, 95% within four hours, with onset within a few hours and maximum response in two to three days. Characterising the drug means characterising that mismatch, because it is the pharmacological objection to combination therapy and the thing a sustained-release formulation would have to fix.',
          dependsOnStepId: 'lio-w4',
          reagentsAndBuffer:
            'Serial free and total triiodothyronine, free thyroxine and thyrotropin immunoassays over a full dosing interval, LC-MS/MS for hormone quantification without antibody cross-reactivity, resting heart rate and sex hormone-binding globulin as peripheral tissue response markers',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lio-a1',
        category: 'conclusion_shift',
        title: 'One 33-patient trial, and eleven that did not reproduce it',
        laymanSummary:
          'In 1999 a crossover study of 33 people found that replacing part of the thyroxine dose with liothyronine improved mood and thinking. Eleven randomised trials in 1,216 patients since then have found no difference on anything measured.',
        technicalDetails:
          'Bunevicius and colleagues randomised 33 patients with hypothyroidism to two five-week crossover periods, one on their usual thyroxine dose and one in which 50 mcg of that dose was replaced by 12.5 mcg of triiodothyronine. Of 17 cognitive and mood test scores, 6 were better or closer to normal on combination therapy; of 15 visual-analogue mood and physical status scales, 10 were significantly better. Pulse rate and sex hormone-binding globulin rose slightly. The subsequent meta-analysis pooled 11 randomised studies in which 1,216 patients were randomised and found no difference in bodily pain, depression (SMD 0.07, 95% CI −0.20 to 0.34), anxiety, fatigue (SMD −0.12, 95% CI −0.33 to 0.09), quality of life (SMD 0.03, 95% CI −0.09 to 0.15), body weight, serum cholesterol, triglycerides, lipoprotein fractions, or adverse events, concluding that thyroxine monotherapy should remain the treatment of choice for clinical hypothyroidism. The original trial was small, crossover, and reported many outcomes; the replications were larger in aggregate and null. That is the classic shape of a false positive, and it is also the shape of a real effect in a subgroup nobody has learned to identify — which is why the question has not closed.',
        evidenceSource:
          'Bunevicius R, Kazanavicius G, Zalinkevicius R, Prange AJ. N Engl J Med 1999;340:424-429; Grozinsky-Glasberg S, Fraser A, Nahshoni E, Weizman A, Leibovici L. J Clin Endocrinol Metab 2006;91:2592-2599',
        doi: '10.1210/jc.2006-0448',
        inferredClaim:
          'That adding liothyronine to levothyroxine improves mood, cognition and wellbeing in hypothyroidism — supported by one 33-patient crossover trial and not reproduced across 11 randomised trials in 1,216 patients',
        auditFlag: 'contested',
      },
      {
        id: 'lio-a2',
        category: 'measured',
        title: 'The UK price rose over 1,110% in eight years, and the regulator called it illegal',
        laymanSummary:
          'Between 2009 and 2017 the sole British supplier raised the price of a box of these tablets from £20 to £248. NHS spending went from £600,000 a year to over £30 million while the amount prescribed barely changed. The competition regulator fined the company and its former owners £99 million, and the courts upheld it.',
        technicalDetails:
          'The Competition and Markets Authority found in July 2021 that liothyronine tablets had been priced excessively and unfairly in breach of competition law. The price per box rose from £20 to £248 between 2009 and 2017, an increase of over 1,110%. NHS annual spending on the tablets was £600,000 in 2006, over £2.3 million in 2009 and more than £30 million by 2016, while prescribed quantity remained broadly stable. Fines were £40.9 million on Advanz Pharma, £51.9 million on Cinven and £6.2 million on HgCapital — the two private equity firms that had previously owned the business — totalling £99 million. The Competition Appeal Tribunal upheld the decision in August 2023 and the Court of Appeal upheld it again, as announced on 8 May 2025. This is included because it is one of the very few instances anywhere in this file where a pricing decision on an off-patent medicine has been tested in court and found unlawful, and because the United States price for the same molecule moved the other way: the CMS acquisition-cost survey lists a median of US$0.3217 per tablet in August 2026 against US$0.7701 in December 2013.',
        evidenceSource:
          'Competition and Markets Authority, liothyronine tablets excessive and unfair pricing case; UK government press release, 8 May 2025, on the Court of Appeal upholding the £99 million fine',
        measuredMetric:
          'Price per box, NHS annual expenditure, and the penalties imposed and upheld on judicial review',
        auditFlag: 'verified',
      },
      {
        id: 'lio-a3',
        category: 'failed',
        title: 'A boxed warning that exists because people died taking it to lose weight',
        laymanSummary:
          'The strongest warning on this drug is not about the thyroid at all. It is that thyroid hormone must never be used for weight loss, because at doses large enough to do anything to weight it can kill — especially alongside a stimulant.',
        technicalDetails:
          'The boxed warning reads: thyroid hormones, including CYTOMEL, either alone or with other therapeutic agents, should not be used for the treatment of obesity or for weight loss; in euthyroid patients, doses within the range of daily hormonal requirements are ineffective for weight reduction; larger doses may produce serious or even life-threatening manifestations of toxicity, particularly when given in association with sympathomimetic amines such as those used for their anorectic effects. Every clause is doing work. Normal-range doses do not reduce weight in people whose thyroid is working, so the only way to use it for weight loss is to overdose it deliberately. The named danger is the combination with stimulant anorectics, which is a specific historical formulation — the mid-century "rainbow diet pills" that paired thyroid extract with amphetamines and digitalis — and the reason this warning exists in this form. It is a boxed warning about a use that was never an indication.',
        evidenceSource:
          'CYTOMEL (liothyronine sodium) United States prescribing information, Boxed Warning (NDA 010379)',
        measuredMetric:
          'The labelled statement that normal-range doses are ineffective for weight reduction in euthyroid patients and that larger doses may be life-threatening',
        auditFlag: 'caution',
      },
      {
        id: 'lio-a4',
        category: 'failed',
        title: 'The oral tablet is banned from the emergency it is most associated with',
        laymanSummary:
          'Myxoedema coma is the crisis where thyroid hormone is given intravenously to save a life. The label for the tablet says in a warning: do not use oral thyroid hormone products to treat myxoedema coma.',
        technicalDetails:
          'Section 5.2 states plainly: do not use oral thyroid hormone drug products to treat myxoedema coma. The reason is absorption: a patient in myxoedema coma has profound gut hypomotility and oedema and cannot reliably absorb anything given by mouth, so the intravenous formulation — marketed separately as Triostat — exists for this indication and the tablet does not substitute for it. This is a rare and useful example of a route restriction that is a genuine safety warning rather than a formality, and it is easily missed because both products carry the same drug name.',
        evidenceSource:
          'CYTOMEL United States prescribing information, Warnings and Precautions 5.2 (NDA 010379)',
        measuredMetric:
          'The labelled prohibition on using oral thyroid hormone products in myxoedema coma',
        auditFlag: 'caution',
      },
      {
        id: 'lio-a5',
        category: 'inferred',
        title: 'The pharmacology argues against the way it is used',
        laymanSummary:
          'Natural thyroid hormone arrives in tissues at a steady trickle. A liothyronine tablet delivers a spike within hours. The reasoning for combination therapy is that it restores something physiological, and the drug’s own kinetics work against that.',
        technicalDetails:
          'The label records that T3 is almost totally absorbed, 95% within four hours; that onset of activity occurs within a few hours with maximum pharmacological response in two to three days; and that T3 is not firmly bound to serum protein, whereas levothyroxine’s higher affinity for thyroid-binding globulin and prealbumin partially explains its higher serum levels and longer half-life. Physiologically, approximately 80% of circulating T3 is derived from peripheral monodeiodination of T4, a process distributed across tissues and locally regulated. A twice-daily immediate-release tablet cannot reproduce that. The argument for combination therapy is that some patients under-convert and need direct T3; the objection is that the delivery mechanism produces supraphysiological peaks and sub-physiological troughs, which is neither restoring normal physiology nor obviously harmless given that the labelled risks — atrial fibrillation, increased cardiac wall thickness, reduced bone mineral density — are all consequences of excess hormone. A sustained-release T3 would test the hypothesis properly and none is marketed.',
        evidenceSource:
          'CYTOMEL United States prescribing information, Clinical Pharmacology 12.1 to 12.3 and Warnings and Precautions 5.1 and 5.6 (NDA 010379)',
        inferredClaim:
          'That giving immediate-release liothyronine restores physiological thyroid hormone delivery — an argument the drug’s own absorption and protein-binding data do not support',
        auditFlag: 'caution',
      },
      {
        id: 'lio-a6',
        category: 'conclusion_shift',
        title: 'The specialty societies reopened a question the meta-analysis had closed',
        laymanSummary:
          'After the null trials, combination therapy was widely written off. In 2021 the American, European and British thyroid societies published a joint document arguing that the question deserves better-designed trials rather than dismissal.',
        technicalDetails:
          'The 2006 meta-analysis concluded that thyroxine monotherapy should remain the treatment of choice for clinical hypothyroidism, and for over a decade that was treated as settled. In 2021 the American Thyroid Association, European Thyroid Association and British Thyroid Association published a joint consensus document on the evidence-based use of levothyroxine and liothyronine combinations, setting out the design features that future trials would need rather than declaring the existing null result final. The grounds for reopening are not new positive data: they are that the existing trials were short, small individually, used fixed rather than individualised ratios, dosed an immediate-release preparation that cannot mimic physiology, and did not select patients by any marker of impaired conversion. That is a reasonable methodological critique and it is also the shape of an argument that can absorb any number of null results. This page records both facts — the null replication record, and the fact that the societies have not accepted it as final — without adjudicating between them.',
        evidenceSource:
          'Jonklaas J, Bianco AC, Cappola AR, et al. Evidence-based use of levothyroxine/liothyronine combinations in treating hypothyroidism: a consensus document. Thyroid 2021;31:156-182',
        doi: '10.1089/thy.2020.0720',
        inferredClaim:
          'That the null combination-therapy trials failed because of their design rather than because the effect is absent — a methodological argument, not a new measurement',
        auditFlag: 'contested',
      },
      {
        id: 'lio-a7',
        category: 'measured',
        title: 'Too much of it damages hearts and bones, and the label is precise about who',
        laymanSummary:
          'The harms of this drug are the harms of an overactive thyroid, because that is what an excessive dose produces: irregular heart rhythm, a thicker heart muscle, and thinning bones.',
        technicalDetails:
          'Section 5.1 states that overtreatment may cause an increase in heart rate, cardiac wall thickness and cardiac contractility and may precipitate angina or arrhythmias, particularly in patients with cardiovascular disease and in the elderly, and directs initiating below full replacement dose in that population; atrial fibrillation is named specifically. Section 5.6 states that over-replacement can increase bone resorption and decrease bone mineral density and directs the lowest effective dose. Section 5.3 requires replacement glucocorticoids before starting in concomitant adrenal insufficiency, to avoid precipitating acute adrenal crisis. Section 5.5 records worsening of glycaemic control with increased antidiabetic or insulin requirements. Section 5.4 frames the whole thing correctly: proper dose titration and careful monitoring is critical to prevent the persistence of hypothyroidism or the development of hyperthyroidism. There is no therapeutic window here in the usual sense — the drug is a hormone, and the adverse effect profile is simply the disease at the other end.',
        evidenceSource:
          'CYTOMEL United States prescribing information, Warnings and Precautions 5.1 to 5.6 (NDA 010379)',
        measuredMetric:
          'Labelled cardiac, skeletal, adrenal and glycaemic consequences of over-replacement, and the populations named as at higher risk',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The active hormone, skipping a step',
        laymanDesc:
          'Your thyroid mostly makes a storage version of the hormone that has to be activated elsewhere. Liothyronine is the activated version, given directly.',
        molecularDetail:
          'L-triiodothyronine, formula C15H12I3NO4, molecular weight 650.97, given as the monosodium salt at 5, 25 and 50 mcg. The label records that approximately 80% of circulating T3 is normally derived from peripheral monodeiodination of T4, and that the physiological actions of thyroid hormones are produced predominantly by T3.',
        iconName: 'Zap',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorbed almost completely, within hours',
        laymanDesc:
          'Nearly all of a dose is absorbed within four hours, and it starts working the same day — where standard thyroxine takes weeks to reach steady levels.',
        molecularDetail:
          'The label states T3 is almost totally absorbed, 95% in four hours, that onset of activity occurs within a few hours, and that maximum pharmacological response occurs within two or three days. Biological half-life is given as about two and a half days. T3 is not firmly bound to serum protein, unlike T4.',
        iconName: 'Timer',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It goes into the nucleus and sits on DNA',
        laymanDesc:
          'Rather than blocking an enzyme on a cell surface, this hormone travels into the cell nucleus and binds a receptor that is already attached to your DNA.',
        molecularDetail:
          'Section 12.1: thyroid hormones exert their physiologic actions through control of DNA transcription and protein synthesis; T3 and T4 diffuse into the cell nucleus and bind to thyroid receptor proteins attached to DNA. Receptor isoforms alpha and beta are distributed differently across tissues, with alpha prominent in heart — the mechanistic origin of the cardiac adverse effects at excess exposure.',
        iconName: 'Dna',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Genes switch on, everywhere',
        laymanDesc:
          'The receptor complex turns on gene transcription. That is why thyroid hormone affects heart rate, temperature, bone turnover, cholesterol and how quickly you think, all at once.',
        molecularDetail:
          'The hormone nuclear receptor complex activates gene transcription and synthesis of messenger RNA and cytoplasmic proteins. Because the target is a transcription factor present in essentially every nucleated cell, there is no tissue selectivity to be engineered and no way to separate the wanted effects from the unwanted ones except by dose.',
        iconName: 'Network',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'A peak the body never produces',
        laymanDesc:
          'Natural conversion delivers this hormone as a steady trickle. A tablet delivers a surge and then a decline, which is the main pharmacological objection to using it this way.',
        molecularDetail:
          'Immediate-release T3 dosed once or twice daily produces supraphysiological peaks and sub-physiological troughs against the near-constant delivery of locally regulated peripheral deiodination. No sustained-release liothyronine is marketed, which means the hypothesis that patients need steadier T3 has never been tested with a preparation capable of providing it.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'And on the outcomes people care about, no difference',
        laymanDesc:
          'Across eleven randomised trials in over twelve hundred patients, adding this drug to standard treatment did not improve depression, fatigue, quality of life, weight or cholesterol.',
        molecularDetail:
          'Meta-analysis of 11 randomised trials, 1,216 patients: depression SMD 0.07 (95% CI −0.20 to 0.34), fatigue SMD −0.12 (−0.33 to 0.09), quality of life SMD 0.03 (−0.09 to 0.15), with no differences in bodily pain, anxiety, body weight, cholesterol, triglycerides, lipoprotein fractions or adverse events. Conclusion: thyroxine monotherapy should remain the treatment of choice for clinical hypothyroidism.',
        iconName: 'Scale',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Bunevicius crossover trial (N Engl J Med 1999;340:424-429)',
        phase: 'Randomised, double-blind, crossover, two five-week periods',
        sampleSize: 33,
        primaryEndpoint:
          'Cognitive performance and mood in patients with hypothyroidism, comparing the usual thyroxine dose with a regimen in which 50 mcg of thyroxine was replaced by 12.5 mcg of triiodothyronine',
        endpointMet: true,
        statisticalPValue:
          'Of 17 cognitive and mood test scores, 6 were better or closer to normal on combination therapy; of 15 visual-analogue mood and physical status scales, 10 were significantly better',
        unreportedAdverseSignals:
          'Thirty-three patients, five-week periods, and 32 separate outcome scores reported without a stated correction for multiple comparisons. Pulse rate and sex hormone-binding globulin were slightly higher on combination therapy, both markers of greater thyroid hormone action. This trial has not been reproduced in the two decades since.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId:
          'Meta-analysis of thyroxine-triiodothyronine combination against thyroxine monotherapy (J Clin Endocrinol Metab 2006;91:2592-2599)',
        phase: 'Systematic review and meta-analysis of 11 randomised controlled trials',
        sampleSize: 1216,
        primaryEndpoint:
          'Bodily pain, depression, anxiety, fatigue, quality of life, body weight, serum cholesterol, triglycerides, lipoprotein fractions and adverse events, comparing combination therapy with thyroxine alone in clinical hypothyroidism',
        endpointMet: false,
        statisticalPValue:
          'Depression SMD 0.07 (95% CI −0.20 to 0.34); fatigue SMD −0.12 (95% CI −0.33 to 0.09); quality of life SMD 0.03 (95% CI −0.09 to 0.15); no differences on any other assessed outcome',
        unreportedAdverseSignals:
          'The constituent trials were individually small and short, used fixed rather than individualised T4:T3 ratios, and selected patients by diagnosis rather than by any marker of impaired peripheral conversion — the methodological grounds on which the 2021 tri-society consensus document argued the question should be retested rather than closed.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No difference between combination therapy and thyroxine alone across 11 randomised trials in 1,216 patients on depression, fatigue, quality of life, bodily pain, anxiety, weight or lipids',
        'Almost complete absorption, 95% within four hours, with onset within a few hours and maximum response in two to three days',
        'A biological half-life of about two and a half days, and weaker serum protein binding than levothyroxine',
        'A United Kingdom price rise from £20 to £248 per box between 2009 and 2017, with NHS spending rising from £600,000 in 2006 to over £30 million by 2016 at broadly stable prescribed quantity',
        'A United States pharmacy acquisition cost of US$0.3217 per tablet in August 2026 against US$0.7701 in December 2013',
      ],
      unsupportedInferences: [
        'That adding liothyronine to levothyroxine improves symptoms in hypothyroidism — one 33-patient crossover trial, and eleven randomised trials that did not reproduce it',
        'That immediate-release liothyronine restores physiological thyroid hormone delivery, when its own absorption data show a peak within hours against near-constant physiological supply',
        'That thyroid hormone is useful for weight loss, which the boxed warning states is ineffective at normal doses and potentially fatal at higher ones',
        'That the null combination trials failed for methodological reasons rather than because the effect is absent — a defensible critique, and not a measurement',
      ],
      whatFailedInitially: [
        'The 1999 crossover result has not been reproduced in more than two decades of randomised trials',
        'The pooled effect estimates for depression, fatigue and quality of life all straddle zero with narrow intervals',
        'Oral liothyronine is prohibited by its own label in myxoedema coma, the emergency the molecule is most associated with',
        'Over-replacement produces atrial fibrillation, increased cardiac wall thickness and reduced bone mineral density, all named in the label',
      ],
      realWorldOutcome: [
        'Approved in 1956 under NDA 010379 and long off patent, with an intravenous formulation marketed separately for myxoedema coma',
        'The Competition and Markets Authority fined Advanz Pharma, Cinven and HgCapital £99 million in July 2021 for excessive and unfair pricing of these tablets; upheld by the Competition Appeal Tribunal in August 2023 and by the Court of Appeal, announced 8 May 2025',
        'United States acquisition cost has more than halved since 2013, to US$0.3217 per tablet',
        'The American, European and British thyroid associations published a joint consensus document in 2021 arguing that combination therapy warrants further trials rather than dismissal',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 5, 25 and 50 mcg (Cytomel); a separate intravenous formulation (Triostat) exists for myxoedema coma',
      description:
        'Almost totally absorbed, 95% within four hours, with onset of activity within a few hours and maximum pharmacological response in two to three days; biological half-life about two and a half days. It is not firmly bound to serum protein, unlike levothyroxine, whose higher affinity for thyroid-binding globulin and prealbumin the label says partially explains its higher serum levels and longer half-life. Metabolised by sequential deiodination with the liver the major site, conjugated with glucuronides and sulfates, excreted into bile and gut with enterohepatic recirculation, and primarily eliminated by the kidneys.',
      safetyProfile:
        'Boxed warning: not for treatment of obesity or for weight loss; in euthyroid patients doses within the range of daily hormonal requirements are ineffective for weight reduction, and larger doses may produce serious or even life-threatening manifestations of toxicity, particularly with sympathomimetic amines used as anorectics. Labelled warnings: cardiac adverse reactions in the elderly and in cardiovascular disease including atrial fibrillation, with initiation below full replacement dose in that group; do not use oral thyroid hormone products for myxoedema coma; acute adrenal crisis in concomitant adrenal insufficiency, requiring replacement glucocorticoids before starting; the need for careful titration to avoid either persistent hypothyroidism or induced hyperthyroidism; worsening of glycaemic control with increased antidiabetic or insulin requirements; and decreased bone mineral density from over-replacement, with the lowest effective dose directed.',
    },
    commonQuestions: [
      {
        q: 'I still feel unwell on levothyroxine. Will adding this fix it?',
        a: 'On the randomised evidence, probably not, and that answer is unsatisfying because the complaint is real. A 1999 crossover trial in 33 people found better mood and cognition when part of the thyroxine dose was swapped for liothyronine, and it is the reason this question exists. Eleven randomised trials in 1,216 patients have since been pooled, and found no difference in depression (standardised mean difference 0.07, 95% CI −0.20 to 0.34), fatigue (−0.12, −0.33 to 0.09), quality of life (0.03, −0.09 to 0.15), bodily pain, anxiety, weight or cholesterol. The meta-analysis concluded thyroxine alone should remain the treatment of choice. In 2021 the American, European and British thyroid societies published a joint document arguing the existing trials were too short, too small and too fixed in their ratios to settle it, and calling for better-designed studies. Both of those things are true at once.',
        auditNote:
          'A consistent null across eleven trials is strong evidence. It is not the same as proof that no subgroup benefits, and nobody has identified such a subgroup prospectively.',
      },
      {
        q: 'Why can it not just be taken once a day like levothyroxine?',
        a: 'Because it does not behave like levothyroxine in the blood. Thyroxine is heavily bound to carrier proteins and has a long half-life, so one daily dose produces steady levels. Liothyronine is not firmly bound to serum protein, is 95% absorbed within four hours, and starts acting within hours — so a tablet produces a peak and then a decline rather than a plateau. Your own body never does that: about 80% of circulating active hormone is normally produced by converting thyroxine, tissue by tissue, at a locally regulated and near-constant rate. This mismatch is the central pharmacological objection to combination therapy, and no sustained-release liothyronine is marketed, so the version of the idea that might work has never been tested.',
      },
      {
        q: 'Can it be used to lose weight?',
        a: 'No, and it is the subject of the drug’s boxed warning. The warning states that thyroid hormones should not be used for the treatment of obesity or weight loss; that in people with normal thyroid function, doses within the range of daily hormonal requirements are ineffective for weight reduction; and that larger doses may produce serious or even life-threatening toxicity, particularly when given with stimulant appetite suppressants. That last clause is not hypothetical — it describes the mid-century combination diet pills that paired thyroid hormone with amphetamines, and the deaths that followed. The only way to use this drug for weight loss is to induce a degree of thyrotoxicosis, which is the condition the antithyroid drugs on the neighbouring pages exist to treat.',
      },
      {
        q: 'Why did this drug become so expensive in the UK?',
        a: 'Because a sole supplier raised the price and a competition regulator found that unlawful. Between 2009 and 2017 the price per box went from £20 to £248, an increase of over 1,110%, while NHS annual spending on it went from £600,000 in 2006 to over £2.3 million in 2009 and more than £30 million by 2016 with prescribed volume broadly unchanged. In July 2021 the Competition and Markets Authority fined Advanz Pharma £40.9 million and its former private equity owners Cinven and HgCapital £51.9 million and £6.2 million, a total of £99 million. The Competition Appeal Tribunal upheld the decision in August 2023 and the Court of Appeal upheld it again, announced on 8 May 2025. The United States market moved in the opposite direction over the same period: acquisition cost there has fallen from about 77 cents a tablet in 2013 to about 32 cents in 2026.',
        auditNote:
          'Same molecule, same decade, opposite price trajectories in two countries. Price is a market fact, not a drug property, and this is the clearest demonstration of it in this file.',
      },
      {
        q: 'What are the real risks of taking it?',
        a: 'They are the risks of having too much thyroid hormone, because that is what an excessive dose is. The label names an increase in heart rate, cardiac wall thickness and contractility, with angina or arrhythmias — atrial fibrillation specifically — particularly in older people and those with heart disease, in whom the label directs starting below full replacement dose. It also names reduced bone mineral density from over-replacement, and directs the lowest effective dose. Two further situations need flagging in advance: if you have adrenal insufficiency, glucocorticoid replacement must be given before thyroid hormone or an adrenal crisis can be precipitated; and if you have diabetes, starting or changing thyroid hormone can worsen glucose control and change insulin requirements.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Bunevicius R, Kazanavicius G, Zalinkevicius R, Prange AJ. Effects of thyroxine as compared with thyroxine plus triiodothyronine in patients with hypothyroidism. N Engl J Med 1999;340:424-429',
        identifier: '10.1056/NEJM199902113400603',
        kind: 'doi',
      },
      {
        label:
          'Grozinsky-Glasberg S, Fraser A, Nahshoni E, Weizman A, Leibovici L. Thyroxine-triiodothyronine combination therapy versus thyroxine monotherapy for clinical hypothyroidism: meta-analysis of randomized controlled trials. J Clin Endocrinol Metab 2006;91:2592-2599',
        identifier: '10.1210/jc.2006-0448',
        kind: 'doi',
      },
      {
        label:
          'Jonklaas J, Bianco AC, Cappola AR, et al. Evidence-based use of levothyroxine/liothyronine combinations in treating hypothyroidism: a consensus document. Thyroid 2021;31:156-182',
        identifier: '10.1089/thy.2020.0720',
        kind: 'doi',
      },
      {
        label:
          'CYTOMEL (liothyronine sodium) United States prescribing information — Boxed Warning, Indications 1.1 to 1.3 and Limitations of Use, Warnings and Precautions 5.1 to 5.6, Description 11, Clinical Pharmacology 12.1 to 12.3 (NDA 010379)',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=010379',
        kind: 'regulatory',
      },
      {
        label:
          'Competition and Markets Authority — liothyronine tablets: suspected excessive and unfair pricing (case page), decision July 2021',
        identifier: 'https://www.gov.uk/cma-cases/pharmaceutical-sector-anti-competitive-conduct',
        kind: 'regulatory',
      },
      {
        label:
          'UK government press release, 8 May 2025 — Court upholds CMA’s £99m fine on pharma over excessive NHS thyroid drug prices',
        identifier:
          'https://www.gov.uk/government/news/court-upholds-cmas-99m-fine-on-pharma-over-excessive-nhs-thyroid-drug-prices',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5920 — liothyronine, canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5920',
        kind: 'url',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost — NDC description LIOTHYRONINE SOD, 2026 file (survey effective 19 August 2026) and 2014 file (survey effective 18 December 2013)',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
]
