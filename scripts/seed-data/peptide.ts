import type { SeedDossier } from '@/lib/seed-types'

/**
 * Peptide and incretin-agonist flagship dossiers.
 *
 * Every citation below was resolved at the time of writing: DOIs through the Crossref API, NCT
 * numbers through the ClinicalTrials.gov v2 API, PMIDs through NCBI E-utilities, sequences and
 * molecular formulae through the current FDA prescribing information on DailyMed, approval dates
 * and marketing status through the Drugs@FDA API, and US acquisition costs through the CMS NADAC
 * dataset (2026 file).
 *
 * Two dossiers deliberately carry no `molecularSchema` and three carry no `pricing`. Retatrutide
 * and survodutide have no amino-acid sequence in any label or peer-reviewed paper this file could
 * check, so none is stated. Tirzepatide, setmelanotide, bremelanotide and tesamorelin have no
 * published cost-of-production estimate that covers them, and a manufacturing cost invented here
 * would be exactly the kind of unsourced number this site exists to flag.
 */

export const PEPTIDE_DOSSIERS: SeedDossier[] = [
  // -------------------------------------------------------------------------------------------
  // Semaglutide
  // -------------------------------------------------------------------------------------------
  {
    slug: 'semaglutide',
    name: 'Semaglutide',
    tradeName: 'Ozempic / Wegovy / Rybelsus',
    sponsor: 'Novo Nordisk',
    targetGene: 'GLP1R',
    targetProtein: 'Glucagon-Like Peptide-1 Receptor',
    modality: 'Peptide / GLP-1 Agonist',
    approvalStatus: 'FDA Approved',
    approvalYear: 2017,
    indication:
      'Type 2 diabetes; chronic weight management; cardiovascular risk reduction in established cardiovascular disease with overweight or obesity; chronic kidney disease in type 2 diabetes',
    patientFriendlyIndication: 'Type 2 diabetes, obesity, and heart and kidney risk that comes with them',
    conditionContext: {
      conditionExplainer:
        'In type 2 diabetes the body still makes insulin but responds to it poorly, so blood glucose stays high. In obesity the brain circuits that decide when eating stops settle at a higher body weight and defend it. The two conditions share machinery, which is why one hormone analogue moves both.',
      whyItMatters:
        'Sustained high glucose damages the small vessels of the kidney, retina and nerves, and both conditions raise the risk of heart attack and stroke. SELECT is the trial that showed lowering weight pharmacologically also lowers cardiovascular events in people without diabetes.',
      whoTakesThis:
        'Adults with type 2 diabetes; adults with a BMI of 30 or more, or 27 or more with a weight-related condition; and adults with established cardiovascular disease plus overweight or obesity.',
      clinicalGoals:
        'Lower HbA1c, produce and hold a double-digit percentage weight reduction, and reduce major adverse cardiovascular events.',
    },
    oneSentenceVerdict:
      'A fatty-acid-anchored copy of the gut hormone GLP-1 that survives a week in the bloodstream, and in a 1,961-person trial cut body weight by 14.9% against 2.4% on placebo at 68 weeks.',
    laymanHowItWorks:
      'After a meal your gut releases a hormone called GLP-1 that tells the brain you have had enough. Natural GLP-1 is destroyed within minutes. Semaglutide is a rebuilt version with a fatty tail that clips onto albumin, the taxi protein of the blood, so one injection lasts a week. While it is there, the stomach empties more slowly and the appetite circuits in the brain run quieter.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 94,
    anatomicalSite: 'Hypothalamic arcuate nucleus, area postrema, pancreatic islet beta cell, gastric antrum',
    pricing: {
      synthesisCostPerDose:
        'Modelled cost-based price of $0.89 to $4.73 per month for injectable semaglutide at 0.77 mg per week, covering active ingredient, formulation, tax and a profit allowance',
      retailPricePerDoseOrYear:
        'US pharmacy acquisition cost: Ozempic $996 per four-dose pen (about one month); Wegovy about $1,307 per month; roughly $12,000 to $15,700 per year',
      markupEstimate:
        'US acquisition cost is roughly 210x to 1,120x the modelled cost-based price for the injectable',
      openPatentNotes:
        'Composition-of-matter protection is still running in the United States. Both the solid-phase route and the recombinant backbone route are described in the open literature, and the cost model assumes an established generic manufacturer working at scale.',
      synthesisComplexity: 'Moderate',
      costSource: {
        label:
          'Barber MJ et al. Estimated Sustainable Cost-Based Prices for Diabetes Medicines. JAMA Netw Open 2024',
        identifier: '10.1001/jamanetworkopen.2024.3474',
        kind: 'doi',
      },
      priceSource: {
        label: 'CMS National Average Drug Acquisition Cost (NADAC) 2026 file',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'Metformin and SGLT2 inhibitors cover the glucose side at a fraction of the cost but do not touch appetite the same way. On the diet side, viscous fibre and fermentable starch raise your own GLP-1 output, which is a real mechanism with a much smaller effect size.',
      conventionalRx: [
        {
          name: 'Metformin',
          class: 'Biguanide, small molecule',
          howItCompares:
            'Lowers hepatic glucose output and improves insulin sensitivity. Typical weight change is a couple of kilograms, not fifteen percent.',
          typicalCost: 'About $1.50 per month (1,000 mg twice daily at US NADAC generic cost)',
          prosAndCons:
            'Pros: six decades of use, pennies per dose, first-line in every major guideline. Cons: no meaningful appetite suppression, and long-term use can lower vitamin B12.',
        },
        {
          name: 'Tirzepatide (Mounjaro / Zepbound)',
          class: 'Dual GIP and GLP-1 receptor agonist',
          howItCompares:
            'In the head-to-head SURMOUNT-5 trial tirzepatide produced 20.2% weight loss against 13.7% for semaglutide at 72 weeks.',
          typicalCost: 'About $1,046 to $1,052 per month (US NADAC)',
          prosAndCons:
            'Pros: larger average weight reduction in a direct comparison. Cons: in SURPASS-CVOT it was noninferior but not superior to dulaglutide for cardiovascular events, so the extra weight loss has not yet translated into fewer heart attacks.',
        },
        {
          name: 'Empagliflozin (Jardiance)',
          class: 'SGLT2 inhibitor',
          howItCompares:
            'Removes glucose through the urine and has its own heart-failure and kidney evidence. Weight loss is modest, in the two to three kilogram range.',
          typicalCost: 'About $336 per month (10 mg daily at US NADAC)',
          prosAndCons:
            'Pros: oral, strong kidney and heart-failure data. Cons: genital mycotic infections, and rare euglycaemic ketoacidosis.',
        },
      ],
      naturalFoods: [
        {
          name: 'Psyllium husk and other viscous soluble fibre',
          activeCompound: 'Arabinoxylan gel-forming polysaccharide',
          biologicalMechanism:
            'Forms a viscous gel that slows gastric emptying and carbohydrate absorption, flattening the post-meal glucose curve. This is the same downstream effect semaglutide produces, reached by a different route and at a much smaller magnitude.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: '10 to 15 grams daily, taken with a full glass of water',
          monthlyCost: '$8 to $15 per month',
        },
        {
          name: 'Resistant starch (cooked and cooled potato, green banana flour, oats)',
          activeCompound: 'Short-chain fatty acids, chiefly butyrate and propionate',
          biologicalMechanism:
            'Colonic fermentation produces short-chain fatty acids that act on FFAR2 and FFAR3 on intestinal L-cells and increase endogenous GLP-1 secretion.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: '15 to 30 grams daily from whole foods or unmodified potato starch',
          monthlyCost: '$10 to $20 per month',
        },
        {
          name: 'Berberine',
          activeCompound: 'Berberine, an isoquinoline alkaloid',
          biologicalMechanism:
            'Mildly inhibits mitochondrial complex I and activates AMPK, overlapping with metformin rather than with GLP-1 signalling. It is not, despite the label it is sold under, a natural version of this drug.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: '500 mg two or three times daily with meals',
          monthlyCost: '$15 to $28 per month',
        },
      ],
      homeRemedies: [
        {
          name: 'Eating protein and vegetables before starch at a meal',
          action: 'Put the protein and non-starchy vegetable portion of a meal first, and the carbohydrate last.',
          patientImpact:
            'Lowers the height of the post-meal glucose rise in small crossover studies, through earlier incretin release and slower gastric emptying.',
          clinicalPrecaution:
            'A sequencing change is not a substitute for glucose-lowering treatment in anyone whose HbA1c is above target.',
        },
        {
          name: 'A short walk after eating',
          action: 'Ten to fifteen minutes of easy walking within half an hour of a main meal.',
          patientImpact:
            'Skeletal muscle takes up glucose through GLUT4 translocation without needing extra insulin, which blunts the post-meal peak.',
          clinicalPrecaution:
            'Anyone using insulin or a sulfonylurea should be aware that added activity can lower glucose further than expected.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      sequence5to3:
        'HA(residue 2 is 2-aminoisobutyric acid, position 8 in GLP-1 numbering, not alanine)EGTFTSDVSSYLEGQAAK(AEEA-AEEA-gamma-Glu-C18 diacid on Lys26)EFIAWLVRGRG',
      chemicalFormula: 'C187H291N45O59',
      molecularWeight: '4113.58 g/mol',
      targetReceptorAffinity: 'Selective GLP-1 receptor agonist; no measurable GIP or glucagon receptor activity',
      structureSource: {
        label: 'OZEMPIC (semaglutide) injection, US prescribing information, section 11, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42bdd912-2393-44c4-b7e0-47672ca28991',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'sema-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming amino acid and resin qualification',
          description:
            'Confirm identity and enantiomeric purity of each Fmoc-protected residue and measure resin substitution before any coupling begins, since a single wrong residue propagates through every subsequent cycle.',
          reagentsAndBuffer: 'Fmoc-amino acid reference standards, chiral HPLC, Fmoc release assay at 301 nm',
        },
        {
          id: 'sema-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fmoc solid-phase assembly of the 31-residue backbone',
          description:
            'Sequential coupling on a low-loading resin, with 2-aminoisobutyric acid installed at position 8 and an orthogonally protected lysine at position 26 so the side chain can be addressed later.',
          dependsOnStepId: 'sema-w1',
          reagentsAndBuffer:
            'Fmoc-amino acids, HBTU or DIC/Oxyma activation, DMF, 20% piperidine in DMF for deprotection',
        },
        {
          id: 'sema-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Cleavage and preparative reverse-phase HPLC of the unacylated peptide',
          description:
            'Cleave from resin, precipitate in cold ether, then separate full-length peptide from deletion sequences on a C18 column.',
          dependsOnStepId: 'sema-w2',
          reagentsAndBuffer:
            'TFA/TIS/water cleavage cocktail, cold diethyl ether, 0.1% TFA in water and in acetonitrile as mobile phases',
        },
        {
          id: 'sema-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Lys26 side-chain acylation with the AEEA-AEEA-gamma-Glu-C18 diacid arm',
          description:
            'Selectively acylate the free lysine side chain in solution. This arm is what binds albumin and turns a minutes-long half-life into about a week.',
          dependsOnStepId: 'sema-w3',
          reagentsAndBuffer:
            'AEEA-AEEA-gamma-Glu(OtBu)-octadecanedioic acid mono-tert-butyl ester activated ester, DIPEA in NMP, followed by global deprotection',
        },
        {
          id: 'sema-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'GLP-1 receptor cAMP potency assay and identity confirmation',
          description:
            'Measure agonist potency in cells stably expressing human GLP-1R and confirm intact mass and acylation site by LC-MS peptide mapping.',
          dependsOnStepId: 'sema-w4',
          reagentsAndBuffer: 'HEK293 hGLP-1R line, HTRF cAMP detection kit, trypsin digest with LC-MS/MS',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sema-1',
        category: 'measured',
        title: 'STEP 1: 14.9% mean weight loss at 68 weeks in adults without diabetes',
        laymanSummary:
          'In 1,961 adults, weight fell 14.9% on semaglutide and 2.4% on placebo. Half the treated group lost 15% or more of their body weight.',
        technicalDetails:
          'Double-blind, 68-week trial, 2:1 randomisation, semaglutide 2.4 mg weekly plus lifestyle intervention. Mean weight change -14.9% versus -2.4%, treatment difference -12.4 percentage points (95% CI -13.4 to -11.5, P<0.001). Weight reduction of at least 15% in 50.5% versus 4.9%.',
        evidenceSource: 'Wilding JPH et al. N Engl J Med 2021;384:989-1002 (NCT03548935)',
        doi: '10.1056/NEJMoa2032183',
        measuredMetric: 'Percentage change in body weight at week 68',
        auditFlag: 'verified',
      },
      {
        id: 'sema-2',
        category: 'measured',
        title: 'SELECT: 20% relative reduction in major cardiovascular events without diabetes',
        laymanSummary:
          'In 17,604 people who had heart disease and excess weight but not diabetes, semaglutide cut the rate of cardiovascular death, heart attack or stroke from 8.0% to 6.5% over about three and a half years.',
        technicalDetails:
          'Event-driven superiority trial. Primary composite occurred in 569/8,803 (6.5%) versus 701/8,801 (8.0%); hazard ratio 0.80 (95% CI 0.72 to 0.90, P<0.001). Permanent discontinuation for adverse events was 16.6% versus 8.2%.',
        evidenceSource: 'Lincoff AM et al. N Engl J Med 2023;389:2221-2232 (NCT03574597)',
        doi: '10.1056/NEJMoa2307563',
        measuredMetric: 'Time to first cardiovascular death, nonfatal myocardial infarction or nonfatal stroke',
        auditFlag: 'verified',
      },
      {
        id: 'sema-3',
        category: 'inferred',
        title: 'The claim that treatment resets metabolism permanently',
        laymanSummary:
          'It does not. In the STEP 1 extension, people who stopped regained about two thirds of what they had lost within a year, and the blood-pressure and lipid improvements drifted back with it.',
        technicalDetails:
          'Off-treatment extension in 327 participants. Mean loss to week 68 was 17.3%; by week 120, one year after withdrawal, 11.6 percentage points had been regained, leaving a net 5.6% below baseline. Most cardiometabolic variables reverted toward baseline.',
        evidenceSource: 'Wilding JPH et al. Diabetes Obes Metab 2022;24:1553-1564',
        doi: '10.1111/dom.14725',
        inferredClaim:
          'That a course of treatment produces a durable metabolic change that persists after stopping',
        measuredMetric: 'Percentage of lost weight regained one year after withdrawal',
        auditFlag: 'caution',
      },
      {
        id: 'sema-4',
        category: 'failed',
        title: 'evoke and evoke+: the Alzheimer disease hypothesis did not hold',
        laymanSummary:
          'Two phase 3 trials, 1,840 people each, tested whether semaglutide slows early Alzheimer disease. The main cognitive readout at two years was negative and the sponsor declared the programme a failure.',
        technicalDetails:
          'evoke (NCT04777396) and evoke+ (NCT04777409) each enrolled 1,840 participants with early Alzheimer disease. The interim readout of CDR-SB at week 104 did not separate from placebo. A later independent reanalysis of the published means reported scattered differences at weeks 130 and 156 on secondary scales, which is hypothesis-generating and not a positive trial.',
        evidenceSource: 'Rohn TT. J Alzheimers Dis 2026, revisiting the evoke and evoke+ trials',
        doi: '10.1177/13872877261458402',
        inferredClaim: 'That GLP-1 receptor agonism is neuroprotective in humans',
        auditFlag: 'verified',
      },
      {
        id: 'sema-5',
        category: 'conclusion_shift',
        title: 'The eye-injury signal moved from alarm to a low, uncertain risk',
        laymanSummary:
          'Reports linked semaglutide to a rare optic-nerve stroke called NAION. The two main US eye societies reviewed the evidence and concluded the risk, if real, is small, and that the studies behind it are observational.',
        technicalDetails:
          'Joint consensus statement of the North American Neuro-Ophthalmology Society and the American Academy of Ophthalmology. Available evidence is retrospective and drawn largely from electronic health record and claims data; several studies report a small possible increase, others report none, and the absolute magnitude remains low. Shared decision-making rather than blanket discontinuation is advised.',
        evidenceSource: 'NANOS and AAO consensus statement. Ophthalmology 2026',
        doi: '10.1016/j.ophtha.2026.04.008',
        auditFlag: 'contested',
      },
      {
        id: 'sema-6',
        category: 'measured',
        title: 'The manufacturing cost and the price are not in the same order of magnitude',
        laymanSummary:
          'A peer-reviewed cost model puts sustainable manufacture of injectable semaglutide at under five dollars a month. US pharmacies acquire it for around a thousand.',
        technicalDetails:
          'Cost-based price modelled from active-pharmaceutical-ingredient shipment data, formulation cost, operating expense, tax and a 10% margin: $0.89 to $4.73 per month at 0.77 mg weekly. A separate estimated-minimum-price analysis put a 30-day course at $40. US NADAC in the 2026 file is $996 for a four-dose Ozempic pen.',
        evidenceSource:
          'Barber MJ et al. JAMA Netw Open 2024; Levi J et al. Obesity 2023; CMS NADAC 2026',
        doi: '10.1001/jamanetworkopen.2024.3474',
        measuredMetric: 'Modelled cost-based price versus published national acquisition cost',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Weekly injection, then a grip on albumin',
        laymanDesc:
          'The drug goes in under the skin once a week. Its fatty tail latches onto albumin, the blood protein that carries fats around, which stops the kidneys from clearing it quickly.',
        molecularDetail:
          'The C18 diacid arm on Lys26 binds human serum albumin reversibly. Combined with the Aib substitution at position 8, which blocks DPP-4 cleavage, this extends the terminal half-life to roughly one week.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Reaching brain regions that sit outside the blood-brain barrier',
        laymanDesc:
          'It reaches the hunger-control parts of the brain through gateways where the usual barrier is deliberately leaky.',
        molecularDetail:
          'Access is through circumventricular organs, chiefly the area postrema and median eminence, and by transport into the arcuate nucleus, where GLP-1R-expressing POMC neurons are activated and NPY/AgRP tone falls.',
        iconName: 'Brain',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binding GLP-1 receptors on the beta cell',
        laymanDesc:
          'In the pancreas it tells insulin-producing cells to respond harder, but only when blood sugar is already high, which is why it rarely causes lows on its own.',
        molecularDetail:
          'Agonism at the class B GPCR GLP-1R raises intracellular cAMP through Gs and adenylyl cyclase, amplifying glucose-stimulated insulin secretion and suppressing glucagon in a glucose-dependent way.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Slowing the stomach and quieting the appetite loop',
        laymanDesc:
          'Food leaves the stomach more slowly and the drive to eat drops, so people eat less without deciding to.',
        molecularDetail:
          'Vagal cholinergic input to the gastric fundus and antrum is inhibited, delaying solid-phase emptying, while central GLP-1R signalling lowers the defended body-weight set point.',
        iconName: 'Timer',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Sustained energy deficit, and what follows from it',
        laymanDesc:
          'Over a year, that daily deficit shows up as double-digit weight loss, better blood sugar, and in people with heart disease, fewer heart attacks and strokes.',
        molecularDetail:
          'Chronic agonism produces a maintained caloric deficit with loss of visceral and hepatic fat, lower HbA1c, and in SELECT a 20% relative reduction in three-point MACE. Roughly 40% of the lost mass is lean tissue, which is the ordinary composition of diet-induced loss.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'STEP 1 (NCT03548935)',
        phase: 'Phase 3',
        sampleSize: 1961,
        primaryEndpoint: 'Percentage change in body weight at week 68',
        endpointMet: true,
        statisticalPValue: 'P < 0.001',
        unreportedAdverseSignals:
          'Discontinuation for gastrointestinal events 4.5% versus 0.8%; gallbladder disorders more frequent on treatment',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SELECT (NCT03574597)',
        phase: 'Phase 3',
        sampleSize: 17604,
        primaryEndpoint: 'Cardiovascular death, nonfatal myocardial infarction or nonfatal stroke',
        endpointMet: true,
        statisticalPValue: 'P < 0.001, hazard ratio 0.80',
        unreportedAdverseSignals:
          'Permanent discontinuation for adverse events 16.6% versus 8.2%, a difference larger than the event reduction itself',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SUSTAIN-6 (NCT01720446)',
        phase: 'Phase 3',
        sampleSize: 3297,
        primaryEndpoint: 'Cardiovascular death, nonfatal myocardial infarction or nonfatal stroke in type 2 diabetes',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 for noninferiority',
        unreportedAdverseSignals: 'Increased rate of diabetic retinopathy complications in the semaglutide arm',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'evoke (NCT04777396)',
        phase: 'Phase 3',
        sampleSize: 1840,
        primaryEndpoint: 'Change in Clinical Dementia Rating Sum of Boxes in early Alzheimer disease',
        endpointMet: false,
        statisticalPValue: 'Not met at the week 104 readout',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '14.9% mean body weight reduction at 68 weeks versus 2.4% on placebo (STEP 1, n=1,961)',
        '20% relative reduction in three-point MACE in cardiovascular disease with overweight or obesity (SELECT, n=17,604)',
        'Two thirds of lost weight regained within one year of stopping (STEP 1 extension, n=327)',
      ],
      unsupportedInferences: [
        'That the metabolic change persists after treatment stops',
        'That it slows Alzheimer disease, which two phase 3 trials of 1,840 people each tested and did not show',
        'That the SELECT cardiovascular benefit is separable from the weight loss that produced it; the trial was not designed to answer that',
      ],
      whatFailedInitially: [
        'Oral peptide delivery: bioavailability was around 1% until the SNAC absorption enhancer made Rybelsus workable',
        'The Alzheimer disease programme, declared a failure on its week 104 primary readout',
      ],
      realWorldOutcome: [
        'Very high effectiveness where treatment continues; discontinuation within a year is common and is driven by cost and gastrointestinal tolerance',
        'A large grey market of unprescribed vials sold for research use only has grown alongside the licensed product',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous once-weekly pen, or oral tablet formulated with the SNAC absorption enhancer',
      description:
        'Prefilled multi-dose or single-dose pens for weekly subcutaneous injection. The oral form pairs the peptide with sodium N-(8-[2-hydroxybenzoyl]amino) caprylate, which transiently raises gastric absorption enough to make a peptide tablet viable.',
      safetyProfile:
        'Nausea, vomiting, diarrhoea and constipation are common and mostly early. Gallbladder disease and pancreatitis are uncommon but real. A rare optic-nerve event, NAION, is under review with an uncertain and low absolute risk. Contraindicated with a personal or family history of medullary thyroid carcinoma or MEN2.',
    },
    commonQuestions: [
      {
        q: 'If I stop, do I get the weight back?',
        a: 'Most of it, on the evidence available. In the STEP 1 extension, participants regained about two thirds of their lost weight in the year after stopping, and the improvements in blood pressure and lipids faded with it. The trials treat obesity as a chronic condition requiring continued treatment.',
        auditNote: 'Measured directly in 327 people, not inferred.',
      },
      {
        q: 'Does it protect the heart, or is that just the weight loss?',
        a: 'SELECT measured a 20% relative reduction in heart attack, stroke and cardiovascular death. What it cannot tell you is how much of that came from weight loss, how much from blood pressure and inflammation, and how much from a direct vascular effect. The trial had no arm designed to separate them.',
        auditNote: 'The outcome is measured. The mechanism attribution is inferred.',
      },
      {
        q: 'Why is it about a thousand dollars a month in the US?',
        a: 'Not because of what it costs to make. A peer-reviewed cost model that includes ingredient, formulation, operating cost, tax and profit puts sustainable manufacture at under five dollars a month. The gap is pricing power under patent in a market without direct negotiation, not manufacturing difficulty.',
        auditNote: 'Both figures are published and checkable; the comparison is arithmetic.',
      },
      {
        q: 'Does it cause muscle loss?',
        a: 'Body composition studies show roughly 40% of the mass lost is lean tissue, which is close to what any comparable weight loss produces. What nobody has measured in a powered trial is whether that lean loss changes strength, falls or mortality years later.',
        auditNote: 'Composition is measured. Long-term functional consequence is unknown.',
      },
      {
        q: 'Is it safe in people who are not overweight?',
        a: 'No trial has tested it there. Every efficacy and safety dataset above comes from people with type 2 diabetes, obesity or overweight with a related condition. Use outside those groups sits entirely outside the evidence.',
        auditNote: 'Unknown, not negative.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'Wilding JPH et al. Once-Weekly Semaglutide in Adults with Overweight or Obesity. NEJM 2021',
        identifier: '10.1056/NEJMoa2032183',
        kind: 'doi',
      },
      {
        label: 'Lincoff AM et al. Semaglutide and Cardiovascular Outcomes in Obesity without Diabetes. NEJM 2023',
        identifier: '10.1056/NEJMoa2307563',
        kind: 'doi',
      },
      {
        label: 'Marso SP et al. Semaglutide and Cardiovascular Outcomes in Type 2 Diabetes (SUSTAIN-6). NEJM 2016',
        identifier: '10.1056/NEJMoa1607141',
        kind: 'doi',
      },
      {
        label: 'Wilding JPH et al. Weight regain after withdrawal of semaglutide: STEP 1 extension. DOM 2022',
        identifier: '10.1111/dom.14725',
        kind: 'doi',
      },
      {
        label: 'Barber MJ et al. Estimated Sustainable Cost-Based Prices for Diabetes Medicines. JAMA Netw Open 2024',
        identifier: '10.1001/jamanetworkopen.2024.3474',
        kind: 'doi',
      },
      {
        label: 'Levi J et al. Estimated minimum prices for antiobesity medications. Obesity 2023',
        identifier: '10.1002/oby.23725',
        kind: 'doi',
      },
      {
        label: 'NANOS and AAO consensus statement on GLP-1 receptor agonists and NAION. Ophthalmology 2026',
        identifier: '10.1016/j.ophtha.2026.04.008',
        kind: 'doi',
      },
      {
        label: 'Rohn TT. Semaglutide showed limited improvements in Alzheimer disease. J Alzheimers Dis 2026',
        identifier: '10.1177/13872877261458402',
        kind: 'doi',
      },
      { label: 'STEP 1 trial record', identifier: 'NCT03548935', kind: 'nct' },
      { label: 'SELECT trial record', identifier: 'NCT03574597', kind: 'nct' },
      { label: 'evoke trial record', identifier: 'NCT04777396', kind: 'nct' },
      {
        label: 'OZEMPIC US prescribing information, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42bdd912-2393-44c4-b7e0-47672ca28991',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA NDA 209637 (Ozempic), original approval 5 December 2017',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=209637',
        kind: 'regulatory',
      },
      {
        label: 'CMS National Average Drug Acquisition Cost, 2026 file',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },

  // -------------------------------------------------------------------------------------------
  // Tirzepatide
  // -------------------------------------------------------------------------------------------
  {
    slug: 'tirzepatide',
    name: 'Tirzepatide',
    tradeName: 'Mounjaro / Zepbound',
    sponsor: 'Eli Lilly and Company',
    targetGene: 'GIPR / GLP1R',
    targetProtein: 'Glucose-Dependent Insulinotropic Polypeptide Receptor and Glucagon-Like Peptide-1 Receptor',
    modality: 'Peptide / GLP-1 Agonist',
    approvalStatus: 'FDA Approved',
    approvalYear: 2022,
    indication:
      'Type 2 diabetes (Mounjaro, 2022); chronic weight management and moderate-to-severe obstructive sleep apnoea with obesity (Zepbound, 2023)',
    patientFriendlyIndication: 'Type 2 diabetes, obesity, and obesity-related sleep apnoea',
    conditionContext: {
      conditionExplainer:
        'The gut releases two incretin hormones after a meal, GIP and GLP-1. Every earlier drug in this class copied only GLP-1. Tirzepatide copies both, on one molecule.',
      whyItMatters:
        'Adding GIP receptor activity produced more weight loss than GLP-1 alone in a direct comparison. Whether that extra weight loss buys extra protection from heart attacks is a separate question, and the trial that asked it returned a more modest answer than the weight numbers suggest.',
      whoTakesThis:
        'Adults with type 2 diabetes; adults with a BMI of 30 or more, or 27 or more with a weight-related condition; and adults with obesity and moderate-to-severe obstructive sleep apnoea.',
      clinicalGoals:
        'Lower HbA1c, produce weight reduction in the 15% to 21% range, and reduce apnoea-hypopnoea index in sleep apnoea.',
    },
    oneSentenceVerdict:
      'A single 39-residue peptide that switches on both incretin receptors at once, producing 20.9% mean weight loss at 72 weeks in SURMOUNT-1 and beating semaglutide head-to-head, without yet beating an older GLP-1 on cardiovascular events.',
    laymanHowItWorks:
      'Your gut releases two different "you have eaten" hormones after a meal, GIP and GLP-1. Older drugs in this family imitated one of them. Tirzepatide is a single peptide shaped to fit both receptors, with a long fatty tail that keeps it circulating for about five days. The result is stronger appetite suppression than imitating GLP-1 alone, and, in the one trial that compared them directly, more weight lost.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 90,
    anatomicalSite: 'Hypothalamus, pancreatic islet alpha and beta cells, adipose tissue, gastric antrum',
    substitutes: {
      summary:
        'Semaglutide is the direct comparator and lost the head-to-head on weight but has the larger cardiovascular outcome dataset. Metformin and SGLT2 inhibitors remain the low-cost backbone for glucose. On the diet side, the mechanisms that raise your own incretin output are real but an order of magnitude smaller.',
      conventionalRx: [
        {
          name: 'Semaglutide (Ozempic / Wegovy)',
          class: 'Selective GLP-1 receptor agonist',
          howItCompares:
            'In SURMOUNT-5, 72 weeks, tirzepatide gave 20.2% weight loss against 13.7% for semaglutide. Semaglutide has the larger cardiovascular outcome trial behind it.',
          typicalCost: 'About $996 to $1,307 per month (US NADAC)',
          prosAndCons:
            'Pros: SELECT showed a 20% MACE reduction. Cons: less weight loss in the only direct comparison.',
        },
        {
          name: 'Metformin',
          class: 'Biguanide, small molecule',
          howItCompares:
            'Covers the glucose side only, with a weight change measured in kilograms rather than tens of percent.',
          typicalCost: 'About $1.50 per month (US NADAC generic cost)',
          prosAndCons: 'Pros: cheapest effective glucose-lowering agent in existence. Cons: no appetite effect.',
        },
        {
          name: 'Bariatric surgery (sleeve gastrectomy or gastric bypass)',
          class: 'Surgical',
          howItCompares:
            'Produces weight loss of a similar or larger magnitude with decades of durability data, at the cost of an operation.',
          typicalCost: 'One-time procedure, commonly $15,000 to $25,000 in the US before insurance',
          prosAndCons:
            'Pros: durable, one intervention rather than an indefinite prescription. Cons: operative risk, permanent anatomical change, lifelong micronutrient monitoring.',
        },
      ],
      naturalFoods: [
        {
          name: 'Whey protein taken before a meal',
          activeCompound: 'Branched-chain amino acids and bioactive peptides',
          biologicalMechanism:
            'A protein preload stimulates endogenous GLP-1 and GIP release from intestinal K and L cells and slows gastric emptying, which is the same lever the drug pulls, at a far smaller amplitude.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: '15 to 25 grams before the largest meal of the day',
          monthlyCost: '$20 to $35 per month',
        },
        {
          name: 'Viscous soluble fibre (psyllium, oat beta-glucan)',
          activeCompound: 'Gel-forming polysaccharides',
          biologicalMechanism:
            'Slows gastric emptying and nutrient absorption, lowering the post-meal glucose and insulin excursion.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: '10 to 15 grams daily with adequate water',
          monthlyCost: '$8 to $15 per month',
        },
      ],
      homeRemedies: [
        {
          name: 'Resistance training alongside weight loss',
          action: 'Two to three sessions a week of progressive loading of the major muscle groups.',
          patientImpact:
            'Weight lost on an incretin agonist includes a substantial lean fraction. Resistance training is the intervention with the best evidence for reducing that fraction.',
          clinicalPrecaution:
            'Energy intake is often very low on treatment; training on inadequate protein and calories will not preserve muscle on its own.',
        },
        {
          name: 'Slow, structured meals during dose escalation',
          action: 'Smaller portions eaten slowly, stopping at the first sign of fullness, in the weeks after a dose increase.',
          patientImpact:
            'Most nausea and vomiting on this class occurs during escalation and is dose- and volume-related.',
          clinicalPrecaution:
            'Persistent vomiting, severe abdominal pain radiating to the back, or an inability to keep fluids down needs urgent medical review, not a dietary adjustment.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      sequence5to3:
        'YA(residue 2 is 2-aminoisobutyric acid, not alanine)EGTFTSDYSIA(residue 13 is 2-aminoisobutyric acid, not alanine)LDKIAQK(AEEA-AEEA-gamma-Glu-C20 eicosanedioic diacid on Lys20)AFVQWLIAGGPSSGAPPPS(C-terminal amide)',
      chemicalFormula: 'C225H348N48O68',
      molecularWeight: '4813.53 Da',
      targetReceptorAffinity:
        'Balanced dual agonist; affinity at the GIP receptor is comparable to native GIP, and at the GLP-1 receptor is lower than native GLP-1',
      structureSource: {
        label: 'MOUNJARO (tirzepatide) injection, US prescribing information, section 11, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=0818426a-53eb-4db7-9609-bbae1e7a3964',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'tirz-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Building-block qualification including the Aib residue',
          description:
            'Confirm identity and purity of Fmoc-Aib-OH and every standard residue. Aib is sterically hindered and couples poorly, so its quality drives the yield of the whole assembly.',
          reagentsAndBuffer: 'Fmoc-Aib-OH reference standard, chiral HPLC, Karl Fischer moisture titration',
        },
        {
          id: 'tirz-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fmoc solid-phase assembly of the 39-residue GIP-based backbone',
          description:
            'Assemble on a Rink amide resin to give the C-terminal amide, with double couplings at the two Aib positions and an orthogonally protected lysine at position 20.',
          dependsOnStepId: 'tirz-w1',
          reagentsAndBuffer:
            'Fmoc-amino acids, Rink amide resin, DIC/Oxyma activation, DMF, 20% piperidine deprotection',
        },
        {
          id: 'tirz-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Cleavage and preparative reverse-phase chromatography',
          description:
            'Cleave, precipitate and separate the full-length backbone from deletion and Aib-truncation sequences on a C18 stationary phase.',
          dependsOnStepId: 'tirz-w2',
          reagentsAndBuffer: 'TFA/TIS/water/EDT cleavage cocktail, cold diethyl ether, acetonitrile-water with 0.1% TFA',
        },
        {
          id: 'tirz-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Lys20 acylation with the C20 diacid arm',
          description:
            'Acylate the free lysine side chain with the AEEA-AEEA-gamma-Glu-eicosanedioic acid arm. The C20 chain gives tighter albumin binding than semaglutide C18 arm.',
          dependsOnStepId: 'tirz-w3',
          reagentsAndBuffer: 'Activated ester of the protected C20 diacid arm, DIPEA in NMP, then global deprotection',
        },
        {
          id: 'tirz-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Dual-receptor cAMP potency panel',
          description:
            'Measure cAMP accumulation separately in cells expressing human GIPR and human GLP-1R, since the therapeutic identity of this molecule is the ratio between the two, not either alone.',
          dependsOnStepId: 'tirz-w4',
          reagentsAndBuffer: 'HEK293 hGIPR and hGLP-1R stable lines, HTRF cAMP kit, LC-MS intact mass confirmation',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tirz-1',
        category: 'measured',
        title: 'SURMOUNT-1: 20.9% mean weight loss at 72 weeks on the 15 mg dose',
        laymanSummary:
          'In 2,539 adults with obesity and without diabetes, the highest dose produced a fifth of body weight lost. More than half the group on 15 mg lost at least 20%.',
        technicalDetails:
          'Phase 3, four arms, 72 weeks. Mean weight change -15.0%, -19.5% and -20.9% for 5, 10 and 15 mg versus -3.1% for placebo (P<0.001 for all). Weight reduction of at least 20% reached by 57% on 15 mg versus 3% on placebo.',
        evidenceSource: 'Jastreboff AM et al. N Engl J Med 2022;387:205-216 (NCT04184622)',
        doi: '10.1056/NEJMoa2206038',
        measuredMetric: 'Percentage change in body weight at week 72',
        auditFlag: 'verified',
      },
      {
        id: 'tirz-2',
        category: 'measured',
        title: 'SURMOUNT-5: beat semaglutide head-to-head, 20.2% against 13.7%',
        laymanSummary:
          'The only direct comparison, 751 adults over 72 weeks. Tirzepatide produced more weight loss and a larger waist reduction than semaglutide.',
        technicalDetails:
          'Phase 3b, open-label, maximum tolerated dose in each arm. Least-squares mean weight change -20.2% (95% CI -21.4 to -19.1) versus -13.7% (95% CI -14.9 to -12.6), P<0.001. Waist circumference -18.4 cm versus -13.0 cm.',
        evidenceSource: 'Aronne LJ et al. N Engl J Med 2025 (NCT05822830)',
        doi: '10.1056/NEJMoa2416394',
        measuredMetric: 'Percentage change in body weight at week 72, direct comparison',
        auditFlag: 'verified',
      },
      {
        id: 'tirz-3',
        category: 'inferred',
        title: 'That more weight loss must mean fewer cardiovascular events',
        laymanSummary:
          'SURPASS-CVOT put tirzepatide against dulaglutide, an older and much cheaper GLP-1 agonist, in 13,299 people. Tirzepatide was not worse. It was not shown to be better either.',
        technicalDetails:
          'Active-comparator noninferiority trial in type 2 diabetes with atherosclerotic disease. Primary composite in 801/6,586 (12.2%) on tirzepatide versus 862/6,579 (13.1%) on dulaglutide; hazard ratio 0.92 (95.3% CI 0.83 to 1.01), P=0.003 for noninferiority, P=0.09 for superiority.',
        evidenceSource: 'Nicholls SJ et al. N Engl J Med 2025 (NCT04255433)',
        doi: '10.1056/NEJMoa2505928',
        inferredClaim:
          'That the larger weight loss with tirzepatide converts into a larger reduction in heart attacks and strokes',
        measuredMetric: 'Three-point MACE versus an active GLP-1 comparator',
        auditFlag: 'caution',
      },
      {
        id: 'tirz-4',
        category: 'measured',
        title: 'SURMOUNT-OSA: apnoea events fell, in a trial that measured apnoea events',
        laymanSummary:
          'In 469 adults with obesity and moderate-to-severe obstructive sleep apnoea, the apnoea-hypopnoea index fell substantially, and this became a licensed indication in 2024.',
        technicalDetails:
          'Two 52-week phase 3 trials, with and without positive airway pressure therapy, reporting change in apnoea-hypopnoea index as the primary endpoint.',
        evidenceSource: 'Malhotra A et al. N Engl J Med 2024 (NCT05412004)',
        doi: '10.1056/NEJMoa2404881',
        measuredMetric: 'Change in apnoea-hypopnoea index at week 52',
        auditFlag: 'verified',
      },
      {
        id: 'tirz-5',
        category: 'inferred',
        title: 'No published cost-of-production estimate covers this molecule',
        laymanSummary:
          'The peer-reviewed cost models that exist for semaglutide, liraglutide, dulaglutide and exenatide do not produce a figure for tirzepatide. Anyone quoting one is quoting something unsourced.',
        technicalDetails:
          'The 2024 JAMA Network Open cost-based-price analysis covers insulins, SGLT2 inhibitors and four GLP-1 agonists, but not tirzepatide. The 2023 Obesity estimated-minimum-price paper searched tirzepatide prices but reported estimated minimum prices only for semaglutide, liraglutide, orlistat, phentermine/topiramate and naltrexone/bupropion. This dossier therefore carries no pricing block.',
        evidenceSource: 'Barber MJ et al. JAMA Netw Open 2024; Levi J et al. Obesity 2023',
        doi: '10.1002/oby.23725',
        inferredClaim: 'Any specific per-dose manufacturing cost quoted for tirzepatide',
        auditFlag: 'caution',
      },
      {
        id: 'tirz-6',
        category: 'conclusion_shift',
        title: 'Compounded and research-use-only tirzepatide moved from fringe to mainstream and back',
        laymanSummary:
          'While supply was short, compounded copies were legal in the US. When the shortage ended, that route closed, and a large unregulated market selling vials for research use only did not.',
        technicalDetails:
          'A pharmacy-practice analysis documents manufacturers selling semaglutide and tirzepatide vials direct to consumers labelled for research purposes only or not for human consumption, frequently without reconstitution supplies, dosing information, prescriber oversight or quality standards.',
        evidenceSource:
          'Ann Pharmacother 2025: Bypassing Prescribers and Pharmacists: Online Purchasing of Semaglutide and Tirzepatide For Research Purposes',
        doi: '10.1177/10600280241277551',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Weekly injection with a twenty-carbon anchor',
        laymanDesc:
          'The molecule carries a longer fatty tail than semaglutide, which grips albumin more tightly and keeps a steady level across the week.',
        molecularDetail:
          'The C20 eicosanedioic diacid arm on Lys20, plus Aib at positions 2 and 13 blocking DPP-4 cleavage, give a half-life of about five days.',
        iconName: 'Anchor',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Two receptors, one molecule',
        laymanDesc:
          'It docks into two different hormone receptors. Everything before it in this class docked into one.',
        molecularDetail:
          'The backbone is derived from GIP and engineered to retain GIP receptor agonism while acquiring GLP-1 receptor agonism, with unbalanced potency favouring GIPR.',
        iconName: 'Layers',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Beta cell and alpha cell signalling',
        laymanDesc:
          'In the pancreas it increases insulin release when glucose is high and reduces the hormone that raises glucose.',
        molecularDetail:
          'Both receptors are Gs-coupled and raise cAMP. GIPR agonism adds an effect on alpha cells and on adipose tissue that GLP-1R agonism alone does not have.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Appetite suppression plus an adipose-tissue effect',
        laymanDesc:
          'Appetite falls as with any drug in this class, and there appears to be an additional effect on how fat tissue handles energy.',
        molecularDetail:
          'Central GLP-1R and GIPR signalling suppress food intake; GIPR signalling in adipocytes is proposed to improve lipid buffering and insulin sensitivity, though the human evidence for that mechanism is indirect.',
        iconName: 'Flame',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The largest average weight loss of any approved drug, so far',
        laymanDesc:
          'At the top dose, about a fifth of body weight over 72 weeks, plus lower HbA1c and fewer apnoea events during sleep.',
        molecularDetail:
          'Mean -20.9% at 72 weeks in SURMOUNT-1, HbA1c reduction of up to 2.30 percentage points in SURPASS-2, and a reduced apnoea-hypopnoea index in SURMOUNT-OSA.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SURMOUNT-1 (NCT04184622)',
        phase: 'Phase 3',
        sampleSize: 2539,
        primaryEndpoint: 'Percentage change in body weight at week 72',
        endpointMet: true,
        statisticalPValue: 'P < 0.001',
        unreportedAdverseSignals: 'Gastrointestinal adverse events concentrated in the 20-week escalation period',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SURPASS-2 (NCT03987919)',
        phase: 'Phase 3',
        sampleSize: 1879,
        primaryEndpoint: 'Change in HbA1c at week 40 versus semaglutide 1 mg',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 for the 10 mg and 15 mg doses',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SURMOUNT-5 (NCT05822830)',
        phase: 'Phase 3b',
        sampleSize: 751,
        primaryEndpoint: 'Percentage change in body weight at week 72 versus semaglutide',
        endpointMet: true,
        statisticalPValue: 'P < 0.001',
        unreportedAdverseSignals: 'Open-label design, so participant and investigator expectation is not controlled',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'SURPASS-CVOT (NCT04255433)',
        phase: 'Phase 3',
        sampleSize: 13299,
        primaryEndpoint: 'Cardiovascular death, myocardial infarction or stroke versus dulaglutide',
        endpointMet: true,
        statisticalPValue: 'P = 0.003 for noninferiority; P = 0.09 for superiority',
        unreportedAdverseSignals: 'More gastrointestinal adverse events than the active comparator',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '20.9% mean weight loss at 72 weeks on 15 mg versus 3.1% on placebo (SURMOUNT-1, n=2,539)',
        '20.2% versus 13.7% against semaglutide in the only head-to-head trial (SURMOUNT-5, n=751)',
        'Noninferior but not superior to dulaglutide for three-point MACE (SURPASS-CVOT, n=13,299)',
      ],
      unsupportedInferences: [
        'That the weight-loss advantage over semaglutide implies a cardiovascular advantage; the outcome trial did not show one',
        'That the GIP receptor component is the reason for the extra weight loss, which no human trial has isolated',
        'Any stated per-dose manufacturing cost, since no published cost model covers this molecule',
      ],
      whatFailedInitially: [
        'Earlier unbalanced GIP/GLP-1 co-agonists in the same programme did not reach the potency needed for a weekly human dose',
        'The superiority hypothesis in SURPASS-CVOT, which was prespecified and not met',
      ],
      realWorldOutcome: [
        'Rapid uptake constrained by cost and by intermittent supply shortages',
        'A large direct-to-consumer market in unapproved vials sold as research chemicals grew alongside the licensed product',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous once-weekly single-dose pen, single-dose vial, or multi-dose KwikPen',
      description:
        'Clear solution supplied at six strengths from 2.5 mg to 15 mg, injected once weekly with a 20-week stepwise escalation to the maintenance dose.',
      safetyProfile:
        'Nausea, diarrhoea, vomiting and constipation are the dominant adverse events and cluster during escalation. Acute pancreatitis, gallbladder disease and acute kidney injury from volume depletion are uncommon. Boxed warning for thyroid C-cell tumours based on rodent data; contraindicated with a personal or family history of medullary thyroid carcinoma or MEN2.',
    },
    commonQuestions: [
      {
        q: 'Is it better than semaglutide?',
        a: 'For weight, in one 751-person open-label trial, yes: 20.2% against 13.7% at 72 weeks. For cardiovascular events, there is no trial comparing the two. Against dulaglutide, an older GLP-1 agonist, tirzepatide was noninferior but not superior.',
        auditNote: 'Better on the measured endpoint that was compared. Untested on the one that was not.',
      },
      {
        q: 'What does the GIP part actually add?',
        a: 'Nobody has run the trial that would answer that. Isolating the GIP contribution would need a GIP-only arm at matched exposure, and no such human trial exists. The extra weight loss is real; the attribution to GIP is a mechanistic inference from animal and cell work.',
        auditNote: 'Unknown, and clearly labelled as unknown.',
      },
      {
        q: 'What does it cost to make?',
        a: 'There is no published answer. The cost-of-production literature covers semaglutide, liraglutide, dulaglutide and exenatide, and stops there. That is why this page shows no pricing block, and why a quoted synthesis cost for tirzepatide should be treated as an unsourced claim.',
        auditNote: 'Absence of a figure is the honest state of the record.',
      },
      {
        q: 'Does it help sleep apnoea because of weight loss, or directly?',
        a: 'SURMOUNT-OSA measured the apnoea-hypopnoea index and it fell. It was not designed to separate the airway effect of losing fat from any independent effect, so the mechanism is inferred and the outcome is measured.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'Jastreboff AM et al. Tirzepatide Once Weekly for the Treatment of Obesity. NEJM 2022',
        identifier: '10.1056/NEJMoa2206038',
        kind: 'doi',
      },
      {
        label: 'Frias JP et al. Tirzepatide versus Semaglutide Once Weekly in Type 2 Diabetes. NEJM 2021',
        identifier: '10.1056/NEJMoa2107519',
        kind: 'doi',
      },
      {
        label: 'Aronne LJ et al. Tirzepatide as Compared with Semaglutide for the Treatment of Obesity. NEJM 2025',
        identifier: '10.1056/NEJMoa2416394',
        kind: 'doi',
      },
      {
        label: 'Cardiovascular Outcomes with Tirzepatide versus Dulaglutide in Type 2 Diabetes. NEJM 2025',
        identifier: '10.1056/NEJMoa2505928',
        kind: 'doi',
      },
      {
        label: 'Malhotra A et al. Tirzepatide for the Treatment of Obstructive Sleep Apnea and Obesity. NEJM 2024',
        identifier: '10.1056/NEJMoa2404881',
        kind: 'doi',
      },
      {
        label: 'Levi J et al. Estimated minimum prices for antiobesity medications. Obesity 2023',
        identifier: '10.1002/oby.23725',
        kind: 'doi',
      },
      {
        label: 'Ann Pharmacother 2025: online purchasing of semaglutide and tirzepatide for research purposes',
        identifier: '10.1177/10600280241277551',
        kind: 'doi',
      },
      { label: 'SURMOUNT-1 trial record', identifier: 'NCT04184622', kind: 'nct' },
      { label: 'SURMOUNT-5 trial record', identifier: 'NCT05822830', kind: 'nct' },
      { label: 'SURPASS-CVOT trial record', identifier: 'NCT04255433', kind: 'nct' },
      {
        label: 'MOUNJARO US prescribing information, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=0818426a-53eb-4db7-9609-bbae1e7a3964',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA NDA 215866 (Mounjaro), original approval 13 May 2022',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=215866',
        kind: 'regulatory',
      },
      {
        label: 'CMS National Average Drug Acquisition Cost, 2026 file',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
]
