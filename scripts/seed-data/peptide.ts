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

  // -------------------------------------------------------------------------------------------
  // Liraglutide
  // -------------------------------------------------------------------------------------------
  {
    slug: 'liraglutide',
    name: 'Liraglutide',
    tradeName: 'Victoza / Saxenda',
    sponsor: 'Novo Nordisk',
    targetGene: 'GLP1R',
    targetProtein: 'Glucagon-Like Peptide-1 Receptor',
    modality: 'Peptide / GLP-1 Agonist',
    approvalStatus: 'FDA Approved',
    approvalYear: 2010,
    indication:
      'Type 2 diabetes and cardiovascular risk reduction in type 2 diabetes with established cardiovascular disease (Victoza, 2010); chronic weight management (Saxenda, 2014)',
    patientFriendlyIndication: 'Type 2 diabetes and long-term weight management',
    conditionContext: {
      conditionExplainer:
        'Liraglutide was the first GLP-1 analogue designed to last a full day rather than minutes, using a palmitic acid arm to hold it on albumin. It was also the first drug in the class to show that lowering cardiovascular events was possible.',
      whyItMatters:
        'LEADER, in 9,340 people, is the trial that turned GLP-1 agonists from glucose-lowering agents into cardiovascular drugs. Everything that followed in this class was designed against that result.',
      whoTakesThis:
        'Adults with type 2 diabetes, particularly with established cardiovascular disease; and, at the higher 3.0 mg dose, adults with obesity or overweight with a weight-related condition, including adolescents from age 12.',
      clinicalGoals:
        'Lower HbA1c by roughly one percentage point, reduce major adverse cardiovascular events, and at the higher dose achieve about 8% weight loss.',
    },
    oneSentenceVerdict:
      'The first once-daily GLP-1 analogue, anchored to albumin by a palmitic acid arm, which cut major cardiovascular events by 13% in 9,340 people with type 2 diabetes and has since been overtaken on both convenience and effect size.',
    laymanHowItWorks:
      'Natural GLP-1 lasts about two minutes in the blood. Liraglutide is the same hormone with one amino acid swapped and a fatty acid chain bolted to a lysine, which makes it stick to albumin and last about half a day. That is enough for one injection a day. It tells the pancreas to release insulin when glucose is high, slows the stomach, and lowers appetite.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 92,
    anatomicalSite: 'Pancreatic islet beta cell, hypothalamic arcuate nucleus, gastric antrum',
    pricing: {
      synthesisCostPerDose:
        'Modelled cost-based price of $21.56 to $50.32 per month at 1.5 mg daily; a separate analysis put a 30-day course at an estimated minimum price of $50',
      retailPricePerDoseOrYear:
        'US pharmacy acquisition cost at 1.8 mg daily: about $790 per month for branded Victoza, about $433 per month for generic liraglutide; Saxenda at 3.0 mg daily is about $1,306 per month',
      markupEstimate:
        'Branded acquisition cost is roughly 16x to 37x the modelled cost-based price; generic entry has already cut that by about 45%',
      openPatentNotes:
        'Composition-of-matter protection has lapsed in the United States and generic liraglutide now appears in the national acquisition-cost file at $48 to $74 per millilitre against $88 for the brand. This is the first drug in the class to reach that point.',
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
        'Generic liraglutide is now the cheapest injectable in this class and is the same molecule. Weekly semaglutide and tirzepatide produce more weight loss but cost two to three times as much. Metformin remains the cheapest way to move glucose.',
      conventionalRx: [
        {
          name: 'Generic liraglutide',
          class: 'GLP-1 receptor agonist, identical molecule',
          howItCompares: 'Identical peptide, identical evidence base, roughly 45% lower acquisition cost.',
          typicalCost: 'About $433 per month at 1.8 mg daily (US NADAC generic)',
          prosAndCons:
            'Pros: same drug, lower price. Cons: still a daily injection, and still less effective for weight than the weekly agents.',
        },
        {
          name: 'Semaglutide (Ozempic)',
          class: 'Weekly GLP-1 receptor agonist',
          howItCompares:
            'One injection a week instead of seven, larger HbA1c reduction and roughly twice the weight loss.',
          typicalCost: 'About $996 per month (US NADAC)',
          prosAndCons: 'Pros: weekly, more effective. Cons: substantially more expensive.',
        },
        {
          name: 'Metformin',
          class: 'Biguanide, small molecule',
          howItCompares:
            'Oral, lowers HbA1c by a comparable amount in many patients, no injection, no appetite effect.',
          typicalCost: 'About $1.50 per month (US NADAC generic cost)',
          prosAndCons: 'Pros: cost, oral route, long safety record. Cons: no cardiovascular outcome trial of its own at this standard.',
        },
      ],
      naturalFoods: [
        {
          name: 'Whole oats and barley (beta-glucan)',
          activeCompound: 'Mixed-linkage beta-glucan',
          biologicalMechanism:
            'Increases digesta viscosity, slows gastric emptying and blunts the post-meal glucose and insulin rise; also lowers LDL cholesterol by binding bile acids.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: '3 grams of beta-glucan daily, roughly 70 to 80 grams of oats',
          monthlyCost: '$6 to $12 per month',
        },
        {
          name: 'Legumes and pulses',
          activeCompound: 'Slowly digestible starch and soluble fibre',
          biologicalMechanism:
            'Low glycaemic response with a prolonged nutrient delivery profile, which sustains endogenous GLP-1 release from distal L-cells for hours after a meal.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: 'One cup of cooked pulses most days',
          monthlyCost: '$8 to $15 per month',
        },
      ],
      homeRemedies: [
        {
          name: 'Rotating injection sites',
          action: 'Move between abdomen, thigh and upper arm rather than reusing one spot.',
          patientImpact:
            'Repeated injection into the same site causes lipohypertrophy, which alters absorption and makes the glucose response less predictable.',
          clinicalPrecaution:
            'Any lump or hardened area at an injection site should be shown to a clinician rather than injected through.',
        },
        {
          name: 'Consistent daily timing',
          action: 'Give the injection at about the same time each day, independent of meals.',
          patientImpact:
            'A roughly 13-hour half-life means the trough between doses matters; erratic timing widens the swing in exposure.',
          clinicalPrecaution:
            'A missed dose should not be doubled up; the label gives specific instructions and they are not interchangeable with those for weekly agents.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      sequence5to3: 'HAEGTFTSDVSSYLEGQAAK(gamma-Glu-palmitoyl on Lys26)EFIAWLVRGRG',
      chemicalFormula: 'C172H265N43O51',
      molecularWeight: '3751.2 Da',
      targetReceptorAffinity: 'Selective GLP-1 receptor agonist; 97% amino acid homology to native human GLP-1(7-37)',
      structureSource: {
        label: 'VICTOZA (liraglutide) injection, US prescribing information, section 11, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5a9ef4ea-c76a-4d34-a604-27c5b505f5a4',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'lira-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Yeast expression system and precursor identity check',
          description:
            'Confirm the Saccharomyces cerevisiae production strain and the identity of the expressed Arg34 precursor peptide before acylation, since the whole molecule is defined by one substitution and one attachment.',
          reagentsAndBuffer: 'Strain identity PCR, intact-mass LC-MS of the precursor, host cell protein ELISA',
        },
        {
          id: 'lira-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Recombinant expression of the Lys34Arg GLP-1 precursor',
          description:
            'Ferment the engineered yeast strain, harvest and recover the 31-residue precursor in which the position 34 lysine has been replaced by arginine so that only Lys26 remains available for acylation.',
          dependsOnStepId: 'lira-w1',
          reagentsAndBuffer: 'Defined fermentation medium, cell separation by centrifugation, capture chromatography',
        },
        {
          id: 'lira-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Reverse-phase and ion-exchange purification of the precursor',
          description:
            'Remove host cell protein, truncated species and process impurities before the acylation chemistry, which is far harder to purify away afterwards.',
          dependsOnStepId: 'lira-w2',
          reagentsAndBuffer: 'C18 reverse-phase with acetonitrile gradient, anion-exchange polishing, tangential flow filtration',
        },
        {
          id: 'lira-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Lys26 acylation with gamma-glutamyl palmitate',
          description:
            'Attach a C16 palmitic acid chain through a glutamic acid spacer to the epsilon-amine of Lys26. This single arm is what turns a two-minute hormone into a once-daily drug.',
          dependsOnStepId: 'lira-w3',
          reagentsAndBuffer: 'Activated gamma-Glu(OSu)-palmitate, organic-aqueous buffer at controlled pH, then deprotection',
        },
        {
          id: 'lira-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'GLP-1 receptor potency and albumin-binding characterisation',
          description:
            'Measure cAMP potency at human GLP-1R, and separately measure albumin binding, because the pharmacokinetics that define this molecule live in that second number.',
          dependsOnStepId: 'lira-w4',
          reagentsAndBuffer: 'hGLP-1R reporter cell line, HTRF cAMP kit, equilibrium dialysis against human serum albumin',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lira-1',
        category: 'measured',
        title: 'LEADER: 13% relative reduction in major cardiovascular events',
        laymanSummary:
          'In 9,340 people with type 2 diabetes at high cardiovascular risk, the composite of cardiovascular death, heart attack and stroke fell from 14.9% to 13.0% over a median 3.8 years. Cardiovascular death fell from 6.0% to 4.7%.',
        technicalDetails:
          'Primary composite hazard ratio 0.87 (95% CI 0.78 to 0.97), P<0.001 for noninferiority and P=0.01 for superiority. Cardiovascular death hazard ratio 0.78 (95% CI 0.66 to 0.93), P=0.007. All-cause death 8.2% versus 9.6%.',
        evidenceSource: 'Marso SP et al. N Engl J Med 2016;375:311-322 (NCT01179048)',
        doi: '10.1056/NEJMoa1603827',
        measuredMetric: 'Time to first cardiovascular death, nonfatal myocardial infarction or nonfatal stroke',
        auditFlag: 'verified',
      },
      {
        id: 'lira-2',
        category: 'measured',
        title: 'SCALE Obesity: 8.4 kg lost at 56 weeks on the 3.0 mg dose',
        laymanSummary:
          'In 3,731 adults without diabetes, the higher dose produced 8.4 kg of weight loss against 2.8 kg on placebo, a difference of 5.6 kg.',
        technicalDetails:
          '56-week double-blind trial, 2:1 randomisation to liraglutide 3.0 mg daily or placebo, both with lifestyle counselling. Mean weight change -8.4 kg versus -2.8 kg, difference -5.6 kg (95% CI -6.0 to -5.1, P<0.001).',
        evidenceSource: 'Pi-Sunyer X et al. N Engl J Med 2015;373:11-22 (NCT01272219)',
        doi: '10.1056/NEJMoa1411892',
        measuredMetric: 'Change in body weight at week 56',
        auditFlag: 'verified',
      },
      {
        id: 'lira-3',
        category: 'conclusion_shift',
        title: 'From class-defining to second-line inside a decade',
        laymanSummary:
          'Liraglutide proved that this class could prevent heart attacks. Then weekly agents arrived with roughly twice the weight loss, and the drug that opened the field became the budget option.',
        technicalDetails:
          'Weight loss of about 8% at 56 weeks with daily liraglutide 3.0 mg compares with about 15% at 68 weeks with weekly semaglutide 2.4 mg and about 21% at 72 weeks with weekly tirzepatide 15 mg. The comparison is across trials with different designs and populations, not a head-to-head, but the gap is far larger than the between-trial noise.',
        evidenceSource:
          'Pi-Sunyer X et al. NEJM 2015; Wilding JPH et al. NEJM 2021; Jastreboff AM et al. NEJM 2022',
        doi: '10.1056/NEJMoa1411892',
        auditFlag: 'verified',
      },
      {
        id: 'lira-4',
        category: 'inferred',
        title: 'That the cardiovascular benefit is a class effect that transfers to every GLP-1 agonist',
        laymanSummary:
          'It does not transfer automatically. Once-weekly exenatide ran the same kind of trial in 14,752 people and missed superiority. Each molecule has had to prove it separately.',
        technicalDetails:
          'LEADER met superiority (HR 0.87, P=0.01) and REWIND met it narrowly (HR 0.88, P=0.026), but EXSCEL with exenatide returned HR 0.91 with P=0.06 for superiority, and SURPASS-CVOT found tirzepatide noninferior but not superior to dulaglutide. Class-effect language is an extrapolation across molecules with different structures, half-lives and trial populations.',
        evidenceSource: 'Holman RR et al. N Engl J Med 2017;377:1228-1239 (EXSCEL, NCT01144338)',
        doi: '10.1056/NEJMoa1612917',
        inferredClaim: 'That every GLP-1 receptor agonist reduces cardiovascular events',
        auditFlag: 'caution',
      },
      {
        id: 'lira-5',
        category: 'measured',
        title: 'Generic entry has moved the price, and only for this molecule so far',
        laymanSummary:
          'Generic liraglutide now appears in the US national acquisition-cost file at roughly half the branded price. No other injectable in this class has a generic.',
        technicalDetails:
          'NADAC 2026 file: generic liraglutide 18 mg/3 mL is $48.06 to $73.74 per millilitre depending on pack size, against $87.76 to $87.80 for Victoza. At 1.8 mg daily this is about $433 per month generic versus about $790 branded.',
        evidenceSource: 'CMS National Average Drug Acquisition Cost, 2026 file',
        measuredMetric: 'Published national acquisition cost per millilitre, generic versus brand',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Daily injection and reversible albumin binding',
        laymanDesc:
          'A once-daily injection under the skin. The palmitic acid tail sticks to albumin, which slows both absorption from the injection site and clearance by the kidneys.',
        molecularDetail:
          'The gamma-glutamyl palmitate arm on Lys26 drives self-association at the depot and reversible albumin binding in plasma, giving a terminal half-life of roughly 13 hours.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Resisting the enzyme that destroys the natural hormone',
        laymanDesc:
          'The bulky fatty tail shields the peptide from the enzyme that chops up natural GLP-1 within minutes.',
        molecularDetail:
          'Steric shielding by the albumin-bound acyl chain, rather than an Aib substitution, is what protects liraglutide from dipeptidyl peptidase-4 cleavage.',
        iconName: 'Shield',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Activating GLP-1 receptors on the beta cell',
        laymanDesc:
          'It docks into the same receptor as the natural hormone and tells insulin-producing cells to respond only when glucose is already high.',
        molecularDetail:
          'Class B GPCR agonism raising cAMP through Gs, amplifying glucose-stimulated insulin secretion and suppressing inappropriate glucagon release.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Slowing the stomach and lowering appetite',
        laymanDesc: 'Food leaves the stomach more slowly, and the drive to eat falls.',
        molecularDetail:
          'Delayed gastric emptying plus central GLP-1R signalling in the arcuate nucleus and area postrema reducing energy intake.',
        iconName: 'Timer',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Lower HbA1c, modest weight loss, fewer cardiovascular events',
        laymanDesc:
          'About one percentage point off HbA1c, about 8% of body weight at the higher dose, and 13% fewer heart attacks, strokes and cardiovascular deaths in high-risk diabetes.',
        molecularDetail:
          'LEADER hazard ratio 0.87 for three-point MACE with a 0.78 hazard ratio for cardiovascular death, sustained over a median 3.8 years.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'LEADER (NCT01179048)',
        phase: 'Phase 3',
        sampleSize: 9340,
        primaryEndpoint: 'Cardiovascular death, nonfatal myocardial infarction or nonfatal stroke',
        endpointMet: true,
        statisticalPValue: 'P = 0.01 for superiority, hazard ratio 0.87',
        unreportedAdverseSignals: 'Higher rate of gallstone disease and of acute gallbladder events on treatment',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SCALE Obesity and Prediabetes (NCT01272219)',
        phase: 'Phase 3',
        sampleSize: 3731,
        primaryEndpoint: 'Change in body weight at week 56',
        endpointMet: true,
        statisticalPValue: 'P < 0.001',
        unreportedAdverseSignals:
          'Higher rates of gallbladder events and of pancreatitis than placebo in the 3.0 mg arm',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '13% relative reduction in three-point MACE and 22% in cardiovascular death (LEADER, n=9,340)',
        '8.4 kg weight loss at 56 weeks versus 2.8 kg on placebo at the 3.0 mg dose (SCALE, n=3,731)',
        'Generic liraglutide is listed at roughly half the branded acquisition cost in the 2026 NADAC file',
      ],
      unsupportedInferences: [
        'That the cardiovascular benefit is a property of the class rather than of this molecule in this population',
        'That the weight-management dose carries the LEADER cardiovascular result; LEADER was run at diabetes doses in people with diabetes',
      ],
      whatFailedInitially: [
        'Native GLP-1 itself: a two-minute half-life made continuous infusion the only workable delivery, which is what the acylation strategy was invented to solve',
        'Daily dosing as a market position, once weekly agents with larger effects arrived',
      ],
      realWorldOutcome: [
        'Still widely used, increasingly as the generic, and still the only molecule in the class with a generic on the US acquisition-cost file',
        'Adherence is measurably worse than with weekly agents, which is the main practical reason it has been displaced',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous once-daily multi-dose pen',
      description:
        'Prefilled 3 mL pen containing 18 mg of liraglutide, delivering 0.6, 1.2 or 1.8 mg for diabetes, or escalating to 3.0 mg for weight management. Injection is independent of meals.',
      safetyProfile:
        'Nausea, vomiting and diarrhoea are common early and usually settle. Gallstone disease and acute pancreatitis are uncommon but established. Boxed warning for thyroid C-cell tumours from rodent studies; contraindicated with a personal or family history of medullary thyroid carcinoma or MEN2.',
    },
    commonQuestions: [
      {
        q: 'Is the generic the same drug?',
        a: 'Yes. It is the same peptide with the same acylation, approved on the demonstration of equivalence, and it appears in the US national acquisition-cost file at roughly half the branded price. The clinical evidence base is the branded evidence base.',
        auditNote: 'The equivalence is a regulatory determination, not a separate outcome trial.',
      },
      {
        q: 'Why take a daily injection when weekly ones exist?',
        a: 'Cost is now the main reason. Generic liraglutide is roughly a third of the price of weekly semaglutide per month. The trade is real: fewer injections and larger weight loss on one side, a much lower price on the other.',
      },
      {
        q: 'Does the weight-loss dose protect my heart the way LEADER showed?',
        a: 'Nobody has tested that. LEADER used diabetes doses in people with type 2 diabetes and high cardiovascular risk. The 3.0 mg weight-management dose has never had a cardiovascular outcome trial of its own.',
        auditNote: 'Unknown. Carrying the LEADER result across doses and populations is an inference.',
      },
      {
        q: 'What about the thyroid cancer warning?',
        a: 'It comes from rodent studies in which sustained GLP-1 receptor stimulation caused C-cell tumours. Whether this happens in humans has not been established either way, which is why the label carries a boxed warning and a contraindication rather than a quantified risk.',
        auditNote: 'Measured in rodents. Unknown in humans.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label: 'Marso SP et al. Liraglutide and Cardiovascular Outcomes in Type 2 Diabetes. NEJM 2016',
        identifier: '10.1056/NEJMoa1603827',
        kind: 'doi',
      },
      {
        label: 'Pi-Sunyer X et al. A Randomized, Controlled Trial of 3.0 mg of Liraglutide in Weight Management. NEJM 2015',
        identifier: '10.1056/NEJMoa1411892',
        kind: 'doi',
      },
      {
        label: 'Holman RR et al. Effects of Once-Weekly Exenatide on Cardiovascular Outcomes. NEJM 2017',
        identifier: '10.1056/NEJMoa1612917',
        kind: 'doi',
      },
      {
        label: 'Barber MJ et al. Estimated Sustainable Cost-Based Prices for Diabetes Medicines. JAMA Netw Open 2024',
        identifier: '10.1001/jamanetworkopen.2024.3474',
        kind: 'doi',
      },
      { label: 'LEADER trial record', identifier: 'NCT01179048', kind: 'nct' },
      { label: 'SCALE Obesity and Prediabetes trial record', identifier: 'NCT01272219', kind: 'nct' },
      {
        label: 'VICTOZA US prescribing information, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5a9ef4ea-c76a-4d34-a604-27c5b505f5a4',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA NDA 022341 (Victoza), original approval 25 January 2010',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022341',
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
  // Dulaglutide
  // -------------------------------------------------------------------------------------------
  {
    slug: 'dulaglutide',
    name: 'Dulaglutide',
    tradeName: 'Trulicity',
    sponsor: 'Eli Lilly and Company',
    targetGene: 'GLP1R',
    targetProtein: 'Glucagon-Like Peptide-1 Receptor',
    modality: 'Peptide / GLP-1 Agonist',
    approvalStatus: 'FDA Approved',
    approvalYear: 2014,
    indication:
      'Type 2 diabetes, and reduction of major adverse cardiovascular events in adults with type 2 diabetes with established cardiovascular disease or multiple risk factors',
    patientFriendlyIndication: 'Type 2 diabetes, including in people who have not yet had a heart attack',
    conditionContext: {
      conditionExplainer:
        'Dulaglutide solves the half-life problem a different way from the fatty-acid drugs: two GLP-1 analogue chains are genetically fused to an antibody tail, making a 63 kilodalton protein too large for the kidney to filter.',
      whyItMatters:
        'REWIND is the GLP-1 outcome trial that enrolled people with cardiovascular risk factors rather than only people who had already had an event, and followed them for a median 5.4 years. That makes it the closest thing this class has to primary-prevention evidence.',
      whoTakesThis:
        'Adults with type 2 diabetes needing better glucose control, particularly those with cardiovascular disease or multiple risk factors, and paediatric patients aged 10 years and older.',
      clinicalGoals: 'Lower HbA1c by 1 to 1.6 percentage points and reduce major adverse cardiovascular events.',
    },
    oneSentenceVerdict:
      'A GLP-1 analogue fused to an antibody tail so it lasts a week by size rather than by fat, which cut the composite of heart attack, stroke and cardiovascular death from 13.4% to 12.0% over 5.4 years in 9,901 people.',
    laymanHowItWorks:
      'Instead of bolting a fatty acid on to make the hormone last, Lilly fused two copies of a modified GLP-1 to the stem of an antibody. The result is a protein big enough that the kidney cannot filter it out, so it survives about five days. Once it circulates, it does what every drug in this class does: more insulin when glucose is high, less glucagon, a slower stomach and less appetite.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 89,
    anatomicalSite: 'Pancreatic islet beta cell, hypothalamic arcuate nucleus',
    pricing: {
      synthesisCostPerDose:
        'Modelled cost-based price of $7.05 to $17.40 per month at 1.12 mg once weekly',
      retailPricePerDoseOrYear:
        'US pharmacy acquisition cost about $239 per single-dose pen, roughly $956 per month or $12,400 per year',
      markupEstimate: 'US acquisition cost is roughly 55x to 136x the modelled cost-based price',
      openPatentNotes:
        'This is a recombinant fusion protein made in Chinese hamster ovary cells, so any follow-on is a biosimilar requiring its own comparability programme rather than a generic. That raises the barrier to price competition well above the small-peptide agents in the same class.',
      synthesisComplexity: 'High',
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
        'Semaglutide and tirzepatide beat dulaglutide on both HbA1c and weight, and cost more. Generic liraglutide is far cheaper but daily. Metformin and SGLT2 inhibitors remain the alternative mechanisms.',
      conventionalRx: [
        {
          name: 'Semaglutide (Ozempic)',
          class: 'Weekly GLP-1 receptor agonist',
          howItCompares:
            'Larger HbA1c and weight reduction in head-to-head diabetes trials, with its own cardiovascular outcome data.',
          typicalCost: 'About $996 per month (US NADAC)',
          prosAndCons: 'Pros: more effective on both endpoints. Cons: costs more, and the pen is a different device.',
        },
        {
          name: 'Generic liraglutide',
          class: 'Daily GLP-1 receptor agonist',
          howItCompares:
            'Same class, its own cardiovascular outcome trial, roughly half the monthly cost of dulaglutide.',
          typicalCost: 'About $433 per month (US NADAC generic)',
          prosAndCons: 'Pros: cost. Cons: seven injections a week instead of one.',
        },
        {
          name: 'Empagliflozin (Jardiance)',
          class: 'SGLT2 inhibitor',
          howItCompares:
            'Oral, different mechanism, strongest evidence base of any glucose-lowering agent for heart failure and kidney progression.',
          typicalCost: 'About $336 per month (US NADAC)',
          prosAndCons:
            'Pros: oral, heart failure and renal outcome data. Cons: genital infections, and a smaller HbA1c effect.',
        },
      ],
      naturalFoods: [
        {
          name: 'Barley and rye whole grains',
          activeCompound: 'Beta-glucan and arabinoxylan',
          biologicalMechanism:
            'Fermentable fibre reaching the distal gut sustains GLP-1 secretion from L-cells for many hours, which is the endogenous version of what this drug supplies exogenously.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: '60 to 100 grams of whole barley or rye kernels daily',
          monthlyCost: '$8 to $14 per month',
        },
        {
          name: 'Extra-virgin olive oil with meals',
          activeCompound: 'Oleic acid and polyphenols',
          biologicalMechanism:
            'Monounsaturated fat slows gastric emptying and stimulates GLP-1 release; the polyphenol fraction has separate effects on postprandial oxidative stress.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: '2 to 4 tablespoons daily in place of other fats',
          monthlyCost: '$15 to $30 per month',
        },
      ],
      homeRemedies: [
        {
          name: 'A fixed weekly injection day',
          action: 'Choose one day of the week and keep it, changing only when at least three days separate the doses.',
          patientImpact:
            'A five-day half-life means exposure is fairly flat, but drifting the day forward repeatedly stacks doses.',
          clinicalPrecaution:
            'The label sets out exactly how far a dose can be moved; that guidance is specific to this molecule.',
        },
        {
          name: 'Room-temperature pen before injecting',
          action: 'Take the pen out of the refrigerator and let it stand for around half an hour before use.',
          patientImpact: 'Cold solution stings more; warming reduces injection-site discomfort.',
          clinicalPrecaution: 'Do not warm with hot water or a microwave, which can denature the protein.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula: 'Recombinant glycoprotein; no single empirical formula is stated in the label',
      molecularWeight: 'Approximately 63 kDa',
      targetReceptorAffinity:
        'GLP-1 analogue portion is 90% homologous to native human GLP-1(7-37), with substitutions blocking DPP-4 cleavage and removing a T-cell epitope',
      structureSource: {
        label: 'TRULICITY (dulaglutide) injection, US prescribing information, section 11, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=463050bd-2b1c-40f5-b3c3-0a04bb433309',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'dula-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Master cell bank identity and stability testing',
          description:
            'Confirm the Chinese hamster ovary master cell bank identity, copy number and freedom from adventitious agents. For a fusion protein the cell line is the process, so this is the first control point.',
          reagentsAndBuffer: 'Isoenzyme and STR identity testing, in vitro and in vivo adventitious agent assays',
        },
        {
          id: 'dula-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fed-batch mammalian cell culture expression',
          description:
            'Express the GLP-1 analogue-linker-IgG4 Fc fusion in CHO cells, where the Fc domain dimerises and the glycosylation is installed.',
          dependsOnStepId: 'dula-w1',
          reagentsAndBuffer: 'Chemically defined serum-free CHO medium, glucose and amino acid feeds, controlled pH and dissolved oxygen',
        },
        {
          id: 'dula-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Protein A capture and polishing chromatography',
          description:
            'Capture on Protein A through the Fc domain, then remove aggregates, half-molecules and host cell protein by ion exchange and hydrophobic interaction steps.',
          dependsOnStepId: 'dula-w2',
          reagentsAndBuffer: 'Protein A resin, low-pH elution and viral inactivation hold, anion exchange, viral filtration',
        },
        {
          id: 'dula-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'GLP-1 receptor potency and glycan profiling',
          description:
            'Measure cAMP potency at human GLP-1R and characterise the N-glycan profile, since Fc glycosylation affects both stability and receptor-mediated clearance.',
          dependsOnStepId: 'dula-w3',
          reagentsAndBuffer: 'hGLP-1R reporter cell line, HTRF cAMP kit, released-glycan HILIC-fluorescence chromatography',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dula-1',
        category: 'measured',
        title: 'REWIND: 12% relative reduction in major cardiovascular events over 5.4 years',
        laymanSummary:
          'In 9,901 people with type 2 diabetes, the composite of heart attack, stroke and cardiovascular death occurred in 12.0% on dulaglutide against 13.4% on placebo. Deaths from any cause did not differ.',
        technicalDetails:
          '371 sites, 24 countries, median follow-up 5.4 years, median baseline HbA1c 7.2%. Primary composite 594 (12.0%) versus 663 (13.4%), hazard ratio 0.88 (95% CI 0.79 to 0.99), P=0.026. All-cause mortality 536 (10.8%) versus 592 (12.0%), hazard ratio 0.90 (95% CI 0.80 to 1.01), P=0.067.',
        evidenceSource: 'Gerstein HC et al. Lancet 2019;394:121-130 (NCT01394952)',
        doi: '10.1016/S0140-6736(19)31149-3',
        measuredMetric: 'Time to first nonfatal myocardial infarction, nonfatal stroke or cardiovascular death',
        auditFlag: 'verified',
      },
      {
        id: 'dula-2',
        category: 'inferred',
        title: 'That REWIND showed a mortality benefit',
        laymanSummary:
          'It did not. Deaths from any cause were 10.8% against 12.0%, and that difference was not statistically significant.',
        technicalDetails:
          'All-cause mortality hazard ratio 0.90 (95% CI 0.80 to 1.01), P=0.067. The confidence interval crosses 1. A composite endpoint driven largely by nonfatal stroke does not license a survival claim.',
        evidenceSource: 'Gerstein HC et al. Lancet 2019;394:121-130',
        doi: '10.1016/S0140-6736(19)31149-3',
        inferredClaim: 'That dulaglutide reduces death',
        measuredMetric: 'All-cause mortality, hazard ratio 0.90, P = 0.067',
        auditFlag: 'caution',
      },
      {
        id: 'dula-3',
        category: 'measured',
        title: 'Chosen as the active comparator in a 13,299-person trial of its successor',
        laymanSummary:
          'When Lilly tested tirzepatide for cardiovascular outcomes it did not use placebo. It used dulaglutide, and tirzepatide did not beat it.',
        technicalDetails:
          'SURPASS-CVOT randomised 13,299 people with type 2 diabetes and atherosclerotic disease to tirzepatide or dulaglutide 1.5 mg. Primary composite 12.2% versus 13.1%, hazard ratio 0.92 (95.3% CI 0.83 to 1.01), P=0.09 for superiority. Using dulaglutide rather than placebo was itself a statement that placebo was no longer an acceptable comparator in this population.',
        evidenceSource: 'Cardiovascular Outcomes with Tirzepatide versus Dulaglutide. NEJM 2025 (NCT04255433)',
        doi: '10.1056/NEJMoa2505928',
        auditFlag: 'verified',
      },
      {
        id: 'dula-4',
        category: 'measured',
        title: 'AWARD-11: which estimand you pick decides whether the 3.0 mg dose worked',
        laymanSummary:
          'Tripling the dose gave about a quarter of a percentage point more HbA1c reduction. For the middle dose, the answer flipped depending on how discontinuations were handled: significant one way, not significant the other.',
        technicalDetails:
          '52-week phase 3 trial, n=1,842, metformin-treated type 2 diabetes. At week 36 dulaglutide 4.5 mg was superior to 1.5 mg on both prespecified estimands (treatment-regimen difference -0.24%, P<0.001). Dulaglutide 3.0 mg was superior on the efficacy estimand (-0.17%, P=0.003) but not on the treatment-regimen estimand (-0.10%, P=0.096).',
        evidenceSource: 'Frias JP et al. Diabetes Care 2021;44:765-773',
        doi: '10.2337/dc20-1473',
        measuredMetric: 'Change in HbA1c at week 36 under two prespecified estimands',
        auditFlag: 'verified',
      },
      {
        id: 'dula-5',
        category: 'inferred',
        title: 'That a fusion protein is interchangeable with a small peptide in this class',
        laymanSummary:
          'It is not, in one respect that matters for price. A 63 kilodalton protein made in mammalian cells cannot be copied as a generic; it needs a biosimilar programme. Liraglutide already has a generic. Dulaglutide does not.',
        technicalDetails:
          'The label describes a recombinant fusion of a GLP-1 analogue to a modified human IgG4 Fc, expressed in CHO cells, molecular weight approximately 63 kDa. Follow-on entry therefore requires analytical, non-clinical and clinical comparability rather than bioequivalence, and the 2026 NADAC file lists no generic dulaglutide.',
        evidenceSource: 'TRULICITY US prescribing information, section 11; CMS NADAC 2026 file',
        inferredClaim: 'That competition will erode the price of every drug in this class on the same timeline',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Weekly injection of a large fusion protein',
        laymanDesc:
          'The injection contains a protein about fifteen times heavier than a plain peptide drug. Size alone is what keeps it in the body for days.',
        molecularDetail:
          'The approximately 63 kDa homodimer exceeds the glomerular filtration threshold, so renal clearance is minimal and the half-life is roughly five days.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Fc-mediated recycling extends the stay further',
        laymanDesc:
          'The antibody tail lets the body recycle the molecule instead of degrading it, the same trick that keeps natural antibodies circulating for weeks.',
        molecularDetail:
          'The IgG4 Fc domain engages the neonatal Fc receptor in a pH-dependent way, diverting internalised protein back to the cell surface rather than to the lysosome. The Fc has been engineered to reduce high-affinity Fc receptor binding and half-antibody formation.',
        iconName: 'Repeat',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The GLP-1 arms engage the receptor',
        laymanDesc: 'The two hormone arms on the front of the molecule dock into GLP-1 receptors.',
        molecularDetail:
          'Each arm is a GLP-1(7-37) analogue with substitutions that block DPP-4 cleavage and remove a T-cell epitope, retaining Gs-coupled cAMP signalling at GLP-1R.',
        iconName: 'Link',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Glucose-dependent insulin release and slower gastric emptying',
        laymanDesc:
          'Insulin rises only when glucose is high, glucagon falls, and food leaves the stomach more slowly.',
        molecularDetail:
          'cAMP-mediated potentiation of glucose-stimulated insulin exocytosis, suppression of alpha-cell glucagon secretion, and vagally mediated delay of gastric emptying.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Lower HbA1c and fewer cardiovascular events, without a mortality signal',
        laymanDesc:
          'HbA1c falls by one to one and a half percentage points, and over five years there were fewer strokes and heart attacks. Deaths were not significantly different.',
        molecularDetail:
          'REWIND hazard ratio 0.88 for three-point MACE over a median 5.4 years, with all-cause mortality hazard ratio 0.90 and a confidence interval crossing unity.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'REWIND (NCT01394952)',
        phase: 'Phase 3',
        sampleSize: 9901,
        primaryEndpoint: 'Nonfatal myocardial infarction, nonfatal stroke or cardiovascular death',
        endpointMet: true,
        statisticalPValue: 'P = 0.026, hazard ratio 0.88',
        unreportedAdverseSignals:
          'Gastrointestinal adverse events in 47.4% versus 34.1% over five years, a difference far larger than the event reduction',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'AWARD-11',
        phase: 'Phase 3',
        sampleSize: 1842,
        primaryEndpoint: 'Change in HbA1c at week 36 with dulaglutide 3.0 mg and 4.5 mg versus 1.5 mg',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 for 4.5 mg; P = 0.096 for 3.0 mg on the treatment-regimen estimand',
        unreportedAdverseSignals:
          'The 3.0 mg conclusion depends on the estimand chosen, which is a design decision rather than a finding',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'SURPASS-CVOT (NCT04255433), as active comparator',
        phase: 'Phase 3',
        sampleSize: 13299,
        primaryEndpoint: 'Cardiovascular death, myocardial infarction or stroke, tirzepatide versus dulaglutide',
        endpointMet: true,
        statisticalPValue: 'Noninferiority met; superiority of tirzepatide not met, P = 0.09',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '12% relative reduction in three-point MACE over a median 5.4 years (REWIND, n=9,901)',
        'All-cause mortality 10.8% versus 12.0%, hazard ratio 0.90, P = 0.067',
        'Gastrointestinal adverse events in 47.4% versus 34.1% over the same period',
      ],
      unsupportedInferences: [
        'That REWIND demonstrated a survival benefit; the mortality confidence interval crosses 1',
        'That biosimilar competition will bring this molecule down to generic small-peptide prices',
      ],
      whatFailedInitially: [
        'Unmodified GLP-1-Fc fusions were immunogenic; the epitope removal in the analogue portion was added to address that',
      ],
      realWorldOutcome: [
        'Widely used and well tolerated at the weekly dose, and now the reference comparator against which newer agents are measured',
        'Displaced at the top of the market by semaglutide and tirzepatide on effect size rather than on safety',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous once-weekly single-dose pen',
      description:
        'Preservative-free single-dose pen at 0.75, 1.5, 3.0 or 4.5 mg in 0.5 mL, injected once weekly independent of meals, with a hidden needle that fires on activation.',
      safetyProfile:
        'Nausea, diarrhoea and vomiting are the dominant adverse events. Pancreatitis and gallbladder disease are uncommon. Boxed warning for thyroid C-cell tumours from rodent data; contraindicated with a personal or family history of medullary thyroid carcinoma or MEN2.',
    },
    commonQuestions: [
      {
        q: 'Did REWIND show that it saves lives?',
        a: 'No. It showed 12% fewer heart attacks, strokes and cardiovascular deaths taken together. All-cause mortality was 10.8% against 12.0%, hazard ratio 0.90, P = 0.067, which is not a significant difference.',
        auditNote: 'The composite is measured. A mortality benefit is not.',
      },
      {
        q: 'Why does this one cost more to make than the peptide drugs?',
        a: 'It is a 63 kilodalton protein grown in mammalian cell culture, not a chemically synthesised peptide. The modelled cost-based price of $7 to $17 a month is still far below the roughly $956 US acquisition cost, but the manufacturing floor is genuinely higher than for semaglutide.',
      },
      {
        q: 'Will there ever be a cheap version?',
        a: 'Only through a biosimilar, which requires its own comparability programme rather than a generic filing. Liraglutide already has a generic on the US acquisition-cost file. Dulaglutide, as of the 2026 file, does not.',
        auditNote: 'This is a regulatory-pathway fact, not a prediction about timing.',
      },
      {
        q: 'Is it as good as semaglutide or tirzepatide?',
        a: 'For HbA1c and weight, no; head-to-head diabetes trials favour both newer agents. For cardiovascular outcomes it holds its ground well enough that Lilly used it as the comparator arm rather than placebo when testing tirzepatide, and tirzepatide did not beat it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label: 'Gerstein HC et al. Dulaglutide and cardiovascular outcomes in type 2 diabetes (REWIND). Lancet 2019',
        identifier: '10.1016/S0140-6736(19)31149-3',
        kind: 'doi',
      },
      {
        label: 'Frias JP et al. Efficacy and Safety of Dulaglutide 3.0 mg and 4.5 mg (AWARD-11). Diabetes Care 2021',
        identifier: '10.2337/dc20-1473',
        kind: 'doi',
      },
      {
        label: 'Cardiovascular Outcomes with Tirzepatide versus Dulaglutide in Type 2 Diabetes. NEJM 2025',
        identifier: '10.1056/NEJMoa2505928',
        kind: 'doi',
      },
      {
        label: 'Barber MJ et al. Estimated Sustainable Cost-Based Prices for Diabetes Medicines. JAMA Netw Open 2024',
        identifier: '10.1001/jamanetworkopen.2024.3474',
        kind: 'doi',
      },
      { label: 'REWIND trial record', identifier: 'NCT01394952', kind: 'nct' },
      { label: 'SURPASS-CVOT trial record', identifier: 'NCT04255433', kind: 'nct' },
      {
        label: 'TRULICITY US prescribing information, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=463050bd-2b1c-40f5-b3c3-0a04bb433309',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA BLA 125469 (Trulicity), original approval 18 September 2014',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125469',
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
  // Exenatide
  // -------------------------------------------------------------------------------------------
  {
    slug: 'exenatide',
    name: 'Exenatide',
    tradeName: 'Byetta / Bydureon / Bydureon BCise',
    sponsor: 'AstraZeneca (originally Amylin Pharmaceuticals and Eli Lilly)',
    targetGene: 'GLP1R',
    targetProtein: 'Glucagon-Like Peptide-1 Receptor',
    modality: 'Peptide / GLP-1 Agonist',
    approvalStatus: 'FDA Approved',
    approvalYear: 2005,
    indication: 'Type 2 diabetes, as an adjunct to diet and exercise to improve glycaemic control',
    patientFriendlyIndication: 'Type 2 diabetes',
    conditionContext: {
      conditionExplainer:
        'Exenatide is a synthetic copy of exendin-4, a peptide found in the venom of the Gila monster. It happens to be about half identical to human GLP-1 and is not a substrate for the enzyme that destroys the human hormone, so it lasts hours rather than minutes without any chemical modification at all.',
      whyItMatters:
        'This was the first GLP-1 receptor agonist ever approved, in 2005. Every drug in this class descends from it. All three of its US products are now listed as discontinued in the FDA drug database.',
      whoTakesThis:
        'Historically, adults with type 2 diabetes inadequately controlled on oral agents. In the United States it is no longer marketed.',
      clinicalGoals: 'Lower HbA1c by roughly 0.8 to 1.0 percentage points with modest weight reduction.',
    },
    oneSentenceVerdict:
      'The first GLP-1 receptor agonist, isolated from Gila monster venom in 1992 and approved in 2005, which in 14,752 people was noninferior but not superior to placebo for cardiovascular events and is now discontinued in the United States.',
    laymanHowItWorks:
      'A biochemist studying lizard venom in 1992 found a peptide that looked like the human gut hormone GLP-1 but survived far longer. It turned out to activate the same receptor. Synthesised as a drug, it tells the pancreas to release insulin when glucose is high, slows the stomach and reduces appetite. The extended-release version wraps the same peptide in dissolving polymer microspheres so one injection lasts a week.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 82,
    anatomicalSite: 'Pancreatic islet beta cell, gastric antrum, hypothalamic arcuate nucleus',
    pricing: {
      synthesisCostPerDose:
        'Modelled cost-based price of $0.75 to $4.46 per month at 7.5 micrograms twice daily, the lowest of any GLP-1 agonist in the analysis',
      retailPricePerDoseOrYear:
        'Last published US pharmacy acquisition cost, February 2025 before discontinuation: about $816 per month for the twice-daily pen; about $796 per month for the weekly Bydureon BCise autoinjector',
      markupEstimate:
        'Final US acquisition cost was roughly 180x to 1,090x the modelled cost-based price',
      openPatentNotes:
        'Patent protection has lapsed and the peptide is a straightforward 39-residue solid-phase synthesis, yet no generic entered the US market. The products were withdrawn commercially before generic competition arrived, which is a different failure mode from a patent thicket.',
      synthesisComplexity: 'Low',
      costSource: {
        label:
          'Barber MJ et al. Estimated Sustainable Cost-Based Prices for Diabetes Medicines. JAMA Netw Open 2024',
        identifier: '10.1001/jamanetworkopen.2024.3474',
        kind: 'doi',
      },
      priceSource: {
        label: 'CMS National Average Drug Acquisition Cost (NADAC) 2026 file, final Byetta and Bydureon BCise entries',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'Because exenatide is no longer marketed in the United States, the substitutes are not optional here. Semaglutide, dulaglutide and generic liraglutide are the direct replacements, and all three have stronger evidence.',
      conventionalRx: [
        {
          name: 'Generic liraglutide',
          class: 'Daily GLP-1 receptor agonist',
          howItCompares:
            'Same receptor, larger HbA1c effect, and a positive cardiovascular outcome trial that exenatide did not achieve.',
          typicalCost: 'About $433 per month (US NADAC generic)',
          prosAndCons: 'Pros: cheapest available agent in the class with outcome data. Cons: daily injection.',
        },
        {
          name: 'Dulaglutide (Trulicity)',
          class: 'Weekly GLP-1 receptor agonist',
          howItCompares:
            'Weekly like Bydureon, better tolerated device, and a positive cardiovascular outcome trial.',
          typicalCost: 'About $956 per month (US NADAC)',
          prosAndCons: 'Pros: weekly, positive REWIND result. Cons: substantially more expensive.',
        },
        {
          name: 'Metformin',
          class: 'Biguanide, small molecule',
          howItCompares: 'Oral, comparable HbA1c effect in many patients, no injection.',
          typicalCost: 'About $1.50 per month (US NADAC generic cost)',
          prosAndCons: 'Pros: cost and route. Cons: no appetite effect, and gastrointestinal upset is common early.',
        },
      ],
      naturalFoods: [
        {
          name: 'Vinegar taken with a starch-containing meal',
          activeCompound: 'Acetic acid',
          biologicalMechanism:
            'Acetic acid inhibits disaccharidase activity and slows gastric emptying, reducing the post-meal glucose rise. The gastric-emptying arm of the mechanism is shared with this drug class.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: '1 to 2 tablespoons diluted in water before a starchy meal',
          monthlyCost: '$3 to $6 per month',
        },
        {
          name: 'Psyllium husk',
          activeCompound: 'Arabinoxylan gel-forming fibre',
          biologicalMechanism:
            'Forms a viscous gel that slows carbohydrate absorption and lowers both post-meal glucose and LDL cholesterol.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: '10 to 15 grams daily with a full glass of water',
          monthlyCost: '$8 to $15 per month',
        },
      ],
      homeRemedies: [
        {
          name: 'Injecting the twice-daily form within an hour before a meal',
          action: 'Give the injection in the hour before the morning and evening meals, never after eating.',
          patientImpact:
            'The short-acting form works by blunting the meal glucose excursion; taken after a meal it has largely missed the event it was meant to modify.',
          clinicalPrecaution:
            'This timing rule belongs to the twice-daily formulation and does not apply to weekly agents.',
        },
        {
          name: 'Maintaining fluid intake during gastrointestinal upset',
          action: 'Keep up oral fluids during any period of nausea, vomiting or diarrhoea on treatment.',
          patientImpact:
            'Volume depletion is the main route to the acute kidney injury reported with this class, particularly alongside ACE inhibitors, ARBs or diuretics.',
          clinicalPrecaution: 'Persistent vomiting or reduced urine output needs medical assessment, not more fluids at home.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      sequence5to3: 'HGEGTFTSDLSKQMEEEAVRLFIEWLKNGGPSSGAPPPS(C-terminal amide)',
      chemicalFormula: 'C184H282N50O60S',
      molecularWeight: '4186.6 Da',
      targetReceptorAffinity:
        'GLP-1 receptor agonist; roughly 53% amino acid identity with human GLP-1(7-37), with a glycine at position 2 that makes it resistant to DPP-4 cleavage',
      structureSource: {
        label: 'BYETTA (exenatide) injection, US prescribing information, section 11, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=53d03c03-ebf7-418d-88a8-533eabd2ee4f',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'exen-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Resin and building-block qualification for a Rink amide assembly',
          description:
            'Confirm resin loading and residue identity. The C-terminal amide is part of the molecule, so the choice of resin is a structural decision rather than a convenience.',
          reagentsAndBuffer: 'Rink amide MBHA resin, Fmoc release assay at 301 nm, chiral HPLC of building blocks',
        },
        {
          id: 'exen-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fmoc solid-phase assembly of the 39-residue exendin-4 sequence',
          description:
            'Sequential coupling of all thirty-nine residues, with pseudoproline dipeptides through the C-terminal proline-rich stretch to suppress aggregation on resin.',
          dependsOnStepId: 'exen-w1',
          reagentsAndBuffer: 'Fmoc-amino acids, pseudoproline dipeptides, DIC/Oxyma, DMF, 20% piperidine',
        },
        {
          id: 'exen-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Cleavage and preparative reverse-phase HPLC',
          description:
            'Cleave with a scavenger cocktail that protects the single methionine from oxidation, then purify on C18 to remove deletion sequences and the methionine sulfoxide impurity.',
          dependsOnStepId: 'exen-w2',
          reagentsAndBuffer: 'TFA with TIS, water and thioanisole; acetonitrile-water gradients with 0.1% TFA',
        },
        {
          id: 'exen-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Encapsulation in poly(lactide-co-glycolide) microspheres for the weekly form',
          description:
            'For the extended-release product, entrap the purified peptide in biodegradable PLGA microspheres that release it over weeks as the polymer hydrolyses. This step is what separates the weekly product from the twice-daily one.',
          dependsOnStepId: 'exen-w3',
          reagentsAndBuffer: 'Poly(D,L-lactide-co-glycolide) 50:50, sucrose, dichloromethane emulsion process, lyophilisation',
        },
        {
          id: 'exen-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'GLP-1 receptor potency and in vitro release profiling',
          description:
            'Measure cAMP potency at human GLP-1R and, for the microsphere product, the cumulative in vitro release curve, since the burst fraction determines the tolerability of the first weeks.',
          dependsOnStepId: 'exen-w4',
          reagentsAndBuffer: 'hGLP-1R reporter line, HTRF cAMP kit, phosphate release medium at 37 degrees C with HPLC quantification',
        },
      ],
    },
    keyAudits: [
      {
        id: 'exen-1',
        category: 'measured',
        title: 'Discovered in Gila monster venom in 1992, thirteen years before approval',
        laymanSummary:
          'Exendin-4 was isolated from the venom of Heloderma suspectum and characterised in a 1992 paper. The drug built on it reached patients in 2005.',
        technicalDetails:
          'Eng and colleagues isolated exendin-4 as an exendin-3 analogue from Heloderma suspectum venom and characterised its activity on dispersed guinea pig pancreatic acini. The peptide has a glycine at position 2 in place of the alanine that makes human GLP-1 a DPP-4 substrate, which is the whole reason it survives in circulation.',
        evidenceSource: 'Eng J et al. J Biol Chem 1992;267:7402-7405',
        measuredMetric: 'Isolation and receptor characterisation of a natural GLP-1 receptor agonist',
        auditFlag: 'verified',
      },
      {
        id: 'exen-2',
        category: 'failed',
        title: 'EXSCEL: noninferior on safety, not superior on efficacy',
        laymanSummary:
          'In 14,752 people followed a median 3.2 years, cardiovascular events occurred in 11.4% on exenatide and 12.2% on placebo. The difference did not reach significance.',
        technicalDetails:
          'Primary composite hazard ratio 0.91 (95% CI 0.83 to 1.00), P<0.001 for noninferiority but P=0.06 for superiority. Rates of cardiovascular death, myocardial infarction, stroke, heart failure hospitalisation, pancreatitis, pancreatic cancer and medullary thyroid carcinoma did not differ between groups.',
        evidenceSource: 'Holman RR et al. N Engl J Med 2017;377:1228-1239 (NCT01144338)',
        doi: '10.1056/NEJMoa1612917',
        inferredClaim: 'That every GLP-1 receptor agonist reduces cardiovascular events',
        measuredMetric: 'Three-point MACE, hazard ratio 0.91, P = 0.06 for superiority',
        auditFlag: 'verified',
      },
      {
        id: 'exen-3',
        category: 'conclusion_shift',
        title: 'The first drug in the class is now discontinued in the United States',
        laymanSummary:
          'Byetta, Bydureon and Bydureon BCise are all listed as discontinued in the FDA drug database. The molecule that started the field is no longer sold where it started.',
        technicalDetails:
          'Drugs@FDA marketing status for NDA 021773 (Byetta), NDA 022200 (Bydureon and Bydureon Pen) and NDA 209210 (Bydureon BCise) is Discontinued for every listed product. The last national acquisition-cost entries are February 2025 for Byetta and April 2025 for Bydureon BCise. Withdrawal followed commercial displacement by weekly agents with larger effects, not a safety action.',
        evidenceSource: 'Drugs@FDA marketing status, NDA 021773, NDA 022200 and NDA 209210',
        auditFlag: 'verified',
      },
      {
        id: 'exen-4',
        category: 'inferred',
        title: 'That the cheapest molecule in a class becomes the affordable one',
        laymanSummary:
          'Exenatide has the lowest modelled manufacturing cost of any GLP-1 agonist, under five dollars a month. Its final US acquisition cost was over eight hundred. No generic ever launched, and then the brand left the market.',
        technicalDetails:
          'Modelled cost-based price $0.75 to $4.46 per month against a final NADAC of about $816 per month for the twice-daily pen. Patent protection had lapsed, and the synthesis is an unmodified 39-residue solid-phase assembly, yet the product line was discontinued before generic entry rather than after it.',
        evidenceSource: 'Barber MJ et al. JAMA Netw Open 2024; CMS NADAC; Drugs@FDA marketing status',
        doi: '10.1001/jamanetworkopen.2024.3474',
        inferredClaim: 'That patent expiry alone produces price competition',
        auditFlag: 'caution',
      },
      {
        id: 'exen-5',
        category: 'measured',
        title: 'The weekly formulation traded convenience for injection-site nodules',
        laymanSummary:
          'Wrapping the peptide in dissolving polymer beads made one injection last a week, and left palpable lumps at the injection site in a substantial minority of users.',
        technicalDetails:
          'The extended-release product suspends exenatide in poly(lactide-co-glycolide) microspheres. Injection-site nodules, which reflect the polymer depot rather than the peptide, are a labelled adverse reaction and a common reason for discontinuation.',
        evidenceSource: 'BYDUREON BCISE US prescribing information, adverse reactions',
        measuredMetric: 'Injection-site nodule incidence in the extended-release formulation',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A venom peptide that survives where the human hormone does not',
        laymanDesc:
          'Human GLP-1 is chopped in half within about two minutes by an enzyme in the blood. The lizard version has a different amino acid at exactly the position that enzyme attacks.',
        molecularDetail:
          'Glycine at position 2 in place of alanine removes the dipeptidyl peptidase-4 recognition site, giving a plasma half-life of roughly 2.4 hours without any chemical modification.',
        iconName: 'Shield',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Or a polymer depot that meters it out over a week',
        laymanDesc:
          'The weekly version is the identical peptide packed inside biodegradable beads that slowly dissolve under the skin.',
        molecularDetail:
          'Poly(lactide-co-glycolide) microspheres hydrolyse over weeks, releasing entrapped peptide with an initial burst followed by a sustained diffusion and erosion phase.',
        iconName: 'CircleDot',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binding the human GLP-1 receptor',
        laymanDesc: 'Despite coming from a lizard, it fits the human receptor and switches it on fully.',
        molecularDetail:
          'Full agonism at the class B GPCR GLP-1R with Gs coupling and cAMP accumulation, despite only about 53% sequence identity with human GLP-1(7-37).',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Glucose-dependent insulin, less glucagon, slower stomach',
        laymanDesc:
          'Insulin release rises only when glucose is high, the hormone that raises glucose falls, and food leaves the stomach more slowly.',
        molecularDetail:
          'cAMP-mediated potentiation of glucose-stimulated insulin secretion, suppression of alpha-cell glucagon output, and vagally mediated delay of gastric emptying that is more pronounced with the short-acting formulation.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'About one point off HbA1c, and no proven cardiovascular benefit',
        laymanDesc:
          'Blood glucose control improves and weight falls a little. The large outcome trial did not show fewer heart attacks or strokes.',
        molecularDetail:
          'HbA1c reduction of roughly 0.8 to 1.0 percentage points with weight loss of two to three kilograms; EXSCEL hazard ratio 0.91 for three-point MACE with P=0.06 for superiority.',
        iconName: 'Gauge',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'EXSCEL (NCT01144338)',
        phase: 'Phase 3',
        sampleSize: 14752,
        primaryEndpoint: 'Cardiovascular death, nonfatal myocardial infarction or nonfatal stroke',
        endpointMet: false,
        statisticalPValue: 'P < 0.001 for noninferiority; P = 0.06 for superiority',
        unreportedAdverseSignals:
          'High discontinuation, with a substantial fraction of participants off study drug well before the end of follow-up, which biases an intention-to-treat superiority test toward the null',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Isolation and characterisation of exendin-4 from Heloderma suspectum venom in 1992',
        'HbA1c reduction of roughly 0.8 to 1.0 percentage points across the phase 3 programme',
        'Three-point MACE hazard ratio 0.91, P = 0.06 for superiority, in 14,752 people (EXSCEL)',
      ],
      unsupportedInferences: [
        'That the cardiovascular benefit seen with liraglutide and semaglutide extends to this molecule',
        'That the lowest manufacturing cost in a class translates into the lowest price to patients',
      ],
      whatFailedInitially: [
        'The superiority hypothesis in EXSCEL, which was prespecified and missed at P = 0.06',
        'The commercial position of all three US products, every one of which is now listed as discontinued',
      ],
      realWorldOutcome: [
        'Historically important as the molecule that opened the class, and still marketed in some countries',
        'Withdrawn from the US market for commercial reasons rather than safety, before any generic entered',
      ],
    },
    deliverySystem: {
      type: 'Twice-daily subcutaneous pen, or once-weekly extended-release microsphere autoinjector',
      description:
        'Byetta delivered 5 or 10 micrograms twice daily within an hour before the morning and evening meals. Bydureon and Bydureon BCise suspended 2 mg of the same peptide in poly(lactide-co-glycolide) microspheres for weekly injection. All three are discontinued in the United States.',
      safetyProfile:
        'Nausea is the dominant adverse event and is more prominent with the twice-daily form. Acute pancreatitis and acute kidney injury from volume depletion are uncommon but labelled. The extended-release form carries a boxed warning for thyroid C-cell tumours and causes injection-site nodules from the polymer depot.',
    },
    commonQuestions: [
      {
        q: 'Can I still get it?',
        a: 'Not in the United States. Drugs@FDA lists Byetta, Bydureon and Bydureon BCise as discontinued for every product code, and the last national acquisition-cost entries date from early 2025. It remains available in some other markets.',
        auditNote: 'This is a marketing-status fact from the FDA database, not a safety withdrawal.',
      },
      {
        q: 'Was it withdrawn because it was unsafe?',
        a: 'No. Nothing in the record points to a safety action. EXSCEL found no difference from placebo in pancreatitis, pancreatic cancer or medullary thyroid carcinoma. It was displaced commercially by weekly agents with larger effects on glucose and weight.',
      },
      {
        q: 'Does a GLP-1 agonist automatically protect the heart?',
        a: 'No, and exenatide is the counterexample. In the largest trial of the drug, 14,752 people over a median 3.2 years, the reduction in cardiovascular events was 9% relative and did not reach significance. Liraglutide, semaglutide and dulaglutide each had to show it separately.',
        auditNote: 'Measured, and negative for superiority. This is why class-effect language is an inference.',
      },
      {
        q: 'It came from venom, so is it dangerous?',
        a: 'The origin says nothing about the risk. Exendin-4 is not the toxic component of the venom; it is a peptide that happens to resemble a human gut hormone. Its safety profile comes from the trials, not from the animal it was found in.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Eng J et al. Isolation and characterization of exendin-4 from Heloderma suspectum venom. J Biol Chem 1992',
        identifier: '1313797',
        kind: 'pmid',
      },
      {
        label: 'Holman RR et al. Effects of Once-Weekly Exenatide on Cardiovascular Outcomes (EXSCEL). NEJM 2017',
        identifier: '10.1056/NEJMoa1612917',
        kind: 'doi',
      },
      {
        label: 'Barber MJ et al. Estimated Sustainable Cost-Based Prices for Diabetes Medicines. JAMA Netw Open 2024',
        identifier: '10.1001/jamanetworkopen.2024.3474',
        kind: 'doi',
      },
      { label: 'EXSCEL trial record', identifier: 'NCT01144338', kind: 'nct' },
      {
        label: 'BYETTA US prescribing information, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=53d03c03-ebf7-418d-88a8-533eabd2ee4f',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA NDA 021773 (Byetta), approved 28 April 2005, all products discontinued',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021773',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA NDA 209210 (Bydureon BCise), approved 20 October 2017, discontinued',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=209210',
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
  // Retatrutide
  // -------------------------------------------------------------------------------------------
  {
    slug: 'retatrutide',
    name: 'Retatrutide',
    tradeName: 'LY3437943 (no trade name; not approved)',
    sponsor: 'Eli Lilly and Company',
    targetGene: 'GIPR / GLP1R / GCGR',
    targetProtein:
      'Glucose-Dependent Insulinotropic Polypeptide Receptor, Glucagon-Like Peptide-1 Receptor and Glucagon Receptor',
    modality: 'Peptide / GLP-1 Agonist',
    approvalStatus: 'Phase 3 Clinical Trial',
    indication:
      'Under investigation for obesity, type 2 diabetes, knee osteoarthritis with obesity, obstructive sleep apnoea and chronic kidney disease. Not approved for any indication in any jurisdiction.',
    patientFriendlyIndication: 'Obesity and type 2 diabetes, still in trials',
    conditionContext: {
      conditionExplainer:
        'Retatrutide activates three receptors instead of one or two. The third, the glucagon receptor, raises energy expenditure rather than only suppressing intake, which is a different lever from anything already approved.',
      whyItMatters:
        'Its phase 2 obesity trial produced the largest weight reduction ever reported for a drug, and its phase 3 obesity trial completed in April 2026 without results in the public record. Meanwhile it is sold widely and illegally.',
      whoTakesThis:
        'Trial participants. Outside trials, nobody is meant to be taking it, and a large unregulated market says otherwise.',
      clinicalGoals:
        'In the completed phase 3 diabetes trial, HbA1c reduction. In the obesity programme, percentage weight reduction.',
    },
    oneSentenceVerdict:
      'A triple GIP, GLP-1 and glucagon receptor agonist that produced 24.2% weight loss at 48 weeks in a 338-person phase 2 trial and lowered HbA1c by up to 1.94 percentage points in a 537-person phase 3 trial, with no approval anywhere and no published phase 3 obesity result.',
    laymanHowItWorks:
      'Two of the three receptors it hits are the appetite hormones already used by approved drugs. The third is glucagon, which the body normally uses to release stored energy. Switching it on alongside the appetite signals means the drug may reduce what goes in and raise what gets burned at the same time. Whether that combination is safe over years is exactly what the phase 3 programme was built to find out, and most of it has not reported.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 48,
    anatomicalSite: 'Hypothalamus, pancreatic islet, hepatocyte, brown and white adipose tissue',
    substitutes: {
      summary:
        'Everything on this list is approved and retatrutide is not, so these are not alternatives to a treatment, they are the treatments. Tirzepatide is the closest approved comparator by mechanism and by effect size.',
      conventionalRx: [
        {
          name: 'Tirzepatide (Zepbound)',
          class: 'Dual GIP and GLP-1 receptor agonist, approved',
          howItCompares:
            'Approved, with a published 72-week phase 3 weight result of 20.9% and a completed cardiovascular outcome trial. Retatrutide adds glucagon receptor agonism and has neither.',
          typicalCost: 'About $1,052 per month (US NADAC)',
          prosAndCons:
            'Pros: licensed, supplied by a regulated chain, evidence in the public record. Cons: costly and not universally covered.',
        },
        {
          name: 'Semaglutide (Wegovy)',
          class: 'Selective GLP-1 receptor agonist, approved',
          howItCompares:
            'Smaller weight effect than either multi-agonist, but it is the only one with a completed cardiovascular outcome trial in obesity without diabetes.',
          typicalCost: 'About $1,307 per month (US NADAC)',
          prosAndCons: 'Pros: SELECT outcome data. Cons: less weight loss than tirzepatide head-to-head.',
        },
        {
          name: 'Enrolment in a retatrutide trial',
          class: 'Investigational access route',
          howItCompares:
            'The only route to the actual molecule with known identity, known dose, monitoring and adverse-event reporting.',
          typicalCost: 'No cost to the participant in an industry-sponsored trial',
          prosAndCons:
            'Pros: real product, real oversight. Cons: randomisation means you may receive placebo, and eligibility criteria are narrow.',
        },
      ],
      naturalFoods: [
        {
          name: 'Dietary protein at 1.2 to 1.6 g per kg body weight',
          activeCompound: 'Essential amino acids, particularly leucine',
          biologicalMechanism:
            'Protein has the highest thermic effect of the macronutrients and the strongest effect on satiety hormones including GLP-1 and peptide YY. It is also what preserves lean mass during any energy deficit.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: 'Spread across three or four meals rather than concentrated in one',
          monthlyCost: '$40 to $90 per month depending on source',
        },
        {
          name: 'Viscous soluble fibre',
          activeCompound: 'Beta-glucan, psyllium arabinoxylan',
          biologicalMechanism:
            'Slows gastric emptying and increases fermentation-driven GLP-1 release from distal L-cells, which is the endogenous arm of the same axis.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: '10 to 15 grams daily with adequate water',
          monthlyCost: '$8 to $15 per month',
        },
      ],
      homeRemedies: [
        {
          name: 'Checking whether an unapproved peptide is what it claims to be',
          action:
            'Recognise that a vial bought online has no verified identity, purity, concentration or sterility, and that published analyses of products sold under this name have examined exactly that question.',
          patientImpact:
            'A 2026 analysis of products sold as retatrutide in Australia measured composition and labelling accuracy directly, rather than assuming it.',
          clinicalPrecaution:
            'There is no home test for peptide identity. If a product is not from a regulated supply chain, its contents are unknown.',
        },
        {
          name: 'Telling a clinician what you are taking',
          action:
            'Disclose any unapproved peptide use to whoever is treating you, including before surgery or anaesthesia.',
          patientImpact:
            'Delayed gastric emptying from any drug in this class raises the risk of aspiration under anaesthesia, and a clinician who does not know cannot manage it.',
          clinicalPrecaution:
            'This is not an endorsement of unapproved use; it is harm reduction for someone who has already started.',
        },
      ],
    },
    keyAudits: [
      {
        id: 'reta-1',
        category: 'measured',
        title: 'Phase 2: 24.2% mean weight loss at 48 weeks on the 12 mg dose',
        laymanSummary:
          'In 338 adults, the highest dose produced nearly a quarter of body weight lost in under a year, against 2.1% on placebo. Eighty-three percent of that group lost at least 15%.',
        technicalDetails:
          'Phase 2, double-blind, placebo-controlled, 48 weeks. Least-squares mean weight change at 48 weeks -8.7% (1 mg), -17.1% (combined 4 mg), -22.8% (combined 8 mg), -24.2% (12 mg) versus -2.1% placebo. At 12 mg, 100% lost at least 5%, 93% at least 10% and 83% at least 15%. Adverse events were dose-related and predominantly gastrointestinal.',
        evidenceSource: 'Jastreboff AM et al. N Engl J Med 2023;389:514-526 (NCT04881760)',
        doi: '10.1056/NEJMoa2301972',
        measuredMetric: 'Percentage change in body weight at week 48',
        auditFlag: 'verified',
      },
      {
        id: 'reta-2',
        category: 'measured',
        title: 'TRANSCEND-T2D-1: the first published phase 3 result, in diabetes not obesity',
        laymanSummary:
          'In 537 people with type 2 diabetes on diet and exercise alone, 40 weeks of retatrutide lowered HbA1c by up to 1.94 percentage points and weight by up to 15.3%.',
        technicalDetails:
          'Phase 3, randomised, double-blind, placebo-controlled, 48 sites in the USA, Mexico and India. Treatment-regimen estimand HbA1c change -1.69%, -1.86% and -1.94% for 4, 9 and 12 mg versus -0.81% placebo, all P<0.0001. Weight change -11.5%, -13.9% and -15.3% versus -2.6%. Discontinuation for adverse events 2 to 5%. Two deaths, both in the 4 mg arm and judged unrelated.',
        evidenceSource: 'Lancet 2026, TRANSCEND-T2D-1 (NCT06354660)',
        doi: '10.1016/S0140-6736(26)00967-0',
        measuredMetric: 'Change in HbA1c from baseline to week 40',
        auditFlag: 'verified',
      },
      {
        id: 'reta-3',
        category: 'inferred',
        title: 'The 24% figure everybody quotes is a phase 2 number that phase 3 has not confirmed',
        laymanSummary:
          'The pivotal obesity trial, TRIUMPH-1, enrolled 2,335 people and completed on 30 April 2026. No results are posted on the trial registry and none are published.',
        technicalDetails:
          'NCT05929066 is a master protocol with percentage weight change as its primary outcome, status COMPLETED with a completion date of 2026-04-30, and no results posted as of this audit. The only published phase 3 data are from a 537-person diabetes trial in which weight fell 15.3% at the top dose over 40 weeks, which is not the same population, dose exposure or duration as the phase 2 obesity result.',
        evidenceSource: 'ClinicalTrials.gov record NCT05929066 (TRIUMPH-1), completed 30 April 2026, no results posted',
        inferredClaim: 'That retatrutide produces about 24% weight loss',
        measuredMetric: 'Publication status of the completed pivotal obesity trial',
        auditFlag: 'caution',
      },
      {
        id: 'reta-4',
        category: 'failed',
        title: 'A grey market is selling an unapproved molecule, and the products have been analysed',
        laymanSummary:
          'Retatrutide is not approved anywhere, and is sold widely online. A 2026 study measured what is actually in products sold under that name in Australia. A BMJ news investigation examined a reported death.',
        technicalDetails:
          'Drug and Alcohol Review 2026 published a compositional and labelling-accuracy analysis of products sold as retatrutide in Australia. BMJ published a fact-check on a reported death associated with the unapproved product in July 2026, and separately reported the opening of a compassionate-use route in the United States in August 2026. None of this constitutes efficacy or safety evidence for the molecule; it is evidence about the market around it.',
        evidenceSource: 'Drug Alcohol Rev 2026; BMJ 2026;doi:10.1136/bmj-2026-100245 and doi:10.1136/bmj-2026-100530',
        doi: '10.1111/dar.70231',
        inferredClaim: 'That a product sold as retatrutide contains retatrutide at the stated concentration',
        auditFlag: 'caution',
      },
      {
        id: 'reta-5',
        category: 'inferred',
        title: 'That the glucagon receptor arm is what produces the extra weight loss',
        laymanSummary:
          'Plausible, and untested in humans. No trial has compared retatrutide against a matched dual agonist at equal exposure, which is the only design that could attribute the difference.',
        technicalDetails:
          'The mechanistic case rests on rodent work and on the energy-expenditure biology of glucagon receptor agonism. No head-to-head human trial against tirzepatide exists, and the phase 2 and phase 3 comparators were placebo. Attribution of the effect size to the third receptor is therefore inference from mechanism, not measurement.',
        evidenceSource: 'Jastreboff AM et al. NEJM 2023; TRANSCEND-T2D-1, Lancet 2026',
        doi: '10.1056/NEJMoa2301972',
        inferredClaim: 'That glucagon receptor agonism is responsible for the additional weight reduction',
        auditFlag: 'caution',
      },
      {
        id: 'reta-6',
        category: 'measured',
        title: 'A urinary tract infection signal is under discussion in the literature',
        laymanSummary:
          'Trial data raised a question about urinary tract infections with retatrutide, and the timing of those events is being argued over in print.',
        technicalDetails:
          'A 2026 European Journal of Internal Medicine correspondence examines the urinary tract infection signal reported in the retatrutide programme and whether event timing explains it. This is a live question in the literature, not a settled adverse-effect profile.',
        evidenceSource: 'Eur J Intern Med 2026: Retatrutide and the urinary tract infection signal',
        doi: '10.1016/j.ejim.2026.107099',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Weekly injection with a fatty acid arm',
        laymanDesc:
          'Like the approved drugs in this family, it carries a fatty tail that binds albumin and keeps it circulating for about a week.',
        molecularDetail:
          'An acylated peptide backbone with non-natural residues conferring protease resistance; the full sequence has not been published in a label or peer-reviewed paper, so no structure is stated on this page.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Three receptors instead of two',
        laymanDesc:
          'It engages the two appetite receptors that approved drugs use, plus the glucagon receptor, which normally releases stored energy.',
        molecularDetail:
          'Agonism at GIPR, GLP-1R and GCGR, all Gs-coupled class B GPCRs. The therapeutic hypothesis is that the potency ratio between the three matters more than the potency at any one.',
        iconName: 'Layers',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Appetite suppression through the incretin arms',
        laymanDesc: 'The GIP and GLP-1 arms do what tirzepatide does: less hunger, slower stomach, more insulin when glucose is high.',
        molecularDetail:
          'Central GLP-1R and GIPR signalling in the hypothalamus and hindbrain reducing energy intake, with glucose-dependent potentiation of insulin secretion at the beta cell.',
        iconName: 'Brain',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Energy expenditure through the glucagon arm',
        laymanDesc:
          'The glucagon receptor arm is supposed to raise the rate at which the body burns energy and mobilise fat from the liver, rather than only reducing what goes in.',
        molecularDetail:
          'Hepatic GCGR agonism increases fatty acid oxidation and energy expenditure. It also raises glucose output, which is why the incretin arms have to be potent enough to offset it, and why the dose ratio is the central design problem of this molecule.',
        iconName: 'Flame',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The largest reported weight reduction, in phase 2',
        laymanDesc:
          'Twenty-four percent of body weight over 48 weeks in a 338-person trial, and up to 15.3% over 40 weeks in a 537-person diabetes trial. The pivotal obesity trial has finished and has not reported.',
        molecularDetail:
          'Phase 2 least-squares mean -24.2% at week 48 on 12 mg versus -2.1% on placebo; phase 3 diabetes monotherapy -15.3% at week 40 versus -2.6% placebo, alongside a 1.94 percentage point HbA1c reduction.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Phase 2 obesity trial (NCT04881760)',
        phase: 'Phase 2',
        sampleSize: 338,
        primaryEndpoint: 'Percentage change in body weight from baseline to week 24',
        endpointMet: true,
        statisticalPValue: 'Dose-dependent separation from placebo at every dose level',
        unreportedAdverseSignals: 'Dose-related gastrointestinal events; the trial was not powered for rare harms',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'TRANSCEND-T2D-1 (NCT06354660)',
        phase: 'Phase 3',
        sampleSize: 537,
        primaryEndpoint: 'Change in HbA1c from baseline to week 40',
        endpointMet: true,
        statisticalPValue: 'P < 0.0001 at all three doses',
        unreportedAdverseSignals:
          'Two deaths in the 4 mg group, judged unrelated to study drug; a urinary tract infection signal is under discussion in the literature',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'TRIUMPH-1 (NCT05929066)',
        phase: 'Phase 3',
        sampleSize: 2335,
        primaryEndpoint: 'Percentage change in body weight',
        endpointMet: false,
        statisticalPValue: 'Completed 30 April 2026; no results posted and no publication as of this audit',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '24.2% mean weight loss at 48 weeks on 12 mg versus 2.1% on placebo, in 338 people (phase 2)',
        'HbA1c reduction of up to 1.94 percentage points and weight reduction of up to 15.3% over 40 weeks, in 537 people with type 2 diabetes (phase 3)',
      ],
      unsupportedInferences: [
        'That the phase 2 obesity figure will hold in the 2,335-person pivotal trial, which completed in April 2026 and has not reported',
        'That glucagon receptor agonism is the reason for the larger effect, which no human comparison has isolated',
        'That a product sold online under this name contains this molecule',
      ],
      whatFailedInitially: [
        'Earlier glucagon-containing co-agonists were limited by the glucose-raising effect of glucagon receptor agonism, which is the problem the dose ratio in this molecule is designed to solve',
      ],
      realWorldOutcome: [
        'Not approved in any jurisdiction; a compassionate-use route in the United States was reported in August 2026',
        'A substantial unregulated market exists, and published compositional analysis of products sold under this name has been undertaken because of it',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous once-weekly injection, investigational',
      description:
        'Weekly subcutaneous administration with stepwise dose escalation, at doses from 1 mg to 12 mg across the published trials. No licensed presentation exists, so any device a patient encounters outside a trial is not a regulated product.',
      safetyProfile:
        'Predominantly gastrointestinal and dose-related in the published trials, with discontinuation for adverse events of 2 to 5% in the phase 3 diabetes trial. Long-term safety is not established: the largest completed obesity trial has not reported, and no cardiovascular outcome trial has read out.',
    },
    commonQuestions: [
      {
        q: 'Is it 24% weight loss?',
        a: 'That number comes from a 338-person phase 2 trial at the highest dose over 48 weeks. The pivotal 2,335-person obesity trial completed on 30 April 2026 and has posted no results. Until it does, 24% is a phase 2 finding, not a confirmed effect size.',
        auditNote: 'Measured in phase 2. Unconfirmed in phase 3.',
      },
      {
        q: 'Can I buy it?',
        a: 'Not legally as a medicine, because it is not approved anywhere. Products sold under the name exist and have been analysed for what they actually contain. Whatever is in an unregulated vial, the evidence on this page does not describe it.',
        auditNote: 'The trials measured a defined molecule at a defined dose. Neither is guaranteed outside them.',
      },
      {
        q: 'Is it better than tirzepatide?',
        a: 'Nobody has run that trial. The comparison people make is between a 48-week phase 2 result for one drug and a 72-week phase 3 result for another, in different populations under different protocols. That is not a comparison, it is two separate numbers placed next to each other.',
        auditNote: 'Cross-trial comparison, explicitly flagged as such.',
      },
      {
        q: 'Why does adding glucagon help, when glucagon raises blood sugar?',
        a: 'That is the design tension. Glucagon receptor agonism increases energy expenditure and hepatic fat oxidation, and it also raises glucose output. The incretin arms have to be potent enough to more than offset the second effect. In the phase 3 diabetes trial HbA1c fell substantially, which suggests the balance works at those doses.',
      },
      {
        q: 'What are the long-term risks?',
        a: 'Unknown. There is no cardiovascular outcome trial, no long-term safety extension in the public record, and the largest efficacy trial has not reported. That is not a claim of safety and it is not a claim of harm.',
        auditNote: 'Unknown, stated as unknown.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'Jastreboff AM et al. Triple-Hormone-Receptor Agonist Retatrutide for Obesity, A Phase 2 Trial. NEJM 2023',
        identifier: '10.1056/NEJMoa2301972',
        kind: 'doi',
      },
      {
        label: 'Efficacy and safety of retatrutide in type 2 diabetes (TRANSCEND-T2D-1). Lancet 2026',
        identifier: '10.1016/S0140-6736(26)00967-0',
        kind: 'doi',
      },
      {
        label: 'Composition and Labelling Accuracy of Products Sold as Retatrutide in Australia. Drug Alcohol Rev 2026',
        identifier: '10.1111/dar.70231',
        kind: 'doi',
      },
      {
        label: 'Retatrutide fact check: has a man died after taking the unapproved weight loss jab? BMJ 2026',
        identifier: '10.1136/bmj-2026-100245',
        kind: 'doi',
      },
      {
        label: 'Retatrutide: obesity drug opens to compassionate use in the US. BMJ 2026',
        identifier: '10.1136/bmj-2026-100530',
        kind: 'doi',
      },
      {
        label: 'Retatrutide and the urinary tract infection signal. Eur J Intern Med 2026',
        identifier: '10.1016/j.ejim.2026.107099',
        kind: 'doi',
      },
      { label: 'Phase 2 obesity trial record', identifier: 'NCT04881760', kind: 'nct' },
      { label: 'TRANSCEND-T2D-1 trial record', identifier: 'NCT06354660', kind: 'nct' },
      { label: 'TRIUMPH-1 trial record, completed 30 April 2026, no results posted', identifier: 'NCT05929066', kind: 'nct' },
    ],
  },

  // -------------------------------------------------------------------------------------------
  // Survodutide
  // -------------------------------------------------------------------------------------------
  {
    slug: 'survodutide',
    name: 'Survodutide',
    tradeName: 'BI 456906 (no trade name; not approved)',
    sponsor: 'Boehringer Ingelheim and Zealand Pharma',
    targetGene: 'GCGR / GLP1R',
    targetProtein: 'Glucagon Receptor and Glucagon-Like Peptide-1 Receptor',
    modality: 'Peptide / GLP-1 Agonist',
    approvalStatus: 'Phase 3 Clinical Trial',
    indication:
      'Under investigation for obesity and for metabolic dysfunction-associated steatohepatitis with fibrosis. Not approved for any indication.',
    patientFriendlyIndication: 'Obesity and fatty liver disease, still in trials',
    conditionContext: {
      conditionExplainer:
        'Survodutide pairs GLP-1 receptor agonism, which reduces appetite, with glucagon receptor agonism, which increases energy expenditure and drives fat out of the liver. The liver arm is why the most interesting result in this programme is a biopsy trial rather than a weight trial.',
      whyItMatters:
        'This dossier is the clearest illustration on the site of what happens between phase 2 and phase 3. The dose-finding trial reported 14.9% weight loss. The pivotal trial reported 13.0%, against a placebo arm that lost 5.4%.',
      whoTakesThis:
        'Trial participants with obesity, or with biopsy-confirmed steatohepatitis and fibrosis stage F1 to F3.',
      clinicalGoals:
        'In obesity, percentage weight reduction at 76 weeks. In steatohepatitis, histological improvement without worsening of fibrosis.',
    },
    oneSentenceVerdict:
      'A dual glucagon and GLP-1 receptor agonist whose phase 3 obesity trial produced 13.0% weight loss against 5.4% on placebo at 76 weeks, and whose phase 2 liver-biopsy trial improved steatohepatitis in 62% of participants against 14% on placebo.',
    laymanHowItWorks:
      'One half of the molecule is a familiar appetite signal that makes you eat less. The other half switches on glucagon, the hormone that tells the liver to release and burn stored fuel. Together they are meant to work on both sides of the energy balance. The liver arm is also why this drug has a fatty-liver programme that most of its competitors do not.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    anatomicalSite: 'Hepatocyte, hypothalamus, pancreatic islet, adipose tissue',
    substitutes: {
      summary:
        'Survodutide is not approved, so these are the treatments rather than the alternatives. For obesity, tirzepatide and semaglutide are licensed and have published pivotal data. For steatohepatitis, resmetirom is the approved option and semaglutide has liver data of its own.',
      conventionalRx: [
        {
          name: 'Tirzepatide (Zepbound)',
          class: 'Dual GIP and GLP-1 receptor agonist, approved',
          howItCompares:
            'Approved, 20.9% weight loss at 72 weeks in its pivotal trial, and a completed cardiovascular outcome trial.',
          typicalCost: 'About $1,052 per month (US NADAC)',
          prosAndCons: 'Pros: licensed with published pivotal data. Cons: no liver-biopsy endpoint programme.',
        },
        {
          name: 'Semaglutide (Wegovy)',
          class: 'Selective GLP-1 receptor agonist, approved',
          howItCompares:
            'Approved for weight and for cardiovascular risk reduction, with its own steatohepatitis programme.',
          typicalCost: 'About $1,307 per month (US NADAC)',
          prosAndCons: 'Pros: the largest outcome dataset in the class. Cons: smaller weight effect than the multi-agonists.',
        },
        {
          name: 'Resmetirom',
          class: 'Thyroid hormone receptor beta agonist, approved for steatohepatitis',
          howItCompares:
            'Oral, approved on histological endpoints in non-cirrhotic steatohepatitis with fibrosis, and does not reduce body weight meaningfully.',
          typicalCost: 'US list price is in the region of $47,000 per year',
          prosAndCons:
            'Pros: approved specifically for this indication. Cons: no weight benefit, and its own monitoring requirements.',
        },
      ],
      naturalFoods: [
        {
          name: 'Coffee, caffeinated or decaffeinated',
          activeCompound: 'Chlorogenic acids and diterpenes',
          biologicalMechanism:
            'Regular coffee intake is associated with lower liver fat and lower fibrosis markers in cohort studies, an association robust enough to appear in hepatology guidance, though not established causally.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: '2 to 3 cups daily',
          monthlyCost: '$15 to $30 per month',
        },
        {
          name: 'Mediterranean dietary pattern',
          activeCompound: 'Monounsaturated fat, polyphenols, dietary fibre',
          biologicalMechanism:
            'Reduces hepatic steatosis measured by imaging independently of weight loss, through changes in de novo lipogenesis and insulin sensitivity.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: 'Adopted as an overall eating pattern rather than a supplement',
          monthlyCost: 'Cost-neutral to $60 per month above a standard diet',
        },
      ],
      homeRemedies: [
        {
          name: 'Removing alcohol while liver fat is being treated',
          action: 'Stop alcohol intake during any period of active treatment or investigation for fatty liver disease.',
          patientImpact:
            'Alcohol and metabolic steatohepatitis damage the liver through overlapping routes, and continued intake confounds both the disease and any assessment of treatment.',
          clinicalPrecaution:
            'Anyone with established cirrhosis or a history of dependence needs supervised withdrawal rather than an abrupt stop.',
        },
        {
          name: 'Steady weight loss rather than rapid loss',
          action: 'Aim for gradual, sustained energy deficit rather than very rapid loss.',
          patientImpact:
            'Roughly 7 to 10% sustained weight loss is the threshold at which histological improvement in steatohepatitis becomes common; very rapid loss has historically been associated with worsening inflammation.',
          clinicalPrecaution:
            'Weight-loss targets in liver disease should be set with a clinician who can monitor liver enzymes and nutritional status.',
        },
      ],
    },
    keyAudits: [
      {
        id: 'surv-1',
        category: 'measured',
        title: 'Phase 2 obesity: 14.9% weight loss at 46 weeks on the top dose',
        laymanSummary:
          'In 387 adults, weight fell 14.9% on the 4.8 mg dose against 2.8% on placebo. Only 60% of participants completed the 46 weeks.',
        technicalDetails:
          'Dose-finding phase 2 across 43 centres in 12 countries. Mean weight change from baseline to week 46: -6.2% (0.6 mg), -12.5% (2.4 mg), -13.2% (3.6 mg), -14.9% (4.8 mg), -2.8% (placebo). 233 of 386 treated participants (60.4%) completed. Adverse events in 91% on survodutide versus 75% on placebo, primarily gastrointestinal in 75% versus 42%.',
        evidenceSource: 'le Roux CW et al. Lancet Diabetes Endocrinol 2024;12:162-173 (NCT04667377)',
        doi: '10.1016/S2213-8587(23)00356-X',
        measuredMetric: 'Mean percentage change in body weight at week 46',
        auditFlag: 'verified',
      },
      {
        id: 'surv-2',
        category: 'conclusion_shift',
        title: 'Phase 3 delivered 13.0%, and the placebo arm lost 5.4%',
        laymanSummary:
          'The pivotal trial in 725 people gave 12.2% and 13.0% weight loss for the two doses. Placebo lost 5.4%. The gap over placebo shrank from about 12 points in phase 2 to about 7.6 in phase 3.',
        technicalDetails:
          'SYNCHRONIZE-1, phase 3, double-blind, 76 weeks. Treatment-regimen estimand mean weight change -12.2% (95% CI -13.6 to -10.8) on 3.6 mg, -13.0% (95% CI -14.4 to -11.6) on 6.0 mg, and -5.4% (95% CI -6.9 to -4.0) on placebo. Weight reduction of at least 5% in 72.6%, 71.9% and 46.3%. The estimand incorporates early discontinuation, use of prohibited obesity medications and prolonged escalation, which is a more conservative analysis than the phase 2 reporting.',
        evidenceSource: 'Survodutide Once Weekly for the Treatment of Adults with Obesity. NEJM 2026 (NCT06066515)',
        doi: '10.1056/NEJMoa2600751',
        measuredMetric: 'Percentage change in body weight at week 76 under the treatment-regimen estimand',
        auditFlag: 'verified',
      },
      {
        id: 'surv-3',
        category: 'measured',
        title: 'Phase 2 steatohepatitis: 62% histological improvement against 14% on placebo',
        laymanSummary:
          'In 293 people with biopsy-confirmed fatty liver inflammation, the middle dose improved the disease on a second biopsy in 62% of participants, against 14% on placebo.',
        technicalDetails:
          '48-week phase 2, biopsy-confirmed MASH with fibrosis F1 to F3, four arms. Improvement in MASH without worsening of fibrosis in 47% (2.4 mg), 62% (4.8 mg) and 43% (6.0 mg) versus 14% placebo, P<0.001 for the quadratic dose-response model. Fibrosis improvement by at least one stage in 34%, 36%, 34% and 22%. Nausea 66% versus 23%, vomiting 41% versus 4%.',
        evidenceSource: 'Sanyal AJ et al. N Engl J Med 2024;391:311-319 (NCT04771273)',
        doi: '10.1056/NEJMoa2401755',
        measuredMetric: 'Histological improvement in MASH without worsening of fibrosis at week 48',
        auditFlag: 'verified',
      },
      {
        id: 'surv-4',
        category: 'inferred',
        title: 'That the fibrosis result is as strong as the steatohepatitis result',
        laymanSummary:
          'The inflammation endpoint separated clearly from placebo. Fibrosis improvement was 34 to 36% on treatment against 22% on placebo, a much narrower gap, and fibrosis is the part that predicts outcomes.',
        technicalDetails:
          'Improvement in fibrosis by at least one stage was a secondary endpoint at 34%, 36% and 34% versus 22% on placebo. The trial was powered for the primary histological endpoint, not for fibrosis, and phase 2 histology in liver disease has a documented history of not reproducing at phase 3 scale.',
        evidenceSource: 'Sanyal AJ et al. N Engl J Med 2024;391:311-319',
        doi: '10.1056/NEJMoa2401755',
        inferredClaim: 'That survodutide reverses liver fibrosis',
        measuredMetric: 'At least one-stage fibrosis improvement, 34 to 36% versus 22%',
        auditFlag: 'caution',
      },
      {
        id: 'surv-5',
        category: 'failed',
        title: 'Tolerability is the constraint, and it shows up in the completion rates',
        laymanSummary:
          'Four in ten phase 2 participants did not finish. In phase 3, gastrointestinal side effects affected 81% to 90% of the treated groups against 48% on placebo.',
        technicalDetails:
          'Phase 2: 60.4% completed the 46-week treatment period, with gastrointestinal adverse events in 75% of survodutide recipients. Phase 3 SYNCHRONIZE-1: gastrointestinal symptoms in 80.9% of the 3.6 mg group and 89.7% of the 6.0 mg group versus 47.9% on placebo. No deaths were reported in phase 3.',
        evidenceSource: 'le Roux CW et al. Lancet Diabetes Endocrinol 2024; SYNCHRONIZE-1, NEJM 2026',
        doi: '10.1056/NEJMoa2600751',
        measuredMetric: 'Trial completion and gastrointestinal adverse event rates',
        auditFlag: 'verified',
      },
      {
        id: 'surv-6',
        category: 'inferred',
        title: 'That the cardiovascular safety trial has answered the outcome question',
        laymanSummary:
          'SYNCHRONIZE-CVOT enrolled 5,531 people and is listed as completed. It is a cardiovascular safety trial, which is a different question from whether the drug prevents heart attacks.',
        technicalDetails:
          'NCT06077864 is described as a study to test the effect of survodutide on cardiovascular safety, phase 3, enrolment 5,531, status COMPLETED. A safety trial is designed to exclude harm above a margin, not to demonstrate benefit; treating a met safety endpoint as evidence of cardiovascular protection is a category error.',
        evidenceSource: 'ClinicalTrials.gov record NCT06077864 (SYNCHRONIZE-CVOT)',
        inferredClaim: 'That survodutide reduces cardiovascular events',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Weekly subcutaneous injection with a long dose escalation',
        laymanDesc:
          'One injection a week, built up gradually over months because the gastrointestinal effects are severe if the dose rises quickly.',
        molecularDetail:
          'An acylated dual agonist peptide with a half-life supporting weekly dosing. The phase 3 protocol allowed a prolonged escalation period, which the primary estimand explicitly accounts for.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Two receptors with opposite effects on glucose',
        laymanDesc:
          'GLP-1 lowers blood sugar. Glucagon raises it. The molecule is tuned so the first outweighs the second.',
        molecularDetail:
          'Balanced agonism at GLP-1R and GCGR, both Gs-coupled. The potency ratio is the central design parameter, because unopposed glucagon receptor agonism raises hepatic glucose output.',
        iconName: 'Layers',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'GLP-1 arm: appetite and insulin',
        laymanDesc: 'The appetite side does what every drug in this class does, reducing intake and slowing the stomach.',
        molecularDetail:
          'Central GLP-1R signalling in the hypothalamus and hindbrain reduces energy intake; peripheral signalling potentiates glucose-stimulated insulin secretion.',
        iconName: 'Brain',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Glucagon arm: the liver empties its fat',
        laymanDesc:
          'The glucagon side tells the liver to burn and export stored fat, which is why the liver-biopsy results are the most interesting part of this programme.',
        molecularDetail:
          'Hepatic GCGR agonism raises fatty acid oxidation, reduces de novo lipogenesis and increases energy expenditure. Preclinical work with hepatocyte-specific GCGR deletion indicates the hepatic receptor is required for the superior metabolic effect.',
        iconName: 'Flame',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Weight down 13%, steatohepatitis improved in 62%',
        laymanDesc:
          'In the pivotal obesity trial, 13.0% weight loss against 5.4% on placebo. In the liver trial, disease improvement on a second biopsy in 62% against 14%.',
        molecularDetail:
          'SYNCHRONIZE-1 treatment-regimen estimand -13.0% at week 76; phase 2 MASH histological improvement without worsening fibrosis in 62% at the 4.8 mg dose versus 14% on placebo.',
        iconName: 'Droplet',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Phase 2 obesity dose-finding (NCT04667377)',
        phase: 'Phase 2',
        sampleSize: 387,
        primaryEndpoint: 'Percentage change in body weight at week 46',
        endpointMet: true,
        statisticalPValue: 'Dose-dependent separation from placebo across all doses',
        unreportedAdverseSignals:
          'Only 60.4% of treated participants completed the 46-week treatment period, which limits what the mean change describes',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'SYNCHRONIZE-1 (NCT06066515)',
        phase: 'Phase 3',
        sampleSize: 725,
        primaryEndpoint: 'Percentage change in body weight and at least 5% reduction at week 76',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 for all comparisons with placebo',
        unreportedAdverseSignals:
          'Gastrointestinal symptoms in 80.9% and 89.7% of the treated groups versus 47.9% on placebo',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Phase 2 MASH biopsy trial (NCT04771273)',
        phase: 'Phase 2',
        sampleSize: 293,
        primaryEndpoint: 'Histological improvement in MASH with no worsening of fibrosis at week 48',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 for the quadratic dose-response model',
        unreportedAdverseSignals: 'Vomiting in 41% versus 4% on placebo',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'SYNCHRONIZE-CVOT (NCT06077864)',
        phase: 'Phase 3',
        sampleSize: 5531,
        primaryEndpoint: 'Cardiovascular safety',
        endpointMet: true,
        statisticalPValue: 'Listed as completed; results not yet in the peer-reviewed record at this audit',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '13.0% weight loss at 76 weeks versus 5.4% on placebo under a conservative estimand (SYNCHRONIZE-1, n=725)',
        '62% histological improvement in MASH without worsening fibrosis versus 14% on placebo (n=293)',
        'Gastrointestinal symptoms in 81% to 90% of treated participants in phase 3',
      ],
      unsupportedInferences: [
        'That the 14.9% phase 2 figure is the effect size of this drug; the pivotal trial reported 13.0% against a 5.4% placebo response',
        'That it reverses fibrosis; the fibrosis endpoint was secondary and the placebo arm reached 22%',
        'That a completed cardiovascular safety trial demonstrates cardiovascular benefit',
      ],
      whatFailedInitially: [
        'Glucagon-containing co-agonists as a class were held back by glucagon-driven hyperglycaemia, which the potency ratio in this molecule is engineered around',
        'Tolerability at the highest phase 2 dose, where four in ten participants left before the end',
      ],
      realWorldOutcome: [
        'Not approved in any jurisdiction as of this audit',
        'The phase 3 obesity result is published and lower than the phase 2 result that shaped expectations',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous once-weekly injection, investigational',
      description:
        'Weekly subcutaneous dosing with a long stepwise escalation, at maintenance doses of 3.6 mg and 6.0 mg in the phase 3 obesity trial. No licensed presentation exists.',
      safetyProfile:
        'Gastrointestinal events dominate and are more frequent than with selective GLP-1 agonists: nausea 66% and vomiting 41% in the liver trial, and gastrointestinal symptoms in up to 89.7% of the phase 3 obesity groups. No deaths were reported in SYNCHRONIZE-1. Long-term safety is not established.',
    },
    commonQuestions: [
      {
        q: 'Why did the phase 3 number come out lower than phase 2?',
        a: 'Two reasons, and both are visible in the papers. The phase 3 primary analysis used a treatment-regimen estimand that counts people who stopped early or used other obesity medication, which is more conservative than the phase 2 reporting. And the phase 3 placebo arm lost 5.4%, against 2.8% in phase 2, which halves the apparent gap on its own.',
        auditNote: 'Both numbers are measured. The difference is design, not deception.',
      },
      {
        q: 'Is it better for the liver than the other drugs?',
        a: 'It has a biopsy trial that most competitors do not, and the result on inflammation was strong. Fibrosis, the part that predicts liver outcomes, improved in 34 to 36% against 22% on placebo, which is a much narrower margin and was a secondary endpoint.',
        auditNote: 'Steatohepatitis improvement is measured and primary. Fibrosis benefit is secondary and modest.',
      },
      {
        q: 'How bad are the side effects?',
        a: 'Worse than the selective GLP-1 agonists on the published numbers. Vomiting affected 41% in the liver trial against 4% on placebo, and in phase 3 gastrointestinal symptoms reached 89.7% at the higher dose. Four in ten phase 2 participants did not complete.',
      },
      {
        q: 'Has it been shown to prevent heart attacks?',
        a: 'No. A 5,531-person cardiovascular safety trial has completed, and a safety trial asks whether harm can be excluded, not whether benefit exists. Nothing in the public record supports a cardiovascular prevention claim.',
        auditNote: 'Unknown, and structurally different from what the trial was designed to measure.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'le Roux CW et al. Glucagon and GLP-1 receptor dual agonist survodutide for obesity, phase 2. Lancet Diabetes Endocrinol 2024',
        identifier: '10.1016/S2213-8587(23)00356-X',
        kind: 'doi',
      },
      {
        label: 'Survodutide Once Weekly for the Treatment of Adults with Obesity (SYNCHRONIZE-1). NEJM 2026',
        identifier: '10.1056/NEJMoa2600751',
        kind: 'doi',
      },
      {
        label: 'Sanyal AJ et al. A Phase 2 Randomized Trial of Survodutide in MASH and Fibrosis. NEJM 2024',
        identifier: '10.1056/NEJMoa2401755',
        kind: 'doi',
      },
      { label: 'Phase 2 obesity dose-finding trial record', identifier: 'NCT04667377', kind: 'nct' },
      { label: 'SYNCHRONIZE-1 trial record', identifier: 'NCT06066515', kind: 'nct' },
      { label: 'Phase 2 MASH biopsy trial record', identifier: 'NCT04771273', kind: 'nct' },
      { label: 'SYNCHRONIZE-CVOT trial record', identifier: 'NCT06077864', kind: 'nct' },
    ],
  },
]
